import React,{useEffect,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{navigate}from'../app/router.js';

const COPY={
 kitchen:{eyebrow:'KITCHEN',title:'Kitchen workspace',description:'Accept food orders, prepare them and mark them ready. No payment or delivery-admin controls.',button:'Open Kitchen',route:'/kitchen'},
 cashier:{eyebrow:'CASHIER',title:'Cashier workspace',description:'Review payments, receive COD cash from drivers and hand financial reconciliation to authorized managers.',button:'Open Cashier',route:'/cashier'},
};
export function OperationsLoginPage({mode}){
 const copy=COPY[mode]||COPY.kitchen,{login,session}=useAuth();const[form,setForm]=useState({tenantSlug:'',email:'',password:''}),[busy,setBusy]=useState(false),[error,setError]=useState(null);
 useEffect(()=>{document.documentElement.classList.add('store-ops-document');return()=>document.documentElement.classList.remove('store-ops-document')},[]);
 const set=(key,value)=>setForm(v=>({...v,[key]:value}));
 const submit=async e=>{e.preventDefault();if(busy)return;setBusy(true);setError(null);try{const next=await login({tenantSlug:form.tenantSlug.trim(),email:form.email.trim(),password:form.password});const roles=next?.user?.roles||[];if(!roles.includes(mode==='kitchen'?'KITCHEN':'CASHIER')&&!roles.includes('OWNER'))throw Object.assign(new Error(`This staff account does not have ${copy.title} access.`),{code:'WORKSPACE_ROLE_REQUIRED'});navigate(copy.route)}catch(err){setError(err)}finally{setBusy(false)}};
 if(session){queueMicrotask(()=>navigate(copy.route));return null}
 return <main className={`store-ops-login ${mode}`} data-testid={`${mode}-login-v1`}><section className="store-ops-login-card"><div className="store-ops-brand"><span>L</span><div><strong>Luke Shop</strong><small>{copy.eyebrow}</small></div></div><div className="store-ops-login-copy"><span>{copy.eyebrow} OPERATIONS</span><h1>{copy.title}</h1><p>{copy.description}</p></div>{error&&<div className="store-ops-error"><strong>{error.code||'Sign in failed'}</strong><span>{error.message||'Unable to sign in.'}</span></div>}<form onSubmit={submit}><label>Store / tenant<input value={form.tenantSlug} onChange={e=>set('tenantSlug',e.target.value)} autoComplete="organization" autoCapitalize="none" placeholder="abc-fashion" required autoFocus/></label><label>Email<input type="email" value={form.email} onChange={e=>set('email',e.target.value)} autoComplete="username" autoCapitalize="none" placeholder={`${mode}@store.com`} required/></label><label>Password<input type="password" minLength="12" value={form.password} onChange={e=>set('password',e.target.value)} autoComplete="current-password" required/></label><button className="store-ops-primary" disabled={busy||!form.tenantSlug.trim()||!form.email.trim()||form.password.length<12}>{busy?'Signing in…':copy.button}</button></form><p className="store-ops-login-help">Use the staff account assigned by your store owner or manager.</p></section></main>;
}
