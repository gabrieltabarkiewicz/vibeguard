// Motor de varredura: aplica as regras linha a linha e devolve achados.
// Puro e síncrono; não lê arquivos do disco nem acessa rede.

import { maskSecret } from "./mask";
import { RULES } from "./rules";
import type { FileInput, Finding, SecretRule } from "./types";

// Prefixos de variável que expõem o valor ao navegador. Um segredo numa linha
// assim é o erro clássico de quem programa com IA, então a severidade sobe.
const CLIENT_EXPOSED = /\b(?:NEXT_PUBLIC_|VITE_|REACT_APP_|EXPO_PUBLIC_)/;

function withGlobalFlag(pattern: RegExp): RegExp {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return new RegExp(pattern.source, flags);
}

/** Analisa o conteúdo de um arquivo e devolve os segredos encontrados. */
export function scanContent(
  path: string,
  content: string,
  rules: SecretRule[] = RULES,
): Finding[] {
  const findings: Finding[] = [];
  const lines = content.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const exposed = CLIENT_EXPOSED.test(line);

    for (const rule of rules) {
      const re = withGlobalFlag(rule.pattern);
      for (const match of line.matchAll(re)) {
        const value = match[0];
        if (rule.validate && !rule.validate(value)) continue;

        const severity = exposed && rule.severity !== "critica" ? "critica" : rule.severity;
        const explanation = exposed
          ? `${rule.explanation} Aqui ela está numa variável que o navegador recebe ` +
            `(prefixo público), então qualquer visitante consegue lê-la.`
          : rule.explanation;

        findings.push({
          ruleId: rule.id,
          category: "Segredo",
          title: rule.title,
          severity,
          file: path,
          line: i + 1,
          column: (match.index ?? 0) + 1,
          evidence: maskSecret(value),
          explanation,
          fix: rule.fix,
        });
      }
    }
  }

  return findings;
}

/** Analisa vários arquivos e devolve todos os achados, em ordem de arquivo. */
export function scanFiles(files: FileInput[], rules: SecretRule[] = RULES): Finding[] {
  return files.flatMap((file) => scanContent(file.path, file.content, rules));
}
