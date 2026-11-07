// A BOT'S MIND (?bot=1, a page tools/bots.cjs runs): plays the game as a player does, by the job the owner set in TENANTS > BOTS (walks by the click-to-walk, uses things, buys and sells at the shops' own buttons).
import {SHARED, THREE} from './003-shx.js';
import {CHARS, CITY, FORAGE, INV, LOOKS, NPCS, ONLINE, pos, SHOPS, st, UI, VIT} from './003b-systems.js';
import {MODS, QS, SYS, TILE} from './006-map-pre.js';
import {MUSH} from './083a-npc-mushroom.js';
import {AVATAR} from './111c-avatar.js';
import {FISHING} from './142-fishing.js';
const BOT=window.BOT={ready:false};
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
  const arrive=(x,z,near=.6*T)=>d2(x,z)<near;
  const thAt=th=>th.obj.getWorldPosition(new THREE.Vector3());
  const nearest=(list,ok=()=>true)=>{ let b=null, bd=1e18; for(const th of list){ if(!th||!th.obj||!ok(th))continue; const p=thAt(th), d=d2(p.x,p.z); if(d<bd){ bd=d; b=th; } } return b; };
  // go to a thing and use it as a double click does: true once used
  const use=(th,dt)=>{ if(!th)return false; const p=thAt(th), reach=(th.reach||T)*.8; if(d2(p.x,p.z)<=reach){ path=null; SHARED.target=null; SHARED.heading=Math.atan2(p.x-pos.x,p.z-pos.z); th.act&&th.act(); return true; }
    if(!path||Math.hypot(p.x-(path[path.length-1]||p).x,p.z-(path[path.length-1]||p).z)>T)walk(p.x,p.z); else walking(dt); return false; };
  const click=sel=>{ const b=[...document.querySelectorAll(sel)].find(e=>e.offsetParent!==null||e.closest(':not([hidden])')); if(b){ b.click(); return true; } return false; };
  const close=()=>{ for(const b of document.querySelectorAll('.pX'))if(b.offsetParent)b.click(); };
  const cash=()=>Math.round(INV.cash||0);
  // a merchant near enough to walk to who buys this group (FORAGE.BUYK) or sells this item: seen, on the map, within 300 m
  const seen=N=>{ for(let q=N&&N.g;q;q=q.parent)if(!q.visible)return false; return !!(N&&N.st&&isFinite(N.st.x)); };
  const merchant=(buys,sells)=>{ let b=null, bd=300; for(const N of NPCS){ if(!seen(N))continue; let tr=null; try{ tr=CHARS.trade&&CHARS.trade(N); }catch(e){} if(!tr)continue;
      if(buys&&!(tr.buys||[]).includes(buys))continue; if(sells&&!(tr.sells||[]).includes(sells))continue; const d=d2(N.st.x,N.st.z); if(d<bd){ bd=d; b=N; } } return b; };
  // walk to a merchant and press its buttons: true once done
  const atShop=(N,dt,fn)=>{ const p=N.st; if(d2(p.x,p.z)>2*T){ if(!path||Math.hypot(path[path.length-1].x-p.x,path[path.length-1].z-p.z)>T)walk(p.x,p.z); walking(dt); return false; }
    path=null; SHARED.target=null; fn(); return true; };
  const sellAll=()=>{ let n=0; while((click('[data-sold][data-n="all"]')||click('[data-sell][data-n="all"]'))&&n++<30); };
  const goal=()=>C.goal>0&&cash()>=C.goal;
  /* ---------- the jobs: each a step a frame, its state in task ---------- */
  const JOB={
    stand:()=>{ doing='standing'; },
    wander:dt=>{ if(walking(dt))return; task=task||{wait:0}; if((task.wait-=dt)>0){ doing='looking round'; return; }
      const h=home||{x:pos.x,z:pos.z}; for(let k=0;k<6;k++){ const a=R()*6.283, r=(2+R()*8)*T, x=h.x+Math.sin(a)*r, z=h.z+Math.cos(a)*r; if(!CITY.blocked||!CITY.blocked(lv(),x,z)){ walk(x,z); break; } }
      task.wait=2+R()*6; doing='wandering'; },
    goto:dt=>{ if(walking(dt)){ doing='walking there'; return; } doing='there'; },
    follow:dt=>{ const o=C.who&&ONLINE.others.get(C.who); if(!o||!o.p||o.why!=='near you'){ doing=o?'can\'t see '+o.name+' ('+o.why+')':'waiting for who to follow'; return; }
      const d=d2(o.p.x,o.p.z); if(d>2.2*T){ if(!path||(task&&Math.hypot(task.x-o.p.x,task.z-o.p.z)>T)){ task={x:o.p.x,z:o.p.z}; walk(o.p.x,o.p.z); } walking(dt); doing='following '+o.name; } else { path=null; SHARED.target=null; doing='with '+o.name; } },
    fight:dt=>{ const o=C.who&&ONLINE.others.get(C.who); if(!o){ doing='waiting for who to fight'; return; } fightOn(o,dt); },
    chat:dt=>{ JOB.wander(dt); doing='chatting'; },
    sit:dt=>{ if(st.sit){ doing='sitting'; return; } if(walking(dt))return; task=task||{n:0,t:0}; if((task.t-=dt)>0)return; task.t=1.5;
      for(let k=0;k<8;k++){ SHARED.heading=k*Math.PI/4; if(UI.useNear&&UI.useNear())return; }
      if(++task.n>4){ task.n=0; JOB.wander(dt); doing='looking for a seat'; } },
    mushrooms:dt=>{ if(goal()){ doing='made $'+cash()+' (goal reached)'; return; } task=task||{s:'find'};
      const F=FORAGE, have=Object.keys(INV.items).filter(id=>/^[mu]_/.test(id)&&INV.items[id]>0).reduce((a,id)=>a+INV.items[id],0);
      if(task.s==='find'){ if(LOOKS.L&&!LOOKS.L.bare)LOOKS.L.bare=true;
        const th=F.things?nearest(F.things()):null;
        if(task.hold>0)task.hold-=dt; if((!th||have>=(C.sellAt||12))&&have&&!(task.hold>0)){ task.s='sell'; return; } if(!th){ if(!task.park){ task.park=1; UI.goName('CENTRAL PARK'); doing='going to the park'; return; } JOB.wander(dt); doing='looking for mushrooms'; return; }
        doing='picking mushrooms ('+have+' in the bag)'; use(th,dt); return; }
      if(task.s==='sell'){ const M=seen(MUSH.N)&&d2(MUSH.N.st.x,MUSH.N.st.z)<300?MUSH.N:null, N=M||merchant('mushrooms');
        if(!N){ task={s:'find',park:1,hold:60}; doing='nobody buying mushrooms nearby (closed?), picking more'; return; }
        doing='taking '+have+' mushrooms to '+(N.name||'a merchant').toLowerCase(); if(!atShop(N,dt,()=>{ if(N===MUSH.N)F.SHOP.open(); else SHOPS.open(N); sellAll(); close(); SHOPS.close&&SHOPS.close(); }))return;
        task={s:'find',park:1}; say(lines()[0]||''); doing='sold, now $'+cash(); } },
    fish:dt=>{ if(goal()){ doing='made $'+cash()+' (goal reached)'; return; } task=task||{s:'gear'}; const F=FORAGE, fish=FISHING.held?FISHING.held():0, bait=['bait','bait_cut'].some(id=>F.has(id));
      const BAIT=['bait','bait_cut'], stand=nearest(UI.things,th=>/BOATS/.test(th.name||''));
      if(task.s==='gear'){ if(F.has('rod')&&bait){ task.s='cast'; return; } const N=merchant(null,F.has('rod')?'bait':'rod');
        if(!N){ const go=['TO THE HUDSON (THE PIER)','FISHING & SCUBA'][task.go||0]; if(go){ task.go=(task.go||0)+1; UI.goName(go); doing='going to buy fishing gear'; } else doing='can\'t find anyone selling rods or bait'; return; }
        doing=F.has('rod')?'buying bait':'buying a rod'; if(!atShop(N,dt,()=>{ SHOPS.open(N); if(!F.has('rod'))click('[data-buy="rod"]'); for(let i=0;i<5;i++)click('[data-buy="bait"]'); close(); SHOPS.close&&SHOPS.close(); }))return;
        if(!F.has('rod')||!BAIT.some(id=>F.has(id))){ doing='can\'t afford fishing gear ($'+cash()+')'; task.go=0; } return; }
      if(task.s==='sell'){ doing='selling '+fish+' fish'; const N=merchant('fish');
        if(N){ if(!atShop(N,dt,()=>{ SHOPS.open(N); sellAll(); close(); SHOPS.close&&SHOPS.close(); }))return; task={s:'gear'}; return; }
        if(stand){ if(!use(stand,dt))return; sellAll(); close(); task={s:'gear'}; return; } doing='nobody buying fish nearby'; task={s:'cast',hold:60}; return; }
      if(task.s==='cast'){ if(!bait&&!FISHING.state?.()){ task.s='gear'; return; } if(task.hold>0)task.hold-=dt; if(fish>=(FISHING.room?FISHING.room():5)&&!(task.hold>0)){ FISHING.leave&&FISHING.leave(); task.s='sell'; return; }
        const S=FISHING.state&&FISHING.state(); FISHING.auto=true; if(S&&S.st){ doing='fishing ('+S.st+'), '+fish+' caught'; return; }
        if(walking(dt))return; let best=null; for(let r=2;r<=12&&!best;r+=1.5)for(let k=0;k<16;k++){ const a=k*Math.PI/8, x=pos.x+Math.sin(a)*r*T, z=pos.z+Math.cos(a)*r*T; if(FISHING.at(x,z)){ best=[x,z]; break; } }
        if(!best){ if(stand&&!task.pier){ task.pier=1; const p=thAt(stand); walk(p.x,p.z); } else JOB.wander(dt); doing='looking for water'; return; }
        if(!FISHING.mode&&FISHING.enter)FISHING.enter(); FISHING.cast(best[0],best[1]); doing='casting'; } },
    decorate:dt=>{ const E=window.ROOMED; task=task||{s:'in',n:0,t:0};
      if(task.s==='in'){ if(MODS.apts&&MODS.apts.inReal){ task.s='buy'; return; } if(!task.go){ task.go=1; UI.goName('YOUR APARTMENT'); } doing='going home'; return; }
      if(!MODS.apts.inReal){ task={s:'in',n:0,t:0}; return; } if(!E){ doing='no decorating here'; return; }
      if(task.s==='buy'){ if(walking(dt))return; if((task.t-=dt)>0)return; task.t=2+R()*2; if(!E.on)E.toggle();
        const A=E._api&&E._api(), K=A?A.kinds():{}, budget=C.goal>0?C.goal:Infinity; task.spent=task.spent||0;
        const can=Object.keys(K).filter(k=>{ const q=K[k]; return q&&!q.bad&&!q.own&&k!=='CAT'&&(q.price??4)<=cash()&&task.spent+(q.price??4)<=budget; });
        if(!can.length||task.n>=12){ if(E.on)E.toggle(); task.s='done'; doing='decorated: '+task.n+' things bought'; return; }
        const k=can[Math.floor(R()*can.length)], before=cash(); if(E.buy(k)){ task.n++; task.spent+=before-cash(); doing='bought a '+k.toLowerCase().replace(/_/g,' '); }
        const a=R()*6.283; path=[{x:pos.x+Math.sin(a)*1.2*T,z:pos.z+Math.cos(a)*1.2*T}]; pi=0; stuck=0; last={x:pos.x,z:pos.z,t:0}; step(); return; }
      doing='decorated: '+task.n+' things bought'; } };
  /* ---------- fighting: face them, close in, a punch or a kick ---------- */
  const fightOn=(o,dt)=>{ if(!o.p||o.why!=='near you'||o.dead){ doing=o.dead?o.name+' is down':'looking for '+o.name; return false; }
    const d=d2(o.p.x,o.p.z); doing='fighting '+o.name;
    if(d>.9*T){ if(!path||(task&&task.fx!=null&&Math.hypot(task.fx-o.p.x,task.fz-o.p.z)>.5*T)){ walk(o.p.x,o.p.z); task=Object.assign(task||{},{fx:o.p.x,fz:o.p.z}); } walking(dt); return true; }
    path=null; SHARED.target=null; SHARED.heading=Math.atan2(o.p.x-pos.x,o.p.z-pos.z);
    fightOn.t=(fightOn.t||0)-dt; if(fightOn.t<=0){ fightOn.t=.7+R()*.6; const k=R()<.6?'J':'K'; RIG.act(st,k); SYS.run('act',k,1); setTimeout(()=>{ RIG.release&&RIG.release(st,k); SYS.run('act',k,0); },120); } return true; };
  const status=()=>({doing,cash:cash(),hp:Math.round((VIT.hp||0)*100)/100,job:C.job,at:[+pos.x.toFixed(1),+pos.z.toFixed(1)],...(path&&path.length?{to:[+path[path.length-1].x.toFixed(1),+path[path.length-1].z.toFixed(1)]}:{})});
  const place=()=>{ if(C.place){ UI.goName(C.place); setTimeout(()=>{ home={x:pos.x,z:pos.z}; },1500); }
    else if(C.at){ UI.goTo(C.at[0],C.at[1],'up'); home={x:C.at[0],z:C.at[1]}; } else home={x:pos.x,z:pos.z}; };
  const look=()=>{ if(C.look===looked)return; looked=C.look||''; try{ if(C.look)AVATAR.set(AVATAR.decode(C.look)); else if(AVATAR.outfits&&AVATAR.outfits.length)AVATAR.outfit(Math.floor(R()*AVATAR.outfits.length)); }catch(e){} };
  BOT.set=c=>{ const was=C; C=Object.assign({job:'stand'},c||{}); if(LOOKS.L)LOOKS.L.name=C.name||LOOKS.L.name; look();
    if(!placed||was.place!==C.place||String(was.at)!==String(C.at)){ placed=true; path=null; place(); }
    if(was.job!==C.job||was.who!==C.who){ task=null; path=null; SHARED.target=null; mad=null; if(FISHING.mode&&C.job!=='fish')FISHING.leave(); }
    if(VIT.hp>C.hp)VIT.hp=C.hp??1; };
  BOT.status=status; BOT.bye=()=>{ try{ ONLINE.send({t:'bye'}); }catch(e){} };
  SYS.add('life',dt=>{ if(!BOT.ready)return; dt=Math.min(dt||.016,.25);
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
