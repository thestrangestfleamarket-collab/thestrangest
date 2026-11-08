// THE GREENS: the holodeck's mini golf adventure, one hole in a zen garden off the map, deep in a foggy jungle valley walled by hills (raked gravel, a koi pond under a waterfall, maples, bamboo, stone lanterns under an overcast sky). The putter is a held tool: in the headset it hangs from your controller and the ball takes your real swing; on screen the mouse aims and the held button draws the stroke back. Stroke play against par, Walkabout's rules.
import {SHARED, THREE} from './003-shx.js';
import {FEEL, FORAGE, INV, pos, ROOMS, SFX, st, UI, VR, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer, scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {STORE, TILE} from './006-map-pre.js';
import {PAD} from './075-main-13.js';
{ const H=STORE.holo, T=TILE, M=FEEL.MH, V3=THREE.Vector3, say=(t,c)=>SAY(t,c), m=v=>v*M;
  const WX=4200, WZ=0, PAR=2, COST=0, BALLR=.021, CUPR=.054, LANEW=.9, HEADR=.055;
  let D=null, W=null, savedGY=null, savedView=null, keyoff=null, amb=null; const FG=new THREE.Fog(0x4b5852,1,60), FV=new V3();
  const rnd=(s=>()=>{ s=(s*16807)%2147483647; return s/2147483647; })(4242);
  const hashN=(x,y)=>{ const v=Math.sin(x*127.1+y*311.7)*43758.5453; return v-Math.floor(v); };
  const lx=()=>(pos.x-WX)/M, lz=()=>(pos.z-WZ)/M, wx=x=>WX+x*M, wz=z=>WZ+z*M;
  FORAGE.add({names:{putter:'PUTTER'},prices:{putter:20}});

  /* ---------- the putter: a held tool; its head is the tip WIELD tracks ---------- */
  const std=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.8,metalness:0},o));
  const putter=()=>{ '@later'; const g=new THREE.Group(), arm=new THREE.Group(); g.add(arm); g.arm=arm;
    const grip=new THREE.Mesh(new THREE.CylinderGeometry(.016,.014,.26,8),std(0x1c1a1a,{roughness:.95})); grip.position.y=.13;
    const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.007,.009,.74,8),std(0xc9ccd2,{roughness:.35,metalness:.9})); shaft.position.y=.26+.37;
    const head=new THREE.Mesh(new THREE.BoxGeometry(.11,.028,.034),std(0x8e949c,{roughness:.4,metalness:.85})); head.position.set(0,1.0,.02);
    const face=new THREE.Mesh(new THREE.BoxGeometry(.105,.022,.004),std(0xe8eaee,{roughness:.3,metalness:.6})); face.position.set(0,1.0,.004);
    arm.add(grip,shaft,head,face); g.tipL=new V3(0,1.0,.02); g.head=g.tipL; return g; };
  const KIND={name:'PUTTER',hint:'STAND BY YOUR BALL: THE MOUSE AIMS, HOLD THE BUTTON TO DRAW BACK, LET GO TO PUTT. F WALKS YOU TO THE BALL.',make:()=>{ const g=putter(); KIND.gs.push(g); return g; },
    aim:(dt,aim)=>{ if(!D||!D.addr||VR.on)return false; aim.set(B.x-lx(),-1.1,B.z-lz()); if(aim.lengthSq()<1e-4)aim.set(0,-1,.2); aim.normalize(); return true; },
    use:()=>!!(D&&D.addr) };
  KIND.gs=[]; WIELD.kind('putter',KIND);

  /* ---------- the hole: a smooth centreline, the lane the points within half its width (so the rails are where the ball stops) ---------- */
  const CL=[[0,-3.4],[0,.9],[1.1,2.4],[2.6,3.5],[3.7,4.6]], CUP_S=-.72, TEE_S=.55;
  const curve=new THREE.CatmullRomCurve3(CL.map(([x,z])=>new V3(x,0,z)),false,'centripetal',.5), CP=curve.getSpacedPoints(96), SL=[0];
  for(let i=1;i<CP.length;i++)SL[i]=SL[i-1]+CP[i].distanceTo(CP[i-1]); const LEN=SL[CP.length-1];
  const hOf=s=>{ const a=LEN-3.0, b=LEN-1.7; return s<a?0:s>b?.11:.11*(1-Math.cos((s-a)/(b-a)*Math.PI))/2; };   // flat, then a soft rise onto the green
  const dhOf=s=>{ const a=LEN-3.0, b=LEN-1.7; return s<a||s>b?0:.11*Math.PI/(b-a)*Math.sin((s-a)/(b-a)*Math.PI)/2; };
  const near=(x,z)=>{ '@later'; let best=null; for(let i=0;i<CP.length-1;i++){ const a=CP[i], b=CP[i+1], dx=b.x-a.x, dz=b.z-a.z, L=dx*dx+dz*dz, u=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/L)), px=a.x+dx*u, pz=a.z+dz*u, d=Math.hypot(x-px,z-pz);
      if(!best||d<best.d)best={d,px,pz,s:SL[i]+(SL[i+1]-SL[i])*u,tx:dx/Math.sqrt(L),tz:dz/Math.sqrt(L)}; } return best; };
  const atS=s=>{ s=Math.max(0,Math.min(LEN,s)); let i=1; while(i<CP.length-1&&SL[i]<s)i++; const u=(s-SL[i-1])/(SL[i]-SL[i-1]||1); return {x:CP[i-1].x+(CP[i].x-CP[i-1].x)*u,z:CP[i-1].z+(CP[i].z-CP[i-1].z)*u,tx:CP[i].x-CP[i-1].x,tz:CP[i].z-CP[i-1].z}; };
  const CUP=atS(LEN+CUP_S), TEE=atS(TEE_S); { const l=Math.hypot(CUP.tx,CUP.tz); CUP.tx/=l; CUP.tz/=l; }

  /* ---------- the ball ---------- */
  const B={x:TEE.x,z:TEE.z,vx:0,vz:0,y:0,rest:true,restT:0,lie:[TEE.x,TEE.z],inCup:false,sink:0,spin:new THREE.Quaternion()};
  const stepBall=dt=>{ '@later'; if(B.inCup){ B.sink=Math.min(1,B.sink+dt*2.5); return; } if(B.rest)return; const n=Math.ceil(dt/(1/240)); dt/=n;
    for(let k=0;k<n;k++){ const q=near(B.x,B.z), sp=Math.hypot(B.vx,B.vz);
      // down the slope (a rolling ball: 5/7 g), rolling friction on felt, the air
      const g=dhOf(q.s)*9.81*5/7; B.vx-=q.tx*g*dt; B.vz-=q.tz*g*dt;
      if(sp>1e-6){ const f=Math.min(sp,(.62+.08*sp)*dt); B.vx-=B.vx/sp*f; B.vz-=B.vz/sp*f; }
      B.x+=B.vx*dt; B.z+=B.vz*dt;
      // the rail: the lane's edge, a dead-ish wooden bounce
      const r=near(B.x,B.z), lim=LANEW/2-BALLR; if(r.d>lim){ const nx=(B.x-r.px)/r.d, nz=(B.z-r.pz)/r.d; B.x=r.px+nx*lim; B.z=r.pz+nz*lim; const vn=B.vx*nx+B.vz*nz; if(vn>0){ B.vx-=vn*nx*1.55; B.vz-=vn*nz*1.55; B.vx*=.92; B.vz*=.92; if(vn>.25)SFX.play('clunk',{vol:Math.min(.5,vn*.18),pitch:1.9}); } }
      // the cup: a slow enough ball drops; a fast one runs over the lip
      const dc=Math.hypot(B.x-CUP.x,B.z-CUP.z), s2=Math.hypot(B.vx,B.vz); if(dc<CUPR-.004&&s2<2.1){ B.inCup=true; B.vx=B.vz=0; B.x=CUP.x; B.z=CUP.z; holed(); return; }
      if(dc<CUPR+BALLR&&s2>=2.1){ const nx=(B.x-CUP.x)/dc, nz=(B.z-CUP.z)/dc; B.vx+=nx*.3*dt*60; B.vz+=nz*.3*dt*60; }   // the lip kicks a hot ball
    }
    const sp=Math.hypot(B.vx,B.vz); if(sp<.045){ B.restT+=dt*n; if(B.restT>.4){ B.vx=B.vz=0; B.rest=true; B.lie=[B.x,B.z]; onRest(); } } else B.restT=0; };
  const hit=(dx,dz,speed)=>{ '@later'; if(!D||D.done||B.inCup||!B.rest)return false; D.prev={x:B.x,z:B.z,s:D.strokes}; const l=Math.hypot(dx,dz)||1; speed=Math.max(.15,Math.min(4.6,speed)); B.vx=dx/l*speed; B.vz=dz/l*speed; B.rest=false; B.restT=0; D.strokes++; D.addr=false; D.charge=null;
    SFX.play('clunk',{vol:.25+speed*.08,pitch:2.6-speed*.15}); card(); return true; };
  const place=(x,z)=>{ B.x=x; B.z=z; B.vx=B.vz=0; B.rest=true; B.restT=0; B.lie=[x,z]; B.inCup=false; B.sink=0; };
  const onRest=()=>{ if(!D)return; if(D.strokes>=PAR+3){ say('PICK UP. '+(PAR+4)+' WRITTEN FOR THE HOLE.','#c8a090'); finishHole(PAR+4); } else card(); };
  const holed=()=>{ if(!D)return; const n=D.strokes, w=n===1?'A HOLE IN ONE!':n===PAR-1?'A BIRDIE.':n===PAR?'PAR.':n===PAR+1?'A BOGEY.':n+' STROKES.'; SFX.play('clunk',{vol:.6,pitch:3.2}); setTimeout(()=>SFX.play('blip',{vol:.4,pitch:1.4}),160);
    say('IN. '+w,n<=PAR?'#7dffa4':'#e8e2cc'); finishHole(n); };
  const finishHole=n=>{ '@later'; if(!D)return; D.done=true; D.rounds++; const K=OWNED.get('greens'); let S={}; try{ S=JSON.parse(K||'{}')||{}; }catch(e){} S.best=S.best||{}; const b=S.best.zen; if(b==null||n<b){ S.best.zen=n; if(b!=null)say('A NEW BEST ON THE HOLE: '+n+'.','#f2c14e'); } S.rounds=(S.rounds||0)+1; OWNED.set('greens',JSON.stringify(S)); D.best=S.best.zen;
    if(n<=PAR){ FORAGE.use('golf',-10,610); if(n<PAR){ FORAGE.use('golf',-10,610); const pay=Math.round((PAR-n)*(5+FORAGE.sk('golf')/4)); INV.cash+=pay; say('THE HOLODECK PAYS $'+pay+' FOR GOING UNDER PAR.','#f2c14e'); } }
    card(); setTimeout(()=>{ if(!D)return; place(TEE.x,TEE.z); D.strokes=0; D.done=false; say('THE BALL IS BACK ON THE TEE.','#9b9584'); card(); },2600); };

  /* ---------- addressing the ball on screen: F or the ball itself walks you behind it; the mouse aims, the held button draws back ---------- */
  const warp=()=>{ '@later'; if(!D||!W)return; const dx=CUP.x-B.x, dz=CUP.z-B.z, l=Math.hypot(dx,dz)||1, ux=dx/l, uz=dz/l;
    const side=WIELD.hand==='L'?-1:1; pos.x=wx(B.x-ux*.3+uz*side*.38); pos.z=wz(B.z-uz*.3-ux*side*.38); SHARED.target=null; SHARED.heading=Math.atan2(ux,uz); D.aimA=SHARED.heading; D.addr=true; if(WIELD.on!=='putter')WIELD.set('putter'); };
  const nearBall=()=>Math.hypot(lx()-B.x,lz()-B.z)<1.5;
  const aimDir=()=>[Math.sin(D.aimA),Math.cos(D.aimA)];
  let ms={x:-1}; const onMove=e=>{ ms.x=e.clientX; };
  const onDown=e=>{ if(!D||e.button!==0||VR.on||!D.addr||!B.rest||D.done||WIELD.on!=='putter')return; D.charge={t:0}; };
  const onUp=e=>{ if(!D||e.button!==0||!D.charge)return; const p=power(D.charge.t); D.charge=null; const [ux,uz]=aimDir(); D.swing={t:0}; hit(ux,uz,.45+p*3.9); };
  const power=t=>{ const u=(t/1.5)%2; return u<1?u:2-u; };   // the bar runs up and back down while you hold
  const undo=()=>{ if(!D||!D.prev||!B.rest||D.done)return; place(D.prev.x,D.prev.z); D.strokes=D.prev.s; D.prev=null; D.addr=false; D.charge=null; say('THE PUTT IS TAKEN BACK.','#9b9584'); card(); };
  const padNow=()=>{ if(VR.on)return PAD.xr||null; const L=navigator.getGamepads?[...navigator.getGamepads()]:[]; return L.find(g=>g&&g.connected&&g.mapping==='standard')||L.find(g=>g&&g.connected)||null; };
  // a pad on screen: d-pad left walks you to the ball, the right stick aims, RT held and let go putts, d-pad down takes the putt back; in the headset the putter hand's trigger walks you to the ball and B takes it back
  const padStep=dt=>{ '@later'; const g=padNow(); if(!g){ D.pb=null; return; } const pr=D.pb||[], bv=i=>(g.buttons[i]&&g.buttons[i].value)||0, edge=i=>bv(i)>.5&&!((pr[i]||0)>.5);
    if(!VR.on){ if(edge(14)&&B.rest&&!D.done)warp(); if(edge(13))undo();
      if(D.addr&&B.rest&&!D.done){ const rx=g.axes[2]||0; if(Math.abs(rx)>.2){ D.aimA+=rx*dt*1.2; ms.x=-1; }
        if(bv(7)>.5){ if(!D.charge)D.charge={t:0,pad:1}; } else if(D.charge&&D.charge.pad){ const p=power(D.charge.t); D.charge=null; const [ux,uz]=aimDir(); D.swing={t:0}; hit(ux,uz,.45+p*3.9); } } }
    else { if(edge(1))undo(); const hd=WIELD.hand==='L'?'left':'right', c=(VR.grips||[]).find(x=>x.h===hd), on=!!(c&&c.trig>.5); if(on&&!D.trigW&&B.rest&&!D.done)warp(); D.trigW=on; }
    D.pb=g.buttons.map(b=>b.value); };

  /* ---------- the garden ---------- */
  const cvs=(n,f,o={})=>{ const c=document.createElement('canvas'); c.width=o.w||n; c.height=o.h||n; f(c.getContext('2d'),c.width,c.height); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; if(!o.data)t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; };
  const noiseTex=(n,base,amp,o={})=>cvs(n,(g,w,h)=>{ const im=g.createImageData(w,h), d=im.data; for(let i=0;i<w*h;i++){ const v=(hashN(i%w,(i/w)|0)-.5)*amp*2; d[i*4]=base[0]+v; d[i*4+1]=base[1]+v; d[i*4+2]=base[2]+v*(o.bl||1); d[i*4+3]=255; } g.putImageData(im,0,0); },o);
  const STONES=[[-3.6,-1.2,1.1],[2.2,-2.6,.8],[-1.9,3.9,.9],[5.6,1.4,.7],[-2.9,-4.4,.55]];   // x, z, size in metres; the rake circles round them
  const gravelTex=()=>cvs(1024,(g,w,h)=>{ const im=g.createImageData(w,h), d=im.data, S=30/w; for(let j=0;j<h;j++)for(let i=0;i<w;i++){ const x=(i-w/2)*S, z=(j-h/2)*S; let dm=1e9, k=null; for(const s of STONES){ const dd=Math.hypot(x-s[0],z-s[1])-s[2]*.9; if(dd<dm){ dm=dd; k=s; } }
      const rake=dm<2.2?Math.sin(dm/.09*Math.PI*2):Math.sin((x+z*.08)/.09*Math.PI*2), moss=dm<.55?Math.min(1,(.55-dm)/.35):0, n=(hashN(i,j)-.5)*26, sp=hashN(i*3,j*7)>.985?-70:0;
      let r=222+rake*26+n+sp, gg=216+rake*24+n+sp, b=204+rake*20+n*.8+sp; if(moss>0){ const mn=(hashN(i*5,j*3)-.5)*30; r=r*(1-moss)+(62+mn*.6)*moss; gg=gg*(1-moss)+(96+mn)*moss; b=b*(1-moss)+(44+mn*.4)*moss; }
      const o=(j*w+i)*4; d[o]=r; d[o+1]=gg; d[o+2]=b; d[o+3]=255; } g.putImageData(im,0,0); });
  const rippleTex=()=>cvs(256,(g,w,h)=>{ const im=g.createImageData(w,h), d=im.data, H=(x,y)=>Math.sin(x*.18+y*.07)*.5+Math.sin(x*.05-y*.21)*.5+Math.sin((x+y)*.11)*.35; for(let j=0;j<h;j++)for(let i=0;i<w;i++){ const dx=H(i+1,j)-H(i-1,j), dy=H(i,j+1)-H(i,j-1), o=(j*w+i)*4; d[o]=128-dx*40; d[o+1]=128-dy*40; d[o+2]=255; d[o+3]=255; } g.putImageData(im,0,0); },{data:1});
  const fallTex=()=>cvs(128,(g,w,h)=>{ g.clearRect(0,0,w,h); for(let k=0;k<160;k++){ const x=rnd()*w, y=rnd()*h, L=20+rnd()*90, a=.25+rnd()*.5; g.strokeStyle=`rgba(235,245,255,${a})`; g.lineWidth=1+rnd()*2; g.beginPath(); g.moveTo(x,y); g.lineTo(x+(rnd()-.5)*3,y+L); g.stroke(); } },{w:128,h:512});
  const leafTex=(c1,c2)=>cvs(64,(g,w,h)=>{ g.clearRect(0,0,w,h); const cx=w/2, cy=h/2; const grd=g.createRadialGradient(cx,cy,2,cx,cy,30); grd.addColorStop(0,c1); grd.addColorStop(1,c2); g.fillStyle=grd; g.beginPath();
      for(let i=0;i<=40;i++){ const a=i/40*Math.PI*2, lobe=Math.pow(Math.abs(Math.cos(a*2.5)),.6), r=12+17*lobe; g.lineTo(cx+Math.cos(a-Math.PI/2)*r,cy+Math.sin(a-Math.PI/2)*r); } g.closePath(); g.fill(); g.strokeStyle='rgba(60,10,10,.5)'; g.lineWidth=1; g.stroke(); });
  const bladeTex=()=>cvs(32,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle='#4f8a3c'; g.beginPath(); g.moveTo(w/2,0); g.quadraticCurveTo(w,h/2,w/2,h); g.quadraticCurveTo(0,h/2,w/2,0); g.fill(); },{w:32,h:96});
  const petalTex=()=>cvs(32,(g,w,h)=>{ g.clearRect(0,0,w,h); const grd=g.createRadialGradient(16,16,2,16,16,14); grd.addColorStop(0,'rgba(255,214,228,1)'); grd.addColorStop(.7,'rgba(255,170,200,.9)'); grd.addColorStop(1,'rgba(255,170,200,0)'); g.fillStyle=grd; g.beginPath(); g.ellipse(16,16,14,10,.6,0,7); g.fill(); });
  const softTex=()=>cvs(64,(g,w,h)=>{ g.clearRect(0,0,w,h); const grd=g.createRadialGradient(32,32,2,32,32,30); grd.addColorStop(0,'rgba(255,255,255,.9)'); grd.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=grd; g.fillRect(0,0,w,h); });

  const boulder=(sz,seed)=>{ '@later'; const g=new THREE.IcosahedronGeometry(1,2), P=g.attributes.position, v=new V3(); for(let i=0;i<P.count;i++){ v.fromBufferAttribute(P,i); const n=1+(hashN(v.x*7+seed,v.y*5+v.z*3)-.5)*.42; v.multiplyScalar(n); v.y*=.72; P.setXYZ(i,v.x,v.y,v.z); } g.computeVertexNormals();
    const me=new THREE.Mesh(g,W.M.stone); me.scale.setScalar(m(sz)); me.castShadow=me.receiveShadow=true; return me; };
  const lantern=(x,z)=>{ '@later'; const G=new THREE.Group(), s=W.M.granite, add=(geo,y,mat)=>{ const q=new THREE.Mesh(geo,mat||s); q.position.y=m(y); q.castShadow=q.receiveShadow=true; G.add(q); return q; };
    add(new THREE.CylinderGeometry(m(.3),m(.36),m(.14),8),.07); add(new THREE.CylinderGeometry(m(.1),m(.13),m(.9),8),.6); add(new THREE.CylinderGeometry(m(.34),m(.22),m(.1),8),1.1);
    const box=add(new THREE.BoxGeometry(m(.36),m(.34),m(.36)),1.33); for(const [a,b] of [[0,1],[0,-1],[1,0],[-1,0]]){ const win=new THREE.Mesh(new THREE.PlaneGeometry(m(.16),m(.18)),W.M.glow); win.position.set(m(a*.181),m(1.33),m(b*.181)); win.rotation.y=Math.atan2(a,b); G.add(win); }
    const roof=add(new THREE.ConeGeometry(m(.5),m(.26),4),1.63); roof.rotation.y=Math.PI/4; add(new THREE.SphereGeometry(m(.07),8,6),1.84);
    const L=new THREE.PointLight(0xffb86a,8,m(9),2); L.position.y=m(1.33); G.add(L); G.position.set(wx(x),0,wz(z)); return G; };
  const maple=(x,z,sz,seed)=>{ '@later'; const G=new THREE.Group(), wood=W.M.bark, Q=new THREE.Quaternion(), UP=new V3(0,1,0);
    const limb=(a,b,ra,rb)=>{ const d=new V3().subVectors(b,a), L=d.length(), q=new THREE.Mesh(new THREE.CylinderGeometry(rb,ra,L,7,1),wood); q.position.copy(a).addScaledVector(d,.5); q.quaternion.copy(Q.setFromUnitVectors(UP,d.clone().normalize())); q.castShadow=true; G.add(q); };
    const top=new V3(m(.25*sz),m(1.7*sz),m(.1*sz)); limb(new V3(0,0,0),top,m(.14*sz),m(.09*sz)); const ends=[];
    for(let i=0;i<5;i++){ const a=i/5*Math.PI*2+seed, e=new V3(top.x+Math.cos(a)*m(1.3*sz),top.y+m(.5*sz+hashN(i,seed)*.7*sz),top.z+Math.sin(a)*m(1.3*sz)); limb(top,e,m(.07*sz),m(.025*sz)); ends.push(e); const e2=new V3(e.x+Math.cos(a+.9)*m(.7*sz),e.y+m(.3*sz),e.z+Math.sin(a+.9)*m(.7*sz)); limb(e,e2,m(.025*sz),m(.01*sz)); ends.push(e2); }
    const n=150, geo=new THREE.PlaneGeometry(m(.34*sz),m(.34*sz)), cards=new THREE.InstancedMesh(geo,W.M.maple,n), MM=new THREE.Matrix4(), p=new V3(), e=new THREE.Euler(), sc=new V3(1,1,1);
    for(let i=0;i<n;i++){ const c=ends[i%ends.length], r=m((.35+hashN(i,3)*.9)*sz); p.set(c.x+(hashN(i,1)-.5)*2*r,c.y+(hashN(i,2)-.5)*1.4*r,c.z+(hashN(i,4)-.5)*2*r); e.set(hashN(i,5)*Math.PI,hashN(i,6)*Math.PI,hashN(i,7)*Math.PI); MM.compose(p,Q.setFromEuler(e),sc); cards.setMatrixAt(i,MM); }
    cards.castShadow=true; G.add(cards); G.position.set(wx(x),0,wz(z)); return G; };
  const bamboo=(x,z,n)=>{ '@later'; const G=new THREE.Group(), blade=new THREE.PlaneGeometry(m(.05),m(.3)); for(let i=0;i<n;i++){ const bx=x+(hashN(i,11)-.5)*2.2, bz=z+(hashN(i,12)-.5)*2.2, hgt=3+hashN(i,13)*1.6, lean=(hashN(i,14)-.5)*.12, segs=Math.round(hgt/.42);
      const stalk=new THREE.Group(); for(let k=0;k<segs;k++){ const q=new THREE.Mesh(new THREE.CylinderGeometry(m(.028),m(.03),m(.42),7),W.M.bamboo); q.position.y=m(.21+k*.42); stalk.add(q); const ring=new THREE.Mesh(new THREE.TorusGeometry(m(.031),m(.006),5,10),W.M.node); ring.rotation.x=Math.PI/2; ring.position.y=m(k*.42); stalk.add(ring); }
      for(let k=0;k<7;k++){ const lf=new THREE.Mesh(blade,W.M.blade); lf.position.set(m((hashN(k,i)-.5)*.5),m(hgt-.2-hashN(k,i+1)*1.4),m((hashN(k,i+2)-.5)*.5)); lf.rotation.set(hashN(k,i+3)*1.2-.6,hashN(k,i+4)*6.28,hashN(k,i+5)*1.2-.6); stalk.add(lf); }
      stalk.rotation.z=lean; stalk.rotation.x=(hashN(i,15)-.5)*.1; stalk.position.set(wx(bx),0,wz(bz)); stalk.traverse(q=>{ if(q.isMesh)q.castShadow=true; }); G.add(stalk); } return G; };
  const bridge=(x,z,ang)=>{ '@later'; const G=new THREE.Group(), wood=W.M.plank; for(let i=0;i<11;i++){ const u=(i-5)/5, p=new THREE.Mesh(new THREE.BoxGeometry(m(1.2),m(.05),m(.26)),wood); p.position.set(0,m(.42-.42*u*u),m(u*1.5)); p.rotation.x=-u*.5; p.castShadow=p.receiveShadow=true; G.add(p); }
    for(const sx of [-1,1])for(let i=0;i<5;i++){ const u=(i-2)/2, post=new THREE.Mesh(new THREE.BoxGeometry(m(.07),m(.5),m(.07)),wood); post.position.set(m(sx*.6),m(.42-.42*u*u+.25),m(u*1.5)); G.add(post); const rail=new THREE.Mesh(new THREE.BoxGeometry(m(.06),m(.06),m(3.2)),wood); rail.position.set(m(sx*.6),m(.42-.42*.5*.5+.5),0); G.add(rail); }
    G.position.set(wx(x),0,wz(z)); G.rotation.y=ang; return G; };
  const koi=()=>{ '@later'; const G=new THREE.Group(), body=new THREE.Mesh(new THREE.SphereGeometry(m(.09),10,7),W.M.koi[Math.floor(rnd()*3)]); body.scale.set(1,.7,2.4); const tail=new THREE.Mesh(new THREE.ConeGeometry(m(.07),m(.18),6),body.material); tail.rotation.x=Math.PI/2; tail.position.z=-m(.3); G.add(body,tail); G.tail=tail; return G; };

  const build=()=>{ '@greens';
    const G=new THREE.Group(); G.name='greens'; scene.add(G); W={G,t:0,anim:[]};
    const grav=gravelTex(); grav.repeat.set(1/30,1/30); grav.offset.set(.5,.5); grav.anisotropy=8;
    const felt=noiseTex(256,[52,110,58],9); felt.repeat.set(2,2); const stoneT=noiseTex(256,[128,128,124],14); stoneT.repeat.set(3,3);
    W.M={ stone:std(0x8d8c86,{roughness:.95,bumpMap:stoneT,bumpScale:.012}), granite:std(0x9a9a94,{roughness:.9,bumpMap:stoneT,bumpScale:.008}), glow:new THREE.MeshBasicMaterial({color:0xffc98a}),
      bark:std(0x4a3626,{roughness:1}), maple:std(0xff5a2a,{roughness:.85,map:leafTex('#ff8a4a','#b8260f'),alphaTest:.5,side:THREE.DoubleSide}), bamboo:std(0x7faa58,{roughness:.75}), node:std(0x4f6b35,{roughness:.9}), blade:std(0x5f9a44,{map:bladeTex(),alphaTest:.5,side:THREE.DoubleSide,roughness:.9}),
      plank:std(0x6b4a2e,{roughness:.9}), koi:[std(0xff7a1e,{roughness:.5}),std(0xf4efe6,{roughness:.5}),std(0xd8401a,{roughness:.5})], felt:std(0xffffff,{roughness:.98,map:felt,side:THREE.DoubleSide}), rail:std(0x4a3524,{roughness:.9}), gravel:std(0xf2eee6,{roughness:1,map:grav,bumpMap:grav,bumpScale:.035}) };
    // the light of dusk: a low warm sun with shadows, a pink-and-blue sky in everything
    const hemi=new THREE.HemisphereLight(0xa9bdb2,0x15201a,1.05), sun=new THREE.DirectionalLight(0xc4d2cb,.85); sun.position.set(wx(-7),m(24),wz(-5)); sun.target.position.set(wx(1),0,wz(1)); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024);
    const sc=sun.shadow.camera; sc.left=sc.bottom=-m(15); sc.right=sc.top=m(15); sc.near=1; sc.far=m(50); sun.shadow.bias=-.0015; G.add(hemi,sun,sun.target); W.sun=sun;
    // the sky and the hills past the garden
    const sky=new THREE.Mesh(new THREE.SphereGeometry(m(140),24,12),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{},vertexShader:'varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader:'varying vec3 vP; void main(){ float y=max(0.0,vP.y); vec3 hz=vec3(.50,.56,.53), mid=vec3(.42,.48,.47), top=vec3(.24,.29,.32); vec3 c=mix(hz,mid,smoothstep(0.0,.2,y)); c=mix(c,top,smoothstep(.15,.75,y)); gl_FragColor=vec4(c,1.0); }'}));
    sky.position.set(wx(0),0,wz(0)); sky.userData.anyRoom=1; G.add(sky);
    { const N=72, ROWS=[[15.5,0,[.07,.13,.09]],[22,.28,[.10,.18,.12]],[30,.62,[.13,.21,.16]],[42,1,[.19,.26,.25]]], hOf=a=>28+Math.pow(Math.sin(a*2.3+.7)*.5+.5,1.6)*18+Math.sin(a*7.1)*2.5, pts=[], col=[], idx=[];
      for(let r=0;r<ROWS.length;r++)for(let i=0;i<=N;i++){ const a=i/N*Math.PI*2, [R,k,c]=ROWS[r], rr=R+hashN(i,r+3)*2.5; pts.push(Math.cos(a)*m(rr),m(hOf(a)*k-(r?0:.8)),Math.sin(a)*m(rr)); col.push(c[0],c[1],c[2]); if(r<ROWS.length-1&&i<N){ const q=r*(N+1)+i; idx.push(q,q+N+1,q+1,q+1,q+N+1,q+N+2); } }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals(); const hills=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); hills.position.set(wx(0),0,wz(0)); hills.userData.anyRoom=1; hills.receiveShadow=true; G.add(hills); W.hillY=(r,a)=>{ let y=0; for(let k=1;k<ROWS.length;k++){ const [R0,k0]=ROWS[k-1], [R1,k1]=ROWS[k]; if(r<=R1){ const u=Math.max(0,(r-R0)/(R1-R0)); return hOf(a)*(k0+(k1-k0)*u); } } return hOf(a); };
      // the jungle on the slopes: canopies and trunks as instances; ferns round the gravel's edge; mist lying on the ground
      const NC=520, can=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,1),new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),NC), trunks=new THREE.InstancedMesh(new THREE.CylinderGeometry(.08,.14,1,6),W.M.bark,200), MM=new THREE.Matrix4(), P=new V3(), Q=new THREE.Quaternion(), SC=new V3(), C=new THREE.Color(), GREENS=[0x1f4a22,0x2a5e2c,0x35733a,0x183d1c,0x2f6b3f];
      let ci=0, ti=0; for(let i=0;i<200;i++){ const a=hashN(i,81)*Math.PI*2, r=12.5+Math.pow(hashN(i,82),.7)*17, y=W.hillY(r,a), sz=(1.3+hashN(i,83)*2.4)*(1+r/30), x=Math.cos(a)*r, z=Math.sin(a)*r;
        if(ti<200){ P.set(wx(x),m(y+sz*.55),wz(z)); SC.set(m(sz*.18),m(sz*1.1),m(sz*.18)); MM.compose(P,Q.identity(),SC); trunks.setMatrixAt(ti++,MM); }
        for(let k=0;k<3&&ci<NC;k++){ const rr=sz*(.55-k*.1); P.set(wx(x+(hashN(i,k+90)-.5)*sz*.8),m(y+sz*(.95+k*.45)),wz(z+(hashN(i,k+95)-.5)*sz*.8)); SC.set(m(rr),m(rr*.7),m(rr)); Q.setFromEuler(new THREE.Euler(0,hashN(i,k)*6,0)); MM.compose(P,Q,SC); can.setMatrixAt(ci,MM); C.setHex(GREENS[(i+k)%GREENS.length]).multiplyScalar(.75+hashN(i,k+7)*.35); can.setColorAt(ci++,C); } }
      can.count=ci; trunks.count=ti; can.castShadow=true; can.receiveShadow=true; G.add(can,trunks);
      const NF=360, fern=new THREE.InstancedMesh(new THREE.PlaneGeometry(m(.22),m(.9)),new THREE.MeshStandardMaterial({map:bladeTex(),alphaTest:.5,side:THREE.DoubleSide,roughness:.9,color:0x6fa15a}),NF);
      for(let i=0;i<NF;i++){ const a=hashN(i,101)*Math.PI*2, r=10.8+hashN(i,102)*6.5, y=W.hillY(r,a), x=Math.cos(a)*r, z=Math.sin(a)*r, sc=.7+hashN(i,103)*.9; P.set(wx(x),m(y+.42*sc),wz(z)); Q.setFromEuler(new THREE.Euler((hashN(i,104)-.5)*.9,hashN(i,105)*6.28,(hashN(i,106)-.5)*.6)); SC.set(sc,sc,sc); MM.compose(P,Q,SC); fern.setMatrixAt(i,MM); } G.add(fern);
      const gf=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(new Array(48*3).fill(0).map((_,i)=>{ const k=(i/3)|0, a=hashN(k,111)*6.28, r=4+hashN(k,112)*12; return i%3===0?wx(Math.cos(a)*r):i%3===1?m(.2+hashN(k,113)*1.2):wz(Math.sin(a)*r); }),3)),new THREE.PointsMaterial({map:softTex(),size:m(7),transparent:true,opacity:.11,depthWrite:false,color:0xc8d4cc})); G.add(gf); W.gfog=gf; }
    const far=new THREE.Mesh(new THREE.CircleGeometry(m(120),48),new THREE.MeshLambertMaterial({color:0x14211a})); far.rotation.x=-Math.PI/2; far.position.set(wx(0),-m(.6),wz(0)); far.userData.anyRoom=1; G.add(far);
    // the raked gravel, with the pond cut out of it
    const POND=[-5.6,4.6,3.3]; { const sh=new THREE.Shape(); sh.moveTo(-15,-15); sh.lineTo(15,-15); sh.lineTo(15,15); sh.lineTo(-15,15); sh.closePath(); const hole=new THREE.Path(); hole.absarc(POND[0],-POND[1],POND[2],0,Math.PI*2,true); sh.holes.push(hole);
      const g=new THREE.ShapeGeometry(sh,24); g.rotateX(-Math.PI/2); g.scale(M,1,M); const gr=new THREE.Mesh(g,W.M.gravel); gr.position.set(wx(0),-m(.005),wz(0)); gr.receiveShadow=true; G.add(gr); }
    // the pond: a dark bed, slow water, koi; the waterfall over the rocks at its back
    { const bed=new THREE.Mesh(new THREE.CircleGeometry(m(POND[2]),40),std(0x1f2d26,{roughness:1})); bed.rotation.x=-Math.PI/2; bed.position.set(wx(POND[0]),-m(.5),wz(POND[1])); G.add(bed);
      const rip=rippleTex(); rip.repeat.set(3,3); const water=new THREE.Mesh(new THREE.CircleGeometry(m(POND[2]-.04),48),new THREE.MeshStandardMaterial({color:0x3d7f86,transparent:true,opacity:.72,roughness:.12,metalness:.05,normalMap:rip,normalScale:new THREE.Vector2(.35,.35)})); water.rotation.x=-Math.PI/2; water.position.set(wx(POND[0]),-m(.1),wz(POND[1])); G.add(water); W.rip=rip;
      for(let i=0;i<24;i++){ const a=i/24*Math.PI*2, r=POND[2]*(.98+hashN(i,21)*.12), b=boulder(.42+hashN(i,22)*.3,i); b.position.set(wx(POND[0]+Math.cos(a)*r),-m(.08),wz(POND[1]+Math.sin(a)*r)); b.rotation.y=hashN(i,23)*6; G.add(b); }
      const FX=POND[0]-.6, FZ=POND[1]+POND[2]-.3; for(let i=0;i<9;i++){ const b=boulder(.8+hashN(i,31)*.5,40+i); b.position.set(wx(FX+(i%3-1)*1.15+(hashN(i,32)-.5)*.3),m(.3+Math.floor(i/3)*.85),wz(FZ+.4+Math.floor(i/3)*.35)); G.add(b); }
      const ft=fallTex(); ft.repeat.set(1,1.4); const fall=new THREE.Mesh(new THREE.PlaneGeometry(m(1.1),m(2.75)),new THREE.MeshBasicMaterial({map:ft,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide})); fall.position.set(wx(FX),m(1.25),wz(FZ+.12)); G.add(fall); W.fall=ft;
      const mist=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(new Array(180).fill(0).map((_,i)=>i%3===1?m(hashN(i,41)*.9):i%3===0?wx(FX+(hashN(i,42)-.5)*1.6):wz(FZ-.2+(hashN(i,43)-.5)*1.0)),3)),new THREE.PointsMaterial({map:softTex(),size:m(.6),transparent:true,opacity:.34,depthWrite:false,color:0xf4fbff})); G.add(mist); W.mist=mist;
      W.fish=[]; for(let i=0;i<5;i++){ const f=koi(); f.userData={r:.7+hashN(i,51)*1.9,a:hashN(i,52)*6.28,w:.18+hashN(i,53)*.14,y:-.18-hashN(i,54)*.14}; G.add(f); W.fish.push(f); }
      W.pond=POND; W.fx=FX; W.fz=FZ; }
    // the stones, the lanterns, the maples, the bamboo, the bridge over the pond's outflow
    STONES.forEach((s,i)=>{ const b=boulder(s[2],i); b.position.set(wx(s[0]),m(s[2]*.25),wz(s[1])); b.rotation.y=hashN(i,61)*6; G.add(b); if(s[2]>.8){ const b2=boulder(s[2]*.5,i+7); b2.position.set(wx(s[0]+s[2]*.9),m(s[2]*.12),wz(s[1]+s[2]*.5)); G.add(b2); } });
    G.add(lantern(-1.4,-4.9),lantern(5.1,5.6)); G.add(maple(-4.2,-6.2,1.0,.3),maple(6.6,-1.6,.85,2.1)); G.add(bamboo(-8.4,-2.4,16),bamboo(7.6,7.2,12)); G.add(bridge(POND[0]+POND[2]+.9,POND[1]-.6,Math.PI/2));
    for(let i=0;i<7;i++){ const p=atS(i/6*LEN), sto=new THREE.Mesh(new THREE.CylinderGeometry(m(.3),m(.33),m(.07),9),W.M.granite); sto.position.set(wx(p.x-1.1),m(.03),wz(p.z+.2)); sto.scale.x=1.25; sto.receiveShadow=true; G.add(sto); }
    // the shishi-odoshi by the pond: it fills, tips and knocks
    { const S=new THREE.Group(), post=new THREE.Mesh(new THREE.CylinderGeometry(m(.03),m(.03),m(.5),7),W.M.bamboo); post.position.y=m(.25); const tube=new THREE.Group(), tb=new THREE.Mesh(new THREE.CylinderGeometry(m(.045),m(.045),m(.9),8),W.M.bamboo); tb.rotation.x=Math.PI/2; tube.add(tb); tube.position.y=m(.5);
      const spout=new THREE.Mesh(new THREE.CylinderGeometry(m(.025),m(.025),m(.7),7),W.M.bamboo); spout.rotation.z=Math.PI/2; spout.position.set(m(.1),m(1.0),m(-.45)); const knock=new THREE.Mesh(new THREE.SphereGeometry(m(.12),8,6),W.M.stone); knock.position.set(0,m(.1),m(.5)); knock.scale.y=.6;
      S.add(post,tube,spout,knock); S.position.set(wx(POND[0]+POND[2]+.5),0,wz(POND[1]+1.4)); S.rotation.y=-.6; G.add(S); W.odoshi={tube,t:0}; }
    // the lane: the felt on the curve, its wooden rail round the edge, the cup, the tee
    { const N=CP.length, A=7, P=[], UVs=[], I=[]; for(let i=0;i<N;i++){ const c=CP[i], q=i<N-1?CP[i+1]:CP[i-1], tx=(q.x-c.x)*(i<N-1?1:-1), tz=(q.z-c.z)*(i<N-1?1:-1), l=Math.hypot(tx,tz)||1, nx=-tz/l, nz=tx/l, y=hOf(SL[i]); for(let k=0;k<A;k++){ const t=(k/(A-1)-.5)*LANEW; P.push(wx(c.x+nx*t),m(y),wz(c.z+nz*t)); UVs.push(SL[i]/.6,k/(A-1)*1.5); if(i<N-1&&k<A-1){ const a=i*A+k; I.push(a,a+A,a+1,a+1,a+A,a+A+1); } } }
      const capAt=(i,dir)=>{ const c=CP[i], q=CP[i+dir], tx=(c.x-q.x), tz=(c.z-q.z), l=Math.hypot(tx,tz)||1, ux=tx/l, uz=tz/l, y=hOf(SL[i]), c0=P.length/3; P.push(wx(c.x),m(y),wz(c.z)); UVs.push(SL[i]/.6,.75); for(let k=0;k<=10;k++){ const a=(k/10-.5)*Math.PI, r=LANEW/2, ex=ux*Math.cos(a)-uz*Math.sin(a), ez=uz*Math.cos(a)+ux*Math.sin(a); P.push(wx(c.x+ex*r),m(y),wz(c.z+ez*r)); UVs.push(SL[i]/.6+Math.cos(a),.75+Math.sin(a)*.75); if(k<10)I.push(c0,c0+1+k+(dir>0?1:0),c0+1+k+(dir>0?0:1)); } };
      capAt(0,1); capAt(N-1,-1);
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(UVs,2)); g.setIndex(I); g.computeVertexNormals(); const lane=new THREE.Mesh(g,W.M.felt); lane.receiveShadow=true; G.add(lane);
      const ring=[]; const off=(i,sgn)=>{ const c=CP[i], q=i<N-1?CP[i+1]:CP[i-1], tx=(q.x-c.x)*(i<N-1?1:-1), tz=(q.z-c.z)*(i<N-1?1:-1), l=Math.hypot(tx,tz)||1; return new V3(wx(c.x+(-tz/l)*sgn*LANEW/2),m(hOf(SL[i])+.03),wz(c.z+(tx/l)*sgn*LANEW/2)); };
      for(let i=0;i<N;i+=2)ring.push(off(i,1)); { const c=CP[N-1], q=CP[N-2], tx=c.x-q.x, tz=c.z-q.z, l=Math.hypot(tx,tz), ux=tx/l, uz=tz/l; for(let k=1;k<6;k++){ const a=(k/6-.5)*Math.PI; ring.push(new V3(wx(c.x+(ux*Math.cos(a)-uz*Math.sin(a))*LANEW/2),m(hOf(LEN)+.03),wz(c.z+(uz*Math.cos(a)+ux*Math.sin(a))*LANEW/2))); } }
      for(let i=N-1;i>=0;i-=2)ring.push(off(i,-1)); { const c=CP[0], q=CP[1], tx=c.x-q.x, tz=c.z-q.z, l=Math.hypot(tx,tz), ux=tx/l, uz=tz/l; for(let k=1;k<6;k++){ const a=(k/6-.5)*Math.PI; ring.push(new V3(wx(c.x+(ux*Math.cos(a)-uz*Math.sin(a))*LANEW/2),m(.03),wz(c.z+(uz*Math.cos(a)+ux*Math.sin(a))*LANEW/2))); } }
      const rail=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ring,true,'centripetal'),320,m(.035),6,true),W.M.rail); rail.castShadow=rail.receiveShadow=true; G.add(rail);
      const cup=new THREE.Mesh(new THREE.CylinderGeometry(m(CUPR),m(CUPR),m(.1),20,1,true),new THREE.MeshStandardMaterial({color:0x101010,side:THREE.BackSide,roughness:1})); cup.position.set(wx(CUP.x),m(hOf(LEN+CUP_S)-.05+.002),wz(CUP.z)); G.add(cup);
      const lip=new THREE.Mesh(new THREE.RingGeometry(m(CUPR),m(CUPR+.012),24),std(0xe8e8e0,{roughness:.6})); lip.rotation.x=-Math.PI/2; lip.position.set(wx(CUP.x),m(hOf(LEN+CUP_S))+.004,wz(CUP.z)); G.add(lip);
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(m(.012),m(.012),m(1.6),6),std(0xe4e4dc,{roughness:.5})); pole.position.set(wx(CUP.x),m(hOf(LEN+CUP_S)+.8),wz(CUP.z)); const flag=new THREE.Mesh(new THREE.PlaneGeometry(m(.36),m(.24)),std(0xd8322a,{side:THREE.DoubleSide,roughness:.8})); flag.position.set(m(.18),m(.65),0); pole.add(flag); G.add(pole); W.flag=pole;
      const tee=new THREE.Mesh(new THREE.CylinderGeometry(m(.12),m(.12),m(.004),16),std(0xf0f0e8,{roughness:.7})); tee.position.set(wx(TEE.x),m(.003),wz(TEE.z)); G.add(tee);
      const ball=new THREE.Mesh(new THREE.SphereGeometry(m(BALLR),14,10),std(0xf6f6f2,{roughness:.45})); ball.castShadow=true; G.add(ball); W.ball=ball;
      const guide=new THREE.Mesh(new THREE.PlaneGeometry(m(.03),m(2.4)),new THREE.MeshBasicMaterial({color:0xfff2c0,transparent:true,opacity:.55,depthWrite:false})); guide.rotation.x=-Math.PI/2; guide.visible=false; G.add(guide); W.guide=guide;
      W.thing={name:'YOUR BALL',obj:ball,reach:1.6*T,near:2.4*T,tall:.3,act:()=>warp()}; UI.thing(W.thing); }
    // blossom on the air
    { const n=220, arr=new Float32Array(n*3), vel=[]; for(let i=0;i<n;i++){ arr[i*3]=wx((hashN(i,71)-.5)*22); arr[i*3+1]=m(hashN(i,72)*7); arr[i*3+2]=wz((hashN(i,73)-.5)*22); vel.push(hashN(i,74)*6.28); }
      const pts=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(arr,3)),new THREE.PointsMaterial({map:petalTex(),size:m(.11),transparent:true,opacity:.9,depthWrite:false,color:0xffd0e0})); G.add(pts); W.petals={pts,arr,vel}; }
    G.traverse(q=>{ if(q.isMesh&&q.material&&q.material.map&&!q.material.map.anisotropy)q.material.map.anisotropy=4; });
    return ROOMS.part(G,()=>{},null); };

  const unbuild=()=>{ '@later'; if(W&&W.thing){ const i=UI.things.indexOf(W.thing); if(i>=0)UI.things.splice(i,1); } const G=W&&W.G; if(G){ G.traverse(c=>{ if(c.geometry)c.geometry.dispose(); if(c.material){ for(const mt of [].concat(c.material)){ for(const k of ['map','bumpMap','normalMap'])if(mt[k])mt[k].dispose(); mt.dispose(); } } }); G.removeFromParent(); }
    if(scene.fog===FG)scene.fog=null; if(savedGY){ SHARED.groundY=savedGY; savedGY=null; } if(savedView&&UI.setView){ UI.setView(savedView); savedView=null; } if(keyoff){ keyoff(); keyoff=null; } if(amb){ try{ amb.s.stop(); }catch(e){} amb=null; } W=null; };
  ROOMS.off.greens={name:'THE GREENS',noCeil:1,box:{x0:WX-m(150),z0:WZ-m(150),x1:WX+m(150),z1:WZ+m(150),y0:-3,y1:m(150)},spawn:[wx(TEE.x),wz(TEE.z-1.2),0,0],out:[wx(TEE.x),wz(TEE.z-1.2),0,0],need:()=>window.LOAD?LOAD('greens'):Promise.resolve(),build,unbuild};

  /* ---------- the card: hole, par, strokes, your best; the power bar while you draw back ---------- */
  const card=()=>{ '@later'; if(!D)return; let c=document.getElementById('greensc'); if(!c){ c=document.createElement('div'); c.id='greensc'; c.style.cssText='position:fixed;right:16px;bottom:16px;z-index:20;padding:8px 12px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;min-width:150px;zoom:var(--uiz,1)'; document.body.appendChild(c); }
    c.hidden=false; const b=D.best; c.innerHTML='<div style="color:#f2c14e">THE GREENS · THE ZEN GARDEN</div><div>HOLE 1 · PAR '+PAR+' · STROKES <b>'+D.strokes+'</b></div><div style="color:#9b9584">BEST '+(b==null?'—':b)+' · ROUNDS '+D.rounds+'</div><div id="greenspw" style="margin-top:6px;height:6px;background:#1a1d26;border:1px solid #3a3f4e;display:none"><div style="height:100%;width:0;background:#7dffa4"></div></div>'; if(UI.menuLook)UI.menuLook(); };
  const cardOff=()=>{ const c=document.getElementById('greensc'); if(c)c.hidden=true; };

  /* ---------- the program ---------- */
  H.programs.push({ name:'THE GREENS', skill:'golf', cost:COST, offWorld:true, room:'greens', tool:'putter',
    intro:'THE GREENS. A ZEN GARDEN DEEP IN A FOGGY VALLEY, ONE HOLE, PAR '+PAR+'. WALK TO YOUR BALL (OR PRESS F). THE MOUSE AIMS, HOLD THE BUTTON TO DRAW BACK, LET GO TO PUTT. ON A PAD: D-PAD LEFT WALKS TO THE BALL, THE RIGHT STICK AIMS, HOLD RT AND LET GO, D-PAD DOWN TAKES IT BACK. IN THE HEADSET, SWING; YOUR PUTTER HAND\'S TRIGGER WALKS TO THE BALL, B TAKES IT BACK.',
    go:R=>{ '@later'; const d=D=Object.assign(R,{strokes:0,rounds:0,done:false,addr:false,aimA:0,charge:null,swing:null,best:null,ready:false,prevTip:null,cool:0}); try{ const S=JSON.parse(OWNED.get('greens')||'{}'); D.best=S&&S.best?S.best.zen:null; }catch(e){}
      if(!ROOMS.enterAt)return; place(TEE.x,TEE.z);
      ROOMS.enterAt('greens',[wx(TEE.x),wz(TEE.z-1.2),0,0]).then(()=>{ if(D!==d)return;
        savedView=UI.view; if(UI.setView&&UI.view==='iso')UI.setView('follow'); savedGY=SHARED.groundY; SHARED.groundY=(x,z)=>{ const q=near((x-WX)/M,(z-WZ)/M); return q.d<LANEW/2?m(hOf(q.s)):0; };
        pos.x=wx(TEE.x); pos.z=wz(TEE.z-1.2); SHARED.py=0; SHARED.heading=0; SHARED.target=null;
        const onkey=e=>{ if(!D||!D.ready)return; const k=(e.key||'').toLowerCase(); if(k==='f'&&!e.repeat&&B.rest&&!D.done){ warp(); e.stopPropagation(); } };
        addEventListener('keydown',onkey,true); const cv=renderer.domElement; cv.addEventListener('pointermove',onMove); cv.addEventListener('pointerdown',onDown,true); addEventListener('pointerup',onUp,true);
        keyoff=()=>{ removeEventListener('keydown',onkey,true); cv.removeEventListener('pointermove',onMove); cv.removeEventListener('pointerdown',onDown,true); removeEventListener('pointerup',onUp,true); };
        amb=SFX.play('rain',{vol:.05}); d.ready=true; card(); }); },
    run:(R,dt)=>{ '@later'; if(!D||!D.ready||!W)return; dt=Math.min(dt||1/60,.1); W.t+=dt;
      // the garden breathes: water, fall, mist, koi, petals, the knocking bamboo, the flag
      if(W.rip){ W.rip.offset.x+=dt*.012; W.rip.offset.y+=dt*.008; } if(W.fall)W.fall.offset.y-=dt*.9;
      if(W.mist){ const a=W.mist.geometry.attributes.position; for(let i=0;i<a.count;i++){ let y=a.getY(i)+dt*m(.25); if(y>m(1.1))y=0; a.setY(i,y); } a.needsUpdate=true; }
      for(const f of W.fish){ const u=f.userData; u.a+=u.w*dt; const P=W.pond; f.position.set(wx(P[0]+Math.cos(u.a)*u.r),m(u.y),wz(P[1]+Math.sin(u.a)*u.r)); f.rotation.y=-u.a; f.tail.rotation.y=Math.sin(W.t*6+u.r)*.5; }
      if(W.petals){ const {arr,vel,pts}=W.petals; for(let i=0;i<arr.length/3;i++){ arr[i*3+1]-=dt*m(.22); arr[i*3]+=Math.sin(W.t*.8+vel[i])*dt*m(.3); arr[i*3+2]+=Math.cos(W.t*.6+vel[i])*dt*m(.2); if(arr[i*3+1]<0){ arr[i*3+1]=m(6+hashN(i,W.t)*2); arr[i*3]=wx((hashN(i,W.t*3)-.5)*22); arr[i*3+2]=wz((hashN(i,W.t*7)-.5)*22); } } pts.geometry.attributes.position.needsUpdate=true; }
      if(W.odoshi){ const o=W.odoshi; o.t+=dt; const c=o.t%7.5, a=c<5.2?0:c<5.6?-(c-5.2)/.4*.55:c<6.1?-.55+(c-5.6)/.5*.55:0; o.tube.rotation.x=a; if(c>=5.6&&!o.knocked){ o.knocked=true; SFX.play('clunk',{vol:.35,pitch:.75}); } if(c<5)o.knocked=false; }
      if(W.flag)W.flag.children[0].rotation.y=Math.sin(W.t*2.1)*.12;
      renderer.shadowMap.needsUpdate=true;
      { const cam=SHARED.cam; if(cam){ const d=Math.max(0,-FV.set(pos.x,SHARED.py,pos.z).applyMatrix4(cam.matrixWorldInverse).z); FG.near=d+m(5); FG.far=d+m(52); scene.fog=FG; } }
      if(W.gfog){ const a=W.gfog.geometry.attributes.position; for(let i=0;i<a.count;i++)a.setX(i,a.getX(i)+Math.sin(W.t*.15+i)*dt*m(.12)); a.needsUpdate=true; }
      // the ball
      stepBall(dt); const h=hOf(near(B.x,B.z).s); W.ball.position.set(wx(B.x),m(h+BALLR)-B.sink*m(.09),wz(B.z)); if(!B.rest){ const sp=Math.hypot(B.vx,B.vz); if(sp>1e-4){ const ax=new V3(B.vz,0,-B.vx).normalize(); W.ball.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(ax,sp*dt/BALLR)); } }
      padStep(dt);
      // on screen: standing by the ball addresses it; the mouse aims; the held button draws back; a swing animates the putter
      if(!VR.on){ if(D.addr&&(!nearBall()||WIELD.on!=='putter'||!B.rest))D.addr=false; if(!D.addr&&nearBall()&&B.rest&&!D.done&&WIELD.on==='putter'&&!SHARED.target&&!(st&&st.move)){ D.addr=true; D.aimA=Math.atan2(CUP.x-B.x,CUP.z-B.z); }
        if(D.addr&&ms.x>=0){ const r=renderer.domElement.getBoundingClientRect(), nx=(ms.x-r.left)/r.width*2-1; D.aimA=SHARED.heading+nx*.9; }
        W.guide.visible=D.addr&&B.rest; if(W.guide.visible){ const [ux,uz]=aimDir(); W.guide.position.set(wx(B.x+ux*1.2),m(h)+.006,wz(B.z+uz*1.2)); W.guide.rotation.z=-D.aimA; }
        const pw=document.getElementById('greenspw'); if(D.charge){ D.charge.t+=dt; if(pw){ pw.style.display='block'; pw.firstChild.style.width=Math.round(power(D.charge.t)*100)+'%'; } } else if(pw&&pw.style.display!=='none')pw.style.display='none';
        let a=0; if(D.charge)a=-.25-power(D.charge.t)*.75; else if(D.swing){ D.swing.t+=dt; const u=Math.min(1,D.swing.t/.32); a=-.9+1.5*Math.sin(u*Math.PI/2); if(u>=1)D.swing=null; } for(const g of KIND.gs)g.arm.rotation.x+=(a-g.arm.rotation.x)*Math.min(1,dt*(D.swing?30:12)); }
      // in the headset: the putter head is the controller's; a moving head through the ball is the stroke
      else { W.guide.visible=false; D.cool-=dt; if(WIELD.on==='putter'&&WIELD.tip.lengthSq()>0&&B.rest&&!D.done){ const tip=WIELD.tip, p=new V3((tip.x-WX)/M,tip.y/M,(tip.z-WZ)/M), pv=D.prevTip; D.prevTip=p;
          if(pv&&D.cool<=0){ const v=new V3().subVectors(p,pv).divideScalar(dt), sp=Math.hypot(v.x,v.z), bh=hOf(near(B.x,B.z).s)+BALLR, d=new V3().subVectors(p,pv), L=d.lengthSq(), bp=new V3(B.x,bh,B.z), u=L>1e-9?Math.max(0,Math.min(1,bp.clone().sub(pv).dot(d)/L)):0, cl=pv.clone().addScaledVector(d,u);
            if(cl.distanceTo(bp)<HEADR+BALLR&&sp>.35){ D.cool=.5; hit(v.x,v.z,sp*1.25); } } } else D.prevTip=null; } },
    hide:()=>{ '@later'; if(!D)return; D=null; cardOff(); if(scene.fog===FG)scene.fog=null; const off=ROOMS.offIn&&ROOMS.offIn()==='greens', Hl=H.hall;
      if(savedGY){ SHARED.groundY=savedGY; savedGY=null; } if(savedView&&UI.setView){ UI.setView(savedView); savedView=null; } if(keyoff){ keyoff(); keyoff=null; } if(amb){ try{ amb.s.stop(); }catch(e){} amb=null; }
      if(off&&Hl&&ROOMS.enterAt)ROOMS.enterAt('arcade',[Hl.x,Hl.z,0,Math.PI]); else if(ROOMS.lazy&&ROOMS.lazy.greens&&ROOMS.lazy.greens.drop)ROOMS.lazy.greens.drop(); } });
  window.GREENS={putt:(ang,speed)=>hit(Math.sin(ang),Math.cos(ang),speed),toCup:()=>{ const q=near(B.x,B.z); return {ang:Math.atan2(CUP.x-B.x,CUP.z-B.z),d:Math.hypot(CUP.x-B.x,CUP.z-B.z),s:q.s,len:LEN}; },warp,place:(x,z)=>place(x,z),cup:CUP,tee:TEE};
  window.GREENSDBG=()=>({on:!!D,ready:!!(D&&D.ready),strokes:D?D.strokes:0,rounds:D?D.rounds:0,done:!!(D&&D.done),addr:!!(D&&D.addr),best:D?D.best:null,ball:[+B.x.toFixed(3),+B.z.toFixed(3)],rest:B.rest,inCup:B.inCup,speed:+Math.hypot(B.vx,B.vz).toFixed(3),built:!!W,meshes:W?W.G.children.length:0,tool:WIELD.on,saved:(()=>{ try{ return JSON.parse(OWNED.get('greens')||'{}'); }catch(e){ return null; } })()}); }
