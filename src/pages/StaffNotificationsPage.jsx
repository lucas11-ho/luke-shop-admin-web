import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{VbenAlert,VbenBadge,VbenButton,VbenCard,VbenMetric,VbenSkeleton,VbenSwitch,VbenTable,VbenToast}from'../components/VbenUI.jsx';

const INFO={
 DRIVER_ASSIGNMENT:['Driver assignments','Notify the assigned Driver when a delivery is assigned.'],
 DRIVER_REASSIGNMENT:['Driver reassignments','Notify affected Drivers when an assignment changes.'],
 DISPATCH_CANCELLED:['Dispatch cancellations','Notify the assigned Driver when a dispatch is cancelled.'],
 KITCHEN_NEW_ORDER:['New kitchen orders','Notify Kitchen staff when a new food order needs review.'],
 KITCHEN_READY:['Kitchen ready','Notify Dispatcher staff when Kitchen marks work ready.'],
 CASHIER_ACTION:['Cashier actions','Notify Cashier staff when COD custody or cashier attention is required.'],
 COD_RECONCILIATION:['COD reconciliation','Notify only staff who hold both delivery.manage and payments.manage.'],
 DISPATCH_MESSAGE:['Delivery messages','Notify authorized Driver/Dispatcher staff about new delivery conversation activity.'],
};
const title=value=>INFO[value]?.[0]||String(value||'').replaceAll('_',' ').toLowerCase().replace(/(^|\s)\S/g,m=>m.toUpperCase());
const description=value=>INFO[value]?.[1]||'Operational Staff notification.';
const time=value=>value?new Date(value).toLocaleString():'Never';
const number=value=>Number(value||0);

