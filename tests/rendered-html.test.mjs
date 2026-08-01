import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("starts with a true empty publication", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /No published stories yet/);
  assert.match(html, /Write your first story/);
  assert.doesNotMatch(html, /quiet architecture|Nina Kapoor|Margin Notes/i);
});

test("renders every working publishing screen", async () => {
  const routes = { "/editor": "Story title", "/stories": "Your stories", "/search": "Find your ideas instantly", "/media": "Media library", "/analytics": "Analytics", "/publications": "Publications", "/revisions": "Revision history", "/profile": "Your profile", "/focus": "Focus sounds", "/settings": "Appearance" };
  for (const [path, heading] of Object.entries(routes)) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), new RegExp(heading, "i"), path);
  }
});

test("implements shared local CRUD, editor shortcuts, themes, and local audio", async () => {
  const [app, store, theme, sound, styles, layout] = await Promise.all([
    readFile(new URL("../app/CyberDocApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/useBlogStore.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/useThemePreferences.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/useAmbientSound.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);
  for (const operation of ["createStory", "updateStory", "deleteStory", "duplicateStory", "createPublication", "updatePublication", "deletePublication", "addMedia", "updateMedia", "deleteMedia", "addRevision", "deleteRevision", "updateProfile", "clearAll"]) assert.match(store, new RegExp(operation));
  assert.match(store, /stories: \[\], publications: \[\], media: \[\], revisions: \[\]/);
  assert.match(store, /session memory remains available/);
  assert.match(store, /dataUrl: undefined/);
  for (const feature of ["Ctrl+B", "Publish story", "Schedule story", "Export JSON backup", "Import backup", "Erase all content"]) assert.match(app, new RegExp(feature.replace(/[+]/g, "\\+")));
  assert.doesNotMatch(app, /href="#"/);
  assert.match(theme, /getHours/);
  assert.match(theme, /useState<Date\|null>\(null\)/);
  assert.match(theme, /timeLabel:now\?now\.toLocaleTimeString/);
  for (const palette of ["spring", "summer", "autumn", "winter", "rainforest", "ocean", "desert", "blossom", "aurora"]) {
    assert.match(theme, new RegExp(palette));
    assert.match(styles, new RegExp(`data-theme=[\\\"]${palette}[\\\"]`));
  }
  assert.match(sound, /Dawn by the river/);
  assert.match(sound, /Bright woodland morning/);
  assert.match(sound, /Golden hour stream/);
  assert.match(sound, /Deep forest night/);
  assert.match(sound, /automatic:false/);
  assert.match(sound, /useTimedMix/);
  assert.match(sound, /periodLabel: "Loading soundscape"/);
  assert.match(sound, /if\(state\.enabled&&!state\.playing\)/);
  assert.match(app, /aria-current/);
  assert.match(app, /Skip to content/);
  assert.match(app, /Autosaved/);
  assert.match(app, /Writing is safe/);
  assert.match(app, /cyber-search-query/);
  assert.match(app, /nav-search-submit/);
  assert.match(app, /Use current time/);
  assert.match(app, /Choose image/);
  assert.match(app, /Save profile/);
  assert.match(app, /profileImage/);
  assert.doesNotMatch(app, /setFollowing/);
  assert.doesNotMatch(app, /\["For you", "Following"/);
  assert.match(app, /role="switch"/);
  assert.match(app, /aria-checked=\{preferences\.motion\}/);
  assert.doesNotMatch(app, /top-time/);
  assert.match(layout, /initialAppearance/);
  assert.match(layout, /cyber-blog-preferences-v1/);
  assert.match(layout, /suppressHydrationWarning/);
  assert.match(styles, /Segoe UI Variable Text/);
  assert.match(styles, /transition-duration:140ms/);
  assert.match(styles, /\.editor-inspector\{position:static!important/);
  assert.match(styles, /\.rail-backdrop/);
  assert.match(styles, /\.feed-tabs\{width:100%;overflow-x:auto/);
  assert.match(styles, /input\[type="range"\]\{height:44px/);
  assert.match(styles, /min-width:700px.*max-width:780px/);
  assert.match(styles, /\.menu-button\{display:none!important\}/);
  assert.match(styles, /\/\* Navbar search \*\//);
  assert.match(styles, /\/\* Unified page, shape, and control rhythm \*\//);
  assert.match(styles, /--control-lg:44px/);
  assert.match(styles, /--page-gutter:clamp\(18px,3\.2vw,48px\)/);
  assert.match(styles, /\/\* Motion on\/off switch \*\//);
  assert.match(styles, /\/\* Nature gradient theme collection \*\//);
  assert.match(styles, /\/\* True neutral dark theme \*\//);
  assert.match(styles, /--paper:#090b0a/);
  assert.match(layout, /"ocean","desert","blossom","aurora"/);
  for (const track of ["calm-river", "forest-breeze", "rain", "thunder", "waterfall", "stream", "birds", "crickets", "night-forest"]) assert.match(sound, new RegExp(`${track}-pixabay\\.mp3`));
});
