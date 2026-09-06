import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{PlatformIconArtwork,PlatformIconPicker}from'../components/PlatformIconPicker.jsx';
import{VbenAlert,VbenBadge,VbenButton,VbenCard,VbenEmpty,VbenField,VbenInput,VbenModal,VbenPermissionNote,VbenSelect,VbenSkeleton,VbenTable,VbenTextarea,VbenToast,vbenStatusTone}from'../components/VbenUI.jsx';

const blank={name:'',slug:'',description:'',status:'ACTIVE',sort_order:0,icon_key:''};

function ErrorBox({error}){return error?<VbenAlert tone="danger" title={error.code||'Request failed'}>{error.message||String(error)}</VbenAlert>:null}

export function CategoriesPage(){
 const{api,has}=useAuth();
 const[rows,setRows]=useState([]),[icons,setIcons]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(null),[toast,setToast]=useState('');
 const[form,setForm]=useState(blank),[edit,setEdit]=useState(null),[originalIcon,setOriginalIcon]=useState(''),[busy,setBusy]=useState(false);
 const iconMap=useMemo(()=>new Map(icons.map(icon=>[icon.key,icon])),[icons]);

 const load=async()=>{setLoading(true);setError(null);try{
   const[cats,refs,library]=await Promise.all([
     api.request('/v1/merchant/categories'),
     api.request('/v1/merchant/category-icons'),
     api.request('/v1/merchant/icon-library?scope=CATEGORY'),
   ]);
   const byCategory=new Map((refs.data.category_icons||[]).map(row=>[row.category_id,row.icon_key||'']));
   setRows((cats.data.categories||[]).map(row=>({...row,icon_key:byCategory.get(row.public_id)||''})));
   setIcons(library.data.icons||[]);
 }catch(e){setError(e)}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);

 const create=async event=>{event.preventDefault();setBusy(true);setError(null);let createdId='';try{
   const body={name:form.name.trim(),status:form.status,sort_order:Number(form.sort_order||0)};
   if(form.slug.trim())body.slug=form.slug.trim();if(form.description.trim())body.description=form.description.trim();
   const created=await api.request('/v1/merchant/categories',{method:'POST',body});createdId=created.data.category.public_id;
   if(form.icon_key)await api.request(`/v1/merchant/categories/${encodeURIComponent(createdId)}/icon`,{method:'PUT',body:{icon_key:form.icon_key}});
   setForm(blank);setToast('Category created');await load();
 }catch(e){await load().catch(()=>{});setError(createdId?{code:e.code||'CATEGORY_ICON_SAVE_FAILED',message:`Category was created, but the selected icon could not be saved. ${e.message||'Choose another approved Category icon and edit the category.'}`}:e)}finally{setBusy(false)}};

 const openEdit=row=>{setEdit({...row});setOriginalIcon(row.icon_key||'')};
 const save=async()=>{if(!edit)return;setBusy(true);setError(null);const nextIcon=edit.icon_key||'';let detailsSaved=false;try{
   await api.request(`/v1/merchant/categories/${encodeURIComponent(edit.public_id)}`,{method:'PATCH',body:{name:edit.name.trim(),slug:edit.slug.trim(),description:edit.description?.trim()||null,status:edit.status,sort_order:Number(edit.sort_order||0)}});detailsSaved=true;
   if(nextIcon!==originalIcon)await api.request(`/v1/merchant/categories/${encodeURIComponent(edit.public_id)}/icon`,{method:'PUT',body:{icon_key:nextIcon||null}});
   setEdit(null);setOriginalIcon('');setToast('Category updated');await load();
 }catch(e){await load().catch(()=>{});setError(detailsSaved&&nextIcon!==originalIcon?{code:e.code||'CATEGORY_ICON_SAVE_FAILED',message:`Category details were saved, but the icon change was rejected. ${e.message||'Choose another approved Category icon.'}`}:e)}finally{setBusy(false)}};

 if(!has('catalog.read'))return <VbenPermissionNote permission="catalog.read"/>;
 const columns=[
   {key:'icon_key',label:'Icon',render:row=>{const icon=iconMap.get(row.icon_key);return <span className="category-icon-cell">{icon?<PlatformIconArtwork icon={icon} size={30}/>:row.icon_key?<span className="category-icon-unavailable" title="This existing icon is no longer offered for new selection">!</span>:<span className="category-icon-none">—</span>}</span>}},
   {key:'name',label:'Category',render:row=><button type="button" className="vben-product-category-link" onClick={()=>openEdit(row)}><strong>{row.name}</strong><small>/{row.slug}</small></button>},
   {key:'status',label:'Status',render:row=><VbenBadge tone={vbenStatusTone(row.status)}>{row.status}</VbenBadge>},
   {key:'sort_order',label:'Order'},
   {key:'description',label:'Description',render:row=><span className="vben-product-truncate">{row.description||'—'}</span>},
 ];
 return <div className="category-icon-page">
   <header className="vben-products-head"><div><div className="vben-products-kicker">Catalog taxonomy</div><h1>Categories</h1><p>Create storefront categories and assign only Platform-approved Category icons. Client admins never upload executable icon source.</p></div></header>
   <ErrorBox error={error}/>
   <div className="category-icon-layout">
     <VbenCard title="Storefront categories" description="Existing categories without icons remain valid. Retired icons can continue rendering but cannot be newly selected.">
       {loading?<VbenSkeleton lines={6}/>:rows.length?<VbenTable rows={rows} keyField="public_id" columns={columns} ariaLabel="Merchant categories"/>:<VbenEmpty title="No categories yet" description="Create the first storefront category."/>}
     </VbenCard>
     {has('catalog.write')&&<VbenCard title="Create category" description="Choose from icons the Platform Owner published for Category use.">
       <form onSubmit={create} className="category-icon-form">
         <VbenField label="Category name" required><VbenInput value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></VbenField>
         <VbenField label="Slug" hint="Leave blank to generate from the category name."><VbenInput value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})}/></VbenField>
         <VbenField label="Description"><VbenTextarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></VbenField>
         <div className="category-icon-form-row"><VbenField label="Status"><VbenSelect value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>ACTIVE</option><option>INACTIVE</option></VbenSelect></VbenField><VbenField label="Sort order"><VbenInput type="number" value={form.sort_order} onChange={e=>setForm({...form,sort_order:e.target.value})}/></VbenField></div>
         <CategoryIconField api={api} icons={icons} selected={form.icon_key} onChange={value=>setForm({...form,icon_key:value})}/>
         <VbenButton type="submit" loading={busy}>Create category</VbenButton>
       </form>
     </VbenCard>}
   </div>
   <VbenModal open={!!edit} onClose={()=>setEdit(null)} title="Edit category" eyebrow="Catalog taxonomy" size="lg" footer={<><VbenButton variant="secondary" onClick={()=>setEdit(null)}>Cancel</VbenButton><VbenButton onClick={save} loading={busy}>Save category</VbenButton></>}>
     {edit&&<div className="category-icon-form"><VbenField label="Name"><VbenInput value={edit.name} onChange={e=>setEdit({...edit,name:e.target.value})}/></VbenField><VbenField label="Slug"><VbenInput value={edit.slug} onChange={e=>setEdit({...edit,slug:e.target.value})}/></VbenField><VbenField label="Description"><VbenTextarea value={edit.description||''} onChange={e=>setEdit({...edit,description:e.target.value})}/></VbenField><div className="category-icon-form-row"><VbenField label="Status"><VbenSelect value={edit.status} onChange={e=>setEdit({...edit,status:e.target.value})}><option>ACTIVE</option><option>INACTIVE</option></VbenSelect></VbenField><VbenField label="Sort order"><VbenInput type="number" value={edit.sort_order||0} onChange={e=>setEdit({...edit,sort_order:e.target.value})}/></VbenField></div><CategoryIconField api={api} icons={icons} selected={edit.icon_key||''} onChange={value=>setEdit({...edit,icon_key:value})} currentUnavailable={Boolean(edit.icon_key&&!iconMap.has(edit.icon_key))}/></div>}
   </VbenModal>
   <VbenToast message={toast} onDone={()=>setToast('')}/>
 </div>;
}

function CategoryIconField({api,icons,selected,onChange,currentUnavailable=false}){
 return <VbenField label="Category icon" hint="Only icons currently published by the Platform Owner for Category use are selectable."><div className="category-icon-picker-wrap">{currentUnavailable&&<VbenAlert tone="warning" title="Existing icon is no longer selectable">You can keep this existing icon by leaving it unchanged, clear it, or choose another currently approved icon.</VbenAlert>}<div className="category-icon-picker-actions"><span>{selected?`Selected: ${selected}`:'No icon selected'}</span>{selected&&<VbenButton type="button" size="sm" variant="secondary" onClick={()=>onChange('')}>Clear icon</VbenButton>}</div><PlatformIconPicker api={api} icons={icons} scope="CATEGORY" selected={selected} onSelect={row=>onChange(row.key)} emptyTitle="No Category icons published"/></div></VbenField>;
}