{
const THFONT={A:'.###.#...##...#######...##...##...#',B:'####.#...##...#####.#...##...#####.',C:'.#####....#....#....#....#.....####',E:'######....#....####.#....#....#####',
  G:'.#####....#....#..###...##...#.###.',H:'#...##...##...#######...##...##...#',I:'#####..#....#....#....#....#..#####',K:'#...##..#.#.#..##...#.#..#..#.#...#',
  M:'#...###.###.#.##.#.##...##...##...#',N:'#...###..##.#.##..###...##...##...#',O:'.###.#...##...##...##...##...#.###.',P:'####.#...##...#####.#....#....#....',
  R:'####.#...##...#####.#.#..#..#.#...#',S:'.#####....#.....###.....#....#####.',T:'#####..#....#....#....#....#....#..',U:'#...##...##...##...##...##...#.###.'};
const THFRONT=(()=>{ let f=null; const build=()=>{ const W=480, H=392, a=new Array(W*H).fill(null), px=(c,z,col)=>{ c=Math.floor(c); z=Math.floor(z); if(c>=0&&c<W&&z>=0&&z<H)a[z*W+c]=col; };
  const box=(c0,z0,c1,z1,col)=>{ for(let z=Math.floor(z0);z<z1;z++)for(let c=Math.floor(c0);c<c1;c++)px(c,z,col); }, U=u=>u*24;
  const disc=(cx,cz,r,col)=>{ for(let z=Math.floor(cz-r);z<=cz+r;z++)for(let c=Math.floor(cx-r);c<=cx+r;c++)if((c+.5-cx)**2+(z+.5-cz)**2<=r*r)px(c,z,col); };
  const text=(s,c,z,k,col,ol)=>{ [...s].forEach((ch,i)=>{ const g=THFONT[ch]; if(!g)return; for(let j=0;j<7;j++)for(let q=0;q<5;q++)if(g[j*5+q]==='#'){
      if(ol)for(const [dx,dz] of [[-1,0],[1,0],[0,-1],[0,1]])box(c+(i*6+q)*k+dx,z+(6-j)*k+dz,c+(i*6+q+1)*k+dx,z+(7-j)*k+dz,ol); } });
    [...s].forEach((ch,i)=>{ const g=THFONT[ch]; if(!g)return; for(let j=0;j<7;j++)for(let q=0;q<5;q++)if(g[j*5+q]==='#')box(c+(i*6+q)*k,z+(6-j)*k,c+(i*6+q+1)*k,z+(7-j)*k,col); }); };
  const brick=(c0,z0,c1,z1)=>{ for(let z=Math.floor(z0);z<z1;z++)for(let c=Math.floor(c0);c<c1;c++){ const r=Math.floor(z/3), cc=c+(r&1)*3; px(c,z,z%3===0||cc%6===0?[136,48,40]:hash(Math.floor(cc/6),r,811)<.3?[164,58,48]:[178,66,52]); } };
  const lit=c=>{ const o=c.slice(); o.e=1; return o; };
  const CREAM=[234,228,206], CREAMD=[200,192,170], GREY=[112,122,144], SID=[140,150,172], DARK=[58,64,88];
  for(const [c0,c1] of [[U(4.73),U(6.8)],[U(13.8),U(16.1)]]){ for(let z=0;z<92;z++)box(c0,z,c1,z+1,z<4?[96,104,124]:z%4===0?[120,130,152]:SID); }
  for(const c0 of [U(5.25),U(14.44)]){ box(c0,4,c0+25,62,[236,236,232]); box(c0+2,4,c0+23,60,[188,194,206]); box(c0+5,36,c0+20,56,[96,110,136]); box(c0+5,8,c0+20,30,[176,182,196]); px(c0+19,32,[60,60,64]); px(c0+19,33,[60,60,64]); }
  box(U(6.8),0,U(13.8),72,DARK); box(U(6.8),0,U(13.8),3,[86,92,112]); box(U(6.8),66,U(13.8),72,[84,92,116]); box(U(6.8),30,U(13.8),34,[236,236,232]);
  for(const c of [U(6.8),U(8.75),U(12.05),U(13.8)])box(c-1,30,c+1,66,[236,236,232]);
  box(U(8.8),0,U(12.05),3,[200,204,210]);
  brick(U(4.73),92,U(16.1),152);
  brick(U(4.73),66,U(16.1),98);
  box(U(6.1),98,U(14.4),134,[74,80,98]); box(U(6.1),132,U(14.4),134,[96,102,122]); box(U(6.1),98,U(14.4),100,[56,60,76]);
  box(U(8.5),106,U(12.1),131,[250,248,240]); box(U(8.5)+2,108,U(12.1)-2,129,[252,250,244]); text('CINEMA',U(8.5)+7,111,2,lit([246,186,44]),lit([206,70,40]));
  box(U(4.4),152,U(16.1),168,CREAM); box(U(4.4),152,U(16.1),154,CREAMD); box(U(4.4),166,U(16.1),168,[246,242,228]);
  brick(0,0,U(4.73),99); box(0,99,U(4.73),111,CREAM); box(0,99,U(4.73),100,CREAMD);
  box(U(.56),45,U(4.3),96,[236,220,160]); box(U(.56)+3,48,U(4.3)-3,93,[214,216,218]); box(U(.56)+3,84,U(4.3)-3,93,[150,152,158]); text('BIG PREMIERE',U(.56)+7,85,1,[250,250,250],null);
  for(let k=0;k<4;k++)box(U(.56)+6+k*6,74,U(.56)+10+k*6,78,[90,94,100]); for(let k=0;k<5;k++)box(U(.56)+6,52+k*4,U(.56)+40,54+k*4,[96,100,108]);
  box(U(2.6),50,U(4.3)-6,80,[176,178,182]); for(const [cx,w] of [[U(2.6)+12,5],[U(2.6)+24,6]]){ disc(cx,70,3.2,[120,124,130]); box(cx-w,50,cx+w,66,[120,124,130]); }
  box(U(.56),4,U(2.6),39,[236,220,160]); box(U(.56)+3,7,U(2.6)-3,36,[52,66,96]); disc(U(.56)+16,26,6,[150,164,190]); disc(U(.56)+16,26,4,[52,66,96]); box(U(.56)+20,14,U(.56)+22,22,[150,164,190]); disc(U(.56)+34,18,2,[230,232,236]);
  box(U(2.8),4,U(4.3),39,[236,220,160]); box(U(2.8)+3,7,U(4.3)-3,36,[244,154,92]); disc(U(2.8)+18,24,5,[252,206,120]); for(let c=U(2.8)+3;c<U(4.3)-3;c++){ const h=7+Math.abs(((c*7)%22)-11); box(c,7,c+1,7+h,[132,80,62]); }
  brick(U(16.1),0,480,99); box(U(16.1),99,480,111,CREAM); box(U(16.1),99,480,100,CREAMD);
  return (u,z)=>{ const c=Math.floor(u*24), q=Math.floor(z); return c>=0&&c<W&&q>=0&&q<H?a[q*W+c]:null; }; }; return (u,z)=>(f||(f=build()))(u,z); })();
let THX0=0, THY=0; const THX=u=>THX0-u, thAt=(x,y)=>{ THX0=x; THY=y; };
function thOut(parts,o,more=[]){ SHARED.PNAME='theatre front'; const x0=THX0; return prop([...parts.map(([u0,u1,z0,z1,d,side,top,foot])=>sided({x0:THX(u1),x1:THX(u0),y0:THY-d,y1:THY,z0,z1,c:side,foot:foot?1:0,top:()=>top||side,
  fs:(nx,ny,X,Y,z,k)=>{ if(ny<0){ const c=THFRONT(x0-X,z+z0); if(c)return c.e?c:sh(c,k); } return sh(side,k); }})),...more],null,o); }
const thFront=clip=>{ const RB=[164,58,48], CR=[234,228,206], GR=[112,122,144], SL=[74,80,98], C=L=>L.map(p=>clip(p)).filter(Boolean);
  for(const [L,o,m] of [[[[0,4.73,0,99,.5,RB,[150,52,44],1],[0,4.83,99,111,.62,CR,[246,242,228]]]],[[[16.1,20,0,99,.5,RB,[150,52,44],1],[16,20,99,111,.62,CR,[246,242,228]]]],
    [[[6.1,14.4,98,134,.15,SL,[96,102,122]],[8.5,12.1,106,131,.2,[250,248,240],[250,248,240]]],{walk:true}],
    [[[4.73,16.1,92,152,.2,RB,[150,52,44],1],[4.4,16.1,152,168,.42,CR,[246,242,228]]],{walk:true}],
    [[[8.4,12.5,0,2,.35,[200,204,210],[214,218,222],1]],{walk:true}]]){ const ps=C(L); if(ps.length||(m&&m.length))thOut(ps,o,m); } };
function theatreScreen(S){ SHARED.PNAME='cinema screen'; const b=S.m/24, y0=S.y-.06, Bk=[12,10,12], bk={c:Bk,top:()=>Bk,fi:()=>Bk,fj:()=>Bk,foot:0};
  const film=(x,z)=>{ const f=filmFrame(30), i=Math.min(FILMW-1,Math.max(0,Math.floor((x-S.x0)/(S.x1-S.x0)*FILMW))), j=Math.min(FILMH-1,Math.max(0,Math.floor((S.z1-z)/(S.z1-S.z0)*FILMH))), q=(j*FILMW+i)*3; return [f[q],f[q+1],f[q+2]]; };
  return prop([{x0:S.x0,y0,x1:S.x1,y1:S.y,z0:S.z0,z1:S.z1,foot:1,em:1,c:[200,200,196],top:()=>Bk,fi:()=>Bk,fj:film},
    {x0:S.x0-b,y0,x1:S.x1+b,y1:S.y,z0:S.z1,z1:S.z1+S.m,...bk},{x0:S.x0-b,y0,x1:S.x1+b,y1:S.y,z0:S.z0-S.m,z1:S.z0,...bk},
    {x0:S.x0-b,y0,x1:S.x0,y1:S.y,z0:S.z0,z1:S.z1,...bk},{x0:S.x1,y0,x1:S.x1+b,y1:S.y,z0:S.z0,z1:S.z1,...bk}],null,{high:true}); }
const VELVET=[138,20,34];
const fold=(u,z,f)=>sh(speck(VELVET,u,z/24,307),f*(.72+.28*Math.sin(u*Math.PI*5)**2));
function theatreDrape(x0,x1,S){ SHARED.PNAME='stage curtain';
  return prop([{x0,y0:S.y-.5,x1,y1:S.y,z0:0,z1:S.z1+S.m+44,c:VELVET,top:()=>sh(VELVET,.8),fi:(y,z)=>fold(y,z,.8),fj:(x,z)=>fold(x,z,1)}],null,{high:true}); }
function theatreValance(S){ SHARED.PNAME='stage curtain'; const b=S.m/24, z0=S.z1+S.m, G=[188,146,58], fr=(u,z,f)=>z<z0+5?sh((Math.floor(u*24)&1)?G:sh(G,.7),f):fold(u,z,f);
  return prop([{x0:S.x0-b,y0:S.y-.6,x1:S.x1+b,y1:S.y,z0,z1:z0+44,foot:0,c:VELVET,top:()=>sh(VELVET,.8),fi:(y,z)=>fr(y,z,.8),fj:(x,z)=>fr(x,z,1)}],null,{walk:true,high:true}); }
const PLUSH=[150,22,36], SEATZ=10;
function theatreSeat(a,y1,w,end){ SHARED.PNAME='cinema chair'; const y0=y1-.7, P=PLUSH, Dk=[26,20,22], Ar=[40,30,28], pl={c:P,top:()=>sh(P,1.18),fi:()=>sh(P,.66),fj:()=>sh(P,.84)};
  const arm=a=>({x0:a-.06,y0:y0+.08,x1:a+.06,y1:y1-.1,z0:0,z1:16,c:Ar,top:()=>[64,50,42],fi:()=>sh(Ar,.7),fj:()=>Ar});
  return prop([{x0:a+.08,y0:y0+.12,x1:a+w-.08,y1:y1-.08,z0:0,z1:4,c:Dk,top:()=>Dk,fi:()=>sh(Dk,.7),fj:()=>Dk},
    {x0:a+.09,y0:y0+.16,x1:a+w-.09,y1:y1-.03,z0:4,z1:SEATZ,foot:0,...pl},{x0:a+.08,y0,x1:a+w-.08,y1:y0+.18,z0:4,z1:30,foot:0,...pl,top:()=>sh(P,1.1)},arm(a),...(end?[arm(a+w)]:[])]); }
function theatreAisleLights(xs,ys){ SHARED.PNAME='aisle lights'; const A=[255,168,80], out=[];
  for(const x of xs)for(const y of ys)out.push({x0:x-.06,y0:y-.06,x1:x+.06,y1:y+.06,z0:0,z1:2,em:1,c:A,top:()=>A,fi:()=>A,fj:()=>A});
  return prop(out,null,{walk:true}); }
const FONT3={E:['111','100','110','100','111'],X:['101','101','010','101','101'],I:['111','010','010','010','111'],T:['111','010','010','010','010']};
function theatreExit(x,y){ SHARED.PNAME='exit sign'; const x0=x-.6, x1=x+.6, z0=68, z1=80;
  const face=(u,z)=>{ const c=Math.floor((x1-u)/(x1-x0)*17)-1, r=Math.floor((z1-2-z)/1.6), L='EXIT'[Math.floor(c/4)], k=c%4;
    return c>=0&&c<16&&k<3&&r>=0&&r<5&&FONT3[L][r][k]==='1'?[255,70,48]:[52,8,8]; };
  return prop([{x0,y0:y,x1,y1:y+.1,z0,z1,foot:1,em:1,c:[52,8,8],top:()=>[30,6,6],fi:()=>[40,8,8],fj:(u,z)=>face(u,z)}],null,{high:true}); }
function theatrePort(x,y,z=296){ SHARED.PNAME='projection port'; const W=[255,226,168], F=[24,20,18];
  return prop([{x0:x-.45,y0:y,x1:x+.45,y1:y+.05,z0:z,z1:z+22,foot:1,c:F,top:()=>F,fi:()=>F,fj:()=>F},{x0:x-.32,y0:y+.05,x1:x+.32,y1:y+.07,z0:z+4,z1:z+18,foot:0,em:1,c:W,top:()=>W,fi:()=>W,fj:()=>W}],null,{high:true}); }
function theatreCarpet(x,y){ const a=(x+y)*1.5, b=(x-y)*1.5, fa=a-Math.floor(a), fb=b-Math.floor(b), n=hash(Math.floor(x*12),Math.floor(y*12),23);
  return mt('carpet',Math.abs(fa-.5)<.08&&Math.abs(fb-.5)<.08?[172,128,56]:fa<.06||fb<.06?[56,14,24]:n<.02?[48,90,100]:speck([104,28,40],x,y,24)); }
function theatreWall(u,z,f){ if(z<7)return sh([18,14,16],f);
  if(z>=46&&z<49)return sh(z<47?[150,118,62]:[112,86,44],f);
  const k=u*2-Math.floor(u*2), c=z>2*STORY?[38,16,24]:[62,24,34]; return sh(speck(c,u,z/24,93),f*(k<.12?.72:k>.6?.9:1)); }
const FILMW=64, FILMH=36, FILMN=48, FILMS=[];
const FONT5={1:['00100','01100','00100','00100','00100','00100','01110'],2:['01110','10001','00001','00110','01000','10000','11111'],3:['11110','00001','00001','01110','00001','00001','11110']};
function filmFrame(k){ '@later'; if(FILMS[k])return FILMS[k]; const W=FILMW, H=FILMH, d=new Uint8Array(W*H*3), cx=W/2, cy=H/2;
  const fl=.9+.1*hash(k,0,301), scr=hash(k,1,302)<.3?Math.floor(hash(k,2,303)*W):-1;
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){ let c;
    if(k<24){ const n=3-Math.floor(k/8), dx=i+.5-cx, dy=j+.5-cy, r=Math.hypot(dx,dy*1.15), a=(Math.atan2(dx,-dy)+2*Math.PI)%(2*Math.PI), sw=(k%8+1)/8*2*Math.PI;
      c=r>16?[96,94,88]:a<sw?[188,186,176]:[146,144,136];
      if(Math.abs(r-15.5)<.7||Math.abs(r-11.5)<.6||Math.abs(dx)<.6||Math.abs(dy)<.6)c=[52,50,46];
      const gx=Math.floor((i-(cx-7.5))/3), gy=Math.floor((j-(cy-10.5))/3); if(gx>=0&&gx<5&&gy>=0&&gy<7&&FONT5[n][gy][gx]==='1')c=[18,18,18]; }
    else{ const s=k-24, hz=21;
      if(j<hz){ const t=j/hz; c=[40+t*200,28+t*92,70-t*10]; const sd=Math.hypot(i-42,(j-(15+s*.18))*1.1); if(sd<6)c=sd<5?[255,214,124]:[250,170,90]; }
      else{ const t=(j-hz)/(H-hz); c=[30-t*16,40-t*20,84-t*36];
        if(Math.abs(i-42)<5-t*3&&(i+j*3+s)%4===0)c=[244,160,84]; else if(hash(i,j*7+(s>>1),304)<.04)c=[70,74,120]; }
      const bx=Math.round(4+s*1.4), bh=j-hz;
      if((bh===0&&i>=bx-5&&i<=bx+4)||(bh===1&&i>=bx-4&&i<=bx+3))c=[22,16,24];
      if(j>=11&&j<hz&&i===bx)c=[22,16,24]; if(j>=12&&j<hz-1&&i<bx&&i>=bx-(j-11)*.55)c=[34,24,34];
      const gx=56-s, gy=7+((s>>1)&1); if((j===gy&&(i===gx-1||i===gx+1))||(j===gy+1&&i===gx))c=[30,20,30]; }
    const v=1-.38*Math.min(1,((i+.5-cx)/cx)**2+((j+.5-cy)/cy)**2)**2, g=hash(i,j+k*41,305), m=fl*v*(g<.03?.7:g>.985?1.25:1);
    if(i===scr&&hash(j,k,306)<.85)c=[214,210,196];
    const q=(j*W+i)*3; for(let e=0;e<3;e++)d[q+e]=Math.min(255,c[e]*m); }
  return FILMS[k]=d; }
