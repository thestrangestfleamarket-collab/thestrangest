// THE UNDERWAY (archived 8 Nov 2026, owner: "remoev these too"): the cavern from the Hudson under the city up through the park lake, cut from src/066a-caverns.js; it ran inside that file's block (X, Z, Y, T, dy, hs, CAVERNS).
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
