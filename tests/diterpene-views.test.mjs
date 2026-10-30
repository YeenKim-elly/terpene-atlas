
import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTestCatalogue} from './support/catalogue.mjs';
import {familySubmaps,structureViewGroup,structureGraphId} from '../src/lib/structure-views.js';
const data=await loadTestCatalogue();
test('C20 mechanisms belong to the Diterpenoids navigation group',()=>{
 const views=familySubmaps.diterpenes;
 assert.deepEqual(views.map(v=>v.id),['diterpenes','diterpene-rings']);
 for(const view of views){assert.equal(structureViewGroup(view.id),'diterpenes');assert.ok(data.graphs[structureGraphId(view.id)]);}
 assert.equal(structureViewGroup('scaffolds'),'scaffolds');
 assert.equal(familySubmaps.scaffolds,undefined);
 assert.equal(structureGraphId('diterpene-rings'),'scaffolds');
 assert.deepEqual(familySubmaps.carotenoids.map(v=>v.id),['carotenoid-frameworks','carotenoids']);
});
test('C20 uses the common family guide and classifies its own precursors',()=>{
 const guide=data.familyGuides.diterpenes,graph=data.graphs.diterpenes;
 assert.equal(guide.family,'di');
 assert.deepEqual(guide.frameworkIds,['labdane','halimane','clerodane']);
 const expected={cpp:'labdane','ent-cpp':'labdane','syn-cpp':'labdane',hpp:'halimane',kpp:'clerodane','clpp-cis-trans':'clerodane','clpp-cis-cis':'clerodane'};
 for(const [id,framework]of Object.entries(expected)){
  assert.equal(data.precursors.find(r=>r.id===id).frameworkId,framework);
  assert.ok(graph.edges.some(e=>e.from===id&&e.to===framework&&e.type==='structure'));
  assert.ok(!graph.edges.some(e=>e.from===id&&e.to===framework&&e.type==='step'));
 }
 for(const id of guide.frameworkIds)assert.ok(graph.nodes.some(n=>n[0]===id));
 assert.deepEqual(guide.comparisons,['cpp-ent','cpp-syn','ent-syn']);
 assert.ok(guide.modelNote[0].includes('parent-model'));
 assert.ok(graph.edges.some(e=>e.from==='ggpp'&&e.to==='taxadiene'&&e.type==='step'));
});
