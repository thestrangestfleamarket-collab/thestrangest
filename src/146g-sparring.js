// THE SPARRING RING: SPAR paints a ring on Market St by the swordsmith; SPAR there and two skeleton partners come at you with blade and shield, block, fall and get up: swordplay practice for a scratch of health.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, pos, SFX, UI, VIT, WIELD} from './003b-systems.js';
import {MAPG, MODS, SYS, TILE} from './006-map-pre.js';
import {SKELGO} from './077-npc-skel.js';
const SPAR={on:false,list:[],ring:null}; window.SPAR=SPAR;
{ const T=TILE, X=72, Y=-73.5, HP=5, say=(t,c)=>FORAGE.say&&FORAGE.say(t,c), d2=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  const at=()=>({x:SHARED.BOD.XS(X),z:SHARED.BOD.ZS(Y)}), onStreet=()=>SHARED.LVL==='up'&&!SHARED.BODB.inside();
  const place=()=>{ if(SPAR.ring||!MODS.bodega||!MODS.bodega.ground)return; const p=at(), y=MODS.bodega.ground(p.x,p.z);
    const r=new THREE.Mesh(new THREE.RingGeometry(.9*T,1.05*T,24),new THREE.MeshBasicMaterial({color:0xd8b84a,transparent:true,opacity:.7,depthWrite:false})); r.rotation.x=-Math.PI/2; r.position.set(p.x,y+.02*T,p.z); MAPG.bodega.add(r); SPAR.ring=r;
    const hb=new THREE.Mesh(new THREE.BoxGeometry(1.2*T,1.4*T,1.2*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(p.x,y+.7*T,p.z); MAPG.bodega.add(hb);
    SPAR.thing={name:'THE SPARRING RING',obj:hb,reach:1.8*T,near:3*T,tall:1.6*T,act:()=>SPAR.start()}; UI.thing(SPAR.thing); };
  const end=(P,msg)=>{ if(P.mode!=='spar')return; P.mode='wait'; P.N.alert=false; if(msg)say(msg,'#c8c2b0'); if(!SPAR.list.some(q=>q.mode!=='wait'))SPAR.on=false; };
  const down=(P,you)=>{ const N=P.N, st=N.st; P.mode='down'; st.to=null; st.face={x:you.x,z:you.z}; N.an.play('Death_A',{hold:true}); SFX.play('clunk',{vol:.6,pitch:.7});
    say('YOUR PARTNER GOES DOWN. WELL FOUGHT.','#7dffa4'); FORAGE.use('sword',0,60);
    setTimeout(()=>{ if(P.mode!=='down')return; N.an.play('Lie_StandUp',{then:()=>{ P.mode='wait'; P.hp=HP; N.alert=false; if(!SPAR.list.some(q=>q.mode!=='wait')){ SPAR.on=false; say('THE BOUT IS OVER. SPAR AGAIN AT THE RING.','#c8c2b0'); } }}); },1600); };
  const tick=(P,dt,you,st,N)=>{ const ST=window.STRIKES;
    if(P.mode==='wait'){ if(d2(st,P.home)>.4*T){ st.to={x:P.home.x,z:P.home.z}; st.v=P.v0; } else { st.to=null; st.face={x:you.x,z:you.z}; } return; }
    if(P.mode==='down'){ st.to=null; return; }
    N.alert=true; const d=d2(st,you); if(!onStreet()||d>10*T||VIT.dead)return end(P,'YOUR PARTNER LOWERS HIS SWORD.');
    for(const s of ST?ST.strikes():[])if(ST.inCone(s,st.x,st.z,N.g.position.y,.3*T)){
      if(!s.heavy&&!N.an.once&&Math.random()<.3){ N.an.play('Block'); SFX.play('clunk',{vol:.5,pitch:2.1}); say('HE BLOCKS.','#c8c2b0'); continue; }
      P.hp-=s.d*ST.strength(s); ST.landed(s); const dx=st.x-you.x, dz=st.z-you.z, l=Math.hypot(dx,dz)||1, kb=1.5*T*(s.kb||1); st.sx=dx/l*kb; st.sz=dz/l*kb; SFX.play('clunk',{vol:.5,pitch:1.5,vary:.2});
      if(P.hp<=0)return down(P,you); if(s.heavy)P.cool=Math.max(P.cool,2.4); N.an.play('Hit_A'); }
    if(N.an.once){ st.to=null; st.face={x:you.x,z:you.z}; return; }
    const R=1.2*T; P.cool-=dt;
    if(d>R){ const k=(d-R*.8)/d; st.to={x:st.x+(you.x-st.x)*k,z:st.z+(you.z-st.z)*k}; st.v=P.v0*1.6; st.face=null; return; }
    st.to=null; st.face={x:you.x,z:you.z}; const off=Math.abs(((Math.atan2(you.x-st.x,you.z-st.z)-st.h+Math.PI*3)%(Math.PI*2))-Math.PI); if(P.cool>0||off>.4)return; P.cool=1.7+Math.random()*.6;
    N.an.play(Math.random()<.5?'1H_Melee_Attack_Chop':'1H_Melee_Attack_Slice_Diagonal',{at:[.42,()=>{ if(P.mode!=='spar'||VIT.dead)return; if(d2(st,pos)<R*1.5&&VIT.hurt(.03,st)===2){ P.cool=3.2; N.an.play('Hit_A'); } }]}); };
  const make=()=>{ const G=window.GUARDX; if(!G||!G.skel||SPAR.list.length)return; const p=at();
    for(let i=0;i<2;i++){ const home={x:p.x+(i-.5)*1.6*T,z:p.z+.9*T}, P={hp:HP,mode:'wait',cool:1,home,v0:0};
      const N=G.skel('Warrior','SPARRING PARTNER',.78,home.x,home.z,.5,{key:'spar'+i,walkN:'Walking_A',idleN:'Idle_Combat',gear:[['Blade','handslot_r'],['Shield_Large_A','handslot_l']],pick:st=>{ st.to=null; st.wait=1; },brain:(dt,you,st,N)=>tick(P,dt,you,st,N)});
      P.N=N; P.v0=N.st.v; N.st.hold=true; SPAR.list.push(P); } };
  SPAR.start=async()=>{ if(SPAR.on)return; if(!WIELD.sword)return say('HOLD A SWORD FIRST. THE SWORDSMITH SELLS THEM.','#c8a090'); SPAR.on=true; say('YOUR PARTNERS STEP UP.','#7dffa4');
    try{ await SKELGO(); }catch(e){} make(); if(!SPAR.list.length){ SPAR.on=false; return; }
    for(const P of SPAR.list){ P.mode='spar'; P.hp=HP; P.cool=1+Math.random(); P.N.alert=true; P.N.an.clear(); P.N.an.play('Taunt'); } };
  SYS.add('places',()=>{ if(!SPAR.ring&&window.__started)place(); },'146g-sparring');
  window.SPARDBG=()=>({on:SPAR.on,ring:!!SPAR.ring,thing:!!SPAR.thing,partners:SPAR.list.map(P=>({mode:P.mode,hp:P.hp,act:P.N.an.once&&P.N.an.once.n,x:+(P.N.st.x/T).toFixed(1),z:+(P.N.st.z/T).toFixed(1)}))}); }
