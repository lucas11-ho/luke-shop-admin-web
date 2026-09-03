import fs from'node:fs';

const read=path=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const host=read('src/components/VipRedemptionPolicyCard.jsx');
const issuance=read('src/components/VipIssuanceControls.jsx');

const checks=[
  [host.includes("import{VipIssuanceControls}from'./VipIssuanceControls.jsx'"),'VIP loyalty overview imports recurring issuance controls'],
  [host.includes('<VipIssuanceControls/>'),'VIP loyalty overview mounts recurring issuance controls'],
  [issuance.includes("api.request('/v1/merchant/vip/issuance-policy')"),'Admin reads store-scoped recurring issuance policy'],
  [issuance.includes("api.request('/v1/merchant/vip/issuance-policy',{method:'PUT'")&&issuance.includes('recurring_entitlement_issuance_enabled:requested'),'Admin saves only the Backend issuance toggle'],
  [issuance.includes("api.request('/v1/merchant/vip/issuance/run',{method:'POST'")],'Admin exposes an explicit Backend run-now operation'],
  [issuance.includes("/entitlements/issue`"),'Admin uses the Backend manual entitlement issuance endpoint'],
  [issuance.includes("item.frequency==='MANUAL'")&&issuance.includes("['VOUCHER','GIFT'].includes(item.benefit_type)"),'Manual benefit picker is limited to active manual voucher/gift rules'],
  [issuance.includes('const usedKey=requestKey')&&issuance.includes('if(result.data.created)setRequestKey(newRequestKey())'),'Manual retry key remains stable until Backend confirms a newly created grant'],
  [issuance.includes('request_key:usedKey'),'Manual issuance sends the retry-safe request key to Backend'],
  [issuance.includes('Backend confirms the customer’s current VIP level')&&issuance.includes('Backend server using the vip:issue-recurring command'),'UI documents Backend eligibility and scheduler authority'],
  [!issuance.includes('setInterval(')&&!issuance.includes('setTimeout('),'Merchant Admin does not implement a browser recurring scheduler'],
  [!issuance.includes('localStorage')&&!issuance.includes('sessionStorage'),'Merchant Admin does not persist authoritative issuance state in browser storage'],
  [!issuance.includes("status:'AVAILABLE'")&&!issuance.includes('redeem_code:'),'Merchant Admin does not fabricate entitlement status or redemption codes'],
];

const failed=checks.filter(([,ok])=>!ok).map(([name])=>name);
if(failed.length){console.error('VIP recurring entitlement Admin regression failed:\n- '+failed.join('\n- '));process.exit(1)}
console.log('VIP recurring entitlement Admin regression passed');
