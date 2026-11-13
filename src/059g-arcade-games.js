// THE ARCADE'S GAMES, the shared cabinet layer: each cabinet's game registers here (STORE.cabs.add: its name, the skill it trains, its lore, and its game as its own chunk, fetched the first time you play it); the window a game plays in over the page (a play costs $2 and trains the skill by your score), the best scores, the title cards, and the attract mode the cabinets' screens run. A cabinet whose game is not built yet shows its card: COMING SOON.
import {FORAGE, keys, SFX, UI} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {STORE, SYS} from './006-map-pre.js';
STORE.cabs={tick:null,on:false,K:null,reg:{},add:e=>{ STORE.cabs.reg[e.name]=e; },walls:{e:['RAINBOW RUN','GALAXY RAID','MAZE'],w:['ROAD 85','TORCHBEARER'],b:['PETRI']}};   // the cabinets along each wall of the room, door to back; the BBS lists them in this order too
SYS.add('places',dt=>{ if(STORE.cabs.tick)STORE.cabs.tick(dt); },'arcade games');
STORE.cabs.play=name=>STORE.cabs.kit().open(name);
STORE.cabs.kit=()=>{ '@arcade'; const C=STORE.cabs; if(C.K)return C.K;
  const W=256, H=224, R=Math.random, ri=n=>Math.floor(R()*n), cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  let MUTE=false;
  const tx=(c,s,x,y,col,sz=8,al='left')=>{ c.font=`bold ${sz}px monospace`; c.textAlign=al; c.textBaseline='top'; c.fillStyle='#000'; c.fillText(s,x+1,y+1); c.fillStyle=col; c.fillText(s,x,y); };
  const bmp=(c,rows,x,y,col,k=1)=>{ c.fillStyle=col; rows.forEach((r,j)=>{ for(let i=0;i<r.length;i++)if(r[i]==='#')c.fillRect(Math.round(x+i*k),Math.round(y+j*k),k,k); }); };
  const beep=(f,d=.08,ty='square',v=.06,f2)=>{ if(MUTE)return; const a=SFX.live&&SFX.live(); if(!a||!SFX.on)return; const o=a.createOscillator(), g=a.createGain(), t=a.currentTime; o.type=ty; o.frequency.setValueAtTime(f,t); if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
    g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(g); g.connect(SFX.out(a)); o.start(t); o.stop(t+d+.02); };
  const DIRS={L:[-1,0],R:[1,0],U:[0,-1],D:[0,1]}, OPP={L:'R',R:'L',U:'D',D:'U'};
  const mv=(e,sp,ok,wrap)=>{ if(e.pick&&!e.d)e.pick(e); if(e.n&&e.d&&e.n===OPP[e.d]){ const v=DIRS[e.d]; e.x+=v[0]; e.y+=v[1]; if(wrap)e.x=(e.x+wrap)%wrap; e.t=1-e.t; e.d=e.n; }
    if(!e.d){ if(e.n&&ok(e.x+DIRS[e.n][0],e.y+DIRS[e.n][1]))e.d=e.n; else return; }
    e.t+=sp; while(e.t>=1){ const v=DIRS[e.d]; e.x+=v[0]; e.y+=v[1]; if(wrap)e.x=(e.x+wrap)%wrap; e.t-=1; if(e.pick)e.pick(e);
      if(e.n&&ok(e.x+DIRS[e.n][0],e.y+DIRS[e.n][1]))e.d=e.n; else if(!ok(e.x+DIRS[e.d][0],e.y+DIRS[e.d][1])){ e.t=0; e.d=null; return; } } };
  const at=e=>e.d?[e.x+DIRS[e.d][0]*e.t,e.y+DIRS[e.d][1]*e.t]:[e.x,e.y];
  const held=K=>K.L?'L':K.R?'R':K.U?'U':K.D?'D':null;
  const pops=(s,c)=>{ for(const p of s.pops){ c.globalAlpha=Math.min(1,p.t); tx(c,p.s,p.x,p.y-(1.2-p.t)*10,p.c||'#fff',8,'center'); } c.globalAlpha=1; }, popTick=(s,dt)=>{ for(const p of s.pops)p.t-=dt; s.pops=s.pops.filter(p=>p.t>0); };
  const LIB={W,H,R,ri,cl,tx,bmp,beep,DIRS,OPP,mv,at,held,pops,popTick};
  const lore=n=>C.reg[n].lore;
  const game=e=>e.G||(e.game&&LOADED(e.game.chunk)?(e.G=e.game(LIB)):null);   // a game's maker, once its chunk is here
  const BK='arcade-best', bests=()=>{ try{ return JSON.parse(OWNED.get(BK)||'{}')||{}; }catch(e){ return {}; } };
  const setBest=(n,v)=>{ const b=bests(); if(v<=(b[n]||0))return false; b[n]=v; OWNED.set(BK,JSON.stringify(b)); return true; };
  // the shared high-score table: a top ten a cabinet with three initials, kept by the worker (/scores); off the website (the single-file page) a copy of your own runs stands in
  const TK='arcade-top', TOP={}, srv=/^http/.test(location.protocol), mirror=()=>{ if(srv)return {}; try{ return JSON.parse(OWNED.get(TK)||'{}')||{}; }catch(e){ return {}; } };
  const ask=body=>srv?fetch('/scores',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify(body)}).then(r=>r.ok?r.json():null).catch(()=>null):Promise.resolve(null);
  const topOf=n=>TOP[n]||(TOP[n]=(mirror()[n]||[]).slice(0,10)), refresh=n=>ask({cab:n}).then(j=>{ if(!j||!j.top)return; if(n==='*')for(const k in j.top)TOP[k]=j.top[k]; else TOP[n]=j.top; });
  const qualifies=(n,v)=>v>0&&(topOf(n).length<10||v>topOf(n)[9].score);
  const post=(n,ini,score,sub)=>{ const l=topOf(n); l.push({ini,score,sub}); l.sort((a,b)=>b.score-a.score); l.length=Math.min(l.length,10); const rank=l.findIndex(e=>e.ini===ini&&e.score===score)+1; if(!srv){ const m=mirror(); m[n]=l; OWNED.set(TK,JSON.stringify(m)); }
    return ask({cab:n,put:{ini,score,sub}}).then(j=>{ if(j&&j.top){ TOP[n]=j.top; return j.rank||rank; } return rank; }); };
  const hi=n=>{ const t=topOf(n)[0]; return t?t.score+' '+t.ini:String(bests()[n]||0); };
  refresh('*');

  const card=(c,name,blink)=>{ const L=lore(name), e=C.reg[name], b=hi(name); c.fillStyle='#05040a'; c.fillRect(0,0,W,H);
    tx(c,name,128,30,L.col,name.length>11?16:20,'center'); tx(c,L.maker+' · '+L.place+' '+L.year,128,58,'#a090c0',8,'center'); tx(c,L.tag,128,80,'#e8f0ff',8,'center');
    L.story.forEach((l,i)=>tx(c,l,128,104+i*11,'#7a6a90',7,'center')); tx(c,'HI-SCORE '+b,128,146,'#ffe83c',10,'center');
    if(!e.game)tx(c,'COMING SOON',128,176,'#ffe83c',10,'center'); else if(blink)tx(c,'INSERT $2',128,176,'#5aff6a',10,'center'); tx(c,'©'+L.year+' '+L.maker,128,206,'#4a3a60',7,'center'); };
  const table=(c,name)=>{ const L=lore(name), l=topOf(name); c.fillStyle='#05040a'; c.fillRect(0,0,W,H); tx(c,name,128,12,L.col,name.length>11?14:18,'center'); tx(c,'THE TOP TEN',128,38,'#e8f0ff',8,'center');
    if(!l.length)tx(c,'NO ONE YET. BE THE FIRST.',128,110,'#7a6a90',8,'center'); l.forEach((e,i)=>{ const y=56+i*14, col=i?'#e8f0ff':'#ffe83c'; tx(c,String(i+1).padStart(2),34,y,'#7a6a90',8); tx(c,e.ini,58,y,col,8); tx(c,String(e.score),152,y,col,8,'right'); if(e.sub)tx(c,e.sub,226,y,'#a090c0',7,'right'); });
    tx(c,'INSERT $2',128,206,'#5aff6a',8,'center'); };
  const crt=c=>{ c.fillStyle='rgba(0,0,0,.28)'; for(let y=0;y<H;y+=2)c.fillRect(0,y,W,1); const v=c.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.8); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,.55)'); c.fillStyle=v; c.fillRect(0,0,W,H);
    const g=c.createLinearGradient(0,0,W,H); g.addColorStop(0,'rgba(255,255,255,.10)'); g.addColorStop(.35,'rgba(255,255,255,0)'); c.fillStyle=g; c.fillRect(0,0,W,H); };
  const demo=name=>{ const e=C.reg[name], cv=document.createElement('canvas'); cv.width=W; cv.height=H; const c=cv.getContext('2d'); let g=null, t=0, page=1, kt=0, dead=0; const K={}, T={};
    return {cv,step(dt){ t+=dt; const G=game(e); MUTE=true; try{ if(page===0){ if(!G){ page=1; t=0; return; } if(!g)g=G.make(); kt-=dt; if(kt<=0){ kt=.15+R()*.45; for(const k of 'LRUDF')K[k]=0; const k='LRUDF'[ri(5)]; K[k]=1; T[k]=1; if(G.attract)G.attract(K,g); }
        g.step(dt,K,T); for(const k in T)delete T[k]; if(g.over){ dead+=dt; if(dead>2){ g=null; dead=0; page=1; t=0; } } else if(t>30){ g=null; page=1; t=0; } } else if(t>7){ page=page===1&&topOf(name).length?2:G?0:1; t=0; } } finally{ MUTE=false; } },   // the card, the top ten, then the game playing itself
      draw(){ const G=game(e); if(page===0&&g)g.draw(c); else if(page===2)table(c,name); else card(c,name,Math.floor(performance.now()/500)%2); if(page===0&&g)tx(c,'INSERT $2',128,G.insert||4,Math.floor(performance.now()/500)%2?'#5aff6a':'rgba(0,0,0,0)',8,'center'); crt(c); }}; };

  const open=name=>{ if(C.on)return; const e=C.reg[name]; if(!e)return; const L=e.lore;
    let mode='title', g=null, wait=0, msg='', nb=false, G=game(e), loading=!!e.game&&!G, slot=0, rank=0; const CH=' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', ini=[...(OWNED.get('arcade-ini')||'AAA').padEnd(3,'A').slice(0,3)]; refresh(name);
    if(loading)LOAD(e.game.chunk).then(()=>{ G=game(e); loading=false; },err=>{ loading=false; msg='THE GAME DID NOT LOAD'; console.warn(err); });
    const box=document.createElement('div'); box.id='cabwin';
    box.style.cssText='position:fixed;inset:0;z-index:40;background:radial-gradient(circle at 50% 45%,rgba(30,12,40,.9),rgba(2,1,4,.96));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font:bold 13px monospace;color:#fff;user-select:none;touch-action:none';
    const cv=document.createElement('canvas'); cv.width=W; cv.height=H; cv.style.cssText=`image-rendering:pixelated;width:min(94vw,calc((100vh - 170px)*256/224));aspect-ratio:256/224;border:10px solid #120c18;border-radius:14px;box-shadow:0 0 0 3px ${L.col}55,0 0 60px ${L.col}40,inset 0 0 30px #000`;
    const top=document.createElement('div'); top.textContent=name; top.style.cssText=`font-size:22px;letter-spacing:4px;color:${L.col};text-shadow:0 0 12px ${L.col}`;
    const sub=document.createElement('div'); sub.textContent=L.maker+' · '+L.place+' '+L.year; sub.style.cssText='font-size:11px;letter-spacing:2px;color:#8a7aa0';
    const foot=document.createElement('div'); foot.style.cssText='color:#a090c0;font-size:12px'; foot.textContent=e.game?'SPACE TO START · ESC TO LEAVE':'ESC TO LEAVE';
    box.append(top,sub,cv,foot); const c=cv.getContext('2d');
    const K={L:0,R:0,U:0,D:0,F:0,H:0}, T={}, map=k=>({arrowleft:'L',a:'L',arrowright:'R',d:'R',arrowup:'U',w:'U',arrowdown:'D',s:'D',' ':'F',enter:'F',z:'F',x:'F',c:'H',shift:'H'})[k];
    if(matchMedia('(pointer:coarse)').matches){ const pad=document.createElement('div'); pad.style.cssText='display:flex;gap:10px';
      for(const [k,l] of [['L','◀'],['U','▲'],['D','▼'],['R','▶'],['F','●'],...(e.hold?[['H','H']]:[]),['X','✕']]){ const b=document.createElement('button'); b.textContent=l; b.style.cssText='width:50px;height:46px;font-size:20px;background:#241a30;color:#fff;border:2px solid #5a3a70;border-radius:8px';
        b.onpointerdown=ev=>{ ev.preventDefault(); if(k==='X')return close(); if(!K[k])T[k]=1; K[k]=1; }; b.onpointerup=b.onpointerleave=()=>{ if(k!=='X')K[k]=0; }; pad.append(b); } box.append(pad); }
    cv.addEventListener('pointermove',ev=>{ const r=cv.getBoundingClientRect(); K.mx=(ev.clientX-r.left)/r.width*W; K.my=(ev.clientY-r.top)/r.height*H; }); cv.addEventListener('pointerleave',()=>{ K.mx=K.my=null; });   // a game that steers by the pointer (PETRI) reads where it is over the screen
    const kd=ev=>{ ev.stopPropagation(); const k=(ev.key||'').toLowerCase(); if(k==='escape'){ ev.preventDefault(); close(); return; } const m=map(k); if(!m)return; ev.preventDefault(); if(!ev.repeat&&!K[m])T[m]=1; K[m]=1; };
    const ku=ev=>{ ev.stopPropagation(); const m=map((ev.key||'').toLowerCase()); if(m)K[m]=0; }, blur=()=>{ for(const k in K)K[k]=0; };
    const coin=()=>{ msg='';   // free to play (owner, 4 Nov 2026: the arcade is free)
      beep(988,.08); setTimeout(()=>beep(1319,.15),80); return true; };
    const again=()=>{ mode='over'; wait=1.2; foot.textContent='SPACE TO PLAY AGAIN ($2) · ESC TO LEAVE'; };
    const end=()=>{ nb=setBest(name,g.score); const amt=1+G.grade.filter(v=>g.score>=v).length; if(e.skill)FORAGE.train(e.skill,400,0,amt); rank=0;
      if(qualifies(name,g.score)){ mode='initials'; slot=0; foot.textContent='▲▼ LETTER · ◀▶ SLOT · SPACE TO ENTER'; beep(1568,.6,'square',.05,2093); } else { if(nb)beep(1568,.6,'square',.05,2093); again(); } };
    const enter=()=>{ const s=ini.join(''); OWNED.set('arcade-ini',s); again(); post(name,s,g.score,g.sub||'').then(r=>{ rank=r; }); beep(1319,.2,'square',.05,1760); };
    const close=()=>{ if(!C.on)return; C.on=false; C.tick=null; UI.gamewin=document.getElementById('bbswin')?'bbs':null; removeEventListener('keydown',kd,true); removeEventListener('keyup',ku,true); removeEventListener('blur',blur); box.remove(); keys.clear(); };
    C.close=close; C.dbg=()=>({name,mode,loaded:!!G,loading,score:g?g.score:0,over:g?g.over:false,top:topOf(name),ini:ini.join(''),rank,g:g&&g.dbg?g.dbg():null}); C.cheat={over:(score,sub)=>{ if(mode==='play'&&g){ g.score=score; if(sub)g.sub=sub; g.over=true; } }};
    C.tick=dt=>{ if(mode==='title'||mode==='over'){ wait=Math.max(0,wait-dt); if(T.F&&wait<=0&&G&&coin()){ g=G.make(); mode='play'; nb=false; foot.textContent='ESC TO LEAVE'; } }
      else if(mode==='play'){ g.step(dt,K,T); if(g.over)end(); }
      else if(mode==='initials'){ if(T.U||T.D){ const i=CH.indexOf(ini[slot]); ini[slot]=CH[(i+(T.U?1:CH.length-1))%CH.length]; beep(500,.04); } if(T.L&&slot>0)slot--; if(T.R&&slot<2)slot++; if(T.F){ if(slot<2)slot++; else enter(); } }
      for(const k in T)delete T[k];
      const bl=Math.floor(performance.now()/400)%2;
      if(mode==='title'&&!g){ card(c,name,false); if(G){ G.help.forEach((l,i)=>tx(c,l,128,166+i*11,'#e8f0ff',8,'center')); tx(c,msg||(bl?'INSERT $2 · PRESS SPACE':''),128,192,msg?'#ff3c5a':'#5aff6a',8,'center'); } else if(loading)tx(c,'LOADING',128,192,'#a090c0',8,'center'); else if(msg)tx(c,msg,128,192,'#ff3c5a',8,'center'); return; }
      g.draw(c);
      if(mode!=='play'){ c.fillStyle='rgba(0,0,0,.65)'; c.fillRect(20,62,216,104); c.strokeStyle=L.col; c.strokeRect(20.5,62.5,215,103);
        tx(c,'GAME OVER',128,72,'#ff3c5a',14,'center'); tx(c,'SCORE '+g.score+(g.sub?' · '+g.sub:''),128,94,'#fff',10,'center');
        if(mode==='initials'){ tx(c,'YOU MADE THE TOP TEN. YOUR INITIALS:',128,110,'#ffe83c',7,'center'); ini.forEach((ch,i)=>{ const x=108+i*20, on=i===slot; if(on&&bl){ c.fillStyle=L.col; c.fillRect(x-7,124,14,16); } tx(c,ch,x,127,on&&bl?'#000':'#fff',12,'center'); }); tx(c,'▲▼ LETTER  ◀▶ SLOT  SPACE',128,150,'#a090c0',7,'center'); }
        else { tx(c,rank>0?'RANK '+rank+' OF THE TOP TEN':nb?'NEW HIGH SCORE!':'HI-SCORE '+hi(name),128,110,(rank>0||nb)&&bl?'#ffe83c':'#a090c0',8,'center'); tx(c,msg||(bl?'INSERT $2 · PRESS SPACE':''),128,146,msg?'#ff3c5a':'#5aff6a',8,'center'); } } };
    keys.clear(); addEventListener('keydown',kd,true); addEventListener('keyup',ku,true); addEventListener('blur',blur); document.body.append(box); C.on=true; UI.gamewin='cab'; beep(660,.1); };   // gamewin: the pad and the headset drive the game, not the page
  C.ini=()=>OWNED.get('arcade-ini')||''; return C.K={LIB,lore,game,open,demo,crt,top:topOf,post,refresh}; };
