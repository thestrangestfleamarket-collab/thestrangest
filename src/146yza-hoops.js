// HOOP FEVER (the owner's page, 11 Nov 2026): arcade basketball in the minigames' window: grab a ball from the tray, flick up to shoot; 60 seconds, four balls, the last 20 seconds the hoop slides and a basket is 3; a streak of three adds 1. Its cabinet is drawn by a renderer of its own, made when the window opens and dropped when it closes.
import {THREE} from './003-shx.js';
import {SFX} from './003b-systems.js';
import {OWNED} from './005-save.js';
const HOOPS={}; window.HOOPS=HOOPS;
{ HOOPS.game=(o={})=>{ '@later'; const T=THREE, W=400, H=560;
  const G=9.81, BALL_R=.075, RIM_R=.15, RIM_T=.009, RIM_Y=1.85, RIM_Z=-1.0, BACK_Z=-1.18, FRONT_Z=1.3, HALF_W=.47, CEIL_Y=2.9, LIP_Y=1.04, RAMP_Y0=1.40, RAMP_S=.2;
  const RLEN=Math.sqrt(1+RAMP_S*RAMP_S), RN_Y=1/RLEN, RN_Z=RAMP_S/RLEN, BOARD_HW=.30, BOARD_Y0=1.75, BOARD_Y1=2.40, HOLD_Z=1.55, GAME_TIME=60, BONUS_TIME=20, LAUNCH=60*Math.PI/180, FLICK_U0=2.2, BK='hoops-best';
  const rampY=z=>RAMP_Y0-RAMP_S*(z-BACK_Z), best=()=>+(OWNED.get(BK)||0)||0;
  let R=null, scene, camera, cur=null, ledTex, hoop, netGeo, netPos, redLight, balls=[], disp=[];
  const CAM_POS=new T.Vector3(0,1.68,2.4);
  // the game's state (one game at a time in the window)
  let state='over', score=0, timeLeft=GAME_TIME, graceT=0, shots=0, makes=0, streak=0, bestStreak=0, lastSec=-1, hoopPhase=0, hoopAmp=0, madeOnce=false, hoopX=0;
  const net={ox:0,oz:0,vx:0,vz:0,s:0,sv:0}, ptr={down:false,nx:0,ny:-.3,samples:[]}, sway={x:0,y:0}, look=new T.Vector3(), axis=new T.Vector3(), tgt=new T.Vector3();
  let held=null, camKick=0, redPulse=0, acc=0, tSec=0, now=0;
  // sounds through the game's own sound
  const AC=()=>SFX.on&&SFX.live&&SFX.live();
  let noiseBuf=null;
  const tone=(f,dur,type,vol,f2,delay)=>{ const a=AC(); if(!a)return; const t=a.currentTime+(delay||0), os=a.createOscillator(), g=a.createGain(); os.type=type||'sine'; os.frequency.setValueAtTime(f,t); if(f2)os.frequency.exponentialRampToValueAtTime(f2,t+dur);
    g.gain.setValueAtTime(vol*.6,t); g.gain.exponentialRampToValueAtTime(.0008,t+dur); os.connect(g); g.connect(SFX.out(a)); os.start(t); os.stop(t+dur+.02); };
  const noise=(dur,vol,type,f1,f2,q)=>{ const a=AC(); if(!a)return; if(!noiseBuf){ noiseBuf=a.createBuffer(1,a.sampleRate,a.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1; }
    const t=a.currentTime, s=a.createBufferSource(), fl=a.createBiquadFilter(), g=a.createGain(); s.buffer=noiseBuf; fl.type=type; fl.Q.value=q||1; fl.frequency.setValueAtTime(f1,t); if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+dur);
    g.gain.setValueAtTime(vol*.6,t); g.gain.exponentialRampToValueAtTime(.0008,t+dur); s.connect(fl); fl.connect(g); g.connect(SFX.out(a)); s.start(t,Math.random()*.5,dur+.02); };
  const S_={ thud:v=>{ v=Math.min(1,v); tone(120,.13,'sine',.5*v,55); noise(.05,.22*v,'lowpass',900); }, board:v=>{ v=Math.min(1,v); tone(210,.1,'triangle',.4*v,120); noise(.04,.3*v,'bandpass',1400,0,2); },
    rim:v=>{ v=Math.min(1,v); tone(523,.22,'sine',.22*v); tone(1137,.16,'sine',.14*v); tone(1873,.09,'sine',.09*v); noise(.03,.15*v,'highpass',2500); }, net:v=>noise(.035,.07*Math.min(1,v),'highpass',3000),
    swish:()=>noise(.32,.5,'bandpass',5200,1300,.9), score:three=>{ tone(880,.09,'square',.1); tone(1320,.14,'square',.1,0,.08); if(three)tone(1760,.2,'square',.1,0,.17); },
    throwS:()=>noise(.16,.14,'bandpass',500,1500,.7), grab:()=>noise(.04,.16,'lowpass',700), tick:()=>tone(1000,.05,'square',.07), go:()=>{ tone(660,.12,'square',.1); tone(990,.3,'square',.1,0,.12); }, buzzer:()=>{ tone(116,1.1,'sawtooth',.22); tone(175,1.1,'sawtooth',.14); } };
  const pop=(text,cls)=>{ if(cur)cur.pops.push({text,cls:cls||'',t:0}); };

  const canvasTex=(w,h,draw)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const ctx=c.getContext('2d'); draw(ctx,w,h); const t=new T.CanvasTexture(c); t.colorSpace=T.SRGBColorSpace; t.anisotropy=4; t.userData={ctx}; disp.push(t); return t; };
  const seam=(ctx,w,h,fn)=>{ ctx.beginPath(); let pu=null; for(let i=0;i<=500;i++){ const p=fn(i/500*Math.PI*2), u=(Math.atan2(p[2],p[0])/(2*Math.PI)+.5)*w, v=(.5-Math.asin(Math.max(-1,Math.min(1,p[1])))/Math.PI)*h; if(pu===null||Math.abs(u-pu)>w/2)ctx.moveTo(u,v); else ctx.lineTo(u,v); pu=u; } ctx.stroke(); };
  const FONT="Bungee, Impact, sans-serif", MONO="Orbitron, monospace";
  const setup=()=>{ if(R)return; disp=[];
    R=new T.WebGLRenderer({antialias:true}); R.setPixelRatio(1); R.setSize(W,H,false); R.outputColorSpace=T.SRGBColorSpace; R.toneMapping=T.ACESFilmicToneMapping; R.toneMappingExposure=1.2; R.shadowMap.enabled=true; R.shadowMap.type=T.PCFSoftShadowMap;
    scene=new T.Scene(); scene.background=new T.Color(0x08080d); camera=new T.PerspectiveCamera(W/H<.75?80:70,W/H,.05,40); camera.position.copy(CAM_POS);
    const ballTex=canvasTex(1024,512,(ctx,w,h)=>{ ctx.fillStyle='#d5601c'; ctx.fillRect(0,0,w,h); for(let i=0;i<26000;i++){ ctx.fillStyle=Math.random()>.5?'rgba(255,170,90,0.10)':'rgba(70,20,0,0.13)'; ctx.fillRect(Math.random()*w,Math.random()*h,2,2); }
      ctx.strokeStyle='#17100d'; ctx.lineWidth=7; ctx.lineCap='round'; seam(ctx,w,h,t=>[Math.cos(t),0,Math.sin(t)]); seam(ctx,w,h,t=>[Math.cos(t),Math.sin(t),0]); const rho=52*Math.PI/180;
      seam(ctx,w,h,t=>[Math.sin(rho)*Math.cos(t),Math.sin(rho)*Math.sin(t),Math.cos(rho)]); seam(ctx,w,h,t=>[Math.sin(rho)*Math.cos(t),Math.sin(rho)*Math.sin(t),-Math.cos(rho)]); });
    const woodTex=canvasTex(512,512,(ctx,w,h)=>{ ctx.fillStyle='#7d5230'; ctx.fillRect(0,0,w,h); const pw=w/8; for(let i=0;i<8;i++){ const tone=110+Math.random()*30; ctx.fillStyle='rgb('+(tone+20|0)+','+(tone*.66|0)+','+(tone*.38|0)+')'; ctx.fillRect(i*pw,0,pw-1,h);
      for(let k=0;k<60;k++){ ctx.fillStyle='rgba(40,20,5,'+(Math.random()*.1)+')'; ctx.fillRect(i*pw+Math.random()*pw,Math.random()*h,1+Math.random(),20+Math.random()*90); } ctx.fillStyle='rgba(20,10,0,.55)'; ctx.fillRect(i*pw+pw-1,0,1,h); ctx.fillRect(i*pw,Math.random()*h,pw,1); } });
    woodTex.wrapS=woodTex.wrapT=T.RepeatWrapping; woodTex.repeat.set(5,5);
    const netTex=canvasTex(64,64,(ctx,w,h)=>{ ctx.strokeStyle='rgba(210,215,225,0.95)'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(w,h); ctx.moveTo(w,0); ctx.lineTo(0,h); ctx.stroke(); });
    netTex.wrapS=netTex.wrapT=T.RepeatWrapping;
    const netMat=(rx,ry)=>{ const t=netTex.clone(); t.needsUpdate=true; t.repeat.set(rx,ry); disp.push(t); return new T.MeshBasicMaterial({map:t,transparent:true,opacity:.42,side:T.DoubleSide,depthWrite:false,color:0x9aa0ad}); };
    const boardTex=canvasTex(512,512,(ctx,w,h)=>{ ctx.fillStyle='#f2f2ee'; ctx.fillRect(0,0,w,h); ctx.strokeStyle='#e0202e'; ctx.lineWidth=16; ctx.strokeRect(14,14,w-28,h-28); ctx.lineWidth=12; ctx.strokeRect(w/2-120,h-250,240,170);
      ctx.fillStyle='#16233f'; ctx.font='700 44px '+FONT; ctx.textAlign='center'; ctx.fillText('HOOP FEVER',w/2,110); });
    const marqueeTex=canvasTex(1024,1024,(ctx,w,h)=>{ const g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#101a36'); g.addColorStop(1,'#070b18'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      ctx.save(); ctx.translate(w/2,h/2); ctx.rotate(-.22); ctx.fillStyle='#d81e2c'; ctx.fillRect(-w,-60,w*2,70); ctx.fillStyle='#f3f1ea'; ctx.fillRect(-w,20,w*2,18); ctx.fillStyle='#2a63d6'; ctx.fillRect(-w,48,w*2,44); ctx.restore();
      ctx.fillStyle='#e06a1f'; ctx.beginPath(); ctx.arc(w/2,330,150,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#17100d'; ctx.lineWidth=9; ctx.beginPath(); ctx.arc(w/2,330,150,0,Math.PI*2); ctx.moveTo(w/2-150,330); ctx.lineTo(w/2+150,330); ctx.moveTo(w/2,180); ctx.lineTo(w/2,480); ctx.stroke();
      ctx.beginPath(); ctx.arc(w/2-215,330,150,-.72,.72); ctx.stroke(); ctx.beginPath(); ctx.arc(w/2+215,330,150,Math.PI-.72,Math.PI+.72); ctx.stroke(); ctx.textAlign='center';
      ctx.fillStyle='#fff'; ctx.font='400 150px '+FONT; ctx.shadowColor='#ff2d3d'; ctx.shadowBlur=40; ctx.fillText('HOOP',w/2,690); ctx.fillStyle='#8fd8ff'; ctx.shadowColor='#39a9ff'; ctx.font='400 120px '+FONT; ctx.fillText('FEVER',w/2,820);
      ctx.shadowBlur=0; ctx.fillStyle='#9a9aa8'; ctx.font='600 34px sans-serif'; ctx.fillText('ARCADE BASKETBALL',w/2,900); });
    ledTex=canvasTex(512,160,()=>{});
    const std=o=>{ const m=new T.MeshStandardMaterial(o); disp.push(m); return m; };
    const M={black:std({color:0x0e0e12,roughness:.55,metalness:.3}),metal:std({color:0x1a1a20,roughness:.35,metalness:.8}),ramp:std({color:0x14151b,roughness:.6,metalness:.1}),wall:std({color:0xa9a59f,roughness:.95}),floor:std({map:woodTex,roughness:.62}),rim:std({color:0xe0431a,roughness:.35,metalness:.6}),white:std({color:0xf2f2ee,roughness:.4})};
    const box=(w,h,d,mat,x,y,z,parent)=>{ const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); (parent||scene).add(m); return m; };
    const neon=(w,h,d,color,x,y,z,parent)=>[box(w,h,d,new T.MeshBasicMaterial({color,toneMapped:false}),x,y,z,parent),box(w+.035,h+.035,d+.035,new T.MeshBasicMaterial({color,transparent:true,opacity:.2,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}),x,y,z,parent)];
    // the room
    const floor=new T.Mesh(new T.PlaneGeometry(12,12),M.floor); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
    const backWall=new T.Mesh(new T.PlaneGeometry(12,4.5),M.wall); backWall.position.set(0,2.25,-1.75); scene.add(backWall);
    const lw=new T.Mesh(new T.PlaneGeometry(8,4.5),M.wall); lw.position.set(-3.6,2.25,1); lw.rotation.y=Math.PI/2; scene.add(lw); const rw=lw.clone(); rw.position.x=3.6; rw.rotation.y=-Math.PI/2; scene.add(rw);
    // the lights (the page's were the old units: here a point or spot light is π times as strong for the same look)
    scene.add(new T.AmbientLight(0x8f93a8,.42*Math.PI)); scene.add(new T.HemisphereLight(0xfff1e0,0x1c1c26,.4*Math.PI));
    const spot=new T.SpotLight(0xfff0dc,1.15*Math.PI,12,.75,.6,1.2); spot.position.set(.7,3.6,2.6); spot.target.position.set(0,1.3,-.4); spot.castShadow=true; spot.shadow.mapSize.set(1024,1024); spot.shadow.camera.near=.5; spot.shadow.camera.far=9; spot.shadow.bias=-.0015; scene.add(spot); scene.add(spot.target);
    redLight=new T.PointLight(0xff2233,.9*Math.PI,3.2,1.6); redLight.position.set(0,2.15,-.8); scene.add(redLight);
    const iceLight=new T.PointLight(0xa8dcff,.75*Math.PI,3.0,1.6); iceLight.position.set(0,1.55,.5); scene.add(iceLight);
    // the cabinet: the ramp, its rails, posts and nets
    const rampLen=(FRONT_Z-BACK_Z)*RLEN, rampAng=Math.atan(RAMP_S), midZ=(FRONT_Z+BACK_Z)/2;
    const ramp=box(HALF_W*2,.02,rampLen,M.ramp,0,rampY(midZ)-.0102,midZ); ramp.rotation.x=rampAng; ramp.receiveShadow=true;
    const stripe=new T.Mesh(new T.PlaneGeometry(.035,rampLen*.9),new T.MeshBasicMaterial({color:0x2a2c38})); stripe.rotation.x=-Math.PI/2+rampAng; stripe.position.set(0,rampY(midZ)+.002,midZ); scene.add(stripe);
    for(const s of [-1,1]){ const rail=box(.05,.1,rampLen,M.black,s*(HALF_W+.025),rampY(midZ)+.03,midZ); rail.rotation.x=rampAng;
      neon(.012,.012,rampLen*.98,0xcfeaff,s*(HALF_W-.004),rampY(midZ)+.075,midZ).forEach(m=>{ m.rotation.x=rampAng; });
      const g=new T.BufferGeometry(), x=s*(HALF_W+.05); g.setAttribute('position',new T.Float32BufferAttribute([x,0,BACK_Z,x,0,FRONT_Z,x,rampY(FRONT_Z)+.08,FRONT_Z,x,0,BACK_Z,x,rampY(FRONT_Z)+.08,FRONT_Z,x,rampY(BACK_Z)+.08,BACK_Z],3)); g.computeVertexNormals();
      scene.add(new T.Mesh(g,std({color:0x0e0e12,roughness:.6,side:T.DoubleSide})));
      box(.045,CEIL_Y-rampY(BACK_Z),.045,M.metal,s*(HALF_W+.025),(CEIL_Y+rampY(BACK_Z))/2,BACK_Z); box(.045,CEIL_Y-rampY(FRONT_Z),.045,M.metal,s*(HALF_W+.025),(CEIL_Y+rampY(FRONT_Z))/2,FRONT_Z); box(.04,.04,FRONT_Z-BACK_Z,M.metal,s*(HALF_W+.025),CEIL_Y,midZ);
      const hN=CEIL_Y-1.0, sn=new T.Mesh(new T.PlaneGeometry(FRONT_Z-BACK_Z,hN),netMat(34,26)); sn.rotation.y=Math.PI/2; sn.position.set(s*(HALF_W+.01),1.0+hN/2,midZ); scene.add(sn);
      neon(.014,CEIL_Y-1.5,.014,0xff2233,s*(HALF_W-.01),(CEIL_Y+1.5)/2,BACK_Z+.03); }
    box(HALF_W*2+.1,.04,.04,M.metal,0,CEIL_Y,BACK_Z); box(HALF_W*2+.1,.04,.04,M.metal,0,CEIL_Y,FRONT_Z); neon(HALF_W*2-.04,.014,.014,0xff2233,0,CEIL_Y-.03,BACK_Z+.03);
    const topNet=new T.Mesh(new T.PlaneGeometry(HALF_W*2,FRONT_Z-BACK_Z),netMat(13,34)); topNet.rotation.x=Math.PI/2; topNet.position.set(0,CEIL_Y,midZ); scene.add(topNet);
    const backNet=new T.Mesh(new T.PlaneGeometry(HALF_W*2,CEIL_Y-rampY(BACK_Z)),netMat(13,20)); backNet.position.set(0,(CEIL_Y+rampY(BACK_Z))/2,BACK_Z-.035); scene.add(backNet);
    box(HALF_W*2+.1,rampY(BACK_Z)+.08,.04,M.black,0,(rampY(BACK_Z)+.08)/2,BACK_Z-.03);
    // the clear front lip, the console and its marquee
    box(HALF_W*2,LIP_Y-rampY(FRONT_Z)+.02,.012,std({color:0xbfe6ff,transparent:true,opacity:.16,roughness:.1,metalness:.2,depthWrite:false}),0,(LIP_Y+rampY(FRONT_Z))/2,FRONT_Z+.006);
    neon(HALF_W*2,.012,.012,0xcfeaff,0,LIP_Y+.008,FRONT_Z+.006);
    const consoleBox=box(HALF_W*2+.14,.97,.44,M.black,0,.485,FRONT_Z+.24); consoleBox.castShadow=true; consoleBox.receiveShadow=true;
    const marquee=new T.Mesh(new T.PlaneGeometry(.86,.86),new T.MeshBasicMaterial({map:marqueeTex,toneMapped:false})); marquee.position.set(0,.5,FRONT_Z+.461); scene.add(marquee);
    neon(.014,.9,.014,0xcfeaff,-HALF_W-.05,.5,FRONT_Z+.462); neon(.014,.9,.014,0xcfeaff,HALF_W+.05,.5,FRONT_Z+.462); neon(HALF_W*2+.1,.014,.014,0xff2233,0,.955,FRONT_Z+.462);
    // the LED scoreboard
    box(.84,.3,.04,M.black,0,2.62,BACK_Z-.012); const led=new T.Mesh(new T.PlaneGeometry(.8,.25),new T.MeshBasicMaterial({map:ledTex,toneMapped:false})); led.position.set(0,2.62,BACK_Z+.01); scene.add(led);
    // the hoop (it slides in bonus time)
    hoop=new T.Group(); scene.add(hoop);
    box(BOARD_HW*2,BOARD_Y1-BOARD_Y0,.03,M.white,0,(BOARD_Y0+BOARD_Y1)/2,BACK_Z-.015,hoop);
    const boardFace=new T.Mesh(new T.PlaneGeometry(BOARD_HW*2,BOARD_Y1-BOARD_Y0),std({map:boardTex,roughness:.35})); boardFace.position.set(0,(BOARD_Y0+BOARD_Y1)/2,BACK_Z+.001); hoop.add(boardFace);
    { const cy=(BOARD_Y0+BOARD_Y1)/2, hh=(BOARD_Y1-BOARD_Y0)/2, z=BACK_Z+.008; neon(BOARD_HW*2+.03,.014,.014,0xff2233,0,BOARD_Y1+.012,z,hoop); neon(.014,hh*2+.03,.014,0xff2233,-BOARD_HW-.012,cy,z,hoop); neon(.014,hh*2+.03,.014,0xff2233,BOARD_HW+.012,cy,z,hoop); }
    const rim=new T.Mesh(new T.TorusGeometry(RIM_R,RIM_T,10,48),M.rim); rim.rotation.x=Math.PI/2; rim.position.set(0,RIM_Y,RIM_Z); rim.castShadow=true; hoop.add(rim);
    box(.07,.012,.05,M.rim,0,RIM_Y,(BACK_Z+RIM_Z-RIM_R)/2,hoop); box(.09,.09,.008,M.rim,0,RIM_Y-.03,BACK_Z+.005,hoop);
    // the rope net under the rim
    netPos=new Float32Array((NK-1)*NS*2*2*3); netGeo=new T.BufferGeometry(); netGeo.setAttribute('position',new T.BufferAttribute(netPos,3));
    const netLines=new T.LineSegments(netGeo,new T.LineBasicMaterial({color:0xf4f4f4,transparent:true,opacity:.92})); netLines.frustumCulled=false; scene.add(netLines);
    // the balls
    const ballGeo=new T.SphereGeometry(BALL_R,40,28), ballMat=std({map:ballTex,bumpMap:ballTex,bumpScale:.0015,roughness:.78,metalness:0}); balls=[];
    for(let bi=0;bi<4;bi++){ const mesh=new T.Mesh(ballGeo,ballMat); mesh.castShadow=true; scene.add(mesh); mesh.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);
      balls.push({mesh,p:new T.Vector3(),v:new T.Vector3(),w:new T.Vector3(),held:false,thrown:false,scored:false,rim:false,prevY:0,sndT:0}); } };
  const drop=()=>{ if(!R)return; scene.traverse(m=>{ if(m.geometry)m.geometry.dispose(); if(m.material)m.material.dispose(); }); disp.forEach(d=>d.dispose()); R.dispose(); R.forceContextLoss(); R=null; scene=camera=null; balls=[]; cur=null; held=null; };

  const NS=14, NK=5, NET_LEN=.21;
  const netPoint=(k,i,out,o2)=>{ const f=k/(NK-1), a=(i+(k%2)*.5)/NS*Math.PI*2, r=RIM_R*(1-.46*Math.pow(f,.8))*(1-.12*net.s*f); out[o2]=hoopX+net.ox*f*f+Math.cos(a)*r; out[o2+1]=RIM_Y-NET_LEN*f*(1+.32*net.s); out[o2+2]=RIM_Z+net.oz*f*f+Math.sin(a)*r; };
  const updateNet=dt=>{ net.vx+=(-170*net.ox-8*net.vx)*dt; net.vz+=(-170*net.oz-8*net.vz)*dt; net.ox+=net.vx*dt; net.oz+=net.vz*dt; net.sv+=(-240*net.s-9*net.sv)*dt; net.s+=net.sv*dt;
    let o2=0; for(let k=0;k<NK-1;k++)for(let i=0;i<NS;i++){ const j=(k%2)?(i+1)%NS:(i+NS-1)%NS; netPoint(k,i,netPos,o2); netPoint(k+1,i,netPos,o2+3); netPoint(k,i,netPos,o2+6); netPoint(k+1,j,netPos,o2+9); o2+=12; } netGeo.attributes.position.needsUpdate=true; };
  const trayReset=()=>balls.forEach((b,i)=>{ b.p.set(-.3+i*.2,rampY(1.1)+BALL_R+.02,1.1-(i%2)*.05); b.v.set(0,0,0); b.w.set(0,0,0); b.held=b.thrown=b.scored=b.rim=false; });
  const missed=()=>{ streak=0; };
  const respawn=b=>{ b.p.set((Math.random()-.5)*.5,rampY(-.7)+.35,-.7); b.v.set(0,0,.3); b.w.set(0,0,0); if(b.thrown&&!b.scored)missed(); b.thrown=false; };
  const drawLED=()=>{ const c=ledTex.userData.ctx, w=512, h=160; c.fillStyle='#060508'; c.fillRect(0,0,w,h); c.textAlign='center';
    const col=(x,label,val,color,size)=>{ c.shadowBlur=0; c.fillStyle='#6b6b78'; c.font='500 20px '+MONO; c.fillText(label,x,34); c.fillStyle=color; c.shadowColor=color; c.shadowBlur=18; c.font='800 '+size+'px '+MONO; c.fillText(val,x,34+size+10); };
    col(88,'TIME',String(Math.max(0,Math.ceil(timeLeft))),timeLeft<=BONUS_TIME&&state!=='over'?'#ffb629':'#8fd8ff',66); col(256,'SCORE',String(score),'#ff2d3d',92); col(424,'BEST',String(Math.max(best(),score*(state==='over'))),'#f3f1ea',66);
    c.shadowBlur=0; c.fillStyle='rgba(0,0,0,0.28)'; for(let y=0;y<h;y+=4)c.fillRect(0,y,w,1); ledTex.needsUpdate=true; };
  const scored=b=>{ if(state!=='play'&&state!=='grace')return; const bonus=timeLeft<=BONUS_TIME; let pts=bonus?3:2; streak++; makes++; bestStreak=Math.max(bestStreak,streak); if(streak>=3)pts+=1;
    score+=pts; madeOnce=true; const swish=!b.rim; pop((swish?'SWISH  ':'')+'+'+pts,swish?'swish':''); if(swish)S_.swish(); else noise(.2,.3,'bandpass',4200,1500,.9); S_.score(bonus); net.sv+=7; redPulse=1; drawLED(); };
  const startGame=()=>{ score=0; timeLeft=GAME_TIME; shots=makes=streak=bestStreak=0; lastSec=-1; hoopPhase=0; hoopAmp=0; held=null; trayReset(); state='play'; pop('GO!'); S_.go(); drawLED(); };
  const endGame=()=>{ state='over'; const S=cur; if(!S)return; const was=best(), isBest=score>was&&score>0; if(isBest)OWNED.set(BK,String(score)); const n=Math.floor(score/5);
    S.score=score; S.tickets=n; S.over=`${score} POINTS · MADE ${makes}/${shots} · STREAK ${bestStreak}: ${n} TICKET${n===1?'':'S'}.${isBest&&was?' A NEW BEST!':''}`; drawLED(); };

  // grab and flick (the pointer is the window's canvas)
  const holdTarget=out=>out.set(ptr.nx*.24,Math.max(1.27,1.36+ptr.ny*.2),HOLD_Z);
  const tryGrab=()=>{ if(held||state!=='play')return; const tx=ptr.nx*.24; let pick=null, bd=1e9;
    for(const b of balls){ if(b.held||b.p.z<.7||b.p.z>FRONT_Z||b.v.lengthSq()>9)continue; const d=Math.abs(b.p.x-tx); if(d<bd){ bd=d; pick=b; } }
    if(!pick)return; held=pick; pick.held=true; pick.thrown=pick.scored=pick.rim=false; pick.v.set(0,0,0); pick.w.set(0,0,0); S_.grab(); };
  const releaseHeld=silent=>{ if(!held)return; if(silent){ const b=held; held=null; b.held=false; b.v.set(0,.5,-1.4); return; }
    const Sm=ptr.samples; let sx=0, u=0; if(Sm.length>1){ const L=Sm[Sm.length-1]; if(now-L.t<90){ let k=Sm.length-1; while(k>0&&L.t-Sm[k-1].t<=110)k--; const dt=(L.t-Sm[k].t)/1000; if(dt>.012){ sx=(L.x-Sm[k].x)/dt/H; u=-(L.y-Sm[k].y)/dt/H; } } }
    shoot(u,sx); };
  // a flick of u screen-heights a second upward and sx sideways
  const shoot=(u,sx)=>{ if(!held)return; const b=held; held=null; b.held=false;
    if(u<.45){ b.v.set(0,.9,-1.5); b.w.set(0,0,0); return; }
    const dx=0-b.p.x, dz=RIM_Z-b.p.z, D=Math.sqrt(dx*dx+dz*dz), dy=RIM_Y-b.p.y, c=Math.cos(LAUNCH), tn=Math.tan(LAUNCH), vIdeal=Math.sqrt(G*D*D/(2*c*c*Math.max(.2,D*tn-dy)));
    const d=Math.max(-1.1,Math.min(1.1,Math.log(u/FLICK_U0))), ad=Math.abs(d), dead=.15, gcurve=(d<0?-1:1)*(Math.min(ad,dead)*.08+Math.max(ad-dead,0)*(d>0?.55:.32)), v=vIdeal*1.045*Math.exp(gcurve);
    const yaw=Math.atan2(sx,u)*.4, hx=dx/D, hz=dz/D, cy=Math.cos(yaw), sy=Math.sin(yaw), rx=hx*cy-hz*sy, rz=hx*sy+hz*cy;
    b.v.set(rx*v*c,v*Math.sin(LAUNCH),rz*v*c); b.w.set(9,0,-rx*3); b.thrown=true; b.scored=false; b.rim=false; shots++; camKick=1; S_.throwS(); };

  // the physics, as the page has it
  const hitPlane=(b,nx,ny,nz,pen,e)=>{ b.p.x+=nx*pen; b.p.y+=ny*pen; b.p.z+=nz*pen; const vn=b.v.x*nx+b.v.y*ny+b.v.z*nz;
    if(vn<0){ const j=-(1+(vn<-.6?e:0))*vn; b.v.x+=nx*j; b.v.y+=ny*j; b.v.z+=nz*j; if(vn<-1.0){ b.v.x*=.96; b.v.z*=.96; } return -vn; } return 0; };
  const stepBall=(b,dt)=>{ b.v.y-=G*dt; const drag=1-.04*dt; b.v.x*=drag; b.v.y*=drag; b.v.z*=drag; b.prevY=b.p.y; b.p.x+=b.v.x*dt; b.p.y+=b.v.y*dt; b.p.z+=b.v.z*dt; let s;
    if(b.p.z<FRONT_Z){ const dist=(b.p.y-rampY(b.p.z))*RN_Y;
      if(dist<BALL_R){ const imp=hitPlane(b,0,RN_Y,RN_Z,BALL_R-dist,.5); if(imp>1.0&&now-b.sndT>60){ S_.thud(imp/6); b.sndT=now; } const rf=1-.35*dt; b.v.x*=rf; b.v.z*=rf;
        b.w.set((RN_Y*b.v.z-RN_Z*b.v.y)/BALL_R,(RN_Z*b.v.x)/BALL_R,(-RN_Y*b.v.x)/BALL_R); if(b.thrown){ if(!b.scored)missed(); b.thrown=false; } }
      const lim=HALF_W-BALL_R; if(b.p.x>lim){ s=hitPlane(b,-1,0,0,b.p.x-lim,.3); if(s>1.2)S_.net(s/4); } else if(b.p.x<-lim){ s=hitPlane(b,1,0,0,-lim-b.p.x,.3); if(s>1.2)S_.net(s/4); }
      if(b.p.z<BACK_Z+BALL_R){ const onBoard=Math.abs(b.p.x-hoopX)<BOARD_HW+.02&&b.p.y>BOARD_Y0-.02&&b.p.y<BOARD_Y1+.02; s=hitPlane(b,0,0,1,BACK_Z+BALL_R-b.p.z,onBoard?.68:.25);
        if(s>.8&&now-b.sndT>60){ if(onBoard)S_.board(s/5); else S_.net(s/4); b.sndT=now; } if(onBoard)b.rim=true; }
      if(b.p.y>CEIL_Y-BALL_R){ s=hitPlane(b,0,-1,0,b.p.y-(CEIL_Y-BALL_R),.25); if(s>1)S_.net(s/4); }
      if(b.p.z>FRONT_Z-BALL_R&&b.p.y<LIP_Y){ s=hitPlane(b,0,0,-1,b.p.z-(FRONT_Z-BALL_R),.3); if(s>1.0&&now-b.sndT>60){ S_.thud(s/8); b.sndT=now; } } }
    const dx=b.p.x-hoopX, dz=b.p.z-RIM_Z, L=Math.sqrt(dx*dx+dz*dz);
    if(L>1e-4&&Math.abs(b.p.y-RIM_Y)<BALL_R+RIM_T){ const qx=hoopX+dx/L*RIM_R, qz=RIM_Z+dz/L*RIM_R, ex=b.p.x-qx, ey=b.p.y-RIM_Y, ez=b.p.z-qz, dd=Math.sqrt(ex*ex+ey*ey+ez*ez), minD=BALL_R+RIM_T;
      if(dd<minD&&dd>1e-5){ const nx=ex/dd, ny=ey/dd, nz=ez/dd, pen=minD-dd; b.p.x+=nx*pen; b.p.y+=ny*pen; b.p.z+=nz*pen; const vn=b.v.x*nx+b.v.y*ny+b.v.z*nz;
        if(vn<0){ const j=-(1+.52)*vn; b.v.x+=nx*j; b.v.y+=ny*j; b.v.z+=nz*j; b.v.x*=.985; b.v.z*=.985; if(vn<-.5&&now-b.sndT>50){ S_.rim(-vn/4); b.sndT=now; } b.w.multiplyScalar(.6); } b.rim=true; } }
    if(b.thrown&&!b.scored&&b.v.y<0&&b.prevY>RIM_Y&&b.p.y<=RIM_Y&&L<RIM_R-.01){ b.scored=true; scored(b); }
    if(b.p.y<RIM_Y&&b.p.y>RIM_Y-NET_LEN-.03&&L<RIM_R&&b.v.y<.5){ const k=1-5*dt; b.v.x*=k; b.v.z*=k; b.v.x-=dx*26*dt; b.v.z-=dz*26*dt; if(b.v.y<-2.4)b.v.y+=(-2.4-b.v.y)*Math.min(1,7*dt); net.vx+=(dx-net.ox)*420*dt; net.vz+=(dz-net.oz)*420*dt; net.sv+=10*dt; }
    if(b.p.y<.35||b.p.z>3.4||Math.abs(b.p.x)>2.5)respawn(b); };
  const ballPairs=()=>{ for(let i=0;i<balls.length;i++){ const a=balls[i]; if(a.held)continue; for(let j=i+1;j<balls.length;j++){ const b=balls[j]; if(b.held)continue;
    const dx=b.p.x-a.p.x, dy=b.p.y-a.p.y, dz=b.p.z-a.p.z, d2=dx*dx+dy*dy+dz*dz, m=BALL_R*2; if(d2>=m*m||d2<1e-10)continue;
    const d=Math.sqrt(d2), nx=dx/d, ny=dy/d, nz=dz/d, pen=(m-d)/2; a.p.x-=nx*pen; a.p.y-=ny*pen; a.p.z-=nz*pen; b.p.x+=nx*pen; b.p.y+=ny*pen; b.p.z+=nz*pen;
    const rv=(b.v.x-a.v.x)*nx+(b.v.y-a.v.y)*ny+(b.v.z-a.v.z)*nz; if(rv<0){ const jj=-(1+(rv<-.5?.6:0))*rv/2; a.v.x-=nx*jj; a.v.y-=ny*jj; a.v.z-=nz*jj; b.v.x+=nx*jj; b.v.y+=ny*jj; b.v.z+=nz*jj; if(rv<-1.2)S_.thud(-rv/9); } } } };
  const STEP=1/240;
  const frame=dt=>{ tSec+=dt; now+=dt*1000;
    if(state==='play'){ timeLeft-=dt; const sec=Math.ceil(timeLeft); if(sec!==lastSec){ lastSec=sec; if(sec<=5&&sec>0)S_.tick(); if(sec===BONUS_TIME){ pop('BONUS TIME','small'); S_.go(); } drawLED(); }
      if(timeLeft<=0){ timeLeft=0; state='grace'; graceT=2.2; S_.buzzer(); pop('TIME!'); ptr.down=false; releaseHeld(true); drawLED(); }
      if(ptr.down&&!held)tryGrab(); }
    else if(state==='grace'){ graceT-=dt; if(graceT<=0)endGame(); }
    hoopAmp+=((state==='play'&&timeLeft<=BONUS_TIME?.15:0)-hoopAmp)*Math.min(1,dt*1.6); hoopPhase+=dt*1.5; hoopX=Math.sin(hoopPhase)*hoopAmp; hoop.position.x=hoopX;
    if(held){ holdTarget(tgt); const a=1-Math.exp(-24*dt); held.p.x+=(tgt.x-held.p.x)*a; held.p.y+=(tgt.y-held.p.y)*a; held.p.z+=(tgt.z-held.p.z)*a; }
    acc+=dt; let n=0; while(acc>=STEP&&n<14){ for(const b of balls)if(!b.held)stepBall(b,STEP); ballPairs(); acc-=STEP; n++; } if(n===14)acc=0;
    for(const b of balls){ b.mesh.position.copy(b.p); const wl=b.w.length(); if(wl>.01){ axis.copy(b.w).multiplyScalar(1/wl); b.mesh.rotateOnWorldAxis(axis,wl*dt); } }
    updateNet(dt);
    const sm=1-Math.exp(-6*dt); sway.x+=(ptr.nx-sway.x)*sm; sway.y+=(ptr.ny-sway.y)*sm; camKick+=(0-camKick)*(1-Math.exp(-5*dt));
    camera.position.set(CAM_POS.x+sway.x*.035,CAM_POS.y+Math.sin(tSec*1.3)*.004+camKick*.012,CAM_POS.z-camKick*.02); look.set(sway.x*.2,1.6+sway.y*.14+camKick*.07,-1); camera.lookAt(look);
    redPulse+=(0-redPulse)*(1-Math.exp(-3*dt)); redLight.intensity=(.9+redPulse*2.2+Math.sin(tSec*7)*.02)*Math.PI; };

  return {title:'HOOP FEVER',w:W,h:H,again:true,help:'Press and hold to grab a ball from the tray, then flick upward and let go: flick speed is power, flick direction is aim. 60 seconds; the last 20 the hoop slides and a basket is 3. Every 5 points is a ticket.',
    can:o.can,
    start:S=>{ if(o.pay)o.pay(); setup(); cur=S; S.pops=[]; ptr.down=false; ptr.samples.length=0; startGame(); },
    tick:(S,dt)=>{ S.t+=dt; ptr.nx=S.mx/W*2-1; ptr.ny=-(S.my/H*2-1);
      if(S.press&&!S.keys.size){ ptr.down=true; ptr.samples.length=0; tryGrab(); }
      if(S.down){ ptr.samples.push({t:now,x:S.mx,y:S.my}); if(ptr.samples.length>24)ptr.samples.shift(); }
      if(S.release&&ptr.down){ ptr.down=false; releaseHeld(false); }
      frame(dt); for(const p of S.pops)p.t+=dt; S.pops=S.pops.filter(p=>p.t<1); S.line=state==='play'?`${Math.ceil(timeLeft)} S · ${score} POINTS${streak>=3?' · ON FIRE ×'+streak:''}`:state==='grace'?'TIME!':''; },
    draw:(S,g)=>{ if(!R)return; if(S.over)frame(1/60); R.render(scene,camera); g.drawImage(R.domElement,0,0,W,H); g.textAlign='center'; g.textBaseline='middle';
      g.font='bold 14px monospace'; g.fillStyle='#8fd8ff'; g.textAlign='left'; g.fillText('TIME '+Math.max(0,Math.ceil(timeLeft)),12,14); g.textAlign='right'; g.fillStyle='#ffb629'; g.fillText('BEST '+Math.max(best(),S.over?score:0),W-12,14);
      g.textAlign='center'; g.fillStyle='#ff2d3d'; g.font='bold 18px monospace'; g.fillText(String(score),W/2,14);
      if(state==='play'&&timeLeft<=BONUS_TIME){ g.fillStyle='#ffb629'; g.fillRect(W/2-120,34,240,20); g.fillStyle='#07070c'; g.font='bold 12px monospace'; g.fillText('BONUS TIME · 3 POINTS · HOOP MOVES',W/2,44); }
      if(state==='play'&&!madeOnce&&!S.pops.length){ g.fillStyle='rgba(10,10,18,.8)'; g.fillRect(W/2-170,H-40,340,26); g.fillStyle='#f3f1ea'; g.font='13px monospace'; g.fillText('HOLD TO GRAB A BALL, THEN FLICK UP',W/2,H-27); }
      for(const p of S.pops){ const k=p.t, a=k<.7?1:Math.max(0,1-(k-.7)/.3), y=H*.3-k*50, sc=k<.18?.5+k/.18*.6:1.1-Math.min(.1,(k-.18)); g.save(); g.globalAlpha=Math.min(1,k/.18)*a; g.translate(W/2,y); g.scale(sc,sc);
        g.font=(p.cls==='small'?'bold 24px ':'bold 42px ')+'sans-serif'; g.shadowColor=p.cls==='swish'?'#8fd8ff':'#ff2d3d'; g.shadowBlur=18; g.fillStyle=p.cls==='small'?'#c0c0cc':'#fff'; g.fillText(p.text,0,0); g.restore(); } },
    close:drop, quit:drop, dbg:()=>({state,score,shots,makes,time:timeLeft}), flick:(u,sx=0)=>{ if(!held){ ptr.nx=0; tryGrab(); } if(held){ const t=new T.Vector3(); holdTarget(t); held.p.copy(t); } shoot(u,sx); },
    end:S=>o.end&&o.end(S)}; };
}
export {HOOPS};
