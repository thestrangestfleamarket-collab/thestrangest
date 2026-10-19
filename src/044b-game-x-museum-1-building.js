const MUC={stone:[214,206,188],stoneL:[226,220,204],stoneD:[186,178,160],joint:[166,158,140],skirt:[52,44,38],gilt:[196,160,82],giltD:[146,114,52],
  marble:[224,218,204],marbleG:[200,198,192],vein:[150,146,140],grout:[176,170,156],verde:[48,72,60],verdeL:[70,98,82],
  oak:[128,88,54],oakL:[146,104,64],oakD:[106,70,42],seam:[66,44,28],flag:[150,140,124],flagL:[166,156,138],flagD:[128,118,104],
  west:[186,148,94],east:[146,72,44],earth:[44,66,52],humans:[132,78,52],closed:[44,52,84],egBlue:[40,70,130],egRed:[160,52,36],egGreen:[54,110,82],ink:[30,28,26],title:[236,226,196],
  rock:[200,186,160],rockL:[218,206,182],rockD:[168,152,126],ochre:[176,72,36],ochreD:[130,50,28],black:[30,24,22],yellow:[196,150,62],
  slab:[204,192,160],slabD:[176,162,128],fossil:[150,128,96],fossilD:[106,88,62],fossilL:[184,166,132],granite:[120,118,116]};
const muLit=c=>Object.assign([...c],{e:1});
const MUF={A:'.###.#...##...#######...##...##...#',B:'####.#...##...#####.#...##...#####.',C:'.#####....#....#....#....#.....####',D:'####.#...##...##...##...##...#####.',
  E:'######....#....####.#....#....#####',F:'######....#....####.#....#....#....',G:'.#####....#....#..###...##...#.###.',H:'#...##...##...#######...##...##...#',
  I:'#####..#....#....#....#....#..#####',J:'..###...#....#....#....##..#..##..',K:'#...##..#.#.#..##...#.#..#..#.#...#',L:'#....#....#....#....#....#....#####',
  M:'#...###.###.#.##.#.##...##...##...#',N:'#...###..##.#.##..###...##...##...#',O:'.###.#...##...##...##...##...#.###.',P:'####.#...##...#####.#....#....#....',
  Q:'.###.#...##...##...##.#.##..#..##.#',R:'####.#...##...#####.#.#..#..#.#...#',S:'.#####....#.....###.....#....#####.',T:'#####..#....#....#....#....#....#..',
  U:'#...##...##...##...##...##...#.###.',V:'#...##...##...##...##...#.#.#..#...',W:'#...##...##...##.#.##.#.###.###...#',X:'#...##...#.#.#..#...#.#.#...##...#',
  Y:'#...##...#.#.#..#....#....#....#...',Z:'#####....#...#...#...#...#....#####',0:'.###.#...##..###.#.###..##...#.###.',1:'..#...##....#....#....#....#...###.',
  2:'.###.#...#....#...#...#...#...#####',3:'####.....#....#.###.....#....#####.',4:'...#...##..#.#.#..#.#####...#....#.',5:'######....####.....#....##...#.###.',
  6:'..##..#...#....####.#...##...#.###.',7:'#####....#...#...#...#....#....#...',8:'.###.#...##...#.###.#...##...#.###.',9:'.###.#...##...#.####....#...#..##..',
  '&':'.##..#..#.#.#...#...#.#.##..#..##.#',',':'.........................#...#.....','.':'..................................#','-':'...............###...............',
  ':':'.......#..............#...........',"'":'..#....#..........................','·':'.................#.................'};
