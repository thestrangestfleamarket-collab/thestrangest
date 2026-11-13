// THE PARK'S ROVERS (owner, 12 Nov 2026: "the rover is silver and sentient, they pick up trash and reapir deamage of park"): the two silver rovers on the park's paths (their round is the traffic's, 150pb) look after it as they go: a fire near one goes out, spray paint near one is cleaned off, and each turns its camera head to whoever is near and says hello.
import {THREE} from './003-shx.js';
import {BLAZE, pos, SPRAY} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS, TILE} from './006-map-pre.js';
import {TRAFFIC} from './150pb-traffic.js';
const ROVERS={fires:0,tags:0,hello:0}; window.ROVERS=ROVERS;
{ const M=TILE/.84, V=new THREE.Vector3(), LINES=['BEEP. KEEPING THE PARK TIDY.','BEEP BOOP. MIND THE FLOWERS.','NO FIRES TODAY. GOOD.','I LIKE THE TREES. DO YOU LIKE THE TREES?','WHIRR. PAINT COMES OFF. PARK STAYS.'];
  let acc=0, said=-99, clock=0;
  SYS.add('life',dt=>{ const R=(TRAFFIC.rings||[]).find(r=>r.id==='rover'); if(!R||!TRAFFIC.ringAt)return; clock+=dt||0; const n=performance.now(), work=n-acc>400; if(work)acc=n;
    R.models.forEach((k,i)=>{ const p=TRAFFIC.ringAt('rover',i), d=Math.hypot(pos.x-p.x,pos.z-p.z), m=R.m[i];
      if(BLAZE.douse)ROVERS.fires+=BLAZE.douse(p.x,p.z,7*M); if(work&&SPRAY.wipe&&d<60*M)ROVERS.tags+=SPRAY.wipe(p.x,p.z,6*M);
      if(!m||!m.visible)return; let head=m.userData.head; if(head===undefined){ head=null; m.traverse(o=>{ if(o.name==='CAMERA HEAD')head=o; }); m.userData.head=head; }
      if(head){ const want=d<12*M?Math.atan2(pos.x-p.x,pos.z-p.z)-m.rotation.y:Math.sin(clock*.6+i*2)*.5; let a=((want-head.rotation.y+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI; head.rotation.y+=a*Math.min(1,(dt||0)*4); }
      if(d<4*M&&clock-said>45){ said=clock; ROVERS.hello++; SAY('THE ROVER: "'+LINES[(ROVERS.hello+i)%LINES.length]+'"','#b9c4d0'); } }); },'150ph-rover'); }
