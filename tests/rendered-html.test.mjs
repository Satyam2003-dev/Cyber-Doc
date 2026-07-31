import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the documentation workspace", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Cyber-Doc — Documentation Workspace<\/title>/);
  assert.match(html, /Search documentation/);
  assert.match(html, /Documentation tree/);
  assert.match(html, /Getting started/);
  assert.match(html, /Welcome to Cyber-Doc/);
  assert.match(html, /Edit mode/);
  assert.match(html, /href="\/settings"/);
});

test("server-renders a separate settings page", async () => {
  const response = await render("/settings");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Your reading environment/);
  assert.match(html, /Automatic/);
  assert.match(html, /Follows browser time/);
  assert.match(html, /Layout density/);
  assert.match(html, /Local storage/);
});

test("ships nested editing, time themes, and offline persistence", async () => {
  const [page, settings, theme, serviceWorker] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/settings/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/useThemePreferences.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/sw.js", import.meta.url), "utf8"),
  ]);
  assert.match(page, /FolderNode/);
  assert.match(page, /addFolder/);
  assert.match(page, /addPage/);
  assert.match(page, /Markdown content/);
  assert.match(page, /localStorage\.setItem/);
  assert.match(settings, /theme-grid/);
  assert.match(theme, /new Date/);
  assert.match(theme, /getHours/);
  assert.match(theme, /setInterval/);
  assert.match(serviceWorker, /cyber-doc-shell-v3/);
});
