import assert from'node:assert/strict';
import{readFile}from'node:fs/promises';

const page=await readFile(new URL('../src/pages/DeliveryPage.jsx',import.meta.url),'utf8');
const css=await readFile(new URL('../src/vben-payments-delivery.css',import.meta.url),'utf8');
const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));

for(const token of ['Methods','Zones & Rates','Drivers','Dispatch'])assert.ok(page.includes(token),`missing Delivery Operations tab: ${token}`);
for(const route of ['/v1/merchant/delivery/zones','/v1/merchant/delivery/drivers','/v1/merchant/delivery/dispatches'])assert.ok(page.includes(route),`missing Backend delivery-operations route: ${route}`);
assert.ok(page.includes('/v1/merchant/orders/${encodeURIComponent(orderRef.trim())}'),'dispatch assignment must resolve a real merchant order before choosing a fulfillment');
assert.ok(page.includes("new Set(['PHYSICAL_SHIPPING','PHYSICAL_LOCAL_DELIVERY','FOOD_DELIVERY'])"),'dispatch UI must restrict assignment to physical shipping/local/food delivery');
assert.ok(page.includes("new Set(['DELIVERED','COMPLETED','FAILED','CANCELLED'])"),'dispatch UI must reject terminal fulfillments client-side as well as server-side');
assert.ok(page.includes("pricing_mode==='ZONE_AWARE'")||page.includes("pricing_mode === 'ZONE_AWARE'"),'Delivery Operations must recognize method-level Zone-aware pricing after Backend v026');
assert.ok(page.includes('never activates it automatically')||page.includes('never changes this policy automatically'),'zone rates must remain inert until explicit per-method pricing activation');
assert.ok(page.includes('/pricing-policy'),'Delivery Operations must expose the dedicated Backend pricing-policy contract');
assert.ok(!page.includes("/v1/merchant/fulfillments/${encodeURIComponent(dispatch"),'dispatch UI must not silently mutate fulfillment lifecycle');
assert.ok(page.includes('/v1/merchant/products/${encodeURIComponent(digitalForm.product_id)}/nature'),'existing digital Product Nature conversion must remain available');
assert.ok(css.includes('.delivery-zone-grid')&&css.includes('.delivery-dispatch-toolbar'),'Delivery Operations responsive styles are missing');
assert.equal(pkg.scripts['test:delivery-operations-admin'],'node scripts/v0.13.0-delivery-operations-admin-v1-regression-test.mjs');
assert.ok(pkg.scripts.verify.includes('test:delivery-operations-admin'),'Delivery Operations regression must stay in npm run verify');
console.log('Delivery Operations Admin v1 regression checks passed with explicit zone-pricing opt-in carried forward.');
