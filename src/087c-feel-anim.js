{ const LOCO=['Walk_Loop','Jog_Fwd_Loop','Sprint_Loop'], ALL=['Idle_Loop',...LOCO,'Jump_Start','Jump_Loop','Jump_Land'];
  const A={act:{},w:{},tw:{},ph:0,moving:false,mode:'idle',st:0,land:0,landT:0,jump:0,land0:0,lean:new THREE.Vector2(),vx:0,vz:0,ax:0,az:0,comp:0,base:null,stepSt:{ph:0,w:0,run:0}};
  FEEL.A=A;
  const ref=()=>{ const c=FEEL.cfg; return [c.walkRef,c.jogRef,c.sprintRef]; };
  const gait=s=>{ const c=FEEL.cfg, a=Math.max(c.run,c.jogRef); if(s<=c.walk)return [1,0,0]; if(s<c.run){ const k=(s-c.walk)/(c.run-c.walk); return [1-k,k,0]; } if(s<a||c.sprintRef<=a)return [0,1,0]; if(s<c.sprintRef){ const k=(s-a)/(c.sprintRef-a); return [0,1-k,k]; } return [0,0,1]; };
  const init=C=>{ '@later'; C.mx.stopAllAction(); for(const n of ALL){ const cl=C.CL[n]; if(!cl)continue; const a=C.mx.clipAction(cl); a.enabled=true;
      if(/Start|Land/.test(n)){ a.setLoop(THREE.LoopOnce,1); a.clampWhenFinished=true; } else a.setLoop(THREE.LoopRepeat,Infinity);
      a.setEffectiveWeight(0); a.play(); A.act[n]=a; A.w[n]=n==='Idle_Loop'?1:0; A.tw[n]=A.w[n]; } A.C=C; A.base={sy:C.g.scale.y}; C.g.rotation.order='YXZ'; };
  FEEL.release=()=>{ if(!A.C)return; A.C.mx.stopAllAction(); A.C.g.rotation.set(0,heading,0); A.C.g.scale.y=A.base.sy; A.C=null; };
  FEEL.anim=(dt,C)=>{ '@later'; if(A.C!==C)init(C); const c=FEEL.cfg, S=FEEL.S, ev=FEEL.ev, hs=FEEL.hs, k=c.animK;
    if(!A.moving&&hs>.3)A.moving=true; else if(A.moving&&hs<.12)A.moving=false;
    const air=!S.gnd&&(S.jumped||S.air>Math.max(.12,c.coyote));
    for(const n in A.tw)A.tw[n]=0;
    if(ev.jump!==A.jump){ A.jump=ev.jump; A.mode='start'; const a=A.act.Jump_Start; a.reset(); a.time=.02; a.timeScale=1.25*k; a.play(); A.w.Jump_Start=Math.max(A.w.Jump_Start,.6); }
    if(ev.land!==A.land0){ A.land0=ev.land; const imp=ev.imp; A.landW=Math.min(1,Math.max(.25,(imp-2)/8))*c.land; if(A.landW>0){ const a=A.act.Jump_Land; a.reset(); a.time=.08; a.timeScale=(A.moving?1.6:1.15)*k; a.play(); A.landT=A.moving?.18:.55; A.mode='land'; }
      A.comp=Math.min(.07,.012*imp)*c.lean; }
    if(air){ const a=A.act.Jump_Start; if(A.mode==='start'&&a.time<a.getClip().duration*.55&&S.v.y>-1.5)A.tw.Jump_Start=1; else { A.mode='air'; A.tw.Jump_Loop=1; } }
    else{ if(A.mode!=='land')A.mode=A.moving?'move':'idle'; const g=gait(hs);
      let land=0; if(A.landT>0){ A.landT-=dt; land=A.landW*(IN_MOVE()?.6:1); if(A.landT<=0)A.mode=A.moving?'move':'idle'; }
      if(A.moving){ LOCO.forEach((n,i)=>A.tw[n]=g[i]*(1-land)); } else A.tw.Idle_Loop=1-land; A.tw.Jump_Land=land; }
    const fr=dt/Math.max(.02,c.fade); let sum=0;
    for(const n in A.w){ const t=A.tw[n]||0, w=A.w[n], r=(n==='Jump_Start'||n==='Jump_Land')&&t>w?fr*2.5:fr; A.w[n]=w<t?Math.min(t,w+r):Math.max(t,w-r); sum+=A.w[n]; }
    if(sum<1e-4){ A.w.Idle_Loop=1; sum=1; }
    let lw=0; for(const n of LOCO)lw+=A.w[n];
    if(lw>1e-3){ const R=ref(); let rate=0; LOCO.forEach((n,i)=>{ const cl=C.CL[n]; rate+=A.w[n]/lw*Math.max(.55,Math.min(1.7,hs/R[i]))/cl.duration; }); A.ph=(A.ph+dt*rate*k)%1; }
    for(const n in A.act){ const a=A.act[n], w=A.w[n]/sum; a.setEffectiveWeight(w); if(LOCO.includes(n)){ a.timeScale=0; a.time=A.ph*a.getClip().duration; }
      else if(n==='Idle_Loop'||n==='Jump_Loop')a.timeScale=k; }
    C.mx.update(dt);
    const vx=FEEL.S.v.x, vz=FEEL.S.v.z, e=1-Math.exp(-dt*10); A.ax+=((vx-A.vx)/Math.max(dt,1e-3)-A.ax)*e; A.az+=((vz-A.vz)/Math.max(dt,1e-3)-A.az)*e; A.vx=vx; A.vz=vz;
    const h=heading, lx=A.ax*Math.cos(h)-A.az*Math.sin(h), lz=A.ax*Math.sin(h)+A.az*Math.cos(h), m=c.leanMax*Math.PI/180*c.lean, G=S.gnd?1:0;
    const tp=Math.max(-m,Math.min(m,lz*.012*G)), tr=Math.max(-m,Math.min(m,-lx*.012*G)); A.lean.x+=(tp-A.lean.x)*e; A.lean.y+=(tr-A.lean.y)*e;
    A.comp*=Math.exp(-dt*9);
    C.g.position.set(pos.x,py,pos.z); C.g.rotation.set(A.lean.x,h,A.lean.y); C.g.scale.y=A.base.sy*(1-A.comp);
    if(C.relax)C.relax(dt,A.w.Idle_Loop/sum>.6);
    const ss=A.stepSt; ss.ph=A.ph; ss.w=A.moving&&!air?1:0; ss.run=hs>2.6?1:0; if(typeof SFX!=='undefined')SFX.steps(ss,FEEL.go); };
  const IN_MOVE=()=>Math.hypot(FEEL.IN.x,FEEL.IN.z)>.1;
}
