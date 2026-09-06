import React,{useEffect,useMemo,useState}from'react';
import{ThemePhosphorIcon,PHOSPHOR_NAV_ICONS}from'./ThemePhosphorIcon.jsx';

const SCOPES=new Set(['NAVIGATION','TOPIC','CATEGORY','ACCOUNT','ACTION']);
const API_BASE=String(import.meta.env.VITE_LUKE_SHOP_API_BASE_URL||'').replace(/\/$/,'');
const identity=row=>row?.key||'';
const safeAssetPath=value=>{const path=String(value||'');return path.startsWith('/v1/icon-assets/')&&!path.includes('://')&&!path.includes('\\')?path:''};
const assetUrl=(row,variant='default')=>{const path=safeAssetPath(row?.asset_path);if(!path)return'';return `${API_BASE}${path}${variant==='default'?'':`?variant=${variant}`}`};
const searchableText=row=>`${row?.name||''} ${row?.key||''} ${row?.category||''} ${(row?.tags||[]).join(' ')}`.toLowerCase();

export function PlatformIconArtwork({icon,size=30}){
 if(!icon)return <span className="platform-icon-picker-placeholder" aria-hidden="true"/>;
 if(icon.source_type==='CUSTOM_IMAGE'){
   const base=assetUrl(icon);if(!base)return <span className="platform-icon-picker-placeholder" aria-hidden="true"/>;
   const dark=icon.asset_variants?.dark?assetUrl(icon,'dark'):'';
   const light=icon.asset_variants?.light?assetUrl(icon,'light'):'';
   return <picture className="platform-icon-picker-picture">{dark&&<source media="(prefers-color-scheme: dark)" srcSet={dark}/>} {light&&<source media="(prefers-color-scheme: light)" srcSet={light}/>}<img src={base} width={size} height={size} loading="lazy" decoding="async" alt=""/></picture>;
 }
 if(icon.source_type==='LIBRARY'&&icon.library_pack==='PHOSPHOR'&&PHOSPHOR_NAV_ICONS[icon.library_icon])return <ThemePhosphorIcon name={icon.library_icon} size={size}/>;
 return <span className="platform-icon-picker-placeholder" aria-hidden="true"/>;
}

export function PlatformIconPicker({api,scope,icons=null,selected='',valueOf=identity,onSelect,filter=()=>true,disabled=false,emptyTitle='No approved icons',searchable=true}){
 const normalized=String(scope||'').trim().toUpperCase();
 const validScope=SCOPES.has(normalized);
 const[remote,setRemote]=useState([]),[loading,setLoading]=useState(false),[error,setError]=useState(''),[query,setQuery]=useState('');
 useEffect(()=>{let active=true;if(Array.isArray(icons)||!api||!validScope){setRemote([]);return()=>{active=false}}setLoading(true);setError('');api.request(`/v1/merchant/icon-library?scope=${encodeURIComponent(normalized)}`).then(result=>{if(active)setRemote(result.data.icons||[])}).catch(err=>{if(active)setError(err.message||'Unable to load approved icons.')}finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[api,icons,normalized,validScope]);
 const source=Array.isArray(icons)?icons:remote;
 const visible=useMemo(()=>{const q=query.trim().toLowerCase();return source.filter(row=>row?.status==='PUBLISHED'&&row.usage_scopes?.includes(normalized)&&filter(row)&&(row.source_type==='CUSTOM_IMAGE'||row.source_type==='LIBRARY')).filter(row=>!q||searchableText(row).includes(q))},[source,normalized,filter,query]);
 if(!validScope)return <div className="platform-icon-picker-state error">Unsupported icon scope.</div>;
 return <section className="platform-icon-picker" data-icon-scope={normalized}>{searchable&&<div className="platform-icon-picker-search"><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${normalized.toLowerCase()} icons…`} aria-label={`Search ${normalized.toLowerCase()} icons`}/></div>}{loading?<div className="platform-icon-picker-state">Loading approved icons…</div>:error?<div className="platform-icon-picker-state error">{error}</div>:visible.length===0?<div className="platform-icon-picker-state"><strong>{emptyTitle}</strong><span>Only Platform-published icons approved for this use can appear here.</span></div>:<div className="platform-icon-picker-grid">{visible.map(row=>{const value=valueOf(row),active=value===selected;return <button type="button" key={row.key} className={active?'selected':''} disabled={disabled} onClick={()=>onSelect?.(row)} title={row.name} aria-pressed={active}><PlatformIconArtwork icon={row}/><span>{row.name}</span>{row.category&&<small>{row.category}</small>}</button>})}</div>}</section>;
}