const muTW=(s,k=1)=>(s.length*6-1)*k;
function muText(put,s,c,z,k,col){ [...s].forEach((ch,i)=>{ const g=MUF[ch]; if(!g)return; for(let j=0;j<7;j++)for(let q=0;q<5;q++)if(g[j*5+q]==='#')for(let a=0;a<k;a++)for(let b=0;b<k;b++)put(c+(i*6+q)*k+a,z+(6-j)*k+b,col); }); }
function musRoom(x,y){ const M=MUS; for(const k of ['hall','west','east','earthR','humansR','closedR']){ const r=M[k]; if(x>=r.x0-.05&&x<r.x1+.05&&y>=r.y0-.05&&y<r.y1+.05)return k; } return null; }
function museumHallCol(x,y,r){ const c=MUC, e=Math.min(x-r.x0,r.x1-x,y-r.y0,r.y1-y);
    if(e<.5)return mt('tiles',e<.06||Math.abs(e-.44)<.03?sh(c.verde,.8):cvNoise(x*3,y*3,1701)>.6?c.verdeL:c.verde);
    const s=1.5, i=Math.floor((x-r.x0-.5)/s), j=Math.floor((y-r.y0-.5)/s), u=x-r.x0-.5-i*s, v=y-r.y0-.5-j*s;
    if(u<.04||v<.04)return mt('tiles',c.grout);
    const b=(i+j)&1?c.marbleG:c.marble, n=cvNoise(x*1.6+i*7,y*1.6+j*5,1703)+cvNoise(x*5,y*5,1705)*.3;
    return mt('tiles',Math.abs(n-.72)<.012?c.vein:speck(b,x,y,1707)); }
function museumFloorCol(x,y){ const c=MUC, k=musRoom(x,y), M=MUS;
  if(k==='hall')return museumHallCol(x,y,M.hall);
  if(k==='earthR'||k==='humansR'){ const w=1.2, d=.9, j=Math.floor(y/d), o=hash(j,0,1709)*w, i=Math.floor((x+o)/w), u=x+o-i*w, v=y-j*d;
    if(u<.04||v<.04)return mt('concrete',sh(c.flagD,.8));
    const n=cvNoise(x*1.3,y*1.3,1711)+(hash(i,j,1713)-.5)*.25+(hash(Math.floor(x*24),Math.floor(y*24),1715)-.5)*.06;
    return mt('concrete',n<.4?c.flagD:n<.62?c.flag:c.flagL); }
  const bw=.25, i=Math.floor(x/bw), u=x-i*bw, L=1.5, o=hash(i,0,1717)*L, j=Math.floor((y+o)/L), v=y+o-j*L;
  if(u<.03||v<.03)return mt('wood',c.seam);
  const n=hash(i,j,1719), b=n<.35?c.oak:n<.7?c.oakL:c.oakD, g=hash(Math.floor(x*24),Math.floor(y*6),1721);
  return mt('wood',g<.05?sh(b,.92):g>.96?sh(b,1.06):b); }
