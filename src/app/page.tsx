export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">VibeGuard</h1>
      <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        Testes de segurança para apps feitos com IA: encontra falhas, explica o risco em linguagem
        simples e entrega a correção pronta.
      </p>
      <p className="text-sm text-zinc-500">Em construção. O primeiro fluxo do MVP está descrito em PRODUCT.md.</p>
    </main>
  );
}