const ARCN=[[236,64,160],[60,206,230],[238,218,70],[96,220,100],[170,92,236]];
function arcadeFloor(x,y){ '@later'; const cx=Math.floor(x*1.25), cy=Math.floor(y*1.25), k=hash(cx,cy,741), base=mt('carpet',speck([24,20,40],x,y,743));
  if(k<.15)return base; const t=Math.floor(hash(cx,cy,745)*5), a=hash(cy,cx,747)*Math.PI, ca=Math.cos(a), sa=Math.sin(a);
  const ox=.4+(hash(cx,cy,749)-.5)*.16, oy=.4+(hash(cy,cx,751)-.5)*.16, dx=x-(cx+ox*1.25)/1.25, dy=y-(cy+oy*1.25)/1.25, u=dx*ca+dy*sa, v=-dx*sa+dy*ca;
  const r=Math.hypot(u,v), col=ARCN[Math.floor(hash(cx,cy,753)*ARCN.length)];
  let on=false;
  if(t===0)on=Math.abs(r-.16)<.035;
  else if(t===1){ const d=Math.max(v-.11,(-v*.5+u*.866)-.11,(-v*.5-u*.866)-.11); on=d<0&&d>-.06; }
  else if(t===2)on=Math.abs(u)<.24&&Math.abs(v-.07*Math.sin(u*22))<.032;
  else if(t===3)on=[[-.11,-.05],[0,.08],[.11,-.05]].some(([p,q])=>Math.hypot(u-p,v-q)<.045);
  else on=Math.abs(u)<.03&&Math.abs(v)<.14||Math.abs(v)<.03&&Math.abs(u)<.14;
  return on?mt('carpet',[(col[0]+24)/2,(col[1]+20)/2,(col[2]+40)/2]):base; }
