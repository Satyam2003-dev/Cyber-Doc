"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useThemePreferences } from "./useThemePreferences";

type Folder = { id: string; name: string; parentId: string | null };
type DocPage = { id: string; folderId: string; title: string; description: string; body: string; updated: string };
type Workspace = { folders: Folder[]; pages: DocPage[] };

const starter: Workspace = {
  folders: [
    { id: "start", name: "Getting started", parentId: null },
    { id: "core", name: "Core concepts", parentId: null },
    { id: "guides", name: "Guides", parentId: null },
    { id: "authoring", name: "Authoring", parentId: "guides" },
    { id: "publishing", name: "Publishing", parentId: "guides" },
    { id: "reference", name: "Reference", parentId: null },
  ],
  pages: [
    { id: "welcome", folderId: "start", title: "Welcome to Cyber-Doc", description: "Build a calm, connected documentation library that grows with your work.", updated: "Today", body: "# Welcome to Cyber-Doc\n\nCyber-Doc is a documentation workspace for guides, product knowledge, research, and technical references. Pages live inside folders, folders can live inside other folders, and the entire library stays available on this device.\n\n## Start with the structure\n\nUse the explorer to move through your documentation. Open **Edit mode** when you need to create folders, add pages, or revise content. Outside edit mode, the library is deliberately read-only.\n\n## Write useful pages\n\n- Give each page one clear purpose.\n- Put related pages in the same folder.\n- Use headings to create an automatic page outline.\n- Keep important links near the idea they support.\n\n> A quiet structure makes a large library feel small.\n\n## Your next step\n\nOpen Edit mode and create a page inside any folder. Your changes save locally as you work." },
    { id: "quick", folderId: "start", title: "Quick start", description: "Create your first folder and documentation page.", updated: "Yesterday", body: "# Quick start\n\n## Enter edit mode\n\nSelect **Edit mode** in the top bar. Authoring controls appear only while editing.\n\n## Add a folder\n\nChoose a folder in the explorer, then use the add-folder control to create a nested section.\n\n## Add a page\n\nUse the page control beside a folder. The new page opens immediately, ready to name and write." },
    { id: "structure", folderId: "core", title: "Folders and pages", description: "How nested information architecture works.", updated: "Jul 30", body: "# Folders and pages\n\nFolders organize the library. Every page belongs to one folder, and folders may contain any number of pages or nested folders.\n\n## A durable hierarchy\n\nPrefer a shallow structure at first. Add depth when a topic has a genuine internal structure, not simply because more levels are possible.\n\n## Naming guidance\n\nUse short nouns for folders and task-oriented titles for instructional pages." },
    { id: "markdown", folderId: "authoring", title: "Markdown authoring", description: "Use headings, lists, quotes, links, and code blocks.", updated: "Jul 29", body: "# Markdown authoring\n\nCyber-Doc uses familiar Markdown for portable documentation.\n\n## Supported patterns\n\n- Headings\n- Paragraphs and lists\n- Block quotes\n- Inline emphasis\n- Fenced code blocks\n\n```js\nconst knowledge = { connected: true };\n```" },
    { id: "style", folderId: "authoring", title: "Documentation style", description: "Write concise, scannable, task-focused pages.", updated: "Jul 27", body: "# Documentation style\n\n## Lead with the outcome\n\nTell readers what they can accomplish before describing the mechanism.\n\n## Make pages scannable\n\nUse descriptive headings, short paragraphs, and lists where sequence or comparison matters." },
    { id: "publish", folderId: "publishing", title: "Publishing workflow", description: "Review and publish a documentation collection.", updated: "Jul 24", body: "# Publishing workflow\n\n## Review\n\nRead the page outside edit mode to experience it exactly as your audience will.\n\n## Publish\n\nA future hosted workspace can synchronize this local library while preserving the same folder and page model." },
    { id: "shortcuts", folderId: "reference", title: "Keyboard shortcuts", description: "Move and edit without leaving the keyboard.", updated: "Jul 23", body: "# Keyboard shortcuts\n\n- **Ctrl / Cmd + K** — Search documentation\n- **Ctrl / Cmd + E** — Toggle edit mode\n- **Ctrl / Cmd + S** — Save the current page\n- **Escape** — Close the mobile explorer" },
  ],
};

