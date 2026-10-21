// Resumo do relatório: conta achados por severidade e os ordena do mais grave
// ao menos grave. Puro; seguro para importar no cliente (só tipos e dados).

import type { Finding, Severity } from "./types";

export const SEVERITY_ORDER: readonly Severity[] = ["critica", "alta", "media", "baixa"];
// Categorias: "Segredo" | "Código" | "Configuração" | "Autorização" | "Aplicativo".

export const SEVERITY_LABEL: Record<Severity, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

export interface ScanReport {
  total: number;
  countsBySeverity: Record<Severity, number>;
  /** Achados ordenados da maior para a menor severidade. */
  findings: Finding[];
}

export function summarize(findings: Finding[]): ScanReport {
  const countsBySeverity: Record<Severity, number> = { critica: 0, alta: 0, media: 0, baixa: 0 };
  for (const finding of findings) {
    countsBySeverity[finding.severity] += 1;
  }
  const ordered = [...findings].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity),
  );
  return { total: findings.length, countsBySeverity, findings: ordered };
}
