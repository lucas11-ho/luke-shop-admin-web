import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{navigate}from'../app/router.js';
import{VbenAlert,VbenBadge,VbenButton,VbenCard,VbenDateTime,VbenMetric,VbenSkeleton,VbenTable}from'./VbenUI.jsx';

const safeObject=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
const safeList=value=>Array.isArray(value)?value:[];
const operationalLabel=key=>({DRIVER:'Driver App only',KITCHEN:'Kitchen workspace',CASHIER:'Cashier workspace',DISPATCHER:'Dispatch workspace'}[key]||'Operational role');

export function AccessOverviewPanel(){
 const{api,has}=useAuth();
 const[overview,setOverview]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(null);
 const canRead=has('merchant.staff.read');
 useEffect(()=>{let live=true;if(!canRead){setLoading(false);return()=>{live=false}}setLoading(true);setError(null);api.request('/v1/merchant/access/overview').then(result=>{if(live)setOverview(safeObject(result?.data))}).catch(err=>{if(live)setError(err)}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[api,canRead]);
 const summary=safeObject(overview?.summary),attention=safeObject(overview?.attention),caps=safeObject(overview?.capabilities),roles=safeObject(overview?.roles),activity=safeList(overview?.recent_access_activity);
 const operational=safeList(roles.operational_roles);
 const posture=useMemo(()=>[
  ['Staff management',caps.staff_manage],['Role catalog',caps.roles_read],['Role management',caps.roles_manage],['Session revocation',caps.sessions_manage],['Store visibility',caps.stores_read],['Access audit',caps.audit_read],
 ],[caps]);
 if(!canRead)return <VbenAlert tone="warning" title="Staff read permission required">The management overview requires merchant.staff.read.</VbenAlert>;
 if(loading)return <VbenCard title="Access posture"><VbenSkeleton lines={7}/></VbenCard>;
 if(error)return <VbenAlert tone="danger" title={error.code||'Access overview unavailable'}>{error.message||'Unable to load the access management overview.'}</VbenAlert>;
 return <div className="a10-3-overview">
  <div className="a10-3-metrics">
   <VbenMetric label="Total staff" value={summary.total_staff||0} detail={`${summary.active_staff||0} active`} icon="users"/>
   <VbenMetric label="Active sessions" value={summary.active_sessions||0} detail="Server-counted sessions" icon="lock" tone="success"/>
   <VbenMetric label="Store restricted" value={summary.assigned_store_scope_staff||0} detail={`${summary.all_store_scope_staff||0} all-store`} icon="stores" tone="primary"/>
   <VbenMetric label="Active owners" value={summary.active_owners||0} detail="At least one is required" icon="check" tone="success"/>
   <VbenMetric label="Never signed in" value={summary.active_never_logged_in||0} detail="Active accounts" icon="profile" tone="warning"/>
   <VbenMetric label="Custom roles" value={roles.custom_roles??'—'} detail={caps.roles_read?`${roles.total_roles||0} total roles`:'Role read unavailable'} icon="access"/>
  </div>

  {(Number(attention.active_without_roles||0)>0||Number(attention.inactive_with_active_sessions||0)>0)&&<div className="a10-3-attention">
   {Number(attention.active_without_roles||0)>0&&<VbenAlert tone="warning" title="Active staff without roles">{attention.active_without_roles} active account(s) currently have no assigned role. Review them before they need operational access.</VbenAlert>}
   {Number(attention.inactive_with_active_sessions||0)>0&&<VbenAlert tone="danger" title="Inactive accounts with active sessions">{attention.inactive_with_active_sessions} inactive account(s) still have an unexpired session record. Use session controls to revoke them.</VbenAlert>}
  </div>}

  <div className="a10-3-grid">
   <VbenCard title="Operational role governance" description="These system roles are Backend-governed. They cannot be edited or deleted from Merchant Admin.">
    {!caps.roles_read?<VbenAlert tone="warning" title="Role read permission required">Operational role details are hidden without merchant.roles.read.</VbenAlert>:<div className="a10-3-role-grid">{operational.map(role=><div className="a10-3-role-card" key={role.key}><div><strong>{role.name}</strong><VbenBadge tone="success">SYSTEM</VbenBadge></div><code>{role.key}</code><p>{role.description||operationalLabel(role.key)}</p><small>{role.staff_count||0} staff · {(role.permissions||[]).length} Merchant Admin permission{(role.permissions||[]).length===1?'':'s'}</small>{role.key==='DRIVER'&&<span className="a10-3-boundary-note">Dedicated Driver App identity; no broad Merchant Admin permission.</span>}</div>)}</div>}
    <div className="a10-3-card-actions"><VbenButton size="sm" variant="secondary" onClick={()=>navigate('/staff-web')}>Open Staff Web handoff</VbenButton></div>
   </VbenCard>
   <VbenCard title="Your control authority" description="Buttons in this workspace remain constrained by these Backend permissions.">
    <div className="a10-3-capabilities">{posture.map(([label,enabled])=><div key={label}><span>{label}</span><VbenBadge tone={enabled?'success':'neutral'}>{enabled?'ALLOWED':'READ ONLY / HIDDEN'}</VbenBadge></div>)}</div>
    <VbenAlert tone="info" title="Authority boundary">Role permissions and store assignments must both pass. System roles stay protected, and the tenant must retain an active OWNER.</VbenAlert>
   </VbenCard>
  </div>

  <VbenCard title="Recent access activity" description="Access-specific audit events only. The full tenant audit remains in Audit log." actions={caps.audit_read?<VbenButton size="sm" variant="secondary" onClick={()=>navigate('/audit')}>Open full audit</VbenButton>:null}>
   {!caps.audit_read?<VbenAlert tone="warning" title="Audit permission required">Recent activity is unavailable without audit.read.</VbenAlert>:<VbenTable rows={activity} emptyTitle="No recent access activity" ariaLabel="Recent access activity" columns={[
    {key:'action',label:'Action',render:r=><code>{r.action}</code>},
    {key:'actor',label:'Actor',render:r=><span>{r.actor_name||r.actor_type||'—'}</span>},
    {key:'target',label:'Target',render:r=><span>{r.target_type||'—'}</span>},
    {key:'time',label:'Time',render:r=><VbenDateTime value={r.created_at}/>},
   ]}/>} 
  </VbenCard>
  <div className="a10-3-generated">Access posture generated <VbenDateTime value={overview?.generated_at}/></div>
 </div>;
}
