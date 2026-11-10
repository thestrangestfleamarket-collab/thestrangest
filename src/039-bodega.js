// THE BODEGA: the bodega's kits (dungeon, museum, lounge, theatre, castle), its layout, solids and build (grab('bodega')).
import {SHARED, THREE} from './003-shx.js';
import {B64, U16} from './003a-skin.js';
import {BATCH, CLOCK, DRESS, FORAGE, LITE, pos, ROOMS, SFX, UI, WINDOWS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {BF, BLDK, BLOCK, CASTLE, cutWalls, EASTX, FIX, grab, lamps, LAY, LOTX, LOTY, MAPG, MAPSTAIR, MODS, NEONS, NORTHX, OFFDX, ORIGIN, OVERHEAD, PARKGX, RING, SECTIONS, SOL, STORE, SYS, TILE, TURN, WESTX, WP, WROW, ZU} from './006-map-pre.js';
import {PAINTC} from './006a-paintc.js';
import {OBJ} from './008-batch.js';
import {BRICKS, CAT_DEPTS, CAT_INFO, CATALOG, COPE, cvNoise, DTBRICK, FP, grain, grassCol, hash, kerbCol, kerbFace, KIND_OF, LAMPS, lawnCol, LBLD, LIFE, LSEED, mt, prop, PROPL, rlf, roadCol, sh, sided, slabCol, speck, STORY, T, zShift} from './014-gamekit.js';
import {bodegaFloorCol, bodegaWall} from './015-game-w-bodega-shop.js';
import {MKS} from './016-street-kit.js';
import {STUDIO} from './020-studio-kit.js';
import {KEEPC, PRESETS, STOREK} from './023-west-kits.js';
import {dgnRoom, dgnThings} from './038z-dungeon.js';
import {BLOCKS} from './038zb-blocks.js';
{
const {DGP,dgnLit,DGN,dgnWeb,dgnIvy,dgnRidge,dgnFoot,dgnStone,dgnDamp,dungeonWall,dungeonFloorCol}=dgnRoom(LBLD);
dgnThings(CATALOG,CAT_INFO,LAMPS,CAT_DEPTS,DGP,dgnLit,DGN,dgnWeb);


{
const KEEPR=(B=>({b:B,x0:B.x0+T,x1:B.x1-T,y0:B.y0+T,y1:B.y1-T,cx:(B.x0+B.x1)/2,cy:(B.y0+B.y1)/2,my:(B.y0+B.y1)/2,H:B.h-4,in:[B.x0-T,B.y0-T,B.x1+T,B.y1+T],
  torches:[{w:'b',u:1.6},{w:'b',u:7.7},{w:'l',u:2.2},{w:'l',u:7.4},{w:'r',u:1.3},{w:'r',u:8},{w:'f',u:1.8},{w:'f',u:7.6}],
  holes:[{w:'b',u:.7},{w:'b',u:3.9},{w:'l',u:.5},{w:'l',u:3.6},{w:'r',u:4.9},{w:'r',u:8.2},{w:'f',u:6.9},{w:'f',u:8.6}],chains:[{w:'b',u:3.1,l:46},{w:'r',u:2.6,l:34},{w:'l',u:.9,l:40}],
  door:{w:'r',u:6.6},slit:{w:'b',u:4.65},tally:{w:'l',u:4.9},banners:[{w:'b',u:6.2},{w:'r',u:3.4}],ivy:[{w:'b',u:.3,h:96},{w:'l',u:8.5,h:110},{w:'f',u:.8,h:70}],
  cracks:[{w:'b',u:3.9,z:110},{w:'b',u:8.6,z:80},{w:'l',u:1.4,z:100},{w:'r',u:5.6,z:90},{w:'f',u:6.4,z:100}]}))(LBLD.find(b=>b.id==='lcastle'));
const KPP={ash:[[138,130,116],[150,142,126],[144,138,128],[158,148,130],[132,126,116]],mortar:[104,98,88],trim:[184,174,150],trimD:[160,150,128],dark:[16,14,18],
  moss:[74,92,52],mossD:[56,74,44],mould:[96,100,84],lichen:[156,152,112],lead:[96,104,110],leadL:[112,120,126]};
function keepStone(u,z,seed){ const j=Math.floor(z/12), zz=z-j*12, L=20+Math.floor(hash(j,1,seed)*15), o=hash(j,0,seed)*L, k=Math.floor((u+o)/L), uu=(u+o)-k*L;
  if(zz<1||uu<1)return KPP.mortar;
  let c=KPP.ash[Math.floor(hash(j,k,seed+1)*5)]; if(zz>=11)c=sh(c,1.08); else if(zz<2)c=sh(c,.9);
  const g=hash(Math.floor(u),Math.floor(z),seed+2); if(g<.06)c=sh(c,.88); else if(g>.97)c=sh(c,1.07); return c; }
function keepWeather(c,u,z,seed){ const s=cvNoise(u/9,z/150,seed+7); if(s>.64)c=sh(c,1-(s-.64)*.9);
  if(hash(Math.floor(u/2),Math.floor(z/2),seed+8)<.004)return KPP.lichen;
  if(z<30){ const p=(30-z)/30, n=hash(Math.floor(u/2),Math.floor(z/2),seed+9); if(n<p*p*.5)return n<p*.1?KPP.moss:KPP.mossD; if(n>1-p*.15)return KPP.mould; c=sh(c,1-p*.22); }
  return c; }
function keepArch(du,z,zs,r,P){ const a=Math.abs(du), w=6;
  if(z>=zs){ const d=Math.hypot(du,z-zs); if(d<r)return P.dark; if(d>=r+w)return null; const t=Math.atan2(z-zs,du)/(Math.PI/9), k=Math.floor(t); return t-k<.1||d>=r+w-1?P.mortar:k&1?P.a:P.b; }
  if(a>=r&&a<r+w){ const j=Math.floor(z/12); return z-j*12<1?P.mortar:(j&1)?P.a:P.b; }
  return null; }
const KARCH={out:{dark:KPP.dark,mortar:KPP.mortar,a:KPP.trim,b:KPP.trimD},in:{dark:DGP.dark,mortar:DGP.mo,a:DGP.hi,b:DGP.st[1]}};
function keepLight(du,z,w,z0,z1){ const a=Math.abs(du), r=w/2; if(z<z0-3||z>z1+r+4||a>r+4)return null;
  if(z<z0){ return a<r+3?(z>=z0-1?KPP.trim:KPP.trimD):null; }
  if(z<z1)return a<r?KPP.dark:a<r+3?((Math.floor(z/8)&1)?KPP.trim:KPP.trimD):null;
  const d=Math.hypot(du,z-z1); return d<r?KPP.dark:d<r+3.5?(Math.floor(Math.atan2(z-z1,du)*4)&1?KPP.trim:KPP.trimD):null; }
function keepBay(du,z,door){ const a=Math.abs(du);
  if(z<STORY){ if(door||a>6||z<34||z>82)return null; if(a<1.5&&z>=40&&z<76)return KPP.dark; return z<38||z>=78||a>=4.5?KPP.trimD:du<0?KPP.trim:sh(KPP.trim,.86); }
  if(z<2*STORY)return keepLight(du,z,12,168,196);
  if(z<3*STORY){ if(a<1.5&&z>=290&&z<328)return (Math.floor(z/6)&1)?KPP.trim:KPP.trimD;
    const c=keepLight(du-6.5,z,8,290,322)||keepLight(du+6.5,z,8,290,322); if(c)return c;
    if(z>=322){ const d=Math.hypot(du,z-322); if(d>=13.5&&d<17)return Math.floor(Math.atan2(z-322,du)*5)&1?KPP.trim:KPP.trimD; }
    return null; }
  return keepLight(du,z,8,420,444); }
function keepOutWall(b,nx,ny,X,Y,z,f,cap){ const face=ny>0?'f':ny<0?'b':nx>0?'r':'l', u=(nx?Y-b.y0:X-b.x0)*24, L=(nx?b.y1-b.y0:b.x1-b.x0)*24, seed=face.charCodeAt(0)*13;
  if(z>=cap-4)return sh(KPP.trim,z<cap-3?f*.72:f);
  if(face==='f'){ const c=keepArch(u-(KEEPC.door-b.x0)*24,z,96,16.8,KARCH.out); if(c)return sh(c,f); }
  for(let i=0;i<3;i++){ const c=keepBay(u-L*(i+.5)/3,z,face==='f'&&i===1); if(c)return sh(c,f); }
  for(const s of [STORY,2*STORY,3*STORY])if(z>=s-1&&z<s+4)return sh(z<s?KPP.mortar:z>=s+3?sh(KPP.trim,1.08):KPP.trim,f);
  for(const [w,iu,h] of [['f',1.6,160],['r',6.2,120],['f',8.2,70]])if(face===w){ const c=dgnIvy(u-iu*24,z-2,h,seed+iu); if(c)return sh(c,f); }
  let c=z<24?(z>=21?KPP.trimD:sh(keepStone(u*.7,z*.6,seed+3),.9)):keepStone(u,z,seed);
  return sh(keepWeather(c,u,z,seed),f); }
function keepInWall(q,nx,ny,X,Y,z,f){ '@later'; const R=KEEPR, dim=z>170?Math.max(.38,1-(z-170)/420):1;
  if(Math.abs(Y-R.my)<T+.02){ let c=null; for(const a of KEEPC.arches)if(!c)c=keepArch((X-a)*24,z,110,19.2,KARCH.in);
    if(!c){ const u=(nx?Y:X)*24, seed=ny>0?51:53; c=dgnRidge(u,z,R.H)||dgnFoot(u,z,seed)||sh(dgnStone(u,z,seed),dgnDamp(u,z,seed,R.H)); }
    return sh(c,f*dim); }
  if(ny<0&&Math.abs(Y-R.y1)<.06){ const c=keepArch((X-KEEPC.door)*24,z,96,16.8,KARCH.in); if(c)return sh(c,f); }
  const c=dungeonWall(q,nx,ny,X,Y,z,f,R); return c.e||dim===1?c:sh(c,dim); }
const keepFloorCol=(x,y)=>dungeonFloorCol(x,y,KEEPR);

const KMK={};
(()=>{
const C=KPP, KH=STORY*4;
const kTop=(X,Y)=>{ const j=Math.floor(Y*2.5), o=(j&1)*.2, i=Math.floor(X*2.5+o), fx=X*2.5+o-i, fy=Y*2.5-j; if(fx<.07||fy<.07)return C.mortar; return sh(C.ash[Math.floor(hash(i,j,4301)*5)],1.04); };
function kb(x0,y0,x1,y1,z0,z1,seed,o={},paint){ return sided({x0,y0,x1,y1,z0,z1,c:C.ash[1],foot:z0===0?1:0,top:kTop,...o,
  fs:(nx,ny,X,Y,zr,k)=>{ const u=(nx?Y:X)*24, z=zr+z0, p=paint&&paint(nx,ny,u,z,X,Y); if(p)return p.e?p:sh(p,k); return sh(keepWeather(keepStone(u,z,seed),u,z,seed),k); }}); }
function merlons(B,axis,a,b,s,e,z0,seed){ const n=Math.max(1,Math.round((e-s)/.85)), step=(e-s)/n;
  for(let i=0;i<n;i++){ const m0=s+i*step+step*.18, m1=m0+step*.64; B.push(axis==='x'?kb(m0,a,m1,b,z0,z0+26,seed,{foot:0}):kb(a,m0,b,m1,z0,z0+26,seed,{foot:0})); } }
KMK.curtain=(ax,ay,bx,by,H,out)=>{ SHARED.PNAME='curtain wall'; const X=ay===by, t=.45, B=[], sd=Math.round(ax*7+ay*13), o=out[1]==='+'?1:-1;
  const [x0,y0,x1,y1]=X?[ax,ay-t,bx,ay+t]:[ax-t,ay,ax+t,by];
  const paint=(nx,ny,u,z)=>{ if((X?ny:nx)!==o)return null; const k=Math.floor(u/67), du=u-k*67-33;
    if(Math.abs(du)<1.5&&z>=118&&z<150)return C.dark; if(Math.abs(du)<4&&z>=114&&z<154)return z<117||z>=151||Math.abs(du)>=3?C.trimD:C.trim;
    for(const pz of [62,124,176])if(z>=pz&&z<pz+3&&Math.abs(((u+11)%36)-18)<1.5)return C.dark; return null; };
  B.push(kb(x0,y0,x1,y1,0,H,sd,{},paint));
  const s=X?x0:y0, e=X?x1:y1, a=o>0?(X?y1:x1)-.3:(X?y0:x0), b=a+.3;
  B.push(X?kb(x0,a,x1,b,H,H+10,sd,{foot:0}):kb(a,y0,b,y1,H,H+10,sd,{foot:0})); merlons(B,X?'x':'y',a,b,s,e,H+10,sd);
  const f0=o>0?(X?y1:x1):(X?y0:x0)-.16;
  B.push(X?kb(x0,f0,x1,f0+.16,0,22,sd+1):kb(f0,y0,f0+.16,y1,0,22,sd+1));
  return prop(B,null,{solids:[{x0:Math.min(x0,X?x0:f0),y0:Math.min(y0,X?f0:y0),x1:Math.max(x1,X?x1:f0+.16),y1:Math.max(y1,X?f0+.16:y1)}]}); };
KMK.drum=(cx,cy,r,H,seed=0)=>{ SHARED.PNAME='drum tower'; const B=[], sd=4400+seed;
  const face=(X,Y,z,k)=>{ const a=Math.atan2(Y-cy,X-cx), u=(a+Math.PI)*r*24, rk=.86+.2*Math.cos(a-2.2);
    for(const [az,z0] of [[.6,96],[2.3,96],[-1.4,96],[1.4,190],[-.4,190],[3,190]]){ const du=u-(az+Math.PI)*r*24; if(Math.abs(du)<1.5&&z>=z0&&z<z0+34)return sh(C.dark,k); if(Math.abs(du)<4&&z>=z0-4&&z<z0+38)return sh(z<z0||z>=z0+34||Math.abs(du)>=3?C.trimD:C.trim,k*rk); }
    return sh(keepWeather(keepStone(u,z,sd),u,z,sd),k*rk); };
  const slices=(R,z0,z1,top)=>{ const n=Math.max(4,Math.round(2*R/.2)), w=2*R/n;
    for(let i=0;i<n;i++){ const xa=cx-R+i*w, xm=xa+w/2, hy=Math.sqrt(Math.max(0,R*R-(xm-cx)**2)); if(hy<.06)continue;
      B.push(sided({x0:xa,y0:cy-hy,x1:xa+w,y1:cy+hy,z0,z1,c:C.ash[1],foot:z0===0?1:0,top,fs:(nx,ny,X,Y,zr,k)=>face(X,Y,zr+z0,k)})); } };
  slices(r+.16,0,24,kTop); slices(r,24,H,(X,Y)=>Math.hypot(X-cx,Y-cy)<r-.5?(hash(Math.floor(X*6),Math.floor(Y*3),4403)<.5?C.lead:C.leadL):kTop(X,Y));
  const n=Math.max(8,Math.round(2*Math.PI*r/.85)); for(let i=0;i<n;i+=1){ if(i&1)continue; const a=i/n*2*Math.PI, mx=cx+Math.cos(a)*(r-.22), my=cy+Math.sin(a)*(r-.22);
    B.push(sided({x0:mx-.2,y0:my-.2,x1:mx+.2,y1:my+.2,z0:H,z1:H+26,c:C.ash[1],foot:0,top:kTop,fs:(nx,ny,X,Y,zr,k)=>face(X,Y,zr+H,k)})); }
  const q=r*.72; return prop(B,null,{solids:[{x0:cx-q,y0:cy-r,x1:cx+q,y1:cy+r},{x0:cx-r,y0:cy-q,x1:cx+r,y1:cy+q}]}); };
KMK.turret=(cx,cy,sx,sy)=>{ '@later'; SHARED.PNAME='keep turret'; const B=[], o=1, n=1, sd=4500+Math.round(cx*3+cy*5), X0=Math.min(cx+sx*o,cx-sx*n), X1=Math.max(cx+sx*o,cx-sx*n), Y0=Math.min(cy+sy*o,cy-sy*n), Y1=Math.max(cy+sy*o,cy-sy*n);
  const paint=(nx,ny,u,z,X,Y)=>{ const e=nx?Math.min(Y-Y0,Y1-Y):Math.min(X-X0,X1-X); if(e<.32&&z>=24){ const j=Math.floor(z/12), long=j&1; if(e<(long?.32:.2))return z-j*12<1?C.mortar:long?C.trim:C.trimD; }
    const m=nx?(Y0+Y1)/2:(X0+X1)/2, du=((nx?Y:X)-m)*24; for(let s=0;s<5;s++){ const z0=70+s*STORY; if(Math.abs(du)<1.5&&z>=z0&&z<z0+26)return C.dark; } return null; };
  const ax0=sx>0?cx:cx+sx*o, ax1=sx>0?cx+sx*o:cx, ay0=sy>0?cy:cy+sy*o, ay1=sy>0?cy+sy*o:cy;
  const A={x0:ax0,y0:Y0,x1:ax1,y1:Y1}, Bq={x0:sx>0?cx-n:cx,y0:ay0,x1:sx>0?cx:cx+n,y1:ay1};
  B.push(kb(A.x0,A.y0,A.x1,A.y1,0,KH,sd,{},paint),kb(Bq.x0,Bq.y0,Bq.x1,Bq.y1,0,KH,sd,{},paint));
  B.push(kb(X0,Y0,X1,Y1,KH,KH+110,sd,{foot:0,top:(X,Y)=>Math.min(X-X0,X1-X,Y-Y0,Y1-Y)>.35?(hash(Math.floor(X*6),Math.floor(Y*3),4503)<.5?C.lead:C.leadL):kTop(X,Y)},paint));
  for(const [a,b,s,e,ax] of [[Y0,Y0+.3,X0,X1,'x'],[Y1-.3,Y1,X0,X1,'x'],[X0,X0+.3,Y0+.3,Y1-.3,'y'],[X1-.3,X1,Y0+.3,Y1-.3,'y']])merlons(B,ax,a,b,s,e,KH+110,sd);
  return prop(B,null,{solids:[A,Bq]}); };
KMK.parapet=(b,side)=>{ '@later'; SHARED.PNAME='keep parapet'; const B=[], t=.3, x0=b.x0-T, x1=b.x1+T, y0=b.y0-T, y1=b.y1+T, n=1, z0=470, z1=KH+26, sd=4600;
  const corb=(nx,ny,u,z)=>z<z0+12?((Math.floor(u/12)&1)?C.dark:z<z0+2?C.trimD:C.trim):z>=z1-3?C.trim:null;
  const q={f:[x0+n,y1,x1-n,y1+t],b:[x0+n,y0-t,x1-n,y0],l:[x0-t,y0+n,x0,y1-n],r:[x1,y0+n,x1+t,y1-n]}[side];
  B.push(kb(q[0],q[1],q[2],q[3],z0,z1,sd,{foot:1},corb)); if(side==='f'||side==='b')merlons(B,'x',q[1],q[3],q[0],q[2],z1,sd); else merlons(B,'y',q[0],q[2],q[1],q[3],z1,sd);
  return prop(B,null,{walk:1}); };
KMK.keepFace=(b,side,gap)=>{ '@later'; SHARED.PNAME='keep face'; const B=[], S=[], x0=b.x0-T, x1=b.x1+T, y0=b.y0-T, y1=b.y1+T, n=1, X=side==='f'||side==='b', o=side==='f'||side==='r'?1:-1, sd=4700+side.charCodeAt(0);
  const at=X?(o>0?y1:y0):(o>0?x1:x0), s=X?x0+n:y0+n, e=X?x1-n:y1-n, L=X?b.x1-b.x0:b.y1-b.y0, m0=X?b.x0:b.y0;
  const bx=(a0,a1,d,z0,z1)=>{ const p=o>0?[at,at+d]:[at-d,at]; const q=X?{x0:a0,y0:p[0],x1:a1,y1:p[1]}:{x0:p[0],y0:a0,x1:p[1],y1:a1}; B.push(kb(q.x0,q.y0,q.x1,q.y1,z0,z1,sd)); return q; };
  for(const f of [1/3,2/3]){ const m=m0+L*f; S.push(bx(m-.25,m+.25,.14,24,470)); }
  const runs=gap?[[s,gap[0]],[gap[1],e]]:[[s,e]];
  for(const [a0,a1] of runs){ S.push(bx(a0,a1,.3,0,8)); bx(a0,a1,.2,8,16); bx(a0,a1,.1,16,24); }
  return prop(B,null,{solids:S}); };
KMK.gate=(gx,wy,H)=>{ '@later'; SHARED.PNAME='gatehouse'; const y0=wy-.5, y1=wy+1.1, w=.65, sd=4800, ps=[];
  const arch=(nx,ny,u,z)=>ny>0||ny<0?keepArch(u-gx*24,z,104,15.6,KARCH.out):null;
  const leaf=(x0,x1)=>sided({x0,y0:y0+.05,x1,y1:y1-.05,z0:0,z1:100,c:DGP.oak,foot:1,top:()=>DGP.oakD,fs:(nx,ny,X,Y,z,k)=>{ const u=(nx?Y:X)*24; if([12,48,84].some(b=>z>=b&&z<b+4))return sh(z-Math.floor(z)<.5&&Math.floor(u)%6===0?DGP.ironL:DGP.iron,k); return sh(Math.floor(u)%7===0?DGP.oakD:hash(Math.floor(u),Math.floor(z/3),4801)<.15?DGP.oakL:DGP.oak,k); }});
  for(const [a,b,l0,l1] of [[gx-.9,gx-w,gx-w,gx-w+.08],[gx+w,gx+.9,gx+w-.08,gx+w]]){ const B=[kb(a,y0,b,y1,0,H,sd,{},arch),leaf(l0,l1)]; merlons(B,'x',y1-.3,y1,a,b,H,sd); ps.push(prop(B,null,{solids:[{x0:Math.min(a,l0),y0,x1:Math.max(b,l1),y1}]})); }
  const B=[kb(gx-w,y0,gx+w,y1,104,H,sd,{foot:1},arch)];
  B.push(sided({x0:gx-w,y0:wy+.36,x1:gx+w,y1:wy+.46,z0:84,z1:104,c:DGP.iron,foot:0,top:()=>DGP.iron,fs:(nx,ny,X,Y,z,k)=>{ const u=(nx?Y:X)*24, g=((u%6)+6)%6;
    if(z<4)return g<1.5&&z>=4-(1.5-Math.abs(g-.75))*4?sh(DGP.ironL,k):null; return g<1.5||Math.floor(z)%6<1.5?sh(z%6<1?DGP.ironL:DGP.iron,k):null; }}));
  merlons(B,'x',y1-.3,y1,gx-w,gx+w,H,sd); ps.push(prop(B,null,{walk:1})); return ps; };
KMK.well=(x,y)=>{ SHARED.PNAME='well'; const r=.55, d=.16, B=[], top=(X,Y)=>{ const q=Math.hypot(X-x,Y-y); return q<.34?C.dark:q<.38?C.mortar:kTop(X,Y); };
  B.push(kb(x-r,y-r+d,x+r,y+r-d,0,22,4901,{top}),kb(x-r+d,y-r,x+r-d,y+r,0,22,4901,{top}));
  const wood=(x0,y0,x1,y1,z0,z1)=>({x0,y0,x1,y1,z0,z1,foot:0,c:DGP.oak,top:()=>DGP.oakL,fi:()=>sh(DGP.oak,.7),fj:()=>sh(DGP.oak,.86)});
  B.push(wood(x-.44,y-.04,x-.36,y+.04,22,66),wood(x+.36,y-.04,x+.44,y+.04,22,66),wood(x-.48,y-.05,x+.48,y+.05,66,71));
  B.push({x0:x-.012,y0:y-.012,x1:x+.012,y1:y+.012,z0:30,z1:66,foot:0,nb:1,c:[150,128,90],top:()=>null,fi:()=>[132,112,78],fj:()=>[150,128,90]});
  B.push({x0:x+.18,y0:y+.3,x1:x+.34,y1:y+.46,z0:22,z1:30,foot:0,c:DGP.oak,top:()=>DGP.oakD,fi:(v,z)=>z>27?DGP.iron:sh(DGP.oak,.7),fj:(u,z)=>z>27?DGP.iron:sh(DGP.oak,.86)});
  return prop(B,null,{}); };
KMK.bars=(x0,y0,x1,y1)=>{ SHARED.PNAME='iron bars'; const X=y0===y1, t=.03, h=96, I=DGP.iron, IL=DGP.ironL, B=[], ib=(a,b,c,d,z0,z1,cl)=>({x0:a,y0:b,x1:c,y1:d,z0,z1,foot:z0===0?1:0,nb:1,c:cl,top:()=>IL,fi:()=>sh(cl,.7),fj:()=>sh(cl,.86)});
  const L=X?x1-x0:y1-y0, n=Math.round(L/.2); for(let i=0;i<=n;i++){ const m=(X?x0:y0)+L*i/n; B.push(X?ib(m-t,y0-t,m+t,y0+t,0,h,I):ib(x0-t,m-t,x0+t,m+t,0,h,I)); }
  for(const [z0,c] of [[0,DGP.rust],[44,I],[h-4,I]])B.push(X?ib(x0,y0-t*1.6,x1,y0+t*1.6,z0,z0+4,c):ib(x0-t*1.6,y0,x0+t*1.6,y1,z0,z0+4,c));
  return prop(B,null,{solids:[X?{x0,y0:y0-.06,x1,y1:y0+.06}:{x0:x0-.06,y0,x1:x0+.06,y1}]}); };
KMK.gravel=(x0,y0,x1,y1)=>{ SHARED.PNAME='gravel'; const G=[[120,114,104],[134,128,118],[108,102,94],[96,92,86]];
  const top=(X,Y)=>{ const n=hash(Math.floor(X*1.5),Math.floor(Y*1.5),4951); return G[n<.18?2:0]; };
  return prop([{x0,y0,x1,y1,z0:0,z1:1,c:G[0],foot:1,nb:1,top,fi:()=>null,fj:()=>null}],null,{walk:true,lift:1}); };
})();

STOREK.keep={KEEPR,keepOutWall,keepInWall,keepFloorCol,keepStone,KMK,DGP};
}

}

{
const BF_C={blk:[26,22,24],brn:[84,56,40],dk:[50,40,36],wht:[244,240,228],cr:[236,224,180],org:[230,122,34],yel:[246,206,70],red:[206,44,36],
  blu:[80,140,220],sky:[150,190,240],grn:[60,190,140],gold:[244,170,40],gry:[150,150,150]};
const BF_SHAPE={
  nym:{f:[[0,0.145],[0.18,0.522],[0.6,0.725],[1,0.638],[0.86,0.174],[0.7,0],[0,-0.04]],h:[.3,-.34,.42,.36]},
  swal:{f:[[0,0.145],[0.2,0.551],[0.62,0.725],[1,0.667],[0.78,0.087],[0,-0.02]],h:[.28,-.34,.4,.34],tail:[[.33,-.55],[.4,-.96],[.46,-.94],[.42,-.55]]},
  bird:{f:[[0,0.116],[0.2,0.435],[0.6,0.58],[1,0.493],[0.7,0.058],[0,-0.02]],h:[.26,-.3,.3,.26]},
  pier:{f:[[0,0.145],[0.16,0.522],[0.6,0.725],[0.95,0.638],[0.9,0.261],[0.66,0],[0,-0.04]],h:[.3,-.3,.34,.32]},
  blue:{f:[[0,0.145],[0.16,0.493],[0.56,0.667],[0.9,0.58],[0.84,0.174],[0.62,-0.02],[0,-0.04]],h:[.27,-.28,.32,.3]},
  bhut:{f:[[0,0.116],[0.2,0.493],[0.62,0.667],[1,0.551],[0.76,0.058],[0,-0.02]],h:[.26,-.32,.32,.28],tail:[[.3,-.52],[.36,-.98],[.42,-.96],[.4,-.52]],tail2:[[.18,-.55],[.22,-.82],[.27,-.8],[.26,-.55]]}};
const bfIn=(P,x,y)=>{ let c=false; for(let i=0,j=P.length-1;i<P.length;j=i++){ const [a,b]=P[i],[p,q]=P[j]; if((b>y)!==(q>y)&&x<(p-a)*(y-b)/(q-b)+a)c=!c; } return c; };
function bfWing(sh,u,v){ '@later'; const S=BF_SHAPE[sh], [hx,hy,hr,hv]=S.h;
  const inF=(x,y)=>u>=0&&bfIn(S.f,x,y), inH=(x,y)=>x>=0&&((x-hx)/hr)**2+((y-hy)/hv)**2<=1||S.tail&&bfIn(S.tail,x,y)||S.tail2&&bfIn(S.tail2,x,y);
  const f=inF(u,v), h=!f&&inH(u,v); if(!f&&!h)return null;
  const [cx,cy]=f?[.42,.3]:[hx,hy], t=k=>{ const x=cx+(u-cx)/k, y=cy+(v-cy)/k; return f?inF(x,y):inH(x,y); };
  let e=1; for(const k of [.97,.93,.88,.82,.74,.64])if(!t(k)){ e=1-k; break; } return {fore:f,rim:e}; }
const bfNear=(u,v,x,y,r)=>Math.hypot(u-x,v-y)<r;
const BF_KINDS=[
  ['Monarch','Danaus plexippus','the Americas; flies to Mexico each autumn',95,'nym',0,(u,v,f,r)=>r<.1?(((u*40|0)+(v*40|0))%3===0?BF_C.wht:BF_C.blk):r<.16?BF_C.blk:f&&u>.72&&v>.2?(bfNear(u,v,.86,.36,.04)?BF_C.wht:BF_C.blk):(Math.abs(Math.sin((Math.atan2(v-(f?.0:-.1),u)*7)))<.12?BF_C.blk:BF_C.org),[214,140,60]],
  ['Cabbage White','Pieris rapae','fields and gardens almost everywhere',50,'pier',0,(u,v,f,r)=>f&&u>.72&&v>.28?[70,70,70]:f&&bfNear(u,v,.6,.18,.06)?[70,70,70]:u<.1?[190,190,184]:BF_C.wht,[232,232,200]],
  ['Eastern Tiger Swallowtail','Papilio glaucus','eastern North America, woods and gardens',110,'swal',0,(u,v,f,r)=>r<.12?(((u*30|0)%2)?BF_C.yel:BF_C.blk):r<.2?BF_C.blk:!f&&r<.3&&u>.3?BF_C.blu:f&&[.25,.45,.62].some(s=>Math.abs(u-s)<.035)?BF_C.blk:u<.08?BF_C.blk:BF_C.yel,[236,200,90]],
  ['Black Swallowtail','Papilio polyxenes','meadows and gardens of eastern North America',90,'swal',0,(u,v,f,r)=>r<.1?BF_C.blk:r<.17?BF_C.yel:!f&&r<.28?(bfNear(u,v,.12,-.6,.07)?BF_C.org:BF_C.blu):f&&r<.3&&r>.22?BF_C.yel:BF_C.blk,[40,36,40]],
  ['Spicebush Swallowtail','Papilio troilus','eastern woods with spicebush and sassafras',100,'swal',0,(u,v,f,r)=>r<.1?BF_C.blk:r<.16?[236,232,190]:!f&&r<.42?[90,170,190]:BF_C.blk,[50,44,46]],
  ['Red Admiral','Vanessa atalanta','gardens and woods all over the north',55,'nym',0,(u,v,f,r)=>f&&u>.74&&v>.22&&bfNear(u,v,.86,.38,.06)?BF_C.wht:f&&Math.abs(u+v*.9-.78)<.07?BF_C.red:!f&&r<.16&&r>.06?BF_C.red:BF_C.blk,[60,44,48]],
  ['Painted Lady','Vanessa cardui','every continent but the poles',55,'nym',0,(u,v,f,r)=>f&&u>.72&&v>.2?(bfNear(u,v,.84,.36,.05)?BF_C.wht:BF_C.blk):r<.12?BF_C.blk:f&&bfNear(u,v,.5,.22,.08)?BF_C.blk:!f&&r<.2?(((u*30|0)%2)?BF_C.blk:[240,150,90]):[238,140,70],[200,170,150]],
  ['Mourning Cloak','Nymphalis antiopa','woods across the north, the first out in spring',75,'nym',0,(u,v,f,r)=>r<.12?BF_C.cr:r<.2?(((u*24|0)+(v*24|0))%3===0?BF_C.blu:BF_C.blk):[96,40,44],[60,50,50]],
  ['Question Mark','Polygonia interrogationis','woods and parks of eastern North America',60,'nym',0,(u,v,f,r)=>r<.1?[110,60,40]:!f&&r<.35?[80,50,40]:[[.3,.3],[.5,.2],[.45,.38],[.62,.3]].some(([a,b])=>f&&bfNear(u,v,a,b,.05))?BF_C.blk:[214,110,40],[150,110,80]],
  ['Clouded Sulphur','Colias philodice','clover fields and roadsides',45,'pier',0,(u,v,f,r)=>r<.12?BF_C.blk:f&&bfNear(u,v,.5,.26,.04)?BF_C.blk:!f&&bfNear(u,v,.3,-.32,.05)?BF_C.org:[244,230,120],[230,220,110]],
  ['Pearl Crescent','Phyciodes tharos','open fields and parks of North America',32,'nym',0,(u,v,f,r)=>r<.14?BF_C.blk:((u*16|0)+(v*16|0))%4===0?BF_C.blk:[226,120,40],[220,170,120]],
  ['Eastern Tailed-Blue','Cupido comyntas','lawns, fields and road edges in the east',25,'blue',0,(u,v,f,r)=>r<.12?[60,60,90]:!f&&bfNear(u,v,.2,-.56,.06)?BF_C.org:[110,120,230],[220,220,230]],
  ["Queen Alexandra's Birdwing",'Ornithoptera alexandrae',"one valley's rainforest in Papua New Guinea; the largest butterfly",250,'bird',1,(u,v,f,r)=>r<.08?BF_C.blk:f&&(Math.abs(v-.24)<.05&&u>.1||Math.abs(u-.6)<.05&&v<.3&&v>.05)?[80,230,210]:!f&&r>.18?[70,210,200]:BF_C.blk,[40,60,50]],
  ["Wallace's Golden Birdwing",'Ornithoptera croesus','two islands of the Moluccas',180,'bird',1,(u,v,f,r)=>r<.08?BF_C.blk:f&&Math.abs(v-.22)<.05&&u>.12?[250,140,30]:!f&&r>.16?[252,160,30]:BF_C.blk,[200,170,60]],
  ['Homerus Swallowtail','Papilio homerus','two mountain forests in Jamaica',150,'swal',1,(u,v,f,r)=>r<.1?BF_C.blk:!f&&r<.22?BF_C.blu:Math.abs(u-.4)<.12&&r>.2?BF_C.gold:BF_C.blk,[60,50,40]],
  ["Schaus' Swallowtail",'Heraclides aristodemus ponceanus','the hammocks of the Florida Keys',100,'swal',1,(u,v,f,r)=>r<.1?BF_C.brn:Math.abs(u-.42+v*.2)<.06||!f&&r<.2&&r>.12?[236,206,90]:[60,44,34],[200,180,120]],
  ['Luzon Peacock Swallowtail','Papilio chikae','high mountain forest on Luzon, the Philippines',110,'swal',1,(u,v,f,r)=>!f&&r<.14&&r>.06?BF_C.red:r<.06?BF_C.blk:hash(u*90|0,v*90|0,301)<.35?[40,140,110]:[20,40,36],[40,40,40]],
  ['Corsican Swallowtail','Papilio hospiton','mountains of Corsica and Sardinia',75,'swal',1,(u,v,f,r)=>r<.1?BF_C.blk:!f&&bfNear(u,v,.1,-.6,.06)?BF_C.red:!f&&r<.2?BF_C.blu:f&&u<.25?BF_C.blk:[240,210,80],[220,200,110]],
  ['Kaiser-i-Hind','Teinopalpus imperialis','high forests of the eastern Himalaya',100,'swal',1,(u,v,f,r)=>r<.08?BF_C.blk:!f&&bfNear(u,v,.24,-.34,.12)?BF_C.gold:f&&Math.abs(u-.55)<.04?BF_C.blk:[80,170,90],[120,150,90]],
  ['Bhutan Glory','Bhutanitis lidderdalii','mountain forests of Bhutan and India',100,'bhut',1,(u,v,f,r)=>!f&&bfNear(u,v,.28,-.5,.1)?BF_C.red:!f&&bfNear(u,v,.22,-.48,.16)?BF_C.yel:Math.abs(Math.sin((u+v*.6)*26))<.25?[230,220,190]:BF_C.blk,[40,36,32]],
  ['Palos Verdes Blue','Glaucopsyche lygdamus palosverdesensis','one coastal hill in Los Angeles',25,'blue',1,(u,v,f,r)=>r<.12?[80,80,100]:[150,170,220],[200,200,210]],
  ['Miami Blue','Cyclargus thomasi bethunebakeri','a few islands of the Florida Keys',25,'blue',1,(u,v,f,r)=>r<.1?[50,50,70]:!f&&bfNear(u,v,.22,-.52,.05)?BF_C.blk:[80,140,240],[200,200,210]],
  ['Mission Blue','Icaricia icarioides missionensis',"San Francisco's hills, among the lupines",30,'blue',1,(u,v,f,r)=>r<.06?BF_C.wht:r<.14?[70,70,90]:[150,160,230],[210,210,220]],
  ['Karner Blue','Lycaeides melissa samuelis','pine barrens with wild lupine',25,'blue',1,(u,v,f,r)=>r<.06?BF_C.wht:r<.14?BF_C.blk:[120,110,220],[200,200,210]],
  ["Fender's Blue",'Icaricia icarioides fenderi',"Oregon's Willamette Valley prairies",28,'blue',1,(u,v,f,r)=>r<.12?BF_C.blk:[90,170,250],[210,210,210]],
  ['Sinai Baton Blue','Pseudophilotes sinaicus','round Mount Sinai only; among the smallest',12,'blue',1,(u,v,f,r)=>r<.14?[90,70,60]:[110,130,220],[200,200,200]],
  ['Large Blue','Phengaris arion','sunny grassland in Europe; its caterpillars live with ants',40,'blue',1,(u,v,f,r)=>r<.1?[60,60,80]:f&&[[.42,.2],[.55,.28],[.5,.1]].some(([a,b])=>bfNear(u,v,a,b,.04))?BF_C.blk:[110,140,220],[190,190,200]],
  ["Lange's Metalmark",'Apodemia mormo langei','the Antioch Dunes, California',30,'nym',1,(u,v,f,r)=>((u*14|0)+(v*14|0))%3===0&&r>.1?BF_C.wht:u<.3?[200,70,40]:BF_C.blk,[200,180,170]],
  ['Island Marble','Euchloe ausonides insulanus','one island in the San Juans, Washington',40,'pier',1,(u,v,f,r)=>f&&u>.7&&v>.2?((u*30|0)%2?[60,60,60]:BF_C.wht):BF_C.wht,[150,180,120]],
  ['Uncompahgre Fritillary','Boloria acrocnema','two Colorado mountain tops over 13,000 feet',30,'nym',1,(u,v,f,r)=>r<.1?BF_C.dk:((u*12|0)+(v*12|0))%3===0?BF_C.dk:[200,120,60],[180,120,90]],
  ["Saint Francis' Satyr",'Neonympha mitchellii francisci','wet meadows of one army base in North Carolina',40,'nym',1,(u,v,f,r)=>r>.04&&r<.2&&((u*9|0)%2)&&(!f||u>.5)?(r>.06&&r<.13?BF_C.blk:[226,150,60]):r<.05?[70,50,36]:[100,74,52],[130,100,70]],
  ['Apollo','Parnassius apollo','mountain meadows of Europe and Asia',75,'pier',1,(u,v,f,r)=>{ const eye=!f&&[[.22,-.24],[.36,-.42]].find(([a,b])=>bfNear(u,v,a,b,.075)); if(eye)return bfNear(u,v,eye[0],eye[1],.045)?BF_C.red:BF_C.blk;
    return f&&[[.45,.3],[.62,.22],[.3,.14]].some(([a,b])=>bfNear(u,v,a,b,.05))?BF_C.blk:f&&r<.12?[196,198,196]:[244,242,236]; },[236,232,220]]];

function bfPic(k,w,pose){ '@later'; const [,,,,sh,,pat,under]=BF_KINDS[k], hs=w/2, ys=.72;
  if(pose===2){ const W=Math.max(3,Math.round(hs*1.25)), h=Math.max(3,Math.round(hs*1.05)+1), oy=h-1, px=new Array(W*h).fill(null);
    for(let y=0;y<h;y++)for(let x=0;x<W;x++){ const a=(x+.5-W*.45)/hs, b=(oy-(y+.5))/hs;
      if(y===oy&&Math.abs(a)<.42){ px[y*W+x]=a>.34?[40,34,30]:[30,26,24]; continue; }
      const q=bfWing(sh,b,a); if(q)px[y*W+x]=q.rim<.07?under.map(v=>v*.62|0):q.fore?under:under.map(v=>v*.88|0); }
    return {w:W,h,oy,px}; }
  const xs=pose===0?1:.56, h=Math.max(3,Math.round(1.78*hs*ys)+1), oy=Math.round(.78*hs*ys), px=new Array(w*h).fill(null);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){ const X=(x+.5-w/2)/hs, Y=(oy-(y+.5))/hs/ys;
    if(Math.abs(X)<.07&&Y<.38&&Y>-.5){ px[y*w+x]=Y>.3?[40,34,30]:[30,26,24]; continue; }
    const u=Math.abs(X)/xs, q=bfWing(sh,u,Y); if(!q)continue; let c=pat(u,Y,q.fore,q.rim); if(q.rim<.04)c=c.map(v=>v*.55|0); px[y*w+x]=pose===1?c.map(v=>v*.82|0):c; }
  if(hs>=6)for(let i=1;i<=Math.round(hs*.45);i++)for(const sx of [-1,1]){ const x=Math.round(w/2-.5+sx*i*.5), y=oy-Math.round(hs*ys*.3)-i; if(y>=0&&x>=0&&x<w&&!px[y*w+x])px[y*w+x]=[34,28,26]; }
  return {w,h,oy,px}; }

const bfSpan=k=>Math.max(12,Math.round(BF_KINDS[k][3]/35*4));
(()=>{ const {FP,AP,rect,sub,fb,worn,wood}=STUDIO.kit, ONZ=STUDIO.kit.z, lit=q=>Object.assign([...q],{e:1});
function venetian(x,y,f=[0,1],up=0){ '@later'; SHARED.PNAME=up?'venetian blinds, up':'venetian blinds'; const r=rect(x,y,f,1.16,.05), c=[222,214,196], B=[];
  const slat=(s,t,z)=>mt('frame',z<1?sh(c,.66):z<2?sh(c,.9):sh(c,1.04+.05*hash(Math.floor(t*40),3,421)));
  if(up)B.push(fb(r,0,1,0,1,80,92,c,(s,t,z)=>mt('frame',z%2<1?sh(c,.74):c),()=>sh(c,1.05),{foot:1}),fb(r,.9,.92,-1,0,44,80,[200,196,184],null,null,{foot:1}));
  else{ for(let z=44;z<91;z+=4)B.push(fb(r,0,1,0,1,z,z+3,c,slat,()=>sh(c,1.12),{foot:1}));
    B.push(fb(r,0,1,0,1,41,43,sh(c,.9),null,null,{foot:1}),fb(r,.9,.92,-1,0,58,91,[200,196,184],null,null,{foot:1})); }
  B.push(fb(r,-.01,1.01,-.3,1,92,95,[176,168,150],null,null,{foot:1}));
  return prop(B,null,{high:true,walk:true}); }
function silkCurtains(x,y,f=[0,1],loose=0){ '@later'; SHARED.PNAME=loose?'silk curtains, loose':'silk curtains'; const r=rect(x,y,f,1.96,.07), c=[112,34,58], B=[], gold=[204,164,70];
  const silk=out=>(s,t,z,len)=>{ if(s==='l'||s==='r')return sh(c,.7); if(z<1)return sh(c,.6); const a=(out?1-t:t)*len*FP, k=Math.sin(a*1.7+z*.04);
    return mt('frame',sh(c,k>.7?1.45:k>.2?1.12:k>-.45?.9:.72)); };
  const seg=loose?[]:[[66,100,.19],[54,66,.13],[46,54,.08],[40,46,.11]];
  for(const [z0,z1,w] of seg){ B.push(fb(r,0,w,0,1,z0,z1,c,silk(0),()=>sh(c,.9),{foot:1}),fb(r,1-w,1,0,1,z0,z1,c,silk(1),()=>sh(c,.9),{foot:1})); }
  if(!loose)B.push(fb(r,0,.09,-.2,1,50,52,gold,null,null,{foot:1}),fb(r,.91,1,-.2,1,50,52,gold,null,null,{foot:1}));
  B.push(fb(r,-.03,1.03,.3,.7,100,102,[150,118,60],null,null,{foot:1}),fb(r,-.05,-.02,.2,.8,99,103,gold,null,null,{foot:1}),fb(r,1.02,1.05,.2,.8,99,103,gold,null,null,{foot:1}));
  if(loose){ const s=sub(r,0,1,-2.6,1); B.push({...s,z0:36,z1:101,c:[0,0,0],top:()=>null,fi:()=>null,fj:()=>null,nb:1,foot:1}); }
  const p=prop(B,null,{high:true,walk:true}); if(!loose)return p;
  const rec=CLOTH.sheet('silk panel',{w:.21*1.96*24,h:60,nt:6,nz:13,pin:'top',wall:true,wind:28}), S={}, [cx,cy]=r.at(.5,.5); CLOTH.still(p,cx,cy,70);
  p.lifeDraw=(D,W,H,ox,oy,t,K)=>{ const [lv,fr]=CLOTH.frame(p,rec,t), L=CLOTH.light(p,S,t,cx,cy,70), col=(k,i,j)=>{ const b=.5+.5*Math.sin(i*1.7+j*.3), m=.55*b+.45*k, q=sh(c,m>.72?1.45:m>.5?1.12:m>.32?.9:.72); return [q[0]*L[0],q[1]*L[1],q[2]*L[2]]; };
    for(const side of [0,1])CLOTH.draw(D,W,H,ox,oy,K,rec,lv,fr,(a,d,z)=>{ const [x,y]=r.at(side?1-.21+a/(1.96*24):a/(1.96*24),.5-d/(.07*24)); return [x,y,100-z]; },col); };
  return p; }
const leafC=(u,d)=>{ const h=hash(u,d,411); return h<.25?[38,78,36]:h<.65?[56,108,46]:h<.9?[78,138,60]:[118,170,84]; };
function ivyPx(u,d,long){ '@later'; if(d<4)return hash(u,d,405)<.8?leafC(u,d):null;
  const g=Math.floor(u/4), L=(long?14:8)+Math.floor(hash(g,3,403)*(long?52:34)); if(hash(g,7,401)>.5||d>=L)return null;
  const cx=g*4+1+Math.round(1.2*Math.sin(d/5+g*1.7)); if(u===cx)return hash(u,d,407)<.5?[66,74,40]:leafC(u,d);
  const side=Math.floor((d+g*3)/4)%2?1:-1; return (d+g*3)%4<3&&(u-cx)*side>0&&Math.abs(u-cx)<=2&&hash(u,d,409)<.85?leafC(u,d):null; }
function ivy(x,y,f=[0,1],long=0){ '@later'; SHARED.PNAME=long?'trailing ivy, long':'trailing ivy'; const r=rect(x,y,f,2.35,.05), Z0=long?60:76, Z1=126;
  return prop([fb(r,0,1,0,1,Z0,Z1,[56,108,46],(s,t,z,len)=>s==='f'?ivyPx(Math.floor(t*len*FP),Math.floor(Z1-Z0-1-z),long):null,()=>null,{foot:1,nb:1})],null,{high:true,walk:true}); }
const FLH=[3,4,4,3,2,4,3,4];
function candle(r,t,d,z,h,i,FL){ '@later'; const w=[234,224,200];
  return [fb(r,t-.05,t+.05,d-.05,d+.05,z,z+h,w,(s,tt,zz)=>zz>h-2?sh(w,.86):hash(Math.floor(tt*9),Math.floor(zz),423+i)<.12?sh(w,1.06):sh(w,.97),()=>[200,186,160],{foot:1}),
    fb(r,t-.012,t+.012,d-.012,d+.012,z+h,z+h+1,[30,26,24],null,null,{foot:1}),
    fb(r,t-.03,t+.03,d-.03,d+.03,z+h+1,z+h+6,[255,200,90],(s,tt,zz)=>{ if(LIFE.mode!==1)return null; const ph=(FL.ph+i*3)%8, hh=FLH[ph]; if(zz>=hh)return null;
      if(ph%3===1&&zz>=hh-1&&tt<.5)return null; return lit(zz<1?[255,236,190]:zz<hh-1?[255,190,74]:[246,128,40]); },()=>null,{foot:1,nb:1,life:1})]; }
const flicker=(p,FL,seed)=>{ p.life=t=>{ FL.ph=Math.floor(hash(Math.floor(t*7),seed,425)*8); }; p.lifeKey=()=>FL.ph; };
function candles(x,y,f=[0,1],z=ONZ(),n=3){ '@later'; SHARED.PNAME=n===2?'two candles':'candles'; const r=rect(x,y,f,.26,.26), FL={ph:0}, br=[168,132,64];
  const B=[fb(r,.04,.96,.04,.96,z,z+1,br,(s,t,zz)=>sh(br,.8),()=>sh(br,1.1),{foot:1})];
  (n===2?[[.32,.4,9],[.66,.62,6]]:[[.3,.35,10],[.66,.38,7],[.46,.7,5]]).forEach(([t,d,h],i)=>B.push(...candle(r,t,d,z+1,h,i,FL)));
  const p=prop(B); flicker(p,FL,Math.round(x*7+y*13)); LAMPS.push({x,y,z:z+14,r:2.8,c:[.72,.4,.15],own:1,room:1,day:true,prop:p}); return p; }
function patternedRug(x,y,f=[0,1]){ '@later'; SHARED.PNAME='patterned rug'; const r=rect(x,y,f,2.6,3.1), W=2.6*FP, D=3.1*FP, pu=[104,52,98], pd=[64,32,66], gd=[196,150,64], gl=[226,186,96];
  return prop([fb(r,0,1,0,1,0,1,pu,()=>sh(pd,.8),(t,d,X,Y)=>{ const a=t*W, b=d*D; if(b<2||b>D-2)return Math.floor(a)%2?[226,214,184]:null;
    const e=Math.min(a,W-a,b-2,D-2-b), n=hash(Math.floor(X*48),Math.floor(Y*48),427); let q;
    if(e<1)q=pd; else if(e<4)q=(Math.floor(a/2)+Math.floor(b/2))%2?gd:pd; else if(e<5)q=pd;
    else{ const m=Math.abs(a-W/2)/(W/2)+Math.abs(b-D/2)/(D/2);
      q=m<.22?((Math.floor(a/2)+Math.floor(b/2))%3===0?[150,70,96]:[178,110,138]):m<.27?pd:m<.5?((Math.floor(a)%5===2&&Math.floor(b)%5===2)?pd:gd):m<.53?[90,58,36]
        :(Math.round(a+b)%8===0&&Math.round(a-b)%8===0)?gl:pu; }
    return mt('carpet',n<.3?sh(q,.92):n>.94?sh(q,1.08):q); })],null,{walk:true,flat:true}); }
function fig(x,y,f=[0,1]){ '@later'; SHARED.PNAME='fiddle-leaf fig'; const r=rect(x,y,f,.64,.64), pot=[58,60,64], B=[];
  B.push(fb(r,.3,.7,.3,.7,0,11,pot,(s,t,z)=>z>9?sh(pot,1.2):worn(pot,t,z,429),()=>[52,40,30],{foot:1}),fb(r,.47,.53,.47,.53,11,56,[96,78,58],null,null,{foot:1,nb:1}));
  const leaf=(t,d,z,h)=>{ const c=[72,142,58];
    return fb(r,t-.11,t+.11,d-.11,d+.11,z,z+h,c,(s,tt,zz)=>{ const a=(tt-.5)*2, b=(zz/h-.5)*2.1; if(a*a*(b>0?.85:1.3)+b*b>1)return null;
      return Math.abs(a)<.14?[146,192,104]:b>.4?[108,176,80]:b<-.45?[50,104,44]:c; },(tt,dd)=>((tt-.5)**2+(dd-.5)**2)<.2?(Math.abs(tt-.5)<.07?[146,192,104]:[92,160,70]):null,{foot:1,nb:1}); };
  for(const [t,d,z] of [[.22,.3,18],[.78,.28,21],[.2,.74,24],[.8,.72,27],[.5,.12,31],[.1,.5,34],[.9,.5,37],[.5,.88,33],[.3,.42,42],[.7,.58,45],[.62,.3,49],[.38,.7,51],[.5,.5,56]])B.push(leaf(t,d,z,11));
  return prop(B); }
const potC=(u,d)=>{ const h=hash(u,d,451); return h<.2?[52,110,44]:h<.6?[82,148,58]:h<.9?[110,172,70]:[150,196,96]; };
function trailPx(u,d,n,seed){ '@later'; const g=Math.floor(u/4); if(hash(g,1,seed)>.6)return null; const L=6+Math.floor(hash(g,2,seed)*n); if(d>=L)return null;
  const cx=g*4+1+Math.round(Math.sin(d/6+g)); if(u===cx)return [74,96,48]; return (d+g)%5<3&&Math.abs(u-cx)<=(d%5===1?2:1)&&hash(u,d,seed+1)<.8?potC(u,d):null; }
function pothosShelf(x,y,f=[0,1]){ '@later'; SHARED.PNAME='pothos shelf'; const r=rect(x,y,f,.9,.26), Z=66, pine=AP.pine;
  return prop([fb(r,0,1,0,1,Z,Z+2,pine,(s,t,z,len)=>wood(453,pine,t,z,len),null,{foot:1}),fb(r,.1,.15,.4,.9,Z-6,Z,AP.steelD,null,null,{foot:1}),fb(r,.85,.9,.4,.9,Z-6,Z,AP.steelD,null,null,{foot:1}),
    fb(r,.1,.4,.25,.8,Z+2,Z+9,AP.terra,(s,t,z)=>z>6?sh(AP.terra,.8):worn(AP.terra,t,z,455),()=>[52,40,30],{foot:1}),
    fb(r,.04,.46,.15,.9,Z+9,Z+15,[82,148,58],(s,t,z,len)=>hash(Math.floor(t*len*FP),Math.floor(z),457)<.3?null:potC(Math.floor(t*len*FP),Math.floor(z)),(t,d)=>hash(Math.floor(t*12),Math.floor(d*8),459)<.25?null:potC(Math.floor(t*12),Math.floor(d*8)),{foot:1}),
    fb(r,.02,.55,0,.12,Z-34,Z+9,[82,148,58],(s,t,z,len)=>s==='f'?trailPx(Math.floor(t*len*FP),Math.floor(42-z),30,461):null,()=>null,{foot:1,nb:1}),
    ...[[.6,.66,[120,40,40],11],[.67,.72,[40,70,100],10],[.73,.8,[160,130,70],12]].map(([t0,t1,c,h])=>fb(r,t0,t1,.3,.85,Z+2,Z+2+h,c,(s,t,z)=>s==='f'&&z>1&&z<3?[200,170,90]:c,()=>[222,212,188],{foot:1}))],null,{high:true,walk:true}); }
function hangingPothos(x,y,f=[0,1]){ '@later'; SHARED.PNAME='hanging pothos'; const r=rect(x,y,f,.4,.4), Z=74, cord=[214,200,170], iron=[44,40,38], B=[];
  B.push(fb(r,.47,.53,.47,1.38,96,98,iron,null,null,{foot:1,nb:1}),fb(r,.42,.58,1.3,1.38,90,100,iron,null,null,{foot:1,nb:1}),fb(r,.48,.52,.48,.52,93,96,iron,null,null,{foot:1,nb:1}));
  for(const [t,d] of [[.3,.3],[.7,.3],[.5,.72]])B.push(fb(r,t-.02,t+.02,d-.02,d+.02,Z+8,Z+12,cord,null,null,{foot:1,nb:1}));
  B.push(fb(r,.42,.58,.42,.58,Z+12,93,cord,(s,tt,z)=>z%5<1?sh(cord,.8):cord,null,{foot:1,nb:1}),
    fb(r,.28,.72,.28,.72,Z,Z+8,AP.terra,(s,t,z)=>z>6?sh(AP.terra,.8):z%4<1?cord:worn(AP.terra,t,z,463),()=>[52,40,30],{foot:1,nb:1}),
    fb(r,.16,.84,.16,.84,Z+8,Z+14,[110,172,70],(s,t,z,len)=>hash(Math.floor(t*len*FP),Math.floor(z),465)<.25?null:potC(Math.floor(t*len*FP),Math.floor(z)),(t,d)=>hash(Math.floor(t*10),Math.floor(d*10),467)<.2?null:potC(Math.floor(t*10),Math.floor(d*10)),{foot:1,nb:1}),
    fb(r,.12,.88,.12,.88,Z-24,Z+2,[110,172,70],(s,t,z,len)=>trailPx(Math.floor(t*len*FP),Math.floor(26-z),22,469),()=>null,{foot:1,nb:1}));
  return prop(B,null,{high:true,walk:true}); }
function teaTray(x,y,f=[0,1],z=ONZ()){ '@later'; SHARED.PNAME='tea tray'; const r=rect(x,y,f,.38,.28), wd=AP.walnut, wh=[226,228,232], bl=[70,96,150], ST={ph:0};
  const B=[fb(r,0,1,0,1,z,z+1,wd,null,()=>sh(wd,1.15),{foot:1}),
    fb(r,.12,.44,.22,.78,z+1,z+7,wh,(s,t,zz)=>zz>2&&zz<4?bl:zz>5?sh(wh,1.05):wh,()=>sh(wh,1.08),{foot:1}),fb(r,.24,.32,.42,.58,z+7,z+8,bl,null,null,{foot:1}),
    fb(r,.44,.54,.44,.56,z+3,z+6,wh,null,null,{foot:1}),fb(r,.06,.12,.42,.58,z+2,z+6,wh,null,null,{foot:1}),
    fb(r,.58,.86,.3,.7,z+1,z+2,wh,null,()=>sh(wh,1.04),{foot:1}),fb(r,.64,.8,.38,.62,z+2,z+4,wh,null,(t,d)=>Math.min(t,1-t,d,1-d)<.18?wh:[118,66,32],{foot:1}),
    fb(r,.66,.78,.42,.58,z+4,z+13,[200,200,206],(s,t,zz)=>{ if(LIFE.mode!==1)return null; const k=Math.floor(zz+ST.ph), dx=Math.round(Math.sin(k*.8)*1.2);
      return Math.abs(t*3-1.5-dx*.5)<.6&&k%4<2&&hash(k,Math.floor(t*3),431)<.7?[176,176,184]:null; },()=>null,{foot:1,nb:1,life:1})];
  const p=prop(B); p.life=t=>{ ST.ph=Math.floor(t*4)%8; }; p.lifeKey=()=>ST.ph; return p; }
function pegRail(x,y,f=[0,1]){ '@later'; SHARED.PNAME='peg rail with a hat and a bag'; const r=rect(x,y,f,.9,.12), wd=AP.walnut, cv=[196,180,140], sc=[60,90,120];
  return prop([fb(r,0,1,.6,1,62,66,wd,(s,t,z,len)=>wood(433,wd,t,z,len),null,{foot:1}),...[.15,.5,.85].map(t=>fb(r,t-.03,t+.03,0,.6,63,65,sh(wd,1.2),null,null,{foot:1})),
    fb(r,0,.3,0,.7,55,57,[50,44,40],null,null,{foot:1}),fb(r,.05,.25,.1,.6,57,58,[120,40,40],null,null,{foot:1}),fb(r,.05,.25,.1,.6,58,63,[62,54,48],null,()=>[70,62,54],{foot:1}),
    fb(r,.44,.56,.2,.6,36,64,sc,(s,t,z)=>Math.floor(z/3)%2?sc:[190,150,70],null,{foot:1}),
    fb(r,.83,.87,.3,.5,50,64,[170,150,110],null,null,{foot:1}),fb(r,.7,1,.25,.75,30,50,cv,(s,t,z)=>z<1||z>18?sh(cv,.82):hash(Math.floor(t*20),Math.floor(z),435)<.06?sh(cv,.9):cv,null,{foot:1})],null,{high:true,walk:true}); }
function bookStack(x,y,f=[0,1]){ '@later'; SHARED.PNAME='stack of books with a candle'; const r=rect(x,y,f,.42,.32), FL={ph:0}, B=[];
  [[.05,.95,.05,.95,0,3,[92,40,36]],[.1,.92,.1,.9,3,5,[40,60,84]],[.02,.88,.15,.95,5,8,[70,84,52]],[.12,.95,.05,.85,8,10,[150,120,70]],[.1,.85,.12,.88,10,12,[110,44,70]]].forEach(([t0,t1,d0,d1,z0,z1,c],i)=>
    B.push(fb(r,t0,t1,d0,d1,z0,z1,c,(s,t,z)=>s==='b'?(z>=z1-z0-1||z<1?c:sh(c,i%2?1.25:.8)):z<1||z>=z1-z0-1?c:[222,212,188],()=>sh(c,1.08),{foot:1})));
  B.push(...candle(r,.5,.5,12,7,0,FL)); const p=prop(B); flicker(p,FL,Math.round(x*11+y*5)); LAMPS.push({x,y,z:24,r:2.4,c:[.66,.37,.14],own:1,room:1,day:true,prop:p}); return p; }
const BFPICS=new Map();
function bfHouse(x,y,f=[0,1]){ '@later'; SHARED.PNAME='butterfly house'; const r=rect(x,y,f,.64,.44), wd=AP.walnut, net=[70,74,70], fr=[40,38,34], B=[];
  B.push(fb(r,0,1,0,1,24,26,wd,(s,t,z,len)=>wood(437,wd,t,z,len),()=>sh(wd,1.1),{foot:1}),fb(r,.06,.94,.08,.92,6,7,wd,null,null,{foot:1}));
  for(const [t,d] of [[.02,.04],[.92,.04],[.02,.88],[.92,.88]])B.push(fb(r,t,t+.06,d,d+.08,0,24,sh(wd,.85),null,null,{foot:1}));
  B.push(fb(r,.04,.96,.06,.94,26,29,[92,70,48],null,(t,d)=>hash(Math.floor(t*30),Math.floor(d*20),439)<.6?[70,110,52]:[86,64,42],{foot:1}));
  for(const [t,d,z,h,c] of [[.25,.3,29,9,AP.leaf],[.3,.65,29,12,AP.leafD],[.78,.7,29,8,AP.leaf],[.7,.28,29,6,AP.leafD]])
    B.push(fb(r,t-.1,t+.1,d-.12,d+.12,z,z+h,c,(s,tt,zz)=>hash(Math.floor(tt*12),Math.floor(zz),441)<.35?null:hash(Math.floor(tt*12),Math.floor(zz),443)<.3?sh(c,.8):c,()=>sh(c,1.1),{foot:1,nb:1}));
  B.push(fb(r,.48,.52,.45,.55,29,44,[110,84,58],null,null,{foot:1}),fb(r,.36,.6,.47,.53,43,44,[110,84,58],null,null,{foot:1}),
    fb(r,.56,.68,.18,.32,29,31,[236,130,70],null,(t,d)=>Math.hypot(t-.5,d-.5)<.2?[250,214,90]:[236,130,70],{foot:1}));
  const mesh=(s,t,z,len)=>{ const a=Math.floor(t*len*FP); return a<1||a>=Math.floor(len*FP)-1||z<1||z>=26?fr:a%3===0&&Math.floor(z)%3===0?net:null; };
  B.push(fb(r,.03,.97,.05,.95,29,56,fr,mesh,(t,d)=>Math.min(t,1-t,d,1-d)<.03?fr:(Math.floor(t*15)+Math.floor(d*10))%2?null:net,{foot:1,nb:1}));
  const p=prop(B,null,{lifeKSet:2}), S={b:null,t:-1,Lc:[1,1,1],lcAt:-9};
  const perch=[[.25,.3,39],[.3,.65,42],[.78,.7,38],[.7,.28,36],[.4,.5,45],[.6,.5,45],[.62,.25,32],[.12,.5,48],[.88,.5,48],[.5,.12,50]];
  const W=(t,d)=>r.at(t,d);
  p.lifeDraw=(D,Wd,Hh,ox,oy,t,K)=>{ const ks=p.bf||[12,13], night=typeof CLOCK!=='number'||CLOCK<6.5*60||CLOCK>=19.5*60;
    if(!S.b)S.b=ks.map((k,i)=>({k,at:i*4,to:i*4,t0:t,dur:0,until:t+2+i*3,fx:1}));
    if(t-S.lcAt>1){ S.lcAt=t; const env=envNear(x,y); S.Lc=env?lightAt(env,x,y,(LVZ(p.lv)+42)/24,null).map(v=>.4+.6*Math.max(v,CHARMIN)):[1,1,1]; }
    S.b.forEach((b,i)=>{ let pose=2, P, Pt=perch[b.to];
      if(b.dur&&t<b.t0+b.dur){ const u=(t-b.t0)/b.dur, A=perch[b.at], C=perch[b.to], hump=Math.sin(Math.PI*u)*7, zig=Math.sin(u*Math.PI*5)*.06;
        P=[A[0]+(C[0]-A[0])*u+zig*(C[1]-A[1]),A[1]+(C[1]-A[1])*u-zig*(C[0]-A[0]),A[2]+(C[2]-A[2])*u+hump+Math.sin(t*9+i)*1.2]; pose=[0,1,2,1][Math.floor(t*12+i)%4]; }
      else{ if(b.dur){ b.at=b.to; b.dur=0; } P=perch[b.at];
        if(!night&&t>b.until){ let n=Math.floor(hash(Math.floor(t*10),i,445)*perch.length); if(n===b.at||S.b.some(o=>o!==b&&(o.at===n||o.to===n)))n=(n+3)%perch.length;
          const A=perch[b.at], C=perch[n]; b.to=n; b.t0=t; b.dur=.9+Math.hypot(C[0]-A[0],C[1]-A[1])*2.4; b.until=t+b.dur+4+hash(Math.floor(t),i,447)*9; }
        else pose=!night&&hash(Math.floor(t/2.5),i,449)<.55?0:2; }
      const [wx,wy]=W(P[0],P[1]), [vx,vy]=vw(wx,wy), sxp=((vx-vy)*HW-ox)*K, syp=((vx+vy)*HH-P[2]-oy)*K, [vx2,vy2]=vw(...W(perch[b.to][0],perch[b.to][1])), [vxa,vya]=vw(...W(perch[b.at][0],perch[b.at][1]));
      if(b.dur)b.fx=(vx2-vy2)-(vxa-vya)<0?-1:1;
      const span=Math.max(7,Math.min(10,BF_KINDS[b.k][3]/35*2)), key=b.k+':'+pose+':'+K; let Q=BFPICS.get(key); if(!Q){ Q=bfPic(b.k,Math.max(4,Math.round(span*K)),pose); BFPICS.set(key,Q); }
      const L=S.Lc, x0=Math.round(sxp-Q.w/2), y0=Math.round(syp-Q.oy);
      for(let py=0;py<Q.h;py++)for(let px=0;px<Q.w;px++){ const c=Q.px[py*Q.w+(pose===2&&b.fx<0?Q.w-1-px:px)]; if(!c)continue; const X=x0+px, Y=y0+py; if(X<0||Y<0||X>=Wd||Y>=Hh)continue;
        const q=(Y*Wd+X)*4; D[q]=c[0]*L[0]; D[q+1]=c[1]*L[1]; D[q+2]=c[2]*L[2]; D[q+3]=255; } }); };
  return p; }
Object.assign(CATALOG,{'venetian blinds':(x,y)=>venetian(x,y),'venetian blinds, up':(x,y)=>venetian(x,y,undefined,1),'silk curtains':(x,y)=>silkCurtains(x,y),
  'silk curtains, loose':(x,y)=>silkCurtains(x,y,undefined,1),'trailing ivy':(x,y)=>ivy(x,y),'trailing ivy, long':(x,y)=>ivy(x,y,undefined,1),'candles':(x,y)=>candles(x,y),
  'two candles':(x,y)=>candles(x,y,undefined,undefined,2),'patterned rug':(x,y)=>patternedRug(x,y),'fiddle-leaf fig':(x,y)=>fig(x,y),'tea tray':(x,y)=>teaTray(x,y),
  'peg rail with a hat and a bag':(x,y)=>pegRail(x,y),'stack of books with a candle':(x,y)=>bookStack(x,y),'butterfly house':(x,y)=>bfHouse(x,y),'pothos shelf':(x,y)=>pothosShelf(x,y),'hanging pothos':(x,y)=>hangingPothos(x,y)});
{ const I=(no,name,price,desc,mat)=>({no:'P-7'+no,name,dept:'apartment',price,desc,mat});
  Object.assign(CAT_INFO,{
  'venetian blinds':I(30,'Venetian Blinds',40,'Cream slats on a rail, tilted half open: the daylight comes through in stripes. Hangs in a window.','aluminium, cord'),
  'venetian blinds, up':I(31,'Venetian Blinds (pulled up)',40,'The same blinds pulled up under their rail, for an open window.','aluminium, cord'),
  'silk curtains':I(32,'Silk Curtains',160,'Two panels of plum silk on a brass rail, tied back with gold cord.','silk, brass'),
  'silk curtains, loose':I(33,'Silk Curtains (loose)',160,'Plum silk hanging straight from a brass rail; it stirs when the air does.','silk, brass'),
  'trailing ivy':I(34,'Trailing Ivy',20,'English ivy along the top of a wall, its strands hanging down. Goes on a wall.','living'),
  'trailing ivy, long':I(35,'Trailing Ivy (long)',25,'English ivy along the top of a wall, its strands hanging well down. Goes on a wall.','living'),
  'candles':I(36,'Candles',12,'Three pillar candles on a brass dish, burning.','wax, brass'),
  'two candles':I(37,'Two Candles',8,'Two pillar candles on a brass dish, burning.','wax, brass'),
  'patterned rug':I(38,'Patterned Rug',220,'Purple and gold: a checked border, a gold lattice, a medallion round a rose diamond, fringed ends.','wool'),
  'fiddle-leaf fig':I(39,'Fiddle-Leaf Fig',45,'Big glossy leaves on a thin trunk, in a dark glazed pot.','ceramic, living'),
  'tea tray':I(40,'Tea Tray',30,'A walnut tray, a white teapot with a blue band, a cup of tea still steaming.','walnut, porcelain'),
  'peg rail with a hat and a bag':I(41,'Peg Rail',35,'Walnut, three pegs: a felt hat, a striped scarf and a canvas bag on them. Goes on a wall.','walnut, felt, wool, canvas'),
  'stack of books with a candle':I(42,'Stack of Books',20,'Five books every which way, a candle burning on top.','paper, wax'),
  'pothos shelf':I(44,'Pothos Shelf',40,'A pine board on two brackets, a pothos trailing off one end, three books. Goes on a wall.','pine, clay, living'),
  'hanging pothos':I(45,'Hanging Pothos',35,'A pothos in a terracotta pot in a macrame hanger, on an iron bracket on the wall, trailing. Goes on a wall.','clay, cotton, living'),
  'butterfly house':I(43,'Butterfly House',180,'A mesh cube on a walnut stand, moss, leaves and a flower of nectar inside, and two of the world\'s rarest butterflies.','walnut, mesh, living')}); }
for(const k of Object.keys(CAT_INFO))if(!KIND_OF[k])KIND_OF[k]=k;
})();

STOREK.bf={BF_KINDS,bfPic,bfSpan};
}

{
const MLK=(()=>{ const {rect,sub,fb,worn,metal}=STUDIO.kit, FP=24, H=2, lit=c=>Object.assign([...c],{e:1});
  const art=(W,HT,draw)=>{ '@later'; W=Math.ceil(W*H); HT=Math.ceil(HT*H); const a=new Array(W*HT).fill(null); draw((x,y,c)=>{ x=Math.floor(x); y=Math.floor(y); if(c&&x>=0&&y>=0&&x<W&&y<HT)a[y*W+x]=c; },(x0,y0,x1,y1,c)=>{ for(let y=Math.floor(y0);y<y1;y++)for(let x=Math.floor(x0);x<x1;x++)if(c&&x>=0&&y>=0&&x<W&&y<HT)a[y*W+x]=c; });
    return {W,HT,at:(x,y)=>x>=0&&y>=0&&x<W&&y<HT?a[y*W+x]:null}; };
  const onF=(A,ht,els)=>(s,t,z,len)=>s==='f'?A.at(Math.max(0,Math.floor((1-t)*len*FP*H-1e-6)),Math.floor((ht-z)*H)):els(s,t,z,len);
  const C={white:[226,228,230],whiteD:[170,176,182],glass:[150,196,236],shelf:[190,222,240],top:[224,198,142],topL:[238,216,166],wood:[148,108,58],woodD:[112,78,40],woodL:[172,130,76],
    red:[198,30,42],redD:[150,18,30],redL:[222,70,80],chrome:[178,180,186],chromeD:[118,120,126],black:[34,34,38],blackL:[62,62,68],screen:[46,58,78],screenL:[90,120,160],key:[72,72,78],mesh:[54,54,60],
    poster:[26,22,28],paper:[236,232,222],can:[70,170,80],bottle:[220,220,224],daruma:[200,40,40]};
  const bottles=[[60,140,70],[96,172,86],[150,90,40],[200,52,52],[66,120,200],[228,228,230],[214,170,60],[170,60,120]];
  function fridge(x,y,f=[1,0]){ '@later'; SHARED.PNAME='lounge fridge'; const r=rect(x,y,f,4.7,.6), HT=125, B=[], W=C.white;
    const fr=(s,t,z,len)=>{ const m=Math.min(t,1-t)*len*FP; if(z<6)return sh(W,.6); if(z>HT-7)return sh(W,1.04); if(s==='f'&&m>3&&z>10&&z<HT-10)return null; return worn(W,t,z,31); };
    B.push(fb(r,0,1,0,1,0,10,W,(s,t,z,len)=>z<2?sh(W,.5):z<4&&(Math.floor(t*len*FP/2)&1)?[60,62,66]:W,null,{}));
    B.push(fb(r,0,1,.9,1,10,HT,W,(s,t,z)=>s==='f'?lit(C.glass):worn(W,t,z,33),()=>W,{foot:1}));
    for(const [a,b] of [[0,.03],[.97,1]])B.push(fb(r,a,b,0,1,10,HT,W,(s,t,z)=>worn(W,t,z,35),()=>W,{foot:1}));
    B.push(fb(r,0,1,0,1,HT-7,HT,W,(s,t,z)=>worn(W,t,z,37),(t,d)=>d>.9||d<.1||t<.02||t>.98?C.whiteD:W,{foot:1}));
    for(const z of [10,58])B.push(fb(r,.03,.97,.06,.9,z,z+2,C.shelf,(s)=>s==='f'?lit([170,210,236]):C.shelf,()=>lit(C.shelf),{foot:1}));
    for(const z of [12,60])for(let i=0;i<16;i++){ const n=hash(i,z,41), c=bottles[Math.floor(n*8)], t0=.05+i*.057+n*.01, w=.03+hash(i,z,43)*.012, h=28+hash(i,z,45)*12;
      B.push(fb(r,t0,t0+w,.3,.75,z,z+h-6,c,(s,t,zz)=>zz>8&&zz<14?[236,232,220]:t<.3?sh(c,1.25):t>.8?sh(c,.7):c,()=>c,{foot:1}),fb(r,t0+w*.3,t0+w*.7,.4,.65,z+h-6,z+h,c,(s,t,zz)=>zz>4?[224,204,88]:sh(c,.9),()=>[224,204,88],{foot:1})); }
    B.push(fb(r,.02,.98,.02,.98,10,HT-7,W,fr,null,{foot:1}));
    B.push(fb(r,.78,.88,.3,.7,HT,HT+12,C.daruma,(s,t,z)=>z>4&&z<10&&Math.abs(t-.5)<.3?C.paper:z<2?C.redD:C.daruma,()=>C.daruma,{foot:1}),fb(r,.6,.68,.35,.65,HT,HT+9,[70,120,210],(s,t,z)=>z>7?[220,230,240]:[70,120,210],()=>[220,230,240],{foot:1}));
    const p=prop(B); LAMPS.push({own:1,room:1,x:r.cx+f[0]*.9,y:r.cy+f[1]*.9,z:60,r:3.4,c:[.5,.72,1],prop:p,day:true}); return p; }
  const barTop=(t,d,X,Y)=>{ const e=Math.min(t,1-t,d,1-d); return e<.03?C.woodL:sh(mt('wood',C.top),.96+.08*hash(Math.floor(X*12),Math.floor(Y*12),49)); };
  const barBody=r=>{ '@later'; const L=r.W, B=[], fw=(s,t,z)=>s==='b'||s==='f'?sh(C.woodD,s==='f'?.9:1):worn(mt('wood',C.wood),t,z,47), lo=x=>x/L, thin=lo(.11);
    B.push(fb(r,0,1,0,1,32,36,C.top,(s,t,z)=>z>2?C.topL:C.top,barTop,{foot:1}));
    B.push(fb(r,thin,1-thin,.1,.18,3,32,C.wood,fw,()=>C.wood,{foot:1}),fb(r,thin,1-thin,.14,.18,0,3,C.woodD,(s)=>sh(C.woodD,.8),()=>C.woodD,{foot:1}));
    const n=Math.max(1,Math.round(L*FP/32)), m=lo(4/FP);
    for(let i=0;i<n;i++)B.push(fb(r,thin+(1-2*thin)*i/n+m,thin+(1-2*thin)*(i+1)/n-m,.05,.1,6,29,C.wood,(s,t,z)=>s==='f'?sh(worn(mt('wood',C.wood),t,z+6,48),1.08):C.woodD,()=>C.woodL,{foot:1,nb:1}));
    for(const [a,b] of [[0,thin],[1-thin,1]])B.push(fb(r,a,b,.1,.98,0,32,C.wood,(s,t,z)=>worn(mt('wood',C.wood),t,z,46),()=>C.woodD,{foot:1}));
    for(const z of [2,15])B.push(fb(r,thin,1-thin,.18,.94,z,z+1.5,C.woodD,()=>sh(C.woodD,.85),()=>C.wood,{foot:1,nb:1}));
    for(let x=.2;x<L-.2;x+=.3){ const k=hash(Math.floor(x*10),1,111), gc=k<.5?[200,226,230]:[176,204,196], t0=lo(x);
      B.push(fb(r,t0,t0+lo(.08),.8+k*.06,.85+k*.06,16.5,16.5+(k<.3?6:5),gc,(s,t,z)=>t<.3?sh(gc,1.15):gc,()=>[236,244,244],{foot:1,nb:1})); }
    for(let x=.3;x<L-.25;x+=.42+hash(Math.floor(x*10),2,113)*.1){ const k=hash(Math.floor(x*10),3,115), c=bottles[Math.floor(k*8)], t0=lo(x);
      B.push(fb(r,t0,t0+lo(.09),.82,.88,3.5,10.5,c,(s,t,z)=>z>2&&z<5?[236,232,220]:t<.3?sh(c,1.25):c,()=>c,{foot:1,nb:1}),fb(r,t0+lo(.025),t0+lo(.065),.84,.86,10.5,13,c,null,()=>[224,204,88],{foot:1,nb:1})); }
    B.push(fb(r,thin,1-thin,.95,.98,26,27.5,C.chrome,(s,t,z)=>metal(C.chrome,t,z),()=>C.chrome,{foot:1,nb:1}));
    return B; };
  function bar(x,y,f=[1,0]){ SHARED.PNAME='lounge bar'; return prop(barBody(rect(x,y,f,5.3,1.4))); }
  function barEnd(x,y,f=[0,1]){ SHARED.PNAME='bar end counter'; const r=rect(x,y,f,2.2,1.4); return prop([...barBody(r),fb(r,.6,.7,.4,.55,36,46,C.can,(s,t,z)=>z>8?[200,210,200]:t<.3?sh(C.can,1.3):C.can,()=>[200,210,200],{foot:1})],null,{part:'lounge bar'}); }
  function stool(x,y){ '@later'; SHARED.PNAME='red bar stool'; const r=rect(x,y,[0,1],.7,.7), rd=(t,d)=>Math.hypot(t-.5,d-.5);
    return prop([fb(r,.15,.85,.15,.85,0,2,C.chromeD,null,(t,d)=>rd(t,d)<.35?C.chrome:null),fb(r,.44,.56,.44,.56,2,23,C.chrome,(s,t,z)=>metal(t<.4?sh(C.chrome,1.15):C.chrome,t,z),null,{foot:1}),
      fb(r,.05,.95,.05,.95,23,29,C.red,(s,t,z)=>z<2?C.redD:z>4?C.redL:C.red,(t,d)=>{ const q=rd(t,d); return q>.45?null:q>.4?C.redD:q<.15?C.redL:C.red; },{foot:1})]); }
  const monitor=(r,t0,t1,d,z0,B,wide=1)=>{ '@later'; const w=(t1-t0), sc=art(wide*24,16,(px,bx)=>{ bx(0,0,wide*48,32,C.black); bx(2,2,wide*48-2,28,lit(C.screen)); bx(5,5,wide*48-8,8,lit(C.screenL)); bx(5,10,wide*24,12,lit([70,96,130])); for(let i=0;i<4;i++)bx(8,14+i*3,8+hash(i,0,51)*wide*30,15+i*3,lit([120,150,190])); });
    B.push(fb(r,t0+w*.4,t0+w*.6,d-.03,d+.03,z0,z0+4,C.black,null,null,{foot:1}),fb(r,t0+w*.47,t0+w*.53,d-.02,d+.02,z0+4,z0+8,C.black,null,null,{foot:1}),
      fb(r,t0,t1,d-.02,d+.02,z0+8,z0+24,C.black,onF(sc,16,()=>C.black),()=>C.black,{foot:1})); };
  const keyboard=(r,t0,t1,d0,d1,z0,B)=>B.push(fb(r,t0,t1,d0,d1,z0,z0+1.5,C.black,null,(t,d,X,Y)=>(Math.floor(X*60)+Math.floor(Y*60))&1?C.key:C.black,{foot:1}));
  function pcDesk(x,y,f=[1,0]){ '@later'; SHARED.PNAME='PC desk'; const r=rect(x,y,f,2,.9), B=[], T=26, dk=(s,t,z)=>worn(C.black,t,z,53);
    B.push(fb(r,0,1,0,1,T-2,T,C.black,(s,t,z)=>z>1?C.blackL:C.black,()=>C.black)); for(const [a,b] of [[.03,.08],[.92,.97]])B.push(fb(r,a,b,.1,.9,0,T-2,C.black,dk,null,{foot:1}));
    monitor(r,.3,.7,.78,T,B); keyboard(r,.25,.75,.25,.5,T,B); B.push(fb(r,.82,.9,.3,.45,T,T+2,C.blackL,null,null,{foot:1})); return prop(B); }
  function officeChair(x,y,f=[1,0]){ '@later'; SHARED.PNAME='office chair'; const r=rect(x,y,f,.7,.7);
    return prop([fb(r,.1,.9,.1,.9,0,2,C.blackL,null,(t,d)=>{ const a=Math.atan2(d-.5,t-.5), q=Math.hypot(t-.5,d-.5); return q<.08||q<.4&&Math.abs(((a*5/Math.PI/2)%1+1)%1-.5)<.14?C.blackL:null; }),
      fb(r,.45,.55,.45,.55,2,16,C.black,null,null,{foot:1}),fb(r,.08,.92,.1,.9,16,21,C.black,(s,t,z)=>z>3?C.mesh:C.black,()=>C.mesh,{foot:1}),
      fb(r,.12,.88,.85,.95,21,50,C.black,(s,t,z)=>z<3?C.black:Math.min(t,1-t)<.08||z>26?C.black:C.mesh,()=>C.black,{foot:1}),
      fb(r,.02,.1,.3,.7,28,33,C.black,null,null,{foot:1}),fb(r,.9,.98,.3,.7,28,33,C.black,null,null,{foot:1})]); }
  function longDesk(x,y,f=[1,0]){ '@later'; SHARED.PNAME='mezzanine desk'; const r=rect(x,y,f,4,1), B=[], T=26, dk=(s,t,z)=>worn(C.black,t,z,55);
    B.push(fb(r,0,1,0,1,T-2,T,C.black,(s,t,z)=>z>1?C.blackL:C.black,()=>C.black)); for(const [a,b] of [[.02,.05],[.95,.98]])B.push(fb(r,a,b,.1,.9,0,T-2,C.black,dk,null,{foot:1}));
    monitor(r,.08,.3,.8,T,B); monitor(r,.34,.66,.8,T,B,1.4); monitor(r,.7,.92,.8,T,B); keyboard(r,.12,.3,.3,.5,T,B); keyboard(r,.4,.6,.3,.5,T,B); B.push(fb(r,.66,.72,.35,.48,T,T+2,C.blackL,null,null,{foot:1}));
    B.push(fb(r,.72,.98,.6,.95,T,T+40,C.black,(s,t,z)=>s==='f'&&z>30&&z<36&&t>.2&&t<.8?lit([80,200,120]):worn(C.black,t,z,57),()=>C.black,{foot:1})); return prop(B); }
  function gamingChair(x,y,f=[1,0]){ '@later'; SHARED.PNAME='gaming chair'; const r=rect(x,y,f,.8,.8), q=(t,d)=>Math.hypot(t-.5,d-.5);
    return prop([fb(r,.08,.92,.08,.92,0,2,C.blackL,null,(t,d)=>q(t,d)<.08||q(t,d)<.42&&Math.abs((((Math.atan2(d-.5,t-.5)*5/Math.PI/2)%1)+1)%1-.5)<.14?C.blackL:null),fb(r,.45,.55,.45,.55,2,14,C.black,null,null,{foot:1}),
      fb(r,.08,.92,.1,.9,14,22,C.black,(s,t,z)=>z>2&&z<6?C.mesh:C.black,()=>C.mesh,{foot:1}),fb(r,.1,.9,.84,.98,22,64,C.black,(s,t,z)=>Math.min(t,1-t)<.12?C.blackL:z>36?C.black:C.mesh,()=>C.black,{foot:1}),
      fb(r,.3,.7,.8,.98,64,72,C.black,null,null,{foot:1}),fb(r,0,.1,.3,.7,22,34,C.black,null,null,{foot:1}),fb(r,.9,1,.3,.7,22,34,C.black,null,null,{foot:1})]); }
  function floorBottle(x,y){ SHARED.PNAME='bottle'; const r=rect(x,y,[0,1],.16,.16), c=C.bottle; return prop([fb(r,.2,.8,.2,.8,0,10,c,(s,t,z)=>z>3&&z<6?[70,120,210]:t<.3?sh(c,1.1):sh(c,.9)),fb(r,.38,.62,.38,.62,10,14,c,null,null,{foot:1})]); }
  return {art,onF,lit,C,fridge,bar,barEnd,stool,pcDesk,officeChair,longDesk,gamingChair,floorBottle,rect,sub,fb,worn,metal}; })();
{
const THFONT={A:'.###.#...##...#######...##...##...#',B:'####.#...##...#####.#...##...#####.',C:'.#####....#....#....#....#.....####',E:'######....#....####.#....#....#####',
  G:'.#####....#....#..###...##...#.###.',H:'#...##...##...#######...##...##...#',I:'#####..#....#....#....#....#..#####',K:'#...##..#.#.#..##...#.#..#..#.#...#',
  M:'#...###.###.#.##.#.##...##...##...#',N:'#...###..##.#.##..###...##...##...#',O:'.###.#...##...##...##...##...#.###.',P:'####.#...##...#####.#....#....#....',
  R:'####.#...##...#####.#.#..#..#.#...#',S:'.#####....#.....###.....#....#####.',T:'#####..#....#....#....#....#....#..',U:'#...##...##...##...##...##...#.###.'};
const THFRONT=(()=>{ let f=null; const build=()=>{ '@later'; const W=480, H=392, a=new Array(W*H).fill(null), px=(c,z,col)=>{ c=Math.floor(c); z=Math.floor(z); if(c>=0&&c<W&&z>=0&&z<H)a[z*W+c]=col; };
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
function thOut(parts,o,more=[]){ '@later'; SHARED.PNAME='theatre front'; const x0=THX0; return prop([...parts.map(([u0,u1,z0,z1,d,side,top,foot])=>sided({x0:THX(u1),x1:THX(u0),y0:THY-d,y1:THY,z0,z1,c:side,foot:foot?1:0,top:()=>top||side,
  fs:(nx,ny,X,Y,z,k)=>{ if(ny<0){ const c=THFRONT(x0-X,z+z0); if(c)return c.e?c:sh(c,k); } return sh(side,k); }})),...more],null,o); }
const thFront=clip=>{ '@later'; const RB=[164,58,48], CR=[234,228,206], GR=[112,122,144], SL=[74,80,98], C=L=>L.map(p=>clip(p)).filter(Boolean);
  for(const [L,o,m] of [[[[0,4.73,0,99,.5,RB,[150,52,44],1],[0,4.83,99,111,.62,CR,[246,242,228]]]],[[[16.1,20,0,99,.5,RB,[150,52,44],1],[16,20,99,111,.62,CR,[246,242,228]]]],
    [[[6.1,14.4,98,134,.15,SL,[96,102,122]],[8.5,12.1,106,131,.2,[250,248,240],[250,248,240]]],{walk:true}],
    [[[4.73,16.1,92,152,.2,RB,[150,52,44],1],[4.4,16.1,152,168,.42,CR,[246,242,228]]],{walk:true}],
    [[[8.4,12.5,0,2,.35,[200,204,210],[214,218,222],1]],{walk:true}]]){ const ps=C(L); if(ps.length||(m&&m.length))thOut(ps,o,m); } };
function theatreScreen(S){ '@later'; SHARED.PNAME='cinema screen'; const b=S.m/24, y0=S.y-.06, Bk=[12,10,12], bk={c:Bk,top:()=>Bk,fi:()=>Bk,fj:()=>Bk,foot:0};
  const film=(x,z)=>{ const f=filmFrame(30), i=Math.min(FILMW-1,Math.max(0,Math.floor((x-S.x0)/(S.x1-S.x0)*FILMW))), j=Math.min(FILMH-1,Math.max(0,Math.floor((S.z1-z)/(S.z1-S.z0)*FILMH))), q=(j*FILMW+i)*3; return [f[q],f[q+1],f[q+2]]; };
  return prop([{x0:S.x0,y0,x1:S.x1,y1:S.y,z0:S.z0,z1:S.z1,foot:1,em:1,c:[200,200,196],top:()=>Bk,fi:()=>Bk,fj:film},
    {x0:S.x0-b,y0,x1:S.x1+b,y1:S.y,z0:S.z1,z1:S.z1+S.m,...bk},{x0:S.x0-b,y0,x1:S.x1+b,y1:S.y,z0:S.z0-S.m,z1:S.z0,...bk},
    {x0:S.x0-b,y0,x1:S.x0,y1:S.y,z0:S.z0,z1:S.z1,...bk},{x0:S.x1,y0,x1:S.x1+b,y1:S.y,z0:S.z0,z1:S.z1,...bk}],null,{high:true}); }
const VELVET=[138,20,34];
const fold=(u,z,f)=>sh(speck(VELVET,u,z/24,307),f*(.72+.28*Math.sin(u*Math.PI*5)**2));
function theatreDrape(x0,x1,S){ SHARED.PNAME='stage curtain';
  return prop([{x0,y0:S.y-.5,x1,y1:S.y,z0:0,z1:S.z1+S.m+44,c:VELVET,top:()=>sh(VELVET,.8),fi:(y,z)=>fold(y,z,.8),fj:(x,z)=>fold(x,z,1)}],null,{high:true}); }
function theatreValance(S){ '@later'; SHARED.PNAME='stage curtain'; const b=S.m/24, z0=S.z1+S.m, G=[188,146,58], fr=(u,z,f)=>z<z0+5?sh((Math.floor(u*24)&1)?G:sh(G,.7),f):fold(u,z,f);
  return prop([{x0:S.x0-b,y0:S.y-.6,x1:S.x1+b,y1:S.y,z0,z1:z0+44,foot:0,c:VELVET,top:()=>sh(VELVET,.8),fi:(y,z)=>fr(y,z,.8),fj:(x,z)=>fr(x,z,1)}],null,{walk:true,high:true}); }
const PLUSH=[150,22,36], SEATZ=10;
function theatreSeat(a,y1,w,end){ '@later'; SHARED.PNAME='cinema chair'; const y0=y1-.7, P=PLUSH, Dk=[26,20,22], Ar=[40,30,28], pl={c:P,top:()=>sh(P,1.18),fi:()=>sh(P,.66),fj:()=>sh(P,.84)};
  const arm=a=>({x0:a-.06,y0:y0+.08,x1:a+.06,y1:y1-.1,z0:0,z1:16,c:Ar,top:()=>[64,50,42],fi:()=>sh(Ar,.7),fj:()=>Ar});
  return prop([{x0:a+.08,y0:y0+.12,x1:a+w-.08,y1:y1-.08,z0:0,z1:4,c:Dk,top:()=>Dk,fi:()=>sh(Dk,.7),fj:()=>Dk},
    {x0:a+.09,y0:y0+.16,x1:a+w-.09,y1:y1-.03,z0:4,z1:SEATZ,foot:0,...pl},{x0:a+.08,y0,x1:a+w-.08,y1:y0+.18,z0:4,z1:30,foot:0,...pl,top:()=>sh(P,1.1)},arm(a),...(end?[arm(a+w)]:[])]); }
function theatreAisleLights(xs,ys){ SHARED.PNAME='aisle lights'; const A=[255,168,80], out=[];
  for(const x of xs)for(const y of ys)out.push({x0:x-.06,y0:y-.06,x1:x+.06,y1:y+.06,z0:0,z1:2,em:1,c:A,top:()=>A,fi:()=>A,fj:()=>A});
  return prop(out,null,{walk:true}); }
const FONT3={E:['111','100','110','100','111'],X:['101','101','010','101','101'],I:['111','010','010','010','111'],T:['111','010','010','010','010']};
function theatreExit(x,y){ '@later'; SHARED.PNAME='exit sign'; const x0=x-.6, x1=x+.6, z0=68, z1=80;
  const face=(u,z)=>{ const c=Math.floor((x1-u)/(x1-x0)*17)-1, r=Math.floor((z1-2-z)/1.6), L='EXIT'[Math.floor(c/4)], k=c%4;
    return c>=0&&c<16&&k<3&&r>=0&&r<5&&FONT3[L][r][k]==='1'?[255,70,48]:[52,8,8]; };
  return prop([{x0,y0:y,x1,y1:y+.1,z0,z1,foot:1,em:1,c:[52,8,8],top:()=>[30,6,6],fi:()=>[40,8,8],fj:(u,z)=>face(u,z)}],null,{high:true}); }
function theatrePort(x,y,z=296){ '@later'; SHARED.PNAME='projection port'; const W=[255,226,168], F=[24,20,18];
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
{
// the playhouse's street front (its inside is the playhouse's own, 151*)
const PFONT={...STOREK.theatre.THFONT,D:'####.#...##...##...##...##...#####.',F:'######....#....####.#....#....#....',L:'#....#....#....#....#....#....#####',V:'#...##...##...##...##...#.#.#..#...',
  Y:'#...##...#.#.#..#....#....#....#...',0:'.###.#...##..###.#.###..##...#.###.',1:'..#...##....#....#....#....#...###.',2:'.###.#...#....#...#...#...#...#####',
  4:'...#...##..#.#.#..#.#####...#....#.',6:'..##..#...#....####.#...##...#.###.',8:'.###.#...##...#.###.#...##...#.###.'};
const PLAYK=PLB=>{ '@later'; const PLMID=(PLB.x0+PLB.x1)/2;
const PFRONT=(()=>{ let o=null; const build=()=>{ const W=Math.round((PLB.x1-PLB.x0)*24), H=PLB.h, a=new Array(W*H).fill(null), px=(c,z,col)=>{ c=Math.floor(c); z=Math.floor(z); if(c>=0&&c<W&&z>=0&&z<H)a[z*W+c]=col; };
  const box=(c0,z0,c1,z1,col)=>{ for(let z=Math.floor(z0);z<z1;z++)for(let c=Math.floor(c0);c<c1;c++)px(c,z,col); }, U=x=>(x-PLB.x0)*24, lit=c=>{ const o=c.slice(); o.e=1; return o; };
  const text=(s,c,z,k,col,ol)=>{ for(const pass of ol?[0,1]:[1])[...s].forEach((ch,i)=>{ const g=PFONT[ch]; if(!g)return; for(let j=0;j<7;j++)for(let q=0;q<5;q++)if(g[j*5+q]==='#'){
      if(pass)box(c+(i*6+q)*k,z+(6-j)*k,c+(i*6+q+1)*k,z+(7-j)*k,col); else for(const [dx,dz] of [[-1,0],[1,0],[0,-1],[0,1]])box(c+(i*6+q)*k+dx,z+(6-j)*k+dz,c+(i*6+q+1)*k+dx,z+(7-j)*k+dz,ol); } }); };
  const tw=(s,k)=>(s.length*6-1)*k;
  const CREAM=[226,214,186], CREAMD=[188,174,146], GREEN=[34,58,48], GILT=[198,160,76], BULB=lit([255,226,150]);
  for(let z=0;z<H;z++)for(let c=0;c<W;c++){ const r=Math.floor(z/3), cc=c+(r&1)*3; px(c,z,z%3===0||cc%6===0?[92,38,32]:hash(Math.floor(cc/6),r,871)<.3?[132,58,48]:[118,50,44]); }
  box(0,0,W,8,[150,146,136]); box(0,7,W,9,[124,120,112]);
  for(const [c0,c1] of [[0,12],[W-12,W]]){ box(c0,8,c1,H-14,CREAM); for(let z=14;z<H-14;z+=10)box(c0,z,c1,z+1,CREAMD); }
  box(0,H-14,W,H,CREAM); box(0,H-14,W,H-12,CREAMD); for(let c=4;c<W;c+=10)box(c,H-10,c+5,H-6,CREAMD);
  const d0=U(PLMID-1.2), d1=U(PLMID+1.2); box(d0-4,0,d1+4,76,GREEN); box(d0-2,72,d1+2,76,GILT);
  for(const [x0,x1] of [[PLMID-3.9,PLMID-2.3],[PLMID+2.3,PLMID+3.9]]){ box(U(x0)-3,25,U(x1)+3,72,CREAM); box(U(x0)-4,24,U(x1)+4,26,CREAMD); }
  for(const [x0,x1] of [[PLMID-3.9,PLMID-2.3],[PLMID+2.3,PLMID+3.9]]){ box(U(x0),27,U(x1),70,lit([236,196,120])); box((U(x0)+U(x1))/2-1,27,(U(x0)+U(x1))/2+1,70,CREAM); box(U(x0),47,U(x1),49,CREAM); }
  const cw=96; box(W/2-cw,74,W/2+cw,86,[30,40,36]); box(W/2-cw,84,W/2+cw,87,GILT); for(let c=W/2-cw+2;c<W/2+cw;c+=6)px(c,75,BULB);
  const nm='A MIDSUMMER NIGHTS DREAM'; text(nm,(W-tw(nm,1))/2,77,1,lit([240,226,180]));
  const bw=tw('PLAYHOUSE',2)+18, b0=(W-bw)/2; box(b0,90,b0+bw,114,CREAM); box(b0-2,88,b0+bw+2,90,GILT); box(b0-2,114,b0+bw+2,116,GILT);
  for(let z=92;z<113;z+=5){ px(b0+2,z,BULB); px(b0+bw-3,z,BULB); }
  text('PLAYHOUSE',b0+9,100,2,[150,28,34],[90,16,20]); const ts='TAKE A SEAT'; text(ts,(W-tw(ts,1))/2,91,1,[120,90,40]);
  for(const c0 of [14,W-14-30]){ box(c0-2,16,c0+32,72,GILT); box(c0,18,c0+30,70,[46,74,62]);
    for(let z=18;z<70;z++)for(let c=c0;c<c0+30;c++)if(hash(c,z,881)<.12)px(c,z,[70,104,88]);
    for(let z=30;z<56;z++)for(let c=c0+3;c<c0+27;c++){ const a=Math.hypot(c-c0-14,z-43), b=Math.hypot(c-c0-19,z-46); if(a<10&&b>9)px(c,z,lit([244,232,190])); }
    for(const [sc,sz] of [[5,25],[24,58],[8,62],[26,30],[4,52]])px(c0+sc,sz,lit([250,240,170]));
    text('DREAM',c0+1,61,1,lit([236,222,176])); }
  return {W,H,a}; }; return {get W(){ return (o||(o=build())).W; },get H(){ return (o||(o=build())).H; },get a(){ return (o||(o=build())).a; }}; })();
const plAt=m=>plMark(PLAY.marks[m]);
function playFront(X,z,f){ const P=PFRONT, c=Math.floor((X-PLB.x0)*24),
  zz=Math.floor(z); if(c<0||c>=P.W||zz<0||zz>=P.H)return null; const o=P.a[zz*P.W+c]; if(!o)return null; if(o.e)return o; return sh(o,f); }
return {PLMID,PFRONT,playFront}; };
STOREK.play={PLAYK};
}
{
const HOLOK=[8,14,10], HOLOL=Object.assign([60,255,120],{e:1}), HOLOM=Object.assign([28,120,58],{e:1});
const holoLine=(a,b,w)=>{ const fa=a-Math.floor(a), fb=b-Math.floor(b); return fa<w||fa>1-w||fb<w||fb>1-w; };
function holoFloor(x,y){ if(holoLine(x,y,.025))return (Math.floor(x+.5)+Math.floor(y+.5))%4?HOLOM:HOLOL; return mt('holodeck',sh(HOLOK,1+.06*hash(Math.floor(x),Math.floor(y),601))); }
const holoWall=f=>(u,z)=>{ const a=u-Math.floor(u); return a<.025||a>.975||(z%24+24)%24<1?HOLOL:sh(HOLOK,f); };
STOREK.holo={HOLOK,HOLOL,HOLOM,holoFloor,holoWall};
}
let MUSTURN=null;
{ const MUSCAN=__DATA__("data/museum.json");
const MUS=(B=>{ const mid=(B.x0+B.x1)/2, hx0=mid-6, hx1=mid+6, by=B.y1-8, i=T;
  return {b:B,f:B,mid,hx0,hx1,by,side:[B.y0+4,B.y0+9],earth:[B.x0+2,B.x0+5],humans:[mid-3,mid+3],closed:[B.x1-5,B.x1-2],archZ:150,H:B.h-4,
    hall:{x0:hx0+i,x1:hx1-i,y0:B.y0+i,y1:by-i},west:{x0:B.x0+i,x1:hx0-i,y0:B.y0+i,y1:by-i},east:{x0:hx1+i,x1:B.x1-i,y0:B.y0+i,y1:by-i},
    earthR:{x0:B.x0+i,x1:hx0-i,y0:by+i,y1:B.y1-i},humansR:{x0:hx0+i,x1:hx1-i,y0:by+i,y1:B.y1-i},closedR:{x0:hx1+i,x1:B.x1-i,y0:by+i,y1:B.y1-i}}; })((()=>{ const MB0=WROW.mus||{x0:-18.3,x1:10.3,y0:-101,y1:-80,h:210}, TM=TURN(MB0,WP.museum&&WP.museum.face), ox=TM.q?840+OFFDX/BLDK-TM.cx:0; MUSTURN={T:TM,ox,street:MB0}; return {id:'lmusfront',...MB0,...(TM.q?{x0:TM.L.x0+ox,x1:TM.L.x1+ox,y0:TM.L.y0,y1:TM.L.y1}:{})}; })());   // the museum's front box stands in for the bank's width while the museum has no lot (5 Nov 2026)
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
function museumHallCol(x,y,r){ '@later'; const c=MUC, e=Math.min(x-r.x0,r.x1-x,y-r.y0,r.y1-y);
    if(e<.5)return mt('tiles',e<.06||Math.abs(e-.44)<.03?sh(c.verde,.8):cvNoise(x*3,y*3,1701)>.6?c.verdeL:c.verde);
    const s=1.5, i=Math.floor((x-r.x0-.5)/s), j=Math.floor((y-r.y0-.5)/s), u=x-r.x0-.5-i*s, v=y-r.y0-.5-j*s;
    if(u<.04||v<.04)return mt('tiles',c.grout);
    const b=(i+j)&1?c.marbleG:c.marble, n=cvNoise(x*1.6+i*7,y*1.6+j*5,1703)+cvNoise(x*5,y*5,1705)*.3;
    return mt('tiles',Math.abs(n-.72)<.012?c.vein:speck(b,x,y,1707)); }
function museumFloorCol(x,y){ '@later'; const c=MUC, k=musRoom(x,y), M=MUS;
  if(k==='hall')return museumHallCol(x,y,M.hall);
  if(k==='earthR'||k==='humansR'){ const w=1.2, d=.9, j=Math.floor(y/d), o=hash(j,0,1709)*w, i=Math.floor((x+o)/w), u=x+o-i*w, v=y-j*d;
    if(u<.04||v<.04)return mt('concrete',sh(c.flagD,.8));
    const n=cvNoise(x*1.3,y*1.3,1711)+(hash(i,j,1713)-.5)*.25+(hash(Math.floor(x*24),Math.floor(y*24),1715)-.5)*.06;
    return mt('concrete',n<.4?c.flagD:n<.62?c.flag:c.flagL); }
  const bw=.25, i=Math.floor(x/bw), u=x-i*bw, L=1.5, o=hash(i,0,1717)*L, j=Math.floor((y+o)/L), v=y+o-j*L;
  if(u<.03||v<.03)return mt('wood',c.seam);
  const n=hash(i,j,1719), b=n<.35?c.oak:n<.7?c.oakL:c.oakD, g=hash(Math.floor(x*24),Math.floor(y*6),1721);
  return mt('wood',g<.05?sh(b,.92):g>.96?sh(b,1.06):b); }
const MUP=(()=>{ let o=null; const mk=(nx,ny,at,a0,a1,z0,H,draw)=>{ '@later'; const u=(a)=>(nx?-a*nx:a*ny)*24, ua=u(a0), ub=u(a1), u0=Math.min(ua,ub), W=Math.round(Math.abs(ub-ua)), a=new Array(W*H).fill(null);
    draw((c,z,col)=>{ c=Math.floor(c); z=Math.floor(z); if(col&&c>=0&&c<W&&z>=0&&z<H)a[z*W+c]=col; },W,H); return {nx,ny,at,u0,z0,W,H,a}; };
  const TT=out=>(nx,ny,at,a0,a1,num,name,k)=>{ const M=MUS, c=MUC, h=k*7+16, z0=M.archZ+10; out.push(mk(nx,ny,at,a0,a1,z0,h,(put,W)=>{ const w=Math.max(muTW(name,k),muTW(num,1))+16, l=Math.floor((W-w)/2);
      for(let z=0;z<h;z++)for(let q=l;q<l+w;q++)put(q,z,z<1||z>=h-1||q===l||q===l+w-1?c.giltD:c.stoneL);
      muText(put,num,Math.floor((W-muTW(num,1))/2),h-11,1,c.giltD); muText(put,name,Math.floor((W-muTW(name,k))/2),3,k,c.gilt); })); };
  const bank=()=>{ const M=MUS, B=M.b, out=[]; TT(out)(0,1,B.y0+T,M.hall.x0,M.hall.x1,'SAVINGS · LOANS','THE BANK',2); return out; };
  const build=()=>{ '@later'; const M=MUS, c=MUC, B=M.b, out=[], title=TT(out);
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
  let ob=null; return {get all(){ return o||(o=build()); },get bank(){ return ob||(ob=bank()); }}; })();
const MUEG=(()=>{ const g={ankh:['.###.','#...#','#...#','.###.','#####','..#..','..#..','..#..'],eye:['.###...','#####..','#.#.##.','.###..#','..#...#','..#..#.'],
    owl:['.##..','####.','#.##.','####.','.###.','.###.','.#.#.','##.##'],water:['#...#...','.#.#.#.#','..#...#.'],reed:['..#','.##','.##','###','###','.##','.#.','.#.'],
    bread:['.###.','#####'],man:['.##..','.##..','.#...','####.','.###.','.####','#####']};
  const order=[['ankh',2],['eye',0],['owl',3],['water',0],['reed',1],['bread',2],['man',3],['water',0],['ankh',2],['reed',1],['owl',3],['bread',2]];
  return {g,order}; })();
function muEgypt(u,z){ '@later'; const c=MUC, H=MUS.H; if(z>=H-24&&z<H-12){ const a=((Math.floor(u)%6)+6)%6, zz=z-(H-24); if(a===0)return c.ink; if(zz>9)return a===3?c.ink:c.west; return [c.egRed,c.egBlue,c.egGreen][((Math.floor(u/6)%3)+3)%3]; }
  if(z>=H-12&&z<H-10)return c.ink;
  if(z>=124&&z<146){ if(z<126||z>=144)return c.egBlue; const n=Math.floor(u/12), [k,ci]=MUEG.order[((n%12)+12)%12], G=MUEG.g[k], a=Math.floor(u)-n*12-2, b=Math.floor(145-z)-2-(k==='water'?6:k==='bread'?7:0);
    if(b>=0&&b<G.length&&a>=0&&a<G[b].length&&G[b][a]==='#')return [c.egBlue,c.egRed,c.egGreen,c.ink][ci]; return null; }
  if(z<36)return z>=33?c.egRed:z>=8?c.ink:null;
  return null; }
function museumWall(q,nx,ny,X,Y,z,f,o){ '@later'; const M=MUS, c=MUC, at=nx?X:Y, u=(X*ny-Y*nx)*24, k=o&&o.k||musRoom(X+nx*.2,Y+ny*.2);
  for(const P of o&&o.P||MUP.all)if(P.nx===nx&&P.ny===ny&&Math.abs(at-P.at)<.05){ const cc=Math.floor(u-P.u0), zz=Math.floor(z-P.z0); if(cc>=0&&cc<P.W&&zz>=0&&zz<P.H){ const o=P.a[zz*P.W+cc]; if(o)return o.e?o:sh(o,f); } }
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
const MUBAN=(()=>{ let o=null; const build=()=>{ '@later'; const c=MUC, B=MUS.f, W=56, H=104, ban=[[B.x0+1.35,'EGYPT',[34,46,98]],[B.x0+4.2,'AFRICA',c.east],[B.x1-1.35,'ICE AGE',[70,62,58]]].filter((_,i)=>i!==1);
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
function muDoor(u,z){ '@later'; const c=MUC, a=Math.abs(u); if(z>=82||a>1.5)return null; if(z>=76||a>1.25)return z>=80||a>1.45?c.stoneD:c.stoneL;
  if(a<.03)return [40,30,20]; const p=a%1.2, q=z%36; if(p<.08||p>1.12||q<3||z>=74)return [96,72,40]; if(Math.abs(p-.2)<.04&&Math.abs(z-38)<3)return [200,166,90]; return q<5||q>31?[118,90,50]:[136,104,58]; }
function museumOutside(b,nx,ny,X,Y,z,f,cap){ '@later'; const c=MUC, u=(X*ny-Y*nx)*24, sx=b.id==='lmuscopy'?b.x0-MUS.f.x0:0;
  if((b.id==='lmusfront'||b.id==='lmuscopy')&&ny<0&&Math.abs(Y-b.y0)<.2){ const d=muDoor(X-(b.x0+b.x1)/2,z); if(d)return sh(d,f); }
  if(!b.plain&&ny<0&&Math.abs(Y-b.y0)<.2)for(const n of MUBAN.all){ const cc=Math.floor((n.x+sx-X)*24+n.W/2), zz=Math.floor(z-n.z0); if(cc>=0&&cc<n.W&&zz>=0&&zz<n.H){ const o=n.a[zz*n.W+cc]; if(o)return sh(o,f); } }
  if(z>=cap-4)return null;
  if(z<10)return sh(z<1?sh(c.granite,.8):speck(c.granite,u/24,z/24,1771),f);
  if(z>=cap-18)return sh(z>=cap-8?c.stoneL:z<cap-14?c.stoneD:Math.floor(u/5)%2?c.stoneD:c.stone,f);
  if(z<70){ const r=Math.floor((z-10)/15), uu=u+(r&1)*24, j=(z-10)%15; if(j<2||((uu%48)+48)%48<2)return sh(j<1?c.joint:sh(c.joint,.8),f); return sh(hash(Math.floor(uu/48),r,1773)<.3?c.stoneD:c.stone,f); }
  if(z<76)return sh(z<72?c.stoneD:c.stoneL,f);
  const r=Math.floor(z/13), uu=u+(r&1)*18; if(z%13<1||((uu%36)+36)%36<1)return sh(c.joint,f);
  return sh(hash(Math.floor(uu/36),r,1775)<.25?c.stoneD:c.stone,f); }
const MUK=(()=>{ const {FP,rect,sub,fb,worn,metal}=STUDIO.kit, c=MUC;
const art=(W,H,draw)=>{ const a=new Array(W*H).fill(null); draw((x,z,col)=>{ x=Math.floor(x); z=Math.floor(z); if(col&&x>=0&&z>=0&&x<W&&z<H)a[z*W+x]=col; },W,H); return (x,z)=>{ x=Math.floor(x); z=Math.floor(z); return x>=0&&z>=0&&x<W&&z<H?a[z*W+x]:null; }; };
const plane=(r,d0,d1,z0,H,pic,o)=>fb(r,0,1,d0,d1,z0,z0+H,c.ink,(s,t,z,len)=>s==='f'?pic(t*len*FP,z):s==='b'?pic((1-t)*len*FP,z):null,()=>null,{foot:0,...o});
const line=(put,x0,z0,x1,z1,col,w=1)=>{ const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(z1-z0)))); for(let i=0;i<=n;i++){ const x=x0+(x1-x0)*i/n, z=z0+(z1-z0)*i/n; for(let a=0;a<w;a++)for(let b=0;b<w;b++)put(Math.round(x-w/2+a),Math.round(z-w/2+b),col); } };
const ell=(put,cx,cz,rx,rz,col,fill=true,ring=.7)=>{ for(let z=Math.floor(cz-rz)-1;z<=cz+rz+1;z++)for(let x=Math.floor(cx-rx)-1;x<=cx+rx+1;x++){ const d=((x+.5-cx)/rx)**2+((z+.5-cz)/rz)**2; if(d<1&&(fill||d>ring))put(x,z,col); } };
const BONE={b:[104,80,58],l:[142,112,82],d:[64,48,36]};
const bone=(put,x0,z0,x1,z1,w,B=BONE)=>{ '@later'; const dx=x1-x0, dz=z1-z0, L=Math.hypot(dx,dz)||1, nx=-dz/L, nz=dx/L, sg=nz<0?-1:1;
  for(let z=Math.floor(Math.min(z0,z1)-w);z<=Math.max(z0,z1)+w;z++)for(let x=Math.floor(Math.min(x0,x1)-w);x<=Math.max(x0,x1)+w;x++){ const px=x+.5-x0, pz=z+.5-z0, t=(px*dx+pz*dz)/(L*L);
    const tt=Math.max(0,Math.min(1,t)), s=(px-dx*tt)*nx*sg+(pz-dz*tt)*nz*sg, h=w/2+(t<.08||t>.92?.8:0); if(Math.abs(s)>h||t<-.12||t>1.12)continue;
    put(x,z,s>h-1.2?B.l:s<-h+1.2?B.d:B.b); } };
const BRZ=[118,92,52], BRZL=[164,132,76], GLINT=[220,232,236];
const glassF=(s,t,z,len)=>{ const a=t*len*FP, g=((a+z)%34+34)%34; return g<1.2||g>4&&g<5?GLINT:null; };
const glassT=(t,d)=>{ const g=((t*40+d*30)%17+17)%17; return g<.7?GLINT:null; };
const label=(a,z,Z,W)=>{ const m=W/2; if(z<Z-14||z>Z-6||Math.abs(a-m)>9)return null; if(z<Z-13||z>Z-7||Math.abs(a-m)>8)return BRZ; return (z===Math.floor(Z-9)||z===Math.floor(Z-11))&&Math.abs(a-m)<6&&Math.floor(a)%3?[96,90,80]:[226,218,196]; };
function glassCase(r,Z,H,o={}){ '@later'; const cab=o.cab||[62,58,54], B=[];
  B.push(fb(r,0,1,0,1,0,Z,cab,(s,t,z,len)=>{ const a=t*len*FP; if(z<2)return sh(cab,.7); if(z>=Z-2)return z>=Z-1?BRZL:BRZ; if(s==='f'&&!o.noLabel){ const l=label(a,z,Z,len*FP); if(l)return l; } return worn(cab,t,z,7); },
    ()=>o.floor||[70,64,58]));
  if(o.back)B.push(o.back);
  const e=.035, rail=(t0,t1,d0,d1,z0,z1)=>fb(r,t0,t1,d0,d1,z0,z1,BRZ,(s,t,z)=>z>=z1-z0-1?BRZL:BRZ,()=>BRZL,{foot:0,nb:1});
  for(const [t,d] of [[0,0],[1-e/r.W*2,0],[0,1-e/r.D*2],[1-e/r.W*2,1-e/r.D*2]])B.push(rail(t,t+e/r.W*2,d,d+e/r.D*2,Z,Z+H));
  B.push(rail(0,1,0,e/r.D*2,Z+H-2,Z+H),rail(0,1,1-e/r.D*2,1,Z+H-2,Z+H),rail(0,e/r.W*2,0,1,Z+H-2,Z+H),rail(1-e/r.W*2,1,0,1,Z+H-2,Z+H));
  B.push(fb(r,0,1,0,1,Z,Z+H-2,GLINT,glassF,glassT,{foot:0,nb:1}));
  return B; }
function plinth(r,Z,col,o={}){ return fb(r,0,1,0,1,0,Z,col,(s,t,z,len)=>{ const a=t*len*FP; if(z<3)return sh(col,.7); if(z>=Z-1)return sh(col,1.1); if(s==='f'&&!o.noLabel){ const l=label(a,z,Z,len*FP); if(l)return l; } return worn(col,t,z,11); },()=>o.top||sh(col,1.06)); }
const MARB=[226,220,206], MARBD=[194,188,174], MARBL=[240,236,226];
function column(x,y,H){ '@later'; const s=.3, flute=sided({x0:x-s*.8,y0:y-s*.8,x1:x+s*.8,y1:y+s*.8,z0:12,z1:H-16,foot:0,nb:1,c:MARB,top:()=>MARBL,
    fs:(nx,ny,X,Y,z,k)=>{ const u=Math.floor((nx?Y:X)*24*1.4), q=((u%4)+4)%4; return sh(q===0?MARBD:q===2?MARBL:MARB,k*(z<2?.9:1)); }});
  const vol=sided({x0:x-s*1.25,y0:y-s*1.25,x1:x+s*1.25,y1:y+s*1.25,z0:H-16,z1:H-6,foot:0,c:MARB,top:()=>MARBL,
    fs:(nx,ny,X,Y,z,k)=>{ const u=(nx?Y-y:X-x)*24, a=Math.abs(u)-9, v=z-5, r=Math.hypot(a,v); if(Math.abs(u)<5)return sh(z>7?MARBL:MARB,k); const t=(Math.atan2(v,a)/(2*Math.PI)+r/3.2+8)%1; return sh(r<5&&t<.35?MARBD:MARB,k); }});
  return [{x0:x-s*1.3,y0:y-s*1.3,x1:x+s*1.3,y1:y+s*1.3,z0:0,z1:5,foot:1,c:MARBD,top:()=>MARB,fi:()=>sh(MARBD,.62),fj:()=>sh(MARBD,.8)},
    {x0:x-s*1.05,y0:y-s*1.05,x1:x+s*1.05,y1:y+s*1.05,z0:5,z1:12,foot:0,c:MARB,top:()=>MARBL,fi:(v,z)=>sh(z>7&&z<10?MARBL:MARB,.62),fj:(v,z)=>sh(z>7&&z<10?MARBL:MARB,.8)},
    flute,vol,{x0:x-s*1.35,y0:y-s*1.35,x1:x+s*1.35,y1:y+s*1.35,z0:H-6,z1:H,foot:0,c:MARBL,top:()=>MARBL,fi:()=>sh(MARB,.62),fj:()=>sh(MARB,.8)}]; }
function scanBoxes(name,r,z0){ '@later'; const S=MUSCAN[name], raw=atob(S.runs), sx=r.W/S.W, sy=r.D/S.D, B=[], T=S.pal.map(c=>({c,top:()=>c,fi:()=>sh(c,.62),fj:()=>sh(c,.8)}));
  for(let i=0;i+4<raw.length;i+=5){ const x=raw.charCodeAt(i), y=raw.charCodeAt(i+1), z=raw.charCodeAt(i+2), L=raw.charCodeAt(i+3), t=T[raw.charCodeAt(i+4)];
    const p=r.at(x/S.W,y/S.D), q=r.at((x+(S.k||1))/S.W,(y+(S.k||1))/S.D);
    B.push({x0:Math.min(p[0],q[0]),x1:Math.max(p[0],q[0]),y0:Math.min(p[1],q[1]),y1:Math.max(p[1],q[1]),z0:z0+z,z1:z0+z+L,foot:0,nb:1,...t}); }
  return B; }
return {FP,rect,sub,fb,worn,metal,art,plane,line,ell,bone,BONE,glassCase,plinth,column,label,scanBoxes,BRZ,BRZL,MARB,MARBD,MARBL}; })();
(()=>{ const {FP,rect,fb,worn,art,plane,line,ell,bone,BONE,plinth,column,BRZ,BRZL,MARB,MARBD,MARBL}=MUK, c=MUC;
function porticoSteps(x,y){ '@later'; SHARED.PNAME='museum portico steps'; const W=9, D=3;
  return prop([{x0:x-W/2,y0:y-D/2,x1:x+W/2,y1:y+D/2,z0:0,z1:1,foot:1,c:MARB,top:(X,Y)=>{ const v=Y-(y-D/2); if(v<1.2&&Math.abs(v%.4-.38)<.03||Math.abs(X-(x-W/2))<.05||Math.abs(X-(x+W/2))<.05)return mt('concrete',MARBD);
    const i=Math.floor((X-x+W)/1.2), j=Math.floor(v/.8); if(((X-x+W)%1.2)<.03||(v%.8)<.03&&v>1.2)return mt('concrete',sh(MARBD,.95)); return mt('concrete',hash(i,j,1801)<.4?sh(MARB,.96):MARB); },fi:()=>sh(MARBD,.62),fj:()=>sh(MARBD,.8)}],null,{walk:true,flat:true}); }
const portColumn=(x,y)=>{ SHARED.PNAME='museum column'; return prop(column(x,y,150)); };
const hallColumn=(x,y)=>{ SHARED.PNAME='museum column'; return prop(column(x,y,190)); };
function entablature(x,y,nm='MUSEUM OF EARTH',k=1,pn){ '@later'; SHARED.PNAME=pn||(k>1?'bank entablature':'museum entablature'); const W=8.8, r=rect(x,y,[0,-1],W,.9), Z=150, H=k>1?32:26, B=[];
  B.push(fb(r,0,1,0,1,Z,Z+H,MARB,(s,t,z,len)=>{ const a=(1-t)*len*FP, L=len*FP;
    if(z>=H-5)return z>=H-2?MARBL:Math.floor(a/4)%2?MARBD:MARB;
    if(z<10)return z%3===0?MARBD:z<3?sh(MARB,.96):MARB;
    if(k>1?s==='b':s==='f'){ const tw=muTW(nm,k), l=(L-tw)/2, cc=Math.floor(((s==='b'?L-a:a)-l)/k), zz=Math.floor((z-12)/k); if(cc>=0&&cc<tw/k&&zz>=0&&zz<7){ const g=MUF[nm[Math.floor(cc/6)]], q=cc%6; if(g&&q<5&&g[(6-zz)*5+q]==='#')return k>1?muLit([238,204,120]):[92,84,70]; } }
    return MARB; },()=>MARBL,{foot:1}));
  for(const t of [0,1-.9/W])B.push(fb(r,t,t+.9/W,1,2.9,Z,Z+H,MARB,(s,tt,z)=>z>=H-2?MARBL:z<10&&z%3===0?MARBD:MARB,()=>MARBL,{foot:1}));
  const PH=26, ped=(s,t,z,len)=>{ if(s!=='f'&&s!=='b')return null; const a=t*len*FP, L=len*FP, w=(1-z/PH)*L/2, d=Math.abs(a-L/2); if(d>w)return null;
    if(d>w-4||z<3)return d>w-2||z<1.5?MARBL:MARBD;
    const ex=(a-L/2)/13, ez=(z-14)/11, rr=ex*ex+ez*ez; if(rr<1){ const land=cvNoise(a/7+3,z/7,1803)>.55; return rr>.8?MARBD:land?MARBL:sh(MARB,.94); }
    return sh(MARB,.9); };
  B.push(fb(r,0,1,.1,.7,Z+H,Z+H+PH,MARB,ped,()=>null,{foot:0}));
  return prop(B,null,{high:true,walk:true}); }
function infoDesk(x,y){ '@later'; SHARED.PNAME='information desk'; const r=rect(x,y,[0,1],3,.8), H=30, wal=[84,58,40], nm='INFORMATION', B=[];
  B.push(fb(r,0,1,0,1,0,H-2,wal,(s,t,z,len)=>{ const a=(1-t)*len*FP, L=len*FP; if(z<2)return sh(wal,.6);
    if(s==='f'){ const tw=muTW(nm,1), l=Math.floor((L-tw)/2), cc=Math.floor(a-l), zz=Math.floor(z-15); if(cc>=-2&&cc<tw+2&&zz>=-2&&zz<9){ const g=cc>=0&&cc<tw&&zz>=0&&zz<7&&MUF[nm[Math.floor(cc/6)]], q=cc%6; return g&&q<5&&g[(6-zz)*5+q]==='#'?BRZL:[46,34,26]; }
      if(Math.floor(a)%24<1)return sh(wal,.8); }
    return worn(mt('wood',wal),t,z,13); }));
  B.push(fb(r,-.01,1.01,-.03,1.03,H-2,H,MARB,(s,t,z)=>z>=1?MARBL:MARB,(t,d,X,Y)=>cvNoise(X*3,Y*3,1805)>.7?MARBD:MARBL));
  B.push(fb(r,.08,.2,.4,.8,H,H+8,[200,196,186],(s,t,z)=>z%2?[200,190,160]:[150,170,190],()=>[214,208,190]));
  B.push(fb(r,.7,.86,.5,.75,H,H+12,[40,40,44],(s,t,z)=>s==='f'?(z>2&&t>.1&&t<.9?muLit([90,130,160]):[40,40,44]):[48,48,52],()=>[44,44,48]));
  B.push(fb(r,.5,.54,.3,.4,H,H+3,BRZL,null,()=>BRZL));
  return prop(B); }
function museumBench(x,y){ '@later'; SHARED.PNAME='museum bench'; const r=rect(x,y,[0,1],2,.6), L=[70,46,36], S=[34,34,36], B=[];
  for(const t of [.04,.92])B.push(fb(r,t,t+.04,.05,.95,0,12,S,null,()=>S));
  B.push(fb(r,0,1,0,1,12,17,L,(s,t,z)=>z<1?sh(L,.7):L,(t,d)=>{ const a=Math.floor(t*48), b=Math.floor(d*14); return (a%6===3&&b%4===2)?sh(L,.7):(a+b)%7===0?sh(L,1.08):L; }));
  return prop(B); }
const K={'museum portico steps':porticoSteps,'museum column':portColumn,'museum hall column':hallColumn,'museum entablature':entablature,'bank entablature':(x,y)=>entablature(x,y,'BANK',2),'art entablature':(x,y)=>entablature(x,y,'ART MUSEUM',2,'art entablature'),'information desk':infoDesk,'museum bench':museumBench};
for(const k in K){ CATALOG[k]=(x,y)=>K[k](x,y); KIND_OF[k]=k; }
})();
(()=>{ const {FP,rect,fb,worn,art,plane,line,ell,glassCase,plinth,BRZ,BRZL}=MUK, c=MUC;
const CLOTH=[34,40,58], CLOTHL=[44,52,72];
const board=(W,H,draw)=>art(W,H,(put,w,h)=>{ for(let z=0;z<h;z++)for(let x=0;x<w;x++)put(x,z,hash(x>>1,z>>1,1901)<.1?CLOTHL:CLOTH); draw(put,w,h); });
function rosetta(x,y){ '@later'; SHARED.PNAME='the Rosetta Stone'; const r=rect(x,y,[0,1],1.3,.9), Z=28, H=40, B=glassCase(r,Z,H,{cab:[52,50,48],floor:[58,54,50]});
  const G=[62,64,70], GL=[98,100,106], GD=[44,46,50], INK=[150,150,156], hs=[26,29,31,32,29,24], n=hs.length, w=.84/1.3, d0=.33, d1=.33+.32/.9;
  for(let i=0;i<n;i++){ const t0=.5-w/2+i*w/n, t1=t0+w/n, h=hs[i];
    B.push(fb(r,t0,t1,d0,d1,Z,Z+h,G,(s,t,z,len)=>{ const a=Math.floor((i+t)*len*FP), zz=Math.floor(z); if(zz>=h-1||(s==='l'&&i===0)||(s==='r'&&i===n-1))return GD;
        const v=Math.abs(zz-(h-4)-(a-10)*.25)<1&&a<18; if(v)return [168,120,116];
        if(s==='f'&&a>1&&a<20-1&&zz>0){ if(zz<11)return zz%2===0&&hash(a,zz,1903)<.55?INK:G;
          if(zz>=12&&zz<21)return zz%2===1&&hash(a>>1,zz,1905)<.6?INK:G;
          if(zz>=22&&zz<h-2)return (a%3<2&&zz%3<2)&&hash(a>>1,zz>>1,1907)<.7?INK:G; }
        return hash(a,zz,1909)<.08?GL:G; },()=>GD,{foot:0})); }
  return prop(B); }
function tablets(x,y){ '@later'; SHARED.PNAME='clay tablets'; const r=rect(x,y,[0,1],1.8,.6), Z=26, H=46;
  const back=board(Math.round(1.8*FP),H-2,(put,W,h)=>{ const wedge=(cx,cz,k,dir)=>{ for(let i=0;i<k*3;i++)for(let j=-i/2;j<=i/2;j++)put(dir?cx+i:cx+j,dir?cz+j:cz-i,[200,170,120]); };
    for(let i=0;i<5;i++){ wedge(8+i*8,34,2,1); wedge(10+i*8,26,2,0); } wedge(58,36,3,1); wedge(66,30,3,0); wedge(70,36,2,1); });
  const B=glassCase(r,Z,H,{cab:[52,50,48],back:MUK.plane(r,.86,.9,Z,H-2,back)});
  const clay=[150,112,76], clayL=[184,146,104], clayD=[110,80,54], tab=(t,w,h,col,face)=>{ B.push(fb(r,t-.012,t+.012,.4,.6,Z,Z+3,[40,40,42],null,()=>[50,50,52],{foot:0}));
      B.push(fb(r,t-w/2,t+w/2,.46,.54,Z+3,Z+3+h,col,(s,tt,z,len)=>{ const a=Math.floor(tt*len*FP), zz=Math.floor(z); if(s!=='f')return sh(col,.9); return face(a,zz,Math.round(len*FP))||col; },()=>sh(col,1.1),{foot:0})); };
  tab(.14,.17/1.8,4,clay,(a,z,W)=>z%2===0&&a>0&&a<W-1&&hash(a,z,1911)<.6?clayD:null);
  tab(.34,.14/1.8,3,clayL,(a,z,W)=>a%2===0&&z>0?clayD:null);
  tab(.52,.1/1.8,3,clay,(a,z)=>(a===1&&z===1)||(a===2&&z===2)?[60,44,30]:hash(a,z,1913)<.3?clayD:null);
  tab(.68,.09/1.8,3,[196,170,130],(a,z)=>z%2?[150,126,96]:null);
  B.push(fb(r,.8,.94,.4,.6,Z,Z+2,[40,40,42],null,()=>[50,50,52],{foot:0}),fb(r,.8,.94,.42,.58,Z+2,Z+5,[176,150,112],(s,t,z)=>Math.floor(t*12)%2&&z>1?[136,110,78]:[176,150,112],()=>[190,166,128],{foot:0}));
  return prop(B); }
function ishango(x,y){ '@later'; SHARED.PNAME='the Ishango bone'; const r=rect(x,y,[0,1],.6,.6), Z=34, H=30;
  const back=board(Math.round(.6*FP),H-2,(put,W,h)=>{ const bz=12, b0=1, b1=W-2; for(let x=b0;x<b1;x++)for(let z=bz-2;z<=bz+2;z++)put(x,z,z===bz+2?[170,140,100]:z===bz-2?[96,72,48]:[136,106,72]);
    put(b1,bz,[230,230,236]); put(b1+1,bz,[230,230,236]); put(b1,bz+1,[200,200,210]);
    let x=b0+1; for(const g of [3,6,4,8,10,5,5,7]){ for(let i=0;i<g&&x<b1-1;i++,x+=.6)put(Math.floor(x),bz+((i&1)?2:3),[60,44,30]); x+=1; } });
  const B=glassCase(r,Z,H,{cab:[52,50,48],back:MUK.plane(r,.86,.9,Z,H-2,back)});
  B.push(fb(r,.48,.52,.45,.55,Z,Z+5,BRZ,null,()=>BRZL,{foot:0}),fb(r,.36,.36+.11/.6,.47,.53,Z+5,Z+6,[110,82,54],(s,t)=>t>.85?[220,220,228]:[110,82,54],()=>[136,106,72],{foot:0}));
  return prop(B); }
function antikythera(x,y){ '@later'; SHARED.PNAME='the Antikythera mechanism'; const r=rect(x,y,[0,1],1.4,.8), Z=28, H=36;
  const back=board(Math.round(1.4*FP),H-2,(put,W,h)=>{ const gear=(cx,cz,R,spokes)=>{ for(let z=Math.floor(cz-R-2);z<=cz+R+2;z++)for(let x=Math.floor(cx-R-2);x<=cx+R+2;x++){ const dx=x+.5-cx, dz=z+.5-cz, rr=Math.hypot(dx,dz), a=Math.atan2(dz,dx);
        const tooth=rr<=R+1.6&&rr>R&&Math.floor((a+Math.PI)/(2*Math.PI)*Math.max(12,R*3))%2===0, rim=rr<=R&&rr>R-1.5, hub=rr<1.6, sp=rr<R&&spokes&&[0,1,2,3].some(k=>Math.abs(Math.sin(a-k*Math.PI/2))*rr<.8);
        if(tooth||rim||hub||sp)put(x,z,rr>R?[176,140,74]:[150,118,62]); } };
    gear(14,18,10,1); gear(29,24,5,0); gear(27,9,4,0); gear(38,16,6,1); gear(48,23,4,0); gear(50,10,5,0); gear(60,18,6,1); });
  const B=glassCase(r,Z,H,{cab:[52,50,48],back:MUK.plane(r,.86,.9,Z,H-2,back)}), V=[82,106,84], VL=[118,146,112], VD=[56,76,60];
  const frag=(t,w,h)=>B.push(fb(r,t,t+w,.4,.6,Z,Z+h,V,(s,tt,z,len)=>{ const a=Math.floor(tt*len*FP); return hash(a,Math.floor(z),1921)<.25?VL:hash(a,Math.floor(z),1923)<.15?VD:V; },(t2,d)=>hash(Math.floor(t2*20),Math.floor(d*10),1925)<.3?VL:V,{foot:0}));
  frag(.06,.18/1.4,5); frag(.26,.1/1.4,3); frag(.36,.08/1.4,3);
  B.push(fb(r,.56,.56+.34/1.4,.4,.4+.18/.8,Z,Z+6,[110,76,46],(s,t,z,len)=>{ if(s!=='f')return [110,76,46]; const a=t*len*FP; return z>1&&z<5&&Math.hypot(a-4,z-3)<2.4?[196,160,84]:[110,76,46]; },()=>[124,88,54],{foot:0}));
  return prop(B); }
const K={'the Rosetta Stone':rosetta,'clay tablets':tablets,'the Ishango bone':ishango,'the Antikythera mechanism':antikythera};
for(const k in K){ CATALOG[k]=(x,y)=>K[k](x,y); KIND_OF[k]=k; }
})();
(()=>{ const {FP,rect,fb,worn,art,plane,line,ell,glassCase,plinth,BRZ,BRZL}=MUK, c=MUC;
const GOLD=[214,170,64], GOLDL=[240,206,104], GOLDD=[160,118,40], LAP=[36,58,132], LAPD=[26,40,96];
const part=(B,r,zb)=>(x0,x1,y0,y1,z0,z1,col,paint,top)=>B.push(fb(r,.5+x0/r.W,.5+x1/r.W,y0/r.D,y1/r.D,zb+z0,zb+z1,col,paint?(s,t,z,len)=>paint(s,t*len*FP,z):null,
  top?(t,d)=>top((t-.5)*r.W,d*r.D):()=>sh(col,1.08),{foot:0}));
function tutMask(x,y){ '@later'; SHARED.PNAME='Tutankhamun\'s mask'; const r=rect(x,y,[0,1],.9,.9), Z=40, H=26, B=glassCase(r,Z,H,{cab:[40,36,34],floor:[30,28,28]});
  const m=rect(x,y,[0,1],.9,.9), P=part(B,m,Z+2), D0=.18, stripe=(s,a,z)=>Math.floor(z/1.5)%2?GOLD:LAP;
  B.push(fb(m,.44,.56,.44,.56,Z,Z+2,[30,28,28],null,()=>[36,34,34],{foot:0}));
  P(-.2,.2,D0,D0+.36,0,4,GOLD,(s,a,z)=>z>=3?GOLDL:[GOLD,LAP,[150,40,36],GOLD,[40,110,90]][Math.floor(z)%5],(u,v)=>Math.abs(u)<.1&&v<D0+.12?GOLD:[GOLD,LAP][Math.floor(Math.hypot(u,v-D0)*30)%2]);
  P(-.22,-.12,D0+.06,D0+.3,3,11,GOLD,stripe); P(.12,.22,D0+.06,D0+.3,3,11,GOLD,stripe);
  P(-.03,.03,D0-.02,D0+.08,1,6,LAP,(s,a,z)=>Math.floor(z)%2?LAP:GOLD);
  P(-.11,.11,D0,D0+.26,5,12,GOLD,(s,a,z)=>{ if(s!=='f')return GOLD; const u=a-2.64, zz=Math.floor(z);
    if(zz===4&&Math.abs(Math.abs(u)-1.3)<.6)return [20,18,22]; if(zz===5&&Math.abs(Math.abs(u)-1.3)<.9)return LAPD;
    if(zz===2&&Math.abs(u)<1)return GOLDD; if(zz===3&&Math.abs(u)<.6)return GOLDL; return GOLD; },(u,v)=>GOLDL);
  P(-.13,-.1,D0+.08,D0+.16,7,10,GOLD); P(.1,.13,D0+.08,D0+.16,7,10,GOLD);
  P(-.17,.17,D0+.03,D0+.5,11,14,GOLD,stripe,(u,v)=>Math.floor(Math.abs(u)*40+v*10)%2?GOLD:LAP);
  P(-.14,.14,D0+.26,D0+.52,4,12,GOLD,stripe,(u,v)=>GOLD);
  P(-.03,.03,D0-.03,D0+.03,12,15,GOLDL,(s,a,z)=>z>=2?[220,60,40]:GOLDL);
  return prop(B); }
function coffin(x,y){ '@later'; SHARED.PNAME='painted coffin'; const r=rect(x,y,[0,1],2.6,1), Z=18, H=22, B=glassCase(r,Z,H,{cab:[44,38,34],floor:[150,132,100]});
  const Y=[204,164,72], YD=[168,124,44], RED=[160,52,36], BLU=[40,70,120], GRN=[54,110,82], BLK=[34,30,28], SKN=[184,96,56];
  const seg=(t0,t1,w,h,top)=>B.push(fb(r,t0,t1,.5-w/2,.5+w/2,Z,Z+h,Y,(s,t,z,len)=>{ const a=Math.floor(t*len*FP); return z<1?YD:z>=h-1?YD:(a+Math.floor(z))%6===0?RED:(Math.floor(z)%4===1?BLU:Y); },(t,d)=>top(t0+(t1-t0)*t,d),{foot:0}));
  const lid=(T,d)=>{ const a=Math.floor(T*200), dd=Math.abs(d-.5);
    if(T>.88)return dd<.18&&T<.97?(T>.95?BLK:SKN):Math.floor(d*20)%2?BLU:Y;
    if(T>.8)return [RED,BLU,GRN,Y][Math.floor(T*90)%4];
    if(T>.68)return dd<.06?RED:Math.floor(dd*40+T*30)%3===0?BLU:Math.floor(dd*40)%2?GRN:Y;
    if(dd<.05)return a%3?BLK:Y;
    return a%9===0?RED:Math.floor(T*28)%2?(dd>.3?BLU:Y):(hash(a,Math.floor(d*12),2001)<.2?GRN:Y); };
  seg(.08,.3,.44,10,lid); seg(.3,.72,.56,13,lid); seg(.72,.86,.6,14,lid); seg(.86,.97,.52,15,lid);
  return prop(B); }
function warriors(x,y){ '@later'; SHARED.PNAME='terracotta warriors'; const W=5.6, r=rect(x,y,[0,1],W,1.6), EZ=8, B=[], CL=[150,140,128], CLL=[172,162,148], CLD=[116,106,96];
  const earth=[138,108,78]; B.push(fb(r,0,1,0,1,0,EZ,earth,(s,t,z)=>z>=EZ-1?[156,124,92]:hash(Math.floor(t*200),Math.floor(z),2011)<.2?[120,92,66]:earth,(t,d)=>hash(Math.floor(t*120),Math.floor(d*30),2013)<.25?[126,98,70]:earth));
  for(const t of [.02,.98])B.push(fb(r,t-.004,t+.004,0,.06,EZ,EZ+20,BRZ,null,()=>BRZL,{foot:0})); B.push(fb(r,.02,.98,0,.04,EZ+18,EZ+20,BRZ,null,()=>BRZL,{foot:0}));
  const clay=(k)=>(s,a,z)=>{ const n=hash(Math.floor(a),Math.floor(z),k); return n<.04?[150,60,50]:n<.07?[70,110,90]:n<.25?CLD:n>.9?CLL:CL; };
  const man=(tc,dc,kind,seed)=>{ const m=rect(r.at(tc,dc)[0],r.at(tc,dc)[1],r.f,.6,.5), P=part(B,m,EZ), cl=clay(seed);
    if(kind==='kneel'){ P(-.14,.14,-.05,.4,0,2,CLD); P(-.12,-.02,.1,.4,2,8,CL,cl); P(.02,.12,-.02,.18,2,14,CL,cl); P(-.15,.15,.12,.34,10,28,CL,cl);
      P(-.2,-.15,.12,.3,14,26,CL,cl); P(.15,.2,.05,.25,16,26,CL,cl); P(-.07,.07,.14,.3,28,36,CL,(s,a,z)=>s==='f'&&Math.floor(z)===5&&Math.abs(Math.abs(a-1.7)-.9)<.5?[60,54,48]:cl(s,a,z)); P(-.05,.03,.24,.32,36,39,CLD); return; }
    const tall=kind==='officer'?4:0;
    P(-.17,.17,-.02,.38,0,2,CLD);
    P(-.12,-.02,.08,.28,2,20,CL,cl); P(.02,.12,.08,.28,2,20,CL,cl);
    P(-.17,.17,.04,.32,18,28+tall,CL,(s,a,z)=>Math.floor(z)%3===0?CLD:cl(s,a,z));
    P(-.16,.16,.06,.3,28+tall,42+tall,CL,(s,a,z)=>kind!=='plain'&&Math.floor(z)%3===1&&Math.floor(a)%2?CLD:kind==='officer'&&s==='f'&&Math.abs(a-3.84)<1.2?[140,60,52]:cl(s,a,z));
    P(-.23,-.16,.1,.26,26+tall,42+tall,CL,cl); P(.16,.23,.04,.22,30+tall,42+tall,CL,cl);
    P(-.04,.04,.12,.22,42+tall,45+tall,CL);
    P(-.07,.07,.1,.28,45+tall,53+tall,CL,(s,a,z)=>{ const zz=Math.floor(z); if(s!=='f')return cl(s,a,z); if(zz===5&&Math.abs(Math.abs(a-1.7)-.9)<.5)return [60,54,48]; if(zz===3&&Math.abs(a-1.7)<.8)return CLD; return cl(s,a,z); });
    if(kind==='officer')P(-.08,.08,.08,.3,53+tall,57+tall,[96,88,82]); else P(.0,.08,.16,.26,53+tall,56+tall,CL);
  };
  man(.14,.4,'officer',2021); man(.38,.45,'armour',2023); man(.62,.42,'plain',2025); man(.86,.45,'kneel',2027);
  return prop(B); }
function suttonHoo(x,y){ '@later'; SHARED.PNAME='the Sutton Hoo helmet'; const r=rect(x,y,[0,1],.7,.7), Z=40, H=22, B=glassCase(r,Z,H,{cab:[40,36,34],floor:[30,28,28]});
  const P=part(B,r,Z+4), I=[96,98,104], T=[188,192,196], TD=[140,144,150], G=[206,164,72];
  B.push(fb(r,.47,.53,.47,.53,Z,Z+4,[30,28,28],null,()=>[36,34,34],{foot:0}));
  P(-.1,.1,.24,.48,3,9,I,(s,a,z)=>Math.floor(a/2+Math.floor(z/2))%2?T:TD,(u,v)=>Math.abs(u)<.015?G:Math.floor((u+.2)*30+v*20)%2?T:TD);
  P(-.075,.075,.22,.26,0,6,I,(s,a,z)=>{ if(s!=='f')return I; const u=a-1.8, zz=Math.floor(z); if(zz===4&&Math.abs(u)<1.9)return G; if(Math.abs(u)<.6&&zz>=1&&zz<4)return G; if(zz===1&&Math.abs(u)<1.6)return G; if(zz===3&&Math.abs(Math.abs(u)-1.1)<.5)return [20,18,20]; return TD; });
  P(-.11,-.075,.26,.4,0,5,T); P(.075,.11,.26,.4,0,5,T); P(-.09,.09,.44,.5,0,4,T,(s,a,z)=>Math.floor(z)%2?T:TD);
  return prop(B); }
function jadeSuit(x,y){ '@later'; SHARED.PNAME='jade burial suit'; const r=rect(x,y,[0,1],2.5,1), Z=18, H=18, B=glassCase(r,Z,H,{cab:[44,38,34],floor:[120,30,34]});
  const J=[[104,148,104],[122,164,118],[88,130,94],[136,160,128]], WI=[200,164,80], jade=(a,b)=>a%2===0&&b%2===0?WI:J[Math.floor(hash(a>>1,b>>1,2031)*4)];
  const bx=(t0,t1,d0,d1,h)=>B.push(fb(r,t0,t1,d0,d1,Z,Z+h,J[0],(s,t,z,len)=>jade(Math.floor(t*len*FP),Math.floor(z)),(t,d,X,Y)=>jade(Math.floor(X*24),Math.floor(Y*24)),{foot:0}));
  bx(.86,.97,.42,.58,6); bx(.84,.86,.46,.54,4); bx(.52,.84,.33,.67,7); bx(.54,.82,.27,.33,5); bx(.54,.82,.67,.73,5);
  bx(.5,.54,.27,.33,4); bx(.5,.54,.67,.73,4); bx(.12,.52,.36,.49,5); bx(.12,.52,.51,.64,5); bx(.06,.12,.35,.49,6); bx(.06,.12,.51,.65,6);
  return prop(B); }
const K={'Tutankhamun\'s mask':tutMask,'painted coffin':coffin,'terracotta warriors':warriors,'the Sutton Hoo helmet':suttonHoo,'jade burial suit':jadeSuit};
for(const k in K){ CATALOG[k]=(x,y)=>K[k](x,y); KIND_OF[k]=k; }
})();
(()=>{ const {FP,rect,fb,worn,art,plane,line,ell,bone,BONE,glassCase,plinth,BRZ,BRZL}=MUK, c=MUC;
const part=(B,r,zb)=>(x0,x1,y0,y1,z0,z1,col,paint,top)=>B.push(fb(r,.5+x0/r.W,.5+x1/r.W,y0/r.D,y1/r.D,zb+z0,zb+z1,col,paint?(s,t,z,len)=>paint(s,t*len*FP,z):null,
  top?(t,d)=>top((t-.5)*r.W,d*r.D):()=>sh(col,1.08),{foot:0}));
const CLOTH=[34,40,58], CLOTHL=[44,52,72], board=(W,H,draw)=>art(W,H,(put,w,h)=>{ for(let z=0;z<h;z++)for(let x=0;x<w;x++)put(x,z,hash(x>>1,z>>1,2101)<.1?CLOTHL:CLOTH); draw(put,w,h); });
const FOUND=[112,82,56], CAST=[214,204,180], FOUNDD=[84,60,40], CASTD=[184,174,150];
function lucy(x,y){ '@later'; SHARED.PNAME='Lucy'; const r=rect(x,y,[0,1],.9,.9), Z=14, H=46, B=glassCase(r,Z,H,{cab:[52,50,48],floor:[60,56,52]}), P=part(B,r,Z), o=.4;
  const pc=(f)=>f?FOUND:CAST, ribs=(s,a,z)=>Math.floor(z)%2?null:(a%3<1?CASTD:FOUND);
  for(const [sx,f] of [[-1,1],[1,0]]){ const X=(a,b)=>sx<0?[-b,-a]:[a,b];
    P(...X(.02,.07),o,o+.1,0,1,pc(f)); P(...X(.03,.05),o+.03,o+.06,1,9,pc(f)); P(...X(.04,.06),o+.03,o+.06,9,13,pc(f)); P(...X(.055,.075),o+.03,o+.06,13,17,pc(f));
    P(...X(.11,.13),o+.03,o+.06,19,27,pc(f)); P(...X(.12,.14),o+.03,o+.06,13,19,pc(f)); P(...X(.12,.15),o+.02,o+.07,11,13,pc(f)); }
  P(-.1,.1,o+.01,o+.08,16,19,FOUND,(s,a,z)=>s==='f'&&Math.abs(a-2.4)<.9&&z>1?null:(a<2.4?FOUND:CAST));
  P(-.012,.012,o+.06,o+.08,19,28,FOUND); P(-.09,.09,o-.02,o+.08,20,27,FOUND,ribs,()=>null);
  P(-.13,.13,o+.03,o+.05,27,28,CAST);
  P(-.05,.05,o-.03,o+.08,28,33,CAST,(s,a,z)=>s==='f'&&Math.floor(z)===2&&Math.abs(Math.abs(a-1.2)-.6)<.4?[40,36,32]:CAST); P(-.04,.04,o-.03,o+.03,27,29,FOUND);
  return prop(B); }
function laetoli(x,y){ '@later'; SHARED.PNAME='Laetoli footprints'; const W=3.2, r=rect(x,y,[0,1],W,1.2), Z=12, H=8, B=glassCase(r,Z,H,{cab:[52,50,48]});
  const ASH=[150,142,128], ASHD=[110,102,90], ASHL=[170,162,148];
  B.push(fb(r,.02,.98,.06,.94,Z,Z+1,ASH,null,(t,d,X,Y)=>{ const u=t*W, v=d*1.2, n=hash(Math.floor(u*24),Math.floor(v*24),2103);
      for(const [vc,s0] of [[.42,0],[.78,.2]]){ const k=Math.round((u-s0)/.42), uc=s0+k*.42, vv=vc+(k&1?.06:-.06), du=(u-uc)/.11, dv=(v-vv)/.045;
        if(du*du+dv*dv<1)return du>.5?ASHD:sh(ASHD,1.08); if(Math.abs(u-uc-.13)<.03&&Math.abs(v-vv)<.05)return ASHD; }
      return n<.1?ASHD:n>.92?ASHL:ASH; },{foot:0}));
  return prop(B); }
function handAxes(x,y){ '@later'; SHARED.PNAME='hand axes'; const r=rect(x,y,[0,1],.9,.6), Z=30, H=26;
  const back=board(Math.round(.9*FP),H-2,(put,W,h)=>{ const cx=W*.62, cz=h/2; for(let z=0;z<h;z++)for(let q=0;q<W;q++){ const dx=(q+.5-cx)/7, dz=(z+.5-cz)/10; if(dx*dx+dz*dz*(dz>0?1.6:.7)>1)continue;
      const s=Math.floor(cvNoise(q/2.5,z/2.5,2105)*5); put(q,z,[[150,138,120],[128,116,98],[168,156,138],[110,100,86],[140,128,110]][s]); } });
  const B=glassCase(r,Z,H,{cab:[52,50,48],back:MUK.plane(r,.86,.9,Z,H-2,back)}), LAVA=[126,116,102];
  const pin=t=>B.push(fb(r,t-.01,t+.01,.45,.55,Z,Z+2,BRZ,null,()=>BRZL,{foot:0}));
  pin(.3); B.push(fb(r,.3-.13/.9,.3+.13/.9,.47,.53,Z+2,Z+8,LAVA,(s,t,z,len)=>{ const a=t*len*FP, m=len*FP/2, w=(z<2?.6:1-(z-2)/5)*m; if(Math.abs(a-m)>w)return null; return hash(Math.floor(a),Math.floor(z),2107)<.35?[104,96,84]:LAVA; },()=>null,{foot:0}));
  pin(.62); B.push(fb(r,.62-.05/.9,.62+.05/.9,.46,.54,Z+2,Z+5,[140,124,100],(s,t,z)=>z>2&&t>.5?[110,98,80]:[140,124,100],()=>[152,136,110],{foot:0}));
  return prop(B); }
function skulls(x,y){ '@later'; SHARED.PNAME='four skulls'; const W=2.4, r=rect(x,y,[0,1],W,.6), Z=26, H=30;
  const back=board(Math.round(W*FP),H-2,(put,w)=>{ line(put,4,6,w-5,6,[200,190,160],1); for(let i=0;i<=3;i++)line(put,4+i*(w-9)/3,4,4+i*(w-9)/3,8,[200,190,160],1); });
  const B=glassCase(r,Z,H,{cab:[52,50,48],back:MUK.plane(r,.86,.9,Z,H-2,back)}), P=part(B,r,Z+3);
  const sk=(cx,w,d,h,brow,col)=>{ const cd=col===FOUND?FOUNDD:CASTD; B.push(fb(r,.5+(cx-.012)/W,.5+(cx+.012)/W,.45,.55,Z,Z+3,[40,40,42],null,()=>[50,50,52],{foot:0}));
    P(cx-w/2,cx+w/2,.24,.24+d,1,1+h,col,(s,a,z)=>{ const zz=Math.floor(z); if(s==='f'&&zz===Math.floor(h*.45)&&Math.abs(Math.abs(a-w*12)-w*5)<w*3)return [36,30,26]; if(s==='f'&&zz===Math.floor(h*.6)&&brow)return cd; return col; });
    P(cx-w*.35,cx+w*.35,.2,.3,0,Math.max(2,h*.4),col,(s,a,z)=>z<1?cd:col); };
  sk(-.9,.12,.15,5,0,CAST); sk(-.3,.16,.2,6,1,FOUND); sk(.3,.18,.24,6,2,FOUND); sk(.9,.17,.2,8,0,CAST);
  return prop(B); }
function mammoth(x,y){ SHARED.PNAME='woolly mammoth'; const S=MUSCAN.mammoth, r=rect(x,y,[0,1],S.W/FP+.5,S.D/FP+.5), Z=8, B=[plinth(r,Z,[36,34,34],{top:[46,44,42]})];
  return prop(B.concat(MUK.scanBoxes('mammoth',rect(x,y,r.f,S.W/FP,S.D/FP),Z))); }
function meteorite(x,y){ '@later'; SHARED.PNAME='Gibeon meteorite'; const r=rect(x,y,[0,1],.7,.7), Z=26, B=[plinth(r,Z,[96,94,92])], P=part(B,r,Z);
  const FE=[78,72,66], FED=[52,48,44], FEL=[150,150,154], skin=(s,a,z)=>{ if(s==='f'&&z>1&&z<8&&a>2&&a<13){ const u=Math.floor(a), zz=Math.floor(z); return (u+zz)%5===0||(u-zz+40)%5===0||zz%4===0?[124,128,134]:[176,180,186]; }
    return hash(Math.floor(a/2),Math.floor(z/2),2111)<.3?FED:FE; };
  P(-.3,.3,.14,.56,0,6,FE,skin); P(-.24,.26,.18,.52,6,9,FE,skin,(u,v)=>Math.hypot(u,v-.35)<.12?FEL:hash(Math.floor(u*24),Math.floor(v*24),2113)<.3?FED:FE); P(-.12,.14,.24,.44,9,10,FE,skin,()=>FEL);
  return prop(B); }
const K={'Lucy':lucy,'Laetoli footprints':laetoli,'hand axes':handAxes,'four skulls':skulls,'woolly mammoth':mammoth,'Gibeon meteorite':meteorite};
for(const k in K){ CATALOG[k]=(x,y)=>K[k](x,y); KIND_OF[k]=k; }
})();
STOREK.museum={MUS,MUP,museumWall,museumFloorCol,museumOutside,museumHallCol,turn:MUSTURN,font:MUF};
}

{ const {art,onF,lit,C,rect,sub,fb,worn,metal}=MLK, FP=24;
  function vending(x,y,f=[1,0],red=0){ '@later'; SHARED.PNAME=red?'vending machine, red':'vending machine, white'; const r=rect(x,y,f,1.1,.85), B=red?[116,30,36]:[220,222,226], BD=sh(B,.7), cans=[[220,60,60],[70,140,220],[240,200,60],[90,180,90],[230,230,230],[240,130,60]];
    const IN=lit([200,210,222]), body=(s,t,z)=>z<3?BD:worn(B,t,z,105), hole=[22,22,26], fb1=(t0,t1,d0,d1,z0,z1,c,pt,tp,o)=>fb(r,t0,t1,d0,d1,z0,z1,c,pt,tp,{foot:1,...o}), Q=[];
    Q.push(fb(r,0,1,.04,1,0,3,BD,null,()=>BD));
    for(const [a,b,inn] of [[0,.06,'r'],[.94,1,'l']])Q.push(fb1(a,b,.04,1,3,62,B,(s,t,z)=>s===inn&&z>=19&&z<53?IN:body(s,t,z+3),()=>sh(B,.96)));
    Q.push(fb1(.06,.94,.94,1,3,62,B,(s,t,z)=>s==='f'?lit([228,236,244]):body(s,t,z+3),()=>sh(B,.96)));
    Q.push(fb1(.06,.94,.04,.94,56,62,B,(s,t,z)=>s==='f'&&z<3&&t<.78?[60,60,66]:worn(B,t,z+56,105),()=>sh(B,.96)));
    Q.push(fb1(.74,.94,.06,.94,22,56,B,(s,t,z)=>s==='l'?IN:worn(B,t,z+22,105),()=>B));
    Q.push(fb1(.77,.92,.04,.06,26,54,BD,null,()=>BD,{nb:1}));
    for(let i=0;i<5;i++){ const z=49-i*5, c=lit(i===0?[240,80,80]:[80,220,120]); Q.push(fb1(.8,.89,.02,.04,z,z+2,c,null,()=>c,{nb:1})); }
    Q.push(fb1(.8,.89,.03,.04,27,29,hole,null,()=>hole,{nb:1}));
    Q.push(fb1(.06,.74,.04,.94,22,25,B,(s,t,z)=>worn(B,t,z+22,105),(t,d)=>d<.1?B:IN));
    Q.push(fb1(.06,.94,.04,.36,14,22,B,(s,t,z)=>s==='f'&&z>3&&z<6&&t>.1&&t<.88?BD:worn(B,t,z+14,105),()=>B));
    Q.push(fb1(.06,.94,.04,.36,3,6,B,body,(t,d)=>d>.1&&t>.19&&t<.83?hole:B));
    for(const [a,b] of [[.06,.19],[.83,.94]])Q.push(fb1(a,b,.04,.36,6,14,B,(s,t,z)=>worn(B,t,z+6,105),()=>B));
    Q.push(fb1(.19,.83,.32,.36,6,14,hole,()=>hole,()=>hole));
    Q.push(fb1(.2,.82,.05,.07,10,14,sh(BD,.85),null,()=>BD,{nb:1}));
    for(let s=0;s<3;s++){ const z=27+s*10; Q.push(fb1(.07,.73,.1,.88,z-1,z,[160,164,170],null,()=>lit([180,184,190]),{nb:1}));
      for(let i=0;i<4;i++)for(const [d0,row] of [[.14,0],[.48,1]]){ const c=lit(cans[Math.floor(hash(i,s+row*7,103)*6)]), t0=.11+i*.155;
        Q.push(fb1(t0,t0+.09,d0,d0+.14,z,z+7,c,(ss,t,zz)=>zz>5?lit([200,200,206]):t<.35?lit(sh(c,1.3)):c,()=>lit([200,200,206]),{nb:1})); } }
    Q.push(fb1(.06,.74,.04,.05,25,56,B,(s,t,z,len)=>{ const g=Math.floor(t*len*FP)+Math.floor(z); return s==='f'&&z>14&&z<26&&(g===30||g===35)?lit([240,246,252]):null; },()=>null,{nb:1}));
    const p=prop(Q); LAMPS.push({own:1,x:r.cx+f[0]*.8,y:r.cy+f[1]*.8,z:30,r:2.4,c:[.9,.95,1],prop:p,day:true}); return p; }

  CATALOG['vending machine, white']=(x,y,f)=>vending(x,y,f||[1,0],0); CATALOG['vending machine, red']=(x,y,f)=>vending(x,y,f||[1,0],1); }
}
SHARED.BOD.STOREK=STOREK;

{
const LBLD=[{id:'ldungeon',...CASTLE.hall,st:1}], CATALOG={}, CAT_INFO={}, CAT_DEPTS=[], LAMPS=[];
const {DGP,dgnLit,DGN,dgnWeb,dgnIvy,dgnRidge,dgnFoot,dgnStone,dgnDamp,dungeonWall,dungeonFloorCol}=dgnRoom(LBLD);
const KPP={ash:[[138,130,116],[150,142,126],[144,138,128],[158,148,130],[132,126,116]],mortar:[104,98,88],trim:[184,174,150],trimD:[160,150,128],dark:[16,14,18],
  moss:[74,92,52],mossD:[56,74,44],mould:[96,100,84],lichen:[156,152,112],lead:[96,104,110],leadL:[112,120,126]};
function castleStone(u,z,seed){ '@later'; const j=Math.floor(z/12), zz=z-j*12, L=20+Math.floor(hash(j,1,seed)*15), o=hash(j,0,seed)*L, k=Math.floor((u+o)/L), uu=(u+o)-k*L;
  if(zz<1||uu<1)return KPP.mortar;
  let c=KPP.ash[Math.floor(hash(j,k,seed+1)*5)]; if(zz>=11)c=sh(c,1.08); else if(zz<2)c=sh(c,.9);
  const g=hash(Math.floor(u),Math.floor(z),seed+2); if(g<.06)c=sh(c,.88); else if(g>.97)c=sh(c,1.07); return c; }
function castleWeather(c,u,z,seed){ '@later'; const s=cvNoise(u/9,z/150,seed+7); if(s>.64)c=sh(c,1-(s-.64)*.9);
  if(hash(Math.floor(u/2),Math.floor(z/2),seed+8)<.004)return KPP.lichen;
  if(z<30){ const p=(30-z)/30, n=hash(Math.floor(u/2),Math.floor(z/2),seed+9); if(n<p*p*.5)return n<p*.1?KPP.moss:KPP.mossD; if(n>1-p*.15)return KPP.mould; c=sh(c,1-p*.22); }
  return c; }
function castleArch(du,z,zs,r,P){ '@later'; const a=Math.abs(du), w=6;
  if(z>=zs){ const d=Math.hypot(du,z-zs); if(d<r)return P.dark; if(d>=r+w)return null; const t=Math.atan2(z-zs,du)/(Math.PI/9), k=Math.floor(t); return t-k<.1||d>=r+w-1?P.mortar:k&1?P.a:P.b; }
  if(a>=r&&a<r+w){ const j=Math.floor(z/12); return z-j*12<1?P.mortar:(j&1)?P.a:P.b; }
  return null; }
const KARCH={out:{dark:KPP.dark,mortar:KPP.mortar,a:KPP.trim,b:KPP.trimD},in:{dark:DGP.dark,mortar:DGP.mo,a:DGP.hi,b:DGP.st[1]}};
const KMK={};
(()=>{
const C=KPP;
const kTop=(X,Y)=>{ const j=Math.floor(Y*2.5), o=(j&1)*.2, i=Math.floor(X*2.5+o), fx=X*2.5+o-i, fy=Y*2.5-j; if(fx<.07||fy<.07)return C.mortar; return sh(C.ash[Math.floor(hash(i,j,4301)*5)],1.04); };
function kb(x0,y0,x1,y1,z0,z1,seed,o={},paint){ return sided({x0,y0,x1,y1,z0,z1,c:C.ash[1],foot:z0===0?1:0,top:kTop,...o,
  fs:(nx,ny,X,Y,zr,k)=>{ const u=(nx?Y:X)*24, z=zr+z0, p=paint&&paint(nx,ny,u,z,X,Y); if(p)return p.e?p:sh(p,k); return sh(castleWeather(castleStone(u,z,seed),u,z,seed),k); }}); }
function merlons(B,axis,a,b,s,e,z0,seed){ const n=Math.max(1,Math.round((e-s)/.85)), step=(e-s)/n;
  for(let i=0;i<n;i++){ const m0=s+i*step+step*.18, m1=m0+step*.64; B.push(axis==='x'?kb(m0,a,m1,b,z0,z0+26,seed,{foot:0}):kb(a,m0,b,m1,z0,z0+26,seed,{foot:0})); } }
KMK.curtain=(ax,ay,bx,by,H,out)=>{ SHARED.PNAME='curtain wall'; const X=ay===by, t=.45, B=[], sd=Math.round(ax*7+ay*13), o=out[1]==='+'?1:-1;
  const [x0,y0,x1,y1]=X?[ax,ay-t,bx,ay+t]:[ax-t,ay,ax+t,by];
  const paint=(nx,ny,u,z)=>{ if((X?ny:nx)!==o)return null; const k=Math.floor(u/67), du=u-k*67-33;
    if(Math.abs(du)<1.5&&z>=118&&z<150)return C.dark; if(Math.abs(du)<4&&z>=114&&z<154)return z<117||z>=151||Math.abs(du)>=3?C.trimD:C.trim;
    for(const pz of [62,124,176])if(z>=pz&&z<pz+3&&Math.abs(((u+11)%36)-18)<1.5)return C.dark; return null; };
  B.push(kb(x0,y0,x1,y1,0,H,sd,{},paint));
  const s=X?x0:y0, e=X?x1:y1, a=o>0?(X?y1:x1)-.3:(X?y0:x0), b=a+.3;
  B.push(X?kb(x0,a,x1,b,H,H+10,sd,{foot:0}):kb(a,y0,b,y1,H,H+10,sd,{foot:0})); merlons(B,X?'x':'y',a,b,s,e,H+10,sd);
  const f0=o>0?(X?y1:x1):(X?y0:x0)-.16;
  B.push(X?kb(x0,f0,x1,f0+.16,0,22,sd+1):kb(f0,y0,f0+.16,y1,0,22,sd+1));
  return prop(B,null,{solids:[{x0:Math.min(x0,X?x0:f0),y0:Math.min(y0,X?f0:y0),x1:Math.max(x1,X?x1:f0+.16),y1:Math.max(y1,X?f0+.16:y1)}]}); };
KMK.drum=(cx,cy,r,H,seed=0)=>{ SHARED.PNAME='drum tower'; const B=[], sd=4400+seed;
  const face=(X,Y,z,k)=>{ const a=Math.atan2(Y-cy,X-cx), u=(a+Math.PI)*r*24, rk=.86+.2*Math.cos(a-2.2);
    for(const [az,z0] of [[.6,96],[2.3,96],[-1.4,96],[1.4,190],[-.4,190],[3,190]]){ const du=u-(az+Math.PI)*r*24; if(Math.abs(du)<1.5&&z>=z0&&z<z0+34)return sh(C.dark,k); if(Math.abs(du)<4&&z>=z0-4&&z<z0+38)return sh(z<z0||z>=z0+34||Math.abs(du)>=3?C.trimD:C.trim,k*rk); }
    return sh(castleWeather(castleStone(u,z,sd),u,z,sd),k*rk); };
  const slices=(R,z0,z1,top)=>{ const n=Math.max(4,Math.round(2*R/.2)), w=2*R/n;
    for(let i=0;i<n;i++){ const xa=cx-R+i*w, xm=xa+w/2, hy=Math.sqrt(Math.max(0,R*R-(xm-cx)**2)); if(hy<.06)continue;
      B.push(sided({x0:xa,y0:cy-hy,x1:xa+w,y1:cy+hy,z0,z1,c:C.ash[1],foot:z0===0?1:0,top,fs:(nx,ny,X,Y,zr,k)=>face(X,Y,zr+z0,k)})); } };
  slices(r+.16,0,24,kTop); slices(r,24,H,(X,Y)=>Math.hypot(X-cx,Y-cy)<r-.5?(hash(Math.floor(X*6),Math.floor(Y*3),4403)<.5?C.lead:C.leadL):kTop(X,Y));
  const n=Math.max(8,Math.round(2*Math.PI*r/.85)); for(let i=0;i<n;i+=1){ if(i&1)continue; const a=i/n*2*Math.PI, mx=cx+Math.cos(a)*(r-.22), my=cy+Math.sin(a)*(r-.22);
    B.push(sided({x0:mx-.2,y0:my-.2,x1:mx+.2,y1:my+.2,z0:H,z1:H+26,c:C.ash[1],foot:0,top:kTop,fs:(nx,ny,X,Y,zr,k)=>face(X,Y,zr+H,k)})); }
  const q=r*.72; return prop(B,null,{solids:[{x0:cx-q,y0:cy-r,x1:cx+q,y1:cy+r},{x0:cx-r,y0:cy-q,x1:cx+r,y1:cy+q}]}); };
KMK.gate=(gx,wy,H)=>{ '@later'; SHARED.PNAME='gatehouse'; const y0=wy-1.1, y1=wy+.5, w=.65, sd=4800, ps=[];
  const arch=(nx,ny,u,z)=>ny>0||ny<0?castleArch(u-gx*24,z,104,15.6,KARCH.out):null;
  const leaf=(x0,x1)=>sided({x0,y0:y0+.05,x1,y1:y1-.05,z0:0,z1:100,c:DGP.oak,foot:1,top:()=>DGP.oakD,fs:(nx,ny,X,Y,z,k)=>{ const u=(nx?Y:X)*24; if([12,48,84].some(b=>z>=b&&z<b+4))return sh(z-Math.floor(z)<.5&&Math.floor(u)%6===0?DGP.ironL:DGP.iron,k); return sh(Math.floor(u)%7===0?DGP.oakD:hash(Math.floor(u),Math.floor(z/3),4801)<.15?DGP.oakL:DGP.oak,k); }});
  for(const [a,b,l0,l1] of [[gx-.9,gx-w,gx-w,gx-w+.08],[gx+w,gx+.9,gx+w-.08,gx+w]]){ const B=[kb(a,y0,b,y1,0,H,sd,{},arch),leaf(l0,l1)]; merlons(B,'x',y1-.3,y1,a,b,H,sd); ps.push(prop(B,null,{solids:[{x0:Math.min(a,l0),y0,x1:Math.max(b,l1),y1}]})); }
  const B=[kb(gx-w,y0,gx+w,y1,104,H,sd,{foot:1},arch)];
  B.push(sided({x0:gx-w,y0:wy-.46,x1:gx+w,y1:wy-.36,z0:84,z1:104,c:DGP.iron,foot:0,top:()=>DGP.iron,fs:(nx,ny,X,Y,z,k)=>{ const u=(nx?Y:X)*24, g=((u%6)+6)%6;
    if(z<4)return g<1.5&&z>=4-(1.5-Math.abs(g-.75))*4?sh(DGP.ironL,k):null; return g<1.5||Math.floor(z)%6<1.5?sh(z%6<1?DGP.ironL:DGP.iron,k):null; }}));
  merlons(B,'x',y1-.3,y1,gx-w,gx+w,H,sd); ps.push(prop(B,null,{walk:1})); return ps; };
KMK.well=(x,y)=>{ SHARED.PNAME='well'; const r=.55, d=.16, B=[], top=(X,Y)=>{ const q=Math.hypot(X-x,Y-y); return q<.34?C.dark:q<.38?C.mortar:kTop(X,Y); };
  B.push(kb(x-r,y-r+d,x+r,y+r-d,0,22,4901,{top}),kb(x-r+d,y-r,x+r-d,y+r,0,22,4901,{top}));
  const wood=(x0,y0,x1,y1,z0,z1)=>({x0,y0,x1,y1,z0,z1,foot:0,c:DGP.oak,top:()=>DGP.oakL,fi:()=>sh(DGP.oak,.7),fj:()=>sh(DGP.oak,.86)});
  B.push(wood(x-.44,y-.04,x-.36,y+.04,22,66),wood(x+.36,y-.04,x+.44,y+.04,22,66),wood(x-.48,y-.05,x+.48,y+.05,66,71));
  B.push({x0:x-.012,y0:y-.012,x1:x+.012,y1:y+.012,z0:30,z1:66,foot:0,nb:1,c:[150,128,90],top:()=>null,fi:()=>[132,112,78],fj:()=>[150,128,90]});
  B.push({x0:x+.18,y0:y+.3,x1:x+.34,y1:y+.46,z0:22,z1:30,foot:0,c:DGP.oak,top:()=>DGP.oakD,fi:(v,z)=>z>27?DGP.iron:sh(DGP.oak,.7),fj:(u,z)=>z>27?DGP.iron:sh(DGP.oak,.86)});
  return prop(B,null,{}); };
KMK.bars=(x0,y0,x1,y1)=>{ SHARED.PNAME='iron bars'; const X=y0===y1, t=.03, h=96, I=DGP.iron, IL=DGP.ironL, B=[], ib=(a,b,c,d,z0,z1,cl)=>({x0:a,y0:b,x1:c,y1:d,z0,z1,foot:z0===0?1:0,nb:1,c:cl,top:()=>IL,fi:()=>sh(cl,.7),fj:()=>sh(cl,.86)});
  const L=X?x1-x0:y1-y0, n=Math.round(L/.2); for(let i=0;i<=n;i++){ const m=(X?x0:y0)+L*i/n; B.push(X?ib(m-t,y0-t,m+t,y0+t,0,h,I):ib(x0-t,m-t,x0+t,m+t,0,h,I)); }
  for(const [z0,c] of [[0,DGP.rust],[44,I],[h-4,I]])B.push(X?ib(x0,y0-t*1.6,x1,y0+t*1.6,z0,z0+4,c):ib(x0-t*1.6,y0,x0+t*1.6,y1,z0,z0+4,c));
  return prop(B,null,{solids:[X?{x0,y0:y0-.06,x1,y1:y0+.06}:{x0:x0-.06,y0,x1:x0+.06,y1}]}); };
KMK.rim=(x0,y0,x1,y1,h=26)=>{ SHARED.PNAME='stairwell rim'; return prop([kb(x0,y0,x1,y1,0,h,4851,{top:()=>sh(C.trim,1.04)},(nx,ny,u,z)=>z>=h-4?(z>=h-1?sh(C.trim,1.08):C.trim):null)],null,{}); };
KMK.dblock=(x0,y0,x1,y1,z0,z1,arch,walk)=>{ '@later'; SHARED.PNAME='dungeon stone'; const H=126, sd=4861+Math.round(x0*3+y0*7);
  const b=sided({x0,y0,x1,y1,z0,z1,c:DGP.st[1],foot:1,nb:z0>0?1:0,top:()=>DGP.lo,fs:(nx,ny,X,Y,zr,k)=>{ const u=(nx?Y:X)*24, z=zr+z0;
    if(arch)for(const [ax,zs,r] of arch){ const c=castleArch((X-ax)*24,z,zs,r,KARCH.in); if(c&&ny)return sh(c,k); }
    const c=dgnRidge(u,z,H)||dgnFoot(u,z,sd); return sh(c||dgnStone(u,z,sd),k*(c?1:dgnDamp(u,z,sd,H))); }});
  return prop([b],null,walk?{walk:1}:{}); };
KMK.gravel=(x0,y0,x1,y1)=>{ SHARED.PNAME='gravel'; const G=[[120,114,104],[134,128,118],[108,102,94],[96,92,86]];
  const top=(X,Y)=>{ const n=hash(Math.floor(X*1.5),Math.floor(Y*1.5),4951); return G[n<.18?2:0]; };
  return prop([{x0,y0,x1,y1,z0:0,z1:1,c:G[0],foot:1,nb:1,top,fi:()=>null,fj:()=>null}],null,{walk:true}); };
})();
dgnThings(CATALOG,CAT_INFO,LAMPS,CAT_DEPTS,DGP,dgnLit,DGN,dgnWeb);
// THE BODEGA'S LAYOUT: coordinates (X, Z, Y), the street and ghost street, roads and lanes and their painters; opens grab('bodega').

SHARED.BOD.KC={KMK,KPP,DGN,DGP,LAMPS,CATALOG,dungeonWall,dungeonFloorCol,castleArch,KARCH};
}
await grab('bodega',async()=>{ const solids=SOL.up, fixed=FIX.up, SHL=[]; let BOUND, groundY; const c0=cutWalls.length;

{
  const B0=LBLD[0], B00={...B0}, W=LSEED.walk, CURB=LSEED.street, FAR=LSEED.grass, RD=-8;
  const OX=(B00.x0+B00.x1)/2, OY=B00.y1, K=BLDK, X=x=>(x-OX)*TILE*K, Z=y=>(y-OY)*TILE*K, Y=z=>z*ZU*K, XS=x=>(x-OX)*TILE, ZS=y=>(y-OY)*TILE, YS=z=>z*ZU, MX=x=>x/TILE+OX, MY=z=>z/TILE+OY; if(OX!==ORIGIN[0]||OY!==ORIGIN[1])console.warn('the bodega lot is not on the level file\'s origin',OX,OY,ORIGIN); Object.assign(SHARED.BOD,{X,Z,Y,XS,ZS,YS,MX,MY,OX,OY,B0});
  const MAP={x0:WESTX,x1:EASTX,y0:B00.y0,y1:FAR+12}, RG=RING, WEND=RING.wy1;
  const HUD=SHARED.BOD.HUD=WP.bodega.row===2||!!WP.bodega.pf; if(!HUD){ B0.x0=LOTX(WP.bodega.x0); B0.x1=LOTX(WP.bodega.x1); }   // on the Hudson row (owner, 7 Nov 2026) the old front is not built: the inside keeps its own size
  const BODOFF=B0.y0+3.75; SHARED.BOD.BODOFF=BODOFF;
  const SB={...B0,x0:1330+OFFDX/BLDK,x1:1330+OFFDX/BLDK+(B0.x1-B0.x0)}; SHARED.BOD.SB=SB; SHARED.BOD.SHOPDX=X(SB.x0)-X(B0.x0);
  const holed=f=>(x,y)=>[MAPSTAIR,...RING.stairs].some(S=>x>=S.x0&&x<S.x1&&y>=S.y0&&y<S.y1)?null:f(x,y);
  const C=v=>v&&v.e&&v.length===3?[v[0],v[1],v[2],1]:v;
  const faceTex=(w,h,fn)=>{ w=Math.max(1,Math.round(w)); h=Math.max(1,Math.round(h)); const im=new ImageData(w,h), d=im.data; let ie=null, e=null;
    for(let j=0,k=0;j<h;j++)for(let i=0;i<w;i++,k+=4){ const v=fn(i,j); if(!v||v.h)continue; d[k]=Math.round(v[0]); d[k+1]=Math.round(v[1]); d[k+2]=Math.round(v[2]); d[k+3]=255;
      if(v.length>3){ if(!ie){ ie=new ImageData(w,h); e=ie.data; } e[k]=d[k]; e[k+1]=d[k+1]; e[k+2]=d[k+2]; e[k+3]=255; } }
    return {map:{image:im},em:ie?{image:ie}:null}; };
  const bq=(a,b,c,d,tx,kind)=>BATCH.add([...a,...b,...c,...a,...c,...d],[0,0,1,0,1,1,0,0,1,1,0,1],tx.map.image,tx.em?tx.em.image:null,kind);
  function gbox(b,kind='L'){ const {x0,x1,y0,y1,z0,z1}=b; if(b.foot&&z1-z0<.05)return; const k=b.em?2:1, H=Math.max(1,(z1-z0)*k);
    if(b.em&&kind==='L')kind='B';
    const side=(nx,ny,P,Q,z)=>C(b.fs?b.fs(nx,ny,P,Q,z-z0,nx?.68:.84):nx&&b.fi?b.fi(Q,z):ny&&b.fj?b.fj(P,z):b.c);
    if(z1-z0>=.5){
      for(const nx of [-1,1]){ const x=nx<0?x0:x1; if(y1-y0<.004||b.skf&&b.skf(nx,0))continue; bq([X(x),Y(z0),Z(nx<0?y1:y0)],[X(x),Y(z0),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y0:y1)],[X(x),Y(z1),Z(nx<0?y1:y0)],
        faceTex((y1-y0)*24*k,H,(i,j)=>{ const t=(i+.5)/((y1-y0)*24*k); return side(nx,0,x,nx<0?y1-t*(y1-y0):y0+t*(y1-y0),z1-(j+.5)/k); }),kind); }
      for(const ny of [-1,1]){ const y=ny<0?y0:y1; if(x1-x0<.004||b.skf&&b.skf(0,ny))continue; bq([X(ny<0?x0:x1),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z0),Z(y)],[X(ny<0?x1:x0),Y(z1),Z(y)],[X(ny<0?x0:x1),Y(z1),Z(y)],
        faceTex((x1-x0)*24*k,H,(i,j)=>{ const t=(i+.5)/((x1-x0)*24*k); return side(0,ny,ny<0?x0+t*(x1-x0):x1-t*(x1-x0),y,z1-(j+.5)/k); }),kind); } }
    if(x1-x0>.004&&y1-y0>.004&&!(b.skf&&b.skf(0,0)))bq([X(x0),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y1)],[X(x1),Y(z1),Z(y0)],[X(x0),Y(z1),Z(y0)],
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
  { const B=SB, m=(B.x0+B.x1)/2, d=(m0)=>({a0:m0-.78,a1:m0+.78,z0:0,z1:94,door:true});
    const cuts=[B.x0+.35,m-.95,m+.95,B.x1-.35], win=[]; for(let i=0;i+1<cuts.length;i+=2)win.push({a0:cuts[i],a1:cuts[i+1],z0:16,z1:94,glass:true});
    wall('front','x',B.y1,B.x0,B.x1,B.h,[{...d(m),glass:true},...win],-1,1,true);
    wall('back','x',B.y0,B.x0,B.x1,B.h,[],1,-1,true);
    wall('west','y',B.x0,B.y0-T,B.y1+T,B.h,[],1,-1,true);
    wall('east','y',B.x1,B.y0-T,B.y1+T,B.h,[],-1,1,true);
    wall('office','x',BODOFF,B.x0+T,B.x1-T,B.h-4,[{...d(B.x1-.95),locked:true}],1,-1,false); }
  SHARED.BOD.WALLS=WALLS;
  function facade(nx,ny,X_,Y_,z,f,cap,brick){ const u=nx?Y_:X_, c=brick||DTBRICK;
    if(z>=cap-20){ const r=cap-4-z, px=Math.floor(u*24), pn=Math.floor(u/1.7+hash(Math.floor(u/1.7),3,199)*.4), hp=hash(px,Math.floor(z),203), rs=hash(px>>1,pn,205)<.06&&r>2-8*hash(px>>1,pn,207);
      let t=sh(mt('cope',COPE),f*(.9+.16*hash(pn,7,201))); if(cvNoise(u*3,z/5,209)>.7)t=sh(t,1.1); if(rs)t=[t[0]*.84+16,t[1]*.7+6,t[2]*.6];
      if(r<0)return sh(t,z<cap-3?.72:1+.06*hp); if(r<3)return sh(t,hp<.1?.9:1.08); if(r<5)return sh(t,.6);
      if(r<10){ const e=u*24/5+.9*(cvNoise(u*1.3,3,213)-.5), b=Math.floor(e), on=e-b<.5+.18*(hash(b,pn,215)-.5)&&hash(b,9,217)>.05&&!(r<3+3*hash(b,4,219)&&hash(b,5,221)<.12); return on?sh(t,(e-b<.12?1.04:.95)*(.94+.1*hp)):sh(t,.5+.08*hp); }
      if(r<12)return sh(t,.7); if(r<15)return sh(t,.96+.08*hp); }
    if(z>=cap-34&&hash(Math.floor(u*24),Math.floor(u/1.7),223)<.05&&cap-20-z<14*hash(Math.floor(u*24),1,225)&&z>STORY)return sh(mt('mortar',[86,62,50]),f);
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
  const put=(key,kind,x,y,rot=0,hung)=>{ const f=CATALOG[kind]; if(!f){ console.warn('no',kind); return; } const n0=PROPL.length; const p=f(+x.toFixed(3),+y.toFixed(3)); if(!p)return; p.key=key; p.kind=kind; place(p,rot); if(hung)p.high=true; O[key]=p; };
  { const B={...SB,y0:BODOFF}, m=(B.x0+B.x1)/2;
  put('mat','door mat',m,B.y1-.5);
  put('wb1','shop shelf',B.x0+1.1,B.y0+.36); put('wb2','shop shelf',B.x0+3.1,B.y0+.36); put('wb3','shop shelf',B.x0+5.1,B.y0+.36);
  for(const [i,dy] of [[1,1.0],[2,1.95],[3,2.9]])put('fridge'+i,'drinks fridge',B.x0+.5,B.y0+dy);
  put('wl1','shop shelf',B.x0+.36,B.y0+4.45,3); put('wl2','shop shelf',B.x0+.36,B.y0+6.55,3);
  put('wr1','shop shelf',B.x1-.36,B.y0+2.2,1); put('wm1','shop shelf',m-.3,B.y0+3.3,3); put('win1','shop shelf',(B.x0+.35+m-.95)/2-1,B.y1-.62); put('win2','shop shelf',(m+.95+B.x1-.35)/2-1,B.y1-.62);   // each display centred on its window
  put('counter','long counter',B.x1-1.05,B.y0+5.4,1); put('cigs','cigarette rack',B.x1-.22,B.y0+5.0,1,1); O.cigs.boxes=O.cigs.boxes.map(b=>b.foot?b:zShift(b,42));
  put('radio','radio',B.x1-.24,B.y0+4.0,1,1);
  put('jar','candy jar',B.x1-1.05,B.y0+4.62);
  { const top=Math.max(...O.counter.boxes.map(b=>b.z1)), drop=top*.25; O.counter.boxes=O.counter.boxes.map(b=>Object.assign({},b,{z0:b.z0*.75,z1:b.z1*.75}));
    for(const k of ['jar'])if(O[k])O[k].boxes=O[k].boxes.map(b=>b.z0>=top*.8?zShift(b,-drop):b); } put('bags','paper bags',B.x1-.5,B.y0+7.3); put('phone','wall phone',B.x1-.15,B.y0+7.3,0,1);
  put('clock','wall clock',B.x0+3.1,B.y0+.14,0,1); put('mirror','convex mirror',B.x0+.42,B.y0+.15,0,1); put('calendar','calendar',B.x0+.11,B.y0+1.95,0,1); put('cord','extension cord',B.x0+.11,B.y0+.12,0,1);
  put('tube1','fluorescent tube',m,B.y0+2.5); put('tube2','fluorescent tube',m,B.y0+6.5);
  put('fan','box fan',B.x0+5.1,B.y0+.36); put('fly','fly strip',m-.8,B.y0+4.5); put('bell','door bell',m,B.y1-.24);
  put('news','newspaper rack',B.x0+.6,B.y1-.5); put('dock','drone box',B.x1-.85,B.y0+.85); O.dock.boxes.push({x0:B.x1-1.05,y0:B.y0+.65,x1:B.x1-.65,y1:B.y0+1.05,z0:114,z1:SB.h,c:[120,122,122],fi:(v,z)=>Math.floor(z)%6===0?[96,98,98]:[124,126,126],fj:(u,z)=>Math.floor(z)%6===0?[96,98,98]:[124,126,126]});
  put('wl3','shop shelf',B.x0+.36,B.y0+8.5,3);
  put('mat-fox','counter mat',B.x1-.42,B.y0+5.3); put('mat-run','rubber mat',B.x1-1.75,B.y0+5.3,1);
  { const y0=SB.y0, x0=SB.x0; put('of-chair','office chair',x0+1.4,y0+1.6); put('of-pc','home computer',x0+1.4,y0+.6);
    put('of-shelf','shelves with boxes',x0+4.6,y0+.5); put('of-boxes','cardboard boxes',x0+6.6,y0+.7); put('of-sink','utility sink',x0+.55,y0+2.6,3);
    put('of-clock','wall clock',x0+3.2,y0+.29); put('of-tube','fluorescent tube',x0+3.6,y0+1.9); }
  SHARED.BOD.food={x:B.x1-1.05,y:B.y0+6.3};
  }
  const FRONT=[], ROOF=[], STREET=[], GHOSTST=[];
  { const M=MKS, bo=B0, bm=(bo.x0+bo.x1)/2, n0=PROPL.length; if(!SHARED.BOD.HUD){   // (the bodega's own street front only where it stands on Market St)
    M.pipe(bo.x0+.2,bo.y1,bo.h-6);
    M.neon(bm,bo.y1,80,'OPEN',[255,90,110]); M.signbox(bo.x0+.45,bo.x0+2.3,bo.y1,36,48,[250,250,246],[40,80,200],'LOTTO',false);
    M.awning(bo.x0+.2,bo.x1-.2,bo.y1,108,[250,248,240],[250,248,240],'GROCERY','WE DELIVER - COLD CUTS - COLD BEER - SODA - DAIRY',[200,40,40],[40,70,170]);
    { const w0=bo.x0+.5, w1=bm-1.05, bk=[22,22,24], wh=[250,250,246]; M.poster(w0,w1,bo.y1,52,76,wh,[['ESTA CASA',bk,1,3],['REGALA LOS',bk,1,9],['SELLOS DE LA',bk,1,15]]); M.signbox(w0,w1,bo.y1,20,34,[236,196,40],[200,40,40],'CAFE BUSTELO',false,1);
      const r0=bm+1.05, r1=bo.x1-.5, rm=(r0+r1)/2; M.neon(rm,bo.y1,74,'MILLER',[255,70,70],2); M.neon(rm,bo.y1,64,'HIGH LIFE',[255,70,70],1); M.neon(rm,bo.y1,55,'CERVEZA FRIA',[90,160,255],1);
      M.poster(r0,r1,bo.y1,36,50,wh,[['STOP',[200,40,40],1,2],['DRUG TRAFFIC',bk,1,8]]); M.poster(r0+.4,r1-.4,bo.y1,20,32,[40,90,170],[['ICE CUBES',wh,1,3]]);
      M.milkcrates(bo.x0+.25,bo.y1+.18,3); M.milkcrates(bo.x1-1.05,bo.y1+.18,2); }
    M.gatebox(bo.x0+.2,bo.x1-.2,bo.y1,114); M.bell(bm,bo.y1,98); M.meterbox(bo.x0+.9,bo.y1,30); M.number(bo.x0+1.6,bo.y1,82,'66');
    for(const p of PROPL.slice(n0))FRONT.push(p); }
    { const K=SHARED.GHOSTK.GSK, BP=WP.bath&&WP.bath.park?WP.bath:null; if(BP)K.s=K.s*.75; const s=K.s; { const o=LAY.o('ghost'); K.o=BP?[LOTX((BP.x0+BP.x1)/2)-4*s,LOTY(BP.y0)]:[131+o.x/BLDK,W-8.3*s+o.y/BLDK]; K.HOME=[K.o[0]+.4*s,K.o[1]+4.1*s,K.o[0]+7.8*s,K.o[1]+9.1*s]; } const n3=PROPL.length;   // in Central Park three quarters of its size (owner, 8 Nov 2026: "lets put the bathhouse inside central park, 25% smaller")
      for(const [k,dx,dy] of PRESETS['Preset Ghost Street 1'])if(!/row house|utility pole/.test(k))CATALOG[k](K.o[0]-3.5*s+dx,K.o[1]-.45*s+dy);
      for(const p of PROPL.slice(n3))GHOSTST.push(p); SHARED.BOD.GHOSTST=GHOSTST; SHARED.BOD.GSK=K; gdShape(GHOSTST,K,LAMPS);
    }
    const n2=PROPL.length, R=(f,x,y,z,...a)=>{ const p=f(x,y,z,bo.y1,...a); p.solids=[]; return p; };
    R(M.antenna,bo.x0+8,bo.y0+3.5,bo.h); for(const p of PROPL.slice(n2))ROOF.push(p); }
  SHARED.BOD.O=O; SHARED.BOD.FRONT=FRONT; SHARED.BOD.STREET=STREET; SHARED.BOD.ROOF=ROOF; SHARED.BOD.MAP=MAP; SHARED.BOD.RD=RD;
  SHARED.BOD.kindOf=p=>/fluorescent tube/.test(p.name||'')?'U':ROOF.includes(p)?'R':'L';
  SHARED.BOD.paintProps=(L=[...Object.values(O),...FRONT,...STREET,...ROOF,...GHOSTST])=>{ for(const p of L){ const k=SHARED.BOD.kindOf(p); BATCH.tag=OBJ('bodega',p.name); for(const b of p.boxes)gbox(b,k); } BATCH.tag=null; };
  SHARED.BOD.g={bodegaWall,grain,speck,COPE,DTBRICK,hash,grassCol,lawnCol,kerbFace,cvNoise}; SHARED.BOD.CURB=CURB; SHARED.BOD.FAR=FAR;
  SHARED.BOD.gbox=gbox; SHARED.BOD.faceTex=faceTex; SHARED.BOD.bq=bq;
  SHARED.BOD.windowTex=(wPx,hPx,lit,seed,door)=>{ const W=Math.max(4,Math.round(wPx)), H=Math.max(4,Math.round(hPx)), hw=W/2, tr=H*.68, cur=hash(seed,2,7)<.5, cc=[[220,200,170],[180,120,110],[150,170,200],[230,230,220]][seed%4], BAR=[172,162,142], GL=[255,214,150];
    return faceTex(W,H,(i,j)=>{ const dx=i+.5-hw, dz=H-j-.5, ax=Math.abs(dx); if(door&&dz<H*.42){ if(ax>hw-1.5||dz<1.5||Math.abs(dz-H*.42+1)<1)return BAR; const px=ax>hw*.5?ax-hw*.5:ax; return px<1.2||Math.abs(dz-H*.21)<1?[62,38,24]:[86,54,34]; }
      if(ax>hw-1.5||dz<1.5||dz>H-1.5||ax<1||Math.abs(dz-tr)<1.2||(dz>tr&&Math.abs(ax-hw/2)<.8))return BAR;
      const u=(i+.5)/W; if(cur&&(u<.2||u>.8))return lit?[cc[0]*.8,cc[1]*.8,cc[2]*.8,1]:[cc[0]*.35,cc[1]*.35,cc[2]*.35];
      if(lit){ const n=hash(Math.floor(dx+40),Math.floor(dz/3),seed); return [GL[0],GL[1]*(.94+.06*n),GL[2]*(.9+.12*n),1]; } const sheen=Math.abs(((dx+dz*.6)%14+14)%14-7)<1.4; return sheen?[86,100,122]:[46,54,70]; }); };
  SHARED.BOD.window=(P,wTiles,hPx,lit,seed,kind,door)=>bq(P[0],P[1],P[2],P[3],SHARED.BOD.windowTex(wTiles*24,hPx,lit,seed,door),kind); SHARED.BOD.C=C; SHARED.BOD.facade=facade; SHARED.BOD.FRAME=FRAME; SHARED.BOD.place=place; SHARED.BOD.placeAt=placeAt; SHARED.BOD.MAP=MAP; SHARED.BOD.K={MKS,CATALOG,PROPS:PROPL,STUDIO,LSEED,STORY,sh};
  const PCX=PARKGX+LAY.o('park').x, PCY=(MAP.y1+RG.top-NORTHX)/2+LAY.o('park').y, GATE=[PCX-3.5,PCX+3.5], EGATE=[PCY-2,PCY+2];
  const KR=1.6, RR=[[MAP.x0,CURB,MAP.x1,FAR],[RG.wr0,FAR,RG.wr1,WEND]];
  const CORN=[[RG.wr0,FAR,-1,1,1],[RG.wr1,FAR,1,1,1]].map(([x,y,sx,sy,cv])=>({x,y,sx,sy,cv,cx:x+sx*KR,cy:y+sy*KR}));
  const inQ=(c,x,y)=>{ const u=(x-c.x)*c.sx, v=(y-c.y)*c.sy; return u>=0&&u<=KR&&v>=0&&v<=KR; };
  const TCL=(list,bb)=>{ const M=new Map(); return (x,y)=>{ const tx=Math.floor(x), ty=Math.floor(y), k=tx*1048576+ty; let L=M.get(k); if(!L){ L=list.filter(it=>{ const b=bb(it); return b[2]>=tx-.01&&b[0]<=tx+1.01&&b[3]>=ty-.01&&b[1]<=ty+1.01; }); M.set(k,L); } return L; }; };
  const RRt=TCL(RR,b=>b), CORNt=TCL(CORN,c=>[Math.min(c.x,c.x+c.sx*KR),Math.min(c.y,c.y+c.sy*KR),Math.max(c.x,c.x+c.sx*KR),Math.max(c.y,c.y+c.sy*KR)]);
  const ROADAT=(x,y)=>{ let r=false; for(const b of RRt(x,y))if(x>b[0]&&x<b[2]&&y>b[1]&&y<b[3]){ r=true; break; } for(const c of CORNt(x,y))if(inQ(c,x,y)&&Math.hypot(x-c.cx,y-c.cy)>KR)return !!c.cv; return r; };
  const KB=.24, NR=RR.map(b=>[b[0]-KR-.3,b[1]-KR-.3,b[2]+KR+.3,b[3]+KR+.3]), KX=kerbCol('x'), KY=kerbCol('y');
  const kerbAt=(x,y)=>{ if(!NR.some(b=>x>b[0]&&x<b[2]&&y>b[1]&&y<b[3]))return null;
    for(const c of CORN)if(inQ(c,x,y)){ const d=Math.hypot(x-c.cx,y-c.cy); if(c.cv?d>KR-KB:d<KR+KB)return KX(Math.atan2(y-c.cy,x-c.cx)*KR+c.x*7,y); return null; }
    if(ROADAT(x+KB,y)||ROADAT(x-KB,y))return KY(x,y); if(ROADAT(x,y+KB)||ROADAT(x,y-KB))return KX(x,y); return null; };
  const SW=f=>(x,y)=>{ if(ROADAT(x,y)||rampAt(x,y)!=null)return null; const v=f(x,y); return v&&(kerbAt(x,y)||v); };
  const XW=[[GATE[0],GATE[1],'x',CURB,FAR],[RG.wx0+.3,RG.wr0-.3,'x',CURB,FAR],[RG.wx1+.3,RG.wx1+1.9,'x',CURB,FAR],
    [EGATE[0],EGATE[1],'y',RG.wr0,RG.wr1],[FAR+KR+.3,FAR+KR+1.9,'y',RG.wr0,RG.wr1]];
  const inX=(ax,e,a,m)=>XW.some(w=>w[2]===ax&&e>=w[3]-.01&&e<=w[4]+.01&&a>w[0]-m&&a<w[1]+m);
  const RPD=.75, RP=[];
  for(const [a0,a1,ax,l0,h0] of XW)for(const [e,dir] of [[l0,-1],[h0,1]]){ const P=(u,w)=>ax==='x'?[u,e+dir*w]:[e+dir*w,u], ok=u=>ROADAT(...P(u,-.05))&&!ROADAT(...P(u,.05))&&!ROADAT(...P(u,RPD+.05));
    const m=(a0+a1)/2, hw=Math.min((a1-a0)/2-.1,1.2); if(!ok(m))continue; let u0=m, u1=m; while(u0-.05>=m-hw&&ok(u0-.05))u0-=.05; while(u1+.05<=m+hw&&ok(u1+.05))u1+=.05;
    if(u1-u0>=.8)RP.push({ax,e,dir,u0,u1}); }
  const rampAt=(x,y)=>{ for(const r of RP){ const u=r.ax==='x'?x:y, w=((r.ax==='x'?y:x)-r.e)*r.dir; if(u>r.u0&&u<r.u1&&w>=0&&w<RPD)return w; } return null; };
  const rampCol=(u,w,W)=>{ const ti=Math.floor(u*24), tj=Math.floor(w*24); if(ti<1||ti>=Math.floor(W*24)-1)return [188,184,174];
    if(w>.04&&w<.36&&ti>=2&&ti<Math.floor(W*24)-2){ const a=ti%3, b=tj%3; return b===1&&a===1?[246,214,92]:b===1&&a===2||b===2&&a===1?[164,128,30]:[216,178,48]; }
    const n=grain(u*3.1,w*7.3,631,1.4); return tj%2?(n<.4?[150,147,139]:[162,158,149]):(n<.4?[158,154,146]:[170,166,157]); };
  SHARED.BOD.ramps={RP,D:RPD,col:rampCol,at:rampAt};
  const XWb=TCL(XW,([a0,a1,ax,l0,h0])=>ax==='x'?[a0,l0,a1,h0]:[l0,a0,h0,a1]), XWm=TCL(XW,([a0,a1,ax,l0,h0])=>ax==='x'?[a0-1.05,l0,a1+1.05,h0]:[l0,a0-1.05,h0,a1+1.05]);
  const bars=(x,y)=>{ for(const [a0,a1,ax,l0,h0] of XWb(x,y)){ const u=ax==='x'?x:y, v=ax==='x'?y:x; if(u<=a0||u>=a1||v<=l0+.15||v>=h0-.15)continue;
      const W=()=>{ const n=grain(x,y,39,2.2); return n<.3?[150,148,142]:[196,194,186]; };
      if(u<a0+.1||u>a1-.1)return W(); if(u>a0+.25&&u<a1-.25&&(Math.floor((v-l0-.15)/.5)&1)===0)return W(); return null; } return null; };
  const LN=[['x',CURB,1,MAP.x0+.5,MAP.x1-.5,[[RG.wr0,RG.wr1]]],['x',FAR,-1,MAP.x0+.5,RG.wr0-KR],['x',FAR,-1,RG.wr1+KR,MAP.x1-.5],
    ['y',RG.wr0,1,FAR+KR,WEND-.5],['y',RG.wr1,-1,FAR+KR,WEND-.5]];
  const sd=(px,py,ax,ay,bx,by)=>{ const dx=bx-ax, dy=by-ay, t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy))); return Math.hypot(px-ax-t*dx,py-ay-t*dy); };
  const BIKE=[[-.27,-.08,0,-.06],[0,-.06,-.08,.12],[-.27,-.08,-.08,.12],[-.08,.12,.17,.12],[.17,.12,0,-.06],[.17,.12,.27,-.08],[.17,.12,.15,.2],[.11,.2,.21,.2],[-.14,.14,-.02,.14]];
  const bike=(u,w)=>Math.abs(Math.hypot(u+.27,w+.08)-.15)<.035||Math.abs(Math.hypot(u-.27,w+.08)-.15)<.035||BIKE.some(s=>sd(u,w,...s)<.032);
  const chev=(u,w)=>{ const q=Math.abs(w); return q<.3&&[0,.2].some(c=>Math.abs(u-c+q*.9)<.045); };
  const WHITE=(x,y,hp)=>{ const n=grain(x,y,611,1.1); return hp<.05?[170,168,160]:n<.3?[188,186,178]:[212,210,202]; };
  const LNt=TCL(LN,([ax,e,dir,a0,a1])=>{ const p=e+dir*.12, q=e+dir*1.44, lo=Math.min(p,q), hi=Math.max(p,q); return ax==='x'?[a0,lo,a1,hi]:[lo,a0,hi,a1]; });
  const lane=(x,y)=>{ for(const [ax,e,dir,a0,a1,dash] of LNt(x,y)){ const a=ax==='x'?x:y, d=((ax==='x'?y:x)-e)*dir; if(d<.12||d>=1.44||a<a0||a>a1)continue;
      if(inX(ax,e,a,.35))return null;
      const hp=hash(Math.floor(x*24),Math.floor(y*24),613), worn=cvNoise(x*1.7,y*1.7,615)>.78&&hp<.55;
      if(d>=1.32)return worn||dash&&dash.some(r=>a>r[0]-.2&&a<r[1]+.2)&&(Math.floor(a/1.2)&1)?null:WHITE(x,y,hp);
      const t=ax==='x'?dir:-dir, k=Math.round((a-a0-8)/22), sa=a0+8+k*22;
      if(k>=0&&sa<a1-2){ const u=(a-sa)*t; if(u>-.75&&u<.25&&bike(u+.25,d-.74)||u>.45&&u<1&&chev(u-.6,d-.74))return WHITE(x,y,hp); }
      return null; } return null; };
  const JX=[[RG.wr0,CURB,RG.wr1,FAR]], inJ=(x,y,m)=>JX.some(b=>x>b[0]-m&&x<b[2]+m&&y>b[1]-m&&y<b[3]+m);
  const YEL=[[190,156,54],[212,176,62]];
  const marks=(x,y)=>{ let hq=-1; const hpf=()=>hq<0?(hq=hash(Math.floor(x*24),Math.floor(y*24),617)):hq;
    for(const b of RRt(x,y)){ if(!(x>b[0]&&x<b[2]&&y>b[1]&&y<b[3]))continue; const ax=b[2]-b[0]>b[3]-b[1]?'x':'y', a=ax==='x'?x:y, v=ax==='x'?y:x, m=ax==='x'?(b[1]+b[3])/2:(b[0]+b[2])/2, q=Math.abs(v-m);
      if(q>.06&&q<.19&&!inJ(x,y,.3)&&!inX(ax,m,a,1.1))return cvNoise(x*1.7,y*1.7,619)>.8&&hpf()<.5?null:YEL[grain(x,y,621,1.1)<.4?0:1]; break; }
    for(const [a0,a1,ax,l0,h0] of XWm(x,y)){ const u=ax==='x'?x:y, v=ax==='x'?y:x, m=(l0+h0)/2; if(v<=l0+.12||v>=h0-.12||inJ(x,y,1.5))continue;
      const lo=ax==='x'; if(u>a0-1.05&&u<a0-.7&&(lo?v<m-.2:v>m+.2)||u>a1+.7&&u<a1+1.05&&(lo?v>m+.2:v<m-.2))return WHITE(x,y,hpf()); }
    return null; };
  const IX=new Map(), at2=(x,y)=>Math.floor(x/2)*1048576+Math.floor(y/2), feat=(x0,y0,x1,y1,f)=>{ for(let i=Math.floor(x0/2);i<=Math.floor(x1/2);i++)for(let j=Math.floor(y0/2);j<=Math.floor(y1/2);j++){ const k=i*1048576+j; (IX.get(k)||IX.set(k,[]).get(k)).push(f); } };
  const MH=[], DR=[];
  const manhole=(cx,cy)=>{ MH.push([cx,cy]); const rs=hash(Math.floor(cx*7),Math.floor(cy*7),621), pa=.5+.12*rs; feat(cx-.7,cy-.7,cx+.7,cy+.7,(x,y)=>{ const dx=x-cx, dy=y-cy, r=Math.hypot(dx,dy), px=Math.floor(x*24), py=Math.floor(y*24), hp=hash(px,py,625);
    if(r>=.42){ const e=Math.max(Math.abs(dx),Math.abs(dy))+(cvNoise(x*6,y*6,627)-.5)*.12; if(e>pa)return null; if(e>pa-.03)return [30,30,32]; return hp<.1?[58,58,60]:[44,44,47]; }
    if(r>.35)return dx+dy<0?[80,78,74]:[40,40,42]; if(r>.32)return [24,24,26];
    const a=Math.atan2(dy,dx), wr=Math.cos(a-rs*6.3)>.55&&r>.1, sp=Math.abs(((a/(Math.PI/4))%1+1)%1-.5)<.05/Math.max(.08,r);
    let c; if(r<.09)c=Math.abs(dy)<.02&&Math.abs(dx)<.07&&(px&1)?[40,40,42]:[90,88,84]; else if(sp)c=[56,55,53]; else { const ring=((r*24/1.1)%1+1)%1; c=ring<.45?(dx+dy<0?[106,103,98]:[74,72,69]):[52,51,49]; if(wr)c=[c[0]*.6+46,c[1]*.6+45,c[2]*.6+43]; }
    if(r>.2&&cvNoise(x*9,y*9,629)>.68)c=[112,74,50]; if(hash(px>>1,py>>1,631)<.02)c=[22,22,24]; if(Math.abs(r-.27)<.02&&Math.abs(a-rs*5)<.12)c=[16,16,18];
    return c; }); };
  const HOLE=[0,0,0]; HOLE.h=1; const drain=(ax,e,dir,a)=>{ DR.push({ax,e,a,dir}); const HL=.62, OUT=.82, R=.22, x0=ax==='x'?a-HL-R:Math.min(e,e+dir*(OUT+R)), x1=ax==='x'?a+HL+R:Math.max(e,e+dir*(OUT+R)), y0=ax==='x'?Math.min(e,e+dir*(OUT+R)):a-HL-R, y1=ax==='x'?Math.max(e,e+dir*(OUT+R)):a+HL+R;
    const sd=hash(Math.floor(a*7),Math.floor(e*7),631);
    feat(x0,y0,x1,y1,(x,y)=>{ const u=(ax==='x'?x:y)-a, w=((ax==='x'?y:x)-e)*dir, px=Math.floor(x*24), py=Math.floor(y*24), hp=hash(px,py,633); if(w<0)return null;
      const ou=Math.abs(u)-HL, ow=w-OUT, out=Math.max(ou,ow);
      if(out>=0){ if(out>=R*(.6+.4*hash(Math.floor(u*6),Math.floor(w*6),635)))return null;
        if(hp<.16+(w<.12?.3:0))return [[62,92,44],[80,112,52],[50,76,38]][Math.floor(hash(px,py,637)*3)];
        return hp>.9?[30,30,32]:[50,50,53]; }
      if(sd<.35&&Math.hypot(u-(sd-.17)*3,w-OUT*.8)<.1)return hp<.5?[236,232,226]:[206,202,214];
      if(Math.abs(u)>HL-.08||w>OUT-.08||w<.06){ const lit=(u<0)!==(dir<0); return Math.abs(u)>HL-.03||w>OUT-.03?(lit?[118,114,108]:[58,56,54]):[86,84,80]; }
      const fu=(u+HL-.08)/((HL-.08)*2), fw=(w-.06)/(OUT-.14), cu=fu*4-Math.floor(fu*4), cw=fw*6-Math.floor(fw*6);
      if(cu>.1&&cu<.9&&cw>.24&&cw<.82)return cw<.34||cu<.18?[26,24,24]:HOLE;
      return hash(Math.floor(fu*4),Math.floor(fw*6),639)<.25&&hp<.5?[112,78,54]:hp<.3?[104,102,98]:[78,77,75]; }); };
  SHARED.BOD.kerbs=[{ax:'x',at:CURB,a0:MAP.x0,a1:MAP.x1,n:1},{ax:'x',at:FAR,a0:MAP.x0,a1:RG.wr0-KR,n:-1,e1:1},{ax:'x',at:FAR,a0:RG.wr1+KR,a1:MAP.x1,n:-1,e0:1},
    {ax:'y',at:RG.wr0,a0:FAR+KR,a1:WEND,n:1,e0:1},{ax:'y',at:RG.wr1,a0:FAR+KR,a1:WEND,n:-1,e0:1},{ax:'x',at:WEND,a0:RG.wr0,a1:RG.wr1,n:-1},
    {ax:'y',at:MAP.x0,a0:CURB,a1:FAR,n:1},{ax:'y',at:MAP.x1,a0:CURB,a1:FAR,n:-1}].map(k=>({z0:RD,z1:0,...k}));
  for(const k of SHARED.BOD.kerbs){ if(k.at===MAP.x0||k.at===MAP.x1||k.at===WEND)continue; const ds=[]; if(k.e0)ds.push(k.a0+1); if(k.e1)ds.push(k.a1-1);
    for(let a=k.a0+14;a<k.a1-8;a+=28)if(ds.every(b=>Math.abs(b-a)>10))ds.push(a);
    for(const a of ds)if(a>k.a0+.6&&a<k.a1-.6&&!inX(k.ax,k.at,a,1.2))drain(k.ax,k.at,k.n,a); }
  { const yc=(CURB+FAR)/2, xw=(RG.wr0+RG.wr1)/2, ok=(x,y)=>!XW.some(w=>{ const u=w[2]==='x'?x:y, v=w[2]==='x'?y:x; return u>w[0]-1.2&&u<w[1]+1.2&&v>w[3]&&v<w[4]; });
    manhole(xw,yc);
    let k=0; for(let x=MAP.x0+20;x<MAP.x1-4;x+=40,k++)if(ok(x,yc)&&Math.abs(x-xw)>8)manhole(x,yc+(k&1?1.6:-1.6));
    k=0; for(let y=FAR+20;y<WEND-5;y+=40,k++)if(ok(xw,y))manhole(xw+(k&1?1.6:-1.6),y); }
  const RW=(x,y)=>{ if(!ROADAT(x,y))return null; const L=IX.get(at2(x,y)); if(L)for(const f of L){ const v=f(x,y); if(v)return v; } return bars(x,y)||lane(x,y)||marks(x,y)||roadCol(x,y,0); };
  SHARED.BOD.kerbFaceAt=(k,a,z,H)=>{ for(const r of RP)if(r.ax===k.ax&&r.e===k.at&&a>r.u0&&a<r.u1)return null;
    for(const d of DR)if(d.ax===k.ax&&d.e===k.at&&Math.abs(a-d.a)<.5){ if(z>=H-1)break; if(Math.abs(a-d.a)>.44)return [96,94,88]; return z<1?[120,116,108]:[14,14,16]; } return kerbFace(a,z,H); };
  const arc=(c,rev,n=6)=>{ const a0=Math.atan2(-c.sy,0), a1=Math.atan2(0,-c.sx); let dl=a1-a0; while(dl>Math.PI)dl-=2*Math.PI; while(dl<-Math.PI)dl+=2*Math.PI;
    const P=[]; for(let i=0;i<=n;i++){ const t=a0+dl*i/n; P.push([c.cx+Math.cos(t)*KR,c.cy+Math.sin(t)*KR]); } return rev?P.reverse():P; };
  SHARED.BOD.kerbArcs=CORN.map(c=>({P:arc(c),z0:RD,z1:0,cx:c.cx,cy:c.cy,r:KR}));
  { const C=(x,y)=>CORN.find(c=>c.x===x&&c.y===y), M=MAP;
    SHARED.BOD.roadPolys=[[[M.x0,CURB],[M.x1,CURB],[M.x1,FAR],...arc(C(RG.wr1,FAR)),[RG.wr1,WEND],[RG.wr0,WEND],...arc(C(RG.wr0,FAR),1),[M.x0,FAR]]]; }
  const PATCH=CORN.map(c=>({id:'corner',x0:Math.min(c.x,c.cx),y0:Math.min(c.y,c.cy),x1:Math.max(c.x,c.cx),y1:Math.max(c.y,c.cy),z:c.cv?RD:0,col:c.cv?RW:SW(slabCol),tex:null,rep:2}));
  const SG=[], NM={main:SECTIONS.streets.south,west:SECTIONS.streets.west}, CN=[['main','west'],['main','west']];
  const TLC=[0], TK=(KR-.45)/Math.SQRT2;
  CORN.forEach((c,i)=>{ const k=c.cv?KR-1.2:KR+1.2, t=TLC.includes(i); SG.push({kind:'name',x:t?c.cx-c.sx*TK:c.cx-c.sx*k/Math.SQRT2,y:t?c.cy-c.sy*TK:c.cy-c.sy*k/Math.SQRT2,ax:NM[CN[i][0]],ay:NM[CN[i][1]],np:t}); });
  SG.push({kind:'name',x:RG.wr1+1,y:CURB-.75,ax:NM.main,ay:NM.west});
  { let q=0; for(const k of SHARED.BOD.kerbs){ if(k.at===MAP.x0||k.at===MAP.x1)continue; for(let a=k.a0+6;a<k.a1-4;a+=24){ if(inX(k.ax,k.at,a,2)||inJ(k.ax==='x'?a:k.at,k.ax==='x'?k.at:a,2))continue;
      const kind=q++%3===2?'speed':'nopark', p=k.at-k.n*.8; if(kind!=='speed')SG.push({kind,x:k.ax==='x'?a:p,y:k.ax==='x'?p:a,n:k.ax==='x'?[1,0]:[0,1]}); } } }
  SHARED.BOD.signs=[];
  SHARED.BOD.road={KR,CORN,RR,at:ROADAT,MH,DR,LN,xw:XW.map(([a0,a1,ax,l0,h0],i)=>({a0,a1,ax,l0,h0,lit:i===0}))}; window.STREETQ=()=>({...SHARED.BOD.road,XS:SHARED.BOD.XS,ZS:SHARED.BOD.ZS,CURB,FAR,MAP,RG,corner:DRESS.corner});
  SHARED.BOD.grounds=[
    {id:'shop',bld:true,x0:SB.x0,y0:SB.y0,x1:SB.x1,y1:SB.y1,z:.15,col:(x,y)=>bodegaFloorCol(x,y),tex:'concrete_floor_worn_001',tint:[112,116,124],rep:3},
    {id:'walk',x0:MAP.x0,y0:W,x1:MAP.x1,y1:CURB-KB,z:0,col:holed(slabCol),tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'kerb',x0:MAP.x0,y0:CURB-KB,x1:MAP.x1,y1:CURB,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'road',x0:MAP.x0,y0:CURB,x1:MAP.x1,y1:FAR,z:RD,col:RW,tex:'asphalt_02',tint:[62,64,68],rep:3},
    {id:'alley',x0:MAP.x0,y0:BLOCK.alley[0],x1:MAP.x1,y1:BLOCK.alley[1],z:0,col:(x,y)=>roadCol(x,y,1),tex:'asphalt_02',tint:[86,87,90],rep:3},
    {id:'prom',x0:MAP.x0,y0:BLOCK.prom[0],x1:MAP.x1,y1:BLOCK.prom[1],z:0,col:holed(slabCol),tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'kerb2',x0:RG.wr1,y0:FAR,x1:MAP.x1,y1:FAR+KB,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'walk2',x0:RG.wr1,y0:FAR+KB,x1:MAP.x1,y1:MAP.y1,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'kerb2w',x0:MAP.x0,y0:FAR,x1:RG.wr0,y1:FAR+KB,z:0,col:kerbCol('x'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'wstW',x0:RG.wx0,y0:FAR+KB,x1:RG.wr0-KB,y1:WEND,z:0,col:holed(slabCol),tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'wstKW',x0:RG.wr0-KB,y0:FAR+KB,x1:RG.wr0,y1:WEND,z:0,col:kerbCol('y'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'wstRoad',x0:RG.wr0,y0:FAR,x1:RG.wr1,y1:WEND,z:RD,col:RW,tex:'asphalt_02',tint:[62,64,68],rep:3},
    {id:'wstKE',x0:RG.wr1,y0:MAP.y1,x1:RG.wr1+KB,y1:WEND,z:0,col:kerbCol('y'),tex:'concrete_pavement',tint:[178,174,164],rep:2},
    {id:'wstE',x0:RG.wr1+KB,y0:MAP.y1,x1:RG.wx1,y1:WEND,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    {id:'wstEnd',x0:RG.wx0,y0:WEND,x1:RG.wx1,y1:WEND+3,z:0,col:slabCol,tex:'concrete_pavement',tint:[166,161,148],rep:2},
    (G=>({id:'ghostst',bld:true,x0:G.u(G.ground.x0),y0:G.v(G.Y0-1.2),x1:G.u(G.ground.x1),y1:G.y1e,z:.1,col:(x,y)=>G.court(G.iu(x),y>G.y1e-.25?y:G.iv(y)),tex:null,rep:2}))(SHARED.BOD.GDK),
    {id:'grassW',x0:MAP.x0,y0:B00.y0,x1:B0.x0,y1:W,z:0,col:holed(slabCol),tex:'concrete_pavement',tint:[166,161,148],rep:2},   // concrete behind the rows, no grass (owner, 9 Nov 2026)
    {id:'hudson',x0:BLOCK.hudson[0],y0:BLOCK.alley[1],x1:BLOCK.hudson[1],y1:CURB-KB,z:0,col:holed(slabCol),tex:'concrete_pavement',tint:[166,161,148],rep:2},...PATCH].map(g=>g.id==='corner'||g.bld||g.id==='alley'||g.id==='prom'||g.col===RW?g:{...g,col:SW(g.col)});
  // a ground leaves out what a later one at its height covers: two painted in one place fight for the same pixels (the way through to the Hudson over the lawn and the walk)
  { const G=SHARED.BOD.grounds; G.forEach((g,i)=>{ if(g.bld)return; const over=G.slice(i+1).filter(q=>!q.bld&&q.z===g.z&&q.x0<g.x1&&q.x1>g.x0&&q.y0<g.y1&&q.y1>g.y0); if(!over.length)return; const f=g.col; g.col=(x,y)=>over.some(q=>x>=q.x0&&x<q.x1&&y>=q.y0&&y<q.y1)?null:f(x,y); }); }
  SHARED.BOD.LAMPS=LAMPS.filter(l=>!l.off&&l.r>0);
const gk=(c,k)=>[Math.min(255,c[0]*k),Math.min(255,c[1]*k),Math.min(255,c[2]*k)];
const gMat=(hh,o)=>(q,n)=>{ if(n[2]>.5)return o.top||gk(o.c,1.1); if(n[2]<-.5)return o.bot||gk(o.c,.7); const z=q[2]/hh;
  if(o.bands)for(const [a,b,c] of o.bands)if(z>=a&&z<b)return c;
  if(o.lab&&n[1]>.5){ const [c,w,a,b]=o.lab; if(Math.abs(q[0])<w&&z>a&&z<b)return c; }
  if(o.crimp&&z>.8&&(Math.floor((q[0]+1)*60)&1))return gk(o.c,.7);
  return o.c; };
const GW=[240,238,230], GR=[200,200,206];
const GSC=1.25;
const box=(x,y,z,o)=>({t:'box',c:[0,0,z*GSC],h:[x*GSC,y*GSC,z*GSC],mat:gMat(z*GSC,o),bc:o.c,brand:o.brand}), cyl=(r,hh,o,z0=0)=>({t:'cyl',c:[0,0,(z0+hh)*GSC],r:r*GSC,hh:hh*GSC,mat:gMat(hh*GSC,o),bc:o.c,brand:o.brand});
const GOOD={
  can:(c)=>({parts:[cyl(.07,.125,{c,top:GR,bot:GR,bands:[[.85,1.01,GR],[-1.01,-.85,GR],[-.15,.35,gk(c,1.35)]]})],m:.37}),
  water:()=>({parts:[cyl(.068,.17,{c:[170,206,236],bands:[[-.2,.25,GW]]}),cyl(.026,.035,{c:[170,206,236],top:GW,bands:[[.3,1.01,GW]]},.34)],m:.52}),
  bottle:(c,cap=GW,lab=GW)=>({parts:[cyl(.07,.17,{c,bands:[[-.3,.3,lab]]}),cyl(.028,.04,{c,top:cap,bands:[[.2,1.01,cap]]},.34)],m:.6}),
  milk:(c)=>({parts:[box(.1,.1,.2,{c:GW,top:gk(GW,.9),bands:[[-1.01,-.8,c],[-.2,.35,c]]})],m:1.9}),
  eggs:()=>({parts:[box(.16,.1,.075,{c:[200,184,152],top:[214,198,166],bands:[[.6,1.01,[184,168,138]]]})],m:.4}),
  butter:()=>({parts:[box(.12,.06,.04,{c:[240,222,130],top:[250,236,170]})],m:.25}),
  cheese:()=>({parts:[box(.1,.1,.025,{c:[246,190,70],top:[214,226,234]})],m:.2}),
  yogurt:(c)=>({parts:[cyl(.07,.085,{c:GW,top:c,bands:[[-.4,.4,c]]})],m:.16}),
  cereal:(c)=>({parts:[box(.2,.07,.29,{c,lab:[[250,240,200],.13,-.1,.6]})],m:.5}),
  bread:()=>({parts:[box(.3,.125,.12,{c:[214,168,104],top:[232,196,140],bands:[[-1.01,-.7,[190,140,84]]]}),box(.03,.1,.08,{c:[230,230,236],top:[220,60,60]})],m:.6}),
  bagels:()=>({parts:[box(.2,.1,.1,{c:[230,226,214],top:[236,232,222],lab:[[200,150,90],.14,-.6,.5]})],m:.45}),
  coffee:(c)=>({parts:[cyl(.1,.135,{c,top:GR,bot:GR,bands:[[-.3,.3,[240,230,200]]]})],m:.9}),
  oats:()=>({parts:[cyl(.1,.19,{c:[200,150,90],top:[230,200,150],bands:[[-.4,.4,[240,230,200]]]})],m:.55}),
  bag:(c,w=.15,d=.09,h=.22,m=1)=>({parts:[box(w,d,h,{c,crimp:1,lab:[gk(c,1.35),w*.7,-.4,.4]})],m}),
  jar:(c,lid=[200,60,50])=>({parts:[cyl(.08,.11,{c,top:lid,bands:[[.82,1.01,lid],[-.4,.4,[240,236,226]]]})],m:.5}),
  soup:(c)=>({parts:[cyl(.078,.105,{c:GW,top:GR,bot:GR,bands:[[.85,1.01,GR],[-.6,.4,c]]})],m:.42}),
  tuna:()=>({parts:[cyl(.088,.04,{c:GR,top:GR,bands:[[-.6,.6,[60,110,170]]]})],m:.18}),
  pasta:()=>({parts:[box(.08,.05,.25,{c:[40,80,170],lab:[[240,220,150],.05,-.2,.5]})],m:.5}),
  noodle:()=>({parts:[cyl(.095,.11,{c:GW,top:[220,60,40],bands:[[.75,1.01,[220,60,40]]]})],m:.1}),
  candy:(c)=>({parts:[box(.13,.035,.012,{c,top:gk(c,1.25)})],m:.05}),
  gum:(c)=>({parts:[box(.085,.022,.02,{c,top:gk(c,1.2)})],m:.03}),
  tp:()=>({parts:[box(.21,.21,.12,{c:[244,244,244],top:[226,230,240],bands:[[-.1,.1,[210,214,226]]]})],m:.5}),
  towels:()=>({parts:[cyl(.12,.28,{c:[244,244,244],top:[236,236,236],bands:[[-.2,.2,[90,150,210]]]})],m:.3}),
  dish:()=>({parts:[box(.085,.04,.2,{c:[90,190,110],top:[230,230,230]}),box(.02,.02,.025,{c:GW},.4)],m:.5}),
  jug:()=>({parts:[box(.2,.12,.25,{c:[240,140,40],lab:[GW,.14,-.5,.3]}),box(.06,.05,.04,{c:[240,140,40],top:[40,40,44]},.54)],m:3}),
  sponge:()=>({parts:[box(.09,.06,.03,{c:[240,220,60],top:[60,150,80]})],m:.03}),
  tbags:()=>({parts:[box(.25,.12,.12,{c:[60,64,70],lab:[[230,230,230],.18,-.4,.4]})],m:.5}),
  bulbs:()=>({parts:[box(.06,.06,.115,{c:GW,top:[240,200,60],bands:[[.6,1.01,[240,200,60]]]})],m:.08}),
  batt:()=>({parts:[box(.1,.02,.16,{c:[220,60,50],lab:[[210,170,60],.06,-.5,.5]})],m:.1}),
  matches:()=>({parts:[box(.05,.035,.015,{c:[200,40,40],top:[230,220,200]})],m:.02}),
  lighter:(c)=>({parts:[box(.085,.025,.012,{c,top:gk(c,1.2)})],m:.02}),
  soap:(c)=>({parts:[box(.095,.06,.03,{c,top:gk(c,1.15)})],m:.12}),
  paste:()=>({parts:[box(.19,.04,.04,{c:[240,240,240],top:[240,240,240],lab:[[40,110,200],.19,-1.01,1.01]})],m:.15}),
  brush:(c)=>({parts:[box(.03,.015,.2,{c,top:GW,bands:[[.7,1.01,GW]]})],m:.03}),
  shampoo:(c)=>({parts:[box(.075,.04,.2,{c,top:GW,lab:[GW,.05,-.3,.3]})],m:.45}),
  deo:()=>({parts:[cyl(.047,.145,{c:[80,90,110],top:[230,230,230],bands:[[.75,1.01,[230,230,230]]]})],m:.15}),
  pills:()=>({parts:[box(.095,.04,.065,{c:GW,top:GW,bands:[[.4,1.01,[220,50,50]]]})],m:.05}),
  cotton:()=>({parts:[box(.15,.075,.15,{c:[226,226,236],crimp:1,lab:[[160,190,230],.1,-.3,.3]})],m:.1}),
  catfood:()=>({parts:[cyl(.088,.05,{c:GR,top:GR,bands:[[-.7,.6,[150,90,170]]]})],m:.17}),
  dogfood:()=>({parts:[box(.2,.08,.3,{c:[170,110,50],crimp:1,lab:[[240,220,150],.14,-.4,.3]})],m:2}),
  fishfood:()=>({parts:[cyl(.065,.09,{c:[236,232,222],top:[200,50,40],bands:[[.7,1.01,[200,50,40]],[-.4,.1,[50,104,176]]]})],m:.08}),
  bananas:()=>({parts:[box(.16,.08,.045,{c:[240,210,60],top:[244,220,80],bands:[[-1.01,-.5,[200,170,40]]]})],m:.9})};
const GC={red:[196,60,52],blue:[40,90,170],grn:[70,150,90],yel:[228,170,60],org:[240,140,40],pur:[120,60,150],pink:[226,120,150],brn:[120,70,40],blk:[40,40,46],sky:[150,200,240]};
// every good takes a brand as its last word: painted on its label face from the atlas (the real names of the 1980s)
for(const k of Object.keys(GOOD)){ const f=GOOD[k]; GOOD[k]=(...a)=>{ const b=typeof a[a.length-1]==='string'?a.pop():null; const g=f(...a); if(b)g.parts[0].brand=b; return g; }; }
Object.assign(GOOD,{
  goya:()=>({parts:[cyl(.075,.11,{c:[40,90,170],top:GR,bot:GR,bands:[[.85,1.01,GR],[-1.01,-.85,GR],[-.3,.3,[240,200,60]]],brand:'GOYA'})],m:.45}),
  vienna:()=>({parts:[cyl(.055,.085,{c:[60,110,170],top:GR,bot:GR,bands:[[.85,1.01,GR],[-1.01,-.85,GR]],brand:'VIENNA'})],m:.2}),
  spam:()=>({parts:[box(.1,.06,.085,{c:[40,80,170],top:GR,brand:'SPAM'})],m:.35}),
  tide:()=>({parts:[box(.2,.08,.26,{c:[240,120,30],top:[250,160,60],brand:'TIDE'})],m:.9}),
  ajax:()=>({parts:[cyl(.06,.19,{c:[60,120,200],top:[220,60,60],brand:'AJAX'})],m:.4}),
  pampers:()=>({parts:[box(.3,.14,.24,{c:[90,160,220],top:[120,180,230],brand:'PAMPERS'})],m:.8}),
  koolaid:()=>({parts:[box(.075,.02,.1,{c:[200,40,40],top:[220,60,60],brand:'KOOL-AID'})],m:.02}),
  candle:(c=GW)=>({parts:[cyl(.045,.2,{c,top:[240,220,120],brand:'7 DIAS'})],m:.4}),
  sack:(c=[240,236,220])=>({parts:[box(.42,.26,.5,{c,top:gk(c,.95),bands:[[-.2,.3,[220,60,40]]],brand:'CAROLINA'})],m:9}),
  platano:()=>({parts:[box(.22,.1,.06,{c:[120,160,60],top:[150,190,80],brand:'PLATANOS'})],m:.6})});
const GLAY={
  fridge1:[[['water',4,'POLAND SPRING']],[['can',3,GC.red,'COCA-COLA'],['can',2,GC.grn,'SPRITE']],[['can',3,GC.blue,'PEPSI'],['can',2,GC.sky,'SCHAEFER']],[['bottle',4,[110,60,40],[220,40,40],'MALTA GOYA']]],
  fridge2:[[['bottle',4,GC.org,GW,GW,'ORANGE CRUSH']],[['bottle',4,[90,150,70],GW,[90,150,70],'COCO RICO']],[['can',5,[230,190,70],'COLT 45']],[['bottle',4,[200,170,130],[90,60,40],[90,60,40],'MILLER HIGH LIFE']]],
  fridge3:[[['milk',2,GC.blue,'DAIRYLEA'],['milk',2,GC.red,'TUSCAN']],[['eggs',2,'GRADE A EGGS']],[['butter',2,"BREAKSTONE'S"],['cheese',2,'KRAFT']],[['yogurt',3,GC.pink,'DANNON'],['yogurt',2,GC.blue,'DANNON']]],
  aisle1a:[[['bread',2,'WONDER'],['bagels',2,'BAGELS']],[['cereal',2,GC.yel,'CHEERIOS'],['cereal',2,GC.red,'CORN FLAKES'],['cereal',1,GC.blue,'FROOT LOOPS'],['oats',2,'QUAKER']],[['coffee',2,[236,196,40],'CAFE BUSTELO'],['coffee',1,GC.red,'EL PICO'],['bag',2,GW,.15,.09,.22,2,'GOYA RICE'],['bag',1,[230,200,140],.15,.09,.22,2,'GOYA BEANS']],[['jar',3,[160,100,50],'GOYA ADOBO'],['jar',3,[150,40,80],GR,'SAZON'],['bag',2,[240,236,226],.14,.07,.19,1,'DOMINO SUGAR']]],
  aisle1b:[[['soup',4,GC.red,"CAMPBELL'S"],['soup',3,GC.grn,'PROGRESSO'],['goya',3]],[['soup',4,GC.blue,'CHEF BOYARDEE'],['tuna',4,'STARKIST']],[['pasta',5,'RONZONI'],['vienna',3],['spam',2]],[['noodle',3,'NISSIN'],['koolaid',6]]],
  aisle2a:[[['bag',3,GC.yel,.22,.075,.3,.2,'WISE'],['bag',3,GC.red,.22,.075,.3,.2,'DORITOS']],[['bag',3,GC.grn,.2,.07,.25,.2,'WISE ONION'],['bag',2,GC.org,.2,.07,.25,.2,'CHEEZ DOODLES']],[['bag',3,[140,90,60],.2,.06,.1,.3,"DRAKE'S"],['bag',3,[240,220,160],.12,.05,.17,.25,"ENTENMANN'S"]],[['candy',3,GC.brn,"HERSHEY'S"],['candy',3,GC.red,'NOW & LATER'],['candy',3,GC.yel,'BAZOOKA']]],
  aisle2b:[[['catfood',8,'PURINA']],[['catfood',6,'9 LIVES'],['jar',2,GW,[60,60,60],'VASELINE']],[['dogfood',3,'ALPO']],[['fishfood',5,'TETRA']]],
  back1:[[['tp',3,'SCOTT'],['towels',3,'BOUNTY']],[['dish',3,'PALMOLIVE'],['jug',2,'CLOROX'],['sponge',2,'BRILLO']],[['tide',2],['ajax',2],['pampers',1]],[['tbags',2,'LIPTON'],['bulbs',3,'GE'],['batt',3,'DURACELL'],['matches',4,'DIAMOND']]],
  back2:[[['soap',4,[150,200,230],'IVORY'],['paste',3,'COLGATE']],[['shampoo',3,GC.blue,'PRELL'],['shampoo',3,GC.pink,"JOHNSON'S"],['deo',4,'RIGHT GUARD']],[['brush',6,[120,200,230],'REACH'],['pills',4,'BAYER']],[['cotton',4,'Q-TIPS'],['candle',4]]],
  mid1:[[['goya',6],['goya',4]],[['platano',3],['vienna',4],['spam',3]],[['koolaid',8],['candy',6,GC.yel,'BAZOOKA'],['candy',4,GC.org,'CHICK-O-STICK']],[['candle',5,[200,60,50]],['candle',5,[60,120,80]]]],
  win1:[[['coffee',5,[236,196,40],'CAFE BUSTELO']],[['coffee',5,[236,196,40],'CAFE BUSTELO']],[['coffee',4,[236,196,40],'CAFE BUSTELO']],[['coffee',3,[236,196,40],'CAFE BUSTELO']]],
  win2:[[['can',5,GC.red,'COCA-COLA']],[['can',5,[230,190,70],'COLT 45']],[['bag',3,GC.yel,.22,.075,.3,.2,'WISE']],[['pampers',2]]],
  counter:[['candy',3,GC.brn,'SNICKERS'],['candy',3,GC.yel,"M&M'S"],['gum',3,GC.grn,"WRIGLEY'S"],['gum',3,GC.blue,'BUBBLE YUM'],['lighter',3,GC.red,'BIC'],['bananas',1,'CHIQUITA']]};
// THE BODEGA'S SOLIDS: walls and props become collision boxes; BOUND and groundY for the bodega.

  SHARED.BOD.GOOD=GOOD; SHARED.BOD.GLAY=GLAY; SHARED.BOD.GC=GC;
  const sol=(x0,y0,x1,y1,zt)=>{ solids.push([X(x0),Z(y0),X(x1),Z(y1)]); fixed.push([X(x0),Z(y0),0,X(x1),Z(y1),Math.max(.05,Y(zt))]); };
  for(const w of WALLS){ let a=w.a0; const ds=w.holes.filter(h=>h.door&&!h.locked).sort((p,q)=>p.a0-q.a0);
    const seg=(a0,a1)=>{ if(a1-a0<.01)return; if(w.ax==='x')sol(a0,w.at-.1,a1,w.at+.1,w.H); else sol(w.at-.1,a0,w.at+.1,a1,w.H); };
    for(const d of ds){ seg(a,d.a0); a=d.a1; } seg(a,w.a1); }
  for(const p of [...Object.values(O),...STREET,...GHOSTST]){ if(p.high||/mat$|^door mat|bags|fly|tube|bell|clock|calendar|cord|mirror|phone|flap|dock|radio|cigs|chair/.test(p.key||p.name||''))continue;
    const bs=p.boxes.filter(b=>!b.nb&&b.z0<30&&b.z1-b.z0>3); if(!bs.length)continue; const r={x0:Math.min(...bs.map(b=>b.x0)),y0:Math.min(...bs.map(b=>b.y0)),x1:Math.max(...bs.map(b=>b.x1)),y1:Math.max(...bs.map(b=>b.y1))};
    sol(r.x0,r.y0,r.x1,r.y1,Math.max(...bs.map(b=>b.z1))); }
  BOUND={x0:XS(MAP.x0),x1:XS(MAP.x1),z0:Z(B00.y0),z1:ZS(MAP.y1)};
  groundY=(x,z)=>{ const gx=x/TILE+OX, gy=z/TILE+OY, rw=rampAt(gx,gy); if(rw!=null)return YS(RD*(1-rw/RPD)); return ROADAT(gx,gy)?YS(RD):(MODS.hill?MODS.hill(x,z):0); };
  if(!SHARED.BOD.HUD)sol(B0.x0,B0.y0,B0.x1,B0.y1,B0.h);
  SHARED.BOD.inside=(x,z)=>{ const gx=x/TILE/K+OX, gy=z/TILE/K+OY; return gx>SB.x0&&gx<SB.x1&&gy>SB.y0&&gy<SB.y1; };
}
SHARED.BOD.streetSigns=()=>{ const X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, V3=THREE.Vector3, R=48/TILE, h3=(a,b,c)=>{ const v=Math.sin(a*12.9898+b*78.233+c*37.719)*43758.5453; return v-Math.floor(v); };
  const F5={A:'ehhvhhh',B:'uhhuhhu',C:'ehggghe',D:'uhhhhhu',E:'vgguggv',F:'vgguggg',G:'ehgnhhf',H:'hhhvhhh',I:'e44444e',K:'hikokih',L:'ggggggv',M:'hrllhhh',N:'hpljhhh',O:'ehhhhhe',
    P:'uhhuggg',R:'uhhukih',S:'fgge11u',T:'v444444',U:'hhhhhhe',V:'hhhhha4',W:'hhhllla',Y:'hha4444',X:'hha4ahh',0:'ehjlphe',1:'4c4444e',2:'eh1248v',3:'v2421he',5:'vgu11he',6:'68guhhe',8:'ehhehhe','-':'000e000'};
  const gl=(s,i,j,sc=1)=>{ if(i<0||j<0)return false; i=Math.floor(i/sc); j=Math.floor(j/sc); const g=F5[s[Math.floor(i/6)]]; return !!g&&i%6<5&&j<7&&!!(parseInt(g[j],32)>>(4-i%6)&1); }, gw=(s,sc=1)=>(s.length*6-1)*sc;
  const tx=(s,W,top,sc=1)=>(i,j)=>gl(s,i-Math.floor((W-gw(s,sc))/2),j-top,sc);
  const arrow=(W,cy,d)=>(i,j)=>{ const x0=Math.floor(W*.22), x1=W-1-x0, dy=Math.abs(j-cy); if(i<x0||i>x1)return false; if(d>=0&&i>x1-4)return dy<=x1-i; if(d<=0&&i<x0+4)return dy<=i-x0; return dy<=1; };
  const WH=[238,238,230], RED=[200,34,38], BK=[22,22,24], GN=[18,98,60], GALV=[150,154,158], RUST=[128,66,34], EDGE=[112,116,120];
  const mix=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
  const wear=(base,s,o={})=>(i,j,W,H)=>{ if(o.round!==false&&Math.min(i,W-1-i)+Math.min(j,H-1-j)<2)return null; let c=base(i,j,W,H); if(!c)return null; const r=h3(i,j,s);
    if(c===RED)c=mix(c,[232,176,166],[0,.22,.4][Math.floor(h3(s,7,1)*3)]); else if(c===GN)c=mix(c,[86,140,110],[0,.25][Math.floor(h3(s,8,1)*2)]);
    if(o.edge!==false&&(i===0||j===0))c=mix(c,[255,255,255],.3); else if(o.edge!==false&&(i===W-1||j===H-1))c=mix(c,[0,0,0],.3);
    const bx=Math.floor(W/2)-1; for(const by of o.bolts?[3,H-5]:[]){ if((i===bx||i===bx+1)&&(j===by||j===by+1))return i===bx&&j===by?[206,208,210]:[84,86,90];
      const L=2+Math.floor(h3(s,by,3)*6); if(i===bx+(h3(s,by,4)<.5?0:1)&&j>by+1&&j<=by+1+L)c=mix(c,RUST,j<=by+1+L/2?.75:.4); }
    for(let k=0;k<2;k++){ if(h3(s,k,9)>(k?.25:.6))continue; const sx=Math.floor(h3(s,k,10)*(W-9)), sy=Math.floor(h3(s,k,11)*(H-7)), ty=Math.floor(h3(s,k,12)*3), sw=ty===2?8:6, sh=ty===2?5:5;
      if(i>=sx&&i<sx+sw&&j>=sy&&j<sy+sh){ if(ty===0)return (j-sy)%2&&i>sx&&i<sx+sw-1?[40,40,48]:[236,232,220]; if(ty===1)return i===sx+2&&j===sy+2?[30,30,30]:[[230,196,40],[60,120,200],[220,90,150]][k];
        if(h3(i,j,s+5)<.65)c=[214,206,190]; } }
    if(h3(s,13,1)<.3){ const tx0=Math.floor(h3(s,14,1)*(W*.5)), ty0=Math.floor(H*.3+h3(s,15,1)*H*.5); if(i>=tx0&&i<tx0+Math.min(20,W*.45)&&j===ty0+Math.round(2.2*Math.sin(i*.8+s)))c=h3(s,16,1)<.5?[28,28,34]:[196,200,206]; }
    if(r<.035)c=mix(c,[60,56,50],.3); if(j>=H-3&&j<H-1&&r<.5)c=mix(c,[90,84,72],.18);
    const d=i+j*.9-W*.3; if(i<W*.6&&j<H*.6&&(d>=0&&d<1.6||d>=3.2&&d<4))c=mix(c,[255,255,255],.38);
    return c.map(v=>v*(.95+.08*r)); };
  const back=s=>wear((i,j,W,H)=>W>40&&gl('NYC DOT',i-Math.floor((W-gw('NYC DOT'))/2),j-(H-12))?[118,122,126]:GALV,s+50,{bolts:1});
  const quad=(p,t)=>SHARED.BOD.bq(p[0].toArray(),p[1].toArray(),p[2].toArray(),p[3].toArray(),t,'L');
  const tex=(w,h,f)=>{ const W=Math.max(1,Math.round(w*R)), H=Math.max(1,Math.round(h*R)); return SHARED.BOD.faceTex(W,H,(i,j)=>f(i,j,W,H)); };
  const ob=(c,a,u,n,P,off=0,FW=0)=>{ '@later'; const A=a.length()*2, U=u.length()*2, N=n.length()*2, q=(x,y,z)=>c.clone().addScaledVector(a,x).addScaledVector(u,y).addScaledVector(n,z), FR=P('f'), BA=P('b');
    quad([q(-1,-1,1),q(1,-1,1),q(1,1,1),q(-1,1,1)],tex(A,U,FW?(i,j,W,H)=>FR(i+off,j,FW,H):FR));
    quad([q(1,-1,-1),q(-1,-1,-1),q(-1,1,-1),q(1,1,-1)],tex(A,U,FW?(i,j,W,H)=>BA(i+FW-off-W,j,FW,H):BA));
    quad([q(1,-1,1),q(1,-1,-1),q(1,1,-1),q(1,1,1)],tex(N,U,P('s'))); quad([q(-1,-1,-1),q(-1,-1,1),q(-1,1,1),q(-1,1,-1)],tex(N,U,P('s'))); quad([q(-1,1,1),q(1,1,1),q(1,1,-1),q(-1,1,-1)],tex(A,N,P('t'))); };
  const frame=(x,y,n,s)=>{ '@later'; const lean=h3(s,1,2)<.25?.03+.04*h3(s,2,3):0, la=h3(s,3,4)*6.28, L=new V3(Math.cos(la)*lean,1,Math.sin(la)*lean).normalize(), N=new V3(n[0],0,n[1]), A=new V3().crossVectors(L,N).normalize();
    N.crossVectors(A,L).normalize(); const B=new V3(X(x),0,Z(y)); return {B,L,N,A,s,at:z=>B.clone().addScaledVector(L,z*ZU)}; };
  const PW=.075*TILE, PD=.05*TILE, T=.03*TILE;
  const post=(S,top,round)=>{ '@later'; const s=S.s, fl=h3(s,20,1)<.4?42+Math.floor(h3(s,21,1)*20):-99;
    ob(S.at(top/2),S.A.clone().multiplyScalar(PW/2),S.L.clone().multiplyScalar(top*ZU/2),S.N.clone().multiplyScalar(PD/2),k=>k==='t'?()=>[96,100,104]:k==='s'?(i,j,W,H)=>H-j<H*.05?RUST:[118,122,126]:(i,j,W,H)=>{ const z=(H-1-j)/H*top, r=h3(i,j,s);
      if(z<top*.05)return r<.6?RUST:[96,86,72]; if(z>fl&&z<fl+7)return (Math.floor(z)%2&&r<.7)?[60,60,66]:[226,222,208]; if(!round&&i===Math.floor(W/2)&&j%4===0)return [40,42,46]; return round&&i===0?[176,180,184]:GALV.map(v=>v*(.93+.1*r)); }); };
  const plate=(S,side,z0,z1,w,front,o={})=>{ '@later'; const n=S.N.clone().multiplyScalar(side), a=S.A.clone().multiplyScalar(side), h=(z1-z0)*ZU, c=S.at((z0+z1)/2).addScaledVector(n,o.on?0:PD/2+T/2+.004*TILE), FW=Math.round(w*R);
    const b=o.bend||0, a2=a.clone().multiplyScalar(Math.cos(b)).addScaledVector(n,Math.sin(b)), n2=n.clone().multiplyScalar(Math.cos(b)).addScaledVector(a,-Math.sin(b)), u=S.L.clone().multiplyScalar(h/2), BK_=o.both?front:back(S.s+side);
    const P=k=>k==='f'?front:k==='b'?BK_:()=>EDGE, H0=Math.round(w/2*R);
    ob(c.clone().addScaledVector(a,-w/4),a.clone().multiplyScalar(w/4),u,n.clone().multiplyScalar(T/2),P,0,FW); ob(c.clone().addScaledVector(a2,w/4),a2.clone().multiplyScalar(w/4),u,n2.clone().multiplyScalar(T/2),P,H0,FW); };
  const nopark=(s,dir)=>{ '@later'; const v=Math.floor(h3(s,30,1)*3);
    return wear((i,j,W,H)=>{ if(i===1||j===1||i===W-2||j===H-2)return RED;
      if(v===1){ const cx=(W-1)/2, cy=18, r=Math.hypot(i-cx,j-cy); if(r>10.5&&r<13.5||r<13.5&&Math.abs((i-cx)+(j-cy))*.7<1.3)return RED; if(r<10.5)return tx('P',W,cy-7,2)(i,j)?BK:WH;
        return tx('8AM-6PM',W,36)(i,j)||arrow(W,50,dir)(i,j)?RED:WH; }
      const L=v===0?[['NO',4,2],['PARKING',20,1],['8AM-6PM',30,1],['EXC SUN',39,1]]:[['NO',4,2],['STANDING',20,1],['ANYTIME',31,1]];
      for(const [t,y,sc] of L)if(tx(t,W,y,sc)(i,j))return RED; return arrow(W,v===0?51:45,dir)(i,j)?RED:WH; },s,{bolts:1}); };
  const speed=s=>wear((i,j,W,H)=>{ if(i===2||j===2||i===W-3||j===H-3||i===3||j===3||i===W-4||j===H-4)return BK; for(const [t,y,sc] of [['SPEED',9,2],['LIMIT',27,2],['25',50,5]])if(tx(t,W,y,sc)(i,j))return BK; return WH; },s,{bolts:1});
  const stop=s=>wear((i,j,W,H)=>{ const x=Math.abs(i-(W-1)/2)/((W-1)/2), y=Math.abs(j-(H-1)/2)/((H-1)/2); if(x+y>1.42)return null; if(x>.9||y>.9||x+y>1.3)return WH; return tx('STOP',W,Math.floor((H-14)/2),2)(i,j)?WH:RED; },s,{bolts:1,round:false,edge:false});
  const blade=(t,s)=>wear((i,j,W,H)=>{ if(i===1||j===1||i===W-2||j===H-2)return WH; return tx(t,W,Math.floor((H-14)/2),2)(i,j)?WH:GN; },s);
  const zT=5.6*TILE/.84/ZU;
  BATCH.tag=OBJ('street','street signs');
  SHARED.BOD.signs.forEach((g,k)=>{ '@later'; const {x,y}=g, s=k*7.31+1.7, bend=h3(s,40,1)<.22?(h3(s,41,1)<.5?-1:1)*(.12+.12*h3(s,42,1)):0;
    if(g.kind==='name'){ const S=frame(x,y,[0,1],s), z0=g.np?zT+6:107; if(!g.np)post(S,104,1); ob(S.at(z0-1.5),S.A.clone().multiplyScalar(PW*.7),S.L.clone().multiplyScalar(1.5*ZU),S.N.clone().multiplyScalar(PW*.7),()=>()=>[96,100,104]);
      plate(S,1,z0,z0+18,3.5*TILE,blade(g.ax,s),{on:1,both:1}); ob(S.at(z0+19),S.A.clone().multiplyScalar(PW*.7),S.L.clone().multiplyScalar(ZU),S.N.clone().multiplyScalar(PW*.7),()=>()=>[96,100,104]);
      const S2=frame(x,y,[1,0],s); S2.L=S.L; S2.B=S.B; S2.A=new V3().crossVectors(S.L,S2.N).normalize(); plate(S2,1,z0+20,z0+38,3.5*TILE,blade(g.ay,s+3),{on:1,both:1}); }
    else if(g.kind==='stop'){ const S=frame(x,y,g.n,s); post(S,118); plate(S,-1,74,116,1.6*TILE,stop(s)); }
    else if(g.kind==='nopark'){ const S=frame(x,y,g.n,s); post(S,108); plate(S,1,70,106,1.1*TILE,nopark(s,h3(s,31,1)<.5?0:1),{bend}); plate(S,-1,70,106,1.1*TILE,nopark(s+11,h3(s,31,1)<.5?0:-1)); }
    else if(g.kind==='speed'){ const S=frame(x,y,g.n,s); post(S,124); plate(S,-1,62,122,2*TILE,speed(s),{bend:bend*.6}); } });
  BATCH.tag=null; };
// BUILDING THE BODEGA: faces batched into meshes, the ground painted a patch at a time round you (a BATCH.queue), lamps and goods.
SHARED.BODB={};
{ const {X,Y,Z,B0,BODOFF}=SHARED.BOD, {bodegaWall,grain,speck,COPE,hash}=SHARED.BOD.g, H=B0.h, KINDS={};
  const inside=()=>SHARED.BOD.inside(pos.x,pos.z); SHARED.BODB.inside=inside;
  const paint=(w,s,u,z)=>{ const nx=w.ax==='y'?s:0, ny=w.ax==='x'?s:0, Xw=w.ax==='y'?w.at+s*.1:u, Yw=w.ax==='x'?w.at+s*.1:u;
    return (!w.outer||s===w.inS)?bodegaWall(null,nx,ny,Xw,Yw,z,1):SHARED.BOD.facade(nx,ny,Xw,Yw,z,1,w.H); };
  const wallPt=(w,s,a,z)=>w.ax==='x'?[X(a),Y(z),Z(w.at+s*.1)]:[X(w.at+s*.1),Y(z),Z(a)];
  const glassMat=new THREE.MeshLambertMaterial({color:new THREE.Color(.09,.11,.14),side:THREE.DoubleSide}), glassIn=new THREE.MeshBasicMaterial({color:0x8fa6b8,side:THREE.DoubleSide}); glassIn.userData.keep=true;
  SHARED.BODB.tick=()=>{ if(SHARED.BODB.SG)glassIn.color.setHex(CLOCK.dark()?0x141a24:0x8fa6b8); };
  const wallF=(w,inn)=>{ const as=new Set([w.a0,w.a1]), zs=new Set([0,w.H]), kind='W'+w.id;
    for(const h of w.holes){ as.add(Math.max(w.a0,h.a0)); as.add(Math.min(w.a1,h.a1)); zs.add(h.z0); zs.add(h.z1); }
    const A=[...as].sort((p,q)=>p-q), Zs=[...zs].sort((p,q)=>p-q);
    for(const s of [-1,1]){ if((!w.outer||s===w.inS)!==inn)continue; for(let i=0;i+1<A.length;i++)for(let j=0;j+1<Zs.length;j++){ const a0=A[i], a1=A[i+1], z0=Zs[j], z1=Zs[j+1];
      if(w.holes.some(h=>(a0+a1)/2>h.a0&&(a0+a1)/2<h.a1&&(z0+z1)/2>h.z0&&(z0+z1)/2<h.z1))continue;
      SHARED.BOD.bq(wallPt(w,s,a0,z0),wallPt(w,s,a1,z0),wallPt(w,s,a1,z1),wallPt(w,s,a0,z1),SHARED.BOD.faceTex((a1-a0)*24,z1-z0,(ii,jj)=>SHARED.BOD.C(paint(w,s,a0+(ii+.5)/24,z1-jj-.5))),kind); } } };
  const wallR=w=>{ const kind='W'+w.id, pt=(a,z,o)=>w.ax==='x'?[X(a),Y(z),Z(w.at+o)]:[X(w.at+o),Y(z),Z(a)], fr=(P,len,hg,c)=>SHARED.BOD.bq(...P,SHARED.BOD.faceTex(Math.max(1,len*24),Math.max(1,hg),()=>c),kind);
    fr([pt(w.a0,w.H,-.1),pt(w.a1,w.H,-.1),pt(w.a1,w.H,.1),pt(w.a0,w.H,.1)],w.a1-w.a0,5,COPE);
    for(const h of w.holes){ for(const a of [h.a0,h.a1])fr([pt(a,h.z0,-.1),pt(a,h.z0,.1),pt(a,h.z1,.1),pt(a,h.z1,-.1)],.2,h.z1-h.z0,SHARED.BOD.FRAME);
      fr([pt(h.a0,h.z1,-.1),pt(h.a1,h.z1,-.1),pt(h.a1,h.z1,.1),pt(h.a0,h.z1,.1)],h.a1-h.a0,5,SHARED.BOD.FRAME); if(h.z0>0)fr([pt(h.a0,h.z0,-.1),pt(h.a1,h.z0,-.1),pt(h.a1,h.z0,.1),pt(h.a0,h.z0,.1)],h.a1-h.a0,5,SHARED.BOD.FRAME);
      if(h.locked)for(const o of [-.1,.1])SHARED.BOD.bq(pt(h.a0,h.z0,o),pt(h.a1,h.z0,o),pt(h.a1,h.z1,o),pt(h.a0,h.z1,o),SHARED.BOD.faceTex((h.a1-h.a0)*24,h.z1-h.z0,(i,j)=>{ const u=i/((h.a1-h.a0)*24), z=h.z1-h.z0-j, e=Math.min(u,1-u)*(h.a1-h.a0)*24;
        if(Math.abs(u-.84)<.035&&Math.abs(z-44)<2.5)return [196,160,70]; if(Math.abs(u-.84)<.03&&Math.abs(z-50)<1.5)return [60,52,40]; const pan=e>5&&(z>8&&z<40||z>48&&z<86)&&!(e>5&&e<7||z<10||z>84||z>38&&z<50), g=hash(i>>1,Math.floor(z/3),233);
        return sh(e<2?[70,52,40]:[112,70,48],(pan?.86:1)*(.92+.14*g)); }),kind);
      if(!h.glass&&!h.door&&!h.open){ const sd=Math.floor(Math.abs(h.a0*7+w.at*13+h.z0)); SHARED.BOD.window([pt(h.a0,h.z0,0),pt(h.a1,h.z0,0),pt(h.a1,h.z1,0),pt(h.a0,h.z1,0)],h.a1-h.a0,h.z1-h.z0,hash(sd,3,11)<.5,sd,kind); }
      if(h.glass){ const m=new THREE.Mesh(new THREE.PlaneGeometry((h.a1-h.a0)*TILE,Y(h.z1)-Y(h.z0)),glassIn);
        if(w.ax==='x')m.position.set(X((h.a0+h.a1)/2),Y((h.z0+h.z1)/2),Z(w.at)); else{ m.position.set(X(w.at),Y((h.z0+h.z1)/2),Z((h.a0+h.a1)/2)); m.rotation.y=Math.PI/2; } scene.add(m); if(w.outer)WINDOWS.pane(m,'bodega','out'); } } };
  if(!SHARED.BOD.HUD){ const fw=SHARED.BOD.WALLS.find(w=>w.id==='front'), sx=B0.x0-SHARED.BOD.SB.x0, HO=fw.holes.map(h=>({...h,a0:h.a0+sx,a1:h.a1+sx})), NS={f:[0,1],b:[0,-1],w:[-1,0],e:[1,0]};
    const PAL=[[200,60,50],[60,110,190],[230,190,60],[80,150,80],[220,220,210],[190,110,60],[150,80,150]];
    const glimpse=(a,z)=>{ const i=Math.floor(a*24), sn=Math.abs(((i+z*.7)%22+22)%22-11)<1.6; if(z>84&&z<87)return [226,234,222,1];
      if(z>16&&z<78){ const r=Math.floor((z-16)/16), zz=(z-16)%16; if(zz<2)return sn?[118,112,100,1]:[92,86,76,1]; if(zz<12&&hash(i>>1,r,317)<.78){ const c=PAL[Math.floor(hash(i>>1,r,319)*PAL.length)]; return [c[0]*.62+20,c[1]*.62+18,c[2]*.62+12,1]; } }
      return sn?[120,118,104,1]:[64,60,50,1]; };
    const paintB=(side,u,z)=>{ if(side==='f')for(const h of HO)if(u>h.a0&&u<h.a1&&z>h.z0&&z<h.z1){ const e=Math.min(u-h.a0,h.a1-u)*24; return e<2.4||h.z1-z<2.4||h.z0>0&&z-h.z0<2.4?SHARED.BOD.FRAME:glimpse(u-h.a0,z); }
      const [nx,ny]=NS[side]; return SHARED.BOD.facade(nx,ny,side==='w'?B0.x0:side==='e'?B0.x1:u,side==='f'?B0.y1:side==='b'?B0.y0:u,z,1,B0.h); };
    BLOCKS.make({x0:B0.x0,y0:B0.y0,x1:B0.x1,y1:B0.y1-.1,z0:0,z1:B0.h,kind:'K',px:24,paint:paintB}); }
  const {cvNoise}=SHARED.BOD.g, sh=SHARED.BOD.K.sh, RW=B0.x1-B0.x0, RH=B0.y1-B0.y0, PATCH=[[1.2,2.5,3.6,4.4,0],[4.6,8.2,7.1,9.6,0],[2.1,10.6,3.4,11.5,1],[5.3,1.1,6.9,2.3,2],[.7,6.4,1.7,8.8,2],[5.9,5.2,6.6,5.9,0]], POND=[[3.2,6.3,1.2,.8],[6.2,12.1,.9,.6],[1.5,12.7,.7,.5],[4.5,3.4,.5,.4]];
  const roofCol=(x,y)=>{ const u=x-B0.x0, v=y-B0.y0, i=Math.floor(x*24), j=Math.floor(y*24), h1=hash(i,j,71), sN=Math.floor(v/1.45), sv=v-sN*1.45, wob=(cvNoise(u*3,sN,73)-.5)*.07;
    let c=sh([[50,50,52],[57,56,56],[45,45,48],[54,53,50]][Math.floor(hash(sN,1,75)*4)],.9+.2*grain(x,y,61,1.4));
    if(h1<.16)c=sh(c,1.38); else if(h1<.22)c=[c[0]*1.24,c[1]*1.14,c[2]]; else if(h1>.97)c=sh(c,.7);
    if(Math.abs(sv-.05-wob)<.03)c=sh(c,.6); else if(Math.abs(sv-.11-wob)<.03&&cvNoise(u*2,sN,77)>.45)c=sh(c,1.3);
    for(const [a,b,c2,d,k] of PATCH){ const e=.07*(cvNoise(u*4,v*4,79)-.5); if(u>a+e&&u<c2-e&&v>b+e&&v<d-e){ const ed=Math.min(u-a-e,c2-e-u,v-b-e,d-e-v); c=k===1?(h1<.3?[124,126,124]:h1<.55?[158,160,156]:[144,146,144]):k===2?[40,37,36]:[33,33,36]; if(k!==1&&h1<.08)c=sh(c,1.7); if(ed<.06)c=sh(c,k===1?.78:1.5); } }
    for(const [cu,cv,ru,rv] of POND){ const d=Math.hypot((u-cu)/ru,(v-cv)/rv)+cvNoise(u*1.6,v*1.6,81)*.7+cvNoise(u*5,v*5,82)*.25-.47; if(d<1.04){ if(d>.97&&cvNoise(u*6,v*6,84)>.35)c=sh([100,95,84],.9+.2*h1); else if(d<.97)c=sh(c,d<.6?.7:.8); } }
    { const dx=u-(RW*.5+1.4), dy=v-(RH*.55+.3); if(dx>-.2&&dx<1.6&&dy>-.1&&dy<.9){ const rr=cvNoise(u*3,v*3,89); if(rr>.45)c=sh(c,.7+.3*rr); } }
    const ed=Math.min(u,RW-u,v,RH-v); if(ed<.55){ if(hash(i>>1,j>>1,83)<.3*(1-ed/.55))c=hash(i,j,85)<.55?[60,78,44]:[96,78,52]; else c=sh(c,.86); }
    if(hash(i,j,87)<.003)c=[214,212,204]; if(hash(i>>2,j>>2,91)<.004)c=[150,120,70];
    return c; };
  const flat=(x0,y0,x1,y1,z,col,kind,S)=>{ if(x1-x0>80||y1-y0>80){ for(let a=x0;a<x1;a+=80)for(let b=y0;b<y1;b+=80)flat0(a,b,Math.min(x1,a+80),Math.min(y1,b+80),z,col,kind,S); return; } return flat0(x0,y0,x1,y1,z,col,kind,S); };
  const CSIG=new WeakMap(), csig=f=>{ let v=CSIG.get(f); if(v==null){ const t=String(f); let h=2166136261; for(let i=0;i<t.length;i++)h=Math.imul(h^t.charCodeAt(i),16777619); v=(h>>>0).toString(36)+t.length; CSIG.set(f,v); } return v; };
  const flat0=(x0,y0,x1,y1,z,col,kind,S)=>{ const D=kind==='G'?12:24; if(window.FLATLOG){ const k=kind+' '+String(col).slice(0,90); FLATLOG[k]=(FLATLOG[k]||0)+(x1-x0)*(y1-y0)*D*D; } const X=S?SHARED.BOD.XS:SHARED.BOD.X, Y=S?SHARED.BOD.YS:SHARED.BOD.Y, Z=S?SHARED.BOD.ZS:SHARED.BOD.Z; const fn=(i,j)=>SHARED.BOD.C(col(x0+(i+.5)/D,y0+(j+.5)/D)), w=Math.max(1,Math.round((x1-x0)*D)), h=Math.max(1,Math.round((y1-y0)*D)), k=kind+'|'+(S?1:0)+'|'+x0+','+y0+','+x1+','+y1+','+z+'|'+csig(col); const im=PAINTC.get(k,w,h,fn); let tx; if(im)tx={map:{image:im},em:null}; else { tx=SHARED.BOD.faceTex((x1-x0)*D,(y1-y0)*D,fn); if(!tx.em)PAINTC.put(k,tx.map.image); } return SHARED.BOD.bq([X(x0),Y(z),Z(y1)],[X(x1),Y(z),Z(y1)],[X(x1),Y(z),Z(y0)],[X(x0),Y(z),Z(y0)],tx,kind); };
  if(!SHARED.BOD.HUD)flat(B0.x0,B0.y0,B0.x1,B0.y1,H,roofCol,'R');
  if(!SHARED.BOD.HUD){ const gb=b=>SHARED.BOD.gbox(b,'R'), t=.36, PH=23, red=(i,j,k)=>{ const c=BRICKS.face(i,j,k,PH), m=c[0]<84; return m?[c[0]*1.25,c[1]*1.2,c[2]*1.12]:[c[0]*1.22,c[1]*.58,c[2]*.48]; };
    const wall=(x0,y0,x1,y1)=>gb({x0,y0,x1,y1,z0:H,z1:H+PH,c:[120,60,48],fs:(nx,ny,P,Q,z,k)=>{ const u=nx?Q:P, i=Math.floor(u*24), j=Math.floor(PH-z), o=(nx>0&&x0>B0.x0+RW/2)||(nx<0&&x0<B0.x0+RW/2)||(ny>0&&y0>B0.y0+RH/2)||(ny<0&&y0<B0.y0+RH/2);
      if(!o&&z<6+3*cvNoise(u*2,0,231))return sh([34,34,36],k*(hash(i,j,233)<.1?1.4:1)); let c=red(i,j,(nx+2)*7+(ny+2)*3);
      if(j<5&&cvNoise(u*1.5,j/4,235)>.55)c=[c[0]*.6+76,c[1]*.6+72,c[2]*.6+66]; if(hash(i>>1,Math.floor(u/.9),237)<.07&&j<4+20*hash(i>>1,2,239))c=sh(c,.68);
      if(o&&cvNoise(u/1.2,z/12,241)>.74&&c[0]<110)c=[c[0]*.7+40,c[1]*.7+40,c[2]*.7+38]; return sh(c,k); }});
    const X0=B0.x0, X1=B0.x1, Y0=B0.y0, Y1=B0.y1; wall(X0,Y1-t,X1,Y1); wall(X0,Y0,X1,Y0+t); wall(X0,Y0+t,X0+t,Y1-t); wall(X1-t,Y0+t,X1,Y1-t);
    let sd=0; const cope=(ax,a0,a1,at)=>{ for(let a=a0;a<a1-.05;){ const L=Math.min(a1-a,.55+.35*hash(sd,1,243)), dz=hash(sd,2,245)*.8, sh0=(hash(sd,3,247)-.5)*.03, tn=.88+.18*hash(sd,4,249), cr=hash(sd,5,251)<.18, k0=sd++;
      const col=(P,Q)=>{ const w=ax==='x'?P-a:Q-a, i=Math.floor(w*24), hp=hash(Math.floor(P*24),Math.floor(Q*24),253); if(w<.03||L-w<.03)return [70,68,64]; if(cr&&Math.abs(w-L*.4-(ax==='x'?Q:P)*.6)<.02)return [80,78,74];
        if(cvNoise(P*5,Q*5,k0+255)>.72)return hp<.5?[150,152,108]:[176,174,150]; if(hp<.012)return [232,230,224]; return sh([168*tn,162*tn,150*tn],.94+.1*hp); };
      const c0=ax==='x'?{x0:a,x1:a+L,y0:at-t/2-.05+sh0,y1:at+t/2+.05+sh0}:{y0:a,y1:a+L,x0:at-t/2-.05+sh0,x1:at+t/2+.05+sh0};
      gb({...c0,z0:H+PH,z1:H+PH+3.4+dz,c:[160,154,144],top:col,fs:(nx,ny,P,Q,z,k)=>z<1?sh(col(P,Q),k*.62):sh(col(P,Q),k*(z>2.6?1.06:.94))}); a+=L; } };
    cope('x',X0,X1,Y1-t/2); cope('x',X0,X1,Y0+t/2); cope('y',Y0+t,Y1-t,X0+t/2); cope('y',Y0+t,Y1-t,X1-t/2);
    { const ax0=X0+RW*.5-.6, ax1=ax0+1.9, ay0=Y0+RH*.55-.55, ay1=ay0+1.3, AH=22, Z0=H+2.2, beige=[176,172,160];
      for(const yy of [ay0+.15,ay1-.25])gb({x0:ax0-.15,x1:ax1+.15,y0:yy,y1:yy+.1,z0:H,z1:Z0,c:[92,74,56],fs:(nx,ny,P,Q,z,k)=>sh(hash(Math.floor((nx?Q:P)*24),Math.floor(z),261)<.3?[70,56,44]:[96,78,58],k),top:(P,Q)=>hash(Math.floor(P*24),Math.floor(Q*24),263)<.25?[78,62,46]:[104,86,64]});
      const acs=(nx,ny,P,Q,z,k)=>{ const u=nx?Q-ay0:P-ax0, L=nx?ay1-ay0:ax1-ax0, w=Math.min(u,L-u), i=Math.floor(u*24), hp=hash(i,Math.floor(z),265), zr=AH-z;
        let c=beige; if(w<.07)c=sh(beige,u<.035||L-u<.035?.8:1.05); else if(zr<3)c=sh(beige,zr<1?1.12:1); else if(z<2)c=sh(beige,.7);
        else if(nx>0&&u>.3&&u<L-.3&&z>4&&z<16){ c=sh(beige,1.04); if(u<.33||u>L-.33||z<4.5||z>15.5)c=sh(beige,.72); if(Math.abs(u-.4)<.03&&(Math.floor(z)===6||Math.floor(z)===14))c=[60,60,58]; if(u>L*.5-.2&&u<L*.5+.2&&z>11&&z<14)c=hash(i,Math.floor(z*2),267)<.5?[230,228,220]:[40,40,48]; }
        else { c=(Math.floor(z)&1)?sh(beige,.5):sh(beige,.98); if(hash(i>>1,Math.floor(z/2),269)<.05)c=sh(beige,.4); }
        if(hash(i>>1,3,271)<.12&&z<4+10*hash(i>>1,5,273))c=[c[0]*.78+22,c[1]*.62+8,c[2]*.5]; return sh(c,k*(.95+.08*hp)); };
      const fcx=ax0+.55, fcy=(ay0+ay1)/2;
      gb({x0:ax0,x1:ax1,y0:ay0,y1:ay1,z0:Z0,z1:Z0+AH,c:beige,fs:acs,top:(P,Q)=>{ const d=Math.hypot(P-fcx,Q-fcy), a=Math.atan2(Q-fcy,P-fcx), hp=hash(Math.floor(P*24),Math.floor(Q*24),275);
        if(d<.46){ if(d<.07)return [96,96,94]; if(d>.42)return sh(beige,.62); if(Math.abs(((a/(Math.PI/2))%1+1)%1-.5)<.06/Math.max(.1,d))return [118,118,114]; return Math.floor(d*24)%3===0?[104,104,100]:[30,30,32]; }
        if(Math.abs(P-(ax0+1.1))<.02||Math.min(P-ax0,ax1-P,Q-ay0,ay1-Q)<.04)return sh(beige,.8); if(hp<.006)return [226,224,218]; if(cvNoise(P*4,Q*4,277)>.74)return [126,120,104]; return sh(beige,.96+.08*hp); }});
      gb({x0:ax1,x1:ax1+.38,y0:ay0+.35,y1:ay0+.75,z0:H,z1:H+12,c:[170,172,170],fs:(nx,ny,P,Q,z,k)=>sh(Math.floor(z)%4===0?[120,122,120]:hash(Math.floor((nx?Q:P)*24),Math.floor(z),279)<.2?[196,198,196]:[166,168,166],k),top:()=>[150,152,150]});
      gb({x0:ax1+.38,x1:X1-t,y0:ay0+.5,y1:ay0+.56,z0:H,z1:H+.9,c:[120,122,124]}); }
    { const sx0=X0+1.3, sx1=sx0+1.1, sy0=Y0+3.1, sy1=sy0+1.25, CH=7, gal=[146,148,146];
      gb({x0:sx0,x1:sx1,y0:sy0,y1:sy1,z0:H,z1:H+CH,c:gal,fs:(nx,ny,P,Q,z,k)=>{ const i=Math.floor((nx?Q:P)*24); if(z<2.4+cvNoise((nx?Q:P)*3,1,281))return sh([36,36,38],k); let c=hash(i>>2,Math.floor(z/3),283)<.15?[120,98,80]:sh(gal,.94+.1*hash(i,Math.floor(z),285)); if(z>CH-1.2)c=sh(c,1.12); return sh(c,k); },top:()=>gal});
      gb({x0:sx0+.05,x1:sx1-.05,y0:sy0+.05,y1:sy1-.05,z0:H+CH,z1:H+CH+1.4,c:[70,88,96],fs:(nx,ny,P,Q,z,k)=>sh([96,98,98],k),top:(P,Q)=>{ const u=P-sx0, v=Q-sy0, hp=hash(Math.floor(P*24),Math.floor(Q*24),287), e=Math.min(u-.05,sx1-.05-P,v-.05,sy1-.05-Q);
        if(e<.05||Math.abs(u-(sx1-sx0)/2)<.025||Math.abs(v-(sy1-sy0)/2)<.025)return [92,94,94]; if(Math.abs(((u+v)*24/5)%1-.5)<.1||Math.abs(((u-v)*24/5+100)%1-.5)<.1)return [104,118,124];
        if(e<.14&&hp<.6)return [60,62,56]; if(Math.abs(v-.3-u*.5)<.015&&u>.6)return [150,170,176]; if(cvNoise(u*5,v*5,289)>.76)return hp<.5?[96,82,48]:[70,86,46]; return hp<.5?[62,80,90]:[56,72,82]; }}); } }
  await PAINTC.ready;
  const GQ=SHARED.BODB.GQ=[]; for(const g of SHARED.BOD.grounds)if(g.id!=='shop'){ const S=!g.bld, gx=S?SHARED.BOD.XS:SHARED.BOD.X, gz=S?SHARED.BOD.ZS:SHARED.BOD.Z;
    for(let a=g.x0;a<g.x1;a+=20)for(let b=g.y0;b<g.y1;b+=20){ const x1=Math.min(g.x1,a+20), y1=Math.min(g.y1,b+20), xa=gx(a), xb=gx(x1), za=gz(b), zb=gz(y1);
      GQ.push({x0:Math.min(xa,xb),x1:Math.max(xa,xb),z0:Math.min(za,zb),z1:Math.max(za,zb),go:()=>flat0(a,b,x1,y1,g.z,g.col,'G',S)}); } }
  { const X=SHARED.BOD.XS, Y=SHARED.BOD.YS, Z=SHARED.BOD.ZS; for(const k of SHARED.BOD.kerbs){ const P=(a,z)=>k.ax==='y'?[X(k.at),Y(z),Z(a)]:[X(a),Y(z),Z(k.at)]; for(let a0=k.a0;a0<k.a1;a0+=80){ const a1=Math.min(k.a1,a0+80), H=k.z1-k.z0; SHARED.BOD.bq(P(a0,k.z0),P(a1,k.z0),P(a1,k.z1),P(a0,k.z1),SHARED.BOD.faceTex((a1-a0)*24,H,(i,j)=>SHARED.BOD.kerbFaceAt(k,a0+(i+.5)/24,H-1-j,H)),'G'); } }
    for(const k of SHARED.BOD.kerbArcs){ const H=k.z1-k.z0; let s=0; for(let i=0;i+1<k.P.length;i++){ const [x0,y0]=k.P[i], [x1,y1]=k.P[i+1], L=Math.hypot(x1-x0,y1-y0), s0=s; s+=L;
      SHARED.BOD.bq([X(x0),Y(k.z0),Z(y0)],[X(x1),Y(k.z0),Z(y1)],[X(x1),Y(k.z1),Z(y1)],[X(x0),Y(k.z1),Z(y0)],SHARED.BOD.faceTex(L*24,H,(ii,j)=>SHARED.BOD.g.kerbFace(k.P[0][0]*7+s0+(ii+.5)/24,H-1-j,H)),'G'); } } }
  { const X=SHARED.BOD.XS, Y=SHARED.BOD.YS, Z=SHARED.BOD.ZS, {RP,D,col}=SHARED.BOD.ramps, RD=SHARED.BOD.RD, H=-RD;
    for(const r of RP){ const P=(u,w,z)=>{ const q=r.ax==='x'?[u,r.e+r.dir*w]:[r.e+r.dir*w,u]; return [X(q[0]),Y(z),Z(q[1])]; }, W=r.u1-r.u0;
      const a=P(r.u0,0,RD), b=P(r.u1,0,RD), c=P(r.u1,D,0), d=P(r.u0,D,0), up=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2])>0, tx=SHARED.BOD.faceTex(W*24,D*24,(i,j)=>col((i+.5)/24,D-(j+.5)/24,W));
      if(up)SHARED.BOD.bq(a,b,c,d,tx,'G'); else SHARED.BOD.bq(b,a,d,c,tx,'G');
      for(const u of [r.u0,r.u1])SHARED.BOD.bq(P(u,0,RD),P(u,D,0),P(u,D,0),P(u,0,0),SHARED.BOD.faceTex(D*24,H,(i,j)=>SHARED.BOD.g.kerbFace(u*7+i/24,H-1-j,H)),'G'); } }
  SHARED.BOD.streetSigns();
  if(!SHARED.BOD.HUD){ const fw=SHARED.BOD.WALLS.find(w=>w.id==='front'), sx=B0.x0-SHARED.BOD.SB.x0, dh=fw.holes.find(h=>h.door), a0=dh.a0+sx, a1=dh.a1+sx, yf=fw.at, AL=[156,158,156], d=Z(yf+1)>Z(yf)?1:-1;
    const gw=(x0,x1,z0,z1,c=AL,e=.06,o=0)=>SHARED.BOD.gbox({x0,x1,y0:yf-e+o,y1:yf+e+o,z0,z1,c,fs:(nx,ny,P,Q,z,k)=>sh(c,k*(.92+.12*hash(Math.floor(P*48),Math.floor(z),301))),top:()=>c},'L');
    gw(a0,a0+.07,0,94,AL,.1); gw(a1-.07,a1,0,94,AL,.1); gw(a0,a1,88,94,AL,.1); gw(a0+.07,a1-.07,78,81); gw(a0+.5,a0+.57,0,78); gw(a0+.07,a0+.5,0,8);
    for(const [x0,x1,z0,z1,c] of [[a0+.12,a0+.42,60,66,[200,40,36]],[a0+.12,a0+.42,63,64,[240,236,226]],[a0+.14,a0+.26,50,54,[40,80,170]],[a0+.28,a0+.4,50,54,[236,190,40]],[a0+.16,a0+.36,20,26,[236,232,220]]])gw(x0,x1,z0,z1,c,.006,.065*d);
    const win=fw.holes.filter(h=>h.glass&&!h.door).map(h=>({...h,a0:h.a0+sx,a1:h.a1+sx})); for(const [k,h] of win.entries()){ { const pm=new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(X(h.a1)-X(h.a0))-.05*TILE,Y(h.z1)-Y(h.z0)-.05*TILE)); pm.position.set((X(h.a0)+X(h.a1))/2,(Y(h.z0)+Y(h.z1))/2,Z(yf+.012)); pm.visible=false; pm.userData.near=-2.2; scene.add(pm); WINDOWS.pane(pm,'bodega','in'); }   // pictured from the pavement, the whole pane in frame: the display and the shop behind it
      const L=h.a1-h.a0, st=k?[[.1,.5,20,27,[30,60,150]],[.55,.85,20,24,[200,40,36]],[L-.6,L-.25,20,30,[236,232,214]],[L-.55,L-.3,26,27,[60,60,60]]]:[[L-.45,L-.15,20,26,[60,140,70]],[L-.42,L-.18,22,23,[240,240,230]],[.2,.4,82,88,[236,232,220]]];
      for(const [u0,u1,z0,z1,c] of st)gw(h.a0+u0,h.a0+u1,z0,z1,c,.006,.105*d); gw(h.a0,h.a1,h.z0,h.z0+2,[96,98,98],.12); }
    const hx=a1-.07, lw=(a0+.57)-hx, U=v=>X(hx+v)-X(hx), Hh=v=>Y(v)-Y(0), mat=new THREE.MeshLambertMaterial(), BXS=[], bx=(u0,u1,z0,z1,dp,c)=>BXS.push([(U(u0)+U(u1))/2,(Hh(z0)+Hh(z1))/2,0,Math.abs(U(u1)-U(u0)),Hh(z1)-Hh(z0),dp,c]);
    bx(0,.07*Math.sign(lw),0,78,.05,0x9c9e9c); bx(lw-.07*Math.sign(lw),lw,0,78,.05,0x9c9e9c); bx(0,lw,72,78,.05,0x9c9e9c); bx(0,lw,0,12,.06,0xb4b6b4); bx(.1*Math.sign(lw),lw-.1*Math.sign(lw),38,41,.12,0x6e706e);
    for(const [u0,u1,z0,z1,c] of [[.15,.45,62,68,0xc8282a],[.17,.43,64.5,65.5,0xf0ece2],[.5,.62,52,55,0x2850a8],[.64,.76,52,55,0xe8b828],[.3,.55,45,47,0xf0ece2]])bx(u0*Math.sign(lw),u1*Math.sign(lw),z0,z1,.07,c);
    const lf=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,BXS.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), cc=new THREE.Color(); BXS.forEach(([x,y,z,a,b,c2,col],i)=>{ lf.setMatrixAt(i,m4.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(a,b,c2*TILE))); lf.setColorAt(i,cc.setHex(col)); });
    const gl=new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(U(lw))-.12*TILE,Hh(60)),glassMat); gl.position.set(U(lw)/2,Hh(42),0);
    const sl=new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(X(a0+.5)-X(a0+.07)),Hh(70)),glassMat); sl.position.set((X(a0+.07)+X(a0+.5))/2,Hh(43),Z(yf)); scene.add(sl);
    const tr=new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(X(a1-.07)-X(a0+.07)),Hh(7)),glassMat); tr.position.set((X(a0)+X(a1))/2,Hh(84.5),Z(yf)); scene.add(tr);
    const leaf=new THREE.Group(); leaf.add(lf,gl); leaf.position.set(X(hx),0,Z(yf)); lf.castShadow=true; scene.add(leaf);
    }
  SHARED.BOD.paintProps([...SHARED.BOD.FRONT,...SHARED.BOD.STREET,...SHARED.BOD.ROOF,...(SHARED.BOD.GHOSTST||[])]);
  const MK=(k,map,emap)=>{ if(k==='B')return new THREE.MeshBasicMaterial({map,side:THREE.DoubleSide,alphaTest:.5});
    return new THREE.MeshLambertMaterial({map,alphaTest:.5,side:THREE.DoubleSide,...(emap?{emissiveMap:emap,emissive:0xffffff,emissiveIntensity:1.4}:{})}); };
  const post=M=>{ for(const me of BATCH.all(M,'G'))me.castShadow=false; };
  BATCH.cast=true; BATCH.build(MK); BATCH.cast=false; Object.assign(KINDS,BATCH.meshes); BATCH.meshes={}; post(KINDS);
  SHARED.BODB.roof=BATCH.all(KINDS,'R');
  { window.BODB=SHARED.BODB; const Q=BATCH.queue({make:MK,cast:false,group:()=>MAPG.bodega||scene,post,done:()=>{ if(PAINTC)PAINTC.save(); }}); for(const g of GQ)Q.jobs.push(g); GQ.length=0; SHARED.BODB.GQ=Q.jobs; }
  const goods=()=>{ const {GOOD,GLAY}=SHARED.BOD, O=SHARED.BOD.O, list=[];
    const row=(p,f,zpx,items)=>{ const along=f[0]?1:0, a1=along?p.y1:p.x1, yaw=Math.atan2(-f[0],f[1]); let a=(along?p.y0:p.x0)+.08, last=null;
      for(const [k,n,...args] of items){ if(k!=='catfood'&&k!=='fishfood')continue; if(last&&last!==k)a+=.04; last=k;   // only the cat's and the fish's food stay (owner, 5 Nov 2026)
        for(let i=0;i<n;i++){ const g=GOOD[k](...args), e=g.parts.map(q=>q.t==='box'?[q.h[0],q.h[1]]:[q.r,q.r]), w=Math.max(...e.map(v=>v[0])), d=Math.max(...e.map(v=>v[1]));
          if(a+2*w>a1-.06)return; const fr=f[0]+f[1]>0?(along?p.x1:p.y1)-.04-d:(along?p.x0:p.y0)+.04+d;
          list.push({g,k,x:along?fr:a+w,y:along?a+w:fr,z:zpx+.05,yaw:yaw+(hash(list.length,k.length,5)-.5)*.12}); a+=2*w+.015; } } };
    const lay=(k,f,zs,rows)=>{ const p=O[k]; if(p)rows.forEach((r,i)=>row(p,f,zs[i],r)); };
    const SZ=[14,32,50,68], FZ=[7,23,36,49];
    for(const i of [1,2,3])lay('fridge'+i,[1,0],FZ,GLAY['fridge'+i]);
    lay('wl1',[1,0],SZ,GLAY.aisle1a); lay('wl2',[1,0],SZ,GLAY.aisle1b); lay('wr1',[-1,0],SZ,GLAY.aisle2a); lay('wb3',[0,1],SZ,GLAY.aisle2b); lay('wl3',[1,0],SZ,GLAY.aisle2a);
    lay('wb1',[0,1],SZ,GLAY.back1); lay('wb2',[0,1],SZ,GLAY.back2); lay('wm1',[1,0],SZ,GLAY.mid1); lay('win1',[0,1],SZ,GLAY.win1); lay('win2',[0,1],SZ,GLAY.win2);
    { const c=O.counter, F=SHARED.BOD.food, z=30; for(let i=0;i<3;i++)list.push({g:GOOD.fishfood(),k:'fishfood',x:F.x-.08+i*.16*(i%2?1:.5),y:F.y+(i===2?.15:0),z,yaw:0});

      const along=c.y1-c.y0>c.x1-c.x0, cx=(c.x0+c.x1)/2, cy=(c.y0+c.y1)/2; let a=(along?c.y0:c.x0)+.95;
      for(const [k,n,...args] of []                 )for(let i=0;i<n;i++){ list.push({g:GOOD[k](...args),k,x:along?cx-.12+i*.02:a,y:along?a:cy,z,yaw:along?Math.PI/2:0}); a+=(k==='bananas'?.36:.09); } }
    const brands=[], bidx=new Map(); for(const it of list)for(const pa of it.g.parts)if(pa.brand){ const bc=pa.bc||GR, key=pa.brand+'|'+bc.join(); if(!bidx.has(key)){ bidx.set(key,brands.length+1); brands.push([pa.brand,bc]); } pa.bi=bidx.get(key); }
    const AW=1024, CW=128, CH=64, COLS=AW/CW, AH=Math.max(64,Math.ceil((brands.length+1)/COLS)*CH), acv=document.createElement('canvas'); acv.width=AW; acv.height=AH; const ag=acv.getContext('2d'); ag.fillStyle='#fff'; ag.fillRect(0,0,AW,AH);
    brands.forEach(([name,bc],i)=>{ const n=i+1, x=(n%COLS)*CW, y=Math.floor(n/COLS)*CH, lum=bc[0]*.3+bc[1]*.59+bc[2]*.11; ag.fillStyle=`rgb(${bc[0]|0},${bc[1]|0},${bc[2]|0})`; ag.fillRect(x,y,CW,CH); ag.fillStyle=lum>150?'rgba(255,255,255,.45)':'rgba(255,255,255,.22)'; ag.fillRect(x+5,y+14,CW-10,36); ag.strokeStyle=lum>150?'rgba(0,0,0,.35)':'rgba(255,255,255,.4)'; ag.lineWidth=2; ag.strokeRect(x+5,y+14,CW-10,36);
      ag.fillStyle=lum>150?'#1a1410':'#fff8e8'; ag.textAlign='center'; ag.textBaseline='middle'; const w=name.split(' '), L=w.length>1&&name.length>9?[w.slice(0,Math.ceil(w.length/2)).join(' '),w.slice(Math.ceil(w.length/2)).join(' ')]:[name];
      L.forEach((l,j)=>{ let px=L.length>1?17:24; do{ ag.font='bold '+px+'px Silkscreen, "Arial Black", sans-serif'; }while(ag.measureText(l).width>CW-16&&--px>7); ag.fillText(l,x+CW/2,y+CH/2+(j-(L.length-1)/2)*18); }); });
    const atex=new THREE.CanvasTexture(acv); atex.colorSpace=THREE.SRGBColorSpace; atex.flipY=false; atex.magFilter=THREE.NearestFilter; SHARED.BOD.brands=brands.map(b=>b[0]); SHARED.BOD.atlas=acv;
    const uvOf=n=>{ const x=(n%COLS)*CW, y=Math.floor(n/COLS)*CH; return [(x+4)/AW,(y+4)/AH,(x+CW-4)/AW,(y+CH-4)/AH]; }, WU=2/AW, WV=2/AH;
    const P=[], N=[], Cc=[], UV=[], col=new THREE.Color();
    const tc=(pa,tri)=>pa.mat([0,1,2].map(i=>tri[i][0]).reduce((s,v)=>[s[0]+v[0]/3,s[1]+v[1]/3,s[2]+v[2]/3],[0,0,0]),tri[0][1])||[200,200,200];
    const emit=(it,pa,tri,c=tc(pa,tri))=>{ const cs=Math.cos(it.yaw), sn=Math.sin(it.yaw); col.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace);
      for(const [p,n] of tri){ const lx=p[0]+pa.c[0], ly=p[1]+pa.c[1], lz=p[2]+pa.c[2], gx=it.x+lx*cs-ly*sn, gy=it.y+lx*sn+ly*cs;
        P.push(X(gx),Y(it.z+lz*24),Z(gy)); N.push(n[0]*cs-n[1]*sn,n[2],n[0]*sn+n[1]*cs); Cc.push(col.r,col.g,col.b); UV.push(WU,WV); } };
    const label=(it,pa)=>{ const [u0,v0,u1,v1]=uvOf(pa.bi), n=[0,1,0]; let w,h,y; if(pa.t==='box'){ w=pa.h[0]*.92; h=pa.h[2]*.86; y=pa.h[1]+.004; } else { w=pa.r*.95; h=pa.hh*.78; y=pa.r+.004; }
      const Q=[[[-w,y,-h],[u0,v1]],[[w,y,-h],[u1,v1]],[[w,y,h],[u1,v0]],[[-w,y,h],[u0,v0]]], cs=Math.cos(it.yaw), sn=Math.sin(it.yaw);
      for(const k of [0,1,2,0,2,3]){ const [p,uv]=Q[k], lx=p[0]+pa.c[0], ly=p[1]+pa.c[1], lz=p[2]+pa.c[2]; P.push(X(it.x+lx*cs-ly*sn),Y(it.z+lz*24),Z(it.y+lx*sn+ly*cs)); N.push(-sn,0,cs); Cc.push(1,1,1); UV.push(uv[0],uv[1]); } };
    const quad=(it,pa,a,b,c,d,n)=>{ emit(it,pa,[[a,n],[b,n],[c,n]]); emit(it,pa,[[a,n],[c,n],[d,n]]); };
    const same=C=>C.every(c=>c[0]===C[0][0]&&c[1]===C[0][1]&&c[2]===C[0][2]);
    const sheet=(it,pa,Q,n,A,B,Cq,D)=>{ const T=Q.flatMap(([a,b,c,d])=>[[[a,n],[b,n],[c,n]],[[a,n],[c,n],[d,n]]]), C=T.map(t=>tc(pa,t));
      if(same(C)){ emit(it,pa,[[A,n],[B,n],[Cq,n]],C[0]); emit(it,pa,[[A,n],[Cq,n],[D,n]],C[0]); } else T.forEach((t,k)=>emit(it,pa,t,C[k])); };
    const GL=SHARED.BOD.goods=[]; for(const it of list){ const v0=P.length/3; for(const pa of it.g.parts){
      if(pa.t==='box'){ const [hx,hy,hz]=pa.h, NZ=6, NA=3;
        for(const [ax,s] of [[0,1],[0,-1],[1,1],[1,-1]]){ const n=ax?[0,s,0]:[s,0,0], ha=ax?hx:hy, pt=(u,z)=>ax?[u,s*hy,z]:[s*hx,u,z], Q=[];
          for(let i=0;i<NA;i++)for(let j=0;j<NZ;j++){ const u0=-ha+2*ha*i/NA, u1=-ha+2*ha*(i+1)/NA, z0=-hz+2*hz*j/NZ, z1=-hz+2*hz*(j+1)/NZ; Q.push([pt(u0,z0),pt(u1,z0),pt(u1,z1),pt(u0,z1)]); }
          sheet(it,pa,Q,n,pt(-ha,-hz),pt(ha,-hz),pt(ha,hz),pt(-ha,hz)); }
        for(const s of [1,-1])quad(it,pa,[-hx,-hy,s*hz],[hx,-hy,s*hz],[hx,hy,s*hz],[-hx,hy,s*hz],[0,0,s]); if(pa.bi)label(it,pa); }
      else if(pa.t==='cyl'){ const r=pa.r, hh=pa.hh, NS=10, NZ=6;
        for(let i=0;i<NS;i++){ const a0=i/NS*2*Math.PI, a1=(i+1)/NS*2*Math.PI, am=(a0+a1)/2, n=[Math.cos(am),Math.sin(am),0];
          const pc=(a,z)=>[Math.cos(a)*r,Math.sin(a)*r,z], Q=[]; for(let j=0;j<NZ;j++){ const z0=-hh+2*hh*j/NZ, z1=-hh+2*hh*(j+1)/NZ; Q.push([pc(a0,z0),pc(a1,z0),pc(a1,z1),pc(a0,z1)]); } sheet(it,pa,Q,n,pc(a0,-hh),pc(a1,-hh),pc(a1,hh),pc(a0,hh));
          for(const s of [1,-1])emit(it,pa,[[[0,0,s*hh],[0,0,s]],[[Math.cos(a0)*r,Math.sin(a0)*r,s*hh],[0,0,s]],[[Math.cos(a1)*r,Math.sin(a1)*r,s*hh],[0,0,s]]]); } if(pa.bi)label(it,pa); } }
      GL.push({k:it.k,m:it.g.m||.5,v0,v1:P.length/3}); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));
    const me=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,map:atex,side:THREE.DoubleSide})); me.receiveShadow=true; me.userData.goods=true; scene.add(me); SHARED.BOD.goodsMesh=me; };
  const HALO=(c,W,H)=>{ const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d'), im=g.createImageData(W,H), B=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
    for(let j=0;j<H;j++)for(let i=0;i<W;i++){ const dx=(i+.5)/W*2-1, dy=(j+.5)/H*2-1, d=Math.hypot(dx,dy), t=(s0=>s0-Math.floor(s0))(Math.sin(i*12.9898+j*78.233)*43758.5453), s=d<.42+(t-.5)*.12?.5:d<.68+(t-.5)*.14?.26:d<.96+(t-.5)*.12?.1:0, q=(j*W+i)*4;
      im.data[q]=c[0]; im.data[q+1]=c[1]; im.data[q+2]=c[2]; im.data[q+3]=Math.round(s*255); }
    g.putImageData(im,0,0); const t=new THREE.CanvasTexture(cv); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; return t; };
  for(const N of NEONS){ const kk=N.k||2, n=N.cells.length, k=1/24, geo=new THREE.BoxGeometry(kk*k*TILE,Y(kk)-Y(0),kk*k*TILE*.8), me=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:new THREE.Color(N.c[0]/255*1.1,N.c[1]/255*1.1,N.c[2]/255*1.1)}),n), m4=new THREE.Matrix4(); let i=0;
    for(const [a,b] of N.cells){ if(kk===2&&(a%2||b%2))continue; m4.makeTranslation(X(N.x-N.W*k/2+(a+kk/2)*k),Y(N.z+7-(b+kk/2)),Z(N.y-.08)); me.setMatrixAt(i++,m4); }
    me.count=i; N.me=me; me.castShadow=false; me.receiveShadow=false; scene.add(me);
    { const w=N.W*k*TILE*2, h=(Y(14)-Y(0))*2.6, m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:HALO(N.c,Math.round(N.W*k*24*2/1.2),Math.round(14*2.6/1.2)),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
      const at=new THREE.Vector3(X(N.x),Y(N.z),Z(N.y-.08)), f=new THREE.Vector3(); m.position.copy(at); m.renderOrder=2;
      m.onBeforeRender=(r,s,c)=>{ m.quaternion.copy(c.quaternion); c.getWorldDirection(f); m.position.copy(at).addScaledVector(f,-.3); m.updateMatrixWorld(); }; scene.add(m); N.halo=m; } }
  const SB=SHARED.BOD.SB, inB=l=>l.x>SB.x0&&l.x<SB.x1&&l.y>SB.y0&&l.y<SB.y1;
  const lampsOf=(inn,back)=>{ for(const l of SHARED.BOD.LAMPS){ const cm=Math.max(...l.c); if(!(cm>0)||inB(l)!==inn||inn&&(l.y<BODOFF)!==back)continue; const L=new THREE.PointLight(new THREE.Color(l.c[0]/cm,l.c[1]/cm,l.c[2]/cm),7*cm*Math.min(1.2,l.r/5),l.r*TILE*1.25,1.6);
    L.position.set(X(l.x),Y(l.z),Z(l.y)); L.userData.i0=L.intensity; L.userData.both=!!l.neon; if(!inn)lamps.push(L);
    else if(/tube/.test(l.prop&&l.prop.key||'')){ L.color.setRGB(.84,1,.9); L.intensity*=1.8; L.distance*=1.35; L.userData.i0=L.intensity; L.userData.tube=1; SHARED.BODB.glow.push(L); } scene.add(L); } };
  lampsOf(false);
  // late at night in the shop (owner, 28 Oct 2026): a warm lamp over the counter, the OPEN sign's red through the window; the tubes hum and one stutters now and then
  const moodLights=()=>{ const B={...SB,y0:BODOFF}, add=(x,y,z,c,r,k)=>{ const L=new THREE.PointLight(new THREE.Color(...c),11*Math.min(1.2,r/5),r*TILE*1.25,1.6); L.position.set(X(x),Y(z),Z(y)); L.userData.i0=L.intensity; L.userData[k]=1; SHARED.BODB.glow.push(L); scene.add(L); };
    add(B.x1-1.05,B.y0+5.4,62,[1,.62,.32],3.5,'warm'); add(SB.x0+1.5,SB.y1-.35,64,[1,.22,.32],4,'neon'); };
  // the back room (owner, 28 Oct 2026): its door locked (only the Fox has the key), its floor, things and lamp drawn only while you are in it; from the shop a dark ceiling over it
  const backOf=p=>/^of-/.test(p.key||''), inBack=()=>SHARED.BOD.inside(pos.x,pos.z)&&pos.z<Z(BODOFF)===(Z(SB.y0)<Z(BODOFF));
  SHARED.BODB.build=()=>{ const SG=new THREE.Group(); SG.name='bodega-in'; scene.add(SG); SHARED.BODB.SG=SG; const BG=new THREE.Group(); BG.name='bodega-back'; SG.add(BG); SHARED.BODB.BG=BG;
    const g=SHARED.BOD.grounds.find(q=>q.id==='shop'), O=Object.values(SHARED.BOD.O);
    const P=ROOMS.part(SG,()=>{ for(const w of SHARED.BOD.WALLS){ wallF(w,true); wallR(w); }
      if(g)flat(g.x0,BODOFF,g.x1,g.y1,g.z,g.col,'G',!g.bld);
      SHARED.BODB.glow=[]; SHARED.BOD.paintProps(O.filter(p=>!backOf(p))); goods(); lampsOf(true,false); moodLights(); if(STORE.furnish&&STORE.furnish.bodega)STORE.furnish.bodega();
      const L=SHARED.BOD.WALLS.find(w=>w.id==='office'), dh=L.holes.find(h=>h.locked), hb=new THREE.Mesh(new THREE.BoxGeometry((dh.a1-dh.a0)*TILE,Y(dh.z1),.3*TILE),new THREE.MeshBasicMaterial({visible:false}));
      hb.position.set(X((dh.a0+dh.a1)/2),Y(dh.z1)/2,Z(BODOFF)); scene.add(hb); UI.thing({name:'A LOCKED DOOR',obj:hb,reach:1.4*TILE,near:2.4*TILE,tall:Y(dh.z1),act:()=>{ SFX.play('latch',{vol:.5}); if(FORAGE)SAY('IT IS LOCKED. ONLY THE FOX HAS THE KEY.','#c8a090'); }}); },MK);
    const P2=ROOMS.part(BG,()=>{ if(g)flat(g.x0,g.y0,g.x1,BODOFF,g.z,g.col,'G',!g.bld); SHARED.BOD.paintProps(O.filter(backOf)); lampsOf(true,true); },MK);
    const cap=new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(X(SB.x1)-X(SB.x0)),Math.abs(Z(BODOFF)-Z(SB.y0))),new THREE.MeshBasicMaterial({color:0x0b0c10})); cap.rotation.x=-Math.PI/2;
    cap.position.set((X(SB.x0)+X(SB.x1))/2,Y(SB.h-4)+.01,(Z(SB.y0)+Z(BODOFF))/2); SG.add(cap); SHARED.BODB.cap=cap;
    for(const k of ['objs','things','cuts','lights'])P[k].push(...P2[k]); P.objs.push(cap);
    SG.traverse(o=>{ if(!o.isMesh)return; o.receiveShadow=true; const L=o.userData.objOf; if(L&&L.length&&L.every(q=>q&&/fluorescent tube/.test(q.name||''))&&!OVERHEAD.some(h=>h.o===o)){ o.geometry.computeBoundingBox(); o.updateMatrixWorld(); OVERHEAD.push({o,y:o.geometry.boundingBox.min.y+o.matrixWorld.elements[13]}); } }); SHARED.BODB.tick(); return P; };
  let stut=0, nextS=8, tubeN=0; SYS.add('life',dt=>{ const G=SHARED.BODB.glow; if(G&&G.length&&SHARED.BODB.SG&&SHARED.BODB.SG.parent){ const t=performance.now()/1e3; nextS-=dt||0; if(nextS<0){ stut=.5+Math.random()*.6; nextS=7+Math.random()*12; tubeN=Math.random()<.5?0:1; }
    if(stut>0)stut-=dt||0; let n=0; for(const L of G){ const d=L.userData; if(d.tube){ const on=stut>0&&n++===tubeN?(Math.sin(t*61)>.1?1:.12):1; L.intensity=d.i0*on*(.97+.03*Math.sin(t*377)); } else if(d.neon)L.intensity=d.i0*(.88+.08*Math.sin(t*7.3)+.04*Math.sin(t*97)); } }
    SHARED.BODB.tick(); const BG=SHARED.BODB.BG; if(!BG||!BG.parent)return; const b=inBack(); if(BG.visible!==b){ BG.visible=b; SHARED.BODB.cap.visible=!b; LITE.t=0; } },'039-bodega');
  SHARED.BODB.unbuild=()=>{ if(SHARED.BODB.SG)SHARED.BODB.SG.removeFromParent(); SHARED.BODB.SG=null; SHARED.BOD.goodsMesh=null; };
  { const SB=SHARED.BOD.SB, m0=(B0.x0+B0.x1)/2, mS=(SB.x0+SB.x1)/2, bx=(x0,y0,x1,y1)=>[Math.min(X(x0),X(x1)),Math.min(Z(y0),Z(y1)),Math.max(X(x0),X(x1)),Math.max(Z(y0),Z(y1))], wb=bx(SB.x0-.2,SB.y0-.2,SB.x1+.2,SB.y1+.2);
    ROOMS.off.bodega={name:'THE BODEGA',box:{x0:wb[0],z0:wb[1],x1:wb[2],z1:wb[3],y0:-1,y1:Y(SB.h)},need:()=>LOAD(SHARED.BODB.build.chunk),build:SHARED.BODB.build,unbuild:SHARED.BODB.unbuild,
      spawn:[X(mS),Z(SB.y1-1.3),0,Math.PI],out:[X(m0),Z(B0.y1+.7),0,0],door:[X(m0),Y(0),Z(B0.y1+.25)],exit:[X(mS),0,Z(SB.y1-.25)],exitName:'OUT TO THE STREET',shift:[X(m0)-X(mS),Z(B0.y1)-Z(SB.y1)]};
    if(SHARED.BOD.HUD){ const P=WP.bodega, N=P.face==='n', hx=LOTX((P.x0+P.x1)/2), hy=LOTY(N?P.y1:P.y0), o=N?1:-1; Object.assign(ROOMS.off.bodega,{out:[X(hx),Z(hy+.7*o),0,N?0:Math.PI],door:[X(hx),Y(0),Z(hy+.25*o)],shift:null}); } }   // its door on its lot's street side (Market St or the promenade)   // its door on the Hudson lot, on the promenade
}
{ const {BF_KINDS,bfPic}=SHARED.BOD.STOREK.bf, PICS=new Map(), hash=SHARED.BOD.g.hash;
  const tex=(k,pose)=>{ '@later'; const key=k+':'+pose; let t=PICS.get(key); if(t)return t; const Q=bfPic(k,16,pose), c=document.createElement('canvas'); c.width=Q.w; c.height=Q.h; const g=c.getContext('2d'), im=g.createImageData(Q.w,Q.h);
    for(let i=0;i<Q.w*Q.h;i++){ const p=Q.px[i]; if(!p)continue; im.data[i*4]=p[0]; im.data[i*4+1]=p[1]; im.data[i*4+2]=p[2]; im.data[i*4+3]=255; } g.putImageData(im,0,0);
    const T=new THREE.CanvasTexture(c); T.magFilter=T.minFilter=THREE.NearestFilter; T.generateMipmaps=false; T.colorSpace=THREE.SRGBColorSpace; t={T,w:Q.w,h:Q.h,oy:Q.oy}; PICS.set(key,t); return t; }; BF.pic=tex;
  // the body and wings are the Drive's butterfly (data/bfly.json); each kind's own wing picture is painted over the wings, top and underside
  const BD=__DATA__("data/bfly.json"), F32=s=>new Float32Array(B64(s).buffer), GEO={}, WT=new Map();
  const geos=()=>{ '@later'; if(GEO.body)return GEO; const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(F32(BD.body.p),3)); g.setAttribute('color',new THREE.BufferAttribute(B64(BD.body.c),3,true)); g.setIndex(new THREE.BufferAttribute(U16(BD.body.i),1)); g.computeVertexNormals(); g.computeBoundingBox();
    const w=new THREE.BufferGeometry(), P=F32(BD.wing.p), uv=new Float32Array(P.length/3*2); for(let i=0;i<P.length/3;i++){ uv[i*2]=Math.max(0,P[i*3+1])/BD.a; uv[i*2+1]=(P[i*3+2]-BD.f[0])/(BD.f[1]-BD.f[0]); }
    w.setAttribute('position',new THREE.BufferAttribute(P,3)); w.setAttribute('uv',new THREE.BufferAttribute(uv,2)); w.setIndex(new THREE.BufferAttribute(U16(BD.wing.i),1)); w.computeVertexNormals();
    let nx=0; const N=w.attributes.normal.array; for(let i=0;i<N.length;i+=3)nx+=N[i]; GEO.out=nx>0; GEO.body=g; GEO.wing=w; GEO.mat=new THREE.MeshLambertMaterial({vertexColors:true}); return GEO; };
  const wingTex=k=>{ '@later'; let t=WT.get(k); if(t)return t; const Q=bfPic(k,32,0), under=BF_KINDS[k][7], hs=Q.w/2, ys=.72, x0=Math.ceil(Q.w/2+.07*hs);
    let y0=Q.h, y1=-1, x1=x0; for(let y=0;y<Q.h;y++)for(let x=x0;x<Q.w;x++)if(Q.px[y*Q.w+x]){ y0=Math.min(y0,y); y1=Math.max(y1,y); x1=Math.max(x1,x); }
    const W=x1-x0+1, H=y1-y0+1, top=[], und=[];
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){ let p=Q.px[(y+y0)*Q.w+x+x0];
      if(!p){ let best=1e9; for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++){ const q=Q.px[(yy+y0)*Q.w+xx+x0], d=(xx-x)**2+(yy-y)**2; if(q&&d<best){ best=d; p=q; } } }
      top.push(p||[40,34,30]); const hind=(Q.oy-(y+y0+.5))/hs/ys<0; und.push(under.map(v=>v*(hind?.86:1)|0)); }
    const mk=px=>{ const c=document.createElement('canvas'); c.width=W; c.height=H; const g=c.getContext('2d'), im=g.createImageData(W,H); px.forEach((p,i)=>{ im.data[i*4]=p[0]; im.data[i*4+1]=p[1]; im.data[i*4+2]=p[2]; im.data[i*4+3]=255; }); g.putImageData(im,0,0);
      const T=new THREE.CanvasTexture(c); T.magFilter=T.minFilter=THREE.NearestFilter; T.generateMipmaps=false; T.colorSpace=THREE.SRGBColorSpace; return T; };
    const G=geos(), A=new THREE.MeshLambertMaterial({map:mk(top),side:G.out?THREE.BackSide:THREE.FrontSide}), U=new THREE.MeshLambertMaterial({map:mk(und),side:G.out?THREE.FrontSide:THREE.BackSide});
    t=[A,U]; WT.set(k,t); return t; };
  // one butterfly, its wings open by a (0 shut upright, about 1.45 flat), scaled so it spans w
  BF.model=(k,w)=>{ '@later'; const G=geos(), [A,U]=wingTex(k), g=new THREE.Group(), body=new THREE.Group(), s=w/BD.span; body.scale.setScalar(s); body.position.y=-G.body.boundingBox.min.y*s; g.add(body);
    body.add(new THREE.Mesh(G.body,G.mat)); const wing=m=>{ const o=new THREE.Group(); o.add(new THREE.Mesh(G.wing,A),new THREE.Mesh(G.wing,U)); return o; }, L=wing(), R=wing(), RG=new THREE.Group(); RG.scale.x=-1; RG.add(R); body.add(L,RG);
    g.traverse(o=>{ if(o.isMesh)o.userData.shared=true; }); g.userData.open=a=>{ L.rotation.z=-a; R.rotation.z=-a; }; g.userData.open(1.2); return g; };
  BF.add=(k,perches)=>{ '@later'; const span=BF_KINDS[k][3]/1000*2/.84*TILE, g=BF.model(k,span);
    const b={k,name:BF_KINDS[k][0],g,open:g.userData.open,a:.1,perches,at:0,to:0,t0:0,dur:0,until:2+Math.random()*6,span,t:Math.random()*10,pose:2};
    b.open(.1); g.position.set(...perches[0]); scene.add(g); BF.list.push(b); return b; };
  const OPEN=[1.45,.75,.08];
  BF.tick=dt=>{ '@later'; const dark=CLOCK.dark();
    for(const b of BF.list){ b.t+=dt; const t=b.t; let want=OPEN[2], P;
      if(b.dur&&t<b.t0+b.dur){ const u=(t-b.t0)/b.dur, A=b.perches[b.at], Cc=b.perches[b.to], dx=Cc[0]-A[0], dz=Cc[2]-A[2], L=Math.hypot(dx,dz)||1, hump=Math.sin(Math.PI*u)*.35*TILE*(b.hi||1), zig=Math.sin(u*Math.PI*5)*.06*TILE;
        P=[A[0]+dx*u+zig*dz/L,A[1]+(Cc[1]-A[1])*u+hump+Math.sin(t*9)*.05,A[2]+dz*u-zig*dx/L]; b.a=.25+1.2*(.5+.5*Math.sin(t*19)); want=null; b.g.rotation.y=Math.atan2(dx,dz); }
      else{ if(b.dur){ b.at=b.to; b.dur=0; } P=b.perches[b.at];
        if(!dark&&t>b.until){ let n=Math.floor(hash(Math.floor(t*10),b.k,445)*b.perches.length); if(n===b.at)n=(n+1)%b.perches.length;
          const fl=b.away?2:1; if(b.away){ const [ax,az]=b.away; let f=-1; b.perches.forEach((q,i)=>{ const d=Math.hypot(q[0]-ax,q[2]-az); if(i!==b.at&&d>f){ f=d; n=i; } }); b.away=null; }
          const A=b.perches[b.at], Cc=b.perches[n]; b.to=n; b.t0=t; b.dur=(.9+Math.hypot(Cc[0]-A[0],Cc[2]-A[2])/TILE*2.4)/(b.fast||1)/fl; b.until=t+b.dur+4+hash(Math.floor(t),b.k,447)*9; }
        else { const c=(t*.55+b.k*.37)%2; want=OPEN[dark?2:c<.75?0:c<1?1:c<1.75?2:1]; } }
      if(want!=null)b.a+=(want-b.a)*Math.min(1,dt*6); b.open(b.a); b.g.position.set(P[0],P[1],P[2]); } }; }
// THE BODEGA'S END: closes grab('bodega'); loads the forest and props data.

MODS.bodega={BOUND,ground:groundY};
 for(const w of cutWalls.slice(c0))if(!w.when)w.when=()=>SHARED.BODB.inside(); for(const L of SHL)L.removeFromParent(); });
const FOREST=__DATA__("data/forest.json");
const PROPS=__DATA__("data/props.json");
function gdShape(GS,K,LAMPS){ const s=K.s, o=K.o, SC=1.5, cx=o[0]+4*s, Y1=o[1]+3.2*s, W=6.8*s*SC, D=3*s*SC, X0=cx-W/2, X1=cx+W/2, Y0=Y1-D, dx=(W-6.8*s)/2;
  for(let i=GS.length-1;i>=0;i--){ const p=GS[i]; for(let j=LAMPS.length-1;j>=0;j--)if(LAMPS[j].prop===p)LAMPS.splice(j,1); GS.splice(i,1); }
  const G=SHARED.BOD.GDK={o,s,SC,X0,X1,Y0,Y1,W,D,cx,y1e:o[1]+8.3*s};
  G.S=1.5; G.u=x=>cx+(x-cx)*G.S; G.v=y=>Y1+(y-Y1)*G.S; G.iu=x=>cx+(x-cx)/G.S; G.iv=y=>Y1+(y-Y1)/G.S;   // the whole bath house 1.5x about the middle of its front (owner, 8 Nov 2026); its court still ends at the street
  G.ground={x0:X0-1.6,x1:X1+1.6};
  G.pool=[X0+.22,Y0+.22,X1-.22,(Y0+Y1)/2+.15];
  G.court=(x,y)=>{ const {hash,grain}=SHARED.BOD.g, sh=SHARED.BOD.K.sh, px=Math.floor(x*24), py=Math.floor(y*24);
    const out=x<X0||x>X1||y<Y0||y>Y1; if(!out)return x>G.pool[0]&&x<G.pool[2]&&y>G.pool[1]&&y<G.pool[3]?null:[96,90,84];
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
export {FOREST, PROPS};
