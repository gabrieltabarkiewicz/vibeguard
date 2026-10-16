// Regras de auditoria estática: descuidos comuns de código e configuração que
// abrem brecha de segurança. São heurísticas — marcam trechos para revisão, não
// provam uma falha. A linguagem do relatório deixa isso claro.

import type { FindingCategory, Severity } from "@/features/scan";

export interface AuditRule {
  id: string;
  category: FindingCategory;
  title: string;
  severity: Severity;
  /** Aplicado por linha; o primeiro casamento marca a linha. */
  pattern: RegExp;
  explanation: string;
  fix: string;
}

export const AUDIT_RULES: AuditRule[] = [
  {
    id: "react-dangerous-html",
    category: "Código",
    title: "Inserção de HTML sem tratamento (dangerouslySetInnerHTML)",
    severity: "alta",
    pattern: /dangerouslySetInnerHTML/,
    explanation:
      "Jogar HTML direto na tela permite que um texto de usuário vire código no " +
      "navegador de quem visita (ataque XSS), roubando sessão ou dados.",
    fix:
      "Evite dangerouslySetInnerHTML. Se precisar renderizar HTML, limpe o " +
      "conteúdo antes com uma biblioteca de sanitização (ex.: DOMPurify).",
  },
  {
    id: "dom-innerhtml",
    category: "Código",
    title: "Escrita direta em innerHTML",
    severity: "alta",
    pattern: /\.innerHTML\s*=/,
    explanation:
      "Atribuir a innerHTML com dados de usuário executa código no navegador " +
      "(XSS). É uma das brechas mais exploradas.",
    fix: "Use textContent para texto, ou sanitize o HTML antes de inserir.",
  },
  {
    id: "eval-usage",
    category: "Código",
    title: "Uso de eval() ou new Function()",
    severity: "alta",
    pattern: /\b(?:eval|new\s+Function)\s*\(/,
    explanation:
      "eval executa qualquer texto como código. Se esse texto vier de fora, um " +
      "invasor roda o que quiser no seu sistema.",
    fix: "Remova o eval. Quase sempre dá para resolver com JSON.parse ou um mapa de funções.",
  },
  {
    id: "child-process-exec",
    category: "Código",
    title: "Execução de comando do sistema (child_process exec)",
    severity: "alta",
    pattern: /\bexec(?:Sync)?\s*\(\s*`?[^)]*\$\{/,
    explanation:
      "Montar um comando de sistema com um valor de fora permite injeção de " +
      "comando: o invasor acrescenta o próprio comando e ele é executado.",
    fix:
      "Use execFile/spawn passando os argumentos em uma lista separada, nunca " +
      "concatenando entrada do usuário dentro do comando.",
  },
  {
    id: "sql-string-concat",
    category: "Código",
    title: "Consulta SQL montada com interpolação",
    severity: "alta",
    pattern: /(?:SELECT|INSERT|UPDATE|DELETE)\b[^;'"`]*(?:\$\{|"\s*\+|'\s*\+)/i,
    explanation:
      "Montar SQL juntando texto com dados do usuário permite SQL injection: o " +
      "invasor altera a consulta e lê ou apaga o banco.",
    fix:
      "Use consultas parametrizadas (placeholders) ou um ORM. Nunca concatene " +
      "entrada do usuário dentro do texto da query.",
  },
  {
    id: "tls-verification-off",
    category: "Configuração",
    title: "Verificação de certificado TLS desligada",
    severity: "alta",
    pattern: /rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0/,
    explanation:
      "Desligar a checagem do certificado deixa a conexão aberta a " +
      "interceptação (man-in-the-middle): alguém no meio lê e altera os dados.",
    fix: "Remova essa opção. Se há um certificado próprio, instale-o em vez de desligar a verificação.",
  },
  {
    id: "cors-wildcard",
    category: "Configuração",
    title: "CORS liberado para qualquer origem",
    severity: "media",
    pattern: /Access-Control-Allow-Origin["'\s,:]+\*|origin\s*:\s*(?:true|["']\*["'])/,
    explanation:
      "Liberar o acesso para qualquer site (origin \"*\") deixa páginas de " +
      "terceiros chamarem sua API em nome do usuário logado.",
    fix: "Troque \"*\" pela lista de domínios que você confia (allowlist).",
  },
  {
    id: "public-secret-var",
    category: "Configuração",
    title: "Segredo em variável pública (NEXT_PUBLIC_/VITE_)",
    severity: "critica",
    pattern: /\b(?:NEXT_PUBLIC_|VITE_|REACT_APP_|EXPO_PUBLIC_)[A-Z0-9_]*(?:SECRET|KEY|TOKEN|PASSWORD|PASSWD|PWD)\b/,
    explanation:
      "Tudo que começa com NEXT_PUBLIC_ (ou VITE_/REACT_APP_) vai para o " +
      "navegador e fica visível para qualquer visitante. Segredo aí é segredo vazado.",
    fix:
      "Tire o prefixo público e leia o valor só no servidor (process.env). Gere " +
      "uma nova chave, porque a atual foi exposta.",
  },
];