const arcadeLights=A=>{ '@later'; const o=[], i=T, n=(a,b)=>Math.max(1,Math.round((b-a)/4)); for(const [y,ny] of [[A.y0+i,1],[A.y1-i,-1]]){ const k=n(A.x0,A.x1); for(let j=0;j<k;j++)o.push([A.x0+(A.x1-A.x0)*(j+.5)/k,y,0,ny]); }
  for(const [x,nx] of [[A.x0+i,1],[A.x1-i,-1]]){ const k=n(A.y0,A.y1); for(let j=0;j<k;j++)o.push([x,A.y0+(A.y1-A.y0)*(j+.5)/k,nx,0]); } return o; };
const arcadeWallOf=ARCS=>function(q,nx,ny,X,Y,z,f){ const zz=z%STORY;
  if(zz<4)return sh([16,14,20],f);
  if(zz>=54&&zz<63){ const u=nx?Y:X; for(const s of ARCS)if((nx?s[2]:s[3])&&Math.abs((nx?s[1]:s[0])-u)<.13&&Math.abs((nx?s[0]:s[1])-(nx?X:Y))<.3){ const d=Math.abs((nx?s[1]:s[0])-u); if(d<.1&&zz>=55&&zz<62){ const c=[255,214,170]; c.e=1; return c; } return sh([150,124,92],f); } }
  if(zz>=46&&zz<49)return sh([236,64,160],f); if(zz>=50&&zz<52)return sh([60,206,230],f);
  return sh(speck([54,34,62],nx?Y:X,z/24,755),f); }
