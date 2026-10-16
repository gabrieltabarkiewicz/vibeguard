import { expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

async function load() {
  return import("./http");
}

it("aceita alvos locais", async () => {
  const { isLocalTarget } = await load();
  for (const host of ["http://localhost:3000", "http://127.0.0.1:8080", "http://app.localhost", "http://x.test"]) {
    expect(isLocalTarget(new URL(host)), host).toBe(true);
  }
});

it("recusa alvos que não são locais", async () => {
  const { parseTarget } = await load();
  for (const target of ["https://exemplo.com", "http://192.168.0.10", "http://8.8.8.8"]) {
    const result = parseTarget(target);
    expect(result.ok, target).toBe(false);
  }
});

it("assume http quando falta o protocolo e aceita localhost", async () => {
  const { parseTarget } = await load();
  const result = parseTarget("localhost:3000");
  expect(result.ok).toBe(true);
});

it("recusa protocolos fora de http/https", async () => {
  const { parseTarget } = await load();
  expect(parseTarget("ftp://localhost").ok).toBe(false);
});
