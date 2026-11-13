// THE HALL: the floor's hall behind your front door, off the map with your rooms (every floor has one; owner, 1 Nov 2026): the elevator at one end, the stairs at the other (down to the street, up to the stair head on the roof), no windows; your door opens on it.
import {THREE} from './003-shx.js';
import {pos, SFX, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {MODS, STORE} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
{ const APTS=MODS.apts, H={built:false,on:()=>null};
  ROOMK.parts.push(c=>{ '@apts'; const {apt,R,M,W,part,mat,tex,rnd,Lx,Ly,HW,du,solid}=c, TH=.24, HD=APTS.HALL*.907, v0=Ly+TH, v1=Ly+HD-TH, vc=(v0+v1)/2, LW=(v1-v0)/2, vm=v0+LW, EW=2.1, SC=4.6, LN=.95, us=Lx-SC, N=14, RISE=HW/2/N, TR=(SC-LN)/N, O=W(0,0,0);
    const box=(u0,va,u1,vb,y0,y1,m,cast=true)=>part(new THREE.BoxGeometry(u1-u0,y1-y0,vb-va),m,(u0+u1)/2,(y0+y1)/2,(va+vb)/2,0,apt,cast);
    const terr=tex(256,256,(g,w,h)=>{ g.fillStyle='#b9b6ad'; g.fillRect(0,0,w,h); for(let i=0;i<1400;i++){ const k=rnd(); g.fillStyle=k<.3?'#6e6a62':k<.6?'#d8d4ca':k<.8?'#8c7f72':'#a3a69c'; const s=1+rnd()*3; g.fillRect(rnd()*w,rnd()*h,s,s); } },true); terr.repeat.set(Lx/1.4,HD/1.4);
    const floorM=mat([255,255,255],{map:terr}), CP={clippingPlanes:[APTS.HPL]}, wallM=mat([186,198,178],CP), dadoM=mat([104,122,102],CP), skirtM=mat([66,44,30],CP), stepM=mat([148,140,124]), nosM=mat([88,74,58]), railM=mat([46,48,54]), elevM=mat([150,154,160],CP), leafM=mat([180,184,190],CP), frameM=mat([40,42,46],CP), slabM=mat([176,182,182]), litM=mat([255,240,210],{emissive:new THREE.Color(0xffd890),emissiveIntensity:.9}), signM=mat([255,200,90],{emissive:new THREE.Color(0xffa030),emissiveIntensity:1,...CP});
    const fl=(u0,va,u1,vb)=>part(new THREE.PlaneGeometry(u1-u0,vb-va).rotateX(-Math.PI/2),floorM,(u0+u1)/2,.004,(va+vb)/2,0,apt,false);
    fl(0,Ly,us,Ly+HD); fl(us,Ly,Lx,vm);   // the floor, open over the well of the down flight
    box(-TH,Ly,us,Ly+HD+TH,-.3,0,slabM,false); box(us,Ly,Lx+TH,vm,-.3,0,slabM,false); box(us,vm,Lx+TH,Ly+HD+TH,-HW/2-.3,-HW/2,slabM,false);   // the slab, and the well's floor a half storey down
    // the walls: the back and the two ends, the hall side of your rooms' wall; a dado to 1.1 m, a skirting
    const DH=1.1, paint=(u0,va,u1,vb)=>{ box(u0,va,u1,vb,DH,HW,wallM); box(u0,va,u1,vb,.12,DH,dadoM); box(u0,va,u1,vb,0,.12,skirtM); };
    paint(0,v1,Lx,v1+TH); paint(-TH,Ly,0,v1+TH); paint(Lx,Ly,Lx+TH,v1+TH); paint(0,Ly+TH,du-.56,Ly+TH+.012); paint(du+.56,Ly+TH,Lx,Ly+TH+.012);
    // the lights: three ceiling bowls down the hall
    for(const u of [EW+1.1,(EW+us)/2,us-.9]){ part(new THREE.CylinderGeometry(.2,.24,.07,12),litM,u,HW-.04,vc,0,apt,false); const L=new THREE.PointLight(0xffe2b8,2.4,6*M,1.8); L.position.set(u,HW-.4,vc); apt.add(L); }
    // the elevator: the shaft, its doors on the hall side, the lit sign, the call button
    const DW=1.0, DT=2.2; box(0,v0,EW,v1,0,HW,elevM); box(EW,vc-DW/2-.08,EW+.04,vc+DW/2+.08,0,DT+.1,frameM); for(const s of [-1,1])box(EW+.04,vc+(s<0?-DW/2:.01),EW+.07,vc+(s<0?-.01:DW/2),0,DT,leafM);
    box(EW+.04,vc-.3,EW+.08,vc+.3,DT+.2,DT+.42,signM); box(EW+.04,vc+DW/2+.2,EW+.07,vc+DW/2+.34,1.0,1.26,frameM); box(EW+.07,vc+DW/2+.24,EW+.085,vc+DW/2+.3,1.1,1.16,signM);
    solid(0,v0,EW+.08,v1,HW);
    // the stairs: two flights side by side from the hall's end, one down to the lower landing, one up to the upper (the floors beyond are not built: a landing takes you on)
    const sx=i=>us+i*TR; for(let i=0;i<N;i++){ const yd=-(i+1)*RISE, yu=(i+1)*RISE; box(sx(i),vm,sx(i+1),v1,-HW/2,yd,stepM); box(sx(i),vm,sx(i+1),v1,yd-.035,yd,nosM); box(sx(i),v0,sx(i+1),vm,0,yu,stepM); box(sx(i),v0,sx(i+1),vm,yu-.035,yu,nosM); }
    box(Lx-LN,v0,Lx,vm,HW/2-.2,HW/2,stepM);   // the upper landing (the lower one is the well's floor)
    box(Lx,vm,Lx+TH,v1+TH,-HW/2-.3,0,dadoM); box(us,v1,Lx,v1+TH,-HW/2-.3,0,dadoM); box(us,vm-.08,Lx,vm,-HW/2-.3,0,dadoM);   // the well's walls below the floor
    const rail=(u0,y0,u1,y1,v)=>{ const me=part(new THREE.BoxGeometry(Math.hypot(u1-u0,y1-y0),.05,.05),railM,(u0+u1)/2,(y0+y1)/2,v); me.rotation.z=Math.atan2(y1-y0,u1-u0); };
    const posts=(u0,y0,u1,y1,v,n)=>{ for(let i=0;i<=n;i++){ const t=i/n; part(new THREE.BoxGeometry(.035,.95,.035),railM,u0+(u1-u0)*t,y0+(y1-y0)*t+.475,v); } };
    for(const [s,dv] of [[-1,.03],[1,-.03]]){ const yl=s*HW/2; rail(us,.95,Lx-LN,yl+.95,vm+dv); posts(us,0,Lx-LN,yl,vm+dv,4); rail(Lx-LN,yl+.95,Lx,yl+.95,vm+dv); posts(Lx-LN,yl,Lx,yl,vm+dv,1); }
    solid(us,vm-.05,Lx,vm+.05,.95);   // between the flights
    // the ground on the stairs, and the landings that take you on
    const uv=(x,z)=>[(x-O.x)/M,(z-O.z)/M], stepY=(u,v)=>{ if(u<us||u>Lx||v<v0||v>v1)return null; const i=Math.min(N,Math.floor((u-us)/TR)+1); return (v>vm?-1:1)*(u>=Lx-LN?HW/2:i*RISE); };
    APTS.hallY=(x,z)=>{ const y=stepY(...uv(x,z)); return y==null?null:APTS.floorY+y*M; };
    const sp=W(us-1.1,0,vc); APTS.hallSpawn=[sp.x,sp.z,APTS.floorY,Math.PI/2]; H.mid=W((EW+us)/2,0,vc);
    H.on=()=>{ const [u,v]=uv(pos.x,pos.z); return u>Lx-LN+.15&&u<Lx&&v>v0&&v<v1?(v>vm?'down':'up'):null; };
    H.land=k=>W(Lx-LN/2,0,k==='down'?(vm+v1)/2:(v0+vm)/2);
    // the things: the elevator's doors, your front door (double-click opens and shuts it)
    const hitAt=(u,h,v,w,hh,d,name,act)=>{ const hb=new THREE.Mesh(new THREE.BoxGeometry(w*M,hh*M,d*M),new THREE.MeshBasicMaterial({visible:false})); hb.position.copy(W(u,h,v)); scene.add(hb); UI.thing({name,ghost:1,obj:hb,reach:1.6*M,near:2.8*M,tall:hh*M,act}); };
    hitAt(EW+.3,DT/2,vc,.6,DT,1.4,'ELEVATOR',()=>{ if(APTS.inReal)APTS.exitReal('DOWN TO THE STREET'); });
    hitAt(du,1.15,Ly+TH/2,1.2,2.3,.8,'FRONT DOOR',()=>{ const D=APTS.frontDoor; if(!APTS.inReal||!D)return; D.set(!D.open); const at=W(du,1.1,Ly); if(D.open)SFX.play('latch',{at,vol:.8}); else SFX.play('door',{at,vol:.35,pitch:1.6,delay:.25}); });
    // the stairs: double-click a flight to take it (walking onto it does nothing, so nobody, visitors included, is thrown out by stepping on it)
    hitAt(Lx-LN/2,1.2,(vm+v1)/2,LN,2.4,v1-vm,'STAIRS DOWN TO THE STREET',()=>{ if(APTS.inReal)APTS.exitReal('DOWN THE STAIRS'); });
    hitAt(Lx-LN/2,1.2,(v0+vm)/2,LN,2.4,vm-v0,'STAIRS UP TO THE ROOF',()=>{ if(APTS.inReal)APTS.roofGo(); });
    if(STORE.furnish&&STORE.furnish.hall)STORE.furnish.hall({box,hitAt,W,M,Lx,Ly,HW,du,v0,v1,vc,EW,us,TH,mat,solid});
    H.built=true; });
  window.HALLDBG=()=>({built:H.built,real:!!APTS.inReal,floors:APTS.floors,things:UI.things.filter(t=>t.name==='ELEVATOR'||t.name==='FRONT DOOR'||t.name==='STAIRS DOWN').map(t=>t.name),on:H.built?H.on():null,door:!!(APTS.frontDoor&&APTS.frontDoor.open),
    land:k=>{ const p=H.land(k); UI.goTo(p.x,p.z,APTS.floorY); },go:()=>{ UI.goTo(H.mid.x,H.mid.z,APTS.floorY); },view:v=>UI.setView(v),use:n=>{ const t=UI.things.find(t=>t.name===n); if(t)t.act(); return !!t; }});
}
