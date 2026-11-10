// THE HEADSET: VR plays THE MARKET in a WebXR headset (a Quest 3 in its browser): you look out of the Walker's eyes or from behind him, walk by stick or teleport, see your body, hands and controllers, and an open window floats on a panel you point at with a controller or your hand; the menu's VR tab holds every setting.
import {SHARED, THREE} from './003-shx.js';
import {BOAT, ED, FEEL, keys, pos, RAG, st, UI, VIT, VR, W3} from './003b-systems.js';
import {PCAM, renderer, resize, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {FADE, SYS, TILE} from './006-map-pre.js';
import {collide, frame, PAD} from './075-main-13.js';
import {HANDS} from './111b-hands.js';
import {AVATAR} from './111c-avatar.js';
{
  const xr=navigator.xr, V3=THREE.Vector3, LEASH=.3;
  const DEF={move:'stick',turn:'snap30',view:'first',hand:'right',vig:true,height:0,body:true,hands:true,ctl:true,scale:.75,rate:72,shadow:'light',water:false,far:300,panw:1.5,pand:1.1,panel:'normal'};
  const opt=Object.assign({},DEF); try{ const o=JSON.parse(SAVE.get('vr')||'{}'); for(const k in o)if(k in DEF&&typeof o[k]===typeof DEF[k])opt[k]=o[k]; }catch(e){}
  const PT={fast:[300,150,1000],normal:[800,300,1500],slow:[2000,500,3000]};
  Object.assign(VR,{joints:{L:null,R:null},jp:{L:new Float32Array(75),R:new Float32Array(75)},grips:[],opt,s:null,busy:false,cal:false,pose:null,rt:null,yaw:0,eye:0,y0:0,px:0,pz:0,view:'',fov:60,tip:0,m:'',win:false,ct:0,bt:0,sn:0,err:0,hands:0,ctl:0,wt:0,l3:0,r3:0,fn:0,blink:0,tpa:false,tpWas:false,tp:null,want:null,notes:[],nh:false,sh0:null,pane:null,pass:{shadow:true,water:true}});
  const O=new V3(), HL=new V3(), HQ=new THREE.Quaternion(), FW=new V3(), EV=new V3();
  const DOLLY=new THREE.Group(), CAM=new THREE.PerspectiveCamera(70,1,.05,450); DOLLY.add(CAM); VR.cam=CAM; VR.dolly=DOLLY;
  const HUD=new THREE.Scene(), HG=new THREE.Group(), TRK=new THREE.Group(); HG.matrixAutoUpdate=TRK.matrixAutoUpdate=false; HUD.add(HG,TRK);
  const flat=o=>Object.assign({fog:false,toneMapped:false},o);
  const veil=new THREE.Mesh(new THREE.SphereGeometry(.3,16,8),new THREE.MeshBasicMaterial(flat({color:0,side:THREE.BackSide,transparent:true,depthTest:false,depthWrite:false}))); veil.renderOrder=10; HG.add(veil);
  const label=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return [c,t]; };
  const [cv,tex]=label(512,200);
  const card=new THREE.Mesh(new THREE.PlaneGeometry(.96,.375),new THREE.MeshBasicMaterial(flat({map:tex,transparent:true,depthTest:false,depthWrite:false}))); card.position.set(0,-.14,-1.1); card.renderOrder=11; card.visible=false; HG.add(card);
  const [vcv,vtex]=label(256,256); { const g=vcv.getContext('2d'), r=g.createRadialGradient(128,128,38,128,128,80); r.addColorStop(0,'rgba(0,0,0,0)'); r.addColorStop(1,'rgba(0,0,0,1)'); g.fillStyle=r; g.fillRect(0,0,256,256); vtex.needsUpdate=true; }
  const vig=new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.4),new THREE.MeshBasicMaterial(flat({map:vtex,transparent:true,opacity:0,depthTest:false,depthWrite:false}))); vig.position.set(0,0,-.3); vig.renderOrder=9; vig.visible=false; HG.add(vig);
  const TIP=['THE MARKET IN VR','LEFT STICK WALKS · RIGHT STICK TURNS · A JUMPS','X USES · Y KICKS · RIGHT TRIGGER RUNS · LEFT STICK PRESS: MENU','POINT + TRIGGER OR PINCH PRESSES · HOLD B: LEAVE VR'];
  const write=(c,t,L,big,small)=>{ const g=c.getContext('2d'), W=c.width, H=c.height; g.clearRect(0,0,W,H); g.fillStyle='rgba(16,18,26,.9)'; g.fillRect(0,0,W,H); g.strokeStyle='#2a2e3a'; g.lineWidth=4; g.strokeRect(2,2,W-4,H-4); g.textAlign='center'; g.textBaseline='middle';
    L.forEach((l,i)=>{ let px=i?small:big; do{ g.font=px+'px Silkscreen, monospace'; }while(g.measureText(l).width>W-28&&--px>9); g.fillStyle=i?'#ece5d3':'#f2c14e'; g.fillText(l,W/2,H/(L.length*2)*(i*2+1)); }); t.needsUpdate=true; };
  const note=()=>{ '@later'; const g=cv.getContext('2d'), W=cv.width, H=cv.height, L=VR.notes; g.clearRect(0,0,W,H); g.fillStyle='rgba(16,18,26,.9)'; g.fillRect(0,0,W,H); g.strokeStyle='#2a2e3a'; g.lineWidth=4; g.strokeRect(2,2,W-4,H-4); g.textAlign='center'; g.textBaseline='middle';
    L.forEach((o,i)=>{ const big=o.big&&L.length===1; let px=big?64:24; do{ g.font=px+'px Silkscreen, monospace'; }while(g.measureText(o.t).width>W-28&&--px>9); g.fillStyle=o.c||'#ece5d3'; g.fillText(o.t,W/2,H/(L.length*2)*(i*2+1)); }); tex.needsUpdate=true; };
  const tap=k=>{ for(const t of ['keydown','keyup'])dispatchEvent(new KeyboardEvent(t,{key:k,bubbles:true,cancelable:true})); };

  const B0=()=>({value:0,pressed:false,touched:false});
  const VP={id:'Meta Quest Touch (WebXR)',index:-1,connected:false,mapping:'standard',timestamp:0,axes:[0,0,0,0],buttons:Array.from({length:16},B0),hapticActuators:[]};
  const MAPB=[['R',4],['R',5],['L',4],['L',5],['L',1],['R',1],['L',0],['R',0]];
  const walkHand=()=>opt.hand==='left'?'right':'left';
  const read=xf=>{ '@later'; const H={L:null,R:null}; for(const s of xf.session.inputSources)if(s.gamepad&&!s.hand&&(s.handedness==='left'||s.handedness==='right'))H[s.handedness==='left'?'L':'R']=s.gamepad;
    MAPB.forEach((m,i)=>{ const b=H[m[0]]&&H[m[0]].buttons[m[1]], v=b?b.value:0; VP.buttons[i].value=v; VP.buttons[i].pressed=v>.5; });
    const ax=(g,k)=>!g?0:(g.axes.length>=4?g.axes[2+k]:g.axes[k])||0, [GW,GT]=opt.hand==='left'?[H.R,H.L]:[H.L,H.R]; VP.axes[0]=ax(GW,0); VP.axes[1]=ax(GW,1); VP.axes[2]=ax(GT,0); VP.axes[3]=ax(GT,1); VP.timestamp=performance.now();
    if(opt.move==='teleport'&&!UI.gamewin&&!SHARED.drive&&!VR.win&&vw()==='first'){ VR.tpa=VP.axes[1]<-.5; VP.axes[0]=VP.axes[1]=0; } else VR.tpa=false;   // in a vehicle, a window or a place that sets the view (the catacomb run), the walking stick stays a stick
    const st3=g=>!!(g&&g.buttons[3]&&g.buttons[3].value>.5); VR.l3=st3(H.L); VR.r3=st3(H.R); };

  const RAF=window.requestAnimationFrame, CAF=window.cancelAnimationFrame, Q=new Map(); let qid=1e9, nat=0, beat=false;
  const pulse=()=>{ nat=performance.now(); if(beat)RAF.call(window,pulse); };
  const shim=on=>{ '@later'; beat=on; if(!on){ window.requestAnimationFrame=RAF; window.cancelAnimationFrame=CAF; for(const [id,q] of Q)RAF.call(window,t=>{ if(Q.delete(id))q.f(t); }); return; } nat=performance.now(); RAF.call(window,pulse);
    window.requestAnimationFrame=f=>{ const id=++qid; Q.set(id,{f,n:RAF.call(window,t=>{ if(Q.delete(id))f(t); })}); return id; };
    window.cancelAnimationFrame=id=>{ const q=Q.get(id); if(q){ Q.delete(id); CAF.call(window,q.n); } else CAF.call(window,id); }; };
  const flush=t=>{ if(!Q.size||performance.now()-nat<250)return; nat=performance.now(); const L=[...Q.values()]; Q.clear(); for(const q of L){ CAF.call(window,q.n); try{ q.f(t); }catch(e){ console.warn('VR: a frame callback',e); } } };   // (nat first: a callback that is itself a headset frame must not flush again inside it)

  const [pcv,ptex]=label(2,2);
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial(flat({map:ptex,transparent:true,side:THREE.DoubleSide}))); panel.visible=false; TRK.add(panel);
  // a canvas in an open window (a cabinet's game, the BBS screen) is a picture that never mutates the DOM: a small plane over its spot on the panel shows it live, a frame at a time
  const LIVE=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial(flat({side:THREE.DoubleSide}))); LIVE.visible=false; LIVE.position.z=.002; LIVE.renderOrder=1; panel.add(LIVE); let liveCv=null;
  const live=()=>{ '@later'; if(!panel.visible||!PN.ready){ LIVE.visible=false; return; } let c=null, r=null; for(const el of PN.els||[]){ const q=el.querySelector('canvas'); if(q){ const b=q.getBoundingClientRect(); if(b.width>=4&&b.height>=4){ c=q; r=b; break; } } }
    if(!c){ LIVE.visible=false; return; } if(c!==liveCv){ liveCv=c; if(LIVE.material.map)LIVE.material.map.dispose(); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.magFilter=THREE.NearestFilter; LIVE.material.map=t; LIVE.material.needsUpdate=true; }
    LIVE.position.set((r.left+r.width/2)/PN.W-.5,.5-(r.top+r.height/2)/PN.H,.002); LIVE.scale.set(r.width/PN.W,r.height/PN.H,1); LIVE.material.map.needsUpdate=true; LIVE.visible=true; };
  const hl=new THREE.LineLoop(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(12,3)),new THREE.LineBasicMaterial(flat({color:0xf2c14e}))); hl.visible=false; hl.frustumCulled=false; panel.add(hl);
  const PN={ready:false,W:1,H:1,busy:false,dirty:false,t:0,n:0,mo:null,els:[],seen:'',shot:'',fresh:false,hits:[],scs:[],ch:0,d0:0};
  const dirt=()=>{ const n=performance.now(); if(!PN.dirty)PN.d0=n; PN.dirty=true; PN.ch=n; };
  const CLK='button,input,select,textarea,a[href],[tabindex],[role=tab],[data-i],[data-slot],[data-id],label';
  const sig=()=>PN.els.map(e=>e.outerHTML).join('')+'|'+PN.scs.map(e=>e.scrollTop|0).join(',');
  const PTR=[0,1,2,3].map(()=>{ const ray=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(6,3)),new THREE.LineBasicMaterial(flat({color:0xf2c14e,transparent:true,opacity:.7})));
    const dot=new THREE.Mesh(new THREE.CircleGeometry(.009,12),new THREE.MeshBasicMaterial(flat({color:0xf2c14e,depthTest:false}))); ray.frustumCulled=false; ray.visible=dot.visible=false; dot.renderOrder=5; TRK.add(ray,dot); return {ray,dot,src:null,hit:false,x:0,y:0,press:null}; });
  const JM=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial(flat({color:0xd9b38c})),50); JM.count=0; JM.frustumCulled=false; TRK.add(JM);
  const CTL=[0,1].map(()=>{ const g=new THREE.Group(); const grip=new THREE.Mesh(new THREE.CylinderGeometry(.014,.018,.1,8),new THREE.MeshBasicMaterial(flat({color:0x2a2e3a}))); grip.position.set(0,-.03,.01); grip.rotation.x=.35;
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.034,.005,6,16),new THREE.MeshBasicMaterial(flat({color:0x8a8a92}))); ring.position.set(0,.035,-.03); ring.rotation.x=Math.PI/2-.4; g.add(grip,ring); g.visible=false; TRK.add(g); return g; });
  const [wcv,wtex]=label(140,60); write(wcv,wtex,['MENU'],30,30);
  const wrist=new THREE.Mesh(new THREE.PlaneGeometry(.07,.03),new THREE.MeshBasicMaterial(flat({map:wtex,transparent:true,side:THREE.DoubleSide}))); wrist.visible=false; TRK.add(wrist);
  const ARC=new THREE.Line(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(64*3,3)),new THREE.LineBasicMaterial(flat({color:0xf2c14e,transparent:true,opacity:.9,depthTest:false}))); ARC.frustumCulled=false; ARC.visible=false; ARC.renderOrder=8;
  const RING=new THREE.Mesh(new THREE.RingGeometry(.18,.3,24),new THREE.MeshBasicMaterial(flat({color:0xf2c14e,transparent:true,opacity:.8,side:THREE.DoubleSide,depthTest:false}))); RING.rotation.x=-Math.PI/2; RING.visible=false; RING.renderOrder=8; scene.add(ARC,RING);
  const QX=new THREE.Quaternion().setFromAxisAngle(new V3(1,0,0),-Math.PI/2), M4=new THREE.Matrix4(), Q4=new THREE.Quaternion(), P4=new V3(), S4=new V3(), RO=new V3(), RD=new V3(), PNRM=new V3(), HIT=new V3(), TIPR=new V3(), TPP=new V3(), TPQ=new V3();
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
      PN.W=W; PN.H=H; PN.ready=true; PN.n++; PN.hits=hits; PN.fresh=sig()===PN.shot; if(!PN.fresh)dirt(); panel.scale.set(opt.panw,opt.panw*H/W,1); }
    catch(e){ console.warn('VR: the window picture',e); } PN.t=performance.now(); PN.busy=false; };
  const watch=()=>{ '@later'; if(PN.mo)PN.mo.disconnect(); PN.els=PAD.panels(); if(!VR.win)return; PN.mo=PN.mo||new MutationObserver(()=>{ const g=sig(); if(g!==PN.seen){ PN.seen=g; dirt(); PN.fresh=g===PN.shot; } });
    for(const el of PN.els)PN.mo.observe(el,{subtree:true,childList:true,attributes:true,characterData:true}); dirt(); };
  const openPanel=()=>{ '@later'; FW.set(0,0,-1).applyQuaternion(HQ); FW.y=0; if(FW.lengthSq()<1e-4)FW.set(0,0,-1); FW.normalize();
    panel.position.copy(HL).addScaledVector(FW,opt.pand); panel.position.y-=.12; panel.rotation.set(0,Math.atan2(-FW.x,-FW.z),0); panel.scale.set(opt.panw,opt.panw*PN.H/PN.W,1); panel.updateMatrix(); panel.visible=true; watch(); };
  const closePanel=()=>{ panel.visible=false; hl.visible=false; if(PN.mo)PN.mo.disconnect(); PN.els=[]; for(const P of PTR)P.press=null; };

  const at=(x,y)=>document.elementsFromPoint(x,y).find(e=>PN.els.some(p=>p.contains(e)))||null;
  const inPic=(x,y)=>{ let b=null, ba=1e12; for(const [e,r] of PN.hits){ const A=r.width*r.height; if(x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom&&A<ba&&e.isConnected){ b=[e,r]; ba=A; } } return b; };
  const mark=()=>{ PN.fresh=false; dirt(); };
  const fire=el=>{ el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); };
  const rangeAt=(el,x)=>{ const r=el.getBoundingClientRect(), k=Math.max(0,Math.min(1,(x-r.left)/(r.width||1))), mn=el.min===''?0:+el.min, mx=el.max===''?100:+el.max; el.value=String(mn+k*(mx-mn)); fire(el); mark(); };
  const scroller=el=>{ for(let e=el;e&&e!==document.body&&e!==document.documentElement;e=e.parentElement){ const o=getComputedStyle(e).overflowY; if((o==='auto'||o==='scroll')&&e.scrollHeight>e.clientHeight+2)return e; } return null; };
  const clickAt=(x,y,want)=>{ '@later'; let el=at(x,y); if(want&&!(el&&(el===want||want.contains(el)))){ const q=want.getBoundingClientRect(); x=q.left+q.width/2; y=q.top+q.height/2; el=want; } if(!el)return; const o={bubbles:true,cancelable:true,composed:true,clientX:x,clientY:y,view:window,button:0,buttons:1};
    el.dispatchEvent(new MouseEvent('mousedown',o));
    const f=el.closest('input,select,textarea,button,a[href],[tabindex]'); if(f&&f.focus)f.focus({preventScroll:true});
    el.dispatchEvent(new MouseEvent('mouseup',{...o,buttons:0}));
    if(f&&f.tagName==='SELECT'&&f.options.length){ f.selectedIndex=(f.selectedIndex+1)%f.options.length; fire(f); } else if(f&&f.type==='range')rangeAt(f,x); else el.dispatchEvent(new MouseEvent('click',{...o,buttons:0}));
    mark(); VR.clicks=(VR.clicks||0)+1; };
  const onSel=e=>{ '@later'; const P=PTR.find(p=>p.src===e.inputSource); if(!P)return;
    if(e.type==='selectstart'){ if(!P.hit||!PN.ready)return; let x=P.x, y=P.y, el=PN.fresh?at(x,y):null;
      if(!el){ const w=inPic(x,y); if(!w)return; const r=w[1], q=w[0].getBoundingClientRect(); el=w[0]; x=q.left+(x-r.left)/(r.width||1)*q.width; y=q.top+(y-r.top)/(r.height||1)*q.height; }
      P.press={x0:x,y0:y,ly:P.y,moved:false,el,range:!!(el.matches&&el.matches('input[type=range]'))}; if(P.press.range)rangeAt(el,x); return; }
    const pr=P.press; P.press=null; if(pr&&!pr.moved&&!pr.range&&pr.el.isConnected)clickAt(pr.x0,pr.y0,pr.el); };

  const point=(xf,ref,dt)=>{ '@later'; let k=0, top=null, nc=0; VR.grips.length=0;
    for(const s of xf.session.inputSources){ if(k>=PTR.length)break; const p=s.targetRaySpace&&xf.getPose(s.targetRaySpace,ref); if(!p)continue; const P=PTR[k++], T=p.transform; P.src=s; P.hit=false;
      RO.set(T.position.x,T.position.y,T.position.z); RD.set(0,0,-1).applyQuaternion(Q4.set(T.orientation.x,T.orientation.y,T.orientation.z,T.orientation.w)); P.o=[RO.x,RO.y,RO.z]; P.d=[RD.x,RD.y,RD.z]; let len=1.2;
      if(!s.hand&&nc<2&&s.gripSpace){ const g=xf.getPose(s.gripSpace,ref), C=CTL[nc++], U=C.userData; if(g){ const G=g.transform; C.position.set(G.position.x,G.position.y,G.position.z); C.quaternion.set(G.orientation.x,G.orientation.y,G.orientation.z,G.orientation.w); C.visible=!!opt.ctl;
        U.h=s.handedness; U.wp=U.wp||new V3(); U.wq=U.wq||new THREE.Quaternion(); U.v=U.v||new V3(); P4.copy(C.position).applyMatrix4(TRK.matrix); if(U.on&&dt>0)U.v.copy(P4).sub(U.wp).divideScalar(dt); else U.v.set(0,0,0); U.wp.copy(P4); U.wq.copy(DOLLY.quaternion).multiply(C.quaternion); U.on=1;
          const gp=s.gamepad; VR.grips.push({h:s.handedness,p:U.wp.clone(),q:U.wq.clone(),grip:gp&&gp.buttons[1]?gp.buttons[1].value:0,trig:gp&&gp.buttons[0]?gp.buttons[0].value:0}); } else { C.visible=false; U.on=0; } }   // the hand's world pose and speed, read by WIELD for a held tool (the putter)
      if(panel.visible&&PN.ready){ PNRM.set(0,0,1).applyQuaternion(panel.quaternion); const den=RD.dot(PNRM);
        if(den<-1e-4){ const t=HIT.copy(panel.position).sub(RO).dot(PNRM)/den; if(t>0&&t<4){ HIT.copy(RO).addScaledVector(RD,t); P4.copy(HIT).sub(panel.position).applyQuaternion(Q4.copy(panel.quaternion).invert());
          const u=P4.x/panel.scale.x+.5, v=.5-P4.y/panel.scale.y; if(u>=0&&u<=1&&v>=0&&v<=1){ P.hit=true; P.x=u*PN.W; P.y=v*PN.H; len=t; P.dot.position.copy(HIT).addScaledVector(PNRM,.002); P.dot.quaternion.copy(panel.quaternion); if(!top)top=P; } } } }
      const a=P.ray.geometry.attributes.position; a.setXYZ(0,RO.x,RO.y,RO.z); a.setXYZ(1,RO.x+RD.x*len,RO.y+RD.y*len,RO.z+RD.z*len); a.needsUpdate=true; P.ray.visible=panel.visible; P.dot.visible=P.hit;
      const pr=P.press; if(pr&&P.hit){ if(pr.range)rangeAt(pr.el,P.x); else{ if(!pr.moved&&Math.abs(P.y-pr.y0)>14)pr.moved=true; if(pr.moved){ const sc=scroller(pr.el); if(sc){ sc.scrollTop-=P.y-pr.ly; mark(); } } } pr.ly=P.y; }
      if(P.hit&&s.handedness!==walkHand()&&!s.hand&&Math.abs(VP.axes[3])>.25){ const sc=scroller(at(P.x,P.y)); if(sc){ sc.scrollTop+=VP.axes[3]*dt*900; mark(); } } }
    for(let i=k;i<PTR.length;i++){ const P=PTR[i]; P.src=null; P.hit=false; P.press=null; P.ray.visible=P.dot.visible=false; }
    for(let i=nc;i<2;i++){ CTL[i].visible=false; CTL[i].userData.on=0; } VR.ctl=opt.ctl?nc:0;
    hl.visible=false; if(top){ const el=PN.fresh&&at(top.x,top.y), c0=el&&el.closest(CLK), w=c0?null:inPic(top.x,top.y), c=c0||(w&&w[0]);
      if(c){ const r=c0?c0.getBoundingClientRect():w[1], a=hl.geometry.attributes.position, U=x=>x/PN.W-.5, V=y=>.5-y/PN.H; a.setXYZ(0,U(r.left),V(r.top),.001); a.setXYZ(1,U(r.right),V(r.top),.001); a.setXYZ(2,U(r.right),V(r.bottom),.001); a.setXYZ(3,U(r.left),V(r.bottom),.001); a.needsUpdate=true; hl.visible=true; } } };

  // the tracked hands drawn as Polyfork's jointed hands in your skin (owner, 7 Nov 2026: the guitar's hands for VR too), the joint dots kept for VR.opt.dots
  const realHands=()=>{ if(VR.rh||!HANDS.vr)return VR.rh; VR.rh=HANDS.vr(AVATAR.L?AVATAR.L().skin:undefined); JM.parent.add(VR.rh.mesh); return VR.rh; };
  const hands=(xf,ref)=>{ '@later'; let n=0, nh=0, tip=false; wrist.visible=false; VR.joints.L=VR.joints.R=null; const RH=realHands(), got={L:0,R:0};
    for(const s of xf.session.inputSources){ if(!s.hand)continue; nh++; const J={wrist:null,index:null,thumb:null,q:null,pinch:false}; VR.joints[s.handedness==='left'?'L':'R']=J;
      const jp=VR.jp[s.handedness==='left'?'L':'R']; J.jp=jp;
      for(const [name,js] of s.hand.entries()){ const p=n<50&&xf.getJointPose(js,ref); if(!p)continue; const T=p.transform; P4.set(T.position.x,T.position.y,T.position.z); Q4.set(T.orientation.x,T.orientation.y,T.orientation.z,T.orientation.w);
        { const j=HANDS.NAME[name]; if(j!=null){ jp[j*3]=P4.x; jp[j*3+1]=P4.y; jp[j*3+2]=P4.z; } }   // (every joint where it is, for your body's fingers: 162cb)
        if(name==='wrist'){ J.wrist=P4.clone().applyMatrix4(DOLLY.matrixWorld); J.q=DOLLY.getWorldQuaternion(new THREE.Quaternion()).multiply(Q4); } else if(name==='index-finger-tip')J.index=P4.clone().applyMatrix4(DOLLY.matrixWorld); else if(name==='thumb-tip')J.thumb=P4.clone().applyMatrix4(DOLLY.matrixWorld);
        if(RH){ const sd=s.handedness==='left'?'L':'R'; RH.set(sd,name,M4.compose(P4,Q4,S4.setScalar(1))); got[sd]=1; }
        JM.setMatrixAt(n++,M4.compose(P4,Q4,S4.setScalar(p.radius||.008)));
        if(name==='wrist'&&s.handedness==='left'){ wrist.visible=true; wrist.position.copy(P4).add(EV.set(0,.04,.03).applyQuaternion(Q4)); wrist.quaternion.copy(Q4).multiply(QX); }
        if(name==='index-finger-tip'&&s.handedness==='right'){ TIPR.copy(P4); tip=true; } } }
    for(const k of 'LR'){ const J=VR.joints[k]; if(J&&J.index&&J.thumb)J.pinch=J.index.distanceTo(J.thumb)<.03*FEEL.MH; }
    if(RH){ for(const k of 'LR')if(!got[k])RH.hide(k); RH.mesh.visible=opt.hands&&nh>0; }
    JM.count=n; JM.instanceMatrix.needsUpdate=true; JM.visible=opt.hands&&(!RH||!!opt.dots); VR.hands=nh;
    if(wrist.visible&&tip){ const d=TIPR.distanceTo(wrist.position); if(d<.03&&!VR.wt){ VR.wt=1; tap('Escape'); } else if(d>.06)VR.wt=0; } };

  const teleport=()=>{ '@later'; if(VR.tpWas&&!VR.tpa&&VR.tp&&VR.tp.ok&&free()){ const dx=VR.tp.x-pos.x, dz=VR.tp.z-pos.z; pos.x+=dx; pos.z+=dz; O.x+=dx; O.z+=dz; collide(pos); VR.px=pos.x; VR.pz=pos.z; if(FEEL.take())FEEL.sync(); VR.blink=1; }
    VR.tpWas=VR.tpa; const want=VR.tpa&&vw()==='first'&&free(), P=want&&PTR.find(p=>p.src&&p.src.handedness===walkHand()&&!p.src.hand&&p.o); let hit=null;
    if(P){ RO.set(P.o[0],P.o[1],P.o[2]); RD.set(P.d[0],P.d[1],P.d[2]); const a=ARC.geometry.attributes.position, gy=(x,z)=>SHARED.groundY?SHARED.groundY(x,z):SHARED.py; let n=0;
      for(let t=0;t<2.5&&n<64;t+=.05){ TPP.set(RO.x+RD.x*5*t,RO.y+RD.y*5*t-4.9*t*t,RO.z+RD.z*5*t); DOLLY.localToWorld(TPP); a.setXYZ(n++,TPP.x,TPP.y,TPP.z); const g=gy(TPP.x,TPP.z); if(TPP.y<=g+.01){ hit={x:TPP.x,y:g,z:TPP.z,ok:true}; break; } }
      for(let i=n;i<64;i++)a.setXYZ(i,TPP.x,TPP.y,TPP.z); a.needsUpdate=true;
      if(hit){ if(Math.abs(hit.y-SHARED.py)>.5*FEEL.MV||Math.hypot(hit.x-pos.x,hit.z-pos.z)>10*FEEL.MH)hit.ok=false;
        else{ const dx=hit.x-pos.x, dz=hit.z-pos.z, D=Math.hypot(dx,dz), S=.3*FEEL.MH, N=Math.ceil(D/S); let lx=pos.x, lz=pos.z;
          for(let i=1;i<=N;i++){ const k=Math.min(1,i*S/D); TPQ.copy(pos); TPQ.x=pos.x+dx*k; TPQ.z=pos.z+dz*k; const ex=TPQ.x, ez=TPQ.z; collide(TPQ); if(Math.hypot(TPQ.x-ex,TPQ.z-ez)>.02){ hit.ok=false; break; } lx=TPQ.x; lz=TPQ.z; }
          hit.x=lx; hit.z=lz; if(Math.hypot(lx-pos.x,lz-pos.z)<.3*FEEL.MH)hit.ok=false; } } }
    ARC.visible=!!P; RING.visible=!!hit; if(hit){ RING.position.set(hit.x,hit.y+.02,hit.z); RING.scale.setScalar(FEEL.MH); RING.material.color.setHex(hit.ok?0xf2c14e:0xe5403a); ARC.material.color.setHex(hit.ok?0xf2c14e:0xe5403a); }
    VR.tp=hit; };

  const was={}, edge=(k,on)=>{ const r=on&&!was[k]; was[k]=on; return r; };
  const snap=()=>opt.turn==='snap45'?Math.PI/4:opt.turn==='snap90'?Math.PI/2:Math.PI/6;
  const yawOf=q=>{ FW.set(0,0,-1).applyQuaternion(q); return Math.atan2(-FW.x,-FW.z); };
  const rot=(x,z,a,out)=>out.set(x*Math.cos(a)+z*Math.sin(a),0,-x*Math.sin(a)+z*Math.cos(a));
  const head=out=>rot(HL.x*FEEL.MH,HL.z*FEEL.MH,VR.yaw,out).add(O);
  const turn=d=>{ head(EV); VR.yaw+=d; rot(HL.x*FEEL.MH,HL.z*FEEL.MH,VR.yaw,O); O.set(EV.x-O.x,0,EV.z-O.z); };
  const calib=()=>{ VR.yaw=SHARED.heading+Math.PI-yawOf(HQ); rot(HL.x*FEEL.MH,HL.z*FEEL.MH,VR.yaw,O); O.set(pos.x-O.x,0,pos.z-O.z); VR.y0=HL.y;
    VR.eye=W3.eyeAt&&W3.eyeAt(EV)?Math.max(.5*TILE,EV.y-SHARED.py):1.62/.84*TILE*(W3.SZ||1); VR.px=pos.x; VR.pz=pos.z; VR.cal=true; };
  const vw=()=>VR.want&&VR.want.view||opt.view, turns=()=>!SHARED.drive&&!(VR.want&&VR.want.turn===false);
  const free=()=>!SHARED.drive&&!RAG.on&&!VIT.dead&&!(VIT.out>0)&&!(BOAT&&BOAT.on)&&!st.sit&&!UI.fly&&!UI.freeCam&&!ED.on&&!(st.water&&st.water.in);

  SYS.add('xr',(dt,xf)=>{ '@later'; const P=VR.pose; if(!P)return; const T=P.transform; HL.set(T.position.x,T.position.y,T.position.z); HQ.set(T.orientation.x,T.orientation.y,T.orientation.z,T.orientation.w);
    O.x+=pos.x-VR.px; O.z+=pos.z-VR.pz; VR.px=pos.x; VR.pz=pos.z;   // a move since the last frame (a door, a fade, a teleport) carries the room with you
    if(!VR.cal)calib(); if(UI.view!=='first')UI.setView('first'); VR.tip-=dt; VR.fn++; VR.blink=Math.max(0,VR.blink-dt*5);
    VR.pass.shadow=opt.shadow==='full'||(opt.shadow==='light'&&(VR.fn&3)===0); VR.pass.water=opt.water;
    const B=VP.buttons, rx=VP.axes[2], ref=renderer.xr.getReferenceSpace();
    if(UI.gamewin||!turns()){ VR.sn=0; } else if(opt.turn==='smooth'){ if(Math.abs(rx)>.3)turn(-rx*dt*2.2); } else if(Math.abs(rx)<.3)VR.sn=0; else if(!VR.sn&&Math.abs(rx)>.65){ VR.sn=1; turn(rx>0?-snap():snap()); }
    if(edge('q',keys.has('q'))&&turns())turn(snap()); if(edge('e',!!UI.rotHeld)&&turns())turn(-snap());
    if(edge('rc',VR.r3)){ VR.cal=false; if(SHARED.drive&&SHARED.drive.recentre)SHARED.drive.recentre(); } if(edge('lc',VR.l3))tap('Escape');
    if(B[1].value>.5){ const n=performance.now(); if(!VR.bt)VR.bt=n; else if(n-VR.bt>1500){ VR.bt=Infinity; return VR.leave(); } } else VR.bt=0;
    if(vw()==='first'){ head(EV); let dx=EV.x-pos.x, dz=EV.z-pos.z, d=Math.hypot(dx,dz); const L=LEASH*FEEL.MH;
      if(d>L){ if(free()){ const k=1-L/d; pos.x+=dx*k; pos.z+=dz*k; collide(pos); if(FEEL.take())FEEL.sync(); dx=EV.x-pos.x; dz=EV.z-pos.z; d=Math.hypot(dx,dz); }
        if(d>L){ const m=(d-L)/d; O.x-=dx*m; O.z-=dz*m; } } }
    VR.px=pos.x; VR.pz=pos.z;
    const a=VR.yaw+yawOf(HQ); SHARED.yaw=SHARED.yawTo=a; SHARED.pitch=SHARED.pitchTo=Math.max(-1.2,Math.min(1.3,-Math.asin(Math.max(-1,Math.min(1,FW.y)))));
    const mv=opt.vig&&!SHARED.drive&&(opt.move==='stick'&&Math.hypot(VP.axes[0],VP.axes[1])>.2||opt.turn==='smooth'&&Math.abs(rx)>.3)?1:0; vig.material.opacity+=(mv-vig.material.opacity)*Math.min(1,dt*8); vig.visible=vig.material.opacity>.02;
    if(ref){ point(xf,ref,dt); hands(xf,ref); if(!UI.gamewin)teleport(); else { VR.tp=null; VR.tpWas=false; ARC.visible=RING.visible=false; } } live(); },'162c-vr');

  VR.draw=hold=>{ '@later'; if(!VR.pose)return; const r=renderer;
    O.x+=pos.x-VR.px; O.z+=pos.z-VR.pz; VR.px=pos.x; VR.pz=pos.z;
    const ey=SHARED.py+VR.eye+opt.height/100*FEEL.MV-VR.y0*FEEL.MV;
    if(SHARED.drive&&SHARED.drive.dolly)SHARED.drive.dolly(DOLLY,HL,HQ); else { if(vw()==='behind'){ const Y=VR.want&&VR.want.face!=null?VR.want.face+Math.PI:VR.yaw; DOLLY.position.set(pos.x+Math.sin(Y)*2.6*FEEL.MH,ey+1.1*FEEL.MV,pos.z+Math.cos(Y)*2.6*FEEL.MH); } else DOLLY.position.set(O.x,ey,O.z);
    DOLLY.rotation.set(0,VR.yaw,0); DOLLY.scale.set(FEEL.MH,FEEL.MV,FEEL.MH); } DOLLY.updateMatrixWorld(true); TRK.matrix.copy(DOLLY.matrixWorld); TRK.matrixWorldNeedsUpdate=true;
    const nh=vw()==='first'&&opt.body; if(nh!==VR.nh){ VR.nh=nh; if(W3.setHead)W3.setHead(!nh); } W3.group.visible=!SHARED.drive&&(vw()==='behind'||opt.body);
    const f=Math.max(FADE.el?+FADE.el.style.opacity||0:0,VR.blink); veil.material.opacity=f; veil.visible=f>.01;
    if(--VR.ct<=0){ VR.ct=10; const els=PAD.panels(), w=!!UI.menuOpen||els.length>0; if(w!==VR.win){ VR.win=w; if(w)openPanel(); else closePanel(); } else if(w&&(els.length!==PN.els.length||els.some((e,i)=>e!==PN.els[i])))watch(); }
    { const n=performance.now(), T=PT[opt.panel]||PT.normal; if(panel.visible&&PN.dirty&&!PN.busy&&n-PN.t>T[0]&&(n-PN.ch>T[1]||n-PN.d0>T[2]))shoot(); }
    { const n=performance.now(); VR.notes=VR.notes.filter(o=>o.until>n); }
    const m=VR.win?'':VR.notes.length?'n'+VR.notes.map(o=>o.t).join('|'):VR.tip>0?'tip':''; if(m!==VR.m){ VR.m=m; if(m==='tip')write(cv,tex,TIP,22,17); else if(m)note(); } card.visible=!!m;
    r.xr.enabled=true; r.setRenderTarget(VR.rt);
    if(hold||!VR.cal)r.clear(); else{ r.render(SHARED.drive&&SHARED.drive.scene||scene,CAM); HG.matrix.copy(CAM.matrixWorld); HG.matrixWorldNeedsUpdate=true; const ac=r.autoClear; r.autoClear=false; r.clearDepth(); r.render(HUD,CAM); r.autoClear=ac; }
    r.xr.enabled=false; };

  const loop=(t,xf)=>{ '@later'; const ref=renderer.xr.getReferenceSpace(); VR.pose=ref?xf.getViewerPose(ref):null; VR.rt=renderer.getRenderTarget(); read(xf); flush(t);
    try{ PAD.step(t,VP); }catch(e){ if(!VR.err){ VR.err=1; console.warn('VR: the controllers',e); } }
    try{ frame(t,xf); }catch(e){ if(!VR.err){ VR.err=1; console.warn('VR: the frame',e); } } };

  const mats=()=>scene.traverse(o=>{ if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true; });
  const shadows=()=>{ const want=!VR.on||opt.shadow!=='off'; if(VR.on&&VR.sh0==null)VR.sh0=renderer.shadowMap.enabled; const to=VR.on?want&&VR.sh0:VR.sh0; if(!VR.on)VR.sh0=null; if(to!=null&&to!==renderer.shadowMap.enabled){ renderer.shadowMap.enabled=to; mats(); } };
  const rate=()=>{ const s=VR.s; if(!s||!s.supportedFrameRates||!s.updateTargetFrameRate)return; const L=[...s.supportedFrameRates]; if(!L.length)return; const r=L.reduce((a,b)=>Math.abs(b-opt.rate)<Math.abs(a-opt.rate)?b:a); if(r!==s.frameRate)s.updateTargetFrameRate(r).catch(()=>{}); };
  const apply=k=>{ if(k==='far')CAM.far=opt.far/FEEL.MH; if(k==='rate')rate(); if(k==='shadow')shadows(); if(k==='view'&&VR.on)VR.cal=false; if((k==='panw'||k==='pand')&&panel.visible)openPanel(); if(k==='hands')JM.visible=opt.hands; };
  const save=()=>{ try{ SAVE.set('vr',JSON.stringify(opt)); }catch(e){} };
  VR.set=(k,v,quiet)=>{ if(!(k in DEF))return; opt[k]=typeof DEF[k]==='number'?+v:typeof DEF[k]==='boolean'?v===true||v==='true':String(v); apply(k); if(!quiet){ save(); if(VR.pane&&VR.pane.isConnected)VR.open(VR.pane); } };
  VR.open=el=>{ '@later'; VR.pane=el;
    const row=(l,k,L)=>`<div class="row"><span>${l}</span>${L.map(([v,t])=>`<button class="btn" data-k="${k}" data-v="${v}" aria-pressed="${String(opt[k])===String(v)}">${t}</button>`).join('')}</div>`;
    const onoff=(l,k)=>`<div class="row onoff"><button class="btn" data-k="${k}" data-v="${!opt[k]}" aria-pressed="${!!opt[k]}">${l}</button></div>`;
    const range=(l,k,mn,mx,s,u)=>`<div class="row"><span>${l}</span><input type="range" data-k="${k}" min="${mn}" max="${mx}" step="${s}" value="${opt[k]}"><span data-rv="${k}">${opt[k]}${u}</span></div>`;
    el.innerHTML=`<div class="row"><button class="btn" id="dvrgo"${btn.hidden?' disabled':''}>${VR.on?'LEAVE VR':'ENTER VR'}</button><span class="dim">${btn.hidden?'no headset here: open the site in your headset\'s browser':VR.on?'you are in the headset':'a headset is here'}</span></div>
      <div class="dim">${TIP.slice(1).join(' · ')} · B BACK · LEFT TRIGGER ROLLS · GRIPS TURN · RIGHT STICK PRESS RECENTRES · TELEPORT: PUSH THE STICK FORWARD, AIM, LET GO</div>
      <h3>MOVING</h3>${row('MOVE','move',[['stick','STICK'],['teleport','TELEPORT']])}${row('TURN','turn',[['snap30','SNAP 30°'],['snap45','SNAP 45°'],['snap90','SNAP 90°'],['smooth','SMOOTH']])}${row('VIEW','view',[['first','FIRST PERSON'],['behind','BEHIND']])}${row('HANDED','hand',[['right','RIGHT: LEFT STICK WALKS'],['left','LEFT: RIGHT STICK WALKS']])}${onoff('COMFORT VIGNETTE','vig')}${range('EYE HEIGHT','height',-30,30,1,' cm')}
      <h3>YOU</h3>${onoff('YOUR BODY','body')}${onoff('YOUR HANDS','hands')}${onoff('CONTROLLERS','ctl')}
      <h3>PICTURE</h3>${row('EYE PICTURE','scale',[[.5,'50%'],[.65,'65%'],[.75,'75%'],[1,'100%']])}<div class="dim">the eye picture takes effect when you next enter VR</div>${row('FRAME RATE','rate',[[72,'72'],[80,'80'],[90,'90'],[120,'120']])}${row('SHADOWS','shadow',[['full','FULL'],['light','LIGHT'],['off','OFF']])}${onoff('WATER REFLECTIONS','water')}${row('DRAW DISTANCE','far',[[150,'NEAR'],[300,'MID'],[600,'FAR']])}
      <h3>MOVES</h3><div class="row"><button class="btn" data-mv="v">WAVE</button><button class="btn" data-mv="u">CARTWHEEL</button></div><div class="dim">the menu closes and you do the move (the headset has no button for these)</div>
      <h3>WINDOWS</h3>${range('PANEL SIZE','panw',.8,2.5,.1,' m')}${range('PANEL DISTANCE','pand',.6,2,.1,' m')}${row('PANEL REFRESH','panel',[['fast','FAST'],['normal','NORMAL'],['slow','SLOW']])}
      <div class="row"><button class="btn" id="dvrreset">ALL BACK AS THEY WERE</button></div>`;
    el.querySelectorAll('input[type=range]').forEach(r=>r.style.setProperty('--p',(r.value-r.min)/((r.max-r.min)||1)*100+'%'));
    el.onclick=e=>{ const b=e.target.closest('button'); if(!b)return; if(b.id==='dvrgo'){ VR.on?VR.leave():VR.enter(); return; } if(b.id==='dvrreset'){ for(const k in DEF)VR.set(k,DEF[k],true); save(); VR.open(el); return; } if(b.dataset.mv){ const k=UI.keyOf?UI.keyOf(b.dataset.mv):b.dataset.mv; if(UI.menuOpen)tap('Escape'); setTimeout(()=>tap(k),150); return; } if(b.dataset.k)VR.set(b.dataset.k,b.dataset.v); };
    el.oninput=e=>{ const r=e.target; if(r.type!=='range'||!r.dataset.k)return; VR.set(r.dataset.k,r.value,true); const s=el.querySelector('[data-rv="'+r.dataset.k+'"]'); if(s)s.textContent=r.value+(r.dataset.k==='height'?' cm':' m'); };
    el.onchange=e=>{ if(e.target.type==='range')save(); }; };

  VR.note=(t,c,o)=>{ if(!VR.on||!t)return; o=o||{}; VR.tip=0; if(o.only)VR.notes.length=0; VR.notes.push({t:String(t),c,big:!!o.big,until:performance.now()+(o.ms||4000)}); while(VR.notes.length>3)VR.notes.shift(); };
  VR.ask=w=>{ VR.want=w||null; VR.cal=false; };
  VR.hand=side=>{ if(!VR.on)return null; const C=CTL.find(c=>c.userData.on&&c.userData.h===side); return C?C.userData:null; };   // {wp, wq, v}: the controller's world position, orientation and velocity, or null
  window.VR=VR; VR.state=()=>({vrview:vw(),notes:VR.notes.map(o=>o.t),turns:turns(),view:UI.view,body:W3.group.visible,nohead:VR.nh,pad:!!PAD.xr,menu:!!UI.menuOpen,fov:PCAM.fov,yaw:SHARED.yawTo,pitch:SHARED.pitchTo,win:VR.win,panel:panel.visible&&PN.ready,fresh:PN.ready&&PN.fresh&&!PN.dirty&&!PN.busy,shots:PN.n,clicks:VR.clicks||0,hands:VR.hands,ctl:VR.ctl,wrist:wrist.visible,hits:PTR.filter(P=>P.hit).length,tp:VR.tp,move:opt.move,live:LIVE.visible,gamewin:UI.gamewin||null});
  VR.aim=(x,y)=>{ const p=new V3((x/PN.W-.5)*panel.scale.x,(.5-y/PN.H)*panel.scale.y,0).applyQuaternion(panel.quaternion).add(panel.position); return {x:p.x,y:p.y,z:p.z}; };
  VR.dbg=()=>({rays:PTR.filter(P=>P.src).map(P=>({h:P.src.handedness,hand:!!P.src.hand,o:P.o,d:P.d,hit:P.hit,x:P.x,y:P.y})),wrist:wrist.visible?wrist.position.toArray():null,finger:TIPR.toArray()});

  const btn=document.createElement('button'); btn.type='button'; btn.id='vrbtn'; btn.className='mlb'; btn.hidden=true; btn.textContent='ENTER VR'; btn.title='Play in your headset (hold B to leave)';
  btn.style.cssText='position:fixed;left:calc(12px + env(safe-area-inset-left,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:5;font:12px var(--pixel);color:var(--key);background:var(--panel);border:2px solid var(--line);padding:8px 12px;cursor:pointer';
  btn.onclick=()=>{ btn.blur(); if(VR.on)VR.leave(); else VR.enter(); }; document.body.appendChild(btn);
  if(xr&&xr.isSessionSupported)xr.isSessionSupported('immersive-vr').then(ok=>{ btn.hidden=!ok; }).catch(()=>{});

  const stop=()=>{ '@later'; if(!VR.on)return; VR.on=false; VR.s=null; VR.pose=null; VR.win=false; closePanel(); renderer.xr.setAnimationLoop(null); renderer.setAnimationLoop(null); renderer.xr.enabled=false; shim(false);
    VP.connected=false; PAD.xr=null; PAD.step(performance.now(),null); dispatchEvent(new Event('gamepaddisconnected')); keys.clear();
    ARC.visible=RING.visible=false; VR.tp=null; VR.tpa=VR.tpWas=false; for(const C of CTL)C.visible=false; VR.ctl=0; if(VR.nh){ VR.nh=false; if(W3.setHead)W3.setHead(true); } shadows();
    PCAM.fov=VR.fov; PCAM.updateProjectionMatrix(); if(VR.view&&VR.view!=='first')UI.setView(VR.view); btn.textContent='ENTER VR'; resize(); if(VR.pane&&VR.pane.isConnected)VR.open(VR.pane); };
  const start=s=>{ '@later'; VR.s=s; VR.on=true; VR.cal=false; VR.err=0; VR.m=''; VR.tip=10; VR.win=false; VR.view=UI.view; VR.fov=PCAM.fov; PCAM.fov=110; PCAM.updateProjectionMatrix(); CAM.far=opt.far/FEEL.MH;
    shim(true); renderer.xr.enabled=false; renderer.xr.setAnimationLoop(loop);
    VP.connected=true; PAD.xr=VP; dispatchEvent(new Event('gamepadconnected'));
    s.addEventListener('end',stop); s.addEventListener('selectstart',onSel); s.addEventListener('selectend',onSel);
    const ref=renderer.xr.getReferenceSpace(); if(ref&&ref.addEventListener)ref.addEventListener('reset',()=>{ VR.cal=false; });
    rate(); shadows(); btn.textContent='LEAVE VR'; if(VR.pane&&VR.pane.isConnected)VR.open(VR.pane); };
  VR.enter=async()=>{ '@later'; if(VR.on||VR.busy||!xr)return; VR.busy=true;
    try{ const s=await xr.requestSession('immersive-vr',{optionalFeatures:['hand-tracking']}); renderer.xr.setReferenceSpaceType('local'); renderer.xr.setFramebufferScaleFactor(opt.scale); await renderer.xr.setSession(s); start(s); }
    catch(e){ console.warn('VR: the headset did not start',e); } finally{ VR.busy=false; } };
  VR.leave=()=>{ if(VR.s)VR.s.end().catch(()=>stop()); };
}
