// THE PLAYHOUSE'S HOUSE: the auditorium and the foyer in metres: raked stalls of tip-up velvet seats, the circle on six tiers, two tiers of boxes each side, the gilded proscenium and its columns, the orchestra pit, the painted dome and its crystal chandelier; the foyer's marble stairs, columns, box office, bar, mirrors and doors.
import {THREE} from './003-shx.js';
const PHA={};
// the plan (metres; x across, stage left +x; z from the curtain line, the stage at -z, the doors at +z; y up from the stalls' front floor)
PHA.D={SY:1.1,PW:12,PH:8,W:12,BX:14.5,Z1:20,ZC:27.8,ZL:29.6,ZF:42,FY:1.3,CY:3.7,LY:7.2,HOUSE:15,PIT:-1.9,ZP:4.6,STG:-16.4,WING:13.5,
  rake:z=>1.3*Math.min(1,Math.max(0,(z-4.6)/15.4)), edge:x=>Math.abs(x)<7.5?2+.7*(1-(x/7.5)**2):2};
PHA.make=K=>{ '@playhouse';
  const D=PHA.D, M=K.M, TX=K.TX, PI=Math.PI, {box,boxA,cyl,lathe,plane,rod,tube,inst,ext,sph,tor}=K, V3=THREE.Vector3;
  K.D=D;

  /* ---------- the ground, region by region (first that answers) ---------- */
  const inR=(x,z,x0,z0,x1,z1)=>x>=x0&&x<=x1&&z>=z0&&z<=z1, ax=Math.abs;
  K.ground((x,z)=>inR(ax(x),z,0,D.STG-8.4,D.WING,0)||(ax(x)<=9.2&&z>=0&&z<=D.edge(x))?D.SY:null);                       // the stage, its wings, the apron, backstage
  K.ground((x,z)=>inR(ax(x),z,7.6,2,9.2,D.ZP)?D.SY*Math.min(6,Math.max(0,Math.ceil((D.ZP-z)/(2.6/6))))/6:null);             // the apron's steps from the stalls
  K.ground((x,z)=>inR(x,z,6.4,2,7.5,D.ZP)&&z>D.edge(x)?D.PIT*Math.min(1,Math.max(0,Math.ceil((D.ZP-z)/.2)*.2/2.4*(1/.92))):null);   // the pit's own stair
  K.ground((x,z)=>ax(x)<7.5&&z>D.edge(x)&&z<D.ZP?D.PIT:null);                                                             // the orchestra pit
  K.ground((x,z)=>inR(ax(x),z,12,1.2,D.BX,7)?2.8:null);                                                                   // the lower boxes
  K.ground((x,z)=>inR(ax(x),z,12.1,7,D.BX,11.6)?2.8-(2.8-D.rake(11.6))*Math.min(13,Math.max(0,Math.ceil((z-7)/(4.6/13))))/13:null);   // the boxes' stair
  K.ground((x,z)=>ax(x)<=12&&z>=1.2&&z<=D.Z1?D.rake(z):null);                                                             // the stalls
  K.ground((x,z)=>inR(ax(x),z,9.6,D.Z1,12,D.ZL)?D.FY:null);                                                               // the side passages
  K.ground((x,z)=>{ if(!(ax(x)<=9.6&&z>D.Z1&&z<=D.ZC))return null; if(z<20.6)return D.CY; const i=Math.min(5,Math.floor((z-20.6)/1.2));
    if(ax(x)>9)return D.CY+.25*Math.min(14,Math.ceil((z-20.6)/.6)); return D.CY+.5*(i+1); });                              // the circle's gangway, its six tiers, the half steps at its ends
  K.ground((x,z)=>ax(x)<=9.6&&z>D.ZC&&z<=D.ZL?D.LY:null);                                                                 // the circle's landing
  K.ground((x,z)=>inR(ax(x),z,6,D.ZL,8.6,39)?D.FY+(D.LY-D.FY)*Math.min(34,Math.max(0,Math.ceil((39-z)/((39-D.ZL)/34))))/34:null);   // the grand stairs
  K.ground((x,z)=>ax(x)<=12&&z>D.ZL&&z<=D.ZF?D.FY:null);                                                                  // the foyer

  /* ---------- the solids ---------- */
  const S=K.solid, both=(x0,z0,x1,z1)=>{ S(x0,z0,x1,z1); S(-x1,z0,-x0,z1); };
  both(6,-.2,14.9,1.2); both(9.2,1.2,14.9,1.25);                                   // the proscenium wall either side of the opening, its frame and columns
  S(-6.4,D.ZP,6.4,D.ZP+.15); S(-7.5,D.ZP,-6.4,D.ZP+.15); both(7.5,2,7.6,D.ZP);       // the pit rail (its gate open at +x) and the pit's sides
  both(7.75,1.45,8.25,1.95);                                                         // the columns' plinths on the apron
  both(11.9,1.2,12.1,7); both(14.5,1.2,14.8,11.6); both(12.1,11.6,14.6,11.8); both(12,7,12.2,10.5); both(12,4,13.8,4.15);   // the boxes: fronts, outer walls, the stair's end and inner wall, the partition
  both(12,11.6,12.3,D.ZF+.4);                                                        // the auditorium's and foyer's side walls
  S(-9.6,D.Z1,9.6,D.Z1+.25); both(9.6,D.Z1,9.85,D.ZL);                               // the circle's front and its side walls (the passages beyond)
  S(-6,D.ZL,6,D.ZL+.2); both(8.6,D.ZL,9.6,D.ZL+.2); both(5.8,D.ZL,6,39); both(8.6,D.ZL+.2,8.8,39);   // the landing's balustrade, the grand stairs' balustrades
  S(-12.3,D.ZF,12.3,D.ZF+.4);                                                        // the front wall and its doors
  both(4.2,32.7,4.8,33.3); both(4.2,38.2,4.8,38.8);                                  // the foyer's columns
  S(-11.9,31.5,-9.2,36); S(9.2,31.5,11.9,37);                                        // the box office and the bar

  /* ---------- the stalls: the raked floor, carpet, the pit and the apron ---------- */
  { const L=D.Z1-D.ZP, ang=Math.atan2(1.3,L), len=Math.hypot(L,1.3);
    const f=plane(24,len,M.carpet,0,.65,(D.ZP+D.Z1)/2,{rx:-PI/2-ang,s:1.6}); f.receiveShadow=true;
    for(const s of [-1,1])plane(4.5,D.ZP-1.2,M.carpet,s*9.75,0,(1.2+D.ZP)/2,{rx:-PI/2,s:1.6}); }
  { // the pit: its boards, its walls in mahogany panels, a brass rail; music stands and chairs for a band that isn't there tonight
    const n=24, pts=[]; for(let i=0;i<=n;i++){ const x=-7.5+15*i/n; pts.push([x,-D.edge(x)]); } pts.push([7.5,-D.ZP],[-7.5,-D.ZP]);
    const sh=new THREE.Shape(pts.map(p=>new THREE.Vector2(p[0],p[1]))), pg=new THREE.ShapeGeometry(sh); const pm=new THREE.Mesh(pg,M.boards); pm.rotation.x=-PI/2; pm.position.y=D.PIT+.01; pm.receiveShadow=true; K.G.add(pm);
    boxA(-7.5,D.PIT,D.ZP,7.5,.95,D.ZP+.15,M.mahog,{s:.8}); boxA(-7.5,.95,D.ZP-.04,7.5,1.0,D.ZP+.19,M.mahog);
    rod([-7.5,1.12,D.ZP+.07],[6.4,1.12,D.ZP+.07],.035,M.brass); for(let x=-7.2;x<6.4;x+=1.5)rod([x,1.0,D.ZP+.07],[x,1.12,D.ZP+.07],.015,M.brass);
    for(const s of [-1,1])boxA(s*7.5,D.PIT,2,s*7.6,.95,D.ZP,M.mahog);
    for(let x=-6.6;x<=6.6;x+=.8)for(const z of [2.1,2.9]){ if(z<D.edge(x)+.25)continue; const lx=-1.4,mz=z+.08;
      rod([x,D.PIT,mz+.45],[x,D.PIT+1.05,mz+.45],.012,M.iron); boxA(x-.22,D.PIT+1.0,mz+.38,x+.22,D.PIT+1.32,mz+.42,M.iron); boxA(x-.2,D.PIT+1.04,mz+.37,x+.2,D.PIT+1.3,mz+.38,M.paper,{cast:false});
      boxA(x-.2,D.PIT+.45,mz+.75,x+.2,D.PIT+.5,mz+1.1,M.mahog); boxA(x-.2,D.PIT+.5,mz+1.08,x+.2,D.PIT+.95,mz+1.12,M.mahog); for(const q of [-.18,.18])rod([x+q,D.PIT,mz+.78],[x+q,D.PIT+.47,mz+.78],.02,M.mahog); }
    // the conductor's podium and stand at the middle, facing the stage
    boxA(-.45,D.PIT,3.6,.45,D.PIT+.25,4.3,M.mahog); rod([0,D.PIT+.25,3.75],[0,D.PIT+1.35,3.75],.015,M.brass); boxA(-.3,D.PIT+1.3,3.65,.3,D.PIT+1.32,3.95,M.mahog);
    // the pit's stair up to the gate in the rail
    for(let i=0;i<12;i++){ const z=D.ZP-(i+1)*.2; if(z<2.2)break; boxA(6.45,D.PIT,z,7.45,i===0?-.16:D.PIT+(11-i)*.16+.16,z+.2,M.boards); }
    // the apron: its boards out over the pit's back wall, the footlights' trough along its edge
    const ap=[]; for(let i=0;i<=40;i++){ const x=-9.2+18.4*i/40; ap.push([x,-D.edge(x)]); } ap.push([9.2,0],[-9.2,0]);
    const ex=ext(ap,D.SY-D.PIT,[M.boards,M.black],0,D.PIT,0,{rx:-PI/2}); ex.material=[M.boards,M.matte];
    const tro=[]; for(let i=0;i<=40;i++){ const x=-7.2+14.4*i/40; tro.push([x,D.SY+.04,D.edge(x)-.18]); } tube(tro,.06,M.brass,{n:80,seg:6});
    K.foot=tro; }
  for(const s of [-1,1])for(let i=0;i<6;i++){ const z=D.ZP-(i+1)*(2.6/6); boxA(s*7.6,0,z,s*9.2,D.SY*(i+1)/6,z+2.6/6,M.carpet,{s:1.6}); }

  /* ---------- the stalls' seats: cast-iron standards, tip-up velvet seats, buttoned backs with a mahogany rim ---------- */
  { const mx=K.mx;
    const vel=K.merge([[new THREE.BoxGeometry(.5,.1,.46),mx(0,.44,-.02)],[new THREE.BoxGeometry(.5,.6,.1),mx(0,.78,.2,.16)],[new THREE.CylinderGeometry(.05,.05,.5,8),mx(0,.5,-.24,0,0,PI/2)],[new THREE.BoxGeometry(.48,.08,.08),mx(0,1.09,.25,.16)]]);
    const wood=K.merge([[new THREE.BoxGeometry(.52,.07,.06),mx(0,1.12,.27,.16)],[new THREE.BoxGeometry(.5,.62,.03),mx(0,.78,.26,.16)]]);
    const iron=K.merge([[new THREE.BoxGeometry(.05,.75,.5),mx(-.27,.37,0)],[new THREE.BoxGeometry(.06,.05,.42),mx(-.27,.66,-.06)],[new THREE.CylinderGeometry(.04,.04,.04,10),mx(-.27,.67,-.28,0,0,PI/2)],[new THREE.BoxGeometry(.12,.04,.5),mx(-.27,.02,0)]]);
    const rows=[]; const seatAt=(x,y,z,ry,blk,ri)=>{ rows.push([x,y,z,ry]); K.seats.push({x,y:y+.48,z,hd:ry+PI,blk,row:ri}); };
    for(let r=0;r<15;r++){ const z=5.8+r*.95, y=D.rake(z); for(let k=0;k<15;k++)seatAt(-4.2+k*.6,y,z,0,'c',r); for(const s of [-1,1])for(let k=0;k<7;k++)seatAt(s*(6+k*.6),y,z,0,s<0?'l':'r',r); }
    for(let i=0;i<6;i++){ const z=20.6+i*1.2+.62, y=D.CY+.5*(i+1); for(let k=0;k<30;k++)seatAt(-8.7+k*.6,y,z,0,'circle',i); }
    inst(vel,M.seat,rows); inst(wood,M.mahog,rows); inst(iron,M.iron,rows); inst(iron,M.iron,rows.map(a=>[a[0]+.54,a[1],a[2],a[3]]));
    // numbered row ends: a small brass plate and its letter on each aisle's iron standard
    const lt=TX.print(512,64,(g,w,h)=>{ g.fillStyle='#c9a24a'; g.fillRect(0,0,w,h); g.fillStyle='#2a1810'; g.font='bold 40px Georgia,serif'; g.textAlign='center'; for(let i=0;i<16;i++)g.fillText('ABCDEFGHJKLMNOPQ'[i],i*32+16,46); });
    const ltm=new THREE.MeshLambertMaterial({map:lt}); for(let r=0;r<15;r++)for(const x of [-4.5,4.5,-9.9,9.9]){ const z=5.8+r*.95, y=D.rake(z), m=plane(.12,.12,ltm,x+(x<0?-.02:.02),y+.55,z,{ry:x<0?-PI/2:PI/2}); m.geometry.attributes.uv.array.set([r/16,1,(r+1)/16,1,r/16,0,(r+1)/16,0]); }
    // aisle lights: a little brass lamp low on each aisle seat's standard, lighting the step (kept on through the show)
    const al=[]; for(let r=0;r<15;r++)for(const x of [-4.45,4.45,-9.85,9.85])al.push([x,D.rake(5.8+r*.95)+.18,5.8+r*.95]); K.aisle=inst(new THREE.SphereGeometry(.03,6,4),M.bulb,al,{cast:false}); }

  /* ---------- the walls of the house: plaster above a mahogany dado, gilt pilasters, sconces ---------- */
  for(const s of [-1,1]){
    plane(D.ZL-11.6,D.HOUSE,M.plaster,s*12,D.HOUSE/2,(11.6+D.ZL)/2,{ry:-s*PI/2,s:2}); plane(3.5,D.HOUSE,M.plaster,s*12,D.HOUSE/2,8.75,{ry:-s*PI/2,s:2}); plane(1.1,D.HOUSE-2.8,M.plaster,s*12,(D.HOUSE+2.8)/2,11.05,{ry:-s*PI/2,s:2});
    plane(4.6,D.HOUSE,M.plaster,s*14.5,D.HOUSE/2,9.3,{ry:s*PI/2,s:2}); boxA(s*12,5.75,7,s*14.5,5.95,11.6,M.plaster);
    for(let z=7;z<D.Z1;z+=.5){ const y=D.rake(z+.25); boxA(s*11.96,y-.4,z,s*12,y+1.1,z+.5,M.mahog,{s:.6}); }
    boxA(s*11.94,0,7,s*12,D.FY+1.1,7.05,M.gold);
    for(const z of [8.6,12.2,15.8,19.4]){ const y=D.rake(z); boxA(s*11.85,y+1.1,z-.3,s*12,D.HOUSE-.6,z+.3,M.orn,{s:1}); box(.25,.5,.75,M.gold,s*11.88,D.HOUSE-.85,z); }
    for(const z of [10.4,14,17.6]){ const y=D.rake(z)+2.6; rod([s*11.95,y,z],[s*11.55,y+.15,z],.025,M.brass); K.cyl(.11,.06,.22,M.glass,s*11.5,y+.25,z,{seg:12,cast:false}); K.sph(.05,M.bulb,s*11.5,y+.22,z,{cast:false}); (K.sconce=K.sconce||[]).push([s*11.5,y+.25,z]); }
    boxA(s*12,D.HOUSE-.6,1.2,s*11.7,D.HOUSE,D.ZL,M.orn); }
  // the back of the stalls: the circle's front from below, its doors to the passages, the green exit lamps
  plane(19.2,D.CY-D.FY+.3,M.plaster,0,(D.FY+D.CY)/2,D.Z1-.01,{ry:PI});
  for(const s of [-1,1]){ const x=s*10.8; boxA(x-.6,D.FY+2.3,D.Z1-.2,x+.6,D.FY+2.6,D.Z1-.1,M.matte); plane(1.1,.24,new THREE.MeshBasicMaterial({map:TX.print(256,64,(g,w,h)=>{ g.fillStyle='#062a10'; g.fillRect(0,0,w,h); g.fillStyle='#3aff70'; g.font='bold 44px Georgia,serif'; g.textAlign='center'; g.fillText('EXIT',w/2,48); })}),x,D.FY+2.45,D.Z1-.24,{ry:PI}); }

  /* ---------- the circle: its tiers, its gilded front, the soffit, the landing ---------- */
  for(let i=0;i<6;i++){ const z0=20.6+i*1.2; boxA(-9.6,D.CY,z0,9.6,D.CY+.5*(i+1),z0+1.2,M.carpet,{s:1.6}); }
  boxA(-9.6,D.FY,D.Z1,9.6,D.CY,D.ZC,M.black,{cast:false}); boxA(-9.6,D.FY,D.ZC,9.6,D.LY,D.ZL,M.black,{cast:false}); boxA(-9.6,D.CY-.02,D.Z1,9.6,D.CY,20.6,M.carpet,{s:1.6});
  boxA(-9.85,D.CY-.4,D.Z1-.25,9.85,D.CY+.95,D.Z1,M.orn,{s:1.3}); boxA(-9.9,D.CY+.95,D.Z1-.3,9.9,D.CY+1.05,D.Z1+.05,M.velvet); boxA(-9.9,D.CY-.6,D.Z1-.32,9.9,D.CY-.4,D.Z1+.02,M.gold);
  for(let x=-8;x<=8;x+=4){ const c=ext([[-.45,0],[.45,0],[.38,.5],[0,.7],[-.38,.5]],.12,M.gold,x,D.CY-.3,D.Z1-.38,{bevel:.03}); c.scale.set(1,1,1); }
  for(const s of [-1,1]){ boxA(s*9.6,D.CY,D.Z1,s*9.85,9.2,D.ZL,M.plaster,{s:2}); boxA(s*9.55,D.CY+.95,D.Z1,s*9.9,D.CY+1.05,D.ZL,M.mahog);
    boxA(s*9.6,D.FY+3,D.Z1,s*12,D.FY+3.2,D.ZL,M.plaster); }
  boxA(-9.6,D.LY-.02,D.ZC,9.6,D.LY,D.ZL,M.marble,{s:2});
  // the house's back wall over the circle: plaster above an arcade onto the landing, gilt on its arches' heads
  plane(24,D.HOUSE-D.LY-2.6,M.plaster,0,(D.LY+2.6+D.HOUSE)/2,D.ZL-.05,{ry:PI,s:2}); boxA(-12,D.LY+2.45,D.ZL-.15,12,D.LY+2.65,D.ZL-.02,M.orn,{s:1});
  for(let x=-9;x<=9;x+=3)boxA(x-.25,D.LY,D.ZL-.12,x+.25,D.LY+2.45,D.ZL,M.plaster,{s:1});
  for(const s of [-1,1])boxA(s*9.85,D.FY+3.2,D.ZL-.05,s*12,D.HOUSE,D.ZL,M.plaster,{s:2});
  { const bal=[]; for(let x=-5.9;x<=5.9;x+=.18)bal.push([x,D.LY,D.ZL+.1]); for(const s of [-1,1])for(let x=8.7;x<=9.5;x+=.18)bal.push([s*x,D.LY,D.ZL+.1]);
    const bg=new THREE.LatheGeometry([[0,0],[.05,0],[.05,.06],[.03,.12],[.055,.35],[.03,.6],[.04,.75],[.05,.8],[0,.8]].map(p=>new THREE.Vector2(p[0],p[1])),10);
    inst(bg,M.marble,bal); boxA(-6.05,D.LY+.8,D.ZL+.02,6.05,D.LY+.9,D.ZL+.18,M.mahog); for(const s of [-1,1])boxA(s*8.6,D.LY+.8,D.ZL+.02,s*9.6,D.LY+.9,D.ZL+.18,M.mahog);
    K.balG=bg; }

  /* ---------- the boxes: two tiers each side, bowed fronts in gilt and velvet, chairs inside ---------- */
  for(const s of [-1,1]){
    boxA(s*12,0,1.2,s*D.BX,2.8,7,M.mahog,{s:.8}); boxA(s*D.BX,0,1.2,s*14.8,D.HOUSE,7,M.plaster);
    for(const [y0,live] of [[2.8,1],[5.8,0]]){
      boxA(s*12,y0-.06,1.2,s*D.BX,y0,7,M.carpetBox,{s:1.4}); boxA(s*14.45,y0,1.2,s*D.BX,y0+2.9,7,M.blueVel,{s:1});
      for(const zc of [2.6,5.6]){ // each box: its bowed front, a velvet cushion on it, its chairs
        const bow=[]; for(let i=0;i<=16;i++){ const a=-PI/2+PI*i/16; bow.push([-Math.cos(a)*.35*s,Math.sin(a)*1.35]); }
        const f=ext(bow.concat([[0,1.35],[0,-1.35]]).map(p=>p),1.0,M.orn,s*11.95,y0,zc,{rx:-PI/2}); f.rotation.set(-PI/2,0,0); f.position.set(s*11.95,y0,zc);
        const top=[]; for(let i=0;i<=16;i++){ const a=-PI/2+PI*i/16; top.push([s*11.95-Math.cos(a)*.38*s,y0+1.06,zc+Math.sin(a)*1.38]); } tube(top,.07,M.velvet,{n:32});
        for(const dz of [-.6,.6]){ const cx=s*13.3, cz=zc+dz; K.lathe([[.0,0],[.03,0],[.025,.45]],M.gold,cx,y0,cz,{seg:6}); boxA(cx-.22,y0+.42,cz-.22,cx+.22,y0+.5,cz+.22,M.velvet); boxA(cx+s*.2,y0+.5,cz-.22,cx+s*.24,y0+1.05,cz+.22,M.gold);
          for(const q of [[-.2,-.2],[-.2,.2],[.2,-.2],[.2,.2]])rod([cx+q[0],y0,cz+q[1]],[cx+q[0],y0+.43,cz+q[1]],.018,M.gold);
          if(live)K.seats.push({x:cx,y:y0+.5,z:cz,hd:s>0?-PI/2:PI/2,blk:'box',row:0}); }
        boxA(s*11.9,y0+2.6,zc-1.5,s*12.2,y0+2.95,zc+1.5,M.orn); }
      for(const z of [1.2,4.07,7])cyl(.1,.1,2.6,M.gold,s*11.95,y0+1.3,z,{seg:12}); }
    // the boxes' stair, its door from the stalls, a rail
    for(let i=0;i<13;i++){ const z=7+i*(4.6/13); boxA(s*12.2,0,z,s*D.BX,2.8-(2.8-D.rake(11.6))*(i+1)/13+.01,z+4.6/13,M.carpetBox,{s:1.4}); }
    boxA(s*12.02,D.rake(11)-.02,10.5,s*12.06,D.rake(11)+2.2,11.6,M.mahog); rod([s*14.35,3.7,7],[s*14.35,D.rake(11.6)+.9,11.6],.03,M.brass); }

  /* ---------- the proscenium: the plaster wall, the gilt frame round the opening, the columns, the entablature, the arms of the house ---------- */
  { const W=D.PW/2, top=D.SY+D.PH, arch=n=>{ const o=[]; for(let i=0;i<=n;i++){ const x=-W+2*W*i/n; o.push([x,top+.7*(1-(x/W)**2)]); } return o; };
    ext([[-14.9,0],[14.9,0],[14.9,D.HOUSE],[-14.9,D.HOUSE]],.25,M.plaster,0,0,1.0,{holes:[[[-W,D.SY],[W,D.SY],...arch(24).slice().reverse()]],s:2});
    ext([[-14.9,0],[14.9,0],[14.9,23],[-14.9,23]],.2,M.brickBlack,0,0,-.2,{holes:[[[-W,D.SY],[W,D.SY],...arch(24).slice().reverse()]],s:1.2});
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

  /* ---------- the ceiling: a flat plaster ceiling with a round well, the painted dome in it, the chandelier on its chain ---------- */
  { const R=6.4, cz=12.5, sh=[[-14.9,1.2],[14.9,1.2],[14.9,D.ZL],[-14.9,D.ZL]], hole=Array.from({length:48},(_,i)=>{ const a=-i/48*PI*2; return [Math.cos(a)*R,cz+Math.sin(a)*R]; });
    const c=ext(sh,.3,M.plaster,0,D.HOUSE+.3,0,{holes:[hole],rx:PI/2,s:2}); c.castShadow=false;
    tor(R,.18,M.gold,0,D.HOUSE,cz,{rx:PI/2,seg:64,seg2:10}); tor(R-.3,.08,M.gold,0,D.HOUSE+.1,cz,{rx:PI/2,seg:64});
    const dg=new THREE.SphereGeometry(9,48,16,0,PI*2,0,Math.asin(R/9)); { const p=dg.attributes.position, uv=dg.attributes.uv; for(let i=0;i<p.count;i++)uv.setXY(i,.5+p.getX(i)/(2*R)*.92,.5-p.getZ(i)/(2*R)*.92); }
    const dome=new THREE.Mesh(dg,new THREE.MeshLambertMaterial({map:TX.ceiling,side:THREE.BackSide})); dome.position.set(0,D.HOUSE+.3-9*Math.cos(Math.asin(R/9)),cz); K.G.add(dome);
    for(let k=0;k<16;k++){ const a=k/16*PI*2; K.box(.5,.25,.3,M.gold,Math.cos(a)*(R+.4),D.HOUSE-.12,cz+Math.sin(a)*(R+.4),{ry:-a}); }
    // the chandelier: a chain of real links from the dome's crown, a brass frame of three rings, arms with candle bulbs, strings of cut-glass drops
    const top=D.HOUSE+.3+(9-9*Math.cos(Math.asin(R/9)))-.05, cy=11.4, link=new THREE.TorusGeometry(.06,.016,6,10), links=[];
    for(let y=top,i=0;y>cy+1.2;y-=.1,i++)links.push([0,y,cz,i%2?PI/2:0]); inst(link,M.brass,links);
    lathe([[0,1.3],[.12,1.25],[.18,1.0],[.1,.7],[.25,.4],[.12,0],[0,0]],M.brass,0,cy,cz,{seg:16});
    const rings=[[1.6,cy+.3,24],[1.1,cy+.9,16],[.6,cy+1.3,10]], drops=[], bulbs=[];
    for(const [r,y,n] of rings){ tor(r,.035,M.brass,0,y,cz,{rx:PI/2,seg:48}); for(let i=0;i<n;i++){ const a=i/n*PI*2, x=Math.cos(a)*r, z=cz+Math.sin(a)*r;
        rod([Math.cos(a)*.15,y-.15,cz+Math.sin(a)*.15],[x,y,z],.02,M.brass); K.cyl(.025,.025,.14,M.ivory,x,y+.1,z,{seg:6,cast:false}); bulbs.push([x,y+.2,z]);
        for(let k=0;k<5;k++)drops.push([x,y-.06-k*.07,z,a,1,0,0]); drops.push([x,y-.45,z,a,1.8]); }
      for(let i=0;i<n*3;i++){ const a=(i+.5)/(n*3)*PI*2; for(let k=0;k<3;k++){ const sag=Math.sin(k/2*PI)*.12; drops.push([Math.cos(a)*r*(1-k*.04),y-.12-sag,cz+Math.sin(a)*r*(1-k*.04),a]); } } }
    for(let i=0;i<40;i++){ const a=i/40*PI*2, r=.3+.1*(i%3); drops.push([Math.cos(a)*r,cy-.2-(i%5)*.12,cz+Math.sin(a)*r,a,1.3]); }
    K.inst(new THREE.OctahedronGeometry(.035,0),M.crystal,drops,{cast:false}); K.chBulbs=K.inst(new THREE.SphereGeometry(.035,6,4),M.bulb,bulbs,{cast:false}); K.chandelier=[0,cy+.6,cz]; }

  /* ---------- the foyer: parquet, damask over a dado, marble columns, coffered ceiling, the grand stairs, the box office and the bar, the doors ---------- */
  { const FY=D.FY, FT=12.3, z0=D.ZL, z1=D.ZF;
    boxA(-12,0,z0,12,FY,z1,M.black,{cast:false}); boxA(-12,FY-.02,z0+.2,12,FY,z1,M.parquet,{s:1.4});
    for(const s of [-1,1]){ plane(z1-z0,FT-FY,M.damask,s*12,(FY+FT)/2,(z0+z1)/2,{ry:-s*PI/2,s:.9}); boxA(s*11.95,FY,z0,s*12,FY+1.1,z1,M.mahog,{s:.6}); boxA(s*11.93,FY+1.1,z0,s*12,FY+1.16,z1,M.gold); }
    plane(24,FT-FY,M.damask,0,(FY+FT)/2,z1,{ry:PI,s:.9}); boxA(-12,FY,z1-.05,12,FY+1.1,z1,M.mahog,{s:.6});
    plane(24,FT-D.LY-.9,M.damask,0,(D.LY+.9+FT)/2,z0-.02,{s:.9});
    // under the landing: the stalls' doors in a damask wall, a dado, a clock between them
    plane(19.2,D.LY-FY,M.damask,0,(FY+D.LY)/2,z0+.01,{s:.9}); boxA(-9.6,FY,z0,9.6,FY+1.1,z0+.05,M.mahog,{s:.6}); boxA(-9.6,D.LY-.25,z0,9.6,D.LY,z0+.12,M.gold);
    const sd=TX.print(256,64,(g,w,h)=>{ g.fillStyle='#1a0e08'; g.fillRect(0,0,w,h); g.fillStyle='#e8c060'; g.font='bold 36px Georgia,serif'; g.textAlign='center'; g.fillText('STALLS',w/2,46); }), sdm=new THREE.MeshLambertMaterial({map:sd});
    for(const x of [-4.2,4.2]){ for(const q of [-.6,.6]){ boxA(x+q-.58,FY,z0+.02,x+q+.58,FY+2.7,z0+.1,M.mahog); for(const [y0,y1] of [[.25,1.2],[1.45,2.5]])boxA(x+q-.42,FY+y0,z0+.1,x+q+.42,FY+y1,z0+.13,M.mahog); K.sph(.04,M.brass,x+q*.2,FY+1.25,z0+.16,{cast:false}); }
      boxA(x-1.3,FY+2.7,z0+.02,x+1.3,FY+3.0,z0+.14,M.gold); plane(1.2,.3,sdm,x,FY+3.25,z0+.06,{}); }
    K.cyl(.45,.45,.08,M.gold,0,FY+3.4,z0+.06,{rx:PI/2,seg:24}); K.cyl(.38,.38,.09,M.ivory,0,FY+3.4,z0+.06,{rx:PI/2,seg:24}); for(const [a,l] of [[-1.2,.28],[.6,.2]])K.box(.03,l,.02,M.matte,Math.sin(a)*l/2,FY+3.4+Math.cos(a)*l/2,z0+.12,{rz:-a});
    // the coffered ceiling: deep beams both ways, gilt in their soffits
    boxA(-12,FT,z0,12,FT+.2,z1,M.plaster,{s:2,cast:false});
    for(let x=-12;x<=12;x+=3)boxA(x-.15,FT-.45,z0,x+.15,FT,z1,M.plaster,{s:2}); for(let z=z0;z<=z1;z+=3.1)boxA(-12,FT-.45,z-.15,12,FT,z+.15,M.plaster,{s:2});
    for(let x=-10.5;x<12;x+=3)for(let z=z0+1.55;z<z1;z+=3.1)K.box(1.2,.04,1.2,M.gold,x,FT-.02,z,{cast:false});
    // the columns: red marble shafts, gilt bases and capitals
    for(const x of [-4.5,4.5])for(const z of [33,38.5]){ lathe([[0,0],[.42,0],[.42,.15],[.35,.22],[.36,.3],[.3,.36],[0,.36]],M.gold,x,FY,z); cyl(.28,.3,FT-FY-1.1,M.marbleRed,x,FY+.36+(FT-FY-1.1)/2,z,{seg:24});
      lathe([[0,0],[.3,0],[.42,.3],[.55,.45],[.55,.6],[0,.6]],M.gold,x,FT-.75,z); boxA(x-.55,FT-.15,z-.55,x+.55,FT,z+.55,M.gold); }
    // the grand stairs: marble treads, a red runner held by brass rods, turned marble balusters, a mahogany rail, a lamp on each newel
    const n=34, run=(39-z0)/n, rise=(D.LY-FY)/n;
    for(const s of [-1,1]){ const tr=[], rods=[], bal=[], rn=[];
      for(let i=0;i<n;i++){ const z=39-(i+1)*run, y=FY+(i+1)*rise; tr.push([s*7.3,(FY+y)/2,z+run/2,0,1,0,0,[2.6,y-FY,run]]); rn.push([s*7.3,y+.004,z+run/2,0,1,0,0,[1.8,.008,run]],[s*7.3,y-rise/2,z+run+.004,0,1,0,0,[1.8,rise,.008]]); rods.push([s*7.3,y+.015,z+run-.02,0,1,0,PI/2]); if(i%1===0){ bal.push([s*5.9,y,z+run/2]); bal.push([s*8.7,y,z+run/2]); } }
      inst(new THREE.BoxGeometry(1,1,1),M.marble,tr); for(const x of [5.95,8.65])K.ext([[39.05,FY],[39.05,FY+.35],[z0,D.LY+.35],[z0,FY]].map(([z,y])=>[z,y]),.06,M.mahog,s*x-(s>0?0:.06),0,0,{ry:-PI/2}); inst(new THREE.BoxGeometry(1,1,1),M.carpet,rn); inst(new THREE.CylinderGeometry(.012,.012,1.9,6),M.brass,rods); inst(K.balG,M.marble,bal.map(b=>[b[0],b[1],b[2],0,1,0,0,[1,1.15,1]]));
      for(const x of [5.9,8.7]){ rod([s*x,FY+.95,39],[s*x,D.LY+.95,z0],.045,M.mahog); boxA(s*x-.15,FY,38.85,s*x+.15,FY+1.15,39.15,M.marble); lathe([[0,0],[.12,0],[.06,.25],[.1,.4],[0,.42]],M.brass,s*x,FY+1.15,39);
        K.sph(.12,M.glass,s*x,FY+1.75,39,{cast:false}); K.sph(.06,M.bulb,s*x,FY+1.75,39,{cast:false}); rod([s*x,FY+1.15,39],[s*x,FY+1.6,39],.02,M.brass); (K.newel=K.newel||[]).push([s*x,FY+1.75,39]); } }
    // the box office: a mahogany kiosk with a brass grille in its glass, a ticket roll, its sign
    { const x0=-11.9, x1=-9.2, za=31.5, zb=36; boxA(x0,FY,za,x1,FY+1.1,zb,M.mahog,{s:.6}); boxA(x1-.05,FY+1.1,za,x1+.05,FY+1.15,zb,M.marble); boxA(x0,FY+2.5,za,x1+.1,FY+2.8,zb,M.mahog);
      plane(zb-za,1.35,M.glass,x1,FY+1.82,(za+zb)/2,{ry:PI/2}); for(let z=za+.15;z<zb;z+=.12)rod([x1+.01,FY+1.15,z],[x1+.01,FY+1.5,z],.006,M.brass);
      for(const z of [za,zb])boxA(x1-.06,FY+1.1,z-.04,x1+.06,FY+2.5,z+.04,M.mahog);
      const sg=TX.print(512,96,(g,w,h)=>{ g.fillStyle='#1a0e08'; g.fillRect(0,0,w,h); g.fillStyle='#e8c060'; g.font='bold 56px Georgia,serif'; g.textAlign='center'; g.fillText('BOX OFFICE',w/2,68); });
      plane(zb-za-.4,.24,new THREE.MeshLambertMaterial({map:sg}),x1+.11,FY+2.65,(za+zb)/2,{ry:PI/2}); cyl(.08,.08,.14,M.paper,x1-.3,FY+1.22,za+1,{rx:PI/2}); boxA(x0+.1,FY,za+.1,x0+.6,FY+2.4,zb-.1,M.mahog); }
    // the bar: a mahogany counter with a marble top and a brass foot rail, the back bar's shelves of bottles and its mirror
    { const x0=9.2, x1=11.9, za=31.5, zb=37; boxA(x0,FY,za,x0+.7,FY+1.1,zb,M.mahog,{s:.6}); boxA(x0-.08,FY+1.1,za-.05,x0+.78,FY+1.16,zb+.05,M.marble); rod([x0-.2,FY+.18,za],[x0-.2,FY+.18,zb],.025,M.brass);
      for(const z of [za+1,zb-1])rod([x0+.3,FY+1.16,z],[x0+.3,FY+1.5,z],.03,M.brass);
      boxA(x1-.4,FY,za,x1,FY+.9,zb,M.mahog); const bt=[]; for(const y of [FY+1.6,FY+2.15,FY+2.7]){ boxA(x1-.3,y-.03,za,x1,y,zb,M.mahog); for(let z=za+.15;z<zb;z+=.17)bt.push([x1-.15,y,z]); }
      inst(new THREE.LatheGeometry([[0,0],[.04,0],[.045,.02],[.045,.18],[.015,.24],[.014,.32],[0,.32]].map(p=>new THREE.Vector2(p[0],p[1])),8),M.bottle,bt);
      K.mirrors.push({w:zb-za-.4,h:1.5,at:[x1-.02,FY+2.2,(za+zb)/2],ry:-PI/2,zone:'foyer'});
      inst(new THREE.CylinderGeometry(.035,.03,.1,10),M.glass,Array.from({length:12},(_,i)=>[x0+.4,FY+1.21,za+.4+i*.12])); }
    // the doors to the street: three pairs, glazed, brass push bars, a fanlight over each; the big mirrors between them
    for(const x of [-3.2,0,3.2]){ for(const q of [-1,1]){ const dx=x+q*.55; boxA(dx-.55,FY,z1-.12,dx+.55,FY+2.6,z1-.04,M.mahog); plane(.8,1.9,M.glass,dx,FY+1.45,z1-.13,{ry:PI}); rod([dx-.3,FY+1.1,z1-.2],[dx+.3,FY+1.1,z1-.2],.025,M.brass); }
      K.ext(Array.from({length:17},(_,i)=>{ const a=PI*i/16; return [Math.cos(a)*1.1,Math.sin(a)*.6]; }),.08,M.gold,x,FY+2.62,z1-.12,{}); }
    for(const x of [-8,8])K.mirrors.push({w:2.2,h:3.4,at:[x,FY+2.6,z1-.06],ry:PI,frame:1,zone:'foyer'});
    // the queue for the box office: brass posts and a velvet rope hung between them (sagging as a rope does)
    const posts=[[-8.4,33],[-8.4,35],[-6.6,35.8],[-6.6,37.8]]; for(const [x,z] of posts){ lathe([[0,0],[.18,0],[.18,.04],[.04,.08],[.03,.9],[.06,.95],[.04,1.0],[0,1.0]],M.brass,x,FY,z,{seg:14}); }
    for(let i=0;i<posts.length-1;i++)tube(K.cat([posts[i][0],FY+.92,posts[i][1]],[posts[i+1][0],FY+.92,posts[i+1][1]],.12),.03,M.velvet,{n:20});
    // the posters in gilt frames, the programme on its easel, two velvet benches
    for(const [x,z,ry] of [[-11.9,38.5,PI/2],[11.9,38.5,-PI/2],[-11.9,26,PI/2],[11.9,26,-PI/2]]){ const m=new THREE.MeshLambertMaterial({map:TX.poster}); const fx=x-Math.sign(x)*.02;
      plane(1.1,1.65,m,fx,FY+1.9,z,{ry}); K.box(1.3,1.85,.06,M.gold,x,FY+1.9,z,{ry}); }
    { const x=-2.5,z=40.4; for(const q of [-.4,.4])rod([x+q,FY,z+.25],[x+q*.6,FY+1.9,z],.025,M.mahog); rod([x,FY,z-.35],[x,FY+1.8,z],.02,M.mahog);
      K.box(1,1,.03,new THREE.MeshLambertMaterial({map:TX.bill}),x,FY+1.5,z+.04,{rx:-.12}); }
    for(const x of [-2.6,2.6]){ boxA(x-1.1,FY+.42,35.3,x+1.1,FY+.55,35.9,M.velvet); for(const q of [-1,1])for(const r of [-1,1])lathe([[0,0],[.04,0],[.03,.42]],M.gold,x+q*1,FY,35.6+r*.22,{seg:6}); }
    // the two foyer chandeliers: smaller, on chains from the coffers
    for(const z of [33,38.6]){ const cy=FT-2.2; rod([0,FT,z],[0,cy+.8,z],.02,M.brass); lathe([[0,.8],[.08,.7],[.12,.3],[.05,0],[0,0]],M.brass,0,cy,z); tor(.7,.03,M.brass,0,cy+.25,z,{rx:PI/2,seg:32}); const dr=[], bl=[];
      for(let i=0;i<12;i++){ const a=i/12*PI*2; rod([0,cy+.2,z],[Math.cos(a)*.7,cy+.25,z+Math.sin(a)*.7],.015,M.brass); bl.push([Math.cos(a)*.7,cy+.4,z+Math.sin(a)*.7]); for(let k=0;k<4;k++)dr.push([Math.cos(a)*.7,cy+.18-k*.06,z+Math.sin(a)*.7,a]); }
      for(let i=0;i<20;i++){ const a=i/20*PI*2; dr.push([Math.cos(a)*.35,cy-.05-(i%3)*.08,z+Math.sin(a)*.35,a]); }
      K.inst(new THREE.OctahedronGeometry(.03,0),M.crystal,dr,{cast:false}); K.inst(new THREE.SphereGeometry(.03,6,4),M.bulb,bl,{cast:false}); (K.fch=K.fch||[]).push([0,cy+.3,z]); }
    // the side passages: carpet, a low ceiling, posters already hung, a lamp each
    for(const s of [-1,1]){ boxA(s*9.85,D.FY-.02,D.Z1,s*12,D.FY,D.ZL,M.carpet,{s:1.6}); } }
  return K; };
export {PHA};