const MUP=(()=>{ let o=null; const mk=(nx,ny,at,a0,a1,z0,H,draw)=>{ const u=(a)=>(nx?-a*nx:a*ny)*24, ua=u(a0), ub=u(a1), u0=Math.min(ua,ub), W=Math.round(Math.abs(ub-ua)), a=new Array(W*H).fill(null);
    draw((c,z,col)=>{ c=Math.floor(c); z=Math.floor(z); if(col&&c>=0&&c<W&&z>=0&&z<H)a[z*W+c]=col; },W,H); return {nx,ny,at,u0,z0,W,H,a}; };
  const build=()=>{ const M=MUS, c=MUC, B=M.b, out=[];
    const title=(nx,ny,at,a0,a1,num,name,k)=>{ const h=k*7+16, z0=M.archZ+10; out.push(mk(nx,ny,at,a0,a1,z0,h,(put,W)=>{ const w=Math.max(muTW(name,k),muTW(num,1))+16, l=Math.floor((W-w)/2);
      for(let z=0;z<h;z++)for(let q=l;q<l+w;q++)put(q,z,z<1||z>=h-1||q===l||q===l+w-1?c.giltD:c.stoneL);
      muText(put,num,Math.floor((W-muTW(num,1))/2),h-11,1,c.giltD); muText(put,name,Math.floor((W-muTW(name,k))/2),3,k,c.gilt); })); };
    title(0,1,B.y0+T,M.hall.x0,M.hall.x1,'THE GREAT HALL','MUSEUM OF EARTH',2);
    title(1,0,M.hx0+T,M.west.y0,M.by,'GALLERY 1','ANCIENT EGYPT',2); title(-1,0,M.hx1-T,M.east.y0,M.by,'GALLERY 2','AFRICA, CRADLE OF HUMANS',2);
    title(0,-1,M.by-T,M.hall.x0,M.hall.x1,'GALLERY 3','CAVE PEOPLE · ICE AGE',2); title(0,-1,M.by-T,M.west.x0,M.west.x1,'GALLERY 4','EARTH BEFORE US',1);
    title(0,-1,M.by-T,M.east.x0,M.east.x1,'GALLERY 5','WORLD TREASURES',1);
    out.push(mk(0,-1,B.y1-T,M.humansR.x0,M.humansR.x1,14,150,(put,W,H)=>{
      for(let z=0;z<H;z++)for(let q=0;q<W;q++){ const n=cvNoise(q/14,z/10,1731)+cvNoise(q/5,z/4,1733)*.35, e=Math.min(z,H-1-z,q,W-1-q);
        if(e<3+cvNoise(q/6,z/6,1735)*5)continue; put(q,z,Math.abs(n-.78)<.012?c.rockD:n<.55?c.rockD:n<1.02?c.rock:c.rockL); }
      const ell=(cx,cz,rx,rz,col,fill)=>{ for(let z=Math.floor(cz-rz)-1;z<=cz+rz+1;z++)for(let q=Math.floor(cx-rx)-1;q<=cx+rx+1;q++){ const d=((q+.5-cx)/rx)**2+((z+.5-cz)/rz)**2; if(fill?d<1:d<1&&d>.72)put(q,z,col); } };
      const line=(x0,z0,x1,z1,col,w=1)=>{ const n=Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(z1-z0))); for(let i=0;i<=n;i++){ const q=Math.round(x0+(x1-x0)*i/n), z=Math.round(z0+(z1-z0)*i/n); for(let a=0;a<w;a++)put(q+a,z,col); } };
      const bull=(cx,cz,s,d)=>{ ell(cx,cz,26*s,10*s,c.black); ell(cx-d*6*s,cz+3*s,12*s,8*s,c.black); ell(cx+d*28*s,cz+2*s,6*s,5*s,c.black,true);
        line(cx+d*30*s,cz+6*s,cx+d*40*s,cz+16*s,c.black,2); line(cx+d*26*s,cz+6*s,cx+d*30*s,cz+18*s,c.black,2);
        for(const [a,b] of [[-18,-1],[-12,1],[14,-1],[20,1]])line(cx+d*a*s,cz-8*s,cx+d*(a+b*2)*s,cz-22*s,c.black,2);
        for(let i=0;i<6;i++)put(cx-d*(10-i*5)*s,cz-2*s+hash(i,cx,1737)*4,c.black); };
      const horse=(cx,cz,s,d,col)=>{ ell(cx,cz,16*s,8*s,col,true); ell(cx+d*16*s,cz+6*s,5*s,4*s,col,true); line(cx+d*6*s,cz+7*s,cx+d*16*s,cz+10*s,c.black,2);
        for(const a of [-10,-6,8,12])line(cx+d*a*s,cz-6*s,cx+d*a*s,cz-16*s,c.black,2); ell(cx,cz-2*s,12*s,4*s,sh(col,.75),true); };
      bull(70,92,1.3,1); bull(196,98,1.45,-1); horse(150,70,1,1,c.ochre); horse(36,50,.9,1,c.ochreD); horse(250,50,.8,-1,c.ochre);
      ell(120,40,10,5,c.ochreD,true); line(128,42,134,54,c.ochreD,2);
      line(132,56,126,72,c.black); line(134,56,142,72,c.black); line(129,64,123,67,c.black); line(139,64,145,67,c.black);
      for(let i=0;i<9;i++)ell(100+i*7,124-(i&1)*3,1.5,1.5,c.black,true); for(let i=0;i<5;i++)ell(214+i*8,128,1.5,1.5,c.ochre,true); }));
    out.push(mk(1,0,B.x0+T,M.earthR.y0,M.earthR.y1,24,110,(put,W,H)=>{ const sw=Math.floor((W-24)/3);
      for(let s=0;s<3;s++){ const l=6+s*(sw+6); for(let z=0;z<H;z++)for(let q=l;q<l+sw;q++){ const e=Math.min(z,H-1-z,q-l,l+sw-1-q), n=cvNoise(q/9,z/9,1741+s);
          put(q,z,e<2?c.giltD:e<3?c.gilt:n<.4?c.slabD:c.slab); } }
      const ammo=(cx,cz,R)=>{ for(let z=Math.floor(cz-R);z<=cz+R;z++)for(let q=Math.floor(cx-R);q<=cx+R;q++){ const dx=q+.5-cx, dz=z+.5-cz, r=Math.hypot(dx,dz); if(r>R)continue;
          const a=Math.atan2(dz,dx), t=(Math.log(Math.max(r,.5)/R)/-.55+a/(2*Math.PI)+8)%1, rib=Math.floor((a+Math.PI)/(2*Math.PI)*28+r*.4)%2;
          put(q,z,t<.14?c.fossilD:r>R-1?c.fossilD:rib?c.fossil:c.fossilL); } };
      const trilo=(cx,cz,L)=>{ for(let z=Math.floor(cz-L);z<=cz+L;z++)for(let q=Math.floor(cx-L*.6);q<=cx+L*.6;q++){ const dx=(q+.5-cx)/(L*.6), dz=(z+.5-cz)/L; if(dx*dx+dz*dz>1)continue;
          const head=dz>.45, seg=Math.floor((dz+1)*L*.9)%2, ax=Math.abs(dx)<.28; put(q,z,head?(Math.abs(dx-.3)<.12&&dz<.7||Math.abs(dx+.3)<.12&&dz<.7?c.fossilD:c.fossilL):ax?(seg?c.fossilD:c.fossil):(seg?c.fossil:c.fossilL)); } };
      ammo(6+sw/2,H/2,Math.min(sw,H)/2-8); trilo(6+sw+6+sw*.3,H*.62,15); trilo(6+sw+6+sw*.72,H*.36,11); ammo(6+sw+6+sw*.7,H*.75,9); ammo(6+sw+6+sw*.28,H*.26,7);
      for(let i=0;i<5;i++)ammo(6+2*(sw+6)+sw*(.25+.5*hash(i,1,1751)),H*(.15+i*.17),5+hash(i,2,1753)*6); trilo(6+2*(sw+6)+sw*.7,H*.55,9); }));
    return out; };
  return {get all(){ return o||(o=build()); }}; })();
