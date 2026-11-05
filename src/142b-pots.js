// THE CRAB POTS: POTS lets you drop a crab pot in fishable water and haul it up later (real time) for what crawled in; your pots are kept with your other owned things.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, ITEMS, ONLINE, pos, SFX, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
import {RIVER} from './066-river.js';
import {FISHING} from './142-fishing.js';
const POTS={list:[],hold:[]}; window.POTS=POTS;
{ const T=TILE, KEY='pots', MAX=3, SLOT=8, BAITED=4, CAP=4, JUNK=[['x_boot',.08],['x_can',.07]];   // a catch every SLOT minutes (BAITED with cut bait), up to CAP a pot
  const say=(m,c)=>SAY(m,c), IP=(id,k)=>ITEMS.prop(id,k);
  const load=()=>{ try{ const a=JSON.parse(OWNED.get(KEY)||'[]'); return Array.isArray(a)?a.filter(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.z)):[]; }catch(e){ return []; } };
  const save=()=>OWNED.set(KEY,JSON.stringify(POTS.list.map(p=>({x:+p.x.toFixed(3),z:+p.z.toFixed(3),t:p.t,b:p.b}))));
  const orange=new THREE.MeshLambertMaterial({color:0xe8702a,side:THREE.DoubleSide}), white=new THREE.MeshLambertMaterial({color:0xf0ece2}), pole=new THREE.MeshLambertMaterial({color:0x2a2c30});
  const BG=new THREE.SphereGeometry(.22*T,8,6), BP=new THREE.CylinderGeometry(.025*T,.025*T,.8*T,4), BF=new THREE.PlaneGeometry(.3*T,.18*T), HIT=new THREE.MeshBasicMaterial({visible:false}), HG=new THREE.BoxGeometry(.6*T,.6*T,.6*T);
  const buoy=p=>{ '@later'; const g=new THREE.Group(), b=new THREE.Mesh(BG,orange), w=new THREE.Mesh(BG,white), s=new THREE.Mesh(BP,pole), f=new THREE.Mesh(BF,orange), h=new THREE.Mesh(HG,HIT);
    w.scale.set(1.02,.45,1.02); w.position.y=.07*T; s.position.y=.5*T; f.position.set(.15*T,.8*T,0); h.position.y=.2*T; g.add(b,w,s,f,h); g.userData.hit=h; scene.add(g); p.g=g;
    p.th=p.who?{name:p.who+"'S CRAB POT",obj:h,reach:5*T,near:6*T,tall:.6*T,act:()=>say(`${p.who}'S POT. IT IS NOT YOURS TO HAUL.`,'#c8c2b0')}:{name:'CRAB POT',obj:h,reach:5*T,near:6*T,tall:.6*T,act:()=>POTS.haul(p)}; UI.thing(p.th); return g; };
  // your pots go to the section (the server keeps them while you are away); other players' buoys float where they dropped them
  const share=()=>{ if(ONLINE.on&&ONLINE.send)ONLINE.send({t:'puts',k:'pot',list:POTS.list.map(p=>[+p.x.toFixed(2),0,+p.z.toFixed(2),p.b?1:0])}); };
  const THEIRS=new Map(); POTS.theirs=THEIRS; let ready=false;
  const theirs=(id,name,list)=>{ '@later'; for(const p of THEIRS.get(id)||[])unbuoy(p); THEIRS.delete(id); if(!id||id===ONLINE.me||!Array.isArray(list)||!list.length)return;
    const L=list.map(a=>({x:+a[0],z:+a[2],who:String(name||'A NEIGHBOUR').toUpperCase()})).filter(p=>isFinite(p.x)&&isFinite(p.z)); if(ready)for(const p of L)buoy(p); THEIRS.set(id,L); };
  ONLINE.puts.pot={set:theirs,clear:()=>{ for(const id of [...THEIRS.keys()])theirs(id); },share};
  const unbuoy=p=>{ if(!p.g)return; scene.remove(p.g); const i=UI.things.indexOf(p.th); if(i>=0)UI.things.splice(i,1); p.g=null; };
  const level=(w,x,z)=>w.lv+(w.kind==='river'&&RIVER.hAt?RIVER.hAt(x,z):0);
  // the water just ahead of you, 2 to 4 tiles out
  const spot=()=>{ if(!FISHING.at)return null; const h=SHARED.heading; for(const d of [3,2.5,3.5,2,4]){ const x=pos.x+Math.sin(h)*d*T, z=pos.z+Math.cos(h)*d*T, w=FISHING.at(x,z); if(w)return {x,z,w}; } return null; };
  POTS.drop=()=>{ '@later'; if(!FORAGE.has('crabpot'))return say('YOU HAVE NO CRAB POT. BAIT & BOATS SELLS THEM.','#c8a090'); if(POTS.list.length>=MAX)return say('YOU ALREADY HAVE THREE POTS OUT.','#c8a090');
    const s=spot(); if(!s)return say('FACE OPEN WATER TO DROP A POT.','#c8a090'); if(POTS.list.some(p=>Math.hypot(p.x-s.x,p.z-s.z)<1.5*T))return say('A POT IS ALREADY THERE.','#c8a090');
    const b=FORAGE.has('bait_cut')?1:0; if(b)FORAGE.take('bait_cut',1); FORAGE.take('crabpot',1); const p={x:s.x,z:s.z,t:Date.now(),b}; POTS.list.push(p); buoy(p); save(); share(); FORAGE.draw();
    SFX.play('drip',{vol:.5,pitch:.6}); say(b?'YOU BAIT THE POT WITH BUNKER AND DROP IT IN. COME BACK LATER TO HAUL IT UP.':'YOU DROP THE POT IN, UNBAITED. COME BACK LATER TO HAUL IT UP.','#8fe3d6'); return p; };
  // what crawled in while you were away: a roll every SLOT (or BAITED) minutes, each from the water's potted kinds by how common, the bait they like doubled
  POTS.roll=(p,w,now=Date.now())=>{ '@later'; const n=Math.min(CAP,Math.floor((now-p.t)/60000/(p.b?BAITED:SLOT))), out=[], L=[];
    for(const id of ITEMS.ids())if(IP(id,'potted')&&IP(id,'water')===w.kind&&(+IP(id,'depth')||0)<=w.depth){ const c=(+IP(id,'common')||0)*(p.b&&IP(id,'bait')==='cut'?2:1); if(c>0)L.push([id,c]); }
    if(w.kind==='river')for(const j of JUNK)L.push([j[0],j[1]*(L.reduce((a,q)=>a+q[1],0)||1)]);
    const sum=L.reduce((a,q)=>a+q[1],0); for(let i=0;i<n&&sum>0;i++){ if(Math.random()>.75)continue; let r=Math.random()*sum; for(const [id,c] of L)if((r-=c)<0){ out.push(id); break; } } return out; };
  POTS.haul=p=>{ '@later'; if(Math.hypot(p.x-pos.x,p.z-pos.z)>6*T)return say('GET CLOSER TO HAUL THE POT.','#c8a090'); const w=FISHING.at&&FISHING.at(p.x,p.z)||{kind:'river',depth:3,lv:0};
    const got=POTS.roll(p,w), kept={}, freed=[]; for(const id of got){ const fish=!!IP(id,'water'); if(fish&&FISHING.held&&FISHING.held()>=FISHING.room()){ freed.push(id); continue; } FORAGE.give(id); kept[id]=(kept[id]||0)+1; }
    POTS.list.splice(POTS.list.indexOf(p),1); unbuoy(p); FORAGE.give('crabpot'); save(); share(); FORAGE.draw(); SFX.play('drip',{vol:.6,pitch:.9});
    const txt=Object.entries(kept).map(([id,n])=>n+' '+(FORAGE.NM[id]||id)).join(', '); POTS.last={got,kept,freed};
    say(got.length?`YOU HAUL UP THE POT: ${txt||'NOTHING YOU CAN CARRY'}.${freed.length?' NO ROOM FOR '+freed.length+' MORE, SO THEY GO BACK.':''}`:(Date.now()-p.t<60000*(p.b?BAITED:SLOT)?'YOU HAUL UP THE POT. TOO SOON: NOTHING HAS CRAWLED IN YET.':'YOU HAUL UP THE POT. EMPTY.'),got.length?'#b8f0a0':'#c8c2b0'); };
  FORAGE.ROWB.push(id=>id==='crabpot'?[['DROP IN THE WATER','potdrop']]:[]); FORAGE.ACT.potdrop=()=>POTS.drop();
  // your pots float where you left them once the water there is built; each buoy bobs on the swell while you are near
  let tt=0;
  SYS.add('life',dt=>{ if(!ready){ if(!FISHING.at)return; ready=true; POTS.list=load(); for(const p of POTS.list)buoy(p); for(const L of THEIRS.values())for(const p of L)buoy(p); share(); }
    if((tt+=dt||0)<.1)return; tt=0; const now=performance.now()/1000;
    const all=[...POTS.list]; for(const L of THEIRS.values())for(const p of L){ if(ONLINE.on)all.push(p); else if(p.g)p.g.visible=false; }
    for(const p of all){ if(!p.g)continue; const on=SHARED.LVL==='up'&&Math.hypot(p.x-pos.x,p.z-pos.z)<60*T; p.g.visible=on; if(!on)continue; const w=FISHING.at(p.x,p.z);
      p.g.position.set(p.x,(w?level(w,p.x,p.z):0)+Math.sin(now*1.6+p.x)*.02*T,p.z); p.g.rotation.set(Math.sin(now*1.1+p.z)*.08,0,Math.cos(now*1.3+p.x)*.08); } },'142b-pots'); }
