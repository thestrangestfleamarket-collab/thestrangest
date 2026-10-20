const STEEL=[96,98,104], STEELD=[70,72,78], YH=[206,164,30], CONC=[150,146,138], ROADC=[64,64,70], DARK=[22,22,24];
const glow=c=>Object.assign([...c],{e:1});
const SIGNAL=()=>{ const t=(performance.now()/1000)%60; return {main:t<28?0:t<32?1:2,cross:t<34?2:t<56?0:1}; };
const lifeOn=()=>typeof LIFE!=='undefined'&&LIFE.mode===1;
const flipOf=f=>f[1]<0||f[0]>0?1:0;
const faceArt=(b,f,A,W,zt,back)=>sided({...b,fs:(nx,ny,X,Y,zr)=>{ if(nx!==f[0]||ny!==f[1])return back; const along=f[0]?Y:X, a0=f[0]?b.y0:b.x0, len=f[0]?b.y1-b.y0:b.x1-b.x0, u=flipOf(f)?a0+len-along:along-a0;
  return A(Math.floor(u*FP-(len*FP-W)/2),Math.floor(zt-(zr+b.z0))); }});
MK.signal=(x,y,arm,heads,grp,peds=[])=>{ '@later'; PNAME='traffic signal'; const bs=[Bx(x-.08,y-.08,x+.08,y+.08,0,156,STEEL,{fj:(u,z)=>z<10?STEELD:STEEL}),Bx(x-.1,y-.1,x+.1,y+.1,156,159,STEELD,{foot:0})];
  if(arm){ const [ax,ay]=arm; bs.push(Bx(Math.min(x,ax)-.03,Math.min(y,ay)-.03,Math.max(x,ax)+.03,Math.max(y,ay)+.03,150,153,STEEL,{foot:0,nb:1})); }
  const head=(hx,hy,z1,f)=>{ const s=.2, d=.08, X0=f[0]?hx-d:hx-s, X1=f[0]?hx+d:hx+s, Y0=f[0]?hy-s:hy-d, Y1=f[0]?hy+s:hy+d, bp=.29, bk=d+.012;
    bs.push(Bx(X0,Y0,X1,Y1,z1-38,z1,YH,{foot:0,top:()=>sh(YH,.8)}),Bx(hx-.015,hy-.015,hx+.015,hy+.015,z1,z1+3,STEELD,{foot:0,nb:1}));
    bs.push(f[0]?Bx(hx-f[0]*bk-.008,hy-bp,hx-f[0]*bk+.008,hy+bp,z1-42,z1+3,DARK,{foot:0,nb:1}):Bx(hx-bp,hy-f[1]*bk-.008,hx+bp,hy-f[1]*bk+.008,z1-42,z1+3,DARK,{foot:0,nb:1}));
    [[255,52,40],[255,190,40],[60,230,120]].forEach((c,i)=>{ const z0=z1-12*(i+1), z9=z0+10, zc=z0+5, o=f[0]?{x0:f[0]>0?X1:X0-.012,x1:f[0]>0?X1+.012:X0,y0:hy-.17,y1:hy+.17}:{y0:f[1]>0?Y1:Y0-.012,y1:f[1]>0?Y1+.012:Y0,x0:hx-.17,x1:hx+.17};
      const round=(X,Y,z)=>{ const du=((f[0]?Y-hy:X-hx)*FP), dz=z+z0-zc+.5; return du*du+dz*dz<=18; };
      bs.push(sided({...o,z0,z1:z9,c:DARK,foot:0,nb:1,fs:(nx,ny,X,Y,z,k)=>nx===f[0]&&ny===f[1]?(round(X,Y,z)?sh(c,.22):sh(YH,k)):sh(YH,k),top:()=>YH}));
      bs.push(sided({...o,z0,z1:z9,c:DARK,foot:0,nb:1,life:1,top:()=>null,fs:(nx,ny,X,Y,z)=>{ if(!lifeOn()||nx!==f[0]||ny!==f[1]||!round(X,Y,z))return null; const s=SIGNAL()[grp]; return 2-s===i?glow(c):null; }}));
      const v=f[0]?{x0:f[0]>0?X1:X0-.08,x1:f[0]>0?X1+.08:X0,y0:hy-.17,y1:hy+.17}:{y0:f[1]>0?Y1:Y0-.08,y1:f[1]>0?Y1+.08:Y0,x0:hx-.17,x1:hx+.17};
      bs.push(Bx(v.x0,v.y0,v.x1,v.y1,z9,z9+2,DARK,{foot:0,nb:1})); }); };
  for(const h of heads){ head(h.at[0],h.at[1],148,h.f); head(x+h.f[0]*.2,y+h.f[1]*.2,128,h.f); }
  const AW=art(16,18,put=>txt(put,'WALK',0,7,[244,244,238],1)), AD=art(16,18,put=>{ txt(put,'DONT',0,3,[255,120,40],1); txt(put,'WALK',0,11,[255,120,40],1); });
  for(const q of peds){ const f=q.f, w=16/FP/2, c=[x+f[0]*.16,y+f[1]*.16], b={x0:f[0]?c[0]-.05:c[0]-w,x1:f[0]?c[0]+.05:c[0]+w,y0:f[0]?c[1]-w:c[1]-.05,y1:f[0]?c[1]+w:c[1]+.05,z0:74,z1:92,c:DARK,foot:0};
    bs.push(faceArt({...b,top:()=>DARK},f,()=>DARK,16,92,DARK));
    bs.push(sided({...b,x0:f[0]>0?b.x1:f[0]<0?b.x0-.012:b.x0,x1:f[0]>0?b.x1+.012:f[0]<0?b.x0:b.x1,y0:f[1]>0?b.y1:f[1]<0?b.y0-.012:b.y0,y1:f[1]>0?b.y1+.012:f[1]<0?b.y0:b.y1,nb:1,life:1,top:()=>null,
      fs:(nx,ny,X,Y,zr)=>{ if(!lifeOn()||nx!==f[0]||ny!==f[1])return null; const walk=SIGNAL()[q.on]===2, A=walk?AW:AD, along=f[0]?Y:X, a0=f[0]?b.y0:b.x0, u=flipOf(f)?a0+2*w-along:along-a0, c=A(Math.floor(u*FP),Math.floor(92-(zr+74))); return c?glow(c):null; }})); }
  const p=prop(bs); p.life=()=>{}; p.lifeStill=1; p.lifeKey=()=>{ const s=SIGNAL(); return s.main*3+s.cross; }; return p; };
