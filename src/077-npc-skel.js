// THE SKELETONS: SKELGO makes the dungeon's skeletons, their walking and fighting; DRAGON holds the dragon's model.
import {SHARED, THREE} from './003-shx.js';
import {SKIN} from './003a-skin.js';
import {CLOCK, NPCS} from './003b-systems.js';
import {MODS, QS, SOL, TILE} from './006-map-pre.js';
import {SKEL} from './075-main-13.js';
import {DUN, makeNPC, stfree, STHOLE} from './076-npc-map.js';
const SKELGO=()=>SKELGO.p||(SKELGO.p=LOAD('dungeon').then(async()=>{ '@dungeon'; const S=await SKEL();
MODS.skel=SKELGO;
  const BN=S.rig.names.map(n=>n.replace(/\./g,'_')), JI=Object.fromEntries(BN.map((n,i)=>[n,i]));
  const geomOf=(M,rigged)=>SKIN.geom(M,rigged), rigOf=()=>SKIN.rig(S.rig,BN), CLIPS=SKIN.clips(S.clips,BN,false,n=>n.replace(/\./g,'_'));
  const LANE={x0:SHARED.BOD.XS(52),x1:SHARED.BOD.XS(106),z0:SHARED.BOD.ZS(-76.3),z1:SHARED.BOD.ZS(SHARED.BOD.FAR+2.8)}, HOLE=STHOLE,
    free=(x,z,R)=>!(x>HOLE[0]-R&&x<HOLE[2]+R&&z>HOLE[1]-R&&z<HOLE[3]+R)&&!SOL.up.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R), WALK=.87;
  const RUNU=2.6;
  const Anim=(mixer)=>{ const A={}, W={}, act=n=>A[n]||(A[n]=mixer.clipAction(CLIPS[n]));
    const M={base:'Idle_A',ts:1,once:null};
    M.play=(n,o={})=>{ const a=act(n); a.reset(); a.setLoop(THREE.LoopOnce,1); a.clampWhenFinished=true; a.timeScale=o.speed||1; a.play(); W[n]=W[n]||0; M.once={n,t:0,d:CLIPS[n].duration/(o.speed||1),hold:o.hold,then:o.then,at:o.at,fired:false}; };
    M.clear=()=>{ M.once=null; };
    M.update=dt=>{ const O=M.once; if(O){ O.t+=dt; if(O.at&&!O.fired&&O.t>=O.at[0]*O.d){ O.fired=true; O.at[1](); } if(O.t>=O.d&&!O.hold){ M.once=null; O.then&&O.then(); } }
      const tgt=M.once?M.once.n:M.base; act(M.base).timeScale=M.ts;
      for(const n of new Set([...Object.keys(W),tgt])){ const a=act(n); W[n]=W[n]??0; W[n]+=((n===tgt?1:0)-W[n])*Math.min(1,dt*10);
        if(W[n]>.01){ if(!a.isRunning()&&n!==(M.once&&M.once.n)){ a.setLoop(THREE.LoopRepeat,Infinity); a.play(); } a.setEffectiveWeight(W[n]); } else{ a.stop(); delete W[n]; } }
      mixer.update(dt); };
    return M; };
  const T_=x=>SHARED.BOD.XS(x), Z_=y=>SHARED.BOD.ZS(y), d2=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  const CH=[ ['Warrior','WARRIOR',58,.78,'Walking_A','Idle_A',.55,[['Blade','handslot_r'],['Shield_Large_A','handslot_l']],[[53,-72.3],[79,-72.3]],{hit:'1H_Melee_Attack_Chop',reach:.8,at:.42,dmg:.55}],
             ['Mage','MAGE',69,.75,'Walking_C','Idle_B',.42,[['Staff','handslot_r']],[[52,-67.8],[79,-67.8]],{hit:'Spellcast_Shoot',reach:5,at:.5,bolt:[.8,.4,1.6],dmg:.5}],
             ['Minion','MINION',82,.7,'Walking_B','Idle_A',.6,[],[[81,-66.2],[106,-66.2]],{hit:'Unarmed_Melee_Attack_Punch_A',reach:.65,at:.38,dmg:.35}],
             ['Rogue','ROGUE',95,.75,'Walking_A','Idle_B',.5,[['Crossbow','handslot_r']],[[55,SHARED.BOD.FAR+1.4],[104,SHARED.BOD.FAR+1.4]],{hit:'1H_Ranged_Shoot',reach:6.5,at:.45,bolt:[1.2,1.1,.8],dmg:.45}] ];
  const GUARDS=[], RUN=1.9*TILE, SEE=18*TILE;
  const spread=rig=>{ const R=S.rig, W=[], at=i=>W[i]||(W[i]=(R.parent[i]>=0?at(R.parent[i]).clone():new THREE.Quaternion()).multiply(new THREE.Quaternion().fromArray(R.q[i])));
    for(const [bn,deg] of [['upperleg_l',14],['upperleg_r',-14],['upperarm_l',22],['upperarm_r',-22]]){ const i=JI[bn], rz=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),deg*Math.PI/180); rig.bones[i].quaternion.copy(at(R.parent[i]).clone().invert().multiply(rz).multiply(at(i))); } };
  const skel=(key,name,metres,x,z,speed,o)=>{ const M=S.chars[key], rig=rigOf(), mixer=new THREE.AnimationMixer(rig.bones[0]), an=Anim(mixer);
    let geo=geomOf(M,true);
    if(o.gild){ const c=geo.attributes.color.array, P=geo.attributes.position.array, R=geo.attributes.reg.array, part=M.parts, ix=geo.index.array, keep=[];
      for(let i=0;i<R.length;i++){ const p=part[R[i]], l=c[i*3]*.3+c[i*3+1]*.59+c[i*3+2]*.11, x=P[i*3], y=P[i*3+1], z=P[i*3+2]; let k=[1.3,.95,.36];
        if(p==='Eyes')k=[0,0,0]; else if(p==='Jaw'||p==='Head'&&z>.05&&y<1.6&&Math.abs(x)<.3)k=[1.35,1.3,1.18]; else if(p==='Body'&&y>1.02)k=[.8,.8,.84];
        c[i*3]=Math.min(255,l*k[0]+(p==='Eyes'?14:0)); c[i*3+1]=Math.min(255,l*k[1]+(p==='Eyes'?9:0)); c[i*3+2]=Math.min(255,l*k[2]+(p==='Eyes'?8:0)); }
      for(let t=0;t<ix.length;t+=3)if(part[R[ix[t]]]!=='Cloak')keep.push(ix[t],ix[t+1],ix[t+2]); geo.setIndex(new THREE.BufferAttribute(Uint16Array.from(keep),1)); }
    const N=makeNPC(null,{key:o.key||key,name,names:M.parts,lv:'up',group:'bodega',geo,skin:rig,tall:2.166,eye:o.gild?-1:M.eye,eyeC:o.eyeC,rank:M.parts.map(p=>/Helmet|Hat|Hood|Cape|Cloak/.test(p)?2:0),
      metres,x,z,lane:LANE,free:o.pick?free:stfree,roam:!o.pick,ground:(x,z)=>MODS.bodega.ground(x,z),radius:.25,speed,stride:0,rock:0,bob:0,pick:o.pick,brain:o.brain,...(o.dun||{}),
      anim:(dt,moving,st,sc)=>{ const run=moving&&st.v>1.2*TILE; N.sta=run?Math.max(0,N.sta-dt/14):Math.min(1,N.sta+dt/8); if(N.sta<=0)N.tired=true; if(N.tired&&N.sta>.33)N.tired=false;
      if(N.sheet){ if(!N.posed){ N.posed=true; spread(rig); } return; }
      if(QS.get('skelrest'))return; an.base=moving?(run?'Running_A':o.walkN):(N.alert?'Idle_Combat':o.idleN); an.ts=moving?st.v/((run?RUNU:WALK)*sc):1; an.update(dt); }});
    for(const [gn,slot] of o.gear||[]){ const m=new THREE.Mesh(geomOf(S.gear[gn],false),N.me.material); m.castShadow=true; rig.bones[JI[slot]].add(m); }
    N.mixer=mixer; N.an=an; N.skelChar=key; N.restless=()=>!!N.alert||!!an.once; return N; };
  for(const [key,name,tx,metres,walkN,idleN,speed,gear,beat,style] of CH){ const G={beat:beat.map(([x,y])=>({x:T_(x),z:Z_(y)})),leg:0,mode:'patrol',cool:0,look:Math.random()*6,style};
    const DN=DUN();
    const N=skel(key,name,metres,DN?DN.x:T_(tx),DN?DN.z:Z_({58:-67,69:-65.5,82:-68.5,95:-66}[tx]),speed*.9,{walkN,idleN,gear,dun:DN,
      pick:DN?undefined:st=>{ G.leg^=1; const p=G.beat[G.leg]; st.to={x:p.x,z:p.z+(Math.random()-.5)*.3*TILE}; st.v=G.walkV; },
      brain:(dt,you,st,N)=>{ if(DN)return;
        G.walkV=G.walkV||st.v; G.cool-=dt; G.look+=dt;
        N.alert=!st.to; if(st.to)st.h0=null; else{ if(st.h0==null)st.h0=st.h; const a=st.h0+Math.sin(G.look*.7)*1.1; st.face={x:st.x+Math.sin(a),z:st.z+Math.cos(a)}; } }});
    GUARDS.push(N); N.guard=G; }
  { const DN=DUN(); skel('Minion','GOLD SKELETON',1.4,DN?DN.x:T_(77),DN?DN.z:Z_(SHARED.BOD.FAR),.45,{key:'Gold',walkN:'Walking_A',idleN:'Idle_A',gild:true,dun:DN}); }
  window.GUARDX=MODS.guardx={free,SEE,RUN,LANE,T_,Z_,d2,GUARDS,skel};
  window.SKELGUARDDBG=()=>({guards:GUARDS.map(N=>({k:N.key,mode:N.guard.mode,x:+(N.st.x/TILE).toFixed(1),z:+(N.st.z/TILE).toFixed(1),act:N.an.once&&N.an.once.n})),dark:CLOCK.dark()});
  }));
window.SKELDBG=()=>NPCS.filter(N=>N.mixer).map(N=>({key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),to:!!N.st.to,bones:N.me.skeleton.bones.length}));
if(!MODS.dungeon)await SKELGO();

const DRAGON=__LAZY__("data/dragon.json");
export {DRAGON, SKELGO};
