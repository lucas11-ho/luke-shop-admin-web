import React,{useEffect,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{navigate}from'../app/router.js';

export function DriverLoginPage(){
 const{login,session}=useAuth();const[form,setForm]=useState({tenantSlug:'',email:'',password:''}),[busy,setBusy]=useState(false),[error,setError]=useState(null);
 useEffect(()=>{document.documentElement.classList.add('driver-app-document');return()=>document.documentElement.classList.remove('driver-app-document')},[]);
 const set=(key,value)=>setForm(v=>({...v,[key]:value}));
 const submit=async e=>{e.preventDefault();if(busy)return;setBusy(true);setError(null);try{await login({tenantSlug:form.tenantSlug.trim(),email:form.email.trim(),password:form.password});navigate('/driver')}catch(err){setError(err)}finally{setBusy(false)}};
 if(session){queueMicrotask(()=>navigate('/driver'));return null}
 return <main className="driver-login-page" data-testid="driver-login-pro-v1">
  <section className="driver-login-card">
   <div className="driver-login-brand"><span className="driver-login-mark">L</span><div><strong>Luke Shop Driver</strong><small>Delivery workspace</small></div></div>
   <div className="driver-login-copy"><span>DRIVER APP</span><h1>Sign in and start delivering</h1><p>Use the staff email and password your store linked to your driver profile.</p></div>
   {error&&<div className="driver-app-error"><strong>{error.code||'Sign in failed'}</strong><span>{error.message||'Unable to sign in.'}</span></div>}
   <form onSubmit={submit} className="driver-login-form">
    <label>Store / tenant<input value={form.tenantSlug} onChange={e=>set('tenantSlug',e.target.value)} autoCapitalize="none" autoComplete="organization" placeholder="abc-fashion" required autoFocus/></label>
    <label>Email<input type="email" value={form.email} onChange={e=>set('email',e.target.value)} autoComplete="username" autoCapitalize="none" placeholder="driver@store.com" required/></label>
    <label>Password<input type="password" minLength="12" value={form.password} onChange={e=>set('password',e.target.value)} autoComplete="current-password" placeholder="Your driver account password" required/></label>
    <button className="driver-primary-action" disabled={busy||!form.tenantSlug.trim()||!form.email.trim()||form.password.length<12}>{busy?'Signing in…':'Open Driver App'}</button>
   </form>
   <p className="driver-login-help">Need help? Ask your store manager to link or reset your Driver account.</p>
  </section>
 </main>
}