const MUEG=(()=>{ const g={ankh:['.###.','#...#','#...#','.###.','#####','..#..','..#..','..#..'],eye:['.###...','#####..','#.#.##.','.###..#','..#...#','..#..#.'],
    owl:['.##..','####.','#.##.','####.','.###.','.###.','.#.#.','##.##'],water:['#...#...','.#.#.#.#','..#...#.'],reed:['..#','.##','.##','###','###','.##','.#.','.#.'],
    bread:['.###.','#####'],man:['.##..','.##..','.#...','####.','.###.','.####','#####']};
  const order=[['ankh',2],['eye',0],['owl',3],['water',0],['reed',1],['bread',2],['man',3],['water',0],['ankh',2],['reed',1],['owl',3],['bread',2]];
  return {g,order}; })();
function muEgypt(u,z){ const c=MUC, H=MUS.H; if(z>=H-24&&z<H-12){ const a=((Math.floor(u)%6)+6)%6, zz=z-(H-24); if(a===0)return c.ink; if(zz>9)return a===3?c.ink:c.west; return [c.egRed,c.egBlue,c.egGreen][((Math.floor(u/6)%3)+3)%3]; }
  if(z>=H-12&&z<H-10)return c.ink;
  if(z>=124&&z<146){ if(z<126||z>=144)return c.egBlue; const n=Math.floor(u/12), [k,ci]=MUEG.order[((n%12)+12)%12], G=MUEG.g[k], a=Math.floor(u)-n*12-2, b=Math.floor(145-z)-2-(k==='water'?6:k==='bread'?7:0);
    if(b>=0&&b<G.length&&a>=0&&a<G[b].length&&G[b][a]==='#')return [c.egBlue,c.egRed,c.egGreen,c.ink][ci]; return null; }
  if(z<36)return z>=33?c.egRed:z>=8?c.ink:null;
  return null; }
