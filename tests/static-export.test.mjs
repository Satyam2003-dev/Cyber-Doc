import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const routes = ["", "editor", "stories", "search", "media", "analytics", "publications", "revisions", "profile", "focus", "settings"];

test("exports every application route for GitHub Pages", async () => {
  for (const route of routes) {
    const file = new URL(`../out/${route ? `${route}/` : ""}index.html`, import.meta.url);
    await access(file);
    const html = await readFile(file, "utf8");
    assert.match(html, /Cyber-Doc/i, route || "home");
    assert.match(html, /\/Cyber-Doc\/_next\//, route || "home");
  }
});

test("uses repository-safe links, metadata, manifest, and local audio", async () => {
  const [config, layout, app, sound, manifest, workflow, packageFile] = await Promise.all([
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/CyberDocApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/useAmbientSound.ts", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.match(config, /output: "export"/);
  assert.match(config, /basePath: "\/Cyber-Doc"/);
  assert.match(layout, /satyam2003-dev\.github\.io\/Cyber-Doc/);
  assert.match(layout, /initialAppearance/);
  assert.match(app, /sitePath/);
  assert.doesNotMatch(app, /window\.location\.assign\("\//);
  assert.match(sound, /sitePath\("\/audio\//);
  assert.match(manifest, /"start_url":"\/Cyber-Doc\/"/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.doesNotMatch(packageFile, /cloudflare|vinext|wrangler/i);
});

test("keeps CRUD, editor shortcuts, themes, and profile editing", async () => {
  const [app, store, theme, sound, styles] = await Promise.all([
    readFile(new URL("../app/CyberDocApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/useBlogStore.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/useThemePreferences.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/useAmbientSound.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  for (const operation of ["createStory", "updateStory", "deleteStory", "duplicateStory", "createPublication", "updatePublication", "deletePublication", "addMedia", "updateMedia", "deleteMedia", "addRevision", "deleteRevision", "updateProfile", "clearAll"]) assert.match(store, new RegExp(operation));
  for (const feature of ["Ctrl+B", "Publish story", "Schedule story", "Export JSON backup", "Import backup", "Erase all content", "Save profile"]) assert.match(app, new RegExp(feature.replace(/[+]/g, "\\+")));
  for (const palette of ["spring", "summer", "autumn", "winter", "rainforest", "ocean", "desert", "blossom", "aurora"]) {
    assert.match(theme, new RegExp(palette));
    assert.match(styles, new RegExp(`data-theme=[\\\"]${palette}[\\\"]`));
  }
  for (const track of ["calm-river", "forest-breeze", "rain", "thunder", "waterfall", "stream", "birds", "crickets", "night-forest"]) assert.match(sound, new RegExp(`${track}-pixabay\\.mp3`));
});
