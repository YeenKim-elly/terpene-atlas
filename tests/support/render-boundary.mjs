// A small DOM boundary for exercising the actual page renderers and callbacks.
// It checks markup and control behaviour; it does not model browser layout.
const decode=s=>s.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
function attributes(text) {
 const result={};
 for(const match of text.matchAll(/([:\w-]+)(?:="([^"]*)"|='([^']*)'|=([^\s>]+))?/g))result[match[1]]=decode(match[2]??match[3]??match[4]??'');
 return result;
}
function matches(tag,attrs,selector) {
 if(selector.includes(','))return selector.split(',').some(s=>matches(tag,attrs,s.trim()));
 if(selector.includes(':not(:disabled)')&&Object.hasOwn(attrs,'disabled'))return false;
 selector=selector.replace(':not(:disabled)','');
 const tagMatch=selector.match(/^[a-z]+/i);
 if(tagMatch&&tagMatch[0].toLowerCase()!==tag.toLowerCase())return false;
 const id=selector.match(/#([\w-]+)/);
 if(id&&attrs.id!==id[1])return false;
 for(const [,name]of selector.matchAll(/\.([\w-]+)/g))if(!(attrs.class||'').split(/\s+/).includes(name))return false;
 for(const [,key,value]of selector.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)){
  if(!Object.hasOwn(attrs,key)||(value!==undefined&&attrs[key]!==value))return false;
 }
 return Boolean(tagMatch||id||selector.includes('.')||selector.includes('['));
}
export class RenderBoundary {
 constructor(attrs={}){this.attrs=attrs;this.cache=new Map();this.extra=[];this.html='';this.style={};this.value=attrs.value||'';this.textContent='';this.tagName='DIV';this.isConnected=true;this.dataset=Object.fromEntries(Object.entries(attrs).filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v]));}
 set innerHTML(value){this.html=value;this.cache.clear();this.extra=[];}
 get innerHTML(){return this.html;}
 getMarkup(){return this.html+[...this.cache.values(),...this.extra].map(x=>x.html).join('');}
 querySelectorAll(selector){
  const source=this.getMarkup(),nodes=[];
  for(const match of source.matchAll(/<([a-z][\w:-]*)\b([^>]*)>/gi)){
   const attrs=attributes(match[2]);
   if(!matches(match[1],attrs,selector))continue;
   const key=match.index+':'+match[0];
   if(!this.cache.has(key)){const node=new RenderBoundary(attrs);node.tagName=match[1].toUpperCase();node.parent=this;this.cache.set(key,node);}
   nodes.push(this.cache.get(key));
  }
  return nodes;
 }
 querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
 focus(){}
 click(){this.onclick?.({target:this,preventDefault(){}});}
 append(child){child.parent=this;this.extra.push(child);}
 remove(){if(this.parent)this.parent.extra=this.parent.extra.filter(x=>x!==this);}
 setAttribute(key,value){this.attrs[key]=String(value);}
}
export function installRenderBoundary(){
 const body=new RenderBoundary(),storage=new Map();
 globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
 globalThis.window={scrollTo(){}};
 globalThis.document={
  documentElement:{lang:'en'},activeElement:null,body,
  createElement:()=>new RenderBoundary(),
  addEventListener(){},
  querySelector(selector){return body.extra.find(x=>selector==='#'+x.id)||body.querySelector(selector);},
  querySelectorAll:selector=>body.querySelectorAll(selector)
 };
}
