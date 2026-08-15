const API_BASE = (import.meta.env.VITE_LUKE_SHOP_API_BASE_URL || 'http://localhost:4100').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', requestId = null, details = null } = {}) {
    super(message); this.name = 'ApiError'; this.status = status; this.code = code; this.requestId = requestId; this.details = details;
  }
}

const SESSION_KEY = 'luke-shop-admin.session.v1';
export function readStoredSession(){ try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } }
export function writeStoredSession(value){ if(value) sessionStorage.setItem(SESSION_KEY, JSON.stringify(value)); else sessionStorage.removeItem(SESSION_KEY); }

async function parseResponse(res){
  let payload=null; try { payload=await res.json(); } catch { payload=null; }
  if(!res.ok){ const e=payload?.error||{}; throw new ApiError(e.message || `Request failed (${res.status})`, { status:res.status, code:e.code||'HTTP_ERROR', requestId:e.request_id||null, details:e.details||null }); }
  return payload;
}

export function createApi({ getSession, onSession }){
  let refreshPromise=null;
  let liveSession=getSession();
  const currentSession=()=>liveSession || getSession();
  const request = async (path, { method='GET', body, rawBody, contentType, query, auth=true, retry=true }={}) => {
    const session=currentSession();
    const url=new URL(`${API_BASE}${path}`);
    if(query) Object.entries(query).forEach(([k,v])=>{ if(v!==undefined&&v!==null&&v!=='') url.searchParams.set(k,String(v)); });
    const headers={ Accept:'application/json' };
    if(session?.tenantSlug) headers['x-tenant-slug']=session.tenantSlug;
    if(session?.storeId) headers['x-store-id']=session.storeId;
    if(auth&&session?.accessToken) headers.Authorization=`Bearer ${session.accessToken}`;
    let payload; if(rawBody!==undefined){ headers['Content-Type']=contentType||'application/octet-stream'; payload=rawBody; } else if(body!==undefined){ headers['Content-Type']='application/json'; payload=JSON.stringify(body); }
    let res;
    try { res=await fetch(url,{method,headers,body:payload}); }
    catch { throw new ApiError(`Browser could not complete ${method} ${path}. Check Backend CORS methods, API URL, and network status.`,{code:'NETWORK_OR_CORS_ERROR',details:{method,path}}); }
    if(res.status===401 && auth && retry && session?.refreshToken && path!=='/v1/merchant/auth/refresh'){
      if(!refreshPromise){
        refreshPromise=(async()=>{
          const refreshHeaders={'Content-Type':'application/json','Accept':'application/json','x-tenant-slug':session.tenantSlug};
          const rr=await fetch(`${API_BASE}/v1/merchant/auth/refresh`,{method:'POST',headers:refreshHeaders,body:JSON.stringify({refresh_token:session.refreshToken})});
          const data=await parseResponse(rr); const t=data.data.tokens;
          const next={...session,accessToken:t.access_token,refreshToken:t.refresh_token,expiresIn:t.expires_in}; liveSession=next; onSession(next); return next;
        })().finally(()=>{refreshPromise=null;});
      }
      try { await refreshPromise; return request(path,{method,body,rawBody,contentType,query,auth,retry:false}); }
      catch(err){ liveSession=null; onSession(null); throw err; }
    }
    return parseResponse(res);
  };
  return { request, baseUrl:API_BASE };
}
