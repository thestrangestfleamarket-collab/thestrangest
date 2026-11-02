// ROAM: the holodeck's space flight. Pick it in the holodeck and it fades you into the cockpit of a small ship among the meteors far off the map: a real cockpit round you (stick, throttle, screens, the canopy's struts), full 360° flight with a flight assist, boost, lasers and missiles that blow small rocks apart and break big ones up a piece at a time; ramming rocks wears the hull down and a dead hull sends you back to the holodeck. The ship owns the controls and the camera through SHARED.drive (the frame, the headset and the gamepad read it); on screen the mouse or the arrows aim, in the headset the Quest sticks fly.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, PAD, pos, PS2, ROOMS, SFX, UI, VR, W3} from './003b-systems.js';
import {PCAM, renderer, scene} from './004-main.js';
import {FADE, STORE, SYS, TILE} from './006-map-pre.js';
{ const H=STORE.holo, T=TILE, M=T/.84, say=(t,c)=>FORAGE.say&&FORAGE.say(t,c), V3=THREE.Vector3, Q4=THREE.Quaternion;
  const WX=-4200, WZ=0, FIELD=620;
  const ROAM=window.ROAM={on:false};
  let D=null, API=null;

  const MAKE=()=>{ '@roam';
    const TAU=Math.PI*2, cl=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,k)=>a+(b-a)*k;
    let seed=11; const R=()=>{ seed=(Math.imul(seed,1103515245)+12345)&0x7fffffff; return seed/0x7fffffff; }, RR=(a,b)=>a+R()*(b-a);
    const hash=(x,y,z)=>{ let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(z|0,1442695041); h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
    const sm=t=>t*t*(3-2*t);
    const vnoise=(x,y,z)=>{ const X=Math.floor(x),Y=Math.floor(y),Z=Math.floor(z), fx=sm(x-X),fy=sm(y-Y),fz=sm(z-Z); const c=(i,j,k)=>hash(X+i,Y+j,Z+k);
      return lerp(lerp(lerp(c(0,0,0),c(1,0,0),fx),lerp(c(0,1,0),c(1,1,0),fx),fy),lerp(lerp(c(0,0,1),c(1,0,1),fx),lerp(c(0,1,1),c(1,1,1),fx),fy),fz); };
    const fbm=(x,y,z)=>vnoise(x,y,z)*.55+vnoise(x*2.1+7,y*2.1+3,z*2.1+1)*.27+vnoise(x*4.3+2,y*4.3+9,z*4.3+5)*.18;

    // the paint kit: textures made in code (no download): grain, blurred blotches, scratches, and a normal map from a height picture
    const cv=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; };
    const tex=(c,srgb,rep)=>{ const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; if(srgb)t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); if(rep)t.repeat.set(rep,rep); return t; };
    const fill=(g,w,h,col)=>{ g.fillStyle=col; g.fillRect(0,0,w,h); };
    const blotch=(g,w,h,n,r0,r1,a,lo,hi,blur)=>{ g.save(); if(blur)g.filter='blur('+blur+'px)'; for(let i=0;i<n;i++){ const v=Math.round(RR(lo,hi)); g.fillStyle='rgba('+v+','+v+','+v+','+a+')'; const r=RR(r0,r1); g.beginPath(); g.ellipse(R()*w,R()*h,r,r*RR(.5,1.4),R()*Math.PI,0,TAU); g.fill(); } g.restore(); };
    const grain=(g,w,h,n,a,lo,hi)=>{ for(let i=0;i<n;i++){ const v=Math.round(RR(lo,hi)); g.fillStyle='rgba('+v+','+v+','+v+','+a+')'; g.fillRect(R()*w,R()*h,1+R()*1.5,1+R()*1.5); } };
    const scratches=(g,w,h,n,a,lo,hi,len)=>{ g.lineCap='round'; for(let i=0;i<n;i++){ const v=Math.round(RR(lo,hi)); g.strokeStyle='rgba('+v+','+v+','+v+','+a*RR(.4,1)+')'; g.lineWidth=RR(.4,1.3); const x=R()*w,y=R()*h,an=R()*TAU,l=RR(len*.2,len); g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(an)*l,y+Math.sin(an)*l); g.stroke(); } };
    const normalOf=(hc,s)=>{ const w=hc.width,h=hc.height, d=hc.getContext('2d').getImageData(0,0,w,h).data, out=cv(w,h), o=out.getContext('2d'), im=o.createImageData(w,h), p=im.data;
      const Hh=(x,y)=>d[(((y+h)%h)*w+((x+w)%w))*4]; for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const dx=(Hh(x+1,y)-Hh(x-1,y))/255*s, dy=(Hh(x,y+1)-Hh(x,y-1))/255*s, l=1/Math.hypot(dx,dy,1), i=(y*w+x)*4; p[i]=(-dx*l*.5+.5)*255; p[i+1]=(dy*l*.5+.5)*255; p[i+2]=l*255; p[i+3]=255; } o.putImageData(im,0,0); return out; };
    const std=o=>new THREE.MeshStandardMaterial(o);

    // brushed, scratched steel
    const steel=()=>{ const w=512,h=512, c=cv(w,h), g=c.getContext('2d'), hc=cv(w,h), hg=hc.getContext('2d'), rc=cv(w,h), rg=rc.getContext('2d');
      fill(g,w,h,'#6a6e76'); for(let y=0;y<h;y++){ const v=Math.round(RR(92,122)); g.fillStyle='rgba('+v+','+v+','+(v+6)+',.35)'; g.fillRect(0,y,w,1); } blotch(g,w,h,40,30,120,.08,40,90,14); grain(g,w,h,9000,.12,60,150);
      fill(hg,w,h,'#808080'); for(let y=0;y<h;y++){ const v=Math.round(RR(118,138)); hg.fillStyle='rgba('+v+','+v+','+v+',.5)'; hg.fillRect(0,y,w,1); } scratches(hg,w,h,160,.6,150,230,120); scratches(g,w,h,160,.25,150,210,120);
      fill(rg,w,h,'#8a8a8a'); for(let y=0;y<h;y++){ const v=Math.round(RR(120,160)); rg.fillStyle='rgba('+v+','+v+','+v+',.5)'; rg.fillRect(0,y,w,1); } scratches(rg,w,h,160,.6,40,90,120); blotch(rg,w,h,30,40,140,.25,150,210,16);
      return std({map:tex(c,1),normalMap:tex(normalOf(hc,1.6)),roughnessMap:tex(rc),roughness:1,metalness:.9,color:0xffffff}); };
    // dark painted panels with chipped edges, screws and worn labels
    const paint=(col,labels)=>{ const w=512,h=512, c=cv(w,h), g=c.getContext('2d'), hc=cv(w,h), hg=hc.getContext('2d');
      fill(g,w,h,col); blotch(g,w,h,60,30,140,.07,0,60,12); grain(g,w,h,12000,.09,30,140); fill(hg,w,h,'#7a7a7a'); grain(hg,w,h,8000,.25,90,150);
      for(let i=0;i<4;i++){ const x=i*128+8,y=i%2?12:260; g.strokeStyle='rgba(0,0,0,.55)'; g.lineWidth=2; g.strokeRect(x,y,112,236); hg.strokeStyle='#222'; hg.lineWidth=3; hg.strokeRect(x,y,112,236);
        for(const [sx,sy] of [[x+8,y+8],[x+104,y+8],[x+8,y+228],[x+104,y+228]]){ g.fillStyle='#9a9ea4'; g.beginPath(); g.arc(sx,sy,3.5,0,TAU); g.fill(); g.strokeStyle='#2a2a2a'; g.lineWidth=1; g.beginPath(); g.moveTo(sx-2.5,sy); g.lineTo(sx+2.5,sy); g.stroke(); hg.fillStyle='#f0f0f0'; hg.beginPath(); hg.arc(sx,sy,3.5,0,TAU); hg.fill(); } }
      scratches(g,w,h,90,.5,150,200,40); scratches(hg,w,h,90,.5,170,230,40);   // chips down to the metal
      if(labels){ g.font='bold 11px Arial, sans-serif'; g.fillStyle='rgba(230,230,220,.75)'; labels.forEach((l,i)=>g.fillText(l,20+(i%4)*128,50+Math.floor(i/4)*250)); }
      for(let i=0;i<22;i++){ g.fillStyle=i%2?'#e0b020':'#141414'; g.fillRect(i*24-8,500,24,12); }   // a hazard strip along the bottom
      return std({map:tex(c,1),normalMap:tex(normalOf(hc,1.2)),roughness:.62,metalness:.25,color:0xffffff}); };
    const leather=()=>{ const w=512,h=512, c=cv(w,h), g=c.getContext('2d'), hc=cv(w,h), hg=hc.getContext('2d');
      fill(g,w,h,'#2a201b'); blotch(g,w,h,80,20,90,.1,20,70,10); grain(g,w,h,20000,.12,20,110); fill(hg,w,h,'#808080'); grain(hg,w,h,30000,.45,40,220); blotch(hg,w,h,40,60,160,.2,100,180,12);
      g.strokeStyle='rgba(200,170,120,.8)'; g.setLineDash([6,5]); g.lineWidth=2; hg.strokeStyle='#f0f0f0'; hg.setLineDash([6,5]); hg.lineWidth=2;   // stitching
      for(const y of [128,256,384]){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); hg.beginPath(); hg.moveTo(0,y); hg.lineTo(w,y); hg.stroke(); }
      return std({map:tex(c,1),normalMap:tex(normalOf(hc,1.5)),roughness:.72,metalness:0,color:0xffffff}); };
    const grating=()=>{ const w=256,h=256, c=cv(w,h), g=c.getContext('2d'), hc=cv(w,h), hg=hc.getContext('2d'); fill(g,w,h,'#3a3d42'); fill(hg,w,h,'#f0f0f0'); grain(g,w,h,4000,.15,20,120);
      for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=32){ g.fillStyle='#0b0c0e'; g.fillRect(x+5,y+5,22,22); hg.fillStyle='#000'; hg.fillRect(x+5,y+5,22,22); }
      return std({map:tex(c,1,4),normalMap:tex(normalOf(hc,2.4),0,4),roughness:.7,metalness:.6,color:0xffffff}); };
    const rockTex=(base,dark)=>{ const w=512,h=512, c=cv(w,h), g=c.getContext('2d'), hc=cv(w,h), hg=hc.getContext('2d'); fill(g,w,h,base); blotch(g,w,h,90,20,140,.18,0,60,10); blotch(g,w,h,60,10,60,.14,120,220,6); grain(g,w,h,30000,.14,0,160);
      fill(hg,w,h,'#8a8a8a'); blotch(hg,w,h,90,20,140,.35,40,200,10); blotch(hg,w,h,200,3,16,.5,0,70,2); grain(hg,w,h,20000,.4,0,255);
      for(let i=0;i<14;i++){ const x=R()*w,y=R()*h,r=RR(14,46); const rg=hg.createRadialGradient(x,y,0,x,y,r); rg.addColorStop(0,'rgba(20,20,20,.9)'); rg.addColorStop(.75,'rgba(90,90,90,.5)'); rg.addColorStop(.9,'rgba(230,230,230,.8)'); rg.addColorStop(1,'rgba(140,140,140,0)'); hg.fillStyle=rg; hg.fillRect(x-r,y-r,r*2,r*2);
        const cg=g.createRadialGradient(x,y,0,x,y,r); cg.addColorStop(0,dark); cg.addColorStop(.8,'rgba(0,0,0,0)'); g.fillStyle=cg; g.fillRect(x-r,y-r,r*2,r*2); }
      return std({map:tex(c,1,2),normalMap:tex(normalOf(hc,3),0,2),roughness:.96,metalness:.02,color:0xffffff}); };

    // a rock: an icosphere pushed about by noise and dented with craters, its normals smoothed across the seams
    const CR=[]; for(let v=0;v<3;v++){ const L=[]; for(let i=0;i<9;i++){ const p=new V3(RR(-1,1),RR(-1,1),RR(-1,1)).normalize(); L.push({p,r:RR(.16,.5),d:RR(.06,.2)}); } CR.push(L); }
    const rockGeo=(v,detail)=>{ const g=new THREE.IcosahedronGeometry(1,detail), P=g.attributes.position, n=P.count, U=new V3();
      for(let i=0;i<n;i++){ U.fromBufferAttribute(P,i).normalize(); const x=U.x+v*7.1,y=U.y+v*3.3,z=U.z-v*5.7; let r=1+(fbm(x*1.3,y*1.3,z*1.3)-.5)*.8+(fbm(x*4,y*4,z*4)-.5)*.2;
        for(const c of CR[v]){ const d=U.distanceTo(c.p); if(d<c.r){ const t=d/c.r, bowl=-(1-t*t)*(1-t*t), rim=.4*Math.exp(-((t-.92)/.14)*((t-.92)/.14)); r+=c.d*(bowl+rim); } } P.setXYZ(i,U.x*r,U.y*r,U.z*r); }
      g.computeVertexNormals(); const N=g.attributes.normal, S=new Map(); const key=i=>Math.round(P.getX(i)*2e3)+','+Math.round(P.getY(i)*2e3)+','+Math.round(P.getZ(i)*2e3);
      for(let i=0;i<n;i++){ const k=key(i); let a=S.get(k); if(!a){ a=[0,0,0]; S.set(k,a); } a[0]+=N.getX(i); a[1]+=N.getY(i); a[2]+=N.getZ(i); }
      for(let i=0;i<n;i++){ const a=S.get(key(i)), l=1/(Math.hypot(a[0],a[1],a[2])||1); N.setXYZ(i,a[0]*l,a[1]*l,a[2]*l); } N.needsUpdate=true; g.computeBoundingSphere(); return g; };

    // the room: ROOT (scaled to metres) holds SKY (never turns), WORLD (the rocks, moved past the ship) and SHIP (turns with you)
    const ROOT=new THREE.Group(); ROOT.name='roam'; ROOT.position.set(WX,0,WZ); ROOT.scale.setScalar(M); ROOT.userData.anyRoom=1;
    const SKY=new THREE.Group(), WORLD=new THREE.Group(), SHIP=new THREE.Group(); ROOT.add(SKY,WORLD,SHIP);
    const SUNDIR=new V3(.55,.35,-.75).normalize();
    const sun=new THREE.DirectionalLight(0xfff2e0,2.6); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); sun.shadow.bias=-.0008; sun.shadow.normalBias=.02;
    { const sc=sun.shadow.camera; sc.left=sc.bottom=-3.2*M; sc.right=sc.top=3.2*M; sc.near=.5*M; sc.far=40*M; sc.updateProjectionMatrix(); }
    const hemi=new THREE.HemisphereLight(0x6c7078,0x101216,.12);
    const MAT={steel:steel(),paint:paint('#2b2f37',['FUEL','O2','NAV','ARM','PWR','COMM','ECS','HULL']),dark:paint('#1c1e23'),leather:leather(),grate:grating(),rubber:std({color:0x121214,roughness:.92,metalness:.05}),
      glass:new THREE.MeshPhysicalMaterial({color:0x9fb6c9,transparent:true,opacity:.13,roughness:.06,metalness:0,clearcoat:1,clearcoatRoughness:.08,side:THREE.DoubleSide,depthWrite:false}),
      rocks:[rockTex('#7b7772','rgba(40,38,36,.9)'),rockTex('#6e5744','rgba(50,34,22,.9)'),rockTex('#4d5057','rgba(18,20,26,.9)')]};
    const flat=o=>new THREE.MeshBasicMaterial(Object.assign({fog:false,toneMapped:false},o));
    const disposables=[]; const keep=x=>{ disposables.push(x); return x; };
    const mesh=(geo,mat,x,y,z,cast,recv)=>{ const m=new THREE.Mesh(keep(geo),mat); m.position.set(x,y,z); m.castShadow=!!cast; m.receiveShadow=recv!==false; return m; };
    const box=(w,h,d,mat,x,y,z,cast)=>mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,cast);

    // THE COCKPIT, in metres, the eye at the origin, forward -Z
    const dash=box(1.6,.07,.6,MAT.paint,0,-.44,-.82,true); dash.rotation.x=.22; SHIP.add(dash);
    SHIP.add(box(1.6,.42,.08,MAT.dark,0,-.68,-1.06,true)); SHIP.add(box(1.7,.06,.5,MAT.steel,0,-.9,-.85,true));   // the fascia and the shelf under it
    const SCR=[]; const screen=(x,y,z,w,h,draw)=>{ const c=cv(320,200), g=c.getContext('2d'), t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4;
      const bez=box(w+.05,h+.05,.03,MAT.dark,x,y,z,true); bez.rotation.x=-.5; const s=mesh(new THREE.PlaneGeometry(w,h),flat({map:t}),x,y,z,false,false); s.rotation.x=-.5; s.position.z+=.017*Math.cos(.5); s.position.y+=.017*Math.sin(.5);
      SHIP.add(bez,s); SCR.push({c,g,t,draw}); return s; };
    for(const x of [-.5,0,.5])screen(x,-.33,-.8,.36,.23);
    const sideC=[-.6,.6].map(x=>{ const c=box(.34,.1,.8,MAT.paint,x,-.5,-.25,true); SHIP.add(c); return c; });
    for(let i=0;i<10;i++){ const x=-.6+i*.133, sw=box(.035,.05,.03,MAT.rubber,x,-.52,-1.0,false); sw.rotation.x=R()>.5?.4:-.4; SHIP.add(sw); const led=mesh(new THREE.SphereGeometry(.007,8,6),flat({color:[0x30ff60,0xffb020,0x40a0ff,0xff3030][i%4]}),x,-.47,-1.02,false,false); SHIP.add(led); }
    const stick=new THREE.Group(); stick.position.set(.6,-.45,-.2); { const base=mesh(new THREE.CylinderGeometry(.06,.08,.05,16),MAT.steel,0,0,0,true); const shaft=mesh(new THREE.CylinderGeometry(.013,.016,.2,10),MAT.steel,0,.1,0,true); const grip=mesh(new THREE.CapsuleGeometry(.024,.11,6,12),MAT.rubber,0,.25,0,true); const trig=box(.012,.03,.015,MAT.rubber,0,.22,-.03,false); const hat=mesh(new THREE.SphereGeometry(.009,8,6),flat({color:0xff4040}),0,.31,0,false,false); stick.add(base,shaft,grip,trig,hat); } SHIP.add(stick);
    const thr=new THREE.Group(); thr.position.set(-.6,-.45,-.2); { const slot=box(.05,.01,.3,MAT.dark,0,0,0,false); const arm=mesh(new THREE.BoxGeometry(.018,.16,.03),MAT.steel,0,.08,0,true); arm.name='arm'; const knob=box(.07,.05,.07,MAT.rubber,0,.17,0,true); knob.name='knob'; thr.add(slot,arm,knob); } SHIP.add(thr);
    const seatBack=box(.56,.72,.12,MAT.leather,0,-.38,.3,true); seatBack.rotation.x=-.12; const seat=box(.56,.1,.5,MAT.leather,0,-.78,.05,true), head=box(.3,.2,.1,MAT.leather,0,.14,.26,true); SHIP.add(seatBack,seat,head);
    for(const sx of [-1,1]){ SHIP.add(box(.1,.14,.5,MAT.leather,sx*.33,-.72,.05,true)); const strap=box(.05,.7,.02,MAT.rubber,sx*.14,-.4,.23,false); strap.rotation.x=-.12; strap.rotation.z=sx*.12; SHIP.add(strap); SHIP.add(box(.08,.5,1.7,MAT.paint,sx*.8,-.68,-.3,true)); }
    SHIP.add(box(1.7,.04,1.7,MAT.grate,0,-1.16,-.3,false)); for(const sx of [-1,1]){ const p=box(.12,.02,.2,MAT.rubber,sx*.18,-1.02,-.95,false); p.rotation.x=.5; SHIP.add(p); }
    SHIP.add(box(1.7,1.5,.08,MAT.dark,0,-.3,.62,true));
    // the canopy: a stretched dome of glass with steel struts along it
    const DOME=new V3(0,-.15,-.25), DS=new V3(1.15,1.0,1.75), onDome=(th,ph)=>new V3(Math.sin(ph)*Math.cos(th)*DS.x,Math.cos(ph)*DS.y,-Math.sin(ph)*Math.sin(th)*DS.z).add(DOME);
    { const g=new THREE.SphereGeometry(1,40,24,0,TAU,0,Math.PI*.56); g.scale(DS.x,DS.y,DS.z); const glass=mesh(g,MAT.glass,DOME.x,DOME.y,DOME.z,false,false); glass.renderOrder=3; SHIP.add(glass); }
    const strut=(pts,r)=>{ const c=new THREE.CatmullRomCurve3(pts), m=mesh(new THREE.TubeGeometry(c,32,r,8,false),MAT.steel,0,0,0,true); SHIP.add(m); return m; };
    strut(Array.from({length:9},(_,i)=>onDome(Math.PI/2,Math.PI*.05+i*Math.PI*.5/8)),.032);   // over the head, front to back
    for(const th of [Math.PI*.18,Math.PI*.82])strut(Array.from({length:9},(_,i)=>onDome(th,Math.PI*.1+i*Math.PI*.46/8)),.028);   // the side arcs
    strut(Array.from({length:17},(_,i)=>onDome(i/16*Math.PI,Math.PI*.56)),.04);   // the sill where glass meets hull
    strut(Array.from({length:11},(_,i)=>onDome(Math.PI*.15+i/10*Math.PI*.7,Math.PI*.34)),.022);   // the windshield's bow
    // the hull outside the glass: the nose, the wing stubs and the two cannons
    { const nose=mesh(new THREE.CylinderGeometry(.22,.62,3.6,8),MAT.dark,0,-1.3,-3.3,true); nose.rotation.x=-Math.PI/2; nose.rotation.y=Math.PI/8; SHIP.add(nose); SHIP.add(box(1.9,.3,1.2,MAT.dark,0,-1.25,-1.6,true));
      for(const sx of [-1,1]){ SHIP.add(box(1.3,.09,1.1,MAT.dark,sx*1.3,-1.05,-1.7,true)); const can=mesh(new THREE.CylinderGeometry(.07,.09,1.9,12),MAT.steel,sx*1.75,-.95,-2.6,true); can.rotation.x=-Math.PI/2; SHIP.add(can); const tip=mesh(new THREE.SphereGeometry(.05,10,8),flat({color:0xff5a20}),sx*1.75,-.95,-3.56,false,false); tip.name='tip'+sx; SHIP.add(tip);
        const lamp=mesh(new THREE.SphereGeometry(.035,8,6),flat({color:sx<0?0xff3030:0x30ff50}),sx*1.9,-1.0,-1.3,false,false); SHIP.add(lamp); } }
    const glow1=new THREE.PointLight(0xffb070,5,0,2); glow1.position.set(0,-.35,-.7); const glow2=new THREE.PointLight(0x5aa0ff,2.5,0,2); glow2.position.set(0,.25,.35); SHIP.add(glow1,glow2);
    const warn=mesh(new THREE.SphereGeometry(.02,10,8),flat({color:0x330000}),0,-.3,-1.0,false,false); SHIP.add(warn);
    // the sight: a ring where the cannons meet, red over a rock
    const ringCv=cv(128,128); { const g=ringCv.getContext('2d'); g.strokeStyle='#fff'; g.lineWidth=6; g.beginPath(); g.arc(64,64,40,0,TAU); g.stroke(); g.lineWidth=4; for(const [a,b,c,d] of [[64,4,64,22],[64,106,64,124],[4,64,22,64],[106,64,124,64]]){ g.beginPath(); g.moveTo(a,b); g.lineTo(c,d); g.stroke(); } g.beginPath(); g.arc(64,64,3,0,TAU); g.fillStyle='#fff'; g.fill(); }
    const ringT=new THREE.CanvasTexture(ringCv); const sight=new THREE.Sprite(new THREE.SpriteMaterial({map:ringT,color:0x60ff80,transparent:true,opacity:.85,depthTest:false,toneMapped:false})); sight.position.set(0,-.95,-70); sight.scale.setScalar(3.2); sight.renderOrder=5; SHIP.add(sight);

    // THE SKY: stars, the Milky Way, a sun, a ringed planet, two nebulae
    { const n=3200, P=new Float32Array(n*3), C=new Float32Array(n*3); for(let i=0;i<n;i++){ const u=R()*2-1, a=R()*TAU, r=Math.sqrt(1-u*u), k=4400; P[i*3]=r*Math.cos(a)*k; P[i*3+1]=u*k; P[i*3+2]=r*Math.sin(a)*k; const w=RR(.3,1), t=R(); C[i*3]=w*(t<.2?.8:1); C[i*3+1]=w*(t<.2?.85:t>.85?.9:1); C[i*3+2]=w*(t<.2?1:t>.85?.7:1); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); const dot=cv(32,32), dg=dot.getContext('2d'), rg=dg.createRadialGradient(16,16,0,16,16,16); rg.addColorStop(0,'#fff'); rg.addColorStop(.3,'rgba(255,255,255,.8)'); rg.addColorStop(1,'rgba(255,255,255,0)'); dg.fillStyle=rg; dg.fillRect(0,0,32,32);
      SKY.add(new THREE.Points(keep(g),new THREE.PointsMaterial({size:2.6,sizeAttenuation:false,map:new THREE.CanvasTexture(dot),vertexColors:true,transparent:true,depthWrite:false,fog:false,toneMapped:false}))); }
    { const c=cv(1024,512), g=c.getContext('2d'); g.save(); g.filter='blur(14px)'; for(let i=0;i<260;i++){ const x=R()*1024, y=256+(R()+R()+R()-1.5)*70, r=RR(10,60), v=Math.round(RR(150,230)); g.fillStyle='rgba('+v+','+(v-10)+','+(v+20)+','+RR(.05,.16)+')'; g.beginPath(); g.ellipse(x,y,r*2,r,R()*Math.PI,0,TAU); g.fill(); } g.restore(); g.save(); g.filter='blur(6px)'; for(let i=0;i<60;i++){ const x=R()*1024, y=256+(R()+R()-1)*50, r=RR(8,30); g.fillStyle='rgba(10,8,16,'+RR(.2,.5)+')'; g.beginPath(); g.ellipse(x,y,r*2,r,R()*Math.PI,0,TAU); g.fill(); } g.restore();
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; const mw=mesh(new THREE.SphereGeometry(4300,32,16),flat({map:t,transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending}),0,0,0,false,false); mw.rotation.set(.6,.3,.4); SKY.add(mw); }
    const glowCv=(c0,c1)=>{ const c=cv(128,128), g=c.getContext('2d'), rg=g.createRadialGradient(64,64,0,64,64,64); rg.addColorStop(0,c0); rg.addColorStop(.25,c1); rg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=rg; g.fillRect(0,0,128,128); return new THREE.CanvasTexture(c); };
    { const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowCv('#ffffff','rgba(255,214,150,.9)'),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false})); s.position.copy(SUNDIR).multiplyScalar(4200); s.scale.setScalar(900); SKY.add(s); }
    { const c=cv(1024,512), g=c.getContext('2d'); const bands=['#c9a97a','#e3cfa5','#a9825a','#d9bb8e','#8c6a4b','#e8d6b4','#b28b61']; for(let y=0;y<512;y++){ const b=bands[Math.floor((y/512*14+Math.sin(y*.07)*.8))%bands.length]; g.fillStyle=b; g.fillRect(0,y,1024,1); } g.save(); g.filter='blur(5px)'; for(let i=0;i<300;i++){ const y=R()*512, x=R()*1024, w=RR(40,200), v=Math.round(RR(120,240)); g.fillStyle='rgba('+v+','+(v-30)+','+(v-70)+','+RR(.08,.22)+')'; g.beginPath(); g.ellipse(x,y,w,RR(3,9),0,0,TAU); g.fill(); } g.restore();
      { const rg=g.createRadialGradient(700,330,0,700,330,70); rg.addColorStop(0,'#e4b9a0'); rg.addColorStop(.7,'rgba(190,120,90,.7)'); rg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=rg; g.beginPath(); g.ellipse(700,330,110,52,0,0,TAU); g.fill(); }
      const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; const pl=mesh(new THREE.SphereGeometry(430,48,32),std({map:t,roughness:1,metalness:0,emissive:0x1a1410,emissiveMap:t,emissiveIntensity:.35}),0,0,0,false,false); pl.position.set(2900,-1900,-2600); pl.rotation.z=.4; SKY.add(pl);
      const rc=cv(512,8), rgc=rc.getContext('2d'); for(let x=0;x<512;x++){ const a=Math.max(0,Math.sin(x/512*Math.PI))*(.35+.65*vnoise(x*.09,0,0))*(x>60&&x<480?1:0); rgc.fillStyle='rgba(220,205,180,'+a.toFixed(3)+')'; rgc.fillRect(x,0,1,8); }
      const rt=new THREE.CanvasTexture(rc); rt.colorSpace=THREE.SRGBColorSpace; const rg=new THREE.RingGeometry(560,960,96,1); { const uv=rg.attributes.uv, p=rg.attributes.position; for(let i=0;i<uv.count;i++){ const r=Math.hypot(p.getX(i),p.getY(i)); uv.setXY(i,(r-560)/400,.5); } }
      const ring=mesh(rg,std({map:rt,alphaMap:rt,transparent:true,side:THREE.DoubleSide,roughness:.9,depthWrite:false}),0,0,0,false,false); ring.position.copy(pl.position); ring.rotation.set(Math.PI/2+.5,0,.4); SKY.add(ring); }
    for(const [dir,col] of [[new V3(-.7,.2,-.6),'rgba(140,60,200,.35)'],[new V3(.3,-.6,.7),'rgba(40,160,170,.3)']]){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowCv(col,col.replace(/[\d.]+\)$/,'.12)')),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,opacity:.8})); s.position.copy(dir).normalize().multiplyScalar(4000); s.scale.set(3600,2600,1); SKY.add(s); }

    // THE FIELD: rocks are instances of six shapes (three looks, small and big), each a chunk of a meteor; a meteor is one chunk or a cluster
    const GEO=[0,1,2].map(v=>[rockGeo(v,2),rockGeo(v,3)]); GEO.forEach(a=>a.forEach(keep));
    const IM=GEO.map((a,v)=>a.map((g,big)=>{ const m=new THREE.InstancedMesh(g,MAT.rocks[v],big?170:220); m.count=0; m.frustumCulled=false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); WORLD.add(m); return m; }));
    const SLOT=IM.map(a=>a.map(()=>[]));   // which chunk sits in each instance slot
    const chunks=[], meteors=[], M4=new THREE.Matrix4(), TQ=new Q4(), TV=new V3(), TV2=new V3(), TV3=new V3(), TC=new THREE.Color();
    const place=c=>{ const m=IM[c.v][c.big], L=SLOT[c.v][c.big]; if(m.count>=m.instanceMatrix.count){ c.i=-1; return; } c.i=m.count++; L[c.i]=c; m.setColorAt(c.i,TC.setHSL(RR(.05,.12),RR(.05,.2),RR(.42,.62))); if(m.instanceColor)m.instanceColor.needsUpdate=true; };
    const unplace=c=>{ if(c.i<0)return; const m=IM[c.v][c.big], L=SLOT[c.v][c.big], last=m.count-1, o=L[last]; if(o!==c){ L[c.i]=o; o.i=c.i; m.getMatrixAt(last,M4); m.setMatrixAt(c.i,M4); if(m.instanceColor){ m.getColorAt(last,TC); m.setColorAt(c.i,TC); m.instanceColor.needsUpdate=true; } } L.length=last; m.count=last; c.i=-1; };
    const mkMeteor=(cx,cy,cz,r)=>{ const v=Math.floor(R()*3), n=r<8?1:r<15?2+Math.floor(R()*3):6+Math.floor(R()*6), met={c:new V3(cx,cy,cz),r,vel:new V3(RR(-1,1),RR(-1,1),RR(-1,1)).multiplyScalar(RR(0,3.5)),chunks:[]};
      for(let k=0;k<n;k++){ const sc=n===1?r:r*RR(.5,.78), o=k?new V3(RR(-1,1),RR(-1,1),RR(-1,1)).normalize().multiplyScalar(r*RR(.15,.5)):new V3(), s=new V3(sc*RR(.8,1.2),sc*RR(.8,1.2),sc*RR(.8,1.2));
        const c={met,v,big:sc>6?1:0,i:-1,p:o.add(met.c),q:new Q4().setFromEuler(new THREE.Euler(R()*TAU,R()*TAU,R()*TAU)),s,r:Math.max(s.x,s.y,s.z)*1.28,spin:new V3(RR(-1,1),RR(-1,1),RR(-1,1)).multiplyScalar(n===1?RR(.1,.7):RR(.02,.12)),dead:false};
        met.chunks.push(c); chunks.push(c); place(c); } meteors.push(met); return met; };
    const seedField=()=>{ for(let i=0;i<120;i++){ const t=R(), r=t<.45?RR(3.5,8):t<.8?RR(8,15):RR(15,32); let p; for(let k=0;k<20;k++){ p=new V3(RR(-FIELD,FIELD),RR(-FIELD,FIELD),RR(-FIELD,FIELD)); if(p.length()>90&&!meteors.some(m=>m.c.distanceTo(p)<m.r+r+30))break; } mkMeteor(p.x,p.y,p.z,r); } };
    const writeChunk=c=>{ if(c.i<0)return; IM[c.v][c.big].setMatrixAt(c.i,M4.compose(c.p,c.q,c.s)); };

    // shots, missiles, shards, flashes
    const boltG=keep(new THREE.BoxGeometry(.14,.14,3.6)), boltM=flat({color:0xff7a35,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false});
    const BOLTS=Array.from({length:28},()=>{ const m=new THREE.Mesh(boltG,boltM); m.visible=false; WORLD.add(m); return {m,on:false,p:new V3(),v:new V3(),life:0}; });
    const shardIM=new THREE.InstancedMesh(keep(rockGeo(1,1)),MAT.rocks[0],320); shardIM.count=0; shardIM.frustumCulled=false; shardIM.instanceMatrix.setUsage(THREE.DynamicDrawUsage); WORLD.add(shardIM);
    const SH=[]; const shard=(p,v0,r)=>{ if(SH.length>=320)SH.shift(); SH.push({p:p.clone(),v:new V3(RR(-1,1),RR(-1,1),RR(-1,1)).normalize().multiplyScalar(RR(4,22)).add(v0),q:new Q4().setFromEuler(new THREE.Euler(R()*TAU,R()*TAU,R()*TAU)),spin:new V3(RR(-3,3),RR(-3,3),RR(-3,3)),s:r*RR(.08,.26),life:RR(1.6,3.2),t:0}); };
    const flashT=glowCv('#ffffff','rgba(255,170,90,.9)'), dustT=glowCv('rgba(120,110,100,.7)','rgba(90,85,80,.35)');
    const FX=Array.from({length:14},()=>{ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:flashT,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false})); s.visible=false; WORLD.add(s); const d=new THREE.Sprite(new THREE.SpriteMaterial({map:dustT,transparent:true,depthWrite:false,toneMapped:false})); d.visible=false; WORLD.add(d); return {s,d,on:false,t:0,r:1,p:new V3()}; });
    const BANG=[0,1].map(()=>{ const l=new THREE.PointLight(0xffa060,0,0,2); WORLD.add(l); return {l,t:0}; });
    const MIS=Array.from({length:6},()=>{ const g=new THREE.Group(); const body=mesh(new THREE.CylinderGeometry(.11,.11,1.3,10),MAT.steel,0,0,0,false,false); body.rotation.x=Math.PI/2; const nose=mesh(new THREE.ConeGeometry(.11,.34,10),MAT.dark,0,0,-.82,false,false); nose.rotation.x=-Math.PI/2; const band=mesh(new THREE.CylinderGeometry(.115,.115,.12,10),flat({color:0xffd040}),0,0,-.3,false,false); band.rotation.x=Math.PI/2;
      for(let k=0;k<4;k++){ const f=box(.02,.22,.26,MAT.dark,0,0,.55); f.rotation.z=k*Math.PI/2; f.position.set(Math.cos(k*Math.PI/2)*.14,Math.sin(k*Math.PI/2)*.14,.55); g.add(f); } const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:flashT,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,color:0xffa040})); fl.position.z=.85; fl.scale.setScalar(.9); g.add(body,nose,band,fl); g.visible=false; WORLD.add(g); return {g,fl,on:false,p:new V3(),v:new V3(),tgt:null,life:0,st:0}; });
    const SMOKE=Array.from({length:70},()=>{ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:dustT,transparent:true,depthWrite:false,toneMapped:false})); s.visible=false; WORLD.add(s); return {s,on:false,t:0}; });

    // the flight
    const S={q:new Q4(),w:new V3(),v:new V3(),thr:.35,boost:false,speed:0,hull:100,score:0,heat:0,lock:0,mis:6,misT:0,fireT:0,side:1,shake:0,hurtT:0,dead:false,t:0,flash:0,tgt:null,tgtD:0};
    const IN={pitch:0,yaw:0,roll:0,thr:0,boost:0,fire:0,mis:0,end:0}, PADIN={pitch:0,yaw:0,roll:0,thr:0,boost:0,fire:0,mis:0,end:0,fresh:false}, KEY=new Set(), MOUSE={x:0,y:0,on:false,l:false,r:false}; let test=null, endHold=0, misEdge=false;
    const FWD=new V3(), UP=new V3(), RIGHT=new V3(), EYE=new V3(), WQ=new Q4(), HL0=new V3(), DQ=new Q4(); let yaw0=0, calOK=false;
    const sfx=(k,o)=>{ try{ SFX.play(k,o); }catch(e){} };
    const worldOf=(p,out)=>out.copy(p).add(WORLD.position);   // a rock's place relative to the ship (metres)

    const killChunk=(c,boom,big)=>{ if(c.dead)return; c.dead=true; unplace(c); const i=chunks.indexOf(c); if(i>=0)chunks.splice(i,1); const mc=c.met.chunks, j=mc.indexOf(c); if(j>=0)mc.splice(j,1);
      const n=Math.min(18,6+Math.round(c.r*.6)); for(let k=0;k<n;k++)shard(c.p,c.met.vel,c.r); flash(c.p,c.r*(big?2.2:1.4)); S.score++;
      worldOf(c.p,TV); const d=TV.length(); if(boom)sfx('boom',{pitch:cl(2.2-c.r*.08,.6,2.2),vol:cl(1.4-d/500,.08,1)*.9});
      if(!mc.length){ const mi=meteors.indexOf(c.met); if(mi>=0)meteors.splice(mi,1); respawn(); } };
    const respawn=()=>{ const t=R(), r=t<.45?RR(3.5,8):t<.8?RR(8,15):RR(15,32); for(let k=0;k<20;k++){ const p=new V3(RR(-1,1),RR(-1,1),RR(-1,1)).normalize().multiplyScalar(RR(FIELD*.75,FIELD)); if(FWD.dot(p)<FIELD*.3){ TV.copy(p).sub(WORLD.position); if(!meteors.some(m=>m.c.distanceTo(TV)<m.r+r+30)){ mkMeteor(TV.x,TV.y,TV.z,r); return; } } } };   // a new rock comes in far off, out of your sight
    const flash=(p,r)=>{ const f=FX.find(f=>!f.on)||FX[0]; f.on=true; f.t=0; f.r=r; f.p.copy(p); f.s.visible=f.d.visible=true; f.s.position.copy(p); f.d.position.copy(p); const b=BANG[0].t<BANG[1].t?BANG[1]:BANG[0]; if(b.t<=0||r>8){ b.t=.5; b.l.position.copy(p); b.l.intensity=cl(r*r*60,400,30000); } };
    const fire=dt=>{ if(S.lock>0||S.heat>=1)return; S.fireT-=dt; if(S.fireT>0)return; S.fireT=.11; S.heat+=.065; if(S.heat>=1){ S.lock=1.6; sfx('latch',{pitch:.6}); } S.side=-S.side;
      const b=BOLTS.find(b=>!b.on); if(!b)return; b.on=true; b.life=1.7; b.m.visible=true; TV.set(S.side*1.75,-.95,-3.6).applyQuaternion(S.q); b.p.copy(TV).sub(WORLD.position); b.v.copy(FWD).multiplyScalar(420).add(S.v); b.m.quaternion.copy(S.q); sfx('laser',{pitch:RR(.9,1.1),vol:.5}); };
    const launch=()=>{ if(S.mis<=0){ sfx('latch',{pitch:.5}); return; } const m=MIS.find(m=>!m.on); if(!m)return; S.mis--; m.on=true; m.life=7; m.st=0; m.g.visible=true; TV.set(S.side*.9,-1.15,-1.5).applyQuaternion(S.q); m.p.copy(TV).sub(WORLD.position); m.v.copy(FWD).multiplyScalar(25).add(S.v); m.g.quaternion.copy(S.q); m.tgt=S.tgt||nearestAhead(.5); sfx('whoosh',{vol:.8}); };
    const nearestAhead=cosMin=>{ let best=null, bd=1e9; for(const c of chunks){ worldOf(c.p,TV); const d=TV.length(); if(d>900||d<1)continue; if(TV.dot(FWD)/d<cosMin)continue; const score=d*(1.4-TV.dot(FWD)/d); if(score<bd){ bd=score; best=c; } } return best; };
    const explode=(p,r,v0)=>{ flash(p,r); const L=[]; for(const c of chunks){ if(c.p.distanceTo(p)<r+c.r*.7)L.push(c); } for(const c of L)killChunk(c,false,true); for(let k=0;k<22;k++)shard(p,v0||TV3.set(0,0,0),r*.4); worldOf(p,TV); sfx('boom',{pitch:.55,vol:cl(1.5-TV.length()/600,.15,1)}); S.shake=Math.max(S.shake,cl(14/(1+TV.length()/30),0,.6)); };
    const hurt=(n,why)=>{ if(S.dead)return; S.hull=Math.max(0,S.hull-n); S.hurtT=.6; S.flash=1; S.shake=Math.max(S.shake,.5+n*.02); sfx('thud',{pitch:.5,vol:1}); if(S.hull<=0)die(why); else if(S.hull<30)say('HULL CRITICAL.','#ff6a6a'); };
    const die=()=>{ S.dead=true; say('YOUR SHIP BREAKS UP. '+S.score+' ROCKS.'+(S.score>(window.ROAMBEST||0)?' A NEW BEST.':''),'#c8a090'); if(S.score>(window.ROAMBEST||0))window.ROAMBEST=S.score; sfx('boom',{pitch:.4,vol:1}); TV.set(0,0,0).sub(WORLD.position); flash(TV,12); setTimeout(()=>{ if(ROAM.on&&S.dead)H.end(); },1500); };

    const screens=()=>{ const g0=SCR[0].g, g1=SCR[1].g, g2=SCR[2].g, W=320, Hh=200, hurt=S.flash>0; const bg=(g,title)=>{ g.fillStyle=hurt?'#2a0606':'#050a0c'; g.fillRect(0,0,W,Hh); g.strokeStyle='#143a3a'; g.lineWidth=2; g.strokeRect(3,3,W-6,Hh-6); for(let y=6;y<Hh;y+=3){ g.fillStyle='rgba(0,0,0,.18)'; g.fillRect(0,y,W,1); } g.font='bold 13px Consolas, Menlo, monospace'; g.fillStyle='#7fd9c6'; g.textAlign='left'; g.fillText(title,14,24); g.shadowColor='#4ff0d0'; g.shadowBlur=6; };
      const bar=(g,x,y,w,h,k,col)=>{ g.fillStyle='#0d1c1e'; g.fillRect(x,y,w,h); g.fillStyle=col; g.fillRect(x,y,Math.round(w*cl(k,0,1)),h); g.strokeStyle='#1e4a48'; g.lineWidth=1; g.strokeRect(x+.5,y+.5,w-1,h-1); };
      bg(g0,'RADAR  RANGE 600M'); { const cx=W/2,cy=Hh/2+8,rad=78; g0.strokeStyle='#17504a'; g0.lineWidth=1; for(const r of [26,52,78]){ g0.beginPath(); g0.arc(cx,cy,r,0,TAU); g0.stroke(); } g0.beginPath(); g0.moveTo(cx,cy-rad); g0.lineTo(cx,cy+rad); g0.moveTo(cx-rad,cy); g0.lineTo(cx+rad,cy); g0.stroke();
        const iq=TQ.copy(S.q).invert(); for(const m of meteors){ worldOf(m.c,TV).applyQuaternion(iq); const d=Math.hypot(TV.x,TV.z); if(d>600)continue; const k=rad/600, up=TV.y; g0.fillStyle=up>20?'#8fffe0':up<-20?'#2a8f7a':'#dfffee'; const s=cl(m.r*.25,2,6); g0.fillRect(cx+TV.x*k-s/2,cy+TV.z*k-s/2,s,s); }
        g0.fillStyle='#ffd060'; g0.beginPath(); g0.moveTo(cx,cy-6); g0.lineTo(cx-4,cy+4); g0.lineTo(cx+4,cy+4); g0.fill(); g0.fillStyle='#4a8f88'; g0.font='11px Consolas, Menlo, monospace'; g0.fillText('ROCKS NEAR '+meteors.filter(m=>worldOf(m.c,TV).length()<600).length,14,Hh-12); }
      bg(g1,'FLIGHT'); g1.fillStyle='#e8fff8'; g1.font='bold 40px Consolas, Menlo, monospace'; g1.fillText(Math.round(S.speed).toString().padStart(3,' '),22,74); g1.font='12px Consolas, Menlo, monospace'; g1.fillStyle='#7fd9c6'; g1.fillText('M/S'+(S.boost?'  BOOST':''),118,74);
        g1.fillText('THROTTLE',22,100); bar(g1,110,90,190,10,S.thr,'#4ff0d0'); g1.fillText('HULL',22,124); bar(g1,110,114,190,10,S.hull/100,S.hull>50?'#60ff80':S.hull>25?'#ffc040':'#ff5050');
        g1.fillText('LASER TEMP',22,148); bar(g1,110,138,190,10,S.heat,S.lock>0?'#ff5050':'#ff9a40'); g1.fillText('MISSILES',22,172); for(let i=0;i<6;i++){ g1.fillStyle=i<S.mis?'#ffd060':'#1a2a2c'; g1.fillRect(110+i*32,163,24,10); } if(S.mis<6){ g1.fillStyle='#4a8f88'; g1.fillRect(110,178,Math.round(190*S.misT/6),2); }
        g1.fillStyle='#ffd060'; g1.font='bold 13px Consolas, Menlo, monospace'; g1.textAlign='right'; g1.fillText('ROCKS '+S.score,W-16,24); g1.textAlign='left';
      bg(g2,'TARGET'); if(S.tgt){ const c=S.tgt, d=S.tgtD; g2.fillStyle='#e8fff8'; g2.font='bold 30px Consolas, Menlo, monospace'; g2.fillText(Math.round(d)+' M',22,70); g2.font='12px Consolas, Menlo, monospace'; g2.fillStyle='#7fd9c6'; g2.fillText(c.met.r<8?'SMALL ROCK  1 PIECE':c.met.r<15?'ROCK  '+c.met.chunks.length+' PIECES LEFT':'BIG ROCK  '+c.met.chunks.length+' PIECES LEFT',22,96);
          g2.strokeStyle='#ff6060'; g2.lineWidth=2; const bx=W/2,by=140,bs=26; for(const [sx,sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ g2.beginPath(); g2.moveTo(bx+sx*bs,by+sy*(bs-10)); g2.lineTo(bx+sx*bs,by+sy*bs); g2.lineTo(bx+sx*(bs-10),by+sy*bs); g2.stroke(); } }
        else { g2.fillStyle='#2f6a66'; g2.font='bold 18px Consolas, Menlo, monospace'; g2.fillText('NO TARGET',22,70); g2.font='12px Consolas, Menlo, monospace'; g2.fillStyle='#4a8f88'; g2.fillText('LASERS BREAK ROCKS',22,100); g2.fillText('MISSILES BREAK BIG ONES',22,118); }
        g2.font='11px Consolas, Menlo, monospace'; g2.fillStyle='#4a8f88'; g2.fillText(VR.on?'HOLD Y: END PROGRAM':'HOLD Q: END PROGRAM',22,Hh-12);
      for(const s of SCR){ s.g.shadowBlur=0; s.t.needsUpdate=true; } };

    // reading the controls: keys and mouse on screen, the gamepad or the Quest sticks through SHARED.drive.pad
    const KEYS={w:1,a:1,s:1,d:1,arrowup:1,arrowdown:1,arrowleft:1,arrowright:1,shift:1,' ':1,f:1,q:1,r:1,e:1};
    const onKey=e=>{ if(!ROAM.on||UI.menuOpen||(PAD.panels&&PAD.panels().length))return; const k=(e.key||'').toLowerCase(); if(!KEYS[k])return; if(e.type==='keydown')KEY.add(k); else KEY.delete(k); e.preventDefault(); e.stopImmediatePropagation(); };
    const onMove=e=>{ if(!ROAM.on)return; const el=renderer.domElement, r=el.getBoundingClientRect(); MOUSE.x=((e.clientX-r.left)/r.width-.5)*2; MOUSE.y=((e.clientY-r.top)/r.height-.5)*2; MOUSE.on=!(UI.menuOpen||(PAD.panels&&PAD.panels().length)); };
    const onBtn=e=>{ if(!ROAM.on||UI.menuOpen||(PAD.panels&&PAD.panels().length))return; if(e.target!==renderer.domElement&&e.target!==document.body)return; const dn=e.type==='pointerdown'; if(e.button===0)MOUSE.l=dn; if(e.button===2){ MOUSE.r=dn; e.preventDefault(); } if(dn)e.stopImmediatePropagation(); };
    const onCtx=e=>{ if(ROAM.on)e.preventDefault(); };
    const onLeave=()=>{ MOUSE.on=false; MOUSE.l=MOUSE.r=false; };
    const dz=(v,d)=>Math.abs(v)<d?0:Math.sign(v)*(Math.abs(v)-d)/(1-d);
    const DRIVE={
      pad:(gp,dt,hit,on)=>{ const ax=gp.axes, B=i=>(gp.buttons[i]&&gp.buttons[i].value)||0, q=gp===PAD.xr; let lx=dz(ax[0]||0,.12), ly=dz(ax[1]||0,.12), rx=dz(ax[2]||0,.12), ry=dz(ax[3]||0,.12);
        if(q&&VR.opt&&VR.opt.hand==='left'){ [lx,rx]=[rx,lx]; [ly,ry]=[ry,ly]; }   // the headset's walking stick is the throttle hand
        PADIN.pitch=ry; PADIN.yaw=-rx; PADIN.roll=-lx+(B(4)>.5?1:0)-(B(5)>.5?1:0); PADIN.thr=-ly; PADIN.boost=B(0)>.5?1:0; PADIN.fire=B(7)>.4?1:0; PADIN.mis=(B(6)>.5||B(2)>.5)?1:0; PADIN.end=(B(3)>.5||(!q&&B(1)>.5))?1:0; PADIN.fresh=true; },
      cam:(cam,dt)=>{ SHIP.updateMatrixWorld(true); SHIP.getWorldQuaternion(WQ); EYE.set(0,0,0); SHIP.localToWorld(EYE); if(S.shake>0){ EYE.x+=(R()-.5)*S.shake*.03*M; EYE.y+=(R()-.5)*S.shake*.03*M; } cam.position.copy(EYE); cam.quaternion.copy(WQ); if(S.shake>0)cam.quaternion.multiply(DQ.setFromEuler(new THREE.Euler((R()-.5)*S.shake*.01,(R()-.5)*S.shake*.01,0)));
        const fov=62+(S.boost?11:0); if(Math.abs(cam.fov-fov)>.05){ cam.fov+=(fov-cam.fov)*Math.min(1,dt*4); cam.updateProjectionMatrix(); } W3.group.visible=false; },
      dolly:(DOLLY,HL,HQ)=>{ SHIP.updateMatrixWorld(true); SHIP.getWorldQuaternion(WQ); EYE.set(0,0,0); SHIP.localToWorld(EYE); if(!calOK){ HL0.copy(HL); TV.set(0,0,-1).applyQuaternion(HQ); yaw0=Math.atan2(-TV.x,-TV.z); calOK=true; }
        DOLLY.quaternion.copy(WQ).multiply(DQ.setFromAxisAngle(TV2.set(0,1,0),-yaw0)); DOLLY.scale.setScalar(M); DOLLY.position.copy(EYE).sub(TV.copy(HL0).multiplyScalar(M).applyQuaternion(DOLLY.quaternion)); if(VR.cam)VR.cam.far=9000/M; },
      recentre:()=>{ calOK=false; } };

    const step=dt=>{ if(!ROAM.on)return; dt=Math.min(dt||1/60,.05); S.t+=dt; if(FADE.busy&&S.t<1)return;
      // inputs
      const k=KEY, mx=MOUSE.on?dz(MOUSE.x,.07):0, my=MOUSE.on?dz(MOUSE.y,.07):0, P=PADIN.fresh?PADIN:null, tI=test;
      IN.pitch=cl((k.has('arrowup')?1:0)-(k.has('arrowdown')?1:0)-my*1.3+(P?P.pitch:0)+(tI?tI.pitch||0:0),-1,1);
      IN.yaw=cl((k.has('arrowleft')?1:0)-(k.has('arrowright')?1:0)-mx*1.3+(P?P.yaw:0)+(tI?tI.yaw||0:0),-1,1);
      IN.roll=cl((k.has('a')?1:0)-(k.has('d')?1:0)+(P?P.roll:0)+(tI?tI.roll||0:0),-1,1);
      IN.thr=cl((k.has('w')?1:0)-(k.has('s')?1:0)+(P?P.thr:0)+(tI?tI.thr||0:0),-1,1);
      IN.boost=k.has('shift')||(P&&P.boost)||(tI&&tI.boost)?1:0; IN.fire=k.has(' ')||MOUSE.l||(P&&P.fire)||(tI&&tI.fire)?1:0; IN.mis=k.has('f')||MOUSE.r||(P&&P.mis)||(tI&&tI.mis)?1:0; IN.end=k.has('q')||(P&&P.end)?1:0; PADIN.fresh=false;
      if(k.has('r')||k.has('e'))calOK=false;
      if(IN.end){ endHold+=dt; if(endHold>1){ endHold=-9; say('PROGRAM ENDED.','#7dffa4'); H.end(); return; } } else endHold=Math.max(0,endHold);
      if(S.dead){ S.shake=Math.max(0,S.shake-dt*1.5); S.flash=1; } else {
        // turning: the stick asks for rates, the ship follows them smoothly; full 360°
        TV.set(IN.pitch*1.45,IN.yaw*1.0,IN.roll*2.3); S.w.lerp(TV,Math.min(1,dt*7)); const an=S.w.length()*dt; if(an>1e-6){ DQ.setFromAxisAngle(TV2.copy(S.w).normalize(),an); S.q.multiply(DQ).normalize(); }
        // speed: the throttle sets it, boost doubles it, the flight assist bleeds off any sideways drift
        S.thr=cl(S.thr+IN.thr*dt*.55,0,1); S.boost=!!IN.boost&&S.thr>.05; FWD.set(0,0,-1).applyQuaternion(S.q); UP.set(0,1,0).applyQuaternion(S.q); RIGHT.set(1,0,0).applyQuaternion(S.q);
        TV.copy(FWD).multiplyScalar(S.thr*(S.boost?230:95)); S.v.lerp(TV,Math.min(1,dt*(S.boost?1.3:2.2))); S.speed=S.v.length(); WORLD.position.addScaledVector(S.v,-dt);
        if(WORLD.position.lengthSq()>2000*2000){ for(const c of chunks)c.p.add(WORLD.position); for(const m of meteors)m.c.add(WORLD.position); for(const b of BOLTS)if(b.on)b.p.add(WORLD.position); for(const m of MIS)if(m.on)m.p.add(WORLD.position); for(const s of SH)s.p.add(WORLD.position); for(const f of FX)if(f.on){ f.p.add(WORLD.position); f.s.position.copy(f.p); f.d.position.copy(f.p); } for(const s of SMOKE)if(s.on)s.s.position.add(WORLD.position); for(const b of BANG)b.l.position.add(WORLD.position); WORLD.position.set(0,0,0); }
        // weapons
        S.heat=Math.max(0,S.heat-dt*.32); if(S.lock>0){ S.lock-=dt; if(S.lock<=0)S.heat=Math.min(S.heat,.5); } if(IN.fire)fire(dt); else S.fireT=Math.min(S.fireT,.05);
        if(IN.mis&&!misEdge)launch(); misEdge=!!IN.mis; if(S.mis<6){ S.misT+=dt; if(S.misT>=6){ S.misT=0; S.mis++; } }
        S.hurtT=Math.max(0,S.hurtT-dt); S.shake=Math.max(0,S.shake-dt*2.2); S.flash=Math.max(0,S.flash-dt*2);
        // the sight: the nearest rock in a narrow cone ahead
        S.tgt=nearestAhead(.985); if(S.tgt){ worldOf(S.tgt.p,TV); S.tgtD=TV.length(); } sight.material.color.setHex(S.tgt?0xff6060:0x60ff80);
      }
      // the rocks drift and tumble, wrap round the field, and hit the ship
      for(const m of meteors){ if(m.vel.lengthSq()>0){ m.c.addScaledVector(m.vel,dt); for(const c of m.chunks)c.p.addScaledVector(m.vel,dt); }
        worldOf(m.c,TV); for(const a of 'xyz'){ const s=TV[a]>FIELD?-2*FIELD:TV[a]<-FIELD?2*FIELD:0; if(s){ m.c[a]+=s; for(const c of m.chunks)c.p[a]+=s; TV[a]+=s; } }
        if(!S.dead&&S.hurtT<=0&&TV.length()<m.r*1.3+3)for(const c of m.chunks){ worldOf(c.p,TV2); const d=TV2.length(); if(d<c.r*.9+2.4){ const rel=TV3.copy(S.v).sub(m.vel).length();
          if(c.r<4.5){ killChunk(c,true,false); hurt(cl(rel*.08+4,4,16),'rock'); } else { hurt(cl(rel*.18+6,8,45),'rock'); TV2.normalize(); const vn=Math.max(0,S.v.dot(TV2)); S.v.addScaledVector(TV2,-2*vn).multiplyScalar(.45); WORLD.position.addScaledVector(TV2,c.r*.9+2.6-d); } break; } } }
      for(const c of chunks){ if(c.spin.lengthSq()>0){ const a=c.spin.length()*dt; DQ.setFromAxisAngle(TV.copy(c.spin).normalize(),a); c.q.multiply(DQ); } writeChunk(c); }
      for(const a of IM)for(const m of a){ m.instanceMatrix.needsUpdate=true; }
      // bolts fly and break rocks
      for(const b of BOLTS){ if(!b.on)continue; b.life-=dt; TV.copy(b.v).multiplyScalar(dt); let hit=null, hd=1e9; const L2=TV.lengthSq();
        for(const c of chunks){ TV2.copy(c.p).sub(b.p); const t=L2>0?cl(TV2.dot(TV)/L2,0,1):0; const d=TV2.sub(TV3.copy(TV).multiplyScalar(t)).length(); if(d<c.r*.92&&t<hd){ hd=t; hit=c; } }
        if(hit){ killChunk(hit,true,false); b.on=false; b.m.visible=false; continue; } b.p.add(TV); if(b.life<=0){ b.on=false; b.m.visible=false; } else b.m.position.copy(b.p); }
      // missiles chase and burst
      for(const m of MIS){ if(!m.on)continue; m.life-=dt; m.st+=dt; if(m.tgt&&m.tgt.dead)m.tgt=null; if(!m.tgt&&m.st>.4)m.tgt=((c)=>c&&c.p.distanceTo(m.p)<700?c:null)(nearestAhead(.3));
        const sp=Math.min(190,25+m.st*110); if(m.tgt){ TV.copy(m.tgt.p).sub(m.p).normalize(); TV2.copy(m.v).normalize(); const k=Math.min(1,dt*2.8); TV2.lerp(TV,k).normalize(); m.v.copy(TV2).multiplyScalar(sp); } else m.v.setLength(sp);
        m.p.addScaledVector(m.v,dt); m.g.position.copy(m.p); m.g.quaternion.setFromUnitVectors(TV3.set(0,0,-1),TV2.copy(m.v).normalize()); m.fl.scale.setScalar(.7+R()*.5);
        if(m.st>.05&&Math.floor(m.st*30)!==Math.floor((m.st-dt)*30)){ const s=SMOKE.find(s=>!s.on)||SMOKE[0]; s.on=true; s.t=0; s.s.visible=true; s.s.position.copy(m.p).addScaledVector(TV2,-.8); }
        let bang=false; for(const c of chunks){ if(c.p.distanceTo(m.p)<c.r*.9+1.5){ bang=true; break; } } if(bang||m.life<=0){ m.on=false; m.g.visible=false; if(bang)explode(m.p,22,m.v); } }
      for(const s of SMOKE){ if(!s.on)continue; s.t+=dt; const k=s.t/1.3; if(k>=1){ s.on=false; s.s.visible=false; continue; } s.s.scale.setScalar(1.2+k*5); s.s.material.opacity=.5*(1-k); }
      // shards, flashes, bangs
      for(let i=SH.length-1;i>=0;i--){ const s=SH[i]; s.t+=dt; if(s.t>=s.life){ SH.splice(i,1); continue; } s.p.addScaledVector(s.v,dt); const a=s.spin.length()*dt; DQ.setFromAxisAngle(TV.copy(s.spin).normalize(),a); s.q.multiply(DQ); }
      shardIM.count=SH.length; SH.forEach((s,i)=>{ const k=cl((s.life-s.t)/.5,0,1); shardIM.setMatrixAt(i,M4.compose(s.p,s.q,TV.setScalar(s.s*k))); }); shardIM.instanceMatrix.needsUpdate=true;
      for(const f of FX){ if(!f.on)continue; f.t+=dt; const k=f.t/.42; if(k<1){ f.s.scale.setScalar(f.r*(1.2+k*3.2)); f.s.material.opacity=1-k; } else { f.s.visible=false; } const kd=f.t/2.6; if(kd>=1){ f.on=false; f.d.visible=false; continue; } f.d.scale.setScalar(f.r*(1.5+kd*3)); f.d.material.opacity=.55*(1-kd); }
      for(const b of BANG){ if(b.t>0){ b.t-=dt; b.l.intensity*=Math.max(0,1-dt*6); if(b.t<=0)b.l.intensity=0; } }
      // the cockpit: the stick and the throttle move with your hands, the sun lights it from where it stands, the screens redraw
      stick.rotation.x=lerp(stick.rotation.x,IN.pitch*.3,Math.min(1,dt*10)); stick.rotation.z=lerp(stick.rotation.z,IN.roll*.3,Math.min(1,dt*10)); stick.rotation.y=lerp(stick.rotation.y,IN.yaw*.3,Math.min(1,dt*10)); thr.rotation.x=lerp(thr.rotation.x,.55-S.thr*1.1,Math.min(1,dt*8));
      warn.material.color.setHex(S.hull<30&&Math.floor(S.t*4)%2?0xff2020:0x330000); glow1.intensity=5+S.flash*14; glow1.color.setHex(S.flash>.3?0xff4030:0xffb070);
      SHIP.quaternion.copy(S.q); SHIP.updateMatrixWorld(true); EYE.set(0,0,0); SHIP.localToWorld(EYE); sun.position.copy(EYE).addScaledVector(SUNDIR,20*M); sun.target.position.copy(EYE); sun.target.updateMatrixWorld();
      if((Math.floor(S.t*15)!==Math.floor((S.t-dt)*15)))screens(); };

    let saved=null, hum=null;
    const build=()=>{ seedField(); scene.add(ROOT,sun,sun.target,hemi); SHIP.traverse(o=>{ if(o.isMesh&&o.material===MAT.glass)o.castShadow=false; }); screens(); return ROOMS.part(ROOT,()=>{},null); };
    const unbuild=()=>{ ROOT.removeFromParent(); sun.removeFromParent(); sun.target.removeFromParent(); hemi.removeFromParent(); ROOT.traverse(o=>{ if(o.geometry&&!disposables.includes(o.geometry))o.geometry.dispose(); }); for(const g of disposables)g.dispose(); for(const k in MAT)for(const m of [].concat(MAT[k])){ for(const key of ['map','normalMap','roughnessMap','alphaMap'])if(m[key])m[key].dispose(); m.dispose(); } API=null; };
    const HID=['vit','hqb','hmap'], hidden=[];
    const start=R=>{ D=R; ROAM.on=true; for(const id of HID){ const el=document.getElementById(id); if(el&&!el.hidden){ el.hidden=true; hidden.push(el); } } S.q.identity(); S.w.set(0,0,0); S.v.set(0,0,0); S.thr=.35; S.boost=false; S.hull=100; S.score=0; S.heat=0; S.lock=0; S.mis=6; S.misT=0; S.dead=false; S.t=0; S.shake=0; S.flash=0; S.tgt=null; KEY.clear(); MOUSE.on=MOUSE.l=MOUSE.r=false; endHold=0; calOK=false; test=null; WORLD.position.set(0,0,0);
      saved={gy:SHARED.groundY,view:UI.view,fov:PCAM.fov,far:PCAM.far,vfar:VR.cam?VR.cam.far:0,ps2:!!(PS2.sp&&PS2.sp.enabled)}; SHARED.groundY=()=>0; SHARED.py=0; pos.x=WX; pos.z=WZ; SHARED.target=null; if(UI.setView)UI.setView('first'); PCAM.far=9000; PCAM.updateProjectionMatrix(); if(PS2.sp)PS2.sp.enabled=false;
      SHARED.drive=DRIVE; addEventListener('keydown',onKey,true); addEventListener('keyup',onKey,true); addEventListener('pointermove',onMove,true); addEventListener('pointerdown',onBtn,true); addEventListener('pointerup',onBtn,true); addEventListener('contextmenu',onCtx,true); addEventListener('blur',onLeave); document.addEventListener('pointerleave',onLeave);
      try{ hum=SFX.play('hum',{vol:.35}); }catch(e){ hum=null; } say(VR.on?'LEFT STICK: THROTTLE AND ROLL · RIGHT STICK: PITCH AND YAW · A BOOST · RIGHT TRIGGER LASERS · LEFT TRIGGER MISSILE · HOLD Y TO END':'W/S THROTTLE · A/D ROLL · MOUSE OR ARROWS AIM · SHIFT BOOST · SPACE LASERS · F MISSILE · HOLD Q TO END','#7dffa4'); };
    const end=()=>{ if(!ROAM.on)return; ROAM.on=false; SHARED.drive=null; for(const el of hidden)el.hidden=false; hidden.length=0; removeEventListener('keydown',onKey,true); removeEventListener('keyup',onKey,true); removeEventListener('pointermove',onMove,true); removeEventListener('pointerdown',onBtn,true); removeEventListener('pointerup',onBtn,true); removeEventListener('contextmenu',onCtx,true); removeEventListener('blur',onLeave); document.removeEventListener('pointerleave',onLeave);
      if(hum&&hum.s)try{ hum.s.stop(); }catch(e){} hum=null; if(saved){ SHARED.groundY=saved.gy; PCAM.fov=saved.fov; PCAM.far=saved.far; PCAM.updateProjectionMatrix(); if(VR.cam&&saved.vfar)VR.cam.far=saved.vfar; if(PS2.sp)PS2.sp.enabled=saved.ps2&&PS2.on; if(saved.view&&UI.setView&&UI.view!==saved.view)UI.setView(saved.view); saved=null; } W3.group.visible=true;
      const off=ROOMS.offIn&&ROOMS.offIn()==='roam', Hl=H.hall; if(off&&Hl&&ROOMS.enterAt)ROOMS.enterAt('arcade',[Hl.x,Hl.z,0,Math.PI]); else if(ROOMS.lazy&&ROOMS.lazy.roam&&ROOMS.lazy.roam.drop)ROOMS.lazy.roam.drop(); D=null; };
    const dbg=()=>({on:ROAM.on,t:+S.t.toFixed(1),drive:SHARED.drive===DRIVE,view:UI.view,chunks:chunks.length,meteors:meteors.length,instances:IM.flat().reduce((a,m)=>a+m.count,0),rocks:S.score,hull:S.hull,speed:+S.speed.toFixed(1),thr:+S.thr.toFixed(2),boost:S.boost,heat:+S.heat.toFixed(2),mis:S.mis,bolts:BOLTS.filter(b=>b.on).length,missiles:MIS.filter(m=>m.on).length,shards:SH.length,up:+UP.y.toFixed(3),fwd:[+FWD.x.toFixed(3),+FWD.y.toFixed(3),+FWD.z.toFixed(3)],tgt:S.tgt?+S.tgtD.toFixed(1):null,dead:S.dead,world:[+WORLD.position.x.toFixed(1),+WORLD.position.y.toFixed(1),+WORLD.position.z.toFixed(1)],cam:[+PCAM.position.x.toFixed(2),+PCAM.position.y.toFixed(2),+PCAM.position.z.toFixed(2)],far:PCAM.far});
    // for the checks: steer by hand, face the nearest rock, take a hit
    const aim=()=>{ let best=null, bd=1e9; for(const c of chunks){ worldOf(c.p,TV); const d=TV.length(); if(d<bd){ bd=d; best=c; } } if(!best)return null; worldOf(best.p,TV).normalize(); S.q.setFromUnitVectors(TV2.set(0,0,-1),TV); S.w.set(0,0,0); FWD.copy(TV); return bd; };
    return {build,unbuild,start,step,end,dbg,aim,cam:dt=>DRIVE.cam(SHARED.cam,dt),input:o=>{ test=o; },hurt:n=>hurt(n,'test')}; };

  SYS.add('cam',dt=>{ if(ROAM.on&&API)API.cam(dt); },'roam');
  ROOMS.off.roam={name:'ROAM',noCeil:1,box:{x0:WX-900*T,z0:WZ-900*T,x1:WX+900*T,z1:WZ+900*T,y0:-900*T,y1:900*T},spawn:[WX,WZ,0,0],out:[WX,WZ,0,0],
    need:()=>LOAD('roam').then(()=>{ if(!API)API=MAKE(); }),build:()=>API.build(),unbuild:()=>{ if(API)API.unbuild(); }};
  H.programs.push({ name:'ROAM', cost:0, offWorld:true,
    intro:'ROAM. A SMALL SHIP AMONG THE METEORS. FLY ANY WAY UP; LASERS BREAK THE ROCKS, MISSILES BREAK THE BIG ONES. DON\'T RAM THEM.',
    go:R=>{ D=R; if(!ROOMS.enterAt)return; ROOMS.enterAt('roam',[WX,WZ,0,0]).then(()=>{ if(D!==R||!API)return; API.start(R); }).catch(e=>console.warn('ROAM',e)); },
    run:(R,dt)=>{ if(API&&ROAM.on)API.step(dt); },
    hide:()=>{ if(API)API.end(); else D=null; } });
  ROAM.aim=()=>API?API.aim():null; ROAM.input=o=>{ if(API)API.input(o); }; ROAM.hurt=n=>{ if(API)API.hurt(n); };
  window.ROAMDBG=()=>API?API.dbg():{on:false,loaded:false}; }
