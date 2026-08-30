import React,{useEffect,useMemo,useRef,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{navigate}from'../app/router.js';

const human=value=>String(value||'').replaceAll('_',' ').toLowerCase().replace(/(^|\s)\S/g,m=>m.toUpperCase());
const cash=(value,currency='USD')=>{try{return new Intl.NumberFormat(undefined,{style:'currency',currency}).format(Number(value||0))}catch{return `${currency} ${Number(value||0).toFixed(2)}`}};
const NEXT_LABEL={ACCEPTED:'Accept delivery',PICKED_UP:'Confirm pickup',OUT_FOR_DELIVERY:'Start delivery',DELIVERED:'Confirm delivered'};
const activeLocation=new Set(['ACCEPTED','PICKED_UP','OUT_FOR_DELIVERY']);

export function DriverPage(){
 const{api,session}=useAuth();
 const[profile,setProfile]=useState(null),[dispatches,setDispatches]=useState([]),[selected,setSelected]=useState(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(''),[error,setError]=useState(null),[toast,setToast]=useState('');
 const[proof,setProof]=useState({recipient_name:'',note:''}),[photo,setPhoto]=useState(null),[tracking,setTracking]=useState(false);
 const watchRef=useRef(null),lastLocationSend=useRef(0),selectedRef=useRef(null);
 useEffect(()=>{selectedRef.current=selected},[selected]);

 const load=async()=>{setError(null);setLoading(true);try{const[mine,work]=await Promise.all([api.request('/v1/driver/me'),api.request('/v1/driver/dispatches',{query:{limit:100}})]);setProfile(mine.data.driver);setDispatches(work.data.dispatches||[])}catch(e){setError(e);setProfile(null);setDispatches([])}finally{setLoading(false)}};
 const loadDetail=async id=>{setBusy(`open:${id}`);setError(null);try{const r=await api.request(`/v1/driver/dispatches/${encodeURIComponent(id)}`);setSelected(r.data.dispatch);setProof({recipient_name:r.data.dispatch?.customer?.recipient_name||'',note:''})}catch(e){setError(e)}finally{setBusy('')}};
 useEffect(()=>{load();return()=>{if(watchRef.current!=null&&navigator.geolocation)navigator.geolocation.clearWatch(watchRef.current)}},[]);

 const openWork=useMemo(()=>dispatches.filter(x=>!['DELIVERED','CANCELLED'].includes(x.status)),[dispatches]);
 const completed=useMemo(()=>dispatches.filter(x=>['DELIVERED','CANCELLED'].includes(x.status)),[dispatches]);
 const refreshAfter=async id=>{await load();if(id)await loadDetail(id)};

 const advance=async()=>{if(!selected?.next_status)return;setBusy('advance');setError(null);try{const r=await api.request(`/v1/driver/dispatches/${encodeURIComponent(selected.id)}/status`,{method:'POST',body:{status:selected.next_status}});setSelected(r.data.dispatch);setToast(`${human(r.data.dispatch.status)} recorded`);await load()}catch(e){setError(e)}finally{setBusy('')}};
 const addProof=async e=>{e.preventDefault();if(!selected)return;setBusy('proof');setError(null);try{await api.request(`/v1/driver/dispatches/${encodeURIComponent(selected.id)}/proofs`,{method:'POST',body:{recipient_name:proof.recipient_name.trim()||undefined,note:proof.note.trim()||undefined}});setProof(v=>({...v,note:''}));setToast('Delivery acknowledgement saved');await loadDetail(selected.id)}catch(e){setError(e)}finally{setBusy('')}};
 const uploadPhoto=async()=>{if(!selected||!photo)return;setBusy('photo');setError(null);try{await api.request(`/v1/driver/dispatches/${encodeURIComponent(selected.id)}/proof-photo`,{method:'POST',rawBody:photo,contentType:photo.type,query:{filename:photo.name}});setPhoto(null);setToast('Private proof photo uploaded');await loadDetail(selected.id)}catch(e){setError(e)}finally{setBusy('')}};
 const collectCod=async()=>{if(!selected?.payment?.cod_required)return;setBusy('cod');setError(null);try{const r=await api.request(`/v1/driver/dispatches/${encodeURIComponent(selected.id)}/cod/collect`,{method:'POST',body:{amount:Number(selected.payment.amount)}});setToast(`${cash(r.data.collection.collected_amount,r.data.collection.currency)} cash recorded in driver custody`);await loadDetail(selected.id)}catch(e){setError(e)}finally{setBusy('')}};

 const stopTracking=()=>{if(watchRef.current!=null&&navigator.geolocation)navigator.geolocation.clearWatch(watchRef.current);watchRef.current=null;setTracking(false)};
 const startTracking=()=>{
  if(!selected||!activeLocation.has(selected.status)){setError(new Error('Accept the delivery before sharing driver location.'));return}
  if(!navigator.geolocation){setError(new Error('Location services are not available in this browser.'));return}
  if(watchRef.current!=null)return;
  setError(null);setTracking(true);lastLocationSend.current=0;
  watchRef.current=navigator.geolocation.watchPosition(async pos=>{
   const live=selectedRef.current;if(!live||!activeLocation.has(live.status)){stopTracking();return}
   const now=Date.now();if(now-lastLocationSend.current<10000)return;lastLocationSend.current=now;
   try{await api.request(`/v1/driver/dispatches/${encodeURIComponent(live.id)}/location`,{method:'POST',body:{latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy_meters:Number.isFinite(pos.coords.accuracy)?pos.coords.accuracy:null}})}catch(e){setError(e)}
  },err=>{setError(new Error(err.message||'Driver location could not be read.'));stopTracking()},{enableHighAccuracy:true,maximumAge:5000,timeout:15000});
 };
 useEffect(()=>{if(selected&&!activeLocation.has(selected.status)&&tracking)stopTracking()},[selected?.status]);

 if(loading)return <section className="driver-mode-page"><div className="driver-loading">Loading Driver mode…</div></section>;
 if(error?.code==='DRIVER_PROFILE_REQUIRED')return <section className="driver-mode-page"><div className="driver-empty-card"><span className="driver-eyebrow">Driver mode</span><h1>This account is not linked to a driver</h1><p>Ask an authorized delivery manager to link this Merchant user to an active driver in Delivery → Drivers.</p><button className="driver-button secondary" onClick={()=>navigate('/my-profile')}>Back to my profile</button></div></section>;

 return <section className="driver-mode-page" data-testid="driver-mobile-v1">
  <header className="driver-mode-head"><div><button className="driver-back" onClick={()=>navigate('/my-profile')}>‹ Admin</button><span className="driver-eyebrow">Driver mode</span><h1>{profile?.display_name||session?.user?.display_name||'My deliveries'}</h1><p>{profile?.store?.name||'Selected store'}{profile?.vehicle_label?` · ${profile.vehicle_label}`:''}</p></div><button className="driver-refresh" onClick={load} disabled={loading}>Refresh</button></header>
  {error&&<div className="driver-error"><strong>{error.code?human(error.code):'Driver action failed'}</strong><span>{error.message}</span>{error.requestId&&<small>Request {error.requestId}</small>}</div>}
  <div className="driver-stats"><div><strong>{openWork.length}</strong><span>Active</span></div><div><strong>{profile?.out_for_delivery||0}</strong><span>On route</span></div><div><strong>{completed.filter(x=>x.status==='DELIVERED').length}</strong><span>Delivered</span></div></div>

  {!selected?<>
   <div className="driver-section-title"><div><span className="driver-eyebrow">Today</span><h2>My deliveries</h2></div><span>{openWork.length} active</span></div>
   <div className="driver-job-list">{openWork.length?openWork.map(job=><button key={job.id} className="driver-job-card" onClick={()=>loadDetail(job.id)} disabled={busy===`open:${job.id}`}><div className="driver-job-top"><span className={`driver-status status-${String(job.status).toLowerCase()}`}>{human(job.status)}</span><strong>{job.order.number}</strong></div><h3>{job.customer?.recipient_name||job.customer?.name||'Customer'}</h3><p>{job.destination?.formatted_address||[job.destination?.address_line_1,job.destination?.city].filter(Boolean).join(', ')||'Delivery address unavailable'}</p><div className="driver-job-meta"><span>{job.payment?.cod_required?`COD · ${cash(job.payment.amount,job.payment.currency)}`:human(job.payment?.method_name||job.payment?.provider_type||'Payment')}</span><span>{job.next_status?NEXT_LABEL[job.next_status]:'View' } ›</span></div></button>):<div className="driver-empty-card compact"><h3>No active deliveries</h3><p>New assignments will appear here after a delivery manager assigns them to this driver.</p></div>}</div>
   {completed.length>0&&<details className="driver-history"><summary>Recent completed work · {completed.length}</summary><div className="driver-job-list">{completed.slice(0,20).map(job=><button key={job.id} className="driver-job-card muted" onClick={()=>loadDetail(job.id)}><div className="driver-job-top"><span className="driver-status">{human(job.status)}</span><strong>{job.order.number}</strong></div><h3>{job.customer?.recipient_name||job.customer?.name||'Customer'}</h3></button>)}</div></details>}
  </>:<DriverDetail dispatch={selected} busy={busy} tracking={tracking} proof={proof} setProof={setProof} photo={photo} setPhoto={setPhoto} onClose={()=>{stopTracking();setSelected(null)}} onAdvance={advance} onStartTracking={startTracking} onStopTracking={stopTracking} onAddProof={addProof} onUploadPhoto={uploadPhoto} onCollectCod={collectCod}/>} 
  {toast&&<div className="driver-toast" role="status" onClick={()=>setToast('')}>{toast}</div>}
 </section>;
}

function DriverDetail({dispatch,busy,tracking,proof,setProof,photo,setPhoto,onClose,onAdvance,onStartTracking,onStopTracking,onAddProof,onUploadPhoto,onCollectCod}){
 const d=dispatch.destination||{},cod=dispatch.cod_collection,payment=dispatch.payment||{},canProof=!['DELIVERED','CANCELLED'].includes(dispatch.status),canCollect=payment.cod_required&&dispatch.status==='OUT_FOR_DELIVERY'&&!cod;
 const mapsUrl=d.latitude!=null&&d.longitude!=null?`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${d.latitude},${d.longitude}`)}`:d.formatted_address||d.address_line_1?`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.formatted_address||`${d.address_line_1}, ${d.city||''}`)}`:'';
 return <div className="driver-detail">
  <button className="driver-back detail-back" onClick={onClose}>‹ My deliveries</button>
  <article className="driver-detail-hero"><div><span className={`driver-status status-${String(dispatch.status).toLowerCase()}`}>{human(dispatch.status)}</span><small>{dispatch.order.number}</small></div><h2>{dispatch.customer?.recipient_name||dispatch.customer?.name||'Customer'}</h2>{dispatch.customer?.phone&&<a href={`tel:${dispatch.customer.phone}`}>{dispatch.customer.phone}</a>}</article>
  <article className="driver-panel"><span className="driver-eyebrow">Destination</span><h3>{d.formatted_address||d.address_line_1||'Address unavailable'}</h3><p>{[d.address_line_2,d.city,d.state,d.country_code].filter(Boolean).join(', ')}</p>{d.delivery_note&&<div className="driver-note">Customer note: {d.delivery_note}</div>}{mapsUrl&&<a className="driver-button secondary" href={mapsUrl} target="_blank" rel="noreferrer">Open directions</a>}</article>

  <article className="driver-panel"><div className="driver-panel-head"><div><span className="driver-eyebrow">Live work location</span><h3>{tracking?'Location sharing active':'Share during active work'}</h3></div><span className={`driver-live-dot ${tracking?'on':''}`}/></div><p>Location is sent only for this assigned dispatch after acceptance and stops when work is terminal.</p>{activeLocation.has(dispatch.status)?<button className={`driver-button ${tracking?'danger':'secondary'}`} onClick={tracking?onStopTracking:onStartTracking}>{tracking?'Stop location sharing':'Start location sharing'}</button>:<small>Location sharing becomes available after acceptance and ends after delivery.</small>}</article>

  {payment.cod_required&&<article className="driver-panel cod"><span className="driver-eyebrow">Cash on delivery</span><div className="driver-cod-amount"><strong>{cash(payment.amount,payment.currency)}</strong><span>{cod?human(cod.status):'Cash required'}</span></div>{cod?<p>Cash is recorded in driver custody. Merchant remittance and payment reconciliation are separate audited steps.</p>:<p>Collect exactly the server-authoritative amount. Driver confirmation does not mark the order payment as settled.</p>}{canCollect&&<button className="driver-button primary" onClick={onCollectCod} disabled={busy==='cod'}>{busy==='cod'?'Recording…':`Confirm cash collected · ${cash(payment.amount,payment.currency)}`}</button>}</article>}

  <article className="driver-panel"><span className="driver-eyebrow">Delivery proof</span><h3>{dispatch.proofs?.length?`${dispatch.proofs.length} proof item${dispatch.proofs.length===1?'':'s'} saved`:'Proof required before delivery'}</h3>{dispatch.proofs?.length>0&&<div className="driver-proof-list">{dispatch.proofs.map(p=><div key={p.id}><strong>{p.proof_type==='PHOTO'?'Private photo':'Acknowledgement'}</strong><span>{p.recipient_name||p.original_filename||p.note||'Recorded'}</span></div>)}</div>}{canProof&&<><form className="driver-proof-form" onSubmit={onAddProof}><label>Recipient / receiver<input value={proof.recipient_name} onChange={e=>setProof({...proof,recipient_name:e.target.value})} maxLength="160" placeholder="Name of person receiving order"/></label><label>Proof note<textarea value={proof.note} onChange={e=>setProof({...proof,note:e.target.value})} maxLength="1000" placeholder="Optional delivery acknowledgement"/></label><button className="driver-button secondary" disabled={busy==='proof'||(!proof.recipient_name.trim()&&!proof.note.trim())}>{busy==='proof'?'Saving…':'Save acknowledgement'}</button></form><div className="driver-photo-upload"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setPhoto(e.target.files?.[0]||null)}/><button className="driver-button secondary" type="button" onClick={onUploadPhoto} disabled={!photo||busy==='photo'}>{busy==='photo'?'Uploading…':'Upload private proof photo'}</button></div></>}</article>

  <article className="driver-panel driver-progress"><span className="driver-eyebrow">Next milestone</span><h3>{dispatch.next_status?NEXT_LABEL[dispatch.next_status]:human(dispatch.status)}</h3><p>Milestones are sequential and validated by the server. Delivery requires proof{payment.cod_required?' and COD collection':''}.</p>{dispatch.next_status&&<button className="driver-button primary big" onClick={onAdvance} disabled={busy==='advance'}>{busy==='advance'?'Updating…':NEXT_LABEL[dispatch.next_status]}</button>}</article>
 </div>;
}
