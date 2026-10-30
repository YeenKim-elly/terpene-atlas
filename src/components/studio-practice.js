const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

const drawings = {
  family: `<g class="preview-framework" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m24 40 22-13 22 13v26L46 79 24 66Z"/><path d="m68 40 22-13 22 13v26L90 79 68 66"/><path d="M46 27V13m44 14 13-19M24 66 11 74m101-8 14 8"/></g><g class="preview-annotations"><path d="M68 40v26" stroke="var(--studio-emerald,#10b981)" stroke-width="5" stroke-linecap="round"/><circle cx="68" cy="40" r="4"/><circle cx="68" cy="66" r="4"/><text x="145" y="48">C₁₀</text><text class="annotation-sub" x="145" y="67">C₁₅ · C₂₀ · C₄₀</text></g>`,
  precursor: `<g class="preview-block preview-block-a"><rect x="10" y="23" width="82" height="53" rx="14"/><path d="m25 58 13-17 16 17 15-17 12 17m-27 0v10"/><text x="37" y="92">C₅</text></g><path class="preview-link" d="M100 49h16m-5-5 5 5-5 5"/><g class="preview-block preview-block-b"><rect x="124" y="23" width="82" height="53" rx="14"/><path d="m139 58 13-17 16 17 15-17 12 17m-27 0v10"/><text x="151" y="92">C₅</text></g>`,
  motif: `<g class="preview-framework" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"><path d="m13 66 30-18 30 18 30-18 30 18 26-16"/><path d="M103 48V24m6 22V24"/></g><g class="preview-functional"><circle cx="165" cy="47" r="23"/><text x="147" y="54">OH</text><text x="99" y="19">O</text><path d="M184 61 198 76h20"/></g><text class="preview-caption" x="195" y="94">−OH</text>`,
  enzyme: `<g class="preview-enzyme"><path d="M11 42c0-13 16-27 33-25 19 3 19 17 34 17v30c-16 0-15 16-34 16C24 80 11 65 11 52Z"/><path d="M42 42h29v15H42Z"/></g><g class="preview-reaction"><path d="M92 49h39m-8-8 8 8-8 8"/><path d="m150 65 18-30 19 30 18-30"/><text x="153" y="23">+ O</text></g><text class="preview-caption" x="98" y="91">TRANSFORM</text>`,
  scaffold: `<g class="preview-framework" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"><path d="m25 38 24-14 24 14v28L49 80 25 66Z"/><path d="m73 38 24-14 24 14v28L97 80 73 66"/><path d="M73 38v28" stroke="#10b981" stroke-width="5"/><path d="m145 38 24-14 24 14v28l-24 14-24-14Z"/><path d="M145 38 193 66m0-28-48 28" stroke="#f59e0b"/></g>`,
  comparison: `<g class="preview-framework" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m16 65 21-30 22 30 22-30m58 30 21-30 22 30"/><path d="M177 63 191 43" stroke="#f43f5e"/></g><text x="191" y="41" class="preview-functional">OH</text><path class="preview-link" d="M92 50h32m-6-6 6 6-6 6"/>`
};

/** A practice selector; activation selects a mode before the session is launched. */
export function renderStudioModeCard({mode, title, description, count, selected = false, expanded = false, panelId, lang = 'en'} = {}) {
  const safeMode = Object.hasOwn(drawings, mode) ? mode : 'family';
  const ko = lang === 'ko';
  const action = expanded ? (ko ? '연습 설정 접기' : 'Close session options') : (ko ? '연습 설정 열기' : 'Set up practice');
  return `<button type="button" class="mode-card studio-card studio-card--${safeMode}${selected ? ' active' : ''}" data-mode="${escapeHTML(mode)}" aria-pressed="${Boolean(selected)}" aria-expanded="${Boolean(expanded)}"${panelId ? ` aria-controls="${escapeHTML(panelId)}"` : ''}>
    <span class="studio-card-preview" aria-hidden="true"><svg viewBox="0 0 230 106" focusable="false">${drawings[safeMode]}</svg></span>
    <span class="check" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none"><path d="m4 8 2.5 2.5L12 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <span class="studio-card-content"><span class="studio-card-title" id="practice-mode-title-${safeMode}">${escapeHTML(title)}</span><span class="studio-card-description">${escapeHTML(description)}</span></span>
    <span class="studio-card-bottom"><span class="studio-card-action">${action}<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="m5 7 4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="count">${escapeHTML(count)}</span></span>
  </button>`;
}
