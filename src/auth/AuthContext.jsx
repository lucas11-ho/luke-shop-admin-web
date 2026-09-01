import React, { createContext, useContext, useMemo, useState } from 'react';
import { createApi, readStoredSession, writeStoredSession } from '../api/client.js';

const AuthContext=createContext(null);
const activeScopeStores=user=>(user?.store_scope?.stores||[]).filter(store=>store.status==='ACTIVE');
export function AuthProvider({children}){
  const [session,setSessionState]=useState(()=>readStoredSession());
  const setSession=(next)=>{ setSessionState(next); writeStoredSession(next); };
  const baseApi=useMemo(()=>createApi({getSession:()=>session,onSession:setSession}),[session]);
  const api=useMemo(()=>({
    ...baseApi,
    request:async(path,options={})=>{
      const result=await baseApi.request(path,options);
      if(path==='/v1/merchant/stores'&&(!options.method||options.method==='GET')&&session?.user?.store_scope?.mode==='ASSIGNED_STORES'&&result?.data?.stores){
        const allowed=new Set(activeScopeStores(session.user).map(store=>store.id));
        return {...result,data:{...result.data,stores:result.data.stores.filter(store=>allowed.has(store.id))}};
      }
      return result;
    },
  }),[baseApi,session]);
  const login=async({tenantSlug,email,password})=>{
    const loginApi=createApi({getSession:()=>({tenantSlug}),onSession:()=>{}});
    const data=await loginApi.request('/v1/merchant/auth/login',{method:'POST',auth:false,body:{email,password}});
    const u=data.data.user,t=data.data.tokens;
    const next={tenantSlug,storeId:u.store_scope?.default_store_id||'',accessToken:t.access_token,refreshToken:t.refresh_token,expiresIn:t.expires_in,user:u}; setSession(next); return next;
  };
  const logout=async(target=null)=>{const hash=location.hash;let fallback='/login';if(hash==='#/driver'||hash==='#/driver-login')fallback='/driver-login';else if(hash==='#/kitchen'||hash==='#/kitchen-login')fallback='/kitchen-login';else if(hash==='#/cashier'||hash==='#/cashier-login')fallback='/cashier-login';const route=typeof target==='string'?target:fallback;try { if(session?.accessToken) await api.request('/v1/merchant/auth/logout',{method:'POST',body:{}}); } catch {} finally { setSession(null); location.hash=`#${route}`; }};
  const updateStore=(storeId)=>{if(!session)return;const trimmed=storeId.trim();const scope=session.user?.store_scope;if(scope?.mode==='ASSIGNED_STORES'&&trimmed&&!activeScopeStores(session.user).some(store=>store.id===trimmed))return;setSession({...session,storeId:trimmed});};
  const refreshProfile=async()=>{ const data=await api.request('/v1/merchant/me'); const user=data.data.user,stores=activeScopeStores(user),allowed=stores.some(store=>store.id===session?.storeId),storeId=user.store_scope?.mode==='ASSIGNED_STORES'?(allowed?session.storeId:(user.store_scope?.default_store_id||'')):session?.storeId||'';const next={...session,storeId,user}; setSession(next); return next; };
  const has=(permission)=>Boolean(session?.user?.permissions?.includes(permission));
  return <AuthContext.Provider value={{session,setSession,api,login,logout,updateStore,refreshProfile,has}}>{children}</AuthContext.Provider>;
}
export function useAuth(){return useContext(AuthContext);}
