// THE CLOCK: CLOCK keeps the day's hour (CLOCK.h: shops, lamps, the NPCs' routines) and the sun's own hour (CLOCK.sunH, the look's, when set), and moves the sun and moon, their light and their shadows.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, NPCS, ONLINE, PARK, pos, ROOMS, W3} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {QS, RING, TILE} from './006-map-pre.js';
import {WATER} from './009-down.js';
import {HEMI} from './064-map-post.js';
import {CREATS} from './087-npc-creatures.js';
Object.assign(CLOCK,{movers:[],h:17.4,sunH:null,run:false,speed:1,shadeH:16,sunV:new THREE.Vector3(0,1,0),moonV:new THREE.Vector3(0,1,0),
  // the calendar: the day (the same for everyone), its season (north; ?season= or the owner's SEASON pick in ATMOSPHERE to preview one) and the moon's phase on an 8-day cycle (0 new, .5 full)
  day:()=>Math.floor(Date.now()/86400000),seasonOf:day=>{ const m=new Date(day*86400000).getUTCMonth(); return m<2||m===11?'winter':m<5?'spring':m<8?'summer':'autumn'; },
  SEASONS:{spring:{tint:0x9fd08a,mix:0,desat:0,amb:0,snow:0,temp:14},summer:{tint:0xd9b35a,mix:.1,desat:.02,amb:.03,snow:0,temp:26},autumn:{tint:0xc8763a,mix:.26,desat:.08,amb:.05,snow:0,temp:12},winter:{tint:0xcfe0f0,mix:.24,desat:.5,amb:.08,snow:.6,temp:1}},
  seasonPick:'',season:()=>CLOCK.SEASONS[CLOCK.seasonPick]?CLOCK.seasonPick:CLOCK.seasonOf(CLOCK.day()),seasonLook:()=>CLOCK.SEASONS[CLOCK.season()],
  moonPhase:()=>{ const m=CLOCK.moonReal&&CLOCK.moonReal(); return m?m.phase:(((CLOCK.day()+(CLOCK.h??12)/24)/8+.125)%1+1)%1; },   // the real Moon's (moonReal, set by THE HOURS) or an 8-day cycle
 moonLit:()=>(1-Math.cos(CLOCK.moonPhase()*Math.PI*2))/2});
{ const D=Math.PI/180, sunL=new THREE.DirectionalLight(0xffffff,0), sunD=new THREE.DirectionalLight(0xffffff,0), sunF=new THREE.DirectionalLight(0xffffff,0), R=32*TILE, RD=20*TILE, FM=Math.min(+(QS.get('fmap')||1024),renderer.capabilities.maxTextureSize);
  for(const [L,r,m] of [[sunL,R,1536],[sunD,RD,1024],[sunF,R,FM]]){ L.castShadow=true; L.shadow.mapSize.set(m,m); Object.assign(L.shadow.camera,{left:-r,right:r,top:r,bottom:-r,near:.5,far:260*TILE}); L.shadow.camera.updateProjectionMatrix();
    L.shadow.bias=-.06/260; L.shadow.normalBias=+(QS.get("snb")||.12); L.shadow.autoUpdate=false; scene.add(L,L.target); }
  sunF.castShadow=false;   // no far shadow map: shadows within the near one's reach only (owner, 9 Nov 2026)
  const SC={c:new THREE.Vector3(1e9,0,0),d:new THREE.Vector3(),fd:new THREE.Vector3(),lv:'',flv:'',st:0,g:0,dirty:0,fdirty:0,ft:0,root:{visible:true,layers:new THREE.Layers(),children:[]},n:0,nd:0,nf:0,fb:null};
  const SNM=new THREE.Matrix4(), SR=new THREE.Vector3(), SU=new THREE.Vector3(), SP=new THREE.Vector3(), ORG=new THREE.Vector3(), UPV=new THREE.Vector3(0,1,0);
  const elev=h=>50*Math.cos(2*Math.PI*(h-12.7)/24)-8, azim=h=>2*Math.PI*(h-12.7)/24;
  const K=[[-90,0x050507,0x55607a,0x14110e,.13,0x6f86c9,.14],[-18,0x050507,0x55607a,0x14110e,.13,0x6f86c9,.14],[-12,0x0a0e22,0x4a5a8a,0x15121a,.18,0x6f86c9,.1],
           [-6,0x1e2446,0x5a5a90,0x1e1a22,.36,0xff7a4a,0],[-2,0x3a2a40,0xb08a90,0x2e2222,.5,0xff8a5a,.2],[0,0x4a3038,0xd09a8a,0x3a2a22,.6,0xff9a5a,.6],
           [3,0x6a4a48,0xe0b090,0x4a3a2a,.68,0xffa860,1.1],[6,0x4a3c38,0xf0c8a0,0x4a3a2a,.75,0xffb070,1.6],[10,0x3e4250,0xf0d4b0,0x54442e,.85,0xffd4a0,2.1],
           [14,0x3a4350,0xbfdcff,0x5b4a35,.9,0xfff1d6,2.4],[90,0x3a4350,0xbfdcff,0x5b4a35,.9,0xfff1d6,2.6]];
  const SKYV=QS.get('sky')!=null?+QS.get('sky'):2;
  if(SKYV){ const F=SKYV===2?.09:.3, G=SKYV===2?.08:.28, at=(e,v)=>{ K[K.findIndex(k=>k[0]===e)]=v; };
    at(6,[6,0x9fb8d8,0xf0c8a0,0x4a3a2a,F,0xffb070,1.9]); at(10,[10,0x86aadc,0xf0d4b0,0x54442e,F,0xffd4a0,2.6]); at(14,[14,0x6a9fe0,0xbfdcff,0x5b4a35,G,0xfff1d6,3.5]); at(90,[90,0x4f8ee0,0xbfdcff,0x5b4a35,G,0xfff1d6,3.8]); }
  const ca=new THREE.Color(), cb=new THREE.Color(), mixC=(a,b,t,out)=>out.copy(ca.setHex(a)).lerp(cb.setHex(b),t);
  let lastS=0;
  CLOCK.tick=dt=>{ if(CLOCK.run)CLOCK.h=(CLOCK.h+dt*CLOCK.speed/60)%24;
    const H=CLOCK.sunH??CLOCK.h, e=elev(H); let i=0; while(i<K.length-2&&e>K[i+1][0])i++; const A=K[i], B=K[i+1], t=Math.max(0,Math.min(1,(e-A[0])/(B[0]-A[0])));
    const up=SHARED.LVL!=='down';
    if(up){ mixC(A[1],B[1],t,scene.background); mixC(A[2],B[2],t,HEMI.color); mixC(A[3],B[3],t,HEMI.groundColor); HEMI.intensity=A[4]+(B[4]-A[4])*t; const SL=CLOCK.seasonLook(); if(SL.amb)HEMI.color.lerp(ca.setHex(SL.tint),SL.amb); if(e<-4)HEMI.intensity*=.75+.25*CLOCK.moonLit(); if(PARK.season){ const c=ca.setHex(SL.tint); PARK.season.value.set(c.r,c.g,c.b,SL.mix); PARK.seasonD.value=SL.desat; } }
    const sun=e>-1, hd=CLOCK.run?(sun?CLOCK.shadeH:1):CLOCK.sunQ?Math.round(H*4)/4:H, az=sun?azim(hd):azim(hd+12)*.5+.6, el=sun?Math.max(3,elev(hd))*D:48*D;   // while the clock runs the light comes from one held hour, so the shadows stay put (baked)
    mixC(A[5],B[5],t,sunL.color); sunL.intensity=up?A[6]+(B[6]-A[6])*t:0;
    const dir=new THREE.Vector3(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el)); CLOCK.dir=dir;
    { const sa=azim(H), se=e*D; CLOCK.sunV.set(Math.sin(sa)*Math.cos(se),Math.sin(se),Math.cos(sa)*Math.cos(se));
      const mr=CLOCK.moonReal&&CLOCK.moonReal(), ma=mr?mr.az:azim(H+12)*.5+.6, me=mr?mr.alt:48*D; CLOCK.moonV.set(Math.sin(ma)*Math.cos(me),Math.sin(me),(mr?-1:1)*Math.cos(ma)*Math.cos(me)); }   // the moon's disc where the real one is among the stars (south is -z, as 134ba has it; its light stays the night's own)
    const aim=L=>{ const sc=L.shadow.camera, tx=(sc.right-sc.left)/L.shadow.mapSize.x; SNM.lookAt(dir,ORG,UPV); SR.setFromMatrixColumn(SNM,0); SU.setFromMatrixColumn(SNM,1); SP.set(pos.x,SHARED.py,pos.z);
      const a=Math.round(SP.dot(SR)/tx)*tx, b=Math.round(SP.dot(SU)/tx)*tx, c=SP.dot(dir); L.target.position.copy(SR).multiplyScalar(a).addScaledVector(SU,b).addScaledVector(dir,c);
      L.position.copy(L.target.position).addScaledVector(dir,200*TILE); L.target.updateMatrixWorld(); L.updateMatrixWorld(); };
    const fit=()=>{ const B=SC.fb||(SC.fb=CLOCK.farBox()); SNM.lookAt(dir,ORG,UPV); SR.setFromMatrixColumn(SNM,0); SU.setFromMatrixColumn(SNM,1); const lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9];
      for(let k=0;k<8;k++){ SP.set(k&1?B[3]:B[0],k&2?B[4]:B[1],k&4?B[5]:B[2]); [SP.dot(SR),SP.dot(SU),SP.dot(dir)].forEach((v,j)=>{ lo[j]=Math.min(lo[j],v); hi[j]=Math.max(hi[j],v); }); }
      const sc=sunF.shadow.camera, hr=(hi[0]-lo[0])/2, hu=(hi[1]-lo[1])/2, hd=(hi[2]-lo[2])/2+2*TILE; Object.assign(sc,{left:-hr,right:hr,top:hu,bottom:-hu,near:.5,far:2*hd+150*TILE}); sc.updateProjectionMatrix();
      sunF.target.position.copy(SR).multiplyScalar((lo[0]+hi[0])/2).addScaledVector(SU,(lo[1]+hi[1])/2).addScaledVector(dir,(lo[2]+hi[2])/2); sunF.position.copy(sunF.target.position).addScaledVector(dir,hd+150*TILE);
      sunF.target.updateMatrixWorld(); sunF.updateMatrixWorld(); sunF.shadow.bias=-.06*TILE/sc.far; sunF.shadow.normalBias=Math.max(sunL.shadow.normalBias,1.5*2*Math.max(hr,hu)/FM); };
    { const q=SHARED.full()?1:0; if(q!==SC.q){ SC.q=q; for(const [L,m] of [[sunL,q?1536:768],[sunD,q?1024:512]]){ L.shadow.mapSize.set(m,m); if(L.shadow.map){ L.shadow.map.dispose(); L.shadow.map=null; } L.shadow.needsUpdate=true; } } }
    const strong=sunL.intensity>.3, now=performance.now(), out=up&&!(ROOMS.cur)&&sunL.intensity>0;
    if(out&&now-SC.st>1000){ SC.st=now; const g=sig(); if(g!==SC.g){ SC.g=g; SC.dirty=SC.fdirty=1; } }
    const stale=out&&(SC.d.dot(dir)<Math.cos(.4*D)||Math.hypot(SC.c.x-pos.x,SC.c.z-pos.z)>12*TILE||SC.lv!==SHARED.LVL);
    if(stale){ aim(sunL); SC.c.set(pos.x,SHARED.py,pos.z); SC.d.copy(dir); SC.lv=SHARED.LVL; sunL.shadow.needsUpdate=true; }
    if(out&&(SC.fd.dot(dir)<Math.cos(.4*D)||SC.flv!==SHARED.LVL)){ fit(); SC.fd.copy(dir); SC.flv=SHARED.LVL; SC.ft=now; sunF.shadow.needsUpdate=true; }
    if(out&&SC.dirty){ SC.dirty=0; sunL.shadow.needsUpdate=true; }
    if(out&&SC.fdirty&&now-SC.ft>1e4){ SC.fdirty=0; SC.ft=now; sunF.shadow.needsUpdate=true; }
    sunD.intensity=0;
    if(sunL.intensity>0&&(strong||now-lastS>100||stale)){ aim(sunD); sunD.shadow.needsUpdate=true; lastS=now; }
    WATER.glowK=(ROOMS.cur)||!up?1:Math.max(0,Math.min(1,(3-e)/8)); };
  CLOCK.farBox=()=>{ const C=RING.cf, M=SHARED.BOD.MAP, T=TILE, xa=[C.x0,C.x1,M.x0,M.x1].map(SHARED.BOD.XS), za=[C.y0,C.y1,M.y0,M.y1].map(SHARED.BOD.ZS); return [Math.min(...xa)-8*T,-4*T,Math.min(...za)-8*T,Math.max(...xa)+8*T,40*T,Math.max(...za)+8*T]; };
  const sig=()=>{ const dy=DYN(); let g=0; const f=o=>{ if(!o.visible||dy.has(o))return; if(o.isMesh&&o.castShadow)g=(g*31+o.id+(o.isInstancedMesh?o.count*7919:0))|0; for(const c of o.children)f(c); }; f(scene); return g; };
  CLOCK.set=h=>{ CLOCK.h=((h%24)+24)%24; };
  CLOCK.dark=()=>CLOCK.elev()<-2;   // the sky's sun (real sunrise and sunset, or the held look), not the clock's hour on a made-up curve
  const DYN=()=>{ const out=new Set(); if(W3&&W3.group)out.add(W3.group); for(const N of NPCS)if(N.g)out.add(N.g); for(const x of NPCS.extra||[])if(x&&x.g)out.add(x.g);
    if(CREATS)for(const N of CREATS)if(N.g)out.add(N.g); for(const k of ['BOAT','DRONE'])if(window[k]&&window[k].g)out.add(window[k].g); for(const o of ONLINE.others?.values()||[])if(o.fig&&o.fig.g)out.add(o.fig.g); for(const f of CLOCK.movers)for(const o of f())if(o)out.add(o); return out; };
  { const SM=renderer.shadowMap, orig=SM.render;
    SM.render=(lights,sc,camera)=>{ if(sc!==scene)return orig.call(SM,lights,sc,camera); const rest=lights.filter(L=>L!==sunL&&L!==sunD&&L!==sunF); if(!CLOCK.main){ SM.needsUpdate=true; return orig.call(SM,rest,sc,camera); } const m0=camera.layers.mask, dk=!!(ROOMS&&ROOMS.dark&&ROOMS.dark()); camera.layers.enable(3);
      const st=dk?[]:[sunL,sunF].filter(L=>lights.includes(L)&&L.shadow.needsUpdate);
      if(st.length){ const t0=performance.now(), hid=[]; for(const o of DYN())if(o.visible){ o.visible=false; hid.push(o); } SM.needsUpdate=true; orig.call(SM,st,sc,camera); for(const o of hid)o.visible=true; const ms=+(performance.now()-t0).toFixed(1); if(st.includes(sunL))SC.n++; if(st.includes(sunF))SC.nf++;
        if(window.SUNLOG){ let c=0; sc.traverseVisible(o=>{ if(o.isMesh&&o.castShadow)c++; }); SUNLOG.push([+(performance.now()/1000).toFixed(2),c,ms,st.map(L=>L===sunL?'n':'f').join('')]); } }
      if(!dk&&lights.includes(sunD)&&sunD.shadow.needsUpdate){ const ch=SC.root.children; ch.length=0; for(const o of DYN())if(o.visible&&o.parent)ch.push(o); SC.root.traverse=f=>sc.traverse(f); SM.needsUpdate=true; orig.call(SM,[sunD],SC.root,camera); SC.nd++; }
      SM.needsUpdate=true; orig.call(SM,rest,sc,camera); camera.layers.mask=m0; }; }
  window.SUNDBG=()=>({still:SC.n,moving:SC.nd,far:SC.nf,box:SC.fb&&SC.fb.map(v=>+(v/TILE).toFixed(1)),fcam:[sunF.shadow.camera.right/TILE,sunF.shadow.camera.top/TILE,sunF.shadow.camera.far/TILE,sunF.shadow.normalBias].map(v=>+v.toFixed(2)),dyn:DYN().size,maps:[sunL.shadow.mapSize.x,sunD.shadow.mapSize.x,sunF.shadow.mapSize.x],patch:THREE.ShaderChunk.lights_fragment_begin.includes('NUM_DIR_LIGHT_SHADOWS > 2')});
  CLOCK.sun=sunL; CLOCK.sunD=sunD; CLOCK.sunF=sunF; CLOCK.dyn=DYN; window.CLOCK=CLOCK; CLOCK.elev=()=>elev(CLOCK.sunH??CLOCK.h); CLOCK.dayElev=CLOCK.elev; CLOCK.SKYV=SKYV;
  }
