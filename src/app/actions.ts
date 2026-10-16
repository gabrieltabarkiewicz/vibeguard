"use server";

import { z } from "zod";
import { collectFiles } from "@/features/scan/collect";
import { scanFiles } from "@/features/scan";
import { summarize, type ScanReport } from "@/features/scan/report";
import { logger } from "@/lib/logger";

const pathSchema = z.string().trim().min(1, "Informe o caminho da pasta do projeto.");

export type ScanActionResult =
  | { ok: true; report: ScanReport; filesScanned: number; truncated: boolean }
  | { ok: false; error: string };

/**
 * Varre a pasta local informada e devolve o relatório. Registra apenas
 * contagens — nunca o caminho, o conteúdo dos arquivos ou os segredos.
 */
export async function scanPath(rawPath: string): Promise<ScanActionResult> {
  const parsed = pathSchema.safeParse(rawPath);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Caminho inválido." };
  }

  try {
    const { files, truncated } = await collectFiles(parsed.data);
    const findings = scanFiles(files);
    logger.info(
      { filesScanned: files.length, findings: findings.length, truncated },
      "Varredura de segredos concluída",
    );
    return { ok: true, report: summarize(findings), filesScanned: files.length, truncated };
  } catch {
    // Não propagamos o erro original: ele pode conter o caminho.
    return { ok: false, error: "Não consegui ler essa pasta. Confira se o caminho existe e é acessível." };
  }
}