const storageKey = "cyber-doc-documentation-v3";

export default function DocumentationWorkspace() {
  const { preferences, timeLabel } = useThemePreferences();
  const [workspace, setWorkspace] = useState(starter);
  const [selectedId, setSelectedId] = useState("welcome");
  const [expanded, setExpanded] = useState<Set<string>>(new Set(starter.folders.map(folder => folder.id)));
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileTree, setMobileTree] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = workspace.pages.find(page => page.id === selectedId) ?? workspace.pages[0];
  const [draft, setDraft] = useState(selected);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Workspace;
        if (parsed.folders?.length && parsed.pages?.length) setWorkspace(parsed);
      }
    } catch { /* retain starter library */ }
  }, []);

  useEffect(() => setDraft(selected), [selected]);
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(workspace)); }, [workspace]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) { if (event.key === "Escape") setMobileTree(false); return; }
      const key = event.key.toLowerCase();
      if (key === "k") { event.preventDefault(); searchRef.current?.focus(); }
      if (key === "e") { event.preventDefault(); setEditMode(value => !value); }
      if (key === "s" && editMode) { event.preventDefault(); savePage(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const path = useMemo(() => folderPath(selected.folderId, workspace.folders), [selected, workspace.folders]);
  const headings = useMemo(() => draft.body.split("\n").filter(line => line.startsWith("## ")).map(line => line.slice(3)), [draft.body]);
  const filtered = useMemo(() => workspace.pages.filter(page => `${page.title} ${page.description} ${page.body}`.toLowerCase().includes(search.toLowerCase())), [workspace.pages, search]);

  function flash(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2200); }
  function toggleFolder(id: string) { setExpanded(current => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; }); }
  function openPage(id: string) { setSelectedId(id); setMobileTree(false); }
  function savePage() {
    setWorkspace(current => ({ ...current, pages: current.pages.map(page => page.id === draft.id ? { ...draft, updated: "Saved just now" } : page) }));
    flash("Page saved to this device");
  }
  function addFolder(parentId: string | null) {
    const folder: Folder = { id: `folder-${Date.now()}`, name: "Untitled folder", parentId };
    setWorkspace(current => ({ ...current, folders: [...current.folders, folder] }));
    if (parentId) setExpanded(current => new Set(current).add(parentId));
    setRenamingFolder(folder.id);
    flash("Folder added");
  }
  function addPage(folderId: string) {
    const page: DocPage = { id: `page-${Date.now()}`, folderId, title: "Untitled page", description: "Add a short description for this page.", body: "# Untitled page\n\nStart writing your documentation here.", updated: "New" };
    setWorkspace(current => ({ ...current, pages: [...current.pages, page] }));
    setExpanded(current => new Set(current).add(folderId));
    setSelectedId(page.id); setDraft(page); flash("Page added");
  }
  function renameFolder(id: string, name: string) {
    const clean = name.trim() || "Untitled folder";
    setWorkspace(current => ({ ...current, folders: current.folders.map(folder => folder.id === id ? { ...folder, name: clean } : folder) }));
    setRenamingFolder(null);
  }
  function descendantIds(id: string): string[] {
    const children = workspace.folders.filter(folder => folder.parentId === id);
    return [id, ...children.flatMap(folder => descendantIds(folder.id))];
  }
  function deleteFolder(id: string) {
    const doomed = new Set(descendantIds(id));
    const remainingPages = workspace.pages.filter(page => !doomed.has(page.folderId));
    setWorkspace(current => ({ folders: current.folders.filter(folder => !doomed.has(folder.id)), pages: remainingPages }));
    if (doomed.has(selected.folderId) && remainingPages[0]) setSelectedId(remainingPages[0].id);
    flash("Folder and its contents removed");
  }
  function deletePage() {
    const remaining = workspace.pages.filter(page => page.id !== selected.id);
    setWorkspace(current => ({ ...current, pages: remaining }));
    if (remaining[0]) setSelectedId(remaining[0].id);
    flash("Page removed");
  }
  function insert(markup: string) {
    setDraft(current => ({ ...current, body: `${current.body.trimEnd()}\n\n${markup}` }));
  }

  return <main className="docs-app">
    <header className="app-bar">
      <button className="icon-button mobile-only" onClick={() => setMobileTree(true)} aria-label="Open documentation explorer">☰</button>
      <a className="brand" href="/" aria-label="Cyber-Doc home"><span className="brand-symbol">C</span><span><b>Cyber-Doc</b><small>Documentation</small></span></a>
      <label className="global-search"><span>⌕</span><input ref={searchRef} value={search} onChange={event => setSearch(event.target.value)} placeholder="Search documentation" aria-label="Search documentation"/><kbd>Ctrl K</kbd></label>
      <span className="time-status" title="Theme follows browser time">{timeLabel}</span>
      <a className="icon-button" href="/settings" aria-label="Open settings">⚙</a>
      <button className={`edit-toggle ${editMode ? "active" : ""}`} onClick={() => setEditMode(value => !value)} aria-pressed={editMode}>{editMode ? "✓ Finish editing" : "✎ Edit mode"}</button>
    </header>

    <aside className={`doc-tree ${mobileTree ? "open" : ""}`}>
      <div className="tree-heading"><span>Documentation</span><button className="icon-button mobile-only" onClick={() => setMobileTree(false)} aria-label="Close documentation explorer">×</button></div>
      {editMode && <div className="tree-create"><button onClick={() => addFolder(null)}>＋ Folder</button><button onClick={() => addPage(path.at(-1)?.id ?? workspace.folders[0].id)}>＋ Page</button></div>}
      {search ? <div className="search-results"><small>{filtered.length} results</small>{filtered.map(page => <button key={page.id} className={page.id === selected.id ? "active" : ""} onClick={() => openPage(page.id)}><span>▤</span><span><b>{page.title}</b><small>{page.description}</small></span></button>)}</div> : <nav aria-label="Documentation tree">{workspace.folders.filter(folder => folder.parentId === null).map(folder => <FolderNode key={folder.id} folder={folder} depth={0} />)}</nav>}
      <div className="tree-footer"><span>Stored locally</span><a href="/settings">Preferences</a></div>
    </aside>

    <section className="doc-content">
      <div className="breadcrumbs"><button onClick={() => setMobileTree(true)}>Docs</button>{path.map(folder => <span key={folder.id}>› {folder.name}</span>)}</div>
      {editMode ? <article className="editor-surface">
        <div className="edit-banner"><span><b>Edit mode</b><small>Structure and content controls are unlocked.</small></span><div><button className="danger-text" onClick={deletePage}>Delete page</button><button className="filled-button" onClick={savePage}>Save page</button></div></div>
        <label className="field"><span>Page title</span><input value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })}/></label>
        <label className="field"><span>Description</span><input value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })}/></label>
        <label className="field compact"><span>Folder</span><select value={draft.folderId} onChange={event => setDraft({ ...draft, folderId: event.target.value })}>{workspace.folders.map(folder => <option key={folder.id} value={folder.id}>{folderPath(folder.id, workspace.folders).map(item => item.name).join(" / ")}</option>)}</select></label>
        <div className="block-tools" aria-label="Insert content"><button onClick={() => insert("## New section")}>H2</button><button onClick={() => insert("- List item")}>List</button><button onClick={() => insert("> Important note")}>Quote</button><button onClick={() => insert("```js\n// Add code\n```")}>Code</button><button onClick={() => insert("[Link title](https://example.com)")}>Link</button></div>
        <label className="field"><span>Markdown content</span><textarea value={draft.body} onChange={event => setDraft({ ...draft, body: event.target.value })} aria-label="Markdown content"/></label>
      </article> : <article className="documentation-page">
        <p className="section-label">{path.at(-1)?.name}</p>
        <h1>{selected.title}</h1>
        <p className="lead">{selected.description}</p>
        <div className="page-rule" />
        <MarkdownDocument content={selected.body} />
        <footer className="page-footer"><span>Last updated {selected.updated}</span><button onClick={() => setEditMode(true)}>Edit this page</button></footer>
      </article>}
    </section>

    {!editMode && <aside className="page-outline"><b>In this article</b>{headings.length ? headings.map(heading => <a key={heading} href={`#${slugify(heading)}`}>{heading}</a>) : <span>No sections</span>}<div className="outline-note">Reading mode<br/><small>{preferences.theme === "auto" ? "Automatic theme" : `${preferences.theme} theme`}</small></div></aside>}
    {toast && <div className="snackbar" role="status">{toast}</div>}
  </main>;

  function FolderNode({ folder, depth }: { folder: Folder; depth: number }) {
    const children = workspace.folders.filter(child => child.parentId === folder.id);
    const pages = workspace.pages.filter(page => page.folderId === folder.id);
    const isOpen = expanded.has(folder.id);
    return <div className="folder-group">
      <div className="folder-row" style={{ paddingLeft: `${10 + depth * 14}px` }}>
        <button className="folder-main" onClick={() => toggleFolder(folder.id)} aria-expanded={isOpen}><span className="chevron">{isOpen ? "▾" : "›"}</span><span className="folder-icon">{isOpen ? "▿" : "▹"}</span>{renamingFolder === folder.id ? <input autoFocus defaultValue={folder.name} onClick={event => event.stopPropagation()} onBlur={event => renameFolder(folder.id, event.target.value)} onKeyDown={event => { if (event.key === "Enter") renameFolder(folder.id, event.currentTarget.value); }}/>: <b>{folder.name}</b>}</button>
        {editMode && <span className="folder-actions"><button onClick={() => addPage(folder.id)} aria-label={`Add page to ${folder.name}`}>＋</button><button onClick={() => addFolder(folder.id)} aria-label={`Add folder to ${folder.name}`}>▱</button><button onClick={() => setRenamingFolder(folder.id)} aria-label={`Rename ${folder.name}`}>✎</button><button onClick={() => deleteFolder(folder.id)} aria-label={`Delete ${folder.name}`}>×</button></span>}
      </div>
      {isOpen && <div>{pages.map(page => <button key={page.id} className={`page-row ${selected.id === page.id ? "active" : ""}`} style={{ paddingLeft: `${38 + depth * 14}px` }} onClick={() => openPage(page.id)}><span>▤</span>{page.title}</button>)}{children.map(child => <FolderNode key={child.id} folder={child} depth={depth + 1}/>)}</div>}
    </div>;
  }
}

