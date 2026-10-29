// THE SCANNER: a New Yorker who never took off his home-made radio box; his small radio shop on Market St; the police scanner (held, it hears where security is: the precinct's officers and the guards, as blips and chatter) and night-vision goggles that really work (worn, the dark comes up green).
import {SHARED, THREE} from './003-shx.js';
import {CIVIC, EQUIP, FORAGE, ITEMS, NPCS, pos, SHOPS, UI, WIELD} from './003b-systems.js';
import {ShaderPass} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';
import {MSHOP} from './059i-mshops.js';
import {MERCH} from './111e-merch.js';
const SCAN={on:false}; window.SCAN=SCAN;
{ const T=TILE, K=MERCH.K, {mk,grp,SPH,LATHE,drape}=K;
  FORAGE.add({names:{radio_scanner:'POLICE SCANNER',nv_goggles:'NIGHT-VISION GOGGLES'}});

  /* ---------- him: a battered beige-grey radio box over his eyes (speaker cone, grilles, a little display, knobs, a drum each side, two stubby antennae, his blond hair out the top); stubble, mouth half open; red tank top under a torn denim vest, a leather strap, a cord and chains ---------- */
  const SK='skin:#d6a888', BOXC='plastic:#b4ab94', BOXD='plastic:#7a7466', MET='metal:#a8a8a4', TANK='cloth:#a8483c', VEST='denim:#4a6a8a', LTH='leather:#2a2220';
  const model=()=>{ const sk=MERCH.skel({hipY:.92,neck:.5,shX:.2,shY:.42,upper:.29,fore:.26}), {B}=sk;
    mk(B.torso,LATHE([[.15,-.05],[.17,.1],[.18,.25],[.18,.36],[.15,.44],[.09,.5],[.05,.53]],28,.75),TANK); mk(B.torso,new THREE.CylinderGeometry(.05,.055,.1,18),SK,[0,.55,0]);
    for(const s of [1,-1]){ mk(B.torso,drape(LATHE([[.0,-.04],[.16,-.03],[.19,.1],[.19,.3],[.16,.42],[.0,.44]],18,.3),.008),VEST,[.11*s,0,.04],[0,s*.35,0],[.5,1,1]); mk(B.torso,drape(LATHE([[.0,-.04],[.16,-.03],[.19,.1],[.19,.3],[.16,.42],[.0,.44]],18,.3),.008),VEST,[.0,0,-.07],[0,Math.PI,0],[1.05,1,.9]); }
    mk(B.torso,new THREE.TorusGeometry(.32,.016,8,40,Math.PI*.9),LTH,[0,.24,0],[0,Math.PI/2,.9]); mk(B.torso,new THREE.TorusGeometry(.07,.006,8,28),LTH,[0,.5,.02],[Math.PI/2-.3,0,0]); mk(B.torso,new THREE.TorusGeometry(.085,.003,6,32,Math.PI),MET,[0,.47,.05],[.6,0,Math.PI]);
    mk(B.hips,new THREE.CylinderGeometry(.16,.15,.16,24),'denim:#2c3a50',[0,-.06,0],[0,0,0],[1,1,.8]);
    const H=grp(B.head,[0,.14,.01]); const hs=new THREE.SphereGeometry(.1,32,24); mk(H,hs,SK,[0,0,0],[0,0,0],[.9,1.08,1]); mk(H,new THREE.ConeGeometry(.02,.045,12),SK,[0,-.01,.1],[1.45,0,0]);
    mk(H,new THREE.TorusGeometry(.02,.006,8,16),'plain:#7a4a40',[0,-.05,.088],[0,0,0],[1.3,.7,1]); mk(H,SPH(.017,12,8),'plain:#2a1414',[0,-.05,.086],[0,0,0],[1.1,.6,.5]);
    mk(H,SPH(.1,28,14,0,Math.PI*2,Math.PI*.55,Math.PI*.45),'skin:#a48a74',[0,0,.002],[0,0,0],[.92,1.08,1.02]);
    const bx=grp(H,[0,.1,.0],[.05,0,.04]); bx.scale.set(1,.85,1); mk(bx,new THREE.BoxGeometry(.34,.24,.24,4,4,4),BOXC); mk(bx,new THREE.BoxGeometry(.33,.05,.23),BOXD,[0,.1,0]);
    mk(bx,new THREE.CylinderGeometry(.045,.045,.02,28),'plastic:#2a2a2a',[.09,-.02,.122],[Math.PI/2,0,0]); mk(bx,new THREE.TorusGeometry(.05,.008,10,28),MET,[.09,-.02,.124]);
    for(let i=0;i<6;i++)mk(bx,new THREE.BoxGeometry(.006,.05,.004),BOXD,[-.02+i*.012,-.02,.121]); mk(bx,new THREE.BoxGeometry(.07,.035,.004),'glass:#c8dcc0',[-.11,-.0,.121]);
    for(let i=0;i<6;i++)mk(bx,new THREE.CylinderGeometry(.008,.008,.012,12),i%3?MET:'plastic:#c84030',[-.12+i*.03,-.08,.124],[Math.PI/2,0,0]);
    for(const s of [1,-1]){ mk(bx,new THREE.CylinderGeometry(.05,.05,.06,24),BOXD,[.2*s,0,0],[0,0,Math.PI/2]); mk(bx,new THREE.TorusGeometry(.04,.006,8,24),MET,[.23*s,0,0],[0,Math.PI/2,0]); mk(bx,new THREE.CylinderGeometry(.016,.016,.1,12),BOXD,[.1*s,.16,-.02]); }
    for(let i=0;i<9;i++)mk(bx,new THREE.ConeGeometry(.012,.07,6),'fur:#d8c890',[(i-4)*.02,.15,-.04+Math.sin(i)*.03],[Math.sin(i*1.7)*.4,0,(i-4)*.12]);
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['upperArm'+n],new THREE.CylinderGeometry(.05,.044,.29,18),SK,[0,-.13,0]); mk(B['upperArm'+n],SPH(.056,16,12),SK); mk(B['forearm'+n],new THREE.CylinderGeometry(.044,.036,.26,18),SK,[0,-.12,0]);
      const h=grp(B['hand'+n]); h.rotation.y=-s*Math.PI/2; mk(h,new THREE.CapsuleGeometry(.03,.04,6,12),SK,[0,-.045,0],[0,0,0],[1.15,1,.55]); for(let i=0;i<4;i++){ const f=grp(h,[-.025+i*.017,-.085,.003],[-.5,0,0]); mk(f,new THREE.CapsuleGeometry(.0075,.04,4,8),SK,[0,-.025,0]); }
      mk(B['thigh'+n],new THREE.CylinderGeometry(.075,.062,.43,20),'denim:#2c3a50',[0,-.2,0]); mk(B['shin'+n],new THREE.CylinderGeometry(.062,.056,.42,20),'denim:#2c3a50',[0,-.2,0]);
      mk(B['shoe'+n],new THREE.CapsuleGeometry(.048,.15,6,12),'leather:#3a3028',[0,-.05,.05],[Math.PI/2,0,0],[1,1,.85]); }
    return sk; };
  MERCH.add({key:'scanner',label:'THE SCANNER',height:1.8,model,size:10,hd:Math.PI,inside:true,
    idle:t=>{ const k=(t%6)<2; return MERCH.pose({nod:-6+Math.sin(t*1.1)*5,yaw:Math.sin(t*.5)*12,L:{ua:[k?118:40,6],fa:[k?120:70,8]},R:{ua:[44,-8],fa:[80,-10]}}); }});

  /* ---------- the police scanner: held, a scope of blips (the officers blue, the guards red) and the chatter the precinct puts out ---------- */
  const HUD=document.createElement('div'); HUD.hidden=true; HUD.style.cssText='position:fixed;right:14px;bottom:70px;width:200px;z-index:7;font:9px Silkscreen,monospace;color:#9fe0a8;background:#06100af0;border:2px solid #2a4a30;padding:6px;zoom:var(--uiz,1)';
  const CV=document.createElement('canvas'); CV.width=CV.height=120; CV.style.cssText='display:block;margin:0 auto 4px;image-rendering:pixelated'; HUD.appendChild(CV); const LOG=document.createElement('div'); LOG.style.cssText='min-height:36px;line-height:1.35'; HUD.appendChild(LOG); document.body.appendChild(HUD);
  const security=()=>{ const L=[]; for(const id in CIVIC.staff||{})if(/^officer/.test(id)){ const S=CIVIC.staff[id]; if(S&&S.N&&S.N.st)L.push({x:S.N.st.x,z:S.N.st.z,c:'#6ab0ff',n:S.name||id,state:S.state}); }
    const G=window.GUARDX&&GUARDX.GUARDS||[]; for(const N of G)if(N&&N.st&&N.mode!=='hidden'&&N.lv===SHARED.LVL)L.push({x:N.st.x,z:N.st.z,c:'#ff5a4a',n:'GUARD'}); return L; };
  SCAN.security=security;
  const RANGE=60*T; let sw=0, lastLog=null;
  const scope=dt=>{ const g=CV.getContext('2d'), W=120, c=W/2; sw=(sw+(dt||0)*2.4)%(Math.PI*2); g.fillStyle='#041008'; g.fillRect(0,0,W,W); g.strokeStyle='#1e4a28'; for(const r of [20,40,58]){ g.beginPath(); g.arc(c,c,r,0,7); g.stroke(); } g.beginPath(); g.moveTo(c,0); g.lineTo(c,W); g.moveTo(0,c); g.lineTo(W,c); g.stroke();
    g.strokeStyle='#5aff7a'; g.globalAlpha=.6; g.beginPath(); g.moveTo(c,c); g.lineTo(c+Math.cos(sw)*58,c+Math.sin(sw)*58); g.stroke(); g.globalAlpha=1;
    const yaw=SHARED.yaw||0, cs=Math.cos(yaw), sn=Math.sin(yaw); let near=null;
    for(const s of security()){ const dx=s.x-pos.x, dz=s.z-pos.z, d=Math.hypot(dx,dz); if(d>RANGE)continue; const rx=dx*cs-dz*sn, rz=dx*sn+dz*cs, px=c+rx/RANGE*58, py=c+rz/RANGE*58; g.fillStyle=s.c; g.fillRect(px-2,py-2,4,4); if(!near||d<near.d)near={...s,d}; }
    g.fillStyle='#e8e2cc'; g.fillRect(c-1,c-1,3,3);
    const L=(CIVIC.log||[]).filter(e=>/precinct|street/.test(e.where)); const top=L[0]; if(top&&top!==lastLog){ lastLog=top; }
    LOG.innerHTML=`<b style="color:#f2c14e">SCANNER</b> · ${near?`NEAREST ${near.n.toUpperCase()} ${Math.round(near.d/T)} M`:'NO UNITS IN RANGE'}<br>${L.slice(0,2).map(e=>'… '+String(e.what).toUpperCase()).join('<br>')||'… QUIET ON ALL BANDS'}`; };
  const kind={name:'POLICE SCANNER',hint:'IT HISSES AND TALKS: BLUE IS THE PRECINCT, RED THE GUARDS.',make:()=>{ const g=new THREE.Group(), b=new THREE.Mesh(new THREE.BoxGeometry(.07,.16,.04),new THREE.MeshStandardMaterial({color:0x2a2c30,roughness:.5})), a=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.16,6),new THREE.MeshStandardMaterial({color:0x111111}));
      b.position.y=.08; a.position.set(.02,.22,0); g.add(b,a); g.head=new THREE.Vector3(0,.3,0); return g; }};
  (WIELD.pend=WIELD.pend||[]).push(['radio_scanner',kind]); if(WIELD.kind)WIELD.kind('radio_scanner',kind);
  SYS.add('life',dt=>{ SCAN.on=WIELD.on==='radio_scanner'&&FORAGE.has('radio_scanner'); HUD.hidden=!SCAN.on; if(SCAN.on)scope(dt); },'146n-scanner');

  /* ---------- night vision: worn on the eyes; the picture is gained up and goes green, grainy at the edges, and only while it is dark enough to need it ---------- */
  let NV=null; const nv=()=>{ if(NV||!SHARED.composer)return NV; NV=new ShaderPass({uniforms:{tDiffuse:{value:null},uOn:{value:0},uT:{value:0}},vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader:`uniform sampler2D tDiffuse; uniform float uOn,uT; varying vec2 vUv; float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233))+uT)*43758.5453); }
      void main(){ vec4 c=texture2D(tDiffuse,vUv); if(uOn<.01){ gl_FragColor=c; return; } float l=dot(c.rgb,vec3(.3,.59,.11)); float g=pow(clamp(l*6.,0.,1.),.55); g+= (h(vUv*700.)-.5)*.12; vec2 d=vUv-.5; float v=1.-smoothstep(.32,.62,length(d*vec2(1.3,1.)));
        vec3 n=vec3(.2,1.,.35)*g*v; gl_FragColor=vec4(mix(c.rgb,n,uOn),c.a); }`}); NV.enabled=false; SHARED.composer.insertPass(NV,1); return NV; };
  SYS.add('life',dt=>{ const on=!!EQUIP.night; if(!on&&!NV)return; const P=nv(); if(!P)return; const k=on?1:0; P.uniforms.uOn.value+=(k-P.uniforms.uOn.value)*Math.min(1,(dt||0)*6); P.uniforms.uT.value=(performance.now()/1000)%100; P.enabled=P.uniforms.uOn.value>.01; },'146n-nightvision');

  /* ---------- his shop, inside: radios to the ceiling, a ham desk of glowing dials, a map of the beats pinned with string, goggles on a dummy head ---------- */
  MSHOP.kit.scanner=A=>{ '@later'; const {R,X,Z,hs,sh}=A, Y=h=>A.Y(h*24), cx=A.cx, EX=Math.sign(X(R.x1)-X(R.x0)), IN=Math.sign(Z(R.y1)-Z(R.y0)), wf=EX>0?-Math.PI/2:Math.PI/2;
    const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.6,...o}), M=(geo,m,x,h,y,ry=0)=>{ const o=new THREE.Mesh(geo,m); o.position.set(X(x),Y(h),Z(y)); o.rotation.y=ry; o.castShadow=o.receiveShadow=true; A.add(o); return o; };
    A.floor((x,y)=>{ const f=.85+.15*hs(Math.floor(x*4),Math.floor(y*4),3); return sh([74,66,58],f-(hs(Math.floor(x*1.5),Math.floor(y*1.5),9)>.86?.15:0)); });
    const wall=(u,z)=>{ if(z<24)return sh([46,40,36],.9); return sh([86,96,84],.82+.1*hs(Math.floor(u*2),Math.floor(z/10),5)-(hs(Math.floor(u*6),Math.floor(z/4),11)>.95?.2:0)); };
    for(const s of ['b','w','e','f'])A.wall(s,wall);
    // the east wall: shelves of radios, each a box with a dial that glows, some scanners with antennae up
    const ex=R.x1-.4;
    for(let s=0;s<5;s++){ M(new THREE.BoxGeometry(.5*T,.03*T,(R.y1-R.y0-2)*T),std(0x4a3a2a),ex,.3+s*.6,(R.y0+R.y1)/2-.3);
      for(let i=0;i<9;i++){ const y=R.y0+.9+i*.75, w=.3+hs(s,i,1)*.15, h=.18+hs(i,s,2)*.12; M(new THREE.BoxGeometry(.3*T,h*T,w*T),std([0x9a8a70,0x3a3a3a,0x6a3020,0xb8b0a0,0x2a3a4a][(s+i)%5]),ex,.32+s*.6+h/2,y);
        const d=new THREE.Mesh(new THREE.PlaneGeometry(.08*T,.04*T),new THREE.MeshBasicMaterial({color:hs(s,i,4)>.5?0x9aff9a:0xffc070})); d.position.set(X(ex-.16*EX*EX)-EX*.001,Y(.32+s*.6+h*.6),Z(y)); d.position.x=X(ex)-EX*.16*T; d.rotation.y=wf; A.add(d); } }
    A.sol(ex-.3,R.y0+.3,R.x1,R.y1-.8);
    // his desk: a ham rig of dials and meters, a mic, a headset, a coffee can of pencils; the map of the beats pinned above it
    const dx=cx, dy=R.y0+1.4; M(new THREE.BoxGeometry(2.6*T,.08*T,1*T),std(0x3a2a1c),dx,.95,dy); for(const s of [-1,1])M(new THREE.BoxGeometry(.08*T,.95*T,.9*T),std(0x2a1e14),dx+s*1.2,.47,dy);
    for(let i=0;i<3;i++){ M(new THREE.BoxGeometry(.6*T,.3*T,.4*T),std(0x2c2e30,{metalness:.3}),dx-.7+i*.7,1.14,dy-.15); const g=new THREE.Mesh(new THREE.PlaneGeometry(.3*T,.1*T),new THREE.MeshBasicMaterial({color:i===1?0x7aff9a:0xffb060})); g.position.set(X(dx-.7+i*.7),Y(1.18),Z(dy-.15)+IN*.201*T); if(IN<0)g.rotation.y=Math.PI; A.add(g); }
    M(new THREE.CylinderGeometry(.03*T,.05*T,.25*T,12),std(0x1a1a1a),dx+.9,1.12,dy+.2); A.sol(dx-1.35,dy-.55,dx+1.35,dy+.55);
    const map=A.tex(96,64,(g,w,h)=>{ g.fillStyle='#d8ccaa'; g.fillRect(0,0,w,h); g.strokeStyle='#8a7a5a'; for(let i=0;i<8;i++){ g.beginPath(); g.moveTo(0,i*9); g.lineTo(w,i*9+3); g.stroke(); g.beginPath(); g.moveTo(i*13,0); g.lineTo(i*13-4,h); g.stroke(); } g.fillStyle='#c03020'; for(let i=0;i<9;i++)g.fillRect((i*37)%w,(i*23)%h,3,3); g.strokeStyle='#c03020'; g.beginPath(); g.moveTo(10,10); g.lineTo(50,30); g.lineTo(80,15); g.stroke(); });
    const mp=new THREE.Mesh(new THREE.PlaneGeometry(1.6*T,1*T),new THREE.MeshStandardMaterial({map,roughness:.9})); mp.position.set(X(dx),Y(2.2),Z(R.y0+.03)); if(IN<0)mp.rotation.y=Math.PI; A.add(mp);
    // goggles on a dummy head by the counter, their lenses faintly green; double-click to buy
    const gx=R.x0+1.4, gy=R.y1-1.6; M(new THREE.CylinderGeometry(.35*T,.4*T,1*T,16),std(0x2a2a2c),gx,.5,gy); M(new THREE.SphereGeometry(.13*T,20,14),std(0xc8b8a0),gx,1.15,gy);
    for(const s of [-1,1]){ const l=M(new THREE.CylinderGeometry(.04*T,.04*T,.06*T,16),std(0x1a1a1a),gx+s*.05,1.18,gy+.12); l.rotation.x=Math.PI/2; const e=new THREE.Mesh(new THREE.CircleGeometry(.03*T,16),new THREE.MeshBasicMaterial({color:0x5aff7a})); e.position.set(X(gx+s*.05),Y(1.18),Z(gy+.155)); A.add(e); }
    A.sol(gx-.4,gy-.4,gx+.4,gy+.4);
    for(const [id,x,y] of [['nv_goggles',gx,gy],['radio_scanner',ex-.3,(R.y0+R.y1)/2]]){ const hb=new THREE.Mesh(new THREE.BoxGeometry(1*T,2*T,1*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(x),Y(1),Z(y)); A.add(hb);
      UI.thing({name:(FORAGE.NM&&FORAGE.NM[id]||id)+' · $'+(+ITEMS.prop(id,'value')||0),obj:hb,reach:2.4*T,near:3.2*T,tall:2*T,act:()=>{ const N=NPCS.extra.find(q=>q.key==='scanner'); if(N&&SHOPS.open)SHOPS.open(N); }}); }
    A.lamp(dx,dy+.5,2.4,0xffd8a0,10,8); A.lamp(ex-.8,(R.y0+R.y1)/2,2.6,0x9ad8a8,8,8); A.lamp(gx,gy,2.4,0xc8d8ff,6,7); A.lamp(cx,R.y1-1.5,2.8,0xe0e8ff,5,8); };
}
