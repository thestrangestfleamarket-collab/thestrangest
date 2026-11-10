// THE CAVERNS: CAVERNS makes the underground levels off the map, each its own level with its own ways in and out.
import {SHARED, THREE} from './003-shx.js';
import {EQUIP, LEVELS, LITE, pos, st, UI} from './003b-systems.js';
import {FADE, FIX, MAPG, MODS, SOL, STN, STORE, SYS, TILE} from './006-map-pre.js';
const CAVERNS={hooks:[]}; window.CAVERNS=CAVERNS; MODS.waters=MODS.waters||[];   // hooks: later systems add to a cavern as it builds
{ const X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, Y=SHARED.BOD.YS, T=TILE, dy=STN.DY, hs=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
  const iX=x=>(x-X(0))/T, iZ=z=>(z-Z(0))/T, inR=(R,x,z)=>{ const gx=iX(x), gy=iZ(z); return gx>R.x0&&gx<R.x1&&gy>Math.min(R.y0,R.y1)&&gy<Math.max(R.y0,R.y1); };
  const build=(C,G)=>{ '@caverns'; const B=C.lot, H=C.H, P=[], Cc=[], c3=new THREE.Color(), m={objs:[],sol:[],fix:[],lights:[],things:[]};
    const quad=(a,b,c,d,col)=>{ c3.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(const v of [a,b,c,a,c,d]){ P.push(...v); Cc.push(c3.r,c3.g,c3.b); } };
    const box=(x0,y0,z0,x1,y1,z1,col)=>{ const [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[dy+Y(z0),dy+Y(z1)], dk=col.map(v=>v*.8);
      quad([a,f,d],[b,f,d],[b,f,c],[a,f,c],col); quad([a,e,d],[b,e,d],[b,f,d],[a,f,d],col); quad([b,e,c],[a,e,c],[a,f,c],[b,f,c],col); quad([a,e,c],[a,e,d],[a,f,d],[a,f,c],dk); quad([b,e,d],[b,e,c],[b,f,c],[b,f,d],dk); };
    const sol=(x0,y0,x1,y1,h)=>{ const s=[X(x0),Z(y0),X(x1),Z(y1)], f=[X(x0),Z(y0),dy,X(x1),Z(y1),dy+Y(h)]; SOL.down.push(s); FIX.down.push(f); m.sol.push(s); m.fix.push(f); };
    const ST=C.wall, w=.4;
    for(const S of C.parts){ const R=S.r; quad([X(R.x0),dy+Y(.3),Z(R.y1)],[X(R.x1),dy+Y(.3),Z(R.y1)],[X(R.x1),dy+Y(.3),Z(R.y0)],[X(R.x0),dy+Y(.3),Z(R.y0)],S.floor||C.floor); }   // each part its own floor
    { const c=ST.map(v=>v*.55), rf=new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(X(B.x1)-X(B.x0)),Math.abs(Z(B.y1)-Z(B.y0))),new THREE.MeshLambertMaterial({color:new THREE.Color().setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace)})); rf.rotation.x=Math.PI/2; rf.position.set((X(B.x0)+X(B.x1))/2,dy+Y(H),(Z(B.y0)+Z(B.y1))/2); G.add(rf); m.objs.push(rf); }   // the roof, seen only from below: the camera above it looks through
    for(const [x0,y0,x1,y1] of [[B.x0-w,B.y0-w,B.x1+w,B.y0+w],[B.x0-w,B.y1-w,B.x1+w,B.y1+w],[B.x0-w,B.y0,B.x0+w,B.y1],[B.x1-w,B.y0,B.x1+w,B.y1]]){ box(x0,y0,0,x1,y1,H+2,ST); sol(x0,y0,x1,y1,H+2); }
    for(const [x0,y0,x1,y1] of C.walls||[]){ box(x0,y0,0,x1,y1,H+2,ST.map(v=>v*.92)); sol(x0,y0,x1,y1,H+2); }   // the tunnel's own walls, winding it
    for(const [x,y,s,h] of C.rocks||[]){ box(x,y,0,x+s,y+s*.8,h,ST.map(v=>v*.9)); sol(x,y,x+s,y+s*.8,h); }
    for(const k of C.pockets||[]){ const wl=new THREE.Mesh(new THREE.PlaneGeometry(X(k.x1)-X(k.x0),Math.abs(Z(k.y1)-Z(k.y0))),new THREE.MeshLambertMaterial({color:0x1d3a26,transparent:true,opacity:.82,side:THREE.DoubleSide})); wl.rotation.x=-Math.PI/2; wl.position.set((X(k.x0)+X(k.x1))/2,dy+Y(k.lv),(Z(k.y0)+Z(k.y1))/2); G.add(wl); m.objs.push(wl); }   // an air pocket's still surface
    for(const [x,y,len,ry] of C.pipes||[]){ const pp=new THREE.Mesh(new THREE.CylinderGeometry(.22*T,.22*T,len*T,8),new THREE.MeshLambertMaterial({color:0x5a3a22})); pp.rotation.z=Math.PI/2; pp.rotation.y=ry; pp.position.set(X(x),dy+Y(H*.72),Z(y)); G.add(pp); m.objs.push(pp); }   // old mains and sewer pipes: the city overhead
    for(const [x,y,len] of C.roots||[]){ const r=new THREE.Mesh(new THREE.CylinderGeometry(.04*T,.1*T,len*T,5),new THREE.MeshLambertMaterial({color:0x4a3a26})); r.position.set(X(x),dy+Y(H)-len*T/2,Z(y)); r.rotation.z=(hs(x,y)-.5)*.3; G.add(r); m.objs.push(r); }   // the park's roots hanging through the roof
    for(const [x,y,c] of C.caps||[]){ const g=new THREE.Mesh(new THREE.SphereGeometry(.16*T,8,5,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:c})), s=new THREE.Mesh(new THREE.CylinderGeometry(.03*T,.04*T,.22*T,5),new THREE.MeshBasicMaterial({color:0xd8e8d0})); s.position.set(X(x),dy+Y(.3)+.11*T,Z(y)); g.position.set(X(x),dy+Y(.3)+.2*T,Z(y)); G.add(s,g); m.objs.push(s,g); }   // glowing caps on the floor
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); geo.computeVertexNormals();
    const rock=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); rock.receiveShadow=true; G.add(rock); m.objs.push(rock);
    for(const [fx,fz,fy,c,i,r] of C.lights){ const L=new THREE.PointLight(c,i*.25,r*T,1.6); L.position.set(X(fx),dy+Y(fy),Z(fz)); L.userData.i0=i; L.userData.grp=G; LITE.recs.push(L); m.lights.push(L); }
    for(const [ex,ey,en,way] of C.exits){ const hb=new THREE.Mesh(new THREE.BoxGeometry(1.2*T,Y(40),1.2*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(ex),dy+Y(20),Z(ey)); G.add(hb); m.objs.push(hb);
      const th={name:en,obj:hb,reach:1.4*T,near:2.6*T,tall:Y(50),act:()=>C.api.go(0,way)}; UI.thing(th); m.things.push(th); }
    { const hl=new THREE.HemisphereLight(C.sky||0x9fb8c0,C.ground||0x2a2418,C.amb||1.1); G.add(hl); m.objs.push(hl); }   // the cave's own soft light, there only while it is built (you are in it)
    for(const f of CAVERNS.hooks)f(C,G,m);
    LITE.t=0; return m; };
  CAVERNS.make=C=>{ const B=C.lot, G=MAPG[C.id]; let M=null, busy=false;
    const inside=(x,z)=>inR(B,x,z), ground=()=>dy+Y(.3), bound=()=>({x0:X(B.x0+.4),x1:X(B.x1-.4),z0:Z(B.y0+.4),z1:Z(B.y1-.4)});
    const clear=()=>{ '@later'; if(!M)return; for(const o of M.objs){ G.remove(o); o.traverse(c=>{ if(c.geometry)c.geometry.dispose(); if(c.material)c.material.dispose(); }); }
      const out=(A,L)=>{ for(const a of L){ const i=A.indexOf(a); if(i>=0)A.splice(i,1); } }; out(SOL.down,M.sol); out(FIX.down,M.fix); out(LITE.recs,M.lights); out(UI.things,M.things); LITE.t=0; M=null; };
    // n: 1 in, 0 out; at: which way (in: the spawn's key in C.spawns; out: the key in C.outs)
    const go=async(n,at)=>{ if(busy)return; busy=true; await FADE.run(n?(M?'':'ENTERING '+C.name):C.leaving,async()=>{
      if(n){ await LOAD('caverns'); if(!M)M=build(C,G); const S=C.spawns[at]; if(S){ UI.goTo(X(S[0]),Z(S[1]),'down'); SHARED.heading=S[2]; } SHARED.BOUND=bound(); }
      else{ clear(); if(st.water){ st.water.in=false; st.water.dive=false; st.water.level=null; } await (C.outs[at]||Object.values(C.outs)[0])(); } },{hold:140}); busy=false; };
    const api=C.api={go,inside,ground,bound,C,get built(){ return !!M; }};
    LEVELS.of[C.id]={name:C.name,floor:'down',groups:[C.id],has:inside,ground,bound}; MODS[C.id]=api;
    { const H=C.H, inP=(x,z)=>(C.pockets||[]).find(K=>inR(K,x,z)), dry=(x,z)=>(C.dry||[]).some(R=>inR(R,x,z));
      const feed=(st,pos,dt,go,keys)=>{ if(SHARED.LVL!=='down'||!inside(pos.x,pos.z)||dry(pos.x,pos.z))return false; const pk=inP(pos.x,pos.z), W=RIG.water(st,{level:pk?pk.lv:H+60,floor:0}); W.go=!!go; W.fast=W.in&&(keys.has('k')||keys.has('shift'))?1:0;
        if(!pk&&W.y>H-30){ W.y=H-30; W.vy=Math.min(0,W.vy); } W.events.length=0; return true; };   // flooded to the roof: always under, so your air drains (but in an air pocket); the dry gallery you walk
      // murky water: a few tiles' sight, clear through goggles (owner, 7 Nov 2026)
      const UF=new THREE.Fog(C.murk,0,7*T), bg0=new THREE.Color(); UF.uw=true; let fog0=null, uw=false;
      MODS.waters.push({feed,pre:(scene,cam)=>{ uw=!!M&&SHARED.LVL==='down'&&inside(pos.x,pos.z)&&!dry(pos.x,pos.z)&&!!(scene.background&&scene.background.isColor)&&!((K=>K&&cam&&cam.position.y>dy+Y(K.lv))(inP(pos.x,pos.z))); if(!uw)return; UF.far=(EQUIP.sight?C.clear:C.see)*T; fog0=scene.fog; bg0.copy(scene.background); scene.fog=UF; scene.background.copy(UF.color); },
        post:scene=>{ if(!uw)return; scene.fog=fog0; scene.background.copy(bg0); uw=false; }}); }
    SYS.add('places',()=>{ if(!SYS.started||busy||FADE.busy)return; if(SHARED.LVL==='down'&&inside(pos.x,pos.z)&&!M)go(1); },'066a-caverns '+C.id);   // a saved spot down here builds it at the start
    const K=C.id.toUpperCase(); window[K]={go,get built(){ return !!M; }}; window[K+'DBG']=()=>({built:!!M,lv:SHARED.LVL,inside:inside(pos.x,pos.z),objs:M?M.objs.length:0,swim:!!(st.water&&st.water.in),things:M?M.things.map(t=>t.name):[]});
    if(C.enter)C.enter(api); STORE.places.push([C.name,0,0,'down','see',null,()=>(C.outs.river||Object.values(C.outs)[0])()]);   // GO TO: up at its way in from the river
    return api; };

}
