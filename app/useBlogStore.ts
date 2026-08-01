"use client";
/* The first client effect hydrates the SSR-safe empty snapshot from local storage. */
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";

export type StoryStatus = "Draft" | "Published" | "Scheduled" | "Archived";
export type Story = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  author: string;
  topic: string;
  tags: string[];
  status: StoryStatus;
  createdAt: string;
  updatedAt: string;
  publishAt?: string;
  views: number;
  claps: number;
  cover?: string;
};
export type Publication = { id: string; name: string; description: string; sections: string[]; createdAt: string };
export type MediaItem = { id: string; name: string; type: string; size: number; dataUrl?: string; createdAt: string };
export type Revision = { id: string; storyId: string; title: string; subtitle: string; body: string; createdAt: string };
export type AuthorIdentity = { name: string; bio: string; location: string; avatar?: string; cover?: string };
export type BlogData = { stories: Story[]; publications: Publication[]; media: MediaItem[]; revisions: Revision[]; profile: AuthorIdentity };

const emptyData: BlogData = { stories: [], publications: [], media: [], revisions: [], profile: { name: "You", bio: "", location: "" } };
const storageKey = "cyber-publish-data-v1";
const changeEvent = "cyber-publish-data-change";
const selectedStoryKey = "cyber-publish-selected-story";
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
let memoryData: BlogData = emptyData;
let hydrated = false;

function readStorage(): BlogData {
  try {
    const value = localStorage.getItem(storageKey);
    memoryData = value ? { ...emptyData, ...JSON.parse(value) } : emptyData;
  } catch {
    if (!hydrated) memoryData = emptyData;
  }
  hydrated = true;
  return memoryData;
}

function commit(change: (current: BlogData) => BlogData) {
  let next = change(hydrated ? memoryData : readStorage());
  memoryData = next;
  hydrated = true;
  try {
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    // Large image previews can exhaust browser storage. Keep the media records,
    // discard only their embedded previews, and retry without losing writing.
    next = { ...next, media: next.media.map(item => ({ ...item, dataUrl: undefined })) };
    memoryData = next;
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* session memory remains available */ }
  }
  window.dispatchEvent(new CustomEvent<BlogData>(changeEvent, { detail: next }));
  return next;
}

export function useBlogStore() {
  const [data, setData] = useState<BlogData>(emptyData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(readStorage());
    setReady(true);
    const sync = (event: Event) => setData((event as CustomEvent<BlogData>).detail);
    const storageSync = () => setData(readStorage());
    window.addEventListener(changeEvent, sync);
    window.addEventListener("storage", storageSync);
    return () => {
      window.removeEventListener(changeEvent, sync);
      window.removeEventListener("storage", storageSync);
    };
  }, []);

  const createStory = useCallback((values: Partial<Story> = {}) => {
    const now = new Date().toISOString();
    const author = (hydrated ? memoryData : readStorage()).profile.name || "You";
    const story: Story = {
      title: "", subtitle: "", body: "", author, topic: "General", tags: [],
      status: "Draft", views: 0, claps: 0, ...values,
      id: uid(), createdAt: now, updatedAt: now,
    };
    commit(current => ({ ...current, stories: [story, ...current.stories] }));
    return story;
  }, []);
  const updateStory = useCallback((id: string, patch: Partial<Story>) => commit(current => ({
    ...current, stories: current.stories.map(story => story.id === id ? { ...story, ...patch, updatedAt: new Date().toISOString() } : story),
  })), []);
  const deleteStory = useCallback((id: string) => commit(current => ({
    ...current, stories: current.stories.filter(story => story.id !== id), revisions: current.revisions.filter(revision => revision.storyId !== id),
  })), []);
  const duplicateStory = useCallback((id: string) => {
    const source = (hydrated ? memoryData : readStorage()).stories.find(story => story.id === id);
    return source ? createStory({ ...source, id: undefined, title: `${source.title || "Untitled"} (copy)`, status: "Draft" }) : undefined;
  }, [createStory]);
  const addRevision = useCallback((story: Story) => commit(current => ({ ...current, revisions: [{ id: uid(), storyId: story.id, title: story.title, subtitle: story.subtitle, body: story.body, createdAt: new Date().toISOString() }, ...current.revisions] })), []);
  const deleteRevision = useCallback((id: string) => commit(current => ({ ...current, revisions: current.revisions.filter(revision => revision.id !== id) })), []);
  const createPublication = useCallback((name: string, description: string) => commit(current => ({ ...current, publications: [{ id: uid(), name, description, sections: [], createdAt: new Date().toISOString() }, ...current.publications] })), []);
  const updatePublication = useCallback((id: string, patch: Partial<Publication>) => commit(current => ({ ...current, publications: current.publications.map(publication => publication.id === id ? { ...publication, ...patch } : publication) })), []);
  const deletePublication = useCallback((id: string) => commit(current => ({ ...current, publications: current.publications.filter(publication => publication.id !== id) })), []);
  const addMedia = useCallback((item: Omit<MediaItem, "id" | "createdAt">) => commit(current => ({ ...current, media: [{ ...item, id: uid(), createdAt: new Date().toISOString() }, ...current.media] })), []);
  const updateMedia = useCallback((id: string, patch: Partial<MediaItem>) => commit(current => ({ ...current, media: current.media.map(item => item.id === id ? { ...item, ...patch } : item) })), []);
  const deleteMedia = useCallback((id: string) => commit(current => ({ ...current, media: current.media.filter(item => item.id !== id) })), []);
  const updateProfile = useCallback((patch: Partial<AuthorIdentity>) => commit(current => ({ ...current, profile: { ...emptyData.profile, ...current.profile, ...patch } })), []);
  const clearAll = useCallback(() => commit(() => emptyData), []);
  const selectStory = useCallback((id?: string) => id ? localStorage.setItem(selectedStoryKey, id) : localStorage.removeItem(selectedStoryKey), []);
  const selectedStoryId = useCallback(() => localStorage.getItem(selectedStoryKey), []);

  return { data, ready, createStory, updateStory, deleteStory, duplicateStory, addRevision, deleteRevision, createPublication, updatePublication, deletePublication, addMedia, updateMedia, deleteMedia, updateProfile, clearAll, selectStory, selectedStoryId };
}
