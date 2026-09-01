import React,{useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{navigate}from'../app/router.js';
import{VbenAlert,VbenButton,VbenField,VbenInput,VbenPasswordInput}from'../components/VbenUI.jsx';
import{isStaffOnlyUser,resolveStaffWorkspaces}from'../staff/workspaces.js';

export function StaffLoginPage(){
  const{login}=useAuth();
  const[form,setForm]=useState({tenantSlug:'',email:'',password:''}),[busy,setBusy]=useState(false),[error,setError]=useState(null);
  const set=(key,value)=>setForm(current=>({...current,[key]:value}));
  const submit=async event=>{
    event.preventDefault();if(busy)return;setBusy(true);setError(null);
    try{
      const next=await login({tenantSlug:form.tenantSlug.trim(),email:form.email.trim(),password:form.password});
      const staffOnly=isStaffOnlyUser(next.user),workspaces=resolveStaffWorkspaces(next.user);
      navigate(staffOnly&&workspaces.length?'/staff':'/dashboard');
    }catch(nextError){setError(nextError)}finally{setBusy(false)}
  };
  return <div className="vben-auth-page staff-login-page">
    <aside className="vben-auth-hero" aria-label="Luke Shop Staff Operations">
      <div className="vben-auth-brand"><span className="vben-auth-brand-mark">L</span><span className="vben-auth-brand-copy"><strong>Luke Shop</strong><span>Staff Operations</span></span></div>
      <div className="vben-auth-hero-copy"><div className="vben-auth-kicker">Operations workspace</div><h1>One secure sign-in for daily staff work.</h1><p>Driver, Kitchen and Cashier use the same merchant staff identity. Access is resolved from the authenticated account instead of a browser-selected role.</p><div className="staff-login-principles"><span>Tenant scoped</span><span>Permission driven</span><span>No separate staff passwords</span></div></div>
      <div className="vben-auth-hero-foot">Luke Shop · Staff Operations preparation</div>
    </aside>
    <main className="vben-auth-main"><div className="vben-auth-top"><button type="button" className="staff-login-admin-link" onClick={()=>navigate('/login')}>Merchant Admin</button></div><div className="vben-auth-center"><form className="vben-auth-form" onSubmit={submit}><div className="vben-auth-form-head"><div className="vben-auth-mobile-brand"><span className="vben-auth-brand-mark">L</span><span className="vben-auth-brand-copy"><strong>Luke Shop</strong><span>Staff Operations</span></span></div><h2>Staff sign in</h2><p>Use the staff account already created by your merchant administrator.</p></div>{error&&<VbenAlert tone="danger" title={error.code||'Sign in failed'}>{error.message||'Unable to sign in.'}</VbenAlert>}<VbenField label="Tenant" required><VbenInput icon="store" value={form.tenantSlug} onChange={e=>set('tenantSlug',e.target.value)} placeholder="your-store" autoComplete="organization" autoCapitalize="none" spellCheck="false" required autoFocus disabled={busy}/></VbenField><VbenField label="Email" required><VbenInput icon="mail" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="staff@example.com" autoComplete="username" autoCapitalize="none" spellCheck="false" required disabled={busy}/></VbenField><VbenField label="Password" hint="Use the existing Merchant staff password." required><VbenPasswordInput icon="lock" minLength="12" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Password" autoComplete="current-password" required disabled={busy}/></VbenField><VbenButton type="submit" size="lg" loading={busy} disabled={!form.tenantSlug.trim()||!form.email.trim()||form.password.length<12} className="vben-auth-submit vui-button-full">{busy?'Signing in…':'Sign in to Staff Operations'}</VbenButton><div className="vben-auth-session-note"><i/>Workspace access comes from server-issued roles and permissions.</div></form></div></main>
  </div>;
}
