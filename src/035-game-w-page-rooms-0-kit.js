const PGK=(()=>{ const ZS=27, TX=24, E1=1<<24, E2=2<<24, SKY=3<<24, FIRE=4<<24, GLOW=5<<24;
  const C=s=>parseInt(s.slice(1),16);
  const shd=(c,k)=>{ const r=Math.min(255,((c>>16)&255)*k)|0,g=Math.min(255,((c>>8)&255)*k)|0,b=Math.min(255,(c&255)*k)|0; return (c&0x7f000000)|(r<<16)|(g<<8)|b; };
  const mix=(a,b,t)=>{ const r=((a>>16)&255)*(1-t)+((b>>16)&255)*t,g=((a>>8)&255)*(1-t)+((b>>8)&255)*t,bb=(a&255)*(1-t)+(b&255)*t; return (a&0x7f000000)|(r<<16)|(g<<8)|bb; };
  const hh=(x,y,s)=>{ let h=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul((s|0)+7,1442695041); h=Math.imul(h^(h>>>13),1274126177); h^=h>>>16; return (h>>>0)/4294967296; };
  const n1=(t,s)=>{ const i=Math.floor(t),f=t-i,a=hh(i,s,9),b=hh(i+1,s,9),u=f*f*(3-2*f); return a+(b-a)*u; };
  const sstep=(a,b,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
  let RS=12345; const rnd=()=>{ RS=(Math.imul(RS,1103515245)+12345)>>>0; return RS/4294967296; }, rr=(a,b)=>a+(b-a)*rnd(), seed=s=>{ RS=s; };
  const ITEMS={}; let cur=null, SCN=null;
  const scene=(name,LX,LY,WH,holes,o)=>{ SCN={name,LX,LY,WH,holes:holes||[],...(o||{})}; };
  const item=(name,o)=>{ cur=ITEMS[name]||(ITEMS[name]={name,prims:[],lamps:[],flames:[],o:o||{},scn:SCN,room:SCN&&SCN.name}); };
  const add=p=>{ if(cur)cur.prims.push(p); return p; };
  const box=(x0,y0,z0,x1,y1,z1,c,o)=>add(Object.assign({t:0,x0:Math.min(x0,x1),y0:Math.min(y0,y1),z0,x1:Math.max(x0,x1),y1:Math.max(y0,y1),z1,c},o||{}));
  const cyl=(cx,cy,r0,z0,z1,c,o,r1)=>add(Object.assign({t:1,cx,cy,r0,r1:r1===undefined?r0:r1,z0,z1,c},o||{}));
  const ell=(cx,cy,cz,rx,ry,rz,c,o)=>add(Object.assign({t:2,cx,cy,cz,rx,ry,rz,c},o||{}));
  const lamp=(x,y,z,r,col,I,fl,o)=>{ if(cur)cur.lamps.push({x,y,z,r,col,I,fl:fl||0,o:o||{}}); return 0; };
  const flame=(x,y,z)=>{ if(cur)cur.flames.push({x,y,z,s:cur.flames.length}); };
  const wood=(base,o={})=>{ const sd=o.seed||1,lite=o.lite||1.12,dark=o.dark||0.8,pl=o.plank||0,along=o.along||'v';
    return (f,u,v,W,H)=>{ '@later'; let a,b; if(f==='T'){ a=along==='u'?u:v; b=along==='u'?v:u; } else { a=(f==='S'||f==='N'||along==='v')?v:u; b=a===v?u:v; }
      const bi=Math.floor(b/(o.gw||2)); let k=0.93+0.1*hh(bi,0,sd)+0.05*Math.sin(a*0.3+bi*2.3);
      if(hh(bi,Math.floor(a/7),sd+5)<0.05)k*=0.82; if(pl&&Math.floor(b)%pl===0)k*=0.72;
      if(!o.nobev){ if(v<1||u<1)k*=lite; else if(v>H-1.1||u>W-1.1)k*=dark; } return shd(base,k); }; };
  const PAL={trim:C('#a28a5a'),red:C('#6e2f26'),redL:C('#8a4232'),redD:C('#4a1d18'),leaf:C('#2f6a34'),leafL:C('#4c9441'),leafD:C('#1f4a26'),teal:C('#2c6656'),tealL:C('#43876c'),
    pump:C('#d9741c'),pumpL:C('#f2a03a'),pumpD:C('#a8520f'),stem:C('#4e6a2a'),glass:C('#d6d4c2'),glassD:C('#a9aa98'),cork:C('#b4945e'),wax:C('#e6dbbf'),waxD:C('#c4b593'),
    gold:C('#94722c'),paper:C('#ece4cc'),terra:C('#b05a3a'),soil:C('#3a2a1c')};
  const candle=(x,y,z,h,r)=>{ r=r||0.04; cyl(x,y,r,z,z+h,(f,u,v,W,H)=>f==='T'?((u-W/2)**2+(v-H/2)**2<1?PAL.waxD:PAL.wax):shd(PAL.wax,(v<1.2?1.08:1)*(hh(u,v>>1,4)<0.08?0.9:1)*(Math.abs(u%(W)-W*0.2)<1?1.12:1)),{small:1}); flame(x,y,z+h); };
  const jar=(x,y,z,r,h,fill,o)=>{ o=o||{};
    cyl(x,y,r,z,z+h,(f,u,v,W,H)=>{ '@later'; if(f==='T')return PAL.glassD; const fl=v/H; let c=PAL.glass;
      if(fill!==undefined&&fl>(o.lvl||0.35)){ c=mix(PAL.glass,fill,0.75); if(hh(u>>1,v>>1,11)<0.15)c=shd(c,0.8); }
      if(o.label&&fl>0.45&&fl<0.75&&(u%W)<W*0.45)c=(fl<0.5||fl>0.7)?PAL.paper:C('#d8ccb0');
      const hl=(u%W)/W; if(hl>0.1&&hl<0.16)c=shd(c,1.25); if(v<1)c=shd(c,1.1); return c; },{small:1});
    cyl(x,y,r*0.78,z+h,z+h+Math.max(0.035,h*0.14),(f,u,v,W,H)=>f==='T'?shd(PAL.cork,1.08):shd(PAL.cork,v<1?1.1:0.92+0.1*hh(u,v,2)),{small:1}); };
  const bookLying=(x0,y0,z0,x1,y1,h,col,o)=>{ o=o||{}; return box(x0,y0,z0,x1,y1,z0+h,(f,u,v,W,H)=>{ if(f==='T')return shd(col,(u<1||v<1)?1.15:(u>W-1||v>H-1)?0.75:1);
    if(v<1||v>H-1)return shd(col,0.85); if(f===o.spine)return (u>2&&u<3)?PAL.gold:shd(col,0.9); return (Math.floor(v)%2?PAL.paper:C('#cfc6a8')); },{small:1}); };
  const bookStand=(x0,y0,z0,x1,y1,h,col,spine)=>box(x0,y0,z0,x1,y1,z0+h,(f,u,v,W,H)=>{ if(f==='T')return (u<1||u>W-1||v<1||v>H-1)?shd(col,0.8):PAL.paper;
    if(f===spine){ if((v>2&&v<3)||(v>H-4&&v<H-3))return PAL.gold; return shd(col,u<1?1.18:u>W-1?0.75:1); } return shd(col,0.85); },{small:1});
  const leafE=(x,y,z,rx,ry,rz,col,o)=>ell(x,y,z,rx,ry,rz,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ const d=lx*lx+ly*ly, ax=rx>ry?ly:lx;
    let c=col; if(Math.abs(ax)<0.12&&d<0.7)c=shd(col,1.22); if(d>0.78)c=shd(col,0.72); if(lz>0.5&&d<0.25)c=shd(c,1.08); return c; },Object.assign({small:1},o||{}));
  const pot=(x,y,z,r,h,col,o)=>{ col=col||PAL.terra; cyl(x,y,r*0.78,z,z+h,(f,u,v,W,H)=>{ if(f==='T')return hh(u,v,5)<0.2?C('#4a3624'):PAL.soil; if(v<3)return shd(col,v<1?1.2:1.05); return shd(col,(Math.floor(u)%11===0?0.85:1)*(v>H-1.2?0.8:1)); },o,r); };
  const fern=(x,y,z,s,col,o)=>{ col=col||PAL.teal; for(let i=0;i<7;i++){ const a=i/7*6.283+rr(-0.3,0.3), len=s*rr(0.75,1.1);
    for(let k=1;k<=5;k++){ const t=k/5, d=len*t, zz=z+s*0.5*Math.sin(t*2.6)-0.05*t; leafE(x+Math.cos(a)*d,y+Math.sin(a)*d,zz,s*0.13*(1.1-t*0.4),s*0.13*(1.1-t*0.4),0.03,k%2?col:shd(col,1.15),o); } } };
  const pothos=(x,y,z,len,dir,o)=>{ let px=x,py=y,pz=z; const [dx,dy]=dir; for(let k=0;k<len*9;k++){ px+=dx*0.025+rr(-0.02,0.02); py+=dy*0.025+rr(-0.02,0.02); pz-=0.11;
    const c=rnd()<0.4?PAL.leafL:rnd()<0.5?PAL.leaf:C('#5aa548'); leafE(px+rr(-0.06,0.06),py+rr(-0.06,0.06),pz,0.075,0.075,0.035,c,o); } };
  const pumpkin=(x,y,z,r,h)=>{ ell(x,y,z+h/2,r,r,h/2,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ const a=Math.atan2(ly,lx), rib=Math.cos(a*8); let c=rib>0.75?PAL.pumpD:rib<-0.2?PAL.pump:PAL.pumpL; if(rib<-0.85)c=shd(PAL.pump,0.92); if(lz>0.75&&lx*lx+ly*ly<0.12)c=PAL.pumpD; return c; },{small:r<0.2});
    cyl(x,y,r*0.12,z+h*0.92,z+h*1.2,PAL.stem,{small:1},r*0.08); };
  const vase=(x,y,z,r,h,col)=>cyl(x,y,r,z,z+h,(f,u,v,W,H)=>f==='T'?shd(col,0.6):shd(col,((u%W)/W>0.12&&(u%W)/W<0.2)?1.3:1),{small:1},r*0.6);
  const flowers=(x,y,z,s,col,colL,n)=>{ for(let i=0;i<(n||9);i++){ const a=rr(0,6.28),d=rr(0,s*0.6); ell(x+Math.cos(a)*d,y+Math.sin(a)*d,z+rr(0,s*0.5),s*0.22,s*0.22,s*0.18,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>lz>0.3&&lx*lx+ly*ly<0.1?C('#f0d060'):(lz>0.2?colL:col),{small:1}); } };
  const wallClock=(cx,cz,col,colD,tick)=>{ const LY=SCN.LY; box(cx-0.36,LY-0.07,cz-0.36,cx+0.36,LY,cz+0.36,(f,u,v,W,H,x,y,z)=>{ '@later'; const dx=x-cx,dz=z-cz,d=Math.hypot(dx,dz); if(d>0.36)return -1; if(d>0.3)return d>0.34?colD:col; if(d<0.025)return tick;
    const ang=Math.atan2(dx,dz); for(let k=0;k<12;k++){ const a=k/12*6.283; if(Math.abs(Math.sin(ang-a))*d<0.012&&Math.cos(ang-a)>0&&d>0.24)return tick; }
    const hand=(a,len,w)=>Math.cos(ang-a)>0&&d<len&&Math.abs(Math.sin(ang-a))*d<w; if(hand(10.17/12*6.283,0.17,0.02)||hand(2/12*6.283,0.25,0.013))return 0x2a2620; return 0xe0d6b8; },{wall:'S'}); };
  const frameArt=(f,u,v,W,H,inner)=>{ if(u<2||v<2||u>W-2||v>H-2)return (u<1||v<1)?PAL.redL:PAL.redD; if(u<3||v<3||u>W-3||v>H-3)return PAL.trim; return inner(u-3,v-3,W-6,H-6); };
  const drapes=(name,wall,rod,spans,cols,amp,sd)=>{ seed(sd); const list=[], alongX=wall==='N';
    for(const [a,b,lmax,lmin] of spans){ let x=a; while(x<b){ const w=rr(0.07,0.13); list.push({a:x,w,len:rr(lmin,lmax),ph:rr(0,6.28),amp:rr(amp[0],amp[1]),c:cols[Math.floor(rnd()*cols.length)]}); x+=w*0.8; } }
    let P0=null, L=[1,1,1], litAt=-1e9;
    const strip=(d,a,b,z0,z1,c,o)=>alongX?box(a,0.03,z0,b,0.06,z1,c,o):box(0.03,a,z0,0.06,b,z1,c,o);
    item(name,{wall:1,drape:(dx,dy,near)=>{ '@later'; const out=[];
      for(const d of list){ const hem=Math.min(0.5,d.len*0.4), zt=(rod-d.len+hem)*ZS, zb=(rod-d.len)*ZS, r=alongX?{x0:d.a-0.1+dx,x1:d.a+d.w+0.1+dx,y0:0.03+dy,y1:0.06+dy}:{x0:0.03+dx,x1:0.06+dx,y0:d.a-0.1+dy,y1:d.a+d.w+0.1+dy};
        out.push(sided({...r,z0:zb,z1:zt,c:[0,0,0],nb:1,life:1,top:()=>null,
          fs:(nx,ny,X,Y,z,k)=>{ if(LIFE.mode!==1||(alongX?!ny:!nx)||near(wall))return null; const f=LIFE.f||0, zr=z/((zt-zb)||1), off=d.amp*(1-zr)*1.6*Math.sin(f/8*6.283+d.ph), a=(alongX?X-dx:Y-dy)-d.a-off;
            if(a<0||a>d.w||(z<2+2*hh(Math.floor(a*TX),3,d.a*99)))return null;
            if(P0&&typeof lightEnv==='function'){ const now=performance.now(); if(now-litAt>1000){ litAt=now; const env=lightEnv(P0.x0-.5,P0.y0-.5,P0.x1+.5,P0.y1+.5,false,0); L=env?lightAt(env,(P0.x0+P0.x1)/2,(P0.y0+P0.y1)/2,(zb+zt)/48,null).map(v=>Math.max(.12,Math.min(1.1,v))):[1,1,1]; } }
            const fold=Math.sin(a*TX*1.1+d.ph), c=shd(d.c,fold>0.6?1.2:fold<-0.6?0.78:1); return [Math.round(((c>>16)&255)*L[0]*k),Math.round(((c>>8)&255)*L[1]*k),Math.round((c&255)*L[2]*k)]; }})); }
      return out; },setP:p=>{ P0=p; }});
    for(const d of list){ const hem=Math.min(0.5,d.len*0.4); strip(d,d.a,d.a+d.w,rod-d.len+hem,rod,(f,u,v,W,H)=>{ const fold=Math.sin(u*1.1+d.ph); return shd(d.c,fold>0.6?1.2:fold<-0.6?0.78:1); },{small:1,wall}); }
    return list; };
  const beads=(name,top,strings)=>{ let P0=null;
    item(name,{wall:1,drape:(dx,dy,near)=>strings.map(s=>{ const x=0.05+dx, y0=s.y-0.12+dy, y1=s.y+0.14+dy, zb=(top-s.len-0.1)*ZS, zt=(top-s.len*0.45)*ZS;
      return sided({x0:x,x1:x+0.03,y0,y1,z0:zb,z1:zt,c:[0,0,0],nb:1,life:1,top:()=>null,fs:(nx,ny,X,Y,z,k)=>{ if(LIFE.mode!==1||!nx||near('W'))return null; const f=LIFE.f||0, zz=zb+z, L=(top*ZS-zz)/ZS, th=0.05*Math.sin(f/8*6.283+s.y*3), sy=s.y+Math.sin(th)*L, a=Y-dy-sy;
        if(Math.abs(a)<0.006)return tone([58,50,38],k);
        for(let k2=0;k2<s.cols.length;k2++){ const bz=(top-0.35-k2*(s.len-0.3)/s.cols.length)*ZS; if(bz>zt||bz<zb)continue; const r=(k2===2?0.04:0.028); if(Math.abs(a)<r&&Math.abs(zz-bz)<r*ZS*1.4)return tone(rgb(C(s.cols[k2])),k); }
        return null; }}); }),setP:p=>{ P0=p; }});
    for(const s of strings){ box(0.05,s.y,top-s.len*0.45,0.07,s.y+0.012,top,0x3a3226,{small:1,wall:'W'});
      s.cols.forEach((col,k)=>{ const z=top-0.35-k*(s.len-0.3)/s.cols.length; if(z<top-s.len*0.45)return; ell(0.07,s.y+0.007,z,k===2?0.04:0.028,k===2?0.04:0.028,k===2?0.07:0.03,C(col),{small:1,wall:'W'}); }); } };
  const tone=(c,k)=>!c?null:c.e||k===1?c:[Math.round(c[0]*k),Math.round(c[1]*k),Math.round(c[2]*k)];
  const rgb=c=>{ if(c<0||c===undefined||c===null)return null; const k=c>>>24, o=[(c>>16)&255,(c>>8)&255,c&255]; return k===0?o:Object.assign(o,{e:1}); };
  const flick=(x,y,f)=>hh(Math.floor(x*97),Math.floor(y*89),f);
  const fireCol=(X,z,f)=>{ const q=Math.max(0,Math.min(1,0.55+0.45*Math.sin(X*31+f*1.7)*Math.cos(z*0.4-f*2.3)+0.2*(flick(X,z,f)-0.5)));
    return Object.assign([255,Math.round(40+q*q*190),Math.round(q*q*q*90)],{e:1}); };
  const faceUV=(p,f,x,y,z)=>{ '@later'; switch(f){ case 'T':return [(x-p.x0)*TX,(y-p.y0)*TX,(p.x1-p.x0)*TX,(p.y1-p.y0)*TX];
      case 'E':return [(p.y1-y)*TX,(p.z1-z)*TX,(p.y1-p.y0)*TX,(p.z1-p.z0)*TX]; case 'W':return [(y-p.y0)*TX,(p.z1-z)*TX,(p.y1-p.y0)*TX,(p.z1-p.z0)*TX];
      case 'S':return [(x-p.x0)*TX,(p.z1-z)*TX,(p.x1-p.x0)*TX,(p.z1-p.z0)*TX]; default:return [(p.x1-x)*TX,(p.z1-z)*TX,(p.x1-p.x0)*TX,(p.z1-p.z0)*TX]; } };
  const paint=(p,f,x,y,z)=>{ if(typeof p.c!=='function')return p.c; const [u,v,W,H]=faceUV(p,f,x,y,z);
    return p.c(f,u,v,W,H,x,y,z,(x-p.x0)/((p.x1-p.x0)||1),(y-p.y0)/((p.y1-p.y0)||1),(z-p.z0)/((p.z1-p.z0)||1)); };
  const vis=i=>{ const a=wvV(1,0), c=wvV(0,1); return a[i]||c[i]; };
  const near=w=>w==='W'?vis(0)<0:w==='E'?vis(0)>0:w==='N'?vis(1)<0:w==='S'?vis(1)>0:false, nearIn=S=>S&&S.full?()=>false:w=>near(S&&S.turn?turnW(w,S.turn):w);
  const turnW=(w,r)=>{ let [x,y]=w==='W'?[-1,0]:w==='E'?[1,0]:w==='N'?[0,-1]:[0,1]; for(let k=0;k<r;k++)[x,y]=[-y,x]; return x<0?'W':x>0?'E':y<0?'N':'S'; };
  const asGame=(c,X,z,live)=>{ if(c<0||c===undefined)return null; const k=c>>>24; if(k===3)return null; if(k===4)return fireCol(X,z,live?LIFE.f||0:0); if(live)return null; return rgb(c); };
  const wallOfPrim=(p,S)=>{ if(p.wall)return p.wall; const [x0,y0,x1,y1,z0]=p.t===0?[p.x0,p.y0,p.x1,p.y1,p.z0]:p.t===1?[p.cx-p.r0,p.cy-p.r0,p.cx+p.r0,p.cy+p.r0,p.z0]:[p.cx-p.rx,p.cy-p.ry,p.cx+p.rx,p.cy+p.ry,p.cz-p.rz];
    if(!S||z0<=1.0)return null; return x1<0.45?'W':y1<0.45?'N':x0>S.LX-0.45?'E':y0>S.LY-0.45?'S':null; };
  const inHole=(p,S,f,X,Y,z)=>{ if(!S||!p.wallOf)return false; for(const h of S.holes){ if(h.wall!==p.wallOf)continue; const a=(h.wall==='W'||h.wall==='E')?Y:X; if(a>h.a0&&a<h.a1&&z<h.z1)return true; } return false; };
  function gameBoxes(it,dx,dy){ '@later'; const out=[], S=it.scn, near=nearIn(S);
    for(const p of it.prims){ const live=!!p.fire, hw=wallOfPrim(p,S), only=p.cutOnly;
      const gone=()=>(hw&&near(hw))||(only&&!near(only));
      if(p.t===0){
        if(p.floor){ out.push({x0:p.x0+dx,y0:p.y0+dy,x1:p.x1+dx,y1:p.y1+dy,z0:0,z1:0.3,c:[0,0,0],foot:1,nb:1,top:(X,Y)=>LIFE.mode===1?null:rgb(paint(p,'T',X-dx,Y-dy,p.z1)),fi:()=>null,fj:()=>null}); continue; }
        const lift=it.o.flat?0.4:0;
        const mk=(z0,z1,c,keep)=>sided({x0:p.x0+dx,y0:p.y0+dy,x1:p.x1+dx,y1:p.y1+dy,z0,z1,c:c||[0,0,0],foot:z0<=0.5?1:0,nb:p.sh?0:1,life:live?1:0,
          top:(X,Y)=>{ if(LIFE.mode===1||gone()||(keep&&!keep()))return null; return rgb(paint(p,'T',X-dx,Y-dy,p.z1)); },
          fs:(nx,ny,X,Y,z,k)=>{ if(gone()||(keep&&!keep()))return null; const f=nx>0?'E':nx<0?'W':ny>0?'S':'N', zu=(z0+z)/ZS-lift/ZS; if(inHole(p,S,f,X-dx,Y-dy,zu))return null; const c=paint(p,f,X-dx,Y-dy,zu);
            if(LIFE.mode===1)return live?asGame(c,X+Y,z,1):null; return tone(asGame(c,X+Y,z,0),k); }});
        const c0=typeof p.c==='number'?rgb(p.c):[120,110,100];
        if(p.wallOf){
          const cutH=(p.cutH||0.12)*ZS, top=p.z1*ZS, cut={...p,c:p.cutC||p.c};
          out.push(sided({x0:p.x0+dx,y0:p.y0+dy,x1:p.x1+dx,y1:p.y1+dy,z0:0,z1:cutH,c:c0||[0,0,0],foot:1,nb:1,
            top:(X,Y)=>near(p.wallOf)?rgb(paint(cut,'T',X-dx,Y-dy,p.cutH||0.12)):null,
            fs:(nx,ny,X,Y,z,k)=>{ const f=nx>0?'E':nx<0?'W':ny>0?'S':'N', zu=z/ZS; if(inHole(p,S,f,X-dx,Y-dy,zu))return null; const pp=near(p.wallOf)?{...cut,z1:p.cutH||0.12}:p; return tone(asGame(paint(pp,f,X-dx,Y-dy,zu),X+Y,z,0),k); }}));
          out.push(mk(cutH,top,c0,()=>!near(p.wallOf))); continue; }
        out.push(mk(p.z0*ZS+lift,p.z1*ZS+lift,c0)); }
      else {
        const z0=(p.t===1?p.z0:p.cz-p.rz)*ZS, z1=(p.t===1?p.z1:p.cz+p.rz)*ZS, cx=p.cx, cy=p.cy, lift=it.o.flat?0.4:0;
        const rad=zz=>{ const zu=zz/ZS; if(p.t===1)return [p.r0+(p.r1-p.r0)*(zu-p.z0)/((p.z1-p.z0)||1)]; const q=1-((zu-p.cz)/p.rz)**2; return q<=0?[0]:[p.rx*Math.sqrt(q),p.ry*Math.sqrt(q)]; };
        const col=(X,Y,zu,top)=>{ let c; if(typeof p.c==='number')c=p.c;
          else if(p.t===1){ const rm=Math.max(p.r0,p.r1); if(top){ const r1=p.r1; c=p.c('T',(X-cx+r1)*TX,(Y-cy+r1)*TX,2*r1*TX,2*r1*TX,X,Y,zu,(X-cx)/rm,(Y-cy)/rm,(zu-p.z0)/((p.z1-p.z0)||1)); }
            else { const circ=2*Math.PI*rm*TX; c=p.c('S',(Math.atan2(Y-cy,X-cx)/(2*Math.PI)+0.5)*circ,(p.z1-zu)*TX,circ,(p.z1-p.z0)*TX,X,Y,zu,(X-cx)/rm,(Y-cy)/rm,(zu-p.z0)/((p.z1-p.z0)||1)); } }
          else { const lx=(X-cx)/p.rx, ly=(Y-cy)/p.ry, lz=(zu-p.cz)/p.rz; c=p.c('E',(Math.atan2(ly,lx)/(2*Math.PI)+0.5)*2*Math.PI*Math.max(p.rx,p.ry)*TX,(p.cz+p.rz-zu)*TX,1,1,X,Y,zu,lx,ly,lz); }
          return c; };
        const dz=Math.max(1,Math.min(2,(z1-z0)/2)), dw=Math.max(0.03,Math.min(0.06,(p.t===1?Math.max(p.r0,p.r1):Math.max(p.rx,p.ry))/3));
        for(let z=z0;z<z1-1e-9;z+=dz){ const za=z, zb=Math.min(z1,z+dz), r=rad((za+zb)/2), rx=r[0], ry=r.length>1?r[1]:r[0]; if(!(rx>.004&&ry>.004))continue;
          const n=Math.max(1,Math.round(2*rx/dw)), w=2*rx/n;
          for(let i=0;i<n;i++){ const xa=-rx+i*w, xm=xa+w/2, hy=ry*Math.sqrt(Math.max(0,1-(xm/rx)**2)); if(hy<w*.3)continue;
            out.push(sided({x0:cx+xa+dx,y0:cy-hy+dy,x1:cx+xa+w+dx,y1:cy+hy+dy,z0:za+lift,z1:zb+lift,c:[90,90,90],foot:za<=0.5?1:0,nb:1,
              fs:(nx,ny,X,Y,zr,k)=>LIFE.mode===1||gone()?null:tone(asGame(col(X-dx,Y-dy,(za+zr)/ZS,0),0,0,0),k*(0.86+0.14*Math.abs(nx?(Y-dy-cy)/(hy||1):(X-dx-cx)/(rx||1)))),
              top:(X,Y)=>LIFE.mode===1||gone()?null:asGame(col(X-dx,Y-dy,zb/ZS,1),0,0,0)})); } } } }
    for(const fl of it.flames){ const x=fl.x+dx, y=fl.y+dy, z=fl.z*ZS, w=S?(fl.x<0.45?'W':fl.y<0.45?'N':fl.x>S.LX-0.45?'E':fl.y>S.LY-0.45?'S':null):null;
      out.push(sided({x0:x-.018,y0:y-.018,x1:x+.018,y1:y+.018,z0:z,z1:z+7,c:[255,200,100],nb:1,em:1,life:1,top:()=>null,
        fs:(nx,ny,X,Y,zr)=>{ if(w&&fl.z>1&&near(w))return null; const f=LIFE.mode===1?(LIFE.f||0):0, ht=f%3===2?6:f%3===1?5:4, k=Math.floor(zr);
          if(k>=ht)return null; if(LIFE.mode!==1&&k>=3)return null; return Object.assign(k<2?[255,240,176]:k<4?[255,200,96]:[240,138,48],{e:1}); }})); }
    return out; }
  function register(dept,info){ for(const it of Object.values(ITEMS)){ if(it.done)continue; it.done=1;
      const fp=it.prims.filter(p=>p.t!==0||p.z0<=0.05), bx=fp.length?fp:it.prims, xs=[], ys=[];
      for(const p of bx){ if(p.t===0){ xs.push(p.x0,p.x1); ys.push(p.y0,p.y1); } else { const r=p.t===1?Math.max(p.r0,p.r1):p.rx, ry=p.t===1?r:p.ry; xs.push(p.cx-r,p.cx+r); ys.push(p.cy-ry,p.cy+ry); } }
      const cx=(Math.min(...xs)+Math.max(...xs))/2, cy=(Math.min(...ys)+Math.max(...ys))/2, o=it.o, name=it.name, S=it.scn;
      const high=it.prims.every(p=>wallOfPrim(p,S)||p.wall||(p.t===0?p.z0:p.t===1?p.z0:p.cz-p.rz)>1.0), walls=it.prims.filter(p=>p.wallOf);
      it.c=[cx,cy];
      CATALOG[name]=(x,y)=>{ '@later'; PNAME=name; const dx=x-cx, dy=y-cy, bs=gameBoxes(it,dx,dy);
        if(!bs.some(b=>b.z0===0||b.foot))for(const b of bs)b.foot=1;
        const moving=it.flames.length||it.prims.some(p=>p.fire)||o.drape;
        let lf=0; const opts={...(o.wall||high?{walk:true,high:true,hang:Math.max(0,Math.round(Math.min(...it.prims.map(p=>p.t===2?p.cz-p.rz:p.z0))*ZS))}:{}),...(o.flat||o.floor?{flat:true,walk:true}:{}),...(o.walk?{walk:true}:{}),...(o.stands?{walk:true,stands:o.stands.map(([a,b,c,d,z])=>({x0:a+dx,y0:b+dy,x1:c+dx,y1:d+dy,z}))}:{}),
          ...(moving?{life:t=>{ lf=Math.floor(t*8)%8; LIFE.f=lf; },lifeKey:()=>lf}:{})};
        if(walls.length){ const sol=[]; for(const p of walls){ const along=p.x1-p.x0>p.y1-p.y0, lo=along?p.x0:p.y0, hi=along?p.x1:p.y1, hs=(S?S.holes:[]).filter(h=>h.wall===p.wallOf).sort((a,b)=>a.a0-b.a0); let a=lo;
            for(const h of hs){ if(h.a0>a)sol.push(along?{x0:a+dx,x1:h.a0+dx,y0:p.y0+dy,y1:p.y1+dy}:{x0:p.x0+dx,x1:p.x1+dx,y0:a+dy,y1:h.a0+dy}); a=Math.max(a,h.a1); }
            if(hi>a)sol.push(along?{x0:a+dx,x1:hi+dx,y0:p.y0+dy,y1:p.y1+dy}:{x0:p.x0+dx,x1:p.x1+dx,y0:a+dy,y1:hi+dy}); }
          opts.solids=sol; }
        else if(o.parts)opts.solids=it.prims.filter(p=>p.t===0&&p.solid).map(p=>({x0:p.x0+dx,y0:p.y0+dy,x1:p.x1+dx,y1:p.y1+dy}));
        if(o.drape)bs.push(...o.drape(dx,dy,nearIn(S)));
        const p=prop(bs,null,opts); if(o.setP)o.setP(p);
        for(const L of it.lamps){ const k=L.I; LAMPS.push({own:1,...(L.o.sw?{}:{room:1,day:true}),x:L.x+dx,y:L.y+dy,z:L.z*ZS,up:L.z*ZS-66,r:L.r,c:[L.col[0]*k,L.col[1]*k,L.col[2]*k],prop:p}); }
        return p; };
      KIND_OF[name]=name; CAT_INFO[name]={...(info[name]||{no:dept.slice(0,2).toUpperCase()+'-'+name.length,name:name[0].toUpperCase()+name.slice(1),price:50,desc:'',mat:''}),dept}; } }
  const put=(D,W,H,x,y,c,a=255)=>{ x=Math.floor(x); y=Math.floor(y); if(x<0||y<0||x>=W||y>=H)return; const i=(y*W+x)*4; if(a<255&&D[i+3]){ const t=a/255; D[i]+=(c[0]-D[i])*t; D[i+1]+=(c[1]-D[i+1])*t; D[i+2]+=(c[2]-D[i+2])*t; D[i+3]=Math.max(D[i+3],a); return; } D[i]=c[0]; D[i+1]=c[1]; D[i+2]=c[2]; D[i+3]=a; };
  const seen=()=>{ const a=wvV(1,0), c=wvV(0,1); return [a[0]||c[0],a[1]||c[1]]; };
  function moving(name,draw){ '@later'; const mk=CATALOG[name], it=ITEMS[name];
    CATALOG[name]=(x,y)=>{ const p=mk(x,y), dx=x-it.c[0], dy=y-it.c[1]; let L=[1,1,1], litAt=-1e9;
      const at=(lx,ly)=>{ const q=[lx+dx,ly+dy]; return p.ed?p.ed(q[0],q[1]):q; };
      const S={p,at,
        scr:(lx,ly,lz,ox,oy,K)=>{ const [X,Y]=at(lx,ly), [vx,vy]=vw(X,Y); return [((vx-vy)*HW-ox)*K,((vx+vy)*HH-(lz*ZS+LVZ(p.lv||0)-LVZ(V.lv))-oy)*K]; },
        faces:(nx,ny)=>{ const o=at(0,0), q=at(nx,ny), s=seen(); return (q[0]-o[0])*s[0]>0.5||(q[1]-o[1])*s[1]>0.5; },
        light:(lx,ly,lz)=>{ const now=performance.now(); if(now-litAt>1000&&typeof lightEnv==='function'){ litAt=now; const [X,Y]=at(lx,ly), env=lightEnv(X-.5,Y-.5,X+.5,Y+.5,false,LVZ(p.lv||0)); L=env?lightAt(env,X,Y,(lz*ZS+LVZ(p.lv||0))/24,null).map(v=>Math.max(.15,Math.min(1.2,v))):[1,1,1]; } return L; }};
      p.lifeDraw=(D,W,H,ox,oy,t,K=1)=>draw(D,W,H,ox,oy,t,K,S); return p; }; }
  const water=(cx,cy,r,rimZ,wi,cfg={})=>{ '@later'; let Wb=null, lv=0; const HT=0.75, w=DEEPW.WATERS[wi], amp=w.waves.reduce((t,v)=>t+v[1],0)*(cfg.height??1);
    return (D,W,H,ox,oy,t,K,S,life)=>{ if(!Wb){ Wb=DEEPW.body(2*r,2*r,HT,wi,{...DEEPW.DEFAULTS,timer:0,bare:true,...cfg,life}); lv=Math.max(0.5,HT-amp-0.08); }
      const Z0=rimZ*ZS-lv*DEEPW.ZPX+LVZ(S.p.lv||0)-LVZ(V.lv); Wb.draw(D,W,H,ox,oy,K,t,(a,b)=>S.at(cx-r+a,cy-r+b),Z0,false,[],null);
      const [ex,ey]=S.scr(cx,cy,rimZ,ox,oy,K), A=r*0.97*Math.SQRT2*HW*K, B=r*0.97*Math.SQRT2*HH*K;
      for(let y=Math.max(0,Math.floor(ey-B-6*K));y<Math.min(H,Math.ceil(ey+B+HT*DEEPW.ZPX*K+6*K));y++)for(let x=Math.max(0,Math.floor(ex-A-3*K));x<Math.min(W,Math.ceil(ex+A+3*K));x++){ const u=(x+0.5-ex)/A, v=(y+0.5-ey)/B; if(u*u+v*v>1)D[(y*W+x)*4+3]=0; } }; };
  const roomPieces=name=>Object.values(ITEMS).filter(it=>it.room===name).map(it=>[it.name,it.c[0],it.c[1]]);
  return {C,shd,mix,hh,n1,sstep,rnd,rr,seed,wood,item,scene,box,cyl,ell,lamp,flame,register,put,moving,water,roomPieces,wallClock,beads,ITEMS,ZS,TX,E1,E2,SKY,FIRE,GLOW,tone,rgb,PAL,candle,jar,bookLying,bookStand,leafE,pot,fern,pothos,pumpkin,vase,flowers,frameArt,drapes}; })();
