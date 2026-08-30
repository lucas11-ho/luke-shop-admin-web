import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{navigate}from'../app/router.js';
import{VbenAlert,VbenBadge,VbenButton,VbenCard,VbenMetric,VbenPermissionNote,VbenSelect,VbenSkeleton,VbenTable,VbenToast,vbenStatusTone}from'../components/VbenUI.jsx';

export function DriverAccessPage(){
 const{api,has}=useAuth();
 const[drivers,setDrivers]=useState([]),[staff,setStaff]=useState([]),[links,setLinks]=useState({}),[loading,setLoading]=useState(true),[busy,setBusy]=useState(''),[error,setError]=useState(null),[toast,setToast]=useState('');
 const canRead=has('delivery.read'),canManage=has('delivery.manage'),canStaffRead=has('merchant.staff.read'),canStaffManage=has('merchant.staff.manage');
 const activeStaff=useMemo(()=>staff.filter(x=>x.status==='ACTIVE'),[staff]);
 const linked=drivers.filter(x=>x.merchant_user_id).length;

 const load=async()=>{
  if(!canRead)return;
  setLoading(true);setError(null);
  try{
   const jobs=[api.request('/v1/merchant/delivery/drivers')];
   if(canStaffRead)jobs.push(api.request('/v1/merchant/staff',{query:{status:'ACTIVE',limit:200}}));
   const results=await Promise.all(jobs),driverRows=results[0].data.drivers||[],staffRows=canStaffRead?(results[1]?.data.staff||[]):[];
   setDrivers(driverRows);setStaff(staffRows);setLinks(Object.fromEntries(driverRows.map(d=>[d.id,d.merchant_user_id||''])));
  }catch(e){setError(e)}finally{setLoading(false)}
 };
 useEffect(()=>{load()},[canRead,canStaffRead]);

 const save=async driver=>{
  if(!canManage||!canStaffRead)return;
  const merchantUserId=links[driver.id]||null;
  setBusy(driver.id);setError(null);
  try{
   await api.request(`/v1/merchant/delivery/drivers/${encodeURIComponent(driver.id)}`,{method:'PATCH',body:{merchant_user_id:merchantUserId}});
   setToast(merchantUserId?'Driver login linked':'Driver login unlinked');
   await load();
  }catch(e){setError(e)}finally{setBusy('')}
 };

 if(!canRead)return <VbenPermissionNote permission="delivery.read"/>;
 return <div className="vben-access-page" data-testid="driver-login-access-v1">
  <div className="vben-access-hero"><div><span className="vben-access-eyebrow">Delivery security</span><h1>Driver login & access</h1><p>Link an active Merchant staff account to each delivery driver. Driver mode uses the existing Merchant sign-in and remains scoped to that driver's assigned work.</p></div><div className="vben-access-actions"><VbenButton variant="secondary" onClick={()=>navigate('/delivery')}>Back to Delivery</VbenButton>{canStaffRead&&<VbenButton onClick={()=>navigate('/access')}>Open Staff & Access</VbenButton>}</div></div>
  {error&&<VbenAlert tone="danger" title={error.code||'Driver access request failed'}>{error.message||'Unable to load or update driver access.'}{error.requestId&&<><br/><small>Request ID: {error.requestId}</small></>}</VbenAlert>}
  <VbenAlert tone="info" title="How a driver signs in">The driver's <strong>username is the linked staff email</strong>. The password is that staff account's existing Merchant password. Passwords are hashed and are never displayed after creation. If the driver does not know it, an authorized staff administrator must reset it in Settings → Access.</VbenAlert>
  {!canStaffRead&&<VbenAlert tone="warning" title="Merchant staff read permission required">You can see existing linked email addresses returned with each driver, but selecting a different login requires <code>merchant.staff.read</code>. Ask an OWNER or staff administrator to link the account.</VbenAlert>}
  <div className="vben-access-metrics"><VbenMetric label="Drivers" value={drivers.length} detail="Store scoped" icon="delivery"/><VbenMetric label="Linked logins" value={linked} detail={`${drivers.length-linked} unlinked`} icon="lock" tone={linked===drivers.length?'success':'warning'}/><VbenMetric label="Active staff" value={activeStaff.length} detail={canStaffRead?'Eligible login accounts':'Not loaded'} icon="users" tone="primary"/></div>
  <VbenCard title="Driver login linkage" description="Linking changes only authentication identity. Dispatch assignment and driver permissions remain controlled by the Backend driver-scoped routes.">
   {loading?<VbenSkeleton lines={6}/>:<VbenTable rows={drivers} keyField="id" emptyTitle="No delivery drivers" emptyDescription="Create a driver in Delivery → Drivers first." columns={[
    {key:'driver',label:'Driver',render:d=><div className="vben-access-person"><span>{(d.display_name||'D').slice(0,1).toUpperCase()}</span><div><strong>{d.display_name}</strong><small>{[d.vehicle_type,d.vehicle_label].filter(Boolean).join(' · ')||d.phone_e164||'No vehicle label'}</small></div></div>},
    {key:'status',label:'Driver status',render:d=><VbenBadge tone={vbenStatusTone(d.status)}>{d.status}</VbenBadge>},
    {key:'current',label:'Current login',render:d=>d.merchant_user_email?<div><strong>{d.merchant_user_email}</strong><small style={{display:'block',color:'#64748b',marginTop:3}}>Merchant staff account</small></div>:<VbenBadge tone="warning">NO LOGIN LINKED</VbenBadge>},
    {key:'link',label:'Linked staff account',render:d=>canStaffRead?<VbenSelect value={links[d.id]??''} onChange={e=>setLinks(v=>({...v,[d.id]:e.target.value}))} disabled={!canManage||busy===d.id}><option value="">No linked login</option>{activeStaff.map(s=><option key={s.id} value={s.id}>{s.display_name} · {s.email}</option>)}</VbenSelect>:<span>{d.merchant_user_email||'—'}</span>},
    {key:'action',label:'',render:d=>canManage&&canStaffRead?<VbenButton size="sm" loading={busy===d.id} onClick={()=>save(d)} disabled={(links[d.id]||'')===(d.merchant_user_id||'')}>Save link</VbenButton>:'—'},
   ]}/>} 
  </VbenCard>
  <VbenCard title="Need to create or reset the login?" description="Driver passwords are never retrievable in plaintext."><div className="detail-grid"><div><span>Create account</span><strong>Settings → Access → Staff → Create staff</strong></div><div><span>Reset password</span><strong>Settings → Access → Staff → View → Reset password</strong></div><div><span>Driver sign-in</span><strong>Use the normal Merchant Admin login page</strong></div><div><span>After sign-in</span><strong>My profile → Open Driver mode</strong></div></div>{canStaffManage&&<div className="right"><VbenButton onClick={()=>navigate('/access')}>Manage staff accounts</VbenButton></div>}</VbenCard>
  <VbenToast message={toast} onDone={()=>setToast('')}/>
 </div>;
}
