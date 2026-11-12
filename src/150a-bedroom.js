// THE APARTMENT ROOM: your apartment as one open room (25 Oct 2026), its shell as the owner's isometric apartment picture (26 Oct 2026): warm beige walls plain to their light grey tops, warm brown boards, the side wall's three windows onto the live sky, the back wall blank (your front door opens on the hall, 150n), a cool moonlight through them by night, the house below and the sky round it; its pieces are each a unit you move (the bedroom 150b).
import {SHARED, THREE} from './003-shx.js';
import {AMB, CLOCK, GPH, SFX, SHAD, SKY, UI, USE} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {MODS, SYS} from './006-map-pre.js';
import {PEEK} from './008-batch.js';
const ROOMK={parts:[],wires:{},built:[],api:null,keep:[],always:new Set(),save:()=>false,guest:()=>false};   // the room's other parts (the bedroom 150b) add their builders and what their pieces do (wires); the room editor (150d) hears when it is built and works through api; always: the kinds every apartment has from the start, never emptied out
{ const APTS=MODS.apts;
  if(APTS&&APTS.R){ const V3=THREE.Vector3, cl=(v,a,b)=>Math.max(a,Math.min(b,v)), MPU=.907;   // the apartment's art unit is .907 m: the picture's sizes are metres
    const col=c=>new THREE.Color('rgb('+c.join(',')+')');
    const mat=(c,o={})=>{ const {roughness,metalness,...r}=o; return new THREE.MeshLambertMaterial({color:col(c),...r}); };   // the game's cel shading: flat steps of light, no smooth gradients (owner, 25 Oct 2026)
    // a rounded box (metres, centred), its corners and edges smooth
    const rbox=(w,h,d,r=.015,s=4)=>{ '@later'; r=Math.min(r,w/2-1e-4,h/2-1e-4,d/2-1e-4); const g=new THREE.BoxGeometry(w,h,d,s,s,s), p=g.attributes.position, n=g.attributes.normal, hx=w/2-r, hy=h/2-r, hz=d/2-r, v=new V3(), q=new V3();
      for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); q.set(cl(v.x,-hx,hx),cl(v.y,-hy,hy),cl(v.z,-hz,hz)); v.sub(q); const l=v.length()||1; v.multiplyScalar(1/l); n.setXYZ(i,v.x,v.y,v.z); p.setXYZ(i,q.x+v.x*r,q.y+v.y*r,q.z+v.z*r); }
      p.needsUpdate=true; n.needsUpdate=true; return g; };
    const tex=(w,h,draw,rep)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; } return t; };
    const rnd=(()=>{ let s=91; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; })();

    /* ---------- the textures, painted once ---------- */
    // wide orange planks, staggered, with dark gaps between them, as the picture's floor
    const planks=(Lu,Lv,B0=[198,116,56],soft)=>tex(1536,1536,(g,W,H)=>{ const Q=W/640; g.save(); g.scale(Q,Q); W=H=640; const pw=soft?.18:.22, rows=Math.ceil(Lv/pw), ph=H/rows; g.fillStyle=soft?'#4c3022':'#160a03'; g.fillRect(0,0,W,H);
      for(let r=0;r<rows;r++){ let u=-(r%3)*.7-rnd()*.3; while(u<Lu){ const L=1.4+rnd()*1.2, k=.84+rnd()*.24, x0=u/Lu*W, x1=(u+L)/Lu*W, y0=r*ph, b=1.4, pw2=x1-x0-3;
          g.fillStyle=`rgb(${B0[0]*k|0},${B0[1]*k|0},${B0[2]*k|0})`; g.fillRect(x0+1.5,y0+1.5,pw2,ph-3);
          for(let i=0;i<16;i++){ g.strokeStyle=`rgba(${B0[0]*.6|0},${B0[1]*.5|0},${B0[2]*.4|0},${.05+rnd()*.1})`; g.lineWidth=.25+rnd()*.7; g.beginPath(); const yy=y0+3+rnd()*(ph-6); g.moveTo(x0+2,yy); g.bezierCurveTo(x0+(x1-x0)*.35,yy+(rnd()-.5)*ph*.3,x0+(x1-x0)*.65,yy+(rnd()-.5)*ph*.3,x1-2,yy); g.stroke(); }
          g.fillStyle='rgba(60,24,8,.06)'; g.fillRect(x0+1.5,y0+1.5,pw2,ph-3);
          if(rnd()<.35){ const kx=x0+4+rnd()*(pw2-8), ky=y0+3+rnd()*(ph-6); for(let r2=3;r2>0;r2--){ g.fillStyle=`rgba(${B0[0]*.35|0},${B0[1]*.25|0},${B0[2]*.2|0},${.12+.1*(3-r2)})`; g.beginPath(); g.ellipse(kx,ky,r2*1.6,r2*.7,0,0,7); g.fill(); } }   // a knot
          for(let i=0;i<40;i++){ g.fillStyle=rnd()<.5?'rgba(0,0,0,.08)':'rgba(255,240,220,.06)'; g.fillRect(x0+2+rnd()*(pw2-2),y0+2+rnd()*(ph-4),.6,.6); }   // the varnish's wear
          g.fillStyle=`rgba(255,224,180,${soft?.1:.34})`; g.fillRect(x0+1.5,y0+1.5,pw2,b); g.fillRect(x0+1.5,y0+1.5,b,ph-3);   // grout depth: each plank a raised lip, lit top/left
          g.fillStyle=`rgba(12,5,1,${soft?.22:.55})`; g.fillRect(x0+1.5,y0+ph-1.5-b,pw2,b); g.fillRect(x1-1.5-b,y0+1.5,b,ph-3); u+=L; } } g.restore(); });   // ...shadowed bottom/right, so the gaps read recessed
    const checker=()=>tex(256,256,(g,W,H)=>{ const n=10, s=W/n; for(let i=0;i<n;i++)for(let j=0;j<n;j++){ g.fillStyle=(i+j)&1?'#e4e2d6':'#2c3430'; g.fillRect(i*s,j*s,s,s); } });
    const glowTex=tex(64,64,(g,W,H)=>{ for(const [r,c] of [[30,'rgba(255,180,100,.18)'],[21,'rgba(255,196,120,.32)'],[12,'rgba(255,214,150,.7)']]){ g.fillStyle=c; g.beginPath(); g.arc(32,32,r,0,7); g.fill(); } });
    // the walls and floors you can choose (the room editor): a paint, or a paper painted once and repeated by the metre
    const rep_=(t,w,h)=>{ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1/w,1/h); return t; };
    const WALLS={beige:{n:'BEIGE',c:[222,208,186]},cream:{n:'CREAM',c:[238,228,198]},white:{n:'WHITE',c:[242,240,234]},sage:{n:'SAGE',c:[176,196,166]},blush:{n:'BLUSH',c:[230,190,180]},sky:{n:'SKY',c:[180,204,226]},butter:{n:'BUTTER',c:[242,224,168]},charcoal:{n:'CHARCOAL',c:[78,78,84]},
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
    const FLOORS={warm:{n:'WARM WOOD',c:[134,88,60],gen:(Lx,Ly)=>planks(Lx,Ly,[134,88,60],true)},planks:{n:'ORANGE PLANKS',c:[198,116,56],gen:(Lx,Ly)=>planks(Lx,Ly)},oak:{n:'LIGHT OAK',c:[214,172,124],gen:(Lx,Ly)=>planks(Lx,Ly,[214,172,124])},walnut:{n:'WALNUT',c:[118,72,42],gen:(Lx,Ly)=>planks(Lx,Ly,[118,72,42])},grey:{n:'GREY WASH',c:[176,166,154],gen:(Lx,Ly)=>planks(Lx,Ly,[176,166,154])},
      checker:{n:'CHECKER TILE',c:[60,60,60],gen:tiled(128,.6,(g,w)=>{ for(let i=0;i<2;i++)for(let j=0;j<2;j++){ g.fillStyle=(i+j)&1?'#2a2a2e':'#ece8de'; g.fillRect(i*64,j*64,64,64); } g.strokeStyle='rgba(120,110,100,.5)'; g.lineWidth=2; g.strokeRect(0,0,w,w); g.beginPath(); g.moveTo(64,0); g.lineTo(64,128); g.moveTo(0,64); g.lineTo(128,64); g.stroke(); })},
      terracotta:{n:'TERRACOTTA',c:[196,110,72],gen:tiled(128,.6,(g,w)=>{ g.fillStyle='#d8c8b4'; g.fillRect(0,0,w,w); for(let i=0;i<2;i++)for(let j=0;j<2;j++){ const k=.88+rnd()*.2; g.fillStyle=`rgb(${200*k|0},${112*k|0},${72*k|0})`; g.fillRect(i*64+2,j*64+2,60,60); } })},
      carpet:{n:'CARPET',c:[196,170,150],gen:tiled(128,1,(g,w)=>{ g.fillStyle='#c4aa96'; g.fillRect(0,0,w,w); for(let i=0;i<2400;i++){ g.fillStyle=`rgba(${rnd()<.5?90:255},${rnd()<.5?70:240},${rnd()<.5?60:220},.08)`; g.fillRect(rnd()*w,rnd()*w,2,2); } })},
      concrete:{n:'CONCRETE',c:[150,150,148],gen:tiled(128,1.5,(g,w)=>{ g.fillStyle='#9a9894'; g.fillRect(0,0,w,w); for(let i=0;i<900;i++){ g.fillStyle=`rgba(${rnd()<.5?60:220},${rnd()<.5?60:220},${rnd()<.5?60:220},.06)`; g.fillRect(rnd()*w,rnd()*w,3,3); } })},
      chevron:{n:'CHEVRON',c:[170,112,64],gen:(Lx,Ly)=>tex(1024,1024,(g,W,H)=>{ const sx=W/Lx, sy=H/Ly, cw=.24, pw=.1; g.fillStyle='#2a160a'; g.fillRect(0,0,W,H);
        for(let j=0;j*cw<Lx;j++){ const d=j&1?1:-1, x0=j*cw*sx, x1=(j+1)*cw*sx; for(let y=-cw;y<Ly+cw;y+=pw){ const k=.84+rnd()*.26, y0=y*sy, dy=d*cw*sy;
          g.fillStyle=`rgb(${196*k|0},${134*k|0},${78*k|0})`; g.beginPath(); g.moveTo(x0+1,y0+1); g.lineTo(x1-1,y0+dy+1); g.lineTo(x1-1,y0+dy+pw*sy-1); g.lineTo(x0+1,y0+pw*sy-1); g.closePath(); g.fill(); } } })},
      parquet:{n:'PARQUET',c:[186,130,78],gen:tiled(128,.48,(g,w)=>{ '@later'; g.fillStyle='#3a2210'; g.fillRect(0,0,w,w); for(let i=0;i<2;i++)for(let j=0;j<2;j++)for(let k=0;k<3;k++){ const f=.86+rnd()*.24; g.fillStyle=`rgb(${190*f|0},${132*f|0},${78*f|0})`;
        if((i+j)&1)g.fillRect(i*64+k*21.3+1,j*64+1,19.3,62); else g.fillRect(i*64+1,j*64+k*21.3+1,62,19.3); } })},
      marble:{n:'MARBLE',c:[226,224,220],gen:tiled(256,1.2,(g,w)=>{ '@later'; g.fillStyle='#e8e6e0'; g.fillRect(0,0,w,w); for(let i=0;i<14;i++){ g.strokeStyle=`rgba(${120+rnd()*40|0},${120+rnd()*40|0},${130+rnd()*40|0},${.15+rnd()*.25})`; g.lineWidth=.6+rnd()*1.6; g.beginPath(); let x=rnd()*w, y=rnd()*w; g.moveTo(x,y); for(let k=0;k<4;k++){ x+=(rnd()-.3)*90; y+=(rnd()-.5)*60; g.quadraticCurveTo(x-20,y+20,x,y); } g.stroke(); }
        g.strokeStyle='rgba(150,146,140,.6)'; g.lineWidth=2; g.strokeRect(0,0,w,w); g.beginPath(); g.moveTo(128,0); g.lineTo(128,256); g.moveTo(0,128); g.lineTo(256,128); g.stroke(); })},
      slate:{n:'SLATE',c:[70,74,80],gen:tiled(128,.8,(g,w)=>{ '@later'; g.fillStyle='#2a2c30'; g.fillRect(0,0,w,w); for(let i=0;i<2;i++)for(let j=0;j<2;j++){ const f=.8+rnd()*.35; g.fillStyle=`rgb(${74*f|0},${78*f|0},${86*f|0})`; g.fillRect(i*64+2,j*64+2,60,60);
        for(let k=0;k<60;k++){ g.fillStyle=`rgba(${rnd()<.5?20:200},${rnd()<.5?20:200},${rnd()<.5?30:210},.07)`; g.fillRect(i*64+2+rnd()*58,j*64+2+rnd()*58,4,2); } } })},
      hex:{n:'HEX TILE',c:[232,230,224],gen:(Lx,Ly)=>hexTex('#ecebe6','#b8b4ac',.3,Lx,Ly)}};
    // the hexagon tiles' picture: one period of flat-topped hexagons, repeated (a row of three widths by one height)
    function hexTex(fill,grout,r,Lx,Ly){ '@later'; const R=24, w=R*3, h=Math.round(R*Math.sqrt(3)); const t=tex(w,h,(g)=>{ g.fillStyle=grout; g.fillRect(0,0,w,h);
        const hexA=(cx,cy)=>{ g.beginPath(); for(let k=0;k<6;k++){ const a=k*Math.PI/3; g.lineTo(cx+(R-1.5)*Math.cos(a),cy+(R-1.5)*Math.sin(a)); } g.closePath(); const f=.92+rnd()*.12; g.fillStyle=fill; g.globalAlpha=f; g.fill(); g.globalAlpha=1; };
        for(const [cx,cy] of [[0,0],[w,0],[0,h],[w,h],[R*1.5,h/2],[R*1.5+w,h/2],[R*1.5-w,h/2],[w/2+R*1.5- w/2,h/2]])hexA(cx,cy); }); return rep_(t,r*3/Lx,r*Math.sqrt(3)/Ly); }
    // the kitchen's own floor (its corner of the room): five, or the room's
    const KFLOORS={oak:{n:'LIGHT OAK',c:[214,172,124],gen:(w,h)=>planks(w,h,[214,172,124])},diner:{n:'DINER CHECKER',c:[40,40,44],gen:tiled(128,.5,(g,w)=>{ for(let i=0;i<2;i++)for(let j=0;j<2;j++){ g.fillStyle=(i+j)&1?'#222226':'#f2eee4'; g.fillRect(i*64,j*64,64,64); } })},
      terracotta:{n:'TERRACOTTA HEX',c:[196,108,70],gen:(w,h)=>hexTex('#c46c46','#d8c8b2',.22,w,h)},
      cement:{n:'CEMENT TILE',c:[90,130,170],gen:tiled(128,.4,(g,w)=>{ '@later'; g.fillStyle='#ece6d8'; g.fillRect(0,0,w,w); g.fillStyle='#4e7ea6'; for(const [x,y] of [[0,0],[128,0],[0,128],[128,128]]){ g.beginPath(); g.arc(x,y,44,0,7); g.fill(); }
        g.fillStyle='#ece6d8'; for(const [x,y] of [[0,0],[128,0],[0,128],[128,128]]){ g.beginPath(); g.arc(x,y,28,0,7); g.fill(); } g.fillStyle='#c98a4a'; g.beginPath(); g.arc(64,64,14,0,7); g.fill(); g.strokeStyle='#4e7ea6'; g.lineWidth=4; g.beginPath(); g.moveTo(64,30); g.lineTo(98,64); g.lineTo(64,98); g.lineTo(30,64); g.closePath(); g.stroke(); g.strokeStyle='rgba(120,110,100,.5)'; g.lineWidth=2; g.strokeRect(0,0,w,w); })},
      ceramic:{n:'WHITE CERAMIC',c:[238,238,234],gen:tiled(128,.9,(g,w)=>{ g.fillStyle='#c6c2ba'; g.fillRect(0,0,w,w); for(let i=0;i<2;i++)for(let j=0;j<2;j++){ const f=.96+rnd()*.05; g.fillStyle=`rgb(${242*f|0},${242*f|0},${238*f|0})`; g.fillRect(i*64+1.5,j*64+1.5,61,61); } })},
      room:{n:'SAME AS ROOM',c:[120,100,80]}};
    const ISO={value:0};

    let R=null;   // the built room: its meshes, lights and loose things
    const build=()=>{ '@apts'; const X=SHARED.BOD.X, Z=SHARED.BOD.Z, Yr=SHARED.BOD.Y, A=APTS.R, WI=APTS.WIN, WPL=APTS.WPL, M=(X(A.x0+1)-X(A.x0))/MPU, fy=Yr(APTS.RB+.15)+.012, HW=(Yr(APTS.S||130)-Yr(0))/M*(APTS.HK||1);
      const px=z=>z/32.4, Lx=(A.x1-A.x0)*MPU, Ly=(A.y1-A.y0)*MPU, TH=.24, W=(u,h,v)=>new V3(X(A.x0)+u*M,fy+h*M,Z(A.y0)+v*M);
      const apt=new THREE.Group(); apt.position.set(X(A.x0),fy,Z(A.y0)); apt.scale.setScalar(M); scene.add(apt);
      R={apt,M,fy,doors:{},loose:[],lights:[],lamps:[],th:[],units:[],kinds:{},wins:[],winTh:[],ceil:[],wallMats:[],floorMat:null,wall:'beige',walls:{},floor:'warm',floor2:null,glowK:1,addN:0};
      let CUR=null; const cur=()=>CUR?CUR.obj:apt;   // the unit being built (a piece you can move), or the room itself
      const part=(geo,m,u,h,v,ry=0,par=cur(),cast=true)=>{ const me=new THREE.Mesh(geo,m); me.position.set(u,h,v); me.rotation.y=ry; me.castShadow=cast; me.receiveShadow=true; par.add(me); return me; };
      const thing=(u,h,v,ry=0)=>{ const g=new THREE.Group(); g.position.copy(W(u,h,v)); g.rotation.y=ry; g.scale.setScalar(M); scene.add(g); return g; };
      const clip=k=>k?{clippingPlanes:[WPL[k]],userData:{wk:k}}:{};
      // what loose things stand on: a solid up to a top (metres over the floor), a shelf between two heights; the top a hair under the surface, or the physics leaves it out
      const solidNow=(u0,v0,u1,v1,t)=>APTS.solid(A.x0+u0/MPU,A.y0+v0/MPU,A.x0+u1/MPU,A.y0+v1/MPU,(fy+(t-.002)*M-Yr(APTS.RB))/(Yr(1)-Yr(0)));
      const shelfNow=(u0,v0,u1,v1,b,t)=>APTS.shelf&&APTS.shelf(A.x0+u0/MPU,A.y0+v0/MPU,A.x0+u1/MPU,A.y0+v1/MPU,fy+b*M,fy+(t-.002)*M);
      const solidUp=(u0,v0,u1,v1,b,t)=>APTS.solidHi(A.x0+u0/MPU,A.y0+v0/MPU,A.x0+u1/MPU,A.y0+v1/MPU,fy+b*M,fy+(t-.002)*M);   // on an upper floor (the loft's): solid only while you are up there
      const solid=(u0,v0,u1,v1,t)=>CUR?CUR.sol.push([u0,v0,u1,v1,t]):solidNow(u0,v0,u1,v1,t);   // inside a unit: kept with it, placed wherever it stands
      const shelf=(u0,v0,u1,v1,b,t)=>CUR?CUR.shf.push([u0,v0,u1,v1,b,t]):shelfNow(u0,v0,u1,v1,b,t);
      const FRAME=[16,16,18], CREAM=[222,208,186], TRIM=[66,36,20], WOODO=[184,104,50], WOODD=[96,54,30];

      /* ---------- the shell: one open room; cream walls, the dark crown and skirting, the glow strips, the planks on a cream slab ---------- */
      R.floorMat=mat([255,255,255],{map:FLOORS.warm.gen(Lx,Ly),roughness:.55}); FLOORS.warm.t=R.floorMat.map; R.floorMat.bumpMap=R.floorMat.map; R.floorMat.bumpScale=1.2; part(new THREE.PlaneGeometry(Lx,Ly).rotateX(-Math.PI/2),R.floorMat,Lx/2,0,Ly/2,0,apt,false);
      part(new THREE.BoxGeometry(Lx+2*TH,.3,Ly+2*TH),mat([176,182,182],{roughness:.9}),Lx/2,-.152,Ly/2,0,apt,false);   // the slab the room stands on, its edge seen against the dark
      const rect=(w,h,holes=[])=>{ const sh=new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(w,0),new THREE.Vector2(w,h),new THREE.Vector2(0,h)]); for(const [a0,a1,b0,b1] of holes)sh.holes.push(new THREE.Path([new THREE.Vector2(a0,b0),new THREE.Vector2(a1,b0),new THREE.Vector2(a1,b1),new THREE.Vector2(a0,b1)])); return sh; };
      const WW=2*WI.WHW*MPU, fw=WI.FWU.map(u=>u*MPU), du=WI.DU*MPU, wz=WI.WZ.map(z=>px(z-.15)), FD=[du-.64,du+.64,0,3.06], BD=[du-.665,du+.665,0,2.93], SWS=WI.SIDE.map(k=>[Ly*(1-k)-TH-.0054,wz[0],wz[1],WW,FRAME]);   // the side walls' windows where the house has them outside: centre, sill, head, width, frame
      const win=c=>[c-WW/2,c+WW/2,wz[0],wz[1]], MHu=APTS.MH||0, winU=c=>[c-WW/2,c+WW/2,wz[0]+MHu,wz[1]+MHu], SWU=MHu?SWS.map(w=>[w[0],w[1]+MHu,w[2]+MHu,w[3],w[4]]):[], SWL=MHu?SWS.filter(w=>w[0]>3.6):SWS, SWE=MHu?[]:SWS, fwU=MHu?fw.concat(fw.some(f=>Math.abs(f-du)<WW)?[]:[du]):[];   // in the loft (owner, 12 Nov 2026: "moev windows in logical places"): none behind the low end of the stair, none in the blank party wall, a third upstairs over the fire-escape door   // the loft's upper floor has the same windows over the lower ones (owner, 12 Nov 2026: "add windows to 2nd story, functional like other windows")
      // aged plaster: cream kept, but soft stains, faint streaks and fine grain so the walls aren't flat (owner: grittier, keep cozy)
      const wallTex=(()=>{ const t=tex(512,512,(g,W,H)=>{ g.fillStyle='#ffffff'; g.fillRect(0,0,W,H);
        for(let i=0;i<50;i++){ g.strokeStyle=`rgba(120,102,72,${.015+rnd()*.03})`; g.lineWidth=.8+rnd()*1.6; g.beginPath(); const x=rnd()*W, y0=rnd()*H*.4; g.moveTo(x,y0); g.lineTo(x+(rnd()-.5)*18,y0+H*(.3+rnd()*.5)); g.stroke(); }
        for(let i=0;i<900;i++){ const b=rnd()<.5; g.fillStyle=`rgba(${b?70:255},${b?60:244},${b?44:220},${.02+rnd()*.03})`; g.fillRect(rnd()*W,rnd()*H,1,1); } }); t.wrapS=t.wrapT=THREE.MirroredRepeatWrapping; t.repeat.set(.2,.5); return t; })();
      R.plaster=wallTex;
      const wallOf=(k,len,holes,u,v,ry)=>{ const wm=mat(CREAM,{roughness:.96,map:wallTex,bumpMap:wallTex,bumpScale:.8,side:THREE.DoubleSide,shadowSide:THREE.DoubleSide,...clip(k)}); R.wallMats.push(wm); return part(PEEK.mark(new THREE.ExtrudeGeometry(rect(len,HW,holes),{depth:TH,bevelEnabled:false})),[wm,mat([200,206,208],{roughness:.9,side:THREE.DoubleSide,...clip(k)})],u,0,v,ry,apt); };
      wallOf('Wf',Lx,[...fw.map(win),...fwU.map(winU),FD],0,-TH,0); wallOf('Wb',Lx,[BD],0,Ly,0);
      wallOf('Ww',Ly,SWL.concat(SWU).map(w=>[w[0]-w[3]/2,w[0]+w[3]/2,w[1],w[2]]),0,0,-Math.PI/2); wallOf('We',Ly,SWE.map(w=>[Ly-w[0]-w[3]/2,Ly-w[0]+w[3]/2,w[1],w[2]]),Lx,Ly,Math.PI/2);
      // the soft dark where the floor meets each wall (light doesn't reach into the corner)
      { const ao=tex(4,64,(g,W,H)=>{ const gr=g.createLinearGradient(0,0,0,H); gr.addColorStop(0,'rgba(0,0,0,1)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,W,H); });
        const am=new THREE.MeshBasicMaterial({color:0x000000,alphaMap:ao,transparent:true,opacity:.42,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
        for(const [len,x,z,ry] of [[Lx,Lx/2,0,0],[Lx,Lx/2,Ly,Math.PI],[Ly,0,Ly/2,Math.PI/2],[Ly,Lx,Ly/2,-Math.PI/2]]){ const me=new THREE.Mesh(new THREE.PlaneGeometry(len,.45).rotateX(-Math.PI/2).translate(0,0,.225),am); me.rotation.y=ry; me.position.set(x,.003,z); me.raycast=()=>{}; me.renderOrder=1; apt.add(me); } }
      // a slim dark skirting at the foot of every wall (no crown: the picture's walls are plain to the top)
      // each wall's own frame: x along it from its start, z into the room
      const run=[['Wf',Lx,0,0,0],['Wb',Lx,Lx,Ly,Math.PI],['Ww',Ly,0,Ly,Math.PI/2],['We',Ly,Lx,0,-Math.PI/2]];
      for(const [k,L,ox,oz,ry] of run){ const g=new THREE.Group(); apt.add(g); g.position.set(ox,0,oz); g.rotation.y=ry;
        const tm=mat(TRIM,{roughness:.5,...clip(k)});
        part(rbox(L,.08,.02,.004),tm,L/2,.04,.01,0,g); }
      // the sky through the glass: the live sky's own shader (sun, clouds) — seen straight out in the isometric view, along your eye in first person
      const skyGlass=(k,nx,nz,ax,az)=>{ const D=SKY.dome&&SKY.dome.material; if(!D||!D.fragmentShader)return mat([150,190,230],{roughness:.1,...clip(k)});
        return new THREE.ShaderMaterial({uniforms:Object.assign({},D.uniforms,{uN:{value:new V3(nx,.08,nz)},uA:{value:new V3(ax,0,az)},uIso:ISO}),defines:{...(D.defines||{})},clipping:true,...clip(k),
          vertexShader:'#include <clipping_planes_pars_vertex>\nuniform vec3 uN,uA; uniform float uIso; varying vec3 vD; void main(){ vec4 w=modelMatrix*vec4(position,1.); vec3 e=normalize(w.xyz-cameraPosition), s=normalize(uN+vec3(0.,(uv.y-.3)*.9,0.)+uA*(uv.x-.5)*.7); vD=normalize(mix(e,s,uIso)); vec4 mvPosition=viewMatrix*w; gl_Position=projectionMatrix*mvPosition;\n#include <clipping_planes_vertex>\n}',
          fragmentShader:'#include <clipping_planes_pars_fragment>\n'+D.fragmentShader.replace(/void main\(\)\s*\{/,'void main(){\n#include <clipping_planes_fragment>\n')}); };
      // clear glass: you see out of it, onto the fire escape and the sky beyond (only a faint sheen of its own)
      const glass=k=>APTS.glassMat(clip(k));
      // the picture's window: a thick orange frame of four panes and its sill
      const windowAt=(k,uc,v,ry,out,z0,z1,w,panes=[3,3],fc=FRAME)=>{ const g=new THREE.Group(); g.position.set(uc,0,v); g.rotation.y=ry; apt.add(g); const wm=mat(fc,{roughness:.55,...clip(k)});
        const sash=new THREE.Group(); g.add(sash);   // the glass and its bars: slides up into the wall when the window is opened
        part(new THREE.PlaneGeometry(w-.04,z1-z0-.04),glass(k),0,(z0+z1)/2,-.16,0,sash,false);
        for(const s of [-1,1])part(rbox(.05,z1-z0+.04,.16,.006),wm,s*(w/2-.005),(z0+z1)/2,-.06,0,g); part(rbox(w+.04,.05,.16,.006),wm,0,z1+.015,-.06,0,g);   // black steel: slim sections
        part(rbox(w+.16,.05,.2,.012),wm,0,z0-.01,-.04,0,g);
        for(let i=1;i<panes[0];i++)part(rbox(.022,z1-z0,.04,.004),wm,-w/2+w*i/panes[0],(z0+z1)/2,-.13,0,sash);
        for(let j=1;j<panes[1];j++)part(rbox(w,.022,.04,.004),wm,0,z0+(z1-z0)*j/panes[1],-.13,0,sash);
        // double-click it: it opens (the sash up half way) and a calm breeze comes in; again, it shuts
        const W_={g,sash,open:false,o:0,br:0,H:(z1-z0)*.5,k,w,z0,z1}; R.wins.push(W_);
        const hb=new THREE.Mesh(new THREE.BoxGeometry(w,z1-z0,.3),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(0,(z0+z1)/2,-.05); hb.userData.soft=hb.userData.keep=hb.userData.hit=1; g.add(hb);
        const th={name:'OPEN THE WINDOW',obj:hb,reach:1.6*M,near:2.6*M,tall:(z1-z0)*M,act:()=>{ W_.open=!W_.open; th.name=W_.open?'CLOSE THE WINDOW':'OPEN THE WINDOW'; if(SFX)SFX.play('latch',{vol:.5,vary:.2}); }};
        UI.thing(th); R.winTh.push(th); W_.th=th;
        return g; };
      // a door: a moulded casing on plinth blocks, a six-panel leaf (raised panels in bevelled frames) or a glazed one in black steel, three brass hinges, a lever on a rose, a threshold
      const doorAt=(k,uc,v,ry,out,o)=>{ const g=new THREE.Group(); g.position.set(uc,0,v); g.rotation.y=ry; apt.add(g); const wm=mat(WOODD,{roughness:.5,...clip(k)}), wl=mat([112,66,38],{...clip(k)}), wk=mat([78,44,24],{...clip(k)}), br=mat([196,156,84],{...clip(k)}), w=o[1]-o[0], h=o[3];
        for(const s of [-1,1]){ part(rbox(.11,h+.11,.035,.006),wm,s*(w/2+.055),(h+.11)/2,.017,0,g); part(rbox(.03,h+.11,.05,.006),wk,s*(w/2+.115),(h+.11)/2,.025,0,g); part(rbox(.15,.2,.05,.006),wk,s*(w/2+.06),.1,.025,0,g); }   // the casing, its back band, the plinth blocks
        part(rbox(w+.3,.11,.035,.006),wm,0,h+.055,.017,0,g); part(rbox(w+.38,.04,.06,.008),wk,0,h+.13,.03,0,g); part(rbox(w+.04,.012,.14,.004),wk,0,.006,-.06,0,g);   // the head, its cap, the threshold
        const hinge=new THREE.Group(); hinge.position.set(-w/2,0,-.08); g.add(hinge); const leaf=new THREE.Group(); leaf.position.set(w/2,0,0); hinge.add(leaf); R.doors[k]=hinge;
        for(const y of [.25,h/2,h-.25])part(rbox(.03,.11,.06,.004),br,-w/2+.005,y,0,0,leaf);   // the hinges
        if(out){ const sm=mat([20,20,22],{...clip(k)}), fw_=.06, ww=w-.02, hh=h-.02, b0=.42;   // glazed: a black steel frame of small panes over a steel kick panel, as the windows
          for(const s of [-1,1])part(rbox(fw_,hh,.05,.006),sm,s*(ww/2-fw_/2),h/2,0,0,leaf); part(rbox(ww,b0,.05,.008),sm,0,b0/2+.01,0,0,leaf); part(rbox(ww,fw_,.05,.008),sm,0,h-.01-fw_/2,0,0,leaf);
          const gw=ww-2*fw_, g0=b0+.01, g1=h-.01-fw_, gh=g1-g0; for(const t of [1/3,2/3])part(rbox(.022,gh,.045,.004),sm,-gw/2+gw*t,(g0+g1)/2,0,0,leaf); for(let r=1;r<5;r++)part(rbox(gw,.022,.045,.004),sm,0,g0+gh*r/5,0,0,leaf);
          part(new THREE.PlaneGeometry(gw,gh),glass(k),0,(g0+g1)/2,0,0,leaf,false); }
        else { part(rbox(w-.02,h-.02,.05,.008),wl,0,h/2,0,0,leaf); const cw=(w-.02-.36)/2, rows=[[.12,h*.36],[h*.36+.12,h*.62],[h*.62+.12,h-.12]];
          for(const sd of [1,-1])for(let c=0;c<2;c++)for(const [a,b] of rows){ const x=(c-.5)*(cw+.12), hh=b-a, ym=(a+b)/2, z=sd*.026;
            part(rbox(cw,hh,.008,.002),wk,x,ym,z,0,leaf); for(const [bx,by,bw,bh] of [[0,hh/2-.02,cw,.04],[0,-hh/2+.02,cw,.04],[cw/2-.02,0,.04,hh],[-cw/2+.02,0,.04,hh]])part(rbox(bw,bh,.012,.003),wl,x+bx,ym+by,z+sd*.003,0,leaf);
            part(rbox(cw-.12,hh-.12,.016,.004),wl,x,ym,z+sd*.006,0,leaf); } }
        for(const sd of [1,-1]){ const z=sd*.04; part(new THREE.CylinderGeometry(.03,.03,.012,16).rotateX(Math.PI/2),br,w/2-.1,1.0*h/2.3,z,0,leaf); part(rbox(.13,.022,.022,.008),br,w/2-.155,1.0*h/2.3,z+sd*.03,0,leaf);   // the rose and the lever
          part(rbox(.03,.06,.008,.003),br,w/2-.1,.86*h/2.3,z,0,leaf); }   // the keyhole's plate
      };
      for(const f of fw)windowAt('Wf',f,0,0,[0,-1,1,0],wz[0],wz[1],WW);   // a small room has one front window
      if(MHu){ for(const f of fwU)windowAt('Wf',f,0,0,[0,-1,1,0],wz[0]+MHu,wz[1]+MHu,WW); for(const w of SWU)windowAt('Ww',w[0],0,Math.PI/2,[-1,0,0,1],w[1],w[2],w[3],[3,3],w[4]).position.set(0,0,w[0]); }
      for(const w of SWL)windowAt('Ww',w[0],0,Math.PI/2,[-1,0,0,1],w[1],w[2],w[3],[3,3],w[4]).position.set(0,0,w[0]); for(const w of SWE)windowAt('We',w[0],0,-Math.PI/2,[1,0,0,-1],w[1],w[2],w[3],[3,3],w[4]).position.set(Lx,0,w[0]);
      doorAt('Wf',du,0,0,[0,-1,1,0],FD); doorAt('Wb',du,Ly,Math.PI,null,BD);

      /* ---------- the pieces: each one a unit you can move, turn, resize or put away (the room editor, 150d) ---------- */
      const unitBox=o=>{ o.updateWorldMatrix(true,true); const B=new THREE.Box3(); o.traverse(q=>{ if(q.isMesh&&!q.userData.soft&&q.visible!==false)B.expandByObject(q,true); }); return B; };
      const ids={}, uid=n=>{ const k=n.toLowerCase().replace(/[^a-z0-9]+/g,'-'); ids[k]=(ids[k]||0)+1; return k+'-'+ids[k]; };
      const kindOf=un=>{ if(!R.kinds[un.kind])R.kinds[un.kind]={kind:un.kind,name:un.name,loose:un.loose,m:un.m,wire:un.wire,sol:un.sol,shf:un.shf,tpl:un.obj.clone(true)}; };
      // where a unit stands decides its solids and shelves: its footprint turned and scaled, as boxes on the floor plan
      const place=un=>{ for(const h of un.h)if(APTS.unsolid)APTS.unsolid(h); un.h=[]; if(un.gone||un.loose)return; const g=un.obj, c=Math.cos(g.rotation.y), sn=Math.sin(g.rotation.y), k=g.scale.x;
        const xf=(x,z)=>[g.position.x+(x*c+z*sn)*k,g.position.z+(-x*sn+z*c)*k], box=r=>{ const P=[xf(r[0],r[1]),xf(r[2],r[1]),xf(r[0],r[3]),xf(r[2],r[3])]; return [Math.min(...P.map(q=>q[0])),Math.min(...P.map(q=>q[1])),Math.max(...P.map(q=>q[0])),Math.max(...P.map(q=>q[1]))]; };
        const up=R.loft&&g.position.y>R.loft.MH-.3; for(const r of un.sol){ const b=box(r); un.h.push(up?solidUp(b[0],b[1],b[2],b[3],g.position.y,g.position.y+r[4]*k):solidNow(b[0],b[1],b[2],b[3],g.position.y+r[4]*k)); }
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
        if(halo)halo.material=halo.material.clone(); const Lp={g:un.obj,L,sm:sm[0]||{},halo,on:false,i0:L.userData.i0}; L.userData.lp=Lp; R.lamps.push(Lp);
        Lp.th=hit(un,()=>'LAMP: '+(Lp.on?'ON':'OFF'),()=>{ Lp.on=!Lp.on; if(SFX)SFX.play('click',{vol:.8,vary:.2}); },[.3,.5,.3,0,.25,0]); };
      const wireUp=un=>{ if(un.wire&&WIRES[un.wire])WIRES[un.wire](un,ctx); };
      // a soft contact shadow under each piece that stands on the floor, carried with it wherever it goes (SHAD.blob; cheap, no light)
      const bm=SHAD.mat({alpha:.42}), blobFor=un=>{ if(!SHAD.blob)return; const o=un.obj, B=unitBox(o); if(B.isEmpty())return; B.applyMatrix4(o.matrixWorld.clone().invert()); const sz=B.getSize(new V3()); if(B.min.y>.05||sz.y<.03)return;
        const cc=B.getCenter(new V3()), m=SHAD.blob(o,cc.x,B.min.y,cc.z,sz.x+.12,sz.z+.12,{mat:bm}); m.userData.soft=m.userData.keep=1; };
      const looseUnit=(g,name,m,seat,wire)=>{ const un={id:uid(name),name,kind:name,obj:g,loose:true,m,sol:[],shf:[],h:[],th:[],wire:wire||(seat?'sit':null),st:{}}; kindOf(un); R.units.push(un); return un; };
      const body=un=>{ if(!GPH.add)return; if(un.it){ GPH.drop(un.it); const i=R.th.indexOf(un.it); if(i>=0)R.th.splice(i,1); un.it=null; } if(un.gone||!un.loose)return; const s=un.obj.scale.x/M; un.it=GPH.add(un.obj,{name:un.name,m:un.m*s*s*s}); R.th.push(un.it); };

      /* ---------- the light: dim and warm all round, the lamps, the late sun through the panes ---------- */
      // no light overhead and no fill (owner, 25 Oct 2026): the room is lit only by the daylight through its windows and by its own lamps and fittings
      // no lights of their own at the windows: the sun comes in only through the openings (059a's roof casts the rest), so the light falls in window shapes
      R.winL=[];
      /* ---------- out of the windows and doors: the house's fire escapes (front and back, the landings above and below yours) and the sky beyond, seen only through the glass ---------- */
      R.tops=APTS.OUTP.tops; R.bot=APTS.OUTP.bot; R.bot.normal.set(0,1,0); R.edges={Wf:[W(0,0,0),W(Lx,0,0)],Wb:[W(0,0,Ly),W(Lx,0,Ly)],Ww:[W(0,0,0),W(0,0,Ly)]}; R.outs={Wf:[],Wb:[],Ww:[]}; R.backs=[];   // what is outside each windowed wall; the sky behind it (the isometric view only)
      { const AL=APTS.AL, lv=Math.min(APTS.my,APTS.floors-2), S0=APTS.S, RZ=APTS.RZ, cp=k=>[WPL[k],R.tops[k],R.bot,...APTS.OUTP.side[k]];
        const outside=(F,k,face)=>{ if(!APTS.escapeMeshes)return; const G=new THREE.Group(); G.userData.mergeStatic=true; scene.add(G); R.outs[k].push(G);
          for(const me of APTS.escapeMeshes(F,Array.from({length:Math.min(lv+1,APTS.ST-1)},(_,i)=>i+1),-RZ,(lv+2)*S0)){ for(const m of [].concat(me.material)){ m.clippingPlanes=cp(k); m.needsUpdate=true; } me.castShadow=me.receiveShadow=true; G.add(me); }
          const LW=X(1)-X(0), YH=h=>Yr(h)-Yr(0); for(const sp of APTS.escPlants||[]){ if(!APTS.plant3D)break; const o=APTS.plant3D(sp.kind,sp.seed,sp.w*LW,YH(sp.h)); o.rotation.y=(sp.seed*2.39)%6.28; o.position.set(X(sp.x),Yr(sp.z),Z(sp.y));
            o.traverse(q=>{ if(q.isMesh){ q.material=q.material.clone(); q.material.clippingPlanes=cp(k); } }); G.add(o); }   // the escape's real pots, seen through your glass
          G.scale.z=-1; G.position.set(X(A.x0)-X(AL.x0),fy-Yr(lv*S0+RZ),Z(face)+Z(F.yf)); };
        // the house's brick round your walls is the house's own (141c), open at your windows
        for(const me of [].concat(...Object.values(R.outs)))if(me.isMesh){ const g=me.geometry, uv=g.attributes.uv, w=g.parameters.width, h=g.parameters.height; for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w,uv.getY(i)*h); }
        // the sky just past the railings, seen through the glass from above (from inside you see the real sky)
        const back=(k,u,v,ry,nx,nz,len)=>{ const m=skyGlass(k,nx,nz,-nz,nx); m.clippingPlanes=cp(k); const me=part(new THREE.PlaneGeometry(len,HW+8),m,u,HW/2-4,v,ry,apt,false); me.renderOrder=-2; R.outs[k].push(me); R.backs.push(me); };
        back('Wf',Lx/2,-TH-2.0,0,0,-1,Lx+2*TH); back('Ww',-TH-1.8,Ly/2,Math.PI/2,-1,0,Ly+2*TH); }
      R.beams=[];   // no painted sunbeams: the light is the real sun's, through the glass

      const kind=(k,o)=>{ R.kinds[k]={kind:k,name:o.name,loose:false,m:0,wire:o.wire||null,sol:[],shf:[],tpl:o.tpl,mount:o.mount,cat:o.cat}; };   // a kind with no piece in the room yet (the light fittings), only to add
      const ctx={apt,R,M,W,part,thing,mat,rbox,col,tex,rnd,cl,V3,Lx,Ly,HW,fw,du,WW,wz,clip,glowTex,solid,shelf,cap,cur,hit,unitBox,kind,bake};
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
        else { o.position.copy(W(t.u,t.h,t.v)); o.rotation.set(0,t.ry||0,0); o.scale.setScalar(M*s); o.updateMatrixWorld(true); body(un); } if(MODS.goodsHit)MODS.goodsHit(0,4); };
      const thingsOn=(un,on)=>{ for(const t of un.th){ const i=UI.things.indexOf(t); if(on&&i<0)UI.things.push(t); if(!on&&i>=0)UI.things.splice(i,1); } };
      const remove=un=>{ un.gone=true; un.obj.visible=false; thingsOn(un,false); body(un); place(un); R.LL=null; };
      const restore=un=>{ un.gone=false; un.obj.visible=true; thingsOn(un,true); body(un); place(un); R.LL=null; };
      const spawn=(kind,t,id)=>{ const K=R.kinds[kind]; if(!K)return null; const o=K.tpl.clone(true); (K.loose?scene:apt).add(o);
        const un={id:id||('add-'+(++R.addN)),name:K.name,kind,obj:o,loose:K.loose,m:K.m,sol:K.sol,shf:K.shf,h:[],th:[],wire:K.wire,st:{},added:true,mount:K.mount,cat:K.cat}; R.units.push(un); setT(un,t); blobFor(un); wireUp(un); R.LL=null; un.obj.traverse(o=>{ if(o.isLight&&o.userData.i0!=null)paint(o); }); return un; };
      const drop=un=>{ remove(un); un.obj.removeFromParent(); const i=R.units.indexOf(un); if(i>=0)R.units.splice(i,1); };
      const WK=['Wf','Wb','Ww','We'], wall=(k,w)=>{ const D=WALLS[k]; if(!D)return; if(D.gen&&!D.t)D.t=D.gen(); if(w==='all')R.walls={}; else if(WK.includes(w))R.walls[w]=k; else R.wall=k; if(w==='all')R.wall=k;   // the room's paint (the walls with none of their own), every wall ('all'), or one wall's own (owner, 12 Nov 2026)
        R.wallMats.forEach((m,i)=>{ const own=R.walls[WK[i]]; if(WK.includes(w)?WK[i]!==w:!!own)return; m.map=D.t||R.plaster; m.bumpMap=m.map; m.color.set(D.t?0xffffff:col(D.c)); m.needsUpdate=true; }); };
      const floor=(k,up)=>{ const D=FLOORS[k]; if(!D)return; if(!D.t)D.t=D.gen(Lx,Ly); const m=up?R.loftFloor:R.floorMat; if(!m)return; m.map=D.t; if(!up)m.bumpMap=D.t; m.needsUpdate=true; if(up)R.floor2=k; else R.floor=k; };   // the room's floor, or the upper floor's (the loft)
      const kz=()=>R.kzone||[0,0,1,1], kfloor=k=>{ const D=KFLOORS[k]; if(!D||!R.kfloor)return; R.kfloorK=k; const on=k!=='room'; for(const o of R.kfloor)o.visible=on; if(!on)return;
        if(!D.t){ const z=kz(); D.t=D.gen(z[2]-z[0],z[3]-z[1]); } R.kfloorMat.map=D.t; R.kfloorMat.needsUpdate=true; };
      // a little picture of a paint, paper or floor for the editor's swatches (painted the first time it is asked for)
      const thumb=(set,k)=>{ const D={wall:WALLS,floor:FLOORS,kfloor:KFLOORS}[set][k]; if(!D||!D.gen)return null; if(!D.t){ const z=kz(); D.t=set==='wall'?D.gen():set==='floor'?D.gen(Lx,Ly):D.gen(z[2]-z[0],z[3]-z[1]); }
        if(!D.thumb){ const c=document.createElement('canvas'); c.width=c.height=48; const g=c.getContext('2d'), im=D.t.image; if(im.width>=300){ g.drawImage(im,0,0,160,160,0,0,48,48); } else { const k=24/Math.max(im.width,im.height), p=g.createPattern(im,'repeat'); g.scale(k,k); g.fillStyle=p; g.fillRect(0,0,48/k,48/k); } D.thumb=c.toDataURL(); } return D.thumb; };
      const lightsAll=()=>{ if(R.LL)return R.LL; const out=R.ceil.slice(); for(const un of R.units){ if(un.gone)continue; let n=0; un.obj.traverse(o=>{ if((o.isPointLight||o.isSpotLight)&&!o.userData.flame){ if(o.userData.on===undefined&&!o.userData.lamp)o.userData.on=false; } if((o.isPointLight||o.isSpotLight)&&!o.userData.flame)out.push({id:un.id+(n++?'.'+n:''),name:un.name,L:o,un}); }); } return R.LL=out; };
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
      R.api={R,M,Lx,Ly,HW,porch:(F=>F?{u0:(A.x1-A.x0-F.ub)*MPU+.12,u1:(A.x1-A.x0-F.ua)*MPU-.12,v0:-(.24+APTS.DO*MPU)+.14,v1:-.3}:null)(APTS.ESC&&APTS.ESC[0]),units:()=>R.units,kinds:()=>R.kinds,getT,setT,remove,restore,spawn,drop,lift,toApt,W,unitBox,wall,floor,lightsAll,light,lightGet,lightReset,walls:WALLS,floors:FLOORS,kfloors:KFLOORS,kfloor,thumb,glow:k=>{ R.glowK=cl(k,0,3); }};
      if(R.kfloor)kfloor('oak'); ROOMK.api=R.api; for(const f of ROOMK.built)f(R.api);
      window.BEDROOMDBG=()=>({built:!!R,Lx,Ly,fw,du,HW,loose:R?R.th.length:0,units:R?R.units.length:0,kinds:R?R.units.map(u=>u.kind):[],at:R?R.units.filter(u=>!u.loose).map(u=>{ const b=new THREE.Box3().setFromObject(u.obj), a=R.apt.matrixWorld.clone().invert(); b.applyMatrix4(a); return [u.kind,+b.min.x.toFixed(2),+b.max.x.toFixed(2),+b.min.z.toFixed(2),+b.max.z.toFixed(2)]; }):[],walls:Object.values(APTS.WPL||{}).map(p=>+p.constant.toFixed(2)),lamps:R?R.lamps.map(l=>l.on):[]}); };

    // gone with the apartment: the loose things leave the physics, the ones you added leave the scene
    const clear=Q=>{ '@later'; if(!Q)return; if(GPH.drop)for(const it of Q.th)GPH.drop(it); for(const t of Q.winTh||[]){ const i=UI.things.indexOf(t); if(i>=0)UI.things.splice(i,1); } AMB.breeze=0; for(const un of Q.units||[]){ for(const t of un.th){ const i=UI.things.indexOf(t); if(i>=0)UI.things.splice(i,1); } if(un.loose)un.obj.removeFromParent(); } };
    APTS.furnish(APTS.my,()=>{ clear(R); R=null; ROOMK.api=null; build(); });

    /* ---------- each frame: the lamps glow (brighter as the day goes), the room's lights at their brightness, the pieces that move (fridge doors, flames), the sun's beams follow the hour, the sky is only in the windows in the isometric view ---------- */
    let prevShadow=null;
    const DARK={value:0}, FILL={value:new THREE.Color(0,0,0)}, LFB=THREE.ShaderChunk.lights_fragment_begin.replace('vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );','vec3 irradiance = getAmbientLightIrradiance( ambientLightColor )*(1.-uIn)+uFill;').replace('irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );','irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal )*(1.-uIn);');
    const darken=o=>o&&o.traverse(q=>{ if(!q.isMesh)return; for(const m of [].concat(q.material)){ if(!m||m.userData.dk||m.isMeshBasicMaterial||m.isShaderMaterial)continue; m.userData.dk=1; const f=m.onBeforeCompile, ck=m.customProgramCacheKey;
      m.onBeforeCompile=function(sh,r){ if(f)f.call(this,sh,r); if(sh.fragmentShader.indexOf('#include <lights_fragment_begin>')<0)return; sh.uniforms.uIn=DARK; sh.uniforms.uFill=FILL; sh.fragmentShader='uniform float uIn; uniform vec3 uFill;\n'+sh.fragmentShader.replace('#include <lights_fragment_begin>',LFB); };
      m.customProgramCacheKey=function(){ return (ck?ck.call(this):'')+'|dk2'; }; m.needsUpdate=true; } });   // your rooms take no sky fill (there is a ceiling, even when the view leaves it off); the sun only where it falls through a window (the walls and 059a's roof cast the rest)
    // a new shadow type needs new shadow maps (three's maps are made for the type they were first drawn with)
    const reShadow=()=>scene.traverse(o=>{ if(o.isLight&&o.shadow&&o.shadow.map){ o.shadow.map.dispose(); o.shadow.map=null; o.shadow.needsUpdate=true; } if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true; });
    SYS.add('places',dt=>{ const inn=!!APTS.inReal;
      if(inn&&prevShadow==null&&renderer.shadowMap.type!==THREE.PCFShadowMap){ prevShadow=renderer.shadowMap.type; renderer.shadowMap.type=THREE.PCFShadowMap; reShadow(); }
      else if(!inn&&prevShadow!=null){ renderer.shadowMap.type=prevShadow; prevShadow=null; reShadow(); }
      if(!R)return; if(!R.apt.parent){ clear(R); R=null; ROOMK.api=null; return; }
      const k=Math.min(1,(dt||0)*5), e=CLOCK.elev(), day=cl((e+3)/12,0,1);
      for(const L of R.lamps){ const t=L.on?L.i0*(L.L.userData.k??1)*(1.2-.4*day):0; L.L.intensity+=(t-L.L.intensity)*k; L.sm.emissiveIntensity=L.on?.55:.03; if(L.halo)L.halo.material.opacity=L.on?.32:0; }
      for(const q of R.api.lightsAll()){ const u=q.L.userData; if(!u.lamp)q.L.intensity=(u.on===false?0:1)*(u.i0??0)*(u.k??1); }
      for(const un of R.units)if(un.tick&&!un.gone)un.tick(dt||0);
      // the windows: the sash eases up or down; an open one lets in a calm breeze
      { const h=Math.min(.033,dt||0); let any=0;
        for(const w of R.wins){ w.o+=((w.open?w.H:0)-w.o)*Math.min(1,h*3); w.sash.position.y=w.o; w.br+=((w.open?1:0)-w.br)*Math.min(1,h*.6); any=Math.max(any,w.br); }
        AMB.breeze=inn?any:0; }
      // what hangs high on a wall that is cut away goes with it (the cubbies, the shelves and what stands on them), so nothing floats between you and the camera
      if((R.hiT=(R.hiT||0)-(dt||0))<=0){ R.hiT=.2; const A=R.api, cut=k=>APTS.WPL[k].constant<1e5; if(APTS.relink&&(R.relN=(R.relN||0)+1)%10===1)APTS.relink(R.apt); darken(R.apt); for(const un of R.units)darken(un.obj);
        for(const un of R.units){ if(un.gone)continue; const o=un.obj, p=un.loose?A.toApt(o.position.x,o.position.y,o.position.z):{u:o.position.x,h:o.position.y,v:o.position.z};
          const hide=p.h>1.2&&((cut('Ww')&&p.u<.5)||(cut('We')&&A.Lx-p.u<.5)||(cut('Wf')&&p.v<.5)||(cut('Wb')&&A.Ly-p.v<.5));
          if(hide!==!!un.st.hi){ un.st.hi=hide; o.traverse(q=>{ if(q.isMesh&&!q.userData.hit)q.visible=!hide; }); } } }
      DARK.value=APTS.inReal?1:0;   // inside, no sky or ceiling light: the daylight through the windows fills the room evenly (none at night), the sun falls in window shapes, and the lamps you switch on
      { const d=APTS.inReal?cl((e+2)/14,0,1)*.32:0; FILL.value.setRGB(d*.92,d*.97,d); }
      const nt=1-day; for(const L of R.winL)L.intensity=inn?(18*day+6*nt)*(L.userData.k??1):0; const sunK=cl((e-2)/10,0,1); for(const L of R.winL)L.color.setRGB(1-.28*nt,.86+.1*sunK-.12*nt,.72+.26*sunK+.2*nt*(1-sunK));   // the light at the glass: warm when the sun is low, a cool blue moonlight by night
      // outside: the house's brick and the back fire escape round your rooms; in the isometric view nothing above your landing's rails
      { const isoV=!UI.persp&&SHARED.pitch<1.45&&!APTS.onEsc;
        for(const k in R.tops){ const p=R.tops[k]; p.normal.set(0,-1,0); p.constant=isoV?R.fy+SHARED.BOD.Y(45)-SHARED.BOD.Y(0):1e6; } R.bot.constant=1e6; for(const k in R.edges)for(const p of APTS.OUTP.side[k])p.constant=1e6;
        for(const k in R.outs)for(const o of R.outs[k])o.visible=!APTS.onEsc&&!R.backs.includes(o); }
      for(const [k,D0] of [['Wf',APTS.escDoor],['Wb',APTS.frontDoor]]){ const D=R.doors[k]; if(D&&D0){ const t=D0.open?-1.45:0; D.rotation.y+=(t-D.rotation.y)*Math.min(1,(dt||0)*7); } }
      for(const b of R.beams)b.uniforms.uOp.value=inn?.16*day:0;
      const iso=!UI.persp&&SHARED.pitch<1.45; ISO.value=iso?1:0;
    }, '150a-bedroom'); } }
export {ROOMK};
