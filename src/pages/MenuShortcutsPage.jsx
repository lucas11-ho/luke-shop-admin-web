import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{PlatformIconArtwork,PlatformIconPicker}from'../components/PlatformIconPicker.jsx';
import{VbenAlert,VbenBadge,VbenButton,VbenCard,VbenEmpty,VbenField,VbenInput,VbenModal,VbenPermissionNote,VbenSelect,VbenSkeleton,VbenTable,VbenToast,vbenStatusTone}from'../components/VbenUI.jsx';

const DESTINATIONS=[['HOME','Home'],['EXPLORE','Explore / Promotions'],['CART','Cart'],['ORDERS','Orders'],['PROFILE','Account']];
const destinationLabel=value=>DESTINATIONS.find(([key])=>key===value)?.[1]||value;
const blank={title:'',destination:'EXPLORE',status:'ACTIVE',sort_order:0,icon_key:''};
function ErrorBox({error}){return error?<VbenAlert tone="danger" title={error.code||'Request failed'}>{error.message||String(error)}</VbenAlert>:null}

export function MenuShortcutsPage(){
 const{api,has}=useAuth();
 const[rows,setRows]=useState([]),[icons,setIcons]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(null),[toast,setToast]=useState('');
 const[form,setForm]=useState(blank),[edit,setEdit]=useState(null),[busy,setBusy]=useState(false);
 const iconMap=useMemo(()=>new Map(icons.map(icon=>[icon.key,icon])),[icons]);
 const load=async()=>{setLoading(true);setError(null);try{const[list,library]=await Promise.all([api.request('/v1/merchant/menu-shortcuts'),api.request('/v1/merchant/icon-library?scope=MENU')]);setRows(list.data.menu_shortcuts||[]);setIcons(library.data.icons||[])}catch(e){setError(e)}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const create=async event=>{event.preventDefault();setBusy(true);setError(null);try{await api.request('/v1/merchant/menu-shortcuts',{method:'POST',body:{title:form.title.trim(),destination:form.destination,status:form.status,sort_order:Number(form.sort_order||0),icon_key:form.icon_key||null}});setForm(blank);setToast('Menu shortcut created');await load()}catch(e){setError(e)}finally{setBusy(false)}};
 const save=async()=>{if(!edit)return;setBusy(true);setError(null);try{await api.request(`/v1/merchant/menu-shortcuts/${encodeURIComponent(edit.id)}`,{method:'PATCH',body:{title:edit.title.trim(),destination:edit.destination,status:edit.status,sort_order:Number(edit.sort_order||0),icon_key:edit.icon_key||null}});setEdit(null);setToast('Menu shortcut updated');await load()}catch(e){setError(e)}finally{setBusy(false)}};
 if(!has('customer_experience.read'))return <VbenPermissionNote permission="customer_experience.read"/>;
 const columns=[
  {key:'icon_key',label:'Icon',render:row=>{const icon=iconMap.get(row.icon_key)||row.icon;return <span className="menu-shortcut-icon-cell">{icon?<PlatformIconArtwork icon={icon} size={30}/>:<span className="menu-shortcut-icon-none">—</span>}</span>}},
  {key:'title',label:'Shortcut',render:row=><button type="button" className="vben-product-category-link" onClick={()=>setEdit({...row})}><strong>{row.title}</strong><small>{destinationLabel(row.destination)}</small></button>},
  {key:'destination',label:'Destination',render:row=>destinationLabel(row.destination)},
  {key:'status',label:'Status',render:row=><VbenBadge tone={vbenStatusTone(row.status)}>{row.status}</VbenBadge>},
  {key:'sort_order',label:'Order'},
 ];
 return <div className="menu-shortcuts-page">
  <header className="vben-products-head"><div><div className="vben-products-kicker">Storefront navigation</div><h1>Menu Shortcuts</h1><p>Create safe storefront feature shortcuts and choose only icons the Platform Owner published for Menu use. Destinations are restricted to Shope routes; arbitrary URLs are not accepted.</p></div></header>
  <ErrorBox error={error}/>
  <div className="menu-shortcuts-layout">
   <VbenCard title="Storefront shortcuts" description="Inactive shortcuts remain saved but do not render. Existing retired icons can remain until you deliberately change them.">{loading?<VbenSkeleton lines={6}/>:rows.length?<VbenTable rows={rows} keyField="id" columns={columns} ariaLabel="Storefront menu shortcuts"/>:<VbenEmpty title="No menu shortcuts yet" description="Create a shortcut such as Promotions, Shop, Orders or Account."/>}</VbenCard>
   {has('customer_experience.manage')&&<VbenCard title="Create shortcut" description="Only Platform-published MENU icons are selectable."><form onSubmit={create} className="menu-shortcut-form"><VbenField label="Title" required><VbenInput value={form.title} maxLength={80} onChange={e=>setForm({...form,title:e.target.value})} required/></VbenField><VbenField label="Destination" hint="A bounded internal storefront destination. External links are intentionally unavailable."><VbenSelect value={form.destination} onChange={e=>setForm({...form,destination:e.target.value})}>{DESTINATIONS.map(([value,label])=><option key={value} value={value}>{label}</option>)}</VbenSelect></VbenField><div className="menu-shortcut-form-row"><VbenField label="Status"><VbenSelect value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>ACTIVE</option><option>INACTIVE</option></VbenSelect></VbenField><VbenField label="Sort order"><VbenInput type="number" min="0" max="10000" value={form.sort_order} onChange={e=>setForm({...form,sort_order:e.target.value})}/></VbenField></div><MenuIconField api={api} icons={icons} selected={form.icon_key} onChange={value=>setForm({...form,icon_key:value})}/><VbenButton type="submit" loading={busy}>Create shortcut</VbenButton></form></VbenCard>}
  </div>
  <VbenModal open={!!edit} onClose={()=>setEdit(null)} title="Edit menu shortcut" eyebrow="Storefront navigation" size="lg" footer={<><VbenButton variant="secondary" onClick={()=>setEdit(null)}>Cancel</VbenButton><VbenButton onClick={save} loading={busy}>Save shortcut</VbenButton></>}>
   {edit&&<div className="menu-shortcut-form"><VbenField label="Title"><VbenInput value={edit.title} maxLength={80} onChange={e=>setEdit({...edit,title:e.target.value})}/></VbenField><VbenField label="Destination"><VbenSelect value={edit.destination} onChange={e=>setEdit({...edit,destination:e.target.value})}>{DESTINATIONS.map(([value,label])=><option key={value} value={value}>{label}</option>)}</VbenSelect></VbenField><div className="menu-shortcut-form-row"><VbenField label="Status"><VbenSelect value={edit.status} onChange={e=>setEdit({...edit,status:e.target.value})}><option>ACTIVE</option><option>INACTIVE</option></VbenSelect></VbenField><VbenField label="Sort order"><VbenInput type="number" min="0" max="10000" value={edit.sort_order||0} onChange={e=>setEdit({...edit,sort_order:e.target.value})}/></VbenField></div><MenuIconField api={api} icons={icons} selected={edit.icon_key||''} onChange={value=>setEdit({...edit,icon_key:value})} currentUnavailable={Boolean(edit.icon_key&&!iconMap.has(edit.icon_key))}/></div>}
  </VbenModal>
  <VbenToast message={toast} onDone={()=>setToast('')}/>
 </div>;
}

function MenuIconField({api,icons,selected,onChange,currentUnavailable=false}){
 return <VbenField label="Menu icon" hint="Only icons currently published by the Platform Owner for Menu use are selectable."><div className="menu-shortcut-picker-wrap">{currentUnavailable&&<VbenAlert tone="warning" title="Existing icon is no longer selectable">Leave it unchanged to keep the historical assignment, clear it, or select another currently approved Menu icon.</VbenAlert>}<div className="menu-shortcut-picker-actions"><span>{selected?`Selected: ${selected}`:'No icon selected'}</span>{selected&&<VbenButton type="button" size="sm" variant="secondary" onClick={()=>onChange('')}>Clear icon</VbenButton>}</div><PlatformIconPicker api={api} icons={icons} scope="MENU" selected={selected} onSelect={row=>onChange(row.key)} emptyTitle="No Menu icons published"/></div></VbenField>;
}
