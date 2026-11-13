// THE CAT IN THE RAINCOAT: NEWSCAT, a grumpy cream cat in a glossy yellow raincoat and hood, sitting on the Market St sidewalk by the subway stairs reading the paper, a tin and spilt papers beside him (a smooth MERCH body on the player's rig, at the low detail); the cat is archived (ARCH), his newsstand stands empty.
import {SHARED, THREE} from './003-shx.js';
import {pos} from './003b-systems.js';
import {LEVEL, MAPG, MODS, SOL, TILE} from './006-map-pre.js';
import {HOMES} from './076-npc-map.js';
import {MERCH} from './111e-merch.js';
const NEWSCAT={};
{ const {SPH,CYL,TOR,BOX,CONE,CAP,grp,mk,paint,C,mix,fbm,hash3}=MERCH.K, PI=Math.PI, V3=THREE.Vector3;
  const FUR='fur:vc', COAT='ivory:#f6d21c', COATD='ivory:#e0b812', BOOT='leather:#151313', PINK='skin:#d9a094';
  const furC=(x,y,z)=>mix(C('#efe2b8'),C('#cdb680'),fbm(x*50,y*50,z*50)*1.1-.25);
  // a printed page: off-white, its columns of grey type and a headline band (u across, v down)
  // a printed page, no words: the masthead's black bar, headlines as dark bars, four columns of grey type lines with rules between, a photo block; each cell one flat colour, a slight curl
  const page=(w,h,cols,rows,seed,curl=0)=>{ const P=[], Cc=[], c=new THREE.Color(), cw=w/cols, rh=h/rows, sub=[.06,.94];
    const at=(u,v)=>{ const x=-w/2+u*w, y=h/2-v*h; return [x,y,curl*Math.sin(u*PI)*w]; };
    const quad=(u0,v0,u1,v1,col)=>{ c.set(col); const a=at(u0,v0), b=at(u1,v0), d=at(u0,v1), e=at(u1,v1); for(const q of [a,d,b,b,d,e]){ P.push(...q); Cc.push(c.r,c.g,c.b); } };
    const PAPER='#ece7d9', TYPE='#a7a297', DARK='#3e3b38', PHOTO=['#77736c','#8f8a82','#5d5a55'];
    quad(0,0,1,.1,PAPER); quad(.08,.02,.92,.075,DARK); quad(0,.1,1,.108,DARK);
    const pc=Math.floor(hash3(seed,1,2)*cols);
    for(let k=0;k<cols;k++){ const u0=k/cols, u1=(k+1)/cols, gu=.08/cols;
      for(let r=Math.ceil(rows*.12);r<rows;r++){ const v0=r/rows, v1=(r+1)/rows, hd=r<rows*.2&&k<2, ph=k===pc&&r>rows*.3&&r<rows*.55;
        quad(u0,v0,u0+gu,v1,PAPER); quad(u1-gu,v0,u1,v1,PAPER);
        if(ph){ quad(u0+gu,v0,u1-gu,v1,PHOTO[(r+k)%3]); continue; }
        const ink=hd?DARK:(r+k*3)%9===0?PAPER:TYPE; quad(u0+gu,v0,u1-gu,v0+(v1-v0)*.55,ink); quad(u0+gu,v0+(v1-v0)*.55,u1-gu,v1,PAPER); }
      if(k)quad(u0-.002,.12,u0+.002,1,'#c9c3b5'); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); g.computeVertexNormals(); return g; };
  const model=()=>{ const sk=MERCH.skel({hipY:.4,waist:.05,neck:.27,shX:.12,shY:.23,upper:.16,fore:.15,hipX:.07,thigh:.2,shin:.19}), {B}=sk;
    /* the head: a broad cream cat's face, puffed cheeks, a pink nose, the downturned mouth, heavy-lidded sulking eyes, whiskers */
    const H=grp(B.head,[0,.12,.01]);
    mk(H,paint(SPH(.12,30,22),furC),FUR,[0,0,0],[0,0,0],[1.08,.92,.95]);
    for(const s of [1,-1]){ mk(H,paint(SPH(.055,14,10),furC),FUR,[s*.052,-.045,.075],[0,0,0],[1.1,.85,.9]);
      mk(H,SPH(.026,12,10),'ivory:#3d2a12',[s*.045,.012,.098],[0,0,0],[1.2,.75,.6]); mk(H,SPH(.012,8,6),'ivory:#050404',[s*.043,.01,.112],[0,0,0],[.7,1,.5]);
      const lid=grp(H,[s*.045,.016,.1],[0,0,s*.28]); mk(lid,paint(SPH(.03,12,8,0,PI*2,0,PI*.5),furC),FUR,[0,-.004,0],[.35,0,0],[1.25,.9,.85]);
      mk(H,paint(SPH(.03,10,8),furC),FUR,[s*.05,.045,.09],[0,0,-s*.5],[1.3,.45,.6]);
      for(const k of [-1,0,1])mk(H,CYL(.0012,.0008,.13,3),'plain:#f4f0e4',[s*.1,-.05+k*.01,.1],[0,s*(.15+k*.06),PI/2-s*.12*k]); }
    mk(H,SPH(.016,10,8),PINK,[0,-.022,.118],[0,0,0],[1.2,.75,.8]); mk(H,paint(SPH(.035,12,8),furC),FUR,[0,-.06,.1],[0,0,0],[1.2,.6,.75]);
    mk(H,CAP(.0025,.03,1,4),'plain:#5a4038',[-.012,-.073,.123],[0,0,PI/2+.35]); mk(H,CAP(.0025,.03,1,4),'plain:#5a4038',[.012,-.073,.123],[0,0,PI/2-.35]);
    /* the ears through the hood, the hood: a glossy yellow rain hood with a seam over the crown, open at the face */
    for(const s of [1,-1]){ const E=grp(H,[s*.1,.09,-.01],[0,0,-s*.75]); mk(E,paint(CONE(.05,.11,8),furC),FUR,[0,.05,0],[0,0,0],[1,1,.5]); mk(E,CONE(.035,.08,8),PINK,[0,.045,.012],[0,0,0],[1,1,.3]); }
    mk(H,SPH(.142,20,14,PI/2+.85,PI*2-1.7,0,PI*.8),COAT,[0,.01,-.008],[0,0,0],[1.06,1,1]);
    mk(H,TOR(.12,.012,4,20),COATD,[0,0,.085],[0,0,0],[1.05,1.1,1]);

    /* the raincoat: a glossy yellow coat, broad at the hem, its collar up; sleeves with turned cuffs; rain trousers and black boots */
    mk(B.torso,MERCH.K.lathe([[.115,-.06],[.13,.05],[.135,.15],[.125,.21],[.09,.25],[.06,.27]],8,20,.88),COAT);
    mk(B.torso,TOR(.07,.022,5,16),COAT,[0,.25,.01],[PI/2,0,0],[1,1.1,1]);
    for(let i=0;i<3;i++)mk(B.torso,SPH(.008,6,4),'ivory:#3a2c10',[0,.18-i*.07,.117]);
    mk(B.hips,MERCH.K.lathe([[.13,.05],[.15,-.02],[.17,-.1],[.18,-.13]],6,22,.9),COAT).userData.skirt=1;
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['upperArm'+n],CYL(.045,.042,.17,10),COAT,[0,-.08,0]); mk(B['upperArm'+n],SPH(.047,10,8),COAT);
      mk(B['forearm'+n],CYL(.042,.05,.15,10),COAT,[0,-.07,0]); mk(B['forearm'+n],TOR(.05,.012,4,12),COATD,[0,-.14,0],[PI/2,0,0]);
      const Hd=B['hand'+n]; mk(Hd,paint(SPH(.03,10,8),furC),FUR,[0,-.03,.004],[0,0,0],[1,1.15,.7]);
      for(let i=0;i<4;i++){ const F=grp(Hd,[(i-1.5)*.013*s,-.055,.008],[.6+i*.05,0,0]); mk(F,paint(CAP(.008,.018,1,5),furC),FUR,[0,-.012,0]); }
      const Th=grp(Hd,[-s*.024,-.03,.016],[.6,0,s*.6]); mk(Th,paint(CAP(.008,.018,1,5),furC),FUR,[0,-.012,0]);
      mk(B['thigh'+n],CYL(.052,.047,.21,10),COAT,[0,-.1,0]); mk(B['shin'+n],CYL(.048,.052,.18,10),COAT,[0,-.08,0]);
      mk(B['shoe'+n],CAP(.04,.07,2,8),BOOT,[0,.035,.03],[PI/2,0,0],[1,1,.85]); }
    /* the paper he reads, open in both paws, tilted up to his face */
    { const P=grp(B.torso,[0,.13,.21],[-.55,0,0]); P.userData.rigid=1; for(const s of [1,-1]){ const pg=grp(P,[s*.004,0,0],[0,-s*.3,0]); mk(pg,page(.16,.24,4,26,s>0?3:5,.04),'plain:vc',[s*.08,0,0]); } mk(P,BOX(.004,.24,.004),'plain:#d8d2c2'); }
    /* beside him on the ledge: the tin with its red and cream label, two spilt papers */
    const TN=grp(B.hips); TN.userData.rigid=1; mk(TN,CYL(.034,.034,.085,12),'metal:#3a3a3a',[.2,-.058,.12]); mk(TN,CYL(.0345,.0345,.05,12),'plain:#d8c8a0',[.2,-.062,.12]); mk(TN,CYL(.0346,.0346,.016,12),'plain:#b8382a',[.2,-.04,.12]);
    for(const [x,z,a,sd] of [[.28,.26,.5,7],[.18,.36,-.3,9]]){ const g=grp(B.hips,[x,-.099,z],[-PI/2,0,a]); g.userData.rigid=1; mk(g,page(.2,.15,3,12,sd),'plain:vc'); }
    return sk; };
  // sitting on the ledge, the paper up, his head bowed to it; when you come near he glances up at you, sour, and back down
  const SIT={root:[0,4.6,0],th:[100,12],sh:[30,8]}, look=N=>{ const s=N.st, d=Math.hypot(pos.x-s.x,pos.z-s.z); let a=0, up=0; if(d<5*TILE&&d>.2*TILE){ a=Math.atan2(pos.x-s.x,pos.z-s.z)-s.hd; a=Math.atan2(Math.sin(a),Math.cos(a)); a=Math.max(-.6,Math.min(.6,a)); up=1; }
    const now=performance.now()/1000, dt=Math.min(.2,now-(N._lt||now)); N._lt=now; const k=Math.min(1,dt*2); N._lk=(N._lk||0)+(a-(N._lk||0))*k; N._up=(N._up||0)+(up-(N._up||0))*k;
    if(Math.abs(N._lk-a)<.004)N._lk=a; if(Math.abs(N._up-up)<.004)N._up=up; return N._lk; };
  const pose=(t,N)=>{ const a=N&&!N.sheetOn?look(N):0, u=N?N._up||0:0;
    return MERCH.pose({...SIT,nod:22-14*u,look:a*180/PI*.8,bend:6,L:{ua:[34,14],fa:[78,-26],th:SIT.th,sh:SIT.sh},R:{ua:[34,14],fa:[78,-26],th:SIT.th,sh:SIT.sh}}); };
  const body=MERCH.add({key:'newscat',label:'THE CAT IN THE RAINCOAT',height:.95,model,size:6.5,q:.3,at:100,idle:pose});
  const N=NEWSCAT.N=body&&body.npc;
  /* ---------- his kiosk: a green New York newsstand at the curb by the subway stairs, its window to the sidewalk; he lives in it, sitting on its ledge reading. No words anywhere: the papers' and magazines' covers are printed bars and photos ---------- */
  const LEDGE=.95, KW=2.55, KH=2.9, KD=1.3;   // metres: the ledge he sits on, the kiosk's width, height, depth (he sits at its middle, the window ahead of him)
  const kiosk=()=>{ const G=new THREE.Group(), GR='plain:#2c5a40', GD='plain:#1f4430', TRIM='plain:#d9b23a', W2=KW/2, back=-.7, front=.55;
    const box=(w,h,d,c,x,y,z,r)=>mk(G,BOX(w,h,d),c,[x,y,z],r||[0,0,0]);
    box(KW,KH,.06,GR,0,KH/2,back); for(const s of [1,-1])box(.06,KH,front-back,GR,s*W2,KH/2,(front+back)/2);   // the back and the sides
    box(KW,LEDGE-.04,.06,GR,0,(LEDGE-.04)/2,front); box(KW+.1,.06,front-back+.22,'wood:#5e4128',0,LEDGE-.03,(front+back)/2+.1);   // the front below the ledge, the ledge
    for(const s of [1,-1])box(.38,KH-LEDGE-.55,.06,GR,s*(W2-.19),LEDGE+(KH-LEDGE-.55)/2,front);   // the pillars beside the window
    box(KW+.06,.42,.07,GD,0,KH-.34,front+.01); box(KW+.08,.035,.08,TRIM,0,KH-.55,front+.02); box(KW+.08,.035,.08,TRIM,0,KH-.13,front+.02);   // the header and its trim
    box(KW+.5,.07,front-back+.6,GD,0,KH+.03,(front+back)/2+.18);   // the roof, overhanging the window
    for(let i=0;i<5;i++)box(.04,.02,.4,'metal:#cfd6c8',-KW*.4+i*KW*.2,KH-.04,front+.22,[-.15,0,0]);   // the strip lights under the overhang
    for(const s of [1,-1])for(let r=0;r<3;r++)box(KW*.36,.03,.28,'wood:#4a3420',s*(W2-KW*.18-.06),1.3+r*.42,back+.17);   // the shelves at the back
    G.updateMatrixWorld(true); const P=[], Cc=[], c=new THREE.Color();
    G.traverse(o=>{ if(!o.isMesh)return; const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); g.applyMatrix4(o.matrixWorld); c.set(String(o.userData.c).split(':').pop()); const q=g.attributes.position; for(let k=0;k<q.count;k++){ P.push(q.getX(k),q.getY(k),q.getZ(k)); Cc.push(c.r,c.g,c.b); } });
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); geo.computeVertexNormals();
    const shell=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.65,metalness:.1,flatShading:true})); shell.castShadow=shell.receiveShadow=true;
    // the papers and magazines: one mesh, each piece a printed page (no words); stacks on the ledge stepping up, the back shelves full, magazines up the pillars and down the sides
    const L=[], put=(g,x,y,z,rx,ry,rz)=>{ g.rotateX(rx||0); g.rotateY(ry||0); g.rotateZ(rz||0); g.translate(x,y,z); L.push(g); };
    const cover=(w,h,seed)=>{ const g=page(w,h,2,10,seed); const col=['#b8342a','#2a5a9a','#d8a830','#3a7a4a','#7a3a7a'][seed%5], cl=g.attributes.color, q=g.attributes.position, cc=new THREE.Color(col);
      for(let k=0;k<q.count;k++)if(q.getY(k)>h*.32)cl.setXYZ(k,cc.r,cc.g,cc.b); return g; };   // a magazine: a coloured band over its picture
    for(const s of [1,-1])for(let k=0;k<3;k++){ const x=s*(.55+k*.27), n=6+((k*5+(s>0?2:0))%7), y0=LEDGE+.005;
      put(new THREE.BoxGeometry(.24,n*.008,.34),x,y0+n*.004,.28-k*.06); L[L.length-1].userData={c:'#ddd6c4'};
      put(page(.24,.34,3,16,k*7+(s>0?1:2)),x,y0+n*.008+.001,.28-k*.06,-PI/2,0,(k-1)*.04); }
    for(const s of [1,-1])for(let r=0;r<3;r++)for(let k=0;k<2;k++)put(page(.24,.3,3,14,r*4+k+(s>0?11:21)),s*(W2-KW*.12-.18*k-.1),1.32+r*.42+.008,back+.17,-PI/2,0,.06*k);
    for(const s of [1,-1])for(let r=0;r<4;r++)put(cover(.16,.22,r+(s>0?1:6)),s*(W2-.19),LEDGE+.2+r*.3,front+.04);
    for(const s of [1,-1])for(let r=0;r<4;r++)for(let k=0;k<3;k++)put(cover(.2,.27,r*3+k+(s>0?2:4)),s*(W2+.04),.5+r*.34+(LEDGE>0?0:0),back+.22+k*.32,0,s*PI/2,0);
    for(let r=0;r<2;r++)for(let k=0;k<6;k++)put(cover(.2,.27,r*6+k+3),-KW*.42+k*.34,.2+r*.36,front+.04);
    const PP=[], PC=[];
    for(const g of L){ const gg=g.index?g.toNonIndexed():g, q=gg.attributes.position, cl=gg.attributes.color, cc=new THREE.Color(g.userData&&g.userData.c||'#ece7d9'); for(let k=0;k<q.count;k++){ PP.push(q.getX(k),q.getY(k),q.getZ(k)); if(cl)PC.push(cl.getX(k),cl.getY(k),cl.getZ(k)); else PC.push(cc.r,cc.g,cc.b); } }
    const pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.Float32BufferAttribute(PP,3)); pg.setAttribute('color',new THREE.Float32BufferAttribute(PC,3)); pg.computeVertexNormals();
    const papers=new THREE.Mesh(pg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,side:THREE.DoubleSide})); papers.castShadow=papers.receiveShadow=true;
    const K=new THREE.Group(); K.add(shell,papers); K.scale.setScalar(TILE); return K; };
  // his spot: at the curb just east of the subway stairs on Market St's north sidewalk, the window to the sidewalk; he sits on the ledge (body.lift)
  { const Wp=LEVEL.places.find(p=>p.id==='subway'), b=HOMES.band&&HOMES.band();
    if(Wp&&b&&new URLSearchParams(location.search).get('sheet')!=='newscat'){ const x=SHARED.BOD.XS(Wp.x1)+(KW/2+2.3)*TILE, z=b.rows[0]+2.4*TILE, hd=Math.PI;
      if(N){ const st=N.st; Object.assign(st,{x,z,to:null,next:null,hold:true,pin:true,hd}); Object.assign(st.home,{x,z,r:0}); N.free=()=>true; body.lift=()=>LEDGE*TILE; }
      const K=NEWSCAT.kiosk=kiosk(); K.position.set(x,MODS.bodega.ground(x,z),z); K.rotation.y=hd; MAPG.bodega.add(K);
      const ex=KW/2*TILE, f=.85*TILE, bk=.75*TILE; SOL.up.push([x-ex,z-f,x+ex,z+bk]); } }
  window.NEWSCATDBG=()=>N?{x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),hd:+N.st.hd.toFixed(2),vis:N.g.visible,tris:body.tris()}:null; }
