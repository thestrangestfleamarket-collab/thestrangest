const CLOCK={h:17.4,run:false,speed:1440/600,sunV:new THREE.Vector3(0,1,0),moonV:new THREE.Vector3(0,1,0)};
{ const D=Math.PI/180, sunL=new THREE.DirectionalLight(0xffffff,0), R=22*TILE;
  sunL.castShadow=true; sunL.shadow.mapSize.set(2048,2048); Object.assign(sunL.shadow.camera,{left:-R,right:R,top:R,bottom:-R,near:.5,far:120*TILE}); sunL.shadow.camera.updateProjectionMatrix();
  sunL.shadow.bias=-.0005; sunL.shadow.normalBias=+(QS.get("snb")||.12);
  const SNM=new THREE.Matrix4(), SR=new THREE.Vector3(), SU=new THREE.Vector3(), SP=new THREE.Vector3(), ORG=new THREE.Vector3(), UPV=new THREE.Vector3(0,1,0);
  const elev=h=>50*Math.cos(2*Math.PI*(h-12.7)/24)-8, azim=h=>2*Math.PI*(h-12.7)/24;
  const K=[[-90,0x050507,0x55607a,0x14110e,.13,0x6f86c9,.14],[-18,0x050507,0x55607a,0x14110e,.13,0x6f86c9,.14],[-12,0x0a0e22,0x4a5a8a,0x15121a,.18,0x6f86c9,.1],
           [-6,0x1e2446,0x5a5a90,0x1e1a22,.36,0xff7a4a,0],[-2,0x3a2a40,0xb08a90,0x2e2222,.5,0xff8a5a,.2],[0,0x4a3038,0xd09a8a,0x3a2a22,.6,0xff9a5a,.6],
           [3,0x6a4a48,0xe0b090,0x4a3a2a,.68,0xffa860,1.1],[6,0x4a3c38,0xf0c8a0,0x4a3a2a,.75,0xffb070,1.6],[10,0x3e4250,0xf0d4b0,0x54442e,.85,0xffd4a0,2.1],
           [14,0x3a4350,0xbfdcff,0x5b4a35,.9,0xfff1d6,2.4],[90,0x3a4350,0xbfdcff,0x5b4a35,.9,0xfff1d6,2.6]];
  const SKYV=QS.get('sky')!=null?+QS.get('sky'):2;
  if(SKYV){ const F=SKYV===2?.09:.3, G=SKYV===2?.08:.28, at=(e,v)=>{ K[K.findIndex(k=>k[0]===e)]=v; };
    at(6,[6,0x9fb8d8,0xf0c8a0,0x4a3a2a,F,0xffb070,1.9]); at(10,[10,0x86aadc,0xf0d4b0,0x54442e,F,0xffd4a0,2.6]); at(14,[14,0x6a9fe0,0xbfdcff,0x5b4a35,G,0xfff1d6,3.5]); at(90,[90,0x4f8ee0,0xbfdcff,0x5b4a35,G,0xfff1d6,3.8]); }
  const ca=new THREE.Color(), cb=new THREE.Color(), mixC=(a,b,t,out)=>out.copy(ca.setHex(a)).lerp(cb.setHex(b),t);
  let last={h:-1,x:0,z:0,lv:''};
  CLOCK.tick=dt=>{ if(CLOCK.run)CLOCK.h=(CLOCK.h+dt*CLOCK.speed/60)%24;
    const e=elev(CLOCK.h); let i=0; while(i<K.length-2&&e>K[i+1][0])i++; const A=K[i], B=K[i+1], t=Math.max(0,Math.min(1,(e-A[0])/(B[0]-A[0])));
    const up=LVL!=='down';
    if(up){ mixC(A[1],B[1],t,scene.background); mixC(A[2],B[2],t,HEMI.color); mixC(A[3],B[3],t,HEMI.groundColor); HEMI.intensity=A[4]+(B[4]-A[4])*t; }
    const sun=e>-1, az=sun?azim(CLOCK.h):azim(CLOCK.h+12)*.5+.6, el=sun?Math.max(3,e)*D:48*D;
    mixC(A[5],B[5],t,sunL.color); sunL.intensity=up?A[6]+(B[6]-A[6])*t:0;
    const dir=new THREE.Vector3(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el)); CLOCK.dir=dir;
    { const sa=azim(CLOCK.h), se=e*D; CLOCK.sunV.set(Math.sin(sa)*Math.cos(se),Math.sin(se),Math.cos(sa)*Math.cos(se));
      const ma=azim(CLOCK.h+12)*.5+.6, me=48*D; CLOCK.moonV.set(Math.sin(ma)*Math.cos(me),Math.sin(me),Math.cos(ma)*Math.cos(me)); }
    { const sc=sunL.shadow.camera, tx=(sc.right-sc.left)/sunL.shadow.mapSize.x; SNM.lookAt(dir,ORG,UPV); SR.setFromMatrixColumn(SNM,0); SU.setFromMatrixColumn(SNM,1); SP.set(pos.x,py,pos.z);
      const a=Math.round(SP.dot(SR)/tx)*tx, b=Math.round(SP.dot(SU)/tx)*tx, c=SP.dot(dir); sunL.target.position.copy(SR).multiplyScalar(a).addScaledVector(SU,b).addScaledVector(dir,c); }
        sunL.position.copy(sunL.target.position).addScaledVector(dir,60*TILE); sunL.target.updateMatrixWorld();
    const strong=sunL.intensity>.3; sunL.shadow.autoUpdate=strong;
    if(!strong&&(Math.abs(last.h-CLOCK.h)>.05||Math.hypot(last.x-pos.x,last.z-pos.z)>4*TILE||last.lv!==LVL)){ sunL.shadow.needsUpdate=true; last={h:CLOCK.h,x:pos.x,z:pos.z,lv:LVL}; }
    if(typeof WATER!=='undefined')WATER.glowK=(typeof ROOMS!=='undefined'&&ROOMS.cur)||!up?1:Math.max(0,Math.min(1,(3-e)/8));
    if(UI.menuOpen)CLOCK.draw&&CLOCK.draw(); };
  CLOCK.set=h=>{ CLOCK.h=((h%24)+24)%24; };
  CLOCK.dark=()=>elev(CLOCK.h)<-2;
  CLOCK.sun=sunL; CLOCK.elev=()=>elev(CLOCK.h); CLOCK.SKYV=SKYV;
  const pane=document.querySelector('#menu [data-p="atmo"]')||document.querySelector('#menu [data-p="display"]'), box=document.createElement('div');
  const PRE=[['DAWN',6.4],['MORNING',9],['NOON',12],['AFTERNOON',15.5],['GOLDEN HOUR',17.4],['SUNSET',18.25],['BLUE HOUR',18.9],['NIGHT',21.5],['MIDNIGHT',0]];
  box.innerHTML=`<h3>TIME OF DAY</h3><div class="row"><span id="ctime" style="width:72px"></span><input type="range" id="chour" min="0" max="24" step="0.05" style="flex:1"></div>
    <div class="row" id="cpre">${PRE.map(([n,h])=>`<button class="btn" data-h="${h}">${n}</button>`).join('')}</div>
    <div class="row"><button class="btn" id="crun">STOPPED</button><span>A DAY IN</span><select id="cspeed" class="btn"><option value="120">2 MIN</option><option value="600" selected>10 MIN</option><option value="3600">1 HOUR</option><option value="86400">24 HOURS (REAL)</option></select></div>`;
  pane.insertBefore(box,pane.firstChild);
  const q=s=>box.querySelector(s), fmt=h=>{ const H=Math.floor(h), m=Math.floor((h-H)*60); return ((H+11)%12+1)+':'+String(m).padStart(2,'0')+(H<12?' AM':' PM'); };
  const keep=()=>{ try{ SAVE.set('clock',JSON.stringify({h:+CLOCK.h.toFixed(3),run:CLOCK.run,speed:CLOCK.speed})); }catch(e){} };
  try{ const k=JSON.parse(SAVE.get('clock')||'null'); if(k&&isFinite(k.h)){ CLOCK.set(k.h); CLOCK.run=!!k.run; if(k.speed>0)CLOCK.speed=k.speed; } }catch(e){}
  q('#cspeed').value=String(Math.round(1440/CLOCK.speed));
  CLOCK.draw=()=>{ q('#ctime').textContent=fmt(CLOCK.h); if(document.activeElement!==q('#chour'))q('#chour').value=CLOCK.h; q('#crun').textContent=CLOCK.run?'RUNNING':'STOPPED'; q('#crun').setAttribute('aria-pressed',String(CLOCK.run));
    q('#cpre').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(Math.abs(+b.dataset.h-CLOCK.h)<.02))); };
  q('#chour').oninput=e=>{ CLOCK.set(+e.target.value); CLOCK.draw(); }; q('#chour').onchange=keep;
  q('#cpre').onclick=e=>{ const b=e.target.closest('button'); if(!b)return; CLOCK.set(+b.dataset.h); CLOCK.draw(); keep(); };
  q('#crun').onclick=()=>{ CLOCK.run=!CLOCK.run; CLOCK.draw(); keep(); };
  q('#cspeed').onchange=e=>{ CLOCK.speed=1440/(+e.target.value); keep(); };
  addEventListener('pagehide',()=>{ if(CLOCK.run)keep(); });
  addEventListener('keydown',e=>{ if(e.key.toLowerCase()==='n'&&!e.repeat&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))CLOCK.set(CLOCK.dark()?12:19); });
  const qh=+(QS.get('hour')??NaN); if(!isNaN(qh))CLOCK.set(qh);
  CLOCK.draw(); }