const ARC=(()=>{ const {art,onF,lit,C,rect,fb,worn,metal}=MLK;
  const W=[232,232,236], WD=[196,198,206], WL=[244,244,248];
  const white=(k)=>(s,t,z)=>{ const c=worn(W,t,z,k); return s==='b'?sh(c,.9):c; };
  function arcade(x,y,f=[0,1],green=0){ '@later'; SHARED.PNAME=green?'arcade cabinet, green':'arcade cabinet, pink'; const r=rect(x,y,f,1.5,1.3), T=green?[110,220,80]:[236,70,160], TD=sh(T,.7), B=[];
    const front=art(36,83,(px,bx)=>{ bx(0,0,72,166,W); bx(0,150,72,166,[120,120,126]); bx(4,154,68,160,[80,80,86]); bx(0,0,72,4,T); bx(0,4,3,166,TD); bx(69,4,72,166,TD);
      bx(6,10,66,24,lit([250,240,230])); bx(10,13,62,21,lit(T));
      bx(8,30,64,86,[20,20,24]); bx(12,34,60,82,lit([40,48,72])); bx(16,38,56,50,lit([90,140,200])); bx(18,60,32,78,lit([230,120,80])); bx(40,58,54,78,lit([120,200,120])); bx(16,52,56,54,lit([240,240,120]));
      bx(6,92,66,112,[200,202,208]); bx(6,92,66,95,[228,228,232]); for(const cx of [20,52]){ bx(cx-2,98,cx+2,110,[60,60,66]); bx(cx-4,96,cx+4,100,[30,30,34]); }
      for(let i=0;i<3;i++){ bx(26+i*6,100,30+i*6,104,lit(T)); bx(26+i*6,106,30+i*6,110,lit([240,220,80])); }
      bx(6,118,66,146,[214,216,222]); bx(10,122,62,142,W); });
    B.push(fb(r,0,1,0,1,0,83,W,onF(front,83,(s,t,z)=>z<4?[120,120,126]:s==='b'&&z>50&&z<70&&(Math.floor(z/2)&1)?WD:white(93)(s,t,z)),(t,d)=>d>.6?W:WL));
    B.push(fb(r,0,1,0,.4,83,88,W,(s,t,z)=>s==='f'?lit(T):W,()=>WL,{foot:1}));
    const p=prop(B); LAMPS.push({own:1,room:1,x:r.cx+f[0]*1,y:r.cy+f[1]*1,z:50,r:2.4,c:green?[.5,1,.6]:[1,.5,.8],prop:p,day:true}); return p; }
  function redStool(x,y){ '@later'; SHARED.PNAME='red stool'; const r=rect(x,y,[0,1],.7,.5), B=[fb(r,0,1,0,1,13,19,C.red,(s,t,z)=>z<2?C.redD:z>4?C.redL:C.red,(t,d)=>Math.min(t,1-t,d*1.4,(1-d)*1.4)<.06?C.redD:C.red)];
    for(const [a,b,c,d] of [[.05,.12,.08,.22],[.88,.95,.08,.22],[.05,.12,.78,.92],[.88,.95,.78,.92]])B.push(fb(r,a,b,c,d,0,13,C.chrome,(s,t,z)=>metal(C.chrome,t,z),null,{foot:1})); return prop(B); }
  return {arcade,redStool}; })();
