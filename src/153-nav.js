// THE NAV: NAV builds the walking navmesh the town's people find their way on.
import {SHARED} from './003-shx.js';
import {CITY, PONDS, ROOMS} from './003b-systems.js';
import {MODS, QS, SOL, TILE} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
import {CSB, CSHOLE, STHOLE} from './076-npc-map.js';
const NAV=window.NAV={on:QS.get('nav')!=='0', ready:false, lib:null, M:{}, n:{nav:0,a:0,bad:0,ms:0}};
{
  const T=TILE, CORE='https://cdn.jsdelivr.net/npm/@recast-navigation/core@0.43.1/+esm', GEN='https://cdn.jsdelivr.net/npm/@recast-navigation/generators@0.43.1/+esm';
  const CS=CITY.R0/2, CH=.1*T, BH=2*T;
  const inB=(lv,R)=>{ const B=CITY.bounds(lv), o=[]; for(const r of R){ const x0=Math.max(B[0],Math.min(r[0],r[2])), z0=Math.max(B[1],Math.min(r[1],r[3])), x1=Math.min(B[2],Math.max(r[0],r[2])), z1=Math.min(B[3],Math.max(r[1],r[3])); if(x1>x0&&z1>z0)o.push([x0,z0,x1,z1]); } return o; };   // only what lies in the mesh's own bounds: the insides off the map would stretch recast's grid until it runs out of memory
  const rects=(lv,street)=>inB(lv,rects0(lv,street));
  const rects0=(lv,street)=>{ const R=(SOL[lv]||[]).concat((CITY.extra&&CITY.extra[lv])||[]).map(b=>[b[0],b[1],b[2],b[3]]); if(lv!=='up')return R;
    R.push(STHOLE.slice(0,4)); if(FOUNT.S)R.push(...FOUNT.S.strips); R.push(...PONDS.strips); if(!street)return R;
    R.push(CSHOLE.slice(0,4)); R.push(CSB.slice(0,4));
    for(const b of ROOMS.boxes())if(b.y0<1)R.push([b.x0,b.z0,b.x1,b.z1]);
    if(MODS.apts&&MODS.apts.A){ const A=MODS.apts.A; R.push([SHARED.BOD.X(A.x0),SHARED.BOD.Z(A.y0),SHARED.BOD.X(A.x1),SHARED.BOD.Z(A.y1)]); }
    return R; };
  const sig=(lv,street)=>(SOL[lv]||[]).length+'+'+((CITY.extra&&CITY.extra[lv])||[]).length+':'+(street?ROOMS.boxes().length:0)+':'+CITY.bounds(lv).map(v=>Math.round(v)).join(',');
  const WORKER=`let L=null; const ok=Promise.all([import('${CORE}'),import('${GEN}')]).then(async([c,g])=>{ await c.init(); L={exportNavMesh:c.exportNavMesh,generateTiledNavMesh:g.generateTiledNavMesh}; });
onmessage=async e=>{ const {id,R,B,cfg,bh}=e.data, P=[], I=[]; try{ await ok; }catch(err){ postMessage({id,err:'recast did not load: '+err}); return; } const {exportNavMesh,generateTiledNavMesh}=L;
  const v=(x,y,z)=>{ P.push(x,y,z); return P.length/3-1; }, q=(a,b,c,d)=>I.push(a,c,b,a,d,c);
  { const a=v(B[0],0,B[1]),b=v(B[2],0,B[1]),c=v(B[2],0,B[3]),d=v(B[0],0,B[3]); q(a,b,c,d); }
  for(const r of R){ const x0=Math.min(r[0],r[2]),z0=Math.min(r[1],r[3]),x1=Math.max(r[0],r[2]),z1=Math.max(r[1],r[3]); const c=[]; for(const y of [-.1,bh])c.push(v(x0,y,z0),v(x1,y,z0),v(x1,y,z1),v(x0,y,z1));
    q(c[4],c[5],c[6],c[7]); q(c[1],c[0],c[4],c[5]); q(c[2],c[1],c[5],c[6]); q(c[3],c[2],c[6],c[7]); q(c[0],c[3],c[7],c[4]); }
  const t0=performance.now(); let r; try{ r=generateTiledNavMesh(P,I,cfg); }catch(err){ postMessage({id,err:String(err)}); return; }
  if(!r.success){ postMessage({id,err:String(r.error||'failed')}); return; } const bin=exportNavMesh(r.navMesh).slice(); r.navMesh.destroy();
  postMessage({id,bin,ms:performance.now()-t0,tris:I.length/3},[bin.buffer]); };`;
  const CFG={cs:CS,ch:CH,tileSize:64,walkableRadius:3,walkableHeight:Math.ceil(T/CH),walkableClimb:2,walkableSlopeAngle:45};
  let W=null, wid=0; const pend=new Map();
  const worker=()=>{ if(W!==null)return W; try{ W=new Worker(URL.createObjectURL(new Blob([WORKER],{type:'text/javascript'})));
      W.onmessage=e=>{ const f=pend.get(e.data.id); pend.delete(e.data.id); f&&f(e.data); }; W.onerror=e=>{ console.warn('NAV: the worker failed, routes stay the A*',e.message||e); NAV.on=false; }; }
    catch(e){ console.warn('NAV: no worker, routes stay the A*',e); W=false; NAV.on=false; } return W; };
  const build=(lv,street)=>{ const k=lv+(street?':st':''), s=sig(lv,street), M=NAV.M[k]; if(M&&(M.sig===s||M.busy===s||M.failed===s))return; const w=worker(); if(!w)return;
    const id=++wid, B=CITY.bounds(lv); (NAV.M[k]=M||{}).busy=s; pend.set(id,d=>{ const m=NAV.M[k]; m.busy=null;
      if(d.err){ console.warn('NAV: the mesh for',k,'failed:',d.err); m.failed=s; return; }
      let r=null; try{ r=NAV.lib.importNavMesh(d.bin); }catch(e){} if(!r||!r.navMesh){ console.warn('NAV: the mesh for',k,'did not load'); m.failed=s; return; }
      if(m.q){ m.q.destroy(); m.mesh.destroy(); } m.mesh=r.navMesh; m.q=new NAV.lib.NavMeshQuery(r.navMesh); m.sig=s; m.ms=Math.round(d.ms); m.tris=d.tris; m.bytes=d.bin.length; });
    w.postMessage({id,R:rects(lv,street),B,cfg:CFG,bh:BH}); };
  NAV.load=()=>{ if(!NAV.on||NAV.lib)return; NAV.lib=true;
    import(CORE).then(async m=>{ await m.init(); NAV.lib=m; NAV.ready=true; build('up',false); build('up',true); build('down',false); })
      .catch(e=>{ console.warn('NAV: recast did not load, routes stay the A*',e); NAV.lib=null; NAV.on=false; }); };
  const HE={x:2*CS*4,y:T,z:2*CS*4};
  NAV.route=(lv,a,b,free)=>{ '@later'; if(!NAV.ready)return null; const street=lv==='up'&&typeof STFREE!=='undefined'&&free===STFREE, k=lv+(street?':st':''), M=NAV.M[k];
    build(lv,street); if(!M||!M.q||M.sig!==sig(lv,street))return null;
    const t0=performance.now(), r=M.q.computePath({x:a.x,y:0,z:a.z},{x:b.x,y:0,z:b.z},{halfExtents:HE,maxPathPolys:4096,maxStraightPathPoints:1024});
    if(!r.success||!r.path||r.path.length<2)return null;
    const S=r.path[0], E=r.path[r.path.length-1]; if(Math.hypot(S.x-a.x,S.z-a.z)>2*T||Math.hypot(E.x-b.x,E.z-b.z)>2*T)return null;
    const pts=[{x:a.x,z:a.z},...r.path.map(p=>({x:p.x,z:p.z})),{x:b.x,z:b.z}].filter((p,i,A)=>!i||Math.hypot(p.x-A[i-1].x,p.z-A[i-1].z)>1e-4);
    for(let i=1;i<pts.length-2;i++){ const p=pts[i], q=pts[i+1]; if(Math.hypot(q.x-p.x,q.z-p.z)<1e-4)continue; if(!CITY.clear(lv,p,q,free)){ NAV.n.bad++; NAV.last={lv,k,p,q,i,n:pts.length}; return null; } }
    let len=0; for(let i=1;i<pts.length;i++)len+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z); NAV.n.ms+=performance.now()-t0; NAV.n.nav++;
    return {lv,pts,len,cells:pts.length,nav:true}; };
  const ASTAR=CITY.route; CITY.route=(lv,a,b,free,own)=>{ if(!own&&NAV.on){ const r=NAV.route(lv,a,b,free); if(r){ CITY.ms=NAV.n.ms/NAV.n.nav; return r; } } NAV.n.a++; return ASTAR(lv,a,b,free); };
  NAV.stats=()=>({ready:NAV.ready,meshes:Object.fromEntries(Object.entries(NAV.M).map(([k,m])=>[k,{ms:m.ms,tris:m.tris,kb:m.bytes&&Math.round(m.bytes/1024),busy:!!m.busy,failed:!!m.failed}])),routes:{nav:NAV.n.nav,astar:NAV.n.a,failedCheck:NAV.n.bad,navAvgMs:NAV.n.nav?+(NAV.n.ms/NAV.n.nav).toFixed(2):null}});
}
export {NAV};
