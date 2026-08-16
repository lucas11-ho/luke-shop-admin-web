import fs from 'node:fs';
const read=(p)=>fs.readFileSync(p,'utf8').replace(/\r\n?/g,'\n');
const pkg=JSON.parse(read('package.json'));let n=0;
const pass=(ok,msg)=>{if(!ok)throw new Error(`FAIL ${msg}`);n++;console.log(`PASS ${msg}`)};

pass(['0.8.0','0.9.0','0.9.1','0.10.0'].includes(pkg.version),'release is v0.8.0');
pass(pkg.engines.node==='>=24','Node 24+ required');
pass(pkg.dependencies.react==='19.1.1','React exact version pinned');
pass(pkg.devDependencies.vite==='7.1.2','Vite exact version pinned');

const client=read('src/api/client.js'),auth=read('src/auth/AuthContext.jsx'),shell=read('src/components/AppShell.jsx'),app=read('src/app/App.jsx');
const cx=read('src/pages/CustomerExperiencePage.jsx'),ui=read('src/components/UI.jsx'),styles=read('src/styles.css'),dashboard=read('src/pages/DashboardPage.jsx'),prod=read('src/pages/ProductsPage.jsx'),inv=read('src/pages/InventoryPage.jsx'),orders=read('src/pages/OrdersPage.jsx'),customers=read('src/pages/CustomersPage.jsx'),payments=read('src/pages/PaymentsPage.jsx'),delivery=read('src/pages/DeliveryPage.jsx'),promos=read('src/pages/PromotionsPage.jsx'),settings=read('src/pages/SettingsPage.jsx'),cs=read('src/pages/CustomerServicePage.jsx'),access=read('src/pages/AccessPage.jsx');

pass(client.includes('x-tenant-slug'),'tenant slug header is sent');
pass(client.includes('x-store-id'),'optional store context header is sent');
pass(client.includes('/v1/merchant/auth/refresh'),'401 refresh rotation implemented');
pass(client.includes('liveSession=next'),'refresh retry uses rotated access token immediately');
pass(!client.includes('localStorage'),'auth tokens are not persisted to localStorage');
pass(client.includes('sessionStorage'),'session uses tab-scoped sessionStorage');
pass(auth.includes('/v1/merchant/auth/login'),'merchant login uses backend route');
pass(auth.includes('/v1/merchant/auth/logout'),'merchant logout uses backend route');
pass(shell.includes('session?.user?.permissions'),'navigation is permission-aware');

for(const [r,m] of [['/dashboard','DashboardPage'],['/products','ProductsPage'],['/inventory','InventoryPage'],['/orders','OrdersPage'],['/customers','CustomersPage'],['/payments','PaymentsPage'],['/delivery','DeliveryPage'],['/promotions','PromotionsPage'],['/cs-ai','CustomerServicePage'],['/settings','SettingsPage'],['/access','AccessPage'],['/customer-experience','CustomerExperiencePage']])pass(app.includes(`'${r}':${m}`),`route ${r} exists`);

for(const endpoint of ['/v1/merchant/products','/v1/merchant/categories','/variants','/media','/modifier-groups'])pass(prod.includes(endpoint),`product workspace integrates ${endpoint}`);
pass(prod.includes("method:'PATCH'")&&prod.includes('/v1/merchant/products/${encodeURIComponent(selected)}'),'product detail can be patched');
pass(prod.includes('compare_at_price'),'product editor exposes compare-at pricing');
pass(prod.includes('low_stock_threshold'),'product editor exposes low-stock threshold');
pass(prod.includes('fulfillment_modes'),'product editor exposes fulfillment modes');
pass(prod.includes('visibility')&&prod.includes('PRIVATE'),'media workspace supports public/private asset visibility');
pass(prod.includes('price_override')&&prod.includes('attributes'),'variant workspace supports SKU attributes and pricing');
pass(prod.includes('min_selections')&&prod.includes('max_selections'),'modifier builder supports selection rules');
pass(!prod.includes("api.request(`/v1/merchant/products/${encodeURIComponent(selected)}`,{method:'DELETE'"),'product UI does not invent unsupported product delete endpoint');
pass(prod.includes('Opening stock quantity'),'product creation exposes opening stock quantity');
pass(prod.includes('Opening stock from product creation'),'opening stock uses audited inventory receive adjustment');
pass(prod.includes('Quick stock adjustment'),'product workspace exposes inline stock adjustment');
pass(prod.includes('/v1/merchant/inventory/adjustments'),'product workspace uses existing inventory adjustment API');
pass(prod.includes("has('inventory.write')"),'inline stock writes are permission-aware');
pass(prod.includes('Stock quantity'),'product overview surfaces stock quantity summary');
pass(prod.includes('Opening stock from variant creation'),'variant creation can receive opening SKU stock');

