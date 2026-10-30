import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTestCatalogue} from './support/catalogue.mjs';
import {RenderBoundary,installRenderBoundary} from './support/render-boundary.mjs';
import {renderFamilyGuide,renderFamilyGuideFooter} from '../src/components/family-guide.js';
const data=await loadTestCatalogue();
const {molecules,precursors,scaffolds,reactions,graphs,comparisons,familyGuides:guides,comparisonQuestions:questions}=data;
test('C10/C15/C40 guides retain chemical and structural boundaries',()=>{

const records=new Map([...molecules,...precursors,...scaffolds].map(r=>[r.id,r]));
const frameworks=scaffolds.filter(r=>r.framework);
assert.equal(frameworks.length,14);
for(const frame of frameworks){const example=records.get(frame.exampleId);assert.ok(example,frame.id);assert.equal(frame.CID,null);assert.equal(frame.structureScope,'framework-example');assert.equal(frame.MolecularFormula,example.MolecularFormula);assert.equal(frame.exampleCID,example.CID);assert.ok(frame.note&&frame.noteKo&&frame.structureSource);}
for(const [id,guide]of Object.entries(guides)){
 const graph=graphs[guide.targetGraph||id],nodeIds=new Set(graph.nodes.map(n=>n[0]));
 for(const branch of guide.branches){assert.ok(nodeIds.has(branch.framework));assert.ok(scaffolds.some(r=>r.id===branch.framework));for(const example of branch.examples)assert.ok(nodeIds.has(example));}
 for(const pairId of guide.comparisons)assert.ok(comparisons.some(p=>p.id===pairId),pairId);
 for(const callout of guide.callouts)assert.match(callout.source,/^https:\/\//);
}
for(const graph of Object.values(graphs))for(const edge of graph.edges)if(records.get(edge.to)?.framework)assert.equal(edge.type,'structure','framework membership must not imply a reaction');
const mono=graphs.monoterpenes.edges,c15=graphs.sesquiterpenes.edges,c40=graphs['carotenoid-frameworks'].edges;
assert.ok(mono.some(e=>e.from==='gpp'&&e.to==='bornyl-dp'&&e.label.includes('TPS I')));
assert.ok(mono.some(e=>e.from==='npp'&&e.to==='beta-phellandrene'&&e.type==='step'));
assert.ok(!mono.some(e=>e.from==='minus-menthol'&&e.to==='plus-neomenthol'&&e.type!=='structure'));
assert.ok(c15.some(e=>e.from==='fpp'&&e.to==='farnesol'&&/hydrolysis/i.test(e.label)));
for(const [from,to]of [['valencene','beta-nootkatol'],['beta-nootkatol','nootkatone']])assert.ok(c15.some(e=>e.from===from&&e.to===to&&e.type==='step'));
assert.ok(c40.some(e=>e.from==='ggpp'&&e.to==='15-cis-phytoene'&&/2 GGPP/.test(e.label)));
assert.ok(!c40.some(e=>e.to==='phytoene'));
assert.ok(c40.some(e=>e.from==='lycopene'&&e.to==='gamma-carotene'));
assert.ok(c40.some(e=>e.from==='lycopene'&&e.to==='delta-carotene'));
assert.ok(!c40.some(e=>e.from==='zeaxanthin'&&e.to==='lutein'));
for(const source of ['ipp','dmapp'])assert.ok(graphs.precursors.edges.some(e=>e.from===source&&e.to==='npp'&&e.reactionGroup==='npp-condensation'));
for(const pair of comparisons){const questionsForPair=questions.filter(q=>q.figure?.comparePair===pair.id);assert.ok(questionsForPair.length,pair.id+' has targeted practice');for(const q of questionsForPair){assert.ok(q.promptKo&&q.noteKo&&q.aliases.length);assert.ok(q.options.some(o=>o.id===q.correctId));}}
const bps=reactions.find(r=>r.id==='tps-bornyl-dp');assert.equal(bps.enzyme,'tps1');assert.ok(!bps.right.includes('+ PPi'));
assert.ok(reactions.some(r=>r.id==='sdr-nootkatone'&&r.enzyme==='sdr'));

});

installRenderBoundary();
const {renderPractice,startComparisonPractice,resetPractice}=await import('../src/pages/practice.js');
const {renderStructureComparison,selectComparison}=await import('../src/pages/comparison.js');
test('each family guide locates frameworks and opens its own comparison pairs',()=>{
 const records=new Map([...molecules,...precursors,...scaffolds].map(r=>[r.id,r]));
 for(const guide of Object.values(guides)){
  const root=new RenderBoundary(),footer=new RenderBoundary();let located,compared;
  const ctx={lang:'en',records,comparisons,jump:id=>located=id,compare:id=>compared=id};
  renderFamilyGuide(root,guide,ctx);renderFamilyGuideFooter(footer,guide,ctx);
  const buttons=root.querySelectorAll('[data-framework-jump]');assert.equal(buttons.length,guide.branches.length);
  for(const button of buttons){button.click();assert.ok(guide.frameworkIds.includes(located));}
  for(const button of footer.querySelectorAll('[data-framework-compare]')){button.click();assert.ok(guide.comparisons.includes(compared));}
 }
});
test('selected-pair practice uses its uncoloured structures in both styles',()=>{
 for(const pair of comparisons){
  for(const style of ['choice','typing']){
   const root=new RenderBoundary();selectComparison(pair.id);let selected;
   renderStructureComparison(root,{molecules:[...molecules,...precursors],lang:'en',back(){},openRecord(){},startPractice:(value,id)=>selected={style:value,id}});
   root.querySelector('[data-difference-practice="'+style+'"]').click();assert.deepEqual(selected,{style,id:pair.id});
   startComparisonPractice(style,pair.id);renderPractice(root,{});
   assert.ok(['left','right'].every(side=>[pair[side].plain,pair[side].numbered].filter(Boolean).some(asset=>root.innerHTML.includes(asset))),pair.id);
   assert.ok(!root.innerHTML.includes(pair.left.highlighted));
   if(style==='typing')assert.ok(root.querySelector('#answer-input'));
   else assert.ok(root.querySelectorAll('[data-choice]').length>=2);
   resetPractice();
  }
 }
});