MK.psign=(x,y,f,W,H,z1,bg,lines,post=true)=>{ '@later'; PNAME='street sign'; const w=W/FP/2, A=art(W,H,put=>{ for(let r=0;r<H;r++)for(let q=0;q<W;q++)put(q,r,bg); if(typeof lines==='function')return lines(put,W,H); for(let r=0;r<H;r++)for(let q=0;q<W;q++)if(r===0||q===0||r===H-1||q===W-1)put(q,r,sh(bg,.75)); for(const [s,c,k,yy] of lines)txt(put,s,Math.floor((W-tw(s,k))/2),yy,c,k); });
  const b={x0:f[0]?x-.02:x-w,x1:f[0]?x+.02:x+w,y0:f[0]?y-w:y-.02,y1:f[0]?y+w:y+.02,z0:z1-H,z1,c:bg,foot:0,nb:1}, px=x-f[0]*.05, py=y-f[1]*.05;
  const bs=[faceArt({...b,top:()=>[150,150,154]},f,A,W,z1,[150,150,154])]; if(post)bs.unshift(Bx(px-.025,py-.025,px+.025,py+.025,0,z1-3,STEELD)); return prop(bs); };
const SIGNFACE=(()=>{ const R=[200,36,36], K=[20,20,22];
  const border=(put,W,H,c,i=1)=>{ for(let q=i+1;q<W-i-1;q++){ put(q,i,c); put(q,H-1-i,c); } for(let r=i+1;r<H-i-1;r++){ put(i,r,c); put(W-1-i,r,c); } };
  const mid=(W,s,k)=>Math.floor((W-tw(s,k))/2);
  return {
    noParking:hours=>(put,W,H)=>{ border(put,W,H,R); txt(put,'NO',mid(W,'NO',2),4,R,2); txt(put,'PARKING',mid(W,'PARKING',1),17,R,1); txt(put,hours,mid(W,hours,1),25,R,1);
      const y=H-8, a=5, b=W-6; for(let q=a;q<=b;q++)put(q,y,R); for(let d=1;d<=2;d++){ put(a+d,y-d,R); put(a+d,y+d,R); put(b-d,y-d,R); put(b-d,y+d,R); } },
    speedLimit:n=>(put,W,H)=>{ border(put,W,H,K); txt(put,'SPEED',mid(W,'SPEED',1),4,K,1); txt(put,'LIMIT',mid(W,'LIMIT',1),11,K,1); txt(put,n,mid(W,n,3),18,K,3); },
    noPedestrians:()=>(put,W,H)=>{ border(put,W,H,K); const cx=(W-1)/2, cy=(H-1)/2, r=Math.min(W,H)/2-3;
      const man=[[0,-7],[-1,-7],[1,-7],[0,-8],[0,-6],[0,-5],[0,-4],[0,-3],[0,-2],[0,-1],[-1,-4],[-2,-3],[-3,-2],[1,-4],[2,-3],[3,-3],[0,0],[-1,1],[-2,2],[-2,3],[-3,4],[1,1],[2,2],[2,3],[3,4]];
      for(const [dx,dy] of man)put(Math.round(cx+dx),Math.round(cy+dy+1),K);
      for(let r0=0;r0<H;r0++)for(let q=0;q<W;q++){ const d=Math.hypot(q-cx,r0-cy); if(d<=r&&d>r-2.2)put(q,r0,R); if(d<r-1&&Math.abs((q-cx)-(r0-cy))<1.2)put(q,r0,R); } } }; })();
