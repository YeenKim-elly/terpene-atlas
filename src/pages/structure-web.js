import {familySubmaps,structureViewGroup,structureGraphId} from '../lib/structure-views.js';
import {renderScaffoldAtlas} from '../components/scaffold-atlas.js';
import {renderFamilyGuide,renderFamilyGuideFooter} from '../components/family-guide.js';
import {icon as I} from '../components/icons.js';
import {createWebViewport} from '../components/web-viewport.js';
import {renderRearrangements} from '../components/rearrangements.js';
import {routeGraph,overlaps,NODE_WIDTH,NODE_HEIGHT} from '../lib/network-routing.js';
import {catalogue} from '../lib/catalogue.js';
const graphs=catalogue.graphs;
const familyGuides=catalogue.familyGuides,comparisonPairs=catalogue.comparisons;
const refs={carotenoid:'https://pubmed.ncbi.nlm.nih.gov/22616944/',fuco:'https://pubmed.ncbi.nlm.nih.gov/41955116/',fuco2023:'https://doi.org/10.1093/plcell/koad116',diterpene:'https://pmc.ncbi.nlm.nih.gov/articles/PMC6717049/',clpp:'https://pubmed.ncbi.nlm.nih.gov/30393911/',kpp:'https://iubmb.qmul.ac.uk/enzyme/EC5/5/1/28.html'};

