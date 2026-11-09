// A BOT'S MIND (?bot=1, a page tools/bots.cjs runs): plays the game as a player does, by the job the owner set in BOTS (walks by the click-to-walk, uses things, buys and sells at the shops' own buttons).
import {SHARED, THREE} from './003-shx.js';
import {CITY, FORAGE, INV, keys, LOOKS, ONLINE, pos, ROOMS, SHOPS, st, UI, USE, VIT, WEEDS} from './003b-systems.js';
import {FADE, MODS, QS, SYS, TILE} from './006-map-pre.js';
import {OBJS} from './008-batch.js';
import {RIVER} from './066-river.js';
import {AVATAR} from './111c-avatar.js';
import {FISHING} from './142-fishing.js';
const BOT=window.BOT={ready:false}, BOTV=new THREE.Vector3();
if(QS.get('bot')==='1'){ const T=TILE, R=Math.random;
  let C={job:'stand'}, doing='starting', task=null, home=null, path=null, pi=0, stuck=0, last=null, sayT=20+R()*20, mad=null, hp0=1, placed=false, looked='';
  const say=t=>{ if(t&&ONLINE.said)ONLINE.said(String(t).slice(0,200)); };
  const lines=()=>(C.say||'').split('|').map(s=>s.trim()).filter(Boolean);
  const d2=(x,z)=>Math.hypot(x-pos.x,z-pos.z);
  const lv=()=>SHARED.LVL==='down'?'down':'up';
  /* ---------- walking: the game's own route, each corner a click-to-walk target ---------- */
  const walk=(x,z)=>{ let r=null; try{ r=CITY.route(lv(),{x:pos.x,z:pos.z},{x,z}); }catch(e){} path=r&&r.pts.length?r.pts.slice(1):[{x,z}]; pi=0; stuck=0; last={x:pos.x,z:pos.z,t:0}; step(); };
  const step=()=>{ const p=path&&path[pi]; if(!p){ path=null; SHARED.target=null; return; } SHARED.target=new THREE.Vector3(p.x,SHARED.py,p.z); UI.go(d2(p.x,p.z)); };
  const walking=dt=>{ if(!path)return false; const p=path[pi]; if(!p){ path=null; return false; }
    if(d2(p.x,p.z)<.3*T||!SHARED.target){ pi++; if(pi>=path.length){ path=null; SHARED.target=null; return false; } step(); return true; }
    last.t+=dt; if(last.t>3){ if(Math.hypot(pos.x-last.x,pos.z-last.z)<.2*T&&++stuck>3){ path=null; SHARED.target=null; return false; } last={x:pos.x,z:pos.z,t:0}; } return true; };
  const thAt=th=>th.obj.getWorldPosition(new THREE.Vector3());
  const nearest=(list,ok=()=>true)=>{ let b=null, bd=1e18; for(const th of list){ if(!th||!th.obj||!ok(th))continue; const p=thAt(th), d=d2(p.x,p.z); if(d<bd){ bd=d; b=th; } } return b; };
  // go to a thing and use it as a double click does: true once used
  const use=(th,dt)=>{ if(!th)return false; const p=thAt(th), reach=(th.reach||T)*.8, d=d2(p.x,p.z); if(d<=reach||(!path&&th.tried&&d<5*T)){ th.tried=0; path=null; SHARED.target=null; SHARED.heading=Math.atan2(p.x-pos.x,p.z-pos.z); th.act&&th.act(); return true; }
    if(!path||Math.hypot(p.x-(path[path.length-1]||p).x,p.z-(path[path.length-1]||p).z)>T){ if(!path&&th.tried>2&&d<5*T)th.tried=9; else { th.tried=(th.tried||0)+1; walk(p.x,p.z); } } else walking(dt); return false; };
  const click=sel=>{ const b=[...document.querySelectorAll(sel)].find(e=>e.offsetParent!==null&&!e.closest('[hidden]')); if(b){ b.click(); return true; } return false; };
  const close=()=>{ for(const b of document.querySelectorAll('.pX'))if(b.offsetParent)b.click(); };
  const cash=()=>Math.round(INV.cash||0);
  // into a shop by the map's GO TO, up to its counter, then press its buttons (fn); true once done, false while on the way, null if it can't be reached
  const counter=(shop,dt,fn,s=task,re=/^THE COUNTER/)=>{ s.at=s.at||{}; if(!s.at[shop]){ s.at[shop]=1; s.wt=30; UI.goName(shop); return false; }   // always by GO TO first: a counter nearby may be another shop's
    if(FADE.busy)return false; const th=nearest(UI.things,t=>re.test(t.name||'')), p=th&&thAt(th);
    if(!th||d2(p.x,p.z)>30*T){ if((s.wt-=dt)>0)return false; return null; }
    if(!s.pressed){ if(!use(th,dt))return false; s.pressed=1; s.pw=1.8; fn(); return false; }   // the shop's window: press, then answer how many and YES, then close
    answer(); if((s.pw-=dt)>0)return false; s.pressed=0; close(); SHOPS.close&&SHOPS.close(); return true; };
  // the shops are double-clicked (a row, then HOW MANY and YES), the old panels still have buttons
  const press=sel=>{ const b=[...document.querySelectorAll(sel)].find(e=>e.offsetParent!==null); if(!b)return false; const r=b.getBoundingClientRect(); b.dispatchEvent(new MouseEvent('dblclick',{bubbles:true,clientX:r.left+4,clientY:r.top+4})); return true; };
  const answer=()=>{ click('#bagask .ak-all'); click('#shopg [data-q="y"]'); };
  const buy=id=>press(`.shr[data-buy="${id}"]`)||click(`[data-buy="${id}"]`);
  const sellAll=()=>{ if(press('.shr[data-sold]'))return true; let n=0; while((click('[data-sold][data-n="all"]')||click('[data-sell][data-n="all"]'))&&n++<30); return n>0; };
  let cash0=null; const earned=()=>cash()-(cash0??cash()), goal=()=>C.goal>0&&earned()>=C.goal;   // a goal is what it earns on this job, not what it had
  // walk about a centre (home, or where a job brought it), its own pauses
  let rw=0; const roam=(dt,c,far,ok)=>{ if(walking(dt))return; if((rw-=dt)>0){ doing='looking round'; return; } const h=c||{x:pos.x,z:pos.z};
    const D=MODS.dungeon; if(SHARED.LVL==='down'&&D&&D.inside&&D.inside(pos.x,pos.z)&&D.rooms){   // in the dungeon, wandering is exploring: off to a spot in another room, a short look round, on again
      const rs=D.rooms.filter(r=>!r.c); for(let k=0;k<12;k++){ const r=rs[(R()*rs.length)|0], L=D.lay(r.k), B=L&&L.R; if(!B)continue; const x=SHARED.BOD.XS(B.x0+1.5+R()*(B.x1-B.x0-3)), z=SHARED.BOD.ZS(B.y0+1.5+R()*(B.y1-B.y0-3));
        if(!(CITY.blocked&&CITY.blocked(lv(),x,z))&&d2(x,z)>4*T){ walk(x,z); doing='exploring '+(r.nm||'the dungeon').toLowerCase(); break; } } rw=1+R()*2; return; }
    for(let k=0;k<12;k++){ const a=R()*6.283, r=(far?6+R()*20:2+R()*8)*T, x=h.x+Math.sin(a)*r, z=h.z+Math.cos(a)*r; if((!ok||ok(x,z))&&!(CITY.blocked&&CITY.blocked(lv(),x,z))){ walk(x,z); break; } }
    rw=far?.5+R():2+R()*6; doing='wandering'; };
  const here=t=>t.c||(t.c={x:pos.x,z:pos.z});
  /* ---------- the jobs: each a step a frame, its state in task ---------- */
  const JOB={
    stand:()=>{ doing='standing'; },
    wander:dt=>roam(dt,home),
    goto:dt=>{ if(walking(dt)){ doing='walking there'; return; } doing='there'; },
    follow:dt=>{ const o=C.who&&ONLINE.others.get(C.who); if(!o||!o.p||o.why!=='near you'){ doing=o?'can\'t see '+o.name+' ('+o.why+')':'waiting for who to follow'; return; }
      const d=d2(o.p.x,o.p.z); if(d>2.2*T){ if(!path||(task&&Math.hypot(task.x-o.p.x,task.z-o.p.z)>T)){ task={x:o.p.x,z:o.p.z}; walk(o.p.x,o.p.z); } walking(dt); doing='following '+o.name; } else { path=null; SHARED.target=null; doing='with '+o.name; } },
    fight:dt=>{ const o=C.who&&ONLINE.others.get(C.who); if(!o){ doing='waiting for who to fight'; return; } fightOn(o,dt); },
    chat:dt=>{ roam(dt,home); doing='chatting'; },
    sit:dt=>{ if(st.sit){ doing='sitting'; return; } task=task||{skip:new Set()};
      if(!task.th){ let b=null, bd=40*T; for(const o of OBJS){ if(task.skip.has(o)||USE.test.kindOf(o)!=='sit')continue; const c=USE.test.box(o).getCenter(BOTV), d=d2(c.x,c.z); if(d<bd){ bd=d; b=o; } }
        const kt=nearest(UI.things,t=>!task.skip.has(t)&&/^(BENCH|SEAT|SITTING LOG|A? ?(VELVET )?BENCH|CHAIR|SOFA|STOOL)/i.test(t.name||'')), kd=kt?d2(thAt(kt).x,thAt(kt).z):1e9;
        if(kt&&kd<bd){ task.o=kt; task.th=kt; task.t=0; } else if(b){ task.o=b; task.th=USE.test.goal(b,'sit'); task.t=0; if(!task.th)task.skip.add(b); } if(!task.th){ roam(dt,here(task),true); doing='looking for a seat'; return; } }
      doing='going to sit on a '+task.th.name.toLowerCase(); if(use(task.th,dt)||(task.t+=dt)>40){ if(!st.sit&&task.t>2){ task.skip.add(task.o); task.th=null; } } },
    mushrooms:dt=>{ if(goal()){ doing='made $'+earned()+' on this job (goal reached)'; return; } task=task||{s:'find'};
      const F=FORAGE, have=Object.keys(INV.items).filter(id=>/^[mu]_/.test(id)&&INV.items[id]>0).reduce((a,id)=>a+INV.items[id],0);
      if(task.s==='find'){ if(task.go>0){ task.go-=dt; return; } if(LOOKS.L&&!LOOKS.L.bare)LOOKS.L.bare=true;
        const th=F.things?nearest(F.things()):null;
        if(task.hold>0)task.hold-=dt; const extra=have-(task.keep||0); if(!th)task.look=(task.look||0)+dt; if((extra>=(C.sellAt||12)||!th&&task.look>120)&&extra>0&&!(task.hold>0)){ task.s='sell'; return; } if(!th){ if(!task.park){ task.park=1; task.go=3; UI.goName('CENTRAL PARK'); doing='going to the park'; return; } roam(dt,null,true,(x,z)=>!WEEDS.inPark||WEEDS.inPark(x,z,4)); doing='looking for mushrooms'; return; }
        doing='picking mushrooms ('+have+' in the bag)'; use(th,dt); return; }
      if(task.s==='sell'){ doing='taking '+have+' mushrooms to THE MUSHROOM SHOP'; const r=counter('THE MUSHROOM SHOP',dt,sellAll); if(r===false)return;
        if(r===null){ task={s:'find',hold:60,keep:task.keep}; doing='can\'t sell mushrooms now, picking more'; return; }
        task={s:'find',keep:Object.keys(INV.items).filter(id=>/^[mu]_/.test(id)&&INV.items[id]>0).reduce((a,id)=>a+INV.items[id],0)}; say(lines()[0]||''); doing='sold, now $'+cash(); } },
    fish:dt=>{ if(goal()){ doing='made $'+earned()+' on this job (goal reached)'; return; } task=task||{s:'gear'}; if(task.hold>0&&task.s==='gear'){ task.hold-=dt; return; } const F=FORAGE, fish=FISHING.held?FISHING.held():0, bait=['bait','bait_cut'].some(id=>F.has(id));
      const BAIT=['bait','bait_cut'], stand=nearest(UI.things,th=>/BOATS/.test(th.name||''));
      if(task.s==='gear'){ if(F.has('rod')&&BAIT.reduce((n,id)=>n+(F.has(id)||0),0)>=3){ task={s:'cast',go:3}; UI.goName('TO THE HUDSON (THE PIER)'); return; } doing=F.has('rod')?'buying bait':'buying a rod';
        const r=counter('FISHING & SCUBA',dt,()=>{ if(!F.has('rod'))buy('rod'); else buy('bait'); }); if(r===false)return;
        if(r===null){ doing='can\'t get to FISHING & SCUBA'; task={s:'gear',hold:30}; } else if(!F.has('rod')||!BAIT.some(id=>F.has(id))){ const c0=task.c0??cash(); task={s:'gear',c0,tries:(task.tries||0)+1}; if(task.tries>4){ doing='can\'t buy fishing gear ($'+cash()+')'; task.hold=30; task.tries=0; } } return; }
      if(task.s==='sell'){ doing='selling '+fish+' fish'; const r=stand&&d2(thAt(stand).x,thAt(stand).z)<40*T?(use(stand,dt)?(sellAll(),close(),true):false):counter('FISHING & SCUBA',dt,sellAll);
        if(r===false)return; task={s:'gear'}; if(r===null){ task={s:'cast',hold:60}; doing='nobody buying fish nearby'; } return; }
      if(task.s==='cast'){ if(task.go>0){ task.go-=dt; return; } if(!bait&&!FISHING.state?.()){ task.s='gear'; return; } if(task.hold>0)task.hold-=dt; if(fish>=(FISHING.room?FISHING.room():5)&&!(task.hold>0)){ FISHING.leave&&FISHING.leave(); task.s='sell'; return; }
        const S=FISHING.state&&FISHING.state(); FISHING.auto=true; if(S&&S.st){ doing='fishing ('+S.st+'), '+fish+' caught'; if(S.st==='wait'&&S.t>40){ FISHING.reel(); (task.tried=task.tried||[]).push([pos.x,pos.z]); task.far=0; doing='nothing biting: trying another spot'; } return; }   // as the game tells a player: NOTHING IS BITING. TRY ANOTHER SPOT
        if(RIVER.swim||st.water&&st.water.in){ doing='climbing out of the water'; if(!task.out){ task.out=1; task.far=0; path=null; let f=null, fd=1e9; for(let r=1;r<=40;r+=1)for(let k=0;k<24;k++){ const a=k*Math.PI/12, x=pos.x+Math.sin(a)*r*T, z=pos.z+Math.cos(a)*r*T; if((RIVER.onPier(x,z,0)||!RIVER.over(x,z))&&r<fd){ f=[x,z]; fd=r; } } task.exit=f; }
          if(task.exit)SHARED.target=new THREE.Vector3(task.exit[0],SHARED.py,task.exit[1]); task.sp=(task.sp||0)+dt; if(task.sp>1.5){ task.sp=0; keys.add(' '); setTimeout(()=>keys.delete(' '),200); } return; } task.out=0;   // swim to the nearest dry ground, SPACE climbs a ladder or the bank   // never fish while swimming
        if(walking(dt))return; let best=null; for(let r=2;r<=12&&!best;r+=1.5)for(let k=0;k<16;k++){ const a=k*Math.PI/8, x=pos.x+Math.sin(a)*r*T, z=pos.z+Math.cos(a)*r*T; if(FISHING.at(x,z)&&!(task.tried||[]).some(([u,v])=>Math.hypot(pos.x-u,pos.z-v)<6*T)){ best=[x,z]; break; } }
        if(!best&&!task.far){ task.far=1; let f=null, fd=1e9; const P=RIVER.onPier||(()=>false);   // GO TO leaves it at the way through: on to the nearest pier with water beside it (or dry ground by the water)
          for(let r=4;r<=240;r+=2)for(let k=0;k<32;k++){ const a=k*Math.PI/16, x=pos.x+Math.sin(a)*r*T, z=pos.z+Math.cos(a)*r*T, dry=P(x,z,0)||!RIVER.over(x,z);
            if(dry&&r<fd&&(()=>{ for(let u=.1;u<1;u+=.1){ const px=pos.x+(x-pos.x)*u, pz=pos.z+(z-pos.z)*u; if(RIVER.over(px,pz)&&!P(px,pz,0))return false; } return true; })()&&!(task.tried||[]).some(([u,v])=>Math.hypot(x-u,z-v)<8*T)&&[[2,0],[-2,0],[0,2],[0,-2]].some(([u,v])=>FISHING.at(x+u*T,z+v*T))){ f=[x,z]; fd=r; } }
          if(f){ task.dry=f; walk(f[0],f[1]); doing='walking to the water'; return; } }
        if(!best){ if(stand&&!task.pier){ task.pier=1; const p=thAt(stand); walk(p.x,p.z); } else roam(dt,here(task)); doing='looking for water'; return; }
        if(!FISHING.mode&&FISHING.enter)FISHING.enter(); FISHING.cast(best[0],best[1]); doing='casting'; } },
    decorate:dt=>{ if(!C.apt){ doing='has no apartment (OWN APARTMENT is off)'; return; } const E=window.ROOMED; task=task||{s:'in',n:0,t:0};
      if(task.s==='in'){ if(MODS.apts&&MODS.apts.inReal){ task.s='buy'; return; } if(!task.go){ task.go=1; UI.goName('YOUR APARTMENT'); } doing='going home'; return; }
      if(!MODS.apts.inReal){ task={s:'in',n:0,t:0}; return; } if(!E){ doing='no decorating here'; return; }
      if(task.s==='buy'){ if(walking(dt))return; if((task.t-=dt)>0)return; task.t=2+R()*2; if(!E.on)E.toggle();
        const A=E._api&&E._api(), K=A?A.kinds():{}, budget=C.goal>0?C.goal:Infinity; task.spent=task.spent||0;
        const can=Object.keys(K).filter(k=>{ const q=K[k]; return q&&!q.bad&&!q.own&&k!=='CAT'&&(q.price??4)<=cash()&&task.spent+(q.price??4)<=budget; });
        if(!can.length||task.n>=12){ if(E.on)E.toggle(); task.s='done'; doing='decorated: '+task.n+' things bought'; return; }
        const k=can[Math.floor(R()*can.length)], before=cash(); if(E.buy(k)){ task.n++; task.spent+=before-cash(); doing='bought a '+k.toLowerCase().replace(/^[a-z]+:/,'').replace(/_/g,' '); }
        return; }
      doing='decorated: '+task.n+' things bought'; } };
  /* ---------- fighting: face them, close in, a punch or a kick ---------- */
  const fightOn=(o,dt)=>{ if(!o.p||o.why!=='near you'||o.dead){ doing=o.dead?o.name+' is down':'looking for '+o.name; return false; }
    const d=d2(o.p.x,o.p.z); doing='fighting '+o.name;
    if(d>.9*T){ if(!path||(task&&task.fx!=null&&Math.hypot(task.fx-o.p.x,task.fz-o.p.z)>.5*T)){ walk(o.p.x,o.p.z); task=Object.assign(task||{},{fx:o.p.x,fz:o.p.z}); } walking(dt); return true; }
    path=null; SHARED.target=null; SHARED.heading=Math.atan2(o.p.x-pos.x,o.p.z-pos.z);
    fightOn.t=(fightOn.t||0)-dt; if(fightOn.t<=0){ fightOn.t=.7+R()*.6; const k=R()<.6?'J':'K'; RIG.act(st,k); SYS.run('act',k,1); setTimeout(()=>{ RIG.release&&RIG.release(st,k); SYS.run('act',k,0); },120); } return true; };
  const status=()=>({doing,...(BOT.tally&&BOT.tally()?{tests:BOT.tally()}:{}),cash:cash(),hp:Math.round((VIT.hp||0)*100)/100,job:C.job,at:[+pos.x.toFixed(1),+pos.z.toFixed(1)],...(path&&path.length?{to:[+path[path.length-1].x.toFixed(1),+path[path.length-1].z.toFixed(1)]}:{})});
  const place=()=>{ if(C.place){ UI.goName(C.place); setTimeout(()=>{ home={x:pos.x,z:pos.z}; },1500); }
    else if(C.at){ const [x,z,dn]=C.at, id=!dn&&ROOMS.boxAt?ROOMS.boxAt(x,z):null; if(id&&ROOMS.enterAt)ROOMS.enterAt(id,[x,z,0,0]); else UI.goTo(x,z,dn?'down':'up'); home={x,z}; } else home={x:pos.x,z:pos.z}; };   // a spot in an inside off the map goes in, as GO TO does
  const look=()=>{ if(C.look===looked)return; looked=C.look||''; try{ if(C.look)AVATAR.set(AVATAR.decode(C.look)); else if(AVATAR.outfits&&AVATAR.outfits.length)AVATAR.outfit(Math.floor(R()*AVATAR.outfits.length)); }catch(e){} };
  BOT.set=c=>{ const was=C; C=Object.assign({job:'stand'},c||{}); if(LOOKS.L)LOOKS.L.name=C.name||LOOKS.L.name; look();
    if(!placed||was.place!==C.place||String(was.at)!==String(C.at)||(C.call&&was.call!==C.call)){ placed=true; path=null; place(); }
    if(cash0==null||was.job!==C.job||was.goal!==C.goal)cash0=cash(); if(was.job!==C.job||was.who!==C.who){ doing='starting: '+C.job; task=null; path=null; SHARED.target=null; mad=null; if(FISHING.mode&&C.job!=='fish')FISHING.leave(); }
    if(VIT.hp>C.hp)VIT.hp=C.hp??1; };
  BOT.kit={JOB,press,answer,buy,walk,walking,use,click,close,cash,counter,sellAll,nearest,thAt,d2,roam,say,cfg:()=>C,doing:t=>{ doing=t; },stop:()=>{ path=null; SHARED.target=null; },reset:()=>{ task=null; path=null; SHARED.target=null; }};   // for the tests (162h)
  ONLINE.mine.noapt=()=>C.apt?null:1;   // a bot has no apartment unless the owner gave it one
  BOT.status=status; BOT.bye=()=>{ try{ ONLINE.send({t:'bye'}); }catch(e){} };
  let drawn=0; SYS.add('life',dt=>{ if(!BOT.ready)return; dt=Math.min(dt||.016,.25); SHARED.covered=!BOT.draw&&(++drawn%20)!==0;   // nobody watches a bot's screen: a picture now and then, so its game runs at full speed
    // health: never over what the owner set; can't be knocked down keeps it full
    const cap=C.hp??1; if(C.god)VIT.hp=cap; else if(VIT.hp>cap)VIT.hp=cap;
    // hit back: whoever is close when health drops
    if(VIT.hp<hp0-.001&&C.fight&&!VIT.dead){ let b=null, bd=2.5*T; for(const o of ONLINE.others.values()){ if(o.p&&o.why==='near you'&&!o.dead){ const d=d2(o.p.x,o.p.z); if(d<bd){ bd=d; b=o; } } } if(b)mad={id:b.id,t:12}; }
    hp0=VIT.hp; if(VIT.dead||VIT.out>0){ doing=VIT.dead?'down':'knocked out'; return; }
    if(mad){ mad.t-=dt; const o=ONLINE.others.get(mad.id); if(o&&mad.t>0&&fightOn(o,dt))return; mad=null; path=null; }
    try{ (JOB[C.job]||JOB.stand)(dt); }catch(e){ doing='stuck: '+String(e.message||e).slice(0,80); task=null; path=null; }
    const L=lines(); if(L.length&&(sayT-=dt)<0){ sayT=(C.job==='chat'?12:30)+R()*30; say(L[Math.floor(R()*L.length)]); } },'162g-bots');
  SYS.onStart(()=>{ setTimeout(()=>{ BOT.ready=true; doing='ready'; },1500); },'162g-bots');
}
export {BOT};
