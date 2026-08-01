<div align="center">

# Cyber-Doc

### Write clearly. Publish beautifully. Keep your work yours.

Cyber-Doc is a calm, local-first writing and publishing workspace inspired by modern editorial platforms and nature. Draft stories, organize publications, review revisions, explore analytics, and shape a focused writing atmosphere—all from one responsive interface.

![Cyber-Doc editorial workspace](public/og.png)

![Next.js](https://img.shields.io/badge/Next.js-16-111111?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-20232a?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-f38020?style=flat-square&logo=cloudflare&logoColor=white)

</div>

## Why Cyber-Doc?

Most writing tools force you to choose between a beautiful editor, organized publishing controls, and ownership of your data. Cyber-Doc brings those ideas together in a focused workspace that starts empty and grows with your writing.

- **Local-first:** stories and preferences remain in your browser.
- **Creator-focused:** drafting, publishing, revisions, media, and analytics share one workflow.
- **Distraction-aware:** responsive editorial typography and focused controls keep writing central.
- **Nature-inspired:** adaptive themes and locally served ambient soundscapes create a calmer environment.

## Features

### Writing and publishing

- Create, edit, duplicate, publish, schedule, archive, restore, and delete stories
- Distraction-free story editor with autosave feedback
- Formatting shortcuts for bold, italic, underline, links, inline code, and saving
- Story topics, tags, subtitles, cover images, SEO preview, and publishing controls
- Publication management and author profile
- Editable author name, bio, location, avatar, and profile cover image
- Revision timeline with comparison and restore controls

### Organization and discovery

- Story dashboard with status filters and search
- Global search across locally stored writing
- Media library with upload and management controls
- Publication and revision views
- Responsive navigation for desktop, tablet, and mobile

### Insights

- Local publication analytics
- Story, view, word-count, and publication summaries
- Reading-time calculations
- Profile and publishing progress

### Themes and focus audio

- Automatic time-aware appearance
- Light, Dark, Spring, Summer, Autumn, Winter, Rainforest, Ocean, Desert, Blossom, and Aurora themes
- True neutral-dark mode with high-contrast reading surfaces
- Optional interface animations with an accessible On/Off switch
- Nine locally served Pixabay nature recordings
- Automatic dawn, morning, afternoon, evening, nightfall, and deep-night mixes
- Manual volume mixer and writing presets
- Pause state that stays paused until playback is requested or the page is refreshed

### Data ownership

- Browser-local story database
- JSON backup export and restore
- Local content erase controls
- No account or remote database required
- No writing is sent to a third-party service by the application

## Quick start

### Requirements

- Node.js **22.13 or newer**
- npm

### Installation

```bash
git clone https://github.com/Satyam2003-dev/Cyber-Doc.git
cd Cyber-Doc
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create the production build |
| `npm run start` | Run the production server locally |
| `npm run lint` | Check the source with ESLint |
| `npm test` | Build and run the route and feature tests |

## Editor shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + B` | Bold |
| `Ctrl/Cmd + I` | Italic |
| `Ctrl/Cmd + U` | Underline |
| `Ctrl/Cmd + K` | Insert link |
| `` Ctrl/Cmd + ` `` | Inline code |
| `Ctrl/Cmd + S` | Save story |

## Application routes

| Route | Screen |
| --- | --- |
| `/` | Reading home and published stories |
| `/editor` | Story editor |
| `/stories` | Story management |
| `/search` | Global search |
| `/media` | Media library |
| `/analytics` | Publishing analytics |
| `/publications` | Publication management |
| `/revisions` | Version history |
| `/profile` | Author profile |
| `/focus` | Ambient sound mixer |
| `/settings` | Themes, typography, animation, backup, and privacy |

## Project structure

```text
app/
  CyberDocApp.tsx       Shared application UI and screens
  useBlogStore.ts       Local-first CRUD store
  useAmbientSound.ts    Time-aware ambient audio engine
  useThemePreferences.ts Theme and motion preferences
  */page.tsx            Route entry points
public/
  audio/                Locally served nature recordings
  og.png                Social and README preview image
tests/
  rendered-html.test.mjs Route and capability tests
worker/
  index.ts              Cloudflare Worker entry point
```

## How local data works

Cyber-Doc stores stories, publications, revisions, media metadata, appearance preferences, and sound settings in browser storage. Export a JSON backup from **Settings → Data & privacy** before clearing browser data or moving to another device.

Uploaded media can remain available for the current browser session. Keep original media files separately when they are important.

## Deployment

Cyber-Doc builds for Cloudflare Workers and can be connected directly to this GitHub repository for automatic deployments from `main`.

1. Open **Cloudflare → Workers & Pages**.
2. Choose **Create application → Import a repository**.
3. Select `Satyam2003-dev/Cyber-Doc`.
4. Use `npm run build` as the build command.
5. Deploy and use the generated free `workers.dev` URL.

The free address follows this format:

```text
https://cyber-doc.<your-cloudflare-subdomain>.workers.dev
```

## Audio credits

Ambient recordings are stored locally in `public/audio` and used under the [Pixabay Content License](https://pixabay.com/service/license-summary/). Individual track titles, creators, and source links are documented in [public/audio/README.txt](public/audio/README.txt).

## Privacy note

Cyber-Doc is currently designed as a single-device, browser-local application. Clearing site data can remove locally stored writing unless you export a backup first.

---

<div align="center">

**Grow your ideas into something worth publishing.**

[Repository](https://github.com/Satyam2003-dev/Cyber-Doc) · [Report an issue](https://github.com/Satyam2003-dev/Cyber-Doc/issues)

</div>
