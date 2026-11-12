// THE ARCADE'S PINBALL: two real tables on the arcade's west wall, POOH and MICKEY (src/pinball/table.js: the owner's module, its rules, ball and looks), played where they stand: A and D the flippers, hold SPACE and let go for the plunger, W or ESC to step away; on a pad the bumpers or triggers are the flippers, A the plunger, B steps away (in the headset, each hand's trigger or grip is its flipper). Your game is your own page's; the best scores go on the arcade's shared top ten, tickets come out by your score.
import {SHARED, THREE} from './003-shx.js';
import {keys, ONLINE, pos, RAG, ROOMS, SFX, UI, VIT, VR} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {MODS, STORE, SYS} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {PAD} from './075-main-13.js';
const PIN={TABLES:[['pooh',8.32],['mickey',11.28]],U:.78,STAND:1,LOOK:.88,ZOOM:1.25,TICKET:20000}; window.PIN=PIN;   // each table's theme and where along the west wall it stands; its middle's metres from the wall, where you stand from its middle, how far down you look and how close; points a ticket
{ let API=null; const api=()=>API||(API=MAKE());
  const MAKE=()=>{ '@pinball';
    __CODE__("src/pinball/table.js")
    const MW=IKIT.MW, say=(t,c)=>SAY(t,c||'#ffd23a');
    let TB=[], P=null;   // the tables standing, the one you play
    const SND={bumper:['ding',1.3],sling:['click',1.1],target:['ding',.9],thud:['thud',1],frenzy:['bell',1.2],whistle:['bell',1.5],lane:['blip',1.2],mult:['bell',1],spintick:['click',1.8],saucer:['clunk',1],kick:['clunk',1.2],launch:['thud',.8],flipper:['click',.7],ballhit:['click',1.4],saved:['blip',.8],drain:['thud',.5],multiball:['bell',1.3],jackpot:['bell',1.6],gameover:['bell',.6],start:['blip',1]};
    const sound=e=>{ const s=SND[e.name]; if(s)SFX.play(s[0],{vol:Math.min(.6,.25+.15*(e.strength||1)),pitch:s[1],vary:.08}); };
    const cab=t=>t.pin.theme.title+' PINBALL', kit=()=>STORE.cabs.kit&&LOADED('arcade')?STORE.cabs.kit():null;
    const ini=()=>((STORE.cabs.ini&&STORE.cabs.ini())||((ONLINE.myName?ONLINE.myName():'')||'YOU').toUpperCase().replace(/[^A-Z0-9 ]/g,'')+'   ').slice(0,3).padEnd(3,' ');

    /* ---------- the tables: each the module's own group at a metre's size, its back to the wall; still until someone plays ---------- */
    // a table's still pieces (rails, posts, the cabinet, its legs) drawn as one mesh a material
    const fuse=root=>{ const by=new Map(), made=[]; root.traverse(o=>{ if(o.isMesh&&o.userData.still){ const L=by.get(o.material)||[]; by.set(o.material,L); L.push(o); } });
      for(const [m,L] of by){ if(L.length<2)continue; const par=L[0].parent, A=[], N=[], I=[]; let v=0;
        for(const o of L){ o.updateMatrix(); const g=o.geometry.clone().applyMatrix4(o.matrix), p=g.attributes.position, n=g.attributes.normal; for(let k=0;k<p.count;k++){ A.push(p.getX(k),p.getY(k),p.getZ(k)); N.push(n.getX(k),n.getY(k),n.getZ(k)); }
          if(g.index)for(let k=0;k<g.index.count;k++)I.push(g.index.getX(k)+v); else for(let k=0;k<p.count;k++)I.push(v+k); v+=p.count; g.dispose(); o.removeFromParent(); }
        const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(A,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); g.setIndex(I); par.add(new THREE.Mesh(g,m)); made.push(g); }
      return made; };
    const build=(F,sol,thing)=>{ drop(); const hd=Math.atan2(-F.eu[0],-F.eu[1]);
      PIN.TABLES.forEach(([theme,v],i)=>{ const pin=createPinball(THREE,{theme}), g=pin.group, u=F.W-PIN.U, p=F.pw(u,v), s=F.pw(u-PIN.STAND,v);
        g.scale.setScalar(MW); g.position.set(p[0],.78*MW,p[1]); g.rotation.y=hd; g.userData.noMerge=true; const fused=fuse(g); g.traverse(o=>{ o.castShadow=o.receiveShadow=false; }); scene.add(g);
        const t={i,pin,fused,u,v,x:s[0],z:s[1],hd:F.hd(1,0),score:0,over:false}; TB.push(t);
        pin.on('sound',e=>{ if(P&&P.t===t)sound(e); }); pin.on('message',e=>{ if(e.big&&P&&P.t===t)say(e.text); }); pin.on('score',e=>{ t.score=e.score; if(P&&P.t===t)panel(); });
        pin.on('ready',()=>{ if(P&&P.t===t)panel(); }); pin.on('gameover',e=>ended(t,e.score));
        sol(u-.7,v-.34,F.W,v+.34); thing('PLAY '+cab(t),u-.2,v,.75,1.3,()=>PIN.take(i)); });
      const k=kit(); if(k&&k.refresh)for(const t of TB)k.refresh(cab(t)); };
    const drop=()=>{ if(P)PIN.leave(true); for(const t of TB){ t.pin.dispose(); for(const g of t.fused)g.dispose(); } TB=[]; };

    /* ---------- your game: you stand at the table and look down at it through your own eyes ---------- */
    const UI_=document.createElement('div'); UI_.id='pinp'; UI_.hidden=true;
    { const css=document.createElement('style'); css.textContent=`#pinp{position:fixed;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:6;width:min(380px,calc(100vw - 32px));background:#120a24ec;border:1px solid #6a3a9a;padding:8px 10px;font:10px Silkscreen,monospace;letter-spacing:1px;color:#ece0ff;display:flex;flex-direction:column;gap:6px;user-select:none;touch-action:none}
      #pinp[hidden]{display:none} #pinp .hd{display:flex;justify-content:space-between;gap:8px;align-items:center} #pinp .row{display:flex;gap:6px} #pinp button{font:inherit;color:inherit;background:#24143e;border:1px solid #6a3a9a;padding:3px 6px;cursor:pointer} #pinp .row button{flex:1;padding:12px 0;font-size:14px} #pinp .dim{opacity:.75} @media not (pointer:coarse){#pinp .row{display:none}}`; document.head.appendChild(css); }
    UI_.innerHTML='<div class="hd"><b id="pnn"></b><button id="pnx">STEP AWAY</button></div><div class="row" id="pnb"><button data-k="L">◀ FLIP</button><button data-k="S">PLUNGER</button><button data-k="R">FLIP ▶</button></div><div class="dim" id="pnt"></div>'; document.body.appendChild(UI_);
    const $=id=>UI_.querySelector('#'+id), fmt=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,',');
    const panel=()=>{ if(!P||VR.on){ UI_.hidden=true; return; } UI_.hidden=false; const pad=PAD.n>0; const t=P.t, S=t.pin.state, live=S.phase!=='idle'&&S.phase!=='over';
      $('pnn').textContent=cab(t)+(live?' · BALL '+S.ball+' · '+fmt(S.score):t.over?' · GAME OVER · '+fmt(t.score):'');
      $('pnt').textContent=pad?(live?'LB/RB OR THE TRIGGERS: THE FLIPPERS · HOLD A AND LET GO: THE PLUNGER · B STEP AWAY':'A TO START · B STEP AWAY'):live?'A/D OR ◀ ▶ THE FLIPPERS · HOLD SPACE AND LET GO: THE PLUNGER · W OR ESC STEP AWAY':'SPACE TO START · W OR ESC STEP AWAY'; };
    const key=(k,on)=>{ if(!P)return; const t=P.t, S=t.pin.state, live=S.phase!=='idle'&&S.phase!=='over';
      if(k==='L'||k==='R'){ if(live)t.pin.flip(k==='L'?0:1,on); }
      else if(k==='S'){ if(live)t.pin.plunge(on); else if(on)PIN.start(); } };
    UI_.addEventListener('pointerdown',e=>{ const b=e.target.closest('button'); if(!b)return; e.preventDefault(); if(b.id==='pnx')return PIN.leave(); if(b.dataset.k){ try{ b.setPointerCapture(e.pointerId); }catch(x){} key(b.dataset.k,true); } });
    for(const n of ['pointerup','pointercancel'])UI_.addEventListener(n,e=>{ const b=e.target.closest('button'); if(b&&b.dataset.k)key(b.dataset.k,false); });
    const MAP={a:'L',arrowleft:'L',d:'R',arrowright:'R',' ':'S',arrowdown:'S',s:'S',w:'X',arrowup:'X',escape:'X'};
    const kd=e=>{ if(!P||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test((e.target&&e.target.tagName)||''))return; const m=MAP[(e.key||'').toLowerCase()]; if(!m)return; e.preventDefault(); e.stopImmediatePropagation();
      if(e.type==='keydown'){ if(e.repeat)return; if(m==='X')PIN.leave(); else key(m,true); } else if(m!=='X')key(m,false); };
    addEventListener('keydown',kd,true); addEventListener('keyup',kd,true); addEventListener('blur',()=>{ if(P)for(const k of ['L','R'])key(k,false); });
    const pin=()=>{ window.RUNNER=MODS.runner={on:true,steer:()=>{ if(!P)return [0,0,0]; pos.x=P.t.x; pos.z=P.t.z; SHARED.heading=P.t.hd; if(!VR.on){ SHARED.yaw=SHARED.yawTo=P.t.hd+Math.PI; SHARED.pitch=SHARED.pitchTo=PIN.LOOK; UI.fz=PIN.ZOOM; } return [0,0,0]; }}; };
    PIN.take=i=>{ const t=TB[i]; if(!t||P&&P.t===t||RAG.on||VIT.out>0)return; if(P)PIN.leave(true); P={t,view:UI.view,fz:UI.fz}; UI.gamewin='pin'; if(!VR.on&&UI.view!=='first')UI.setView('first'); keys.clear(); pin(); panel();
      const S=t.pin.state; if(S.phase==='idle'||S.phase==='over')say(cab(t)+(VR.on?': A TO START. EACH HAND\'S TRIGGER IS ITS FLIPPER, HOLD A AND LET GO FOR THE PLUNGER, B STEPS AWAY.':PAD.n>0?': A TO START. LB AND RB THE FLIPPERS, HOLD A AND LET GO FOR THE PLUNGER.':': SPACE TO START. A AND D THE FLIPPERS, HOLD SPACE AND LET GO FOR THE PLUNGER.')); };
    PIN.start=()=>{ if(!P)return false; const t=P.t; t.over=false; t.score=0; t.pin.start(); panel(); return true; };
    PIN.leave=quiet=>{ if(!P)return; const t=P.t, v=P.view, fz=P.fz; for(const s of [0,1])t.pin.flip(s,false); P=null; if(UI.gamewin==='pin')UI.gamewin=null; window.RUNNER=MODS.runner=null; UI_.hidden=true; keys.clear(); if(VR.on);else if(v&&v!==UI.view)UI.setView(v); else UI.fz=fz; if(!quiet)say('YOU STEP AWAY FROM '+cab(t)+'.','#e8d8ff'); };
    // a game is over: the score to the shared top ten (the arcade's own table), tickets by the score
    const ended=(t,score)=>{ t.over=true; t.score=score; if(P&&P.t===t)panel(); const n=Math.min(10,Math.floor(score/PIN.TICKET)), k=kit(); PIN.last={table:t.pin.theme.id,score,tickets:n};
      say('GAME OVER: '+fmt(score)+'. SPACE FOR ANOTHER.','#5affff'); if(PIN.won)PIN.won(n); if(score>0&&k&&k.post)k.post(cab(t),ini(),Math.min(99999999,Math.round(score)),'').then(r=>{ PIN.last.rank=r; if(r>0&&r<=10)say('RANK '+r+' OF THE TOP TEN ON '+cab(t)+'.'); }); };

    /* ---------- each frame: only a table with a game on it runs ---------- */
    const step=dt=>{ if(!TB.length)return; if(!TB[0].pin.group.parent)return drop();   // the arcade was dropped
      if(P&&(ROOMS.offIn&&ROOMS.offIn()!=='arcade'||RAG.on||VIT.out>0||VIT.dead))PIN.leave(true);
      for(const t of TB){ const ph=t.pin.state.phase; if(P&&P.t===t||ph==='play'||ph==='between')for(let r=Math.min(dt||0,.12);r>1e-4;r-=.04)t.pin.update(Math.min(r,.04)); } };   // the table steps at most a 25th of a second: a slow frame is several steps
    PIN.dbg=()=>({built:TB.length,me:P?P.t.i:null,view:UI.view,gamewin:UI.gamewin||null,last:PIN.last||null,tables:TB.map(t=>{ const S=t.pin.state, g=t.pin.group; let n=0; g.traverse(o=>{ if(o.isMesh)n++; });
      return {name:cab(t),phase:S.phase,ball:S.ball,score:S.score,balls:S.balls.map(b=>[+b.x.toFixed(3),+b.y.toFixed(3)]),fl:S.fl.map(f=>f.on),at:[+g.position.x.toFixed(2),+g.position.z.toFixed(2)],stand:[+t.x.toFixed(2),+t.z.toFixed(2)],meshes:n}; })});
    PIN.T=()=>TB;
    return {build,step,drop}; };
  PIN.build=(F,sol,thing)=>api().build(F,sol,thing);
  SYS.add('life',dt=>{ if(API)API.step(dt); },'146zcz-pinball');
}
export {PIN};
