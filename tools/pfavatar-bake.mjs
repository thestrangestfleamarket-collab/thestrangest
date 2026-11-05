// THE POLYFORK AVATAR, step 1 (owner, 5 Nov 2026): runs the Polyfork character modules locally and writes every wardrobe piece raw to .polyfork/avatar-raw.json.
// Needs the adult cast's modules in .polyfork/mods/ (fetched from polyfork.dev, never committed) and `node .polyfork/t/patch.cjs`-style hooks, which this script adds itself.
// Step 2 is tools/pfavatar-pack.py (onto the Walker's rig, into data/pfavatar-m.json and -f.json). Run: node tools/pfavatar-bake.mjs
import fs from 'fs'; import path from 'path'; import * as THREE from 'three';
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..'), PF=path.join(ROOT,'.polyfork'), MODS=path.join(PF,'mods'), PATCHED=path.join(PF,'patched');
const BASE='holidaymaker-in-a-sun-2ba5e5', HAT_FOR_HAIR=['hat','goalkeeper-10017a'], COAT_FOR_TOP=['coat','aircrew-pilot-e6b732'];
const FIGS={m:'masculine',f:'feminine'}, BUILDS=[0.86,1.02,1.18];
// [slot, source character (its own recipe for that slot), label]
const WARDROBE=[
 ['hair','clean-room-technician-da290a','SHORT'],['hair','doorman-3f2e09','CROPPED'],['hair','lounge-crooner-ad77ec','SIDE PART'],['hair','village-engineer-a44949','BUZZ'],['hair','cafe-customer-ca7e8e','BOB'],
 ['hair','barista-505240','PONYTAIL'],['hair','bench-researcher-d0f1b9','BUN'],['hair','holidaymaker-in-a-sun-2ba5e5','LONG'],['hair','cage-cashier-f76725','AFRO'],
 ['face','aquarium-service-technician-b1fc4f','STUBBLE'],['face','aircrew-pilot-e6b732','FULL BEARD'],['face','street-vendor-139de3','GOATEE'],['face','engine-driver-1ba1e2','MOUSTACHE'],
 ['eyes','graduate-student-945ef0','GLASSES'],['eyes','guard-bfa819','WAYFARERS'],['eyes','lounge-crooner-ad77ec','AVIATORS'],['eyes','family-road-tripper-247570','CAT-EYES'],
 ['hat','goalkeeper-10017a','CAP'],['hat','chinchinero-2cc296','FLAT CAP'],['hat','highway-patrol-officer-e81282','BRIM HAT'],['hat','lift-operator-899cf8','BEANIE'],['hat','farmer-304a43','STRAW HAT'],
 ['hat','cove-trader-0f94a6','FELT HAT'],['hat','stage-magician-2ecd48','TOP HAT'],['hat','forest-ranger-6906b0','WIDE BRIM'],['hat','delivery-courier-327e30','PEAKED CAP'],['hat','doorman-3f2e09','DOORMAN CAP'],
 ['hat','construction-worker-c1ad8c','HARD HAT'],['hat','family-road-tripper-247570','KERCHIEF'],['hat','pirate-deckhand-98a6e7','HEADSCARF'],['hat','hooded-cultist-8a488f','HOOD'],['hat','flower-vendor-bc708b','SOMBRERO'],
 ['hat','naval-officer-93027f','TRICORN'],['hat','pirate-captain-91f545','PIRATE HAT'],['hat','neighbour-handing-out-candy-2c1159','WITCH HAT'],
 ['top','backpacker-f56207','T-SHIRT'],['top','casino-security-officer-adca27','SHIRT'],['top','forest-ranger-6906b0','WORK SHIRT'],['top','armoured-knight-hero-07121f','TUNIC'],['top','doctor-d49de0','SCRUBS'],
 ['top','gridiron-player-9d4168','JERSEY'],['top','holidaymaker-in-a-sun-2ba5e5','SWIMSUIT'],['top','showgirl-5bfa7a','TWO-PIECE'],['top','patient-in-gown-fdab75','GOWN'],['top','civic-security-officer-30b6fb','COVERALL'],
 ['top','base-commander-0ec028','JUMPSUIT'],['top','scuba-diver-bdd1c8','WETSUIT'],
 ['coat','aircrew-pilot-e6b732','COAT'],['coat','buddhist-monk-39f498','WRAP COAT'],['coat','blackjack-dealer-fc0ab1','WAISTCOAT'],['coat','poker-pro-da0258','HOODIE'],['coat','bellhop-053c4d','JACKET'],
 ['coat','city-commuter-52a53f','LONG COAT'],['coat','naval-officer-93027f','DRESS COAT'],['coat','stage-magician-2ecd48','TAILCOAT'],['coat','bench-researcher-d0f1b9','LAB COAT'],['coat','graduate-in-gown-c72050','ROBE'],
 ['coat','barista-505240','APRON'],['coat','construction-worker-c1ad8c','HI-VIS VEST'],['coat','china-cueca-dancer-c1707a','LONG SKIRT'],
 ['bottom','aquarium-service-technician-b1fc4f','TROUSERS'],['bottom','ashigaru-foot-soldier-806707','WIDE TROUSERS'],['bottom','backpacker-f56207','SHORTS'],['bottom','cheerleader-90875e','PLEATED SKIRT'],['bottom','engine-driver-1ba1e2','DUNGAREES'],
 ['feet','family-road-tripper-247570','SNEAKERS'],['feet','aquarium-service-technician-b1fc4f','SHOES'],['feet','construction-worker-c1ad8c','WORK BOOTS'],['feet','delivery-courier-327e30','ANKLE BOOTS'],['feet','preacher-a49199','CHELSEA BOOTS'],
 ['feet','cafe-customer-ca7e8e','TALL BOOTS'],['feet','lifeguard-321302','FLIP-FLOPS'],['feet','pool-guest-78b655','SLIDES'],['feet','flower-vendor-bc708b','HUARACHES'],['feet','daimyo-lord-78364a','GETA'],
 ['belt','hiker-visitor-d10aa5','BELT'],['belt','flower-vendor-bc708b','SASH'],['belt','samurai-warrior-f2ebbe','OBI'],['belt','astronaut-scientist-47d733','UTILITY BELT'],
 ['neck','commuter-381e7f','SCARF'],['neck','tapati-dancer-5557aa','PEARLS'],['neck','groundskeeper-3e5578','LANYARD'],['neck','guard-bfa819','WHISTLE'],['neck','ward-nurse-84b61d','FOB WATCH'],['neck','hooded-cultist-8a488f','MANTLE'],
 ['hands','astronaut-explorer-323482','WORK GLOVES'],['hands','referee-9e9e73','WRISTWATCH'],
 // every other garment the cast wears, one each, and the back and both hands (owner, 5 Nov 2026: "lets add all possible clothing from all models")
 ['face','slot-tourist-08b37d','BLUSH'],['face','la-catrina-b427ca','CALAVERA PAINT'],['face','kid-in-a-black-2e5f87','CAT PAINT'],['face','porter-e4e566','FRECKLES'],
 ['face','goblin-2461c8','JAW LINE'],['face','samurai-warrior-f2ebbe','MENPO'],['face','dragon-slayer-91ab39','SOOT'],['face','clean-room-technician-da290a','SURGICAL MASK'],
 ['face','tapati-dancer-5557aa','TAKONA'],['eyes','scuba-diver-bdd1c8','DIVE MASK'],['eyes','kid-in-a-caped-663f11','DOMINO MASK'],['eyes','el-catr-n-be48ea','MONOCLE'],
 ['eyes','graffiti-artist-2deb3d','RAISED RESPIRATOR'],['hat','armoured-knight-hero-07121f','BASCINET'],['hat','townswoman-5aa87f','BONNET'],['hat','astronaut-engineer-20b738','BUBBLE HELMET'],
 ['hat','kid-in-a-black-2e5f87','CAT EARS'],['hat','clean-room-technician-da290a','DIVE HOOD'],['hat','aircrew-pilot-e6b732','FLIGHT CAP'],['hat','gridiron-player-9d4168','FOOTBALL HELMET'],
 ['hat','tapati-dancer-5557aa','HEADDRESS'],['hat','standing-worker-on-a-8a0f9a','HEADSET'],['hat','civic-security-officer-30b6fb','HELMET'],['hat','ashigaru-foot-soldier-806707','JINGASA'],
 ['hat','samurai-warrior-f2ebbe','KABUTO'],['hat','diner-waitress-60f6a1','PAPER CAP'],['hat','kid-in-a-pumpkin-169f79','PUMPKIN CAP'],['hat','city-commuter-52a53f','RAIN HOOD'],
 ['hat','service-robot-93f82e','SENSOR HEAD'],['hat','graduate-in-gown-c72050','SURGICAL CAP'],['hat','carving-chef-102bf5','TOQUE'],['hat','astronaut-scientist-47d733','WINDOW HELMET'],
 ['top','astronaut-engineer-20b738','EVA SUIT'],['top','shuttle-pilot-067166','FLIGHT SUIT'],['top','crane-banksman-3994e0','HI VIS SUIT'],['top','kid-in-a-skeleton-6bb49d','SKELETON SUIT'],
 ['top','fisherman-in-waders-6dc25e','WORKSHIRT'],['coat','ashigaru-foot-soldier-806707','DO MARU'],['coat','school-student-385134','JUMPER'],['coat','armoured-knight-hero-07121f','PLATE ARMOUR'],
 ['coat','kid-in-a-pumpkin-169f79','PUMPKIN COSTUME'],['coat','village-guard-5f0f6f','TABARD'],['coat','guard-bfa819','UNIFORM TUNIC'],['bottom','kid-witch-01c770','TIGHTS'],
 ['bottom','fisherman-in-waders-6dc25e','WADERS'],['feet','scuba-diver-bdd1c8','FINS'],['feet','ashigaru-foot-soldier-806707','WARAJI'],['belt','highway-patrol-officer-e81282','DUTY BELT'],
 ['belt','kid-in-a-black-2e5f87','TAIL'],['belt','astronaut-engineer-20b738','TOOL HARNESS'],['neck','family-road-tripper-247570','CAMERA'],['neck','huaso-c4847f','CHAMANTO'],
 ['neck','casino-security-officer-adca27','EAR PIECE'],['neck','dragon-slayer-91ab39','FUR CLOAK'],['neck','kid-in-a-caped-663f11','HERO CAPE'],['neck','graffiti-artist-2deb3d','HOOP EARRINGS'],
 ['neck','daimyo-lord-78364a','JINBAORI'],['neck','buddhist-monk-39f498','KESA'],['neck','farmer-363820','MINO'],['neck','grandmother-in-a-rebozo-4d5190','REBOZO'],
 ['neck','groundworker-083f5c','RESPIRATOR'],['neck','mountaineer-13df29','ROPE COIL'],['neck','crossing-keeper-e13207','SHAWL'],['neck','village-guard-5f0f6f','SPAULDERS'],
 ['neck','doctor-d49de0','STETHOSCOPE'],['neck','high-roller-9d0aa1','STOLE'],['neck','kid-witch-01c770','WITCH CAPE'],['hands','high-roller-9d0aa1','BANGLES'],
 ['hands','patient-in-gown-fdab75','IV LINE'],['hands','buddhist-monk-39f498','MALA'],['hands','bmx-rider-91f1b0','SKATE PADS'],['hands','shambling-ghoul-256f2f','TATTOOS'],
 ['back','scuba-diver-bdd1c8','AIR TANK'],['back','backpacker-f56207','BACKPACK'],['back','chinchinero-2cc296','BASS DRUM'],['back','shuttle-pilot-067166','FLIGHT RIG'],
 ['back','groundskeeper-3e5578','LEAF BLOWER'],['back','astronaut-engineer-20b738','LIFE SUPPORT'],['back','delivery-courier-327e30','PACK'],['back','samurai-warrior-f2ebbe','SASHIMONO'],
 ['back','cafe-customer-ca7e8e','SHOULDER BAG'],['back','teen-zombie-b5bb27','SLUNG SACK'],['back','holidaymaker-in-a-sun-2ba5e5','TOTE BAG'],
 ['righthand','groundskeeper-3e5578','BLOWER WAND'],['righthand','swimmer-in-a-wetsuit-9fca8f','BODYBOARD'],['righthand','commuter-381e7f','BRIEFCASE'],['righthand','kid-witch-01c770','BROOM'],
 ['righthand','el-catr-n-be48ea','CANE'],['righthand','team-mascot-abf426','CARRIED MASCOT HEAD'],['righthand','carving-chef-102bf5','CARVING KNIFE'],['righthand','diner-waitress-60f6a1','COFFEE POT'],
 ['righthand','merchant-6f606b','COIN POUCH'],['righthand','shunter-f25d24','COUPLING SHACKLE'],['righthand','chinchinero-2cc296','DRUMSTICK'],['righthand','la-catrina-b427ca','FAN'],
 ['righthand','firefighter-b13b36','FIRE AXE'],['righthand','fisherman-in-waders-6dc25e','FISHING ROD'],['righthand','parent-chaperone-79e535','FLASHLIGHT'],['righthand','dragon-slayer-91ab39','GLAIVE'],
 ['righthand','porter-e4e566','HAND TRUCK'],['righthand','china-cueca-dancer-c1707a','HANDKERCHIEF'],['righthand','hanga-roa-fisherman-e56812','HANDLINE REEL'],['righthand','standing-worker-on-a-8a0f9a','HANDSET'],
 ['righthand','motel-clerk-950c39','KEY FOB'],['righthand','platelayer-47dbe6','KEYING HAMMER'],['righthand','kite-kid-0a7d70','KITE SPOOL'],['righthand','trainspotter-ffd141','MARKER PEN'],
 ['righthand','armoured-knight-hero-07121f','MARSHALLING BATON'],['righthand','campfire-parent-b1c0d5','MARSHMALLOW STICK'],['righthand','buddhist-monk-39f498','MONK STAFF'],['righthand','engine-driver-1ba1e2','OIL FEEDER'],
 ['righthand','astronaut-engineer-20b738','OPEN SPANNER'],['righthand','referee-9e9e73','ORDER PAD'],['righthand','student-in-a-hoodie-7c8223','PAPER CUP'],['righthand','railway-carter-971897','PARCEL'],
 ['righthand','prospector-69a481','PICK'],['righthand','kid-in-a-black-2e5f87','PILLOWCASE'],['righthand','bench-researcher-d0f1b9','PIPETTE'],['righthand','station-master-1d6a0a','POCKET WATCH'],
 ['righthand','cheerleader-90875e','POM POM'],['righthand','village-gardener-9f7af6','PRODUCE BASKET'],['righthand','kid-in-a-bedsheet-f9c403','PUMPKIN PAIL'],['righthand','crossing-keeper-e13207','ROLLED FLAG'],
 ['righthand','flight-attendant-befaf4','ROLLER CASE'],['righthand','astronaut-scientist-47d733','SAMPLE TUBE'],['righthand','infantry-rifleman-c1c0a5','SERVICE RIFLE'],['righthand','street-vendor-139de3','SERVING TONGS'],
 ['righthand','guard-bfa819','SIGNAL FLAG'],['righthand','street-skater-4ee28b','SKATEBOARD'],['righthand','graffiti-artist-2deb3d','SPRAY CAN'],['righthand','field-medic-fd8919','STRETCHER'],
 ['righthand','astronaut-explorer-323482','SURVEY SCANNER'],['righthand','base-commander-0ec028','TABLET'],['righthand','surveyor-82e5c7','TOTAL STATION'],['righthand','tour-guide-1b0428','TOUR FLAG'],
 ['righthand','hiker-3d1a41','TREKKING POLE'],['righthand','ward-nurse-84b61d','TROLLEY'],['lefthand','squad-officer-e5c52b','BINOCULARS'],['lefthand','preacher-a49199','BOOK'],
 ['lefthand','skate-filmer-b9d393','CAMCORDER'],['lefthand','neighbour-handing-out-candy-2c1159','CANDY BOWL'],['lefthand','holidaymaker-in-a-sun-2ba5e5','CARRIED SANDALS'],['lefthand','chinchinero-2cc296','DRUMSTICK'],
 ['lefthand','signalman-c561d7','DUSTER'],['lefthand','shuttle-pilot-067166','FLIGHT HELMET'],['lefthand','village-gardener-9f7af6','GARDEN TROWEL'],['lefthand','parrilla-cook-255918','GRILL FORK'],
 ['lefthand','guard-bfa819','HAND LAMP'],['lefthand','flower-vendor-bc708b','MARIGOLD ARMFUL'],['lefthand','crane-banksman-3994e0','MARSHALLING BATON'],['lefthand','lounge-crooner-ad77ec','MICROPHONE'],
 ['lefthand','trainspotter-ffd141','NOTEBOOK'],['lefthand','commuter-381e7f','PAPER CUP'],['lefthand','kid-witch-01c770','PILLOWCASE'],['lefthand','construction-worker-c1ad8c','PLAN ROLL'],
 ['lefthand','cheerleader-90875e','POM POM'],['lefthand','fireman-96bf23','SHOVEL'],['lefthand','senior-scientist-631736','TABLET'],['lefthand','bench-researcher-d0f1b9','TEST TUBE'],
 ['lefthand','delivery-courier-327e30','TOOL CASE'],['lefthand','el-catr-n-be48ea','VELADORA']];
