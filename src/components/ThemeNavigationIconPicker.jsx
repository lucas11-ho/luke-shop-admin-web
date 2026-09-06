import React,{useEffect,useMemo,useState}from'react';
import{VbenAlert,VbenButton}from'./VbenUI.jsx';
import{PHOSPHOR_NAV_ICONS,ThemePhosphorIcon}from'./ThemePhosphorIcon.jsx';
import{PlatformIconArtwork}from'./PlatformIconPicker.jsx';

const PLATFORM_PREFIX='platform:';
const NAV_SLOTS=[['home','Home','nav_home_icon'],['explore','Shop','nav_explore_icon'],['cart','Bag','nav_cart_icon'],['orders','Orders','nav_orders_icon'],['profile','Account','nav_profile_icon']];
const tokenFor=row=>row?.source_type==='CUSTOM_IMAGE'?`${PLATFORM_PREFIX}${String(row.key||'').toUpperCase()}`:String(row?.library_icon||'').toLowerCase();
const isCustomToken=value=>String(value||'').toLowerCase().startsWith(PLATFORM_PREFIX);
const pretty=value=>String(value||'').replace(/^platform:/i,'').replace(/[-_.]/g,' ').replace(/\b\w/g,x=>x.toUpperCase());

function allowedRows(theme,platformIcons=[]){
 const icons=theme?.manifest?.icons||{};
 if(icons.pack!=='PHOSPHOR_NAV')return[];
 const glyphs=new Set((icons.allowed||[]).filter(name=>PHOSPHOR_NAV_ICONS[name]));
 return platformIcons.filter(row=>row?.status==='PUBLISHED'&&row.usage_scopes?.includes('NAVIGATION')).filter(row=>{
   if(row.source_type==='LIBRARY')return row.library_pack==='PHOSPHOR'&&glyphs.has(row.library_icon)&&PHOSPHOR_NAV_ICONS[row.library_icon];
   return row.source_type==='CUSTOM_IMAGE'&&icons.allow_custom_images===true&&row.asset_path?.startsWith('/v1/icon-assets/');
 });
}
function initialSelection(theme,overrides={}){
 const icons=theme?.manifest?.icons||{},glyphs=new Set((icons.allowed||[]).filter(name=>PHOSPHOR_NAV_ICONS[name])),defaults=icons.navigation_defaults||{},custom=icons.allow_custom_images===true;
 return Object.fromEntries(NAV_SLOTS.map(([slot,,key])=>{
   const requested=String(overrides[key]||'');
   if(custom&&isCustomToken(requested))return[slot,requested];
   if(glyphs.has(requested))return[slot,requested];
   const fallback=String(defaults[slot]||'');return[slot,glyphs.has(fallback)?fallback:null];
 }));
}
function artworkFor(value,rows,icons,size=25){
 const row=rows.find(item=>tokenFor(item)===value);
 if(row)return <PlatformIconArtwork icon={row} size={size}/>;
 if(!isCustomToken(value)&&PHOSPHOR_NAV_ICONS[value])return <ThemePhosphorIcon name={value} size={size} active style={icons.active_style||'filled'}/>;
 return <span className="platform-icon-picker-placeholder" aria-hidden="true"/>;
}

export function ThemeNavigationIconPicker({theme,overrides,platformIcons,onSave,disabled,busy}){
 const icons=theme?.manifest?.icons||{},choices=useMemo(()=>allowedRows(theme,platformIcons),[theme,platformIcons]);
 const allowedTokens=useMemo(()=>new Set(choices.map(tokenFor).filter(Boolean)),[choices]);
 const baseline=useMemo(()=>initialSelection(theme,overrides),[theme,overrides]);
 const[current,setCurrent]=useState(baseline);
 useEffect(()=>setCurrent(baseline),[baseline]);
 if(icons.pack!=='PHOSPHOR_NAV')return <VbenAlert tone="info" title="Fixed icon pack">This theme does not expose merchant-selectable navigation icons.</VbenAlert>;
 if(!choices.length)return <VbenAlert tone="warning" title="No Platform-approved navigation icons">No currently published Platform icons are compatible with this exact theme version.</VbenAlert>;
 const dirty=NAV_SLOTS.some(([slot])=>current[slot]!==baseline[slot]);
 const save=()=>{const next={...overrides};for(const[slot,,key]of NAV_SLOTS){const value=current[slot];if(value&&allowedTokens.has(value))next[key]=value;else delete next[key]}onSave(next,'Navigation icons')};
 const reset=()=>{const next={...overrides};for(const[,,key]of NAV_SLOTS)delete next[key];onSave(next,'Navigation icons')};
 return <section className="theme-icon-editor"><div className="theme-icon-editor-head"><div><strong>Bottom navigation icons</strong><span>Choices must be Platform-published for Navigation and supported by this immutable theme version. Custom artwork is available only when the theme explicitly enables it.</span></div><div><VbenButton variant="secondary" disabled={disabled||busy} onClick={reset}>Reset defaults</VbenButton><VbenButton disabled={disabled||busy||!dirty} onClick={save}>{busy?'Saving…':'Save icons to draft'}</VbenButton></div></div>{icons.allow_custom_images!==true&&platformIcons.some(row=>row.source_type==='CUSTOM_IMAGE'&&row.usage_scopes?.includes('NAVIGATION'))&&<VbenAlert tone="info" title="Custom artwork requires a compatible theme">Install and select Luke Commerce iOS v1.7.0 or another published theme that explicitly allows Platform custom-image navigation.</VbenAlert>}{NAV_SLOTS.map(([slot,label])=><div className="theme-icon-slot" key={slot}><div className="theme-icon-current">{artworkFor(current[slot],choices,icons,26)}<div><strong>{label}</strong><span>{pretty(current[slot])}</span></div></div><div className="theme-icon-grid">{choices.map(row=>{const value=tokenFor(row);return <button type="button" key={row.key} className={current[slot]===value?'selected':''} title={row.name} aria-label={`Use ${row.name} for ${label}`} onClick={()=>setCurrent(old=>({...old,[slot]:value}))}><PlatformIconArtwork icon={row} size={23}/><small>{row.name}</small>{row.source_type==='CUSTOM_IMAGE'&&<em>Custom</em>}</button>})}</div></div>)}</section>;
}
