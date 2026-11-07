// THE PLAYHOUSE'S FOYER AT WORK: the box office sells tickets (a show watched from a seat with one rests you), the bar sells drinks, the programme reads, the velvet benches seat you; the company runs the foyer and the bar, the skeleton is stage manager at the prompt desk; sixty seats in the stalls for the townspeople who come to a show.
import {FORAGE, INV, ROOMS, st, USE, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {STORE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
import {PHX} from './151b-ph-kit.js';
import {PHA} from './151c-ph-house.js';
const PLAYF={}; window.PLAYF=PLAYF;
{ const say=(t,c)=>SAY(t,c||'#f2c14e');
  FORAGE.add({names:{play_ticket:'A TICKET FOR THE PLAYHOUSE',d_wine:'A GLASS OF WINE',f_bonbons:'A BOX OF CHOCOLATES'},does:{d_wine:()=>{ VIT.sta=1; },f_bonbons:()=>{ FORAGE.feed(.1); VIT.sta=Math.min(1,VIT.sta+.3); }}});
  // where its people go, in the house's own metres (x across, z from the curtain line to the doors; the foyer floor 1.3 up)
  { const S=STORE.playFrame, R=ROOMS.off.playhouse; if(S&&R){ const at=(x,z,hd,y)=>{ const w=S.W(x,0,z); return {x:w[0],z:w[2],hd,off:true,...(y!=null?{y:y*S.MV}:{})}; }, PI=Math.PI;
    R.spots={'STAGE MANAGER':at(-8.2,-1.4,-PI/2),'BOX OFFICE':at(-10.45,20.75,PI/2),BAR:at(8.75,21.2,-PI/2),'BAR, THE FAR END':at(8.75,23.2,-PI/2),'USHER, STALLS':at(-2.2,15.6,0),'USHER, CIRCLE':at(6.5,26.2,PI),PROGRAMMES:at(-1.8,22.6,0)};
    const seats=[], D=PHA.D; for(let r=1;r<6;r++){ const z=6.2+r; for(const s of [-1,1])for(let k=0;k<7;k++)seats.push(at(s*(1.6+k*.6),z,PI,D.rake(z)+.48)); }
    R.seats=PLAYF.places=seats; } }
  // a ticket: torn at the door to the house for the show on now (or the next one); seated for that show, it rests you
  const slot=()=>{ const now=Date.now()/1000; return Math.floor((now+60)/1800); };
  PLAYF.buy=()=>{ if(IKIT.buy('play_ticket',8,'A TICKET FOR THE NEXT SHOW. $8. (EVERY HOUR AND HALF HOUR.)'))PLAYF.bought=slot(); };
  VIT.mends.push(()=>{ const on=USE.seat&&st.sit&&ROOMS.offIn&&ROOMS.offIn()==='playhouse'&&PHX.show&&PHX.show.running&&PHX.show.running(); if(!on)return 0;
    if(PLAYF.torn!==slot()){ PLAYF.torn=slot(); } if(0){ if(!(INV.items.play_ticket>0))return 0; FORAGE.take('play_ticket',1); PLAYF.torn=slot(); say('AN USHER TEARS YOUR TICKET. ENJOY THE SHOW.'); } return 1/30; });
  const PROG=[['A MIDSUMMER NIGHT\'S DREAM','ACT ONE · EVERY HOUR AND HALF HOUR'],['THESEUS','DUKE OF ATHENS'],['HIPPOLYTA','QUEEN OF THE AMAZONS'],['EGEUS','FATHER TO HERMIA'],['HERMIA','IN LOVE WITH LYSANDER'],['LYSANDER · DEMETRIUS','IN LOVE WITH HERMIA'],['HELENA','IN LOVE WITH DEMETRIUS'],
    ['QUINCE, BOTTOM, FLUTE','THE MECHANICALS'],['SNOUT, SNUG, STARVELING','THE MECHANICALS']];
  PLAYF.programme=()=>MINI.look('THE PROGRAMME',(g,w,h)=>{ g.fillStyle='#1a0e08'; g.fillRect(0,0,w,h); g.fillStyle='#efe2c0'; g.fillRect(16,16,w-32,h-32); g.textAlign='center'; g.textBaseline='top'; g.fillStyle='#6a1a1a'; g.font='bold 18px Georgia,serif'; g.fillText(PROG[0][0],w/2,28);
    g.font='11px monospace'; g.fillStyle='#3a2a1a'; g.fillText(PROG[0][1],w/2,54); g.fillRect(60,74,w-120,1); PROG.slice(1).forEach(([a,b],i)=>{ g.font='bold 13px Georgia,serif'; g.fillStyle='#2a1a10'; g.fillText(a,w/2,86+i*24); g.font='10px monospace'; g.fillStyle='#6a5a4a'; g.fillText(b,w/2,101+i*24); }); },'A ticket at the box office; the bar is open before and after.');
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.playhouse=S=>{ '@later'; const {B,MH,MV,FY}=S, F=IKIT.frame({x0:B.x0,y0:B.z0,x1:B.x1,y1:B.z1},(x,z)=>[S.OX+x*MH,S.OZ+z*MH]), K=IKIT.room(F,o=>scene.add(o),()=>{}), {use}=K, u=x=>x-B.x0, v=z=>z-B.z0, fy=FY*MV/MH;
    const at=(x,z)=>F.pw(u(x),v(z)), hz=(h)=>h*MV/MH;
    // the box office's window, the bar's counter, the programme's easel: each now does what it is for
    
    K.use('THE PROGRAMME (READ)',u(0),v(PHA.D.ZB),.9,fy+hz(2.0),PLAYF.programme,1.8);
    for(const s of [-1,1]){ const x=s*4.5, z=16.9; K.use('A VELVET BENCH',u(x),v(z),1.4,fy+hz(.6),()=>{ const p=at(x,z+.1); USE.sitAt(p[0],p[1],(FY+.45)*MV,F.hd(0,1)); },1.6); }
    K.flush(); };
}
