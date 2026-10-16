// Dados das checagens do app rodando. Nada aqui faz rede; é só a tabela do que
// procurar e como explicar. Tudo não destrutivo.

import type { Severity } from "@/features/scan";

/** Origem falsa usada para testar se o app reflete qualquer site no CORS. */
export const TEST_ORIGIN = "https://vibeguard.invalid";

/** Parâmetro e marcador do teste de reflexão (injeção de HTML). Inofensivo:
 *  é só um texto distinto; conferimos se o app o devolve sem escapar. */
export const XSS_PARAM = "vgcheck";
export const XSS_MARKER = 'vg9f2k"><vgmark>';
/** Presença deste pedaço, sem escapar, prova que o HTML foi refletido cru. */
export const XSS_SIGNATURE = "<vgmark>";

/** Caminho inexistente usado para provocar uma página de erro. */
export const ERROR_PROBE_PATH = "/vibeguard-erro-proposital-%27%22%3C";
/** Assinaturas de vazamento de stack trace numa página de erro. */
export const STACK_TRACE_SIGNATURES: RegExp[] = [
  /\bat\s.+:\d+:\d+\)/, // frame JS: at fn (arquivo:linha:coluna)
  /Traceback \(most recent call last\)/,
  /\bat\s[\w.$]+\s*\([^)]*node_modules/,
];

/** Cabeçalho de segurança esperado na página principal. */
export interface HeaderSpec {
  id: string;
  header: string; // minúsculo
  title: string;
  severity: Severity;
  explanation: string;
  fix: string;
  /** Só cobra em HTTPS (ex.: HSTS). */
  httpsOnly?: boolean;
}

export const HEADER_SPECS: HeaderSpec[] = [
  {
    id: "missing-csp",
    header: "content-security-policy",
    title: "Sem Content-Security-Policy",
    severity: "media",
    explanation:
      "A Content-Security-Policy é uma trava que limita o que pode rodar na " +
      "página. Sem ela, um código injetado (XSS) tem rédea solta.",
    fix: "Adicione um cabeçalho Content-Security-Policy adequado às origens que o app usa.",
  },
  {
    id: "missing-xfo",
    header: "x-frame-options",
    title: "Sem proteção contra clickjacking (X-Frame-Options)",
    severity: "media",
    explanation:
      "Sem X-Frame-Options (ou frame-ancestors no CSP), outro site pode embutir " +
      "o seu numa moldura invisível e enganar o usuário a clicar (clickjacking).",
    fix: "Envie X-Frame-Options: DENY, ou defina frame-ancestors no Content-Security-Policy.",
  },
  {
    id: "missing-nosniff",
    header: "x-content-type-options",
    title: "Sem X-Content-Type-Options: nosniff",
    severity: "baixa",
    explanation:
      "Sem nosniff, o navegador pode 'adivinhar' o tipo do arquivo e executar " +
      "como script algo que não era para ser.",
    fix: "Envie o cabeçalho X-Content-Type-Options: nosniff.",
  },
  {
    id: "missing-hsts",
    header: "strict-transport-security",
    title: "Sem HSTS (Strict-Transport-Security)",
    severity: "media",
    httpsOnly: true,
    explanation:
      "HSTS obriga o navegador a sempre usar HTTPS, fechando a porta para " +
      "ataques que rebaixam a conexão para HTTP.",
    fix: "Em produção com HTTPS, envie Strict-Transport-Security com um max-age adequado.",
  },
];

/** Cabeçalhos que, quando presentes, vazam informação do servidor. */
export const DISCLOSURE_HEADERS = ["x-powered-by", "server"] as const;

/** Arquivo sensível que não deveria estar acessível pela web. */
export interface SensitivePath {
  path: string;
  title: string;
  severity: Severity;
  explanation: string;
  fix: string;
  /** Assinatura no corpo que confirma ser o arquivo real (evita falso 200 de SPA). */
  signature: RegExp;
}

export const SENSITIVE_PATHS: SensitivePath[] = [
  {
    path: "/.env",
    title: "Arquivo .env acessível pela web",
    severity: "critica",
    explanation: "O arquivo .env guarda segredos. Servido pela web, qualquer um baixa suas chaves.",
    fix: "Nunca sirva o .env. Guarde-o fora da pasta pública e confira a configuração do servidor de arquivos.",
    signature: /^\s*[A-Z][A-Z0-9_]*\s*=/m,
  },
  {
    path: "/.env.local",
    title: "Arquivo .env.local acessível pela web",
    severity: "critica",
    explanation: "O .env.local costuma ter os segredos reais de desenvolvimento. Exposto, eles vazam.",
    fix: "Não sirva arquivos .env. Ajuste o servidor para bloquear arquivos ocultos.",
    signature: /^\s*[A-Z][A-Z0-9_]*\s*=/m,
  },
  {
    path: "/.git/config",
    title: "Pasta .git acessível pela web",
    severity: "alta",
    explanation:
      "Com a pasta .git exposta, dá para baixar todo o histórico do código — " +
      "inclusive segredos que já foram removidos.",
    fix: "Bloqueie o acesso à pasta .git no servidor; ela nunca deve ir para produção.",
    signature: /\[core\]/,
  },
  {
    path: "/package.json",
    title: "package.json acessível pela web",
    severity: "media",
    explanation:
      "O package.json revela suas dependências e versões, ajudando um invasor a " +
      "procurar falhas conhecidas.",
    fix: "Sirva apenas a pasta pública (ex.: build), nunca a raiz do projeto.",
    signature: /"(?:dependencies|devDependencies|name)"\s*:/,
  },
];

/** Endereço que normalmente deveria exigir login. Marcamos quando responde com
 *  conteúdo de verdade (ex.: JSON) sem pedir autenticação. */
export interface ProtectedPath {
  path: string;
  title: string;
  severity: Severity;
  explanation: string;
  fix: string;
}

export const PROTECTED_PATHS: ProtectedPath[] = [
  {
    path: "/api/admin",
    title: "Rota de administração responde sem login",
    severity: "alta",
    explanation:
      "Uma rota de administração que responde com dados sem pedir login deixa " +
      "qualquer um fazer o que só o dono deveria.",
    fix: "Exija autenticação e verifique a permissão no servidor, em toda rota sensível.",
  },
  {
    path: "/api/users",
    title: "Lista de usuários responde sem login",
    severity: "alta",
    explanation: "Uma rota que devolve usuários sem pedir login expõe dados pessoais.",
    fix: "Proteja a rota com autenticação e devolva só os campos permitidos.",
  },
  {
    path: "/api/debug",
    title: "Rota de depuração exposta",
    severity: "alta",
    explanation: "Rotas de debug costumam revelar configuração, variáveis e estado interno.",
    fix: "Remova rotas de debug de produção ou proteja-as com autenticação.",
  },
  {
    path: "/actuator/env",
    title: "Actuator /env exposto",
    severity: "alta",
    explanation: "O endpoint /actuator/env pode revelar variáveis de ambiente e segredos.",
    fix: "Desative os endpoints sensíveis do Actuator ou exija autenticação.",
  },
];
