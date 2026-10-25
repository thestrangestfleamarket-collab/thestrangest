// THE WITCH'S GREENHOUSE KIT: the old game's page room, its pieces as catalog kinds (department greenhouse) and its preset.
import {CLOCK} from './003b-systems.js';
import {CAT_DEPTS} from './014-gamekit.js';
import {PRESETS, STOREK} from './023-west-kits.js';
const pageGreenhouse=()=>{ '@oldkits'; const PGK=STOREK.cottage.PGK;   // the page rooms' kit lives in 027's block and is published on the kit object
// =====================================================================================
// THE WITCH'S GREENHOUSE (owner, 13 Oct 2026: a picture of an overgrown stone greenhouse full of a witch's things, "make it, place them
// logically, use lighting, atmospherics"; then "same cat we alrd have, leave fish out, climb and all things are dynamic ... like the cottage
// items"). Our own room, not the picture's: the kinds of things in it, laid out our way and every pixel drawn in code (no image: the owner's
// rule), on the page rooms' kit (23-w-page-rooms-0-kit) like the Herb Cottage and the Cozy Den: every piece a catalog item (department
// Witch's Greenhouse), the two walls nearest the eye cut down to their foot, the door a way in. 12 x 10 tiles, open to the sky (a ruin:
// its tops crumbled, rubble on them), a sunroom through a carved arch on its west side.
// Part 1: the floor (dark checker tiles, mossy flagstone paths), the four stone walls (an oak band with an iron rail and studs, capstones,
// arched leaded greenhouse windows set deep in the stone (the west one a window seat: part 6), the frosted arched window, ivy with its flowers, cobwebs), the sunroom. Part 2: the raised
// platform you climb (its floors: p.stands, 30-walking), the steps, the railing, the rafters, the tower, the ivy hanging off the tops.
// Part 3 and on: the furniture and what moves. The loose things you push over are 47-physics-4-greenhouse.
// =====================================================================================
const GHI={}, GHMOVE=[];   // the catalog's pages for the later parts' pieces: name -> [price, line, materials]; what moves in them: [name, draw] (both put on in part 9)
const GHS=(()=>{ const {C,shd,mix,hh,n1,sstep,item,scene,box,ell,leafE,TX,ZS,SKY,E1}=PGK;
  const LX=12, LY=10, WH=4.3, PZ=32/ZS, DOOR={a0:6.0,a1:7.4,z1:2.9}, ARCH={a0:4.5,a1:5.9,z1:2.25}, SUN={x0:-2.4,y0:3.9,y1:6.5};
  scene('greenhouse',LX,LY,WH,[{wall:'E',...DOOR},{wall:'W',...ARCH}]);
  // the colours (taken from the owner's picture, quantized)
  const PAL={
    st:C('#6c6650'),stL:C('#8b8270'),stP:C('#a39983'),stD:C('#4e4836'),mort:C('#2a2318'),damp:C('#3e3a2a'),
    cap:C('#8a8572'),capL:C('#a8a08a'),capD:C('#5e5848'),
    oak:C('#7a5a32'),oakL:C('#9a7444'),oakD:C('#4e3820'),iron:C('#2e3236'),ironL:C('#6a7076'),
    tile:C('#6e5638'),tileD:C('#3e3020'),tileL:C('#86704c'),grout:C('#241c12'),
    flag:C('#8a8a6a'),flagD:C('#6b6d53'),flagL:C('#a8a688'),flagT:C('#9a8a6a'),
    moss:C('#5e7a3a'),mossL:C('#86a050'),mossD:C('#3a5228'),
    ivy:C('#2f6a30'),ivyL:C('#4a8a40'),ivyLL:C('#6aa858'),ivyD:C('#1c4e20'),ivyDD:C('#0f2a12'),
    fl:C('#f0d8d0'),flD:C('#d8a8a0'),flC:C('#e8c060'),
    frame:C('#3a2c1c'),frameL:C('#5a4430'),lead:C('#2a241a'),glint:C('#e8f0e0'),tint:C('#b8c8b0'),frost:C('#c8ccc4'),frostD:C('#9aa09a'),
    web:C('#d8d4c8'),leafF:C('#8a6a2a'),leafF2:C('#a07a30'),pebble:C('#2a2620'),
    sunW:C('#d8b070'),sunWL:C('#f0d090'),sunG:C('#ffe0a0'),
  };
  // ---- the stone: courses 7 art px high, blocks of three lengths staggered row to row; mortar; each block its own shade, a light top edge, a
  // darker foot; worn pale patches; darker and damp low down, moss at the foot and on some blocks' tops; chips
  const stoneAt=(ap,zp,sd,out)=>{ const row=Math.floor(zp/7), L=13+(row%3)*4, off=hh(row,0,sd)*31, bi=Math.floor((ap+off)/L), bu=(ap+off)-bi*L, bv=zp-row*7;
    if(bu<1||bv<1)return shd(PAL.mort,0.9+0.2*hh(Math.floor(ap),row,sd+1));
    const pale=n1(ap/40+sd,sd)*n1(zp/30+3,sd+2), pk=hh(bi,row,sd+3);
    let c=pk<0.12?PAL.stD:pale>0.42&&pk>0.3?(pk>0.75?PAL.stP:PAL.stL):PAL.st, k=0.88+0.2*hh(bi,row,sd+4);
    if(bv>5.6)k*=1.12; else if(bv<2.2)k*=0.86; if(bu<2)k*=1.06; if(bu>L-1.5)k*=0.9;
    if(hh(Math.floor(ap*2),Math.floor(zp*2),sd+5)<0.03)k*=0.8;                           // pits in the stone
    if(hh(bi,row,sd+6)<0.08&&bu>L*0.3&&bu<L*0.6&&bv>3)k*=0.82;                           // a chip out of a block
    c=shd(c,k*(out?0.86:1));
    const low=sstep(30,0,zp); if(low>0)c=mix(c,PAL.damp,low*0.45);
    if(zp<6+8*n1(ap/9,sd+7)&&hh(Math.floor(ap),Math.floor(zp),sd+8)<0.7)return shd(hh(Math.floor(ap/2),Math.floor(zp/2),sd+9)<0.4?PAL.mossL:PAL.moss,0.9+0.15*hh(Math.floor(ap),Math.floor(zp),3));   // moss at the foot
    if(bv>5.4&&hh(bi,row,sd+10)<0.18&&hh(Math.floor(ap),0,sd+11)<0.6)return shd(PAL.moss,1.05);   // moss along a block's top
    return c; };
  // ---- ivy painted on a wall: masses of heart-shaped leaves on a 5 px grid (each leaf jittered, four greens, lit on its upper side, dark
  // between), ragged at the edges; now and then a pale five-petalled flower with a yellow eye. m: [a0, a1, z bottom, z top] in tiles and
  // page units, the bottom edge hanging in tongues
  const ivyAt=(masses,a,z,sd)=>{ const ap=a*TX, zp=z*ZS;
    for(const [a0,a1,zb,zt] of masses){ if(a<a0-0.3||a>a1+0.3||z>zt+0.2)continue; const t=(a-a0)/((a1-a0)||1), tongue=zb+0.6*Math.max(0,Math.sin(t*9+sd))*n1(a*3,sd)+0.25*n1(a*7,sd+1);
      const edge=Math.min(a-a0,a1-a,(z-tongue)*1.4,zt-z)+0.18*(n1(ap/6,sd+2)-0.5)+0.12*(n1(zp/6,sd+3)-0.5); if(edge<0)continue;
      const ci=Math.floor(ap/5), cj=Math.floor(zp/5); let best=null, bd=9;
      for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){ const i=ci+di, j=cj+dj, cx=i*5+2.5+(hh(i,j,sd+4)-0.5)*3, cz=j*5+2.5+(hh(i,j,sd+5)-0.5)*3, dx=ap-cx, dz=zp-cz, r=2.4+hh(i,j,sd+6)*0.9;
        const hz=dz+Math.abs(dx)*0.45, d=Math.hypot(dx,hz)/r; if(d<1&&!(dz>r*0.55&&Math.abs(dx)<0.6)&&d<bd){ bd=d; best=[i,j,dx,dz]; } }   // (a heart: its notch at the top)
      if(!best)return edge>0.25?PAL.ivyDD:null;
      const [i,j,dx,dz]=best, f=hh(i,j,sd+7);
      if(f<0.035&&zp>8){ const r=Math.hypot(dx,dz), an=Math.atan2(dz,dx); if(r<0.9)return PAL.flC; if(r<2.4+0.5*Math.cos(an*5))return r>1.9?PAL.flD:PAL.fl; }   // a flower
      let c=f<0.25?PAL.ivyD:f<0.55?PAL.ivy:f<0.85?PAL.ivyL:PAL.ivyLL; if(bd>0.78)c=PAL.ivyDD; else if(dx<-0.6&&dz>0)c=shd(c,1.18); else if(Math.abs(dx)<0.35&&bd<0.6)c=shd(c,1.2);   // its rim, its lit side, its vein
      return c; }
    return null; };
  // ---- cobwebs in a corner: threads out from the corner and rings across them, thin, pale; d: how far from the corner along the wall, h: down
  // from the top of the web (both art px), R its size
  const webAt=(d,h,R)=>{ const r=Math.hypot(d,h); if(r>R||d<0||h<0)return false; const an=Math.atan2(h,d)/(Math.PI/2);
    if(Math.abs(an*6-Math.round(an*6))*r*Math.PI/12<0.32)return true;                   // the spokes
    const ring=r/R*5, rr=ring-Math.floor(ring); return rr<0.09+0.05*Math.sin(an*12)&&r>2; };   // the rings, sagging between spokes
  // ---- the walls: stone inside and out; the band (an iron rail with round studs, the oak beam) and the capstones; the top crumbled in steps
  // (its height along the wall: topAt); the openings and the ivy each wall has (feat: (a, z, outside) -> a colour, -1 a hole, or undefined)
  const WALLS={}, topAt=(a,sd)=>{ const s=Math.floor(a/0.9), k=hh(s,0,sd); return WH-(k<0.45?0:k<0.75?0.24:k<0.92?0.48:0.75); };
  function wallPaint(id,inF,along,sd,feat,ivy,webs){
    return (f,u,v,W,H,x,y,z)=>{ const a=along(x,y), top=topAt(a,sd), out=f!==inF&&f!=='T';
      if(f==='T')return top<WH-0.01?-1:shd(PAL.cap,(v<1.2?1.15:v>H-1.2?0.82:1)*(0.94+0.1*hh(Math.floor((u+v)/12),0,sd)));
      if(z>top)return -1; const ap=a*TX, zp=z*ZS;
      if(z>top-0.07)return shd(PAL.capL,0.95+0.1*hh(Math.floor(ap/4),0,sd));             // the capstones' top edge, where it's broken down
      if(feat&&(f===inF||out)){ const o=feat(a,z,out); if(o!==undefined)return o; }
      if(f===inF){ if(ivy){ const c=ivyAt(ivy,a,z,sd); if(c)return c; }
        if(webs)for(const [wa,dir,wz,R] of webs){ const d=(a-wa)*dir*TX, hz=(wz-z)*ZS; if(webAt(d,hz,R))return PAL.web; } }
      if(z>WH-0.62){ const b=Math.floor((ap+(z>WH-0.3?12:0))/24), bu=(ap+(z>WH-0.3?12:0))-b*24, bz=zp-(WH-0.62)*ZS;   // the capstones: big pale blocks in two rows
        if(bu<1||Math.abs(bz-8.5)<0.6)return PAL.capD; return shd(hh(b,z>WH-0.3?1:0,sd)<0.3?PAL.capL:PAL.cap,(bz>15.5||Math.abs(bz-7.7)<0.8?1.12:1)*(0.92+0.1*hh(b,Math.floor(zp),sd))*(out?0.88:1)); }
      if(z>WH-0.92){ const bz=zp-(WH-0.92)*ZS, g=0.92+0.1*hh(Math.floor(ap/30),Math.floor(bz),sd)+0.04*Math.sin(ap*0.4+bz);   // the oak beam
        if(bz>7.2)return shd(PAL.oakL,1.05); if(bz<1)return PAL.oakD; return shd(PAL.oak,g*(Math.floor(ap/48)%2?1:0.94)*(out?0.88:1)); }
      if(z>WH-1.02){ const bz=zp-(WH-1.02)*ZS, s=((ap%18)+18)%18;                       // the iron rail and its studs
        if(Math.hypot(s-9,bz-1.4)<1.4)return Math.hypot(s-8.5,bz-1.9)<0.6?PAL.ironL:shd(PAL.iron,1.3); return shd(PAL.iron,bz>1.8?1.2:0.9); }
      return stoneAt(ap,zp,sd,out); }; }
  // ---- the windows. A leaded greenhouse window: a dark timber frame, mullions and a transom, small panes of lead; the glass is the world
  // outside (a hole), here and there a pane tinted or catching the light. sh: 'flat' | 'gable' (a pointed top) | 'arch' (a round top); set deep in the wall (its stone reveal round it)
  const winAt=(w,a,z,out)=>{ const mid=(w.a0+w.a1)/2, hw=(w.a1-w.a0)/2; let lim=hw;
    if(w.sh==='gable'&&z>w.zs)lim=hw*(1-(z-w.zs)/(w.z1-w.zs)); if(w.sh==='arch'&&z>w.zs){ const t=(z-w.zs)/(w.z1-w.zs); lim=t>=1?-1:hw*Math.sqrt(1-t*t); }
    const dx=Math.abs(a-mid), fr=0.07, rv=out?0:0.11; if(z<w.z0-fr-rv*1.6||z>w.z1+fr+rv*0.6||dx>lim+fr+rv)return undefined;
    if(dx>lim+fr||z<w.z0-fr||z>w.z1+fr){ const sill=z<w.z0-fr;   // set deep in the wall: its stone sides and sill, one side lit, one in shade, the sill's lip catching the light
      return shd(sill?PAL.capL:PAL.stL,sill?(z>w.z0-fr-0.05?1.18:0.92):(a<mid?1.08:0.7)); }
    if(z<w.z0||dx>lim-0.02||(w.sh!=='flat'&&z>w.zs&&dx>lim-0.06)){ const sill=z<w.z0; return shd(sill?PAL.frameL:PAL.frame,out?0.8:(z<w.z0-0.03?1.15:1)); }   // the frame and its sill
    const ap=(a-w.a0)*TX, zp=(z-w.z0)*ZS;
    for(const m of w.mull||[])if(Math.abs(a-m)<0.035)return PAL.frame; for(const t of w.tran||[])if(Math.abs(z-t)<0.05)return shd(PAL.frame,1.1);
    if(w.sh==='gable'&&z>w.zs){ if(Math.abs(dx-lim*0.5)<0.03)return PAL.frame;            // the gable's timbers, and a swirl in its glass
      const sx=(a-mid)*TX, sz=(z-w.zs)*ZS-6, r=Math.hypot(sx,sz), an=Math.atan2(sz,sx); if(r<9&&Math.abs((r-an*1.4+20)%5-2.5)<0.7)return out?PAL.lead:mix(C('#c8a0c8'),PAL.tint,0.4); }
    const pw=w.frost?7:5, ph=w.frost?9:7; if(((ap%pw)+pw)%pw<0.6||((zp%ph)+ph)%ph<0.6)return PAL.lead;   // the lead between the panes
    const pi=Math.floor(ap/pw), pj=Math.floor(zp/ph), q=hh(pi,pj,w.sd||3);
    if(w.frost){ const st=Math.sin((ap+zp*0.7)*0.5+pi); return shd(st>0.6?PAL.frost:PAL.frostD,out?0.8:0.95+0.1*q); }   // frosted: streaked grey-white, you don't see through
    if(w.warm)return E1|shd(q<0.3?PAL.sunWL:PAL.sunW,0.9+0.15*hh(Math.floor(ap),Math.floor(zp),5));   // the sunroom's: sun on the glass, lit
    if(q<0.12)return mix(PAL.tint,PAL.glint,0.3); if(q<0.2)return SKY|0;                  // a pane tinted, a pane catching the light
    const s=(ap-zp)*0.12; if(!out&&Math.abs(s-Math.round(s))<0.04&&q>0.7)return PAL.glint;   // a streak across one
    return SKY|0; };
  // what each wall has: the windows (in tiles along it, page units up), the ivy, the cobwebs ([where along, which way, top, size px])
  const WIN={
    W:[{a0:7.45,a1:9.05,z0:0.5,zs:2.75,z1:3.55,sh:'arch',mull:[8.25],tran:[1.95],sd:5},{a0:1.4,a1:3.4,z0:PZ+0.3,zs:2.95,z1:3.62,sh:'arch',mull:[2.4],tran:[2.4],sd:6}],
    N:[{a0:0.5,a1:3.3,z0:PZ+0.3,zs:2.6,z1:3.62,sh:'arch',mull:[1.2,1.9,2.6],tran:[2.3],sd:7},{a0:3.6,a1:6.4,z0:PZ+0.3,zs:2.6,z1:3.62,sh:'arch',mull:[4.3,5.0,5.7],tran:[2.3],sd:8},
       {a0:10.0,a1:11.4,z0:0.5,zs:2.9,z1:3.6,sh:'arch',mull:[10.7],frost:1,sd:9}],
    E:[{a0:1.6,a1:3.6,z0:0.9,zs:2.75,z1:3.62,sh:'arch',mull:[2.6],tran:[2.2],sd:10}],
    S:[{a0:1.6,a1:4.2,z0:0.9,zs:2.55,z1:3.62,sh:'arch',mull:[2.47,3.33],tran:[2.1],sd:11},{a0:7.2,a1:9.8,z0:0.9,zs:2.55,z1:3.62,sh:'arch',mull:[8.07,8.93],tran:[2.1],sd:12}]};
  const feats=(id,arch)=>(a,z,out)=>{ for(const w of WIN[id]){ const c=winAt(w,a,z,out); if(c!==undefined)return c; }
    if(id==='E'&&a>DOOR.a0-0.14&&a<DOOR.a1+0.14&&z<DOOR.z1+0.16){ if(z>DOOR.z1)return shd(PAL.capL,z>DOOR.z1+0.12?1.12:0.95);   // the doorway: an oak frame, a stone lintel
      return shd(PAL.frame,(a<DOOR.a0-0.1||a>DOOR.a1+0.1)?0.8:1.15); }
    if(arch){ const mid=(ARCH.a0+ARCH.a1)/2, hw=(ARCH.a1-ARCH.a0)/2, t=(z-ARCH.z1)/hw, dx=Math.abs(a-mid);   // the arch's round head: open; its voussoirs round it
      if(z>ARCH.z1&&t<1&&dx<hw*Math.sqrt(1-t*t))return -1;
      if(z>ARCH.z1-0.05&&t<1.25&&dx<hw*1.25*Math.sqrt(Math.max(0,1-(t/1.25)**2))){ const an=Math.atan2(z-ARCH.z1,a-mid), vb=Math.floor(an/Math.PI*9); return shd(vb%2?PAL.capL:PAL.cap,Math.abs(an*9/Math.PI-vb-0.5)>0.42?0.7:1); } }
    return undefined; };
  const IVY={W:[[0,1.3,2.2,4.3],[3.3,4.6,2.6,4.3],[9.4,10,1.0,4.3]],N:[[0,0.6,1.6,4.3],[2.6,4.0,3.2,4.3],[6.3,7.4,1.8,4.3],[9.5,12,2.8,4.3]],E:[[0,1.4,2.2,4.3],[6.5,8.0,3.1,4.3]],S:[[10.6,12,2.5,4.3]]};
  const WEBS={W:[[0,1,4.05,26]],N:[[0,1,4.05,22],[7.4,-1,3.7,26],[12,-1,4.0,30]],E:[[0,1,3.9,28]],S:[]};
  const wW=wallPaint('W','E',(x,y)=>y,13,feats('W',1),IVY.W,WEBS.W), wN=wallPaint('N','S',(x,y)=>x,29,feats('N'),IVY.N,WEBS.N),
    wE=wallPaint('E','W',(x,y)=>y,41,feats('E'),IVY.E,WEBS.E), wS=wallPaint('S','N',(x,y)=>x,53,feats('S'),IVY.S,WEBS.S);
  const none=()=>-1;   // an invisible box: it only stops the sun (sh)

  // ======================= THE FLOOR =======================
  item('greenhouse floor',{floor:1});
  // dark checker tiles (12 art px), grout, chipped corners; over them paths of round stepping stones (pale, a dark rim, moss on some), where
  // the feet go: from the door to the cauldron, to the arch, to the steps, to the window seat, round the tower; leaves and pebbles scattered
  const path=(x,y)=>{ const seg=(ax,ay,bx,by,w)=>{ const dx=bx-ax, dy=by-ay, t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy))); return w-Math.hypot(x-ax-t*dx,y-ay-t*dy); };
    return Math.max(seg(12.4,6.7,8.6,6.5,0.75),seg(8.6,6.5,5.6,6.3,0.7),seg(5.6,6.3,0.5,5.2,0.6),seg(4.2,5.6,1.0,3.9,0.55),seg(0.4,6.5,1.4,9.6,1.15),seg(5.6,6.3,9.0,2.6,0.55),seg(9.0,2.6,11.6,3.2,0.75),seg(0.6,1.5,7.2,2.6,0.0),
      seg(2.2,8.6,4.8,7.9,0.4))+0.18*(n1(x*2.3,7)-0.5)+0.18*(n1(y*2.1,8)-0.5); };
  const flagAt=(x,y)=>{ const g=0.36, ci=Math.floor(x/g), cj=Math.floor(y/g); let b1=9,b2=9,id=0;
    for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){ const i=ci+di,j=cj+dj, px=(i+0.5+(hh(i,j,21)-0.5)*0.7)*g, py=(j+0.5+(hh(i,j,22)-0.5)*0.7)*g, d=Math.hypot(x-px,y-py);
      if(d<b1){ b2=b1; b1=d; id=i*977+j; } else if(d<b2)b2=d; }
    return [b2-b1,id]; };
  box(0,0,-0.45,LX,LY,0,(f,u,v,W,H,x,y)=>{
    if(f!=='T')return shd(PAL.stD,0.7+0.1*hh(u>>2,v,1));
    const pth=path(x,y), xi=Math.floor(x*TX), yi=Math.floor(y*TX);
    if(hh(xi>>1,yi>>1,31)<0.004)return PAL.pebble;                                     // pebbles
    if(hh(xi>>2,yi>>2,32)<0.006){ const k=hh(xi,yi,33); return k<0.5?PAL.leafF:k<0.8?PAL.leafF2:PAL.ivyL; }   // fallen leaves
    const tu=x*TX/12, tv=y*TX/12, ti=Math.floor(tu), tj=Math.floor(tv), fu=(tu-ti)*12, fv=(tv-tj)*12;
    if(pth>-0.15){ const g=0.42, ci=Math.floor(x/g), cj=Math.floor(y/g);   // stepping stones over the tiles: rounded, pale, a dark rim, moss on a few
      for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){ const i=ci+di, j=cj+dj, px=(i+0.5+(hh(i,j,21)-0.5)*0.45)*g, py=(j+0.5+(hh(i,j,22)-0.5)*0.45)*g;
        if(path(px,py)<0.05||hh(i,j,23)<0.12)continue; const rx=g*(0.36+0.1*hh(i,j,24)), ry=g*(0.3+0.1*hh(i,j,25)), a=hh(i,j,26)*3, dx=x-px, dy=y-py, lx=dx*Math.cos(a)+dy*Math.sin(a), ly=-dx*Math.sin(a)+dy*Math.cos(a);
        const d=Math.hypot(lx/rx,ly/ry)+0.08*(n1(Math.atan2(ly,lx)*3+i,j)-0.5); if(d>1)continue;
        const id=i*977+j, k=hh(id,0,36); let c=k<0.3?PAL.flagD:k<0.6?PAL.flag:k<0.85?PAL.flagT:PAL.flagL;
        if(d>0.9)return shd(PAL.stD,0.7); let sh=0.92+0.1*hh(xi>>1,yi>>1,37); if(lx<-rx*0.3&&ly<0)sh*=1.1; if(d>0.78)sh*=0.85;
        if(hh(id,1,38)<0.3&&d>0.55&&hh(xi,yi,39)<0.5)c=mix(c,PAL.moss,0.65);
        return shd(c,sh); } }
    if(fu<0.8||fv<0.8)return shd(PAL.grout,0.9+0.2*hh(xi,yi,40));
    const dk=(ti+tj)&1; let c=dk?PAL.tileD:PAL.tile, s=0.92+0.12*hh(ti,tj,41);
    if(fu<2||fv<2)s*=1.1; if(fu>10.6||fv>10.6)s*=0.85;
    if(hh(ti,tj,42)<0.15&&fu+fv<5)return PAL.grout;                                    // a chipped corner
    if(hh(xi,yi,43)<0.02)s*=0.8; c=shd(c,s);
    if(pth>-0.1&&hh(xi>>1,yi>>1,44)<0.18)c=mix(c,PAL.mossD,0.5);                       // moss in the grout by the paths
    return c; },{floor:1,occ:0});

  // ======================= THE WALLS =======================
  item('greenhouse wall, west');
  box(-0.3,-0.3,-0.45,0,LY,WH,wW,{wallOf:'W',occ:1});
  box(-0.3,0,0,0,ARCH.a0,WH,none,{sh:1}); box(-0.3,ARCH.a1,0,0,LY,WH,none,{sh:1});
  item('greenhouse wall, north');
  box(-0.3,-0.3,-0.45,LX+0.3,0,WH,wN,{wallOf:'N',occ:1});
  box(6.4,-0.3,0,10.0,0,WH,none,{sh:1}); box(11.4,-0.3,0,LX+0.3,0,WH,none,{sh:1});
  item('greenhouse wall, east');
  box(LX,-0.3,-0.45,LX+0.3,LY+0.3,WH,wE,{wallOf:'E',occ:1});
  box(LX,3.6,0,LX+0.3,DOOR.a0,WH,none,{sh:1}); box(LX,DOOR.a1,0,LX+0.3,LY,WH,none,{sh:1}); box(LX,DOOR.a0,DOOR.z1,LX+0.3,DOOR.a1,WH,none,{sh:1});
  item('greenhouse wall, south');
  box(-0.3,LY,-0.45,LX+0.3,LY+0.3,WH,wS,{wallOf:'S',occ:1});
  box(4.2,LY,0,7.2,LY+0.3,WH,none,{sh:1}); box(9.8,LY,0,LX+0.3,LY+0.3,WH,none,{sh:1});

  // ======================= THE SUNROOM, THROUGH THE ARCH =======================
  // a little stone room west of the arch: warm sun through its own small panes, a picture of a rabbit, a stone step up to it, its floor of slabs
  item('greenhouse sunroom');
  { const x0=SUN.x0, y0=SUN.y0, y1=SUN.y1, h=WH-0.4;
    const sw=(id,along,sd,wins)=>(f,u,v,W,H,x,y,z)=>{ if(f==='T')return shd(PAL.cap,0.95); if(z>h-0.1)return shd(PAL.oakL,1.05); const a=along(x,y);
      for(const w of wins){ const c=winAt(w,a,z,false); if(c!==undefined)return c; }
      return mix(stoneAt(a*TX,z*ZS,sd,false),PAL.sunW,0.18); };
    box(x0-0.3,y0,-0.45,0,y1,0,(f,u,v,W,H,x,y)=>{ if(f!=='T')return PAL.stD; const [gap,id]=flagAt(x*1.3,y*1.3); if(gap*TX<0.8)return PAL.mossD;
      return E1|shd(hh(id,0,51)<0.5?PAL.flagT:PAL.flagL,0.8+0.12*hh(id,1,52)+0.15*sstep(x0,0,x)); },{floor:1,occ:0});
    box(x0-0.3,y0-0.3,0,x0,y1+0.3,h,sw('W',(x,y)=>y,61,[{a0:y0+0.4,a1:y1-0.4,z0:0.6,zs:2.6,z1:3.2,sh:'arch',mull:[(y0+y1)/2],warm:1,sd:13}]),{wallOf:'W',occ:1});
    box(x0,y0-0.3,0,0,y0,h,sw('N',(x,y)=>x,62,[{a0:x0+0.5,a1:-0.5,z0:0.7,zs:2.3,z1:2.95,sh:'arch',mull:[x0+1.2],warm:1,sd:14}]),{wallOf:'N',occ:1});
    box(x0,y1,0,0,y1+0.3,h,sw('S',(x,y)=>x,63,[]),{wallOf:'S',occ:1});
    box(x0-0.3,y0-0.3,h,0,y1+0.3,h+0.08,PAL.oakD,{wall:'N'});                            // its lintel beams, a roof of light
    // the rabbit picture on its south wall, facing in: a white rabbit sitting in a meadow, in a thin gold frame
    box(x0+0.7,y1-0.05,1.2,x0+1.5,y1,2.1,(f,u,v,W,H)=>{ if(f!=='N')return PAL.frame; if(u<1.2||v<1.2||u>W-1.2||v>H-1.2)return C('#b89040');
      const a=u/W, b=v/H; if(Math.hypot((a-0.5)*1.3,b-0.55)<0.18||Math.hypot(a-0.5,b-0.36)<0.1||Math.abs(a-0.46)<0.03&&b>0.12&&b<0.3||Math.abs(a-0.55)<0.03&&b>0.14&&b<0.3)return C('#f4f0e8');
      if(b>0.7)return hh(Math.floor(u),Math.floor(v),3)<0.2?C('#e8b0c8'):C('#7aa858'); return b<0.3?C('#a8c8e0'):C('#c8dcc0'); },{wall:'S'});
    box(-0.25,ARCH.a0+0.05,0,0.05,ARCH.a1-0.05,0.12,(f,u,v,W,H)=>f==='T'?shd(PAL.flagL,0.95+0.1*hh(u>>2,v>>2,3)):shd(PAL.stD,1.1),{small:1});   // the step through the arch
    box(x0,y0,0,0,y1,h,none,{sh:0}); }

  return {PAL,LX,LY,WH,PZ,DOOR,ARCH,SUN,stoneAt,ivyAt,webAt,flagAt,winAt,topAt,IVY}; })();

