import React from 'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{useHashRoute,navigate}from'./router.js';
import{AppShell}from'../components/AppShell.jsx';
import{LoginPage}from'../pages/LoginPage.jsx';
import{DriverLoginPage}from'../pages/DriverLoginPage.jsx';
import{DashboardPage}from'../pages/DashboardPage.jsx';
import{ProductsPage}from'../pages/ProductsPage.jsx';
import{InventoryPage}from'../pages/InventoryPage.jsx';
import{OrdersPage}from'../pages/OrdersPage.jsx';
import{CustomersPage}from'../pages/CustomersPage.jsx';
import{VipLoyaltyPage}from'../pages/VipLoyaltyPage.jsx';
import{PaymentsPage}from'../pages/PaymentsPage.jsx';
import{DeliveryPage}from'../pages/DeliveryPage.jsx';
import{DeliveryWorkspacePage}from'../pages/DeliveryWorkspacePage.jsx';
import{DeliveryControlPage}from'../pages/DeliveryControlPage.jsx';
import{DriverPage}from'../pages/DriverPage.jsx';
import{DriverMessagesPage}from'../pages/DriverMessagesPage.jsx';
import{DriverAccessPage}from'../pages/DriverAccessPage.jsx';
import{DriverAppSettingsPage}from'../pages/DriverAppSettingsPage.jsx';
import{PromotionsPage}from'../pages/PromotionsPage.jsx';
import{SettingsPage}from'../pages/SettingsPage.jsx';
import{CustomerServicePage}from'../pages/CustomerServicePage.jsx';
import{AccessPage}from'../pages/AccessPage.jsx';
import{NotFoundPage}from'../pages/NotFoundPage.jsx';
import{CustomerExperiencePage}from'../pages/CustomerExperiencePage.jsx';
import{AssetsPage}from'../pages/AssetsPage.jsx';
import{StoresPage}from'../pages/StoresPage.jsx';
import{MyProfilePage}from'../pages/MyProfilePage.jsx';
import{AuditPage}from'../pages/AuditPage.jsx';
import{LanguagesPage}from'../pages/LanguagesPage.jsx';
import{AddressFormPage}from'../pages/AddressFormPage.jsx';
const pages={'/dashboard':DashboardPage,'/stores':StoresPage,'/my-profile':MyProfilePage,'/driver-messages':DriverMessagesPage,'/driver-access':DriverAccessPage,'/driver-settings':DriverAppSettingsPage,'/audit':AuditPage,'/products':ProductsPage,'/media-library':AssetsPage,'/inventory':InventoryPage,'/orders':OrdersPage,'/customers':CustomersPage,'/vip-loyalty':VipLoyaltyPage,'/payments':PaymentsPage,'/delivery':DeliveryPage,'/delivery-cod':DeliveryWorkspacePage,'/delivery-control':DeliveryControlPage,'/promotions':PromotionsPage,'/settings':SettingsPage,'/customer-experience':CustomerExperiencePage,'/languages':LanguagesPage,'/address-form':AddressFormPage,'/cs-ai':CustomerServicePage,'/access':AccessPage};
export function App(){
 const{session}=useAuth();const route=useHashRoute();const driverRoute=route==='/driver'||route==='/driver-login';
 if(!session){if(driverRoute)return <DriverLoginPage/>;if(route!=='/login')queueMicrotask(()=>navigate('/login'));return <LoginPage/>}
 if(route==='/driver-login')queueMicrotask(()=>navigate('/driver'));
 if(route==='/driver')return <DriverPage/>;
 if(route==='/login')queueMicrotask(()=>navigate('/dashboard'));
 const Page=pages[route]||NotFoundPage;return <AppShell route={route}><Page/></AppShell>
}
