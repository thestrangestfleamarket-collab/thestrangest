// THE APARTMENT ROOM: your apartment as one open room in the owner's cozy picture's style (25 Oct 2026): cream walls under a dark wood crown, wide orange planks on a cream slab, curtained windows onto the live sky, and its things (the checkered bed, the nightstands and lamps, the monstera, the diamond frames, the shelves of plants and books, the desk and chair); every small thing a real body.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, GPH, SFX, SHAD, SKY, UI, USE} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {MODS, SYS} from './006-map-pre.js';
const ROOMK={parts:[],wires:{},built:[],api:null};   // the room's other parts (the kitchen, 150b) add their builders and what their pieces do (wires); the room editor (150c) hears when it is built and works through api
{ const APTS=MODS.apts;
  if(APTS&&APTS.R){ const V3=THREE.Vector3, cl=(v,a,b)=>Math.max(a,Math.min(b,v)), MPU=.907;   // the apartment's art unit is .907 m: the picture's sizes are metres
    const col=c=>new THREE.Color('rgb('+c.join(',')+')');
    const mat=(c,o={})=>{ const {roughness,metalness,...r}=o; return new THREE.MeshLambertMaterial({color:col(c),...r}); };   // the game's cel shading: flat steps of light, no smooth gradients (owner, 25 Oct 2026)
    // a rounded box (metres, centred), its corners and edges smooth
    const rbox=(w,h,d,r=.015,s=4)=>{ r=Math.min(r,w/2-1e-4,h/2-1e-4,d/2-1e-4); const g=new THREE.BoxGeometry(w,h,d,s,s,s), p=g.attributes.position, n=g.attributes.normal, hx=w/2-r, hy=h/2-r, hz=d/2-r, v=new V3(), q=new V3();
      for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); q.set(cl(v.x,-hx,hx),cl(v.y,-hy,hy),cl(v.z,-hz,hz)); v.sub(q); const l=v.length()||1; v.multiplyScalar(1/l); n.setXYZ(i,v.x,v.y,v.z); p.setXYZ(i,q.x+v.x*r,q.y+v.y*r,q.z+v.z*r); }
      p.needsUpdate=true; n.needsUpdate=true; return g; };
    const tex=(w,h,draw,rep)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; } return t; };
    const rnd=(()=>{ let s=91; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; })();

    /* ---------- the textures, painted once ---------- */
    // wide orange planks, staggered, with dark gaps between them, as the picture's floor
    const planks=(Lu,Lv,B0=[198,116,56])=>tex(640,640,(g,W,H)=>{ const pw=.22, rows=Math.ceil(Lv/pw), ph=H/rows; g.fillStyle='#160a03'; g.fillRect(0,0,W,H);
      for(let r=0;r<rows;r++){ let u=-(r%3)*.7-rnd()*.3; while(u<Lu){ const L=1.4+rnd()*1.2, k=.84+rnd()*.24, x0=u/Lu*W, x1=(u+L)/Lu*W, y0=r*ph, b=1.4, pw2=x1-x0-3;
          g.fillStyle=`rgb(${B0[0]*k|0},${B0[1]*k|0},${B0[2]*k|0})`; g.fillRect(x0+1.5,y0+1.5,pw2,ph-3);
          for(let i=0;i<6;i++){ g.strokeStyle=`rgba(${B0[0]*.6|0},${B0[1]*.5|0},${B0[2]*.4|0},${.08+rnd()*.1})`; g.lineWidth=.8+rnd(); g.beginPath(); const yy=y0+3+rnd()*(ph-6); g.moveTo(x0+2,yy); g.bezierCurveTo(x0+(x1-x0)*.35,yy+(rnd()-.5)*ph*.3,x0+(x1-x0)*.65,yy+(rnd()-.5)*ph*.3,x1-2,yy); g.stroke(); }
          g.fillStyle='rgba(60,24,8,.06)'; g.fillRect(x0+1.5,y0+1.5,pw2,ph-3);
          g.fillStyle='rgba(255,224,180,.34)'; g.fillRect(x0+1.5,y0+1.5,pw2,b); g.fillRect(x0+1.5,y0+1.5,b,ph-3);   // grout depth: each plank a raised lip, lit top/left
          g.fillStyle='rgba(12,5,1,.55)'; g.fillRect(x0+1.5,y0+ph-1.5-b,pw2,b); g.fillRect(x1-1.5-b,y0+1.5,b,ph-3); u+=L; } } });   // ...shadowed bottom/right, so the gaps read recessed
    const checker=()=>tex(256,256,(g,W,H)=>{ const n=10, s=W/n; for(let i=0;i<n;i++)for(let j=0;j<n;j++){ g.fillStyle=(i+j)&1?'#e4e2d6':'#2c3430'; g.fillRect(i*s,j*s,s,s); } });
    const glowTex=tex(64,64,(g,W,H)=>{ for(const [r,c] of [[30,'rgba(255,180,100,.18)'],[21,'rgba(255,196,120,.32)'],[12,'rgba(255,214,150,.7)']]){ g.fillStyle=c; g.beginPath(); g.arc(32,32,r,0,7); g.fill(); } });
    // the walls and floors you can choose (the room editor): a paint, or a paper painted once and repeated by the metre
    const rep_=(t,w,h)=>{ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1/w,1/h); return t; };
    const WALLS={cream:{n:'CREAM',c:[238,228,198]},white:{n:'WHITE',c:[242,240,234]},sage:{n:'SAGE',c:[176,196,166]},blush:{n:'BLUSH',c:[230,190,180]},sky:{n:'SKY',c:[180,204,226]},butter:{n:'BUTTER',c:[242,224,168]},charcoal:{n:'CHARCOAL',c:[78,78,84]},
      brick:{n:'BRICK',g:'other',c:[150,70,50],gen:()=>rep_(tex(256,128,(g,w,h)=>{ g.fillStyle='#d8cfc2'; g.fillRect(0,0,w,h); for(let r=0;r<4;r++)for(let i=-1;i<5;i++){ const k=.8+rnd()*.3; g.fillStyle=`rgb(${156*k|0},${70*k|0},${50*k|0})`; g.fillRect(i*64+(r&1?32:0)+2,r*32+2,60,28); } }),.5,.25)},
      stripes:{n:'STRIPES',g:'paper',c:[200,214,190],gen:()=>rep_(tex(64,8,(g,w,h)=>{ g.fillStyle='#f0e8d6'; g.fillRect(0,0,w,h); g.fillStyle='#b8ccb0'; g.fillRect(0,0,22,h); g.fillStyle='#d6e0cc'; g.fillRect(26,0,4,h); }),.24,1)},
      floral:{n:'FLORAL',g:'paper',c:[226,200,200],gen:()=>rep_(tex(128,128,(g,w,h)=>{ g.fillStyle='#f2e6dc'; g.fillRect(0,0,w,h); for(const [x,y] of [[32,32],[96,96],[96,32],[32,96]].map(([x,y],i)=>i>1?[x,y]:[x,y])){ g.fillStyle='#8fae86'; g.beginPath(); g.ellipse(x+9,y+4,7,3,.5,0,7); g.fill(); for(let a=0;a<5;a++){ g.fillStyle=(x+y)%64?'#e6a2a8':'#e8c27a'; g.beginPath(); g.arc(x+Math.cos(a*1.26)*6,y+Math.sin(a*1.26)*6,5,0,7); g.fill(); } g.fillStyle='#f6e0a0'; g.beginPath(); g.arc(x,y,3,0,7); g.fill(); } }),.32,.32)},
      panel:{n:'WOOD PANEL',g:'other',c:[170,120,80],gen:()=>rep_(tex(256,32,(g,w,h)=>{ for(let i=0;i<8;i++){ const k=.85+rnd()*.25; g.fillStyle=`rgb(${176*k|0},${122*k|0},${78*k|0})`; g.fillRect(i*32,0,32,h); g.fillStyle='rgba(60,30,10,.5)'; g.fillRect(i*32,0,2,h); } }),.8,.1)},
      damask:{n:'DAMASK',g:'paper',c:[120,150,146],gen:()=>rep_(tex(128,160,(g,w,h)=>{ g.fillStyle='#6f918c'; g.fillRect(0,0,w,h); g.fillStyle='rgba(226,236,222,.55)';
        const orn=(x,y,k)=>{ g.save(); g.translate(x,y); g.scale(k,k); for(const sx of [-1,1]){ g.beginPath(); g.moveTo(0,-40); g.bezierCurveTo(sx*26,-30,sx*30,-6,sx*10,4); g.bezierCurveTo(sx*30,10,sx*22,34,0,40); g.bezierCurveTo(sx*8,22,sx*4,6,0,0); g.fill(); g.beginPath(); g.ellipse(sx*18,-14,6,10,sx*.6,0,7); g.fill(); } g.beginPath(); g.arc(0,-46,4,0,7); g.fill(); g.restore(); };
        orn(64,80,1); for(const [x,y] of [[0,0],[128,0],[0,160],[128,160]])orn(x,y,.6); }),.4,.5)},
      botanical:{n:'BOTANICAL',g:'paper',c:[214,222,196],gen:()=>rep_(tex(128,128,(g,w,h)=>{ g.fillStyle='#ece6d2'; g.fillRect(0,0,w,h);
        for(const [x,y,a,c] of [[30,34,.6,'#6f9a62'],[92,28,-.8,'#86ad74'],[64,80,.2,'#5f8c58'],[22,104,-.5,'#86ad74'],[104,100,.9,'#6f9a62']]){ g.save(); g.translate(x,y); g.rotate(a); g.strokeStyle='#4f7448'; g.lineWidth=1.5; g.beginPath(); g.moveTo(0,-22); g.lineTo(0,22); g.stroke();
          for(let k=-2;k<=2;k++)for(const sx of [-1,1]){ g.fillStyle=c; g.beginPath(); g.ellipse(sx*7,k*8,8,3.5,sx*.5,0,7); g.fill(); } g.restore(); } }),.5,.5)},
      polka:{n:'POLKA DOT',g:'paper',c:[232,196,192],gen:()=>rep_(tex(64,64,(g,w,h)=>{ g.fillStyle='#e8c4c0'; g.fillRect(0,0,w,h); g.fillStyle='#fbf3ea'; for(const [x,y] of [[16,16],[48,48],[48,-16],[-16,48],[80,48],[48,80]]){ g.beginPath(); g.arc(x,y,7,0,7); g.fill(); } }),.16,.16)}};
    const tiled=(n,w,draw)=>(Lx,Ly)=>rep_(tex(n,n,draw),w*1/Lx,w*1/Ly);
    const FLOORS={planks:{n:'ORANGE PLANKS',c:[198,116,56],gen:(Lx,Ly)=>planks(Lx,Ly)},oak:{n:'LIGHT OAK',c:[214,172,124],gen:(Lx,Ly)=>planks(Lx,Ly,[214,172,124])},walnut:{n:'WALNUT',c:[118,72,42],gen:(Lx,Ly)=>planks(Lx,Ly,[118,72,42])},grey:{n:'GREY WASH',c:[176,166,154],gen:(Lx,Ly)=>planks(Lx,Ly,[176,166,154])},
      checker:{n:'CHECKER TILE',c:[60,60,60],gen:tiled(128,.6,(g,w)=>{ for(let i=0;i<2;i++)for(let j=0;j<2;j++){ g.fillStyle=(i+j)&1?'#2a2a2e':'#ece8de'; g.fillRect(i*64,j*64,64,64); } g.strokeStyle='rgba(120,110,100,.5)'; g.lineWidth=2; g.strokeRect(0,0,w,w); g.beginPath(); g.moveTo(64,0); g.lineTo(64,128); g.moveTo(0,64); g.lineTo(128,64); g.stroke(); })},
      terracotta:{n:'TERRACOTTA',c:[196,110,72],gen:tiled(128,.6,(g,w)=>{ g.fillStyle='#d8c8b4'; g.fillRect(0,0,w,w); for(let i=0;i<2;i++)for(let j=0;j<2;j++){ const k=.88+rnd()*.2; g.fillStyle=`rgb(${200*k|0},${112*k|0},${72*k|0})`; g.fillRect(i*64+2,j*64+2,60,60); } })},
      carpet:{n:'CARPET',c:[196,170,150],gen:tiled(128,1,(g,w)=>{ g.fillStyle='#c4aa96'; g.fillRect(0,0,w,w); for(let i=0;i<2400;i++){ g.fillStyle=`rgba(${rnd()<.5?90:255},${rnd()<.5?70:240},${rnd()<.5?60:220},.08)`; g.fillRect(rnd()*w,rnd()*w,2,2); } })},
      concrete:{n:'CONCRETE',c:[150,150,148],gen:tiled(128,1.5,(g,w)=>{ g.fillStyle='#9a9894'; g.fillRect(0,0,w,w); for(let i=0;i<900;i++){ g.fillStyle=`rgba(${rnd()<.5?60:220},${rnd()<.5?60:220},${rnd()<.5?60:220},.06)`; g.fillRect(rnd()*w,rnd()*w,3,3); } })},
      chevron:{n:'CHEVRON',c:[170,112,64],gen:(Lx,Ly)=>tex(1024,1024,(g,W,H)=>{ const sx=W/Lx, sy=H/Ly, cw=.24, pw=.1; g.fillStyle='#2a160a'; g.fillRect(0,0,W,H);
        for(let j=0;j*cw<Lx;j++){ const d=j&1?1:-1, x0=j*cw*sx, x1=(j+1)*cw*sx; for(let y=-cw;y<Ly+cw;y+=pw){ const k=.84+rnd()*.26, y0=y*sy, dy=d*cw*sy;
          g.fillStyle=`rgb(${196*k|0},${134*k|0},${78*k|0})`; g.beginPath(); g.moveTo(x0+1,y0+1); g.lineTo(x1-1,y0+dy+1); g.lineTo(x1-1,y0+dy+pw*sy-1); g.lineTo(x0+1,y0+pw*sy-1); g.closePath(); g.fill(); } } })},
      parquet:{n:'PARQUET',c:[186,130,78],gen:tiled(128,.48,(g,w)=>{ g.fillStyle='#3a2210'; g.fillRect(0,0,w,w); for(let i=0;i<2;i++)for(let j=0;j<2;j++)for(let k=0;k<3;k++){ const f=.86+rnd()*.24; g.fillStyle=`rgb(${190*f|0},${132*f|0},${78*f|0})`;
        if((i+j)&1)g.fillRect(i*64+k*21.3+1,j*64+1,19.3,62); else g.fillRect(i*64+1,j*64+k*21.3+1,62,19.3); } })},
      marble:{n:'MARBLE',c:[226,224,220],gen:tiled(256,1.2,(g,w)=>{ g.fillStyle='#e8e6e0'; g.fillRect(0,0,w,w); for(let i=0;i<14;i++){ g.strokeStyle=`rgba(${120+rnd()*40|0},${120+rnd()*40|0},${130+rnd()*40|0},${.15+rnd()*.25})`; g.lineWidth=.6+rnd()*1.6; g.beginPath(); let x=rnd()*w, y=rnd()*w; g.moveTo(x,y); for(let k=0;k<4;k++){ x+=(rnd()-.3)*90; y+=(rnd()-.5)*60; g.quadraticCurveTo(x-20,y+20,x,y); } g.stroke(); }
        g.strokeStyle='rgba(150,146,140,.6)'; g.lineWidth=2; g.strokeRect(0,0,w,w); g.beginPath(); g.moveTo(128,0); g.lineTo(128,256); g.moveTo(0,128); g.lineTo(256,128); g.stroke(); })},
      slate:{n:'SLATE',c:[70,74,80],gen:tiled(128,.8,(g,w)=>{ g.fillStyle='#2a2c30'; g.fillRect(0,0,w,w); for(let i=0;i<2;i++)for(let j=0;j<2;j++){ const f=.8+rnd()*.35; g.fillStyle=`rgb(${74*f|0},${78*f|0},${86*f|0})`; g.fillRect(i*64+2,j*64+2,60,60);
        for(let k=0;k<60;k++){ g.fillStyle=`rgba(${rnd()<.5?20:200},${rnd()<.5?20:200},${rnd()<.5?30:210},.07)`; g.fillRect(i*64+2+rnd()*58,j*64+2+rnd()*58,4,2); } } })},
      hex:{n:'HEX TILE',c:[232,230,224],gen:(Lx,Ly)=>hexTex('#ecebe6','#b8b4ac',.3,Lx,Ly)}};
    // the hexagon tiles' picture: one period of flat-topped hexagons, repeated (a row of three widths by one height)
    function hexTex(fill,grout,r,Lx,Ly){ const R=24, w=R*3, h=Math.round(R*Math.sqrt(3)); const t=tex(w,h,(g)=>{ g.fillStyle=grout; g.fillRect(0,0,w,h);
        const hexA=(cx,cy)=>{ g.beginPath(); for(let k=0;k<6;k++){ const a=k*Math.PI/3; g.lineTo(cx+(R-1.5)*Math.cos(a),cy+(R-1.5)*Math.sin(a)); } g.closePath(); const f=.92+rnd()*.12; g.fillStyle=fill; g.globalAlpha=f; g.fill(); g.globalAlpha=1; };
        for(const [cx,cy] of [[0,0],[w,0],[0,h],[w,h],[R*1.5,h/2],[R*1.5+w,h/2],[R*1.5-w,h/2],[w/2+R*1.5- w/2,h/2]])hexA(cx,cy); }); return rep_(t,r*3/Lx,r*Math.sqrt(3)/Ly); }
    // the kitchen's own floor (its corner of the room): five, or the room's
    const KFLOORS={oak:{n:'LIGHT OAK',c:[214,172,124],gen:(w,h)=>planks(w,h,[214,172,124])},diner:{n:'DINER CHECKER',c:[40,40,44],gen:tiled(128,.5,(g,w)=>{ for(let i=0;i<2;i++)for(let j=0;j<2;j++){ g.fillStyle=(i+j)&1?'#222226':'#f2eee4'; g.fillRect(i*64,j*64,64,64); } })},
      terracotta:{n:'TERRACOTTA HEX',c:[196,108,70],gen:(w,h)=>hexTex('#c46c46','#d8c8b2',.22,w,h)},
      cement:{n:'CEMENT TILE',c:[90,130,170],gen:tiled(128,.4,(g,w)=>{ g.fillStyle='#ece6d8'; g.fillRect(0,0,w,w); g.fillStyle='#4e7ea6'; for(const [x,y] of [[0,0],[128,0],[0,128],[128,128]]){ g.beginPath(); g.arc(x,y,44,0,7); g.fill(); }
        g.fillStyle='#ece6d8'; for(const [x,y] of [[0,0],[128,0],[0,128],[128,128]]){ g.beginPath(); g.arc(x,y,28,0,7); g.fill(); } g.fillStyle='#c98a4a'; g.beginPath(); g.arc(64,64,14,0,7); g.fill(); g.strokeStyle='#4e7ea6'; g.lineWidth=4; g.beginPath(); g.moveTo(64,30); g.lineTo(98,64); g.lineTo(64,98); g.lineTo(30,64); g.closePath(); g.stroke(); g.strokeStyle='rgba(120,110,100,.5)'; g.lineWidth=2; g.strokeRect(0,0,w,w); })},
      ceramic:{n:'WHITE CERAMIC',c:[238,238,234],gen:tiled(128,.9,(g,w)=>{ g.fillStyle='#c6c2ba'; g.fillRect(0,0,w,w); for(let i=0;i<2;i++)for(let j=0;j<2;j++){ const f=.96+rnd()*.05; g.fillStyle=`rgb(${242*f|0},${242*f|0},${238*f|0})`; g.fillRect(i*64+1.5,j*64+1.5,61,61); } })},
      room:{n:'SAME AS ROOM',c:[120,100,80]}};
    const ISO={value:0}, skyOff={on:false};
    const blackOut=()=>{ if(skyOff.on&&scene.background&&scene.background.isColor)scene.background.setRGB(0,0,0); };   // as a shop's inside does (ROOMS): after the sky has set the colour this frame

    let R=null;   // the built room: its meshes, lights and loose things
    const build=()=>{ '@apts'; const X=SHARED.BOD.X, Z=SHARED.BOD.Z, Yr=SHARED.BOD.Y, A=APTS.R, WI=APTS.WIN, WPL=APTS.WPL, M=(X(A.x0+1)-X(A.x0))/MPU, fy=Yr(.15)+.012, HW=(Yr(APTS.S||130)-Yr(0))/M;
      const px=z=>z/32.4, Lx=(A.x1-A.x0)*MPU, Ly=(A.y1-A.y0)*MPU, TH=.24, W=(u,h,v)=>new V3(X(A.x0)+u*M,fy+h*M,Z(A.y0)+v*M);
      const apt=new THREE.Group(); apt.position.set(X(A.x0),fy,Z(A.y0)); apt.scale.setScalar(M); scene.add(apt);
      R={apt,M,fy,loose:[],lights:[],lamps:[],th:[],units:[],kinds:{},ceil:[],wallMats:[],floorMat:null,wall:'cream',floor:'planks',glowK:1,addN:0};
      let CUR=null; const cur=()=>CUR?CUR.obj:apt;   // the unit being built (a piece you can move), or the room itself
      const part=(geo,m,u,h,v,ry=0,par=cur(),cast=true)=>{ const me=new THREE.Mesh(geo,m); me.position.set(u,h,v); me.rotation.y=ry; me.castShadow=cast; me.receiveShadow=true; par.add(me); return me; };
      const thing=(u,h,v,ry=0)=>{ const g=new THREE.Group(); g.position.copy(W(u,h,v)); g.rotation.y=ry; g.scale.setScalar(M); scene.add(g); return g; };
      const clip=k=>k?{clippingPlanes:[WPL[k]]}:{};
      // what loose things stand on: a solid up to a top (metres over the floor), a shelf between two heights; the top a hair under the surface, or the physics leaves it out
      const solidNow=(u0,v0,u1,v1,t)=>APTS.solid(A.x0+u0/MPU,A.y0+v0/MPU,A.x0+u1/MPU,A.y0+v1/MPU,(fy+(t-.002)*M-Yr(0))/(Yr(1)-Yr(0)));
      const shelfNow=(u0,v0,u1,v1,b,t)=>APTS.shelf&&APTS.shelf(A.x0+u0/MPU,A.y0+v0/MPU,A.x0+u1/MPU,A.y0+v1/MPU,fy+b*M,fy+(t-.002)*M);
      const solid=(u0,v0,u1,v1,t)=>CUR?CUR.sol.push([u0,v0,u1,v1,t]):solidNow(u0,v0,u1,v1,t);   // inside a unit: kept with it, placed wherever it stands
      const shelf=(u0,v0,u1,v1,b,t)=>CUR?CUR.shf.push([u0,v0,u1,v1,b,t]):shelfNow(u0,v0,u1,v1,b,t);
      const CREAM=[238,228,198], TRIM=[66,36,20], WOODO=[184,104,50], WOODD=[96,54,30], MINT=[156,214,200];

      /* ---------- the shell: one open room; cream walls, the dark crown and skirting, the glow strips, the planks on a cream slab ---------- */
      R.floorMat=mat([255,255,255],{map:planks(Lx,Ly),roughness:.55}); FLOORS.planks.t=R.floorMat.map; part(new THREE.PlaneGeometry(Lx,Ly).rotateX(-Math.PI/2),R.floorMat,Lx/2,0,Ly/2,0,apt,false);
      part(new THREE.BoxGeometry(Lx+2*TH,.3,Ly+2*TH),mat([226,214,186],{roughness:.9}),Lx/2,-.152,Ly/2,0,apt,false);   // the slab the room stands on, its edge seen against the dark
      const rect=(w,h,holes=[])=>{ const sh=new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(w,0),new THREE.Vector2(w,h),new THREE.Vector2(0,h)]); for(const [a0,a1,b0,b1] of holes)sh.holes.push(new THREE.Path([new THREE.Vector2(a0,b0),new THREE.Vector2(a1,b0),new THREE.Vector2(a1,b1),new THREE.Vector2(a0,b1)])); return sh; };
      const WW=1.24*MPU, fw=WI.FWU.map(u=>u*MPU), du=WI.DU*MPU, wz=[1.05,2.35], FD=[du-.48,du+.48,0,2.3], BD=[du-.5,du+.5,0,2.2], SW=[2.79,1.55,2.0,1.1];   // the side window: centre, sill, head, width
      const win=c=>[c-WW/2,c+WW/2,wz[0],wz[1]];
      // aged plaster: cream kept, but soft stains, faint streaks and fine grain so the walls aren't flat (owner: grittier, keep cozy)
      const wallTex=(()=>{ const t=tex(512,512,(g,W,H)=>{ g.fillStyle='#ffffff'; g.fillRect(0,0,W,H);
        for(let i=0;i<50;i++){ g.strokeStyle=`rgba(120,102,72,${.015+rnd()*.03})`; g.lineWidth=.8+rnd()*1.6; g.beginPath(); const x=rnd()*W, y0=rnd()*H*.4; g.moveTo(x,y0); g.lineTo(x+(rnd()-.5)*18,y0+H*(.3+rnd()*.5)); g.stroke(); }
        for(let i=0;i<900;i++){ const b=rnd()<.5; g.fillStyle=`rgba(${b?70:255},${b?60:244},${b?44:220},${.02+rnd()*.03})`; g.fillRect(rnd()*W,rnd()*H,1,1); } }); t.wrapS=t.wrapT=THREE.MirroredRepeatWrapping; t.repeat.set(.2,.5); return t; })();
      R.plaster=wallTex;
      const wallOf=(k,len,holes,u,v,ry)=>{ const wm=mat(CREAM,{roughness:.96,map:wallTex,side:THREE.DoubleSide,shadowSide:THREE.DoubleSide,...clip(k)}); R.wallMats.push(wm); return part(new THREE.ExtrudeGeometry(rect(len,HW,holes),{depth:TH,bevelEnabled:false}),[wm,mat([30,22,16],{roughness:.9,side:THREE.DoubleSide,...clip(k)})],u,0,v,ry,apt); };
      wallOf('Wf',Lx,[win(fw[0]),win(fw[1]),FD],0,-TH,0); wallOf('Wb',Lx,[win(fw[0]),win(fw[1]),BD],0,Ly,0);
      wallOf('Ww',Ly,[[SW[0]-SW[3]/2,SW[0]+SW[3]/2,SW[1],SW[2]]],0,0,-Math.PI/2); wallOf('We',Ly,[],Lx,Ly,Math.PI/2);
      // the crown at the top of every wall and the skirting at the foot
      // each wall's own frame: x along it from its start, z into the room
      const run=[['Wf',Lx,0,0,0],['Wb',Lx,Lx,Ly,Math.PI],['Ww',Ly,0,Ly,Math.PI/2],['We',Ly,Lx,0,-Math.PI/2]];
      for(const [k,L,ox,oz,ry] of run){ const g=new THREE.Group(); apt.add(g); g.position.set(ox,0,oz); g.rotation.y=ry;
        const tm=mat(TRIM,{roughness:.5,...clip(k)});
        part(rbox(L,.16,.1,.01),tm,L/2,HW-.08,.05,0,g); part(rbox(L,.03,.045,.008),tm,L/2,HW-.2,.03,0,g);
        part(rbox(L,.12,.03,.006),tm,L/2,.06,.015,0,g); }
      // the sky through the glass: the live sky's own shader (sun, clouds) — seen straight out in the isometric view, along your eye in first person
      const skyGlass=(k,nx,nz,ax,az)=>{ const D=SKY.dome&&SKY.dome.material; if(!D||!D.fragmentShader)return mat([150,190,230],{roughness:.1,...clip(k)});
        return new THREE.ShaderMaterial({uniforms:Object.assign({},D.uniforms,{uN:{value:new V3(nx,.08,nz)},uA:{value:new V3(ax,0,az)},uIso:ISO}),defines:{...(D.defines||{})},clipping:true,...clip(k),
          vertexShader:'#include <clipping_planes_pars_vertex>\nuniform vec3 uN,uA; uniform float uIso; varying vec3 vD; void main(){ vec4 w=modelMatrix*vec4(position,1.); vec3 e=normalize(w.xyz-cameraPosition), s=normalize(uN+vec3(0.,(uv.y-.3)*.9,0.)+uA*(uv.x-.5)*.7); vD=normalize(mix(e,s,uIso)); vec4 mvPosition=viewMatrix*w; gl_Position=projectionMatrix*mvPosition;\n#include <clipping_planes_vertex>\n}',
          fragmentShader:'#include <clipping_planes_pars_fragment>\n'+D.fragmentShader.replace(/void main\(\)\s*\{/,'void main(){\n#include <clipping_planes_fragment>\n')}); };
      // clear glass: you see out of it, onto the fire escape and the sky beyond (only a faint sheen of its own)
      const glass=k=>mat([206,226,240],{roughness:.05,transparent:true,opacity:.1,depthWrite:false,...clip(k)});
      // the picture's window: a thick orange frame of four panes and its sill, a dark rod, the mint sheers tied back
      const windowAt=(k,uc,v,ry,out,z0,z1,w,panes=[2,2],curtains=true)=>{ const g=new THREE.Group(); g.position.set(uc,0,v); g.rotation.y=ry; apt.add(g); const wm=mat(WOODO,{roughness:.55,...clip(k)});
        part(new THREE.PlaneGeometry(w-.04,z1-z0-.04),glass(k),0,(z0+z1)/2,-.16,0,g,false);
        for(const s of [-1,1])part(rbox(.09,z1-z0+.06,.16,.012),wm,s*(w/2-.025),(z0+z1)/2,-.06,0,g); part(rbox(w+.04,.09,.16,.012),wm,0,z1-.005,-.06,0,g);
        part(rbox(w+.16,.05,.2,.012),wm,0,z0-.01,-.04,0,g);
        for(let i=1;i<panes[0];i++)part(rbox(.04,z1-z0,.05,.006),wm,-w/2+w*i/panes[0],(z0+z1)/2,-.13,0,g);
        for(let j=1;j<panes[1];j++)part(rbox(w,.04,.05,.006),wm,0,z0+(z1-z0)*j/panes[1],-.13,0,g);
        if(!curtains)return g; const rod=mat([40,30,24],{roughness:.4,metalness:.5,...clip(k)}); part(new THREE.CylinderGeometry(.014,.014,w+.8,10).rotateZ(Math.PI/2),rod,0,z1+.18,.08,0,g);
        for(const s of [-1,1]){ part(new THREE.SphereGeometry(.025,10,8),rod,s*(w/2+.4),z1+.18,.08,0,g);
          const sheer=new THREE.MeshLambertMaterial({color:col(MINT),transparent:true,opacity:.62,side:THREE.DoubleSide,emissive:col([60,90,84]),emissiveIntensity:.25,...clip(k)});
          const top=z1+.17, bot=Math.max(.6,z0-.35), cg=new THREE.PlaneGeometry(1,1,18,26), p=cg.attributes.position, outer=s*(w/2+.38), inner=s*(w/2-.08);
          for(let i=0;i<p.count;i++){ const a=p.getX(i)+.5, b=.5-p.getY(i), h=top-(top-bot)*b, gather=.35+.65*Math.pow(1-b,1.4), u=outer+(inner-outer)*a*gather;
            p.setXYZ(i,u,h,.09+Math.sin(a*Math.PI*6+s)*.03*(.4+b)+.02*b); }
          cg.computeVertexNormals(); part(cg,sheer,0,0,0,0,g); }
        return g; };
      const doorAt=(k,uc,v,ry,out,o)=>{ const g=new THREE.Group(); g.position.set(uc,0,v); g.rotation.y=ry; apt.add(g); const wm=mat(WOODD,{roughness:.5,...clip(k)}), w=o[1]-o[0], h=o[3];
        for(const s of [-1,1])part(rbox(.08,h+.08,.03,.006),wm,s*(w/2+.04),h/2+.04,.015,0,g); part(rbox(w+.24,.08,.03,.006),wm,0,h+.04,.015,0,g);
        const leaf=new THREE.Group(); leaf.position.set(0,0,-.08); g.add(leaf);
        if(out){ const fw_=.09, ww=w-.02, hh=h-.02, b0=.32;   // a glazed door: a frame of stiles and rails round six panes of clear glass you see out of
          for(const s of [-1,1])part(rbox(fw_,hh,.05,.008),wm,s*(ww/2-fw_/2),h/2,0,0,leaf); part(rbox(ww,b0,.05,.008),wm,0,b0/2+.01,0,0,leaf); part(rbox(ww,fw_,.05,.008),wm,0,h-.01-fw_/2,0,0,leaf);
          const gw=ww-2*fw_, g0=b0+.01, g1=h-.01-fw_, gh=g1-g0; part(rbox(.04,gh,.045,.006),wm,0,(g0+g1)/2,0,0,leaf); for(const t of [1/3,2/3])part(rbox(gw,.04,.045,.006),wm,0,g0+gh*t,0,0,leaf);
          part(new THREE.PlaneGeometry(gw,gh),glass(k),0,(g0+g1)/2,0,0,leaf,false); }
        else { part(rbox(w-.02,h-.02,.05,.008),wm,0,h/2,0,0,leaf); for(let r=0;r<2;r++)for(let c=0;c<2;c++)part(rbox(w*.34,h*(r?.42:.3),.012,.006),mat([118,68,38],{roughness:.5,...clip(k)}),(c-.5)*w*.44,h*(r?.68:.25),.03,0,leaf); }
        part(new THREE.SphereGeometry(.03,12,8),mat([200,160,90],{roughness:.3,metalness:.7,...clip(k)}),w/2-.1,1.0,.05,0,leaf); };
      windowAt('Wf',fw[0],0,0,[0,-1,1,0],wz[0],wz[1],WW); windowAt('Wf',fw[1],0,0,[0,-1,1,0],wz[0],wz[1],WW,[2,2],false);
      windowAt('Wb',fw[0],Ly,Math.PI,[0,1,-1,0],wz[0],wz[1],WW); windowAt('Wb',fw[1],Ly,Math.PI,[0,1,-1,0],wz[0],wz[1],WW);
      windowAt('Ww',SW[0],0,Math.PI/2,[-1,0,0,1],SW[1],SW[2],SW[3],[4,1],false).position.set(0,0,SW[0]);   // the little row of four panes above the bed
      doorAt('Wf',du,0,0,[0,-1,1,0],FD); doorAt('Wb',du,Ly,Math.PI,[0,1,-1,0],BD);

      /* ---------- the pieces: each one a unit you can move, turn, resize or put away (the room editor, 150c) ---------- */
      const unitBox=o=>{ o.updateWorldMatrix(true,true); const B=new THREE.Box3(); o.traverse(q=>{ if(q.isMesh&&!q.userData.soft&&q.visible!==false)B.expandByObject(q,true); }); return B; };
      const ids={}, uid=n=>{ const k=n.toLowerCase().replace(/[^a-z0-9]+/g,'-'); ids[k]=(ids[k]||0)+1; return k+'-'+ids[k]; };
      const kindOf=un=>{ if(!R.kinds[un.kind])R.kinds[un.kind]={kind:un.kind,name:un.name,loose:un.loose,m:un.m,wire:un.wire,sol:un.sol,shf:un.shf,tpl:un.obj.clone(true)}; };
      // where a unit stands decides its solids and shelves: its footprint turned and scaled, as boxes on the floor plan
      const place=un=>{ for(const h of un.h)if(APTS.unsolid)APTS.unsolid(h); un.h=[]; if(un.gone||un.loose)return; const g=un.obj, c=Math.cos(g.rotation.y), sn=Math.sin(g.rotation.y), k=g.scale.x;
        const xf=(x,z)=>[g.position.x+(x*c+z*sn)*k,g.position.z+(-x*sn+z*c)*k], box=r=>{ const P=[xf(r[0],r[1]),xf(r[2],r[1]),xf(r[0],r[3]),xf(r[2],r[3])]; return [Math.min(...P.map(q=>q[0])),Math.min(...P.map(q=>q[1])),Math.max(...P.map(q=>q[0])),Math.max(...P.map(q=>q[1]))]; };
        for(const r of un.sol){ const b=box(r); un.h.push(solidNow(b[0],b[1],b[2],b[3],g.position.y+r[4]*k)); }
        for(const r of un.shf){ const b=box(r); const h=shelfNow(b[0],b[1],b[2],b[3],g.position.y+r[4]*k,g.position.y+r[5]*k); if(h)un.h.push(h); } };
      // the still parts of a unit baked into one mesh a material (a few draws, not hundreds)
      const bake=S=>{ S.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(S.matrixWorld).invert(), by=new Map(), L=[];
        S.traverse(o=>{ if(o.isMesh&&!o.userData.keep&&!o.children.length&&!Array.isArray(o.material))L.push(o); });
        for(const o of L){ const geo=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld)); if(!geo.attributes.normal)geo.computeVertexNormals();
          const k=o.material.uuid+(o.castShadow?'c':''); if(!by.has(k))by.set(k,{m:o.material,cast:o.castShadow,gs:[]}); by.get(k).gs.push(geo); o.removeFromParent(); }
        for(const {m,cast,gs} of by.values()){ let n=0; for(const q of gs)n+=q.attributes.position.count; const P=new Float32Array(n*3), N=new Float32Array(n*3), U=new Float32Array(n*2); let o=0;
          for(const q of gs){ P.set(q.attributes.position.array,o*3); N.set(q.attributes.normal.array,o*3); if(q.attributes.uv)U.set(q.attributes.uv.array,o*2); o+=q.attributes.position.count; q.dispose(); }
          const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.BufferAttribute(P,3)); bg.setAttribute('normal',new THREE.BufferAttribute(N,3)); bg.setAttribute('uv',new THREE.BufferAttribute(U,2));
          const me=new THREE.Mesh(bg,m); me.castShadow=cast; me.receiveShadow=true; S.add(me); } };
      // a still piece (furniture, a frame, a shelf): built in room metres, then pivoted on its footprint's centre
      const cap=(name,fn,o={})=>{ const g=new THREE.Group(); apt.add(g); const un={id:o.id||uid(name),name,kind:o.kind||name,obj:g,loose:false,sol:[],shf:[],h:[],th:[],wire:o.wire||null,st:{}}; const prev=CUR; CUR=un; fn(g); CUR=prev;
        if(o.bake)bake(g); const B=unitBox(g), c=apt.worldToLocal(B.getCenter(new V3())), by=Math.max(0,apt.worldToLocal(B.min.clone()).y);
        for(const q of g.children){ q.position.x-=c.x; q.position.y-=by; q.position.z-=c.z; } g.position.set(c.x,by,c.z);
        un.sol=un.sol.map(r=>[r[0]-c.x,r[1]-c.z,r[2]-c.x,r[3]-c.z,r[4]-by]); un.shf=un.shf.map(r=>[r[0]-c.x,r[1]-c.z,r[2]-c.x,r[3]-c.z,r[4]-by,r[5]-by]);
        kindOf(un); R.units.push(un); place(un); return un; };
      // something to double-click on a unit (its whole box unless one is given: [w,h,d,x,y,z] in its own metres)
      const hit=(un,name,act,b)=>{ let w,h,d,x,y,z; if(b)[w,h,d,x,y,z]=b; else { const B=unitBox(un.obj).applyMatrix4(un.obj.matrixWorld.clone().invert()), sz=B.getSize(new V3()), cc=B.getCenter(new V3()); [w,h,d,x,y,z]=[sz.x+.04,sz.y+.04,sz.z+.04,cc.x,cc.y,cc.z]; }
        const hb=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(x,y,z); hb.userData.soft=hb.userData.keep=hb.userData.hit=1; un.obj.add(hb);
        const th={name:name(),obj:hb,reach:1.4*M,near:2.6*M,tall:Math.max(.4,h)*M,act:()=>{ act(th); th.name=name(); }}; UI.thing(th); un.th.push(th); return th; };
      const WIRES=ROOMK.wires;
      WIRES.sit=un=>{ hit(un,()=>'SIT ON THE '+un.name,th=>{ if(USE.sit)USE.sit(un.obj,th); }); };
      WIRES.lamp=un=>{ let L=null, halo=null; const sm=[]; un.obj.traverse(o=>{ if(o.isPointLight)L=o; if(o.userData.halo)halo=o; if(o.userData.shade){ o.material=o.material.clone(); sm.push(o.material); } }); if(!L)return;
        if(halo)halo.material=halo.material.clone(); const Lp={g:un.obj,L,sm:sm[0]||{},halo,on:true,i0:L.userData.i0}; L.userData.lp=Lp; R.lamps.push(Lp);
        Lp.th=hit(un,()=>'LAMP: '+(Lp.on?'ON':'OFF'),()=>{ Lp.on=!Lp.on; if(SFX)SFX.play('click',{vol:.8,vary:.2}); },[.3,.5,.3,0,.25,0]); };
      const wireUp=un=>{ if(un.wire&&WIRES[un.wire])WIRES[un.wire](un,ctx); };
      // a soft contact shadow under each piece that stands on the floor, carried with it wherever it goes (SHAD.blob; cheap, no light)
      const bm=SHAD.mat({alpha:.42}), blobFor=un=>{ if(!SHAD.blob)return; const o=un.obj, B=unitBox(o); if(B.isEmpty())return; B.applyMatrix4(o.matrixWorld.clone().invert()); if(B.min.y>.05)return;
        const sz=B.getSize(new V3()), cc=B.getCenter(new V3()), m=SHAD.blob(o,cc.x,B.min.y,cc.z,sz.x+.12,sz.z+.12,{mat:bm}); m.userData.soft=m.userData.keep=1; };
      const looseUnit=(g,name,m,seat,wire)=>{ const un={id:uid(name),name,kind:name,obj:g,loose:true,m,sol:[],shf:[],h:[],th:[],wire:wire||(seat?'sit':null),st:{}}; kindOf(un); R.units.push(un); return un; };
      const body=un=>{ if(!GPH.add)return; if(un.it){ GPH.drop(un.it); const i=R.th.indexOf(un.it); if(i>=0)R.th.splice(i,1); un.it=null; } if(un.gone||!un.loose)return; const s=un.obj.scale.x/M; un.it=GPH.add(un.obj,{name:un.name,m:un.m*s*s*s}); R.th.push(un.it); };

      const wd=mat(WOODO,{roughness:.5}), wdk=mat(WOODD,{roughness:.5}), knob=mat([60,40,26],{roughness:.4,metalness:.3});
      const BV=2.62, BW=1.02, BL=2.06;
      cap('BED',()=>{ const g=new THREE.Group(); g.position.set(0,0,BV); cur().add(g);
        part(rbox(BL,.26,BW+.08,.02),wdk,.04+BL/2,.2,0,0,g); for(const s of [-1,1])part(rbox(.06,.36,.06,.01),wdk,s<0?.07:BL+.01,.18,s*(BW/2+.01),0,g);
        part(rbox(.07,.95,BW+.1,.02),wdk,.035,.475,0,0,g); for(let i=0;i<3;i++)part(rbox(.04,.11,BW-.04,.015),wd,.07,.55+i*.15,0,0,g);
        part(rbox(.06,.5,BW+.08,.02),wdk,BL+.04,.25,0,0,g);
        part(rbox(BL-.06,.2,BW-.04,.05),mat([236,236,228],{roughness:.9}),.07+BL/2,.42,0,0,g);
        const pil=part(rbox(.38,.14,.62,.07,6),mat(MINT,{roughness:.9}),.3,.58,0,0,g); pil.rotation.z=-.1;
        part(rbox(.34,.05,BW+.02,.04),mat([244,244,238],{roughness:.9}),.72,.545,0,0,g);   // the sheet folded back over the blanket
        // the checkered blanket from the fold to the foot, down both sides
        const nu=30, nv=24, top=.54, D=.2, L0=.86, Lb=BL-L0+.04, Wb=BW+.02, gb=new THREE.PlaneGeometry(1,1,nu,nv), p=gb.attributes.position, uv=gb.attributes.uv;
        for(let i=0;i<p.count;i++){ const a=(p.getX(i)+.5)*(Lb+D*.6), b=(p.getY(i)+.5)*(Wb+2*D)-D, ov=Math.max(0,a-Lb), sv=Math.max(0,-b,b-Wb), dr=Math.hypot(ov,sv), soft=.012*Math.min(1,dr/.03);
          p.setXYZ(i,L0+Math.min(a,Lb)+ov*.06,top+.012*Math.sin(a*7+b*4)*cl(1-dr*8,0,1)-dr*.98-soft,cl(b,0,Wb)-Wb/2+(b<0?-1:b>Wb?1:0)*sv*.06); uv.setXY(i,a/1.0,(b+D)/1.0); }
        gb.computeVertexNormals(); const ct=checker(); ct.wrapS=ct.wrapT=THREE.RepeatWrapping; ct.repeat.set(1,1); part(gb,mat([255,255,255],{map:ct,roughness:.85,side:THREE.DoubleSide}),0,0,0,0,g);
        solid(0,BV-BW/2-.05,BL+.08,BV+BW/2+.05,.56); },{wire:'sit'});
      const nightstand=v=>cap('NIGHTSTAND',()=>{ const g=new THREE.Group(); g.position.set(.23,0,v); cur().add(g); part(rbox(.44,.56,.44,.015),wdk,0,.28,0,0,g); part(rbox(.46,.03,.46,.01),wd,0,.575,0,0,g);
        for(const h of [.16,.4]){ part(rbox(.012,.2,.38,.008),mat([110,64,36],{roughness:.5}),.222,h,0,0,g); part(new THREE.SphereGeometry(.016,10,8),knob,.235,h,0,0,g); }
        solid(0,v-.23,.46,v+.23,.59); });
      nightstand(BV-BW/2-.32); nightstand(BV+BW/2+.32);
      // the lamps: a turned wooden foot and a cream bell that glows, a soft halo round it
      const lamp=(u,h,v,s=1)=>{ const g=thing(u,h,v), sm=new THREE.MeshLambertMaterial({color:col([244,234,196]),side:THREE.DoubleSide,emissive:col([255,214,150]),emissiveIntensity:.55});
        part(new THREE.LatheGeometry([[0,0],[.06,0],[.065,.02],[.035,.05],[.03,.16],[.045,.2],[.015,.22]].map(([x,y])=>new THREE.Vector2(x*s,y*s)),20),mat([196,120,58],{roughness:.45}),0,0,0,0,g);
        part(new THREE.CylinderGeometry(.075*s,.14*s,.17*s,24,1,true),sm,0,.27*s,0,0,g,false).userData.shade=1;
        const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.32})); halo.scale.set(.5*s,.5*s,1); halo.position.set(0,.26*s,0); halo.userData.halo=1; g.add(halo);
        const L=new THREE.PointLight(0xffb870,2.2,4.2*M,1.8); L.userData.pool=true; L.userData.lamp=1; L.userData.i0=2.2; L.position.set(0,.24*s,0); g.add(L); return g; };
      R.loose.push([lamp(.23,.59,BV-BW/2-.32),'LAMP',1.5,false,'lamp'],[lamp(.23,.59,BV+BW/2+.32),'LAMP',1.5,false,'lamp']);
      // the monstera by the window corner
      { const g=thing(.6,0,.66), pm=mat([214,180,140],{roughness:.8}), lm=mat([58,138,52],{roughness:.6,side:THREE.DoubleSide}), sm2=mat([70,120,50],{roughness:.6});
        part(new THREE.LatheGeometry([[0,0],[.13,0],[.15,.03],[.17,.3],[.18,.32],[.165,.32]].map(([x,y])=>new THREE.Vector2(x,y)),22),pm,0,0,0,0,g); part(new THREE.CircleGeometry(.16,18).rotateX(-Math.PI/2),mat([60,40,26],{roughness:1}),0,.31,0,0,g,false);
        const leaf=()=>{ const sh=new THREE.Shape(); sh.moveTo(0,0); sh.bezierCurveTo(.16,.04,.2,.22,.0,.34); sh.bezierCurveTo(-.2,.22,-.16,.04,0,0); const gg=new THREE.ShapeGeometry(sh,10), p=gg.attributes.position;
          for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i); const slit=Math.abs(x)>.06&&Math.sin(y*38)>.55?.0:1; p.setZ(i,-x*x*1.2-y*.12); if(!slit)p.setX(i,x*.86); } gg.computeVertexNormals(); return gg; };
        for(let k=0;k<7;k++){ const a=k/7*Math.PI*2+.3, h=.45+rnd()*.45, r=.08+rnd()*.12, st=part(new THREE.CylinderGeometry(.008,.01,h,6),sm2,Math.cos(a)*r*.5,.31+h/2,Math.sin(a)*r*.5,0,g); st.rotation.z=Math.cos(a)*.35; st.rotation.x=-Math.sin(a)*.35;
          const lf=part(leaf(),lm,Math.cos(a)*(r+.1),.31+h,Math.sin(a)*(r+.1),0,g); lf.rotation.set(-1.0+rnd()*.4,Math.PI/2-a,0); lf.scale.setScalar(.9+rnd()*.5); }
        R.loose.push([g,'MONSTERA',5]); }
      // the three diamond frames on the side wall, between the corner and the bed
      for(const [v,h,s] of [[1.2,2.05,.2],[1.2,1.72,.28],[1.2,1.42,.2]])cap('FRAME',()=>{ const g=new THREE.Group(); g.position.set(.012,h,v); g.rotation.y=Math.PI/2; cur().add(g); const fr=part(rbox(s,s,.025,.006),wdk,0,0,0,0,g,false); fr.rotation.z=Math.PI/4;
        const inr=part(new THREE.PlaneGeometry(s*.62,s*.62),mat([232,222,196],{roughness:.9}),0,0,.014,0,g,false); inr.rotation.z=Math.PI/4; });
      // the desk under two floating shelves of plants and books, its slatted chair, its lamp and its books
      const DU2=fw[0]+1.75;
      cap('DESK',()=>{ const g=new THREE.Group(); g.position.set(DU2,0,.3); cur().add(g); part(rbox(1.0,.045,.52,.012),wd,0,.76,0,0,g); part(rbox(.4,.14,.48,.01),wd,.28,.665,0,0,g); part(new THREE.SphereGeometry(.014,8,6),knob,.28,.665,.25,0,g);
        for(const [x,z] of [[-.46,-.22],[.46,-.22],[-.46,.22],[.46,.22]])part(rbox(.045,.74,.045,.008),wd,x,.37,z,0,g);
        solid(DU2-.52,0,DU2+.52,.58,.7825); });
      for(const h of [1.42,1.82])cap('WALL SHELF',()=>{ part(rbox(.86,.035,.22,.008),wdk,DU2+.05,h,.11); shelf(DU2-.38,0,DU2+.48,.22,h-.0175,h+.0175); });
      const pot=(u,h,v,green,trail)=>{ const g=thing(u,h,v); part(new THREE.CylinderGeometry(.055,.045,.1,16),mat([240,238,230],{roughness:.6}),0,.05,0,0,g); const lm=mat(green,{roughness:.6,side:THREE.DoubleSide});
        if(trail){ for(let k=0;k<9;k++){ const lf=part(new THREE.CircleGeometry(.035,8),lm,(k%3-1)*.04,.08-k*.06,.02+Math.sin(k)*.02,0,g,false); lf.rotation.set(.3,k,0); lf.userData.soft=1; } }
        else for(let k=0;k<6;k++){ const a=k/6*Math.PI*2, lf=part(new THREE.ConeGeometry(.02,.12,4),lm,Math.cos(a)*.02,.14,Math.sin(a)*.02,0,g); lf.rotation.set(Math.sin(a)*.5,0,-Math.cos(a)*.5); }
        return g; };
      R.loose.push([pot(DU2-.25,1.835,.11,[66,140,60]),'PLANT',.4],[pot(DU2+.05,1.835,.11,[52,120,58]),'PLANT',.4],[pot(DU2+.33,1.835,.11,[74,150,64]),'PLANT',.4],[pot(DU2-.36,1.435,.11,[60,138,54],true),'TRAILING PLANT',.4]);
      { const g=thing(DU2+.18,1.437,.11); [[200,60,50],[60,90,160],[230,190,60],[70,140,90],[150,70,140]].forEach((c,i)=>{ const b=part(rbox(.03,.18+((i*7)%3)*.02,.15,.004),mat(c,{roughness:.6}),i*.034,.1,0,0,g); b.rotation.z=i===4?.25:0; }); R.loose.push([g,'BOOKS',.8]); }
      { const g=thing(DU2-.25,.785,.25,.3); part(rbox(.18,.03,.13,.004),mat([60,90,160],{roughness:.6}),0,.015,0,0,g); part(rbox(.16,.03,.12,.004),mat([200,60,50],{roughness:.6}),.005,.045,0,0,g); R.loose.push([g,'BOOKS',.4]); }
      { const g=thing(DU2+.05,.785,.22,-.2); part(rbox(.08,.004,.1,.002),mat([238,214,90],{roughness:.8}),0,.002,0,0,g); R.loose.push([g,'NOTE',.05]); }
      { const g=thing(DU2+.38,.785,.18), dm=mat([40,36,32],{roughness:.4,metalness:.5}); part(new THREE.CylinderGeometry(.05,.055,.015,16),dm,0,.008,0,0,g); const n=part(new THREE.CylinderGeometry(.006,.006,.26,6),dm,0,.13,0,0,g); n.rotation.z=-.3;
        const sh=new THREE.MeshLambertMaterial({color:col([50,44,40]),emissive:col([255,200,130]),emissiveIntensity:.0}); const cn=part(new THREE.ConeGeometry(.045,.07,14,1,true),sh,.06,.25,0,0,g); cn.rotation.z=-1.2; cn.userData.shade=1;
        const L=new THREE.PointLight(0xffc98a,.9,2*M,2); L.userData.pool=true; L.userData.lamp=1; L.userData.i0=.9; L.position.set(.09,.22,0); g.add(L); R.loose.push([g,'DESK LAMP',.8,false,'lamp']); }
      { const g=thing(DU2,0,.92,Math.PI+.15), cm=mat(WOODO,{roughness:.5});
        part(rbox(.42,.04,.4,.01),cm,0,.46,0,0,g); for(const [x,z] of [[-.18,-.17],[.18,-.17],[-.18,.17],[.18,.17]])part(rbox(.035,.46,.035,.006),cm,x,.23,z,0,g);
        for(const s of [-1,1])part(rbox(.035,.5,.035,.006),cm,s*.18,.73,-.17,0,g); for(let i=0;i<3;i++)part(rbox(.36,.05,.02,.006),cm,0,.6+i*.13,-.17,0,g);
        R.loose.push([g,'CHAIR',5,true]); R.chair=g; }

      /* ---------- the light: dim and warm all round, the lamps, the late sun through the panes ---------- */
      // no light overhead and no fill (owner, 25 Oct 2026): the room is lit only by the daylight through its windows and by its own lamps and fittings
      R.winL=[]; const winLight=(u,h,v,du_,dv)=>{ const L=new THREE.SpotLight(0xdfe8ff,0,14*M,1.3,1,.9); L.userData.pool=true; L.position.copy(W(u,h,v)); L.target.position.copy(W(u+du_*2.4,0,v+dv*2.4)); scene.add(L); scene.add(L.target); R.winL.push(L); };
      for(const c of fw){ winLight(c,wz[1]-.1,.25,0,1); winLight(c,wz[1]-.1,Ly-.25,0,-1); } winLight(.25,SW[2]-.1,SW[0],1,0);
      /* ---------- out of the windows and doors: the house's fire escapes (front and back, the landings above and below yours) and the sky beyond, seen only through the glass ---------- */
      R.tops={Wf:new THREE.Plane(new V3(0,-1,0),1e6),Wb:new THREE.Plane(new V3(0,-1,0),1e6),Ww:new THREE.Plane(new V3(0,-1,0),1e6)}; R.bot=new THREE.Plane(new V3(0,1,0),1e6); R.outs={Wf:[],Wb:[],Ww:[]}; R.backs=[];   // what is outside each windowed wall; the sky behind it (the isometric view only)
      { const AL=APTS.AL, lv=Math.min(APTS.my,APTS.floors-2), S0=APTS.S, RZ=APTS.RZ, cp=k=>[WPL[k],R.tops[k],R.bot];
        const outside=(F,k,face)=>{ if(!APTS.escapeMeshes)return; const G=new THREE.Group(); scene.add(G); R.outs[k].push(G);
          for(const me of APTS.escapeMeshes(F,[lv-1,lv,lv+1],(lv-1)*S0,(lv+2)*S0)){ for(const m of [].concat(me.material)){ m.clippingPlanes=cp(k); m.needsUpdate=true; } me.castShadow=me.receiveShadow=true; G.add(me); }
          const LW=X(1)-X(0), YH=h=>Yr(h)-Yr(0); for(const sp of APTS.escPlants||[]){ if(!APTS.plant3D)break; const o=APTS.plant3D(sp.kind,sp.seed,sp.w*LW,YH(sp.h)); o.rotation.y=(sp.seed*2.39)%6.28; o.position.set(X(sp.x),Yr(sp.z),Z(sp.y));
            o.traverse(q=>{ if(q.isMesh){ q.material=q.material.clone(); q.material.clippingPlanes=cp(k); } }); G.add(o); }   // the escape's real pots, seen through your glass
          G.scale.z=-1; G.position.set(X(A.x0)-X(AL.x0),fy-Yr(lv*S0+RZ),Z(face)+Z(F.yf)); };
        outside(APTS.ESC[0],'Wf',A.y0-TH/MPU); outside(APTS.ESC[1],'Wb',A.y1+TH/MPU);
        // the house's brick outside your walls, above and below you, for the landings to hang on
        const bt=WALLS.brick.t||(WALLS.brick.t=WALLS.brick.gen()), brick=k=>mat([255,255,255],{map:bt,roughness:.9,...{clippingPlanes:cp(k)}});
        const face=(k,u,v,ry,len)=>R.outs[k].push(part(new THREE.PlaneGeometry(len,HW*3).translate(0,HW/2,0),brick(k),u,0,v,ry,apt));
        face('Wf',Lx/2,-TH-.003,Math.PI,Lx+2*TH); face('Wb',Lx/2,Ly+TH+.003,0,Lx+2*TH); face('Ww',-TH-.003,Ly/2,-Math.PI/2,Ly+2*TH);
        for(const me of [].concat(...Object.values(R.outs)))if(me.isMesh){ const g=me.geometry, uv=g.attributes.uv, w=g.parameters.width, h=g.parameters.height; for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w,uv.getY(i)*h); }
        // the sky just past the railings, seen through the glass from above (from inside you see the real sky)
        const back=(k,u,v,ry,nx,nz,len)=>{ const m=skyGlass(k,nx,nz,-nz,nx); m.clippingPlanes=cp(k); const me=part(new THREE.PlaneGeometry(len,HW+8),m,u,HW/2-4,v,ry,apt,false); me.renderOrder=-2; R.outs[k].push(me); R.backs.push(me); };
        back('Wf',Lx/2,-TH-1.8,0,0,-1,Lx+2*TH); back('Wb',Lx/2,Ly+TH+1.8,Math.PI,0,1,Lx+2*TH); back('Ww',-TH-1.8,Ly/2,Math.PI/2,-1,0,Ly+2*TH); }
      // a sunbeam through each front window, seen in the air only where it is
      R.beams=[]; for(const c of fw){ const a=W(c-WW/2,wz[1],0), b=W(c+WW/2,wz[1],0), cc=W(c+WW/2,wz[0],0), d=W(c-WW/2,wz[0],0), dir=W(c+1.0,0,3.4).sub(W(c-.9,3.2,-2.85)).normalize(), L=3.6*M, e=[a,b,cc,d].map(p=>p.clone().addScaledVector(dir,L));
        const pos=[], uv=[]; const quad=(p,q,r,s,t0,t1)=>{ pos.push(...p.toArray(),...q.toArray(),...r.toArray(),...p.toArray(),...r.toArray(),...s.toArray()); uv.push(t0,0,t0,1,t1,1,t0,0,t1,1,t1,0); };
        quad(a,e[0],e[1],b,0,0); quad(d,e[3],e[2],cc,0,0); quad(a,e[0],e[3],d,1,1); quad(b,e[1],e[2],cc,1,1);
        const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); bg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
        const bm=new THREE.ShaderMaterial({uniforms:{uOp:{value:0},uC:{value:new THREE.Color(1,.84,.6)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
          vertexShader:'varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
          fragmentShader:'uniform float uOp; uniform vec3 uC; varying vec2 vU; void main(){ float a=uOp*(1.-vU.y)*smoothstep(0.,.2,vU.y); gl_FragColor=vec4(uC*a,a); }'});
        const beam=new THREE.Mesh(bg,bm); beam.renderOrder=7; beam.frustumCulled=false; scene.add(beam); R.beams.push(bm); }

      const kind=(k,o)=>{ R.kinds[k]={kind:k,name:o.name,loose:false,m:0,wire:o.wire||null,sol:[],shf:[],tpl:o.tpl,mount:o.mount,cat:o.cat}; };   // a kind with no piece in the room yet (the light fittings), only to add
      const ctx={apt,R,M,W,part,thing,mat,rbox,col,tex,rnd,cl,V3,Lx,Ly,HW,fw,du,WW,wz,clip,glowTex,solid,shelf,cap,cur,hit,unitBox,kind};
      for(const f of ROOMK.parts)f(ctx);
      R.kfloorK='room';
      /* ---------- real bodies, and what a double click does ---------- */
      for(const [g,name,m,seat,wire] of R.loose)looseUnit(g,name,m,seat,wire);
      for(const un of R.units)blobFor(un);
      for(const un of R.units)if(un.loose)body(un);
      for(const un of R.units)wireUp(un);

      /* ---------- what the room editor works with: where each piece stands, putting it away and back, a new one from a kind, the walls, the floor, the lights ---------- */
      const toApt=(x,y,z)=>({u:(x-X(A.x0))/M,h:(y-fy)/M,v:(z-Z(A.y0))/M});
      const getT=un=>{ const o=un.obj; if(!un.loose)return {u:o.position.x,h:o.position.y,v:o.position.z,ry:o.rotation.y,s:o.scale.x};
        const p=toApt(o.position.x,o.position.y,o.position.z), e=new THREE.Euler().setFromQuaternion(o.quaternion,'YXZ'); return {...p,ry:e.y,s:o.scale.x/M}; };
      // a wall fitting goes onto the nearest wall, facing into the room, and is cut away with that wall
      const clipUnit=(un,k)=>{ if(un.st.clipK===k)return; un.st.clipK=k; const cm=un.st.cm||(un.st.cm=new Map()); un.obj.traverse(o=>{ if(!o.isMesh||!o.material||o.userData.hit)return; if(!cm.has(o)){ o.material=o.material.clone(); cm.set(o,1); } o.material.clippingPlanes=k?[APTS.WPL[k]]:null; o.material.needsUpdate=true; }); };
      const snapWall=(un,t)=>{ const d=[[t.u,'Ww',0,null,Math.PI/2],[Lx-t.u,'We',Lx,null,-Math.PI/2],[t.v,'Wf',null,0,0],[Ly-t.v,'Wb',null,Ly,Math.PI]].sort((a,b)=>a[0]-b[0])[0];
        if(d[2]!=null)t.u=d[2]?d[2]-.01:.01; if(d[3]!=null)t.v=d[3]?d[3]-.01:.01; t.ry=d[4]; clipUnit(un,d[1]); return t; };
      const setT=(un,t)=>{ const o=un.obj, s=cl(t.s||1,.3,3); if(un.mount==='wall')snapWall(un,t); if(!un.loose){ o.position.set(t.u,t.h,t.v); o.rotation.set(0,t.ry||0,0); o.scale.setScalar(s); place(un); }
        else { o.position.copy(W(t.u,t.h,t.v)); o.rotation.set(0,t.ry||0,0); o.scale.setScalar(M*s); o.updateMatrixWorld(true); body(un); } if(window.GOODSHIT)GOODSHIT(0,4); };
      const thingsOn=(un,on)=>{ for(const t of un.th){ const i=UI.things.indexOf(t); if(on&&i<0)UI.things.push(t); if(!on&&i>=0)UI.things.splice(i,1); } };
      const remove=un=>{ un.gone=true; un.obj.visible=false; thingsOn(un,false); body(un); place(un); R.LL=null; };
      const restore=un=>{ un.gone=false; un.obj.visible=true; thingsOn(un,true); body(un); place(un); R.LL=null; };
      const spawn=(kind,t,id)=>{ const K=R.kinds[kind]; if(!K)return null; const o=K.tpl.clone(true); (K.loose?scene:apt).add(o);
        const un={id:id||('add-'+(++R.addN)),name:K.name,kind,obj:o,loose:K.loose,m:K.m,sol:K.sol,shf:K.shf,h:[],th:[],wire:K.wire,st:{},added:true,mount:K.mount,cat:K.cat}; R.units.push(un); setT(un,t); blobFor(un); wireUp(un); R.LL=null; un.obj.traverse(o=>{ if(o.isLight&&o.userData.i0!=null)paint(o); }); return un; };
      const drop=un=>{ remove(un); un.obj.removeFromParent(); const i=R.units.indexOf(un); if(i>=0)R.units.splice(i,1); };
      const wall=k=>{ const D=WALLS[k]; if(!D)return; if(D.gen&&!D.t)D.t=D.gen(); for(const m of R.wallMats){ m.map=D.t||R.plaster; m.color.set(D.t?0xffffff:col(D.c)); m.needsUpdate=true; } R.wall=k; };
      const floor=k=>{ const D=FLOORS[k]; if(!D)return; if(!D.t)D.t=D.gen(Lx,Ly); R.floorMat.map=D.t; R.floorMat.needsUpdate=true; R.floor=k; };
      const kz=()=>R.kzone||[0,0,1,1], kfloor=k=>{ const D=KFLOORS[k]; if(!D||!R.kfloor)return; R.kfloorK=k; const on=k!=='room'; for(const o of R.kfloor)o.visible=on; if(!on)return;
        if(!D.t){ const z=kz(); D.t=D.gen(z[2]-z[0],z[3]-z[1]); } R.kfloorMat.map=D.t; R.kfloorMat.needsUpdate=true; };
      // a little picture of a paint, paper or floor for the editor's swatches (painted the first time it is asked for)
      const thumb=(set,k)=>{ const D={wall:WALLS,floor:FLOORS,kfloor:KFLOORS}[set][k]; if(!D||!D.gen)return null; if(!D.t){ const z=kz(); D.t=set==='wall'?D.gen():set==='floor'?D.gen(Lx,Ly):D.gen(z[2]-z[0],z[3]-z[1]); }
        if(!D.thumb){ const c=document.createElement('canvas'); c.width=c.height=48; const g=c.getContext('2d'), im=D.t.image; if(im.width>=300){ g.drawImage(im,0,0,160,160,0,0,48,48); } else { const k=24/Math.max(im.width,im.height), p=g.createPattern(im,'repeat'); g.scale(k,k); g.fillStyle=p; g.fillRect(0,0,48/k,48/k); } D.thumb=c.toDataURL(); } return D.thumb; };
      const lightsAll=()=>{ if(R.LL)return R.LL; const out=R.ceil.slice(); for(const un of R.units){ if(un.gone)continue; let n=0; un.obj.traverse(o=>{ if((o.isPointLight||o.isSpotLight)&&!o.userData.flame)out.push({id:un.id+(n++?'.'+n:''),name:un.name,L:o,un}); }); } return R.LL=out; };
      // a light's settings (the room editor): on, brightness, tone (kelvin), a colour and how much of it (tint), all round or a beam, the beam's aim, width and softness, how far it reaches
      const kelvin=K=>{ const t=K/100; let r,g,b; if(t<=66){ r=255; g=99.47*Math.log(t)-161.12; b=t<=19?0:138.52*Math.log(t-10)-305.04; } else { r=329.7*Math.pow(t-60,-.1332); g=288.12*Math.pow(t-60,-.0755); b=255; } const c=v=>cl(v,0,255)/255; return new THREE.Color().setRGB(c(r),c(g),c(b),THREE.SRGBColorSpace); };
      const paint=L=>{ const u=L.userData; if(u.c0==null)u.c0=L.color.getHex(); if(u.d0==null)u.d0=L.distance; if(u.type0==null)u.type0=L.isSpotLight?'spot':'point'; if(!u.def)u.def={yaw:u.yaw??null,pitch:u.pitch??null,angle:u.angle??null,soft:u.soft??null};
        if(u.tone==null&&!u.col)L.color.setHex(u.c0); else { const b=u.tone!=null?kelvin(u.tone):new THREE.Color(u.c0); if(u.col)b.lerp(new THREE.Color(u.col),u.tint??1); L.color.copy(b); }
        L.distance=u.d0*(u.reach??1);
        if(L.isSpotLight){ L.angle=cl(u.angle??40,5,85)*Math.PI/180; L.penumbra=cl(u.soft??.5,0,1); const y=(u.yaw??0)*Math.PI/180, pt=(u.pitch??90)*Math.PI/180; L.target.position.set(L.position.x+Math.cos(pt)*Math.sin(y),L.position.y-Math.sin(pt),L.position.z+Math.cos(pt)*Math.cos(y)); } };
      const retype=(e,type)=>{ const L=e.L, u=L.userData; if((type==='spot')===!!L.isSpotLight)return; const N=type==='spot'?new THREE.SpotLight(L.color,L.intensity,L.distance,.7,.5,L.decay):new THREE.PointLight(L.color,L.intensity,L.distance,L.decay);
        N.position.copy(L.position); N.userData=u; const par=L.parent; par.add(N); if(N.isSpotLight)par.add(N.target); if(L.isSpotLight)L.target.removeFromParent(); L.removeFromParent();
        if(u.lp)u.lp.L=N; if(e.un)e.un.st.L=N; e.L=N; const i=R.lights.indexOf(L); if(i>=0)R.lights[i]=N; R.LL=null; };
      const LKEYS=['tone','col','tint','type','yaw','pitch','angle','soft','reach'];
      const lightGet=id=>{ const e=lightsAll().find(q=>q.id===id); if(!e)return null; const u=e.L.userData; paint(e.L); return {on:u.lp?u.lp.on:u.on!==false,k:u.k??1,tone:u.tone??null,col:u.col||null,tint:u.tint??null,type:e.L.isSpotLight?'spot':'point',type0:u.type0,yaw:u.yaw??0,pitch:u.pitch??90,angle:u.angle??40,soft:u.soft??.5,reach:u.reach??1}; };
      const light=(id,o)=>{ let e=lightsAll().find(q=>q.id===id); if(!e)return; if(o.type){ retype(e,o.type); e=lightsAll().find(q=>q.id===id)||e; } const u=e.L.userData;
        if(o.k!=null)u.k=cl(o.k,0,3); for(const k of LKEYS)if(k!=='type'&&o[k]!==undefined)u[k]=o[k]; if(o.c!==undefined){ u.col=o.c; if(o.c&&u.tint==null)u.tint=1; }
        if(o.on!=null){ if(u.lp){ u.lp.on=o.on; if(u.lp.th)u.lp.th.name='LAMP: '+(o.on?'ON':'OFF'); } else u.on=o.on; } paint(e.L); };
      const lightReset=id=>{ let e=lightsAll().find(q=>q.id===id); if(!e)return; const u=e.L.userData; paint(e.L); light(id,{type:u.type0}); e=lightsAll().find(q=>q.id===id)||e;
        Object.assign(u,{k:1,tone:null,col:null,tint:null,reach:null},u.def); light(id,{on:true}); e.L.color.setHex(u.c0); paint(e.L); };
      const lift=un=>{ const g=un.gone; un.gone=true; body(un); un.gone=g; };   // out of the physics while you carry it
      R.api={R,M,Lx,Ly,HW,units:()=>R.units,kinds:()=>R.kinds,getT,setT,remove,restore,spawn,drop,lift,toApt,W,unitBox,wall,floor,lightsAll,light,lightGet,lightReset,walls:WALLS,floors:FLOORS,kfloors:KFLOORS,kfloor,thumb,glow:k=>{ R.glowK=cl(k,0,3); }};
      if(R.kfloor)kfloor('oak'); ROOMK.api=R.api; for(const f of ROOMK.built)f(R.api);
      window.BEDROOMDBG=()=>({built:!!R,Lx,Ly,fw,du,HW,loose:R?R.th.length:0,units:R?R.units.length:0,walls:Object.values(APTS.WPL||{}).map(p=>+p.constant.toFixed(2)),sky:!skyOff.on,lamps:R?R.lamps.map(l=>l.on):[]}); };

    // gone with the apartment: the loose things leave the physics, the ones you added leave the scene
    const clear=Q=>{ if(!Q)return; if(GPH.drop)for(const it of Q.th)GPH.drop(it); for(const un of Q.units||[]){ for(const t of un.th){ const i=UI.things.indexOf(t); if(i>=0)UI.things.splice(i,1); } if(un.loose)un.obj.removeFromParent(); } };
    APTS.furnish(APTS.my,()=>{ clear(R); R=null; ROOMK.api=null; build(); });

    /* ---------- each frame: the lamps glow (brighter as the day goes), the room's lights at their brightness, the pieces that move (fridge doors, flames), the sun's beams follow the hour, the sky is only in the windows in the isometric view ---------- */
    let prevShadow=null; const TV3=new THREE.Vector3();
    SYS.add('places',dt=>{ const inn=!!APTS.inReal;
      if(inn&&prevShadow==null&&renderer.shadowMap.type!==THREE.PCFSoftShadowMap){ prevShadow=renderer.shadowMap.type; renderer.shadowMap.type=THREE.PCFSoftShadowMap; scene.traverse(o=>{ if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true; }); }
      else if(!inn&&prevShadow!=null){ renderer.shadowMap.type=prevShadow; prevShadow=null; scene.traverse(o=>{ if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true; }); }
      if(!R)return; if(!R.apt.parent){ clear(R); R=null; ROOMK.api=null; return; }
      const k=Math.min(1,(dt||0)*5), e=CLOCK.elev(), day=cl((e+3)/12,0,1);
      for(const L of R.lamps){ const t=L.on?L.i0*(L.L.userData.k??1)*(1.2-.4*day):0; L.L.intensity+=(t-L.L.intensity)*k; L.sm.emissiveIntensity=L.on?.55:.03; if(L.halo)L.halo.material.opacity=L.on?.32:0; }
      for(const q of R.api.lightsAll()){ const u=q.L.userData; if(!u.lamp)q.L.intensity=(u.on===false?0:1)*(u.i0??0)*(u.k??1); }
      for(const un of R.units)if(un.tick&&!un.gone)un.tick(dt||0);
      for(const L of R.winL)L.intensity=inn?18*day:0; const sunK=cl((e-2)/10,0,1); for(const L of R.winL)L.color.setRGB(1,.86+.1*sunK,.72+.26*sunK);   // the daylight at the glass: warm when the sun is low, none at night
      // outside: hidden on a side whose wall is cut away; in the isometric view kept between the floor and the far walls' top edge as the camera sees it, so it shows only through the glass
      { const isoV=!UI.persp&&SHARED.pitch<1.45, d=TV3; SHARED.cam.getWorldDirection(d); const hz=Math.max(.01,Math.hypot(d.x,d.z)), tA=Math.max(.2,-d.y/hz);   // a ray over the wall's top falls tA a metre, and crosses the 2 m beyond the wall in 2/cos(its angle to the wall) metres
        for(const k in R.tops){ const c=Math.max(.2,Math.abs(k==='Ww'?d.x:d.z)/hz); R.tops[k].constant=isoV?R.fy+(R.api.HW-2.1/c*tA-.05)*R.M:1e6; } R.bot.constant=isoV?-(R.fy-.05*R.M):1e6;
        for(const k in R.outs){ const on=APTS.WPL[k].constant>1e5; for(const o of R.outs[k])o.visible=on&&(!R.backs.includes(o)||isoV); } }
      for(const b of R.beams)b.uniforms.uOp.value=inn?.16*day:0;
      const iso=!UI.persp&&SHARED.pitch<1.45; ISO.value=iso?1:0;
      const D=SKY.dome&&SKY.dome.material; if(D){ const off=inn&&iso; if(off!==skyOff.on){ skyOff.on=off; D.visible=!off; } } blackOut(); }, '150a-bedroom'); } }
export {ROOMK};
