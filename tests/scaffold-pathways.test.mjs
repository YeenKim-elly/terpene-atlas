import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTestCatalogue} from './support/catalogue.mjs';
import {RenderBoundary} from './support/render-boundary.mjs';
import {renderScaffoldAtlas,scaffoldFamily,scaffoldScope} from '../src/components/scaffold-atlas.js';
const data=await loadTestCatalogue();
const added=['iridoid-core','iridoid-lactone','artemisinin-ring-system','kaurane','gibberellin-framework','taxane','carotenoid-poly-cis','carotenoid-epoxy-ring','apo-aba-ring'];
test('pathway scaffold examples retain their exact molecule records and distinct catalogue identity',()=>{
 for(const id of added){
  const r=data.scaffolds.find(r=>r.id===id),example=data.molecules.find(m=>m.id===r.exampleId);
  assert.ok(example,id);assert.equal(r.CID,null);assert.equal(r.exampleCID,example.CID);
  for(const key of ['SMILES','MolecularFormula','image','skeleton'])assert.equal(r[key],example[key],id+': '+key);
  assert.equal(r.structureScope,'framework-example');assert.ok(r.noteKo);
  assert.match(r.source,/^https:\/\//);assert.equal(r.structureSource,example.source);
  assert.ok(data.graphs[r.pathwayLink.graph].nodes.some(([n])=>n===example.id),id);
 }
});
test('geometry, ring function and C40 cleavage remain distinct from new carbon skeletal families',()=>{
 const find=id=>data.scaffolds.find(r=>r.id===id);
 assert.equal(scaffoldScope(find('carotenoid-poly-cis')),'Geometry variant · same framework');
 assert.equal(find('carotenoid-poly-cis').parentFrameworkId,'carotenoid-psi-psi');
 assert.equal(scaffoldScope(find('iridoid-lactone')),'Ring / oxidation variant');
 assert.equal(find('iridoid-lactone').parentFrameworkId,'iridoid-core');
 assert.equal(find('carotenoid-epoxy-ring').parentFrameworkId,'carotenoid-beta-beta');
 const apo=find('apo-aba-ring');assert.equal(scaffoldFamily(apo),'apo');assert.equal(apo.skeleton,15);assert.equal(apo.originSkeleton,40);
 assert.match(find('carotenoid-beta-beta').note,/esterification retains the C40 core/);
 assert.ok(!data.scaffolds.some(r=>/palmitate/.test(r.id)));
});
test('all added examples open details and their individual pathway links',()=>{
 const root=new RenderBoundary();let opened,map;
 renderScaffoldAtlas(root,{records:data.scaffolds,lang:'en',open:r=>opened=r,goMap:id=>map=id});
 for(const id of added){
  root.querySelector('[data-detail="'+id+'"]').click();assert.equal(opened.id,id);
 }
 for(const button of root.querySelectorAll('[data-scaffold-pathway]')){
  button.click();assert.equal(map,button.dataset.scaffoldPathway);assert.ok(data.graphs[map]);
 }
 root.querySelector('[data-scaffold-family="apo"]').click();
 assert.equal(root.querySelectorAll('[data-detail]').length,1);assert.ok(root.innerHTML.includes('C40-derived'));
 root.querySelector('[data-scaffold-map="aba-cleavage"]').click();assert.equal(map,'aba-cleavage');
});