// =====================================================================================
// THE WITCH'S GREENHOUSE, part 2 (see part 1): the raised stone platform along the north wall that you climb (its top a floor you stand on:
// p.stands, 30-walking; its steps three treads up from the floor at its west end), its turned-post railing with a cobweb in it, the shelves of
// crockery against its front, the rafters across the open top (what hangs is hung from them: the firefly bottles, the baskets, 47-physics-4),
// the stone tower in the north-east with ivy all over it, the rubble on the wall tops, the ivy hanging down off them.
// =====================================================================================
(()=>{ const {C,shd,mix,hh,n1,sstep,seed,rr,item,box,cyl,ell,leafE,wood,bookLying,TX,ZS}=PGK, {PAL,LX,LY,WH,PZ,stoneAt,ivyAt,flagAt,topAt,IVY}=GHS;
  const PX=6.6, PY=2.2, SX0=0.15, SX1=1.5, TR=0.35;                                // the platform's east end and front; the steps' width and tread
  // big blocks for the platform's faces: courses 9 px, moss in the joints, the top course's lip worn
  const blockFace=(sd)=>(f,u,v,W,H,x,y,z)=>{ const a=f==='E'||f==='W'?y:x, ap=a*TX, zp=z*ZS, top=PZ*ZS;
    if(f==='T'){ const [gap,id]=flagAt(x*0.8+3,y*0.8), e=gap*TX*1.25; if(e<0.8)return hh(Math.floor(x*TX),Math.floor(y*TX),3)<0.6?PAL.moss:PAL.mossD;
      let c=hh(id,0,4)<0.4?PAL.flagD:hh(id,0,4)<0.8?PAL.flag:PAL.flagL; if(hh(Math.floor(x*TX)>>2,Math.floor(y*TX)>>2,5)<0.008)c=PAL.leafF; return shd(c,0.9+0.12*hh(id,1,6)*(e<1.8?0.85:1)); }
    if(zp>top-2.5)return shd(PAL.capL,zp>top-1?1.1:0.92);                                // the lip
    const row=Math.floor(zp/9), L=20+(row%2)*6, off=hh(row,0,sd)*30, bi=Math.floor((ap+off)/L), bu=ap+off-bi*L, bv=zp-row*9;
    if(bu<1||bv<1)return hh(Math.floor(ap),Math.floor(zp),sd)<0.5?PAL.mossD:PAL.mort;
    let k=0.86+0.2*hh(bi,row,sd+1); if(bv>7.5)k*=1.12; if(bv<2)k*=0.85; if(hh(Math.floor(ap*2),Math.floor(zp*2),sd+2)<0.03)k*=0.8;
    return shd(hh(bi,row,sd+3)<0.2?PAL.stL:PAL.st,k); };

  item('stone platform',{stands:[[0,0,PX,PY,32]]});
  box(0,0,0,PX,PY,PZ,blockFace(71),{sh:1});
  item('stone steps to the platform',{stands:[[SX0,3.6-TR,SX1,3.6,8],[SX0,3.6-2*TR,SX1,3.6-TR,16],[SX0,3.6-3*TR,SX1,3.6-2*TR,24],[SX0,PY,SX1,3.6-3*TR,32]]});
  for(let k=0;k<4;k++){ const y1=3.6-k*TR, y0=k===3?PY:y1-TR, zt=(k+1)*8/ZS;
    box(SX0,y0,0,SX1,y1,zt,(f,u,v,W,H,x,y,z)=>{ if(f==='T'){ let c=shd(PAL.flagT,(v>H-1.5?1.18:1)*(0.9+0.12*hh(u>>2,k,7))); if(v>H-2.5&&hh(Math.floor(u),k,8)<0.3)c=PAL.moss; if(u<2&&hh(Math.floor(v),k,9)<0.5)c=PAL.mossD; return c; }   // worn in the middle, moss at the ends
      return shd(stoneAt((f==='S'?x:y)*TX,z*ZS,81+k,false),f==='S'&&v<1.2?1.15:1); }); }

  item('platform railing',{walk:1});
  // dark turned posts on a bottom rail, a handrail along the front (the steps' end left open) and the east end; a cobweb between two posts
  { const dk=C('#392b23'), dkL=C('#554c41'), dkD=C('#1e1610'), z0=PZ, z1=PZ+0.95, Wd=wood(dk,{seed:91,along:'u',lite:1.25});
    const rail=(x0,y0,x1,y1)=>{ box(x0,y0,z1-0.08,x1,y1,z1,(f,u,v,W,H)=>f==='T'?shd(dkL,(v<1||u<1)?1.25:1):shd(dk,v<1?1.3:v>H-1?0.75:1)); box(x0,y0,z0,x1,y1,z0+0.08,Wd); };
    rail(SX1,PY-0.14,PX,PY); rail(PX-0.14,0,PX,PY-0.14);
    const post=(x,y)=>{ cyl(x,y,0.045,z0+0.08,z0+0.22,dk,{small:1},0.035); ell(x,y,z0+0.42,0.055,0.055,0.2,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>shd(dk,(lx<-0.3?1.35:lx>0.5?0.7:1)*(Math.abs(lz)>0.8?0.8:1)),{small:1});
      cyl(x,y,0.03,z0+0.62,z1-0.08,(f,u,v,W,H)=>shd(dk,(u%W)/W<0.3?1.3:0.9),{small:1},0.04); };
    for(let x=SX1+0.12;x<PX-0.1;x+=0.22)post(x,PY-0.07); for(let y=0.15;y<PY-0.15;y+=0.22)post(PX-0.07,y);
    box(3.05,PY-0.08,z0+0.1,3.5,PY-0.06,z1-0.1,(f,u,v,W,H)=>{ const d=Math.hypot(u-W*0.15,v-H*0.2), an=Math.atan2(v-H*0.2,u-W*0.15); if(Math.abs(Math.sin(an*5))<0.08&&d<W*0.8)return PAL.web; return Math.abs((d%5)-2.5)<0.25&&d<W*0.8?PAL.web:-1; },{small:1});   // a cobweb
    box(PX-0.1,0,z0,PX,PY,z0+0.02,dkD,{small:1}); }

  item('crockery shelves under the platform');
  // open dark shelves against the platform's front: a blue-and-white jug, an orange owl jar, a grey stoneware crock, a jar of amber beads, flat books
  // in green and red, a bowl of blueberries, a little terracotta window box with a pink flower
  { const x0=3.0,x1=5.7,y0=PY,y1=PY+0.42, dk=C('#2d2311'), dkL=C('#4f442e'), Wd=wood(dkL,{seed:93,along:'u'});
    box(x0,y0,0,x0+0.06,y1,PZ*0.95,Wd); box(x1-0.06,y0,0,x1,y1,PZ*0.95,Wd); box(x0,y0,0,x1,y0+0.04,PZ*0.95,dk);
    for(const z of [0.06,0.52,PZ*0.95-0.05])box(x0,y0,z-0.05,x1,y1,z,(f,u,v,W,H)=>f==='T'?shd(dkL,0.92+0.1*hh(u>>2,v,3)):shd(dkL,v<1?1.25:0.9));
    // bottom shelf: books lying, the blueberries, the window box
    bookLying(x0+0.12,y0+0.06,0.06,x0+0.62,y1-0.06,0.07,C('#3a6a3a'),{spine:'S'}); bookLying(x0+0.16,y0+0.08,0.13,x0+0.6,y1-0.08,0.06,C('#8a2a28'),{spine:'S'}); bookLying(x0+0.14,y0+0.07,0.19,x0+0.58,y1-0.07,0.07,C('#2f5a3a'),{spine:'S'});
    cyl(x0+1.15,y0+0.2,0.17,0.06,0.15,(f,u,v,W,H)=>f==='T'?C('#3a2a1c'):shd(C('#b8a888'),v<1?1.2:1),{small:1},0.12);
    seed(95); for(let i=0;i<12;i++){ const a=rr(0,6.28), d=rr(0,0.12); ell(x0+1.15+Math.cos(a)*d,y0+0.2+Math.sin(a)*d*0.7,0.17,0.03,0.03,0.028,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>lz>0.4&&lx<0?C('#8ab0e0'):C('#2a3a78'),{small:1}); }
    leafE(x0+1.0,y0+0.24,0.19,0.06,0.03,0.012,PAL.ivyL); leafE(x0+1.28,y0+0.14,0.19,0.05,0.03,0.012,PAL.ivy);
    box(x0+1.6,y0+0.06,0.06,x1-0.4,y1-0.04,0.2,(f,u,v,W,H)=>f==='T'?C('#3a2a1c'):shd(C('#b05a3a'),(v<1.5?1.15:1)*(0.95+0.08*hh(u>>1,v,4))),{small:1});
    for(const [dx,c] of [[0.1,C('#e870a0')],[0.25,C('#f0a0c0')],[0.4,C('#e870a0')]]){ cyl(x0+1.6+dx,y0+0.22,0.008,0.2,0.32,PAL.ivyD,{small:1}); ell(x0+1.6+dx,y0+0.22,0.34,0.04,0.04,0.03,c,{small:1}); leafE(x0+1.62+dx,y0+0.2,0.24,0.04,0.025,0.01,PAL.ivyL); }
    // top shelf: the jug, the owl jar, the crock, the amber jar
    { const z=0.52; cyl(x0+0.3,y0+0.2,0.1,z,z+0.22,(f,u,v,W,H)=>f==='T'?C('#20304a'):((Math.floor(u/3)+Math.floor(v/3))%2&&v>3&&v<H-2?C('#3a68b0'):shd(C('#e8ecf0'),(u%W)/W<0.3?1.08:0.95)),{small:1},0.07);
      box(x0+0.38,y0+0.18,z+0.08,x0+0.44,y0+0.22,z+0.2,C('#e8ecf0'),{small:1});
      ell(x0+0.75,y0+0.2,z+0.13,0.11,0.1,0.13,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ if(lz>0.3&&ly>0.3&&Math.abs(lx)>0.12&&Math.abs(lx)<0.45&&Math.hypot(Math.abs(lx)-0.28,lz-0.48)<0.13)return Math.hypot(Math.abs(lx)-0.28,lz-0.48)<0.06?C('#2a1a10'):C('#f0e0b0');   // the owl's eyes
        if(Math.abs(lz-0.1)<0.06)return C('#a8521c'); return shd(C('#d8782a'),(lx<-0.3?1.2:1)*(lz>0.7?1.1:1)*((Math.floor(lz*12)%2)?1:0.94)); },{small:1});
      cyl(x0+0.75,y0+0.2,0.05,z+0.25,z+0.29,C('#a8521c'),{small:1});
      cyl(x0+1.25,y0+0.2,0.16,z,z+0.2,(f,u,v,W,H)=>f==='T'?C('#5a5a54'):shd(C('#a8a698'),(Math.floor(v/2)%2?1:0.9)*((u%W)/W<0.25?1.12:1)),{small:1},0.14);
      ell(x0+1.25,y0+0.2,z+0.21,0.1,0.1,0.04,C('#8a8a80'),{small:1}); ell(x0+1.25,y0+0.2,z+0.26,0.025,0.025,0.02,C('#6a6a62'),{small:1});
      cyl(x0+1.75,y0+0.2,0.07,z,z+0.24,(f,u,v,W,H)=>f==='T'?C('#c8b070'):(hh(Math.floor(u),Math.floor(v),9)<0.4?shd(C('#e0a040'),(u%W)/W<0.2?1.3:1.05):shd(C('#b07a20'),(u%W)/W<0.2?1.2:0.9)),{small:1});   // a jar of amber beads
      cyl(x0+1.75,y0+0.2,0.05,z+0.24,z+0.28,PAL.oakL,{small:1});
      bookLying(x0+2.0,y0+0.07,z,x1-0.1,y1-0.07,0.08,C('#7a2a24'),{spine:'S'}); bookLying(x0+2.04,y0+0.09,z+0.08,x1-0.14,y1-0.09,0.06,C('#3a5a3a'),{spine:'S'}); } }

  item('rafters over the greenhouse');
  // dark oak beams across the open top, iron straps where they cross and at the walls; the things that hang, hang from them
  { const z0=WH-0.42, z1=WH-0.18, Wd=wood(PAL.oakD,{seed:97,along:'u',lite:1.3}), Wv=wood(PAL.oakD,{seed:98,along:'v',lite:1.3});
    const strap=(f,u,v,W,H)=>shd(PAL.iron,v<1?1.4:1);
    box(0,1.0,z0,LX,1.24,z1,(f,u,v,W,H,x)=>{ const s=((x*TX)%48+48)%48; if(s<3)return strap(f,u,v,W,H); return Wd(f,u,v,W,H); });
    box(0.9,0,z0-0.02,1.14,LY,z1-0.02,(f,u,v,W,H,x,y)=>{ const s=((y*TX)%48+48)%48; if(s<3)return strap(f,u,v,W,H); return Wv(f,u,v,W,H); });
    box(0,5.6,z0+0.01,LX,5.8,z1-0.03,(f,u,v,W,H,x)=>{ const s=((x*TX)%48+48)%48; if(s<3)return strap(f,u,v,W,H); return Wd(f,u,v,W,H); }); }

  item('stone tower with ivy');
  // a square tower of the same stone in the north-east, a little taller than the walls, its capstones and rubble on top; ivy over most of it
  { const x0=7.4,x1=9.6,y0=-0.3,y1=1.75, h=WH+0.35, ivy=[[0,3.0,2.6,5],[-1,-0.2,2.2,5]];
    box(x0,y0,0,x1,y1,h,(f,u,v,W,H,x,y,z)=>{ if(f==='T')return shd(PAL.cap,(u<1.5||v<1.5)?1.15:(u>W-1.5||v>H-1.5)?0.8:0.95+0.08*hh(Math.floor((u+v)/10),0,5));
      const a=f==='S'||f==='N'?x-x0:y1-y, ap=a*TX, zp=z*ZS, edge=Math.min(a,(f==='S'||f==='N'?x1-x:y-y0));
      if(z>h-0.3){ const b=Math.floor(ap/22), bu=ap-b*22; if(bu<1||Math.abs(zp-(h-0.15)*ZS)<0.6)return PAL.capD; return shd(PAL.cap,(zp>(h-0.04)*ZS?1.15:1)*(0.92+0.1*hh(b,0,7))); }
      if(f==='S'&&z>2.45&&z<2.6)return shd(C('#2d2311'),z>2.55?1.3:1);                   // the display case's cornice runs round it
      const c=ivyAt(f==='S'?[[0.2,2.2,2.6,5]]:[[0.1,1.9,2.2,5]],a,z,f==='S'?17:19); if(c)return c;
      let s=stoneAt(ap,zp,f==='S'?101:103,f==='N'); if(edge<0.06)s=shd(s,1.12); return s; },{sh:1}); }

  item('rubble on the wall tops',{wall:1});
  // pale sandstone lumps and broken pink brick lying on the capstones where the wall stands whole, as the wall left them
  { seed(105); const lump=(x,y,z,s,pink)=>{ const c=pink?C('#c09080'):C('#c8bca0'), cD=pink?C('#906058'):C('#8a7e68');
      ell(x,y,z+s*0.45,s,s*0.8,s*0.5,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ const k=lz>0.4&&lx<0.2?1.15:lx>0.5||lz<-0.3?0.78:1; return shd(hh(Math.floor(lx*6),Math.floor(lz*6),pink?3:4)<0.15?cD:c,k); },{wall:x<0.2?'W':'N'}); };
    for(let a=0.4;a<LY-0.4;a+=rr(0.9,1.6)){ const t=topAt(a,13); if(t<WH-0.01)continue; const n=rr(1,3)|0, pk=rr(0,1)<0.4; for(let i=0;i<n;i++)lump(-0.15+rr(-0.05,0.05),a+rr(-0.15,0.15),WH,rr(0.07,0.14),pk); }
    for(let a=0.4;a<LX-0.4;a+=rr(0.8,1.5)){ if(a>7.3&&a<9.7)continue; const t=topAt(a,29); if(t<WH-0.01)continue; const n=rr(1,3)|0, pk=rr(0,1)<0.4; for(let i=0;i<n;i++)lump(a+rr(-0.15,0.15),-0.15+rr(-0.05,0.05),WH,rr(0.07,0.14),pk); }
    for(let i=0;i<4;i++)lump(rr(7.7,9.3),rr(0,1.4),WH+0.35,rr(0.1,0.16),i%2); }

  item('ivy hanging off the walls',{wall:1});
  // leaves standing off the wall over its painted ivy, thickest at the top, trailing down in strands; now and then a flower
  { seed(107); const strand=(x,y,z,len,wall,dx,dy)=>{ for(let k=0;k<len*10;k++){ const zz=z-k*0.1, c=rr(0,1)<0.3?PAL.ivyL:rr(0,1)<0.5?PAL.ivy:PAL.ivyD;
        leafE(x+dx*rr(0.02,0.08)+rr(-0.05,0.05),y+dy*rr(0.02,0.08)+rr(-0.05,0.05),zz,0.06,0.06,0.035,c,{wall});
        if(rr(0,1)<0.06)ell(x+dx*0.1,y+dy*0.1,zz,0.035,0.035,0.035,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>Math.hypot(lx,lz)<0.35?PAL.flC:PAL.fl,{small:1,wall}); } };
    for(const [a0,a1,zb] of IVY.W)for(let a=a0+0.1;a<a1;a+=0.22)strand(0.02,a,WH-0.95,Math.max(0.3,(WH-0.95-zb)*rr(0.2,0.6)),'W',1,0);
    for(const [a0,a1,zb] of IVY.N)for(let a=a0+0.1;a<a1;a+=0.22){ if(a>7.3&&a<9.7)continue; strand(a,0.02,WH-0.95,Math.max(0.3,(WH-0.95-zb)*rr(0.2,0.6)),'N',0,1); } }

  return {}; })();

