import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { createContactService } from "../api/contact.mjs";

const require = createRequire(import.meta.url);
const playwright = require("playwright");
const { chromium, firefox, webkit } = playwright;
const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "work/qa");
await fs.mkdir(output, { recursive: true });
const base = process.env.QA_URL || "http://127.0.0.1:4173";
const slugs = [
  "acquagyn",
  "alcar-huma",
  "brasa",
  "salon-2-beaute",
  "bkm-tcg",
  "odontologia-fl",
  "leandro-kaminise",
  "clube-das-zizas",
  "saldanha-moveis",
  "ecos-da-alma",
];
const paths = [
  "/",
  "/projetos",
  ...slugs.map((s) => `/projetos/${s}`),
  "/servicos",
  "/sobre",
  "/contato",
  "/privacidade",
  "/pagina-inexistente",
];
const report = {
  generated: new Date().toISOString(),
  base,
  checks: [],
  errors: [],
  warnings: [],
  routes: [],
  screenshots: [],
  browsers: [],
};
function check(label, pass, detail) {
  report.checks.push({ label, pass: !!pass, detail });
  if (!pass) console.log("FAIL", label, JSON.stringify(detail));
}
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.QA_CHROME ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
process.on("uncaughtException", async (error) => {
  report.fatal = error.message;
  await fs.writeFile(
    path.join(output, "report-partial.json"),
    JSON.stringify(report, null, 2),
  );
  console.error(error);
  await browser.close();
  process.exit(1);
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
page.on("pageerror", (error) =>
  report.errors.push({ route: page.url(), error: error.message }),
);
page.on("console", (msg) => {
  if (msg.type() === "error")
    report.errors.push({ route: page.url(), error: msg.text() });
  else if (msg.type() === "warning")
    report.warnings.push({ route: page.url(), warning: msg.text() });
});
async function go(route) {
  const response = await page.goto(base + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(route === "/" ? 1300 : 150);
  return response;
}
async function scrollAll() {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (
      let y = 0;
      y < document.documentElement.scrollHeight;
      y += window.innerHeight * 0.8
    ) {
      window.scrollTo({ top: y, behavior: "instant" });
      await sleep(80);
    }
  });
  await page.waitForTimeout(1000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(700);
}
async function layout() {
  return page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    height: document.documentElement.scrollHeight,
    overflow: [...document.querySelectorAll("main *")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > innerWidth + 2 || r.left < -2);
      })
      .slice(0, 8)
      .map((el) => ({
        tag: el.tagName,
        class: el.className,
        text: el.textContent.slice(0, 70),
        rect: {
          left: el.getBoundingClientRect().left,
          right: el.getBoundingClientRect().right,
        },
      })),
    images: [...document.images].map((img) => ({
      src: img.currentSrc || img.src,
      loaded: img.complete && img.naturalWidth > 0,
      natural: [img.naturalWidth, img.naturalHeight],
      rendered: [img.width, img.height],
      alt: img.alt,
    })),
  }));
}
async function shot(filename, opts = {}) {
  await page.screenshot({ path: path.join(output, filename), ...opts });
  report.screenshots.push(filename);
}

