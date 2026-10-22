// THE CAVERNS: CAVERNS makes the underground levels off the map (dry gem caves, flooded caverns), each its own level with its own way in and out.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, LEVELS, LITE, PARK, pos, st, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {FADE, FIX, grab, MAPG, MODS, SOL, STN, SYS, TILE} from './006-map-pre.js';
import {GCAVE} from './060-cave.js';
import {RIVER} from './066-river.js';
await grab('gemcave',async()=>{}); await grab('hudson',async()=>{});
const CAVERNS={}; window.CAVERNS=CAVERNS; MODS.waters=MODS.waters||[];
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
    for(let i=0;i<7;i++){ const x=B.x0+2+hs(i,1)*(B.x1-B.x0-4), y=B.y0+2+hs(i,2)*(B.y1-B.y0-4), s=.6+.9*hs(i,3); box(x,y,0,x+s,y+s*.8,8+14*hs(i,4),ST.map(v=>v*.9)); sol(x,y,x+s,y+s*.8,8+14*hs(i,4)); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); geo.computeVertexNormals();
    const rock=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); rock.receiveShadow=true; G.add(rock); m.objs.push(rock);
    for(let i=0;i<6;i++){ const cr=new THREE.Mesh(new THREE.OctahedronGeometry(.5,0),new THREE.MeshBasicMaterial({color:C.gem})); cr.position.set(X(B.x0+2.5+hs(i,5)*(B.x1-B.x0-5)),dy+Y(.3),Z(B.y0+2.5+hs(i,6)*(B.y1-B.y0-5))); cr.scale.set(.2*T,.45*T,.2*T); cr.rotation.set(.3,i,.2); G.add(cr); m.objs.push(cr); }
    for(const [fx,fz,fy,c,i,r] of C.lights){ const L=new THREE.PointLight(c,i,r*T,1.6); L.position.set(X(B.x0+fx*(B.x1-B.x0)),dy+Y(fy),Z(B.y0+fz*(B.y1-B.y0))); L.userData.i0=i; L.userData.grp=G; LITE.recs.push(L); m.lights.push(L); }
    const hb=new THREE.Mesh(new THREE.BoxGeometry(1.2*T,Y(40),1.2*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(B.x0+1.2),dy+Y(20),Z(cy)); G.add(hb); m.objs.push(hb);
    const th={name:C.exitName,obj:hb,reach:1.4*T,near:2.6*T,tall:Y(50),act:()=>C.api.go(0)}; UI.thing(th); m.things.push(th);
    LITE.t=0; return m; };
  CAVERNS.make=C=>{ const B=C.lot, G=MAPG[C.id]; let M=null, busy=false;
    const inside=(x,z)=>{ const gx=iX(x), gy=iZ(z); return gx>B.x0&&gx<B.x1&&gy>B.y0&&gy<B.y1; }, ground=()=>dy+Y(.3), bound=()=>({x0:X(B.x0+.4),x1:X(B.x1-.4),z0:Z(B.y0+.4),z1:Z(B.y1-.4)}), SP={x:X(B.x0+2.6),z:Z((B.y0+B.y1)/2),h:Math.PI/2};
    const clear=()=>{ if(!M)return; for(const o of M.objs){ G.remove(o); o.traverse(c=>{ if(c.geometry)c.geometry.dispose(); if(c.material)c.material.dispose(); }); }
      const out=(A,L)=>{ for(const a of L){ const i=A.indexOf(a); if(i>=0)A.splice(i,1); } }; out(SOL.down,M.sol); out(FIX.down,M.fix); out(LITE.recs,M.lights); out(UI.things,M.things); LITE.t=0; M=null; };
    const go=async(n,how)=>{ if(busy)return; busy=true; await FADE.run(n?(M?'':'ENTERING '+C.name):C.leaving,async()=>{
      if(n){ await LOAD('caverns'); if(!M)M=build(C,G); if(how!=='load'){ UI.goTo(SP.x,SP.z,'down'); SHARED.heading=SP.h; } SHARED.BOUND=bound(); }
      else{ clear(); if(st.water){ st.water.in=false; st.water.dive=false; st.water.level=null; } C.out(); } },{hold:140}); busy=false; };
    const api=C.api={go,inside,ground,bound,get built(){ return !!M; }};
    LEVELS.of[C.id]={name:C.name,floor:'down',groups:[C.id],has:inside,ground,bound}; MODS[C.id]=api;
    if(C.wet){ const H=C.H, feed=(st,pos,dt,go,keys)=>{ if(SHARED.LVL!=='down'||!inside(pos.x,pos.z))return false; const W=RIG.water(st,{level:H+60,floor:0}); W.go=!!go; W.fast=W.in&&(keys.has('k')||keys.has('shift'))?1:0;
        if(W.y>H-30){ W.y=H-30; W.vy=Math.min(0,W.vy); } W.events.length=0; return true; };   // flooded to the roof: always under, so your air drains the whole way
      const UF=new THREE.Fog(C.murk,0,7*T), bg0=new THREE.Color(); let fog0=null, uw=false;
      MODS.waters.push({feed,pre:scene=>{ uw=!!M&&SHARED.LVL==='down'&&inside(pos.x,pos.z)&&!!(scene.background&&scene.background.isColor); if(!uw)return; fog0=scene.fog; bg0.copy(scene.background); scene.fog=UF; scene.background.copy(UF.color); },
        post:scene=>{ if(!uw)return; scene.fog=fog0; scene.background.copy(bg0); uw=false; }}); }
    SYS.add('places',()=>{ if(!window.__started||busy||FADE.busy)return; if(SHARED.LVL==='down'&&inside(pos.x,pos.z)&&!M)go(1,'load'); },'066a-caverns '+C.id);   // a saved spot down here builds it at the start
    const K=C.id.toUpperCase(); window[K]={go,get built(){ return !!M; }}; window[K+'DBG']=()=>({built:!!M,lv:SHARED.LVL,inside:inside(pos.x,pos.z),objs:M?M.objs.length:0,swim:!!(st.water&&st.water.in)});
    if(C.enter)C.enter(api); return api; };
  CAVERNS.make({id:'gemcave',name:'THE GEM CAVE',leaving:'UP THE STONE LIFT',lot:{x0:1200,y0:-40,x1:1216,y1:-28},H:70,wall:[96,92,86],floor:[70,66,60],gem:0xb070ff,exitName:'THE STONE LIFT UP',
    lights:[[.5,.5,55,0x9fb8ff,18,10],[.8,.2,30,0xffb070,10,7]],
    out:()=>{ const S=GCAVE.S, L=GCAVE.lift||(S?{x:X(S.c.x+(PARK.ox||0)),z:Z(S.c.y+(PARK.oy||0)-3.4)}:{x:0,z:0}); UI.goTo(L.x,L.z+1.3*T,'up'); SHARED.heading=0; }});
  { let MO=null; const mouthAt=()=>{ const RB=RIVER.box; return {x:X(117.5),z:(RB.z0+RB.z1)/2}; };
    CAVERNS.make({id:'hudson',name:'THE HUDSON CAVERN',leaving:'UP TO THE RIVER',lot:{x0:1300,y0:-40,x1:1318,y1:-26},H:70,wet:true,murk:0x0a2a3a,wall:[60,72,86],floor:[40,56,70],gem:0x4ae0c8,exitName:'UP TO THE RIVER',
      lights:[[.5,.5,50,0x4a9ad0,12,10],[.8,.3,30,0x60e0c0,8,7]],
      enter:api=>{ RIVER.onBuild.push(()=>{ const RB=RIVER.box, WU=T/.84, {x:mx,z:mz}=mouthAt(), by=RB.lv-RIVER.depthAt(mx,mz)*WU, g=new THREE.Group(); g.name='cavern-mouth';
        const rk=new THREE.MeshLambertMaterial({color:0x3a3f46}); for(let i=0;i<7;i++){ const a=i/7*Math.PI*2, r=new THREE.Mesh(new THREE.DodecahedronGeometry(.5,0),rk); r.position.set(mx+Math.cos(a)*1.5*T,by+.25*T,mz+Math.sin(a)*1.5*T); r.scale.set(T*(.7+.3*hs(i,1)),T*(.9+.5*hs(i,2)),T*(.7+.3*hs(i,3))); r.rotation.y=hs(i,4)*3; g.add(r); }
        const hole=new THREE.Mesh(new THREE.CircleGeometry(1.15*T,14),new THREE.MeshBasicMaterial({color:0x000000})); hole.rotation.x=-Math.PI/2; hole.position.set(mx,by+.04*T,mz); g.add(hole);
        const hb=new THREE.Mesh(new THREE.BoxGeometry(2.4*T,Y(34),2.4*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(mx,by+Y(17),mz); g.add(hb); scene.add(g); MO={x:mx,z:mz,y:by};
        UI.thing({name:'A CAVE MOUTH',obj:hb,reach:2*T,near:3.4*T,tall:Y(34),act:()=>{ if(!(st.water&&st.water.in&&RIVER.dep>4.5)){ if(window.FORAGE&&FORAGE.say)FORAGE.say('DIVE DOWN TO THE MOUTH.','#9fd8ff'); return; } api.go(1); }}); }); },
      out:()=>{ if(!RIVER.on)RIVER.build(); const m=MO||mouthAt(); UI.goTo(m.x,m.z+1.6*T,'up'); SHARED.heading=Math.PI; }}); } }
