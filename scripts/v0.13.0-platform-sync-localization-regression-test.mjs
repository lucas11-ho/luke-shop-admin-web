import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const pkg=JSON.parse(read('package.json')),app=read('src/app/App.jsx'),shell=read('src/components/AppShell.jsx'),main=read('src/main.jsx'),langs=read('src/pages/LanguagesPage.jsx'),address=read('src/pages/AddressFormPage.jsx'),i18n=read('src/i18n/AdminI18nContext.jsx');
const checks=[
 ['admin release is 0.13.0',pkg.version==='0.13.0'],
 ['verify includes sync regression',pkg.scripts.verify.includes('test:platform-sync-v0130')],
 ['admin provider wraps application',main.includes('AdminI18nProvider')],
 ['admin UI includes English Burmese Indonesian',i18n.includes("code:'en'")&&i18n.includes("code:'my'")&&i18n.includes("code:'id'")],
 ['admin header exposes language selector',shell.includes('admin-language-selector')&&shell.includes('setLocale')],
 ['language manager route is installed',app.includes("'/languages':LanguagesPage" )],
 ['address manager route is installed',app.includes("'/address-form':AddressFormPage" )],
 ['language manager saves experience draft',langs.includes("/v1/merchant/customer-experience/draft" )],
 ['language manager caps tenant languages',langs.includes('languageLimit')&&langs.includes('slice(0,languageLimit)')],
 ['language manager edits categories',langs.includes("['categories'" )],
 ['language manager edits products',langs.includes("['products'" )],
 ['language manager edits modifiers',langs.includes("['modifier_groups'" )&&langs.includes("['modifier_options'" )],
 ['language manager edits menu titles and descriptions',langs.includes("['navigation'" )&&langs.includes('description')],
 ['address manager writes delivery address fields',address.includes('delivery')&&address.includes('address_fields')],
 ['address manager supports requested fields',address.includes('country_code')&&address.includes('address_line_2')&&address.includes('postal_code')],
];
let pass=0;for(const[name,ok]of checks){console.log(`${ok?'PASS':'FAIL'} ${name}`);if(ok)pass++;}console.log(`${pass}/${checks.length} Admin v0.13.0 platform sync regression checks passed`);if(pass!==checks.length)process.exit(1);
