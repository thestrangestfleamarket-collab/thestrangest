// THE HEADSET: VR plays THE MARKET in a WebXR headset (a Quest 3 in its browser): you look out of the Walker's eyes, the Touch controllers drive PAD, and an open window floats on a panel you point at with a controller or your hand.
import {SHARED, THREE} from './003-shx.js';
import {BOAT, ED, FEEL, keys, pos, RAG, st, UI, VIT, VR, W3} from './003b-systems.js';
import {PCAM, renderer, resize, scene} from './004-main.js';
import {FADE, SYS, TILE} from './006-map-pre.js';
import {collide, frame, PAD} from './075-main-13.js';
{
  const xr=navigator.xr, V3=THREE.Vector3, SNAP=Math.PI/6, LEASH=.3, PANW=1.5;
  Object.assign(VR,{s:null,busy:false,cal:false,pose:null,rt:null,yaw:0,eye:0,y0:0,px:0,pz:0,view:'',fov:60,tip:0,m:'',win:false,ct:0,bt:0,sn:0,err:0,hands:0,wt:0,l3:0,r3:0});
  const O=new V3(), HL=new V3(), HQ=new THREE.Quaternion(), FW=new V3(), EV=new V3();
  const DOLLY=new THREE.Group(), CAM=new THREE.PerspectiveCamera(70,1,.05,450); DOLLY.add(CAM); VR.cam=CAM; VR.dolly=DOLLY;
  const HUD=new THREE.Scene(), HG=new THREE.Group(), TRK=new THREE.Group(); HG.matrixAutoUpdate=TRK.matrixAutoUpdate=false; HUD.add(HG,TRK);
  const flat=o=>Object.assign({fog:false,toneMapped:false},o);
  const veil=new THREE.Mesh(new THREE.SphereGeometry(.3,16,8),new THREE.MeshBasicMaterial(flat({color:0,side:THREE.BackSide,transparent:true,depthTest:false,depthWrite:false}))); veil.renderOrder=10; HG.add(veil);
  const label=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return [c,t]; };
  const [cv,tex]=label(512,200);
  const card=new THREE.Mesh(new THREE.PlaneGeometry(.96,.375),new THREE.MeshBasicMaterial(flat({map:tex,transparent:true,depthTest:false,depthWrite:false}))); card.position.set(0,-.14,-1.1); card.renderOrder=11; card.visible=false; HG.add(card);
  const TIP=['THE MARKET IN VR','LEFT STICK WALKS · RIGHT STICK TURNS · A JUMPS','X USES · Y KICKS · RIGHT TRIGGER RUNS · LEFT STICK PRESS: MENU','POINT + TRIGGER OR PINCH PRESSES · HOLD B: LEAVE VR'];
  const write=(c,t,L,big,small)=>{ const g=c.getContext('2d'), W=c.width, H=c.height; g.clearRect(0,0,W,H); g.fillStyle='rgba(16,18,26,.9)'; g.fillRect(0,0,W,H); g.strokeStyle='#2a2e3a'; g.lineWidth=4; g.strokeRect(2,2,W-4,H-4); g.textAlign='center'; g.textBaseline='middle';
    L.forEach((l,i)=>{ let px=i?small:big; do{ g.font=px+'px Silkscreen, monospace'; }while(g.measureText(l).width>W-28&&--px>9); g.fillStyle=i?'#ece5d3':'#f2c14e'; g.fillText(l,W/2,H/(L.length*2)*(i*2+1)); }); t.needsUpdate=true; };
  const tap=k=>{ for(const t of ['keydown','keyup'])dispatchEvent(new KeyboardEvent(t,{key:k,bubbles:true,cancelable:true})); };

  const B0=()=>({value:0,pressed:false,touched:false});
  const VP={id:'Meta Quest Touch (WebXR)',index:-1,connected:false,mapping:'standard',timestamp:0,axes:[0,0,0,0],buttons:Array.from({length:16},B0),hapticActuators:[]};
  const MAPB=[['R',4],['R',5],['L',4],['L',5],['L',1],['R',1],['L',0],['R',0]];
  const read=xf=>{ const H={L:null,R:null}; for(const s of xf.session.inputSources)if(s.gamepad&&!s.hand&&(s.handedness==='left'||s.handedness==='right'))H[s.handedness==='left'?'L':'R']=s.gamepad;
    MAPB.forEach((m,i)=>{ const b=H[m[0]]&&H[m[0]].buttons[m[1]], v=b?b.value:0; VP.buttons[i].value=v; VP.buttons[i].pressed=v>.5; });
    const ax=(g,k)=>!g?0:(g.axes.length>=4?g.axes[2+k]:g.axes[k])||0; VP.axes[0]=ax(H.L,0); VP.axes[1]=ax(H.L,1); VP.axes[2]=ax(H.R,0); VP.axes[3]=ax(H.R,1); VP.timestamp=performance.now();
    const st3=g=>!!(g&&g.buttons[3]&&g.buttons[3].value>.5); VR.l3=st3(H.L); VR.r3=st3(H.R); };

  const RAF=window.requestAnimationFrame, CAF=window.cancelAnimationFrame, Q=new Map(); let qid=1e9, nat=0, beat=false;
  const pulse=()=>{ nat=performance.now(); if(beat)RAF.call(window,pulse); };
  const shim=on=>{ beat=on; if(!on){ window.requestAnimationFrame=RAF; window.cancelAnimationFrame=CAF; for(const [id,q] of Q)RAF.call(window,t=>{ if(Q.delete(id))q.f(t); }); return; } nat=performance.now(); RAF.call(window,pulse);
    window.requestAnimationFrame=f=>{ const id=++qid; Q.set(id,{f,n:RAF.call(window,t=>{ if(Q.delete(id))f(t); })}); return id; };
    window.cancelAnimationFrame=id=>{ const q=Q.get(id); if(q){ Q.delete(id); CAF.call(window,q.n); } else CAF.call(window,id); }; };
  const flush=t=>{ if(!Q.size||performance.now()-nat<250)return; const L=[...Q.values()]; Q.clear(); for(const q of L){ CAF.call(window,q.n); try{ q.f(t); }catch(e){ console.warn('VR: a frame callback',e); } } };

  const [pcv,ptex]=label(2,2);
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial(flat({map:ptex,transparent:true,side:THREE.DoubleSide}))); panel.visible=false; TRK.add(panel);
  const hl=new THREE.LineLoop(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(12,3)),new THREE.LineBasicMaterial(flat({color:0xf2c14e}))); hl.visible=false; hl.frustumCulled=false; panel.add(hl);
  const PN={ready:false,W:1,H:1,busy:false,dirty:false,t:0,n:0,mo:null,els:[],seen:'',shot:'',fresh:false,hits:[],scs:[],ch:0,d0:0};
  const dirt=()=>{ const n=performance.now(); if(!PN.dirty)PN.d0=n; PN.dirty=true; PN.ch=n; };
  const CLK='button,input,select,textarea,a[href],[tabindex],[role=tab],[data-i],[data-slot],[data-id],label';
  const sig=()=>PN.els.map(e=>e.outerHTML).join('')+'|'+PN.scs.map(e=>e.scrollTop|0).join(',');
  const PTR=[0,1,2,3].map(()=>{ const ray=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(6,3)),new THREE.LineBasicMaterial(flat({color:0xf2c14e,transparent:true,opacity:.7})));
    const dot=new THREE.Mesh(new THREE.CircleGeometry(.009,12),new THREE.MeshBasicMaterial(flat({color:0xf2c14e,depthTest:false}))); ray.frustumCulled=false; ray.visible=dot.visible=false; dot.renderOrder=5; TRK.add(ray,dot); return {ray,dot,src:null,hit:false,x:0,y:0,press:null}; });
  const JM=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial(flat({color:0xd9b38c})),50); JM.count=0; JM.frustumCulled=false; TRK.add(JM);
  const [wcv,wtex]=label(140,60); write(wcv,wtex,['MENU'],30,30);
  const wrist=new THREE.Mesh(new THREE.PlaneGeometry(.07,.03),new THREE.MeshBasicMaterial(flat({map:wtex,transparent:true,side:THREE.DoubleSide}))); wrist.visible=false; TRK.add(wrist);
  const QX=new THREE.Quaternion().setFromAxisAngle(new V3(1,0,0),-Math.PI/2), M4=new THREE.Matrix4(), Q4=new THREE.Quaternion(), P4=new V3(), S4=new V3(), RO=new V3(), RD=new V3(), PNRM=new V3(), HIT=new V3(), TIPR=new V3();
  const PROPS='display position top left right bottom width height min-width min-height max-width max-height box-sizing margin-top margin-right margin-bottom margin-left padding-top padding-right padding-bottom padding-left border-top-width border-right-width border-bottom-width border-left-width border-top-style border-right-style border-bottom-style border-left-style border-top-color border-right-color border-bottom-color border-left-color border-radius outline-width outline-style outline-color outline-offset background-color background-image background-size background-position background-repeat color font-family font-size font-weight font-style font-variant-numeric line-height letter-spacing text-align text-transform text-decoration-line text-overflow white-space word-break overflow-wrap vertical-align overflow-x overflow-y opacity visibility z-index flex-direction flex-wrap flex-grow flex-shrink flex-basis justify-content align-items align-self gap row-gap column-gap grid-template-columns grid-template-rows grid-column grid-row transform transform-origin image-rendering box-shadow text-shadow list-style-type object-fit table-layout border-collapse border-spacing'.split(' ');
  let H2I=null, FC=null;

  const shoot=async()=>{ '@later'; if(PN.busy){ dirt(); return; } PN.busy=true; PN.dirty=false;
    try{ if(!H2I)H2I=await import('https://cdn.jsdelivr.net/npm/html-to-image@1.11.13/+esm'); const els=PAD.panels(), W=innerWidth, H=innerHeight;
      if(FC==null&&els[0])FC=await H2I.getFontEmbedCSS(els[0]).catch(()=>'');
      PN.els=els; PN.scs=els.flatMap(p=>[p,...p.querySelectorAll('*')]).filter(e=>e.scrollHeight>e.clientHeight+2&&/auto|scroll/.test(getComputedStyle(e).overflowY)); PN.shot=PN.seen=sig();
      const hits=els.flatMap(p=>[...p.querySelectorAll(CLK)]).filter(e=>e.getClientRects().length).map(e=>[e,e.getBoundingClientRect()]);
      const parts=[]; for(const el of els){ const r=el.getBoundingClientRect(); if(r.width<4||r.height<4)continue;
        parts.push([await H2I.toCanvas(el,{fontEmbedCSS:FC,includeStyleProperties:PROPS,pixelRatio:1,width:r.width,height:r.height,style:{position:'static',left:'auto',top:'auto',right:'auto',bottom:'auto',margin:'0',transform:'none'}}),r]); }
      if(pcv.width!==W||pcv.height!==H){ pcv.width=W; pcv.height=H; ptex.dispose(); }
      const g=pcv.getContext('2d'); g.clearRect(0,0,W,H); for(const [c,r] of parts)g.drawImage(c,r.left,r.top,r.width,r.height); ptex.needsUpdate=true;
      PN.W=W; PN.H=H; PN.ready=true; PN.n++; PN.hits=hits; PN.fresh=sig()===PN.shot; if(!PN.fresh)dirt(); panel.scale.set(PANW,PANW*H/W,1); }
    catch(e){ console.warn('VR: the window picture',e); } PN.t=performance.now(); PN.busy=false; };
  const watch=()=>{ if(PN.mo)PN.mo.disconnect(); PN.els=PAD.panels(); if(!VR.win)return; PN.mo=PN.mo||new MutationObserver(()=>{ const g=sig(); if(g!==PN.seen){ PN.seen=g; dirt(); PN.fresh=g===PN.shot; } });
    for(const el of PN.els)PN.mo.observe(el,{subtree:true,childList:true,attributes:true,characterData:true}); dirt(); };
  const openPanel=()=>{ FW.set(0,0,-1).applyQuaternion(HQ); FW.y=0; if(FW.lengthSq()<1e-4)FW.set(0,0,-1); FW.normalize();
    panel.position.copy(HL).addScaledVector(FW,1.1); panel.position.y-=.12; panel.rotation.set(0,Math.atan2(-FW.x,-FW.z),0); panel.updateMatrix(); panel.visible=true; watch(); };
  const closePanel=()=>{ panel.visible=false; hl.visible=false; if(PN.mo)PN.mo.disconnect(); PN.els=[]; for(const P of PTR)P.press=null; };

  const at=(x,y)=>document.elementsFromPoint(x,y).find(e=>PN.els.some(p=>p.contains(e)))||null;
  const inPic=(x,y)=>{ let b=null, ba=1e12; for(const [e,r] of PN.hits){ const A=r.width*r.height; if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom&&A<ba&&e.isConnected){ b=[e,r]; ba=A; } } return b; };
  const mark=()=>{ PN.fresh=false; dirt(); };
  const fire=el=>{ el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); };
  const rangeAt=(el,x)=>{ const r=el.getBoundingClientRect(), k=Math.max(0,Math.min(1,(x-r.left)/(r.width||1))), mn=el.min===''?0:+el.min, mx=el.max===''?100:+el.max; el.value=String(mn+k*(mx-mn)); fire(el); mark(); };
  const scroller=el=>{ for(let e=el;e&&e!==document.body&&e!==document.documentElement;e=e.parentElement){ const o=getComputedStyle(e).overflowY; if((o==='auto'||o==='scroll')&&e.scrollHeight>e.clientHeight+2)return e; } return null; };
  const clickAt=(x,y,want)=>{ let el=at(x,y); if(want&&!(el&&(el===want||want.contains(el)))){ const q=want.getBoundingClientRect(); x=q.left+q.width/2; y=q.top+q.height/2; el=want; } if(!el)return; const o={bubbles:true,cancelable:true,composed:true,clientX:x,clientY:y,view:window,button:0,buttons:1};
    el.dispatchEvent(new MouseEvent('mousedown',o));
    const f=el.closest('input,select,textarea,button,a[href],[tabindex]'); if(f&&f.focus)f.focus({preventScroll:true});
    el.dispatchEvent(new MouseEvent('mouseup',{...o,buttons:0}));
    if(f&&f.tagName==='SELECT'&&f.options.length){ f.selectedIndex=(f.selectedIndex+1)%f.options.length; fire(f); } else if(f&&f.type==='range')rangeAt(f,x); else el.dispatchEvent(new MouseEvent('click',{...o,buttons:0}));
    mark(); VR.clicks=(VR.clicks||0)+1; };
  const onSel=e=>{ const P=PTR.find(p=>p.src===e.inputSource); if(!P)return;
    if(e.type==='selectstart'){ if(!P.hit||!PN.ready)return; let x=P.x, y=P.y, el=PN.fresh?at(x,y):null;
      if(!el){ const w=inPic(x,y); if(!w)return; const r=w[1], q=w[0].getBoundingClientRect(); el=w[0]; x=q.left+(x-r.left)/(r.width||1)*q.width; y=q.top+(y-r.top)/(r.height||1)*q.height; }
      P.press={x0:x,y0:y,ly:P.y,moved:false,el,range:!!(el.matches&&el.matches('input[type=range]'))}; if(P.press.range)rangeAt(el,x); return; }
    const pr=P.press; P.press=null; if(pr&&!pr.moved&&!pr.range&&pr.el.isConnected)clickAt(pr.x0,pr.y0,pr.el); };

  const point=(xf,ref,dt)=>{ let k=0, top=null;
    for(const s of xf.session.inputSources){ if(k>=PTR.length)break; const p=s.targetRaySpace&&xf.getPose(s.targetRaySpace,ref); if(!p)continue; const P=PTR[k++], T=p.transform; P.src=s; P.hit=false;
      RO.set(T.position.x,T.position.y,T.position.z); RD.set(0,0,-1).applyQuaternion(Q4.set(T.orientation.x,T.orientation.y,T.orientation.z,T.orientation.w)); P.o=[RO.x,RO.y,RO.z]; P.d=[RD.x,RD.y,RD.z]; let len=1.2;
      if(panel.visible&&PN.ready){ PNRM.set(0,0,1).applyQuaternion(panel.quaternion); const den=RD.dot(PNRM);
        if(den<-1e-4){ const t=HIT.copy(panel.position).sub(RO).dot(PNRM)/den; if(t>0&&t<4){ HIT.copy(RO).addScaledVector(RD,t); P4.copy(HIT).sub(panel.position).applyQuaternion(Q4.copy(panel.quaternion).invert());
          const u=P4.x/panel.scale.x+.5, v=.5-P4.y/panel.scale.y; if(u>=0&&u<=1&&v>=0&&v<=1){ P.hit=true; P.x=u*PN.W; P.y=v*PN.H; len=t; P.dot.position.copy(HIT).addScaledVector(PNRM,.002); P.dot.quaternion.copy(panel.quaternion); if(!top)top=P; } } } }
      const a=P.ray.geometry.attributes.position; a.setXYZ(0,RO.x,RO.y,RO.z); a.setXYZ(1,RO.x+RD.x*len,RO.y+RD.y*len,RO.z+RD.z*len); a.needsUpdate=true; P.ray.visible=panel.visible; P.dot.visible=P.hit;
      const pr=P.press; if(pr&&P.hit){ if(pr.range)rangeAt(pr.el,P.x); else{ if(!pr.moved&&Math.abs(P.y-pr.y0)>14)pr.moved=true; if(pr.moved){ const sc=scroller(pr.el); if(sc){ sc.scrollTop-=P.y-pr.ly; mark(); } } } pr.ly=P.y; }
      if(P.hit&&s.handedness==='right'&&!s.hand&&Math.abs(VP.axes[3])>.25){ const sc=scroller(at(P.x,P.y)); if(sc){ sc.scrollTop+=VP.axes[3]*dt*900; mark(); } } }
    for(let i=k;i<PTR.length;i++){ const P=PTR[i]; P.src=null; P.hit=false; P.press=null; P.ray.visible=P.dot.visible=false; }
    hl.visible=false; if(top){ const el=PN.fresh&&at(top.x,top.y), c0=el&&el.closest(CLK), w=c0?null:inPic(top.x,top.y), c=c0||(w&&w[0]);
      if(c){ const r=c0?c0.getBoundingClientRect():w[1], a=hl.geometry.attributes.position, U=x=>x/PN.W-.5, V=y=>.5-y/PN.H; a.setXYZ(0,U(r.left),V(r.top),.001); a.setXYZ(1,U(r.right),V(r.top),.001); a.setXYZ(2,U(r.right),V(r.bottom),.001); a.setXYZ(3,U(r.left),V(r.bottom),.001); a.needsUpdate=true; hl.visible=true; } } };

  const hands=(xf,ref)=>{ let n=0, nh=0, tip=false; wrist.visible=false;
    for(const s of xf.session.inputSources){ if(!s.hand)continue; nh++;
      for(const [name,js] of s.hand.entries()){ const p=n<50&&xf.getJointPose(js,ref); if(!p)continue; const T=p.transform; P4.set(T.position.x,T.position.y,T.position.z); Q4.set(T.orientation.x,T.orientation.y,T.orientation.z,T.orientation.w);
        JM.setMatrixAt(n++,M4.compose(P4,Q4,S4.setScalar(p.radius||.008)));
        if(name==='wrist'&&s.handedness==='left'){ wrist.visible=true; wrist.position.copy(P4).add(EV.set(0,.04,.03).applyQuaternion(Q4)); wrist.quaternion.copy(Q4).multiply(QX); }
        if(name==='index-finger-tip'&&s.handedness==='right'){ TIPR.copy(P4); tip=true; } } }
    JM.count=n; JM.instanceMatrix.needsUpdate=true; VR.hands=nh;
    if(wrist.visible&&tip){ const d=TIPR.distanceTo(wrist.position); if(d<.03&&!VR.wt){ VR.wt=1; tap('Escape'); } else if(d>.06)VR.wt=0; } };

  const was={}, edge=(k,on)=>{ const r=on&&!was[k]; was[k]=on; return r; };
  const yawOf=q=>{ FW.set(0,0,-1).applyQuaternion(q); return Math.atan2(-FW.x,-FW.z); };
  const rot=(x,z,a,out)=>out.set(x*Math.cos(a)+z*Math.sin(a),0,-x*Math.sin(a)+z*Math.cos(a));
  const head=out=>rot(HL.x*FEEL.MH,HL.z*FEEL.MH,VR.yaw,out).add(O);
  const turn=d=>{ head(EV); VR.yaw+=d; rot(HL.x*FEEL.MH,HL.z*FEEL.MH,VR.yaw,O); O.set(EV.x-O.x,0,EV.z-O.z); };
  const calib=()=>{ VR.yaw=SHARED.heading+Math.PI-yawOf(HQ); rot(HL.x*FEEL.MH,HL.z*FEEL.MH,VR.yaw,O); O.set(pos.x-O.x,0,pos.z-O.z); VR.y0=HL.y;
    VR.eye=W3.eyeAt&&W3.eyeAt(EV)?Math.max(.5*TILE,EV.y-SHARED.py):1.62/.84*TILE*(W3.SZ||1); VR.px=pos.x; VR.pz=pos.z; VR.cal=true; };
  const free=()=>!RAG.on&&!VIT.dead&&!(VIT.out>0)&&!(window.BOAT&&BOAT.on)&&!st.sit&&!UI.fly&&!UI.freeCam&&!ED.on&&!(st.water&&st.water.in);

  SYS.add('xr',(dt,xf)=>{ const P=VR.pose; if(!P)return; const T=P.transform; HL.set(T.position.x,T.position.y,T.position.z); HQ.set(T.orientation.x,T.orientation.y,T.orientation.z,T.orientation.w);
    if(!VR.cal)calib(); if(UI.view!=='first')UI.setView('first'); VR.tip-=dt;
    const B=VP.buttons, rx=VP.axes[2], ref=renderer.xr.getReferenceSpace();
    if(Math.abs(rx)<.3)VR.sn=0; else if(!VR.sn&&Math.abs(rx)>.65){ VR.sn=1; turn(rx>0?-SNAP:SNAP); }
    if(edge('q',keys.has('q')))turn(SNAP); if(edge('e',keys.has('e')))turn(-SNAP);
    if(edge('rc',VR.r3))VR.cal=false; if(edge('lc',VR.l3))tap('Escape');
    if(B[1].value>.5){ const n=performance.now(); if(!VR.bt)VR.bt=n; else if(n-VR.bt>1500){ VR.bt=Infinity; return VR.leave(); } } else VR.bt=0;
    head(EV); let dx=EV.x-pos.x, dz=EV.z-pos.z, d=Math.hypot(dx,dz); const L=LEASH*FEEL.MH;
    if(d>L){ if(free()){ const k=1-L/d; pos.x+=dx*k; pos.z+=dz*k; collide(pos); if(FEEL.take())FEEL.sync(); dx=EV.x-pos.x; dz=EV.z-pos.z; d=Math.hypot(dx,dz); }
      if(d>L){ const m=(d-L)/d; O.x-=dx*m; O.z-=dz*m; } }
    VR.px=pos.x; VR.pz=pos.z;
    const a=VR.yaw+yawOf(HQ); SHARED.yaw=SHARED.yawTo=a; SHARED.pitch=SHARED.pitchTo=Math.max(-1.2,Math.min(1.3,-Math.asin(Math.max(-1,Math.min(1,FW.y)))));
    if(ref){ point(xf,ref,dt); hands(xf,ref); } },'162c-vr');

  VR.draw=hold=>{ if(!VR.pose)return; const r=renderer;
    O.x+=pos.x-VR.px; O.z+=pos.z-VR.pz; VR.px=pos.x; VR.pz=pos.z;
    DOLLY.position.set(O.x,SHARED.py+VR.eye-VR.y0*FEEL.MV,O.z); DOLLY.rotation.set(0,VR.yaw,0); DOLLY.scale.set(FEEL.MH,FEEL.MV,FEEL.MH); DOLLY.updateMatrixWorld(true); TRK.matrix.copy(DOLLY.matrixWorld); TRK.matrixWorldNeedsUpdate=true;
    const f=FADE.el?+FADE.el.style.opacity||0:0; veil.material.opacity=f; veil.visible=f>.01;
    if(--VR.ct<=0){ VR.ct=10; const els=PAD.panels(), w=!!UI.menuOpen||els.length>0; if(w!==VR.win){ VR.win=w; if(w)openPanel(); else closePanel(); } else if(w&&(els.length!==PN.els.length||els.some((e,i)=>e!==PN.els[i])))watch(); }
    { const n=performance.now(); if(panel.visible&&PN.dirty&&!PN.busy&&n-PN.t>300&&(n-PN.ch>150||n-PN.d0>1000))shoot(); }
    const m=VR.tip>0&&!VR.win?'tip':''; if(m!==VR.m){ VR.m=m; if(m)write(cv,tex,TIP,22,17); } card.visible=!!m;
    r.xr.enabled=true; r.setRenderTarget(VR.rt);
    if(hold||!VR.cal)r.clear(); else{ r.render(scene,CAM); HG.matrix.copy(CAM.matrixWorld); HG.matrixWorldNeedsUpdate=true; const ac=r.autoClear; r.autoClear=false; r.clearDepth(); r.render(HUD,CAM); r.autoClear=ac; }
    r.xr.enabled=false; };

  const loop=(t,xf)=>{ const ref=renderer.xr.getReferenceSpace(); VR.pose=ref?xf.getViewerPose(ref):null; VR.rt=renderer.getRenderTarget(); read(xf); flush(t);
    try{ PAD.step(t,VP); }catch(e){ if(!VR.err){ VR.err=1; console.warn('VR: the controllers',e); } }
    try{ frame(t,xf); }catch(e){ if(!VR.err){ VR.err=1; console.warn('VR: the frame',e); } } };

  window.VR=VR; VR.state=()=>({view:UI.view,body:W3.group.visible,pad:!!PAD.xr,menu:!!UI.menuOpen,fov:PCAM.fov,yaw:SHARED.yawTo,pitch:SHARED.pitchTo,win:VR.win,panel:panel.visible&&PN.ready,fresh:PN.ready&&PN.fresh&&!PN.dirty&&!PN.busy,shots:PN.n,clicks:VR.clicks||0,hands:VR.hands,wrist:wrist.visible,hits:PTR.filter(P=>P.hit).length});
  VR.aim=(x,y)=>{ const p=new V3((x/PN.W-.5)*panel.scale.x,(.5-y/PN.H)*panel.scale.y,0).applyQuaternion(panel.quaternion).add(panel.position); return {x:p.x,y:p.y,z:p.z}; };
  VR.dbg=()=>({rays:PTR.filter(P=>P.src).map(P=>({h:P.src.handedness,hand:!!P.src.hand,o:P.o,d:P.d,hit:P.hit,x:P.x,y:P.y})),wrist:wrist.visible?wrist.position.toArray():null,finger:TIPR.toArray()});

  const btn=document.createElement('button'); btn.type='button'; btn.id='vrbtn'; btn.hidden=true; btn.textContent='ENTER VR'; btn.title='Play in your headset (hold B to leave)';
  btn.style.cssText='position:fixed;left:calc(12px + env(safe-area-inset-left,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:5;font:12px var(--pixel);color:var(--key);background:var(--panel);border:2px solid var(--line);padding:8px 12px;cursor:pointer';
  btn.onclick=()=>{ btn.blur(); if(VR.on)VR.leave(); else VR.enter(); }; document.body.appendChild(btn);
  if(xr&&xr.isSessionSupported)xr.isSessionSupported('immersive-vr').then(ok=>{ btn.hidden=!ok; }).catch(()=>{});

  const stop=()=>{ '@later'; if(!VR.on)return; VR.on=false; VR.s=null; VR.pose=null; VR.win=false; closePanel(); renderer.xr.setAnimationLoop(null); renderer.setAnimationLoop(null); renderer.xr.enabled=false; shim(false);
    VP.connected=false; PAD.xr=null; PAD.step(performance.now(),null); dispatchEvent(new Event('gamepaddisconnected')); keys.clear();
    PCAM.fov=VR.fov; PCAM.updateProjectionMatrix(); if(VR.view&&VR.view!=='first')UI.setView(VR.view); btn.textContent='ENTER VR'; resize(); };
  const start=s=>{ '@later'; VR.s=s; VR.on=true; VR.cal=false; VR.err=0; VR.m=''; VR.tip=10; VR.win=false; VR.view=UI.view; VR.fov=PCAM.fov; PCAM.fov=110; PCAM.updateProjectionMatrix(); CAM.far=600/FEEL.MH;
    shim(true); renderer.xr.enabled=false; renderer.xr.setAnimationLoop(loop);
    VP.connected=true; PAD.xr=VP; dispatchEvent(new Event('gamepadconnected'));
    s.addEventListener('end',stop); s.addEventListener('selectstart',onSel); s.addEventListener('selectend',onSel);
    const ref=renderer.xr.getReferenceSpace(); if(ref&&ref.addEventListener)ref.addEventListener('reset',()=>{ VR.cal=false; });
    btn.textContent='LEAVE VR'; };
  VR.enter=async()=>{ '@later'; if(VR.on||VR.busy||!xr)return; VR.busy=true;
    try{ const s=await xr.requestSession('immersive-vr',{optionalFeatures:['hand-tracking']}); renderer.xr.setReferenceSpaceType('local'); await renderer.xr.setSession(s); start(s); }
    catch(e){ console.warn('VR: the headset did not start',e); } finally{ VR.busy=false; } };
  VR.leave=()=>{ '@later'; if(VR.s)VR.s.end().catch(()=>stop()); };
}
