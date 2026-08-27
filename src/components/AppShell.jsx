import React,{useEffect,useMemo,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{navigate}from'../app/router.js';
import{useMerchantNotifications}from'../notifications/useMerchantNotifications.js';
import{NotificationCenter}from'./NotificationCenter.jsx';
import{useAdminI18n}from'../i18n/AdminI18nContext.jsx';

const groups=[
 ['group.operate',[['dashboard','Dashboard',null,'dashboard','nav.dashboard'],['stores','Stores','stores.read','stores','nav.stores'],['orders','Orders','orders.read','orders','nav.orders'],['products','Products','catalog.read','products','nav.products'],['media-library','Media Library','catalog.read','media','nav.media'],['inventory','Inventory','inventory.read','inventory','nav.inventory'],['customers','Customers','customers.read','customers','nav.customers']]],
 ['group.grow',[['promotions','Promotions','promotions.read','promotions','nav.promotions'],['payments','Payments','payments.read','payments','nav.payments'],['delivery','Delivery','delivery.read','delivery','nav.delivery']]],
 ['group.experience',[['customer-experience','Customer Experience','customer_experience.read','experience','nav.experience'],['languages','Languages','customer_experience.read','languages','nav.languages'],['address-form','Address Form','customer_experience.read','address','nav.address'],['cs-ai','Customer Service','integrations.customer_service.read','support','nav.cs']]],
 ['group.system',[['my-profile','My Profile',null,'profile','nav.profile'],['settings','Settings','tenant.settings.read','settings','nav.settings'],['access','Access',null,'access','nav.access'],['audit','Audit','audit.read','audit','nav.audit']]],
];

const iconPaths={
 dashboard:['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M14 14h7v7h-7z'],
 stores:['M4 10h16','M5 10V6h14v4','M6 10v9h12v-9','M9 19v-5h6v5'],
 orders:['M6 3h12l2 4-2 4H6L4 7z','M7 11v10h10V11','M9 15h6','M9 18h4'],
 products:['M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z','M12 12 4.2 7.6','M12 12l7.8-4.4','M12 12v9'],
 media:['M4 5h16v14H4z','m7 13 3-3 5 5 2-2 3 3','M9 9h.01'],
 inventory:['M4 5h16v5H4z','M4 14h16v5H4z','M8 7.5h4','M8 16.5h6'],
 customers:['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8','M22 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'],
 promotions:['M20 12 12 20 4 12 12 4z','M9 9h.01','M15 15h.01','M9 15l6-6'],
 payments:['M3 6h18v12H3z','M3 10h18','M7 15h3'],
 delivery:['M3 7h11v10H3z','M14 10h4l3 3v4h-7z','M6 17a2 2 0 1 0 4 0','M17 17a2 2 0 1 0 4 0'],
 experience:['M12 3l1.9 4.8L19 9l-4 3.3 1.2 5.2L12 15l-4.2 2.5 1.2-5.2L5 9l5.1-1.2z'],
 languages:['M4 5h10','M9 3v2c0 5-2 8-5 10','M6 9c1 2 3 4 6 5','M14 19l4-10 4 10','M15.5 16h5'],
 address:['M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11z','M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4'],
 support:['M4 5h16v11H7l-3 3z','M8 9h8','M8 12h5'],
 profile:['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8','M4 21a8 8 0 0 1 16 0'],
 settings:['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8','M3 12h2','M19 12h2','M12 3v2','M12 19v2','m5.6-12.4 1.4 1.4','m17 17 1.4 1.4','m18.4 5.6-1.4 1.4','M7 17l-1.4 1.4'],
 access:['M12 3 4 7v5c0 4.8 3.4 7.7 8 9 4.6-1.3 8-4.2 8-9V7z','M9 12l2 2 4-4'],
 audit:['M5 4h14v16H5z','M8 8h8','M8 12h8','M8 16h5'],
 menu:['M4 7h16','M4 12h16','M4 17h16'],
 collapse:['M15 6l-6 6 6 6'],
 expand:['M9 6l6 6-6 6'],
 chevron:['M9 6l6 6-6 6'],
 user:['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8','M4 21a8 8 0 0 1 16 0'],
 logout:['M10 17l5-5-5-5','M15 12H3','M21 19V5a2 2 0 0 0-2-2h-6'],
 home:['M3 11 12 4l9 7','M5 10v10h14V10','M9 20v-6h6v6'],
};

function Icon({name,size=18}){const paths=iconPaths[name]||iconPaths.dashboard;return <svg className="vben-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths.map((d,i)=><path d={d} key={`${name}-${i}`}/>)}</svg>}
function initialCollapsed(){try{return localStorage.getItem('luke-shop-admin.sidebar-collapsed')==='1'}catch{return false}}

export function AppShell({route,children}){
 const{session,logout,updateStore,api}=useAuth();const{locale,setLocale,locales,t}=useAdminI18n();
 const[mobile,setMobile]=useState(false),[collapsed,setCollapsed]=useState(initialCollapsed),[stores,setStores]=useState([]),[accountOpen,setAccountOpen]=useState(false);const notifications=useMerchantNotifications();
 useEffect(()=>{setMobile(false);setAccountOpen(false)},[route]);
 useEffect(()=>{try{localStorage.setItem('luke-shop-admin.sidebar-collapsed',collapsed?'1':'0')}catch{}},[collapsed]);
 useEffect(()=>{let live=true;api.request('/v1/merchant/stores').then(r=>{if(live)setStores(r.data.stores||[])}).catch(()=>{if(live)setStores([])});return()=>{live=false}},[api]);
 const permissions=session?.user?.permissions||[];
 const visibleGroups=useMemo(()=>groups.map(([group,items])=>[group,items.filter(([, ,perm])=>!perm||permissions.includes(perm))]).filter(([,items])=>items.length),[permissions]);
 const go=key=>navigate(`/${key}`);const found=groups.flatMap(x=>x[1]).find(([key])=>route.startsWith(`/${key}`));const title=found?t(found[4]||found[1]):'Workspace';const selected=session?.storeId||'';
 const displayName=session?.user?.display_name||session?.user?.email||'Merchant';const role=session?.user?.role||'Merchant user';
 return <div className={`vben-shell ${collapsed?'is-collapsed':''} ${mobile?'is-mobile-open':''}`}>
  <button className="vben-mobile-overlay" aria-label="Close navigation" onClick={()=>setMobile(false)}/>
  <aside className="vben-sidebar">
   <button className="vben-brand" onClick={()=>go('dashboard')} title="Luke Shop Merchant Admin"><span className="vben-brand-mark">L</span><span className="vben-brand-copy"><strong>Luke Shop</strong><small>Merchant Admin</small></span></button>
   <div className="vben-tenant-card" title={session?.tenantSlug||''}><span>{t('shell.tenant')}</span><strong>{session?.tenantSlug||'—'}</strong></div>
   <nav className="vben-nav" aria-label="Merchant navigation">{visibleGroups.map(([group,items])=><section className="vben-nav-group" key={group}><div className="vben-nav-label">{t(group)}</div>{items.map(([key,fallback,,icon,labelKey])=>{const active=route.startsWith(`/${key}`);const badge=key==='orders'?notifications.newOrders:0;const label=t(labelKey||fallback);return <button key={key} className={`vben-nav-item ${active?'active':''}`} onClick={()=>go(key)} title={collapsed?label:undefined} aria-current={active?'page':undefined}><span className="vben-nav-icon"><Icon name={icon}/></span><span className="vben-nav-text">{label}</span>{badge>0&&<b className="vben-nav-badge">{badge>99?'99+':badge}</b>}</button>})}</section>)}</nav>
   <div className="vben-sidebar-bottom"><button className="vben-collapse-button" onClick={()=>setCollapsed(v=>!v)} title={collapsed?'Expand sidebar':'Collapse sidebar'}><Icon name={collapsed?'expand':'collapse'} size={17}/><span>{collapsed?'':'Collapse'}</span></button></div>
  </aside>
  <section className="vben-workspace">
   <header className="vben-header">
    <div className="vben-header-left"><button className="vben-header-icon vben-mobile-menu" onClick={()=>setMobile(v=>!v)} aria-label="Toggle navigation"><Icon name="menu" size={19}/></button><button className="vben-header-icon vben-desktop-toggle" onClick={()=>setCollapsed(v=>!v)} aria-label="Toggle sidebar"><Icon name={collapsed?'expand':'collapse'} size={18}/></button><div className="vben-breadcrumb"><span>{t('shell.workspace')}</span><i>/</i><strong>{title}</strong></div></div>
    <div className="vben-header-actions"><label className="vben-header-select vben-store-selector store-context store-selector-v3"><span>{t('shell.store_context')}</span><select value={selected} onChange={e=>updateStore(e.target.value)}><option value="">{t('shell.primary_store')}</option>{stores.filter(s=>!s.is_primary).map(s=><option key={s.id} value={s.id}>{s.name}{s.status!=='ACTIVE'?` · ${s.status}`:''}</option>)}</select></label><label className="vben-header-select vben-language-selector admin-language-selector"><span>{t('shell.language')}</span><select value={locale} onChange={e=>setLocale(e.target.value)}>{locales.map(x=><option key={x.code} value={x.code}>{x.native}</option>)}</select></label><div className="vben-notification-slot"><NotificationCenter state={notifications}/></div><div className="vben-live-pill"><i/>{t('shell.live_api')}</div><div className="vben-account"><button className="vben-account-button" onClick={()=>setAccountOpen(v=>!v)} aria-expanded={accountOpen}><span className="vben-account-avatar">{displayName.slice(0,1).toUpperCase()}</span><span className="vben-account-copy"><strong>{displayName}</strong><small>{role}</small></span><Icon name="chevron" size={15}/></button>{accountOpen&&<div className="vben-account-menu"><div className="vben-account-summary"><span className="vben-account-avatar large">{displayName.slice(0,1).toUpperCase()}</span><div><strong>{displayName}</strong><span>{session?.user?.email||role}</span></div></div><button onClick={()=>go('my-profile')}><Icon name="user" size={16}/>My profile</button><button className="danger" onClick={logout}><Icon name="logout" size={16}/>{t('shell.sign_out')}</button></div>}</div></div>
   </header>
   <div className="vben-tabbar"><button className={route==='/dashboard'?'active':''} onClick={()=>go('dashboard')}><Icon name="home" size={14}/><span>{t('nav.dashboard')}</span></button>{route!=='/dashboard'&&<button className="active"><Icon name={found?.[3]||'dashboard'} size={14}/><span>{title}</span></button>}</div>
   <main className="vben-main">{children}</main>
  </section>
 </div>;
}
