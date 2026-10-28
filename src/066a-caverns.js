// THE CAVERNS: CAVERNS makes the underground levels off the map (dry gem caves, flooded caverns), each its own level with its own way in and out.
import {SHARED, THREE} from './003-shx.js';
import {EQUIP, FORAGE, LEVELS, LITE, PARK, pos, st, SWIM, UI, VIT} from './003b-systems.js';
import {scene} from './004-main.js';
import {FADE, FIX, grab, MAPG, MODS, SOL, STN, SYS, TILE} from './006-map-pre.js';
import {GCAVE} from './060-cave.js';
import {RIVER} from './066-river.js';
await grab('gemcave',async()=>{}); await grab('hudson',async()=>{}); await grab('lake',async()=>{}); await grab('falls',async()=>{});
const CAVERNS={hooks:[],day:()=>0}; window.CAVERNS=CAVERNS; MODS.waters=MODS.waters||[];   // hooks: later systems add to a cavern as it builds (the day's gems); day: the calendar day that seeds it
{ const X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, Y=SHARED.BOD.YS, T=TILE, dy=STN.DY, hs=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
  const iX=x=>(x-X(0))/T, iZ=z=>(z-Z(0))/T;
  const build=(C,G)=>{ '@caverns'; const B=C.lot, H=C.H, P=[], Cc=[], c3=new THREE.Color(), m={objs:[],sol:[],fix:[],lights:[],things:[]};
    const quad=(a,b,c,d,col)=>{ c3.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(const v of [a,b,c,a,c,d]){ P.push(...v); Cc.push(c3.r,c3.g,c3.b); } };
    const box=(x0,y0,z0,x1,y1,z1,col)=>{ const [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[dy+Y(z0),dy+Y(z1)], dk=col.map(v=>v*.8);
      quad([a,f,d],[b,f,d],[b,f,c],[a,f,c],col); quad([a,e,d],[b,e,d],[b,f,d],[a,f,d],col); quad([b,e,c],[a,e,c],[a,f,c],[b,f,c],col); quad([a,e,c],[a,e,d],[a,f,d],[a,f,c],dk); quad([b,e,d],[b,e,c],[b,f,c],[b,f,d],dk); };
    const sol=(x0,y0,x1,y1,h)=>{ const s=[X(x0),Z(y0),X(x1),Z(y1)], f=[X(x0),Z(y0),dy,X(x1),Z(y1),dy+Y(h)]; SOL.down.push(s); FIX.down.push(f); m.sol.push(s); m.fix.push(f); };
    const ST=C.wall, FL=C.floor, w=.4, cx=(B.x0+B.x1)/2, cy=(B.y0+B.y1)/2;
    quad([X(B.x0),dy+Y(.3),Z(B.y1)],[X(B.x1),dy+Y(.3),Z(B.y1)],[X(B.x1),dy+Y(.3),Z(B.y0)],[X(B.x0),dy+Y(.3),Z(B.y0)],FL);
    quad([X(B.x0),dy+Y(H),Z(B.y0)],[X(B.x1),dy+Y(H),Z(B.y0)],[X(B.x1),dy+Y(H),Z(B.y1)],[X(B.x0),dy+Y(H),Z(B.y1)],ST.map(v=>v*.55));
    for(const [x0,y0,x1,y1] of [[B.x0-w,B.y0-w,B.x1+w,B.y0+w],[B.x0-w,B.y1-w,B.x1+w,B.y1+w],[B.x0-w,B.y0,B.x0+w,B.y1],[B.x1-w,B.y0,B.x1+w,B.y1]]){ box(x0,y0,0,x1,y1,H+2,ST); sol(x0,y0,x1,y1,H+2); }
    const D=CAVERNS.day()*17;   // the day's seed: new rocks and finds every day, the same for everyone
    for(const [x0,y0,x1,y1] of C.walls||[]){ box(x0,y0,0,x1,y1,H+2,ST.map(v=>v*.92)); sol(x0,y0,x1,y1,H+2); }   // a tunnel's own walls, winding it
    if(C.pocket){ const k=C.pocket, wl=new THREE.Mesh(new THREE.PlaneGeometry(X(k.x1)-X(k.x0),Math.abs(Z(k.y1)-Z(k.y0))),new THREE.MeshLambertMaterial({color:0x1d3a26,transparent:true,opacity:.82,side:THREE.DoubleSide})); wl.rotation.x=-Math.PI/2; wl.position.set((X(k.x0)+X(k.x1))/2,dy+Y(k.lv),(Z(k.y0)+Z(k.y1))/2); G.add(wl); m.objs.push(wl); }   // the air pocket's still surface
    for(const [x,y,len,ry] of C.pipes||[]){ const pp=new THREE.Mesh(new THREE.CylinderGeometry(.22*T,.22*T,len*T,8),new THREE.MeshLambertMaterial({color:0x5a3a22})); pp.rotation.z=Math.PI/2; pp.rotation.y=ry; pp.position.set(X(x),dy+Y(H*.72),Z(y)); G.add(pp); m.objs.push(pp); }   // old mains and sewer pipes: the city overhead
    if(!C.empty&&!C.walls)for(let i=0;i<7;i++){ const x=B.x0+2+hs(i+D,1)*(B.x1-B.x0-4), y=B.y0+2+hs(i+D,2)*(B.y1-B.y0-4), s=.6+.9*hs(i+D,3); box(x,y,0,x+s,y+s*.8,8+14*hs(i+D,4),ST.map(v=>v*.9)); sol(x,y,x+s,y+s*.8,8+14*hs(i+D,4)); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); geo.computeVertexNormals();
    const rock=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); rock.receiveShadow=true; G.add(rock); m.objs.push(rock);
    if(!C.empty)for(let i=0;i<6;i++){ const cr=new THREE.Mesh(new THREE.OctahedronGeometry(.5,0),new THREE.MeshBasicMaterial({color:C.gem})); cr.position.set(X(B.x0+2.5+hs(i,5)*(B.x1-B.x0-5)),dy+Y(.3),Z(B.y0+2.5+hs(i,6)*(B.y1-B.y0-5))); cr.scale.set(.2*T,.45*T,.2*T); cr.rotation.set(.3,i,.2); G.add(cr); m.objs.push(cr); }
    for(const [fx,fz,fy,c,i,r] of C.lights){ const L=new THREE.PointLight(c,i*.25,r*T,1.6); L.position.set(X(B.x0+fx*(B.x1-B.x0)),dy+Y(fy),Z(B.y0+fz*(B.y1-B.y0))); L.userData.i0=i; L.userData.grp=G; LITE.recs.push(L); m.lights.push(L); }
    for(const [ex,ey,en] of C.exits||[[B.x0+1.2,cy]]){ const hb=new THREE.Mesh(new THREE.BoxGeometry(1.2*T,Y(40),1.2*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(ex),dy+Y(20),Z(ey)); G.add(hb); m.objs.push(hb);
      const th={name:en||C.exitName,obj:hb,reach:1.4*T,near:2.6*T,tall:Y(50),act:()=>C.api.go(0)}; UI.thing(th); m.things.push(th); }
    for(const f of CAVERNS.hooks)f(C,G,m);
    LITE.t=0; return m; };
  CAVERNS.make=C=>{ const B=C.lot, G=MAPG[C.id]; let M=null, busy=false;
    const inside=(x,z)=>{ const gx=iX(x), gy=iZ(z); return gx>B.x0&&gx<B.x1&&gy>B.y0&&gy<B.y1; }, ground=()=>dy+Y(.3), bound=()=>({x0:X(B.x0+.4),x1:X(B.x1-.4),z0:Z(B.y0+.4),z1:Z(B.y1-.4)}), SP={x:X(B.x0+2.6),z:Z((B.y0+B.y1)/2),h:Math.PI/2};
    const clear=()=>{ '@later'; if(!M)return; for(const o of M.objs){ G.remove(o); o.traverse(c=>{ if(c.geometry)c.geometry.dispose(); if(c.material)c.material.dispose(); }); }
      const out=(A,L)=>{ for(const a of L){ const i=A.indexOf(a); if(i>=0)A.splice(i,1); } }; out(SOL.down,M.sol); out(FIX.down,M.fix); out(LITE.recs,M.lights); out(UI.things,M.things); LITE.t=0; M=null; };
    const go=async(n,how)=>{ if(busy)return; busy=true; await FADE.run(n?(M?'':'ENTERING '+C.name):C.leaving,async()=>{
      if(n){ await LOAD('caverns'); if(!M)M=build(C,G); if(how!=='load'){ UI.goTo(SP.x,SP.z,'down'); SHARED.heading=SP.h; } SHARED.BOUND=bound(); }
      else{ clear(); if(st.water){ st.water.in=false; st.water.dive=false; st.water.level=null; } C.out(); } },{hold:140}); busy=false; };
    const api=C.api={go,inside,ground,bound,solidAt:(gx,gy)=>(C.walls||[]).some(([a,b,c,d])=>gx>a-.3&&gx<c+.3&&gy>b-.3&&gy<d+.3),get built(){ return !!M; }};
    LEVELS.of[C.id]={name:C.name,floor:'down',groups:[C.id],has:inside,ground,bound}; MODS[C.id]=api;
    if(C.wet){ const H=C.H, K=C.pocket, inP=(x,z)=>{ if(!K)return false; const gx=iX(x), gy=iZ(z); return gx>K.x0&&gx<K.x1&&gy>Math.min(K.y0,K.y1)&&gy<Math.max(K.y0,K.y1); };
      const feed=(st,pos,dt,go,keys)=>{ if(SHARED.LVL!=='down'||!inside(pos.x,pos.z))return false; const pk=inP(pos.x,pos.z), W=RIG.water(st,{level:pk?K.lv:H+60,floor:0}); W.go=!!go; W.fast=W.in&&(keys.has('k')||keys.has('shift'))?1:0;
        if(!pk&&W.y>H-30){ W.y=H-30; W.vy=Math.min(0,W.vy); } W.events.length=0; return true; };   // flooded to the roof: always under, so your air drains the whole way (but in an air pocket)
      const UF=new THREE.Fog(C.murk,0,7*T), bg0=new THREE.Color(); UF.uw=true; let fog0=null, uw=false;
      MODS.waters.push({feed,pre:(scene,cam)=>{ uw=!!M&&SHARED.LVL==='down'&&inside(pos.x,pos.z)&&!!(scene.background&&scene.background.isColor)&&!(inP(pos.x,pos.z)&&cam&&cam.position.y>dy+Y(K.lv)); if(!uw)return; UF.far=(EQUIP.sight?3:1)*(C.see||6)*T; fog0=scene.fog; bg0.copy(scene.background); scene.fog=UF; scene.background.copy(UF.color); },   // goggles see three times as far through the murk
        post:scene=>{ if(!uw)return; scene.fog=fog0; scene.background.copy(bg0); uw=false; }}); }
    SYS.add('places',()=>{ if(!window.__started||busy||FADE.busy)return; if(SHARED.LVL==='down'&&inside(pos.x,pos.z)&&!M)go(1,'load'); },'066a-caverns '+C.id);   // a saved spot down here builds it at the start
    const K=C.id.toUpperCase(); window[K]={go,get built(){ return !!M; }}; window[K+'DBG']=()=>({built:!!M,lv:SHARED.LVL,inside:inside(pos.x,pos.z),objs:M?M.objs.length:0,swim:!!(st.water&&st.water.in)});
    if(C.enter)C.enter(api); return api; };
  CAVERNS.make({id:'gemcave',name:'THE GEM CAVE',leaving:'UP THE STONE LIFT',lot:{x0:1200,y0:-40,x1:1216,y1:-28},H:70,wall:[96,92,86],floor:[70,66,60],gem:0xb070ff,exitName:'THE STONE LIFT UP',
    lights:[[.5,.5,55,0x9fb8ff,18,10],[.8,.2,30,0xffb070,10,7]],
    out:()=>{ const S=GCAVE.S, L=GCAVE.lift||(S?{x:X(S.c.x+(PARK.ox||0)),z:Z(S.c.y+(PARK.oy||0)-3.4)}:{x:0,z:0}); UI.goTo(L.x,L.z+1.3*T,'up'); SHARED.heading=0; }});
  { let MO=null, said=0; const mouthAt=()=>RIVER.mouth||{x:X(117.5),z:(RIVER.box.z0+RIVER.box.z1)/2}, NEED=45;   // seconds of air the tunnel asks for: a plain breath (16) is not enough
    const gate=()=>{ if(SWIM.tank()>NEED||VIT.air>=NEED)return null; return 'THE TUNNEL GOES ON UNDER THE CITY. YOU NEED MORE AIR: AIRCAP MUSHROOMS (THE MUSHROOM SELLER) OR SCUBA (RENT IT FROM THE SHARK).'; };
    const tryIn=api=>{ const m=gate(); if(m){ const now=performance.now(); if(now-said>5000){ said=now; if(window.FORAGE&&FORAGE.say)FORAGE.say(m,'#9fd8ff'); } return; } api.go(1); };
    CAVERNS.make({id:'hudson',name:'THE HUDSON CAVERN',leaving:'UP TO THE RIVER',lot:{x0:1300,y0:-40,x1:1344,y1:-26},H:110,wet:true,murk:0x1c4a3a,see:16,wall:[52,62,50],floor:[38,48,36],gem:0x4ae0c8,exitName:'UP TO THE RIVER',
      walls:[[1311,-40,1311.8,-30],[1322,-36,1322.8,-26],[1333,-40,1333.8,-30]],   // the tunnel winds under the city: three bends
      pocket:{x0:1333.8,y0:-40,x1:1344,y1:-26,lv:75}, exits:[[1301.2,-33,'UP TO THE RIVER'],[1342.6,-30,'THE OLD SHAFT UP TO THE RIVER']],
      pipes:[[1306,-33,14,0],[1317,-31,12,.3],[1328,-34,13,-.2],[1339,-36,10,.15]],
      lights:[[.02,.5,60,0x4a9a70,8,8],[.3,.25,40,0x40c090,5,6],[.55,.8,40,0x40c090,5,6],[.9,.5,80,0x9fd8b0,10,10]],
      enter:api=>{ RIVER.onBuild.push(()=>{ '@later'; const RB=RIVER.box, WU=T/.84, {x:mx,z:mz}=mouthAt(), by=RB.lv-RIVER.depthAt(mx,mz)*WU, g=new THREE.Group(); g.name='cavern-mouth';
        const rk=new THREE.MeshLambertMaterial({color:0x2c3229}); for(let i=0;i<11;i++){ const a=i/11*Math.PI*2, r=new THREE.Mesh(new THREE.DodecahedronGeometry(.5,0),rk); r.position.set(mx+Math.cos(a)*2.2*T,by+.4*T,mz+Math.sin(a)*2.2*T); r.scale.set(T*(1.1+.5*hs(i,1)),T*(1.4+.9*hs(i,2)),T*(1.1+.5*hs(i,3))); r.rotation.y=hs(i,4)*3; g.add(r); }
        const hole=new THREE.Mesh(new THREE.CircleGeometry(1.7*T,16),new THREE.MeshBasicMaterial({color:0x000000})); hole.rotation.x=-Math.PI/2; hole.position.set(mx,by+.04*T,mz); g.add(hole);
        const glow=new THREE.Mesh(new THREE.TorusGeometry(1.75*T,.06*T,4,24),new THREE.MeshBasicMaterial({color:0x2fae86})); glow.rotation.x=-Math.PI/2; glow.position.set(mx,by+.1*T,mz); g.add(glow);   // faint glowing weed round the lip
        const fc=document.createElement('canvas'); fc.width=32; fc.height=24; { const c=fc.getContext('2d'); c.fillStyle='#c8202a'; c.fillRect(0,0,32,24); c.strokeStyle='#fff'; c.lineWidth=5; c.beginPath(); c.moveTo(0,0); c.lineTo(32,24); c.stroke(); }
        const ft=new THREE.CanvasTexture(fc); ft.colorSpace=THREE.SRGBColorSpace; const fl=new THREE.Group(), pole=new THREE.Mesh(new THREE.CylinderGeometry(.03*T,.03*T,1.1*T,4),new THREE.MeshLambertMaterial({color:0x222222})), fb=new THREE.Mesh(new THREE.CylinderGeometry(.3*T,.24*T,.3*T,8),new THREE.MeshLambertMaterial({color:0xe8e4da})), fg=new THREE.Mesh(new THREE.PlaneGeometry(.6*T,.45*T),new THREE.MeshLambertMaterial({map:ft,side:THREE.DoubleSide}));
        pole.position.y=.55*T; fg.position.set(.31*T,.85*T,0); fl.add(pole,fb,fg); fl.position.set(mx,RB.lv-.1*T,mz); g.add(fl);   // a diver-down flag on a float, right over the mouth
        const hb=new THREE.Mesh(new THREE.BoxGeometry(3.4*T,Y(40),3.4*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(mx,by+Y(20),mz); g.add(hb); scene.add(g); MO={x:mx,z:mz,y:by,fl};
        UI.thing({name:'A CAVE MOUTH',obj:hb,reach:2.6*T,near:3.8*T,tall:Y(40),act:()=>{ if(!(st.water&&st.water.in&&RIVER.bot-RIVER.dep<4)){ if(window.FORAGE&&FORAGE.say)FORAGE.say('SWIM DOWN TO THE MOUTH.','#9fd8ff'); return; } tryIn(api); }}); });
        SYS.add('places',()=>{ if(!MO||!RIVER.on||!RIVER.swim||SHARED.LVL!=='up'||FADE.busy||api.built)return; if(MO.fl)MO.fl.position.y=RIVER.box.lv+(RIVER.hAt?RIVER.hAt(MO.x,MO.z):0)-.1*T;
          if(Math.hypot(pos.x-MO.x,pos.z-MO.z)<1.5*T&&RIVER.bot-RIVER.dep<2.2)tryIn(api); },'066a-caverns mouth'); },   // swim down into the mouth and you go through
      out:()=>{ if(!RIVER.on)RIVER.build(); const m=MO||mouthAt(); UI.goTo(m.x,m.z+2.6*T,'up'); SHARED.heading=Math.PI; }}); }
  { const PX=x=>SHARED.BOD.XS(x+(PARK.ox||0)), PZ=y=>SHARED.BOD.ZS(y+(PARK.oy||0));
    const mouth=(g,mx,by,mz,name,gate,api)=>{ const rk=new THREE.MeshLambertMaterial({color:0x2e3a34});   // a ring of rocks round a black hole on a bed, double-clicked to go down
      for(let i=0;i<7;i++){ const a=i/7*Math.PI*2, r=new THREE.Mesh(new THREE.DodecahedronGeometry(.5,0),rk); r.position.set(mx+Math.cos(a)*1.5*T,by+.25*T,mz+Math.sin(a)*1.5*T); r.scale.set(T*(.7+.3*hs(i,1)),T*(.9+.5*hs(i,2)),T*(.7+.3*hs(i,3))); r.rotation.y=hs(i,4)*3; g.add(r); }
      const hole=new THREE.Mesh(new THREE.CircleGeometry(1.15*T,14),new THREE.MeshBasicMaterial({color:0x000000})); hole.rotation.x=-Math.PI/2; hole.position.set(mx,by+.04*T,mz); g.add(hole);
      const hb=new THREE.Mesh(new THREE.BoxGeometry(2.4*T,Y(34),2.4*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(mx,by+Y(17),mz); g.add(hb);
      UI.thing({name,obj:hb,reach:2*T,near:3.4*T,tall:Y(34),act:()=>{ const m=gate(); if(m){ if(window.FORAGE&&FORAGE.say)FORAGE.say(m,'#9fd8ff'); return; } api.go(1); }}); };
    { const LK={m:null}; CAVERNS.make({id:'lake',name:'THE LAKE CAVERN',leaving:'UP TO THE LAKE',lot:{x0:1500,y0:-40,x1:1518,y1:-26},H:70,wet:true,murk:0x1e5040,see:16,wall:[52,70,58],floor:[36,52,42],gem:0xffd060,exitName:'UP TO THE LAKE',
        lights:[[.5,.5,50,0x60c080,12,10],[.8,.3,30,0xd0e060,8,7]],
        enter:api=>{ PARK.later(()=>{ '@park'; const g=MAPG.park||scene, mx=PX(151), mz=PZ(10), by=(PARK.hill?PARK.hill(151,10):0)+.05*T; LK.m={x:mx,z:mz}; mouth(g,mx,by,mz,'A CAVE MOUTH',()=>st.water&&st.water.in?null:'SWIM DOWN TO THE MOUTH.',api); }); },
        out:()=>{ const m=LK.m||{x:PX(151),z:PZ(10)}; UI.goTo(m.x,m.z+1.5*T,'up'); SHARED.heading=Math.PI; }}); }
    CAVERNS.make({id:'falls',name:'THE CAVERN BEHIND THE FALLS',leaving:'OUT THROUGH THE FALLS',lot:{x0:1400,y0:-50,x1:1432,y1:-20},H:90,empty:true,wall:[84,80,74],floor:[58,54,50],gem:0,exitName:'OUT THROUGH THE FALLS',
      lights:[[.5,.5,70,0x8fb0d0,14,14],[.15,.5,40,0xb0c8e0,8,9]],
      enter:api=>{ PARK.later(()=>{ '@park'; const g=MAPG.park||scene, P=[], Cc=[], c3=new THREE.Color(), q=(a,b,c,d,col)=>{ c3.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(const v of [a,b,c,a,c,d]){ P.push(...v); Cc.push(c3.r,c3.g,c3.b); } };
        const bx=(x0,y0,x1,y1,h,col)=>{ const [a,b,c,d]=[PX(x0),PX(x1),PZ(y0),PZ(y1)], e=0, f=Y(h), dk=col.map(v=>v*.78); q([a,f,d],[b,f,d],[b,f,c],[a,f,c],col.map(v=>v*1.08)); q([a,e,d],[b,e,d],[b,f,d],[a,f,d],col); q([b,e,c],[a,e,c],[a,f,c],[b,f,c],col); q([a,e,c],[a,e,d],[a,f,d],[a,f,c],dk); q([b,e,d],[b,e,c],[b,f,c],[b,f,d],dk); SOL.up.push([a,c,b,d]); FIX.up.push([a,c,0,b,d,f]); };
        const RC=[108,102,94]; bx(238,170,258,181,220,RC); bx(234,174,238,181,150,RC.map(v=>v*.94)); bx(258,172,262,181,170,RC.map(v=>v*.9)); bx(241,166,245,170,60,RC.map(v=>v*.85)); bx(251,166,255,170,70,RC.map(v=>v*.85));   // the cliff in the park's top-right corner, the stream's head between its two feet
        const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); geo.computeVertexNormals(); const cliff=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true})); cliff.castShadow=cliff.receiveShadow=true; g.add(cliff);
        const fx=PX(248), fz=PZ(170)-.12*T, sheet=new THREE.Mesh(new THREE.PlaneGeometry(6*T,Y(218)),new THREE.MeshBasicMaterial({color:0x8fd0ff,transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false})); sheet.position.set(fx,Y(110),fz); g.add(sheet);
        for(let i=0;i<5;i++){ const fm=new THREE.Mesh(new THREE.BoxGeometry(1.1*T,.25*T,.9*T),new THREE.MeshBasicMaterial({color:0xeaf6ff,transparent:true,opacity:.75})); fm.position.set(fx+(i-2)*1.15*T,.12*T,fz-.5*T); g.add(fm); }
        const hb=new THREE.Mesh(new THREE.BoxGeometry(3*T,Y(60),.9*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(fx,Y(30),fz); g.add(hb); UI.thing({name:'THE WATERFALL',obj:hb,reach:1.8*T,near:3.2*T,tall:Y(60),act:()=>api.go(1)}); }); },
      out:()=>{ UI.goTo(PX(248),PZ(165),'up'); SHARED.heading=Math.PI; }}); } }
export {CAVERNS};
