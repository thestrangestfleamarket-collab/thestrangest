// THE PLAYHOUSE'S HOUSE: the auditorium and the foyer in metres: raked stalls of tip-up velvet seats in two blocks between three aisles, steps up to the stage at its sides, the gilded proscenium and its columns, a plain ceiling and its crystal chandelier; the foyer's box office, bar, mirrors, the bill and the street doors.
import {THREE} from './003-shx.js';
const PHA={};
// the plan (metres; x across, stage left +x; z from the curtain line, the stage at -z, the doors at +z; y up from the stalls' front floor)
PHA.D={SY:1.1,PW:12,PH:8,W:10,Z1:15,ZF:27,ZB:21.4,FY:1.3,FT:7.3,HOUSE:15,ZP:5.2,ZR:12.2,DOOR:3,STG:-10.3,WING:10,
  rake:z=>1.3*Math.min(1,Math.max(0,(z-5.2)/7)), edge:x=>Math.abs(x)<7.5?2.8+.4*(1-(x/7.5)**2):2.8};
PHA.make=K=>{ '@playhouse';
  const D=K.D=PHA.D, M=K.M, TX=K.TX, PI=Math.PI, {box,boxA,cyl,lathe,plane,rod,tube,inst,ext,sph,tor}=K, W=D.W, FY=D.FY;

  /* ---------- the ground, region by region (first that answers) ---------- */
  const inR=(x,z,x0,z0,x1,z1)=>x>=x0&&x<=x1&&z>=z0&&z<=z1, ax=Math.abs;
  K.ground((x,z)=>inR(ax(x),z,0,D.STG,D.WING,0)||(ax(x)<=W&&z>=0&&z<=D.edge(x))?D.SY:null);                             // the stage, its wings and the apron
  K.ground((x,z)=>inR(ax(x),z,7.8,2.8,W,D.ZP)?D.SY*Math.min(6,Math.max(0,Math.ceil((D.ZP-z)/((D.ZP-2.8)/6))))/6:null);   // the steps up from the stalls
  K.ground((x,z)=>ax(x)<=W&&z>=0&&z<=D.Z1?D.rake(z):null);                                                                  // the stalls
  K.ground((x,z)=>ax(x)<=W&&z>D.Z1&&z<=D.ZF+.4?FY:null);                                                                    // the foyer

  /* ---------- the solids ---------- */
  const S=K.solid, both=(x0,z0,x1,z1)=>{ S(x0,z0,x1,z1); S(-x1,z0,-x0,z1); };
  both(6,-.2,W+.3,1.25);                                                              // the proscenium wall either side of the opening
  for(let x=-7.75;x<7.7;x+=.5)S(x,D.edge(x+.25)-.02,x+.5,D.edge(x+.25)+.08);          // the apron's front edge (up by the steps)
  both(7.75,1.45,8.25,1.95); both(7.7,2.8,7.8,4.6);                                   // the columns' plinths; the steps' inner cheeks
  both(W,1.25,W+.3,D.ZF+.4); both(D.DOOR,D.Z1,W+.3,D.Z1+.25); S(-W-.3,D.ZF,W+.3,D.ZF+.4);   // the side walls, the wall between the stalls and the foyer, the front wall and its doors
  S(-9.95,18.5,-7.2,23); S(7.2,18.5,7.98,24); S(9.55,18.5,9.95,24); S(-1,D.ZB-.8,1,D.ZB+.25); both(3.5,16.6,5.5,17.2);   // the box office; the bar's counter and back bar (the barkeep stands between); the bill; the benches

  /* ---------- the stalls' floor: carpet, flat at the front, raked, flat at the back; the apron and its steps ---------- */
  { const L=D.ZR-D.ZP, ang=Math.atan2(FY,L), len=Math.hypot(L,FY);
    plane(2*W,D.ZP-2,M.carpet,0,0,(2+D.ZP)/2,{rx:-PI/2,s:1.6}).receiveShadow=true;
    plane(2*W,len,M.carpet,0,FY/2,(D.ZP+D.ZR)/2,{rx:-PI/2-ang,s:1.6}).receiveShadow=true;
    plane(2*W,D.Z1-D.ZR,M.carpet,0,FY,(D.ZR+D.Z1)/2,{rx:-PI/2,s:1.6}).receiveShadow=true;
    // the apron: its boards out over the front, the footlights' trough along its edge
    const ap=[]; for(let i=0;i<=40;i++){ const x=-W+2*W*i/40; ap.push([x,-D.edge(x)]); } ap.push([W,0],[-W,0]);
    const ex=ext(ap,D.SY+.02,[M.boards,M.black],0,-.02,0,{rx:-PI/2}); ex.material=[M.boards,M.matte];
    const tro=[]; for(let i=0;i<=40;i++){ const x=-7.2+14.4*i/40; tro.push([x,D.SY+.04,D.edge(x)-.18]); } tube(tro,.06,M.brass,{n:80,seg:6});
    K.foot=tro; }
  for(const s of [-1,1]){ const n=6, run=(D.ZP-2.8)/n; for(let i=0;i<n;i++){ const z=D.ZP-(i+1)*run; boxA(s*7.8,0,z,s*W,D.SY*(i+1)/n,z+run,M.carpet,{s:1.6}); }
    ext([[2.8,0],[2.8,D.SY+.08],[D.ZP,.3],[D.ZP,0]],.1,M.mahog,s>0?7.8:-7.7,0,0,{ry:-PI/2}); rod([s*7.75,D.SY+.95,2.9],[s*7.75,.95,D.ZP],.03,M.brass); }

  /* ---------- the stalls' seats: six rows in two blocks, cast-iron standards, tip-up velvet seats, buttoned backs with a mahogany rim ---------- */
  { const mx=K.mx;
    const vel=K.merge([[new THREE.BoxGeometry(.5,.1,.46),mx(0,.44,-.02)],[new THREE.BoxGeometry(.5,.6,.1),mx(0,.78,.2,.16)],[new THREE.CylinderGeometry(.05,.05,.5,8),mx(0,.5,-.24,0,0,PI/2)],[new THREE.BoxGeometry(.48,.08,.08),mx(0,1.09,.25,.16)]]);
    const wood=K.merge([[new THREE.BoxGeometry(.52,.07,.06),mx(0,1.12,.27,.16)],[new THREE.BoxGeometry(.5,.62,.03),mx(0,.78,.26,.16)]]);
    const iron=K.merge([[new THREE.BoxGeometry(.05,.75,.5),mx(-.27,.37,0)],[new THREE.BoxGeometry(.06,.05,.42),mx(-.27,.66,-.06)],[new THREE.CylinderGeometry(.04,.04,.04,10),mx(-.27,.67,-.28,0,0,PI/2)],[new THREE.BoxGeometry(.12,.04,.5),mx(-.27,.02,0)]]);
    const rows=[]; const seatAt=(x,y,z,ry,blk,ri)=>{ rows.push([x,y,z,ry]); K.seats.push({x,y:y+.48,z,hd:ry+PI,blk,row:ri}); };
    const RZ=r=>6.2+r*1.0;
    for(let r=0;r<6;r++){ const z=RZ(r), y=D.rake(z); for(const s of [-1,1])for(let k=0;k<11;k++)seatAt(s*(1.6+k*.6),y,z,0,s<0?'l':'r',r); }
    inst(vel,M.seat,rows); inst(wood,M.mahog,rows); inst(iron,M.iron,rows); inst(iron,M.iron,rows.map(a=>[a[0]+.54,a[1],a[2],a[3]]));
    // the row letters: a small brass plate on each aisle's iron standard, facing its aisle
    const lt=TX.print(512,64,(g,w,h)=>{ g.fillStyle='#c9a24a'; g.fillRect(0,0,w,h); g.fillStyle='#2a1810'; g.font='bold 40px Georgia,serif'; g.textAlign='center'; for(let i=0;i<16;i++)g.fillText('ABCDEFGHJKLMNOPQ'[i],i*32+16,46); });
    const ltm=new THREE.MeshLambertMaterial({map:lt}), ends=[[-7.9,-1],[-1.3,1],[1.3,-1],[7.9,1]];
    for(let r=0;r<6;r++)for(const [x,f] of ends){ const z=RZ(r), y=D.rake(z), m=plane(.12,.12,ltm,x+f*.02,y+.55,z,{ry:f*PI/2}); m.geometry.attributes.uv.array.set([r/16,1,(r+1)/16,1,r/16,0,(r+1)/16,0]); }
    // aisle lights: a little brass lamp low on each aisle seat's standard, lighting the step (kept on through the show)
    const al=[]; for(let r=0;r<6;r++)for(const [x,f] of ends)al.push([x+f*.05,D.rake(RZ(r))+.18,RZ(r)]); K.aisle=inst(new THREE.SphereGeometry(.03,6,4),M.bulb,al,{cast:false}); }

  /* ---------- the walls of the house: plaster above a mahogany dado, gilt pilasters, sconces, the cornice ---------- */
  for(const s of [-1,1]){
    plane(D.Z1-1.25,D.HOUSE,M.plaster,s*W,D.HOUSE/2,(1.25+D.Z1)/2,{ry:-s*PI/2,s:2});
    const gw=z=>K.groundAt(s*(W-.2),z);
    for(let z=1.25;z<D.Z1;z+=.5){ const y=gw(z+.25); boxA(s*(W-.04),y-.4,z,s*W,y+1.1,Math.min(D.Z1,z+.5),M.mahog,{s:.6}); }
    for(const z of [3.2,6.6,10,13.4]){ const y=gw(z); boxA(s*(W-.15),y+1.1,z-.3,s*W,D.HOUSE-.6,z+.3,M.orn,{s:1}); box(.25,.5,.75,M.gold,s*(W-.12),D.HOUSE-.85,z); }
    for(const z of [4.9,8.3,11.7]){ const y=gw(z)+2.6; rod([s*(W-.05),y,z],[s*(W-.45),y+.15,z],.025,M.brass); K.cyl(.11,.06,.22,M.glass,s*(W-.5),y+.25,z,{seg:12,cast:false}); K.sph(.05,M.bulb,s*(W-.5),y+.22,z,{cast:false}); }
    boxA(s*W,D.HOUSE-.6,1.25,s*(W-.3),D.HOUSE,D.Z1,M.orn); }
  // the back of the stalls: the wall to the foyer with its one wide opening, a gilt frame round it, the green exit lamp over it
  { const d=D.DOOR, oh=FY+3.6, z0=D.Z1, z1=D.Z1+.25;
    for(const s of [-1,1])boxA(s*d,0,z0,s*W,D.HOUSE,z1,M.plaster,{s:2}); boxA(-d,oh,z0,d,D.HOUSE,z1,M.plaster,{s:2});
    for(const s of [-1,1]){ boxA(s*d,FY-.4,z0-.05,s*W,FY+1.1,z0,M.mahog,{s:.6}); boxA(s*d-.15,FY,z0-.08,s*d+.15,oh+.15,z1+.08,M.gold); }
    boxA(-d-.15,oh,z0-.08,d+.15,oh+.3,z1+.08,M.gold);
    plane(1.1,.24,new THREE.MeshBasicMaterial({map:TX.print(256,64,(g,w,h)=>{ g.fillStyle='#062a10'; g.fillRect(0,0,w,h); g.fillStyle='#3aff70'; g.font='bold 44px Georgia,serif'; g.textAlign='center'; g.fillText('EXIT',w/2,48); })}),0,oh+.6,z0-.02,{ry:PI}); }

  /* ---------- the proscenium: the plaster wall, the gilt frame round the opening, the columns, the entablature, the arms of the house ---------- */
  { const W=D.PW/2, top=D.SY+D.PH, arch=n=>{ const o=[]; for(let i=0;i<=n;i++){ const x=-W+2*W*i/n; o.push([x,top+.7*(1-(x/W)**2)]); } return o; };
    ext([[-10.3,0],[10.3,0],[10.3,D.HOUSE],[-10.3,D.HOUSE]],.25,M.plaster,0,0,1.0,{holes:[[[-W,D.SY],[W,D.SY],...arch(24).slice().reverse()]],s:2});
    ext([[-10.3,0],[10.3,0],[10.3,23],[-10.3,23]],.2,M.brickBlack,0,0,-.2,{holes:[[[-W,D.SY],[W,D.SY],...arch(24).slice().reverse()]],s:1.2});
    // the frame: jambs, the arch in short gilt pieces, a bead inside it, the soffit (the reveal's underside) dark
    for(const s of [-1,1]){ const j=K.box(D.PH,.9,.35,M.orn,s*(W+.45),D.SY+D.PH/2,1.3,{rz:PI/2,s:1}); boxA(s*W,D.SY,-.2,s*(W+.05),top,1.25,M.matte); }
    const A=arch(16); for(let i=0;i<16;i++){ const [x0,y0]=A[i], [x1,y1]=A[i+1], L=Math.hypot(x1-x0,y1-y0), m=K.box(L+.02,.9,.35,M.orn,(x0+x1)/2,(y0+y1)/2+.45,1.3,{rz:Math.atan2(y1-y0,x1-x0)});
      K.box(L+.02,.05,1.45,M.matte,(x0+x1)/2,(y0+y1)/2,.52,{rz:Math.atan2(y1-y0,x1-x0)}); }
    tube([[-W,D.SY,1.47],...A.map(([x,y])=>[x,y,1.47]),[W,D.SY,1.47]],.06,M.gold,{n:120});
    // the columns: plinth, base, the fluted shaft (its flutes cut in), the capital's leaves and volutes
    const shaft=new THREE.CylinderGeometry(.3,.33,6.6,24,1); { const p=shaft.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i), z=p.getZ(i), a=Math.atan2(z,x), r=Math.hypot(x,z), k=1-.06*Math.max(0,Math.cos(a*12)); p.setX(i,x*k); p.setZ(i,z*k); } shaft.computeVertexNormals(); }
    for(const s of [-1,1]){ const x=s*8, z=1.7;
      boxA(x-.25,D.SY,z-.25,x+.25,D.SY+.9,z+.25,M.marbleRed,{s:1}); lathe([[0,0],[.42,0],[.42,.1],[.36,.16],[.38,.24],[.33,.3],[0,.3]],M.gold,x,D.SY+.9,z);
      K.put(new THREE.Mesh(shaft,M.gold),x,D.SY+1.2+3.3,z);
      lathe([[0,0],[.32,0],[.4,.25],[.5,.55],[.55,.62],[0,.62]],M.gold,x,D.SY+7.8,z,{seg:24}); boxA(x-.55,D.SY+8.42,z-.55,x+.55,D.SY+8.52,z+.55,M.gold);
      for(let k=0;k<8;k++){ const a=k*PI/4; K.box(.12,.42,.04,M.gold,x+Math.cos(a)*.42,D.SY+8.0,z+Math.sin(a)*.42,{ry:-a+PI/2,rx:.35}); }
      for(const q of [-1,1])tor(.09,.035,M.gold,x+q*.48,D.SY+8.35,z+.42,{seg:16}); }
    // the entablature across the top: architrave, the frieze of scrolls, a dentil course, the cornice
    boxA(-9.2,D.SY+8.52,1.25,9.2,D.SY+8.9,2.0,M.gold,{s:1}); boxA(-9.2,D.SY+8.9,1.25,9.2,D.SY+9.6,1.95,M.orn,{s:.7});
    inst(new THREE.BoxGeometry(.1,.14,.12),M.gold,Array.from({length:110},(_,i)=>[-9.1+i*.167,D.SY+9.67,2.0]));
    boxA(-9.5,D.SY+9.74,1.25,9.5,D.SY+9.98,2.25,M.gold);
    // the arms of the house over the arch: a cartouche, the masks of comedy and tragedy each side, the motto on a ribbon
    const cy=D.SY+10.9; K.ext(Array.from({length:32},(_,i)=>{ const a=i/32*PI*2; return [Math.cos(a)*1.3*(1+.08*Math.cos(a*6)),Math.sin(a)*.95*(1+.08*Math.cos(a*6))]; }),.25,M.orn,0,cy,1.3,{bevel:.06});
    K.ext(Array.from({length:32},(_,i)=>{ const a=i/32*PI*2; return [Math.cos(a)*.95,Math.sin(a)*.65]; }),.1,M.velvetDark,0,cy,1.6);
    const mt=TX.print(512,256,(g,w,h)=>{ g.fillStyle='#5c0a18'; g.fillRect(0,0,w,h); g.fillStyle='#e8c060'; g.textAlign='center'; g.font='bold 64px Georgia,serif'; g.fillText('ALL THE',w/2,110); g.fillText("WORLD'S A STAGE",w/2,190); });
    K.plane(1.6,.8,new THREE.MeshLambertMaterial({map:mt}),0,cy,1.71,{});
    for(const s of [-1,1]){ const x=s*2.4, m=K.sph(.42,M.gold,x,cy,1.45,{phi:PI/2,rx:PI/2,seg:20,seg2:10}); m.scale.set(1,1,.55);
      for(const e of [-1,1])K.sph(.07,M.matte,x+e*.15,cy+.08,1.67,{seg:8}); const mo=K.tor(.13,.035,M.matte,x,cy-.18,1.66,{arc:PI,seg:10}); mo.rotation.z=s>0?0:PI;
      tube([[x+s*.4,cy+.1,1.5],[x+s*.75,cy+.35,1.45],[x+s*1.0,cy-.05,1.4],[x+s*.85,cy-.4,1.45]],.04,M.velvet,{n:20}); } }

  /* ---------- the ceiling: flat plaster, a gilt rose in the middle, the chandelier on its chain ---------- */
  { const cz=8.2; boxA(-W,D.HOUSE,1.0,W,D.HOUSE+.3,D.Z1+.25,M.plaster,{s:2,cast:false}); tor(1.4,.12,M.gold,0,D.HOUSE,cz,{rx:PI/2,seg:48}); tor(.9,.06,M.gold,0,D.HOUSE-.02,cz,{rx:PI/2,seg:40});
    // the chandelier: a chain of real links from the ceiling's rose, a brass frame of three rings, arms with candle bulbs, strings of cut-glass drops
    const top=D.HOUSE-.05, cy=11.4, link=new THREE.TorusGeometry(.06,.016,6,10), links=[];
    for(let y=top,i=0;y>cy+1.2;y-=.1,i++)links.push([0,y,cz,i%2?PI/2:0]); inst(link,M.brass,links);
    lathe([[0,1.3],[.12,1.25],[.18,1.0],[.1,.7],[.25,.4],[.12,0],[0,0]],M.brass,0,cy,cz,{seg:16});
    const rings=[[1.6,cy+.3,24],[1.1,cy+.9,16],[.6,cy+1.3,10]], drops=[], bulbs=[];
    for(const [r,y,n] of rings){ tor(r,.035,M.brass,0,y,cz,{rx:PI/2,seg:48}); for(let i=0;i<n;i++){ const a=i/n*PI*2, x=Math.cos(a)*r, z=cz+Math.sin(a)*r;
        rod([Math.cos(a)*.15,y-.15,cz+Math.sin(a)*.15],[x,y,z],.02,M.brass); K.cyl(.025,.025,.14,M.ivory,x,y+.1,z,{seg:6,cast:false}); bulbs.push([x,y+.2,z]);
        for(let k=0;k<5;k++)drops.push([x,y-.06-k*.07,z,a,1,0,0]); drops.push([x,y-.45,z,a,1.8]); }
      for(let i=0;i<n*3;i++){ const a=(i+.5)/(n*3)*PI*2; for(let k=0;k<3;k++){ const sag=Math.sin(k/2*PI)*.12; drops.push([Math.cos(a)*r*(1-k*.04),y-.12-sag,cz+Math.sin(a)*r*(1-k*.04),a]); } } }
    for(let i=0;i<40;i++){ const a=i/40*PI*2, r=.3+.1*(i%3); drops.push([Math.cos(a)*r,cy-.2-(i%5)*.12,cz+Math.sin(a)*r,a,1.3]); }
    K.inst(new THREE.OctahedronGeometry(.035,0),M.crystal,drops,{cast:false}); K.chBulbs=K.inst(new THREE.SphereGeometry(.035,6,4),M.bulb,bulbs,{cast:false}); K.chandelier=[0,cy+.6,cz]; }

  /* ---------- the foyer: parquet, damask over a dado, a coffered ceiling, the box office and the bar, the bill, the doors ---------- */
  { const FT=D.FT, z0=D.Z1+.25, z1=D.ZF, d=D.DOOR, oh=FY+3.6;
    boxA(-W,0,z0,W,FY-.02,z1,M.black,{cast:false}); boxA(-W,FY-.02,z0,W,FY,z1,M.parquet,{s:1.4});
    for(const s of [-1,1]){ plane(z1-z0,FT-FY,M.damask,s*W,(FY+FT)/2,(z0+z1)/2,{ry:-s*PI/2,s:.9}); boxA(s*(W-.05),FY,z0,s*W,FY+1.1,z1,M.mahog,{s:.6}); boxA(s*(W-.07),FY+1.1,z0,s*W,FY+1.16,z1,M.gold); }
    plane(2*W,FT-FY,M.damask,0,(FY+FT)/2,z1,{ry:PI,s:.9}); boxA(-W,FY,z1-.05,W,FY+1.1,z1,M.mahog,{s:.6});
    // the wall to the stalls: damask round the opening, a dado, the STALLS sign and a clock over it
    for(const s of [-1,1]){ plane(W-d,FT-FY,M.damask,s*(W+d)/2,(FY+FT)/2,z0+.01,{s:.9}); boxA(s*d,FY,z0,s*W,FY+1.1,z0+.05,M.mahog,{s:.6}); }
    plane(2*d,FT-oh,M.damask,0,(oh+FT)/2,z0+.01,{s:.9});
    const sd=TX.print(256,64,(g,w,h)=>{ g.fillStyle='#1a0e08'; g.fillRect(0,0,w,h); g.fillStyle='#e8c060'; g.font='bold 36px Georgia,serif'; g.textAlign='center'; g.fillText('STALLS',w/2,46); });
    plane(1.6,.4,new THREE.MeshLambertMaterial({map:sd}),0,oh+.6,z0+.12,{});
    K.cyl(.45,.45,.08,M.gold,0,oh+1.7,z0+.06,{rx:PI/2,seg:24}); K.cyl(.38,.38,.09,M.ivory,0,oh+1.7,z0+.06,{rx:PI/2,seg:24}); for(const [a,l] of [[-1.2,.28],[.6,.2]])K.box(.03,l,.02,M.matte,Math.sin(a)*l/2,oh+1.7+Math.cos(a)*l/2,z0+.12,{rz:-a});
    // the coffered ceiling: deep beams both ways, gilt in their soffits
    boxA(-W,FT,z0,W,FT+.2,z1,M.plaster,{s:2,cast:false}); const cz=(z1-z0)/4;
    for(let x=-W+2.5;x<W;x+=2.5)boxA(x-.15,FT-.45,z0,x+.15,FT,z1,M.plaster,{s:2}); for(let k=1;k<4;k++){ const z=z0+k*cz; boxA(-W,FT-.45,z-.15,W,FT,z+.15,M.plaster,{s:2}); }
    for(let x=-W+1.25;x<W;x+=2.5)for(let k=0;k<4;k++)K.box(1.2,.04,1.2,M.gold,x,FT-.02,z0+(k+.5)*cz,{cast:false});
    // the box office: a mahogany kiosk with a brass grille in its glass, a ticket roll, its sign
    { const x0=-9.95, x1=-7.2, za=18.5, zb=23; boxA(x0,FY,za,x1,FY+1.1,zb,M.mahog,{s:.6}); boxA(x1-.05,FY+1.1,za,x1+.05,FY+1.15,zb,M.marble); boxA(x0,FY+2.5,za,x1+.1,FY+2.8,zb,M.mahog);
      plane(zb-za,1.35,M.glass,x1,FY+1.82,(za+zb)/2,{ry:PI/2}); for(let z=za+.15;z<zb;z+=.12)rod([x1+.01,FY+1.15,z],[x1+.01,FY+1.5,z],.006,M.brass);
      for(const z of [za,zb])boxA(x1-.06,FY+1.1,z-.04,x1+.06,FY+2.5,z+.04,M.mahog);
      const sg=TX.print(512,96,(g,w,h)=>{ g.fillStyle='#1a0e08'; g.fillRect(0,0,w,h); g.fillStyle='#e8c060'; g.font='bold 56px Georgia,serif'; g.textAlign='center'; g.fillText('BOX OFFICE',w/2,68); });
      plane(zb-za-.4,.24,new THREE.MeshLambertMaterial({map:sg}),x1+.11,FY+2.65,(za+zb)/2,{ry:PI/2}); cyl(.08,.08,.14,M.paper,x1-.3,FY+1.22,za+1,{rx:PI/2}); boxA(x0+.1,FY,za+.1,x0+.6,FY+2.4,zb-.1,M.mahog); }
    // the bar: a mahogany counter with a marble top and a brass foot rail, the back bar's shelves of bottles and its mirror
    { const x0=7.2, x1=9.95, za=18.5, zb=24; boxA(x0,FY,za,x0+.7,FY+1.1,zb,M.mahog,{s:.6}); boxA(x0-.08,FY+1.1,za-.05,x0+.78,FY+1.16,zb+.05,M.marble); rod([x0-.2,FY+.18,za],[x0-.2,FY+.18,zb],.025,M.brass);
      for(const z of [za+1,zb-1])rod([x0+.3,FY+1.16,z],[x0+.3,FY+1.5,z],.03,M.brass);
      boxA(x1-.4,FY,za,x1,FY+.9,zb,M.mahog); const bt=[]; for(const y of [FY+1.6,FY+2.15,FY+2.7]){ boxA(x1-.3,y-.03,za,x1,y,zb,M.mahog); for(let z=za+.15;z<zb;z+=.17)bt.push([x1-.15,y,z]); }
      inst(new THREE.LatheGeometry([[0,0],[.04,0],[.045,.02],[.045,.18],[.015,.24],[.014,.32],[0,.32]].map(p=>new THREE.Vector2(p[0],p[1])),8),M.bottle,bt);
      K.mirrors.push({w:zb-za-.4,h:1.5,at:[x1-.02,FY+2.2,(za+zb)/2],ry:-PI/2,zone:'foyer'});
      inst(new THREE.CylinderGeometry(.035,.03,.1,10),M.glass,Array.from({length:12},(_,i)=>[x0+.4,FY+1.21,za+.4+i*.12])); }
    // two velvet benches against the wall to the stalls, either side of the opening
    for(const x of [-4.5,4.5]){ boxA(x-1,FY+.42,16.6,x+1,FY+.55,17.2,M.velvet); for(const q of [-.9,.9])for(const r of [-.22,.22])lathe([[0,0],[.04,0],[.03,.42]],M.gold,x+q,FY,16.9+r,{seg:6}); }
    // the doors to the street: three pairs, glazed, brass push bars, a fanlight over each; the big mirrors between them
    for(const x of [-3.2,0,3.2]){ for(const q of [-1,1]){ const dx=x+q*.55; boxA(dx-.55,FY,z1-.12,dx+.55,FY+2.6,z1-.04,M.mahog); plane(.8,1.9,M.glass,dx,FY+1.45,z1-.13,{ry:PI}); rod([dx-.3,FY+1.1,z1-.2],[dx+.3,FY+1.1,z1-.2],.025,M.brass); }
      K.ext(Array.from({length:17},(_,i)=>{ const a=PI*i/16; return [Math.cos(a)*1.1,Math.sin(a)*.6]; }),.08,M.gold,x,FY+2.62,z1-.12,{}); }
    for(const x of [-7,7])K.mirrors.push({w:2.2,h:3.4,at:[x,FY+2.6,z1-.06],ry:PI,frame:1,zone:'foyer'});
    // the posters in gilt frames by the stalls, the bill on its easel mid-foyer
    for(const [x,z,ry] of [[-W+.1,16.6,PI/2],[W-.1,16.6,-PI/2]]){ const m=new THREE.MeshLambertMaterial({map:TX.poster}); const fx=x-Math.sign(x)*.02;
      plane(1.1,1.65,m,fx,FY+1.9,z,{ry}); K.box(1.3,1.85,.06,M.gold,x,FY+1.9,z,{ry}); }
    { const x=0,z=D.ZB, B=1.6; for(const q of [-1,1])rod([x+q*(B/2+.12),FY,z+.18],[x+q*(B/2+.06),FY+2.45,z-.12],.03,M.mahog); rod([x,FY,z-.75],[x,FY+2.3,z-.16],.025,M.mahog);
      K.box(B+.3,.05,.14,M.mahog,x,FY+.72,z+.1); K.box(B,B,.03,new THREE.MeshLambertMaterial({map:TX.bill}),x,FY+.75+B/2,z,{rx:-.12}); }
    // the two foyer chandeliers: smaller, on chains from the coffers
    for(const z of [18.2,24.4]){ const cy=FT-2.2; rod([0,FT,z],[0,cy+.8,z],.02,M.brass); lathe([[0,.8],[.08,.7],[.12,.3],[.05,0],[0,0]],M.brass,0,cy,z); tor(.7,.03,M.brass,0,cy+.25,z,{rx:PI/2,seg:32}); const dr=[], bl=[];
      for(let i=0;i<12;i++){ const a=i/12*PI*2; rod([0,cy+.2,z],[Math.cos(a)*.7,cy+.25,z+Math.sin(a)*.7],.015,M.brass); bl.push([Math.cos(a)*.7,cy+.4,z+Math.sin(a)*.7]); for(let k=0;k<4;k++)dr.push([Math.cos(a)*.7,cy+.18-k*.06,z+Math.sin(a)*.7,a]); }
      for(let i=0;i<20;i++){ const a=i/20*PI*2; dr.push([Math.cos(a)*.35,cy-.05-(i%3)*.08,z+Math.sin(a)*.35,a]); }
      K.inst(new THREE.OctahedronGeometry(.03,0),M.crystal,dr,{cast:false}); K.inst(new THREE.SphereGeometry(.03,6,4),M.bulb,bl,{cast:false}); (K.fch=K.fch||[]).push([0,cy+.3,z]); } }
  return K; };
export {PHA};
