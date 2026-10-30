import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTestCatalogue} from './support/catalogue.mjs';
import {RenderBoundary,installRenderBoundary} from './support/render-boundary.mjs';
installRenderBoundary();
const data=await loadTestCatalogue();
const {renderLibrary}=await import('../src/pages/library.js');
const {renderPractice,startSinglePractice,resetPractice}=await import('../src/pages/practice.js');
const {renderStructureComparison}=await import('../src/pages/comparison.js');
const {provenanceHTML}=await import('../src/components/modal.js');
const {setLanguage}=await import('../src/lib/i18n.js');

test('library categories, details, search, empty state and family filters work',()=>{
 const root=new RenderBoundary();let opened;
 const ctx={openRecord:record=>{opened=record;},goCompare(){}};
 renderLibrary(root,ctx);
 for(const [tab,count]of [['molecules',122],['precursors',17],['scaffolds',46],['motifs',47],['reactions',67]]){
  root.querySelector('[data-library-tab="'+tab+'"]').click();
  const cards=(tab==='scaffolds'?root.querySelector('#library-grid'):root).querySelectorAll('[data-detail]');
  assert.equal(cards.length,count,tab);assert.ok(cards.every(card=>typeof card.onclick==='function'));
  cards[0].click();assert.ok(opened?.id);
 }
 root.querySelector('[data-library-tab="molecules"]').click();
 root.querySelector('#library-search').oninput({target:{value:'borapetoside'}});
 assert.equal(root.querySelectorAll('[data-detail]').length,data.molecules.filter(x=>x.id.includes('borapetoside')).length);
 root.querySelector('#library-search').oninput({target:{value:'no_matching_structure_xyz'}});
 assert.equal(root.querySelectorAll('[data-detail]').length,0);
 root.querySelector('#library-clear').click();
 root.querySelector('#library-family').onchange({target:{value:'di'}});
 assert.equal(root.querySelectorAll('[data-detail]').length,data.molecules.filter(x=>x.family==='di').length);
 setLanguage('ko');renderLibrary(root,ctx);assert.match(root.innerHTML,/구조로 살펴보는/);
 setLanguage('en');
});
test('single-card practice renders choice and typing for precursors, molecules, motifs and reactions',()=>{
 const root=new RenderBoundary();renderPractice(root,{});
 for(const [kind,record]of [['precursor',data.precursors[0]],['name',data.molecules[0]],['motif',data.motifs[0]],['enzyme',data.reactions[0]],['scaffold',data.scaffolds[0]]]){
  for(const style of ['choice','typing']){
   startSinglePractice(kind,record,style);renderPractice(root,{});
   const choices=root.querySelectorAll('[data-choice]');
   if(style==='choice'){
    assert.ok(choices.length>=2&&choices.length<=6,kind);
    choices[0].click();assert.ok(root.querySelector('#next-question'));
   }else{
    assert.equal(choices.length,0,kind);
    assert.ok(root.querySelector('#answer-input'));
    root.querySelector('#answer-input').value='a deliberately incorrect answer';
    root.querySelector('#answer-form').onsubmit({preventDefault(){}});
    assert.ok(root.querySelector('#next-question'));
   }
  }
 }
 resetPractice();
});
test('aligned comparisons link to records and both practice styles',()=>{
 const root=new RenderBoundary();let selected,style;
 renderStructureComparison(root,{molecules:[...data.molecules,...data.precursors],lang:'en',back(){},openRecord:id=>{selected=id;},startPractice:value=>{style=value;}});
 assert.equal(root.querySelectorAll('[data-compare-record]').length,2);
 root.querySelector('[data-compare-record]').click();assert.ok(selected);
 root.querySelector('[data-difference-practice="typing"]').click();assert.equal(style,'typing');
 root.querySelector('[data-difference-practice="choice"]').click();assert.equal(style,'choice');
});
test('partial and figure-only details never invent a CID',()=>{
 for(const id of ['clpp-cis-cis','clpp-cis-trans']){
  const html=provenanceHTML(data.precursors.find(x=>x.id===id));
  assert.match(html,/Partial relative model/);assert.ok(!html.includes('CID null'));
 }
 const html=provenanceHTML(data.molecules.find(x=>x.id==='crispene-d'));
 assert.match(html,/compound 4/);assert.match(html,/CC BY-NC-SA 3.0/);
 assert.ok(!html.includes('CID null'));
});
