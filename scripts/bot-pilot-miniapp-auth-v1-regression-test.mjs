import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const index = read('index.html');
const main = read('src/main.jsx');
const bridge = read('src/integrations/botPilotMiniApp.js');

const checks = [
  ['Telegram Mini App runtime is loaded before the Vite entrypoint',
    index.indexOf('telegram-web-app.js?63') >= 0
      && index.indexOf('telegram-web-app.js?63') < index.indexOf('/src/main.jsx')],
  ['Bot Pilot merchant entry uses an opaque public Shop ID',
    bridge.includes("parts[0] !== 's'") && bridge.includes('SHOP_ID')],
  ['raw Telegram initData is exchanged only with Bot Pilot',
    bridge.includes('tg?.initData') && bridge.includes("actor_type: 'MERCHANT'")],
  ['merchant bootstrap does not trust initDataUnsafe',
    !bridge.includes('initDataUnsafe')],
  ['canonical merchant session is written before the app renders',
    main.includes('bootstrapBotPilotMerchantMiniApp({ writeSession: writeStoredSession })')
      && main.indexOf('bootstrapBotPilotMerchantMiniApp') < main.lastIndexOf('.then(renderApp)')],
  ['merchant routing uses verified tenant/store context',
    bridge.includes('tenantSlug: session.tenant_slug')
      && bridge.includes('session.store_id')
      && bridge.includes('session.user?.store_scope?.default_store_id')],
  ['normal non-Bot-Pilot routes remain supported',
    bridge.includes('if (!shopPublicId) return { handled: false }')],
];

let passed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (ok) passed++;
}
console.log(`${passed}/${checks.length} Bot Pilot merchant Mini App checks passed`);
if (passed !== checks.length) process.exit(1);
