import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {loadTestCatalogue, rootURL} from './support/catalogue.mjs';
import {createQuestion, answerMatches} from '../src/lib/quiz.js';
import {filterLibrary} from '../src/pages/library.js';
import {familySubmaps, structureViewGroup} from '../src/lib/structure-views.js';
import {scaffoldFamily, scaffoldScope} from '../src/components/scaffold-atlas.js';

const data=await loadTestCatalogue();
const byId=new Map(data.molecules.map(record=>[record.id,record]));
const expected={
  retinal:[20,20,'C20H28O'],retinol:[20,20,'C20H30O'],'retinoic-acid':[20,20,'C20H28O2'],
  'beta-ionone':[13,13,'C13H20O'],'beta-cyclocitral':[10,10,'C10H16O'],
  'crocetin-dialdehyde':[20,20,'C20H24O2'],crocetin:[20,20,'C20H24O4'],
  'crocin-i':[20,44,'C44H64O24'],htcc:[10,10,'C10H16O2'],
  picrocrocin:[10,16,'C16H26O7'],safranal:[10,10,'C10H14O']
};

test('apocarotenoid records distinguish cleavage cores from attached sugars',async()=>{
  for(const [id,[core,total,formula]] of Object.entries(expected)){
    const record=byId.get(id);
    assert.ok(record,id);
    assert.equal(record.family,'apo');
    assert.equal(record.originSkeleton,40);
    assert.equal(record.skeleton,core,id+' core');
    assert.equal(record.carbons,total,id+' total');
    assert.equal(record.MolecularFormula,formula,id+' formula');
    assert.ok(record.SMILES&&record.InChIKey&&record.note&&record.noteKo);
    assert.match(record.source,/^https:\/\/pubchem\.ncbi\.nlm\.nih\.gov\/compound\/\d+$/);
    const svg=await fs.readFile(new URL(record.image,rootURL),'utf8');
    assert.match(svg,/<svg\b/);
    assert.ok(!Object.hasOwn(record,'projects'));
  }
  assert.equal(byId.get('htcc').CID,25201359,'HTCC retains the defined aglycone stereorecord');
  assert.equal(byId.get('htcc').InChIKey,'SWPMTVXRLXPNDP-MRVPVSSYSA-N');
  assert.equal(byId.get('crocin-i').carbons-byId.get('crocin-i').skeleton,4*6);
  assert.equal(byId.get('picrocrocin').carbons-byId.get('picrocrocin').skeleton,6);
});

