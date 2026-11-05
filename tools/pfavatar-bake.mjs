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
 ['hands','astronaut-explorer-323482','WORK GLOVES'],['hands','referee-9e9e73','WRISTWATCH']];
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
function make(id,M,o,wear,force){ const P=params(id), keys=Object.keys(M.palette||{}), ZC=zoneCols(keys), opts={...o}, base={...o};
  keys.forEach((k,i)=>opts[k]='#'+[ZC[i][0],ZC[i][1],0].map(x=>x.toString(16).padStart(2,'0')).join(''));
  if(P.expression||M.params&&M.params.expression){ opts.expression=base.expression='neutral'; }
  const run=q=>{ let seen=null; globalThis.__pfHook=wear?((f,c)=>f({...c,wear})):null; globalThis.__pfForce=force||null; globalThis.__pfSeen=w=>{ if(w&&w.covers)seen=[...w.covers].sort(); };
    const g=M.createAsset(q); globalThis.__pfHook=globalThis.__pfForce=globalThis.__pfSeen=null; g.updateMatrixWorld(true); return {g,seen}; };
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
  for(let i=0;i<n;i++){ P[i*3]=p.getX(i)*s; P[i*3+1]=p.getY(i)*s; P[i*3+2]=p.getZ(i)*s; const [k,h]=zoneKey(i); if(!zid.has(k)){ zid.set(k,zones.length); zones.push(k); pal.push(h); } Z[i]=zid.get(k);
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
