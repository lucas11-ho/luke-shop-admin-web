import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import { AdminI18nProvider } from './i18n/AdminI18nContext.jsx';
import { AppErrorBoundary } from './components/AppErrorBoundary.jsx';
import { writeStoredSession } from './api/client.js';
import { bootstrapBotPilotMerchantMiniApp } from './integrations/botPilotMiniApp.js';
import './components/PlatformIconPicker.jsx';
import './styles.css';
import './localization-controls.css';
import './vben-shell.css';
import './vben-ui.css';
import './sidebar-navigation-v2.css';
import './vben-dashboard.css';
import './business-command-center-a10-1.css';
import './finance-reconciliation-center-a10-2.css';
import './vben-orders.css';
import './vben-products.css';
import './product-policy-digital.css';
import './vben-inventory-media.css';
import './vben-customers.css';
import './vben-vip-loyalty.css';
import './vben-payments-delivery.css';
import './driver-mobile-cod.css';
import './delivery-experience-admin-v1.css';
import './driver-mobile-pro-v1.css';
import './kitchen-cashier-operations-v1.css';
import './tokenpay-gateway-v1.css';
import './vben-promotions.css';
import './vben-settings-access.css';
import './staff-access-management-center-a10-3.css';
import './cx-v4-store-designer.css';
import './cx-v4-home-builder.css';
import './cx-v4-product-detail-builder.css';
import './cx-v4-store-designer-completion-a1.css';
import './cx-v4-footer-builder-a2.css';
import './cx-v4-explore-builder-a3.css';
import './cx-v4-cart-checkout-builder-a4.css';
import './admin-operations-typography-v1.css';
import './staff-notifications-admin-v1.css';
import './theme-system-admin-v1.css';
import './theme-system-icons-a3.css';
import './theme-navigation-composer-a4.css';
import './theme-controls-composer-a5.css';
import './theme-product-typography-composer-a6.css';
import './theme-commerce-surfaces-composer-a7.css';
import './platform-icon-picker.css';
import './category-icons-a9-1.css';
import './menu-shortcuts-a9-2.css';
import './app-error-boundary.css';

function renderApp() {
  createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <AppErrorBoundary>
        <AdminI18nProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AdminI18nProvider>
      </AppErrorBoundary>
    </React.StrictMode>
  );
}

function renderMiniAppError(error) {
  const root = document.getElementById('root');
  root.innerHTML = '';
  const card = document.createElement('main');
  card.style.cssText = 'max-width:520px;margin:64px auto;padding:24px;font:16px/1.5 system-ui,sans-serif;text-align:center';
  const title = document.createElement('h1');
  title.textContent = 'Manage Shop';
  const message = document.createElement('p');
  message.textContent = error?.message || 'Unable to sign in to this Shop.';
  card.append(title, message);
  root.append(card);
}

bootstrapBotPilotMerchantMiniApp({ writeSession: writeStoredSession })
  .then(renderApp)
  .catch(renderMiniAppError);
