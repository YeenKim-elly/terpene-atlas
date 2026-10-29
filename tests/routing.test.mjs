import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTestCatalogue} from './support/catalogue.mjs';
import {routeGraph,overlaps,NODE_WIDTH,NODE_HEIGHT} from '../src/lib/network-routing.js';
import {restoreGraphLayout} from '../src/pages/structure-web.js';
const {graphs}=await loadTestCatalogue();
const boxes=g=>g.nodes.map(([id,x,y])=>({id,x,y,w:NODE_WIDTH,h:NODE_HEIGHT}));
function crosses(a,b,r){
 if(a.x===b.x)return a.x>r.x+.01&&a.x<r.x+r.w-.01&&Math.max(a.y,b.y)>r.y+.01&&Math.min(a.y,b.y)<r.y+r.h-.01;
 if(a.y===b.y)return a.y>r.y+.01&&a.y<r.y+r.h-.01&&Math.max(a.x,b.x)>r.x+.01&&Math.min(a.x,b.x)<r.x+r.w-.01;
 throw Error('Diagonal connection');
}
function validate(g){
 const out=routeGraph(g),nodes=boxes(g);
 assert.equal(out.routes.length,g.edges.length);
 for(const r of out.routes){
  assert.ok(r.points.length>=2&&r.label.lines.length);
  assert.ok(r.label.x>=0&&r.label.y>=0&&r.label.x+r.label.w<=g.width&&r.label.y+r.label.h<=g.height);
  for(let i=1;i<r.points.length;i++)for(const n of nodes)assert.ok(!crosses(r.points[i-1],r.points[i],n),'Line intersects '+n.id);
  for(const n of nodes)assert.ok(!overlaps(r.label,n,4),'Label intersects '+n.id);
  for(const other of out.routes)for(let i=1;i<other.points.length;i++)assert.ok(!crosses(other.points[i-1],other.points[i],r.label),'Line intersects label');
 }
 for(let i=0;i<out.routes.length;i++)for(let j=i+1;j<out.routes.length;j++)assert.ok(!overlaps(out.routes[i].label,out.routes[j].label,2));
}
for(const [id,g]of Object.entries(graphs))test(id+': lines and labels avoid cards in default and moved layouts',()=>{
 validate(g);
 for(let i=0;i<g.nodes.length;i++)for(const [dx,dy]of [[32,0],[-32,0],[0,32],[0,-32]]){
  const copy=structuredClone(g),n=copy.nodes[i];n[1]+=dx;n[2]+=dy;
  const b={x:n[1],y:n[2],w:NODE_WIDTH,h:NODE_HEIGHT};
  if(b.x<22||b.y<22||b.x+b.w>g.width-22||b.y+b.h>g.height-22||boxes(copy).some(o=>o.id!==n[0]&&overlaps(b,o,24)))continue;
  validate(copy);break;
 }
});
test('invalid saved layouts fall back and four clerodane classes remain distinct',()=>{
 const g=graphs.carotenoids;
 assert.deepEqual(restoreGraphLayout(g,{[g.nodes[0][0]]:[-100,-100]}).nodes,g.nodes);
 assert.deepEqual(restoreGraphLayout(g,{[g.nodes[0][0]]:[g.nodes[1][1],g.nodes[1][2]]}).nodes,g.nodes);
 for(const relation of ['cis-cis','cis-trans','trans-cis','trans-trans'])assert.ok(graphs.scaffolds.edges.some(e=>e.from===(relation.startsWith('cis-')?'cis-decalin':'trans-decalin')&&e.to==='clerodane-'+relation&&e.type==='structure'));
 assert.ok(graphs.precursors.edges.some(e=>e.from==='ipp'&&e.to==='gpp'));
});