const QR = {
  black: [34, 32, 40], dark: [62, 58, 66], grey: [128, 128, 136], greyLight: [180, 182, 190], steel: [150, 156, 166],
  red: [206, 62, 46], redDark: [150, 40, 38], green: [70, 255, 110], pink: [255, 80, 200], cyan: [90, 230, 255], ice: [196, 250, 255], yellow: [255, 214, 70], orange: [255, 150, 60],
  screen: [22, 28, 58], sky: [60, 170, 190], hill: [120, 90, 190], ground: [200, 120, 70], sun: [255, 220, 110], board: [120, 176, 226], paper: [236, 226, 206]
};
const GR3 = { A: '010101111101101', R: '111101110101101', C: '111100100100111', D: '110101101101110', E: '111100110100111' };
const grSh = (c, f) => [Math.round(c[0] * f), Math.round(c[1] * f), Math.round(c[2] * f)];
const grE = (c, a) => { const o = a === undefined || a >= 1 ? [c[0], c[1], c[2]] : [c[0], c[1], c[2], Math.round(a * 255)]; o.e = 1; return o; };
const grWord = (word, x, y, px, py) => {
  if (px < x || py < y) return false;
  const k = Math.floor((px - x) / 4), cx = (px - x) % 4, row = py - y;
  return k < word.length && cx < 3 && row < 5 && GR3[word[k]][row * 3 + cx] === '1';
};
const grScreen = (pic, strip) => (a, k, w, h, f) => {
  const sw = w - 4 - (strip || 0);
  if (strip && a >= w - strip - 1 && a < w - 2) return (a === w - strip + 1 && (k === h - 6 || k === h - 11)) ? QR.greyLight : (k < h >> 1 && k > 2 && k % 2 && a > w - strip) ? QR.black : null;
  return (a < 2 || a >= 2 + sw || k < 2 || k >= h - 2) ? null : grE(pic(a - 2, h - 3 - k, sw, h - 4, f));
};
const grCabinet = (x, y, w, h, f) => { '@later';
  for (const [ly, c] of [[4, QR.pink], [9, QR.cyan], [14, QR.yellow]]) { if (y === ly && x > 1 && x < w - 2 && (x + ly) % 9 > 1) return [60, 110, 230]; if (y === ly - 1 && (x + f * (ly % 2 ? 1 : -1) + 40) % 13 === 3) return c; }
  return y >= h - 2 ? [200, 60, 60] : [10, 10, 18];
};
const grVents = (c) => (a, k, w, h) => (k > 2 && k < h - 3 && k % 2 && a > 3 && a < w - 4 ? c : null);
const grBox = (b, c, f) => ({ b, c, f });
const GRM = {
  arcade: () => { '@later';
    const trim = (a, k, w, h) => (a === 0 || a === w - 1) ? grE(QR.green) : null, cap = (a, k, w, h) => (a === 0 || a === w - 1 || k === h - 1) ? grE(QR.green) : null, foot = (a, k, w, h) => (a === 0 || a === w - 1 || k === 0) ? grE(QR.green) : null;
    return { w: 28, d: 32, h: 64, frames: 4, rate: 3, parts: [
      grBox([0, 0, 0, 28, 24, 27], QR.black, { front: (a, k, w, h) => (a > 3 && a < w - 4 && k > 3 && k < h - 4) ? QR.yellow : foot(a, k, w, h), left: foot, right: foot, back: (a, k, w, h) => (a === 0 || a === w - 1 || k === 0) ? grE(QR.green) : ((a === 5 || a === w - 6) && k > 4 && k < h - 4 || (k === 5 || k === h - 5) && a > 4 && a < w - 5) ? QR.dark : null }),
      grBox([0, 20, 27, 28, 32, 32], QR.black, { front: (a, k, w, h) => (k > 0 && k < h - 1 && a > 1 && a < w - 2) ? QR.orange : trim(a, k, w, h), left: (a, k, w, h) => (a === w - 1 || k === 0 || k === h - 1) ? grE(QR.green) : null, right: (a, k, w, h) => (a === 0 || k === 0 || k === h - 1) ? grE(QR.green) : null,
        top: (x, y, w, h) => (x === 0 || x === w - 1) ? grE(QR.green) : (y > 2 && y < 7 && x > 4 && x < 10) ? QR.dark : (y > 4 && y < 8 && x > 13 && x < 24 && x % 3 === 0) ? [QR.red, QR.cyan, QR.yellow][Math.floor(x / 3) % 3] : null }),
      grBox([6, 24, 32, 8, 26, 35], QR.red),
      grBox([0, 0, 32, 28, 20, 52], QR.black, { front: (a, k, w, h, f) => (a === 0 || a === w - 1) ? grE(QR.green) : grScreen(grCabinet)(a, k, w, h, f), left: trim, right: trim, back: (a, k, w, h) => (a === 0 || a === w - 1) ? grE(QR.green) : grVents(QR.dark)(a, k, w, h) }),
      grBox([0, 0, 52, 28, 25, 64], QR.black, { front: (a, k, w, h) => (k > 1 && k < h - 2 && a > 1 && a < w - 2) ? (grWord('ARCADE', 3, 4, a, h - 1 - k) ? grE(QR.yellow) : grE([196, 48, 60])) : cap(a, k, w, h), left: cap, right: cap, back: cap, top: (x, y, w, h) => (x === 0 || x === w - 1) ? grE(QR.green) : null })
    ] }; },
};
function grProp(name,M,x,y,z,o){ '@later'; SHARED.PNAME=name; const S=1/FP, F=M.frames||0; let cur=0;
  const tone=(c,k)=>!c?null:c.e||k===1?c:grSh(c,k);
  const same=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2]&&!a.e===!b.e;
  const boxes=M.parts.map((pt,i)=>{ const [x0,y0,z0,x1,y1,z1]=pt.b, fc=pt.f||{}, h=z1-z0, sides=['front','back','left','right'].some(s=>fc[s]);
    const pic=(fn,a,k,w,hh,sk)=>{ if(!F||LIFE.mode!==1)return tone(fn(a,k,w,hh,0),sk);
      const c=fn(a,k,w,hh,cur); return c&&c.e&&c.length<4&&!same(c,fn(a,k,w,hh,0))?c:null; };
    const plain=sk=>F&&LIFE.mode===1?null:pt.c?grSh(pt.c,sk):null;
    const fs=(nx,ny,X,Y,Z,sk)=>{ const nm=nx>0?'right':nx<0?'left':ny>0?'front':'back', fn=fc[nm]; if(!fn)return plain(sk);
      const px=Math.floor((X-x)*FP), py=Math.floor((Y-y)*FP), k=Math.floor(Z), fb=nm==='front'||nm==='back';
      const a=nm==='front'?px-x0:nm==='back'?x1-1-px:nm==='right'?y1-1-py:py-y0;
      return pic(fn,a,k,fb?x1-x0:y1-y0,h,sk)||plain(sk); };
    const top=(X,Y)=>{ if(!fc.top)return pt.c; const c=fc.top(Math.floor((X-x)*FP)-x0,Math.floor((Y-y)*FP)-y0,x1-x0,y1-y0,0); return c||pt.c; };
    return sided({x0:x+x0*S,y0:y+y0*S,x1:x+x1*S,y1:y+y1*S,z0:z+z0,z1:z+z1,c:pt.c,top,fs,foot:1,nb:pt.c?0:1,life:F&&sides?1:0}); });
  const p=prop(boxes,null,{...o,hang:M.wall?z:0,walk:!!(M.wall&&z>0||M.h<8),life:F?t=>{ cur=Math.floor(t*12/M.rate)%F; }:undefined,lifeKey:F?()=>cur:undefined});
  if(M.light)LAMPS.push({x:x+M.w*S/2,y:y+M.d*S+.15,z:z+M.h/2,r:M.light.r,c:M.light.c,own:1,room:1,day:true,prop:p}); return p; }
