import { describe, expect, it } from "vitest";
import { auditContent, auditFiles } from "./audit";

describe("deteções positivas", () => {
  const CASES: Record<string, string> = {
    "react-dangerous-html": "<div dangerouslySetInnerHTML={{ __html: userInput }} />",
    "dom-innerhtml": "el.innerHTML = userInput;",
    "eval-usage": "const r = eval(userCode);",
    "child-process-exec": "execSync(`rm -rf ${dir}`);",
    "sql-string-concat": 'db.query("SELECT * FROM users WHERE id = " + id);',
    "tls-verification-off": "const agent = new https.Agent({ rejectUnauthorized: false });",
    "cors-wildcard": 'res.setHeader("Access-Control-Allow-Origin", "*");',
    "public-secret-var": "NEXT_PUBLIC_API_SECRET=abc123",
    "insecure-cookie": 'res.cookie("sid", id, { httpOnly: false });',
    "ssrf-user-url": "const r = await fetch(req.query.url);",
    "path-traversal": "fs.readFile(req.query.file, cb);",
    "weak-hash": 'crypto.createHash("md5").update(senha);',
    "insecure-random-token": "const token = Math.random().toString(36).slice(2);",
    "jwt-hardcoded-secret": 'jwt.sign(payload, "meusegredo123");',
    "jwt-none-algorithm": 'jwt.verify(t, k, { algorithms: ["none"] });',
    "open-redirect": "res.redirect(req.query.next);",
    "debug-mode-on": "app.run(debug=True)",
    "idor-read-by-user-id": "const pedido = await prisma.pedido.findUnique({ where: { id: req.params.id } });",
    "mass-assignment": "await prisma.user.create(req.body);",
    "client-controlled-role": 'if (req.body.role === "admin") { liberar(); }',
  };

  for (const [ruleId, line] of Object.entries(CASES)) {
    it(`detecta ${ruleId}`, () => {
      const findings = auditContent("app.ts", line);
      const match = findings.find((f) => f.ruleId === ruleId);
      expect(match, `esperava um achado para ${ruleId}`).toBeDefined();
      expect(match?.line).toBe(1);
      expect(match?.evidence.length).toBeGreaterThan(0);
      expect(match?.category).toBeTruthy();
    });
  }
});

describe("não acusa código seguro", () => {
  const SAFE = [
    "const el = document.getElementById('x'); el.textContent = userInput;",
    'db.query("SELECT * FROM users WHERE id = $1", [id]);',
    "const agent = new https.Agent({ rejectUnauthorized: true });",
    'res.setHeader("Access-Control-Allow-Origin", "https://meusite.com");',
    "const NEXT_PUBLIC_API_URL = 'https://api.exemplo.com';",
    "const total = preco + frete;",
    'res.cookie("sid", id, { httpOnly: true, secure: true, sameSite: "lax" });',
    'const r = await fetch("https://api.exemplo.com/dados");',
    'fs.readFile("./config.json", cb);',
    'crypto.createHash("sha256").update(x);',
    "const id = crypto.randomUUID();",
    "jwt.sign(payload, process.env.JWT_SECRET);",
    'jwt.verify(t, k, { algorithms: ["HS256"] });',
    'res.redirect("/painel");',
    "DEBUG = False",
    "const pedido = await prisma.pedido.findUnique({ where: { id: session.userId } });",
    "await prisma.user.create({ nome: req.body.nome, email: req.body.email });",
    "const papel = usuario.role;",
  ];
  for (const line of SAFE) {
    it(`ignora: ${line.slice(0, 40)}…`, () => {
      expect(auditContent("safe.ts", line)).toEqual([]);
    });
  }
});

it("trunca evidências muito longas", () => {
  const longo = `el.innerHTML = "${"a".repeat(500)}";`;
  const match = auditContent("x.ts", longo)[0];
  expect(match?.evidence.endsWith("…")).toBe(true);
  expect(match?.evidence.length).toBeLessThanOrEqual(161);
});

it("auditFiles agrega achados com o caminho de cada arquivo", () => {
  const findings = auditFiles([
    { path: "a.ts", content: "const r = eval(x);" },
    { path: "b.ts", content: "const ok = 1;" },
  ]);
  expect(findings).toHaveLength(1);
  expect(findings[0]?.file).toBe("a.ts");
});
