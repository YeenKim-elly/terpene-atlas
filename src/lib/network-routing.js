function smoothPath(points){let d='M'+points[0].x+','+points[0].y;for(let i=1;i<points.length-1;i++){const a=points[i-1],b=points[i],c=points[i+1],r=Math.min(8,distance(a,b)/2,distance(b,c)/2),before={x:b.x-Math.sign(b.x-a.x)*r,y:b.y-Math.sign(b.y-a.y)*r},after={x:b.x+Math.sign(c.x-b.x)*r,y:b.y+Math.sign(c.y-b.y)*r};d+=' L'+before.x+','+before.y+' Q'+b.x+','+b.y+' '+after.x+','+after.y;}const end=points.at(-1);return d+' L'+end.x+','+end.y;}
export const NODE_WIDTH=190,NODE_HEIGHT=132;
const GAP=18,EPS=.01;
const rect=(x,y,w,h,p=0)=>({x:x-p,y:y-p,w:w+2*p,h:h+2*p});
export function overlaps(a,b,p=0){return a.x<b.x+b.w+p-EPS&&a.x+a.w>b.x-p+EPS&&a.y<b.y+b.h+p-EPS&&a.y+a.h>b.y-p+EPS;}
export function segmentHitsRect(a,b,r){
 if(Math.abs(a.x-b.x)<EPS)return a.x>r.x+EPS&&a.x<r.x+r.w-EPS&&Math.max(a.y,b.y)>r.y+EPS&&Math.min(a.y,b.y)<r.y+r.h-EPS;
 if(Math.abs(a.y-b.y)<EPS)return a.y>r.y+EPS&&a.y<r.y+r.h-EPS&&Math.max(a.x,b.x)>r.x+EPS&&Math.min(a.x,b.x)<r.x+r.w-EPS;
 throw Error('Connection segments must be orthogonal');
}
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const inside=(p,r)=>p.x>r.x+EPS&&p.x<r.x+r.w-EPS&&p.y>r.y+EPS&&p.y<r.y+r.h-EPS;
const simplify=a=>a.filter((p,i)=>!i||i===a.length-1||!((Math.abs(a[i-1].x-p.x)<EPS&&Math.abs(p.x-a[i+1].x)<EPS)||(Math.abs(a[i-1].y-p.y)<EPS&&Math.abs(p.y-a[i+1].y)<EPS)));
class Heap{
 data=[];
 push(v){let i=this.data.push(v)-1;while(i){const p=(i-1)>>1;if(this.data[p].f<=v.f)break;this.data[i]=this.data[p];i=p;}this.data[i]=v;}
 pop(){const out=this.data[0],v=this.data.pop();if(this.data.length){let i=0;while(i*2+1<this.data.length){let c=i*2+1;if(c+1<this.data.length&&this.data[c+1].f<this.data[c].f)c++;if(this.data[c].f>=v.f)break;this.data[i]=this.data[c];i=c;}this.data[i]=v;}return out;}
}
function ports([id,x,y]){const w=NODE_WIDTH,h=NODE_HEIGHT;return[
 {id,x:x+w/2,y:y-GAP,end:{x:x+w/2,y},dir:2},
 {id,x:x+w+GAP,y:y+h/2,end:{x:x+w,y:y+h/2},dir:1},
 {id,x:x+w/2,y:y+h+GAP,end:{x:x+w/2,y:y+h},dir:2},
 {id,x:x-GAP,y:y+h/2,end:{x,y:y+h/2},dir:1}
];}
function makeGrid(graph,boxes,allPorts){
 const xs=new Set([2,graph.width-2]),ys=new Set([2,graph.height-2]);
 for(const r of boxes){xs.add(r.x);xs.add(r.x+r.w);ys.add(r.y);ys.add(r.y+r.h);}
 for(const p of allPorts){xs.add(p.x);ys.add(p.y);}
 const x=[...xs].filter(v=>v>=0&&v<=graph.width).sort((a,b)=>a-b),y=[...ys].filter(v=>v>=0&&v<=graph.height).sort((a,b)=>a-b);
 const nx=x.length,total=nx*y.length,blocked=new Uint8Array(total),neighbours=Array.from({length:total},()=>[]);
 const point=i=>({x:x[i%nx],y:y[Math.floor(i/nx)]});
 for(let i=0;i<total;i++)blocked[i]=boxes.some(r=>inside(point(i),r));
 for(let i=0;i<total;i++)if(!blocked[i]){
  const a=point(i);
  for(const j of [i%nx<nx-1?i+1:-1,i+nx<total?i+nx:-1]){
   if(j<0||blocked[j])continue;const b=point(j);if(boxes.some(r=>segmentHitsRect(a,b,r)))continue;
   const dir=i+1===j?1:2,cost=distance(a,b);
   neighbours[i].push({index:j,dir,cost});neighbours[j].push({index:i,dir,cost});
  }
 }
 return{point,neighbours,index:p=>{const ix=x.indexOf(p.x),iy=y.indexOf(p.y);return ix<0||iy<0?-1:iy*nx+ix;},blocked,total};
}
function findRoute(grid,starts,ends,boxes){
 const viable=ps=>ps.filter(p=>{const i=grid.index(p);return i>=0&&!grid.blocked[i]&&!boxes.some(r=>r.id!==p.id&&segmentHitsRect(p.end,p,r));});
 starts=viable(starts);ends=viable(ends);if(!starts.length||!ends.length)throw Error('No free connection port');
 const targets=new Map(ends.map(p=>[grid.index(p),p])),size=grid.total*3,costs=new Float64Array(size),parent=new Int32Array(size),origin=new Int16Array(size);
 costs.fill(Infinity);parent.fill(-1);origin.fill(-1);
 const heap=new Heap(),heuristic=p=>Math.min(...ends.map(t=>distance(p,t)))+GAP;
 starts.forEach((p,k)=>{const s=grid.index(p)*3+p.dir;costs[s]=GAP;origin[s]=k;heap.push({s,g:GAP,f:GAP+heuristic(p)});});
 let finish=-1;
 while(heap.data.length){
  const{s,g}=heap.pop();if(g!==costs[s])continue;const i=Math.floor(s/3),dir=s%3;
  if(targets.has(i)){finish=s;break;}
  for(const n of grid.neighbours[i]){
   const ns=n.index*3+n.dir,ng=g+n.cost+(dir&&dir!==n.dir?32:0);
   if(ng>=costs[ns])continue;costs[ns]=ng;parent[ns]=s;origin[ns]=origin[s];heap.push({s:ns,g:ng,f:ng+heuristic(grid.point(n.index))});
  }
 }
 if(finish<0)throw Error('No obstacle-free connection route');
 const points=[];let s=finish;while(s>=0){points.push(grid.point(Math.floor(s/3)));s=parent[s];}points.reverse();
 points.unshift(starts[origin[finish]].end);points.push(targets.get(Math.floor(finish/3)).end);return simplify(points);
}
function wrap(text,measure,max=198){
 const lines=[];let line='';
 for(const word of text.split(/\s+/)){const c=line?line+' '+word:word;if(line&&measure(c)>max){lines.push(line);line=word;}else line=c;}
 if(line)lines.push(line);return lines;
}
function nearest(p,points){
 let best=null;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],q=Math.abs(a.x-b.x)<EPS?{x:a.x,y:Math.max(Math.min(a.y,b.y),Math.min(Math.max(a.y,b.y),p.y))}:{x:Math.max(Math.min(a.x,b.x),Math.min(Math.max(a.x,b.x),p.x)),y:a.y};
  const d=distance(p,q);if(!best||d<best.distance)best={point:q,distance:d};
 }
 return best;
}
export function routeGraph(graph,{measureText=s=>s.length*6.8}={}){
 const boxes=graph.nodes.map(([id,x,y])=>({...rect(x,y,NODE_WIDTH,NODE_HEIGHT,GAP),id}));
 const byId=new Map(graph.nodes.map(n=>[n[0],ports(n)])),grid=makeGrid(graph,boxes,[...byId.values()].flat());
 const routes=graph.edges.map((edge,index)=>{const points=findRoute(grid,byId.get(edge.from),byId.get(edge.to),boxes);return{edge,index,points,path:smoothPath(points)};});
 const nodeRects=graph.nodes.map(([,x,y])=>rect(x,y,NODE_WIDTH,NODE_HEIGHT,9)),labels=[];
 const reserved=(graph.layers||[]).map(l=>rect(18,l.y-32,Math.min(graph.width-36,measureText(l.label)+l.label.length*1.8+35),28));
 const segments=routes.flatMap(r=>r.points.slice(1).map((p,i)=>[r.points[i],p]));
 for(const route of [...routes].sort((a,b)=>b.edge.label.length-a.edge.label.length)){
  const lines=wrap(route.edge.label,measureText),w=Math.ceil(Math.max(...lines.map(measureText)))+18,h=lines.length*15+12;
  const centre=route.points[Math.floor(route.points.length/2)];let best=null;
  function consider(x,y){
   const r=rect(Math.round(x),Math.round(y),w,h),expanded=rect(r.x,r.y,r.w,r.h,5);
   if(r.x<3||r.y<3||r.x+w>graph.width-3||r.y+h>graph.height-3)return;
   if([...nodeRects,...reserved,...labels].some(b=>overlaps(expanded,b,3)))return;
   if(segments.some(([a,b])=>segmentHitsRect(a,b,expanded)))return;
   const c={x:r.x+w/2,y:r.y+h/2},close=nearest(c,route.points),score=close.distance+distance(c,centre)*.025;
   if(!best||score<best.score)best={...r,score,lines};
  }
  for(let i=1;i<route.points.length;i++){
   const a=route.points[i-1],b=route.points[i];
   for(const f of [.5,.25,.75,0,1]){
    const x=a.x+(b.x-a.x)*f,y=a.y+(b.y-a.y)*f;
    if(Math.abs(a.y-b.y)<EPS){consider(x-w/2,y-h-10);consider(x-w/2,y+10);}
    else{consider(x+10,y-h/2);consider(x-w-10,y-h/2);}
   }
  }
  if(!best)for(let y=5;y+h<graph.height;y+=18)for(let x=5;x+w<graph.width;x+=18)consider(x,y);
  if(!best)throw Error('No readable label position: '+route.edge.label);
  route.label=best;labels.push(best);
 }
 
 for(const route of routes){
  const l=route.label,c={x:l.x+l.w/2,y:l.y+l.h/2},p=nearest(c,route.points).point;
  const q={x:Math.max(l.x,Math.min(l.x+l.w,p.x)),y:Math.max(l.y,Math.min(l.y+l.h,p.y))};
  const candidates=[[p,{x:p.x,y:q.y},q],[p,{x:q.x,y:p.y},q]];
  const valid=candidates.map(simplify).filter(points=>points.slice(1).every((b,i)=>![...nodeRects,...labels.filter(v=>v!==l)].some(box=>segmentHitsRect(points[i],b,box))));
  if(valid.length&&distance(p,q)>8)route.leader=valid[0].map((v,i)=>(i?'L':'M')+v.x+','+v.y).join(' ');
 }
 return{routes,nodeRects};
}
