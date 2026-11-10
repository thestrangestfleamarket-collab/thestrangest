// THE STOW: in a room off the map, the street's places and things its windows cannot show (all of them with no window out; past the haze range of where it stands with one) let go of their painted pictures and their copy on the graphics card, put back on the way out.
import {THREE} from './003-shx.js';
import {BATCH, NPCS, ROOMS, VIS, W3} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {FADE, SYS, TILE} from './006-map-pre.js';
{ const S=new Map(), BX=new Map(), MIN=64*64; let t0=0, back=null;
  const boxOf=g=>{ let b=BX.get(g); if(!b){ b=new THREE.Box3().setFromObject(g); BX.set(g,b); } return b; };
  const far=(g,a)=>{ if(!a)return true; const K=BATCH.reach()[1]; if(!(K<Infinity))return false; const b=boxOf(g); return Math.hypot(Math.max(b.min.x-a.x,0,a.x-b.max.x),Math.max(b.min.z-a.z,0,a.z-b.max.z))>K+8*TILE; };
  const mats=o=>[].concat(o.material||[]);
  const texs=m=>{ const L=[]; for(const k in m){ const t=m[k]; if(t&&t.isTexture)L.push(t); } return L; };
  const used=skip=>{ const T=new Set(), G=new Set(); scene.traverse(o=>{ for(let q=o;q;q=q.parent)if(skip.has(q))return; if(o.geometry)G.add(o.geometry); for(const m of mats(o))for(const t of texs(m))T.add(t); }); return [T,G]; };
  const stow=L=>{ '@later'; const [UT,UG]=used(new Set([...S.keys(),...L]));
    for(const g of L){ const R={tex:[],geo:new Set()}; S.set(g,R); VIS.hide(g,'stow'); const seen=new Set();
      g.traverse(o=>{ if(o.geometry&&!UG.has(o.geometry))R.geo.add(o.geometry); for(const m of mats(o))for(const t of texs(m)){ const c=t.image; if(seen.has(t)||UT.has(t)||!c||!(c instanceof HTMLCanvasElement)||c.width*c.height<MIN)continue; seen.add(t); R.tex.push({t,c,w:c.width,h:c.height,blob:null}); } });
      for(const G of R.geo)G.dispose();
      for(const e of R.tex){ e.t.dispose(); e.c.toBlob(b=>{ if(S.get(g)!==R||!b)return; e.blob=b; e.c.width=e.c.height=1; },'image/png'); } } };
  const unstow=async g=>{ '@later'; const R=S.get(g); if(!R)return; S.delete(g);
    await Promise.all(R.tex.map(async e=>{ if(!e.blob)return; const bm=await createImageBitmap(e.blob); e.c.width=e.w; e.c.height=e.h; e.c.getContext('2d').drawImage(bm,0,0); bm.close(); e.t.needsUpdate=true; }));
    for(const e of R.tex)renderer.initTexture(e.t); VIS.hide(g,'stow',false); };
  ROOMS.unstow=()=>back||(S.size?back=Promise.all([...S.keys()].map(unstow)).finally(()=>{ back=null; }):null);
  const gb=G=>{ let b=G.index?G.index.array.byteLength:0; for(const k in G.attributes){ const a=G.attributes[k]; b+=(a.isInterleavedBufferAttribute?a.data.array:a.array).byteLength; } return b; };
  ROOMS.stowed=()=>[...S].map(([g,R])=>({name:g.name,pics:R.tex.reduce((n,e)=>n+(e.blob?e.w*e.h*4:0),0),shape:[...R.geo].reduce((n,G)=>n+gb(G),0)}));   // what each place let go of: its pictures' bytes, its shape's bytes on the graphics card
  SYS.add('places',()=>{ if(back||FADE.busy||!SYS.started)return; const id=ROOMS.offIn();
    if(!id){ if(S.size)ROOMS.unstow(); return; }
    if(performance.now()-t0<1000)return; t0=performance.now(); const a=ROOMS.real();
    for(const g of [...S.keys()])if(!far(g,a))unstow(g);
    const me=new Set([W3.group,...NPCS.map(N=>N.g),...(NPCS.extra||[]).map(X=>X&&X.g)]);
    const L=scene.children.filter(g=>(g.isGroup||g.isMesh)&&!S.has(g)&&!me.has(g)&&(VIS.hidden(g,'off')||VIS.hidden(g,'room'))&&far(g,a)); if(L.length)stow(L); },'130b-stow'); }
