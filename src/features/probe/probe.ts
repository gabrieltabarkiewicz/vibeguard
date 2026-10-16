// Orquestra o teste do app rodando: valida o alvo (local), observa e aplica as
// checagens. Forte na cobertura, mas não destrutivo.

import "server-only";
import type { Finding } from "@/features/scan";
import { buildFindings } from "./checks";
import { observe, parseTarget, reachedApp } from "./http";

export type ProbeResult =
  | { ok: true; findings: Finding[]; target: string }
  | { ok: false; error: string };

export async function probeApp(rawUrl: string): Promise<ProbeResult> {
  const parsed = parseTarget(rawUrl);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const observation = await observe(parsed.url);
  if (!reachedApp(observation)) {
    return {
      ok: false,
      error: "Não consegui falar com esse endereço. O aplicativo está ligado nele?",
    };
  }

  return { ok: true, findings: buildFindings(observation), target: observation.page.baseUrl };
}
