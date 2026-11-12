// THE LOFT: No. 4's flat, everyone's for now (owner, 12 Nov 2026, of a photo, then of the room itself: "raise the 1st story height by 25%", "remove all the beams", "remove hang things from ceiling", "only 1" post): a tall room, a walnut upper floor along the blank wall, a second deck across the front behind glass on one post, the stair down from the landing by your door, the front wall in brick, tracks of spots flat on the ceiling, downlights under the deck, a radiator. The upper floor is walked (APTS.loftY) and furnished (pieces up there are solid only while you are: APTS.solidHi); its steel, woodwork and plaster are yours to choose in DECORATE (R.loftSet). R.loftDress lays the flat's own pieces out over both floors and hangs its rugs and pictures.
import {SHARED, THREE} from './003-shx.js';
import {MODS} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
{ const APTS=MODS.apts;
  if(APTS&&APTS.R&&APTS.LOFT)ROOMK.parts.push(c=>{ '@apts'; const {apt,R,M,Lx,Ly,HW,part,mat,solid,shelf}=c, A=APTS.R, MPU=.907, V3=THREE.Vector3;
    const MH=4.375, mx=Lx-3.9, SW=1.1, sv0=2.55, sv1=8.3, N=24, ST=MH/N, RUN=(sv1-sv0)/(N-1), DK={u0:mx-3.2,v1:2.5}, RH=1.02;
    // what you can choose (DECORATE's LOFT tab): the steel (rails, the post, the tracks), the woodwork (stair treads, the decks' edges), the plaster (the decks' undersides, the stair's flight)
    const OPTS=R.loftOpts={steel:{n:'RAILS AND STEEL',o:{black:['BLACK',[22,22,24]],white:['WHITE',[236,236,232]],brass:['BRASS',[176,138,70]],bronze:['BRONZE',[92,66,44]],red:['OXIDE RED',[130,44,34]]}},
      wood:{n:'WOODWORK',o:{walnut:['WALNUT',[92,58,36]],oak:['OAK',[176,132,84]],ebony:['EBONY',[34,26,22]],cherry:['CHERRY',[128,56,36]],white:['WHITE',[232,228,220]]}},
      body:{n:'PLASTER',o:{white:['WHITE',[234,232,226]],cream:['CREAM',[232,220,196]],sage:['SAGE',[176,196,166]],charcoal:['CHARCOAL',[70,70,76]],concrete:['CONCRETE',[150,150,148]]}}};
    const WAL=['wood',255], WAL2=['wood',205], WHT=['body',255], STL=['steel',255];
    // many shapes in their own colours as one mesh: [geometry, rgb or [group, shade], x,y,z, rx,ry,rz]; each says which way its grain runs (its longest side)
    const merge=list=>{ let n=0; const ONE=new V3(1,1,1), G=list.map(([q,col,x,y,z,rx=0,ry=0,rz=0])=>{ const a=q.index?q.toNonIndexed():q; a.applyMatrix4(new THREE.Matrix4().compose(new V3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),ONE)); a.computeVertexNormals(); a.computeBoundingBox(); const sz=a.boundingBox.getSize(new V3()); n+=a.attributes.position.count; return [a,col,sz.x>=sz.y&&sz.x>=sz.z?0:sz.y>=sz.z?1:2]; });
      const P=new Float32Array(n*3), Nn=new Float32Array(n*3), C=new Float32Array(n*3), Gr=new Float32Array(n*3), cc=new THREE.Color(); let o=0;
      for(const [a,col0,ax] of G){ const col=typeof col0[0]==='string'?[col0[1],col0[1],col0[1]]:col0, k=a.attributes.position.count; P.set(a.attributes.position.array,o*3); Nn.set(a.attributes.normal.array,o*3); cc.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(let i=0;i<k;i++){ C[(o+i)*3]=cc.r; C[(o+i)*3+1]=cc.g; C[(o+i)*3+2]=cc.b; Gr[(o+i)*3+ax]=1; } o+=k; a.dispose(); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('normal',new THREE.BufferAttribute(Nn,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.setAttribute('aGr',new THREE.BufferAttribute(Gr,3)); return g; };
    const B=(w,h,d)=>new THREE.BoxGeometry(w,h,d), hs=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
    const vc=(o={})=>new THREE.MeshLambertMaterial({vertexColors:true,...o}), L=[];
    // sawn wood: long streaks down the grain, bands across it, a knot here and there (drawn from where the surface is, so it needs no picture)
    const grain=(m,k)=>{ m.onBeforeCompile=sh=>{ sh.vertexShader='attribute vec3 aGr; varying vec3 vGp, vGa;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vGp=position; vGa=aGr;');
        sh.fragmentShader='varying vec3 vGp, vGa;\nfloat gH(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }\nfloat gN(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(mix(gH(i),gH(i+vec3(1,0,0)),f.x),mix(gH(i+vec3(0,1,0)),gH(i+vec3(1,1,0)),f.x),f.y),mix(mix(gH(i+vec3(0,0,1)),gH(i+vec3(1,0,1)),f.x),mix(gH(i+vec3(0,1,1)),gH(i+vec3(1,1,1)),f.x),f.y),f.z); }\n'+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        { vec3 ax=normalize(vGa+1e-4), al=ax*dot(vGp,ax), ac=vGp-al; vec3 q=ac*${k.toFixed(1)}+al*1.4; float a=gN(q), b=gN(q*3.1+7.), kn=smoothstep(.82,.95,gN(ac*6.+al*2.3+3.)); diffuseColor.rgb*=(.74+.36*a+.14*b)*(1.-.35*kn); }`); };
      m.customProgramCacheKey=()=>'loftgrain'+k; return m; };
    const MT=R.loftM={body:[vc({emissive:0x34302a})],wood:[grain(vc(),38)],steel:[vc({side:THREE.DoubleSide})]}, byG=list=>{ const o={}; for(const e of list)(o[e[1][0]]||(o[e[1][0]]=[])).push(e); return o; };
    R.loftK={steel:'black',wood:'walnut',body:'white'}; R.loftSet=(k,v)=>{ const O=OPTS[k]; if(!O||!O.o[v])return; R.loftK[k]=v; const c=O.o[v][1]; for(const m of MT[k])m.color.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace); };
    const box=(u0,h0,v0,u1,h1,v1,col)=>L.push([B(u1-u0,h1-h0,v1-v0),col,(u0+u1)/2,(h0+h1)/2,(v0+v1)/2]);

    /* ---------- the upper floor: the long deck by the blank wall, the deck across the front, the landing; white under, walnut edges, the room's boards on top (no two faces in one place: the slab stops under the boards, the edge boards stand outside it) ---------- */
    const DECKS=[[mx,0,Lx,Ly],[DK.u0,0,mx,DK.v1],[mx-SW,sv1,mx,Ly]];
    for(const [u0,v0,u1,v1] of DECKS){ box(u0+.004,MH-.2,v0+.004,u1-.004,MH-.05,v1-.004,WHT); shelf(u0,v0,u1,v1,MH-.2,MH); }
    for(const [u0,v0,u1,v1] of [[mx-.035,DK.v1+.035,mx,sv1],[DK.u0-.035,DK.v1,mx,DK.v1+.035],[DK.u0-.035,0,DK.u0,DK.v1],[mx-SW-.035,sv1,mx-SW,Ly],[mx-SW,sv1-.035,mx-.035,sv1]])box(u0,MH-.34,v0,u1,MH+.02,v1,WAL2);
    { const fm=mat([255,255,255],{}); R.loftFloor=fm;   // its boards are one of the room's floors (A.floor(k,true)), laid as the room's own are
      for(const [u0,v0,u1,v1] of DECKS){ const w=u1-u0, d=v1-v0, g=new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2), uv=g.attributes.uv; for(let i=0;i<uv.count;i++){ const u=u0+uv.getX(i)*w, v=v0+(1-uv.getY(i))*d; uv.setXY(i,u/Lx,1-v/Ly); } part(g,fm,(u0+u1)/2,MH,(v0+v1)/2,0,apt,false); } }
    { const u=DK.u0+.07, v=DK.v1-.07; box(u-.05,0,v-.05,u+.05,MH-.2,v+.05,STL); box(u-.11,0,v-.11,u+.11,.02,v+.11,STL); solid(u-.08,v-.08,u+.08,v+.08,MH-.2); }   // the front deck's one post, on its foot plate

    /* ---------- the stair: one closed white flight (its stepped side a single face), a walnut tread and riser to every step, up to the landing; a plain white closet under the landing ---------- */
    { const sh=new THREE.Shape(); sh.moveTo(sv0,0); for(let i=0;i<N-1;i++){ sh.lineTo(sv0+i*RUN,(i+1)*ST-.05); sh.lineTo(sv0+(i+1)*RUN,(i+1)*ST-.05); } sh.lineTo(sv1,0); sh.closePath();
      const g=new THREE.ExtrudeGeometry(sh,{depth:SW-.04,bevelEnabled:false}).toNonIndexed(), p=g.attributes.position; for(let i=0;i<p.count;i++){ const v=p.getX(i), h=p.getY(i), u=p.getZ(i); p.setXYZ(i,u,h,v); }
      for(let i=0;i<p.count;i+=3){ const x=p.getX(i+1), y=p.getY(i+1), z=p.getZ(i+1); p.setXYZ(i+1,p.getX(i+2),p.getY(i+2),p.getZ(i+2)); p.setXYZ(i+2,x,y,z); } g.deleteAttribute('uv'); g.deleteAttribute('normal'); L.push([g,WHT,mx-SW+.02,0,0]);
      for(let i=0;i<N-1;i++){ const h=(i+1)*ST, v=sv0+i*RUN; box(mx-SW,h-.045,v-.03,mx-.035,h,v+RUN-.016,WAL); box(mx-SW+.01,h-ST,v-.016,mx-.045,h-.045,v-.002,WAL2); } }
    box(mx-SW,0,sv1+.002,mx-.004,MH-.2,Ly,WHT); box(mx-SW-.02,0,sv1,mx-SW,.09,Ly,WAL2);
    solid(mx-SW-.06,sv0,mx-SW,sv1,MH); solid(mx-.03,sv0,mx+.03,sv1,MH); solid(mx-SW,sv1,mx,Ly,MH-.2);

    /* ---------- the rails: black steel, six bars between posts (level along the decks, raked up the stair); glass round the front deck ---------- */
    const rail=(u0,v0,h0,u1,v1,h1)=>{ const len=Math.hypot(u1-u0,v1-v0), n=Math.max(1,Math.round(len/1.3)), ry=Math.atan2(u1-u0,v1-v0), sl=Math.hypot(len,h1-h0), rx=-Math.atan2(h1-h0,len);
      for(let i=0;i<=n;i++){ const t=i/n, u=u0+(u1-u0)*t, v=v0+(v1-v0)*t, h=h0+(h1-h0)*t; L.push([B(.045,RH,.045),STL,u,h+RH/2,v]); }
      for(let k=0;k<6;k++){ const y=(k===5?RH-.01:.14+k*.165); L.push([B(k===5?.05:.018,k===5?.03:.018,sl),STL,(u0+u1)/2,(h0+h1)/2+y,(v0+v1)/2,rx,ry,0]); } };
    rail(mx-.06,DK.v1+.1,MH,mx-.06,sv1,MH); rail(mx-SW,sv0,ST,mx-SW,sv1,MH); rail(mx-SW,sv1,MH,mx-SW,Ly-.05,MH);
    { const gm=APTS.glassMat?APTS.glassMat({opacity:.2}):mat([190,210,220],{transparent:true,opacity:.25});
      for(const [u0,v0,u1,v1] of [[DK.u0,DK.v1,mx-SW,DK.v1],[DK.u0,.04,DK.u0,DK.v1]]){ const len=Math.hypot(u1-u0,v1-v0), ry=u0===u1?Math.PI/2:0; part(new THREE.PlaneGeometry(len,RH-.08),gm,(u0+u1)/2,MH+RH/2+.03,(v0+v1)/2,ry,apt,false).userData.soft=1;
        L.push([B(u1-u0+.05,.06,v1-v0+.05),STL,(u0+u1)/2,MH+.05,(v0+v1)/2],[B(u1-u0+.03,.025,v1-v0+.03),STL,(u0+u1)/2,MH+RH,(v0+v1)/2]); }
      rail(mx-SW,DK.v1,MH,mx-.06,DK.v1,MH); }

    /* ---------- a cast-iron radiator under the window; the tracks of spots flat on the ceiling, one over the room, one over the upper floor; downlights under the deck ---------- */
    const FX=[], lens=[], spots=[];
    { const ru=2.95, c0=[206,202,192]; for(let i=0;i<14;i++)FX.push([B(.045,.62,.15),c0,ru-.46+i*.07,.43,.14]); FX.push([B(1.0,.03,.13),c0,ru,.76,.14],[B(1.0,.04,.13),c0,ru,.12,.14],[new THREE.CylinderGeometry(.02,.02,HW-.1,8),[176,120,70],ru+.62,HW/2,.09]); solid(ru-.52,.04,ru+.52,.24,.78); }
    const head=(u,v,yaw,pitch,real)=>{ const y=HW-.03, dy=Math.sin(pitch), dh=Math.cos(pitch), du=Math.sin(yaw)*dh, dv=Math.cos(yaw)*dh; L.push([new THREE.CylinderGeometry(.045,.06,.15,12),STL,u+du*.05,y-.07-dy*.05,v+dv*.05,...(Math.abs(Math.sin(yaw))>.5?[0,0,-Math.sign(Math.sin(yaw))*(Math.PI/2+pitch)]:[Math.sign(Math.cos(yaw))*(Math.PI/2+pitch),0,0])]);
      lens.push([u+du*.13,y-.07-dy*.13,v+dv*.13,yaw,pitch]); if(real)spots.push([u+du*.13,y-.07-dy*.13,v+dv*.13,du,-dy,dv,yaw,pitch]); };
    { const v=5, u0=1.4, u1=mx-1.6; L.push([B(u1-u0,.03,.045),STL,(u0+u1)/2,HW-.015,v]); for(let i=0;i<5;i++)head(u0+.3+(u1-u0-.6)*i/4,v,i%2?0:Math.PI,1.2,i===2); }
    { const u=mx+1.5; L.push([B(.045,.03,Ly-2.4),STL,u,HW-.015,Ly/2]); for(let i=0;i<5;i++)head(u,1.6+(Ly-3.2)*i/4,Math.PI/2,1.05,i===2); }
    { const Gs=byG(L); for(const k in Gs)part(merge(Gs[k]),MT[k][0],0,0,0,0,apt); part(merge(FX),vc(),0,0,0,0,apt); }
    { const lm=new THREE.MeshBasicMaterial({color:0xfff0d0}); for(const [u,y,v,yaw,pitch] of lens){ const m=part(new THREE.CircleGeometry(.042,12),lm,u,y,v,0,apt,false); m.rotation.order='YXZ'; m.rotation.set(pitch,yaw,0); m.userData.soft=1; }
      for(const v of [1.4,3.3,5.2,7.1,9]){ const m=part(new THREE.CircleGeometry(.07,14).rotateX(Math.PI/2),lm,mx+1.9,MH-.21,v,0,apt,false); m.userData.soft=1; }
      spots.forEach(([u,y,v,dx,dy,dz,yaw,pitch],i)=>{ const Lt=new THREE.SpotLight(0xfff2e0,6,14*M,.7,.55,1.6); Lt.userData.pool=true; Lt.userData.i0=6; Lt.userData.on=true; Lt.userData.yaw=yaw*180/Math.PI; Lt.userData.pitch=pitch*180/Math.PI; Lt.userData.angle=40; Lt.position.set(u,y,v); Lt.target.position.set(u+dx,y+dy,v+dz); apt.add(Lt); apt.add(Lt.target); R.ceil.push({id:'loft-track-'+(i+1),name:i?'UPSTAIRS TRACK':'ROOM TRACK',L:Lt}); });
      { const Lt=new THREE.PointLight(0xffd9a8,2.4,7*M,1.8); Lt.userData.pool=true; Lt.userData.i0=2.4; Lt.userData.on=true; Lt.position.set(mx+1.9,MH-.6,5.2); apt.add(Lt); R.ceil.push({id:'loft-den',name:'DEN DOWNLIGHTS',L:Lt}); } }

    /* ---------- walking it: the height under you up there, and what is solid on the upper floor ---------- */
    const onDeck=(u,v)=>DECKS.some(([u0,v0,u1,v1])=>u>=u0&&u<=u1&&v>=v0&&v<=v1), ax=apt.position.x, az=apt.position.z, fy=R.fy;
    APTS.loftY=(x,z)=>{ const u=(x-ax)/M, v=(z-az)/M, h=(SHARED.py-fy)/M; if(u>mx-SW&&u<mx&&v>sv0-.02&&v<sv1){ const hs_=Math.min(N-1,Math.max(1,Math.ceil((v-sv0)/RUN+.001)))*ST; return h>hs_-.75?fy+hs_*M:null; }
      return onDeck(u,v)&&h>MH-.75?fy+MH*M:null; };
    APTS.loftUp=()=>(SHARED.py-fy)/M>MH-.55;
    const hi=(u0,v0,u1,v1)=>APTS.solidHi(A.x0+u0/MPU,A.y0+v0/MPU,A.x0+u1/MPU,A.y0+v1/MPU), T=.08;
    hi(-.4,-.4,Lx+.4,0); hi(-.4,Ly,Lx+.4,Ly+.4); hi(-.4,0,0,Ly); hi(Lx,0,Lx+.4,Ly);                                       // the walls
    hi(mx-T,DK.v1,mx,sv1); hi(mx-SW-T,sv0,mx-SW,Ly); hi(DK.u0,DK.v1,mx,DK.v1+T); hi(DK.u0-T,0,DK.u0,DK.v1+T);              // the rails
    R.loft={MH,mx,SW,sv0,sv1,N,DECKS,top:[mx-SW/2,sv1+1.0],foot:[mx-SW/2,sv0-.7],blocks:[[mx-SW-.06,sv0-.6,mx+.03,sv1,'THE STAIR'],[mx-SW,sv1,mx,Ly,'THE CLOSET'],[DK.u0,DK.v1-.16,DK.u0+.16,DK.v1,'THE POST'],[2.43,0,3.47,.26,'THE RADIATOR']],lib:Lx+1};
    for(const k in R.loftK)R.loftSet(k,R.loftK[k]);

    /* ---------- the flat laid out (owner, 12 Nov 2026: "space things out better use the empty space, decorate with rugs, hanging photos, frames", "move these things to upstars"): the study and the bookcase upstairs, the den under the deck, a sitting corner in the tall room; rugs and pictures of the game's own; nothing hangs from the ceiling ---------- */
    R.LOFTV=2; R.loftDress=A2=>{ for(const un of A2.units())if(un.mount!=='ceil'){ const t=A2.getT(un); if(t.h>=3.4&&t.h<7)A2.setT(un,{...t,h:t.h+MH-3.5}); }   // what stood on the upper floor when it was lower comes up with it
      const U=k=>A2.units().filter(u=>u.kind===k&&!u.added), set=(k,t,i=0)=>{ const un=U(k)[i]; if(!un)return; if(un.gone)A2.restore(un); A2.setT(un,{...A2.getT(un),...t}); };
      set('BOOKSHELF',{v:5.3,h:MH}); set('WRITING DESK',{u:9.1,h:MH}); set('FLOWERING PLANT',{u:8.7,h:MH+.72}); set('HERB POT',{u:9.6,h:MH+.72}); set('LAB DESK',{u:10.9,h:MH}); set('LAB STOOL',{u:10.7,v:9.1,h:MH});
      set('TELESCOPE',{u:5.6,v:1.2,h:MH}); set('EARTH GLOBE',{u:9.0,v:.9,h:MH}); set('GLOBE TABLE',{u:Lx-.5,v:1.6,h:MH,ry:Math.PI}); set('FERN STAND',{u:8.5,v:8.6,h:MH});
      set('FISH TANK',{u:Lx-.66,v:3.2,h:0,ry:Math.PI/2}); set('OLIVE TREE',{u:.9,v:.9,h:0}); set('FLOOR PLANT',{u:4.7,v:9.7,h:0}); for(const un of U('HANGING PLANT'))if(!un.gone)A2.remove(un);
      const W={Ww:[.03,Math.PI/2],We:[Lx-.03,-Math.PI/2],Wb:[Ly-.03,Math.PI]}, K=A2.kinds(), put=(id,kind,t)=>{ if(!K[kind]||A2.units().some(u=>u.id===id))return; const un=A2.spawn(kind,{s:1,ry:0,...t},id); if(un)un.paid=0; };
      put('loft-rug-1','g:patterned rug, purple and gold',{u:3.3,h:0,v:5.4}); put('loft-rug-2','g:red rug',{u:9.7,h:MH,v:8.2}); put('loft-rug-3','MAUVE RUG',{u:6.2,h:MH,v:1.3});
      put('loft-sofa','g:sofa',{u:3.3,h:0,v:7.2}); put('loft-lamp','g:floor lamp',{u:1.4,h:0,v:7.3});
      put('loft-art-1','g:portrait in a red frame',{u:W.Ww[0],h:1.8,v:5.0,ry:W.Ww[1]}); put('loft-art-2','g:framed flower print',{u:W.Ww[0],h:1.75,v:6.4,ry:W.Ww[1]}); put('loft-art-3','g:poster: night painting',{u:2.4,h:1.9,v:W.Wb[0],ry:W.Wb[1]});
      put('loft-art-4','g:round mirror',{u:4.3,h:1.7,v:W.Wb[0],ry:W.Wb[1]}); put('loft-art-5','g:poster: koi night',{u:W.We[0],h:MH+1.75,v:2.6,ry:W.We[1]}); put('loft-art-6','g:framed flower print',{u:W.We[0],h:MH+1.7,v:8.0,ry:W.We[1]}); put('loft-art-7','g:wall clock',{u:9.8,h:MH+2.1,v:W.Wb[0],ry:W.Wb[1]}); }; });
  // the loft's own start: light oak below, walnut above, white walls with the front one in brick (yours to change in DECORATE); its colours and which laying-out it has had are kept with your layout
  if(APTS&&APTS.R&&APTS.LOFT){ ROOMK.built.push(A=>{ '@apts'; if(!A.R.loft)return; A.wall('white','all'); A.wall('brick','Wf'); A.floor('oak'); A.floor('walnut',true); });
    ROOMK.keep.push({out:(L,A)=>{ if(A&&A.R.loft){ L.loft={...A.R.loftK}; if(A.R.loftV)L.loftV=A.R.loftV; } },in:(L,A)=>{ if(A&&A.R.loft){ if(L.loft)for(const k in L.loft)A.R.loftSet(k,L.loft[k]); A.R.loftV=L.loftV||0; } }}); }
  window.LOFTDBG=()=>{ const A=ROOMK.api, R=A&&A.R, Lf=R&&R.loft; if(!Lf)return null; const W=(u,h,v)=>A.W(u,h,v); return {MH:Lf.MH,top:W(Lf.top[0],Lf.MH,Lf.top[1]).toArray(),foot:W(Lf.foot[0],0,Lf.foot[1]).toArray(),deck:W(Lf.mx+1.6,Lf.MH,A.Ly/2).toArray(),h:(SHARED.py-R.fy)/A.M,up:!!(APTS.loftUp&&APTS.loftUp()),HW:A.HW,M:A.M,fy:R.fy}; }; }
