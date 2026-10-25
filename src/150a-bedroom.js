// THE BEDROOM: your apartment's bedroom as the owner's picture (25 Oct 2026): cream walls on two sides, dark planks, the bed under a poppy painting, the wardrobe and the tea cabinet, the desk under the curtained window, the lamps and the late sun; every small thing a real body.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, SFX, UI, USE} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {MODS, SYS} from './006-map-pre.js';
import {GPH} from './150-loose.js';
{ const APTS=MODS.apts, B=APTS&&APTS.BED;
  if(B){ const V3=THREE.Vector3, cl=(v,a,b)=>Math.max(a,Math.min(b,v));
    // the picture's sizes are metres; the apartment's art unit is .907 m, so a metre is this many world units
    const UNIT=()=>SHARED.BOD.X(B.x0+1)-SHARED.BOD.X(B.x0), MPU=.907;
    const col=c=>new THREE.Color('rgb('+c.join(',')+')');
    const mat=(c,o={})=>new THREE.MeshStandardMaterial({color:col(c),roughness:.75,metalness:0,...o});
    // a rounded box (metres, centred), its corners and edges smooth
    const rbox=(w,h,d,r=.015,s=4)=>{ r=Math.min(r,w/2-1e-4,h/2-1e-4,d/2-1e-4); const g=new THREE.BoxGeometry(w,h,d,s,s,s), p=g.attributes.position, n=g.attributes.normal, hx=w/2-r, hy=h/2-r, hz=d/2-r, v=new V3(), q=new V3();
      for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); q.set(cl(v.x,-hx,hx),cl(v.y,-hy,hy),cl(v.z,-hz,hz)); v.sub(q); const l=v.length()||1; v.multiplyScalar(1/l); n.setXYZ(i,v.x,v.y,v.z); p.setXYZ(i,q.x+v.x*r,q.y+v.y*r,q.z+v.z*r); }
      p.needsUpdate=true; n.needsUpdate=true; return g; };
    const tex=(w,h,draw,rep)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; if(rep){ t.wrapS=t.wrapT=THREE.RepeatWrapping; } return t; };
    const rnd=(()=>{ let s=91; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; })();

    /* ---------- the textures, painted once ---------- */
    const planks=(Lu,Lv)=>tex(1024,1024,(g,W,H)=>{ const pw=.13, rows=Math.ceil(Lv/pw), ph=H/rows;
      for(let r=0;r<rows;r++){ let u=-rnd()*1.2; while(u<Lu){ const L=.9+rnd()*1.1, k=.78+rnd()*.38, x0=u/Lu*W, x1=(u+L)/Lu*W, y0=r*ph;
          g.fillStyle=`rgb(${136*k|0},${88*k|0},${56*k|0})`; g.fillRect(x0,y0,x1-x0,ph);
          for(let i=0;i<9;i++){ g.strokeStyle=`rgba(${40+rnd()*30|0},${22+rnd()*14|0},${12},${.12+rnd()*.12})`; g.lineWidth=.6+rnd()*1.2; g.beginPath(); const yy=y0+rnd()*ph; g.moveTo(x0,yy); g.bezierCurveTo(x0+(x1-x0)*.3,yy+(rnd()-.5)*ph*.5,x0+(x1-x0)*.7,yy+(rnd()-.5)*ph*.5,x1,yy+(rnd()-.5)*ph*.3); g.stroke(); }
          g.fillStyle='rgba(28,14,8,.85)'; g.fillRect(x1-1.2,y0,1.2,ph); u+=L; }
        g.fillStyle='rgba(26,13,7,.9)'; g.fillRect(0,r*ph,W,1.4); } });
    const poppies=()=>tex(512,330,(g,W,H)=>{ const bg=g.createLinearGradient(0,0,W,H); bg.addColorStop(0,'#b8c070'); bg.addColorStop(.45,'#e6dc92'); bg.addColorStop(1,'#88a456'); g.fillStyle=bg; g.fillRect(0,0,W,H);
      for(let i=0;i<70;i++){ const x=rnd()*W, y=rnd()*H, r=10+rnd()*45, a=.08+rnd()*.18, gg=g.createRadialGradient(x,y,0,x,y,r); const c=rnd()<.5?'232,226,150':'86,120,52'; gg.addColorStop(0,`rgba(${c},${a})`); gg.addColorStop(1,`rgba(${c},0)`); g.fillStyle=gg; g.fillRect(x-r,y-r,2*r,2*r); }
      for(const [x,y,s] of [[300,120,1],[350,95,.9],[330,175,.95],[268,190,.7],[395,150,.6]]){ g.strokeStyle='#4d6a2c'; g.lineWidth=3*s; g.beginPath(); g.moveTo(x,y+18*s); g.bezierCurveTo(x+6,y+80,x-4,y+140,x+8,H); g.stroke();
        for(let k=0;k<5;k++){ const a=k/5*Math.PI*2+.4, px=x+Math.cos(a)*11*s, py=y+Math.sin(a)*8*s; const pg=g.createRadialGradient(px,py,1,px,py,18*s); pg.addColorStop(0,'#ffb030'); pg.addColorStop(.7,'#e8801a'); pg.addColorStop(1,'rgba(200,90,20,0)'); g.fillStyle=pg; g.beginPath(); g.ellipse(px,py,17*s,13*s,a,0,Math.PI*2); g.fill(); }
        g.fillStyle='#3a2a10'; g.beginPath(); g.arc(x,y,4*s,0,7); g.fill(); } });
    const sketch=(seed)=>tex(256,360,(g,W,H)=>{ g.fillStyle='#f6f1e3'; g.fillRect(0,0,W,H); g.strokeStyle='rgba(120,110,90,.5)'; g.lineWidth=1; for(let i=0;i<3;i++){ g.beginPath(); g.moveTo(30,300+i*14); g.lineTo(200,300+i*14); g.stroke(); }
      for(let k=0;k<2+seed;k++){ const x=60+k*55+seed*10, y=90+k*30; g.strokeStyle='#6a8a3a'; g.lineWidth=2; g.beginPath(); g.moveTo(x,y); g.quadraticCurveTo(x-8,y+90,x+4,y+170); g.stroke();
        g.fillStyle='#e8c33a'; for(let p=0;p<6;p++){ const a=p/6*Math.PI*2; g.beginPath(); g.ellipse(x+Math.cos(a)*11,y+Math.sin(a)*11,9,5,a,0,7); g.fill(); } g.fillStyle='#b07a20'; g.beginPath(); g.arc(x,y,5,0,7); g.fill(); } });

    let R=null;   // the built room: its meshes, lights, loose things and wall cuts
    const build=()=>{ '@apts'; const X=SHARED.BOD.X, Z=SHARED.BOD.Z, Yr=SHARED.BOD.Y, U=UNIT(), M=U/MPU, fy=Yr(.15)+.012, cx=X(B.x0), cz=Z(B.y0), Lu=(B.x1-B.x0)*MPU, Lv=(B.y1-B.y0)*MPU, HW=(Yr(B.H)-Yr(0))/M;
      const W=(u,h,v)=>new V3(cx+u*M,fy+h*M,cz+v*M), G=new THREE.Group(); G.name='bedroom'; scene.add(G);
      R={G,M,cx,cz,fy,Lu,Lv,loose:[],lights:[],walls:[],doors:[],lamps:[],th:[]};
      // a part: geometry in metres, placed at (u,h,v) with a turn about the vertical
      const part=(geo,m,u,h,v,ry=0,par=G,cast=true)=>{ const me=new THREE.Mesh(geo,m); me.position.set(u,h,v); me.rotation.y=ry; me.castShadow=cast; me.receiveShadow=true; par.add(me); return me; };
      const thing=(u,h,v,ry=0)=>{ const g=new THREE.Group(); g.position.copy(W(u,h,v)); g.rotation.y=ry; g.scale.setScalar(M); scene.add(g); return g; };
      const room=new THREE.Group(); room.position.set(cx,fy,cz); room.scale.setScalar(M); scene.add(room); R.room=room;
      const solid=(u0,v0,u1,v1,h)=>APTS.solid(B.x0+u0/MPU,B.y0+v0/MPU,B.x0+u1/MPU,B.y0+v1/MPU,h==null?null:h*32.4);

      /* ---------- floor, walls, skirting ---------- */
      const ft=planks(Lu,Lv); part(new THREE.PlaneGeometry(Lu,Lv).rotateX(-Math.PI/2),mat([255,255,255],{map:ft,roughness:.28}),Lu/2,0,Lv/2,0,room,false);
      const WALL=[242,226,192], SK=[92,56,32], wd=.1, WU=1.81, WWD=1.125, S0=1.34, S1=2.3, DU0=3.55, DU1=4.45, DH=2.1;
      const wallMesh=(shape,dep,u,v,ry,nx,nz)=>{ const pl=new THREE.Plane(new V3(0,-1,0),1e6), m=[mat(WALL,{roughness:.92,clippingPlanes:[pl],side:THREE.DoubleSide,shadowSide:THREE.DoubleSide}),mat([24,18,14],{roughness:.9,clippingPlanes:[pl],side:THREE.DoubleSide})],
          me=part(new THREE.ExtrudeGeometry(shape,{depth:dep,bevelEnabled:false}),m,u,0,v,ry,room); R.walls.push({me,pl,nx,nz}); return me; };
      const rect=(w,h,holes=[])=>{ const s=new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(w,0),new THREE.Vector2(w,h),new THREE.Vector2(0,h)]); for(const [a0,a1,b0,b1] of holes)s.holes.push(new THREE.Path([new THREE.Vector2(a0,b0),new THREE.Vector2(a1,b0),new THREE.Vector2(a1,b1),new THREE.Vector2(a0,b1)])); return s; };
      // the window wall (v=0, the room side at v=0), the bed wall (u=0), the side wall (u=Lu), the doorway wall (v=Lv); each knows which way is out (nx,nz) for the cut
      wallMesh(rect(Lu,HW,[[WU-WWD/2,WU+WWD/2,S0,S1]]),wd,0,-wd,0,0,-1);   // along u, from v=-wd to 0
      wallMesh(rect(Lv,HW),wd,0,0,-Math.PI/2,-1,0);                          // along v, from u=-wd to 0
      wallMesh(rect(Lv,HW),wd,Lu+wd,0,-Math.PI/2,1,0);                       // along v, from u=Lu to Lu+wd
      wallMesh(new THREE.Shape([new THREE.Vector2(0,0),new THREE.Vector2(DU0,0),new THREE.Vector2(DU0,DH),new THREE.Vector2(DU1,DH),new THREE.Vector2(DU1,0),new THREE.Vector2(Lu,0),new THREE.Vector2(Lu,HW),new THREE.Vector2(0,HW)]),wd,0,Lv,0,0,1);
      // the walls' dark tops where the isometric view cuts them, as in the picture
      { const cm=new THREE.MeshBasicMaterial({color:0x14100c}), CH=2.85; R.walls[0].cap=part(new THREE.BoxGeometry(Lu+2*wd,.02,wd),cm,Lu/2,CH,-wd/2,0,room,false); R.walls[1].cap=part(new THREE.BoxGeometry(wd,.02,Lv+2*wd),cm,-wd/2,CH,Lv/2,0,room,false);
        R.walls[2].cap=part(new THREE.BoxGeometry(wd,.02,Lv+2*wd),cm,Lu+wd/2,CH,Lv/2,0,room,false); R.walls[3].cap=part(new THREE.BoxGeometry(Lu+2*wd,.02,wd),cm,Lu/2,CH,Lv+wd/2,0,room,false); for(const w of R.walls)w.cap.visible=false; }
      // skirting boards along the room side of each wall
      const sk=mat(SK,{roughness:.6}); part(rbox(Lu,.09,.018,.004),sk,Lu/2,.045,.009,0,room); part(rbox(.018,.09,Lv,.004),sk,.009,.045,Lv/2,0,room); part(rbox(.018,.09,Lv,.004),sk,Lu-.009,.045,Lv/2,0,room);
      part(rbox(DU0,.09,.018,.004),sk,DU0/2,.045,Lv-.009,0,room); part(rbox(Lu-DU1,.09,.018,.004),sk,(Lu+DU1)/2,.045,Lv-.009,0,room);
      solid(-.1,0,0,Lv); solid(Lu,0,Lu+.1,Lv); solid(0,-.1,Lu,0); solid(0,Lv,DU0,Lv+.1); solid(DU1,Lv,Lu,Lv+.1);
      // the window: its frame, sill, two casements of glass, the rod and the sheer curtains tied back
      const WOOD=[150,92,46], wood=mat(WOOD,{roughness:.55}), dark=mat([62,38,26],{roughness:.5});
      part(rbox(WWD+.12,.05,.16,.012),wood,WU,S0-.005,.05,0,room); part(rbox(WWD+.08,.06,.07,.01),wood,WU,S1+.03,.0,0,room);
      for(const s of [-1,1])part(rbox(.06,S1-S0,.07,.01),wood,WU+s*(WWD/2+.0),(S0+S1)/2,0,0,room);
      part(rbox(.035,S1-S0,.05,.008),wood,WU,(S0+S1)/2,-.03,0,room); part(rbox(WWD,.035,.05,.008),wood,WU,S0+(S1-S0)*.62,-.03,0,room);
      const glass=new THREE.MeshStandardMaterial({color:0xfff4e0,roughness:.05,metalness:0,transparent:true,opacity:.14,depthWrite:false});
      part(new THREE.PlaneGeometry(WWD,S1-S0),glass,WU,(S0+S1)/2,-.03,0,room,false);
      part(new THREE.CylinderGeometry(.016,.016,1.95,10).rotateZ(Math.PI/2),wood,WU,2.4,.085,0,room); for(const s of [-1,1])part(new THREE.SphereGeometry(.03,12,8),wood,WU+s*.99,2.4,.085,0,room);
      for(const s of [-1,1])part(rbox(.03,.06,.06,.01),wood,WU+s*.85,2.4,.04,0,room);
      const sheer=new THREE.MeshStandardMaterial({color:col([170,126,84]),roughness:.95,transparent:true,opacity:.72,side:THREE.DoubleSide});
      const curtain=(side)=>{ const nx=22, ny=30, top=2.38, bot=1.08, tie=1.56, g=new THREE.PlaneGeometry(1,1,nx,ny), p=g.attributes.position, outer=WU+side*1.0, inner=WU+side*.4, tieAt=WU+side*.78;
        for(let i=0;i<p.count;i++){ const a=p.getX(i)+.5, b=.5-p.getY(i), h=top-(top-bot)*b, tb=cl((top-h)/(top-tie),0,1), pin=h>tie?Math.sin(tb*Math.PI/2):1-Math.min(1,(tie-h)/(tie-bot))*.55;
          const uTop=outer+(inner-outer)*a, uTie=tieAt+(outer-tieAt)*.15*(1-a)-(tieAt-inner)*.12*a, u=uTop+(uTie-uTop)*(h>tie?pin:pin), fold=Math.sin(a*Math.PI*7+side)*.022*(1-.6*(h>tie?pin:1))+.035*(1-a*.4);
          p.setXYZ(i,u,h,.07+fold+(h<tie?(tie-h)*.04:0)); }
        g.computeVertexNormals(); part(g,sheer,0,0,0,0,room); part(new THREE.TorusGeometry(.035,.008,6,14),wood,tieAt,tie,.09,0,room); };
      curtain(-1); curtain(1);
      // the wall pieces: the poppy painting, the oval mirror
      { const g=new THREE.Group(); g.position.set(.012,1.95,2.66); room.add(g); part(rbox(.024,.6,.9,.008),mat([112,64,30],{roughness:.4}),0,0,0,0,g);
        part(new THREE.PlaneGeometry(.82,.52).rotateY(Math.PI/2),mat([255,255,255],{map:poppies(),roughness:.8}),.014,0,0,0,g,false); }
      { const g=new THREE.Group(); g.position.set(3.42,1.74,.015); room.add(g); const fr=part(new THREE.TorusGeometry(.18,.022,10,40),mat([120,70,36],{roughness:.4}),0,0,0,0,g); fr.scale.set(1,1.5,1);
        const gl=part(new THREE.CircleGeometry(.18,40),mat([128,98,70],{roughness:.12,metalness:.6}),0,0,.004,0,g,false); gl.scale.set(1,1.5,1); }

      /* ---------- the furniture ---------- */
      const W1=[150,88,42], W1T=[189,144,82], wd1=mat(W1,{roughness:.5}), wdT=mat(W1T,{roughness:.45}), knob=mat([40,26,16],{roughness:.3,metalness:.4});
      const door=(par,w,h,u,v,hingeV,open)=>{ const pv=new THREE.Group(); pv.position.set(u,0,hingeV); par.add(pv); const d=part(rbox(.022,h,w,.006),wd1,0,h/2+.06,(v-hingeV),0,pv);
        part(rbox(.012,.012,.11,.004).rotateX(Math.PI/2),knob,.018,h/2+.06+.05,(v-hingeV)+Math.sign(v-hingeV)*(w/2-.06),0,pv); R.doors.push({pv,a:0,to:0,s:Math.sign(v-hingeV)}); return pv; };
      // the wardrobe in the corner, its two doors open to a double click
      { const g=new THREE.Group(); g.position.set(.3,0,.46); room.add(g); part(rbox(.6,2.02,.92,.02),wd1,0,1.07,0,0,g); part(rbox(.58,.06,.9,.01),dark,0,.03,0,0,g); part(rbox(.64,.05,.96,.015),wdT,0,2.1,0,0,g);
        part(rbox(.004,1.9,.004,.001),knob,.302,1.03,0,0,g);
        door(g,.45,1.92,.31,-.23,-.455,-1); door(g,.45,1.92,.31,.23,.455,1); solid(0,0,.6,.92,2.1); R.wardrobe=g; }
      // the low cabinet beside it, with its tea things
      { const g=new THREE.Group(); g.position.set(.225,0,1.42); room.add(g); part(rbox(.45,.76,.88,.015),wd1,0,.4,0,0,g); part(rbox(.43,.04,.86,.008),dark,0,.02,0,0,g); part(rbox(.48,.035,.92,.012),wdT,0,.8,0,0,g);
        door(g,.43,.66,.235,-.215,-.43,-1); door(g,.43,.66,.235,.215,.43,1); solid(0,.98,.45,1.86,.82); R.cabinet=g; }
      // the bed: frame, headboard, mattress, pillow and the rumpled blanket
      { const g=new THREE.Group(); g.position.set(0,0,2.66); room.add(g); const BW=1.42, BL=2.08;
        part(rbox(BL,.38,BW,.03),mat([70,40,24],{roughness:.55}),.06+BL/2,.19,0,0,g); part(rbox(.09,1.18,BW+.08,.05),mat([160,118,76],{roughness:.45}),.045,.59,0,0,g);
        part(rbox(.05,.06,BW+.04,.025),mat([138,98,60],{roughness:.4}),.07,1.15,0,0,g);
        part(rbox(BL-.06,.22,BW-.06,.06),mat([236,214,170],{roughness:.9}),.09+BL/2,.49,0,0,g);
        const pil=part(rbox(.42,.15,.74,.07,6),mat([214,206,196],{roughness:.95}),.32,.67,-.06,.08,g); pil.rotation.z=-.12;
        // the blanket: from the turned-down fold to past the foot, over the sides, rippled where it lies
        const nu=46, nv=34, top=.645, D=.3, L0=.62, Lb=BL+.04-L0+.06, Wb=BW-.02, gb=new THREE.PlaneGeometry(1,1,nu,nv), p=gb.attributes.position;
        for(let i=0;i<p.count;i++){ const a=(p.getX(i)+.5)*(Lb+D), b=(p.getY(i)+.5)*(Wb+2*D)-D, ov=Math.max(0,a-Lb), sv=Math.max(0,-b,b-Wb), dr=Math.hypot(ov,sv),
            on=Math.min(cl(a/.12,0,1),cl((Lb-a)/.18,0,1),cl(b/.18,0,1),cl((Wb-b)/.18,0,1)), rip=(Math.sin(a*6.3+b*2.1)*.024+Math.sin(a*3.1-b*5.2)*.028+Math.sin(a*11+b*9)*.009+Math.sin(a*17-b*3)*.005)*on;
            const roll=.04*Math.exp(-(((a-.07)/.05)**2)), hang=cl((dr-.12)/.15,0,1), wav=Math.sin((ov>sv?b:a)*13)*.03*hang, edge=dr>0?.03*Math.min(1,dr/.04):0;
            const u=L0+Math.min(a,Lb)+ov*.14+(ov>sv?wav:0), v=cl(b,0,Wb)-Wb/2+(b<0?-1:b>Wb?1:0)*(sv*.12+(sv>=ov?wav:0)), h=top+.03+rip+roll-dr*.95-edge+Math.sin(a*9+b*7)*.012*hang;
            p.setXYZ(i,u,h,v); }
        gb.computeVertexNormals(); const bl=part(gb,mat([232,198,140],{roughness:.92,side:THREE.DoubleSide}),0,0,0,0,g);
        solid(0,1.95,BL+.1,3.37,.62); R.bed=g; }
      // the nightstand and its lamp
      { const g=new THREE.Group(); g.position.set(.21,0,3.62); room.add(g); const ns=mat([62,38,26],{roughness:.45}); part(rbox(.42,.72,.44,.015),ns,0,.37,0,0,g); part(rbox(.44,.03,.46,.01),mat([74,46,30],{roughness:.4}),0,.745,0,0,g);
        for(const h of [.2,.5]){ part(rbox(.012,.24,.38,.006),mat([80,50,34],{roughness:.45}),.212,h,0,0,g); part(new THREE.SphereGeometry(.018,10,8),mat([196,150,80],{roughness:.3,metalness:.7}),.23,h,0,0,g); }
        solid(0,3.4,.42,3.84,.76); }
      const lamp=(u,h,v,baseC,shadeC,glassy)=>{ const g=thing(u,h,v), bm=mat(baseC,{roughness:glassy?.15:.45,metalness:glassy?.1:0}), sm=new THREE.MeshStandardMaterial({color:col(shadeC),roughness:.9,side:THREE.DoubleSide,emissive:col([255,222,160]),emissiveIntensity:.32});
        const prof=glassy?[[0,0],[.06,.005],[.085,.05],[.08,.11],[.04,.16],[.018,.2],[.012,.24]]:[[0,0],[.065,.005],[.075,.04],[.055,.12],[.06,.2],[.03,.25],[.012,.27]];
        part(new THREE.LatheGeometry(prof.map(([x,y])=>new THREE.Vector2(x,y)),24),bm,0,0,0,0,g);
        const sh=part(new THREE.CylinderGeometry(.1,.165,.21,28,1,true),sm,0,glassy?.33:.36,0,0,g,false); part(new THREE.CylinderGeometry(.006,.006,.1,6),knob,0,glassy?.24:.27,0,0,g);
        const L=new THREE.PointLight(0xffc27a,1.2,2.8*M,2); L.userData.pool=true; L.position.set(0,glassy?.3:.33,0); g.add(L); L.castShadow=false; const on=CLOCK.elev()<3; R.lamps.push({g,L,sm,on,i0:1.2}); L.intensity=on?1.2:0; R.lights.push(L); return g; };
      R.loose.push([lamp(.21,.76,3.62,[140,104,66],[206,214,168],false),'BEDSIDE LAMP',2]);
      // the snake plant at the end of the bed wall, and a small one on the sill
      const plant=(u,h,v,r,tall,n,leaf)=>{ const g=thing(u,h,v), pot=mat([70,42,28],{roughness:.7});
        part(new THREE.LatheGeometry([[0,0],[r*.75,0],[r*.82,.02],[r,r*1.9],[r*1.04,r*2],[r*.96,r*2.02]].map(([x,y])=>new THREE.Vector2(x,y)),20),pot,0,0,0,0,g);
        part(new THREE.CircleGeometry(r*.95,16).rotateX(-Math.PI/2),mat([42,28,18],{roughness:1}),0,r*1.96,0,0,g,false);
        const lm=mat(leaf,{roughness:.6,side:THREE.DoubleSide});
        for(let k=0;k<n;k++){ const a=k/n*Math.PI*2+rnd()*.6, H=tall*(.6+rnd()*.4), w=r*(.32+rnd()*.18), lg=new THREE.PlaneGeometry(1,1,1,8), p=lg.attributes.position, lean=.12+rnd()*.25;
          for(let i=0;i<p.count;i++){ const t=p.getY(i)+.5, s=p.getX(i), wid=w*(1-Math.pow(t,1.6))*(t<.1?.6+t*4:1); p.setXYZ(i,s*wid,t*H,Math.sin(t*1.5)*lean*H*t); }
          lg.computeVertexNormals(); part(lg,lm,Math.cos(a)*r*.35,r*1.9,Math.sin(a)*r*.35,Math.PI/2-a,g); }
        return g; };
      R.loose.push([plant(.26,0,4.12,.15,.72,13,[46,88,38]),'SNAKE PLANT',4]);
      R.loose.push([plant(WU-.38,S0+.02,.06,.055,.2,9,[70,120,52]),'LITTLE PLANT',.5]);
      // the desk under the window, its chair, papers, pencils and the green lamp
      { const g=new THREE.Group(); g.position.set(WU-.05,0,.32); room.add(g); const lg=mat([70,40,22],{roughness:.5});
        part(rbox(1.16,.04,.6,.012),mat([176,118,70],{roughness:.42}),0,.98,0,0,g); part(rbox(1.04,.08,.5,.008),lg,0,.92,0,0,g);
        for(const [x,z] of [[-.52,-.24],[.52,-.24],[-.52,.24],[.52,.24]]){ const l=part(new THREE.CylinderGeometry(.022,.016,.92,10),lg,x,.46,z,0,g); l.rotation.z=x*.06; l.rotation.x=-z*.08; }
        solid(WU-.63,.02,WU+.53,.62,1.0); }
      R.loose.push([lamp(WU+.3,1.0,.18,[46,92,40],[222,216,160],true),'DESK LAMP',1.5]);
      for(const [du,dv,ry,s] of [[-.28,.36,.25,0],[-.12,.4,-.18,1]]){ const g=thing(WU+du,1.0+.002+s*.003,dv,ry); part(new THREE.PlaneGeometry(.21,.3).rotateX(-Math.PI/2),mat([255,255,255],{map:sketch(s),roughness:.9}),0,0,0,0,g,false); R.loose.push([g,'DRAWING',.1]); }
      { const g=thing(WU+.08,1.0,.12); part(new THREE.CylinderGeometry(.035,.032,.1,16),mat([72,118,64],{roughness:.35}),0,.05,0,0,g);
        for(const [x,z,c] of [[.01,.006,[226,186,60]],[-.012,.01,[60,90,160]],[.004,-.012,[200,60,50]]]){ const p=part(new THREE.CylinderGeometry(.004,.004,.17,6),mat(c,{roughness:.5}),x,.1,z,0,g); p.rotation.z=x*3; p.rotation.x=z*3; }
        R.loose.push([g,'PENCIL CUP',.3]); }
      { const g=thing(WU-.18,1.0,.1,.1); part(rbox(.13,.07,.1,.01),mat([206,176,128],{roughness:.6}),0,.035,0,0,g); R.loose.push([g,'LITTLE BOX',.3]); }
      { const g=thing(WU-.32,0,1.02,.35), cr=mat([236,212,170],{roughness:.55}), lgm=mat([120,80,48],{roughness:.45});
        part(rbox(.44,.05,.43,.02),cr,0,.48,0,0,g); const bk=part(rbox(.42,.42,.035,.02),cr,0,.76,.2,0,g); bk.rotation.x=.14;
        for(const [x,z] of [[-.19,-.18],[.19,-.18],[-.19,.18],[.19,.18]]){ const l=part(new THREE.CylinderGeometry(.013,.011,.46,8),lgm,x*1.05,.23,z*1.05,0,g); l.rotation.z=-x*.12; l.rotation.x=z*.12; }
        R.loose.push([g,'CHAIR',6,true]); R.chair=g; }
      { const g=thing(WU+.78,0,.42); const b=part(new THREE.CylinderGeometry(.14,.11,.3,24,1,true),mat([150,96,62],{roughness:.8,side:THREE.DoubleSide}),0,.15,0,0,g); part(new THREE.CircleGeometry(.11,20).rotateX(-Math.PI/2),mat([110,70,44],{roughness:.8}),0,.005,0,0,g,false);
        part(new THREE.TorusGeometry(.14,.008,6,28).rotateX(Math.PI/2),mat([120,74,46],{roughness:.6}),0,.3,0,0,g); R.loose.push([g,'WASTEBASKET',1]); }
      // the coat rack by the mirror
      { const g=thing(3.64,0,.34), rk=mat([60,32,16],{roughness:.45}); part(new THREE.CylinderGeometry(.018,.024,1.86,10),rk,0,.93,0,0,g);
        for(let k=0;k<3;k++){ const a=k/3*Math.PI*2+.3, l=part(rbox(.32,.025,.03,.01),rk,Math.cos(a)*.14,.03,Math.sin(a)*.14,-a,g); l.rotation.z=0; }
        for(const [h,n,r] of [[1.82,4,.12],[1.4,3,.1]])for(let k=0;k<n;k++){ const a=k/n*Math.PI*2+h, hk=part(new THREE.TorusGeometry(r*.4,.009,6,12,Math.PI*1.2),rk,Math.cos(a)*r*.5,h,Math.sin(a)*r*.5,-a,g); hk.rotation.x=Math.PI/2; hk.rotation.z=Math.PI*.6; }
        part(new THREE.SphereGeometry(.03,10,8),rk,0,1.88,0,0,g); R.loose.push([g,'COAT RACK',6]); }
      // the tea things on the cabinet
      { const g=thing(.22,.82,1.48); part(rbox(.3,.02,.38,.008),mat([196,156,100],{roughness:.4}),0,.01,0,0,g); R.loose.push([g,'TRAY',.8]); }
      { const g=thing(.2,.84,1.52), cer=mat([226,220,208],{roughness:.25});
        part(new THREE.SphereGeometry(.075,24,16),cer,0,.065,0,0,g).scale.set(1,.82,1); part(new THREE.CylinderGeometry(.03,.04,.02,16),cer,0,.13,0,0,g); part(new THREE.SphereGeometry(.014,10,8),cer,0,.15,0,0,g);
        const sp=part(new THREE.CylinderGeometry(.008,.016,.09,10),cer,0,.07,.075,0,g); sp.rotation.x=.9; const hd=part(new THREE.TorusGeometry(.04,.009,8,16,Math.PI),cer,0,.075,-.07,Math.PI/2,g); hd.rotation.z=-Math.PI/2;
        R.loose.push([g,'TEAPOT',1]); }
      for(const [du,dv] of [[.28,1.38],[.12,1.4]]){ const g=thing(du,.84,dv), cer=mat([230,224,212],{roughness:.25}); part(new THREE.CylinderGeometry(.034,.028,.055,18,1,true),cer,0,.028,0,0,g).material.side=THREE.DoubleSide; part(new THREE.CircleGeometry(.028,16).rotateX(-Math.PI/2),cer,0,.002,0,0,g,false); R.loose.push([g,'CUP',.3]); }
      { const g=thing(.22,.82,1.12,.2); part(rbox(.14,.07,.2,.01),mat([172,120,70],{roughness:.55}),0,.035,0,0,g); part(rbox(.145,.012,.205,.004),mat([120,80,46],{roughness:.5}),0,.072,0,0,g); R.loose.push([g,'WOODEN BOX',.5]); }

      /* ---------- the light: the late sun through the window (its frame and everything in its way throw real shadows), the two lamps, a warm fill ---------- */
      const sun=new THREE.SpotLight(0xffd29a,0,9*M,.62,.7,1.4); sun.position.copy(W(WU-.9,3.25,-2.85)); sun.target.position.copy(W(WU+1.1,0,3.6)); sun.castShadow=true; sun.shadow.mapSize.set(1024,1024); sun.shadow.bias=-.0006; sun.shadow.radius=5; sun.shadow.camera.near=.5*M; sun.shadow.camera.far=9*M;
      scene.add(sun); scene.add(sun.target); R.sun=sun; R.lights.push(sun);
      const fill=new THREE.PointLight(0xffd8a8,2.4,9*M,1.1); fill.userData.pool=true; fill.position.copy(W(Lu*.55,2.5,Lv*.5)); scene.add(fill); R.fill=fill; R.lights.push(fill);
      const hemi=new THREE.HemisphereLight(0xffe4bf,0x5a3a22,.0); scene.add(hemi); R.hemi=hemi;
      // the sun's beam in the air, from the window down across the desk to the floor, seen only where it is (the room in front of it hides it)
      { const a=W(WU-WWD/2,S1,0), b=W(WU+WWD/2,S1,0), c=W(WU+WWD/2,S0,0), d=W(WU-WWD/2,S0,0), dir=W(WU+1.1,0,3.6).sub(W(WU-.9,3.25,-2.85)).normalize(), L=3.4*M, e=[a,b,c,d].map(p=>p.clone().addScaledVector(dir,L));
        const pos=[], uv=[]; const quad=(p,q,r,s,t0,t1)=>{ pos.push(...p.toArray(),...q.toArray(),...r.toArray(),...p.toArray(),...r.toArray(),...s.toArray()); uv.push(t0,0,t0,1,t1,1,t0,0,t1,1,t1,0); };
        quad(a,e[0],e[1],b,0,0); quad(d,e[3],e[2],c,0,0); quad(a,e[0],e[3],d,1,1); quad(b,e[1],e[2],c,1,1);
        const bg=new THREE.BufferGeometry(); bg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); bg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
        const bm=new THREE.ShaderMaterial({uniforms:{uOp:{value:0},uC:{value:new THREE.Color(1,.86,.62)}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
          vertexShader:'varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
          fragmentShader:'uniform float uOp; uniform vec3 uC; varying vec2 vU; void main(){ float a=uOp*(1.-vU.y)*smoothstep(0.,.25,vU.y)*.9+uOp*.12*(1.-vU.y); gl_FragColor=vec4(uC*a,a); }'});
        const beam=new THREE.Mesh(bg,bm); beam.renderOrder=7; beam.frustumCulled=false; scene.add(beam); R.beam=bm; }
      // a warm bright patch where the sun lands, so the planks shine as in the picture
      R.floorM=room.children[0].material;

      /* ---------- real bodies, and what a double click does ---------- */
      for(const [g,name,m,seat] of R.loose){ if(GPH.add)R.th.push(GPH.add(g,{name,m}));
        if(seat){ const hb=new THREE.Mesh(new THREE.BoxGeometry(.5,1,.5),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(0,.5,0); g.add(hb); const th={name:'SIT ON THE CHAIR',obj:hb,reach:1.2*M,near:2.2*M,tall:1*M,act:()=>{ if(USE.sit)USE.sit(g,th); }}; UI.thing(th); } }
      const bedHB=new THREE.Mesh(new THREE.BoxGeometry(2.1*M,.7*M,1.45*M),new THREE.MeshBasicMaterial({visible:false})); bedHB.position.copy(W(1.1,.35,2.66)); scene.add(bedHB);
      const bedTh={name:'SIT ON THE BED',obj:bedHB,reach:1.4*M,near:2.6*M,tall:.7*M,act:()=>{ if(USE.sit)USE.sit(R.bed,bedTh); }}; UI.thing(bedTh);
      for(const [g,nm,ds] of [[R.wardrobe,'WARDROBE',R.doors.slice(0,2)],[R.cabinet,'CABINET',R.doors.slice(2,4)]]){ const b=new THREE.Box3().setFromObject(g), hb=new THREE.Mesh(new THREE.BoxGeometry(...b.getSize(new V3()).toArray()),new THREE.MeshBasicMaterial({visible:false})); b.getCenter(hb.position); scene.add(hb);
        const th={name:'OPEN THE '+nm,obj:hb,reach:1.3*M,near:2.4*M,tall:b.max.y-b.min.y,act:()=>{ const open=!ds[0].to; for(const d of ds)d.to=open?1:0; th.name=(open?'CLOSE THE ':'OPEN THE ')+nm; if(SFX)SFX.play('creak',{vol:.4,vary:.2}); }}; UI.thing(th); }
      for(const Lp of R.lamps){ const hb=new THREE.Mesh(new THREE.BoxGeometry(.3,.5,.3),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(0,.25,0); Lp.g.add(hb);
        const th={name:'LAMP: '+(Lp.on?'ON':'OFF'),obj:hb,reach:1.3*M,near:2.6*M,tall:.5*M,act:()=>{ Lp.on=!Lp.on; th.name='LAMP: '+(Lp.on?'ON':'OFF'); if(SFX)SFX.play('click',{vol:.8,vary:.2}); }}; UI.thing(th); }
      window.BEDROOMDBG=()=>({built:!!R,loose:R?R.th.length:0,walls:R?R.walls.map(w=>+w.pl.constant.toFixed(2)):[],sun:R?+R.sun.intensity.toFixed(2):0,doors:R?R.doors.map(d=>+d.a.toFixed(2)):[],lamps:R?R.lamps.map(l=>l.on):[]}); };

    // gone with the apartment: the loose things leave the physics too
    APTS.furnish(APTS.my,()=>{ if(R&&GPH.drop)for(const it of R.th)GPH.drop(it); R=null; build(); });

    /* ---------- each frame: the doors swing, the lamps glow, the sun follows the hour, and in the isometric view the near walls come down to the floor and the far ones stand at the picture's height ---------- */
    let prevShadow=null;
    SYS.add('places',dt=>{ const inn=!!APTS.inReal;
      if(inn&&prevShadow==null&&renderer.shadowMap.type!==THREE.PCFSoftShadowMap){ prevShadow=renderer.shadowMap.type; renderer.shadowMap.type=THREE.PCFSoftShadowMap; scene.traverse(o=>{ if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true; }); }
      else if(!inn&&prevShadow!=null){ renderer.shadowMap.type=prevShadow; prevShadow=null; scene.traverse(o=>{ if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true; }); }
      if(!R||!R.G.parent&&!R.room.parent)return; if(!R.room.parent){ R=null; return; }
      const k=Math.min(1,(dt||0)*5);
      for(const d of R.doors){ d.a+=(d.to-d.a)*k; d.pv.rotation.y=d.s*d.a*1.75; }
      const e=CLOCK.elev(), day=cl((e+3)/12,0,1), dusk=cl(1-Math.abs(e-8)/14,0,1);
      R.sun.intensity=inn?day*(38+30*dusk):0; R.sun.color.setRGB(1,.78+.12*day,.52+.2*day); R.beam.uniforms.uOp.value=inn?.2*day:0;
      for(const L of R.lamps){ const t=L.on?L.i0*(1.1-.5*day):0; L.L.intensity+=(t-L.L.intensity)*k; L.sm.emissiveIntensity=L.on?.32:.03; }
      R.fill.intensity=inn?2+.8*day:0; R.hemi.intensity=inn?.45+.35*day:0;
      const iso=!UI.persp&&SHARED.pitch<1.45, a=SHARED.yaw, sx=Math.sin(a), sz=Math.cos(a), top=R.fy+2.85*R.M, low=R.fy-.005;
      for(const w of R.walls){ const near=sx*w.nx+sz*w.nz>.05; w.pl.constant=!(iso&&inn)?1e6:near?low:top; if(w.cap)w.cap.visible=iso&&inn&&!near; } }, '150a-bedroom'); } }
