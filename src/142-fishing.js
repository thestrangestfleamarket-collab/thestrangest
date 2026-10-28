// THE FISHING: FISHING and BOAT let the player fish the river and the lakes with a rod (bait, cast, bite, fight, land) and row the river.
import {SHARED, THREE} from './003-shx.js';
import {BOAT, BOOKS, CLOCK, FORAGE, INSPECT, INV, ITEMS, pos, SFX, st, UI, VIT, W3, WIELD} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, MAPG, SOL, SYS, TILE, ZU} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
import {RIVER} from './066-river.js';
import {GEMS} from './101-gems.js';
const FISHING={reeling:false,auto:false,force:null}; Object.assign(BOAT,{on:false}); window.FISHING=FISHING; window.BOAT=BOAT;
// the rod is held through WIELD (146a): its blank bends with the line's pull; the cast and the fight drive the arm
{ const T=TILE, Y=v=>v*T/.84, V3=THREE.Vector3, A=.95;
  const rod={name:'FISHING ROD',hint:'CLICK THE WATER TO CAST. CLICK TO STRIKE A BITE, HOLD TO REEL.',
    make:()=>{ const g=new THREE.Group(), L=Y(2.1), N=8, dir=new V3(0,Math.cos(A),Math.sin(A)), side=new V3(0,-Math.sin(A),Math.cos(A)), lam=c=>new THREE.MeshLambertMaterial({color:c});
      const cork=new THREE.Mesh(new THREE.CylinderGeometry(Y(.018),Y(.016),Y(.42),6),lam(0xb08a5a)); cork.position.copy(dir).multiplyScalar(Y(.02)); cork.quaternion.setFromUnitVectors(new V3(0,1,0),dir);
      const reel=new THREE.Mesh(new THREE.CylinderGeometry(Y(.035),Y(.035),Y(.03),8),lam(0x3a3c40)); reel.position.copy(dir).multiplyScalar(Y(.12)).addScaledVector(side,-Y(.045)); reel.rotation.x=Math.PI/2-A;
      const pos=new Float32Array((N+1)*4*3), idx=[]; for(let i=0;i<N;i++)for(let k=0;k<4;k++){ const a=i*4+k, b=i*4+(k+1)%4, c=a+4, d=b+4; idx.push(a,c,b,b,c,d); }
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setIndex(idx);
      const blank=new THREE.Mesh(geo,lam(0x1e2a24)); blank.frustumCulled=false; g.add(cork,reel,blank); g.tipL=new V3(); g.head=g.tipL; let bent=-1;
      g.bend=()=>{ const b=FISHING.bendK||0; if(Math.abs(b-bent)<.004)return; bent=b; const P=new V3(), X=new V3(1,0,0), S=new V3();
        for(let i=0;i<=N;i++){ const t=i/N, r=Y(.011*(1-t)+.002); P.copy(dir).multiplyScalar(Y(.2)+t*L).addScaledVector(side,-b*t*t*L*.45).addScaledVector(dir,-b*b*t*t*t*L*.12);
          for(let k=0;k<4;k++){ const a=k*Math.PI/2+.785; S.copy(P).addScaledVector(X,Math.cos(a)*r).addScaledVector(side,Math.sin(a)*r); S.toArray(pos,(i*4+k)*3); } if(i===N)g.tipL.copy(P); }
        geo.attributes.position.needsUpdate=true; geo.computeVertexNormals(); geo.computeBoundingSphere(); };
      g.bend(); return g; },
    aim:(dt,aim,mouse)=>FISHING.aim?FISHING.aim(dt,aim,mouse):false,
    use:()=>{ if(FISHING.click)FISHING.click(); } };
  (WIELD.pend=WIELD.pend||[]).push(['rod',rod]); if(WIELD.kind)WIELD.kind('rod',rod);
  addEventListener('pointerup',()=>{ FISHING.reeling=false; }); addEventListener('blur',()=>{ FISHING.reeling=false; }); }
// what a catch looks like in the inspect window: the fish's own shape once the river is built (FISHING.look), the junk and the bait in simple shapes
INSPECT.kinds.push({is:id=>/^x_/.test(id)||id==='chest'||/^bait/.test(id),make:id=>{ const P=INSPECT.part;
    if(id==='x_boot'){ const g=new THREE.Group(); g.add(P('box',0x3a2e22,0,.06,0,.09,.12,.1),P('box',0x3a2e22,0,.02,.07,.09,.04,.16),P('box',0x1e1812,0,0,.04,.095,.012,.24)); return g; }
    if(id==='x_can')return INSPECT.shape('jar',0x9aa0a4,0x8a9094); if(id==='x_note'){ const g=INSPECT.shape('bottle',0x9ad0b0); g.add(P('cyl',0xf2ead6,0,.12,0,.022,.14,.022)); return g; }
    if(id==='chest'){ const g=new THREE.Group(); g.add(P('box',0x5a3a1e,0,0,0,.36,.2,.24),P('cap',0x5a3a1e,0,.1,0,.18,.08,.12,0,Math.PI/2),P('box',0xb08a2a,0,0,.121,.05,.06,.01)); g.children[1].rotation.set(0,0,0); g.children[1].scale.set(.18,.08,.12); return g; }
    if(/^bait/.test(id))return id==='bait_cut'?INSPECT.shape('lump',0xb07a6a):INSPECT.shape('jar',0x6a4a2a,0x3a3a3a);
    return FISHING.look&&FISHING.look(id)||(()=>{ const g=new THREE.Group(); g.add(P('ball',0x8a9aa0,0,0,0,.2,.07,.035,0,0,0,{flat:1}),P('cone',0x7a8a90,-.24,0,0,.07,.1,.02,0,Math.PI/2)); return g; })(); }});
