import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import { AdminI18nProvider } from './i18n/AdminI18nContext.jsx';
import './styles.css';
import './localization-controls.css';
import './vben-shell.css';
import './vben-ui.css';
import './sidebar-navigation-v2.css';
import './vben-dashboard.css';
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
import './cx-v4-store-designer.css';
import './cx-v4-home-builder.css';
import './cx-v4-product-detail-builder.css';
import './cx-v4-store-designer-completion-a1.css';
import './cx-v4-footer-builder-a2.css';
import './cx-v4-explore-builder-a3.css';
import './cx-v4-cart-checkout-builder-a4.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminI18nProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AdminI18nProvider>
  </React.StrictMode>
);