// AIR HOCKEY's table rules and the house's player, THE MARKET's own (src/146zcz-airhockey.js, copied in): x across, z along; side +1 (you) defends the +z goal
const cl=(v,a,b)=>v<a?a:v>b?b:v;
const W=.56, L=1.12, PR=.041, MR=.05, GH=.15, VMAX=4.5, E_WALL=.8, E_MAL=.72, HAND=4, HOME=L-.3;
const LEVELS={easy:{speed:.9,strike:1.7,err:.12,react:.4,block:.9},medium:{speed:1.4,strike:2.5,err:.08,react:.3,block:1.3},hard:{speed:1.9,strike:3.2,err:.08,react:.29,block:1.4}};
  const mallet=side=>({side,x:0,z:side*HOME,vx:0,vz:0,tx:0,tz:side*HOME,maxSpeed:HAND,ai:null});
  const create=()=>({puck:{x:0,z:0,vx:0,vz:0},m:[mallet(1),mallet(-1)],live:true});
  const faceoff=(s,side)=>{ const p=s.puck; p.x=0; p.z=side*.4; p.vx=p.vz=0; s.live=true; s.m[0].ai=s.m[1].ai=null; };
  const step=(s,dt,ev)=>{ const p=s.puck; let dx, dz, d;
    for(const m of s.m){ m.tx=cl(m.tx,-(W-MR),W-MR); m.tz=m.side>0?cl(m.tz,MR,L-MR):cl(m.tz,-(L-MR),-MR); dx=m.tx-m.x; dz=m.tz-m.z; d=Math.hypot(dx,dz);
      const mx=m.maxSpeed*dt, ox=m.x, oz=m.z; if(d>mx){ m.x+=dx/d*mx; m.z+=dz/d*mx; } else { m.x=m.tx; m.z=m.tz; } m.vx=(m.x-ox)/dt; m.vz=(m.z-oz)/dt; }
    if(!s.live)return;
    p.x+=p.vx*dt; p.z+=p.vz*dt;
    let sp=Math.hypot(p.vx,p.vz); if(sp>0){ const f=Math.max(0,sp*Math.exp(-.22*dt)-.04*dt)/sp; p.vx*=f; p.vz*=f; }
    const n=PR+MR;
    for(const m of s.m){ dx=p.x-m.x; dz=p.z-m.z; d=Math.hypot(dx,dz); if(d>=n)continue;
      const nx=d>1e-6?dx/d:0, nz=d>1e-6?dz/d:-m.side, vn=(p.vx-m.vx)*nx+(p.vz-m.vz)*nz;
      if(vn<0){ p.vx-=(1+E_MAL)*vn*nx; p.vz-=(1+E_MAL)*vn*nz; if(vn<-.2)ev.push({k:'mallet',s:-vn}); }
      p.x=m.x+nx*n; p.z=m.z+nz*n; }
    const lim=W-PR;
    if(p.x>lim){ p.x=lim; if(p.vx>0){ if(p.vx>.2)ev.push({k:'wall',s:p.vx}); p.vx*=-E_WALL; } }
    else if(p.x<-lim){ p.x=-lim; if(p.vx<0){ if(p.vx<-.2)ev.push({k:'wall',s:-p.vx}); p.vx*=-E_WALL; } }
    for(const sg of [-1,1]){ if(sg*p.z<=L-PR)continue;
      if(Math.abs(p.x)>=GH){ p.z=sg*(L-PR); if(sg*p.vz>0){ if(sg*p.vz>.2)ev.push({k:'wall',s:sg*p.vz}); p.vz*=-E_WALL; } continue; }
      for(const q of [-1,1]){ dx=p.x-q*GH; dz=p.z-sg*L; d=Math.hypot(dx,dz); if(d>=PR||d<=1e-6)continue;
        const px=dx/d, pz=dz/d, pv=p.vx*px+p.vz*pz; if(pv<0){ p.vx-=(1+E_WALL)*pv*px; p.vz-=(1+E_WALL)*pv*pz; if(pv<-.2)ev.push({k:'post',s:-pv}); }
        p.x=q*GH+px*PR; p.z=sg*L+pz*PR; }
      if(sg*p.z>L+PR*.6){ s.live=false; ev.push({k:'goal',into:sg}); return; } }
    // a mallet cannot squash the puck into a wall: the mallet gives way
    for(const m of s.m){ dx=p.x-m.x; dz=p.z-m.z; d=Math.hypot(dx,dz); if(d<n-1e-4&&d>1e-6){ m.x=p.x-dx/d*n; m.z=p.z-dz/d*n; } }
    sp=Math.hypot(p.vx,p.vz); if(sp>VMAX){ p.vx*=VMAX/sp; p.vz*=VMAX/sp; } };
  // the house's player: where its mallet heads this moment
  const think=(s,m,cfg,dt)=>{ const p=s.puck, sd=m.side, ai=m.ai||(m.ai={t:0,ex:0,gx:0,bank:0,stall:0,seen:0}); ai.t-=dt;
    if(ai.t<=0){ ai.t=.4+Math.random()*.4; ai.ex=(Math.random()*2-1)*cfg.err; ai.gx=(Math.random()*2-1)*.11; ai.bank=Math.random()<.25?(Math.random()<.5?-1:1):0; }
    const pz=p.z*sd, pvz=p.vz*sd, mz=m.z*sd; let tx, tz, sp=cfg.speed;
    if(!(pvz>.8))ai.seen=0;
    if(pz>0&&Math.hypot(p.vx,p.vz)<.2)ai.stall+=dt; else ai.stall=0;
    const incoming=pz>-.4&&pvz>.8&&pz<mz-.02;
    if(!s.live){ tx=0; tz=HOME; }
    else if(ai.stall>3){ tx=p.x; tz=pz; sp=cfg.strike; }
    else if(incoming&&(ai.seen+=dt)<cfg.react){ tx=cl(m.x,-.2,.2); tz=HOME; }
    else if(incoming){ tz=L-.24; const lim=W-PR, span=2*lim; let x=p.x+p.vx*(tz-pz)/pvz; x=(((x+lim)%(2*span))+2*span)%(2*span); if(x>span)x=2*span-x; x-=lim; tx=cl(x+ai.ex,-.27,.27); sp=cfg.block; }
    else if(pz>.02){ const gx=ai.bank?2*ai.bank*W-ai.gx:ai.gx; let dx=gx-p.x, dz=-L-pz; const dl=Math.hypot(dx,dz); dx/=dl; dz/=dl;
      const rx=m.x-p.x, rz=mz-pz, along=rx*dx+rz*dz, lat=Math.abs(rx*dz-rz*dx);
      if(along<-.05&&lat<.04){ tx=p.x+dx*.3; tz=pz+dz*.3; sp=cfg.strike; }
      else if(mz<pz+.03){ let g=m.x>=p.x?1:-1; if(Math.abs(p.x+g*.16)>W-MR)g=-g; tx=p.x+g*.16; tz=pz+.15; }
      else { tx=p.x-dx*(MR+PR+.035)+ai.ex*.3; tz=pz-dz*(MR+PR+.035); } }
    else { tx=cl(p.x*.45,-.2,.2); tz=HOME; }
    m.tx=tx; m.tz=cl(tz,MR,L-MR)*sd; m.maxSpeed=sp; };
export const AIR={W,L,PR,MR,GH,HAND,LEVELS,create,faceoff,step,think};