test('all apocarotenoid branches connect to C40 sources without fixed-carbon family labels',()=>{
  const graph=data.graphs.apocarotenoids;
  assert.ok(graph,'The new graph is registered for production loading');
  const nodes=new Set(graph.nodes.map(([id])=>id));
  const reached=new Set(['beta-carotene','zeaxanthin','9-cis-violaxanthin']);
  for(let changed=true;changed;){
    changed=false;
    for(const edge of graph.edges)if(reached.has(edge.from)&&!reached.has(edge.to)){reached.add(edge.to);changed=true;}
  }
  for(const id of [...Object.keys(expected),'xanthoxin','aba-aldehyde','abscisic-acid']){
    assert.ok(nodes.has(id),id+' visible');
    assert.ok(reached.has(id),id+' connected');
  }
  for(const edge of graph.edges){
    assert.ok(nodes.has(edge.from)&&nodes.has(edge.to));
    assert.ok(edge.label&&edge.labelKo&&edge.detail&&edge.detailKo);
    assert.match(edge.source,/^https:\/\//);
  }
  assert.equal(data.families.apo.carbon,null);
  assert.ok(data.families.apo.carbonLabel&&data.families.apo.carbonLabelKo);
  assert.ok(!/C15/.test(data.families.apo.name));
  assert.ok(!data.families.apo.aliases.some(alias=>String(alias).toLowerCase()==='aba'));
  assert.equal(structureViewGroup('apocarotenoids'),'apocarotenoids');
  assert.equal(structureViewGroup('aba-cleavage'),'apocarotenoids');
  assert.ok(familySubmaps.apocarotenoids.some(view=>view.id==='aba-cleavage'));
});

test('cleavage and multistep summaries retain their scientific qualifications',()=>{
  const graph=data.graphs.apocarotenoids;
  const edge=(from,to)=>graph.edges.find(item=>item.from===from&&item.to===to);
  const bco=data.reactions.find(item=>item.id==='apo-bco1-retinal');
  assert.equal(bco.enzyme,'bco1');
  assert.match(bco.right,/2.*Retinal/i,'C40 produces two C20 retinal molecules');
  assert.match(edge('beta-carotene','retinal').detail,/dioxygenase/i);
  const ccd=data.reactions.find(item=>item.id==='apo-ccd2-crocetin-htcc');
  assert.match(ccd.right,/2 HTCC/,'CsCCD2 includes both C10 coproducts');
  const colour=edge('zeaxanthin','crocetin-dialdehyde'),aroma=edge('zeaxanthin','htcc');
  assert.equal(colour.type,'summary');
  assert.equal(colour.reactionGroup,aroma.reactionGroup);
  assert.ok(colour.reactionGroup);
  assert.equal(edge('crocetin','crocin-i').type,'summary');
  assert.match(edge('crocetin','crocin-i').label,/UGT74AD1.*UGT91P3/);
  assert.equal(edge('beta-carotene','beta-cyclocitral').type,'summary');
  assert.match(edge('beta-carotene','beta-cyclocitral').detail,/photooxid|excess light|oxidation products/i);
  assert.equal(edge('picrocrocin','safranal').type,'summary');
  assert.match(edge('picrocrocin','safranal').detail,/processing|dehydration/i);
  assert.equal(edge('9-cis-violaxanthin','xanthoxin').coproduct.carbons,25);
  const oxidation=data.reactions.find(item=>item.id==='apo-retinal-retinoic-acid');
  assert.equal(oxidation.enzyme,'aldh','Retinal oxidation uses the general ALDH group without a duplicate overlapping option');
  assert.ok(!Object.hasOwn(data.enzymes,'retinalDehydrogenase'));
  assert.ok(answerMatches(createQuestion('enzyme',oxidation),'retinal dehydrogenase'));
});

test('framework gallery shows actual variable-size apocarotenoid examples',()=>{
  const frames=data.scaffolds.filter(record=>record.family==='apo');
  assert.equal(frames.length,5);
  for(const id of ['apo-retinoid-framework','apo-ionone-framework','apo-cyclocitral-framework','apo-crocetin-framework']){
    const frame=frames.find(record=>record.id===id),example=byId.get(frame.exampleId);
    assert.equal(scaffoldFamily(frame),'apo');
    assert.equal(frame.SMILES,example.SMILES);
    assert.equal(frame.MolecularFormula,example.MolecularFormula);
    assert.equal(frame.pathwayLink.graph,'apocarotenoids');
    assert.ok(scaffoldScope(frame).includes('C'+frame.skeleton));
  }
});

test('hydroxyl lookup and focused motif prompts avoid ambiguous classification',()=>{
  const byMotif=new Map(data.motifs.map(record=>[record.id,record]));
  const alcohol=byMotif.get('alcohol');
  assert.ok(filterLibrary(data.motifs,'hydroxyl').some(record=>record.id==='alcohol'));
  assert.ok(answerMatches(createQuestion('motif',alcohol),'hydroxyl group'));
  assert.match(alcohol.note,/saturated|sp3/);
  assert.ok(createQuestion('motif',alcohol).prompt);
  for(const id of ['primary-alcohol','secondary-alcohol','tertiary-alcohol']){
    const question=createQuestion('motif',byMotif.get(id));
    assert.match(question.prompt,/primary.*secondary.*tertiary/i);
    assert.ok(question.promptKo);
    assert.ok(!answerMatches(question,'alcohol'),'A specific degree asks for more than the broad group');
  }
  const allylic=createQuestion('motif',byMotif.get('allylic-alcohol'));
  assert.match(allylic.prompt,/position|C=C/i);
  for(const id of ['vicinal-diol','enal','unsaturated-carboxylic-acid','unsaturated-ester','endoperoxide','carboxylate'])assert.ok(byMotif.has(id));
  for(const id of Object.keys(expected)){
    const question=createQuestion('family',byId.get(id));
    assert.match(question.prompt,/carotenoid cleavage/i);
    assert.match(question.hint,/C40/);
    assert.ok(question.promptKo&&question.hintKo);
    assert.ok(answerMatches(question,'apocarotenoid'));
    assert.ok(!answerMatches(question,'ABA'));
  }
});
