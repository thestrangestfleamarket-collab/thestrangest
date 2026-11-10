// THE BANK: the bank on the block, between the playhouse and the bar (its own builder): a stone front with a big vault door, and inside a dragon's hoard, a dungeon where a sleeping dragon's head comes out of the back wall over piles of gold.
import {SHARED, THREE} from './003-shx.js';
import {PERFX, pos, SFX, UI, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {BLDK, BLOCK, FIX, grab, SOL, STORE, SYS} from './006-map-pre.js';
import {dgnRoom} from './038z-dungeon.js';
import {FACADES} from './038zc-facades.js';
await grab('bank',async()=>{ const K=STORE.kit, {room,rec,STEPS}=K, SK=SHARED.BOD.STOREK, {CATALOG,LAMPS,T,sh}=SK, MK=SK.museum, M=MK.MUS, MB=M.b, P=BLOCK.lots.bank, OX=SHARED.BOD.OX, OY=SHARED.BOD.OY, DEP=14;
  const x0=OX+(P[0]-OX)/BLDK, y1=OY, B={id:'lbank',x0,x1:Math.min(x0+(MB.x1-MB.x0),OX+(P[1]-OX)/BLDK-.1),y0:y1-DEP,y1,h:MB.h};   // its own lot's width, the museum's front centred on it
  const SX=MB.x0+MB.x1, SY=MB.y0+MB.y1, dx=(B.x0+B.x1)/2-SX/2, dy=B.y1-MB.y1, FW=[[0,1],[-1,0],[0,-1],[1,0]], stone=[226,220,204], OB={...MB,plain:1,id:'lmusfront'};
  // the front door: a big iron-bound vault door, gold studs and rings, under the portico's BANK
  const DW=4, DH=140, door=(ii,jj,W,H)=>{ '@later'; const z=H-jj, m=(ii+.5)/W, fr=[38,30,24], ir=[46,44,48], irL=[74,72,78], au=[226,184,70], auD=[150,112,40];
    if(ii<4||ii>=W-4||z>H-5)return (ii+jj)%9?fr:[30,24,20]; if(Math.abs(m-.5)<.012)return [16,12,10];
    const lm=m<.5?m*2:(m-.5)*2, rc=Math.hypot((lm-.72+(m<.5?0:.44))*W*.5,z-H*.46); if(rc<6&&rc>3.6)return rc<4.6?au:auD;
    if(z%30<5){ if(ii%9===4&&z%30===2)return au; return z%30<1?irL:ir; } if(lm<.06||lm>.94)return ir;
    const pl=Math.floor(ii/9), g=((pl*7+ii*3+Math.floor(z/6))%11)/11; return ii%9===0?[52,32,18]:sh([96,58,30],.86+g*.2); };
  const D={w:'f',a:(B.x0+B.x1)/2,wd:DW,h:DH,pic:door};
  // inside, the dungeon's stones, chains, banners and soot (the dungeon kit), and a dark arch in the back wall the dragon lies in
  const R0=dgnRoom([{id:'ldungeon',x0:B.x0,x1:B.x1,y0:B.y0,y1:B.y1,h:B.h}]), W=B.x1-B.x0-2*T, HOLEW=8, HOLEH=150, mx=(B.x0+B.x1)/2;
  const R={...R0.DGN,x0:B.x0+T,x1:B.x1-T,y0:B.y0+T,y1:B.y1-T,cx:mx,cy:(B.y0+B.y1)/2,H:B.h-4,door:{w:'-'},slit:{w:'-'},tally:{w:'l',u:4},holes:[],
    torches:[{w:'l',u:3.5},{w:'l',u:10},{w:'r',u:3.5},{w:'r',u:10},{w:'b',u:3},{w:'b',u:W-3}],chains:[{w:'l',u:7,l:40},{w:'r',u:7,l:34},{w:'b',u:6,l:30},{w:'b',u:W-6,l:44}],
    banners:[{w:'l',u:1.6},{w:'r',u:12.2},{w:'f',u:4},{w:'f',u:W-4}],ivy:[{w:'b',u:1.2,h:110},{w:'l',u:12.5,h:80},{w:'r',u:.8,h:90}],
    cracks:[{w:'b',u:5,z:120},{w:'b',u:W-5,z:90},{w:'l',u:5.5,z:100},{w:'r',u:6,z:70}]};
  const hole=(x,z)=>{ const u=(x-mx)/(HOLEW/2); if(Math.abs(u)>=1)return null; const top=HOLEH-38+38*Math.sqrt(1-u*u); if(z>=top)return null; const rim=Math.min((1-Math.abs(u))*HOLEW/2*24,top-z);
    return rim<5?(Math.floor(x*24+z)%3?[34,30,28]:[46,42,38]):sh([10,8,8],.7+.3*Math.min(1,z/90)); };
  const look={floor:(x,y)=>R0.dungeonFloorCol(x,y,R),in:(b,nx,ny,x,y,z,f)=>{ if(ny>0&&Math.abs(y-R.y0)<.08){ const h=hole(x,z); if(h)return h; } return R0.dungeonWall(null,nx,ny,x,y,z,f,R); },
    out:(nx,ny,x,y,z,f,H)=>MK.museumOutside(OB,-nx,-ny,SX-x+dx,SY-y+dy,z,f,H)||sh(stone,f),cope:stone};
  const mp=(k,x,y,rot=0)=>{ const f=CATALOG[k]; SHARED.BOD.K.STUDIO.face(FW[rot]); let p; try{ p=f(+x.toFixed(3),+y.toFixed(3)); }finally{ SHARED.BOD.K.STUDIO.face(null); } if(!p)return null; p.kind=k; const cx=(p.x0+p.x1)/2, cy=(p.y0+p.y1)/2; SHARED.BOD.placeAt(p,2,cx,cy,SX-cx+dx,SY-cy+dy,true); return p; };
  const at=(x,y)=>[SX-x+dx,SY-y+dy];   // a spot in the bank, written in the museum's frame for mp
  rec('bank','THE BANK',B,D,true); STORE.bank={B};
  STORE.bank.out=FACADES.make({id:'bank',L:{x0:B.x0-.08,x1:B.x1+.08,y0:B.y0-.08,y1:B.y1+.08},z1:B.h+10,wall:stone,trim:[240,234,220],frame:[48,44,40],seed:23,ground:150,door:{u:D.a,w:DW/2,h:DH},glass:true});   // modelled over the painted stone (owner, 8 Nov 2026)
  STEPS.push(()=>{ '@later'; room('bank','THE BANK',B,look,D,()=>{ const py=MB.y0-3;
    mp('museum portico steps',M.mid,(py+MB.y0)/2); for(const d of [-4,-2.8,2.8,4])mp('museum column',M.mid+d,py+.7); mp('bank entablature',M.mid,py+.7,2);
    for(const [x,y,k] of [[mx-5.4,B.y0+3.2,'bone pile'],[mx+6.2,B.y0+5,'skull'],[mx-7,B.y1-4,'bones'],[mx+7,B.y1-3,'bones'],[mx+3.4,B.y0+2.4,'skull']])mp(k,...at(x,y));
    for(const [x,y,c,r] of [[B.x0+1,B.y0+4,[1.9,1.15,.55],12],[B.x1-1,B.y0+4,[1.9,1.15,.55],12],[B.x0+1,B.y1-4,[1.8,1.1,.5],11],[B.x1-1,B.y1-4,[1.8,1.1,.5],11],[mx,B.y0+5,[1.6,1.1,.5],10],[mx,B.y1-2,[1.4,1.1,.7],10]])
      LAMPS.push({own:1,room:1,day:true,x,y,z:120,r,c}); },{noWins:1});
    const S=STORE.inside.bank; if(S&&!S.done){ const g0=S.go; S.go=()=>{ g0(); lair(); if(STORE.furnish&&STORE.furnish.bank)STORE.furnish.bank(STORE.bank); }; } });
  // the hoard: what is drawn in 3D, made the first time you go in
  const lair=()=>{ '@later'; const X=SHARED.BOD.X, Z=SHARED.BOD.Z, Y=SHARED.BOD.Y, TU=X(1)-X(0), wallZ=Z(B.y0+T), HH=Y(B.h), clip=[new THREE.Plane(new THREE.Vector3(0,0,1),-wallZ)], g=new THREE.Group(); g.name='bank hoard';
    const lam=(c,o={})=>new THREE.MeshLambertMaterial({color:c,flatShading:true,clippingPlanes:clip,...o});
    // the gold: heaped mounds (four up to the ceiling) and coins over them and the floor
    const gold=lam(0xc8962a,{emissive:0x3a2400}), goldL=lam(0xf0c850,{emissive:0x5a3c08}), PILES=[[B.x0+3.2,B.y0+3.4,3.2,1],[B.x1-3.2,B.y0+3.4,3.2,1],[B.x1-2.2,B.y1-2.4,2.2,1],[B.x0+2.2,B.y0+9,2,1],
      [mx-6.2,B.y0+2.4,2.2,.42],[mx+6.4,B.y0+2.6,2.4,.55],[B.x0+3,B.y1-3.4,1.9,.3],[mx+7.4,B.y0+8,1.6,.4],[mx-2.8,B.y0+2.2,1,.12],[mx+3,B.y0+2,1.2,.16],[mx-7.4,B.y0+6.6,1.3,.22]];
    const coinG=new THREE.CylinderGeometry(.09*TU,.09*TU,.025*TU,8), coins=[], hsh=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
    PILES.forEach(([x,y,r,hk],i)=>{ const h=HH*hk, rw=r*TU, pts=[]; for(let k=0;k<=9;k++){ const t=k/9; pts.push(new THREE.Vector2(rw*Math.pow(1-t,.75)*(1+(hsh(i,k)-.5)*.16)+.01,h*t)); }
      const me=new THREE.Mesh(new THREE.LatheGeometry(pts,11),i%3?gold:goldL); me.position.set(X(x),0,Z(y)); me.rotation.y=i; me.castShadow=me.receiveShadow=true; g.add(me); UI.thing({name:"THE DRAGON'S GOLD",obj:me,reach:1.2*TU+rw,near:2*TU+rw,tall:h,act:()=>steal()});
      for(let k=0;k<Math.round(30*r);k++){ const a=hsh(i,k+20)*6.283, t=hsh(i,k+40)*.92, rr=rw*Math.pow(1-t,.75)+.02; coins.push([X(x)+Math.cos(a)*rr,h*t+.02,Z(y)+Math.sin(a)*rr,hsh(i,k)]); }
      const s=rw*.62; SOL.up.push([X(x)-s,Z(y)-s,X(x)+s,Z(y)+s]); FIX.up.push([X(x)-s,Z(y)-s,0,X(x)+s,Z(y)+s,h]); });
    for(let k=0;k<420;k++){ const x=B.x0+.6+hsh(k,7)*(B.x1-B.x0-1.2), y=B.y0+.6+hsh(k,9)*(B.y1-B.y0-1.2); if(Math.abs(x-mx)<2.2&&y>B.y0+6)continue; coins.push([X(x),.015,Z(y),hsh(k,3)]); }
    const cm=new THREE.InstancedMesh(coinG,goldL,coins.length), M4=new THREE.Matrix4(), Q=new THREE.Quaternion(), E=new THREE.Euler(), V=new THREE.Vector3(), ONE=new THREE.Vector3(1,1,1);
    coins.forEach(([x,y,z,r],i)=>cm.setMatrixAt(i,M4.compose(V.set(x,y,z),Q.setFromEuler(E.set((r-.5)*1.4,r*6,(r-.3)*1.2)),ONE))); cm.receiveShadow=true; g.add(cm);
    // the dragon's head, asleep in the arch: 80% of the hole, only its eyes and snout come out past the wall (the rest is cut at the wall)
    const hw=HOLEW*TU*.8, hh=Y(HOLEH)*.8, k=hw/7.9, head=new THREE.Group(), G1=lam(0x225023), G2=lam(0x2f6630), G0=lam(0x163a19), BEL=lam(0x4e6e34), DK=lam(0x0a0d08), IV=lam(0xd8ccae);
    const part=(geo,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0)=>{ const me=new THREE.Mesh(geo,mat); me.position.set(x*k,y*k,z*k); me.scale.set(sx*k,sy*k,sz*k); me.rotation.set(rx,ry,rz); me.castShadow=true; head.add(me); return me; };
    // a lofted shape: rings of [z, width, height, middle y] from the wall out to the tip, flat on top like a dragon's snout
    const loft=S=>{ const N=10, P=[], I=[]; for(const [z,w,h,yc] of S)for(let a=0;a<N;a++){ const t=a/N*Math.PI*2, c=Math.cos(t), sn=Math.sin(t); P.push(c*w/2*(sn>.3?.92:1),yc+(sn>.3?Math.min(sn*1.25,1):sn)*h/2,z); }
      for(let r=0;r+1<S.length;r++)for(let a=0;a<N;a++){ const p0=r*N+a, p1=r*N+(a+1)%N; I.push(p0,p1,p0+N,p1,p1+N,p0+N); }
      const e=S[S.length-1], tip=P.length/3; P.push(0,e[3],e[0]+.25); for(let a=0;a<N;a++)I.push((S.length-1)*N+a,(S.length-1)*N+(a+1)%N,tip);
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setIndex(I); g.computeVertexNormals(); return g; };
    part(loft([[-1.6,6.6,4.6,2.5],[0,6.2,4.3,2.5],[1.2,5,3.3,2.3],[2.4,3.6,2.3,1.95],[3.6,3,1.85,1.8],[4.6,2.7,1.6,1.8],[5.2,2,1.15,1.65]]),G1,0,0,0,1,1,1);
    const jaw=part(loft([[-1,5.6,1.6,.8],[1,4.4,1.3,.7],[3,3,1,.55],[4.6,2.3,.8,.45],[5,1.8,.5,.45]]),BEL,0,0,0,1,1,1);
    const ball=new THREE.IcosahedronGeometry(1,1), box=new THREE.BoxGeometry(1,1,1), cone=new THREE.ConeGeometry(1,1,6);
    const EYE=new THREE.MeshBasicMaterial({color:0xffb020}), eyes=[];
    for(const s of [-1,1]){
      const lid=part(ball,G2,s*2.35,3.2,.75,1.05,.6,.9,0,s*.5), shut=part(box,DK,s*2.62,3.12,1.42,1.15,.07,.09,0,s*.5,s*-.1);   // a closed eye: the lid and its shut line
      const eye=part(ball,EYE,s*2.42,3.12,.95,.82,.5,.7,0,s*.5), pupil=part(box,DK,s*2.82,3.12,1.66,.12,.62,.08,0,s*.5); eye.visible=pupil.visible=false; eyes.push({lid,shut,eye,pupil});   // the eye under it, shown when it wakes
      part(box,G0,s*2.2,3.85,.85,1.9,.5,1.25,.12,s*.35,s*.25); for(let i=0;i<3;i++)part(cone,G0,s*(1.8+i*.5),4.25+i*.1,.2-i*.3,.18,.75,.18,-.7,0,s*-.35);   // the brow and its spikes
      part(ball,G2,s*.72,2.6,4.75,.44,.3,.44); part(ball,DK,s*.72,2.62,5.08,.22,.15,.12);   // a nostril
      part(cone,IV,s*1.15,.95,4.3,.15,.7,.15,Math.PI); part(cone,IV,s*1.45,1.02,3.4,.11,.45,.11,Math.PI);   // fangs over the lip
      for(let i=0;i<3;i++)part(cone,G0,s*(3+i*.15),1.6+i*.75,.25-i*.15,.2,.9,.2,0,0,s*-1.25);   // cheek spikes
      part(cone,IV,s*2.4,4.4,-.3,.4,2.4,.4,-1.0,0,s*-.25); }   // a horn (mostly behind the wall)
    for(let i=0;i<6;i++)part(cone,G0,0,3.25+i*.22-(i<2?.25:0),4-i*.85,.17,.55,.17,-.4);   // the ridge down the nose
    head.position.set(X(mx),0,wallZ); g.add(head);
    { const hx=3.4*k, hz=5.4*k; SOL.up.push([X(mx)-hx,wallZ,X(mx)+hx,wallZ+hz]); FIX.up.push([X(mx)-hx,wallZ,0,X(mx)+hx,wallZ+hz,hh]); }
    // its steam: puffs out of both nostrils as it breathes out
    const cv=document.createElement('canvas'); cv.width=cv.height=32; const cx=cv.getContext('2d'), gr=cx.createRadialGradient(16,16,0,16,16,16); gr.addColorStop(0,'rgba(235,235,230,.9)'); gr.addColorStop(1,'rgba(235,235,230,0)'); cx.fillStyle=gr; cx.fillRect(0,0,32,32);
    const ST=new THREE.CanvasTexture(cv), puffs=[...Array(18)].map(()=>{ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:ST,transparent:true,depthWrite:false,opacity:0})); s.visible=false; g.add(s); return {s,t:9}; });
    const noseL=[-1,1].map(s=>new THREE.Vector3(s*.72*k,2.62*k,5.15*k)), nose=()=>{ head.updateMatrixWorld(true); return noseL.map(v=>head.localToWorld(v.clone())); };
    scene.add(g); PERFX.own(g); STORE.bank.hoard=g; STORE.bank.head=head;
    const inB=()=>pos.x>Math.min(X(B.x0),X(B.x1))&&pos.x<Math.max(X(B.x0),X(B.x1))&&pos.z>Math.min(Z(B.y0),Z(B.y1))&&pos.z<Math.max(Z(B.y0),Z(B.y1));
    // it wakes when you come near: its eyes open, it lifts its head and follows you, snorts and growls; it settles back to sleep a while after you leave
    let t=0, out=false, pi=0, W=0, awake=false, away=0; const HZ=wallZ+3*k, snort=n=>{ const N=nose(); for(let i=0;i<n;i++){ const p=puffs[pi++%puffs.length]; p.t=-i*.06; p.n=N[i&1]; } };
    // take its gold and it breathes fire: you burn up where you stand (the handful falls back on the heap)
    const ft=document.createElement('canvas'); ft.width=ft.height=32; { const c=ft.getContext('2d'), q=c.createRadialGradient(16,16,0,16,16,16); q.addColorStop(0,'rgba(255,250,210,1)'); q.addColorStop(.35,'rgba(255,190,60,.9)'); q.addColorStop(1,'rgba(220,60,10,0)'); c.fillStyle=q; c.fillRect(0,0,32,32); }
    const FT=new THREE.CanvasTexture(ft), FC=[new THREE.Color(0xfff2b0),new THREE.Color(0xffa030),new THREE.Color(0xd83a10)], flames=[...Array(110)].map(()=>{ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:FT,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0})); s.visible=false; g.add(s); return {s,t:9,a:new THREE.Vector3(),b:new THREE.Vector3(),j:new THREE.Vector3()}; });
    let fire=-1, fi=0, burnt=false, f0=0; const MOUTH=new THREE.Vector3(0,1.15*k,5.4*k), steal=()=>{ if(fire>=0||VIT.dead)return; fire=0; f0=performance.now(); burnt=false; awake=true; W=Math.max(W,.8); SFX.play('boom',{vol:.7,pitch:.6}); SAY('YOU REACH INTO THE GOLD. THE DRAGON WAKES.','#f2a35e'); };
    STORE.bank.steal=steal;
    STORE.bank.dragon=()=>({awake,W:+W.toFixed(2),d:+(Math.hypot(pos.x-X(mx),pos.z-HZ)/TU).toFixed(1),fire:+fire.toFixed(2)});
    SYS.add('places',dt=>{ if(!g.parent||!inB()){ awake=false; W=0; return; } dt=Math.min(dt||0,.1); const d=Math.hypot(pos.x-X(mx),pos.z-HZ);
      const now=performance.now(); if(d<7*TU){ away=0; if(!awake){ awake=true; snort(10); SFX.play('boom',{vol:.35,pitch:.45}); } } else if(awake){ if(!away)away=now; else if(now-away>3000)awake=false; }
      W+=((awake?1:0)-W)*Math.min(1,dt*(awake?2.2:.6)); t+=dt*(1+W*.7);
      const ph=(t%5.2)/5.2, br=ph<.62?Math.sin(ph/.62*Math.PI/2):Math.cos((ph-.62)/.38*Math.PI/2), want=Math.max(-.5,Math.min(.5,Math.atan2(pos.x-X(mx),pos.z-wallZ)));
      head.position.y=br*.06*k+W*.45*k; head.scale.set(1,1+br*.012,1); head.rotation.set(-.14*W,want*W,0);
      for(const e of eyes){ e.lid.scale.y=.6*k*(1-.72*W); e.lid.position.y=(3.2+.38*W)*k; e.shut.visible=W<.25; e.eye.visible=e.pupil.visible=W>.05; e.pupil.scale.x=.12*k*(1.3-W*.6); }
      if(ph>=.62&&!out){ out=true; snort(6); } else if(ph<.62)out=false;
      if(fire>=0){ fire+=dt; jaw.rotation.x=Math.min(1,fire*6)*.32*(fire<1.4?1:Math.max(0,1-(fire-1.4)*3)); head.updateMatrixWorld(true); const m=head.localToWorld(MOUTH.clone()), tg=new THREE.Vector3(pos.x,SHARED.py+.9*TU,pos.z);
        if(fire<1.4)for(let n=0;n<Math.max(3,Math.round(dt*240));n++){ const f=flames[fi++%flames.length]; f.t=-Math.random()*dt; f.a.copy(m); f.b.copy(tg); f.j.set(Math.random()-.5,Math.random()-.5,Math.random()-.5).multiplyScalar(.9*TU); }
        if(performance.now()-f0>350&&!burnt){ burnt=true; SFX.play('boom',{vol:.5,pitch:.9}); VIT.die(); SAY('THE DRAGON BURNS YOU TO ASHES. THE GOLD FALLS BACK ON THE HEAP.','#ff7a40'); }
        if(fire>2.4)fire=-1; }
      for(const f of flames){ if(f.t>.45){ f.s.visible=false; continue; } f.t+=dt; if(f.t<0)continue; const u=f.t/.45; f.s.visible=true; f.s.position.lerpVectors(f.a,f.b,Math.min(1,u*1.15)).addScaledVector(f.j,u);
        f.s.scale.setScalar((.35+u*1.5)*k); f.s.material.color.copy(u<.35?FC[0]:u<.7?FC[1]:FC[2]); f.s.material.opacity=.95*(1-u); }
      for(const p of puffs){ if(p.t>2.4){ p.s.visible=false; continue; } p.t+=dt; if(p.t<0)continue; const u=p.t/2.4; p.s.visible=true; p.s.position.set(p.n.x+(p.n.x-X(mx))*u*1.6,p.n.y-u*.3*k,p.n.z+u*1.8*k);
        p.s.scale.setScalar((.15+u*1.2)*k); p.s.material.opacity=.24*(1-u)*Math.min(1,u*6); } },'059h-bank'); };
});
