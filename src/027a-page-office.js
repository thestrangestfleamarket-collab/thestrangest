// THE OFFICE KIT: the old game's page room, its pieces as catalog kinds and its preset.
import {CAT_DEPTS} from './014-gamekit.js';
import {PRESETS, STOREK} from './023-west-kits.js';
const pageOffice=()=>{ '@pagerooms'; const PGK=STOREK.cottage.PGK;   // the page rooms' kit lives in 027's block and is published on the kit object
// =====================================================================================
// THE OFFICE, EXACT (owner, 12 Oct 2026: the second picture's room as the page built it, no person; "exact scenes ... in central park"):
// the page's own code for the room, every piece where the page put it (the carpet, the walls with the big window and the hall door, the
// sill and its case, the filing cabinets, the hanging lamp, the desk, the chair, the rug of rings, the arc lamp, the fish, the plants, the
// sofa between its lamps, the poster, the photo board, the sideboard and globe, the map, the chair, the credenza, the coat stand, the
// clock), each a catalog item (department Office) through 23-w-page-rooms-0-kit; the walls nearest the eye cut down; the sheers' hems
// stir; its lamps come on at night. "Preset Office 1" sets them all out; placed on Central Park's lawn (26-zzzzzzzzzzzzzzzz-page-rooms).
// =====================================================================================
(()=>{ const {C,shd,mix,hh,n1,sstep,rnd,rr,seed,wood,item,scene,box,cyl,ell,lamp,candle,jar,bookLying,bookStand,leafE,pot,fern,pothos,pumpkin,vase,flowers,frameArt,drapes,beads,wallClock,E1,E2,SKY,FIRE,GLOW,TX}=PGK; const self={};
  const LX=15, LY=12, WH=4.2; scene('office',LX,LY,WH,[{wall:'E',a0:5.42,a1:6.88,z1:2.48}]);
  const PO={
  wall:C('#3c3649'),wallL:C('#4a435a'),wallD:C('#2b2736'),pil:C('#4a2a33'),pilL:C('#5e3640'),trim:C('#2e1c22'),trimL:C('#4a2e34'),
  wain:C('#4f2226'),wainL:C('#6a3030'),wainD:C('#36161a'),
  carpet:C('#22383f'),carpetD:C('#1a2c33'),
  desk:C('#b9782e'),deskL:C('#d29340'),deskD:C('#7c4a1c'),mahog:C('#57221f'),mahogL:C('#6e2e28'),mahogD:C('#3a1513'),
  chair:C('#2c3a6c'),chairL:C('#3e4f8a'),chairD:C('#1c2548'),
  metal:C('#8b9fb3'),metalL:C('#a9bccd'),metalD:C('#5d6e82'),
  sofa:C('#5a2232'),sofaL:C('#702c40'),sofaD:C('#3e1520'),
  shade:C('#a9bfc8'),shadeD:C('#7e98a4'),sage:C('#b4c6a6'),gourd:C('#3f6b5c'),gourdL:C('#5a8a76'),
  rug:C('#b29a68'),rugL:C('#dccb93'),rugD:C('#8a714c'),rugO:C('#c4742a'),rugOD:C('#9a5520'),
  sheer:C('#aebccb'),sheerL:C('#c8d4de'),sheerD:C('#8a9aac'),
  paper:C('#e6e2d4'),paperD:C('#bdb8a6'),box:C('#c9ccc6'),
  wood:C('#4a2e26'),woodL:C('#5e3c30'),woodD:C('#33201a'),
  phone:C('#c24a44'),phoneL:C('#e0706a'),phoneD:C('#8a2a28'),
  leaf:C('#2a5a3a'),leafL:C('#3c7a4c'),leafD:C('#1c3e28'),
};
// a few 3x5 letters for the poster
const GLYPH={L:'100100100100111',O:'111101101101111',S:'111100111001111',T:'111010010010010',C:'111100100100111',A:'010101111101101',' ':'000000000000000'};
const glyphAt=(s,u,v,scale)=>{ const gx=Math.floor(u/scale), gy=Math.floor(v/scale); const ci=Math.floor(gx/4), cx=gx%4; if(ci<0||ci>=s.length||cx>2||gy<0||gy>4)return false; return GLYPH[s[ci]][gy*3+cx]==='1'; };


  const build=()=>{
    const LXo=LX, LYo=LY;
    // carpet, walls
  item('office floor',{floor:1});
    box(0,0,-0.45,LX,LY,0,(f,u,v,W,H)=>{ if(f!=='T')return shd(PO.carpetD,0.7);
      let k=0.95+0.07*hh(Math.floor(u),Math.floor(v),2)+0.04*n1(u*0.08,3)*n1(v*0.08,4); if((Math.floor(u)+Math.floor(v))%2===0)k*=0.98; return shd(PO.carpet,k); },{floor:1,occ:0});
    const WIN={a0:4.45,a1:7.35,z0:1.4,z1:3.6,ma:5.9,mz:2.5};
    const inWin=(a,z)=>a>WIN.a0&&a<WIN.a1&&z>WIN.z0&&z<WIN.z1;
    const onMullion=(a,z)=>Math.abs(a-WIN.ma)<0.045||Math.abs(z-WIN.mz)<0.04;
    const wallP=(kind,seed,opening)=>(f,u,v,W,H,x,y,z)=>{
      if(f==='T')return (v<2||v>H-2)?PO.trim:PO.trimL;
      if(opening){ const o=opening(f,u,v,x,y,z); if(o!==undefined)return o; }
      if(v<4)return v<1.2?PO.trimL:PO.trim;                                       // crown moulding
      if(z<0.12)return shd(PO.trim,1.1);                                           // skirting
      if(kind==='W'&&z<1.25){ if(z>1.17)return shd(PO.wainL,1.1); if(z>1.12)return PO.wainD; const m=u%9; if(m<1)return PO.wainD; if(m<2)return PO.wainL; return shd(PO.wain,0.92+0.1*hh(Math.floor(u/9),Math.floor(v/12),seed)); }
      if(kind!=='W'){ const m=((u/TX)%4+4)%4; if(m<0.38)return shd(PO.pil,m<0.06?1.25:m>0.32?0.72:1+0.05*hh(Math.floor(u),Math.floor(v/6),seed)); }
      let k=0.95+0.05*hh(Math.floor(u/2),Math.floor(v/3),seed)+0.05*n1(u*0.04,seed)*n1(v*0.03,seed+1); k*=1-0.14*sstep(0.55,1,v/H);
      return shd(PO.wall,k); };
    const wallW=wallP('W',3,(f,u,v,x,y,z)=>{ if(f!=='E')return; // the window
      if(y>WIN.a0-0.1&&y<WIN.a1+0.1&&z>WIN.z0-0.1&&z<WIN.z1+0.1){ if(inWin(y,z))return onMullion(y,z)?(Math.abs(y-WIN.ma)<0.015||Math.abs(z-WIN.mz)<0.012?PO.woodL:PO.wood):SKY|0x101010;
        return (y<WIN.a0-0.07||y>WIN.a1+0.07||z<WIN.z0-0.07||z>WIN.z1+0.07)?PO.woodD:PO.wood; } });
    const wallE=wallP('E',5,(f,u,v,x,y,z)=>{ if(f!=='W')return; // the door to the hall: frosted glass lit from behind
      if(y>5.35&&y<6.95&&z<2.55){ if(y<5.42||y>6.88||z>2.48)return PO.woodD; if(y>5.6&&y<6.7&&z>1.35&&z<2.3)return (y<5.64||y>6.66||z<1.39||z>2.26)?PO.wood:E1|mix(0xa89a6a,0xc8b888,hh(Math.floor(u/2),Math.floor(v/2),3)*0.4);
        if(Math.abs(y-6.62)<0.05&&Math.abs(z-1.05)<0.05)return C('#c8a858'); if(y>5.6&&y<6.7&&z>0.25&&z<1.15)return (y<5.64||y>6.66||z<0.29||z>1.11)?PO.woodD:PO.woodL; return PO.wood; } });
  item('office wall, west');
    box(-0.25,-0.25,-0.45,0,LY,WH,wallW,{wallOf:'W',occ:1});
  item('office wall, north');
    box(-0.25,-0.25,-0.45,LX,0,WH,wallP('N',7),{wallOf:'N',occ:1});
  item('office wall, east');
    box(LX,-0.25,-0.45,LX+0.25,LY+0.25,WH,wallE,{wallOf:'E',occ:1});
  item('office wall, south');
    box(-0.25,LY,-0.45,LX+0.25,LY+0.25,WH,wallP('S',9),{wallOf:'S',occ:1});
    const hallL=lamp(LX-0.3,6.15,2.0,2.4,[1,0.85,0.6],0.45,0);          // light from the hall through the door's glass

  item('window sill with a case');
    // ---------- the window: sill, the case on it, the curtain rod (the sheer curtains are movers) ----------
    box(0,WIN.a0-0.15,WIN.z0-0.12,0.24,WIN.a1+0.15,WIN.z0-0.04,wood(PO.wood,{seed:4}),{wall:'W'});
    box(0.03,6.72,WIN.z0-0.04,0.21,7.16,WIN.z0+0.17,(f,u,v,W,H)=>{ if(f==='T')return (u<1||v<1)?C('#f0f0ec'):C('#d8dad6'); if(v>H*0.45&&v<H*0.6)return C('#8a9098'); return shd(C('#dcdeda'),(u<1||v<1)?1.08:(u>W-1||v>H-1)?0.8:1); },{wall:'W',small:1});
    box(0.1,6.86,WIN.z0+0.17,0.14,7.02,WIN.z0+0.22,C('#6a6e74'),{wall:'W',small:1});
    box(0.05,3.15,3.86,0.1,8.65,3.92,PO.woodD,{wall:'W',small:1}); ell(0.08,3.12,3.89,0.04,0.05,0.05,PO.woodL,{wall:'W',small:1}); ell(0.08,8.68,3.89,0.04,0.05,0.05,PO.woodL,{wall:'W',small:1});

  item('filing cabinets with boxes');
    // ---------- back corner: filing cabinets, boxes, papers ----------
    const cab=(x0,y0,x1,y1,h,n,seed)=>box(x0,y0,0,x1,y1,h,(f,u,v,W,H)=>{ if(f==='T')return shd(PO.metal,(u<1||v<1)?1.15:(u>W-1||v>H-1)?0.8:1.04);
        if(f!=='E')return shd(PO.metal,v<1?1.1:0.92); const dh=H/n, dv=v%dh, di=Math.floor(v/dh);
        if(dv<1.1||u<1.2||u>W-1.2)return PO.metalD; if(dv<2)return PO.metalL;
        if(Math.abs(u-W/2)<4&&Math.abs(dv-dh*0.3)<1.6)return (Math.abs(u-W/2)<3&&Math.abs(dv-dh*0.3)<0.8)?PO.paper:PO.metalD;   // label holder
        if(Math.abs(u-W/2)<5&&Math.abs(dv-dh*0.55)<0.7)return C('#3a4250');                                                 // handle
        return shd(PO.metal,0.96+0.06*hh(Math.floor(u/3),di,seed)); });
    cab(0.08,0.25,0.9,1.05,2.45,4,1); cab(0.08,1.1,0.9,1.9,2.05,3,2);
    box(0.9,1.2,1.25,1.4,1.8,1.55,(f,u,v,W,H)=>f==='T'?(hh(Math.floor(u/3),Math.floor(v),5)<0.5?PO.paper:PO.paperD):shd(PO.metal,u>W-1.5?0.8:1)); // an open drawer, papers in it
    for(let k=0;k<5;k++)box(0.95+k*0.08,1.25,1.55,0.99+k*0.08,1.75,1.62+0.03*(k%2),PO.paper,{small:1});
    box(0.15,0.3,2.45,0.85,1.0,2.75,(f,u,v,W,H)=>f==='T'?(u>3&&u<W-3&&v>3&&v<H-3?C('#8a7a5a'):C('#c4b490')):shd(C('#bca888'),(v<1?1.15:1)*(Math.abs(u-W/2)<2&&v>3&&v<6?0.8:1)),{});   // box on top, lid open
    box(0.12,0.28,2.75,0.18,1.0,2.95,C('#c4b490'),{small:1}); for(let k=0;k<4;k++)box(0.3+k*0.12,0.45,2.7,0.34+k*0.12,0.85,2.84+0.05*(k%2),PO.paper,{small:1});
    box(0.2,1.2,2.05,0.8,1.8,2.2,PO.box,{}); box(0.25,1.25,2.2,0.75,1.75,2.3,shd(PO.box,1.05),{}); box(0.3,1.35,2.3,0.72,1.7,2.32,PO.paper,{small:1});

  item('hanging lamp, sage');
    // ---------- the hanging lamp over the chair ----------
    box(1.24,4.39,3.45,1.27,4.42,WH,C('#1a1a1a'),{small:1,solid:0});
    const ceilL=lamp(1.25,4.4,3.0,5.2,[1,0.8,0.55],1.9,0,{sw:1,on:false});
    cyl(1.25,4.4,0.32,3.08,3.45,(f,u,v,W,H)=>GLOW|shd(PO.sage,(Math.floor(u/5)%2?0.9:1.02)*(v>H-1.5?0.75:1)),{lr:ceilL,small:1,solid:0},0.05);
    ell(1.25,4.4,3.1,0.06,0.06,0.05,C('#f0e8c8'),{small:1,solid:0});

  item('office desk');
    // ---------- the desk ----------
    { const x0=1.55,x1=3.15,y0=2.6,y1=6.2,h=1.07;
      box(x0,y0,h-0.1,x1,y1,h,(f,u,v,W,H)=>{ if(f==='T'){ let k=0.95+0.06*hh(Math.floor(v/2),0,3)+0.04*Math.sin(u*0.25+Math.floor(v/2)); if(u<1||v<1)k*=1.18; if(u>W-1.5||v>H-1.5)k*=0.78; return shd(PO.desk,k); } return shd(PO.deskD,v<1?1.25:1); });
      box(x0+0.05,y0+0.05,h-0.25,x1-0.05,y1-0.05,h-0.1,PO.mahog);
      box(x1-0.18,y0+0.15,0.22,x1-0.08,y1-0.15,h-0.25,(f,u,v,W,H)=>{ if(f!=='E')return PO.mahogD; if(u<2||u>W-2||v<1.5||v>H-1.5)return PO.mahogD; if(u<3||v<2.5)return PO.mahogL; return shd(PO.mahog,0.95+0.06*hh(Math.floor(u/4),Math.floor(v/6),5)); });
      for(const [lx,ly] of [[x0+0.06,y0+0.06],[x1-0.16,y0+0.06],[x0+0.06,y1-0.16],[x1-0.16,y1-0.16]]) box(lx,ly,0,lx+0.1,ly+0.1,h-0.25,(f,u,v,W,H)=>shd(PO.mahog,u<1?1.25:0.95),{});
      // blotter, phone and its cord, file boxes, scattered papers and maps
      box(1.85,3.55,h,2.75,5.05,h+0.008,(f,u,v,W,H)=>(u<1.5||v<1.5||u>W-1.5||v>H-1.5)?C('#3e4a54'):shd(C('#6c7c86'),0.96+0.06*hh(Math.floor(u/2),Math.floor(v/2),4)),{small:1});
      ell(2.62,5.78,h+0.06,0.16,0.14,0.07,(f,u,v,W,H,x,y,z,lx,ly,lz)=>lz>0.55&&lx*lx+ly*ly<0.2?C('#e8e0d0'):(lz>0.55&&lx*lx+ly*ly<0.3?PO.phoneD:PO.phone),{small:1});
      box(2.48,5.6,h+0.1,2.58,5.96,h+0.15,PO.phone,{small:1}); ell(2.53,5.62,h+0.15,0.06,0.06,0.04,PO.phoneL,{small:1}); ell(2.53,5.94,h+0.15,0.06,0.06,0.04,PO.phoneL,{small:1});
      for(let k=0;k<9;k++){ const z=h-0.02-k*0.045; box(3.12+0.03*Math.sin(k*1.9),5.62+0.03*Math.cos(k*1.9),z-0.03,3.15+0.03*Math.sin(k*1.9),5.65+0.03*Math.cos(k*1.9),z,C('#3a1a1a'),{small:1,solid:0}); }
      for(let k=0;k<4;k++)box(2.6+k*0.13,5.6,h,2.64+k*0.13,5.64,h+0.01,C('#3a1a1a'),{small:1});
      const fb=(z,hb,c)=>box(2.0,2.75,z,2.9,3.4,z+hb,(f,u,v,W,H)=>{ if(f==='T')return shd(c,(u<1||v<1)?1.12:(u>W-1||v>H-1)?0.8:1); if(v<1)return shd(c,1.12); if(Math.abs(u-W*0.5)<3&&Math.abs(v-H*0.5)<1.5)return PO.paper; return shd(c,0.95); },{small:1});
      fb(h,0.17,PO.box); fb(h+0.17,0.15,C('#d4d6d0')); box(2.05,2.8,h+0.32,2.85,3.35,h+0.35,PO.paper,{small:1});
      seed(88); for(const [px,py,w,d,c] of [[1.75,3.1,0.45,0.35,'#5a4a32'],[2.3,4.95,0.5,0.4,'#3e3a2a'],[1.95,5.2,0.4,0.45,'#6a5a3a'],[2.55,4.55,0.35,0.3,'#e0dccc'],[2.7,3.6,0.38,0.42,'#4a4432'],[1.7,4.9,0.3,0.32,'#d8d2c0'],[2.25,5.55,0.32,0.3,'#5a4e36']])
        box(px,py,h+0.008+rnd()*0.006,px+w,py+d,h+0.016+rnd()*0.006,(f,u,v,W,H)=>{ const cc=C(c); if(c[1]==='e'||c[1]==='d')return (Math.floor(v)%3===0&&u>2&&u<W-2)?PO.paperD:cc; return shd(cc,0.85+0.3*n1(u*0.2+v*0.1,px*10)); },{small:1});
    }
  item('blue executive chair');
    // the executive chair behind it
    { const cx=1.0,cy=4.4;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) box(cx+Math.min(0,dx*0.3)-0.03,cy+Math.min(0,dy*0.3)-0.03,0.05,cx+Math.max(0,dx*0.3)+0.03,cy+Math.max(0,dy*0.3)+0.03,0.1,C('#1e1e24'),{});
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) ell(cx+dx*0.3,cy+dy*0.3,0.04,0.04,0.04,0.04,C('#141418'),{small:1});
      cyl(cx,cy,0.045,0.1,0.45,C('#2a2a30'));
      box(cx-0.3,cy-0.3,0.45,cx+0.3,cy+0.3,0.62,(f,u,v,W,H)=>shd(PO.chair,f==='T'?((Math.abs(u-W/2)<0.6||Math.abs(v-H/2)<0.6)?0.8:1.05):(v<1?1.2:0.9)));
      box(cx-0.38,cy-0.3,0.6,cx-0.22,cy+0.3,1.6,(f,u,v,W,H)=>{ if(f==='T')return PO.chairL; const bx=((u%7)-3.5)**2+((v%9)-4.5)**2<1.2; return shd(PO.chair,(bx?0.7:1)*(u<1.2?1.25:u>W-1.2?0.75:1)*(1.05-0.15*v/H)); });
      ell(cx-0.3,cy,1.6,0.09,0.3,0.1,PO.chairL,{small:1});
      for(const s of [-1,1]){ box(cx-0.25,cy+s*0.32-0.04,0.62,cx+0.2,cy+s*0.32+0.04,0.82,PO.chairD,{small:1}); box(cx-0.2,cy+s*0.32-0.06,0.82,cx+0.22,cy+s*0.32+0.06,0.88,PO.chairL,{small:1}); }
    }
    // dumbbell and the fallen thermos
  item('dumbbell');
    box(3.38,6.58,0.11,3.86,6.62,0.15,C('#4a4a50'),{small:1});
    for(const x of [3.44,3.8]) ell(x,6.6,0.13,0.035,0.13,0.13,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>Math.abs(lx)>0.6?C('#3a3a40'):(ly*ly+lz*lz<0.08?C('#6a6a70'):C('#1e1e22')),{small:1});
  item('fallen thermos');
    ell(4.95,3.2,0.07,0.22,0.065,0.065,(f,u,v,W,H,x,y,z,lx,ly,lz)=>lx>0.62?C('#2a2a2e'):(lz>0.5?C('#d8dce0'):C('#9aa0a6')),{small:1});

  item('rug of rings',{flat:1});
    // ---------- the rug: rings round two discs ----------
    box(4.2,3.6,0,10.6,6.8,0.02,(f,u,v,W,H)=>{ if(f!=='T')return PO.rugD; if(u<1.5||v<1.5||u>W-1.5||v>H-1.5)return PO.rugD;
      const cs=[[W*0.3,H*0.62],[W*0.72,H*0.38]]; let best=1e9,ci=0; for(let k=0;k<2;k++){ const d=Math.hypot(u-cs[k][0],v-cs[k][1]); if(d<best){best=d;ci=k;} }
      const R=H*0.24; if(best<R)return shd(PO.rugO,best>R-1.5?0.85:0.97+0.05*hh(Math.floor(u/2),Math.floor(v/2),3));
      const ring=Math.floor((best-R)/(H*0.075)); const side=(u-cs[ci][0])*(ci?1:-1)+(v-cs[ci][1])*(ci?-1:1);
      if(ring<6&&side>-H*0.15){ return ring%2?shd(PO.rugL,0.97+0.05*hh(u>>1,v>>1,4)):shd(PO.rugD,1.05); }
      return shd(PO.rug,0.95+0.07*hh(u>>1,v>>1,5)); },{solid:0,occ:0});

    // ---------- the front-left: filing cabinet, arc lamp, fish, plant, books and papers ----------
  item('filing cabinet, a drawer out');
    cab(0.08,9.7,0.9,10.6,1.85,3,3);
    box(0.9,9.8,0.62,1.35,10.5,0.95,(f,u,v,W,H)=>f==='T'?(hh(Math.floor(u/3),Math.floor(v),6)<0.6?PO.paper:PO.paperD):shd(PO.metal,u>W-1.5?0.8:1));
    box(0.25,9.85,1.85,0.75,10.45,1.88,(f,u,v,W,H)=>Math.abs(v-H/2)<0.7?PO.paperD:(Math.floor(u)%3===0&&u>2&&u<W-2?C('#9a9688'):PO.paper),{small:1});
    box(0.25,9.85,1.82,0.75,10.45,1.85,C('#3a5a8a'),{small:1});
  item('fish plaque');
    box(0,9.72,2.4,0.05,10.78,2.98,(f,u,v,W,H,x,y,z)=>{ const ey=(y-10.25)/0.53,ez=(z-2.69)/0.29; const d=ey*ey+ez*ez; if(d>1)return -1; if(d>0.8)return PO.woodD;
      const fy=(y-10.25)/0.42, fz=(z-2.69)/0.12; if(fy*fy+fz*fz<1||(fy>0.85&&fy<1.2&&Math.abs(fz)<(fy-0.8)*2.4))return (fz<-0.2?C('#a8b8a0'):fz>0.6?C('#4a5a50'):C('#7a9088')); return PO.wood; },{wall:'W'});
  item('arc floor lamp');
    // the arc floor lamp
    cyl(0.65,8.95,0.2,0,0.06,C('#5a4a3a')); cyl(0.65,8.95,0.025,0.06,2.6,(f,u,v)=>shd(C('#7a6650'),(u%8<2)?1.25:1),{solid:0});
    for(let k=0;k<=14;k++){ const t=k/14, x=0.65+0.8*t, y=8.95-0.65*t, z=2.6+0.35*Math.sin(Math.PI*t*0.9)-0.18*t; box(x-0.025,y-0.025,z-0.025,x+0.025,y+0.025,z+0.025,C('#7a6650'),{small:1,solid:0}); }
    const arcL=lamp(1.45,8.3,1.95,4.2,[1,0.78,0.52],1.8,0,{sw:1,on:false});
    cyl(1.45,8.3,0.32,2.05,2.38,(f,u,v,W,H)=>{ const sc=Math.floor(u/6)%2; if(v>H-1.5&&sc)return -1; return GLOW|shd(PO.sage,(Math.floor(u/6)%2?0.88:1.02)*(v<1.2?1.12:1)); },{lr:arcL,small:1,solid:0},0.06);
  item('rubber plant');
    // the rubber plant at the far left
    cyl(0.6,11.35,0.24,0,0.42,(f,u,v,W,H)=>f==='T'?PO.woodD:shd(C('#3a3a3e'),v<2?1.2:1),{},0.28);
    seed(5); for(let i=0;i<20;i++){ const a=i*2.3,d=rr(0.05,0.35); leafE(0.6+Math.cos(a)*d,11.35+Math.sin(a)*d,0.6+i*0.07,0.16,0.12,0.05,i%3?PO.leaf:PO.leafL,{solid:0}); }
  item('potted plant');
    // the plant at the front
    cyl(10.8,10.4,0.2,0,0.34,(f,u,v,W,H)=>f==='T'?PO.woodD:shd(C('#4a3a34'),v<2?1.2:(Math.floor(u)%10===0?0.85:1)),{},0.24);
    seed(9); for(let i=0;i<16;i++){ const a=i*2.4,d=rr(0.05,0.32),z=0.45+rr(0,0.55); leafE(10.8+Math.cos(a)*d,10.4+Math.sin(a)*d,z,0.13,0.13,0.06,i%3?PO.leaf:PO.leafL,{solid:0}); }
  item('books and papers on the floor',{flat:1});
    // books and papers on the floor
    bookLying(1.7,9.2,0,2.15,9.62,0.07,C('#2e4a7a'),{spine:'E'}); bookLying(1.74,9.25,0.07,2.1,9.58,0.06,C('#c8c4b4'),{spine:'E'});
    for(const [px,py,w,d] of [[2.0,9.5,0.45,0.38],[2.3,9.15,0.4,0.42],[1.55,9.7,0.36,0.3],[2.45,9.6,0.35,0.3]]) box(px,py,0,px+w,py+d,0.008,(f,u,v,W,H)=>(Math.floor(v)%3===0&&u>2&&u<W-2)?PO.paperD:PO.paper,{small:1,solid:0});

  item('tufted sofa');
    // ---------- the sofa and its two lamps ----------
    { const x0=4.4,x1=8.9,y0=8.85,y1=9.85;
      for(const [lx,ly] of [[x0+0.1,y0+0.1],[x1-0.16,y0+0.1],[x0+0.1,y1-0.16],[x1-0.16,y1-0.16]]) box(lx,ly,0,lx+0.06,ly+0.06,0.14,PO.woodD,{small:1});
      box(x0,y0,0.14,x1,y1,0.5,(f,u,v,W,H)=>shd(PO.sofaD,v<1.2?1.2:1));
      box(x0+0.2,y0+0.02,0.5,x1-0.2,y1-0.28,0.62,(f,u,v,W,H)=>{ if(f==='T'){ const seg=Math.floor(u/(W/3)); return shd(PO.sofaL,(u%(W/3)<1?0.7:1)*(v<1?1.15:1)*(0.97+0.04*hh(seg,0,2))); } return shd(PO.sofa,v<1?1.2:0.95); });
      box(x0+0.2,y1-0.3,0.5,x1-0.2,y1,1.18,(f,u,v,W,H,x,y,z)=>{ if(f==='T')return PO.sofaL; const ch=(u%7.5); let k=ch<1?0.65:ch<2?1.2:1-0.12*Math.abs(ch-4.5)/3; if(v<2)k*=1.15; if(Math.abs(x-(x0+x1)/2)<0.03)k*=0.6; return shd(PO.sofa,k*(1-0.12*v/H)); });
      for(const ax of [x0,x1-0.2]) box(ax,y0,0.5,ax+0.2,y1,0.85,(f,u,v,W,H)=>{ if(f==='T')return PO.sofaL; const ch=(u%7.5); return shd(PO.sofa,(ch<1?0.65:ch<2?1.15:1)*(v<1.5?1.15:1)); });
      const sideTable=(tx,ty)=>{ for(const [lx,ly] of [[tx,ty],[tx+0.52,ty],[tx,ty+0.52],[tx+0.52,ty+0.52]]) box(lx,ly,0,lx+0.06,ly+0.06,0.72,PO.woodD,{});
        box(tx-0.02,ty-0.02,0.72,tx+0.6,ty+0.6,0.78,wood(PO.wood,{seed:7}),{}); box(tx+0.02,ty+0.02,0.18,tx+0.56,ty+0.56,0.22,PO.woodD,{});
        const cx=tx+0.29,cy=ty+0.29; ell(cx,cy,0.92,0.15,0.15,0.14,(f,u,v,W,H,x,y,z,lx,ly,lz)=>shd(PO.gourd,lz>0.4?1.25:1),{small:1}); ell(cx,cy,1.1,0.08,0.08,0.07,PO.gourdL,{small:1});
        cyl(cx,cy,0.025,1.15,1.2,C('#b0a070'),{small:1});
        const L=lamp(cx,cy,1.32,3.6,[1,0.8,0.56],1.7,0,{sw:1,on:false});
        cyl(cx,cy,0.18,1.18,1.47,(f,u,v,W,H)=>f==='T'?shd(PO.shadeD,0.8):GLOW|shd(PO.shade,(v<1.2||v>H-1.2)?0.85:(Math.floor(u/3)%2?0.97:1.03)),{lr:L,small:1}); };
      item('side table with a lamp'); sideTable(3.72,8.95); item('side table with a lamp, second'); sideTable(9.02,8.95);
    }

    // ---------- the right wall: poster, photo board, sideboard with globe and lamp, framed map, chair, credenza ----------
  item('LOST CAT poster');
    box(1.12,0,2.75,2.58,0.03,4.05,(f,u,v,W,H)=>{ if(f!=='S')return PO.paperD; if(u<1||v<1||u>W-1||v>H-1)return PO.paperD;
      if(v>H-9){ if(v>H-8&&v<H-2.5&&glyphAt('LOST CAT',u-2.5,v-(H-7.5),1))return PO.paper; return C('#b23a34'); }
      const cx=W/2, cy=H*0.42, dx=(u-cx)/9, dy=(v-cy)/8; const head=dx*dx+dy*dy<1, ear=(v<cy-5&&v>cy-11&&(Math.abs(u-cx-5)<(v-(cy-11))*0.6||Math.abs(u-cx+5)<(v-(cy-11))*0.6));
      if(head||ear){ if(Math.abs(dy+0.15)<0.12&&Math.abs(Math.abs(dx)-0.4)<0.14)return C('#2a2a2a'); return C('#7a7f8c'); }
      return shd(PO.paper,0.94+0.06*hh(Math.floor(u/3),Math.floor(v/3),2)); },{wall:'N'});
  item('photo board');
    box(3.3,0,3.0,5.3,0.05,4.0,(f,u,v,W,H)=>{ if(f!=='S')return C('#151418'); if(u<2||v<2||u>W-2||v>H-2)return C('#1c1a20');
      const cu=Math.floor((u-2)/8), cv=Math.floor((v-2)/8), mu=(u-2)%8, mv=(v-2)%8; if(mu>1&&mu<7&&mv>1&&mv<7){ const q=hh(cu,cv,6); if(mv<2.2&&Math.abs(mu-4)<0.6)return C('#c03030'); return q<0.4?C('#c8c4b8'):q<0.7?C('#6a6870'):C('#9a948a'); } return C('#3a3530'); },{wall:'N'});
  item('sideboard with a globe');
    { const x0=3.4,x1=6.8,y0=0.05,y1=0.85,Wd=wood(PO.wood,{seed:21,along:'u'});
      for(const lx of [x0+0.08,x1-0.14]) for(const ly of [y0+0.06,y1-0.12]) box(lx,ly,0,lx+0.06,ly+0.06,0.26,PO.woodD,{});
      box(x0,y0,0.26,x1,y1,0.32,Wd); box(x0,y0,0.98,x1,y1,1.05,Wd); box(x0,y0,0.32,x0+0.06,y1,0.98,Wd); box(x1-0.06,y0,0.32,x1,y1,0.98,Wd); box(5.08,y0,0.32,5.12,y1,0.98,Wd);
      box(x0,y0,0.32,x1,y0+0.05,0.98,PO.woodD); box(x0+0.06,y0+0.05,0.62,x1-0.06,y1,0.66,Wd);
      seed(31); const cols=['#3a3a6a','#5a4a8a','#2a4a5a','#4a3a6a','#6a5a9a','#2a3a5a','#7a7aa8','#3a5a6a'];
      for(const [a,b] of [[x0+0.08,5.06],[5.14,x1-0.08]]) for(const z of [0.32,0.66]){ let x=a; let i=0; while(x<b-0.08){ const w=rr(0.06,0.1); if(rnd()<0.12){ x+=w; continue; } bookStand(x,0.15,z,x+w,0.8,rr(0.22,0.29),C(cols[(i++)%cols.length]),'S'); x+=w+0.004; } }
      // globe
      cyl(3.85,0.45,0.13,1.05,1.08,PO.woodD); cyl(3.85,0.45,0.022,1.08,1.2,PO.woodD,{small:1});
      ell(3.85,0.45,1.45,0.26,0.26,0.26,(f,u,v,W,H,x,y,z,lx,ly,lz)=>{ if(Math.abs(lx)<0.05)return C('#4a3424'); const land=n1(lx*4+3,1)*n1(ly*4+lz*3,2)+0.3*n1(lz*5,3); return land>0.42?C('#8a7a52'):C('#c8bc96'); },{small:1});
      box(3.83,0.43,1.7,3.87,0.47,1.74,C('#4a3424'),{small:1});
      box(4.7,0.3,1.05,5.18,0.66,1.07,(f,u,v,W,H)=>f==='T'?((v>3&&v<5&&u>2&&u<W-3)?C('#e8e8f0'):(Math.abs(u-W*0.6)<3&&Math.abs(v-H*0.6)<3)?C('#c8d8e8'):C('#3a5a8c')):C('#2a3a5c'),{small:1});
      cyl(5.75,0.45,0.1,1.05,1.09,PO.gourd); ell(5.75,0.45,1.19,0.07,0.07,0.1,PO.gourdL,{small:1});
      const sbL=lamp(5.75,0.45,1.48,3.4,[1,0.8,0.56],1.6,0,{sw:1,on:false});
      cyl(5.75,0.45,0.24,1.32,1.6,(f,u,v,W,H)=>f==='T'?shd(C('#4a7a8a'),0.7):GLOW|shd(C('#6a9cac'),(Math.floor(u/4)%2?0.92:1.03)*(v>H-1.2?0.8:1)),{lr:sbL,small:1},0.08);
    }
  item('framed map');
    box(7.65,0,1.95,8.55,0.04,3.05,(f,u,v,W,H)=>{ if(f!=='S')return C('#6a6a70'); if(u<1.5||v<1.5||u>W-1.5||v>H-1.5)return C('#9aa0a8'); const q=n1(u*0.25,4)*n1(v*0.25,5); return q>0.4?C('#6a7a80'):(Math.floor(u+v*0.5)%9===0?C('#8a9a98'):C('#a8b4b4')); },{wall:'N'});
  item('wooden chair');
    { const cx=7.3,cy=0.55;   // the wooden chair against the wall
      for(const [lx,ly] of [[cx-0.27,cy-0.25],[cx+0.22,cy-0.25],[cx-0.27,cy+0.2],[cx+0.22,cy+0.2]]) box(lx,ly,0,lx+0.04,ly+0.04,0.48,C('#2a3e5a'),{});
      box(cx-0.3,cy-0.28,0.48,cx+0.28,cy+0.26,0.58,(f,u,v,W,H)=>shd(C('#7a4a48'),f==='T'?((u<1||v<1)?1.15:1):0.8));
      box(cx-0.28,cy-0.3,0.58,cx+0.26,cy-0.22,0.72,C('#2a3e5a'),{small:1});
      box(cx-0.3,cy-0.32,0.72,cx+0.28,cy-0.2,1.15,(f,u,v,W,H)=>shd(C('#7a4a48'),(v<1?1.2:1)*(u<1?1.1:u>W-1?0.8:1)),{}); }
  item('credenza');
    { const x0=11.0,x1=13.4,y0=0.08,y1=0.9;   // the credenza
      for(const [lx,ly] of [[x0+0.12,y1-0.14],[x1-0.18,y1-0.14],[x0+0.12,y0+0.05],[x1-0.18,y0+0.05]]){ box(lx,ly,0,lx+0.05,ly+0.05,0.12,PO.woodD,{small:1}); box(lx+0.01,ly+0.01,0.12,lx+0.05,ly+0.05,0.32,PO.woodD,{small:1}); }
      box(x0,y0,0.32,x1,y1,0.95,(f,u,v,W,H)=>{ if(f==='T')return wood(PO.woodL,{seed:9,along:'u'})(f,u,v,W,H); if(f!=='S')return PO.wood;
        if(v<1||v>H-1||u<1||u>W-1)return PO.woodD; const q=u/W; if(q<0.42&&v>2&&v<H*0.5){ const dr=q<0.21?0:1; if(Math.abs(q-0.21)<0.01)return PO.woodD; if(Math.abs(v-H*0.3)<0.8&&Math.abs(u-W*(0.105+0.21*dr))<3)return C('#2a2a2a'); return shd(C('#a8a69c'),0.96+0.05*hh(Math.floor(u/3),Math.floor(v/3),2)); }
        if(Math.abs(q-0.42)<0.006||Math.abs(q-0.71)<0.006)return PO.woodD; if(q>0.42&&Math.abs(v-H*0.45)<0.6&&(Math.abs(q-0.68)<0.015||Math.abs(q-0.74)<0.015))return C('#c8a858'); return shd(PO.wood,0.95+0.07*hh(Math.floor(u/2),0,3)); });
    }

    // ---------- the two walls you see when you turn: the hall door, a coat stand, the clock ----------
  item('door step, office');
    box(LX-0.05,5.3,0,LX,7.0,0.04,PO.woodD,{wall:'E',small:1});
  item('coat stand with a trench coat');
    cyl(14.5,7.7,0.2,0,0.05,PO.woodD); cyl(14.5,7.7,0.03,0.05,1.9,PO.wood,{solid:0}); ell(14.5,7.7,1.92,0.05,0.05,0.04,PO.woodL,{small:1});
    box(14.36,7.55,0.85,14.66,7.85,1.78,(f,u,v,W,H)=>{ if(Math.abs(v-H*0.42)<1.2)return C('#7a6448'); if(f==='T')return C('#b09a74'); return shd(C('#a48c66'),(Math.floor(u)%6===0?0.85:1)*(v<2?1.15:1)); },{solid:0});
    ell(14.5,7.7,1.93,0.17,0.17,0.035,C('#3a3a40'),{small:1}); cyl(14.5,7.7,0.1,1.93,2.05,(f,u,v,W,H)=>f==='T'?C('#34343a'):(v>H-3&&v<H-1.5?C('#1a1a1e'):C('#3a3a40')),{small:1},0.085);
  item('office wall clock');
    wallClock(6.0,2.85,PO.wood,PO.woodD,C('#1a1a1a'));
  item('framed certificate');
    box(9.2,LY-0.05,1.8,10.4,LY,2.7,(f,u,v,W,H)=>{ if(u<2||v<2||u>W-2||v>H-2)return C('#2a2020'); if(u<3.5||v<3.5||u>W-3.5||v>H-3.5)return C('#d8d0b8'); return (Math.floor(v)%4===0&&u>6&&u<W-6)?C('#6a6458'):C('#e8e0c8'); },{wall:'S'});

    drapes('sheer curtains','W',3.88,[[3.2,4.55,3.72,3.6],[7.25,8.62,3.72,3.6]],[PO.sheer,PO.sheerL,PO.sheerD],[0.01,0.025],77); };
  build();
  CAT_DEPTS.push(['office','Office']);
  const info=(no,name,price,desc,mat)=>({no,name,price,desc,mat});
  PGK.register('office',{
    'office floor':info('OF-101','Office floor',1400,'Dark teal carpet.','wool'),
    'office wall, west':info('OF-102','Office wall, west',1500,'Dusky plaster over red wood panelling, the big window in it.','plaster, mahogany, glass'),
    'office wall, north':info('OF-103','Office wall, north',1400,'Plaster with dark wood pilasters.','plaster, wood'),
    'office wall, east':info('OF-104','Office wall, east',1100,'The wall with the door to the hall.','plaster, oak'),
    'office wall, south':info('OF-105','Office wall, south',1100,'Plaster with pilasters.','plaster, wood'),
    'window sill with a case':info('OF-106','Window sill with a case',60,'A sill, a white case on it, the curtain rod above.','oak, plastic'),
    'sheer curtains':info('OF-107','Sheer curtains',60,'Pale sheers either side of the window. They stir.','voile'),
    'filing cabinets with boxes':info('OF-108','Filing cabinets with boxes',520,'Two steel cabinets, a drawer out, boxes of case files on top.','steel, cardboard'),
    'hanging lamp, sage':info('OF-109','Hanging lamp, sage',95,'A sage shade on a long cord. On at night.','enamel'),
    'office desk':info('OF-110','Office desk',780,'A blotter, a red rotary phone, file boxes and papers everywhere.','mahogany, paper'),
    'blue executive chair':info('OF-111','Blue executive chair',420,'A tall tufted chair on wheels.','vinyl, steel'),
    'dumbbell':info('OF-112','Dumbbell',30,'Somebody was keeping in shape.','iron'),
    'fallen thermos':info('OF-113','Fallen thermos',20,'Knocked over, still warm.','steel'),
    'rug of rings':info('OF-114','Rug of rings',420,'Orange discs ringed in cream and tan.','wool'),
    'filing cabinet, a drawer out':info('OF-115','Filing cabinet, a drawer out',260,'A drawer full of papers, a book on top.','steel, paper'),
    'fish plaque':info('OF-116','Fish plaque',70,'A mounted fish on an oval board.','wood, plaster'),
    'arc floor lamp':info('OF-117','Arc floor lamp',190,'A bronze arc with a scalloped sage shade. On at night.','bronze, enamel'),
    'rubber plant':info('OF-118','Rubber plant',45,'Dark glossy leaves in a black pot.','ceramic, leaves'),
    'potted plant':info('OF-119','Potted plant',35,'Round dark leaves in a brown pot.','ceramic, leaves'),
    'books and papers on the floor':info('OF-120','Books and papers on the floor',5,'A blue book and a mess of papers.','paper'),
    'tufted sofa':info('OF-121','Tufted sofa',1100,'A long maroon sofa, channel-tufted.','velvet, oak'),
    'side table with a lamp':info('OF-122','Side table with a lamp',160,'A gourd lamp with a pale shade. On at night.','walnut, ceramic'),
    'side table with a lamp, second':info('OF-123','Side table with a lamp, second',160,'The other one.','walnut, ceramic'),
    'LOST CAT poster':info('OF-124','LOST CAT poster',2,'Grey cat, answers to nothing.','paper'),
    'photo board':info('OF-125','Photo board',40,'Photos pinned in rows.','cork, paper'),
    'sideboard with a globe':info('OF-126','Sideboard with a globe',540,'Low shelves of books, a globe, a magazine and a lamp.','walnut, paper'),
    'framed map':info('OF-127','Framed map',55,'A pale map of somewhere.','paper, aluminium'),
    'wooden chair':info('OF-128','Wooden chair',65,'A plain chair with a dusty rose seat.','beech, vinyl'),
    'credenza':info('OF-129','Credenza',460,'Two pale drawers and sliding doors on splayed legs.','walnut'),
    'door step, office':info('OF-130','Door step, office',10,'The sill at the hall door.','oak'),
    'coat stand with a trench coat':info('OF-131','Coat stand with a trench coat',150,'A trench coat and a grey hat.','oak, cotton, felt'),
    'office wall clock':info('OF-132','Office wall clock',45,'A round clock.','wood, enamel'),
    'framed certificate':info('OF-133','Framed certificate',30,'Some licence or other.','paper')});
  PRESETS['Preset Office 1']=PGK.roomPieces('office').map(([k,x,y])=>[k,+x.toFixed(3),+y.toFixed(3),0]); })();

};
export {pageOffice};
