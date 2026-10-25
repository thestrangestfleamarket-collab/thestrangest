// THE APARTMENT ROOM: your apartment as one open room in the owner's cozy picture's style (25 Oct 2026): cream walls under a dark wood crown, wide orange planks on a cream slab, curtained windows onto the live sky, and its things (the checkered bed, the nightstands and lamps, the monstera, the diamond frames, the shelves of plants and books, the desk and chair); every small thing a real body.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, SFX, SHAD, SKY, UI, USE} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {MODS, SYS} from './006-map-pre.js';
import {GPH} from './150-loose.js';
const ROOMK={parts:[],wires:{},built:[],api:null};   // the room's other parts (the kitchen, 150b) add their builders and what their pieces do (wires); the room editor (150c) hears when it is built and works through api
{ const APTS=MODS.apts;
  if(APTS&&APTS.R){ const V3=THREE.Vector3, cl=(v,a,b)=>Math.max(a,Math.min(b,v)), MPU=.907;   // the apartment's art unit is .907 m: the picture's sizes are metres
    const col=c=>new THREE.Color('rgb('+c.join(',')+')');
    const mat=(c,o={})=>new THREE.MeshStandardMaterial({color:col(c),roughness:.75,metalness:0,...o});
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
          const sh=g.createLinearGradient(0,y0,0,y0+ph); sh.addColorStop(0,'rgba(255,220,170,.10)'); sh.addColorStop(1,'rgba(60,24,8,.14)'); g.fillStyle=sh; g.fillRect(x0+1.5,y0+1.5,pw2,ph-3);
          g.fillStyle='rgba(255,224,180,.34)'; g.fillRect(x0+1.5,y0+1.5,pw2,b); g.fillRect(x0+1.5,y0+1.5,b,ph-3);   // grout depth: each plank a raised lip, lit top/left
          g.fillStyle='rgba(12,5,1,.55)'; g.fillRect(x0+1.5,y0+ph-1.5-b,pw2,b); g.fillRect(x1-1.5-b,y0+1.5,b,ph-3); u+=L; } } });   // ...shadowed bottom/right, so the gaps read recessed
    const checker=()=>tex(256,256,(g,W,H)=>{ const n=10, s=W/n; for(let i=0;i<n;i++)for(let j=0;j<n;j++){ g.fillStyle=(i+j)&1?'#e4e2d6':'#2c3430'; g.fillRect(i*s,j*s,s,s); } });
    const glowTex=tex(64,64,(g,W,H)=>{ const r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,'rgba(255,214,150,1)'); r.addColorStop(.35,'rgba(255,190,110,.45)'); r.addColorStop(1,'rgba(255,170,90,0)'); g.fillStyle=r; g.fillRect(0,0,W,H); });
    // the walls and floors you can choose (the room editor): a paint, or a paper painted once and repeated by the metre
    const rep_=(t,w,h)=>{ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1/w,1/h); return t; };
    const WALLS={cream:{n:'CREAM',c:[238,228,198]},white:{n:'WHITE',c:[242,240,234]},sage:{n:'SAGE',c:[176,196,166]},blush:{n:'BLUSH',c:[230,190,180]},sky:{n:'SKY',c:[180,204,226]},butter:{n:'BUTTER',c:[242,224,168]},charcoal:{n:'CHARCOAL',c:[78,78,84]},
      brick:{n:'BRICK',c:[150,70,50],gen:()=>rep_(tex(256,128,(g,w,h)=>{ g.fillStyle='#d8cfc2'; g.fillRect(0,0,w,h); for(let r=0;r<4;r++)for(let i=-1;i<5;i++){ const k=.8+rnd()*.3; g.fillStyle=`rgb(${156*k|0},${70*k|0},${50*k|0})`; g.fillRect(i*64+(r&1?32:0)+2,r*32+2,60,28); } }),.5,.25)},
      stripes:{n:'STRIPES',c:[200,214,190],gen:()=>rep_(tex(64,8,(g,w,h)=>{ g.fillStyle='#f0e8d6'; g.fillRect(0,0,w,h); g.fillStyle='#b8ccb0'; g.fillRect(0,0,22,h); g.fillStyle='#d6e0cc'; g.fillRect(26,0,4,h); }),.24,1)},
      floral:{n:'FLORAL',c:[226,200,200],gen:()=>rep_(tex(128,128,(g,w,h)=>{ g.fillStyle='#f2e6dc'; g.fillRect(0,0,w,h); for(const [x,y] of [[32,32],[96,96],[96,32],[32,96]].map(([x,y],i)=>i>1?[x,y]:[x,y])){ g.fillStyle='#8fae86'; g.beginPath(); g.ellipse(x+9,y+4,7,3,.5,0,7); g.fill(); for(let a=0;a<5;a++){ g.fillStyle=(x+y)%64?'#e6a2a8':'#e8c27a'; g.beginPath(); g.arc(x+Math.cos(a*1.26)*6,y+Math.sin(a*1.26)*6,5,0,7); g.fill(); } g.fillStyle='#f6e0a0'; g.beginPath(); g.arc(x,y,3,0,7); g.fill(); } }),.32,.32)},
      panel:{n:'WOOD PANEL',c:[170,120,80],gen:()=>rep_(tex(256,32,(g,w,h)=>{ for(let i=0;i<8;i++){ const k=.85+rnd()*.25; g.fillStyle=`rgb(${176*k|0},${122*k|0},${78*k|0})`; g.fillRect(i*32,0,32,h); g.fillStyle='rgba(60,30,10,.5)'; g.fillRect(i*32,0,2,h); } }),.8,.1)}};
    const tiled=(n,w,draw)=>(Lx,Ly)=>rep_(tex(n,n,draw),w*1/Lx,w*1/Ly);
    const FLOORS={planks:{n:'ORANGE PLANKS',c:[198,116,56],gen:(Lx,Ly)=>planks(Lx,Ly)},oak:{n:'LIGHT OAK',c:[214,172,124],gen:(Lx,Ly)=>planks(Lx,Ly,[214,172,124])},walnut:{n:'WALNUT',c:[118,72,42],gen:(Lx,Ly)=>planks(Lx,Ly,[118,72,42])},grey:{n:'GREY WASH',c:[176,166,154],gen:(Lx,Ly)=>planks(Lx,Ly,[176,166,154])},
      checker:{n:'CHECKER TILE',c:[60,60,60],gen:tiled(128,.6,(g,w)=>{ for(let i=0;i<2;i++)for(let j=0;j<2;j++){ g.fillStyle=(i+j)&1?'#2a2a2e':'#ece8de'; g.fillRect(i*64,j*64,64,64); } g.strokeStyle='rgba(120,110,100,.5)'; g.lineWidth=2; g.strokeRect(0,0,w,w); g.beginPath(); g.moveTo(64,0); g.lineTo(64,128); g.moveTo(0,64); g.lineTo(128,64); g.stroke(); })},
      terracotta:{n:'TERRACOTTA',c:[196,110,72],gen:tiled(128,.6,(g,w)=>{ g.fillStyle='#d8c8b4'; g.fillRect(0,0,w,w); for(let i=0;i<2;i++)for(let j=0;j<2;j++){ const k=.88+rnd()*.2; g.fillStyle=`rgb(${200*k|0},${112*k|0},${72*k|0})`; g.fillRect(i*64+2,j*64+2,60,60); } })},
      carpet:{n:'CARPET',c:[196,170,150],gen:tiled(128,1,(g,w)=>{ g.fillStyle='#c4aa96'; g.fillRect(0,0,w,w); for(let i=0;i<2400;i++){ g.fillStyle=`rgba(${rnd()<.5?90:255},${rnd()<.5?70:240},${rnd()<.5?60:220},.08)`; g.fillRect(rnd()*w,rnd()*w,2,2); } })},
      concrete:{n:'CONCRETE',c:[150,150,148],gen:tiled(128,1.5,(g,w)=>{ g.fillStyle='#9a9894'; g.fillRect(0,0,w,w); for(let i=0;i<900;i++){ g.fillStyle=`rgba(${rnd()<.5?60:220},${rnd()<.5?60:220},${rnd()<.5?60:220},.06)`; g.fillRect(rnd()*w,rnd()*w,3,3); } })}};
    const ISO={value:0}, skyOff={on:false};
    const blackOut=()=>{ if(skyOff.on&&scene.background&&scene.background.isColor)scene.background.setRGB(0,0,0); };   // as a shop's inside does (ROOMS): after the sky has set the colour this frame

    let R=null;   // the built room: its meshes, lights and loose things
    const build=()=>{ '@apts'; const X=SHARED.BOD.X, Z=SHARED.BOD.Z, Yr=SHARED.BOD.Y, A=APTS.R, WI=APTS.WIN, WPL=APTS.WPL, M=(X(A.x0+1)-X(A.x0))/MPU, fy=Yr(.15)+.012, HW=(Yr(APTS.S||130)-Yr(0))/M;
      const px=z=>z/32.4, Lx=(A.x1-A.x0)*MPU, Ly=(A.y1-A.y0)*MPU, TH=.24, W=(u,h,v)=>new V3(X(A.x0)+u*M,fy+h*M,Z(A.y0)+v*M);
      const apt=new THREE.Group(); apt.position.set(X(A.x0),fy,Z(A.y0)); apt.scale.setScalar(M); scene.add(apt);
      R={apt,M,loose:[],lights:[],lamps:[],th:[],units:[],kinds:{},ceil:[],wallMats:[],floorMat:null,wall:'cream',floor:'planks',glowK:1,addN:0};
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
      const wallOf=(k,len,holes,u,v,ry)=>{ const wm=mat(CREAM,{roughness:.95,side:THREE.DoubleSide,shadowSide:THREE.DoubleSide,...clip(k)}); R.wallMats.push(wm); return part(new THREE.ExtrudeGeometry(rect(len,HW,holes),{depth:TH,bevelEnabled:false}),[wm,mat([30,22,16],{roughness:.9,side:THREE.DoubleSide,...clip(k)})],u,0,v,ry,apt); };
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
      // the picture's window: a thick orange frame of four panes and its sill, a dark rod, the mint sheers tied back
      const windowAt=(k,uc,v,ry,out,z0,z1,w,panes=[2,2],curtains=true)=>{ const g=new THREE.Group(); g.position.set(uc,0,v); g.rotation.y=ry; apt.add(g); const wm=mat(WOODO,{roughness:.55,...clip(k)});
        part(new THREE.PlaneGeometry(w-.04,z1-z0-.04),skyGlass(k,out[0],out[1],out[2],out[3]),0,(z0+z1)/2,-.16,0,g,false);
        for(const s of [-1,1])part(rbox(.09,z1-z0+.06,.16,.012),wm,s*(w/2-.025),(z0+z1)/2,-.06,0,g); part(rbox(w+.04,.09,.16,.012),wm,0,z1-.005,-.06,0,g);
        part(rbox(w+.16,.05,.2,.012),wm,0,z0-.01,-.04,0,g);
        for(let i=1;i<panes[0];i++)part(rbox(.04,z1-z0,.05,.006),wm,-w/2+w*i/panes[0],(z0+z1)/2,-.13,0,g);
        for(let j=1;j<panes[1];j++)part(rbox(w,.04,.05,.006),wm,0,z0+(z1-z0)*j/panes[1],-.13,0,g);
        if(!curtains)return g; const rod=mat([40,30,24],{roughness:.4,metalness:.5,...clip(k)}); part(new THREE.CylinderGeometry(.014,.014,w+.8,10).rotateZ(Math.PI/2),rod,0,z1+.18,.08,0,g);
        for(const s of [-1,1]){ part(new THREE.SphereGeometry(.025,10,8),rod,s*(w/2+.4),z1+.18,.08,0,g);
          const sheer=new THREE.MeshStandardMaterial({color:col(MINT),roughness:.9,transparent:true,opacity:.62,side:THREE.DoubleSide,emissive:col([60,90,84]),emissiveIntensity:.25,...clip(k)});
          const top=z1+.17, bot=Math.max(.6,z0-.35), cg=new THREE.PlaneGeometry(1,1,18,26), p=cg.attributes.position, outer=s*(w/2+.38), inner=s*(w/2-.08);
          for(let i=0;i<p.count;i++){ const a=p.getX(i)+.5, b=.5-p.getY(i), h=top-(top-bot)*b, gather=.35+.65*Math.pow(1-b,1.4), u=outer+(inner-outer)*a*gather;
            p.setXYZ(i,u,h,.09+Math.sin(a*Math.PI*6+s)*.03*(.4+b)+.02*b); }
          cg.computeVertexNormals(); part(cg,sheer,0,0,0,0,g); }
        return g; };
      const doorAt=(k,uc,v,ry,out,o)=>{ const g=new THREE.Group(); g.position.set(uc,0,v); g.rotation.y=ry; apt.add(g); const wm=mat(WOODD,{roughness:.5,...clip(k)}), w=o[1]-o[0], h=o[3];
        for(const s of [-1,1])part(rbox(.08,h+.08,.03,.006),wm,s*(w/2+.04),h/2+.04,.015,0,g); part(rbox(w+.24,.08,.03,.006),wm,0,h+.04,.015,0,g);
        const leaf=new THREE.Group(); leaf.position.set(0,0,-.08); g.add(leaf); part(rbox(w-.02,h-.02,.05,.008),wm,0,h/2,0,0,leaf);
        if(out){ for(let r=0;r<3;r++)for(let c=0;c<2;c++)part(new THREE.PlaneGeometry(w*.36,h*.24),skyGlass(k,out[0],out[1],out[2],out[3]),(c-.5)*w*.42,h*(.3+r*.26),.027,0,leaf,false); }
        else for(let r=0;r<2;r++)for(let c=0;c<2;c++)part(rbox(w*.34,h*(r?.42:.3),.012,.006),mat([118,68,38],{roughness:.5,...clip(k)}),(c-.5)*w*.44,h*(r?.68:.25),.03,0,leaf);
        part(new THREE.SphereGeometry(.03,12,8),mat([200,160,90],{roughness:.3,metalness:.7,...clip(k)}),w/2-.1,1.0,.05,0,leaf); };
      windowAt('Wf',fw[0],0,0,[0,-1,1,0],wz[0],wz[1],WW); windowAt('Wf',fw[1],0,0,[0,-1,1,0],wz[0],wz[1],WW,[2,2],false);
      windowAt('Wb',fw[0],Ly,Math.PI,[0,1,-1,0],wz[0],wz[1],WW); windowAt('Wb',fw[1],Ly,Math.PI,[0,1,-1,0],wz[0],wz[1],WW);
      windowAt('Ww',SW[0],0,Math.PI/2,[-1,0,0,1],SW[1],SW[2],SW[3],[4,1],false).position.set(0,0,SW[0]);   // the little row of four panes above the bed
      doorAt('Wf',du,0,0,[0,-1,1,0],FD); doorAt('Wb',du,Ly,Math.PI,null,BD);

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
      const lamp=(u,h,v,s=1)=>{ const g=thing(u,h,v), sm=new THREE.MeshStandardMaterial({color:col([244,234,196]),roughness:.9,side:THREE.DoubleSide,emissive:col([255,214,150]),emissiveIntensity:.55});
        part(new THREE.LatheGeometry([[0,0],[.06,0],[.065,.02],[.035,.05],[.03,.16],[.045,.2],[.015,.22]].map(([x,y])=>new THREE.Vector2(x*s,y*s)),20),mat([196,120,58],{roughness:.45}),0,0,0,0,g);
        part(new THREE.CylinderGeometry(.075*s,.14*s,.17*s,24,1,true),sm,0,.27*s,0,0,g,false).userData.shade=1;
        const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.32})); halo.scale.set(.5*s,.5*s,1); halo.position.set(0,.26*s,0); halo.userData.halo=1; g.add(halo);
        const L=new THREE.PointLight(0xffb870,2.2,4.2*M,1.8); L.userData.pool=true; L.userData.lamp=1; L.userData.i0=2.2; L.position.set(0,.24*s,0); g.add(L); return g; };
      R.loose.push([lamp(.23,.59,BV-BW/2-.32),'LAMP',1.5,false,'lamp'],[lamp(.23,.59,BV+BW/2+.32),'LAMP',1.5,false,'lamp']);
      // the monstera by the window corner
      { const g=thing(.42,0,.5), pm=mat([214,180,140],{roughness:.8}), lm=mat([58,138,52],{roughness:.6,side:THREE.DoubleSide}), sm2=mat([70,120,50],{roughness:.6});
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
        const sh=new THREE.MeshStandardMaterial({color:col([50,44,40]),roughness:.4,emissive:col([255,200,130]),emissiveIntensity:.0}); const cn=part(new THREE.ConeGeometry(.045,.07,14,1,true),sh,.06,.25,0,0,g); cn.rotation.z=-1.2; cn.userData.shade=1;
        const L=new THREE.PointLight(0xffc98a,.9,2*M,2); L.userData.pool=true; L.userData.lamp=1; L.userData.i0=.9; L.position.set(.09,.22,0); g.add(L); R.loose.push([g,'DESK LAMP',.8,false,'lamp']); }
      { const g=thing(DU2,0,.92,Math.PI+.15), cm=mat(WOODO,{roughness:.5});
        part(rbox(.42,.04,.4,.01),cm,0,.46,0,0,g); for(const [x,z] of [[-.18,-.17],[.18,-.17],[-.18,.17],[.18,.17]])part(rbox(.035,.46,.035,.006),cm,x,.23,z,0,g);
        for(const s of [-1,1])part(rbox(.035,.5,.035,.006),cm,s*.18,.73,-.17,0,g); for(let i=0;i<3;i++)part(rbox(.36,.05,.02,.006),cm,0,.6+i*.13,-.17,0,g);
        R.loose.push([g,'CHAIR',5,true]); R.chair=g; }

      /* ---------- the light: dim and warm all round, the lamps, the late sun through the panes ---------- */
      [[Lx*.25,Ly*.3],[Lx*.3,Ly*.75],[Lx*.72,Ly*.72],[Lx*.72,Ly*.28]].forEach(([u,v],i)=>{ const L=new THREE.PointLight(0xffc48a,2.8,9*M,1.2); L.userData.pool=true; L.userData.i0=2.8; L.position.set(X(A.x0)+u*M,fy+(HW-.4)*M,Z(A.y0)+v*M); scene.add(L); R.lights.push(L); R.ceil.push({id:'ceiling-'+(i+1),name:'CEILING LIGHT '+(i+1),L}); });
      const hemi=new THREE.HemisphereLight(0xffd6a8,0x3a2414,0); scene.add(hemi); R.hemi=hemi;
      // a sunbeam through each front window, seen in the air only where it is
      R.beams=[]; for(const c of fw){ const a=W(c-WW/2,wz[1],0), b=W(c+WW/2,wz[1],0), cc=W(c+WW/2,wz[0],0), d=W(c-WW/2,wz[0],0), dir=W(c+1.0,0,3.4).sub(W(c-.9,3.2,-2.85)).normalize(), L=3.6*M, e=[a,b,cc,d].map(p=>p.clone().addScaledVector(dir,L));
        const pos=[], uv=[]; const quad=(p,q,r,s,t0,t1)=>{ pos.push(...p.toArray(),...q.toArray(),...r.toArray(),...p.toArray(),...r.toArray(),...s.toArray()); uv.push(t0,0,t0,1,t1,1,t0,0,t1,1,t1,0); };
        quad(a,e[0],e[1],b,0,0); quad(d,e[3],e[2],cc,0,0); quad(a,e[0],e[3],d,1,1); quad(b,e[1],e[2],cc,1,1);
        const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); bg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
        const bm=new THREE.ShaderMaterial({uniforms:{uOp:{value:0},uC:{value:new THREE.Color(1,.84,.6)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
          vertexShader:'varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
          fragmentShader:'uniform float uOp; uniform vec3 uC; varying vec2 vU; void main(){ float a=uOp*(1.-vU.y)*smoothstep(0.,.2,vU.y); gl_FragColor=vec4(uC*a,a); }'});
        const beam=new THREE.Mesh(bg,bm); beam.renderOrder=7; beam.frustumCulled=false; scene.add(beam); R.beams.push(bm); }

      const ctx={apt,R,M,W,part,thing,mat,rbox,col,tex,rnd,cl,V3,Lx,Ly,HW,fw,du,WW,wz,clip,glowTex,solid,shelf,cap,cur,hit,unitBox};
      for(const f of ROOMK.parts)f(ctx);
      /* ---------- real bodies, and what a double click does ---------- */
      for(const [g,name,m,seat,wire] of R.loose)looseUnit(g,name,m,seat,wire);
      for(const un of R.units)blobFor(un);
      for(const un of R.units)if(un.loose)body(un);
      for(const un of R.units)wireUp(un);

      /* ---------- what the room editor works with: where each piece stands, putting it away and back, a new one from a kind, the walls, the floor, the lights ---------- */
      const toApt=(x,y,z)=>({u:(x-X(A.x0))/M,h:(y-fy)/M,v:(z-Z(A.y0))/M});
      const getT=un=>{ const o=un.obj; if(!un.loose)return {u:o.position.x,h:o.position.y,v:o.position.z,ry:o.rotation.y,s:o.scale.x};
        const p=toApt(o.position.x,o.position.y,o.position.z), e=new THREE.Euler().setFromQuaternion(o.quaternion,'YXZ'); return {...p,ry:e.y,s:o.scale.x/M}; };
      const setT=(un,t)=>{ const o=un.obj, s=cl(t.s||1,.3,3); if(!un.loose){ o.position.set(t.u,t.h,t.v); o.rotation.set(0,t.ry||0,0); o.scale.setScalar(s); place(un); }
        else { o.position.copy(W(t.u,t.h,t.v)); o.rotation.set(0,t.ry||0,0); o.scale.setScalar(M*s); o.updateMatrixWorld(true); body(un); } if(window.GOODSHIT)GOODSHIT(0,4); };
      const thingsOn=(un,on)=>{ for(const t of un.th){ const i=UI.things.indexOf(t); if(on&&i<0)UI.things.push(t); if(!on&&i>=0)UI.things.splice(i,1); } };
      const remove=un=>{ un.gone=true; un.obj.visible=false; thingsOn(un,false); body(un); place(un); R.LL=null; };
      const restore=un=>{ un.gone=false; un.obj.visible=true; thingsOn(un,true); body(un); place(un); R.LL=null; };
      const spawn=(kind,t,id)=>{ const K=R.kinds[kind]; if(!K)return null; const o=K.tpl.clone(true); (K.loose?scene:apt).add(o);
        const un={id:id||('add-'+(++R.addN)),name:K.name,kind,obj:o,loose:K.loose,m:K.m,sol:K.sol,shf:K.shf,h:[],th:[],wire:K.wire,st:{},added:true}; R.units.push(un); setT(un,t); blobFor(un); wireUp(un); R.LL=null; return un; };
      const drop=un=>{ remove(un); un.obj.removeFromParent(); const i=R.units.indexOf(un); if(i>=0)R.units.splice(i,1); };
      const wall=k=>{ const D=WALLS[k]; if(!D)return; if(D.gen&&!D.t)D.t=D.gen(); for(const m of R.wallMats){ m.map=D.t||null; m.color.set(D.t?0xffffff:col(D.c)); m.needsUpdate=true; } R.wall=k; };
      const floor=k=>{ const D=FLOORS[k]; if(!D)return; if(!D.t)D.t=D.gen(Lx,Ly); R.floorMat.map=D.t; R.floorMat.needsUpdate=true; R.floor=k; };
      const lightsAll=()=>{ if(R.LL)return R.LL; const out=R.ceil.slice(); for(const un of R.units){ if(un.gone)continue; let n=0; un.obj.traverse(o=>{ if(o.isPointLight&&!o.userData.flame)out.push({id:un.id+(n++?'.'+n:''),name:un.name,L:o,un}); }); } return R.LL=out; };
      const light=(id,o)=>{ const e=lightsAll().find(q=>q.id===id); if(!e)return; const u=e.L.userData; if(o.k!=null)u.k=cl(o.k,0,3); if(o.c)e.L.color.set(o.c);
        if(o.on!=null){ if(u.lp){ u.lp.on=o.on; if(u.lp.th)u.lp.th.name='LAMP: '+(o.on?'ON':'OFF'); } else u.on=o.on; } };
      const lift=un=>{ const g=un.gone; un.gone=true; body(un); un.gone=g; };   // out of the physics while you carry it
      R.api={R,M,Lx,Ly,HW,units:()=>R.units,kinds:()=>R.kinds,getT,setT,remove,restore,spawn,drop,lift,toApt,W,unitBox,wall,floor,lightsAll,light,walls:WALLS,floors:FLOORS,glow:k=>{ R.glowK=cl(k,0,3); }};
      ROOMK.api=R.api; for(const f of ROOMK.built)f(R.api);
      window.BEDROOMDBG=()=>({built:!!R,Lx,Ly,fw,du,HW,loose:R?R.th.length:0,units:R?R.units.length:0,walls:Object.values(APTS.WPL||{}).map(p=>+p.constant.toFixed(2)),sky:!skyOff.on,lamps:R?R.lamps.map(l=>l.on):[]}); };

    // gone with the apartment: the loose things leave the physics, the ones you added leave the scene
    const clear=Q=>{ if(!Q)return; if(GPH.drop)for(const it of Q.th)GPH.drop(it); for(const un of Q.units||[]){ for(const t of un.th){ const i=UI.things.indexOf(t); if(i>=0)UI.things.splice(i,1); } if(un.loose)un.obj.removeFromParent(); } };
    APTS.furnish(APTS.my,()=>{ clear(R); R=null; ROOMK.api=null; build(); });

    /* ---------- each frame: the lamps glow (brighter as the day goes), the room's lights at their brightness, the pieces that move (fridge doors, flames), the sun's beams follow the hour, the sky is only in the windows in the isometric view ---------- */
    let prevShadow=null;
    SYS.add('places',dt=>{ const inn=!!APTS.inReal;
      if(inn&&prevShadow==null&&renderer.shadowMap.type!==THREE.PCFSoftShadowMap){ prevShadow=renderer.shadowMap.type; renderer.shadowMap.type=THREE.PCFSoftShadowMap; scene.traverse(o=>{ if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true; }); }
      else if(!inn&&prevShadow!=null){ renderer.shadowMap.type=prevShadow; prevShadow=null; scene.traverse(o=>{ if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true; }); }
      if(!R)return; if(!R.apt.parent){ clear(R); R=null; ROOMK.api=null; return; }
      const k=Math.min(1,(dt||0)*5), e=CLOCK.elev(), day=cl((e+3)/12,0,1);
      for(const L of R.lamps){ const t=L.on?L.i0*(L.L.userData.k??1)*(1.2-.4*day):0; L.L.intensity+=(t-L.L.intensity)*k; L.sm.emissiveIntensity=L.on?.55:.03; if(L.halo)L.halo.material.opacity=L.on?.32:0; }
      for(const q of R.api.lightsAll()){ const u=q.L.userData; if(!u.lamp)q.L.intensity=(u.on===false?0:1)*(u.i0??0)*(u.k??1); }
      for(const un of R.units)if(un.tick&&!un.gone)un.tick(dt||0);
      R.hemi.intensity=inn?(.42+.25*day)*R.glowK:0;
      for(const b of R.beams)b.uniforms.uOp.value=inn?.16*day:0;
      const iso=!UI.persp&&SHARED.pitch<1.45; ISO.value=iso?1:0;
      const D=SKY.dome&&SKY.dome.material; if(D){ const off=inn&&iso; if(off!==skyOff.on){ skyOff.on=off; D.visible=!off; } } blackOut(); }, '150a-bedroom'); } }
export {ROOMK};
