"use client";

import { useId, useState, useTransition } from "react";
import { probeApp, scanPath, type ProbeActionResult, type ScanActionResult } from "./actions";
import { ScanReportView } from "@/components/scan-report";

function FolderSection() {
  const inputId = useId();
  const [path, setPath] = useState("");
  const [result, setResult] = useState<ScanActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => setResult(await scanPath(path)));
  }

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-lg font-semibold">1. Analisar o código (uma pasta)</h2>
        <p className="text-sm text-zinc-500">Lê os arquivos do projeto à procura de segredos e descuidos. Não precisa ligar o app.</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-sm font-medium">Caminho da pasta do projeto</label>
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
          <button type="submit" disabled={pending || path.trim() === ""} className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900">
            {pending ? "Analisando…" : "Analisar"}
          </button>
        </div>
      </form>
      <div aria-live="polite" aria-busy={pending}>
        {result?.ok === false && <ErrorBox message={result.error} />}
        {result?.ok === true && (
          <ScanReportView
            report={result.report}
            summaryNote={`em ${result.filesScanned} arquivo(s)${result.truncated ? ", análise truncada" : ""}`}
            emptyNote={`Analisei ${result.filesScanned} arquivo(s)${result.truncated ? " (parei no limite de arquivos)" : ""}. Cobre segredos de formato conhecido e descuidos comuns de código; não é prova de que o app inteiro está seguro.`}
          />
        )}
      </div>
    </section>
  );
}

function AppSection() {
  const inputId = useId();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ProbeActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => setResult(await probeApp(url)));
  }

  return (
    <section className="flex flex-col gap-3 border-t border-zinc-200 pt-8 dark:border-zinc-800">
      <div>
        <h2 className="text-lg font-semibold">2. Testar o app ligado (um endereço local)</h2>
        <p className="text-sm text-zinc-500">
          Deixe o app rodando e informe o endereço local. O VibeGuard faz testes fortes, porém não
          destrutivos: só o seu app em localhost, sem derrubar nem forçar senha.
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-sm font-medium">Endereço do app</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={inputId}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="localhost:3000"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 rounded border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button type="submit" disabled={pending || url.trim() === ""} className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900">
            {pending ? "Testando…" : "Testar"}
          </button>
        </div>
      </form>
      <div aria-live="polite" aria-busy={pending}>
        {result?.ok === false && <ErrorBox message={result.error} />}
        {result?.ok === true && (
          <ScanReportView
            report={result.report}
            summaryNote={`em ${result.target}`}
            emptyNote={`Testei ${result.target} e não achei problemas nas checagens atuais. Elas cobrem cabeçalhos, CORS, arquivos expostos, reflexão e rotas sem login; não é prova de que o app está 100% seguro.`}
          />
        )}
      </div>
    </section>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
      {message}
    </p>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">VibeGuard</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Testes de segurança para o seu app, rodando na sua máquina: nenhum arquivo é enviado para fora.
          Procura segredos e descuidos no código e testa o app ligado à procura de brechas.
        </p>
      </header>
      <FolderSection />
      <AppSection />
    </main>
  );
}