// =====================================================================================
// THE WITCH'S GREENHOUSE, part 3 (see part 1): the west side. The carved arch's pillars and fretwork; the apothecary cabinet (four drawers, one
// open with a brass bell in it, an open book with a ribbon, flasks and bottles, a little brass scale, two bell jars on top, an amethyst and an
// orb that swirls, two candles); the broom leaning on the platform; the seed crate on legs under the east window; the grey bin; the hand pump on
// the south wall; the corner bookcase with a stone sink on it; the bench of rolled scrolls with wax seals; the dark rug; the rain barrel by the steps.
// =====================================================================================
(()=>{ const {C,shd,mix,hh,n1,sstep,seed,rr,item,box,cyl,ell,leafE,wood,candle,jar,bookLying,bookStand,lamp,TX,ZS,E1}=PGK, {PAL,ARCH}=GHS;
  const W={dk:C('#2d2311'),wd:C('#4f442e'),wdL:C('#685b42'),wdD:C('#3a2e1c'),red:C('#6e3a22'),redL:C('#8a5030'),redD:C('#4a2414'),brass:C('#c8a048'),brassD:C('#8a6a28'),
    glass:C('#d6dcd0'),glassD:C('#a8b0a4'),paper:C('#ece0b8'),paperD:C('#c8b888'),ink:C('#a02a20'),teal:C('#2aa098'),tealL:C('#5ad0c0'),amth:C('#9a70d8'),amthL:C('#c8a8f0'),amthD:C('#6040a0'),
    orbA:C('#40d0c0'),orbB:C('#8050d0'),pumpI:C('#5a5e62'),pumpL:C('#8a9096'),pumpD:C('#34383c'),bin:C('#b8b4c8'),binD:C('#8a86a0'),straw:C('#c8a040'),strawD:C('#8a6a20'),strawL:C('#e8c868')};
  const info=(k,price,desc,mat)=>{ GHI[k]=[price,desc,mat]; };

  item('carved arch pillars');
  // two dark oak pillars either side of the arch, standing on stepped plinths, a running swirl carved down their faces; over the arch a band of
  // fretwork, scrolls cut through the wood, between two brackets
  { const Wd=wood(W.wd,{seed:111,along:'v',lite:1.2}), z1=ARCH.z1+1.0;
    const carve=(f,u,v,W_,H)=>{ if(f==='T')return shd(W.wdL,0.95); const cu=u-W_/2, ph=v*0.35; if(v>3&&v<H-3&&Math.abs(cu)<W_*0.32){ const s=Math.sin(ph)*W_*0.22; if(Math.abs(cu-s)<0.8)return shd(W.dk,0.8); if(Math.abs(cu+s)<0.6&&Math.cos(ph)>0)return shd(W.wdL,1.15); return shd(W.wd,0.82); }
      if(Math.abs(Math.abs(cu)-W_*0.36)<0.5)return shd(W.wdL,1.2); return Wd(f,u,v,W_,H); };
    for(const [y0,y1] of [[ARCH.a0-0.28,ARCH.a0],[ARCH.a1,ARCH.a1+0.28]]){ box(0,y0-0.05,0,0.36,y1+0.05,0.3,(f,u,v,W_,H)=>f==='T'?shd(W.wdL,1.05):shd(W.wdD,v<1.5?1.3:1));
      box(0.02,y0-0.02,0.3,0.32,y1+0.02,0.42,(f,u,v,W_,H)=>shd(W.wd,v<1?1.3:1.0)); box(0.03,y0,0.42,0.3,y1,z1,carve); box(0,y0-0.04,z1,0.34,y1+0.04,z1+0.12,(f,u,v,W_,H)=>shd(W.wdL,v<1.2?1.25:v>H-1?0.7:1)); }
    box(0,ARCH.a0-0.28,z1+0.12,0.22,ARCH.a1+0.28,z1+0.55,(f,u,v,W_,H,x,y,z)=>{ if(f==='T')return shd(W.wdL,1.0); const a=(y-ARCH.a0+0.28)*TX, b=(z-z1-0.12)*ZS;
      if(b<1.5||b>H-1.5)return shd(W.wd,b<1.5?0.8:1.2); const cell=Math.floor(a/9), cu=a-cell*9-4.5, cv=b-H/2, r=Math.hypot(cu,cv), an=Math.atan2(cv,cu);
      if(r<3.8&&Math.abs((r-an*0.9+12)%2.6-1.3)<0.55)return shd(W.wdL,1.1); if(r<4.2)return -1; return Wd(f,u,v,W_,H); },{small:1}); }
  info('carved arch pillars',780,'Dark oak pillars with a running swirl, a band of fretwork over the arch.','oak');

  item('apothecary cabinet, greenhouse');
  // against the west wall, facing the room: four drawers with brass pulls (the second open, a brass bell in it), an open shelf, a second
  // shelf, a top with an arched cut in its sides; a rail along the top shelf's front
  { const x0=0.04,x1=0.66,y0=6.25,y1=7.35, Wd=wood(W.red,{seed:113,along:'u'}), WdV=wood(W.red,{seed:114,along:'v'});
    const side=(y)=>box(x0,y,0,x1,y+0.06,2.12,(f,u,v,W_,H,x,yy,z)=>{ if(f==='T')return shd(W.redL,1.05); if((f==='S'||f==='N')&&z>1.6&&z<2.0&&Math.hypot((x-0.4)*TX,(z-1.75)*ZS*0.8)<5)return -1; return WdV(f,u,v,W_,H); });
    side(y0); side(y1-0.06); box(x0,y0,0,x0+0.04,y1,2.12,W.redD);
    box(x0,y0+0.06,0,x1,y1-0.06,0.98,(f,u,v,W_,H,x,y,z)=>{ if(f==='T')return shd(W.redL,(u>W_-1.2)?1.2:0.95); if(f!=='E')return shd(W.red,0.85);
      if(u<1||u>W_-1||v<1||v>H-1.2)return W.redD; const col=u<W_/2?0:1, row=Math.floor((v-1)/((H-2)/2)), cu=col?u-W_/2:u, cw=W_/2, rv=(v-1)-row*((H-2)/2), rh=(H-2)/2;
      if(cu<0.8||cu>cw-0.6||rv<0.7||rv>rh-0.6)return W.redD; if(col===1&&row===0)return shd(W.dk,0.6);   // (its open drawer's hole)
      if(Math.abs(cu-cw/2)<1.6&&Math.abs(rv-rh*0.45)<0.9)return Math.abs(cu-cw/2)<0.5&&rv>rh*0.45?W.brassD:W.brass;   // the pulls
      return Wd(f,u,v,W_,H); },{sh:1});
    // the open drawer pulled out, its brass bell inside
    box(x1,6.85,0.52,x1+0.28,7.26,0.88,(f,u,v,W_,H,x,y,z)=>{ if(f==='T')return x<x1+0.24&&y>6.89&&y<7.22?shd(W.redD,0.7):shd(W.redL,1.1); if(f==='E'){ if(Math.abs(u-W_/2)<1.6&&Math.abs(v-H*0.45)<0.9)return W.brass; return shd(W.red,v<1?1.25:1); } return shd(W.red,0.9); },{small:1});
    ell(x1+0.13,7.05,0.92,0.07,0.07,0.07,(f,u,v,W_,H,wx,wy,wz,lx,ly,lz)=>shd(W.brass,lx<-0.2&&lz>0.2?1.35:lx>0.4?0.7:1),{small:1}); cyl(x1+0.13,7.05,0.012,0.98,1.03,W.brassD,{small:1});
    // the shelves
    for(const z of [0.98,1.58,2.08])box(x0+0.04,y0+0.06,z,x1+(z>2?0.03:0),y1-0.06,z+0.05,(f,u,v,W_,H)=>f==='T'?shd(W.redL,0.9+0.1*hh(u>>2,v,3)):shd(W.redL,v<1?1.2:0.95));
    box(x1-0.03,y0+0.06,1.85,x1,y1-0.06,1.88,W.brassD,{small:1});                                     // the rail
    // first shelf: the open book (yellowed pages, red marks), its ribbon hanging over the edge; flasks; a little brass scale
    box(0.22,6.62,1.03,0.6,7.02,1.07,(f,u,v,W_,H)=>{ if(f!=='T')return W.paperD; if(Math.abs(v-H/2)<0.7)return shd(W.paperD,0.8); const lu=u, lv=v%(H/2);
      if(lu>2&&lu<W_-2&&lv>1.5&&lv<H/2-1.5&&Math.floor(lu)%3===0&&hh(Math.floor(lu),Math.floor(v),3)<0.7)return hh(Math.floor(lu),Math.floor(v/3),4)<0.25?W.ink:C('#6a5a40');
      return shd(W.paper,0.95+0.06*hh(Math.floor(u),Math.floor(v),5)); },{small:1});
    box(0.6,6.9,0.78,0.63,6.94,1.06,C('#3060c0'),{small:1}); box(0.6,6.89,0.74,0.63,6.95,0.79,C('#2048a0'),{small:1});
    jar(0.3,6.42,1.03,0.06,0.13,C('#40b8a8'),{lvl:0.2}); ell(0.48,6.42,1.1,0.06,0.06,0.07,(f,u,v,W_,H,wx,wy,wz,lx,ly,lz)=>shd(C('#c82838'),lx<-0.3&&lz>0?1.45:1),{small:1});
    cyl(0.48,6.42,0.018,1.16,1.24,W.glass,{small:1}); jar(0.3,7.2,1.03,0.055,0.12,C('#a0c8e8'),{lvl:0.1});
    box(0.42,7.1,1.03,0.6,7.18,1.08,(f,u,v,W_,H)=>u<W_*0.7?mix(W.glass,C('#3a2a80'),0.6):W.glassD,{small:1});                    // a flask lying down
    cyl(0.18,7.16,0.04,1.03,1.05,W.brassD,{small:1}); cyl(0.18,7.16,0.008,1.05,1.24,W.brass,{small:1}); box(0.08,7.15,1.22,0.28,7.17,1.24,W.brass,{small:1});
    for(const dy of [-0.09,0.09])ell(0.18+dy*0.9,7.16,1.17,0.035,0.035,0.012,W.brass,{small:1});                                     // the scale's pans
    // second shelf: bottles and flasks of every colour
    seed(117); for(const [y,r,h,c,round] of [[6.42,0.05,0.12,C('#8a9a3a'),1],[6.58,0.055,0.12,C('#c02030'),1],[6.75,0.04,0.2,C('#2a8a4a'),0],[6.92,0.045,0.16,C('#e870a0'),0],[7.1,0.04,0.18,C('#3aa8a0'),0]]){
      if(round){ ell(0.4,y,1.63+r,r,r,r,(f,u,v,W_,H,wx,wy,wz,lx,ly,lz)=>shd(c,lx<-0.3&&lz>0?1.45:1),{small:1}); cyl(0.4,y,0.015,1.63+r*1.8,1.63+r*2+0.06,W.glass,{small:1}); }
      else{ cyl(0.4,y,r,1.63,1.63+h,(f,u,v,W_,H)=>f==='T'?shd(c,0.8):((u%W_)/W_<0.18?shd(c,1.45):(v/H>0.35&&v/H<0.65&&c===C('#e870a0'))?C('#3a68c0'):c),{small:1}); cyl(0.4,y,r*0.4,1.63+h,1.63+h+0.06,c,{small:1}); cyl(0.4,y,r*0.45,1.63+h+0.06,1.63+h+0.09,W.straw,{small:1}); } }
    // the top: two bell jars (an amethyst, an orb whose light swirls), two candles, paper labels hung on string
    const bell=(y,inner)=>{ cyl(0.36,y,0.15,2.13,2.17,W.redD,{small:1}); inner(y);
      cyl(0.36,y,0.13,2.17,2.47,(f,u,v,W_,H)=>f==='T'?-1:((u%W_)/W_>0.12&&(u%W_)/W_<0.2?mix(W.glass,C('#ffffff'),0.5):-1),{small:1});   // the glass: only its shine, you see in
      ell(0.36,y,2.47,0.13,0.13,0.07,(f,u,v,W_,H,wx,wy,wz,lx,ly,lz)=>lz<0?-1:(lx<-0.4&&lz>0.3?mix(W.glass,C('#ffffff'),0.5):-1),{small:1}); cyl(0.36,y,0.025,2.53,2.58,W.glassD,{small:1});
      box(0.48,y-0.05,2.25,0.5,y+0.05,2.33,W.paper,{small:1}); };
    bell(6.55,y=>{ for(const [dx,dy,s] of [[0,0,1],[-0.04,0.04,0.7],[0.04,-0.03,0.6]])box(0.34+dx,y-0.025*s+dy,2.17,0.38+dx,y+0.025*s+dy,2.17+0.22*s,(f,u,v,W_,H)=>f==='T'?W.amthL:shd(u<W_/2?W.amthL:W.amth,v<2?1.2:0.95),{small:1}); });
    bell(7.05,y=>{ ell(0.36,y,2.29,0.09,0.09,0.09,(f,u,v,W_,H,wx,wy,wz,lx,ly,lz)=>{ const s=Math.sin(Math.atan2(ly,lx)*2+lz*5); return E1|(s>0.3?W.orbA:s<-0.3?W.orbB:mix(W.orbA,W.orbB,0.5)); },{small:1}); });
    candle(0.32,6.8,2.13,0.12,0.03); candle(0.42,6.86,2.13,0.09,0.03);
    lamp(0.6,6.82,2.3,2.4,[1,0.72,0.4],0.9); lamp(0.6,7.05,2.3,1.6,[0.4,0.85,0.9],0.7); }
  info('apothecary cabinet, greenhouse',540,'Four drawers, two shelves of flasks and bottles, an open book, bell jars and candles on top.','walnut, glass, brass');

  item('straw broom, leaning');
  // a long handle leaning on the platform's railing, the straw head on the floor splayed
  { for(let k=0;k<14;k++){ const t=k/13, z=0.35+t*1.8, y=2.62-t*0.36, x=2.8; box(x-0.02,y-0.02,z,x+0.02,y+0.02,z+0.15,(f,u,v,W_,H)=>shd(C('#7a5a30'),u<1?1.25:0.95),{small:1}); }
    for(let i=0;i<9;i++){ const s=(i-4)/4; box(2.78+s*0.1,2.6,0.02,2.82+s*0.14,2.66,0.38,(f,u,v,W_,H)=>shd(i%3?W.straw:W.strawL,(v>H-3?0.8:1)*(u<1?1.15:1)),{small:1}); }
    box(2.74,2.59,0.3,2.86,2.67,0.38,C('#8a3020'),{small:1}); }
  info('straw broom, leaning',25,'Straw on an ash handle, leaning where it was left.','straw, ash');

  item('seed crate on legs');
  // a slatted wooden crate on four short legs under the east window, full of soil, seedlings coming up in rows
  { const x0=11.2,x1=11.9,y0=2.2,y1=3.0, Ws=wood(C('#9a6a3a'),{seed:121,along:'u',plank:6,gw:1});
    for(const [a,b] of [[x0+0.04,y0+0.04],[x1-0.1,y0+0.04],[x0+0.04,y1-0.1],[x1-0.1,y1-0.1]])box(a,b,0,a+0.06,b+0.06,0.3,C('#6a4424'),{small:1});
    box(x0,y0,0.3,x1,y1,0.72,(f,u,v,W_,H,x,y,z)=>{ if(f==='T')return y>y0+0.04&&y<y1-0.04&&x>x0+0.04&&x<x1-0.04?shd(PAL.mossD,0.6+0.1*hh(u,v,3)):shd(C('#b07a44'),1.1); if(Math.floor(v)%7===0)return C('#4a3018'); return Ws(f,u,v,W_,H); },{sh:1});
    seed(123); for(let i=0;i<5;i++)for(let j=0;j<3;j++){ const x=x0+0.13+j*0.22, y=y0+0.12+i*0.14; cyl(x,y,0.008,0.72,0.8+rr(0,0.08),PAL.ivyL,{small:1}); leafE(x+0.03,y,0.82,0.035,0.02,0.01,PAL.ivyLL); leafE(x-0.03,y,0.83,0.035,0.02,0.01,PAL.ivyL); } }
  info('seed crate on legs',80,'A slatted crate of soil on short legs, seedlings in rows.','pine, soil');

  item('grey bin');
  { cyl(9.95,3.95,0.2,0,0.55,(f,u,v,W_,H)=>f==='T'?C('#3a3848'):shd(W.bin,(v<2?1.15:1)*((u%W_)/W_<0.2?1.12:(u%W_)/W_>0.6?0.85:1)*(Math.floor(v)%9===0?0.88:1)),{sh:1},0.22);
    cyl(9.95,3.95,0.23,0.55,0.6,(f,u,v,W_,H)=>f==='T'?shd(W.bin,1.1):W.binD,{small:1}); }
  info('grey bin',30,'A tin bin with a loose lid. Compost, probably.','tin');

  item('hand pump');
  // cast iron on the south wall: a fluted column, the spout over the bucket, the long handle up and back
  { const x=0.95,y=9.8, ir=(f,u,v,W_,H)=>shd(W.pumpI,(u%W_)/W_<0.2?1.45:(u%W_)/W_>0.6?0.75:1);
    box(x-0.18,9.94,0.3,x+0.18,10,0.42,W.pumpD,{small:1}); box(x-0.18,9.94,0.95,x+0.18,10,1.07,W.pumpD,{small:1});
    cyl(x,y,0.07,0.15,1.15,(f,u,v,W_,H)=>Math.floor((u%W_)/2)%2?shd(W.pumpI,1.0):shd(W.pumpI,1.25),{small:1}); cyl(x,y,0.1,1.15,1.25,W.pumpD,{small:1}); ell(x,y,1.3,0.06,0.06,0.05,ir,{small:1});
    for(let k=0;k<5;k++)box(x-0.03,y-0.05-k*0.04,0.98-k*0.03,x+0.03,y-0.1-k*0.04,1.03-k*0.03,W.pumpI,{small:1});
    for(let k=0;k<9;k++)box(x-0.02,y+0.01+k*0.02,1.28+k*0.07,x+0.02,y+0.05+k*0.02,1.36+k*0.07,W.pumpL,{small:1}); }
  info('hand pump',160,'Cast iron, a long handle; it still draws water.','cast iron');

  item('corner bookcase with a sink');
  // tall and narrow in the corner, two arched niches of books, a yellow tin, a stack of letters on the bottom shelf; a stone sink on top
  { const x0=0.04,x1=0.62,y0=9.3,y1=9.98, Wd=wood(W.wd,{seed:125,along:'v'});
    box(x0,y0,0,x1,y0+0.05,1.9,Wd); box(x0,y1-0.05,0,x1,y1,1.9,Wd); box(x0,y0,0,x0+0.04,y1,1.9,W.wdD);
    box(x0,y0,0,x1,y1,0.12,(f,u,v,W_,H)=>shd(W.wdD,v<1?1.3:1));
    for(const z of [0.62,1.22])box(x0+0.04,y0+0.05,z,x1,y1-0.05,z+0.04,(f,u,v,W_,H)=>shd(W.wdL,f==='T'?0.9:1.1));
    box(x0+0.04,y0+0.05,1.65,x1,y1-0.05,1.9,(f,u,v,W_,H,x,y,z)=>{ if(f!=='E')return Wd(f,u,v,W_,H); const a=(y-y0-0.05)*TX-((y1-y0-0.1)*TX)/2, b=(1.65-z)*ZS; return b<-0.5&&Math.hypot(a,(b+6)*1.2)<7?-1:Wd(f,u,v,W_,H); });   // the niche's arch
    let y=y0+0.07; for(const c of ['#a8502a','#3a4a7a','#c8a050','#2f5a3a'])if(y<y1-0.12){ bookStand(0.1,y,1.26,0.5,y+0.08,0.3,C(c),'E'); y+=0.09; }
    box(0.18,9.72,1.26,0.42,9.88,1.38,(f,u,v,W_,H)=>f==='T'?C('#d8b030'):shd(C('#e8c040'),(Math.abs(v-H/2)<1?0.7:1)),{small:1});
    bookLying(0.1,y0+0.1,0.66,0.5,y1-0.1,0.06,C('#3a4a7a'),{spine:'E'}); bookLying(0.12,y0+0.12,0.72,0.48,y1-0.15,0.05,C('#a8502a'),{spine:'E'});
    for(let i=0;i<5;i++)box(0.12+i*0.01,y0+0.12+i*0.008,0.16+i*0.03,0.52-i*0.01,y1-0.14-i*0.01,0.18+i*0.03,(f,u,v,W_,H)=>f==='T'?(Math.floor(v)%3===0&&u>2&&u<W_-2?C('#8a7a60'):W.paper):W.paperD,{small:1});   // letters
    box(x0-0.02,y0-0.04,1.9,x1+0.06,y1,2.12,(f,u,v,W_,H,x,y,z)=>{ if(f==='T'){ const e=Math.min(x-x0,x1+0.04-x,y-y0+0.02,y1-0.02-y); if(e>0.07)return shd(C('#5a6058'),0.6+0.3*sstep(0.07,0.3,e)); return shd(PAL.capL,e>0.05?0.9:1.1); }   // the sink's basin
      return shd(PAL.cap,v<1.2?1.2:1); },{sh:1});
    cyl(0.5,y1-0.12,0.02,2.12,2.3,W.pumpL,{small:1}); box(0.38,y1-0.14,2.27,0.52,y1-0.1,2.3,W.pumpL,{small:1}); }
  info('corner bookcase with a sink',310,'Tall and narrow, books in arched niches, letters, a stone sink on top.','oak, stone');

  item('bench of rolled scrolls');
  // a low dark bench heaped with rolled papers, their ends spiralled, red wax seals, a rose with its leaves across them
  { const x0=1.55,x1=2.35,y0=6.15,y1=6.55, Wd=wood(W.wdD,{seed:127,along:'u'});
    for(const [a,b] of [[x0+0.03,y0+0.03],[x1-0.09,y0+0.03],[x0+0.03,y1-0.09],[x1-0.09,y1-0.09]])box(a,b,0,a+0.06,b+0.06,0.3,W.dk,{small:1});
    box(x0,y0,0.3,x1,y1,0.36,Wd,{sh:1});
    seed(129); const roll=(y,z,len,x)=>{ box(x,y-0.045,z,x+len,y+0.045,z+0.09,(f,u,v,W_,H,X,Y,Z)=>{ if(f==='E'||f==='W'){ const r=Math.hypot(u-W_/2,v-H/2); return Math.abs((r+Math.atan2(v-H/2,u-W_/2)*0.5)%1.6-0.8)<0.35?W.paperD:W.paper; }
        if(Math.abs(X-x-len/2)<0.03&&f!=='T')return W.ink; return shd(W.paper,(v<1?1.12:v>H-1?0.85:1)*(0.95+0.06*hh(Math.floor(u),Math.floor(v),3))); },{small:1}); };
    for(let i=0;i<4;i++)roll(y0+0.07+i*0.09,0.36,rr(0.55,0.7),x0+rr(0.02,0.12)); for(let i=0;i<3;i++)roll(y0+0.11+i*0.09,0.45,rr(0.5,0.62),x0+rr(0.05,0.15)); roll(y0+0.2,0.54,0.5,x0+0.12);
    for(let k=0;k<6;k++)box(x0+0.2+k*0.06,y0+0.15+k*0.02,0.64,x0+0.24+k*0.06,y0+0.17+k*0.02,0.65,PAL.ivyD,{small:1});
    ell(x0+0.56,y0+0.27,0.66,0.035,0.035,0.03,(f,u,v,W_,H,wx,wy,wz,lx,ly,lz)=>lz>0.3?C('#e04050'):C('#a01828'),{small:1}); leafE(x0+0.32,y0+0.2,0.65,0.035,0.02,0.01,PAL.ivyL); leafE(x0+0.44,y0+0.24,0.66,0.035,0.02,0.01,PAL.ivy); }
  info('bench of rolled scrolls',120,'A low bench under rolled papers sealed in red wax; somebody left a rose.','oak, paper, wax');

  item('dark patterned rug',{flat:1});
  // charcoal wool, a border of cream hooks and squares, a medallion of linked rings, fringe at the two short ends
  { const x0=0.75,x1=2.1,y0=6.75,y1=8.25; box(x0,y0,0,x1,y1,0.018,(f,u,v,W_,H)=>{ if(f!=='T')return C('#2a2420'); const wv=(Math.floor(u)+Math.floor(v))%2?1:0.93;
      if(v<2||v>H-2)return Math.floor(u)%2?C('#d8ccb0'):-1;                                                          // the fringe
      const b=Math.min(u,W_-u,v-2,H-2-v); if(b<1.2)return shd(C('#1e1a18'),wv); if(b<5.5){ const s=Math.floor((u+v)/3)%4; return shd(b>1.8&&b<4.8&&s===0?C('#d8ccb0'):C('#3a2e2a'),wv); }
      const cu=u-W_/2, cv=v-H/2, r=Math.hypot(cu*1.2,cv); if(Math.abs(r%7-3.5)<0.7&&r<16)return shd(C('#b89a68'),wv); return shd(C('#3e3430'),wv*(0.95+0.06*hh(u>>1,v>>1,3))); },{solid:0,occ:0}); }
  info('dark patterned rug',140,'Charcoal wool, a border of hooks, a medallion of rings, fringed.','wool');

  item('rain barrel');
  // an oak barrel by the steps, iron hoops, full to the brim with rainwater (real water: part 8)
  { const x=1.95,y=4.1,r=0.3;
    cyl(x,y,r,0,0.82,(f,u,v,W_,H)=>{ if(f==='T'){ const d=Math.hypot(u-W_/2,v-H/2)/(W_/2); return d>0.86?shd(C('#7a4a24'),1.1):shd(C('#3a2414'),0.7+0.3*d); }   // (the rain in it is real water, part 8: DEEPW)
      const t=v/H; if(Math.abs(t-0.12)<0.04||Math.abs(t-0.88)<0.04||Math.abs(t-0.5)<0.03)return shd(PAL.iron,Math.abs(t-0.12)<0.015||Math.abs(t-0.88)<0.015?1.4:1);
      const bulge=1-Math.abs(t-0.5); return shd(hh(Math.floor(u/3.5),0,7)<0.3?C('#7a4a28'):C('#8a5a30'),(0.85+0.25*bulge)*((u%W_)/W_<0.2?1.15:1)*(Math.floor(u/3.5)%2?1:0.9)); },{sh:1},r); }
  info('rain barrel',95,'An oak barrel by the steps, brimful of rain.','oak, iron, water');
})();

