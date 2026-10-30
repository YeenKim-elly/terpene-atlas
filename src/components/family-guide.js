
import {icon as I} from './icons.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderFamilyGuide(root,guide,ctx){
 const t=(en,ko)=>ctx.lang==='ko'?ko:en;
 root.className='framework-guide';
 root.innerHTML='<div class="framework-guide-heading"><div><div class="eyebrow">'+t('PRECURSOR / ENZYME / FRAMEWORK','전구체 / 효소 / 골격')+'</div><h2>'+esc(t(...guide.title))+'</h2></div><span>'+esc(t(...guide.intro))+'</span></div><div class="framework-reading-order">'+guide.stages.map((stage,i)=>'<span><b>'+String(i+1).padStart(2,'0')+'</b>'+esc(t(...stage))+'</span>').join('')+'</div><div class="framework-branches">'+guide.branches.map(branch=>{
  const framework=ctx.records.get(branch.framework);
  return '<button class="framework-branch" data-framework-jump="'+branch.framework+'"><span class="framework-input">'+esc(branch.input)+'</span><span class="framework-enzyme">'+esc(branch.enzyme)+'</span><strong>'+esc(framework.name)+'</strong><span class="framework-examples">'+branch.examples.map(id=>esc(ctx.records.get(id)?.name||id)).join(' · ')+'</span><span class="framework-locate">'+t('Locate framework','지도에서 보기')+I('arrow')+'</span></button>';
 }).join('')+'</div>';
 root.querySelectorAll('[data-framework-jump]').forEach(button=>button.onclick=()=>ctx.jump(button.dataset.frameworkJump));
}
export function renderFamilyGuideFooter(root,guide,ctx){
 const t=(en,ko)=>ctx.lang==='ko'?ko:en;
 root.className='framework-guide-footer';
 const pairs=guide.comparisons.map(id=>ctx.comparisons.find(p=>p.id===id)).filter(Boolean);
 root.innerHTML=(pairs.length?'<section class="framework-comparisons"><div><div class="eyebrow">'+t('FOLLOW THE MODIFICATION','구조 변화 따라가기')+'</div><h2>'+t('Compare the actual structures.','실제 구조를 나란히 비교하세요.')+'</h2><p>'+t('Open a matched pair, highlight differences and practise with choices or typing.','대응하는 두 구조의 차이를 강조하고 선택형·입력형으로 연습합니다.')+'</p></div><div>'+pairs.map(pair=>'<button class="secondary" data-framework-compare="'+pair.id+'">'+esc(t(...pair.title))+I('arrow')+'</button>').join('')+'</div></section>':'')+'<div class="framework-callouts">'+guide.callouts.map(callout=>'<details><summary>'+esc(t(...callout.title))+'</summary><p>'+esc(t(...callout.text))+'</p><a href="'+esc(callout.source)+'" target="_blank" rel="noopener">'+t('Supporting source','근거 문헌')+I('learn')+'</a></details>').join('')+'</div><p class="framework-model-note">'+t('Framework drawings retain a selected example’s unsaturation, oxygenation and stereochemistry. They illustrate class membership; they are not additional saturated parent intermediates.','골격 그림은 선택한 예시의 불포화도·산소 작용기·입체배열을 유지합니다. 계열 소속을 설명하는 모형이며 추가적인 포화 모체 중간체를 뜻하지 않습니다.')+'</p>';
 root.querySelectorAll('[data-framework-compare]').forEach(button=>button.onclick=()=>ctx.compare(button.dataset.frameworkCompare));
}
