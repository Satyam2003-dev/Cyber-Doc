"use client";
/* Theme preferences are intentionally hydrated from browser-local storage. */
/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";

export type ThemeChoice="auto"|"light"|"dark"|"spring"|"summer"|"autumn"|"winter"|"rainforest"|"ocean"|"desert"|"blossom"|"aurora";
export type Preferences={theme:ThemeChoice;font:"serif"|"system";motion:boolean;editing:boolean};
export const defaultPreferences:Preferences={theme:"auto",font:"system",motion:true,editing:false};
const preferenceKey="cyber-blog-preferences-v1";const preferenceEvent="cyber-blog-preferences-change";
const timedTheme=(hour:number):Exclude<ThemeChoice,"auto">=>hour<5||hour>=21?"dark":hour<9?"spring":hour<17?"light":hour<19?"autumn":"rainforest";

export function useThemePreferences(){const[preferences,setPreferences]=useState(defaultPreferences);const[ready,setReady]=useState(false);const[now,setNow]=useState<Date|null>(null);useEffect(()=>{try{const saved=localStorage.getItem(preferenceKey);if(saved)setPreferences({...defaultPreferences,...JSON.parse(saved)})}catch{/* defaults */}setNow(new Date());setReady(true);const sync=(event:Event)=>setPreferences((event as CustomEvent<Preferences>).detail);window.addEventListener(preferenceEvent,sync);const timer=window.setInterval(()=>setNow(new Date()),60_000);return()=>{window.removeEventListener(preferenceEvent,sync);window.clearInterval(timer)}},[]);useEffect(()=>{if(!ready||!now)return;const resolved=preferences.theme==="auto"?timedTheme(now.getHours()):preferences.theme;const root=document.documentElement;root.dataset.theme=resolved;root.dataset.font=preferences.font;root.dataset.motion=preferences.motion?"on":"off";root.style.colorScheme=resolved==="dark"||resolved==="rainforest"||resolved==="aurora"?"dark":"light";localStorage.setItem(preferenceKey,JSON.stringify(preferences))},[preferences,now,ready]);const update=useCallback((next:Preferences)=>{setPreferences(next);window.dispatchEvent(new CustomEvent<Preferences>(preferenceEvent,{detail:next}))},[]);const resolvedTheme=preferences.theme==="auto"?(now?timedTheme(now.getHours()):"light"):preferences.theme;return{preferences,setPreferences:update,resolvedTheme,timeLabel:now?now.toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}):""}}
