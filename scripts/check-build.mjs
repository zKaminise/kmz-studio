import { readFile, readdir, access } from "node:fs/promises";
import { resolve, join, relative } from "node:path";

const root = resolve("dist");
const files = [];
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = join(directory, entry.name);
    if (entry.isDirectory()) await scan(target);
    else files.push(target);
  }
}
await scan(root);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const failures = [];
const titles = new Set();
const descriptions = new Set();
const canonicalUrls = new Set();
const requiredRoutes = [
  "/",
  "/projetos",
  "/servicos",
  "/sobre",
  "/contato",
  "/privacidade",
];
const decode = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
const attribute = (tag = '', name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'))?.[2];
const findTag = (html, element, selector, value) => [...html.matchAll(new RegExp(`<${element}\\b[^>]*>`, 'gi'))].map(match => match[0]).find(tag => attribute(tag, selector) === value);
const metaContent = (html, selector, value) => attribute(findTag(html, 'meta', selector, value), 'content');
const exists = async (target) => {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
};
const routeFile = (pathname) =>
  pathname === "/"
    ? join(root, "index.html")
    : join(root, pathname.replace(/^\//, ""), "index.html");
for (const route of requiredRoutes) {
  if (!(await exists(routeFile(route))))
    failures.push(`Missing route ${route}`);
}
if (!(await exists(join(root, "404.html")))) failures.push("Missing 404.html");
if (
  htmlFiles.filter((file) =>
    relative(root, file).replaceAll("\\", "/").startsWith("projetos/"),
  ).length !== 11
)
  failures.push("Expected project index and 10 case pages.");

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const name = relative(root, file);
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  const description = metaContent(html, 'name', 'description');
  const canonical = attribute(findTag(html, 'link', 'rel', 'canonical'), 'href');
  if (!title || !description || !canonical)
    failures.push(`${name}: incomplete page metadata.`);
  if (title && titles.has(title)) failures.push(`${name}: duplicate title.`);
  if (title) titles.add(title);
  if (description && descriptions.has(description)) failures.push(`${name}: duplicate description.`);
  if (description) descriptions.add(description);
  if (canonical) {
    try {
      if (new URL(canonical).origin !== "https://kmzstudio.com.br")
        failures.push(`${name}: incorrect canonical domain.`);
    } catch {
      failures.push(`${name}: invalid canonical URL.`);
    }
  }
  if (canonical && !file.endsWith(`${join("404.html")}`)) {
    if (canonicalUrls.has(canonical))
      failures.push(`${name}: duplicate canonical.`);
    canonicalUrls.add(canonical);
  }
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1)
    failures.push(`${name}: expected exactly one h1.`);
  if (!html.includes("application/ld+json") || !metaContent(html, 'property', 'og:title'))
    failures.push(`${name}: missing structured data or Open Graph.`);
  if (metaContent(html, 'property', 'og:title') !== title || metaContent(html, 'name', 'twitter:title') !== title) failures.push(`${name}: social title differs from the page title.`);
  if (metaContent(html, 'property', 'og:description') !== description || metaContent(html, 'name', 'twitter:description') !== description) failures.push(`${name}: social description differs from the page description.`);
  if (metaContent(html, 'property', 'og:url') !== canonical) failures.push(`${name}: Open Graph URL differs from canonical.`);
  if (
    /gabrielmisao\.com\.br|gabrielmisao\.dev|gabriel-misao-portfolio|Olá Gabriel!|STANZZA|Lightweight/i.test(
      html,
    )
  )
    failures.push(`${name}: previous brand or unrelated reference is public.`);
  for (const match of html.matchAll(/<(?:img|source)\b[^>]*>/g)) {
    const tag = match[0];
    if (tag.startsWith("<img") && !/\balt="[^"]*"/.test(tag))
      failures.push(`${name}: image missing alt attribute.`);
    const sources = [
      ...tag.matchAll(/\b(?:src|srcSet|srcset)="([^"]+)"/g),
    ].flatMap((attribute) =>
      decode(attribute[1])
        .split(",")
        .map((item) => item.trim().split(/\s/)[0]),
    );
    for (const source of sources) {
      if (!source.startsWith("/")) continue;
      const target = resolve(root, source.split("?")[0].replace(/^\//, ""));
      if (!target.startsWith(`${root}\\`) && !target.startsWith(`${root}/`)) {
        failures.push(`${name}: image escapes output directory.`);
        continue;
      }
      if (!(await exists(target)))
        failures.push(`${name}: missing image ${source}`);
    }
  }
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"[^>]*>/g)) {
    const tag = match[0];
    const href = decode(match[1]);
    if (
      /target="_blank"/.test(tag) &&
      (!/rel="[^"]*noopener/.test(tag) || !/rel="[^"]*noreferrer/.test(tag))
    )
      failures.push(`${name}: external link lacks safe rel attribute.`);
    if (
      !href.startsWith("/") ||
      href.startsWith("//") ||
      href.startsWith("/api/")
    )
      continue;
    const url = new URL(href, "https://kmzstudio.com.br");
    const pathname = decodeURIComponent(url.pathname).replace(/\/$/, "") || "/";
    const target = routeFile(pathname);
    if (
      !(await exists(target)) &&
      !(await exists(join(root, pathname.replace(/^\//, ""))))
    )
      failures.push(`${name}: broken internal link ${href}`);
    if (url.hash && (await exists(target))) {
      const targetHtml =
        target === file ? html : await readFile(target, "utf8");
      const id = decodeURIComponent(url.hash.slice(1));
      if (!targetHtml.includes(`id="${id}"`))
        failures.push(`${name}: missing anchor ${href}`);
    }
  }
}
const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
for (const canonical of canonicalUrls)
  if (!sitemap.includes(canonical))
    failures.push(`Canonical absent from sitemap: ${canonical}`);
if (sitemap.includes("/404")) failures.push("404 page must not be in sitemap.");
for (const asset of [
  "favicon.ico",
  "favicon.png",
  "apple-touch-icon.png",
  "og-image.png",
  "robots.txt",
])
  if (!(await exists(join(root, asset)))) failures.push(`Missing ${asset}`);
if (failures.length) {
  console.error([...new Set(failures)].join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Build verified: ${htmlFiles.length} HTML pages, 10 cases, local images, internal links, unique SEO metadata and sitemap.`,
  );
