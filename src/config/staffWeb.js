const rawBase=String(import.meta.env.VITE_LUKE_SHOP_STAFF_WEB_BASE_URL||'').trim();

export const staffWebBaseUrl=rawBase.replace(/\/+$/,'');
export const staffWebConfigured=Boolean(staffWebBaseUrl);

export function staffWebHref(workspace='home'){
 if(!staffWebConfigured)return'';
 const route=String(workspace||'home').trim().replace(/^#?\/?/,'')||'home';
 return `${staffWebBaseUrl}/#/${route}`;
}

export function openStaffWeb(workspace='home'){
 const href=staffWebHref(workspace);
 if(!href)return false;
 window.open(href,'_blank','noopener,noreferrer');
 return true;
}
