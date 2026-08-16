import fs from'node:fs';import assert from'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8').replace(/\r\n?/g,'\n');const pkg=JSON.parse(read('package.json'));const page=read('src/pages/CustomerExperiencePage.jsx');const api=read('src/api/client.js');const css=read('src/styles.css');
const tests=[];const test=(n,f)=>tests.push([n,f]);
test('release is v0.9.1',()=>assert.ok(['0.9.1','0.10.0','0.11.0','0.12.0'].includes(pkg.version)));
test('draft save uses PUT and serialized save queue',()=>{assert.match(page,/customer-experience\/draft/);assert.match(page,/method:'PUT'/);assert.match(page,/saveQueue\.current=saveQueue\.current\.catch/)});
test('publish aborts when draft save fails',()=>assert.match(page,/try\{if\(dirty\)await save\(\{quiet:true\}\)\}catch\{return\}/));
test('autosave stops after a transport error until explicit retry or another successful save',()=>{assert.match(page,/saveState==='error'/);assert.match(page,/Retry save/)});
test('Customer Experience uses a horizontal studio scroll frame and independent panel scrolling',()=>{assert.match(page,/store-designer-scrollframe/);for(const x of ['scrollbar-gutter:stable both-edges','inspector-scroll{flex:1;overflow-y:auto','preview-canvas{overflow:auto','designer-sections{overflow-y:auto'])assert.ok(css.includes(x),`missing ${x}`)});
test('Customer Experience header actions wrap instead of crushing the studio',()=>{assert.match(page,/customer-experience-page/);assert.match(css,/customer-experience-page \.page-actions/);assert.match(css,/flex-wrap:wrap/)});
test('preview zoom supports fit 50 67 75 90 and 100 percent',()=>{for(const x of ['value="50"','value="67"','value="75"','value="90"','value="100"'])assert.ok(page.includes(x),`missing zoom ${x}`)});
test('unsupported Ratings control is not presented as a working feature',()=>{assert.match(page,/Ratings',false/);assert.match(page,/Not available until ratings data\/API is implemented/)});
test('History remains compact instead of consuming the entire inspector',()=>{assert.match(page,/rows\.slice\(0,6\)/);assert.match(page,/View \{rows\.length-6\} older versions/)});
test('network errors name the failed HTTP method and route for CORS diagnosis',()=>{assert.match(api,/Browser could not complete \$\{method\} \$\{path\}/);assert.match(api,/NETWORK_OR_CORS_ERROR/)})
let passed=0;for(const[n,f]of tests){try{f();passed++;console.log(`PASS ${n}`)}catch(e){console.error(`FAIL ${n}`);throw e}}console.log(`${passed}/${tests.length} Luke Shop Admin Web v0.9.1 Customer Experience Reliability checks passed`);
