import {icon as I} from './icons.js';
import {t, getLanguage} from '../lib/i18n.js';

export const navigation = [
  ['practice', 'practice', ['Practice', '연습하기']],
  ['library', 'library', ['Reference library', '구조 라이브러리']],
  ['web', 'network', ['Structure web', '구조 연결망']],
  ['compare', 'motif', ['Compare structures', '구조 비교']],
  ['sources', 'learn', ['Sources & guidance', '출처와 학습 안내']]
];

const botanical = '<svg class="botanical" viewBox="0 0 120 110" fill="none" stroke="currentColor" stroke-width="1.1" aria-hidden="true"><path d="M44 105Q75 57 80 7M59 78Q23 70 31 45Q59 49 59 78ZM68 54Q42 40 50 22Q75 28 68 54ZM74 37Q94 12 109 21Q108 43 74 37ZM61 74Q91 48 104 63Q98 86 61 74ZM43 102Q20 91 18 75Q41 76 43 102Z"/></svg>';

export function shellHTML(view) {
  const title = navigation.find(([id]) => id === view)?.[2] || navigation[0][2];
  return '<div class="shell"><aside class="sidebar">' +
    '<a href="#practice" class="brand" data-nav="practice" aria-label="Terpene Atlas home">' +
    '<span class="brand-mark"><img src="assets/branding/atlas-mark.svg" alt="" width="36" height="36"></span>' +
    '<span class="brand-name">terpene<span>atlas</span></span></a>' +
    '<div class="side-caption">' + t('STRUCTURE · CHEMISTRY · DISCOVERY', '구조 · 화학 · 발견') + '</div>' +
    '<nav class="nav" aria-label="' + t('Main navigation', '주 메뉴') + '">' +
    navigation.map(([id, icon, label]) => '<button data-nav="' + id + '" class="' +
      (view === id ? 'active' : '') + '" aria-label="' + t(...label) + '"' +
      (view === id ? ' aria-current="page"' : '') + '>' + I(icon) + t(...label) + '</button>').join('') +
    '</nav><div class="side-bottom">' + botanical + '<p>' +
    t('From the carbon skeleton<br>to the finishing touches.', '탄소 골격부터<br>마지막 구조 변화까지.') +
    '</p><div class="version"><span class="dot"></span> ATLAS / 01</div></div></aside>' +
    '<div class="app-content"><header class="topbar"><div class="breadcrumb">Terpene Atlas <span>/</span><strong>' +
    t(...title) + '</strong></div><div class="top-actions"><span class="top-status"><span class="dot"></span>' +
    t('A space for your curiosity', '분자에 대한 호기심을 키우는 공간') +
    '</span><div class="lang" role="group" aria-label="' + t('Language', '언어') + '">' +
    ['en', 'ko'].map(language => '<button data-lang="' + language + '" class="' +
      (getLanguage() === language ? 'selected' : '') + '" aria-pressed="' + (getLanguage() === language) + '">' +
      (language === 'en' ? 'EN' : '한국어') + '</button>').join('') +
    '</div></div></header><main class="main" id="main" tabindex="-1"><div id="page-root"></div>' +
    '<footer class="footer"><span>' +
    t('Made for curious minds. Rooted in chemistry.', '호기심을 위한 연습. 화학에 근거한 학습.') +
    '</span><button data-nav="sources">IUPAC · PubChem · ' + t('Primary literature', '원문 문헌') +
    ' ↗</button></footer></main></div></div>';
}