// =====================================================================================
// THE WITCH'S GREENHOUSE, part 4 (see part 1): the middle, the witch's work. The cauldron (murky green brew to the brim, real water; it bubbles and
// steams: part 8) and the dried herbs standing by it; the round desk with the open spellbook, a second book, the inkwell and quill, three candles
// on a dish and the green stained-glass lamp; the crystal ball on its carved stand of books and bottles; the wicker chair (the black cat sits in
// it: 47-cats); the cream bench with the frog in its gold cage; the alchemy table (coiled glass, flasks, a funnel, an hourglass, a spirit flame
// under a retort, a skull, a purple crystal, papers); the potion table (blue powder, orange powder and its scoop, a mortar, plates, a green
// crystal in a gold stand, a glass lamp); the canary's tall cage on its stand; the plank bench by the steps with folded cloths, a quill, flasks.
// =====================================================================================
(()=>{ const {C,shd,mix,hh,n1,sstep,seed,rr,item,box,cyl,ell,leafE,wood,candle,jar,bookLying,bookStand,lamp,flame,TX,ZS,E1}=PGK, {PAL}=GHS;
  const M={iron:C('#2e3a2a'),ironL:C('#4e6448'),ironD:C('#182014'),brew:C('#54902b'),brewL:C('#9ad04a'),brewD:C('#3a6a1e'),
    wd:C('#4f442e'),wdL:C('#685b42'),wdD:C('#2d2311'),oak:C('#7a5a32'),oakL:C('#9a7444'),brass:C('#c8a048'),brassD:C('#8a6a28'),gold:C('#d8b040'),goldD:C('#9a7420'),
    paper:C('#ece0b8'),paperD:C('#c8b888'),ink:C('#2a1a10'),rune:C('#8a2a20'),glass:C('#d6dcd0'),glassD:C('#a8b0a4'),green:C('#30a050'),greenL:C('#70e090'),
    violet:C('#6040c0'),violetL:C('#a080f0'),cream:C('#e8dcc0'),creamD:C('#b8a888'),wick:C('#c8a868'),wickD:C('#8a6a38'),bone:C('#e0d4a8'),boneD:C('#a89870'),
    blueP:C('#78c8d8'),orangeP:C('#d0782a'),clay:C('#b05a3a'),clayL:C('#c8784e')};
  const info=(k,price,desc,mat)=>{ GHI[k]=[price,desc,mat]; };
  const top=(c,cL)=>(f,u,v,W,H)=>f==='T'?shd(c,(u<1||v<1)?1.15:(u>W-1||v>H-1)?0.8:0.94+0.08*hh(u>>2,v>>1,3)):shd(cL||c,v<1?1.2:0.92);

  item('bubbling cauldron');
  // squat and black-green, three stubby feet, a thick rolled rim; the brew (real water, murky green: part 8) to the brim, run over the rim in
  // green crust down its belly; it bubbles and steams (part 8) and lights the room green
  { const x=5.0,y=4.9;
    for(const a of [0.5,2.6,4.7])box(x+Math.cos(a)*0.32-0.04,y+Math.sin(a)*0.32-0.04,0,x+Math.cos(a)*0.32+0.04,y+Math.sin(a)*0.32+0.04,0.16,M.ironD,{small:1});
    ell(x,y,0.5,0.52,0.52,0.4,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ const an=Math.atan2(ly,lx), drip=lz>-0.1&&Math.abs(Math.sin(an*7+1))<0.12+0.15*(lz+0.1)&&hh(Math.floor(an*7/3.14),0,5)<0.6;
      if(drip)return lz>0.6?M.brewL:M.brew; let k=lx<-0.35&&lz>0?1.35:lx>0.5?0.7:1; if(lz<-0.6)k*=0.75; return shd(hh(Math.floor(an*20),Math.floor(lz*14),3)<0.08?M.ironL:M.iron,k); },{sh:1});
    cyl(x,y,0.48,0.76,0.86,(f,u,v,W,H)=>{ if(f==='T'){ const d=Math.hypot(u-W/2,v-H/2)/(W/2); if(d>0.84)return shd(M.ironL,d>0.94?0.8:1.15); return shd(M.ironD,0.7+0.3*d); }   // (its brew is real water, part 8: DEEPW)
      const t=(u%W)/W; return Math.abs(Math.sin(t*44))<0.2&&v>H*0.4?M.brew:shd(M.iron,(t<0.2?1.4:t>0.6?0.75:1)); },{small:1});
    lamp(x,y,1.2,4.2,[0.45,1,0.35],1.15);
    // the dried herbs standing by it: a bundle tied with twine, leaves gone grey-green and brown
    for(let i=0;i<7;i++){ const a=i*0.9, lean=0.06+i*0.01; for(let k=0;k<6;k++){ const t=k/5; box(5.6+Math.cos(a)*lean*t,5.42+Math.sin(a)*lean*t,0.02+t*0.95,5.62+Math.cos(a)*lean*t,5.44+Math.sin(a)*lean*t,0.2+t*0.95,C('#6a5a30'),{small:1}); }
      for(let k=2;k<6;k++)leafE(5.61+Math.cos(a)*lean*k/5+0.03,5.43+Math.sin(a)*lean*k/5,0.2+k*0.18,0.06,0.025,0.012,k%2?C('#7a8a50'):C('#8a6a38')); }
    box(5.57,5.39,0.4,5.65,5.47,0.45,C('#b89060'),{small:1}); }
  info('bubbling cauldron',420,'Black iron on three feet, murky green brew to the brim. It bubbles.','cast iron');

  item('round desk with a spellbook');
  // a round dark table on one turned foot: the spellbook open (red runes, a drawing), a second book open behind it, the inkwell and its quill,
  // three candles on a brass dish, and the green stained-glass lamp
  { const x=6.6,y=3.9,h=0.76, Wd=wood(M.wd,{seed:141,along:'u'});
    cyl(x,y,0.3,0,0.05,M.wdD,{small:1}); cyl(x,y,0.07,0.05,h-0.05,(f,u,v,W,H)=>shd(M.wd,(u%W)/W<0.25?1.3:Math.sin(v*0.5)>0.6?1.15:0.9),{small:1},0.05);
    cyl(x,y,0.5,h-0.05,h,(f,u,v,W,H)=>f==='T'?Wd(f,u,v,W,H):shd(M.wdL,v<1?1.2:0.9),{sh:1});
    box(6.3,3.85,h,6.78,4.18,h+0.04,(f,u,v,W,H)=>{ if(f!=='T')return M.rune; if(Math.abs(u-W/2)<0.8)return shd(M.paperD,0.8); const lu=u%(W/2), lv=v;
      if(u>W/2+2&&Math.hypot(lu-W/4,lv-H*0.45)<4&&Math.hypot(lu-W/4,lv-H*0.45)>3)return M.rune;                       // a drawn circle on the right page
      if(u<W/2-2&&lu>2&&lv>2&&lv<H-2&&Math.floor(lv)%3===0&&hh(Math.floor(lu/2),Math.floor(lv),3)<0.6)return hh(Math.floor(lu/3),Math.floor(lv),4)<0.4?M.rune:C('#4a3020');   // lines of runes
      return shd(M.paper,0.95+0.06*hh(Math.floor(u),Math.floor(v),5)); },{small:1});
    box(6.32,3.82,h,6.76,3.86,h+0.03,C('#5a2a1a'),{small:1});
    box(6.38,3.55,h,6.74,3.8,h+0.1,(f,u,v,W,H)=>f==='T'?(Math.abs(u-W/2)<0.6?M.paperD:M.paper):C('#5a3a2a'),{small:1});   // the second book, propped open behind
    cyl(6.9,4.15,0.04,h,h+0.06,C('#1a1a24'),{small:1}); cyl(6.9,4.15,0.02,h+0.06,h+0.08,C('#2a2a34'),{small:1});
    for(let k=0;k<8;k++)box(6.9+k*0.012,4.15-k*0.01,h+0.06+k*0.03,6.92+k*0.012,4.17-k*0.01,h+0.1+k*0.03,k>5?C('#f0ece0'):C('#e8e0d0'),{small:1});   // the quill
    cyl(6.35,4.25,0.12,h,h+0.02,M.brassD,{small:1}); candle(6.3,4.22,h+0.02,0.2,0.03); candle(6.4,4.28,h+0.02,0.15,0.03); candle(6.34,4.32,h+0.02,0.1,0.028);
    lamp(6.35,4.25,h+0.35,2.8,[1,0.75,0.42],1.0);
    // the stained-glass lamp: a dark round foot, a stem, a dome of green glass in leaded panes, lit; a brass finial
    const lx=6.85,ly=3.65; cyl(lx,ly,0.09,h,h+0.03,M.ironD,{small:1}); cyl(lx,ly,0.02,h+0.03,h+0.42,M.ironD,{small:1}); ell(lx,ly,h+0.18,0.05,0.05,0.07,shd(M.green,0.6),{small:1});
    ell(lx,ly,h+0.42,0.24,0.24,0.18,(f,u,v,W,H,wx,wy,wz,lx2,ly2,lz)=>{ if(lz<0)return -1; const an=Math.atan2(ly2,lx2)*8/Math.PI, ring=lz*3;
      if(Math.abs(an-Math.round(an))<0.08||Math.abs(ring-Math.round(ring))<0.08)return C('#1a2a1a');                    // the lead
      const pane=hh(Math.round(an),Math.floor(ring),9); return E1|(pane<0.25?M.greenL:pane<0.6?M.green:C('#40c070')); },{small:1,clip:0});
    cyl(lx,ly,0.25,h+0.4,h+0.43,C('#1a2a1a'),{small:1}); ell(lx,ly,h+0.62,0.025,0.025,0.03,M.brass,{small:1});
    lamp(lx,ly,h+0.4,3.6,[0.5,1,0.55],1.05); }
  info('round desk with a spellbook',380,'A round table: a spellbook open at a drawing, ink and a quill, three candles, a green glass lamp.','walnut, paper, glass');

  item('crystal ball on a carved stand');
  // a square open stand: carved swirls in its sides, books and small bottles on its shelves; on top a round wooden base and the ball, violet,
  // something turning in it (lit)
  { const x0=3.3,x1=3.9,y0=3.6,y1=4.2,h=0.9, Wd=wood(M.oak,{seed:143});
    for(const [a,b] of [[x0,y0],[x1-0.07,y0],[x0,y1-0.07],[x1-0.07,y1-0.07]])box(a,b,0,a+0.07,b+0.07,h,(f,u,v,W,H)=>shd(M.oak,(u<1?1.2:1)*(v<1?1.2:1)),{small:1});
    for(const z of [0.08,0.48,h-0.06])box(x0,y0,z,x1,y1,z+0.06,top(M.oak,M.oakL));
    for(const [a,b,c,d] of [[x0,y1-0.02,x1,y1],[x1-0.02,y0,x1,y1]])box(a,b,0.54,c,d,h-0.06,(f,u,v,W,H)=>{ const cu=u-W/2, cv=v-H/2, r=Math.hypot(cu,cv), an=Math.atan2(cv,cu); if(r<H*0.45&&Math.abs((r-an*1.2+20)%4-2)<0.7)return shd(M.oakL,1.1); return r<H*0.48?-1:shd(M.oak,0.9); },{small:1});
    bookLying(x0+0.08,y0+0.08,0.14,x1-0.1,y1-0.12,0.07,C('#3a5a8a'),{spine:'S'}); bookLying(x0+0.1,y0+0.1,0.21,x1-0.14,y1-0.14,0.06,C('#c8a050'),{spine:'S'});
    for(const [dx,c] of [[0.12,C('#c02030')],[0.28,C('#3aa050')],[0.44,C('#d0a030')]]){ ell(x0+dx,y0+0.3,0.6,0.045,0.045,0.05,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>shd(c,lx<-0.3&&lz>0?1.45:1),{small:1}); cyl(x0+dx,y0+0.3,0.012,0.65,0.7,M.glass,{small:1}); }
    cyl(3.6,3.9,0.2,h,h+0.04,M.wdD,{small:1}); cyl(3.6,3.9,0.15,h+0.04,h+0.1,(f,u,v,W,H)=>f==='T'?M.wdD:shd(C('#5a3020'),v<1?1.3:1),{small:1});
    ell(3.6,3.9,h+0.24,0.15,0.15,0.15,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ if(lx<-0.4&&lz>0.35)return E1|C('#e8e0ff'); const s=Math.sin(Math.atan2(ly,lx)*3+lz*6); return E1|(s>0.5?M.violetL:s<-0.4?C('#3a2a90'):M.violet); },{small:1});
    lamp(3.6,3.9,h+0.25,2.0,[0.6,0.45,1],0.6); }
  info('crystal ball on a carved stand',290,'A violet ball on a wooden base, on a carved stand of books and bottles. Something turns in it.','oak, glass');

  item('wicker chair');
  // a round seat on splayed legs, a woven back curving round it: the black cat's (47-cats)
  { const x=7.8,y=3.3, wk=(f,u,v,W,H)=>{ const s=(Math.floor(u/2)+Math.floor(v/2))%2; return shd(s?M.wick:M.wickD,(v<1?1.2:1)*((u%W)/W<0.2?1.15:1)); };
    for(const a of [0.8,2.4,3.9,5.5])for(let k=0;k<4;k++){ const t=k/3, r=0.24-t*0.08; box(x+Math.cos(a)*r-0.025,y+Math.sin(a)*r-0.025,t*0.42,x+Math.cos(a)*r+0.025,y+Math.sin(a)*r+0.025,t*0.42+0.14,M.wickD,{small:1}); }
    cyl(x,y,0.3,0.4,0.48,(f,u,v,W,H)=>f==='T'?shd(M.cream,0.95+0.06*hh(u>>1,v>>1,3)):wk(f,u,v,W,H),{sh:1});
    for(let i=0;i<14;i++){ const a=2.6+i*(3.4/13); box(x+Math.cos(a)*0.28-0.04,y+Math.sin(a)*0.28-0.04,0.48,x+Math.cos(a)*0.28+0.04,y+Math.sin(a)*0.28+0.04,1.12-Math.abs(i-6.5)*0.02,wk,{small:1}); } }
  info('wicker chair',150,'A round seat and a woven back. The black cat\'s, by the look of it.','rattan, cotton');

  item('cream bench with a frog in a gold cage');
  // a painted bench, its paint worn; a little domed cage of gold wire on it, a green frog inside (it blinks and puffs: part 8)
  { const x0=8.5,x1=9.35,y0=2.55,y1=2.95, cr=(f,u,v,W,H)=>shd(M.cream,(v<1?1.15:1)*(hh(u>>1,v>>1,3)<0.08?0.8:1));
    for(const [a,b] of [[x0+0.04,y0+0.04],[x1-0.1,y0+0.04],[x0+0.04,y1-0.1],[x1-0.1,y1-0.1]])box(a,b,0,a+0.06,b+0.06,0.4,cr,{small:1});
    box(x0,y0,0.4,x1,y1,0.46,top(M.cream,M.creamD),{sh:1}); box(x0+0.04,y0+0.06,0.12,x1-0.04,y1-0.06,0.15,M.creamD,{small:1});
    const cx=8.95,cy=2.75; cyl(cx,cy,0.2,0.46,0.5,M.goldD,{small:1});
    box(cx-0.2,cy-0.2,0.5,cx+0.2,cy+0.2,1.05,(f,u,v,W,H,x,y,z)=>{ const r=0.2*(z<0.85?1:Math.sqrt(Math.max(0,1-((z-0.85)/0.2)**2))), d=Math.hypot(x-cx,y-cy); if(Math.abs(d-r)>0.022)return -1;
      const an=Math.atan2(y-cy,x-cx); return Math.abs(Math.sin(an*8))<0.2||Math.abs(z-0.7)<0.012?shd(M.gold,an>2||an<-1.5?1.3:1):-1; },{small:1});
    box(cx-0.02,cy-0.02,1.05,cx+0.02,cy+0.02,1.15,(f,u,v,W,H)=>Math.abs(u-W/2)<0.6&&Math.abs(v-H*0.4)<1.2?-1:M.gold,{small:1});
    ell(cx,cy,0.58,0.09,0.11,0.07,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ if(lz>0.45&&Math.abs(ly)>0.2&&Math.abs(ly)<0.6&&lx>0)return Math.abs(ly)>0.32&&Math.abs(ly)<0.48?C('#1a1a10'):C('#e8d840');   // its eyes
      return shd(lz<-0.2?C('#c8d870'):C('#48a038'),(lx<-0.2?1.2:1)*(hh(Math.floor(lx*8),Math.floor(ly*8),4)<0.12?0.8:1)); },{small:1}); }
  info('cream bench with a frog in a gold cage',110,'A worn cream bench; on it a gold cage, and a frog who isn\'t going anywhere.','pine, brass, frog');

  item('alchemy table');
  // a long dark worktable: coiled glass condensers on brass stands, round flasks, a funnel, an hourglass, a spirit flame under a retort, a skull,
  // a cluster of purple crystal, a ribbed green bottle, papers weighted down
  { const x0=6.3,x1=8.3,y0=7.3,y1=8.0,h=0.75, Wd=wood(M.wd,{seed:147,along:'u',plank:7});
    for(const [a,b] of [[x0+0.05,y0+0.05],[x1-0.13,y0+0.05],[x0+0.05,y1-0.13],[x1-0.13,y1-0.13]])cyl(a+0.04,b+0.04,0.045,0,h-0.06,(f,u,v,W,H)=>shd(M.wd,Math.sin(v*0.6)>0.5?1.2:0.9),{small:1},0.035);
    box(x0,y0,h-0.06,x1,y1,h,Wd,{sh:1}); box(x0+0.1,y0+0.1,0.16,x1-0.1,y1-0.1,0.2,M.wdD,{small:1});
    for(let i=0;i<4;i++)bookLying(x0+0.2+i*0.03,y0+0.15,0.2+i*0.06,x0+0.75-i*0.02,y1-0.15,0.06,C(['#c8a050','#3a6a8a','#d8c040','#4a6aa0'][i]),{spine:'S'});
    box(x0+0.08,y0+0.1,h,x0+0.5,y0+0.42,h+0.01,(f,u,v,W,H)=>Math.floor(v)%3===0&&u>2&&u<W-2?C('#8a7a60'):M.paper,{small:1});
    // the condenser: a glass coil round a brass rod, a flask either end
    const coil=(cx,cy)=>{ cyl(cx,cy,0.012,h,h+0.7,M.brass,{small:1}); cyl(cx,cy,0.08,h,h+0.02,M.brassD,{small:1});
      for(let k=0;k<26;k++){ const t=k/25, a=t*6*Math.PI, z=h+0.15+t*0.45; ell(cx+Math.cos(a)*0.09,cy+Math.sin(a)*0.09,z,0.022,0.022,0.022,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>lx<-0.3&&lz>0?C('#ffffff'):M.glassD,{small:1}); } };
    coil(6.85,7.55); coil(7.35,7.5);
    const flask=(x,y,r,c)=>{ ell(x,y,h+r,r,r,r,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>shd(c,lx<-0.3&&lz>0?1.45:lx>0.4?0.8:1),{small:1}); cyl(x,y,r*0.3,h+r*1.8,h+r*2+0.1,M.glass,{small:1}); };   // (coloured glass)
    flask(7.05,7.75,0.08,C('#a0d0e0')); flask(7.6,7.8,0.07,C('#e0e8d8')); flask(6.62,7.82,0.06,C('#d06a30'));
    // the spirit flame under a retort
    { const rx=7.85,ry=7.5; cyl(rx,ry,0.05,h,h+0.06,M.glass,{small:1}); cyl(rx,ry,0.012,h+0.06,h+0.08,C('#d8d0c0'),{small:1}); flame(rx,ry,h+0.08);
      for(const a of [0,2.1,4.2])box(rx+Math.cos(a)*0.09-0.008,ry+Math.sin(a)*0.09-0.008,h,rx+Math.cos(a)*0.09+0.008,ry+Math.sin(a)*0.09+0.008,h+0.3,M.ironD,{small:1});
      ell(rx,ry,h+0.38,0.09,0.09,0.08,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>shd(C('#7a3ac0'),lx<-0.3&&lz>0?1.5:1),{small:1});
      for(let k=0;k<8;k++)ell(rx+0.08+k*0.035,ry,h+0.42+k*0.008-k*k*0.004,0.018,0.018,0.018,M.glassD,{small:1}); }
    // the skull, the purple crystal, the ribbed green bottle
    ell(8.05,7.82,h+0.1,0.1,0.12,0.1,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ if(lx>0.25&&Math.abs(ly)>0.18&&Math.abs(ly)<0.62&&Math.abs(lz-0.05)<0.3)return C('#2a2018');   // its eyes
      if(lx>0.55&&Math.abs(ly)<0.12&&lz<-0.15&&lz>-0.45)return C('#3a3020'); return shd(lz<-0.5?M.boneD:M.bone,lx<-0.2&&lz>0.2?1.15:1); },{small:1});
    box(8.0,7.78,h,8.14,7.9,h+0.05,(f,u,v,W,H)=>Math.floor(u)%2&&f!=='T'?C('#3a3020'):M.bone,{small:1});
    for(const [dx,dy,s] of [[0,0,1],[0.05,0.03,0.7],[-0.04,0.04,0.6],[0.02,-0.05,0.5]])box(6.9+dx-0.025*s,7.85+dy-0.025*s,h,6.9+dx+0.025*s,7.85+dy+0.025*s,h+0.24*s,(f,u,v,W,H)=>f==='T'?C('#c8a8f0'):shd(u<W/2?C('#b090e8'):C('#7a50c0'),v<2?1.2:0.95),{small:1});
    cyl(7.95,7.45,0.05,h,h+0.22,(f,u,v,W,H)=>f==='T'?C('#3a6a3a'):shd(C('#4a9a5a'),Math.floor(v/2)%2?1.1:0.85),{small:1}); cyl(7.95,7.45,0.022,h+0.22,h+0.3,C('#4a9a5a'),{small:1});
    lamp(7.85,7.5,h+0.2,1.8,[1,0.8,0.5],0.6); }
  info('alchemy table',640,'Coiled glass, coloured flasks, a spirit flame under a retort, a skull, purple crystal.','oak, glass, brass, bone');

  item('brass hourglass');
  // on the alchemy table: two glass bulbs in a brass frame of three posts; its sand runs (part 8)
  { const h=0.75;
    { const hx=7.15,hy=7.45; cyl(hx,hy,0.09,h,h+0.03,M.brassD,{small:1}); cyl(hx,hy,0.09,h+0.33,h+0.36,M.brassD,{small:1});
      for(const a of [0,2.1,4.2])cyl(hx+Math.cos(a)*0.08,hy+Math.sin(a)*0.08,0.01,h+0.03,h+0.33,M.brass,{small:1});
      for(const s of [1,-1])ell(hx,hy,h+0.18+s*0.075,0.06,0.06,0.075,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>lx<-0.4?C('#ffffff'):-1,{small:1}); }
  }
  info('brass hourglass',85,'Two glass bulbs in a brass frame. The sand runs.','brass, glass, sand');

  item('potion table');
  // a dark worktable: a woven dish heaped with blue powder, a bowl of orange powder with its scoop, a stone mortar and pestle, a stack of plates,
  // a green crystal on a gold stand (lit), a glass lamp (a chimney over a green glass bulb, lit), little coloured flasks, leaves fallen
  { const x0=2.6,x1=4.4,y0=6.9,y1=7.6,h=0.72, Wd=wood(M.wd,{seed:149,along:'u',plank:7});
    for(const [a,b] of [[x0+0.05,y0+0.05],[x1-0.13,y0+0.05],[x0+0.05,y1-0.13],[x1-0.13,y1-0.13]])cyl(a+0.04,b+0.04,0.045,0,h-0.06,(f,u,v,W,H)=>shd(M.wd,Math.sin(v*0.6)>0.5?1.2:0.9),{small:1},0.035);
    box(x0,y0,h-0.06,x1,y1,h,(f,u,v,W,H)=>{ if(f==='T'&&hh(u>>1,v>>1,13)<0.03)return PAL.ivyL; return Wd(f,u,v,W,H); },{sh:1});
    cyl(2.95,7.25,0.2,h,h+0.06,(f,u,v,W,H)=>f==='T'?C('#8a6a3a'):shd(C('#a07a40'),Math.floor(u/2)%2?1.1:0.9),{small:1},0.22);
    ell(2.95,7.25,h+0.06,0.18,0.18,0.14,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>lz<0?-1:shd(M.blueP,(lx<-0.3?1.15:1)*(0.92+0.1*hh(Math.floor(lx*20),Math.floor(lz*20),3))),{small:1,clip:0});
    cyl(3.45,7.4,0.15,h,h+0.1,(f,u,v,W,H)=>f==='T'?shd(M.orangeP,0.95+0.1*hh(u>>1,v>>1,4)):shd(C('#8a4a2a'),v<1?1.2:1),{small:1},0.11);
    box(3.4,7.36,h+0.1,3.62,7.4,h+0.12,C('#d8d8e0'),{small:1});
    cyl(3.9,7.1,0.08,h,h+0.08,(f,u,v,W,H)=>f==='T'?C('#5a5a50'):shd(C('#8a8a80'),v<1?1.2:1),{small:1},0.07); box(3.88,7.08,h+0.06,3.9,7.1,h+0.2,C('#6a6a60'),{small:1});
    for(let k=0;k<4;k++)cyl(4.15,7.35,0.13-k*0.005,h+k*0.025,h+k*0.025+0.02,(f,u,v,W,H)=>f==='T'?C('#e8e4d8'):shd(C('#c8c4b8'),1),{small:1});
    // the green crystal on its gold stand
    cyl(3.3,7.05,0.06,h,h+0.04,M.goldD,{small:1}); for(const a of [0,2.1,4.2])box(3.3+Math.cos(a)*0.04-0.006,7.05+Math.sin(a)*0.04-0.006,h+0.04,3.3+Math.cos(a)*0.04+0.006,7.05+Math.sin(a)*0.04+0.006,h+0.12,M.gold,{small:1});
    box(3.22,6.98,h+0.12,3.38,7.12,h+0.44,(f,u,v,W,H,x,y,z)=>{ const t=(z-h-0.12)/0.32, w=0.075*(t<0.4?t/0.4:(1-t)/0.6); if(Math.abs(x-3.3)>w||Math.abs(y-7.05)>w)return -1;
      return E1|(Math.abs(x-3.3)<w*0.3&&t>0.35?M.greenL:t>0.7?C('#1a8040'):M.green); },{small:1});
    box(3.29,7.04,h+0.44,3.31,7.06,h+0.5,M.gold,{small:1});
    // the glass lamp: a round foot, a green glass bulb, a tall glass chimney, a small flame
    { const px=4.1,py=6.98; cyl(px,py,0.07,h,h+0.03,M.brassD,{small:1}); ell(px,py,h+0.1,0.07,0.07,0.07,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>E1|(lx<-0.3&&lz>0?M.greenL:M.green),{small:1});
      cyl(px,py,0.05,h+0.16,h+0.4,(f,u,v,W,H)=>f==='T'?-1:((u%W)/W<0.16?C('#ffffff'):-1),{small:1},0.035); flame(px,py,h+0.18); lamp(px,py,h+0.3,2.2,[0.55,1,0.5],0.8); }
    for(const [x,y,c] of [[2.75,7.5,C('#40a060')],[2.85,6.98,C('#4060c0')],[3.6,7.5,C('#40a060')]]){ ell(x,y,h+0.05,0.045,0.045,0.05,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>shd(c,lx<-0.3&&lz>0?1.45:1),{small:1}); cyl(x,y,0.012,h+0.09,h+0.15,M.glass,{small:1}); }
    seed(151); for(let i=0;i<5;i++)leafE(rr(x0+0.1,x1-0.1),rr(y0+0.1,y1-0.1),h+0.005,0.05,0.03,0.006,i%2?PAL.ivy:PAL.ivyL); }
  info('potion table',520,'Blue powder, orange powder and its scoop, a mortar, plates, a green crystal on a gold stand, a glass lamp.','oak, glass, stone, brass');

  item('canary in a tall cage');
  // a turned stand, a tall gold cage on it with a domed top and a ring to hang it by, a perch and a yellow canary on it (it hops: part 8)
  { const cx=5.0,cy=7.9; cyl(cx,cy,0.18,0,0.04,M.wdD,{small:1}); cyl(cx,cy,0.04,0.04,0.6,(f,u,v,W,H)=>shd(M.wd,Math.sin(v*0.5)>0.5?1.25:0.9),{small:1}); cyl(cx,cy,0.16,0.6,0.64,M.goldD,{small:1});
    box(cx-0.17,cy-0.17,0.64,cx+0.17,cy+0.17,1.5,(f,u,v,W,H,x,y,z)=>{ const r=0.16*(z<1.3?1:Math.sqrt(Math.max(0,1-((z-1.3)/0.2)**2))), d=Math.hypot(x-cx,y-cy); if(Math.abs(d-r)>0.02)return -1;
      const an=Math.atan2(y-cy,x-cx); return Math.abs(Math.sin(an*7))<0.22||Math.abs(z-1.0)<0.012?shd(M.gold,an>2||an<-1.5?1.3:1):-1; },{small:1});
    box(cx-0.02,cy-0.02,1.5,cx+0.02,cy+0.02,1.62,(f,u,v,W,H)=>Math.abs(u-W/2)<0.6&&Math.abs(v-H*0.4)<1.2?-1:M.gold,{small:1});
    box(cx-0.13,cy-0.008,0.95,cx+0.13,cy+0.008,0.965,M.wd,{small:1}); }
  info('canary in a tall cage',180,'A tall gold cage on a turned stand, a yellow canary hopping on its perch.','brass, walnut');

  item('plank bench by the steps');
  // a thick plank on two stone blocks against the platform: folded cloths, a white quill, two little round flasks
  { const x0=1.7,x1=2.65,y0=2.3,y1=2.7; for(const a of [x0+0.05,x1-0.25])box(a,y0+0.03,0,a+0.2,y1-0.03,0.4,(f,u,v,W,H,x,y,z)=>f==='T'?PAL.cap:GHS.stoneAt((f==='S'?x:y)*TX,z*ZS,155,false),{small:1});
    box(x0,y0,0.4,x1,y1,0.48,wood(C('#6a5a48'),{seed:157,along:'u'}),{sh:1});
    for(let k=0;k<3;k++)box(x0+0.08+k*0.02,y0+0.06,0.48+k*0.05,x0+0.48-k*0.02,y1-0.06,0.53+k*0.05,(f,u,v,W,H)=>shd(k%2?C('#d8d0c0'):C('#c8c0a8'),(f==='T'?1:0.85)*(Math.floor(v)%2?1:0.94)),{small:1});
    for(let k=0;k<7;k++)box(x0+0.55+k*0.04,y0+0.2-k*0.012,0.48,x0+0.58+k*0.04,y0+0.23-k*0.012,0.49+(k>4?0.01:0),k>3?C('#f8f4ec'):C('#e8e0d0'),{small:1});
    for(const [x,c] of [[2.38,C('#b8c8a0')],[2.52,C('#c8a868')]]){ ell(x,2.55,0.53,0.05,0.05,0.05,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>shd(c,lx<-0.3&&lz>0?1.45:1),{small:1}); cyl(x,2.55,0.014,0.57,0.64,M.glass,{small:1}); } }
  info('plank bench by the steps',90,'A plank on two stones: folded cloths, a quill, two little flasks.','elm, stone, linen');
})();

