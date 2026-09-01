import React from 'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{useHashRoute,navigate}from'./router.js';
import{AppShell}from'../components/AppShell.jsx';
import{LoginPage}from'../pages/LoginPage.jsx';
import{DashboardPage}from'../pages/DashboardPage.jsx';
import{OperationsDashboardPage}from'../pages/OperationsDashboardPage.jsx';
import{ProductsPage}from'../pages/ProductsPage.jsx';
import{InventoryPage}from'../pages/InventoryPage.jsx';
import{OrdersPage}from'../pages/OrdersPage.jsx';
import{CustomersPage}from'../pages/CustomersPage.jsx';
import{VipLoyaltyPage}from'../pages/VipLoyaltyPage.jsx';
import{PaymentsPage}from'../pages/PaymentsPage.jsx';
import{DeliveryPage}from'../pages/DeliveryPage.jsx';
import{DeliveryWorkspacePage}from'../pages/DeliveryWorkspacePage.jsx';
import{DeliveryControlPage}from'../pages/DeliveryControlPage.jsx';
import{DeliverySettingsPage}from'../pages/DeliverySettingsPage.jsx';
import{DriverMessagesPage}from'../pages/DriverMessagesPage.jsx';
import{DriverAccessPage}from'../pages/DriverAccessPage.jsx';
import{DriverAppSettingsPage}from'../pages/DriverAppSettingsPage.jsx';
import{PromotionsPage}from'../pages/PromotionsPage.jsx';
import{SettingsPage}from'../pages/SettingsPage.jsx';
import{CustomerServicePage}from'../pages/CustomerServicePage.jsx';
import{AccessPage}from'../pages/AccessPage.jsx';
import{StaffStoreAccessPage}from'../pages/StaffStoreAccessPage.jsx';
import{StaffNotificationsPage}from'../pages/StaffNotificationsPage.jsx';
import{StaffWebHandoffPage}from'../pages/StaffWebHandoffPage.jsx';
import{NotFoundPage}from'../pages/NotFoundPage.jsx';
import{CustomerExperiencePage}from'../pages/CustomerExperiencePage.jsx';
import{AssetsPage}from'../pages/AssetsPage.jsx';
import{StoresPage}from'../pages/StoresPage.jsx';
import{MyProfilePage}from'../pages/MyProfilePage.jsx';
import{AuditPage}from'../pages/AuditPage.jsx';
import{LanguagesPage}from'../pages/LanguagesPage.jsx';
import{AddressFormPage}from'../pages/AddressFormPage.jsx';

const pages={'/dashboard':DashboardPage,'/operations':OperationsDashboardPage,'/stores':StoresPage,'/my-profile':MyProfilePage,'/driver-messages':DriverMessagesPage,'/driver-access':DriverAccessPage,'/driver-settings':DriverAppSettingsPage,'/delivery-settings':DeliverySettingsPage,'/audit':AuditPage,'/products':ProductsPage,'/media-library':AssetsPage,'/inventory':InventoryPage,'/orders':OrdersPage,'/customers':CustomersPage,'/vip-loyalty':VipLoyaltyPage,'/payments':PaymentsPage,'/delivery':DeliveryPage,'/delivery-cod':DeliveryWorkspacePage,'/delivery-control':DeliveryControlPage,'/promotions':PromotionsPage,'/settings':SettingsPage,'/customer-experience':CustomerExperiencePage,'/languages':LanguagesPage,'/address-form':AddressFormPage,'/cs-ai':CustomerServicePage,'/access':AccessPage,'/staff-store-access':StaffStoreAccessPage,'/staff-notifications':StaffNotificationsPage};
const legacyStaffRoutes={'/driver':'driver','/driver-login':'driver','/kitchen':'kitchen','/kitchen-login':'kitchen','/cashier':'cashier','/cashier-login':'cashier','/dispatcher':'dispatcher'};
const operationalPermissions=new Set(['orders.read','delivery.read','delivery.manage','kitchen.read','kitchen.manage','cashier.read','cashier.manage']);
const operationalSignals=new Set(['delivery.read','delivery.manage','kitchen.read','kitchen.manage','cashier.read','cashier.manage']);

function preferredStaffWorkspace(user){
 const roles=user?.roles||[];
 if(roles.includes('DRIVER'))return'driver';
 if(roles.includes('KITCHEN'))return'kitchen';
 if(roles.includes('CASHIER'))return'cashier';
 if(roles.includes('DISPATCHER'))return'dispatcher';
 return'home';
}

function isOperationalOnly(user){
 const roles=user?.roles||[];
 if(roles.includes('OWNER'))return false;
 if(roles.some(role=>['DRIVER','KITCHEN','CASHIER','DISPATCHER'].includes(role)))return true;
 const permissions=user?.permissions||[];
 return permissions.some(permission=>operationalSignals.has(permission))&&permissions.every(permission=>operationalPermissions.has(permission));
}

export function App(){
 const{session}=useAuth();const route=useHashRoute();const legacyWorkspace=legacyStaffRoutes[route];
 if(legacyWorkspace)return <StaffWebHandoffPage workspace={legacyWorkspace}/>;
 if(route==='/staff-web')return <StaffWebHandoffPage workspace="home"/>;
 if(!session){if(route!=='/login')queueMicrotask(()=>navigate('/login'));return <LoginPage/>}
 if(isOperationalOnly(session.user))return <StaffWebHandoffPage workspace={preferredStaffWorkspace(session.user)}/>;
 if(route==='/login')queueMicrotask(()=>navigate('/dashboard'));
 const Page=pages[route]||NotFoundPage;return <AppShell route={route}><Page/></AppShell>
}
