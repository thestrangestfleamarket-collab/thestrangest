// THE DUNGEON'S MONSTERS: every slime, guard and spider in the dungeon, where it is, its health, who it hunts and when it strikes; one path for the section's server (worker/door.js Block, stepped five times a second while anyone is below) and the page (run there off the website). The page bakes the map (each room's floor, danger and what blocks it) and the monsters' book (their kinds and strengths) and sends them; the server keeps the rest.
const MOBSIM={};
{ const M=MOBSIM, fin=v=>typeof v==='number'&&isFinite(v), N=(v,d=0)=>fin(v)?v:fin(+v)?+v:d, R2=v=>Math.round(v*100)/100, RESPAWN=120, ROT=4;
  M.make=()=>({t:0,at:0,seq:0,g:null,m:[]});
  // the map and the book, from the page: {v, T, rooms:[{k,n,safe,lane:[x0,z0,x1,z1],block:[[x0,z0,x1,z1]...]}], cat:{tiers,mix,guards,stats,styles,kk}}
  M.grid=(S,G)=>{ if(!G||!Array.isArray(G.rooms)||!G.cat)return false; const T=N(G.T,1)||1, rooms={};
    for(const r of G.rooms.slice(0,64)){ const k=r.k|0, L=Array.isArray(r.lane)?r.lane.slice(0,4).map(v=>N(v)):null; if(!k||!L)continue; rooms[k]={k,n:Math.max(1,Math.min(5,r.n|0||1)),safe:!!r.safe,lane:L,block:(Array.isArray(r.block)?r.block:[]).slice(0,80).map(b=>(Array.isArray(b)?b:[]).slice(0,4).map(v=>N(v)))}; }
    const was=S.g&&S.g.v; S.g={v:String(G.v||''),T,rooms,cat:G.cat}; if(was!==S.g.v){ S.m=[]; M.fill(S); } return true; };
  const F=n=>1+.35*(n-1), pick=(W,rnd)=>{ let r=rnd(); for(const k in W)if((r-=W[k])<0)return k; return Object.keys(W).pop(); };
  const inL=(L,x,z)=>x>L[0]&&x<L[2]&&z>Math.min(L[1],L[3])&&z<Math.max(L[1],L[3]);
  const free=(R,x,z,r)=>inL(R.lane,x,z)&&!R.block.some(b=>x>Math.min(b[0],b[2])-r&&x<Math.max(b[0],b[2])+r&&z>Math.min(b[1],b[3])-r&&z<Math.max(b[1],b[3])+r);
  const spot=(R,rnd,r)=>{ const L=R.lane; for(let k=0;k<60;k++){ const x=L[0]+rnd()*(L[2]-L[0]), z=L[1]+rnd()*(L[3]-L[1]); if(free(R,x,z,r))return {x,z}; } return {x:(L[0]+L[2])/2,z:(L[1]+L[3])/2}; };
  // a new monster of a kind in a room, as strong as the room is deep
  const born=(S,R,kind,key,rnd)=>{ const C=S.g.cat, T=S.g.T, n=R.n, f=F(n), p=spot(R,rnd,.3*T); let hp, dmg, v, reach, see=(2.6+.5*n)*T, ranged=0;
    if(kind==='s'){ const t=C.tiers[key]||{hp:2,dmg:0,v:1}; hp=Math.ceil(t.hp*f); dmg=Math.max(t.dmg||0,.025)*f; v=(t.v||1)*(1+.08*(n-1))*T; reach=.75*T; }
    else { const s=(C.stats||{})[key]||[3,.05], y=(C.styles||{})[key]||{}; hp=Math.ceil(s[0]*f); dmg=s[1]*f; v=(kind==='p'?1.4:1.2)*1.6*(1+.08*(n-1))*T; reach=(y.ranged?5.5:y.reach||(kind==='p'?.6:.8))*T; ranged=y.ranged?1:0; if(kind==='p')see+=.6*T; }
    return {i:++S.seq,r:R.k,kind,key,x:R2(p.x),z:R2(p.z),h:rnd()*6.28,hp,mhp:hp,dmg,v,reach,see,ranged,dead:0,agg:0,tg:'',to:null,wait:rnd()*3,cool:1+rnd(),act:0,acts:0,hits:0,blks:0,land:0,stun:0,kb:null,home:{x:p.x,z:p.z}}; };
  // a room's monsters by its danger: three to five, more guards and spiders deeper
  const plan=(S,R,rnd)=>{ const C=S.g.cat, n=R.n, out=[], Nn=3+Math.floor(rnd()*3), keys=((C.guards||{})[n]||[]).slice(), g=keys.length?Math.min(Nn-1,n===1?(rnd()<.5?1:0):1+Math.floor(rnd()*Math.min(3,n-1))):0;
    for(let i=0;i<g;i++)out.push(['g',keys[Math.floor(rnd()*keys.length)]]);
    for(let i=g;i<Nn;i++)out.push(rnd()<.25+.06*n&&n>1?['p','spider']:['s',pick((C.mix||{})[n]||{green:1},rnd)]); return out; };
  M.fill=(S,rnd=Math.random)=>{ if(!S.g)return; for(const k in S.g.rooms){ const R=S.g.rooms[k]; if(R.safe||S.m.some(m=>m.r===R.k))continue; for(const [kind,key] of plan(S,R,rnd))S.m.push(born(S,R,kind,key,rnd)); } };
  M.load=r=>{ const S=M.make(); if(!r||typeof r!=='object')return S; S.t=N(r.t); S.seq=N(r.seq); if(r.g&&r.g.rooms)S.g=r.g; if(Array.isArray(r.m))S.m=r.m.filter(m=>m&&fin(m.x)&&fin(m.z)).map(m=>({...m,to:null,kb:null,land:0})); return S; };
  M.save=S=>({t:S.t,seq:S.seq,g:S.g,m:S.m.map(m=>({...m,to:null,kb:null}))});
  const roomAt=(S,x,z)=>{ if(!S.g)return 0; for(const k in S.g.rooms)if(inL(S.g.rooms[k].lane,x,z))return +k; return 0; };
  M.roomAt=roomAt;
  // a step: players [{id,x,z,ok}] (ok: alive, seen, below); returns what happened to them: [{t:'hurt',to,d,x,z,i}]
  M.step=(S,dt,P,rnd=Math.random)=>{ const ev=[]; if(!S.g||!(dt>0))return ev; S.t+=dt; const T=S.g.T, kk=S.g.cat.kk||[], live=P.filter(p=>p.ok).map(p=>({...p,r:roomAt(S,p.x,p.z)}));
    for(let j=S.m.length-1;j>=0;j--){ const m=S.m[j], R=S.g.rooms[m.r]; if(!R){ S.m.splice(j,1); continue; }
      if(m.dead){ if(S.t-m.dead>RESPAWN&&!live.some(p=>p.r===m.r)){ S.m[j]=born(S,R,m.kind,m.key,rnd); } continue; }   // back again after a while, out of sight
      if(m.kb){ const a=Math.min(1,dt*12), nx=m.x+(m.kb.x-m.x)*a, nz=m.z+(m.kb.z-m.z)*a; if(free(R,nx,nz,.15*T)){ m.x=nx; m.z=nz; } if(Math.hypot(m.kb.x-m.x,m.kb.z-m.z)<.03*T)m.kb=null; continue; }
      if(m.stun>0){ m.stun-=dt; continue; }
      m.cool-=dt; let you=null, yd=1e9; for(const p of live){ if(p.r!==m.r)continue; const d=Math.hypot(p.x-m.x,p.z-m.z); if(d<yd){ yd=d; you=p; } }
      const sees=you&&(m.agg?yd<2*m.see:yd<m.see); m.agg=sees?1:0; m.tg=sees?you.id:'';
      if(m.land&&S.t>=m.land){ m.land=0; const p=live.find(q=>q.id===m.ltg); if(p&&Math.hypot(p.x-m.x,p.z-m.z)<(m.ranged?7*T:m.reach*1.45))ev.push({t:'hurt',to:p.id,d:R2(m.dmg*1000)/1000,x:R2(m.x),z:R2(m.z),i:m.i}); }   // the blow lands a moment after the swing starts
      if(sees){ const ex=you.x-m.x, ez=you.z-m.z; m.h=Math.atan2(ex,ez);
        if(yd>m.reach){ const stp=Math.min(yd-m.reach*.8,m.v*dt), nx=m.x+ex/yd*stp, nz=m.z+ez/yd*stp; if(free(R,nx,nz,.15*T)&&!S.m.some(o=>o!==m&&!o.dead&&o.r===m.r&&Math.hypot(o.x-nx,o.z-nz)<.35*T)){ m.x=nx; m.z=nz; } }
        else if(m.cool<=0&&!m.land){ m.cool=(m.kind==='s'?1.6:1.8+rnd()*.7)/(1+.1*R.n); m.acts++; m.act=S.t; m.land=S.t+(m.kind==='s'?.15:m.kind==='p'?.3:.45); m.ltg=you.id; }
        continue; }
      if(m.to){ const ex=m.to.x-m.x, ez=m.to.z-m.z, l=Math.hypot(ex,ez); if(l<.1*T){ m.to=null; m.wait=1.5+rnd()*3; } else { const stp=Math.min(l,m.v*.5*dt), nx=m.x+ex/l*stp, nz=m.z+ez/l*stp; if(free(R,nx,nz,.15*T)){ m.x=nx; m.z=nz; m.h=Math.atan2(ex,ez); } else m.to=null; } }
      else if((m.wait-=dt)<=0){ const a=rnd()*6.28, d=(1.2+rnd()*2.5)*T, x=m.x+Math.sin(a)*d, z=m.z+Math.cos(a)*d; if(free(R,x,z,.2*T))m.to={x,z}; else m.wait=.5; } }
    return ev; };
  // a blow from a player: {d, kb, heavy, x, z, by}; the result: 'blocked' (a guard's shield took a light blow), 'hit', 'dead' (with what it was, for the striker's reward)
  M.hit=(S,i,o,rnd=Math.random)=>{ const m=S.m.find(q=>q.i===i); if(!m||m.dead)return {res:'gone'}; const R=S.g&&S.g.rooms[m.r], T=S.g?S.g.T:1, kk=(S.g&&S.g.cat.kk)||[]; m.agg=1;
    if(m.kind==='g'&&kk.includes(m.key)&&!o.heavy&&rnd()<Math.min(.5,(R?R.n:1)*.1)){ m.blks++; return {res:'blocked',m}; }
    m.hp-=Math.max(0,Math.min(20,N(o.d))); m.hits++; const dx=m.x-N(o.x,m.x), dz=m.z-N(o.z,m.z), l=Math.hypot(dx,dz)||1, kb=(m.kind==='s'?.45:.6)*T*Math.max(.5,Math.min(3,N(o.kb,1)));
    if(R&&free(R,m.x+dx/l*kb,m.z+dz/l*kb,.15*T))m.kb={x:m.x+dx/l*kb,z:m.z+dz/l*kb}; if(o.heavy)m.stun=Math.max(m.stun,m.kind==='g'?1.2:.6); m.land=0;
    if(m.hp>0)return {res:'hit',m}; m.dead=S.t||.001; m.hp=0; m.tg=''; return {res:'dead',m,n:R?R.n:1}; };
  M.parried=(S,i)=>{ const m=S.m.find(q=>q.i===i); if(m&&!m.dead){ m.cool=3.2; m.stun=Math.max(m.stun,.8); } };   // caught on the beat: it staggers, open to you
  // what the page draws: the monsters in the rooms asked for, [i,room,kind,key,x,z,heading,hp,most hp,dead for s,strikes,hits,blocks,target]
  M.snap=(S,rooms)=>({at:R2(S.t),m:S.m.filter(m=>!rooms||rooms.has(m.r)).filter(m=>!m.dead||S.t-m.dead<ROT).map(m=>[m.i,m.r,m.kind,m.key,R2(m.x),R2(m.z),R2(m.h),R2(m.hp),m.mhp,m.dead?R2(S.t-m.dead):0,m.acts,m.hits,m.blks,m.tg])}); }
export {MOBSIM};