// =====================================================================================
// THE WITCH'S GREENHOUSE, part 5 (see part 1): the east side and the front. The glass case of three tiers round the tower's foot (a mortar and
// a dish of green powder, a gourd lantern, a purple crystal, a swirled glass ball; a sack, clover, a pumpkin, a dormouse asleep; a grey boot, a
// trowel, an iron lantern, sprouts); the hutch of drawers with old books stood in it and red books on top; the chameleon on its bonsai (it
// looks about: part 8); the flowering tree; the sill of the frosted window with a spider plant; the ladder against the wall and the trunk of
// tomes under it; the long glass cabinet on the east wall ending in a stone pillar; the iron plant stands; the little table with a cactus
// garden in pebbles; the white chair.
// =====================================================================================
(()=>{ const {C,shd,mix,hh,n1,sstep,seed,rr,item,box,cyl,ell,leafE,wood,pumpkin,pot,jar,bookLying,bookStand,lamp,TX,ZS,E1}=PGK, {PAL,WH}=GHS;
  const E={dk:C('#2d2311'),wd:C('#4f442e'),wdL:C('#685b42'),wdD:C('#1e170c'),glass:C('#d6dcd0'),shine:C('#f4f8f0'),clay:C('#b8683a'),clayL:C('#d08850'),clayD:C('#8a4a28'),
    sack:C('#c8b088'),sackD:C('#9a8460'),iron:C('#3a3e42'),ironL:C('#6a7076'),cream:C('#ece4d0'),bark:C('#8a8070'),barkD:C('#5a5248'),pink:C('#e05880'),pinkL:C('#f088a8'),
    cham:C('#3aa858'),chamL:C('#7ad870'),chamD:C('#1e6a38'),soil:C('#3a2a1c')};
  const info=(k,price,desc,mat)=>{ GHI[k]=[price,desc,mat]; };
  const leafy=(x,y,z,R,n,cols,sd,o)=>{ seed(sd); for(let i=0;i<n;i++){ const a=rr(0,6.28), d=Math.sqrt(rr(0,1))*R, zz=z+rr(-R*0.55,R*0.55)*Math.sqrt(1-(d/R)**2); leafE(x+Math.cos(a)*d,y+Math.sin(a)*d,zz,rr(0.05,0.08),rr(0.04,0.06),0.03,cols[Math.floor(rr(0,cols.length))],o); } };

  item('glass case round the tower');
  // three tiers on the tower's south face: dark frames, the glass a shine you see past, each tier's floor a dark board; the things in it
  { const x0=7.3,x1=9.7,y0=1.75,y1=2.4, T=[0,0.82,1.64,2.45], fr=(f,u,v,W,H)=>shd(E.dk,(v<1?1.3:1)*(u<1?1.15:1));
    for(const z of T)box(x0,y0,z,x1,y1,z+0.07,(f,u,v,W,H)=>f==='T'?shd(E.wd,0.75+0.1*hh(u>>2,v,3)):shd(E.wdL,v<1?1.25:0.9),{sh:z===0?1:0});
    for(const x of [x0,x1-0.07,(x0+x1)/2-0.035])box(x,y1-0.07,0,x+0.07,y1,T[3],fr,{small:1}); for(const x of [x0,x1-0.07])box(x,y0,0,x+0.07,y0+0.07,T[3],fr,{small:1});
    const pane=(a,b,c,d,z0,z1)=>box(a,b,z0,c,d,z1,(f,u,v,W,H,x,y,z)=>{ const s=(u+v*0.6)%26; return s<1.2||Math.abs(s-4)<0.5?E.shine:-1; },{small:1});
    for(let k=0;k<3;k++){ pane(x0+0.07,y1-0.02,x1-0.07,y1,T[k]+0.07,T[k+1]); pane(x0,y0+0.07,x0+0.02,y1-0.07,T[k]+0.07,T[k+1]); pane(x1-0.02,y0+0.07,x1,y1-0.07,T[k]+0.07,T[k+1]); }
    // top tier: a stone mortar, a white dish heaped with green powder, a gourd lantern (lit), a purple crystal, a swirled glass ball
    { const z=T[2]+0.07; cyl(7.75,2.05,0.13,z,z+0.14,(f,u,v,W,H)=>f==='T'?C('#4a4840'):shd(C('#9a968a'),v<1?1.2:1),{small:1},0.1);
      cyl(8.3,2.08,0.15,z,z+0.04,C('#e8e8e0'),{small:1}); ell(8.3,2.08,z+0.04,0.12,0.12,0.13,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>lz<0?-1:shd(C('#88c840'),(lx<-0.3?1.2:1)*(0.92+0.1*hh(Math.floor(lx*20),Math.floor(lz*20),3))),{small:1});
      ell(8.85,2.08,z+0.12,0.12,0.12,0.12,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ if(ly>0.3&&lz>-0.1&&lz<0.35&&Math.abs(lx)<0.35&&(Math.abs(lx)>0.12||lz<0.12))return E1|C('#ffd060'); const rib=Math.cos(Math.atan2(ly,lx)*8); return shd(C('#e88a28'),rib>0.7?0.8:1.05); },{small:1});
      cyl(8.85,2.08,0.015,z+0.23,z+0.29,C('#5a7a2a'),{small:1}); lamp(8.85,2.2,z+0.12,1.4,[1,0.7,0.3],0.5);
      for(const [dx,s] of [[0,1],[0.04,0.6]])box(9.3+dx-0.03*s,2.0-0.03*s,z,9.3+dx+0.03*s,2.0+0.03*s,z+0.28*s,(f,u,v,W,H)=>shd(u<W/2?C('#b090e8'):C('#7a50c0'),v<2?1.2:0.95),{small:1});
      ell(7.5,2.05,z+0.1,0.09,0.09,0.09,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ const s=Math.sin(Math.atan2(ly,lx)*2+lz*4); return s>0.4?C('#4060d0'):s<-0.4?C('#a050c0'):C('#e0d8f0'); },{small:1}); }
    // middle tier: a burlap sack, clover, a pumpkin, the dormouse curled asleep on a mat of straw
    { const z=T[1]+0.07; ell(7.65,2.05,z+0.2,0.16,0.14,0.2,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>shd((Math.floor(lx*14)+Math.floor(lz*14))%2?E.sack:E.sackD,lx<-0.3?1.15:1),{small:1});
      for(let i=0;i<9;i++)leafE(8.1+Math.cos(i*2.4)*0.12,2.05+Math.sin(i*2.4)*0.08,z+0.12+(i%3)*0.06,0.05,0.05,0.02,i%2?PAL.ivyL:PAL.ivy);
      pumpkin(8.7,2.05,z,0.2,0.26);
      box(9.05,1.9,z,9.55,2.25,z+0.02,C('#d8b860'),{small:1}); ell(9.3,2.08,z+0.07,0.09,0.07,0.06,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>lx>0.6&&lz>0.2?C('#c89070'):shd(C('#9a6a40'),lz>0.3?1.15:1),{small:1}); }
    // bottom tier: a grey boot, a little trowel, an iron lantern with a ring, sprouts in a tray
    { const z=0.07; box(7.5,1.95,z,7.65,2.15,z+0.3,C('#7a7e84'),{small:1}); box(7.5,1.95,z,7.85,2.15,z+0.08,C('#6a6e74'),{small:1});
      box(8.0,2.0,z,8.35,2.05,z+0.02,C('#8a9096'),{small:1}); box(8.33,2.0,z,8.45,2.05,z+0.025,C('#7a4a28'),{small:1});
      box(8.65,1.92,z,8.95,2.22,z+0.32,(f,u,v,W,H)=>{ if(f==='T')return E.iron; if(u<1.2||u>W-1.2||v<1.2||v>H-2)return shd(E.iron,1.1); return Math.abs(u-W/2)<0.6?E.iron:C('#c8c0a0'); },{small:1});
      box(8.75,2.05,z+0.32,8.85,2.09,z+0.42,(f,u,v,W,H)=>Math.abs(u-W/2)<0.8&&Math.abs(v-H/2)<1?-1:E.ironL,{small:1});
      box(9.05,1.9,z,9.55,2.25,z+0.06,C('#6a4a2a'),{small:1}); seed(161); for(let i=0;i<12;i++){ const x=rr(9.1,9.5), y=rr(1.95,2.2); cyl(x,y,0.006,z+0.06,z+0.14,PAL.ivyL,{small:1}); leafE(x,y,z+0.15,0.025,0.015,0.008,PAL.ivyLL); } } }
  info('glass case round the tower',950,'Three glass tiers round the tower\'s foot: powders, a gourd lantern, crystal, a pumpkin, a sleeping dormouse, a lantern, sprouts.','walnut, glass');

  item('hutch of drawers and old books');
  // dark wood beside the platform: drawers below with iron pulls, an open shelf of old books stood on end and one lying, a stack of red books and
  // a little silver-stoppered flask on top
  { const x0=6.7,x1=7.3,y0=0.1,y1=1.6,h=1.4, Wd=wood(E.wd,{seed:163,along:'u'});
    box(x0,y0,0,x1,y1,0.7,(f,u,v,W,H)=>{ if(f==='T')return shd(E.wdL,0.9); if(f!=='E')return shd(E.wd,0.85); if(u<1||u>W-1||v<1||v>H-1)return E.wdD; const row=Math.floor((v-1)/((H-2)/3)), rv=(v-1)-row*((H-2)/3);
      if(rv<0.8)return E.wdD; if(Math.abs(u-W/2)<2&&Math.abs(rv-((H-2)/3)/2)<0.8)return E.ironL; return Wd(f,u,v,W,H); },{sh:1});
    box(x0,y0,0.7,x0+0.05,y1,h,E.wdD); box(x0,y0,0.7,x1,y0+0.05,h,Wd); box(x0,y1-0.05,0.7,x1,y1,h,Wd); box(x0,y0,h-0.05,x1+0.02,y1,h,(f,u,v,W,H)=>f==='T'?shd(E.wdL,0.95+0.08*hh(u>>2,v,3)):shd(E.wdL,v<1?1.2:0.9));
    let y=y0+0.07; seed(165); for(const c of ['#5a4a3a','#6a3a2a','#3a3a2a','#7a5a3a','#4a2a1a'])if(y<y1-0.3){ const w=rr(0.08,0.12); bookStand(x0+0.08,y,0.7,x1-0.06,y+w,rr(0.48,0.6),C(c),'E'); y+=w+0.006; }
    bookLying(x0+0.08,y+0.02,0.7,x1-0.06,y1-0.08,0.08,C('#8a6a3a'),{spine:'E'});
    for(let k=0;k<4;k++)bookLying(x0+0.06+k*0.01,0.3+k*0.01,h+k*0.06,x1-0.08-k*0.01,0.75-k*0.01,0.06,C(k%2?'#8a2a28':'#a83830'),{spine:'E'});
    ell(7.0,1.2,h+0.07,0.06,0.06,0.07,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>shd(C('#c8ccd0'),lx<-0.3?1.3:0.95),{small:1}); cyl(7.0,1.2,0.015,h+0.13,h+0.2,C('#d8dce0'),{small:1}); ell(7.0,1.2,h+0.22,0.025,0.025,0.025,C('#e8ecf0'),{small:1}); }
  info('hutch of drawers and old books',360,'Drawers with iron pulls, old books stood on end, red books and a silver flask on top.','walnut, paper');

  item('chameleon on a bonsai');
  // a round flat stone, a clay pot, a twisting trunk, a crown of small round leaves; a green chameleon on a branch, curled tail, turret eyes
  { const x=10.2,y=2.35; cyl(x,y,0.36,0,0.06,(f,u,v,W,H)=>f==='T'?shd(PAL.flagD,0.9+0.1*hh(u>>2,v>>2,3)):shd(PAL.stD,1.1),{small:1});
    pot(x,y,0.06,0.26,0.4,E.clay); for(let k=0;k<10;k++){ const t=k/9; cyl(x+Math.sin(t*4)*0.07,y+Math.cos(t*3)*0.04,0.045-t*0.015,0.42+t*0.5,0.47+t*0.5,(f,u,v,W,H)=>shd(E.bark,(u%W)/W<0.3?1.2:0.85),{small:1}); }
    box(x-0.02,y-0.02,0.85,x+0.25,y+0.02,0.88,E.barkD,{small:1});
    leafy(x,y,1.12,0.34,70,[PAL.ivy,PAL.ivyL,PAL.ivyD,C('#3a8a3a')],167);
    ell(x+0.18,y,0.97,0.1,0.045,0.06,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ if(Math.abs(lz)<0.12&&lx<0.6)return E.chamD; return shd(lz>0.4?E.chamL:E.cham,(hh(Math.floor(lx*12),Math.floor(lz*10),5)<0.15?0.85:1)); },{small:1});
    ell(x+0.3,y,1.0,0.045,0.04,0.04,E.cham,{small:1}); ell(x+0.32,y+0.03,1.02,0.02,0.02,0.02,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>Math.hypot(lx,lz)<0.4&&ly>0.3?C('#1a1a10'):E.chamL,{small:1});
    for(let k=0;k<8;k++){ const a=k/7*4.5; ell(x+0.06-Math.cos(a)*0.06,y,0.92-Math.sin(a)*0.05-k*0.004,0.02,0.02,0.02,E.cham,{small:1}); } }
  info('chameleon on a bonsai',240,'A bonsai in a clay pot on a round stone, and a chameleon on its branch, watching.','clay, juniper');

  item('flowering tree');
  // a pale twisting trunk, a broad crown of dark leaves dotted with pink flowers, in a ribbed clay pot
  { const x=11.3,y=1.7; pot(x,y,0,0.3,0.48,E.clayD); for(let k=0;k<16;k++){ const t=k/15; cyl(x+Math.sin(t*3.5)*0.08,y+Math.cos(t*2.2)*0.05,0.05-t*0.02,0.48+t*1.1,0.56+t*1.1,(f,u,v,W,H)=>shd(E.bark,(u%W)/W<0.25?1.25:0.9),{small:1}); }
    leafy(x,y,1.9,0.6,150,[PAL.ivyD,PAL.ivy,C('#2a6a3a'),C('#3a7a3a')],169);
    seed(171); for(let i=0;i<30;i++){ const a=rr(0,6.28), d=Math.sqrt(rr(0,1))*0.58, z=1.9+rr(-0.35,0.35)*Math.sqrt(1-(d/0.6)**2); ell(x+Math.cos(a)*d,y+Math.sin(a)*d,z,0.035,0.035,0.03,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>Math.hypot(lx,ly)<0.3?C('#f0d060'):(lz>0.2?E.pinkL:E.pink),{small:1}); } }
  info('flowering tree',320,'Pale twisting trunk, a broad crown dotted pink.','clay, myrtle');

  item('window sill with a spider plant',{wall:1});
  { box(10.0,0,0.42,11.4,0.2,0.5,(f,u,v,W,H)=>f==='T'?shd(PAL.capL,0.95+0.08*hh(u>>2,v,3)):shd(PAL.cap,v<1?1.2:0.9),{wall:'N'});
    pot(10.55,0.11,0.5,0.1,0.14,E.clay); seed(173); for(let i=0;i<14;i++){ const a=rr(0,6.28), L=rr(0.15,0.3); for(let k=0;k<5;k++){ const t=k/4; leafE(10.55+Math.cos(a)*L*t,0.11+Math.sin(a)*L*t*0.7,0.66+Math.sin(t*2.4)*0.12,0.03,0.03,0.012,k>2?PAL.ivyLL:PAL.ivyL,{wall:'N'}); } } }
  info('window sill with a spider plant',45,'A stone sill under the frosted window, a spider plant on it.','stone, clay');

  item('ladder against the wall',{wall:1});
  { for(const dx of [0,0.42])for(let k=0;k<14;k++){ const t=k/13; box(11.25+dx,0.75-t*0.65,t*3.3,11.3+dx,0.8-t*0.65,t*3.3+0.28,(f,u,v,W,H)=>shd(C('#6a4a28'),u<1?1.25:0.92),{wall:'N',small:1}); }
    for(let r=1;r<10;r++){ const t=r/10; box(11.25,0.75-t*0.65,t*3.3,11.72,0.8-t*0.65,t*3.3+0.05,(f,u,v,W,H)=>shd(C('#7a5a30'),v<1?1.3:0.95),{wall:'N',small:1}); } }
  info('ladder against the wall',70,'An old wooden ladder leaning on the wall.','ash');

  item('trunk of old tomes');
  { const x0=10.9,x1=11.9,y0=0.6,y1=1.05; box(x0,y0,0,x1,y1,0.42,(f,u,v,W,H)=>{ if(f==='T')return shd(C('#6a4a28'),(Math.floor(u/6)%2?1:0.92)*(u<1||v<1?1.2:1)); if(Math.abs(v-H*0.3)<1||u<1.5||u>W-1.5)return shd(E.iron,1.1); return shd(C('#5a3a20'),0.95+0.08*hh(u>>2,v>>1,3)); },{sh:1});
    seed(175); let x=x0+0.06; for(const c of ['#6a5a48','#8a7a60','#5a4a3a','#7a6a50','#9a8a70']){ const w=rr(0.12,0.18); box(x,0.12,0.42,x+w,0.5,0.42+rr(0.5,0.7),(f,u,v,W,H)=>{ if(f==='T')return C('#e0d4b0'); if((v>3&&v<4.5)||(v>H-5&&v<H-3.5))return C('#c8a048'); return shd(C(c),u<1?1.2:1); },{small:1}); x+=w+0.01; } }
  info('trunk of old tomes',210,'An iron-banded trunk, old tomes stood on it against the wall.','oak, iron, leather');

  item('long glass cabinet on the east wall');
  // dark wood, glass doors in small panes you see through, shelves of jars and pots inside, a top of dark panels; it ends in a stone pillar
  { const x0=11.35,x1=11.95,y0=3.6,y1=5.5,h=1.55, Wd=wood(E.wd,{seed:177});
    box(x0,y0,0,x1,y1,0.12,(f,u,v,W,H)=>shd(E.wdD,v<1?1.3:1)); box(x1-0.04,y0,0,x1,y1,h,E.wdD);
    for(const y of [y0,y1-0.06])box(x0,y,0,x1,y+0.06,h,Wd,{sh:1});
    for(const z of [0.55,1.0])box(x0+0.04,y0+0.06,z,x1-0.04,y1-0.06,z+0.04,(f,u,v,W,H)=>shd(E.wdL,f==='T'?0.85:1.1));
    box(x0-0.04,y0-0.04,h,x1,y1+0.04,h+0.1,(f,u,v,W,H)=>{ if(f==='T'){ const p=Math.floor(v/18); return (v%18)<1.2||u<1.2||u>W-1.2?E.wdD:shd(E.wd,0.95+0.1*hh(p,0,3)); } return shd(E.wdL,v<1?1.3:0.9); });
    box(x0,y0+0.06,0.12,x0+0.03,y1-0.06,h,(f,u,v,W,H)=>{ if(u<1||v<1||u>W-1||v>H-1)return E.dk; const pu=((u%7)+7)%7, pv=((v%9)+9)%9; if(pu<0.7||pv<0.7)return E.dk; return (u+v)%30<1.5?E.shine:-1; },{small:1});
    seed(179); for(const z of [0.12,0.59,1.04])for(let y=y0+0.2;y<y1-0.15;y+=rr(0.26,0.36)){ const k=rr(0,1);
      if(k<0.4)jar(11.65,y,z,rr(0.06,0.09),rr(0.14,0.24),C(['#c89030','#6a9a3a','#a04040','#d8c8a0'][Math.floor(rr(0,4))]),{label:1});
      else if(k<0.7){ pot(11.65,y,z,0.09,0.12,E.clay); leafy(11.65,y,z+0.2,0.1,10,[PAL.ivyL,PAL.ivy],Math.floor(y*100)); }
      else bookStand(11.5,y,z,11.85,y+0.08,0.3,C('#6a3a2a'),'W'); }
    box(11.4,y1,0,11.98,5.92,1.75,(f,u,v,W,H,x,y,z)=>f==='T'?shd(PAL.capL,(u<1||v<1)?1.15:0.95):GHS.stoneAt((f==='E'||f==='W'?y:x)*TX,z*ZS,181,false),{sh:1}); }
  info('long glass cabinet on the east wall',780,'Glass doors in small panes, shelves of jars and potted cuttings; a stone pillar at its end.','walnut, glass, stone');

  item('iron plant stands');
  // two black iron stands for pots: a round tray on three curled legs, and a long one by the east wall
  { const ir=(f,u,v,W,H)=>shd(E.iron,(u%W)/W<0.25?1.4:1);
    const round=(x,y,h,r)=>{ cyl(x,y,r,h,h+0.04,(f,u,v,W,H)=>f==='T'?shd(E.iron,0.8):E.ironL,{small:1}); for(const a of [0.3,2.4,4.5]){ for(let k=0;k<6;k++){ const t=k/5; box(x+Math.cos(a)*r*(0.7+t*0.3)-0.015,y+Math.sin(a)*r*(0.7+t*0.3)-0.015,h*(1-t)-0.05,x+Math.cos(a)*r*(0.7+t*0.3)+0.015,y+Math.sin(a)*r*(0.7+t*0.3)+0.015,h*(1-t)+0.12,ir,{small:1}); } } };
    round(4.5,9.3,0.55,0.26); round(3.7,9.45,0.32,0.2);
    box(10.6,9.25,0.55,11.9,9.75,0.6,(f,u,v,W,H)=>f==='T'?(Math.floor(u/3)%2?E.iron:E.ironL):E.ironL,{small:1}); for(const [a,b] of [[10.65,9.3],[11.8,9.3],[10.65,9.65],[11.8,9.65]])box(a,b,0,a+0.05,b+0.05,0.55,ir,{small:1});
    box(10.7,9.3,0.18,11.85,9.7,0.21,E.iron,{small:1}); }
  info('iron plant stands',140,'Black iron stands for pots: two round ones on curled legs, a long one.','iron');

  item('little table with a cactus garden');
  // a small square table, a wide wooden tray on it full of pebbles, a prickly pear with its pads and golden spines
  { const x0=7.6,x1=8.5,y0=8.95,y1=9.65,h=0.5; for(const [a,b] of [[x0+0.04,y0+0.04],[x1-0.1,y0+0.04],[x0+0.04,y1-0.1],[x1-0.1,y1-0.1]])cyl(a+0.03,b+0.03,0.03,0,h,(f,u,v,W,H)=>shd(E.wd,Math.sin(v*0.7)>0.4?1.25:0.9),{small:1});
    box(x0,y0,h-0.04,x1,y1,h,(f,u,v,W,H)=>f==='T'?shd(E.wdL,0.9):shd(E.wd,v<1?1.2:0.9),{sh:1});
    box(x0+0.05,y0+0.05,h,x1-0.05,y1-0.05,h+0.1,(f,u,v,W,H,x,y,z)=>{ if(f==='T'){ const p=hh(Math.floor(x*TX/2.5),Math.floor(y*TX/2.5),5); return shd(p<0.3?C('#8a7a68'):p<0.7?C('#6a5a48'):C('#a89880'),0.9+0.15*hh(Math.floor(x*TX),Math.floor(y*TX),6)); } return shd(C('#8a6a3a'),v<1?1.2:1); },{small:1});
    seed(183); const pad=(x,y,z,r,a)=>ell(x,y,z,r*Math.abs(Math.cos(a))+0.02,r*Math.abs(Math.sin(a))+0.02,r*1.25,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ if(hh(Math.floor(lx*7),Math.floor(lz*7),9)<0.1)return C('#f0d060'); return shd(C('#9ab840'),(lx<-0.2?1.2:1)*(lz>0.5?1.1:1)); },{small:1});
    for(const [dx,dy,z,r,a] of [[0,0,0.2,0.1,0.3],[0.12,0.02,0.36,0.08,1.2],[-0.1,0.05,0.33,0.08,2.0],[0.04,-0.06,0.48,0.07,0.6],[-0.16,-0.05,0.18,0.08,2.6],[0.2,0.1,0.18,0.07,1.6]])pad(8.05+dx,9.3+dy,h+0.1+z,r,a); }
  info('little table with a cactus garden',150,'A tray of pebbles on a little table, a prickly pear catching the light on its spines.','pine, stone, cactus');

  item('white chair');
  { const x=2.4,y=9.3, wt=(f,u,v,W,H)=>shd(E.cream,(u<1?1.1:1)*(hh(u>>1,v>>1,3)<0.06?0.82:1));
    for(const [a,b] of [[x-0.2,y-0.2],[x+0.14,y-0.2],[x-0.2,y+0.14],[x+0.14,y+0.14]])box(a,b,0,a+0.06,b+0.06,0.45,wt,{small:1});
    box(x-0.22,y-0.22,0.45,x+0.22,y+0.22,0.5,(f,u,v,W,H)=>f==='T'?C('#a8c8d0'):wt(f,u,v,W,H),{sh:1});
    box(x+0.14,y-0.22,0.5,x+0.2,y+0.22,1.05,(f,u,v,W,H)=>Math.abs(u-W/2)>2.5&&v>3&&v<H-3&&Math.abs(v-H/2)>2?-1:wt(f,u,v,W,H),{small:1}); }
  info('white chair',60,'A white painted chair, a pale blue seat; the plants have it now.','pine');
})();

