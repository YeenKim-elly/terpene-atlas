// Local SVG icons: no icon font, remote asset or runtime dependency.
const paths = {
 hex:'<path d="m12 2.5 8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5Z"/><path d="m12 7 4.3 2.5v5L12 17l-4.3-2.5v-5Z"/>',
 practice:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM8 12l2 2 5-5M8 18h7"/>',
 library:'<path d="M3 4h4v16H3zM9.5 4h4v16h-4zM16 5l3-.7 3 15-3 .7Z"/><path d="M3 8h4m2.5 0h4"/>',
 notes:'<path d="M6 3h10l4 4v14H6Z"/><path d="M16 3v5h4M3 7h4M3 12h4M3 17h4M10 12h6M10 16h6"/>',
 skeleton:'<path d="m12 4 7 4v8l-7 4-7-4V8Z"/><path d="M12 4V2M19 8l3-1M5 16l-3 1"/>',
 motif:'<path d="M3 12h6l6.8-5.3M9 12l6.8 5.3"/><circle cx="18" cy="5" r="2.2"/><circle cx="18" cy="19" r="2.2"/>',
 enzyme:'<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M8 15h8"/><circle cx="12" cy="18" r=".65" fill="currentColor" stroke="none"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
 back:'<path d="M20 12H4m6-6-6 6 6 6"/>',
 bulb:'<path d="M8 16c0-2.2-3-3.6-3-7a7 7 0 0 1 14 0c0 3.4-3 4.8-3 7M8 17h8M9 21h6"/>',
 trophy:'<path d="M7 3h10v7a5 5 0 0 1-10 0ZM7 5H3v3a4 4 0 0 0 4 4M17 5h4v3a4 4 0 0 1-4 4M12 15v6M7 21h10"/>',
 leaf:'<path d="M20 4C10 3 3 8 4 16c1 5 8 6 12 1 3-4 3-8 4-13Z"/><path d="M4 21 16 9M9 16v-5M12 13h5"/>',
 eye:'<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
 bolt:'<path d="m14 2-10 12h7l-1 8 10-12h-7Z"/>',
 network:'<path d="m6 6 4 4m4 0 4-4M6 18l4-4m4 0 4 4"/><circle cx="12" cy="12" r="3"/><circle cx="4" cy="4" r="2"/><circle cx="20" cy="4" r="2"/><circle cx="4" cy="20" r="2"/><circle cx="20" cy="20" r="2"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 learn:'<path d="M6 18 18 6M7 6h11v11"/>',
 assisted:'<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0 0 16Z" fill="currentColor" stroke="none"/>',
 plus:'<path d="M5 12h14M12 5v14"/>',
 expand:'<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"/>',
 minimize:'<path d="M3 8h5V3M16 3v5h5M21 16h-5v5M8 21v-5H3"/>',
 minus:'<path d="M5 12h14"/>'
};
export function icon(name){
 const key=Object.hasOwn(paths,name)?name:'hex';
 return '<svg class="atlas-icon" data-icon="'+key+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+paths[key]+'</svg>';
}
