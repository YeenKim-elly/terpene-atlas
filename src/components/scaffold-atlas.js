import {icon as I} from './icons.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stateByRoot=new WeakMap();
export const scaffoldFamilies=[
 {id:'mono',label:['C10 · Monoterpenoids','C10 · 모노테르페노이드'],map:'monoterpenes',note:['Acyclic, monocyclic, bridged and fused iridoid examples.','비고리형·단일 고리·가교형 골격과 융합 iridoid 예시.']},
 {id:'sesqui',label:['C15 · Sesquiterpenoids','C15 · 세스퀴테르페노이드'],map:'sesquiterpenes',note:['Open chains, macrocycles, bicycles and the artemisinin ring system.','열린 사슬·큰 고리·이중 고리와 artemisinin 고리 구조.']},
 {id:'di',label:['C20 · Diterpenoids','C20 · 디테르페노이드'],map:'diterpenes',note:['Labdane, halimane, clerodane, kaurane, taxane and the contracted GA12 framework.','Labdane·halimane·clerodane·kaurane·taxane과 고리가 축소된 GA12 골격.']},
 {id:'tetra',label:['C40 · Carotenoids','C40 · 카로티노이드'],map:'carotenoid-frameworks',note:['End-group frameworks, geometric variants and epoxidised ring examples.','말단 골격·기하이성질체·epoxide 고리 예시.']},
 {id:'apo',label:['C40-derived · C15 apocarotenoids','C40 유래 · C15 아포카로티노이드'],filter:['C40 → C15','C40 → C15'],map:'aba-cleavage',mapLabel:['ABA cleavage pathway','ABA 절단 경로'],note:['A C15 cleavage framework with a C40 origin, kept separate from FPP-derived C15 frameworks.','C40 절단에서 유래한 C15 골격으로, FPP 유래 C15 골격과 구분합니다.']},
 {id:'rings',label:['Ring systems','고리 구조'],note:['Shared topologies; a ring motif alone does not assign a terpene family.','여러 계열이 공유하는 고리 형태이며 고리 모티프만으로 terpene 계열을 정하지 않습니다.']}
];
export function scaffoldFamily(record){
 if(['mono','sesqui','di','tetra','apo'].includes(record.family))return record.family;
 if(record.category==='Ring topology')return 'rings';
 if(record.category==='Carotenoid end group')return 'tetra';
 if(/Diterpene|C20 clerodane|Decorated ring reference/.test(record.category||''))return 'di';
 return 'rings';
}
export function scaffoldScope(record,t=(en)=>en){
 if(record.referenceKind==='ring-system')return t('Oxygen-bridged ring system','산소 가교 고리계');
 if(record.referenceKind==='geometry-variant')return t('Geometry variant · same framework','기하배열 변형 · 같은 골격');
 if(record.referenceKind==='ring-variant')return t('Ring / oxidation variant','고리 / 산화 상태 변형');
 if(record.referenceKind==='cleavage-framework')return t('C40-derived C15 framework','C40 유래 C15 골격');
 if(record.category==='Carotenoid end group')return t('End-ring fragment · part of C40','말단 고리 부분 모형 · C40의 일부');
 if(record.structureScope==='framework-example')return t('Framework example','골격 예시');
 if(record.ringFusion)return t('Relative stereochemical class','상대입체배열 유형');
 if(scaffoldFamily(record)==='rings')return t('Ring topology','고리 형태');
 return t('C20 scaffold reference','C20 골격 참고');
}
export function renderScaffoldAtlas(root,ctx){
 const t=(en,ko)=>ctx.lang==='ko'?ko:en;
 const state=stateByRoot.get(root)||{family:'all'};stateByRoot.set(root,state);
 const records=ctx.records||[],all=ctx.allRecords||records;
 const shown=records.filter(r=>state.family==='all'||scaffoldFamily(r)===state.family);
 const count=id=>all.filter(r=>scaffoldFamily(r)===id).length;
 const filters=[['all',t('All families','모든 계열'),all.length],...scaffoldFamilies.map(f=>[f.id,f.filter?t(...f.filter):f.id==='rings'?t(...f.label):'C'+({mono:10,sesqui:15,di:20,tetra:40}[f.id]),count(f.id)])];
 root.className='scaffold-atlas';
 root.innerHTML='<div class="scaffold-atlas-intro"><div class="eyebrow">'+t('SCAFFOLDS ACROSS THE ATLAS','ATLAS의 골격 모음')+'</div><h2>'+t('Choose a family. Read its framework.','계열을 고르고 골격을 살펴보세요.')+'</h2><p>'+t('Explore C10, C15, C20 and C40 frameworks, their ring variants and C40-derived apocarotenoids. Each example links to its relevant pathway.','C10·C15·C20·C40 골격, 고리 변형과 C40 유래 아포카로티노이드를 살펴보세요. 각 예시는 관련 경로와 연결됩니다.')+'</p><p class="scaffold-scope-note">'+t('Ring and geometry variants share their parent framework. Esterification changes decoration while retaining the C40 carotenoid core.','고리·기하배열 변형은 모체 골격을 공유합니다. Ester화는 치환기를 바꾸며 C40 carotenoid 핵심 골격은 유지됩니다.')+'</p></div><div class="scaffold-family-filters" role="group" aria-label="'+t('Filter scaffolds by family','계열별 골격 필터')+'">'+filters.map(([id,label,n])=>'<button data-scaffold-family="'+id+'" class="'+(state.family===id?'active':'')+'" aria-pressed="'+(state.family===id)+'">'+esc(label)+'<span>'+n+'</span></button>').join('')+'</div><p class="scaffold-result-count" role="status">'+shown.length+' '+t('scaffold and ring references','골격·고리 참고 항목')+'</p><div class="scaffold-family-groups '+(state.family==='all'?'is-overview':'is-filtered')+'">'+scaffoldFamilies.map(f=>{
 const list=shown.filter(r=>scaffoldFamily(r)===f.id).sort((a,b)=>Number(a.category==='Carotenoid end group')-Number(b.category==='Carotenoid end group'));if(!list.length)return '';
 return '<section class="scaffold-family-group" data-scaffold-group="'+f.id+'"><div class="scaffold-group-heading"><div><h3>'+esc(t(...f.label))+'</h3><p>'+esc(t(...f.note))+'</p></div>'+(f.map&&ctx.goMap?'<button class="text-button" data-scaffold-map="'+f.map+'">'+(f.mapLabel?t(...f.mapLabel):t('Precursor → framework map','전구체 → 골격 지도'))+I('arrow')+'</button>':'')+'</div><div class="scaffold-card-grid">'+list.map(r=>{
 const link=r.pathwayLink,related=r.parentFrameworkId?all.find(p=>p.id===r.parentFrameworkId):null;
 return '<div class="scaffold-card-item'+(link&&ctx.goMap?' has-pathway':'')+'"><button class="scaffold-record-card" data-detail="'+r.id+'"><div class="scaffold-card-image"><img src="'+esc(r.image)+'" alt="'+esc(r.name)+' '+t('scaffold illustration','골격 그림')+'" loading="lazy"></div><div class="scaffold-card-copy"><span>'+esc(scaffoldScope(r,t))+'</span><h4>'+esc(t(r.name,r.ko||r.name))+'</h4>'+(r.exampleName?'<p>'+t('Example: ','예시: ')+esc(r.exampleName)+'</p>':'')+(related?'<p class="scaffold-parent">'+t('Shared framework: ','공유 골격: ')+esc(t(related.name,related.ko||related.name))+'</p>':'')+(r.originSkeleton?'<p class="scaffold-origin">C'+r.originSkeleton+' → C'+r.skeleton+'</p>':'')+'</div></button>'+(link&&ctx.goMap?'<button class="scaffold-pathway-link" data-scaffold-pathway="'+esc(link.graph)+'">'+esc(t(...link.label))+I('arrow')+'</button>':'')+'</div>';
 }).join('')+'</div></section>';
 }).join('')+'</div>'+(!shown.length?'<div class="empty">'+t('No matching scaffolds. Clear the search or choose another family.','일치하는 골격이 없습니다. 검색을 지우거나 다른 계열을 선택하세요.')+'</div>':'');
 root.querySelectorAll('[data-scaffold-family]').forEach(b=>b.onclick=()=>{state.family=b.dataset.scaffoldFamily;renderScaffoldAtlas(root,ctx);});
 root.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>ctx.open(records.find(r=>r.id===b.dataset.detail)));
 root.querySelectorAll('[data-scaffold-map]').forEach(b=>b.onclick=()=>ctx.goMap?.(b.dataset.scaffoldMap));
 root.querySelectorAll('[data-scaffold-pathway]').forEach(b=>b.onclick=()=>ctx.goMap?.(b.dataset.scaffoldPathway));
 ctx.onCount?.(shown.length);
}