const VRBG=[212,202,178], VRBLK=[36,38,42], VRRUB=[44,42,40];
function vrHeadsetBoxes(x,y,z0=0,cable=true){ '@later'; const H=20, w=.31, sd=(o)=>sided({c:VRBG,...o}), worn=(c,a,z)=>{ const q=hash(Math.floor(a*60),Math.floor(z),181); return z<2.5?sh(c,.82):q<.03?sh(c,.86):q>.985?sh(c,1.07):c; };
  const body=sd({x0:x-w,y0:y-.2,x1:x+w,y1:y+.12,z0:z0+2,z1:z0+H+2,foot:1,fs:(nx,ny,X,Y,z,k)=>{ const a=(nx?Y-y:X-x)*24, c=worn(VRBG,nx?Y:X,z);
      if(ny>0){ if(z>4&&z<16){ for(const m of [-3.7,3.7]){ const q=Math.hypot(a-m,(z-10)*1.25); if(q<3.6)return q<1.4?[82,96,110]:q<2.6?[56,64,76]:VRBLK; } return Math.abs(a)>w*24-1?sh(VRBLK,.8):sh(VRBLK,1.1); } if(z>16.5&&z<18)return sh(c,.86*k*1.2); }
      return sh(z>H-1.5?sh(c,1.05):c,k*1.2); },top:(X,Y)=>((X-x)*12+12)%1<.3&&Y>y-.12&&Y<y+.04?sh(VRBG,.7):sh(VRBG,.97)});
  const pad=sd({x0:x-w+.02,y0:y-.28,x1:x+w-.02,y1:y-.2,z0:z0+4,z1:z0+H,c:[62,58,54],fs:(nx,ny,X,Y,z,k)=>sh([62,58,54],k*1.2)});
  const rub=o=>sd({c:VRRUB,...o,fs:(nx,ny,X,Y,z,k)=>sh(VRRUB,k*1.2),top:()=>sh(VRRUB,1.2)});
  const bs=[body,pad,rub({x0:x-w,y0:y-.3,x1:x-w+.04,y1:y-.18,z0:z0+H,z1:z0+H+10}),rub({x0:x+w-.04,y0:y-.3,x1:x+w,y1:y-.18,z0:z0+H,z1:z0+H+10}),rub({x0:x-w,y0:y-.3,x1:x+w,y1:y-.18,z0:z0+H+10,z1:z0+H+13}),
    rub({x0:x+w,y0:y-.05,x1:x+w+.06,y1:y+.05,z0:z0+5,z1:z0+10})];
  if(cable)for(let i=0;i<8;i++){ const a=i*.85, cx=x+.42+Math.cos(a)*.14+i*.06, cy=y+.2+Math.sin(a)*.12+i*.03; bs.push({x0:cx-.055,y0:cy-.055,x1:cx+.055,y1:cy+.055,z0,z1:z0+4,c:VRRUB,top:()=>sh(VRRUB,1.15)}); }
  return bs; }