// Polyfork's own body regions (its culled()): which covers hide which part of the body
const REGIONS=[['trunk',['trunk','waist']],['pelvis',['waist','seat']],['briefs',['briefs']],['legs',['legs']],['feet',['feet']],['arms',['arms','hands']],['forearm',['upperArms','hands']],['upperArm',['upperArms','armCut']],['ears',['ears']],['eyes',['eyes']]];

// local copies with two hooks: __pfHook sees and changes the recipe; __pfForce sets what the body counts as covered, __pfSeen reads it
fs.mkdirSync(PATCHED,{recursive:true});
const mod=async id=>{ const out=path.join(PATCHED,id+'.mjs');
  if(!fs.existsSync(out)){ let t=fs.readFileSync(path.join(MODS,id+'.mjs'),'utf8'); const a='return createCharacter({', b='function culled(worn) {';
    if(!t.includes(a)||!t.includes(b))throw new Error('no hook point in '+id);
    t=t.replace(a,'return (globalThis.__pfHook||((f,c)=>f(c)))(createCharacter, {').replace(b,b+' if(globalThis.__pfForce)worn={covers:globalThis.__pfForce}; if(globalThis.__pfSeen)globalThis.__pfSeen(worn);');
    fs.writeFileSync(out,t); }
  return import(out); };
