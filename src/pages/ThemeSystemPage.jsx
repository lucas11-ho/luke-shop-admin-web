import React,{useCallback,useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{navigate}from'../app/router.js';
import{VbenAlert,VbenButton,VbenCard}from'../components/VbenUI.jsx';

const customerTabs=['Theme','Typography','Icons','Buttons','Navigation','Components'];
const navLabels={standard:'Standard',ios_tab:'iOS Tab',floating_tab:'Floating Tab',minimal_tab:'Minimal Tab',commerce_tab:'Commerce Tab'};
const same=(a,b)=>Boolean(a&&b&&a.key===b.key&&a.version===b.version);
const selectionOf=row=>row?{key:row.key,version:row.version}:null;

function ThemePreview({theme}){
 const m=theme?.manifest||{},colors=m.foundations?.colors||{},nav=m.navigation||{},icons=m.icons||{},buttons=m.buttons||{};
 return <div className="merchant-theme-preview" style={{'--mts-primary':colors.primary||'#166534','--mts-bg':colors.background||'#f8fafc','--mts-surface':colors.surface||'#fff','--mts-text':colors.text||'#172033'}}>
  <div className="merchant-theme-phone"><div className="mts-head"><i/><span/><b/></div><div className="mts-body"><strong>Storefront</strong><span/><span/><div><i/><i/></div></div><div className={`mts-nav ${nav.mobile||'standard'}`}>{['⌂','▦','▣','▤','●'].map((x,i)=><i className={i===0?'active':''} key={i}>{x}</i>)}</div></div>
  <div className="mts-preview-meta"><span>{navLabels[nav.mobile]||nav.mobile||'Standard navigation'}</span><span>{icons.size||24}px · {icons.active_style||'filled'} active</span><span>{buttons.primary||'solid'} buttons</span></div>
 </div>;
}

function PackageDetail({theme,activeTab}){
 const m=theme?.manifest||{},foundation=m.foundations||{},typography=m.typography||{},icons=m.icons||{},buttons=m.buttons||{},navigation=m.navigation||{},components=m.components||{};
 if(activeTab==='Theme')return <div className="theme-detail-grid"><div><span>Radius</span><strong>{foundation.radius||'medium'}</strong></div><div><span>Density</span><strong>{foundation.density||'comfortable'}</strong></div><div><span>Elevation</span><strong>{foundation.elevation||'soft'}</strong></div><div><span>Motion</span><strong>{foundation.motion||'standard'}</strong></div></div>;
 if(activeTab==='Typography')return <div className="theme-detail-grid"><div><span>Preset</span><strong>{typography.preset||'SYSTEM_MINIMAL'}</strong></div><div><span>Scale</span><strong>{typography.scale||'standard'}</strong></div></div>;
 if(activeTab==='Icons')return <div className="theme-detail-grid"><div><span>Pack</span><strong>{icons.pack||'LUKE_OUTLINE'}</strong></div><div><span>Size</span><strong>{icons.size||24}px</strong></div><div><span>Active</span><strong>{icons.active_style||'filled'}</strong></div><div><span>Inactive</span><strong>{icons.inactive_style||'outline'}</strong></div></div>;
 if(activeTab==='Buttons')return <div className="theme-detail-grid"><div><span>Primary</span><strong>{buttons.primary||'solid'}</strong></div><div><span>Secondary</span><strong>{buttons.secondary||'soft'}</strong></div><div><span>Icon</span><strong>{buttons.icon||'round'}</strong></div><div><span>Size</span><strong>{buttons.size||'standard'}</strong></div></div>;
 if(activeTab==='Navigation')return <div className="theme-detail-grid"><div><span>Mobile</span><strong>{navLabels[navigation.mobile]||navigation.mobile||'standard'}</strong></div><div><span>Labels</span><strong>{navigation.labels||'always'}</strong></div><div><span>Indicator</span><strong>{navigation.active_indicator||'filled_icon'}</strong></div><div><span>Container</span><strong>{navigation.container||'edge'}</strong></div></div>;
 const entries=Object.entries(components);return entries.length?<div className="theme-component-list">{entries.map(([key,value])=><div key={key}><span>{key.replace(/_/g,' ')}</span><strong>{value}</strong></div>)}</div>:<VbenAlert tone="info" title="No component recipes in this package">The package uses the current Luke Shop component defaults. Individual component switching will remain a later versioned capability rather than arbitrary code injection.</VbenAlert>;
}

function ThemeCard({theme,selected,onSelect,disabled,label}){
 return <article className={`merchant-theme-card ${selected?'selected':''}`}>
  <ThemePreview theme={theme}/>
  <div className="merchant-theme-card-copy"><div><strong>{theme.name}</strong><span>{theme.key} · v{theme.version}</span></div><p>{theme.description||theme.preview?.summary||'Approved Luke Shop design-system package.'}</p><div className="merchant-theme-tags">{(theme.preview?.tags||[]).slice(0,5).map(x=><span key={x}>{x}</span>)}</div></div>
  <VbenButton disabled={disabled||selected} onClick={()=>onSelect(theme)}>{selected?'Selected':label}</VbenButton>
 </article>;
}

export function ThemeSystemPage(){
 const{api,has,session}=useAuth();
 const[customerThemes,setCustomerThemes]=useState([]),[staffThemes,setStaffThemes]=useState([]),[customerSelection,setCustomerSelection]=useState(null),[staffSelection,setStaffSelection]=useState(null),[focus,setFocus]=useState(null),[activeTab,setActiveTab]=useState('Theme'),[busy,setBusy]=useState(''),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const canCustomerManage=has('customer_experience.manage'),canSettingsRead=has('tenant.settings.read'),canSettingsWrite=has('tenant.settings.write');
 const load=useCallback(async()=>{setError('');try{
  const customerCatalog=await api.request('/v1/merchant/customer-experience/theme-catalog');setCustomerThemes(customerCatalog.data.themes||[]);
  const cx=await api.request('/v1/merchant/customer-experience');const customerCurrent=cx.data.draft?.config?.theme_package||cx.data.published?.config?.theme_package||null;setCustomerSelection(customerCurrent);
  if(canSettingsRead){const[staffCatalog,staff]=await Promise.all([api.request('/v1/merchant/staff-experience/theme-catalog'),api.request('/v1/merchant/staff-experience')]);setStaffThemes(staffCatalog.data.themes||[]);setStaffSelection(staff.data.selection||null)}else{setStaffThemes([]);setStaffSelection(null)}
 }catch(e){setError(e.message||'Unable to load Theme System.')}},[api,canSettingsRead]);
 useEffect(()=>{load()},[load,session?.storeId]);
 const selectedCustomer=useMemo(()=>customerThemes.find(x=>same(x,customerSelection))||null,[customerThemes,customerSelection]);
 const selectedStaff=useMemo(()=>staffThemes.find(x=>same(x,staffSelection))||null,[staffThemes,staffSelection]);
 useEffect(()=>{setFocus(current=>current||selectedCustomer||customerThemes[0]||null)},[selectedCustomer,customerThemes]);
 const applyCustomer=async theme=>{setBusy('customer');setError('');setNotice('');try{const selection=selectionOf(theme);await api.request('/v1/merchant/customer-experience/apply-theme',{method:'POST',body:{theme_package:selection}});setCustomerSelection(selection);setFocus(theme);setNotice(`${theme.name} is saved to the Store Designer draft. Preview it there, then publish when ready.`)}catch(e){setError(e.message||'Unable to apply Customer theme.')}finally{setBusy('')}};
 const clearCustomer=async()=>{setBusy('customer');setError('');try{await api.request('/v1/merchant/customer-experience/apply-theme',{method:'POST',body:{theme_package:null}});setCustomerSelection(null);setNotice('Theme package removed from the draft. Existing Store Designer styling is the fallback until you publish.')}catch(e){setError(e.message||'Unable to restore legacy theme.')}finally{setBusy('')}};
 const applyStaff=async theme=>{setBusy('staff');setError('');setNotice('');try{const selection=selectionOf(theme);await api.request('/v1/merchant/staff-experience',{method:'PUT',body:{theme_package:selection}});setStaffSelection(selection);setNotice(`${theme.name} is now selected for this store’s Staff Web.`)}catch(e){setError(e.message||'Unable to apply Staff theme.')}finally{setBusy('')}};
 const clearStaff=async()=>{setBusy('staff');setError('');try{await api.request('/v1/merchant/staff-experience',{method:'PUT',body:{theme_package:null}});setStaffSelection(null);setNotice('Staff Web will use its existing default styling for this store.')}catch(e){setError(e.message||'Unable to restore Staff default.')}finally{setBusy('')}};
 return <div className="theme-system-admin" data-testid="merchant-theme-system-v1">
  <div className="theme-system-hero"><div><span>Design system distribution</span><h1>Theme System</h1><p>Select only Platform-approved, immutable theme versions. Customer themes stay inside Store Designer draft → preview → publish → rollback. Staff themes remain separately store-scoped.</p></div><div className="theme-system-hero-actions"><VbenButton variant="secondary" onClick={()=>navigate('/customer-experience')}>Open Store Designer</VbenButton></div></div>
  {error&&<VbenAlert tone="danger" title="Theme System error">{error}</VbenAlert>}{notice&&<VbenAlert tone="success" title="Theme updated">{notice}</VbenAlert>}
  <div className="theme-system-columns">
   <VbenCard title="Customer Web theme" description="Changing this saves an unpublished Store Designer draft. It never publishes the storefront automatically.">
    <div className="theme-current"><span>Draft selection</span><strong>{selectedCustomer?`${selectedCustomer.name} · v${selectedCustomer.version}`:'Store Designer legacy styling'}</strong>{customerSelection&&<button type="button" disabled={!canCustomerManage||busy==='customer'} onClick={clearCustomer}>Use Store Designer fallback</button>}</div>
    <div className="merchant-theme-grid">{customerThemes.map(theme=><ThemeCard key={`${theme.key}@${theme.version}`} theme={theme} selected={same(theme,customerSelection)} disabled={!canCustomerManage||busy==='customer'} onSelect={applyCustomer} label="Use in draft"/>)}</div>
    {!customerThemes.length&&<VbenAlert tone="info" title="No published Customer themes">Publish an approved Customer Web package from Platform Admin first.</VbenAlert>}
   </VbenCard>
   <VbenCard title="Staff Web theme" description="Independent from Customer Web. The selection applies only to the current store and does not alter operational permissions or workflows.">
    {!canSettingsRead?<VbenAlert tone="warning" title="Store settings permission required">You need tenant.settings.read to view Staff Web theme settings.</VbenAlert>:<><div className="theme-current"><span>Current store</span><strong>{selectedStaff?`${selectedStaff.name} · v${selectedStaff.version}`:'Staff Web default styling'}</strong>{staffSelection&&<button type="button" disabled={!canSettingsWrite||busy==='staff'} onClick={clearStaff}>Use Staff default</button>}</div><div className="merchant-theme-grid">{staffThemes.map(theme=><ThemeCard key={`${theme.key}@${theme.version}`} theme={theme} selected={same(theme,staffSelection)} disabled={!canSettingsWrite||busy==='staff'} onSelect={applyStaff} label="Use for Staff Web"/>)}</div>{!staffThemes.length&&<VbenAlert tone="info" title="No published Staff themes">Publish an approved Staff Web package from Platform Admin first.</VbenAlert>}</>}
   </VbenCard>
  </div>
  <VbenCard title="Package inspector" description="Review the exact approved design recipe before choosing it. These controls display the package contract; they never execute CSS, HTML, SVG or JavaScript from a theme.">
   <div className="theme-inspector-picker"><select value={focus?`${focus.key}@${focus.version}`:''} onChange={e=>{const all=[...customerThemes,...staffThemes];setFocus(all.find(x=>`${x.key}@${x.version}`===e.target.value)||null)}}><option value="">Choose a package</option>{[...customerThemes,...staffThemes].filter((x,i,a)=>a.findIndex(y=>y.key===x.key&&y.version===x.version)===i).map(x=><option key={`${x.key}@${x.version}`} value={`${x.key}@${x.version}`}>{x.name} · v{x.version}</option>)}</select></div>
   {focus?<><div className="theme-inspector-tabs">{customerTabs.map(tab=><button type="button" key={tab} className={activeTab===tab?'active':''} onClick={()=>setActiveTab(tab)}>{tab}</button>)}</div><PackageDetail theme={focus} activeTab={activeTab}/></>:<VbenAlert tone="info" title="Choose a package">Select a theme above to inspect its approved foundations and component recipes.</VbenAlert>}
  </VbenCard>
 </div>;
}
