import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{navigate}from'../app/router.js';

const money=(value,currency='USD')=>{try{return new Intl.NumberFormat(undefined,{style:'currency',currency}).format(Number(value||0))}catch{return `${currency} ${Number(value||0).toFixed(2)}`}};
const go=route=>navigate(route);

export function OperationsDashboardPage(){
 const{api,has}=useAuth();
 const[data,setData]=useState({kitchen:[],cashier:[],dispatches:[],drivers:[],cod:[]}),[loading,setLoading]=useState(true),[error,setError]=useState(null);
 const load=async()=>{
  setLoading(true);setError(null);
  const tasks=[];
  if(has('kitchen.read'))tasks.push(['kitchen',api.request('/v1/merchant/kitchen/queue',{query:{limit:200}})]);
  if(has('cashier.read'))tasks.push(['cashier',api.request('/v1/merchant/cashier/queue',{query:{limit:200}})]);
  if(has('delivery.read')){
   tasks.push(['dispatches',api.request('/v1/merchant/delivery/dispatches',{query:{limit:200}})]);
   tasks.push(['drivers',api.request('/v1/merchant/delivery/drivers',{query:{limit:200}})]);
   tasks.push(['cod',api.request('/v1/merchant/delivery/cod',{query:{limit:200}})]);
  }
  const results=await Promise.allSettled(tasks.map(([,promise])=>promise));
  const next={kitchen:[],cashier:[],dispatches:[],drivers:[],cod:[]};let firstError=null;
  results.forEach((result,index)=>{const key=tasks[index][0];if(result.status==='fulfilled'){const payload=result.value?.data||{};next[key]=payload.jobs||payload.orders||payload.dispatches||payload.drivers||payload.collections||[]}else firstError=firstError||result.reason});
  setData(next);setError(firstError);setLoading(false);
 };
 useEffect(()=>{load()},[]);
 const stats=useMemo(()=>{
  const kitchenWaiting=data.kitchen.filter(x=>['NEW','ACCEPTED','PREPARING'].includes(x.status)).length;
  const ready=data.kitchen.filter(x=>x.status==='READY').length;
  const unassigned=data.dispatches.filter(x=>!x.driver?.id&&!x.driver_id&&!['DELIVERED','CANCELLED'].includes(x.status)).length;
  const active=data.dispatches.filter(x=>!['DELIVERED','CANCELLED'].includes(x.status)).length;
  const online=data.drivers.filter(x=>String(x.availability_status||x.presence_status||x.status).toUpperCase()==='ONLINE').length;
  const codHeld=data.cod.filter(x=>x.status==='COLLECTED').reduce((sum,x)=>sum+Number(x.collected_amount||0),0);
  const codReconcile=data.cod.filter(x=>x.status==='REMITTED').reduce((sum,x)=>sum+Number(x.collected_amount||0),0);
  const currency=data.cod[0]?.currency||data.cashier[0]?.currency||'USD';
  return{kitchenWaiting,ready,unassigned,active,online,codHeld,codReconcile,currency};
 },[data]);
 const actions=[
  has('kitchen.read')&&['Kitchen','Orders waiting, preparing and ready','/kitchen','Open Kitchen'],
  has('cashier.read')&&['Cashier','Payment checks and COD handover','/cashier','Open Cashier'],
  has('delivery.read')&&['Dispatch','Assign and supervise delivery work','/delivery','Open Dispatch'],
  has('delivery.read')&&['Live delivery','Driver tracking, proof and communication','/delivery-control','Open Live Control'],
  has('delivery.read')&&['COD cash','Driver custody and owner reconciliation','/delivery-cod','Open COD Cash'],
  has('delivery.manage')&&['Delivery settings','Operating rules, cutoff and fulfillment policy','/delivery-settings','Open Settings'],
  has('delivery.manage')&&['Driver app','Driver mobile policies and operational limits','/driver-settings','Open Driver Settings'],
 ].filter(Boolean);
 return <section className="operations-dashboard-page" data-testid="operations-dashboard-v1">
  <header className="operations-dashboard-head"><div><span>OPERATIONS</span><h1>Operations command center</h1><p>Run Kitchen, Cashier, Dispatch, live delivery and COD from one owner-focused workspace.</p></div><button className="secondary" onClick={load} disabled={loading}>{loading?'Refreshing…':'Refresh'}</button></header>
  {error&&<div className="operations-dashboard-warning"><strong>Some operational data could not be loaded</strong><span>{error.message||'Refresh the page or check your role permissions.'}</span></div>}
  <div className="operations-kpis">
   {has('kitchen.read')&&<article><span>Kitchen waiting</span><strong>{stats.kitchenWaiting}</strong><small>New, accepted or preparing</small></article>}
   {has('kitchen.read')&&<article><span>Ready for pickup</span><strong>{stats.ready}</strong><small>Kitchen marked READY</small></article>}
   {has('delivery.read')&&<article><span>Active deliveries</span><strong>{stats.active}</strong><small>Current operational assignments</small></article>}
   {has('delivery.read')&&<article><span>Drivers online</span><strong>{stats.online}</strong><small>Available work presence</small></article>}
   {has('delivery.read')&&<article><span>COD held by drivers</span><strong>{money(stats.codHeld,stats.currency)}</strong><small>Collected, not yet received by store</small></article>}
   {has('delivery.read')&&<article><span>COD to reconcile</span><strong>{money(stats.codReconcile,stats.currency)}</strong><small>Cash received by store, payment pending</small></article>}
  </div>
  <div className="operations-section-title"><div><span>WORKSPACES</span><h2>Daily operations</h2></div><p>Only workspaces allowed by your role are shown.</p></div>
  <div className="operations-action-grid">{actions.map(([title,description,route,label])=><article key={route}><div><h3>{title}</h3><p>{description}</p></div><button className="secondary" onClick={()=>go(route)}>{label}</button></article>)}</div>
 </section>;
}
