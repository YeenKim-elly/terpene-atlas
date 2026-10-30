
import {icon as I} from './icons.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stateByRoot=new WeakMap();
export const scaffoldFamilies=[
 {id:'mono',label:['C10 · Monoterpenoids','C10 · 모노테르페노이드'],map:'monoterpenes',note:['Acyclic, monocyclic and bridged C10 frameworks.','비고리형·단일 고리·가교형 C10 골격.']},
 {id:'tetra',label:['C40 · Carotenoids','C40 · 카로티노이드'],map:'carotenoid-frameworks',note:['Full C40 end-group combinations, plus labelled end-ring fragments.','전체 C40 말단 조합과 구분 표시한 말단 고리 부분 모형.']},
 {id:'sesqui',label:['C15 · Sesquiterpenoids','C15 · 세스퀴테르페노이드'],map:'sesquiterpenes',note:['Open chains, macrocycles and bicyclic C15 frameworks.','열린 사슬·큰 고리·이중 고리 C15 골격.']},
 {id:'di',label:['C20 · Diterpenoids','C20 · 디테르페노이드'],map:'diterpenes',note:['Labdane, halimane, clerodane and qualified relative models.','Labdane·halimane·clerodane과 범위를 명시한 상대배열 모형.']},
 {id:'rings',label:['Ring systems','고리 구조'],note:['Shared topologies; a ring motif alone does not assign a terpene family.','여러 계열이 공유하는 고리 형태이며 고리 모티프만으로 terpene 계열을 정하지 않습니다.']}
];
export function scaffoldFamily(record){
 if(['mono','sesqui','di','tetra'].includes(record.family))return record.family;
 if(record.category==='Ring topology')return 'rings';
 if(record.category==='Carotenoid end group')return 'tetra';
 if(/Diterpene|C20 clerodane|Decorated ring reference/.test(record.category||''))return 'di';
 return 'rings';
}
export function renderScaffoldAtlas(root,ctx){
 const t=(en,ko)=>ctx.lang==='ko'?ko:en;
 const state=stateByRoot.get(root)||{family:'all'};stateByRoot.set(root,state);
 const records=ctx.records||[],all=ctx.allRecords||records;
 const shown=records.filter(r=>state.family==='all'||scaffoldFamily(r)===state.family);
 const count=id=>all.filter(r=>scaffoldFamily(r)===id).length;
 root.className='scaffold-atlas';
 root.innerHTML='<div class="scaffold-atlas-intro"><div class="eyebrow">'+t('SCAFFOLDS ACROSS THE ATLAS','ATLAS의 골격 모음')+'</div><h2>'+t('Choose a family. Read its framework.','계열을 고르고 골격을 살펴보세요.')+'</h2><p>'+t('C10, C15, C20 and C40 are shown together. Framework examples retain their illustrated chemistry; ring-system models describe topology.','C10·C15·C20·C40을 함께 보여줍니다. 골격 예시는 표시된 화학 구조를 유지하며 고리 모형은 연결 형태를 설명합니다.')+'</p></div><div class="scaffold-family-filters" role="group" aria-label="'+t('Filter scaffolds by family','계열별 골격 필터')+'">'+[['all',t('All families','모든 계열'),all.length],...['mono','sesqui','di','tetra','rings'].map(id=>{const f=scaffoldFamilies.find(x=>x.id===id);return [id,id==='rings'?t(...f.label):id==='mono'?'C10':id==='sesqui'?'C15':id==='di'?'C20':'C40',count(id)];})].map(([id,label,n])=>'<button data-scaffold-family="'+id+'" class="'+(state.family===id?'active':'')+'" aria-pressed="'+(state.family===id)+'">'+esc(label)+'<span>'+n+'</span></button>').join('')+'</div><p class="scaffold-result-count" role="status">'+shown.length+' '+t('scaffold and ring references','골격·고리 참고 항목')+'</p><div class="scaffold-family-groups '+(state.family==='all'?'is-overview':'is-filtered')+'">'+scaffoldFamilies.map(f=>{
 const list=shown.filter(r=>scaffoldFamily(r)===f.id).sort((a,b)=>Number(a.category==='Carotenoid end group')-Number(b.category==='Carotenoid end group'));if(!list.length)return '';
 return '<section class="scaffold-family-group" data-scaffold-group="'+f.id+'"><div class="scaffold-group-heading"><div><h3>'+esc(t(...f.label))+'</h3><p>'+esc(t(...f.note))+'</p></div>'+(f.map&&ctx.goMap?'<button class="text-button" data-scaffold-map="'+f.map+'">'+t('Precursor → framework map','전구체 → 골격 지도')+I('arrow')+'</button>':'')+'</div><div class="scaffold-card-grid">'+list.map(r=>{
 const fragment=r.category==='Carotenoid end group';
 const scope=fragment?t('End-ring fragment · part of C40','말단 고리 부분 모형 · C40의 일부'):r.structureScope==='framework-example'?t('Framework example','골격 예시'):r.ringFusion?t('Relative stereochemical class','상대입체배열 유형'):f.id==='rings'?t('Ring topology','고리 형태'):t('C20 scaffold reference','C20 골격 참고');
 return '<button class="scaffold-record-card" data-detail="'+r.id+'"><div class="scaffold-card-image"><img src="'+esc(r.image)+'" alt="'+esc(r.name)+' '+t('scaffold illustration','골격 그림')+'" loading="lazy"></div><div class="scaffold-card-copy"><span>'+esc(scope)+'</span><h4>'+esc(t(r.name,r.ko||r.name))+'</h4>'+(r.exampleName?'<p>'+t('Example: ','예시: ')+esc(r.exampleName)+'</p>':'')+'</div></button>';
 }).join('')+'</div></section>';
 }).join('')+'</div>'+(!shown.length?'<div class="empty">'+t('No matching scaffolds. Clear the search or choose another family.','일치하는 골격이 없습니다. 검색을 지우거나 다른 계열을 선택하세요.')+'</div>':'');
 root.querySelectorAll('[data-scaffold-family]').forEach(b=>b.onclick=()=>{state.family=b.dataset.scaffoldFamily;renderScaffoldAtlas(root,ctx);});
 root.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>ctx.open(records.find(r=>r.id===b.dataset.detail)));
 root.querySelectorAll('[data-scaffold-map]').forEach(b=>b.onclick=()=>ctx.goMap?.(b.dataset.scaffoldMap));
 ctx.onCount?.(shown.length);
}
