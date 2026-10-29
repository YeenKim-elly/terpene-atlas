import {icon} from './icons.js';

// Expand within the browser viewport so the same view works in embedded apps.
export function createWebViewport({stage,button,enterLabel,exitLabel,onBeforeChange=()=>{},onChange}){
 let expanded=false,destroyed=false,previousOverflow='';
 function update(value,focus=true){
  if(destroyed||expanded===value)return;
  onBeforeChange(value);
  expanded=value;
  if(value){previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}
  else document.body.style.overflow=previousOverflow;
  stage.classList.toggle('is-expanded',value);
  stage.setAttribute('role',value?'dialog':'region');
  if(value)stage.setAttribute('aria-modal','true');else stage.removeAttribute('aria-modal');
  button.setAttribute('aria-pressed',String(value));
  button.setAttribute('aria-label',value?exitLabel:enterLabel);
  button.title=value?exitLabel:enterLabel;
  button.innerHTML=icon(value?'minimize':'expand');
  onChange(value);
  if(focus&&button.isConnected)button.focus({preventScroll:true});
 }
 function close(){update(false);}
 function keydown(event){
  if(!expanded)return;
  if(event.key==='Escape'){event.preventDefault();close();return;}
  if(event.key!=='Tab')return;
  const focusable=[...stage.querySelectorAll('button:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]')]
   .filter(el=>el.getClientRects().length);
  const first=focusable[0],last=focusable.at(-1),current=document.activeElement;
  if(!first)return;
  if(!stage.contains(current)){event.preventDefault();first.focus();}
  else if(event.shiftKey&&current===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&current===last){event.preventDefault();first.focus();}
 }
 const toggle=()=>update(!expanded);
 button.addEventListener('click',toggle);
 document.addEventListener('keydown',keydown);
 return {
  close,
  get expanded(){return expanded;},
  destroy(){
   if(destroyed)return;
   destroyed=true;
   button.removeEventListener('click',toggle);
   document.removeEventListener('keydown',keydown);
   if(expanded){document.body.style.overflow=previousOverflow;stage.classList.remove('is-expanded');}
  }
 };
}
