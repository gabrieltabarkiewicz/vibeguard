import { describe, expect, it } from "vitest";
import { buildFindings } from "./checks";
import type { Observation, PageObservation } from "./types";

function page(overrides: Partial<PageObservation> = {}): PageObservation {
  return {
    baseUrl: "http://localhost:3000",
    status: 200,
    https: false,
    headers: {
      "content-security-policy": "default-src 'self'",
      "x-frame-options": "DENY",
      "x-content-type-options": "nosniff",
    },
    corsAllowOrigin: null,
    corsAllowCredentials: false,
    testOrigin: "https://vibeguard.invalid",
    reflectedInjection: false,
    errorStackLeak: false,
    ...overrides,
  };
}

function observation(overrides: Partial<Observation> = {}): Observation {
  return { page: page(), sensitive: [], protectedPaths: [], ...overrides };
}

function ids(obs: Observation): string[] {
  return buildFindings(obs).map((f) => f.ruleId);
}

describe("um app bem configurado não gera achados", () => {
  it("não acusa nada quando tudo está protegido", () => {
    expect(buildFindings(observation())).toEqual([]);
  });
});

describe("cabeçalhos de segurança", () => {
  it("acusa cabeçalhos ausentes", () => {
    const obs = observation({ page: page({ headers: {} }) });
    const found = ids(obs);
    expect(found).toContain("missing-csp");
    expect(found).toContain("missing-xfo");
    expect(found).toContain("missing-nosniff");
  });

  it("cobra HSTS só em HTTPS", () => {
    expect(ids(observation({ page: page({ headers: {}, https: false }) }))).not.toContain("missing-hsts");
    expect(ids(observation({ page: page({ headers: {}, https: true }) }))).toContain("missing-hsts");
  });

  it("marca cabeçalho que vaza o servidor", () => {
    const obs = observation({ page: page({ headers: { ...page().headers, "x-powered-by": "Express" } }) });
    expect(ids(obs)).toContain("disclosure-x-powered-by");
  });
});

describe("CORS", () => {
  it("acusa reflexão de qualquer origem", () => {
    const obs = observation({ page: page({ corsAllowOrigin: "https://vibeguard.invalid" }) });
    expect(ids(obs)).toContain("cors-reflects-origin");
  });
  it("acusa wildcard", () => {
    const obs = observation({ page: page({ corsAllowOrigin: "*" }) });
    expect(ids(obs)).toContain("cors-wildcard");
  });
  it("não acusa uma origem fixa confiável", () => {
    const obs = observation({ page: page({ corsAllowOrigin: "https://meusite.com" }) });
    expect(ids(obs)).not.toContain("cors-wildcard");
    expect(ids(obs)).not.toContain("cors-reflects-origin");
  });
});

describe("injeção refletida e vazamento de erro", () => {
  it("acusa reflexão sem escapar", () => {
    expect(ids(observation({ page: page({ reflectedInjection: true }) }))).toContain("reflected-injection");
  });
  it("acusa stack trace na página de erro", () => {
    expect(ids(observation({ page: page({ errorStackLeak: true }) }))).toContain("error-stack-leak");
  });
});

describe("arquivos expostos e rotas sem login", () => {
  it("acusa .env exposto só quando a assinatura casou", () => {
    const naoCasou = observation({ sensitive: [{ path: "/.env", status: 200, matched: false }] });
    expect(ids(naoCasou)).not.toContain("exposed-/.env");
    const casou = observation({ sensitive: [{ path: "/.env", status: 200, matched: true }] });
    expect(ids(casou)).toContain("exposed-/.env");
  });
  it("acusa rota protegida que respondeu sem login", () => {
    const obs = observation({ protectedPaths: [{ path: "/api/admin", status: 200, matched: true }] });
    expect(ids(obs)).toContain("unprotected-/api/admin");
  });
  it("todos os achados têm categoria Aplicativo", () => {
    const obs = observation({ page: page({ headers: {} }) });
    expect(buildFindings(obs).every((f) => f.category === "Aplicativo")).toBe(true);
  });
});
