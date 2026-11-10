// THE SETS: FIXIT's makers for the TVs, the home computer and the modem (in metres), and their screens; the Fixer, the little one and his shop are archived (owner, 5 Nov 2026).
import {SHARED, THREE} from './003-shx.js';
import {CINEMA, FORAGE, INSPECT} from './003b-systems.js';
import {SYS, TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
const FIXIT={}; window.FIXIT=FIXIT;
{ const T=TILE, K=MERCH.K, {mk,grp,BOX,SPH,LATHE,drape}=K;
  /* ---------- the sets, in metres (feet at 0, the screen toward +z): one maker each, used in his shop and in your apartment ---------- */
  const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.6,metalness:0,...o});
  const ctex=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); f(g,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
  const wood=()=>ctex(64,64,(g,w,h)=>{ g.fillStyle='#5a3a22'; g.fillRect(0,0,w,h); for(let y=0;y<h;y++){ g.fillStyle=`rgba(${30+Math.sin(y*.7+Math.sin(y*.13)*4)*12+20},${18+10*Math.sin(y*.3)},10,.35)`; g.fillRect(0,y,w,1); } });
  const PO=(o,x,y,z)=>{ o.position.set(x,y,z); return o; }, RB=(w,h,d,r=.015,s=3)=>new THREE.BoxGeometry(w,h,d,s,s,s);
  const round=(g,r)=>{ const p=g.attributes.position; g.computeBoundingBox(); const b=g.boundingBox, hx=(b.max.x-b.min.x)/2-r, hy=(b.max.y-b.min.y)/2-r, hz=(b.max.z-b.min.z)/2-r, v=new THREE.Vector3(), q=new THREE.Vector3();
    for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); q.set(Math.max(-hx,Math.min(hx,v.x)),Math.max(-hy,Math.min(hy,v.y)),Math.max(-hz,Math.min(hz,v.z))); const d=v.clone().sub(q); if(d.lengthSq()>1e-9)v.copy(q).add(d.normalize().multiplyScalar(r)); p.setXYZ(i,v.x,v.y,v.z); } g.computeVertexNormals(); return g; };
  const SCR=[], SMAP=new WeakMap(); const screen=(w,h)=>{ const c=document.createElement('canvas'); c.width=64; c.height=48; const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.magFilter=THREE.NearestFilter;
    const m=new THREE.Mesh(new THREE.SphereGeometry(1,16,12,-.42,.84,Math.PI/2-.32,.64),new THREE.MeshBasicMaterial({map:t,color:0xffffff})); m.scale.set(w*1.25,h*1.5,.06); m.position.z=-.055; m.userData.screen=1; const S={c,t,ch:0,on:true,m}; SMAP.set(m,S); SCR.push(S); return m; };
  const draw=(S,tm)=>{ const g=S.c.getContext('2d'), W=64, H=48; if(!S.on){ g.fillStyle='#0b0e0c'; g.fillRect(0,0,W,H); g.fillStyle='rgba(120,140,130,.15)'; g.fillRect(6,5,18,8); S.t.needsUpdate=true; return; }
    if(S.ch===0){ const im=g.createImageData(W,H); for(let i=0;i<W*H;i++){ const v=Math.random()*200|0; im.data.set([v,v,v+10,255],i*4); } g.putImageData(im,0,0); }
    else if(S.ch===1){ const C=['#c0c0c0','#c0c000','#00c0c0','#00c000','#c000c0','#c00000','#0000c0']; C.forEach((c,i)=>{ g.fillStyle=c; g.fillRect(i*W/7,0,W/7+1,H*.7); }); g.fillStyle='#101010'; g.fillRect(0,H*.7,W,H*.3); g.fillStyle='#e0e0e0'; g.font='7px monospace'; g.fillText('WMKT 7',18,H-5); }
    else if(S.ch===2&&CINEMA&&CINEMA.drawTimes){ g.fillStyle='#06101a'; g.fillRect(0,0,W,H); try{ CINEMA.drawTimes(g,W,H,4); }catch(e){} }
    else { const d=new Date(); g.fillStyle='#04203a'; g.fillRect(0,0,W,H); g.fillStyle='#f2c14e'; g.font='bold 8px monospace'; g.fillText('MARKET',4,10); g.fillStyle='#e8e8e8'; g.fillText(d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),4,24); g.fillStyle='#8ac'; g.font='6px monospace'; g.fillText('TRACK 1: ON TIME',4,36); g.fillText(['FAIR','CLOUDY','RAIN'][(tm/60|0)%3],4,44); }
    S.t.needsUpdate=true; };
  const SETS={
    tv_console:{name:'THE CONSOLE TV',value:140,make:()=>{ '@later'; const G=new THREE.Group(), wd=std(0xffffff,{map:wood(),roughness:.5}); G.add(PO(new THREE.Mesh(round(RB(.92,.62,.5),.03),wd),0,.42,0));
      for(const s of [-1,1])G.add(PO(new THREE.Mesh(new THREE.CylinderGeometry(.025,.02,.12,10),std(0x2a1a10)),s*.38,.06,0));
      const f=new THREE.Mesh(round(RB(.56,.44,.04),.04),std(0x1a1a1c,{roughness:.4})); f.position.set(-.13,.44,.25); G.add(f); const sc=screen(.46,.34); sc.position.set(-.13,.44,.3); G.add(sc);
      const gr=new THREE.Mesh(RB(.24,.36,.01),std(0x3a2a20,{roughness:.9})); gr.position.set(.3,.42,.252); G.add(gr); for(let i=0;i<3;i++){ const k=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.025,12),std(0xb8b0a0,{metalness:.6,roughness:.3})); k.rotation.x=Math.PI/2; k.position.set(.3,.65-i*.05,.265); G.add(k); }
      for(const s of [-1,1]){ const a=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.5,6),std(0xc0c0c0,{metalness:.8,roughness:.25})); a.position.set(-.1+s*.12,.93,0); a.rotation.z=s*.5; G.add(a); }
      return G; },sol:[.46,.25,.95]},
    tv_small:{name:'THE PORTABLE TV',value:70,make:()=>{ '@later'; const G=new THREE.Group(); G.add(PO(new THREE.Mesh(round(RB(.34,.28,.28),.03),std(0xc8c2b4,{roughness:.45})),0,.14,0));
      const sc=screen(.22,.17); sc.position.set(-.03,.15,.14); G.add(sc); const h=new THREE.Mesh(new THREE.TorusGeometry(.1,.012,8,20,Math.PI),std(0x303030)); h.position.set(0,.28,0); G.add(h);
      for(let i=0;i<2;i++){ const k=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.02,10),std(0x202020)); k.rotation.x=Math.PI/2; k.position.set(.13,.2-i*.05,.142); G.add(k); } return G; },loose:3},
    pc_home:{name:'THE HOME COMPUTER',value:180,make:()=>{ const G=new THREE.Group(), beige=std(0xd8ceb4,{roughness:.55});
      G.add(PO(new THREE.Mesh(round(RB(.42,.12,.36),.015),beige),0,.06,0)); const fl=new THREE.Mesh(RB(.14,.012,.01),std(0x202020)); fl.position.set(.1,.07,.181); G.add(fl);
      const mon=new THREE.Mesh(round(RB(.34,.28,.3),.03),beige); mon.position.set(0,.27,-.02); G.add(mon); const sc=screen(.24,.18); sc.position.set(0,.27,.13); SMAP.get(sc).ch=4; G.add(sc);
      const kb=new THREE.Mesh(round(RB(.4,.03,.15),.01),beige); kb.position.set(0,.015,.3); kb.rotation.x=.08; G.add(kb); for(let r=0;r<4;r++)for(let c=0;c<12;c++){ const k=new THREE.Mesh(RB(.022,.012,.022,1,1,1),std(0x8a8270)); k.position.set(-.15+c*.027,.034+r*.003,.25+r*.026); G.add(k); }
      return G; },sol:[.22,.25,.42]},
    modem:{name:'THE MODEM',value:60,make:()=>{ const G=new THREE.Group(); G.add(PO(new THREE.Mesh(round(RB(.26,.06,.18),.012),std(0x3a3c40,{roughness:.5})),0,.03,0));
      for(let i=0;i<5;i++){ const l=new THREE.Mesh(new THREE.SphereGeometry(.006,8,6),new THREE.MeshBasicMaterial({color:i%2?0xff3a2a:0x3aff6a})); l.position.set(-.08+i*.03,.04,.092); l.userData.led=i; G.add(l); }
      const hs=new THREE.Mesh(new THREE.CapsuleGeometry(.025,.18,6,12),std(0x1c1c1e,{roughness:.4})); hs.rotation.z=Math.PI/2; hs.position.set(0,.085,0); G.add(hs); for(const s of [-1,1]){ const cup=new THREE.Mesh(new THREE.CylinderGeometry(.04,.035,.04,14),std(0x2a2a2c)); cup.position.set(s*.09,.075,0); G.add(cup); }
      return G; },loose:1.2}};
  FORAGE.add({names:Object.fromEntries(Object.entries(SETS).map(([k,v])=>[k,v.name]))});
  if(INSPECT&&INSPECT.kinds)INSPECT.kinds.push({is:id=>!!SETS[id],make:id=>SETS[id].make()});
  // the screens draw a frame a second when seen; channels: static, colour bars, the cinema's listings, the market's news (the computer's own board)
  const seen=o=>{ for(let q=o;q;q=q.parent){ if(!q.visible)return false; if(q.isScene)return true; } return false; };
  let scT=0; SYS.add('life',dt=>{ if((scT-=dt||0)>0)return; scT=.9; const tm=Date.now()/1000; for(let i=SCR.length-1;i>=0;i--){ const S=SCR[i]; if(S.m&&!S.m.parent&&S.dead){ SCR.splice(i,1); continue; } if(S.m&&seen(S.m))draw(S,tm); } },'146l-fixer');

  FIXIT.SETS=SETS; FIXIT.draw=draw; FIXIT.SCR=SCR; FIXIT.SMAP=SMAP;
  SHARED.FIXIT=FIXIT;
}
export {FIXIT};
