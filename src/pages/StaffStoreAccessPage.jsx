import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{VbenAlert,VbenBadge,VbenButton,VbenCard,VbenModal,VbenSkeleton,VbenTable,VbenToast}from'../components/VbenUI.jsx';

const uniq=values=>[...new Set(values)];
const modeLabel=mode=>mode==='ASSIGNED_STORES'?'Assigned stores only':'All stores';

export function StaffStoreAccessPage(){
 const{session,api,has}=useAuth();
 const[staff,setStaff]=useState([]),[stores,setStores]=useState([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(''),[error,setError]=useState(null),[toast,setToast]=useState('');
 const[editing,setEditing]=useState(null),[scope,setScope]=useState(null),[mode,setMode]=useState('ALL_STORES'),[storeIds,setStoreIds]=useState([]);
 const canRead=has('merchant.staff.read'),canManage=has('merchant.staff.manage'),canReadStores=has('stores.read');
 const isOwner=(session?.user?.roles||[]).includes('OWNER');
 const canConfigure=canRead&&canManage&&canReadStores;
 const activeStores=useMemo(()=>stores.filter(store=>store.status==='ACTIVE'),[stores]);
 const selectedCount=mode==='ALL_STORES'?activeStores.length:storeIds.length;

 const load=async()=>{
  if(!canRead){setLoading(false);return}
  setLoading(true);setError(null);
  try{
   const jobs=[api.request('/v1/merchant/staff').then(r=>setStaff(r.data.staff||[]))];
   if(canReadStores)jobs.push(api.request('/v1/merchant/stores').then(r=>setStores(r.data.stores||[])));else setStores([]);
   await Promise.all(jobs);
  }catch(e){setError(e)}finally{setLoading(false)}
 };
 useEffect(()=>{load()},[canRead,canReadStores]);

 const open=async row=>{
  setBusy(`open:${row.id}`);setError(null);
  try{
   const r=await api.request(`/v1/merchant/staff/${encodeURIComponent(row.id)}/store-access`),data=r.data.staff,next=data.store_scope||{mode:'ALL_STORES',stores:[]};
   setEditing({...row,...data});setScope(next);setMode(next.mode||'ALL_STORES');setStoreIds((next.stores||[]).map(store=>store.id));
  }catch(e){setError(e)}finally{setBusy('')}
 };
 const close=()=>{if(busy==='save')return;setEditing(null);setScope(null);setMode('ALL_STORES');setStoreIds([])};
 const toggleStore=id=>setStoreIds(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);
 const save=async()=>{
  if(!editing||!canConfigure)return;
  const ids=mode==='ASSIGNED_STORES'?uniq(storeIds):[];
  if(mode==='ASSIGNED_STORES'&&!ids.length){setError({code:'STAFF_STORE_ASSIGNMENT_REQUIRED',message:'Select at least one active store before using Assigned stores only.'});return}
  setBusy('save');setError(null);
  try{
   const r=await api.request(`/v1/merchant/staff/${encodeURIComponent(editing.id)}/store-access`,{method:'PUT',body:{mode,store_ids:ids}}),saved=r.data.staff.store_scope;
   setScope(saved);setMode(saved.mode);setStoreIds((saved.stores||[]).map(store=>store.id));setToast(`Store access updated for ${editing.display_name}`);
  }catch(e){setError(e)}finally{setBusy('')}
 };

 if(!canRead)return <div className="vben-access-page"><div className="vben-access-hero"><div><span className="vben-access-eyebrow">Staff security</span><h1>Staff store access</h1><p>Your account does not have merchant.staff.read.</p></div></div><VbenAlert tone="warning" title="Permission required">Staff store scope is managed only by authorized merchant administrators.</VbenAlert></div>;

 return <div className="vben-access-page">
  <div className="vben-access-hero"><div><span className="vben-access-eyebrow">Staff security</span><h1>Staff store access</h1><p>Limit an employee to specific stores. The Backend enforces the assignment on every authenticated request; this screen does not grant access by itself.</p></div></div>
  {error&&<VbenAlert tone="danger" title={error.code||'Request failed'}>{error.message||'Unable to update staff store access.'}</VbenAlert>}
  {!canConfigure&&<VbenAlert tone="warning" title="Additional permissions required">Editing requires merchant.staff.read, merchant.staff.manage and stores.read. Current assignments remain enforced by the Backend.</VbenAlert>}
  <VbenAlert tone="info" title="Server-authoritative boundary">Existing staff stay on All stores until explicitly narrowed. OWNER accounts remain All stores and cannot be locked to a subset. Store assignment is separate from roles and permissions; both checks must pass.</VbenAlert>
  {loading?<VbenCard><VbenSkeleton lines={7}/></VbenCard>:<VbenCard title="Merchant staff" description={`${staff.length} staff account${staff.length===1?'':'s'} · ${activeStores.length} active store${activeStores.length===1?'':'s'}`}>
   <VbenTable rows={staff} emptyTitle="No staff accounts" ariaLabel="Staff store access" columns={[
    {key:'staff',label:'Staff',render:r=><div className="vben-access-person"><span>{(r.display_name||r.email).slice(0,1).toUpperCase()}</span><div><strong>{r.display_name}</strong><small>{r.email}</small></div></div>},
    {key:'roles',label:'Roles',render:r=><div className="vben-access-badges">{(r.roles||[]).map(role=><VbenBadge key={role}>{role}</VbenBadge>)}</div>},
    {key:'scope',label:'Store access',render:r=>(r.roles||[]).includes('OWNER')?<VbenBadge tone="success">ALL STORES · OWNER</VbenBadge>:<span>Open to review</span>},
    {key:'action',label:'Action',render:r=><VbenButton size="sm" variant="secondary" loading={busy===`open:${r.id}`} onClick={()=>open(r)}>Manage stores</VbenButton>},
   ]}/>
  </VbenCard>}

  <VbenModal open={Boolean(editing)} onClose={close} title={editing?`Store access · ${editing.display_name}`:'Store access'} size="lg" footer={<><VbenButton variant="secondary" onClick={close}>Close</VbenButton>{canConfigure&&editing&&!((editing.roles||[]).includes('OWNER'))&&<VbenButton loading={busy==='save'} onClick={save}>Save store access</VbenButton>}</>}>
   {editing&&<div className="vben-access-form-stack">
    <div className="vben-access-current"><div><span>Staff</span><strong>{editing.display_name}</strong></div><div><span>Email</span><strong>{editing.email}</strong></div><div><span>Current scope</span><strong>{modeLabel(scope?.mode)}</strong></div></div>
    {(editing.roles||[]).includes('OWNER')?<VbenAlert tone="info" title="OWNER protection">OWNER is always effective All stores. The Backend rejects attempts to narrow this account.</VbenAlert>:<>
     <div className="vben-access-choice-grid">
      <label className="vben-access-choice"><input type="radio" name="staff-store-mode" checked={mode==='ALL_STORES'} onChange={()=>setMode('ALL_STORES')}/><div><strong>All stores</strong><small>Keep access to every store in this tenant, including stores created later.</small></div></label>
      <label className="vben-access-choice"><input type="radio" name="staff-store-mode" checked={mode==='ASSIGNED_STORES'} onChange={()=>setMode('ASSIGNED_STORES')}/><div><strong>Assigned stores only</strong><small>Deny any store that is not explicitly selected below.</small></div></label>
     </div>
     {mode==='ASSIGNED_STORES'&&<div><div className="vben-access-section-heading"><strong>Authorized stores</strong><span>{selectedCount} selected</span></div><div className="vben-access-choice-grid">{activeStores.map(store=><label className="vben-access-choice" key={store.id}><input type="checkbox" checked={storeIds.includes(store.id)} onChange={()=>toggleStore(store.id)}/><div><strong>{store.name}</strong><small>{store.slug}{store.is_primary?' · Primary store':''}</small></div></label>)}</div>{!activeStores.length&&<VbenAlert tone="warning" title="No active stores">Create or reactivate a store before assigning scoped access.</VbenAlert>}</div>}
     <VbenAlert tone="info" title="Immediate enforcement">Saving changes affects already-issued sessions because the Backend re-reads the employee's current store assignments on each authenticated request.</VbenAlert>
    </>}
   </div>}
  </VbenModal>
  {toast&&<VbenToast onClose={()=>setToast('')}>{toast}</VbenToast>}
 </div>;
}
