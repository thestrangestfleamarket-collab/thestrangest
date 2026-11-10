// THE FISHING: FISHING and BOAT let the player fish the river and the lakes with a rod (bait, cast, bite, fight, land) and row the river.
import {SHARED, THREE} from './003-shx.js';
import {BOAT, BOOKS, CLOCK, FORAGE, INSPECT, INV, ITEMS, LEVELS, MOTION, ONLINE, pos, SFX, st, UI, VIT, VLOOK, W3, WIELD, WORTH} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {FIX, MAPG, MODS, SOL, SYS, TILE, ZU} from './006-map-pre.js';
import {RARITY} from './013a-rarity.js';
import {FOUNT} from './060a-fount.js';
import {RIVER} from './066-river.js';
import {KIT} from './068-kit.js';
import {GEMS} from './101-gems.js';
import {FISHES} from './141f-fishes.js';
import {ANCHORS} from './141fb-anchors.js';
const FISHING={reeling:false,auto:false,force:null,mode:false,waters:[]}; Object.assign(BOAT,{on:false}); window.FISHING=FISHING; window.BOAT=BOAT;
// the rod is held through WIELD (146a): its blank bends with the line's pull; the cast and the fight drive the arm
{ const T=TILE, Y=v=>v*T/.84, V3=THREE.Vector3, A=.95;
  const rod={name:'FISHING ROD',hint:'CLICK THE WATER TO CAST, OR F BY THE WATER FOR FISHING MODE. CLICK TO STRIKE A BITE, HOLD TO REEL.',
    make:()=>{ '@later'; const g=new THREE.Group(), L=Y(2.1), N=8, dir=new V3(0,Math.cos(A),Math.sin(A)), side=new V3(0,-Math.sin(A),Math.cos(A)), lam=c=>new THREE.MeshLambertMaterial({color:c});
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
    use:()=>{ if(FISHING.click&&!FISHING.mode)FISHING.click(); } };
  (WIELD.pend=WIELD.pend||[]).push(['rod',rod]); if(WIELD.kind)WIELD.kind('rod',rod);
  addEventListener('pointerup',()=>{ FISHING.reeling=false; }); addEventListener('blur',()=>{ FISHING.reeling=false; }); }
// the fishing guide: a tab in your pack, read from the fish's own habits in the item model (so the item editor keeps it true) and your catch
FISHING.NAMES={x_sunfish:'SUNFISH',x_perch:'WHITE PERCH',x_tomcod:'ATLANTIC TOMCOD',x_crab:'BLUE CRAB',x_eel:'AMERICAN EEL',x_catfish:'CHANNEL CATFISH',x_flounder:'SUMMER FLOUNDER',x_shad:'AMERICAN SHAD',x_bluefish:'BLUEFISH',x_bass:'STRIPED BASS',x_sturgeon:'ATLANTIC STURGEON',
  x_bluegill:'BLUEGILL',x_yperch:'YELLOW PERCH',x_trout:'RAINBOW TROUT',x_carp:'CARP',x_lbass:'LARGEMOUTH BASS',x_pike:'NORTHERN PIKE'};
FISHING.EXTRA=[]; FISHING.LAND=[];   // a set piece's own bites ({x,z,w,bait,h} -> {id: its share against the rest}) and what it does with a landed catch (id, kg)
FISHING.guide=()=>{ const P=FORAGE.PACK; if(!P)return; if(!P.open)P.toggle('fishing'); else { P.tab='fishing'; P.draw(); } };
FORAGE.ACT.fguide=()=>FISHING.guide();
FORAGE.HELP.push('FISHING: a rod and bait from FISHING & SCUBA on the Hudson row; F by the water to fish. The FISHING tab in your pack (I) is the whole guide.');
FORAGE.BOOK.push({id:'fish',title:'FISH',rows:()=>{ const kg=(FORAGE.S&&FORAGE.S.fishkg)||{}; return Object.keys(FISHING.NAMES).map(id=>[FISHING.NAMES[id],!!kg[id],kg[id]?'BEST '+kg[id][1]+' KG':'',(+ITEMS.prop(id,'value')||0)>=40]); },foot:'The FISHING tab tells where, when and on what each one bites.'});
FORAGE.TABS.push({id:'fishing',draw:()=>{ '@later'; const IP=(id,k)=>ITEMS.prop(id,k), kg=(FORAGE.S&&FORAGE.S.fishkg)||{}, h=CLOCK.h??12, now=h>=7&&h<17?'day':h>=21||h<5?'night':'dusk';
  const H=t=>`<div style="color:#f2c14e;margin:10px 0 4px">${t}</div>`, R=(a,b)=>`<div style="padding:3px 0;border-bottom:1px solid #22252f;line-height:1.45;font-size:10px"><span style="color:#8fe3d6">${a}</span> · ${b}</div>`;
  const ids=Object.keys(FISHING.NAMES), got=ids.filter(id=>kg[id]).length, sk=Math.round(FORAGE.sk?FORAGE.sk('fish'):0);
  let o=`<div style="margin-bottom:4px">THE FISHING GUIDE · ${got} OF ${ids.length} CAUGHT · YOUR FISHING ${sk} · NOW: ${now.toUpperCase()}</div>`;
  o+=H('1. GEAR')+R('FISHING & SCUBA','The Fisherman in Waders, in his shop on the Hudson row: rods, reels, lures, bait, crab pots, coolers, and a tank and goggles for under the water. He buys your catch and teaches FISHING. The shed by the long pier rents a ROWBOAT, $5 a trip.')+R('TACKLE','Better rods (CARBON, SURF) cast further on stronger line; FAST and PRO reels reel faster; RUBBER WORM and SPOON lures are not used up.')+R('COOLERS','You carry 5 fish in hand; a cooler holds 15, 40 or 100 more.')+R('CRAB POTS','$25, up to 3. Face the water and press P in fishing mode; come back later and double-click its buoy.')+'';
  o+=H('2. WHERE')+R('THE HUDSON','Any open river water; best off the long pier. It gets deeper the further out you cast.')+R('THE LAKES','The big lake, the stream and THE LAKE in the park: their own fish.')+'';
  o+=H('3. FISH')+R('QUICK','Hold the rod, click open water (1.5 to 16 tiles away). Click again to reel in.')+R('FISHING MODE','By the water press F. Hold SPACE for power (the ring shows where it lands), let go to cast. B changes bait, V first person, drag looks round, the wheel zooms, ESC leaves.')+'';
  o+=H('4. THE BITE')+R('BAIT','The hook baits itself when you cast; pick WORM or CUT BAIT yourself with B or ON THE HOOK in your pack. A bare hook catches nothing.')+R('NIBBLE','The float twitches: get ready.')+R('BITE','The float goes under: STRIKE (SPACE or click) within 1.4 s, sooner is surer. Too late and the bait is gone.')+R('NOTHING?','After 25 s with no bite try another spot, bait or hour. A spot rests 40 s after a bite.')+'';
  o+=H('5. THE FIGHT')+R('REEL','Hold SPACE or the mouse to reel, let go to give line.')+R('PULL','The fish runs left or right: pull the rod against it (A or D) and it tires fast; with it, the line takes the strain.')+R('DRAG','W and S set the drag, 1 to 5: low lets it take line instead of snapping, high brings it in faster.')+R('STRAIN','Reeling while it surges (a splash) builds strain: too much and the line snaps.')+R('THE WORD','LOOSE, GOOD or EASE by the line: ease off while it reads EASE, or the strain snaps it.')+R('ITS MOODS','It runs, it rests (reel now, or it gets its breath back) or it shakes its head (ease off).')+R('SLACK','Three seconds without pull and the hook slips.')+R('LAND','It tires; bring it in, then TAKE OFF THE HOOK.')+'';
  o+=H('6. WHAT BITES')+`<div style="color:#9b9584;margin-bottom:4px;line-height:1.45">The water, the depth under the float, the hour (DAY 7-17, DUSK, NIGHT 21-5) and the bait. The right bait and its hour make a fish far likelier. Your FISHING skill brings bites sooner and sets the hook on harder fighters.</div>`;
  const WN={river:'THE HUDSON',lake:'THE PARK LAKES',ice:'UNDER THE ICE (THE BIG LAKE, FROZEN)'}, rest=ids.filter(i=>!WN[IP(i,'water')]);
  for(const w of [...Object.keys(WN),...(rest.length?['']:[])]){ o+=`<div style="margin:6px 0 2px">${w?WN[w]:'ONE OF A KIND'}</div><table style="border-collapse:collapse;width:100%;font-size:9px"><tr style="color:#7d7a70"><td>FISH</td><td>DEPTH</td><td>HOUR</td><td>BAIT</td><td>FIGHT</td><td style="text-align:right">$</td><td style="text-align:right">BEST</td></tr>`;
    for(const id of (w?ids.filter(i=>IP(i,'water')===w):rest).sort((a,b)=>(IP(a,'depth')||0)-(IP(b,'depth')||0)||(IP(a,'fight')||0)-(IP(b,'fight')||0))){ const c=kg[id], bt=IP(id,'bites')||'any', on=bt==='any'||bt===now;
      o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:3px 4px 3px 0">${FISHING.NAMES[id]}</td><td style="padding-right:4px">${w==='river'?(IP(id,'depth')||0)+' M':'-'}</td><td style="color:${on?'#9fe07f':'#9b9584'}">${bt.toUpperCase()}</td><td>${IP(id,'bait')==='cut'?'CUT':'WORM'}</td><td>${'|'.repeat(Math.max(1,Math.round((IP(id,'fight')||1)/2)))}</td><td style="text-align:right">${IP(id,'value')??''}</td><td style="text-align:right;color:${c?'#b8f0a0':'#5d5a52'}">${c?c[1]+' KG':'-'}</td></tr>`; }
    o+='</table>'; }
  o+=`<div style="color:#9b9584;margin-top:4px;line-height:1.45">A baited hook in the Hudson can bring up an old boot, a tin can, a message in a bottle, a water-stained novel or, rarely, a SUNKEN CHEST (a gem and $10-40).</div>`;
  o+=H('7. THE ROWBOAT')+'<div style="line-height:1.45">Rent it at the stand, row with W A S D, fish from it for the deep fish, STEP ASHORE at a ladder or pier.</div>';
  o+=H('8. COOK AND SELL')+R('FISH FRY','2 white perch: fills a third')+R('SMOKED EEL','2 eels: fills two fifths, strong 2 min')+R('GRILLED STRIPED BASS','1 striped bass: fills half, mends you a minute')+R('FISH CHOWDER','1 catfish, 2 button mushrooms: fills more than half')+R('STURGEON STEAK','1 sturgeon: fills most of you, quick 3 min')+R('SELL','At FISHING & SCUBA, the $ above. Cook by a flame; raw fish is risky.')+'';
  return o; }});
// what a catch looks like in the inspect window: the fish's own shape once the river is built (FISHING.look), the junk and the bait in simple shapes
INSPECT.kinds.push({is:id=>/^x_/.test(id)||id==='chest'||/^bait/.test(id),make:id=>{ '@later'; const P=INSPECT.part;
    if(id==='x_boot'){ const g=new THREE.Group(); g.add(P('box',0x3a2e22,0,.06,0,.09,.12,.1),P('box',0x3a2e22,0,.02,.07,.09,.04,.16),P('box',0x1e1812,0,0,.04,.095,.012,.24)); return g; }
    if(id==='x_can')return INSPECT.shape('jar',0x9aa0a4,0x8a9094); if(id==='x_note'){ const g=INSPECT.shape('bottle',0x9ad0b0); g.add(P('cyl',0xf2ead6,0,.12,0,.022,.14,.022)); return g; }
    if(id==='chest')return KIT.piece('chest',.36);
    if(/^bait/.test(id))return id==='bait_cut'?INSPECT.shape('lump',0xb07a6a):INSPECT.shape('jar',0x6a4a2a,0x3a3a3a);
    return FISHING.look&&FISHING.look(id)||(()=>{ const g=new THREE.Group(); g.add(P('ball',0x8a9aa0,0,0,0,.2,.07,.035,0,0,0,{flat:1}),P('cone',0x7a8a90,-.24,0,0,.07,.1,.02,0,Math.PI/2)); return g; })(); }});
// the rowboat in the vehicle editor: a copy of the one on the river once the Hudson is built
VLOOK.kind('rowboat',{name:'THE ROWBOAT',grp:'BOATS',make:()=>{ const b=BOAT.G; if(!b)return null; const c=b.clone(); c.visible=true; c.position.set(0,0,0); c.rotation.set(0,0,0); return VLOOK.dress('rowboat',c); }});
// fishing starts with the game (THE LAKE needs no river); the Hudson's own parts (the stand, the rowboat, clicking its water) are added when it is built
const fishInit=()=>{ if(FISHING.at)return; const T=TILE, RB={get lv(){ return RIVER.box?RIVER.box.lv:0; },get x0(){ return RIVER.box.x0; },get x1(){ return RIVER.box.x1; },get z0(){ return RIVER.box.z0; },get z1(){ return RIVER.box.z1; }}, WU=T/.84, cl=(v,a,b)=>v<a?a:v>b?b:v, IP=(id,k)=>ITEMS.prop(id,k);
  const NAMES=FISHING.NAMES;
  const SPECIES=Object.keys(NAMES);   // their habits are the item model's: LIVES IN, DEPTH, BITES, BAIT, FIGHT, COMMON, WEIGHT, VALUE (data/items.json, the item editor)
  const JUNK=[['x_boot','OLD BOOT',.6,1],['x_can','TIN CAN',.5,1],['x_note','MESSAGE IN A BOTTLE',.05,5],['chest','SUNKEN CHEST',.05,0]];
  FORAGE.add({names:Object.assign({},NAMES,Object.fromEntries(JUNK.map(j=>[j[0],j[1]])),{rod:'FISHING ROD',bait:'WORMS',bait_cut:'CUT BAIT (BUNKER)',rod_carbon:'CARBON ROD',rod_surf:'SURF ROD',reel_fast:'FAST REEL',reel_pro:'PRO REEL',lure_worm:'RUBBER WORM LURE',lure_spoon:'SPOON LURE',cooler_s:'SMALL COOLER',cooler_m:'COOLER',cooler_l:'BIG COOLER',crabpot:'CRAB POT'}),raw:Object.fromEntries(SPECIES.map(id=>[id,[Math.min(.2,.05+.03*(IP(id,'weight')||1)),.3]])),
    prices:{f_fishfry:12,f_grillbass:34,f_chowder:30,f_smokeeel:22,f_sturgeon:90},
    recipes:[['f_fishfry','FISH FRY','cooking',[10,50],{x_perch:2},'fills a third'],['f_smokeeel','SMOKED EEL','cooking',[25,70],{x_eel:2},'fills two fifths, strong 2 min'],
      ['f_grillbass','GRILLED STRIPED BASS','cooking',[30,75],{x_bass:1},'fills half, mends you a minute'],['f_chowder','FISH CHOWDER','cooking',[40,85],{x_catfish:1,m_button:2},'fills more than half, some health'],
      ['f_sturgeon','STURGEON STEAK','cooking',[65,110],{x_sturgeon:1},'fills most of you, quick on your feet 3 min']],
    does:{f_fishfry:()=>FORAGE.feed(.33),f_smokeeel:()=>{ FORAGE.feed(.4); FORAGE.buff('str',120); },f_grillbass:()=>{ FORAGE.feed(.5); FORAGE.buff('regen',60); },
      f_chowder:()=>{ FORAGE.feed(.6); VIT.heal(.3); },f_sturgeon:()=>{ FORAGE.feed(.8); FORAGE.buff('swift',180); }}});
  const say=SAY, PRICE=Object.fromEntries([...SPECIES.map(id=>[id,IP(id,'value')||1]),...JUNK.map(j=>[j[0],j[3]])]);
  // the tackle you own: the best CAST (m), LINE (strength) and REEL (speed) of what is in your pack; fish in hand up to 5 and what your coolers KEEP
  const BAITIDS=['bait','bait_cut','lure_worm','lure_spoon'], G0={cast:12,line:1,reel:1}, GC={t:-1e9,v:G0};
  FISHING.gear=()=>{ const now=performance.now(); if(now-GC.t>500){ GC.t=now; const v=Object.assign({},G0); for(const id of ITEMS.ids())if(FORAGE.has(id))for(const k in v){ const x=+IP(id,k)||0; if(x>v[k])v[k]=x; } GC.v=v; } return GC.v; };
  FISHING.room=()=>{ let n=5; for(const id of ITEMS.ids())if(IP(id,'keeps')==='fish')n+=(+IP(id,'holds')||0)*(FORAGE.has(id)||0); return n; };
  FISHING.held=()=>SPECIES.reduce((a,id)=>a+(FORAGE.has(id)||0),0);
  FISHING.drag=3; FISHING.side=0;
  const stand=()=>{ const PX=RIVER.fpier, SX=PX+2.6*T, SZ=RB.z1+1.55*T;
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
    UI.thing({name:'BOATS (A ROWBOAT, $5 A TRIP)',obj:hb,reach:1.4*T,near:2.2*T,tall:Y(2.6),can:()=>INV.cash>=5?true:'YOU NEED $5 FOR A TRIP',act:()=>STAND.open()}); }
    const pick0=RIVER.pick; RIVER.pick=(ray,p)=>{ '@later'; const pl=new THREE.Plane(new THREE.Vector3(0,1,0),-RB.lv), hp=new THREE.Vector3(); if(FORAGE.has('rod')&&!RIVER.swim&&!S_&&ray.intersectPlane(pl,hp)&&FISHING.at(hp.x,hp.z)){ const d=Math.hypot(hp.x-p.x,hp.z-p.z); if(d<16*T&&d>1.5*T){ FISHING.cast(hp.x,hp.z); return true; } }
      return pick0(ray,p); }; };
  // (no bait stand on the promenade: bait is sold at FISHING & SCUBA, owner 7 Nov 2026)
  const STAND={}; FISHING.STAND=STAND; const B='style="margin:0 0 0 4px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer"';
  const sp=document.createElement('div'); sp.id='fishp'; sp.hidden=true; sp.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);width:min(460px,92vw);max-height:80vh;overflow:auto;z-index:21;padding:14px 16px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  document.body.appendChild(sp); sp.addEventListener('keydown',e=>e.stopPropagation());
  const WARES=[['bait','WORMS · A DOZEN',3,12],['bait_cut','CUT BAIT (BUNKER) · SIX',4,6]];
  const TACKLE=[['rod_carbon','CARBON ROD · CASTS 16 M · LINE 1.3',1],['rod_surf','SURF ROD · CASTS 22 M · LINE 1.6',1],['reel_fast','FAST REEL · REELS 1.35X',1],['reel_pro','PRO REEL · REELS 1.7X',1],
    ['lure_worm','RUBBER WORM LURE · NOT USED UP',0],['lure_spoon','SPOON LURE · NOT USED UP',0],['cooler_s','SMALL COOLER · 15 MORE FISH',0],['cooler_m','COOLER · 40 MORE FISH',0],['cooler_l','BIG COOLER · 100 MORE FISH',0],['crabpot','CRAB POT · UP TO 3',0]];
  const potsOut=()=>{ try{ return JSON.parse(OWNED.get('pots')||'[]').length; }catch(e){ return 0; } };
  STAND.draw=()=>{ '@later'; if(sp.hidden)return; const ids=Object.keys(INV.items).filter(id=>INV.items[id]>0&&PRICE[id]!=null).sort();
    let o=`<h3 style="margin:0 0 4px;color:#f2c14e;font:12px Silkscreen,monospace">BOATS</h3><button ${B} data-guide="1" style="float:right">FISHING GUIDE</button><div style="color:#9b9584;margin-bottom:8px">Self serve · pay in the box · buys your catch</div><div style="margin-bottom:8px">YOU HAVE <b style="color:#f2c14e">$${Math.round(INV.cash)}</b> · FISHING ${FORAGE.sk('fish').toFixed(1)}</div><table style="border-collapse:collapse;width:100%">`;
    if(0)o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">FISHING ROD</td><td style="text-align:right;padding:4px 6px">$15</td><td style="text-align:right">${FORAGE.has('rod')?'YOURS':`<button ${B} data-buy="rod">BUY</button>`}</td></tr>`;
    for(const [id,nm,c,n] of [])o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">${nm}</td><td style="text-align:right;padding:4px 6px">$${c}</td><td style="text-align:right">x${FORAGE.has(id)} <button ${B} data-bait="${id}">BUY</button></td></tr>`;
    for(const [id,nm,one] of []){ const v=IP(id,'value')||0, n=FORAGE.has(id)||0; o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">${nm}</td><td style="text-align:right;padding:4px 6px">$${v}</td><td style="text-align:right">${one&&n?'YOURS':`${n?'x'+n+' ':''}<button ${B} data-tack="${id}">BUY</button>`}</td></tr>`; }
    o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">ROWBOAT · A TRIP</td><td style="text-align:right;padding:4px 6px">$5</td><td style="text-align:right">${BOAT.on?'OUT':`<button ${B} data-boat="1">RENT</button>`}</td></tr>`+FORAGE.trainRows(['fish'])+`</table>`;
    if(0&&ids.length)o+=`<div style="margin:10px 0 4px;color:#9b9584">YOUR CATCH</div><table style="border-collapse:collapse;width:100%">`;
    for(const id of ids){ const n=INV.items[id], v=WORTH.sell(id,1,PRICE[id]), va=WORTH.sell(id,n,PRICE[id]); o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">${FORAGE.NM[id]}</td><td style="text-align:right;padding:4px 6px">$${v}</td><td style="text-align:right">x${n}</td><td style="text-align:right;white-space:nowrap"><button ${B} data-sell="${id}">SELL</button>${n>1?`<button ${B} data-sell="${id}" data-n="all">ALL $${va}</button>`:''}</td></tr>`; }
    if(ids.length)o+=`</table>`;
    const x=sp.querySelector(':scope>.pX'); sp.innerHTML=o; if(x)sp.appendChild(x); };
  sp.addEventListener('click',e=>{ '@later'; const b=e.target.closest('button'); if(!b||b.classList.contains('pX'))return; const d=b.dataset;
    if(d.guide)return FISHING.guide();
    if(d.train){ FORAGE.train(d.train,+d.cap); STAND.draw(); return; } if(d.buy==='rod'){ if(INV.cash<15)say('YOU CANNOT AFFORD THAT.','#c8a090'); else { INV.cash-=15; FORAGE.give('rod'); say('YOU TAKE A ROD AND DROP $15 IN THE BOX.'); } }
    if(d.bait){ const w=WARES.find(x=>x[0]===d.bait); if(INV.cash<w[2])say('YOU CANNOT AFFORD THAT.','#c8a090'); else { INV.cash-=w[2]; FORAGE.give(w[0],w[3]); say(`YOU TAKE ${w[1]} AND DROP $${w[2]} IN THE BOX.`); } }
    if(d.tack){ const id=d.tack, v=IP(id,'value')||0, one=TACKLE.find(x=>x[0]===id)[2];
      if(one&&!FORAGE.has('rod'))say('YOU NEED A ROD FIRST.','#c8a090'); else if(id==='crabpot'&&(FORAGE.has('crabpot')||0)+potsOut()>=3)say('THREE POTS IS THE LIMIT.','#c8a090'); else if(INV.cash<v)say('YOU CANNOT AFFORD THAT.','#c8a090');
      else { INV.cash-=v; FORAGE.give(id); say(`YOU TAKE THE ${FORAGE.NM[id]} AND DROP $${v} IN THE BOX.`); } }
    if(d.boat){ if(INV.cash<5)say('YOU CANNOT AFFORD THAT.','#c8a090'); else { INV.cash-=5; sp.hidden=true; BOAT.launch(); } }
    if(d.sell){ const n=d.n==='all'?FORAGE.has(d.sell):1, v=WORTH.sell(d.sell,n,PRICE[d.sell]); FORAGE.take(d.sell,n); INV.cash+=v; say(`YOU SELL ${n} ${FORAGE.NM[d.sell]} FOR $${v}.`,'#f2c14e'); SFX.play('clunk',{vol:.5}); }
    STAND.draw(); FORAGE.draw(); });
  STAND.open=()=>{ sp.hidden=false; STAND.draw(); };
  const boat=new THREE.Group(); boat.visible=false; scene.add(boat); const BW=1.1*T, BLn=2.6*T, Y=v=>v*T/.84;
  { const mat=new THREE.MeshLambertMaterial({color:0xe8e2d2}), trim=new THREE.MeshLambertMaterial({color:0xa83a2a}), wood=new THREE.MeshLambertMaterial({color:0x7a5634}), add=(m,x,y,z,w,h,d)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); o.castShadow=true; boat.add(o); return o; };
    add(mat,0,Y(.05),0,BW*.8,Y(.1),BLn*.86); for(const o of [-1,1]){ add(mat,o*BW*.45,Y(.25),0,.08*T,Y(.45),BLn*.86); add(trim,o*BW*.45,Y(.48),0,.1*T,Y(.05),BLn*.86); }
    add(mat,0,Y(.28),BLn*.45,BW*.55,Y(.5),.1*T); add(mat,0,Y(.25),-BLn*.45,BW*.85,Y(.45),.1*T); add(wood,0,Y(.35),.1*T,BW*.82,Y(.05),.3*T); add(wood,0,Y(.3),-BLn*.32,BW*.7,Y(.05),.3*T);
    BOAT.oars=[-1,1].map(o=>{ const p=new THREE.Group(); p.name=o<0?'OAR LEFT':'OAR RIGHT'; p.position.set(o*BW*.48,Y(.5),.1*T); const a=new THREE.Mesh(new THREE.BoxGeometry(1.5*T,.05*T,.05*T),wood); a.position.x=o*.6*T; const bl=new THREE.Mesh(new THREE.BoxGeometry(.4*T,.02*T,.16*T),wood); bl.position.x=o*1.3*T; p.add(a,bl); boat.add(p); return p; }); }
  BOAT.G=VLOOK.dress('rowboat',boat);
  BOAT.x=0; BOAT.z=0; BOAT.hd=Math.PI; BOAT.v=0; BOAT.py=0; let row=0;
  const nearDeck=(x,z,m)=>{ for(const d of RIVER.decks)for(const r of d.r)if(x>r[0]-m&&x<r[2]+m&&z>r[1]-m&&z<r[3]+m)return r; return null; };
  const atShore=()=>{ const L=RIVER.ladders.find(x=>Math.abs(x-BOAT.x)<1.3*T&&BOAT.z>RB.z1-1.6*T); if(L!=null)return {x:L,z:RB.z1+.7*T}; const r=nearDeck(BOAT.x,BOAT.z,1.4*T); if(r)return {x:cl(BOAT.x,r[0]+.4*T,r[2]-.4*T),z:cl(BOAT.z,r[1]+.4*T,r[3]-.4*T)}; return null; };
  BOAT.launch=()=>{ BOAT.x=RIVER.fpier+(RIVER.fpw||1.8*T)+1.6*T; BOAT.z=RB.z1-1.8*T; BOAT.hd=Math.PI; BOAT.v=0; BOAT.on=true; boat.visible=true; SHARED.target=null; say('YOU STEP INTO THE ROWBOAT. ROW WITH W A S D.'); HUD.hidden=false; BOAT.place(); };
  BOAT.ashore=()=>{ const s=atShore(); if(!s)return say('ROW TO A LADDER OR A PIER FIRST.','#c8a090'); BOAT.on=false; boat.visible=false; st.sit=null; pos.x=s.x; pos.z=s.z; SHARED.py=0; HUD.hidden=true; FISHING.reel(); say('YOU TIE UP THE BOAT AND CLIMB OUT.'); };
  BOAT.steer=(dt,mx,mz)=>{ '@later'; const m=Math.hypot(mx,mz); if(m>0){ let dh=Math.atan2(mx,mz)-BOAT.hd; dh=Math.atan2(Math.sin(dh),Math.cos(dh)); BOAT.hd+=cl(dh,-1.7*dt,1.7*dt); if(Math.abs(dh)<1.2)BOAT.v=Math.min(3.2*T,BOAT.v+3.6*T*dt); row+=dt*5; }
    else BOAT.v*=Math.exp(-dt*1.1); if(BOAT.v<.03*T&&!m)BOAT.v=0;
    const o={x:BOAT.x+Math.sin(BOAT.hd)*BOAT.v*dt,z:BOAT.z+Math.cos(BOAT.hd)*BOAT.v*dt}; o.x=cl(o.x,RB.x0+1.5*T,RB.x1-1.5*T); o.z=cl(o.z,RB.z0+1*T,RB.z1-.9*T);
    if(nearDeck(o.x,o.z,.7*T)){ if(!nearDeck(o.x,BOAT.z,.7*T))o.z=BOAT.z; else if(!nearDeck(BOAT.x,o.z,.7*T))o.x=BOAT.x; else { o.x=BOAT.x; o.z=BOAT.z; } }
    if(Math.hypot(o.x-BOAT.x,o.z-BOAT.z)<.001)BOAT.v=Math.min(BOAT.v,.5*T); BOAT.x=o.x; BOAT.z=o.z; BOAT.place(); };
  BOAT.place=()=>{ '@later'; const h=RIVER.hAt(BOAT.x,BOAT.z); BOAT.py=RB.lv+h+Y(.12); boat.position.set(BOAT.x,RB.lv+h-Y(.05),BOAT.z); boat.rotation.y=BOAT.hd;
    const a=Math.sin(row)*.6; BOAT.oars[0].rotation.y=-a; BOAT.oars[1].rotation.y=a; BOAT.oars[0].rotation.z=.2+.15*Math.cos(row); BOAT.oars[1].rotation.z=-.2-.15*Math.cos(row); };
  BOAT.carry=(st,pos)=>{ pos.x=BOAT.x; pos.z=BOAT.z; st.sit={z:Math.max(2,Y(.3)/(ZU*W3.SZ*(W3.BH||1))),hold:1}; if(RIVER.swim)RIVER.swim=false; if(st.water)st.water.in=false; };   // (sat on the thwart, hands free: the rod held, cast and reeled as on the pier)
  const HUD=document.createElement('div'); HUD.id='boathud'; HUD.hidden=true; { const c=document.createElement('style'); c.textContent='#boathud[hidden],#fishhud[hidden],#minehud[hidden],#fjour:empty{display:none!important}'; document.head.appendChild(c); } HUD.style.cssText='position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:7;font:11px Silkscreen,monospace;color:#e8e2cc;background:#0b0d13e0;border:2px solid #3a3f4e;padding:6px 10px;display:flex;gap:10px;align-items:center;zoom:var(--uiz,1)';
  HUD.innerHTML='<span>ROWBOAT · W A S D</span><button style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 8px;cursor:pointer">STEP ASHORE</button>'; document.body.appendChild(HUD);
  HUD.querySelector('button').onclick=()=>BOAT.ashore(); SYS.every(()=>{ if(BOAT.on)HUD.querySelector('button').style.opacity=atShore()?1:.45; },400,'142-fishing ashore');

  /* ---------- the catch: who bites where, when and on what (the odds), and how hard they fight ---------- */
  const S=FORAGE.S; S.fishkg=S.fishkg||{};
  const period=h=>h>=7&&h<17?'day':h>=21||h<5?'night':'dusk';
  const lakeAt=(x,z)=>{ const b=FOUNT.bedAt&&FOUNT.bedAt(x,z); if(b!=null)return FOUNT.LV; const h=MODS.hill?MODS.hill(x,z):0; return h<-.35*T?-.25*T:null; };   // still water: the big lake, the stream and THE LAKE
  FISHING.at=(x,z)=>{ for(const f of FISHING.waters){ const w=f(x,z); if(w!==undefined)return w; } if(RIVER.over(x,z)&&!RIVER.onPier(x,z,.15*T))return {kind:'river',lv:RB.lv,depth:RIVER.depthAt(x,z)}; const l=lakeAt(x,z); return l==null?null:{kind:'lake',lv:l,depth:2.5}; };
  const SOAK=25, K=.0022, rests=[];   // a bite's rate per second is K x the sum of the weights below; a spot just bitten rests 40 s
  FISHING.odds=(x,z,bait=S.hook,h=CLOCK.h)=>{ '@later'; const w=FISHING.at(x,z); if(!w)return null; const bk=bait?IP(bait,'bait'):null, pd=period(h), per={}; let sum=0;
    // the water's kinds by tier (RARITY): 70, 25 and 5 in a hundred shared among its common, rare and super-rare; the super-rare only once the Fisherman ranks you high enough
    const TN={c:0,r:0,s:0}, TK={common:'c',rare:'r',super:'s'}, tof=id=>TK[IP(id,'tier')]||'c', here=SPECIES.filter(id=>IP(id,'water')===w.kind&&w.depth>=(IP(id,'depth')||0)&&(tof(id)!=='s'||RARITY.open('fish'))); for(const id of here)TN[tof(id)]++;
    for(const id of here){ const b=!bk?0:IP(id,'bait')===bk?1.6:.5, bt=IP(id,'bites'), tm=bt==='any'?1:bt===pd?1.5:.3, t=tof(id), v=RARITY.ODDS[t]*10/TN[t]*b*tm*(t!=='c'?SHARED.luck||1:1); if(v>0){ per[id]=v; sum+=v; } }
    if(w.kind==='river'&&bk)for(const [id,,c] of JUNK){ per[id]=c; sum+=c; }
    for(const f of FISHING.EXTRA){ const r=f({x,z,w,bait:bk,h}); if(r)for(const id in r){ const v=sum*r[id]; per[id]=(per[id]||0)+v; sum+=v; } }
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
  const fishM=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}), hookM=fishM.clone(), hooked=new THREE.Mesh(fishGeo,hookM); hooked.visible=false; scene.add(hooked);
  const dressHook=(id,kg)=>{ const m=FISHES.model(id,kg); hooked.userData.real=!!m; if(m){ hooked.geometry=m.geometry; hooked.material=m.material; } else { hooked.geometry=fishGeo; hooked.material=hookM; } };   // the hooked fish is the one that swam up: its own model
  const FM=new Map(); FISHING.look=id=>{ '@later'; const real=FISHES.model(id,IP(id,'weight')||1); if(real){ real.scale.multiplyScalar(1/FISHES.len(id,IP(id,'weight')||1)); return real; } if(!LOOK[id])return null; let m=FM.get(id); if(!m){ m=fishM.clone(); m.color.setHex(LOOK[id][0]); FM.set(id,m); } const o=new THREE.Mesh(fishGeo,m); o.userData.shared=true; shape(o,id,1); return o; };
  const lenOf=(id,kg)=>Y(.45*Math.cbrt(kg)*(LOOK[id]?LOOK[id][1]:1)), shape=(o,id,kg)=>{ const L=LOOK[id]||[0x888888,1,1,1], l=lenOf(id,kg); o.scale.set(l,l*(L[2]||1),l*(L[3]||1)); };
  /* ---------- the hook, the cast and the fight ---------- */
  let S_=null; FISHING.state=()=>S_; FISHING.word=s=>{ const L=FISHING.gear().line; return s.ten<.18?'LOOSE':s.ten>.85*L?'EASE':'GOOD'; };
  const HUDF=document.createElement('div'); HUDF.id='fishhud'; HUDF.hidden=true; HUDF.style.cssText='position:fixed;left:50%;bottom:52px;transform:translateX(-50%);z-index:7;font:11px Silkscreen,monospace;color:#e8e2cc;background:#0b0d13e0;border:2px solid #3a3f4e;padding:6px 10px;min-width:260px;text-align:center;zoom:var(--uiz,1)'; document.body.appendChild(HUDF);
  const bar=(v,c)=>`<span style="display:inline-block;width:90px;height:8px;border:1px solid #3a3f4e;vertical-align:middle;background:linear-gradient(90deg,${c} ${Math.round(cl(v,0,1)*100)}%,#151821 0)"></span>`;
  const hud=()=>{ '@later'; const s=S_; if(!s){ HUDF.hidden=true; return; } HUDF.hidden=false; let t='';
    if(s.st==='wind'||s.st==='fly')t='CASTING...'; else if(s.st==='wait')t=s.bare?'YOUR HOOK IS BARE. CLICK TO REEL IN.':s.nib>0?'A NIBBLE...':s.t>SOAK?'NOTHING IS BITING. TRY ANOTHER SPOT, BAIT OR HOUR.':'WAITING FOR A BITE · CLICK TO REEL IN';
    else if(s.st==='bite')t='<b style="color:#f2c14e">BITE! CLICK TO STRIKE</b>';
    else if(s.st==='fight'){ const L=FISHING.gear().line, run=s.run>0?'IT RUNS RIGHT &#9654; PULL LEFT (A)':s.run<0?'&#9664; IT RUNS LEFT · PULL RIGHT (D)':'IT HOLDS STILL';
      const mood=s.mode==='rest'?'IT RESTS · REEL NOW':s.mode==='shake'?'IT SHAKES ITS HEAD · EASE OFF':run, word=FISHING.word(s), wc=word==='EASE'?'#d85a3a':word==='LOOSE'?'#e0a888':'#b8f0a0';
      t=`ON THE LINE · ${FISHING.reeling?'REELING':'HOLD THE MOUSE TO REEL'}<br><b style="color:${s.mode==='rest'?'#b8f0a0':s.mode==='shake'?'#f09070':s.run&&FISHING.side===-s.run?'#b8f0a0':'#f2c14e'}">${mood}</b> · DRAG ${FISHING.drag}<br>LINE ${bar(s.ten/(1.1*L),s.ten>.85*L?'#d85a3a':'#8fe3d6')} <b style="color:${wc}">${word}</b> FISH ${bar(s.f.s,'#b8f0a0')} ${(s.D/WU).toFixed(1)} M`; }
    else if(s.st==='land')t=`<b style="color:#b8f0a0">${(NAMES[s.f.id]||FORAGE.NM[s.f.id]||'').toString()} · ${s.f.kg.toFixed(2)} KG</b><br>CLICK TO TAKE IT OFF THE HOOK`;
    if(FISHING.mode)t=t.replace(/CLICK TO /g,'SPACE TO ').replace('HOLD THE MOUSE TO REEL','HOLD SPACE TO REEL'); HUDF.innerHTML=t; };
  const tip=new THREE.Vector3(), from=()=>{ if(WIELD.on==='rod'&&WIELD.tip.lengthSq()>0&&Math.hypot(WIELD.tip.x-pos.x,WIELD.tip.z-pos.z)<4*T)return tip.copy(WIELD.tip); return tip.set(pos.x+Math.sin(SHARED.heading)*.6*T,SHARED.py+Y(1.9),pos.z+Math.cos(SHARED.heading)*.6*T); };
  const hookOn=id=>{ if(!FORAGE.has(id))return say('YOU HAVE NO '+FORAGE.NM[id]+'.','#c8a090'); S.hook=id; FORAGE.take(id,1); FORAGE.save(); say(`YOU PUT ${id==='bait'?'A WORM':id==='bait_cut'?'A STRIP OF BUNKER':'THE '+FORAGE.NM[id]} ON THE HOOK.`); SFX.play('click',{vol:.3}); FORAGE.draw(); };
  FISHING.hookOn=hookOn;
  FISHING.reel=()=>{ if(S_&&S_.fish&&!S_.landed)FISHES.free(S_.fish); S_=null; line.visible=bob.visible=hooked.visible=false; FISHING.bendK=.03; FISHING.reeling=false; hud(); };
  FISHING.cast=(x,z)=>{ '@later'; if(!FORAGE.has('rod'))return say('YOU NEED A ROD. FISHING & SCUBA ON THE HUDSON ROW SELLS THEM.','#c8a090'); const w=FISHING.at(x,z); if(!w)return say('THAT IS NOT WATER YOU CAN FISH.','#c8a090');
    if(!S.hook){ const b=BAITIDS.find(id=>FORAGE.has(id)); if(!b)return say('YOU NEED BAIT. FISHING & SCUBA ON THE HUDSON ROW SELLS IT.','#c8a090'); hookOn(b); }
    if(!BOAT.on&&WIELD.on!=='rod')WIELD.set('rod'); if(!BOAT.on)SHARED.heading=Math.atan2(x-pos.x,z-pos.z);
    S_={st:'wind',t:0,x,z,w,ax:pos.x,az:pos.z,tx:x,tz:z,nib:0,near:-1}; if(!st.sit)MOTION.play('cast'); SFX.play('step',{vol:.25,pitch:1.8}); hud(); };
  FISHING.click=()=>{ '@later'; const s=S_;
    if(!s){ const r=WIELD.ray; if(!r)return; const ok=v=>v&&FISHING.at(v.x,v.z); let hit=null; for(const lv of [RB.lv,FOUNT.LV,-.25*T].filter(v=>v!=null)){ const h=new THREE.Vector3(); if(r.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-lv),h)&&ok(h)){ hit=h; break; } }
      if(!hit)return say('CLICK ON OPEN WATER TO CAST.','#c8a090'); let dx=hit.x-pos.x, dz=hit.z-pos.z, d=Math.hypot(dx,dz); const mx=FISHING.gear().cast*WU*1.1; if(d>mx){ hit.x=pos.x+dx/d*mx; hit.z=pos.z+dz/d*mx; } if(d<1.5*T)return say('CAST FURTHER OUT.','#c8a090'); return FISHING.cast(hit.x,hit.z); }
    if(s.st==='bite')return strike(); if(s.st==='fight'){ FISHING.reeling=true; return; } if(s.st==='land')return unhook(); if(s.st==='wait'&&s.nib){ FISHES.free(s.fish); s.nib=0; s.tb=s.t+8+Math.random()*10; s.bid=pickBite(s.o); s.fish=NAMES[s.bid]?FISHES.lure(s.bid,s.x,s.z,s.tb-s.t-.3):null; return shout('TOO EARLY! THE FISH TAKES FRIGHT AND SWIMS OFF.','#e0a888'); }
    if(s.st==='wait'||s.st==='fly'){ FISHING.reel(); say('YOU REEL IN YOUR LINE.'); } };
  const strike=()=>{ '@later'; const s=S_, id=s.f.id, fi=IP(id,'fight')||1, quick=s.t<.45?10:0; const ok=FISHING.force===id||FORAGE.use('fish',fi*5-40,fi*5+50,quick);
    if(!ok){ S.hook=Math.random()<.5||IP(S.hook,'reuse')?S.hook:null; shout(S.hook?'YOU STRIKE, BUT THE HOOK DOES NOT SET.':'YOU STRIKE TOO LATE. THE BAIT IS GONE.','#e0a888'); s.st='wait'; s.t=SOAK+1; s.bare=!S.hook; FISHES.free(s.fish); s.fish=null; return; }
    s.st='fight'; if(!st.sit)MOTION.play('pull',{loop:true,while:()=>S_===s&&s.st==='fight'}); s.t=0; s.D=Math.hypot(s.x-pos.x,s.z-pos.z); s.ten=.4; s.over=0; s.slack=0; s.surge=0; s.run=0; s.runT=1; s.lat=0; s.mode='run'; s.shakeT=0; SFX.play('step',{vol:.4,pitch:1.2}); shout('FISH ON!','#b8f0a0'); RIVER.drop&&RIVER.drop(s.x,s.z,.4*T,.05*WU); };
  const unhook=()=>{ '@later'; const s=S_, f=s.f, r=S.fishkg[f.id]||[0,0]; S.fishkg[f.id]=[+f.kg.toFixed(2),Math.max(r[1],+f.kg.toFixed(2))]; if(!IP(S.hook,'reuse'))S.hook=null;
    if(NAMES[f.id]&&FISHING.held()>=FISHING.room()){ FORAGE.save(); shout(`NO ROOM: YOU CAN CARRY ${FISHING.room()} FISH. A COOLER FROM FISHING & SCUBA HOLDS MORE. YOU LET THE ${NAMES[f.id]} GO.`,'#e0a888'); SFX.play('drip',{vol:.5,pitch:.7}); FISHING.last={id:f.id,kg:+f.kg.toFixed(2),freed:true}; FISHING.reel(); FORAGE.draw(); return; }
    FORAGE.give(f.id); if(s.fish){ FISHES.gone(s.fish); s.landed=true; } FORAGE.save();
    if(f.id==='chest'){ const g=INV.random(), c=10+Math.floor(Math.random()*31); INV.add(g); INV.cash+=c; FORAGE.take('chest',1); say(`A SUNKEN CHEST! INSIDE: $${c} AND A ${GEMS.find(x=>x[0]===g)[1]}.`,'#f2c14e'); if(window.BOOKS&&Math.random()<.4)BOOKS.chest(); }
    else say(`YOU TAKE ${NAMES[f.id]?'THE '+f.kg.toFixed(2)+' KG '+NAMES[f.id]:'THE '+FORAGE.NM[f.id]} OFF THE HOOK.`,NAMES[f.id]?'#b8f0a0':'#c8c2b0');
    SFX.play('drip',{vol:.6}); FISHING.last={id:f.id,kg:+f.kg.toFixed(2)}; FISHING.reel(); for(const g of FISHING.LAND)g(f.id,f.kg); FORAGE.draw(); };
  const V=new THREE.Vector3(), SH=document.createElement('div'); let shT=0; SH.style.cssText='position:fixed;left:50%;top:28%;transform:translateX(-50%);z-index:20;pointer-events:none;font:20px Silkscreen,monospace;letter-spacing:1px;text-align:center;max-width:90vw;text-shadow:2px 2px 0 #000,-1px -1px 0 #000;opacity:0;transition:opacity .35s'; document.body.appendChild(SH);
  const shout=(t,c)=>{ say(t,c); SH.textContent=t; SH.style.color=c; SH.style.opacity=1; clearTimeout(shT); shT=setTimeout(()=>{ SH.style.opacity=0; },3000); };
  FISHING.tick=dt=>{ dt*=FISHING.speed||1; const s=S_; if(!s){ FISHING.bendK=.03; return; } s.t+=dt;
    if(Math.hypot(pos.x-s.ax,pos.z-s.az)>(BOAT.on?2.5*T:.6*T)||!FORAGE.has('rod')){ if(s.st==='land')return unhook(); FISHING.reel(); return say('YOU REEL IN YOUR LINE.'); }
    const lv=s.w.lv, a=from(); let bx=s.x, bz=s.z, by=lv+(s.w.kind==='river'?RIVER.hAt(s.x,s.z):0), fx=null;
    if(s.st==='wind'){ if(s.t>.38){ s.st='fly'; s.t=0; s.sx=a.x; s.sy=a.y; s.sz=a.z; s.T=.55+Math.hypot(s.x-a.x,s.z-a.z)/(14*T); } bob.visible=false; line.visible=false; FISHING.bendK=.18; hud(); return; }
    if(s.st==='fly'){ const u=Math.min(1,s.t/s.T); bx=s.sx+(s.x-s.sx)*u; bz=s.sz+(s.z-s.sz)*u; by=s.sy+(lv-s.sy)*u+Math.sin(Math.PI*u)*Y(2.5);
      if(u>=1){ s.st='wait'; s.t=0; SFX.play('drip',{vol:.35,pitch:.7}); RIVER.drop&&s.w.kind==='river'&&RIVER.drop(s.x,s.z,.3*T,.03*WU); const o=FISHING.odds(s.x,s.z); s.o=o; s.bare=!S.hook; s.tb=o&&o.rate>0&&!s.bare?-Math.log(1-Math.random())/o.rate:1e9; if(FISHING.force)s.tb=Math.min(s.tb,2+Math.random()*2); if(s.tb<1e8){ s.bid=pickBite(o); if(NAMES[s.bid])s.fish=FISHES.lure(s.bid,s.x,s.z,Math.max(1,s.tb-.3)); } } FISHING.bendK=.06; }
    else if(s.st==='wait'){ s.x+=(s.w.kind==='river'?.05*WU:0)*dt*Math.max(0,1-s.t/30); bx=s.x; if(s.t>s.tb-1.2&&s.t<s.tb){ s.nib=1; by-=.03*T*Math.max(0,Math.sin(s.t*22)); } else s.nib=0;
      if(s.t>=s.tb){ const id=s.bid||pickBite(s.o), w=IP(id,'weight')||.6; s.f={id,kg:s.fish?s.fish.kg:w*(.5+Math.pow(Math.random(),1.4)*1.2),s:1}; if(FISHING.force===id){ s.f.kg=Math.max(s.f.kg,w); if(s.fish)s.fish.kg=s.f.kg; } FISHES.hook(s.fish); dressHook(id,s.f.kg); s.st='bite'; s.t=0; rests.push([s.x,s.z,performance.now()/1000]); if(rests.length>20)rests.shift(); SFX.play('drip',{vol:.5,pitch:1.4}); RIVER.drop&&s.w.kind==='river'&&RIVER.drop(s.x,s.z,.25*T,.04*WU); }
      FISHING.bendK=.04+s.nib*.05; }
    else if(s.st==='bite'){ by-=.12*T*(.6+.4*Math.abs(Math.sin(s.t*9))); fx=[s.x,lv-Y(.35),s.z]; FISHING.bendK=.18+.06*Math.sin(s.t*14); if(FISHING.auto&&s.t>.3)return strike(); if(s.t>(FISHING.win||1.4)){ const lure=IP(S.hook,'reuse'); if(!lure){ S.hook=null; s.bare=true; } s.st='wait'; s.t=SOAK+1; s.tb=lure?s.t+8+Math.random()*10:1e9; s.bid=lure?pickBite(s.o):null; FISHES.free(s.fish); s.fish=null; shout(lure?'THE FISH SPITS OUT THE LURE.':'THE FISH STEALS YOUR BAIT.','#e0a888'); } }
    else if(s.st==='fight'){ const f=s.f, fi=(IP(f.id,'fight')||1)/10, W0=IP(f.id,'weight')||.6, P0=fi*(.5+.5*Math.min(1.6,f.kg/W0)), G=FISHING.gear(), dk=.25+.15*FISHING.drag;
      // the fish runs one way or the other; pull the rod against its run and it tires fast, with it and the line takes the strain
      if((s.runT-=dt)<=0){ const r=Math.random(); s.mode=r<.22*(1-f.s)+.08?'rest':r>.86-.3*f.s?'shake':'run'; s.run=s.mode!=='run'?0:Math.random()<.5?-1:1; s.runT=s.mode==='shake'?.8+Math.random()*.5:s.mode==='rest'?1.2+Math.random()*1.5:(1+Math.random()*1.8)/(.6+fi); s.shakeT=0; }
      if(s.mode==='rest'&&!FISHING.reeling)f.s=Math.min(1,f.s+dt*.05);
      if(FISHING.auto)FISHING.side=-s.run; const vs=s.run?(FISHING.side===-s.run?-1:FISHING.side===s.run?1:0):0;
      if(s.surge>0)s.surge-=dt; else if(Math.random()<dt*.5*f.s){ s.surge=.6+Math.random()*.7; RIVER.drop&&s.w.kind==='river'&&RIVER.drop(s.x,s.z,.3*T,.03*WU); }
      const shake=s.mode==='shake'?1+.55*Math.sin((s.shakeT+=dt)*26):1, pull=P0*(.3+.7*f.s)*(s.surge>0?1.6:1)*(s.run?1.1:1)*(vs<0?.7:vs>0?1.25:1)*(s.mode==='rest'?.5:1)*shake; if(FISHING.auto)FISHING.reeling=s.mode!=='shake'&&pull*.9+.3<Math.min(.95*G.line,dk+.3)&&s.over<.2;
      // the drag: reeling against more than it holds lets the fish take line instead; low drag spares the line, high drag brings it in
      if(FISHING.reeling){ let ten=pull*.9+.3; if(ten>dk+.35){ ten=dk+.35+(ten-dk-.35)*.3; s.D=Math.min(Y(45),s.D+dt*Y(.7)*pull*f.s); } else s.D-=dt*Y(1.1)*G.reel*Math.max(.15,1-.6*pull); s.ten=ten; }
      else { s.ten=Math.min(pull*.45,dk); s.D=Math.min(Y(45),s.D+dt*Y(1.4)*pull*f.s); }
      if(!(s.mode==='rest'&&!FISHING.reeling))f.s=Math.max(0,f.s-dt*(.03+.12*s.ten)*(vs<0?2.2:vs>0?.6:1));
      if(s.ten>G.line){ s.over+=dt; if(s.over>.6){ const lure=IP(S.hook,'reuse'); S.hook=null; FISHING.reel(); return shout('THE LINE SNAPS! TOO MUCH STRAIN.'+(lure?' THE LURE IS GONE WITH IT.':''),'#f09070'); } } else s.over=Math.max(0,s.over-dt);
      if(s.ten<.18){ s.slack+=dt; if(s.slack>3){ if(!IP(S.hook,'reuse'))S.hook=null; FISHING.reel(); return shout('THE LINE WENT SLACK. THE HOOK SLIPS AND THE FISH IS GONE.','#e0a888'); } } else s.slack=0;
      s.lat+=((s.run||0)*Y(2.2)*(.4+.6*f.s)-s.lat)*Math.min(1,dt*1.5);
      const dx=s.tx-s.ax, dz=s.tz-s.az, dl=Math.hypot(dx,dz)+1e-4, sw=Math.sin(s.t*1.7)*Y(.5)*f.s+s.lat; s.x=pos.x+dx/dl*s.D+(-dz/dl)*sw; s.z=pos.z+dz/dl*s.D+(dx/dl)*sw;
      if(s.w.kind==='river'&&RIVER.onPier(s.x,s.z,.2*T)){ s.D=Math.max(0,s.D-dt*Y(1)); }
      fx=[s.x,lv-Y(.25+.7*f.s)+(s.surge>0?Y(.2):0),s.z]; FISHING.bendK=.05+.4*Math.min(1.2,s.ten);
      if(s.D<Y(1.4)){ s.st='land'; s.t=0; SFX.play('drip',{vol:.6,pitch:.8}); shout(`YOU LIFT ${NAMES[f.id]?'A '+NAMES[f.id]:'IT'} OUT OF THE WATER.`,'#b8f0a0'); } }
    else if(s.st==='land'){ FISHING.bendK=.12+Math.min(.3,s.f.kg*.04); fx=[a.x+Math.sin(s.t*2.4)*Y(.08),a.y-Y(.55)-(hooked.userData.real?0:lenOf(s.f.id,s.f.kg)*.5),a.z+Math.cos(s.t*1.9)*Y(.06)]; if(FISHING.auto&&s.t>1.2)return unhook(); }
    bob.visible=s.st!=='land'&&s.st!=='fight'; bob.position.set(bx,by,bz);
    hooked.visible=!!fx&&!!NAMES[s.f.id]; if(fx){ if(hooked.userData.real)hooked.scale.setScalar(FISHES.len(s.f.id,s.f.kg)); else { shape(hooked,s.f.id,s.f.kg); hooked.material.color.setHex((LOOK[s.f.id]||[0x8a8a7a])[0]); } if(s.st==='land'){ hooked.rotation.set(0,s.t*.7,Math.PI/2+Math.sin(s.t*11)*.25); } else hooked.rotation.set(0,Math.atan2(-(s.z-s.az),s.x-s.ax)+Math.sin(s.t*6)*.4,0); hooked.position.set(...fx); if(hooked.userData.real)ANCHORS.place(hooked,'fishes',s.f.id,'mouth',hooked.position.clone()); }   // the line ends in its mouth, so it hangs from the hook
    const e=fx?V.set(...fx):V.set(bx,by,bz), arr=lineG.attributes.position, sag=s.st==='fight'?Y(.5)*Math.max(0,.8-s.ten):s.st==='land'?0:Y(.4);
    for(let i=0;i<=NL;i++){ const u=i/NL; arr.setXYZ(i,a.x+(e.x-a.x)*u,a.y+(e.y-a.y)*u-sag*4*u*(1-u),a.z+(e.z-a.z)*u); }
    if(s.st==='wait'||s.st==='bite')arr.setXYZ(NL+1,bx,by-Y(.9),bz); else arr.setXYZ(NL+1,e.x,e.y,e.z); arr.needsUpdate=true; lineG.setDrawRange(0,NL+2); line.visible=s.st!=='wind';
    if(fx&&s.st==='fight'&&Math.random()<dt*3&&s.w.kind==='river')RIVER.drop&&RIVER.drop(fx[0],fx[2],.2*T,.012*WU);
    hud(); };
  // the arm: idle the rod up; the cast back over the shoulder and through; the fight's rod held high toward the fish
  FISHING.aim=(dt,aim)=>{ '@later'; const s=S_, h=SHARED.heading, fx=Math.sin(h), fz=Math.cos(h), set=(f,u)=>aim.set(fx*f,u,fz*f).normalize();
    if(!s){ if(!FISHING.mode)return false; return set(.9,-.35),true; } const t=s.t;
    if(s.st==='wind')return set(-.35,1),true; if(s.st==='fly')return t<.22?set(1,.15-t*2):set(1,-.3),true;
    if(s.st==='fight'){ const dx=s.x-pos.x, dz=s.z-pos.z, d=Math.hypot(dx,dz)+1e-4; const k=(FISHING.side||0)*.55; aim.set(dx/d*.8-dz/d*k,.15+.25*Math.min(1,s.ten)+(FISHING.reeling?Math.sin(t*16)*.06:0),dz/d*.8+dx/d*k).normalize(); return true; }
    if(s.st==='land')return set(.7,.35),true; return set(.9,-.25+(s.st==='bite'?.05*Math.sin(t*20):0)),true; };
  FISHING.bendK=.03;
  /* ---------- the pack: bait the hook, cast, and each fish's last and best weight ---------- */
  FORAGE.ROWB.push(id=>id==='rod'?[[S_?'REEL IN':'CAST','fcast'],['GUIDE','fguide']]:BAITIDS.includes(id)?[['ON THE HOOK','fhook']]:[]);
  FORAGE.NOTE.push(id=>id==='rod'?'HOOK: '+(S.hook?FORAGE.NM[S.hook]:'BARE'):S.fishkg[id]?`LAST ${S.fishkg[id][0]} KG · BEST ${S.fishkg[id][1]} KG`:'');
  FORAGE.ACT.fhook=id=>{ if(S.hook&&S.hook!==id)FORAGE.give(S.hook,1); if(S.hook!==id)hookOn(id); };
  FORAGE.ACT.fcast=()=>{ '@later'; if(S_){ if(S_.st==='land')return unhook(); FISHING.reel(); return say('YOU REEL IN YOUR LINE.'); } const h=SHARED.heading; for(const d of [6,4,9,3]){ const x=pos.x+Math.sin(h)*d*T, z=pos.z+Math.cos(h)*d*T; if(FISHING.at(x,z))return FISHING.cast(x,z); } say('NO WATER AHEAD TO CAST INTO.','#c8a090'); };
  /* ---------- FISHING MODE: you stand still, the mouse only turns and zooms the view, and the controls are on screen: cast (hold for power), strike, reel, take off, bait ---------- */
  { const MIND=2*T, FILL=1.1, MAXD=()=>FISHING.gear().cast*WU, BAITS=[['bait','WORM'],['bait_cut','CUT BAIT'],['lure_worm','RUBBER WORM'],['lure_spoon','SPOON']];
    const PB=document.createElement('div'); PB.id='fishmode'; PB.style.cssText='position:fixed;left:50%;bottom:8px;transform:translateX(-50%);z-index:8;display:none;gap:4px;flex-wrap:wrap;justify-content:center;align-items:center;max-width:96vw;font:11px Silkscreen,monospace;color:#e8e2cc;background:#0b0d13e0;border:2px solid #3a3f4e;padding:5px 8px;zoom:var(--uiz,1)'; document.body.appendChild(PB);
    const GO=document.createElement('button'); GO.id='fishgo'; GO.className='mlb'; GO.textContent='FISH · F'; GO.hidden=true; GO.style.cssText='position:fixed;left:50%;bottom:52px;transform:translateX(-50%);z-index:8;font:12px Silkscreen,monospace;color:#0b0d13;background:#8fe3d6;border:2px solid #3a3f4e;padding:6px 14px;cursor:pointer;zoom:var(--uiz,1)'; document.body.appendChild(GO);
    const ring=new THREE.Mesh(new THREE.RingGeometry(.3*T,.42*T,24),new THREE.MeshBasicMaterial({color:0x8fe3d6,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.visible=false; ring.renderOrder=5; ring.frustumCulled=false;
    let prev=null, pw=.5, hold=null, sig='', chk=0, pbar=null;
    const ahead=d=>{ const h=SHARED.heading; return [pos.x+Math.sin(h)*d,pos.z+Math.cos(h)*d]; };
    const water=()=>[3,5,8,11].some(k=>FISHING.at(...ahead(k*T)));
    const power=()=>hold?Math.max(.05,Math.min(1,hold.t/FILL)):pw;
    FISHING.enter=()=>{ '@later'; if(FISHING.mode)return; if(!FORAGE.has('rod'))return say('YOU NEED A ROD. FISHING & SCUBA ON THE HUDSON ROW SELLS THEM.','#c8a090'); if(WIELD.on!=='rod')WIELD.set('rod'); if(WIELD.on!=='rod')return;
      FISHING.mode=SHARED.fishing=true; prev=UI.view; if(UI.view!=='first'&&UI.view!=='follow')UI.setView('follow'); SHARED.yawTo=SHARED.heading+Math.PI; SHARED.target=null; sig=''; GO.hidden=true;
      say('FISHING. DRAG TO LOOK ROUND, THE WHEEL ZOOMS. HOLD CAST (SPACE) FOR POWER, LET GO TO THROW.','#8fe3d6'); };
    FISHING.leave=()=>{ if(!FISHING.mode)return; try{ if(S_){ if(S_.st==='land')unhook(); else FISHING.reel(); } }catch(e){ console.warn('fishing: leave',e); try{ FISHING.reel(); }catch(e2){} } FISHING.mode=SHARED.fishing=false; hold=null; FISHING.reeling=false; ring.visible=false; PB.style.display='none'; HUDF.style.bottom='52px'; if(prev&&prev!==UI.view)UI.setView(prev); prev=null; };
    const throwIt=()=>{ const p=power(); hold=null; pw=p; const [x,z]=ahead(MIND+p*(MAXD()-MIND)); if(!FISHING.at(x,z))return say('THAT WOULD LAND ON DRY GROUND. TURN TO THE WATER OR CHANGE THE POWER.','#c8a090'); FISHING.cast(x,z); };
    const down=()=>{ const s=S_; if(!s){ hold={t:0}; return; } if(s.st==='fight'){ FISHING.reeling=true; return; } if(s.st==='bite')return strike(); if(s.st==='land')return unhook(); FISHING.reel(); say('YOU REEL IN YOUR LINE.'); };
    let pside=false; const up=()=>{ if(hold)throwIt(); FISHING.reeling=false; };
    const drag=d=>{ FISHING.drag=Math.max(1,Math.min(5,FISHING.drag+d)); sig=''; };
    const view=()=>UI.setView(UI.view==='first'?'follow':'first');
    const baitNext=()=>{ if(S_)return; const own=BAITS.filter(b=>FORAGE.has(b[0])||S.hook===b[0]); if(!own.length)return say('YOU HAVE NO BAIT. FISHING & SCUBA ON THE HUDSON ROW SELLS IT.','#c8a090'); const i=own.findIndex(b=>b[0]===S.hook); FORAGE.ACT.fhook(own[(i+1)%own.length][0]); };
    const B=(txt,key,fn,o={})=>{ '@later'; const b=document.createElement('button'); b.innerHTML=txt+(key?` <span style="opacity:.6">${key}</span>`:''); b.style.cssText=`font:11px Silkscreen,monospace;padding:5px 9px;cursor:pointer;border:2px solid ${o.on?'#8fe3d6':'#3a3f4e'};color:${o.hot?'#0b0d13':'#e8e2cc'};background:${o.hot?'#f2c14e':'#151821'};opacity:${o.off?.4:1}`;
      if(o.off)b.disabled=true; else if(o.hold){ b.onpointerdown=e=>{ e.preventDefault(); fn(); }; } else b.onclick=fn; PB.appendChild(b); return b; };
    const draw=()=>{ '@later'; const s=S_, st0=s?s.st:'', hk=S.hook||'', n=BAITS.map(b=>FORAGE.has(b[0])||0).join(','), k=[st0,hk,n,UI.view,!!hold,FISHING.drag,FORAGE.has('crabpot')||0].join('|'); if(k===sig)return; sig=k; PB.innerHTML=''; pbar=null;
      if(!s){ B(hold?'LET GO TO CAST':'CAST (HOLD)','SPACE',()=>down(),{hold:1});
        const P=document.createElement('span'); P.style.cssText='display:inline-block;width:90px;height:10px;border:1px solid #3a3f4e;background:#151821;vertical-align:middle;margin:0 4px'; pbar=document.createElement('span'); pbar.style.cssText='display:block;height:100%;background:#8fe3d6'; P.appendChild(pbar); PB.appendChild(P);
        const L=document.createElement('span'); L.textContent='HOOK: '+(hk?(BAITS.find(b=>b[0]===hk)||[0,FORAGE.NM[hk]])[1]:'BARE'); L.style.margin='0 4px'; PB.appendChild(L);
        for(const [id,nm] of BAITS){ const c=FORAGE.has(id)||0; if(/^lure/.test(id)&&!c&&hk!==id)continue; B(`${nm} ×${c}`,'',()=>FORAGE.ACT.fhook(id),{on:hk===id,off:!c&&hk!==id}); } B('CHANGE BAIT','B',baitNext,{off:!BAITS.some(b=>FORAGE.has(b[0]))});
        B('DRAG '+FISHING.drag,'W S',()=>drag(FISHING.drag>=5?-4:1)); if(FORAGE.has('crabpot')&&FORAGE.ACT.potdrop)B('DROP A CRAB POT','P',()=>FORAGE.ACT.potdrop()); }
      else if(st0==='bite')B('STRIKE!','SPACE',()=>down(),{hot:1});
      else if(st0==='fight'){ B('&#9664; PULL LEFT','A',()=>{ FISHING.side=-1; pside=true; },{hold:1}); B('REEL (HOLD)','SPACE',()=>down(),{hold:1,hot:1}); B('PULL RIGHT &#9654;','D',()=>{ FISHING.side=1; pside=true; },{hold:1}); B('DRAG '+FISHING.drag,'W S',()=>drag(FISHING.drag>=5?-4:1)); }
      else if(st0==='land')B('TAKE OFF THE HOOK','SPACE',()=>down(),{hot:1});
      else B('REEL IN','SPACE',()=>down());
      B('VIEW: '+(UI.view==='first'?'FIRST PERSON':'BEHIND'),'V',view); B('GUIDE','',()=>FISHING.guide()); B('LEAVE','ESC',()=>FISHING.leave()); };
    GO.onclick=()=>FISHING.enter();
    addEventListener('pointerup',()=>{ if(FISHING.mode){ up(); if(pside){ FISHING.side=0; pside=false; } } });
    const typing=e=>e.target&&e.target.closest&&e.target.closest('input,textarea,[contenteditable="true"]');
    const LOCK=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','1','j','k','n','r','u','i','2','3','4','p','f','v','b',' ','escape']), LEFT=new Set(['a','arrowleft']), RIGHT=new Set(['d','arrowright']);
    addEventListener('keydown',e=>{ const k=(e.key||'').toLowerCase(); if(k==='escape'&&FISHING.mode&&typing(e)){ e.target.blur(); e.preventDefault(); e.stopImmediatePropagation(); FISHING.leave(); return; } if(typing(e))return;
      if(!FISHING.mode){ if(k==='f'&&!GO.hidden&&!e.repeat){ FISHING.enter(); e.preventDefault(); e.stopImmediatePropagation(); } return; }
      if(!LOCK.has(k))return; e.preventDefault(); e.stopImmediatePropagation(); if(e.repeat)return;
      if(k===' ')down(); else if(k==='escape'||k==='f')FISHING.leave(); else if(k==='v')view(); else if(k==='b')baitNext(); else if(LEFT.has(k))FISHING.side=-1; else if(RIGHT.has(k))FISHING.side=1;
      else if(k==='w'||k==='arrowup')drag(1); else if(k==='s'||k==='arrowdown')drag(-1); else if(k==='p'&&!S_&&FORAGE.ACT.potdrop)FORAGE.ACT.potdrop(); },true);
    addEventListener('keyup',e=>{ if(!FISHING.mode||typing(e))return; const k=(e.key||'').toLowerCase(); if(k===' ')up(); if((LEFT.has(k)&&FISHING.side<0)||(RIGHT.has(k)&&FISHING.side>0))FISHING.side=0; if(LOCK.has(k)){ e.preventDefault(); e.stopImmediatePropagation(); } },true);
    SYS.add('life',dt=>{ if(!FISHING.mode){ if((chk-=dt)<=0){ chk=.25; GO.hidden=!(WIELD.on==='rod'&&FORAGE.has('rod')&&!VIT.dead&&SHARED.LVL==='up'&&water()); } return; }
      if(WIELD.on!=='rod'||!FORAGE.has('rod')||VIT.dead)return FISHING.leave();
      if(!ring.parent)scene.add(ring); if(!S_)SHARED.heading=SHARED.yaw+Math.PI; if(hold)hold.t+=dt;
      if(!S_){ const [x,z]=ahead(MIND+power()*(MAXD()-MIND)), w=FISHING.at(x,z); ring.visible=true; ring.position.set(x,(w?w.lv+(w.kind==='river'?RIVER.hAt(x,z):0):SHARED.groundY(x,z))+.03*T,z); ring.material.color.setHex(w?0x8fe3d6:0xd85a3a); ring.scale.setScalar(1+.08*Math.sin(performance.now()/180)); } else ring.visible=false;
      PB.style.display='flex'; draw(); if(pbar)pbar.style.width=Math.round(power()*100)+'%'; HUDF.style.bottom=(PB.offsetHeight+14)+'px'; },'142-fishing-mode'); }
  { SYS.add('life',(dt)=>{ FISHING.tick(dt); },'142-fishing'); }
  /* ---------- the others see you fish: your float on the water, your line, the fish you fight or land, and your rowboat ---------- */
  { const r2=v=>Math.round(v*100)/100, xyz=o=>[r2(o.position.x),r2(o.position.y),r2(o.position.z)]; let shT=0, was='';
    SYS.add('life',dt=>{ if(!ONLINE.on||(shT-=dt||0)>0)return; shT=.25; const m={t:'fish',b:bob.visible?xyz(bob):null,x:hooked.visible&&S_&&S_.f?xyz(hooked):null,k:hooked.visible&&S_&&S_.f?S_.f.id:null,boat:BOAT.on?[r2(boat.position.x),r2(boat.position.y),r2(boat.position.z),r2(boat.rotation.y)]:null};
      const j=JSON.stringify(m); if(j===was&&!m.b&&!m.boat)return; was=j; ONLINE.send(m); },'142-fishing-share');
    const theirs=FISHING.theirs=new Map(), P=new THREE.Vector3();
    const mk=()=>{ '@later'; const o={bob:bob.clone(),fish:new THREE.Mesh(fishGeo,fishM.clone()),boat:boat.clone(),line:new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({length:NL+1},()=>new THREE.Vector3())),line.material)};
      o.line.frustumCulled=false; for(const k of ['bob','fish','boat','line']){ o[k].visible=false; o[k].userData.anyRoom=true; scene.add(LEVELS.own(o[k],'*')); } return o; };
    const drop=id=>{ const o=theirs.get(id); if(!o)return; for(const k of ['bob','fish','boat','line'])o[k].removeFromParent(); theirs.delete(id); };
    ONLINE.hear.fish=m=>{ if(!ONLINE.others.has(m.id))return drop(m.id); const ok=a=>Array.isArray(a)&&a.every(v=>typeof v==='number'&&isFinite(v)); if(!ok(m.b)&&!ok(m.x)&&!ok(m.boat))return drop(m.id);
      let o=theirs.get(m.id); if(!o)theirs.set(m.id,o=mk()); o.at=performance.now(); o.m=m; };
    SYS.add('life',dt=>{ if(!theirs.size)return; const now=performance.now();
      for(const [id,o] of theirs){ const R=ONLINE.others.get(id), F=R&&R.fig; if(!R||!F||now-o.at>3000||R.why!=='near you'){ if(!R||now-o.at>3000)drop(id); else for(const k of ['bob','fish','boat','line'])o[k].visible=false; continue; } const m=o.m;
        o.bob.visible=!!m.b; if(m.b)o.bob.position.set(...m.b); o.fish.visible=!!m.x&&!!NAMES[m.k]; if(o.fish.visible){ o.fish.position.set(...m.x); if(o.k!==m.k){ o.k=m.k; const r=FISHES.model(m.k,1); o.real=!!r; if(r){ o.fish.geometry=r.geometry; o.fish.material=r.material; } else { o.fish.geometry=fishGeo; o.fish.material=fishM.clone(); } }
          if(o.real)o.fish.scale.setScalar(FISHES.len(m.k,1)); else { shape(o.fish,m.k,1); o.fish.material.color.setHex((LOOK[m.k]||[0x8a8a7a])[0]); } }
        o.boat.visible=!!m.boat; if(m.boat){ o.boat.position.set(m.boat[0],m.boat[1],m.boat[2]); o.boat.rotation.y=m.boat[3]; }
        const e=m.x||m.b; o.line.visible=!!e; if(e){ F.g.updateMatrixWorld(true); const J=R.B&&R.B.J, tp=WIELD.theirTip&&WIELD.theirTip(id); if(tp)P.copy(tp); else { if(J&&J.palmR){ const q=J['palm'+(R.S&&R.S.hand==='L'?'L':'R')]||J.palmR; P.set(q.x,q.y,q.z).applyMatrix4(F.g.matrixWorld); } else P.copy(F.g.position).y+=1.4*T; P.y+=.9*T; }
          const a=o.line.geometry.attributes.position, sag=m.x?0:Y(.4); for(let i=0;i<=NL;i++){ const u=i/NL; a.setXYZ(i,P.x+(e[0]-P.x)*u,P.y+(e[1]-P.y)*u-sag*4*u*(1-u),P.z+(e[2]-P.z)*u); } a.needsUpdate=true; } } },'142-fishing-theirs'); }
  window.FISHDBG=()=>({rod:FORAGE.has('rod'),hook:S.hook||null,held:WIELD.on,shown:hooked.visible,shout:+SH.style.opacity?SH.textContent:'',state:S_&&{st:S_.st,t:+S_.t.toFixed(2),fish:S_.f&&{id:S_.f.id,kg:+S_.f.kg.toFixed(2),s:+S_.f.s.toFixed(2)},ten:S_.ten!=null?+S_.ten.toFixed(2):null,D:S_.D!=null?+(S_.D/WU).toFixed(1):null,x:+S_.x.toFixed(2),z:+S_.z.toFixed(2),odds:S_.o},
    boat:BOAT.on?{x:+BOAT.x.toFixed(2),z:+BOAT.z.toFixed(2),v:+BOAT.v.toFixed(2)}:null,stand:RIVER.on?{x:RIVER.fpier+2.6*T,z:RB.z1+1.55*T}:null,pier:RIVER.fpier,skill:FORAGE.sk('fish'),last:FISHING.last||null,swim:FISHES.list.filter(f=>!f.hooked).length,lured:!!(S_&&S_.fish)}); };
RIVER.onBuild.push(fishInit); SYS.onStart(()=>LOAD('later').then(()=>fishInit()),'142-fishing');
export {FISHING};
