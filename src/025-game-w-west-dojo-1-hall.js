var DJ=null;
const djE=c=>Object.assign([...c],{e:1});
const djBx=(x0,y0,x1,y1,z0,z1,c,o)=>({x0,y0,x1,y1,z0,z1,c,...(Math.min(x1-x0,y1-y0)<.08||z1-z0<2?{nb:1}:{}),...o});
const DJLEAVES=[['....##....','...####...','.########.','##########','##########','.########.','..######..','...####...','....##....'],
  ['......###.','....#####.','..#######.','.########.','#########.','.#######..','..#####...','...###....','....#.....']];
const DJLEAF=[[18,28,26],[30,48,38],[52,76,46],[86,108,52],[128,140,58],[176,170,66],[214,196,96],[240,222,130]];
function djLeaf(u,v,s,light,dens=.85,gapOK=0){ '@later'; const CW=7, CH=6, cj0=Math.floor(v/CH); let best=null, bj=-1e9;
  for(let cj=cj0-1;cj<=cj0+1;cj++){ const off=(cj&1)*CW/2, ci0=Math.floor((u-off)/CW);
    for(let ci=ci0-1;ci<=ci0+1;ci++){ const h=hash(ci,cj,s); if(h>dens)continue; const k=hash(ci,cj,s+1), m=DJLEAVES[k<.5?0:1], fl=k>.75,
        ox=ci*CW+off+Math.floor(hash(ci,cj,s+2)*3)-2, oy=cj*CH+Math.floor(hash(ci,cj,s+3)*3)-2, du=Math.floor(u)-ox, dv=Math.floor(v)-oy;
      if(du<0||dv<0||du>9||dv>8)continue; const col=fl?9-du:du; if(m[dv][col]!=='#'||cj<=bj)continue;
      const edge=(a,b)=>{ const c=fl?9-a:a; return b<0||b>8||c<0||c>9||m[b][c]!=='#'; };
      let L=light*6+(h/dens-.5)*1.6+.5; if(edge(du-1,dv)||edge(du,dv-1))L+=1.3; if(edge(du+1,dv)||edge(du,dv+1))L-=2.2; if(dv>3&&(col===4||col===5))L-=.9;
      best=DJLEAF[Math.max(0,Math.min(7,Math.round(L)))]; bj=cj; } }
  return best||(gapOK?null:DJLEAF[Math.max(0,Math.round(light*2))]); }
function djLathe(cx,cy,z0,z1,rf,col,dz=2,dw=.04){ const out=[];
  for(let z=z0;z<z1-1e-9;z+=dz){ const za=z, zb=Math.min(z1,z+dz), r=rf((za+zb)/2-z0); if(!(r>.004))continue; const n=Math.max(1,Math.round(2*r/dw)), w=2*r/n;
    for(let i=0;i<n;i++){ const xa=-r+i*w, xm=xa+w/2, hy=Math.sqrt(Math.max(0,r*r-xm*xm)); if(hy<w*.3)continue;
      out.push(sided({x0:cx+xa,y0:cy-hy,x1:cx+xa+w,y1:cy+hy,z0:za,z1:zb,c:[90,90,90],foot:0,nb:1,fs:(nx,ny,X,Y,zr)=>col(X-cx,Y-cy,za+zr-z0,0),top:(X,Y)=>col(X-cx,Y-cy,zb-z0,1)})); } }
  return out; }
const DJTAT=[178,166,112], DJBRD=[128,84,50], DJWOOD=[70,48,34], DJPAP=[226,218,196], DJPLA=[204,192,164];
const DJWIN=[-4,4], DJPAN=[[-3,-2],[2,3]];
function djAndon(x,y){ SHARED.PNAME='andon'; const w=.17, P=(a,z)=>(Math.abs(a)>w-.025||z<9||z>27.5||Math.abs(z-18)<.6)?sh(DJWOOD,1.1):djE(z<12?[230,150,80]:[255,206,140]);
  const p=prop([djBx(x-w,y-w,x+w,y+w,0,6,DJWOOD,{top:()=>sh(DJWOOD,.8)}),{x0:x-w,y0:y-w,x1:x+w,y1:y+w,z0:6,z1:29,foot:0,c:DJWOOD,top:()=>djE([255,226,170]),fi:(v,z)=>P(v-y,z),fj:(u,z)=>P(u-x,z)}]);
  LAMPS.push({x,y,z:20,r:4.8,c:[.66,.34,.14],own:1,room:1,day:true,prop:p}); return p; }
