"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { Sidebar, type NavId } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Hero } from "@/components/dashboard/Hero";
import { ScanCard } from "@/components/dashboard/ScanCard";
import { ResultsPanel } from "@/components/dashboard/ResultsPanel";
import { Insights } from "@/components/dashboard/Insights";
import { probeApp, scanPath } from "./actions";
import type { ScanReport } from "@/features/scan/report";

type PanelState = "idle" | "has" | "empty" | "error";
type Result = { report: ScanReport; summaryNote: string; emptyNote: string; target: string | null };

export default function Home() {
  const [nav, setNav] = useState<NavId>("inicio");
  const [path, setPath] = useState("");
  const [url, setUrl] = useState("");
  const [pathErr, setPathErr] = useState<string | null>(null);
  const [urlErr, setUrlErr] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [state, setState] = useState<PanelState>("idle");
  const [panelError, setPanelError] = useState<string | null>(null);
  const [codePending, startCode] = useTransition();
  const [appPending, startApp] = useTransition();
  const [navOpen, setNavOpen] = useState(false);

  const cardsRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  function navigate(id: NavId) {
    setNav(id);
    setNavOpen(false);
    if (id === "codigo" || id === "app") cardsRef.current?.scrollIntoView({ behavior: "smooth" });
    else if (id === "relatorio") reportRef.current?.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finish(
    ok: boolean,
    report: ScanReport | null,
    note: string,
    empty: string,
    target: string | null,
    error: string | null,
  ) {
    if (!ok || !report) {
      setResult(null);
      setState("error");
      setPanelError(error ?? "Algo deu errado.");
      return;
    }
    setPanelError(null);
    setResult({ report, summaryNote: note, emptyNote: empty, target });
    setState(report.total === 0 ? "empty" : "has");
    reportRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function analyze() {
    if (path.trim() === "") {
      setPathErr("Informe o caminho da pasta do projeto.");
      return;
    }
    setPathErr(null);
    startCode(async () => {
      const r = await scanPath(path);
      finish(
        r.ok,
        r.ok ? r.report : null,
        r.ok ? `em ${r.filesScanned} arquivo(s)${r.truncated ? ", análise truncada" : ""}` : "",
        r.ok ? `Analisei ${r.filesScanned} arquivo(s). Cobre segredos e descuidos comuns; não é prova de que o app está 100% seguro.` : "",
        null,
        r.ok ? null : r.error,
      );
    });
  }

  function test() {
    if (url.trim() === "") {
      setUrlErr("Informe o endereço do app em execução.");
      return;
    }
    setUrlErr(null);
    startApp(async () => {
      const r = await probeApp(url);
      finish(
        r.ok,
        r.ok ? r.report : null,
        r.ok ? `em ${r.target}` : "",
        r.ok ? `Testei ${r.target} e não achei problemas nas checagens atuais. Não é prova de segurança total.` : "",
        r.ok ? r.target : null,
        r.ok ? null : r.error,
      );
    });
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="hidden md:block">
        <Sidebar active={nav} onNavigate={navigate} />
      </div>
      {navOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden" role="presentation">
          <button type="button" aria-label="Fechar menu" className="absolute inset-0" style={{ background: "rgba(0,0,0,0.5)", border: "none" }} onClick={() => setNavOpen(false)} />
          <div className="relative h-full">
            <Sidebar active={nav} onNavigate={navigate} />
          </div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setNavOpen(true)} />
        <main className="mx-auto flex w-full max-w-[1320px] flex-wrap gap-5 p-6">
          <div className="flex min-w-[320px] flex-1 flex-col gap-5">
            <Hero />
            <div ref={cardsRef} className="flex flex-wrap gap-5">
              <ScanCard
                stepTitle="1. Analisar o código"
                description="Lê os arquivos do projeto à procura de segredos e descuidos."
                label="Pasta do projeto"
                placeholder="C:\\projetos\\meu-app"
                kind="code"
                value={path}
                onChange={setPath}
                onSubmit={analyze}
                pending={codePending}
                otherPending={appPending}
                error={pathErr}
              />
              <ScanCard
                stepTitle="2. Testar o app ligado"
                description="Testa o app rodando, de forma forte e não destrutiva."
                label="Endereço do app local"
                placeholder="localhost:3000"
                kind="app"
                value={url}
                onChange={setUrl}
                onSubmit={test}
                pending={appPending}
                otherPending={codePending}
                error={urlErr}
                note="Funciona apenas em localhost e os testes são não destrutivos."
              />
            </div>

            <div ref={reportRef}>
              {codePending || appPending ? (
                <LoadingPanel verb={codePending ? "Analisando o código…" : "Testando o app…"} />
              ) : state === "error" ? (
                <ErrorPanel message={panelError ?? "Algo deu errado."} />
              ) : result ? (
                <ResultsPanel report={result.report} summaryNote={result.summaryNote} emptyNote={result.emptyNote} />
              ) : (
                <IdlePanel />
              )}
            </div>
          </div>

          <div className="w-full xl:w-[340px] xl:shrink-0">
            <Insights state={state} report={result?.report ?? null} target={result?.target ?? null} />
          </div>
        </main>
      </div>
    </div>
  );
}

function IdlePanel() {
  return (
    <div className="vg-card p-8 text-center" style={{ color: "var(--muted)", fontSize: 14 }}>
      Os resultados aparecem aqui depois da análise.
    </div>
  );
}

function LoadingPanel({ verb }: { verb: string }) {
  return (
    <div className="vg-card flex flex-col gap-4 p-6">
      <div className="flex items-center gap-2" style={{ color: "var(--teal)" }}>
        <Loader2 size={18} className="vg-spin" />
        <span style={{ fontWeight: 600 }}>{verb}</span>
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="vg-skeleton h-12 w-full" />
      ))}
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="vg-card flex items-start gap-3 p-6" role="alert" style={{ border: "1px solid var(--warn)" }}>
      <TriangleAlert size={22} color="var(--warn)" className="shrink-0" />
      <div>
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--warn)" }}>Análise interrompida</p>
        <p style={{ fontSize: 13.5, color: "var(--muted)" }}>{message}</p>
      </div>
    </div>
  );
}