for (const width of [360, 390, 768, 1024, 1440, 1920]) {
  await page.setViewportSize({ width, height: 1000 });
  await go("/");
  await scrollAll();
  const stats = await layout();
  check(
    `Homepage sem overflow em ${width}px`,
    stats.scrollWidth <= width && stats.bodyWidth <= width,
    stats,
  );
  check(
    `Imagens da homepage carregadas em ${width}px`,
    stats.images.every((img) => img.loaded),
    stats.images.filter((img) => !img.loaded),
  );
  report.routes.push({ route: "/", width, ...stats });
  if (width === 390) {
    await shot("home-mobile390.png");
    await shot("home-mobile390-full.png", { fullPage: true });
  }
  if (width === 1440) {
    await shot("home-desktop1440.png");
    await shot("home-desktop1440-full.png", { fullPage: true });
    await page
      .locator(".selected-grid")
      .screenshot({ path: path.join(output, "projects-desktop1440.png") });
    report.screenshots.push("projects-desktop1440.png");
  }
}
for (const route of paths.filter((p) => p !== "/")) {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const response = await go(route);
    await scrollAll();
    const stats = await layout();
    const meta = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      robots: document.querySelector('meta[name="robots"]')?.content,
      h1: document.querySelectorAll("h1").length,
      text: document.querySelector("h1")?.textContent,
    }));
    check(
      `${route} sem overflow em ${width}px`,
      stats.scrollWidth <= width && stats.bodyWidth <= width,
      stats.overflow,
    );
    check(
      `${route} imagens carregadas em ${width}px`,
      stats.images.every((i) => i.loaded),
      stats.images.filter((i) => !i.loaded),
    );
    check(
      `${route} H1 e metadados em ${width}px`,
      meta.h1 === 1 && !!meta.title && !!meta.description && !!meta.canonical,
      meta,
    );
    if (route !== "/pagina-inexistente")
      check(
        `${route} canonical correto em ${width}px`,
        meta.canonical.replace(/\/$/, "") ===
          "https://kmzstudio.com.br" + route,
        meta.canonical,
      );
    else
      check(
        "URL inexistente retorna404 e noindex",
        response.status() === 404 && /noindex/.test(meta.robots),
        { status: response.status(), robots: meta.robots },
      );
    report.routes.push({
      route,
      width,
      status: response.status(),
      meta,
      ...stats,
    });
    console.log("checked", route, width);
    if (
      width === 1440 &&
      [
        "/projetos/acquagyn",
        "/projetos/bkm-tcg",
        "/servicos",
        "/contato",
      ].includes(route)
    )
      await shot(route.slice(1).replaceAll("/", "-") + "-desktop1440.png");
    if (width === 390 && ["/projetos/acquagyn", "/contato"].includes(route))
      await shot(route.slice(1).replaceAll("/", "-") + "-mobile390.png");
  }
}

await page.setViewportSize({ width: 390, height: 844 });
await go("/");
const menu = page.locator(".menu-toggle");
await menu.focus();
await page.keyboard.press("Enter");
check(
  "Menu abre por Enter e informa expanded",
  (await menu.getAttribute("aria-expanded")) === "true" &&
    (await page
      .getByRole("navigation", { name: "Principal", exact: true })
      .isVisible()),
);
await page.keyboard.press("Tab");
const menuFocus = await page.evaluate(() => ({
  tag: document.activeElement.tagName,
  text: document.activeElement.textContent,
}));
check("Menu tem navegação por Tab", menuFocus.tag === "A", menuFocus);
await page.keyboard.press("Escape");
check(
  "Menu fecha por Escape e devolve foco",
  (await menu.getAttribute("aria-expanded")) === "false" &&
    (await menu.evaluate((el) => el === document.activeElement)),
);
const summary = page.locator("details summary").first();
await summary.focus();
await page.keyboard.press("Enter");
check(
  "FAQ abre por teclado",
  (await page.locator("details").first().getAttribute("open")) !== null,
);
await page.keyboard.press("Enter");
check(
  "FAQ fecha por teclado",
  (await page.locator("details").first().getAttribute("open")) === null,
);

await page.setViewportSize({ width: 1440, height: 1000 });
await go("/projetos");
const filterResults = [];
for (const [label, count] of [
  ["Todos os projetos", 10],
  ["Site institucional", 4],
  ["Landing page", 4],
  ["E-commerce", 1],
  ["Site + sistema", 1],
]) {
  const button = page.getByRole("button", {
    name: new RegExp("^" + label.replace(/[+]/g, "\\+")),
  });
  await button.click();
  await page.waitForTimeout(150);
  const actual = await page.locator(".portfolio-grid .project-card").count();
  check(`Filtro ${label}`, actual === count, { expected: count, actual });
  filterResults.push({ label, actual });
}

await go(
  "/contato?servico=sistemas-web&utm_source=qa-local&utm_medium=test&utm_campaign=verificacao",
);
const contacts = await page
  .locator(".contact-channels a")
  .evaluateAll((links) =>
    links.map((a) => ({ href: a.href, text: a.textContent })),
  );
