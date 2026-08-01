# Cyber-Doc

Cyber-Doc is a local-first writing and publishing workspace with story CRUD, publications, revisions, media management, analytics, nature themes, and ambient focus audio.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm test
```

## Data and preferences

Stories, publications, revisions, media metadata, theme choices, and sound preferences are stored in browser-local storage. Local ambient audio lives in `public/audio`.

## Main routes

- `/` — reading home
- `/editor` — story editor
- `/stories` — story management
- `/search` — global search
- `/media` — media library
- `/analytics` — publication analytics
- `/publications` — publication management
- `/revisions` — version history
- `/profile` — author profile
- `/focus` — ambient sound controls
- `/settings` — themes, typography, animation, backup, and privacy