function folderPath(id: string, folders: Folder[]) {
  const path: Folder[] = [];
  let current = folders.find(folder => folder.id === id);
  while (current) { path.unshift(current); current = current.parentId ? folders.find(folder => folder.id === current?.parentId) : undefined; }
  return path;
}

function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

function MarkdownDocument({ content }: { content: string }) {
  let code = false;
  return <div className="rendered-markdown">{content.split("\n").map((line, index) => {
    if (line.startsWith("```")) { code = !code; return <span key={index} />; }
    if (code) return <pre key={index}><code>{line || " "}</code></pre>;
    if (line.startsWith("# ")) return null;
    if (line.startsWith("## ")) { const text = line.slice(3); return <h2 id={slugify(text)} key={index}>{text}</h2>; }
    if (line.startsWith("### ")) return <h3 key={index}>{line.slice(4)}</h3>;
    if (line.startsWith("- ")) return <div className="list-line" key={index}><span>•</span><p>{formatInline(line.slice(2))}</p></div>;
    if (line.startsWith("> ")) return <blockquote key={index}>{formatInline(line.slice(2))}</blockquote>;
    if (!line.trim()) return <span className="spacer" key={index} />;
    return <p key={index}>{formatInline(line)}</p>;
  })}</div>;
}

function formatInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <>{parts.map((part, index) => part.startsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part)}</>;
}
