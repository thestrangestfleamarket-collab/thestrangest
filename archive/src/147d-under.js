// UNDERGROUND SET PIECES: off THE UNDERWAY the Fairy Ring (glowing mushrooms, spore clouds), the Crystal Grotto (geodes, falling rock) and the Drowned Apothecary (flooded shop: crowbar, cabinets, glass, recipe scrolls); off the dungeon's crypt the Knight's Tomb (a suit of armour that fights); from the Hudson wreck the Smugglers' Tunnel up to the bar (a cache). Each its own cavern level (CAVERNS.make), built on the way in.
import {SHARED, THREE} from './003-shx.js';
import {EQUIP, FORAGE, INSPECT, INV, ITEMS, pos, ROOMS, SFX, st, SWIM, UI, VIT, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {FADE, FIX, grab, MAPG, MODS, OFFDX, SOL, STN, SYS, TILE} from './006-map-pre.js';
import {RIVER} from './066-river.js';
import {CAVERNS} from './066a-caverns.js';
import {WRECK} from './066ba-wreck.js';
import {GEMS} from './101-gems.js';
import {LOUNGE} from './146zca-lounge.js';
await grab('fairyring',async()=>{}); await grab('grotto',async()=>{}); await grab('apothecary',async()=>{}); await grab('tomb',async()=>{}); await grab('smuggle',async()=>{});
const UNDER={}; window.UNDER=UNDER;
{ const T=TILE, MW=T/.84, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, Y=SHARED.BOD.YS, dy=STN.DY, o=x=>x+OFFDX, say=(t,c)=>SAY(t,c||'#c8e0d0'), fy=()=>dy+Y(.3);
  const U=FORAGE.S.under||(FORAGE.S.under={learn:{}}); U.learn=U.learn||{}; const keep=()=>FORAGE.save();
  const sees=()=>!!EQUIP.light||!!(FORAGE.S.fx&&FORAGE.S.fx.dark>0), DARK='TOO DARK TO SEE. A HEADLIGHT, OR A GLOWCAP EATEN, WOULD SHOW IT.';
  const L=c=>new THREE.MeshLambertMaterial({color:c}), B=c=>new THREE.MeshBasicMaterial({color:c});
  const add=(G,m,me)=>{ G.add(me); m.objs.push(me); return me; };
  const bx=(G,m,x0,y0,x1,y1,a,b,mat)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(X(x1)-X(x0)),(b-a)*T,Math.abs(Z(y1)-Z(y0))),mat); me.position.set((X(x0)+X(x1))/2,fy()+(a+b)/2*T,(Z(y0)+Z(y1))/2); me.castShadow=me.receiveShadow=true; return add(G,m,me); };
  const sol=(m,x0,y0,x1,y1,h)=>{ const s=[X(x0),Z(y0),X(x1),Z(y1)], f=[X(x0),Z(y0),dy,X(x1),Z(y1),dy+h*T]; SOL.down.push(s); FIX.down.push(f); m.sol.push(s); m.fix.push(f); };
  const thing=(m,name,obj,act,r=1.3,tall=1)=>{ const th={name,obj,reach:r*T,near:(r+1.2)*T,tall:tall*T,act}; UI.thing(th); m.things.push(th); return th; };
  const hb=(G,m,x,y,w=1,h=1.2)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(w*T,h*T,w*T),new THREE.MeshBasicMaterial({visible:false})); me.position.set(X(x),fy()+h/2*T,Z(y)); return add(G,m,me); };
  const near=(x,y,r)=>Math.hypot(pos.x-X(x),pos.z-Z(y))<r*T;
  // the finds: rare glowing mushrooms, raw geodes for the gem wheel, the apothecary's salvage and scrolls, the knight's blade, smugglers' gold
  const NM={fy_lantern:'FAIRY LANTERN',fy_starspore:'STARSPORE',fy_elfcandle:"ELF'S CANDLE",fy_dust:'FAIRY RING DUST',raw_geode:'RAW CRYSTAL GEODE',cut_grotto:'CUT GROTTO CRYSTAL',crowbar:'CROWBAR',
    ap_brine:'DROWNED BRINE',ap_salts:'BLUE SALTS',ap_root:'MANDRAKE ROOT',scroll_deep:'OLD SCROLL: ELIXIR OF THE DEEP',scroll_glow:'OLD SCROLL: LANTERN DRAUGHT',scroll_iron:'OLD SCROLL: IRONSKIN TONIC',sword_knight:"THE KNIGHT'S BLADE",gold_nugget:'GOLD NUGGET'};
  FORAGE.add({names:NM,prices:{fy_lantern:60,fy_starspore:90,fy_elfcandle:160,fy_dust:25,raw_geode:30,cut_grotto:95,crowbar:6,ap_brine:15,ap_salts:18,ap_root:22,scroll_deep:40,scroll_glow:40,scroll_iron:40,sword_knight:200,gold_nugget:45},sellable:true,
    recipes:[['cut_grotto','CUT GROTTO CRYSTAL','gem',[20,75],{raw_geode:1},'sells for $95']]});
  const RX={deep:['px_deep','ELIXIR OF THE DEEP','alchemy',[20,70],{fy_lantern:1,ap_brine:1},'a minute more air underwater'],glow:['px_glow','LANTERN DRAUGHT','alchemy',[30,80],{fy_starspore:1,ap_salts:1},'see in the dark 10 min'],iron:['px_iron','IRONSKIN TONIC','alchemy',[40,90],{ap_root:1,fy_dust:2},'strong 4 min, some health']};
  FORAGE.add({names:{px_deep:'ELIXIR OF THE DEEP',px_glow:'LANTERN DRAUGHT',px_iron:'IRONSKIN TONIC'},prices:{px_deep:70,px_glow:80,px_iron:90},edible:true,sellable:true,
    does:{px_deep:()=>{ if(VIT.breathe)VIT.breathe(60); },px_glow:()=>FORAGE.buff('dark',600),px_iron:()=>{ FORAGE.buff('str',240); VIT.heal(.3); }}});
  ITEMS.reg('fy_lantern',{edible:true,darksight:300}); ITEMS.reg('sword_knight',{slot:'hand',grants:'fight',value:200,damage:4});
  for(const [id,nm,v] of [['raw_geode',NM.raw_geode,30],['cut_grotto',NM.cut_grotto,95],['gold_nugget',NM.gold_nugget,45]])GEMS.push([id,nm,v,0]);   // the golems buy them; weight 0: never a random find
  FORAGE.BUYK.mushrooms.push('fy_'); for(const k in U.learn)FORAGE.add({recipes:[RX[k]]});
  WIELD.kind('sword_knight',{name:NM.sword_knight,make:()=>WIELD.mk('sword_steel')});
  { const PC={px_deep:0x3a8ad8,px_glow:0x9affc8,px_iron:0x8a8e96,ap_brine:0x4a6a5a,ap_salts:0x4a7aff}, MC={fy_lantern:[0xffe08a,0xfff4c8],fy_starspore:[0x8ad8ff,0xe0f4ff],fy_elfcandle:[0xff8ae0,0xffe0f4]};
    INSPECT.kinds.push({is:id=>!!PC[id]||!!MC[id],make:id=>{ '@later'; if(PC[id])return INSPECT.shape('bottle',PC[id]); const [c,s]=MC[id]; return INSPECT.recipe({s:.04,f:(p,k)=>{ p('cyl',s,0,k*.5,0,k*.25,k,k*.25); p('cap',c,0,k*.95,0,k*1.1,k*.6,k*1.1); }}); }}); }
  // the pack's buttons: a raw geode is cut on the gem wheel; a scroll is read once (its recipe learned), then brewed from
  const learn=k=>{ '@later'; if(U.learn[k])return; U.learn[k]=1; FORAGE.add({recipes:[RX[k]]}); keep(); say('YOU READ THE WATER-STAINED SCROLL. YOU HAVE LEARNED TO BREW '+RX[k][1]+' ('+Object.entries(RX[k][4]).map(([i,n])=>n+' '+FORAGE.name(i)).join(', ')+').','#c8b0ff'); FORAGE.draw(); };
  FORAGE.ROWB.push(id=>id==='raw_geode'?[['CUT','ucut']]:/^scroll_/.test(id)&&RX[id.slice(7)]?[[U.learn[id.slice(7)]?'BREW':'READ','uscroll']]:[]);
  FORAGE.ACT.ucut=()=>FORAGE.craft('cut_grotto');
  FORAGE.ACT.uscroll=id=>{ const k=id.slice(7); if(!U.learn[k])learn(k); else FORAGE.craft(RX[k][0]); };

  /* ---------- the ways in from THE UNDERWAY: a crack to the Fairy Ring, one to the Crystal Grotto, a cellar hatch to the Apothecary (a tank asked) ---------- */
  const UW=MODS.underway.C, WAYS=[['fairy','fairyring','A GLOWING CRACK (THE FAIRY RING)',o(1336.5),-39.2,-37.6,0],['grotto','grotto','A GLITTERING CRACK (THE CRYSTAL GROTTO)',o(1378),-39.2,-37.6,0],['apoth','apothecary','A SUNKEN CELLAR HATCH (THE DROWNED APOTHECARY)',o(1313),-26.8,-28.4,Math.PI]];
  for(const [k,id,,x,,sy,h] of WAYS){ UW.spawns[k]=[x,sy,h]; UW.outs[k]=()=>MODS[id].go(1,'underway'); }
  CAVERNS.hooks.push((C,G,m)=>{ '@caverns'; if(C.id!=='underway')return;
    for(const [k,,name,x,y] of WAYS){ const g=bx(G,m,x-.7,y-.25,x+.7,y+.25,0,2.2,B(k==='fairy'?0x0e2a1c:k==='grotto'?0x1a1430:0x1c1610));
      if(k!=='apoth')bx(G,m,x-.75,y-.3,x+.75,y+.3,2.1,2.25,B(k==='fairy'?0x5affb0:0xc8a0ff)); else for(let i=0;i<4;i++)bx(G,m,x-.6+i*.4,y-.3,x-.5+i*.4,y+.3,.2,1.9,L(0x5a4a34));
      thing(m,name,g,()=>{ if(k==='apoth'&&!(SWIM.tank()>20))return say('THE CELLAR BELOW IS FLOODED TO ITS CEILING. YOU NEED A SCUBA TANK (RENT ONE AT FISHING & SCUBA).','#9fd8ff'); C.api.go(0,k); },1.6,2.4); } });

  /* ---------- THE FAIRY RING: a dark chamber, a ring of glowing caps (picked once a day; MYCOLOGY), spore clouds that turn your head ---------- */
  const FR={x:o(1432),y:-71}, KIND=[['fy_lantern',30,0xffe08a],['fy_starspore',50,0x8ad8ff],['fy_lantern',30,0xffe08a],['fy_starspore',50,0x8ad8ff],['fy_elfcandle',70,0xff8ae0],['fy_lantern',30,0xffe08a],['fy_starspore',50,0x8ad8ff],['fy_lantern',30,0xffe08a],['fy_starspore',50,0x8ad8ff]];
  const SPORES=[[o(1427),-67.5,0],[o(1437),-75,2.1],[o(1438),-66,4.2]]; let conf=0, sporeSaid=0;
  const fring=CAVERNS.make({id:'fairyring',name:'THE FAIRY RING',leaving:'BACK TO THE UNDERWAY',lot:{x0:o(1420),y0:-80,x1:o(1444),y1:-62},H:90,murk:0x10241a,see:6,clear:20,wall:[34,40,38],floor:[26,32,26],amb:.25,sky:0x406050,ground:0x0c100c,
    parts:[{r:{x0:o(1420),y0:-80,x1:o(1444),y1:-62},floor:[30,38,28]}],dry:[{x0:o(1420),y0:-80,x1:o(1444),y1:-62}],
    rocks:[[o(1424),-78,1.6,40],[o(1441),-64,1.4,34],[o(1440),-78.5,1.2,28]],roots:[[o(1428),-70,2.4],[o(1435),-76,3],[o(1431),-65,2]],
    caps:[[o(1423),-76,0x7affd0],[o(1426),-64,0x9fe8ff],[o(1441),-70,0xb8ffa0],[o(1434),-78.6,0x7affd0],[o(1429),-79,0x9fe8ff]],
    lights:[[FR.x,FR.y,30,0x60ffb0,3,7],[o(1423),-71,40,0x407060,1.5,5]],
    exits:[[o(1421.2),-71,'BACK TO THE UNDERWAY','underway']],spawns:{underway:[o(1423),-71,Math.PI/2]},outs:{underway:()=>MODS.underway.go(1,'fairy')}});
  CAVERNS.hooks.push((C,G,m)=>{ '@caverns'; if(C.id!=='fairyring')return; UNDER.fr={hl:m.objs.find(q=>q.isHemisphereLight),caps:[],clouds:[]};
    KIND.forEach(([id,d,c],i)=>{ const a=i/KIND.length*Math.PI*2, x=FR.x+Math.cos(a)*3, y=FR.y+Math.sin(a)*3, k='fring'+i, s=id==='fy_elfcandle'?1.4:1;
      const st=add(G,m,new THREE.Mesh(new THREE.CylinderGeometry(.05*T*s,.07*T*s,.35*T*s,6),B(0xe8f4e0))), cp=add(G,m,new THREE.Mesh(new THREE.SphereGeometry(.2*T*s,10,6,0,Math.PI*2,0,Math.PI/2),B(c)));
      st.position.set(X(x),fy()+.17*T*s,Z(y)); cp.position.set(X(x),fy()+.33*T*s,Z(y)); const cap={k,st,cp}; UNDER.fr.caps.push(cap); st.visible=cp.visible=INV.ready(k);
      thing(m,NM[id],cp,()=>{ if(!sees())return say(DARK); if(!INV.ready(k))return say('ONLY A STUMP. IT GROWS BACK BY TOMORROW.','#c8a090');
        if(FORAGE.use('myco',d-45,d+15)){ INV.mark(k); FORAGE.give(id,1); say('YOU EASE UP '+(id==='fy_elfcandle'?'AN ':'A ')+NM[id]+'. IT GLOWS IN YOUR HAND.','#b8ffd8'); st.visible=cp.visible=false; }
        else if(Math.random()<.3){ INV.mark(k); st.visible=cp.visible=false; say('IT CRUMBLES TO GLOWING DUST IN YOUR FINGERS.','#c8a090'); } else say('YOU CANNOT TELL WHERE TO CUT IT. IT IS TOO DELICATE.','#c8a090'); FORAGE.draw(); },1,.6); });
    { const k='fringdust', mo=bx(G,m,FR.x-.5,FR.y-.5,FR.x+.5,FR.y+.5,0,.08,B(0xe8ffb0)); mo.visible=INV.ready(k);
      thing(m,'THE RING\'S DUST',mo,()=>{ if(!sees())return say(DARK); if(!INV.ready(k))return say('THE DUST SETTLES AGAIN BY TOMORROW.','#c8a090'); INV.mark(k); FORAGE.give('fy_dust',2); mo.visible=false; say('YOU SWEEP UP A PINCH OF THE RING\'S GLITTERING DUST.','#e8ffb0'); FORAGE.draw(); },1,.4); }
    for(const [x,y,ph] of SPORES){ const me=add(G,m,new THREE.Mesh(new THREE.SphereGeometry(1.3*T,12,8),new THREE.MeshBasicMaterial({color:0xb8ff70,transparent:true,opacity:0,depthWrite:false}))); me.position.set(X(x),fy()+.7*T,Z(y)); UNDER.fr.clouds.push({x,y,ph,me,on:false}); } });
  const frTick=dt=>{ const F=UNDER.fr; if(!F||!fring.built||SHARED.LVL!=='down'||!fring.inside(pos.x,pos.z))return; const t=performance.now()/1e3, see=sees();
    if(F.hl)F.hl.intensity+=((see?1.1:.08)-F.hl.intensity)*Math.min(1,dt*3);   // pitch dark but for the caps, unless you bring a light or eat a glowcap
    for(const c of F.clouds){ const u=((t+c.ph)%6)/6; c.on=u<.38; c.me.material.opacity=c.on?.32*Math.sin(Math.PI*u/.38):0; c.me.scale.setScalar(c.on?.6+u:.4);
      if(c.on&&near(c.x,c.y,1.4)&&!VIT.dead){ if(conf<=0&&t-sporeSaid>4){ sporeSaid=t; say('A PUFF OF SPORES! YOUR HEAD SPINS.','#d8ff9a'); SFX.play('cough',{vol:.4}); } conf=3; } }
    if(conf>0){ conf-=dt; SHARED.heading+=Math.sin(t*2.3)*2.4*dt; } };   // the spores turn you as you go

  /* ---------- THE CRYSTAL GROTTO: crystals a headlight shows and the sonic extractor frees (a raw geode a cluster a day, cut on the gem wheel); the roof comes down with a rumble first ---------- */
  const GR={x0:o(1460),y0:-80,x1:o(1490),y1:-62}, CRY=[[o(1464),-78.5],[o(1470),-63.5],[o(1476),-79],[o(1481),-64],[o(1486),-77],[o(1488),-68],[o(1474),-71]];
  const grotto=CAVERNS.make({id:'grotto',name:'THE CRYSTAL GROTTO',leaving:'BACK TO THE UNDERWAY',lot:GR,H:120,murk:0x18142a,see:6,clear:20,wall:[44,40,52],floor:[34,32,40],amb:.3,sky:0x6a5a8a,ground:0x100c18,
    parts:[{r:GR,floor:[40,36,46]}],dry:[GR],rocks:[[o(1466),-70,2,50],[o(1479),-74,1.8,60],[o(1484),-66,1.4,36]],
    lights:[[o(1470),-64,50,0x9a70ff,3,7],[o(1476),-78,40,0x4ae0c8,3,7],[o(1487),-72,50,0xc8a0ff,3,7]],
    exits:[[o(1461.2),-71,'BACK TO THE UNDERWAY','underway']],spawns:{underway:[o(1463),-71,Math.PI/2]},outs:{underway:()=>MODS.underway.go(1,'grotto')}});
  let fall=null, fallT=30; const ROCKS=[];
  UNDER.collapse=(x,z)=>{ '@later'; const G=UNDER.gr; if(!G||fall)return; fall={x:x??pos.x,z:z??pos.z,t:0,hit:false}; G.ring.position.set(fall.x,fy()+.03*T,fall.z); G.ring.visible=true;
    for(const r of G.rocks){ r.visible=false; } say('THE ROOF RUMBLES ABOVE YOU. DUST TRICKLES DOWN...','#e8d8b0'); SFX.play('thunder',{vol:.5,pitch:1.6}); };
  CAVERNS.hooks.push((C,G,m)=>{ '@caverns'; if(C.id!=='grotto')return; UNDER.gr={hl:m.objs.find(q=>q.isHemisphereLight),rocks:[],cl:[]};
    const ring=add(G,m,new THREE.Mesh(new THREE.RingGeometry(1.0*T,1.4*T,20).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xd8c8a0,transparent:true,opacity:.6,depthWrite:false}))); ring.visible=false; UNDER.gr.ring=ring;
    for(let i=0;i<6;i++){ const r=add(G,m,new THREE.Mesh(new THREE.DodecahedronGeometry(.28*T,0),L(0x5a5462))); r.visible=false; UNDER.gr.rocks.push(r); }
    CRY.forEach(([x,y],i)=>{ const k='grotto'+i, g=new THREE.Group(), cols=[0xb070ff,0x4ae0c8,0xe8e0ff]; g.position.set(X(x),fy(),Z(y)); add(G,m,g);
      for(let j=0;j<5;j++){ const c=new THREE.Mesh(new THREE.OctahedronGeometry(.5,0),B(cols[(i+j)%3])); c.scale.set(.16*T,(.4+.25*((i*3+j)%3))*T,.16*T); c.position.set((j-2)*.14*T,.2*T,((j*7)%3-1)*.12*T); c.rotation.set((j-2)*.25,j,(j%2-.5)*.4); g.add(c); }
      g.scale.setScalar(INV.ready(k)?1:.45); const h=hb(G,m,x,y,1,1); UNDER.gr.cl.push({k,g});
      thing(m,'A CRYSTAL CLUSTER',h,()=>{ if(!sees())return say(DARK); if(!FORAGE.has('extractor'))return say('THE CRYSTAL IS FUSED INTO THE ROCK. A SONIC EXTRACTOR WOULD SHAKE IT FREE.','#c8a090');
        if(!INV.ready(k))return say('NOTHING MORE WILL COME FREE HERE TODAY.','#c8a090'); INV.mark(k); const n=1+(FORAGE.use('gem',0,70)&&Math.random()<.4?1:0); FORAGE.give('raw_geode',n); g.scale.setScalar(.45);
        say('THE EXTRACTOR HUMS. '+(n>1?'TWO GEODES CRACK':'A GEODE CRACKS')+' FREE OF THE WALL. (CUT IT ON A GEM WHEEL.)','#d8c8ff'); SFX.play('chirp',{vol:.4,pitch:.6}); FORAGE.draw(); if(Math.random()<.5)UNDER.collapse(); },1.4,1); }); });
  const grTick=dt=>{ const G=UNDER.gr; if(!G||!grotto.built||SHARED.LVL!=='down'||!grotto.inside(pos.x,pos.z)){ fall=null; return; }
    if(G.hl)G.hl.intensity+=((sees()?1.1:.12)-G.hl.intensity)*Math.min(1,dt*3);
    if(!fall){ if((fallT-=dt)<=0){ fallT=25+Math.random()*20; UNDER.collapse(); } return; }
    fall.t+=dt; const W=1.8, k=Math.max(0,fall.t-W), top=fy()+Y(110);
    G.ring.material.opacity=.3+.3*Math.sin(fall.t*12);
    if(fall.t>W)G.rocks.forEach((r,i)=>{ const a=i*1.1, d=(.3+.15*i)*T, y=Math.max(fy()+.25*T,top-(top-fy())*Math.min(1,(k-i*.05)*2.6)); r.visible=k>i*.05; r.position.set(fall.x+Math.cos(a)*d,y,fall.z+Math.sin(a)*d); r.rotation.set(k*3+i,k*2,0); });
    if(!fall.hit&&k>.45){ fall.hit=true; SFX.play('boom',{vol:.6}); if(Math.hypot(pos.x-fall.x,pos.z-fall.z)<1.4*T&&!VIT.dead){ VIT.hurt(.14); say('ROCKS CRASH DOWN ON YOU!','#ff9a8a'); } else say('ROCKS CRASH DOWN WHERE YOU STOOD.','#e8d8b0'); }
    if(fall.t>W+5){ G.ring.visible=false; for(const r of G.rocks)r.visible=false; fall=null; } };

  /* ---------- THE DROWNED APOTHECARY: a flooded basement shop; a crowbar on its counter pries the cabinets (scrolls, salvage, now and then a potion, once a day each); broken glass and spilt bottles poison ---------- */
  const AP={x0:o(1510),y0:-80,x1:o(1534),y1:-64}, CAB=[[o(1514),-79.3],[o(1519),-79.3],[o(1525),-79.3],[o(1530),-79.3]], GLASS=[[o(1516),-72],[o(1527),-69],[o(1522),-76]];
  const apoth=CAVERNS.make({id:'apothecary',name:'THE DROWNED APOTHECARY',leaving:'BACK TO THE UNDERWAY',lot:AP,H:80,murk:0x26382c,see:4,clear:18,wall:[70,60,50],floor:[54,48,40],amb:.9,sky:0x8ab8a0,ground:0x2a2418,
    parts:[{r:AP,floor:[60,52,42]}],lights:[[o(1522),-72,60,0x9fd8b0,6,10],[o(1514),-66,40,0x6aa0a0,3,6]],
    exits:[[o(1532.8),-72,'BACK UP TO THE UNDERWAY','underway']],spawns:{underway:[o(1531),-72,-Math.PI/2]},outs:{underway:()=>MODS.underway.go(1,'apoth')}});
  let glassT=0;
  CAVERNS.hooks.push((C,G,m)=>{ '@caverns'; if(C.id!=='apothecary')return; const wood=L(0x4a3424), dark=L(0x2e2218);
    bx(G,m,o(1512),-70.5,o(1524),-69.5,0,1.2,wood); sol(m,o(1512),-70.5,o(1524),-69.5,1.2);   // the counter
    bx(G,m,o(1511),-79.9,o(1533),-79.3,0,2.6,dark); for(const h of [.9,1.6,2.3])bx(G,m,o(1511),-79.7,o(1533),-79.2,h,h+.06,wood);   // the back shelves
    for(let i=0;i<22;i++){ const x=o(1511.5)+i, c=[0x5a8a6a,0x8a5a3a,0x3a5a8a,0x9a9a6a][i%4]; if(i%3===2)continue; const b=add(G,m,new THREE.Mesh(new THREE.CylinderGeometry(.07*T,.08*T,.28*T,6),L(c))); b.position.set(X(x),fy()+(i%2?1.75:1.05)*T,Z(-79.5)); }
    const bar=bx(G,m,o(1516),-70.2,o(1517.2),-69.8,1.2,1.26,L(0x6a3a2a)); bar.visible=!FORAGE.has('crowbar');
    thing(m,'A RUSTED CROWBAR',bar,()=>{ if(FORAGE.has('crowbar'))return say('YOU ALREADY CARRY A CROWBAR.','#c8a090'); FORAGE.give('crowbar',1); bar.visible=false; say('YOU TAKE THE RUSTED CROWBAR FROM THE COUNTER. IT WOULD PRY A CABINET.','#e8e2cc'); FORAGE.draw(); },1.2,1.4);
    CAB.forEach(([x,y],i)=>{ const k='apoth'+i, c=bx(G,m,x-1,y,x+1,y+.9,0,1.6,L(0x5a4030)); bx(G,m,x-.05,y+.9,x+.05,y+.95,.6,1.0,L(0xb08838));
      thing(m,'A SWOLLEN CABINET',c,()=>{ if(!FORAGE.has('crowbar'))return say('LOCKED AND SWOLLEN SHUT. A CROWBAR WOULD PRY IT.','#c8a090'); if(!INV.ready(k))return say('EMPTY. THE FLOOD WASHES MORE IN BY TOMORROW.','#c8a090');
        INV.mark(k); SFX.play('creak',{vol:.5}); const sc=Object.keys(RX).find(q=>!U.learn[q]&&!FORAGE.has('scroll_'+q));
        if(sc&&(i===0||Math.random()<.5)){ FORAGE.give('scroll_'+sc,1); say('YOU PRY IT OPEN. INSIDE, IN AN OILSKIN: '+NM['scroll_'+sc]+'.','#c8b0ff'); }
        else { const id=['ap_brine','ap_salts','ap_root'][Math.floor(Math.random()*3)], n=1+(Math.random()<.4?1:0); FORAGE.give(id,n); let t='YOU PRY IT OPEN: '+(n>1?n+' × ':'')+NM[id];
          if(Math.random()<.25){ const p=['px_deep','px_glow','px_iron'][Math.floor(Math.random()*3)]; FORAGE.give(p,1); t+=', AND A STOPPERED BOTTLE OF '+FORAGE.name(p); } say(t+'.','#e8e2cc'); } FORAGE.draw(); },1.4,1.6); });
    for(const [x,y] of GLASS){ for(let j=0;j<7;j++){ const s=add(G,m,new THREE.Mesh(new THREE.BoxGeometry(.18*T,.02*T,.08*T),new THREE.MeshBasicMaterial({color:0xbfe8e0,transparent:true,opacity:.7}))); s.position.set(X(x)+Math.cos(j*2.4)*.6*T,fy()+.02*T,Z(y)+Math.sin(j*2.4)*.6*T); s.rotation.y=j; }
      const b=add(G,m,new THREE.Mesh(new THREE.CylinderGeometry(.08*T,.09*T,.3*T,6),L(0x6a8a4a))); b.rotation.z=Math.PI/2; b.position.set(X(x),fy()+.08*T,Z(y)); } });
  const apTick=dt=>{ if(!apoth.built||SHARED.LVL!=='down'||!apoth.inside(pos.x,pos.z)||VIT.dead)return; if((glassT-=dt)>0)return; const W=st.water;
    if(GLASS.some(([x,y])=>near(x,y,1.1))&&(!W||!W.in||W.y<36)){ glassT=4; VIT.hurt(.03); FORAGE.buff('poison',20); say('BROKEN GLASS CUTS YOU, AND THE SPILT BOTTLES STING: YOU HAVE BEEN POISONED!','#9fe07f'); } };   // only down at the floor

  /* ---------- THE KNIGHT'S TOMB: a sealed door in the dungeon's crypt; a suit of armour that wakes and fights (blocks and parries count); beaten, it gives the knight's blade once and a purse every day ---------- */
  const TB={x0:o(1550),y0:-80,x1:o(1576),y1:-62}, PL={x:o(1563),y:-75.5}, D=MODS.dungeon, CR=()=>D.rooms[2].B;   // the crypt is the dungeon's third room
  const tomb=CAVERNS.make({id:'tomb',name:"THE KNIGHT'S TOMB",leaving:'BACK TO THE CRYPT',lot:TB,H:120,murk:0x201c18,see:6,clear:20,wall:[72,68,62],floor:[58,54,50],amb:.7,sky:0xc8b8a0,ground:0x2a2418,
    parts:[{r:TB,floor:[62,58,52]}],dry:[TB],lights:[[o(1555),-63,60,0xffa860,8,8],[o(1571),-63,60,0xffa860,8,8],[PL.x,PL.y+1,70,0xffc890,8,9]],
    exits:[[o(1551.2),-71,'BACK UP TO THE CRYPT','dungeon']],spawns:{dungeon:[o(1553),-71,Math.PI/2]},
    outs:{dungeon:()=>{ const b=CR(); UI.goTo(X((b.x0+b.x1)/2),Z(b.y0+2.2),'down'); SHARED.heading=0; }}});
  { let door=null; D.hook(k=>{ if(!k){ if(door){ door.g.removeFromParent(); const i=UI.things.indexOf(door.th); if(i>=0)UI.things.splice(i,1); door=null; } return; } if(door)return;
      const b=CR(), x=(b.x0+b.x1)/2, y=b.y0+.35, g=new THREE.Group(), st=L(0x5a5650); g.name='tomb-door';
      for(const [w,h,d,py,c] of [[1.8,2.6,.3,1.3,st],[2.1,.3,.4,2.75,st],[.5,1.2,.05,1.4,L(0x77726a)]]){ const me=new THREE.Mesh(new THREE.BoxGeometry(w*T,h*T,d*T),c); me.position.y=py*T; g.add(me); }
      g.position.set(X(x),fy(),Z(y)); MAPG.dungeon.add(g); const th={name:"A SEALED DOOR CARVED WITH A KNIGHT (THE KNIGHT'S TOMB)",obj:g,reach:1.6*T,near:2.8*T,tall:2.6*T,act:()=>tomb.go(1,'dungeon')}; UI.thing(th); door={g,th}; }); }
  const KN={st:'rest',hp:0,x:0,z:0,h:0,t:0,cool:0,said:0,stag:0,fl:0,bare:0};
  CAVERNS.hooks.push((C,G,m)=>{ '@caverns'; if(C.id!=='tomb')return; const stone=L(0x6a6660);
    bx(G,m,PL.x-1.2,PL.y-1,PL.x+1.2,PL.y+1,0,.5,stone); sol(m,PL.x-1.2,PL.y-1,PL.x+1.2,PL.y+1,.5);   // its plinth
    bx(G,m,o(1560),-67,o(1566),-64,0,1.1,stone); bx(G,m,o(1560.2),-66.8,o(1565.8),-64.2,1.1,1.3,L(0x77726a)); sol(m,o(1560),-67,o(1566),-64,1.3);   // the knight's sarcophagus
    const steel=new THREE.MeshLambertMaterial({color:0x9aa0a8}), dk=L(0x3a3e44), g=new THREE.Group(), P=(w,h,d,x,y,z,M=steel,par=g)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(w*MW,h*MW,d*MW),M); me.position.set(x*MW,y*MW,z*MW); me.castShadow=true; par.add(me); return me; };
    const legs=[-1,1].map(s=>{ const q=new THREE.Group(); q.position.set(s*.12*MW,.84*MW,0); g.add(q); P(.16,.82,.18,0,-.42,0,steel,q); P(.18,.1,.26,0,-.8,.04,dk,q); return q; });
    P(.42,.2,.26,0,.92,0); P(.5,.56,.3,0,1.3,0); P(.06,.4,.02,0,1.32,.16,dk); for(const s of [-1,1])P(.2,.12,.28,s*.33,1.55,0);
    P(.26,.3,.28,0,1.78,0); P(.2,.03,.02,0,1.8,.15,B(0x050505)); P(.05,.18,.26,0,2.0,-.02,L(0x8a1a1a));
    const arms=[-1,1].map(s=>{ const q=new THREE.Group(); q.position.set(s*.36*MW,1.5*MW,0); g.add(q); P(.13,.62,.14,0,-.32,0,steel,q); return q; });
    P(.06,.95,.02,0,-1.05,.06,L(0xd8dce2),arms[1]); P(.24,.04,.06,0,-.6,.06,L(0xb08838),arms[1]); P(.06,.55,.45,-.08,-.45,.08,L(0x5a4a3a),arms[0]);   // a blade in the right gauntlet, a shield on the left
    add(G,m,g); KN.g=g; KN.legs=legs; KN.arms=arms; KN.steel=steel; KN.st='rest'; rest(); });
  const rest=()=>{ KN.st='rest'; KN.x=X(PL.x); KN.z=Z(PL.y); KN.h=0; if(KN.g){ KN.g.position.set(KN.x,fy()+.5*T,KN.z); KN.g.rotation.set(0,0,0); for(const q of [...KN.legs,...KN.arms])q.rotation.set(0,0,0); } };
  const won=()=>{ KN.st='down'; KN.t=0; SFX.play('clunk',{vol:.7,pitch:.6}); let t='THE ARMOUR FALLS APART WITH A CLATTER.';
    if(!U.blade){ U.blade=1; keep(); FORAGE.give('sword_knight',1); t+=" IN ITS GAUNTLET, AN OLD BLADE: THE KNIGHT'S BLADE."; }
    if(INV.ready('tombduel')){ INV.mark('tombduel'); const c=25+Math.floor(Math.random()*26); INV.cash+=c; t+=' $'+c+' IN OLD COINS SPILL FROM ITS HELM.'; FORAGE.use('sword',30,100); }
    say(t,'#f2c14e'); FORAGE.draw(); };
  UNDER.hitKnight=d=>{ if(KN.st==='fight'){ KN.hp-=d; KN.fl=.12; if(KN.hp<=0)won(); } };
  const knTick=dt=>{ '@caverns'; if(!KN.g)return; const t=performance.now()/1e3, dx=pos.x-KN.x, dz=pos.z-KN.z, d=Math.hypot(dx,dz), alive=!VIT.dead&&!(VIT.out>0); KN.steel.emissive.setHex((KN.fl-=dt)>0?0x664433:0);
    if(KN.st==='rest'){ if(d<5*T&&alive){ if(INV.ready('tombduel')||!U.blade){ KN.st='fight'; KN.hp=14; KN.cool=1.4; SFX.play('creak',{vol:.7,pitch:.7}); say('THE SUIT OF ARMOUR CREAKS, LIFTS ITS BLADE AND STEPS DOWN FROM ITS PLINTH!','#ffb08a'); }
        else if(t-KN.said>20){ KN.said=t; say('THE ARMOUR STANDS STILL. IT WILL WAKE TO DUEL AGAIN TOMORROW.','#c8c2b0'); } } return; }
    if(KN.st==='down'){ KN.t+=dt; KN.g.rotation.x=Math.min(Math.PI/2,KN.t*3); KN.g.position.y=fy()+Math.max(0,.5-KN.t)*T; if(KN.t>8)rest(); return; }
    if(!alive||d>14*T){ rest(); return; }
    KN.h=Math.atan2(dx,dz); KN.g.rotation.y=KN.h; const S=window.STRIKES;
    if(S)for(const s of S.strikes())if(S.inCone(s,KN.x,KN.z,fy(),.4*T)){ const bl=s.sk==='sword'; UNDER.hitKnight(s.d*S.strength(s)*(bl?1:.25)*(KN.stag>0?1.5:1)); S.landed(s); SFX.play(bl?'clunk':'step',{vol:.5,pitch:bl?1.8:.7}); if(!bl&&t-KN.bare>8){ KN.bare=t; say('YOUR FISTS RING OFF THE STEEL. A BLADE WOULD BITE.','#c8c2b0'); } }
    if(KN.st!=='fight')return;
    if(KN.stag>0){ KN.stag-=dt; KN.arms[1].rotation.x=.4; return; }
    if(KN.atk!=null){ KN.atk+=dt; const a=KN.atk; KN.arms[1].rotation.x=a<.55?-2.4*a/.55:-2.4+Math.min(1,(a-.55)/.15)*3;
      if(a>=.62&&!KN.hit){ KN.hit=true; if(d<1.9*T&&alive){ const r=VIT.hurt(.09,{x:KN.x,z:KN.z}); if(r===2){ KN.stag=1.4; say('IT REELS FROM YOUR PARRY!','#7dffa4'); } } }
      if(a>.9){ KN.atk=null; KN.cool=1.3+Math.random()*.6; } return; }
    if(d>1.4*T){ const v=Math.min(d-1.3*T,1.3*T*dt), b=SHARED.BOUND; KN.x+=dx/d*v; KN.z+=dz/d*v; if(b){ KN.x=Math.max(Math.min(b.x0,b.x1),Math.min(Math.max(b.x0,b.x1),KN.x)); KN.z=Math.max(Math.min(b.z0,b.z1),Math.min(Math.max(b.z0,b.z1),KN.z)); }
      KN.g.position.set(KN.x,fy(),KN.z); const w=Math.sin(t*7); KN.legs[0].rotation.x=w*.5; KN.legs[1].rotation.x=-w*.5; KN.arms[0].rotation.x=-w*.3; }
    else KN.g.position.y=fy();
    if((KN.cool-=dt)<=0&&d<1.8*T){ KN.atk=0; KN.hit=false; } };
  UNDER.knight=KN;

  /* ---------- THE SMUGGLERS' TUNNEL: a grate on the Hudson bed by the wreck, heaved open by STRENGTH; a flooded run, then a dry one with the smugglers' cache (PROSPECTING), and a ladder up to a trapdoor in THE BAR ---------- */
  const SM={x0:o(1600),y0:-76,x1:o(1660),y1:-68}, SMD={x0:o(1622),y0:-76,x1:o(1660),y1:-68}, GT={at:null,g:null,done:false};
  const smug=CAVERNS.make({id:'smuggle',name:"THE SMUGGLERS' TUNNEL",leaving:'OUT OF THE TUNNEL',lot:SM,H:70,murk:0x1c3a3a,see:4,clear:20,wall:[50,46,40],floor:[40,36,30],amb:.8,
    parts:[{r:{x0:o(1600),y0:-76,x1:o(1622),y1:-68},floor:[34,40,36]},{r:SMD,floor:[56,48,38]}],dry:[SMD],walls:[[o(1610),-76,o(1610.8),-71],[o(1616),-73,o(1616.8),-68]],
    pipes:[[o(1640),-72,14,0]],lights:[[o(1604),-72,40,0x4a8a80,4,6],[o(1640),-72,50,0xffb060,7,9],[o(1655),-70,50,0xffb060,6,8]],
    exits:[[o(1601.2),-72,'BACK DOWN TO THE RIVER','river'],[o(1658.8),-72,"UP THE LADDER INTO THE BAR'S CELLAR",'bar']],spawns:{river:[o(1603),-72,Math.PI/2],bar:[o(1657),-72,-Math.PI/2]},
    outs:{river:()=>{ if(!RIVER.on)RIVER.build(); const a=GT.at||WRECK.at; if(a){ UI.goTo(a[0],a[1]+2*T,'up'); SHARED.heading=Math.PI; } },
      bar:async()=>{ const B=ROOMS.off.bar; if(!B)return; await ROOMS.goIn('bar'); const p=U.trap; if(p)UI.goTo(p[0],p[1],B.spawn[2],p[2]); }}});
  CAVERNS.hooks.push((C,G,m)=>{ '@caverns'; if(C.id!=='smuggle')return; const wood=L(0x5a3e24);
    for(const [x,y,s] of [[o(1630),-75,1],[o(1632),-75.2,.8],[o(1646),-69,1],[o(1649),-69,.9],[o(1651),-75,1.1]]){ bx(G,m,x,y,x+s,y+s*.8,0,s,wood); sol(m,x,y,x+s,y+s*.8,s); }
    for(let i=0;i<6;i++)bx(G,m,o(1659),-72.4,o(1659.3),-71.6,i*.45,i*.45+.08,wood);   // the ladder's rungs
    const ch=bx(G,m,o(1641),-75.6,o(1642.4),-74.6,0,.8,L(0x3a2a1a)); bx(G,m,o(1641),-75.6,o(1642.4),-74.6,.8,.9,L(0x6a6a6a));
    thing(m,"THE SMUGGLERS' CACHE",ch,()=>{ const k='smugcache'; if(!INV.ready(k))return say('NOTHING LEFT TONIGHT. THE SMUGGLERS RESTOCK IT BY TOMORROW.','#c8a090'); INV.mark(k);
      const c=30+Math.floor(Math.random()*41); INV.cash+=c; let t='YOU PRY THE CACHE OPEN: $'+c+' IN OLD COINS';
      if(FORAGE.use('gem',0,80)){ const n=1+(Math.random()<.3?1:0); FORAGE.give('gold_nugget',n); t+=', AND '+(n>1?'TWO GOLD NUGGETS':'A GOLD NUGGET')+' YOUR EYE PICKS OUT OF THE GRIT'; }
      if(!U.ext){ U.ext=1; keep(); FORAGE.give('extractor',1); t+='. UNDER IT ALL, AN OLD SONIC EXTRACTOR'; } say(t+'.','#f2c14e'); SFX.play('clunk',{vol:.5}); FORAGE.draw(); },1.4,1); });
  // the grate on the bed: built once the wreck is, beside it
  const grate=()=>{ const MWr=T/.84, [wx,wz]=WRECK.at; let at=null; const RB=RIVER.box, inB=(x,z)=>x>Math.min(RB.x0,RB.x1)+4*T&&x<Math.max(RB.x0,RB.x1)-4*T&&z>Math.min(RB.z0,RB.z1)+4*T&&z<Math.max(RB.z0,RB.z1)-4*T;
    for(const [a,b] of [[30,0],[-30,0],[24,8],[-24,-8],[0,10],[0,-10]]){ const x=wx+a*MWr, z=wz+b*MWr; if(inB(x,z)&&RIVER.depthAt(x,z)>15){ at=[x,z]; break; } }
    if(!at)at=[wx+12*MWr,wz]; const [x,z]=at, y=RIVER.box.lv-RIVER.depthAt(x,z)*MWr, g=new THREE.Group(), iron=L(0x3a3632); g.name='smuggle-grate';
    { const h=new THREE.Mesh(new THREE.PlaneGeometry(1.6*T,1.6*T).rotateX(-Math.PI/2),B(0x000000)); h.position.y=.02*T; g.add(h); }
    for(let i=0;i<6;i++){ const b=new THREE.Mesh(new THREE.BoxGeometry(.08*T,.1*T,1.8*T),iron); b.position.set((i-2.5)*.32*T,.08*T,0); g.add(b); } for(const s of [-1,1]){ const b=new THREE.Mesh(new THREE.BoxGeometry(1.8*T,.12*T,.1*T),iron); b.position.set(0,.08*T,s*.9*T); g.add(b); }
    g.position.set(x,y,z); scene.add(g); GT.at=at; GT.g=g;
    UI.thing({name:"A RUSTED GRATE IN THE RIVERBED",obj:g,reach:1.8*T,near:3*T,tall:1*T,act:()=>{ if(!(RIVER.swim))return say('SWIM DOWN TO IT.','#9fd8ff');
      if(U.smug)return smug.go(1,'river'); if(VIT.sta<.2)return say('YOU ARE TOO WINDED TO HEAVE AT IT. REST A MOMENT.','#c8a090'); VIT.spend(.2);
      const s=FORAGE.ST.str+(FORAGE.S.fx.str?25:0); if(s>=45||Math.random()<(s-15)/60){ U.smug=1; keep(); SFX.play('creak',{vol:.7,pitch:.6}); say('YOU HEAVE. THE RUSTED GRATE GROANS AND SWINGS UP: A TUNNEL RUNS OFF UNDER THE CITY. (DOUBLE-CLICK TO GO IN.)','#9fd8ff'); }
      else say('YOU HEAVE AT THE GRATE. IT SHIFTS, BUT WILL NOT GIVE. MORE STRENGTH (OR AN OXHORN MUSHROOM) WOULD DO IT.','#c8a090'); }}); GT.done=true; };
  // the bar's end: a trapdoor behind the counter, bolted from below till you come up through it
  LOUNGE.uses.push((K,F)=>{ K.box(.7,4.4,1.5,5.2,0,.03,0x2a1c12); K.cyl(1.1,4.8,.06,.03,.05,0x6a6a6a); const p=F.pw(1.6,4.8); U.trap=[p[0],p[1],F.hd(1,0)];
    K.use("A TRAPDOOR IN THE FLOOR",1.1,4.8,.9,.6,()=>{ if(!U.smug)return say('A TRAPDOOR, BOLTED FROM BELOW.','#c8c2b0');
      FADE.run('DOWN THE LADDER',async()=>{ ROOMS.goOut('bar'); await smug.go(1,'bar'); },{hold:100}); },1.4); });

  SYS.add('life',dt=>{ if(SHARED.LVL==='down'){ frTick(dt); grTick(dt); apTick(dt); if(tomb.built&&tomb.inside(pos.x,pos.z))knTick(dt); } else conf=0;
    if(!GT.done){ if(WRECK.built&&WRECK.at&&RIVER.box&&RIVER.depthAt)grate(); } else if(GT.g)GT.g.visible=Math.hypot(pos.x-GT.at[0],pos.z-GT.at[1])<140*T; },'147d-under');
  window.UNDERDBG=()=>({conf:+conf.toFixed(2),sees:sees(),learn:Object.keys(U.learn),smug:!!U.smug,blade:!!U.blade,ext:!!U.ext,grate:GT.at&&GT.at.map(v=>+(v/T).toFixed(1)),trap:!!U.trap,knight:{st:KN.st,hp:KN.hp},fall:fall&&+fall.t.toFixed(2),built:{fairyring:fring.built,grotto:grotto.built,apothecary:apoth.built,tomb:tomb.built,smuggle:smug.built}}); }
