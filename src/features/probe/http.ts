// Camada de rede do teste do app. Roda só no servidor. Regras de segurança:
// - só alvo LOCAL (localhost/127.0.0.1/::1/*.localhost/*.test);
// - só requisições GET, não destrutivas;
// - número pequeno e fixo de requisições, com timeout (sem flood, sem brute force).

import "server-only";
import {
  ERROR_PROBE_PATH,
  PROTECTED_PATHS,
  SENSITIVE_PATHS,
  STACK_TRACE_SIGNATURES,
  TEST_ORIGIN,
  XSS_MARKER,
  XSS_PARAM,
  XSS_SIGNATURE,
} from "./targets";
import type { Observation, PageObservation, PathObservation } from "./types";

const REQUEST_TIMEOUT_MS = 5000;
const MAX_BODY_BYTES = 8192;
const CONCURRENCY = 3;

export function isLocalTarget(url: URL): boolean {
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".localhost") ||
    host.endsWith(".test")
  );
}

export function parseTarget(raw: string): { ok: true; url: URL } | { ok: false; error: string } {
  const withProto = /^https?:\/\//i.test(raw.trim()) ? raw.trim() : `http://${raw.trim()}`;
  let url: URL;
  try {
    url = new URL(withProto);
  } catch {
    return { ok: false, error: "Endereço inválido." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "Use um endereço http ou https." };
  }
  if (!isLocalTarget(url)) {
    return {
      ok: false,
      error:
        "Por segurança, esta ferramenta só testa aplicativos rodando na sua própria " +
        "máquina (localhost). Ligue o seu app e use um endereço local.",
    };
  }
  return { ok: true, url };
}

async function getText(url: string, headers?: Record<string, string>): Promise<{ status: number; headers: Headers; body: string } | null> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
      redirect: "manual",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const raw = await res.text().catch(() => "");
    return { status: res.status, headers: res.headers, body: raw.slice(0, MAX_BODY_BYTES) };
  } catch {
    return null;
  }
}

function lowerHeaders(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return out;
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function isApiLikeAnswer(status: number, headers: Headers, body: string): boolean {
  if (status !== 200) return false;
  const type = (headers.get("content-type") ?? "").toLowerCase();
  if (type.includes("application/json")) return true;
  const trimmed = body.trimStart();
  // Evita o caso comum do SPA que responde 200 com index.html para qualquer rota.
  if (/^<!doctype html|^<html/i.test(trimmed)) return false;
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

/** Observa o app com um conjunto pequeno e fixo de requisições GET. */
export async function observe(url: URL): Promise<Observation> {
  const baseUrl = url.origin;

  const mainUrl = new URL(url.toString());
  mainUrl.searchParams.set(XSS_PARAM, XSS_MARKER);
  const main = await getText(mainUrl.toString(), { Origin: TEST_ORIGIN });
  const error = await getText(baseUrl + ERROR_PROBE_PATH);

  const headers = main ? lowerHeaders(main.headers) : {};
  const page: PageObservation = {
    baseUrl,
    status: main?.status ?? 0,
    https: url.protocol === "https:",
    headers,
    corsAllowOrigin: headers["access-control-allow-origin"] ?? null,
    corsAllowCredentials: headers["access-control-allow-credentials"] === "true",
    testOrigin: TEST_ORIGIN,
    reflectedInjection: Boolean(main && main.body.includes(XSS_SIGNATURE)),
    errorStackLeak: Boolean(error && STACK_TRACE_SIGNATURES.some((re) => re.test(error.body))),
  };

  const sensitive: PathObservation[] = await mapLimit(SENSITIVE_PATHS, CONCURRENCY, async (spec) => {
    const res = await getText(baseUrl + spec.path);
    return { path: spec.path, status: res?.status ?? 0, matched: Boolean(res && res.status === 200 && spec.signature.test(res.body)) };
  });

  const protectedPaths: PathObservation[] = await mapLimit(PROTECTED_PATHS, CONCURRENCY, async (spec) => {
    const res = await getText(baseUrl + spec.path);
    return { path: spec.path, status: res?.status ?? 0, matched: Boolean(res && isApiLikeAnswer(res.status, res.headers, res.body)) };
  });

  return { page, sensitive, protectedPaths };
}

/** true se conseguimos falar com o app. */
export function reachedApp(observation: Observation): boolean {
  return observation.page.status > 0;
}
