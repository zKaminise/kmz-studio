import { Buffer } from "node:buffer";

const MAX_BODY_BYTES = 16 * 1024;
const CONTACT_SERVICES = new Set([
  "Landing page",
  "Landing pages",
  "Site institucional",
  "Sites institucionais",
  "Loja virtual",
  "Lojas virtuais",
  "Sistema web",
  "Sistemas web",
  "Ainda não sei",
  "landing-page",
  "landing-pages",
  "site-institucional",
  "sites-institucionais",
  "loja-virtual",
  "lojas-virtuais",
  "sistema-web",
  "sistemas-web",
  "outro",
]);
const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const clean = (value) => (typeof value === "string" ? value.trim() : "");
const jsonResult = (status, body, extraHeaders = {}) => ({
  status,
  body,
  headers: {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders,
  },
});

function header(headers, name) {
  if (typeof headers?.get === "function") return headers.get(name) || "";
  const value = headers?.[name] ?? headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value || "";
}

/** Basic per-instance protection. A shared WAF limit is required for a distributed deployment. */
export function createRateLimiter({
  limit = 5,
  windowMs = 15 * 60 * 1000,
  maxEntries = 10_000,
} = {}) {
  const entries = new Map();
  return (key, timestamp) => {
    for (const [storedKey, value] of entries) {
      if (value.resetAt <= timestamp) entries.delete(storedKey);
    }
    const current = entries.get(key);
    if (current && current.count >= limit) {
      return {
        allowed: false,
        retryAfter: Math.max(
          1,
          Math.ceil((current.resetAt - timestamp) / 1000),
        ),
      };
    }
    if (current) current.count += 1;
    else {
      if (entries.size >= maxEntries) return { allowed: false, retryAfter: 60 };
      entries.set(key, { count: 1, resetAt: timestamp + windowMs });
    }
    return { allowed: true };
  };
}

function allowedOrigins(env) {
  const origins = new Set();
  try {
    origins.add(new URL(env.SITE_URL || "https://kmzstudio.com.br").origin);
  } catch {
    /* Invalid configuration fails closed. */
  }
  if (origins.has("https://kmzstudio.com.br"))
    origins.add("https://www.kmzstudio.com.br");
  if (["preview", "production"].includes(env.VERCEL_ENV)) {
    const hosts = [env.VERCEL_URL];
    if (env.VERCEL_ENV === "production")
      hosts.push(env.VERCEL_PROJECT_PRODUCTION_URL);
    for (const host of hosts) {
      if (typeof host !== "string" || !/^[a-z0-9-]+\.vercel\.app$/i.test(host))
        continue;
      origins.add(`https://${host.toLowerCase()}`);
    }
  }
  return origins;
}

function isAllowedOrigin(origin, env) {
  if (allowedOrigins(env).has(origin)) return true;
  if (env.NODE_ENV === "production") return false;
  try {
    const url = new URL(origin);
    return (
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    );
  } catch {
    return false;
  }
}

function parseBody(body) {
  try {
    const serialized =
      typeof body === "string" || Buffer.isBuffer(body)
        ? body.toString()
        : JSON.stringify(body);
    if (!serialized || Buffer.byteLength(serialized, "utf8") > MAX_BODY_BYTES)
      return { error: 413 };
    const parsed = JSON.parse(serialized);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return { error: 400 };
    return { data: parsed };
  } catch {
    return { error: 400 };
  }
}

