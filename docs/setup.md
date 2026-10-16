# Setup e evidências

## Origem e contexto

- Data da verificação: 2026-10-16.
- Toolkit: `soumatheusgomes/vibe-coding-toolkit`, revisão `f13bb354363dafef8ce8d8f605856cc9e1cc52cc` (2026-10-15). Cópia única em diretório temporário fora do projeto; nada do toolkit foi copiado para o app além dos templates adaptados.
- Cliente: Claude Code (desktop). Modelo e autenticação da sessão preservados; nenhuma política de seleção de subagentes foi configurada, então subagentes usariam o modelo da sessão. Nenhum custo externo ou API paga ativado.
- Runtime: Node 24.15.0. Gerenciador: pnpm 11.24.0 (fixado em `packageManager`).
- Sistema: Windows 11. O projeto foi movido de um caminho longo para `C:\Users\agenc\Desktop\vibeguard` (32 caracteres) porque caminhos acima de 260 quebravam a resolução de pacotes (Vitest) e o cache do Graphify.

## Decisões e fontes

| Decisão | Motivo | Fonte / data |
|---|---|---|
| Next.js 16.4.2 (canal `latest`) | Canal estável no registry; `rc`/`beta`/`canary` existem mas não foram usados | `npm view next dist-tags`, create-next-app --help, 2026-10-16 |
| Flags `--no-react-compiler --no-cache-components --no-agent-feedback` | Nenhum requisito exige; evita preferências salvas | create-next-app@16.4.2, 2026-10-16 |
| `@types/node@24`, `@next/env@16.4.2` | Alinhar tipos ao runtime Node 24 e `@next/env` à versão do Next | docs/04-project-bootstrap.md, 2026-10-16 |
| Núcleo Drizzle + pg, Zod, Pino, Vitest, eslint-plugin-drizzle | Default do toolkit para persistência nova; produto guarda análises | docs/06-project-defaults.md, 2026-10-16 |
| `typecheck` = `next typegen && tsc --noEmit` | Adaptação ao Next 16: `LayoutProps` é tipo global gerado; num checkout limpo o typecheck roda antes do build e falharia sem os tipos de rota | `next typegen --help`, erro TS2304 observado, 2026-10-16 |
| `testTimeout: 20_000` no Vitest | Adaptação Windows: o primeiro import a frio do Pino pode passar de 5 s e falhar `pnpm check`; a lógica do teste é síncrona | timeout observado e reexecução verde, 2026-10-16 |
| `esbuild: false` em `allowBuilds` (pnpm) | Binário Windows vem dos pacotes opcionais `@esbuild/win32-x64`; postinstall desnecessário | pnpm 11 install, 2026-10-16 |
| Assets de template removidos de `public/` | Não usados pela página inicial | 2026-10-16 |

Os dois ajustes de script/config acima são melhorias sobre os exemplos do toolkit, justificadas por evidência nesta máquina; o restante segue os defaults.

## Componentes

| Componente | Ação e motivo | Escopo | Estado e evidência |
|---|---|---|---|
| create-next-app 16.4.2 | Gerar base App Router, TS strict, Tailwind, `src/`, `@/*` | Projeto | Validado: scaffold criado |
| Núcleo servidor (`templates/next/`) | Env, logger, conexão Drizzle, `cn`, testes | Projeto | Validado: arquivos presentes, testes verdes |
| Drizzle ORM 0.45.4 / drizzle-kit 0.31.11 | Persistência padrão; schema ainda sem tabelas | Projeto | Configurado sem execução (nenhum banco conectado) |
| ESLint do toolkit (`next-app` + `eslint-rules/`) | Teto 350 linhas, logger, fronteira de dados, guardas Drizzle | Projeto | Validado: `pnpm lint` e `pnpm lint:rules` verdes |
| Skills Vercel (8) + `find-skills` | Catálogo atual, `--copy` no Windows | Projeto (`.agents/skills/`, cópia em `.claude/skills/`, `skills-lock.json`) | Validado: instaladas e descobertas na sessão Claude Code |
| Ponytail 5.3.1 | Reutilizar plugin do cliente, escopo de projeto | Projeto (`.claude/settings.json`) | Configurado: habilitado; 4 userConfig opcionais não definidos |
| Superpowers 7.0.0 | Reutilizar plugin do cliente, escopo de projeto | Projeto | Configurado: habilitado |
| Caveman | Não encontrado nos marketplaces do cliente | — | Pendente: estilo descrito em AGENTS.md, plugin ausente |
| RTK 0.45.0 | Binário e hook globais funcionais | Máquina (reutilizado) | Validado: `rtk --version` |
| Context7 | Sem conexão ativa dedicada ao projeto; MCP local configurado | Projeto (`.mcp.json`, `.codex/config.toml`) | Configurado sem execução: servidor desconectou nesta sessão; usar fontes oficiais quando indisponível |
| Graphify 0.9.38 | CLI global; exclusões e grafo determinístico no projeto | Projeto (`.graphifyignore`, `graphify-out/`) | Validado: grafo gerado sem LLM externo |

