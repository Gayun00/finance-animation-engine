import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

const OUTPUT_PATH = path.resolve(__dirname, "../src/data/builder-output.json");
const PROJECTS_DIR = path.resolve(__dirname, "projects");
const ANIMATIONS_DIR = path.resolve(__dirname, "../public/animations");

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
