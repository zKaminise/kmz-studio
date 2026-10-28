import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readFile, stat } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";

type ContactResult = {
  status: number;
  headers: Record<string, string>;
  body: unknown;
};
type ContactService = (request: {
  method?: string;
  headers: IncomingMessage["headers"];
  body: string;
  ip: string;
}) => Promise<ContactResult>;

function contactApi(env: Record<string, string>): Plugin {
  const install = async (server: {
    middlewares: {
      use: (
        handler: (
          req: IncomingMessage,
          res: ServerResponse,
          next: () => void,
        ) => void,
      ) => void;
    };
  }) => {
    const moduleUrl = pathToFileURL(
      path.resolve(process.cwd(), "api/contact.mjs"),
    ).href;
    const { createContactService } = await import(moduleUrl);
    const contact: ContactService = createContactService({
      env: { ...env, NODE_ENV: "development" },
    });
    server.middlewares.use((req, res, next) => {
      if (req.url?.split("?")[0] !== "/api/contact") return next();
      const chunks: Buffer[] = [];
      let bytes = 0;
      let oversized = false;
      req.on("data", (chunk: Buffer) => {
        bytes += chunk.length;
        if (bytes > 16 * 1024) oversized = true;
        else chunks.push(chunk);
      });
      req.on("end", () => {
        void (async () => {
          const result = oversized
            ? {
                status: 413,
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                  "Cache-Control": "no-store",
                },
                body: {
                  ok: false,
                  message:
                    "A mensagem é muito longa. Resuma seu projeto e tente novamente.",
                },
              }
            : await contact({
                method: req.method,
                headers: req.headers,
                body: Buffer.concat(chunks).toString("utf8"),
                ip: req.socket.remoteAddress || "local",
              });
          res.writeHead(result.status, result.headers);
          res.end(JSON.stringify(result.body));
        })().catch(() => {
          if (!res.headersSent)
            res.writeHead(500, {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "no-store",
            });
          res.end(
            JSON.stringify({
              ok: false,
              message:
                "Não foi possível enviar agora. Tente novamente ou use o WhatsApp.",
            }),
          );
        });
      });
      req.on("error", () => {
        if (!res.headersSent)
          res.writeHead(400, {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
          });
        res.end(
          JSON.stringify({
            ok: false,
            message: "A conexão foi interrompida. Tente novamente.",
          }),
        );
      });
    });
  };
  return {
    name: "kmz-local-contact-api",
    configureServer: install,
    configurePreviewServer: install,
  };
}

function previewNotFound(): Plugin {
  return {
    name: "kmz-preview-not-found",
    configurePreviewServer(server) {
      const buildRoot = path.resolve(
        server.config.root,
        server.config.build.outDir,
      );
      const isFile = async (file: string) => {
        try {
          return (await stat(file)).isFile();
        } catch {
          return false;
        }
      };
      server.middlewares.use((req, res, next) => {
        if (
          !["GET", "HEAD"].includes(req.method || "") ||
          !req.headers.accept?.includes("text/html") ||
          req.url?.startsWith("/api/")
        )
          return next();
        void (async () => {
          let pathname: string;
          try {
            pathname = decodeURIComponent(
              new URL(req.url || "/", "http://localhost").pathname,
            );
          } catch {
            res.writeHead(400);
            res.end("Endereço inválido.");
            return;
          }
          const target = path.resolve(buildRoot, pathname.replace(/^\/+/, ""));
          const relativePath = path.relative(buildRoot, target);
          if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
            res.writeHead(400);
            res.end("Endereço inválido.");
            return;
          }
          // Vite's SPA fallback otherwise returns the homepage for clean directory URLs.
          const candidates = [
            target,
            path.join(target, "index.html"),
            `${target}.html`,
          ];
          let pageFile: string | undefined;
          for (const candidate of candidates) {
            if (await isFile(candidate)) {
              pageFile = candidate;
              break;
            }
          }
          const html = await readFile(
            pageFile || path.join(buildRoot, "404.html"),
            "utf8",
          );
          res.writeHead(pageFile ? 200 : 404, {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
          });
          res.end(req.method === "HEAD" ? undefined : html);
        })().catch(next);
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: { host: "127.0.0.1", port: 8080 },
  preview: { host: "127.0.0.1", port: 8080 },
  plugins: [
    react(),
    contactApi(loadEnv(mode, process.cwd(), "")),
    previewNotFound(),
  ],
  resolve: { alias: { "@": path.resolve(process.cwd(), "./src") } },
}));
