// THE WORKERS: the insides' non-human workers, characters in data/characters.json with a job at a place and a body: a woodland-folk recipe (`folk`: species, colours, clothes) or one made by code (WORKERS.models[key], MERCH's way): made the first time you go in (the folk's makers come with the park's code), standing at the place's spot for their title, moving as WORKERS.idle[key] says; kept after.
import {WORKERS} from './003b-systems.js';
import {scene} from './004-main.js';
import {LEVEL, MAPG, SYS} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
import {MERCH} from './111e-merch.js';
import {CREW} from './111fb-fleamarket.js';
import {FOLK} from './146i-folk.js';
{ const C=LEVEL.chars||{};
  WORKERS.list=()=>Object.keys(C).filter(k=>C[k]&&(C[k].folk||WORKERS.models[k])&&C[k].job);
  WORKERS.of=at=>WORKERS.list().filter(k=>(CREW.alias[C[k].job.at]||C[k].job.at)===(CREW.alias[at]||at));
  const still=t=>MERCH.pose({nod:Math.sin(t*.7)*4,yaw:Math.sin(t*.31)*8,L:{ua:[14,8],fa:[24,0]},R:{ua:[14,-8],fa:[24,0]}});
  const stand=k=>{ const N=BODIES.by[k]&&BODIES.by[k].npc, c=C[k]; if(!N){ later.add(k); return; } const p=CREW.inside(c.job.at,k,c.job); if(!p)return;
    const s=N.st; s.x=p.x; s.z=p.z; s.to=s.next=null; if(p.hd!=null)s.hd=p.hd; s.pin=true; s.hold=true; N.free=()=>true; N.on=true;
    const root=p.off?scene:(MAPG.bodega||scene); if(N.g.parent!==root)root.add(N.g); };
  WORKERS.make=async at=>{ const ks=WORKERS.of(at).filter(k=>!WORKERS.made[k]); if(!ks.length){ for(const k of WORKERS.of(at))stand(k); return; }
    if(typeof LOAD==='function')await LOAD('park');
    for(const k of ks){ if(WORKERS.made[k])continue; WORKERS.made[k]=true; const c=C[k];
      try{ const M=WORKERS.models[k], idle=(t,N)=>(WORKERS.idle[k]||M&&M.idle||still)(t,N);
        if(c.folk){ const body=FOLK.body({k,n:c.name,...c.folk}); body.key=k; body.label=c.name||k.toUpperCase(); body.at=null; body.idle=idle; BODIES.add(body); }
        else MERCH.add({...M,key:k,label:c.name||M.label,inside:true,at:null,idle}); }
      catch(e){ console.warn('WORKER '+k,e); } }
    for(const k of WORKERS.of(at))stand(k); };
  // a body made this moment has no npc yet: stand it once it has
  const later=new Set(); SYS.add('life',()=>{ for(const k of later)if(BODIES.by[k]&&BODIES.by[k].npc){ later.delete(k); stand(k); } },'146zb-workers');
  window.WORKERSDBG=()=>WORKERS.list().map(k=>{ const N=BODIES.by[k]&&BODIES.by[k].npc; return {k,at:C[k].job.at,made:!!WORKERS.made[k],x:N?+N.st.x.toFixed(1):null,z:N?+N.st.z.toFixed(1):null}; });
}
