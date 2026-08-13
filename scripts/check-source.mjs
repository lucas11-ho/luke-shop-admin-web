import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd();const files=[];function walk(d){for(const x of fs.readdirSync(d,{withFileTypes:true})){if(['node_modules','dist','.git'].includes(x.name))continue;const p=path.join(d,x.name);if(x.isDirectory())walk(p);else if(/\.(js|jsx)$/.test(x.name))files.push(p)}}walk(path.join(root,'src'));walk(path.join(root,'scripts'));
for(const f of files){const text=fs.readFileSync(f,'utf8');if(text.includes('http://localhost:4100')&& !f.endsWith('client.js'))throw new Error(`Hard-coded API URL outside client: ${f}`);if(/BEGIN (RSA|PRIVATE) KEY/.test(text))throw new Error(`Private key detected: ${f}`)}
console.log(`PASS source safety scan (${files.length} JavaScript/JSX files)`);
