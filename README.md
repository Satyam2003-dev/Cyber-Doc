<div align="center">

# Cyber-Doc

### Write clearly. Publish beautifully. Keep your work yours.

A calm, local-first writing and publishing workspace inspired by modern editorial platforms and nature.

![Cyber-Doc editorial workspace](public/og.png)

![Next.js](https://img.shields.io/badge/Next.js-16-111111?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-20232a?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-222222?style=flat-square&logo=github)

[**Open the live website →**](https://satyam2003-dev.github.io/Cyber-Doc/)

</div>

## What it includes

- Complete local CRUD for stories, publications, media, revisions, and profile data
- Editorial story editor with autosave, publishing controls, and keyboard shortcuts
- Search, filters, analytics, revision restore, media management, and JSON backup
- Editable author avatar, cover, name, location, and bio
- Eleven nature-inspired light, dark, seasonal, and gradient themes
- Nine local Pixabay nature recordings with time-aware ambient mixes
- Responsive layouts for desktop, tablet, and mobile
- Browser-local storage: writing is not sent to an application server

## Run locally

Requirements: Node.js 22.13 or newer and npm.

```bash
git clone https://github.com/Satyam2003-dev/Cyber-Doc.git
cd Cyber-Doc
npm install
npm run dev
```

Open [http://localhost:3000/Cyber-Doc/](http://localhost:3000/Cyber-Doc/).

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Export the static website to `out/` |
| `npm run lint` | Check source code with ESLint |
| `npm test` | Build and test every route and core capability |

## Editor shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + B` | Bold |
| `Ctrl/Cmd + I` | Italic |
| `Ctrl/Cmd + U` | Underline |
| `Ctrl/Cmd + K` | Insert link |
| `` Ctrl/Cmd + ` `` | Inline code |
| `Ctrl/Cmd + S` | Save story |

## Screens

Home, editor, stories, search, media, analytics, publications, revision history, profile, focus sounds, and settings are exported as independent static routes under `/Cyber-Doc`.

## Project structure

```text
app/
  CyberDocApp.tsx          Shared application UI and screens
  useBlogStore.ts          Local-first CRUD store
  useAmbientSound.ts       Time-aware local audio engine
  useThemePreferences.ts   Theme and motion preferences
  sitePath.ts              GitHub Pages-safe URL helper
  */page.tsx               Static route entry points
public/
  audio/                   Locally served nature recordings
  og.png                   Social and README preview
tests/
  static-export.test.mjs   Export and capability tests
.github/workflows/
  nextjs.yml               Automatic Pages deployment
```

## Publish with GitHub Pages

Deployment is free and automatic from the `main` branch.

1. Open **Settings → Pages** in this GitHub repository.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Push to `main`, or manually run **Deploy Cyber-Doc to GitHub Pages** in the Actions tab.
4. Visit [https://satyam2003-dev.github.io/Cyber-Doc/](https://satyam2003-dev.github.io/Cyber-Doc/).

No separate hosting provider, server, or paid domain is required.

## Data and privacy

Cyber-Doc stores content in browser storage. Export a JSON backup from **Settings → Data & privacy** before clearing browser data or moving devices. Uploaded image data is optimized for local storage, but important original files should be kept separately.

Ambient recordings are saved in `public/audio` and used under the [Pixabay Content License](https://pixabay.com/service/license-summary/). Track credits and source links are documented in [public/audio/README.txt](public/audio/README.txt).

---

<div align="center">

**Grow your ideas into something worth publishing.**

[Live website](https://satyam2003-dev.github.io/Cyber-Doc/) · [Repository](https://github.com/Satyam2003-dev/Cyber-Doc) · [Report an issue](https://github.com/Satyam2003-dev/Cyber-Doc/issues)

</div>
