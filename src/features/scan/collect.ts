// Coleta de arquivos da pasta local do projeto. Roda só no servidor (Node) e
// alimenta o scanner com o conteúdo lido. Nunca registra conteúdo em log.

import "server-only";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { FileInput } from "./types";

// Pastas sem valor para a varredura (dependências, build, config de ferramentas).
const IGNORED_DIRS = new Set([
  "node_modules", ".git", ".next", "out", "build", "dist", "coverage",
  ".vercel", ".turbo", ".cache", "graphify-out", ".agents", ".claude", ".codex",
]);

// Lockfiles: enormes e sem segredos.
const IGNORED_FILES = new Set([
  "pnpm-lock.yaml", "package-lock.json", "yarn.lock", "bun.lockb", "bun.lock",
]);

// .env.local e *.local guardam segredos locais por convenção; não são o alvo.
function isLocalEnv(name: string): boolean {
  return name === ".env.local" || name.endsWith(".local");
}

export interface CollectOptions {
  /** Tamanho máximo por arquivo em bytes (padrão 512 KiB). */
  maxBytes?: number;
  /** Teto de arquivos lidos (padrão 5000) para não travar em repos enormes. */
  maxFiles?: number;
}

export interface CollectResult {
  files: FileInput[];
  /** true quando o teto de arquivos foi atingido e a varredura parou antes do fim. */
  truncated: boolean;
}

const DEFAULT_MAX_BYTES = 512 * 1024;
const DEFAULT_MAX_FILES = 5000;

/**
 * Lê recursivamente os arquivos de texto sob `root`, pulando pastas de
 * dependência/build, lockfiles, arquivos .local, binários e arquivos acima do
 * limite de tamanho. Lança se `root` não for uma pasta acessível.
 */
export async function collectFiles(root: string, options: CollectOptions = {}): Promise<CollectResult> {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;

  const rootInfo = await stat(root);
  if (!rootInfo.isDirectory()) {
    throw new Error("O caminho informado não é uma pasta.");
  }

  const files: FileInput[] = [];
  let truncated = false;

  async function walk(dir: string): Promise<void> {
    if (files.length >= maxFiles) {
      truncated = true;
      return;
    }
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (files.length >= maxFiles) {
        truncated = true;
        return;
      }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) await walk(full);
        continue;
      }
      if (!entry.isFile()) continue; // ignora symlinks e outros tipos
      if (IGNORED_FILES.has(entry.name) || isLocalEnv(entry.name)) continue;

      const info = await stat(full);
      if (info.size > maxBytes) continue;

      const buffer = await readFile(full);
      if (buffer.includes(0)) continue; // provável binário

      files.push({
        path: path.relative(root, full).split(path.sep).join("/"),
        content: buffer.toString("utf8"),
      });
    }
  }

  await walk(root);
  return { files, truncated };
}