MK.signFace=SIGNFACE;
MK.gantry=(x,y0,y1,f,panels)=>{ '@later'; PNAME='sign gantry'; const bs=[Bx(x-.08,y0-.08,x+.08,y0+.08,0,176,STEEL),Bx(x-.08,y1-.08,x+.08,y1+.08,0,176,STEEL),Bx(x-.05,y0,x+.05,y1,170,176,STEEL,{foot:0}),Bx(x-.04,y0,x+.04,y1,160,163,STEEL,{foot:0,nb:1})];
  for(const P of panels){ const W=Math.round((P.b-P.a)*FP), H=40, bg=P.bg||[30,110,62], A=art(W,H,put=>{ for(let r=0;r<H;r++)for(let q=0;q<W;q++)put(q,r,(r<1||q<1||r>H-2||q>W-2||r===2||q===2||r===H-3||q===W-3)?[236,236,230]:bg); for(const [s,c,k,yy] of P.lines)txt(put,s,Math.floor((W-tw(s,k))/2),yy,c||[236,236,230],k); });
    bs.push(faceArt({x0:x+f[0]*.06-.03,x1:x+f[0]*.06+.03,y0:P.a,y1:P.b,z0:126,z1:166,c:bg,foot:0,top:()=>[90,92,96]},f,A,W,166,[90,92,96])); }
  return prop(bs,null,{solids:[{x0:x-.08,y0:y0-.08,x1:x+.08,y1:y0+.08},{x0:x-.08,y0:y1-.08,x1:x+.08,y1:y1+.08}]}); };
MK.cobra=(x,y,dy)=>{ '@later'; PNAME='street light'; const ey=y+dy*1.8, bs=[Bx(x-.07,y-.07,x+.07,y+.07,0,148,STEEL,{fj:(u,z)=>z<12?STEELD:STEEL}),Bx(x-.03,Math.min(y,ey),x+.03,Math.max(y,ey),144,147,STEEL,{foot:0,nb:1}),
    Bx(x-.11,ey-.26,x+.11,ey+.26,138,146,[150,150,156],{foot:0,top:()=>[170,170,176]}),Bx(x-.08,ey-.2,x+.08,ey+.2,137,138,[255,206,140],{foot:0,em:1,nb:1})];
  const p=prop(bs); LAMPS.push({x,y:ey,z:136,r:6,c:[1,.78,.5],prop:p}); return p; };
