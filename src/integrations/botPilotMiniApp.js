const BOT_PILOT_AUTH_URL = (
  import.meta.env.VITE_BOT_PILOT_MINIAPP_AUTH_URL
  || 'https://contact2-lucas200.pythonanywhere.com/shop/miniapp/session'
).replace(/\/$/, '');

const SHOP_ID = /^bp_[A-Za-z0-9_-]{5,117}$/;

export function botPilotShopPublicId(pathname = window.location.pathname) {
  const parts = String(pathname || '/').split('/').filter(Boolean);
  if (parts.length !== 2 || parts[0] !== 's') return '';
  const value = decodeURIComponent(parts[1] || '');
  return SHOP_ID.test(value) ? value : '';
}

function telegramWebApp() {
  return window.Telegram?.WebApp || null;
}

async function exchangeSession(shopPublicId) {
  const tg = telegramWebApp();
  const initData = String(tg?.initData || '');
  if (!initData) {
    throw new Error('Open Manage Shop from your Telegram bot to sign in automatically.');
  }

  tg.ready?.();
  tg.expand?.();

  let response;
  try {
    response = await fetch(BOT_PILOT_AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        shop_public_id: shopPublicId,
        actor_type: 'MERCHANT',
        init_data: initData,
      }),
    });
  } catch {
    throw new Error('Unable to reach Bot Pilot Shop sign-in. Please try again.');
  }

  let payload = null;
  try { payload = await response.json(); } catch {}
  if (!response.ok || payload?.ok !== true) {
    throw new Error(payload?.error || 'Bot Pilot Shop sign-in failed.');
  }

  const session = payload?.data?.session;
  const tokens = session?.tokens;
  const user = session?.user;
  if (
    session?.actor_type !== 'MERCHANT'
    || !session?.tenant_slug
    || !session?.store_id
    || !tokens?.access_token
    || !tokens?.refresh_token
    || !user
  ) {
    throw new Error('Bot Pilot returned an invalid merchant session.');
  }
  return session;
}

export async function bootstrapBotPilotMerchantMiniApp({ writeSession }) {
  const shopPublicId = botPilotShopPublicId();
  if (!shopPublicId) return { handled: false };

  const session = await exchangeSession(shopPublicId);
  const next = {
    tenantSlug: session.tenant_slug,
    storeId: session.user?.store_scope?.default_store_id || session.store_id,
    accessToken: session.tokens.access_token,
    refreshToken: session.tokens.refresh_token,
    expiresIn: session.tokens.expires_in,
    user: session.user,
  };
  writeSession(next);

  window.history.replaceState({}, '', '/#/dashboard');
  return { handled: true, session: next };
}
