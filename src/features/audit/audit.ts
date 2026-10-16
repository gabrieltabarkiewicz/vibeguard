// Motor de auditoria: aplica as regras linha a linha e devolve achados com o
// trecho da linha como evidência. Puro e síncrono.

import type { FileInput, Finding } from "@/features/scan";
import { AUDIT_RULES, type AuditRule } from "./rules";

const MAX_EVIDENCE = 160;

function evidenceFrom(line: string): string {
  const trimmed = line.trim();
  return trimmed.length > MAX_EVIDENCE ? `${trimmed.slice(0, MAX_EVIDENCE)}…` : trimmed;
}

/** Audita o conteúdo de um arquivo. Uma regra marca cada linha no máximo uma vez. */
export function auditContent(path: string, content: string, rules: AuditRule[] = AUDIT_RULES): Finding[] {
  const findings: Finding[] = [];
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    for (const rule of rules) {
      const match = rule.pattern.exec(line);
      if (!match) continue;
      findings.push({
        ruleId: rule.id,
        category: rule.category,
        title: rule.title,
        severity: rule.severity,
        file: path,
        line: i + 1,
        column: match.index + 1,
        evidence: evidenceFrom(line),
        explanation: rule.explanation,
        fix: rule.fix,
      });
    }
  }

  return findings;
}

/** Audita vários arquivos, em ordem de arquivo. */
export function auditFiles(files: FileInput[], rules: AuditRule[] = AUDIT_RULES): Finding[] {
  return files.flatMap((file) => auditContent(file.path, file.content, rules));
}
