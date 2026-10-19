function gdShape(GS,K,LAMPS){ const s=K.s, o=K.o, SC=1.5, cx=o[0]+4*s, Y1=o[1]+3.2*s, W=6.8*s*SC, D=3*s*SC, X0=cx-W/2, X1=cx+W/2, Y0=Y1-D, dx=(W-6.8*s)/2;
  for(let i=GS.length-1;i>=0;i--){ const p=GS[i]; for(let j=LAMPS.length-1;j>=0;j--)if(LAMPS[j].prop===p)LAMPS.splice(j,1); GS.splice(i,1); }
  const G=BOD.GDK={o,s,SC,X0,X1,Y0,Y1,W,D,cx,y1e:o[1]+8.3*s};
  G.ground={x0:X0-1.6,x1:X1+1.6};
  G.court=(x,y)=>{ const {hash,grain}=BOD.g, sh=BOD.K.sh, px=Math.floor(x*24), py=Math.floor(y*24);
    const out=x<X0||x>X1||y<Y0||y>Y1; if(!out)return [96,90,84];
    const dEave=Math.max(X0-x,x-X1,Y0-y,y-Y1);
    const wet=G.puddles.some(([pcx,pcy,rx,ry])=>{ const u=(x-pcx)/rx, v=(y-pcy)/ry; return u*u+v*v+(grain(x*3,y*3,611,.6)-.5)*.5<1; });
    let c;
    if(dEave<.42){ const cx_=Math.floor(px/3), cy_=Math.floor(py/3), h=hash(cx_,cy_,612), ix=px-cx_*3, iy=py-cy_*3;
      c=[66,68,76]; }
    else if(Math.abs(x-(X0+W/2))<1.35&&y>Y1){ const row=Math.floor((y-Y1-.42)/.82), off=hash(row,3,613)*.9, col=Math.floor((x-X0-W/2+1.35+off)/1.05), fu=((x-X0-W/2+1.35+off)/1.05)%1, fv=((y-Y1-.42)/.82)%1;
      const j=fu<.05||fv<.06, bev=fu<.1||fv<.11?1.1:fu>.93||fv>.92?.84:1, t=hash(col,row,614);
      if(j)c=grain(x*2,y*2,615,.5)>.55?[66,88,50]:[46,44,46];
      else c=sh([[132,130,128],[118,118,120],[146,142,136],[124,120,116]][Math.floor(t*4)],bev*(.95+.08*hash(px,py,616)));
      if(!j&&hash(px>>1,py>>1,617)<.02)c=sh(c,.8); }
    else{ c=grain(x*.3,y*.3,618,.8)>.6?[124,120,114]:[136,132,126]; if(grain(x*.5,y*.5,619,.8)>.7)c=[90,108,64]; }
    if(y>G.y1e-.22)c=sh([150,148,144],y>G.y1e-.06?.8:1.05+.05*hash(px,0,620));
    if(wet)c=sh(c.map((v,i)=>v*[.68,.72,.84][i]),hash(px>>1,py,621)<.1?1.15:1);
    return c; };
  G.puddles=[[X0+3.1,Y1+1.75,1.15,.55],[X0+10.7,Y1+1.9,1.3,.6],[X0+W/2+1.8,Y1+3.3,.6,.35]]; }
{ const {X,Y,Z,gbox,faceTex,bq,C}=BOD, J=BOD.GDJ, GK=BOD.GDK, {hash,grain}=BOD.g, sh=BOD.K.sh;
  if(GK){ const {X0,X1,Y0,Y1,W,D}=GK, T=.22, H=168, H2=300, DH=118, hs=hash;
    const xi0=X0+T, xi1=X1-T, yi0=Y0+T, yi1=Y1-T, cx=(xi0+xi1)/2, cy=(yi0+yi1)/2, WD=J.DJWOOD;
    const lit=c=>Object.assign([Math.min(255,c[0]),Math.min(255,c[1]),Math.min(255,c[2])],{e:1});
    J.setDJ({H:160});
    const BAY={a0:1.4,a1:5.2,z0:36,z1:124,out:.75}, DOOR={a0:W/2-1.2,a1:W/2+1.2,z0:0,z1:DH}, EW={a0:9.4,a1:12.4,z0:40,z1:124};
    const RND={back:[3.3],west:[D/2]}, RZc=76, RR=27;
    const UW=[{a0:2.0,a1:4.6},{a0:W-4.6,a1:W-2.0}], UZ0=H+42, UZ1=H+104, SIGN={a0:W/2-1.45,a1:W/2+1.45,z0:H+46,z1:H+100};
    const IVY={front:[[.25,262,1.3],[W-.3,150,.7]],west:[[.9,290,1.5],[3.5,210,1.3],[5.6,130,.9]],back:[[1.6,190,1.4],[8.6,250,1.7],[13.2,150,.8]],east:[[4.6,120,.8]]};
    const LEAF=[[30,56,36],[42,78,44],[60,102,52],[88,132,64]];
    const holesOf={front:[BAY,DOOR,EW],back:[],west:[],east:[]};
    const inOpen=(f,a,z)=>{ for(const h of holesOf[f])if(a>h.a0-.12&&a<h.a1+.12&&z>h.z0-4&&z<h.z1+4)return true; for(const m of RND[f]||[])if(Math.hypot((a-m)*24,z-RZc)<RR+5)return true;
      if(f==='front'){ for(const u of UW)if(a>u.a0-.12&&a<u.a1+.12&&z>UZ0-4&&z<UZ1+4)return true; if(a>SIGN.a0-.1&&a<SIGN.a1+.1&&z>SIGN.z0-4&&z<SIGN.z1+4)return true; } return false; };
    const ivyK=(f,a,z)=>{ let best=0; for(const [ra,hm,w] of IVY[f]||[]){ if(z>hm+12)continue; const t=z/hm, sp=w*(.3+.9*Math.sin(Math.min(1,t)*2.4)), d=Math.abs(a-ra)/Math.max(.08,sp);
        best=Math.max(best,1-d-Math.max(0,t-.75)*2.4+(grain(a*2.2+ra,z/16,640,.5)-.5)*.9); } return best; };
    const ivy=(f,a,z)=>{ if(inOpen(f,a,z))return null; const k=ivyK(f,a,z);
      for(const [ra,hm] of IVY[f]||[])if(z<hm*.8&&Math.abs(a-(ra+.18*Math.sin(z/17+ra*3)+.06*Math.sin(z/5)))<.045&&k>-.3)return [70,56,40];
      if(k<.32)return null; const qa=Math.floor(a*24/3), qz=Math.floor(z/3), h=hs(qa,qz,641), ia=Math.floor(a*24)-qa*3, iz=Math.floor(z)-qz*3;
      if(h<.14||k<.42&&h<.5)return k<.42?null:[20,34,24];
      return ia===0&&iz===2?LEAF[3]:LEAF[h<.42?0:h<.78?1:2]; };
    const BRD=[[112,74,52],[98,64,46],[124,84,58],[88,58,44],[106,70,50],[118,80,60]], POST=[78,48,40];
    const board=(a,z)=>{ const p=Math.floor(a*24), w=6+Math.floor(hs(Math.floor(p/8),5,650)*3), b=Math.floor(p/w), bx=p-b*w;
      if(bx===0)return [40,26,22];
      let c=BRD[Math.floor(hs(b,1,651)*BRD.length)]; c=sh(c,.9+.16*hs(p,Math.floor(z/(4+hs(b,2,652)*7)),653)); if(bx===1)c=sh(c,1.12);
      const kz=20+hs(b,3,654)*120; if(hs(b,4,655)<.3&&Math.abs(z-kz)<2.4&&Math.abs(bx-w/2)<1.5)c=[56,34,26];
      if(z>=50&&z<56)c=z<51?[150,100,70]:sh(POST,1.05);
      if(Math.abs(z-53)<.6&&bx===Math.floor(w/2))c=[44,44,48];
      if(z<16)c=sh(c,z<6?.6:z<11?.72:.84); if(z<4&&hs(p,Math.floor(z),656)<.45)c=[64,82,48];
      return c; };
    const plaster=(f,a,z)=>{ let c=sh([206,196,172],.93+.09*grain(a*1.2,z/30,660,1)); const p=Math.floor(a*24);
      if(hs(p,Math.floor(z),661)<.05)c=sh(c,.9); if(z>H2-16)c=sh(c,z>H2-7?.72:.84);
      if(f==='front')for(const u of UW)if(a>u.a0&&a<u.a1&&z<UZ0&&z>UZ0-50&&hs(p,0,662)<.35+(UZ0-z)/200)c=sh(c,.84);
      const cr=Math.abs(a-(f==='front'?6.4:2.6)-.12*Math.sin(z/6)-.04*Math.sin(z*1.7)); if(cr<.03&&z>H+10&&z<H+70)c=[96,88,76];
      if(grain(a*1.3+(f==='west'?9:0),z/34,663,1)>.8){ c=(p+Math.floor(z))%4<2?[124,86,58]:[92,62,44]; }
      return c; };
    const lattice=(a,a0,a1,z,z0,z1,glow)=>{ const p=Math.floor((a-a0)*24), L=Math.round((a1-a0)*24); if(p<2||p>=L-2||z<z0+2||z>=z1-2)return [60,38,30];
      if(p%5===0)return [70,44,34];
      return lit(Math.floor(z-z0)%16===0?sh(glow,.86):glow); };
    const round=(a,m,z,glow)=>{ const r=Math.hypot((a-m)*24,z-RZc); if(r>=RR+3)return null; if(r>=RR-1)return [62,40,32]; const u=Math.floor((a-m)*24+40), v=Math.floor(z+40); return u%7===0||v%7===0?[86,56,40]:lit(glow); };
    const WARM=[255,206,128], AMBER=[255,186,96], PINK=[246,150,140];
    const outside=(f,a,z,k)=>{ let c=null;
      if(z<H){ for(const m of RND[f]||[]){ const r=round(a,m,z,WARM); if(r)return r.e?r:sh(r,k); }
        for(const h of holesOf[f])if(a>h.a0-.13&&a<h.a1+.13&&z>h.z0-4&&z<h.z1+4&&!(a>h.a0&&a<h.a1&&z>h.z0&&z<h.z1)){ c=z>=h.z1?[66,40,32]:POST; break; }
        if(!c)c=board(a,z); }
      else{ if(f==='front')for(const u of UW)if(a>u.a0&&a<u.a1&&z>UZ0&&z<UZ1)return lattice(a,u.a0,u.a1,z,UZ0,UZ1,AMBER);
        if((f==='west'||f==='east'||f==='back')&&Math.abs(a-(f==='back'?W/2:D/2))<1&&z>UZ0&&z<UZ1)return lattice(a,(f==='back'?W/2:D/2)-1,(f==='back'?W/2:D/2)+1,z,UZ0,UZ1,AMBER);
        c=plaster(f,a,z); }
      const v=ivy(f,a,z); if(v)c=v; return sh(c,k); };
    const wood=(f=1)=>sh(WD,f);
    function shoji(a,z,L,door,win,alc,holes){ const n=Math.max(1,Math.round(L/2)), sp=L/n, pa=a-Math.floor(a/sp)*sp;
      if(door&&a>door[0]-.1&&a<door[1]+.1){ if(z<DH+4)return wood(z<DH+1?.8:1.12);
        if(z>=DH+6&&z<DH+16&&a>door[0]+.05&&a<door[1]-.05)return (a*8)%1<.22||z%4.5<1.2?wood(1.15):[40,30,26]; }
      for(const h of holes||[])if(a>h[0]-.14&&a<h[1]+.14&&z>h[2]-5&&z<h[3]+5)return wood(z<h[2]?.8:1.05);
      if(z>=147)return sh(J.DJPLA,.94+.06*hash(Math.floor(a*20),Math.floor(z/2),721));
      if(z>=139)return wood(z<140.5?.8:1.12);
      if(alc&&a>alc[0]&&a<alc[1]){ const u=(a-alc[0])*24, L=(alc[1]-alc[0])*24, m=118-Math.abs(u-L*.55)*1.1; if(z<10||z>134||u<2||u>L-2)return wood(z<10?.7:1);
        if(z<44)return ((u+4*Math.sin(z*.5))%14<2&&z%10>6)?[226,236,240]:[44,96,150]; if(z<m)return z>m-22+4*Math.sin(u*.7)?[240,242,246]:[70,96,140]; return z>110?[168,206,230]:[150,196,224]; }
      for(const w of win){ const r=Math.hypot((a-w)*24,z-RZc); if(r<RR+2.5){ if(r>=RR)return wood(); return ((a-w)*24+40)%7<1.3||(z+40)%7<1.3?wood(1.2):lit(WARM); } }
      if(pa<.09||pa>sp-.09||a<.09||a>L-.09)return wood();
      if(z<12)return wood(z<1?.6:(a*6)%1<.08?.75:1.05);
      if(z<13.5||z>136.5||(a*4)%1<.07||z%12<1)return wood(1.25);
      return sh(J.DJPAP,.94+.06*hash(Math.floor(a*12),Math.floor(z/3),723)); }
    const WALLS={front:{n:[0,-1],ax:'x',at0:Y1-T,at1:Y1,o:X0,L:W,inA:a=>a-T,inL:xi1-xi0,win:[],door:[DOOR.a0-T,DOOR.a1-T],holes:[[BAY.a0-T,BAY.a1-T,BAY.z0,BAY.z1],[EW.a0-T,EW.a1-T,EW.z0,EW.z1]]},
      back:{n:[0,1],ax:'x',at0:Y0,at1:Y0+T,o:X0,L:W,inA:a=>a-T,inL:xi1-xi0,win:RND.back.map(m=>m-T),alc:null},
      west:{n:[1,0],ax:'y',at0:X0,at1:X0+T,o:Y0,L:D,inA:a=>a-T,inL:yi1-yi0,win:RND.west.map(m=>m-T),s0:T,s1:D-T},
      east:{n:[-1,0],ax:'y',at0:X1-T,at1:X1,o:Y0,L:D,inA:a=>a-T,inL:yi1-yi0,win:[],s0:T,s1:D-T}};
    const TK=[xi0+7.8,xi0+11.6];
    WALLS.back.alc=[TK[0]-xi0-.12,TK[1]-xi0];
    const strips=(L,holes,s0=0,s1=L)=>{ const cuts=new Set([s0,s1]); for(const h of holes){ cuts.add(h.a0); cuts.add(h.a1); } const A=[...cuts].sort((p,q)=>p-q), out=[];
      for(let i=0;i+1<A.length;i++){ const u0=A[i], u1=A[i+1], m=(u0+u1)/2, hh=holes.filter(h=>m>h.a0&&m<h.a1).sort((p,q)=>p.z0-q.z0); let z=0;
        for(const h of hh){ if(h.z0>z)out.push([u0,u1,z,h.z0]); z=Math.max(z,h.z1); } if(z<H)out.push([u0,u1,z,H]); } return out; };
    const WB=[]; const box3=(w,u0,u1,z0,z1,t0,t1,fs,top,id)=>w.ax==='x'?{id,x0:w.o+u0,x1:w.o+u1,y0:t0,y1:t1,z0,z1,c:WD,fs,top}:{id,x0:t0,x1:t1,y0:w.o+u0,y1:w.o+u1,z0,z1,c:WD,fs,top};
    for(const id in WALLS){ const w=WALLS[id];
      for(const [u0,u1,z0,z1] of strips(w.L,holesOf[id],w.s0,w.s1))WB.push(box3(w,u0,u1,z0,z1,w.at0,w.at1,(nx,ny,x,y,zr,k)=>{ const z=zr+z0, a=(w.ax==='x'?x:y)-w.o;
        if(nx===w.n[0]&&ny===w.n[1])return shoji(w.inA(a),z,w.inL,w.door,w.win,w.alc,w.holes);
        if(nx===-w.n[0]&&ny===-w.n[1])return outside(id,a,z,k);
        return wood(.9); },()=>sh(WD,1.1),id)); }
    BATCH.tag=OBJ('bodega','bath house'); for(const b of WB)gbox(b,'GD'+b.id);
    const pw=(c,lo=.9,hi=1.08)=>(nx,ny,x,y,z,k)=>sh(c,k*(lo+(hi-lo)*hs(Math.floor((nx?y:x)*24),Math.floor(z/5),670)));
    const OUT={front:[0,1],back:[0,-1],west:[-1,0],east:[1,0]}, onWall=(f,a0,a1,z0,z1,d,c,more={})=>{ const w=WALLS[f], [ox,oy]=OUT[f], t=w.ax==='x'?(oy>0?[w.at1,w.at1+d]:[w.at0-d,w.at0]):(ox>0?[w.at1,w.at1+d]:[w.at0-d,w.at0]);
      return {...box3(w,a0,a1,z0,z1,t[0],t[1],more.fs||pw(c),more.top||(()=>sh(c,1.12)),f),...more}; };
    const POSTS={front:[0,BAY.a0-.08,BAY.a1+.08,DOOR.a0-.1,DOOR.a1+.1,EW.a0-.08,EW.a1+.08,W],back:[0,5.6,9.4,W],west:[.85,D-.85],east:[D/3,2*D/3]};
    const DEP=[];
    for(const f in POSTS)for(const a of POSTS[f]){ const half=a===0||a===WALLS[f].L?.16:.11, a0=Math.max(-.08,a-half), a1=Math.min(WALLS[f].L+.08,a+half); DEP.push(onWall(f,a0,a1,12,H,.08,POST)); }
    for(const f in WALLS){ DEP.push(onWall(f,-.08,WALLS[f].L+.08,H-12,H,.1,[86,54,42])); DEP.push(onWall(f,-.08,WALLS[f].L+.08,H,H+8,.06,[70,44,36])); DEP.push(onWall(f,-.08,WALLS[f].L+.08,H2-8,H2,.06,[70,44,36])); }
    { const b0=BAY.a0, b1=BAY.a1, o=BAY.out, fr=[60,38,30];
      DEP.push(onWall('front',b0,b1,12,BAY.z0,o,[86,54,42],{fs:(nx,ny,x,y,z,k)=>sh(z>BAY.z0-20?(z>BAY.z0-16?[86,54,42]:[60,38,30]):board(x-X0,z+12),k)}));
      for(const a of [b0,b1])DEP.push(onWall('front',a-.04,a+.04,BAY.z0,BAY.z1,o,fr));
      const gl=(nx,ny,x,y,z,k)=>{ const a=x-X0, zz=z+BAY.z0, mull=Math.abs(((a-b0)%1.27)-.635)>.6||Math.abs(zz-96)<1.5||Math.abs(((a-b0)*24%10)-5)>4.4&&zz>96; return mull?sh(fr,k):lit(Math.floor(zz)%22===0?sh(PINK,.88):PINK); };
      DEP.push({id:'front',x0:X0+b0+.04,x1:X0+b1-.04,y0:Y1+o-.04,y1:Y1+o-.01,z0:BAY.z0,z1:BAY.z1,c:PINK,fs:(nx,ny,x,y,z,k)=>ny?gl(nx,ny,x,y,z,k):lit(sh(PINK,.9)),top:()=>lit(PINK)});
      for(let i=0;i<3;i++)DEP.push(onWall('front',b0-.15+i*.04,b1+.15-i*.04,BAY.z1+i*5,BAY.z1+5+i*5,o+.2-i*.1,[92,58,72],{top:(x)=>Math.floor(x*24)%6===0?[52,36,48]:[118,72,76]})); }
    { const L=EW.a1-EW.a0, n=Math.round(L/.21); for(let i=1;i<n;i++){ const a=EW.a0+i*L/n; DEP.push(onWall('front',a-.025,a+.025,EW.z0,EW.z1,.05,[68,42,32])); }
      DEP.push({id:'front',x0:X0+EW.a0,x1:X0+EW.a1,y0:Y1-.12,y1:Y1-.1,z0:EW.z0,z1:EW.z1,c:AMBER,fs:(nx,ny,x,y,z,k)=>lit(Math.floor(z+EW.z0)%16===0||Math.floor((x-X0-EW.a0)*24)%14===0?sh(AMBER,.86):AMBER),top:()=>lit(AMBER)});
      DEP.push(onWall('front',EW.a0-.1,EW.a1+.1,EW.z0-6,EW.z0,.14,[86,54,42])); }
    for(const u of UW){ const L=u.a1-u.a0, n=Math.round(L/.21); for(let i=1;i<n;i++){ const a=u.a0+i*L/n; DEP.push({...onWall('front',a-.025,a+.025,UZ0,UZ1,.05,[68,42,32]),id:'U'}); } DEP.push({...onWall('front',u.a0-.12,u.a1+.12,UZ0-6,UZ0,.12,[86,54,42]),id:'U'}); }
    { const S=SIGN, F5={B:'uhhuhhu',A:'ehhvhhh',T:'v444444',H:'hhhvhhh',O:'ehhhhhe',U:'hhhhhhe',S:'fgge11u',E:'vgguggv'}, txt=(t,i,j)=>{ const c=Math.floor(i/12), g=F5[t[c]], gi=Math.floor((i-c*12)/2), gj=Math.floor(j/2); return !!g&&j>=0&&gi<5&&gj<7&&!!(parseInt(g[gj],32)>>(4-gi)&1); };
      const gl=(a,z)=>{ const L=S.a1-S.a0, u=(a-S.a0)/L, v=(z-S.z0)/(S.z1-S.z0); if(u<.04||u>.96||v<.07||v>.93)return [52,34,28];
        const px=(a-S.a0)*24, pz=S.z1-z, W=L*24; if(txt('BATH',Math.floor(px-(W-46)/2),Math.floor(pz-10))||txt('HOUSE',Math.floor(px-(W-58)/2),Math.floor(pz-30)))return hs(Math.floor(a*24),Math.floor(z),684)<.12?[150,116,62]:[214,168,82];
        return sh([36,52,84],.92+.1*hs(Math.floor(a*12),Math.floor(z/3),685)); };
      DEP.push({...onWall('front',S.a0,S.a1,S.z0,S.z1,.16,[36,52,84],{fs:(nx,ny,x,y,z,k)=>ny>0?sh(gl(x-X0,z+S.z0),k):sh([52,34,28],k),top:()=>[60,40,32]}),id:'U'}); }
    for(const f in IVY){ const w=WALLS[f]; for(let i=0;i<70;i++){ const a=hs(i,f.length,690)*w.L, z=4+hs(i,f.length,691)*290; if(ivyK(f,a,z)<.55||inOpen(f,a,z))continue;
        const wd=.06+hs(i,1,692)*.09, ht=4+hs(i,2,693)*5, d=.04+hs(i,3,694)*.07, c=LEAF[1+Math.floor(hs(i,4,695)*3)];
        DEP.push({...onWall(f,a-wd,a+wd,z,z+ht,d,c,{fs:(nx,ny,x,y,zz,k)=>sh(LEAF[Math.floor(hs(Math.floor((nx?y:x)*48),Math.floor(zz),696)*3)],k),top:()=>c}),id:z<H?f:'U'}); } }
    for(const b of DEP)gbox(b,b.id==='U'?'GDU':'GD'+b.id);
    const UP=[]; for(const f in WALLS){ const w=WALLS[f]; UP.push(box3(w,w.s0||0,w.s1||w.L,H,H2,w.at0,w.at1,(nx,ny,x,y,zr,k)=>{ const z=zr+H, a=(w.ax==='x'?x:y)-w.o; return nx===-w.n[0]&&ny===-w.n[1]?outside(f,a,z,k):sh([180,170,150],k); },()=>[90,86,80],f)); }
    for(const b of UP)gbox(b,'GDU');
    const tileTop=(x,y,row)=>{ const p=Math.floor(x*24), m=((p%6)+6)%6, cI=Math.floor(p/6), t=hs(cI,row,700);
      let c=m===0?[46,32,42]:m<3?[124,74,76]:m<5?[96,60,72]:[74,48,62]; if(t<.025)c=[64,44,40];
      const mo=grain(x*1.5,y*1.5+row*.3,701,.7); if(mo>.7&&m)c=mo>.78?[82,98,58]:[96,104,66]; if(hs(p,Math.floor(y*24),702)<.012)c=[170,168,130]; return c; };
    const tileEnd=(x,z,k,row)=>{ const p=Math.floor(x*24), m=((p%6)+6)%6; return sh(m===0||z<1.5?[40,28,36]:z>5?[150,90,86]:[118,72,76],k); };
    const ROOF=[]; const strip=(x0,x1,y0,y1,z0,z1,row,kind)=>{ const b={x0,x1,y0,y1,z0,z1,c:[92,58,72],top:(x,y)=>tileTop(x,y,row),fs:(nx,ny,x,y,z,k)=>ny?tileEnd(x,z,k,row):sh(nx?(z<3?[40,28,36]:[64,42,44]):[64,42,60],k)}; ROOF.push(b); gbox(b,kind); };
    for(let i=0;i<4;i++)strip(X0-.35,X1+.35,Y1+.32*i,Y1+.32*(i+1),H+26-i*7,H+33-i*7,i,'GDU');
    for(let a=.2;a<W;a+=.45){ const rb={x0:X0+a-.035,x1:X0+a+.035,y0:Y1+.85,y1:Y1+1.3,z0:H+1,z1:H+5,c:[70,44,36]}; gbox(rb,'GDU'); }
    const ov=.9, N=13, half=D/2+ov, q=half/N, ym=(Y0+Y1)/2, RX0=X0-.7, RX1=X1+.7;
    for(let i=0;i<N;i++){ const z0=H2+i*8, z1=z0+8; strip(RX0,RX1,Y1+ov-(i+1)*q,Y1+ov-i*q,z0,z1,i,'GDR'); strip(RX0,RX1,Y0-ov+i*q,Y0-ov+(i+1)*q,z0,z1,i+20,'GDR');
      const gy0=Math.max(Y0,Y0-ov+(i+1)*q), gy1=Math.min(Y1,Y1+ov-(i+1)*q); if(gy1>gy0)for(const gx of [[X0,X0+T],[X1-T,X1]]){ const g={x0:gx[0],x1:gx[1],y0:gy0,y1:gy1,z0,z1,c:[190,180,158],fs:(nx,ny,x,y,z,k)=>sh(plaster('west',y-Y0,z+z0),k*.88),top:()=>[150,140,124]}; gbox(g,'GDR'); } }
    const RZ=H2+N*8; gbox({x0:RX0-.1,x1:RX1+.1,y0:ym-.24,y1:ym+.24,z0:RZ,z1:RZ+10,c:[64,46,58],top:(x)=>Math.floor(x*24)%8<1?[44,32,40]:[82,58,70],fs:(nx,ny,x,y,z,k)=>sh(z>7?[96,66,78]:[58,40,52],k)},'GDR');
    for(const ex of [RX0-.1,RX1-.25])gbox({x0:ex,x1:ex+.35,y0:ym-.3,y1:ym+.3,z0:RZ,z1:RZ+22,c:[70,50,60],top:()=>[96,70,82],fs:(nx,ny,x,y,z,k)=>sh(z>18?[110,80,92]:[70,50,60],k)},'GDR');
    const stone=(nx,ny,x,y,z,k)=>{ const a=(nx?y:x)*24, row=Math.floor(z/6), off=hs(row,7,710)*9, b=Math.floor((a+off)/13), ba=(a+off)%13;
      if(ba<1||z%6<1)return sh(grain(a/24*3,z/24*3,711,.5)>.6?[70,86,52]:[60,58,58],k); return sh([[132,128,120],[118,116,112],[146,140,130]][Math.floor(hs(b,row,712)*3)],k*(.94+.08*hs(Math.floor(a),Math.floor(z),713))); };
    const PL=[[X0-.1,X0+DOOR.a0,Y1,Y1+.12],[X0+DOOR.a1,X1+.1,Y1,Y1+.12],[X0-.1,X1+.1,Y0-.12,Y0],[X0-.12,X0,Y0,Y1],[X1,X1+.12,Y0,Y1]];
    for(const [a,b,c_,d] of PL)gbox({x0:a,x1:b,y0:c_,y1:d,z0:0,z1:12,c:[130,126,118],fs:stone,top:(x,y)=>sh([150,146,138],.95+.08*hs(Math.floor(x*24),Math.floor(y*24),714))},'GDL');
    gbox({x0:X0+DOOR.a0-.2,x1:X0+DOOR.a1+.2,y0:Y1,y1:Y1+.55,z0:0,z1:5,c:[140,136,128],fs:stone,top:(x,y)=>sh([156,152,146],(x*24)%26<1?.7:.95+.08*hs(Math.floor(x*24),Math.floor(y*24),715))},'GDL');
    const flat=(x0,y0,x1,y1,z,col,kind)=>bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],faceTex((x1-x0)*24,(y1-y0)*24,(i,j)=>C(col(x0+(i+.5)/24,y0+(j+.5)/24))),kind);
    flat(X0,Y0,X1,Y1,H+.5,(x,y)=>sh([92,62,48],.9+.1*hs(Math.floor(x*24/7),3,716)),'GDR');
    { const n=4, L=DOOR.a1-DOOR.a0, nz0=DH-38;
      for(let i=0;i<n;i++){ const a0=DOOR.a0+i*L/n+.02, a1=DOOR.a0+(i+1)*L/n-.02;
        gbox({x0:X0+a0,x1:X0+a1,y0:Y1-.12,y1:Y1-.09,z0:nz0,z1:DH,c:[38,52,96],fs:(nx,ny,x,y,z,k)=>{ const dx=((x-X0-DOOR.a0)/L-.5)*L*24, v=z+nz0-(DH-19), r=Math.hypot(dx,v+3), on=v<-2&&r>7.5&&r<10.5||v>-1&&v<13&&[-5,0,5].some(o=>Math.abs(dx-o-1.6*Math.sin(v*.45))<1.3); return sh(on?[226,222,210]:z<3?[30,40,74]:[38,52,96],k); },top:()=>[30,40,74]},'GDfront'); }
      BATCH.tag=OBJ('bodega','paper lantern');
      for(const a of [DOOR.a0-.5,DOOR.a1+.5]){ const x=X0+a, y=Y1+.55;
        gbox({x0:x-.01,x1:x+.01,y0:y-.01,y1:y+.01,z0:H-8,z1:H+18,c:[30,26,24]},'GDU');
        gbox({x0:x-.2,x1:x+.2,y0:y-.2,y1:y+.2,z0:H-34,z1:H-8,c:[220,60,44],top:()=>[40,30,28],fs:(nx,ny,X_,Y_,z)=>z<3||z>23?[40,30,28]:z%5<1?lit([200,40,30]):lit([255,96,64])},'GDL'); }
      BATCH.tag=OBJ('bodega','bath house'); }
    const THINGS=[]; const thing=(name,boxes,solid=true)=>{ BATCH.tag=OBJ('bodega',name); for(const b of boxes)gbox(b,'GDL'); THINGS.push({name,boxes,solid}); };
    const bk=(x0,y0,x1,y1,z0,z1,c,more={})=>({x0,y0,x1,y1,z0,z1,c,...more});
    { const bx=X1-.75, by=Y1+.18, R=[176,44,34], bf=(nx,ny,x,y,z,k)=>sh(z>9&&z<11?[30,26,24]:R,k);
      thing('fire buckets',[bk(bx,by,bx+.3,by+.3,0,12,R,{fs:bf}),bk(bx+.32,by,bx+.62,by+.3,0,12,R,{fs:bf}),bk(bx+.16,by+.02,bx+.46,by+.32,12,24,R,{fs:bf,top:()=>[60,30,26]})]); }
    { const x=X0+DOOR.a0-.62, y=Y1+.2; thing('umbrella stand',[bk(x,y,x+.3,y+.3,0,20,[48,58,70],{top:()=>[24,24,28]}),bk(x+.06,y+.08,x+.1,y+.12,20,40,[150,40,40]),bk(x+.18,y+.14,x+.22,y+.18,20,36,[40,60,110])]); }
    { const x=X0+EW.a0-.2, y=Y1+.12; thing('broom',[bk(x,y,x+.04,y+.04,10,52,[150,120,80]),bk(x-.08,y-.02,x+.12,y+.08,0,12,[176,150,90])],false); }
    { const x=X0+DOOR.a1+.3, y=Y1+.18, pot=[52,86,132]; thing('glazed pots',[bk(x,y,x+.42,y+.42,0,14,pot,{top:()=>[52,42,36],fs:(nx,ny,X_,Y_,z,k)=>sh(z>11?sh(pot,1.2):pot,k)}),bk(x-.06,y-.06,x+.48,y+.48,14,32,LEAF[2],{fs:(nx,ny,X_,Y_,z,k)=>sh(LEAF[Math.floor(hs(Math.floor((nx?Y_:X_)*24),Math.floor(z/2),720)*4)],k),top:(X_,Y_)=>LEAF[1+Math.floor(hs(Math.floor(X_*24),Math.floor(Y_*24),721)*3)]})]); }
    { const x0=X0+EW.a0+.25, x1=X0+EW.a1-.25, y0=Y1+.16, y1=Y1+.56, wd=[120,84,58];
      thing('wooden bench',[bk(x0,y0,x1,y1,13,17,wd,{top:(x,y)=>Math.floor((y-y0)*24)%5===0?[70,46,36]:sh(wd,1.1)}),bk(x0+.1,y0+.05,x0+.22,y1-.05,0,13,[90,60,44]),bk(x1-.22,y0+.05,x1-.1,y1-.05,0,13,[90,60,44])]); }
    { const x0=X1+.12, y=Y0+1.1, cr=[150,110,70], bt=(nx,ny,x,yy,z,k)=>sh(z>9?[60,100,70]:cr,k);
      thing('crates of empty bottles',[bk(x0,y,x0+.6,y+.5,0,12,cr,{fs:bt,top:(x,yy)=>(Math.floor(x*24)+Math.floor(yy*24))%3?[44,90,60]:[30,40,34]}),bk(x0,y+.55,x0+.6,y+1.05,0,12,cr,{fs:bt,top:()=>[44,90,60]}),bk(x0+.02,y+.02,x0+.58,y+.48,12,24,cr,{fs:bt,top:(x,yy)=>(Math.floor(x*24)+Math.floor(yy*24))%3?[110,70,40]:[30,40,34]})]); }
    { const x=X0-.6, y=Y1-.6, wd=[100,68,48]; thing('rain barrel',[bk(x,y,x+.48,y+.48,0,24,wd,{fs:(nx,ny,X_,Y_,z,k)=>sh(z%8<1.4?[52,52,56]:wd,k),top:()=>[34,44,56]})]); }
    const bed=(name,x0,y0,x1,y1,lant,seed)=>{ const bs=[bk(x0,y0,x1,y1,0,6,[118,112,108],{fs:stone,top:(x,y)=>x<x0+.08||x>x1-.08||y<y0+.08||y>y1-.08?[134,128,122]:sh([52,42,38],.9+.2*hs(Math.floor(x*24),Math.floor(y*24),740))})];
      const n=Math.max(3,Math.round((x1-x0+y1-y0)*2.2)); for(let i=0;i<n;i++){ const r=a=>hs(i,a,seed), cx_=x0+.15+(x1-x0-.3)*r(1), cy_=y0+.15+(y1-y0-.3)*r(2), w=.14+r(3)*.16, h=10+r(4)*16, bl=r(5)<.45;
        bs.push(bk(cx_-w,cy_-w,cx_+w,cy_+w,6,6+h,LEAF[2],{fs:(nx,ny,X_,Y_,z,k)=>{ const q=hs(Math.floor((nx?Y_:X_)*24),Math.floor(z/2),741+i); return sh(bl&&q>.93?[236,120,150]:LEAF[Math.floor(q*3)+(z>h-4?1:0)],k); },top:(X_,Y_)=>{ const q=hs(Math.floor(X_*24),Math.floor(Y_*24),742+i); return bl&&q>.88?(q>.95?[252,170,182]:[226,104,140]):LEAF[1+Math.floor(q*3)]; }})); }
      for(const [lx,ly] of lant){ bs.push(bk(lx-.012,ly-.012,lx+.012,ly+.012,6,20,[60,44,34])); bs.push(bk(lx-.08,ly-.08,lx+.08,ly+.08,20,30,[255,220,170],{fs:(nx,ny,X_,Y_,z)=>z<1||z>9?[60,44,34]:lit(z%3<1?[255,200,150]:[255,236,200]),top:()=>[60,44,34]})); }
      thing(name,bs,false); BEDS.push([x0,y0,x1,y1]); };
    const BEDS=[];
    bed('planted bed with lanterns',X0+1.1,Y1+1.25,X0+5.5,Y1+1.85,[[X0+2.2,Y1+1.55],[X0+4.4,Y1+1.5]],750);
    bed('long planted bed',X0-1.45,Y1+1.4,X0-.55,Y1+5.2,[[X0-1,Y1+3.3]],760);
    bed('small planted bed',X1+.25,Y1+.25,X1+1.15,Y1+1.1,[],770);
    BATCH.tag=null;
    const floorCol=(x,y)=>{ const e=Math.min(x-xi0,xi1-x,y-yi0,yi1-y), i=Math.floor(x*4), j=Math.floor(y*4); if(x*4-i<.08||y*4-j<.08)return [138,146,150];
      return sh(e<.5?[66,112,150]:hash(i,j,701)<.14?[110,160,186]:[206,214,216],.95+.08*hash(i,j,702)); };
    const PX0=cx-3.3, PX1=cx+3.3, PY0=cy-1.2, PY1=cy+1.2, HN=[184,146,100], hoop=(nx,ny,x,y,z,k)=>sh(z%4<1?[70,64,60]:HN,k);
    thing('bath pool',[bk(PX0,PY0,PX1,PY0+.2,0,12,HN,{fs:pw(HN)}),bk(PX0,PY1-.2,PX1,PY1,0,12,HN,{fs:pw(HN)}),bk(PX0,PY0+.2,PX0+.2,PY1-.2,0,12,HN,{fs:pw(HN)}),bk(PX1-.2,PY0+.2,PX1,PY1-.2,0,12,HN,{fs:pw(HN)}),
      bk(PX0+.2,PY0+.2,PX1-.2,PY1-.2,0,8,[74,158,180],{top:(x,y)=>(Math.floor(x*24+3*Math.sin(y*9))%9===0&&hash(Math.floor(x*3),Math.floor(y*6),703)<.5)?lit([170,226,236]):[74,158,180]})]);
    for(const [x0,x1] of [[xi0+.1,xi0+.55],[xi1-.55,xi1-.1]])thing('wooden bench',[bk(x0,cy-1.5,x1,cy+1.5,13,17,HN,{top:(x,y)=>Math.floor(y*24)%5===0?[120,90,60]:sh(HN,1.06)}),bk(x0+.05,cy-1.4,x1-.05,cy-1.25,0,13,[120,90,60]),bk(x0+.05,cy+1.25,x1-.05,cy+1.4,0,13,[120,90,60])]);
    for(const [x,y] of [[cx-2.7,PY1+.3],[cx-2.25,PY1+.35],[cx+2.4,PY1+.3]])thing('wooden bucket',[bk(x,y,x+.3,y+.3,0,9,HN,{fs:hoop,top:()=>[90,140,160]})],false);
    for(const [x,y] of [[cx-1.6,PY1+.3],[cx+1.7,PY1+.3]])thing('bath stool',[bk(x,y,x+.36,y+.3,6,8,HN),bk(x+.03,y+.03,x+.08,y+.27,0,6,[120,90,60]),bk(x+.28,y+.03,x+.33,y+.27,0,6,[120,90,60])],false);
    BATCH.tag=null;
    flat(xi0,yi0,xi1,yi1,.4,floorCol,'GDL'); flat(X0+DOOR.a0,Y1-T,X0+DOOR.a1,Y1,.4,(x,y)=>sh(J.DJBRD,(x*5)%1<.1?.72:1),'GDL');
    flat(X0+BAY.a0,Y1-T,X0+BAY.a1,Y1+BAY.out,BAY.z0+.3,(x,y)=>sh(J.DJBRD,(x*5)%1<.1?.72:1),'GDfront');
    const ITEMS=[], CAND=[[xi0+.5,yi0+.5],[xi1-.5,yi0+.5],[xi0+.5,yi1-.5],[xi1-.5,yi1-.5]], AND=[[X0+DOOR.a0-.6,yi1-.45],[X0+DOOR.a1+.6,yi1-.45]];
    const WAX=[226,214,186], WG=[236,184,120], E=c=>Object.assign(c,{e:1}), wax=p=>{ for(const b of p.boxes)if(!b.life)for(const f of ['fs','fi','fj','top']){ const g=b[f]; if(g)b[f]=(...a)=>{ const c=g(...a); if(!c)return c; if(!c.e)return f==='fs'?E(sh(WG,.28)):c;
        const k=Math.max(0,Math.min(1,(c[0]/240-.3)/1.07)); return f==='top'?E(sh(WG,.62)):E(sh(WG,.3+.34*k*k)); }; }
      const fb=p.boxes.find(b=>b.life), x=(fb.x0+fb.x1)/2, y=(fb.y0+fb.y1)/2; p.boxes.push({x0:x-.012,y0:y-.012,x1:x+.012,y1:y+.012,z0:30,z1:32.5,c:[26,22,20],foot:0,nb:1}); return p; };
    for(const [x,y] of CAND)ITEMS.push(wax(J.djCandle(x,y))); for(const [x,y] of AND)ITEMS.push(J.djAndon(x,y));
    for(const p of ITEMS){ BATCH.tag=OBJ('bodega',p.name); for(const b of p.boxes)gbox(b,'GDL'); } BATCH.tag=null;
    const PLN={}; for(const id in WALLS)PLN[id]=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
    BATCH.cast=true;
    BATCH.build((k,map,emap)=>{ const pl=PLN[k.slice(2)], cp=pl?{clippingPlanes:[pl]}:{};
      if(k==='B')return new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5});
      return new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.3}:{}),...cp}); });
    BATCH.cast=false; const KM=BATCH.meshes; BATCH.meshes={}; for(const me of BATCH.all(KM,'B'))me.castShadow=false;
    const ix0=X(xi0), ix1=X(xi1), iz0=Z(yi0), iz1=Z(yi1), inside=()=>pos.x>Math.min(ix0,ix1)&&pos.x<Math.max(ix0,ix1)&&pos.z>Math.min(iz0,iz1)&&pos.z<Math.max(iz0,iz1);
    for(const id in WALLS)for(const me of BATCH.all(KM,'GD'+id))cutWalls.push({pl:PLN[id],nx:WALLS[id].n[0],nz:WALLS[id].n[1],foot:Y(8),me,when:inside});
    const HIDE=[...BATCH.all(KM,'GDU'),...BATCH.all(KM,'GDR')];
    if(BOD.GHOSTST)BOD.GHOSTST.push({name:'ghost street shop roof',boxes:ROOF.filter(b=>b.z0>=H2).map(b=>({...b,x0:Math.max(b.x0,X0),x1:Math.min(b.x1,X1)})),high:1});
    const sol=(x0,y0,x1,y1,zt)=>{ solids.push([X(x0),Z(y0),X(x1),Z(y1)]); fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt))]); };
    for(const b of WB)if(b.z0===0)sol(b.x0,b.y0,b.x1,b.y1,H);
    sol(X0+BAY.a0,Y1,X0+BAY.a1,Y1+BAY.out,BAY.z0);
    for(const [a,b,c_,d] of BEDS)sol(a,b,c_,d,8);
    for(const t of THINGS)if(t.solid)sol(Math.min(...t.boxes.map(b=>b.x0)),Math.min(...t.boxes.map(b=>b.y0)),Math.max(...t.boxes.map(b=>b.x1)),Math.max(...t.boxes.map(b=>b.y1)),Math.max(...t.boxes.map(b=>b.z1)));
    for(const p of ITEMS){ const bs=p.boxes.filter(b=>b.z0<30&&b.z1-b.z0>3); if(!bs.length||/incense/.test(p.name))continue;
      sol(Math.min(...bs.map(b=>b.x0)),Math.min(...bs.map(b=>b.y0)),Math.max(...bs.map(b=>b.x1)),Math.max(...bs.map(b=>b.y1)),Math.max(...bs.map(b=>b.z1))); }
    const LT=[];
    const light=(x,y,z,c,r,fl)=>{ const cm=Math.max(...c), L=new THREE.PointLight(new THREE.Color(c[0]/cm,c[1]/cm,c[2]/cm),0,r*TILE*1.25,1.6); L.position.set(X(x),Y(z),Z(y)); scene.add(L); LT.push({L,i:7*cm*Math.min(1.2,r/5),fl,s:Math.round(x*7+y*13)}); return LT[LT.length-1]; };
    for(const [x,y] of CAND)light(x,y,34,[.85,.42,.17],5,1); FLAME.props(ITEMS,X,Y,Z);
    for(const [i,sx] of [cx-2.3,cx-.8,cx+.7,cx+2.2].entries())FLAME.add({kind:'none',x:X(sx),y:Y(9),z:Z(cy+(i%2?.3:-.3)),w:.6*TILE,smoke:.8,steam:1,sk:1.5,seed:i});
    for(const [x,y] of AND)light(x,y,20,[.66,.34,.14],5.5,0);
    const OUTL=[[X0+(BAY.a0+BAY.a1)/2,Y1+1.4,70,[1,.6,.56],7],[X0+(EW.a0+EW.a1)/2,Y1+1.3,74,[1,.74,.42],7.5],[X0+W/2,Y1+1.2,90,[1,.66,.4],6],[X0+W/2,Y1+.9,H+60,[1,.72,.44],6],[X0-1.1,Y0+D/2,80,[1,.76,.5],5]];
    for(const [x,y,z,c,r] of OUTL){ const cm=Math.max(...c), L=new THREE.PointLight(new THREE.Color(c[0]/cm,c[1]/cm,c[2]/cm),9*cm*Math.min(1.3,r/5),r*TILE*1.25,1.6); L.position.set(X(x),Y(z),Z(y)); L.userData.i0=L.intensity; scene.add(L); }
    const SH=[]; { const V=THREE.Vector3, g0=Y(.6);
      const add=(P,col,gaps,a0w,a1w,z0,z1,yf)=>{ for(const [u0,u1] of gaps){ const Q=[[u0,z0],[u1,z0],[u1,z1],[u0,z1]].map(([a,z])=>new V(X(X0+a),Y(z),Z(yf)));
          const G=Q.map(q=>{ const f=(q.y-g0)/(Y(122)-g0); return new V(q.x,g0,q.z+(Z(Y1+1)-Z(Y1))*P*f); });
          for(const [k,f] of [[0,1],[1,.5]]){ const Gk=G.map((g,i)=>Q[i].clone().lerp(g,f)), pos=[], tri=(a,b,c)=>pos.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z), quad=(a,b,c,d)=>{ tri(a,b,c); tri(a,c,d); };
            quad(Q[0],Q[1],Gk[1],Gk[0]); quad(Q[3],Q[2],Gk[2],Gk[3]); quad(Q[0],Q[3],Gk[3],Gk[0]); quad(Q[1],Q[2],Gk[2],Gk[1]); if(!k){ const Gp=G.map(g=>g.clone().setY(g0+.01)); quad(Gp[0],Gp[1],Gp[2],Gp[3]); }
            SH.push({pos,col,k}); } } };
      const gapsOf=(a0,a1,n)=>{ const L=(a1-a0)/n, o=[]; for(let i=0;i<n;i++)if(i%2===0)o.push([a0+i*L+.03,a0+(i+1)*L-.03]); return o; };
      { const P=2.1; add(P,0xffb860,gapsOf(EW.a0,EW.a1,Math.round((EW.a1-EW.a0)/.21)),EW.a0,EW.a1,EW.z0+6,EW.z1-6,Y1+.07); }
      { const P=1.8; add(P,0xff9e96,[[BAY.a0+.08,BAY.a0+1.2],[BAY.a0+1.35,BAY.a0+2.45],[BAY.a0+2.6,BAY.a1-.08]],BAY.a0,BAY.a1,BAY.z0+2,BAY.z1-2,Y1+BAY.out+.01); }
      { const P=2.4; add(P,0xffa860,[[DOOR.a0+.1,DOOR.a1-.1]],DOOR.a0,DOOR.a1,2,DH-40,Y1+.01); } }
    const SHM={}; for(const s of SH){ const key=s.col+':'+s.k; (SHM[key]||(SHM[key]={col:s.col,pos:[]})).pos.push(...s.pos); }
    const SHX=[]; for(const key in SHM){ const S=SHM[key], g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(S.pos,3)); g.computeBoundingSphere();
      const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:S.col,transparent:true,opacity:.1,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false})); m.renderOrder=3; scene.add(m); SHX.push(m); }
    { const pos=[]; for(const [pcx,pcy,rx,ry] of GK.puddles){ for(let i=0;i<9;i++){ const x=pcx-rx*.7+i*rx*1.4/8+(hs(i,1,730)-.5)*.08, l=ry*(.5+hs(i,2,731)*1.2), y0=pcy-ry*.55+hs(i,3,732)*ry*.3, w=(1+Math.floor(hs(i,4,733)*2))/24;
        const a=[X(x),Y(.7),Z(y0)], b=[X(x+w),Y(.7),Z(y0)], c=[X(x+w),Y(.7),Z(y0+l)], d=[X(x),Y(.7),Z(y0+l)]; pos.push(...a,...b,...c,...a,...c,...d); } }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.computeBoundingSphere();
      const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xffc890,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false})); m.renderOrder=3; m.userData.k=2.4; scene.add(m); SHX.push(m); }
    let was=null, hid=null, step=-1;
    BOD.GD={r:[xi0,yi0,xi1,yi1],door:[X0+W/2,Y1],H:H+2,eave:H,inside,tick(){ const t=performance.now()/1000, inn=inside();
      for(const l of LT){ const k=l.fl?FLAME.flick(l.s,t):1; if(inn||was!==inn)l.L.intensity=inn?l.i*k:0; } was=inn;
      if(hid!==inn){ hid=inn; for(const me of HIDE)SEEN(me,!inn); }
      const e=typeof CLOCK!=='undefined'&&CLOCK.elev?CLOCK.elev():0, n=Math.max(0,Math.min(1,(12-e)/22)), st=inn?-1:Math.round(n*3);
      if(st!==step){ step=st; for(const m of SHX){ m.visible=st>=0; m.material.opacity=[.05,.08,.12,.16][Math.max(0,st)]*(m.userData.k||1); } } }};
    window.GSDBG=()=>({X0,X1,Y0,Y1,door:BOD.GD.door,step,shafts:SHX.length,tris:SH.length});
    window.LOOKAT=(x,z,k=1,y=0)=>{ UI.setFree(true); UI.camT.set(x,y,z); ppu=ppuTo=PPU*k; return [x,z]; };
    window.LOOKYAW=d=>{ yaw=yawTo=d*Math.PI/180; }; window.LOOKPITCH=d=>{ pitch=pitchTo=d*Math.PI/180; return pitch; };
    window.GSLOOK=(dx=0,dy=0,k=.5,d)=>{ if(d!=null)LOOKYAW(d); return LOOKAT(X(X0+W/2+dx),Z(Y1+dy),k); };
    window.GSGO=(dx=0,dy=4)=>{ if(window.SUBGO)SUBGO(X(X0+W/2+dx),Z(Y1+dy),'up'); return [X(X0+W/2+dx),Z(Y1+dy)]; }; } }