const params=id=>JSON.parse(fs.readFileSync(path.join(PF,'params',id+'.json'),'utf8')).params;
const recipeOf=async id=>{ const M=await mod(id); let cfg; globalThis.__pfHook=(f,c)=>{ cfg=c; return f(c); }; M.createAsset({}); globalThis.__pfHook=null; return cfg; };

// a zone a vertex belongs to: each palette key built in its own colour, read back
const lin=v=>{ v/=255; return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4); };
const zoneCols=keys=>keys.map((k,i)=>[20+(i%20)*11,20+Math.floor(i/20)*11]);
const hex=n=>'#'+(n>>>0).toString(16).padStart(6,'0');
// arms down (Polyfork builds in a T-pose): posed here on Polyfork's own skeleton and weights (its shoulder bone shares the turn), so on the rig's 15 bones,
// two a vertex, the arms hanging at your sides are close to rest and the shoulders and sleeves don't fold (owner, 5 Nov 2026: the torn shoulders)
const ARMS=[['LeftShoulder',-12],['LeftArm',-60],['RightShoulder',12],['RightArm',60]], ZA=new THREE.Vector3(0,0,1);
function armsDown(g){ g.updateMatrixWorld(true); const done=new Set();
  for(const [nm,deg] of ARMS){ let b=null; g.traverse(n=>{ if(n.isBone&&n.name===nm&&!b)b=n; }); if(!b||done.has(b))continue; done.add(b);
    const pq=new THREE.Quaternion(); b.parent.getWorldQuaternion(pq); const qw=new THREE.Quaternion().setFromAxisAngle(ZA,deg*Math.PI/180);
    b.quaternion.premultiply(pq.clone().invert().multiply(qw).multiply(pq)); b.updateMatrixWorld(true); }
  g.updateMatrixWorld(true); }
