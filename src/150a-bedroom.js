// THE APARTMENT ROOM: your apartment as one open room in the owner's cozy picture's style (25 Oct 2026): cream walls under a dark wood crown, wide orange planks on a cream slab, curtained windows onto the live sky, and its things (the checkered bed, the nightstands and lamps, the monstera, the diamond frames, the shelves of plants and books, the desk and chair); every small thing a real body.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, SFX, SKY, UI, USE} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {MODS, SYS} from './006-map-pre.js';
import {GPH} from './150-loose.js';
const ROOMK={parts:[]};   // the room's other parts (the kitchen, 150b) add their builders here
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
    const planks=(Lu,Lv)=>tex(1024,1024,(g,W,H)=>{ const pw=.22, rows=Math.ceil(Lv/pw), ph=H/rows; g.fillStyle='#2a160a'; g.fillRect(0,0,W,H);
      for(let r=0;r<rows;r++){ let u=-(r%3)*.7-rnd()*.3; while(u<Lu){ const L=1.4+rnd()*1.2, k=.84+rnd()*.24, x0=u/Lu*W, x1=(u+L)/Lu*W, y0=r*ph;
          g.fillStyle=`rgb(${198*k|0},${116*k|0},${56*k|0})`; g.fillRect(x0+1.5,y0+1.5,x1-x0-3,ph-3);
          for(let i=0;i<6;i++){ g.strokeStyle=`rgba(120,60,24,${.08+rnd()*.1})`; g.lineWidth=.8+rnd(); g.beginPath(); const yy=y0+3+rnd()*(ph-6); g.moveTo(x0+2,yy); g.bezierCurveTo(x0+(x1-x0)*.35,yy+(rnd()-.5)*ph*.3,x0+(x1-x0)*.65,yy+(rnd()-.5)*ph*.3,x1-2,yy); g.stroke(); }
          const sh=g.createLinearGradient(0,y0,0,y0+ph); sh.addColorStop(0,'rgba(255,220,170,.10)'); sh.addColorStop(1,'rgba(60,24,8,.14)'); g.fillStyle=sh; g.fillRect(x0+1.5,y0+1.5,x1-x0-3,ph-3); u+=L; } } });
    const checker=()=>tex(256,256,(g,W,H)=>{ const n=10, s=W/n; for(let i=0;i<n;i++)for(let j=0;j<n;j++){ g.fillStyle=(i+j)&1?'#e4e2d6':'#2c3430'; g.fillRect(i*s,j*s,s,s); } });
    const glowTex=tex(64,64,(g,W,H)=>{ const r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,'rgba(255,214,150,1)'); r.addColorStop(.35,'rgba(255,190,110,.45)'); r.addColorStop(1,'rgba(255,170,90,0)'); g.fillStyle=r; g.fillRect(0,0,W,H); });
    const ISO={value:0}, skyOff={on:false};
    const blackOut=()=>{ if(skyOff.on&&scene.background&&scene.background.isColor)scene.background.setRGB(0,0,0); };   // as a shop's inside does (ROOMS): after the sky has set the colour this frame

    let R=null;   // the built room: its meshes, lights and loose things
    const build=()=>{ '@apts'; const X=SHARED.BOD.X, Z=SHARED.BOD.Z, Yr=SHARED.BOD.Y, A=APTS.R, WI=APTS.WIN, WPL=APTS.WPL, M=(X(A.x0+1)-X(A.x0))/MPU, fy=Yr(.15)+.012, HW=(Yr(APTS.S||130)-Yr(0))/M;
      const px=z=>z/32.4, Lx=(A.x1-A.x0)*MPU, Ly=(A.y1-A.y0)*MPU, TH=.24, W=(u,h,v)=>new V3(X(A.x0)+u*M,fy+h*M,Z(A.y0)+v*M);
      const apt=new THREE.Group(); apt.position.set(X(A.x0),fy,Z(A.y0)); apt.scale.setScalar(M); scene.add(apt);
      R={apt,M,loose:[],lights:[],lamps:[],th:[]};
      const part=(geo,m,u,h,v,ry=0,par=apt,cast=true)=>{ const me=new THREE.Mesh(geo,m); me.position.set(u,h,v); me.rotation.y=ry; me.castShadow=cast; me.receiveShadow=true; par.add(me); return me; };
      const thing=(u,h,v,ry=0)=>{ const g=new THREE.Group(); g.position.copy(W(u,h,v)); g.rotation.y=ry; g.scale.setScalar(M); scene.add(g); return g; };
      const clip=k=>k?{clippingPlanes:[WPL[k]]}:{};
      // what loose things stand on: a solid up to a top (metres over the floor), a shelf between two heights; the top a hair under the surface, or the physics leaves it out
      const solid=(u0,v0,u1,v1,t)=>APTS.solid(A.x0+u0/MPU,A.y0+v0/MPU,A.x0+u1/MPU,A.y0+v1/MPU,(fy+(t-.002)*M-Yr(0))/(Yr(1)-Yr(0)));
      const shelf=(u0,v0,u1,v1,b,t)=>APTS.shelf&&APTS.shelf(A.x0+u0/MPU,A.y0+v0/MPU,A.x0+u1/MPU,A.y0+v1/MPU,fy+b*M,fy+(t-.002)*M);
      const CREAM=[238,228,198], TRIM=[66,36,20], WOODO=[184,104,50], WOODD=[96,54,30], MINT=[156,214,200];

      /* ---------- the shell: one open room; cream walls, the dark crown and skirting, the glow strips, the planks on a cream slab ---------- */
      part(new THREE.PlaneGeometry(Lx,Ly).rotateX(-Math.PI/2),mat([255,255,255],{map:planks(Lx,Ly),roughness:.55}),Lx/2,0,Ly/2,0,apt,false);
      part(new THREE.BoxGeometry(Lx+2*TH,.3,Ly+2*TH),mat([226,214,186],{roughness:.9}),Lx/2,-.152,Ly/2,0,apt,false);   // the slab the room stands on, its edge seen against the dark
      const rect=(w,h,holes=[])=>{ const sh=new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(w,0),new THREE.Vector2(w,h),new THREE.Vector2(0,h)]); for(const [a0,a1,b0,b1] of holes)sh.holes.push(new THREE.Path([new THREE.Vector2(a0,b0),new THREE.Vector2(a1,b0),new THREE.Vector2(a1,b1),new THREE.Vector2(a0,b1)])); return sh; };
      const WW=1.24*MPU, fw=WI.FWU.map(u=>u*MPU), du=WI.DU*MPU, wz=[1.05,2.35], FD=[du-.48,du+.48,0,2.3], BD=[du-.5,du+.5,0,2.2], SW=[2.79,1.55,2.0,1.1];   // the side window: centre, sill, head, width
      const win=c=>[c-WW/2,c+WW/2,wz[0],wz[1]];
      const wallOf=(k,len,holes,u,v,ry)=>part(new THREE.ExtrudeGeometry(rect(len,HW,holes),{depth:TH,bevelEnabled:false}),[mat(CREAM,{roughness:.95,side:THREE.DoubleSide,shadowSide:THREE.DoubleSide,...clip(k)}),mat([30,22,16],{roughness:.9,side:THREE.DoubleSide,...clip(k)})],u,0,v,ry,apt);
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

      /* ---------- the picture's things, in the window corner: the bed against the side wall between its nightstands, the monstera, the frames, the desk under the shelves ---------- */
      const wd=mat(WOODO,{roughness:.5}), wdk=mat(WOODD,{roughness:.5}), knob=mat([60,40,26],{roughness:.4,metalness:.3});
      const BV=2.62, BW=1.02, BL=2.06;
      { const g=new THREE.Group(); g.position.set(0,0,BV); apt.add(g);
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
        solid(0,BV-BW/2-.05,BL+.08,BV+BW/2+.05,.56); R.bed=g; }
      const nightstand=v=>{ const g=new THREE.Group(); g.position.set(.23,0,v); apt.add(g); part(rbox(.44,.56,.44,.015),wdk,0,.28,0,0,g); part(rbox(.46,.03,.46,.01),wd,0,.575,0,0,g);
        for(const h of [.16,.4]){ part(rbox(.012,.2,.38,.008),mat([110,64,36],{roughness:.5}),.222,h,0,0,g); part(new THREE.SphereGeometry(.016,10,8),knob,.235,h,0,0,g); }
        solid(0,v-.23,.46,v+.23,.59); };
      nightstand(BV-BW/2-.32); nightstand(BV+BW/2+.32);
      // the lamps: a turned wooden foot and a cream bell that glows, a soft halo round it
      const lamp=(u,h,v,s=1)=>{ const g=thing(u,h,v), sm=new THREE.MeshStandardMaterial({color:col([244,234,196]),roughness:.9,side:THREE.DoubleSide,emissive:col([255,214,150]),emissiveIntensity:.55});
        part(new THREE.LatheGeometry([[0,0],[.06,0],[.065,.02],[.035,.05],[.03,.16],[.045,.2],[.015,.22]].map(([x,y])=>new THREE.Vector2(x*s,y*s)),20),mat([196,120,58],{roughness:.45}),0,0,0,0,g);
        part(new THREE.CylinderGeometry(.075*s,.14*s,.17*s,24,1,true),sm,0,.27*s,0,0,g,false);
        const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.32})); halo.scale.set(.5*s,.5*s,1); halo.position.set(0,.26*s,0);
        const L=new THREE.PointLight(0xffb870,2.2,4.2*M,1.8); L.userData.pool=true; L.position.set(0,.24*s,0); g.add(L); R.lamps.push({g,L,sm,halo,on:true,i0:2.2}); R.lights.push(L); return g; };
      R.loose.push([lamp(.23,.59,BV-BW/2-.32),'LAMP',1.5],[lamp(.23,.59,BV+BW/2+.32),'LAMP',1.5]);
      // the monstera by the window corner
      { const g=thing(.42,0,.5), pm=mat([214,180,140],{roughness:.8}), lm=mat([58,138,52],{roughness:.6,side:THREE.DoubleSide}), sm2=mat([70,120,50],{roughness:.6});
        part(new THREE.LatheGeometry([[0,0],[.13,0],[.15,.03],[.17,.3],[.18,.32],[.165,.32]].map(([x,y])=>new THREE.Vector2(x,y)),22),pm,0,0,0,0,g); part(new THREE.CircleGeometry(.16,18).rotateX(-Math.PI/2),mat([60,40,26],{roughness:1}),0,.31,0,0,g,false);
        const leaf=()=>{ const sh=new THREE.Shape(); sh.moveTo(0,0); sh.bezierCurveTo(.16,.04,.2,.22,.0,.34); sh.bezierCurveTo(-.2,.22,-.16,.04,0,0); const gg=new THREE.ShapeGeometry(sh,10), p=gg.attributes.position;
          for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i); const slit=Math.abs(x)>.06&&Math.sin(y*38)>.55?.0:1; p.setZ(i,-x*x*1.2-y*.12); if(!slit)p.setX(i,x*.86); } gg.computeVertexNormals(); return gg; };
        for(let k=0;k<7;k++){ const a=k/7*Math.PI*2+.3, h=.45+rnd()*.45, r=.08+rnd()*.12, st=part(new THREE.CylinderGeometry(.008,.01,h,6),sm2,Math.cos(a)*r*.5,.31+h/2,Math.sin(a)*r*.5,0,g); st.rotation.z=Math.cos(a)*.35; st.rotation.x=-Math.sin(a)*.35;
          const lf=part(leaf(),lm,Math.cos(a)*(r+.1),.31+h,Math.sin(a)*(r+.1),0,g); lf.rotation.set(-1.0+rnd()*.4,Math.PI/2-a,0); lf.scale.setScalar(.9+rnd()*.5); }
        R.loose.push([g,'MONSTERA',5]); }
      // the three diamond frames on the side wall, between the corner and the bed
      for(const [v,h,s] of [[1.2,2.05,.2],[1.2,1.72,.28],[1.2,1.42,.2]]){ const g=new THREE.Group(); g.position.set(.012,h,v); g.rotation.y=Math.PI/2; apt.add(g); const fr=part(rbox(s,s,.025,.006),wdk,0,0,0,0,g,false); fr.rotation.z=Math.PI/4;
        const inr=part(new THREE.PlaneGeometry(s*.62,s*.62),mat([232,222,196],{roughness:.9}),0,0,.014,0,g,false); inr.rotation.z=Math.PI/4; }
      // the desk under two floating shelves of plants and books, its slatted chair, its lamp and its books
      const DU2=fw[0]+1.75;
      { const g=new THREE.Group(); g.position.set(DU2,0,.3); apt.add(g); part(rbox(1.0,.045,.52,.012),wd,0,.76,0,0,g); part(rbox(.4,.14,.48,.01),wd,.28,.665,0,0,g); part(new THREE.SphereGeometry(.014,8,6),knob,.28,.665,.25,0,g);
        for(const [x,z] of [[-.46,-.22],[.46,-.22],[-.46,.22],[.46,.22]])part(rbox(.045,.74,.045,.008),wd,x,.37,z,0,g);
        solid(DU2-.52,0,DU2+.52,.58,.7825); }
      for(const h of [1.42,1.82]){ part(rbox(.86,.035,.22,.008),wdk,DU2+.05,h,.11,0,apt); shelf(DU2-.38,0,DU2+.48,.22,h-.0175,h+.0175); }
      const pot=(u,h,v,green,trail)=>{ const g=thing(u,h,v); part(new THREE.CylinderGeometry(.055,.045,.1,16),mat([240,238,230],{roughness:.6}),0,.05,0,0,g); const lm=mat(green,{roughness:.6,side:THREE.DoubleSide});
        if(trail){ for(let k=0;k<9;k++){ const lf=part(new THREE.CircleGeometry(.035,8),lm,(k%3-1)*.04,.08-k*.06,.02+Math.sin(k)*.02,0,g,false); lf.rotation.set(.3,k,0); lf.userData.soft=1; } }
        else for(let k=0;k<6;k++){ const a=k/6*Math.PI*2, lf=part(new THREE.ConeGeometry(.02,.12,4),lm,Math.cos(a)*.02,.14,Math.sin(a)*.02,0,g); lf.rotation.set(Math.sin(a)*.5,0,-Math.cos(a)*.5); }
        return g; };
      R.loose.push([pot(DU2-.25,1.835,.11,[66,140,60]),'PLANT',.4],[pot(DU2+.05,1.835,.11,[52,120,58]),'PLANT',.4],[pot(DU2+.33,1.835,.11,[74,150,64]),'PLANT',.4],[pot(DU2-.36,1.435,.11,[60,138,54],true),'TRAILING PLANT',.4]);
      { const g=thing(DU2+.18,1.437,.11); [[200,60,50],[60,90,160],[230,190,60],[70,140,90],[150,70,140]].forEach((c,i)=>{ const b=part(rbox(.03,.18+((i*7)%3)*.02,.15,.004),mat(c,{roughness:.6}),i*.034,.1,0,0,g); b.rotation.z=i===4?.25:0; }); R.loose.push([g,'BOOKS',.8]); }
      { const g=thing(DU2-.25,.785,.25,.3); part(rbox(.18,.03,.13,.004),mat([60,90,160],{roughness:.6}),0,.015,0,0,g); part(rbox(.16,.03,.12,.004),mat([200,60,50],{roughness:.6}),.005,.045,0,0,g); R.loose.push([g,'BOOKS',.4]); }
      { const g=thing(DU2+.05,.785,.22,-.2); part(rbox(.08,.004,.1,.002),mat([238,214,90],{roughness:.8}),0,.002,0,0,g); R.loose.push([g,'NOTE',.05]); }
      { const g=thing(DU2+.38,.785,.18), dm=mat([40,36,32],{roughness:.4,metalness:.5}); part(new THREE.CylinderGeometry(.05,.055,.015,16),dm,0,.008,0,0,g); const n=part(new THREE.CylinderGeometry(.006,.006,.26,6),dm,0,.13,0,0,g); n.rotation.z=-.3;
        const sh=new THREE.MeshStandardMaterial({color:col([50,44,40]),roughness:.4,emissive:col([255,200,130]),emissiveIntensity:.0}); part(new THREE.ConeGeometry(.045,.07,14,1,true),sh,.06,.25,0,0,g).rotation.z=-1.2;
        const L=new THREE.PointLight(0xffc98a,.9,2*M,2); L.userData.pool=true; L.position.set(.09,.22,0); g.add(L); R.lamps.push({g,L,sm:sh,on:true,i0:.9}); R.loose.push([g,'DESK LAMP',.8]); }
      { const g=thing(DU2,0,.92,Math.PI+.15), cm=mat(WOODO,{roughness:.5});
        part(rbox(.42,.04,.4,.01),cm,0,.46,0,0,g); for(const [x,z] of [[-.18,-.17],[.18,-.17],[-.18,.17],[.18,.17]])part(rbox(.035,.46,.035,.006),cm,x,.23,z,0,g);
        for(const s of [-1,1])part(rbox(.035,.5,.035,.006),cm,s*.18,.73,-.17,0,g); for(let i=0;i<3;i++)part(rbox(.36,.05,.02,.006),cm,0,.6+i*.13,-.17,0,g);
        R.loose.push([g,'CHAIR',5,true]); R.chair=g; }

      /* ---------- the light: dim and warm all round, the lamps, the late sun through the panes ---------- */
      for(const [u,v] of [[Lx*.25,Ly*.3],[Lx*.3,Ly*.75],[Lx*.72,Ly*.72],[Lx*.72,Ly*.28]]){ const L=new THREE.PointLight(0xffc48a,2.8,9*M,1.2); L.userData.pool=true; L.position.set(X(A.x0)+u*M,fy+(HW-.4)*M,Z(A.y0)+v*M); scene.add(L); R.lights.push(L); }
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

      for(const f of ROOMK.parts)f({apt,R,M,W,part,thing,mat,rbox,col,tex,rnd,cl,V3,Lx,Ly,HW,fw,du,WW,wz,clip,glowTex,solid,shelf});
      /* ---------- real bodies, and what a double click does ---------- */
      for(const [g,name,m,seat] of R.loose){ if(GPH.add)R.th.push(GPH.add(g,{name,m}));
        if(seat){ const hb=new THREE.Mesh(new THREE.BoxGeometry(.5,1,.5),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(0,.5,0); g.add(hb); const th={name:'SIT ON THE CHAIR',obj:hb,reach:1.2*M,near:2.2*M,tall:1*M,act:()=>{ if(USE.sit)USE.sit(g,th); }}; UI.thing(th); } }
      for(const Lp of R.lamps)if(Lp.halo)Lp.g.add(Lp.halo);   // the halos join after the bodies are measured
      const bedHB=new THREE.Mesh(new THREE.BoxGeometry(2.1*M,.6*M,1.1*M),new THREE.MeshBasicMaterial({visible:false})); bedHB.position.copy(W(1.1,.3,BV)); scene.add(bedHB);
      const bedTh={name:'SIT ON THE BED',obj:bedHB,reach:1.4*M,near:2.6*M,tall:.6*M,act:()=>{ if(USE.sit)USE.sit(R.bed,bedTh); }}; UI.thing(bedTh);
      for(const Lp of R.lamps){ const hb=new THREE.Mesh(new THREE.BoxGeometry(.3,.5,.3),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(0,.25,0); Lp.g.add(hb);
        const th={name:'LAMP: '+(Lp.on?'ON':'OFF'),obj:hb,reach:1.3*M,near:2.6*M,tall:.5*M,act:()=>{ Lp.on=!Lp.on; th.name='LAMP: '+(Lp.on?'ON':'OFF'); if(SFX)SFX.play('click',{vol:.8,vary:.2}); }}; UI.thing(th); }
      window.BEDROOMDBG=()=>({built:!!R,Lx,Ly,fw,du,HW,loose:R?R.th.length:0,walls:Object.values(APTS.WPL||{}).map(p=>+p.constant.toFixed(2)),sky:!skyOff.on,lamps:R?R.lamps.map(l=>l.on):[]}); };

    // gone with the apartment: the loose things leave the physics too
    APTS.furnish(APTS.my,()=>{ if(R&&GPH.drop)for(const it of R.th)GPH.drop(it); R=null; build(); });

    /* ---------- each frame: the lamps glow (brighter as the day goes), the sun's beams follow the hour, the sky is only in the windows in the isometric view ---------- */
    let prevShadow=null;
    SYS.add('places',dt=>{ const inn=!!APTS.inReal;
      if(inn&&prevShadow==null&&renderer.shadowMap.type!==THREE.PCFSoftShadowMap){ prevShadow=renderer.shadowMap.type; renderer.shadowMap.type=THREE.PCFSoftShadowMap; scene.traverse(o=>{ if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true; }); }
      else if(!inn&&prevShadow!=null){ renderer.shadowMap.type=prevShadow; prevShadow=null; scene.traverse(o=>{ if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true; }); }
      if(!R||!R.apt.parent){ R=null; return; }
      const k=Math.min(1,(dt||0)*5), e=CLOCK.elev(), day=cl((e+3)/12,0,1);
      for(const L of R.lamps){ const t=L.on?L.i0*(1.2-.4*day):0; L.L.intensity+=(t-L.L.intensity)*k; L.sm.emissiveIntensity=L.on?.55:.03; if(L.halo)L.halo.material.opacity=L.on?.32:0; }
      R.hemi.intensity=inn?.42+.25*day:0;
      for(const b of R.beams)b.uniforms.uOp.value=inn?.16*day:0;
      const iso=!UI.persp&&SHARED.pitch<1.45; ISO.value=iso?1:0;
      const D=SKY.dome&&SKY.dome.material; if(D){ const off=inn&&iso; if(off!==skyOff.on){ skyOff.on=off; D.visible=!off; } } blackOut(); }, '150a-bedroom'); } }
export {ROOMK};
