const SKELGO=()=>SKELGO.p||(SKELGO.p=LOAD('dungeon').then(__CHUNK__('dungeon',async()=>{ const S=await SKEL();
  const BN=S.rig.names.map(n=>n.replace(/\./g,'_')), JI=Object.fromEntries(BN.map((n,i)=>[n,i]));
  const geomOf=(M,rigged)=>SKIN.geom(M,rigged), rigOf=()=>SKIN.rig(S.rig,BN), CLIPS=SKIN.clips(S.clips,BN,false,n=>n.replace(/\./g,'_'));
  const LANE={x0:BOD.XS(52),x1:BOD.XS(106),z0:BOD.ZS(-76.3),z1:BOD.ZS(BOD.FAR+2.8)}, HOLE=[BOD.XS(MAPSTAIR.x0-.6),BOD.ZS(MAPSTAIR.y0),BOD.XS(MAPSTAIR.x1+.6),BOD.ZS(MAPSTAIR.y1+.6)],
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
  const T_=x=>BOD.XS(x), Z_=y=>BOD.ZS(y), d2=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  const CH=[ ['Warrior','WARRIOR',58,.78,'Walking_A','Idle_A',.55,[['Blade','handslot_r'],['Shield_Large_A','handslot_l']],[[53,-72.3],[79,-72.3]],{hit:'1H_Melee_Attack_Chop',reach:.8,at:.42,dmg:.55}],
             ['Mage','MAGE',69,.75,'Walking_C','Idle_B',.42,[['Staff','handslot_r']],[[52,-67.8],[79,-67.8]],{hit:'Spellcast_Shoot',reach:5,at:.5,bolt:[.8,.4,1.6],dmg:.5}],
             ['Minion','MINION',82,.7,'Walking_B','Idle_A',.6,[],[[81,-66.2],[106,-66.2]],{hit:'Unarmed_Melee_Attack_Punch_A',reach:.65,at:.38,dmg:.35}],
             ['Rogue','ROGUE',95,.75,'Walking_A','Idle_B',.5,[['Crossbow','handslot_r']],[[55,BOD.FAR+1.4],[104,BOD.FAR+1.4]],{hit:'1H_Ranged_Shoot',reach:6.5,at:.45,bolt:[1.2,1.1,.8],dmg:.45}] ];
  const GUARDS=[], TROUBLE=[], BOLTS=[], RUN=1.9*TILE, SEE=18*TILE;
  const spread=rig=>{ const R=S.rig, W=[], at=i=>W[i]||(W[i]=(R.parent[i]>=0?at(R.parent[i]).clone():new THREE.Quaternion()).multiply(new THREE.Quaternion().fromArray(R.q[i])));
    for(const [bn,deg] of [['upperleg_l',14],['upperleg_r',-14],['upperarm_l',22],['upperarm_r',-22]]){ const i=JI[bn], rz=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),deg*Math.PI/180); rig.bones[i].quaternion.copy(at(R.parent[i]).clone().invert().multiply(rz).multiply(at(i))); } };
  const skel=(key,name,metres,x,z,speed,o)=>{ const M=S.chars[key], rig=rigOf(), mixer=new THREE.AnimationMixer(rig.bones[0]), an=Anim(mixer);
    let geo=geomOf(M,true);
    if(o.gild){ const c=geo.attributes.color.array, P=geo.attributes.position.array, R=geo.attributes.reg.array, part=M.parts, ix=geo.index.array, keep=[];
      for(let i=0;i<R.length;i++){ const p=part[R[i]], l=c[i*3]*.3+c[i*3+1]*.59+c[i*3+2]*.11, x=P[i*3], y=P[i*3+1], z=P[i*3+2]; let k=[1.3,.95,.36];
        if(p==='Eyes')k=[0,0,0]; else if(p==='Jaw'||p==='Head'&&z>.05&&y<1.6&&Math.abs(x)<.3)k=[1.35,1.3,1.18]; else if(p==='Body'&&y>1.02)k=[.8,.8,.84];
        c[i*3]=Math.min(255,l*k[0]+(p==='Eyes'?14:0)); c[i*3+1]=Math.min(255,l*k[1]+(p==='Eyes'?9:0)); c[i*3+2]=Math.min(255,l*k[2]+(p==='Eyes'?8:0)); }
      for(let t=0;t<ix.length;t+=3)if(part[R[ix[t]]]!=='Cloak')keep.push(ix[t],ix[t+1],ix[t+2]); geo.setIndex(new THREE.BufferAttribute(Uint16Array.from(keep),1)); }
    if(o.dark){ const c=geo.attributes.color.array; for(let i=0;i<c.length;i+=3){ const l=(c[i]+c[i+1]+c[i+2])/3; c[i]=Math.min(255,l*.42+18); c[i+1]=l*.3; c[i+2]=Math.min(255,l*.48+22); } }
    const N=makeNPC(null,{key:o.key||key,name,names:M.parts,lv:'up',group:'bodega',geo,skin:rig,tall:2.166,eye:o.gild?-1:M.eye,eyeC:o.eyeC,rank:M.parts.map(p=>/Helmet|Hat|Hood|Cape|Cloak/.test(p)?2:0),
      metres,x,z,lane:LANE,free:o.pick?free:stfree,roam:!o.pick,ground:(x,z)=>MODS.bodega.ground(x,z),radius:.25,speed,stride:0,rock:0,bob:0,pick:o.pick,brain:o.brain,...(o.dun||{}),
      anim:(dt,moving,st,sc)=>{ const run=moving&&st.v>1.2*TILE; N.sta=run?Math.max(0,N.sta-dt/14):Math.min(1,N.sta+dt/8); if(N.sta<=0)N.tired=true; if(N.tired&&N.sta>.33)N.tired=false;
      if(N.sheet){ if(!N.posed){ N.posed=true; spread(rig); } return; }
      if(QS.get('skelrest'))return; an.base=moving?(run?'Running_A':o.walkN):(N.alert?'Idle_Combat':o.idleN); an.ts=moving?st.v/((run?RUNU:WALK)*sc):1; an.update(dt); }});
    for(const [gn,slot] of o.gear||[]){ const m=new THREE.Mesh(geomOf(S.gear[gn],false),N.me.material); m.castShadow=true; rig.bones[JI[slot]].add(m); }
    N.mixer=mixer; N.an=an; N.restless=()=>!!N.alert||!!an.once; return N; };
  const shoot=(G,T,col,dmg)=>{ let b=BOLTS.find(b=>!b.on); if(!b){ b={m:new THREE.Mesh(new THREE.BoxGeometry(.05*TILE,.05*TILE,.3*TILE),new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}))}; MAPG.bodega.add(b.m); BOLTS.push(b); }
    b.m.material.color.setRGB(...col); b.on=true; b.T=T; b.from=G; b.dmg=dmg; b.m.visible=true; b.m.position.set(G.st.x,G.g.position.y+G.H*.55,G.st.z); };
  const bolts=dt=>{ for(const b of BOLTS){ if(!b.on)continue; const T=b.T, to=new THREE.Vector3(T.st.x,T.g.position.y+T.H*.5,T.st.z), d=to.clone().sub(b.m.position), l=d.length(), step=16*TILE*dt;
    b.m.lookAt(to); if(l<=step||T.mode==='hidden'){ b.on=false; b.m.visible=false; if(l<=step)T.knock(b.from,b.dmg); } else b.m.position.addScaledVector(d,step/l); } };
  const SHOVE={x:0,z:0}; const shove=dt=>{ if(Math.abs(SHOVE.x)+Math.abs(SHOVE.z)<1e-3)return; pos.x+=SHOVE.x*dt; pos.z+=SHOVE.z*dt; const k=Math.max(0,1-dt*7); SHOVE.x*=k; SHOVE.z*=k; collide(pos); };
  const onStreet=()=>LVL==='up'&&!BODB.inside()&&!MODS.pool.inside(pos.x,pos.z);
  for(const [key,name,tx,metres,walkN,idleN,speed,gear,beat,style] of CH){ const G={beat:beat.map(([x,y])=>({x:T_(x),z:Z_(y)})),leg:0,mode:'patrol',cool:0,look:Math.random()*6,style};
    const DN=DUN();
    const N=skel(key,name,metres,DN?DN.x:T_(tx),DN?DN.z:Z_({58:-67,69:-65.5,82:-68.5,95:-66}[tx]),speed*.9,{walkN,idleN,gear,dun:DN,
      pick:DN?undefined:st=>{ G.leg^=1; const p=G.beat[G.leg]; st.to={x:p.x,z:p.z+(Math.random()-.5)*.3*TILE}; st.v=G.walkV; },
      brain:(dt,you,st,N)=>{ if(DN)return; if(N===GUARDS[0]){ bolts(dt); shove(dt); }
        G.walkV=G.walkV||st.v; G.cool-=dt; G.look+=dt;
        const T=TROUBLE.filter(t=>t.mode==='come'||t.mode==='fight').map(t=>[t,d2(t.st,st)]).filter(([,d])=>d<SEE).sort((p,q)=>p[1]-q[1])[0];
        if(T){ const [t,d]=T, R=style.reach*TILE; G.mode='fight'; N.alert=true; st.hold=true;
          if(N.an.once){ st.to=null; st.face={x:t.st.x,z:t.st.z}; return; }
          if(d>R){ const k=(d-R*.8)/d; st.to={x:st.x+(t.st.x-st.x)*k,z:st.z+(t.st.z-st.z)*k}; st.v=d>R+2*TILE&&!N.tired?RUN:G.walkV*1.6; st.face=null; }
          else{ st.to=null; st.face={x:t.st.x,z:t.st.z}; const off=Math.abs(((Math.atan2(t.st.x-st.x,t.st.z-st.z)-st.h+Math.PI*3)%(Math.PI*2))-Math.PI);
            if(G.cool<=0&&off<.35){ G.cool=1.4+Math.random()*.6; N.an.play(style.hit,{at:[style.at,()=>{ if(style.bolt)shoot(N,t,style.bolt,style.dmg); else if(d2(t.st,st)<R*1.5)t.knock(N,style.dmg); }]}); } }
          return; }
        if(G.mode==='fight'){ G.mode='cheer'; st.to=null; st.face=null; if(typeof LINES!=='undefined')LINES.say(N,'cheer'); N.an.play('Cheer',{then:()=>{ G.mode='patrol'; st.hold=false; st.wait=.5; N.alert=false; }}); return; }
        if(G.mode==='cheer')return;
        N.alert=!st.to; if(st.to)st.h0=null; else{ if(st.h0==null)st.h0=st.h; const a=st.h0+Math.sin(G.look*.7)*1.1; st.face={x:st.x+Math.sin(a),z:st.z+Math.cos(a)}; } }});
    GUARDS.push(N); N.guard=G; }
  const TOP={x:T_((MAPSTAIR.x0+MAPSTAIR.x1)/2),z:Z_(MAPSTAIR.y1+1.2)}, AWAY={x:T_(MAPSTAIR.x0+2),z:Z_(MAPSTAIR.y0-16)};
  let next=QS.get('trouble')?3:30+Math.random()*40;
  for(let i=0;i<(MODS.dungeon&&!QS.get('trouble')?0:2);i++){ const N=skel('Rogue','TROUBLEMAKER',.6,AWAY.x,AWAY.z,.6,{walkN:'Walking_B',idleN:'Idle_Combat',eyeC:'1.,.18,.1',dark:true,
      pick:st=>{ st.to=null; st.wait=1; },
      brain:(dt,you,st,N)=>{ if(N.mode==='hidden'){ N.g.visible=false; st.x=AWAY.x; st.z=AWAY.z+i*TILE; st.to=null; st.hold=true;
          if(i===TROUBLE.filter(t=>t.mode!=='hidden').length&&CLOCK.dark()&&(next-=dt)<=0){ next=40+Math.random()*70; N.mode='come'; N.hp=1; N.sta=1; N.g.visible=true; st.x=TOP.x+(i-.5)*.6*TILE; st.z=TOP.z; st.h=Math.PI; N.an.clear(); N.an.play('Taunt'); }
          return; }
        N.alert=true;
        if(N.mode==='down')return;
        if(N.mode==='flee'||!CLOCK.dark()){ if(N.mode!=='flee'){ N.mode='flee'; N.an.clear(); } st.v=RUN; st.face=null; st.to={x:TOP.x,z:TOP.z}; if(d2(st,TOP)<.6*TILE)N.mode='hidden'; return; }
        if(N.an.once)return;
        if(!onStreet()){ st.to=null; st.face={x:you.x,z:you.z}; return; }
        const d=d2(st,you); N.mode=d<.9*TILE?'fight':'come';
        if(N.mode==='come'){ const k=(d-.5*TILE)/d; st.to={x:st.x+(you.x-st.x)*k,z:st.z+(you.z-st.z)*k}; st.v=d>4*TILE&&!N.tired?RUN*.85:st.v0||(st.v0=st.v); st.face=null; }
        else{ st.to=null; st.face={x:you.x,z:you.z};
          if((N.cool=(N.cool||0)-dt)<=0){ N.cool=2.2; if(typeof LINES!=='undefined'&&Math.random()<.5)LINES.say(N,'trouble'); N.an.play('Unarmed_Melee_Attack_Punch_A',{at:[.36,()=>{ VIT.inFight(5); const dx=pos.x-st.x, dz=pos.z-st.z, l=Math.hypot(dx,dz)||1; if(l<1.1*TILE&&onStreet()){ SHOVE.x=dx/l*3.2*TILE; SHOVE.z=dz/l*3.2*TILE; VIT.hurt(.12); } }]}); } } }});
    N.mode='hidden'; N.g.visible=false; N.st.hold=true;
    N.knock=(from,dmg=.5)=>{ if(N.mode!=='come'&&N.mode!=='fight')return; N.hp-=dmg; if(N.hp>0){ N.an.play('Hit_A'); return; }
      N.mode='down'; const st=N.st, dx=st.x-from.st.x, dz=st.z-from.st.z, l=Math.hypot(dx,dz)||1, nx=st.x+dx/l*.35*TILE, nz=st.z+dz/l*.35*TILE;
      if(free(nx,nz,st.R)){ st.x=nx; st.z=nz; } st.to=null; st.face={x:from.st.x,z:from.st.z};
      N.an.play('Death_A',{hold:true}); setTimeout(()=>{ if(N.mode!=='down')return; N.an.play('Lie_StandUp',{then:()=>{ N.mode='flee'; N.hp=.5; }}); },1600); };
    TROUBLE.push(N); }
  { const DN=DUN(); skel('Minion','GOLD SKELETON',1.4,DN?DN.x:T_(77),DN?DN.z:Z_(BOD.FAR),.45,{key:'Gold',walkN:'Walking_A',idleN:'Idle_A',gild:true,dun:DN}); }
  window.GUARDX={TROUBLE,shoot,free,SEE,RUN,LANE,T_,Z_,d2,GUARDS};
  window.GUARDDBG=()=>({guards:GUARDS.map(N=>({k:N.key,mode:N.guard.mode,x:+(N.st.x/TILE).toFixed(1),z:+(N.st.z/TILE).toFixed(1),act:N.an.once&&N.an.once.n})),trouble:TROUBLE.map(N=>({mode:N.mode,x:+(N.st.x/TILE).toFixed(1),z:+(N.st.z/TILE).toFixed(1),act:N.an.once&&N.an.once.n})),next:+next.toFixed(1),dark:CLOCK.dark()});
  })));
window.SKELDBG=()=>NPCS.filter(N=>N.mixer).map(N=>({key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),to:!!N.st.to,bones:N.me.skeleton.bones.length}));
if(!MODS.dungeon||QS.get('trouble'))await SKELGO();

const DRAGON=__LAZY__("data/dragon.json");