/** The injected transport makes verification possible without sending any real message. */
export function createContactService({
  env = process.env,
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
  rateLimit = createRateLimiter(),
} = {}) {
  return async function handleContact({
    method,
    headers = {},
    body,
    ip = "unknown",
  }) {
    if (method !== "POST")
      return jsonResult(
        405,
        { ok: false, message: "Use o formulário para enviar sua solicitação." },
        { Allow: "POST" },
      );
    if (!isAllowedOrigin(header(headers, "origin"), env))
      return jsonResult(403, {
        ok: false,
        message: "Abra o formulário no site da KMZ Studio para enviar.",
      });
    if (
      !/^application\/json(?:\s*;|$)/i.test(header(headers, "content-type"))
    ) {
      return jsonResult(415, {
        ok: false,
        message:
          "Formato de envio inválido. Recarregue a página e tente novamente.",
      });
    }
    const declaredLength = Number(header(headers, "content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES)
      return jsonResult(413, {
        ok: false,
        message:
          "A mensagem é muito longa. Resuma seu projeto e tente novamente.",
      });
    const parsed = parseBody(body);
    if (parsed.error)
      return jsonResult(parsed.error, {
        ok: false,
        message:
          parsed.error === 413
            ? "A mensagem é muito longa. Resuma seu projeto e tente novamente."
            : "Não foi possível ler o formulário. Confira os campos e tente novamente.",
      });
    const data = parsed.data;
    if (data.website !== undefined && data.website !== "")
      return jsonResult(400, {
        ok: false,
        message:
          "Não foi possível validar o envio. Recarregue a página e tente novamente.",
      });
    const timestamp = now();
    const limit = rateLimit(String(ip).slice(0, 128), timestamp);
    if (!limit.allowed)
      return jsonResult(
        429,
        {
          ok: false,
          message:
            "Você fez várias tentativas. Aguarde alguns minutos ou fale pelo WhatsApp.",
        },
        { "Retry-After": String(limit.retryAfter) },
      );
    const name = clean(data.name);
    const email = clean(data.email);
    const phone = clean(data.phone);
    const service = clean(data.service);
    const message = clean(data.message);
    const fieldErrors = {};
    if (name.length < 2 || name.length > 120 || /[\r\n]/.test(name))
      fieldErrors.name = "Informe seu nome (entre 2 e 120 caracteres).";
    if (email.length > 254 || !EMAIL_PATTERN.test(email))
      fieldErrors.email = "Informe um e-mail válido.";
    if (phone && (phone.length > 30 || !/^[+\d\s().-]{8,30}$/.test(phone)))
      fieldErrors.phone = "Informe um telefone válido ou deixe o campo vazio.";
    if (!CONTACT_SERVICES.has(service))
      fieldErrors.service = "Selecione um tipo de projeto.";
    if (message.length < 20 || message.length > 5000)
      fieldErrors.message = "Descreva seu projeto em 20 a 5.000 caracteres.";
    if (data.consent !== true)
      fieldErrors.consent =
        "Autorize o uso desses dados para responder à sua solicitação.";
    if (Object.keys(fieldErrors).length)
      return jsonResult(422, {
        ok: false,
        message: "Confira os campos destacados antes de enviar.",
        fieldErrors,
      });
    if (
      typeof data.startedAt !== "number" ||
      !Number.isFinite(data.startedAt) ||
      timestamp - data.startedAt < 1500 ||
      timestamp - data.startedAt > 24 * 60 * 60 * 1000
    ) {
      return jsonResult(400, {
        ok: false,
        message:
          "Não foi possível validar o tempo do formulário. Aguarde alguns segundos; se a página estiver aberta há muito tempo, recarregue e tente novamente.",
      });
    }
    const apiKey = clean(env.RESEND_API_KEY);
    const from = clean(env.CONTACT_FROM_EMAIL);
    const to = clean(env.CONTACT_TO_EMAIL || "gabriel.misao08@gmail.com");
    if (!apiKey || !EMAIL_PATTERN.test(from) || !EMAIL_PATTERN.test(to)) {
      return jsonResult(503, {
        ok: false,
        message:
          "O envio pelo formulário está temporariamente indisponível. Seus dados foram mantidos; fale pelo WhatsApp ou pelo e-mail.",
      });
    }
    const utm = ["source", "medium", "campaign"].flatMap((key) => {
      const value = clean(data.utm?.[key])
        .replace(/[\r\n\u0000-\u001f]/g, "")
        .slice(0, 120);
      return value ? [`${key}: ${value}`] : [];
    });
    const text = [
      "Nova solicitação pelo site KMZ Studio",
      "",
      `Nome: ${name}`,
      `E-mail: ${email}`,
      `Telefone: ${phone || "Não informado"}`,
      `Projeto: ${service}`,
      "",
      "Descrição:",
      message,
      ...(utm.length ? ["", "Origem da visita:", ...utm] : []),
      "",
      "A pessoa autorizou o uso dos dados para receber uma resposta a esta solicitação.",
    ].join("\n");
    try {
      const response = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: email,
          subject: `Pedido de orçamento — ${service}`,
          text,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok)
        return jsonResult(502, {
          ok: false,
          message:
            "O serviço de e-mail não confirmou o envio. Seus dados foram mantidos; tente novamente ou use o WhatsApp.",
        });
      const delivery = await response.json();
      if (typeof delivery.id !== "string" || !delivery.id)
        return jsonResult(502, {
          ok: false,
          message:
            "Não recebemos a confirmação do envio. Tente novamente ou use o WhatsApp.",
        });
      return jsonResult(200, {
        ok: true,
        id: delivery.id,
        message: "Solicitação enviada. Vamos responder pelo contato informado.",
      });
    } catch {
      return jsonResult(502, {
        ok: false,
        message:
          "Não foi possível confirmar o envio agora. Seus dados foram mantidos; tente novamente ou use o WhatsApp.",
      });
    }
  };
}

const handleContact = createContactService();

export default async function handler(req, res) {
  let body = req.body;
  if (body === undefined && req.method === "POST") {
    const chunks = [];
    let bytes = 0;
    try {
      for await (const chunk of req) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        bytes += buffer.length;
        if (bytes > MAX_BODY_BYTES) {
          const result = jsonResult(413, {
            ok: false,
            message:
              "A mensagem é muito longa. Resuma seu projeto e tente novamente.",
          });
          for (const [name, value] of Object.entries(result.headers))
            res.setHeader(name, value);
          res.statusCode = result.status;
          res.end(JSON.stringify(result.body));
          return;
        }
        chunks.push(buffer);
      }
      body = Buffer.concat(chunks).toString("utf8");
    } catch {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          ok: false,
          message: "A conexão foi interrompida. Tente novamente.",
        }),
      );
      return;
    }
  }
  const forwarded =
    header(req.headers, "x-vercel-forwarded-for") ||
    header(req.headers, "x-forwarded-for");
  const result = await handleContact({
    method: req.method,
    headers: req.headers,
    body,
    ip:
      forwarded.split(",")[0].trim() || req.socket?.remoteAddress || "unknown",
  });
  for (const [name, value] of Object.entries(result.headers))
    res.setHeader(name, value);
  res.statusCode = result.status;
  res.end(JSON.stringify(result.body));
}
