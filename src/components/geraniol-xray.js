// Geraniol coordinates and (2E) geometry match assets/geraniol.svg (PubChem CID 637566).
// RDKit atom indices: OH-proximal C5 = 4,5,6,7,9; distal C5 = 0,1,2,3,10; O = 8.
// GPP → geraniol: GES / geranyl-diphosphate diphosphatase, EC 3.1.7.11.
const copy = {
 en: {
  atlas:'IN THE ATLAS',name:'Geraniol',kind:'MONOTERPENOID',explore:'ISOPRENE X-RAY',
  modes:['Raw skeleton','Highlight C5 units','Spot modification'],
  descriptions:[
   'Each unlabelled corner or line end is a carbon. Ten carbons make this a C10 monoterpenoid.',
   'Two C5 building blocks. One C10 skeleton. The colours show the biosynthetic units; the central bond joins them.',
   'The terminal –OH makes geraniol a primary alcohol. GPP → geraniol replaces diphosphate with an alcohol, without adding a carbon.'
  ],
  aria:'Geraniol, a C10 acyclic primary alcohol: two head-to-tail C5 units, with the hydroxyl group at the right-hand end.',
  legend:['C5 unit A','C5 unit B','Alcohol · –OH'],
  math:'2 × C5 → C10',mod:'Diphosphate → alcohol · geraniol synthase',
  precursor:'PRECURSOR',scent:'SCENT ASSOCIATION',aroma:'Rose / citronella',
  scentNote:'A component of rose and citronella oils.',source:'Reaction reference',
  hint:'Try another view',
 },
 ko: {
  atlas:'ATLAS 수록 분자',name:'게라니올',kind:'모노테르페노이드',explore:'아이소프렌 X-RAY',
  modes:['기본 골격','C5 단위 강조','작용기 찾기'],
  descriptions:[
   '원소 기호가 없는 모서리와 선의 끝은 탄소입니다. 탄소 10개로 이루어진 C10 모노테르페노이드입니다.',
   'C5 단위 두 개가 하나의 C10 골격을 이룹니다. 색은 생합성 단위를, 가운데 결합은 두 단위의 연결을 보여줍니다.',
   '말단의 –OH는 게라니올이 1차 알코올임을 보여줍니다. GPP → 게라니올 전환에서는 탄소 수의 변화 없이 이인산기가 알코올로 바뀝니다.'
  ],
  aria:'게라니올: 두 C5 단위가 머리-꼬리 방식으로 연결된 C10 비고리형 1차 알코올. 오른쪽 끝에 하이드록실기가 있습니다.',
  legend:['C5 단위 A','C5 단위 B','알코올 · –OH'],
  math:'2 × C5 → C10',mod:'이인산기 → 알코올 · geraniol synthase',
  precursor:'전구체',scent:'향 성분',aroma:'장미 / 시트로넬라',
  scentNote:'장미와 시트로넬라 정유에 포함된 성분입니다.',source:'반응 참고 문헌',
  hint:'다른 보기도 눌러 보세요',
 }
};

