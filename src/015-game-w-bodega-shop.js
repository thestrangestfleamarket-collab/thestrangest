// THE BODEGA PAINT: bodegaFloorCol and bodegaWall paint the bodega's concrete floor and its walls.
import {SHARED} from './003-shx.js';
import {DRONE} from './003b-systems.js';
import {CATALOG, crack, grain, hash, KIND_OF, LAMPS, LBLD, LIFE, mt, prop, sh, sided, spot} from './014-gamekit.js';
const BLOT=LBLD.find(b=>b.id==='lbodega'), BODOFF=BLOT.y0+3.75, bodegaFloorCol=(x,y)=>bodegaFloorAt(x,y,BLOT);
function bodegaFloorAt(x,y,B){ const off=B===BLOT?y<BODOFF:y>B.y1-3.75, n=grain(x,y,41,1.2), st=grain(x,y,47,2.6), c=off?[106,106,104]:[112,116,124];
  if(!off&&(((x-B.x0)%3+3)%3<.04||((y-B.y1)%3+3)%3<.04))return mt('concrete',[84,88,96]);
  if(crack(x,y,413,1.3,.006,.55))return mt('concrete',sh(c,.74));
  let k=n<.36?.92:n>.66?1.05:1; if(st>.68)k*=.8; else if(st>.62)k*=.9; if(spot(x,y,45,.7,.035,.3))k*=1.12;
  return mt('concrete',sh(c,k)); }
