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
  // where a habit is done, by the rules shared with the server (lvSpot): the hangouts and the places' doors in the world's units (sent to the server with the cast)
  let HGW=null, DOORS=null;
  LIVES.HGW=()=>{ if(HGW)return HGW; HGW={}; for(const id in HG){ const g=HG[id], o={}; if(g.band){ const [x0,x1,y0,y1]=g.band, p=W(x0,y0), q=W(x1,y1); o.band=[p.x,p.z,q.x,q.z]; } if(g.areas)o.areas=g.areas.map(a=>{ const c=W(a[0],a[1]); return [c.x,c.z,a[2]*TILE]; }); if(g.hd!=null)o.hd=g.hd; HGW[id]=o; } return HGW; };
  LIVES.doors=()=>{ if(DOORS)return DOORS; const d={}; let all=true; for(const k in LV_DO){ const at=LV_DO[k].at; if(!at||d[at])continue; const p=CREW.door(at); if(p)d[at]={x:p.x,z:p.z}; else all=false; } if(all)DOORS=d; return d; };
  LIVES.spot=(k,key,H)=>{ const sp=lvSpot(k,key,H,LIVES.HGW(),LIVES.doors(),TILE); if(sp&&sp.band){ const R=sp.rect=sp.band; sp.band=()=>{ const r=R[Math.floor(Math.random()*R.length)]; return {x:r[0]+Math.random()*(r[2]-r[0]),z:r[1]+Math.random()*(r[3]-r[1])}; }; } return sp; };
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
