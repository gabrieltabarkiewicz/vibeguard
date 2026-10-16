// Regras de detecção dos formatos de segredo mais comuns em apps feitos com IA.
// Cada padrão tem a flag global porque o motor aplica `matchAll` linha a linha.
//
// As fixtures de teste usam valores sintéticos no formato real, nunca chaves
// verdadeiras. Estas regras cobrem formato conhecido; segredos sem formato fixo
// (ex.: uma senha em texto livre) ficam para heurísticas futuras.

import type { SecretRule } from "./types";

/** Lê o papel de um JWT (segmento do meio) sem validar a assinatura. */
function jwtRole(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const segment = parts[1];
  if (!segment) return null;
  try {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (base64.length % 4)) % 4;
    const json = atob(base64.padEnd(base64.length + padding, "="));
    const parsed: unknown = JSON.parse(json);
    if (parsed && typeof parsed === "object" && "role" in parsed) {
      const role = (parsed as { role: unknown }).role;
      return typeof role === "string" ? role : null;
    }
    return null;
  } catch {
    return null;
  }
}

const PROMPT_ENV =
  "Prompt para a IA: \"Remova esta chave do código. Crie uma variável de " +
  "ambiente no servidor (sem o prefixo NEXT_PUBLIC_) e leia o valor por " +
  "process.env. Adicione o nome ao .env.example sem o valor real e gere uma " +
  "nova chave, porque a atual foi exposta.\"";

export const RULES: SecretRule[] = [
  {
    id: "openai-api-key",
    title: "Chave de API da OpenAI",
    severity: "critica",
    // (?<![\w-]) exige que o token comece num limite (evita casar dentro de um blob
    // base64url). (?!ant-) evita casar com a chave da Anthropic, que tem regra própria.
    pattern: /(?<![\w-])sk-(?!ant-)(?:proj-)?[A-Za-z0-9_-]{20,}/g,
    explanation:
      "Uma chave da OpenAI dá acesso pago à sua conta. Exposta, ela pode ser " +
      "usada por terceiros e gerar cobrança na sua fatura.",
    fix: PROMPT_ENV,
  },
  {
    id: "anthropic-api-key",
    title: "Chave de API da Anthropic (Claude)",
    severity: "critica",
    pattern: /(?<![\w-])sk-ant-[A-Za-z0-9_-]{20,}/g,
    explanation:
      "Uma chave da Anthropic dá acesso pago à sua conta. Exposta, pode ser " +
      "usada por terceiros e gerar cobrança.",
    fix: PROMPT_ENV,
  },
  {
    id: "stripe-secret-key-live",
    title: "Chave secreta de produção da Stripe",
    severity: "critica",
    pattern: /(?<![\w-])[sr]k_live_[A-Za-z0-9]{16,}/g,
    explanation:
      "A chave secreta de produção da Stripe permite movimentar dinheiro e ler " +
      "dados de clientes reais. É o segredo mais perigoso de vazar.",
    fix:
      "Revogue a chave agora no painel da Stripe (Developers > API keys) e gere " +
      "outra. " + PROMPT_ENV,
  },
  {
    id: "stripe-secret-key-test",
    title: "Chave secreta de teste da Stripe",
    severity: "media",
    pattern: /(?<![\w-])[sr]k_test_[A-Za-z0-9]{16,}/g,
    explanation:
      "Chave de ambiente de teste da Stripe. Não movimenta dinheiro real, mas " +
      "não deve ficar no código versionado.",
    fix: PROMPT_ENV,
  },
  {
    id: "aws-access-key-id",
    title: "Access Key ID da AWS",
    severity: "alta",
    pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g,
    explanation:
      "Um Access Key ID da AWS costuma vir junto da chave secreta. Juntos, dão " +
      "acesso aos seus recursos de nuvem (S3, EC2, banco) e podem gerar custo.",
    fix:
      "Desative esta credencial no IAM da AWS e crie outra com o mínimo de " +
      "permissões. " + PROMPT_ENV,
  },
  {
    id: "google-api-key",
    title: "Chave de API do Google",
    severity: "alta",
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g,
    explanation:
      "Chave de API do Google (Maps, Firebase e outros). Exposta e sem " +
      "restrição de domínio, pode ser usada por terceiros e gerar custo.",
    fix:
      "Restrinja a chave por domínio/API no Google Cloud Console e, se possível, " +
      "gere outra. " + PROMPT_ENV,
  },
  {
    id: "github-token",
    title: "Token de acesso do GitHub",
    severity: "alta",
    pattern: /\b(?:ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,})\b/g,
    explanation:
      "Um token do GitHub dá acesso aos seus repositórios conforme o escopo. " +
      "Exposto, permite ler ou alterar código.",
    fix:
      "Revogue o token em GitHub > Settings > Developer settings e gere outro. " +
      PROMPT_ENV,
  },
  {
    id: "supabase-service-role",
    title: "Chave service_role do Supabase",
    severity: "critica",
    // Casa com um JWT; validate confirma que o papel é service_role.
    pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
    validate: (match) => jwtRole(match) === "service_role",
    explanation:
      "A chave service_role do Supabase ignora as políticas de RLS e dá acesso " +
      "total ao banco. Ela nunca deve aparecer no front-end nem no código " +
      "versionado; use só no servidor.",
    fix:
      "Troque a chave no painel do Supabase (Project Settings > API) e use " +
      "apenas no servidor, nunca em variável NEXT_PUBLIC_. " + PROMPT_ENV,
  },
  {
    id: "private-key-pem",
    title: "Chave privada (PEM)",
    severity: "critica",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |PGP |DSA )?PRIVATE KEY-----/g,
    explanation:
      "Uma chave privada identifica você ou seu servidor (SSH, TLS, assinatura). " +
      "Exposta, permite se passar por você.",
    fix:
      "Nunca versione chaves privadas. Remova do repositório, gere um novo par " +
      "de chaves e guarde a privada fora do código (cofre de segredos ou .env " +
      "local ignorado pelo Git).",
  },
];
