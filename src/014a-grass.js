// THE GRASS KINDS: GRASS, the lawns' nine grasses (the owner's picks from the grass gallery, 29 Oct 2026): where each grows, how it looks painted and standing near you, and what lives in it.
import {SAVE} from './005-save.js';
import {TILE} from './006-map-pre.js';
import {cvNoise, grain, hash, sh, TUFTC, tuftCol} from './014-gamekit.js';
const GRASS={}; window.GRASS=GRASS;
{ // a faceted-tuft painter (like tuftCol, its own palette and size), its tufts kept while the painter is near them
  const tufts=(cell,pal,m0,m1)=>{ const W=pal.reduce((a,c)=>a+c[3],0), pick=r=>{ r*=W; for(const c of pal)if((r-=c[3])<0)return c; return pal[0]; }, TQ=new Int32Array(128*128*2).fill(-1e9), TP=new Float32Array(128*128*6);
    return (x,y)=>{ const u=x/cell, v=y/cell, i0=Math.floor(u), j0=Math.floor(v); let d1=9, d2=9, bq=0, bi=0, bj=0;
      for(let j=j0-1;j<=j0+1;j++)for(let i=i0-1;i<=i0+1;i++){ const q=((j&127)<<7|(i&127)), t=q*6; if(TQ[q*2]!==i||TQ[q*2+1]!==j){ TQ[q*2]=i; TQ[q*2+1]=j; const px=i+.1+.8*hash(i,j,601), py=j+.1+.8*hash(i,j,603), c=pick(hash(i,j,609)*.35+cvNoise(px/4.4,py/4.4,611)*.65), m=m0+m1*cvNoise(px/9,py/9,613);
          TP[t]=px; TP[t+1]=py; TP[t+2]=hash(i,j,605)*6.2832; TP[t+3]=c[0]*m; TP[t+4]=c[1]*m; TP[t+5]=c[2]*m; }
        const d=(u-TP[t])**2+(v-TP[t+1])**2; if(d<d1){ d2=d1; d1=d; bq=t; bi=i; bj=j; } else if(d<d2)d2=d; }
      const r=Math.sqrt(d1), e=Math.sqrt(d2)-r, rot=TP[bq+2], a=Math.atan2(v-TP[bq+1],u-TP[bq])-rot, k=Math.floor((a/6.2832-Math.floor(a/6.2832))*5), out=r>.32, ca=(k+.5+(out?.5:0))/5*6.2832+rot, t=out?.9:.4;
      const nx=Math.cos(ca)*t, ny=Math.sin(ca)*t, s=(.62+.5*Math.max(0,(-.45*nx-.55*ny+.7)/Math.sqrt(nx*nx+ny*ny+1))+.1*(hash(bi*5+k+(out?7:0),bj,607)-.5))*(e<.07?.72:r>.62?.82:1);
      return [Math.min(255,TP[bq+3]*s),Math.min(255,TP[bq+4]*s),Math.min(255,TP[bq+5]*s)]; }; };
  // a blade painter: a blade from each small cell, leaning its own way (or combed one way), darker at its foot, the floor dark between; each blade laid once on the picture (N pixels square, 24 to a tile, from tile 200)
  const blades=o=>N=>{ const A=new Uint8Array(N*N*4), Z=new Float32Array(N*N).fill(-1), O=200*24, C=N/4, R=Math.ceil(o.len/4)+1;
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const c=sh(o.lo,.62+.12*cvNoise(((i+.5)/24+200)*3,((j+.5)/24+200)*3,717)), q=(j*N+i)*4; A[q]=c[0]; A[q+1]=c[1]; A[q+2]=c[2]; A[q+3]=255; }
    for(let cj=-R;cj<C+R;cj++)for(let ci=-R;ci<C+R;ci++){ const i=ci+O/4, j=cj+O/4; if(hash(i,j,701)>o.dens)continue; const rx=ci*4+hash(i,j,703)*4, ry=cj*4+hash(i,j,705)*4, an=o.dir+(hash(i,j,707)-.5)*o.jit, L=o.len*(.6+.4*hash(i,j,709)), dx=Math.cos(an), dy=Math.sin(an);
      const dry=cvNoise((rx+O)/24/9,(ry+O)/24/9,713)>.62?o.dry:0, w=.75+.5*hash(i,j,715), zj=hash(i,j,711)*.3;
      for(let t=0;t<=L;t+=.5){ const f=t/L, r=.5+1.1*(1-f), cx=rx+dx*t, cy=ry+dy*t, z=f+zj, col=[0,1,2].map(k=>Math.min(255,((o.lo[k]+(o.hi[k]-o.lo[k])*f)*(1-dry)+o.dryC[k]*dry*(.7+.3*f))*w));
        for(let py=Math.floor(cy-r);py<=Math.ceil(cy+r);py++)for(let px=Math.floor(cx-r);px<=Math.ceil(cx+r);px++){ if(px<0||py<0||px>=N||py>=N||(px+.5-cx)**2+(py+.5-cy)**2>r*r)continue; const n=py*N+px; if(z<=Z[n])continue; Z[n]=z; A[n*4]=col[0]; A[n*4+1]=col[1]; A[n*4+2]=col[2]; } } }
    return A; };
  // the first painted lawn (17 Oct): greens cut from a smooth field, with sprouts, weeds and now and then a weed's flower
  const LAWN=[[46,86,38],[56,102,44],[66,116,50],[78,130,56]], SPR=[[112,162,72],[94,146,62]], WEED=[[38,70,32],[44,80,36]], BLOOM=[[214,196,84],[228,226,212]];
  const mown=(x,y)=>{ const ix=Math.floor(x*24), iy=Math.floor(y*24), n=grain(x,y,301,1.2); let c=LAWN[n<.42?0:n<.5?1:n<.58?2:3];
    const cx=Math.floor(ix/6), cy=Math.floor(iy/6), h=hash(cx,cy,305), ax=cx*6+1+Math.floor(hash(cx,cy,307)*4), ay=cy*6+1+Math.floor(hash(cx,cy,309)*4), dx=ix-ax, dy=iy-ay;
    if(h<.2){ if(dx===0&&dy===0)c=SPR[0]; else if(Math.abs(dx)===1&&dy===-1)c=SPR[1]; }
    else if(h<.3){ if(dx>=0&&dx<2&&dy>=0&&dy<2)c=WEED[(dx+dy)&1]; else if(h<.235&&dx===2&&dy===-1)c=BLOOM[h<.215?0:1]; }
    return c; };
  // the old game's pixel grass: a noise field in four greens, drier patches, light and dark specks, daisies and clover in the lush parts
  const GP=[[62,100,50],[76,116,58],[90,132,66],[104,146,74]], GY=[[96,104,54],[110,116,60],[124,128,68],[136,138,76]], GL=[128,168,88], GS=[50,84,42];
  const pixel=(x,y)=>{ const n=(cvNoise(x/5,y/5,29)*3+cvNoise(x/1.7,y/1.7,31)*2+cvNoise(x*2.3,y*2.3,33))/6+(hash(Math.floor(x*24),Math.floor(y*24),35)-.5)*.07, dz=hash(Math.floor(x*24),Math.floor(y*24),53);
    const dry=cvNoise(x/13,y/13,51)+(dz-.5)*.05>.63, P=dry?GY:GP; let c=P[n<.4?0:n<.49?1:n<.58?2:3];
    const cx=Math.floor(x*5), cy=Math.floor(y*5), h=hash(cx,cy,37); if(h<.15+n*.6){ const tx=(cx+.2+hash(cx,cy,39)*.6)/5, ty=(cy+.2+hash(cx,cy,41)*.6)/5, dx=x-tx, dy=y-ty;
      if(dx>=0&&dx<.055&&dy>=-.03&&dy<.03)c=dry?[150,148,92]:GL; else if(dx>=.03&&dx<.085&&dy>=.03&&dy<.07)c=GS; }
    const fl=cvNoise(x/4,y/4,55); if(fl>.62&&!dry){ const i=Math.floor(x*3), j=Math.floor(y*3), q=hash(i,j,57); if(q<.35){ const fx=(i+.2+hash(i,j,59)*.6)/3, fy=(j+.2+hash(i,j,61)*.6)/3, ax=Math.round((x-fx)*24), ay=Math.round((y-fy)*24);
      if(q<.12){ if(ax===0&&ay===0)return [236,200,64]; if(Math.abs(ax)+Math.abs(ay)===1)return [238,238,230]; } else if(ax===0&&ay===0||ax===1&&ay===0||ax===0&&ay===1)return sh(GP[0],.86); } }
    return c; };
  const pal=(f,p)=>p.map(c=>[c[0]*f[0],c[1]*f[1],c[2]*f[2],c[3]]);
  // the nine: id (its number in the gallery), name, painter, what stands near you (shape, its colours, height), and what lives in it: wild flowers (GARDEN's, with their odds), butterflies (their names; one rare that lives only here), mushrooms (FORAGE's, with their odds)
  const K=GRASS.K=[
    {id:'34',name:'PIXEL MEADOW',sw:'#6a9050',paint:pixel,shape:null,hi:.6,flowers:{marigold:3,tulip:2,clover:2,dandelion:2},bf:['Eastern Tailed-Blue','Clouded Sulphur'],rare:'Island Marble',mush:{button:3,moonglow:1}},
    {id:'33',name:'ROUND TUFTS',sw:'#55803a',paint:tuftCol,shape:'round',cols:TUFTC,hi:1,flowers:{daisy:3,bluebell:3,clover:2},bf:['Cabbage White','Pearl Crescent'],rare:'Miami Blue',mush:{button:4,puffball:2}},
    {id:'32',name:'CROWN TUFTS',sw:'#62904a',paint:tufts(.45,pal([1.1,1.12,1.05],TUFTC),.6,.3),shape:'crown',cols:pal([1.1,1.12,1.05],TUFTC),hi:1.2,flowers:{tulip:3,poppy:3,chicory:1},bf:['Red Admiral','Painted Lady'],rare:'Corsican Swallowtail',mush:{redcap:3,puffball:2}},
    {id:'29',name:'DRY BLADES',sw:'#6b7a22',img:blades({dir:0,jit:6.28,len:7,dens:.95,lo:[63,99,15],hi:[103,136,24],dry:.55,dryC:[150,138,64]}),shape:'blade',cols:[[63,99,15,1],[84,118,20,2],[103,136,24,2],[130,128,58,1]],hi:.9,flowers:{sunflower:3,marigold:3,goldenrod:2},bf:['Monarch','Painted Lady'],rare:'Apollo',mush:{puffball:5,redcap:1}},
    {id:'30',name:'BLADE FLOOR',sw:'#7a9a24',img:blades({dir:-1.57,jit:1.6,len:10,dens:.9,lo:[79,124,19],hi:[121,160,28],dry:.25,dryC:[184,169,78]}),shape:'blade',cols:[[79,124,19,1],[100,142,24,2],[121,160,28,2]],hi:1.3,flowers:{lavender:3,cosmos:3,aster:2,goldenrod:1},bf:['Eastern Tiger Swallowtail','Monarch'],rare:'Kaiser-i-Hind',mush:{redcap:4,button:2}},
    {id:'08',name:'SOFT TUSSOCKS',sw:'#4a7a5a',paint:tufts(.8,[[52,96,70,1],[64,112,80,2],[78,126,88,2],[92,140,98,1]],.62,.3),shape:'tussock',cols:[[52,96,70,1],[64,112,80,2],[78,126,88,2],[92,140,98,1]],hi:1.5,flowers:{iris:3,foxglove:2,violet:2,slipper:.3},bf:['Black Swallowtail','Red Admiral'],rare:'Large Blue',mush:{inkcap:4,morel:1}},
    {id:'04',name:'LEAF CLUMPS',sw:'#3a5e30',paint:tufts(1,[[40,74,36,1],[52,90,42,2],[64,104,48,2],[80,120,56,1]],.55,.3),shape:'clump',cols:[[40,74,36,1],[52,90,42,2],[64,104,48,2],[80,120,56,1]],hi:.8,flowers:{bluebell:3,foxglove:3,violet:2},bf:['Mourning Cloak','Question Mark','Spicebush Swallowtail'],rare:'Bhutan Glory',mush:{chanterelle:3,bolete:2,inkcap:1}},
    {id:'01',name:'MOWN LAWN',sw:'#427a36',paint:mown,shape:null,hi:.5,flowers:{daisy:4,dandelion:3,clover:3},bf:['Cabbage White','Eastern Tailed-Blue'],rare:'Karner Blue',mush:{button:6,inkcap:3}},
    {id:'03',name:'LONG BLADES',sw:'#5a8a40',img:blades({dir:.35,jit:.5,len:13,dens:.85,lo:[56,100,40],hi:[104,150,64],dry:0,dryC:[0,0,0]}),shape:'blade',flat:1,cols:[[56,100,40,1],[80,126,52,2],[104,150,64,2]],hi:.7,flowers:{cosmos:3,poppy:3,chicory:2,aster:1},bf:['Clouded Sulphur','Pearl Crescent'],rare:'Mission Blue',mush:{puffball:4,button:3}}];
  K.forEach((k,i)=>{ k.i=i; }); GRASS.of=Object.fromEntries(K.map(k=>[k.id,k]));
  // where each grows: patches about 30 tiles across on a bent grid, their borders mingled a few tiles deep (tile coords, x east, z south)
  const PS=30;
  const at0=(tx,tz)=>{ const wx=tx+16*(cvNoise(tx/18,tz/18,91)-.5)+5*(cvNoise(tx/6,tz/6,93)-.5), wz=tz+16*(cvNoise(tx/18,tz/18,92)-.5)+5*(cvNoise(tx/6,tz/6,94)-.5), gx=Math.floor(wx/PS), gz=Math.floor(wz/PS);
    let d1=1e18, d2=1e18, k1=0, k2=0; for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){ const a=gx+i, b=gz+j, px=(a+hash(a,b,71))*PS, pz=(b+hash(b,a,72))*PS, d=(wx-px)**2+(wz-pz)**2, k=Math.floor(hash(a,b,73)*K.length);
      if(d<d1){ d2=d1; k2=k1; d1=d; k1=k; } else if(d<d2){ d2=d; k2=k; } }
    return K[Math.sqrt(d2)-Math.sqrt(d1)<3.5*hash(Math.floor(tx*2),Math.floor(tz*2),95)?k2:k1]; };
  // each kind's painted picture: 12 tiles square, 24 to a tile, mirrored when laid
  // where the landscape editor painted a grass (its patches whose ground is gk:<id>, world coords): the latest patch over a spot wins
  const OV=[], inside=(r,x,z)=>r.brush?r.brush.some(([px,pz])=>(x-px)**2+(z-pz)**2<=r.r*r.r):r.poly?(()=>{ let c=false; const P=r.poly; for(let i=0,j=P.length-1;i<P.length;j=i++)if((P[i][1]>z)!==(P[j][1]>z)&&x<(P[j][0]-P[i][0])*(z-P[i][1])/(P[j][1]-P[i][1])+P[i][0])c=!c; return c; })():x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1;
  GRASS.box=r=>{ const R=r.r||0, P=r.brush||r.poly; return P?[Math.min(...P.map(p=>p[0]))-R,Math.min(...P.map(p=>p[1]))-R,Math.max(...P.map(p=>p[0]))+R,Math.max(...P.map(p=>p[1]))+R]:[r.x0,r.z0,r.x1,r.z1]; };
  GRASS.setPainted=regions=>{ OV.length=0; for(const r of regions||[]){ const k=/^gk:/.test(r.t||'')&&GRASS.of[r.t.slice(3)]; if(k)OV.push({r,k,b:GRASS.box(r)}); } };
  try{ const B=__DATA__("data/landscape.json")||[], L=JSON.parse(SAVE.get('land')||'null'); GRASS.setPainted(Array.isArray(L)?L:B); }catch(e){}
  GRASS.only='01';   // one grass everywhere for now (owner, 30 Oct 2026); null brings back the nine
  GRASS.at=(tx,tz)=>{ if(GRASS.only)return GRASS.of[GRASS.only]; if(OV.length){ const x=tx*TILE, z=tz*TILE; for(let i=OV.length-1;i>=0;i--){ const o=OV[i]; if(x>=o.b[0]&&x<=o.b[2]&&z>=o.b[1]&&z<=o.b[3]&&inside(o.r,x,z))return o.k; } } return at0(tx,tz); };
  GRASS.TS=12; GRASS.pms={}; GRASS.paint=k=>{ const p0=performance.now(), N=GRASS.TS*24; if(k.img){ const A=k.img(N); GRASS.pms[k.id]=Math.round(performance.now()-p0); return A; } const A=new Uint8Array(N*N*4); for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const c=k.paint((i+.5)/24+200,(j+.5)/24+200), q=(j*N+i)*4; A[q]=c[0]; A[q+1]=c[1]; A[q+2]=c[2]; A[q+3]=255; } GRASS.pms[k.id]=Math.round(performance.now()-p0); return A; };
}
export {GRASS};
