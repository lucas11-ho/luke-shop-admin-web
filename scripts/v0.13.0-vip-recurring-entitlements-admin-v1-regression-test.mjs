import fs from'node:fs';

const read=path=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const host=read('src/components/VipRedemptionPolicyCard.jsx');
const issuance=read('src/components/VipIssuanceControls.jsx');
const analytics=read('src/pages/VipAnalyticsPage.jsx');
const analyticsCss=read('src/vip-loyalty-analytics-v1.css');
const app=read('src/app/App.jsx');

const checks=[
  [host.includes("import{VipIssuanceControls}from'./VipIssuanceControls.jsx'"),'VIP loyalty overview imports recurring issuance controls'],
  [host.includes('<VipIssuanceControls/>'),'VIP loyalty overview mounts recurring issuance controls'],
  [issuance.includes("api.request('/v1/merchant/vip/issuance-policy')"),'Admin reads store-scoped recurring issuance policy'],
  [issuance.includes("api.request('/v1/merchant/vip/issuance-policy',{method:'PUT'")&&issuance.includes('recurring_entitlement_issuance_enabled:requested'),'Admin saves only the Backend issuance toggle'],
  [issuance.includes("api.request('/v1/merchant/vip/issuance/run',{method:'POST'"),'Admin exposes an explicit Backend run-now operation'],
  [issuance.includes('/entitlements/issue'),'Admin uses the Backend manual entitlement issuance endpoint'],
  [issuance.includes("item.frequency==='MANUAL'")&&issuance.includes("['VOUCHER','GIFT'].includes(item.benefit_type)"),'Manual benefit picker is limited to active manual voucher/gift rules'],
  [issuance.includes('const usedKey=requestKey')&&issuance.includes('if(result.data.created)setRequestKey(newRequestKey())'),'Manual retry key remains stable until Backend confirms a newly created grant'],
  [issuance.includes('request_key:usedKey'),'Manual issuance sends the retry-safe request key to Backend'],
  [issuance.includes('Backend confirms the customer’s current VIP level')&&issuance.includes('Backend server using the vip:issue-recurring command'),'UI documents Backend eligibility and scheduler authority'],
  [!issuance.includes('setInterval(')&&!issuance.includes('setTimeout('),'Merchant Admin does not implement a browser recurring scheduler'],
  [!issuance.includes('localStorage')&&!issuance.includes('sessionStorage'),'Merchant Admin does not persist authoritative issuance state in browser storage'],
  [!issuance.includes("status:'AVAILABLE'")&&!issuance.includes('redeem_code:'),'Merchant Admin does not fabricate entitlement status or redemption codes'],
  [host.includes("navigate('/vip-analytics')")&&host.includes('Open loyalty analytics'),'VIP control plane links to the dedicated analytics workspace'],
  [app.includes("import{VipAnalyticsPage}from'../pages/VipAnalyticsPage.jsx'")&&app.includes("'/vip-analytics':VipAnalyticsPage"),'Merchant Admin routes the VIP analytics workspace'],
  [analytics.includes("has('loyalty.read')")&&analytics.includes('VbenPermissionNote permission="loyalty.read"'),'Analytics UI preserves loyalty.read RBAC'],
  [analytics.includes("api.request('/v1/merchant/vip/analytics',{query:{days}})"),'Analytics UI reads only the Backend analytics contract'],
  [analytics.includes('const WINDOWS=[7,30,90,365]'),'Analytics UI exposes only bounded reporting windows'],
  [analytics.includes('Reward liability')&&analytics.includes('Cashback redeemed')&&analytics.includes('Available entitlements')&&analytics.includes('Tier movement'),'Analytics UI surfaces liability, redemption, entitlement and tier operations'],
  [analytics.includes('Current positive ledger balances, not browser-calculated estimates.')&&analytics.includes('All figures come from the selected store’s Backend ledger and lifecycle tables.'),'Analytics UI documents Backend authority'],
  [!analytics.includes("method:'POST'")&&!analytics.includes("method:'PUT'")&&!analytics.includes("method:'PATCH'")&&!analytics.includes("method:'DELETE'") ,'Analytics workspace contains no mutation API calls'],
  [!analytics.includes('localStorage')&&!analytics.includes('sessionStorage'),'Analytics workspace does not persist authoritative reporting state in browser storage'],
  [analyticsCss.includes('.vip-analytics-metrics')&&analyticsCss.includes('@media(max-width:720px)'),'Analytics workspace has responsive production styling'],
];

const failed=checks.filter(([,ok])=>!ok).map(([name])=>name);
if(failed.length){console.error('VIP recurring entitlement / analytics Admin regression failed:\n- '+failed.join('\n- '));process.exit(1)}
console.log('VIP recurring entitlement and operations analytics Admin regression passed');
