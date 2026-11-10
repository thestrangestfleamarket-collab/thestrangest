// THE AI DOUBLE (owner, 9 Nov 2026: "an assistant that is my duplicate but is powered by AI that follows me and i can talk to"): a bot (162g) made an owner's double looks like them, half see-through, follows them, and does what they say in the chat ("@..." or its name first), Claude working out how (worker/twin.js) and this page doing it with a player's own moves; its trades with its owner go through by themselves (159i).
import {SHARED} from './003-shx.js';
import {CHARS, CLOCK, FORAGE, INV, ONLINE, pos, ROOMS, SHOPS, st, UI, VIT} from './003b-systems.js';
import {FADE, QS, SYS, TILE} from './006-map-pre.js';
import {MINI} from './038zd-mini.js';
import {BODEGA} from './146ze-bodega.js';
import {SWAP} from './159i-trade.js';
import {BOT} from './162g-bots.js';
const TWINP={}; window.TWINP=TWINP;
{ const T=TILE, low=s=>String(s??'').toLowerCase().replace(/\s+/g,' ').trim();
  // every page: your own double (it says whose it is) trades with you at once
  SWAP.trust=id=>{ const o=ONLINE.others.get(id); return !!(o&&o.x&&o.x.twin&&ONLINE.me&&o.x.twin===ONLINE.me); };
  if(QS.get('bot')==='1'){ const K=BOT.kit, C=()=>K.cfg();
    ONLINE.mine.twin=()=>C().ai&&C().who?C().who:null;   // others draw it half see-through (111d), its owner trusts its trades
    ONLINE.lookAs=()=>{ const c=C(), o=c.ai&&ONLINE.others.get(c.who); return o&&o.look||null; };   // exactly its owner's look, as their game sends it
    SWAP.trust=id=>!!(C().ai&&id===C().who);
    const owner=()=>{ const c=C(); return c.ai&&c.who?ONLINE.others.get(c.who)||null:null; };
    const cash=()=>Math.round(INV.cash||0), nm=id=>FORAGE.name?FORAGE.name(id):id, m=d=>Math.round(d/T);
    const thAt=K.thAt, d2=K.d2, places=()=>[...new Set(UI.places().map(p=>p[0]).concat(C().apt?['YOUR APARTMENT']:[]))];
    // the best name match: exact, then starting with it, then holding it
    const score=(n,q)=>{ n=low(n); return !n||!q?0:n===q?3:n.startsWith(q)?2:n.includes(q)||(n.length>3&&q.includes(n))?1:0; };
    const best=(list,q,name,dist)=>{ q=low(q); let b=null, bs=0, bd=1e18; for(const x of list){ const s=score(name(x),q); if(!s)continue; const d=dist?dist(x):0; if(s>bs||s===bs&&d<bd){ b=x; bs=s; bd=d; } } return b; };
    const things=()=>UI.things.concat(FORAGE.things?FORAGE.things():[]).filter(th=>th&&th.obj&&th.name&&!th.player&&!/^YOU\b/.test(th.name));
    const thDist=th=>{ const p=thAt(th); return d2(p.x,p.z); };
    const near=(R,n)=>{ const seen=new Set(), out=[]; for(const th of things().map(th=>[th,thDist(th)]).filter(a=>a[1]<R*T).sort((a,b)=>a[1]-b[1])){ const k=th[0].name; if(seen.has(k))continue; seen.add(k); out.push(k+' '+m(th[1])+' m'); if(out.length>=n)break; } return out; };
    const people=()=>[...ONLINE.others.values()].filter(o=>o.p&&o.why==='near you');
    const where=()=>{ let n='', d=1e18; for(const p of UI.places()){ const q=Math.hypot(p[1]-pos.x,p[2]-pos.z); if(q<d){ d=q; n=p[0]; } } return n; };
    const shopRows=k=>[...document.querySelectorAll('#shopg .shr['+k+']')];
    // the bodega's register is its own window (146ze): everything sold there, picked into the basket and paid at once
    const reg=()=>!SHOPS.cur&&MINI.on&&/REGISTER/.test(MINI.on.title||'')&&BODEGA.all?BODEGA.all():null, regRows=A=>A.supplies.concat(A.shelves,A.goods), regName=r=>(r.brand?r.brand+' ':'')+r.name;
    const open=()=>!!(SHOPS.cur||reg());
    const shopLine=()=>{ const A=reg(); if(A)return 'THE BODEGA REGISTER\n  SELLS: '+regRows(A).map(r=>`${regName(r)} [${r.id}] $${r.price}`).join('; ');
      if(!SHOPS.cur)return ''; const row=r=>`${r.title} [${r.dataset.buy||r.dataset.sold}] ${(r.querySelector('i')||{}).textContent||''}`;
      const b=shopRows('data-buy').map(row), s=shopRows('data-sold').map(r=>row(r)+' (you have '+((r.querySelector('u')||{}).textContent||'')+')');
      return (SHOPS.cur.name||'A MERCHANT')+(b.length?'\n  SELLS: '+b.join('; '):'')+(s.length?'\n  BUYS FROM YOU: '+s.join('; '):''); };
    // any other window on its screen (a question, a talk, a book, a game): its buttons and lines, pressed as a click does
    const vis=e=>e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden';
    const winOf=e=>{ for(let p=e;p&&p!==document.body;p=p.parentElement)if(getComputedStyle(p).position==='fixed')return p; return null; };
    const label=e=>(e.title||e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,60);
    const windows=()=>{ const W=new Map(); for(const e of document.querySelectorAll('button,[data-i],[data-q],[role=button],[data-a]')){ if(!vis(e))continue; const w=winOf(e); if(!w||/^(onl|shopg)$/.test(w.id)||w.closest('#onl'))continue; const t=label(e); if(!t)continue; if(!W.has(w))W.set(w,[]); W.get(w).push([t,e]); } return W; };
    const winLine=()=>[...windows()].map(([w,L])=>((w.querySelector('h3,h2,b')||{}).textContent||w.id||'A WINDOW').replace(/\s+/g,' ').trim().slice(0,40)+': '+L.slice(0,30).map(x=>'['+x[0]+']').join(' ')).join('\n  ');
    const ownerLine=()=>{ const o=owner(); if(!o)return 'not in the game here right now'; return (o.name||'YOUR OWNER')+(o.why==='near you'&&o.p?', '+m(d2(o.p.x,o.p.z))+' m from you':', '+(o.why||'somewhere else')); };
    const pack=()=>Object.keys(INV.items).filter(id=>INV.items[id]>0).map(id=>nm(id)+' ['+id+'] x'+INV.items[id]);
    let doing='ready', FOLLOW=true;
    const brief=()=>[`YOU: ${ONLINE.myName?ONLINE.myName():'THE DOUBLE'} · $${cash()} · health ${Math.round((VIT.hp||0)*100)}% · ${SHARED.LVL==='down'?'underground':'street level'} · near ${where()}${ROOMS.cur&&ROOMS.cur.off?' · inside '+(ROOMS.cur.name||ROOMS.cur.off):''}${st.sit?' · sitting':''}`,
      `YOUR OWNER: ${ownerLine()}`, `THE HOUR: ${CLOCK.h!=null?Math.floor(CLOCK.h)+':'+String(Math.floor((CLOCK.h%1)*60)).padStart(2,'0'):'?'}`, `DOING: ${doing}${FOLLOW?' (following your owner when idle)':' (staying put when idle)'}`,
      open()?'SHOP WINDOW OPEN: '+shopLine():'', (w=>w?'OPEN WINDOWS: '+w:'')(winLine())].filter(Boolean).join('\n');
    const look=()=>[brief(), 'NEAR YOU: '+(near(40,40).join('; ')||'nothing'), 'PEOPLE NEAR YOU: '+(people().map(o=>(o.name||'TENANT')+' '+m(d2(o.p.x,o.p.z))+' m'+(o.id===C().who?' (your owner)':'')+(o.dead?' (down)':'')).join('; ')||'nobody'),
      'YOUR PACK: '+(pack().join('; ')||'empty'), 'PLACES YOU CAN GO TO: '+places().join('; ')].join('\n');
    const who=q=>{ q=low(q); const o=owner(); if(o&&(q==='owner'||q==='my owner'||score(o.name,q)===3))return o; return best(people(),q,o=>o.name||'',o=>d2(o.p.x,o.p.z)); };
    const item=(q,ids)=>ids.find(id=>id===q)||best(ids,q,nm);
    /* ---------- the tools: each done at once ({out, err}) or a step a frame ({tick, limit}: true while working) ---------- */
    const no=out=>({out,err:1});
    const TOOL={
      look:()=>({out:look()}),
      go_to_place:({place})=>{ const n=best(places(),place,x=>x); if(!n)return no('There is no place called "'+place+'". Places: '+places().join('; '));
        if(SHOPS.close)SHOPS.close(); if(MINI.on&&MINI.close)MINI.close(); UI.goName(n); return {limit:25,tick:(dt,s)=>FADE.busy||s.t<1.5?true:{out:'You are at '+n+'.\n'+brief()}}; },
      walk_to:({target})=>{ const o=who(target), th=o?null:best(things(),target,th=>th.name,thDist), p=o?o.p:th?thAt(th):null, n=o?o.name||'them':th&&th.name;
        if(!p)return no('Nothing and nobody called "'+target+'" near you. Near you: '+near(40,20).join('; '));
        K.walk(p.x,p.z); return {limit:60,tick:dt=>{ if(K.walking(dt))return true; const q=o?o.p||p:p, d=d2(q.x,q.z); return d<3*T?{out:'You are next to '+n+'.'}:no('Got as close as I could to '+n+': '+m(d)+' m away.'); }}; },
      use:({thing})=>{ const th=best(things(),thing,th=>th.name,thDist); if(!th||thDist(th)>80*T)return no('Nothing called "'+thing+'" near you. Near you: '+near(40,20).join('; '));
        return {limit:45,tick:(dt,s)=>{ if(!s.at){ if(K.use(th,dt))s.at=s.t; return true; } if(s.t-s.at<1)return true;
          return {out:'Used '+th.name+'.'+(open()?'\nSHOP WINDOW OPEN: '+shopLine():'')+(st.sit?' You are sitting.':'')}; }}; },
      buy:({item:q,count})=>{ const A=reg(), n=Math.max(1,Math.min(99,Math.floor(+count||1)));
        if(A){ const L=regRows(A), r=L.find(x=>x.id===q)||best(L,q,regName); if(!r)return no('The bodega does not sell "'+q+'".'); const c0=cash(); BODEGA.basket.clear(); BODEGA.pick(r.id,n); const why=BODEGA.pay(); if(why){ BODEGA.basket.clear(); return no('Could not buy it: '+why); }
          return {out:`Bought ${n} ${regName(r)} for $${c0-cash()}. You have $${cash()} left.`}; }
        if(!SHOPS.cur)return no('No shop window is open: use its merchant or register first.'); const rows=shopRows('data-buy'), r=rows.find(x=>x.dataset.buy===q)||best(rows,q,x=>x.title);
        if(!r)return no('This shop does not sell "'+q+'". '+shopLine()); const id=r.dataset.buy, rent=!!r.dataset.rent, c0=cash(); let k=0;
        for(;k<n;k++)if(!SHOPS.buy(id,1,rent))break;
        return k?{out:`Bought ${k} ${r.title} for $${c0-cash()}. You have $${cash()} left.`}:no(`Could not buy ${r.title}: it costs ${(r.querySelector('i')||{}).textContent||'more'}, you have $${cash()}.`); },
      sell:({item:q,count})=>{ if(!SHOPS.cur)return no('No shop window is open: use its merchant first.'); const rows=shopRows('data-sold'), r=rows.find(x=>x.dataset.sold===q)||best(rows,q,x=>x.title);
        if(!r)return no('This shop does not buy "'+q+'" from you. '+shopLine()); const id=r.dataset.sold, n=Math.max(1,Math.min(INV.items[id]||0,Math.floor(+count||1))), c0=cash();
        return SHOPS.sell(id,n)?{out:`Sold ${n} ${r.title} for $${cash()-c0}. You have $${cash()}.`}:no('Could not sell it.'); },
      give_owner:({items,cash:c})=>{ const o=owner(); if(!o||o.why!=='near you'||!o.p)return no('Your owner is not near you ('+ownerLine()+').');
        const ids=Object.keys(INV.items).filter(id=>INV.items[id]>0), give={}; for(const x of items||[]){ const id=item(x&&x.item,ids); if(id)give[id]=Math.max(1,Math.min(INV.items[id],Math.floor(+x.count||1))); }
        c=Math.max(0,Math.min(cash(),Math.floor(+c||0))); if(!Object.keys(give).length&&!c)return no('Nothing to give: those things are not in your pack. Your pack: '+(pack().join('; ')||'empty'));
        const was={...INV.items}, c0=cash();
        return {limit:45,tick:(dt,s)=>{ const p=o.p||{x:pos.x,z:pos.z}, d=d2(p.x,p.z);
          if(!s.at){ if(d>1.6*T){ if(!s.w||(s.w-=dt)<=0){ s.w=2; K.walk(p.x,p.z); } K.walking(dt); return true; } K.stop(); s.at=s.t; SWAP.give(o,give,c); return true; }
          const S=SWAP.state(); if(S.open){ s.open=1; return true; } if(!s.open&&s.t-s.at<6)return true;
          const gone=Object.keys(give).filter(id=>(INV.items[id]||0)<(was[id]||0)).map(id=>((was[id]||0)-(INV.items[id]||0))+' '+nm(id)), paid=c0-cash();
          return gone.length||paid>0?{out:'Gave '+(o.name||'your owner')+' '+gone.concat(paid>0?['$'+paid]:[]).join(', ')+'.'}:no('The trade did not go through (are they busy in another trade or window?).'); }}; },
      press:({button})=>{ const all=[...windows().values()].flat(), q=low(button), hit=all.find(x=>low(x[0])===q)||best(all,button,x=>x[0]);
        if(!hit)return no('No button or line "'+button+'" in an open window.'+(all.length?' Open windows:\n  '+winLine():' No window is open.'));
        hit[1].click(); return {limit:5,tick:(dt,s)=>s.t<.7?true:{out:'Pressed '+hit[0]+'.'+(open()?'\nSHOP WINDOW OPEN: '+shopLine():'')+(windows().size?'\nOPEN WINDOWS: '+winLine():'')+'\nYOU: $'+cash()+'; YOUR PACK: '+(pack().join('; ')||'empty')}}; },
      follow:({on})=>{ FOLLOW=!!on; return {out:FOLLOW?'Following your owner when idle.':'Staying put when idle.'}; },
      sit:()=>{ K.reset(); return {limit:40,tick:dt=>{ K.JOB.sit(dt); return st.sit?{out:'Sitting.'}:true; }}; },
      fight:({who:q})=>{ const o=who(q); if(!o)return no('Nobody called "'+q+'" near you. People near you: '+(people().map(o=>o.name).join('; ')||'nobody')); K.reset();
        return {limit:90,tick:dt=>K.fightOn(o,dt)?true:o.dead?{out:(o.name||'They')+' is down.'}:no('Lost sight of '+(o.name||'them')+'.')}; },
      stop:()=>{ K.stop(); K.reset(); return {out:'Stopped.'}; },
      wait:({seconds})=>{ const n=Math.max(1,Math.min(60,Math.floor(+seconds||1))); return {limit:61,tick:(dt,s)=>s.t<n?true:{out:'Waited '+n+' s.'}}; } };
    let cur=null;
    const run=c=>new Promise(res=>{ const done=r=>res({id:c.id,out:String((r&&r.out)||'done').slice(0,4000),err:r&&r.err?1:0}), f=TOOL[c.name]; if(!f)return done(no('No such move: '+c.name));
      let r; try{ r=f(c.input||{}); }catch(e){ return done(no('It went wrong: '+String(e.message||e).slice(0,120))); } if(r&&r.tick){ cur={...r,t:0,done}; return; } done(r); });
    const cancel=why=>{ if(!cur)return; const s=cur; cur=null; K.stop(); s.done(no(why)); };
    // idle: near its owner (into the room or down the stairs they went, as GO TO does), or where it stands
    let jumpT=0; const idle=dt=>{ if(!FOLLOW){ K.JOB.stand(dt); return; } const o=owner(); if(o&&o.why==='near you'){ K.JOB.follow(dt); return; }
      const L=o&&o.s&&o.s[o.s.length-1]; if(!L){ K.doing(o?'waiting to see '+o.name:'waiting for my owner'); return; } if((jumpT-=dt)>0||FADE.busy)return; jumpT=8;
      if(L.rm&&!/^apt:/.test(L.rm)&&ROOMS.off&&ROOMS.off[L.rm]&&ROOMS.enterAt)ROOMS.enterAt(L.rm,[L.x,L.z,0,0]); else if(!L.rm&&ROOMS.cur&&ROOMS.cur.off&&ROOMS.exit)ROOMS.exit(ROOMS.cur.off); else if(!L.rm)UI.goTo(L.x+T,L.z,typeof L.lv==='number'?L.lv:L.lv==='down'?'down':'up');
      K.doing('catching up with '+(o.name||'my owner')); };
    BOT.over=dt=>{ if(!C().ai)return false; if(cur){ const s=cur; s.t+=dt; let r; try{ r=s.tick(dt,s); }catch(e){ r=no('It went wrong: '+String(e.message||e).slice(0,120)); }
      if(r===true&&s.t<s.limit)return true; if(cur===s)cur=null; K.stop(); s.done(r===true?no('Not finished after '+s.limit+' s.'):r); return true; }
      idle(dt); return true; };
    /* ---------- orders: its owner's chat to it, each one a talk with its mind until it is done ---------- */
    const sayAll=t=>{ t=String(t||'').replace(/\s+/g,' ').trim(); const parts=[]; while(t.length>190){ let i=t.lastIndexOf(' ',190); if(i<60)i=190; parts.push(t.slice(0,i)); t=t.slice(i).trim(); } if(t)parts.push(t); parts.forEach((p,i)=>setTimeout(()=>K.say(p),i*2500)); };
    const heard=t=>{ t=String(t||'').trim(); const me=low(ONLINE.myName?ONLINE.myName():''); let r=/^@\s*([\s\S]*)$/.exec(t);
      if(!r&&me&&low(t).startsWith(me))r=[0,t.slice(me.length)]; if(!r)r=/^(?:twin|double)\b([\s\S]*)$/i.exec(t); return r?String(r[1]).replace(/^[\s,:!.-]+/,'').trim()||null:null; };
    let seq=0;
    const ask=async body=>{ try{ const q=await fetch('/twin',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify(body)}); return await q.json().catch(()=>({why:'the server answered '+q.status})); }catch(e){ return {why:'the server did not answer'}; } };
    const think=async said=>{ const my=++seq, key=Math.random().toString(36).slice(2,12); cancel('Stopped: a new order came.'); const o=owner(); let body={say:said,owner:o&&o.name||'',key};
      doing='thinking about: '+said.slice(0,80); K.doing(doing);
      for(let i=0;i<40;i++){ body.state=brief(); const r=await ask(body); if(my!==seq)return;
        if(r.say)sayAll(r.say); if(r.why){ sayAll('(I can\'t think right now: '+r.why+')'); break; } if(r.done||!r.calls||!r.calls.length)break;
        const results=[]; for(const c of r.calls){ doing=c.name.replace(/_/g,' ')+' '+Object.values(c.input||{}).map(v=>typeof v==='object'?JSON.stringify(v):v).join(' ').slice(0,60); K.doing(doing); results.push(await run(c)); if(my!==seq)return; }
        body={results,key}; }
      if(my===seq){ doing='ready'; K.doing(doing); } };
    // its owner's message, or anything they say within 20 m, is for it; from further off, "@..." or its name first
    const close=()=>{ const o=owner(); return !!(o&&o.why==='near you'&&o.p&&d2(o.p.x,o.p.z)<20*T); };
    const order=(text,pm)=>heard(text)||((pm||close())&&String(text||'').trim())||null;
    SYS.add('said',(id,text,pm)=>{ const c=C(); if(!c.ai||id!==c.who)return; const t=order(text,pm); if(t)think(t); },'162gb-twin');
    Object.assign(TWINP,{TOOL,heard,order,look,brief,think,things,dist:th=>thDist(th)/T,sells:N=>!!(CHARS.trade&&CHARS.trade(N)),state:()=>({doing,FOLLOW,busy:!!cur})});
  }
}