function vrStation(x,y){ '@later'; SHARED.PNAME='VR headset station'; const Z=30, sd=o=>sided(o), BG=VRBG, PK=[232,74,160], BL=[70,140,240];
  const face=(nx,ny,X,Y,z,k)=>{ const a=(nx?Y-y:X-x)*24, c=z<2?sh(BG,.7):z>Z-2?sh(BG,1.05):BG;
    if(ny>0){ if(z>5&&z<Z-6&&Math.abs(a)<13){ if(Math.abs(a-9)<1.6&&Math.abs(z-(Z-10))<1.6)return Object.assign([120,255,150],{e:1}); return Math.abs(z-9)<1?PK:Math.abs(z-11)<1?BL:VRBLK; } }
    return sh(c,k*1.2); };
  const B=[sd({x0:x-.65,y0:y-.35,x1:x+.65,y1:y+.35,z0:0,z1:Z,c:BG,foot:1,fs:face,top:(X,Y)=>Math.min(X-x+.65,x+.65-X,Y-y+.35,y+.35-Y)<.05?sh(BG,1.08):sh(BG,.94)}),
    ...vrHeadsetBoxes(x-.1,y+.02,Z,false),{x0:x+.3,y0:y-.1,x1:x+.38,y1:y-.02,z0:Z,z1:Z+6,c:VRRUB,top:()=>sh(VRRUB,1.15)}];
  const p=prop(B); LAMPS.push({x,y:y+.45,z:Z-8,r:1.6,c:[.3,.95,.45],own:1,room:1,day:true,prop:p});
  p.opts=()=>typeof vrOpts==='function'?vrOpts(p):[]; return p; }
STOREK.theatre={THFONT,THFRONT,thAt,thFront,theatreCarpet,theatreWall,theatreScreen,theatreDrape,theatreValance,theatreSeat,theatreAisleLights,theatreExit,theatrePort,filmFrame,FILMW,FILMH,FILMN,ARCN,arcadeFloor,arcadeLights,arcadeWallOf,ARC,grProp,GRM,vrStation};
}