check(
  "WhatsApp usa número autorizado",
  contacts.some((a) => a.href.startsWith("https://wa.me/5534998275292")),
  contacts,
);
check(
  "E-mail usa endereço autorizado",
  contacts.some((a) => a.href === "mailto:gabriel.misao08@gmail.com"),
  contacts,
);
check(
  "Serviço contextual preenche formulário",
  (await page.locator('select[name="service"]').inputValue()) ===
    "Sistemas web",
);
const submit = page.getByRole("button", {
  name: "Enviar solicitação",
  exact: true,
});
await submit.click();
check(
  "Formulário vazio permanece inválido",
  (await page.locator("form").evaluate((f) => !f.checkValidity())) &&
    (await page.locator(".form-status").textContent()) === "",
);
await page.locator('[name="name"]').fill("Teste QA Local");
await page.locator('[name="email"]').fill("qa@example.invalid");
await page.locator('[name="phone"]').fill("(34) 99999-0000");
await page.locator('[name="service"]').selectOption({ label: "Sistemas web" });
await page
  .locator('[name="message"]')
  .fill("Solicitação técnica isolada, sem envio de e-mail real.");
await page.locator('[name="consent"]').check();
const safeHandler = createContactService({
  env: {},
  fetchImpl: () => {
    throw new Error("Real network delivery is forbidden in QA");
  },
});
let captured;
let safeStatus;
await page.route("**/api/contact", async (route) => {
  captured = route.request().postDataJSON();
  const result = await safeHandler({
    method: "POST",
    headers: route.request().headers(),
    body: captured,
    ip: "isolated-browser-qa",
  });
  safeStatus = result.status;
  await route.fulfill({
    status: result.status,
    contentType: "application/json",
    body: JSON.stringify(result.body),
  });
});
await page.waitForTimeout(1700);
await submit.click();
await page.locator(".form-status.error").waitFor();
check(
  "Backend sem credenciais retorna503 sem enviar e-mail",
  safeStatus === 503,
  { status: safeStatus },
);
check(
  "Erro sem credenciais mantém dados",
  (await page.locator('[name="name"]').inputValue()) === "Teste QA Local" &&
    (await page.locator('[name="message"]').inputValue()) ===
      "Solicitação técnica isolada, sem envio de e-mail real.",
  await page.locator(".form-status").textContent(),
);
check(
  "Erro oferece alternativas reais",
  (await page.locator(".form-alternatives a").count()) === 2,
);
check(
  "Payload captura origem e consentimento",
  captured.utm.source === "qa-local" && captured.consent === true,
  captured,
);
await shot("contato-error-no-credentials.png");
await page.unroute("**/api/contact");
await page.route("**/api/contact", async (route) => {
  await new Promise((r) => setTimeout(r, 300));
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true, id: "mock-browser-only-not-email" }),
  });
});
await submit.click();
check(
  "Formulário informa carregamento",
  await page.getByRole("button", { name: "Enviando…" }).isDisabled(),
);
await page.locator(".form-status.success").waitFor();
check(
  "Sucesso simulado limpa nome e mensagem",
  (await page.locator('[name="name"]').inputValue()) === "" &&
    (await page.locator('[name="message"]').inputValue()) === "",
);
await shot("contato-mocked-success.png");

const reducedContext = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const rp = await reducedContext.newPage();
await rp.goto(base, { waitUntil: "networkidle" });
await rp.waitForTimeout(600);
const before = await rp
  .locator(".hero-art-front")
  .evaluate((el) => getComputedStyle(el).transform);
await rp.evaluate(() => window.scrollTo(0, 500));
await rp.waitForTimeout(300);
const after = await rp
  .locator(".hero-art-front")
  .evaluate((el) => getComputedStyle(el).transform);
check(
  "Movimento reduzido respeita sistema",
  (await rp.locator("html").getAttribute("data-motion")) === "reduced",
);
check("Movimento reduzido desliga transformação por scroll", before === after, {
  before,
  after,
});
const reducedContent = await rp
  .locator("h1,.hero-description,.hero-buttons")
  .evaluateAll((els) =>
    els.map((el) => ({
      text: el.textContent,
      opacity: getComputedStyle(el).opacity,
      visibility: getComputedStyle(el).visibility,
    })),
  );
