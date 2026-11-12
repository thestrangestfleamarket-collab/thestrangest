// THE PHOTOGRAPHER: PHOTOGRAPHY, a skill and a living: the camera knows the subject in its frame (a bird, a butterfly, a park creature, a dungeon monster, a golem, a townsperson); a print is worth more the rarer the subject, the higher or deeper the spot, the nearer the danger, the sharper and fuller the frame and the better the photographer, and less for the same kind again that day; the rangers and the Professor buy them; taking and selling them trains the skill.
import {SHARED, THREE} from './003-shx.js';
import {BIRDS, FORAGE, ITEMS, NPCS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {MODS, TILE} from './006-map-pre.js';
import {RARITY} from './013a-rarity.js';
import {CREATS} from './087-npc-creatures.js';
import {BFLY} from './143-bfly.js';
import {TREES} from './144e-trees.js';
import {WILD} from './144f-wild.js';
import {GOLEMS} from './146e-golems.js';
import {BREAK} from './146k-breakout.js';
import {PHOTOS} from './146m-prints.js';
const PHOTOG={}; window.PHOTOG=PHOTOG;
{ const T=TILE, M=T/.84, V=new THREE.Vector3(), W=new THREE.Vector3(), ray=new THREE.Raycaster(), cl=(v,a,b)=>v<a?a:v>b?b:v, KEY='photog';
  const TK={c:1,r:2.5,s:6,common:1,rare:2.5,super:6}, TN=RARITY.NAMES, tOf=t=>({common:'c',rare:'r',super:'s'}[t]||t||'c');
  const DANGER={wolf:1,bear:1.5,snake:.5,wasp:.5,owl:.2,bat:.2};
  const S={v:1,day:'',n:{},kinds:{}}; try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1)Object.assign(S,D); }catch(e){} const save=()=>{ try{ OWNED.set(KEY,JSON.stringify(S)); }catch(e){} };
  const val=(id,d)=>+ITEMS.prop(id,'value')||d, wp=g=>{ g.getWorldPosition(W); return W; }, kindOf=N=>String(N.key).replace(/#\d+$/,'').replace(/\d+$/,'');
  // everything the camera can name: {p (world), r (its size), name, kind, base ($), tier, danger}
  const subjects=()=>{ const L=[], BFK=SHARED.BOD.STOREK.bf.BF_KINDS;
    for(const b of BIRDS.list||[]){ const id='bd_'+b.k; L.push({p:new THREE.Vector3(b.x,b.y+.1*T,b.z),r:.12*M,name:BIRDS.K[b.k][0],kind:id,base:val(id,4)/TK[BIRDS.TIER(b.k)],tier:BIRDS.TIER(b.k)}); }
    for(const b of (BFLY.list&&BFLY.list())||[]){ if(!b.g||!b.g.visible)continue; const id='b_'+b.k; L.push({p:wp(b.g).clone(),r:.06*M,name:String(BFK[b.k][0]).toUpperCase(),kind:id,base:val(id,3)/TK[tOf(ITEMS.prop(id,'tier'))],tier:tOf(ITEMS.prop(id,'tier'))}); }
    for(const N of CREATS){ if(!N.g||!N.body||!N.body.visible)continue; const k=kindOf(N), q=WILD.SP[k]; if(!q)continue; const p=wp(N.g).clone(); p.y+=.25*T;
      L.push({p,r:(k==='bear'||k==='deer'||k==='wolf'?.6:.2)*M,name:q[0],kind:'w_'+k,base:2+q[3]/5,tier:q[3]>=45?'s':q[3]>=30?'r':'c',danger:DANGER[k]||0}); }
    const DM=MODS.dunmobs; if(DM&&SHARED.LVL==='down'){ for(const s of DM.slimes||[])if(!s.dead&&!s.gone)L.push({p:new THREE.Vector3(s.x,(SHARED.py||0)+(s.h||0)+.2*T,s.z),r:.3*M,name:String(s.k).toUpperCase()+' SLIME',kind:'d_slime_'+s.k,base:10,tier:'r',danger:1});
      for(const r of DM.res||[])if(r.on&&!r.dead&&r.N&&r.N.g){ const p=wp(r.N.g).clone(); p.y+=.8*T; L.push({p,r:.5*M,name:String(r.N.name||r.key).toUpperCase().replace(/_/g,' '),kind:'d_'+r.key,base:14,tier:'r',danger:1.5}); } }
    for(const r of GOLEMS.list||[])if(!r.dead&&r.N&&r.N.g&&r.N.g.visible){ const p=wp(r.N.g).clone(); p.y+=1*T; L.push({p,r:.9*M,name:'ROCK GOLEM',kind:'d_golem',base:16,tier:'r',danger:1.5}); }
    for(const c of BREAK.list||[])if(!c.dead&&c.g&&c.g.visible){ const p=wp(c.g).clone(); p.y+=.2*T; L.push({p,r:.35*M,name:c.kind==='slime'?'CASTLE SLIME':'RADIOACTIVE SPIDER',kind:'d_brk_'+c.kind,base:12,tier:c.kind==='slime'?'r':'s',danger:1}); }
    for(const N of NPCS.all()){ if(!N.g||!N.g.visible||!N.st)continue; const nm=N.name||N.def&&N.def.name; if(!nm)continue; const p=wp(N.g).clone(); p.y+=.9*T; L.push({p,r:.5*M,name:String(nm).toUpperCase(),kind:'n_'+N.key,base:2,tier:'c'}); }
    return L; };
  const shown=o=>{ for(let q=o;q;q=q.parent)if(!q.visible)return false; return o.isMesh&&!(o.material&&(o.material.visible===false||o.material.transparent&&o.material.opacity<.05)); };
  const clear=(cam,q,d)=>{ try{ V.copy(q.p).sub(cam.position).normalize(); ray.set(cam.position,V); ray.far=Math.max(.1,d-q.r*2-.3*M); const h=ray.intersectObjects(scene.children,true).find(h=>h.distance>.6*M&&shown(h.object)&&!h.object.userData.wield); return !h; }catch(e){ return true; } };
  const height=()=>{ const y=Math.max(SHARED.py||0,TREES.h!=null?TREES.h:-1e9); return y/M; };
  // the subject in frame worth the most, and the print's price
  PHOTOG.judge=(o)=>{ '@later'; const cam=o.cam, half=Math.tan(o.fov/2); let best=null;
    for(const q of subjects()){ const d=q.p.distanceTo(cam.position); if(!(d>=.3*M)||d>250*M)continue; V.copy(q.p).project(cam); if(V.z>1||Math.abs(V.x)>.92||Math.abs(V.y)>.92)continue;
      const fill=cl(q.r/(d*half)/.25,0,1), centre=1-.3*Math.min(1,Math.hypot(V.x,V.y)), w=q.base*TK[q.tier]*(.3+.7*fill)*centre; if(fill<.03)continue; if(!best||w>best.w)best={...q,d,fill,w}; }
    if(best&&!clear(cam,best,best.d))best=null; return best; };
  PHOTOG.price=(q,o)=>{ o={dEV:+o.dEV||0,blurD:+o.blurD||0,blurM:+o.blurM||0}; const ex=Math.abs(o.dEV), qual=(ex<=1?1:Math.max(.2,1-(ex-1)*.35))*(o.blurD<.6?1:Math.max(.2,1-(o.blurD-.6)/4))*(o.blurM<.8?1:Math.max(.2,1-(o.blurM-.8)/5))*(.3+.7*q.fill);
    const h=height(), place=SHARED.LVL==='down'?1.5:1+Math.min(2,Math.max(0,h-3)/20), near=q.danger?1+q.danger*Math.max(0,1-q.d/(8*M)):1, skill=.5+FORAGE.sk('photo')/100;
    const day=new Date().toDateString(); if(S.day!==day){ S.day=day; S.n={}; } const rep=Math.max(.25,Math.pow(.8,S.n[q.kind]||0));
    return {v:Math.max(1,Math.round(q.base*TK[q.tier]*qual*place*near*skill*rep)),qual,place,near,rep,h}; };
  PHOTOS.rate=(p,o)=>{ '@later'; const q=PHOTOG.judge(o); if(!q){ p.v=1; return; } const r=PHOTOG.price(q,o);
    p.v=r.v; p.sub=q.kind; p.tier=q.tier; p.cap=(q.name+(r.h>6?' FROM '+Math.round(r.h)+' M UP':SHARED.LVL==='down'?' BELOW':'')).slice(0,30);
    S.n[q.kind]=(S.n[q.kind]||0)+1; const first=!S.kinds[q.kind]; S.kinds[q.kind]=(S.kinds[q.kind]||0)+1; save();
    const diff={c:10,r:35,s:60}[q.tier]+(q.danger||0)*15+Math.min(20,r.h/3); FORAGE.use('photo',diff-30,diff+30,r.qual>.8?5:0);
    if(first)SAY(`A FIRST: ${q.name} (${TN[q.tier]}) ON FILM.`,'#c8b0ff'); };
  FORAGE.BUYK.photos=['photo_'];
  FORAGE.SOLD.push((id,n,v)=>{ if(!/^photo_/.test(id))return; FORAGE.use('photo',-20,40+Math.min(60,v/2)); if(!FORAGE.has(id)){ const i=PHOTOS.mine.findIndex(p=>p.id===id); if(i>=0){ PHOTOS.mine.splice(i,1); PHOTOS.save(); } } });
  FORAGE.HELP.push('PHOTOGRAPHY: a print of a bird, butterfly, creature or monster sells to the rangers and the Professor. Rarer subjects, higher spots (up a tree), the dungeon, a nearby danger, a sharp, well-exposed, full frame and a higher skill pay more; the same kind again that day pays less. Taking and selling prints trains it.');
  PHOTOG.dbg=()=>({...S,skill:FORAGE.sk('photo')});
}
