import React,{useEffect,useMemo,useState}from'react';
import{VbenAlert,VbenBadge,VbenButton,VbenCard,VbenField,VbenInput,VbenSelect,VbenSkeleton}from'./VbenUI.jsx';

const defaults={app_id:'',mch_id:'',app_secret:'',chain:'TRON',currency:'USDT',expire_second:600,locale:'en',to_address:'',settlement_mode:'EXACT',settlement_source_currency:'USD',settlement_rate:'',settlement_decimals:6};
const byteLength=value=>new TextEncoder().encode(String(value||'')).length;

export function TokenPayProviderConfig({api,method,canManage,onConfigured,onStatusChange,onError,onToast}){
 const[form,setForm]=useState(defaults),[status,setStatus]=useState({configured:false}),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
 const configured=Boolean(status?.configured);
 const methodId=method?.id;
 const endpoint=methodId?`/v1/merchant/payment-methods/${encodeURIComponent(methodId)}/provider-config`:'';
 const secretBytes=useMemo(()=>byteLength(form.app_secret),[form.app_secret]);
 const secretValid=!form.app_secret||secretBytes===32;
 const manual=form.settlement_mode==='MANUAL_RATE';
 const rateValid=!manual||(form.settlement_source_currency.trim()&&Number.isFinite(Number(form.settlement_rate))&&Number(form.settlement_rate)>0);
 const ready=Boolean(form.app_id.trim()&&form.mch_id.trim()&&form.chain.trim()&&form.currency.trim()&&(configured||secretBytes===32)&&rateValid);

 const load=async()=>{
  if(!endpoint)return;
  setLoading(true);onError?.(null);
  try{
   const result=await api.request(endpoint);
   const provider=result.data?.provider||{};
   const credentials=provider.credentials||{};
   const settings=provider.settings||{};
   const settlement=settings.settlement||{};
   const credentialStatus=provider.credential_status||{configured:false};
   setStatus(credentialStatus);
   onStatusChange?.(Boolean(credentialStatus.configured));
   setForm({
    app_id:credentials.app_id||'',mch_id:credentials.mch_id||'',app_secret:'',
    chain:settings.chain||'TRON',currency:settings.currency||'USDT',expire_second:Number(settings.expire_second||600),
    locale:settings.locale==='zh_cn'?'zh_cn':'en',to_address:settings.to_address||'',
    settlement_mode:settlement.mode==='MANUAL_RATE'?'MANUAL_RATE':'EXACT',settlement_source_currency:settlement.source_currency||'USD',settlement_rate:settlement.rate||'',settlement_decimals:Number(settlement.decimals||6),
   });
  }catch(error){onStatusChange?.(false);onError?.(error)}finally{setLoading(false)}
 };
 useEffect(()=>{load()},[endpoint]);

 const save=async()=>{
  if(!canManage||!ready||!secretValid)return;
  setSaving(true);onError?.(null);
  try{
   const body={
    app_id:form.app_id.trim(),mch_id:form.mch_id.trim(),chain:form.chain.trim().toUpperCase(),currency:form.currency.trim().toUpperCase(),
    expire_second:Math.max(60,Math.min(86400,Number(form.expire_second||600))),locale:form.locale==='zh_cn'?'zh_cn':'en',to_address:form.to_address.trim()||null,
    settlement_mode:form.settlement_mode==='MANUAL_RATE'?'MANUAL_RATE':'EXACT',settlement_decimals:Math.max(2,Math.min(8,Number(form.settlement_decimals||6))),
   };
   if(body.settlement_mode==='MANUAL_RATE'){
    body.settlement_source_currency=form.settlement_source_currency.trim().toUpperCase();
    body.settlement_rate=String(form.settlement_rate).trim();
   }
   if(form.app_secret)body.app_secret=form.app_secret;
   const result=await api.request(endpoint,{method:'PUT',body});
   const provider=result.data?.provider||{};
   const credentials=provider.credentials||{};
   const settings=provider.settings||body;
   const settlement=settings.settlement||{};
   const credentialStatus=provider.credential_status||{configured:true};
   setStatus(credentialStatus);
   onStatusChange?.(Boolean(credentialStatus.configured));
   setForm(current=>({...current,app_id:credentials.app_id||body.app_id,mch_id:credentials.mch_id||body.mch_id,app_secret:'',chain:settings.chain||body.chain,currency:settings.currency||body.currency,expire_second:Number(settings.expire_second||body.expire_second),locale:settings.locale||body.locale,to_address:settings.to_address||'',settlement_mode:settlement.mode||body.settlement_mode,settlement_source_currency:settlement.source_currency||body.settlement_source_currency||'USD',settlement_rate:settlement.rate||body.settlement_rate||'',settlement_decimals:Number(settlement.decimals||body.settlement_decimals||6)}));
   onConfigured?.(settings);
   onToast?.(configured?'TokenPay gateway configuration updated':'TokenPay gateway credentials stored securely');
  }catch(error){onError?.(error)}finally{setSaving(false)}
 };

 if(loading)return <div className="tokenpay-provider-loading"><VbenSkeleton lines={5}/></div>;
 return <div className="tokenpay-provider-config">
  <div className="tokenpay-provider-head"><div><span>External payment gateway</span><h3>TokenPay</h3><p>Hosted cryptocurrency checkout. Signing, App Secret storage, callback verification and payment confirmation stay on Shope Backend.</p></div><VbenBadge tone={configured?'success':'warning'}>{configured?'Credentials stored':'Setup required'}</VbenBadge></div>
  <VbenAlert tone="info" title="Server-only credentials">The App Secret and settlement rate policy are stored in encrypted Backend credentials. Customer Web never receives TokenPay credentials or signing material.</VbenAlert>
  <VbenCard title="Merchant application" description="Copy these values from the TokenPay payment application assigned to this store.">
   <div className="tokenpay-provider-grid">
    <VbenField label="App ID" required><VbenInput value={form.app_id} disabled={!canManage} onChange={e=>setForm({...form,app_id:e.target.value})} placeholder="TokenPay APP_ID" autoComplete="off"/></VbenField>
    <VbenField label="Merchant ID" required><VbenInput value={form.mch_id} disabled={!canManage} onChange={e=>setForm({...form,mch_id:e.target.value})} placeholder="TokenPay mch_id" autoComplete="off"/></VbenField>
    <VbenField label={configured?'Replace App Secret':'App Secret'} required={!configured} hint={configured?'Leave blank to keep the encrypted secret already stored. TokenPay requires exactly 32 bytes when replacing it.':'TokenPay requires an App Secret that is exactly 32 bytes.'} className="tokenpay-provider-span-2"><VbenInput type="password" value={form.app_secret} disabled={!canManage} onChange={e=>setForm({...form,app_secret:e.target.value})} placeholder={configured?'••••••••••••••••••••••••••••••••':'32-byte TokenPay App Secret'} autoComplete="new-password"/></VbenField>
   </div>
   {form.app_secret&&!secretValid&&<div className="tokenpay-secret-error">App Secret is {secretBytes} bytes. TokenPay requires exactly 32 bytes.</div>}
  </VbenCard>
  <VbenCard title="Payment asset" description="Choose the cryptocurrency and network TokenPay will collect.">
   <div className="tokenpay-provider-grid">
    <VbenField label="Blockchain / chain" required hint="Use the chain identifier supported by your TokenPay application."><VbenInput value={form.chain} disabled={!canManage} onChange={e=>setForm({...form,chain:e.target.value.toUpperCase()})} placeholder="TRON"/></VbenField>
    <VbenField label="Currency / asset" required hint="Example: USDT. This is the settlement currency sent to TokenPay."><VbenInput value={form.currency} disabled={!canManage} onChange={e=>setForm({...form,currency:e.target.value.toUpperCase()})} placeholder="USDT"/></VbenField>
    <VbenField label="Payment expiry" hint="60–86400 seconds"><VbenInput type="number" min="60" max="86400" value={form.expire_second} disabled={!canManage} onChange={e=>setForm({...form,expire_second:e.target.value})}/></VbenField>
    <VbenField label="TokenPay payment-page language"><VbenSelect value={form.locale} disabled={!canManage} onChange={e=>setForm({...form,locale:e.target.value})}><option value="en">English</option><option value="zh_cn">简体中文</option></VbenSelect></VbenField>
    <VbenField label="Receiving address" hint="Optional. Leave blank unless your TokenPay application requires an explicit destination address." className="tokenpay-provider-span-2"><VbenInput value={form.to_address} disabled={!canManage} onChange={e=>setForm({...form,to_address:e.target.value})} placeholder="Optional TokenPay receiving address" autoComplete="off"/></VbenField>
   </div>
  </VbenCard>
  <VbenCard title="Settlement pricing" description="Keep storefront orders in their original currency while TokenPay collects a separately quoted cryptocurrency amount.">
   <div className="tokenpay-provider-grid">
    <VbenField label="Settlement mode" required><VbenSelect value={form.settlement_mode} disabled={!canManage} onChange={e=>setForm({...form,settlement_mode:e.target.value})}><option value="EXACT">Exact currency only</option><option value="MANUAL_RATE">Manual quoted rate</option></VbenSelect></VbenField>
    <VbenField label="Settlement precision" hint="TokenPay target amount decimal places"><VbenSelect value={form.settlement_decimals} disabled={!canManage} onChange={e=>setForm({...form,settlement_decimals:Number(e.target.value)})}>{[2,4,6,8].map(v=><option key={v} value={v}>{v} decimals</option>)}</VbenSelect></VbenField>
    {manual&&<><VbenField label="Order currency" required hint="This must exactly match the Shope order currency."><VbenInput value={form.settlement_source_currency} disabled={!canManage} onChange={e=>setForm({...form,settlement_source_currency:e.target.value.toUpperCase()})} placeholder="USD"/></VbenField><VbenField label={`${form.currency||'USDT'} per 1 ${form.settlement_source_currency||'USD'}`} required hint="Example: 1.001 means a $20.00 order settles as 20.02 USDT before rounding."><VbenInput type="number" min="0.00000001" step="0.000001" value={form.settlement_rate} disabled={!canManage} onChange={e=>setForm({...form,settlement_rate:e.target.value})} placeholder="1.000000"/></VbenField></>}
   </div>
   {manual?<VbenAlert tone="warning" title="Rate is frozen per payment attempt">Shope snapshots the source amount, target amount, configured rate, rounding and quote time before opening TokenPay. Existing payment attempts keep their original quote if you change this rate later.</VbenAlert>:<VbenAlert tone="info" title="Exact currency mode">The Shope order currency must exactly match the TokenPay settlement asset. Use Manual quoted rate when the storefront is USD and TokenPay collects USDT.</VbenAlert>}
  </VbenCard>
  <div className="tokenpay-provider-boundary"><div><strong>Callback & return URLs are managed by Shope</strong><span>Merchant users cannot override callback destinations. Browser return is never accepted as proof of payment; Backend callback verification remains authoritative.</span></div>{canManage&&<VbenButton onClick={save} loading={saving} disabled={!ready||!secretValid}>{configured?'Save gateway settings':'Store credentials & configure'}</VbenButton>}</div>
 </div>;
}