function make(id,M,o,wear,force){ const P=params(id), keys=Object.keys(M.palette||{}), ZC=zoneCols(keys), opts={...o}, base={...o};
  keys.forEach((k,i)=>opts[k]='#'+[ZC[i][0],ZC[i][1],0].map(x=>x.toString(16).padStart(2,'0')).join(''));
  if(P.expression||M.params&&M.params.expression){ opts.expression=base.expression='neutral'; }
  // (a kid's, an old one's or a goblin's garment is made for the grown body)
  const run=q=>{ let seen=null; globalThis.__pfHook=wear?((f,c)=>f({...c,...(c.age&&c.age!=='adult'?{age:'adult'}:{}),...(c.species&&c.species!=='human'?{species:'human'}:{}),wear})):null; globalThis.__pfForce=force||null; globalThis.__pfSeen=w=>{ if(w&&w.covers)seen=[...w.covers].sort(); };
    const g=M.createAsset(q); globalThis.__pfHook=globalThis.__pfForce=globalThis.__pfSeen=null; armsDown(g); return {g,seen}; };
  const {g,seen}=run(opts), real=run(base).g;   // (real: the same build in its own colours, for the parts no palette key paints)
  const ref=ZC.map(([r,gg])=>[lin(r),lin(gg)]), pal=keys.map(k=>hex(M.palette[k]));
  const zoneOf=(r,gg,b)=>{ if(b>0.002)return -1; let z=-1,bd=4e-6; ref.forEach(([a,c],i)=>{ const d=(a-r)**2+(c-gg)**2; if(d<bd){bd=d;z=i;} }); return z; };
  let head; g.traverse(n=>{ if(n.isBone&&n.name==='Head'&&!head)head=n; }); const hv=new THREE.Vector3(); head.getWorldPosition(hv);
  return {g,real,keys,pal,zoneOf,scale:1.52/hv.y,covers:seen||[]}; }
