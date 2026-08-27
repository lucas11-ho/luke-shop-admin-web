import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{VbenAlert,VbenBadge,VbenButton,VbenCard,VbenField,VbenInput,VbenMetric,VbenPermissionNote,VbenSelect,VbenSkeleton,VbenSwitch,VbenTabs,VbenToast,vbenStatusTone}from'../components/VbenUI.jsx';

const defaultSupport={enabled:false,provider:'LUKE_CS',label:'Customer Support',placement:{},chat_url:'',platform_route_key:''};
const defaultIdentity={id_prefix:'CUS',auth_config:{email_password:true,google:false,telegram:false,phone:false,phone_countries:['KH','IN','MM','ID'],turnstile_login_required:true,turnstile_signup_required:true,turnstile_social_required:false}};
const tabItems=[
 {value:'regional',label:'Regional'},
 {value:'identity',label:'Customer identity & login'},
 {value:'branding',label:'Branding identity'},
 {value:'modules',label:'Modules'},
 {value:'customer_service',label:'Customer service'},
];
const humanize=value=>String(value||'').replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase());

export function SettingsPage(){
 const{api,has}=useAuth();
 const[tenant,setTenant]=useState(null),[tab,setTab]=useState('regional'),[regional,setRegional]=useState({currency:'USD',locale:'en',timezone:'UTC'}),[branding,setBranding]=useState({}),[modules,setModules]=useState({}),[support,setSupport]=useState(defaultSupport),[identity,setIdentity]=useState(defaultIdentity),[authRuntime,setAuthRuntime]=useState(null),[err,setErr]=useState(null),[toast,setToast]=useState(''),[loading,setLoading]=useState(true),[saving,setSaving]=useState('');
 const canWrite=has('tenant.settings.write');
 const enabledModules=useMemo(()=>Object.values(modules).filter(Boolean).length,[modules]);
 const readyProviders=useMemo(()=>{const methods=authRuntime?.auth?.methods||{};return ['google','telegram','phone'].filter(k=>methods[k]?.ready).length},[authRuntime]);

 const load=async()=>{setLoading(true);setErr(null);try{const[d,a]=await Promise.all([api.request('/v1/merchant/tenant'),api.request('/v1/merchant/customer-auth/options')]);const t=d.data.tenant;setTenant(t);setRegional({currency:t.currency,locale:t.locale,timezone:t.timezone});setBranding(t.branding||{});setModules(t.modules||{});setSupport({...defaultSupport,...(t.customer_service||{})});setIdentity({id_prefix:t.customer_id_prefix||a.data.auth?.id_prefix||'CUS',auth_config:{email_password:t.customer_auth?.email_password!==false,google:Boolean(t.customer_auth?.google),telegram:Boolean(t.customer_auth?.telegram),phone:Boolean(t.customer_auth?.phone),phone_countries:t.customer_auth?.phone_countries||['KH','IN','MM','ID'],turnstile_login_required:t.customer_auth?.turnstile_login_required??a.data.auth?.turnstile?.login_required??true,turnstile_signup_required:t.customer_auth?.turnstile_signup_required??a.data.auth?.turnstile?.signup_required??true,turnstile_social_required:t.customer_auth?.turnstile_social_required??a.data.auth?.turnstile?.social_required??false}});setAuthRuntime(a.data)}catch(e){setErr(e)}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const save=async(key,body)=>{setSaving(key);setErr(null);try{await api.request('/v1/merchant/tenant/settings',{method:'PATCH',body});setToast('Settings saved');await load()}catch(e){setErr(e)}finally{setSaving('')}};
 if(!has('tenant.settings.read'))return <VbenPermissionNote permission="tenant.settings.read"/>;

 return <div className="vben-settings-page">
  <div className="vben-settings-hero">
   <div><span className="vben-settings-eyebrow">Tenant control plane</span><h1>Store settings</h1><p>Manage regional defaults, customer authentication, tenant identity, modules and storefront support integration. Advanced storefront design remains in Customer Experience.</p></div>
   <div className="vben-settings-status"><VbenBadge tone={vbenStatusTone(tenant?.status)}>{tenant?.status||'LOADING'}</VbenBadge><span>{tenant?.slug||'Tenant loading'}</span></div>
  </div>
  {err&&<VbenAlert tone="danger" title={err.code||'Request failed'}>{err.message||'Unable to complete the settings request.'}</VbenAlert>}
  {loading?<VbenCard><VbenSkeleton lines={6}/></VbenCard>:<>
   <div className="vben-settings-metrics">
    <VbenMetric label="Tenant" value={tenant?.name||'—'} detail={tenant?.slug||'No slug'} icon="store"/>
    <VbenMetric label="Enabled modules" value={enabledModules} detail={`${Object.keys(modules).length} configured`} icon="dashboard" tone="success"/>
    <VbenMetric label="External login ready" value={readyProviders} detail="Google · Telegram · Phone" icon="users" tone="primary"/>
    <VbenMetric label="Customer support" value={support.enabled?'Enabled':'Disabled'} detail={support.provider||'LUKE_CS'} icon="info" tone={support.enabled?'success':'warning'}/>
   </div>
   <div className="vben-settings-identity-strip"><div><span>Tenant ID</span><code>{tenant?.public_id||'—'}</code></div><div><span>Currency</span><strong>{regional.currency||'—'}</strong></div><div><span>Locale</span><strong>{regional.locale||'—'}</strong></div><div><span>Timezone</span><strong>{regional.timezone||'—'}</strong></div></div>
   <VbenTabs value={tab} onChange={setTab} items={tabItems}/>

   {tab==='regional'&&<VbenCard title="Regional settings" description="Defaults used by merchant operations, pricing and tenant-timezone scheduling.">
    <form className="vben-settings-form-grid" onSubmit={e=>{e.preventDefault();save('regional',regional)}}>
     <VbenField label="Currency" hint="Three-letter ISO currency code."><VbenInput maxLength="3" value={regional.currency} onChange={e=>setRegional({...regional,currency:e.target.value.toUpperCase()})}/></VbenField>
     <VbenField label="Locale"><VbenInput value={regional.locale} onChange={e=>setRegional({...regional,locale:e.target.value})}/></VbenField>
     <VbenField label="Timezone" hint="Used by promotion scheduling and merchant date/time displays."><VbenInput value={regional.timezone} onChange={e=>setRegional({...regional,timezone:e.target.value})} placeholder="Asia/Singapore"/></VbenField>
     {canWrite&&<div className="vben-settings-form-actions"><VbenButton type="submit" loading={saving==='regional'}>Save regional settings</VbenButton></div>}
    </form>
   </VbenCard>}

   {tab==='identity'&&<VbenCard title="Customer identity & login" description="Control readable member IDs, production-ready login providers and Cloudflare anti-bot verification.">
    <div className="vben-settings-identity-grid">
     <div className="vben-settings-panel">
      <h3>Customer identity</h3>
      <VbenField label="Customer ID prefix" hint="2–6 uppercase letters. Existing member IDs never change when you change the prefix."><VbenInput maxLength="6" value={identity.id_prefix} onChange={e=>setIdentity({...identity,id_prefix:e.target.value.toUpperCase().replace(/[^A-Z]/g,'')})}/></VbenField>
      <div className="vben-customer-id-preview"><span>Next customer ID preview</span><strong>{authRuntime?.next_customer_code||`${identity.id_prefix||'CUS'}0000001`}</strong><small>Internal UUIDs remain unchanged and private.</small></div>
     </div>
     <div className="vben-settings-panel">
      <h3>Login methods</h3>
      <div className="vben-provider-grid">{[['email_password','Email & password','Built in',true],['google','Google','CUSTOMER_GOOGLE_CLIENT_ID',authRuntime?.auth?.methods?.google?.ready],['telegram','Telegram','BotFather Web Login Client ID',authRuntime?.auth?.methods?.telegram?.ready],['phone','Phone OTP','SMS/OTP webhook',authRuntime?.auth?.methods?.phone?.ready]].map(([key,label,need,ready])=><label className={`vben-provider-card ${ready?'is-ready':'needs-setup'}`} key={key}>
       <input type="checkbox" disabled={key!=='email_password'&&!ready} checked={Boolean(identity.auth_config[key])} onChange={e=>setIdentity({...identity,auth_config:{...identity.auth_config,[key]:e.target.checked}})}/>
       <div><strong>{label}</strong><span>{ready?(key==='telegram'&&authRuntime?.auth?.methods?.telegram?.mode==='OIDC_LIBRARY'?'Modern Telegram Login ready':'Provider ready'):key==='email_password'?'Built in':`Needs ${need}`}</span></div><VbenBadge tone={ready?'success':'warning'}>{ready?'READY':'SETUP'}</VbenBadge>
      </label>)}</div>
      <VbenAlert tone="info" title="Provider safety">Secrets stay in Render. Merchant Admin only enables providers that Backend confirms are configured. Forgot-password is intentionally unavailable until a real recovery delivery channel is added.</VbenAlert>
     </div>
    </div>
    <div className="vben-settings-security-panel"><div className="vben-settings-section-head"><div><h3>Cloudflare Turnstile</h3><p>Server-side Siteverify protection for customer authentication.</p></div><VbenBadge tone={authRuntime?.auth?.turnstile?.ready?'success':'warning'}>{authRuntime?.auth?.turnstile?.ready?'READY':'SETUP'}</VbenBadge></div>
     {authRuntime?.auth?.turnstile?.ready?<div className="vben-settings-switch-grid">
      <VbenSwitch checked={Boolean(identity.auth_config.turnstile_login_required)} onChange={checked=>setIdentity({...identity,auth_config:{...identity.auth_config,turnstile_login_required:checked}})} label="Email sign in" description="Require Turnstile before password login"/>
      <VbenSwitch checked={Boolean(identity.auth_config.turnstile_signup_required)} onChange={checked=>setIdentity({...identity,auth_config:{...identity.auth_config,turnstile_signup_required:checked}})} label="Email sign up" description="Require Turnstile before creating an account"/>
      <VbenSwitch checked={Boolean(identity.auth_config.turnstile_social_required)} onChange={checked=>setIdentity({...identity,auth_config:{...identity.auth_config,turnstile_social_required:checked}})} label="Social sign in" description="Optional extra Turnstile before Google / Telegram"/>
     </div>:<VbenAlert tone="warning" title="Turnstile not configured">Add CUSTOMER_TURNSTILE_SITE_KEY, CUSTOMER_TURNSTILE_SECRET_KEY and CUSTOMER_TURNSTILE_HOSTNAMES to the Shop Backend environment.</VbenAlert>}
    </div>
    {canWrite&&<div className="vben-settings-card-actions"><VbenButton loading={saving==='identity'} onClick={()=>save('identity',{customer_identity:identity})}>Save customer identity settings</VbenButton></div>}
   </VbenCard>}

   {tab==='branding'&&<VbenCard title="Tenant identity" description="Basic platform identity. Storefront theme, templates and typography are managed in Customer Experience.">
    <div className="vben-settings-form-grid">
     <VbenField label="Store name"><VbenInput value={branding.store_name||''} onChange={e=>setBranding({...branding,store_name:e.target.value})}/></VbenField>
     <VbenField label="Logo URL"><VbenInput type="url" value={branding.logo_url||''} onChange={e=>setBranding({...branding,logo_url:e.target.value})}/></VbenField>
     <VbenField label="Legacy accent"><div className="vben-color-field"><input type="color" value={branding.accent||'#166534'} onChange={e=>setBranding({...branding,accent:e.target.value})}/><VbenInput value={branding.accent||'#166534'} onChange={e=>setBranding({...branding,accent:e.target.value})}/></div></VbenField>
    </div>
    {canWrite&&<div className="vben-settings-card-actions"><VbenButton loading={saving==='branding'} onClick={()=>save('branding',{branding})}>Save identity</VbenButton></div>}
   </VbenCard>}

   {tab==='modules'&&<VbenCard title="Enabled modules" description="Platform plan and owner controls can still limit which capabilities this tenant is allowed to use.">
    {!Object.keys(modules).length?<VbenAlert tone="info" title="No module overrides">This tenant currently has no editable module flags.</VbenAlert>:<div className="vben-settings-switch-grid">{Object.entries(modules).map(([k,v])=><VbenSwitch key={k} checked={Boolean(v)} onChange={checked=>setModules({...modules,[k]:checked})} label={humanize(k)} description={v?'Enabled':'Disabled'}/>)}</div>}
    {canWrite&&<div className="vben-settings-card-actions"><VbenButton loading={saving==='modules'} onClick={()=>save('modules',{modules})}>Save modules</VbenButton></div>}
   </VbenCard>}

   {tab==='customer_service'&&<VbenCard title="Customer service" description="Connect this storefront to the matching Luke CS platform. Signed customer context is sent securely after the chat iframe opens — never in its URL.">
    <VbenAlert tone="info" title="Commerce Connector v2">First create an AI credential in Luke CS & AI, save that credential inside Luke CS, then paste the generated Luke CS Chat URL and platform route key here.</VbenAlert>
    <div className="vben-settings-form-grid">
     <VbenField label="Enabled"><VbenSwitch checked={Boolean(support.enabled)} onChange={checked=>setSupport({...support,enabled:checked})} label="Customer support enabled" description={support.enabled?'Support surfaces may be shown in Customer Web.':'Support surfaces remain hidden.'}/></VbenField>
     <VbenField label="Provider"><VbenInput value="LUKE_CS" disabled/></VbenField>
     <VbenField label="Button label"><VbenInput value={support.label||''} onChange={e=>setSupport({...support,label:e.target.value})}/></VbenField>
     <VbenField label="Luke CS Chat URL"><VbenInput type="url" value={support.chat_url||''} placeholder="https://chat.example.com/p/client/chat" onChange={e=>setSupport({...support,chat_url:e.target.value})}/></VbenField>
     <VbenField label="Luke CS platform route key"><VbenInput value={support.platform_route_key||''} placeholder="client-route-key" onChange={e=>setSupport({...support,platform_route_key:e.target.value.toLowerCase()})}/></VbenField>
    </div>
    <VbenAlert tone="info" title="Browser boundary">No Shop credential or signed customer token is stored in browser configuration. Customer Web requests a short-lived context only after an authenticated customer opens support.</VbenAlert>
    <div className="vben-settings-section-head"><div><h3>Placements</h3><p>Choose the customer surfaces where the support entry point may appear.</p></div></div>
    <div className="vben-settings-switch-grid">{['floating','home','profile','order_detail','product_detail','checkout'].map(k=><VbenSwitch key={k} checked={Boolean(support.placement?.[k])} onChange={checked=>setSupport({...support,placement:{...(support.placement||{}),[k]:checked}})} label={humanize(k)} description={support.placement?.[k]?'Visible':'Hidden'}/>)}</div>
    {canWrite&&<div className="vben-settings-card-actions"><VbenButton loading={saving==='customer_service'} onClick={()=>save('customer_service',{customer_service:support})}>Save customer service</VbenButton></div>}
   </VbenCard>}
  </>}
  <VbenToast message={toast} onDone={()=>setToast('')}/>
 </div>;
}
