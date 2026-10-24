// THE HARBOR KITCHEN KIT: the old game's page room, its pieces as catalog kinds and its preset.
import {CAT_DEPTS} from './014-gamekit.js';
import {PRESETS} from './023-west-kits.js';
const pageKitchen=()=>{ '@pagerooms';
// =====================================================================================
// THE HARBOR KITCHEN, EXACT (owner, 12 Oct 2026: the third picture's room as the page built it on its second pass; "exact scenes ... in
// central park"): the page's own code for the room, every piece where the page put it (the tiled floor, the walls of slate tile and cream
// plaster, the low front walls with their troughs and pillars, the doorway, the fridge and the run of counters, the stove, the sink, the
// bread box and toaster, the mat, the tree, the cabinet, the hutch, the little table, the two tables and their benches and stools, the
// counter with pots and books, the blocks, the fig, the flowers, the clock, the print, the aprons), each a catalog item (department Harbor
// Kitchen) through 23-w-page-rooms-0-kit; the walls nearest the eye cut down; the candle in the bottle flickers. "Preset Harbor Kitchen 1" sets them
// all out; placed on Central Park's lawn (26-zzzzzzzzzzzzzzzz-page-rooms).
// =====================================================================================
(()=>{ const {C,shd,mix,hh,n1,sstep,rnd,rr,seed,wood,item,scene,box,cyl,ell,lamp,candle,jar,bookLying,bookStand,leafE,pot,fern,pothos,pumpkin,vase,flowers,frameArt,drapes,beads,wallClock,E1,E2,SKY,FIRE,GLOW,TX}=PGK; const self={};
  const LX=7, LY=9.5, WH=3.6; scene('kitchen',LX,LY,WH,[{wall:'E',a0:0.2,a1:1.2,z1:2.35}]);
  const PK={
  plaster:C('#e2d2ae'),plasterD:C('#cbbb94'),brick:C('#e8dcc0'),brickD:C('#cbbd9c'),beam:C('#8e4c28'),beamL:C('#b0663a'),beamD:C('#5e3018'),cap:C('#efe6d2'),
  tile:C('#3d4d60'),tileL:C('#4d6074'),grout:C('#2b3646'),
  floor:C('#e4d8b8'),floorD:C('#d2c4a2'),dot:C('#6a8aa8'),
  wood:C('#b46c36'),woodL:C('#cc8648'),woodD:C('#70401e'),bolt:C('#4a3a34'),
  top:C('#85898d'),topL:C('#9ca0a4'),topD:C('#63676b'),trough:C('#2f7f68'),troughD:C('#1d5a4a'),troughL:C('#46a084'),
  cloth:C('#2f6c58'),clothL:C('#43866e'),clothD:C('#1f4f40'),
  fridge:C('#ecdcb6'),fridgeL:C('#f6ecd2'),fridgeD:C('#c8b690'),stove:C('#7c8088'),stoveL:C('#9a9ea6'),stoveD:C('#4a4e56'),
  pot:C('#585c62'),potL:C('#7a7e84'),potD:C('#3a3e44'),steel:C('#a8adb6'),steelD:C('#7a7e8a'),plate:C('#eeeee6'),plateD:C('#c8c8c0'),
  leaf:C('#3b7f36'),leafL:C('#5aa448'),leafD:C('#255a24'),terra:C('#c0663e'),terraD:C('#8e4426'),terraL:C('#d8865a'),
};

  const build=()=>{
    // ---------- floor: big cream tiles, a little blue cross at every other corner ----------
  item('kitchen floor',{floor:1});
    box(0,0,-0.45,LX,LY,0,(f,u,v,W,H)=>{ if(f!=='T')return shd(PK.floorD,0.6);
      const tu=u%24, tv=v%24, ci=Math.round(u/24), cj=Math.round(v/24), du=u-ci*24, dv=v-cj*24;
      if((ci+cj)%2===0&&((Math.abs(du)<0.7&&Math.abs(dv)<2.2)||(Math.abs(dv)<0.7&&Math.abs(du)<2.2)))return PK.dot;
      if(tu<0.7||tv<0.7)return PK.floorD;
      return shd(PK.floor,0.97+0.04*hh(Math.floor(u/24),Math.floor(v/24),2)+0.025*hh(Math.floor(u/2),Math.floor(v/2),3)); },{floor:1,occ:0});
    // ---------- walls: slate-blue tiles to the counter's height, cream plaster, a beam with a cream cap and brackets; cream brick at the back corner ----------
    const DOOR={a0:0.2,a1:1.2,z0:0.0,z1:2.35};
    const wallP=(seed,corner,opening)=>(f,u,v,W,H,x,y,z)=>{
      if(f==='T')return (v<1.5||v>H-1.5)?PK.beamD:(v<H*0.5?PK.cap:PK.beam);
      if(opening){ const o=opening(f,u,v,x,y,z); if(o!==undefined)return o; }
      if(v<3)return v<1?PK.cap:PK.beamL; if(v<6)return v>5?PK.beamD:PK.beam;
      if(z>WH-0.4&&z<WH-0.22&&(u%46)<4)return (u%46)<1?PK.beamL:PK.beamD;                          // brackets under the beam
      if(corner&&corner(x,y)){ const bu=u%12, row=Math.floor(v/5), off=(row%2)*6; if(v%5<0.8||((u+off)%12)<0.8)return PK.brickD; return shd(PK.brick,0.96+0.06*hh(Math.floor((u+off)/12),row,seed)); }
      if(z<0.98){ if(z>0.93)return PK.beamD; const tu=u%7, tv=((0.93-z)*TX)%7; if(tu<0.8||tv<0.8)return PK.grout; return shd(PK.tile,(tu<1.7||tv<1.7?1.12:1)*(0.95+0.08*hh(Math.floor(u/7),Math.floor((0.93-z)*TX/7),seed))); }
      if(z<1.0)return PK.beam;
      return shd(PK.plaster,(0.96+0.05*hh(Math.floor(u/2),Math.floor(v/2),seed)+0.04*n1(u*0.05,seed)*n1(v*0.04,seed+1))*(1-0.05*sstep(0.7,1,v/H))); };
    const cornerW=(x,y)=>y<0.32, cornerN=(x,y)=>x<0.32;
    const wallE=wallP(7,null,(f,u,v,x,y,z)=>{ if(f!=='W')return; // the open doorway out to the wharf
      if(y>DOOR.a0-0.1&&y<DOOR.a1+0.1&&z<DOOR.z1+0.1){ if(y>DOOR.a0&&y<DOOR.a1&&z<DOOR.z1)return SKY|0x101010; return (y<DOOR.a0-0.06||y>DOOR.a1+0.06||z>DOOR.z1+0.06)?PK.woodD:PK.wood; } });
    // cut down (when nearest the eye): the picture's low cream-stone wall, its top a green planter trough
    const lowWall=(f,u,v,W,H,x,y,z)=>{ if(f==='T')return PK.cap; const row=Math.floor(v/6), off=(row%2)*9; if(v%6<0.8||((u+off)%18)<0.8)return PK.brickD; return shd(PK.brick,0.95+0.06*hh(Math.floor((u+off)/18),row,5)); };
  item('kitchen wall, west');
    box(-0.25,-0.25,-0.45,0,LY,WH,wallP(3,cornerW),{wallOf:'W',occ:1});
  item('kitchen wall, north');
    box(-0.25,-0.25,-0.45,LX,0,WH,wallP(5,cornerN),{wallOf:'N',occ:1});
  item('kitchen wall, east');
    box(LX,-0.25,-0.45,LX+0.25,LY+0.25,WH,wallE,{wallOf:'E',occ:1,cutH:0.55,cutC:lowWall});
  item('kitchen wall, south');
    box(-0.25,LY,-0.45,LX+0.25,LY+0.25,WH,wallP(9,null),{wallOf:'S',occ:1,cutH:0.55,cutC:lowWall});
  item('low wall troughs and pillars',{parts:1});   // (its pillars and the door's post along two walls: what stops you; not the whole floor between them)
    const trough=(x0,y0,x1,y1)=>box(x0,y0,0.55,x1,y1,0.75,(f,u,v,W,H)=>{ if(f==='T')return (u<1.5||v<1.5||u>W-1.5||v>H-1.5)?PK.troughL:PK.troughD; return shd(PK.trough,v<1.2?1.25:(Math.floor(u)%16===0?0.85:1)); },{cutOnly:x0>LX-1?'E':'S',solid:0});
    const pillar=(x0,y0,x1,y1,h,w)=>box(x0,y0,0,x1,y1,h,(f,u,v,W,H)=>f==='T'?PK.cap:shd(PK.brick,(v<1.2?1.1:1)*(u<1?1.08:u>W-1?0.85:1)*(Math.abs(v-H*0.5)<0.6?0.85:1)),{cutOnly:w,solid:1});
    trough(LX-0.02,1.75,LX+0.28,4.6); trough(LX-0.02,4.95,LX+0.28,8.2); trough(LX-0.02,8.55,LX+0.28,LY);
    pillar(LX-0.05,1.2,LX+0.3,1.6,0.95,'E'); pillar(LX-0.05,4.55,LX+0.3,5.0,0.95,'E'); pillar(LX-0.05,8.15,LX+0.3,8.6,0.95,'E'); pillar(LX-0.05,LY-0.05,LX+0.3,LY+0.3,0.95,'E');
    box(LX+0.02,1.24,0,LX+0.17,1.44,DOOR.z1+0.05,wood(PK.wood,{seed:8}),{cutOnly:'E',solid:1});   // the doorway's post
    pillar(LX-0.05,-0.25,LX+0.3,0.15,0.95,'E');
    trough(1.0,LY-0.02,2.2,LY+0.28); pillar(0.55,LY-0.05,1.0,LY+0.3,0.95,'S'); pillar(5.0,LY-0.05,5.45,LY+0.3,0.95,'S');

  item('retro fridge');
    // ---------- the fridge, deep and round-shouldered, its handles by the door split ----------
    box(0.05,0.08,0,1.15,0.9,1.95,(f,u,v,W,H)=>{ const rim=(u<1.5||v<1.5)?1.08:(u>W-1.5||v>H-1.5)?0.86:1;
      if(f==='T')return shd(PK.fridge,rim*((u>3&&u<W-3&&v>3&&v<H-3&&(u<4||v<4||u>W-4||v>H-4))?0.94:1));
      if(v<1.2)return PK.fridgeL; if(v>H-2.5)return v>H-1.2?C('#5a5048'):PK.fridgeD;
      const split=H*0.36; if(Math.abs(v-split)<0.8)return PK.fridgeD;
      if(f==='E'){ if(u>W-3.2&&u<W-1.6&&((v>split-6&&v<split-1.5)||(v>split+1.5&&v<split+6)))return C('#3a3a40'); if(u<1)return PK.fridgeL; if(u>W-1)return PK.fridgeD; }
      return shd(PK.fridge,(f==='E'?1:0.93)*(0.98+0.03*hh(Math.floor(u/4),Math.floor(v/4),2))); },{});

    // ---------- the kitchen run along the left wall: drawer panels with a bolt at each corner, tiled tops ----------
    const panels=(cols,rows,face)=>(f,u,v,W,H)=>{ if(f==='T')return PK.woodD; if(v>H-1.6)return C('#3a2414'); if(f!==(face||'E'))return shd(PK.wood,0.82);
      const cw=W/cols, rh=(H-1.6)/rows, cu=u%cw, rv=v%rh; if(cu<0.9||rv<0.9)return PK.woodD; if(cu<1.7||rv<1.6)return PK.woodL;
      const bolt=(Math.abs(cu-2.8)<1||Math.abs(cu-(cw-2))<1)&&(Math.abs(rv-2.6)<1||Math.abs(rv-(rh-1.8))<1); if(bolt)return PK.bolt;
      return shd(PK.wood,0.95+0.07*hh(Math.floor(u/cw),Math.floor(v/rh),4)+0.03*Math.sin(u*0.35+v*0.05)); };
    const tiles=(f,u,v,W,H)=>{ if(f!=='T')return v<1.2?PK.topL:PK.topD; const tu=u%5, tv=v%5; if(tu<0.75||tv<0.75)return PK.topD; return shd(PK.top,(tu<1.5||tv<1.5?1.1:1)*(0.96+0.06*hh(Math.floor(u/5),Math.floor(v/5),7))); };
    const run=(y0,y1,cols,rows)=>{ box(0.02,y0,0,0.75,y1,0.9,panels(cols,rows)); box(0,y0,0.9,0.8,y1,0.97,tiles); };
    item('counter with a cutting board and knives'); run(0.9,1.85,1,2); item('counter with a spice rack and pots'); run(2.8,5.15,3,2); item('counter with a bread box and toaster'); run(6.05,7.65,2,2);
  item('counter with a cutting board and knives');
    // counter by the fridge: a cutting board, the stone mortar on it, the knife block behind
    box(0.22,1.0,0.97,0.74,1.72,1.0,(f,u,v,W,H)=>f==='T'?shd(C('#a8642e'),(u<1||v<1)?1.15:(u>W-1||v>H-1)?0.8:1+0.05*Math.sin(v*0.6)):C('#8a4e22'),{small:1});
    box(0.42,1.72,0.97,0.54,1.84,1.0,C('#a8642e'),{small:1});
    cyl(0.5,1.36,0.15,1.0,1.13,(f,u,v,W,H)=>f==='T'?(Math.hypot(u-W/2,v-H/2)<2.6?C('#3a3a3a'):C('#6a6a68')):shd(C('#5c5c5a'),v<1.2?1.2:0.95),{small:1},0.18);
    box(0.06,1.16,0.97,0.3,1.5,1.18,(f,u,v,W,H)=>shd(C('#9a5a2a'),v<1?1.2:u>W-1?0.8:1),{small:1}); box(0.06,1.16,1.18,0.22,1.5,1.24,C('#9a5a2a'),{small:1});
    for(let k=0;k<4;k++)box(0.09+(k%2)*0.06,1.2+k*0.07,1.24,0.14+(k%2)*0.06,1.25+k*0.07,1.4-k*0.02,C('#2a2224'),{small:1});
  item('six-burner stove');
    // the stove: six burners, the oven door and its knobs
    box(0.02,1.85,0,0.78,2.8,0.95,(f,u,v,W,H)=>{ if(f==='T'){ for(const cx of [W*0.3,W*0.7])for(const cy of [H*0.2,H*0.5,H*0.8]){ const d=Math.hypot(u-cx,v-cy); if(d<3)return d>2.1?C('#202226'):(d<0.9?PK.stoveD:C('#33363c')); } return (u<1||v<1)?PK.stoveL:PK.stove; }
      if(f!=='E')return PK.stoveD; if(v<1.2)return PK.stoveL; if(v<3.4)return (Math.floor(u)%5===2)?C('#2a2a2e'):PK.stove; if(v>H-1.6)return C('#2a2a2e');
      if(v>4.4&&v<H-3&&u>2&&u<W-2){ if(u<3||u>W-3||v<5.4||v>H-4)return PK.stoveL; if(v<6.6&&u>W*0.3&&u<W*0.7)return PK.stoveL; return v<H*0.55?C('#3a3e48'):C('#22242a'); } return PK.stove; });
  item('counter with a spice rack and pots');
    // past the stove: the microwave, the two-tier spice rack, the raised drawer unit on its tiled block with pots and plates on top
    box(0.05,2.86,0.97,0.52,3.42,1.36,(f,u,v,W,H)=>{ if(f==='T')return PK.stoveD; if(f!=='E')return C('#4a4458'); if(u<1.5||v<1.5||u>W-1.5||v>H-1.5)return C('#5a5468'); if(u<W*0.28)return (Math.floor(v)%3===0)?C('#3a3448'):C('#4a4458');
      return mix(C('#1c2230'),C('#3a4458'),Math.max(0,0.6-v/H+0.15*Math.sin(u*0.4))); },{small:1});
    { const x0=0.04,x1=0.34,y0=3.45,y1=3.9; box(x0,y0,0.97,x1,y0+0.04,1.55,PK.wood,{small:1}); box(x0,y1-0.04,0.97,x1,y1,1.55,PK.wood,{small:1}); box(x0,y0,0.97,x0+0.04,y1,1.55,PK.woodD,{small:1});
      box(x0,y0,1.22,x1,y1,1.25,PK.wood,{small:1}); box(x0,y0,1.52,x1,y1,1.55,PK.wood,{small:1}); box(x1-0.03,y0,1.0,x1,y1,1.04,PK.woodL,{small:1}); box(x1-0.03,y0,1.25,x1,y1,1.29,PK.woodL,{small:1});
      const cols=['#3a8a3a','#c84a2a','#e8e0c8','#e08a2a','#4a9a4a','#c84a2a']; for(let k=0;k<3;k++){ jar(0.19,3.55+k*0.12,0.97,0.045,0.12,C(cols[k])); jar(0.19,3.55+k*0.12,1.25,0.045,0.13,C(cols[k+3])); } }
    box(0.02,3.9,0.97,0.62,5.15,1.4,(f,u,v,W,H)=>tiles('T',u,v,W,H),{});
    box(0.0,3.9,1.4,0.64,5.15,1.88,(f,u,v,W,H)=>{ if(f==='T')return wood(PK.woodL,{seed:4})(f,u,v,W,H); if(f==='E'&&u>W-9&&v>2&&v<H-2)return (u<W-8||v<3||v>H-3)?PK.woodD:C('#4a2a16');  // the open cubby
      return panels(2,1)(f,u,v,W,H); });
    const potOn=(x,y,z,r,h)=>{ cyl(x,y,r,z,z+h,(f,u,v,W,H)=>f==='T'?(Math.hypot(u-W/2,v-H/2)<1.6?PK.potL:(Math.hypot(u-W/2,v-H/2)>W/2-1.2?PK.potL:PK.pot)):shd(PK.pot,(u%W)/W>0.08&&(u%W)/W<0.14?1.3:(v<1.2?1.2:1)),{small:1});
      ell(x,y,z+h+0.015,0.03,0.03,0.025,PK.potD,{small:1}); box(x-0.03,y+r-0.01,z+h-0.07,x+0.03,y+r+0.07,z+h-0.03,PK.potD,{small:1}); box(x-0.03,y-r-0.07,z+h-0.07,x+0.03,y-r+0.01,z+h-0.03,PK.potD,{small:1}); };
    potOn(0.32,4.88,1.88,0.18,0.2); potOn(0.32,4.5,1.88,0.15,0.17);
    for(let k=0;k<7;k++)cyl(0.32,4.17,0.15,1.88+k*0.022,1.9+k*0.022,(f,u,v,W,H)=>f==='T'?(Math.hypot(u-W/2,v-H/2)<2.4?PK.plateD:PK.plate):(k%2?PK.plate:PK.plateD),{small:1});
    potOn(0.32,3.98,1.88,0.1,0.12);
    cyl(0.6,3.74,0.13,0.97,1.08,(f,u,v,W,H)=>f==='T'?(Math.hypot(u-W/2,v-H/2)<2.2?C('#2a2a2a'):C('#5a5a58')):shd(C('#4c4c4a'),v<1.2?1.2:0.95),{small:1},0.16);
    jar(0.62,4.18,0.97,0.06,0.13,C('#d86a2a'),{label:1});
  item('sink counter');
    // the sink: a steel basin and a gooseneck tap
    box(0.02,5.15,0,0.75,6.05,0.9,panels(1,2)); box(0,5.15,0.9,0.8,6.05,0.97,(f,u,v,W,H)=>{ if(f!=='T')return v<1.2?PK.topL:PK.topD; if(u<2||v<2||u>W-2||v>H-2)return tiles(f,u,v,W,H); if(u<3||v<3||u>W-3||v>H-3)return PK.steel; return mix(C('#6a6e7c'),C('#8a8e9c'),(v/H)*0.6+0.1*hh(Math.floor(u/2),Math.floor(v/2),2)); });
    cyl(0.1,5.6,0.025,0.97,1.22,PK.steel,{small:1}); for(let k=0;k<5;k++){ const a=k/4*Math.PI; box(0.1+Math.sin(a)*0.14-0.02,5.6-0.02,1.22+Math.cos(a)*0.05-0.02+0.03,0.1+Math.sin(a)*0.14+0.02,5.6+0.02,1.22+Math.cos(a)*0.05+0.02+0.03,PK.steel,{small:1}); }
    box(0.08,5.78,1.0,0.12,5.9,1.04,PK.steelD,{small:1}); box(0.08,5.3,1.0,0.12,5.42,1.04,PK.steelD,{small:1});
  item('counter with a bread box and toaster');
    // the bread box (a ribbed roll-top) and the toaster at the front end; a wooden brace under the end
    box(0.1,6.25,0.97,0.62,6.95,1.1,(f,u,v,W,H)=>shd(C('#b8662e'),(Math.floor(u/2)%2?0.88:1.04)*(v>H-1.2?0.75:1)),{small:1});
    ell(0.36,6.6,1.1,0.26,0.35,0.16,(f,u,v,W,H,x,y,z,lx,ly,lz)=>shd(C('#c4743a'),(Math.floor((Math.atan2(lz,lx)+3.2)*5)%2?0.86:1.05)*(Math.abs(ly)>0.92?0.8:1)),{small:1});
    box(0.14,7.08,0.97,0.5,7.5,1.2,(f,u,v,W,H)=>f==='T'?((Math.abs(u-W*0.35)<1||Math.abs(u-W*0.65)<1)&&v>2&&v<H-2?C('#141416'):C('#5c6066')):shd(C('#50545a'),v<1.2?1.25:(v>H-1.5?0.6:1)),{small:1});
    for(let k=0;k<4;k++)box(0.25+k*0.11,7.66,0.82-k*0.18,0.33+k*0.11,7.72,0.9-k*0.18,PK.woodD,{small:1});
  item('green checked mat',{flat:1});
    box(0.95,5.9,0,1.85,6.95,0.012,(f,u,v,W,H)=>{ if(u<1.4||v<1.4||u>W-1.4||v>H-1.4)return C('#5a6a28'); const a=(u+v)%7, b=(u-v+70)%7; return (a<1.1||b<1.1)?C('#d0c46a'):C('#8a9a38'); },{solid:0,occ:0});

    // ---------- the back-right wall: the potted tree, the tiled cabinet, the hutch, the little table under its cloth ----------
  item('lollipop tree in a pot');
    cyl(1.55,0.5,0.24,0,0.42,(f,u,v,W,H)=>f==='T'?C('#4a3222'):shd(PK.terra,(v<3?(v<1.2?1.25:1.1):1)*(Math.floor(u)%14===0?0.88:1)),{},0.33);
    cyl(1.55,0.5,0.34,0.42,0.5,(f,u,v,W,H)=>f==='T'?(Math.hypot(u-W/2,v-H/2)<W/2-2?C('#4a3222'):PK.terraL):PK.terraL);
    for(const [dx,dy] of [[-0.06,0],[0.06,0.02]]){ for(let k=0;k<8;k++){ const zz=0.5+k*0.11, sp=k/8; box(1.55+dx*sp*2-0.025,0.5+dy*sp-0.025,zz,1.55+dx*sp*2+0.025,0.5+dy*sp+0.025,zz+0.12,C('#6a4228'),{small:1,solid:0}); } }
    seed(21); for(let i=0;i<70;i++){ let a,b,c; do{a=rr(-1,1);b=rr(-1,1);c=rr(-1,1);}while(a*a+b*b+c*c>1); leafE(1.55+a*0.5,0.55+b*0.42,1.75+c*0.42,0.09,0.09,0.06,c>0.4&&rnd()<0.7?PK.leafL:rnd()<0.35?PK.leafD:PK.leaf,{solid:0}); }
  item('tiled cabinet');
    box(2.1,0.05,0,3.1,0.85,0.85,panels(2,1,'S')); box(2.07,0.05,0.85,3.13,0.88,0.92,tiles);
  item('hutch of plates');
    { const x0=3.25,x1=4.35,y0=0.05,y1=0.62,h=2.0,Wd=wood(PK.wood,{seed:12});
      box(x0,y0,0,x0+0.07,y1,h,Wd); box(x1-0.07,y0,0,x1,y1,h,Wd); box(x0,y0,0,x1,y0+0.04,h,PK.woodD); box(x0,y0,0,x1,y1,0.1,Wd); box(x0-0.03,y0,h-0.07,x1+0.03,y1+0.04,h,Wd);
      for(const s of [0.68,1.3]) box(x0+0.07,y0+0.04,s-0.04,x1-0.07,y1,s,Wd);
      for(const [z0,n] of [[0.1,7],[0.68,7]]) for(let k=0;k<n;k++){ const px=3.42+k*0.115; box(px-0.012,0.14,z0,px+0.012,0.5,z0+0.36,(f,u,v,W,H,x,y,z)=>{ const d=Math.hypot(y-0.32,z-(z0+0.18)); return d>0.18?-1:(f==='S'||f==='N')?(d<0.11?PK.plateD:PK.plate):PK.plateD; },{small:1}); }
      box(3.45,0.1,1.3,3.82,0.17,1.66,(f,u,v,W,H)=>{ if(u<1.5||v<1.5||u>W-1.5||v>H-1.5)return C('#8a5a30'); const cx=W/2,cy=H/2,d=Math.hypot(u-cx,v-cy); if(d<1.4)return C('#f0e8d0'); if(d<3.6&&Math.abs(Math.sin(Math.atan2(v-cy,u-cx)*3))>0.35)return C('#3a5aa8'); return C('#e8e0c8'); },{small:1});
      box(3.88,0.1,1.3,4.25,0.17,1.66,(f,u,v,W,H)=>{ if(u<1.5||v<1.5||u>W-1.5||v>H-1.5)return C('#8a5a30'); const cx=W/2,cy=H/2,d=Math.hypot(u-cx,v-cy); if(d<1.5)return C('#8a5a20'); if(d<3.6&&Math.abs(Math.sin(Math.atan2(v-cy,u-cx)*5))>0.4)return C('#e8b830'); return C('#e8e0c8'); },{small:1});
      seed(5); let px=3.42; for(const c of ['#3a8a3a','#7a4a2a','#2a4a8a','#3a8a4a']){ const w=0.16; bookStand(px,0.12,h,px+w,0.52,0.36,C(c),'S'); px+=w+0.02; }
    }
  item('little table under a cloth');
    { const x0=4.45,x1=5.3,y0=0.25,y1=1.1,h=0.8;
      for(const [lx,ly] of [[x0+0.05,y0+0.05],[x1-0.14,y0+0.05],[x0+0.05,y1-0.14],[x1-0.14,y1-0.14]]) box(lx,ly,0,lx+0.09,ly+0.09,h-0.05,(f,u,v,W,H)=>shd(PK.wood,u<1?1.2:0.95),{});
      box(x0,y0,h-0.08,x1,y1,h,wood(PK.wood,{seed:6,along:'u'}));
      box(x0+0.08,y0+0.06,h,x1-0.08,y1+0.03,h+0.012,(f,u,v,W,H)=>f==='T'?shd(PK.cloth,(u<1||v<1)?1.12:1):PK.cloth,{small:1});
      box(x0+0.08,y1+0.015,h-0.38,x1-0.08,y1+0.045,h+0.012,(f,u,v,W,H)=>(v>H-3+2.5*Math.sin(u*0.45))?-1:shd(PK.cloth,(Math.sin(u*0.6)>0.4?1.12:Math.sin(u*0.6)<-0.4?0.8:1)),{small:1});
      box(x1-0.03,y0+0.15,h-0.3,x1+0.0,y1-0.05,h+0.012,(f,u,v,W,H)=>(v>H-3+2*Math.sin(u*0.5))?-1:shd(PK.cloth,0.9),{small:1}); }

    // ---------- the dining: two tables under green cloths, benches, a cushioned and a plain stool at each ----------
    function stoolGreen(cx,cy){ for(const [dx,dy] of [[-0.11,-0.11],[0.11,-0.11],[-0.11,0.11],[0.11,0.11]]) box(cx+dx-0.03,cy+dy-0.03,0,cx+dx+0.03,cy+dy+0.03,0.38,PK.woodD,{small:1});
      cyl(cx,cy,0.2,0.36,0.42,PK.wood); cyl(cx,cy,0.18,0.42,0.48,(f,u,v,W,H)=>f==='T'?shd(PK.cloth,Math.hypot(u-W/2,v-H/2)<2.5?1.12:1):PK.clothD,{small:1}); }
    function stoolPlain(cx,cy){ for(const [dx,dy] of [[-0.12,-0.1],[0.12,-0.1],[0,0.14]]) box(cx+dx-0.03,cy+dy-0.03,0,cx+dx+0.03,cy+dy+0.03,0.4,(f,u,v,W,H)=>shd(PK.wood,u<1?1.15:0.92),{small:1});
      cyl(cx,cy,0.21,0.4,0.48,(f,u,v,W,H)=>f==='T'?shd(PK.wood,(Math.hypot(u-W/2,v-H/2)>W/2-1.2?0.82:1)*(Math.abs(Math.sin((u+v)*0.35))<0.15?0.85:1.02)):shd(PK.woodD,1.2)); }
    function bench(x0,y0,x1,y1){ const along=x1-x0>y1-y0; box(x0,y0,0.36,x1,y1,0.45,(f,u,v,W,H)=>{ if(f!=='T')return shd(PK.woodD,1.15); const a=along?u:v,b=along?v:u,L=along?W:H; if((Math.abs(a-L*0.3)<0.8&&Math.abs(b-(along?H:W)*0.5)<2)||(Math.abs(b-(along?H:W)*0.5-(a-L*0.3)*0.6)<0.7&&a>L*0.3&&a<L*0.3+4))return PK.woodD;
        return shd(PK.wood,(a<1||b<1)?1.15:(a>L-1||b>(along?H:W)-1)?0.82:0.97+0.05*Math.sin(a*0.3)); });
      for(const t of [0.14,0.86]){ if(along){ const ax=x0+(x1-x0)*t; box(ax-0.05,y0+0.03,0,ax+0.05,y1-0.03,0.36,PK.woodD,{}); } else { const ay=y0+(y1-y0)*t; box(x0+0.03,ay-0.05,0,x1-0.03,ay+0.05,0.36,PK.woodD,{}); } } }
    function clothTable(x0,y0,x1,y1){ const h=0.78; for(const [lx,ly] of [[x0+0.06,y0+0.06],[x1-0.16,y0+0.06],[x0+0.06,y1-0.16],[x1-0.16,y1-0.16]]) box(lx,ly,0,lx+0.1,ly+0.1,h-0.06,(f,u,v,W,H)=>shd(PK.wood,u<1?1.2:0.95),{});
      box(x0,y0,h-0.08,x1,y1,h,wood(PK.wood,{seed:6,along:'u'}));
      const ix=(x1-x0)*0.12, iy=(y1-y0)*0.1;
      box(x0+ix,y0+iy,h,x1-ix,y1-iy,h+0.014,(f,u,v,W,H)=>f==='T'?shd(PK.cloth,(u<1||v<1)?1.12:0.98+0.05*Math.sin(u*0.4)*Math.sin(v*0.3)):PK.cloth,{small:1});
      const flap=(fx0,fy0,fx1,fy1)=>box(fx0,fy0,h-0.34,fx1,fy1,h+0.014,(f,u,v,W,H)=>(v>H-3.5+3*Math.sin(u*0.4+fx0))?-1:shd(PK.cloth,(Math.sin(u*0.7)>0.4?1.12:Math.sin(u*0.7)<-0.4?0.8:1)),{small:1});
      flap(x0+ix,y1-iy+0.005,x1-ix,y1-iy+0.035); flap(x1-ix+0.005,y0+iy,x1-ix+0.035,y1-iy); return h; }
    const plate=(x,y,z)=>{ cyl(x,y,0.15,z,z+0.02,(f,u,v,W,H)=>f==='T'?(Math.hypot(u-W/2,v-H/2)<2.4?PK.plateD:PK.plate):PK.plateD,{small:1}); };
    const glass=(x,y,z)=>{ cyl(x,y,0.05,z,z+0.012,C('#d4e4ec'),{small:1}); cyl(x,y,0.013,z+0.012,z+0.12,C('#d4e4ec'),{small:1}); cyl(x,y,0.028,z+0.12,z+0.25,(f,u,v,W,H)=>f==='T'?C('#a8c0cc'):shd(C('#d4e4ec'),(u%W)/W>0.15&&(u%W)/W<0.25?1.2:0.95),{small:1},0.06); };
  item('table with a candle in a bottle');
    { const h=clothTable(2.3,1.7,3.35,2.75);
      for(const [px,py] of [[2.55,1.95],[3.1,1.95],[2.55,2.5],[3.1,2.5]])plate(px,py,h+0.014);
      cyl(2.83,2.22,0.075,h+0.014,h+0.3,(f,u,v,W,H)=>f==='T'?C('#2a4a22'):(v>H*0.45&&v<H*0.8&&(u%W)/W<0.4?C('#e8dcb0'):shd(C('#4a7a2a'),(u%W)/W>0.12&&(u%W)/W<0.2?1.35:1)),{small:1}); cyl(2.83,2.22,0.03,h+0.3,h+0.42,C('#4a7a2a'),{small:1},0.026);
      candle(2.83,2.22,h+0.42,0.16,0.03); lamp(2.83,2.22,h+0.62,2.4,[1,0.62,0.3],0.8,1);
      item('cushioned stool'); stoolGreen(1.85,2.55); item('wooden stool'); stoolPlain(4.1,2.85); item('plank bench'); bench(2.2,3.35,3.55,3.65); }
  item('long table with wine glasses');
    { const h=clothTable(2.55,5.35,3.65,7.25);
      glass(2.95,5.75,h+0.014); glass(3.3,6.5,h+0.014); glass(2.85,6.85,h+0.014);
      item('plank bench, west'); bench(1.95,5.45,2.25,7.15); item('plank bench, east'); bench(3.95,5.45,4.25,7.15); item('cushioned stool, second'); stoolGreen(2.75,7.85); item('wooden stool, second'); stoolPlain(3.65,7.9); }

    // ---------- the counter along the right: wood above, grey tile below, a plant, two pots and books on top; tiled blocks behind it ----------
  item('counter with pots and books');
    { const x0=5.3,x1=6.1,y0=2.1,y1=5.6;
      box(x0,y0,0,x1,y1,0.48,(f,u,v,W,H)=>{ if(v>H-1.5)return PK.troughD; const tu=u%5, tv=v%5; if(tu<0.75||tv<0.75)return PK.topD; return shd(PK.top,(tu<1.5||tv<1.5?1.1:1)*(0.95+0.06*hh(Math.floor(u/5),Math.floor(v/5),3))); });
      box(x0-0.03,y0,0.48,x1+0.03,y1,0.95,(f,u,v,W,H)=>{ if(f==='T')return PK.wood; if(u%21<0.9)return PK.woodD; if(v<1.2)return PK.woodL; const a=u%21, gy=(v%10);
        if((Math.abs(a-10.5)<0.6&&gy>4)||(Math.abs(a-10.5-(4-gy)*0.8)<0.6&&gy<4.5&&gy>1)||(Math.abs(a-10.5+(4-gy)*0.8)<0.6&&gy<4.5&&gy>1))return shd(PK.woodD,1.2);   // the grain's Y marks
        return shd(PK.wood,0.95+0.07*hh(Math.floor(u/21),0,4)+0.03*Math.sin(u*0.4)); });
      box(x0-0.07,y0-0.04,0.95,x1+0.05,y1+0.04,1.02,wood(PK.woodL,{seed:14,along:'v'}));
      potOn(5.7,4.4,1.02,0.15,0.16); potOn(5.68,4.05,1.02,0.13,0.15);
      let py=3.2; for(const c of ['#8a4a2a','#5aa04a','#8a4a2a','#5aa04a']){ bookStand(5.5,py,1.02,5.95,py+0.1,0.34,C(c),'E'); py+=0.115; }
      pot(5.65,5.3,1.02,0.15,0.16,PK.terra); seed(17); for(let i=0;i<16;i++){ const a=i*0.4; leafE(5.65+Math.cos(a)*rr(0.04,0.26),5.3+Math.sin(a)*rr(0.04,0.26),1.26+rr(0,0.2),0.11,0.05,0.025,i%2?PK.leafL:PK.leaf); }
  item('tiled block');
      box(5.3,1.3,0,6.1,2.1,0.52,(f,u,v,W,H)=>f==='T'?tiles(f,u,v,W,H):(v>H-1.5?PK.troughD:tiles('T',u,v,W,H))); box(5.27,1.27,0.52,6.13,2.1,0.57,tiles);
  item('small pot on the floor');
      potOn(5.1,5.95,0,0.13,0.15);
    }
    // ---------- the front, by the low wall: the grey tiled block, the potted fig, the white box of yellow flowers ----------
  item('grey tiled block');
    box(4.0,8.75,0,4.8,9.45,0.3,(f,u,v,W,H)=>f==='T'?PK.wood:shd(PK.wood,v<1?1.15:0.92)); box(3.97,8.72,0.3,4.83,9.48,0.55,tiles);
  item('potted fig');
    cyl(3.4,8.95,0.22,0,0.38,(f,u,v,W,H)=>f==='T'?C('#4a3222'):shd(PK.terra,v<2?1.2:(Math.floor(u)%12===0?0.88:1)),{},0.3); cyl(3.4,8.95,0.31,0.38,0.44,PK.terraL);
    for(let k=0;k<7;k++)box(3.38+(k>3?0.04:-0.02)*(k-3),8.93,0.44+k*0.1,3.42+(k>3?0.04:-0.02)*(k-3),8.97,0.56+k*0.1,C('#6a4228'),{small:1,solid:0});
    seed(44); for(let i=0;i<60;i++){ let a,b,c; do{a=rr(-1,1);b=rr(-1,1);c=rr(-1,1);}while(a*a+b*b+c*c>1); leafE(3.4+a*0.42,8.95+b*0.4,1.35+c*0.36,0.085,0.085,0.055,c>0.4&&rnd()<0.7?PK.leafL:rnd()<0.35?PK.leafD:PK.leaf,{solid:0}); }
  item('box of yellow flowers');
    box(2.3,8.8,0,3.0,9.4,0.32,(f,u,v,W,H)=>f==='T'?C('#5a3a22'):shd(C('#f0ece4'),v<1.2?1.1:(u<1?1.05:0.95)));
    seed(46); for(let i=0;i<34;i++){ const fx=2.35+rr(0,0.6), fy=8.85+rr(0,0.5); ell(fx,fy,0.36+rr(0,0.18),0.06,0.06,0.05,(f,u,v,W,H,x,y,z,lx,ly,lz)=>lz>0.35&&lx*lx+ly*ly<0.15?C('#c87a1a'):(lz>0.1?C('#f6c83a'):C('#e0a828')),{small:1}); }
    for(let i=0;i<12;i++)leafE(2.35+rr(0,0.6),8.85+rr(0,0.5),0.34+rr(0,0.1),0.07,0.05,0.025,PK.leaf);

    // ---------- the walls you see when you turn: a clock, a sea print, hooks with aprons ----------
  item('kitchen wall clock');
    wallClock(3.0,2.5,PK.wood,PK.woodD,C('#1a1a1a'));
  item('sea print');
    box(4.6,LY-0.05,1.6,5.5,LY,2.4,(f,u,v,W,H)=>frameArt(f,u,v,W,H,(a,b,w,hh2)=>{ if(b>hh2*0.62)return mix(C('#2a6aa0'),C('#4a8ac0'),Math.sin(a*0.8)*0.5+0.5); if(Math.abs(a-w*0.5)<1&&b>hh2*0.25)return C('#4a3a2a'); if(b>hh2*0.25&&b<hh2*0.6&&a>w*0.5&&a<w*0.5+(b-hh2*0.25)*0.7)return C('#f0ece0'); return C('#c8e0f0'); }),{wall:'S'});
  item('apron hooks');
    box(1.0,LY-0.06,1.85,2.3,LY,1.92,PK.woodD,{wall:'S',small:1});
    for(const [hx,c] of [[1.3,'#c84a3a'],[2.0,'#e8e0c8']]){ box(hx-0.03,LY-0.12,1.75,hx+0.03,LY-0.06,1.88,PK.steel,{wall:'S',small:1}); box(hx-0.2,LY-0.1,0.95,hx+0.2,LY-0.06,1.78,(f,u,v,W,H)=>(v<4&&Math.abs(u-W/2)>v*1.2+2)?-1:shd(C(c),(Math.floor(u)%5===0?0.88:1)),{wall:'S'}); }
 };
  build();
  CAT_DEPTS.push(['harbor','Harbor Kitchen']);
  const info=(no,name,price,desc,mat)=>({no,name,price,desc,mat});
  PGK.register('harbor',{
    'kitchen floor':info('HK-101','Kitchen floor',800,'Big cream tiles with a blue cross at every other corner.','tile'),
    'kitchen wall, west':info('HK-102','Kitchen wall, west',900,'Slate tiles under cream plaster, a beam on top.','tile, plaster, pine'),
    'kitchen wall, north':info('HK-103','Kitchen wall, north',800,'The same, cream brick by the corner.','tile, plaster, brick'),
    'kitchen wall, east':info('HK-104','Kitchen wall, east',800,'The open doorway to the wharf.','tile, plaster, pine'),
    'kitchen wall, south':info('HK-105','Kitchen wall, south',800,'Tile and plaster.','tile, plaster'),
    'low wall troughs and pillars':info('HK-106','Low wall troughs and pillars',300,'Planter troughs and cream pillars along the low front walls.','stone, enamel'),
    'retro fridge':info('HK-107','Retro fridge',890,'Cream, two doors, rounded shoulders.','steel, enamel'),
    'counter with a cutting board and knives':info('HK-108','Counter with a cutting board and knives',240,'A cutting board, a stone mortar and a knife block.','pine, tile, stone'),
    'six-burner stove':info('HK-109','Six-burner stove',760,'Six burners and an oven.','steel, cast iron'),
    'counter with a spice rack and pots':info('HK-110','Counter with a spice rack and pots',520,'A microwave, a spice rack, a drawer unit with pots and plates on top.','pine, tile, steel'),
    'sink counter':info('HK-111','Sink counter',310,'A steel basin and a gooseneck tap.','pine, steel'),
    'counter with a bread box and toaster':info('HK-112','Counter with a bread box and toaster',260,'A roll-top bread box and a toaster.','pine, tile, steel'),
    'green checked mat':info('HK-113','Green checked mat',20,'Olive and yellow lattice.','cotton'),
    'lollipop tree in a pot':info('HK-114','Lollipop tree in a pot',70,'A little round-crowned tree.','clay, leaves'),
    'tiled cabinet':info('HK-115','Tiled cabinet',180,'Two drawers under a tiled top.','pine, tile'),
    'hutch of plates':info('HK-116','Hutch of plates',340,'Plates standing in rows, two painted tiles, books on top.','pine, china'),
    'little table under a cloth':info('HK-117','Little table under a cloth',90,'A green cloth over it.','pine, cotton'),
    'table with a candle in a bottle':info('HK-118','Table with a candle in a bottle',230,'Four plates and a candle in a wine bottle.','pine, cotton, glass'),
    'cushioned stool':info('HK-119','Cushioned stool',45,'A green cushion.','pine, cotton'),
    'wooden stool':info('HK-120','Wooden stool',35,'Three legs and a round seat.','pine'),
    'plank bench':info('HK-121','Plank bench',80,'A plank on two legs.','pine'),
    'long table with wine glasses':info('HK-122','Long table with wine glasses',260,'Three glasses on a green cloth.','pine, cotton, glass'),
    'plank bench, west':info('HK-123','Plank bench, west',80,'A plank on two legs.','pine'),
    'plank bench, east':info('HK-124','Plank bench, east',80,'A plank on two legs.','pine'),
    'cushioned stool, second':info('HK-125','Cushioned stool, second',45,'A green cushion.','pine, cotton'),
    'wooden stool, second':info('HK-126','Wooden stool, second',35,'Three legs.','pine'),
    'counter with pots and books':info('HK-127','Counter with pots and books',420,'Wood above, grey tile below, pots, books and a plant.','pine, tile'),
    'tiled block':info('HK-128','Tiled block',60,'A low tiled block.','brick, tile'),
    'small pot on the floor':info('HK-129','Small pot on the floor',15,'A little grey pot.','iron'),
    'grey tiled block':info('HK-130','Grey tiled block',60,'A tiled block on a wooden base.','pine, tile'),
    'potted fig':info('HK-131','Potted fig',60,'A fig with a forked trunk.','clay, leaves'),
    'box of yellow flowers':info('HK-132','Box of yellow flowers',35,'Marigolds in a white box.','wood, flowers'),
    'kitchen wall clock':info('HK-133','Kitchen wall clock',45,'A round clock.','pine, enamel'),
    'sea print':info('HK-134','Sea print',30,'A sailboat on a blue sea.','paper'),
    'apron hooks':info('HK-135','Apron hooks',25,'Two aprons on hooks.','cotton, steel')});
  PRESETS['Preset Harbor Kitchen 1']=PGK.roomPieces('kitchen').map(([k,x,y])=>[k,+x.toFixed(3),+y.toFixed(3),0]); })();

};
export {pageKitchen};