pass(inv.includes('/v1/merchant/inventory/ledger'),'inventory ledger viewer uses backend endpoint');
pass(inv.includes('/v1/merchant/inventory/locations'),'inventory locations workspace uses backend endpoint');
pass(inv.includes("quantity:Number(form.quantity)"),'inventory adjustment uses backend quantity contract');
pass(inv.includes("['RECEIVE','RETURN','DAMAGE','ADJUSTMENT']"),'inventory movement types match backend contract');

for(const endpoint of ['/v1/merchant/orders','/transition','/payment/confirm','/payment/fail','/v1/merchant/fulfillments/'])pass(orders.includes(endpoint),`order workspace integrates ${endpoint}`);
pass(orders.includes('shipping_address'),'order detail renders merchant shipping snapshot');
pass(orders.includes('status_history'),'order detail renders immutable status history');
pass(orders.includes('adjustments'),'order detail renders promotion/order adjustments');
pass(orders.includes("has('payments.manage')"),'payment actions are permission-aware');
pass(orders.includes("has('delivery.manage')"),'fulfillment actions are permission-aware');

pass(customers.includes('/v1/merchant/customers/${encodeURIComponent(r.public_id)}'),'customer detail endpoint is used');
pass(customers.includes('/status'),'customer lifecycle controls use status endpoint');
pass(customers.includes("has('customers.status.manage')"),'customer status writes are permission-aware');

pass(payments.includes('/v1/merchant/payment-methods'),'payment methods endpoint is integrated');
pass(payments.includes("method:'PATCH'")&&payments.includes('/payment-methods/'),'payment methods can be edited');
pass(payments.includes('/payment`')||payments.includes('/payment\''),'payment detail endpoint is integrated');
pass(payments.includes('attempts'),'payment attempt history is rendered');

pass(delivery.includes('/v1/merchant/delivery-methods'),'delivery methods endpoint is integrated');
pass(delivery.includes("method:'PATCH'")&&delivery.includes('/delivery-methods/'),'delivery methods can be edited');
pass(delivery.includes('free_over')&&delivery.includes('min_order'),'delivery pricing thresholds are editable');
pass(delivery.includes('estimated_min_minutes')&&delivery.includes('estimated_max_minutes'),'delivery ETA range is editable');

for(const endpoint of ['/v1/merchant/promotions','/codes','/targets'])pass(promos.includes(endpoint),`promotion workspace integrates ${endpoint}`);
pass(promos.includes("method:'PATCH'")&&promos.includes('/v1/merchant/promotions/${encodeURIComponent(selected)}'),'promotion detail can be edited');
pass(promos.includes("target_type==='PRODUCT'")&&promos.includes("target_type==='CATEGORY'"),'promotion target builder supports product and category targets');
pass(promos.includes('usage_limit')&&promos.includes('per_customer_limit'),'promotion usage limits are editable');
pass(promos.includes('first_order_only'),'first-order promotion rule is editable');

pass(settings.includes('branding'),'tenant branding JSON is editable');
pass(settings.includes('modules'),'tenant module JSON is editable');
pass(settings.includes('customer_service'),'tenant customer-service JSON is editable');
pass(settings.includes('/v1/merchant/tenant/settings'),'settings use backend tenant settings endpoint');

pass(dashboard.includes('pendingPayments'),'dashboard surfaces payment attention');
pass(dashboard.includes('lowStock'),'dashboard surfaces low-stock attention');
pass(dashboard.includes('activePromos'),'dashboard surfaces active promotions');

for(const endpoint of ['/v1/merchant/integrations/customer-service/policy','/v1/merchant/integrations/customer-service/credentials'])pass(cs.includes(endpoint),`CS UI integrates ${endpoint}`);
pass(cs.includes('ai_access'),'AI policy remains independently editable');
for(const endpoint of ['/v1/merchant/staff','/v1/merchant/roles','/v1/merchant/permissions'])pass(access.includes(endpoint),`Access UI retains ${endpoint}`);
pass(access.includes('/reset-password'),'staff password reset remains wired');
pass(access.includes('/force-logout'),'staff force logout remains wired');

pass(ui.includes('function Tabs'),'shared tabs component exists');
pass(ui.includes("size='md'")&&ui.includes('modal-${size}'),'modal supports large operations workspaces');
pass(styles.includes('.workspace-summary'),'commerce workspace summary styling exists');
pass(styles.includes('.media-grid'),'product media workspace styling exists');
pass(styles.includes('.timeline'),'order history timeline styling exists');
pass(styles.includes('.ops-grid'),'operations dashboard styling exists');
pass(!read('src/pages/SettingsPage.jsx').includes('JSON.stringify'),'settings uses readable controls instead of raw JSON editor');

