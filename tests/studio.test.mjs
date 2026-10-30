import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTestCatalogue} from './support/catalogue.mjs';
import {RenderBoundary,installRenderBoundary} from './support/render-boundary.mjs';
installRenderBoundary();
await loadTestCatalogue();
const {renderPractice,resetPractice}=await import('../src/pages/practice.js');
const {setLanguage}=await import('../src/lib/i18n.js');
const {renderGeraniolXray,bindGeraniolXray}=await import('../src/components/geraniol-xray.js');

test('six public practice types expand one shared row panel and preserve both precursor styles',()=>{
  const root=new RenderBoundary();
  resetPractice();renderPractice(root,{});
  const modes=['family','precursor','motif','enzyme','scaffold','comparison'];
  assert.deepEqual(root.querySelectorAll('[data-mode]').map(n=>n.dataset.mode),modes);
  assert.equal(root.querySelector('#start'),null,'Session options start closed');
  assert.equal((root.innerHTML.match(/class="studio-practice-row/g)||[]).length,3);
  for(const mode of modes){
    root.querySelector('[data-mode="'+mode+'"]').click();
    assert.equal(root.querySelectorAll('#start').length,1,'Exactly one configuration form');
    assert.equal(root.querySelectorAll('[aria-expanded="true"]').length,1);
    assert.match(root.innerHTML,new RegExp('id="practice-config-'+mode+'" class="studio-config-extension"'));
    root.querySelector('[data-mode="'+mode+'"]').click();
    assert.equal(root.querySelector('#start'),null,'Clicking the selected type closes it');
  }
  root.querySelector('[data-mode="precursor"]').click();
  root.querySelector('[data-style="typing"]').click();
  root.querySelector('[data-count="5"]').click();
  assert.equal(root.querySelector('[data-mode="precursor"]').attrs['aria-expanded'],'true');
  root.querySelector('#start').click();
  assert.ok(root.querySelector('#answer-form'),'Typing launches');
  root.querySelector('#quiz-back').click();
  root.querySelector('[data-style="choice"]').click();
  root.querySelector('#start').click();
  assert.ok(root.querySelectorAll('[data-choice]').length>=2,'Multiple choice launches');
  resetPractice();setLanguage('ko');renderPractice(root,{});
  assert.match(root.innerHTML,/어떤 내용을 연습할까요/);
  root.querySelector('[data-mode="scaffold"]').click();
  assert.match(root.innerHTML,/나만의 문제 구성/);
  resetPractice();setLanguage('en');
});

test('geraniol views retain two five-carbon units and update their live explanation',()=>{
  const html=renderGeraniolXray('en');
  const dots=html.match(/<g class="xray-carbon-dots"[^>]*>([\s\S]*?)<\/g>\s*<\/g>/)[1];
  assert.equal((dots.match(/<circle/g)||[]).length,10);
  const buttons=['raw','units','modification'].map(mode=>({dataset:{xrayMode:mode},attrs:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(type,fn){this[type]=fn;}}));
  const description={textContent:''};
  const card={dataset:{xrayLanguage:'en',xrayView:'units'},querySelectorAll:()=>buttons,querySelector:()=>description};
  bindGeraniolXray({querySelectorAll:()=>[card]});
  const notes=[];
  for(const button of buttons){button.click();assert.equal(card.dataset.xrayView,button.dataset.xrayMode);assert.equal(buttons.filter(b=>b.attrs['aria-pressed']==='true').length,1);notes.push(description.textContent);}
  assert.equal(new Set(notes).size,3);
  assert.ok(!html.includes('Allylic hydroxylation'));
});

test('shared shell exposes only public destinations and its drawer controls mobile focus',async()=>{
  const originalWindow=window,originalDocument=document;
  let width=1440,keyHandler,mediaHandler;
  const node=dataset=>({dataset:dataset||{},attrs:{},inert:false,hidden:false,classList:{toggle(){}},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];},focus(){document.activeElement=this;}});
  const elements=new Map([['.studio-shell',node()],['#atlas-navigation',node()],['#atlas-nav-toggle',node({openLabel:'Open navigation',closeLabel:'Close navigation'})],['#atlas-nav-close',node()],['#atlas-nav-dismiss',node()],['.app-content',node()]]);
  const links=[node(),node({nav:'practice'}),node({nav:'sources'})];
  globalThis.window={matchMedia:query=>({get matches(){return query.includes('min-width')?width>=1100:width<=1099;},addEventListener(type,fn){mediaHandler=fn;}})};
  globalThis.document={activeElement:null,querySelector:selector=>selector==='#atlas-navigation [data-nav]'?links[1]:elements.get(selector),querySelectorAll:()=>links,addEventListener(type,fn){keyHandler=fn;}};
  try{
    const shell=await import('../src/components/shell.js');
    const nav=await import('../src/components/studio-navigation.js');
    assert.deepEqual(shell.navigation.map(([id])=>id),['practice','library','web','compare','sources']);
    const html=shell.shellHTML('practice');
    const destinations=[...html.matchAll(/data-nav="([^"]+)"/g)].map(match=>match[1]);
    assert.ok(destinations.every(id=>['practice','library','web','compare','sources'].includes(id)));
    nav.bindStudioShell();
    nav.closeStudioNavigation();
    assert.equal(elements.get('#atlas-navigation').inert,true);
    width=375;mediaHandler();elements.get('#atlas-nav-toggle').onclick();
    assert.equal(elements.get('.app-content').inert,true);
    assert.equal(elements.get('#atlas-navigation').attrs['aria-modal'],'true');
    assert.equal(document.activeElement,links[1]);
    document.activeElement=links.at(-1);let prevented=false;
    keyHandler({key:'Tab',preventDefault(){prevented=true;}});
    assert.ok(prevented);assert.equal(document.activeElement,links[0]);
    keyHandler({key:'Escape'});
    assert.equal(elements.get('.app-content').inert,false);
    assert.equal(document.activeElement,elements.get('#atlas-nav-toggle'));
  }finally{globalThis.window=originalWindow;globalThis.document=originalDocument;}
});