function structureSVG(c){
 return `<svg class="xray-molecule" viewBox="60 60 650 220" role="img" aria-label="${c.aria}">
  <g class="xray-unit-glow xray-unit-b" aria-hidden="true">
   <path d="M97.7 246.8 166.2 203.8 237.7 241.6 306.2 198.6 M166.2 203.8 163.3 123"/>
  </g>
  <g class="xray-unit-glow xray-unit-a" aria-hidden="true">
   <path d="M377.7 236.4 446.2 193.4 517.7 231.3 586.2 188.3 M446.2 193.4 443.3 112.6"/>
  </g>
  <g class="xray-oh-glow" aria-hidden="true"><circle cx="663" cy="226" r="30"/><path d="M586.2 188.3 644 219"/></g>
  <g class="xray-bonds" fill="none" stroke-linecap="round" stroke-linejoin="round">
   <g class="xray-unit-b">
    <path d="M97.7 246.8 166.2 203.8 237.7 241.6 306.2 198.6 M178.1 196.3 237.2 227.6 M166.2 203.8 163.3 123"/>
   </g>
   <path class="xray-joining-bond" d="M306.2 198.6 377.7 236.4"/>
   <g class="xray-unit-a">
    <path d="M377.7 236.4 446.2 193.4 517.7 231.3 586.2 188.3 M458.1 186 517.2 217.3 M446.2 193.4 443.3 112.6"/>
   </g>
   <path class="xray-oh-bond" d="M586.2 188.3 644 219"/>
  </g>
  <g class="xray-carbon-dots" aria-hidden="true">
   <g class="xray-unit-b"><circle cx="97.7" cy="246.8" r="4.5"/><circle cx="166.2" cy="203.8" r="4.5"/><circle cx="237.7" cy="241.6" r="4.5"/><circle cx="306.2" cy="198.6" r="4.5"/><circle cx="163.3" cy="123" r="4.5"/></g>
   <g class="xray-unit-a"><circle cx="377.7" cy="236.4" r="4.5"/><circle cx="446.2" cy="193.4" r="4.5"/><circle cx="517.7" cy="231.3" r="4.5"/><circle cx="586.2" cy="188.3" r="4.5"/><circle cx="443.3" cy="112.6" r="4.5"/></g>
  </g>
  <text class="xray-oh-label" x="649" y="235" aria-hidden="true">OH</text>
  <g class="xray-unit-tags" aria-hidden="true">
   <g class="xray-unit-b"><rect x="210" y="76" width="60" height="28" rx="14"/><text x="240" y="95">C5</text></g>
   <g class="xray-unit-a"><rect x="487" y="65" width="60" height="28" rx="14"/><text x="517" y="84">C5</text></g>
  </g>
 </svg>`;
}

export function renderGeraniolXray(lang='en'){
 const language=lang==='ko'?'ko':'en',c=copy[language];
 return `<article class="geraniol-xray" data-xray-view="units" data-xray-language="${language}" aria-label="${c.explore}">
  <div class="xray-catalogue"><span><i aria-hidden="true"></i>${c.atlas}</span><span>NO. 002</span></div>
  <div class="xray-heading"><div><strong>${c.name}</strong><span>C₁₀H₁₈O</span></div><span class="xray-kind">${c.kind}</span></div>
  <div class="xray-toolbar" role="group" aria-label="${c.explore}">${['raw','units','modification'].map((mode,i)=>`<button type="button" data-xray-mode="${mode}" aria-pressed="${mode==='units'}">${c.modes[i]}</button>`).join('')}</div>
  <div class="xray-stage">${structureSVG(c)}<span class="xray-equation" aria-hidden="true">${c.math}</span><span class="xray-modification-badge" aria-hidden="true">${c.mod}</span></div>
  <div class="xray-legend" aria-label="${language==='ko'?'강조 색상 범례':'Highlight colour key'}"><span class="xray-key-a"><i aria-hidden="true"></i>${c.legend[0]}</span><span class="xray-key-b"><i aria-hidden="true"></i>${c.legend[1]}</span><span class="xray-key-oh"><i aria-hidden="true"></i>${c.legend[2]}</span></div>
  <p class="xray-description" aria-live="polite" aria-atomic="true">${c.descriptions[1]}</p>
  <div class="xray-context"><div><small>${c.precursor}</small><span>GPP <b aria-hidden="true">→</b> ${c.name}</span></div><div title="${c.scentNote}"><small>${c.scent}</small><span class="xray-aroma"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19v-6m0 1c-8 0-8-7-3-7-1-6 7-6 6 0 5 0 5 7-3 7Zm0 5c-4 0-6-2-6-4 4-1 6 1 6 4Zm0 0c4 0 6-2 6-4-4-1-6 1-6 4Z"/></svg>${c.aroma}</span></div></div>
  <div class="xray-footnote"><span>${c.hint}</span><a href="https://iubmb.qmul.ac.uk/enzyme/EC3/1/7/11.html" target="_blank" rel="noopener noreferrer">${c.source} ↗</a></div>
 </article>`;
}

export function bindGeraniolXray(root=document){
 root.querySelectorAll('.geraniol-xray').forEach(card=>{
  const c=copy[card.dataset.xrayLanguage]||copy.en;
  card.querySelectorAll('[data-xray-mode]').forEach(button=>button.addEventListener('click',()=>{
   const mode=button.dataset.xrayMode;
   card.dataset.xrayView=mode;
   card.querySelectorAll('[data-xray-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   card.querySelector('.xray-description').textContent=c.descriptions[['raw','units','modification'].indexOf(mode)];
  }));
 });
}