check(
  "Movimento reduzido mantém conteúdo visível",
  reducedContent.every(
    (el) => Number(el.opacity) > 0 && el.visibility !== "hidden",
  ),
  reducedContent,
);
await rp.screenshot({ path: path.join(output, "home-reduced-motion.png") });
report.screenshots.push("home-reduced-motion.png");
await reducedContext.close();
await go("/");
await page.locator(".motion-toggle").click();
check(
  "Alternância manual reduz movimentos",
  (await page.locator("html").getAttribute("data-motion")) === "reduced",
);
await page.reload({ waitUntil: "networkidle" });
check(
  "Preferência manual persiste",
  (await page.locator("html").getAttribute("data-motion")) === "reduced",
);
await context.close();
await browser.close();
for (const [name, engine] of [
  ["firefox", firefox],
  ["webkit", webkit],
]) {
  try {
    const b = await engine.launch({
      headless: true,
      executablePath:
        process.env[name === "firefox" ? "QA_FIREFOX" : "QA_WEBKIT"],
    });
    const p = await b.newPage({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    let browserErrors = [];
    p.on("pageerror", (e) => browserErrors.push(e.message));
    await p.goto(base, { waitUntil: "networkidle" });
    await p.waitForTimeout(500);
    const state = await p.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      width: innerWidth,
      h1: document.querySelector("h1")?.textContent,
      images: [...document.images]
        .filter((i) => i.loading !== "lazy")
        .map((i) => ({
          src: i.currentSrc,
          loaded: i.complete && i.naturalWidth > 0,
        })),
    }));
    check(
      `${name} smoke home390`,
      state.scroll <= state.width &&
        !!state.h1 &&
        state.images.every((i) => i.loaded) &&
        !browserErrors.length,
      { state, browserErrors },
    );
    await p.goto(base + "/contato", { waitUntil: "networkidle" });
    check(`${name} smoke contato`, (await p.locator("form").count()) === 1);
    report.browsers.push({
      name,
      available: true,
      state,
      errors: browserErrors,
    });
    await b.close();
  } catch (error) {
    report.browsers.push({ name, available: false, error: error.message });
  }
}
check(
  "Nenhum erro JavaScript/hidratação inesperado",
  report.errors.filter(
    (e) => !/Failed to load resource.*(?:503|404)/.test(e.error),
  ).length === 0,
  report.errors,
);
await fs.writeFile(
  path.join(output, "report.json"),
  JSON.stringify(report, null, 2),
);
const failed = report.checks.filter((c) => !c.pass);
let markdown = `# QA de navegador\n\nExecução local: ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "medium", timeZone: "America/Sao_Paulo" }).format(new Date(report.generated))} (São Paulo). URL: ${base}.\n\n${report.checks.length - failed.length}/${report.checks.length} verificações passaram. ${failed.length} falhas.\n\n## Escopo\n\n- Chromium: homepage em 360,390,768,1024,1440 e1920px; outras16 rotas em390 e1440px.\n- Dez cases, portfólio e filtros, serviços, sobre, contato, privacidade e404.\n- Menu por teclado/Escape, FAQ por teclado, links de contato, imagens e metadados.\n- Formulário: validação nativa, erro usando handler real com ambiente vazio e transport bloqueado, preservação dos dados e alternativas. Sucesso e loading com resposta de rede simulada. Nenhum e-mail real foi enviado.\n- Movimento reduzido por sistema e preferência manual persistida.\n- Smoke Firefox/WebKit quando executáveis disponíveis.\n\n## Falhas\n\n${failed.length ? failed.map((c) => `- ${c.label}: ${JSON.stringify(c.detail)}`).join("\n") : "Nenhuma falha nas verificações automatizadas."}\n\n## Erros de navegador\n\n${report.errors.length ? report.errors.map((e) => `- ${e.route}: ${e.error}`).join("\n") : "Nenhum."}\n\n## Avisos de navegador\n\n${[...new Set(report.warnings.map((w) => w.warning))].map((w) => `- ${w}`).join("\n") || "Nenhum."}\n\n## Outros navegadores\n\n${report.browsers.map((b) => `- ${b.name}: ${b.available ? "executado" : "indisponível — " + b.error}`).join("\n")}\n\n## Evidência\n\nCapturas e relatório JSON: work/qa/. Os testes não medem Core Web Vitals de produção nem validam entrega de e-mail real.\n`;
await fs.writeFile(path.join(root, "docs/QA-browser.md"), markdown);
console.log(
  JSON.stringify({
    checks: report.checks.length,
    failed: failed.length,
    errors: report.errors.length,
    warnings: report.warnings.length,
    browsers: report.browsers.map((b) => ({
      name: b.name,
      available: b.available,
    })),
    output,
  }),
);
process.exitCode = failed.length ? 1 : 0;
