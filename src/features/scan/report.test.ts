import { expect, it } from "vitest";
import { summarize } from "./report";
import type { Finding, Severity } from "./types";

function finding(severity: Severity): Finding {
  return {
    ruleId: "r", title: "t", severity, file: "f.ts", line: 1, column: 1,
    masked: "a…b", explanation: "e", fix: "x",
  };
}

it("conta os achados por severidade", () => {
  const report = summarize([finding("alta"), finding("alta"), finding("critica")]);
  expect(report.total).toBe(3);
  expect(report.countsBySeverity).toEqual({ critica: 1, alta: 2, media: 0, baixa: 0 });
});

it("ordena da maior para a menor severidade", () => {
  const report = summarize([finding("baixa"), finding("critica"), finding("media"), finding("alta")]);
  expect(report.findings.map((f) => f.severity)).toEqual(["critica", "alta", "media", "baixa"]);
});

it("resume uma lista vazia sem erro", () => {
  const report = summarize([]);
  expect(report.total).toBe(0);
  expect(report.findings).toEqual([]);
});
