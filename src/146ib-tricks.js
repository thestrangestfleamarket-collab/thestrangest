// THE TRICKS: what you do on a skateboard (its RIDE kind asks TRICKS how to move, stand and draw): push and carve; ollie (hold SPACE, let go); in the air flip tricks (J), grabs (K) and spins (A D); grinds and slides on rails, ledges and coping (L); manuals (I); quarter pipes throw you up; reverts (L as you land); bails; each trick's name, the combo's score and multiplier, your best combo kept with your things and the section's top skaters.
import {SHARED} from './003-shx.js';
import {ITEMS, keys, ONLINE, pos, RIDE, SPEED, st, TRICKS, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {SECTION, SYS, TILE, ZU} from './006-map-pre.js';
import {collide} from './075-main-13.js';
import {SKATE} from './111fd-skatepark.js';
Object.assign(TRICKS,{best:0,session:0,combo:null}); window.TRICKS=TRICKS;
{ const T=TILE, MH=TILE/.84, MV=ZU*24/.84, PI=Math.PI, wrap=a=>Math.atan2(Math.sin(a),Math.cos(a)), say=(t,c)=>SAY(t,c||'#e8e2cc');
  const ON=()=>!!(RIDE.on&&RIDE.cur&&RIDE.cur===SKATE.board);
  // the trick keys (J flip, K grab, L grind, I manual; the gamepad's X, Y, RB, LB): taken from the walk while you ride, so they never punch, kick or open your pack
  const DOWN=new Set(), ACT=k=>k==='j'?'flip':k==='k'?'grab':k==='l'?'grind':k==='i'||k==='q'?'manual':null, keyOf=e=>(UI.key?UI.key(e):null)||(e.key||'').toLowerCase();
  addEventListener('keydown',e=>{ if(!ON())return; const a=ACT(keyOf(e)); if(!a)return; DOWN.add(a); e.stopImmediatePropagation(); e.preventDefault(); },true);
  addEventListener('keyup',e=>{ const a=ACT(keyOf(e)); if(!a)return; DOWN.delete(a); if(ON())e.stopImmediatePropagation(); },true);
  addEventListener('blur',()=>DOWN.clear());
  TRICKS.takes=k=>ON()&&!!ACT(k);   // the walk's keys stand aside for a trick key while you skate (the gamepad's come straight to the window)
  const was=new Set(); let hit=new Set(), spWas=false;
  const held=(...k)=>k.some(q=>keys.has(q)), dir=()=>held('w','arrowup')?'up':held('s','arrowdown')?'down':held('a','arrowleft')?'left':held('d','arrowright')?'right':'';
  const G=(x,z)=>SHARED.groundY(x,z);
  // the tricks and what each is worth
  const FLIPS={'':['KICKFLIP',100,'kick'],left:['KICKFLIP',100,'kick'],right:['HEELFLIP',100,'heel'],up:['HARDFLIP',250,'hard'],down:['POP SHOVE-IT',150,'shove']};
  const GRABS={'':['INDY',200,'indy'],left:['MELON',200,'melon'],right:['STALEFISH',250,'indy'],up:['NOSEGRAB',250,'nose'],down:['TAILGRAB',250,'tail']};
  const GRINDS={'':['50-50',100,0],up:['NOSEGRIND',150,0],down:['5-0',150,0],left:['BOARDSLIDE',150,1],right:['LIPSLIDE',200,1]};
  TRICKS.FLIPS=FLIPS; TRICKS.GRABS=GRABS; TRICKS.GRINDS=GRINDS;
  // the combo: every trick adds its points and one to the multiplier; it is banked when you roll away clean, lost when you bail
  const add=(R,name,pts)=>{ const C=TRICKS.combo||(TRICKS.combo={list:[],base:0,mult:0}); C.list.push(name); C.base+=pts; C.mult++; R.landT=0; flash=null; };
  const bonus=pts=>{ if(TRICKS.combo)TRICKS.combo.base+=pts; };
  const bank=()=>{ '@later'; const C=TRICKS.combo; TRICKS.combo=null; if(!C)return; const tot=Math.round(C.base*C.mult); TRICKS.session+=tot; flash={t:2,txt:'+'+tot+(C.mult>1?'  ('+C.list.length+' TRICKS)':'')};
    if(tot>TRICKS.best){ TRICKS.best=tot; try{ OWNED.set('skatebest',String(tot)); }catch(e){} if(tot>=200)postBest(tot); flash.txt+='  YOUR BEST!'; } };
  const bail=(R,why)=>{ TRICKS.combo=null; flash={t:2,txt:'BAIL!',bad:1}; R.s='roll'; R.flip=null; R.grab=null; R.z=0; R.vz=0; RIDE.off(why||'YOU BAIL.',true); };
  TRICKS.bail=bail;
  // the section's top skaters: the shared top-ten table the arcade uses, one table, each run marked with its section
  const srv=/^http/.test(location.protocol), ask=b=>srv?fetch('/scores',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify(b)}).then(r=>r.ok?r.json():null).catch(()=>null):Promise.resolve(null);
  const ini=()=>{ const n=((ONLINE.myName?ONLINE.myName():'')||'YOU').toUpperCase().replace(/[^A-Z0-9 ]/g,''); return (n+'   ').slice(0,3); };
  const postBest=v=>ask({cab:'SKATE',put:{ini:ini(),score:v,sub:SECTION.id}}).then(j=>{ if(j&&j.rank)say('A NEW BEST COMBO: '+v+'. #'+j.rank+' AT THE SKATE PARK.','#f2c14e'); });
  TRICKS.top=()=>ask({cab:'SKATE'}).then(j=>j&&j.top?j.top.filter(e=>!e.sub||e.sub===SECTION.id):null);
  SYS.onStart(()=>{ const b=+OWNED.get('skatebest')||0; if(b>TRICKS.best)TRICKS.best=b; },'146ib-tricks');

  // grinds: the nearest grind line under or beside your board
  const railNear=(R,y)=>{ '@later'; let best=null, bd=1e9; for(const r of SKATE.rails||[]){ const ax=r.a[0], az=r.a[2], ux=r.b[0]-ax, uz=r.b[2]-az, L2=ux*ux+uz*uz; if(!L2)continue;
      const t=Math.max(0,Math.min(1,((pos.x-ax)*ux+(pos.z-az)*uz)/L2)), x=ax+ux*t, z=az+uz*t, d=Math.hypot(pos.x-x,pos.z-z), ry=r.a[1]+(r.b[1]-r.a[1])*t;
      if(d<.75*MH&&ry>y-1.1*MV&&ry<y+.9*MV&&d<bd){ bd=d; best={r,t,L:Math.sqrt(L2),ry}; } } return best; };
  const tryGrind=R=>{ '@later'; const y=R.s==='air'?G(pos.x,pos.z)+R.z:G(pos.x,pos.z), n=railNear(R,y); if(!n)return false; const r=n.r, ux=(r.b[0]-r.a[0])/n.L, uz=(r.b[2]-r.a[2])/n.L;
    R.rail=r; R.rL=n.L; R.gt=n.t*n.L; R.gs=Math.sin(R.md)*ux+Math.cos(R.md)*uz>=0?1:-1; R.v=Math.max(R.s==='air'?R.vh:R.v,1.6*T); const d=dir(), g=GRINDS[d]||GRINDS['']; R.slide=g[2]; R.s='grind'; R.vz=0; R.vert=false; R.bal=(Math.random()-.5)*.2; R.gp=0;
    add(R,g[0],g[1]); return true; };
  // spins add their own name when you land: 180, 360, ...
  const spinName=R=>{ const h=Math.round(Math.abs(R.spun||0)/PI); if(h>=1)add(R,h*180+'',h*100); };
  const land=R=>{ '@later'; const flipping=R.flip&&R.flip.t<R.flip.dur*.8;
    if(R.vert){ R.md+=PI; R.v=Math.abs(R.vz)*.8; } else R.v=R.vh;
    const d=Math.abs(wrap(R.hd-R.md)), off=Math.min(d,PI-d);
    if(flipping||off>.65)return bail(R,flipping?'YOU LAND MID-FLIP AND BAIL.':'YOU LAND SIDEWAYS AND BAIL.');
    spinName(R); R.fakie=d>PI/2; R.hd=R.md+(R.fakie?PI:0); R.s='roll'; R.z=0; R.vz=0; R.vert=false; R.flip=null; R.grab=null; R.landT=.6; R.spun=0; };
  const leaveRail=(R,vz)=>{ const ry=R.railY, gy=G(pos.x,pos.z); R.s='air'; R.rail=null; R.slide=0; R.vh=R.v; R.vz=vz; R.z=Math.max(.001,ry-gy); R.gy=gy; R.spun=0; };
  const move=(R,dt,sp)=>{ const ox=pos.x, oz=pos.z, go=sp*dt; pos.x+=Math.sin(R.md)*go; pos.z+=Math.cos(R.md)*go; collide(pos);
    const moved=Math.hypot(pos.x-ox,pos.z-oz); if(go>.001&&moved<go*.5){ if(sp>5.5*T){ bail(R,'YOU HIT IT HARD AND BAIL.'); return false; } R.v*=.4; R.vh*=.4; } return true; };

  TRICKS.step=(R,dt,inp)=>{ '@later'; if(!ON())return false;
    if(R.t0!==R.mt){ Object.assign(R,{mt:R.t0,s:'roll',md:R.hd,z:0,vz:0,vh:0,charge:0,landT:0,spun:0,fakie:false,flip:null,grab:null,rail:null,slide:0,pt:0}); R.gy=G(pos.x,pos.z); TRICKS.combo=null; }
    hit=new Set([...DOWN].filter(a=>!was.has(a))); was.clear(); for(const a of DOWN)was.add(a);
    const sp=keys.has(' '), pop=spWas&&!sp; spWas=sp; dt=Math.min(dt,.05);
    const vmax=(+ITEMS.prop(RIDE.on,'speed')||5)*T*SPEED.of('skate'), acc=2.6*T*SPEED.of('skate'), d=dir();
    if(R.s==='roll'||R.s==='manual'){
      // push and carve toward where you steer; S or pulling back brakes; slopes speed you up and slow you down
      const {mx,mz,ml}=inp; R.pushing=false;
      if(ml>0){ const want=Math.atan2(mx,mz), e=wrap(want-R.md), back=Math.abs(e)>2.4&&R.v>.5*T;
        if(back)R.v=Math.max(0,R.v-acc*2.2*dt); else { const turn=2.6/(1+R.v/T*.1)*dt, q=Math.max(-turn,Math.min(turn,e)); R.md+=q; R.lean+=((q/dt)*.12-R.lean)*Math.min(1,dt*6); if(Math.abs(e)<1.4&&R.s==='roll'){ R.v=Math.min(vmax,R.v+acc*dt*(1-R.v/vmax*.6)); R.pushing=R.v<vmax*.9; } } }
      else { R.v=Math.max(0,R.v-.6*T*dt); R.lean*=1-Math.min(1,dt*4); }
      const g0=G(pos.x,pos.z), ah=.35*MH, sl=(G(pos.x+Math.sin(R.md)*ah,pos.z+Math.cos(R.md)*ah)-g0)/ah;
      R.v-=9.8*T*.45*Math.max(-1.2,Math.min(1.2,sl))*dt; if(R.v<0){ R.v=-R.v; R.md+=PI; R.fakie=!R.fakie; }
      R.hd=R.md+(R.fakie?PI:0); R.pt=R.pushing?R.pt+dt*1.3:0;
      // a quarter pipe at speed throws you straight up
      if(sl>1.1&&R.v>2*T&&R.s==='roll'){ R.s='air'; R.vert=true; R.vz=R.v*Math.min(1,sl/1.6); R.vh=0; R.z=.02*T; R.spun=0; R.gy=g0; }
      else{
        if(R.s==='roll'){
          if(sp)R.charge=Math.min(1,(R.charge||0)+dt*2.4);
          if(pop&&R.charge>0){ R.s='air'; R.vz=(2.3+1.5*R.charge)*T; R.vh=R.v; R.z=.001; R.spun=0; R.gy=g0; R.charge=0; add(R,'OLLIE',50); }
          else if(hit.has('manual')){ R.s='manual'; R.nose=d==='up'; R.bal=(Math.random()-.5)*.2; add(R,R.nose?'NOSE MANUAL':'MANUAL',R.nose?150:100); }
          else if(hit.has('grind')&&!tryGrind(R)&&R.landT>0){ add(R,'REVERT',100); R.fakie=!R.fakie; R.hd=R.md+(R.fakie?PI:0); R.landT=.6; }
          if(R.landT>0&&(R.landT-=dt)<=0)bank();
        }
        else{   // a manual: keep it balanced with W and S
          R.bal+=((Math.random()-.5)*1.4+R.bal*1.2-(d==='up'?1:d==='down'?-1:0)*2.6*(R.nose?-1:1))*dt; bonus(40*dt);
          if(Math.abs(R.bal)>1)return bail(R,'YOU TIP OUT OF THE MANUAL AND BAIL.'),true;
          if(pop){ R.s='air'; R.vz=3*T; R.vh=R.v; R.z=.001; R.spun=0; R.gy=g0; add(R,'OLLIE',50); }
          else if(hit.has('manual')){ R.s='roll'; R.landT=.6; } }
        if(R.s!=='air'&&move(R,dt,R.v)===false)return true;
        if(R.s!=='air'){ const g1=G(pos.x,pos.z); if(g1<(R.gy==null?g1:R.gy)-.22*MV){ R.s='air'; R.z=R.gy-g1; R.vz=0; R.vh=R.v; R.spun=0; R.gy=g1; } else R.gy=g1; } } }
    else if(R.s==='air'){
      R.vz-=9.8*T*dt; R.z+=R.vz*dt;
      if(!R.vert){ if(move(R,dt,R.vh)===false)return true; const g1=G(pos.x,pos.z); R.z+=R.gy-g1; R.gy=g1; }
      // spins, flips, grabs; L grabs a rail on the way down
      const sv=(d==='left'?1:d==='right'?-1:0)*2*PI*.95; R.hd+=sv*dt; R.spun+=Math.abs(sv*dt);
      if(R.flip){ R.flip.t+=dt; if(R.flip.t>=R.flip.dur)R.flip=null; }
      if(hit.has('flip')&&!R.flip){ const f=FLIPS[d]||FLIPS['']; R.flip={k:f[2],t:0,dur:.42}; add(R,f[0],f[1]); }
      if(DOWN.has('grab')){ if(!R.grab){ const g=GRABS[d]||GRABS['']; R.grab=g[2]; add(R,g[0],g[1]); } else bonus(60*dt); } else R.grab=null;
      if(hit.has('grind')&&tryGrind(R)){}
      else if(R.z<=0&&R.vz<=0)land(R); }
    else if(R.s==='grind'){
      const r=R.rail, ux=(r.b[0]-r.a[0])/R.rL, uz=(r.b[2]-r.a[2])/R.rL;
      R.v=Math.max(.8*T,R.v-.35*T*dt); R.gt+=R.gs*R.v*dt; bonus(50*dt);
      if(R.gt<0||R.gt>R.rL){ leaveRail(R,.8*T); }
      else{ pos.x=r.a[0]+ux*R.gt; pos.z=r.a[2]+uz*R.gt; R.railY=r.a[1]+(r.b[1]-r.a[1])*R.gt/R.rL; R.md=Math.atan2(ux*R.gs,uz*R.gs); R.hd=R.md+(R.fakie?PI:0);
        // keep your balance with A and D
        R.bal+=((Math.random()-.5)*1.6+R.bal*1.1-(d==='left'?1:d==='right'?-1:0)*2.8)*dt;
        if(Math.abs(R.bal)>1)return bail(R,'YOU LOSE YOUR BALANCE AND BAIL.'),true;
        if(pop)leaveRail(R,3*T); } }
    if(!RIDE.on||!RIDE.cur)return true;   // you bailed this step
    SHARED.heading=R.hd; R.lift=0; st.ride=RIDE.cur.pose(R); hud(R,dt); return true; };

  // where you stand: on the ground, up in the air, or on the rail's top
  TRICKS.floor=(g,R,off)=>!ON()||R!==RIDE?g+off+(R.z||0):R.s==='grind'?R.railY+off:g+off+(R.z||0);
  // how you stand: crouched to pop or tucked in the air, a hand on the board, leaning into a manual; your stance swaps riding fakie
  // shared (owner, 7 Nov 2026: "all moves and player actions shared in real time"): your trick as it happens, a few times a second and at every change; another skater's lands on their board here (RIDE.their)
  { let last='', kT=0; SYS.add('life',dt=>{ const R=RIDE; if(!R.on||!R.s||!ONLINE.on){ last=''; return; } const f=R.flip, m={t:'trk',s:R.s,g:R.s==='air'&&R.grab?String(R.grab).toLowerCase().replace(/[^a-z]/g,'').slice(0,8):'',fk:f?f.k:'',fd:f?+f.dur.toFixed(2):0,ft:f?+f.t.toFixed(2):0,n:R.nose?1:0,f:R.fakie?1:0,sl:R.slide?1:0,p:R.pushing?1:0,c:+(R.charge||0).toFixed(2),v:+(R.v||0).toFixed(1),z:+(R.z||0).toFixed(2)};
      const k=[m.s,m.g,m.fk,m.n,m.f,m.sl,m.p].join(); kT-=dt||0; if(k!==last||kT<=0){ last=k; kT=.25; ONLINE.send(m); } },'146ib-tricks share');
    ONLINE.hear.trk=m=>{ '@later'; const R=RIDE.their&&RIDE.their(m.id); if(!R)return; R.trk=true; R.s=m.s||'roll'; R.grab=m.g||null; R.nose=!!m.n; R.fakie=!!m.f; R.slide=m.sl?1:0; R.pushing=!!m.p; R.charge=+m.c||0; R.v=+m.v||0; R.z=+m.z||0;
      if(m.fk&&m.fd>0){ if(!R.flip||R.flip.k!==m.fk)R.flip={k:m.fk,dur:+m.fd,t:+m.ft||0}; } else R.flip=null; }; }
  TRICKS.pose=(R,P)=>{ if(R!==RIDE&&!R.trk)return; P.z=0; P.push=R.s==='roll'&&R.pushing?R.pt%1:-1; P.crouch=R.s==='air'?(R.grab?1.6:.6):R.s==='roll'?(R.charge||0)*1.2:R.s==='grind'?.5:0; P.grab=R.s==='air'?R.grab:null;
    P.lean=R.s==='manual'?(R.nose?20:-22):0; P.goofy=!!R.fakie; P.brake=R.s==='roll'&&!(R.v>.2*T); };
  // the board: it flips, shoves round, turns across a slide, tips up for a manual
  TRICKS.place=(m,R)=>{ '@later'; if(R!==RIDE&&!R.trk)return; const f=R.flip; if(f){ const u=f.t/f.dur, a=2*PI*u; if(f.k==='kick')m.rotation.z+=a; else if(f.k==='heel')m.rotation.z-=a; else if(f.k==='hard'){ m.rotation.z+=a; m.rotation.y+=PI*u; } else m.rotation.y+=PI*u; }
    if(R.s==='grind'&&R.slide)m.rotation.y+=PI/2; if(R.s==='manual')m.rotation.x=R.nose?.22:-.22; };

  // on screen: the combo as you build it, its balance while you grind or manual, what you banked
  let flash=null; const hudE=document.createElement('div'); hudE.id='skatehud'; hudE.hidden=true;
  hudE.style.cssText='position:fixed;left:50%;bottom:22%;transform:translateX(-50%);z-index:12;text-align:center;font:12px Silkscreen,monospace;letter-spacing:1px;color:#f2c14e;text-shadow:0 2px 0 #000,0 0 6px #000;pointer-events:none;zoom:var(--uiz,1)';
  document.body.appendChild(hudE);
  const hud=(R,dt)=>{ '@later'; const C=TRICKS.combo; let o='';
    if(C){ o+='<div style="color:#e8e2cc;max-width:70vw">'+C.list.slice(-5).join(' + ')+'</div><div style="font-size:16px">'+Math.round(C.base)+' × '+C.mult+'</div>'; }
    if(R.s==='grind'||R.s==='manual'){ const b=Math.max(-1,Math.min(1,R.bal||0)); o+='<div style="margin:6px auto 0;width:160px;height:6px;background:#1a1d26;border:1px solid #3a3f4e;position:relative"><div style="position:absolute;left:'+(50+b*48)+'%;top:-3px;width:4px;height:12px;background:'+(Math.abs(b)>.7?'#ff5a3a':'#7dffa4')+'"></div></div>'; }
    if(flash){ o+='<div style="font-size:15px;color:'+(flash.bad?'#ff5a3a':'#7dffa4')+'">'+flash.txt+'</div>'; if((flash.t-=dt)<=0)flash=null; }
    o+='<div style="color:#8a8f9c;font-size:9px;margin-top:4px">BEST '+TRICKS.best+' · THIS RIDE '+TRICKS.session+'</div>';
    hudE.innerHTML=o; hudE.hidden=false; };
  SYS.add('life',()=>{ if(!ON()&&!hudE.hidden){ hudE.hidden=true; if(TRICKS.combo)bank(); } },'146ib-tricks');
  window.TRICKSDBG=()=>{ '@later'; const R=RIDE; return {on:ON(),s:R.s,v:+((R.v||0)/T).toFixed(2),z:+((R.z||0)/T).toFixed(2),hd:+(R.hd||0).toFixed(2),md:+(R.md||0).toFixed(2),flip:R.flip&&R.flip.k,grab:R.grab,rail:!!R.rail,bal:+(R.bal||0).toFixed(2),combo:TRICKS.combo&&{list:TRICKS.combo.list,base:Math.round(TRICKS.combo.base),mult:TRICKS.combo.mult},best:TRICKS.best,session:TRICKS.session,rails:(SKATE.rails||[]).length}; };
}
