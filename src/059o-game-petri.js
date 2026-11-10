// THE ARCADE'S PETRI: the dish for its cabinet (in the line of agar.io; docs/arcade/petri.md): cells in one dish eating pellets and each other, split and eject, viruses; its own chunk, fetched the first time you play it. The simulation (DISH) is one path for the client and the worker's shared dish.
import {STORE} from './006-map-pre.js';
STORE.cabs.add({name:'PETRI',skill:'myco',hold:1,lore:{maker:'NODE 9',place:'BERLIN',year:2015,col:'#7aff6a',tag:"EAT. SPLIT. DON'T GET EATEN.",story:['ONE DISH FOR THE WHOLE MARKET.','THE BIGGEST CELL WEARS THE CROWN.']},
  game:L=>{ '@petri'; const {W,H,R,tx,beep,pops,popTick}=L;
  __CODE__("worker/dish.js")
  const petri={help:['ARROWS OR THE MOUSE STEER · SPACE SPLIT','C EJECT MASS · EAT THE SMALL, FLEE THE BIG'],grade:[200,1000,3000],insert:212,make:()=>{
    const s={mode:'play',score:0,over:false,t:0,pops:[],sub:''}, cam={x:DW/2,y:DH/2,z:.8}, srv=/^http/.test(location.protocol); let ME='you', S=DISH.make(Math.floor(R()*1e9)+1), me=null, sock=null, net=false, inT=0, lastIn='';
    me=DISH.join(S,ME,'YOU',COLS[Math.floor(R()*COLS.length)]);
    // on the website the dish is the worker's: everyone in the market in one; the local dish plays until it answers
    const load=sn=>{ const N=DISH.make(1); N.t=sn.t; N.players={}; for(const [id,name,col,dead,best,eaten] of sn.players)N.players[id]={id,name,col,dir:[0,0],split:0,eject:0,best,eaten,dead,n:0};
      N.pellets=sn.pellets.map(([id,x,y,c])=>({id,x,y,c})); N.viruses=sn.vir.map(([x,y,m,vx,vy])=>({x,y,m,fed:0,vx,vy})); N.blobs=sn.blobs.map(([x,y,m,c,vx,vy])=>({x,y,m,c,vx,vy,dx:0,dy:0})); N.cells=cells(N,sn.cells); N.board=sn.board||[]; S=N; me=S.players[ME]||DISH.join(S,ME,'YOU',COLS[0]); };
    const cells=(N,l)=>{ for(const id in N.players)N.players[id].n=0; return l.map(([id,o,x,y,m,vx,vy,mt])=>{ if(N.players[o])N.players[o].n++; return {id,o,m,r:rad(m),x,y,vx,vy,mt:N.t+mt}; }).filter(c=>N.players[c.o]); };
    const feed=m=>{ if(m.t==='hi'){ ME=m.you; load(m.S); net=true; sock.send(JSON.stringify({t:'name',n:(STORE.cabs.ini?STORE.cabs.ini():'')||'YOU',c:me.col})); }
      else if(m.t==='tk'&&net){ const was=me.eaten; S.t=m.t2; for(const [id,name,col,dead,best,eaten] of m.who){ const p=S.players[id]||(S.players[id]={id,name,col,dir:[0,0],split:0,eject:0,n:0}); p.name=name; p.col=col; p.dead=dead; p.best=best; p.eaten=eaten; } for(const id in S.players)if(!m.who.some(w=>w[0]===id))delete S.players[id];
        S.cells=cells(S,m.cells); S.viruses=m.vir.map(([x,y,mm,vx,vy])=>({x,y,m:mm,fed:0,vx,vy})); S.blobs=m.blobs.map(([x,y,mm,c,vx,vy])=>({x,y,m:mm,c,vx,vy,dx:0,dy:0}));
        for(const e of m.ev){ if(e.length===1){ const i=S.pellets.findIndex(q=>q.id===e[0]); if(i>=0){ S.pellets[i]=S.pellets[S.pellets.length-1]; S.pellets.pop(); } } else S.pellets.push({id:e[0],x:e[1],y:e[2],c:e[3]}); }
        S.board=m.board||[]; me=S.players[ME]||me; const [dead,best,eaten,n,ate]=m.me; me.dead=dead; me.best=best; me.eaten=eaten; me.n=n; me.ate=ate; if(eaten>was)ate_(); } };
    const connect=async()=>{ let PS=null; try{ const m=await import('https://cdn.jsdelivr.net/npm/partysocket@1.3.0/+esm'); PS=m.PartySocket||m.default; }catch(e){ console.warn('PETRI: no dish',e); return; } if(s.over)return;
      sock=new PS({host:location.host,party:'dish',room:'petri'}); sock.addEventListener('message',e=>{ let m=null; try{ m=JSON.parse(e.data); }catch(x){} if(m)feed(m); }); sock.addEventListener('close',()=>{ net=false; }); };
    if(srv)connect();
    const mine=()=>S.cells.filter(c=>c.o===ME), centre=()=>{ const m=mine(); if(!m.length)return [cam.x,cam.y]; let x=0, y=0, w=0; for(const c of m){ x+=c.x*c.m; y+=c.y*c.m; w+=c.m; } return [x/w,y/w]; };
    const ate_=()=>{ beep(900,.08,'square',.05,1400); s.pops.push({s:'ATE '+(S.players[me.ate]?S.players[me.ate].name:'?'),x:W/2,y:H/2-20,t:1.2,c:'#ffe83c'}); };
    s.step=(dt,K,T)=>{ dt=Math.min(dt,.05); s.t+=dt; popTick(s,dt); if(s.over)return;
      let dx=0, dy=0; { dx=(K.R?1:0)-(K.L?1:0); dy=(K.D?1:0)-(K.U?1:0); if(!dx&&!dy&&K.mx!=null){ dx=(K.mx-W/2)/40; dy=(K.my-(H/2+8))/40; if(Math.hypot(dx,dy)<.25)dx=dy=0; } }
      if(T.F)beep(700,.05,'square',.04,900); if(T.H)beep(400,.05,'square',.03,300);
      if(net){ const n=Math.hypot(dx,dy)||1, msg=JSON.stringify({t:'in',dx:+(dx/Math.max(1,n)).toFixed(2),dy:+(dy/Math.max(1,n)).toFixed(2),s:T.F?1:0,e:T.H?1:0}); inT-=dt; if(T.F||T.H||(msg!==lastIn&&inT<=0)||inT<=-.4){ if(sock)sock.send(msg); lastIn=msg; inT=.05; } for(const c of S.cells){ c.x+=c.vx*dt; c.y+=c.vy*dt; } }
      else { DISH.input(S,ME,dx,dy,T.F,T.H); const was=me.eaten; DISH.step(S,dt); if(me.eaten>was)ate_(); }
      s.score=Math.round(me.best); if(me.dead){ s.over=true; s.sub='MASS '+Math.round(me.best)+' · '+me.eaten+' EATEN'; beep(120,.8,'sawtooth',.08,40); if(sock){ sock.close(); sock=null; net=false; } }
      const [cx,cy]=centre(), mass=DISH.mass(S,ME), z=1/(1+Math.sqrt(Math.max(mass,10))/20); cam.x+=(cx-cam.x)*Math.min(1,dt*6); cam.y+=(cy-cam.y)*Math.min(1,dt*6); cam.z+=(z-cam.z)*Math.min(1,dt*3); };
    const sx=x=>(x-cam.x)*cam.z+W/2, sy=y=>(y-cam.y)*cam.z+H/2+8;
    s.draw=c=>{ c.fillStyle='#0b1210'; c.fillRect(0,0,W,H); const z=cam.z, g=100*z; c.strokeStyle='#14201a'; c.lineWidth=1; c.beginPath(); for(let x=sx(Math.floor((cam.x-W/2/z)/100)*100);x<W;x+=g){ c.moveTo(Math.round(x)+.5,16); c.lineTo(Math.round(x)+.5,H); } for(let y=sy(Math.floor((cam.y-H/2/z)/100)*100);y<H;y+=g){ c.moveTo(0,Math.round(y)+.5); c.lineTo(W,Math.round(y)+.5); } c.stroke();
      c.strokeStyle='#3a5a44'; c.lineWidth=2; c.strokeRect(sx(0),sy(0),DW*z,DH*z);
      const vis=(x,y,r)=>x+r>-10&&x-r<W+10&&y+r>6&&y-r<H+10;
      for(const q of S.pellets){ const x=sx(q.x), y=sy(q.y); if(!vis(x,y,2))continue; c.fillStyle=COLS[q.c]; c.fillRect(x-1,y-1,Math.max(2,3*z*2),Math.max(2,3*z*2)); }
      for(const q of S.blobs){ const x=sx(q.x), y=sy(q.y), r=Math.max(2,rad(q.m)*z); if(!vis(x,y,r))continue; c.fillStyle=q.c; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); }
      for(const v of S.viruses){ const x=sx(v.x), y=sy(v.y), r=rad(v.m)*z; if(!vis(x,y,r))continue; c.fillStyle='#3aa83a'; c.beginPath(); for(let i=0;i<24;i++){ const a=i/24*Math.PI*2, rr=i%2?r:r*.86; c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr); } c.closePath(); c.fill(); c.strokeStyle='#5aff6a'; c.lineWidth=1; c.stroke(); }
      const top=S.board[0]&&S.board[0].id; for(const q of [...S.cells].sort((a,b)=>a.m-b.m)){ const x=sx(q.x), y=sy(q.y), r=q.r*z; if(!vis(x,y,r))continue; const p=S.players[q.o]; if(!p)continue; c.fillStyle=p.col; c.beginPath(); c.arc(x,y,r,0,7); c.fill(); c.strokeStyle='rgba(0,0,0,.35)'; c.lineWidth=Math.max(1,r*.08); c.stroke();
        if(r>9){ tx(c,p.name,x,y-4,'#fff',Math.min(8,Math.max(5,r/4)),'center'); if(q.o===ME&&r>16)tx(c,String(Math.round(q.m)),x,y+6,'#e8f0ff',6,'center'); } if(q.o===top&&r>6){ c.fillStyle='#ffe83c'; c.beginPath(); c.moveTo(x-6,y-r-2); c.lineTo(x-3,y-r-8); c.lineTo(x,y-r-3); c.lineTo(x+3,y-r-8); c.lineTo(x+6,y-r-2); c.closePath(); c.fill(); } }
      pops(s,c);
      c.fillStyle='rgba(0,0,0,.7)'; c.fillRect(0,0,W,16); tx(c,'MASS '+Math.round(DISH.mass(S,ME)),4,4,'#7aff6a',7); tx(c,Object.keys(S.players).length+' IN THE DISH'+(net?' · LIVE':''),W/2,4,net?'#7aff6a':'#a090c0',7,'center'); tx(c,String(s.score),W-4,4,'#fff',7,'right');
      c.fillStyle='rgba(0,0,0,.55)'; c.fillRect(W-64,18,62,8*Math.min(8,S.board.length)+12); tx(c,'TOP',W-33,20,'#ffe83c',6,'center'); S.board.slice(0,8).forEach((e,i)=>tx(c,(i+1)+' '+e.name.slice(0,9),W-62,28+i*8,e.id===ME?'#7aff6a':'#e8f0ff',6));
      c.fillStyle='rgba(0,0,0,.55)'; c.fillRect(2,H-44,42,42); c.fillStyle='#3a5a44'; c.fillRect(3,H-43,40,40); for(const q of mine()){ c.fillStyle=me.col; c.fillRect(3+q.x/DW*40-1,H-43+q.y/DH*40-1,3,3); }
      if(s.over){ c.fillStyle='rgba(0,0,0,.5)'; c.fillRect(0,16,W,H-16); } };
    s.dbg=()=>({t:s.t,sub:s.sub,net,mass:DISH.mass(S,ME),best:me.best,cells:me.n,eaten:me.eaten,dead:me.dead,over:s.over,pellets:S.pellets.length,blobs:S.blobs.length,viruses:S.viruses.length,players:Object.keys(S.players).length,board:S.board.slice(0,3).map(e=>e.name+' '+e.m),x:centre()[0],y:centre()[1],auto:s.auto});
    s.cheat={grow:m=>{ const c=mine()[0]; if(c){ c.m=m; c.r=rad(m); } },merge:()=>{ for(const c of mine())c.mt=0; },pellet:(dx,dy)=>{ const [x,y]=centre(); DISH.pellet(S,x+dx,y+dy,0); },virus:(dx,dy)=>{ const [x,y]=centre(); DISH.virus(S,x+dx,y+dy); },
      big:(m,dx,dy)=>{ const p=S.players.big||DISH.join(S,'big','BIG','#e8e8f0'); const [x,y]=centre(); for(const c of S.cells)if(c.o==='big')c.m=0; S.cells=S.cells.filter(c=>c.m>0); p.n=0; p.dead=0; return DISH.cell(S,p,m,x+dx,y+dy,0,0).id; }};
    window.PETRIDBG=()=>Object.assign(s.dbg(),{cheat:s.cheat}); return s; } };
  return petri; }});
