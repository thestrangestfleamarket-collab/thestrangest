// THE PARK'S FINDS: set pieces in the park and the castle grounds, each built only when you come near: ice fishing on the frozen lake (an auger cuts a hole, thin ice cracks under you), the Lost Orchard walled in behind the castle (climb in or find its key), the wild hive in a hollow oak, and the moth lamp on the castle's wall-walk at midnight.
import {SHARED, THREE} from './003-shx.js';
import {CITY, CLOCK, FORAGE, INV, ITEMS, MAIL, PARK, pos, ROOMS, SFX, UI, VIT, WEEDS, WX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {MODS, SOL, STORE, SYS, TILE} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
import {FISHING} from './142-fishing.js';
import {BFLY} from './143-bfly.js';
import {VEG} from './144-veggies.js';
import {GARDEN} from './144a-garden.js';
const PQ={}; window.PQ=PQ;
{ const T=TILE, WU=T/.84, say=(t,c)=>SAY(t,c||'#e8e2cc'), use=(k,a,b,x)=>FORAGE.use(k,a,b,x), sk=k=>FORAGE.sk(k), has=id=>FORAGE.has(id);
  const day=()=>window.MAIL&&MAIL.ready?MAIL.day():CITY?CITY.day||0:0;
  const ready=(k,per=1)=>INV.picked[k]==null||Math.floor(INV.picked[k]/per)<Math.floor(day()/per), took=k=>{ INV.picked[k]=day(); INV.save(); };
  const out=()=>SHARED.LVL==='up'&&!(ROOMS&&ROOMS.cur), gy=(x,z)=>typeof SHARED.groundY==='function'?SHARED.groundY(x,z):0;
  const L=c=>new THREE.MeshLambertMaterial({color:c}), HIT=new THREE.MeshBasicMaterial({visible:false}), now=()=>performance.now()/1000;
  const hit=(G,w,h,y)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),HIT); m.position.y=y??h/2; G.add(m); return m; };
  const put=(G,geo,mat,x,y,z,ry=0)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.y=ry; m.castShadow=true; G.add(m); return m; };
  const go=(x,z)=>{ pos.x=x; pos.z=z; SHARED.target=null; SHARED.py=gy(x,z); };
  const hs=(a,b)=>{ let h=(Math.imul(a|0,374761393)+Math.imul(b|0,668265263))|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };

  /* ---------- the things they give ---------- */
  const NM={auger:'ICE AUGER',x_smelt:'RAINBOW SMELT',x_whitefish:'LAKE WHITEFISH',x_burbot:'BURBOT',gb_old:'OLD GOLF BALL',gb_gutty:'VINTAGE GUTTY BALL',gb_feathery:'FEATHERIE BALL',orchard_key:"THE ORCHARD'S IRON KEY",
    fr_russet:'HEIRLOOM RUSSET APPLE',fr_quince:'QUINCE',fr_medlar:'MEDLAR',fr_gage:'GREENGAGE PLUM',sd_sweetpea:'HEIRLOOM SWEET PEA SEEDS',fl_sweetpea:'HEIRLOOM SWEET PEA',sd_hollyhock:'HEIRLOOM HOLLYHOCK SEEDS',fl_hollyhock:'HEIRLOOM HOLLYHOCK',
    mo_miller:'MILLER MOTH',mo_tiger:'ISABELLA TIGER MOTH',mo_underwing:'UNDERWING MOTH',mo_clear:'HUMMINGBIRD CLEARWING',mo_luna:'LUNA MOTH (RARE)'};
  const PR={auger:30,x_smelt:4,x_whitefish:14,x_burbot:40,gb_old:1,gb_gutty:18,gb_feathery:90,orchard_key:0,fr_russet:9,fr_quince:8,fr_medlar:12,fr_gage:10,sd_sweetpea:20,fl_sweetpea:16,sd_hollyhock:24,fl_hollyhock:18,mo_miller:4,mo_tiger:7,mo_underwing:10,mo_clear:14,mo_luna:120};
  FORAGE.add({names:NM,prices:PR});
  // the cold-water fish: they live only under the ice ('ice' water), through the one fishing path
  Object.assign(FISHING.NAMES,{x_smelt:NM.x_smelt,x_whitefish:NM.x_whitefish,x_burbot:NM.x_burbot});
  for(const [id,f,b,w,c,t] of [['x_smelt',2,'any',.1,8,'common'],['x_whitefish',4,'day',1.2,3,'rare'],['x_burbot',7,'night',2.5,1,'super']])ITEMS.reg(id,{edible:true,stackable:true,sellable:true,water:'ice',depth:0,fight:f,bites:b,bait:'worm',weight:w,value:PR[id],common:c,tier:t});
  for(const id of ['gb_old','gb_gutty','gb_feathery','fr_russet','fr_quince','fr_medlar','fr_gage','sd_sweetpea','sd_hollyhock','fl_sweetpea','fl_hollyhock'])ITEMS.reg(id,{stackable:true,sellable:true});
  for(const id of ['fr_russet','fr_quince','fr_medlar','fr_gage'])ITEMS.reg(id,{edible:true});
  ITEMS.reg('gb_feathery',{tier:'super'}); ITEMS.reg('gb_gutty',{tier:'rare'}); ITEMS.reg('mo_luna',{tier:'super'});
  for(const id in NM)if(id.startsWith('mo_'))ITEMS.reg(id,{stackable:true,sellable:true});
  FORAGE.BUYK.butterflies.push('mo_');
  if(VEG.add)VEG.add({},{fr_russet:9,fr_quince:8,fr_medlar:12,fr_gage:10,fl_sweetpea:16,fl_hollyhock:18});
  // the orchard's flowers grow from their seeds through the garden's own planting (GARDEN.FL, GARDEN.SEED)
  if(GARDEN.FL){ GARDEN.FL.sweetpea=['HEIRLOOM SWEET PEA',60,16,0xd88ac8,0xf4e0f0,[.05,.9,.45,.3]]; GARDEN.FL.hollyhock=['HEIRLOOM HOLLYHOCK',65,18,0xc83a6a,0xf2e080,[.07,.6,1.1,.3]];
    GARDEN.SEED.sweetpea=['HEIRLOOM SWEET PEA SEEDS',20]; GARDEN.SEED.hollyhock=['HEIRLOOM HOLLYHOCK SEEDS',24]; }
  FORAGE.HELP.push('THE PARK\'S FINDS: ice fishing through a hole you drill on the frozen lake (an ice auger, the Fisherman); the Lost Ball Pond and a hidden green; the Lost Orchard behind the castle; a wild hive in a hollow oak (bring a smoker); the moth lamp on the castle wall at midnight (bring a net).');

  /* ---------- where: open lawn found once the park is built, never on a path's solids or in the lake ---------- */
  const taken=[], freeAt=(x,z,r)=>WEEDS.inPark&&WEEDS.inPark(x,z,4+r/T)&&!SOL.up.some(s=>s[0]<x+r&&s[2]>x-r&&s[1]<z+r&&s[3]>z-r)&&[[0,0],[r,0],[-r,0],[0,r],[0,-r]].every(([a,b])=>FOUNT.bedAt(x+a,z+b)==null)&&taken.every(q=>Math.hypot(q[0]-x,q[1]-z)>q[2]+r);
  const find=(ax,az,r)=>{ '@later'; for(let R=0;R<160;R+=3){ const n=Math.max(1,R*2); for(let i=0;i<n;i++){ const a=i/n*6.283, x=ax+Math.cos(a)*R*T, z=az+Math.sin(a)*R*T; if(freeAt(x,z,r)){ taken.push([x,z,r]); return [x,z]; } } } return null; };

  /* ---------- 1. ICE FISHING: the big lake freezes in the cold; an auger cuts a hole to fish; out on the thin ice, stand still too long and it gives ---------- */
  const ICE={on:false,built:false,holes:[],cracks:[],still:0,sx:0,sz:0,warn:false}, THICK=12; PQ.ICE=ICE;
  const cold=()=>CLOCK.season()==='winter'||!!(WX.now&&(WX.now.cold||WX.now.snow>.15));
  const lk=(x,z)=>FOUNT.lake?-FOUNT.lake(x/T+SHARED.BOD.OX-(PARK.ox||0),z/T+SHARED.BOD.OY-(PARK.oy||0)):-1;   // tiles in from the shore
  const iceY=()=>FOUNT.LV+.05*WU, iced=(x,z)=>ICE.on&&lk(x,z)>.6, hole=(x,z,r)=>ICE.holes.find(h=>Math.hypot(h.x-x,h.z-z)<r)||null;
  FOUNT.holds.push((x,z)=>iced(x,z)&&(!FOUNT.swim||ICE.climb)&&!ICE.cracks.some(c=>Math.hypot(c.x-x,c.z-z)<1.6*T));
  FISHING.waters.push((x,z)=>{ if(!ICE.on||lk(x,z)<=.6)return undefined; return hole(x,z,.7*T)?{kind:'ice',lv:FOUNT.LV,depth:4}:null; });
  const buildIce=()=>{ '@later'; const S=FOUNT.S, Lk=S.L, ox=PARK.ox||0, oy=PARK.oy||0, W=(px,py)=>[SHARED.BOD.XS(px+ox),SHARED.BOD.ZS(py+oy)], N=96;
    const ring=inset=>{ const P=[]; for(let i=0;i<N;i++){ const a=i/N*6.283, ca=Math.cos(a), sa=Math.sin(a); let r=0; for(let q=0;q<Math.max(Lk.rx,Lk.ry)+30;q+=.5){ if(FOUNT.lake(Lk.x+ca*q,Lk.y+sa*q)>-inset)break; r=q; } const [x,z]=W(Lk.x+ca*r,Lk.y+sa*r); P.push(new THREE.Vector2(x,-z)); } return P; };
    const outer=new THREE.Shape(ring(.5)), inner=ring(THICK); outer.holes.push(new THREE.Path(inner));
    const G=new THREE.Group(), y=iceY(), m=(sh,c)=>{ const g=new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI/2); const o=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:c})); o.receiveShadow=true; o.position.y=y; G.add(o); return o; };
    m(outer,0xdfeaf2); m(new THREE.Shape(inner),0x9fb8c8); scene.add(G); ICE.G=G; ICE.built=true; };
  const holeG=new THREE.CircleGeometry(.36*T,14).rotateX(-Math.PI/2), crackG=new THREE.CircleGeometry(1.7*T,9).rotateX(-Math.PI/2), darkM=new THREE.MeshLambertMaterial({color:0x10202a});
  const mkHole=(x,z)=>{ '@later'; const o=new THREE.Mesh(holeG,darkM); o.position.set(x,iceY()+.01*WU,z); ICE.G.add(o); const h={x,z,o,t:now()};
    h.th={name:'YOUR ICE HOLE',obj:o,reach:1.4*T,near:2.2*T,tall:.2*T,act:()=>FISHING.cast(h.x,h.z)}; UI.thing(h.th); ICE.holes.push(h); return h; };
  const unHole=h=>{ ICE.G.remove(h.o); const i=UI.things.indexOf(h.th); if(i>=0)UI.things.splice(i,1); ICE.holes.splice(ICE.holes.indexOf(h),1); };
  PQ.drill=()=>{ '@later'; if(!has('auger'))return say('YOU NEED AN ICE AUGER. THE FISHERMAN IN WADERS SELLS THEM.','#c8a090'); if(!ICE.on)return say(cold()?'GO OUT ON THE FROZEN LAKE FIRST.':'THE LAKE IS NOT FROZEN. COME BACK IN THE COLD.','#c8a090');
    if(!FOUNT.held(pos.x,pos.z))return say('STAND ON THE ICE TO DRILL.','#c8a090'); const h0=SHARED.heading, x=pos.x+Math.sin(h0)*.9*T, z=pos.z+Math.cos(h0)*.9*T;
    if(!iced(x,z))return say('TOO NEAR THE SHORE: THE ICE IS ON THE GROUND THERE.','#c8a090'); if(hole(x,z,1.5*T))return say('THERE IS A HOLE RIGHT THERE.','#c8a090'); if(ICE.holes.length>=3)unHole(ICE.holes[0]);
    if(SFX.play)SFX.play('creak',{vol:.5,pitch:.7}); const h=mkHole(x,z); say(lk(x,z)>THICK?'YOU DRILL THROUGH THE THIN ICE. DO NOT STAND STILL OUT HERE FOR LONG.':'YOU DRILL A HOLE THROUGH THE THICK ICE. DOUBLE-CLICK IT TO FISH.','#bfe0ff'); return h; };
  FORAGE.ROWB.push(id=>id==='auger'?[['DRILL A HOLE','pqdrill']]:[]); FORAGE.ACT.pqdrill=()=>PQ.drill();
  const crack=(x,z)=>{ '@later'; const o=new THREE.Mesh(crackG,darkM); o.position.set(x,iceY()+.012*WU,z); ICE.G.add(o); ICE.cracks.push({x,z,o,t:now()}); if(SFX.play)SFX.play('splash',{vol:.7});
    if(VIT.hurt)VIT.hurt(.05); say('THE ICE GIVES WAY UNDER YOU! YOU GO INTO THE FREEZING WATER.','#9fd8ff'); ICE.still=0; ICE.warn=false; };
  const iceTick=dt=>{ const want=cold()&&!!(FOUNT.S&&FOUNT.LV!=null&&FOUNT.lake), near=FOUNT.S&&Math.hypot(pos.x-SHARED.BOD.XS(FOUNT.S.L.x+(PARK.ox||0)),pos.z-SHARED.BOD.ZS(FOUNT.S.L.y+(PARK.oy||0)))<(Math.max(FOUNT.S.L.rx,FOUNT.S.L.ry)+80)*T;
    if(can&&want&&near&&!ICE.built)buildIce(); const on=want&&ICE.built; if(on!==ICE.on){ ICE.on=on; if(!on){ while(ICE.holes.length)unHole(ICE.holes[0]); for(const c of ICE.cracks)ICE.G.remove(c.o); ICE.cracks.length=0; } }
    if(ICE.G)ICE.G.visible=on&&near&&out(); if(!on)return; const t=now();
    for(const c of [...ICE.cracks])if(t-c.t>180){ ICE.G.remove(c.o); ICE.cracks.splice(ICE.cracks.indexOf(c),1); } for(const h of [...ICE.holes])if(t-h.t>1200)unHole(h);   // a crack freezes over in three minutes, a hole in twenty
    ICE.climb=FOUNT.swim&&ICE.cracks.some(c=>Math.hypot(c.x-pos.x,c.z-pos.z)<2.6*T&&Math.hypot(c.x-pos.x,c.z-pos.z)>1.7*T);   // swum to a crack's edge: you haul yourself out onto the ice
    const thin=FOUNT.held(pos.x,pos.z)&&lk(pos.x,pos.z)>THICK&&Math.abs(SHARED.py-iceY())<.5*T; if(!thin||Math.hypot(pos.x-ICE.sx,pos.z-ICE.sz)>.5*T){ ICE.sx=pos.x; ICE.sz=pos.z; ICE.still=0; ICE.warn=false; return; }
    ICE.still+=dt; if(ICE.still>4&&!ICE.warn){ ICE.warn=true; say('THE THIN ICE CREAKS UNDER YOU...','#bfe0ff'); if(SFX.play)SFX.play('creak',{vol:.6}); } if(ICE.still>8)crack(pos.x,pos.z); };
  { const sg0=STORE.stackGround; STORE.stackGround=(x,z)=>{ if(ICE.on&&FOUNT.held(x,z))return iceY(); const y=LOFT.at(x,z); if(y!=null)return y; return sg0?sg0(x,z):null; }; }

  /* ---------- 3. FORAGING: the Lost Orchard, an overgrown walled garden behind the castle: climb its wall or find its key; thorns scratch; heirloom fruit and seeds, once a day ---------- */
  const ORCH={W:12,D:9,trees:[]}; PQ.ORCH=ORCH;
  const buildOrch=(cx,cz)=>{ '@later'; const G=new THREE.Group(), y=gy(cx,cz), w=ORCH.W*T/2, d=ORCH.D*T/2, th=.2*T, H=2.4*WU; G.position.set(cx,y,cz); scene.add(G); Object.assign(ORCH,{G,x:cx,z:cz,w,d});
    const brick=L(0x8a5a44), cap=L(0x6a6a62), gap=.9*T;
    const wall=(x0,z0,x1,z1)=>{ const o=put(G,new THREE.BoxGeometry(Math.abs(x1-x0)||th*2,H,Math.abs(z1-z0)||th*2),brick,(x0+x1)/2,H/2,(z0+z1)/2); o.receiveShadow=true; put(G,new THREE.BoxGeometry((Math.abs(x1-x0)||th*2)+.04*T,.12*WU,(Math.abs(z1-z0)||th*2)+.04*T),cap,(x0+x1)/2,H+.06*WU,(z0+z1)/2);
      SOL.up.push([cx+Math.min(x0,x1)-th,cz+Math.min(z0,z1)-th,cx+Math.max(x0,x1)+th,cz+Math.max(z0,z1)+th]); };
    wall(-w,-d,-gap,-d); wall(gap,-d,w,-d); wall(-w,d,w,d); wall(-w,-d,-w,d); wall(w,-d,w,d);   // its gate faces the castle (the -z side)
    const gate=new THREE.Group(); gate.position.set(0,0,-d); G.add(gate); const iron=L(0x2a2a2e); for(let i=0;i<7;i++)put(gate,new THREE.BoxGeometry(.03*WU,H*.9,.03*WU),iron,-gap+(i+.5)*gap*2/7,H*.45,0); put(gate,new THREE.BoxGeometry(gap*2,.05*WU,.04*WU),iron,0,H*.85,0);
    SOL.up.push([cx-gap,cz-d-th,cx+gap,cz-d+th]);
    const ivy=L(0x3a5a2a); for(let i=0;i<26;i++){ const s=hs(i,21), sd=i%4, u=(hs(i,23)-.5)*2; const [px,pz]=sd===0?[u*w,-d-th]:sd===1?[u*w,d+th]:sd===2?[-w-th,u*d]:[w+th,u*d]; if(sd===0&&Math.abs(px)<gap+.3*T)continue; put(G,new THREE.SphereGeometry(.5*WU*(.6+s),6,4),ivy,px,H*(.3+.6*hs(i,25)),pz).scale.set(1,1.3,.35); }
    // the old trees, each with its own heirloom fruit
    const FR=[['fr_russet',0xa8742a],['fr_quince',0xd8c040],['fr_medlar',0x8a5a32],['fr_gage',0x9ac048]], bark=L(0x4a3a2a), leaf=L(0x3e6a30);
    [[-.55,.45],[.55,.45],[-.55,-.1],[.55,-.1],[0,.62],[0,.15]].forEach(([u,v],i)=>{ const x=u*w, z=v*d, [id,fc]=FR[i%4], tr=new THREE.Group(); tr.position.set(x,0,z); G.add(tr);
      put(tr,new THREE.CylinderGeometry(.12*WU,.18*WU,1.8*WU,7),bark,0,.9*WU,0,i).rotation.z=(hs(i,31)-.5)*.3; put(tr,new THREE.SphereGeometry(1.1*WU,9,6),leaf,0,2.2*WU,0).scale.set(1.2,.8,1.2);
      const fm=L(fc), fr=[]; for(let k=0;k<7;k++){ const a=k*.9+i, r=1*WU; fr.push(put(tr,new THREE.SphereGeometry(.07*WU,6,4),fm,Math.cos(a)*r,(1.8+.5*hs(i,k))*WU,Math.sin(a)*r)); }
      SOL.up.push([cx+x-.15*T,cz+z-.15*T,cx+x+.15*T,cz+z+.15*T]); const t={id,fr,k:'orch'+i};
      t.th={name:'AN OLD '+NM[id].replace('HEIRLOOM ','')+' TREE',obj:hit(tr,1.2*T,2.4*T),reach:1.8*T,near:2.6*T,tall:1.6*T,act:()=>PQ.pick(t)}; UI.thing(t.th); ORCH.trees.push(t); });
    // the thorn thickets (brambles that scratch) and the seed bed gone wild
    const thorn=L(0x2e3a22), spk=L(0x6a5a3a); ORCH.thorns=[[-.2,.2],[.25,-.45],[-.75,-.6],[.78,.75],[.2,.85]].map(([u,v],i)=>{ const x=u*w, z=v*d; for(let k=0;k<5;k++){ const o=put(G,new THREE.IcosahedronGeometry(.45*WU,0),k%2?thorn:spk,x+(hs(i,k)-.5)*.9*T,.35*WU,z+(hs(k,i)-.5)*.9*T); o.scale.y=.7; } return [cx+x,cz+z]; });
    const bed=new THREE.Group(); bed.position.set(-.25*w,0,.8*d); G.add(bed); put(bed,new THREE.BoxGeometry(2.4*WU,.15*WU,.9*WU),L(0x4a3a28),0,.07*WU,0); for(let k=0;k<12;k++)put(bed,new THREE.CylinderGeometry(.01*WU,.01*WU,.7*WU,4),L(k%2?0xc83a6a:0xd88ac8),(k/11-.5)*2.1*WU,.45*WU,(hs(k,41)-.5)*.6*WU);
    ORCH.bed={name:'A SEED BED GONE WILD',obj:hit(bed,1.4*T,.6*T),reach:1.6*T,near:2.4*T,tall:.5*T,act:()=>PQ.seeds()}; UI.thing(ORCH.bed);
    const gt=hit(gate,1.4*T,1.6*T); ORCH.gateOut={name:"THE LOST ORCHARD'S GATE (LOCKED)",obj:gt,reach:1.8*T,near:2.4*T,tall:1.2*T,act:()=>PQ.gate(false)}; UI.thing(ORCH.gateOut);
    const gi=new THREE.Group(); gi.position.set(0,0,-d+.6*T); G.add(gi); ORCH.gateIn={name:'THE GATE (LIFT THE BAR AND GO OUT)',obj:hit(gi,1.2*T,1.6*T),reach:1.4*T,near:2*T,tall:1.2*T,act:()=>PQ.gate(true)}; UI.thing(ORCH.gateIn);
    const cw=new THREE.Group(); cw.position.set(w+th,0,.3*d); G.add(cw); ORCH.climb={name:'THE ORCHARD WALL (CLIMB OVER)',obj:hit(cw,1.2*T,1.8*T),reach:1.6*T,near:2.2*T,tall:1.4*T,act:()=>PQ.climbWall()}; UI.thing(ORCH.climb); };
  const insideOrch=(x=pos.x,z=pos.z)=>ORCH.G&&Math.abs(x-ORCH.x)<ORCH.w&&Math.abs(z-ORCH.z)<ORCH.d;
  PQ.gate=from=>{ '@later'; if(from){ go(ORCH.x,ORCH.z-ORCH.d-1.2*T); SHARED.heading=Math.PI; if(SFX.play)SFX.play('latch',{vol:.5}); return say('YOU LIFT THE BAR AND SLIP OUT. THE GATE SWINGS SHUT BEHIND YOU.'); }
    if(!has('orchard_key'))return say('LOCKED, ITS IRON RUSTED SOLID. SOMEWHERE THERE MUST BE A KEY. OR YOU COULD CLIMB THE WALL.','#c8a090');
    go(ORCH.x,ORCH.z-ORCH.d+1.2*T); SHARED.heading=0; if(SFX.play)SFX.play('door',{vol:.5}); say('THE OLD KEY TURNS. YOU STEP INTO THE LOST ORCHARD.','#b8f0a0'); };
  PQ.climbWall=()=>{ '@later'; if(!(FORAGE.climbed?FORAGE.climbed():use('climb',-50,150))){ if(VIT.hurt)VIT.hurt(.02); return say('YOU GET HALFWAY UP THE BRICKS, THEN SLIP BACK DOWN. (CLIMBING)','#c8a090'); }
    go(ORCH.x+ORCH.w-1.1*T,ORCH.z+.3*ORCH.d); SHARED.heading=-Math.PI/2; say('YOU HAUL YOURSELF OVER THE WALL AND DROP INTO THE OVERGROWN ORCHARD.','#b8f0a0'); };
  PQ.pick=t=>{ '@later'; if(!ready(t.k))return say('YOU HAVE PICKED IT CLEAN. MORE WILL RIPEN BY TOMORROW.','#c8a090'); took(t.k); const n=1+(use('forage',0,90)?1:0)+(sk('forage')>60?1:0); FORAGE.give(t.id,n); FORAGE.draw();
    if(SFX.play)SFX.play('step',{vol:.4}); say(`YOU PICK ${n} ${NM[t.id]}${n>1?'S':''}. NO SHOP SELLS THESE.`,'#b8f0a0'); };
  PQ.seeds=()=>{ '@later'; if(!ready('orchseed'))return say('THE SEED HEADS ARE BARE. MORE BY TOMORROW.','#c8a090'); if(!use('garden',-10,80))return say('THE SEED PODS SPLIT AND SCATTER BEFORE YOU CAN SAVE THEM.','#c8a090');
    took('orchseed'); const id=Math.random()<.5?'sd_sweetpea':'sd_hollyhock'; FORAGE.give(id,1); FORAGE.draw(); say(`YOU SAVE A PACKET OF ${NM[id]}. PLANT THEM ON ANY LAWN.`,'#b8f0a0'); };
  let scr=0; const orchTick=dt=>{ if(!ORCH.G)return; const n=Math.hypot(pos.x-ORCH.x,pos.z-ORCH.z)<140*T; ORCH.G.visible=n&&out(); if(!n)return; const inn=insideOrch();
    ORCH.gateOut.obj.visible=!inn; ORCH.gateIn.obj.visible=inn; ORCH.climb.obj.visible=!inn; for(const t of ORCH.trees)for(const f of t.fr)f.visible=ready(t.k);
    scr-=dt; if(inn&&scr<=0&&ORCH.thorns.some(([x,z])=>Math.hypot(pos.x-x,pos.z-z)<.9*T)){ scr=2; if(VIT.hurt)VIT.hurt(.02); say('THORNS SCRATCH YOU.','#e0a080'); } };
  // its key: down the castle's well, once
  const WELL={}; const buildWell=()=>{ '@later'; const C=MODS.castle.BOUND, x=C.x1-4.4*T, z=C.z1-5.4*T, G=new THREE.Group(); G.position.set(x,gy(x,z),z); scene.add(G); WELL.G=G;
    WELL.th={name:'THE OLD WELL',obj:hit(G,1.4*T,1.2*T),reach:2*T,near:2.8*T,tall:1*T,act:()=>{ if(SFX.play)SFX.play('creak',{vol:.5});
      if(INV.picked.orchkey==null||!has('orchard_key')&&!ready('orchkey',7)){ if(has('orchard_key'))return say('YOU HAUL UP THE BUCKET: COLD WATER, NOTHING ELSE.'); took('orchkey'); FORAGE.give('orchard_key',1); FORAGE.draw(); return say('YOU HAUL UP THE BUCKET. AN OLD IRON KEY LIES IN THE SILT, ITS TAG READS "ORCHARD".','#f2c14e'); }
      say('YOU HAUL UP THE BUCKET: COLD WATER, NOTHING ELSE.'); }}; UI.thing(WELL.th); };

  /* ---------- 4. BEEKEEPING: the wild hive in a hollow oak: smoke them (a veil keeps stings off) for wild honey once a day, and once a queen for a hive of your own ---------- */
  const HIVE={}; PQ.HIVE=HIVE;
  const buildHive=(x,z)=>{ '@later'; const G=new THREE.Group(); G.position.set(x,gy(x,z),z); scene.add(G); Object.assign(HIVE,{G,x,z,swarm:0});
    const bark=L(0x4a3e30); put(G,new THREE.CylinderGeometry(.55*WU,.85*WU,5*WU,10),bark,0,2.5*WU,0); for(let i=0;i<5;i++){ const a=i*1.3, b=put(G,new THREE.CylinderGeometry(.08*WU,.18*WU,2.6*WU,6),bark,Math.cos(a)*.8*WU,(4.2+i*.3)*WU,Math.sin(a)*.8*WU); b.rotation.set(Math.sin(a)*.9,0,-Math.cos(a)*.9); }
    for(let i=0;i<4;i++)put(G,new THREE.SphereGeometry(1.4*WU,8,6),L(0x4a6a30),Math.cos(i*1.6)*1.2*WU,(5.6+.3*i)*WU,Math.sin(i*1.6)*1.2*WU).scale.set(1,.7,1);
    const holeM=put(G,new THREE.CircleGeometry(.28*WU,10),L(0x0e0a08),0,2.2*WU,.62*WU); holeM.scale.y=1.5; put(G,new THREE.BoxGeometry(.3*WU,.25*WU,.05*WU),L(0xd8a830),0,2.1*WU,.6*WU);
    const BN=24; HIVE.bees=new THREE.InstancedMesh(new THREE.SphereGeometry(.03*WU,4,3),new THREE.MeshBasicMaterial({color:0xe8b020}),BN); HIVE.bees.frustumCulled=false; HIVE.bees.raycast=()=>{}; G.add(HIVE.bees);
    SOL.up.push([x-.5*T,z-.5*T,x+.5*T,z+.5*T]);
    HIVE.th={name:'A HOLLOW OAK, HUMMING WITH WILD BEES',obj:hit(G,1.4*T,2.4*T,1.6*T),reach:1.8*T,near:2.6*T,tall:2*T,act:()=>PQ.wild()}; UI.thing(HIVE.th); };
  const sting=()=>{ if(has('bee_veil'))return say('THE SWARM BUZZES AT YOUR VEIL, BUT CANNOT GET IN.','#e8e2cc'); if(VIT.hurt)VIT.hurt(.08); if(SFX.play)SFX.play('cough',{vol:.4,pitch:1.6}); say('THE SWARM POURS OUT OF THE OAK! YOU ARE STUNG ALL OVER.','#f09070'); };
  PQ.wild=()=>{ '@later'; if(!ready('wildhive'))return say('THE COMB IN THE HOLLOW IS BARE. THE WILD BEES WILL HAVE MORE BY TOMORROW.','#c8a090'); HIVE.swarm=4;
    if(!has('bee_smoker')){ sting(); return say('WILD BEES WILL NOT GIVE UP THEIR HONEY WITHOUT SMOKE. THE VILLAGE GARDENER AT THE BEEKEEPER\'S STALL SELLS A SMOKER.','#c8a090'); }
    if(!use('bee',0,80)){ sting(); return say('YOUR SMOKE DRIFTS THE WRONG WAY. THEY ARE STILL ANGRY.','#c8a090'); }
    const jars=has('jar_honey'); if(!jars)return say('THE SMOKE QUIETS THEM, BUT YOU HAVE NO EMPTY HONEY JARS.','#c8a090');
    const n=Math.min(jars,1+Math.floor(sk('bee')/35)); FORAGE.take('jar_honey',n); FORAGE.give('honey_wild',n); FORAGE.give('bee_wax',2); took('wildhive'); HIVE.swarm=0; use('bee',10,80); if(SFX.play)SFX.play('drip',{vol:.5});
    say(`A PUFF OF SMOKE AND THE WILD BEES GO QUIET. YOU CUT ${n} JAR${n>1?'S':''} OF WILD HONEY AND SOME WAX FROM THE HOLLOW.`,'#f2c14e');
    if(INV.picked.wildqueen==null&&sk('bee')>=20){ INV.picked.wildqueen=day(); INV.save(); FORAGE.give('bee_hive',1); say('AND THE QUEEN! YOU COAX HER INTO A SPARE BOX: A HIVE OF YOUR OWN TO SET ON THE LAWN.','#f2c14e'); }
    FORAGE.draw(); };
  const m4=new THREE.Matrix4(); const hiveTick=dt=>{ if(!HIVE.G)return; const n=Math.hypot(pos.x-HIVE.x,pos.z-HIVE.z)<100*T; HIVE.G.visible=n&&out(); if(!n)return; HIVE.swarm=Math.max(0,HIVE.swarm-dt);
    const t=now(), awake=!CLOCK.dark(), sw=HIVE.swarm>0, lx=pos.x-HIVE.x, lz=pos.z-HIVE.z; let k=0;
    for(let i=0;i<24;i++){ if(!awake&&!sw)break; if(!sw&&i>=10)break; const a=t*(1.4+i*.13)+i*2.3, r=(sw?.4:.25+.3*(i%5)/5)*WU, cx=sw?lx*(.4+.5*((i*7)%10)/10):0, cz=sw?lz*(.4+.5*((i*3)%10)/10):.8*WU;
      m4.makeTranslation(cx+Math.cos(a)*r,(sw?1.5:2.2)*WU+Math.sin(t*3+i)*.25*WU,cz+Math.sin(a*1.2)*r); HIVE.bees.setMatrixAt(k++,m4); }
    HIVE.bees.count=k; HIVE.bees.instanceMatrix.needsUpdate=true; };

  /* ---------- 5. ENTOMOLOGY: the moth lamp on the castle's wall-walk: climb up, light it around midnight, net the moths before the bats take them; a luna moth once a week ---------- */
  const LOFT={up:false,mode:null}; PQ.LOFT=LOFT;
  LOFT.at=(x,z)=>{ if(!LOFT.G||!(LOFT.up||LOFT.mode))return null; if(LOFT.mode&&Math.hypot(x-pos.x,z-pos.z)<.6*T)return LOFT.h; return Math.abs(x-LOFT.x)<LOFT.hw&&Math.abs(z-LOFT.z)<LOFT.hd?LOFT.top:null; };
  const MOTHS=[['mo_miller',15,0x8a7a62],['mo_tiger',20,0xc88a3a],['mo_underwing',28,0x6a5a4a],['mo_clear',35,0xc8a070]], LUNA=['mo_luna',55,0xa8e8b0];
  const buildLoft=()=>{ '@later'; const C=MODS.castle.BOUND, x=(C.x0+C.x1)/2, z0=C.z1-1.85*T, z1=z0-1.8*T, z=(z0+z1)/2, g=gy(x,z), top=g+SHARED.BOD.YS(100), hd=Math.abs(z0-z1)/2, hw=1.2*T;
    const G=new THREE.Group(); G.position.set(x,0,z); scene.add(G); Object.assign(LOFT,{G,x,z,g,top,hw,hd,h:g}); const wood=L(0x5a4430);
    put(G,new THREE.BoxGeometry(hw*2,.1*WU,hd*2),wood,0,top-.05*WU,0).receiveShadow=true; for(const [a,b] of [[-1,-1],[1,-1]])put(G,new THREE.BoxGeometry(.1*WU,top-g,.1*WU),wood,a*(hw-.1*T),g+(top-g)/2,b*(hd-.1*T));
    const sg=Math.sign(z1-z0)||1, foot=[x+.6*hw,z+sg*hd+sg*.4*T]; LOFT.foot=foot;   // the ladder stands against the loft's bailey side
    const lad=new THREE.Group(); lad.position.set(foot[0]-x,0,foot[1]-z-sg*.3*T); G.add(lad); for(const s of [-1,1])put(lad,new THREE.BoxGeometry(.05*WU,top-g+.8*WU,.05*WU),wood,s*.22*WU,g+(top-g+.8*WU)/2,0); for(let r=g+.3*WU;r<top+.6*WU;r+=.35*WU)put(lad,new THREE.BoxGeometry(.44*WU,.04*WU,.04*WU),wood,0,r,0);
    const lampG=new THREE.Group(); lampG.position.set(-.5*hw,top,0); G.add(lampG); put(lampG,new THREE.CylinderGeometry(.03*WU,.04*WU,1.6*WU,6),L(0x2a2a2e),0,.8*WU,0);
    const glass=new THREE.MeshLambertMaterial({color:0xe8e0c0,emissive:0x000000}); LOFT.glass=glass; put(lampG,new THREE.BoxGeometry(.3*WU,.4*WU,.3*WU),glass,0,1.75*WU,0); put(lampG,new THREE.ConeGeometry(.26*WU,.2*WU,4),L(0x2a2a2e),0,2.05*WU,0,Math.PI/4);
    put(lampG,new THREE.PlaneGeometry(.8*WU,.9*WU),new THREE.MeshLambertMaterial({color:0xf4f2ea,side:THREE.DoubleSide}),.45*WU,.9*WU,0,Math.PI/2);   // the white sheet moths settle on
    LOFT.light=new THREE.PointLight(0xfff0c8,0,8*T,1.6); LOFT.light.position.set(0,1.75*WU,0); lampG.add(LOFT.light); LOFT.lampG=lampG;
    const up=new THREE.Group(); up.position.set(foot[0]-x,g,foot[1]-z); G.add(up); LOFT.upTh={name:'A LADDER UP TO THE WALL-WALK',obj:hit(up,1*T,1.4*T),reach:1.4*T,near:2*T,tall:1.2*T,act:()=>PQ.climbLoft(1)}; UI.thing(LOFT.upTh);
    const dn=new THREE.Group(); dn.position.set(.6*hw,top,sg*(hd-.3*T)); G.add(dn); LOFT.dnTh={name:'THE LADDER DOWN',obj:hit(dn,.8*T,1.2*T),reach:1.2*T,near:1.8*T,tall:1*T,act:()=>PQ.climbLoft(-1)}; UI.thing(LOFT.dnTh);
    LOFT.lampTh={name:'THE MOTH LAMP',obj:hit(lampG,.8*T,2*T),reach:1.6*T,near:2.4*T,tall:1.8*T,act:()=>PQ.lamp()}; UI.thing(LOFT.lampTh);
    const MG=new THREE.PlaneGeometry(.16*WU,.1*WU); LOFT.moths=[]; LOFT.bats=[];
    for(let i=0;i<2;i++){ const b=new THREE.Group(), bm=L(0x141418); put(b,new THREE.SphereGeometry(.07*WU,6,4),bm,0,0,0); for(const s of [-1,1]){ const w=put(b,new THREE.PlaneGeometry(.3*WU,.14*WU),new THREE.MeshLambertMaterial({color:0x1a1a20,side:THREE.DoubleSide}),s*.17*WU,0,0); w.rotation.x=-Math.PI/2; b.userData['w'+s]=w; } b.visible=false; lampG.add(b); LOFT.bats.push({g:b,a:i*3,prey:null,t:0}); }
    LOFT.MG=MG; };
  const midnight=()=>CLOCK.h>=23||CLOCK.h<1.5;
  PQ.climbLoft=dir=>{ '@later'; if(LOFT.mode)return; if(dir>0){ go(LOFT.foot[0],LOFT.foot[1]); LOFT.mode='up'; LOFT.h=LOFT.g; LOFT.t=0; say('YOU CLIMB THE LADDER TO THE WALL-WALK.'); }
    else { LOFT.mode='down'; LOFT.h=LOFT.top; LOFT.t=0; go(LOFT.foot[0],LOFT.foot[1]); SHARED.py=LOFT.top; LOFT.up=false; } };
  PQ.lamp=()=>{ '@later'; if(LOFT.lit)return say('THE LAMP IS LIT. THE MOTHS COME TO ITS SHEET; NET THEM BEFORE THE BATS DO.');
    if(!midnight())return say('THE MOTHS COME TO A LAMP ONLY AROUND MIDNIGHT. COME BACK THEN.','#c8a090');
    LOFT.lit=true; LOFT.glass.emissive.setHex(0xffd890); LOFT.light.intensity=40; if(SFX.play)SFX.play('click',{vol:.4}); const rare=ready('mothluna',7)&&Math.random()<.5+sk('ento')/200;
    for(let i=0;i<6;i++)mkMoth(i===0&&rare?LUNA:MOTHS[Math.floor(Math.random()*(sk('ento')>40?4:3))]); if(rare){ took('mothluna'); say('YOU LIGHT THE LAMP. MOTHS COME OUT OF THE DARK TO ITS SHEET, AND AMONG THEM A PALE GREEN GHOST: A LUNA MOTH!','#c8f0d0'); }
    else say('YOU LIGHT THE LAMP. MOTHS COME OUT OF THE DARK TO ITS WHITE SHEET.','#f2e8c0'); };
  const mkMoth=K=>{ const g=new THREE.Mesh(LOFT.MG,new THREE.MeshLambertMaterial({color:K[2],side:THREE.DoubleSide,emissive:K===LUNA?0x1a3a20:0})); LOFT.lampG.add(g); const m={K,g,a:Math.random()*6.28,r:(.3+Math.random()*.6)*WU,y:(1.2+Math.random()*.9)*WU};
    m.th={name:'A '+NM[K[0]].replace(' (RARE)',''),obj:g,reach:1.4*T,near:2.2*T,tall:.4*T,act:()=>PQ.net(m)}; UI.thing(m.th); LOFT.moths.push(m); return m; };
  const unMoth=m=>{ LOFT.lampG.remove(m.g); const i=UI.things.indexOf(m.th); if(i>=0)UI.things.splice(i,1); const j=LOFT.moths.indexOf(m); if(j>=0)LOFT.moths.splice(j,1); for(const b of LOFT.bats)if(b.prey===m)b.prey=null; };
  const mothsHeld=()=>Object.keys(INV.items).reduce((a,id)=>a+(id.startsWith('mo_')?INV.items[id]:0),0);
  PQ.net=m=>{ '@later'; if(!has('net'))return say('YOU NEED A BUTTERFLY NET FOR MOTHS ON THE WING. THE PARK RANGER AT THE BUTTERFLY STALL HAS THEM.','#c8a090');
    if(BFLY&&BFLY.held&&BFLY.held()+mothsHeld()>=BFLY.room())return say('YOUR JARS ARE FULL. SELL SOME, OR BUY A BIGGER JAR.','#c8a090');
    const d=m.K[1]; if(SFX.play)SFX.play('step',{vol:.4}); if(!use('ento',d-25,d+25,-0)){ m.a+=2; m.r=(.3+Math.random()*.6)*WU; return say('IT TUMBLES OUT OF YOUR NET AND BACK TO THE LIGHT.','#c8a090'); }
    FORAGE.give(m.K[0],1); FORAGE.draw(); unMoth(m); say(m.K===LUNA?'YOU NET THE LUNA MOTH. ITS LONG GREEN TAILS TREMBLE. A RARE CATCH!':'YOU NET A '+NM[m.K[0]]+'.',m.K===LUNA?'#f2c14e':'#e8e2cc'); };
  const loftTick=dt=>{ if(!LOFT.G)return; const n=Math.hypot(pos.x-LOFT.x,pos.z-LOFT.z)<120*T; LOFT.G.visible=n&&out(); const t=now();
    if(LOFT.mode){ LOFT.t+=dt; const D=3/(FORAGE.climbK?FORAGE.climbK():1), k=Math.min(1,LOFT.t/D); if(Math.hypot(pos.x-LOFT.foot[0],pos.z-LOFT.foot[1])>.8*T){ LOFT.mode=null; LOFT.up=false; }
      else { LOFT.h=LOFT.mode==='up'?LOFT.g+(LOFT.top-LOFT.g)*k:LOFT.top+(LOFT.g-LOFT.top)*k; SHARED.py=LOFT.h; if(k>=1){ if(LOFT.mode==='up'){ LOFT.up=true; go(LOFT.x+.6*LOFT.hw,LOFT.z); SHARED.py=LOFT.top; if(FORAGE.climbed)FORAGE.climbed(); } LOFT.mode=null; } } }
    else if(LOFT.up&&(Math.abs(pos.x-LOFT.x)>LOFT.hw||Math.abs(pos.z-LOFT.z)>LOFT.hd))LOFT.up=false;   // stepped off the edge: you fall
    LOFT.upTh.obj.visible=!LOFT.up&&!LOFT.mode; LOFT.dnTh.obj.visible=LOFT.up;
    if(LOFT.lit&&(!midnight()||!n)){ LOFT.lit=false; LOFT.glass.emissive.setHex(0); LOFT.light.intensity=0; while(LOFT.moths.length)unMoth(LOFT.moths[0]); }
    for(const m of LOFT.moths){ m.a+=dt*(1.5+Math.sin(t+m.r)); m.g.position.set(.45*WU+Math.cos(m.a)*m.r*.3,m.y+Math.sin(m.a*2)*.15*WU,Math.sin(m.a)*m.r); m.g.rotation.set(Math.sin(t*20+m.a)*.6,m.a,0); }
    for(const b of LOFT.bats){ b.g.visible=LOFT.lit; if(!LOFT.lit)continue; b.t-=dt; b.a+=dt*1.2; let tx=Math.cos(b.a)*3*WU, ty=3*WU, tz=Math.sin(b.a)*3*WU;   // the bats circle wide, then swoop for a moth; a slow netter loses it
      if(!b.prey&&b.t<=0&&LOFT.moths.length){ b.prey=LOFT.moths[Math.floor(Math.random()*LOFT.moths.length)]; b.t=2.5; }
      if(b.prey){ const p=b.prey.g.position; tx=p.x; ty=p.y; tz=p.z; if(b.t<=0){ const nm=NM[b.prey.K[0]].replace(' (RARE)',''); unMoth(b.prey); b.t=6+Math.random()*4; say('A BAT SWOOPS IN AND SNATCHES THE '+nm+'!','#c8a090'); } }
      const P=b.g.position, k=Math.min(1,dt*(b.prey?1.6:2)); P.x+=(tx-P.x)*k; P.y+=(ty-P.y)*k; P.z+=(tz-P.z)*k; const f=Math.sin(t*18+b.a)*.7; b.g.userData['w-1'].rotation.y=f; b.g.userData['w1'].rotation.y=-f; } };

  /* ---------- built once the park is, each piece only when you come near; hidden when far ---------- */
  let can=false, placed=false; SYS.onStart(()=>LOAD('later').then(()=>{ can=true; }),'147b-parkfinds');
  const place=()=>{ '@later'; placed=true; const B=SHARED.BOD, C=MODS.castle.BOUND, cx=(C.x0+C.x1)/2, cz=(C.z0+C.z1)/2, back=1;   // the castle's gate faces -z, its back +z
    taken.push([cx,cz,16*T]); const L0=FOUNT.S&&FOUNT.S.L, lx=L0?B.XS(L0.x+(PARK.ox||0)):cx, lz=L0?B.ZS(L0.y+(PARK.oy||0)):cz, lr=L0?Math.max(L0.rx,L0.ry)*T:0;
    const o=find(cx,C.z1+14*T,8*T); if(o){ buildOrch(o[0],o[1]); }
    const h=find(lx-(lr+16*T),lz,5*T); if(h)buildHive(h[0],h[1]);
    buildWell(); buildLoft(); };
  SYS.add('places',dt=>{ dt=Math.min(.1,dt||0); if(can&&!placed&&PARK.ready&&MODS.castle&&FOUNT.S&&FOUNT.LV!=null&&WEEDS.inPark&&WEEDS.inPark(pos.x,pos.z,-40))place(); iceTick(dt); if(!placed)return; orchTick(dt); hiveTick(dt); loftTick(dt); },'147b-parkfinds');
  PQ.lk=lk; PQ.iceY=iceY; PQ.step=dt=>{ iceTick(dt); if(placed){ loftTick(dt); } };   // (a check steps them by whole seconds; this machine's frames are slow)
  window.PQDBG=()=>({placed,ice:{on:ICE.on,built:ICE.built,holes:ICE.holes.length,cracks:ICE.cracks.length,cold:cold()},orch:ORCH.G?[ORCH.x/T|0,ORCH.z/T|0]:null,hive:HIVE.G?[HIVE.x/T|0,HIVE.z/T|0]:null,loft:LOFT.G?{up:LOFT.up,mode:LOFT.mode,lit:!!LOFT.lit,moths:LOFT.moths.length,top:+(LOFT.top/T).toFixed(2)}:null});
}
