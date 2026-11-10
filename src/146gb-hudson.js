// THE HUDSON'S SET PIECES: the Old Catfish under the pier (2 to 4 am, cut bait, a strong line), Heron Island in the shallows and its herons at dawn, gold in the silt round the wreck (scanner and extractor), the sunken safe under its debris, the Long Swim from the pier to the island, the wreck's bronze bell (a winch raises it; it hangs in the park for anyone to ring) and the pirate captain's logbook (mend it, read it, dig on the island).
import {SHARED, THREE} from './003-shx.js';
import {CITY, CLOCK, EQUIP, FORAGE, INSPECT, INV, ITEMS, MAIL, ONLINE, PARK, pos, SFX, st, SWIM, UI, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {QS, SECTION, SYS, TILE, ZU} from './006-map-pre.js';
import {RIVER} from './066-river.js';
import {WRECK} from './066ba-wreck.js';
import {GEMS} from './101-gems.js';
import {FISHING} from './142-fishing.js';
const HUDSON={}; window.HUDSON=HUDSON;
{ const T=TILE, MW=T/.84, say=(t,c)=>SAY(t,c||'#9fd8ff'), KEY='hudson', cl=(v,a,b)=>v<a?a:v>b?b:v, L=c=>new THREE.MeshLambertMaterial({color:c});
  const day=()=>window.MAIL&&MAIL.ready?MAIL.day():CITY?CITY.day||0:0, done=k=>{ INV.picked[k]=day(); INV.save(); };
  const S={v:1,book:0,read:0,tries:0,dug:0,digs:0,best:0,medal:0,spook:-1,bell:0,safe:{d:-1,n:0}};
  try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1&&!(QS.get('fresh')&&QS.get('keepinv')!=='1'))Object.assign(S,D); }catch(e){} const save=()=>OWNED.set(KEY,JSON.stringify(S)); HUDSON.S=S;
  const str=()=>FORAGE.ST.str*(FORAGE.S.fx&&FORAGE.S.fx.str?1.5:1), int=()=>FORAGE.ST.int;
  const air=s=>{ if(EQUIP.breathe&&SWIM.tankS>0)SWIM.tankS=Math.max(0,SWIM.tankS-s); else VIT.air=Math.max(0,VIT.air-s); };   // heaving and cranking under water costs breath
  const sy=HUDSON.sy=()=>st.water&&st.water.in&&st.water.level!=null?st.water.y*ZU:SHARED.py;   // your height, a swimmer's own
  const bedY=(x,z)=>RIVER.box.lv-RIVER.depthAt(x,z)*MW, d2=(o,x,z)=>Math.hypot(o.x-x,o.z-z);
  const mesh=(G,geo,mat,x,y,z)=>{ const o=new THREE.Mesh(geo,mat); o.position.set(x,y,z); o.castShadow=true; G.add(o); return o; };
  const hit=(G,w,h,d,x,y,z)=>mesh(G,new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false}),x,y,z);

  FORAGE.add({names:{trophy_cat:'THE OLD CATFISH (FOR THE WALL)',ring_belly:'A TARNISHED GOLD RING',gold_flake:'GOLD FLAKES',gold_nugget:'A GOLD NUGGET',doubloon:'PIRATE DOUBLOONS',medal_swim:'THE LONG SWIM MEDAL',winch:'A SALVAGE WINCH',bk_captlog:"THE CAPTAIN'S LOGBOOK (ROTTED)",logbook_capt:"THE CAPTAIN'S LOGBOOK",spyglass:"THE CAPTAIN'S SPYGLASS"},
    prices:{trophy_cat:300,ring_belly:120,gold_flake:18,gold_nugget:85,doubloon:30,medal_swim:40,winch:120,bk_captlog:5,logbook_capt:150,spyglass:260}});
  FORAGE.sell('trophy_cat','ring_belly','doubloon','spyglass','medal_swim','winch'); (FORAGE.BUYK.antiquities=FORAGE.BUYK.antiquities||[]).push('trophy_cat','ring_belly','doubloon','spyglass','medal_swim','winch'); GEMS.push(['gold_flake','GOLD FLAKES',18,0],['gold_nugget','GOLD NUGGET',85,0]);   // weight 0: the gem shop buys gold, it is never a random find
  { const LK={trophy_cat:['plate',0x6a4a2a,0x5a5a4a],ring_belly:['lump',0xc8a040],gold_flake:['jar',0xe8e0c8,0xf2c14e],gold_nugget:['lump',0xf2c14e],doubloon:['lump',0xd8b040],medal_swim:['lump',0xd8b040],winch:['gadget',0x4a4a4e,0x8a6a3a],bk_captlog:['book',0x4a3a2a,0x8a7a5a],logbook_capt:['book',0x5a2a1a,0xe8dcc0],spyglass:['gadget',0x8a6a3a,0xd8b040]};
    INSPECT.kinds.push({is:id=>!!LK[id],make:id=>INSPECT.shape(...LK[id])}); }
  FORAGE.HELP.push('THE HUDSON: the Old Catfish bites by the pier pilings from 2 to 4 am on cut bait and a strong line; herons stand on Heron Island at dawn (walk, never run, near them); the scanner and extractor find gold in the silt round the wreck; the sunken safe beside it takes strength; the Long Swim runs from the pier to the island; a salvage winch raises the wreck\'s bell; the captain\'s logbook lies in its stern cabin.');

  // THE OLD CATFISH: its own bite in the fishing odds, landed through the fishing fight like any fish; it never fits a pan, so it becomes a trophy, and its belly holds a ring
  FISHING.NAMES.x_oldcat='THE OLD CATFISH'; ITEMS.reg('x_oldcat',{fight:9,weight:25,value:250,bait:'cut',bites:'night'});
  const piling=(x,z)=>RIVER.posts.some(([px,pz,r])=>r<.5*T&&Math.hypot(px-x,pz-z)<2.5*T);
  FISHING.EXTRA.push(o=>o.w.kind==='river'&&o.bait==='cut'&&o.h>=2&&o.h<4&&INV.ready('oldcat')&&FISHING.gear().line>=1.3&&piling(o.x,o.z)?{x_oldcat:3}:null);   // a heavy rig only: the carbon rod's line hooks it and mostly snaps, the surf rod's can hold it
  FISHING.LAND.push(id=>{ if(id!=='x_oldcat')return; FORAGE.take('x_oldcat',1); FORAGE.give('trophy_cat',1); FORAGE.give('ring_belly',1); done('oldcat'); say('THE OLD CATFISH! TOO OLD AND TOUGH TO EAT: YOU KEEP IT FOR THE WALL. IN ITS BELLY, A TARNISHED GOLD RING.','#f2c14e'); FORAGE.draw(); });

  SFX.add('bell',{len:3.6,f:(D,n,R)=>{ const P=[[.5,.5,.9],[1,1,1.3],[1.19,.45,2],[1.56,.3,2.6],[2,.32,3.2],[2.74,.16,4.5]], f0=420; for(let i=0;i<n;i++){ const t=i/R; let v=0; for(const [m,a,k] of P)v+=a*Math.sin(6.2832*f0*m*t)*Math.exp(-t*k); D[i]=v*.28*Math.min(1,t*400); } }});

  /* ---------- Heron Island, its herons, the captain's dig, the Long Swim ---------- */
  let I=null; const R={on:false,t:0,out:0}; HUDSON.race=R;
  const isle=()=>{ const RB=RIVER.box, pd=RIVER.decks.find(d=>d.pier), X=RIVER.fpier, pr=pd?pd.r[pd.r.length-1]:[X-T,RB.z1-12*T,X+T,RB.z1], zE=pr[1], dir=X+80*T<RB.x1-20*T?1:-1, ix=X+dir*70*T, iz=RB.z1-9*T, RX=4.2*T, RZ=2.7*T;
    const G=new THREE.Group(); scene.add(G); const sand=L(0xc8b48a), wet=L(0x8a7a5a), wood=L(0x8a8478), reed=L(0x6a7a3a);
    { const b=bedY(ix,iz)-.3*MW, top=.01*MW, m=mesh(G,new THREE.CylinderGeometry(1,1.7,top-b,28,1),wet,ix,(top+b)/2,iz); m.scale.set(RX,1,RZ); m.receiveShadow=true; const t=mesh(G,new THREE.CylinderGeometry(.92,1,.04*MW,28),sand,ix,top,iz); t.scale.set(RX,1,RZ); t.receiveShadow=true; }   // a bar of sand from the bed up, dry on top
    { const tx=ix+dir*1.8*T, tz=iz-.4*T; mesh(G,new THREE.CylinderGeometry(.09*MW,.16*MW,2.8*MW,7),wood,tx,1.4*MW,tz); for(const [a,h,l] of [[.9,1.7,1.1],[-1.1,2.2,.9],[.4,2.6,.7]]){ const g=new THREE.Group(); g.position.set(tx,h*MW,tz); g.rotation.set(0,a*2,a); G.add(g); mesh(g,new THREE.CylinderGeometry(.03*MW,.06*MW,l*MW,5),wood,0,l*MW/2,0); } }   // the dead tree
    { const m=mesh(G,new THREE.CylinderGeometry(.13*MW,.15*MW,2.2*MW,7),wood,ix-dir*1.2*T,.1*MW,iz+1.2*T); m.rotation.set(0,.5,Math.PI/2); }   // driftwood
    for(let i=0;i<22;i++){ const a=i/22*6.283+.2*Math.sin(i*7), k=.82+.12*Math.sin(i*3.1), m=mesh(G,new THREE.BoxGeometry(.03*MW,(.6+.5*Math.abs(Math.sin(i*5)))*MW,.03*MW),reed,ix+Math.cos(a)*RX*k,.3*MW,iz+Math.sin(a)*RZ*k); m.rotation.z=.15*Math.sin(i*2); }
    // you stand on it like the pier (its deck), wade out onto it with SPACE at its edge, and swim round it, not through it
    const rect=[ix-3.4*T,iz-1.9*T,ix+3.4*T,iz+1.9*T]; for(let k=0;k<8;k++){ const a=k/8*6.283, c=Math.cos(a), s=Math.sin(a); RIVER.decks.push({r:[rect],lad:[ix+c*(RX+1.1*T),iz+s*(RZ+1.1*T),cl(ix+c*2.8*T,rect[0]+.4*T,rect[2]-.4*T),cl(iz+s*1.5*T,rect[1]+.4*T,rect[3]-.4*T)],isle:1}); }
    for(const o of [-1.7,0,1.7])RIVER.posts.push([ix+o*T,iz,2.5*T]);
    // the herons: three stand in the shallows at dawn, still; run near them and they lift off for the day
    const HR=[[-2.4,-.9,.6],[.6,1.3,2.4],[2.6,-1.2,-1]].map(([u,v,hd])=>{ const g=heron(); g.position.set(ix+u*T,0,iz+v*T); g.rotation.y=hd; G.add(g); const H={g,x:g.position.x,z:g.position.z,hd,fly:0,t:Math.random()*9};
      H.th={name:'A GREAT BLUE HERON',obj:g.userData.hb,reach:7*T,near:9*T,tall:1.2*MW,act:()=>watch()}; UI.thing(H.th); return H; });
    const X0=new THREE.Group(); X0.position.set(ix-dir*.6*T,.05*MW,iz-.5*T); G.add(X0); for(const r of [.8,-.8]){ const m=mesh(X0,new THREE.BoxGeometry(.9*MW,.03*MW,.12*MW),L(0x4a3a28),0,0,0); m.rotation.y=r; }
    const dig={name:'A MARK IN THE SAND',obj:hit(X0,1*MW,.3*MW,1*MW,0,.1*MW,0),reach:1.2*T,near:2.2*T,tall:.3*MW,act:()=>digIt()}; UI.thing(dig);
    const buoy=(x,z,c,flag)=>{ const g=new THREE.Group(); g.position.set(x,RB.lv,z); G.add(g); mesh(g,new THREE.CylinderGeometry(.22*MW,.3*MW,.5*MW,10),L(c),0,.1*MW,0); mesh(g,new THREE.CylinderGeometry(.24*MW,.24*MW,.1*MW,10),L(0xf2efe6),0,.2*MW,0);
      if(flag){ mesh(g,new THREE.CylinderGeometry(.02*MW,.02*MW,1.4*MW,5),L(0x2a2a2a),0,.9*MW,0); mesh(g,new THREE.BoxGeometry(.02*MW,.35*MW,.5*MW),L(flag),0,1.4*MW,.25*MW); } return g; };
    const sx=dir>0?pr[2]+1.6*T:pr[0]-1.6*T, sz=zE+1.2*T, fx=ix-dir*(RX+1.6*T), fz=iz, start=buoy(sx,sz,0xc83a2a,0xf2c14e), fin=buoy(fx,fz,0x2a6ac8,0xf2efe6);
    UI.thing({name:'THE LONG SWIM (START)',obj:hit(start,.8*MW,1*MW,.8*MW,0,.2*MW,0),reach:1.6*T,near:2.6*T,tall:.6*MW,act:()=>raceGo()});
    return {G,ix,iz,RX,RZ,dir,HR,X0,dig,start,fin,sx,sz,fx,fz}; };
  const heron=()=>{ const G=new THREE.Group(), body=L(0x7d8c9c), pale=L(0xd8dce0), dark=L(0x26292e), beak=L(0xd8b040), leg=L(0x6a6040), m=mesh;   // drawn in metres, the whole bird scaled to the world
    const b=m(G,new THREE.SphereGeometry(.2,10,8),body,0,.92,0); b.scale.set(.8,.75,1.7); for(const s of [-1,1])m(G,new THREE.CylinderGeometry(.012,.012,.78,5),leg,s*.06,.4,0);
    const N=new THREE.Group(); N.position.set(0,1.0,.24); N.rotation.x=-.25; G.add(N); m(N,new THREE.CylinderGeometry(.035,.045,.46,6),pale,0,.22,0); const hd=m(N,new THREE.SphereGeometry(.06,8,6),pale,0,.47,.02); hd.scale.z=1.4;
    m(N,new THREE.BoxGeometry(.03,.025,.12),dark,0,.5,-.05); const bk=m(N,new THREE.ConeGeometry(.022,.2,5),beak,0,.47,.16); bk.rotation.x=Math.PI/2;
    const W=[-1,1].map(s=>{ const g=new THREE.Group(); g.position.set(s*.12,.98,0); G.add(g); const w=m(g,new THREE.BoxGeometry(.7,.02,.42),body,s*.35,0,-.02); w.scale.x=.3; return {g,w,s}; });
    G.userData={N,W,hb:m(G,new THREE.BoxGeometry(.5,1.3,.8),new THREE.MeshBasicMaterial({visible:false}),0,.65,0)}; G.scale.setScalar(MW); return G; };
  let W=null, lx=0, lz=0;
  const watch=()=>{ '@later'; if(!INV.ready('heron'))return say('YOU HAVE WATCHED THE HERONS TODAY. THEY ARE BACK AT DAWN TOMORROW.','#c8c2b0'); if(W)return;
    W={t:0}; say('YOU STAND STILL AND WATCH THE HERONS FISH. STAY CLOSE, AND DO NOT RUN.','#9fe07f'); };
  const spook=why=>{ S.spook=day(); save(); W=null; for(const H of I.HR){ H.fly=.01; H.away=Math.atan2(H.x-pos.x,H.z-pos.z); } say(why||'YOU RAN. THE HERONS LIFT OFF THE BAR WITH A CROAK; THEY ARE GONE FOR THE DAY. WALK SLOWLY NEAR THEM.','#e0a888'); };
  const digIt=()=>{ '@later'; if(S.dug)return; const ok=FORAGE.use('forage',5,60,S.digs*12); VIT.sta=Math.max(0,VIT.sta-.15); SFX.play('step',{vol:.5,pitch:.6});
    if(!ok){ S.digs++; save(); return say('YOU DIG UNTIL THE HOLE FILLS WITH WATER. NOTHING YET; THE SAND SLIDES BACK. DIG AGAIN.','#c8c2b0'); }
    S.dug=1; save(); INV.cash+=500; FORAGE.give('gold_nugget',3); FORAGE.give('doubloon',6); FORAGE.give('spyglass',1); I.X0.visible=false; SFX.play('chirp',{vol:.6,pitch:.8}); FORAGE.draw();
    say('YOUR HANDS STRIKE WOOD: THE CAPTAIN\'S BOX! $500 IN SILVER, THREE GOLD NUGGETS, SIX DOUBLOONS AND HIS BRASS SPYGLASS.','#f2c14e'); };
  // the Long Swim: from the red buoy off the pier's end to the blue one at Heron Island on your own breath, the current pushing you back downriver; your best time kept, the week's best on the shared table
  const HUDR=document.createElement('div'); HUDR.hidden=true; HUDR.style.cssText='position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:7;font:12px Silkscreen,monospace;color:#e8e2cc;background:#0b0d13e0;border:2px solid #3a3f4e;padding:5px 10px;zoom:var(--uiz,1)'; document.body.appendChild(HUDR);
  const srv=/^http/.test(location.protocol), ask=b=>srv?fetch('/scores',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify(b)}).then(r=>r.ok?r.json():null).catch(()=>null):Promise.resolve(null);
  const cab=()=>'SWIM '+Math.floor(day()/7), ini=()=>{ const n=((ONLINE.myName?ONLINE.myName():'')||'YOU').toUpperCase().replace(/[^A-Z0-9 ]/g,''); return (n+'   ').slice(0,3); }, secs=sc=>((100000-sc)/10).toFixed(1);
  const scuba=()=>!!(EQUIP.breathe&&SWIM.tankS>0);
  const raceGo=()=>{ '@later'; if(R.on)return say('YOU ARE ALREADY SWIMMING IT: TO THE BLUE BUOY AT HERON ISLAND!');
    if(!RIVER.swim){ ask({cab:cab()}).then(j=>{ const top=j&&j.top?j.top.filter(e=>!e.sub||e.sub===SECTION.id).slice(0,5):[]; say('THE LONG SWIM: FROM THIS BUOY TO HERON ISLAND, NO TANK. GET IN THE WATER BY THE BUOY TO START.'+(S.best?' YOUR BEST '+S.best.toFixed(1)+' S.':'')+(top.length?' THIS WEEK: '+top.map((e,i)=>(i+1)+'. '+e.ini+' '+secs(e.score)+' S').join(', '):'')); }); return; }
    if(scuba())return say('NO TANK ON THE LONG SWIM: IT IS SWUM ON YOUR OWN BREATH. TAKE THE SCUBA SET OFF.','#e0a888');
    Object.assign(R,{on:true,t:0,out:0}); HUDR.hidden=false; say('GO! SWIM FOR THE BLUE BUOY AT HERON ISLAND. THE CURRENT PUSHES YOU BACK DOWNRIVER.','#b8f0a0'); SFX.play('blip',{vol:.5}); };
  const raceEnd=why=>{ R.on=false; HUDR.hidden=true; if(why)say(why,'#e0a888'); };
  const raceWin=()=>{ '@later'; const t=+R.t.toFixed(1); raceEnd(); const best=!S.best||t<S.best; if(best)S.best=t; VIT.sta=1;
    let m=''; if(!S.medal){ S.medal=1; FORAGE.give('medal_swim',1); m=' A MEDAL FOR YOUR FIRST LONG SWIM.'; } save(); FORAGE.draw(); SFX.play('chirp',{vol:.6});
    say('THE LONG SWIM IN '+t+' S'+(best?', YOUR BEST!':'. YOUR BEST IS '+S.best.toFixed(1)+' S.')+m,'#f2c14e');
    if(best)ask({cab:cab(),put:{ini:ini(),score:Math.max(1,100000-Math.round(t*10)),sub:SECTION.id}}).then(j=>{ if(j&&j.rank)say('#'+j.rank+' THIS WEEK ON THE LONG SWIM.','#f2c14e'); }); };
  const tickIsle=dt=>{ const near=d2(pos,I.ix,I.iz)<150*T; I.G.visible=near; if(!near&&!R.on)return; const now=performance.now()/1000, dawn=CLOCK.h>=5&&CLOCK.h<8, here=dawn&&S.spook!==day();
    const sp=dt>0?Math.hypot(pos.x-lx,pos.z-lz)/dt:0; lx=pos.x; lz=pos.z; let dn=1e9;
    for(const H of I.HR){ const g=H.g, U=g.userData; H.t+=dt; if(H.fly>0&&S.spook!==day())H.fly=0;
      if(H.fly>0){ H.fly+=dt; const k=H.fly; g.visible=k<8; g.position.set(H.x+Math.sin(H.away)*k*k*.4*MW,Math.min(14,k*k*.5)*MW,H.z+Math.cos(H.away)*k*k*.4*MW); g.rotation.y=H.away; U.N.rotation.x=-1.1; for(const w of U.W){ w.g.rotation.z=w.s*Math.sin(H.t*11)*.9; w.w.scale.x=1; } continue; }
      g.visible=here; if(!here)continue; dn=Math.min(dn,d2(pos,H.x,H.z)); U.N.rotation.x=-.25+(Math.sin(H.t*.7)>.93?.9:.05*Math.sin(H.t*2)); for(const w of U.W){ w.g.rotation.z=0; w.w.scale.x=.3; } }
    if(here&&dn<9*MW&&sp>.8*MW&&st.run>.5)spook();
    if(W){ W.t+=dt; if(!here)W=null; else if(dn>14*MW){ W=null; say('YOU WANDER OFF; THE HERONS GO BACK TO THEIR FISHING.','#c8c2b0'); } else if(W.t>6){ W=null; const ok=FORAGE.use('bird',20,70), n=ok?3:1; FORAGE.give('bird_feather',n); done('heron'); FORAGE.draw();
      say(ok?'A HERON SPEARS A FISH AND PREENS. THREE GREY FEATHERS DRIFT DOWN; YOU KEEP THEM (A QUILL MENDS BOOKS BETTER).':'THE HERONS STAND AND STARE AT THE WATER. ONE DROPS A FEATHER; YOU KEEP IT.','#9fe07f'); } }
    I.X0.visible=!!S.read&&!S.dug;
    for(const [b,ph] of [[I.start,0],[I.fin,1.7]]){ b.position.y=RIVER.box.lv+(RIVER.hAt?RIVER.hAt(b.position.x,b.position.z):0)+.04*MW*Math.sin(now*1.3+ph); b.rotation.z=.06*Math.sin(now*.9+ph); }
    if(!R.on)return; R.t+=dt; HUDR.textContent='THE LONG SWIM · '+R.t.toFixed(1)+' S'+(S.best?' · BEST '+S.best.toFixed(1):'');
    if(scuba())return raceEnd('THE TANK IS NOT ALLOWED ON THE LONG SWIM. THE SWIM IS OFF.');
    const onIsle=!RIVER.swim&&RIVER.onPier(pos.x,pos.z)&&d2(pos,I.ix,I.iz)<6*T; if(d2(pos,I.fx,I.fz)<2.5*T||onIsle)return raceWin();
    if(RIVER.swim){ R.out=0; pos.x-=I.dir*.45*MW*dt; } else if((R.out+=dt)>2)return raceEnd('YOU LEFT THE WATER. THE SWIM IS OFF.');
    if(R.t>300)raceEnd('FIVE MINUTES: THE SWIM IS OFF.'); };

  /* ---------- at the wreck: the bell, the logbook, the safe, the gold in the silt ---------- */
  let K=null; const raised=()=>!!S.bell||+((ONLINE.world||{}).riverbell)>0;
  const bellGeo=()=>{ const P=[[.02,.62],[.09,.6],[.13,.55],[.15,.45],[.17,.3],[.21,.14],[.27,.03],[.28,0]].map(([r,h])=>new THREE.Vector2(r*MW,h*MW)); return new THREE.LatheGeometry(P,18); };
  const wreckBits=()=>{ const F=WRECK.F, s=WRECK.S, mid=WRECK.mid, at=(u,v)=>F.pw(u*s,v*s), G=new THREE.Group(); scene.add(G); const A=WRECK.aged, bronze=A?A('bronze'):L(0x5e6a48), iron=A?A('iron'):L(0x2a2c2a), rust=A?A('iron'):L(0x5a3a26), wood=A?A('wood',{color:0x3b2a1c}):L(0x3b2a1c);   // a century under water, like the wreck
    const BL=new THREE.Group(); { const p=at(8.1,mid+1.3); BL.position.set(p[0],WRECK.floorY+.3*MW,p[1]); BL.rotation.set(0,.7,Math.PI/2+.2); G.add(BL); mesh(BL,bellGeo(),bronze,0,-.3*MW,0).material.side=THREE.DoubleSide; }   // the bell, fallen at the break
    const bell={name:"THE SHIP'S BRONZE BELL",obj:hit(BL,.7*MW,.8*MW,.7*MW,0,0,0),reach:1.6*T,near:2.6*T,tall:.6*MW,act:()=>lift()}; UI.thing(bell);
    const LB=new THREE.Group(); { const p=at(14.2,mid-.5); LB.position.set(p[0],WRECK.floorY+3.4*s*MW+.03*MW,p[1]); LB.rotation.y=.4; G.add(LB); mesh(LB,new THREE.BoxGeometry(.32*MW,.07*MW,.24*MW),L(0x3a2c1e),0,0,0); }   // on the captain's table
    const book={name:"THE CAPTAIN'S LOGBOOK",obj:hit(LB,.5*MW,.3*MW,.5*MW,0,.05*MW,0),reach:1.4*T,near:2.4*T,tall:.3*MW,act:()=>takeBook()}; UI.thing(book);
    // the safe beside the hull (a few metres off it), under a spar, a cannon and an anchor (top first)
    const sp=at(9.6,mid-3.4), sy=bedY(sp[0],sp[1]), SG=new THREE.Group(); SG.position.set(sp[0],sy,sp[1]); SG.rotation.y=F.hd?F.hd(0,1):0; G.add(SG);
    mesh(SG,new THREE.BoxGeometry(1*MW,1*MW,.9*MW),iron,0,.45*MW,0); const door=new THREE.Group(); door.position.set(-.45*MW,.45*MW,.46*MW); SG.add(door); mesh(door,new THREE.BoxGeometry(.9*MW,.85*MW,.05*MW),L(0x3a3c38),.45*MW,0,0); mesh(door,new THREE.CylinderGeometry(.1*MW,.1*MW,.05*MW,10),bronze,.45*MW,0,.04*MW).rotation.x=Math.PI/2;
    const DB=[['A BROKEN SPAR',15,()=>{ const g=new THREE.Group(); mesh(g,new THREE.CylinderGeometry(.14*MW,.16*MW,3.2*MW,8),wood,0,0,0).rotation.z=Math.PI/2; return g; },[0,1.35,0,.3],[2.2,.15,-.8,1.2]],
      ['A FALLEN CANNON',26,()=>{ const g=new THREE.Group(); mesh(g,new THREE.CylinderGeometry(.16*MW,.2*MW,1.8*MW,10),iron,0,0,0).rotation.z=Math.PI/2; return g; },[.1,1.12,.1,-.2],[-1.8,.2,.9,.4]],
      ['A RUSTED ANCHOR',34,()=>{ const g=new THREE.Group(); mesh(g,new THREE.BoxGeometry(.14*MW,1.6*MW,.14*MW),rust,0,0,0).rotation.z=1.3; mesh(g,new THREE.TorusGeometry(.5*MW,.07*MW,6,12,Math.PI),rust,0,-.1*MW,0).rotation.x=Math.PI/2; return g; },[-.1,.98,-.1,.1],[1.2,.15,1.6,-.6]]];
    const parts=DB.map(([nm,need,make,on,off],i)=>{ const g=make(); SG.add(g); const P={nm,need,g,on,off}; P.th={name:nm.replace(/^A /,'THE ')+' (HEAVE IT)',obj:hit(g,1.6*MW,.5*MW,.8*MW,0,0,0),reach:1.8*T,near:2.8*T,tall:.5*MW,act:()=>heave(i)}; UI.thing(P.th); return P; });
    const safe={name:'A SUNKEN SAFE',obj:hit(SG,1.1*MW,1*MW,1*MW,0,.45*MW,0),reach:1.6*T,near:2.6*T,tall:.9*MW,act:()=>openSafe()}; UI.thing(safe);
    // the silt round the wreck (the river is narrow: just off the hull): six patches, each with gold the scanner lights and the extractor frees once a day
    const silt=L(0x3a3224), glint=new THREE.MeshBasicMaterial({color:0xffd24a});
    const SI=[[1.5,mid+3.5],[5,mid-3.6],[9.5,mid+3.8],[12.5,mid-3.4],[17.5,mid+.5],[-3,mid-1.5]].filter(([u,v])=>RIVER.over(...at(u,v))).map(([u,v],i)=>{ const p=at(u,v), y=bedY(p[0],p[1]), g=new THREE.Group(); g.position.set(p[0],y+.03*MW,p[1]); G.add(g);
      const m=mesh(g,new THREE.CircleGeometry(1.8*MW,14),silt,0,0,0); m.rotation.x=-Math.PI/2; m.scale.y=.7; const gl=[]; for(let j=0;j<4;j++){ const o=mesh(g,new THREE.OctahedronGeometry(.07*MW,0),glint,Math.cos(j*1.9)*.9*MW,.05*MW,Math.sin(j*1.9)*.6*MW); o.visible=false; gl.push(o); }
      return {k:'silt'+i,x:p[0],z:p[1],y,g,gl,lit:0}; });
    return {G,BL,bell,LB,book,SG,door,parts,safe,SI}; };
  const lift=()=>{ '@later'; if(raised())return; if(!FORAGE.has('winch'))return say('IT IS TOO HEAVY TO SWIM UP WITH. A SALVAGE WINCH WOULD RAISE IT (FISHING & SCUBA SELLS ONE).','#c8a090');
    air(6); if(Math.random()>cl((int()-10)/35+.15,.1,1))return say('YOU RIG THE WINCH, BUT THE KNOT SLIPS AND THE LINE FALLS SLACK. RIG IT AGAIN, MORE CAREFULLY.','#e0a888');
    if(str()<25)return say('THE WINCH IS RIGGED, BUT YOU CANNOT TURN THE CRANK AGAINST THE BELL\'S WEIGHT. YOU NEED MORE STRENGTH.','#e0a888');
    S.bell=1; save(); if(ONLINE.on&&ONLINE.put)ONLINE.put('riverbell',day()||1); INV.cash+=150; SFX.play('bell',{vol:.7,pitch:.8});
    say('YOU CRANK, AND THE BELL RISES OUT OF THE SILT AND UP THROUGH THE GREEN WATER. THE CITY PAYS YOU $150 FOR IT; IT WILL HANG IN CENTRAL PARK FOR ANYONE TO RING.','#f2c14e'); };
  const takeBook=()=>{ '@later'; if(S.book)return; S.book=1; save(); FORAGE.give('logbook_capt',1); FORAGE.draw(); say('A LOGBOOK IN A SWOLLEN LEATHER COVER. READ IT FROM YOUR PACK.','#c8b0ff'); };
  FORAGE.ROWB.push(id=>id==='logbook_capt'?[['READ','capread']]:[]);
  FORAGE.ACT.capread=()=>{ '@later'; if(!FORAGE.has('logbook_capt'))return;
    if(!S.read&&Math.random()>cl((int()-10)/30+S.tries*.15,.1,1)){ S.tries++; save(); return say('THE CAPTAIN\'S HAND IS CRAMPED AND FADED. YOU MAKE OUT LITTLE TODAY; READ IT AGAIN.','#c8b0ff'); }
    S.read=1; save(); say('THE LAST PAGE: "THE CREW SHALL NOT HAVE MY SHARE. I BURIED IT ON THE HERON BAR, BETWEEN THE DEAD TREE AND THE DRIFTWOOD, AND MARKED IT WITH A CROSS." (HERON ISLAND, UPRIVER OF THE PIER.)','#f2c14e'); };
  const safeDay=()=>{ if(S.safe.d!==day()&&INV.ready('safe')){ S.safe={d:day(),n:0}; save(); } };
  const heave=i=>{ '@later'; safeDay(); const P=K.parts[i]; if(S.safe.n>i)return; if(S.safe.n<i)return say(P.nm.replace(/^A /,'THE ')+' IS PINNED UNDER '+K.parts[S.safe.n].nm.replace(/^A /,'THE ')+'. CLEAR THE TOP FIRST.','#c8a090');
    air(8); if(str()<P.need)return say('YOU HEAVE AT '+P.nm.replace(/^A /,'THE ')+' UNTIL YOUR LUNGS BURN, BUT IT WILL NOT SHIFT. IT TAKES MORE STRENGTH.','#e0a888');
    S.safe.n=i+1; save(); SFX.play('thud',{vol:.6,pitch:.6}); say('YOU HEAVE '+P.nm.replace(/^A /,'THE ')+' OFF THE SAFE. IT SINKS INTO THE SILT IN A SLOW CLOUD.'+(i<2?'':' THE SAFE\'S DOOR IS CLEAR.'),'#9fd8ff'); };
  const openSafe=()=>{ '@later'; safeDay(); if(!INV.ready('safe'))return say('THE SAFE STANDS OPEN AND EMPTY. BY TOMORROW THE RIVER HAS BURIED IT AGAIN.','#c8a090'); if(S.safe.n<3)return say('DEBRIS PINS ITS DOOR SHUT. HEAVE IT OFF, THE TOP FIRST.','#c8a090');
    const c=60+Math.floor(Math.random()*81), n=2+Math.floor(Math.random()*3); INV.cash+=c; FORAGE.give('doubloon',n); done('safe'); FORAGE.draw(); SFX.play('creak',{vol:.6,pitch:.7}); say('THE DOOR GRINDS OPEN: $'+c+' IN BANK SILVER AND '+n+' GOLD DOUBLOONS (THE BANK\'S VAULT KEEPS THEM SAFE).','#f2c14e'); };
  FORAGE.SEAMS.push({scan:()=>{ if(!K||!RIVER.swim)return 0; let n=0; for(const p of K.SI)if(INV.ready(p.k)&&d2(pos,p.x,p.z)<15*MW){ p.lit=performance.now()+60000; n++; } return n; },
    extract:()=>{ if(!K||!RIVER.swim)return 0; let n=0; const now=performance.now(); for(const p of K.SI){ if(p.lit<now||!INV.ready(p.k)||d2(pos,p.x,p.z)>4*MW||sy()>p.y+8*MW)continue; done(p.k); p.lit=0; n++;
      if(FORAGE.use('gem',0,70)){ FORAGE.give('gold_nugget',1); say('THE PULSE LIFTS THE SILT: A GOLD NUGGET!','#f2c14e'); } else { const f=1+Math.floor(Math.random()*3); FORAGE.give('gold_flake',f); say('THE PULSE LIFTS THE SILT: '+f+' PINCH'+(f>1?'ES':'')+' OF GOLD FLAKES.','#f2c14e'); } }
      if(n)FORAGE.draw(); return n; }});
  const tickWreck=()=>{ const [x,z]=WRECK.at, near=d2(pos,x,z)<140*T, now=performance.now(); K.G.visible=near; if(!near)return; safeDay();
    K.BL.visible=!raised(); K.LB.visible=!S.book; const open=!INV.ready('safe'); K.door.rotation.y=open?-1.6:0;
    K.parts.forEach((P,i)=>{ const off=open||S.safe.n>i, q=off?P.off:P.on; P.g.position.set(q[0]*MW,q[1]*MW,q[2]*MW); P.g.rotation.y=q[3]; P.th.obj.visible=!off; });
    for(const p of K.SI){ const on=p.lit>now&&INV.ready(p.k); for(let j=0;j<p.gl.length;j++){ const o=p.gl[j]; o.visible=on; if(on){ o.rotation.y=now/400+j; o.scale.setScalar(1+.4*Math.sin(now/180+j*2)); } } } };

  /* ---------- the bell in the park: anyone rings it, everyone near hears it ---------- */
  let PB=null, mine=false, lastR=null;
  const bellAt=()=>{ if(PARK.ox==null||!PARK.round)return null; const r=PARK.round, x=SHARED.BOD.XS(r[0]+PARK.ox+r[2]+4), z=SHARED.BOD.ZS(r[1]+PARK.oy); return {x,z,y:SHARED.groundY?SHARED.groundY(x,z):0}; }; HUDSON.bellAt=bellAt;
  const parkBell=()=>{ const p=bellAt(), G=new THREE.Group(); G.position.set(p.x,p.y,p.z); scene.add(G); const wood=L(0x4a3424), bronze=L(0x8a6a34);
    for(const s of [-1,1])mesh(G,new THREE.BoxGeometry(.2*MW,2.8*MW,.2*MW),wood,s*.8*MW,1.4*MW,0); mesh(G,new THREE.BoxGeometry(2*MW,.22*MW,.26*MW),wood,0,2.8*MW,0); for(const s of [-1,1])mesh(G,new THREE.BoxGeometry(.5*MW,.1*MW,.5*MW),L(0x6a6a64),s*.8*MW,.05*MW,0);
    const sw=new THREE.Group(); sw.position.y=2.68*MW; G.add(sw); mesh(sw,bellGeo(),bronze,0,-.7*MW,0).material.side=THREE.DoubleSide; mesh(sw,new THREE.SphereGeometry(.06*MW,8,6),L(0x3a3a3a),0,-.62*MW,0);
    const th={name:"THE WRECK'S BELL (RING IT)",obj:hit(G,1.2*MW,1*MW,1*MW,0,2.2*MW,0),reach:1.6*T,near:2.8*T,tall:2.6*MW,act:()=>ring(true)}; UI.thing(th); return {G,sw,th,t:9,n:0}; };
  const ring=me=>{ if(!PB)return; PB.t=0; PB.n++; SFX.play('bell',{vol:.8,at:{x:PB.G.position.x,y:PB.G.position.y+2*MW,z:PB.G.position.z},far:40*T}); if(me&&ONLINE.on&&ONLINE.add){ mine=true; ONLINE.add('riverbell:rung',1); mine=false; } };
  SYS.add('world',(k,v)=>{ if(k!=='riverbell:rung'||v===lastR)return; const first=lastR===null; lastR=v; if(!mine&&!first)ring(false); },'146gb-hudson');

  SYS.add('places',dt=>{ dt=Math.min(.1,dt||0); const up=SHARED.LVL==='up';
    if(!I&&RIVER.on&&RIVER.shown&&RIVER.decks&&up)I=HUDSON.isle=isle(); if(I){ if(up)tickIsle(dt); else I.G.visible=false; }
    if(!K&&WRECK.built&&!WRECK.none&&WRECK.F&&up&&d2(pos,WRECK.at[0],WRECK.at[1])<140*T)K=HUDSON.wreck=wreckBits(); if(K){ if(up)tickWreck(); else K.G.visible=false; }
    if(!PB&&raised()&&up){ const p=bellAt(); if(p&&d2(pos,p.x,p.z)<80*T)PB=HUDSON.bell=parkBell(); }
    if(PB){ const n=up&&d2(pos,PB.G.position.x,PB.G.position.z)<90*T; PB.G.visible=n; if(n&&PB.t<6){ PB.t+=dt; PB.sw.rotation.z=.5*Math.sin(PB.t*5)*Math.exp(-PB.t*.7); } } },'146gb-hudson');
  window.HUDSONDBG=()=>({isle:!!I,wreck:!!K,park:!!PB,raised:raised(),race:{...R},S:JSON.parse(JSON.stringify(S)),herons:I?I.HR.filter(H=>H.g.visible).length:0,at:I&&{ix:+(I.ix/T).toFixed(1),iz:+(I.iz/T).toFixed(1),depth:+RIVER.depthAt(I.ix,I.iz).toFixed(1)}}); }
