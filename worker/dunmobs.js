// THE DUNGEON'S MONSTERS: every creature the dungeon master put in the dungeon (the design: a layout and its creatures, each with its strengths and behaviour), where it is, its health, who it hunts and when it strikes; one path for the section's server (worker/door.js Block, stepped five times a second while anyone is below) and the page (run there off the website). The page bakes the map (each room's floor, danger and what blocks it) and the monsters' book (their kinds and strengths) and sends them; the server keeps the rest.
const MOBSIM={};
{ const M=MOBSIM, fin=v=>typeof v==='number'&&isFinite(v), N=(v,d=0)=>fin(v)?v:fin(+v)?+v:d, R2=v=>Math.round(v*100)/100, RESPAWN=120, ROT=4;
  M.make=()=>({t:0,at:0,seq:0,g:null,m:[],dm:null});
  // the map and the book, from the page: {v, T, rooms:[{k,n,safe,lane:[x0,z0,x1,z1],block:[[x0,z0,x1,z1]...]}], cat:{tiers,mix,guards,stats,styles,kk}}
  M.grid=(S,G)=>{ if(!G||!Array.isArray(G.rooms)||!G.cat)return false; const T=N(G.T,1)||1, rooms={};
    for(const r of G.rooms.slice(0,64)){ const k=r.k|0, L=Array.isArray(r.lane)?r.lane.slice(0,4).map(v=>N(v)):null; if(!k||!L)continue; rooms[k]={k,n:Math.max(1,Math.min(5,r.n|0||1)),safe:!!r.safe,lv:r.lv==='up'?'up':'down',keep:r.keep?1:0,rally:Array.isArray(r.rally)?[N(r.rally[0]),N(r.rally[1])]:null,lane:L,block:(Array.isArray(r.block)?r.block:[]).slice(0,80).map(b=>(Array.isArray(b)?b:[]).slice(0,4).map(v=>N(v)))}; }
    const was=S.g&&S.g.v; S.g={v:String(G.v||''),T,rooms,cat:G.cat}; if(was!==S.g.v){ S.m=[]; M.fill(S); } return true; };
  const inL=(L,x,z)=>x>L[0]&&x<L[2]&&z>Math.min(L[1],L[3])&&z<Math.max(L[1],L[3]);
  const free=(R,x,z,r)=>inL(R.lane,x,z)&&!R.block.some(b=>x>Math.min(b[0],b[2])-r&&x<Math.max(b[0],b[2])+r&&z>Math.min(b[1],b[3])-r&&z<Math.max(b[1],b[3])+r);
  const spot=(R,rnd,r)=>{ const L=R.lane; for(let k=0;k<60;k++){ const x=L[0]+rnd()*(L[2]-L[0]), z=L[1]+rnd()*(L[3]-L[1]); if(free(R,x,z,r))return {x,z}; } return {x:(L[0]+L[2])/2,z:(L[1]+L[3])/2}; };
  // the dungeon master's design (owner, 7 Nov 2026: "remove all creatures from the dungeon level. add a dungeon master mode"): {v, map:[[name,x0,y0,x1,y1,danger,corridor]...], mobs:[entry...]}; no design, no creatures
  const BEH=['hunt','guard','wander','still','patrol','flee'], LOOT=['none','slime','bone','spider','gold'], W=(v,n)=>String(v==null?'':v).replace(/[^\w :'!?.,#-]/g,'').slice(0,n), C_=(v,a,b,d)=>Math.max(a,Math.min(b,N(v,d)));
  M.entry=e=>{ if(!e||typeof e!=='object')return null; const kind=e.kind==='s'?'s':'c', key=W(e.key,40); if(!key)return null;
    return {id:W(e.id,24)||key,r:C_(e.r,1,64,1)|0,kind,key,name:W(e.name,32),x:R2(N(e.x)),z:R2(N(e.z)),n:C_(e.n,1,12,1)|0,hp:C_(e.hp,1,999,3),dmg:C_(e.dmg,0,1,.05),v:C_(e.v,0,8,1.5),see:C_(e.see,0,30,3.5),reach:C_(e.reach,.2,12,.8),ranged:e.ranged?1:0,
      beh:BEH.includes(e.beh)?e.beh:'hunt',hostile:e.hostile===0||e.hostile===false?0:1,respawn:C_(e.respawn,0,3600,120),loot:LOOT.includes(e.loot)?e.loot:'bone',blk:C_(e.blk,0,.8,0),size:C_(e.size,.2,4,1),px:R2(N(e.px)),pz:R2(N(e.pz))}; };
  M.clean=d=>{ if(!d||typeof d!=='object')return null; const map=Array.isArray(d.map)?d.map.slice(0,60).map(r=>Array.isArray(r)?[W(r[0],32),...[1,2,3,4].map(i=>C_(r[i],0,240,0)|0),C_(r[5],0,1,0),r[6]?1:0]:null).filter(r=>r&&r[3]>r[1]&&r[4]>r[2]):null;
    return {v:W(d.v,24),by:W(d.by,32),map:map&&map.length?map:null,mobs:(Array.isArray(d.mobs)?d.mobs:[]).slice(0,200).map(M.entry).filter(Boolean)}; };
  M.design=(S,d)=>{ S.dm=M.clean(d); S.m=[]; M.fill(S); return S.dm; };
  M.fill=(S,rnd=Math.random)=>{ if(!S.g||!S.dm)return; for(const e of S.dm.mobs){ const R=S.g.rooms[e.r]; if(!R||S.m.some(m=>m.e===e.id))continue; for(let j=0;j<e.n;j++)S.m.push(made(S,R,e,j,rnd)); } };
  const made=(S,R,e,j,rnd)=>{ const T=S.g.T, sp=e.n>1?.9*T:0; let x=e.x, z=e.z; for(let k=0;k<20;k++){ const a=rnd()*6.28, d=rnd()*sp, u=e.x+Math.sin(a)*d, w=e.z+Math.cos(a)*d; if(free(R,u,w,.2*T)){ x=u; z=w; break; } }
    if(!free(R,x,z,.15*T)){ const p=spot(R,rnd,.3*T); x=p.x; z=p.z; }
    const h=Math.round(e.hp); return {i:++S.seq,e:e.id,j,r:R.k,kind:e.kind,key:e.key,x:R2(x),z:R2(z),h:rnd()*6.28,hp:h,mhp:h,dmg:e.dmg,v:e.v*T,reach:e.reach*T,see:e.see*T,ranged:e.ranged,beh:e.beh,hostile:e.hostile,loot:e.loot,blk:e.blk,rs:e.respawn,
      dead:0,agg:0,prov:0,tg:'',to:null,wait:rnd()*3,cool:1+rnd(),act:0,acts:0,hits:0,blks:0,land:0,stun:0,kb:null,home:{x,z},pt:e.px||e.pz?{x:x+e.px*T,z:z+e.pz*T}:null,leg:0}; };
  M.load=r=>{ const S=M.make(); if(!r||typeof r!=='object')return S; S.t=N(r.t); S.seq=N(r.seq); S.boDay=r.boDay; if(r.g&&r.g.rooms)S.g=r.g; S.dm=r.dm?M.clean(r.dm):null; if(S.dm&&Array.isArray(r.m))S.m=r.m.filter(m=>m&&fin(m.x)&&fin(m.z)).map(m=>({...m,to:null,kb:null,land:0})); return S; };
  M.save=S=>({t:S.t,seq:S.seq,boDay:S.boDay,g:S.g,dm:S.dm,m:S.m.map(m=>({...m,to:null,kb:null}))});
  const roomAt=(S,x,z,lv='down')=>{ if(!S.g)return 0; for(const k in S.g.rooms){ const R=S.g.rooms[k]; if((R.lv||'down')===lv&&inL(R.lane,x,z))return +k; } return 0; };
  M.roomAt=roomAt;
  // a step: players [{id,x,z,ok}] (ok: alive, seen, below); returns what happened to them: [{t:'hurt',to,d,x,z,i}]
  M.step=(S,dt,P,rnd=Math.random)=>{ const ev=[]; if(!S.g||!(dt>0))return ev; S.t+=dt; const T=S.g.T, kk=S.g.cat.kk||[], live=P.filter(p=>p.ok).map(p=>({...p,r:roomAt(S,p.x,p.z,p.lv)}));
    for(let j=S.m.length-1;j>=0;j--){ const m=S.m[j], R=S.g.rooms[m.r]; if(!R){ S.m.splice(j,1); continue; }
      if(m.dead){ const rs=m.rs==null?RESPAWN:m.rs, e=S.dm&&S.dm.mobs.find(q=>q.id===m.e);   // back again after a while, out of sight (never, if its respawn is 0)
        if(e&&rs>0){ if(S.t-m.dead>rs&&!live.some(p=>p.r===m.r))S.m[j]=made(S,R,e,m.j,rnd); } else if(S.t-m.dead>ROT)S.m.splice(j,1); continue; }
      if(m.kb){ const a=Math.min(1,dt*12), nx=m.x+(m.kb.x-m.x)*a, nz=m.z+(m.kb.z-m.z)*a; if(free(R,nx,nz,.15*T)){ m.x=nx; m.z=nz; } if(Math.hypot(m.kb.x-m.x,m.kb.z-m.z)<.03*T)m.kb=null; continue; }
      if(R.keep&&R.rally){ const g=Math.hypot(m.x-R.rally[0],m.z-R.rally[1])<6*T?1:0; m.gd=(m.gd||0)+dt*g; if(m.gd>=1.6){ m.gd-=1.6; m.hp-=1.2; m.hits++; if(m.hp<=0){ m.dead=S.t||.001; m.hp=0; m.tg=''; continue; } } }   // the keep's guardians close in and fight it
      if(m.stun>0){ m.stun-=dt; continue; }
      m.cool-=dt; let you=null, yd=1e9; for(const p of live){ if(p.r!==m.r)continue; const d=Math.hypot(p.x-m.x,p.z-m.z); if(d<yd){ yd=d; you=p; } }
      const beh=m.beh||'hunt', mean=m.hostile!==0&&(beh!=='wander'||m.prov), hd=Math.hypot(m.x-m.home.x,m.z-m.home.z), leash=m.see+3*T;
      let sees=you&&(m.agg?yd<2*m.see:yd<m.see); if(beh==='guard'&&you&&Math.hypot(you.x-m.home.x,you.z-m.home.z)>leash)sees=false; if(beh==='still'&&you&&yd>Math.max(m.see,m.reach))sees=false;
      if(!mean&&beh!=='flee')sees=false; m.agg=sees?1:0; m.tg=sees&&mean?you.id:'';
      const walk=(tx,tz,v)=>{ const ex=tx-m.x, ez=tz-m.z, l=Math.hypot(ex,ez); if(l<.05*T)return true; const stp=Math.min(l,v*dt), nx=m.x+ex/l*stp, nz=m.z+ez/l*stp; m.h=Math.atan2(ex,ez);
        if(free(R,nx,nz,.15*T)&&!S.m.some(o=>o!==m&&!o.dead&&o.r===m.r&&Math.hypot(o.x-nx,o.z-nz)<.35*T)){ m.x=nx; m.z=nz; return false; } return true; };
      if(m.land&&S.t>=m.land){ m.land=0; const p=live.find(q=>q.id===m.ltg); if(p&&Math.hypot(p.x-m.x,p.z-m.z)<(m.ranged?Math.max(7*T,m.reach*1.3):m.reach*1.45))ev.push({t:'hurt',to:p.id,d:R2(m.dmg*1000)/1000,x:R2(m.x),z:R2(m.z),i:m.i}); }   // the blow lands a moment after the swing starts
      if(sees&&beh==='flee'&&!m.prov){ const ex=m.x-you.x, ez=m.z-you.z, l=Math.hypot(ex,ez)||1; if(walk(m.x+ex/l*T,m.z+ez/l*T,m.v))m.to=null; continue; }   // it keeps away from you (until you strike it)
      if(sees){ const ex=you.x-m.x, ez=you.z-m.z; m.h=Math.atan2(ex,ez);
        let stuck=beh==='still'; if(yd>m.reach&&beh!=='still'){ const g=Math.min(yd-m.reach*.8,m.v*dt*16); stuck=walk(m.x+ex/yd*g,m.z+ez/yd*g,m.v); }
        if(yd>m.reach&&!(stuck&&yd<m.reach*1.4)){}   // blocked short of you, it still strikes from a little further (its blow lands to 1.45 reach)
        else if(m.cool<=0&&!m.land){ m.cool=(m.kind==='s'?1.6:1.8+rnd()*.7)/(1+.1*R.n); m.acts++; m.act=S.t; m.land=S.t+(m.kind==='s'?.15:m.kind==='p'?.3:.45); m.ltg=you.id; }
        continue; }
      if(R.keep&&R.rally&&mean){ const rx=R.rally[0], rz=R.rally[1], d=Math.hypot(rx-m.x,rz-m.z); if(d>m.reach){ walk(rx,rz,m.v*.7); } else if(m.cool<=0){ m.cool=1.8+rnd(); m.acts++; m.act=S.t; } continue; }   // nobody to hunt: it goes for the guardians
      if(beh==='still'){ m.to=null; continue; }
      if(beh==='guard'&&hd>leash*.5){ if(walk(m.home.x,m.home.z,m.v*.6))m.to=null; continue; }   // back to its post
      if(beh==='patrol'){ const P=m.pt||{x:2*(R.lane[0]+R.lane[2])/2-m.home.x,z:2*(R.lane[1]+R.lane[3])/2-m.home.z}, G=m.leg?m.home:P; if(walk(G.x,G.z,m.v*.5)||Math.hypot(G.x-m.x,G.z-m.z)<.15*T)m.leg=m.leg?0:1; continue; }
      if(m.to){ const ex=m.to.x-m.x, ez=m.to.z-m.z, l=Math.hypot(ex,ez); if(l<.1*T){ m.to=null; m.wait=1.5+rnd()*3; } else { const stp=Math.min(l,m.v*.5*dt), nx=m.x+ex/l*stp, nz=m.z+ez/l*stp; if(free(R,nx,nz,.15*T)){ m.x=nx; m.z=nz; m.h=Math.atan2(ex,ez); } else m.to=null; } }
      else if((m.wait-=dt)<=0){ const a=rnd()*6.28, d=(1.2+rnd()*2.5)*T, x=m.x+Math.sin(a)*d, z=m.z+Math.cos(a)*d; if(free(R,x,z,.2*T)&&(beh!=='guard'||Math.hypot(x-m.home.x,z-m.home.z)<leash*.5))m.to={x,z}; else m.wait=.5; } }
    return ev; };
  // a blow from a player: {d, kb, heavy, x, z, by}; the result: 'blocked' (a guard's shield took a light blow), 'hit', 'dead' (with what it was, for the striker's reward)
  M.hit=(S,i,o,rnd=Math.random)=>{ const m=S.m.find(q=>q.i===i); if(!m||m.dead)return {res:'gone'}; const R=S.g&&S.g.rooms[m.r], T=S.g?S.g.T:1, kk=(S.g&&S.g.cat.kk)||[]; m.agg=1;
    m.prov=1; if(!o.heavy&&(m.e?rnd()<(m.blk||0):m.kind==='g'&&kk.includes(m.key)&&rnd()<Math.min(.5,(R?R.n:1)*.1))){ m.blks++; return {res:'blocked',m}; }
    m.hp-=Math.max(0,Math.min(20,N(o.d))); m.hits++; const dx=m.x-N(o.x,m.x), dz=m.z-N(o.z,m.z), l=Math.hypot(dx,dz)||1, kb=(m.kind==='s'?.45:.6)*T*Math.max(.5,Math.min(3,N(o.kb,1)));
    if(R&&free(R,m.x+dx/l*kb,m.z+dz/l*kb,.15*T))m.kb={x:m.x+dx/l*kb,z:m.z+dz/l*kb}; if(o.heavy)m.stun=Math.max(m.stun,m.kind==='g'?1.2:.6); m.land=0;
    if(m.hp>0)return {res:'hit',m}; m.dead=S.t||.001; m.hp=0; m.tg=''; return {res:'dead',m,n:R?R.n:1}; };
  // a breakout (owner, 7 Nov 2026: "only from the published dungeon"): up to n of the design's living, hostile creatures come up the castle stair into the keep; below, each comes back after its own respawn
  M.breakout=(S,n,rnd=Math.random)=>{ if(!S.g||!S.dm)return 0; const K=Object.values(S.g.rooms).find(R=>R.keep); if(!K)return 0; const T=S.g.T, c=S.m.filter(m=>!m.dead&&m.hostile!==0&&!S.g.rooms[m.r].keep), out=[];
    while(out.length<n&&c.length)out.push(c.splice(Math.floor(rnd()*c.length),1)[0]);
    for(const m of out){ const a=rnd()*6.28, sp=K.rally?{x:K.rally[0]+Math.sin(a)*.8*T,z:K.rally[1]+Math.cos(a)*.8*T}:spot(K,rnd,.3*T);
      S.m.push({...m,i:++S.seq,r:K.k,x:R2(sp.x),z:R2(sp.z),home:{x:sp.x,z:sp.z},pt:null,rs:0,beh:'hunt',agg:0,prov:0,tg:'',to:null,kb:null,land:0,stun:0,cool:1.5+rnd(),acts:0,hits:0,blks:0,gd:0});
      m.dead=S.t||.001; m.hp=0; }   // gone from below till it comes back
    return out.length; };
  // tamed by a player (src/146zjd): it leaves, no reward, and comes back as another after its respawn; null if it was already gone
  M.tame=(S,i)=>{ const m=S.m.find(q=>q.i===i); if(!m||m.dead)return null; m.dead=S.t||.001; m.hp=0; m.tg=''; return m; };
  M.parried=(S,i)=>{ const m=S.m.find(q=>q.i===i); if(m&&!m.dead){ m.cool=3.2; m.stun=Math.max(m.stun,.8); } };   // caught on the beat: it staggers, open to you
  // what the page draws: the monsters in the rooms asked for, [i,room,kind,key,x,z,heading,hp,most hp,dead for s,strikes,hits,blocks,target,design entry]
  M.snap=(S,rooms)=>({at:R2(S.t),m:S.m.filter(m=>!rooms||rooms.has(m.r)).filter(m=>!m.dead||S.t-m.dead<ROT).map(m=>[m.i,m.r,m.kind,m.key,R2(m.x),R2(m.z),R2(m.h),R2(m.hp),m.mhp,m.dead?R2(S.t-m.dead):0,m.acts,m.hits,m.blks,m.tg,m.e||''])}); }
export {MOBSIM};