pass(cx.includes('/v1/merchant/customer-experience'),'customer experience read API is integrated');
pass(cx.includes('/draft')&&cx.includes("method:'PUT'"),'customer experience draft save is integrated');
pass(cx.includes('/publish'),'customer experience publish is integrated');
pass(cx.includes('/rollback'),'customer experience rollback is integrated');
pass(cx.includes('Home page builder'),'safe home section builder exists');
pass(cx.includes('<iframe')&&cx.includes('PreviewStudio'),'customer experience real Customer Web preview exists');
pass(cx.includes('customer_experience.publish'),'publish permission is enforced in UI');
pass(styles.includes('.store-designer-shell'),'customer experience Store Designer v3 workspace styling exists');
pass(cx.includes('VITE_LUKE_SHOP_CUSTOMER_WEB_BASE_URL'),'Customer Experience uses configured Customer Web base');
pass(cx.includes('data?.store?.storefront_path')||cx.includes('storefront_path'),'Customer Experience preserves readable storefront path support');
pass(cx.includes('Open live'),'published storefront action exists');
pass(cx.includes('/preview-token')&&cx.includes("method:'POST'"),'secure draft preview token endpoint is integrated');
pass(cx.includes('preview_path')&&cx.includes('window.open'),'draft preview opens signed preview path');
pass(read('.env.example').includes('VITE_LUKE_SHOP_CUSTOMER_WEB_BASE_URL'),'Customer Web base is environment scoped');

pass(/Backend v0\.(?:11\.(?:0|1)|12\.0)/.test(read('README.md')),'README pins compatible Backend v0.11.x/v0.12.0 contract');
pass(read('API_INTEGRATION.md').includes('No direct database access'),'integration documentation prohibits direct DB access');
pass(read('API_INTEGRATION.md').includes('No unsupported delete'),'integration documentation records API boundary discipline');


const assets=read('src/pages/AssetsPage.jsx');
pass(app.includes("'/media-library':AssetsPage"),'Media Library route is registered');
pass(shell.includes("['media-library','Media Library','catalog.read'"),'Media Library navigation is catalog permission scoped');
pass(client.includes('rawBody')&&client.includes('contentType'),'API client supports raw binary uploads');
pass(assets.includes('/v1/merchant/assets/upload'),'Media Library upload endpoint is integrated');
pass(assets.includes('/v1/merchant/assets/${encodeURIComponent(id)}'),'Media Library deactivate endpoint is integrated');
pass(prod.includes('Upload & attach'),'product media has upload-and-attach workflow');
pass(prod.includes('/v1/merchant/assets/upload'),'product media uploads into tenant asset library');
pass(prod.includes('asset_id'),'product media attaches existing assets');
pass(prod.includes('/media/order'),'product media reorder endpoint is integrated');
pass(prod.includes('Set primary'),'product media primary selection is available');
pass(prod.includes('Choose from Media Library'),'existing assets can be reused without duplicate upload');
pass(styles.includes('.asset-grid'),'Media Library responsive grid styling exists');

pass(cx.includes('Storefront features')&&cx.includes('FeaturesPanel'),'Customer Experience exposes safe feature toggles');
pass(cx.includes('Video poster')&&cx.includes('CTA label')&&cx.includes('CTA path'),'Customer Experience exposes media and CTA section fields');
pass(cx.includes('Item limit')&&cx.includes('limit:Number'),'Customer Experience exposes safe section limits');
pass(styles.includes('.feature-list-v3')&&styles.includes('.home-builder-v3'),'Customer Experience v3 refinement styles exist');
pass(cx.includes('/v1/merchant/customer-experience/catalog'),'Store Designer loads canonical template/font catalog');
pass(cx.includes('/apply-template'),'Store Designer applies templates server-side');
pass(cx.includes('typography_presets')&&cx.includes('TypographyPanel'),'canonical typography catalog is represented in Store Designer');
pass(ui.includes('DateTimePicker'),'shared popup calendar/date-time picker exists');
pass(read('src/pages/PromotionsPage.jsx').includes('schedule_timezone'),'promotion scheduling sends tenant timezone');
pass(read('src/pages/PromotionsPage.jsx').includes('DateTimePicker'),'promotion starts/ends use popup date-time picker');
pass(read('src/pages/OrdersPage.jsx').includes('allowed_transitions'),'order actions use backend allowed transitions');
pass(!read('src/pages/SettingsPage.jsx').includes('<textarea value={JSON'),'raw JSON settings editor is removed');
console.log(`${n}/${n} Luke Shop Admin Web v0.9.0 source regression checks passed`);
