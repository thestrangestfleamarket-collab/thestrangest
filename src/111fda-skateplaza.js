// THE SKATE PLAZA: a granite street plaza beside the skate park, out in the open in a section's Central Park (sections.places id 'skateplaza'): paving, ledges, a high ledge, a manual pad, a planter, a flat bar, a pool in a curved granite rim between clipped hedges and cypresses, all ground to ride and grind; tall tube lamps light it after dark.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, ROOMS} from './003b-systems.js';
import {scene} from './004-main.js';
import {SECTIONS, SOL, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {SKATE} from './111fd-skatepark.js';
const PLAZA={}; window.PLAZA=PLAZA;
{ const MH=TILE/.84, MV=ZU*24/.84;
  const S=(SECTIONS.places||[]).find(q=>q.id==='skateplaza');
  // the plaza in metres from its middle (u along the map's x, v along its y): [u0,v0,u1,v1,top, grind edges 'x' along u, 'z' along v, '' none, look]
  const BOX=[[-22,7.5,-6,8.4,.45,'x','g'],[-13,-2.2,-1,-1.4,.45,'x','g'],[-24,-9.6,-16,-8.8,.7,'x','g'],[-12,2,-6,5,.22,'x','g'],
    [-4,-10,4,-9.5,.5,'x','g'],[-4,-5.5,4,-5,.5,'x','g'],[-4,-9.5,-3.5,-5.5,.5,'z','g'],[3.5,-9.5,4,-5.5,.5,'z','g'],[-3.5,-9.5,3.5,-5.5,.3,'','bed'],
    [8,-12,14,-11,1.1,'','hedge'],[19,-12,26.4,-11,1.1,'','hedge'],[25.4,-11,26.4,6,1.1,'','hedge']];
  const BAR=[-1,4,5,4,.4], LAMPS=[[-25,11.5],[-15,11.5],[-5,11.5],[5,11.5],[-25,-12],[-8,-12],[5.5,-1],[10,8],[23,8],[16.5,-8]], LAMPI=40, TUBE=[2.4,4.9], POLE=5.2;
  // the pool: a stadium round a line from PU-PA to PU+PA at v PV, water inside PR, its granite rim PR to PR+PW, PH high; the water PL up, its bed PB down
  const PU=16.5, PV=.5, PA=3.6, PR=3.2, PW=.6, PH=.45, PL=.28, PB=-.35, CYP=[[9,-12.7],[13,-12.7],[16.5,-12.7],[20,-12.7],[24,-12.7],[26.9,8.5],[26.9,-4]];
  const pd=(u,v)=>Math.hypot(u-PU-Math.max(-PA,Math.min(PA,u-PU)),v-PV);   // how far from the pool's middle line
  let WX=0, WZ=0, G=null, LT=[], TUBEM=null, tick=null, B=null;
  const X=u=>WX+u*MH, Z=v=>WZ+v*MH, Y=y=>y*MV;
  PLAZA.ground=(x,z)=>{ const u=(x-WX)/MH, v=(z-WZ)/MH; let h=0; for(const b of BOX)if(u>b[0]&&u<b[2]&&v>b[1]&&v<b[3]&&b[4]>h)h=b[4]; const d=pd(u,v); if(d<PR+PW)h=d>PR?PH:PL; return Y(h); };
  const pic=(n,f)=>{ const c=document.createElement('canvas'); c.width=c.height=n; f(c.getContext('2d'),n); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; };
  const rnd=(i)=>{ const s=Math.sin(i*127.1+311.7)*43758.5453; return s-Math.floor(s); };
  // a geometry of boxes: positions in the world, uvs in metres over k, colours per face (tops lighter)
  const boxes=(L,k)=>{ const P=[], U=[], C=[];
    const quad=(a,b,c,d,ua,c0)=>{ for(const [p,uv] of [[a,ua[0]],[b,ua[1]],[c,ua[2]],[a,ua[0]],[c,ua[2]],[d,ua[3]]]){ P.push(X(p[0]),Y(p[1]),Z(p[2])); U.push(uv[0]/k,uv[1]/k); C.push(...c0); } };
    for(const [u0,v0,u1,v1,y0,y1,top,side] of L){ const w=u1-u0, d=v1-v0, h=y1-y0;
      quad([u0,y1,v0],[u0,y1,v1],[u1,y1,v1],[u1,y1,v0],[[0,0],[0,d],[w,d],[w,0]],top);
      quad([u0,y0,v1],[u1,y0,v1],[u1,y1,v1],[u0,y1,v1],[[0,0],[w,0],[w,h],[0,h]],side);
      quad([u1,y0,v0],[u0,y0,v0],[u0,y1,v0],[u1,y1,v0],[[0,0],[w,0],[w,h],[0,h]],side);
      quad([u1,y0,v1],[u1,y0,v0],[u1,y1,v0],[u1,y1,v1],[[0,0],[d,0],[d,h],[0,h]],side);
      quad([u0,y0,v0],[u0,y0,v1],[u0,y1,v1],[u0,y1,v0],[[0,0],[d,0],[d,h],[0,h]],side); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
  const build=()=>{ '@skatepark';
    G=new THREE.Group(); G.name='skateplaza'; scene.add(G); const hu=S.w*.84/2, hv=S.d*.84/2;
    // the paving: grey slabs in staggered courses, a darker band round its edge
    const pave=pic(256,(c,n)=>{ c.fillStyle='#625c57'; c.fillRect(0,0,n,n); const rows=8, cols=4, rh=n/rows, cw=n/cols;
      for(let j=0;j<rows;j++)for(let i=-1;i<cols;i++){ const x=i*cw+(j%2?cw/2:0), r=rnd(j*13+i+5), l=122+r*26; c.fillStyle=`rgb(${l+8},${l+2},${l-4})`; c.fillRect(x+2,j*rh+2,cw-3,rh-3);
        for(let s=0;s<40;s++){ const q=rnd(j*991+i*37+s); c.fillStyle=q>.5?'rgba(255,240,230,.10)':'rgba(30,24,22,.12)'; c.fillRect(x+2+rnd(s+j*7+i)*(cw-4),j*rh+2+rnd(s*3+i)*(rh-4),2,2); } } });
    const gran=pic(128,(c,n)=>{ c.fillStyle='#8a6e62'; c.fillRect(0,0,n,n); for(let s=0;s<900;s++){ const q=rnd(s*7.3); c.fillStyle=q<.4?'rgba(40,26,22,.28)':q<.75?'rgba(230,200,186,.22)':'rgba(120,60,50,.25)'; c.fillRect(rnd(s)*n,rnd(s+.5)*n,2,2); } });
    const bed=pic(128,(c,n)=>{ c.fillStyle='#24321e'; c.fillRect(0,0,n,n); for(let s=0;s<500;s++){ c.fillStyle=rnd(s*3.1)<.5?'#30442a':'#1a2616'; c.fillRect(rnd(s)*n,rnd(s+.3)*n,2,5); }
      for(let s=0;s<60;s++){ const x=rnd(s*5.7)*n, y=rnd(s*9.1)*n; c.fillStyle='#e8ecf2'; c.fillRect(x,y,3,3); c.fillStyle='#d6c24a'; c.fillRect(x+1,y+1,1,1); } });
    const L=(map)=>new THREE.MeshLambertMaterial({map,vertexColors:true});
    const W=[1,1,1], BAND=[.78,.76,.76], SIDE=[.82,.8,.8], TOP=[1.05,1.03,1.02];
    const floor=[[-hu,-hv,hu,hv,0,.03,W,W]], band=[[-hu,-hv,hu,-hv+.9],[-hu,hv-.9,hu,hv],[-hu,-hv+.9,-hu+.9,hv-.9],[hu-.9,-hv+.9,hu,hv-.9]].map(r=>[...r,.03,.034,BAND,BAND]);
    const fm=new THREE.Mesh(boxes([...floor,...band],2.4),L(pave)); fm.receiveShadow=true; G.add(fm);
    const lm=new THREE.Mesh(boxes(BOX.filter(b=>b[6]==='g').map(b=>[b[0],b[1],b[2],b[3],0,b[4],TOP,SIDE]),1.2),L(gran)); lm.castShadow=lm.receiveShadow=true; G.add(lm);
    const bm=new THREE.Mesh(boxes(BOX.filter(b=>b[6]==='bed').map(b=>[b[0],b[1],b[2],b[3],0,b[4],W,W]),1.5),L(bed)); bm.receiveShadow=true; G.add(bm);
    const hedge=pic(64,(c,n)=>{ c.fillStyle='#1e3018'; c.fillRect(0,0,n,n); for(let s=0;s<700;s++){ const q=rnd(s*2.7); c.fillStyle=q<.35?'#2c4422':q<.7?'#16240f':'#3a5a2c'; c.fillRect(rnd(s)*n,rnd(s+.7)*n,3,2); } });
    const hm=new THREE.Mesh(boxes(BOX.filter(b=>b[6]==='hedge').map(b=>[b[0],b[1],b[2],b[3],0,b[4],[1.1,1.1,1.05],W]),1),L(hedge)); hm.castShadow=hm.receiveShadow=true; G.add(hm);
    for(const b of BOX)if(b[6]==='hedge')SOL.up.push([X(b[0]),Z(b[1]),X(b[2]),Z(b[3])]);
    // the pool's rim: rings round the stadium (its outer side, its top, its inner side down to the bed), then the bed and the water
    { const N=48, ring=r=>{ const P=[]; for(let i=0;i<N;i++){ const t=i/N*Math.PI*2, cx=PU+(Math.cos(t)>=0?PA:-PA); P.push([cx+Math.cos(t)*r,PV+Math.sin(t)*r]); } return P; };
      const I=ring(PR), O=ring(PR+PW), P=[], U=[], C=[], q=(a,b,c,d,col)=>{ for(const p of [a,b,c,a,c,d]){ P.push(X(p[0]),Y(p[1]),Z(p[2])); U.push((p[0]+p[2])/1.2,p[1]/1.2); C.push(...col); } };
      for(let i=0;i<N;i++){ const j=(i+1)%N, [a,b]=[O[i],O[j]], [c,d]=[I[i],I[j]];
        q([a[0],0,a[1]],[b[0],0,b[1]],[b[0],PH,b[1]],[a[0],PH,a[1]],SIDE); q([a[0],PH,a[1]],[b[0],PH,b[1]],[d[0],PH,d[1]],[c[0],PH,c[1]],TOP); q([d[0],PB,d[1]],[c[0],PB,c[1]],[c[0],PH,c[1]],[d[0],PH,d[1]],[.6,.58,.58]); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals();
      const rm=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:gran,vertexColors:true,side:THREE.DoubleSide})); rm.castShadow=rm.receiveShadow=true; G.add(rm);
      const fan=(y,attr)=>{ const P=[], A=[]; for(let i=0;i<N;i++){ const j=(i+1)%N; for(const p of [[PU,PV],I[j],I[i]]){ P.push(X(p[0]),Y(y),Z(p[1])); A.push(attr); } } const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); if(attr!=null)g.setAttribute('aD',new THREE.Float32BufferAttribute(A,1)); g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
      const bd=new THREE.Mesh(fan(PB,0),new THREE.MeshLambertMaterial({color:0x4a4038})); bd.receiveShadow=true; G.add(bd);
      // the water: the river's surface shader over a flat bed picture (as the lake's); a still dark sheet until it is ready
      const wm=new THREE.Mesh(fan(PL,(PL-PB)/2.4),new THREE.MeshLambertMaterial({color:0x2a3a44,transparent:true,opacity:.85})); wm.renderOrder=1; G.add(wm); PLAZA.water=wm;
      const RV=window.RIVER; if(RV&&RV.surface){ const img=new Uint8Array(4*4*4).fill(0); for(let k=0;k<16;k++){ img[k*4]=Math.round((PL-PB)*20); img[k*4+3]=255; } const bt=new THREE.DataTexture(img,4,4); bt.needsUpdate=true;
        const r0=PR+PW, ax=X(PU-PA-r0), az=Z(PV-r0); try{ wm.material=RV.surface({bed:bt,bedR:new THREE.Vector4(ax,az,X(PU+PA+r0)-ax,Z(PV+r0)-az),lv:Y(PL)}); }catch(e){ console.warn('PLAZA water',e); } }
      // you can't walk in: the water is boxed off, the rim is ground
      for(let k=0;k<5;k++){ const t=(k+.5)/5, hv=PR*Math.sqrt(1-((t*2-1)**2)), w=PR/5; for(const sg of [-1,1]){ const u0=PU+sg*(PA+t*PR)-w/2; SOL.up.push([X(u0),Z(PV-hv),X(u0+w),Z(PV+hv)]); } }
      SOL.up.push([X(PU-PA),Z(PV-PR),X(PU+PA),Z(PV+PR)]);
      const rc=PR+PW/2, M=24; let prev=null; for(let i=0;i<=M;i++){ const t=i/M*Math.PI*2, cx=PU+(Math.cos(t)>=0?PA:-PA), p=[X(cx+Math.cos(t)*rc),Y(PH),Z(PV+Math.sin(t)*rc)]; if(prev)SKATE.rails.push({a:prev,b:p,kind:1,plaza:true,pool:true}); prev=p; }
      for(const sg of [-1,1])SKATE.rails.push({a:[X(PU-PA),Y(PH),Z(PV+sg*rc)],b:[X(PU+PA),Y(PH),Z(PV+sg*rc)],kind:1,plaza:true,pool:true}); }
    // the cypresses: tall dark spindles behind the hedges
    { const pts=[]; for(let i=0;i<=10;i++){ const t=i/10; pts.push(new THREE.Vector2(.75*MH*Math.sin(Math.PI*Math.min(1,t*1.15))**.8*(1-t*.35),t*7.2*MV)); }
      const cg=new THREE.LatheGeometry(pts,7), cm=new THREE.MeshLambertMaterial({color:0x1f3a1c,flatShading:true}), tm=new THREE.MeshLambertMaterial({color:0x4a3a2c});
      for(const [u,v] of CYP){ const c=new THREE.Mesh(cg,cm); c.position.set(X(u),Y(.5),Z(v)); c.castShadow=true; G.add(c); const tr=new THREE.Mesh(new THREE.BoxGeometry(.25*MH,.6*MV,.25*MH),tm); tr.position.set(X(u),Y(.3),Z(v)); G.add(tr); SOL.up.push([X(u-.3),Z(v-.3),X(u+.3),Z(v+.3)]); } }
    // the flat bar: a steel rail on two legs
    const steel=new THREE.MeshLambertMaterial({color:0x8e959c}), [a0,b0,a1,,bh]=BAR;
    const bar=new THREE.Mesh(new THREE.BoxGeometry((a1-a0)*MH,.06*MV,.06*MH),steel); bar.position.set(X((a0+a1)/2),Y(bh-.03),Z(b0)); bar.castShadow=true; G.add(bar);
    for(const u of [a0+.4,a1-.4]){ const l=new THREE.Mesh(new THREE.BoxGeometry(.05*MH,bh*MV,.05*MH),steel); l.position.set(X(u),Y(bh/2),Z(b0)); G.add(l); }
    // the tube lamps: a dark pole, its upper part a glowing tube, a cap
    const pole=new THREE.MeshLambertMaterial({color:0x2a2c30}), tg=new THREE.CylinderGeometry(.09*MH,.09*MH,(TUBE[1]-TUBE[0])*MV,10);
    TUBEM={day:new THREE.MeshLambertMaterial({color:0xd8d4cc}),night:new THREE.MeshBasicMaterial({color:0xfff6e6,fog:false,toneMapped:false}),on:null};
    const tubes=[], halo=new THREE.SpriteMaterial({map:pic(64,(c,n)=>{ const g=c.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2); g.addColorStop(0,'rgba(255,226,180,.55)'); g.addColorStop(.35,'rgba(255,200,140,.18)'); g.addColorStop(1,'rgba(255,190,120,0)'); c.fillStyle=g; c.fillRect(0,0,n,n); }),blending:THREE.AdditiveBlending,depthWrite:false,fog:false,transparent:true});
    TUBEM.halos=[];
    for(const [u,v] of LAMPS){ const p=new THREE.Mesh(new THREE.BoxGeometry(.16*MH,TUBE[0]*MV,.16*MH),pole); p.position.set(X(u),Y(TUBE[0]/2),Z(v)); p.castShadow=true; G.add(p);
      const t=new THREE.Mesh(tg,TUBEM.day); t.position.set(X(u),Y((TUBE[0]+TUBE[1])/2),Z(v)); G.add(t); tubes.push(t);
      const h=new THREE.Sprite(halo); h.scale.set(1.6*MH,(TUBE[1]-TUBE[0]+1.4)*MV,1); h.position.copy(t.position); h.visible=false; h.raycast=()=>{}; G.add(h); TUBEM.halos.push(h);
      const cap=new THREE.Mesh(new THREE.BoxGeometry(.2*MH,(POLE-TUBE[1])*MV,.2*MH),pole); cap.position.set(X(u),Y((TUBE[1]+POLE)/2),Z(v)); G.add(cap); }
    TUBEM.tubes=tubes;
    { const r=.12*MH, s=LAMPS.map(([u,v])=>[X(u)-r,Z(v)-r,X(u)+r,Z(v)+r]); SOL.up.push(...s); }
    // the grind lines: every ledge's long top edges, the planter's rims, the flat bar
    const e=.04; for(const b of BOX){ if(!b[5])continue; const y=Y(b[4]);
      if(b[5]==='x')for(const v of [b[1]+e,b[3]-e])SKATE.rails.push({a:[X(b[0]),y,Z(v)],b:[X(b[2]),y,Z(v)],kind:1,plaza:true});
      else for(const u of [b[0]+e,b[2]-e])SKATE.rails.push({a:[X(u),y,Z(b[1])],b:[X(u),y,Z(b[3])],kind:1,plaza:true}); }
    SKATE.rails.push({a:[X(a0),Y(bh),Z(b0)],b:[X(a1),Y(bh),Z(b0)],kind:0,plaza:true});
    ROOMS.grounds.push({...B,ground:PLAZA.ground});
    tick=()=>{ const n=CLOCK.dark?CLOCK.dark():false; if(TUBEM.on===n)return; TUBEM.on=n; for(const t of TUBEM.tubes)t.material=n?TUBEM.night:TUBEM.day; for(const h of TUBEM.halos)h.visible=n; for(const l of LT)l.intensity=n?LAMPI:0; };
    return ROOMS.part(G,()=>{ LT=LAMPS.map(([u,v])=>{ const l=new THREE.PointLight(0xffdcae,0,16*TILE,1.6); l.position.set(X(u),Y(TUBE[0]+.9),Z(v)); scene.add(l); return l; }); },null); };
  PLAZA.dbg=()=>({built:!!G,lamps:LT.filter(l=>l.intensity>0).length,lit:TUBEM&&TUBEM.on,rails:(SKATE.rails||[]).filter(r=>r.plaza).length,at:(u,v)=>[X(u),Z(v)],ledge:BOX[0],LAMPI,lampN:LAMPS.length,pool:{u:PU,v:PV,a:PA,r:PR,w:PW},poolRails:(SKATE.rails||[]).filter(r=>r.pool).length,solid:(x,z)=>SOL.up.some(b=>x>b[0]&&x<b[2]&&z>b[1]&&z<b[3])});
  SYS.add('dress',()=>tick&&tick(),'111fda-skateplaza');
  if(S&&SECTIONS.home.id===S.section){ WX=SHARED.BOD.XS(S.x); WZ=SHARED.BOD.ZS(S.y); const hu=S.w*.84/2, hv=S.d*.84/2; B={x0:X(-hu),z0:Z(-hv),x1:X(hu),z1:Z(hv)};
    STORE.places.push(['THE SKATE PLAZA',X(0),Z(hv+1.5),'up','see',null,null,[S.x,S.y]]);
    SYS.onStart(()=>LOAD('skatepark').then(()=>{ build(); PLAZA.ready=true; }).catch(e=>console.warn('PLAZA',e)),'111fda-skateplaza'); }
}
