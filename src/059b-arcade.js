// THE ARCADE: the arcade (its own builder; cabinets, the counter, the games you can play).
await grab('arcade',async()=>{ const K=STORE.kit, {room,flat}=K, {X,Y,Z}=BOD, {hash:hs,grain}=BOD.g, sh=BOD.K.sh, {PROPS,LAMPS}=BOD.STOREK;
  const B={id:'larcade',x0:480,y0:-104,x1:512,y1:-81.6,h:140}, S=1.6, ZM=38, mx=m=>B.x0+m*S, my=m=>B.y0+m*S, PX=mx(11);
  STORE.bound.x1=Math.max(STORE.bound.x1,X(530));
  K.offmap('THE ARCADE',[474,-110,518,-70],()=>{ '@arcade';
    const lit=c=>Object.assign([c[0],c[1],c[2]],{e:1}), hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
    const pic=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); f(g,w,h); const d=g.getImageData(0,0,w,h).data;
      return (u,v)=>{ const i=Math.min(w-1,Math.max(0,Math.floor(u*w))), j=Math.min(h-1,Math.max(0,Math.floor(v*h))), k=(j*w+i)*4; return d[k+3]<128?null:[d[k],d[k+1],d[k+2]]; }; };
    const F3={A:'010101111101101',B:'110101110101110',C:'111100100100111',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'111100101101111',H:'101101111101101',I:'111010010010111',J:'001001001101111',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'111101101101111',P:'111101111100100',Q:'111101101111001',R:'111101110101101',S:'111100111001111',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',0:'111101101101111',1:'010110010010111',2:'111001111100111',3:'111001111001111',4:'101101111001001',5:'111100111001111',6:'111100111101111',7:'111001001001001',8:'111101111101111',9:'111101111001111','-':'000000111000000','.':'000000000000010','&':'010101010101011',"'":'010010000000000','!':'010010010000010','$':'111110111011111'};
    const txt=(g,s,x,y,k,col)=>{ g.fillStyle=col; [...s].forEach((ch,i)=>{ const q=F3[ch]; if(!q)return; for(let r=0;r<5;r++)for(let c=0;c<3;c++)if(q[r*3+c]==='1')g.fillRect(x+(i*4+c)*k,y+r*k,k,k); }); };
    const tw=(s,k)=>(s.length*4-1)*k, ctxt=(g,s,cx,y,k,col)=>txt(g,s,Math.round(cx-tw(s,k)/2),y,k,col);
    const SIDE={e:[1,0],w:[-1,0],f:[0,1],b:[0,-1]};
    const fu=(sd,b,P,Q)=>sd==='e'?(b.y1-Q)/(b.y1-b.y0):sd==='w'?(Q-b.y0)/(b.y1-b.y0):sd==='f'?(P-b.x0)/(b.x1-b.x0):(b.x1-P)/(b.x1-b.x0);
    const bx=(x0,y0,x1,y1,z0,z1,c,o={})=>({x0:Math.min(x0,x1),y0:Math.min(y0,y1),x1:Math.max(x0,x1),y1:Math.max(y0,y1),z0,z1,c,...o});
    const pb=(b,sd,p,glow)=>{ const [ax,ay]=SIDE[sd]; b.fs=(nx,ny,P,Q,z,s)=>{ if(nx===ax&&ny===ay){ const r=p(fu(sd,b,P,Q),1-z/(b.z1-b.z0)); if(r)return glow&&!b.em?lit(r):r; } return b.em?b.c:sh(b.c,s); }; return b; };
    const mb=(x0,z0,x1,z1,h0,h1,c,o)=>bx(mx(x0),my(z0),mx(x1),my(z1),h0*ZM,h1*ZM,c,o);
    const thing=(name,boxes,o={})=>PROPS.push({kind:name,name,boxes,...o});
    const lamp=(x,z,h,r,c,o={})=>LAMPS.push({own:1,room:1,day:true,x:mx(x),y:my(z),z:h*ZM,r,c,...o});
    const wallAt={b:m=>[mx(m),B.y0+.1],f:m=>[mx(m),B.y1-.1],e:m=>[B.x0+.1,my(m)],w:m=>[B.x1-.1,my(m)],pw:m=>[PX-.13,my(m)],pe:m=>[PX+.13,my(m)]};
    const FACE={b:'f',f:'b',e:'e',w:'w',pw:'w',pe:'e'};
    const onWall=(name,wl,u,h0,h1,wm,p,o={})=>{ const [x,y]=wallAt[wl](u), sd=FACE[wl], [ax,ay]=SIDE[sd], t=o.t||.06, hw=wm*S/2;
      const b=ax?bx(x,y-hw,x+ax*t,y+hw,h0*ZM,h1*ZM,o.c||[14,12,18],{em:o.em}):bx(x-hw,y,x+hw,y+ay*t,h0*ZM,h1*ZM,o.c||[14,12,18],{em:o.em});
      thing(name,[pb(b,sd,p,o.glow)],{high:1}); };
    const halo=(g,w,h,col)=>{ const d=g.getImageData(0,0,w,h), a=d.data, m=new Uint8Array(w*h); for(let i=0;i<w*h;i++)m[i]=a[i*4+3]>0?1:0;
      const grow=(src)=>{ const o=new Uint8Array(w*h); for(let y=0;y<h;y++)for(let x=0;x<w;x++){ if(src[y*w+x]){ o[y*w+x]=1; continue; } for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X_=x+dx, Y_=y+dy; if(X_>=0&&Y_>=0&&X_<w&&Y_<h&&src[Y_*w+X_]){ o[y*w+x]=1; break; } } } return o; };
      const r1=grow(grow(m)), r2=grow(grow(r1)), [cr,cg,cb]=hex(col);
      for(let i=0;i<w*h;i++){ if(m[i])continue; const k=r1[i]?.5:r2[i]?.24:0; if(!k)continue; a[i*4]=cr*k; a[i*4+1]=cg*k; a[i*4+2]=cb*k; a[i*4+3]=255; } g.putImageData(d,0,0); };
    const neon=(s,col,core,k,pad=6,bulbs)=>{ const w=tw(s,k)+pad*2+4, h=5*k+pad*2+4; return [w,h,pic(w,h,(g)=>{ 
      txt(g,s,pad+2-1,pad+2,k,col); txt(g,s,pad+2+1,pad+2,k,col); txt(g,s,pad+2,pad+1,k,col); txt(g,s,pad+2,pad+3,k,col); txt(g,s,pad+2,pad+2,k,core); halo(g,w,h,col);
      const d=g.getImageData(0,0,w,h); for(let i=3;i<d.data.length;i+=4)if(!d.data[i]){ d.data[i-3]=12; d.data[i-2]=10; d.data[i-1]=18; d.data[i]=255; } g.putImageData(d,0,0);
      if(bulbs){ g.fillStyle=bulbs; for(let x=2;x<w-2;x+=5){ g.fillRect(x,1,2,2); g.fillRect(x,h-3,2,2); } for(let y=2;y<h-2;y+=5){ g.fillRect(1,y,2,2); g.fillRect(w-3,y,2,2); } } })]; };
    const sign=(name,wl,u,hc,s,col,core,k,mpp,bulbs)=>{ const [w,h,p]=neon(s,col,core,k,6,bulbs), wm=w*mpp, hm=h*mpp; onWall(name,wl,u,hc-hm/2,hc+hm/2,wm,p,{em:1,t:.04}); };

    const PAL=['#3cf0ff','#ff3ca8','#ffe83c','#5aff6a','#a46bff','#ff8a2a','#2a7bff'];
    const carpet=pic(77,77,(g,w,h)=>{ g.fillStyle='#000'; g.fillRect(0,0,w,h); let sd=5; const r=()=>((sd=(sd*16807)%2147483647)/2147483647);
      for(let k=0;k<11;k++){ const x=r()*w, y=r()*h, col=PAL[Math.floor(r()*7)], t=Math.floor(r()*5), a=r()*6.28, s=3+r()*3;
        for(const ox of [-w,0,w])for(const oy of [-h,0,h]){ g.save(); g.translate(x+ox,y+oy); g.rotate(a); g.strokeStyle=col; g.lineWidth=1.6; g.beginPath();
          if(t===0)for(let i=0;i<=10;i++)g.lineTo(i*1.2-6,Math.sin(i*.9)*2.2); else if(t===1){ g.moveTo(-s,s*.7); g.lineTo(s,s*.7); g.lineTo(0,-s); g.closePath(); }
          else if(t===2)g.arc(0,0,s*.6,0,7); else if(t===3){ g.ellipse(0,0,s*.9,s*.35,0,0,7); } else { g.moveTo(-s,0); g.lineTo(-s/2,-2); g.lineTo(0,0); g.lineTo(s/2,-2); g.lineTo(s,0); }
          g.stroke(); g.restore(); } }
      for(let k=0;k<12;k++){ g.fillStyle=PAL[Math.floor(r()*7)]; g.fillRect(Math.floor(r()*w),Math.floor(r()*h),1,1); }
      const d=g.getImageData(0,0,w,h), P=PAL.map(hex); for(let i=0;i<d.data.length;i+=4){ const a=d.data; if(Math.max(a[i],a[i+1],a[i+2])<90){ a[i]=a[i+1]=a[i+2]=0; continue; } let best=0, bd=1e9; P.forEach((p,j)=>{ const q=(p[0]-a[i])**2+(p[1]-a[i+1])**2+(p[2]-a[i+2])**2; if(q<bd){ bd=q; best=j; } }); [a[i],a[i+1],a[i+2]]=P[best]; a[i+3]=255; } g.putImageData(d,0,0); });
    const CW=3.2*S, cx0=mx(.6), cy0=my(.5), cx1=mx(10.2), cy1=my(13.1);
    const floor=(x,y)=>{ const px=Math.floor(x*24), py=Math.floor(y*24);
      if(x>=cx0&&x<cx1&&y>=cy0&&y<cy1){ const u=(((x-cx0)/CW)%1+1)%1, v=(((y-cy0)/CW)%1+1)%1, c=carpet(u,v); return c&&(c[0]||c[1]||c[2])?lit(c.map(q=>q*.8)):[10,9,14]; }
      if(x<PX){ const row=Math.floor(py/7), off=Math.floor(hs(row,0,701)*60), seg=Math.floor((px+off)/50), k=.82+.3*hs(row,seg,702); return (py%7===0||(px+off)%50===0)?[30,18,12]:sh([70,44,30],k); }
      const r=hs(px>>1,py>>1,703); return r<.08?[104,96,86]:r<.6?[86,80,72]:[94,86,78]; };
    const brick=(u,z,base)=>{ const row=Math.floor(z/4), i=Math.floor(u*24+(row&1)*5), b=Math.floor(i/11); if(i%11===10||Math.floor(z)%4===3)return [44,28,24]; const k=.72+.42*hs(b,row,704); return sh(base,k); };
    const inner=(B_,nx,ny,Xw,Yw,z,f)=>{ const u=nx?Yw:Xw; if(Xw<PX-.2)return sh(hs(Math.floor(u*12),Math.floor(z/2),705)<.5?[50,42,64]:[46,38,60],f); return sh(brick(u,z,[156,76,54]),f); };
    const outer=(nx,ny,Xw,Yw,z,f)=>sh(z>B.h-5?[40,36,40]:brick(nx?Yw:Xw,z,[96,46,36]),f*(z<8?.85:1));
    const OP=[[4.2,10.4,.7,2.8],[11.6,15.5,.45,3.05],[15.8,19.6,.45,3.05]];
    const R=room('arcade','THE ARCADE',B,{floor,in:inner,out:outer,cope:[40,36,40],roof:(x,y)=>sh([46,44,50],.9+.1*hs(Math.floor(x*2),Math.floor(y*2),706))},{w:'f',a:mx(2.4),wd:2.4,h:92},()=>{
      const dk=[16,14,20], wood=[96,64,40], dkw=[42,26,18], blk=[20,18,24], steel=[138,142,150];
      const cab=(sd,u,o)=>{ const [ax,ay]=SIDE[sd], w=(o.w||.74)*S, wl={e:'e',w:'pw',f:'b'}[sd], [xb,yb]=wallAt[wl](u), bs=[];
        const R_=(a0,a1,d0,d1)=>ax>0?[xb+d0*S,yb+a0*w,xb+d1*S,yb+a1*w]:ax<0?[xb-d1*S,yb-a1*w,xb-d0*S,yb-a0*w]:[xb-a1*w,yb+d0*S,xb-a0*w,yb+d1*S];
        const art=pic(32,64,(g,W,H)=>{ g.fillStyle=o.body; g.fillRect(0,0,W,H);
          if(o.art==='stripes'){ const C=['#27a84a','#ff8a2a','#e2304a','#141016']; for(let i=-10;i<20;i++){ g.fillStyle=C[(i+40)%4]; g.beginPath(); g.moveTo(0,H-i*6); g.lineTo(W,H-i*6-20); g.lineTo(W,H-i*6-25); g.lineTo(0,H-i*6-5); g.fill(); } }
          else if(o.art==='check'){ g.fillStyle='#141016'; for(let i=0;i<8;i++)for(let j=0;j<2;j++)if((i+j)%2)g.fillRect(i*4,34+j*4,4,4); }
          else { g.fillStyle=o.art; g.beginPath(); g.moveTo(0,H); g.lineTo(W,H-14); g.lineTo(W,H-26); g.lineTo(0,H-12); g.fill(); g.fillRect(0,0,W,5); } });
        const dep=(P,Q)=>ax>0?(P-xb)/S:ax<0?(xb-P)/S:(Q-yb)/S;
        const part=(a0,a1,d0,d1,h0,h1,c,front,em)=>{ const [x0,y0,x1,y1]=R_(a0,a1,d0,d1), b=bx(x0,y0,x1,y1,h0*ZM,h1*ZM,c,em?{em:1}:{});
          b.fs=(nx,ny,P,Q,z,s)=>{ if(nx===ax&&ny===ay){ if(front){ const q=front(fu(sd,b,P,Q),1-z/(b.z1-b.z0)); if(q)return q; } return em?c:sh(c,s); }
            if((nx||ny)&&!(nx===-ax&&ny===-ay)){ const q=art(Math.min(.99,dep(P,Q)),1-(b.z0+z)/ZM/1.84); return sh(q||c,s); } return em?c:sh(c,s); }; bs.push(b); return b; };
        const trim=o.trim||dk, coin=(u_,v)=>(v>.45&&v<.75&&((u_>.3&&u_<.4)||(u_>.6&&u_<.7)))?lit([255,60,60]):(v>.3&&v<.9&&u_>.2&&u_<.8)?[28,26,32]:null;
        part(-.5,.5,0,.78,0,.82,trim,coin); part(-.5,.5,0,.98,.82,.97,trim); part(-.5,.5,0,.6,.97,1.56,trim); part(-.5,.5,0,.8,1.56,1.84,trim);
        part(-.42,.42,.6,.64,1.0,1.5,[10,10,16],o.scr,1);
        const mq=pic(64,14,(g)=>{ g.fillStyle=o.mbg||'#141016'; g.fillRect(0,0,64,14); const k=tw(o.name,1)>60?1:2; ctxt(g,o.name,32,k===2?2:4,k,o.mcol||'#fff'); });
        part(-.46,.46,.8,.82,1.58,1.82,[20,18,24],mq,1);
        bs.push(bx(...R_(-.26,-.2,.84,.88),.97*ZM,1.07*ZM,[226,48,74]));
        [[255,232,60],[60,240,255],[255,60,168]].forEach((c,i)=>{ const [a,b_,c_,d]=R_(.02+i*.1,.07+i*.1,.84,.88); bs.push(bx(a,b_,c_,d,.97*ZM,1.0*ZM,c,{em:1})); });
        if(o.edge)for(const a of [-.52,.5]){ const [x0,y0,x1,y1]=R_(a,a+.02,.74,.8); bs.push(bx(x0,y0,x1,y1,0,1.84*ZM,o.edge,{em:1})); }
        thing('arcade cabinet: '+o.name.toLowerCase(),bs); };
      const scr=k=>pic(48,40,(g,W,H)=>{ g.fillStyle='#05060c'; g.fillRect(0,0,W,H);
        if(k==='paddles'){ g.fillStyle='#e8f0ff'; g.fillRect(3,14,2,8); g.fillRect(43,10,2,8); g.fillRect(26,20,2,2); for(let y=1;y<H;y+=4)g.fillRect(23,y,2,2); txt(g,'3',14,3,1,'#e8f0ff'); txt(g,'7',30,3,1,'#e8f0ff'); }
        else if(k==='raid'){ const C=['#ff4fd8','#4ff0ff','#5aff6a']; for(let r=0;r<3;r++)for(let i=0;i<5;i++){ g.fillStyle=C[r]; const x=4+i*8, y=4+r*6; g.fillRect(x,y,5,3); g.fillRect(x+1,y+3,1,1); g.fillRect(x+3,y+3,1,1); } g.fillStyle='#ffe83c'; g.fillRect(21,35,6,3); g.fillRect(23,33,2,2); }
        else if(k==='taksi'){ g.fillStyle='#ff8a2a'; g.fillRect(0,8,W,10); g.fillStyle='#283048'; g.fillRect(0,18,W,22); g.fillStyle='#606a80'; g.beginPath(); g.moveTo(20,18); g.lineTo(28,18); g.lineTo(46,40); g.lineTo(2,40); g.fill(); g.fillStyle='#ffd21c'; g.fillRect(17,28,14,6); g.fillStyle='#111'; g.fillRect(18,29,12,2); }
        else if(k==='maze'){ g.strokeStyle='#2a7bff'; for(let i=0;i<3;i++)g.strokeRect(3.5+i*6,3.5+i*6,40-i*12,32-i*12); g.fillStyle='#ffe83c'; g.fillRect(22,18,4,4); g.fillStyle='#ff4f6a'; g.fillRect(8,8,3,3); }
        else { const C=['#ff4fd8','#4ff0ff','#ffe83c','#5aff6a','#ff8a2a']; for(let y=20;y<H;y+=4)for(let x=2;x<W-2;x+=4)if(hs(x,y,710)<.5+(y-20)/40){ g.fillStyle=C[Math.floor(hs(y,x,711)*5)]; g.fillRect(x,y,3,3); } g.fillStyle='#4ff0ff'; g.fillRect(20,6,4,4); g.fillRect(24,6,4,4); g.fillRect(24,10,4,4); } });
      cab('e',11.2,{name:'RAINBOW RUN',body:'#141016',art:'stripes',scr:scr('blocks'),mcol:'#ff8a2a',w:.86,edge:[226,48,74]});
      cab('e',10.1,{name:'GALAXY RAID',body:'#2a1030',art:'#ff3ca8',scr:scr('raid'),mcol:'#ff7ad8',edge:[255,60,168]});
      cab('e',6.4,{name:'MAZE',body:'#1a2050',art:'#2a7bff',scr:scr('maze'),mcol:'#ffe83c'});
      cab('e',5.4,{name:'PADDLES',body:'#202024',art:'#e8f0ff',scr:scr('paddles')});
      cab('f',5.4,{name:'ROAD 85',body:'#2a1a12',art:'#ff8a2a',scr:scr('taksi'),mcol:'#ff8a2a',edge:[255,138,42]});
      cab('f',6.3,{name:'BLOCKS',body:'#14301a',art:'#5aff6a',scr:scr('blocks'),mcol:'#5aff6a'});
      cab('f',8.7,{name:'RAID II',body:'#141016',art:'#4ff0ff',scr:scr('raid'),mcol:'#4ff0ff',w:.66});
      cab('f',9.5,{name:'MAZE II',body:'#141016',art:'#ffe83c',scr:scr('maze'),mcol:'#ffe83c',w:.66});
      cab('w',4.2,{name:'TELEMAK',body:'#1a1a2a',art:'#2a7bff',scr:scr('raid'),mbg:'#2a7bff',edge:[42,123,255]});
      cab('w',5.15,{name:'TELEMAK II',body:'#1a1a2a',art:'#e2304a',scr:scr('paddles'),mbg:'#2a7bff',edge:[226,48,74]});
      cab('w',6.25,{name:'ISTANBUL TAKSI',body:'#ffd21c',art:'check',scr:scr('taksi'),mbg:'#ffd21c',mcol:'#141016',trim:[216,168,18],w:.86});
      { const vort=pic(32,48,(g,W,H)=>{ g.fillStyle='#0a0418'; g.fillRect(0,0,W,H); const C=['#a46bff','#4ff0ff','#ff4fd8','#ffffff'];
          for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const d=Math.hypot((x-16)/.7,y-20); if(d<20&&Math.floor(d/2.5)%2===0){ g.fillStyle=C[Math.floor(d/5)%4]; g.fillRect(x,y,1,1); } }
          g.fillStyle='#1e6a3a'; g.fillRect(0,40,W,8); g.fillStyle='#5aff6a'; for(let k=0;k<6;k++)g.fillRect(2+k*5,37+(k%2)*2,4,4); g.fillStyle='#fff'; for(let k=0;k<14;k++)g.fillRect(Math.floor(hs(k,1,712)*W),Math.floor(hs(k,2,712)*34),1,1); });
        const [x,y]=wallAt.pw(2.6), hw=.75*S, fx=x-.5*S;
        thing('the portal',[bx(fx,y-hw,x,y+hw,0,2.4*ZM,[16,24,32]),pb(bx(fx-.03,y-.55*S,fx,y+.55*S,.2*ZM,2.1*ZM,[10,4,24],{em:1}),'w',vort),
          ...[[y-.6*S,y-.55*S],[y+.55*S,y+.6*S]].map(([a,b])=>bx(fx-.05,a,fx,b,.15*ZM,2.15*ZM,[158,246,255],{em:1})),bx(fx-.05,y-.6*S,fx,y+.6*S,2.1*ZM,2.15*ZM,[158,246,255],{em:1}),bx(fx-.05,y-.6*S,fx,y+.6*S,.15*ZM,.2*ZM,[158,246,255],{em:1}),
          pb(bx(fx-.04,y-.65*S,fx,y+.65*S,2.2*ZM,2.44*ZM,[14,58,68],{em:1}),'w',pic(56,10,(g)=>{ g.fillStyle='#0e3a44'; g.fillRect(0,0,56,10); ctxt(g,'SIMULATIONS',28,3,1,'#e8ffff'); }))]);
        lamp(10,2.6,1.3,5,[.55,.38,1]); }
      sign('neon ARCADE','b',5.6,2.55,'ARCADE','#ff4f9a','#ffe0ee',4,.024,'#ffe0a0');
      sign('neon ARENA','b',1.4,2.6,'ARENA','#ff3c3c','#ffd0c0',2,.024);
      onWall('arena door','b',1.4,0,2.3,1.2,(u,v)=>(u<.08||u>.92||v<.05)?[58,36,22]:v>.7?[208,112,64]:(u>.52&&u<.62&&v>.25&&v<.62)?[58,36,22]:[255,176,112],{em:1,t:.08});
      const rows=(title,tc,lines)=>pic(96,54,(g,W,H)=>{ g.fillStyle='#0a0c22'; g.fillRect(0,0,W,H); txt(g,title,4,3,1,tc); lines.forEach((L,i)=>{ txt(g,L[0],5,12+i*8,1,L[1]); g.fillStyle='#ffe83c'; g.fillRect(70,12+i*8,Math.round(22*(1-i*.15)),4); }); });
      onWall('screen: newsroom','e',12.2,2.12,3.18,1.9,rows('MARKET NEWSROOM','#ff4fd8',[['PERF UP 12 FPS','#5aff6a'],['NEW SHOP','#e8f0ff'],['RAIN TONIGHT','#4ff0ff'],['HIGH SCORE','#ff8a2a'],['LIVE MUSIC','#e8f0ff']]),{em:1,t:.08});
      onWall('screen: high scores','e',9.9,2.12,3.18,1.9,rows('HIGH SCORES','#ffe83c',[['1 BRALYNN','#ff4fd8'],['2 FOX','#4ff0ff'],['3 MOTH','#5aff6a'],['4 GHOST','#e8f0ff'],['5 OCTO','#ff8a2a']]),{em:1,t:.08});
      onWall('screen: league','pw',4.7,2.4,3.1,1.7,rows('TELEMAK LEAGUE','#4ff0ff',[['RED 12 9','#ff4f6a'],['BLUE 11 10','#2a7bff'],['GOLD 8 12','#ffe83c']]),{em:1,t:.08});
      onWall('poster: no cloud','pw',7.3,1.25,2.25,.8,pic(32,40,(g,W,H)=>{ g.fillStyle='#14121a'; g.fillRect(0,0,W,H); g.fillStyle='#e8e8f0'; g.fillRect(9,10,14,6); g.fillRect(12,7,6,3); g.fillRect(18,8,3,2);
        g.fillStyle='#e2304a'; for(let i=0;i<20;i++)g.fillRect(6+i,22-i,2,2); txt(g,'NO',10,27,1,'#e8e8f0'); txt(g,'CLOUD',6,33,1,'#e8e8f0'); }),{t:.03});
      onWall('chalkboard','pw',7.6,2.55,3.15,.9,pic(36,24,(g,W,H)=>{ g.fillStyle='#5a3a22'; g.fillRect(0,0,W,H); g.fillStyle='#1e3a2a'; g.fillRect(2,2,W-4,H-4); txt(g,'IT WORKS',2,3,1,'#e8f0e0'); txt(g,'ON MY',8,10,1,'#e8f0e0'); txt(g,'MACHINE',4,17,1,'#e8f0e0'); }),{t:.03});
      onWall('dartboard','pw',8.1,1.5,1.98,.48,pic(24,24,(g,W,H)=>{ for(let y=0;y<H;y++)for(let x=0;x<W;x++){ const d=Math.hypot(x-11.5,y-11.5), a=Math.floor((Math.atan2(y-11.5,x-11.5)+Math.PI)/(Math.PI/10)); if(d>11.5)continue;
        g.fillStyle=d<1.5?'#c8202a':d<3?'#1e8a3a':(d>6&&d<7.5)||(d>10)?(a%2?'#c8202a':'#1e8a3a'):(a%2?'#e8dcc0':'#141414'); g.fillRect(x,y,1,1); } }),{t:.03,c:[12,12,12]});
      const bag=(x,z,c,s=1)=>{ const r=.42*s*S, X0=mx(x), Y0=my(z); thing('bean bag',[bx(X0-r,Y0-r*1.08,X0+r,Y0+r*1.08,0,.12*ZM*s,sh(c,.85)),bx(X0-r*.85,Y0-r*.95,X0+r*.85,Y0+r*.95,.12*ZM*s,.22*ZM*s,c),bx(X0-r*.55,Y0-r*.7,X0+r*.55,Y0+r*.2,.22*ZM*s,.4*ZM*s,sh(c,1.1))]); };
      bag(6.4,6.8,[224,48,106]); bag(7.3,7.2,[42,90,216]); bag(3.4,8.8,[122,42,208]); bag(3.9,7.9,[216,154,42],.9);
      thing('low table',[mb(3.7,10.05,4.7,10.75,0,.36,[58,36,22],{top:()=>[90,58,38]}),...[[3.95,10.3,[226,48,74]],[4.3,10.55,[232,220,192]],[4.5,10.2,[216,154,42]]].map(([x,z,c])=>mb(x-.04,z-.04,x+.04,z+.04,.36,.47,c))],{high:1});
      { const [x,y]=wallAt.pw(10.2), J=pic(40,48,(g,W,H)=>{ g.fillStyle='#4a2a1a'; g.fillRect(0,0,W,H); const C=['#ff3c3c','#ff8a2a','#ffe83c','#5aff6a','#3cf0ff','#a46bff'];
          for(let y=0;y<H;y++)for(let x_=0;x_<W;x_++){ const d=Math.hypot(x_-19.5,Math.max(0,20-y)); const i=Math.floor((19-d)/1.5); if(d<19&&i>=0&&i<6&&(y<20||x_<5||x_>34)&&y<44){ g.fillStyle=C[i]; g.fillRect(x_,y,1,1); } }
          g.fillStyle='#ffe8c0'; g.fillRect(10,22,20,5); g.fillStyle='#1a120c'; g.fillRect(10,30,20,12); g.fillStyle='#8a6a40'; for(let y=31;y<42;y+=2)g.fillRect(11,y,18,1); });
        const fx=x-.5*S, hw=.4*S; thing('jukebox',[bx(fx,y-hw,x,y+hw,0,1.0*ZM,[74,42,26]),bx(fx+.05,y-hw*.85,x,y+hw*.85,1.0*ZM,1.22*ZM,[74,42,26]),bx(fx+.1,y-hw*.55,x,y+hw*.55,1.22*ZM,1.36*ZM,[74,42,26]),
          pb(bx(fx-.02,y-hw*.95,fx,y+hw*.95,.05*ZM,1.3*ZM,[74,42,26],{em:1}),'w',J)]); }
      for(const x of [3.4,7.6])thing('neon strip',[mb(x-.03,1,x+.03,13,3.42,3.48,lit([176,77,255]),{em:1})],{high:1});
      lamp(4,4.5,3.2,10,[.9,.46,1.45]); lamp(8,9.5,3.2,10,[.9,.46,1.45]); lamp(5.6,1.2,2.4,4.5,[1,.32,.62]);

      thing('counter',[mb(11.8,1.75,18.8,2.35,0,1.0,wood,{top:()=>[30,20,14],fs:(nx,ny,P,Q,z,s)=>sh((Math.floor((ny?P:Q)*24)%6===0)?[70,46,30]:wood,s)}),mb(11.75,1.7,18.85,2.4,1.0,1.05,[30,20,14]),mb(11.8,2.35,18.8,2.38,.04,.08,lit([255,176,80]),{em:1})]);
      thing('back counter',[mb(11.7,0,19.0,.6,0,.9,dkw,{top:()=>[106,106,112]})]);
      thing('espresso machine',[mb(12.6,.1,13.2,.5,.9,1.32,[192,32,42],{top:()=>steel}),mb(12.66,.48,12.76,.56,1.0,1.08,steel),mb(13.04,.48,13.14,.56,1.0,1.08,steel),...[0,1,2,3].map(i=>mb(12.62+i*.15,.2,12.68+i*.15,.3,1.32,1.4,[232,224,216]))],{high:1});
      thing('grinder',[mb(13.5,.2,13.72,.42,.9,1.3,[32,32,36]),mb(13.52,.22,13.7,.4,1.3,1.46,[90,58,34])],{high:1});
      thing('syrups',[[16.6,[90,255,106]],[16.75,[255,60,168]],[16.9,[60,240,255]],[17.05,[255,232,60]]].map(([x,c])=>mb(x-.035,.2,x+.035,.27,.9,1.12,lit(c),{em:1})),{high:1});
      { const [x,y]=wallAt.b(19.45), F=pic(20,40,(g,W,H)=>{ g.fillStyle='#bfe8ff'; g.fillRect(0,0,W,H); for(let r=0;r<4;r++){ g.fillStyle='#8aa0b0'; g.fillRect(0,r*10+9,W,1); for(let i=0;i<5;i++){ g.fillStyle=['#e2304a','#ff8a2a','#5aff6a','#2a7bff'][(i+r)%4]; g.fillRect(2+i*4,r*10+3,2,6); } } });
        thing('fridge',[mb(19.05,0,19.85,.7,0,1.9,[216,216,220]),pb(mb(19.12,.7,19.78,.72,.15,1.75,[191,232,255],{em:1}),'f',F),mb(19.12,.7,19.78,.72,1.78,1.88,[42,123,255],{em:1})]); }
      thing('shelves',[mb(12.7,0,17.7,.24,1.48,1.52,dkw),mb(12.7,0,17.7,.24,1.83,1.87,dkw),...Array.from({length:22},(_,i)=>{ const x=12.9+i*.22, y=i%2?1.52:1.87, h=.1+hs(i,3,713)*.14; return mb(x,.06,x+.09,.15,y,y+h,[[138,74,42],[42,90,58],[200,176,144],[58,42,90],[216,160,32]][i%5]); })],{high:1});
      const menu=(name,u,head,tc,L)=>onWall(name,'b',u,1.95,2.8,1.3,pic(60,40,(g,W,H)=>{ g.fillStyle='#0c0c10'; g.fillRect(0,0,W,H); txt(g,head,3,3,1,tc); L.forEach(([a,b],i)=>{ txt(g,a,3,11+i*6,1,'#e8e8f0'); txt(g,b,W-3-tw(b,1),11+i*6,1,'#5aff6a'); }); }),{em:1,t:.05});
      menu('menu: coffee',15.2,'COFFEE','#ffe83c',[['ESPRESSO','2'],['LATTE','3'],['FLAT WHITE','3'],['MOCHA','4'],['CHAI','3']]);
      menu('menu: food',16.6,'FOOD','#ff4fd8',[['TOAST','2'],['BAGEL','2'],['PIE','3'],['SOUP','4'],['COOKIE','1']]);
      sign('neon COFFEE','b',13.1,3.05,'COFFEE','#3cff7a','#d8ffe0',3,.024);
      const clock=(wl,u,h)=>onWall('clock',wl,u,h-.22,h+.22,.44,pic(20,20,(g)=>{ for(let y=0;y<20;y++)for(let x=0;x<20;x++){ const d=Math.hypot(x-9.5,y-9.5); if(d<10){ g.fillStyle=d>8.6?'#3a2a1a':'#e8dcc0'; g.fillRect(x,y,1,1); } } g.fillStyle='#3a2a1a'; g.fillRect(9,4,2,6); g.fillRect(10,9,5,2); }),{t:.04});
      clock('b',11.95,2.5); clock('w',12.2,3.0);
      for(const x of [12.6,14.3,16.0,17.7]){ thing('pendant lamp',[mb(x-.01,1.99,x+.01,2.01,2.75,3.6,blk),mb(x-.08,1.92,x+.08,2.08,2.68,2.75,[232,224,208]),mb(x-.2,1.8,x+.2,2.2,2.56,2.68,[232,224,208]),mb(x-.3,1.7,x+.3,2.3,2.48,2.56,[232,224,208]),mb(x-.07,1.93,x+.07,2.07,2.42,2.5,[255,240,200],{em:1})],{high:1}); }
      lamp(13.4,2.2,2.4,10,[1.9,1.36,.76]); lamp(16.9,2.2,2.4,10,[1.9,1.36,.76]);
      const stool=(x,z,h=.75)=>thing('stool',[mb(x-.19,z-.19,x+.19,z+.19,h-.06,h,[138,106,68],{top:(X_,Y_)=>Math.hypot(X_-mx(x),Y_-my(z))>.16*S?[110,84,54]:[150,116,76]}),...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,b])=>mb(x+a*.12-.015,z+b*.12-.015,x+a*.12+.015,z+b*.12+.015,0,h-.06,blk)),mb(x-.13,z-.13,x+.13,z+.13,h*.33,h*.36,blk)]);
      for(const x of [12.5,13.7,14.9,16.1,17.3,18.5])stool(x,2.75);
      thing('long table',[mb(12.5,4.75,17.5,5.65,.75,.8,[60,40,28],{top:(X_,Y_)=>Math.floor(Y_*24)%5===0?[44,30,20]:[66,44,30]}),...[[12.7,4.85],[17.3,4.85],[12.7,5.55],[17.3,5.55]].map(([x,z])=>mb(x-.03,z-.03,x+.03,z+.03,0,.75,blk)),
        mb(12.5,4.73,17.5,4.75,.7,.74,lit([255,60,168]),{em:1}),mb(12.5,5.65,17.5,5.67,.7,.74,lit([60,200,255]),{em:1})]);
      thing('laptops',[mb(13.23,5.18,13.57,5.42,.8,.82,steel),mb(13.23,5.17,13.57,5.19,.82,1.04,[122,208,255],{em:1}),mb(16.03,4.93,16.37,5.17,.8,.82,steel),mb(16.03,5.16,16.37,5.18,.82,1.04,[122,208,255],{em:1})],{high:1});
      thing('mugs',[[14.4,5.0,[226,48,74]],[15.2,5.35,[232,224,216]],[16.8,5.4,[42,42,46]]].map(([x,z,c])=>mb(x-.04,z-.04,x+.04,z+.04,.8,.9,c)),{high:1});
      for(const x of [13,14.4,15.8,17.1])for(const z of [4.3,6.1])stool(x,z,.46);
      { const HX=pic(40,40,(g,W,H)=>{ g.fillStyle='#1e4a2a'; g.fillRect(0,0,W,H); g.fillStyle='#d8c890'; g.fillRect(2,2,W-4,H-4); g.fillStyle='#1e4a2a'; g.fillRect(4,4,W-8,H-8); const C=['#e2604a','#d8a020','#5aaa4a','#c8b070','#8a5a3a','#5a8a4a'];
          for(let r=0;r<5;r++){ const n=5-Math.abs(r-2); for(let i=0;i<n;i++){ const cx=20+(i-(n-1)/2)*6, cy=8+r*6; g.fillStyle=C[(r*3+i*5)%6]; for(let y=-2;y<=2;y++)g.fillRect(Math.round(cx-3+Math.abs(y)*.5),Math.round(cy+y),6-Math.abs(y),1); } } });
        const t0=mx(15.35), t1=mx(16.05), u0=my(9.05), u1=my(9.75);
        thing('table with a board game',[mb(15.2,8.9,16.2,9.9,.74,.79,[58,36,22],{top:(X_,Y_)=>X_>t0&&X_<t1&&Y_>u0&&Y_<u1?HX((X_-t0)/(t1-t0),(Y_-u0)/(u1-u0)):[58,36,22]}),mb(15.66,9.36,15.74,9.44,0,.74,blk),mb(15.45,9.15,15.95,9.65,0,.03,blk),
          ...[[15.5,9.3,[58,90,255]],[15.8,9.5,[17,17,17]],[15.7,9.2,[255,60,60]]].map(([x,z,c])=>mb(x-.015,z-.015,x+.015,z+.015,.79,.85,c)),mb(15.95,9.0,16.05,9.1,.79,.9,[240,236,228])]);
        stool(15.7,10.3,.46); stool(15.7,8.5,.46); }
      bag(18.6,7.4,[26,160,160]); bag(18.9,8.6,[106,42,208]); bag(18.4,11.3,[26,160,160]);
      const crt=(u,k,stand)=>{ const x=mx(19.55), y=my(u), h0=stand?.5:.62, P=k==='bars'?pic(14,10,(g)=>{ ['#ffffff','#ffe83c','#3cf0ff','#5aff6a','#ff3ca8','#ff3c3c','#2a3aff'].forEach((c,i)=>{ g.fillStyle=c; g.fillRect(i*2,0,2,7); }); g.fillStyle='#111'; g.fillRect(0,7,14,3); }):scr('paddles');
        thing('old TV',[stand?bx(x-.25*S,y-.45*S,x+.25*S,y+.45*S,0,.5*ZM,[42,26,18]):bx(x-.03*S,y-.03*S,x+.03*S,y+.03*S,0,.62*ZM,blk),bx(x-.25*S,y-.3*S,x+.25*S,y+.3*S,h0*ZM,(h0+.5)*ZM,[138,132,120]),pb(bx(x-.27*S,y-.23*S,x-.25*S,y+.23*S,(h0+.08)*ZM,(h0+.44)*ZM,[60,60,60],{em:1}),'w',P),
          bx(x-.02,y-.15*S,x+.02,y-.13*S,(h0+.5)*ZM,(h0+.68)*ZM,blk),bx(x-.02,y+.13*S,x+.02,y+.15*S,(h0+.5)*ZM,(h0+.68)*ZM,blk)]); };
      crt(6.0,'bars',true); crt(10.1,'paddles',false);
      onWall('cork board','w',8.2,1.19,2.11,1.7,pic(80,44,(g,W,H)=>{ g.fillStyle='#5a3a22'; g.fillRect(0,0,W,H); g.fillStyle='#b08a5a'; g.fillRect(2,2,W-4,H-4); g.fillStyle='#e8e4dc'; g.fillRect(26,3,28,7); txt(g,'NOTES',30,4,1,'#3a3a3a');
        const NC=['#ff8ab8','#8ad8ff','#c8f08a','#ffe88a']; for(let r=0;r<3;r++)for(let i=0;i<7;i++){ if(hs(r,i,714)<.12)continue; g.fillStyle=NC[(r+i*3)%4]; const x=4+i*10.5, y=12+r*10; g.fillRect(Math.round(x),y,9,8); g.fillStyle='rgba(40,40,60,.6)'; g.fillRect(Math.round(x)+1,y+2,6,1); g.fillRect(Math.round(x)+1,y+4,4,1); } }),{t:.05});
      sign('neon NO BUGS','w',8.6,3.3,'NO BUGS IN HERE','#ff3ca8','#ffd8ec',2,.022);
      sign('neon FEATURES','w',7.6,2.95,'ONLY UNDOCUMENTED FEATURES','#3cc8ff','#d8f4ff',2,.02);
      sign('neon 1 PERSON','w',7.8,2.55,'1 PERSON IN THE CAFE','#ffc83c','#fff4d0',2,.02);
      onWall('hall of fame','pe',5.2,1.2,2.7,1.2,pic(48,60,(g,W,H)=>{ g.fillStyle='#160c22'; g.fillRect(0,0,W,H); ctxt(g,'HALL OF',24,3,1,'#ff4fd8'); ctxt(g,'FAME',24,9,1,'#ff4fd8');
        const C=['#ff3c3c','#ff8a2a','#ffe83c','#5aff6a','#3cf0ff','#a46bff']; ['BRALYNN','THE FOX','OCTO','MOTH','GHOST','SQUIRREL'].forEach((n,i)=>{ g.fillStyle=C[i]; g.fillRect(3,17+i*7,2,5); txt(g,n,7,17+i*7,1,'#e8e8f0'); }); }),{em:1,t:.06});
      sign('neon EXIT','f',11.0,2.4,'EXIT','#ff2a2a','#ffc0c0',2,.02);
      thing('window bench',[mb(11.7,13.25,19.6,13.8,0,.45,[110,74,44],{top:(X_,Y_)=>Math.floor(X_*24)%5===0?[84,56,34]:[124,84,50]})]);
      thing('cushion',[mb(11.75,13.3,12.4,13.75,.45,.6,[26,160,160])],{high:1});
      thing('potted plant',[mb(11.2,13.2,11.7,13.75,0,.45,[176,96,58]),...Array.from({length:9},(_,i)=>{ const a=i*2.4, r=.08+hs(i,4,715)*.15, x=11.45+Math.cos(a)*r, z=13.47+Math.sin(a)*r, h=.5+hs(i,5,715)*.4; return mb(x-.08,z-.06,x+.08,z+.06,h,h+.1,i%2?[46,122,58]:[62,154,74]); })]);
      lamp(15.6,7.6,2.4,11,[1.8,1.2,.6]);
      const mul=[]; for(const [a,b,h0,h1] of OP){ for(const u of [a,b])mul.push(mb(u-.04,13.9,u+.04,14,h0,h1,blk)); mul.push(mb(a,13.9,b,14,h1-.04,h1+.04,blk),mb(a-.04,13.9,b+.04,14.05,h0-.06,h0+.02,[90,58,38]));
        const n=Math.max(1,Math.round((b-a)/2)); for(let i=1;i<n;i++)mul.push(mb(a+(b-a)*i/n-.03,13.9,a+(b-a)*i/n+.03,14,h0,h1,blk)); }
      thing('window frames',mul,{high:1});

      const S0=B.y1, pave=(x,y)=>{ const r=Math.floor((y-S0)*24/6), i=Math.floor((x*24+(r%2)*6)/12); return (Math.floor(y*24)%6===0||Math.floor(x*24+(r%2)*6)%12===0)?[60,62,70]:sh([100,102,112],.85+.25*hs(i,r,716)); };
      flat(B.x0-14,S0,B.x1+14,S0+4,.4,pave,'L');
      const road=(x,y)=>{ const v=y-(S0+4), px=Math.floor(x*24); if(v<.1||v>7.4)return [200,160,48]; if(Math.abs(v-3.75)<.06&&px%16<9)return [200,160,48]; if(x>mx(6)&&x<mx(9.5)&&px%10<6)return [216,216,220]; const r=hs(px,Math.floor(y*24),717); return r<.4?[39,41,48]:r<.8?[46,48,56]:[54,56,64]; };
      flat(B.x0-14,S0+4,B.x1+14,S0+11.5,.1,road,'L'); flat(B.x0-14,S0+11.5,B.x1+14,S0+15,.4,pave,'L');
      thing('kerb',[bx(B.x0-14,S0+3.9,B.x1+14,S0+4.1,0,4,[122,124,132])],{walk:1});
      const win=(x,y,z,f)=>{ const i=Math.floor(x*24/40), r=Math.floor(z/50); return (Math.floor(x*24)%40>12&&Math.floor(x*24)%40<30&&z%50>16&&z%50<38)?(hs(i,r,718)<.22?lit([216,184,120]):[28,30,38]):sh([58,60,70],f); };
      const far=[[B.x0-14,B.x0+2,420],[B.x0+2,B.x0+10,330],[B.x0+22,B.x1+14,480]].map(([a,b,h])=>bx(a,S0+15,b,S0+21,0,h,[58,60,70],{fs:(nx,ny,P,Q,z,s)=>ny<0?win(P,0,z,s):sh([58,60,70],s)}));
      const E=pic(120,44,(g,W,H)=>{ g.fillStyle='#e8eef4'; g.fillRect(0,0,W,H); for(let r=0;r<4;r++)for(let i=0;i<28;i++){ g.fillStyle=['#c84a4a','#4a7ac8','#e8e0d0','#5aa85a'][(i+r)%4]; g.fillRect(6+i*3,8+r*8,2,5); } g.fillStyle='#c8c8cc'; g.fillRect(92,24,24,16); });
      const ES=pic(64,10,(g)=>{ g.fillStyle='#f4f4f8'; g.fillRect(0,0,64,10); g.fillStyle='#d8202a'; g.fillRect(2,1,8,8); txt(g,'E',5,3,1,'#fff'); txt(g,'ECZANE',18,3,1,'#d8202a'); });
      const ph0=B.x0+10, ph1=B.x0+22;
      thing('the street across',[...far,bx(ph0,S0+15,ph1,S0+21,0,380,[64,66,76]),pb(bx(ph0+1.5,S0+14.96,ph1-1.5,S0+15,4,4+2.2*ZM,[232,238,244],{em:1}),'b',E),pb(bx(ph0+2,S0+14.9,ph1-2,S0+15,2.6*ZM,3.0*ZM,[244,244,248],{em:1}),'b',ES),
        bx(ph0+1.4,S0+14.4,ph1-1.4,S0+15,2.45*ZM,2.55*ZM,[42,42,48]),bx(ph0-.1,S0+14.7,ph0+.1,S0+14.9,3.2*ZM,3.6*ZM,lit([216,32,42]),{em:1})],{high:1});
      const post=(x,y)=>[bx(x-.1,y-.1,x+.1,y+.1,0,4.6*ZM,[42,44,50]),bx(x-1.3,y-.05,x,y+.05,4.5*ZM,4.6*ZM,[42,44,50]),bx(x-1.5,y-.2,x-1.0,y+.2,4.35*ZM,4.5*ZM,[255,224,176],{em:1})];
      thing('lamp posts',[...post(mx(18.4),S0+3.2),...post(B.x1+8,S0+11.9),...post(B.x0-6,S0+11.9)],{solids:[{x0:mx(18.4)-.12,y0:S0+3.08,x1:mx(18.4)+.12,y1:S0+3.32}]});
      LAMPS.push({own:1,x:mx(18.4)-1.25,y:S0+3.2,z:4.3*ZM,r:14,c:[1,.78,.5]});
      const tx_=mx(4.5), ty=S0+2.6, leaves=[]; for(let k=0;k<14;k++){ const x=tx_+(hs(k,1,719)-.5)*2.4, y=ty+(hs(k,2,719)-.5)*2, z=(3+hs(k,3,719)*1.6)*ZM, r=.5+hs(k,4,719)*.5; leaves.push(bx(x-r,y-r,x+r,y+r,z,z+r*30,[30,42,38])); }
      thing('tree',[bx(tx_-.12,ty-.12,tx_+.12,ty+.12,0,3.2*ZM,[58,44,34]),...leaves],{solids:[{x0:tx_-.15,y0:ty-.15,x1:tx_+.15,y1:ty+.15}]});
    },{holes:{f:OP.map(([a,b,h0,h1])=>({a0:mx(a),a1:mx(b),z0:h0*ZM,z1:h1*ZM}))},xw:[['part','y',PX,B.y0+.1,my(8.4),1,[],true]]});
    const pl=K.planes['Warcade:f'], drops=(w,h,seed)=>{ const c=document.createElement('canvas'); c.width=Math.ceil(w*48); c.height=Math.ceil(h*2); const g=c.getContext('2d');
      for(let k=0;k<w*h*1.6;k++){ const x=Math.floor(hs(k,seed,720)*c.width), y=Math.floor(hs(k,seed,721)*c.height), r=hs(k,seed,722)<.8?1:2; g.fillStyle='#46587a'; g.fillRect(x,y,r+1,r+1); g.fillStyle='#e6ecfa'; g.fillRect(x,y,1,1); }
      for(let k=0;k<w*1.2;k++){ const x=Math.floor(hs(k,seed,723)*c.width), y=Math.floor(hs(k,seed,724)*c.height*.6); g.fillStyle='#5a6a88'; g.fillRect(x,y,1,Math.floor((c.height-y)*hs(k,seed,725))); }
      const t=new THREE.CanvasTexture(c); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; return t; };
    const glassM=new THREE.MeshBasicMaterial({color:0x8a9ab4,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide,clippingPlanes:pl?[pl]:[]});
    OP.forEach(([a,b,h0,h1],i)=>{ const w=(b-a)*S, geo=new THREE.PlaneGeometry(w*TILE,Y((h1-h0)*ZM)-Y(0)), at=[X(mx((a+b)/2)),(Y(h0*ZM)+Y(h1*ZM))/2,Z(B.y1-.02)];
      for(const m of [new THREE.Mesh(geo,glassM),new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:drops(w,(h1-h0)*ZM,i),alphaTest:.5,side:THREE.DoubleSide,clippingPlanes:pl?[pl]:[]}))]){ m.position.set(...at); m.renderOrder=5; scene.add(m); } });
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry((B.x1-B.x0)*TILE,(B.y1-B.y0)*TILE).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:0x15101e})); ceil.position.set(X((B.x0+B.x1)/2),Y(B.h-1),Z((B.y0+B.y1)/2)); ceil.visible=false; scene.add(ceil);
    const LOT={x0:X(B.x0-14),x1:X(B.x1+14),z0:Z(B.y0-6),z1:Z(B.y1+15)}, on=()=>LVL==='up'&&pos.x>LOT.x0&&pos.x<LOT.x1&&pos.z>LOT.z0&&pos.z<LOT.z1;
    if(window.WX){ const at0=WX.at; WX.at=t=>{ const w=at0(t); return on()?Object.assign({},w,{cloud:1,rain:.8,storm:0,snow:0,fog:0,wind:Math.max(.2,w.wind||0)}):w; }; }
    const FG=new THREE.Fog(0x2a2e3a,2,200), V3=new THREE.Vector3(); let was=false;
    const tick0=CLOCK.tick; CLOCK.tick=dt=>{ tick0(dt); const here=on(); ceil.visible=here&&UI.persp&&R.inside(pos.x,pos.z);
      if(!here){ if(was){ was=false; if(scene.fog===FG)scene.fog=null; } return; } was=true;
      if(window.FAR3&&FAR3.mesh){ FAR3.mesh.visible=false; if(FAR3.panels)FAR3.panels.visible=false; }
      if(ROOMS.cur){ if(scene.fog===FG)scene.fog=null; return; }
      const d=-V3.copy(pos).applyMatrix4(cam.matrixWorldInverse).z; if(typeof MISTE!=='undefined')MISTE.x=0; FG.near=d+8*TILE; FG.far=d+44*TILE; scene.fog=FG; scene.background.copy(FG.color); }; });
});
