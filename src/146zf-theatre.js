// THE MOVIE THEATRE, FURNISHED as THE STARLITE (owner, 11 Nov 2026, from his Starlite Cinema page): ten stepped rows of red velvet seats each side of the aisle, a confetti carpet, velvet curtains round the screen, wall lights, exit signs, the projector at its port with its beam and dust, house lights that come up between films; watching a film from a seat rests you; where the doorman, the usher and the moviegoers go.
import {SHARED, THREE} from './003-shx.js';
import {BATCH, CINEMA, LITE, pos, ROOMS, SFX, st, USE, VIT} from './003b-systems.js';
import {scene} from './004-main.js';
import {STORE, SYS} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {STARREEL} from './146zez-reel.js';
const THEATRE={}; window.THEATRE=THEATRE;
{ const BOD=SHARED.BOD, SITH=.46;
  const room=()=>(STORE.rooms||[]).find(r=>r.id==='theatre');
  const at0=(TB,x,y)=>{ const q=TB?TB.pt(x,y):[x,y]; return [BOD.X(q[0]),BOD.Z(q[1])]; };
  const frameOf=(B,TB)=>IKIT.frame({x0:B.x0+.1,y0:B.y0+.1,x1:B.x1-.1,y1:B.y1-.1,id:'theatre'},(x,y)=>at0(TB,x,y));
  // the room in metres (u from the screen wall, v from the far side to the door's side): a row of nine seats each side of the middle aisle, every row a step up
  const geo=(F,L)=>{ const cy=F.D/2, rows=[];
    for(let i=0;i<L.ROWS;i++)for(const s of [-1,1]){ const a=cy+s*L.AISLE, b=a+s*L.NS*L.PITCH; rows.push({uc:L.ROW0+i*L.ROWD,h:i*L.RISE,v0:Math.min(a,b),v1:Math.max(a,b),vs:Array.from({length:L.NS},(_,k)=>Math.min(a,b)+(k+.5)*L.PITCH)}); }
    return {cy,rows}; };
  const place=R=>{ '@later'; const {B,TB,LAY:L}=STORE.theatreFrame, F=frameOf(B,TB), G=geo(F,L), sp=(u,v,du,dv,h)=>{ const p=F.pw(u,v); return {x:p[0],z:p[1],hd:F.hd(du,dv),...(h!=null?{y:h*IKIT.MW}:{})}; };
    R.spots={'DOORMAN, TICKETS WITH THE TICKET FOX':sp(L.DOOR+1.5,F.D-1,0,-1),USHER:sp(6,G.cy,1,0)};
    const S=[]; for(const r of G.rows)for(const v of r.vs)S.push(sp(r.uc,v,-1,0,r.h+SITH));
    R.seats=THEATRE.places=S; };
  { let done=false; const go=()=>{ if(done)return; const R=room(); if(R&&STORE.theatreFrame){ place(R); done=true; } }; go(); SYS.add('life',go,'146zf-theatre'); }
  // a film watched from a seat rests you
  VIT.mends.push(()=>USE.seat&&st.sit&&STORE.here&&STORE.here('theatre')&&CINEMA.playing&&CINEMA.playing()?1/40:0);
  // light added to what is behind it; drawn after the room and before the screen's see-through face (059f), so the film still shows through
  const ADD={depthWrite:false,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneFactor,blendSrcAlpha:THREE.ZeroFactor,blendDstAlpha:THREE.OneFactor};
  const rnd=i=>{ const s=Math.sin(i*127.1+311.7)*43758.5453; return s-Math.floor(s); };
  let LIVE=null;
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.theatre=(B,TB)=>{ '@later'; const L=STORE.theatreFrame.LAY, F=frameOf(B,TB), K=IKIT.room(F,o=>scene.add(o)), {box,cyl,glow,sol,use,pic,MW}=K, G=geo(F,L), {cy}=G, U=F.W, V=F.D, H=L.H, fh=L.floorH, BACK=fh(U);
    const P3=(u,v,h)=>{ const p=F.pw(u,v); return new THREE.Vector3(p[0],h*MW,p[1]); }, mesh=(g,m)=>{ const me=new THREE.Mesh(g,m); scene.add(me); return me; };
    const DARK=0x120c0c, BRASS=0x8a6a2a, RED=0x7a1220, REDD=0x58101a, ARM=0x140d0b, MET=0x2a2c30;
    // the carpet: dark purple with a confetti of triangles, squiggles, bars and rings, over the floor and up every step
    const ct=IKIT.tex(256,256,(g,w,h)=>{ g.fillStyle='#1a0d24'; g.fillRect(0,0,w,h);
      for(let i=0;i<5000;i++){ g.fillStyle=`rgba(${30+rnd(i)*30|0},${10+rnd(i+1)*20|0},${40+rnd(i+2)*30|0},.5)`; g.fillRect(rnd(i+3)*w,rnd(i+4)*h,2,2); }
      const cols=['#19b5a8','#d6337a','#e8b83a','#5a4bd6'];
      for(let i=0;i<34;i++){ const x=rnd(i*7)*w, y=rnd(i*7+1)*h, k=i%4; g.save(); g.translate(x,y); g.rotate(rnd(i*7+2)*6.28); g.strokeStyle=g.fillStyle=cols[(rnd(i*7+3)*4)|0]; g.lineWidth=3; g.globalAlpha=.8;
        if(k===0){ g.beginPath(); g.moveTo(-9,7); g.lineTo(0,-9); g.lineTo(9,7); g.closePath(); g.fill(); }
        else if(k===1){ g.beginPath(); for(let s=0;s<=20;s++)g.lineTo(s*1.4-14,Math.sin(s*.9)*4); g.stroke(); }
        else if(k===2)g.fillRect(-10,-2,20,4);
        else { g.beginPath(); g.arc(0,0,5,0,6.28); g.stroke(); }
        g.restore(); } }); ct.wrapS=ct.wrapT=THREE.RepeatWrapping;
    { const P=[], N=[], T2=[], CT=1.6, quad=(c,n)=>{ for(const i of [0,1,2,0,2,3]){ const [u,v,h,s,t]=c[i], p=P3(u,v,h); P.push(p.x,p.y,p.z); N.push(...n); T2.push(s/CT,t/CT); } }, nr=[-F.eu[0],0,-F.eu[1]];
      for(let k=0;k<L.ROWS;k++){ const u0=k?L.STEP0+k*L.ROWD:0, u1=k<L.ROWS-1?L.STEP0+(k+1)*L.ROWD:U, h=k*L.RISE+.02;
        quad([[u0,0,h,0,u0],[u1,0,h,0,u1],[u1,V,h,V,u1],[u0,V,h,V,u0]],[0,1,0]);
        if(k)quad([[u0,0,h-L.RISE,0,0],[u0,0,h,0,L.RISE],[u0,V,h,V,L.RISE],[u0,V,h-L.RISE,V,0]],nr); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(T2,2));
      mesh(g,new THREE.MeshLambertMaterial({map:ct,side:THREE.DoubleSide})).receiveShadow=true; }
    // a small light on every step at the aisles
    glow(()=>{ for(let r=1;r<L.ROWS;r++){ const u=L.STEP0+r*L.ROWD; for(const d of [-.6,.6,-6.75,6.75,-7.7,7.7])box(u-.02,cy+d-.05,u,cy+d+.05,r*L.RISE-.075,r*L.RISE-.045,0xffa23a); } });
    // the seats: red velvet, a dark shell behind each back, an armrest on a metal standard between each; you sit in the one nearest you
    const things=[];
    for(const r of G.rows){ const {uc:u,h,v0,v1,vs}=r;
      for(let k=0;k<=L.NS;k++){ const v=v0+k*L.PITCH; box(u-.2,v-.04,u+.24,v+.04,h+.6,h+.655,ARM); box(u-.15,v-.025,u+.25,v+.025,h,h+.62,MET); }
      for(const v of vs){ box(u-.27,v-.26,u+.21,v+.26,h+.375,h+.505,RED); box(u+.22,v-.27,u+.36,v+.27,h+.45,h+1.19,RED); box(u+.36,v-.28,u+.4,v+.28,h+.41,h+1.19,ARM); }
      sol(u-.25,v0,u+.42,v1);
      for(let k=0;k<L.NS;k+=3){ const three=vs.slice(k,k+3), th=use('A ROW OF SEATS',u,three[1],1.8,1.1,()=>{ let best=three[0], bd=1e9; for(const v of three){ const p=F.pw(u,v), d=Math.hypot(p[0]-pos.x,p[1]-pos.z); if(d<bd){ bd=d; best=v; } } const p=F.pw(u,best); USE.sitAt(p[0],p[1],(h+SITH)*MW,F.hd(-1,0)); },1.3);
        th.obj.position.y+=h*MW; things.push(th); } }
    // the stage under the screen, the posts down the side walls, the dark ceiling
    box(.02,0,1.5,V,0,.6,DARK); sol(0,0,1.5,V);
    for(let u=2.5;u<U;u+=4.5){ box(u-.25,0,u+.25,.18,0,H,DARK); box(u-.25,V-.18,u+.25,V,0,H,DARK); }
    box(0,0,U,V,H-.07,H-.03,0x0e0c0c);
    // the curtains: a drape each side of the screen and a valance across the top, on a brass rail
    const sheet=(v0,v1,h0,h1,u,folds)=>{ const nv=Math.round(folds*6), nh=4, P=[], C=[], I=[], w=v1-v0, col=new THREE.Color();
      for(let j=0;j<=nh;j++)for(let i=0;i<=nv;i++){ const a=i/nv, s=Math.sin(a*Math.PI*2*folds), p=P3(u+s*.11+Math.sin(a*w*9+j*.9)*.02,v0+a*w,h0+(h1-h0)*j/nh); P.push(p.x,p.y,p.z); col.set(RED).multiplyScalar(.62+.38*(.5+.5*s)); C.push(col.r,col.g,col.b); }
      for(let j=0;j<nh;j++)for(let i=0;i<nv;i++){ const a=j*(nv+1)+i, b=a+1, c=a+nv+1, d=c+1; I.push(a,b,d,a,d,c); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.setIndex(I); g.computeVertexNormals(); return mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); };
    sheet(cy-8,cy-5.15,.6,H-.1,.75,7); sheet(cy+5.15,cy+8,.6,H-.1,.75,7); sheet(0,V,H-1.7,H-.1,.9,30); box(.9,0,1,V,H-1.76,H-1.68,BRASS);
    // the wall lights, three a side: a glowing half shade on a brass plate
    const lamp=(u,v,h,c,i,r)=>{ const l=new THREE.PointLight(c,i,r*MW,1.6); l.position.copy(P3(u,v,h)); l.castShadow=false; LITE.recs.push(l); return l; }, sconces=[];
    for(const u of [5.5,12.25,19])for(const s of [0,1]){ const v=s?V:0, d=s?-1:1, h=fh(u)+3.3; box(u-.11,v+d*.0,u+.11,v+d*.05,h-.35,h+.15,BRASS); glow(()=>cyl(u,v+d*.09,.08,h-.17,h+.17,0xffb060,.16,10)); sconces.push(lamp(u,v+d*.4,h+.1,0xff8a3c,1.5,7)); }
    // the far exit: a dark door with a brass bar; an EXIT sign over it and over the way in
    box(L.DOOR-.55,0,L.DOOR+.55,.06,0,2.1,0x0d0a0a); box(L.DOOR-.25,.06,L.DOOR+.25,.1,.97,1.03,BRASS);
    const et=IKIT.tex(128,48,(g,w,h)=>{ g.fillStyle='#120000'; g.fillRect(0,0,w,h); g.font='bold 36px Arial'; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#ff4a36'; g.fillText('EXIT',w/2,h/2+2); });
    pic(L.DOOR,.08,2.3,.62,.23,0,1,et,true); pic(L.DOOR,V-.08,2.3,.62,.23,0,-1,et,true);
    // the house lights: discs in the ceiling over three lamps, down until you throw the switch by the way in (your own)
    const diskM=new THREE.MeshBasicMaterial({color:0x000000}), disks=new THREE.InstancedMesh(new THREE.CircleGeometry(.22*MW,16).rotateX(Math.PI/2),diskM,12), M4=new THREE.Matrix4(); let n=0;
    for(const d of [-4.5,0,4.5])for(const u of [5,11,17,23])disks.setMatrixAt(n++,M4.setPosition(P3(u,cy+d,H-.08))); scene.add(disks);
    const house=[6,13,20].map(u=>lamp(u,cy,H-1.2,0xffc890,0,30));
    box(L.DOOR+.95,V-.03,L.DOOR+1.1,V,1.2,1.42,0xd8d0b8); use('HOUSE LIGHTS',L.DOOR+1.02,V-.2,.4,1.6,()=>{ const S=LIVE; if(S)S.tgt=S.tgt>.5?0:1; });
    // the projector at its port in the back wall: its body through the port between brass trims, the lens, two reels turning
    box(U-.04,cy-1.65,U,cy+1.65,BACK+2.3,BACK+2.35,BRASS); box(U-.04,cy-1.65,U,cy+1.65,BACK+3.67,BACK+3.72,BRASS);
    const LH=BACK+3.02, LENS=P3(U-.62,cy,LH); box(U-.5,cy-.25,U,cy+.25,LH-.5,LH+.4,MET); box(U-.6,cy-.1,U-.5,cy+.1,LH-.1,LH+.1,BRASS);
    const reelM=new THREE.MeshLambertMaterial({color:0x3a3c40}), reels=[LH+.62,LH-.72].map(h=>{ const r=mesh(new THREE.CylinderGeometry(.3*MW,.3*MW,.06*MW,8),reelM); r.position.copy(P3(U-.28,cy+.3,h)); r.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(F.ev[0],0,F.ev[1])); return r; });
    const lens=mesh(new THREE.CircleGeometry(.085*MW,16),new THREE.MeshBasicMaterial({color:0xffffff})); lens.position.copy(P3(U-.605,cy,LH)); lens.rotation.y=F.hd(-1,0);
    const ft=IKIT.tex(64,64,g=>{ g.fillStyle='#000'; g.fillRect(0,0,64,64); const gr=g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.12,'rgba(220,235,255,.55)'); gr.addColorStop(.4,'rgba(120,160,255,.12)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64); }); ft.magFilter=ft.minFilter=THREE.LinearFilter;
    const flare=mesh(new THREE.PlaneGeometry(1.6*MW,1.6*MW),new THREE.MeshBasicMaterial({map:ft,...ADD})); flare.position.copy(P3(U-.63,cy,LH)); flare.rotation.y=F.hd(-1,0); flare.renderOrder=1;
    // the beam from the lens to the screen's corners (four nested cones of light) and the dust drifting in it
    const fm=STORE.main.theatre.fm, sw=fm.geometry.parameters.width/2, shh=fm.geometry.parameters.height/2, SC=(a,b,o=new THREE.Vector3())=>o.set(a*sw,b*shh,.02*MW).applyMatrix4(fm.matrixWorld);
    let beam; const BU={uTime:{value:0},uCol:{value:new THREE.Color(1,1,1)},uInt:{value:0}};
    { const P=[], A=[]; for(const s of [1,.72,.44,.18]){ const c=[SC(-s,s),SC(s,s),SC(s,-s),SC(-s,-s)]; for(let i=0;i<4;i++){ const a=c[i], b=c[(i+1)%4]; P.push(LENS.x,LENS.y,LENS.z,a.x,a.y,a.z,b.x,b.y,b.z); A.push(0,1,1); } }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('aT',new THREE.Float32BufferAttribute(A,1)); beam=mesh(g,new THREE.ShaderMaterial({uniforms:BU,side:THREE.DoubleSide,...ADD,
        vertexShader:'attribute float aT; varying float vT; varying vec3 vP; void main(){ vT=aT; vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
        fragmentShader:'uniform float uTime; uniform vec3 uCol; uniform float uInt; varying float vT; varying vec3 vP; void main(){ float n=.75+.25*sin(vP.x*.6+uTime*.6)*sin(vP.y*.8-uTime*.4+vP.z*.2); float a=(.01+.06*pow(1.-vT,5.))*mix(1.,.45,vT)*n*uInt; gl_FragColor=vec4(uCol*a,1.); }'})); beam.frustumCulled=false; beam.renderOrder=1; }
    const ND=260, seed=[], dg=new THREE.BufferGeometry(); dg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(ND*3),3)); for(let i=0;i<ND;i++)seed.push({t:.08+Math.random()*.9,u:Math.random()*2-1,v:Math.random()*2-1,ph:Math.random()*6.28,sp:.2+Math.random()*.6});
    const dust=new THREE.Points(dg,new THREE.PointsMaterial({color:0xffffff,size:.03*MW,sizeAttenuation:true,...ADD})); dust.frustumCulled=false; dust.renderOrder=1; scene.add(dust);
    const M=STORE.main.theatre, reel=STARREEL.make(), reelL=lamp(3,cy,3.4,0xffffff,0,30); fm.material.map=reel.tex; fm.material.needsUpdate=true; M.reel=true;
    K.flush(); LITE.t=0;
    // the floor's height, step by step
    const o=F.pw(0,0), a=F.box(0,0,U,V), gr={x0:a[0],z0:a[1],x1:a[2],z1:a[3],ground:(x,z)=>fh(((x-o[0])*F.eu[0]+(z-o[1])*F.eu[1])/MW)*MW}; ROOMS.grounds.push(gr);
    LIVE={t:performance.now(),house:0,tgt:0,walls:null,rt:0,rd:0,reel,reelL,snd:null,sconces,houseL:house,diskM,reels,lens,flare,beam,dust,dg,seed,BU,LENS,SC,things};
    STORE.inside.theatre.un=()=>{ if(LIVE&&LIVE.snd)LIVE.snd.end(); LIVE=null; fm.material.map=M.tx; fm.material.needsUpdate=true; M.reel=false; reel.tex.dispose(); const i=ROOMS.grounds.indexOf(gr); if(i>=0)ROOMS.grounds.splice(i,1); }; };
  // while the inside stands: the reel runs when no film is on, the beam, the dust and the room's light follow the picture, the reels turn, the projector whirrs
  const TMP=new THREE.Vector3(), TMQ=new THREE.Vector3(), COL=new THREE.Color();
  SYS.add('places',()=>{ const S=LIVE; if(!S)return; const now=performance.now(), dt=Math.min(.1,(now-S.t)/1000), time=now/1000; S.t=now;
    const film=!!CINEMA.on, lg=CINEMA.light&&CINEMA.light(), here=STORE.here('theatre'), fl=.93+Math.random()*.07; let lum;
    if(film&&lg){ COL.copy(lg.color); lum=Math.min(1,lg.intensity/9); COL.multiplyScalar(lum); S.reelL.intensity=0; }
    else { S.rt+=dt; if(here&&now-S.rd>40){ S.rd=now; S.reel.draw(S.rt); } COL.copy(S.reel.avg); lum=COL.r*.3+COL.g*.55+COL.b*.15; const m=Math.max(COL.r,COL.g,COL.b,.001); S.reelL.color.setRGB(COL.r/m,COL.g/m,COL.b/m); S.reelL.intensity=(.3+30*lum)*fl; }
    S.house+=(S.tgt-S.house)*Math.min(1,dt*1.4); const hs=S.house;
    if(!S.walls&&STORE.meshes){ const W=['f','b','w','e'].flatMap(w=>BATCH.all(STORE.meshes,'Wtheatre:'+w)); if(W.length)S.walls=W.flatMap(me=>[].concat(me.material)).filter(m=>m.color); }   // the painted walls take no lamp light: they are dimmed and brought up with the house lights
    if(S.walls)for(const m of S.walls)m.color.setScalar(.6+.55*hs);
    for(const l of S.houseL)l.intensity=hs*320; S.diskM.color.setRGB(hs,hs*.8,hs*.55); for(const l of S.sconces)l.intensity=1.4+hs*1.6;
    S.lens.material.color.setScalar(.6+.4*fl); for(const r of S.reels)r.rotateY(dt*2.6);
    S.BU.uTime.value=time; S.BU.uCol.value.setRGB(.25+COL.r*1.6,.25+COL.g*1.6,.28+COL.b*1.6); S.BU.uInt.value=(.45+lum*1.3)*fl; S.dust.material.color.setScalar(Math.min(1,.2+lum*.9)*fl); S.flare.material.color.setScalar(Math.min(1,.5+lum*.6)*fl);
    const p=S.dg.attributes.position.array, L0=S.LENS;
    for(let i=0;i<S.seed.length;i++){ const d=S.seed[i], u=d.u*.92+Math.sin(time*d.sp*.3+d.ph)*.06, v=((d.v+1-time*d.sp*.012)%2+2)%2-1, q=S.SC(u,v,TMQ); TMP.copy(L0).lerp(q,d.t); p[i*3]=TMP.x; p[i*3+1]=TMP.y+Math.sin(time*d.sp*.2+d.ph)*.05; p[i*3+2]=TMP.z; }
    S.dg.attributes.position.needsUpdate=true;
    if(!S.snd){ const c=SFX.live&&SFX.live(); if(c)S.snd=STARREEL.sound(c,SFX.out(c)); } if(S.snd)S.snd.set(here&&SFX.on?1:0,!film); },'146zf-theatre');
  THEATRE.live=()=>LIVE; THEATRE.dbg=()=>LIVE&&{house:+LIVE.house.toFixed(2),reel:+LIVE.rt.toFixed(1),sound:!!LIVE.snd,seats:LIVE.things.length,grounds:ROOMS.grounds.length};
}