const graphGroup=structureViewGroup;
let active='monoterpenes',selected='beta-carotene',zoom=.8;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let cleanupWebViewport=()=>{};
export function disposeStructureWeb(){cleanupWebViewport();cleanupWebViewport=()=>{};}
export function renderStructureWeb(root,ctx){
disposeStructureWeb();
const t=(en,ko)=>ctx.lang==='ko'?ko:en;
const records=new Map([...ctx.molecules,...ctx.scaffolds,...(ctx.webNotes||[])].map(x=>[x.id,x]));
const baseGraph=graphs[structureGraphId(active)];let savedLayout={};try{savedLayout=JSON.parse(localStorage.getItem('terpene-atlas/layout-v1-'+active)||'{}');}catch{}
const graph=restoreGraphLayout(baseGraph,savedLayout);
const measureCanvas=document.createElement('canvas'),measureContext=measureCanvas.getContext('2d');measureContext.font='600 11px system-ui';const measureText=s=>measureContext.measureText(s).width;
let routed;try{routed=routeGraph(graph,{measureText});}catch{graph.nodes=baseGraph.nodes.map(n=>[...n]);routed=routeGraph(graph,{measureText});}let dragState=null,ignoreClick=false,dragFrame=0;
if(!graph.nodes.some(n=>n[0]===selected))selected=graph.nodes[0][0];
root.innerHTML='<div class="eyebrow">'+t('STRUCTURE / CONNECTIONS','구조 / 연결')+'</div><div class="page-heading"><h1>'+t('Structure web.','구조 연결망.')+'</h1><p>'+t('See the structure. Follow the chemistry. Find the branch.','구조를 보고, 반응을 따라, 분기를 찾아보세요.')+'</p></div><div class="view-tabs web-tabs">'+[['precursors','Precursors','전구체'],['monoterpenes','Monoterpenoids','모노테르페노이드'],['sesquiterpenes','Sesquiterpenoids','세스퀴테르페노이드'],['diterpenes','Diterpenoids','디테르페노이드'],['carotenoids','Carotenoids · C40','카로티노이드 · C40'],['scaffolds','Scaffolds & rings','골격과 고리']].map(x=>'<button data-web-tab="'+x[0]+'" class="'+(graphGroup(active)===x[0]?'active':'')+'" aria-pressed="'+(graphGroup(active)===x[0])+'">'+t(x[1],x[2])+'</button>').join('')+'</div><section class="web-intro"><h2>'+t(...graph.title)+'</h2><p>'+t(...graph.intro)+'</p></section><section class="web-stage" role="region" aria-label="'+t('Structure web viewer','구조 연결망 뷰어')+'"><div class="web-toolbar"><label>'+t('Find a structure','구조 찾기')+'<select id="web-find" aria-label="Find a structure"><option value="">'+t('Jump to a node…','노드 선택…')+'</option>'+graph.nodes.map(n=>'<option value="'+n[0]+'">'+esc(records.get(n[0])?.name||n[0])+'</option>').join('')+'</select></label><div class="web-zoom"><button id="web-minus" title="'+t('Zoom out','축소')+'" aria-label="'+t('Zoom out','축소')+'">'+I('minus')+'</button><span id="web-scale" aria-live="polite"></span><button id="web-plus" title="'+t('Zoom in','확대')+'" aria-label="'+t('Zoom in','확대')+'">'+I('plus')+'</button><button id="web-reset" title="'+t('Fit entire web','전체 연결망 맞춤')+'">'+t('Fit','맞춤')+'</button><button id="web-layout-reset">'+t('Reset layout','배치 초기화')+'</button><button id="web-fullscreen" class="web-fullscreen-toggle" aria-label="'+t('Enter fullscreen','전체화면 열기')+'" title="'+t('Enter fullscreen','전체화면 열기')+'" aria-pressed="false">'+I('expand')+'</button></div></div><div class="web-legend"><span><i class="line step"></i>'+t('Reaction','반응')+'</span><span><i class="line summary"></i>'+t('Summarized pathway','요약 경로')+'</span><span><i class="line structure"></i>'+t('Structural relation · no reaction','구조 관계 · 반응 아님')+'</span></div><div class="web-layout"><div class="web-canvas" tabindex="0" aria-label="Scrollable structure network"><div id="web-drawing"></div></div><aside class="web-detail" id="web-detail" aria-live="polite"></aside></div></section><p class="notice">'+t('Drag a node to rearrange the web; connections and labels route around the boxes. Your layout is saved in this browser. Reset layout restores the original positions. Arrow keys move a focused node. Select a node for explanations and sources.','노드 또는 드롭다운을 선택하세요. 지도를 상하좌우로 스크롤할 수 있습니다. 연결별 설명과 출처는 옆에 표시됩니다.')+'</p><section class="note-card"><h2>'+t('Naming matters.','이름과 입체배열.')+'</h2><p>'+t('KPP and other CLPP examples already possess clerodane-related C20 backbones. Dotted scaffold lines show membership, not formation of the generic parent skeleton. The (−)-KPP node is one defined intermediate, not the unique source of every clerodane. CPP stereoisomers have separate entries. Fucoxanthin retains a C40 core despite its C42 total formula.','CPP 입체이성질체는 개별 항목입니다. CLPP는 여러 입체이성질체를 뜻할 수 있으며 여기서는 특정 (−)-KPP 레코드를 표시합니다. Fucoxanthin은 전체 C42이지만 C40 골격을 가집니다.')+'</p><a href="'+refs.clpp+'" target="_blank" rel="noopener">CLPP stereoisomers ↗</a> · <a href="'+refs.fuco+'" target="_blank" rel="noopener">2026 fucoxanthin pathway study ↗</a></section>';
root.querySelectorAll('[data-web-tab]').forEach(b=>b.onclick=()=>{active=b.dataset.webTab==='carotenoids'?'carotenoid-frameworks':b.dataset.webTab;selected='';renderStructureWeb(root,ctx);});
const canvas=root.querySelector('.web-canvas'),stage=root.querySelector('.web-stage');
function showFramework(id){const record=records.get(id);if(!record)return;if(graph.nodes.some(n=>n[0]===id))select(id,true);else{const target=familyGuides[active]?.targetGraph||Object.keys(graphs).find(key=>graphs[key].nodes.some(n=>n[0]===id));if(target){active=target;selected=id;renderStructureWeb(root,ctx);}else{viewport.close();ctx.open(record);}}}
let fitMode=false,normalView=null,viewportFrame=0;
function fitWeb(){
 if(!stage.isConnected||!canvas.clientWidth||!canvas.clientHeight)return;
 zoom=Math.max(.05,Math.min(1,(canvas.clientWidth-24)/graph.width,(canvas.clientHeight-24)/graph.height));
 draw();canvas.scrollTo(0,0);
}
function scheduleViewport(action){
 if(viewportFrame)cancelAnimationFrame(viewportFrame);
 viewportFrame=requestAnimationFrame(()=>{viewportFrame=0;if(stage.isConnected)action();});
}
const viewport=createWebViewport({
 stage,button:root.querySelector('#web-fullscreen'),
 enterLabel:t('Enter fullscreen','전체화면 열기'),exitLabel:t('Exit fullscreen (Esc)','전체화면 닫기 (Esc)'),
 onBeforeChange:expanded=>{if(expanded)normalView={zoom,fitMode,left:canvas.scrollLeft,top:canvas.scrollTop};},
 onChange:expanded=>{
  if(expanded){
   fitMode=true;scheduleViewport(fitWeb);
  }else{
   const previous=normalView;normalView=null;
   if(previous){zoom=previous.zoom;fitMode=previous.fitMode;scheduleViewport(()=>{draw();canvas.scrollTo(previous.left,previous.top);});}
  }
 }
});
const resizeObserver=typeof ResizeObserver==='function'?new ResizeObserver(()=>{if(fitMode)scheduleViewport(fitWeb);}):null;
resizeObserver?.observe(canvas);
cleanupWebViewport=()=>{resizeObserver?.disconnect();if(viewportFrame)cancelAnimationFrame(viewportFrame);viewport.destroy();};
function select(id,jump=false){selected=id;root.querySelector('#web-find').value=id;draw();details();if(jump){const n=graph.nodes.find(n=>n[0]===id);canvas.scrollTo({left:Math.max(0,(n[1]-80)*zoom),top:Math.max(0,(n[2]-100)*zoom),behavior:'smooth'});}}
function draw(){
const near=new Set([selected]);graph.edges.filter(e=>e.from===selected||e.to===selected).forEach(e=>{near.add(e.from);near.add(e.to);});
const pos=new Map(graph.nodes.map(n=>[n[0],n]));const W=190,H=132;
const layers=(graph.layers||[]).map(l=>'<g class="web-layer"><path d="M20 '+l.y+'H'+(graph.width-20)+'"/><text x="24" y="'+(l.y-12)+'">'+esc(l.label)+'</text></g>').join('');
const edges=routed.routes.map(({edge:e,path,leader})=>'<g class="web-edge '+e.type+((e.from===selected||e.to===selected)?' connected':'')+'" data-edge-from="'+e.from+'" data-edge-to="'+e.to+'"><path d="'+path+'" '+(e.type==='structure'?'':(e.reversible?'marker-start="url(#web-arrow)" ':'')+'marker-end="url(#web-arrow)"')+'/>'+(leader?'<path class="label-leader" d="'+leader+'"/>':'')+'</g>').join('');
const edgeLabels=routed.routes.map(({edge:e,index,label:l})=>'<g class="web-edge-label '+((e.from===selected||e.to===selected)?'connected':'')+'" data-web-edge-label="'+index+'" transform="translate('+l.x+','+l.y+')"><title>'+esc(e.label)+'</title><rect width="'+l.w+'" height="'+l.h+'" rx="6"/><text x="'+l.w/2+'" text-anchor="middle">'+l.lines.map((line,i)=>'<tspan x="'+l.w/2+'" y="'+(18+i*15)+'">'+esc(line)+'</tspan>').join('')+'</text></g>').join('');
const nodes=graph.nodes.map(([id,x,y])=>{const r=records.get(id);return '<g class="web-node '+(selected===id?'selected':near.has(id)?'neighbour':'')+'" transform="translate('+x+','+y+')" data-web-node="'+id+'" tabindex="0" role="button" aria-label="'+esc(r.name)+'" aria-pressed="'+(selected===id)+'"><rect width="'+W+'" height="'+H+'" rx="12"/><image href="'+esc(r.image)+'" x="8" y="10" width="174" height="78"/><text x="95" y="107" text-anchor="middle">'+esc(r.name)+'</text><text class="node-sub" x="95" y="123" text-anchor="middle">'+esc(r.category||(r.role==='precursor'?'Precursor · C'+r.skeleton:'C'+r.skeleton+' skeleton'))+'</text></g>';}).join('');
let svg=root.querySelector('#web-drawing svg');if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');root.querySelector('#web-drawing').append(svg);}
svg.setAttribute('viewBox','0 0 '+graph.width+' '+graph.height);svg.setAttribute('width',graph.width*zoom);svg.setAttribute('height',graph.height*zoom);svg.setAttribute('aria-label',active+' structure relationships');
svg.innerHTML='<defs><marker id="web-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#77917a"/></marker></defs>'+layers+edges+nodes+edgeLabels;
root.querySelector('#web-scale').textContent=Math.round(zoom*100)+'%';
root.querySelectorAll('[data-web-node]').forEach(b=>{
 b.onclick=()=>{if(Date.now()<ignoreClick)return;select(b.dataset.webNode);};
 b.onpointerdown=event=>{if(event.button!==0)return;const n=graph.nodes.find(n=>n[0]===b.dataset.webNode);const p=pointer(event);selected=n[0];details();dragState={id:n[0],x:n[1],y:n[2],start:p,moved:false};canvas.setPointerCapture(event.pointerId);canvas.classList.add('dragging-node');event.preventDefault();};
 b.onkeydown=event=>{const offsets={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]};if(offsets[event.key]){event.preventDefault();const n=graph.nodes.find(n=>n[0]===b.dataset.webNode),delta=offsets[event.key];if(moveNode(n[0],n[1]+delta[0],n[2]+delta[1])){persist();draw();root.querySelector('[data-web-node="'+n[0]+'"]').focus();}return;}if(event.key==='Enter'||event.key===' '){event.preventDefault();select(b.dataset.webNode);root.querySelector('[data-web-node="'+selected+'"]').focus();}};
});

}
function details(){
const r=records.get(selected),related=graph.edges.filter(e=>e.from===selected||e.to===selected);
root.querySelector('#web-detail').innerHTML='<div class="eyebrow">'+t('SELECTED STRUCTURE','선택한 구조')+'</div><h2>'+esc(r.name)+'</h2><img src="'+esc(r.image)+'" alt="'+esc(r.name)+' chemical structure"><div class="tag">'+esc(r.MolecularFormula||r.category)+'</div>'+(r.frameworkId?'<button class="web-framework-link" id="web-framework">'+t('Framework: ','골격: ')+esc(records.get(r.frameworkId)?.name||r.frameworkId)+'</button>':'')+(r.structureScope==='framework-example'?'<p class="web-framework-caption">'+t('Illustrated example: ','그림의 예시: ')+esc(r.exampleName||'')+'</p>':'')+'<p>'+esc(t(r.note||'Select Full record for learning notes.',r.noteKo||r.note||'전체 레코드에서 학습 설명을 확인하세요.'))+'</p><button class="secondary" id="web-full">'+t('Full record','전체 레코드')+'</button><h3>'+t('Connections','연결')+' <small>'+related.length+'</small></h3><div class="web-connections">'+related.map(e=>{const target=e.from===selected?e.to:e.from,nr=records.get(target);return '<section><button data-web-related="'+target+'">'+(e.type==='structure'||e.reversible?'↔ ':e.from===selected?'→ ':'← ')+esc(nr.name)+'</button><strong>'+esc(e.label)+'</strong><p>'+esc(e.detail||'A representative connection; organism-specific details can vary.')+'</p>'+(e.source?'<a href="'+esc(e.source)+'" target="_blank" rel="noopener">'+t('Supporting source ↗','출처 ↗')+'</a>':'')+'</section>';}).join('')+'</div>';
root.querySelector('#web-full').onclick=async()=>{await viewport.close();ctx.open(r);};root.querySelector('#web-framework')?.addEventListener('click',()=>showFramework(r.frameworkId));root.querySelectorAll('[data-web-related]').forEach(b=>b.onclick=()=>select(b.dataset.webRelated,true));
}
root.querySelector('#web-find').onchange=e=>{if(e.target.value)select(e.target.value,true);};
function changeZoom(amount){
 fitMode=false;
 const x=(canvas.scrollLeft+canvas.clientWidth/2)/zoom,y=(canvas.scrollTop+canvas.clientHeight/2)/zoom;
 zoom=Math.max(.05,Math.min(1.6,Math.round((zoom+amount)*1000)/1000));
 draw();canvas.scrollTo(Math.max(0,x*zoom-canvas.clientWidth/2),Math.max(0,y*zoom-canvas.clientHeight/2));
}
root.querySelector('#web-minus').onclick=()=>changeZoom(-.1);
root.querySelector('#web-plus').onclick=()=>changeZoom(.1);
root.querySelector('#web-reset').onclick=()=>{fitMode=true;fitWeb();};
function pointer(event){const box=canvas.querySelector('svg').getBoundingClientRect();return{x:(event.clientX-box.left)/zoom,y:(event.clientY-box.top)/zoom};}
function moveNode(id,x,y){x=Math.round(Math.max(22,Math.min(graph.width-NODE_WIDTH-22,x)));y=Math.round(Math.max(22,Math.min(graph.height-NODE_HEIGHT-22,y)));const target={x,y,w:NODE_WIDTH,h:NODE_HEIGHT};if(graph.nodes.some(([other,a,b])=>other!==id&&overlaps(target,{x:a,y:b,w:NODE_WIDTH,h:NODE_HEIGHT},24)))return false;if((graph.layers||[]).some(l=>overlaps(target,{x:18,y:l.y-32,w:measureText(l.label)+l.label.length*1.8+35,h:28},8)))return false;const node=graph.nodes.find(n=>n[0]===id),old=[node[1],node[2]];node[1]=x;node[2]=y;try{routed=routeGraph(graph,{measureText});return true;}catch{node[1]=old[0];node[2]=old[1];return false;}}
function persist(){try{localStorage.setItem('terpene-atlas/layout-v1-'+active,JSON.stringify(Object.fromEntries(graph.nodes.map(([id,x,y])=>[id,[x,y]]))));}catch{}}
canvas.onpointermove=event=>{if(!dragState)return;const p=pointer(event);if(Math.abs(p.x-dragState.start.x)+Math.abs(p.y-dragState.start.y)<4)return;dragState.moved=true;dragState.next=p;if(!dragFrame)dragFrame=requestAnimationFrame(()=>{dragFrame=0;if(!dragState?.next)return;const n=dragState;if(moveNode(n.id,n.x+n.next.x-n.start.x,n.y+n.next.y-n.start.y))draw();});};
canvas.onpointerup=event=>{if(!dragState)return;const n=dragState;if(dragFrame){cancelAnimationFrame(dragFrame);dragFrame=0;}if(n.next)moveNode(n.id,n.x+n.next.x-n.start.x,n.y+n.next.y-n.start.y);dragState=null;canvas.classList.remove('dragging-node');if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);ignoreClick=n.moved?Date.now()+200:0;if(n.moved){persist();draw();}else select(n.id);};
canvas.onpointercancel=()=>{dragState=null;canvas.classList.remove('dragging-node');};
root.querySelector('#web-layout-reset').onclick=()=>{try{localStorage.removeItem('terpene-atlas/layout-v1-'+active);}catch{}graph.nodes=baseGraph.nodes.map(n=>[...n]);routed=routeGraph(graph,{measureText});select(selected);if(fitMode)fitWeb();};
select(selected,true);
const submaps=familySubmaps[graphGroup(active)];
if(submaps){
 const sub=document.createElement('div');sub.className='web-submaps';sub.setAttribute('aria-label',t('Family map view','계열 지도 보기'));
 sub.innerHTML=submaps.map(({id,label})=>'<button data-web-map="'+id+'" class="'+(active===id?'active':'')+'" aria-pressed="'+(active===id)+'">'+t(...label)+'</button>').join('');
 root.querySelector('.web-tabs').after(sub);sub.querySelectorAll('[data-web-map]').forEach(b=>b.onclick=()=>{active=b.dataset.webMap;selected='';renderStructureWeb(root,ctx);});
}
if(familyGuides[active]){
 const guide=document.createElement('div'),footer=document.createElement('div'),guideCtx={lang:ctx.lang,records,comparisons:comparisonPairs,jump:showFramework,compare:id=>ctx.openCompare?.(id),openMechanism:()=>{active='diterpene-rings';selected='';renderStructureWeb(root,ctx);root.querySelector('.rearrangement-panel')?.scrollIntoView?.({behavior:'smooth',block:'start'});}};
 root.querySelector('.web-intro').after(guide);stage.after(footer);renderFamilyGuide(guide,familyGuides[active],guideCtx);renderFamilyGuideFooter(footer,familyGuides[active],guideCtx);
}
if(active==='scaffolds'){
 root.querySelector('.web-intro h2').textContent=t('Scaffolds across C10, C15, C20 and C40.','C10·C15·C20·C40 골격을 함께 살펴보세요.');
 root.querySelector('.web-intro p').textContent=t('Browse framework examples and shared ring topologies. C20 mechanisms and relative stereochemistry are in the Diterpenoids tab.','골격 예시와 공통 고리 형태를 살펴보세요. C20 반응 기작과 상대입체배열은 Diterpenoids 탭에 있습니다.');
 const gallery=document.createElement('div');root.querySelector('.web-intro').after(gallery);
 renderScaffoldAtlas(gallery,{records:ctx.scaffolds,lang:ctx.lang,open:ctx.open,goMap:id=>{active=id;selected='';renderStructureWeb(root,ctx);}});
 stage.remove();root.querySelectorAll(':scope > .notice,:scope > .note-card').forEach(node=>node.remove());disposeStructureWeb();
}
if(active==='diterpene-rings'){
 root.querySelector('.web-intro h2').textContent=t('C20 ring fusion, rearrangements and clerodane classes.','C20 고리 융합·재배열·clerodane 상대배열.');
 root.querySelector('.web-intro p').textContent=t('Read the rearrangement mechanism alongside the separate structural classification map. Cis/trans ring fusion and the second clerodane relationship are independent.','재배열 반응 기작과 구조 분류 지도를 구분해 살펴보세요. Cis/trans 고리 융합과 clerodane의 두 번째 상대배열 관계는 독립적입니다.');
 const panel=document.createElement('div');stage.before(panel);renderRearrangements(panel,ctx.lang);renderClerodaneClasses(root,ctx);
}
 if(active==='diterpene-pathway')renderTpsPairs(root,ctx);
}


