# Qualidade

## Comandos

| Comando | O que prova |
|---|---|
| `pnpm lint` | ESLint 9 com presets `core-web-vitals` e `typescript` do Next, regras locais `quality/*` e guardas Drizzle |
| `pnpm typecheck` | `tsc --noEmit` em modo strict |
| `pnpm lint:rules` | As regras locais em `eslint-rules/` se comportam como esperado (RuleTester do ESLint) |
| `pnpm test` | Vitest em Node: validação de ambiente sem vazar valores, redação de logs, ciclo de vida do pool (mock de `pg`) |
| `pnpm build` | Build de produção do Next sem credenciais |
| `pnpm check` | Todos os anteriores em sequência |

Durante o trabalho, rode o teste do módulo alterado (`pnpm vitest run src/caminho`) e `pnpm lint`; antes de concluir uma tarefa, `pnpm check`.

## Regras de base

- TypeScript strict e presets oficiais do framework.
- Teto de 350 linhas por arquivo (`quality/max-lines`) e organização proporcional ao comportamento.
- Sem `console` direto em `src/` (`quality/no-direct-console`); use o logger do servidor.
- `.tsx` em `src/app/` e `src/components/` não importam `db`/`getDb` (`quality/no-direct-data-access`).
- Drizzle: `update`/`delete` exigem `where` quando chamados na variável `db`.
- Validação de entradas e ambiente com Zod, erros sem segredos e testes de fronteiras relevantes.

## Estratégia de testes

- Lógica de servidor e motores de análise: testes Vitest com fixtures. Cada regra de detecção precisa de fixtures positivas (deve achar) e negativas (não pode achar), porque falso positivo e falso negativo são os dois modos de falha do produto.
- Fixtures com segredos usam valores sintéticos no formato real, nunca chaves verdadeiras.
- Testes de banco real, DOM e E2E ainda não existem; entram com os fluxos que precisarem deles.
- Esta base não garante a segurança da aplicação; os checks provam apenas o que a tabela acima descreve.

## Revisão após implementação ou correção

Ao concluir um ciclo de implementação ou correção, sugira de 3 a 8 ciclos posteriores de code review, com quantidade proporcional ao risco, focos complementares e prompt de continuação preenchido. Essa faixa é convenção do projeto; revisões adicionais dependem de pedido do usuário.

Cada ciclo verifica o estado atual e o código conectado, registra achados com severidade, local e evidência e reavalia correções autorizadas com os checks afetados. Correções da mesma rodada não reiniciam a contagem. Termine com verificação integrada e riscos residuais, sem criar ciclos artificiais ou afirmar que uma quantidade de revisões prova ausência de bugs.

## Dependências e entrega

Confira auditorias completas e de produção (`pnpm audit` e `pnpm audit --prod`). Investigue advisories e registre risco conhecido e correção disponível em `docs/setup.md`. Lint/build aprovados não significam auditoria zerada.

Checks são comandos explícitos. Hooks Git, bloqueios de push e exigências de branch não fazem parte do padrão. Atualize este documento junto dos scripts e regras que mudarem.
