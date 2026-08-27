import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{VbenAlert,VbenBadge,VbenButton,VbenCard,VbenDateTime,VbenField,VbenIcon,VbenInput,VbenMetric,VbenModal,VbenMoney,VbenPermissionNote,VbenSelect,VbenSkeleton,VbenTable,VbenTabs,VbenTextarea,VbenToast,vbenStatusTone}from'../components/VbenUI.jsx';

const CUSTOMER_STATUSES=['ACTIVE','SUSPENDED','BLOCKED','DELETION_PENDING'];
const MANAGEABLE_STATUSES=['ACTIVE','SUSPENDED','BLOCKED'];

function CustomerError({error}){if(!error)return null;return <VbenAlert tone="danger" title={error.code||'Customer request failed'}>{error.message||String(error)}{error.requestId?` · Request ${error.requestId}`:''}</VbenAlert>}
const customerTone=status=>status==='DELETION_PENDING'?'warning':vbenStatusTone(status);
const initial=name=>(name||'C').trim().slice(0,1).toUpperCase()||'C';

export function CustomersPage(){
 const{api,has}=useAuth();
 const[rows,setRows]=useState([]),[err,setErr]=useState(null),[selected,setSelected]=useState(null),[detail,setDetail]=useState(null);
 const[status,setStatus]=useState('ACTIVE'),[filter,setFilter]=useState(''),[q,setQ]=useState(''),[reason,setReason]=useState(''),[toast,setToast]=useState('');
 const[loading,setLoading]=useState(true),[detailLoading,setDetailLoading]=useState(false),[busy,setBusy]=useState(false),[detailTab,setDetailTab]=useState('overview');

 const load=async()=>{setErr(null);setLoading(true);try{const d=await api.request('/v1/merchant/customers',{query:{status:filter||undefined,limit:100}});setRows(d.data.customers||[])}catch(e){setErr(e)}finally{setLoading(false)}};
 useEffect(()=>{load()},[filter]);
 const openCustomer=async r=>{setSelected(r.public_id);setStatus(r.status==='DELETION_PENDING'?'ACTIVE':r.status);setReason('');setDetail(null);setDetailTab('overview');setDetailLoading(true);setErr(null);try{const d=await api.request(`/v1/merchant/customers/${encodeURIComponent(r.public_id)}`);setDetail(d.data.customer)}catch(e){setErr(e);setSelected(null)}finally{setDetailLoading(false)}};
 const refreshDetail=async()=>{if(!selected)return;const d=await api.request(`/v1/merchant/customers/${encodeURIComponent(selected)}`);setDetail(d.data.customer)};
 const save=async()=>{if(!selected)return;setBusy(true);setErr(null);try{await api.request(`/v1/merchant/customers/${encodeURIComponent(selected)}/status`,{method:'PATCH',body:{status,reason:reason||undefined}});setToast('Customer status updated');await refreshDetail();await load()}catch(e){setErr(e)}finally{setBusy(false)}};
 const closeDetail=()=>{if(busy)return;setSelected(null);setDetail(null);setDetailTab('overview');setReason('')};

 const filtered=useMemo(()=>{const x=q.trim().toLowerCase();if(!x)return rows;return rows.filter(r=>`${r.display_name||''} ${r.email||''} ${r.phone_e164||''} ${r.customer_code||''} ${r.public_id||''}`.toLowerCase().includes(x))},[rows,q]);
 const active=useMemo(()=>rows.filter(r=>r.status==='ACTIVE').length,[rows]);
 const restricted=useMemo(()=>rows.filter(r=>['SUSPENDED','BLOCKED'].includes(r.status)).length,[rows]);
 const deletionPending=useMemo(()=>rows.filter(r=>r.status==='DELETION_PENDING').length,[rows]);

 if(!has('customers.read'))return <VbenPermissionNote permission="customers.read"/>;

 const directoryColumns=[
  {key:'display_name',label:'Customer',render:r=><button type="button" className="vben-customer-identity" onClick={()=>openCustomer(r)}>{r.avatar_url?<img src={r.avatar_url} alt=""/>:<span className="vben-customer-avatar-fallback">{initial(r.display_name)}</span>}<span className="vben-customer-identity-copy"><strong>{r.display_name||'Unnamed'}</strong><code>{r.customer_code||r.public_id}</code></span></button>},
  {key:'email',label:'Contact',render:r=><div className="vben-customer-contact"><span>{r.email||'—'}</span><small>{r.phone_e164||'No phone'}</small></div>},
  {key:'status',label:'Status',render:r=><VbenBadge tone={customerTone(r.status)}>{r.status}</VbenBadge>},
  {key:'created_at',label:'Joined',render:r=><span className="vben-customer-time"><VbenDateTime value={r.created_at}/></span>},
  {key:'last_login_at',label:'Last login',render:r=><span className="vben-customer-time"><VbenDateTime value={r.last_login_at}/></span>},
  {key:'action',label:'',render:r=><VbenButton variant="ghost" size="sm" icon="arrowRight" onClick={()=>openCustomer(r)}>Open</VbenButton>}
 ];
 const orderColumns=[
  {key:'order_number',label:'Order',render:r=><strong className="vben-customer-order-number">{r.order_number||r.id}</strong>},
  {key:'store_name',label:'Store'},
  {key:'status',label:'Status',render:r=><VbenBadge tone={vbenStatusTone(r.status)}>{r.status}</VbenBadge>},
  {key:'payment_status',label:'Payment',render:r=><VbenBadge tone={vbenStatusTone(r.payment_status)}>{r.payment_status}</VbenBadge>},
  {key:'grand_total',label:'Total',render:r=><strong><VbenMoney value={r.grand_total} currency={r.currency||'USD'}/></strong>},
  {key:'created_at',label:'Created',render:r=><span className="vben-customer-time"><VbenDateTime value={r.created_at}/></span>}
 ];

 return <div className="vben-customers-page">
  <header className="vben-customers-head"><div><span className="vben-customers-kicker"><VbenIcon name="users" size={15}/>Customer operations</span><h1>Customers</h1><p>Search customer accounts, inspect identity and security facts, review saved addresses and orders, and manage lifecycle status with audited reasons.</p></div><VbenButton variant="secondary" icon="refresh" loading={loading} onClick={load}>Refresh</VbenButton></header>
  <CustomerError error={err}/>

  <div className="vben-customers-metrics">
   <VbenMetric label="Customers loaded" value={rows.length} detail="Current 100-record window" icon="users" tone="primary"/>
   <VbenMetric label="Active" value={active} detail="Active accounts in loaded window" icon="check" tone="success" onClick={()=>setFilter('ACTIVE')}/>
   <VbenMetric label="Restricted" value={restricted} detail="Suspended or blocked" icon="lock" tone={restricted?'warning':'success'}/>
   <VbenMetric label="Deletion pending" value={deletionPending} detail="Lifecycle attention" icon="alert" tone={deletionPending?'warning':'success'} onClick={()=>setFilter('DELETION_PENDING')}/>
  </div>

  <VbenCard className="vben-customers-directory-card" title="Customer directory" description="Loaded customer records only; no estimated value, segmentation, or synthetic engagement scoring.">
   <div className="vben-customers-toolbar"><VbenInput icon="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name, customer ID, email or phone"/><VbenSelect value={filter} onChange={e=>setFilter(e.target.value)}><option value="">All statuses</option>{CUSTOMER_STATUSES.map(value=><option key={value}>{value}</option>)}</VbenSelect><span className="vben-customers-result-count">{filtered.length} of {rows.length} customers</span></div>
   {loading?<div className="vben-customers-loading"><VbenSkeleton lines={6}/></div>:<VbenTable rows={filtered} keyField="public_id" columns={directoryColumns} ariaLabel="Customer directory" emptyTitle="No customers found" emptyDescription="No customer records match the current search and status filters."/>}
  </VbenCard>

  <VbenModal open={!!selected} onClose={closeDetail} title={detail?.display_name||'Customer account'} eyebrow="Customer operations" size="xl">
   {detailLoading?<div className="vben-customer-detail-loading"><VbenSkeleton lines={7}/></div>:detail&&<div className="vben-customer-workspace">
    <section className="vben-customer-profile-head"><div className="vben-customer-profile-main">{detail.avatar_url?<img src={detail.avatar_url} alt=""/>:<span className="vben-customer-profile-fallback">{initial(detail.display_name)}</span>}<div><div className="vben-customer-profile-title"><h3>{detail.display_name||'Unnamed'}</h3><VbenBadge tone={customerTone(detail.status)}>{detail.status||'—'}</VbenBadge></div><span>{detail.email||'No email'}{detail.phone_e164?` · ${detail.phone_e164}`:''}</span><code>{detail.customer_code||detail.public_id||selected}</code></div></div><div className="vben-customer-profile-meta"><div><span>Customer ID</span><strong>{detail.customer_code||detail.public_id||selected}</strong></div><div><span>Internal reference</span><code>{detail.public_id||selected}</code></div></div></section>

    <div className="vben-customer-detail-metrics">
     <VbenMetric label="Saved addresses" value={detail.addresses?.length||0} detail="Customer address book" icon="mapPin" tone="primary" onClick={()=>setDetailTab('overview')}/>
     <VbenMetric label="Recent orders" value={detail.recent_orders?.length||0} detail="Latest 25 returned" icon="orders" tone="primary" onClick={()=>setDetailTab('orders')}/>
     <VbenMetric label="Active sessions" value={detail.active_sessions??0} detail="Security fact from backend" icon="lock" tone={(detail.active_sessions??0)>0?'warning':'neutral'} onClick={()=>setDetailTab('security')}/>
     <VbenMetric label="Status changes" value={detail.status_history?.length||0} detail="Immutable lifecycle history" icon="history" tone="neutral" onClick={()=>setDetailTab('overview')}/>
    </div>

    <VbenTabs value={detailTab} onChange={setDetailTab} items={[{value:'overview',label:'Overview'},{value:'orders',label:'Orders',count:detail.recent_orders?.length||0},{value:'security',label:'Security'}]}/>

    {detailTab==='overview'&&<div className="vben-customer-overview-grid">
     <VbenCard title="Account facts" description="Canonical identity and authentication timestamps returned by the customer detail API."><div className="vben-customer-facts"><div><span>Name</span><strong>{detail.display_name||'Unnamed'}</strong></div><div><span>Phone</span><strong>{detail.phone_e164||'—'}</strong></div><div><span>Joined</span><strong><VbenDateTime value={detail.created_at}/></strong></div><div><span>Last login</span><strong><VbenDateTime value={detail.last_login_at}/></strong></div><div><span>Password changed</span><strong><VbenDateTime value={detail.password_changed_at}/></strong></div><div><span>Active sessions</span><strong>{detail.active_sessions??0}</strong></div></div></VbenCard>
     <VbenCard title="Saved addresses" description={`${detail.addresses?.length||0} address(es) on the customer account.`}>{detail.addresses?.length?<div className="vben-customer-address-list">{detail.addresses.map((a,i)=><article key={a.id||`${a.label}-${i}`}><span className="vben-customer-address-icon"><VbenIcon name="mapPin" size={16}/></span><div><div className="vben-customer-address-title"><strong>{a.label||'Address'}</strong>{a.is_default&&<VbenBadge tone="primary">DEFAULT</VbenBadge>}</div><span>{a.recipient_name||'—'}{a.phone?` · ${a.phone}`:''}</span><small>{a.formatted_address||[a.address_line_1,a.address_line_2,a.city,a.state,a.postal_code,a.country_code].filter(Boolean).join(', ')||'No formatted address'}</small></div></article>)}</div>:<div className="vben-customer-empty-copy">No saved addresses.</div>}</VbenCard>
     <VbenCard className="vben-customer-history-card" title="Status history" description="Immutable customer lifecycle changes.">{detail.status_history?.length?<div className="vben-customer-timeline">{detail.status_history.map((h,i)=><article key={`${h.created_at}-${i}`}><i/><div><strong>{h.from_status||'—'} → {h.to_status}</strong><span>{h.reason||'No reason recorded'} · {h.changed_by_type||'Unknown actor'}</span><small><VbenDateTime value={h.created_at}/></small></div></article>)}</div>:<div className="vben-customer-empty-copy">No status changes recorded.</div>}</VbenCard>
    </div>}

    {detailTab==='orders'&&<VbenCard className="vben-customer-orders-card" title="Recent orders" description="Latest 25 orders returned for this customer.">{detail.recent_orders?.length?<VbenTable rows={detail.recent_orders} keyField="id" columns={orderColumns} ariaLabel="Recent customer orders"/>:<div className="vben-customer-empty-copy">No orders yet.</div>}</VbenCard>}

    {detailTab==='security'&&<div className="vben-customer-security-grid">
     <VbenCard title="Security facts" description="Read-only security state exposed by the customer detail API."><div className="vben-customer-security-facts"><div><span>Account status</span><VbenBadge tone={customerTone(detail.status)}>{detail.status||'—'}</VbenBadge></div><div><span>Active sessions</span><strong>{detail.active_sessions??0}</strong></div><div><span>Last login</span><strong><VbenDateTime value={detail.last_login_at}/></strong></div><div><span>Password changed</span><strong><VbenDateTime value={detail.password_changed_at}/></strong></div></div><VbenAlert tone="info" title="Session behavior">Suspending or blocking a customer revokes active customer sessions through the existing backend status workflow.</VbenAlert></VbenCard>
     {has('customers.status.manage')?<VbenCard title="Account status" description="Change lifecycle access using the existing audited status endpoint."><div className="vben-customer-status-form">{detail.status==='DELETION_PENDING'&&<VbenAlert tone="warning" title="Deletion pending">This account is pending deletion. The supported merchant status actions remain ACTIVE, SUSPENDED, and BLOCKED.</VbenAlert>}<VbenField label="New status"><VbenSelect value={status} onChange={e=>setStatus(e.target.value)}>{MANAGEABLE_STATUSES.map(value=><option key={value}>{value}</option>)}</VbenSelect></VbenField><VbenField label="Audit reason" hint="Optional in the current backend contract; add a reason for operational traceability."><VbenTextarea rows="4" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Explain why the account status is changing"/></VbenField><VbenButton icon="check" loading={busy} disabled={busy||status===detail.status} onClick={save}>Update customer status</VbenButton></div></VbenCard>:<VbenPermissionNote permission="customers.status.manage"/>}
    </div>}
   </div>}
  </VbenModal>
  <VbenToast message={toast} onDone={()=>setToast('')}/>
 </div>;
}
