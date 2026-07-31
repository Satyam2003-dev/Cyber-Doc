"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Note = {
  id: number;
  title: string;
  excerpt: string;
  body: string;
  tag: string;
  time: string;
  favorite?: boolean;
  mood: "fern" | "gold" | "mist" | "berry";
};

type WorkspaceView = "notes" | "graph" | "gallery" | "starred";

const seedNotes: Note[] = [
  {
    id: 1,
    title: "The Architecture of Attention",
    excerpt: "A quiet system for protecting deep work.",
    body: "Attention is less like a spotlight and more like a garden. It flourishes when we create the conditions for it — shelter from interruption, room to wander, and enough silence for new thoughts to take root.\n\nThe best systems do not demand our focus. They protect it. They hold the small obligations at the edge of the clearing so the mind can stay with the difficult, beautiful thing in front of it.\n\nA useful ritual\n\nBegin by choosing one living question. Close the gates for forty minutes. Keep a small path open for stray thoughts, but do not follow them yet. When the bell sounds, walk the garden and gather what appeared.",
    tag: "Thinking",
    time: "Edited 8 min ago",
    favorite: true,
    mood: "fern",
  },
  {
    id: 2,
    title: "Rivers Remember Their Path",
    excerpt: "Notes on resilient product systems.",
    body: "Resilient systems find their way around obstacles without losing their destination. Like water, they prefer clear channels, small boundaries, and steady movement.\n\nDesign for graceful recovery before perfect operation. A product earns trust when it remembers the user's place and makes every return feel natural.",
    tag: "Design",
    time: "Yesterday",
    mood: "mist",
  },
  {
    id: 3,
    title: "Field Notes: Alpine Moss",
    excerpt: "Small observations from a patient ecosystem.",
    body: "Moss does not hurry. It changes stone through persistence, holding water and creating a home for what comes next.\n\nThere is a product lesson here: the smallest dependable layer can become the foundation of an entire ecosystem.",
    tag: "Field note",
    time: "Jul 28",
    mood: "gold",
  },
  {
    id: 4,
    title: "Gentle Interfaces",
    excerpt: "When technology learns to whisper.",
    body: "A gentle interface knows when to disappear. It offers a hand at the threshold, then gives the work the whole room.\n\nClarity is not emptiness. It is the careful placement of only what matters now.",
    tag: "Craft",
    time: "Jul 24",
    mood: "berry",
  },
];

function openNotesDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("cyber-doc", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("notes")) db.createObjectStore("notes", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export default function Home() {
  const [notes, setNotes] = useState(seedNotes);
  const [activeId, setActiveId] = useState(1);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(seedNotes[0].body);
  const [ambientOpen, setAmbientOpen] = useState(false);
  const [weather, setWeather] = useState<"clear" | "rain">("clear");
  const [quiet, setQuiet] = useState(false);
  const [toast, setToast] = useState("");
  const [planting, setPlanting] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [view, setView] = useState<WorkspaceView>("notes");
  const [searching, setSearching] = useState(false);
  const [period, setPeriod] = useState("Golden morning");
  const hydrated = useRef(false);

  const active = notes.find((note) => note.id === activeId) ?? notes[0];
  const filtered = useMemo(
    () => notes.filter((note) => `${note.title} ${note.excerpt} ${note.tag}`.toLowerCase().includes(query.toLowerCase())),
    [notes, query],
  );

  useEffect(() => {
    openNotesDb().then((db) => {
      const request = db.transaction("notes", "readonly").objectStore("notes").getAll();
      request.onsuccess = () => {
        if (request.result.length) setNotes(request.result as Note[]);
        hydrated.current = true;
      };
    }).catch(() => { hydrated.current = true; });
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const hour = new Date().getHours();
    setPeriod(hour < 6 ? "Moonlit stillness" : hour < 10 ? "Golden morning" : hour < 15 ? "Sunlit noon" : hour < 18 ? "Warm afternoon" : hour < 21 ? "Forest evening" : "Moonlit night");
  }, []);

  useEffect(() => {
    setDraft(active?.body ?? "");
    setEditing(false);
  }, [activeId]);

  const persist = async (next: Note[]) => {
    setNotes(next);
    const db = await openNotesDb();
    const tx = db.transaction("notes", "readwrite");
    next.forEach((note) => tx.objectStore("notes").put(note));
  };

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const runSearch = (value: string) => {
    setQuery(value);
    if (!value) return setSearching(false);
    setSearching(true);
    window.setTimeout(() => setSearching(false), 900);
  };

  const chooseView = (nextView: WorkspaceView) => {
    setView(nextView);
    setMobileNav(false);
  };

  const save = () => {
    const next = notes.map((note) => note.id === activeId ? { ...note, body: draft, time: "Saved just now" } : note);
    void persist(next);
    setEditing(false);
    flash("Your tree drank deeply. Everything is saved.");
  };

  const createNote = () => {
    setPlanting(true);
    window.setTimeout(() => {
      const id = Date.now();
      const next: Note = { id, title: "Untitled seed", excerpt: "A new thought is beginning to grow.", body: "Begin here…", tag: "New growth", time: "Just planted", mood: "fern" };
      void persist([next, ...notes]);
      setActiveId(id);
      setDraft(next.body);
      setEditing(true);
      setPlanting(false);
      setMobileNav(false);
    }, 1200);
  };

  const toggleFavorite = () => {
    const next = notes.map((note) => note.id === activeId ? { ...note, favorite: !note.favorite } : note);
    void persist(next);
    flash(active.favorite ? "Blossom tucked away." : "A new blossom appeared.");
  };

  return (
    <main className={`world ${weather} ${quiet ? "quiet" : ""}`}>
      <div className="sky-glow" />
      <div className="mountains"><i /><i /><i /></div>
      <div className="cloud cloud-a" /><div className="cloud cloud-b" />
      <div className="forest-back"><span>♠</span><span>♠</span><span>♠</span><span>♠</span><span>♠</span></div>
      <div className="river"><i /><i /><i /></div>
      {weather === "rain" && <div className="rain-layer" aria-hidden="true" />}
      {!quiet && <><span className="bird bird-one">⌁</span><span className="bird bird-two">⌁</span><span className="butterfly">❧</span></>}

      <header className="topbar">
        <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Open forest navigation">☰</button>
        <div className="brand-mark"><span className="seed-mark">●</span><span className="sprout">⌁</span></div>
        <div className="brand"><strong>Cyber-Doc</strong><small>living knowledge forest</small></div>
        <div className="season"><span className="sun-dot" /> {period} <i /> Local forest</div>
        <div className="top-actions">
          <button className="round-btn search-mobile" onClick={() => setMobileNav(true)} aria-label="Search">⌕</button>
          <button className={`round-btn ${ambientOpen ? "active" : ""}`} onClick={() => setAmbientOpen(!ambientOpen)} aria-label="Ambient settings">♫</button>
          <button className="avatar" aria-label="Profile">N</button>
        </div>
      </header>

      <aside className={`forest-panel ${mobileNav ? "open" : ""}`}>
        <div className="panel-heading"><span>Your forest</span><button onClick={() => setMobileNav(false)} className="close-mobile">×</button></div>
        <button className="plant-button" onClick={createNote}><span>＋</span> Plant a new thought</button>
        <label className={`search-box ${searching ? "seeking" : ""}`}><span>{searching ? "↝" : "⌕"}</span><input value={query} onChange={(e) => runSearch(e.target.value)} placeholder="Search among the trees…" /></label>
        <nav className="forest-nav" aria-label="Workspace">
          <button className={view === "notes" ? "active" : ""} onClick={() => chooseView("notes")}><span>♣</span> Notes <small>{notes.length}</small></button>
          <button className={view === "graph" ? "active" : ""} onClick={() => chooseView("graph")}><span>⌘</span> Root graph <small>12</small></button>
          <button className={view === "gallery" ? "active" : ""} onClick={() => chooseView("gallery")}><span>▧</span> Media garden <small>8</small></button>
          <button className={view === "starred" ? "active" : ""} onClick={() => chooseView("starred")}><span>✿</span> Blossoms <small>{notes.filter(n => n.favorite).length}</small></button>
        </nav>
        <div className="forest-stats"><span><b>{notes.length}</b> trees</span><span><b>12</b> roots</span><span><b>{notes.filter(n => n.favorite).length}</b> blossoms</span></div>
        <div className="note-list">
          {(view === "starred" ? filtered.filter(note => note.favorite) : filtered).map((note) => (
            <button key={note.id} className={`note-leaf ${note.mood} ${note.id === activeId ? "selected" : ""}`} onClick={() => { setActiveId(note.id); setView("notes"); setMobileNav(false); }}>
              <span className="tree-icon">♣</span>
              <span className="note-copy"><strong>{note.title}</strong><small>{note.excerpt}</small><em>{note.tag} · {note.time}</em></span>
              {note.favorite && <span className="flower">✿</span>}
            </button>
          ))}
          {!filtered.length && <p className="empty-state">No tree carries those words yet.</p>}
        </div>
        <div className="forest-footer"><span className="sync-dot" /> Available offline <button aria-label="Forest options">•••</button></div>
      </aside>

      <section className="workspace">
        <div className="reading-shell">
          {view === "notes" && <><div className="document-meta">
            <span className="crumb">Forest / {active.tag}</span>
            <div><button onClick={toggleFavorite} className={active.favorite ? "fav active" : "fav"} aria-label="Favorite">✿</button><button className="more" aria-label="More options">•••</button></div>
          </div>
          <article className="paper">
            <div className="paper-vine">❦</div>
            <div className="title-row">
              <div><span className="eyebrow">{active.tag}</span><h1>{active.title}</h1><p className="byline">Last tended {active.time.toLowerCase()} · 4 min read</p></div>
              <button className={editing ? "mode-button editing" : "mode-button"} onClick={() => editing ? save() : setEditing(true)}>{editing ? "Save changes" : "✎  Tend this page"}</button>
            </div>
            {editing ? (
              <div className="editor-wrap">
                <div className="format-bar"><button><b>B</b></button><button><i>I</i></button><button>H₂</button><button>❝</button><button>☷</button><span /> <small>Writing mode · saved on this device</small></div>
                <textarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Document content" />
                <div className="edit-actions"><button onClick={() => { setEditing(false); setDraft(active.body); }}>Cancel</button><button onClick={save}>Nourish & save</button></div>
              </div>
            ) : (
              <div className="prose">
                {active.body.split("\n\n").map((paragraph, index) => index === 2 ? <div className="ritual" key={index}><span>✦</span><div><h3>{paragraph}</h3><p>{active.body.split("\n\n")[3]}</p></div></div> : (index !== 3 && <p key={index}>{paragraph}</p>))}
                <blockquote>“What we choose to protect is what we allow to grow.”<cite>— A note from the forest</cite></blockquote>
                <div className="root-links"><span>Root connections</span><button>↗ Deep Work Rituals</button><button>↗ Designing for Calm</button></div>
              </div>
            )}
            <footer className="document-footer"><span>☘</span><p>This tree has grown through <b>7 revisions</b><small>Its roots connect to 3 other thoughts</small></p><button>View growth rings →</button></footer>
          </article></>}
          {view === "graph" && <GraphView notes={notes} onOpen={(id) => { setActiveId(id); setView("notes"); }} />}
          {view === "gallery" && <GalleryView onOpen={() => { setView("notes"); flash("Media block opened in its parent tree."); }} />}
          {view === "starred" && <CollectionView notes={notes.filter(note => note.favorite)} onOpen={(id) => { setActiveId(id); setView("notes"); }} />}
        </div>
      </section>

      <aside className="activity-rail">
        <div className="rail-title"><span>Living activity</span><small>Today</small></div>
        <div className="focus-pebble"><span className="focus-ring"><b>42</b><small>min</small></span><div><strong>Deep focus</strong><small>One quiet session</small></div></div>
        <div className="growth-card"><span className="mini-tree">♣</span><div><strong>Your forest is thriving</strong><small>3 thoughts tended this week</small><i><b style={{ width: "68%" }} /></i></div></div>
        <div className="activity-list">
          <h3>Recently bloomed</h3>
          <button onClick={() => { setActiveId(2); setView("notes"); }}><span className="activity-icon river-icon">≈</span><p><b>Rivers Remember Their Path</b><small>Edited yesterday</small></p></button>
          <button onClick={() => { setActiveId(4); setView("notes"); }}><span className="activity-icon flower-icon">✿</span><p><b>Gentle Interfaces</b><small>New root connection</small></p></button>
          <button onClick={() => setView("graph")}><span className="activity-icon root-icon">⌘</span><p><b>12 root connections</b><small>View living graph</small></p></button>
        </div>
        <div className="daily-seed"><span>Daily seed</span><p>“Small ideas, tended often, become a canopy.”</p><button onClick={createNote}>Plant this thought</button></div>
        <div className="rail-tags"><span>Vines</span><div><button>#design</button><button>#research</button><button>#calm</button><button>#systems</button></div></div>
      </aside>

      {ambientOpen && <aside className="ambient-card">
        <div className="ambient-title"><span><b>Living ambience</b><small>Golden morning · riverside</small></span><button onClick={() => setAmbientOpen(false)}>×</button></div>
        <div className="soundscape"><span className="sound-orb">≈</span><div><b>Forest river</b><small>Water, soft breeze & waking birds</small></div><button className="pause">Ⅱ</button></div>
        {[['River', 72], ['Birdsong', 44], ['Leaves', 32]].map(([name, value]) => <label className="volume" key={String(name)}><span>{name}</span><input type="range" defaultValue={Number(value)} /><small>{value}%</small></label>)}
        <div className="ambient-buttons"><button onClick={() => setWeather(weather === "clear" ? "rain" : "clear")}>{weather === "rain" ? "☀ Clear sky" : "☂ Rain mode"}</button><button onClick={() => setQuiet(!quiet)}>{quiet ? "❧ Wake forest" : "◌ Focus calm"}</button></div>
      </aside>}

      {planting && <div className="planting"><div className="plant-animation"><span className="falling-seed">●</span><i className="ground" /><b className="new-sprout">♣</b></div><p>Planting a new thought…</p></div>}
      {toast && <div className="toast"><span>✿</span>{toast}</div>}
    </main>
  );
}

function GraphView({ notes, onOpen }: { notes: Note[]; onOpen: (id: number) => void }) {
  return <section className="feature-surface graph-view">
    <div className="feature-heading"><div><span className="eyebrow">Underground network</span><h2>Your living root graph</h2><p>Ideas grow stronger when their roots meet.</p></div><div className="graph-legend"><span>● Thought</span><span>✿ Blossom</span><span>⌁ Root</span></div></div>
    <div className="root-canvas" role="img" aria-label="Connected knowledge graph">
      <i className="root-line r1" /><i className="root-line r2" /><i className="root-line r3" /><i className="root-line r4" /><i className="root-line r5" />
      {notes.map((note, index) => <button key={note.id} className={`graph-tree node-${index + 1}`} onClick={() => onOpen(note.id)}><span>♣</span><b>{note.title}</b><small>{note.tag}</small>{note.favorite && <em>✿</em>}</button>)}
      <div className="graph-mushroom">♠<small>Unlinked seed</small></div>
    </div>
    <div className="graph-insight"><span>✦</span><p><b>A new path is emerging</b><small>“Attention” and “Gentle Interfaces” share 4 ideas but are not yet linked.</small></p><button>Grow a root</button></div>
  </section>;
}

function GalleryView({ onOpen }: { onOpen: () => void }) {
  const items = [
    ["Alpine moss study", "Field image", "moss-media"], ["System river map", "Diagram", "river-media"],
    ["Quiet architecture", "Sketch", "arch-media"], ["Morning field recording", "Audio · 12:04", "audio-media"],
    ["Forest interface flow", "Mermaid", "flow-media"], ["Attention ritual", "PDF · 8 pages", "paper-media"],
  ];
  return <section className="feature-surface gallery-view">
    <div className="feature-heading"><div><span className="eyebrow">Media garden</span><h2>Artifacts among the trees</h2><p>Images, sketches, sounds, diagrams and documents — available offline.</p></div><button className="organic-action">＋ Add artifact</button></div>
    <div className="media-grid">{items.map(([title, kind, style], index) => <button className={`media-card ${style}`} key={title} onClick={onOpen}><span className="media-visual">{index === 3 ? "♪" : index === 4 ? "⌘" : index === 5 ? "≡" : "❦"}</span><strong>{title}</strong><small>{kind}</small></button>)}</div>
  </section>;
}

function CollectionView({ notes, onOpen }: { notes: Note[]; onOpen: (id: number) => void }) {
  return <section className="feature-surface collection-view"><div className="feature-heading"><div><span className="eyebrow">Blossoms</span><h2>Thoughts worth returning to</h2><p>Favorite notes gather here like flowers in a clearing.</p></div></div><div className="blossom-grid">{notes.map(note => <button key={note.id} onClick={() => onOpen(note.id)}><span>✿</span><small>{note.tag}</small><strong>{note.title}</strong><p>{note.excerpt}</p><em>Open tree →</em></button>)}</div></section>;
}
