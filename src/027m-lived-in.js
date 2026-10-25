// THE LIVED-IN KIT: the old game's shared 'lived' things (light switches, pipes, wall lights, dust bunnies...) as catalog kinds; loads with the old rooms' kits on the first jump.
import {SHARED} from './003-shx.js';
import {CAT_DEPTS, CAT_INFO, CATALOG, chunkAtL, cvNoise, hash, KIND_OF, prop, sh, zShift} from './014-gamekit.js';
import {STUDIO} from './020-studio-kit.js';
const livedIn=()=>{ '@oldkits';
  const floorFn=null;   // the old map's floor-colour lookup: not here
// =====================================================================================
// LIVED IN (owner, 16 Oct 2026: "go through entire map that has stuff in it ... look for ways that it can be more realistic. look online for
// similar pictures of what it is and add things you see often in those examples. 2-3 each ... nothing in the way, more out of the way but
// gives a lived in feeling, grass sprouts, cracks, wires, etc"): the small marks a place gets from being used, and the small things left in
// it. Placed by 26-zzzzzzzzzzz-lived-in, two or three in each place; every kind in the catalog too (department Lived In).
// A mark on the ground is the ground itself worn: its colour is the floor's own under it (each piece of map's floor painter, `floorFn`; or
// the park's, the cave's, the island's), darkened, lightened or overlaid a pixel at a time, never a sticker. Its shapes come from a smooth
// noise cut into a tone or two and dithered at the cut, or from small things set at hashed spots (the lawn's way: 21-world-map-5-land).
// Every mark is decided by the art pixel (24 a tile), so its edges step in whole pixels at any zoom. All of it is still: painted into the
// pictures once, nothing per frame; nothing throws a shadow (nb), nothing is in the way (walk).
// =====================================================================================
const LIVED=(()=>{ const A=24, {rect,fb}=STUDIO.kit; let O={};
const o=(k,d)=>O[k]!==undefined?O[k]:d;                                       // a placement's own settings (26-zzzzzzz-lived-in sets them as it makes one)
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t], lum=c=>c[0]*.3+c[1]*.59+c[2]*.11;
const isGrass=b=>b[1]>b[0]+10&&b[1]>b[2]+6;
// the floor's own colour at a point: its piece of map's floor painter, kept per piece and level
const FLR=new Map();
function floorAt(X,Y,lv){ const c=chunkAtL(X,Y,lv); if(!c)return null; let m=FLR.get(c); if(!m)FLR.set(c,m=new Map()); let f=m.get(lv);
  if(f===undefined){ try{ f=floorFn(c,lv); }catch(e){ f=null; } m.set(lv,f); } const q=f?f(X,Y):null; return q&&!q.e?q:null; }
// how worn a spot is: t (1 at the middle, 0 at the edge) broken by a smooth noise and dithered pixel by pixel where it's cut
const wearT=(u,v,t,seed,s=14)=>t+(cvNoise(u/s,v/s,seed)-.5)*.7+(hash(u,v,seed+1)-.5)*.16;
const segD=(X,Y,P)=>{ let m=9; for(let s=0;s<P.length-1;s++){ const [ax,ay]=P[s],[bx,by]=P[s+1], vx=bx-ax, vy=by-ay, l=vx*vx+vy*vy||1, q=Math.max(0,Math.min(1,((X-ax)*vx+(Y-ay)*vy)/l)); m=Math.min(m,Math.hypot(X-ax-q*vx,Y-ay-q*vy)); } return m; };

// ---- A MARK ON THE GROUND: a box a hair thick whose top is paint(u, v, floor colour, X, Y) (u, v: the art pixel), null where untouched.
// On ground that rises (the park's hills, the cave's floor) it's cut into the ground's own half-tile cells, each at that cell's height (zf);
// up off the floor it lies half a pixel over what it's on (level with it, it would be sorted under it)
function mark(x0,y0,x1,y1,paint,own=false){ const lv=o('lv',0), zf=o('zf',null), z=o('z',0), bf=own?()=>[0,0,0]:o('base',null)||((X,Y)=>floorAt(X,Y,lv));   // (own: its colours its own, whatever it lies on)
  const top=(X,Y)=>{ const b=bf(X,Y); return b?paint(Math.floor(X*A),Math.floor(Y*A),b,X,Y):null; }, box=(a,b,c,d,h)=>({x0:a,y0:b,x1:c,y1:d,z0:h&&h+.5,z1:(h&&h+.5)+.5,c:[0,0,0],foot:1,nb:1,top,fi:()=>null,fj:()=>null});
  const B=[]; if(!zf)B.push(box(x0,y0,x1,y1,z));
  else { const g=o('grid',[0,0]), cs=.5; for(let i=Math.floor((x0-g[0])/cs);g[0]+i*cs<x1;i++)for(let j=Math.floor((y0-g[1])/cs);g[1]+j*cs<y1;j++)
    B.push(box(Math.max(x0,g[0]+i*cs),Math.max(y0,g[1]+j*cs),Math.min(x1,g[0]+(i+1)*cs),Math.min(y1,g[1]+(j+1)*cs),zf(g[0]+(i+.5)*cs,g[1]+(j+.5)*cs))); }
  return prop(B,null,{...zf||z?{walk:true,noLine:1}:{walk:true,flat:true,noLine:1},...o('px',{})}); }   // (noLine: a mark has no outline round it, or its edge would draw as a line)

// a path worn into a floor along a line of points (P), w either side: the floor darker (k under 1: concrete, boards) or paler (over 1: carpet
// trodden flat), a second tone where it's walked most
function worn(P,w=.4,k=o('k',.9),seed=o('seed',11)){ SHARED.PNAME='worn path'; const xs=P.map(p=>p[0]), ys=P.map(p=>p[1]);
  return mark(Math.min(...xs)-w,Math.min(...ys)-w,Math.max(...xs)+w,Math.max(...ys)+w,(u,v,b)=>{ const t=wearT(u,v,1-segD((u+.5)/A,(v+.5)/A,P)/w,seed); return t>.8?sh(b,1+(k-1)*1.8):t>.42?sh(b,k):null; }); }
// a patch of something lying thin on a floor (chalk, flour, ash, rust, dust): the floor showing through it more at its edge
function dust(x,y,r,c,seed=o('seed',21),sx=1,sy=1){ SHARED.PNAME=o('name','dust');
  return mark(x-r*sx,y-r*sy,x+r*sx,y+r*sy,(u,v,b)=>{ const t=wearT(u,v,1-Math.hypot(((u+.5)/A-x)/sx,((v+.5)/A-y)/sy)/r,seed,8); return t>.82?mix(b,c,.75):t>.56?mix(b,c,.45):t>.4&&hash(u,v,seed+3)<.5?mix(b,c,.25):null; }); }
// small things scattered over a patch: in each cell (n art px a side) one or none (chance dens(X, Y), keep: whether it can lie there), its
// pixels shape(h) ([dx, dy, k]), coloured col(k, the floor's colour, h)
function scatter(x0,y0,x1,y1,n,dens,shape,col,seed=o('seed',31),keep=null,own=false){
  return mark(x0,y0,x1,y1,(u,v,b,X,Y)=>{ const i=Math.floor(u/n), j=Math.floor(v/n); if(hash(i,j,seed)>dens((i+.5)*n/A,(j+.5)*n/A))return null;
    const h=hash(i,j,seed+1), ox=i*n+1+Math.floor(hash(i,j,seed+2)*(n-4)), oy=j*n+1+Math.floor(hash(i,j,seed+3)*(n-4));
    for(const [dx,dy,k] of shape(h))if(u===ox+dx&&v===oy+dy)return keep&&!keep(b,X,Y)?null:col(k,b,h); return null; },own); }
const fall=(x,y,r)=>(X,Y)=>Math.max(0,1-Math.hypot(X-x,Y-y)/r);               // thick in the middle, thinning out
// the rings glasses and mugs leave on a table top: [x, y, radius] (tiles), each a ring a pixel wide, broken where it dried thin
function rings(C,c=o('c',[150,120,90])){ SHARED.PNAME='ring stains'; const xs=C.flatMap(r=>[r[0]-r[2],r[0]+r[2]]), ys=C.flatMap(r=>[r[1]-r[2],r[1]+r[2]]);
  return mark(Math.min(...xs)-.05,Math.min(...ys)-.05,Math.max(...xs)+.05,Math.max(...ys)+.05,(u,v)=>{ for(const [x,y,r] of C){ const d=Math.hypot(u+.5-x*A,v+.5-y*A)-r*A; if(Math.abs(d)<.6&&hash(u,v,77)<.8)return c; } return null; },true); }
// a hairline crack: a line that wanders as it goes (a walk an art pixel a step), a branch off it, the floor darker in it
function livedCrack(x,y,len=1.6,a0=o('a',.4),seed=o('seed',41)){ SHARED.PNAME='hairline crack'; const S=new Set(), add=(u,v)=>S.add(u+','+v);
  const walk=(u,v,a,n,s)=>{ for(let i=0;i<n;i++){ a+=(hash(i,s,seed)-.5)*.55; u+=Math.cos(a); v+=Math.sin(a); add(Math.round(u),Math.round(v)); if(s===0&&i===Math.floor(n*.45))walk(u,v,a+(hash(1,2,seed)<.5?.9:-.9),Math.floor(n*.35),1); } };
  walk(x*A,y*A,a0,Math.round(len*A),0); const P=[...S].map(s=>s.split(',').map(Number)), us=P.map(p=>p[0]), vs=P.map(p=>p[1]);
  return mark((Math.min(...us)-1)/A,(Math.min(...vs)-1)/A,(Math.max(...us)+2)/A,(Math.max(...vs)+2)/A,(u,v,b)=>S.has(u+','+v)?sh(b,.5):(S.has((u-1)+','+v)||S.has(u+','+(v-1)))&&hash(u,v,seed+5)<.35?sh(b,.8):null); }
// green in the gaps: moss, grass or lichen where a floor is darkest (its joints, its cracks, between its stones), thinning out from the middle
function joints(x,y,r,seed=o('seed',51),G=o('greens',[[70,104,52],[54,86,44],[92,124,62]])){ SHARED.PNAME='moss in the joints'; let thr=null;
  return mark(x-r,y-r,x+r,y+r,(u,v,b,X,Y)=>{ if(thr===null){ const bf=o('base',null)||((p,q)=>floorAt(p,q,o('lv',0))), L=[]; for(let i=0;i<7;i++)for(let j=0;j<7;j++){ const c=bf(x-r+(i+.5)*r/3.5,y-r+(j+.5)*r/3.5); if(c)L.push(lum(c)); } L.sort((p,q)=>p-q); thr=L.length?L[Math.floor(L.length*.5)]*.86:0; }
    if(lum(b)>thr)return null; const t=wearT(u,v,1-Math.hypot(X-x,Y-y)/r,seed,10); return t>.4?G[Math.floor(hash(u,v,seed+7)*G.length)]:null; }); }
// tape on a floor: rectangles [x0, y0, x1, y1, colour] (tiles), opaque
function tape(R){ SHARED.PNAME='tape marks'; const xs=R.flatMap(r=>[r[0],r[2]]), ys=R.flatMap(r=>[r[1],r[3]]);
  return mark(Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys),(u,v)=>{ const X=(u+.5)/A, Y=(v+.5)/A; for(const r of R)if(X>=r[0]&&X<r[2]&&Y>=r[1]&&Y<r[3])return hash(u,v,61)<.06?sh(r[4],.85):r[4]; return null; },true); }
// a cord lying on a floor along a line of points (tiles), a pixel wide
function cord(P,c=o('c',[34,34,36])){ SHARED.PNAME='cord'; const S=new Set();
  for(let s=0;s<P.length-1;s++){ const [ax,ay]=P[s],[bx,by]=P[s+1], n=Math.ceil(Math.hypot(bx-ax,by-ay)*A*2); for(let i=0;i<=n;i++)S.add(Math.floor((ax+(bx-ax)*i/n)*A)+','+Math.floor((ay+(by-ay)*i/n)*A)); }
  const xs=P.map(p=>p[0]), ys=P.map(p=>p[1]); return mark(Math.min(...xs)-.05,Math.min(...ys)-.05,Math.max(...xs)+.05,Math.max(...ys)+.05,(u,v)=>S.has(u+','+v)?(hash(u,v,71)<.15?sh(c,1.25):c):null,true); }
// letters painted on a floor (3 x 5, two art px each), reading along x from x, y
const F3={N:'110101101101101',O:'111101101101111',D:'110101101101110',I:'111010010010111',V:'101101101101010',G:'111100101101111',' ':'000000000000000'};
function floorWords(x,y,s,c){ SHARED.PNAME='floor lettering'; const W=s.length*8;
  return mark(x,y,x+W/A,y+10/A,(u,v,b)=>{ const a=u-Math.floor(x*A), q=v-Math.floor(y*A), i=Math.floor(a/8), g=F3[s[i]]; if(!g)return null; const cx=Math.floor((a%8)/2), cy=Math.floor(q/2); return cx<3&&cy<5&&g[cy*3+cx]==='1'?mix(b,c,.85):null; }); }
// an iron drain grate in a floor: a frame and its slots
function grate(x,y,w=.5,d=.5){ SHARED.PNAME='drain grate'; const c=[70,72,74];
  return mark(x-w/2,y-d/2,x+w/2,y+d/2,(u,v)=>{ const a=u-Math.floor((x-w/2)*A), q=v-Math.floor((y-d/2)*A), W=Math.round(w*A), D=Math.round(d*A); if(a<1||q<1||a>=W-1||q>=D-1)return sh(c,1.15); return a%3===0?[24,26,28]:c; }); }
// the park's grass trodden to earth: under the benches, a short cut across a lawn (the grass only; the trails stay as they are)
const EARTH=[[140,106,64],[120,90,54],[158,124,82]];
function trodden(P,w,seed=o('seed',81)){ SHARED.PNAME='trodden earth'; const xs=P.map(p=>p[0]), ys=P.map(p=>p[1]);
  return mark(Math.min(...xs)-w,Math.min(...ys)-w,Math.max(...xs)+w,Math.max(...ys)+w,(u,v,b)=>{ if(!isGrass(b))return null; const t=wearT(u,v,1-segD((u+.5)/A,(v+.5)/A,P)/w,seed,10);
    return t>.55?EARTH[hash(u,v,seed+2)<.12?2:hash(u,v,seed+3)<.3?1:0]:t>.4&&hash(u,v,seed+4)<.5?EARTH[1]:null; }); }

// ---- A THING ON A WALL: a face a hair off the wall, facing f (STUDIO's kit: rect, fb), its pixels pat(a, q) (a: art px along from its left
// as you face it, q: up from its foot), null where the wall shows through. Seen only from the room's side.
function onWall(x,y,f,W,z0,H,pat,D=.03){ const r=rect(x,y,f,W,D);
  return fb(r,0,1,0,1,z0,z0+H,[0,0,0],(s,t,z,len)=>s==='f'?pat(Math.min(Math.floor(t*len*A),Math.round(W*A)-1),Math.floor(z)):null,()=>null,{foot:1,nb:1}); }
const hung=(B,line=0)=>prop(B,null,{high:true,walk:true,...line?{}:{noLine:1}});
// a cobweb in a corner up under the ceiling: threads out from the corner and the rings across them, broken here and there; end: which end
// of it is the corner ('l' or 'r', as you face it)
function cobweb(x,y,f=[0,1],W=o('W',.7),H=o('H',20),z0=o('z',100),end=o('end','l')){ SHARED.PNAME='cobweb'; const c=[206,206,200], N=Math.round(W*A), R=Math.min(N,H*1.6);
  return hung([onWall(x,y,f,W,z0,H,(a,q)=>{ const dx=end==='l'?a:N-1-a, dy=H-1-q, r=Math.hypot(dx,dy*1.3); if(r>R)return null; const an=Math.atan2(dy*1.3,dx), k=an/(Math.PI/2)*5;
    if(Math.abs(k-Math.round(k))*r<.5*1.3/1.6+.2&&hash(Math.round(k),Math.floor(r/4),9)<.85)return c;            // the threads out from the corner
    const ring=r/5; if(Math.abs(ring-Math.round(ring))<.12&&Math.round(ring)>0&&hash(Math.round(ring),Math.floor(k),11)<.7)return sh(c,.9);   // the rings, sagging between threads
    return null; })]); }
// a flyer taped up: a sheet with a heading and lines of print, a strip of tape at its top corners, curling at its foot
function flyer(x,y,f=[0,1],z0=o('z',40),pc=o('c',[238,226,120]),seed=o('seed',91)){ SHARED.PNAME='flyer'; const W=o('w',.42), H=o('h',16), N=Math.round(W*A);
  return hung([onWall(x,y,f,W,z0,H,(a,q)=>{ const t=H-1-q; if((a<3||a>=N-3)&&t<2)return [214,214,200]; if(t<1)return null; if(q===0&&(a<2||a>N-3))return null;
    if(t>=3&&t<6&&a>=2&&a<N-2)return hash(a>>1,t,seed)<.7?[40,36,40]:pc;            // the heading
    if(t>=8&&(t&1)===0&&a>=2&&a<N-2&&t<H-2)return hash(a,t,seed+1)<.45?sh(pc,.55):pc; // the print
    return q<2?sh(pc,.88):pc; })]); }
// a pipe run along a wall at z, a bracket every tile; under its joints, the white crust an old slow leak leaves (efflorescence)
function pipe(x,y,f=[0,1],W=o('W',3),z=o('z',90),c=o('c',[132,136,132])){ SHARED.PNAME='pipe'; const N=Math.round(W*A), r=rect(x,y,f,W,.14), B=[];
  B.push(fb(r,0,1,0,1,z,z+5,c,(s,t,zz)=>zz>=4?sh(c,1.25):zz<1?sh(c,.7):((Math.floor(t*N)%24)<2?sh(c,.85):c),()=>sh(c,1.3),{foot:1,nb:1}));
  B.push(onWall(x,y,f,W,z-30,30,(a,q)=>{ const j=a%24; if(j<2&&q>=26)return [56,56,58];                         // the brackets
    const k=Math.floor(a/24), sp=hash(k,3,93)<.6; if(!sp)return null; const d=Math.abs(j-12+((hash(k,4,93)-.5)*8|0)), t=(30-q)/30, wid=2+t*0+(1-t)*5;
    return d<wid*(1-t*.7)&&hash(a,q,95)<.75-t*.6?(hash(a,q,97)<.3?[208,206,196]:[226,224,214]):null; },.02));
  return hung(B,1); }
// old wiring on porcelain knobs: two cloth-covered wires along a wall, the white knobs holding them a hand apart
function knobs(x,y,f=[0,1],W=o('W',2.5),z=o('z',96)){ SHARED.PNAME='knob wiring'; const N=Math.round(W*A);
  return hung([onWall(x,y,f,W,z,7,(a,q)=>{ const k=a%10; if(k<2&&q<7)return q===6?[246,244,236]:q===0?[188,184,174]:[226,222,212];
    return q===1||q===4?(hash(a,q,99)<.12?[64,52,40]:[44,36,30]):null; })]); }
// herbs hung up to dry: a peg rail, bundles tied at their stalks hanging heads down (lavender, sage, rosemary, yarrow, chamomile)
function herbs(x,y,f=[0,1],W=o('W',1.2),z=o('z',70)){ SHARED.PNAME='drying herbs'; const r=rect(x,y,f,W,.16), B=[], wood=[96,64,40], HC=[[132,104,168],[132,150,118],[70,96,62],[216,204,150],[230,226,200]];
  B.push(fb(r,0,1,.7,1,z,z+3,wood,(s,t,zz)=>zz>=2?sh(wood,1.2):wood,()=>sh(wood,1.25),{foot:1,nb:1}));
  const n=Math.max(2,Math.round(W/.24)); for(let i=0;i<n;i++){ const t=(i+.5)/n, c=HC[i%HC.length], L=10+Math.floor(hash(i,1,101)*6);
    B.push(fb(r,t-.025,t+.025,.55,.75,z-L+4,z,[150,120,80],(s,tt,zz)=>zz>L-6?[150,120,80]:hash(Math.floor(tt*4),zz,i)<.3?sh(c,.75):c,()=>c,{foot:1,nb:1})); }
  return hung(B,1); }
// tally marks scratched in a wall: groups of four struck through, paler than the stone
function tally(x,y,f=[0,1],n=o('n',23),z=o('z',40)){ SHARED.PNAME='tally marks'; const g=Math.ceil(n/5), W=(g*9+2)/A;
  return hung([onWall(x,y,f,W,z,9,(a,q)=>{ const k=Math.floor((a-1)/9), i=(a-1)%9; if(a<1||k>=g)return null; const m=Math.min(5,n-k*5);
    if(i<8&&(i&1)===0&&i/2<Math.min(4,m)&&q>=1&&q<8)return [150,146,138];
    if(m===5&&Math.abs((i)-(q-1)*1.1)<.7&&q>=1&&q<8)return [164,160,150]; return null; })]); }
// letters stuck to a mantel's front with a jack-knife (Holmes's correspondence): three envelopes, overlapping, the knife's handle through them
function letters(x,y,f=[1,0],z=o('z',26)){ SHARED.PNAME='letters on the mantel'; const N=14;
  return hung([onWall(x,y,f,N/A,z,12,(a,q)=>{ const t=11-q; if(a>=6&&a<8&&t<4)return t<1?[150,150,154]:[70,44,30];   // the knife
    const E=[[0,2,9,9,[232,226,206]],[4,3,13,11,[214,204,176]],[2,5,10,12,[240,236,222]]]; let c=null; for(const [a0,t0,a1,t1,col] of E)if(a>=a0&&a<a1&&t>=t0&&t<t1)c=a===a0||t===t1-1?sh(col,.85):col; return c; },.04)]); }
// a dryer's foil duct from the machine's back up to the vent: a ribbed silver tube against the wall
function duct(x,y,f=[1,0],z0=o('z',30),z1=o('z1',58)){ SHARED.PNAME='dryer duct'; const r=rect(x,y,f,.22,.22), c=[184,186,190];
  return hung([fb(r,0,1,0,1,z0,z1,c,(s,t,z)=>{ const e=Math.abs(t-.4)*2; return Math.floor(z)%3===0?sh(c,.62+(1-e)*.2):sh(c,e>.8?.72:e<.25?1.2:1); },(t,d)=>{ const e=Math.hypot(t-.5,d-.5)*2; return e>.9?null:e<.5?[60,60,64]:sh(c,1.1); },{foot:1,nb:1})],1); }

// ---- SMALL THINGS LEFT ON THE FLOOR (a few art px high; nothing to bump into)
const small=(B,name)=>{ SHARED.PNAME=name; const z=o('z',0); return prop(z?B.map(b=>zShift({...b,nb:1,foot:1},z+.5)):B.map(b=>({...b,nb:1})),null,{walk:true,...o('px',{})}); };   // (up off the floor: half a pixel over what it's on, as a mark)
const bx=(x0,y0,x1,y1,z0,z1,c,top,side)=>({x0,y0,x1,y1,z0,z1,c,foot:z0===0?1:0,top:top||(()=>sh(c,1.1)),fi:side||(()=>sh(c,.7)),fj:side||(()=>sh(c,.85))});
function sock(x,y,c=o('c',[226,224,216])){ return small([bx(x,y,x+.24,y+.09,0,1.5,c,(X)=>X-x<.05?sh(c,.8):(Math.floor((X-x)*A)%4<1?[180,60,60]:c))],'lone sock'); }
function roll(x,y){ const c=[242,240,234]; return small([bx(x,y,x+.14,y+.14,0,6,c,(X,Y)=>Math.hypot(X-x-.07,Y-y-.07)<.03?[150,130,110]:c)],'spare roll'); }
function cup(x,y,c=o('c',[200,50,46])){ return small([bx(x,y,x+.2,y+.12,0,3,c,(X)=>X-x>.15?[232,228,220]:c,(v,z)=>z>2?sh(c,.9):sh(c,.7))],'crushed cup'); }
function goggles(x,y){ const c=[60,150,210]; return small([bx(x,y,x+.07,y+.07,0,1.2,c),bx(x+.09,y,x+.16,y+.07,0,1.2,c),bx(x-.04,y+.03,x+.2,y+.045,0,.6,[34,34,38])],'goggles'); }
function sandbag(x,y){ const c=[176,160,124]; return small([bx(x,y,x+.32,y+.22,0,6,c,(X,Y)=>Math.abs(X-x-.16)<.02?sh(c,.8):c,(v,z)=>z>4?sh(c,.9):sh(c,.7))],'sandbag'); }
function fluff(x,y,c=o('c',[150,148,146]),n=5){ const B=[]; for(let i=0;i<n;i++){ const a=x+hash(i,1,111)*.18, b=y+hash(i,2,111)*.12, s=.03+hash(i,3,111)*.03; B.push(bx(a,b,a+s,b+s,0,1+Math.floor(hash(i,4,111)*2),sh(c,.9+hash(i,5,111)*.2))); } return small(B,'dust bunny'); }
function shards(x,y,r=.35,c=o('c',[150,170,255]),n=o('n',7)){ const B=[]; for(let i=0;i<n;i++){ const a=x+(hash(i,1,121)-.5)*2*r, b=y+(hash(i,2,121)-.5)*2*r, s=.03+hash(i,3,121)*.035, h=1+Math.floor(hash(i,4,121)*4);
  B.push(bx(a,b,a+s,b+s,0,h,c,()=>sh(c,1.35),(v,z)=>z>=h-1?sh(c,1.1):sh(c,.7))); } return small(B,'crystal shards'); }
function stubs(x,y,c=o('c',[86,84,104]),n=3){ const B=[]; for(let i=0;i<n;i++){ const a=x+i*.16+hash(i,1,131)*.06, b=y+hash(i,2,131)*.12, h=5+Math.floor(hash(i,3,131)*8);
  for(let k=0;k<3;k++){ const s=.07-k*.02; B.push(bx(a+.035-s/2,b+.035-s/2,a+.035+s/2,b+.035+s/2,k*h/3,(k+1)*h/3,c,()=>sh(c,1.15),(v,z)=>hash(Math.floor(z),k,i)<.2?sh(c,.6):sh(c,.75))); } } return small(B,'stalagmites'); }
function wax(x,y,c=o('c',[236,228,200])){ const B=[]; for(let i=0;i<4;i++){ const a=x+hash(i,1,141)*.16, b=y+hash(i,2,141)*.1, s=.03+hash(i,3,141)*.04; B.push(bx(a,b,a+s,b+s*.8,0,1,c,()=>sh(c,1.05))); } return small(B,'candle wax'); }
function strip(x,y){ const c=[226,224,218]; return small([bx(x,y,x+.4,y+.1,0,2,c,(X,Y)=>{ const a=Math.floor((X-x)*A); return a>1&&a<9&&(a%3)===1&&Math.abs(Y-y-.05)<.03?[50,50,52]:a>=8&&Math.abs(Y-y-.05)<.03?[220,60,50]:c; })],'power strip'); }

// ---- THE CATALOG: each made where it's clicked (department Lived In; the wall things on the wall facing the room, as the editor turns them)
const K=(kind,no,desc,mk)=>{ CATALOG[kind]=mk; CAT_INFO[kind]={no:'W-'+String(no).padStart(2,'0'),name:kind.replace(/\b\w/g,c=>c.toUpperCase()),dept:'lived',price:0,desc,mat:'wear'}; KIND_OF[kind]=kind; };
[['worn path',1,'A path worn into the floor where everyone walks.',(x,y)=>worn(o('P',[[x-1,y],[x+1,y]]),o('w',.4))],
 ['gum spots',2,'Old gum trodden flat into the ground.',(x,y)=>{ SHARED.PNAME='gum spots'; const r=o('r',1.5); return scatter(x-r,y-r,x+r,y+r,6,(X,Y)=>o('d',.32)*(1-Math.hypot(X-x,Y-y)/r),h=>h<.4?[[0,0,0],[1,0,0]]:h<.7?[[0,0,0]]:[[0,0,1],[1,0,1],[0,1,1],[1,1,1]],(k,b,h)=>k?sh(b,.62):h<.55?[48,46,46]:sh(b,.55)); }],
 ['scuffs',3,'Black scuffs where shoes and chair feet rub.',(x,y)=>{ SHARED.PNAME='scuffs'; const w=o('w',1), d=o('d',.4); return scatter(x-w/2,y-d/2,x+w/2,y+d/2,7,()=>o('dn',.5),h=>h<.5?[[0,0],[1,0],[2,0],[3,1]].map(p=>[...p,0]):[[0,0],[1,1],[1,2]].map(p=>[...p,0]),(k,b)=>sh(b,.6)); }],
 ['hairline crack',4,'A thin crack wandering across the floor.',(x,y)=>livedCrack(x,y,o('len',1.6))],
 ['moss in the joints',5,'Moss and grass come up where the floor is cracked or jointed.',(x,y)=>joints(x,y,o('r',.8))],
 ['chalk dust',6,'A dusting of chalk on the floor.',(x,y)=>dust(x,y,o('r',.5),o('c',[236,236,230]))],
 ['popcorn',7,'Kernels dropped in an aisle.',(x,y)=>{ SHARED.PNAME='popcorn'; const w=o('w',.6), d=o('d',2); return scatter(x-w/2,y-d/2,x+w/2,y+d/2,7,()=>o('dn',.38),h=>h<.6?[[0,0,0],[1,0,1],[0,1,1]]:[[0,0,0],[1,0,0]],(k,b,h)=>k?[230,190,90]:[246,238,206],o('seed',7),null,true); }],
 ['tape marks',8,'Spike marks taped on a floor.',(x,y)=>tape(o('R',[[x-.15,y-.03,x+.15,y+.03,[240,220,60]],[x-.03,y-.03,x+.03,y+.15,[240,220,60]]]))],
 ['cord',9,'A cord lying along the floor.',(x,y)=>cord(o('P',[[x-1,y],[x+1,y]]))],
 ['cigarette butts',10,'Butts stubbed out by a door.',(x,y)=>{ SHARED.PNAME='cigarette butts'; const r=o('r',.5); return scatter(x-r,y-r,x+r,y+r,6,fall(x,y,r),h=>h<.5?[[0,0,0],[1,0,0],[2,0,1]]:[[0,0,0],[0,1,0],[0,2,1]],(k)=>k?[200,120,60]:[236,230,214],o('seed',10),null,true); }],
 ['tokens and tickets',11,'Dropped tokens and torn ticket strips.',(x,y)=>{ SHARED.PNAME='tokens and tickets'; const r=o('r',.8); return scatter(x-r,y-r,x+r,y+r,7,fall(x,y,r),h=>h<.45?[[0,0,0],[1,0,0],[0,1,0],[1,1,1]]:h<.75?[[0,0,2],[1,0,2],[2,0,2],[3,0,3]]:[[0,0,2],[0,1,2],[0,2,3]],(k)=>[[214,170,60],[236,206,100],[236,120,70],[200,90,60]][k],o('seed',11),null,true); }],
 ['clover',12,'Clover and dandelions along the edge of a path.',(x,y)=>{ SHARED.PNAME='clover'; const r=o('r',1.5), near=o('near',null); return scatter(x-r,y-r,x+r,y+r,6,()=>o('dn',.4),h=>h<.35?[[0,0,0],[1,0,1]]:h<.6?[[0,0,2],[1,0,2],[0,1,2]]:[[0,0,1],[1,1,1]],(k,b)=>[[246,212,60],[66,118,52],[240,240,232]][k],o('seed',33),(b,X,Y)=>isGrass(b)&&(!near||near(X,Y))); }],
 ['trodden earth',13,'Grass worn down to earth where people stand and cut across.',(x,y)=>trodden(o('P',[[x-.8,y],[x+.8,y]]),o('w',.5))],
 ['floor lettering',14,'NO DIVING, painted on a deck.',(x,y)=>floorWords(x,y,o('s','NO DIVING'),o('c',[40,52,96]))],
 ['drain grate',15,'An iron grate over a floor drain.',(x,y)=>grate(x,y,o('w',.5),o('d',.5))],
 ['cobweb',16,'A cobweb up in a corner.',(x,y)=>cobweb(x,y)],['flyer',17,'A flyer taped up.',(x,y)=>flyer(x,y)],['pipe',18,'A pipe along a wall, the white crust of an old leak under it.',(x,y)=>pipe(x,y)],
 ['knob wiring',19,'Old wiring on porcelain knobs.',(x,y)=>knobs(x,y)],['drying herbs',20,'Bundles of herbs hung up to dry.',(x,y)=>herbs(x,y)],['tally marks',21,'Marks scratched in a wall, counting days.',(x,y)=>tally(x,y)],
 ['letters on the mantel',22,'Letters stuck to the mantel with a jack-knife.',(x,y)=>letters(x,y)],['dryer duct',23,'A foil duct from a dryer to its vent.',(x,y)=>duct(x,y)],
 ['lone sock',24,'A sock that missed the basket.',(x,y)=>sock(x,y)],['spare roll',25,'A spare toilet roll.',(x,y)=>roll(x,y)],['crushed cup',26,'A cup left under a seat.',(x,y)=>cup(x,y)],
 ['goggles',27,'Swimming goggles someone forgot.',(x,y)=>goggles(x,y)],['sandbag',28,'A stage weight: a canvas bag of sand.',(x,y)=>sandbag(x,y)],['dust bunny',29,'Fluff gathered in a corner.',(x,y)=>fluff(x,y)],
 ['crystal shards',30,'Broken bits of crystal.',(x,y)=>shards(x,y)],['stalagmites',31,'Stubs of stone grown up from the floor.',(x,y)=>stubs(x,y)],['candle wax',32,'Hardened drips of wax.',(x,y)=>wax(x,y)],
 ['power strip',33,'A power strip on the floor.',(x,y)=>strip(x,y)],['dust',34,'Dust, flour, ash or rust lying thin on a floor.',(x,y)=>dust(x,y,o('r',.5),o('c',[180,176,170]),o('seed',21),o('sx',1),o('sy',1))],
 ['ring stains',36,'Rings left by glasses on a table top.',(x,y)=>rings(o('C',[[x,y,.08],[x+.14,y+.05,.07]]))],
 ['fallen leaves',37,'Leaves dropped round a plant.',(x,y)=>{ SHARED.PNAME='fallen leaves'; const r=o('r',.4), G=o('greens',[[96,130,60],[150,130,60],[120,92,52],[70,110,50]]); return scatter(x-r,y-r,x+r,y+r,6,fall(x,y,r),h=>h<.5?[[0,0,0],[1,0,0],[1,1,1]]:[[0,0,0],[0,1,1]],(k,b,h)=>sh(G[Math.floor(h*7)%G.length],k?.8:1),o('seed',37),null,true); }],
 ['hay strands',38,'Strands of hay blown loose.',(x,y)=>{ SHARED.PNAME='hay strands'; const r=o('r',.8); return scatter(x-r,y-r,x+r,y+r,6,fall(x,y,r),h=>h<.5?[[0,0,0],[1,0,0],[2,1,1],[3,1,1]]:[[0,0,0],[0,1,0],[1,2,1],[1,3,1]],(k)=>k?[206,172,96]:[226,196,120],o('seed',38),null,true); }],
 ['rust stain',35,'Rust run down onto the floor.',(x,y)=>{ O={name:'rust stain',...O}; return dust(x,y,o('r',.4),o('c',[130,70,40])); }]].forEach(([k,no,d,mk])=>K(k,no,d,mk));
CAT_DEPTS.push(['lived','Lived In']);
return {set(s){ O=s||{}; },isGrass,mix}; })();
SHARED.PNAME='object';

};
export {livedIn};
