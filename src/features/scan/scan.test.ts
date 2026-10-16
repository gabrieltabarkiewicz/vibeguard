import { describe, expect, it } from "vitest";
import { scanContent, scanFiles } from "./scan";
import type { Finding } from "./types";

// JWTs sintéticos, montados na hora. Nenhuma chave real é usada em nenhum teste.
function b64url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}
const serviceRoleJwt = `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ role: "service_role", iss: "supabase" })}.c2lnbmF0dXJl`;
const anonJwt = `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ role: "anon", iss: "supabase" })}.c2lnbmF0dXJl`;
// JWT válido na forma, mas sem o campo role: exercita o validate rejeitando.
const roleLessJwt = `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ iss: "supabase", sub: "u1" })}.c2lnbmF0dXJl`;

// Valores sintéticos no formato real de cada segredo.
const POSITIVES: Record<string, string> = {
  "openai-api-key": "sk-proj-AAAAAAAAAAAAAAAAAAAAAAAA",
  "anthropic-api-key": "sk-ant-api03-BBBBBBBBBBBBBBBBBBBBBBBB",
  "stripe-secret-key-live": "sk_live_0123456789ABCDEF0123",
  "stripe-secret-key-test": "sk_test_0123456789ABCDEF0123",
  "aws-access-key-id": "AKIAIOSFODNN7EXAMPLE",
  "google-api-key": `AIza${"A".repeat(35)}`,
  "github-token": `ghp_${"a".repeat(36)}`,
  "supabase-service-role": serviceRoleJwt,
  "private-key-pem": "-----BEGIN RSA PRIVATE KEY-----",
};

function findById(findings: Finding[], id: string): Finding | undefined {
  return findings.find((f) => f.ruleId === id);
}

describe("fixtures positivas", () => {
  for (const [ruleId, secret] of Object.entries(POSITIVES)) {
    it(`detecta ${ruleId} e não vaza o segredo`, () => {
      const findings = scanContent("app.ts", `const chave = "${secret}";`);
      const match = findById(findings, ruleId);
      expect(match, `esperava um achado para ${ruleId}`).toBeDefined();
      expect(match?.line).toBe(1);
      // O relatório nunca contém o segredo inteiro.
      expect(match?.masked).not.toBe(secret);
      expect(`${match?.masked}`.length).toBeLessThan(secret.length);
      expect(match?.fix.length ?? 0).toBeGreaterThan(0);
    });
  }

  it("cada fixture positiva dispara exatamente a sua regra", () => {
    for (const [ruleId, secret] of Object.entries(POSITIVES)) {
      const ids = scanContent("app.ts", secret).map((f) => f.ruleId);
      expect(ids, `${ruleId} casou com regra de outro formato`).toEqual([ruleId]);
    }
  });

  it("reporta a linha correta em conteúdo com várias linhas", () => {
    const content = ["// comentário", "const ok = 1;", `const k = "${POSITIVES["github-token"]}";`].join("\n");
    const match = findById(scanContent("x.ts", content), "github-token");
    expect(match?.line).toBe(3);
  });

  it("reporta linha e coluna corretas com quebras CRLF", () => {
    const content = `linha 1\r\nconst k = "${POSITIVES["aws-access-key-id"]}";`;
    const match = findById(scanContent("x.ts", content), "aws-access-key-id");
    expect(match?.line).toBe(2);
    // coluna 1-based do início do trecho (após `const k = "`).
    expect(match?.column).toBe('const k = "'.length + 1);
  });

  it("detecta vários segredos distintos na mesma linha", () => {
    const line = `${POSITIVES["openai-api-key"]} e ${POSITIVES["github-token"]}`;
    const ids = scanContent("x.ts", line).map((f) => f.ruleId).sort();
    expect(ids).toEqual(["github-token", "openai-api-key"]);
  });
});

describe("fixtures negativas", () => {
  const SAFE = [
    "const commit = 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3';", // sha de git (40 hex)
    "const id = '123e4567-e89b-12d3-a456-426614174000';", // uuid
    "const prefix = 'sk-short';", // curto demais para a OpenAI
    "const msg = 'use a chave service_role apenas no servidor';", // só texto
    `const anon = "${anonJwt}";`, // JWT anônimo do Supabase: público por design
    "const hash = 'abcsk-proj0123456789abcdefghij';", // 'sk-' embutido em blob: não é token
    `const semRole = "${roleLessJwt}";`, // JWT válido sem role: validate rejeita
  ];

  for (const line of SAFE) {
    it(`não acusa: ${line.slice(0, 40)}…`, () => {
      expect(scanContent("safe.ts", line)).toEqual([]);
    });
  }

  it("não confunde a chave anônima com a service_role", () => {
    const ids = scanContent("supabase.ts", `const a = "${anonJwt}";`).map((f) => f.ruleId);
    expect(ids).not.toContain("supabase-service-role");
  });
});

describe("exposição ao cliente", () => {
  it("eleva a severidade quando o segredo está numa variável pública", () => {
    const normal = findById(scanContent("s.ts", POSITIVES["stripe-secret-key-test"]!), "stripe-secret-key-test");
    expect(normal?.severity).toBe("media");

    const exposed = findById(
      scanContent(".env", `NEXT_PUBLIC_STRIPE=${POSITIVES["stripe-secret-key-test"]}`),
      "stripe-secret-key-test",
    );
    expect(exposed?.severity).toBe("critica");
    expect(exposed?.explanation).toContain("navegador");
  });
});

describe("scanFiles", () => {
  it("agrega achados de vários arquivos com o caminho de cada um", () => {
    const findings = scanFiles([
      { path: "a.ts", content: `k="${POSITIVES["openai-api-key"]}"` },
      { path: "b.ts", content: "nada aqui" },
      { path: "c.ts", content: `k="${POSITIVES["private-key-pem"]}"` },
    ]);
    expect(findings).toHaveLength(2);
    expect(findings.map((f) => f.file)).toEqual(["a.ts", "c.ts"]);
  });
});
