import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

let root = "";
afterEach(async () => {
  if (root) await rm(root, { recursive: true, force: true });
  root = "";
});

async function makeProject(): Promise<string> {
  root = await mkdtemp(path.join(tmpdir(), "vg-collect-"));
  await mkdir(path.join(root, "src"), { recursive: true });
  await mkdir(path.join(root, "node_modules", "pkg"), { recursive: true });
  await writeFile(path.join(root, "src", "app.ts"), 'const a = 1;\n');
  await writeFile(path.join(root, "node_modules", "pkg", "index.js"), 'module.exports = 1;\n');
  await writeFile(path.join(root, ".env.local"), "SECRET=abc\n");
  await writeFile(path.join(root, "pnpm-lock.yaml"), "lockfile: true\n");
  await writeFile(path.join(root, "logo.bin"), Buffer.from([0x00, 0x01, 0x02, 0x00]));
  await writeFile(path.join(root, "big.txt"), "x".repeat(2000));
  return root;
}

it("lê os arquivos de texto e ignora dependências, lockfiles, .local e binários", async () => {
  const dir = await makeProject();
  const { files } = await collect(dir);
  const paths = files.map((f) => f.path).sort();
  expect(paths).toContain("src/app.ts");
  expect(paths).toContain("big.txt");
  expect(paths).not.toContain("node_modules/pkg/index.js");
  expect(paths.some((p) => p.includes(".env.local"))).toBe(false);
  expect(paths).not.toContain("pnpm-lock.yaml");
  expect(paths.some((p) => p.endsWith("logo.bin"))).toBe(false);
});

it("pula arquivos acima do limite de tamanho", async () => {
  const dir = await makeProject();
  const { files } = await collect(dir, { maxBytes: 1000 });
  expect(files.map((f) => f.path)).not.toContain("big.txt");
});

it("usa caminhos relativos com barra normal", async () => {
  const dir = await makeProject();
  const { files } = await collect(dir);
  expect(files.every((f) => !f.path.includes("\\"))).toBe(true);
});

it("sinaliza truncamento ao atingir o teto de arquivos", async () => {
  const dir = await makeProject();
  const { truncated } = await collect(dir, { maxFiles: 1 });
  expect(truncated).toBe(true);
});

it("lança quando o caminho não é uma pasta", async () => {
  await expect(collect(path.join(tmpdir(), "vg-nao-existe-xyz"))).rejects.toThrow();
});

// Import depois do mock de server-only.
async function collect(root: string, options?: { maxBytes?: number; maxFiles?: number }) {
  const { collectFiles } = await import("./collect");
  return collectFiles(root, options);
}
