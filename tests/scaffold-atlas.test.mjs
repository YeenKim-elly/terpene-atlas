
import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTestCatalogue} from './support/catalogue.mjs';
import {RenderBoundary} from './support/render-boundary.mjs';
import {renderScaffoldAtlas,scaffoldFamily} from '../src/components/scaffold-atlas.js';
const data=await loadTestCatalogue();
test('the scaffold overview shows C10 and C40 directly with every reference',()=>{
 const root=new RenderBoundary();let opened,map;
 renderScaffoldAtlas(root,{records:data.scaffolds,lang:'en',open:r=>opened=r,goMap:id=>map=id});
 assert.equal(root.querySelectorAll('[data-detail]').length,33);
 assert.deepEqual(root.querySelectorAll('[data-scaffold-group]').map(n=>n.dataset.scaffoldGroup),['mono','sesqui','di','tetra','rings']);
 for(const id of ['mono-acyclic','p-menthane','pinane','bornane','carotenoid-psi-psi','carotenoid-beta-beta','carotenoid-beta-epsilon']){
  const card=root.querySelector('[data-detail="'+id+'"]');assert.ok(card,id);card.click();assert.equal(opened.id,id);
 }
 for(const [family,expected]of [['mono',4],['tetra',7],['sesqui',5],['di',9],['rings',8],['all',33]]){
  root.querySelector('[data-scaffold-family="'+family+'"]').click();
  const cards=root.querySelectorAll('[data-detail]');assert.equal(cards.length,expected,family);
  if(family!=='all')for(const card of cards)assert.equal(scaffoldFamily(data.scaffolds.find(r=>r.id===card.dataset.detail)),family);
 }
 root.querySelector('[data-scaffold-map="carotenoid-frameworks"]').click();assert.equal(map,'carotenoid-frameworks');
 root.querySelector('[data-scaffold-family="tetra"]').click();
 assert.equal(root.querySelector('[data-detail]').dataset.detail,'carotenoid-psi-psi');
 assert.match(root.innerHTML,/End-ring fragment · part of C40/);
 assert.match(root.innerHTML,/Framework example/);
});
test('scaffold filtering keeps search results, Korean labels and empty state usable',()=>{
 const root=new RenderBoundary();let count;
 const selected=data.scaffolds.filter(r=>r.id==='pinane');
 renderScaffoldAtlas(root,{records:selected,allRecords:data.scaffolds,lang:'ko',open(){},onCount:n=>count=n});
 assert.equal(count,1);assert.match(root.innerHTML,/모든 계열/);
 root.querySelector('[data-scaffold-family="tetra"]').click();
 assert.equal(count,0);assert.match(root.innerHTML,/일치하는 골격이 없습니다/);
 root.querySelector('[data-scaffold-family="all"]').click();assert.equal(count,1);
});
