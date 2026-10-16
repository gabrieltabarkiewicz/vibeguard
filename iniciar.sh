#!/usr/bin/env bash
# Facilitador de instalação do VibeGuard para Mac e Linux.
# Pré-requisito: Node.js instalado (https://nodejs.org).
set -e

echo
echo "====== VibeGuard ======"
echo

if ! command -v node >/dev/null 2>&1; then
  echo "[!] O Node.js não foi encontrado."
  echo "    Instale o Node.js em https://nodejs.org e rode este arquivo de novo."
  exit 1
fi

echo "[1/3] Preparando o gerenciador de pacotes..."
corepack enable >/dev/null 2>&1 || true

echo "[2/3] Instalando as dependências (pode demorar na primeira vez)..."
pnpm install

echo "[3/3] Iniciando o VibeGuard..."
echo "    Quando aparecer o endereço http://localhost:3000, abra-o no navegador."
echo
pnpm dev
