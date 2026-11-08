// WILD: the park's creatures in your journal: double click one to watch it (binoculars from afar); a few quiet seconds log it on the WILDLIFE page and train its skill; the first of each kind and the full page pay.
import {THREE} from './003-shx.js';
import {FORAGE, INV, pos, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
import {CREATS} from './087-npc-creatures.js';
const WILD={}; window.WILD=WILD;
{ const T=TILE, say=(t,c)=>SAY(t,c||'#e8e2cc'), KEY='wild';
  const SP={
    crow:['AMERICAN CROW','Corvus brachyrhynchos','bird',10,0],owl:['GREAT HORNED OWL','Bubo virginianus','bird',45,15],duck:['MALLARD','Anas platyrhynchos','bird',5,0],
    bee:['HONEYBEE','Apis mellifera','ento',10,0],bumblebee:['BUMBLEBEE','Bombus impatiens','ento',15,0]};
  const KS=()=>Object.keys(SP), FULL=50, NEED=5;
  const S={v:1,seen:{},paid:0}; try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1)Object.assign(S,D); }catch(e){} const save=()=>{ try{ OWNED.set(KEY,JSON.stringify(S)); }catch(e){} };
  const kindOf=N=>String(N.key).replace(/#\d+$/,'').replace(/\d+$/,'');
  const binoc=()=>!!FORAGE.has('binoc'), WR0=3.5*T, WR1=9*T; let WS=null, lx=0, lz=0, spd=0;
  const log=k=>{ '@later'; const first=!S.seen[k]; S.seen[k]=(S.seen[k]||0)+1; const q=SP[k];
    if(first){ say(`NEW IN YOUR JOURNAL: ${q[0]} (${q[1].toUpperCase()}).`,'#c8b0ff'); if(q[4]){ INV.cash+=q[4]; say(`THE PARK'S WILDLIFE COUNT PAYS $${q[4]} FOR THE FIRST SIGHTING.`,'#f2c14e'); }
      if(!S.paid&&KS().every(j=>S.seen[j])){ S.paid=1; INV.cash+=FULL; say(`YOUR WILDLIFE PAGE IS FULL. THE PARK PAYS $${FULL}.`,'#f2c14e'); } }
    else say(`YOU WATCH THE ${q[0]} A WHILE.`,'#e8e2cc'); save(); FORAGE.draw&&FORAGE.draw(); };
  const watch=N=>{ '@later'; const k=kindOf(N), q=SP[k]; if(!q||!N.body.visible)return; const d=Math.hypot(N.st.x-pos.x,N.st.z-pos.z), WR=binoc()?WR1:WR0;
    if(d>WR){ say(binoc()?'IT IS TOO FAR OFF.':'IT IS TOO FAR OFF. GO NEARER, OR BRING BINOCULARS.','#c8a090'); return; }
    WS={N,k,t:0}; say(`YOU STAND STILL AND WATCH THE ${q[0].replace(/^THE /,'')}.`,'#9fe07f'); };
  WILD.watching=()=>WS&&{k:WS.k,t:+WS.t.toFixed(1)}; WILD.ff=s=>{ if(WS)WS.t+=s; }; WILD.seen=k=>S.seen[k]||0; WILD.SP=SP; WILD.watch=watch; WILD.log=log; WILD.add=(k,q)=>{ SP[k]=q; };
  const HBS=[]; const tick=dt=>{ if(!dt)return; things(); for(const [N,hb] of HBS)hb.visible=N.body.visible; const mv=Math.hypot(pos.x-lx,pos.z-lz); spd=spd*.8+mv/dt*.2; lx=pos.x; lz=pos.z; if(!WS)return;
    const N=WS.N, d=Math.hypot(N.st.x-pos.x,N.st.z-pos.z), WR=binoc()?WR1:WR0;
    if(!N.body.visible||d>WR){ say(N.body.visible?'YOU LOSE SIGHT OF IT.':'IT IS GONE.','#c8a090'); WS=null; return; }
    if(spd>1.2*T){ say('YOU MOVE AND IT IS LOST TO YOU.','#c8a090'); WS=null; return; }
    WS.t+=dt*(spd<.3*T?1:.4); if(WS.t>=NEED){ const q=SP[WS.k]; FORAGE.use(q[2],q[3]-25,q[3]+25,spd<.1*T?5:0); log(WS.k); WS=null; } };
  SYS.add('life',tick,'144f-wild');
  const HB=new THREE.BoxGeometry(.5*T,.4*T,.5*T), HM=new THREE.MeshBasicMaterial({visible:false});
  const DONE=new Set(); let seenN=0; const things=()=>{ if(CREATS.length===seenN)return; seenN=CREATS.length; for(const N of CREATS){ if(DONE.has(N))continue; DONE.add(N); const k=kindOf(N); if(!SP[k])continue; const hb=new THREE.Mesh(HB,HM); hb.position.y=Math.min(N.H*.5,.6*T)+.05*T; N.g.add(hb); HBS.push([N,hb]);
    UI.thing({name:'A '+SP[k][0].replace(/^THE /,''),obj:hb,reach:N.ex?2*T:2.6*T,near:3*T,tall:.3*T,act:()=>watch(N)}); } };
  FORAGE.BOOK.push({id:'wild',title:'WILDLIFE',rows:()=>KS().map(k=>[SP[k][0],!!S.seen[k],S.seen[k]?'SEEN '+S.seen[k]+' · '+SP[k][1].toUpperCase():'',SP[k][4]>0]),
    foot:`Double click a creature and keep still to watch it; binoculars watch from afar. Owls by night, ducks on the lake, bees among the flowers. A full page pays $${FULL}.`});
  FORAGE.HELP.push('WILDLIFE: double click a park creature and keep still a few seconds to log it in your journal (it trains its skill: bees ENTOMOLOGY, birds BIRDING).');
  window.WILDDBG=()=>({seen:S.seen,paid:S.paid,watching:WILD.watching(),spd:+(spd/T).toFixed(2),things:CREATS.length}); }
export {WILD};
