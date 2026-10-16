// Checagens puras: transformam uma Observação em achados. Sem rede, sem estado.

import type { Finding } from "@/features/scan";
import {
  DISCLOSURE_HEADERS,
  HEADER_SPECS,
  PROTECTED_PATHS,
  SENSITIVE_PATHS,
} from "./targets";
import type { Observation, PageObservation } from "./types";

function finding(
  partial: Pick<Finding, "ruleId" | "title" | "severity" | "file" | "evidence" | "explanation" | "fix">,
): Finding {
  return { category: "Aplicativo", line: 0, column: 0, ...partial };
}

function headerFindings(page: PageObservation): Finding[] {
  const out: Finding[] = [];
  for (const spec of HEADER_SPECS) {
    if (spec.httpsOnly && !page.https) continue;
    if (page.headers[spec.header]) continue;
    out.push(finding({
      ruleId: spec.id,
      title: spec.title,
      severity: spec.severity,
      file: page.baseUrl,
      evidence: `cabeçalho ${spec.header} ausente`,
      explanation: spec.explanation,
      fix: spec.fix,
    }));
  }
  for (const header of DISCLOSURE_HEADERS) {
    const value = page.headers[header];
    if (value) {
      out.push(finding({
        ruleId: `disclosure-${header}`,
        title: `Cabeçalho ${header} revela informação do servidor`,
        severity: "baixa",
        file: page.baseUrl,
        evidence: `${header}: ${value.slice(0, 80)}`,
        explanation: "Revelar o servidor/tecnologia e a versão ajuda um invasor a procurar falhas conhecidas.",
        fix: `Remova ou neutralize o cabeçalho ${header}.`,
      }));
    }
  }
  return out;
}

function corsFindings(page: PageObservation): Finding[] {
  const value = page.corsAllowOrigin;
  if (!value) return [];
  if (value === page.testOrigin) {
    return [finding({
      ruleId: "cors-reflects-origin",
      title: "CORS reflete qualquer origem",
      severity: "alta",
      file: page.baseUrl,
      evidence: `Access-Control-Allow-Origin: ${value}`,
      explanation: "O app devolveu como permitida uma origem de teste inventada: ele aceita qualquer site, deixando páginas de terceiros chamarem sua API em nome do usuário logado.",
      fix: "Permita só uma lista fixa de origens confiáveis; nunca reflita a Origin recebida.",
    })];
  }
  if (value === "*") {
    const credentials = page.corsAllowCredentials;
    return [finding({
      ruleId: "cors-wildcard",
      title: "CORS liberado para qualquer origem (*)",
      severity: credentials ? "alta" : "media",
      file: page.baseUrl,
      evidence: `Access-Control-Allow-Origin: *${credentials ? " + credentials" : ""}`,
      explanation: "Liberar para \"*\" deixa qualquer site acessar as respostas da sua API.",
      fix: "Troque \"*\" pela lista de domínios que você confia.",
    })];
  }
  return [];
}

function injectionFindings(page: PageObservation): Finding[] {
  if (!page.reflectedInjection) return [];
  return [finding({
    ruleId: "reflected-injection",
    title: "Entrada refletida sem escapar (risco de XSS)",
    severity: "alta",
    file: page.baseUrl,
    evidence: "o marcador de teste voltou como HTML, sem escapar",
    explanation: "Mandei um texto de teste pela URL e o app o devolveu como HTML, sem tratar. Isso permite injetar código que roda no navegador de outros usuários (XSS).",
    fix: "Escape toda entrada antes de colocá-la na página. Em React, evite dangerouslySetInnerHTML; no servidor, use template que escapa por padrão.",
  })];
}

function errorLeakFindings(page: PageObservation): Finding[] {
  if (!page.errorStackLeak) return [];
  return [finding({
    ruleId: "error-stack-leak",
    title: "Página de erro mostra detalhes internos (stack trace)",
    severity: "media",
    file: page.baseUrl,
    evidence: "uma requisição de erro revelou stack trace",
    explanation: "Mostrar o stack trace ao usuário revela caminhos de arquivo, tecnologias e a estrutura interna, facilitando o ataque.",
    fix: "Em produção, mostre uma mensagem de erro genérica e registre os detalhes só no servidor.",
  })];
}

function exposedFindings(observations: Observation["sensitive"], baseUrl: string): Finding[] {
  const out: Finding[] = [];
  for (const obs of observations) {
    if (!obs.matched) continue;
    const spec = SENSITIVE_PATHS.find((p) => p.path === obs.path);
    if (!spec) continue;
    out.push(finding({
      ruleId: `exposed-${spec.path}`,
      title: spec.title,
      severity: spec.severity,
      file: baseUrl + spec.path,
      evidence: `GET ${spec.path} → 200`,
      explanation: spec.explanation,
      fix: spec.fix,
    }));
  }
  return out;
}

function protectedFindings(observations: Observation["protectedPaths"], baseUrl: string): Finding[] {
  const out: Finding[] = [];
  for (const obs of observations) {
    if (!obs.matched) continue;
    const spec = PROTECTED_PATHS.find((p) => p.path === obs.path);
    if (!spec) continue;
    out.push(finding({
      ruleId: `unprotected-${spec.path}`,
      title: spec.title,
      severity: spec.severity,
      file: baseUrl + spec.path,
      evidence: `GET ${spec.path} → ${obs.status}, respondeu sem pedir login`,
      explanation: spec.explanation,
      fix: spec.fix,
    }));
  }
  return out;
}

/** Monta todos os achados a partir da observação. */
export function buildFindings(observation: Observation): Finding[] {
  const { page } = observation;
  return [
    ...injectionFindings(page),
    ...corsFindings(page),
    ...exposedFindings(observation.sensitive, page.baseUrl),
    ...protectedFindings(observation.protectedPaths, page.baseUrl),
    ...headerFindings(page),
    ...errorLeakFindings(page),
  ];
}
