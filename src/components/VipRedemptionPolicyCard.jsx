import React,{useEffect,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{navigate}from'../app/router.js';
import{VbenAlert,VbenBadge,VbenButton,VbenCard,VbenField,VbenInput,VbenSkeleton,VbenSwitch,VbenToast}from'./VbenUI.jsx';
import{VipIssuanceControls}from'./VipIssuanceControls.jsx';
import'../vip-cashback-redemption-admin-v1.css';

const errorText=error=>error?`${error.code||'Request failed'}: ${error.message||String(error)}${error.requestId?` · ${error.requestId}`:''}`:'';
const emptyForm=()=>({cashback_redemption_enabled:false,max_percent:'100',min_amount:'0'});

export function VipRedemptionPolicyCard({currency='USD'}){
 const{api,has,session}=useAuth();
 const[policy,setPolicy]=useState(null),[store,setStore]=useState(null),[form,setForm]=useState(emptyForm());
 const[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(null),[toast,setToast]=useState('');
 const canManage=has('loyalty.manage');
 const syncPolicy=value=>{setPolicy(value||null);setForm(value?{cashback_redemption_enabled:!!value.cashback_redemption_enabled,max_percent:String(value.max_percent??100),min_amount:String(value.min_amount??0)}:emptyForm())};
 const load=async()=>{setLoading(true);setError(null);try{const result=await api.request('/v1/merchant/vip/redemption-policy');setStore(result.data.store||null);syncPolicy(result.data.policy)}catch(e){setError(e)}finally{setLoading(false)}};
 useEffect(()=>{load()},[session?.storeId]);
 const save=async()=>{const maxPercent=Number(form.max_percent),minAmount=Number(form.min_amount);if(!Number.isFinite(maxPercent)||maxPercent<0||maxPercent>100){setError({code:'VIP_REDEMPTION_PERCENT_INVALID',message:'Maximum redemption percent must be between 0 and 100.'});return}if(!Number.isFinite(minAmount)||minAmount<0||minAmount>1000000){setError({code:'VIP_REDEMPTION_MINIMUM_INVALID',message:'Minimum redemption amount must be between 0 and 1,000,000.'});return}setSaving(true);setError(null);try{const result=await api.request('/v1/merchant/vip/redemption-policy',{method:'PUT',body:{cashback_redemption_enabled:!!form.cashback_redemption_enabled,max_percent:maxPercent,min_amount:minAmount}});syncPolicy(result.data.policy);setToast('Cashback redemption policy saved')}catch(e){setError(e)}finally{setSaving(false)}};
 const effective=Boolean(policy?.enabled),requested=Boolean(form.cashback_redemption_enabled),programEnabled=Boolean(policy?.program_enabled);
 return <>
  <VbenCard title="Cashback redemption" description="Store-scoped customer checkout policy. Backend remains authoritative for spendable reward balance, reward validity, policy limits and the final payable amount.">
   {loading?<VbenSkeleton lines={5}/>:<div className="vip-redemption-policy-card" data-testid="vip-redemption-policy-card">
    <div className="vip-redemption-policy-status"><div><span className="vip-redemption-store-label">Working store</span><strong>{store?.name||session?.storeId||'Current store'}</strong></div><div className="vip-redemption-badges"><VbenBadge tone={programEnabled?'success':'warning'}>{programEnabled?'VIP PROGRAM ON':'VIP PROGRAM OFF'}</VbenBadge><VbenBadge tone={effective?'success':requested?'warning':'neutral'}>{effective?'REDEMPTION ACTIVE':requested?'WAITING FOR VIP PROGRAM':'REDEMPTION OFF'}</VbenBadge></div></div>
    {error&&<VbenAlert tone="danger" title={error.code||'Redemption policy request failed'}>{errorText(error)}</VbenAlert>}
    {!programEnabled&&requested&&<VbenAlert tone="warning" title="VIP program is currently disabled">The redemption switch is saved for this store, but customer checkout redemption stays ineffective until the VIP program is enabled. Backend enforces this relationship.</VbenAlert>}
    <VbenSwitch checked={form.cashback_redemption_enabled} onChange={value=>setForm(v=>({...v,cashback_redemption_enabled:value}))} label="Allow cashback redemption at checkout" description="Disabled by default. Enable only after Backend migration 033 and the customer checkout rollout are deployed and verified." disabled={!canManage}/>
    <div className="vip-form-grid vip-redemption-policy-grid"><VbenField label="Maximum payable percent" hint="0–100. Backend applies this cap to the server-calculated payable amount."><VbenInput data-testid="vip-redemption-max-percent" type="number" min="0" max="100" step="0.01" disabled={!canManage} value={form.max_percent} onChange={e=>setForm(v=>({...v,max_percent:e.target.value}))}/></VbenField><VbenField label={`Minimum redemption (${currency})`} hint="Customer requests below this amount are rejected by Backend."><VbenInput data-testid="vip-redemption-min-amount" type="number" min="0" max="1000000" step="0.01" disabled={!canManage} value={form.min_amount} onChange={e=>setForm(v=>({...v,min_amount:e.target.value}))}/></VbenField></div>
    <div className="vip-redemption-authority-note"><strong>Authority boundary</strong><span>Merchant Admin only edits this selected store’s policy. It never spends customer rewards, creates payment proof, or calculates the final checkout redemption.</span></div>
    <div className="vip-member-actions"><VbenButton variant="secondary" onClick={()=>navigate('/vip-analytics')}>Open loyalty analytics</VbenButton>{canManage&&<VbenButton loading={saving} onClick={save}>Save redemption policy</VbenButton>}</div>
   </div>}
   <VbenToast message={toast} onDone={()=>setToast('')}/>
  </VbenCard>
  <VipIssuanceControls/>
 </>;
}
