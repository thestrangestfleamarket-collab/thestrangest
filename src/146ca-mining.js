// THE MINING: MINING seeds each cavern's finds by the calendar day, shows the ones your prospecting can spot, and lets you work them free with the cutter; the golems buy them all.
import {SHARED, THREE} from './003-shx.js';
import {CITY, FORAGE, INSPECT, INV, MAIL, MOTION, pos, SFX, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {TILE, ZU} from './006-map-pre.js';
import {CAVERNS} from './066a-caverns.js';
import {KIT} from './068-kit.js';
import {GEMS} from './101-gems.js';
const MINING={live:[]}; window.MINING=MINING;
{ const T=TILE, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, Y=SHARED.BOD.YS, day=()=>window.MAIL&&MAIL.ready?MAIL.day():window.CITY?CITY.day||0:0; CAVERNS.day=day;
  const hs=(a,b,c=0)=>{ const s=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return s-Math.floor(s); }, say=(t,c)=>{ SAY(t,c); };
  // each zone's finds: [id, NAME, price, weight, prospecting to spot it, colour]; the gem cave holds the golems' ten stones
  const FINDS={gemcave:GEMS.slice(0,10).map((g,i)=>[g[0],g[1],g[2],g[3],i*9,[0xb0c8ff,0xc080ff,0xd0b090,0xffb060,0xe0f0ff,0xff90d0,0x60ff90,0x6090ff,0xff5050,0xffffff][i]]),
    hudson:[['pearl','RIVER PEARL',12,30,0,0xf0ecff],['seaglass','SEA GLASS',6,34,0,0x8fe3d6],['coral','RED CORAL',22,18,15,0xff6a5a],['nacre','NACRE SHELL',30,12,30,0xe8d8ff],['aquamarine','AQUAMARINE',70,7,45,0x60d0ff],['blackpearl','BLACK PEARL',110,4,55,0x2a2a3a]],
    lake:[['jade','JADE',26,22,0,0x60c080],['amber','LAKE AMBER',18,26,0,0xffb040],['silver','SILVER ORE',38,14,20,0xd0d8e0],['goldnug','GOLD NUGGET',60,10,30,0xffd040],['garnet','GARNET',48,9,40,0xa02040],['platinum','PLATINUM ORE',140,3,65,0xe8f0f8]]};
  const CUTM={ruby:['ruby'],garnet:['ruby'],emerald:['emerald'],jade:['emerald'],amethyst:['amethyst'],sapphire:['diamond'],quartz:['diamond'],moonstone:['diamond'],aquamarine:['diamond'],opal:['amethyst']};
  INSPECT.kinds.push({is:id=>/^cut_/.test(id)&&CUTM[id.slice(4)],make:id=>KIT.piece(CUTM[id.slice(4)][0],.2)});
  INSPECT.kinds.push({is:id=>Object.values(FINDS).some(F=>F.some(f=>f[0]===id)),make:id=>{ let f=null; for(const F of Object.values(FINDS))f=f||F.find(q=>q[0]===id); const c=f[5];
    const P=INSPECT.part;
    if(/pearl/.test(id)){ const g=new THREE.Group(); g.add(P('sph',c,0,0,0,.09,.09,.09,0,0,0,{kind:'wax'})); return g; }
    if(id==='seaglass'){ const g=new THREE.Group(); g.add(P('ico',c,0,0,0,.1,.08,.06,0,0,0,{kind:'glass'})); return g; }
    if(/ore|nug|platinum|silver|goldnug/.test(id)){ const g=new THREE.Group(); for(let i=0;i<5;i++){ const a=i*1.4; g.add(P('ico',c,Math.cos(a)*.04,i*.02-.03,Math.sin(a)*.04,.05,.045,.05,0,0,0,{kind:'metal',metal:1,rough:.45,flat:1})); } return g; }
    if(/geode|meteor|coral|nacre|jade/.test(id)){ const g=new THREE.Group(); g.add(P('ball',c,0,0,0,.1,.09,.1,0,0,0,{kind:'rock'})); return g; }
    const g=new THREE.Group(); g.add(P('oct',c,0,0,0,.078,.19,.078,0,0,0,{kind:'gem'})); g.add(P('oct',c,.02,.03,.02,.05,.12,.05,.15,.5,0,{kind:'gem'})); return g; }});
  for(const k in FINDS)if(k!=='gemcave')for(const f of FINDS[k])GEMS.push([f[0],f[1],f[2],0]);   // the golems buy every find; weight 0 keeps them out of the old cave glints
  // what you have found (the book), stones you can cut on a gem wheel (PROSPECTING) for twice and more, the museum's thanks for the first of each, the Fixer's ore
  const ALL=Object.values(FINDS).flat(), CUT=ALL.filter(f=>!/pearl|seaglass|ore|nug|geode|shell/.test(f[0]+' '+f[1].toLowerCase())), LOG={v:1,got:{}};
  try{ const D=JSON.parse(OWNED.get('finds')||'null'); if(D&&D.v===1)Object.assign(LOG,D); }catch(e){} const saveLog=()=>{ try{ OWNED.set('finds',JSON.stringify(LOG)); }catch(e){} };
  FORAGE.add({names:{gem_wheel:'A GEM WHEEL',...Object.fromEntries(CUT.map(f=>['cut_'+f[0],'CUT '+f[1]]))},prices:Object.fromEntries(CUT.map(f=>['cut_'+f[0],Math.round(f[2]*2.2)])),
    recipes:CUT.map(f=>['cut_'+f[0],'CUT '+f[1],'prosp',[f[4]-10,f[4]+45],{[f[0]]:1},'sells for $'+Math.round(f[2]*2.2)])});
  for(const f of CUT)GEMS.push(['cut_'+f[0],'CUT '+f[1],Math.round(f[2]*2.2),0]);
  FORAGE.CK.prosp={short:'CUT',need:()=>FORAGE.has('gem_wheel')?null:'YOU NEED A GEM WHEEL (THE SHARK SELLS THEM).',made:nm=>`YOU GRIND AND POLISH IT: ${nm}.`,fail:'IT CRACKS ON THE WHEEL. THE STONE IS LOST.'};
  FORAGE.GIFTS.push({is:id=>ALL.some(f=>f[0]===id||'cut_'+f[0]===id),place:'museum',key:id=>id.replace(/^cut_/,''),pay:id=>{ const f=ALL.find(q=>q[0]===id.replace(/^cut_/,'')); return f[2]*(id.startsWith('cut_')?3:2); }});
  FORAGE.BUYK.ore=['silver','goldnug','platinum'];
  FORAGE.BOOK.push({id:'finds',title:'FINDS',rows:()=>ALL.map(f=>[f[1],!!LOG.got[f[0]],LOG.got[f[0]]?'FOUND '+LOG.got[f[0]]+(FORAGE.gave('museum',f[0])?' · IN THE MUSEUM':''):'',f[4]>=45]),foot:'The gem cave, the Hudson\'s bed and the lake\'s bed each hold their own finds; the rarer ones lie further in, and only a keen prospector spots them.'});
  MINING.log=LOG;
  const ORE=new THREE.MeshLambertMaterial({vertexColors:true,emissive:0x3a3a40}), YS=ZU*24/T;
  CAVERNS.hooks.push((C,G,m)=>{ '@later'; MINING.live=[]; const F=FINDS[C.id]; if(!F)return; const B=C.lot, d=day(), n=10+Math.floor(hs(d,1)*6), sk=FORAGE.sk?FORAGE.sk('prosp'):0, fy=C.api.ground(0,0), W=F.reduce((a,f)=>a+f[3],0);
    for(let i=0;i<n;i++){ const gx=B.x0+1.5+hs(d,i,2)*(B.x1-B.x0-3), gy=B.y0+1.5+hs(d,i,3)*(B.y1-B.y0-3), deep=(gx-B.x0)/(B.x1-B.x0); if(C.api.solidAt&&C.api.solidAt(gx,gy))continue;   // further in, the rarer finds; none inside a wall
      let r=hs(d,i,4)*Math.pow(deep+.2,1.5)*W, f=F[0]; for(const q of F){ if((r-=q[3])<0){ f=q; break; } }
      const key=C.id+':'+d+':'+i; if(!INV.ready(key))continue; const seen=f[4]<=sk+15;   // what your prospecting can spot; the scanner shows the rest for a while
      let cr; if(C.id==='hudson'){ cr=new THREE.Mesh(new THREE.OctahedronGeometry(.5,0),new THREE.MeshBasicMaterial({color:f[5]})); cr.position.set(X(gx),fy+Y(3),Z(gy)); cr.scale.set(.16*T,.34*T,.16*T); cr.rotation.set(.3,i,.2); }
      else { const ore=/ore|nug/.test(f[1].toLowerCase()), g=KIT.geo(ore?'copper':/emerald|jade/.test(f[0])?'emeraldore':'diamondore'), bb=g.boundingBox||(g.computeBoundingBox(),g.boundingBox), s=.75*T/(bb.max.x-bb.min.x);
        cr=new THREE.Mesh(g,ORE); cr.position.set(X(gx),fy,Z(gy)); cr.scale.set(s,s*YS,s); cr.rotation.y=i*2.4; }
      cr.visible=seen; G.add(cr); m.objs.push(cr);
      const hb=new THREE.Mesh(new THREE.BoxGeometry(.7*T,Y(14),.7*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(gx),fy+Y(7),Z(gy)); hb.visible=seen; G.add(hb); m.objs.push(hb);
      const R={cr,hb,f,key,seen,gone:false}; R.pick=()=>{ if(R.gone||!INV.ready(key))return false; R.gone=true; cr.visible=hb.visible=false;
        if(FORAGE.use&&!FORAGE.use('prosp',f[4]-20,f[4]+30)){ say('IT CRUMBLES AS YOU WORK IT FREE.','#c8a090'); return false; }
        INV.picked[key]=d; INV.add(f[0],1); LOG.got[f[0]]=(LOG.got[f[0]]||0)+1; saveLog(); SFX.play('chirp',{vol:.4}); say('YOU FIND '+(/^[AEIOU]/.test(f[1])?'AN ':'A ')+f[1]+' · THE GOLEMS PAY $'+f[2],'#f2c14e'); return true; };
      R.th={name:'A GLINT',obj:hb,reach:.9*T,near:1.8*T,tall:Y(20),act:()=>{ if(!FORAGE.has('cutter')){ say('YOU NEED A CUTTER BEAM TO WORK IT FREE.','#c8a090'); return; } MOTION.play('mine'); R.pick(); }};
      UI.thing(R.th); m.things.push(R.th); MINING.live.push(R); } });
  MINING.scan=()=>{ let n=0; for(const R of MINING.live)if(!R.gone&&!R.hb.visible){ R.hb.visible=R.cr.visible=true; n++; } if(n)setTimeout(()=>{ for(const R of MINING.live)if(!R.gone&&!R.seen)R.hb.visible=R.cr.visible=false; },60000); return n; };
  MINING.extract=()=>{ let n=0; for(const R of MINING.live.slice())if(!R.gone&&R.hb.visible&&Math.hypot(R.hb.position.x-pos.x,R.hb.position.z-pos.z)<6*T&&R.pick())n++; return n; };
  window.MININGDBG=()=>({day:day(),zones:Object.keys(FINDS),live:MINING.live.length,seen:MINING.live.filter(R=>!R.gone&&R.hb.visible).length}); }
export {MINING};
