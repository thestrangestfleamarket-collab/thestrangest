// THE DEATH: what happens when you die: the YOU ARE DEAD note, the fall, and the walk to the bath house to come back.
import {SHARED, THREE} from './003-shx.js';
import {GHOSTS, keys, LEVELS, LOOKS, PH, pos, RAG, st, VIT, W3} from './003b-systems.js';
import {scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {FADE, QS, STORE, SYS, TILE} from './006-map-pre.js';
{ const T=TILE, el=document.createElement('div'), css=document.createElement('style'); el.id='dead'; el.hidden=true;
  css.textContent='#dead{position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top,0px));transform:translateX(-50%);font:12px var(--pixel);color:var(--key);background:var(--panel);border:2px solid var(--line);padding:6px 10px;z-index:15;pointer-events:none;zoom:var(--uiz,1)} #dead[hidden]{display:none}';
  document.head.appendChild(css); document.body.appendChild(el);
  const DEAD='YOU ARE DEAD. FIND THE BATH HOUSE.', note=(t,s)=>{ el.textContent=t; el.hidden=false; clearTimeout(note.t); if(s)note.t=setTimeout(()=>{ if(VIT.dead)note(DEAD); else el.hidden=true; },s*1000); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), frames=k=>new Promise(r=>{ const f=()=>--k<=0?r():requestAnimationFrame(f); requestAnimationFrame(f); });
  const MH=T/.84; let S=null, gh=0, rise=-1, busy=false, dp=null;
  const sheet=()=>{ '@later'; if(S||!window.GHOSTS||!GHOSTS.cloth)return S; const MV=SHARED.BOD.YS(24)/.84, mat=new THREE.MeshToonMaterial({color:0xf2f0ea,emissive:0x2a3040,gradientMap:W3.GP,transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false}), em=new THREE.MeshBasicMaterial({color:0x0c0c10,transparent:true,opacity:0}), eg=new THREE.CircleGeometry(1,10);
    S=GHOSTS.cloth(1.15,true,17,.24,mat,pos.x/MH,SHARED.py/MV+1.5,pos.z/MH); S.MV=MV; S.mat=mat; S.em=em; S.eyes=[-1,1].map(()=>{ const e=new THREE.Mesh(eg,em); e.scale.set(.05*MH,.075*MV,1); e.renderOrder=4; scene.add(LEVELS.own(e,'*')); return e; }); return S; };
  const look=on=>{ W3.mesh.visible=!on; if(S){ S.me.visible=on; for(const e of S.eyes)e.visible=on; } };
  const V=new THREE.Vector3();
  VIT.die=()=>{ if(VIT.dead)return; VIT.dead=true; VIT.hp=0; VIT.out=2.4; SHARED.trip=true; gh=0; rise=-1; try{ SAVE.set('dead','1'); }catch(e){} note(DEAD); };
  const back=async()=>{ '@later'; busy=true; await FADE.run('REFRESHED',async()=>{ await wait(1500);
    const G=SHARED.BOD.GD, K=SHARED.BOD.GDK, dx=G.door[0], oy=K?K.y1e+.6:G.door[1]+3;
    STORE.goTo(SHARED.BOD.X(dx),SHARED.BOD.Z(oy),'up'); SHARED.heading=SHARED.BOD.Z(oy+1)>SHARED.BOD.Z(oy)?0:Math.PI; PH.hd=SHARED.heading; keys.clear(); SHARED.target=null;
    VIT.dead=false; VIT.hp=1; VIT.sta=1; VIT.out=0; gh=0; rise=-1; look(false); try{ SAVE.del('dead'); }catch(e){} LOOKS.robe(true);
    },{hold:200}); note('You feel refreshed.',5); busy=false; };
  SYS.add('vitals',(dt)=>{ if(!VIT.dead||busy)return; VIT.hp=0;
    if(gh>=1&&!RAG.on&&st.move&&st.move.name==='fall'&&st.move.held)RIG.release(st,'F');
    if(VIT.out>0||!sheet())return;
    if(!gh){ look(true); S.ball={x:pos.x/MH,y:SHARED.py/S.MV+1.5,z:pos.z/MH}; S.drop(); }
    if(rise<0){ gh=Math.min(1,gh+dt); if(gh>=1&&SHARED.BOD.GD&&SHARED.LVL==='up'&&SHARED.py<2*T&&(SHARED.BOD.GD.inPool?SHARED.BOD.GD.inPool(pos.x,pos.z):SHARED.BOD.GD.inside())){ rise=0; dp=SHARED.BOD.GD.deepAt?SHARED.BOD.GD.deepAt(pos.x,pos.z):[pos.x,pos.z]; if(SHARED.BOD.GD.poke)SHARED.BOD.GD.poke(pos.x,pos.z,1.4); } }
    else{ rise+=dt; keys.clear(); SHARED.target=null; gh=1+Math.max(0,(rise-2.2)/1); if(SHARED.BOD.GD.poke&&rise<2)SHARED.BOD.GD.poke(pos.x,pos.z,.5); if(rise>=3.2)back(); }
    const dn=SHARED.BOD.GD&&SHARED.BOD.GD.deep!=null?SHARED.BOD.GD.deep/S.MV+.45:SHARED.py/S.MV, y0=SHARED.py/S.MV+1.5, e=rise>0?Math.min(1,rise/2.6):0, b=S.ball, s3=e*e*(3-2*e), q=rise>0&&dp?Math.min(1,s3*1.6):0, to={x:(pos.x+((dp?dp[0]:pos.x)-pos.x)*q)/MH,y:y0+.05*Math.sin(performance.now()/1000*1.6)*(1-e)+(dn-y0)*s3,z:(pos.z+((dp?dp[1]:pos.z)-pos.z)*q)/MH}; S.gnd=rise>0?dn-.5:SHARED.py/S.MV;
    if(Math.hypot(to.x-b.x,to.z-b.z)>1||Math.abs(to.y-b.y)>1)GHOSTS.move(S,to);
    if(gh>=1&&rise<0&&!GHOSTS.on(S)){ S.ball={...to}; S.drop(); GHOSTS.settle(S,240); }
    GHOSTS.run(S,dt,to,[],MH,S.MV); const a=gh<=1?gh:2-gh; S.mat.opacity=.5*a; S.em.opacity=.85*a;
    const fx=Math.sin(SHARED.heading), fz=Math.cos(SHARED.heading); S.eyes.forEach((e,k)=>{ const sd=k?1:-1, ex=to.x+fx*(S.BR+.05)+fz*sd*.09, ey=to.y+.03, ez=to.z+fz*(S.BR+.05)-fx*sd*.09; e.position.set(ex*MH,ey*S.MV,ez*MH); e.lookAt(V.set((ex+fx)*MH,ey*S.MV,(ez+fz)*MH)); }); },'103a-death');
  window.KILLME=()=>VIT.die(); window.DEADDBG=()=>({gh,rise,busy,out:VIT.out,lvl:SHARED.LVL,py:SHARED.py,sheet:!!S,pool:!!(SHARED.BOD.GD&&SHARED.BOD.GD.inPool&&SHARED.BOD.GD.inPool(pos.x,pos.z)),on:S?GHOSTS.on(S):null,span:S?(()=>{ let lo=9,hi=-9; for(const k of S.live){ lo=Math.min(lo,S.P[k+1]); hi=Math.max(hi,S.P[k+1]); } return +(hi-lo).toFixed(2); })():null});
  if(SAVE.get('dead')==='1'){ VIT.dead=true; VIT.hp=0; note(DEAD); }
  if(QS.get('die')){ const go=()=>window.__started?VIT.die():setTimeout(go,200); setTimeout(go,300); } }
