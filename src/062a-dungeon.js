// THE DUNGEON: the dungeon under the castle, its rooms, stairs, torches and walls (closes its own builder).
import {SHARED, THREE} from './003-shx.js';
import {BATCH, CITY, LEVELS, LITE, PH, pos, RAG, UI, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {CASTLE, cutWalls, FADE, FIX, grab, MAPG, MODS, OFFDX, SOL, STN, SYS, TILE} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
import {castleMat, gboxS} from './062-castle.js';
await grab('dungeon',async()=>{});
{ const K=SHARED.BOD.KC, KP=SHARED.BOD.K.PROPS, Kc=K.CATALOG, sh=SHARED.BOD.K.sh, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, Y=SHARED.BOD.YS, {faceTex,bq,C}=SHARED.BOD, P0=K.DGP, D0=K.DGN, dy=STN.DY, T=.1, NL=5, G=MAPG.dungeon;
  const iX=x=>(x-X(0))/TILE, iZ=z=>(z-Z(0))/TILE, OX=900+OFFDX, OY=-20;
  // one map (owner, 7 Nov 2026): rooms and the corridors between them, [name, x0,y0,x1,y1 from the stair's corner, danger 0..1, a corridor]; the further from the stair, the deadlier and the richer
  const MAP=[['THE ENTRANCE HALL',0,0,14,20,0],['',14,8,30,12,.05,1],['THE CRYPT',30,0,44,18,.1],['',5,20,9,30,.08,1],['THE OSSUARY',0,30,14,42,.15],['THE LONG GALLERY',44,6,74,12,.22],
    ['',54,12,58,24,.28,1],['THE WEB HALL',46,24,66,40,.35],['',30,30,46,34,.4,1],['THE NEST',18,26,30,40,.45],['THE CHAPEL',74,0,90,18,.42],['',80,18,84,28,.48,1],['THE LEVER ROOM',74,28,90,42,.52],
    ['',66,32,74,36,.5,1],['',54,40,58,48,.56,1],['THE BRIDGES',42,48,70,62,.62],['',26,52,42,56,.68,1],['THE VAULT',14,48,26,62,.74],['',80,42,84,50,.62,1],['THE FORGE',74,50,92,64,.72],
    ['',70,54,74,58,.68,1],['',54,62,58,70,.8,1],['THE BONE PIT',44,70,68,84,.86],['',82,64,86,72,.9,1],['THE THRONE',72,72,96,92,1],['',68,76,72,80,.93,1]];
  const rmOf=()=>MAP.map(([nm,x0,y0,x1,y1,d,c],i)=>({i,k:i+1,nm,d,c:!!c,n:1+Math.round(d*4),B:{x0:OX+x0,y0:OY+y0,x1:OX+x1,y1:OY+y1,h:130}})), bbOf=()=>({x0:OX,y0:OY,x1:OX+Math.max(...MAP.map(m=>m[3])),y1:OY+Math.max(...MAP.map(m=>m[4])),h:130});
  const RM=rmOf(), BB=bbOf(), MAP0=MAP.map(r=>r.slice());   // the map as built in; the dungeon master's layout replaces it (setMap), the first room always the entrance with the stair
  const inB=(B,gx,gy,m=0)=>gx>B.x0-m&&gx<B.x1+m&&gy>B.y0-m&&gy<B.y1+m, roomAt=(gx,gy)=>RM.find(r=>inB(r.B,gx,gy))||null;
  const lotAt=(x,z)=>inB(BB,iX(x),iZ(z),.5)?1:0;
  const opens=(r,s)=>{ const B=r.B, o=[]; for(const q of RM){ if(q===r)continue; const A=q.B;   // where a side of a room meets another room or corridor: an opening
      if(s==='b'&&A.y1===B.y0||s==='f'&&A.y0===B.y1){ const a=Math.max(A.x0,B.x0), b=Math.min(A.x1,B.x1); if(b>a)o.push([a,b]); }
      if(s==='w'&&A.x1===B.x0||s==='e'&&A.x0===B.x1){ const a=Math.max(A.y0,B.y0), b=Math.min(A.y1,B.y1); if(b>a)o.push([a,b]); } } return o.sort((u,v)=>u[0]-v[0]); };
  const traps=(n,R,dn,seed)=>{ let sd=(seed??n)*7919+13; const r=()=>{ sd=sd*16807%2147483647; return (sd-1)/2147483646; }, H=[], end=(dn?dn.y0:R.y1)-2; let y=R.y0+6.5, side=r()<.5;   // the same pits, spikes and webs each time you come to a level; more of them deeper
    while(y<end-1.6){ const p=r();
      if(p<.34+.04*n){ const k=r(), rx=k<.3?.7+r()*.5:k<.75?1.3+r()*.9:Math.min(3.4,2.2+r()*1.1+.15*n), ry=Math.max(.6,Math.min(2.4,rx*(.45+r()*.35))), wl=r()<.55, W=R.x1-R.x0;
        const cx=wl?(side?R.x0+rx*.7:R.x1-rx*.7):R.x0+1.4+rx*1.3+r()*Math.max(0,W-2.8-2.6*rx), cy=y+ry*1.3, src=wl&&r()<.6?'wall':!wl&&r()<.45?'ceil':null;
        H.push({t:'lava',cx,cy,rx,ry,ph:[r()*6.3,r()*6.3,r()*6.3],src,fz:36+r()*50,fo:r()-.5,x0:Math.max(R.x0,cx-rx*1.3),x1:Math.min(R.x1,cx+rx*1.3),y0:cy-ry*1.3,y1:cy+ry*1.3}); if(wl)side=!side; y+=2.6*ry+2+r()*1.4; }
      else if(p<.6+.05*n){ const w=4.5+r()*4, d=r()<.4?2:1, x0=R.x0+.5+r()*(R.x1-R.x0-1-w); H.push({t:'spike',x0,y0:y,x1:x0+w,y1:y+d,ph:r()*2.4}); y+=d+2+r()*1.4; }
      else if(p<.88){ const rr=.8+r()*.5; H.push({t:'web',cx:R.x0+1.4+r()*(R.x1-R.x0-2.8),cy:y+rr,r:rr}); y+=2*rr+1.6+r(); }
      else y+=2.4; }
    const LV=H.filter(h=>h.t==='lava'); if(LV.length&&!LV.some(h=>h.src==='ceil'))LV.reduce((a,h)=>(h.src!=='wall')-(a.src!=='wall')||h.rx-a.rx>0?h:a).src='ceil';   // every level has lava pouring from its ceiling
    return H; };
  const LC={}; const lay=k=>{ if(LC[k])return LC[k]; const r=RM[k-1]; if(!r)return null; const B=r.B, n=r.n, bare=r.c, R={...D0,H:D0.H*3,b:B,x0:B.x0+T,x1:B.x1-T,y0:B.y0+T,y1:B.y1-T,cx:(B.x0+B.x1)/2,cy:(B.y0+B.y1)/2,in:[B.x0-T,B.y0-T,B.x1+T,B.y1+T],
      door:{w:'-'},slit:{w:'-'},tally:{w:'-'},banners:[],holes:bare?[]:D0.holes.filter(h=>k>1||h.w!=='b'),chains:bare?[]:D0.chains,ivy:bare?[]:D0.ivy,cracks:bare?[]:D0.cracks,torches:[]};
    const ds={}; for(const s of 'bfwe')ds[s]=opens(r,s);
    const nearDoor=(x0,y0,x1,y1,m)=>ds.b.some(([a,b])=>x1>a-m&&x0<b+m&&y0<B.y0+m)||ds.f.some(([a,b])=>x1>a-m&&x0<b+m&&y1>B.y1-m)||ds.w.some(([a,b])=>y1>a-m&&y0<b+m&&x0<B.x0+m)||ds.e.some(([a,b])=>y1>a-m&&y0<b+m&&x1>B.x1-m);
    const up=k===1?{x0:R.x0+2.2,x1:R.x0+4.2,y0:R.y0,y1:R.y0+3,n:6,rise:8,up:1}:null;
    const hz=bare||!r.d?[]:traps(n,R,null,k).filter(h=>h.t==='web'?!nearDoor(h.cx-h.r,h.cy-h.r,h.cx+h.r,h.cy+h.r,2.5):!nearDoor(h.x0,h.y0,h.x1,h.y1,2.5));   // no trap in a doorway
    const fall=(w,u)=>hz.some(h=>h.src==='wall'&&(h.cx<R.cx)===(w==='l')&&Math.abs(h.cy+h.fo*h.ry*.6-(R.y0+u))<1.4), gap=(w,u)=>(w==='l'?ds.w:ds.e).some(([a,b])=>R.y0+u>a-1&&R.y0+u<b+1);
    const gapX=(w,u)=>(w==='b'?ds.b:ds.f).some(([a,b])=>R.x0+u>a-1&&R.x0+u<b+1), lng=Math.max(B.x1-B.x0,B.y1-B.y0), tsp=bare?6:5;   // torches on every wall, closer together, and down the corridors (owner, 8 Nov 2026: "enough torches around to make everything visible enough")
    if(!bare||B.y1-B.y0>=B.x1-B.x0)for(let u=2.6;u<B.y1-B.y0-1.6;u+=tsp)for(const t of [{w:'l',u},{w:'r',u:u+tsp/2>B.y1-B.y0-1.6?u:u+tsp/2}])if(!fall(t.w,t.u)&&!gap(t.w,t.u))R.torches.push(t);
    if(!bare||B.x1-B.x0>B.y1-B.y0)for(let u=2.6;u<B.x1-B.x0-1.6;u+=tsp+1)for(const t of [{w:'b',u},{w:'f',u:u+(tsp+1)/2>B.x1-B.x0-1.6?u:u+(tsp+1)/2}])if(!gapX(t.w,t.u)&&!(up&&t.w==='b'&&R.x0+t.u>up.x0-1.4&&R.x0+t.u<up.x1+1.4)&&lng>0)R.torches.push(t);
    const clear=(x,y)=>!hz.some(h=>h.t==='web'?Math.hypot(x-h.cx,y-h.cy)<h.r+.8:x>h.x0-.8&&x<h.x1+.8&&y>h.y0-.8&&y<h.y1+.8);
    let sp=null, bd=1e9; for(let x=R.x0+1;x<R.x1-1;x+=.5)for(let y=R.y0+1;y<R.y1-1;y+=.5)if(clear(x,y)){ const d=Math.hypot(x-R.cx,y-R.cy); if(d<bd){ bd=d; sp={x,y}; } }   // where you arrive: the clear point nearest the middle
    if(!sp)sp={x:R.cx,y:R.cy};
    return LC[k]={n,k,nm:r.nm,c:r.c,safe:!r.d,seed:k*31+n,B,R,up,dn:null,hz,ds,atUp:up?{x:X((up.x0+up.x1)/2),z:Z(up.y1+.6),h:0}:{x:X(sp.x),z:Z(sp.y),h:0},atDn:null}; };
  const pick=n=>{ const r=RM.find(r=>!r.c&&r.n===n)||RM.filter(r=>!r.c).reduce((a,r)=>Math.abs(r.n-n)<Math.abs(a.n-n)?r:a); return r.k; };
  const lavaR=(h,a)=>1+.16*Math.sin(3*a+h.ph[0])+.09*Math.sin(5*a+h.ph[1])+.05*Math.sin(8*a+h.ph[2]);   // a pool's edge: its radius at each angle
  const tread=(S,gx,gy)=>S&&gx>=S.x0&&gx<S.x1&&gy>=S.y0&&gy<S.y1?Math.min(S.n,Math.floor((S.up?S.y1-gy:gy-S.y0)/((S.y1-S.y0)/S.n))+1):0;
  const ground=(x,z)=>{ if(!lotAt(x,z))return dy; const gx=iX(x), gy=iZ(z), u=tread(lay(1).up,gx,gy); if(u)return dy+Y(u*lay(1).up.rise); const r=mine&&MODS.dunTerr?roomAt(gx,gy):null, l=r&&LC[r.k]; return dy+Y(l&&l.T?MODS.dunTerr.h(l,gx,gy):0); };
  const PL={}, SIDE={b:[0,1],f:[0,-1],w:[1,0],e:[-1,0]}; for(const k in SIDE)PL['K'+k]=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
  let cur=0, busy=false, mine=null; const HK=[], band=()=>cur?RM[cur-1].n:1;
  const clear=()=>{ '@later'; if(!mine)return; const M=mine; mine=null; cur=0;
    for(const o of M.objs){ G.remove(o); o.traverse(c=>{ if(c.geometry)c.geometry.dispose(); if(c.material&&c.material!==MODS.castleStairMat)for(const q of [].concat(c.material)){ if(q.map)q.map.dispose(); if(q.emissiveMap)q.emissiveMap.dispose(); q.dispose(); } }); }
    const out=(A,L)=>{ for(const a of L){ const i=A.indexOf(a); if(i>=0)A.splice(i,1); } };
    out(SOL.down,M.sol); out(FIX.down,M.fix); if(CITY.extra&&CITY.extra.down)out(CITY.extra.down,M.route||[]); out(LITE.recs,M.lights); out(FLAME.src,M.fl); out(cutWalls,M.cuts); LITE.t=0; for(const f of HK)f(0); };
  const build=()=>{ '@dungeon'; clear(); const Ls=RM.map(r=>lay(r.k)), E=Ls[0], up=E.up, s0=scene.children.length, n0=KP.length, l0=K.LAMPS.length, f0=FLAME.src.length, keep=BATCH.items.splice(0), M={objs:[],sol:[],fix:[],lights:[],fl:[],cuts:[],route:[]};
    const arch=(nx,ny,Xp,Yp,z)=>{ if(ny<=0||Math.abs(Yp-E.R.y0)>.06||Xp<up.x0-.2||Xp>up.x1+.2)return null; const hw=(up.x1-up.x0)*12, d=Math.abs(Xp-(up.x0+up.x1)/2)*24, sp=up.n*up.rise+30, r=Math.hypot(d,Math.max(0,z-sp));
      return r<hw-3?P0.dark:r<hw+2?sh(P0.hi,.8):null; };
    const RW=MODS.dunTerr&&MODS.dunTerr.wall, wall=(R,x0,y0,x1,y1)=>({x0,y0,x1,y1,z0:0,z1:R.H+4,tk:1/3,c:P0.st[1],top:()=>P0.lo,fs:(nx,ny,Xp,Yp,z,k)=>(R===E.R&&arch(nx,ny,Xp,Yp,z))||(RW?RW(nx,ny,Xp,Yp,z,R):K.dungeonWall(null,nx,ny,Xp,Yp,z,k,R))});   // rock, three times the old height (owner, 8 Nov 2026: "ceilings 3x higher ... dont use bricks on the wall, its all rocks")
    const seg=(lo,hi,O)=>{ const out=[]; let a=lo; for(const [p,q] of O){ if(p>a)out.push([a,p]); a=Math.max(a,q); } if(hi>a)out.push([a,hi]); return out; }, WB=[];
    for(const {B,R,ds} of Ls){   // each side's wall, broken where it opens into the next room
      for(const [a,b] of seg(B.x0,B.x1,ds.b))WB.push(['Kb',wall(R,a===B.x0?a-T:a,B.y0-T,b===B.x1?b+T:b,B.y0+T)]);
      for(const [a,b] of seg(B.x0,B.x1,ds.f))WB.push(['Kf',wall(R,a===B.x0?a-T:a,B.y1-T,b===B.x1?b+T:b,B.y1+T)]);
      for(const [a,b] of seg(B.y0,B.y1,ds.w))WB.push(['Kw',wall(R,B.x0-T,a===B.y0?a+T:a,B.x0+T,b===B.y1?b-T:b)]);
      for(const [a,b] of seg(B.y0,B.y1,ds.e))WB.push(['Ke',wall(R,B.x1-T,a===B.y0?a+T:a,B.x1+T,b===B.y1?b-T:b)]); }
    const floor=(x0,y0,x1,y1,R)=>{ if(x1-x0<.01||y1-y0<.01)return; bq([X(x0),Y(.3)+dy,Z(y1)],[X(x1),Y(.3)+dy,Z(y1)],[X(x1),Y(.3)+dy,Z(y0)],[X(x0),Y(.3)+dy,Z(y0)],faceTex(Math.round((x1-x0)*24),Math.round((y1-y0)*24),(i,j)=>C(MODS.dunTerr?MODS.dunTerr.floorCol(x0+(i+.5)/24,y0+(j+.5)/24,R,'cave'):K.dungeonFloorCol(x0+(i+.5)/24,y0+(j+.5)/24,R))),'L'); };
    for(const {R} of Ls)for(const t of R.torches){ const [x,y]=t.w==='l'?[R.x0+.16,R.y0+t.u]:t.w==='r'?[R.x1-.16,R.y0+t.u]:t.w==='b'?[R.x0+t.u,R.y0+.16]:[R.x0+t.u,R.y1-.16]; Kc['wall torch'](x,y,t.w); }
    const LK=MODS.dunLook, solid=LK?Ls.filter(l=>!l.c).flatMap(l=>LK.props(l,Kc)):[], TR=MODS.dunTerr;
    if(TR)for(const l of Ls)if(!l.T)TR.make(l);   // the uneven ground, after the props so it keeps them on the flat
    for(const l of Ls)if(!l.T)floor(l.B.x0,l.B.y0,l.B.x1,l.B.y1,l.R);
    const made=KP.slice(n0); KP.length=n0; BATCH.meshes={}; BATCH.cast=true; for(const [k,b] of WB)gboxS(b,k,dy); for(const p of made)for(const b of p.boxes)gboxS(b,'L',dy);
    BATCH.build((k,map,emap)=>castleMat(k,map,emap,PL[k])); BATCH.cast=false;
    for(const k in PL)for(const me of BATCH.all(BATCH.meshes,k)){ const s=SIDE[k[1]], w={pl:PL[k],nx:s[0],nz:s[1],foot:dy+Y(6),me,when:()=>SHARED.LVL==='down'&&!!mine}; cutWalls.push(w); M.cuts.push(w); } BATCH.meshes={}; BATCH.items=keep;
    const dn=null;
    const P=[], Cc=[], c3=new THREE.Color(), ST=[88,84,78], ST2=[74,70,66];
    const quad=(a,b,c,d,col)=>{ c3.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(const v of [a,b,c,a,c,d]){ P.push(...v); Cc.push(c3.r,c3.g,c3.b); } };
    const box=(x0,y0,z0,x1,y1,z1,col)=>{ const [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[Y(z0)+dy,Y(z1)+dy], dk=col.map(v=>v*.8), lt=col.map(v=>Math.min(255,v*1.08));
      quad([a,f,d],[b,f,d],[b,f,c],[a,f,c],lt); quad([a,e,d],[b,e,d],[b,f,d],[a,f,d],col); quad([b,e,c],[a,e,c],[a,f,c],[b,f,c],col); quad([a,e,c],[a,e,d],[a,f,d],[a,f,c],dk); quad([b,e,d],[b,e,c],[b,f,c],[b,f,d],dk); };
    const sol=(x0,y0,x1,y1,z1)=>{ const s=[X(x0),Z(y0),X(x1),Z(y1)], f=[X(x0),Z(y0),dy,X(x1),Z(y1),dy+Y(z1)]; SOL.down.push(s); FIX.down.push(f); M.sol.push(s); M.fix.push(f); };
    { const S=up, rn=(S.y1-S.y0)/S.n, a=X(S.x0), b=X(S.x1);
      for(let k=1;k<=S.n;k++){ const yA=S.y1-k*rn, yB=S.y1-(k-1)*rn, h=Y(k*S.rise)+dy, h0=Y((k-1)*S.rise)+dy;
        quad([a,h,Z(yB)],[b,h,Z(yB)],[b,h,Z(yA)],[a,h,Z(yA)],(k&1)?ST:ST2); quad([a,h0,Z(yB)],[b,h0,Z(yB)],[b,h,Z(yB)],[a,h,Z(yB)],ST2.map(v=>v*.82));
        for(const x of [S.x0-.2,S.x1])box(x,yA,0,x+.2,yB,k*S.rise+6,ST2); }
      for(const x of [S.x0-.2,S.x1])sol(x,S.y0,x+.2,S.y1,S.n*S.rise+6); }
    if(dn){ const S=dn, rn=(S.y1-S.y0)/S.n, a=X(S.x0), b=X(S.x1), bot=Y(-(S.n*S.rise+24))+dy, top=Y(.3)+dy, z1=Z(S.y1), DK=P0.dark;
      for(let k=1;k<=S.n;k++){ const yA=S.y0+(k-1)*rn, yB=S.y0+k*rn, h=Y(-k*S.rise)+dy, h0=Y(-(k-1)*S.rise)+dy;
        quad([a,h,Z(yB)],[b,h,Z(yB)],[b,h,Z(yA)],[a,h,Z(yA)],(k&1)?ST:ST2); quad([b,h,Z(yA)],[a,h,Z(yA)],[a,h0,Z(yA)],[b,h0,Z(yA)],ST2.map(v=>v*.82)); }
      quad([a,bot,Z(S.y0)],[a,bot,z1],[a,top,z1],[a,top,Z(S.y0)],ST2.map(v=>v*.7)); quad([b,bot,z1],[b,bot,Z(S.y0)],[b,top,Z(S.y0)],[b,top,z1],ST2.map(v=>v*.7));
      const mid=Y(-S.rise*2)+dy; quad([b,mid,z1],[a,mid,z1],[a,top,z1],[b,top,z1],ST2.map(v=>v*.6)); quad([b,bot,z1],[a,bot,z1],[a,mid,z1],[b,mid,z1],DK);
      for(const x of [S.x0-.2,S.x1]){ box(x,S.y0,0,x+.2,S.y1+.2,8,ST2); sol(x,S.y0,x+.2,S.y1+.2,8); } box(S.x0,S.y1,0,S.x1,S.y1+.2,8,ST2); sol(S.x0,S.y1,S.x1,S.y1+.2,8); }
    { const H={lava:[],sp:[],webs:[]}, fy=Y(.3)+dy, own=o=>{ scene.add(LEVELS.own(o,'dungeon')); return o; };
      const B=BB, ceil=new THREE.Mesh(new THREE.PlaneGeometry(X(B.x1)-X(B.x0),Math.abs(Z(B.y1)-Z(B.y0))).rotateX(Math.PI/2),new THREE.MeshLambertMaterial({map:CEIL()}));   // faces down: seen when you look up, gone from above
      ceil.position.set((X(B.x0)+X(B.x1))/2,Y(E.R.H+4)+dy,(Z(B.y0)+Z(B.y1))/2); ceil.material.map.repeat.set(B.x1-B.x0,B.y1-B.y0); ceil.receiveShadow=true; own(ceil);
      const HZ=Ls.flatMap(l=>l.hz), LV=HZ.filter(h=>h.t==='lava'), SP=HZ.filter(h=>h.t==='spike'), WE=HZ.filter(h=>h.t==='web');
      H.lava.push(...LV);
      let ns=0; const cells=SP.map(h=>{ const c=[]; for(let x=h.x0+.17;x<h.x1;x+=.34)for(let y=h.y0+.17;y<h.y1;y+=.34)c.push([x,y]); ns+=c.length; quad([X(h.x0),fy+.004*TILE,Z(h.y1)],[X(h.x1),fy+.004*TILE,Z(h.y1)],[X(h.x1),fy+.004*TILE,Z(h.y0)],[X(h.x0),fy+.004*TILE,Z(h.y0)],[34,32,32]); return c; });
      if(ns){ const IM=new THREE.InstancedMesh(new THREE.ConeGeometry(.05*TILE,.34*TILE,4),new THREE.MeshLambertMaterial({color:0x8e8a84}),ns); IM.castShadow=true; IM.frustumCulled=false; own(IM); let i=0;
        SP.forEach((h,k)=>{ H.sp.push({...h,i0:i,c:cells[k],up:null,hit:false,IM}); i+=cells[k].length; }); H.spIM=IM; }
      for(const h of WE){ const me=new THREE.Mesh(new THREE.PlaneGeometry(2*h.r*TILE,2*h.r*TILE).rotateX(-Math.PI/2),WEB()); me.position.set(X(h.cx),fy+.02*TILE,Z(h.cy)); me.rotation.y=h.cx*7%6.28; me.renderOrder=2; own(me); H.webs.push(h); }
      M.hz=H; }
    if(TR)for(const l of Ls)if(l.T)TR.mesh(l,quad,K.dungeonFloorCol);
    if(TR){ const E=CITY.extra||(CITY.extra={}), D=E.down||(E.down=[]); for(const l of Ls)if(l.T)for(const b of TR.cliffs(l)){ D.push(b); M.route.push(b); } }   // routes (and the monsters) go round a cliff, by the ramp
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); geo.computeVertexNormals();
    const sm=new THREE.Mesh(geo,MODS.castleStairMat); sm.receiveShadow=true; sm.castShadow=true; scene.add(LEVELS.own(sm,'dungeon'));
    for(const [,b] of WB)sol(b.x0,b.y0,b.x1,b.y1,b.z1-4); for(const b of solid)sol(...b);
    const LF=[], light=l=>{ const cm=Math.max(...l.c), Lt=new THREE.PointLight(new THREE.Color(l.c[0]/cm,l.c[1]/cm,l.c[2]/cm),30*cm*Math.min(1.2,l.r/5),l.r*TILE*2,1.4);
      Lt.position.set(X(l.x),Y(l.z)+dy,Z(l.y)); Lt.userData.i0=Lt.intensity; Lt.userData.grp=G; LITE.recs.push(Lt); M.lights.push(Lt); return Lt; };
    for(const l of K.LAMPS.slice(l0)){ const Lt=light(l); if(l.flick)LF.push(Lt); } K.LAMPS.length=l0;
    FLAME.props(made,X,z=>Y(z)+dy,Z,LF); M.fl=FLAME.src.slice(f0);
    if(LK)Ls.filter(l=>!l.c).forEach((l,i)=>LK.dress(l,{own:o=>scene.add(LEVELS.own(o,'dungeon')),light,PL,lavaR,more:i>0}));
    if(TR)for(const l of Ls)TR.dress(l,{own:o=>scene.add(LEVELS.own(o,'dungeon')),PL,sol,light});
    for(const o of scene.children.slice(s0)){ G.add(o); M.objs.push(o); }
    mine=M; cur=0; spikes(true); LITE.t=0; if(MODS.dungeon)MODS.dungeon.v=(MODS.dungeon.v||0)+1; return Ls; };   // (v: the map redraws its plan)
  let CT=null, WT=null; const can=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; f(c.getContext('2d')); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.magFilter=THREE.NearestFilter; return t; };
  const CEIL=()=>CT||(CT=can(24,24,g=>{ g.fillStyle='#1c1a19'; g.fillRect(0,0,24,24); for(let j=0;j<4;j++)for(let i=0;i<2;i++){ const v=34+((i*7+j*13)%5)*4; g.fillStyle=`rgb(${v},${v-3},${v-6})`; g.fillRect(i*12+(j&1)*6+1,j*6+1,10,4); } }),CT.wrapS=CT.wrapT=THREE.RepeatWrapping,CT);
  const WEB=()=>new THREE.MeshLambertMaterial({map:WT||(WT=can(128,128,g=>{ g.strokeStyle='rgba(225,225,215,.85)'; g.lineWidth=1.5; const c=64; for(let k=0;k<12;k++){ const a=k/12*6.283+.1*Math.sin(k*3); g.beginPath(); g.moveTo(c,c); g.lineTo(c+Math.cos(a)*62,c+Math.sin(a)*62); g.stroke(); }
    for(let r=6;r<60;r+=6.5){ g.beginPath(); for(let k=0;k<=12;k++){ const a=k/12*6.283+.1*Math.sin(k*3), q=r*(.92+.08*Math.sin(k*5+r)); k?g.lineTo(c+Math.cos(a)*q,c+Math.sin(a)*q):g.moveTo(c+Math.cos(a)*q,c+Math.sin(a)*q); } g.stroke(); } })),transparent:true,depthWrite:false,alphaTest:.05});
  const m4=new THREE.Matrix4(), q0=new THREE.Quaternion(), s3=new THREE.Vector3(), v3=new THREE.Vector3(), PER=2.4, UP=.8;
  const spikes=force=>{ '@later'; if(!mine||!mine.hz)return; const t=performance.now()/1000;
    for(const sp of mine.hz.sp){ const up=((t+sp.ph)%PER)<UP; if(!force&&up===sp.up)continue; sp.up=up; if(!up)sp.hit=false; const fy=Y(.3)+dy;
      sp.c.forEach(([x,y],k)=>{ sp.IM.setMatrixAt(sp.i0+k,m4.compose(v3.set(X(x),up?fy+.17*TILE:fy+.01*TILE,Z(y)),q0,s3.set(1,up?1:.12,1))); }); sp.IM.instanceMatrix.needsUpdate=true; } };
  const inside=(h,gx,gy)=>gx>h.x0&&gx<h.x1&&gy>h.y0&&gy<h.y1, inLava=(h,gx,gy,k=.95)=>{ const u=(gx-h.cx)/h.rx, v=(gy-h.cy)/h.ry; return Math.hypot(u,v)<k*lavaR(h,Math.atan2(v,u)); }, said={}, say=(k,m,c)=>{ const t=performance.now(); if(t-(said[k]||0)<1600)return; said[k]=t; SAY(m,c||'#ff9a6a'); };
  let lavaT=0, webT=0, webFree=0;
  SYS.add('life',dt=>{ if(!mine||!mine.hz||SHARED.LVL!=='down'){ if(SHARED.drag!==1)SHARED.drag=1; return; } const H=mine.hz, f=1+.35*(band()-1), gx=iX(pos.x), gy=iZ(pos.z), alive=!VIT.dead&&!(VIT.out>0), onG=SHARED.py-ground(pos.x,pos.z)<.2*TILE;
    spikes(false);
    for(const sp of H.sp)if(sp.up&&!sp.hit&&alive&&onG&&inside(sp,gx,gy)){ sp.hit=true; VIT.hurt(.07*f); say('sp','THE SPIKES STAB UP INTO YOUR FEET!'); }   // a trap's hurt has no side to block from
    if(alive&&onG&&VIT.burns('lava')&&H.lava.some(h=>inLava(h,gx,gy))){ if((lavaT-=dt)<=0){ lavaT=.35; VIT.hurt(.05*f); say('lava','THE LAVA BURNS YOU!','#ff6a3a'); } } else lavaT=0;
    if(webT>0){ webT-=dt; SHARED.drag=.08; if(webT<=0){ webFree=2; SHARED.drag=1; say('web','YOU TEAR YOURSELF FREE OF THE WEB.','#d8d8c8'); } }
    else{ SHARED.drag=1; if(webFree>0)webFree-=dt; else if(alive&&H.webs.some(w=>Math.hypot(gx-w.cx,gy-w.cy)<w.r*.8)){ webT=2+.3*band(); say('web','YOU ARE STUCK IN A SPIDER WEB!','#d8d8c8'); } } },'062a-dungeon');
  const S=CASTLE.stair, top={x:((S.x0+S.x1)/2-72)*TILE,z:(S.y0-.5+77)*TILE};
  const bnd=()=>({x0:X(BB.x0),x1:X(BB.x1),z0:Z(BB.y0),z1:Z(BB.y1)});
  let named=0; const enter=k=>{ if(k===cur)return; cur=k; const r=RM[k-1]; if(r&&r.nm&&named!==k){ named=k; SAY(r.nm,'#d8c8a8'); } for(const f of HK)f(k); };   // a room's monsters wake as you come into it
  const go=async(n,how)=>{ if(busy)return; busy=true; await FADE.run(n?(how==='load'?'':'ENTERING THE DUNGEON'):'LEAVING THE DUNGEON',async()=>{
    if(n){ await LOAD('dungeon'); if(MODS.dunTerr&&MODS.dunTerr.ready)await MODS.dunTerr.ready(); if(!mine)build(); const r=how==='load'?roomAt(iX(pos.x),iZ(pos.z)):null, k=r&&!r.c?r.k:how==='load'||n===1?1:pick(n), a=lay(k).atUp; if(how!=='load'||!r){ UI.goTo(a.x,a.z,'down'); SHARED.heading=a.h; } SHARED.BOUND=bnd(); cur=0; enter(k); }
    else{ clear(); UI.goTo(top.x,top.z,'up'); SHARED.heading=Math.PI; }
    PH.hd=SHARED.heading; },{hold:140}); busy=false; };
  MODS.dunDoor=(py,p)=>{ if(busy||UI.freeCam||SHARED.METRO.doorBusy()||(RAG.on))return; const m=SHARED.LVL==='down'?lotAt(p.x,p.z):0;
    if(!m){ if(mine&&!busy)clear(); if(SHARED.LVL!=='down'){ const gx=SHARED.BOD.MX(p.x), gy=SHARED.BOD.MY(p.z); if(gx>=S.x0&&gx<S.x1&&gy>=S.y0&&gy<S.y1)go(1,'top'); } return; }
    if(!mine)return go(1,'load');
    const gx=iX(p.x), gy=iZ(p.z), r=roomAt(gx,gy); if(r&&!r.c)enter(r.k); if(tread(lay(1).up,gx,gy))go(0); };
  window.DUNROOMS=()=>RM.filter(r=>!r.c).map(r=>{ const l=LC[r.k]; return {k:r.k,nm:r.nm,theme:l&&l.T?l.T.theme:null,feats:l&&l.T?l.T.F.map(f=>({h:Math.round(f.h),x:+X(f.cx).toFixed(1),z:+Z(f.cy).toFixed(1),cx:f.cx,cy:f.cy,rx:f.rx,ry:f.ry,ramp:f.ramp})):[],torches:l?l.R.torches.length:0}; });
  window.DUNRB=k=>{ const l=LC[k]; return l?{x0:l.R.x0,y0:l.R.y0,x1:l.R.x1,y1:l.R.y1}:null; }; window.DUNAT=(gx,gy)=>[X(gx),Z(gy)]; window.DUNG=(x,z)=>(ground(x,z)-dy)/Y(1);
  LEVELS.of.dungeon={name:'THE DUNGEON',amb:1.1,label:()=>'THE DUNGEON'+(cur&&RM[cur-1].nm?' — '+RM[cur-1].nm:''),floor:'down',groups:['dungeon'],has:(x,z)=>lotAt(x,z)>0,ground,bound:()=>bnd()};
  const setMap=L=>{ '@later'; const W=Array.isArray(L)&&L.length?L:MAP0; if(JSON.stringify(W)===JSON.stringify(MAP))return false;
    MAP.splice(0,MAP.length,...W.map(r=>r.slice())); RM.splice(0,RM.length,...rmOf()); Object.assign(BB,bbOf()); for(const k in LC)delete LC[k];
    if(mine){ clear(); build(); SHARED.BOUND=bnd(); const r=roomAt(iX(pos.x),iZ(pos.z)); if(!r){ const a=lay(1).atUp; UI.goTo(a.x,a.z,'down'); } cur=0; enter(r&&!r.c?r.k:1); } return true; };
  MODS.dungeon={tooHigh:(x,z,py)=>!!mine&&lotAt(x,z)>0&&ground(x,z)-py>Y(MODS.dunTerr?MODS.dunTerr.STEP:14),get B(){ return lay(cur||1).B; },get level(){ return mine?band():0; },get room(){ return cur; },traps:()=>mine?RM.flatMap(r=>lay(r.k).hz):[],lavaR,inLava,ground,inside:(x,z)=>lotAt(x,z)>0,bound:()=>bnd(),arrive:n=>lay(pick(n)).atUp,lay,rooms:RM,roomOf:(x,z)=>{ const r=roomAt(iX(x),iZ(z)); return r&&!r.c?r.k:0; },hook:f=>HK.push(f),tick(){},setMap,map:()=>MAP.map(r=>r.slice()),map0:()=>MAP0.map(r=>r.slice()),OX,OY};
  (MODS.ledges=MODS.ledges||[]).push({lv:'down',tooHigh:(x,z,py)=>MODS.dungeon.tooHigh(x,z,py)});
  window.DUNGEON=MODS.dunPlay={get level(){ return mine?band():0; },get room(){ return cur&&RM[cur-1].nm; },at:(gx,gy)=>UI.goTo(X(gx),Z(gy),'down'),to:(f,gx)=>{ const R=lay(cur||1).R; UI.goTo(X(gx??(R.x0+R.x1)/2),Z(R.y0+f*(R.y1-R.y0)),'down'); },traps:()=>MODS.dungeon.traps(),go:n=>go(Math.max(0,Math.min(NL,n|0)),'top'),spawn:async n=>{ if(n&&(!mine||band()!==n))await go(n,'top'); return MODS.skel(); },levels:NL};
  window.DUNDBG=()=>({level:mine?band():0,room:cur,hp:+VIT.hp.toFixed(3),drag:SHARED.drag,lv:SHARED.LVL,busy,lot:typeof pos!=='undefined'?lotAt(pos.x,pos.z):0,objs:mine?mine.objs.length:0,lights:mine?mine.lights.length:0,sol:mine?mine.sol.length:0,
    tris:mine?mine.objs.reduce((a,o)=>{ let t=0; o.traverse(c=>{ if(c.geometry&&c.geometry.attributes.position)t+=(c.geometry.index?c.geometry.index.count:c.geometry.attributes.position.count)/3; }); return a+t; },0):0,skel:!!(MODS.skel&&MODS.skel.p)}); }