function museumWall(q,nx,ny,X,Y,z,f){ const M=MUS, c=MUC, at=nx?X:Y, u=(X*ny-Y*nx)*24, k=musRoom(X+nx*.2,Y+ny*.2);
  for(const P of MUP.all)if(P.nx===nx&&P.ny===ny&&Math.abs(at-P.at)<.05){ const cc=Math.floor(u-P.u0), zz=Math.floor(z-P.z0); if(cc>=0&&cc<P.W&&zz>=0&&zz<P.H){ const o=P.a[zz*P.W+cc]; if(o)return o.e?o:sh(o,f); } }
  if(ny>0&&Math.abs(Y-M.b.y0-T)<.05){ const d=muDoor(X-M.mid,z); if(d)return sh(d,f); }
  if(z<6)return sh(c.skirt,f);
  const along=nx?Y:X, sur=(a0,a1)=>z<M.archZ+8&&along>a0-.3&&along<a1+.3&&(z>=M.archZ||along<a0+.02||along>a1-.02);
  if(nx&&(Math.abs(X-M.hx0)<.2||Math.abs(X-M.hx1)<.2)&&Y<M.by&&sur(...M.side)||ny&&Math.abs(Y-M.by)<.2&&[M.earth,M.humans,M.closed].some(a=>sur(...a)))
    return sh(z>=M.archZ+6||Math.abs(along-Math.round(along*4)/4)<.01?c.stoneD:c.stoneL,f);
  if(z>=M.H-10)return sh(z>=M.H-4?c.stoneL:Math.floor(u/4)%2?c.stoneD:c.stone,f);
  if(k==='hall'){ const r=Math.floor(z/13), uu=u+(r&1)*18; if(z%13<1||((uu%36)+36)%36<1)return sh(c.joint,f); if(Math.abs(z-40)<1.5)return sh(c.stoneD,f);
    return sh(hash(Math.floor(uu/36),r,1761)<.3?c.stoneD:hash(Math.floor(u),z,1763)<.03?c.stoneL:c.stone,f); }
  if(k==='humansR'){ const n=cvNoise(u/14,z/10,1781)+cvNoise(u/5,z/4,1783)*.35; return sh(Math.abs(n-.78)<.012||n<.55?c.rockD:n<1.02?c.rock:c.rockL,f); }
  if(k==='west'){ const e=muEgypt(u,z); if(e)return sh(e,f); }
  const w=c[k==='earthR'?'earth':k==='humansR'?'humans':k==='closedR'?'closed':k]||c.closed;
  if(Math.abs(z-122)<1)return sh(c.gilt,f);
  if(z<36)return sh(z>33?c.stoneD:sh(w,.72),f);
  return sh(hash(Math.floor(u/3),Math.floor(z/3),1765)<.04?sh(w,.96):w,f); }
