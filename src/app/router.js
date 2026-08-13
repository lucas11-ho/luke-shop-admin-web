import { useEffect, useState } from 'react';
export function normalizeRoute(hash=location.hash){ const raw=(hash||'#/dashboard').replace(/^#/,''); return raw.startsWith('/')?raw:`/${raw}`; }
export function useHashRoute(){ const [route,setRoute]=useState(()=>normalizeRoute()); useEffect(()=>{const h=()=>setRoute(normalizeRoute());addEventListener('hashchange',h);return()=>removeEventListener('hashchange',h);},[]); return route; }
export function navigate(path){ location.hash=`#${path.startsWith('/')?path:`/${path}`}`; }
