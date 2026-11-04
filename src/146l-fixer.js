// THE FIXER: the electronics repair shop on West St — the big rain-dark armoured robot who kneels at the broken sets and the little one in the hooded raincoat who drives him (Bible: small creatures steering larger bodies); the TVs, computers and modems he sells, each one a thing for your apartment (a TV with its channels, a computer that dials the market's board through a modem).
import {SHARED, THREE} from './003-shx.js';
import {CINEMA, FORAGE, INSPECT, ITEMS, NPCS, SHOPS, UI} from './003b-systems.js';
import {SYS, TILE} from './006-map-pre.js';
import {MSHOP} from './059i-mshops.js';
import {MERCH} from './111e-merch.js';
const FIXIT={}; window.FIXIT=FIXIT;
{ const T=TILE, K=MERCH.K, {mk,grp,BOX,SPH,LATHE,drape}=K;
  /* ---------- the sets, in metres (feet at 0, the screen toward +z): one maker each, used in his shop and in your apartment ---------- */
  const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.6,metalness:0,...o});
  const ctex=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); f(g,w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
  const wood=()=>ctex(64,64,(g,w,h)=>{ g.fillStyle='#5a3a22'; g.fillRect(0,0,w,h); for(let y=0;y<h;y++){ g.fillStyle=`rgba(${30+Math.sin(y*.7+Math.sin(y*.13)*4)*12+20},${18+10*Math.sin(y*.3)},10,.35)`; g.fillRect(0,y,w,1); } });
  const PO=(o,x,y,z)=>{ o.position.set(x,y,z); return o; }, RB=(w,h,d,r=.015,s=3)=>new THREE.BoxGeometry(w,h,d,s,s,s);
  const round=(g,r)=>{ const p=g.attributes.position; g.computeBoundingBox(); const b=g.boundingBox, hx=(b.max.x-b.min.x)/2-r, hy=(b.max.y-b.min.y)/2-r, hz=(b.max.z-b.min.z)/2-r, v=new THREE.Vector3(), q=new THREE.Vector3();
    for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); q.set(Math.max(-hx,Math.min(hx,v.x)),Math.max(-hy,Math.min(hy,v.y)),Math.max(-hz,Math.min(hz,v.z))); const d=v.clone().sub(q); if(d.lengthSq()>1e-9)v.copy(q).add(d.normalize().multiplyScalar(r)); p.setXYZ(i,v.x,v.y,v.z); } g.computeVertexNormals(); return g; };
  const SCR=[], SMAP=new WeakMap(); const screen=(w,h)=>{ const c=document.createElement('canvas'); c.width=64; c.height=48; const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.magFilter=THREE.NearestFilter;
    const m=new THREE.Mesh(new THREE.SphereGeometry(1,16,12,-.42,.84,Math.PI/2-.32,.64),new THREE.MeshBasicMaterial({map:t,color:0xffffff})); m.scale.set(w*1.25,h*1.5,.06); m.position.z=-.055; m.userData.screen=1; const S={c,t,ch:0,on:true,m}; SMAP.set(m,S); SCR.push(S); return m; };
  const draw=(S,tm)=>{ const g=S.c.getContext('2d'), W=64, H=48; if(!S.on){ g.fillStyle='#0b0e0c'; g.fillRect(0,0,W,H); g.fillStyle='rgba(120,140,130,.15)'; g.fillRect(6,5,18,8); S.t.needsUpdate=true; return; }
    if(S.ch===0){ const im=g.createImageData(W,H); for(let i=0;i<W*H;i++){ const v=Math.random()*200|0; im.data.set([v,v,v+10,255],i*4); } g.putImageData(im,0,0); }
    else if(S.ch===1){ const C=['#c0c0c0','#c0c000','#00c0c0','#00c000','#c000c0','#c00000','#0000c0']; C.forEach((c,i)=>{ g.fillStyle=c; g.fillRect(i*W/7,0,W/7+1,H*.7); }); g.fillStyle='#101010'; g.fillRect(0,H*.7,W,H*.3); g.fillStyle='#e0e0e0'; g.font='7px monospace'; g.fillText('WMKT 7',18,H-5); }
    else if(S.ch===2&&window.CINEMA&&CINEMA.drawTimes){ g.fillStyle='#06101a'; g.fillRect(0,0,W,H); try{ CINEMA.drawTimes(g,W,H,4); }catch(e){} }
    else { const d=new Date(); g.fillStyle='#04203a'; g.fillRect(0,0,W,H); g.fillStyle='#f2c14e'; g.font='bold 8px monospace'; g.fillText('MARKET',4,10); g.fillStyle='#e8e8e8'; g.fillText(d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),4,24); g.fillStyle='#8ac'; g.font='6px monospace'; g.fillText('TRACK 1: ON TIME',4,36); g.fillText(['FAIR','CLOUDY','RAIN'][(tm/60|0)%3],4,44); }
    S.t.needsUpdate=true; };
  const SETS={
    tv_console:{name:'THE CONSOLE TV',value:140,make:()=>{ const G=new THREE.Group(), wd=std(0xffffff,{map:wood(),roughness:.5}); G.add(PO(new THREE.Mesh(round(RB(.92,.62,.5),.03),wd),0,.42,0));
      for(const s of [-1,1])G.add(PO(new THREE.Mesh(new THREE.CylinderGeometry(.025,.02,.12,10),std(0x2a1a10)),s*.38,.06,0));
      const f=new THREE.Mesh(round(RB(.56,.44,.04),.04),std(0x1a1a1c,{roughness:.4})); f.position.set(-.13,.44,.25); G.add(f); const sc=screen(.46,.34); sc.position.set(-.13,.44,.3); G.add(sc);
      const gr=new THREE.Mesh(RB(.24,.36,.01),std(0x3a2a20,{roughness:.9})); gr.position.set(.3,.42,.252); G.add(gr); for(let i=0;i<3;i++){ const k=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.025,12),std(0xb8b0a0,{metalness:.6,roughness:.3})); k.rotation.x=Math.PI/2; k.position.set(.3,.65-i*.05,.265); G.add(k); }
      for(const s of [-1,1]){ const a=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.5,6),std(0xc0c0c0,{metalness:.8,roughness:.25})); a.position.set(-.1+s*.12,.93,0); a.rotation.z=s*.5; G.add(a); }
      return G; },sol:[.46,.25,.95]},
    tv_small:{name:'THE PORTABLE TV',value:70,make:()=>{ const G=new THREE.Group(); G.add(PO(new THREE.Mesh(round(RB(.34,.28,.28),.03),std(0xc8c2b4,{roughness:.45})),0,.14,0));
      const sc=screen(.22,.17); sc.position.set(-.03,.15,.14); G.add(sc); const h=new THREE.Mesh(new THREE.TorusGeometry(.1,.012,8,20,Math.PI),std(0x303030)); h.position.set(0,.28,0); G.add(h);
      for(let i=0;i<2;i++){ const k=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.02,10),std(0x202020)); k.rotation.x=Math.PI/2; k.position.set(.13,.2-i*.05,.142); G.add(k); } return G; },loose:3},
    pc_home:{name:'THE HOME COMPUTER',value:180,make:()=>{ const G=new THREE.Group(), beige=std(0xd8ceb4,{roughness:.55});
      G.add(PO(new THREE.Mesh(round(RB(.42,.12,.36),.015),beige),0,.06,0)); const fl=new THREE.Mesh(RB(.14,.012,.01),std(0x202020)); fl.position.set(.1,.07,.181); G.add(fl);
      const mon=new THREE.Mesh(round(RB(.34,.28,.3),.03),beige); mon.position.set(0,.27,-.02); G.add(mon); const sc=screen(.24,.18); sc.position.set(0,.27,.13); SMAP.get(sc).ch=4; G.add(sc);
      const kb=new THREE.Mesh(round(RB(.4,.03,.15),.01),beige); kb.position.set(0,.015,.3); kb.rotation.x=.08; G.add(kb); for(let r=0;r<4;r++)for(let c=0;c<12;c++){ const k=new THREE.Mesh(RB(.022,.012,.022,1,1,1),std(0x8a8270)); k.position.set(-.15+c*.027,.034+r*.003,.25+r*.026); G.add(k); }
      return G; },sol:[.22,.25,.42]},
    modem:{name:'THE MODEM',value:60,make:()=>{ const G=new THREE.Group(); G.add(PO(new THREE.Mesh(round(RB(.26,.06,.18),.012),std(0x3a3c40,{roughness:.5})),0,.03,0));
      for(let i=0;i<5;i++){ const l=new THREE.Mesh(new THREE.SphereGeometry(.006,8,6),new THREE.MeshBasicMaterial({color:i%2?0xff3a2a:0x3aff6a})); l.position.set(-.08+i*.03,.04,.092); l.userData.led=i; G.add(l); }
      const hs=new THREE.Mesh(new THREE.CapsuleGeometry(.025,.18,6,12),std(0x1c1c1e,{roughness:.4})); hs.rotation.z=Math.PI/2; hs.position.set(0,.085,0); G.add(hs); for(const s of [-1,1]){ const cup=new THREE.Mesh(new THREE.CylinderGeometry(.04,.035,.04,14),std(0x2a2a2c)); cup.position.set(s*.09,.075,0); G.add(cup); }
      return G; },loose:1.2}};
  FORAGE.add({names:Object.fromEntries(Object.entries(SETS).map(([k,v])=>[k,v.name]))});
  if(window.INSPECT&&INSPECT.kinds)INSPECT.kinds.push({is:id=>!!SETS[id],make:id=>SETS[id].make()});
  // the screens draw a frame a second when seen; channels: static, colour bars, the cinema's listings, the market's news (the computer's own board)
  const seen=o=>{ for(let q=o;q;q=q.parent){ if(!q.visible)return false; if(q.isScene)return true; } return false; };
  let scT=0; SYS.add('life',dt=>{ if((scT-=dt||0)>0)return; scT=.9; const tm=Date.now()/1000; for(let i=SCR.length-1;i>=0;i--){ const S=SCR[i]; if(S.m&&!S.m.parent&&S.dead){ SCR.splice(i,1); continue; } if(S.m&&seen(S.m))draw(S,tm); } },'146l-fixer');

  FIXIT.SETS=SETS; FIXIT.draw=draw; FIXIT.SCR=SCR; FIXIT.SMAP=SMAP;

  /* ---------- the Fixer: gunmetal plate, rain-streaked, chipped to bare steel; a bucket helm with a fin crest and a round ear disc; ribbed arms; he kneels ---------- */
  const PL='metal:#5a5e64', PLD='metal:#3e4146', STL='metal:#9a9da2', RUB='plain:#1c1c1e';
  const fixer=()=>{ const sk=MERCH.skel({hipY:.95,neck:.55,shX:.27,shY:.44,upper:.3,fore:.28,thigh:.45,shin:.44,hipX:.12}), {B}=sk;
    mk(B.torso,LATHE([[.2,-.05],[.24,.08],[.29,.25],[.3,.38],[.27,.46],[.18,.52],[.08,.55]],28,.78),PL); mk(B.torso,round(RB(.36,.24,.06),.02),PLD,[0,.3,.2]);
    for(let i=0;i<6;i++)mk(B.torso,SPH(.011,10,8),STL,[-.15+i*.06,.42,.215]); mk(B.torso,round(RB(.12,.2,.1),.02),PLD,[0,.26,-.24]);
    mk(B.torso,SPH(.17,28,16,0,Math.PI*2,0,Math.PI*.5),PL,[.27,.45,0],[0,0,-.4],[1.05,.8,1.15]); mk(B.torso,SPH(.15,24,14,0,Math.PI*2,0,Math.PI*.5),PL,[-.27,.45,0],[0,0,.4],[1,.75,1.05]);
    mk(B.hips,new THREE.CylinderGeometry(.22,.2,.2,28,4,true),PLD,[0,-.05,0]); for(const s of [-1,1])mk(B.hips,round(RB(.16,.22,.05),.02),PL,[s*.12,-.16,.2],[-.1,0,0]);
    const H=grp(B.head,[0,.15,0]); mk(H,new THREE.CylinderGeometry(.13,.14,.26,28,4),PL,[0,0,0],[0,0,0],[1,1,1.05]); mk(H,SPH(.13,28,14,0,Math.PI*2,0,Math.PI/2),PL,[0,.13,0],[0,0,0],[1,.5,1.05]);
    mk(H,round(RB(.2,.03,.02),.008),RUB,[0,.02,.14]); mk(H,round(RB(.03,.2,.18),.01),PL,[0,.2,0]); for(const s of [-1,1]){ mk(H,new THREE.CylinderGeometry(.06,.06,.03,24),PL,[s*.14,.0,0],[0,0,Math.PI/2]); mk(H,new THREE.CylinderGeometry(.035,.035,.035,20),STL,[s*.15,0,0],[0,0,Math.PI/2]); }
    for(let i=0;i<8;i++)mk(H,SPH(.008,8,6),STL,[Math.sin(i*.8-2.8)*.135,-.09,Math.cos(i*.8-2.8)*.14]);
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      for(let i=0;i<5;i++)mk(B['upperArm'+n],new THREE.TorusGeometry(.075-i*.003,.022,10,24),i%2?PLD:PL,[0,-.04-i*.055,0],[Math.PI/2,0,0]); mk(B['upperArm'+n],new THREE.CylinderGeometry(.06,.055,.28,20),PLD,[0,-.14,0]);
      for(let i=0;i<5;i++)mk(B['forearm'+n],new THREE.TorusGeometry(.07-i*.004,.02,10,24),i%2?PLD:PL,[0,-.03-i*.05,0],[Math.PI/2,0,0]); mk(B['forearm'+n],new THREE.CylinderGeometry(.055,.05,.26,20),PLD,[0,-.13,0]);
      const h=grp(B['hand'+n]); h.rotation.y=-s*Math.PI/2; mk(h,round(RB(.12,.11,.06),.02),PL,[0,-.05,0]); for(let i=0;i<4;i++){ const f=grp(h,[-.042+i*.028,-.1,.005],[-.5,0,0]); mk(f,new THREE.CapsuleGeometry(.012,.04,4,10),PLD,[0,-.025,0]); const f2=grp(f,[0,-.05,0],[-.5,0,0]); mk(f2,new THREE.CapsuleGeometry(.011,.03,4,10),PL,[0,-.02,0]); }
      const t=grp(h,[.065,-.04,.02],[-.4,0,.7]); mk(t,new THREE.CapsuleGeometry(.013,.04,4,10),PLD,[0,-.025,0]);
      mk(B['thigh'+n],new THREE.CylinderGeometry(.11,.09,.42,24),PL,[0,-.2,0]); for(let i=0;i<3;i++)mk(B['thigh'+n],new THREE.TorusGeometry(.1-i*.006,.012,8,24),PLD,[0,-.08-i*.12,0],[Math.PI/2,0,0]);
      mk(B['shin'+n],SPH(.08,20,14),STL,[0,0,.05],[0,0,0],[1,1,.8]); mk(B['shin'+n],new THREE.CylinderGeometry(.085,.075,.42,24),PL,[0,-.2,0]); mk(B['shin'+n],round(RB(.13,.3,.04),.015),PLD,[0,-.2,.08]);
      mk(B['shoe'+n],round(RB(.16,.12,.3),.03),PL,[0,-.08,.06]); mk(B['shoe'+n],round(RB(.17,.03,.32),.01),RUB,[0,-.13,.06]); }
    return sk; };
  MERCH.add({key:'fixer',label:'THE FIXER',height:2.2,model:fixer,size:13,hd:Math.PI/2,inside:true,
    idle:t=>{ const w=Math.sin(t*1.7)*6, tw=(t%7)<2; return MERCH.pose({root:[0,10.5,.5],bend:16,nod:-18+Math.sin(t*.5)*4,L:{ik:[2.6,1.2,5],foot:0,ua:[30,10],fa:[40,0]},R:{ik:[-2.6,1.2,-5.5],foot:-70,ua:[62+w,-12],fa:[60+(tw?Math.sin(t*14)*8:0),-10]}}); }});

  /* ---------- the little one: a small figure in a tan hooded raincoat, its face never seen; denim shorts, white socks, little shoes; it points, stamps, gives the orders ---------- */
  const COAT='cloth:#8c7a56', COATD='cloth:#6a5a3e';
  const little=()=>{ const sk=MERCH.skel({hipY:.56,neck:.4,shX:.17,shY:.33,upper:.22,fore:.2,thigh:.26,shin:.26,hipX:.085}), {B}=sk;
    mk(B.torso,drape(LATHE([[.17,-.22],[.19,-.1],[.185,.06],[.18,.2],[.17,.3],[.13,.37],[.07,.41]],28,.85),.012),COAT); mk(B.torso,new THREE.CylinderGeometry(.006,.006,.55,8),'plain:#3a3022',[0,.08,.15]);
    for(let i=0;i<4;i++)mk(B.torso,SPH(.012,10,8),'plain:#2a2218',[.025,.25-i*.11,.155]);
    const H=grp(B.head,[0,.14,0]); mk(H,drape(SPH(.16,32,24,Math.PI/2+.75,Math.PI*2-1.5,0,Math.PI*.8),.01),COAT,[0,.02,-.01],[-.15,0,0],[1,1.12,1.05]); mk(H,SPH(.105,24,16),'plain:#141210',[0,-.01,.05],[0,0,0],[1,1.1,.6]);
    mk(H,new THREE.TorusGeometry(.12,.025,12,32),COATD,[0,0,.07],[0,0,0],[1,1.15,1]);
    for(const s of [1,-1]){ const n=s>0?'L':'R'; mk(B['upperArm'+n],drape(new THREE.CylinderGeometry(.06,.058,.26,20,4,true),.006),COAT,[0,-.12,0]); mk(B['upperArm'+n],SPH(.065,18,12),COAT);
      mk(B['forearm'+n],drape(new THREE.CylinderGeometry(.055,.062,.22,20,4,true),.006),COAT,[0,-.1,0]); mk(B['hand'+n],SPH(.035,14,10),'skin:#d8b8a0',[0,-.03,0]);
      mk(B['thigh'+n],new THREE.CylinderGeometry(.08,.075,.16,20),'denim:#3a4c66',[0,-.07,0]); mk(B['thigh'+n],new THREE.CylinderGeometry(.055,.05,.12,16),'skin:#d8b8a0',[0,-.2,0]);
      mk(B['shin'+n],new THREE.CylinderGeometry(.05,.042,.26,16),'skin:#d8b8a0',[0,-.12,0]); mk(B['shin'+n],new THREE.CylinderGeometry(.045,.045,.08,16),'cloth:#ecebe6',[0,-.22,0]);
      mk(B['shoe'+n],new THREE.CapsuleGeometry(.045,.07,6,12),'leather:#c8c0b0',[0,-.03,.03],[Math.PI/2,0,0],[1,1,.8]); }
    return sk; };
  MERCH.add({key:'fixkid',label:'THE LITTLE ONE',height:1.0,model:little,size:4.5,hd:Math.PI/2-.6,inside:true,lift:()=>.46,
    idle:t=>{ const ph=(t%11), point=ph<2.5, stamp=ph>6&&ph<6.8; return MERCH.pose({nod:-4+Math.sin(t*.9)*6,yaw:Math.sin(t*.6)*10,L:point?{ua:[95,10],fa:[10,0]}:{ua:[12,8],fa:[30,0]},R:{ua:[10,-6],fa:[20,0]},...(stamp?{root:[0,18+Math.abs(Math.sin(t*20))*1.2,0]}:{})}); }});

  /* ---------- his shop, inside: sets stacked to the ceiling on the east wall, the bench of chassis and solder, cable and tube bins on the west, his counter by the door ---------- */
  MSHOP.kit.fixit=A=>{ '@later'; const {R,X,Z,hs,sh}=A, Y=h=>A.Y(h*24), cx=A.cx, EX=Math.sign(X(R.x1)-X(R.x0)), IN=Math.sign(Z(R.y1)-Z(R.y0)), wf=EX>0?-Math.PI/2:Math.PI/2;
    const M=(o,x,h,y,ry=0)=>{ o.position.set(X(x),Y(h),Z(y)); o.rotation.y=ry; o.scale.multiplyScalar(T); o.traverse(c=>{ if(c.isMesh){ c.castShadow=c.receiveShadow=true; } }); A.add(o); return o; };
    const box=(w,h,d,c,x,hh,y,ry=0,o={})=>M(new THREE.Mesh(round(RB(w,h,d),Math.min(.02,w/4,h/4,d/4)),std(c,o)),x,hh,y,ry);
    A.floor((x,y)=>{ const u=Math.floor((x-R.x0)*2.5), v=Math.floor((y-R.y0)*2.5), w=(u+v)&1, f=.88+.12*hs(Math.floor(x*5),Math.floor(y*5),3); return sh(w?[150,146,132]:[92,96,88],f-(hs(Math.floor(x*2),Math.floor(y*2),8)>.88?.18:0)); });
    const wall=(u,z)=>{ if(z<24)return sh([58,70,64],.85+.15*hs(Math.floor(u*6),2,4)); if(z<27)return sh([40,44,42],1); return sh([168,170,156],.86+.08*hs(Math.floor(u*3),Math.floor(z/8),5)-(hs(Math.floor(u*5),Math.floor(z/5),9)>.93?.15:0)); };
    for(const s of ['b','w','e','f'])A.wall(s,wall);
    // the east wall: steel shelving, sets on every shelf, some on (static, colour bars), each double-clicked to buy
    const ex=R.x1-.45, ids=Object.keys(SETS);
    for(let k=0;k<3;k++){ const y=R.y0+1.2+k*2.4; box(.05,2.6,.05,0x5a5e62,ex+.32,1.3,y-1.1,0,{metalness:.6,roughness:.4}); box(.05,2.6,.05,0x5a5e62,ex+.32,1.3,y+1.1,0,{metalness:.6,roughness:.4}); for(let s=0;s<4;s++)box(.6,.03,2.3,0x6a6e72,ex,.25+s*.72,y,0,{metalness:.5,roughness:.45}); }
    let n=0; for(let k=0;k<3;k++)for(let s=0;s<4;s++){ const y=R.y0+1.2+k*2.4; for(let j=0;j<2;j++){ const id=ids[(k*4+s+j)%ids.length]; if(id==='tv_console'&&s>0)continue; const o=SETS[id].make(); const sc=o.children.find(c=>c.userData.screen); if(sc){ SMAP.get(sc).on=hs(k,s,j)>.35; SMAP.get(sc).ch=hs(j,k,s)>.5?0:1; }
        M(o,ex-.05,.27+s*.72,y-.55+j*1.1,wf); n++; } }
    ids.forEach((id,i)=>{ const y=R.y0+1.2+i*2.2*.9; const hb=new THREE.Mesh(new THREE.BoxGeometry(.8*T,2.8*T,1.9*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(ex-.2),Y(1.4),Z(R.y0+.9+i*(R.y1-R.y0-2)/ids.length+.6)); A.add(hb);
      UI.thing({name:SETS[id].name+' · $'+(+ITEMS.prop(id,'value')||SETS[id].value),obj:hb,reach:2.6*T,near:3.4*T,tall:2.8*T,act:()=>{ const N=NPCS.extra.find(q=>q.key==='fixer'); if(N&&SHOPS.open)SHOPS.open(N); }}); });
    A.sol(ex-.35,R.y0+.05,R.x1,R.y1-.05);
    // the repair: an opened console set on the floor in the middle, its back off, the chassis out; tools, a soldering iron with its curl of smoke, an oscilloscope on a cart glowing green
    const rx=R.x1-3.4, ry=R.y0+3.2, tv=SETS.tv_console.make(); M(tv,rx,0,ry,EX>0?Math.PI/2:-Math.PI/2); box(.5,.08,.4,0x2a5a30,rx-.75,.05,ry+.1,0,{roughness:.5}); for(let i=0;i<14;i++)box(.03,.05,.03,[0xc03030,0x3060c0,0xd0c040,0x808080][i%4],rx-.95+hs(i,1,2)*.4,.12,ry-.05+hs(i,2,3)*.3);
    const iron=M(new THREE.Mesh(new THREE.CylinderGeometry(.012,.006,.22,10),std(0x9a9a9a,{metalness:.7,roughness:.3})),rx-.5,.1,ry+.55,.3); iron.rotation.z=Math.PI/2;
    const cart=box(.5,.7,.4,0x3a3c40,R.x0+2.2,.35,R.y0+1.2,0,{roughness:.5}); const osc=box(.42,.3,.34,0x8a8a80,R.x0+2.2,.86,R.y0+1.2); const g=new THREE.Mesh(new THREE.PlaneGeometry(.22*T,.16*T),new THREE.MeshBasicMaterial({map:ctex(32,24,(c,w,h)=>{ c.fillStyle='#062a10'; c.fillRect(0,0,w,h); c.strokeStyle='#5aff7a'; c.beginPath(); for(let x=0;x<w;x++)c.lineTo(x,h/2+Math.sin(x*.6)*7); c.stroke(); })})); g.position.set(X(R.x0+2.2),Y(.88),Z(R.y0+1.2+.18*IN)); if(IN<0)g.rotation.y=Math.PI; A.add(g);
    A.sol(rx-1.1,ry-.6,rx+.6,ry+.8); A.sol(R.x0+1.9,R.y0+.9,R.x0+2.5,R.y0+1.5);
    // the west wall: parts bins and cable spools, a crate the little one stands on
    for(let r=0;r<4;r++)for(let c=0;c<5;c++)box(.32,.22,.4,[0x3a5a8a,0x8a3a2a,0xb8a040,0x3a7a4a][(r+c)%4],R.x0+.25,.3+r*.3,R.y0+3+c*.45,0,{roughness:.6});
    for(let i=0;i<3;i++){ const sp=M(new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.18,20),std([0x1a1a1a,0xb04020,0x2050a0][i],{roughness:.7})),R.x0+.6+i*.5,.22,R.y1-1.3); sp.rotation.x=Math.PI/2; }
    A.sol(R.x0,R.y0+2.6,R.x0+.5,R.y0+5.4); box(.6,.45,.5,0x7a5a3a,rx-.4,.225,ry-1.2,.3,{roughness:.8}); A.sol(rx-.75,ry-1.5,rx-.05,ry-.9);
    // the counter by the door: a glass case of tubes and remotes, an old register
    const kx=cx+2.2, ky=R.y1-1.6; box(1.8,1,.6,0x5a5e62,kx,.5,ky,0,{metalness:.3,roughness:.45}); box(.4,.25,.35,0x7a7060,kx-.5,1.13,ky); A.sol(kx-.95,ky-.35,kx+.95,ky+.35);
    A.lamp(rx-.4,ry,2.9,0xe8f4ff,9,9); A.lamp(ex-.6,(R.y0+R.y1)/2,2.6,0xb8c8e8,5,7); A.lamp(kx,ky,2.6,0xffe2b0,4,6); A.lamp(R.x0+2.2,R.y0+1.4,1.2,0x5aff7a,1.5,3);
    FIXIT.shopSets=n; };
  SHARED.FIXIT=FIXIT;
}
export {FIXIT};