const meshOf=(B,name)=>{ let m=null; B.g.traverse(x=>{ if(x.isMesh&&x.name===name)m=x; }); return m; };
function dump(B,m,boneNames){ const G=m.geometry, p=G.attributes.position, c=G.attributes.color, si=G.attributes.skinIndex, sw=G.attributes.skinWeight, ix=G.index, n=p.count, s=B.scale;
  let rm=null; B.real.traverse(x=>{ if(x.isMesh&&x.name===m.name)rm=x; }); const rc=rm.geometry.attributes.color; if(rc.count!==n)throw new Error('builds differ: '+m.name);
  const zid=new Map(), zones=[], pal=[], Z=new Uint8Array(n), P=new Float32Array(n*3), J=new Uint8Array(n*4), W=new Float32Array(n*4);
  const zoneKey=i=>{ const z=B.zoneOf(c.getX(i),c.getY(i),c.getZ(i)); if(z>=0)return [B.keys[z],B.pal[z]];
    const h='#'+[rc.getX(i),rc.getY(i),rc.getZ(i)].map(v=>Math.round(Math.pow(v,1/2.2)*255).toString(16).padStart(2,'0')).join(''); return ['='+h,h]; };
  const V=new THREE.Vector3();
  for(let i=0;i<n;i++){ V.fromBufferAttribute(p,i); if(m.isSkinnedMesh)m.applyBoneTransform(i,V); P[i*3]=V.x*s; P[i*3+1]=V.y*s; P[i*3+2]=V.z*s; const [k,h]=zoneKey(i); if(!zid.has(k)){ zid.set(k,zones.length); zones.push(k); pal.push(h); } Z[i]=zid.get(k);
    for(let q=0;q<4;q++){ const b=m.skeleton.bones[si.getComponent(i,q)].name, j=boneNames.indexOf(b); J[i*4+q]=j<0?0:j; W[i*4+q]=j<0?0:sw.getComponent(i,q); } }
  const F=ix?Array.from(ix.array):Array.from({length:n},(_,i)=>i);
  return {P:Array.from(P,v=>+v.toFixed(5)),F,J:Array.from(J),W:Array.from(W,v=>+v.toFixed(4)),Z:Array.from(Z),zones,pal}; }