export function StaffNotificationsPage(){
 const{session,api,has}=useAuth(),canRead=has('staff.notifications.read'),canManage=has('staff.notifications.manage');
 const[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(null),[toast,setToast]=useState('');
 const[channel,setChannel]=useState({enabled:false}),[settings,setSettings]=useState({enabled:true,categories:{}}),[categories,setCategories]=useState([]),[draft,setDraft]=useState({enabled:true,categories:{}}),[staff,setStaff]=useState([]);
 const load=async()=>{
  if(!canRead){setLoading(false);return}
  setLoading(true);setError(null);
  try{
   const[publicKeyResult,settingsResult,devicesResult]=await Promise.all([
    api.request('/v1/merchant/staff-push/public-key'),
    api.request('/v1/merchant/staff-push/settings'),
    api.request('/v1/merchant/staff-push/admin/devices'),
   ]);
   const nextSettings=settingsResult.data?.settings||{enabled:true,categories:{}},nextCategories=settingsResult.data?.categories||publicKeyResult.data?.categories||[];
   setChannel({enabled:Boolean(publicKeyResult.data?.enabled)});setSettings(nextSettings);setCategories(nextCategories);setDraft({enabled:nextSettings.enabled!==false,categories:{...(nextSettings.categories||{})}});setStaff(devicesResult.data?.staff||[]);
  }catch(e){setError(e)}finally{setLoading(false)}
 };
 useEffect(()=>{load()},[canRead,session?.storeId]);
 const totals=useMemo(()=>staff.reduce((acc,row)=>{acc.staff+=1;acc.devices+=number(row.device_count);acc.active+=number(row.active_devices);if(number(row.active_devices)>0)acc.withActive+=1;return acc},{staff:0,devices:0,active:0,withActive:0}),[staff]);
 const save=async()=>{
  if(!canManage)return;setSaving(true);setError(null);
  try{const r=await api.request('/v1/merchant/staff-push/settings',{method:'PUT',body:{enabled:Boolean(draft.enabled),categories:draft.categories||{}}}),next=r.data?.settings||draft;setSettings(next);setDraft({enabled:next.enabled!==false,categories:{...(next.categories||{})}});setToast('Staff notification policy saved for the selected store.');}
  catch(e){setError(e)}finally{setSaving(false)}
 };
 if(!canRead)return <div className="staff-notification-admin"><div className="staff-notification-hero"><span>Staff security</span><h1>Staff notifications</h1><p>Your account does not have staff.notifications.read.</p></div><VbenAlert tone="warning" title="Permission required">Only authorized merchant administrators can view Staff notification policy and device health.</VbenAlert></div>;
 return <div className="staff-notification-admin">
  <div className="staff-notification-hero"><div><span>Staff Web reliability</span><h1>Staff notifications</h1><p>Control which advisory operational events may be delivered to authorized Staff Web devices for the selected store. Delivery, payment, COD and fulfillment authority remain in the Backend.</p></div><VbenButton variant="secondary" icon="refresh" onClick={load} disabled={loading||saving}>Refresh</VbenButton></div>
  {error&&<VbenAlert tone="danger" title={error.code||'Request failed'}>{error.message||'Unable to load Staff notification controls.'}</VbenAlert>}
  {!channel.enabled&&<VbenAlert tone="warning" title="Backend push channel is disabled">Store policy can be reviewed now, but no Web Push will be delivered until production VAPID configuration and STAFF_WEB_PUSH_ENABLED are enabled on the Backend.</VbenAlert>}
  {!canManage&&<VbenAlert tone="warning" title="Read-only access">Your role can inspect Staff notification policy and device health but cannot change store notification settings.</VbenAlert>}
  <VbenAlert tone="info" title="Privacy and authority boundary">This page never receives push endpoints, encryption keys or VAPID secrets. It cannot subscribe a Staff device or send a browser-originated test push. Staff Web devices opt in themselves; the Backend resolves tenant, store, role and permission eligibility when each event is delivered.</VbenAlert>
  {loading?<VbenCard><VbenSkeleton lines={9}/></VbenCard>:<>
   <section className="staff-notification-metrics"><VbenMetric label="Staff accounts" value={totals.staff} detail="in selected store scope" icon="users"/><VbenMetric label="Registered devices" value={totals.devices} detail={`${totals.active} active`} icon="pulse" tone="success"/><VbenMetric label="Staff with active push" value={totals.withActive} detail={`${Math.max(0,totals.staff-totals.withActive)} without active device`} icon="check" tone={totals.withActive?'success':'warning'}/></section>
   <VbenCard title="Store notification policy" description="Applied by the Backend to the currently selected store before recipient resolution." actions={canManage?<VbenButton loading={saving} onClick={save}>Save policy</VbenButton>:null}>
    <div className="staff-notification-policy"><VbenSwitch checked={draft.enabled} disabled={!canManage} onChange={enabled=>setDraft(current=>({...current,enabled}))} label="Allow Staff push for this store" description="When off, no Staff push event from this store is delivered even if a device and personal preference are active."/><div className="staff-notification-categories">{categories.map(category=><VbenSwitch key={category} checked={draft.categories?.[category]!==false} disabled={!canManage||!draft.enabled} onChange={enabled=>setDraft(current=>({...current,categories:{...current.categories,[category]:enabled}}))} label={title(category)} description={description(category)}/>)}</div></div>
   </VbenCard>
   <VbenCard title="Staff device health" description="Aggregated registration health only. Subscription endpoints and cryptographic keys never leave the Backend.">
    <VbenTable rows={staff} emptyTitle="No Staff accounts in this store scope" ariaLabel="Staff push device health" columns={[
     {key:'staff',label:'Staff',render:r=><div className="staff-notification-person"><span>{(r.display_name||r.email||'?').slice(0,1).toUpperCase()}</span><div><strong>{r.display_name||'Staff'}</strong><small>{r.email}</small></div></div>},
     {key:'status',label:'Account',render:r=><VbenBadge tone={r.status==='ACTIVE'?'success':'danger'}>{r.status}</VbenBadge>},
     {key:'scope',label:'Store scope',render:r=><VbenBadge>{r.store_access_mode==='ASSIGNED_STORES'?'ASSIGNED STORES':'ALL STORES'}</VbenBadge>},
     {key:'devices',label:'Devices',render:r=><div className="staff-notification-device-count"><strong>{number(r.active_devices)} active</strong><small>{number(r.device_count)} registered</small></div>},
     {key:'seen',label:'Last device seen',render:r=>time(r.last_seen_at)},
     {key:'success',label:'Last push success',render:r=>time(r.last_push_success_at)},
    ]}/>
   </VbenCard>
  </>}
  <div className="staff-notification-footer-note"><strong>Selected store:</strong><span>{session?.storeId?'Current Merchant Admin store context':'Primary store context'}</span><span>Changing the header store selector reloads this policy and device-health view.</span></div>
  <VbenToast message={toast} onDone={()=>setToast('')}/>
 </div>;
}
