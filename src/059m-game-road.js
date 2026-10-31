// THE ARCADE'S ROAD 85: the sunset road racer for its cabinet (stages with shrinking time bonuses, traffic, hills, roadside palms and signs); its own chunk, fetched the first time you play it.
import {STORE} from './006-map-pre.js';
STORE.cabs.add({name:'ROAD 85',skill:'fish',lore:{maker:'SOLAR DRIVE',place:'TOKYO',year:1985,col:'#ff8a2a',tag:'THE SUN NEVER SETS ON ROUTE 85',story:['THE COAST ROAD FROM THE BOOTH TO THE SEA.','NOBODY HAS SEEN THE END OF IT.']},
  game:L=>{ '@road'; const {W,H,R,ri,cl,tx,bmp,beep,DIRS,OPP,mv,at,held,pops,popTick}=L;
  const road={ help:['↑ / SPACE GAS   ↓ BRAKE','← → STEER'], grade:[1500,4000,8000], make:()=>{
    const N=600, SL=200, RW=2000, CH=1000, DD=.84, VIS=150, MAX=SL*60, PZ=CH*DD, L=N*SL, STG=L*1.5, segs=[];
    while(segs.length<N){ const n=40+ri(60), c=R()<.35?0:(R()*2-1)*4; for(let i=0;i<n;i++)segs.push({c:c*Math.sin(Math.PI*i/n)}); } segs.length=N;
    segs.forEach((g,i)=>{ g.i=i; g.k=Math.floor(i/3)%2; g.y=1300*Math.sin(i/N*Math.PI*6)+600*Math.sin(i/N*Math.PI*14+1); g.spr=[]; });
    for(let i=10;i<N;i+=5+ri(5)){ const sd=R()<.5?-1:1, r=R(); segs[i].spr.push({t:r<.6?0:r<.8?1:2,x:sd*(1.35+R()*.7),v:ri(3)}); }
    const CC=['#3cf0ff','#ffe83c','#5aff6a','#ff8a2a','#a46bff','#ffffff'], cars=[], addCars=n=>{ for(let i=0;i<n&&cars.length<30;i++)cars.push({z:3000+R()*(L-6000),x:R()*1.5-.75,sp:MAX*(.25+R()*.3),col:CC[ri(6)]}); }; addCars(10);
    let K_={}; const s={cars,pz:0,x:0,sp:0,time:35,dist:0,score:0,bg:0,stage:1,next:STG,msg:0,bonus:0,over:false,bump:0};
    const yAt=z=>{ const i=Math.floor(z/SL), f=(z%SL)/SL; return segs[i%N].y+(segs[(i+1)%N].y-segs[i%N].y)*f; };
    s.step=(dt,K,T)=>{ K_=K; const pi=Math.floor((s.pz+PZ)/SL)%N, seg=segs[pi], pc=s.sp/MAX, dx=dt*2*pc;
      if(K.L)s.x-=dx; if(K.R)s.x+=dx; s.x-=dx*pc*seg.c*.2;
      if(s.time>0&&(K.U||K.F))s.sp+=MAX/4*dt; else if(K.D)s.sp-=MAX*dt; else s.sp-=MAX/5*dt;
      if(Math.abs(s.x)>1&&s.sp>MAX/4)s.sp-=MAX/1.2*dt; s.x=cl(s.x,-2.4,2.4); s.sp=cl(s.sp,0,MAX);
      for(const c of cars)c.z=(c.z+c.sp*dt)%L; s.bump=Math.max(0,s.bump-dt);
      if(Math.abs(s.x)>1)for(const q of seg.spr)if(Math.abs(s.x-q.x)<.32&&s.sp>MAX/8){ s.sp=MAX/8; s.bump=.6; s.x*=.9; beep(70,.4,'sawtooth',.09,30); }
      for(const c of cars){ const dz=((c.z-(s.pz+PZ))%L+L)%L; if(dz<SL&&Math.abs(c.x-s.x)<.3&&s.sp>c.sp){ s.sp=c.sp*.5; s.pz=((s.pz-(SL-dz))%L+L)%L; s.bump=.4; beep(90,.25,'sawtooth',.08,40); } }
      s.pz=(s.pz+s.sp*dt)%L; s.dist+=s.sp*dt; s.score=Math.floor(s.dist/100); s.bg+=seg.c*pc*dt*14;
      if(s.dist>=s.next&&s.time>0){ s.stage++; s.next+=STG; s.bonus=Math.max(6,18-s.stage*2); s.time+=s.bonus; s.msg=2.5; addCars(3); beep(660,.4,'square',.06,1320); }
      s.time=Math.max(0,s.time-dt); s.msg=Math.max(0,s.msg-dt); if(s.time<=0&&s.sp<=0)s.over=true;
      if(s.sp>0&&R()<dt*8)beep(60+pc*140,.06,'sawtooth',.012); };
    const sprite=(c,q,X_,Y_,u)=>{ if(q.t===0){ const h=.9*u, tw=Math.max(1,.05*u); c.fillStyle='#2a1030'; c.beginPath(); c.moveTo(X_-tw,Y_); c.quadraticCurveTo(X_+.08*u,Y_-h*.5,X_+.06*u,Y_-h); c.lineTo(X_+.06*u+tw,Y_-h); c.quadraticCurveTo(X_+.08*u+tw,Y_-h*.5,X_+tw,Y_); c.fill();
        c.strokeStyle='#14081e'; c.lineWidth=Math.max(1,.04*u); for(let i=0;i<7;i++){ const a=i/7*Math.PI*2, ex=X_+.06*u+Math.cos(a)*.32*u, ey=Y_-h+Math.abs(Math.sin(a))*.1*u+.06*u; c.beginPath(); c.moveTo(X_+.06*u,Y_-h); c.quadraticCurveTo((X_+.06*u+ex)/2,Y_-h-.12*u,ex,ey); c.stroke(); } c.lineWidth=1; }
      else if(q.t===1){ const w=.6*u, h=.25*u, by=Y_-.38*u; c.fillStyle='#14081e'; c.fillRect(X_-w*.35,by,.03*u+1,.38*u); c.fillRect(X_+w*.32,by,.03*u+1,.38*u); c.fillStyle='#0a0614'; c.fillRect(X_-w/2,by-h,w,h);
        const col=['#ff3ca8','#3cf0ff','#ffe83c'][q.v]; c.strokeStyle=col; c.lineWidth=Math.max(1,.015*u); c.strokeRect(X_-w/2+2,by-h+2,w-4,h-4); c.lineWidth=1; if(w>28)tx(c,['ROAD 85','SOLAR','DRIVE-IN'][q.v],X_,by-h/2-h*.22,col,Math.max(6,Math.min(14,h*.45)),'center'); }
      else { const h=.75*u; c.fillStyle='#14081e'; c.fillRect(X_-.015*u,Y_-h,.03*u+1,h); c.fillRect(X_-(q.x>0?.18:0)*u,Y_-h,.18*u,.025*u+1); const lx=X_+(q.x>0?-.18:.18)*u;
        c.fillStyle='rgba(255,220,140,.25)'; c.beginPath(); c.arc(lx,Y_-h,.12*u,0,7); c.fill(); c.fillStyle='#ffe8b0'; c.fillRect(lx-.03*u,Y_-h,.06*u+1,.03*u+1); } };
    s.draw=c=>{ const g=c.createLinearGradient(0,0,0,H/2); g.addColorStop(0,'#1a0838'); g.addColorStop(.7,'#7a1a78'); g.addColorStop(1,'#ff3ca8'); c.fillStyle=g; c.fillRect(0,0,W,H/2+1);
      const sx=((128-s.bg*.3)%W+W)%W; c.fillStyle='#ffd23c'; c.beginPath(); c.arc(sx,H/2-4,30,Math.PI,0); c.fill(); c.fillStyle='#ff8a2a'; c.beginPath(); c.arc(sx,H/2-4,30,Math.PI,Math.PI*1.5,true); c.fill();
      c.fillStyle='#7a1a78'; for(let i=0;i<5;i++)c.fillRect(sx-31,H/2-6-i*5,62,1+i*.4);
      for(const [sp,col,hh] of [[.6,'#3a0c50',22],[1,'#22062e',14]]){ c.fillStyle=col; c.beginPath(); c.moveTo(0,H/2); for(let x=0;x<=W;x+=4){ const q=x+s.bg*sp+hh*40; c.lineTo(x,H/2-hh*(.55+.3*Math.sin(q*.031)+.15*Math.sin(q*.083))); } c.lineTo(W,H/2); c.fill(); }
      c.fillStyle='#120626'; c.fillRect(0,H/2,W,H/2);
      const base=Math.floor(s.pz/SL), bp=(s.pz%SL)/SL, camX=s.x*RW, camY=yAt(s.pz+PZ)+CH; let x=0, dx=-(segs[base%N].c*bp), maxy=H;
      const P=(z,xx,yy)=>{ const sc=DD/z; return [W/2+sc*(xx-camX)*W/2,H/2-sc*(yy-camY)*H/2,sc*RW*W/2]; }, quad=(col,x1,y1,w1,x2,y2,w2)=>{ c.fillStyle=col; c.beginPath(); c.moveTo(x1-w1,y1); c.lineTo(x2-w2,y2); c.lineTo(x2+w2,y2); c.lineTo(x1+w1,y1); c.fill(); };
      const vis=[];
      for(let n=0;n<VIS;n++){ const sg=segs[(base+n)%N], nx=segs[(base+n+1)%N], z0=n*SL-bp*SL, z1=z0+SL, a=P(z0,x,sg.y), b=P(z1,x+dx,nx.y); x+=dx; dx+=sg.c;
        if(z0<=DD||b[1]>=maxy)continue; sg.sx=a[0]; sg.sy=a[1]; sg.sc=DD/z0; sg.clip=maxy; vis.push(sg);
        c.fillStyle=sg.k?'#2a0a3a':'#1a0628'; c.fillRect(0,b[1],W,a[1]-b[1]+1);
        quad(sg.k?'#ff3ca8':'#ffffff',a[0],a[1],a[2]*1.12,b[0],b[1],b[2]*1.12); quad(sg.k?'#2a2838':'#302e40',a[0],a[1],a[2],b[0],b[1],b[2]);
        if(sg.k)for(const l of [-1/3,1/3])quad('#e8e0ff',a[0]+a[2]*l,a[1],a[2]*.02,b[0]+b[2]*l,b[1],b[2]*.02); maxy=b[1]; }
      const by=new Map(); for(const car of cars){ const i=Math.floor(car.z/SL); if(!by.has(i))by.set(i,[]); by.get(i).push(car); }
      for(let k=vis.length-1;k>=0;k--){ const sg=vis[k], u=sg.sc*RW*W/2; c.save(); c.beginPath(); c.rect(0,0,W,sg.clip); c.clip();
        for(const q of sg.spr)if(u>2)sprite(c,q,sg.sx+u*q.x,sg.sy,u);
        for(const car of by.get(sg.i)||[]){ const w=u*.28, h=w*.55, X_=sg.sx+u*car.x; if(w<1.5)continue;
          c.fillStyle=car.col; c.fillRect(X_-w/2,sg.sy-h,w,h*.7); c.fillStyle='#14101e'; c.fillRect(X_-w*.35,sg.sy-h*1.25,w*.7,h*.6); c.fillStyle='#ff2a2a'; c.fillRect(X_-w/2,sg.sy-h*.55,w*.18,h*.15); c.fillRect(X_+w*.32,sg.sy-h*.55,w*.18,h*.15); c.fillStyle='#000'; c.fillRect(X_-w*.45,sg.sy-h*.3,w*.2,h*.3); c.fillRect(X_+w*.25,sg.sy-h*.3,w*.2,h*.3); }
        c.restore(); }
      const cx=W/2+(s.bump>0?(R()-.5)*4:0)+(K_.L?-2:K_.R?2:0), cy=H-4;
      c.fillStyle='#000'; c.fillRect(cx-30,cy-10,12,10); c.fillRect(cx+18,cy-10,12,10); c.fillStyle='#ff3c5a'; c.fillRect(cx-32,cy-22,64,14); c.fillStyle='#c01a3a'; c.fillRect(cx-26,cy-32,52,11);
      c.fillStyle='#1a1430'; c.fillRect(cx-22,cy-31,44,8); c.fillStyle=K_.D?'#ff2a2a':'#ffe83c'; c.fillRect(cx-30,cy-19,10,4); c.fillRect(cx+20,cy-19,10,4); c.fillStyle='#fff'; c.fillRect(cx-6,cy-17,12,4);
      tx(c,'SCORE '+s.score,6,4,'#fff'); tx(c,'STAGE '+s.stage,6,14,'#ff7ad8'); tx(c,'TIME',128,2,'#ffe83c',8,'center'); tx(c,String(Math.ceil(s.time)),128,11,s.time<10&&Math.floor(s.time*4)%2?'#ff3c5a':'#ffe83c',14,'center');
      tx(c,Math.round(s.sp/MAX*285)+' KM/H',250,4,'#3cf0ff',8,'right'); if(s.msg>0)tx(c,'CHECKPOINT  +'+s.bonus,128,60,'#5aff6a',10,'center');
      if(s.time<=0)tx(c,'TIME UP',128,80,'#ff3c5a',16,'center'); };
    return s; } };
  road.attract=K=>{ K.U=1; };
  return road; }});
