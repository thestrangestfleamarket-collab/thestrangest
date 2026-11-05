// THE LIVES: every working character's own life (data/lives.json: home, hours, habits, wage) by the rules shared with the server (worker/lives.js): where their home's door is, where each habit is done, their records (needs, mood, money, their log, the players they know) from the section's server, or worked out here when offline.
import {SHARED} from './003-shx.js';
import {CLOCK, ONLINE} from './003b-systems.js';
import {LEVEL, SYS, TILE} from './006-map-pre.js';
import {CREW} from './111fb-fleamarket.js';
__CODE__("worker/lives.js")
const LIVES={data:__DATA__("data/lives.json"),rec:{},local:{},server:false,LV_DO}; window.LIVES=LIVES;
{ const W=(x,y)=>({x:SHARED.BOD.XS(x),z:SHARED.BOD.ZS(y)}), HG=LEVEL.hangouts||{}, RES={};
  for(const r of LEVEL.residences||[])RES[r.id]=r;
  // the game hour now: today's count from the shared clock, the hour as the sky shows it (a test's ?hour= too)
  LIVES.H=()=>{ const d=Math.floor(lvH(Date.now())/24); return d*24+Math.floor(((CLOCK.h%24)+24)%24); };
  LIVES.self=key=>{ const L=LIVES.data[key]; return L?lvSelf(key,{job:L}):null; };
  LIVES.recOf=key=>{ const L=LIVES.data[key]; if(!L)return null; if(LIVES.rec[key])return LIVES.rec[key];
    const H=LIVES.H(), r=LIVES.local[key]; if(r&&r.H===H)return r; return LIVES.local[key]=lvRun(key,{job:L},r||null,H,null); };
  LIVES.plan=key=>{ const L=LIVES.data[key]; return L?lvPlan(key,{job:L},LIVES.H(),LIVES.recOf(key)):null; };
  LIVES.verb=k=>(LV_DO[k]||LV_DO.walk).verb;
  // where they live: a home's door (data/world.json residences), the apartment house, or down the subway
  LIVES.home=key=>{ const L=LIVES.data[key], h=L&&L.home; if(!h)return null; const R=RES[h]; if(R)return {...W(R.door[0],R.door[1]),name:R.name}; return CREW.door(h); };
  LIVES.homeName=key=>{ const L=LIVES.data[key], h=L&&L.home; return RES[h]?RES[h].name:h==='house'?'THE APARTMENT HOUSE':h==='subway'?'ANOTHER PART OF TOWN':''; };
  // where a habit is done: a place's inside (its door, then in), or an area out of doors (a spot picked by who and when, a band to wander, which way to face)
  LIVES.spot=(k,key,H)=>{ const D=LV_DO[k]; if(!D)return null; if(D.at)return {at:D.at,door:CREW.door(D.at)};
    const g=HG[D.out]; if(!g)return null; const pick=lvHash(key+'@'+Math.floor(H/3));
    if(g.band){ const [x0,x1,y0,y1]=g.band, u=(pick%1000)/1000, c=W(x0+u*(x1-x0),(y0+y1)/2); const p=W(x0,y0), q=W(x1,y1); return g.hd!=null?{...c,r:0,hd:g.hd}:{...c,r:30*TILE,band:()=>W(x0+Math.random()*(x1-x0),y0+Math.random()*(y1-y0)),rect:[Math.min(p.x,q.x),Math.min(p.z,q.z),Math.max(p.x,q.x),Math.max(p.z,q.z)],fast:D.fast}; }
    const a=g.areas[pick%g.areas.length], c=W(a[0],a[1]);
    if(D.still){ const u=(pick>>>8)%360*Math.PI/180, v=a[2]*TILE*(((pick>>>17)%100)/100); return {x:c.x+Math.cos(u)*v,z:c.z+Math.sin(u)*v,r:0,hd:g.hd!=null?g.hd:Math.atan2(-Math.cos(u),-Math.sin(u))}; }   // (a spot of their own in it, to stay at, facing its middle)
    return {...c,r:a[2]*TILE,hd:g.hd}; };
  // the section's server keeps the records: asked when you come online and each game hour after
  ONLINE.hear.lives=m=>{ if(!m.all||typeof m.all!=='object')return; LIVES.server=true; for(const k in m.all)if(LIVES.data[k])LIVES.rec[k]=m.all[k]; };
  let lastH=-1; SYS.add('hi',()=>{ lastH=-1; },'158-lives');
  SYS.add('city',()=>{ if(!ONLINE.on)return; const H=lvH(Date.now()); if(H!==lastH){ lastH=H; ONLINE.send({t:'lives'}); } },'158-lives');
  // talking to someone: they remember you; "HOW'S LIFE?" tells what they are up to and their last few days
  LIVES.met=key=>{ if(!LIVES.data[key])return; const n=ONLINE.myName?ONLINE.myName():''; if(ONLINE.on)ONLINE.send({t:'met',k:key}); else if(n)lvMeet(LIVES.recOf(key),n); };
  LIVES.talk=(key,t)=>{ const L=LIVES.data[key], r=L&&LIVES.recOf(key); if(!r||!t||!t.lines||!t.lines[t.start])return t;
    const S=JSON.parse(JSON.stringify(t)), st=S.lines[S.start], n=ONLINE.myName?ONLINE.myName():'', known=n&&r.knows&&r.knows[n];
    if(known){ const a=Array.isArray(st.say)?st.say:[st.say]; st.say=a.map(s=>String(s)[0]==='@'?s:'Good to see you again, {name}. '+s); }
    const now=LIVES.verb(lvPlan(key,{job:L},LIVES.H(),r)), log=(r.log||[]).slice(-4).map(e=>e[1]).join(' · ');
    S.lines.life={say:'Me? '+now.charAt(0).toUpperCase()+now.slice(1)+'. I live at '+LIVES.homeName(key)+'. Feeling '+r.mood+', $'+r.money+' to my name.'+(log?' Lately: '+log+'.':''),opts:[{t:'BACK.',go:S.start}]};
    const o=st.opts||(st.opts=[]); o.splice(Math.max(0,o.length-1),0,{t:"HOW'S LIFE?",go:'life'}); return S; };
  window.LIVESDBG=k=>k?{plan:LIVES.plan(k),home:LIVES.homeName(k),rec:LIVES.recOf(k),self:LIVES.self(k)}:{n:Object.keys(LIVES.data).length,server:LIVES.server,H:LIVES.H()};
}
export {LIVES};
