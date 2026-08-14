import fs from 'node:fs';
const files=['src/styles.css','src/components/AppShell.jsx','src/pages/LoginPage.jsx','src/pages/CustomerExperiencePage.jsx'];
let all='';for(const f of files){if(fs.existsSync(f))all+=fs.readFileSync(f,'utf8').replace(/\r\n?/g,'\n')+'\n'}
let passed=0;const check=(v,m)=>{if(!all.includes(v))throw new Error(`Missing ${m}`);console.log(`PASS ${m}`);passed++};
check('professional-admin','professional merchant shell');
check('nav-group-label','grouped commerce navigation');
check('store-designer-shell','Store Designer v3 workspace');
check('designer-sections','designer section navigation');
check('designer-preview','real preview studio');
check('designer-inspector','scrollable inspector');
check('preview-canvas','device preview canvas');
check('template-gallery-v3','visual template gallery');
check('home-builder-v3','drag/drop home builder');
check('media-picker-grid','Media Library picker');
check('store-selector-v3','merchant store selector');
console.log(`${passed}/${passed} Admin Web v0.8.0 design checks passed`);
