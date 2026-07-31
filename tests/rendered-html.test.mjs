import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders the forest dashboard and shared navigation", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Your knowledge forest/);
  assert.match(html, /Recent documents/);
  assert.match(html, /Collections/);
  assert.match(html, /Morning river/);
  assert.match(html, /href="\/library"/);
  assert.match(html, /href="\/graph"/);
});

test("renders every requested product screen", async () => {
  const routes = {
    "/editor": "Rich text editor",
    "/library": "Document library",
    "/search": "Search everything",
    "/media": "Media manager",
    "/graph": "Knowledge graph",
    "/history": "Version history",
    "/backup": "Backup & sync",
    "/profile": "Profile & statistics",
    "/ambient": "Ambient sound dashboard",
    "/settings": "Settings",
  };
  for (const [path, heading] of Object.entries(routes)) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), new RegExp(heading.replace(/[&]/g, "&amp;|&"), "i"), path);
  }
});

test("includes the advanced editor, data, nature, and timing capabilities", async () => {
  const [app, theme, sw] = await Promise.all([
    readFile(new URL("../app/CyberDocApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/useThemePreferences.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/sw.js", import.meta.url), "utf8"),
  ]);
  for (const feature of ["SlashMenu", "DrawingCanvas", "DiagramPreview", "LinkPreview", "AI assistant", "Version history", "Upload manager", "Cloud sync", "Export your forest", "Knowledge forest progress"]) assert.match(app, new RegExp(feature));
  assert.match(app, /NatureMoment/);
  assert.match(app, /new Blob/);
  assert.match(theme, /getHours/);
  assert.match(theme, /setInterval/);
  assert.match(sw, /cyber-doc-shell-v3/);
});
