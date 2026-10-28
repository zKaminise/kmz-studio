import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { build } from "vite";
import { resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";

process.env.NODE_ENV = "production";
const ssrDirectory = resolve("dist-ssr");
if (
  ssrDirectory !== resolve(process.cwd(), "dist-ssr") ||
  dirname(ssrDirectory) !== resolve(process.cwd())
)
  throw new Error("SSR output must remain inside the project directory.");
await build({
  build: {
    ssr: "src/entry-server.tsx",
    outDir: ssrDirectory,
    emptyOutDir: true,
  },
  ssr: { noExternal: ["gsap"] },
});

const { render, metadata, paths } = await import(
  pathToFileURL(resolve(ssrDirectory, "entry-server.js")).href
);
if (!Array.isArray(paths) || !paths.includes("/") || !paths.includes("/404"))
  throw new Error("SSR must export all public routes and /404.");
if (new Set(paths).size !== paths.length)
  throw new Error("SSR route list has duplicates.");
const template = await readFile("dist/index.html", "utf8");
const placeholder = '<div id="root"></div>';
if (!template.includes(placeholder))
  throw new Error("Missing root placeholder in the production template.");
const escaped = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
const json = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'))?.[2];
function setMeta(html, selector, key, value) {
  let matches = 0;
  const result = html.replace(/<meta\b[^>]*>/gi, (tag) => {
    if (attribute(tag, selector) !== key) return tag;
    matches += 1;
    return `<meta ${selector}="${key}" content="${escaped(value)}" />`;
  });
  if (matches !== 1) throw new Error(`Expected exactly one meta ${selector}="${key}" in the template.`);
  return result;
}
function setCanonical(html, value) {
  let matches = 0;
  const result = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (attribute(tag, 'rel') !== 'canonical') return tag;
    matches += 1;
    return `<link rel="canonical" href="${escaped(value)}" />`;
  });
  if (matches !== 1) throw new Error('Expected exactly one canonical link in the template.');
  return result;
}
const sitemapEntries = [];

for (const route of paths) {
  if (!/^\/(?:[a-z0-9-]+\/)*[a-z0-9-]*$/.test(route))
    throw new Error(`Unsafe route: ${route}`);
  const info = metadata(route);
  if (
    !info.title ||
    !info.description ||
    !info.canonical ||
    new URL(info.canonical).origin !== "https://kmzstudio.com.br"
  )
    throw new Error(`Incomplete metadata for ${route}`);
  const content = render(route);
  if (!content || !content.includes("<h1"))
    throw new Error(`Missing rendered heading for ${route}`);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://kmzstudio.com.br/#organization",
        name: "KMZ Studio",
        url: "https://kmzstudio.com.br",
        logo: "https://kmzstudio.com.br/images/brand/logo-horizontal.webp",
        sameAs: ["https://www.instagram.com/kmzstudio_/"],
        areaServed: { "@type": "Country", name: "Brasil" },
      },
      {
        "@type": "WebSite",
        "@id": "https://kmzstudio.com.br/#website",
        name: "KMZ Studio",
        url: "https://kmzstudio.com.br",
        inLanguage: "pt-BR",
        publisher: { "@id": "https://kmzstudio.com.br/#organization" },
      },
      {
        "@type": "WebPage",
        name: info.title,
        description: info.description,
        url: info.canonical,
        inLanguage: "pt-BR",
        isPartOf: { "@id": "https://kmzstudio.com.br/#website" },
      },
    ],
  };
  let html = template
    .replace(placeholder, () => `<div id="root">${content}</div>`)
    .replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${escaped(info.title)}</title>`,
    )
    .replace(
      "<!--kmz:structured-data-->",
      () =>
        `<script type="application/ld+json">${json(structuredData)}</script>`,
    );
  html = setCanonical(html, info.canonical);
  html = setMeta(html, 'name', 'description', info.description);
  html = setMeta(html, 'property', 'og:title', info.title);
  html = setMeta(html, 'property', 'og:description', info.description);
  html = setMeta(html, 'property', 'og:url', info.canonical);
  html = setMeta(html, 'name', 'twitter:title', info.title);
  html = setMeta(html, 'name', 'twitter:description', info.description);
  if (info.notFound || route === "/404")
    html = html.replace(
      "</head>",
      '<meta name="robots" content="noindex, follow" /></head>',
    );
  const output =
    route === "/404"
      ? "dist/404.html"
      : route === "/"
        ? "dist/index.html"
        : `dist${route}/index.html`;
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html);
  if (!info.notFound && route !== "/404") sitemapEntries.push(info.canonical);
}

await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.map((url) => `  <url><loc>${escaped(url)}</loc></url>`).join("\n")}\n</urlset>\n`,
);
await writeFile(
  "dist/robots.txt",
  "User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://kmzstudio.com.br/sitemap.xml\n",
);
await rm(ssrDirectory, { recursive: true, force: true });
console.log(
  `Prerendered ${paths.length} pages; sitemap contains ${sitemapEntries.length} URLs.`,
);
