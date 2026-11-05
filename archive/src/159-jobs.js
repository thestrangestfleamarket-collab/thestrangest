// THE JOBS: JOBS runs the cast's days by the shared clock (data/characters.json's job: where, the hours, out or in): to work, at work (in their building, or out at a spot or over an area), on their own time, home at night (over their work, the apartment house, or down the subway).
import {SHARED} from './003-shx.js';
import {CITY, CLOCK, pos, VIS, WALKS} from './003b-systems.js';
import {scene} from './004-main.js';
import {MAPG, QS, SYS, TILE} from './006-map-pre.js';
import {stfree} from './076-npc-map.js';
import {CREW} from './111fb-fleamarket.js';
const JOBS={on:QS.has('jobs')?QS.get('jobs')!=='0':true,list:[],plan:()=>JOBS.list,q:[]}; window.JOBS=JOBS;
{ const T=TILE, rnd=Math.random;
  const hsh=s=>{ let h=7; for(const c of s)h=(h*31+c.charCodeAt(0))>>>0; return h; };
  const inH=(h,a,b)=>{ a=((a%24)+24)%24; b=((b%24)+24)%24; return a<=b?h>=a&&h<b:h>=a||h<b; };
  const want=(J,h)=>inH(h,J.open,J.close)?'work':inH(h,J.bed,J.wake)?'home':'off';
  const near=(x,z)=>Math.hypot(pos.x-x,pos.z-z)<60*T&&SHARED.LVL==='up';
  const hide=(N,v)=>{ if(v){ N.mode='hidden'; VIS.hide(N.g,'away'); } else { delete N.mode; VIS.hide(N.g,'away',false); } };
  const room=(N,inn)=>{ if(!inn){ if(N.SR)N.SR.sit=null; CREW.out(N.key); } const to=inn?scene:(MAPG.bodega||scene); if(N.g.parent!==to)to.add(N.g); };
  const put=(N,p)=>{ N.st.x=p.x; N.st.z=p.z; N.st.to=null; N.st.next=null; N.g.position.x=p.x; N.g.position.z=p.z; };
  // in at a spot inside: pinned there, facing its way, sitting if it is a seat
  const settle=(N,p)=>{ hide(N,false); put(N,p); room(N,p.off); N.st.pin=true; N.st.hold=true; if(p.hd!=null)N.st.hd=p.hd; if(p.sit!=null&&N.SR)N.SR.sit={z:Math.max(2,p.sit/((N.g.scale.y||1)*((N.body&&N.body.KL)||1)))}; };   // (a body's hips go at its own leg length: KL)
  // walk there (the walks, 111db-walks: the section's server walks them, every player sees the same), now: be there; then()
  const go=(J,p,then,now)=>{ const N=J.N; CITY.stop(N); N.st.pin=false; N.st.hold=true; if(!p){ then(); return; }
    if(WALKS.has(N)){ hide(N,false); const gid=J.goal+'@'+(J.life?LIVES.H():Math.floor(CLOCK.h)); if(now){ put(N,p); WALKS.errand(N,p,{gid,now:1}); then(); return; }
      J.state='go'; WALKS.errand(N,p,{gid,then:ok=>{ if(J.state!=='go')return; if(!ok)put(N,p); then(); }}); return; }
    if(now){ hide(N,false); put(N,p); then(); return; }
    if(!near(N.st.x,N.st.z)&&!near(p.x,p.z)){ hide(N,false); put(N,p); then(); return; }
    hide(N,false); J.state='go'; JOBS.q.push(()=>{ if(J.state==='go')CITY.send(N,p,{then:ok=>{ if(!ok)put(N,p); then(); }}); }); };
  const area=J=>{ const j=J.job; if(j.r==null)return null; const c=CREW.spot(J); return c&&{...c,r:(j.r||0)*T}; };
  const roam=J=>{ const A=J.A, N=J.N; if(!A||!(A.r>0)||N.st.to||WALKS.has(N))return; for(let k=0;k<10;k++){ const p=A.band?A.band():{x:A.x+(rnd()*2-1)*A.r,z:A.z+(rnd()*2-1)*A.r}; if(stfree(p.x,p.z,N.st.R)&&Math.hypot(p.x-N.st.x,p.z-N.st.z)<30*T){ N.st.to=p; return; } } };
  const toWork=(J,now)=>{ const N=J.N, out=J.job.r!=null; J.goal='work';
    if(out){ const A=area(J); go(J,A,()=>{ if(J.goal!=='work')return; J.state='work'; J.A=A; if(!(A&&A.r>0)){ N.st.hold=true; if(A&&A.hd!=null)N.st.hd=A.hd; } },now); return; }
    go(J,J.door,()=>{ if(J.goal!=='work')return; J.state='work'; J.A=null; const p=CREW.inside(J.job.at,J.key,J.job); if(p)settle(N,p); else hide(N,true); },now); };
  const offWork=J=>{ const N=J.N; J.goal='off'; room(N,false); if(N.mode==='hidden'||N.st.pin){ N.st.pin=false; hide(N,false); put(N,J.door||N.st); }
    J.state='off'; J.A={x:(J.door||N.st).x,z:(J.door||N.st).z,r:10*T}; N.st.hold=true; };
  const goHome=J=>{ const N=J.N; J.goal='home'; room(N,false); if(N.st.pin){ N.st.pin=false; put(N,J.door||N.st); }
    if(J.home===J.door&&N.mode==='hidden'){ J.state='home'; return; }
    go(J,J.home,()=>{ if(J.goal!=='home')return; J.state='home'; J.A=null; hide(N,true); }); };
  // their own time (src/158-lives.js): a habit's place, inside it or out of doors; a jogger goes at a jog
  const pace=(J,f)=>{ const N=J.N; if(J.v0==null)J.v0=N.st.v; N.st.v=f?J.v0*2.2:J.v0; };
  const life=(J,w,now)=>{ const N=J.N, k=w.slice(4), H=LIVES.H(), sp=LIVES.spot(k,J.key,H); J.goal=w; J.kind=k; room(N,false); if(N.st.pin){ N.st.pin=false; put(N,J.door||N.st); } pace(J,sp&&sp.fast);
    if(!sp){ offWork(J); J.goal=w; return; }
    if(sp.at){ go(J,sp.door,()=>{ if(J.goal!==w)return; J.state='off'; J.A=null; const p=CREW.inside(sp.at,J.key); if(p)settle(N,p); else hide(N,true); },now); return; }
    go(J,sp,()=>{ if(J.goal!==w)return; J.state='off'; J.A=sp.r>0?sp:null; N.st.hold=true; if(sp.hd!=null)N.st.hd=sp.hd; },now); };
  // what the walks are told of each: the area to wander (or none), standing (pinned, inside, at a spot), in (hidden inside)
  const sync=J=>{ const N=J.N; if(!WALKS.has(N)||J.state==='go')return; const A=J.state==='work'||J.state==='off'?J.A:null, inn=N.mode==='hidden'||N.st.pin;
    WALKS.mode(N,{b:A?(A.rect?{band:A.rect}:A.r>0?{x:A.x,z:A.z,r:A.r}:null):null,hold:!A||!(A.r>0)?1:0,shop:null,roam:0},!inn&&J.wasIn); J.wasIn=inn; };
  const act=(J,w,now)=>w==='work'?(pace(J,0),toWork(J,now)):w==='home'?(pace(J,0),goHome(J)):w.startsWith('off:')?life(J,w,now):offWork(J);
  // a cast member joins: its hours a little its own, and it is where the hour says at once
  JOBS.add=(N,job,key)=>{ if(!JOBS.on||!job||!job.hours)return null; const h=hsh(key), j1=((h%9)-4)*.08, j2=(((h>>4)%5))*.15;
    const J={N,key,job,open:job.hours[0]+j1,close:job.hours[1]+j1,state:'',goal:'',t:rnd()*5}; J.bed=J.close+1+j2; J.wake=J.open-1-j2;
    J.door=CREW.door(job.at); const hm=job.home||(job.r!=null?'house':job.at); J.home=hm===job.at?J.door:CREW.door(hm);
    if(LIVES.data[key]){ J.life=true; J.home=LIVES.home(key)||J.home; }   // a life of their own: their home, hours and habits from data/lives.json
    JOBS.list.push(J); N.st.hold=true; if(N.walk&&WALKS.reg)WALKS.reg(N,{v:N.walk.v,auto:0,mode:{hold:1}}); const w=wantOf(J); J.goal=w;
    if(w==='home'){ if(J.home)put(N,J.home); J.state='home'; hide(N,true); }
    else if(w==='work')toWork(J,true);
    else if(J.life)life(J,w,true);
    else { if(J.door)put(N,J.door); offWork(J); }
    return J; };
  // what the hour asks of them: their life's plan (work, home, or off: and the habit), else the job's hours
  const wantOf=J=>{ if(!J.life)return want(J,CLOCK.h); const k=LIVES.plan(J.key); return k==='work'?'work':k==='sleep'||k==='home'||LIVES.LV_DO[k]&&LIVES.LV_DO[k].home?'home':'off:'+k; };
  let acc=0;
  SYS.add('city',dt=>{ if((acc+=dt)<.5)return; acc=0; const h=CLOCK.h; if(JOBS.on)for(const c of CREW.list)if(!c.J)c.J=JOBS.add(c.N,c.job,c.key)||1;
    for(let i=0;i<2&&JOBS.q.length;i++)JOBS.q.shift()();
    for(const J of JOBS.list){ const w=wantOf(J); if(w!==J.goal)act(J,w); else if((J.state==='work'||J.state==='off')&&J.A&&(J.t-=.5)<=0){ J.t=4+rnd()*10; roam(J); } sync(J); } },'159-jobs');
  window.JOBDBG=()=>JOBS.list.map(J=>({key:J.key,who:J.N.name,at:J.job.at,title:J.job.title,hours:J.job.hours.join('-'),out:J.job.r!=null,state:J.state,goal:J.goal,want:wantOf(J),home:J.life?LIVES.homeName(J.key):'',vis:J.N.mode!=='hidden',x:+J.N.st.x.toFixed(1),z:+J.N.st.z.toFixed(1)}));
}
