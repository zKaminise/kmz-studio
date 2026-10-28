import test from "node:test";
import assert from "node:assert/strict";
import { createContactService, createRateLimiter } from "../api/contact.mjs";

const now = 1_800_000_000_000;
const config = {
  NODE_ENV: "production",
  SITE_URL: "https://kmzstudio.com.br",
  RESEND_API_KEY: "test-key-never-used",
  CONTACT_FROM_EMAIL: "contato@kmzstudio.com.br",
  CONTACT_TO_EMAIL: "gabriel.misao08@gmail.com",
};
const request = (overrides = {}) => ({
  method: "POST",
  headers: {
    origin: "https://kmzstudio.com.br",
    "content-type": "application/json",
  },
  ip: "192.0.2.1",
  body: {
    name: "Pessoa de teste",
    email: "pessoa@example.com",
    phone: "(34) 99999-9999",
    service: "Site institucional",
    message: "Preciso apresentar os serviços da minha empresa em um site.",
    consent: true,
    website: "",
    startedAt: now - 5000,
  },
  ...overrides,
});
const service = (options = {}) =>
  createContactService({
    env: config,
    now: () => now,
    fetchImpl: async () => {
      throw new Error("Real network is disabled in tests");
    },
    ...options,
  });
const confirmedTransport = async () => ({
  ok: true,
  json: async () => ({ id: "test-confirmed-only" }),
});

test("only POST is accepted", async () => {
  const response = await service()(request({ method: "GET" }));
  assert.equal(response.status, 405);
  assert.equal(response.headers.Allow, "POST");
});

test("rejects cross-origin requests and non-JSON requests", async () => {
  assert.equal(
    (
      await service()(
        request({
          headers: {
            origin: "https://other.example",
            "content-type": "application/json",
          },
        }),
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await service()(
        request({
          headers: {
            origin: "https://kmzstudio.com.br",
            "content-type": "text/plain",
          },
        }),
      )
    ).status,
    415,
  );
});

test("validates required fields and actual consent on the server", async () => {
  const input = request();
  input.body = {
    ...input.body,
    name: "",
    email: "invalid",
    service: "unrecognized",
    message: "Short",
    consent: "true",
  };
  const response = await service()(input);
  assert.equal(response.status, 422);
  assert.deepEqual(Object.keys(response.body.fieldErrors).sort(), [
    "consent",
    "email",
    "message",
    "name",
    "service",
  ]);
});

test("never reports a successful delivery when configuration is missing", async () => {
  let called = false;
  const response = await service({
    env: {},
    fetchImpl: async () => {
      called = true;
    },
  })(request());
  assert.equal(response.status, 503);
  assert.equal(response.body.ok, false);
  assert.equal(called, false);
});

test("honeypot is rejected without fake delivery success", async () => {
  const input = request();
  input.body.website = "spam.example";
  const response = await service()(input);
  assert.equal(response.status, 400);
  assert.equal(response.body.ok, false);
});

test("too-fast and expired forms are rejected", async () => {
  for (const startedAt of [now, now + 100, now - 25 * 60 * 60 * 1000]) {
    const input = request();
    input.body.startedAt = startedAt;
    assert.equal((await service()(input)).status, 400);
  }
});

test("enforces actual UTF-8 body length and rejects invalid JSON", async () => {
  assert.equal((await service()(request({ body: "{not json" }))).status, 400);
  assert.equal((await service()(request({ body: [] }))).status, 400);
  const input = request();
  input.body.message = "á".repeat(9000);
  assert.equal((await service()(input)).status, 413);
  assert.equal(
    (
      await service()(
        request({
          headers: { ...request().headers, "content-length": "17000" },
        }),
      )
    ).status,
    413,
  );
});

test("uses configured recipient, user as reply-to, and reports only confirmed provider success", async () => {
  let payload;
  const input = request();
  input.body.to = "injected@example.com";
  input.body.utm = {
    source: "instagram",
    medium: "social",
    campaign: "site\nheader-injection",
  };
  const response = await service({
    fetchImpl: async (url, options) => {
      assert.equal(url, "https://api.resend.com/emails");
      payload = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({ id: "provider-confirmed-test-id" }),
      };
    },
  })(input);
  assert.equal(response.status, 200);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.id, "provider-confirmed-test-id");
  assert.deepEqual(payload.to, [config.CONTACT_TO_EMAIL]);
  assert.equal(payload.reply_to, input.body.email);
  assert.match(payload.text, /source: instagram/);
  assert.match(payload.text, /campaign: siteheader-injection/);
});

test("provider failures and network timeouts never report delivery", async () => {
  for (const fetchImpl of [
    async () => ({ ok: false, status: 429 }),
    async () => ({ ok: true, json: async () => ({}) }),
    async () => {
      throw new Error("Network error with sensitive details");
    },
  ]) {
    const response = await service({ fetchImpl })(request());
    assert.equal(response.status, 502);
    assert.equal(response.body.ok, false);
    assert.doesNotMatch(JSON.stringify(response.body), /sensitive|test-key/);
  }
});

test("rate limiting returns retry-after and resets after the window", async () => {
  let timestamp = now;
  const contact = service({
    now: () => timestamp,
    rateLimit: createRateLimiter({ limit: 2, windowMs: 10000 }),
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({ id: "test-only" }),
    }),
  });
  assert.equal((await contact(request())).status, 200);
  assert.equal((await contact(request())).status, 200);
  const blocked = await contact(request());
  assert.equal(blocked.status, 429);
  assert.equal(blocked.headers["Retry-After"], "10");
  timestamp += 10001;
  assert.equal((await contact(request())).status, 200);
});

test("accepts only the current Vercel deployment origin in preview and production", async () => {
  const env = {
    ...config,
    VERCEL_ENV: "preview",
    VERCEL_URL: "kmz-preview.vercel.app",
  };
  const input = request({
    headers: {
      origin: "https://kmz-preview.vercel.app",
      "content-type": "application/json",
    },
  });
  const response = await service({
    env,
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({ id: "preview-test" }),
    }),
  })(input);
  assert.equal(response.status, 200);
  env.VERCEL_ENV = "production";
  assert.equal(
    (await service({ env, fetchImpl: confirmedTransport })(input)).status,
    200,
  );
  input.headers.origin = "https://unrelated-project.vercel.app";
  assert.equal((await service({ env })(input)).status, 403);
});

test("accepts the trusted production project alias without accepting arbitrary hosts", async () => {
  const env = {
    ...config,
    VERCEL_ENV: "production",
    VERCEL_PROJECT_PRODUCTION_URL: "kmz-studio.vercel.app",
  };
  const input = request({
    headers: {
      origin: "https://kmz-studio.vercel.app",
      "content-type": "application/json",
    },
  });
  assert.equal(
    (await service({ env, fetchImpl: confirmedTransport })(input)).status,
    200,
  );
  input.headers.origin = "https://kmz-studio.vercel.app.attacker.invalid";
  assert.equal((await service({ env })(input)).status, 403);
});

test("development accepts loopback; production rejects loopback", async () => {
  const input = request({
    headers: {
      origin: "http://localhost:8080",
      "content-type": "application/json",
    },
  });
  assert.equal(
    (
      await service({
        env: { SITE_URL: "https://kmzstudio.com.br", NODE_ENV: "development" },
      })(input)
    ).status,
    503,
  );
  assert.equal((await service()(input)).status, 403);
});
