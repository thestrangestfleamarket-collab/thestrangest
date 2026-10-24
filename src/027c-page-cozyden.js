// THE COZY DEN KIT: the old game's page room, its pieces as catalog kinds and its preset.
import {CLOCK} from './003b-systems.js';
import {CAT_DEPTS} from './014-gamekit.js';
import {DEEPW, PRESETS} from './023-west-kits.js';
const pageCozyDen=()=>{ '@pagerooms';
// =====================================================================================
// THE COZY DEN (owner, 12 Oct 2026: his picture of a little attic den, "add this to the same walkable game engine as the cottage ... make every
// single thing its own item, full html5 atmosphere on every object, walkable, rotatable"; then: the plush, the poster and the console taken out,
// the bunny a real one, "animated as much as possible ... lived in, shadows"). Drawn in code from the picture (no image: the owner's rule) on the
// page rooms' kit (23-w-page-rooms-0-kit), as the Herb Cottage is: every piece a catalog item (department Cozy Den), the two walls nearest the eye
// cut down to their foot, the door a way in. Bigger than the picture's room (7 x 7 tiles) so there's floor to walk on; every piece at real size.
// Part 1: the floor, the four pink walls with their slanted attic ends, the arched window, the tapestry, the two little pictures, the peg rail
// with the hats and the satchel, the front step. Its walls stop the sun (invisible shadow boxes, `sh` in the kit): their shadows cross the
// floor as the sun goes round, and it comes in at the door. Part 2 (the furniture, the moving things, the catalog) is 23-w-page-rooms-4-cozy-den-2;
// the bunny is 47-bunny; the room stands on Central Park's lawn (26-zzzzzzzzzzzzzzzz-page-rooms).
// =====================================================================================
const CDN=(()=>{ const {C,shd,mix,hh,n1,sstep,rr,seed,wood,item,scene,box,cyl,ell,TX,SKY}=PGK;
  const LX=7, LY=7, WH=3.8, DOOR={a0:1.5,a1:2.6,z1:2.68};
  scene('cozyden',LX,LY,WH,[{wall:'S',...DOOR}]);
  // the picture's colours (quantized from it)
  const PAL={
    wall:C('#e8a58e'),wallL:C('#f0bca2'),wallD:C('#c08070'),beam:C('#7b3433'),beamL:C('#9e433a'),beamD:C('#5a2224'),siding:C('#6e2e2c'),
    floor:C('#a95a44'),floorL:C('#b8684e'),floorD:C('#8a3330'),gap:C('#5e1a16'),
    red:C('#97302b'),redD:C('#721a16'),redDD:C('#4f100e'),cream:C('#e3bd9a'),creamL:C('#f0d8b8'),
    oak:C('#964826'),oakL:C('#ae7544'),oakD:C('#5f362a'),
    straw:C('#dab475'),strawD:C('#b37b40'),strawL:C('#ecd29a'),ribbon:C('#b0302a'),
    wiz:C('#362e66'),wizL:C('#4e4690'),wizD:C('#241d48'),moon:C('#f0d070'),star:C('#fff4c0'),
    scarf:C('#684570'),scarfD:C('#472a60'),scarfL:C('#86609a'),
    leather:C('#6e3c26'),leatherD:C('#411c13'),leatherL:C('#9c6851'),brass:C('#d8a848'),
    gold:C('#c89a48'),sky:C('#a8c4dc'),skyD:C('#7a90b8'),glint:C('#fefffa'),
  };
  // ---- the walls: pink plaster inside, a dark red beam along the top (down the slanted end too), a skirting board; outside dark red siding.
  // Each wall's far end slopes down (the attic's roof), as in the picture: W toward y LY, N toward x LX, E toward y 0, S toward x 0.
  const SL=1.35, DROP=1.25, topAt=d=>WH-DROP*Math.max(0,1-d/SL);                // d: how far from the sloped end
  function denWall(inF,along,endAt,sd,opening){
    return (f,u,v,W,H,x,y,z)=>{ const a=along(x,y), top=topAt(Math.abs(a-endAt));
      if(f==='T')return top<WH-0.02?-1:shd(PAL.beam,(v<1.5||v>H-1.5)?0.8:0.95+0.1*hh(u>>2,0,sd));
      if(z>top)return -1;
      if(z>top-0.2)return shd(z>top-0.04?PAL.beamL:PAL.beam,0.94+0.1*hh(Math.floor(a*TX)>>3,0,sd)*(z<top-0.17?0.7:1));   // the beam along the top
      if(opening&&f!==inF&&(f==='N'||f==='S'||f==='E'||f==='W')&&inF===(f==='N'?'S':f==='S'?'N':f==='E'?'W':'E')){ const o=opening(a,z,1); if(o!==undefined)return o; }
      if(f!==inF){ // outside: dark red boards, lapped
        const b=Math.floor(z*TX/5); let k=0.9+0.12*hh(b,Math.floor(a*TX/40),sd); if((z*TX)%5<1)k*=0.7; if(z<0.12)k*=0.75; return shd(PAL.siding,k); }
      if(opening){ const o=opening(a,z); if(o!==undefined)return o; }
      if(z<0.16)return z>0.13?PAL.beamL:shd(PAL.beam,0.9+0.08*hh(Math.floor(a*TX)>>2,1,sd));   // the skirting board
      // plaster: a soft trowelled texture, a little darker low down and in the back corner, scuffs by the floor, a hairline crack
      const ai=Math.floor(a*TX), zi=Math.floor(z*TX); let k=0.95+0.05*hh(ai>>1,zi>>1,sd)+0.05*(n1(a*3.1,sd)-0.5)+0.04*(n1(z*2.3+a,sd+1)-0.5);
      k*=1-0.08*sstep(0.6,0,z)-0.06*sstep(1.2,0,Math.min(a,1.2))*(endAt?1:0);
      if(z<0.45&&hh(ai>>2,zi>>1,sd+3)<0.035)k*=0.86;                                  // scuffs
      if(Math.abs(z-1.9-0.5*Math.sin(a*1.7+sd))<0.012&&n1(a*2,sd+7)>0.62)k*=0.84;     // a hairline crack
      return shd(PAL.wall,k); }; }
  // the arched window in the north wall: its glass is the world outside (a hole), with a few streaks of light on it; a deep red frame
  const WIN={x0:1.95,x1:3.65,z0:1.05,zs:2.6,z1:3.35}, wmx=(WIN.x0+WIN.x1)/2, whw=(WIN.x1-WIN.x0)/2;
  const winHalf=z=>{ if(z<=WIN.zs)return whw; const t=(z-WIN.zs)/(WIN.z1-WIN.zs); return t>=1?-1:whw*Math.sqrt(Math.max(0,1-t*t)); };
  const inWin=(x,z)=>z>WIN.z0&&z<WIN.z1&&Math.abs(x-wmx)<winHalf(z);
  const outHalf=z=>{ const r=whw+0.12; if(z<WIN.z0-0.12||z>WIN.z1+0.12)return -1; if(z<=WIN.zs)return r; const t=(z-WIN.zs)/(WIN.z1+0.12-WIN.zs); return t>=1?-1:r*Math.sqrt(1-t*t); };
  const winOpen=(a,z,out)=>{ const dx=Math.abs(a-wmx);
    if(inWin(a,z)){ if(Math.abs(z-1.85)<0.035||dx<0.03)return out?PAL.beamD:PAL.beam;                         // the glazing bars
      const s=(a-wmx)*1.3+(z-2.2); if(!out&&(Math.abs(s-0.25)<0.06||Math.abs(s-0.45)<0.025||Math.abs(s+0.55)<0.04))return mix(PAL.glint,PAL.sky,0.35);   // streaks of light on the glass
      return SKY|0x8090a0; }
    const oh=outHalf(z); if(dx<oh)return dx>oh-0.04||z<WIN.z0-0.08?PAL.beamD:shd(PAL.beam,out?0.9:1.05); };   // the frame
  const wW=denWall('E',(x,y)=>y,LY,11), wN=denWall('S',(x,y)=>x,LX,23,winOpen), wE=denWall('W',(x,y)=>y,0,37), wS=denWall('N',(x,y)=>x,0,41);
  const none=()=>-1;   // an invisible box: it only stops the sun (sh)

  // ======================= THE ROOM =======================
  item('cozy den floor',{floor:1});
  // planks along x, a dark gap between them, the joins staggered; worn paler where feet go (door, rug, chair), darker under the furniture's edges
  const wear=(x,y)=>Math.max(0,1-Math.hypot(x-2.05,y-6.3)/1.4)*0.6+Math.max(0,1-Math.hypot(x-3.3,y-5.2)/1.8)*0.35+Math.max(0,1-Math.hypot(x-5.4,y-2.4)/1.0)*0.4;
  const dark=(x,y)=>{ let d=0; for(const [x0,y0,x1,y1,s] of [[0,1.1,0.75,2.9,0.22],[0,3.8,0.62,5.4,0.22],[4.75,0.7,6.05,2.0,0.3],[1.85,4.6,2.6,5.2,0.18],[4.6,5.7,5.25,6.35,0.15],[0,0,LX,0.35,0.08],[0,0,0.35,LY,0.08]]){
      const ex=Math.max(x0-x,0,x-x1), ey=Math.max(y0-y,0,y-y1), e=Math.hypot(ex,ey); if(e<s)d=Math.max(d,1-e/s); } return d; };
  box(0,0,-0.45,LX,LY,0,(f,u,v,W,H,x,y)=>{
    if(f!=='T')return shd(PAL.floorD,0.7+0.1*hh(u>>2,v,1));
    const pw=10, row=Math.floor(v/pw), off=hh(row,0,3)*90, col=Math.floor((u+off)/64);
    let k=0.9+0.13*hh(row,col,4)+0.04*Math.sin(u*0.17+row*1.3)+0.03*(n1(u*0.6,row)-0.5);
    if(v%pw<2)return shd(PAL.gap,0.9+0.1*hh(u>>1,row,5)); if(v%pw<3)k*=1.08; if((u+off)%64<2)k*=0.6;
    if(hh(Math.floor(u/3),row,6)<0.04)k*=0.86;                                         // knots and dents
    if(hh(Math.floor(u),Math.floor(v),7)<0.006)k*=1.25;                                // a nail head catching the light
    let c=shd(hh(row,col,8)<0.3?PAL.floorL:PAL.floor,k); const w=wear(x,y); if(w>0)c=mix(c,shd(PAL.floorL,1.12),Math.min(0.45,w*0.6));
    const dk=dark(x,y); if(dk>0)c=shd(c,1-0.35*dk); return c; },{floor:1,occ:0});

  item('cozy den wall, west');
  box(-0.25,-0.25,-0.45,0,LY,WH,wW,{wallOf:'W',occ:1});
  box(-0.25,0,0,0,LY,WH,none,{sh:1});                                               // (its sun-stopping box: clear of the next wall's, so the ends it shows stay lit)
  item('cozy den wall, north');
  box(-0.25,-0.25,-0.45,LX,0,WH,wN,{wallOf:'N',occ:1});
  box(-0.25,-0.25,0,LX,0,WH,none,{sh:1});
  item('cozy den wall, east');
  box(LX,-0.25,-0.45,LX+0.25,LY+0.25,WH,wE,{wallOf:'E',occ:1});
  box(LX,0,0,LX+0.25,LY+0.25,WH,none,{sh:1});
  item('cozy den wall, south');
  box(-0.25,LY,-0.45,LX+0.25,LY+0.25,WH,wS,{wallOf:'S',occ:1});
  box(0,LY,0,DOOR.a0,LY+0.25,WH,none,{sh:1}); box(DOOR.a1,LY,0,LX+0.25,LY+0.25,WH,none,{sh:1}); box(DOOR.a0,LY,DOOR.z1,DOOR.a1,LY+0.25,WH,none,{sh:1});

  item('arched window frame',{wall:1});
  // the sill and the frame's depth, inside (the frame's face is painted on the wall)
  box(WIN.x0-0.2,0,WIN.z0-0.12,WIN.x1+0.2,0.17,WIN.z0-0.02,(f,u,v,W,H)=>f==='T'?shd(PAL.beamL,(v>H-1.2)?0.8:1+0.06*hh(u>>2,v,3)):shd(PAL.beam,v<1?1.1:0.9),{wall:'N'});
  box(WIN.x0-0.08,0,WIN.z0-0.02,WIN.x1+0.08,0.06,WIN.z0,PAL.beamD,{wall:'N',small:1});
  box(WIN.x0,0.06,WIN.z0,WIN.x1,0.8,WIN.zs+0.5,none,{wall:'N'});                       // (room for the dust in its light: drawn moving, part 2)

  item('red mountain tapestry',{wall:1});
  // a woven hanging: a red field, a cream key border, a mountain under a big sun, fringe at the foot, hung from a rod
  { const y0=0.85,y1=3.05,z0=1.55,z1=3.3;
    box(0,y0,z0,0.05,y1,z1,(f,u,v,W,H)=>{ if(f!=='E')return PAL.redDD;
      const wv=(Math.floor(u)+Math.floor(v))%2?1:0.93;                                 // the weave
      if(v>H-3)return Math.floor(u)%2?shd(PAL.cream,0.9):-1;                          // the fringe
      const b=Math.min(u,W-u,v,H-3-v);
      if(b<1.5)return shd(PAL.redD,wv);
      if(b<6.5){ const q=b<2.5||b>5.5; if(q)return shd(PAL.cream,wv); const s=(Math.floor((u+v)/4)%2), t=Math.floor(u/4)%3===0||Math.floor(v/4)%3===0; return shd(s&&t?PAL.cream:PAL.red,wv); }   // the key border
      const iu=u-6.5, iv=v-6.5, iw=W-13, ih=H-3-13;
      const sx=iw*0.42, sy=ih*0.38, sr=Math.min(iw,ih)*0.2; if(Math.hypot(iu-sx,iv-sy)<sr)return shd(PAL.redDD,wv*1.1);   // the sun
      const ridge=ih*0.55-Math.max(0,iw*0.42-Math.abs(iu-iw*0.5))*0.75-Math.max(0,iw*0.18-Math.abs(iu-iw*0.25))*0.5;
      if(iv>ridge){ return shd(iv<ridge+2?PAL.redDD:PAL.redD,wv); }                    // the mountains
      if(iv>ih-4)return shd(PAL.redD,wv);
      return shd(PAL.red,wv*(0.96+0.06*hh(Math.floor(u/3),Math.floor(v/3),5))); },{wall:'W'});
    box(0,y0-0.12,z1,0.08,y1+0.12,z1+0.06,(f,u,v)=>shd(PAL.oakD,v<1?1.2:1),{wall:'W',small:1});          // the rod
    for(const yy of [y0-0.12,y1+0.08])box(0,yy,z1-0.02,0.1,yy+0.04,z1+0.1,PAL.oakD,{wall:'W',small:1}); }

  item('two small framed pictures',{wall:1});
  // a landscape (blue sky, a green hill, a yellow path) above a little purple one with a white figure, in light oak frames
  { const fr=(u,v,W,H,inner)=>{ if(u<1.5||v<1.5||u>W-1.5||v>H-1.5)return (u<0.8||v<0.8)?PAL.strawL:PAL.strawD; if(u<2.5||v<2.5||u>W-2.5||v>H-2.5)return PAL.creamL; return inner(u-2.5,v-2.5,W-5,H-5); };
    box(0.75,0,2.45,1.35,0.05,3.1,(f,u,v,W,H)=>f!=='S'?PAL.strawD:fr(u,v,W,H,(a,b,w,h)=>{ if(b>h*0.62+Math.sin(a*0.4)*1.5)return Math.abs(a-w*0.55-(b-h)*0.4)<1.2?C('#d8c070'):C('#5a9a50');
      if(Math.hypot(a-w*0.75,b-h*0.25)<2)return C('#fff0c0'); return b<h*0.3?C('#78b0e0'):C('#a8d0ec'); }),{wall:'N'});
    box(0.82,0,1.65,1.28,0.05,2.3,(f,u,v,W,H)=>f!=='S'?PAL.strawD:fr(u,v,W,H,(a,b,w,h)=>{ const cx=w/2; if(Math.hypot(a-cx,b-h*0.3)<2.2)return C('#f4ecf8'); if(b>h*0.42&&b<h*0.9&&Math.abs(a-cx)<1.6+(b-h*0.42)*0.25)return C('#e8e0f0');
      return hh(Math.floor(a/2),Math.floor(b/2),3)<0.15?C('#b8a8e0'):C('#8f80c8'); }),{wall:'N'}); }

  item('peg rail with hats and a satchel',{wall:1});
  // a board on the north wall with four pegs: the straw hat with its red ribbon, the purple scarf, the satchel on its strap, the wizard's hat
  { const z=2.25, x0=4.45, x1=6.35, W_=wood(PAL.oakL,{seed:61});
    box(x0,0,z-0.1,x1,0.06,z+0.12,W_,{wall:'N'});
    const pegs=[4.75,5.2,5.6,6.05]; for(const px of pegs)box(px-0.03,0,z-0.03,px+0.03,0.18,z+0.03,PAL.oakD,{wall:'N',small:1});
    // the straw hat: hung by its crown from the first peg, brim facing the room (an upright disc and a crown)
    { const cx=4.75, cz=z-0.2; box(cx-0.36,0.18,cz-0.36,cx+0.36,0.24,cz+0.36,(f,u,v,W,H,x,y,zz)=>{ const d=Math.hypot(x-cx,zz-cz)/0.36; if(d>1)return -1;
        if(d<0.55&&d>0.47)return shd(PAL.ribbon,1.05);                                    // the ribbon round the crown
        const ang=Math.atan2(zz-cz,x-cx), weave=(Math.floor(d*14)+Math.floor((ang+3.2)*6))%2; let c=shd(d<0.47?PAL.straw:PAL.strawL,weave?1:0.9); if(d>0.9)c=shd(PAL.strawD,1); if(zz>cz+0.15&&x<cx)c=shd(c,1.1); return c; },{wall:'N',small:1});
      box(cx-0.04,0.24,cz-0.55,cx+0.02,0.27,cz-0.18,PAL.ribbon,{wall:'N',small:1}); box(cx+0.05,0.24,cz-0.5,cx+0.1,0.27,cz-0.2,shd(PAL.ribbon,0.8),{wall:'N',small:1}); }   // its ribbon's tails
    // the scarf: a long purple loop down from the second peg, a fringe at its ends
    for(let i=0;i<14;i++){ const t=i/13, zz=z-0.05-t*1.05, sw=Math.sin(t*2.4)*0.05; box(5.12+sw,0.1,zz-0.09,5.3+sw,0.16,zz,(f,u,v,W,H)=>{ const s=Math.floor(u)%4===0; if(t>0.95&&v>H-2)return Math.floor(u)%2?PAL.scarfL:-1; return shd(i%5===4?PAL.scarfD:PAL.scarf,s?0.85:1+0.06*hh(Math.floor(u),i,4)); },{wall:'N',small:1}); }
    // the satchel: a strap from the third peg, the bag below it with its flap and two brass buckles
    box(5.55,0.08,z-0.75,5.59,0.11,z,PAL.leatherD,{wall:'N',small:1}); box(5.84,0.08,z-0.75,5.88,0.11,z-0.05,PAL.leatherD,{wall:'N',small:1});
    box(5.42,0.05,z-1.25,6.02,0.24,z-0.72,(f,u,v,W,H)=>{ if(f==='T')return PAL.leatherD; if(f!=='S')return shd(PAL.leather,0.8);
      if(v<H*0.55){ if(Math.abs(v-H*0.55)<1.2)return PAL.leatherD; if((Math.abs(u-W*0.28)<1.2||Math.abs(u-W*0.72)<1.2)&&v>H*0.35)return PAL.brass; return shd(PAL.leatherL,0.95+0.06*hh(u>>1,v>>1,5)); }
      return shd(PAL.leather,(v>H-1.2?0.75:1)*(0.95+0.06*hh(u>>1,v>>1,6))); },{wall:'N'});
    // the wizard's hat: a tall purple cone, its tip flopped over, a gold moon and stars, on the last peg
    { const cx=6.05, zb=z-0.52, R=0.32, Hc=0.95; box(cx-R-0.12,0.1,zb,cx+R+0.18,0.3,zb+Hc,(f,u,v,W,H,x,y,zz)=>{ const t=(zz-zb)/Hc, hw=R*(1-t)+0.03, bend=t>0.7?(t-0.7)*0.8:0, dx=x-cx-bend;
        if(t<0.08){ return Math.abs(x-cx)<R+0.12?shd(PAL.wizD,t<0.03?0.8:1.05):-1; }     // the brim, edge on
        if(Math.abs(dx)>hw)return -1;
        const mu=(x-cx+0.05), mz=zz-zb-0.42; if(Math.hypot(mu,mz)<0.13&&Math.hypot(mu-0.05,mz+0.02)>0.11)return PAL.moon;   // the moon
        const sx=Math.floor((x-cx)*TX*1.0), sz=Math.floor((zz-zb)*TX*1.0); if(hh(sx,sz,9)<0.03&&t<0.8)return PAL.star;  // stars
        return shd(dx<-hw*0.3?PAL.wizL:PAL.wiz,0.95+0.06*hh(sx>>1,sz>>1,8)); },{wall:'N'}); } }

  item('front step, cozy den',{flat:1});
  // a broad plank step outside the door, worn in the middle
  box(DOOR.a0-0.2,LY+0.25,0,DOOR.a1+0.2,LY+0.95,0.02,(f,u,v,W,H)=>{ const pl=Math.floor(v/8); let k=0.9+0.1*hh(pl,Math.floor(u/30),3); if(v%8<1)return PAL.gap; if(v<1)k*=1.15;
    k*=1+0.12*Math.max(0,1-Math.abs(u-W/2)/(W*0.3)); return shd(PAL.floor,k); },{solid:0,occ:0});

  return {PAL,LX,LY,WH,DOOR,WIN}; })();

// =====================================================================================
// THE COZY DEN, part 2 (see part 1): the furniture as the picture has it, each piece its own catalog item at real size: the big-leaf plant on
// its stand, the TV stand and the old TV, the bookshelf with the lava lamp and the cactus on top, the popcorn bucket (and what's spilled), the
// bunny's bowls, the round rug, the easel with its painting, the sketchbook and the brushes, the bunny's box, the side table and its lamp, the
// odds and ends on the floor, the doormat, the leather recliner and its tray with a cup of tea. Three lights (the TV's blue, the lava lamp's
// orange, the table lamp's warm), on by day too, as in the picture. Moving, each its own moving picture (24: lifeDraw, about 8 times a second,
// only while on screen): the TV's programme, the lava lamp's wax, the water bowl's glints, the tea's steam, dust in the window's light by day.
// The heavy pieces stop the sun (sh). The department Cozy Den and "Preset Cozy Den 1".
// =====================================================================================
(()=>{ const {C,shd,mix,hh,n1,sstep,rr,seed,wood,item,box,cyl,ell,lamp,leafE,bookStand,bookLying,ZS,TX,E1}=PGK, {PAL,LX,LY,WIN}=CDN;
  const P2={tv:C('#64657e'),tvD:C('#2c2c3e'),tvL:C('#8d8b96'),screen:C('#3a5a6a'),stand:C('#8a3925'),standD:C('#583028'),standL:C('#ad7356'),
    rug:C('#8d2721'),rugD:C('#742a21'),rugG:C('#d0903a'),rugGD:C('#a86a2a'),seat:C('#4a1a20'),seatD:C('#371019'),seatL:C('#6a2c32'),seatH:C('#8c4944'),
    card:C('#c98a42'),cardL:C('#ddb070'),cardD:C('#a06a30'),tape:C('#a83828'),grey:C('#6e7486'),greyD:C('#4a4e5e'),greyL:C('#9aa0b0'),
    water:C('#5ab0c8'),leaf:C('#3e6a3c'),leafD:C('#1f3c22'),leafL:C('#5e8a4c'),pot:C('#e0d2b4'),potD:C('#b8a688'),terra:C('#a8533a'),cactus:C('#5d7a3d'),cactusL:C('#7c9a52'),
    shade:C('#f6eab4'),shadeD:C('#d8c48a'),base:C('#4a2320'),paper:C('#f2e8d4'),paperD:C('#d4c6aa'),canvas:C('#978db6'),orange:C('#e8781c'),carrotTop:C('#5a9a3a')};
  const solid={sh:1};

  item('big-leaf plant on a stand');
  // a low round stand, a cream pot, the split leaves of a monstera on long stems arching out (the back ones darker)
  { const x=0.6,y=0.6; cyl(x,y,0.26,0.22,0.28,wood(PAL.oak,{seed:3,along:'u'})); for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]])box(x+a*0.15-0.025,y+b*0.15-0.025,0,x+a*0.15+0.025,y+b*0.15+0.025,0.22,PAL.oakD,{small:1});
    cyl(x,y,0.15,0.28,0.66,(f,u,v,W,H)=>f==='T'?(hh(u,v,5)<0.2?C('#3a2a1c'):C('#2a1e14')):shd(P2.pot,(v<2?1.12:1)*(v>H-1.2?0.82:1)*(0.96+0.05*hh(u>>1,0,4))),{},0.19);
    seed(71); const split=(c)=>(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ const a=Math.atan2(ly,lx), d=Math.hypot(lx,ly);
      if(d>0.35&&d<0.9&&Math.abs(Math.sin(a*5))<0.18)return -1;                      // the leaf's splits
      if(Math.abs(lx)<0.07&&d<0.85)return shd(c,1.25); if(d>0.85)return shd(c,0.75); return shd(c,0.97+0.06*hh(Math.floor(lx*9),Math.floor(ly*9),3)); };
    for(let i=0;i<11;i++){ const a=i*2.39+0.3, d=0.22+0.22*((i*7)%5)/5, z=0.85+((i*3)%7)*0.11, s=rr(0.2,0.27), c=i<3?P2.leafD:i%3?P2.leaf:P2.leafL, lx=x+Math.cos(a)*d, ly=y+Math.sin(a)*d;
      cyl((x+lx)/2,(y+ly)/2,0.012,0.6,z,P2.leafD,{small:1});
      ell(lx,ly,z,i%2?s:s*0.75,i%2?s*0.75:s,0.05,split(c),{small:1}); } }

  item('tv stand with drawers');
  // wood, a drawer stack on the left with brass knobs, an open cubby on the right, a dark plinth; scuffed along its top edge
  { const x0=0.05,x1=0.62,y0=1.1,y1=2.9,h=0.6, Wd=wood(P2.stand,{seed:8,along:'u'});
    box(x0,y0,0,x1,y1,h,(f,u,v,W,H)=>{ if(f==='T')return shd(P2.stand,(u<1||v<1)?1.15:(u>W-1||v>H-1)?0.8:0.95+0.07*hh(u>>2,v,3));
      if(f!=='E')return shd(P2.standD,0.95+0.05*hh(u>>2,v>>2,2));
      if(v>H-2)return P2.standD; if(v<1)return shd(P2.standL,1.05); if(u<1.2||u>W-1.2)return P2.standD;
      const split=W*0.45; if(Math.abs(u-split)<0.8)return P2.standD;
      if(u<split){ const dh=(H-2)/2; const r=v<1+dh?0:1, rv=(v-1)-r*dh; if(rv<0.8||rv>dh-0.6)return P2.standD;                  // two drawers
        if(Math.abs(u-split/2)<1.2&&Math.abs(rv-dh/2)<1)return PAL.gold;
        return Wd(f,u,v,W,H); }
      if(v>H-4)return shd(P2.standD,0.9); return shd(C('#2a1612'),0.9+0.15*sstep(4,0,v-1)); },solid);   // the cubby: dark inside, a little light at its mouth
    box(x0+0.04,y0+0.04,-0.02,x1-0.02,y1-0.04,0.06,P2.standD,{small:1}); }

  item('old tv');
  // a grey-blue tube set: a deep back, a bezel with the glass bulging a little, a smiley sticker, two knobs and a speaker grille on its right
  { const x0=0.3,x1=0.72,y0=1.55,y1=2.45,z0=0.6,z1=1.25;
    box(0.08,1.68,z0+0.03,x0,2.32,z1-0.08,(f,u,v,W,H)=>f==='T'?shd(P2.tv,0.95):shd(P2.tvD,(Math.floor(u)%4===0&&v>3&&v<H-3)?0.7:1+0.06*hh(u,v>>1,3)),{sh:1});
    box(x0,y0,z0,x1,y1,z1,(f,u,v,W,H)=>{ if(f==='T')return shd(P2.tv,(u>W-1.2||v<1)?1.15:0.95+0.05*hh(u>>1,v>>1,4));
      if(f!=='E')return shd(P2.tv,(v<1?1.12:v>H-1?0.8:1)*(Math.floor(v)%3===0&&u>W*0.3&&u<W*0.7&&v>H*0.5?0.85:1));            // vents on its sides
      if(u<1||v<1)return shd(P2.tvL,1.05); if(u>W-1||v>H-1)return P2.tvD;
      const sx0=2.5,sx1=W*0.74,sy0=2.5,sy1=H-3.5, ex=Math.min(u-sx0,sx1-u,v-sy0,sy1-v);
      if(ex>=0){ if(ex<1)return P2.tvD; const g=(u-sx0)/(sx1-sx0), q=(v-sy0)/(sy1-sy0), vig=Math.hypot(g-0.5,q-0.5);    // the glass (its still picture: the programme moves over it)
        return E1|shd(P2.screen,(1.25-vig*0.8)*(Math.floor(v)%2?0.92:1)); }
      if(ex>-1.2)return shd(P2.tvD,1.2);
      if(u>W*0.79){ const k=u-W*0.79; if(Math.hypot(k-(W*0.21)/2+0.5,v-4)<1.6)return P2.tvD; if(Math.hypot(k-(W*0.21)/2+0.5,v-8.5)<1.2)return P2.tvD;   // the knobs
        if(v>11&&v<H-3&&Math.floor(v)%2===0)return P2.tvD; }                          // the speaker grille
      if(Math.hypot(u-4,v-(H-2))<1.6)return Math.hypot(u-3.5,v-(H-2.4))<0.5||Math.hypot(u-4.6,v-(H-2.4))<0.5||(Math.abs(v-(H-1.5))<0.45&&Math.abs(u-4)<0.9)?C('#5a4010'):C('#f0d040');   // the smiley
      return shd(P2.tv,0.96+0.05*hh(u>>1,v>>1,6)); },solid);
    lamp(1.05,2.0,0.95,3.4,[0.45,0.62,1.0],1.2); }

  item('little bookshelf');
  // three shelves of books (some leaning, one lying), a globe, a little brass figure; scuffs on its front edge
  { const x0=0.05,x1=0.5,y0=3.8,y1=5.4,h=1.3,t=0.06, W_=wood(PAL.oak,{seed:31,along:'u'}), Wd=wood(PAL.oakD,{seed:32});
    box(x0,y0,0,x1,y0+t,h,W_,{sh:1}); box(x0,y1-t,0,x1,y1,h,W_,{sh:1}); box(x0,y0,0,x0+0.04,y1,h,Wd);
    box(x0,y0,h-t,x1+0.02,y1,h,(f,u,v,W,H)=>f==='T'?shd(PAL.oakL,(u<1||v<1)?1.12:(u>W-1)?0.8:0.95+0.06*hh(u>>2,v,3)*(hh(u>>3,v>>2,4)<0.1?0.8:1)):shd(PAL.oak,v<1?1.15:0.9));
    box(x0,y0,0,x1,y1,0.12,(f,u,v,W,H)=>f==='T'?PAL.oakD:shd(PAL.oakD,v<1?1.2:1));
    for(const s of [0.5,0.9])box(x0+0.04,y0+t,s-0.04,x1,y1-t,s,(f,u,v,W,H)=>f==='T'?shd(PAL.oak,0.9+0.08*hh(u>>2,v,s*9)):shd(PAL.oakL,v<1?1.1:0.95));
    seed(33); const cols=['#8a2a28','#2f6a46','#3a4a7a','#c8a050','#6a3a6a','#d8d0b8','#a04a2a','#2a3a5a','#7a8a3a'];
    // bottom shelf: a row of books, the last few leaning, one lying flat
    { let y=y0+t+0.02, i=0; while(y<y1-t-0.42){ const w=rr(0.06,0.1), hb=rr(0.3,0.36); bookStand(0.1,y,0.12,0.44,y+w,hb,C(cols[i%cols.length]),'E'); y+=w+0.004; i++; }
      bookLying(0.1,y1-t-0.4,0.12,0.44,y1-t-0.02,0.08,C('#3a4a7a'),{spine:'E'}); bookLying(0.12,y1-t-0.38,0.2,0.42,y1-t-0.04,0.06,C('#c8b890'),{spine:'E'}); }
    // middle shelf: books to the left, the globe on its stand
    { let y=y0+t+0.02, i=3; while(y<y0+0.75){ const w=rr(0.06,0.09), hb=rr(0.28,0.34); bookStand(0.1,y,0.5,0.44,y+w,hb,C(cols[i%cols.length]),'E'); y+=w+0.004; i++; }
      const gx=0.27, gy=4.95; cyl(gx,gy,0.07,0.5,0.53,PAL.gold,{small:1}); cyl(gx,gy,0.012,0.53,0.6,PAL.gold,{small:1});
      ell(gx,gy,0.72,0.12,0.12,0.12,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ const lon=Math.atan2(ly,lx), land=n1(lon*3+2,5)*n1(lz*4+3,6)>0.3; let c=land?C('#5a9a50'):C('#3a78b8'); if(Math.abs(lz)>0.88)c=C('#e8f0f0'); if(lx<-0.3&&lz>0.2)c=shd(c,1.2); return c; },{small:1});
      box(gx-0.01,gy-0.13,0.6,gx+0.01,gy+0.13,0.86,(f,u,v,W,H,x,y,z)=>{ const d=Math.hypot(y-gy,z-0.72); return Math.abs(d-0.125)<0.012?PAL.gold:-1; },{small:1}); }   // its meridian
    // top shelf: standing books, then a little brass figure
    { let y=y0+t+0.02, i=5; while(y<y0+1.05){ const w=rr(0.06,0.1), hb=rr(0.3,0.36); bookStand(0.1,y,0.9,0.44,y+w,hb,C(cols[i%cols.length]),'E'); y+=w+0.004; i++; }
      cyl(0.27,5.15,0.04,0.9,0.94,PAL.gold,{small:1}); ell(0.27,5.15,1.02,0.035,0.035,0.08,shd(PAL.gold,1.1),{small:1}); ell(0.27,5.15,1.12,0.03,0.03,0.03,shd(PAL.gold,1.15),{small:1}); } }

  item('lava lamp');
  // on the bookshelf: a dark cone base, a tapered glass of orange wax (it moves: its moving picture), a cap
  { const x=0.27,y=5.05,z=1.3; cyl(x,y,0.085,z,z+0.14,(f,u,v,W,H)=>f==='T'?PAL.beamD:shd(C('#3a2a30'),(v<1?1.3:1)*(Math.abs((u%W)/W-0.3)<0.05?1.4:1)),{small:1},0.06);
    cyl(x,y,0.06,z+0.14,z+0.62,(f,u,v,W,H)=>f==='T'?E1|C('#ff9040'):E1|shd(C('#e8582a'),1+0.15*sstep(0.6,0,v/H)),{small:1},0.045);
    cyl(x,y,0.045,z+0.62,z+0.7,(f,u,v,W,H)=>f==='T'?C('#2a1e24'):shd(C('#3a2a30'),v<1?1.3:1),{small:1},0.03);
    lamp(x+0.15,y,z+0.45,2.6,[1,0.45,0.2],1.1); }

  item('small cactus in a pot');
  { const x=0.27,y=4.2,z=1.3; cyl(x,y,0.08,z,z+0.14,(f,u,v,W,H)=>f==='T'?C('#4a3020'):shd(P2.terra,v<2?1.15:0.95+0.06*hh(u>>1,0,3)),{small:1},0.1);
    const spine=(c)=>(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>{ const a=Math.atan2(ly,lx); let k=Math.cos(a*6)>0.6?1.18:Math.cos(a*6)<-0.6?0.82:1; if(hh(Math.floor(a*9),Math.floor(lz*8),5)<0.08)return C('#f0ecd8'); return shd(c,k); };
    ell(x,y,z+0.32,0.06,0.06,0.2,spine(P2.cactus),{small:1}); ell(x+0.05,y-0.02,z+0.28,0.035,0.035,0.08,spine(P2.cactusL),{small:1}); ell(x-0.05,y+0.02,z+0.24,0.03,0.03,0.06,spine(P2.cactusL),{small:1});
    ell(x,y,z+0.53,0.03,0.03,0.025,C('#e870a0'),{small:1}); }

  item('popcorn bucket',{walk:1});
  { const x=0.45,y=6.15; cyl(x,y,0.13,0,0.34,(f,u,v,W,H)=>f==='T'?C('#3a3e4a'):shd(P2.grey,(v<1.5?1.2:1)*(Math.abs((u%W)/W-0.25)<0.04?1.25:1)*(v>H-1?0.75:1)*(0.96+0.05*hh(u>>1,v>>2,3))),{sh:1},0.17);
    seed(41); for(let i=0;i<16;i++){ const a=rr(0,6.28), d=rr(0,0.13); ell(x+Math.cos(a)*d,y+Math.sin(a)*d,0.34+rr(0,0.06),0.035,0.035,0.03,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>lz>0.3?C('#fff4dc'):hh(i,0,2)<0.4?C('#e8c070'):C('#f0e0c0'),{small:1}); } }
  item('spilled popcorn',{flat:1});
  { seed(43); for(let i=0;i<14;i++){ const x=rr(0.5,1.5), y=rr(5.65,6.75); ell(x,y,0.025,0.04,0.04,0.025,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>lz>0.2?C('#fff2d8'):C('#e2c88a'),{small:1,solid:0}); } }

  item('bunny food bowl with a carrot',{walk:1});
  // a heavy dark bowl, pellets in it, a carrot with its leaves across the top
  { const x=1.45,y=0.45; cyl(x,y,0.16,0,0.08,(f,u,v,W,H)=>{ if(f!=='T')return shd(P2.greyD,v<1?1.3:1); const d=Math.hypot(u-W/2,v-H/2)/(W/2); if(d>0.8)return shd(P2.grey,d>0.92?0.8:1.1); return hh(u>>1,v>>1,4)<0.5?C('#8a7040'):C('#a88a50'); },{},0.14);
    ell(x+0.02,y,0.1,0.13,0.035,0.035,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>shd(P2.orange,(Math.abs(Math.sin(lx*14))<0.15?0.82:1)*(lz>0.4?1.15:1)),{small:1});
    for(const [a,b] of [[-0.16,-0.03],[-0.19,0.02],[-0.17,0.04]])leafE(x+a,y+b,0.12,0.05,0.025,0.012,P2.carrotTop); }

  item('bunny water bowl',{walk:1});
  { const x=2.0,y=0.5; cyl(x,y,0.15,0,0.08,(f,u,v,W,H)=>{ if(f!=='T')return shd(P2.greyL,(v<1?1.2:1)*(Math.abs((u%W)/W-0.3)<0.05?1.2:1)); const d=Math.hypot(u-W/2,v-H/2)/(W/2); if(d>0.78)return shd(P2.grey,d>0.92?0.8:1.12); return shd(P2.grey,0.55); },{},0.13); }   // (its water is real water: the moving picture, below)

  item('round rug, red and gold',{flat:1});
  // a red field, a gold ring round a red centre, a dark edge; flattened and a little paler where the chair's feet and yours go
  { const cx=3.2,cy=3.2,R=1.6; cyl(cx,cy,R,0,0.018,(f,u,v,W,H,x,y)=>{ if(f!=='T')return P2.rugD; const d=Math.hypot(u-W/2,v-H/2)/(W/2), a=Math.atan2(v-H/2,u-W/2);
      const wv=(Math.floor(u)+Math.floor(v))%2?1:0.94;
      if(d>0.96)return shd(P2.rugD,0.85*wv); if(d>0.9)return shd(P2.rug,wv);
      if(d>0.72&&d<0.86){ const st=Math.abs(d-0.79)<0.012||(d<0.74||d>0.84); return shd(st?P2.rugGD:P2.rugG,wv*(0.96+0.06*hh(Math.floor(a*40),0,3))); }
      if(d<0.32&&d>0.26)return shd(P2.rugG,wv);
      if(d<0.1)return shd(P2.rugGD,wv);
      let c=shd(P2.rug,wv*(0.95+0.07*hh(u>>1,v>>1,5))); const worn=Math.max(0,1-Math.hypot(x-3.6,y-4.6)/1.2); if(worn>0)c=mix(c,C('#a85040'),worn*0.35);
      if(hh(u,v,9)<0.004)c=C('#e8c070');                                              // a crumb or two
      return c; },{solid:0,occ:0}); }

  item('easel with a painting');
  // three legs (stepped, leaning in), a ledge, the canvas facing the room: a lilac night with snow and a white bunny in it
  { const x=3.95,y=4.25, Wl=wood(PAL.oakL,{seed:51});
    for(let k=0;k<8;k++){ const z=k*0.2, lean=(1.6-z)*0.05; box(x-0.03,y-0.26+lean,z,x+0.02,y-0.22+lean,z+0.21,Wl,{small:1}); box(x-0.03,y+0.22-lean,z,x+0.02,y+0.26-lean,z+0.21,Wl,{small:1}); box(x-0.36+(1.6-z)*0.18,y-0.02,z,x-0.32+(1.6-z)*0.18,y+0.02,z+0.21,Wl,{small:1}); }
    box(x-0.04,y-0.3,0.66,x+0.08,y+0.3,0.72,Wl,{small:1});
    box(x-0.02,y-0.32,0.72,x+0.04,y+0.32,1.5,(f,u,v,W,H)=>{ if(f!=='E')return f==='T'?PAL.creamL:shd(P2.paperD,0.9); if(u<1||v<1||u>W-1||v>H-1)return P2.paperD;
      const a=u/W, b=v/H; if(Math.hypot(a-0.5,b-0.42)<0.16||(Math.abs(a-0.42)<0.05&&b>0.12&&b<0.32)||(Math.abs(a-0.56)<0.05&&b>0.1&&b<0.3))return Math.hypot(a-0.44,b-0.42)<0.025?C('#3a2a4a'):C('#f6f0f4');   // the bunny
      if(b>0.72)return Math.abs(Math.sin(a*12+b*6))<0.25?C('#cfc6e8'):C('#e8e4f4');      // snow on the ground
      if(hh(Math.floor(u/2),Math.floor(v/2),7)<0.06)return C('#f8f4ff');               // falling snow
      return shd(P2.canvas,0.92+0.12*n1(u*0.2+v*0.1,4)); },{sh:1});
    box(x-0.02,y-0.06,1.5,x+0.04,y+0.06,1.6,Wl,{small:1}); }

  item('sketchbook and loose pages',{flat:1});
  { box(4.4,3.3,0,4.95,3.75,0.025,(f,u,v,W,H)=>{ if(f!=='T')return P2.paperD; if(Math.abs(u-W/2)<0.6)return shd(P2.paperD,0.8); if(Math.floor(v)%4===0&&u>3&&u<W-3&&Math.abs(u-W/2)>3)return C('#c8bca8');
      if(u>W/2+2&&Math.hypot(u-W*0.75,v-H*0.45)<4&&Math.hypot(u-W*0.75,v-H*0.45)>3.2)return C('#6a6070'); return P2.paper; },{solid:0,occ:0});
    box(4.95,3.55,0,5.3,3.9,0.012,(f,u,v,W,H)=>(Math.floor(v)%4===0&&u>2&&u<W-2)?C('#c8bca8'):shd(P2.paper,0.97),{solid:0,occ:0}); }

  item('paintbrushes and a tube of paint',{flat:1});
  { box(5.1,3.95,0,5.55,3.99,0.03,(f,u,v,W,H)=>u<W*0.65?C('#8a4a2a'):u<W*0.8?C('#c8c8d0'):C('#2a2028'),{solid:0,occ:0});
    box(5.15,4.08,0,5.5,4.11,0.03,(f,u,v,W,H)=>u<W*0.6?C('#3a5a9a'):u<W*0.78?C('#c8c8d0'):C('#e05a3a'),{solid:0,occ:0});
    box(5.0,4.2,0,5.26,4.3,0.05,(f,u,v,W,H)=>u>W-2?C('#d8d8e0'):u>W*0.3&&u<W*0.7?C('#4a6ab0'):C('#e8e8f0'),{solid:0,occ:0});
    ell(5.32,4.25,0.01,0.04,0.035,0.01,C('#4a6ab0'),{small:1,solid:0}); }        // a dab squeezed out

  item('bunny box');
  // an open cardboard box, its flaps folded out, a red stripe on its side; a soft cream blanket and some hay inside: the bunny's home (47-bunny)
  { const x0=1.85,y0=4.6,x1=2.6,y1=5.2,h=0.27, T=0.025;
    const side=(f,u,v,W,H,x,y,z)=>{ const inside=(f==='E'&&x<x0+0.1)||(f==='W'&&x>x1-0.1)||(f==='S'&&y<y0+0.1)||(f==='N'&&y>y1-0.1); if(f==='T')return P2.cardL;
      if(inside)return shd(P2.cardD,0.85+0.1*(z/h));
      if((f==='S'||f==='E')&&Math.abs(z-h*0.5)<0.07)return shd(P2.tape,0.95+0.06*hh(Math.floor(u),0,3));
      if(Math.abs(z-h*0.5)<0.075)return P2.cardD;
      return shd(P2.card,(v<1?1.12:1)*(0.95+0.06*hh(u>>1,v>>2,4))*(hh(u>>2,v>>2,9)<0.04?0.85:1)); };
    box(x0,y0,0,x1,y1,0.03,P2.cardD);
    box(x0,y0,0,x0+T,y1,h,side,{sh:1}); box(x1-T,y0,0,x1,y1,h,side,{sh:1}); box(x0,y0,0,x1,y0+T,h,side,{sh:1}); box(x0,y1-T,0,x1,y1,h,side,{sh:1});
    const flap=(f,u,v,W,H)=>shd(P2.cardL,(f==='T'?1:0.85)*(0.95+0.06*hh(u>>1,v>>1,6)));
    box(x0-0.22,y0+0.05,h-0.02,x0,y1-0.05,h,flap,{small:1}); box(x1,y0+0.05,h-0.02,x1+0.2,y1-0.05,h,flap,{small:1}); box(x0+0.05,y0-0.2,h-0.02,x1-0.05,y0,h,flap,{small:1});
    box(x0+T,y0+T,0.03,x1-T,y1-T,0.1,(f,u,v,W,H)=>{ if(f!=='T')return PAL.creamL; const fold=Math.sin(u*0.5+Math.sin(v*0.3)*2); return shd(C('#f0e4cc'),fold>0.6?1.06:fold<-0.6?0.88:0.97); });
    seed(45); for(let i=0;i<10;i++){ const x=rr(x0+0.06,x1-0.06), y=rr(y0+0.06,y1-0.06); box(x,y,0.1,x+rr(0.06,0.12),y+0.01,0.11,C(i%2?'#d8c070':'#c0a050'),{small:1}); } }

  item('side table');
  // a square table: a drawer in its apron with a little knob, four straight legs
  { const x0=4.62,y0=5.7,x1=5.24,y1=6.32,h=0.66, Wd=wood(PAL.oak,{seed:61,along:'u'});
    box(x0,y0,h-0.06,x1,y1,h,(f,u,v,W,H)=>f==='T'?shd(PAL.oak,(u<1||v<1)?1.12:(u>W-1||v>H-1)?0.8:0.95+0.07*hh(u>>2,v,3)):shd(PAL.oakL,v<1?1.1:0.95),solid);
    box(x0+0.04,y0+0.04,h-0.2,x1-0.04,y1-0.04,h-0.06,(f,u,v,W,H)=>{ if(f==='S'||f==='E'){ if(Math.abs(u-W/2)<1.2&&Math.abs(v-H/2)<1)return PAL.gold; if(u<1.5||u>W-1.5||v<1||v>H-1)return P2.standD; } return shd(PAL.oak,0.9+0.06*hh(u>>2,v,4)); },solid);
    for(const [lx,ly] of [[x0+0.04,y0+0.04],[x1-0.1,y0+0.04],[x0+0.04,y1-0.1],[x1-0.1,y1-0.1]])box(lx,ly,0,lx+0.06,ly+0.06,h-0.2,Wd,{small:1}); }

  item('table lamp');
  // on the side table: a dark round base, a brass stem, a cream shade lit from inside (on by day too, as in the picture)
  { const x=4.93,y=6.0,z=0.66; cyl(x,y,0.08,z,z+0.04,P2.base,{small:1}); ell(x,y,z+0.16,0.11,0.11,0.13,(f,u,v,W,H,wx,wy,wz,lx,ly,lz)=>shd(C('#6a3428'),(lx<-0.2&&lz>0.1)?1.45:lz<-0.5?0.7:1),{small:1});
    cyl(x,y,0.02,z+0.28,z+0.36,PAL.gold,{small:1});
    cyl(x,y,0.19,z+0.32,z+0.58,(f,u,v,W,H)=>{ if(f==='T')return Math.hypot(u-W/2,v-H/2)<W/2-1.5?C('#3a2a20'):E1|P2.shadeD;   // a drum shade: its open top dark, the fabric lit through
      return E1|shd(P2.shade,(v<1.2?0.86:v>H-1.5?1.06:1)*(Math.floor(u)%7===0?0.9:1)*(0.97+0.04*hh(Math.floor(u),Math.floor(v/2),3))); },{small:1},0.15);
    cyl(x,y,0.015,z+0.56,z+0.6,P2.base,{small:1});
    lamp(x,y,z+0.42,4.4,[1,0.78,0.45],1.3); }

  item('scissors, a key and a pencil',{flat:1});
  { box(4.05,6.45,0,4.35,6.5,0.02,(f,u,v,W,H)=>u<W*0.4?C('#2a3a5a'):C('#b8bcc8'),{solid:0,occ:0}); box(4.05,6.53,0,4.35,6.58,0.02,(f,u,v,W,H)=>u<W*0.4?C('#2a3a5a'):C('#b8bcc8'),{solid:0,occ:0});
    box(4.4,6.7,0,4.55,6.76,0.02,(f,u,v,W,H)=>u<W*0.4?PAL.gold:shd(PAL.gold,0.85),{solid:0,occ:0});
    box(5.3,6.55,0,5.75,6.59,0.03,(f,u,v,W,H)=>u<1.5?C('#f0b0a0'):u<W-3?C('#e8c040'):u<W-1.5?C('#e8d0a0'):C('#2a2a2a'),{solid:0,occ:0}); }

  item('red doormat',{flat:1});
  { box(1.55,6.25,0,2.55,6.85,0.02,(f,u,v,W,H)=>{ if(f!=='T')return PAL.redDD; if(u<1||u>W-1||v<1||v>H-1)return PAL.redD; const r=Math.floor(v/2)%2; return shd(r?PAL.red:C('#882926'),0.92+0.08*hh(u>>1,v>>1,3)*(1-0.3*Math.max(0,1-Math.abs(u-W/2)/(W*0.3)))); },{solid:0,occ:0}); }

  item('leather recliner');
  // deep oxblood leather facing the room: a high tufted back, padded arms, a seat sagged where you sit, the footrest panel quilted in diamonds
  { const x0=4.8,x1=6.0,y0=0.75,y1=1.95, lth=(c,o={})=>(f,u,v,W,H)=>{ const k=(v<1.5?1.18:v>H-1.5?0.78:1)*(u<1.2?1.1:u>W-1.2?0.85:1)*(0.95+0.06*hh(u>>1,v>>1,o.s||3)); return shd(c,k); };
    box(x0+0.05,y0+0.05,0,x1-0.05,y1-0.05,0.1,P2.seatD,{small:1});
    box(x0+0.18,y0+0.25,0.1,x1-0.18,y1,0.42,(f,u,v,W,H)=>{ if(f==='T'){ const sag=Math.max(0,1-Math.hypot(u/W-0.5,v/H-0.55)*2.2); return shd(P2.seat,(1-0.18*sag)*(u<1?1.2:1)*(0.96+0.05*hh(u>>1,v>>1,4))); }
      if(f==='S'){ const a=(u+v)%8, b=(u-v+80)%8; if(a<0.9||b<0.9)return shd(P2.seatD,0.9); if(v<1.5)return shd(P2.seatL,1.1); return lth(P2.seat,{s:5})(f,u,v,W,H); }   // the quilted footrest panel
      return lth(P2.seat)(f,u,v,W,H); },solid);
    box(x0+0.16,y0+0.04,0.1,x1-0.16,y0+0.36,1.18,(f,u,v,W,H)=>{ if(f==='T')return shd(P2.seatL,1.05);
      if(f==='S'){ const row=Math.floor(v/8); if((v%8)<1.2&&v>3)return shd(P2.seatD,0.9); if(Math.abs(u-W/2)<0.8)return shd(P2.seatD,0.92); const bul=Math.sin((v%8)/8*Math.PI); return shd(P2.seat,(0.9+0.2*bul)*(u<2?1.1:1)*(row===0?1.08:1)); }   // tufted in rolls
      return lth(P2.seat,{s:6})(f,u,v,W,H); },solid);
    for(const [a0,a1] of [[x0,x0+0.2],[x1-0.2,x1]]){ box(a0,y0+0.06,0.1,a1,y1-0.02,0.62,(f,u,v,W,H)=>f==='T'?shd(P2.seatL,(v<1.5||u<1)?1.25:1.05):f==='S'?shd(P2.seatH,v<2?1.0:0.62+0.05*hh(u,v>>1,7)):lth(P2.seat,{s:8})(f,u,v,W,H),solid); } }

  item('tray table with a cup of tea');
  // a wooden tray on a post by the chair's arm, a raised rim; a cup of tea on it (its steam rises: the moving picture)
  { const x=4.47,y=1.3; box(x-0.04,y-0.04,0,x+0.04,y+0.04,0.82,wood(PAL.oak,{seed:71}),{small:1}); box(x-0.17,y-0.2,0,x+0.17,y+0.2,0.04,PAL.oakD,{small:1});
    box(x-0.2,y-0.26,0.82,x+0.2,y+0.26,0.86,(f,u,v,W,H)=>f==='T'?(u<1.5||v<1.5||u>W-1.5||v>H-1.5?shd(PAL.oakL,1.15):shd(PAL.straw,0.9+0.08*hh(u>>2,v,3))):shd(PAL.oak,1.05),{sh:1});
    cyl(x+0.02,y+0.06,0.055,0.86,0.98,(f,u,v,W,H)=>f==='T'?(Math.hypot(u-W/2,v-H/2)<W/2-1.2?C('#8a8478'):C('#f0ece4')):shd(C('#f0ece4'),(Math.abs((u%W)/W-0.3)<0.06?1.12:1)*(v>H-1?0.85:1)),{small:1});
    box(x+0.075,y+0.04,0.9,x+0.105,y+0.08,0.96,(f,u,v,W,H)=>Math.abs(u-W/2)<0.5&&Math.abs(v-H/2)<0.6?-1:C('#f0ece4'),{small:1});   // its handle
    box(x-0.02,y+0.0,1.0,x+0.06,y+0.12,1.75,()=>-1,{small:1}); }                        // (room for the steam over it)

  // ======================= THE CATALOG =======================
  CAT_DEPTS.push(['cozyden','Cozy Den']);
  const info=(no,name,price,desc,mat)=>({no,name,price,desc,mat});
  PGK.register('cozyden',{
    'cozy den floor':info('CD-101','Cozy den floor',900,'Red-brown planks, worn pale by the door and the chair.','pine'),
    'cozy den wall, west':info('CD-103','Cozy den wall, west',700,'Pink plaster, a dark red beam, sloping at its far end under the roof.','plaster, oak'),
    'cozy den wall, north':info('CD-104','Cozy den wall, north',800,'Pink plaster with the arched window, sloping at its far end.','plaster, oak'),
    'cozy den wall, east':info('CD-105','Cozy den wall, east',700,'Pink plaster, a dark red beam, sloping at its far end.','plaster, oak'),
    'cozy den wall, south':info('CD-106','Cozy den wall, south',750,'Pink plaster and the way in, sloping at its far end.','plaster, oak'),
    'arched window frame':info('CD-107','Arched window frame',180,'A deep red sill under the arched window; dust turns in its light by day.','oak'),
    'red mountain tapestry':info('CD-108','Red mountain tapestry',220,'Woven red and cream: a key border, mountains under a big sun, a fringe.','wool'),
    'two small framed pictures':info('CD-109','Two small framed pictures',60,'A hill under a blue sky, and a white figure on lilac.','paper, oak'),
    'peg rail with hats and a satchel':info('CD-110','Peg rail with hats and a satchel',190,'A straw hat with a red ribbon, a purple scarf, a leather satchel, a wizard\'s hat.','oak, straw, felt, leather'),
    'front step, cozy den':info('CD-111','Front step, cozy den',40,'A broad plank step at the door.','pine'),
    'big-leaf plant on a stand':info('CD-112','Big-leaf plant on a stand',95,'A monstera with split leaves, in a cream pot on a low stand.','clay, leaves, oak'),
    'tv stand with drawers':info('CD-113','TV stand with drawers',240,'Two drawers with brass knobs and an open cubby.','cherry'),
    'old tv':info('CD-114','Old TV',120,'A grey-blue tube set with a smiley sticker. It\'s on.','plastic, glass'),
    'little bookshelf':info('CD-115','Little bookshelf',260,'Three shelves: books, a globe, a little brass figure.','oak, paper'),
    'lava lamp':info('CD-116','Lava lamp',35,'Orange wax rising and falling in a glow.','glass, wax'),
    'small cactus in a pot':info('CD-117','Small cactus in a pot',15,'A round cactus with a pink flower.','clay, cactus'),
    'popcorn bucket':info('CD-118','Popcorn bucket',8,'A grey pail heaped with popcorn.','tin, popcorn'),
    'spilled popcorn':info('CD-119','Spilled popcorn',1,'A few that got away.','popcorn'),
    'bunny food bowl with a carrot':info('CD-120','Bunny food bowl with a carrot',12,'Pellets and a carrot with its leaves.','stoneware'),
    'bunny water bowl':info('CD-121','Bunny water bowl',10,'Fresh water in a heavy bowl.','stoneware'),
    'round rug, red and gold':info('CD-122','Round rug, red and gold',180,'A red rug with a gold ring, worn where feet go.','wool'),
    'easel with a painting':info('CD-123','Easel with a painting',150,'A white bunny in the snow on a lilac night.','pine, canvas'),
    'sketchbook and loose pages':info('CD-124','Sketchbook and loose pages',14,'Open at a drawing, a page beside it.','paper'),
    'paintbrushes and a tube of paint':info('CD-125','Paintbrushes and a tube of paint',18,'Two brushes, a tube of blue and a dab of it.','wood, paint'),
    'bunny box':info('CD-126','Bunny box',5,'An open box with a blanket and hay: the bunny\'s.','cardboard, cotton'),
    'side table':info('CD-127','Side table',110,'A square table with a drawer.','oak'),
    'table lamp':info('CD-128','Table lamp',65,'A cream shade on a dark round base, lit.','ceramic, linen'),
    'scissors, a key and a pencil':info('CD-129','Scissors, a key and a pencil',6,'Left on the floor by the table.','steel, brass, wood'),
    'red doormat':info('CD-130','Red doormat',20,'Striped red, inside the door.','coir'),
    'leather recliner':info('CD-131','Leather recliner',650,'Oxblood leather, tufted, its seat sagged where you sit.','leather'),
    'tray table with a cup of tea':info('CD-132','Tray table with a cup of tea',70,'A tray on a post by the chair; the tea is hot.','oak, porcelain')});
  PRESETS['Preset Cozy Den 1']=PGK.roomPieces('cozyden').map(([k,x,y])=>[k,+x.toFixed(3),+y.toFixed(3),0]);

  // ======================= WHAT MOVES =======================
  // each its own moving picture (24: lifeDraw): drawn in the object's place as it stands now (moved or turned in the editor: p.ed), its level's
  // height; lit, where it's not a light itself, by the room's light where it is (sampled once a second, as the drapes are)
  const {put,moving}=PGK;   // (each its own moving picture: the kit's, 23-w-page-rooms-0-kit)

  // the TV's programme: a cartoon (a ball bouncing over hills), a nature film (a fish in the waves), now and then a moment of snow between
  // them as the channel changes; scan lines, the tube's glow round the edge, its brightness breathing
  moving('old tv',(D,W,H,ox,oy,t,K,S)=>{ if(!S.faces(1,0))return; const x=0.72, ya=1.79, yb=2.34, za=0.76, zb=1.14;   // (the glass as the TV's front paints it: across from its +y end)
    const ch=Math.floor(t/22)%2, sn=(t%22)<0.5, fl=0.92+0.08*Math.sin(t*7.3)*Math.sin(t*2.1);
    const pix=(g,q)=>{ if(sn){ const s=hh(Math.floor(g*40),Math.floor(q*30),Math.floor(t*8))*255; return [s,s,s+10]; }
      let c; if(ch===0){ const hill=0.7-0.08*Math.sin(g*7+t*0.6); c=q>hill?(q>hill+0.04?[60,150,70]:[90,190,80]):[110,170,240];
          const bx=(t*0.13)%1.2-0.1, by=0.68-Math.abs(Math.sin(t*3.2))*0.42; if(Math.hypot((g-bx)*1.4,q-by)<0.07)c=[250,210,60];
          if(Math.hypot(g-0.82,q-0.18)<0.08)c=[255,240,150]; }
      else { const wave=0.35+0.04*Math.sin(g*14+t*3); c=q<wave?[150,200,240]:[30,90+60*(1-q),150]; const fx=((t*0.08)%1.3)-0.15, fy=0.62+0.05*Math.sin(t*1.7);
        if(((g-fx)/0.09)**2+((q-fy)/0.05)**2<1)c=[250,140,50]; if(Math.abs(g-fx+0.11)<0.03&&Math.abs(q-fy)<0.05-Math.abs(g-fx+0.11))c=[240,120,40];
        if(q>0.9)c=[200,180,120]; }
      const v=Math.hypot(g-0.5,(q-0.5)*1.2), k=fl*(1.08-v*0.55); return [c[0]*k,c[1]*k,c[2]*k]; };
    const ny=Math.ceil((yb-ya)*HW*2*K*1.6), nz=Math.ceil((zb-za)*ZS*K*1.6);
    for(let j=0;j<=nz;j++)for(let i=0;i<=ny;i++){ const g=i/ny, q=j/nz, [px,py]=S.scr(x,yb-(yb-ya)*g,zb-(zb-za)*q,ox,oy,K), c=pix(g,q), sc=(Math.floor(py/K))%2?0.82:1; put(D,W,H,px,py,[c[0]*sc,c[1]*sc,c[2]*sc]); } });

  // the lava lamp: a few blobs of wax that warm, rise, cool and sink, slowly, each on its own clock, stretching as they go; the glass glowing
  moving('lava lamp',(D,W,H,ox,oy,t,K,S)=>{ const x=0.27,y=5.05,z0=1.3+0.15,z1=1.3+0.61, [cx,cy0]=S.scr(x,y,z0,ox,oy,K), top=(z1-z0)*ZS*K;
    const B=[0,1,2,3].map(i=>{ const ph=(t/(26+i*7)+i*0.37)%1, s=0.5-0.5*Math.cos(ph*6.283); return {h:s*0.9+0.05,w:0.45+0.25*hh(i,0,3),r:(0.16+0.06*(i%2))*(1+0.25*Math.abs(Math.sin(ph*6.283))),x:0.25*Math.sin(t*0.11+i*2)}; });
    for(let r=0;r<=top;r++){ const f=r/top, rad=(0.06+(0.045-0.06)*f)*Math.SQRT2*HW*K, hw=Math.max(1,rad), yy=cy0-r;
      for(let q=-hw;q<=hw;q++){ const g=q/hw; let s=0; for(const b of B){ const dx=(g-b.x)*0.55, dz=(f-b.h)/b.w*0.55; s+=b.r*b.r/(dx*dx+dz*dz*1.6+1e-4); }
        let c=s>1?(s>2.2?[255,210,90]:[255,170,60]):[220+20*f,70+30*(1-f),40]; if(f<0.06)c=[255,140,60];
        if(g<-0.55)c=c.map(v=>Math.min(255,v*1.15)); if(g>0.7)c=c.map(v=>v*0.82); put(D,W,H,cx+q,yy,c); } } });

  // the water bowl: real water (owner, 13 Oct 2026: "real liquids only", a hard rule; the page had painted its glints): the Deep Water page's
  // clear cove water at the bowl's mouth (the kit's water, 23-w-page-rooms-0-kit); now and then a drip falls in and its ring spreads
  const BOWL=PGK.water(2.0,0.5,0.1,0.075,2,{height:0.08,chop:0.3}); let drip=-1;
  moving('bunny water bowl',(D,W,H,ox,oy,t,K,S)=>BOWL(D,W,H,ox,oy,t,K,S,o=>{ const n=Math.floor(t/7); if(n!==drip){ drip=n; o.poke(0.1+(hh(n,0,5)-0.5)*0.08,0.1+(hh(n,1,5)-0.5)*0.08,0.01,0.05); } }));

  // the tea: thin steam rising from the cup, swaying, thinning out as it goes
  // and the tea itself real (the hard rule, as the bowl's water): the Deep Water page's water with tea's own colour (it soaks up blue first, then
  // green: a water of its own, added to DEEPW's kinds here), still but for a tremble, at the cup's mouth
  const TEAW=DEEPW.WATERS.push({key:'tea',sig:[1.6,3.4,7.0],scat:[0.32,0.12,0.02],bed:'mud',foam:0.02,refr:1.3,waves:[[0.5,0.002,250,.2],[0.3,0.001,300,.2]]})-1, TEA=PGK.water(4.49,1.36,0.043,0.97,TEAW,{height:0.5});
  moving('tray table with a cup of tea',(D,W,H,ox,oy,t,K,S)=>{ TEA(D,W,H,ox,oy,t,K,S,null); const x=4.49,y=1.36, [cx,cy]=S.scr(x,y,0.99,ox,oy,K), L=S.light(x,y,1.2), top=0.65*ZS*K;
    for(let s=0;s<3;s++)for(let r=0;r<top;r++){ const f=r/top, sway=Math.sin(f*5-t*1.6+s*2.1)*(1+f*5)*K*0.9+(s-1)*K*1.2, a=Math.max(0,(1-f)*(0.5+0.5*Math.sin(f*9-t*2.3+s))*110);
      if(a<12||hh(r,s,Math.floor(t*4))<0.25)continue; put(D,W,H,cx+sway,cy-r,[235*L[0],232*L[1],228*L[2]],a); } });

  // dust in the window's light: specks drifting, catching the light now and then, by day, while the window's wall stands
  moving('arched window frame',(D,W,H,ox,oy,t,K,S)=>{ if(!S.faces(0,1))return; const m=((CLOCK%1440)+1440)%1440, day=sstep(6.5*60,8*60,m)*sstep(19.5*60,18*60,m); if(day<0.05)return;
    for(let i=0;i<16;i++){ const T=t*0.05+i*0.37, u=(hh(i,0,11)+0.08*Math.sin(T*1.3+i)+0.02*T)%1, w=(hh(i,1,11)+0.03*T)%1, d=0.15+0.6*hh(i,2,11);
      const X=WIN.x0+0.1+u*(WIN.x1-WIN.x0-0.2), Z=WIN.z0+0.1+(1-w)*(WIN.zs-WIN.z0+0.4), [px,py]=S.scr(X,d,Z,ox,oy,K), tw=0.5+0.5*Math.sin(t*2.7+i*1.9);
      if(tw<0.3)continue; put(D,W,H,px,py,[255,246,224],Math.round(150*tw*day)); } });
})();

};
export {pageCozyDen};
