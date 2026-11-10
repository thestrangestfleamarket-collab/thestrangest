// THE DISH: PETRI's simulation, one path for the page (put in by the build, __CODE__) and the worker (imported): the rules of the game live here and nowhere else.
const DW=6000, DH=6000, NP=1000, NV=30, MINSPLIT=35, MAXCELLS=16, EJECT=13, EJECTCOST=18, VIRUSM=100;
const COLS=['#ff3c5a','#ff8a2a','#ffe83c','#5aff6a','#3cf0ff','#2a7bff','#a46bff','#ff70ff','#7aff6a','#ffb020','#60c0ff','#e8e8f0'];
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)), rad=m=>4+Math.sqrt(m)*6, spd=m=>330*Math.pow(m,-.3), mergeT=m=>30+.02*m;
const rng=seed=>{ let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; };
// the dish: pellets, viruses, blobs, cells by owner; every rule of the game in step(), nothing in the drawing
const DISH={
  make:seed=>{ const S={t:0,next:1,rnd:rng(seed||1),cells:[],pellets:[],viruses:[],blobs:[],players:{},board:[]}; for(let i=0;i<NP;i++)DISH.pellet(S); for(let i=0;i<NV;i++)DISH.virus(S); return S; },
  pellet:(S,x,y,c)=>{ const q={id:S.next++,x:x??S.rnd()*DW,y:y??S.rnd()*DH,c:c??Math.floor(S.rnd()*COLS.length)}; S.pellets.push(q); if(S.ev)S.ev.push([q.id,q.x|0,q.y|0,q.c]); return q; },
  ate:(S,i)=>{ const q=S.pellets[i]; if(S.ev)S.ev.push([q.id]); S.pellets[i]=S.pellets[S.pellets.length-1]; S.pellets.pop(); },
  virus:(S,x,y,vx,vy)=>{ S.viruses.push({x:x??S.rnd()*DW,y:y??S.rnd()*DH,m:VIRUSM,fed:0,vx:vx||0,vy:vy||0}); },
  join:(S,id,name,col)=>{ const p={id,name,col,dir:[0,0],split:0,eject:0,best:0,eaten:0,dead:0,n:0}; S.players[id]=p; DISH.spawn(S,p); return p; },
  leave:(S,id)=>{ S.cells=S.cells.filter(c=>c.o!==id); delete S.players[id]; },
  spawn:(S,p)=>{ let x=0, y=0; for(let k=0;k<20;k++){ x=200+S.rnd()*(DW-400); y=200+S.rnd()*(DH-400); if(!S.cells.some(c=>Math.hypot(c.x-x,c.y-y)<c.r+300))break; } DISH.cell(S,p,10,x,y,0,0); p.dead=0; },
  cell:(S,p,m,x,y,vx,vy)=>{ const c={id:S.next++,o:p.id,m,r:rad(m),x,y,vx,vy,mt:S.t+mergeT(m)}; S.cells.push(c); p.n++; return c; },
  input:(S,id,dx,dy,split,eject)=>{ const p=S.players[id]; if(!p)return; const n=Math.hypot(dx,dy); p.dir=n>.05?[dx/n,dy/n]:[0,0]; if(split)p.split=1; if(eject)p.eject=1; },
  mass:(S,id)=>{ let m=0; for(const c of S.cells)if(c.o===id)m+=c.m; return m; },
  split:(S,p)=>{ const mine=S.cells.filter(c=>c.o===p.id).sort((a,b)=>b.m-a.m); let n=mine.length; for(const c of mine){ if(n>=MAXCELLS||c.m<MINSPLIT)continue; const [dx,dy]=p.dir[0]||p.dir[1]?p.dir:[1,0]; c.m/=2; c.r=rad(c.m); c.mt=S.t+mergeT(c.m); const h=DISH.cell(S,p,c.m,c.x+dx*c.r,c.y+dy*c.r,dx*spd(c.m)*3,dy*spd(c.m)*3); h.boost=1; n++; } },
  burst:(S,c,p)=>{ const k=Math.min(MAXCELLS-p.n+1,Math.max(2,Math.floor(c.m/MINSPLIT))); if(k<2)return; const each=c.m/k; c.m=each; c.r=rad(each); c.mt=S.t+mergeT(each); for(let i=1;i<k;i++){ const a=i/k*Math.PI*2; const h=DISH.cell(S,p,each,c.x,c.y,Math.cos(a)*spd(each)*3,Math.sin(a)*spd(each)*3); h.boost=1; } },
  eject:(S,p)=>{ for(const c of S.cells){ if(c.o!==p.id||c.m<MINSPLIT)continue; const [dx,dy]=p.dir[0]||p.dir[1]?p.dir:[1,0]; c.m-=EJECTCOST; c.r=rad(c.m); S.blobs.push({x:c.x+dx*(c.r+8),y:c.y+dy*(c.r+8),vx:dx*600,vy:dy*600,m:EJECT,c:p.col,dx,dy}); } },
  board:S=>{ const t=[]; for(const id in S.players){ const p=S.players[id]; if(!p.dead)t.push({id,name:p.name,m:Math.round(DISH.mass(S,id))}); } t.sort((a,b)=>b.m-a.m); S.board=t.slice(0,10); },
  step:(S,dt)=>{ S.t+=dt; const P=S.players;
    for(const c of S.cells){ const p=P[c.o]; if(!p)continue; const v=spd(c.m); if(c.boost){ c.vx*=Math.pow(.02,dt); c.vy*=Math.pow(.02,dt); if(Math.hypot(c.vx,c.vy)<v*1.1)c.boost=0; }
      const tx_=p.dir[0]*v, ty_=p.dir[1]*v; if(!c.boost){ c.vx+=(tx_-c.vx)*Math.min(1,dt*6); c.vy+=(ty_-c.vy)*Math.min(1,dt*6); } else { c.vx+=tx_*dt*2; c.vy+=ty_*dt*2; }
      c.x=cl(c.x+c.vx*dt,c.r*.5,DW-c.r*.5); c.y=cl(c.y+c.vy*dt,c.r*.5,DH-c.r*.5); if(c.m>100)c.m-=c.m*.002*dt; c.r=rad(c.m); }
    for(const b of S.blobs){ b.x=cl(b.x+b.vx*dt,0,DW); b.y=cl(b.y+b.vy*dt,0,DH); b.vx*=Math.pow(.01,dt); b.vy*=Math.pow(.01,dt); }
    for(const v of S.viruses){ if(v.vx||v.vy){ v.x=cl(v.x+v.vx*dt,0,DW); v.y=cl(v.y+v.vy*dt,0,DH); v.vx*=Math.pow(.01,dt); v.vy*=Math.pow(.01,dt); if(Math.hypot(v.vx,v.vy)<5)v.vx=v.vy=0; } }
    for(const id in P){ const p=P[id]; if(p.split){ p.split=0; DISH.split(S,p); } if(p.eject){ p.eject=0; DISH.eject(S,p); } }
    // your own cells push apart until they may merge, then they flow together
    for(let i=0;i<S.cells.length;i++)for(let j=i+1;j<S.cells.length;j++){ const a=S.cells[i], b=S.cells[j]; if(a.o!==b.o)continue; const dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy)||1, ov=a.r+b.r-d;
      if(S.t>=a.mt&&S.t>=b.mt){ if(d<Math.max(a.r,b.r)*.7){ const big=a.m>=b.m?a:b, small=big===a?b:a; big.m+=small.m; big.r=rad(big.m); small.m=0; } else { const k=Math.min(d,80*dt)/d; a.x+=dx*k; a.y+=dy*k; b.x-=dx*k; b.y-=dy*k; } }
      else if(ov>0){ const k=ov/2/d; a.x-=dx*k; a.y-=dy*k; b.x+=dx*k; b.y+=dy*k; } }
    // eating: pellets, blobs, other cells; viruses burst the big
    for(const c of S.cells){ if(!c.m)continue; const p=P[c.o]; const r2=c.r*c.r;
      for(let i=S.pellets.length-1;i>=0;i--){ const q=S.pellets[i]; const dx=q.x-c.x, dy=q.y-c.y; if(dx*dx+dy*dy<r2){ c.m+=1; DISH.ate(S,i); } }
      for(let i=S.blobs.length-1;i>=0;i--){ const q=S.blobs[i]; const dx=q.x-c.x, dy=q.y-c.y; if(dx*dx+dy*dy<r2*.8){ c.m+=q.m; S.blobs.splice(i,1); } }
      for(const v of S.viruses){ if(c.m<=v.m*1.25)continue; const dx=v.x-c.x, dy=v.y-c.y; if(dx*dx+dy*dy<r2*.6){ v.x=S.rnd()*DW; v.y=S.rnd()*DH; v.fed=0; v.vx=v.vy=0; c.m+=v.m*.5; DISH.burst(S,c,p); } }
      c.r=rad(c.m); }
    for(const a of S.cells){ if(!a.m)continue; for(const b of S.cells){ if(a===b||!b.m||a.o===b.o||a.m<=b.m*1.25)continue; const dx=b.x-a.x, dy=b.y-a.y; if(dx*dx+dy*dy<(a.r-b.r*.4)*(a.r-b.r*.4)){ a.m+=b.m; a.r=rad(a.m); b.m=0; P[a.o].eaten++; P[a.o].ate=b.o; } } }
    for(const v of S.viruses)for(let i=S.blobs.length-1;i>=0;i--){ const q=S.blobs[i]; if(Math.hypot(q.x-v.x,q.y-v.y)<rad(v.m)){ S.blobs.splice(i,1); if(++v.fed>=7){ v.fed=0; DISH.virus(S,v.x+q.dx*60,v.y+q.dy*60,q.dx*700,q.dy*700); } } }
    if(S.cells.some(c=>!c.m)){ S.cells=S.cells.filter(c=>c.m>0); for(const id in P)P[id].n=0; for(const c of S.cells)P[c.o].n++; }
    for(const id in P){ const p=P[id]; const m=DISH.mass(S,id); if(m>p.best)p.best=m; if(!p.n&&!p.dead){ p.dead=1; p.died=S.t; } }
    while(S.pellets.length<NP)DISH.pellet(S); while(S.viruses.length<NV)DISH.virus(S);
    DISH.board(S); }
};
const DISHK={DW,DH,NP,NV,MINSPLIT,MAXCELLS,EJECT,EJECTCOST,VIRUSM,COLS,rad,spd,mergeT,rng};
export {DISH, DISHK};