const RW=[214,212,204], RY=[222,184,52];
MK.mark=(x0,y0,x1,y1,f,name)=>{ PNAME=name; return prop([Bx(x0,y0,x1,y1,0,.5,RW,{nb:1,top:(u,v)=>{ const k=f(u-x0,v-y0); return k==='w'?mt('lines',speck(RW,u,v,47)):k==='y'?mt('lines',speck(RY,u,v,49)):null; }})],null,{walk:true}); };
const turnArrow=(a,c)=>{ a=Math.floor(a*8)/8; c=Math.floor(c*8)/8; if(a<0||a>2.3)return false; if(Math.abs(c)<.1&&a<1.6)return true; if(a>=1.6&&Math.abs(c)<.32*(2.3-a)/.7)return true;
  return c>0&&c<.45&&a>=.7&&a<.9||c>=.45&&c<.8&&Math.abs(a-.8)<.32*(.8-c)/.35; };
MK.rail=(x0,y0,x1,y1,z=0)=>{ '@later'; PNAME='railing'; const bs=[], ax=Math.abs(x1-x0)>=Math.abs(y1-y0), L=ax?Math.abs(x1-x0):Math.abs(y1-y0), n=Math.max(1,Math.round(L));
  for(let i=0;i<=n;i++){ const t=i/n, px=x0+(x1-x0)*t, py=y0+(y1-y0)*t; bs.push(Bx(px-.04,py-.04,px+.04,py+.04,z,z+36,STEELD,{foot:z?0:1})); }
  for(const h of [18,33])bs.push(Bx(Math.min(x0,x1)-.02,Math.min(y0,y1)-.02,Math.max(x0,x1)+.02,Math.max(y0,y1)+.02,z+h,z+h+3,STEEL,{foot:0,nb:1}));
  if(z)bs.unshift(FOOT(Math.min(x0,x1),Math.min(y0,y1),Math.max(.05,Math.abs(x1-x0)),Math.max(.05,Math.abs(y1-y0)))); return prop(bs); };
MK.cutseg=(T,ya,yb)=>{ '@later'; PNAME='tunnel cut'; const dep=y=>T.d*(T.y1-y)/(T.y1-T.y0), Z0=-T.d-20, bs=[{...FOOT(T.x0,yb,T.x1-T.x0,ya-yb),nb:1}], m=(T.x0+T.x1)/2;
  const road=(u,v)=>Math.abs(u-m+.14)<.06||Math.abs(u-m-.14)<.06?[214,176,48]:mt('road',[62,63,68]);
  for(let y=yb;y<ya-1e-6;y+=.5){ const z=-Math.round(dep(y+.25)); bs.push(Bx(T.x0+.4,y,T.x1-.4,Math.min(ya,y+.5),z-3,z,ROADC,{foot:0,nb:1,top:road,fi:()=>[54,54,58],fj:(u,zz)=>road(u,y)})); }
  const wall=(u,z)=>{ const j=Math.floor(u*2)!==Math.floor((u+.04)*2)||z>-3; return j?sh(CONC,.8):sh(mt('concrete',CONC),hash(Math.floor(u*8),Math.floor(z/4),71)<.1?.9:1); };
  for(const [a,b] of [[T.x0,T.x0+.4],[T.x1-.4,T.x1]])bs.push(Bx(a,yb,b,ya,Z0,0,CONC,{foot:0,nb:1,top:()=>sh(CONC,1.08),fi:wall,fj:wall}));
  for(let y=Math.ceil(yb/4)*4;y<ya;y+=4)for(const x of [T.x0+.4,T.x1-.4])bs.push(Bx(x-.06,y-.15,x+.06,y+.15,-Math.round(dep(y))+40,-Math.round(dep(y))+44,[240,240,236],{foot:0,em:1,nb:1}));
  if(yb<=T.y0+1e-6){ const W=Math.round((T.x1-T.x0)*FP), H=T.d+20, mw=Math.round((T.x1-T.x0-1.6)*FP), mh=64, mx=Math.round((W-mw)/2), bot=H-20,
      A=art(W,H,put=>{ for(let r=0;r<H;r++)for(let q=0;q<W;q++)put(q,r,(Math.floor(q/12)+Math.floor(r/8))&1?sh(CONC,.9):CONC);
        for(let r=bot-mh;r<bot;r++)for(let q=mx;q<mx+mw;q++){ const k=bot-mh+6-r, cut=k>0?k:0; if(q<mx+cut||q>=mx+mw-cut)continue; put(q,r,r>bot-mh+8?DARK:[34,34,38]); }
        for(let q=mx-2;q<mx+mw+2;q++){ put(q,bot-mh-2,sh(CONC,.7)); put(q,bot-mh-1,sh(CONC,.7)); }
        txt(put,'HUDSON TUNNEL',Math.floor((W-tw('HUDSON TUNNEL',2))/2),bot-mh-16,[236,236,230],2);
        for(const q of [mx-10,mx+mw+6])for(let r=bot-40;r<bot-32;r++)for(let k=0;k<4;k++)put(q+k,r,glow([255,244,220])); });
    bs.push(Bx(T.x0,T.y0,T.x1,T.y0+.4,Z0,0,CONC,{foot:0,nb:1,top:()=>sh(CONC,1.08),fi:wall,fj:(u,z)=>A(Math.floor((u-T.x0)*FP),Math.floor(-z))||CONC})); }
  const p=prop(bs); p.sunk={x0:T.x0,y0:T.y0,x1:T.x1,y1:T.y1}; return p; };