RIVER.onBuild.push(()=>{ '@later'; const T=TILE, RB=RIVER.box, rz0=RB.z0, rz1=RB.z1, WU=T/.84, cl=(v,a,b)=>v<a?a:v>b?b:v, IP=(id,k)=>ITEMS.prop(id,k);
  const NAMES={x_sunfish:'SUNFISH',x_perch:'WHITE PERCH',x_tomcod:'ATLANTIC TOMCOD',x_crab:'BLUE CRAB',x_eel:'AMERICAN EEL',x_catfish:'CHANNEL CATFISH',x_flounder:'SUMMER FLOUNDER',x_shad:'AMERICAN SHAD',x_bluefish:'BLUEFISH',x_bass:'STRIPED BASS',x_sturgeon:'ATLANTIC STURGEON',
    x_bluegill:'BLUEGILL',x_yperch:'YELLOW PERCH',x_trout:'RAINBOW TROUT',x_carp:'CARP',x_lbass:'LARGEMOUTH BASS',x_pike:'NORTHERN PIKE'};
  const SPECIES=Object.keys(NAMES);   // their habits are the item model's: LIVES IN, DEPTH, BITES, BAIT, FIGHT, COMMON, WEIGHT, VALUE (data/items.json, the item editor)
  const JUNK=[['x_boot','OLD BOOT',.6,1],['x_can','TIN CAN',.5,1],['x_note','MESSAGE IN A BOTTLE',.05,5],['bk_novel','WATER-STAINED NOVEL',.1,1],['chest','SUNKEN CHEST',.05,0]];
  FORAGE.add({names:Object.assign({},NAMES,Object.fromEntries(JUNK.map(j=>[j[0],j[1]])),{rod:'FISHING ROD',bait:'WORMS',bait_cut:'CUT BAIT (BUNKER)'}),raw:Object.fromEntries(SPECIES.map(id=>[id,[Math.min(.2,.05+.03*(IP(id,'weight')||1)),.3]])),
    prices:{f_fishfry:12,f_grillbass:34,f_chowder:30,f_smokeeel:22,f_sturgeon:90},
    recipes:[['f_fishfry','FISH FRY','cooking',[10,50],{x_perch:2},'fills a third'],['f_smokeeel','SMOKED EEL','cooking',[25,70],{x_eel:2},'fills two fifths, strong 2 min'],
      ['f_grillbass','GRILLED STRIPED BASS','cooking',[30,75],{x_bass:1},'fills half, mends you a minute'],['f_chowder','FISH CHOWDER','cooking',[40,85],{x_catfish:1,m_button:2},'fills more than half, some health'],
      ['f_sturgeon','STURGEON STEAK','cooking',[65,110],{x_sturgeon:1},'fills most of you, quick on your feet 3 min']],
    does:{f_fishfry:()=>FORAGE.feed(.33),f_smokeeel:()=>{ FORAGE.feed(.4); FORAGE.buff('str',120); },f_grillbass:()=>{ FORAGE.feed(.5); FORAGE.buff('regen',60); },
      f_chowder:()=>{ FORAGE.feed(.6); VIT.hp=Math.min(1,VIT.hp+.3); },f_sturgeon:()=>{ FORAGE.feed(.8); FORAGE.buff('swift',180); }}});
  const say=FORAGE.say, PRICE=Object.fromEntries([...SPECIES.map(id=>[id,IP(id,'value')||1]),...JUNK.map(j=>[j[0],j[3]])]);
  const PX=RIVER.fpier, SX=PX+2.6*T, SZ=rz1+1.55*T;
  { const BX=[], box=(x,y,z,w,h,d,c)=>BX.push([x,y,z,w,h,d,c]), Y=v=>v*T/.84;
    const W=2.2*T, D=1.1*T, WOOD=0x6a4a2e, DK=0x3e2a1a, BL=0x2e6aa8, WH=0xe8e4d8;
    box(SX,Y(.5),SZ+D*.35,W,Y(1),.18*T,WOOD); box(SX,Y(1.02),SZ+D*.35,W+.1*T,Y(.05),.32*T,0x8a6a44);
    box(SX,Y(1.2),SZ-D*.45,W,Y(2.4),.1*T,DK); for(const o of [-1,1])box(SX+o*W/2,Y(1.2),SZ,.12*T,Y(2.4),D,DK);
    for(let i=0;i<8;i++)box(SX-W/2-.1*T+(i+.5)*(W+.2*T)/8,Y(2.42),SZ-.15*T,(W+.2*T)/8,Y(.08),D+.5*T,i&1?WH:BL);
    box(SX-.6*T,Y(1.14),SZ+D*.35,.36*T,Y(.22),.24*T,0x2a5a2a); box(SX-.6*T,Y(1.26),SZ+D*.35,.36*T,Y(.03),.24*T,0x3a7a3a);
    box(SX+.55*T,Y(1.18),SZ+D*.35,.26*T,Y(.3),.26*T,0x8a8e92);
    for(let i=0;i<4;i++)box(SX-W/2+.3*T+i*.12*T,Y(1.3),SZ-D*.3,.035*T,Y(2.4),.035*T,0x8a6a3a);
    box(SX+W/2-.4*T,Y(.25),SZ-D*.1,.3*T,Y(.5),.3*T,0x6a7078);
    const me=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial(),BX.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color(), V=THREE.Vector3;
    BX.forEach(([x,y,z,w,h,d,col],i)=>{ me.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(w,h,d))); me.setColorAt(i,c.setHex(col)); }); me.castShadow=me.receiveShadow=true; MAPG.bodega.add(me);
    const cv=document.createElement('canvas'); cv.width=96; cv.height=16; const g=cv.getContext('2d'); g.fillStyle='#1f4f86'; g.fillRect(0,0,96,16); g.fillStyle='#f2ead6'; g.font='bold 10px monospace'; g.textAlign='center'; g.fillText('BAIT & BOATS',48,12);
    const tx=new THREE.CanvasTexture(cv); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.generateMipmaps=false; tx.colorSpace=THREE.SRGBColorSpace;
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(W*.9,W*.15),new THREE.MeshBasicMaterial({map:tx})); sg.position.set(SX,Y(2.25),SZ+D*.5+.27*T); MAPG.bodega.add(sg);
    SOL.up.push([SX-W/2-.1*T,SZ-D*.5,SX+W/2+.1*T,SZ+D*.55]); FIX.up.push([SX-W/2-.1*T,SZ-D*.5,0,SX+W/2+.1*T,SZ+D*.55,Y(2.4)]);
    const hb=new THREE.Mesh(new THREE.BoxGeometry(W,Y(2.4),D),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(SX,Y(1.2),SZ); MAPG.bodega.add(hb);
    UI.thing({name:'BAIT & BOATS',obj:hb,reach:1.4*T,near:2.2*T,tall:Y(2.6),act:()=>STAND.open()}); }
  const STAND={}; FISHING.STAND=STAND; const B='style="margin:0 0 0 4px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer"';
  const sp=document.createElement('div'); sp.id='fishp'; sp.hidden=true; sp.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);width:min(460px,92vw);max-height:80vh;overflow:auto;z-index:21;padding:14px 16px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  document.body.appendChild(sp); sp.addEventListener('keydown',e=>e.stopPropagation());
  const WARES=[['bait','WORMS · A DOZEN',3,12],['bait_cut','CUT BAIT (BUNKER) · SIX',4,6]];
  STAND.draw=()=>{ if(sp.hidden)return; const ids=Object.keys(INV.items).filter(id=>INV.items[id]>0&&PRICE[id]!=null).sort();
    let o=`<h3 style="margin:0 0 4px;color:#f2c14e;font:12px Silkscreen,monospace">BAIT & BOATS</h3><div style="color:#9b9584;margin-bottom:8px">Self serve. Pay in the box. Catches bought at the board's price.</div><div style="margin-bottom:8px">YOU HAVE <b style="color:#f2c14e">$${Math.round(INV.cash)}</b> · FISHING ${FORAGE.sk('fish').toFixed(1)}</div><table style="border-collapse:collapse;width:100%">`;
    o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">FISHING ROD</td><td style="text-align:right;padding:4px 6px">$15</td><td style="text-align:right">${FORAGE.has('rod')?'YOURS':`<button ${B} data-buy="rod">BUY</button>`}</td></tr>`;
    for(const [id,nm,c,n] of WARES)o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">${nm}</td><td style="text-align:right;padding:4px 6px">$${c}</td><td style="text-align:right">x${FORAGE.has(id)} <button ${B} data-bait="${id}">BUY</button></td></tr>`;
    o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">ROWBOAT · A TRIP</td><td style="text-align:right;padding:4px 6px">$5</td><td style="text-align:right">${BOAT.on?'OUT':`<button ${B} data-boat="1">RENT</button>`}</td></tr></table>`;
    o+=`<div style="margin:10px 0 4px;color:#9b9584">YOUR CATCH</div><table style="border-collapse:collapse;width:100%">`;
    for(const id of ids){ const v=PRICE[id], n=INV.items[id]; o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">${FORAGE.NM[id]}</td><td style="text-align:right;padding:4px 6px">$${v}</td><td style="text-align:right">x${n}</td><td style="text-align:right;white-space:nowrap"><button ${B} data-sell="${id}">SELL</button>${n>1?`<button ${B} data-sell="${id}" data-n="all">ALL $${v*n}</button>`:''}</td></tr>`; }
    o+=FORAGE.trainRows(['fish'])+`</table>${ids.length?'':'<div style="color:#7d7a70;margin-top:6px">Nothing yet. Hold the rod, bait the hook, click the water to cast. Worms for perch, eels, shad and sturgeon; cut bait for bass, bluefish, catfish, fluke and crabs. Deeper water off the pier\'s end, bigger fish; bass bite at dusk, eels and tomcod at night.</div>'}`;
    const x=sp.querySelector(':scope>.pX'); sp.innerHTML=o; if(x)sp.appendChild(x); };
  sp.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||b.classList.contains('pX'))return; const d=b.dataset;
    if(d.train){ FORAGE.train(d.train,+d.cap); STAND.draw(); return; } if(d.buy==='rod'){ if(INV.cash<15)say('YOU CANNOT AFFORD THAT.','#c8a090'); else { INV.cash-=15; FORAGE.give('rod'); say('YOU TAKE A ROD AND DROP $15 IN THE BOX.'); } }
    if(d.bait){ const w=WARES.find(x=>x[0]===d.bait); if(INV.cash<w[2])say('YOU CANNOT AFFORD THAT.','#c8a090'); else { INV.cash-=w[2]; FORAGE.give(w[0],w[3]); say(`YOU TAKE ${w[1]} AND DROP $${w[2]} IN THE BOX.`); } }
    if(d.boat){ if(INV.cash<5)say('YOU CANNOT AFFORD THAT.','#c8a090'); else { INV.cash-=5; sp.hidden=true; BOAT.launch(); } }
    if(d.sell){ const n=d.n==='all'?FORAGE.has(d.sell):1, v=PRICE[d.sell]*n; FORAGE.take(d.sell,n); INV.cash+=v; say(`YOU SELL ${n} ${FORAGE.NM[d.sell]} FOR $${v}.`,'#f2c14e'); SFX.play('clunk',{vol:.5}); }
    STAND.draw(); FORAGE.draw(); });
  STAND.open=()=>{ sp.hidden=false; STAND.draw(); };
  const boat=new THREE.Group(); boat.visible=false; scene.add(boat); const BW=1.1*T, BLn=2.6*T, Y=v=>v*T/.84;
  { const mat=new THREE.MeshLambertMaterial({color:0xe8e2d2}), trim=new THREE.MeshLambertMaterial({color:0xa83a2a}), wood=new THREE.MeshLambertMaterial({color:0x7a5634}), add=(m,x,y,z,w,h,d)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); o.castShadow=true; boat.add(o); return o; };
    add(mat,0,Y(.05),0,BW*.8,Y(.1),BLn*.86); for(const o of [-1,1]){ add(mat,o*BW*.45,Y(.25),0,.08*T,Y(.45),BLn*.86); add(trim,o*BW*.45,Y(.48),0,.1*T,Y(.05),BLn*.86); }
    add(mat,0,Y(.28),BLn*.45,BW*.55,Y(.5),.1*T); add(mat,0,Y(.25),-BLn*.45,BW*.85,Y(.45),.1*T); add(wood,0,Y(.35),.1*T,BW*.82,Y(.05),.3*T); add(wood,0,Y(.3),-BLn*.32,BW*.7,Y(.05),.3*T);
    BOAT.oars=[-1,1].map(o=>{ const p=new THREE.Group(); p.position.set(o*BW*.48,Y(.5),.1*T); const a=new THREE.Mesh(new THREE.BoxGeometry(1.5*T,.05*T,.05*T),wood); a.position.x=o*.6*T; const bl=new THREE.Mesh(new THREE.BoxGeometry(.4*T,.02*T,.16*T),wood); bl.position.x=o*1.3*T; p.add(a,bl); boat.add(p); return p; }); }
  BOAT.x=0; BOAT.z=0; BOAT.hd=Math.PI; BOAT.v=0; BOAT.py=0; let row=0;
  const nearDeck=(x,z,m)=>{ for(const d of RIVER.decks)for(const r of d.r)if(x>r[0]-m&&x<r[2]+m&&z>r[1]-m&&z<r[3]+m)return r; return null; };
  const atShore=()=>{ const L=RIVER.ladders.find(x=>Math.abs(x-BOAT.x)<1.3*T&&BOAT.z>rz1-1.6*T); if(L!=null)return {x:L,z:rz1+.7*T}; const r=nearDeck(BOAT.x,BOAT.z,1.4*T); if(r)return {x:cl(BOAT.x,r[0]+.4*T,r[2]-.4*T),z:cl(BOAT.z,r[1]+.4*T,r[3]-.4*T)}; return null; };
  BOAT.launch=()=>{ BOAT.x=PX+(RIVER.fpw||1.8*T)+1.6*T; BOAT.z=rz1-1.8*T; BOAT.hd=Math.PI; BOAT.v=0; BOAT.on=true; boat.visible=true; SHARED.target=null; say('YOU STEP INTO THE ROWBOAT. ROW WITH W A S D.'); HUD.hidden=false; BOAT.place(); };
  BOAT.ashore=()=>{ const s=atShore(); if(!s)return say('ROW TO A LADDER OR A PIER FIRST.','#c8a090'); BOAT.on=false; boat.visible=false; st.sit=null; pos.x=s.x; pos.z=s.z; SHARED.py=0; HUD.hidden=true; FISHING.reel(); say('YOU TIE UP THE BOAT AND CLIMB OUT.'); };
  BOAT.steer=(dt,mx,mz)=>{ const m=Math.hypot(mx,mz); if(m>0){ let dh=Math.atan2(mx,mz)-BOAT.hd; dh=Math.atan2(Math.sin(dh),Math.cos(dh)); BOAT.hd+=cl(dh,-1.7*dt,1.7*dt); if(Math.abs(dh)<1.2)BOAT.v=Math.min(3.2*T,BOAT.v+3.6*T*dt); row+=dt*5; }
    else BOAT.v*=Math.exp(-dt*1.1); if(BOAT.v<.03*T&&!m)BOAT.v=0;
    const o={x:BOAT.x+Math.sin(BOAT.hd)*BOAT.v*dt,z:BOAT.z+Math.cos(BOAT.hd)*BOAT.v*dt}; o.x=cl(o.x,RB.x0+1.5*T,RB.x1-1.5*T); o.z=cl(o.z,rz0+1*T,rz1-.9*T);
    if(nearDeck(o.x,o.z,.7*T)){ if(!nearDeck(o.x,BOAT.z,.7*T))o.z=BOAT.z; else if(!nearDeck(BOAT.x,o.z,.7*T))o.x=BOAT.x; else { o.x=BOAT.x; o.z=BOAT.z; } }
    if(Math.hypot(o.x-BOAT.x,o.z-BOAT.z)<.001)BOAT.v=Math.min(BOAT.v,.5*T); BOAT.x=o.x; BOAT.z=o.z; BOAT.place(); };
  BOAT.place=()=>{ const h=RIVER.hAt(BOAT.x,BOAT.z); BOAT.py=RB.lv+h+Y(.12); boat.position.set(BOAT.x,RB.lv+h-Y(.05),BOAT.z); boat.rotation.y=BOAT.hd;
    const a=Math.sin(row)*.6; BOAT.oars[0].rotation.y=-a; BOAT.oars[1].rotation.y=a; BOAT.oars[0].rotation.z=.2+.15*Math.cos(row); BOAT.oars[1].rotation.z=-.2-.15*Math.cos(row); };
  BOAT.carry=(st,pos)=>{ pos.x=BOAT.x; pos.z=BOAT.z; st.sit={z:Math.max(2,Y(.3)/(ZU*W3.SZ*(W3.BH||1)))}; if(RIVER.swim)RIVER.swim=false; if(st.water)st.water.in=false; };
  const HUD=document.createElement('div'); HUD.id='boathud'; HUD.hidden=true; { const c=document.createElement('style'); c.textContent='#boathud[hidden],#fishhud[hidden],#minehud[hidden],#fjour:empty{display:none!important}'; document.head.appendChild(c); } HUD.style.cssText='position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:7;font:11px Silkscreen,monospace;color:#e8e2cc;background:#0b0d13e0;border:2px solid #3a3f4e;padding:6px 10px;display:flex;gap:10px;align-items:center;zoom:var(--uiz,1)';
  HUD.innerHTML='<span>ROWBOAT · W A S D</span><button style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 8px;cursor:pointer">STEP ASHORE</button>'; document.body.appendChild(HUD);
  HUD.querySelector('button').onclick=()=>BOAT.ashore(); setInterval(()=>{ if(BOAT.on)HUD.querySelector('button').style.opacity=atShore()?1:.45; },400);

  /* ---------- the catch: who bites where, when and on what (the odds), and how hard they fight ---------- */
  const S=FORAGE.S; S.fishkg=S.fishkg||{};
  const period=h=>h>=7&&h<17?'day':h>=21||h<5?'night':'dusk';
  const lakeAt=(x,z)=>{ const b=FOUNT.bedAt&&FOUNT.bedAt(x,z); if(b!=null)return FOUNT.LV; const h=window.HILL?HILL(x,z):0; return h<-.35*T?-.25*T:null; };   // still water: the big lake, the stream and THE LAKE
  FISHING.at=(x,z)=>{ if(RIVER.over(x,z)&&!RIVER.onPier(x,z,.15*T))return {kind:'river',lv:RB.lv,depth:RIVER.depthAt(x,z)}; const l=lakeAt(x,z); return l==null?null:{kind:'lake',lv:l,depth:2.5}; };
  const SOAK=25, K=.0022, rests=[];   // a bite's rate per second is K x the sum of the weights below; a spot just bitten rests 40 s
  FISHING.odds=(x,z,bait=S.hook,h=CLOCK.h)=>{ const w=FISHING.at(x,z); if(!w)return null; const bk=bait?IP(bait,'bait'):null, pd=period(h), per={}; let sum=0;
    for(const id of SPECIES){ if(IP(id,'water')!==w.kind||w.depth<(IP(id,'depth')||0))continue; const b=!bk?0:IP(id,'bait')===bk?1.6:.5, bt=IP(id,'bites'), tm=bt==='any'?1:bt===pd?1.5:.3, v=(IP(id,'common')||0)*b*tm; if(v>0){ per[id]=v; sum+=v; } }
    if(w.kind==='river'&&bk)for(const [id,,c] of JUNK){ per[id]=c; sum+=c; }
    const now=performance.now()/1000, r=rests.filter(q=>Math.hypot(q[0]-x,q[1]-z)<3*T).reduce((m,q)=>Math.min(m,(now-q[2])/40),1), lam=K*sum*(1+FORAGE.sk('fish')/100)*Math.max(0,r);
    for(const k in per)per[k]=+(per[k]/sum).toFixed(4); return {water:w.kind,depth:+w.depth.toFixed(1),period:pd,bait:bk,rate:+lam.toFixed(4),bite:+(1-Math.exp(-lam*SOAK)).toFixed(3),per}; };
  const pickBite=o=>{ if(FISHING.force&&(NAMES[FISHING.force]||JUNK.some(j=>j[0]===FISHING.force)))return FISHING.force; let s=Math.random(); for(const k in o.per)if((s-=o.per[k])<0)return k; return Object.keys(o.per)[0]; };

  /* ---------- the line, the float, the hooked fish ---------- */
  const NL=18, lineG=new THREE.BufferGeometry(); lineG.setAttribute('position',new THREE.BufferAttribute(new Float32Array((NL+2)*3),3));
  const line=new THREE.Line(lineG,new THREE.LineBasicMaterial({color:0xe8ece4})); line.visible=false; line.frustumCulled=false; scene.add(line);
  const bob=new THREE.Group(); { const red=new THREE.MeshLambertMaterial({color:0xd8402e}), wh=new THREE.MeshLambertMaterial({color:0xf2efe6}); const a=new THREE.Mesh(new THREE.SphereGeometry(.07*T,6,4,0,Math.PI*2,0,Math.PI/2),red), b=new THREE.Mesh(new THREE.SphereGeometry(.07*T,6,4,0,Math.PI*2,Math.PI/2,Math.PI/2),wh), s=new THREE.Mesh(new THREE.CylinderGeometry(.01*T,.01*T,.12*T,4),red); s.position.y=.08*T; bob.add(a,b,s); } bob.visible=false; scene.add(bob);
  const fishGeo=(()=>{ const pts=[], col=[], idx=[], R=6, L=[[-.5,0],[-.42,.06],[-.25,.16],[0,.21],[.22,.18],[.4,.1],[.5,0]];   // a fish a unit long, its back dark, its belly pale; the tail a fan
    for(let i=0;i<L.length;i++)for(let k=0;k<R;k++){ const a=k/R*Math.PI*2, y=Math.cos(a)*L[i][1], z=Math.sin(a)*L[i][1]*.45; pts.push(L[i][0],y,z); const v=y>0?.62:1.15; col.push(v,v,v); }
    for(let i=0;i<L.length-1;i++)for(let k=0;k<R;k++){ const a=i*R+k, b=i*R+(k+1)%R; idx.push(a,b,a+R,b,b+R,a+R); }
    const t=pts.length/3; pts.push(-.48,0,0,-.66,.17,0,-.66,-.17,0, .02,.2,0,-.18,.3,0,-.2,.15,0); col.push(.5,.5,.5,.4,.4,.4,.4,.4,.4,.45,.45,.45,.4,.4,.4,.45,.45,.45); idx.push(t,t+1,t+2,t,t+2,t+1,t+3,t+4,t+5,t+3,t+5,t+4);
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setIndex(idx); g.computeVertexNormals(); return g; })();
  const LOOK={x_perch:[0x9aa4a0,1,1],x_tomcod:[0x8a7a5a,1,.9],x_eel:[0x5a5030,3.2,.45],x_catfish:[0x6a6a5e,1.1,1],x_shad:[0xa8b8c0,1,1.1],x_flounder:[0x8a7458,1,2.2,.35],x_bluefish:[0x6a90a8,1,1],x_bass:[0x9aa490,1,1,1,1],x_sturgeon:[0x6a645a,1.5,.6],x_crab:[0x5a7aa0,.5,2,.6],
    x_sunfish:[0xc8a050,.8,1.4],x_bluegill:[0x8a98a0,.8,1.4],x_yperch:[0xc8b050,1,1],x_trout:[0xa8a0a0,1.1,.9],x_carp:[0xa89060,1,1.2],x_lbass:[0x7a8a50,1,1.1],x_pike:[0x7a8a4a,1.6,.6]};   // tint, length, height, width
  const fishM=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}), hooked=new THREE.Mesh(fishGeo,fishM.clone()); hooked.visible=false; scene.add(hooked);
  const FM=new Map(); FISHING.look=id=>{ if(!LOOK[id])return null; let m=FM.get(id); if(!m){ m=fishM.clone(); m.color.setHex(LOOK[id][0]); FM.set(id,m); } const o=new THREE.Mesh(fishGeo,m); o.userData.shared=true; shape(o,id,1); return o; };
  const lenOf=(id,kg)=>Y(.45*Math.cbrt(kg)*(LOOK[id]?LOOK[id][1]:1)), shape=(o,id,kg)=>{ const L=LOOK[id]||[0x888888,1,1,1], l=lenOf(id,kg); o.scale.set(l,l*(L[2]||1),l*(L[3]||1)); };
  // the fish you can see: a few of the river's own round the pier, near you only
  const NV=12, swim=new THREE.InstancedMesh(fishGeo,fishM,NV); swim.frustumCulled=false; swim.count=0; scene.add(swim); const VIS=[], m4=new THREE.Matrix4(), q4=new THREE.Quaternion(), e4=new THREE.Euler(), s4=new THREE.Vector3(), p4=new THREE.Vector3(), c4=new THREE.Color();
  const riverFish=SPECIES.filter(id=>IP(id,'water')==='river'&&id!=='x_crab');
  for(let i=0;i<NV;i++){ const id=riverFish[i%riverFish.length]; VIS.push({id,kg:(IP(id,'weight')||1)*(.5+Math.random()*.8),x:0,z:0,y:0,tx:0,tz:0,ty:0,t:0,h:0,ph:Math.random()*6}); swim.setColorAt(i,c4.setHex(LOOK[id][0])); }
  FISHING.VIS=VIS; FISHING.swim=swim; const swimTick=dt=>{ const Pd=window.PIER, near=Pd&&Pd.G&&Math.abs(pos.x-Pd.x)<26*T&&pos.z<rz1+12*T; swim.visible=!!near&&RIVER.shown; if(!swim.visible)return; swim.count=NV;
    VIS.forEach((f,i)=>{ f.t-=dt; if(f.t<=0||!f.x){ f.t=4+Math.random()*6; const z=Pd.zE+Math.random()*(Pd.z0-Pd.zE-2*T), d=RIVER.depthAt(Pd.x,z); f.tx=Pd.x+(Math.random()*2-1)*(Pd.HW+4*T); f.tz=z; f.ty=RB.lv-Y(.22+Math.random()*Math.min(.7,d*.2)); if(!f.x){ f.x=f.tx; f.z=f.tz; f.y=f.ty; } }
      if(S_&&(S_.st==="wait"||S_.st==="bite")&&S_.near===i){ f.tx=S_.x+Y(.3); f.tz=S_.z; f.ty=RB.lv-Y(.3); }
      const dx=f.tx-f.x, dz=f.tz-f.z, dd=Math.hypot(dx,dz)+1e-4, sp=Y(.35)*Math.min(1,dd/Y(1)); f.x+=dx/dd*sp*dt; f.z+=dz/dd*sp*dt; f.y+=(f.ty-f.y)*dt*.4; if(dd>Y(.2))f.h=Math.atan2(-dz,dx);
      if(RIVER.onPier(f.x,f.z,-.3*T)){ f.y=Math.min(f.y,RB.lv-Y(.6)); } f.ph+=dt*(4+sp*3);
      m4.compose(p4.set(f.x,f.y,f.z),q4.setFromEuler(e4.set(0,f.h+Math.sin(f.ph)*.18,0)),s4.set(1,1,1)); const L=LOOK[f.id], l=lenOf(f.id,f.kg); m4.scale(s4.set(l,l*(L[2]||1),l*(L[3]||1))); swim.setMatrixAt(i,m4); });
    swim.instanceMatrix.needsUpdate=true; if(swim.instanceColor)swim.instanceColor.needsUpdate=true; };

  /* ---------- the hook, the cast and the fight ---------- */
  let S_=null; FISHING.state=()=>S_;
  const HUDF=document.createElement('div'); HUDF.id='fishhud'; HUDF.hidden=true; HUDF.style.cssText='position:fixed;left:50%;bottom:52px;transform:translateX(-50%);z-index:7;font:11px Silkscreen,monospace;color:#e8e2cc;background:#0b0d13e0;border:2px solid #3a3f4e;padding:6px 10px;min-width:260px;text-align:center;zoom:var(--uiz,1)'; document.body.appendChild(HUDF);
  const bar=(v,c)=>`<span style="display:inline-block;width:90px;height:8px;border:1px solid #3a3f4e;vertical-align:middle;background:linear-gradient(90deg,${c} ${Math.round(cl(v,0,1)*100)}%,#151821 0)"></span>`;
  const hud=()=>{ const s=S_; if(!s){ HUDF.hidden=true; return; } HUDF.hidden=false; let t='';
    if(s.st==='wind'||s.st==='fly')t='CASTING...'; else if(s.st==='wait')t=s.bare?'YOUR HOOK IS BARE. CLICK TO REEL IN.':s.nib>0?'A NIBBLE...':s.t>SOAK?'NOTHING IS BITING. TRY ANOTHER SPOT, BAIT OR HOUR.':'WAITING FOR A BITE · CLICK TO REEL IN';
    else if(s.st==='bite')t='<b style="color:#f2c14e">BITE! CLICK TO STRIKE</b>';
    else if(s.st==='fight')t=`ON THE LINE · ${FISHING.reeling?'REELING':'HOLD THE MOUSE TO REEL'}<br>LINE ${bar(s.ten/1.1,s.ten>.85?'#d85a3a':'#8fe3d6')} FISH ${bar(s.f.s,'#b8f0a0')} ${(s.D/WU).toFixed(1)} M`;
    else if(s.st==='land')t=`<b style="color:#b8f0a0">${(NAMES[s.f.id]||FORAGE.NM[s.f.id]||'').toString()} · ${s.f.kg.toFixed(2)} KG</b><br>CLICK TO TAKE IT OFF THE HOOK`;
    HUDF.innerHTML=t; };
  const tip=new THREE.Vector3(), from=()=>{ if(WIELD.on==='rod'&&WIELD.tip.lengthSq()>0&&Math.hypot(WIELD.tip.x-pos.x,WIELD.tip.z-pos.z)<4*T)return tip.copy(WIELD.tip); return tip.set(pos.x+Math.sin(SHARED.heading)*.6*T,SHARED.py+Y(1.9),pos.z+Math.cos(SHARED.heading)*.6*T); };
  const hookOn=id=>{ if(!FORAGE.has(id))return say('YOU HAVE NO '+FORAGE.NM[id]+'.','#c8a090'); S.hook=id; FORAGE.take(id,1); FORAGE.save(); say(`YOU PUT ${id==='bait'?'A WORM':'A STRIP OF BUNKER'} ON THE HOOK.`); SFX.play('click',{vol:.3}); FORAGE.draw(); };
  FISHING.hookOn=hookOn;
  FISHING.reel=()=>{ S_=null; line.visible=bob.visible=hooked.visible=false; FISHING.bendK=.03; FISHING.reeling=false; hud(); };
  FISHING.cast=(x,z)=>{ if(!FORAGE.has('rod'))return say('YOU NEED A ROD. BAIT & BOATS BY THE PIER SELLS THEM.','#c8a090'); const w=FISHING.at(x,z); if(!w)return say('THAT IS NOT WATER YOU CAN FISH.','#c8a090');
    if(!S.hook){ const b=['bait','bait_cut'].find(id=>FORAGE.has(id)); if(!b)return say('YOU NEED BAIT. BAIT & BOATS BY THE PIER SELLS IT.','#c8a090'); hookOn(b); }
    if(!BOAT.on&&WIELD.on!=='rod')WIELD.set('rod'); if(!BOAT.on)SHARED.heading=Math.atan2(x-pos.x,z-pos.z);
    S_={st:'wind',t:0,x,z,w,ax:pos.x,az:pos.z,tx:x,tz:z,nib:0,near:-1}; SFX.play('step',{vol:.25,pitch:1.8}); hud(); };
  FISHING.click=()=>{ const s=S_;
    if(!s){ const r=WIELD.ray; if(!r)return; const ok=v=>v&&FISHING.at(v.x,v.z); let hit=null; for(const lv of [RB.lv,FOUNT.LV,-.25*T].filter(v=>v!=null)){ const h=new THREE.Vector3(); if(r.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-lv),h)&&ok(h)){ hit=h; break; } }
      if(!hit)return say('CLICK ON OPEN WATER TO CAST.','#c8a090'); let dx=hit.x-pos.x, dz=hit.z-pos.z, d=Math.hypot(dx,dz); const mx=16*T; if(d>mx){ hit.x=pos.x+dx/d*mx; hit.z=pos.z+dz/d*mx; } if(d<1.5*T)return say('CAST FURTHER OUT.','#c8a090'); return FISHING.cast(hit.x,hit.z); }
    if(s.st==='bite')return strike(); if(s.st==='fight'){ FISHING.reeling=true; return; } if(s.st==='land')return unhook(); if(s.st==='wait'||s.st==='fly'){ FISHING.reel(); say('YOU REEL IN YOUR LINE.'); } };
  const strike=()=>{ const s=S_, id=s.f.id, fi=IP(id,'fight')||1, quick=s.t<.45?10:0; const ok=FISHING.force===id||FORAGE.use('fish',fi*5-40,fi*5+50,quick);
    if(!ok){ S.hook=Math.random()<.5?S.hook:null; say(S.hook?'YOU STRIKE, BUT THE HOOK DOES NOT SET.':'YOU STRIKE TOO LATE. THE BAIT IS GONE.','#c8a090'); s.st='wait'; s.t=SOAK+1; s.bare=!S.hook; return; }
    s.st='fight'; s.t=0; s.D=Math.hypot(s.x-pos.x,s.z-pos.z); s.ten=.4; s.over=0; s.slack=0; s.surge=0; SFX.play('step',{vol:.4,pitch:1.2}); say('FISH ON!','#b8f0a0'); RIVER.drop&&RIVER.drop(s.x,s.z,.4*T,.05*WU); };
  const unhook=()=>{ const s=S_, f=s.f; FORAGE.give(f.id); const r=S.fishkg[f.id]||[0,0]; S.fishkg[f.id]=[+f.kg.toFixed(2),Math.max(r[1],+f.kg.toFixed(2))]; S.hook=null; FORAGE.save();
    if(f.id==='chest'){ const g=INV.random(), c=10+Math.floor(Math.random()*31); INV.add(g); INV.cash+=c; FORAGE.take('chest',1); say(`A SUNKEN CHEST! INSIDE: $${c} AND A ${GEMS.find(x=>x[0]===g)[1]}.`,'#f2c14e'); if(window.BOOKS&&Math.random()<.4)BOOKS.chest(); }
    else say(`YOU TAKE ${NAMES[f.id]?'THE '+f.kg.toFixed(2)+' KG '+NAMES[f.id]:'THE '+FORAGE.NM[f.id]} OFF THE HOOK.`,NAMES[f.id]?'#b8f0a0':'#c8c2b0');
    SFX.play('drip',{vol:.6}); FISHING.last={id:f.id,kg:+f.kg.toFixed(2)}; FISHING.reel(); FORAGE.draw(); };
  const V=new THREE.Vector3();
  FISHING.tick=dt=>{ dt*=FISHING.speed||1; const s=S_; if(!s){ FISHING.bendK=.03; return; } s.t+=dt;
    if(Math.hypot(pos.x-s.ax,pos.z-s.az)>(BOAT.on?2.5*T:.6*T)||!FORAGE.has('rod')){ if(s.st==='land')return unhook(); FISHING.reel(); return say('YOU REEL IN YOUR LINE.'); }
    const lv=s.w.lv, a=from(); let bx=s.x, bz=s.z, by=lv+(s.w.kind==='river'?RIVER.hAt(s.x,s.z):0), fx=null;
    if(s.st==='wind'){ if(s.t>.38){ s.st='fly'; s.t=0; s.sx=a.x; s.sy=a.y; s.sz=a.z; s.T=.55+Math.hypot(s.x-a.x,s.z-a.z)/(14*T); } bob.visible=false; line.visible=false; FISHING.bendK=.18; hud(); return; }
    if(s.st==='fly'){ const u=Math.min(1,s.t/s.T); bx=s.sx+(s.x-s.sx)*u; bz=s.sz+(s.z-s.sz)*u; by=s.sy+(lv-s.sy)*u+Math.sin(Math.PI*u)*Y(2.5);
      if(u>=1){ s.st='wait'; s.t=0; SFX.play('drip',{vol:.35,pitch:.7}); RIVER.drop&&s.w.kind==='river'&&RIVER.drop(s.x,s.z,.3*T,.03*WU); const o=FISHING.odds(s.x,s.z); s.o=o; s.bare=!S.hook; s.tb=o&&o.rate>0&&!s.bare?-Math.log(1-Math.random())/o.rate:1e9; if(FISHING.force)s.tb=Math.min(s.tb,2+Math.random()*2); s.near=VIS.reduce((b,f,i)=>Math.hypot(f.x-s.x,f.z-s.z)<Math.hypot(VIS[b].x-s.x,VIS[b].z-s.z)?i:b,0); } FISHING.bendK=.06; }
    else if(s.st==='wait'){ s.x+=(s.w.kind==='river'?.05*WU:0)*dt*Math.max(0,1-s.t/30); bx=s.x; if(s.t>s.tb-1.2&&s.t<s.tb){ s.nib=1; by-=.03*T*Math.max(0,Math.sin(s.t*22)); } else s.nib=0;
      if(s.t>=s.tb){ const id=pickBite(s.o), w=IP(id,'weight')||.6; s.f={id,kg:w*(.5+Math.pow(Math.random(),1.4)*1.2),s:1}; if(FISHING.force===id)s.f.kg=Math.max(s.f.kg,w); s.st='bite'; s.t=0; rests.push([s.x,s.z,performance.now()/1000]); if(rests.length>20)rests.shift(); SFX.play('drip',{vol:.5,pitch:1.4}); RIVER.drop&&s.w.kind==='river'&&RIVER.drop(s.x,s.z,.25*T,.04*WU); }
      FISHING.bendK=.04+s.nib*.05; }
    else if(s.st==='bite'){ by-=.12*T*(.6+.4*Math.abs(Math.sin(s.t*9))); FISHING.bendK=.18+.06*Math.sin(s.t*14); if(FISHING.auto&&s.t>.3)return strike(); if(s.t>(FISHING.win||1.4)){ S.hook=null; s.bare=true; s.st='wait'; s.t=SOAK+1; say('THE FISH STEALS YOUR BAIT.','#c8a090'); } }
    else if(s.st==='fight'){ const f=s.f, fi=(IP(f.id,'fight')||1)/10, W0=IP(f.id,'weight')||.6, P0=fi*(.5+.5*Math.min(1.6,f.kg/W0));
      if(s.surge>0)s.surge-=dt; else if(Math.random()<dt*.5*f.s){ s.surge=.6+Math.random()*.7; RIVER.drop&&s.w.kind==='river'&&RIVER.drop(s.x,s.z,.3*T,.03*WU); }
      const pull=P0*(.3+.7*f.s)*(s.surge>0?1.6:1); if(FISHING.auto)FISHING.reeling=pull*.9+.3<.95&&s.over<.2;
      if(FISHING.reeling){ s.ten=pull*.9+.3; s.D-=dt*Y(1.1)*Math.max(.15,1-.6*pull); } else { s.ten=pull*.45; s.D=Math.min(Y(45),s.D+dt*Y(1.4)*pull*f.s); }
      f.s=Math.max(0,f.s-dt*(.03+.12*s.ten));
      if(s.ten>1){ s.over+=dt; if(s.over>.6){ S.hook=null; FISHING.reel(); return say('THE LINE SNAPS! TOO MUCH STRAIN.','#d88a70'); } } else s.over=Math.max(0,s.over-dt);
      if(s.ten<.18){ s.slack+=dt; if(s.slack>3){ S.hook=null; FISHING.reel(); return say('THE LINE WENT SLACK. THE HOOK SLIPS AND THE FISH IS GONE.','#c8a090'); } } else s.slack=0;
      const dx=s.tx-s.ax, dz=s.tz-s.az, dl=Math.hypot(dx,dz)+1e-4, sw=Math.sin(s.t*1.7)*Y(1.2)*f.s; s.x=pos.x+dx/dl*s.D+(-dz/dl)*sw; s.z=pos.z+dz/dl*s.D+(dx/dl)*sw;
      if(s.w.kind==='river'&&RIVER.onPier(s.x,s.z,.2*T)){ s.D=Math.max(0,s.D-dt*Y(1)); }
      fx=[s.x,lv-Y(.25+.7*f.s)+(s.surge>0?Y(.2):0),s.z]; FISHING.bendK=.05+.4*Math.min(1.2,s.ten);
      if(s.D<Y(1.4)){ s.st='land'; s.t=0; SFX.play('drip',{vol:.6,pitch:.8}); say(`YOU LIFT ${NAMES[f.id]?'A '+NAMES[f.id]:'IT'} OUT OF THE WATER.`,'#b8f0a0'); } }
    else if(s.st==='land'){ FISHING.bendK=.12+Math.min(.3,s.f.kg*.04); fx=[a.x+Math.sin(s.t*2.4)*Y(.08),a.y-Y(.55)-lenOf(s.f.id,s.f.kg)*.5,a.z+Math.cos(s.t*1.9)*Y(.06)]; if(FISHING.auto&&s.t>1.2)return unhook(); }
    bob.visible=s.st!=='land'&&s.st!=='fight'; bob.position.set(bx,by,bz);
    hooked.visible=!!fx&&!!NAMES[s.f.id]; if(fx){ hooked.position.set(...fx); shape(hooked,s.f.id,s.f.kg); hooked.material.color.setHex((LOOK[s.f.id]||[0x8a8a7a])[0]); if(s.st==='land'){ hooked.rotation.set(0,s.t*.7,Math.PI/2+Math.sin(s.t*11)*.25); } else hooked.rotation.set(0,Math.atan2(-(s.z-s.az),s.x-s.ax)+Math.sin(s.t*6)*.4,0); }
    const e=fx?V.set(...fx):V.set(bx,by,bz), arr=lineG.attributes.position, sag=s.st==='fight'?Y(.5)*Math.max(0,.8-s.ten):s.st==='land'?0:Y(.4);
    for(let i=0;i<=NL;i++){ const u=i/NL; arr.setXYZ(i,a.x+(e.x-a.x)*u,a.y+(e.y-a.y)*u-sag*4*u*(1-u),a.z+(e.z-a.z)*u); }
    if(s.st==='wait'||s.st==='bite')arr.setXYZ(NL+1,bx,by-Y(.9),bz); else arr.setXYZ(NL+1,e.x,e.y,e.z); arr.needsUpdate=true; lineG.setDrawRange(0,NL+2); line.visible=s.st!=='wind';
    if(fx&&s.st==='fight'&&Math.random()<dt*3&&s.w.kind==='river')RIVER.drop&&RIVER.drop(fx[0],fx[2],.2*T,.012*WU);
    hud(); };
  // the arm: idle the rod up; the cast back over the shoulder and through; the fight's rod held high toward the fish
  FISHING.aim=(dt,aim)=>{ const s=S_, h=SHARED.heading, fx=Math.sin(h), fz=Math.cos(h), set=(f,u)=>aim.set(fx*f,u,fz*f).normalize();
    if(!s)return set(.9,-.35),true; const t=s.t;
    if(s.st==='wind')return set(-.35,1),true; if(s.st==='fly')return t<.22?set(1,.15-t*2):set(1,-.3),true;
    if(s.st==='fight'){ const dx=s.x-pos.x, dz=s.z-pos.z, d=Math.hypot(dx,dz)+1e-4; aim.set(dx/d*.8,.15+.25*Math.min(1,s.ten)+(FISHING.reeling?Math.sin(t*16)*.06:0),dz/d*.8).normalize(); return true; }
    if(s.st==='land')return set(.7,.35),true; return set(.9,-.25+(s.st==='bite'?.05*Math.sin(t*20):0)),true; };
  FISHING.bendK=.03;
  /* ---------- the pack: bait the hook, cast, and each fish's last and best weight ---------- */
  FORAGE.ROWB.push(id=>id==='rod'?[[S_?'REEL IN':'CAST','fcast']]:(id==='bait'||id==='bait_cut')?[['ON THE HOOK','fhook']]:[]);
  FORAGE.NOTE.push(id=>id==='rod'?'HOOK: '+(S.hook==='bait'?'WORM':S.hook==='bait_cut'?'CUT BAIT':'BARE'):S.fishkg[id]?`LAST ${S.fishkg[id][0]} KG · BEST ${S.fishkg[id][1]} KG`:'');
  FORAGE.ACT.fhook=id=>{ if(S.hook&&S.hook!==id)FORAGE.give(S.hook,1); if(S.hook!==id)hookOn(id); };
  FORAGE.ACT.fcast=()=>{ if(S_){ if(S_.st==='land')return unhook(); FISHING.reel(); return say('YOU REEL IN YOUR LINE.'); } const h=SHARED.heading; for(const d of [6,4,9,3]){ const x=pos.x+Math.sin(h)*d*T, z=pos.z+Math.cos(h)*d*T; if(FISHING.at(x,z))return FISHING.cast(x,z); } say('NO WATER AHEAD TO CAST INTO.','#c8a090'); };
  const pick0=RIVER.pick; RIVER.pick=(ray,p)=>{ const pl=new THREE.Plane(new THREE.Vector3(0,1,0),-RB.lv), hp=new THREE.Vector3(); if(FORAGE.has('rod')&&!RIVER.swim&&!S_&&ray.intersectPlane(pl,hp)&&FISHING.at(hp.x,hp.z)){ const d=Math.hypot(hp.x-p.x,hp.z-p.z); if(d<16*T&&d>1.5*T){ FISHING.cast(hp.x,hp.z); return true; } }
    return pick0(ray,p); };
  { SYS.add('life',(dt)=>{ FISHING.tick(dt); swimTick(dt); },'142-fishing'); }
  window.FISHDBG=()=>({rod:FORAGE.has('rod'),hook:S.hook||null,held:WIELD.on,state:S_&&{st:S_.st,t:+S_.t.toFixed(2),fish:S_.f&&{id:S_.f.id,kg:+S_.f.kg.toFixed(2),s:+S_.f.s.toFixed(2)},ten:S_.ten!=null?+S_.ten.toFixed(2):null,D:S_.D!=null?+(S_.D/WU).toFixed(1):null,x:+S_.x.toFixed(2),z:+S_.z.toFixed(2),odds:S_.o},
    boat:BOAT.on?{x:+BOAT.x.toFixed(2),z:+BOAT.z.toFixed(2),v:+BOAT.v.toFixed(2)}:null,stand:{x:SX,z:SZ},pier:PX,skill:FORAGE.sk('fish'),last:FISHING.last||null,swim:swim.visible?swim.count:0}); });
