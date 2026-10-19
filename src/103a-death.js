{ const T=TILE, el=document.createElement('div'), css=document.createElement('style'); el.id='dead'; el.hidden=true;
  css.textContent='#dead{position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top,0px));transform:translateX(-50%);font:12px var(--pixel);color:var(--key);background:var(--panel);border:2px solid var(--line);padding:6px 10px;z-index:15;pointer-events:none;zoom:var(--uiz,1)} #dead[hidden]{display:none}';
  document.head.appendChild(css); document.body.appendChild(el);
  const DEAD='YOU ARE DEAD. FIND THE BATH HOUSE.', note=(t,s)=>{ el.textContent=t; el.hidden=false; clearTimeout(note.t); if(s)note.t=setTimeout(()=>{ if(VIT.dead)note(DEAD); else el.hidden=true; },s*1000); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), frames=k=>new Promise(r=>{ const f=()=>--k<=0?r():requestAnimationFrame(f); requestAnimationFrame(f); });
  const look=on=>{ for(const m of [W3.flat,W3.toon]){ m.transparent=on; m.needsUpdate=true; } W3.mesh.castShadow=!on; };
  let gh=0, rise=-1, busy=false;
  VIT.die=()=>{ if(VIT.dead)return; VIT.dead=true; VIT.hp=0; VIT.out=2.4; trip=true; gh=0; rise=-1; try{ SAVE.set('dead','1'); }catch(e){} look(true); note(DEAD); };
  const back=async()=>{ busy=true; const f=document.getElementById('subfade');
    if(f){ f.textContent='LOADING…'; f.style.pointerEvents='auto'; f.style.opacity='1'; } await wait(1800);
    const G=BOD.GD, K=BOD.GDK, dx=G.door[0], oy=K?K.y1e+.6:G.door[1]+3;
    STORE.goTo(BOD.X(dx),BOD.Z(oy),'up'); heading=BOD.Z(oy+1)>BOD.Z(oy)?0:Math.PI; if(typeof PH!=='undefined')PH.hd=heading; keys.clear(); target=null;
    VIT.dead=false; VIT.hp=1; VIT.out=0; gh=0; rise=-1; W3.GH.value=0; look(false); try{ SAVE.del('dead'); }catch(e){} LOOKS.robe(true);
    await frames(3); await wait(260); if(f){ f.style.opacity='0'; f.style.pointerEvents='none'; } note('You feel refreshed.',5); busy=false; };
  const t0=VIT.tick; VIT.tick=dt=>{ t0(dt); if(!VIT.dead||busy)return; VIT.hp=0;
    if(rise<0){ gh=Math.min(1,gh+dt/1.5); if(gh>=1&&VIT.out<=0&&BOD.GD&&LVL==='up'&&py<2*T&&BOD.GD.inside())rise=0; }
    else{ rise+=dt; keys.clear(); target=null; gh=1+Math.min(1,rise/3); if(rise>=3.2)back(); }
    W3.GH.value=gh; W3.group.position.y+=(Math.min(gh,1)*(.16+.04*Math.sin(performance.now()/1000*1.6))+(rise>0?.6*rise*rise:0))*T; };
  window.KILLME=()=>VIT.die();
  if(SAVE.get('dead')==='1'){ VIT.dead=true; VIT.hp=0; gh=1; look(true); note(DEAD); }
  if(QS.get('die')){ const go=()=>window.__started?VIT.die():setTimeout(go,200); setTimeout(go,300); } }
