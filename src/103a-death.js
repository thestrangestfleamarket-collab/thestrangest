// THE DEATH: what happens when you die: the YOU ARE DEAD note, the fall, your body left holding what you carried, and the ghost's float to the bath house on the lake's island, whose steam brings you back to life there (or RESURRECT in the menu).
import {SHARED, THREE} from './003-shx.js';
import {GHOSTS, INV, keys, LEVELS, PH, pos, RAG, st, UI, VIT, W3} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {OWNED, SAVE} from './005-save.js';
import {FADE, QS, STORE, SYS, TILE, wait} from './006-map-pre.js';
{ const T=TILE, el=document.createElement('div'), css=document.createElement('style'); el.id='dead'; el.className='mlb'; el.hidden=true;
  css.textContent='#dead{position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top,0px));transform:translateX(-50%);font:12px var(--pixel);color:var(--key);background:var(--panel);border:2px solid var(--line);padding:6px 10px;z-index:15;pointer-events:none;zoom:var(--uiz,1)} #dead[hidden]{display:none}';
  document.head.appendChild(css); document.body.appendChild(el);
  const DEAD='YOU ARE DEAD. FLOAT TO THE BATH HOUSE ON THE LAKE\'S ISLAND.', note=(t,s)=>{ el.textContent=t; el.hidden=false; clearTimeout(note.t); if(s)note.t=setTimeout(()=>{ if(VIT.dead)note(DEAD); else el.hidden=true; },s*1000); };
  const MH=T/.84, WAIT=10, HOUR=36e5; let S=null, gh=0, rise=-1, busy=false, dp=null, wt=0, wt0=0, wn=0;
  const sheet=()=>{ '@later'; if(S||!window.GHOSTS||!GHOSTS.cloth)return S; const MV=SHARED.BOD.YS(24)/.84, mat=new THREE.MeshToonMaterial({color:0xf2f0ea,emissive:0x2a3040,gradientMap:W3.GP,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}), em=new THREE.MeshBasicMaterial({color:0x0c0c10,transparent:true,opacity:0}), eg=new THREE.CircleGeometry(1,10);
    S=GHOSTS.cloth(1.15,true,17,.24,mat,pos.x/MH,SHARED.py/MV+1.5,pos.z/MH); S.MV=MV; S.mat=mat; S.em=em; S.eyes=[-1,1].map(()=>{ const e=new THREE.Mesh(eg,em); e.scale.set(.05*MH,.075*MV,1); e.renderOrder=4; scene.add(LEVELS.own(e,'*')); return e; }); return S; };
  const look=on=>{ W3.mesh.visible=!on; W3.ghost=on; if(S){ S.me.visible=on; for(const e of S.eyes)e.visible=on; } };
  const V=new THREE.Vector3();
  // a ghost sees the world in black and white (owner, 8 Nov 2026: "when you're a ghost the game is black and white")
  const grey=()=>{ const c=renderer.domElement, on=!!VIT.dead; if(c.dataset.ghost===(on?'1':''))return; c.dataset.ghost=on?'1':''; c.style.filter=on?'grayscale(1)':''; };
  SYS.every(grey,300,'103a-death grey');
  // your body (owner, 7 Nov 2026): it stays where you fell with all you carried for an hour; alive again, a double-click takes it all back
  let body=null;
  const keepBody=c=>{ try{ if(c)OWNED.set('corpse',JSON.stringify(c)); else OWNED.del('corpse'); }catch(e){} };
  const hideBody=()=>{ if(!body)return; body.me.removeFromParent(); body.me.geometry.dispose(); const i=UI.things.indexOf(body.th); if(i>=0)UI.things.splice(i,1); body=null; };
  const showBody=c=>{ hideBody(); if(!c)return; const me=new THREE.Mesh(new THREE.CapsuleGeometry(.16*T,.9*T,4,8).rotateZ(Math.PI/2),new THREE.MeshToonMaterial({color:0x6a5a4a,gradientMap:W3.GP}));
    me.position.set(c.x,c.py+.16*T,c.z); me.rotation.y=c.h||0; me.castShadow=true; scene.add(LEVELS.own(me,c.lv||'*'));
    const th={name:'YOUR BODY',obj:me,reach:1.6*T,near:2.4*T,tall:.5*T,act:()=>takeBody()}; UI.thing(th); body={c,me,th}; };
  const takeBody=()=>{ if(!body||VIT.dead)return; const c=body.c; for(const k in c.items)INV.items[k]=(INV.items[k]||0)+c.items[k]; Object.assign(INV.inside,c.inside||{}); INV.cash+=c.cash||0; INV.save(); hideBody(); keepBody(null); note('YOU TAKE BACK WHAT YOUR BODY HELD.',4); };
  const inBath=()=>{ const G=SHARED.BOD&&SHARED.BOD.GD; return !!(G&&G.inside&&SHARED.LVL==='up'&&G.inside()); };
  VIT.die=()=>{ if(VIT.dead)return; VIT.dead=true; VIT.fainted=false; VIT.hp=0; VIT.out=2.4; SHARED.trip=true; gh=0; rise=-1; wt=0; wn=0; want=false; try{ SAVE.set('dead','1'); }catch(e){} note(DEAD);
    const old=body&&body.c, c={x:pos.x,z:pos.z,py:SHARED.py,h:SHARED.heading,lv:SHARED.LVL==='down'&&LEVELS.cur||'*',dn:SHARED.LVL==='down',t:Date.now(),items:{...INV.items},inside:{...(INV.inside||{})},cash:INV.cash};
    try{ SAVE.set('deadat',JSON.stringify({x:c.x,z:c.z,h:c.h,dn:c.dn})); }catch(e){}
    if(old){ for(const k in old.items)c.items[k]=(c.items[k]||0)+old.items[k]; Object.assign(c.inside,old.inside||{}); c.cash+=old.cash||0; }   // a body already lying somewhere: what it held comes to the new one
    if(Object.keys(c.items).length||c.cash){ INV.items={}; INV.inside={}; INV.cash=0; INV.save(); keepBody(c); showBody(c); } };
  const back=async here=>{ '@later'; busy=true; await FADE.run('REFRESHED',async()=>{ await wait(1500);
    const G=SHARED.BOD.GD, K=SHARED.BOD.GDK, dx=G.door[0], oy=K?K.y1e+.6:G.door[1]+3;
    if(!here&&!G.here){ STORE.goTo(SHARED.BOD.X(dx),SHARED.BOD.Z(oy),'up'); SHARED.heading=SHARED.BOD.Z(oy+1)>SHARED.BOD.Z(oy)?0:Math.PI; PH.hd=SHARED.heading; } keys.clear(); SHARED.target=null;
    VIT.dead=false; VIT.hp=1; VIT.sta=1; VIT.out=0; gh=0; rise=-1; wt=0; wt0=0; wn=0; look(false); try{ SAVE.del('dead'); SAVE.del('deadat'); }catch(e){}
    },{hold:200}); note('You feel refreshed.',5); busy=false; };
  // RESURRECT in the menu (owner, 4 Nov 2026, every player): back to life where you stand (a ragdoll still falling settles first)
  let want=false; VIT.revive=()=>{ if(!VIT.dead||busy)return false; want=true; return true; };
  SYS.add('vitals',(dt)=>{ if(body&&Date.now()-body.c.t>HOUR){ hideBody(); keepBody(null); note('YOUR BODY HAS CRUMBLED TO DUST, AND WHAT IT HELD WITH IT.',6); }
    if(!VIT.dead||busy)return; VIT.hp=0;
    if(want){ VIT.out=0; } if(want&&!RAG.on){ want=false; if(st.move&&st.move.name==='fall'&&st.move.held)RIG.release(st,'F'); back(true); return; }
    if(gh>=1&&!RAG.on&&st.move&&st.move.name==='fall'&&st.move.held)RIG.release(st,'F');
    if(VIT.out>0||!sheet())return;
    if(!gh){ look(true); S.ball={x:pos.x/MH,y:SHARED.py/S.MV+1.5,z:pos.z/MH}; S.drop(); }
    if(rise<0){ gh=Math.min(1,gh+dt);   // ten seconds in the bath house's steam and you are alive again where you stand, the island's bridge your way off (owner, 8 Nov 2026); walking out starts it over
      if(gh>=1&&inBath()){ const nw=performance.now()/1000; if(!wt0)wt0=nw; wt=nw-wt0; const n=Math.max(1,Math.ceil(WAIT-wt)); if(n!==wn){ wn=n; note('THE STEAM REFRESHES YOU \u00b7 '+n); } if(wt>=WAIT){ rise=0; back(true); } }
      else if(wt>0||wt0){ wt=0; wt0=0; wn=0; note(DEAD); } }
    const dn=SHARED.BOD.GD&&SHARED.BOD.GD.deep!=null?SHARED.BOD.GD.deep/S.MV+.45:SHARED.py/S.MV, y0=SHARED.py/S.MV+1.5, e=rise>0?Math.min(1,rise/2.6):0, b=S.ball, s3=e*e*(3-2*e), q=rise>0&&dp?Math.min(1,s3*1.6):0, to={x:(pos.x+((dp?dp[0]:pos.x)-pos.x)*q)/MH,y:y0+.05*Math.sin(performance.now()/1000*1.6)*(1-e)+(dn-y0)*s3,z:(pos.z+((dp?dp[1]:pos.z)-pos.z)*q)/MH}; S.gnd=rise>0?dn-.5:SHARED.py/S.MV;
    if(Math.hypot(to.x-b.x,to.z-b.z)>1||Math.abs(to.y-b.y)>1)GHOSTS.move(S,to);
    if(gh>=1&&rise<0&&!GHOSTS.on(S)){ S.ball={...to}; S.drop(); GHOSTS.settle(S,240); }
    GHOSTS.run(S,dt,to,[],MH,S.MV); const a=gh<=1?gh:2-gh; S.mat.opacity=.5*a; S.em.opacity=.85*a;
    const fx=Math.sin(SHARED.heading), fz=Math.cos(SHARED.heading); S.eyes.forEach((e,k)=>{ const sd=k?1:-1, ex=to.x+fx*(S.BR+.05)+fz*sd*.09, ey=to.y+.03, ez=to.z+fz*(S.BR+.05)-fx*sd*.09; e.position.set(ex*MH,ey*S.MV,ez*MH); e.lookAt(V.set((ex+fx)*MH,ey*S.MV,(ez+fz)*MH)); }); },'103a-death');
  window.KILLME=()=>VIT.die(); window.DEADDBG=()=>({gh,rise,wt,busy,out:VIT.out,lvl:SHARED.LVL,py:SHARED.py,sheet:!!S,pool:!!(SHARED.BOD.GD&&SHARED.BOD.GD.inPool&&SHARED.BOD.GD.inPool(pos.x,pos.z)),on:S?GHOSTS.on(S):null,span:S?(()=>{ let lo=9,hi=-9; for(const k of S.live){ lo=Math.min(lo,S.P[k+1]); hi=Math.max(hi,S.P[k+1]); } return +(hi-lo).toFixed(2); })():null});
  if(SAVE.get('dead')==='1'){ VIT.dead=true; VIT.hp=0; note(DEAD); }
  try{ const c=JSON.parse(OWNED.get('corpse')||'null'); if(c)SYS.onStart(()=>showBody(c),'103a-death'); }catch(e){}
  window.BODYDBG=()=>body&&{x:body.c.x,z:body.c.z,lv:body.c.lv,items:Object.keys(body.c.items).length,cash:body.c.cash,age:Date.now()-body.c.t};
  if(QS.get('die'))SYS.onStart(()=>setTimeout(()=>VIT.die(),300),'103a-death'); }