// =====================================================================================
// THE WITCH'S GREENHOUSE, part 6 (see part 1): the window seat (owner, 13 Oct 2026: "make the windows curved and deepseated so you can sit on the
// window seal", "curtains, relaxing vibes"). The west wall's arched window set deep in a stone alcove: jambs standing out from the wall, an arched
// stone head; in it a seat with a thick cushion, pillows, a knitted blanket, an open book and a little teapot, a candle lantern; warm string lights
// round the arch; plum velvet curtains tied back with gold cord either side. A footstool in front: you step up onto it and into the seat (its
// floors: stands, 30-walking). The lantern's flame, the steam from the teapot's spout and the dust in the window's light move (part 8).
// =====================================================================================
(()=>{ const {C,shd,mix,hh,n1,sstep,seed,rr,item,box,cyl,ell,leafE,wood,pot,lamp,ZS,TX,E1}=PGK, {PAL,stoneAt}=GHS;
  const Y0=7.45, Y1=9.05, D=0.68, AZ=2.75, TOP=3.8, SEAT=16/ZS, STOOL=8/ZS;
  const V={vel:C('#5a2a4a'),velL:C('#7a3a62'),velD:C('#3a1630'),gold:C('#c8a048'),goldL:C('#e8c868'),cush:C('#c8a878'),cushL:C('#e0c898'),cushD:C('#9a7a50'),
    pil1:C('#6a8a6a'),pil2:C('#c86a4a'),pil3:C('#e8dcc0'),knit:C('#d8c8a8'),knitD:C('#b8a080'),knitR:C('#a84a3a'),wd:C('#6a4a2a'),wdL:C('#8a6a3a')};
  item('window seat with cushions',{stands:[[0.25,Y0+0.05,D,Y1-0.05,16],[D,7.85,D+0.38,8.65,8]]});
  // the alcove: two stone jambs standing out of the wall, and the arched head between them (open under its arch)
  const st=(f,u,v,W,H,x,y,z)=>f==='T'?shd(PAL.capL,(u<1||v<1)?1.15:0.95):shd(stoneAt((f==='E'||f==='W'?y:x)*TX,z*ZS,191,false),(f==='S'||f==='N')?0.86:1);
  box(0,Y0-0.25,0,D,Y0,TOP,st,{sh:1}); box(0,Y1,0,D,Y1+0.25,TOP,st,{sh:1});
  box(0,Y0,AZ,D,Y1,TOP,(f,u,v,W,H,x,y,z)=>{ if(f==='T')return shd(PAL.capL,0.95); const mid=(Y0+Y1)/2, hw=(Y1-Y0)/2, t=(y-mid)/hw, ah=AZ+(TOP-0.35-AZ)*Math.sqrt(Math.max(0,1-t*t));
    if(z<ah)return -1; if(z<ah+0.12&&f==='E'){ const an=Math.atan2(z-AZ,y-mid), vb=Math.floor(an/Math.PI*11); return shd(vb%2?PAL.capL:PAL.cap,Math.abs(an*11/Math.PI-vb-0.5)>0.42?0.7:1); }   // its voussoirs
    return st(f,u,v,W,H,x,y,z); },{sh:1});
  // the seat: a stone front with an oak lip; a thick cushion (piping, buttons), the pillows against the jambs, the blanket folded at one end
  box(0.02,Y0,0,D,Y1,SEAT-0.12,(f,u,v,W,H,x,y,z)=>{ if(f==='T')return V.wd; if(z>SEAT-0.2)return shd(V.wdL,v<1?1.25:1); return shd(stoneAt(y*TX,z*ZS,193,false),1.05); });
  box(0.04,Y0+0.02,SEAT-0.12,D-0.02,Y1-0.02,SEAT,(f,u,v,W,H)=>{ if(f==='T'){ const b=((u%16)+16)%16, c=((v%16)+16)%16; if(Math.hypot(b-8,c-8)<1)return V.cushD; const s=Math.min(u,v,W-u,H-v);
      return shd(s<1.2?V.cushD:V.cush,(s<2.5?1.1:1)*(0.95+0.06*n1(u*0.2+v*0.13,5))); } return shd(V.cush,v<1.2?1.15:v>H-1.2?0.8:0.95); });
  const pillow=(x,y,z,rx,ry,rz,c,pat)=>ell(x,y,z,rx,ry,rz,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ let k=(lx<-0.2&&lz>0.1?1.15:lx>0.5?0.82:1)*(lz<-0.6?0.85:1);
    if(pat&&(Math.floor((ly+1)*5)+Math.floor((lz+1)*5))%2)k*=0.88; if(Math.abs(Math.hypot(ly,lz)-0.82)<0.04)k*=0.8; return shd(c,k); },{small:1});
  pillow(0.2,Y0+0.28,SEAT+0.2,0.12,0.22,0.2,V.pil1,1); pillow(0.24,Y0+0.55,SEAT+0.16,0.1,0.18,0.16,V.pil3,0); pillow(0.2,Y1-0.3,SEAT+0.19,0.12,0.2,0.19,V.pil2,0);
  for(let k=0;k<3;k++)box(0.12+k*0.01,Y1-0.62+k*0.02,SEAT+k*0.05,D-0.08-k*0.01,Y1-0.42-k*0.02,SEAT+0.05+k*0.05,(f,u,v,W,H)=>{ const r=Math.floor(v/2)%5===0||Math.floor(u/2)%6===0; return shd(r?V.knitR:((Math.floor(u)+Math.floor(v))%2?V.knit:V.knitD),f==='T'?1:0.85); },{small:1});   // the blanket, folded
  for(let i=0;i<5;i++)box(0.62,Y1-0.6+i*0.04,SEAT-0.25,0.66,Y1-0.58+i*0.04,SEAT+0.12,V.knitR,{small:1});                                                    // its fringe over the edge
  box(0.3,8.05,SEAT,0.58,8.45,SEAT+0.03,(f,u,v,W,H)=>{ if(f!=='T')return C('#3a5a7a'); if(Math.abs(v-H/2)<0.6)return C('#c8bc98'); return Math.floor(u)%3===0&&u>2&&u<W-2&&Math.abs(v-H/2)>2?C('#8a7a60'):C('#f0e8d0'); },{small:1});   // a book left open
  ell(0.48,8.68,SEAT+0.07,0.06,0.06,0.06,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>shd(C('#d86a3a'),lx<-0.3&&lz>0?1.35:lx>0.5?0.8:1),{small:1});   // a little teapot, the lid on
  cyl(0.48,8.68,0.035,SEAT+0.12,SEAT+0.14,C('#b85a2a'),{small:1}); ell(0.48,8.68,SEAT+0.15,0.012,0.012,0.012,C('#e8d0a0'),{small:1});
  for(let k=0;k<4;k++)box(0.53+k*0.015,8.66,SEAT+0.06+k*0.012,0.55+k*0.015,8.7,SEAT+0.08+k*0.012,C('#d86a3a'),{small:1});   // its spout
  // the candle lantern on the sill: an iron frame, glass sides, a candle (its flame moves: part 8)
  { const x=0.18,y=8.4,z=SEAT; box(x-0.07,y-0.07,z,x+0.07,y+0.07,z+0.03,PAL.iron,{small:1}); box(x-0.07,y-0.07,z+0.24,x+0.07,y+0.07,z+0.27,PAL.iron,{small:1});
    for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])box(x+a*0.065-0.008,y+b*0.065-0.008,z+0.03,x+a*0.065+0.008,y+b*0.065+0.008,z+0.24,PAL.iron,{small:1});
    ell(x,y,z+0.31,0.05,0.05,0.04,PAL.iron,{small:1}); box(x-0.01,y-0.01,z+0.35,x+0.01,y+0.01,z+0.4,PAL.ironL,{small:1});
    cyl(x,y,0.025,z+0.03,z+0.12,C('#f0e8d0'),{small:1}); box(x-0.06,y-0.06,z+0.03,x+0.06,y+0.06,z+0.24,()=>-1,{small:1});
    lamp(x+0.2,y,z+0.15,2.6,[1,0.7,0.38],0.95); }
  pot(0.15,Y1-0.15,SEAT,0.07,0.1,C('#b8683a')); for(let i=0;i<7;i++)leafE(0.15+Math.cos(i*2.6)*0.06,Y1-0.15+Math.sin(i*2.6)*0.06,SEAT+0.16+(i%3)*0.04,0.04,0.04,0.015,i%2?PAL.ivyL:PAL.ivy);
  // warm string lights round the arch's head: little bulbs on a dark wire, lit
  { const mid=(Y0+Y1)/2, hw=(Y1-Y0)/2; for(let i=0;i<=16;i++){ const a=Math.PI*i/16, y=mid-Math.cos(a)*hw*0.95, z=AZ-0.1+Math.sin(a)*(TOP-0.45-AZ), c=i%3===0?C('#ffd890'):i%3===1?C('#ffb870'):C('#fff0c0');
      box(D-0.03,y-0.012,z-0.04,D,y+0.012,z,C('#2a2420'),{small:1}); ell(D-0.015,y,z-0.06,0.018,0.018,0.025,E1|c,{small:1}); }
    lamp(D+0.3,mid,AZ+0.3,2.2,[1,0.78,0.48],0.6); }
  // the curtains: plum velvet, deep folds, hung from a brass rod across the alcove's mouth, tied back with gold cord at the seat's height
  { box(D-0.04,Y0-0.3,TOP-0.3,D,Y1+0.3,TOP-0.26,(f,u,v,W,H)=>shd(V.gold,v<1?1.3:0.9),{small:1}); for(const y of [Y0-0.32,Y1+0.28])ell(D-0.02,y+0.02,TOP-0.28,0.03,0.03,0.03,V.goldL,{small:1});
    const panel=(yOut,dir)=>{ for(let z=0.58;z<TOP-0.32;z+=0.07){ const tie=1.55, w=z<tie?0.18+0.22*sstep(tie,0.6,z):0.12+0.24*sstep(tie,TOP-0.4,z), y0=dir>0?yOut:yOut-w, y1=dir>0?yOut+w:yOut;
        box(D-0.1,y0,z,D+0.02,y1,z+0.07,(f,u,v,W,H,x,y)=>{ const fold=Math.sin((y-yOut)*TX*0.9+z*2); let k=fold>0.55?1.22:fold<-0.55?0.72:1; if(f!=='E')k*=0.8; if(z<0.66&&v>H-2)return V.gold; return shd(fold>0.8?V.velL:V.vel,k); },{small:1}); }
      box(D-0.12,dir>0?yOut:yOut-0.2,1.5,D+0.04,dir>0?yOut+0.2:yOut,1.58,(f,u,v,W,H)=>shd(V.gold,(Math.floor(u)%3?1.1:0.8)),{small:1});   // the tie-back
      ell(D+0.03,yOut+dir*0.1,1.42,0.025,0.025,0.06,V.goldL,{small:1}); };   // its tassel
    panel(Y0-0.3,1); panel(Y1+0.3,-1); }
  // the footstool to step up by: a low oak stool with a woven seat
  { const x0=D,x1=D+0.38,y0=7.85,y1=8.65; for(const [a,b] of [[x0+0.03,y0+0.03],[x1-0.07,y0+0.03],[x0+0.03,y1-0.07],[x1-0.07,y1-0.07]])box(a,b,0,a+0.04,b+0.04,STOOL-0.04,V.wd,{small:1});
    box(x0,y0,STOOL-0.05,x1,y1,STOOL,(f,u,v,W,H)=>f==='T'?shd((Math.floor(u/2)+Math.floor(v/2))%2?C('#c8a868'):C('#a88a50'),(u<1||v<1)?1.15:1):shd(V.wdL,v<1?1.2:1)); }
  GHI['window seat with cushions']=[1250,'An arched window set deep in the stone: a seat with a thick cushion, pillows, a blanket, a book, a teapot, a candle lantern, string lights and velvet curtains. Step up and stay a while.','stone, oak, velvet, wool'];
})();

