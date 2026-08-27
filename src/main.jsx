import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import { AdminI18nProvider } from './i18n/AdminI18nContext.jsx';
import './styles.css';
import './localization-controls.css';
import './vben-shell.css';
createRoot(document.getElementById('root')).render(<React.StrictMode><AdminI18nProvider><AuthProvider><App /></AuthProvider></AdminI18nProvider></React.StrictMode>);
