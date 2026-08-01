"use client";

import { useCallback, useEffect, useState } from "react";
import { sitePath } from "./sitePath";

export const ambientTrackNames = ["Morning river","Forest breeze","Rain","Thunder","Waterfall","Stream","Birds","Crickets","Night forest"] as const;
export type AmbientTrackName = typeof ambientTrackNames[number];
type Levels = Record<AmbientTrackName, number>;
type AmbientState = { enabled: boolean; playing: boolean; automatic: boolean; levels: Levels; activeTrack: AmbientTrackName; periodLabel: string };

const sources: Record<AmbientTrackName,string> = {
  "Morning river":sitePath("/audio/calm-river-pixabay.mp3"),
  "Forest breeze":sitePath("/audio/forest-breeze-pixabay.mp3"),
  Rain:sitePath("/audio/rain-pixabay.mp3"),
  Thunder:sitePath("/audio/thunder-pixabay.mp3"),
  Waterfall:sitePath("/audio/waterfall-pixabay.mp3"),
  Stream:sitePath("/audio/stream-pixabay.mp3"),
  Birds:sitePath("/audio/birds-pixabay.mp3"),
  Crickets:sitePath("/audio/crickets-pixabay.mp3"),
  "Night forest":sitePath("/audio/night-forest-pixabay.mp3"),
};
const silentLevels = (): Levels => Object.fromEntries(ambientTrackNames.map(name => [name, 0])) as Levels;
function soundForTime(hour: number): { name: AmbientTrackName; label: string; mix: Partial<Levels> } {
  if (hour >= 5 && hour < 9) return { name: "Morning river", label: "Dawn by the river", mix: { "Morning river": 38, "Forest breeze": 16, Stream: 12, Birds: 26 } };
  if (hour >= 9 && hour < 12) return { name: "Birds", label: "Bright woodland morning", mix: { "Morning river": 12, "Forest breeze": 20, Stream: 18, Birds: 34 } };
  if (hour >= 12 && hour < 17) return { name: "Forest breeze", label: "Calm forest afternoon", mix: { "Forest breeze": 34, Waterfall: 9, Stream: 24, Birds: 10 } };
  if (hour >= 17 && hour < 20) return { name: "Stream", label: "Golden hour stream", mix: { "Forest breeze": 20, Stream: 34, Birds: 7, Crickets: 12 } };
  if (hour >= 20 && hour < 23) return { name: "Crickets", label: "Soft nightfall", mix: { "Forest breeze": 12, Stream: 10, Crickets: 36, "Night forest": 28 } };
  return { name: "Night forest", label: "Deep forest night", mix: { Rain: 8, Crickets: 24, "Night forest": 40 } };
}
function timedState(now = new Date()) {
  const choice = soundForTime(now.getHours());
  return { automatic: true, activeTrack: choice.name, periodLabel: choice.label, levels: { ...silentLevels(), ...choice.mix } };
}
const presets: Record<string,Partial<Levels>> = {
  "Deep focus":{"Morning river":32,"Forest breeze":24,Rain:0,Thunder:0,Waterfall:16,Stream:24,Birds:8,Crickets:0,"Night forest":0},
  "Rainy cabin":{"Morning river":0,"Forest breeze":12,Rain:58,Thunder:8,Waterfall:0,Stream:0,Birds:0,Crickets:0,"Night forest":8},
  "Forest night":{"Morning river":0,"Forest breeze":15,Rain:0,Thunder:0,Waterfall:0,Stream:8,Birds:0,Crickets:42,"Night forest":58},
  "Waterfall calm":{"Morning river":18,"Forest breeze":8,Rain:0,Thunder:0,Waterfall:58,Stream:30,Birds:12,Crickets:0,"Night forest":0},
};

let state: AmbientState = { enabled: true, playing: false, automatic: true, levels: silentLevels(), activeTrack: "Morning river", periodLabel: "Loading soundscape" };
let initializedInBrowser = false;
const players = new Map<AmbientTrackName,HTMLAudioElement>();
const listeners = new Set<(next: AmbientState) => void>();

function publish(patch: Partial<AmbientState>) {
  state = { ...state, ...patch };
  listeners.forEach(listener => listener(state));
}
function refreshPlaying() { publish({playing:[...players.values()].some(player=>!player.paused)}); }
function playerFor(name: AmbientTrackName) {
  const existing=players.get(name);if(existing)return existing;
  const player=new Audio(sources[name]);player.loop=true;player.preload="auto";player.volume=state.levels[name]/100;
  player.addEventListener("play",refreshPlaying);player.addEventListener("pause",refreshPlaying);players.set(name,player);return player;
}
async function applyPlayback() {
  const jobs=ambientTrackNames.map(async name=>{const player=playerFor(name);player.volume=state.levels[name]/100;if(!state.enabled||state.levels[name]===0){player.pause();return}try{await player.play()}catch{/* browser will retry after the first gesture */}});
  await Promise.allSettled(jobs);refreshPlaying();
}

export function useAmbientSound() {
  const [snapshot,setSnapshot]=useState(state);
  useEffect(()=>{listeners.add(setSnapshot);if(!initializedInBrowser){initializedInBrowser=true;publish({enabled:true,...timedState(new Date())})}void applyPlayback();const unlock=()=>{if(state.enabled&&!state.playing)void applyPlayback()};const clock=window.setInterval(()=>{if(!state.automatic)return;const next=timedState(new Date());if(next.periodLabel!==state.periodLabel){publish(next);void applyPlayback()}},60_000);document.addEventListener("pointerdown",unlock,{passive:true});document.addEventListener("keydown",unlock);return()=>{listeners.delete(setSnapshot);window.clearInterval(clock);document.removeEventListener("pointerdown",unlock);document.removeEventListener("keydown",unlock)}},[]);
  const toggle=useCallback(()=>{publish({enabled:!state.enabled});void applyPlayback()},[]);
  const setLevel=useCallback((name:AmbientTrackName,level:number)=>{publish({automatic:false,levels:{...state.levels,[name]:level},activeTrack:name,periodLabel:"Custom mix"});void applyPlayback()},[]);
  const setVolume=useCallback((volume:number)=>setLevel("Morning river",volume),[setLevel]);
  const applyPreset=useCallback((name:string)=>{const preset=presets[name];if(!preset)return;const levels={...silentLevels(),...preset};const activeTrack=ambientTrackNames.find(track=>levels[track]>0)||state.activeTrack;publish({enabled:true,automatic:false,levels,activeTrack,periodLabel:name});void applyPlayback()},[]);
  const useTimedMix=useCallback(()=>{publish({enabled:true,...timedState(new Date())});void applyPlayback()},[]);
  return {...snapshot,volume:snapshot.levels["Morning river"],toggle,setVolume,setLevel,applyPreset,useTimedMix};
}
