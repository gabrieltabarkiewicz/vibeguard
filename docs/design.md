# Design e acessibilidade

## Direção

Público: vibecoders sem formação em segurança, em português (pt-BR), usando celular e desktop. O tom é direto e calmo: o relatório explica o risco sem alarmismo e sempre aponta a ação seguinte. Esta direção ainda não foi implementada além da página inicial provisória.

Princípios para o relatório (direção):

- A severidade usa cor **e** texto ou ícone, nunca só cor.
- Cada achado mostra primeiro o que fazer (correção ou prompt para copiar) e depois o detalhe técnico, em área expansível.
- Segredos aparecem mascarados (prefixo e sufixo) em toda a interface.
- O prompt de correção tem botão de copiar com confirmação visível e anunciada a leitores de tela.

## Sistema existente

- Tokens em `src/app/globals.css`: `--background` e `--foreground`, com variante escura por `prefers-color-scheme`, expostos ao Tailwind via `@theme inline`.
- Fontes Geist e Geist Mono carregadas por `next/font/google` em `src/app/layout.tsx`.
- Helper `cn()` em `src/lib/utils.ts` para compor classes.
- Ainda não há componentes próprios nem escala de severidade definida.

Atenção: `globals.css` define `font-family: Arial` no `body`, sobrepondo a Geist. Isso veio do template do Next; revise ao criar a primeira tela real.

## Interação

Use HTML semântico, navegação por teclado, foco visível e contraste adequado. Dê nome a controles e campos. Erros de validação ficam junto do campo; operações assíncronas exibem espera e resultado. Respeite movimento reduzido.

Uma análise pode demorar: mostre o progresso por etapa (motor em execução), permita sair e voltar ao relatório e evite enviar o mesmo alvo duas vezes.

## Layout e revisão

- Mobile first; a página atual usa coluna única de largura máxima `max-w-2xl` com margem lateral de 16 px.
- Estados previstos para o relatório: análise em andamento, nenhum achado, achados por severidade e falha da análise com o motivo.
- Revisão de interface feita: nenhuma além da página provisória. Rodar a skill `web-design-guidelines` ao concluir a primeira tela.

## Manutenção

Mudanças visuais e de interação atualizam a fonte de tokens/componentes e esta orientação quando houver alteração de regra. Consulte as skills de UI instaladas nas revisões pertinentes.
