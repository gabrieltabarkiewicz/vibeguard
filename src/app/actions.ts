"use server";

import { z } from "zod";
import { collectFiles } from "@/features/scan/collect";
import { scanFiles } from "@/features/scan";
import { auditFiles } from "@/features/audit";
import { probeApp as runProbe } from "@/features/probe";
import { summarize, type ScanReport } from "@/features/scan/report";
import { logger } from "@/lib/logger";

const pathSchema = z.string().trim().min(1, "Informe o caminho da pasta do projeto.");
const urlSchema = z.string().trim().min(1, "Informe o endereço do app (ex.: localhost:3000).");

export type ScanActionResult =
  | { ok: true; report: ScanReport; filesScanned: number; truncated: boolean }
  | { ok: false; error: string };

export type ProbeActionResult =
  | { ok: true; report: ScanReport; target: string }
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
    const findings = [...scanFiles(files), ...auditFiles(files)];
    logger.info(
      { filesScanned: files.length, findings: findings.length, truncated },
      "Análise concluída",
    );
    return { ok: true, report: summarize(findings), filesScanned: files.length, truncated };
  } catch {
    // Não propagamos o erro original: ele pode conter o caminho.
    return { ok: false, error: "Não consegui ler essa pasta. Confira se o caminho existe e é acessível." };
  }
}

/**
 * Testa um app rodando em um endereço LOCAL com checagens não destrutivas.
 * Registra apenas a contagem de achados — nunca o endereço nem o conteúdo.
 */
export async function probeApp(rawUrl: string): Promise<ProbeActionResult> {
  const parsed = urlSchema.safeParse(rawUrl);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Endereço inválido." };
  }

  const result = await runProbe(parsed.data);
  if (!result.ok) return { ok: false, error: result.error };

  logger.info({ findings: result.findings.length }, "Teste do app concluído");
  return { ok: true, report: summarize(result.findings), target: result.target };
}