function bodegaWall(q,nx,ny,X,Y,z,f){ const u=nx?Y:X, i=Math.floor(u*1.5), j=Math.floor(z/16), bx=(u*1.5-i)*16, bz=z-j*16, joint=bz<1||((i+(j&1)*.5)*16%16<1&&bx<1);
  if(z<4)return sh([40,42,46],f); if(z>=40&&z<43)return sh([70,76,86],f);
  const c=z<40?[78,88,98]:[148,156,160]; return sh(joint?sh(c,.82):c,f*(1+hash(i,j,43)*.04)); }
{ const FP=24, lit=c=>Object.assign([...c],{e:1});
  const QG={steel:[138,142,150],steelDark:[92,96,104],steelTop:[164,168,176],edge:[182,186,194],board:[118,124,132],lam:[96,108,122],lamDark:[70,80,92],till:[150,150,140],tillDark:[96,98,100],tillLit:[80,230,160],brass:[220,180,90],
    mat:[44,46,52],matEdge:[72,76,84],tag:[236,214,120],white:[226,228,230],black:[28,28,32]};
  const ft=(x0,y0,x1,y1)=>({x0,y0,x1,y1,z0:0,z1:.01,foot:1,top:()=>null,fi:()=>null,fj:()=>null});
  function counter(x,y,L=1.73){ SHARED.PNAME=L>2?'long counter':'counter'; const D=.67, t=.05, IN=QG.lamDark;
    const pan=(dim)=>(u,z)=>{ const c=z<4?QG.steelDark:QG.lam; return dim?sh(c,.8):c; };
    const face=(nx,ny,X,Y,z,k)=>ny>0||nx?sh(z<4?QG.steelDark:QG.lam,k):sh(IN,k);
    const B=[sided({x0:x+t,y0:y+D-t,x1:x+L-t,y1:y+D,z0:0,z1:28,c:QG.lam,top:()=>QG.lam,fs:face}),
      {x0:x,y0:y,x1:x+t,y1:y+D,z0:0,z1:28,c:QG.lam,top:()=>QG.lam,fi:pan(1),fj:pan(0)},{x0:x+L-t,y0:y,x1:x+L,y1:y+D,z0:0,z1:28,c:QG.lam,top:()=>QG.lam,fi:pan(1),fj:pan(0)},
      {x0:x+t,y0:y,x1:x+L-t,y1:y+.04,z0:24,z1:28,c:QG.steel,fi:()=>QG.steelDark,top:()=>QG.steel},
      {x0:x+t,y0:y+.04,x1:x+L-t,y1:y+D-t,z0:8,z1:10,c:QG.steel,top:()=>QG.board,fi:()=>QG.steelDark,fj:()=>QG.steelDark},
      {x0:x+t,y0:y+.04,x1:x+L-t,y1:y+D-t,z0:0,z1:1,c:QG.steelDark,nb:1,top:()=>QG.steelDark}];
    if(L>2)B.push({x0:x+L/2-.03,y0:y+.04,x1:x+L/2+.03,y1:y+D-t,z0:0,z1:28,c:QG.steel,top:()=>QG.steel,fi:()=>QG.steelDark});
    const bag=[164,134,96], ctn=[150,122,86];
    B.push({x0:x+.15,y0:y+.12,x1:x+.55,y1:y+.42,z0:10,z1:15,c:bag,fj:(u,z)=>(Math.floor(z)&1)?sh(bag,.9):bag,fi:(v,z)=>sh((Math.floor(z)&1)?sh(bag,.9):bag,.8),top:()=>sh(bag,1.05)},
      {x0:x+.7,y0:y+.1,x1:x+1.05,y1:y+.5,z0:10,z1:21,c:ctn,top:(u,v)=>Math.abs(u-x-.875)<.02?sh(ctn,.75):sh(ctn,1.06),fj:(u,z)=>z>17&&z<19?[200,190,150]:ctn},
      {x0:x+L-.55,y0:y+.15,x1:x+L-.3,y1:y+.4,z0:10,z1:16,c:[226,228,230],top:(u,v)=>Math.max(Math.abs(u-x-L+.425),Math.abs(v-y-.275))<.04?[90,92,96]:[236,238,240]});
    B.push({x0:x-.05,y0:y-.05,x1:x+L+.05,y1:y+D+.05,z0:28,z1:30,c:QG.edge,top:()=>QG.lamDark,fi:()=>sh(QG.edge,.7),foot:1},
      {x0:x+L-.69,y0:y+.1,x1:x+L-.24,y1:y+D-.16,z0:30,z1:38,c:QG.till,fj:(u,z)=>z>=32&&z<36?QG.tillDark:QG.till,foot:1},
      {x0:x+L-.69,y0:y+.1,x1:x+L-.24,y1:y+.35,z0:38,z1:44,c:QG.tillDark,fj:(u,z)=>z>=40&&z<43&&u>x+L-.63&&u<x+L-.3?lit(QG.tillLit):QG.tillDark,foot:1},
      {x0:x+L-.15,y0:y+D-.3,x1:x+L-.09,y1:y+D-.24,z0:30,z1:33,c:QG.brass,foot:1});
    return prop(B); }
  const SHELF_Z=[14,32,50,68], SH=88;
  const strip=(u,z,zt)=>zt-z<2?(hash(Math.floor(u*2.5),zt,77)<.28?QG.tag:[196,200,206]):QG.steel;
  function shelfOf(x,y,L,D,two){ const B=[{x0:x,y0:y,x1:x+L,y1:y+D,z0:0,z1:SHELF_Z[0],c:QG.steelDark,top:()=>QG.board},{x0:x,y0:y,x1:x+L,y1:y+D,z0:SH-3,z1:SH,c:QG.steel,top:()=>QG.steelTop}];
    const m=two?y+D/2-.02:y; B.push({x0:x+.04,y0:m,x1:x+L-.04,y1:m+.04,z0:SHELF_Z[0],z1:SH-3,c:QG.board,top:()=>QG.board});
    for(const z of SHELF_Z.slice(1))B.push({x0:x+.04,y0:two?y:y+.04,x1:x+L-.04,y1:y+D,z0:z-2,z1:z,c:QG.steel,top:()=>QG.board,fj:(u,zz)=>strip(u,zz,z),fi:()=>QG.steelDark});
    for(const a of [x,x+L-.04])B.push({x0:a,y0:y,x1:a+.04,y1:y+D,z0:SHELF_Z[0],z1:SH-3,c:QG.steelDark,top:()=>QG.steelTop});
    return prop(B); }
  const goodsShelf=(x,y)=>{ SHARED.PNAME='shelf of goods'; return shelfOf(x,y,2,.62,true); }, shopShelf=(x,y)=>{ SHARED.PNAME='shop shelf'; return shelfOf(x,y,2,.5,false); };
  const doorMat=(x,y)=>{ SHARED.PNAME='door mat'; const L=1, D=.67; return prop([{x0:x,y0:y,x1:x+L,y1:y+D,z0:0,z1:1,c:QG.mat,top:(u,v)=>Math.min(u-x,x+L-u,v-y,y+D-v)<.08?QG.matEdge:QG.mat}],null,{walk:true,flat:true}); };
  const FRIDGE_Z=[7,23,36,49];
  function drinksFridge(x,y){ SHARED.PNAME='drinks fridge'; const D=.78, W=.92, Z=64, F=[226,228,226], I=lit([196,224,240]), t=.05, fr=(u,z)=>F;
    const p=prop([{x0:x+t,y0:y+t,x1:x+D,y1:y+W-t,z0:0,z1:FRIDGE_Z[0],c:F,top:()=>[200,206,210],fi:(v,z)=>z<5&&(Math.floor(z/2)&1)?[60,62,64]:F},
      sided({x0:x,y0:y+t,x1:x+t,y1:y+W-t,z0:0,z1:Z,c:F,fs:(nx,ny)=>nx>0?I:nx<0?[204,208,210]:F,top:()=>F}),{x0:x,y0:y,x1:x+D,y1:y+t,z0:0,z1:Z,c:F,fj:fr,top:()=>F},{x0:x,y0:y+W-t,x1:x+D,y1:y+W,z0:0,z1:Z,c:F,fj:fr,top:()=>F},
      {x0:x+t,y0:y+t,x1:x+D,y1:y+W-t,z0:Z-6,z1:Z,c:F,top:()=>sh(F,1.04),fi:()=>F},
      ...FRIDGE_Z.slice(1).map(z=>({x0:x+t,y0:y+t,x1:x+D-.03,y1:y+W-t,z0:z-1,z1:z,c:[200,230,236],top:()=>lit([214,236,244]),fi:()=>[170,200,210]}))],null,
      {glass:{x:x+D,y0:y,y1:y+W,z0:FRIDGE_Z[0],z1:Z-6}});
    LAMPS.push({own:1,room:1,x:x+D+.5,y:y+W/2,z:30,r:3.2,c:[.45,.7,1],prop:p}); return p; }
  const newsRack=(x,y)=>{ '@later'; SHARED.PNAME='newspaper rack'; const c=[120,122,126], W=.5, D=.4, P=[[214,210,196],[222,220,212],[206,200,182]], B=[];
    for(const [a,b] of [[x,y],[x+W-.03,y],[x,y+D-.03],[x+W-.03,y+D-.03]])B.push({x0:a,y0:b,x1:a+.03,y1:b+.03,z0:0,z1:26,c,nb:1,top:()=>sh(c,1.1)});
    B.push({x0:x+.03,y0:y+D-.03,x1:x+W-.03,y1:y+D,z0:24,z1:26,c,nb:1,top:()=>sh(c,1.1)},{x0:x+.03,y0:y,x1:x+W-.03,y1:y+.03,z0:2,z1:3,c,nb:1},{x0:x+.03,y0:y+D-.03,x1:x+W-.03,y1:y+D,z0:2,z1:3,c,nb:1});
    for(let i=0;i<3;i++){ const y0=y+i*.12, y1=Math.min(y+D,y0+.18), z=6+i*6;
      B.push({x0:x+.03,y0,x1:x+W-.03,y1,z0:z-1,z1:z,c,nb:1,top:(u,v)=>(Math.floor((u-x)*FP)&1)?sh(c,.75):c},{x0:x+.03,y0,x1:x+W-.03,y1:y0+.02,z0:z,z1:z+3,c,nb:1,top:()=>c});
      for(let k=0;k<2;k++){ const p=P[(i+k)%3], a=x+.05+k*.21, h=2+((i+k)&1);
        B.push({x0:a,y0:y0+.025,x1:a+.19,y1:y1-.02,z0:z,z1:z+h,c:p,fj:(u,zz)=>(Math.floor(zz)&1)?sh(p,.86):p,fi:(v,zz)=>sh((Math.floor(zz)&1)?sh(p,.86):p,.85),
          top:(u,v)=>v<y0+.08?(u>a+.03&&u<a+.16?[40,40,46]:p):(Math.floor((v-y0)*FP)&1)&&u>a+.02&&u<a+.17?sh(p,.78):p}); } }
    return prop(B); };
  const cigRack=(x,y)=>{ SHARED.PNAME='cigarette rack'; const L=3.2, D=.22, PK=[[196,60,52],[40,130,150],[226,226,220],[60,140,80],[226,170,60],[120,60,150],[40,40,44]];
    const B=[ft(x,y,x+L,y+D),{x0:x,y0:y,x1:x+L,y1:y+.03,z0:36,z1:92,c:QG.steelDark,foot:0,top:()=>QG.steel},{x0:x+.04,y0:y+.03,x1:x+L-.04,y1:y+D,z0:36,z1:38,c:QG.steel,foot:0,top:()=>QG.steelTop}];
    for(const a of [x,x+L*.25,x+L*.5,x+L*.75,x+L-.04])B.push({x0:Math.min(a,x+L-.04),y0:y+.03,x1:Math.min(a,x+L-.04)+.04,y1:y+D-.02,z0:36,z1:92,c:QG.steel,foot:0,top:()=>QG.steelTop,fi:()=>QG.steelDark});
    for(let r=0;r<4;r++){ const z=40+r*13;
      if(r)B.push({x0:x+.04,y0:y+.03,x1:x+L-.04,y1:y+D-.02,z0:z-1,z1:z,c:QG.steel,foot:0,nb:1,top:()=>QG.steelTop});
      B.push({x0:x+.04,y0:y+D-.02,x1:x+L-.04,y1:y+D,z0:z-1,z1:z+2,c:QG.steelTop,foot:0,nb:1,fj:()=>QG.edge});
      for(let k=0;k<12;k++){ if(hash(k,r,52)<.12)continue; const a=x+.07+k*.26+(k>=3?.02:0)+(k>=6?.02:0)+(k>=9?.02:0), p=PK[Math.floor(hash(k,r,51)*PK.length)];
        B.push({x0:a,y0:y+.06,x1:a+.17,y1:y+.16,z0:z,z1:z+10,c:p,foot:0,fj:(u,zz)=>zz>z+7?sh(p,1.15):zz<z+2?[226,226,220]:p,top:()=>sh(p,1.1)}); } }
    B.push({x0:x,y0:y,x1:x+L,y1:y+D+.02,z0:92,z1:102,c:[236,214,120],foot:0,fj:(u,z)=>z>94&&z<100&&Math.floor((u-x)*FP/4)%3===1?[40,80,200]:[236,214,120],top:()=>QG.steel});
    return prop(B); };
  const candyJar=(x,y)=>{ SHARED.PNAME='candy jar'; const G=[200,220,230], C=[[220,60,60],[240,200,60],[60,160,80],[240,120,160]], w=.26, e=.025;
    const edge=(a0)=>(u,z)=>u-a0<e||a0+w-u<e||z<31?sh(G,.95):null;
    const B=[ft(x,y,x+w,y+w),{x0:x,y0:y,x1:x+w,y1:y+w,z0:30,z1:31,c:G,foot:0,nb:1,top:()=>null},{x0:x,y0:y,x1:x+w,y1:y+w,z0:31,z1:40,c:G,foot:0,nb:1,fj:edge(x),fi:edge(y),top:()=>null},
      {x0:x+.02,y0:y+.02,x1:x+w-.02,y1:y+w-.02,z0:40,z1:42,c:[70,72,76],foot:0,top:()=>[70,72,76]},{x0:x+.1,y0:y+.1,x1:x+.16,y1:y+.16,z0:42,z1:43,c:[90,92,96],foot:0,nb:1}];
    for(let i=0;i<10;i++){ const a=x+.04+hash(i,1,53)*.13, b=y+.04+hash(i,2,53)*.13, z=31+Math.floor(i/4)*2, c=C[i%4];
      B.push({x0:a,y0:b,x1:a+.05,y1:b+.05,z0:z,z1:z+2,c,foot:0,nb:1,top:()=>sh(c,1.1)}); }
    return prop(B); };
  const paperBags=(x,y)=>{ SHARED.PNAME='paper bags'; const c=[164,134,96]; return prop([{x0:x,y0:y,x1:x+.42,y1:y+.3,z0:0,z1:14,c,fj:(u,z)=>(Math.floor(z/2)&1)?sh(c,.9):c,fi:()=>sh(c,.7),top:()=>sh(c,.95)}]); };
  const wallPhone=(x,y)=>{ SHARED.PNAME='wall phone'; const c=[32,32,36]; return prop([ft(x,y,x+.08,y+.26),{x0:x,y0:y,x1:x+.08,y1:y+.26,z0:50,z1:64,c,foot:0,fi:(v,z)=>v>y+.14&&z>52&&z<62?[50,50,56]:c,top:()=>c},{x0:x,y0:y+.1,x1:x+.02,y1:y+.12,z0:40,z1:50,c:[50,50,56],foot:0,nb:1}]); };
  const radio=(x,y)=>{ '@later'; SHARED.PNAME='radio'; const c=[70,74,82]; return prop([ft(x,y,x+.5,y+.24),{x0:x,y0:y,x1:x+.5,y1:y+.24,z0:102,z1:112,c,foot:0,fj:(u,z)=>u<x+.3&&z>104&&z<110?(Math.floor((u-x)*FP)&1?[40,42,46]:[90,94,100]):u>x+.36&&z>105&&z<109?lit([240,120,60]):c,fi:()=>sh(c,.7),top:()=>sh(c,.9)},{x0:x+.46,y0:y+.1,x1:x+.48,y1:y+.12,z0:112,z1:124,c:[180,182,186],foot:0,nb:1}]); };
  const convexMirror=(x,y)=>{ SHARED.PNAME='convex mirror'; const c=[150,156,166]; return prop([ft(x,y,x+.44,y+.08),{x0:x,y0:y,x1:x+.44,y1:y+.08,z0:98,z1:112,c,foot:0,fj:(u,z)=>{ const dx=(u-x-.22)*FP/7, dz=(z-105)/7, r=dx*dx+dz*dz; return r>1?null:r>.8?[60,62,66]:r<.15?[214,220,230]:[150,160,172]; },fi:()=>null,top:()=>null}]); };
  const cord=(x,y0,y1,drops)=>{ SHARED.PNAME='extension cord'; const c=[36,36,40], bs=[ft(x,y0,x+.025,y1),{x0:x,y0:y0,x1:x+.025,y1:y1,z0:118,z1:119.5,c,foot:0,nb:1}];
    for(const v of drops)bs.push({x0:x,y0:v-.012,x1:x+.025,y1:v+.012,z0:66,z1:118,c,foot:0,nb:1},{x0:x,y0:v-.06,x1:x+.04,y1:v+.06,z0:116,z1:120,c:[200,200,196],foot:0,nb:1});
    return prop(bs); };
  const boxFan=(x,y)=>{ SHARED.PNAME='box fan'; const c=[150,154,160]; return prop([ft(x,y,x+.5,y+.16),{x0:x,y0:y,x1:x+.5,y1:y+.16,z0:88,z1:104,c,foot:0,fj:(u,z)=>{ const dx=(u-x-.25)*FP, dz=z-96; return dx*dx+dz*dz<36?((Math.floor(dz)&1)?[60,62,66]:[110,114,120]):c; },fi:()=>sh(c,.7),top:()=>sh(c,.9)}]); };
  const flyStrip=(x,y)=>{ SHARED.PNAME='fly strip'; return Object.assign(prop([ft(x,y,x+.03,y+.03),{x0:x,y0:y,x1:x+.03,y1:y+.03,z0:100,z1:126,c:[214,196,110],foot:0,nb:1,fj:(u,z)=>z>124?[60,60,64]:hash(Math.floor(z),1,55)<.2?[50,46,40]:[214,196,110]}]),{breeze:1}); };
  const wallClock=(x,y)=>{ SHARED.PNAME='wall clock'; return prop([ft(x,y,x+.4,y+.06),{x0:x,y0:y,x1:x+.4,y1:y+.06,z0:100,z1:110,c:[230,232,234],foot:0,fj:(u,z)=>{ const dx=(u-x-.2)*FP/5, dz=(z-105)/5, r=dx*dx+dz*dz; return r>1?null:r>.78?[30,30,34]:(Math.abs(dx)<.12&&dz>0&&dz<.7)||(Math.abs(dz)<.12&&dx>0&&dx<.5)?[30,30,34]:[236,238,240]; },fi:()=>null,top:()=>null}]); };
  const calendar=(x,y)=>{ SHARED.PNAME='calendar'; return prop([ft(x,y,x+.03,y+.3),{x0:x,y0:y,x1:x+.03,y1:y+.3,z0:70,z1:86,c:[240,240,236],foot:0,nb:1,fi:(v,z)=>z>80?[190,40,40]:(Math.floor(z/2)&1)&&(Math.floor(v*FP)&1)?[70,70,74]:[240,240,236]}]); };
  const tube=(x,y)=>{ SHARED.PNAME='fluorescent tube'; const c=lit([236,240,244]), ch=(u,z)=>(Math.floor(z/2)&1)?[96,98,104]:[70,72,78], p=prop([ft(x,y-.12,x+2,y+.12),{x0:x,y0:y-.12,x1:x+2,y1:y+.12,z0:106,z1:111,c:[120,124,130],foot:0,fi:()=>c,fj:()=>c,top:()=>[120,124,130]},
    ...[x+.2,x+1.8].map(u=>({x0:u-.02,y0:y-.02,x1:u+.02,y1:y+.02,z0:111,z1:126,c:[80,82,88],foot:0,nb:1,fi:(v,z)=>ch(v,z),fj:(v,z)=>ch(v,z)}))]); p.breeze=1; LAMPS.push({own:1,room:1,day:true,x:x+1,y,z:104,r:7,c:[1.125,1.16,1.275],prop:p}); return p; };
  const doorBell=(x,y)=>{ SHARED.PNAME='door bell'; return prop([ft(x-.06,y,x+.06,y+.12),{x0:x-.02,y0:y,x1:x+.02,y1:y+.12,z0:76,z1:78,c:[60,60,64],foot:0,nb:1},{x0:x-.06,y0:y,x1:x+.06,y1:y+.1,z0:70,z1:76,c:[220,180,90],foot:0,fj:(u,z)=>z<72?[160,120,50]:[220,180,90]}]); };
  const droneDock=(x,y)=>{ SHARED.PNAME='drone box'; const s=.3, z0=100, z1=114, K=[22,22,26];
    const B=[ft(x-s,y-s,x+s,y+s),{x0:x-s,y0:y-s,x1:x+s,y1:y+s,z0,z1,c:K,foot:0,fi:(v,z)=>z<z0+3?[34,34,40]:K,fj:(u,z)=>z<z0+3?[34,34,40]:K,top:()=>[30,30,36]},
      sided({x0:x-s-.01,y0:y-s-.01,x1:x+s+.01,y1:y+s+.01,z0:z0+5,z1:z0+7,c:[60,60,64],foot:0,nb:1,life:1,top:()=>null,fs:()=>typeof LIFE==='undefined'||LIFE.mode!==1?null:lit(DRONE.on?[255,70,60]:[90,230,120])})];
    const p=prop(B); p.life=()=>{}; p.lifeKey=()=>DRONE.on?1:0; return p; };
  const droneFlap=(x,y)=>{ SHARED.PNAME='drone flap'; const W=.6, z0=30, z1=46; return prop([ft(x,y,x+W,y+.05),{x0:x,y0:y,x1:x+W,y1:y+.05,z0,z1,c:[40,40,44],fj:(u,z)=>u-x<.06||x+W-u<.06||z<z0+2||z>z1-2?[150,150,154]:[30,30,34],fi:()=>[120,120,124],top:()=>[150,150,154]}]); };
  const rubberMat=(x,y,L=1.6,D=.6)=>{ SHARED.PNAME='rubber mat'; const c=[34,36,40]; return prop([{x0:x,y0:y,x1:x+L,y1:y+D,z0:0,z1:1,c,foot:1,
    top:(u,v)=>{ const e=Math.min(u-x,x+L-u,v-y,y+D-v); if(e<.04)return [58,60,66]; const a=Math.floor((u-x)*24), b=Math.floor((v-y)*24); if(a%4===1&&b%4===1)return [14,14,16]; return grain(u,v,431,.4)>.62?[48,50,54]:c; },fi:()=>[24,24,28],fj:()=>[28,28,32]}],null,{walk:true}); };
  Object.assign(CATALOG,{'rubber mat':(x,y)=>rubberMat(x-.8,y-.3),'counter mat':(x,y)=>rubberMat(x-.3,y-1.2,.6,2.4),'counter':(x,y)=>counter(x-.86,y-.33),'long counter':(x,y)=>counter(x-1.5,y-.33,3),'shelf of goods':(x,y)=>goodsShelf(x-1,y-.31),'shop shelf':(x,y)=>shopShelf(x-1,y-.25),'door mat':(x,y)=>doorMat(x-.5,y-.33),'drinks fridge':(x,y)=>drinksFridge(x-.39,y-.46),
    'newspaper rack':(x,y)=>newsRack(x-.25,y-.2),'drone box':(x,y)=>droneDock(x,y),'drone flap':(x,y)=>droneFlap(x-.3,y-.025),
    'cigarette rack':(x,y)=>cigRack(x-1.6,y-.11),'candy jar':(x,y)=>candyJar(x-.13,y-.13),'paper bags':(x,y)=>paperBags(x-.21,y-.15),'wall phone':(x,y)=>wallPhone(x-.04,y-.13),
    'radio':(x,y)=>radio(x-.25,y-.12),'convex mirror':(x,y)=>convexMirror(x-.22,y-.04),'extension cord':(x,y)=>cord(x,y,y+3.3,[y+1,y+1.95,y+2.9]),'box fan':(x,y)=>boxFan(x-.25,y-.08),'fly strip':(x,y)=>flyStrip(x,y),
    'fluorescent tube':(x,y)=>tube(x-1,y),'wall clock':(x,y)=>wallClock(x-.2,y-.03),'calendar':(x,y)=>calendar(x,y-.15),'door bell':(x,y)=>doorBell(x,y)});
  for(const k of ['counter','long counter','shelf of goods','shop shelf','door mat','drinks fridge','newspaper rack','drone box','drone flap','cigarette rack','candy jar','paper bags','wall phone','radio','convex mirror','extension cord','box fan','fly strip','wall clock','calendar','door bell','fluorescent tube','rubber mat','counter mat'])KIND_OF[k]=k; }
export {bodegaFloorCol, bodegaWall};