export function selectStructureGraph(id){if(graphs[structureGraphId(id)]){active=id;selected='';}}


function renderClerodaneClasses(root,ctx){
 const en=ctx.lang!=="ko";const list=ctx.scaffolds.filter(s=>s.ringFusion&&s.substituentRelation);
 const p=document.createElement('section');p.className='clerodane-panel';p.innerHTML='<div class="eyebrow">C20 CLERODANE / RELATIVE STEREOCHEMISTRY</div><h2>'+(en?'Four relative classes, two independent relationships.':'독립적인 두 관계로 나누는 네 가지 상대입체배열.')+'</h2><p>'+(en?'First word: H10 and C19 at the C5/C10 ring junction. Second word: C17 and C20 at C8/C9. Solid wedges point towards the viewer; hashed bonds point away. Each class can include enantiomeric and other stereochemical variants.':'첫 표기: C5/C10의 H10과 C19. 두 번째 표기: C8/C9의 C17과 C20. 굵은 쐐기는 앞, 점선 쐐기는 뒤를 향합니다.')+'</p><div class="clerodane-grid">'+list.map(s=>'<button class="stereo-card" data-stereo="'+s.id+'"><h3>'+esc(s.name)+'</h3><img src="'+s.image+'" alt="'+esc(s.name)+' relative stereochemical model"><span>C5/C10: '+s.ringFusion+' · C8/C9: '+s.substituentRelation+'</span></button>').join('')+'</div><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6130043/" target="_blank" rel="noopener">Characterized clerodane stereochemistry ↗</a>';root.querySelector('.web-stage').after(p);p.querySelectorAll('[data-stereo]').forEach(b=>b.onclick=()=>ctx.open(list.find(s=>s.id===b.dataset.stereo)));
}
function renderTpsPairs(root,ctx){
 const p=document.createElement('details');p.className='tps-pairs note-card tps-reference-details';p.innerHTML='<summary>'+(ctx.lang==='ko'?'규명된 TPS II → TPS I 조합':'Characterised TPS II → TPS I pairings')+'</summary><h2>After TPS II: which TPS I?</h2><div class="table-scroll"><table class="reference-table"><thead><tr><th>TPS II product</th><th>TPS I example</th><th>C20 product</th><th>Context</th></tr></thead><tbody>'+[['(+)-CPP','SmKSL1','Miltiradiene','Salvia miltiorrhiza'],['ent-CPP','AtKS / SrKS','ent-Kaurene','Characterized ent-CPP pathway'],['syn-CPP','OsKSL11 / OsKSL8i','Stemodene','Rice'],['HPP','SsSS','(13S)-Isotuberculosinol','Tested cross-species pairing'],['KPP','SsSS','Kolavelool','Tested cross-species pairing']].map(a=>'<tr>'+a.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div><p>These examples show substrate compatibility, not a universal enzyme order for every diterpenoid. SsSS pairings demonstrate promiscuity in reconstructed systems. Taxadiene synthase uses GGPP directly as a class I TPS.</p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4907819/" target="_blank" rel="noopener">Characterized combinatorial TPS pairs ↗</a>';root.querySelector('.web-stage').after(p);
}

export function restoreGraphLayout(baseGraph,saved={}){const fallback=()=>({...baseGraph,nodes:baseGraph.nodes.map(n=>[...n])});if(!saved||typeof saved!=='object'||Array.isArray(saved))return fallback();const nodes=baseGraph.nodes.map(([id,x,y])=>{const p=saved[id];return [id,...(Array.isArray(p)&&p.length===2&&p.every(v=>typeof v==='number'&&Number.isFinite(v))?p:[x,y])];});const boxes=nodes.map(([id,x,y])=>({id,x,y,w:NODE_WIDTH,h:NODE_HEIGHT}));if(boxes.some(b=>b.x<0||b.y<0||b.x+b.w>baseGraph.width||b.y+b.h>baseGraph.height)||boxes.some((b,i)=>boxes.some((other,j)=>j>i&&overlaps(b,other,24))))return fallback();return {...baseGraph,nodes};}
