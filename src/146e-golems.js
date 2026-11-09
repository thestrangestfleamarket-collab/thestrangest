// THE GOLEM GUARDS: GOLEMS makes the rock golems (one kind, four of it) guard the dungeon: slow, they come at you near the mouth, your strikes land, they crumble to rocks and form again.
import {SHARED, THREE} from './003-shx.js';
import {INV, PAWNL, pos, RIDE, SFX, VIS, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';
import {GEMS} from './101-gems.js';
const GOLEMS={on:true,list:[]}; window.GOLEMS=GOLEMS;
{ const T=TILE, HP=6, RK=new THREE.MeshLambertMaterial({color:0x7a7872}), RG=new THREE.DodecahedronGeometry(.5,0), say=(t,c)=>{ SAY(t,c); };
  let found=false; const find=()=>{ if(found||!PAWNL)return; const L=PAWNL.filter(N=>/_\d$/.test(N.key)&&!N.sheet); if(!L.length)return; found=true; for(const N of L)GOLEMS.list.push({N,hp:HP,dead:false,t:0,agg:false,cool:0,v0:N.st.v,deb:[]}); };
  const crumble=r=>{ '@later'; const N=r.N, g=N.g.parent||scene; r.dead=true; r.t=10+Math.random()*50; VIS.hide(N.g,'away'); N.st.hold=true; N.st.to=null; N.far=true;   // 10 to 60 s as rocks, then it forms again
    for(let i=0;i<6;i++){ const m=new THREE.Mesh(RG,RK), a=i/6*Math.PI*2, d=(.3+Math.random()*.5)*T; m.position.set(N.st.x+Math.cos(a)*d,N.g.position.y+.2*T,N.st.z+Math.sin(a)*d); m.scale.setScalar(T*(.25+Math.random()*.3)); m.rotation.set(Math.random()*3,Math.random()*3,0); g.add(m); r.deb.push(m); }
    SFX.play('clunk',{vol:.7,pitch:.6,vary:.2}); say('THE GOLEM CRUMBLES TO ROCKS.','#e8e2cc'); };
  const reform=r=>{ const N=r.N; for(const m of r.deb)m.removeFromParent(); r.deb=[]; r.dead=false; r.agg=false; r.hp=HP; VIS.hide(N.g,'away',false); N.st.hold=false; N.far=false; SFX.play('clunk',{vol:.6,pitch:.8}); say('THE ROCKS GATHER: THE GOLEM STANDS AGAIN.','#c8c2b0'); };
  SYS.add('life',dt=>{ find(); if(!GOLEMS.on||!GOLEMS.list.length)return; const you={x:pos.x,z:pos.z}, alive=!VIT.dead&&SHARED.LVL==='down'&&!(RIDE.on&&RIDE.lift>2*T), near=alive, ST=window.STRIKES;
    const S=alive&&ST?ST.strikes():[]; const calm=GEMS.some(g=>(INV.items[g[0]]||0)>0);   // carrying a gem keeps them calm (they want to trade); hit one and it fights back
    for(const r of GOLEMS.list){ const N=r.N, st=N.st; if(r.dead){ if((r.t-=dt)<=0)reform(r); continue; }
      if(N.distract>performance.now()/1000){ r.agg=false; st.to=null; if(N.distractAt)st.face=N.distractAt; continue; }   // cursed: busy with the rats at its feet (146o)
      for(const s of S)if(ST.inCone(s,st.x,st.z,N.g.position.y,.3*T)){ r.hp-=s.d*ST.strength(s); r.agg=true; ST.landed(s); const dx=st.x-you.x, dz=st.z-you.z, l=Math.hypot(dx,dz)||1, kb=1.2*T*(s.kb||1); st.sx=dx/l*kb; st.sz=dz/l*kb; if(s.heavy)r.cool=Math.max(r.cool,2.5); SFX.play('clunk',{vol:.5,pitch:.9,vary:.2}); if(r.hp<=0){ crumble(r); break; } }
      if(r.dead)continue; const d=Math.hypot(st.x-you.x,st.z-you.z);
      if(alive&&!SHARED.unseen&&(r.agg?d<12*T:near&&d<6*T&&!calm)){ r.agg=true; st.v=r.v0*.7; if(d>1.3*T)st.to={x:you.x,z:you.z}; else { st.to=null; st.face={x:you.x,z:you.z}; if((r.cool-=dt)<=0){ r.cool=2.2; if(VIT.hurt(.07,st)===2){ r.cool=4; const dx=st.x-you.x, dz=st.z-you.z, l=Math.hypot(dx,dz)||1; st.sx=dx/l*T; st.sz=dz/l*T; } else SFX.play('thud',{vol:.6,pitch:.7}); } } }
      else if(r.agg){ r.agg=false; st.v=r.v0; st.to=null; } } },'146e-golems');
  window.GOLEMDBG=()=>GOLEMS.list.map(r=>({k:r.N.key,hp:r.hp,dead:r.dead,agg:r.agg,t:+r.t.toFixed(1)})); }
export {GOLEMS};