const MUBAN=(()=>{ let o=null; const build=()=>{ const c=MUC, B=MUS.f, W=56, H=104, ban=[[B.x0+1.35,'EGYPT',[34,46,98]],[B.x0+4.2,'AFRICA',c.east],[B.x1-1.35,'ICE AGE',[70,62,58]]].filter((_,i)=>i!==1);
  return ban.map(([x,nm,col],i)=>{ const a=new Array(W*H).fill(null), put=(q,z,cc)=>{ q=Math.floor(q); z=Math.floor(z); if(q>=0&&q<W&&z>=0&&z<H)a[z*W+q]=cc; };
    for(let z=0;z<H-6;z++)for(let q=2;q<W-2;q++)if(z>4||Math.abs(q-W/2)>(4-z)*4)put(q,z,z>=H-10?sh(col,.8):col);
    for(let q=0;q<W;q++){ put(q,H-6,c.giltD); put(q,H-5,c.gilt); }
    muText(put,nm,Math.floor((W-muTW(nm))/2),H-22,1,c.title);
    const g=c.gilt, d=c.giltD, cx=W/2, cz=46;
    if(i===1){ for(let z=0;z<40;z++)for(let q=0;q<W;q++){ const dx=(q+.5-cx)/9, dz=(z+.5-cz+2)/20; if(dx*dx+dz*dz*(dz>0?1:.5)<1)put(q,z+cz-20,(q+z)%5?[172,150,118]:[130,110,84]); } }
    if(i===2){ for(let a=0;a<60;a++){ const t=a/60*Math.PI*1.1, x=cx-14+Math.cos(Math.PI-t)*-14+t*4, z=30+Math.sin(t)*26; for(let k=0;k<4-a/20;k++)put(x+k*.5,z+k,[226,212,170]); } }
    if(i===0){ for(let z=22;z<72;z++)for(let q=0;q<W;q++){ const dx=(q+.5-cx)/14, dz=(z-47)/25; if(Math.abs(dx)>1)continue; const sideH=dz<.2&&Math.abs(dx)>.55&&Math.abs(dx)<1;
        if(sideH)put(q,z,Math.floor(z/3)%2?g:[38,64,140]); else if(Math.abs(dx)<.55&&dz>-.6&&dz<.5)put(q,z,dz<-.3&&Math.abs(dx)<.15?[38,64,140]:g); else if(dz>=.5&&Math.abs(dx)<.8)put(q,z,Math.floor(z/3)%2?g:[38,64,140]); } }
    if(i===3){ for(let z=0;z<40;z++)for(let q=0;q<W;q++){ const dx=q+.5-cx, dz=z+.5-20, r=Math.hypot(dx,dz); if(r>15)continue; const t=(Math.log(Math.max(r,.5)/15)/-.55+Math.atan2(dz,dx)/(2*Math.PI)+8)%1; put(q,z+cz-20,t<.18?d:g); } }
    return {x,W,H,z0:62,a}; }); };
  return {get all(){ return o||(o=build()); }}; })();
function muDoor(u,z){ const c=MUC, a=Math.abs(u); if(z>=82||a>1.5)return null; if(z>=76||a>1.25)return z>=80||a>1.45?c.stoneD:c.stoneL;
  if(a<.03)return [40,30,20]; const p=a%1.2, q=z%36; if(p<.08||p>1.12||q<3||z>=74)return [96,72,40]; if(Math.abs(p-.2)<.04&&Math.abs(z-38)<3)return [200,166,90]; return q<5||q>31?[118,90,50]:[136,104,58]; }
function museumOutside(b,nx,ny,X,Y,z,f,cap){ const c=MUC, u=(X*ny-Y*nx)*24, sx=b.id==='lmuscopy'?b.x0-MUS.f.x0:0;
  if((b.id==='lmusfront'||b.id==='lmuscopy')&&ny<0&&Math.abs(Y-b.y0)<.2){ const d=muDoor(X-(b.x0+b.x1)/2,z); if(d)return sh(d,f); }
  if(ny<0&&Math.abs(Y-b.y0)<.2)for(const n of MUBAN.all){ const cc=Math.floor((n.x+sx-X)*24+n.W/2), zz=Math.floor(z-n.z0); if(cc>=0&&cc<n.W&&zz>=0&&zz<n.H){ const o=n.a[zz*n.W+cc]; if(o)return sh(o,f); } }
  if(z>=cap-4)return null;
  if(z<10)return sh(z<1?sh(c.granite,.8):speck(c.granite,u/24,z/24,1771),f);
  if(z>=cap-18)return sh(z>=cap-8?c.stoneL:z<cap-14?c.stoneD:Math.floor(u/5)%2?c.stoneD:c.stone,f);
  if(z<70){ const r=Math.floor((z-10)/15), uu=u+(r&1)*24, j=(z-10)%15; if(j<2||((uu%48)+48)%48<2)return sh(j<1?c.joint:sh(c.joint,.8),f); return sh(hash(Math.floor(uu/48),r,1773)<.3?c.stoneD:c.stone,f); }
  if(z<76)return sh(z<72?c.stoneD:c.stoneL,f);
  const r=Math.floor(z/13), uu=u+(r&1)*18; if(z%13<1||((uu%36)+36)%36<1)return sh(c.joint,f);
  return sh(hash(Math.floor(uu/36),r,1775)<.25?c.stoneD:c.stone,f); }
