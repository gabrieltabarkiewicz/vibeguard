# Código e arquitetura

## Stack efetiva

| Peça | Versão | Observação |
|---|---|---|
| Next.js | 16.4.2 | App Router, Turbopack, `src/`, alias `@/*` |
| React / React DOM | 19.3.0 | |
| TypeScript | 5.9.3 | `strict: true` |
| Tailwind CSS | 4.3.3 | via `@tailwindcss/turbopack` (gerado pelo create-next-app 16.4) |
| Drizzle ORM / drizzle-kit | 0.45.4 / 0.31.11 | dialeto PostgreSQL |
| pg | 8.23.1 | driver Node; exige runtime Node, não Edge |
| Zod | 4.6.7 | ambiente e entradas |
| Pino | 10.4.0 | logger de servidor com redação |
| Vitest | 5.0.5 | ambiente `node` |
| ESLint | 9.39.5 | `eslint-config-next` 16.4.2 e `eslint-plugin-drizzle` 0.2.3 |
| Runtime | Node 24 | `engines.node >= 24`; `@types/node` 24 |
| Gerenciador | pnpm 11.24.0 | `pnpm-lock.yaml`, `pnpm-workspace.yaml` |

Versões exatas ficam no lockfile.

## Mapa do código

```text
src/
├── app/                 # App Router: layout (pt-BR), página inicial provisória, estilos globais
├── db/
│   ├── index.ts         # getDb(): pool pg lazy e limitado + Drizzle; closeDatabase()
│   ├── index.test.ts    # ciclo de vida do pool, sem banco real (mock de pg)
│   └── schema/index.ts  # schema vazio: nenhuma tabela criada ainda
└── lib/
    ├── env-schema.ts    # schemas Zod de ambiente; erros sem expor valores
    ├── env.ts           # leitura de ambiente (server-only)
    ├── logger.ts        # Pino com redação de segredos conhecidos (server-only)
    ├── utils.ts         # cn() = clsx + tailwind-merge
    └── *.test.ts        # validação sem vazamento e redação de logs
eslint-rules/            # regras locais quality/* e baseline Next compartilhada
scripts/verify-quality-rules.mjs  # self-check das regras locais
drizzle.config.ts        # gera SQL em drizzle/ sem conexão
```

Não existem ainda `src/features/`, `src/components/` nem `drizzle/`; eles surgem com o primeiro fluxo e o primeiro schema.

## Fronteiras e fluxo

- Apresentação (`src/app`, `src/components`) chama módulos de funcionalidade; não importa `@/db`. A regra `quality/no-direct-data-access` aplica isso em `.tsx`.
- Ambiente, logger e banco importam `server-only`; um import acidental em Client Component quebra o build.
- Dois motores de análise estática local, ambos produzindo o mesmo tipo `Finding` (campo `category`: "Segredo" | "Código" | "Configuração"; `evidence` é o valor mascarado para segredos e o trecho da linha para código/config):
  - `src/features/scan/` — segredos (puro: `rules`, `mask`, `scan`, `report`; e `collect`, `server-only` por ler o disco).
  - `src/features/audit/` — descuidos de código e configuração (XSS, eval, exec, SQL por interpolação, TLS desligado, CORS `*`, segredo em variável pública). Heurístico; marca para revisão.
- Fluxo local: `src/app/page.tsx` (client) chama a server action `src/app/actions.ts` (`"use server"`, valida o caminho com Zod) → `collectFiles` lê a pasta → `scanFiles` + `auditFiles` → `summarize` → `src/components/scan-report.tsx` renderiza agrupado por categoria. O navegador recebe só o relatório, com segredos mascarados.
- Logs nunca recebem conteúdo de arquivos, caminho ou segredos; a action registra apenas contagens.
- `src/features/probe/` — teste do app rodando (DAST não destrutivo). Camada de rede `http.ts` (`server-only`): só aceita alvo local (`localhost`/`127.0.0.1`/`::1`/`*.localhost`/`*.test`), só GET, número pequeno e fixo de requisições com timeout — sem flood, brute force ou payload destrutivo. `checks.ts` (puro) transforma a observação em achados (categoria "Aplicativo"): cabeçalhos de segurança ausentes, CORS reflexivo/`*`, reflexão de entrada (XSS), rota sensível sem login, arquivo sensível exposto (`.env`, `.git`), vazamento de stack trace, cabeçalhos que vazam o servidor. A action `probeApp` valida o endereço e loga só a contagem.
- Limite de produto e segurança: o DAST testa **forte, mas não destrutivo** e **só o alvo local**. Não há (e não deve haver) brute force, negação de serviço ou exploração que altere dados — isso mantém a ferramenta segura mesmo distribuída.
- Próximo motor pendente: SCA de dependências, que precisa consultar nomes de pacotes numa base pública (o usuário optou por não usar internet por ora).

## Dados e migrations

- Schema em `src/db/schema/`, sem tabelas. Entidades (análise, achado, alvo verificado) entram com o fluxo que as usa; tipos via `$inferSelect`/`$inferInsert`.
- `pnpm db:generate` gera SQL em `drizzle/` sem conectar. Revise o SQL e aplique com `pnpm db:migrate` só em destino autorizado; `DATABASE_URL_UNPOOLED` tem prioridade quando o provedor exigir conexão direta.
- Pool: `max: 5`, timeout de conexão 5 s, ociosidade 30 s, criado na primeira chamada de `getDb()` e reaproveitado no HMR. Dimensionar conforme o host quando ele for escolhido.
- Nada conecta ou migra em build, import ou request.

## Decisões

| Decisão | Motivo | Alternativa | Fonte/data | Revisar quando |
|---|---|---|---|---|
| Drizzle + PostgreSQL | Default do toolkit; o produto guarda análises e relatórios | Sem banco (descartado: relatórios precisam persistir) | docs/06-project-defaults.md, 2026-10-16 | Escolha de hospedagem |
| Tailwind via `@tailwindcss/turbopack` | Gerado pelo create-next-app 16.4.2 estável | PostCSS clássico | `create-next-app@16.4.2`, 2026-10-16 | Atualização do Next |
| Sem React Compiler / Cache Components | Nenhum requisito exige; flags negativas evitam preferências salvas | Ativar | create-next-app --help, 2026-10-16 | Requisito de desempenho medido |
| `esbuild: false` em `allowBuilds` | Os binários Windows vêm dos pacotes opcionais `@esbuild/win32-x64`; postinstall desnecessário | Permitir build script | pnpm 11 install, 2026-10-16 | Falha de drizzle-kit/vitest por binário ausente |
| Assets de template removidos de `public/` | Não usados pela página provisória | Manter | — | — |

## Manutenção

Atualize este mapa ao alterar diretórios, dependências relevantes, contratos ou fronteiras. Registre comportamento comprovado; remova decisões que deixaram de valer.
