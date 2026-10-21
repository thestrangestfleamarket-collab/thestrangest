// THE SECOND WALKER: BWK, a second Walker in its own colours who roams the street.
import {SHARED, THREE} from './003-shx.js';
import {BWK, ED, NPCS, pos, W3} from './003b-systems.js';
import {PPU} from './004-main.js';
import {SAVE} from './005-save.js';
import {ASTEP, MAPG, MODS, TILE} from './006-map-pre.js';
import {ROAM, stfree} from './076-npc-map.js';
import {figureMesh, MUSGEO, musScale, sheetView, spreadPose} from './110-musician.js';
 window.BWK=BWK;
{ const R=RIG, V=R.V, QS=new URLSearchParams(location.search), SHEET=QS.get('sheet')==='walker2', MAT=R.MATS;
  const LOOK={shirt:R.RAMP.shirt,skin:R.RAMP.skin,hair:R.RAMP.hair,pants:R.RAMP.pants,shoes:R.RAMP.shoes,sole:['#3e3226','#352a20','#2a2119','#1c1611'],eye:['#2a2220','#241c1a','#1a1414','#0e0a0a']};
  for(const m in LOOK){ const n='bw_'+m; if(!MAT.includes(n)){ MAT.push(n); W3.ramp.push(LOOK[m].map(h=>new THREE.Color(h))); } }
  const MI=n=>MAT.indexOf(n), MAP={}; for(const m of ['shirt','skin','hair','pants','shoes','sole'])MAP[MI(m)]=MI('bw_'+m); for(const m of ['eye','eyeW','pupil','lid'])if(MI(m)>=0)MAP[MI(m)]=MI('bw_eye');
  const recol=m=>MAP[m];
  const LOOKS6=[null,{head:.88,nose:.62,jaw:5.6,square:.5,beard:'full'},{head:.85,nose:.6,jaw:5.9,square:1,beard:'boxed'},{head:.85,nose:.6,jaw:5.6,square:.85,beard:'trim'},
    {head:.82,nose:.55,jaw:5.7,square:1,beard:'stubble'},{head:.78,nose:.6,jaw:5.4,square:.6,beard:'full'},{head:.9,nose:.7,jaw:5.3,square:.15,beard:'trim'}];
  const F0={shape:'round',head:.88,nose:.62,noseL:0,jaw:5.6,square:.5,chin:0,ears:1,eyes:1,beard:'full',h:1};
  let kept=null; try{ kept=JSON.parse(SAVE.get('bwk')||'null'); }catch(e){}
  const F=BWK.F=Object.assign({},F0,kept&&kept.F,LOOKS6[+QS.get('bwk')]||{}), EB=BWK.EB=(kept&&kept.EB)||{}; BWK.LOOKS6=LOOKS6; BWK.F0=F0;
  BWK.save=()=>{ try{ SAVE.set('bwk',JSON.stringify({F,EB})); }catch(e){} };
  const skip=/^(hair|eyes\d|head$|shoe[LR]$)/, HEADP=/^(head|hair|eyes|beard)/;
  R.farOnly(false); const J=R.build(R.walkPose({ph:0,w:0},null),null).J, H=J.head, {rbox,rcone,ell,add}=R;
  const HAIR0=W3.pcs.find(p=>p.n==='hair'), SHOE0=W3.pcs.filter(p=>/^shoe[LR]$/.test(p.n)), EYE0=W3.pcs.find(p=>p.n==='eyes0');
  const E1=()=>({s:[1,1,1],o:[0,0,0],q:[0,0,0,1]}), EH={s:[1,1,1],o:[0,0,0],q:[0,0,0,1]};
  BWK.E=n=>HEADP.test(n)?null:(EB[n]||(EB[n]=E1()));
  const pieces=()=>{ const PCS=W3.pcs.map(p=>skip.test(p.n)?null:Object.assign({},p,{share:p,recol})).filter(Boolean);
    const HS=ED.HEADS[F.shape]||ED.HEADS.round, cr=4.6*(1-.75*HS.sq), m=Math.min(HS.w,HS.h,HS.d), warp=p=>{ const y=(p.y-H.y)/HS.h; return V(H.x+(p.x-H.x)/(HS.w*(1+HS.tp*y/8)),H.y+y,H.z+(p.z-H.z)/HS.d); };
    const W=f=>p=>f(warp(p))*m, cran=p=>rbox(p,H,V(6.0,7.8,6.3),cr);
    const jr=2.2-1.5*F.square, cy=-4.6-.8*F.chin, cz=1.3+.8*F.chin, jaw=p=>rbox(p,add(H,V(0,cy,cz)),V(F.jaw,3.3+.5*Math.abs(F.chin),5.0),jr), n=F.nose, ea=F.ears;
    const head={n:'head',m:'bw_skin',bb:[H.x-13,H.x+13,H.y-16,H.y+12,H.z-12,H.z+13],step:.5,
      d:W(p=>Math.min(cran(p),jaw(p),rcone(p,add(H,V(0,-6,1.6)),add(H,V(0,-10.5,0.2)),2.4,2.2),ell(p,add(H,V(6.7,-1.8,-1.0)),V(1.3*ea,1.9*ea,1.3*ea)),ell(p,add(H,V(-6.7,-1.8,-1.0)),V(1.3*ea,1.9*ea,1.3*ea)),
        rbox(p,add(H,V(0,-2.6+(1-n)*.6,5.9+1.25*n*.7+.6*F.noseL)),V(.95*n,1.75*n,1.25*n*(1+.4*F.noseL)),.45*n)))};
    const hair={...HAIR0,share:null,recol,d:W(p=>Math.min(HAIR0.d(p),Math.max(cran(p)-.7,H.y-2.2-p.y,p.z-(H.z+3.2))))};
    const T={full:[.9,4.1],boxed:[.9,4.7],trim:[.45,4.4],stubble:[.22,4.6]}[F.beard], lips=p=>Math.abs(p.x-H.x)<1.9&&p.y>H.y+cy-1.1&&p.y<H.y+cy-.1&&p.z>H.z+3;
    const beard=T&&{n:'beard',on:'head',m:'bw_hair',bb:head.bb,step:.5,d:W(p=>Math.max(Math.min(rbox(p,add(H,V(0,-.9,.2)),V(6.0+T[0],7.8+T[0],6.3+T[0]),cr+T[0]),jaw(p)-T[0]),H.z-1.2-p.z,p.y-(H.y-T[1]))),
      paint:p=>lips(warp(p))?'bw_skin':null};
    const e=F.eyes, eyes=Object.assign({},EYE0,{share:null,recol,bb:[H.x-7,H.x+7,H.y-3,H.y+5,H.z+1,H.z+12],d:W(p=>{ const cx=H.x+Math.sign(p.x-H.x)*2.35, cy2=H.y+.7, q=V(cx+(p.x-cx)/e,cy2+(p.y-cy2)/e,p.z); return EYE0.d(q)*Math.min(1,e); }),
      paint:p=>{ p=warp(p); const cx=H.x+Math.sign(p.x-H.x)*2.35, cy2=H.y+.7; return EYE0.paint(V(cx+(p.x-cx)/e,cy2+(p.y-cy2)/e,p.z)); }});
    const shoes=SHOE0.map(p=>({...p,d:q=>Math.max(p.d(q),.45-q.y),m:'bw_shoes',paint:q=>q.y<1.15?'bw_sole':null,share:null}));
    PCS.push(head,hair,eyes,...shoes); if(beard)PCS.push(beard);
    for(const p of PCS){ p.E=HEADP.test(p.n)?EH:BWK.E(p.n); if(/^(shin|shoe)[LR]$/.test(p.n)){ p.share=null; p.cell=.9; } }
    return PCS; };
  let PCS=pieces(); for(const P of PCS)if(!P.share||!MUSGEO.has(P.share)){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?.5:1),fine,null); }
  let FM=figureMesh(PCS,'bwk'); const g=new THREE.Group(); g.add(FM.me); MAPG.bodega.add(g); BWK.g=g; BWK.tris=FM.tris; BWK.per=FM.per;
  BWK.remake=()=>{ const old=FM.me; PCS=pieces(); FM=figureMesh(PCS,'bwk'); g.remove(old); old.geometry.dispose(); g.add(FM.me); BWK.tris=FM.tris; BWK.per=FM.per; BWK.save(); };
  const headE=()=>{ const k=F.head; EH.s[0]=EH.s[1]=EH.s[2]=k; EH.o[1]=-(1-k)*10; EH.o[2]=-1.4; };
  const st={x:SHARED.BOD.XS(60),z:SHARED.BOD.ZS(-74),R:.3*TILE,to:null,next:null,wait:2,hd:Math.PI/2}, S=R.create(); BWK.st=st; BWK.at=st; st.y=0;
  const free=(x,z)=>stfree(x,z,st.R), turn=a=>{ let e=a-st.hd; return Math.atan2(Math.sin(e),Math.cos(e)); };
  if(typeof NPCS!=='undefined'&&NPCS.extra)NPCS.extra.push(BWK);
  if(SHEET){ st.x=SHARED.BOD.XS(100); st.z=SHARED.BOD.ZS((SHARED.BOD.MAP.y0+SHARED.BOD.MAP.y1)/2); st.hd=Math.PI/4; }
  BWK.on=QS.get('bwk')!=null; BWK.tick=dt=>{ if(!BWK.on&&!SHEET){ g.visible=false; return; } const near=Math.hypot(pos.x-st.x,pos.z-st.z)<40;
    if(SHEET){ R.farOnly(false); const B=R.settle(R.build(spreadPose(),null),0); PCS.forEach((pc,i)=>FM.set(i,R.frameOf(pc.on||pc.n,B)));
      st.y=MODS.bodega.ground(st.x,st.z); g.position.set(st.x,st.y,st.z); g.rotation.y=st.hd; headE(); musScale(g,F.h);
      if(!BWK.sheetOn){ BWK.sheetOn=true; sheetView(g,st.y+g.scale.y*27); } return; }
    if(BWK.hold){ S.target=0; st.to=null; const f=BWK.hold; st.x=f.x; st.z=f.z; st.hd=f.hd; }
    else if(!free(st.x,st.z)){ for(let k=0;k<80;k++){ const a=k*2.4, r=(k>>2)*.25*TILE; if(free(st.x+Math.sin(a)*r,st.z+Math.cos(a)*r)){ st.x+=Math.sin(a)*r; st.z+=Math.cos(a)*r; break; } } }
    if(!st.to&&!BWK.hold){ S.target=0; st.wait-=dt;
      if(st.wait<=0&&!ROAM.pick(st,(x,z)=>free(x,z)))st.wait=1; }
    if(st.to&&!BWK.hold){ const ex=st.to.x-st.x, ez=st.to.z-st.z, d=Math.hypot(ex,ez);
      if(d<.15*TILE){ st.to=st.next||null; st.next=null; if(!st.to)st.wait=2+Math.random()*6; }
      else{ const e=turn(Math.atan2(ex,ez)); st.hd+=Math.sign(e)*Math.min(Math.abs(e),dt*4); S.target=Math.abs(e)<.6?1:0; } }
    const d0=S.dist; R.step(S,dt); const go=(S.dist-d0)*W3.SZ/PPU;
    if(go>0&&!BWK.hold){ const nx=st.x+Math.sin(st.hd)*go, nz=st.z+Math.cos(st.hd)*go;
      if(free(nx,nz)){ st.x=nx; st.z=nz; } else { st.to=null; st.next=null; st.wait=.5+Math.random(); } }
    st.y=MODS.bodega.ground(st.x,st.z); g.position.set(st.x,st.y,st.z); g.rotation.y=st.hd; headE(); musScale(g,F.h);
    if(!near||!MAPG.bodega.visible||BWK.hid)return;
    if(BWK.B&&!ASTEP.gate(BWK,dt))return;
    R.farOnly(false); const B=R.pose(S,true); BWK.B=B; PCS.forEach((pc,i)=>FM.set(i,R.frameOf(pc.on||pc.n,B))); };
}
