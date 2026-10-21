const FISHING={}, BOAT={on:false}; window.FISHING=FISHING; window.BOAT=BOAT;
{ const T=TILE, RB=RIVER.box, rz0=RB.z0, rz1=RB.z1, WU=T/.84, cl=(v,a,b)=>v<a?a:v>b?b:v;
  const FI=[['x_sunfish','SUNFISH',0,3,0,4,5,.07],['x_perch','WHITE PERCH',5,4,0,5,5,.08],['x_crab','BLUE CRAB',15,8,0,4,2,.06],['x_eel','AMERICAN EEL',20,9,0,9,3,.08],
    ['x_catfish','CHANNEL CATFISH',25,10,2,9,3,.1],['x_flounder','FLOUNDER',30,12,3,9,2,.1],['x_shad','AMERICAN SHAD',35,11,3,9,2,.09],['x_bluefish','BLUEFISH',45,16,4,9,2,.12],
    ['x_bass','STRIPED BASS',50,20,4,9,3,.14],['x_sturgeon','ATLANTIC STURGEON',75,60,6,9,.6,.2]];
  const JUNK=[['x_boot','OLD BOOT',0,1,0,9,1.2],['x_can','TIN CAN',0,1,0,9,.9],['x_note','MESSAGE IN A BOTTLE',40,5,2,9,.3],['bk_novel','WATER-STAINED NOVEL',10,1,0,9,.5],['chest','SUNKEN CHEST',70,0,5,9,.25]];
  FORAGE.add({names:Object.fromEntries([...FI,...JUNK].map(f=>[f[0],f[1]]).concat([['rod','FISHING ROD']])),raw:Object.fromEntries(FI.map(f=>[f[0],[f[7],.3]])),
    prices:{f_fishfry:12,f_grillbass:34,f_chowder:30,f_smokeeel:22,f_sturgeon:90},
    recipes:[['f_fishfry','FISH FRY','cooking',[10,50],{x_perch:2},'fills a third'],['f_smokeeel','SMOKED EEL','cooking',[25,70],{x_eel:2},'fills two fifths, strong 2 min'],
      ['f_grillbass','GRILLED STRIPED BASS','cooking',[30,75],{x_bass:1},'fills half, mends you a minute'],['f_chowder','FISH CHOWDER','cooking',[40,85],{x_catfish:1,m_button:2},'fills more than half, some health'],
      ['f_sturgeon','STURGEON STEAK','cooking',[65,110],{x_sturgeon:1},'fills most of you, quick on your feet 3 min']],
    does:{f_fishfry:()=>FORAGE.feed(.33),f_smokeeel:()=>{ FORAGE.feed(.4); FORAGE.buff('str',120); },f_grillbass:()=>{ FORAGE.feed(.5); FORAGE.buff('regen',60); },
      f_chowder:()=>{ FORAGE.feed(.6); VIT.hp=Math.min(1,VIT.hp+.3); },f_sturgeon:()=>{ FORAGE.feed(.8); FORAGE.buff('swift',180); }}});
  const say=FORAGE.say, PRICE=Object.fromEntries([...FI,...JUNK].map(f=>[f[0],f[3]]));
  const PX=RIVER.piers.reduce((b,x)=>Math.abs(x-BOD.XS(61))<Math.abs(b-BOD.XS(61))?x:b,RIVER.piers[0]), SX=PX+2.6*T, SZ=rz1+1.55*T;
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
  STAND.draw=()=>{ '@later'; if(sp.hidden)return; const ids=Object.keys(INV.items).filter(id=>INV.items[id]>0&&PRICE[id]!=null).sort();
    let o=`<h3 style="margin:0 0 4px;color:#f2c14e;font:12px Silkscreen,monospace">BAIT & BOATS</h3><div style="color:#9b9584;margin-bottom:8px">Self serve. Pay in the box. Catches bought at the board's price.</div><div style="margin-bottom:8px">YOU HAVE <b style="color:#f2c14e">$${Math.round(INV.cash)}</b> · FISHING ${FORAGE.sk('fish').toFixed(1)}</div><table style="border-collapse:collapse;width:100%">`;
    o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">FISHING ROD</td><td style="text-align:right;padding:4px 6px">$15</td><td style="text-align:right">${FORAGE.has('rod')?'YOURS':`<button ${B} data-buy="rod">BUY</button>`}</td></tr>`;
    o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">ROWBOAT · A TRIP</td><td style="text-align:right;padding:4px 6px">$5</td><td style="text-align:right">${BOAT.on?'OUT':`<button ${B} data-boat="1">RENT</button>`}</td></tr></table>`;
    o+=`<div style="margin:10px 0 4px;color:#9b9584">YOUR CATCH</div><table style="border-collapse:collapse;width:100%">`;
    for(const id of ids){ const v=PRICE[id], n=INV.items[id]; o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">${FORAGE.NM[id]}</td><td style="text-align:right;padding:4px 6px">$${v}</td><td style="text-align:right">x${n}</td><td style="text-align:right;white-space:nowrap"><button ${B} data-sell="${id}">SELL</button>${n>1?`<button ${B} data-sell="${id}" data-n="all">ALL $${v*n}</button>`:''}</td></tr>`; }
    o+=`</table>${ids.length?'':'<div style="color:#7d7a70;margin-top:6px">Nothing yet. With a rod, double click the water near you to cast. Deeper water, bigger fish.</div>'}`;
    const x=sp.querySelector(':scope>.pX'); sp.innerHTML=o; if(x)sp.appendChild(x); };
  sp.addEventListener('click',e=>{ '@later'; const b=e.target.closest('button'); if(!b||b.classList.contains('pX'))return; const d=b.dataset;
    if(d.buy==='rod'){ if(INV.cash<15)say('YOU CANNOT AFFORD THAT.','#c8a090'); else { INV.cash-=15; FORAGE.give('rod'); say('YOU TAKE A ROD AND DROP $15 IN THE BOX.'); } }
    if(d.boat){ if(INV.cash<5)say('YOU CANNOT AFFORD THAT.','#c8a090'); else { INV.cash-=5; sp.hidden=true; BOAT.launch(); } }
    if(d.sell){ const n=d.n==='all'?FORAGE.has(d.sell):1, v=PRICE[d.sell]*n; FORAGE.take(d.sell,n); INV.cash+=v; say(`YOU SELL ${n} ${FORAGE.NM[d.sell]} FOR $${v}.`,'#f2c14e'); if(typeof SFX!=='undefined')SFX.play('clunk',{vol:.5}); }
    STAND.draw(); FORAGE.draw(); });
  STAND.open=()=>{ sp.hidden=false; STAND.draw(); };
  const boat=new THREE.Group(); boat.visible=false; scene.add(boat); const BW=1.1*T, BLn=2.6*T, Y=v=>v*T/.84;
  { const mat=new THREE.MeshLambertMaterial({color:0xe8e2d2}), trim=new THREE.MeshLambertMaterial({color:0xa83a2a}), wood=new THREE.MeshLambertMaterial({color:0x7a5634}), add=(m,x,y,z,w,h,d)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); o.castShadow=true; boat.add(o); return o; };
    add(mat,0,Y(.05),0,BW*.8,Y(.1),BLn*.86); for(const o of [-1,1]){ add(mat,o*BW*.45,Y(.25),0,.08*T,Y(.45),BLn*.86); add(trim,o*BW*.45,Y(.48),0,.1*T,Y(.05),BLn*.86); }
    add(mat,0,Y(.28),BLn*.45,BW*.55,Y(.5),.1*T); add(mat,0,Y(.25),-BLn*.45,BW*.85,Y(.45),.1*T); add(wood,0,Y(.35),.1*T,BW*.82,Y(.05),.3*T); add(wood,0,Y(.3),-BLn*.32,BW*.7,Y(.05),.3*T);
    BOAT.oars=[-1,1].map(o=>{ const p=new THREE.Group(); p.position.set(o*BW*.48,Y(.5),.1*T); const a=new THREE.Mesh(new THREE.BoxGeometry(1.5*T,.05*T,.05*T),wood); a.position.x=o*.6*T; const bl=new THREE.Mesh(new THREE.BoxGeometry(.4*T,.02*T,.16*T),wood); bl.position.x=o*1.3*T; p.add(a,bl); boat.add(p); return p; }); }
  BOAT.x=0; BOAT.z=0; BOAT.hd=Math.PI; BOAT.v=0; BOAT.py=0; let row=0;
  const atShore=()=>{ const L=RIVER.ladders.find(x=>Math.abs(x-BOAT.x)<1.3*T&&BOAT.z>rz1-1.6*T); if(L!=null)return {x:L,z:rz1+.7*T}; const P=RIVER.piers.find(x=>Math.abs(x-BOAT.x)<2.6*T&&BOAT.z>rz1-9.5*T); if(P!=null)return {x:P,z:rz1+.7*T}; return null; };
  BOAT.launch=()=>{ BOAT.x=PX+2.5*T; BOAT.z=rz1-1.8*T; BOAT.hd=Math.PI; BOAT.v=0; BOAT.on=true; boat.visible=true; target=null; say('YOU STEP INTO THE ROWBOAT. ROW WITH W A S D.'); HUD.hidden=false; BOAT.place(); };
  BOAT.ashore=()=>{ const s=atShore(); if(!s)return say('ROW TO A LADDER OR A PIER FIRST.','#c8a090'); BOAT.on=false; boat.visible=false; st.sit=null; pos.x=s.x; pos.z=s.z; py=0; HUD.hidden=true; FISHING.reel(); say('YOU TIE UP THE BOAT AND CLIMB OUT.'); };
  BOAT.steer=(dt,mx,mz)=>{ '@later'; const m=Math.hypot(mx,mz); if(m>0){ let dh=Math.atan2(mx,mz)-BOAT.hd; dh=Math.atan2(Math.sin(dh),Math.cos(dh)); BOAT.hd+=cl(dh,-1.7*dt,1.7*dt); if(Math.abs(dh)<1.2)BOAT.v=Math.min(3.2*T,BOAT.v+3.6*T*dt); row+=dt*5; }
    else BOAT.v*=Math.exp(-dt*1.1); if(BOAT.v<.03*T&&!m)BOAT.v=0;
    const o={x:BOAT.x+Math.sin(BOAT.hd)*BOAT.v*dt,z:BOAT.z+Math.cos(BOAT.hd)*BOAT.v*dt}; o.x=cl(o.x,RB.x0+1.5*T,RB.x1-1.5*T); o.z=cl(o.z,rz0+1*T,rz1-.9*T);
    for(const px of RIVER.piers)if(Math.abs(o.x-px)<1.9*T&&o.z>rz1-9.6*T){ if(Math.abs(BOAT.x-px)>=1.9*T)o.x=BOAT.x; else o.z=Math.min(o.z,rz1-9.6*T); }
    if(Math.hypot(o.x-BOAT.x,o.z-BOAT.z)<.001)BOAT.v=Math.min(BOAT.v,.5*T); BOAT.x=o.x; BOAT.z=o.z; BOAT.place(); };
  BOAT.place=()=>{ '@later'; const h=RIVER.hAt(BOAT.x,BOAT.z); BOAT.py=RB.lv+h+Y(.12); boat.position.set(BOAT.x,RB.lv+h-Y(.05),BOAT.z); boat.rotation.y=BOAT.hd;
    const a=Math.sin(row)*.6; BOAT.oars[0].rotation.y=-a; BOAT.oars[1].rotation.y=a; BOAT.oars[0].rotation.z=.2+.15*Math.cos(row); BOAT.oars[1].rotation.z=-.2-.15*Math.cos(row); };
  BOAT.carry=(st,pos)=>{ pos.x=BOAT.x; pos.z=BOAT.z; st.sit={z:Math.max(2,Y(.3)/(ZU*W3.SZ*(W3.BH||1)))}; if(RIVER.swim)RIVER.swim=false; if(st.water)st.water.in=false; };
  const HUD=document.createElement('div'); HUD.id='boathud'; HUD.hidden=true; { const c=document.createElement('style'); c.textContent='#boathud[hidden],#minehud[hidden],#fjour:empty{display:none!important}'; document.head.appendChild(c); } HUD.style.cssText='position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:7;font:11px Silkscreen,monospace;color:#e8e2cc;background:#0b0d13e0;border:2px solid #3a3f4e;padding:6px 10px;display:flex;gap:10px;align-items:center;zoom:var(--uiz,1)';
  HUD.innerHTML='<span>ROWBOAT · W A S D</span><button style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 8px;cursor:pointer">STEP ASHORE</button>'; document.body.appendChild(HUD);
  HUD.querySelector('button').onclick=()=>BOAT.ashore(); setInterval(()=>{ if(BOAT.on)HUD.querySelector('button').style.opacity=atShore()?1:.45; },400);
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0xe8e8e8})); line.visible=false; line.frustumCulled=false; scene.add(line);
  const bob=new THREE.Mesh(new THREE.OctahedronGeometry(.09*T,0),new THREE.MeshLambertMaterial({color:0xd8402e,flatShading:true})); bob.visible=false; scene.add(bob);
  const pl=new THREE.Plane(new THREE.Vector3(0,1,0),-RB.lv), hp=new THREE.Vector3(); let F=null;
  FISHING.reel=()=>{ F=null; line.visible=bob.visible=false; };
  const pick0=RIVER.pick; RIVER.pick=(ray,p)=>{ '@later'; if(FORAGE.has('rod')&&!RIVER.swim&&ray.intersectPlane(pl,hp)&&hp.x>RB.x0&&hp.x<RB.x1&&hp.z>rz0&&hp.z<rz1){ const d=Math.hypot(hp.x-p.x,hp.z-p.z);
      if(d<9*T&&d>.8*T&&!RIVER.piers.some(x=>Math.abs(hp.x-x)<1.2*T&&hp.z>rz1-9*T)){ FISHING.cast(hp.x,hp.z); return true; } }
    return pick0(ray,p); };
  FISHING.cast=(x,z)=>{ if(!BOAT.on)heading=Math.atan2(x-pos.x,z-pos.z); F={x,z,t:3+Math.random()*5,dip:0,ax:pos.x,az:pos.z}; line.visible=bob.visible=true; say('YOU CAST YOUR LINE.'); if(typeof SFX!=='undefined')SFX.play('click',{vol:.4}); };
  const pickFish=(dep)=>{ const night=CLOCK.h<6||CLOCK.h>=20, L=[...FI,...JUNK].filter(f=>dep>=f[4]&&dep<=f[5]+1).map(f=>[f,f[6]*(f[0]==='x_eel'&&night?2:1)]); let s=L.reduce((a,b)=>a+b[1],0)*Math.random(); for(const [f,w] of L)if((s-=w)<0)return f; return FI[0]; };
  FISHING.tick=dt=>{ if(!F)return; if(Math.hypot(pos.x-F.ax,pos.z-F.az)>(BOAT.on?2.5*T:.5*T)){ FISHING.reel(); return say('YOU REEL IN YOUR LINE.'); }
    const h=RIVER.hAt(F.x,F.z); F.t-=dt; if(F.t<0)F.dip+=dt; bob.position.set(F.x,RB.lv+h+.02*T-(F.dip>0?.08*T*Math.abs(Math.sin(F.dip*14)):0),F.z);
    const a=line.geometry.attributes.position; a.setXYZ(0,pos.x+Math.sin(heading)*.5*T,py+Y(1.6),pos.z+Math.cos(heading)*.5*T); a.setXYZ(1,bob.position.x,bob.position.y,bob.position.z); a.needsUpdate=true;
    if(F.dip>.7){ const f=pickFish(RIVER.depthAt(F.x,F.z)), d=f[2]; FISHING.reel();
      if(FORAGE.use('fish',d-25,d+25)){ if(f[0]==='chest'){ const g=INV.random(), c=10+Math.floor(Math.random()*31); INV.add(g); INV.cash+=c; say(`A SUNKEN CHEST! INSIDE: $${c} AND A ${GEMS.find(x=>x[0]===g)[1]}.`,'#f2c14e');  if(window.BOOKS&&Math.random()<.4)BOOKS.chest(); }
        else { FORAGE.give(f[0]); say(`YOU PULL OUT ${/^[AEIOU]/.test(f[1])?'AN':'A'} ${f[1]}!`,f[0].match(/boot|can/)?'#c8c2b0':'#b8f0a0'); } if(typeof SFX!=='undefined')SFX.play('drip',{vol:.6}); }
      else say('THE FISH GOT AWAY.','#c8a090'); FORAGE.draw(); } };
  { SYS.add('world',(dt)=>{ FISHING.tick(dt); },'142-fishing'); }
  window.FISHDBG=()=>({rod:FORAGE.has('rod'),fishing:!!F,boat:BOAT.on?{x:+BOAT.x.toFixed(2),z:+BOAT.z.toFixed(2),v:+BOAT.v.toFixed(2)}:null,stand:{x:SX,z:SZ},pier:PX,skill:FORAGE.sk('fish')}); }