// =====================================================================================
// THE WITCH'S GREENHOUSE, part 8 (see part 1): what moves, each its own moving picture (the kit's moving: 24 draws it about 8 times a second, only
// on screen): the cauldron (bubbles swelling and bursting on the brew, steam rising and thinning, a green spark wandering over it), the rain
// barrel's water (real water), the hourglass (its sand running down, over a minute, and turned again), the
// frog (it blinks and puffs its throat), the canary (it hops along its perch, turns, now and then flutters), the chameleon (its turret eye roves;
// now and then its tongue flicks out); the cauldron's brew and the barrel's rain are real water (DEEPW: the owner's hard rule, real liquids only), the window seat's candle flame and tea steam and the dust in its window's light by day, a mouse that dashes along the south wall now and then.
// And the firefly bottles' light: three small lamps where the bottles hang (the bottles themselves are 47-physics-4).
// =====================================================================================
(()=>{ const {C,shd,hh,sstep,item,box,lamp,put,ZS}=PGK, moving=(n,d)=>GHMOVE.push([n,d]);   // (put on once the catalog has them: part 9)
  // the room for each moving picture: invisible boxes over the thing, so its picture is big enough to draw in
  item('bubbling cauldron'); box(4.5,4.4,0.86,5.5,5.4,2.4,()=>-1,{small:1});
  item('canary in a tall cage'); box(4.85,7.75,0.9,5.15,8.05,1.2,()=>-1,{small:1});
  item('chameleon on a bonsai'); box(10.45,2.3,0.95,10.8,2.42,1.08,()=>-1,{small:1});
  item('firefly bottle hooks',{wall:1});
  // three iron hooks under the rafter where the bottles hang, and the bottles' glow (green-gold, soft, on at night as all the lights are)
  for(const [x,z] of [[2.2,2.11],[3.4,2.29],[4.6,1.98]]){ box(x-0.02,1.1,3.82,x+0.02,1.14,3.88,C('#2e3236'),{small:1}); lamp(x,1.12,z,2.4,[0.8,1,0.42],0.75); }
  GHI['firefly bottle hooks']=[20,'Three iron hooks under the rafter; the bottles of fireflies hang from them.','iron'];

  const L=(S,lx,ly,lz,c)=>{ const l=S.light(lx,ly,lz); return [c[0]*l[0],c[1]*l[1],c[2]*l[2]]; };
  const roundWater=PGK.water;   // (real water in a round thing: the kit's since 16 Oct 2026, the Cozy Den's bowl and tea use it too)
  const BREW=roundWater(5.0,4.9,0.42,0.86,0,{height:0.35,chop:0.6,calm:1.4}), RAIN=roundWater(1.95,4.1,0.26,0.8,2,{height:0.2}), POKE=[];
  // the cauldron
  moving('bubbling cauldron',(D,W,H,ox,oy,t,K,S)=>{ const x=5.0,y=4.9,z=0.86;
    BREW(D,W,H,ox,oy,t,K,S,o=>{ while(POKE.length){ const [a,b]=POKE.shift(); o.poke(a,b,0.02,0.08); } });   // the brew: real water; each bubble that bursts sends its ripple across it
    for(let i=0;i<7;i++){ const per=1.6+hh(i,0,3)*1.8, ph=((t+hh(i,1,3)*9)%per)/per, k=Math.floor((t+hh(i,1,3)*9)/per), a=hh(i,k,4)*6.28, d=Math.sqrt(hh(i,k,5))*0.33;
      const bx=x+Math.cos(a)*d, by=y+Math.sin(a)*d, [cx,cy]=S.scr(bx,by,z,ox,oy,K), r=(ph<0.8?ph/0.8*1.6:0)*K, rr=ph>=0.8?(ph-0.8)/0.2*2.6*K:0;
      if(r>0)for(let u=-Math.ceil(r);u<=r;u++)for(let v=-Math.ceil(r);v<=0;v++){ const q=(u*u)/(r*r)+(v*v)/(r*r*0.6); if(q>1)continue; put(D,W,H,cx+u,cy+v,q>0.6?[120,200,70]:u<0&&v<-r*0.4?[220,255,170]:[160,230,90]); }
      if(ph>=0.8&&ph<0.86&&POKE.length<8)POKE.push([bx-x+0.42,by-y+0.42]);
      if(rr>0)for(let s=0;s<16;s++){ const an=s/16*6.283; put(D,W,H,cx+Math.cos(an)*rr,cy+Math.sin(an)*rr*0.5,[190,250,130],Math.round(200*(1-(ph-0.8)/0.2))); } }
    const [sx,sy]=S.scr(x,y,z,ox,oy,K), top=1.3*ZS*K;
    for(let s=0;s<4;s++)for(let r=0;r<top;r+=1){ const f=r/top, sway=Math.sin(f*4-t*1.2+s*1.7)*(2+f*8)*K+(s-1.5)*5*K*(0.4+f), a=Math.max(0,(1-f)*(0.45+0.55*Math.sin(f*7-t*1.8+s*2))*95);
      if(a<10||hh(r,s,Math.floor(t*5))<0.3)continue; const c=L(S,x,y,z+f,[214,232,204]); put(D,W,H,sx+sway,sy-r,c,a); }
    const T=t*0.35, gx=x+0.25*Math.sin(T*2.1)+0.1*Math.sin(T*5.3), gy=y+0.22*Math.cos(T*1.7), gz=z+0.35+0.2*Math.sin(T*3.1), [px,py]=S.scr(gx,gy,gz,ox,oy,K);   // the spark
    for(let k=0;k<6;k++){ const [qx,qy]=S.scr(x+0.25*Math.sin((T-k*0.03)*2.1)+0.1*Math.sin((T-k*0.03)*5.3),y+0.22*Math.cos((T-k*0.03)*1.7),z+0.35+0.2*Math.sin((T-k*0.03)*3.1),ox,oy,K); put(D,W,H,qx,qy,[150,255,120],Math.round(180*(1-k/6))); }
    for(let u=-K;u<K;u++)for(let v=-K;v<K;v++)put(D,W,H,px+u,py+v,[220,255,190]); });
  // the rain barrel's water: real water (still, clear), the light on it moving as the breeze stirs it
  moving('rain barrel',(D,W,H,ox,oy,t,K,S)=>RAIN(D,W,H,ox,oy,t,K,S,null));
  // the hourglass: the top bulb's sand going down, a thread of it falling, the heap below growing; turned over once it's run (a minute)
  moving('brass hourglass',(D,W,H,ox,oy,t,K,S)=>{ const hx=7.15,hy=7.45,h=0.75, f=(t%62)/60; if(f>1)return; const sand=[224,200,144];
    const bulb=(zc,fill,up)=>{ const rz=0.075; for(let k=-1;k<=1;k+=2/14){ const zz=zc+k*rz*0.95, w=0.06*Math.sqrt(Math.max(0,1-k*k)); const level=up?(k<-1+2*fill):(k<-1+2*fill);
        if(!level)continue; const [ax,ay]=S.scr(hx-w*0.7,hy+w*0.7,zz,ox,oy,K), [bx]=S.scr(hx+w*0.7,hy-w*0.7,zz,ox,oy,K); for(let px=Math.min(ax,bx);px<=Math.max(ax,bx);px++)put(D,W,H,px,ay,L(S,hx,hy,zz,sand)); } };
    bulb(h+0.255,(1-f)*0.8,1); bulb(h+0.105,f*0.75,0);
    if(f<0.98){ const [ax,ay]=S.scr(hx,hy,h+0.18,ox,oy,K), [,by]=S.scr(hx,hy,h+0.105-0.07+f*0.11,ox,oy,K); for(let py=ay;py<by;py++)put(D,W,H,ax,py,L(S,hx,hy,h+0.15,sand)); } });
  // the frog: a blink every few seconds, its throat swelling and going down
  moving('cream bench with a frog in a gold cage',(D,W,H,ox,oy,t,K,S)=>{ const cx=8.95,cy=2.75,cz=0.58;
    if((t%4.3)<0.18)for(const s of [-1,1]){ const [ex,ey]=S.scr(cx+0.04,cy+s*0.045,cz+0.05,ox,oy,K); for(let u=-K;u<=K;u++)for(let v=-K;v<=K;v++)put(D,W,H,ex+u,ey+v,L(S,cx,cy,cz,[72,160,56])); }
    const p=Math.max(0,Math.sin(t*1.9))**3; if(p>0.05){ const [tx,ty]=S.scr(cx+0.07,cy,cz-0.02,ox,oy,K), r=(0.8+p*2)*K; for(let u=-r;u<=r;u++)for(let v=-r*0.8;v<=r*0.8;v++)if((u*u)/(r*r)+(v*v)/(r*r*0.64)<=1)put(D,W,H,tx+u,ty+v,L(S,cx,cy,cz,[214,224,150])); } });
  // the canary: hops between three places on its perch, faces one way or the other, now and then flutters its wings
  moving('canary in a tall cage',(D,W,H,ox,oy,t,K,S)=>{ const cx=5.0,cy=7.9,z=0.965, k=Math.floor(t/1.7), spot=[-0.08,0,0.08][Math.floor(hh(k,0,7)*3)], hop=(t%1.7)<0.15, face=hh(k,1,7)<0.5?1:-1, flut=hh(k,2,7)<0.15&&Math.floor(t*10)%2;
    const [bx,by]=S.scr(cx+spot,cy,z+(hop?0.06:0),ox,oy,K), Y=[250,220,60], YD=[220,180,40], O=[240,140,40], E=[20,20,20], px=(u,v,c)=>{ for(let a=0;a<K;a++)for(let b=0;b<K;b++)put(D,W,H,bx+(u*face)*K+a,by+v*K+b,L(S,cx,cy,z+0.1,c)); };
    for(let u=-2;u<=1;u++)for(let v=-3;v<=-1;v++)px(u,v,Y); px(2,-4,Y); px(1,-4,Y); px(1,-5,Y); px(2,-5,Y); px(2,-4,E); px(3,-4,O); px(-3,-2,YD); px(-4,-2,YD); px(-4,-1,YD);
    if(flut){ px(-1,-5,YD); px(0,-5,YD); px(-1,-4,YD); } else{ px(-1,-2,YD); px(0,-2,YD); }
    px(0,0,[200,140,60]); px(-1,0,[200,140,60]); });
  // the chameleon: its turret eye roving, a tongue that flicks out at nothing every so often
  moving('chameleon on a bonsai',(D,W,H,ox,oy,t,K,S)=>{ const x=10.52,y=2.38,z=1.02, a=t*0.7+Math.sin(t*1.9)*1.2, [ex,ey]=S.scr(x,y,z,ox,oy,K);
    for(let u=0;u<K;u++)for(let v=0;v<K;v++)put(D,W,H,ex+Math.round(Math.cos(a)*0.8*K)+u,ey+Math.round(Math.sin(a)*0.6*K)+v,[20,24,16]);
    const p=t%9; if(p<0.35){ const len=Math.sin(p/0.35*Math.PI)*0.28; for(let s=0;s<=len*24*K;s++){ const [tx,ty]=S.scr(10.52+s/(24*K),2.35,1.0-s/(24*K)*0.2,ox,oy,K); put(D,W,H,tx,ty,[230,110,140]); } } });

  // the window seat: the lantern's candle flame, the teapot's steam, and dust in the window's light by day
  moving('window seat with cushions',(D,W,H,ox,oy,t,K,S)=>{ const SEAT=16/ZS;
    { const [fx,fy]=S.scr(0.18,8.4,SEAT+0.12,ox,oy,K), ht=(3+Math.floor(3*hh(Math.floor(t*8),0,5)))*K, sw=Math.round(Math.sin(t*9)*0.6*K);   // the flame
      for(let r=0;r<ht;r++){ const f=r/ht, w=Math.max(0,Math.round((1-f)*1.2*K*(f<0.3?f/0.3:1))); for(let u=-w;u<=w;u++)put(D,W,H,fx+u+(f>0.5?sw:0),fy-r,f<0.35?[255,240,180]:f<0.7?[255,196,90]:[240,130,48]); } }
    { const [sx,sy]=S.scr(0.6,8.68,SEAT+0.11,ox,oy,K), top=0.5*ZS*K, l=S.light(0.6,8.68,SEAT+0.4);   // the steam from the teapot's spout
      for(let s2=0;s2<2;s2++)for(let r=0;r<top;r++){ const f=r/top, a=Math.max(0,(1-f)*(0.5+0.5*Math.sin(f*9-t*2.3+s2))*100); if(a<12||hh(r,s2,Math.floor(t*4))<0.25)continue; put(D,W,H,sx+Math.sin(f*5-t*1.6+s2*2)*(1+f*4)*K,sy-r,[236*l[0],232*l[1],228*l[2]],a); } }
    const m=((CLOCK%1440)+1440)%1440, day=sstep(6.5*60,8*60,m)*sstep(19.5*60,18*60,m); if(day<0.05)return;
    for(let i=0;i<22;i++){ const T=t*0.05+i*0.37, u=(hh(i,0,11)+0.08*Math.sin(T*1.3+i)+0.02*T)%1, w=(hh(i,1,11)+0.03*T)%1, d=0.15+1.3*hh(i,2,11);
      const [px,py]=S.scr(d,7.5+u*1.5,0.7+(1-w)*2.6-d*0.6,ox,oy,K), tw=0.5+0.5*Math.sin(t*2.7+i*1.9); if(tw<0.3)continue; put(D,W,H,px,py,[255,246,224],Math.round(150*tw*day)); } });
  // a mouse: every so often it dashes along the south wall's foot, stops to sniff, dashes on, gone under the shelves
  moving('greenhouse wall, south',(D,W,H,ox,oy,t,K,S)=>{ const per=37, ph=t%per; if(ph>9)return; const n=Math.floor(t/per), dir=hh(n,0,9)<0.5?1:-1, s=ph<3?ph/3*0.5:ph<4.5?0.5:ph<7.5?0.5+(ph-4.5)/3*0.5:1;
    const x=dir>0?0.9+s*10.2:11.1-s*10.2, y=9.82, [mx,my]=S.scr(x,y,0,ox,oy,K), [nx]=S.scr(x+dir*0.1,y,0,ox,oy,K), fd=nx>mx?1:-1, run=ph<3||(ph>4.5&&ph<7.5), b=run&&Math.floor(t*12)%2;
    const px=(u,v,c)=>{ for(let a=0;a<K;a++)for(let q=0;q<K;q++)put(D,W,H,mx+u*fd*K+a,my+(v-b*0.5)*K+q,L(S,x,y,0.1,c)); }, BR=[130,90,60], BD=[90,60,40];
    for(let u=-2;u<=1;u++){ px(u,-1,BR); px(u,0,BD); } px(2,-1,BR); px(3,0,[200,150,140]); px(1,-2,[200,150,140]); px(2,-1,[20,20,20]); for(let u=-3;u>=-6;u--)px(u,(u%2?0:1),[180,130,120]); });
})();

