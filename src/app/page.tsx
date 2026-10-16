"use client";

import { useId, useState, useTransition } from "react";
import { scanPath, type ScanActionResult } from "./actions";
import { ScanReportView } from "@/components/scan-report";

export default function Home() {
  const inputId = useId();
  const [path, setPath] = useState("");
  const [result, setResult] = useState<ScanActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      setResult(await scanPath(path));
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">VibeGuard</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Procura segredos esquecidos (chaves de API, tokens) e descuidos de código e
          configuração que abrem brecha de segurança. Tudo roda na sua máquina: nenhum
          arquivo é enviado para fora.
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-sm font-medium">
          Caminho da pasta do projeto
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={inputId}
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="C:\Users\voce\meu-projeto"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 rounded border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={pending || path.trim() === ""}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {pending ? "Varrendo…" : "Analisar"}
          </button>
        </div>
      </form>

      <section aria-live="polite" aria-busy={pending}>
        {result?.ok === false && (
          <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            {result.error}
          </p>
        )}
        {result?.ok === true && (
          <ScanReportView report={result.report} filesScanned={result.filesScanned} truncated={result.truncated} />
        )}
      </section>
    </main>
  );
}
