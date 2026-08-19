import React,{createContext,useContext,useEffect,useMemo,useState}from'react';

export const ADMIN_LOCALES=[
  {code:'en',label:'English',native:'English'},
  {code:'my',label:'Burmese',native:'မြန်မာ'},
  {code:'id',label:'Indonesian',native:'Bahasa Indonesia'},
];

const DICT={
 en:{
  'group.operate':'Operate','group.grow':'Grow','group.experience':'Experience','group.system':'System',
  'nav.dashboard':'Dashboard','nav.stores':'Stores','nav.orders':'Orders','nav.products':'Products','nav.media':'Media Library','nav.inventory':'Inventory','nav.customers':'Customers','nav.promotions':'Promotions','nav.payments':'Payments','nav.delivery':'Delivery','nav.experience':'Customer Experience','nav.languages':'Languages','nav.address':'Address Form','nav.cs':'Luke CS & AI','nav.profile':'My profile','nav.settings':'Store settings','nav.access':'Access & roles','nav.audit':'Audit log',
  'shell.tenant':'Tenant','shell.workspace':'Workspace','shell.store_context':'Store context','shell.primary_store':'Primary store','shell.live_api':'Live API','shell.sign_out':'Sign out','shell.language':'Admin language',
  'common.save':'Save draft','common.publish':'Publish','common.loading':'Loading…','common.retry':'Retry','common.enabled':'Enabled','common.disabled':'Disabled','common.remove':'Remove','common.add':'Add','common.default':'Default','common.language':'Language','common.optional':'Optional',
  'languages.title':'Storefront Languages','languages.desc':'Enable up to four customer languages and enter merchant-owned translations manually.','languages.settings':'Language settings','languages.translations':'Translations','languages.default':'Default storefront language','languages.add':'Add language','languages.code':'Language code','languages.label':'Display name','languages.native':'Native label','languages.brand':'Store & SEO','languages.navigation':'Menu labels','languages.categories':'Categories','languages.products':'Products & modifiers','languages.home':'Home sections','languages.select_product':'Choose product','languages.no_product':'Choose a product to translate its content and modifier labels.','languages.saved':'Language draft saved','languages.published':'Language settings published',
  'address.title':'Delivery Address Form','address.desc':'Choose which customer address fields are included in Profile and Checkout.','address.fields':'Address fields','address.label':'Label','address.country':'Country code','address.line2':'Address line 2','address.postal':'Postal code','address.default_country':'Default country code','address.default_country_hint':'Used when Country code is hidden. Enter a two-letter ISO code such as IN, SG, MM or ID.','address.saved':'Address form draft saved','address.published':'Address form published',
 },
 my:{
  'group.operate':'လုပ်ငန်း','group.grow':'တိုးတက်မှု','group.experience':'ဖောက်သည်အတွေ့အကြုံ','group.system':'စနစ်',
  'nav.dashboard':'ဒက်ရှ်ဘုတ်','nav.stores':'စတိုးများ','nav.orders':'အော်ဒါများ','nav.products':'ကုန်ပစ္စည်းများ','nav.media':'မီဒီယာ','nav.inventory':'စတော့','nav.customers':'ဖောက်သည်များ','nav.promotions':'ပရိုမိုးရှင်း','nav.payments':'ငွေပေးချေမှု','nav.delivery':'ပို့ဆောင်မှု','nav.experience':'ဖောက်သည်အတွေ့အကြုံ','nav.languages':'ဘာသာစကားများ','nav.address':'လိပ်စာဖောင်','nav.cs':'Luke CS & AI','nav.profile':'ကျွန်ုပ်၏ပရိုဖိုင်','nav.settings':'စတိုးဆက်တင်','nav.access':'အသုံးပြုခွင့်','nav.audit':'မှတ်တမ်း',
  'shell.tenant':'Tenant','shell.workspace':'Workspace','shell.store_context':'စတိုး','shell.primary_store':'မူလစတိုး','shell.live_api':'Live API','shell.sign_out':'ထွက်မည်','shell.language':'Admin ဘာသာစကား',
  'common.save':'Draft သိမ်းမည်','common.publish':'ထုတ်ပြန်မည်','common.loading':'လုပ်ဆောင်နေသည်…','common.retry':'ထပ်စမ်းမည်','common.enabled':'ဖွင့်','common.disabled':'ပိတ်','common.remove':'ဖယ်ရှား','common.add':'ထည့်မည်','common.default':'မူလ','common.language':'ဘာသာစကား','common.optional':'ရွေးချယ်နိုင်',
  'languages.title':'Storefront ဘာသာစကားများ','languages.desc':'ဖောက်သည်အတွက် ဘာသာစကား ၄ မျိုးအထိ ဖွင့်ပြီး ဘာသာပြန်စာကို Admin မှ ကိုယ်တိုင်ဖြည့်ပါ။','languages.settings':'ဘာသာစကားဆက်တင်','languages.translations':'ဘာသာပြန်များ','languages.default':'မူလ storefront ဘာသာစကား','languages.add':'ဘာသာစကားထည့်မည်','languages.code':'ဘာသာစကားကုဒ်','languages.label':'ပြသမည့်အမည်','languages.native':'မူရင်းအမည်','languages.brand':'စတိုးနှင့် SEO','languages.navigation':'Menu အမည်များ','languages.categories':'အမျိုးအစားများ','languages.products':'ကုန်ပစ္စည်းနှင့် Modifier','languages.home':'ပင်မစာမျက်နှာ','languages.select_product':'ကုန်ပစ္စည်းရွေးပါ','languages.no_product':'ကုန်ပစ္စည်းနှင့် modifier အမည်များ ဘာသာပြန်ရန် ကုန်ပစ္စည်းရွေးပါ။','languages.saved':'ဘာသာစကား Draft သိမ်းပြီး','languages.published':'ဘာသာစကားဆက်တင် ထုတ်ပြန်ပြီး',
  'address.title':'ပို့ဆောင်ရေးလိပ်စာဖောင်','address.desc':'Profile နှင့် Checkout တွင် ပြမည့် လိပ်စာအကွက်များကို ရွေးချယ်ပါ။','address.fields':'လိပ်စာအကွက်များ','address.label':'Label','address.country':'နိုင်ငံကုဒ်','address.line2':'လိပ်စာလိုင်း ၂','address.postal':'စာတိုက်ကုဒ်','address.default_country':'မူလနိုင်ငံကုဒ်','address.default_country_hint':'နိုင်ငံကုဒ်ကို ဖျောက်ထားသည့်အခါ အသုံးပြုမည်။ IN, SG, MM, ID ကဲ့သို့ ၂ လုံး ISO code ထည့်ပါ။','address.saved':'လိပ်စာ Draft သိမ်းပြီး','address.published':'လိပ်စာဖောင် ထုတ်ပြန်ပြီး',
 },
 id:{
  'group.operate':'Operasi','group.grow':'Pertumbuhan','group.experience':'Pengalaman','group.system':'Sistem',
  'nav.dashboard':'Dasbor','nav.stores':'Toko','nav.orders':'Pesanan','nav.products':'Produk','nav.media':'Pustaka Media','nav.inventory':'Inventaris','nav.customers':'Pelanggan','nav.promotions':'Promosi','nav.payments':'Pembayaran','nav.delivery':'Pengiriman','nav.experience':'Pengalaman Pelanggan','nav.languages':'Bahasa','nav.address':'Formulir Alamat','nav.cs':'Luke CS & AI','nav.profile':'Profil saya','nav.settings':'Pengaturan toko','nav.access':'Akses & peran','nav.audit':'Log audit',
  'shell.tenant':'Tenant','shell.workspace':'Workspace','shell.store_context':'Konteks toko','shell.primary_store':'Toko utama','shell.live_api':'Live API','shell.sign_out':'Keluar','shell.language':'Bahasa Admin',
  'common.save':'Simpan draf','common.publish':'Terbitkan','common.loading':'Memuat…','common.retry':'Coba lagi','common.enabled':'Aktif','common.disabled':'Nonaktif','common.remove':'Hapus','common.add':'Tambah','common.default':'Default','common.language':'Bahasa','common.optional':'Opsional',
  'languages.title':'Bahasa Storefront','languages.desc':'Aktifkan hingga empat bahasa pelanggan dan masukkan terjemahan milik merchant secara manual.','languages.settings':'Pengaturan bahasa','languages.translations':'Terjemahan','languages.default':'Bahasa storefront default','languages.add':'Tambah bahasa','languages.code':'Kode bahasa','languages.label':'Nama tampilan','languages.native':'Nama asli','languages.brand':'Toko & SEO','languages.navigation':'Label menu','languages.categories':'Kategori','languages.products':'Produk & modifier','languages.home':'Bagian beranda','languages.select_product':'Pilih produk','languages.no_product':'Pilih produk untuk menerjemahkan konten dan label modifier.','languages.saved':'Draf bahasa disimpan','languages.published':'Pengaturan bahasa diterbitkan',
  'address.title':'Formulir Alamat Pengiriman','address.desc':'Pilih kolom alamat pelanggan yang ditampilkan di Profil dan Checkout.','address.fields':'Kolom alamat','address.label':'Label','address.country':'Kode negara','address.line2':'Baris alamat 2','address.postal':'Kode pos','address.default_country':'Kode negara default','address.default_country_hint':'Dipakai saat Kode negara disembunyikan. Masukkan kode ISO dua huruf seperti IN, SG, MM atau ID.','address.saved':'Draf alamat disimpan','address.published':'Formulir alamat diterbitkan',
 },
};

const Ctx=createContext(null);
const KEY='luke-admin-ui-locale';
export function AdminI18nProvider({children}){
 const[locale,setLocale]=useState(()=>{try{return localStorage.getItem(KEY)||'en'}catch{return'en'}});
 useEffect(()=>{if(!ADMIN_LOCALES.some(x=>x.code===locale))setLocale('en');try{localStorage.setItem(KEY,locale)}catch{}document.documentElement.lang=locale;},[locale]);
 const value=useMemo(()=>({locale,setLocale,locales:ADMIN_LOCALES,t:(key)=>DICT[locale]?.[key]??DICT.en[key]??key}),[locale]);
 return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useAdminI18n(){const value=useContext(Ctx);if(!value)throw new Error('useAdminI18n must be used inside AdminI18nProvider');return value;}