const DJFLH=[9,11,10,12,8,11,9,12];
function djCandle(x,y){ SHARED.PNAME='dojo candle'; const LK=[30,24,22], WX=[234,224,198], FL={ph:0}, s=Math.round(x*7+y*13);
  const wax=(a,z,f)=>z>14?djE(sh([240,206,150],(.3+.6*(z-14)/9)*(hash(Math.floor(a*30),Math.floor(z/2),753)<.12?.86:1))):sh(WX,f*(hash(Math.floor(a*30),Math.floor(z/2),753)<.12?.86:1));
  const flame=(du,zz)=>{ '@later'; if(typeof LIFE==='undefined'||LIFE.mode!==1)return null; const h=DJFLH[FL.ph], lean=(FL.ph%3-1)*.012; if(zz<0||zz>=h)return null;
    const w=.03*Math.pow(1-zz/h,.55), a=Math.abs(du-lean*zz); if(a>w)return null; return djE(zz<2?[255,244,190]:a<w*.4&&zz<h*.6?[255,224,120]:a>w*.75||zz>h*.8?[236,112,40]:[255,186,80]); };
  const p=prop([djBx(x-.2,y-.2,x+.2,y+.2,0,7,LK,{top:()=>sh(LK,1.4)}),...djLathe(x,y,7,30,z=>.11-(z>21?(z-21)*.004:0),(dx,dy,z,top)=>top?djE(sh([250,220,160],.9)):wax(dx+dy,z,.95),1.5,.035),
    {x0:x-.04,y0:y-.04,x1:x+.04,y1:y+.04,z0:30,z1:43,foot:0,nb:1,life:1,c:[255,186,80],top:()=>null,fi:(v,z)=>flame(v-y,z-30),fj:(u,z)=>flame(u-x,z-30)}],null,{walk:0});
  p.life=t=>{ FL.ph=Math.floor(hash(Math.floor(t*10),s,425)*8); }; p.lifeKey=()=>FL.ph;
  LAMPS.push({x,y,z:34,r:4,c:[.85,.42,.17],own:1,room:1,day:true,prop:p,flick:1}); return p; }
function djIncense(x,y,n){ '@later'; SHARED.PNAME='incense'; const BR=[120,88,48], ST=[96,52,40], bx=x+n[0]*.12, by=y+n[1]*.12;
  const bs=[{x0:x-.1+Math.min(0,n[0]*.2),y0:y-.1+Math.min(0,n[1]*.2),x1:x+.1+Math.max(0,n[0]*.2),y1:y+.1+Math.max(0,n[1]*.2),z0:24,z1:26,c:[70,48,34],foot:1},djBx(bx-.06,by-.06,bx+.06,by+.06,26,29,BR,{foot:0,top:()=>[150,146,138]})];
  for(const [ox,oy,h] of [[-.025,0,12],[.02,.02,10],[0,-.025,11]]){ bs.push(djBx(bx+ox-.008,by+oy-.008,bx+ox+.008,by+oy+.008,29,29+h,ST,{foot:0}),djBx(bx+ox-.01,by+oy-.01,bx+ox+.01,by+oy+.01,29+h,30+h,djE([255,110,50]),{foot:0,em:1})); }
  return prop(bs,null,{walk:1,cutN:[-n[0],-n[1]]}); }
function djHanging(x,y,n,kind){ '@later'; SHARED.PNAME='hanging plant'; const TC=[166,92,56], seed=761+kind*7, G=[[64,110,52],[96,140,70],[52,96,60],[110,150,64]][kind%4], L=kind%4;
  const leaf=(a,z,top)=>{ const c=djLeaf(a*48,(60-z)*2,seed,top?.7:.5,.8,1); return c?sh(c,L===1?1.1:1):null; };
  const bs=[djBx(x-.006,y-.006,x+.006,y+.006,44,56,[60,50,40],{foot:0}),...djLathe(x,y,37,44,z=>.08+.03*z/7,(dx,dy,z,top)=>top?[70,56,40]:sh(TC,z>5?1.08:.9),1,.03)];
  for(let i=0;i<7;i++){ const ang=i/7*6.28, r=.07+.05*hash(i,kind,763), cx=x+Math.cos(ang)*r, cy=y+Math.sin(ang)*r, len=10+18*hash(i,kind,765);
    bs.push({x0:cx-.035,y0:cy-.035,x1:cx+.035,y1:cy+.035,z0:44-len,z1:46,foot:0,nb:1,c:G,top:(X,Y)=>leaf(X+Y,46,1)||G,fi:(v,z)=>leaf(v*1.7,z,0),fj:(u,z)=>leaf(u*1.7+.5,z,0)}); }
  bs[0].foot=1; return prop(bs,null,{walk:1,cutN:[-n[0],-n[1]]}); }
