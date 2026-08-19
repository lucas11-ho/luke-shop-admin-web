import React,{useEffect,useState}from'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{navigate}from'../app/router.js';
import{useMerchantNotifications}from'../notifications/useMerchantNotifications.js';
import{NotificationCenter}from'./NotificationCenter.jsx';
import{useAdminI18n}from'../i18n/AdminI18nContext.jsx';

const groups=[
 ['group.operate',[['dashboard','nav.dashboard',null,'⌂'],['stores','nav.stores','stores.read','▣'],['orders','nav.orders','orders.read','▤'],['products','nav.products','catalog.read','□'],['media-library','nav.media','catalog.read','▧'],['inventory','nav.inventory','inventory.read','≋'],['customers','nav.customers','customers.read','◎']]],
 ['group.grow',[['promotions','nav.promotions','promotions.read','◇'],['payments','nav.payments','payments.read','$'],['delivery','nav.delivery','delivery.read','→']]],
 ['group.experience',[['customer-experience','nav.experience','customer_experience.read','✦'],['languages','nav.languages','customer_experience.read','🌐'],['address-form','nav.address','customer_experience.read','⌖'],['cs-ai','nav.cs','integrations.customer_service.read','◉']]],
 ['group.system',[['my-profile','nav.profile',null,'◌'],['settings','nav.settings','tenant.settings.read','⚙'],['access','nav.access',null,'⌘'],['audit','nav.audit','audit.read','≡']]],
];

export function AppShell({route,children}){
 const{session,logout,updateStore,api}=useAuth();const{locale,setLocale,locales,t}=useAdminI18n();
 const[mobile,setMobile]=useState(false),[stores,setStores]=useState([]);const notifications=useMerchantNotifications();
 useEffect(()=>setMobile(false),[route]);
 useEffect(()=>{let live=true;api.request('/v1/merchant/stores').then(r=>{if(live)setStores(r.data.stores||[])}).catch(()=>{if(live)setStores([])});return()=>{live=false}},[api]);
 const go=key=>navigate(`/${key}`);const found=groups.flatMap(x=>x[1]).find(([key])=>route.startsWith(`/${key}`));const title=found?t(found[1]):'Workspace';const selected=session?.storeId||'';
 return <div className="app-shell professional-admin"><aside className={`sidebar ${mobile?'open':''}`}><div className="brand"><div className="brand-mark">L</div><div><strong>Luke Shop</strong><span>Merchant workspace</span></div></div><div className="tenant-chip"><span>{t('shell.tenant')}</span><strong>{session?.tenantSlug}</strong></div><nav>{groups.map(([group,items])=><div className="nav-group" key={group}><div className="nav-group-label">{t(group)}</div>{items.map(([key,label,perm,icon])=>{if(perm&&!session?.user?.permissions?.includes(perm))return null;const badge=key==='orders'?notifications.newOrders:0;return <button key={key} className={route.startsWith(`/${key}`)?'active':''} onClick={()=>go(key)}><span className="nav-icon">{icon}</span><span>{t(label)}</span>{badge>0&&<b className="nav-red-badge">{badge>99?'99+':badge}</b>}</button>})}</div>)}</nav><div className="sidebar-foot"><div className="user-mini"><div className="avatar">{(session?.user?.display_name||session?.user?.email||'U').slice(0,1).toUpperCase()}</div><div><strong>{session?.user?.display_name||'Merchant'}</strong><span>{session?.user?.role||'Merchant user'}</span></div></div><button className="ghost full" onClick={logout}>{t('shell.sign_out')}</button></div></aside><div className="workspace"><header className="topbar"><button className="mobile-menu" onClick={()=>setMobile(!mobile)}>☰</button><div className="crumb"><span>{t('shell.workspace')}</span><strong>{title}</strong></div><div className="topbar-actions"><label className="admin-language-selector"><span>{t('shell.language')}</span><select value={locale} onChange={e=>setLocale(e.target.value)}>{locales.map(x=><option key={x.code} value={x.code}>{x.native}</option>)}</select></label><label className="store-context store-selector-v3"><span>{t('shell.store_context')}</span><select value={selected} onChange={e=>updateStore(e.target.value)}><option value="">{t('shell.primary_store')}</option>{stores.filter(s=>!s.is_primary).map(s=><option key={s.id} value={s.id}>{s.name}{s.status!=='ACTIVE'?` · ${s.status}`:''}</option>)}</select></label><NotificationCenter state={notifications}/><div className="env-pill"><i/>{t('shell.live_api')}</div></div></header><main>{children}</main></div></div>;
}
