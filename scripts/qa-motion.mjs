import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "work", "qa-motion");
const base = process.env.QA_URL || "http://127.0.0.1:4175";
await fs.mkdir(output, { recursive: true });

const report = {
  generated: new Date().toISOString(),
  base,
  checks: [],
  errors: [],
  warnings: [],
  viewports: [],
  screenshots: [],
  videos: [],
};
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.QA_CHROME ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const contexts = new Set();
const check = (label, passed, detail) => {
  report.checks.push({ label, passed: !!passed, detail });
  if (!passed) console.log("FAIL", label, JSON.stringify(detail));
};

async function contextFor(viewport, options = {}) {
  const context = await browser.newContext({
    viewport,
    reducedMotion: "no-preference",
    ...options,
  });
  contexts.add(context);
  await context.addInitScript(() => {
    const trace = [];
    window.__kmzMotionTrace = trace;
    const started = performance.now();
    let last = -100;
    function matrixY(element) {
      if (!element) return null;
      const transform = getComputedStyle(element).transform;
      try {
        return transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
      } catch {
        return null;
      }
    }
    function sample(now) {
      if (now - last >= 30) {
        last = now;
        const intro = document.querySelector(".brand-intro");
        const panel = document.querySelector(".brand-intro__panel");
        const outline = document.querySelector(".brand-intro__outline");
        const fill = document.querySelector(".brand-intro__fill");
        const introStyle = intro ? getComputedStyle(intro) : null;
        trace.push({
          time: Math.round(now - started),
          state: document.documentElement?.dataset.intro || null,
          motion: document.documentElement?.dataset.motion || null,
          visible:
            !!introStyle &&
            introStyle.display !== "none" &&
            introStyle.visibility !== "hidden" &&
            Number(introStyle.opacity) > 0,
          panelY: matrixY(panel),
          outlineOpacity: outline ? getComputedStyle(outline).opacity : null,
          outlineClip: outline ? getComputedStyle(outline).clipPath : null,
          fillOpacity: fill ? getComputedStyle(fill).opacity : null,
          fillClip: fill ? getComputedStyle(fill).clipPath : null,
          scrollY,
        });
      }
      if (now - started < 9000) requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  return context;
}

async function pageFor(context) {
  const page = await context.newPage();
  page.on("pageerror", (error) =>
    report.errors.push({ url: page.url(), message: error.message }),
  );
  page.on("console", (message) => {
    if (message.type() === "error")
      report.errors.push({ url: page.url(), message: message.text() });
    else if (message.type() === "warning")
      report.warnings.push({ url: page.url(), message: message.text() });
  });
  return page;
}

async function goHome(page) {
  const response = await page.goto(base, { waitUntil: "domcontentloaded" });
  check("Homepage responde 200", response.status() === 200, response.status());
  await page.waitForFunction(
    () =>
      ["playing", "done", "disabled"].includes(
        document.documentElement.dataset.intro,
      ),
    null,
    { timeout: 6000 },
  );
}

async function done(page) {
  await page.waitForFunction(
    () => ["done", "disabled"].includes(document.documentElement.dataset.intro),
    null,
    { timeout: 7000 },
  );
  await page.waitForTimeout(350);
}

async function closeContext(context) {
  await context.close();
  contexts.delete(context);
}

async function screenshot(page, filename) {
  await page.screenshot({ path: path.join(output, filename) });
  report.screenshots.push(filename);
}

async function pageState(page) {
  return page.evaluate(() => ({
    intro: document.documentElement.dataset.intro,
    motion: document.documentElement.dataset.motion,
    width: innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    introVisible: (() => {
      const intro = document.querySelector(".brand-intro");
      if (!intro) return false;
      const style = getComputedStyle(intro);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number(style.opacity) > 0
      );
    })(),
    heading: document.querySelector("h1")?.textContent,
    headingLines: [...document.querySelectorAll(".hero-line > span")].map(
      (element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        let y = 0;
        try {
          y =
            style.transform === "none"
              ? 0
              : new DOMMatrixReadOnly(style.transform).m42;
        } catch {
          /* Captured as a nonzero failure below when applicable. */
        }
        return {
          text: element.textContent,
          opacity: style.opacity,
          visibility: style.visibility,
          y,
          left: rect.left,
          right: rect.right,
        };
      },
    ),
    cta: (() => {
      const cta = document.querySelector('.hero-buttons a[href="#projetos"]');
      if (!cta) return null;
      const style = getComputedStyle(cta);
      return {
        text: cta.textContent,
        opacity: style.opacity,
        visibility: style.visibility,
      };
    })(),
    pinnedWrappers: document.querySelectorAll(".pin-spacer").length,
  }));
}

async function responsiveChecks() {
  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    const viewport = { width, height: width <= 390 ? 844 : 1000 };
    const context = await contextFor(viewport);
    const page = await pageFor(context);
    await goHome(page);
    await done(page);
    const state = await pageState(page);
    const trace = await page.evaluate(() => window.__kmzMotionTrace);
    const visibleFrames = trace.filter((frame) => frame.visible);
    const yValues = visibleFrames
      .map((frame) => frame.panelY)
      .filter((value) => typeof value === "number");
    const yRange = yValues.length
      ? Math.max(...yValues) - Math.min(...yValues)
      : 0;
    check(
      `Intro é exibida em ${width}px`,
      visibleFrames.length > 2 &&
        trace.some((frame) => frame.state === "playing"),
      visibleFrames.slice(0, 3),
    );
    check(`Painel sobe em ${width}px`, yRange > viewport.height * 0.35, {
      yRange,
    });
    check(
      `Intro termina e libera conteúdo em ${width}px`,
      state.intro === "done" && !state.introVisible,
      state,
    );
    check(
      `Sem rolagem horizontal em ${width}px`,
      state.documentWidth <= width && state.bodyWidth <= width,
      state,
    );
    check(
      `Título e CTA legíveis em ${width}px`,
      !!state.heading &&
        state.headingLines.length === 3 &&
        state.headingLines.every(
          (line) =>
            Number(line.opacity) > 0.95 &&
            line.visibility !== "hidden" &&
            Math.abs(line.y) < 2 &&
            line.left > -2 &&
            line.right <= width + 2,
        ) &&
        !!state.cta &&
        Number(state.cta.opacity) > 0.95 &&
        state.cta.visibility !== "hidden",
      state,
    );
    check(
      `Scroll nativo sem pinning em ${width}px`,
      state.pinnedWrappers === 0,
      state.pinnedWrappers,
    );
    await page.mouse.wheel(0, 380);
    await page.waitForTimeout(500);
    check(
      `Scroll avança no ${width}px`,
      (await page.evaluate(() => scrollY)) > 0,
    );
    report.viewports.push({ width, height: viewport.height, state, trace });
    await closeContext(context);
    console.log("checked viewport", width);
  }
}

async function capturePhases() {
  for (const [label, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const context = await contextFor(viewport);
    const page = await pageFor(context);
    await goHome(page);
    await done(page);
    await page.locator(".intro-replay").click();
    await page.waitForFunction(
      () => document.documentElement.dataset.intro === "playing",
      null,
      { timeout: 2500 },
    );
    const started = Date.now();
    const phases = [];
    for (const offset of [100, 450, 900, 1200, 1600, 2300]) {
      const remaining = offset - (Date.now() - started);
      if (remaining > 0) await page.waitForTimeout(remaining);
      const filename = `${label}-${String(offset).padStart(4, "0")}ms.png`;
      await screenshot(page, filename);
      if (offset === 450 || offset === 900) {
        const box = await page.locator(".brand-intro__mark").boundingBox();
        const markName = `${label}-logo-${offset === 450 ? "outline" : "fill"}.png`;
        await page.screenshot({
          path: path.join(output, markName),
          clip: {
            x: Math.max(0, box.x - 10),
            y: Math.max(0, box.y - 10),
            width: box.width + 20,
            height: box.height + 20,
          },
        });
        report.screenshots.push(markName);
      }
      phases.push({
        offset,
        actualOffset: Date.now() - started,
        filename,
        state: await pageState(page),
      });
    }
    check(
      `Replay executa e conclui em ${label}`,
      (await pageState(page)).intro === "done",
    );
    report.viewports.find((item) => item.width === viewport.width).phases =
      phases;
    await closeContext(context);
  }
}

async function skipChecks() {
  for (const action of ["button", "escape", "wheel"]) {
    const context = await contextFor({ width: 390, height: 844 });
    const page = await pageFor(context);
    await goHome(page);
    await page.waitForFunction(
      () => document.documentElement.dataset.intro === "playing",
      null,
      { timeout: 3000 },
    );
    await page.waitForTimeout(150);
    if (action === "button") await page.locator(".intro-skip").click();
    else if (action === "escape") await page.keyboard.press("Escape");
    else await page.mouse.wheel(0, 350);
    await page.waitForTimeout(300);
    const state = await pageState(page);
    check(
      `Pular abertura funciona por ${action}`,
      state.intro === "done" && !state.introVisible,
      state,
    );
    if (action === "wheel")
      check(
        "Pular por scroll não bloqueia a rolagem",
        (await page.evaluate(() => scrollY)) > 0,
      );
    await closeContext(context);
  }
}

async function accessibilityChecks() {
  for (const mode of ["system", "manual", "no-js"]) {
    const options =
      mode === "system"
        ? { reducedMotion: "reduce" }
        : mode === "no-js"
          ? { javaScriptEnabled: false }
          : {};
    const context = await contextFor({ width: 390, height: 844 }, options);
    if (mode === "manual")
      await context.addInitScript(() =>
        localStorage.setItem("kmz-studio:reduced-motion", "true"),
      );
    const page = await pageFor(context);
    await page.goto(base, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const state = await pageState(page);
    const trace =
      mode === "no-js"
        ? []
        : await page.evaluate(() => window.__kmzMotionTrace);
    check(
      `Intro é dispensada em ${mode}`,
      !state.introVisible && !trace.some((frame) => frame.visible),
      state,
    );
    check(
      `Conteúdo permanece disponível em ${mode}`,
      !!state.heading &&
        !!state.cta &&
        state.headingLines.every(
          (line) => Number(line.opacity) > 0.95 && Math.abs(line.y) < 2,
        ),
      state,
    );
    if (mode !== "no-js")
      check(
        `Preferência reduzida aplicada em ${mode}`,
        state.motion === "reduced",
        state.motion,
      );
    await screenshot(page, `${mode}-mobile.png`);
    await closeContext(context);
  }
  const context = await contextFor({ width: 1440, height: 1000 });
  const page = await pageFor(context);
  await page.goto(`${base}/projetos/acquagyn`, { waitUntil: "networkidle" });
  check(
    "Case abre sem intro",
    (await page.locator(".brand-intro").count()) === 0 &&
      !(await pageState(page)).introVisible,
  );
  check(
    "Case mantém título próprio",
    (await page.locator("h1").innerText()).includes("Acquagyn"),
  );
  await closeContext(context);
}

async function recordMotion() {
  if (process.env.QA_NO_VIDEO === "1") return;
  for (const [label, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    let context;
    try {
      context = await contextFor(viewport, {
        recordVideo: { dir: output, size: viewport },
      });
      const page = await pageFor(context);
      const video = page.video();
      await goHome(page);
      await done(page);
      await page.waitForTimeout(200);
      for (let step = 0; step < 10; step++) {
        await page.mouse.wheel(0, viewport.height * 0.15);
        await page.waitForTimeout(140);
      }
      await page.waitForTimeout(600);
      await closeContext(context);
      context = undefined;
      const raw = await video.path();
      const filename = `kmz-intro-${label}.webm`;
      const target = path.join(output, filename);
      await fs.copyFile(raw, target);
      if (!path.relative(output, raw).startsWith("..") && raw !== target)
        await fs.unlink(raw);
      report.videos.push({ label, filename, viewport });
      console.log("recorded", label);
    } catch (error) {
      report.videos.push({ label, available: false, error: error.message });
      if (context) await closeContext(context);
    }
  }
}

async function saveReport() {
  const failures = report.checks.filter((item) => !item.passed);
  await fs.writeFile(
    path.join(output, "report.json"),
    JSON.stringify(report, null, 2),
  );
  const date = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(report.generated));
  const markdown = `# QA da abertura e movimento\n\nExecução: ${date} (São Paulo). Build local em ${base}.\n\n${report.checks.length - failures.length}/${report.checks.length} verificações passaram. ${failures.length} falhas.\n\n## Escopo\n\n- Chromium em 360, 390, 768, 1024, 1440 e 1920 px.\n- Trace desde antes do primeiro paint: presença da intro, painel subindo e liberação da página.\n- Título, CTA, overflow e scroll nativo.\n- Capturas desktop e celular em 100, 450, 900, 1200, 1600 e 2300 ms após replay.\n- Pular por botão, Escape e wheel; replay.\n- Movimento reduzido do sistema e preferência manual; página sem JavaScript; case sem intro.\n- Vídeos reais do navegador com abertura e scroll para os projetos.\n\n## Falhas\n\n${failures.length ? failures.map((item) => `- ${item.label}: ${JSON.stringify(item.detail)}`).join("\n") : "Nenhuma falha nas verificações executadas."}\n\n## Console\n\n${report.errors.length ? report.errors.map((item) => `- ${item.url}: ${item.message}`).join("\n") : "Nenhum erro de JavaScript ou hidratação."}\n\n${report.warnings.length ? report.warnings.map((item) => `- Aviso: ${item.message}`).join("\n") : "Nenhum aviso de navegador."}\n\n## Evidências\n\nCapturas, traces e gravações: \`work/qa-motion\`. As gravações mostram a interface real, sem geração ou modificação das telas dos projetos.\n\n${report.videos.map((video) => (video.available === false ? `- ${video.label}: gravação indisponível — ${video.error}` : `- ${video.filename}: ${video.viewport.width}×${video.viewport.height}`)).join("\n")}\n\nEste teste verifica comportamento local. Não afirma métricas de usuários reais nem valida envio de e-mail.\n`;
  await fs.writeFile(path.join(root, "docs", "QA-motion.md"), markdown);
  return failures;
}

try {
  if (process.env.QA_RECORD_ONLY === "1") {
    Object.assign(
      report,
      JSON.parse(await fs.readFile(path.join(output, "report.json"), "utf8")),
    );
    report.videos = [];
    await recordMotion();
  } else {
    await responsiveChecks();
    await capturePhases();
    await skipChecks();
    await accessibilityChecks();
    await recordMotion();
    check(
      "Nenhum erro de JavaScript/hidratação",
      report.errors.length === 0,
      report.errors,
    );
  }
  const failures = await saveReport();
  console.log(
    JSON.stringify({
      checks: report.checks.length,
      failed: failures.length,
      errors: report.errors.length,
      videos: report.videos,
      output,
    }),
  );
  if (failures.length) process.exitCode = 1;
} catch (error) {
  report.fatal = error.stack || error.message;
  check("Execução completa dos testes", false, error.message);
  await saveReport();
  console.error(error);
  process.exitCode = 1;
} finally {
  for (const context of contexts) await context.close().catch(() => {});
  await browser.close();
}