const triKeys=m=>{ const p=m.geometry.attributes.position, ix=m.geometry.index, n=ix?ix.count:p.count, k=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e5)).join(','), L=[];
  for(let f=0;f<n;f+=3)L.push([0,1,2].map(j=>k(ix?ix.getX(f+j):f+j)).sort().join('|')); return L; };

const out={base:BASE,builds:BUILDS,regions:REGIONS.map(r=>r[0]),figs:{},pieces:[]};
const BM=await mod(BASE);
for(const [f,fig] of Object.entries(FIGS)){ out.figs[f]={bodies:[]};
  for(const build of BUILDS){ const B=build_(BM,fig,build,{}), m=meshOf(B,'body');
    if(!out.figs[f].bones){ const names=m.skeleton.bones.map(b=>b.name), v=new THREE.Vector3(); out.figs[f].bones={names,world:m.skeleton.bones.map(b=>{ b.getWorldPosition(v); return v.toArray().map(x=>+(x*B.scale).toFixed(5)); })}; }
    const d=dump(B,m,out.figs[f].bones.names), all=triKeys(m), reg=new Array(all.length).fill(255);
    REGIONS.forEach(([nm,cov],ri)=>{ const R=build_(BM,fig,build,{},new Set(cov)), keep=new Set(triKeys(meshOf(R,'body'))); all.forEach((t,i)=>{ if(reg[i]===255&&!keep.has(t))reg[i]=ri; }); });
    d.region=reg; out.figs[f].bodies.push(d); } }
