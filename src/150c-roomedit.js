// THE ROOM EDITOR: DECORATE your apartment (owner, 25 Oct 2026: "full control"): T in your apartment; click a thing to pick it up and drag it, Q/E turn, the wheel resizes, [ ] raise and lower, DEL puts it away; a panel adds things, brings back what you put away, and sets the walls, the floor and every light; saved to your account.
import {SHARED, THREE} from './003-shx.js';
import {pos} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {MODS, SYS} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
{ const HOME={layout:null,loaded:false}, LS='market-home', web=/^https?:$/.test(location.protocol);
  const getLocal=()=>{ try{ return JSON.parse(localStorage.getItem(LS)||'null'); }catch(e){ return null; } };
  const setLocal=L=>{ try{ localStorage.setItem(LS,JSON.stringify(L)); }catch(e){} };
  const ask=async body=>{ const r=await fetch('/home',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify(body)}); if(!r.ok)throw new Error(r.status); return r.json(); };
  HOME.load=async()=>{ let L=null; if(web){ try{ L=(await ask({})).home; }catch(e){} } if(!L)L=getLocal(); HOME.layout=L; HOME.loaded=true; if(L&&ROOMK.api)apply(ROOMK.api,L); };
  HOME.save=async L=>{ HOME.layout=L; setLocal(L); if(web){ try{ await ask({put:L}); HOME.saved=Date.now(); }catch(e){ HOME.err=String(e); } } };

  /* ---------- a room as a layout: where every piece stands, what you added and put away, the walls, the floor, the lights ---------- */
  const r3=x=>Math.round(x*1000)/1000;
  const snapshot=A=>{ const things={}, added=[], lights={};
    for(const un of A.units()){ const t=A.getT(un), e={u:r3(t.u),h:r3(t.h),v:r3(t.v),ry:r3(t.ry),s:r3(t.s)}; if(un.gone)e.gone=1; if(un.added)added.push({id:un.id,kind:un.kind,...e}); else things[un.id]=e; }
    for(const q of A.lightsAll()){ const u=q.L.userData, on=u.lp?u.lp.on:u.on!==false; if(u.k!=null||!on||u.c)lights[q.id]={k:u.k??1,on,c:u.c||null}; }
    return {v:1,wall:A.R.wall,floor:A.R.floor,glow:A.R.glowK,addN:A.R.addN,things,added,lights}; };
  const apply=(A,L)=>{ if(!L||!A)return; if(L.wall)A.wall(L.wall); if(L.floor)A.floor(L.floor); if(L.glow!=null)A.glow(L.glow); A.R.addN=Math.max(A.R.addN,L.addN||0);
    for(const un of A.units().slice()){ const e=L.things&&L.things[un.id]; if(!e)continue; A.setT(un,e); if(e.gone&&!un.gone)A.remove(un); }
    for(const a of L.added||[]){ if(A.units().some(u=>u.id===a.id))continue; const un=A.spawn(a.kind,a,a.id); if(un&&a.gone)A.remove(un); }
    for(const id in L.lights||{}){ const o=L.lights[id]; A.light(id,{k:o.k,on:o.on,c:o.c||undefined}); const q=A.lightsAll().find(x=>x.id===id); if(q&&o.c)q.L.userData.c=o.c; } };
  // the room as built (before any layout): where RESET goes back to
  const BASE={};
  ROOMK.built.push(A=>{ for(const k in BASE)delete BASE[k]; for(const un of A.units())BASE[un.id]=A.getT(un); for(const q of A.lightsAll())q.L.userData.c0=q.L.color.getHex(); if(HOME.loaded)apply(A,HOME.layout); if(ED.on)ED.panel(); });
  HOME.load();

  /* ---------- the editor ---------- */
  const ED={on:false,sel:null,undo:[]}; window.ROOMED=ED;
  const A_=()=>ROOMK.api, inHome=()=>!!(MODS.apts&&MODS.apts.inReal&&ROOMK.api);
  const css=document.createElement('style'); css.textContent=`
  #roomed{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));top:12px;width:300px;max-height:calc(100vh - 24px);overflow:auto;background:var(--bg);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg);z-index:20}
  #roomed[hidden],#roomedbtn[hidden]{display:none} #roomed h2{font:12px var(--pixel);color:var(--key);margin:0;padding:10px 12px;border-bottom:2px solid var(--line)}
  #roomed .tabs{display:flex;border-bottom:2px solid var(--line)} #roomed .tabs button{flex:1;font:inherit;color:var(--dim);background:none;border:0;padding:8px 2px;cursor:pointer} #roomed .tabs button.on{color:var(--key);background:#161924}
  #roomed .pane{padding:8px 12px} #roomed .row{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin:6px 0} #roomed .lab{color:var(--dim);margin:10px 0 4px}
  #roomed .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:4px 7px;cursor:pointer} #roomed .btn:hover{border-color:var(--key)} #roomed .btn.on{border-color:var(--key);color:var(--key)}
  #roomed .sw{width:42px;height:30px;border:2px solid #3a3f4e;cursor:pointer;background-size:cover} #roomed .sw.on{border-color:var(--key)} #roomed .sw span{display:block;font-size:8px;line-height:1;margin-top:31px;color:var(--dim);white-space:nowrap}
  #roomed .light{border-top:1px solid var(--line);padding:6px 0} #roomed input[type=range]{width:120px} #roomed .hint{color:var(--dim);font-size:10px;line-height:1.6}
  #roomed .foot{display:flex;gap:6px;padding:8px 12px;border-top:2px solid var(--line);position:sticky;bottom:0;background:var(--bg)}
  #roomedbtn{position:fixed;left:50%;transform:translateX(-50%);top:calc(12px + env(safe-area-inset-top,0px));font:12px var(--pixel);color:var(--key);background:var(--panel);border:2px solid var(--line);padding:6px 12px;cursor:pointer;z-index:19}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='roomed'; P.hidden=true; document.body.appendChild(P);
  const B=document.createElement('button'); B.id='roomedbtn'; B.hidden=true; B.textContent='DECORATE · T'; B.onclick=()=>ED.toggle(); document.body.appendChild(B);
  let tab='things', helper=null, saveT=0;
  const dirty=()=>{ clearTimeout(saveT); saveT=setTimeout(()=>{ const A=A_(); if(A)HOME.save(snapshot(A)); },1200); };
  const hexs=c=>'#'+c.map(x=>x.toString(16).padStart(2,'0')).join('');
  const LCOL=[['WARM','#ffc48a'],['CANDLE','#ff9a50'],['WHITE','#fff4e0'],['COOL','#cfe0ff'],['PINK','#ffb0c8'],['GREEN','#b8f0b0']];
  const name=un=>un.name+(un.added?' (NEW)':'');

  // what you did, so UNDO can take it back
  const did=(op)=>{ ED.undo.push(op); if(ED.undo.length>80)ED.undo.shift(); dirty(); };
  ED.back=()=>{ const A=A_(), op=ED.undo.pop(); if(!A||!op)return; if(op.t==='move')A.setT(op.un,op.prev); else if(op.t==='gone')A.restore(op.un); else if(op.t==='back')A.remove(op.un);
    else if(op.t==='add'){ A.drop(op.un); if(ED.sel===op.un)select(null); } else if(op.t==='wall')A.wall(op.prev); else if(op.t==='floor')A.floor(op.prev); else if(op.t==='glow')A.glow(op.prev);
    else if(op.t==='light'){ A.light(op.id,op.prev); const q=A.lightsAll().find(x=>x.id===op.id); if(q)q.L.userData.c=op.prev.c; } dirty(); ED.panel(); };

  const select=un=>{ ED.sel=un; if(helper){ helper.removeFromParent(); helper=null; } if(un){ helper=new THREE.BoxHelper(un.obj,0xf2c14e); helper.material.depthTest=false; helper.renderOrder=20; scene.add(helper); } if(ED.on)ED.panel(); };
  const tf=(un,f)=>{ const A=A_(); const prev=A.getT(un), t={...prev}; f(t); A.setT(un,t); did({t:'move',un,prev}); if(helper)helper.update(); ED.panel(); };
  const turn=d=>{ if(ED.sel)tf(ED.sel,t=>{ t.ry+=d; }); }, size=k=>{ if(ED.sel)tf(ED.sel,t=>{ t.s=Math.max(.3,Math.min(3,t.s*k)); }); }, lift=d=>{ if(ED.sel)tf(ED.sel,t=>{ t.h=Math.max(0,t.h+d); }); };
  const putAway=()=>{ const un=ED.sel, A=A_(); if(!un)return; A.remove(un); did({t:'gone',un}); select(null); };
  const bringBack=un=>{ const A=A_(); A.restore(un); did({t:'back',un}); select(un); };
  const add=(kind,at)=>{ const A=A_(), K=A.kinds()[kind]; if(!K)return; const me=A.toApt(pos.x,SHARED.py,pos.z), base=K.loose?A.getT({loose:true,obj:K.tpl}):{h:K.tpl.position.y};
    const t=at||{u:Math.max(.4,Math.min(A.Lx-.4,me.u+.6)),h:K.loose?Math.max(.05,base.h):base.h,v:Math.max(.4,Math.min(A.Ly-.4,me.v+.6)),ry:0,s:1}; const un=A.spawn(kind,t); if(!un)return; did({t:'add',un}); select(un); };
  const copy=()=>{ const un=ED.sel, A=A_(); if(!un)return; const t=A.getT(un); add(un.kind,{...t,u:t.u+.3,v:t.v+.3}); };

  /* ---------- the panel ---------- */
  ED.panel=()=>{ const A=A_(); if(!ED.on||!A){ P.hidden=true; return; } P.hidden=false;
    const T=(k,n)=>`<button data-tab="${k}" class="${tab===k?'on':''}">${n}</button>`;
    let h=`<h2>DECORATE YOUR APARTMENT</h2><div class="tabs">${T('things','THINGS')}${T('walls','WALLS')}${T('floor','FLOOR')}${T('lights','LIGHTS')}</div><div class="pane">`;
    if(tab==='things'){ const s=ED.sel;
      h+=s?`<div class="lab">PICKED UP</div><div style="color:var(--key)">${name(s)}</div><div class="row"><button class="btn" data-a="turnl">⟲ TURN</button><button class="btn" data-a="turnr">TURN ⟳</button><button class="btn" data-a="small">SMALLER</button><button class="btn" data-a="big">BIGGER</button></div>
        <div class="row"><button class="btn" data-a="down">LOWER</button><button class="btn" data-a="up">RAISE</button><button class="btn" data-a="copy">COPY</button><button class="btn" data-a="away">PUT AWAY</button></div>`
        :`<div class="hint">CLICK A THING TO PICK IT UP, DRAG TO MOVE IT.<br>Q / E TURN · WHEEL RESIZES · [ ] LOWER / RAISE · DEL PUTS IT AWAY · CTRL+Z UNDO</div>`;
      const K=A.kinds(), ks=Object.keys(K).sort((a,b)=>K[a].name<K[b].name?-1:1);
      h+=`<div class="lab">ADD</div><div class="row">${ks.map(k=>`<button class="btn" data-add="${k}">${K[k].name}</button>`).join('')}</div>`;
      const gone=A.units().filter(u=>u.gone);
      if(gone.length)h+=`<div class="lab">PUT AWAY</div><div class="row">${gone.map(u=>`<button class="btn" data-back="${u.id}">${name(u)}</button>`).join('')}</div>`; }
    if(tab==='walls'){ h+=`<div class="row">${Object.entries(A.walls).map(([k,D])=>`<div class="sw ${A.R.wall===k?'on':''}" data-wall="${k}" style="background:${hexs(D.c)}"><span>${D.n}</span></div>`).join('')}</div><div style="height:14px"></div>`; }
    if(tab==='floor'){ h+=`<div class="row">${Object.entries(A.floors).map(([k,D])=>`<div class="sw ${A.R.floor===k?'on':''}" data-floor="${k}" style="background:${hexs(D.c)}"><span>${D.n}</span></div>`).join('')}</div><div style="height:14px"></div>`; }
    if(tab==='lights'){ h+=`<div class="lab">ROOM GLOW</div><div class="row"><input type="range" min="0" max="300" value="${Math.round(A.R.glowK*100)}" data-glow="1"> <span>${Math.round(A.R.glowK*100)}%</span></div>`;
      for(const q of A.lightsAll()){ const u=q.L.userData, on=u.lp?u.lp.on:u.on!==false, k=u.k??1;
        h+=`<div class="light"><div class="row"><button class="btn ${on?'on':''}" data-lon="${q.id}">${on?'ON':'OFF'}</button><span>${q.name}</span></div>
          <div class="row">BRIGHTNESS <input type="range" min="0" max="300" value="${Math.round(k*100)}" data-lk="${q.id}"> <span>${Math.round(k*100)}%</span></div>
          <div class="row">${LCOL.map(([n,c])=>`<button class="btn ${(u.c||'')===c?'on':''}" data-lc="${q.id}" data-c="${c}" title="${n}" style="color:${c}">■</button>`).join('')}</div></div>`; } }
    h+=`</div><div class="foot"><button class="btn" data-a="undo">UNDO</button><button class="btn" data-a="reset">RESET</button><button class="btn" data-a="done" style="margin-left:auto">DONE</button></div>`;
    const st=P.scrollTop; P.innerHTML=h; P.scrollTop=st; };
  P.addEventListener('click',e=>{ const b=e.target.closest('[data-tab],[data-a],[data-add],[data-back],[data-wall],[data-floor],[data-lon],[data-lc]'); if(!b)return; const A=A_(); if(!A)return; const d=b.dataset;
    if(d.tab){ tab=d.tab; return ED.panel(); }
    if(d.add)return add(d.add);
    if(d.back){ const un=A.units().find(u=>u.id===d.back); if(un)bringBack(un); return; }
    if(d.wall){ did({t:'wall',prev:A.R.wall}); A.wall(d.wall); return ED.panel(); }
    if(d.floor){ did({t:'floor',prev:A.R.floor}); A.floor(d.floor); return ED.panel(); }
    if(d.lon||d.lc){ const id=d.lon||d.lc, q=A.lightsAll().find(x=>x.id===id); if(!q)return; const u=q.L.userData, prev={k:u.k??1,on:u.lp?u.lp.on:u.on!==false,c:u.c||null};
      if(d.lon)A.light(id,{on:!prev.on}); else { A.light(id,{c:d.c}); u.c=d.c; } did({t:'light',id,prev}); return ED.panel(); }
    ({turnl:()=>turn(Math.PI/12),turnr:()=>turn(-Math.PI/12),small:()=>size(1/1.1),big:()=>size(1.1),down:()=>lift(-.05),up:()=>lift(.05),copy,away:putAway,undo:ED.back,reset:ED.reset,done:ED.toggle}[d.a]||(()=>{}))(); });
  let slid=null;
  P.addEventListener('input',e=>{ const t=e.target, A=A_(); if(!A||t.type!=='range')return; const v=+t.value/100; if(t.nextElementSibling)t.nextElementSibling.textContent=t.value+'%';
    if(t.dataset.glow){ if(!slid)slid={t:'glow',prev:A.R.glowK}; A.glow(v); }
    if(t.dataset.lk){ const q=A.lightsAll().find(x=>x.id===t.dataset.lk); if(!q)return; const u=q.L.userData; if(!slid)slid={t:'light',id:q.id,prev:{k:u.k??1,on:u.lp?u.lp.on:u.on!==false,c:u.c||null}}; A.light(q.id,{k:v}); } });
  P.addEventListener('change',()=>{ if(slid){ did(slid); slid=null; } });
  ED.reset=()=>{ const A=A_(); if(!A||!confirm('PUT YOUR APARTMENT BACK AS IT CAME?'))return; select(null);
    for(const un of A.units().slice()){ if(un.added){ A.drop(un); continue; } if(un.gone)A.restore(un); if(BASE[un.id])A.setT(un,BASE[un.id]); }
    A.wall('cream'); A.floor('planks'); A.glow(1); for(const q of A.lightsAll()){ const u=q.L.userData; A.light(q.id,{k:1,on:true}); if(u.c0!=null)q.L.color.setHex(u.c0); delete u.c; delete u.k; }
    ED.undo.length=0; dirty(); ED.panel(); };
  ED.toggle=()=>{ if(!ED.on&&!inHome())return; ED.on=!ED.on; if(!ED.on){ select(null); const A=A_(); clearTimeout(saveT); if(A)HOME.save(snapshot(A)); } ED.panel(); B.textContent=ED.on?'DONE · T':'DECORATE · T'; };

  /* ---------- the mouse and the keys while you decorate ---------- */
  const rc=new THREE.Raycaster(), ndc=new THREE.Vector2(), plane=new THREE.Plane(), hitP=new THREE.Vector3();
  const ray=e=>{ const r=renderer.domElement.getBoundingClientRect(); ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); rc.setFromCamera(ndc,SHARED.cam); return rc; };
  const pick=e=>{ const A=A_(), map=new Map(), objs=[]; for(const un of A.units())if(!un.gone){ objs.push(un.obj); map.set(un.obj,un); }
    for(const h of ray(e).intersectObjects(objs,true)){ const o=h.object; if(!o.isMesh||o.userData.hit||o.userData.blob||(o.material&&o.material.visible===false))continue; let q=o; while(q&&!map.has(q))q=q.parent; if(q)return {un:map.get(q),p:h.point}; } return null; };
  let drag=null;
  addEventListener('pointerdown',e=>{ if(!ED.on||e.button!==0||e.target!==renderer.domElement)return; e.stopImmediatePropagation(); e.preventDefault(); const A=A_(); if(!A)return;
    const h=pick(e); if(!h){ select(null); return; } select(h.un); const o=h.un.obj, prev=A.getT(h.un), wp=new THREE.Vector3(); o.getWorldPosition(wp);
    plane.set(new THREE.Vector3(0,1,0),-wp.y); if(!ray(e).ray.intersectPlane(plane,hitP))return; if(h.un.loose)A.lift(h.un);
    drag={un:h.un,prev,off:wp.clone().sub(hitP),wp,moved:false}; },true);
  addEventListener('pointermove',e=>{ if(!drag)return; const A=A_(); if(!A){ drag=null; return; } if(!ray(e).ray.intersectPlane(plane,hitP))return; const n=hitP.clone().add(drag.off), o=drag.un.obj;
    const t=A.toApt(n.x,n.y,n.z); t.u=Math.max(0,Math.min(A.Lx,t.u)); t.v=Math.max(0,Math.min(A.Ly,t.v)); const w=A.W(t.u,0,t.v);
    if(drag.un.loose){ o.position.x=w.x; o.position.z=w.z; o.position.y=drag.wp.y+.03*A.M; } else { o.position.x=t.u; o.position.z=t.v; } drag.moved=true; if(helper)helper.update(); },true);
  addEventListener('pointerup',e=>{ if(!drag)return; const A=A_(), d=drag; drag=null; if(!A)return; const t=A.getT(d.un); if(d.un.loose)t.h=d.prev.h+.03;
    A.setT(d.un,t); if(d.moved)did({t:'move',un:d.un,prev:d.prev}); if(helper)helper.update(); ED.panel(); },true);
  addEventListener('wheel',e=>{ if(!ED.on||!ED.sel||e.target!==renderer.domElement)return; e.stopImmediatePropagation(); e.preventDefault(); size(e.deltaY<0?1.05:1/1.05); },{capture:true,passive:false});
  addEventListener('keydown',e=>{ const tg=e.target; if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'||tg.isContentEditable)&&tg.type!=='range')return; const k=e.key.toLowerCase();
    if(k==='t'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&(ED.on||inHome())){ if(!e.repeat)ED.toggle(); e.stopImmediatePropagation(); e.preventDefault(); return; }
    if(!ED.on)return; let used=true;
    if(k==='escape')ED.toggle(); else if((e.ctrlKey||e.metaKey)&&k==='z')ED.back();
    else if(ED.sel&&k==='q')turn(e.shiftKey?Math.PI/2:Math.PI/12); else if(ED.sel&&k==='e')turn(e.shiftKey?-Math.PI/2:-Math.PI/12);
    else if(ED.sel&&k==='[')lift(-.05); else if(ED.sel&&k===']')lift(.05); else if(ED.sel&&(k==='delete'||k==='backspace'||k==='x'))putAway();
    else used=false; if(used){ e.stopImmediatePropagation(); e.preventDefault(); } },true);

  // the button shows in your apartment; the editor closes if you leave it
  SYS.add('places',()=>{ const h=inHome(); if(B.hidden===h)B.hidden=!h; if(ED.on&&!h)ED.toggle(); if(helper&&ED.sel){ if(ED.sel.gone||!ED.sel.obj.parent)select(null); else helper.update(); } },'150c-roomedit');
  window.ROOMEDDBG=()=>{ const A=A_(); return {on:ED.on,sel:ED.sel&&ED.sel.id,undo:ED.undo.length,saved:HOME.saved||0,layout:!!HOME.layout,units:A?A.units().length:0,gone:A?A.units().filter(u=>u.gone).length:0,added:A?A.units().filter(u=>u.added).length:0,wall:A&&A.R.wall,floor:A&&A.R.floor}; };
  ED._api=A_; ED.HOME=HOME; ED.snapshot=()=>A_()&&snapshot(A_()); ED.apply=L=>apply(A_(),L); ED.add=add; ED.select=select; ED.putAway=putAway; ED.turn=turn; ED.size=size;
}