MK.brgseg=(B,ya,yb)=>{ '@later'; PNAME='bridge'; const D=B.deck, bs=[], st=[], so=[], m=(B.x0+B.x1)/2;
  const top=(u,v)=>u<B.x0+1.3||u>B.x1-1.3?mt('concrete',[166,162,154]):Math.abs(u-m+.14)<.06||Math.abs(u-m-.14)<.06?[214,176,48]:mt('road',[62,63,68]);
  const ret=(u,z)=>hash(Math.floor(u*6),Math.floor(z/5),83)<.08?sh(CONC,.88):Math.floor(z/16)!==Math.floor((z+1)/16)?sh(CONC,.8):CONC;
  const surf=y0=>Math.min(D,3*Math.max(1,Math.round((B.y1-y0)*2)));
  for(let y=ya;y>yb+1e-6;y-=.5){ const y0=Math.max(yb,y-.5), z=y0<B.y0-1e-6?D:surf(y0); const over=y0<B.y0-1e-6;
    if(!over){ bs.push(Bx(B.x0,y0,B.x1,y,0,z,CONC,{top,fi:ret,fj:(u,zz)=>zz>z-4?sh(top(u,y0),.86):ret(u,zz)})); if(y0<=B.y0+1e-6)so.push({x0:B.x0,y0:B.y0,x1:B.x1,y1:B.y0+.3,z0:0,z1:D-16}); }
    else bs.push(Bx(B.x0,y0,B.x1,y,D-12,D,CONC,{foot:0,top,fi:()=>sh(CONC,.8),fj:()=>sh(CONC,.7)}));
    for(const [a,b] of [[B.x0,B.x0+.3],[B.x1-.3,B.x1]]){ bs.push(Bx(a,y0,b,y,z,z+18,CONC,{foot:0,top:()=>sh(CONC,1.1),fi:ret,fj:ret})); so.push({x0:a,y0,x1:b,y1:y,z0:over?D-12:0,z1:z+18}); }
    st.push({x0:B.x0+.3,y0,x1:B.x1-.3,y1:y,z}); }
  for(const py of [-112.5,-117.5])if(py<ya&&py>yb)bs.push(Bx(B.x0+.7,py-.4,B.x1-.7,py+.4,-6,D-12,CONC,{foot:0,top:()=>CONC,fi:ret,fj:ret}));
  if(!bs.some(b=>b.z0===0||b.foot))bs.unshift(FOOT(B.x0,yb,B.x1-B.x0,ya-yb));
  const p=prop(bs); p.stands=st; p.solids=so; return p; };
MK.brglamp=(x,y,z)=>{ '@later'; PNAME='bridge lamp'; const p=prop([FOOT(x-.1,y-.1,.2,.2),Bx(x-.06,y-.06,x+.06,y+.06,z,z+84,STEEL,{foot:0}),Bx(x-.16,y-.16,x+.16,y+.16,z+84,z+92,[150,150,156],{foot:0}),Bx(x-.1,y-.1,x+.1,y+.1,z+83,z+84,[255,206,140],{foot:0,em:1,nb:1})]);
  p.solids=[]; LAMPS.push({x,y,z:z+82,r:5,c:[1,.78,.5],prop:p}); return p; };
