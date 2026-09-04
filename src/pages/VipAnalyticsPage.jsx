import React,{useEffect,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{navigate}from'../app/router.js';
import{VbenAlert,VbenBadge,VbenButton,VbenCard,VbenDateTime,VbenField,VbenMetric,VbenMoney,VbenPermissionNote,VbenSelect,VbenSkeleton,VbenTable}from'../components/VbenUI.jsx';
import'../vip-loyalty-analytics-v1.css';

const WINDOWS=[7,30,90,365];
const errorText=error=>error?`${error.code||'Request failed'}: ${error.message||String(error)}${error.requestId?` · ${error.requestId}`:''}`:'';
const signedMoney=(value,currency)=><span className={Number(value)<0?'vip-analytics-negative':Number(value)>0?'vip-analytics-positive':''}><VbenMoney value={value||0} currency={currency}/></span>;
const kindTone=kind=>kind==='REWARD'?'success':kind==='REDEMPTION'?'primary':kind==='ENTITLEMENT'?'warning':'neutral';

export function VipAnalyticsPage(){
 const{api,has,session}=useAuth();
 const[days,setDays]=useState(30),[analytics,setAnalytics]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(null);
 const canRead=has('loyalty.read');
 const load=async()=>{if(!canRead)return;setLoading(true);setError(null);try{const result=await api.request('/v1/merchant/vip/analytics',{query:{days}});setAnalytics(result.data)}catch(e){setError(e)}finally{setLoading(false)}};
 useEffect(()=>{load()},[days,session?.storeId]);
 if(!canRead)return <VbenPermissionNote permission="loyalty.read"/>;
 const summary=analytics?.summary||{},currency=analytics?.currency||'USD';
 const rewardRows=analytics?.reward_by_type||[],entitlementRows=analytics?.entitlements_by_status||[],levelRows=analytics?.by_level||[],activityRows=analytics?.recent_activity||[],topBalances=analytics?.top_reward_balances||[];
 const movementTotal=Number(summary.tier_entries||0)+Number(summary.tier_upgrades||0)+Number(summary.tier_downgrades||0);
 const periodLabel=analytics?.period?`${new Date(analytics.period.start).toLocaleDateString()} – ${new Date(analytics.period.end).toLocaleDateString()}`:`Last ${days} days`;
 const activityColumns=[
  {key:'occurred_at',label:'Time',render:r=><VbenDateTime value={r.occurred_at}/>},
  {key:'kind',label:'Activity',render:r=><VbenBadge tone={kindTone(r.kind)}>{r.kind}</VbenBadge>},
  {key:'customer',label:'Customer',render:r=><div className="vip-analytics-customer"><strong>{r.display_name||'Unnamed customer'}</strong><small>{r.customer_code||r.customer_id}</small></div>},
  {key:'detail',label:'Detail',render:r=><div className="vip-analytics-detail"><strong>{r.status||'—'}</strong><small>{r.detail||'—'}</small></div>},
  {key:'amount',label:'Amount',render:r=>r.amount===null||r.amount===undefined?'—':signedMoney(r.amount,r.currency||currency)},
  {key:'actor_type',label:'Actor',render:r=><span>{r.actor_type||'—'}</span>},
 ];
 const levelColumns=[
  {key:'name',label:'Level',render:r=><div className="vip-analytics-level"><i style={{background:r.badge_color||'#64748b'}}/><strong>{r.name}</strong><small>{r.code}</small></div>},
  {key:'members',label:'Members'},
  {key:'qualified_spend',label:'Qualified spend',render:r=><VbenMoney value={r.qualified_spend||0} currency={currency}/>},
  {key:'qualified_orders',label:'Qualified orders'},
 ];
 const rewardColumns=[{key:'entry_type',label:'Ledger type',render:r=><VbenBadge tone={Number(r.net_amount)<0?'warning':'success'}>{r.entry_type}</VbenBadge>},{key:'entries',label:'Entries'},{key:'net_amount',label:'Net amount',render:r=>signedMoney(r.net_amount,currency)}];
 const entitlementColumns=[{key:'status',label:'Status',render:r=><VbenBadge tone={r.status==='AVAILABLE'?'success':r.status==='REDEEMED'?'primary':r.status==='EXPIRED'?'warning':'neutral'}>{r.status}</VbenBadge>},{key:'entitlements',label:'Entitlements'}];
 const balanceColumns=[{key:'customer',label:'Customer',render:r=><div className="vip-analytics-customer"><strong>{r.display_name||'Unnamed customer'}</strong><small>{r.customer_code||r.customer_id}</small></div>},{key:'balance',label:'Current reward balance',render:r=><VbenMoney value={r.balance||0} currency={currency}/>}];
 return <div className="vip-analytics-page" data-testid="vip-loyalty-analytics">
  <header className="vip-analytics-head"><div><span className="vip-analytics-kicker">CUSTOMER RETENTION · OPERATIONS</span><h1>VIP & Loyalty Analytics</h1><p>Read-only, Backend-authoritative visibility into reward liability, cashback redemption, entitlement health and tier movement for the working store.</p></div><div className="vip-analytics-actions"><VbenButton variant="secondary" onClick={()=>navigate('/vip-loyalty')}>Back to VIP & Loyalty</VbenButton><VbenButton variant="secondary" icon="refresh" loading={loading} onClick={load}>Refresh</VbenButton></div></header>
  {error&&<VbenAlert tone="danger" title={error.code||'Analytics request failed'}>{errorText(error)}</VbenAlert>}
  <VbenCard title="Reporting window" description={`Working store · ${periodLabel}`}><div className="vip-analytics-window"><VbenField label="Period"><VbenSelect value={days} onChange={e=>setDays(Number(e.target.value))}>{WINDOWS.map(value=><option key={value} value={value}>Last {value} days</option>)}</VbenSelect></VbenField><div className="vip-analytics-authority"><strong>Read-only authority boundary</strong><span>All figures come from the selected store’s Backend ledger and lifecycle tables. This workspace cannot issue, redeem, restore, adjust or expire rewards.</span></div></div></VbenCard>
  {loading&&!analytics?<VbenSkeleton lines={10}/>:<>
   <section className="vip-analytics-metrics"><VbenMetric label="Reward liability" value={<VbenMoney value={summary.reward_liability||0} currency={currency}/>} detail="Positive customer ledger balances" icon="payments" tone="warning"/><VbenMetric label={`Credits · ${days}d`} value={<VbenMoney value={summary.reward_credits||0} currency={currency}/>} detail={`Debits ${currency} ${Number(summary.reward_debits||0).toFixed(2)}`} icon="history" tone="success"/><VbenMetric label={`Cashback redeemed · ${days}d`} value={<VbenMoney value={summary.cashback_redeemed||0} currency={currency}/>} detail={`${summary.redemptions_applied||0} applied · ${summary.redemptions_restored||0} restored`} icon="payments" tone="primary"/><VbenMetric label="Available entitlements" value={summary.entitlements_available||0} detail={`${summary.entitlements_issued||0} issued · ${summary.entitlements_redeemed||0} redeemed`} icon="promotions" tone="primary"/><VbenMetric label={`Tier movement · ${days}d`} value={movementTotal} detail={`${summary.tier_upgrades||0} upgrades · ${summary.tier_downgrades||0} downgrades`} icon="users" tone={summary.tier_downgrades?'warning':'neutral'}/><VbenMetric label="VIP members" value={summary.vip_members||0} detail={`${summary.evaluated_without_level||0} without level · ${summary.locked_members||0} locked`} icon="users" tone="primary"/></section>
   <div className="vip-analytics-grid"><VbenCard title="Tier distribution" description="Current membership and qualification totals by level."><VbenTable columns={levelColumns} rows={levelRows} empty="No VIP levels found."/></VbenCard><VbenCard title="Reward ledger movement" description={`Net ledger activity during the last ${days} days.`}><VbenTable columns={rewardColumns} rows={rewardRows} empty="No reward ledger activity in this period."/></VbenCard><VbenCard title="Entitlement inventory" description="Current voucher and gift entitlement states."><VbenTable columns={entitlementColumns} rows={entitlementRows} empty="No entitlements found."/></VbenCard><VbenCard title="Largest reward balances" description="Current positive ledger balances, not browser-calculated estimates."><VbenTable columns={balanceColumns} rows={topBalances} empty="No positive reward balances."/></VbenCard></div>
   <VbenCard title="Recent loyalty activity" description="Latest tier, reward, entitlement and cashback redemption events for the working store."><VbenTable columns={activityColumns} rows={activityRows} empty="No loyalty activity found."/></VbenCard>
  </>}
 </div>;
}
