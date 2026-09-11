import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{VbenAlert,VbenBadge,VbenButton,VbenSkeleton,VbenToast}from'./VbenUI.jsx';

const safeList=value=>Array.isArray(value)?value:[];
const uniq=values=>[...new Set(values)];
const roleKeys=staff=>safeList(staff?.roles).map(role=>typeof role==='string'?role:role?.key).filter(Boolean);

export function StaffStoreAccessInline({staff}){
 const{api,has}=useAuth();
 const[stores,setStores]=useState([]),[scope,setScope]=useState(null),[mode,setMode]=useState('ALL_STORES'),[storeIds,setStoreIds]=useState([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(null),[toast,setToast]=useState('');
 const canRead=has('merchant.staff.read'),canManage=has('merchant.staff.manage'),canReadStores=has('stores.read'),canConfigure=canRead&&canManage&&canReadStores;
 const owner=roleKeys(staff).includes('OWNER');
 const activeStores=useMemo(()=>stores.filter(store=>store?.status==='ACTIVE'),[stores]);
 useEffect(()=>{let live=true;if(!staff?.id||!canRead){setLoading(false);return()=>{live=false}}setLoading(true);setError(null);const jobs=[api.request(`/v1/merchant/staff/${encodeURIComponent(staff.id)}/store-access`)];if(canReadStores)jobs.push(api.request('/v1/merchant/stores'));Promise.all(jobs).then(([scopeResult,storeResult])=>{if(!live)return;const next=scopeResult?.data?.staff?.store_scope||{mode:'ALL_STORES',stores:[]};setScope(next);setMode(next.mode||'ALL_STORES');setStoreIds(safeList(next.stores).map(store=>store.id).filter(Boolean));setStores(safeList(storeResult?.data?.stores))}).catch(err=>{if(live)setError(err)}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[api,staff?.id,canRead,canReadStores]);
 const toggleStore=id=>setStoreIds(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);
 const save=async()=>{if(!staff?.id||!canConfigure||owner)return;const ids=mode==='ASSIGNED_STORES'?uniq(storeIds):[];if(mode==='ASSIGNED_STORES'&&!ids.length){setError({code:'STAFF_STORE_ASSIGNMENT_REQUIRED',message:'Select at least one active store before restricting this account.'});return}setBusy(true);setError(null);try{const result=await api.request(`/v1/merchant/staff/${encodeURIComponent(staff.id)}/store-access`,{method:'PUT',body:{mode,store_ids:ids}});const next=result?.data?.staff?.store_scope||{mode,stores:[]};setScope(next);setMode(next.mode||mode);setStoreIds(safeList(next.stores).map(store=>store.id).filter(Boolean));setToast('Store access updated')}catch(err){setError(err)}finally{setBusy(false)}};
 if(!canRead)return null;
 if(loading)return <div className="a10-3-store-inline"><strong>Store access</strong><VbenSkeleton lines={3}/></div>;
 return <div className="a10-3-store-inline">
  <div className="a10-3-section-heading"><div><strong>Store access</strong><span>Backend-enforced store scope for this staff account.</span></div><VbenBadge tone={scope?.mode==='ASSIGNED_STORES'?'warning':'success'}>{scope?.mode==='ASSIGNED_STORES'?'ASSIGNED STORES':'ALL STORES'}</VbenBadge></div>
  {error&&<VbenAlert tone="danger" title={error.code||'Store access error'}>{error.message||'Unable to load or save store access.'}</VbenAlert>}
  {owner?<VbenAlert tone="info" title="OWNER protection">OWNER is always effective All stores. The Backend rejects attempts to narrow this account.</VbenAlert>:<>
   {!canConfigure&&<VbenAlert tone="warning" title="Read-only store scope">Editing requires merchant.staff.manage and stores.read. The current Backend scope remains enforced.</VbenAlert>}
   <div className="a10-3-scope-options">
    <label><input type="radio" name={`scope-${staff.id}`} checked={mode==='ALL_STORES'} disabled={!canConfigure} onChange={()=>setMode('ALL_STORES')}/><div><strong>All stores</strong><span>Includes stores created later.</span></div></label>
    <label><input type="radio" name={`scope-${staff.id}`} checked={mode==='ASSIGNED_STORES'} disabled={!canConfigure} onChange={()=>setMode('ASSIGNED_STORES')}/><div><strong>Assigned stores only</strong><span>Deny stores not explicitly selected.</span></div></label>
   </div>
   {mode==='ASSIGNED_STORES'&&<div className="a10-3-store-grid">{activeStores.map(store=><label key={store.id}><input type="checkbox" disabled={!canConfigure} checked={storeIds.includes(store.id)} onChange={()=>toggleStore(store.id)}/><div><strong>{store.name}</strong><span>{store.slug}{store.is_primary?' · Primary':''}</span></div></label>)}{!activeStores.length&&<VbenAlert tone="warning" title="No active stores">No visible active store is available for assignment.</VbenAlert>}</div>}
   {canConfigure&&<div className="a10-3-store-actions"><VbenButton size="sm" loading={busy} onClick={save}>Save store access</VbenButton><span>Changes are enforced on already-issued sessions.</span></div>}
  </>}
  {toast&&<VbenToast message={toast} onDone={()=>setToast('')}/>} 
 </div>;
}
