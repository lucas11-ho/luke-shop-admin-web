import React from 'react';
import{useAuth}from'../auth/AuthContext.jsx';
import{useHashRoute,navigate}from'./router.js';
import{AppShell}from'../components/AppShell.jsx';
import{LoginPage}from'../pages/LoginPage.jsx';
import{StaffLoginPage}from'../pages/StaffLoginPage.jsx';
import{StaffWorkspacePage}from'../pages/StaffWorkspacePage.jsx';
import{DriverLoginPage}from'../pages/DriverLoginPage.jsx';
import{OperationsLoginPage}from'../pages/OperationsLoginPage.jsx';
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
import{DriverPage}from'../pages/DriverPage.jsx';
import{DriverMessagesPage}from'../pages/DriverMessagesPage.jsx';
import{DriverAccessPage}from'../pages/DriverAccessPage.jsx';
import{DriverAppSettingsPage}from'../pages/DriverAppSettingsPage.jsx';
import{KitchenPage}from'../pages/KitchenPage.jsx';
import{CashierPage}from'../pages/CashierPage.jsx';
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
import{isStaffOnlyUser,resolveStaffWorkspaces}from'../staff/workspaces.js';

const pages={'/dashboard':DashboardPage,'/operations':OperationsDashboardPage,'/stores':StoresPage,'/my-profile':MyProfilePage,'/driver-messages':DriverMessagesPage,'/driver-access':DriverAccessPage,'/driver-settings':DriverAppSettingsPage,'/delivery-settings':DeliverySettingsPage,'/audit':AuditPage,'/products':ProductsPage,'/media-library':AssetsPage,'/inventory':InventoryPage,'/orders':OrdersPage,'/customers':CustomersPage,'/vip-loyalty':VipLoyaltyPage,'/payments':PaymentsPage,'/delivery':DeliveryPage,'/delivery-cod':DeliveryWorkspacePage,'/delivery-control':DeliveryControlPage,'/promotions':PromotionsPage,'/settings':SettingsPage,'/customer-experience':CustomerExperiencePage,'/languages':LanguagesPage,'/address-form':AddressFormPage,'/cs-ai':CustomerServicePage,'/access':AccessPage};
function exclusiveWorkspace(user){const roles=user?.roles||[];if(roles.includes('OWNER'))return null;if(roles.length===1){if(roles[0]==='DRIVER')return'/driver';if(roles[0]==='KITCHEN')return'/kitchen';if(roles[0]==='CASHIER')return'/cashier'}if(isStaffOnlyUser(user))return'/staff';return null}
function staffRouteAllowed(user,route){return route==='/staff'||resolveStaffWorkspaces(user).some(workspace=>workspace.route===route)}
function renderExclusive(route){if(route==='/driver')return <DriverPage/>;if(route==='/kitchen')return <KitchenPage/>;if(route==='/cashier')return <CashierPage/>;return <StaffWorkspacePage/>}

export function App(){
 const{session}=useAuth();const route=useHashRoute();const driverRoute=route==='/driver'||route==='/driver-login',kitchenRoute=route==='/kitchen'||route==='/kitchen-login',cashierRoute=route==='/cashier'||route==='/cashier-login',staffEntryRoute=route==='/staff'||route==='/staff-login';
 if(!session){if(driverRoute)return <DriverLoginPage/>;if(kitchenRoute)return <OperationsLoginPage mode="kitchen"/>;if(cashierRoute)return <OperationsLoginPage mode="cashier"/>;if(staffEntryRoute)return <StaffLoginPage/>;if(route!=='/login')queueMicrotask(()=>navigate('/login'));return <LoginPage/>}
 const exclusive=exclusiveWorkspace(session.user);
 if(exclusive==='/staff'){if(!staffRouteAllowed(session.user,route)){queueMicrotask(()=>navigate('/staff'));return <StaffWorkspacePage/>}}
 else if(exclusive&&route!==exclusive){queueMicrotask(()=>navigate(exclusive));return renderExclusive(exclusive)}
 if(route==='/staff-login'){queueMicrotask(()=>navigate(exclusive||'/dashboard'));return null}
 if(route==='/staff'){if(exclusive==='/staff')return <StaffWorkspacePage/>;queueMicrotask(()=>navigate(exclusive||'/dashboard'));return null}
 if(route==='/driver-login')queueMicrotask(()=>navigate('/driver'));if(route==='/kitchen-login')queueMicrotask(()=>navigate('/kitchen'));if(route==='/cashier-login')queueMicrotask(()=>navigate('/cashier'));
 if(route==='/driver')return <DriverPage/>;if(route==='/kitchen')return <KitchenPage/>;if(route==='/cashier')return <CashierPage/>;
 if(route==='/login')queueMicrotask(()=>navigate('/dashboard'));
 const Page=pages[route]||NotFoundPage;return <AppShell route={route}><Page/></AppShell>
}
