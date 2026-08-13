import React, { createContext, useContext, useMemo, useState } from 'react';
import { createApi, readStoredSession, writeStoredSession } from '../api/client.js';

const AuthContext=createContext(null);
export function AuthProvider({children}){
  const [session,setSessionState]=useState(()=>readStoredSession());
  const setSession=(next)=>{ setSessionState(next); writeStoredSession(next); };
  const api=useMemo(()=>createApi({getSession:()=>session,onSession:setSession}),[session]);
  const login=async({tenantSlug,email,password})=>{
    const loginApi=createApi({getSession:()=>({tenantSlug}),onSession:()=>{}});
    const data=await loginApi.request('/v1/merchant/auth/login',{method:'POST',auth:false,body:{email,password}});
    const u=data.data.user,t=data.data.tokens;
    const next={tenantSlug,storeId:'',accessToken:t.access_token,refreshToken:t.refresh_token,expiresIn:t.expires_in,user:u}; setSession(next); return next;
  };
  const logout=async()=>{ try { if(session?.accessToken) await api.request('/v1/merchant/auth/logout',{method:'POST',body:{}}); } catch {} finally { setSession(null); location.hash='#/login'; } };
  const updateStore=(storeId)=>setSession(session?{...session,storeId:storeId.trim()}:session);
  const refreshProfile=async()=>{ const data=await api.request('/v1/merchant/me'); const next={...session,user:data.data.user}; setSession(next); return next; };
  const has=(permission)=>Boolean(session?.user?.permissions?.includes(permission));
  return <AuthContext.Provider value={{session,setSession,api,login,logout,updateStore,refreshProfile,has}}>{children}</AuthContext.Provider>;
}
export function useAuth(){return useContext(AuthContext);}
