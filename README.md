# 🛡️ VibeGuard

**Testes de segurança para quem cria software com IA.** O VibeGuard roda na sua
máquina, procura brechas no seu projeto e explica cada uma em linguagem simples,
já com a correção pronta. Nenhum arquivo seu é enviado para fora.

---

## ⚠️ Antes de tudo: uso responsável

O VibeGuard só pode ser usado para testar **software que é seu** (ou que você tem
permissão explícita para testar). O teste do app rodando só funciona em endereços
da **sua própria máquina** (`localhost`) — a ferramenta recusa qualquer outro
endereço de propósito. Testar o sistema dos outros sem autorização é crime.

---

## O que ele faz

O VibeGuard tem três "detetives":

| Detetive | O que procura |
|---|---|
| 🔑 **Segredos** | Chaves de API, tokens e chaves privadas esquecidas no código |
| 📖 **Código** | Descuidos que abrem brecha (XSS, eval, SQL mal montado, CORS liberado, segredo em variável pública…) |
| 🚨 **App ligado** | Testa o seu app rodando: travas de segurança faltando, arquivo sensível exposto, área sem senha, entrada refletida (XSS)… |

Cada achado vem com: **o que é**, **o quão grave é**, **onde está**, uma
**explicação simples** e a **correção pronta pra copiar** (inclusive um texto pra
colar na sua ferramenta de IA).

> O VibeGuard aponta o caminho, mas não substitui um olhar humano: uma brecha nova
> sempre pode escapar. Use como um bom primeiro pente-fino, não como garantia.

---

## Como usar (jeito fácil)

**Antes:** instale o [Node.js](https://nodejs.org) (versão 20 ou mais nova). É o
único pré-requisito.

Depois, dentro da pasta do VibeGuard:

- **No Windows:** dê dois cliques em **`iniciar.bat`**.
- **No Mac ou Linux:** rode `./iniciar.sh` no terminal.

O script instala o que falta e abre o VibeGuard. Quando aparecer o endereço
`http://localhost:3000`, abra-o no navegador.

Na tela, você pode:

1. **Analisar o código** — informe o caminho da pasta do seu projeto.
2. **Testar o app ligado** — deixe o seu app rodando e informe o endereço local
   (ex.: `localhost:3000`).

## Como usar (manual)

Se preferir os comandos:

```bash
pnpm install   # instala as dependências (use "corepack enable" se faltar o pnpm)
pnpm dev       # inicia em http://localhost:3000
```

---

## Para quem for desenvolver

- Verificação completa (lint, tipos, testes e build): `pnpm check`
- Documentação do projeto em [`docs/`](docs/) e no [`PRODUCT.md`](PRODUCT.md).
- Guia visual para leigos: [`docs/guia-visual.html`](docs/guia-visual.html).

## Licença

[MIT](LICENSE) — livre para usar, estudar e compartilhar. Sem garantias; use por
sua conta e risco, e apenas em sistemas que você tem permissão para testar.
