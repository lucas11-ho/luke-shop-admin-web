import React from'react';
import{VbenAlert,VbenButton,VbenCard}from'../components/VbenUI.jsx';
import{staffWebConfigured,staffWebHref}from'../config/staffWeb.js';

const labels={home:'Staff Home',driver:'Driver',kitchen:'Kitchen',cashier:'Cashier',dispatcher:'Dispatcher'};

export function StaffWebHandoffPage({workspace='home'}){
 const target=labels[workspace]||labels.home,href=staffWebHref(workspace);
 return <div className="vben-access-page" data-testid="staff-web-handoff-v1">
  <div className="vben-access-hero"><div><span className="vben-access-eyebrow">Operations separation</span><h1>{target} moved to Staff Web</h1><p>Daily operational work now runs in the dedicated Luke Shop Staff application. Merchant Admin remains the owner and back-office control plane.</p></div></div>
  {!staffWebConfigured&&<VbenAlert tone="warning" title="Staff Web URL is not configured">Set <code>VITE_LUKE_SHOP_STAFF_WEB_BASE_URL</code> in the Merchant Admin Cloudflare build environment, then redeploy Merchant Admin.</VbenAlert>}
  <VbenCard title="Open the Staff application" description="Staff Web uses the same Merchant staff identity. Roles, permissions, store scope, payment state, COD, fulfillment and delivery authority remain enforced by the Backend.">
   <div className="detail-grid"><div><span>Workspace</span><strong>{target}</strong></div><div><span>Authentication</span><strong>Existing Merchant staff email and password</strong></div><div><span>Store access</span><strong>Backend-authorized staff store scope</strong></div><div><span>Authority</span><strong>Server-side RBAC and operational policy</strong></div></div>
   <div className="right" style={{marginTop:20}}>{href?<VbenButton size="lg" onClick={()=>window.open(href,'_blank','noopener,noreferrer')}>Open {target} in Staff Web</VbenButton>:<VbenButton size="lg" disabled>Configure Staff Web URL first</VbenButton>}</div>
  </VbenCard>
  <VbenAlert tone="info" title="Owner controls remain here">Delivery configuration, live owner supervision, COD reconciliation, Driver login linkage, Driver App policy, staff access and audit remain in Merchant Admin.</VbenAlert>
 </div>;
}
