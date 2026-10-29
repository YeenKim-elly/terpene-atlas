import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createStaticServer,repositoryRoot} from '../scripts/serve.mjs';
const server=createStaticServer();
function request(url,method='GET'){return new Promise(resolve=>{
 let status,headers;
 server.emit('request',{url,method},{writeHead(code,values){status=code;headers=values||{};},end(body){resolve({status,headers,body:body?.toString()||''});}});
});}
test('static serving resolves the app, data and illustrations',async()=>{
 for(const url of ['/','/src/app.js','/data/molecules.json','/assets/branding/atlas-mark.svg']){
  const r=await request(url);assert.equal(r.status,200,url);assert.ok(r.body.length);
 }
 assert.match((await request('/')).headers['Content-Type'],/text\/html/);
 assert.equal((await request('/src/app.js','HEAD')).body,'');
});
test('the server rejects traversal and non-runtime paths',async()=>{
 for(const url of ['/.git/config','/package.json','/scripts/serve.mjs','/assets/%2e%2e%5cpackage.json'])assert.equal((await request(url)).status,404);
 assert.equal((await request('/%E0%A4%A')).status,400);
 assert.equal((await request('/','POST')).status,405);
});
test('the entry-point resources and relative module imports resolve',async()=>{
 const html=await fs.readFile(path.join(repositoryRoot,'index.html'),'utf8');
 for(const [,ref]of html.matchAll(/(?:src|href)="([^"#]+)"/g))if(!/^[a-z]+:/.test(ref))assert.equal((await request('/'+ref)).status,200,ref);
 async function walk(dir){return(await Promise.all((await fs.readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]))).flat();}
 for(const file of(await walk(path.join(repositoryRoot,'src'))).filter(x=>x.endsWith('.js'))){
  const code=await fs.readFile(file,'utf8');
  for(const [,ref]of code.matchAll(/from\s+['"](\.[^'"]+)['"]/g))await fs.access(path.resolve(path.dirname(file),ref));
 }
});
