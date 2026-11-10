// THE CARS' WORKING PARTS: what a car's model carries beyond its body (data/cars.json parts and marks, tools/cruiser-bake.py): doors, a hood and a trunk lid that open on their hinges (double-click one), lamps lit by name, the horn (H), and the police cruiser's kit: the roof's light bar with its turning red, white and blue beacons (B), the siren (N), its shield and plates (no words), the radio car's equipment inside. A car's state is one shared word (cst:<car> = "bits.honks"), so everyone sees and hears the same.
import {SHARED, THREE} from './003-shx.js';
import {CARX, CLOCK, keys, ONLINE, pos, RIDE, SFX, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS, TILE} from './006-map-pre.js';
{ const T=TILE, M0=T/.84, say=(t,c)=>SAY(t,c||'#e8e2cc');
  const BIT={'DOOR FL':1,'DOOR FR':2,'DOOR RL':4,'DOOR RR':8,TRUNK:16,HOOD:32,bar:64,siren:128,head:256}, DOORS=15;
  const NAME={'DOOR FL':'DRIVER\'S DOOR','DOOR FR':'PASSENGER DOOR','DOOR RL':'REAR DOOR','DOOR RR':'REAR DOOR',TRUNK:'TRUNK',HOOD:'HOOD'};
  const PX=new WeakMap(), ALL=[], CP={};
  const cars=()=>window.CARS, mineC=()=>(cars()&&cars().driving)||null, dataOf=m=>{ const d=cars()&&cars().data&&cars().data(); return d&&d.cars[m]; };
  const read=C=>{ const v=String((ONLINE.world||{})['cst:'+C.id]||'0').split('.'); return {b:+v[0]|0,h:+v[1]|0}; };
  const write=(C,b,h)=>ONLINE.put('cst:'+C.id,(b|0)+'.'+(h|0));
  const where=C=>{ if(C===mineC())return null; const o=C.by&&ONLINE.others&&ONLINE.others.get(C.by), g=o&&o.fig&&o.fig.g; return g?{x:g.position.x,z:g.position.z}:{x:C.x,z:C.z}; };
  const snd=(k,C,o)=>{ if(!SFX.play)return; const at=where(C); SFX.play(k,at?{...o,at,far:(o.far||30)*T}:o); };
  CP.toggle=(C,k)=>{ const s=read(C), b=BIT[k]; if(!b)return; const on=!(s.b&b); write(C,s.b^b,s.h); if(b<64)snd(on?'latch':'door',C,{vol:.6}); return on; };
  CP.honk=C=>{ const s=read(C); write(C,s.b,(s.h+1)%1000); snd('horn',C,{vol:.9,far:45}); };
  CP.bits=C=>read(C).b; CP.BIT=BIT;

  /* ---------- what is painted on: each picture made once, shared by every copy ---------- */
  const TEX={};
  const cv=(k,w,h,f)=>{ if(TEX[k])return TEX[k]; const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); f(g,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return TEX[k]=t; };
  const shield=(g,x,y,s)=>{ g.beginPath(); g.moveTo(x-s*.42,y-s*.5); g.lineTo(x+s*.42,y-s*.5); g.lineTo(x+s*.42,y+s*.05); g.quadraticCurveTo(x+s*.4,y+s*.38,x,y+s*.5); g.quadraticCurveTo(x-s*.4,y+s*.38,x-s*.42,y+s*.05); g.closePath(); };
  // no words on anything (owner, 10 Nov 2026): a plain shield on the front doors, blank plates
  const PIC={
    door:()=>cv('door',180,180,(g,w,h)=>{ shield(g,w/2,h/2,150); g.fillStyle='#1d3f8a'; g.fill(); g.lineWidth=7; g.strokeStyle='#e9c44a'; g.stroke(); shield(g,w/2,h/2,112); g.lineWidth=2; g.strokeStyle='#f4f1e6'; g.stroke(); g.fillStyle='#e9c44a'; g.beginPath(); for(let i=0;i<10;i++){ const a=Math.PI*i/5-Math.PI/2, r=i%2?13:32; g.lineTo(w/2+Math.cos(a)*r,h/2-6+Math.sin(a)*r); } g.fill(); }),
    star:()=>cv('star',128,128,(g,w,h)=>{ g.translate(w/2,h/2); g.fillStyle='#1d4f9c'; for(let i=0;i<3;i++){ g.rotate(Math.PI/3); g.fillRect(-17,-58,34,116); } g.fillStyle='#f4f1e6'; g.fillRect(-4,-30,8,60); }),
    plate:()=>cv('plate',256,130,(g,w,h)=>{ g.fillStyle='#f0a81c'; g.fillRect(0,0,w,h); g.strokeStyle='#17306e'; g.lineWidth=6; g.strokeRect(7,7,w-14,h-14); g.fillStyle='#b9bdc4'; for(const [x,y] of [[40,22],[216,22],[40,108],[216,108]]){ g.beginPath(); g.arc(x,y,6,0,7); g.fill(); } })};
  const ROT={f:[0,0],b:[0,Math.PI],l:[0,Math.PI/2],r:[0,-Math.PI/2],u:[-Math.PI/2,Math.PI]};
  const decals=(D,G,PT)=>{ for(const d of D.marks.decals||[]){ const k=d.k; if(!PIC[k])continue;
      const me=new THREE.Mesh(new THREE.PlaneGeometry(d.w,d.h),new THREE.MeshLambertMaterial({map:PIC[k](),transparent:k!=='plate',polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,depthWrite:k==='plate'}));
      const r=ROT[d.f]; me.rotation.order='YXZ'; me.rotation.set(r[0]-(d.tilt||0),r[1],0); me.position.set(d.at[0],d.at[1],d.at[2]); me.name='MARK'; me.userData.mark=1;
      const P=d.on&&PT[d.on]; if(P){ me.position.sub(P.position); P.add(me); } else G.add(me); } };

  /* ---------- the light bar: a black bar across the roof, a red, a clear and a blue plastic dome, in each a lamp and mirror that turn ---------- */
  let GLOW=null, FAN=null;
  const glowT=()=>GLOW||(GLOW=cv('glow',64,64,(g)=>{ const r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(.25,'rgba(255,255,255,.55)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,64,64); }));
  const fanT=()=>FAN||(FAN=cv('fan',64,64,(g)=>{ const r=g.createLinearGradient(0,0,64,0); r.addColorStop(0,'rgba(255,255,255,.9)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.beginPath(); g.moveTo(0,28); g.lineTo(64,4); g.lineTo(64,60); g.lineTo(0,36); g.fill(); }));
  const COL=[[0xff2416,1],[0xf4f6ff,0],[0x1c56ff,-1]];
  const bar=(G,M,cols)=>{ const g=new THREE.Group(), W=M[3], mB=new THREE.MeshLambertMaterial({color:0x17181b}), mC=new THREE.MeshLambertMaterial({color:0xc6cbd2}); g.name='LIGHT BAR'; g.position.set(M[0],M[1],M[2]); G.add(g);
    const bx=(w,h,d,m,x,y,z)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); me.position.set(x,y,z); me.castShadow=true; g.add(me); return me; };
    for(const sd of [-1,1]){ bx(.05,.06,.3,mC,sd*W*.46,.005,0); bx(.09,.02,.06,mC,sd*(W*.46+.04),-.02,0); } bx(W,.03,.3,mB,0,.045,0); bx(W+.02,.012,.31,mC,0,.064,0);
    for(const x of [-W/6,W/6])bx(.012,.13,.27,mB,x,.13,0);   // the dividers between the domes
    const b={g,rot:[],dome:[],spr:[],fan:[],wash:null,ph:Math.random()*6}, dw=W/3-.014;
    (cols?cols.map((c,i)=>[c,1-i]):COL).forEach(([c,sd],i)=>{ const x=sd*W/3, col=new THREE.Color(c);
      const dome=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,dw,18,1).rotateZ(Math.PI/2).scale(1,.5,.92),new THREE.MeshStandardMaterial({color:c,transparent:true,opacity:i===1?.38:.62,roughness:.18,metalness:0,emissive:col,emissiveIntensity:0,depthWrite:false,side:THREE.DoubleSide}));
      dome.position.set(x,.135,0); dome.renderOrder=3; dome.name='DOME'; g.add(dome); b.dome.push(dome);
      const r=new THREE.Group(); r.position.set(x,.115,0); g.add(r); b.rot.push(r);
      const base=new THREE.Mesh(new THREE.CylinderGeometry(.05,.055,.03,12),mC); base.position.y=-.035; r.add(base);
      const bulb=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),new THREE.MeshBasicMaterial({color:0xfff6d8})); r.add(bulb);
      const mir=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.075,10,1,true,Math.PI*.6,Math.PI*.8),new THREE.MeshLambertMaterial({color:0xdfe4ea,side:THREE.DoubleSide})); r.add(mir);
      const fan=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.5).translate(.75,0,0),new THREE.MeshBasicMaterial({map:fanT(),color:c,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false})); fan.rotation.x=-Math.PI/2; fan.renderOrder=4; fan.visible=false; r.add(fan); b.fan.push(fan);
      const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT(),color:c,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false})); sp.position.set(x,.14,0); sp.scale.setScalar(.01); sp.visible=false; sp.renderOrder=5; g.add(sp); b.spr.push(sp); });
    // the colour thrown on the road round the car
    const wash=new THREE.Mesh(new THREE.PlaneGeometry(9,9),new THREE.MeshBasicMaterial({map:glowT(),transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false})); wash.rotation.x=-Math.PI/2; wash.position.set(0,.04-M[1],0); wash.visible=false; wash.renderOrder=1; g.add(wash); b.wash=wash;
    g.traverse(o=>{ o.userData.mark=1; }); return b; };

  // a taxi's roof lamp: an amber glass capsule on a chrome foot, lit while the cab is free (no one driving it)
  const lamp=(G,M)=>{ const g=new THREE.Group(), mC=new THREE.MeshLambertMaterial({color:0xc6cbd2}); g.name='ROOF LAMP'; g.position.set(M[0],M[1],M[2]); G.add(g);
    const foot=new THREE.Mesh(new THREE.BoxGeometry(M[3]*.8,.03,.14),mC); foot.position.y=.015; g.add(foot);
    const cap=new THREE.Mesh(new THREE.CapsuleGeometry(.075,M[3]-.15,6,14).rotateZ(Math.PI/2),new THREE.MeshStandardMaterial({color:0xffc024,emissive:0xffb010,emissiveIntensity:1,roughness:.25,transparent:true,opacity:.92})); cap.position.y=.105; g.add(cap);
    for(const sd of [-1,1]){ const e=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.03,14).rotateZ(Math.PI/2),mC); e.position.set(sd*(M[3]/2-.06),.105,0); g.add(e); } g.traverse(o=>{ o.userData.mark=1; }); return cap; };
  /* ---------- a car made: its parts' hinges, its lamps, its marks ---------- */
  CARX.build=(model,D,G,PT)=>{ if(!D.marks&&!(D.parts&&D.parts.length))return; const px={D,PT,P:{},cur:{},lamps:{head:[],tail:[],turn:[],rev:[]},bar:null,t:0,fr:-1};
    for(const p of D.parts||[])px.P[p.n]=p; G.traverse(o=>{ const t=o.isMesh&&o.userData.t; if(t&&px.lamps[t])px.lamps[t].push(o); });
    if(D.marks){ decals(D,G,PT); if(D.marks.bar)px.bar=bar(G,D.marks.bar,D.marks.barcols); if(D.marks.lamp)px.lamp=lamp(G,D.marks.lamp); } PX.set(G,px); ALL.push(G); lampsOf(px,0,0,0); };
  const LV={head:[.1,1.7],tail:[.12,.8,2.2],turn:[.08,.7],rev:[.04,1.6]};
  const lampsOf=(px,on,brake,back)=>{ const L=px.lamps; for(const m of L.head)m.material.emissiveIntensity=LV.head[on?1:0]; for(const m of L.turn)m.material.emissiveIntensity=LV.turn[on?1:0];
    for(const m of L.tail)m.material.emissiveIntensity=brake?LV.tail[2]:LV.tail[on?1:0]; for(const m of L.rev)m.material.emissiveIntensity=LV.rev[back?1:0]; };
  const CW=new THREE.Vector3(), BW=new THREE.Vector3(), ease=t=>t*t*(3-2*t); let FR=0, NIGHT=false;
  // a car's mesh brought to its state: parts eased open or shut, lamps, the beacons turning; o: {mine, brake, back}
  const live=(G,bits,o)=>{ const px=PX.get(G); if(!px)return; const now=performance.now()/1000, dt=Math.min(.1,Math.max(0,now-px.t)); px.t=now; px.fr=FR;
    for(const n in px.PT){ const p=px.P[n], want=bits&BIT[n]?1:0; let c=px.cur[n]||0; if(c!==want){ c+=Math.max(-dt*2.4,Math.min(dt*2.4,want-c)); px.cur[n]=c; px.PT[n].rotation[p.ax]=p.open*ease(c); } }
    lampsOf(px,NIGHT||!!(bits&BIT.head),o&&o.brake,o&&o.back); if(px.lamp)px.lamp.material.emissiveIntensity=o&&o.busy?.08:NIGHT?1.6:.9;
    const b=px.bar; if(!b)return; const on=!!(bits&BIT.bar); if(!on&&!b.on)return; b.on=on;
    let ca=0, far=1; if(on&&SHARED.cam){ G.updateWorldMatrix(true,false); b.g.getWorldPosition(BW); SHARED.cam.getWorldPosition(CW); ca=Math.atan2(CW.x-BW.x,CW.z-BW.z)-G.rotation.y; far=Math.min(1,Math.max(.25,CW.distanceTo(BW)/(30*M0))); }
    let wr=0, wg=0, wb=0;
    b.rot.forEach((r,i)=>{ const a=b.ph+now*(i===1?-11:9.5)+i*2.1; r.rotation.y=a; const d=Math.cos(a+Math.PI/2-ca), f=on?Math.pow(Math.max(0,d),10):0, dm=b.dome[i], sp=b.spr[i], fn=b.fan[i];
      dm.material.emissiveIntensity=on?.5+1.6*f:0; fn.visible=on; fn.material.opacity=on?(NIGHT?.34:.12):0; sp.visible=on; sp.material.opacity=on?.25+.75*f:0; sp.scale.setScalar(on?(.28+1.5*f)*(NIGHT?1.5:1)*(.6+far):.01);
      const k=on?Math.pow(.5+.5*Math.sin(a*.5+i*Math.PI/2),3)*(i===1?.25:1):0, c=dm.material.color; wr+=c.r*k; wg+=c.g*k; wb+=c.b*k; });
    b.wash.visible=on; if(on){ b.wash.material.color.setRGB(wr,wg,wb); b.wash.material.opacity=NIGHT?.42:.05; } };
  CARX.place=(model,m,mine)=>{ if(!PX.has(m))return; let C=mine; if(!C){ const me=ONLINE.me; for(const q of cars().cars.values())if(q.model===model&&q.by&&q.by!==me){ C=q; break; } }
    const mv=mine&&RIDE.on, S=keys.has('s')||keys.has('arrowdown'), W=keys.has('w')||keys.has('arrowup'), v=RIDE.v||0;
    live(m,C?read(C).b&~DOORS:0,mine?{brake:mv&&S&&v>.2*T,back:mv&&S&&v<=.2*T&&!W,busy:1}:{busy:1});
    const cb=mine&&m.userData.cab; if(cb&&cb.ped){ cb.ped[0].rotation.x=-.9+(W?.3:0); cb.ped[1].rotation.x=-.9+(S?.3:0); } };

  /* ---------- the parts you double-click on a parked car: the driver's door lets you in, the rest open and shut ---------- */
  CARX.things=(C,D)=>{ const px=PX.get(C.mesh); if(!px)return; const M1=C.mesh.scale.x;
    for(const p of D.parts||[]){ const o=px.PT[p.n]; if(!o)continue; const lid=p.use!=='door';
      UI.thing({name:NAME[p.n]||p.n,obj:o,car:C,reach:(lid?3:2.3)*M1,near:(lid?4:3.2)*M1,tall:1.2*M1,act:()=>{ if(p.seat&&!(read(C).b&BIT[p.n])){ cars().getIn(C.id); return; } const on=CP.toggle(C,p.n); say('YOU '+(on?'OPEN':'SHUT')+' THE '+(NAME[p.n]||p.n)+'.'); }}); } };

  /* ---------- the radio car's kit inside: the cage behind the front seat, the two-way radio and its microphone, the siren and lights box, a clipboard, the dome lamp ---------- */
  CARX.cabin=(model,g,o)=>{ const D=dataOf(model); if(!D||!D.marks)return;
    if(D.marks.lamp){ const L=c=>new THREE.MeshLambertMaterial({color:c}); o.bx(.13,.1,.09,L(0x1c1d21),-.02,o.belt+.03,o.dashB+.06); const f=new THREE.Mesh(new THREE.PlaneGeometry(.1,.04),new THREE.MeshBasicMaterial({color:0xff5a2a})); f.position.set(-.02,o.belt+.045,o.dashB+.014); f.rotation.y=Math.PI; g.add(f); for(let i=0;i<3;i++)o.bx(.016,.012,.01,o.mChrome,-.055+i*.035,o.belt+.0,o.dashB+.012); return; }
    if(D.marks.kit==='amb'){ const L=c=>new THREE.MeshLambertMaterial({color:c}), mW=L(0xe9ebe8), mB=L(0x35506e), z0=o.seatZ-.75, z1=o.zr+.15, zc=(z0+z1)/2, len=z0-z1;   // the bay behind the seats: a stretcher on its legs, the attendant's bench, a cabinet, oxygen
      o.bx(o.hw*2-.06,o.roof-o.fl-.15,.04,mW,0,(o.roof+o.fl)/2,z0+.2); o.bx(.62,.06,len*.86,o.mChrome,-.38,o.fl+.5,zc); o.bx(.58,.1,len*.82,mW,-.38,o.fl+.58,zc); o.bx(.5,.07,.3,mB,-.38,o.fl+.67,z0-.3); for(const dz of [-.36,.36])for(const dx of [-.24,.24])o.bx(.03,.46,.03,o.mChrome,-.38+dx,o.fl+.25,zc+dz*len);
      o.bx(.4,.42,len*.7,mB,o.hw-.26,o.fl+.23,zc); o.bx(.34,.8,.5,mW,o.hw-.22,o.roof-.5,z1+.3); for(let i=0;i<3;i++)o.bx(.02,.03,.12,o.mChrome,o.hw-.4,o.roof-.3-i*.22,z1+.3);
      { const b=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.6,12),L(0x2f8a4a)); b.position.set(o.hw-.2,o.fl+.74,z0-.2); g.add(b); const c=new THREE.Mesh(new THREE.CylinderGeometry(.03,.05,.08,8),o.mChrome); c.position.set(o.hw-.2,o.fl+1.08,z0-.2); g.add(c); } return; }
    if(!D.marks.bar)return; const L=c=>new THREE.MeshLambertMaterial({color:c}), mSteel=L(0x5d636c), mBlack=L(0x15161a), mPaper=L(0xe8e4d4), bx=o.bx, zc=o.seatZ-.42;
    bx(o.hw*2-.04,.5,.02,mSteel,0,o.fl+.3,zc); for(const x of [-o.hw+.04,0,o.hw-.04])bx(.03,o.roof-.1-o.fl,.03,mSteel,x,(o.roof-.1+o.fl)/2,zc); bx(o.hw*2-.04,.03,.03,mSteel,0,o.roof-.11,zc);
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(o.hw*2-.08,o.roof-.12-o.fl-.55),new THREE.MeshBasicMaterial({color:0x0c0d10,transparent:true,opacity:.34,side:THREE.DoubleSide,depthWrite:false})); mesh.position.set(0,(o.roof-.12+o.fl+.55)/2,zc); g.add(mesh);
    for(let i=1;i<6;i++)bx(o.hw*2-.08,.006,.008,mSteel,0,o.fl+.55+i*(o.roof-.12-o.fl-.55)/6,zc);
    const y=o.belt-.29, z=o.dashB-.07; bx(.21,.065,.17,mBlack,-.04,y,z); bx(.19,.045,.004,o.mChrome,-.04,y,z-.087); for(const dx of [-.07,.07]){ const k=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.02,8).rotateX(Math.PI/2),mBlack); k.position.set(-.04+dx,y,z-.097); g.add(k); }
    const led=new THREE.Mesh(new THREE.BoxGeometry(.012,.008,.004),new THREE.MeshBasicMaterial({color:0xff3a22})); led.position.set(-.04,y+.012,z-.09); g.add(led);
    bx(.05,.075,.03,mBlack,.13,o.belt-.2,o.dashB-.02); bx(.008,.16,.008,mBlack,.11,o.belt-.3,o.dashB-.03,.5);   // the microphone on its clip, its cord
    bx(.15,.05,.12,o.mChrome,-.26,y+.01,z+.01); for(let i=0;i<3;i++)bx(.008,.022,.008,mBlack,-.3+i*.03,y+.045,z-.02); { const k=new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,.02,10),mBlack); k.position.set(-.21,y+.045,z-.02); g.add(k); }
    bx(.23,.012,.31,mPaper,-o.drv,o.fl+.118,o.seatZ+.04); bx(.1,.02,.03,o.mChrome,-o.drv,o.fl+.13,o.seatZ+.18);
    const dome=new THREE.Mesh(new THREE.BoxGeometry(.12,.02,.07),new THREE.MeshBasicMaterial({color:0xd8d2b8})); dome.position.set(0,o.roof-.105,o.seatZ+.1); g.add(dome); };

  /* ---------- driving: H the horn, and where the car has them L its lamps, B the light bar, N the siren ---------- */
  const BTN='font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 6px;cursor:pointer;white-space:nowrap';
  const ROW=document.createElement('span'); ROW.style.cssText='display:flex;gap:6px'; ROW.innerHTML='<button data-h style="'+BTN+'">HORN H</button><button data-l style="'+BTN+'">LAMPS L</button><button data-b style="'+BTN+'">LIGHTS B</button><button data-n style="'+BTN+'">SIREN N</button>';
  const press=k=>{ const C=mineC(); if(!C)return false; const D=dataOf(C.model)||{}, M=D.marks; if(k==='h'){ CP.honk(C); return true; } if(!M)return false;
    if(k==='l'){ say(CP.toggle(C,'head')?'LAMPS ON.':'LAMPS OFF.'); return true; } if(!M.bar)return false;
    if(k==='b'){ say(CP.toggle(C,'bar')?'THE ROOF LIGHTS TURN.':'ROOF LIGHTS OFF.'); return true; } if(k==='n'){ say(CP.toggle(C,'siren')?'SIREN ON.':'SIREN OFF.'); return true; } return false; };
  for(const k of ['h','l','b','n'])ROW.querySelector('[data-'+k+']').onclick=()=>press(k);
  addEventListener('keydown',e=>{ if(e.repeat||/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||''))return; const k=(e.key||'').toLowerCase(); if('hlbn'.includes(k)&&k.length===1&&press(k))e.preventDefault(); });

  /* ---------- each frame: parked cars near you brought to their state, the siren's wail, what others did heard ---------- */
  let last=null, hudFor=null; const SEEN={};
  SYS.add('life',()=>{ const K=cars(); if(!K||!K.data||!K.data())return; FR++; NIGHT=!!(CLOCK.dayElev&&CLOCK.dayElev()<1.5); if(K.shine&&FR%30===0)K.shine(Math.max(.18,Math.min(1,(CLOCK.dayElev()+4)/14))); const now=performance.now()/1000, me=mineC();
    if(me!==hudFor){ hudFor=me; const D=me&&dataOf(me.model), M=D&&D.marks; if(me&&K.hud){ if(ROW.parentNode!==K.hud)K.hud.insertBefore(ROW,K.hud.querySelector('[data-r]')); ROW.style.display='flex'; ROW.querySelector('[data-l]').style.display=M?'':'none'; for(const k of ['b','n'])ROW.querySelector('[data-'+k+']').style.display=M&&M.bar?'':'none'; } else ROW.style.display='none'; }
    if(last&&last!==me){ const s=read(last); if(s.b&BIT.siren)write(last,s.b&~BIT.siren,s.h); } if(me&&me!==last){ const s=read(me); if(s.b&DOORS)write(me,s.b&~DOORS,s.h); } last=me;
    for(const C of K.cars.values()){ const s=read(C); if(C.mesh&&C.mesh.visible&&PX.has(C.mesh)&&Math.hypot(C.x-pos.x,C.z-pos.z)<90*T)live(C.mesh,s.b,null);
      if(s.b&BIT.siren&&(C===me||C.by)&&now>(C.sn||0)){ C.sn=now+1.5; snd('siren',C,{vol:C===me?.7:1,far:70}); } }
    for(const G of ALL){ const px=PX.get(G); if(px.fr!==FR&&px.night!==NIGHT){ px.night=NIGHT; lampsOf(px,NIGHT,0,0); } } },'150pe-carparts');
  SYS.add('world',(k,v)=>{ if(typeof k!=='string'||!k.startsWith('cst:'))return; const K=cars(), C=K&&K.cars.get(k.slice(4)); if(!C)return; const s=read(C), p=SEEN[C.id]||{b:0,h:s.h}; SEEN[C.id]=s; if(C===mineC()||C.by===ONLINE.me)return;
    if(s.h!==p.h)snd('horn',C,{vol:.9,far:45}); const d=(s.b^p.b)&63; if(d)snd(s.b&d?'latch':'door',C,{vol:.6}); },'150pe-carparts');
  CARX.dbg=()=>({built:ALL.length,cars:Object.fromEntries([...(cars()?cars().cars.values():[])].map(C=>[C.id,read(C)])),parts:ALL.map(G=>{ const px=PX.get(G); return {open:Object.fromEntries(Object.keys(px.PT).map(n=>[n,+(px.cur[n]||0).toFixed(2)])),bar:!!(px.bar&&px.bar.on),head:px.lamps.head[0]?+px.lamps.head[0].material.emissiveIntensity.toFixed(2):null,marks:G.getObjectsByProperty?G.getObjectsByProperty('name','MARK').length:0}; })});
  CARX.parts=CP;
}
