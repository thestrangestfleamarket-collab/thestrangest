const CLOCK={h:17.4,run:false,speed:1440/600,sunV:new THREE.Vector3(0,1,0),moonV:new THREE.Vector3(0,1,0)};
{ const D=Math.PI/180, sunL=new THREE.DirectionalLight(0xffffff,0), sunD=new THREE.DirectionalLight(0xffffff,0), R=32*TILE, RD=20*TILE;
  for(const [L,r,m] of [[sunL,R,3072],[sunD,RD,2048]]){ L.castShadow=true; L.shadow.mapSize.set(m,m); Object.assign(L.shadow.camera,{left:-r,right:r,top:r,bottom:-r,near:.5,far:120*TILE}); L.shadow.camera.updateProjectionMatrix();
    L.shadow.bias=-.0005; L.shadow.normalBias=+(QS.get("snb")||.12); L.shadow.autoUpdate=false; scene.add(L,L.target); }
  const SC={c:new THREE.Vector3(1e9,0,0),d:new THREE.Vector3(),lv:'',t:0,w:0,root:{visible:true,layers:new THREE.Layers(),children:[]},n:0,nd:0};
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
  let lastS=0;
  CLOCK.tick=dt=>{ if(CLOCK.run)CLOCK.h=(CLOCK.h+dt*CLOCK.speed/60)%24;
    const e=elev(CLOCK.h); let i=0; while(i<K.length-2&&e>K[i+1][0])i++; const A=K[i], B=K[i+1], t=Math.max(0,Math.min(1,(e-A[0])/(B[0]-A[0])));
    const up=LVL!=='down';
    if(up){ mixC(A[1],B[1],t,scene.background); mixC(A[2],B[2],t,HEMI.color); mixC(A[3],B[3],t,HEMI.groundColor); HEMI.intensity=A[4]+(B[4]-A[4])*t; }
    const sun=e>-1, az=sun?azim(CLOCK.h):azim(CLOCK.h+12)*.5+.6, el=sun?Math.max(3,e)*D:48*D;
    mixC(A[5],B[5],t,sunL.color); sunL.intensity=up?A[6]+(B[6]-A[6])*t:0;
    const dir=new THREE.Vector3(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el)); CLOCK.dir=dir;
    { const sa=azim(CLOCK.h), se=e*D; CLOCK.sunV.set(Math.sin(sa)*Math.cos(se),Math.sin(se),Math.cos(sa)*Math.cos(se));
      const ma=azim(CLOCK.h+12)*.5+.6, me=48*D; CLOCK.moonV.set(Math.sin(ma)*Math.cos(me),Math.sin(me),Math.cos(ma)*Math.cos(me)); }
    const aim=L=>{ const sc=L.shadow.camera, tx=(sc.right-sc.left)/L.shadow.mapSize.x; SNM.lookAt(dir,ORG,UPV); SR.setFromMatrixColumn(SNM,0); SU.setFromMatrixColumn(SNM,1); SP.set(pos.x,py,pos.z);
      const a=Math.round(SP.dot(SR)/tx)*tx, b=Math.round(SP.dot(SU)/tx)*tx, c=SP.dot(dir); L.target.position.copy(SR).multiplyScalar(a).addScaledVector(SU,b).addScaledVector(dir,c);
      L.position.copy(L.target.position).addScaledVector(dir,60*TILE); L.target.updateMatrixWorld(); L.updateMatrixWorld(); };
    const strong=sunL.intensity>.3, now=performance.now();
    const stale=SC.d.dot(dir)<Math.cos(.4*D)||Math.hypot(SC.c.x-pos.x,SC.c.z-pos.z)>12*TILE||SC.lv!==LVL||Math.abs((cam.right-cam.left)-SC.w)>.1*SC.w||now-SC.t>(strong?10000:20000);
    if(stale){ aim(sunL); SC.c.set(pos.x,py,pos.z); SC.d.copy(dir); SC.lv=LVL; SC.t=now; SC.w=cam.right-cam.left; sunL.shadow.needsUpdate=true; }
    sunD.intensity=0;
    if(sunL.intensity>0&&(strong||now-lastS>100||stale)){ aim(sunD); sunD.shadow.needsUpdate=true; lastS=now; }
    if(typeof WATER!=='undefined')WATER.glowK=(typeof ROOMS!=='undefined'&&ROOMS.cur)||!up?1:Math.max(0,Math.min(1,(3-e)/8));
    if(UI.menuOpen)CLOCK.draw&&CLOCK.draw(); };
  CLOCK.set=h=>{ CLOCK.h=((h%24)+24)%24; };
  CLOCK.dark=()=>elev(CLOCK.h)<-2;
  const DYN=()=>{ const out=new Set(); if(window.W3&&W3.group)out.add(W3.group); for(const N of NPCS)if(N.g)out.add(N.g); for(const x of NPCS.extra||[])if(x&&x.g)out.add(x.g);
    if(window.CREATS)for(const N of CREATS)if(N.g)out.add(N.g); for(const k of ['BOAT','DRONE'])if(window[k]&&window[k].g)out.add(window[k].g); return out; };
  { const SM=renderer.shadowMap, orig=SM.render;
    SM.render=(lights,sc,camera)=>{ if(sc!==scene)return orig.call(SM,lights,sc,camera); const rest=lights.filter(L=>L!==sunL&&L!==sunD); if(!CLOCK.main){ SM.needsUpdate=true; return orig.call(SM,rest,sc,camera); } const m0=camera.layers.mask; camera.layers.enable(3);
      if(lights.includes(sunL)&&sunL.shadow.needsUpdate){ const hid=[]; for(const o of DYN())if(o.visible){ o.visible=false; hid.push(o); } SM.needsUpdate=true; orig.call(SM,[sunL],sc,camera); for(const o of hid)o.visible=true; SC.n++; if(window.SUNLOG){ let c=0; sc.traverseVisible(o=>{ if(o.isMesh&&o.castShadow)c++; }); SUNLOG.push([+(performance.now()/1000).toFixed(2),c]); } }
      if(lights.includes(sunD)&&sunD.shadow.needsUpdate){ const ch=SC.root.children; ch.length=0; for(const o of DYN())if(o.visible&&o.parent)ch.push(o); SM.needsUpdate=true; orig.call(SM,[sunD],SC.root,camera); SC.nd++; }
      SM.needsUpdate=true; orig.call(SM,rest,sc,camera); camera.layers.mask=m0; }; }
  window.SUNDBG=()=>({still:SC.n,moving:SC.nd,dyn:DYN().size,maps:[sunL.shadow.mapSize.x,sunD.shadow.mapSize.x],patch:THREE.ShaderChunk.lights_fragment_begin.includes('NUM_DIR_LIGHT_SHADOWS > 1')});
  CLOCK.sun=sunL; CLOCK.sunD=sunD; window.CLOCK=CLOCK; CLOCK.elev=()=>elev(CLOCK.h); CLOCK.SKYV=SKYV;
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
