import { expect, it } from "vitest";
import { maskSecret } from "./mask";

it("mantém só prefixo e sufixo e descarta o meio", () => {
  const masked = maskSecret("sk_live_ABCDEFGHIJKLMNOP");
  expect(masked).toBe("sk_l…OP");
  expect(masked).not.toContain("ABCDEFGHIJKLMN");
});

it("mascara por completo trechos curtos sem revelar o valor", () => {
  const masked = maskSecret("abcdef");
  expect(masked).toBe("••••••");
  expect(masked).not.toContain("a");
});

it("respeita prefixo e sufixo configuráveis", () => {
  expect(maskSecret("0123456789", 2, 3)).toBe("01…789");
});

it("rejeita tamanhos negativos", () => {
  expect(() => maskSecret("segredo", -1, 2)).toThrow();
});