function djTokonoma(x0,y,x1){ '@later'; SHARED.PNAME='tokonoma'; const D=.85, DK=[58,36,24], cx=(x0+x1)/2-.4;
  const scroll=(u,z)=>{ const a=(u-cx)*24, s=z-34; if(Math.abs(a)>8||z<14||z>56)return null; if(z<15.5)return sh([92,66,40],.8); if(Math.abs(a)>6.5||z>52||z<18)return sh([62,66,78],.8);
    const r=Math.hypot(a,s), th=Math.atan2(s,a), wdt=.9+.9*(.5+.5*Math.sin(th+.8)); return Math.abs(r-4.6)<wdt&&th>-2.6?[34,30,30]:sh([228,220,198],.8); };
  const bs=[djBx(x0,y,x1,y+D,0,5,DK,{top:(X,Y)=>sh(DK,1.1+.08*Math.sin(X*9)),fi:()=>sh(DK,.62),fj:()=>sh(DK,.7)}),
    djBx(x0-.12,y,x0+.06,y+.18,0,DJ.H-14,[150,112,70],{fi:(v,z)=>sh([150,112,70],.62*(.9+.15*Math.sin(z*.7))),fj:(u,z)=>sh([150,112,70],.8*(.9+.15*Math.sin(z*.7)))}),
    {x0:cx-.4,y0:y+.01,x1:cx+.4,y1:y+.03,z0:14,z1:57,foot:0,nb:1,c:[228,220,198],top:()=>null,fi:()=>null,fj:(u,z)=>scroll(u,z)},
    djBx(x1-.75,y+.3,x1-.45,y+.6,5,12,[40,40,46],{top:()=>[24,24,28]})];
  for(const [dx,dy,z0,z1] of [[0,0,12,30],[.08,-.04,22,34],[-.07,.03,18,27]])bs.push(djBx(x1-.62+dx,y+.44+dy,x1-.58+dx,y+.48+dy,z0,z1,[70,50,38],{foot:0}));
  for(let i=0;i<9;i++){ const h=hash(i,3,741), bx=x1-.6+(hash(i,5,743)-.5)*.3, by=y+.46+(hash(i,7,745)-.5)*.2, z=20+h*15; bs.push(djBx(bx-.03,by-.03,bx+.03,by+.03,z,z+2,[236,168,182],{foot:0,top:()=>[250,206,214]})); }
  return prop(bs,null,{cutN:[0,-1]}); }
function djBokkenRack(x,y0,y1){ '@later'; SHARED.PNAME='bokken rack'; const W=[150,110,66], DK=[66,46,32], bs=[djBx(x-.14,y0,x,y0+.1,0,46,DK),djBx(x-.14,y1-.1,x,y1,0,46,DK)];
  for(const z of [16,24,32,40])bs.push(djBx(x-.12,y0-.12,x-.04,y1+.12,z,z+2,W,{foot:0,fi:(v,z)=>sh(Math.abs(v-y1-.05)<.06?[40,30,26]:W,.62)}));
  bs.push(djBx(x-.1,y1+.3,x-.04,y1+.36,0,60,[120,88,52]),djBx(x-.1,y1+.48,x-.04,y1+.54,0,58,[120,88,52]));
  return prop(bs,null,{cutN:[1,0]}); }
DJ=null&&(()=>{ const g=WEND.dojo, r=WEND.row.find(q=>q[0]==='ldojo'), h={x0:r[2],x1:r[3],y0:r[4],y1:r[5]};
  return {x0:g.x0,y0:g.y0,x1:g.x1,y1:g.y1,gate:g.gate,h,c:[(h.x0+h.x1)/2,(h.y0+h.y1)/2],T,H:72,DH:56,dw:1.5}; })();
