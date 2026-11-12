// THE HUDSON'S SET PIECES: the Old Catfish under the pier (2 to 4 am, cut bait, a strong line), gold in the silt round the wreck (scanner and extractor), the sunken safe under its debris, the wreck's bronze bell (one raised before the winch was retired hangs in the park for anyone to ring) and the pirate captain's logbook (read it).
import {SHARED, THREE} from './003-shx.js';
import {CITY, EQUIP, FORAGE, INSPECT, INV, ITEMS, MAIL, ONLINE, PARK, pos, SFX, st, SWIM, UI, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {QS, SYS, TILE, ZU} from './006-map-pre.js';
import {RIVER} from './066-river.js';
import {WRECK} from './066ba-wreck.js';
import {GEMS} from './101-gems.js';
import {FISHING} from './142-fishing.js';
const HUDSON={}; window.HUDSON=HUDSON;
{ const T=TILE, MW=T/.84, say=(t,c)=>SAY(t,c||'#9fd8ff'), KEY='hudson', cl=(v,a,b)=>v<a?a:v>b?b:v, L=c=>new THREE.MeshLambertMaterial({color:c});
  const day=()=>window.MAIL&&MAIL.ready?MAIL.day():CITY?CITY.day||0:0, done=k=>{ INV.picked[k]=day(); INV.save(); };
  const S={v:1,book:0,read:0,tries:0,dug:0,digs:0,best:0,medal:0,spook:-1,bell:0,safe:{d:-1,n:0}};
  try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1&&!(QS.get('fresh')&&QS.get('keepinv')!=='1'))Object.assign(S,D); }catch(e){} const save=()=>OWNED.set(KEY,JSON.stringify(S)); HUDSON.S=S;
  const str=()=>FORAGE.ST.str*FORAGE.fxv('str',1), int=()=>FORAGE.ST.int;
  const air=s=>{ if(EQUIP.breathe&&SWIM.tankS>0)SWIM.tankS=Math.max(0,SWIM.tankS-s); else VIT.air=Math.max(0,VIT.air-s); };   // heaving and cranking under water costs breath
  const sy=HUDSON.sy=()=>st.water&&st.water.in&&st.water.level!=null?st.water.y*ZU:SHARED.py;   // your height, a swimmer's own
  const bedY=(x,z)=>RIVER.box.lv-RIVER.depthAt(x,z)*MW, d2=(o,x,z)=>Math.hypot(o.x-x,o.z-z);
  const mesh=(G,geo,mat,x,y,z)=>{ const o=new THREE.Mesh(geo,mat); o.position.set(x,y,z); o.castShadow=true; G.add(o); return o; };
  const hit=(G,w,h,d,x,y,z)=>mesh(G,new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false}),x,y,z);

  FORAGE.add({names:{trophy_cat:'THE OLD CATFISH (FOR THE WALL)',ring_belly:'A TARNISHED GOLD RING',gold_flake:'GOLD FLAKES',gold_nugget:'A GOLD NUGGET',doubloon:'PIRATE DOUBLOONS',medal_swim:'THE LONG SWIM MEDAL',winch:'A SALVAGE WINCH',bk_captlog:"THE CAPTAIN'S LOGBOOK (ROTTED)",logbook_capt:"THE CAPTAIN'S LOGBOOK",spyglass:"THE CAPTAIN'S SPYGLASS"},
    prices:{trophy_cat:300,ring_belly:120,gold_flake:18,gold_nugget:85,doubloon:30,medal_swim:40,winch:120,bk_captlog:5,logbook_capt:150,spyglass:260}});
  FORAGE.sell('trophy_cat','ring_belly','doubloon','spyglass','medal_swim'); (FORAGE.BUYK.antiquities=FORAGE.BUYK.antiquities||[]).push('trophy_cat','ring_belly','doubloon','spyglass','medal_swim'); GEMS.push(['gold_flake','GOLD FLAKES',18,0],['gold_nugget','GOLD NUGGET',85,0]);   // weight 0: the gem shop buys gold, it is never a random find
  { const LK={trophy_cat:['plate',0x6a4a2a,0x5a5a4a],ring_belly:['lump',0xc8a040],gold_flake:['jar',0xe8e0c8,0xf2c14e],gold_nugget:['lump',0xf2c14e],doubloon:['lump',0xd8b040],medal_swim:['lump',0xd8b040],winch:['gadget',0x4a4a4e,0x8a6a3a],bk_captlog:['book',0x4a3a2a,0x8a7a5a],logbook_capt:['book',0x5a2a1a,0xe8dcc0],spyglass:['gadget',0x8a6a3a,0xd8b040]};
    INSPECT.kinds.push({is:id=>!!LK[id],make:id=>INSPECT.shape(...LK[id])}); }
  FORAGE.HELP.push('THE HUDSON: the Old Catfish bites by the pier pilings from 2 to 4 am on cut bait and a strong line; the scanner and extractor find gold in the silt round the wreck; the sunken safe beside it takes strength; the captain\'s logbook lies in its stern cabin.');

  // THE OLD CATFISH: its own bite in the fishing odds, landed through the fishing fight like any fish; it never fits a pan, so it becomes a trophy, and its belly holds a ring
  FISHING.NAMES.x_oldcat='THE OLD CATFISH'; ITEMS.reg('x_oldcat',{fight:9,weight:25,value:250,bait:'cut',bites:'night'});
  const piling=(x,z)=>RIVER.posts.some(([px,pz,r])=>r<.5*T&&Math.hypot(px-x,pz-z)<2.5*T);
  FISHING.EXTRA.push(o=>o.w.kind==='river'&&o.bait==='cut'&&o.h>=2&&o.h<4&&INV.ready('oldcat')&&FISHING.gear().line>=1.3&&piling(o.x,o.z)?{x_oldcat:3}:null);   // a heavy rig only: the carbon rod's line hooks it and mostly snaps, the surf rod's can hold it
  FISHING.LAND.push(id=>{ if(id!=='x_oldcat')return; FORAGE.take('x_oldcat',1); FORAGE.give('trophy_cat',1); FORAGE.give('ring_belly',1); done('oldcat'); say('THE OLD CATFISH! TOO OLD AND TOUGH TO EAT: YOU KEEP IT FOR THE WALL. IN ITS BELLY, A TARNISHED GOLD RING.','#f2c14e'); FORAGE.draw(); });

  SFX.add('bell',{len:3.6,f:(D,n,R)=>{ const P=[[.5,.5,.9],[1,1,1.3],[1.19,.45,2],[1.56,.3,2.6],[2,.32,3.2],[2.74,.16,4.5]], f0=420; for(let i=0;i<n;i++){ const t=i/R; let v=0; for(const [m,a,k] of P)v+=a*Math.sin(6.2832*f0*m*t)*Math.exp(-t*k); D[i]=v*.28*Math.min(1,t*400); } }});

  /* ---------- at the wreck: the bell, the logbook, the safe, the gold in the silt ---------- */
  let K=null; const raised=()=>!!S.bell||+((ONLINE.world||{}).riverbell)>0;
  const bellGeo=()=>{ const P=[[.02,.62],[.09,.6],[.13,.55],[.15,.45],[.17,.3],[.21,.14],[.27,.03],[.28,0]].map(([r,h])=>new THREE.Vector2(r*MW,h*MW)); return new THREE.LatheGeometry(P,18); };
  const wreckBits=()=>{ const F=WRECK.F, s=WRECK.S, mid=WRECK.mid, at=(u,v)=>F.pw(u*s,v*s), G=new THREE.Group(); scene.add(G); const A=WRECK.aged, bronze=A?A('bronze'):L(0x5e6a48), iron=A?A('iron'):L(0x2a2c2a), rust=A?A('iron'):L(0x5a3a26), wood=A?A('wood',{color:0x3b2a1c}):L(0x3b2a1c);   // a century under water, like the wreck
    const BL=new THREE.Group(); { const p=at(8.1,mid+1.3); BL.position.set(p[0],WRECK.floorY+.3*MW,p[1]); BL.rotation.set(0,.7,Math.PI/2+.2); G.add(BL); mesh(BL,bellGeo(),bronze,0,-.3*MW,0).material.side=THREE.DoubleSide; }   // the bell, fallen at the break
    const bell=null;
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
  const takeBook=()=>{ '@later'; if(S.book)return; S.book=1; save(); FORAGE.give('logbook_capt',1); FORAGE.draw(); say('A LOGBOOK IN A SWOLLEN LEATHER COVER. READ IT FROM YOUR PACK.','#c8b0ff'); };
  FORAGE.ROWB.push(id=>id==='logbook_capt'?[['READ','capread']]:[]);
  FORAGE.ACT.capread=()=>{ '@later'; if(!FORAGE.has('logbook_capt'))return;
    if(!S.read&&Math.random()>cl((int()-10)/30+S.tries*.15,.1,1)){ S.tries++; save(); return say('THE CAPTAIN\'S HAND IS CRAMPED AND FADED. YOU MAKE OUT LITTLE TODAY; READ IT AGAIN.','#c8b0ff'); }
    S.read=1; save(); say('THE LAST PAGE: "THE CREW HAVE TAKEN MY SHARE AND THE BOAT IS TAKING WATER. MAY THE RIVER KEEP US ALL."','#f2c14e'); };
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
    if(!K&&WRECK.built&&!WRECK.none&&WRECK.F&&up&&d2(pos,WRECK.at[0],WRECK.at[1])<140*T)K=HUDSON.wreck=wreckBits(); if(K){ if(up)tickWreck(); else K.G.visible=false; }
    if(!PB&&raised()&&up){ const p=bellAt(); if(p&&d2(pos,p.x,p.z)<80*T)PB=HUDSON.bell=parkBell(); }
    if(PB){ const n=up&&d2(pos,PB.G.position.x,PB.G.position.z)<90*T; PB.G.visible=n; if(n&&PB.t<6){ PB.t+=dt; PB.sw.rotation.z=.5*Math.sin(PB.t*5)*Math.exp(-PB.t*.7); } } },'146gb-hudson');
  window.HUDSONDBG=()=>({wreck:!!K,park:!!PB,raised:raised(),S:JSON.parse(JSON.stringify(S))}); }
