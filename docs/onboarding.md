# Preparação local

## Pré-requisitos

- Node 24 (`node -v`).
- pnpm 11.24 (`pnpm -v`); a versão está fixada em `packageManager`. Com Corepack ativo, ela é selecionada automaticamente.
- Windows: o caminho do projeto precisa ser curto. Com `LongPathsEnabled` desligado, caminhos acima de 260 caracteres dentro de `node_modules/.pnpm` quebram a resolução de pacotes (ver Dificuldades conhecidas).

## Primeira execução

```bash
pnpm install
pnpm dev
```

Abra http://localhost:3000. Nenhuma variável de ambiente é necessária para rodar a base atual.

Variáveis (nomes em `.env.example`; valores reais só em `.env.local`, que é ignorado pelo Git):

- `DATABASE_URL`: conexão PostgreSQL (`postgres://` ou `postgresql://`).
- `DATABASE_URL_UNPOOLED`: opcional; conexão direta para migrations quando o provedor exigir.
- `LOG_LEVEL`: `trace` a `fatal` ou `silent`; padrão `info`.

Nunca use prefixo `NEXT_PUBLIC_` para segredos.

## Banco

Ainda não há tabelas. Quando o primeiro schema existir:

1. Suba um PostgreSQL local (por exemplo, um container `postgres`) ou use um banco de desenvolvimento autorizado. Nunca use produção para testes.
2. Defina `DATABASE_URL` em `.env.local`.
3. `pnpm db:generate` gera o SQL em `drizzle/` sem conectar. Revise o arquivo gerado.
4. `pnpm db:migrate` aplica as migrations no banco configurado.

## Verificar

```bash
pnpm check
```

Roda lint, tipos, self-check das regras locais, testes e build. Nada disso precisa de credenciais: os testes de banco usam mock do `pg`. Testes que exigem um PostgreSQL real ainda não existem.

## Agentes

Leia [AGENTS.md](../AGENTS.md). [CLAUDE.md](../CLAUDE.md) importa as mesmas instruções. Consulte [setup.md](setup.md) para skills locais, integrações e escopos configurados.

## Dificuldades conhecidas

- **`ERR_PACKAGE_IMPORT_NOT_DEFINED: #module-sync-enabled` ao rodar `pnpm test`.** Causa comprovada: o projeto estava num caminho de 203 caracteres; somado a `node_modules/.pnpm/vite@.../package.json`, passou de 260 e o Node não leu o `package.json` do Vite. Correção: mover o projeto para um caminho curto e reinstalar (`pnpm install`). Ativar long paths no Windows também resolveria, mas é uma configuração de sistema.
