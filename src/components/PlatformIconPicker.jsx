import React,{useEffect,useMemo,useState}from'react';
import{ThemePhosphorIcon,PHOSPHOR_NAV_ICONS}from'./ThemePhosphorIcon.jsx';

const SCOPES=new Set(['NAVIGATION','TOPIC','CATEGORY','ACCOUNT','ACTION','MENU']);
const API_BASE=String(import.meta.env.VITE_LUKE_SHOP_API_BASE_URL||'').replace(/\/$/,'');
const identity=row=>row?.key||'';
const includeAll=()=>true;
const safeList=value=>Array.isArray(value)?value:[];
const safeString=value=>typeof value==='string'||typeof value==='number'?String(value):'';
const safeAssetPath=value=>{const path=safeString(value);return path.startsWith('/v1/icon-assets/')&&!path.includes('://')&&!path.includes('\\')?path:''};
const normalizeStringList=value=>safeList(value).map(item=>safeString(item).trim()).filter(Boolean);
const normalizeIcon=row=>{
 if(!row||typeof row!=='object'||Array.isArray(row))return null;
 const key=safeString(row.key).trim();if(!key)return null;
 return {...row,key,name:safeString(row.name).trim()||key,category:safeString(row.category).trim(),source_type:safeString(row.source_type).trim().toUpperCase(),library_pack:safeString(row.library_pack).trim().toUpperCase(),library_icon:safeString(row.library_icon).trim().toLowerCase(),status:safeString(row.status).trim().toUpperCase(),usage_scopes:normalizeStringList(row.usage_scopes).map(scope=>scope.toUpperCase()),tags:normalizeStringList(row.tags)};
};
const assetUrl=(row,variant='default')=>{const path=safeAssetPath(row?.asset_path);if(!path)return'';return `${API_BASE}${path}${variant==='default'?'':`?variant=${variant}`}`};
const searchableText=row=>`${row.name} ${row.key} ${row.category} ${row.tags.join(' ')}`.toLowerCase();

class PlatformIconArtworkBoundary extends React.Component{
 constructor(props){super(props);this.state={failed:false};}
 static getDerivedStateFromError(){return{failed:true};}
 componentDidUpdate(previous){if(previous.resetKey!==this.props.resetKey&&this.state.failed)this.setState({failed:false});}
 componentDidCatch(){try{console.warn('A governed Platform icon could not be rendered.');}catch{}}
 render(){return this.state.failed?<span className="platform-icon-picker-placeholder" aria-hidden="true"/>:this.props.children;}
}

function PlatformIconArtworkInner({icon,size}){
 if(icon.source_type==='CUSTOM_IMAGE'){
   const base=assetUrl(icon);if(!base)return <span className="platform-icon-picker-placeholder" aria-hidden="true"/>;
   const variants=icon.asset_variants&&typeof icon.asset_variants==='object'&&!Array.isArray(icon.asset_variants)?icon.asset_variants:{};
   const dark=variants.dark?assetUrl(icon,'dark'):'';
   const light=variants.light?assetUrl(icon,'light'):'';
   return <picture className="platform-icon-picker-picture">{dark&&<source media="(prefers-color-scheme: dark)" srcSet={dark}/>} {light&&<source media="(prefers-color-scheme: light)" srcSet={light}/>}<img src={base} width={size} height={size} loading="lazy" decoding="async" alt=""/></picture>;
 }
 if(icon.source_type==='LIBRARY'&&icon.library_pack==='PHOSPHOR'&&PHOSPHOR_NAV_ICONS[icon.library_icon])return <ThemePhosphorIcon name={icon.library_icon} size={size}/>;
 return <span className="platform-icon-picker-placeholder" aria-hidden="true"/>;
}

export function PlatformIconArtwork({icon,size=30}){
 const normalized=normalizeIcon(icon);if(!normalized)return <span className="platform-icon-picker-placeholder" aria-hidden="true"/>;
 return <PlatformIconArtworkBoundary resetKey={`${normalized.key}:${normalized.library_icon}:${normalized.asset_path||''}`}><PlatformIconArtworkInner icon={normalized} size={size}/></PlatformIconArtworkBoundary>;
}

export function PlatformIconPicker({api,scope,icons=null,selected='',valueOf=identity,onSelect,filter=includeAll,disabled=false,emptyTitle='No approved icons',searchable=true}){
 const normalized=String(scope||'').trim().toUpperCase();
 const validScope=SCOPES.has(normalized);
 const[remote,setRemote]=useState([]),[loading,setLoading]=useState(false),[error,setError]=useState(''),[query,setQuery]=useState('');
 useEffect(()=>{let active=true;if(Array.isArray(icons)||!api||!validScope){setRemote([]);setLoading(false);setError('');return()=>{active=false}}setLoading(true);setError('');api.request(`/v1/merchant/icon-library?scope=${encodeURIComponent(normalized)}`).then(result=>{if(active)setRemote(safeList(result?.data?.icons))}).catch(err=>{if(active){setRemote([]);setError(err?.message||'Unable to load approved icons.')}}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[api,icons,normalized,validScope]);
 const source=useMemo(()=>safeList(Array.isArray(icons)?icons:remote).map(normalizeIcon).filter(Boolean),[icons,remote]);
 const predicate=typeof filter==='function'?filter:includeAll;
 const valueReader=typeof valueOf==='function'?valueOf:identity;
 const visible=useMemo(()=>{const q=query.trim().toLowerCase();return source.filter(row=>{let allowed=false;try{allowed=predicate(row)!==false}catch{return false}return row.status==='PUBLISHED'&&row.usage_scopes.includes(normalized)&&allowed&&(row.source_type==='CUSTOM_IMAGE'||row.source_type==='LIBRARY')}).filter(row=>!q||searchableText(row).includes(q))},[source,normalized,predicate,query]);
 if(!validScope)return <div className="platform-icon-picker-state error">Unsupported icon scope.</div>;
 return <section className="platform-icon-picker" data-icon-scope={normalized}>{searchable&&<div className="platform-icon-picker-search"><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${normalized.toLowerCase()} icons…`} aria-label={`Search ${normalized.toLowerCase()} icons`}/></div>}{loading?<div className="platform-icon-picker-state">Loading approved icons…</div>:error?<div className="platform-icon-picker-state error">{error}</div>:visible.length===0?<div className="platform-icon-picker-state"><strong>{emptyTitle}</strong><span>Only Platform-published icons approved for this use can appear here.</span></div>:<div className="platform-icon-picker-grid">{visible.map(row=>{let value='';try{value=safeString(valueReader(row))}catch{}const active=value===safeString(selected);return <button type="button" key={row.key} className={active?'selected':''} disabled={disabled} onClick={()=>onSelect?.(row)} title={row.name} aria-pressed={active}><PlatformIconArtwork icon={row}/><span>{row.name}</span>{row.category&&<small>{row.category}</small>}</button>})}</div>}</section>;
}
