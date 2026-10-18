
BOD.KC={KMK,KPP,DGN,DGP,LAMPS,CATALOG,dungeonWall,dungeonFloorCol,castleArch,KARCH};
}

{
  const B0=LBLD[0], B00={...B0}, W=LSEED.walk, CURB=LSEED.street, FAR=LSEED.grass, RD=-4;
  const OX=(B00.x0+B00.x1)/2, OY=B00.y1, K=BLDK, X=x=>(x-OX)*TILE*K, Z=y=>(y-OY)*TILE*K, Y=z=>z*ZU*K, XS=x=>(x-OX)*TILE, ZS=y=>(y-OY)*TILE, YS=z=>z*ZU; Object.assign(BOD,{X,Z,Y,XS,ZS,YS,OX,OY,B0});
  const MAP={x0:RING.wx0,x1:172+MAINX.e+WID,y0:B00.y0,y1:FAR+12}, POOLX=82, AV=AVE, RG=RING;
  { const o=LAY.o('bodega'); B0.x0+=o.x/K; B0.x1+=o.x/K; B0.y0+=o.y/K; B0.y1+=o.y/K; }
  const BODOFF=B0.y0+3.75; BOD.BODOFF=BODOFF;
  const holed=f=>(x,y)=>[MAPSTAIR,...RING.stairs].some(S=>x>=S.x0&&x<S.x1&&y>=S.y0&&y<S.y1)?null:f(x,y);
  const C=v=>v&&v.e&&v.length===3?[v[0],v[1],v[2],1]:v;
  const faceTex=(w,h,fn)=>{ w=Math.max(1,Math.round(w)); h=Math.max(1,Math.round(h)); const im=new ImageData(w,h), d=im.data; let ie=null, e=null;
    for(let j=0,k=0;j<h;j++)for(let i=0;i<w;i++,k+=4){ const v=fn(i,j); if(!v)continue; d[k]=Math.round(v[0]); d[k+1]=Math.round(v[1]); d[k+2]=Math.round(v[2]); d[k+3]=255;
      if(v.length>3){ if(!ie){ ie=new ImageData(w,h); e=ie.data; } e[k]=d[k]; e[k+1]=d[k+1]; e[k+2]=d[k+2]; e[k+3]=255; } }
    return {map:{image:im},em:ie?{image:ie}:null}; };
  const bq=(a,b,c,d,tx,kind)=>BATCH.add([...a,...b,...c,...a,...c,...d],[0,0,1,0,1,1,0,0,1,1,0,1],tx.map.image,tx.em?tx.em.image:null,kind);
  function gbox(b,kind='L'){ const {x0,x1,y0,y1,z0,z1}=b; if(b.foot&&z1-z0<.05)return; const k=b.em?2:1, H=Math.max(1,(z1-z0)*k);
    if(b.em&&kind==='L')kind='B';
    const side=(nx,ny,P,Q,z)=>C(b.fs?b.fs(nx,ny,P,Q,z-z0,nx?.68:.84):nx&&b.fi?b.fi(Q,z):ny&&b.fj?b.fj(P,z):b.c);
    if(z1-z0>=.5){
      for(const nx of [-1,1]){ const x=nx<0?x0:x1; if(y1-y0<.004)continue; bq([X(x),Y(z0),Z(nx<0?y1:y0)],[X(x),Y(z0),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y1:y0)],
        faceTex((y1-y0)*24*k,H,(i,j)=>{ const t=(i+.5)/((y1-y0)*24*k); return side(nx,0,x,nx<0?y1-t*(y1-y0):y0+t*(y1-y0),z1-(j+.5)/k); }),kind); }
      for(const ny of [-1,1]){ const y=ny<0?y0:y1; if(x1-x0<.004)continue; bq([X(ny<0?x0:x1),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z1),Z(y)],[X(ny<0?x0:x1),Y(z1),Z(y)],
        faceTex((x1-x0)*24*k,H,(i,j)=>{ const t=(i+.5)/((x1-x0)*24*k); return side(0,ny,ny<0?x0+t*(x1-x0):x1-t*(x1-x0),y,z1-(j+.5)/k); }),kind); } }
    if(x1-x0>.004&&y1-y0>.004)bq([X(x0),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y0)],[X(x0),Y(z1),Z(y0)],
      faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(b.top?b.top(x0+(i+.5)/24,y0+(j+.5)/24):b.c)),kind); }
  function place(p,rot){ const o={boxes:p.boxes,x0:p.x0,y0:p.y0,x1:p.x1,y1:p.y1,solids:p.solids}; placeAt(p,rot,(o.x0+o.x1)/2,(o.y0+o.y1)/2,(o.x0+o.x1)/2,(o.y0+o.y1)/2,true); }
  function placeAt(p,rot,cx,cy,ncx,ncy,own){ const o={boxes:p.boxes,x0:p.x0,y0:p.y0,x1:p.x1,y1:p.y1,solids:p.solids}, r=((rot%4)+4)%4;
    const fw=(x,y)=>{ let dx=x-cx, dy=y-cy; for(let k=0;k<r;k++)[dx,dy]=[-dy,dx]; return [ncx+dx,ncy+dy]; };
    const bw=(x,y)=>{ let dx=x-ncx, dy=y-ncy; for(let k=0;k<r;k++)[dx,dy]=[dy,-dx]; return [cx+dx,cy+dy]; };
    const rect=b=>{ const a=fw(b.x0,b.y0), c=fw(b.x1,b.y1); return {x0:Math.min(a[0],c[0]),x1:Math.max(a[0],c[0]),y0:Math.min(a[1],c[1]),y1:Math.max(a[1],c[1])}; };
    if(r)p.boxes=o.boxes.map(b=>{ const nb={...b,...rect(b)}, fi0=b.fi||(()=>sh(b.c,.62)), fj0=b.fj||(()=>sh(b.c,.8));
      if(b.top)nb.top=(x,y)=>b.top(...bw(x,y));
      if(b.fs){ nb.fs=(nx,ny,x,y,z,k)=>{ for(let q=0;q<r;q++)[nx,ny]=[ny,-nx]; return b.fs(nx,ny,...bw(x,y),z,k); }; return sided(nb); }
      nb.fi=(y,z)=>{ const [ox,oy]=bw(ncx,y); return fi0(r&1?ox:oy,z); }; nb.fj=(x,z)=>{ const [ox,oy]=bw(x,ncy); return fj0(r&1?oy:ox,z); }; return nb; });
    Object.assign(p,rect(o)); if(o.solids&&(r||cx!==ncx||cy!==ncy))p.solids=o.solids.map(b=>({...b,...rect(b)}));
    if(own)for(const l of LAMPS)if(l.prop===p){ l.at0=l.at0||[l.x,l.y]; [l.x,l.y]=fw(...l.at0); } }
  const WALLS=[];
  const wall=(id,ax,at,a0,a1,H,holes,inS,outS,outer)=>{ WALLS.push({id,ax,at,a0,a1,H,holes,inS,outS,outer}); };
  { const B=B0, m=(B.x0+B.x1)/2, d=(m0)=>({a0:m0-.78,a1:m0+.78,z0:0,z1:94,door:true});
    const cuts=[B.x0+.35,m-.95,m+.95,B.x1-.35], win=[]; for(let i=0;i+1<cuts.length;i+=2)win.push({a0:cuts[i],a1:cuts[i+1],z0:16,z1:94,glass:true});
    wall('front','x',B.y1,B.x0,B.x1,B.h,[{...d(m),glass:true},...win],-1,1,true);
    wall('back','x',B.y0,B.x0,B.x1,B.h,[],1,-1,true);
    wall('west','y',B.x0,B.y0-T,B.y1+T,B.h,[],1,-1,true);
    wall('east','y',B.x1,B.y0-T,B.y1+T,B.h,[],-1,1,true);
    wall('office','x',BODOFF,B.x0+T,B.x1-T,B.h-4,[d(B.x1-.95)],1,-1,false); }
  BOD.WALLS=WALLS;
  function facade(nx,ny,X_,Y_,z,f,cap,brick){ const u=nx?Y_:X_, c=brick||DTBRICK;
    if(z>=cap-4)return sh(mt('cope',COPE),z<cap-3?f*.72:f);
    if(z>=cap-20){ const r=cap-4-z, t=sh(mt('cope',COPE),f); if(r<3)return sh(t,1.08); if(r<5)return sh(t,.62); if(r<10)return (Math.floor(u*24/3)&1)?sh(t,.95):sh(t,.55); if(r<12)return sh(t,.7); if(r<15)return t; }
    { const s=z%STORY; if(z>STORY-4&&(s<4||s>=STORY-2)){ const t=sh(mt('cope',speck([170,162,148],u,z/24,97)),f); return s>=STORY-2?sh(mt('mortar',sh(c,.6)),f*.6):s===3?sh(t,1.12):s===0?sh(t,.8):t; } }
    if(z<8)return sh(mt('cope',speck([150,146,136],u,z/24,95)),f*(z<1?.8:1));
    if(z<11)return sh(mt('cope',[150,146,136]),f*(z<9?1.1:.9));
    const k=Math.floor(z/5), zz=z-k*5, e=u*24/11+(k&1)*.5, jt=q=>(hash(q,k,37)-.5)*.26, b0=Math.floor(e), bi=e<b0+jt(b0)?b0-1:b0, l=bi+jt(bi), uu=e, bx=(e-l)/(1+jt(bi+1)-jt(bi)), hb=hash(bi,k,11), hp=hash(Math.floor(u*24),Math.floor(z),13);
    if(zz<1||bx<1/11)return rlf(sh(mt('mortar',sh(hp<.3?[118,110,100]:[132,124,112],.62)),f),zz<1?2:3);
    if((zz===4||zz===1)&&(bx<2/11||bx>10/11)&&hash(bi,k,15)<.3)return sh(mt('mortar',[104,96,88]),f*.7);
    let b=sh(c,.9+hb*.2); if(hb<.05)b=sh(c,.62); else if(hb>.96)b=sh(c,1.22);
    b=sh(b,(zz===4?1.1:zz===1?.84:1)*(.94+.12*hp)*(1-.18*Math.max(0,1-(z-11)/60)*cvNoise(u*1.7,z/40,17)));
    if(Math.abs(cvNoise(u*24/8,z/8,41)-.5)<.025&&cvNoise(u*24/34,z/34,43)>.66)b=sh(b,.6);
    const w=(hash(bi,k,39)-.5)*.12; b=[b[0]*(1+w),b[1],b[2]*(1-w)];
    return rlf(sh(mt('brick',b),f),zz>=4?1:0); }
  const FRAME=[70,72,78];
  const O={}, HUNG=[];
  const put=(key,kind,x,y,rot=0,hung)=>{ const f=CATALOG[kind]; if(!f){ console.warn('no',kind); return; } const n0=PROPS.length; const p=f(+x.toFixed(3),+y.toFixed(3)); if(!p)return; p.key=key; p.kind=kind; place(p,rot); if(hung)p.high=true; O[key]=p; };
  { const B={...B0,y0:BODOFF}, m=(B.x0+B.x1)/2;
  put('mat','door mat',m,B.y1-.5);
  put('wb1','shop shelf',B.x0+1.1,B.y0+.36); put('wb2','shop shelf',B.x0+3.1,B.y0+.36); put('wb3','shop shelf',B.x0+5.1,B.y0+.36);
  for(const [i,dy] of [[1,1.0],[2,1.95],[3,2.9]])put('fridge'+i,'drinks fridge',B.x0+.5,B.y0+dy);
  put('wl1','shop shelf',B.x0+.36,B.y0+4.45,3); put('wl2','shop shelf',B.x0+.36,B.y0+6.55,3);
  put('wr1','shop shelf',B.x1-.36,B.y0+2.2,1);
  put('counter','long counter',B.x1-1.05,B.y0+5.4,1); put('cigs','cigarette rack',B.x1-.22,B.y0+5.0,1,1); O.cigs.boxes=O.cigs.boxes.map(b=>b.foot?b:zShift(b,42));
  put('radio','radio',B.x1-.24,B.y0+4.0,1,1);
  put('lotto','lottery machine',B.x1-1.05,B.y0+4.15,1); put('jar','candy jar',B.x1-1.05,B.y0+4.62);
  { const top=Math.max(...O.counter.boxes.map(b=>b.z1)), drop=top*.25; O.counter.boxes=O.counter.boxes.map(b=>Object.assign({},b,{z0:b.z0*.75,z1:b.z1*.75}));
    for(const k of ['lotto','jar'])if(O[k])O[k].boxes=O[k].boxes.map(b=>b.z0>=top*.8?zShift(b,-drop):b); } put('bags','paper bags',B.x1-.5,B.y0+7.3); put('phone','wall phone',B.x1-.15,B.y0+7.3,0,1);
  put('clock','wall clock',B.x0+3.1,B.y0+.14,0,1); put('mirror','convex mirror',B.x0+.42,B.y0+.15,0,1); put('calendar','calendar',B.x0+.11,B.y0+1.95,0,1); put('cord','extension cord',B.x0+.11,B.y0+.12,0,1);
  put('tube1','fluorescent tube',m,B.y0+2.5); put('tube2','fluorescent tube',m,B.y0+6.5);
  put('fan','box fan',B.x0+5.1,B.y0+.36); put('fly','fly strip',m-.8,B.y0+4.5); put('bell','door bell',m,B.y1-.24);
  put('news','newspaper rack',B.x0+.6,B.y1-.5); put('dock','drone box',B.x1-.45,B.y0+.45); put('flap','drone flap',B.x1-1.1,B.y1);
  put('wl3','shop shelf',B.x0+.36,B.y0+8.5,3);
  put('mat-fox','counter mat',B.x1-.42,B.y0+5.3); put('mat-run','rubber mat',B.x1-1.75,B.y0+5.3,1);
  { const y0=B0.y0, x0=B0.x0; put('of-desk','desk',x0+1.4,y0+.75); put('of-chair','office chair',x0+1.4,y0+1.6); put('of-pc','home computer',x0+1.4,y0+.6);
    put('of-shelf','shelves with boxes',x0+4.6,y0+.5); put('of-boxes','cardboard boxes',x0+6.6,y0+.7); put('of-sink','utility sink',x0+.55,y0+2.6,3);
    put('of-clock','wall clock',x0+3.2,y0+.29); put('of-tube','fluorescent tube',x0+3.6,y0+1.9); }
  BOD.food={x:B.x1-1.05,y:B.y0+6.3};
  put('mat-out','door mat',m,B0.y1+.75); }
  const FRONT=[], ROOF=[], STREET=[], GHOSTST=[];
  { const M=MKS, bo=B0, bm=(bo.x0+bo.x1)/2, n0=PROPS.length;
    M.pipe(bo.x0+.2,bo.y1,bo.h-6);
    M.neon(bo.x0+1.5,bo.y1,64,'OPEN',[255,90,110]); M.signbox(bo.x0+.45,bo.x0+2.3,bo.y1,36,48,[250,250,246],[40,80,200],'LOTTO',false);
    M.gatebox(bo.x0+.2,bo.x1-.2,bo.y1,114); M.bell(bm,bo.y1,98); M.meterbox(bo.x0+.9,bo.y1,30); M.number(bo.x0+1.6,bo.y1,82,'66'); M.moss(bo.x0+.3,bo.x0+3,bo.y1);
    for(const p of PROPS.slice(n0))FRONT.push(p);
    { const K=GHOSTK.GSK, s=K.s; { const o=LAY.o('ghost'); K.o=[131+o.x/BLDK,W-8.3*s+o.y/BLDK]; } const n3=PROPS.length;
      for(const [k,dx,dy] of PRESETS['Preset Ghost Street 1'])if(!/row house|utility pole/.test(k))CATALOG[k](K.o[0]-3.5*s+dx,K.o[1]-.45*s+dy);
      for(const p of PROPS.slice(n3))GHOSTST.push(p); BOD.GHOSTST=GHOSTST; BOD.GSK=K; gdShape(GHOSTST,K,LAMPS);
    }
    const n2=PROPS.length, R=(f,x,y,z,...a)=>{ const p=f(x,y,z,bo.y1,...a); p.solids=[]; return p; };
    R(M.vent,bo.x0+3,bo.y0+5,bo.h); R(M.antenna,bo.x0+8,bo.y0+3.5,bo.h); R(M.roofac,bo.x0+6,bo.y0+7.5,bo.h); for(const p of PROPS.slice(n2))ROOF.push(p); }
  BOD.O=O; BOD.FRONT=FRONT; BOD.STREET=STREET; BOD.ROOF=ROOF; BOD.MAP=MAP; BOD.RD=RD;
  const wallOf=p=>{ const cx=(p.x0+p.x1)/2, cy=(p.y0+p.y1)/2; let best=null, bd=.5; for(const w of WALLS){ const a=w.ax==='x'?cx:cy, d=Math.abs((w.ax==='x'?cy:cx)-w.at); if(a>=w.a0-.2&&a<=w.a1+.2&&d<bd){ bd=d; best=w; } } return best; };
  BOD.kindOf=p=>{ if(/fluorescent tube/.test(p.name||''))return 'U'; if(ROOF.includes(p))return 'R';
    if(FRONT.includes(p))return 'Hfront'; if(p.high){ const w=wallOf(p); if(w)return 'H'+w.id; } return 'L'; };
  BOD.paintProps=()=>{ for(const p of [...Object.values(O),...FRONT,...STREET,...ROOF,...GHOSTST]){ const k=BOD.kindOf(p); BATCH.tag=OBJ('bodega',p.name); for(const b of p.boxes)gbox(b,k); } BATCH.tag=null; };
  BOD.g={bodegaWall,grain,speck,COPE,DTBRICK,hash,grassCol,lawnCol,kerbFace,cvNoise}; BOD.CURB=CURB; BOD.FAR=FAR;
  BOD.gbox=gbox; BOD.faceTex=faceTex; BOD.bq=bq; BOD.C=C; BOD.facade=facade; BOD.FRAME=FRAME; BOD.place=place; BOD.placeAt=placeAt; BOD.MAP=MAP; BOD.K={MKS,CATALOG,PROPS,STUDIO,LSEED,STORY,sh};
  const PCX=(50-MAINX.w+LAY.e('park')[0]+AV.x0+LAY.e('park')[2])/2+LAY.o('park').x, PCY=(MAP.y1+RG.ny0)/2+LAY.o('park').y, GATE=[PCX-3.5,PCX+3.5], EGATE=[PCY-2,PCY+2];
  const KR=1.6, RR=[[MAP.x0,CURB,MAP.x1,FAR],[AV.r0,FAR,AV.r1,RG.nr1],[RG.wr0,FAR,RG.wr1,RG.nr1],[RG.wr0,RG.nr0,AV.r1,RG.nr1]];
  const CORN=[[RG.wr0,FAR,-1,1,1],[RG.wr1,FAR,1,1,1],[AV.r0,FAR,-1,1,1],[AV.r1,FAR,1,1,1],[RG.wr1,RG.nr0,1,-1,1],[AV.r0,RG.nr0,-1,-1,1],[RG.wr0,RG.nr1,1,-1,0],[AV.r1,RG.nr1,-1,-1,0]].map(([x,y,sx,sy,cv])=>({x,y,sx,sy,cv,cx:x+sx*KR,cy:y+sy*KR}));
  const inQ=(c,x,y)=>{ const u=(x-c.x)*c.sx, v=(y-c.y)*c.sy; return u>=0&&u<=KR&&v>=0&&v<=KR; };
  const ROADAT=(x,y)=>{ let r=false; for(const b of RR)if(x>b[0]&&x<b[2]&&y>b[1]&&y<b[3]){ r=true; break; } for(const c of CORN)if(inQ(c,x,y)&&Math.hypot(x-c.cx,y-c.cy)>KR)return !!c.cv; return r; };
  const KB=.16, NR=RR.map(b=>[b[0]-KR-.3,b[1]-KR-.3,b[2]+KR+.3,b[3]+KR+.3]), KX=kerbCol('x'), KY=kerbCol('y');
  const kerbAt=(x,y)=>{ if(!NR.some(b=>x>b[0]&&x<b[2]&&y>b[1]&&y<b[3]))return null;
    for(const c of CORN)if(inQ(c,x,y)){ const d=Math.hypot(x-c.cx,y-c.cy); if(c.cv?d>KR-KB:d<KR+KB)return KX(Math.atan2(y-c.cy,x-c.cx)*KR+c.x*7,y); return null; }
    if(ROADAT(x+KB,y)||ROADAT(x-KB,y))return KY(x,y); if(ROADAT(x,y+KB)||ROADAT(x,y-KB))return KX(x,y); return null; };
  const SW=f=>(x,y)=>{ if(ROADAT(x,y)||rampAt(x,y)!=null)return null; const v=f(x,y); return v&&(kerbAt(x,y)||v); };
  const XW=[[GATE[0],GATE[1],'x',CURB,FAR],[AV.r1+.3,AV.x1-.3,'x',CURB,FAR],[RG.wx0+.3,RG.wr0-.3,'x',CURB,FAR],
    [FAR+KR+.3,FAR+KR+1.9,'y',AV.r0,AV.r1],[EGATE[0],EGATE[1],'y',AV.r0,AV.r1],[EGATE[0],EGATE[1],'y',RG.wr0,RG.wr1],[FAR+KR+.3,FAR+KR+1.9,'y',RG.wr0,RG.wr1],
    [GATE[0],GATE[1],'x',RG.nr0,RG.nr1],[RG.wr0+KR+.2,RG.wr0+KR+1.8,'x',RG.nr0,RG.nr1],[AV.r1-KR-1.8,AV.r1-KR-.2,'x',RG.nr0,RG.nr1]];
  const inX=(ax,e,a,m)=>XW.some(w=>w[2]===ax&&e>=w[3]-.01&&e<=w[4]+.01&&a>w[0]-m&&a<w[1]+m);
  const RPD=.75, RP=[];
  for(const [a0,a1,ax,l0,h0] of XW)for(const [e,dir] of [[l0,-1],[h0,1]]){ const P=(u,w)=>ax==='x'?[u,e+dir*w]:[e+dir*w,u], ok=u=>ROADAT(...P(u,-.05))&&!ROADAT(...P(u,.05))&&!ROADAT(...P(u,RPD+.05));
    const m=(a0+a1)/2, hw=Math.min((a1-a0)/2-.1,1.2); if(!ok(m))continue; let u0=m, u1=m; while(u0-.05>=m-hw&&ok(u0-.05))u0-=.05; while(u1+.05<=m+hw&&ok(u1+.05))u1+=.05;
    if(u1-u0>=.8)RP.push({ax,e,dir,u0,u1}); }
  const rampAt=(x,y)=>{ for(const r of RP){ const u=r.ax==='x'?x:y, w=((r.ax==='x'?y:x)-r.e)*r.dir; if(u>r.u0&&u<r.u1&&w>=0&&w<RPD)return w; } return null; };
  const rampCol=(u,w,W)=>{ const ti=Math.floor(u*24), tj=Math.floor(w*24); if(ti<1||ti>=Math.floor(W*24)-1)return [188,184,174];
    if(w>.04&&w<.36&&ti>=2&&ti<Math.floor(W*24)-2){ const a=ti%3, b=tj%3; return b===1&&a===1?[246,214,92]:b===1&&a===2||b===2&&a===1?[164,128,30]:[216,178,48]; }
    const n=grain(u*3.1,w*7.3,631,1.4); return tj%2?(n<.4?[150,147,139]:[162,158,149]):(n<.4?[158,154,146]:[170,166,157]); };
  BOD.ramps={RP,D:RPD,col:rampCol,at:rampAt};
  const bars=(x,y)=>{ for(const [a0,a1,ax,l0,h0] of XW){ const u=ax==='x'?x:y, v=ax==='x'?y:x; if(u<=a0||u>=a1||v<=l0+.15||v>=h0-.15)continue;
      const W=()=>{ const n=grain(x,y,39,2.2); return n<.3?[150,148,142]:[196,194,186]; };
      if(u<a0+.1||u>a1-.1)return W(); if(u>a0+.25&&u<a1-.25&&(Math.floor((v-l0-.15)/.5)&1)===0)return W(); return null; } return null; };
  const LN=[['x',CURB,1,MAP.x0+.5,MAP.x1-.5,[[RG.wr0,RG.wr1],[AV.r0,AV.r1]]],['x',FAR,-1,RG.wr1+KR,AV.r0-KR],['x',FAR,-1,AV.r1+KR,MAP.x1-.5],
    ['y',AV.r0,1,FAR+KR,RG.nr0-KR],['y',AV.r1,-1,FAR+KR,RG.nr0],['y',RG.wr0,1,FAR+KR,RG.nr0],['y',RG.wr1,-1,FAR+KR,RG.nr0-KR],
    ['x',RG.nr0,1,RG.wr1+KR,AV.r0-KR],['x',RG.nr1,-1,RG.wr1,AV.r0]];
  const sd=(px,py,ax,ay,bx,by)=>{ const dx=bx-ax, dy=by-ay, t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy))); return Math.hypot(px-ax-t*dx,py-ay-t*dy); };
  const BIKE=[[-.27,-.08,0,-.06],[0,-.06,-.08,.12],[-.27,-.08,-.08,.12],[-.08,.12,.17,.12],[.17,.12,0,-.06],[.17,.12,.27,-.08],[.17,.12,.15,.2],[.11,.2,.21,.2],[-.14,.14,-.02,.14]];
  const bike=(u,w)=>Math.abs(Math.hypot(u+.27,w+.08)-.15)<.035||Math.abs(Math.hypot(u-.27,w+.08)-.15)<.035||BIKE.some(s=>sd(u,w,...s)<.032);
  const chev=(u,w)=>{ const q=Math.abs(w); return q<.3&&[0,.2].some(c=>Math.abs(u-c+q*.9)<.045); };
  const WHITE=(x,y,hp)=>{ const n=grain(x,y,611,1.1); return hp<.05?[170,168,160]:n<.3?[188,186,178]:[212,210,202]; };
  const lane=(x,y)=>{ for(const [ax,e,dir,a0,a1,dash] of LN){ const a=ax==='x'?x:y, d=((ax==='x'?y:x)-e)*dir; if(d<.12||d>=1.44||a<a0||a>a1)continue;
      if(inX(ax,e,a,.35))return null;
      const hp=hash(Math.floor(x*24),Math.floor(y*24),613), worn=cvNoise(x*1.7,y*1.7,615)>.78&&hp<.55;
      if(d>=1.32)return worn||dash&&dash.some(r=>a>r[0]-.2&&a<r[1]+.2)&&(Math.floor(a/1.2)&1)?null:WHITE(x,y,hp);
      const t=ax==='x'?dir:-dir, k=Math.round((a-a0-8)/22), sa=a0+8+k*22;
      if(k>=0&&sa<a1-2){ const u=(a-sa)*t; if(u>-.75&&u<.25&&bike(u+.25,d-.74)||u>.45&&u<1&&chev(u-.6,d-.74))return WHITE(x,y,hp); }
      return null; } return null; };
  const JX=[[RG.wr0,CURB,RG.wr1,FAR],[AV.r0,CURB,AV.r1,FAR],[RG.wr0,RG.nr0,RG.wr1,RG.nr1],[AV.r0,RG.nr0,AV.r1,RG.nr1]], inJ=(x,y,m)=>JX.some(b=>x>b[0]-m&&x<b[2]+m&&y>b[1]-m&&y<b[3]+m);
  const YEL=[[190,156,54],[212,176,62]];
  const marks=(x,y)=>{ const hp=hash(Math.floor(x*24),Math.floor(y*24),617);
    for(const b of RR){ if(!(x>b[0]&&x<b[2]&&y>b[1]&&y<b[3]))continue; const ax=b[2]-b[0]>b[3]-b[1]?'x':'y', a=ax==='x'?x:y, v=ax==='x'?y:x, m=ax==='x'?(b[1]+b[3])/2:(b[0]+b[2])/2, q=Math.abs(v-m);
      if(q>.06&&q<.19&&!inJ(x,y,.3)&&!inX(ax,m,a,1.1))return cvNoise(x*1.7,y*1.7,619)>.8&&hp<.5?null:YEL[grain(x,y,621,1.1)<.4?0:1]; break; }
    for(const [a0,a1,ax,l0,h0] of XW){ const u=ax==='x'?x:y, v=ax==='x'?y:x, m=(l0+h0)/2; if(v<=l0+.12||v>=h0-.12||inJ(x,y,1.5))continue;
      const lo=ax==='x'; if(u>a0-1.05&&u<a0-.7&&(lo?v<m-.2:v>m+.2)||u>a1+.7&&u<a1+1.05&&(lo?v>m+.2:v<m-.2))return WHITE(x,y,hp); }
    return null; };
  const IX=new Map(), at2=(x,y)=>Math.floor(x/2)+','+Math.floor(y/2), feat=(x0,y0,x1,y1,f)=>{ for(let i=Math.floor(x0/2);i<=Math.floor(x1/2);i++)for(let j=Math.floor(y0/2);j<=Math.floor(y1/2);j++){ const k=i+','+j; (IX.get(k)||IX.set(k,[]).get(k)).push(f); } };
  const MH=[], DR=[];
  const manhole=(cx,cy)=>{ MH.push([cx,cy]); feat(cx-.45,cy-.45,cx+.45,cy+.45,(x,y)=>{ const dx=x-cx, dy=y-cy, r=Math.hypot(dx,dy); if(r>=.42)return null;
    if(r>.35)return dx+dy<0?[78,76,72]:[40,40,42];
    if(r>.32)return [26,26,28];
    const rs=hash(Math.floor(cx*7),Math.floor(cy*7),621); if(Math.abs(r-.2)<.022)return [36,36,38]; if(r<.07)return [86,84,80];
    const q=((Math.floor((dx+1)*24/3)+Math.floor((dy+1)*24/3))&1); let c=q?[98,95,90]:[62,61,59]; if(r>.24&&hash(Math.floor(x*24),Math.floor(y*24),623)<.12+.15*rs)c=[110,76,52];
    return c; }); };
  const drain=(ax,e,dir,a)=>{ DR.push({ax,e,a}); const HL=.62, OUT=.82, R=.22, x0=ax==='x'?a-HL-R:Math.min(e,e+dir*(OUT+R)), x1=ax==='x'?a+HL+R:Math.max(e,e+dir*(OUT+R)), y0=ax==='x'?Math.min(e,e+dir*(OUT+R)):a-HL-R, y1=ax==='x'?Math.max(e,e+dir*(OUT+R)):a+HL+R;
    const sd=hash(Math.floor(a*7),Math.floor(e*7),631);
    feat(x0,y0,x1,y1,(x,y)=>{ const u=(ax==='x'?x:y)-a, w=((ax==='x'?y:x)-e)*dir, px=Math.floor(x*24), py=Math.floor(y*24), hp=hash(px,py,633); if(w<0)return null;
      const ou=Math.abs(u)-HL, ow=w-OUT, out=Math.max(ou,ow);
      if(out>=0){ if(out>=R*(.6+.4*hash(Math.floor(u*6),Math.floor(w*6),635)))return null;
        if(hp<.16+(w<.12?.3:0))return [[62,92,44],[80,112,52],[50,76,38]][Math.floor(hash(px,py,637)*3)];
        return hp>.9?[30,30,32]:[50,50,53]; }
      if(sd<.35&&Math.hypot(u-(sd-.17)*3,w-OUT*.8)<.1)return hp<.5?[236,232,226]:[206,202,214];
      if(Math.abs(u)>HL-.08||w>OUT-.08||w<.06){ const lit=(u<0)!==(dir<0); return Math.abs(u)>HL-.03||w>OUT-.03?(lit?[118,114,108]:[58,56,54]):[86,84,80]; }
      const fu=(u+HL-.08)/((HL-.08)*2), fw=(w-.06)/(OUT-.14), cu=fu*4-Math.floor(fu*4), cw=fw*6-Math.floor(fw*6);
      if(cu>.1&&cu<.9&&cw>.24&&cw<.82)return cw<.34||cu<.18?[26,24,24]:[10,10,12];
      return hash(Math.floor(fu*4),Math.floor(fw*6),639)<.25&&hp<.5?[112,78,54]:hp<.3?[104,102,98]:[78,77,75]; }); };
  BOD.kerbs=[{ax:'x',at:CURB,a0:MAP.x0,a1:MAP.x1,n:1},{ax:'x',at:FAR,a0:MAP.x0,a1:RG.wr0-KR,n:-1,e1:1},{ax:'x',at:FAR,a0:RG.wr1+KR,a1:AV.r0-KR,n:-1,e0:1,e1:1},{ax:'x',at:FAR,a0:AV.r1+KR,a1:MAP.x1,n:-1,e0:1},
    {ax:'y',at:AV.r0,a0:FAR+KR,a1:RG.nr0-KR,n:1,e0:1,e1:1},{ax:'y',at:AV.r1,a0:FAR+KR,a1:RG.nr1-KR,n:-1,e0:1,e1:1},
    {ax:'y',at:RG.wr0,a0:FAR+KR,a1:RG.nr1-KR,n:1,e0:1,e1:1},{ax:'y',at:RG.wr1,a0:FAR+KR,a1:RG.nr0-KR,n:-1,e0:1,e1:1},
    {ax:'x',at:RG.nr0,a0:RG.wr1+KR,a1:AV.r0-KR,n:1,e0:1,e1:1},{ax:'x',at:RG.nr1,a0:RG.wr0+KR,a1:AV.r1-KR,n:-1,e0:1,e1:1},
    {ax:'y',at:MAP.x0,a0:CURB,a1:FAR,n:1},{ax:'y',at:MAP.x1,a0:CURB,a1:FAR,n:-1}].map(k=>({z0:RD,z1:0,...k}));
  for(const k of BOD.kerbs){ if(k.at===MAP.x0||k.at===MAP.x1)continue; const ds=[]; if(k.e0)ds.push(k.a0+1); if(k.e1)ds.push(k.a1-1);
    for(let a=k.a0+14;a<k.a1-8;a+=28)if(ds.every(b=>Math.abs(b-a)>10))ds.push(a);
    for(const a of ds)if(a>k.a0+.6&&a<k.a1-.6&&!inX(k.ax,k.at,a,1.2))drain(k.ax,k.at,k.n,a); }
  { const yc=(CURB+FAR)/2, xw=(RG.wr0+RG.wr1)/2, xa=(AV.r0+AV.r1)/2, yn=(RG.nr0+RG.nr1)/2, ok=(x,y)=>!XW.some(w=>{ const u=w[2]==='x'?x:y, v=w[2]==='x'?y:x; return u>w[0]-1.2&&u<w[1]+1.2&&v>w[3]&&v<w[4]; });
    for(const [x,y] of [[xw,yc],[xa,yc],[xw,yn],[xa,yn]])manhole(x,y);
    let k=0; for(let x=MAP.x0+20;x<MAP.x1-4;x+=40,k++)if(ok(x,yc)&&Math.abs(x-xw)>8&&Math.abs(x-xa)>8)manhole(x,yc+(k&1?1.6:-1.6));
    k=0; for(let y=FAR+20;y<RG.nr0-5;y+=40,k++)for(const xm of [xw,xa])if(ok(xm,y))manhole(xm+(k&1?1.6:-1.6),y);
    k=0; for(let x=RG.wr1+20;x<AV.r0-5;x+=40,k++)if(ok(x,yn))manhole(x,yn+(k&1?1.6:-1.6)); }
  const RW=(x,y)=>{ if(!ROADAT(x,y))return null; const L=IX.get(at2(x,y)); if(L)for(const f of L){ const v=f(x,y); if(v)return v; } return bars(x,y)||lane(x,y)||marks(x,y)||roadCol(x,y,0); };
  BOD.kerbFaceAt=(k,a,z,H)=>{ for(const r of RP)if(r.ax===k.ax&&r.e===k.at&&a>r.u0&&a<r.u1)return null;
    for(const d of DR)if(d.ax===k.ax&&d.e===k.at&&Math.abs(a-d.a)<.5){ if(z>=H-1)break; if(Math.abs(a-d.a)>.44)return [96,94,88]; return z<1?[120,116,108]:[14,14,16]; } return kerbFace(a,z,H); };
  const arc=(c,rev,n=6)=>{ const a0=Math.atan2(-c.sy,0), a1=Math.atan2(0,-c.sx); let dl=a1-a0; while(dl>Math.PI)dl-=2*Math.PI; while(dl<-Math.PI)dl+=2*Math.PI;
    const P=[]; for(let i=0;i<=n;i++){ const t=a0+dl*i/n; P.push([c.cx+Math.cos(t)*KR,c.cy+Math.sin(t)*KR]); } return rev?P.reverse():P; };
  BOD.kerbArcs=CORN.map(c=>({P:arc(c),z0:RD,z1:0}));
  { const C=(x,y)=>CORN.find(c=>c.x===x&&c.y===y), M=MAP;
    BOD.roadPolys=[[[M.x0,CURB],[M.x1,CURB],[M.x1,FAR],...arc(C(AV.r1,FAR)),[AV.r1,RG.nr0],...arc(C(AV.r0,RG.nr0)),...arc(C(AV.r0,FAR),1),...arc(C(RG.wr1,FAR)),...arc(C(RG.wr1,RG.nr0),1),[RG.wr0,RG.nr0],...arc(C(RG.wr0,FAR),1),[M.x0,FAR]],
      [[RG.wr0,RG.nr0],[AV.r1,RG.nr0],...arc(C(AV.r1,RG.nr1),1),...arc(C(RG.wr0,RG.nr1))]]; }
  const PATCH=CORN.map(c=>({id:'corner',x0:Math.min(c.x,c.cx),y0:Math.min(c.y,c.cy),x1:Math.max(c.x,c.cx),y1:Math.max(c.y,c.cy),z:c.cv?RD:0,col:c.cv?RW:SW(slabCol),tex:null,rep:2}));
  const SG=[], NM={main:'MARKET ST',west:'WEST ST',north:'NORTH ST',ave:'THE AVE'}, CN=[['main','west'],['main','west'],['main','ave'],['main','ave'],['north','west'],['north','ave'],['north','west'],['north','ave']];
  const TLC=[0,3], TK=(KR-.45)/Math.SQRT2;
  CORN.forEach((c,i)=>{ const k=c.cv?KR-1.2:KR+1.2, t=TLC.includes(i); SG.push({kind:'name',x:t?c.cx-c.sx*TK:c.cx-c.sx*k/Math.SQRT2,y:t?c.cy-c.sy*TK:c.cy-c.sy*k/Math.SQRT2,ax:NM[CN[i][0]],ay:NM[CN[i][1]],np:t}); });
  SG.push({kind:'name',x:RG.wr1+1,y:CURB-.75,ax:NM.main,ay:NM.west},{kind:'name',x:AV.r0-1,y:CURB-.75,ax:NM.main,ay:NM.ave});
  { let q=0; for(const k of BOD.kerbs){ if(k.at===MAP.x0||k.at===MAP.x1)continue; for(let a=k.a0+6;a<k.a1-4;a+=24){ if(inX(k.ax,k.at,a,2)||inJ(k.ax==='x'?a:k.at,k.ax==='x'?k.at:a,2))continue;
      const p=k.at-k.n*.75; SG.push({kind:q++%3===2?'speed':'nopark',x:k.ax==='x'?a:p,y:k.ax==='x'?p:a,n:k.ax==='x'?[1,0]:[0,1]}); } } }
  BOD.signs=SG;
  BOD.road={KR,CORN,RR,at:ROADAT,MH,DR,LN}; window.STREETQ=()=>({...BOD.road,XS:BOD.XS,ZS:BOD.ZS,CURB,FAR,MAP,AV,RG,corner:typeof DRESS!=='undefined'&&DRESS.corner});
  BOD.grounds=[
    {id:'shop',bld:true,x0:B0.x0,y0:B0.y0,x1:B0.x1,y1:B0.y1,z:.15,col:(x,y)=>bodegaFloorCol(x,y),tex:'concrete_floor_worn_001',tint:[112,116,124],rep:3},
    {id:'walk',x0:MAP.x0,y0:W,x1:MAP.x1,y1:CURB-.16,z:0,col:holed(slabCol),tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'kerb',x0:MAP.x0,y0:CURB-.16,x1:MAP.x1,y1:CURB,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'road',x0:MAP.x0,y0:CURB,x1:MAP.x1,y1:FAR,z:RD,col:RW,tex:'asphalt_02',tint:[62,64,68],rep:3},
    {id:'alley',x0:MAP.x0,y0:-101,x1:MAP.x1,y1:-96,z:0,col:(x,y)=>roadCol(x,y,1),tex:'asphalt_02',tint:[86,87,90],rep:3},
    {id:'kerb2',x0:RG.wr1,y0:FAR,x1:AV.r0,y1:FAR+.16,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'walk2',x0:RG.wr1,y0:FAR+.16,x1:AV.r0,y1:MAP.y1,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'kerb2e',x0:AV.r1,y0:FAR,x1:MAP.x1,y1:FAR+.16,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'walk2e',x0:AV.r1,y0:FAR+.16,x1:MAP.x1,y1:MAP.y1,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'aveW',x0:AV.x0,y0:MAP.y1,x1:AV.r0-.16,y1:RG.nr0-.16,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'aveKW',x0:AV.r0-.16,y0:MAP.y1,x1:AV.r0,y1:RG.nr0-.16,z:0,col:kerbCol('y'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'aveRoad',x0:AV.r0,y0:FAR,x1:AV.r1,y1:RG.nr0,z:RD,col:RW,tex:'asphalt_02',tint:[62,64,68],rep:3},
    {id:'aveKE',x0:AV.r1,y0:MAP.y1,x1:AV.r1+.16,y1:RG.nr1,z:0,col:kerbCol('y'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'aveE',x0:AV.r1+.16,y0:MAP.y1,x1:AV.x1,y1:AV.ey1,z:0,col:holed(slabCol),tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'kerb2w',x0:MAP.x0,y0:FAR,x1:RG.wr0,y1:FAR+.16,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'wstW',x0:RG.wx0,y0:FAR+.16,x1:RG.wr0-.16,y1:RG.nr1,z:0,col:holed(slabCol),tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'wstKW',x0:RG.wr0-.16,y0:FAR+.16,x1:RG.wr0,y1:RG.nr1,z:0,col:kerbCol('y'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'wstRoad',x0:RG.wr0,y0:FAR,x1:RG.wr1,y1:RG.nr0,z:RD,col:RW,tex:'asphalt_02',tint:[62,64,68],rep:3},
    {id:'wstKE',x0:RG.wr1,y0:MAP.y1,x1:RG.wr1+.16,y1:RG.nr0-.16,z:0,col:kerbCol('y'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'wstE',x0:RG.wr1+.16,y0:MAP.y1,x1:RG.wx1,y1:RG.nr0-.16,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'nthS',x0:RG.wr1,y0:RG.ny0,x1:AV.r0,y1:RG.nr0-.16,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'nthKS',x0:RG.wr1,y0:RG.nr0-.16,x1:AV.r0,y1:RG.nr0,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'nthRoad',x0:RG.wr0,y0:RG.nr0,x1:AV.r1,y1:RG.nr1,z:RD,col:RW,tex:'asphalt_02',tint:[62,64,68],rep:3},
    {id:'nthKN',x0:RG.wr0,y0:RG.nr1,x1:AV.r1,y1:RG.nr1+.16,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'nthN',x0:RG.wx0,y0:RG.nr1+.16,x1:AV.r1+.16,y1:RG.ny1,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'ghostst',bld:true,x0:BOD.GDK.ground.x0,y0:BOD.GDK.Y0-1.2,x1:BOD.GDK.ground.x1,y1:BOD.GDK.y1e,z:.1,col:BOD.GDK.court,tex:null,rep:2},
    {id:'grassW',x0:MAP.x0,y0:B00.y0,x1:B0.x0,y1:W,z:0,col:holed(lawnCol),tex:null,rep:2},...PATCH].map(g=>g.id==='corner'||g.bld||g.id==='alley'||g.id==='grassW'||g.col===RW?g:{...g,col:SW(g.col)});
  BOD.LAMPS=LAMPS.filter(l=>!l.off&&l.r>0);