function build_(M,fig,build,wear,force){ return make(BASE,M,{figure:fig,build},wear,force); }

for(const [slot,src,label] of WARDROBE){ const M=await mod(src), cfg=await recipeOf(src), w=cfg.wear[slot]; if(!w)throw new Error(src+' has no '+slot);
  const piece={slot,src,label,name:typeof w==='string'?w:w.name,v:{}}; let alt=null;
  if(slot==='hair'){ const hc=(await recipeOf(HAT_FOR_HAIR[1])).wear.hat; alt={hat:hc}; }
  if(slot==='top'){ const cc=(await recipeOf(COAT_FOR_TOP[1])).wear.coat; alt={coat:cc}; }
  if(alt)piece.alt={};
  for(const [f,fig] of Object.entries(FIGS)){ piece.v[f]=[]; if(alt)piece.alt[f]=[];
    for(const build of BUILDS){ const B=make(src,M,{figure:fig,build},{[slot]:w}), m=meshOf(B,'attach-'+slot+'-mesh');
      if(!m){ piece.v[f].push(null); if(alt)piece.alt[f].push(null); continue; }
      piece.covers=B.covers; piece.v[f].push(dump(B,m,out.figs[f].bones.names));
      if(alt){ const A=make(src,M,{figure:fig,build},{[slot]:w,...alt}), am=meshOf(A,'attach-'+slot+'-mesh'); piece.alt[f].push(am?dump(A,am,out.figs[f].bones.names):null); } } }
  out.pieces.push(piece); process.stdout.write(slot+':'+label+' '); }
fs.writeFileSync(path.join(PF,'avatar-raw.json'),JSON.stringify(out)); console.log('\n',out.pieces.length,'pieces');
