import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

const OUTPUT_PATH = path.resolve(__dirname, "../src/data/builder-output.json");
const PROJECTS_DIR = path.resolve(__dirname, "projects");
const ANIMATIONS_DIR = path.resolve(__dirname, "../public/animations");
const EXPERIMENT_DIR = path.resolve(__dirname, "../experiment");
const REFERENCES_DIR = path.resolve(EXPERIMENT_DIR, "reference/collected");
const TRIALS_DIR = path.resolve(EXPERIMENT_DIR, "outputs/trial");

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);

// Ensure projects directory exists
if (!fs.existsSync(PROJECTS_DIR)) {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

function readBody(req: import("http").IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
    req.on("end", () => resolve(body));
  });
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "builder-api",
      configureServer(server) {
        // Studio export
        server.middlewares.use("/api/save", async (req, res) => {
          if (req.method !== "POST") { res.statusCode = 405; res.end("POST only"); return; }
          const body = await readBody(req);
          try {
            JSON.parse(body);
            fs.writeFileSync(OUTPUT_PATH, body, "utf-8");
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, path: OUTPUT_PATH }));
          } catch {
            res.statusCode = 400;
            res.end("Invalid JSON");
          }
        });

        // List saved projects
        server.middlewares.use("/api/projects/list", (_req, res) => {
          const files = fs.readdirSync(PROJECTS_DIR)
            .filter((f) => f.endsWith(".json"))
            .map((f) => {
              const stat = fs.statSync(path.join(PROJECTS_DIR, f));
              return { name: f.replace(/\.json$/, ""), updatedAt: stat.mtimeMs };
            })
            .sort((a, b) => b.updatedAt - a.updatedAt);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(files));
        });

        // Save project
        server.middlewares.use("/api/projects/save", async (req, res) => {
          if (req.method !== "POST") { res.statusCode = 405; res.end("POST only"); return; }
          const body = await readBody(req);
          try {
            const data = JSON.parse(body);
            const name: string = data.name || "untitled";
            const safeName = name.replace(/[^a-zA-Z0-9가-힣_-]/g, "_");
            const filePath = path.join(PROJECTS_DIR, `${safeName}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data.project, null, 2), "utf-8");
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, name: safeName }));
          } catch {
            res.statusCode = 400;
            res.end("Invalid JSON");
          }
        });

        // Load project
        server.middlewares.use("/api/projects/load", async (req, res) => {
          const url = new URL(req.url || "", "http://localhost");
          const name = url.searchParams.get("name");
          if (!name) { res.statusCode = 400; res.end("name required"); return; }
          const safeName = name.replace(/[^a-zA-Z0-9가-힣_-]/g, "_");
          const filePath = path.join(PROJECTS_DIR, `${safeName}.json`);
          if (!fs.existsSync(filePath)) { res.statusCode = 404; res.end("Not found"); return; }
          const content = fs.readFileSync(filePath, "utf-8");
          res.setHeader("Content-Type", "application/json");
          res.end(content);
        });

        // Scan animations directory → asset catalog
        server.middlewares.use("/api/assets/scan", (_req, res) => {
          const VALID_CATEGORIES = ["background", "character", "effect", "element", "emoji"];
          const assets: { id: string; file: string; name: string; tags: string[]; category: string }[] = [];

          for (const category of VALID_CATEGORIES) {
            const dir = path.join(ANIMATIONS_DIR, category);
            if (!fs.existsSync(dir)) continue;
            const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
            for (const file of files) {
              const name = file.replace(/\.json$/, "");
              const id = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "_")
                .replace(/^_|_$/g, "");
              const tags = name
                .split(/[\s_-]+/)
                .filter((w) => w.length > 1)
                .map((w) => w.toLowerCase());
              assets.push({ id, file: `${category}/${file}`, name, tags, category });
            }
          }

          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(assets));
        });

        // Delete project
        server.middlewares.use("/api/projects/delete", async (req, res) => {
          if (req.method !== "POST") { res.statusCode = 405; res.end("POST only"); return; }
          const body = await readBody(req);
          try {
            const { name } = JSON.parse(body);
            const safeName = (name as string).replace(/[^a-zA-Z0-9가-힣_-]/g, "_");
            const filePath = path.join(PROJECTS_DIR, `${safeName}.json`);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch {
            res.statusCode = 400;
            res.end("Invalid request");
          }
        });

        // ── Asset Review APIs ──
        // NOTE: More specific routes must come before prefix matches
        //       (connect matches by prefix, so /api/review/references
        //        would intercept /api/review/references/upload)

        // Upload reference image (JSON body: { filename, data (base64) })
        server.middlewares.use("/api/review/references/upload", async (req, res) => {
          if (req.method !== "POST") { res.statusCode = 405; res.end("POST only"); return; }
          const body = await readBody(req);
          try {
            const { filename, data } = JSON.parse(body);
            if (!filename || !data) { res.statusCode = 400; res.end("filename and data required"); return; }
            const safeName = path.basename(filename);
            if (!fs.existsSync(REFERENCES_DIR)) fs.mkdirSync(REFERENCES_DIR, { recursive: true });
            const filePath = path.join(REFERENCES_DIR, safeName);
            const buffer = Buffer.from(data, "base64");
            fs.writeFileSync(filePath, buffer);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, filename: safeName }));
          } catch {
            res.statusCode = 400;
            res.end("Invalid request");
          }
        });

        // Delete reference image
        server.middlewares.use("/api/review/references/delete", async (req, res) => {
          if (req.method !== "POST") { res.statusCode = 405; res.end("POST only"); return; }
          const body = await readBody(req);
          try {
            const { filename } = JSON.parse(body);
            const safeName = path.basename(filename);
            const filePath = path.join(REFERENCES_DIR, safeName);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch {
            res.statusCode = 400;
            res.end("Invalid request");
          }
        });

        // List reference images
        server.middlewares.use("/api/review/references", (_req, res) => {
          if (!fs.existsSync(REFERENCES_DIR)) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify([]));
            return;
          }
          const files = fs.readdirSync(REFERENCES_DIR)
            .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
            .map((f) => {
              const stat = fs.statSync(path.join(REFERENCES_DIR, f));
              return { filename: f, path: `reference/collected/${f}`, size: stat.size, mtime: stat.mtimeMs };
            })
            .sort((a, b) => a.filename.localeCompare(b.filename));
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(files));
        });

        // Save trial review results
        server.middlewares.use("/api/review/trials/save-review", async (req, res) => {
          if (req.method !== "POST") { res.statusCode = 405; res.end("POST only"); return; }
          const body = await readBody(req);
          try {
            const data = JSON.parse(body);
            const reviewPath = path.join(TRIALS_DIR, "review.json");
            fs.writeFileSync(reviewPath, JSON.stringify(data, null, 2), "utf-8");
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true }));
          } catch {
            res.statusCode = 400;
            res.end("Invalid JSON");
          }
        });

        // Load trial review results
        server.middlewares.use("/api/review/trials/load-review", (_req, res) => {
          const reviewPath = path.join(TRIALS_DIR, "review.json");
          if (!fs.existsSync(reviewPath)) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({}));
            return;
          }
          const content = fs.readFileSync(reviewPath, "utf-8");
          res.setHeader("Content-Type", "application/json");
          res.end(content);
        });

        // List trial images
        server.middlewares.use("/api/review/trials", (_req, res) => {
          if (!fs.existsSync(TRIALS_DIR)) {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify([]));
            return;
          }
          const files = fs.readdirSync(TRIALS_DIR)
            .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
            .map((f) => {
              const stat = fs.statSync(path.join(TRIALS_DIR, f));
              return { filename: f, path: `outputs/trial/${f}`, size: stat.size, mtime: stat.mtimeMs };
            })
            .sort((a, b) => a.filename.localeCompare(b.filename));
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(files));
        });

        // Serve image from experiment/ directory (path traversal guard)
        server.middlewares.use("/api/review/image", (req, res) => {
          const url = new URL(req.url || "", "http://localhost");
          const imgPath = url.searchParams.get("path");
          if (!imgPath) { res.statusCode = 400; res.end("path required"); return; }
          const resolved = path.resolve(EXPERIMENT_DIR, imgPath);
          if (!resolved.startsWith(EXPERIMENT_DIR + path.sep) && resolved !== EXPERIMENT_DIR) {
            res.statusCode = 403; res.end("Forbidden"); return;
          }
          if (!fs.existsSync(resolved)) { res.statusCode = 404; res.end("Not found"); return; }
          const ext = path.extname(resolved).toLowerCase();
          const mimeMap: Record<string, string> = {
            ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
            ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml",
          };
          res.setHeader("Content-Type", mimeMap[ext] || "application/octet-stream");
          res.setHeader("Cache-Control", "no-cache");
          const stream = fs.createReadStream(resolved);
          stream.pipe(res);
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@engine": path.resolve(__dirname, "../src"),
    },
  },
  server: {
    port: 3100,
  },
});
