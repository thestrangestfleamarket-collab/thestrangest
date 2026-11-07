// THE CAVERNS: CAVERNS makes the underground levels off the map, each its own level with its own ways in and out; THE UNDERWAY runs from the Hudson's old cavern pit under the city and up through the park lake: flooded runs, an air pocket, a dry gallery with gem glints, the spring hall.
import {SHARED, THREE} from './003-shx.js';
import {EQUIP, INV, LEVELS, LITE, PARK, pos, st, SWIM, UI, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {FADE, FIX, grab, MAPG, MODS, OFFDX, SOL, STN, STORE, SYS, TILE} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
import {RIVER} from './066-river.js';
await grab('underway',async()=>{});
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
      else{ clear(); if(st.water){ st.water.in=false; st.water.dive=false; st.water.level=null; } (C.outs[at]||Object.values(C.outs)[0])(); } },{hold:140}); busy=false; };
    const api=C.api={go,inside,ground,bound,get built(){ return !!M; }};
    LEVELS.of[C.id]={name:C.name,floor:'down',groups:[C.id],has:inside,ground,bound}; MODS[C.id]=api;
    { const H=C.H, inP=(x,z)=>(C.pockets||[]).find(K=>inR(K,x,z)), dry=(x,z)=>(C.dry||[]).some(R=>inR(R,x,z));
      const feed=(st,pos,dt,go,keys)=>{ if(SHARED.LVL!=='down'||!inside(pos.x,pos.z)||dry(pos.x,pos.z))return false; const pk=inP(pos.x,pos.z), W=RIG.water(st,{level:pk?pk.lv:H+60,floor:0}); W.go=!!go; W.fast=W.in&&(keys.has('k')||keys.has('shift'))?1:0;
        if(!pk&&W.y>H-30){ W.y=H-30; W.vy=Math.min(0,W.vy); } W.events.length=0; return true; };   // flooded to the roof: always under, so your air drains (but in an air pocket); the dry gallery you walk
      // murky water: a few tiles' sight, clear through goggles (owner, 7 Nov 2026)
      const UF=new THREE.Fog(C.murk,0,7*T), bg0=new THREE.Color(); UF.uw=true; let fog0=null, uw=false;
      MODS.waters.push({feed,pre:(scene,cam)=>{ uw=!!M&&SHARED.LVL==='down'&&inside(pos.x,pos.z)&&!dry(pos.x,pos.z)&&!!(scene.background&&scene.background.isColor)&&!((K=>K&&cam&&cam.position.y>dy+Y(K.lv))(inP(pos.x,pos.z))); if(!uw)return; UF.far=(EQUIP.sight?C.clear:C.see)*T; fog0=scene.fog; bg0.copy(scene.background); scene.fog=UF; scene.background.copy(UF.color); },
        post:scene=>{ if(!uw)return; scene.fog=fog0; scene.background.copy(bg0); uw=false; }}); }
    SYS.add('places',()=>{ if(!window.__started||busy||FADE.busy)return; if(SHARED.LVL==='down'&&inside(pos.x,pos.z)&&!M)go(1); },'066a-caverns '+C.id);   // a saved spot down here builds it at the start
    const K=C.id.toUpperCase(); window[K]={go,get built(){ return !!M; }}; window[K+'DBG']=()=>({built:!!M,lv:SHARED.LVL,inside:inside(pos.x,pos.z),objs:M?M.objs.length:0,swim:!!(st.water&&st.water.in),things:M?M.things.map(t=>t.name):[]});
    if(C.enter)C.enter(api); STORE.places.push([C.name,0,0,'down','see',null,()=>(C.outs.river||Object.values(C.outs)[0])()]);   // GO TO: up at its way in from the river
    return api; };

  /* ---------- THE UNDERWAY (owner, 7 Nov 2026: "a cavern that goes all the way from the hudson under the city all the way up through the pond in central park"): west to east, the silt run (flooded), the air pocket, the dry gallery, the old service tunnel's grate, the spring hall (flooded), the rise to the lake ---------- */
  { const o=x=>x+OFFDX, PX=x=>SHARED.BOD.XS(x+(PARK.ox||0)), PZ=y=>SHARED.BOD.ZS(y+(PARK.oy||0)), NEED=45;   // seconds of air the way asks for: a plain breath is not enough
    const gate=()=>SWIM.tank()>NEED||VIT.air>=NEED?null:'THE CAVERN RUNS ON UNDER THE CITY. YOU NEED MORE AIR: A TANK (RENT ONE AT FISHING & SCUBA) OR AIRCAP MUSHROOMS.';
    let said=0; const tryIn=(api,at)=>{ const m=gate(); if(m){ const now=performance.now(); if(now-said>5000){ said=now; SAY(m,'#9fd8ff'); } return; } api.go(1,at); };
    const mouth=(g,mx,by,mz,name,act,r=1.5)=>{ const rk=new THREE.MeshLambertMaterial({color:0x2e3a34});   // a ring of rocks round a black hole on a bed
      for(let i=0;i<9;i++){ const a=i/9*Math.PI*2, q=new THREE.Mesh(new THREE.DodecahedronGeometry(.5,0),rk); q.position.set(mx+Math.cos(a)*r*T,by+.3*T,mz+Math.sin(a)*r*T); q.scale.set(T*(.9+.4*hs(i,1)),T*(1.1+.7*hs(i,2)),T*(.9+.4*hs(i,3))); q.rotation.y=hs(i,4)*3; g.add(q); }
      const hole=new THREE.Mesh(new THREE.CircleGeometry((r-.35)*T,16),new THREE.MeshBasicMaterial({color:0x000000})); hole.rotation.x=-Math.PI/2; hole.position.set(mx,by+.04*T,mz); g.add(hole);
      const glow=new THREE.Mesh(new THREE.TorusGeometry((r-.3)*T,.06*T,4,24),new THREE.MeshBasicMaterial({color:0x2fae86})); glow.rotation.x=-Math.PI/2; glow.position.set(mx,by+.1*T,mz); g.add(glow);   // faint glowing weed round the lip
      const hb=new THREE.Mesh(new THREE.BoxGeometry(2.6*T,Y(36),2.6*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(mx,by+Y(18),mz); g.add(hb); UI.thing({name,obj:hb,reach:2.4*T,near:3.6*T,tall:Y(36),act}); };
    const MO={river:null,lake:null};
    const LOT={x0:o(1300),y0:-40,x1:o(1392),y1:-26};
    const api=CAVERNS.make({id:'underway',name:'THE UNDERWAY',leaving:'UP AND OUT',lot:LOT,H:110,murk:0x1c4a3a,see:4,clear:22,wall:[52,62,50],floor:[38,48,36],
      parts:[{r:{x0:o(1334),y0:-40,x1:o(1358),y1:-26},floor:[74,66,56]}],
      walls:[[o(1309),-40,o(1309.8),-30],[o(1317),-36,o(1317.8),-26],[o(1372),-40,o(1372.8),-30],[o(1381),-36,o(1381.8),-26]],   // the runs wind: two bends each side of the gallery
      rocks:[[o(1340),-37,1.2,30],[o(1346),-30,1.6,40],[o(1352),-36,1,24]],
      pockets:[{x0:o(1324),y0:-40,x1:o(1334),y1:-26,lv:75}], dry:[{x0:o(1334),y0:-40,x1:o(1358),y1:-26}],
      pipes:[[o(1304),-33,14,0],[o(1320),-31,12,.3],[o(1362),-34,13,-.2]],
      roots:[[o(1366),-30,3],[o(1369),-35,4],[o(1376),-28,2.6],[o(1385),-33,3.4],[o(1388),-29,2.2]],
      caps:[[o(1336),-38,0x7affd0],[o(1338),-27.5,0x9fe8ff],[o(1349),-38.5,0x7affd0],[o(1356),-27,0xb8ffa0],[o(1343),-27.4,0x9fe8ff]],
      lights:[[o(1301),-33,60,0x4a9a70,8,8],[o(1318),-36,40,0x40c090,5,6],[o(1329),-33,80,0x9fd8b0,10,10],[o(1346),-33,60,0xffc080,12,12],[o(1366),-33,50,0x60c080,8,8],[o(1384),-31,60,0xa0e0a0,10,10]],
      exits:[[o(1301.2),-33,'UP TO THE RIVER','river'],[o(1390.6),-33,'UP THROUGH THE LAKE','lake']],
      spawns:{river:[o(1302.8),-33,Math.PI/2],lake:[o(1389),-33,-Math.PI/2]},
      enter:api=>{
        RIVER.onBuild.push(()=>{ '@later'; const RB=RIVER.box, WU=T/.84, mx=(RIVER.mouth||{x:X(117.5)}).x, mz=(RIVER.mouth&&RIVER.mouth.z)||(RB.z0+RB.z1)/2, by=RB.lv-RIVER.depthAt(mx,mz)*WU, g=new THREE.Group(); g.name='underway-river';
          mouth(g,mx,by,mz,'THE DROWNED GATE (THE UNDERWAY)',()=>{ if(!(st.water&&st.water.in&&RIVER.bot-RIVER.dep<4))return SAY('SWIM DOWN TO THE GATE.','#9fd8ff'); tryIn(api,'river'); },2.2); scene.add(g); MO.river={x:mx,z:mz}; });
        PARK.later(()=>{ '@park'; const g=MAPG.park||scene, mx=PX(151), mz=PZ(10), by=(window.FOUNT&&FOUNT.bedAt&&FOUNT.bedAt(mx,mz))??0; MO.lake={x:mx,z:mz};
          mouth(g,mx,by+.05*T,mz,'THE LAKE RISE (THE UNDERWAY)',()=>{ if(!(st.water&&st.water.in))return SAY('SWIM DOWN TO THE SHAFT.','#9fd8ff'); tryIn(api,'lake'); }); }); },
      outs:{river:()=>{ if(!RIVER.on)RIVER.build(); const m=MO.river||{x:X(117.5),z:(RIVER.box.z0+RIVER.box.z1)/2}; UI.goTo(m.x,m.z+2.8*T,'up'); SHARED.heading=Math.PI; },
        lake:()=>{ const m=MO.lake||{x:PX(151),z:PZ(10)}; UI.goTo(m.x,m.z+1.6*T,'up'); SHARED.heading=Math.PI; }}});
    // the dry gallery's glints: a stone each, once a day, for whoever finds it (INV.pick); and the old service tunnel's grate
    CAVERNS.hooks.push((C,G,m)=>{ if(C.id!=='underway')return; const D=[[o(1337),-30],[o(1341),-38],[o(1344),-28.5],[o(1349),-33],[o(1353),-38.6],[o(1356),-31]];
      D.forEach(([x,y],i)=>{ const k='underway'+i, cr=new THREE.Mesh(new THREE.OctahedronGeometry(.5,0),new THREE.MeshBasicMaterial({color:[0xb070ff,0x4ae0c8,0xffd060][i%3]})); cr.position.set(X(x),dy+Y(.3)+.2*T,Z(y)); cr.scale.set(.18*T,.4*T,.18*T); cr.rotation.set(.3,i,.2); cr.visible=INV.ready(k); G.add(cr); m.objs.push(cr);
        const th={name:'A GLINT IN THE ROCK',obj:cr,reach:1.2*T,near:2.2*T,tall:.6*T,act:()=>{ if(INV.pick(k))cr.visible=false; }}; UI.thing(th); m.things.push(th); });
      const gr=new THREE.Mesh(new THREE.BoxGeometry(1.6*T,1.8*T,.12*T),new THREE.MeshLambertMaterial({color:0x3a3632})); gr.position.set(X(o(1361)),dy+Y(.3)+.9*T,Z(-26.3)); G.add(gr); m.objs.push(gr);
      for(let i=0;i<5;i++){ const b=new THREE.Mesh(new THREE.BoxGeometry(.06*T,1.7*T,.16*T),new THREE.MeshLambertMaterial({color:0x6a4a34})); b.position.set(X(o(1361))+(i-2)*.3*T,dy+Y(.3)+.9*T,Z(-26.3)); G.add(b); m.objs.push(b); }
      const th={name:'A RUSTED GRATE',obj:gr,reach:1.4*T,near:2.4*T,tall:1.8*T,act:()=>SAY('RUSTED SHUT. A DRAUGHT THROUGH IT SMELLS OF THE SUBWAY.','#c8c0a8')}; UI.thing(th); m.things.push(th); });
    window.UNDERWAYAT=MO; }
}