// =====================================================================================
// THE WITCH'S GREENHOUSE, the catalog (see part 1): the department, a page for every piece (a real-world price, the owner's rule), and
// "Preset Witch's Greenhouse 1", every piece where the room has it. Made after all its parts.
// =====================================================================================
(()=>{ CAT_DEPTS.push(['greenhouse','Witch\'s Greenhouse']);
  const info=(no,name,price,desc,mat)=>({no,name,price,desc,mat}), I={}, add=(k,price,desc,mat)=>{ I[k]=info('WG-'+(101+Object.keys(I).length),k[0].toUpperCase()+k.slice(1),price,desc,mat); };
  add('greenhouse floor',1400,'Dark checker tiles and mossy flagstone paths, leaves and pebbles where they fell.','clay tile, stone');
  add('greenhouse wall, west',2200,'Old stone, an oak band with iron studs, the window seat\'s arched window, the carved arch.','stone, oak, iron, glass');
  add('greenhouse wall, north',2600,'Old stone and tall leaded windows, a frosted arched window at its end.','stone, oak, iron, glass');
  add('greenhouse wall, east',1900,'Old stone, a window and the way in.','stone, oak, iron, glass');
  add('greenhouse wall, south',1900,'Old stone and two leaded windows, ivy at one end.','stone, oak, iron, glass');
  add('greenhouse sunroom',3200,'A little stone room through the arch, all sun through its small panes; a picture of a rabbit.','stone, glass');
  add('stone platform',1800,'Big stone blocks along the north wall, flagstones on top. You can climb up.','stone');
  add('stone steps to the platform',420,'Three worn treads up to the platform, moss at their ends.','stone');
  add('platform railing',380,'Dark turned posts and a handrail. A spider lives in it.','walnut');
  add('crockery shelves under the platform',260,'A jug, an owl jar, a crock, amber beads, books, blueberries, a window box.','walnut, stoneware, glass');
  add('rafters over the greenhouse',900,'Dark oak beams across the open top, iron straps where they cross.','oak, iron');
  add('stone tower with ivy',2400,'A square stone tower in the corner, under ivy.','stone');
  add('rubble on the wall tops',0,'What the wall dropped: sandstone lumps and broken brick.','stone, brick');
  add('ivy hanging off the walls',60,'Ivy, flowering, trailing down from the wall tops.','ivy');
  for(const [k,v] of Object.entries(GHI))add(k,...v);
  PGK.register('greenhouse',I); for(const [n,d] of GHMOVE)PGK.moving(n,d);
  PRESETS['Preset Witch\'s Greenhouse 1']=PGK.roomPieces('greenhouse').map(([k,x,y])=>[k,+x.toFixed(3),+y.toFixed(3),0]); })();   // (and the catalog's own things that belong here: 26-zzzzzzzzzzzzzzzzzzzzzz-greenhouse)

};
export {pageGreenhouse};
