import React,{useEffect,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{Card,ErrorBox,Field,Loading,PageHeader,PermissionNote,Toast}from'../components/UI.jsx';
import{useAdminI18n}from'../i18n/AdminI18nContext.jsx';

const defaults={label:true,country_code:true,address_line_2:true,postal_code:true,default_country_code:''};
const clone=x=>JSON.parse(JSON.stringify(x||{}));
function normalized(config={}){const fields=config?.delivery?.address_fields||config?.address_fields||{};return{...defaults,...fields};}

export function AddressFormPage(){
 const{api,has,session}=useAuth();const{t}=useAdminI18n();
 const[data,setData]=useState(null),[config,setConfig]=useState(null),[policy,setPolicy]=useState(defaults),[err,setErr]=useState(null),[busy,setBusy]=useState(false),[toast,setToast]=useState('');
 const load=async()=>{setErr(null);try{const r=await api.request('/v1/merchant/customer-experience');const base=clone(r.data.draft?.config||r.data.published?.config||{});setData(r.data);setConfig(base);setPolicy(normalized(base));}catch(e){setErr(e)}};
 useEffect(()=>{load()},[session?.storeId]);
 if(!has('customer_experience.read'))return <PermissionNote permission="customer_experience.read"/>;
 if(!config&&!err)return <Loading/>;
 const setField=(key,value)=>setPolicy(p=>({...p,[key]:value}));
 const save=async(publish=false)=>{if(!has('customer_experience.manage'))return;setBusy(true);setErr(null);try{const next=clone(config);next.delivery={...(next.delivery||{}),address_fields:{...policy,default_country_code:String(policy.default_country_code||'').trim().toUpperCase().slice(0,2)}};const r=await api.request('/v1/merchant/customer-experience/draft',{method:'PUT',body:{config:next}});setConfig(clone(r.data.draft?.config||next));setPolicy(normalized(r.data.draft?.config||next));if(publish&&has('customer_experience.publish')){await api.request('/v1/merchant/customer-experience/publish',{method:'POST',body:{}});setToast(t('address.published'));await load();}else setToast(t('address.saved'));}catch(e){setErr(e)}finally{setBusy(false)}};
 return <>
  <PageHeader eyebrow="Customer Experience" title={t('address.title')} description={t('address.desc')} actions={<>{has('customer_experience.manage')&&<button className="secondary" disabled={busy} onClick={()=>save(false)}>{t('common.save')}</button>}{has('customer_experience.publish')&&<button className="primary" disabled={busy} onClick={()=>save(true)}>{t('common.publish')}</button>}</>}/>
  <ErrorBox error={err}/>
  {data?.experience_policy?.address_field_policy===false&&<div className="alert"><strong>Platform capability disabled</strong><span>The platform owner has disabled tenant address-field customization. Customer Web will use the safe default address fields.</span></div>}
  <Card title={t('address.fields')} subtitle="Changes affect customer Profile → Addresses and Checkout after publishing.">
   <div className="policy-grid">
    {[['label','address.label'],['country_code','address.country'],['address_line_2','address.line2'],['postal_code','address.postal']].map(([key,label])=><label className="policy-row" key={key}><span><strong>{t(label)}</strong><small>{policy[key]?t('common.enabled'):t('common.disabled')}</small></span><input type="checkbox" checked={policy[key]!==false} disabled={data?.experience_policy?.address_field_policy===false} onChange={e=>setField(key,e.target.checked)}/></label>)}
   </div>
   <Field label={t('address.default_country')} hint={t('address.default_country_hint')}><input value={policy.default_country_code||''} maxLength="2" placeholder="IN" disabled={policy.country_code!==false||data?.experience_policy?.address_field_policy===false} onChange={e=>setField('default_country_code',e.target.value.toUpperCase().replace(/[^A-Z]/g,''))}/></Field>
  </Card>
  <Toast message={toast} onDone={()=>setToast('')}/>
 </>;
}
