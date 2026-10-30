
import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTestCatalogue,rootURL} from './support/catalogue.mjs';
import {familySubmaps,structureViewGroup} from '../src/lib/structure-views.js';
import {nodeLabelLines} from '../src/pages/structure-web.js';
import {createQuestion,choiceOptions,answerMatches,questionPool} from '../src/lib/quiz.js';
import fs from 'node:fs/promises';
const data=await loadTestCatalogue(),m=id=>data.molecules.find(r=>r.id===id),edge=(g,f,t)=>data.graphs[g].edges.find(e=>e.from===f&&e.to===t);
const routes={iridoids:'monoterpenes',artemisinin:'sesquiterpenes',gibberellins:'diterpenes','plant-carotenoids':'carotenoids','astaxanthin-esters':'carotenoids','aba-cleavage':'apocarotenoids',apocarotenoids:'apocarotenoids'};
test('all seven focused pathways have family navigation, bilingual notes and resolved enzyme references',()=>{
 for(const [id,family]of Object.entries(routes)){
  assert.equal(structureViewGroup(id),family);
  assert.ok(familySubmaps[family].some(v=>v.id===id));
  const note=data.pathwayNotes[id];assert.ok(note.viewerNote[1]&&note.callouts.length>=2&&note.enzymes.length);
  for(const enzyme of note.enzymes)assert.match(enzyme.source,/^https:\/\//,enzyme.name);
  for(const e of data.graphs[id].edges.filter(e=>e.labelKo))assert.ok(e.detailKo&&e.source);
 }
});
test('iridoid cascades and artemisinin branch points retain their mechanistic limits',()=>{
 for(const [id,neps]of [['cis-trans-nepetalactol','NEPS2'],['cis-cis-nepetalactol','NEPS3']]){
  const e=edge('iridoids','8-oxogeranial',id);assert.equal(e.type,'summary');assert.match(e.label,new RegExp(neps));assert.match(m(id).note,/unassigned/i);
 }
 assert.ok(edge('artemisinin','artemisinic-aldehyde','dihydroartemisinic-aldehyde').label.includes('DBR2'));
 assert.ok(!edge('artemisinin','artemisinic-acid','dihydroartemisinic-acid'));
 const late=edge('artemisinin','dihydroartemisinic-acid','artemisinin');assert.equal(late.type,'summary');assert.match(late.detail,/nonenzymatic/);
});
test('gibberellin contraction and ABA cleavage preserve product identity and carbon origin',()=>{
 assert.match(edge('gibberellins','ent-7alpha-hydroxykaurenoic-acid','ga12-aldehyde').label,/ring-B contraction/);
 assert.equal(m('ga12').MolecularFormula,'C20H28O4');
 assert.equal(m('ent-7alpha-hydroxykaurenoic-acid').CID,null);
 const cut=edge('aba-cleavage','9-cis-violaxanthin','xanthoxin');
 assert.equal(cut.coproduct.carbons,25);assert.equal(m('xanthoxin').carbons+cut.coproduct.carbons,40);
 assert.equal(edge('aba-cleavage','violaxanthin','9-cis-violaxanthin').type,'structure');
 for(const id of ['xanthoxin','aba-aldehyde','abscisic-acid']){assert.equal(m(id).family,'apo');assert.equal(m(id).skeleton,15);assert.equal(m(id).originSkeleton,40);}
 assert.equal(m('abscisic-acid').CID,5280896);assert.equal(data.families.apo.units,null);
 assert.ok(questionPool({kind:'family',families:['apo'],challenge:false}).some(r=>r.id==='abscisic-acid'));
});
test('plant poly-cis records do not replace CrtI or all-trans references',()=>{
 assert.equal(m('zeta-carotene').CID,5280788);assert.equal(m('di-cis-zeta-carotene').CID,6440490);
 assert.equal(m('tri-cis-zeta-carotene').CID,24755586);
 assert.match(edge('plant-carotenoids','prolycopene','lycopene').label,/CRTISO/);
 assert.ok(!data.graphs['plant-carotenoids'].edges.some(e=>/CrtI\b/.test(e.label)));
 assert.ok(data.graphs.carotenoids.edges.some(e=>/CrtI\b/.test(e.label)));
});
test('ester overview abbreviations retain full drawings, C40 core and separate hydrolysis',async()=>{
 for(const [id,total]of [['astaxanthin-monopalmitate-model',56],['astaxanthin-dipalmitate',72]]){
  const r=m(id);assert.equal(r.skeleton,40);assert.equal(r.carbons,total);assert.equal(r.level,'challenge');
  assert.match(r.note,/C15H31/);await fs.access(new URL(r.fullStructureImage,rootURL));
 }
 assert.equal(m('astaxanthin-monopalmitate-model').CID,null);
 for(const e of data.graphs['astaxanthin-esters'].edges){assert.equal(e.type,'summary');assert.ok(!e.reversible);}
 assert.ok(edge('astaxanthin-esters','astaxanthin-monopalmitate-model','astaxanthin'));
 const dgat=data.reactions.find(r=>r.enzyme==='xanthophyllAct');assert.match(dgat.note,/DHA/);assert.ok(!dgat.right.includes('palmitate'));
});
test('all new records and reactions support answer choices and typed recall without overflowing node labels',()=>{
 const records=data.molecules.filter(r=>Object.keys(routes).some(id=>data.graphs[id].nodes.some(([n])=>n===r.id)));
 const reactions=data.reactions.filter(r=>r.pathway);assert.equal(reactions.length,27);
 for(const [kind,items]of [['name',records],['family',records],['enzyme',reactions]])for(const item of items){
  const q=createQuestion(kind,item);assert.ok(choiceOptions(q).some(o=>o.id===q.correctId));assert.ok(answerMatches(q,q.answer));assert.ok(answerMatches(q,q.answerKo));
 }
 for(const item of records)for(const name of [item.name,item.ko||item.name]){
  const lines=nodeLabelLines(name,s=>s.length*7,170);assert.ok(lines.length>=1&&lines.length<=2);for(const line of lines)assert.ok(line.length*7<=170);
 }
});