## Documentação criada

PRODUCT.md, README.md, AGENTS.md e CLAUDE.md na raiz; docs/architecture.md, docs/design.md, docs/onboarding.md, docs/quality.md e este docs/setup.md. Todos preenchidos com fatos do produto e do código. O bloco `nextjs-agent-rules` gerado pelo Next foi preservado no fim de AGENTS.md. Nenhum `product.md` anterior existia para consolidar.

## Verificações

| Item | Estado | Evidência |
|---|---|---|
| `pnpm lint` | Validado | Sem erros |
| `pnpm typecheck` | Validado | `next typegen` + `tsc --noEmit` sem erros em checkout limpo |
| `pnpm lint:rules` | Validado | `quality/max-lines`, `no-direct-console`, `no-direct-data-access`: ok |
| `pnpm test` | Validado | 3 arquivos, 8 testes verdes (ciclo de pool, validação sem vazamento, redação de logs) — todos com mock, sem banco real |
| `pnpm build` | Validado | `next build` compilou; rotas `/` e `/_not-found` estáticas |
| `pnpm check` | Validado | Cadeia completa verde a partir de `.next` e cache limpos |
| HTTP / página | Validado | `next start` na porta 3917: HTTP 200, `<title>VibeGuard</title>`, `lang="pt-BR"`; servidor encerrado após o teste |
| Geração de SQL | Pendente | Schema sem tabelas; `pnpm db:generate` só gera algo quando houver entidades |
| Banco real / migrations | Pendente | Nenhuma conexão autorizada; não testado |
| `pnpm audit --prod` | Validado | Nenhuma vulnerabilidade conhecida |
| `pnpm audit` (dev) | Validado com advisories | 1 alta (`braces` via `@next/eslint-plugin-next>fast-glob`, sem patch) e 1 moderada (`esbuild <=0.24.2` via `drizzle-kit>@esbuild-kit`, servidor de dev); ambas em dependências de desenvolvimento, sem correção sem downgrade incompatível. Monitorar |
| Descoberta de skills | Validado | As 9 skills aparecem na listagem de skills da sessão Claude Code |
| Context7 (consulta real) | Pendente | Servidor MCP desconectou nesta sessão; `.mcp.json`/`.codex` presentes, não exercitados |
| Graphify | Validado | `graphify-out/graph.json`: 152 nós, 204 arestas (`skills-lock.json` sem nós, esperado) |

Recursos temporários criados pelo setup: a cópia do toolkit num diretório temporário e o servidor de validação na porta 3917. O servidor foi encerrado; a cópia do toolkit fica fora do projeto.

## Pendências e próxima entrega

Decisões externas pendentes (ver `PRODUCT.md`): ponto de entrada (repositório, upload ou URL), autenticação, hospedagem e retenção do código enviado. Advisories de desenvolvimento acima sem correção disponível. Caveman não encontrado nos marketplaces.

Próxima entrega do MVP: scanner de segredos como módulo de servidor em `src/features/scan/`, com regras para formatos comuns, mascaramento e testes Vitest (fixtures positivas e negativas).

Sugestão de revisão: 3 a 8 ciclos posteriores de code review quando o primeiro código de produto existir, com focos complementares (fronteira de dados/servidor, validação Zod, redação de segredos, acessibilidade do relatório) e os checks reais (`pnpm check`, `pnpm audit`). A faixa é convenção do projeto, não garantia de qualidade; novas rodadas dependem de pedido.
