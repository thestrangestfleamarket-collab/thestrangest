// ---- THE CLOCK (owner, 17 Oct 2026: "add the option to control the time", "make it be default. 7pm"): the hour of the day, and the light it
// gives the street. The sun goes round as it does over New York in mid-October (up a little after seven, highest past noon at about 42°,
// down a little after six), one light from it with its shadows; the sky's colour, the open air's light and the moon's follow how high (or
// how far under) the sun is: day, the gold of a low sun, sunset, the blue hour, night. Underground none of it reaches. The menu's TIME:
// the hour (a slider), STOPPED or RUNNING, and how fast a day goes; N jumps between noon and seven in the evening. The game opens at noon
// (owner, 17 Oct 2026: "day always starts at noon"; before that 7pm); half past three since 18 Oct 2026 ("do A-D": noon's overhead sun
// flattened everything; the late afternoon's long shadows and lower light) ----
const CLOCK={h:15.5,run:false,speed:1440/600,sunV:new THREE.Vector3(0,1,0),moonV:new THREE.Vector3(0,1,0)};   // (speed: game minutes a real second; a day in ten minutes; sunV, moonV: where they really are, for the sky dome, sky.js)
{ const D=Math.PI/180, sunL=new THREE.DirectionalLight(0xffffff,0), R=22*TILE;
  sunL.castShadow=true; sunL.shadow.mapSize.set(2048,2048); Object.assign(sunL.shadow.camera,{left:-R,right:R,top:R,bottom:-R,near:.5,far:120*TILE}); sunL.shadow.camera.updateProjectionMatrix();
  sunL.shadow.bias=-.0005; sunL.shadow.normalBias=.04; scene.add(sunL,sunL.target);
  // how high the sun is at an hour (degrees; under the horizon below 0), and which way it is (east at dawn, south at noon, west at dusk)
  const elev=h=>50*Math.cos(2*Math.PI*(h-12.7)/24)-8, azim=h=>2*Math.PI*(h-12.7)/24;
  // the sky by the sun's height (what shows past the map's edge: kept dim, a ground's colour by day, so the edge reads as the world's end, not water): [height, sky, the open air's light from above, from the ground, its strength, the sun's colour, its strength]
  // (night as dark as the old game's: a dim blue sky light and a faint moon, the lamps doing the rest: docs/OLD-LOOK.md)
  // THE EVENING, IN ITS PHASES (owner, 17 Oct 2026, "the best sunset / sky", sky.js): the stops closer round the horizon, so golden hour
  // (10°-3°), the sunset (3° to -2°), the afterglow (-2° to -6°) and the blue hour (-6° to -12°) each have their own light; the sky's colour
  // here is what the fog and the puddles read, the dome (sky.js) paints its own
  const K=[[-90,0x050507,0x55607a,0x14110e,.13,0x6f86c9,.14],[-18,0x050507,0x55607a,0x14110e,.13,0x6f86c9,.14],[-12,0x0a0e22,0x4a5a8a,0x15121a,.18,0x6f86c9,.1],
           [-6,0x1e2446,0x5a5a90,0x1e1a22,.36,0xff7a4a,0],[-2,0x3a2a40,0xb08a90,0x2e2222,.5,0xff8a5a,.2],[0,0x4a3038,0xd09a8a,0x3a2a22,.6,0xff9a5a,.6],
           [3,0x6a4a48,0xe0b090,0x4a3a2a,.68,0xffa860,1.1],[6,0x4a3c38,0xf0c8a0,0x4a3a2a,.75,0xffb070,1.6],[10,0x3e4250,0xf0d4b0,0x54442e,.85,0xffd4a0,2.1],
           [14,0x3a4350,0xbfdcff,0x5b4a35,.9,0xfff1d6,2.4],[90,0x3a4350,0xbfdcff,0x5b4a35,.9,0xfff1d6,2.6]];
  // (THE BLUE DAY, owner 17 Oct 2026: "make the sky blue, add cumulus clouds, real sun that effects the brightness level (only
  // source of light during day besides others on map)": the day's sky blue, deepest overhead at noon; 1 keeps a weak fill of the sky's own blue
  // light in the shade, 2 the sun alone by day (the shade lit only by lamps and what the sun bounces); the clouds below)
  const SKYV=QS.get('sky')!=null?+QS.get('sky'):2;   // (the blue sky and the sun alone by day: the default since 17 Oct 2026, "go"; ?sky=0 the old dim day, ?sky=1 with a little sky fill)
  if(SKYV){ const F=SKYV===2?.09:.3, G=SKYV===2?.08:.28, at=(e,v)=>{ K[K.findIndex(k=>k[0]===e)]=v; };
    at(6,[6,0x9fb8d8,0xf0c8a0,0x4a3a2a,F,0xffb070,1.9]); at(10,[10,0x86aadc,0xf0d4b0,0x54442e,F,0xffd4a0,2.6]); at(14,[14,0x6a9fe0,0xbfdcff,0x5b4a35,G,0xfff1d6,3.5]); at(90,[90,0x4f8ee0,0xbfdcff,0x5b4a35,G,0xfff1d6,3.8]); }   // (the shade's sky fill .08 since 18 Oct 2026, between .05 (the backs black boxes by day) and .15 (everything flat); the sun still the light)
  const ca=new THREE.Color(), cb=new THREE.Color(), mixC=(a,b,t,out)=>out.copy(ca.setHex(a)).lerp(cb.setHex(b),t);
  let last={h:-1,x:0,z:0,lv:''};
  CLOCK.tick=dt=>{ if(CLOCK.run)CLOCK.h=(CLOCK.h+dt*CLOCK.speed/60)%24;
    const e=elev(CLOCK.h); let i=0; while(i<K.length-2&&e>K[i+1][0])i++; const A=K[i], B=K[i+1], t=Math.max(0,Math.min(1,(e-A[0])/(B[0]-A[0])));
    const up=LVL!=='down';
    if(up){ mixC(A[1],B[1],t,scene.background); mixC(A[2],B[2],t,HEMI.color); mixC(A[3],B[3],t,HEMI.groundColor); HEMI.intensity=A[4]+(B[4]-A[4])*t; }
    // the light: the sun while it's up (or just under, its last glow), else the moon, high in the south-east, faint and blue
    const sun=e>-1, az=sun?azim(CLOCK.h):azim(CLOCK.h+12)*.5+.6, el=sun?Math.max(3,e)*D:48*D;
    mixC(A[5],B[5],t,sunL.color); sunL.intensity=up?A[6]+(B[6]-A[6])*t:0;
    const dir=new THREE.Vector3(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el)); CLOCK.dir=dir;
    // where the sun really is (under the horizon too) and where the moon is: the sky dome draws them there (sky.js)
    { const sa=azim(CLOCK.h), se=e*D; CLOCK.sunV.set(Math.sin(sa)*Math.cos(se),Math.sin(se),Math.cos(sa)*Math.cos(se));
      const ma=azim(CLOCK.h+12)*.5+.6, me=48*D; CLOCK.moonV.set(Math.sin(ma)*Math.cos(me),Math.sin(me),Math.cos(ma)*Math.cos(me)); }
    sunL.target.position.set(pos.x,py,pos.z); sunL.position.copy(sunL.target.position).addScaledVector(dir,60*TILE); sunL.target.updateMatrixWorld();
    // its shadows: every frame while it's strong enough to show them moving; faint (the moon), only when the hour or where you are changes much
    const strong=sunL.intensity>.3; sunL.shadow.autoUpdate=strong&&(CLOCK.fr=(CLOCK.fr||0)+1)%2===0;   // (every other frame: half the cost, a frame's lag unseen)
    if(!strong&&(Math.abs(last.h-CLOCK.h)>.05||Math.hypot(last.x-pos.x,last.z-pos.z)>4*TILE||last.lv!==LVL)){ sunL.shadow.needsUpdate=true; last={h:CLOCK.h,x:pos.x,z:pos.z,lv:LVL}; }
    if(typeof WATER!=='undefined')WATER.glowK=(typeof ROOMS!=='undefined'&&ROOMS.cur)||!up?1:Math.max(0,Math.min(1,(3-e)/8));   // (the water's own glow: the pond glowed green at noon)
    if(UI.menuOpen)CLOCK.draw&&CLOCK.draw(); };
  CLOCK.set=h=>{ CLOCK.h=((h%24)+24)%24; };
  CLOCK.dark=()=>elev(CLOCK.h)<-2;
  CLOCK.sun=sunL; CLOCK.elev=()=>elev(CLOCK.h); CLOCK.SKYV=SKYV;   // (the weather's: weather.js)
  // the menu's TIME (in DISPLAY, first)
  const pane=document.querySelector('#menu [data-p="display"]'), box=document.createElement('div');
  box.innerHTML=`<h3>TIME</h3><div class="row"><span id="ctime" style="width:72px"></span><input type="range" id="chour" min="0" max="24" step="0.05" style="flex:1">
    <button class="btn" id="crun">STOPPED</button><span>A DAY IN</span><select id="cspeed" class="btn"><option value="120">2 MIN</option><option value="600" selected>10 MIN</option><option value="3600">1 HOUR</option><option value="86400">24 HOURS (REAL)</option></select></div>`;
  pane.insertBefore(box,pane.firstChild);
  const q=s=>box.querySelector(s), fmt=h=>{ const H=Math.floor(h), m=Math.floor((h-H)*60); return ((H+11)%12+1)+':'+String(m).padStart(2,'0')+(H<12?' AM':' PM'); };
  CLOCK.draw=()=>{ q('#ctime').textContent=fmt(CLOCK.h); if(document.activeElement!==q('#chour'))q('#chour').value=CLOCK.h; q('#crun').textContent=CLOCK.run?'RUNNING':'STOPPED'; q('#crun').setAttribute('aria-pressed',String(CLOCK.run)); };
  q('#chour').oninput=e=>{ CLOCK.set(+e.target.value); CLOCK.draw(); };
  q('#crun').onclick=()=>{ CLOCK.run=!CLOCK.run; CLOCK.draw(); };
  q('#cspeed').onchange=e=>{ CLOCK.speed=1440/(+e.target.value); };
  addEventListener('keydown',e=>{ if(e.key.toLowerCase()==='n'&&!e.repeat&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))CLOCK.set(CLOCK.dark()?12:19); });
  const qh=+(QS.get('hour')??NaN); if(!isNaN(qh))CLOCK.set(qh);   // (?hour=12: a test's look at another hour)
  CLOCK.draw(); }
