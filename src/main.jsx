import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import { AdminI18nProvider } from './i18n/AdminI18nContext.jsx';
import './styles.css';
import './localization-controls.css';
import './vben-shell.css';
import './vben-ui.css';
import './vben-dashboard.css';
import './vben-orders.css';
import './vben-products.css';
import './vben-inventory-media.css';
import './vben-customers.css';
import './vben-payments-delivery.css';
import './vben-promotions.css';
import './vben-settings-access.css';
import './cx-v4-store-designer.css';
import './cx-v4-home-builder.css';
import './cx-v4-product-detail-builder.css';
import './cx-v4-store-designer-completion-a1.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminI18nProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AdminI18nProvider>
  </React.StrictMode>
);