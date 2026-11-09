// THE SKATE PLAZA: a granite street plaza beside the skate park, out in the open in a section's Central Park (sections.places id 'skateplaza'): paving, ledges, a high ledge, a manual pad, a planter, a flat bar, all ground to ride and grind; tall tube lamps light it after dark.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, ROOMS} from './003b-systems.js';
import {scene} from './004-main.js';
import {SECTIONS, SOL, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {SKATE} from './111fd-skatepark.js';
const PLAZA={}; window.PLAZA=PLAZA;
{ const MH=TILE/.84, MV=ZU*24/.84;
  const S=(SECTIONS.places||[]).find(q=>q.id==='skateplaza');
  // the plaza in metres from its middle (u along the map's x, v along its y): [u0,v0,u1,v1,top, grind edges 'x' along u, 'z' along v, '' none, look]
  const BOX=[[-12,7.5,4,8.4,.45,'x','g'],[-3,-2.2,9,-1.4,.45,'x','g'],[-14,-9.6,-6,-8.8,.7,'x','g'],[-2,2,4,5,.22,'x','g'],
    [6,-10,14,-9.5,.5,'x','g'],[6,-5.5,14,-5,.5,'x','g'],[6,-9.5,6.5,-5.5,.5,'z','g'],[13.5,-9.5,14,-5.5,.5,'z','g'],[6.5,-9.5,13.5,-5.5,.3,'','bed']];
  const BAR=[9,4,15,4,.4], LAMPS=[[-15,11.5],[-5,11.5],[5,11.5],[15,11.5],[-15,-12],[2,-12],[15.5,-1]], LAMPI=40, TUBE=[2.4,4.9], POLE=5.2;
  let WX=0, WZ=0, G=null, LT=[], TUBEM=null, tick=null, B=null;
  const X=u=>WX+u*MH, Z=v=>WZ+v*MH, Y=y=>y*MV;
  PLAZA.ground=(x,z)=>{ const u=(x-WX)/MH, v=(z-WZ)/MH; let h=0; for(const b of BOX)if(u>b[0]&&u<b[2]&&v>b[1]&&v<b[3]&&b[4]>h)h=b[4]; return Y(h); };
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
  PLAZA.dbg=()=>({built:!!G,lamps:LT.filter(l=>l.intensity>0).length,lit:TUBEM&&TUBEM.on,rails:(SKATE.rails||[]).filter(r=>r.plaza).length,at:(u,v)=>[X(u),Z(v)],ledge:BOX[0],LAMPI});
  SYS.add('dress',()=>tick&&tick(),'111fda-skateplaza');
  if(S&&SECTIONS.home.id===S.section){ WX=SHARED.BOD.XS(S.x); WZ=SHARED.BOD.ZS(S.y); const hu=S.w*.84/2, hv=S.d*.84/2; B={x0:X(-hu),z0:Z(-hv),x1:X(hu),z1:Z(hv)};
    STORE.places.push(['THE SKATE PLAZA',X(0),Z(hv+1.5),'up','see',null,null,[S.x,S.y]]);
    SYS.onStart(()=>LOAD('skatepark').then(()=>{ build(); PLAZA.ready=true; }).catch(e=>console.warn('PLAZA',e)),'111fda-skateplaza'); }
}
