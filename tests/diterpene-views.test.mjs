
import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTestCatalogue} from './support/catalogue.mjs';
import {familySubmaps,structureViewGroup,structureGraphId} from '../src/lib/structure-views.js';
const data=await loadTestCatalogue();
test('C20 mechanisms belong to the Diterpenoids navigation group',()=>{
 const views=familySubmaps.diterpenes;
 assert.deepEqual(views.map(v=>v.id),['diterpenes','diterpene-pathway','diterpene-rings']);
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

test('the expanded pathway view is distinct from the compact framework view',()=>{
 const compact=data.graphs.diterpenes,full=data.graphs['diterpene-pathway'];
 assert.ok(full.nodes.length>compact.nodes.length);
 assert.equal(structureViewGroup('diterpene-pathway'),'diterpenes');
 assert.equal(structureGraphId('diterpene-pathway'),'diterpene-pathway');
 for(const id of ['miltiradiene','ent-kaurene','steviol','stevioside','paclitaxel']){
  assert.ok(full.nodes.some(n=>n[0]===id),id);
  assert.ok(!compact.nodes.some(n=>n[0]===id),id+' belongs in the expanded view');
 }
 for(const [from,to]of [['cpp','miltiradiene'],['ent-cpp','ent-kaurene'],['syn-cpp','stemodene']])assert.ok(full.edges.some(e=>e.from===from&&e.to===to&&e.type==='step'));
 for(const [from,to]of [['ent-kaurene','steviol'],['steviol','stevioside'],['taxadiene','paclitaxel']]){
  const edge=full.edges.find(e=>e.from===from&&e.to===to);assert.ok(edge);assert.equal(edge.type,'summary');assert.match(edge.source,/^https:\/\//);
 }
 assert.match(full.edges.find(e=>e.from==='hpp'&&e.to==='isotuberculosinol').detail,/cross-species/);
 assert.match(full.edges.find(e=>e.to==='kolavenol').label,/phosphatase/i);
 assert.ok(!full.edges.some(e=>/borapetoside|tinosporol/.test(e.to)&&e.type==='step'));
 assert.equal(data.familyGuides['diterpene-pathway'].targetGraph,'diterpenes');
});

test('Full pathway connects the framework nodes with qualified TPS II mechanism arrows',async()=>{
 const full=data.graphs['diterpene-pathway'],compact=data.graphs.diterpenes;
 for(const [from,to]of [['labdane','halimane'],['halimane','clerodane']]){
  const edge=full.edges.find(e=>e.from===from&&e.to===to);
  assert.ok(edge,from+' → '+to);
  assert.equal(edge.type,'mechanism');
  assert.match(edge.label,/TPS II.*hydride.*methyl/);
  assert.match(edge.detail,/Proposed/);
  assert.match(edge.detail,/class II/);
  assert.match(edge.detail,/parent/);
  assert.match(edge.source,/^https:\/\//);
  assert.ok(!compact.edges.some(e=>e.from===from&&e.to===to));
 }
 assert.match(full.edges.find(e=>e.from==='labdane'&&e.to==='halimane').detail,/enzyme-bound/);
 assert.match(full.edges.find(e=>e.from==='halimane'&&e.to==='clerodane').detail,/not a free HPP-to-KPP conversion/);
 const {classIIEnzymeExamples}=await import('../src/components/rearrangements.js');
 assert.deepEqual(classIIEnzymeExamples.map(e=>e.id),['cps','mthps','sdkps','pvcps1']);
 for(const id of ['diterpenes','diterpene-pathway']){
  const graph=data.graphs[id];
  assert.match(graph.edges.find(e=>e.to==='hpp'&&e.from==='ggpp').label,/MtHPS/);
  assert.match(graph.edges.find(e=>e.to==='kpp'&&e.from==='ggpp').label,/SdKPS/);
  assert.match(graph.edges.find(e=>e.to==='clpp-variants'&&e.from==='ggpp').label,/PvCPS1/);
 }
});
