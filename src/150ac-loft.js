// THE LOFT: No. 4's flat, everyone's for now (owner, 12 Nov 2026, of a photo, then of the room itself: "raise the 1st story height by 25%", "remove all the beams", "remove hang things from ceiling", "only 1" post): a tall room, a walnut upper floor along the blank wall, a second deck across the front behind glass (no post: owner, 13 Nov 2026), the stair up the left wall and a gallery along the back wall over your door (the owner's pick C of mockups/loft-stairs.html), the front wall in brick, tracks of spots flat on the ceiling, downlights under the deck, a radiator. The upper floor is walked (APTS.loftY) and furnished (pieces up there are solid only while you are: APTS.solidHi); its steel, woodwork and plaster are yours to choose in DECORATE (R.loftSet). R.loftDress lays the flat's own pieces out over both floors and hangs its rugs and pictures.
import {SHARED, THREE} from './003-shx.js';
import {pos, UI} from './003b-systems.js';
import {MODS, SYS} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
{ const APTS=MODS.apts;
  if(APTS&&APTS.R&&APTS.LOFT)ROOMK.parts.push(c=>{ '@apts'; const {apt,R,M,Lx,Ly,HW,part,mat,solid,shelf}=c, A=APTS.R, MPU=.907, V3=THREE.Vector3;
    const MH=APTS.MH||4.375, mx=Lx-3.9, SW=1.1, su0=.15, su1=su0+SW, sv0=1.0, sv1=6.75, N=24, ST=MH/N, RUN=(sv1-sv0)/(N-1), GV=Ly-1.15, DK={u0:mx-3.2,v1:2.5}, RH=1.02;   // the stair climbs the left (window) wall toward the back; a gallery along the back wall, over your door, joins it to the upper floor (owner, 12 Nov 2026, of mockups/loft-stairs.html: "C")
    // what you can choose (DECORATE's LOFT tab): the steel (rails, the tracks), the woodwork (stair treads, the decks' edges), the plaster (the decks' undersides, the stair's flight)
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
    const UPL=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6), vc=(o={})=>new THREE.MeshLambertMaterial({vertexColors:true,clippingPlanes:[UPL],...o}), L=[];   // UPL: seen from above while you stand under the upper floor, it and what is on it are not drawn (owner, 12 Nov 2026: "2nd story shouldnt show when you're under it")
    // sawn wood: long streaks down the grain, bands across it, a knot here and there (drawn from where the surface is, so it needs no picture)
    const grain=(m,k)=>{ m.onBeforeCompile=sh=>{ sh.vertexShader='attribute vec3 aGr; varying vec3 vGp, vGa;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vGp=position; vGa=aGr;');
        sh.fragmentShader='varying vec3 vGp, vGa;\nfloat gH(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }\nfloat gN(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(mix(gH(i),gH(i+vec3(1,0,0)),f.x),mix(gH(i+vec3(0,1,0)),gH(i+vec3(1,1,0)),f.x),f.y),mix(mix(gH(i+vec3(0,0,1)),gH(i+vec3(1,0,1)),f.x),mix(gH(i+vec3(0,1,1)),gH(i+vec3(1,1,1)),f.x),f.y),f.z); }\n'+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        { vec3 ax=normalize(vGa+1e-4), al=ax*dot(vGp,ax), ac=vGp-al; vec3 q=ac*${k.toFixed(1)}+al*1.4; float a=gN(q), b=gN(q*3.1+7.), kn=smoothstep(.82,.95,gN(ac*6.+al*2.3+3.)); diffuseColor.rgb*=(.74+.36*a+.14*b)*(1.-.35*kn); }`); };
      m.customProgramCacheKey=()=>'loftgrain'+k; return m; };
    const MT=R.loftM={body:[vc({emissive:0x34302a})],wood:[grain(vc(),38)],steel:[vc({side:THREE.DoubleSide})]}, byG=list=>{ const o={}; for(const e of list)(o[e[1][0]]||(o[e[1][0]]=[])).push(e); return o; };
    const SPL=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6), cw={clippingPlanes:[UPL,SPL]}, MS={body:vc({emissive:0x34302a,...cw}),wood:grain(vc(cw),38),steel:vc({side:THREE.DoubleSide,...cw})}; for(const k in MS)MT[k].push(MS[k]);   // SPL: the left wall's cut, kept off while you are on the stair
    R.loftK={steel:'black',wood:'walnut',body:'white'}; R.loftSet=(k,v)=>{ const O=OPTS[k]; if(!O||!O.o[v])return; R.loftK[k]=v; const c=O.o[v][1]; for(const m of MT[k])m.color.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace); };
    const box=(u0,h0,v0,u1,h1,v1,col,to=L)=>to.push([B(u1-u0,h1-h0,v1-v0),col,(u0+u1)/2,(h0+h1)/2,(v0+v1)/2]);

    /* ---------- the upper floor: the long deck by the blank wall, the deck across the front, the landing; white under, walnut edges, the room's boards on top (no two faces in one place: the slab stops under the boards, the edge boards stand outside it) ---------- */
    const DECKS=[[mx,0,Lx,Ly],[DK.u0,0,mx,DK.v1],[su0,sv1,su1,Ly],[su1,GV,mx,Ly]];
    for(const [u0,v0,u1,v1] of DECKS){ box(u0+.004,MH-.2,v0+.004,u1-.004,MH-.05,v1-.004,WHT); shelf(u0,v0,u1,v1,MH-.2,MH); }
    for(const [u0,v0,u1,v1] of [[mx-.035,DK.v1+.035,mx,GV-.035],[DK.u0-.035,DK.v1,mx,DK.v1+.035],[DK.u0-.035,0,DK.u0,DK.v1],[su1,sv1,su1+.035,GV-.035],[su1,GV-.035,mx-.035,GV],[su0,sv1-.035,su1+.035,sv1]])box(u0,MH-.34,v0,u1,MH+.02,v1,WAL2);
    { const fm=mat([255,255,255],{clippingPlanes:[UPL]}); R.loftFloor=fm;   // its boards are one of the room's floors (A.floor(k,true)), laid as the room's own are
      for(const [u0,v0,u1,v1] of DECKS){ const w=u1-u0, d=v1-v0, g=new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2), uv=g.attributes.uv; for(let i=0;i<uv.count;i++){ const u=u0+uv.getX(i)*w, v=v0+(1-uv.getY(i))*d; uv.setXY(i,u/Lx,1-v/Ly); } part(g,fm,(u0+u1)/2,MH,(v0+v1)/2,0,apt,false); } }

    /* ---------- the stair: open under, so the wall's windows show through it: a walnut tread and riser to every step on two steel strings, up the left wall to the landing ---------- */
    const LS=[];   // the flight and its rail: they drop with the wall they climb (owner, 13 Nov 2026)
    { for(let i=0;i<N-1;i++){ const h=(i+1)*ST, v=sv0+i*RUN; box(su0,h-.045,v-.03,su1,h,v+RUN-.016,WAL,LS); box(su0+.01,h-ST+.002,v-.016,su1-.01,h-.045,v-.002,WAL2,LS); }
      const len=Math.hypot(sv1-sv0,MH), rx=-Math.atan2(MH,sv1-sv0); for(const u of [su0+.07,su1-.07])LS.push([B(.07,.24,len),STL,u,MH/2-.2,(sv0+sv1)/2+.1,rx,0,0]); }
    solid(su1,sv0,su1+.06,sv0+RUN*10,ST*10); let gate=null; const gateSet=on=>{ if(on&&!gate)gate=solid(su0,sv0+RUN*10,su1,sv0+RUN*10+.08,.3); else if(!on&&gate){ if(APTS.unsolid)APTS.unsolid(gate); gate=null; } };   // under the low end there is no headroom: its side is closed, and its far end too unless you are on the stair (you walk under the rest)

    /* ---------- the rails: black steel, six bars between posts (level along the decks, raked up the stair); glass round the front deck ---------- */
    const rail=(u0,v0,h0,u1,v1,h1,to=L)=>{ const len=Math.hypot(u1-u0,v1-v0), n=Math.max(1,Math.round(len/1.3)), ry=Math.atan2(u1-u0,v1-v0), sl=Math.hypot(len,h1-h0), rx=-Math.atan2(h1-h0,len);
      for(let i=0;i<=n;i++){ const t=i/n, u=u0+(u1-u0)*t, v=v0+(v1-v0)*t, h=h0+(h1-h0)*t; to.push([B(.045,RH,.045),STL,u,h+RH/2,v]); }
      for(let k=0;k<6;k++){ const y=(k===5?RH-.01:.14+k*.165); to.push([B(k===5?.05:.018,k===5?.03:.018,sl),STL,(u0+u1)/2,(h0+h1)/2+y,(v0+v1)/2,rx,ry,0]); } };
    rail(mx-.06,DK.v1+.1,MH,mx-.06,GV-.06,MH); rail(su1,sv0,ST,su1,sv1,MH,LS); rail(su1,sv1,MH,su1,GV-.06,MH); rail(su1+.06,GV-.06,MH,mx-.12,GV-.06,MH);
    { const gm=APTS.glassMat?APTS.glassMat({opacity:.2,clippingPlanes:[UPL]}):mat([190,210,220],{transparent:true,opacity:.25,clippingPlanes:[UPL]});
      for(const [u0,v0,u1,v1] of [[DK.u0,DK.v1,mx,DK.v1],[DK.u0,.04,DK.u0,DK.v1]]){ const len=Math.hypot(u1-u0,v1-v0), ry=u0===u1?Math.PI/2:0; part(new THREE.PlaneGeometry(len,RH-.08),gm,(u0+u1)/2,MH+RH/2+.03,(v0+v1)/2,ry,apt,false).userData.soft=1;
        L.push([B(u1-u0+.05,.06,v1-v0+.05),STL,(u0+u1)/2,MH+.05,(v0+v1)/2],[B(u1-u0+.03,.025,v1-v0+.03),STL,(u0+u1)/2,MH+RH,(v0+v1)/2]); }
      }

    /* ---------- a cast-iron radiator under the window ---------- */
    const FX=[];
    { const ru=2.95, c0=[206,202,192]; for(let i=0;i<14;i++)FX.push([B(.045,.62,.15),c0,ru-.46+i*.07,.43,.14]); FX.push([B(1.0,.03,.13),c0,ru,.76,.14],[B(1.0,.04,.13),c0,ru,.12,.14],[new THREE.CylinderGeometry(.02,.02,HW-.1,8),[176,120,70],ru+.62,HW/2,.09]); solid(ru-.52,.04,ru+.52,.24,.78); }
    { const Gs=byG(L); for(const k in Gs)part(merge(Gs[k]),MT[k][0],0,0,0,0,apt); const Gw=byG(LS); for(const k in Gw)part(merge(Gw[k]),MS[k],0,0,0,0,apt); part(merge(FX),vc(),0,0,0,0,apt); }

    /* ---------- walking it: the height under you up there, and what is solid on the upper floor ---------- */
    const onDeck=(u,v)=>DECKS.some(([u0,v0,u1,v1])=>u>=u0&&u<=u1&&v>=v0&&v<=v1), ax=apt.position.x, az=apt.position.z, fy=R.fy;
    APTS.loftY=(x,z)=>{ const u=(x-ax)/M, v=(z-az)/M, h=(SHARED.py-fy)/M; if(u>su0&&u<su1&&v>sv0-.02&&v<sv1){ const hs_=Math.min(N-1,Math.max(1,Math.ceil((v-sv0)/RUN+.001)))*ST; return h>hs_-.75?fy+hs_*M:null; }
      return onDeck(u,v)&&h>MH-.75?fy+MH*M:null; };
    APTS.loftUp=()=>(SHARED.py-fy)/M>MH-.55;
    R.loftUnder=()=>{ const u=(pos.x-ax)/M, v=(pos.z-az)/M; gateSet(!(u>su0-.1&&u<su1+.1&&v>sv0-.6&&v<sv1&&((SHARED.py-fy)/M>.1||v<sv0+RUN*10))); const onSt=u>su0-.15&&u<su1+.15&&v>sv0-.3&&v<sv1+.15&&(SHARED.py-fy)/M>.1; SPL.constant=onSt||!APTS.WPL?1e6:APTS.WPL.Ww.constant; const under=!!APTS.inReal&&!UI.persp&&(SHARED.py-fy)/M<MH-.6&&!(u>su0-.15&&u<su1+.15&&v>sv0-.3&&v<sv1+.15); UPL.constant=under?fy+(MH-.36)*M:1e6; if(under!==R.loftHid){ R.loftHid=under; const A2=ROOMK.api; if(A2)for(const un of A2.units()){ if(un.gone)continue; const h=un.loose?A2.toApt(un.obj.position.x,un.obj.position.y,un.obj.position.z).h:un.obj.position.y; if(h>MH-.3)un.obj.visible=!under; } } };
    const hi=(u0,v0,u1,v1)=>APTS.solidHi(A.x0+u0/MPU,A.y0+v0/MPU,A.x0+u1/MPU,A.y0+v1/MPU), T=.08;
    hi(-.4,-.4,Lx+.4,0); hi(-.4,Ly,Lx+.4,Ly+.4); hi(-.4,0,0,Ly); hi(Lx,0,Lx+.4,Ly);                                       // the walls
    hi(mx-T,DK.v1,mx,GV); hi(su1,sv0,su1+T,GV); hi(su1,GV-T,mx,GV); hi(DK.u0,DK.v1,mx,DK.v1+T); hi(DK.u0-T,0,DK.u0,DK.v1+T);   // the rails
    R.loft={MH,mx,SW,sv0,sv1,N,DECKS,sx:[su0,su1],top:[(su0+su1)/2,sv1+1.0],foot:[(su0+su1)/2,sv0-.7],blocks:[[su0,sv0-.6,su1+.06,sv0+RUN*10,'THE STAIR'],[2.43,0,3.47,.26,'THE RADIATOR']],lib:Lx+1};
    for(const k in R.loftK)R.loftSet(k,R.loftK[k]);

    /* ---------- the flat laid out (owner, 12 Nov 2026: "space things out better use the empty space, decorate with rugs, hanging photos, frames", "move these things to upstars"): the study and the bookcase upstairs, the den under the deck, a sitting corner in the tall room; rugs and pictures of the game's own; nothing hangs from the ceiling ---------- */
    R.LOFTV=3; R.loftDress=A2=>{ if((A2.R.loftV||0)<2)for(const un of A2.units())if(un.mount!=='ceil'){ const t=A2.getT(un); if(t.h>=3.4&&t.h<7)A2.setT(un,{...t,h:t.h+MH-3.5}); }   // what stood on the upper floor when it was lower comes up with it
      const U=k=>A2.units().filter(u=>u.kind===k&&!u.added), set=(k,t,i=0)=>{ const un=U(k)[i]; if(!un)return; if(un.gone)A2.restore(un); A2.setT(un,{...A2.getT(un),...t}); };
      // upstairs: the library and study on the long floor, the stargazer's corner on the glass deck
      set('BOOKSHELF',{v:5.3,h:MH}); set('WRITING DESK',{u:9.1,h:MH}); set('FLOWERING PLANT',{u:8.7,h:MH+.72}); set('HERB POT',{u:9.6,h:MH+.72}); set('LAB DESK',{u:10.9,h:MH}); set('LAB STOOL',{u:10.7,v:9.1,h:MH});
      set('TELESCOPE',{u:5.6,v:1.2,h:MH}); set('EARTH GLOBE',{u:9.0,v:.9,h:MH}); set('GLOBE TABLE',{u:Lx-.5,v:1.6,h:MH,ry:Math.PI}); set('FERN STAND',{u:Lx-.5,v:7.7,h:MH});
      // downstairs: the living room in the tall space, its seats facing the TV on the brick wall; the aquarium and pictures under the deck; plants by the door and under the stair
      set('CRT TV',{u:4.45,v:.55,h:0,ry:Math.PI}); set('RECLINER',{u:6.3,v:4.2,h:0,ry:Math.PI}); set('ROUND RUG',{u:9.8,v:5.6,h:0}); set('TABLE RADIO',{u:.45,v:8.4,h:0});
      set('FISH TANK',{u:Lx-.66,v:5.6,h:0,ry:Math.PI/2}); set('OLIVE TREE',{u:.75,v:5.9,h:0}); set('FLOOR PLANT',{u:4.7,v:9.7,h:0}); for(const un of U('HANGING PLANT'))if(!un.gone)A2.remove(un);
      const W={Ww:[.03,Math.PI/2],We:[Lx-.03,-Math.PI/2],Wb:[Ly-.03,Math.PI]}, K=A2.kinds(), put=(id,kind,t)=>{ const was=A2.units().find(u=>u.id===id); if(was){ if(!was.gone)A2.setT(was,{...A2.getT(was),...t}); return; } if(!K[kind])return; const un=A2.spawn(kind,{s:1,ry:0,...t},id); if(un)un.paid=0; };
      put('loft-rug-1','g:patterned rug, purple and gold',{u:4.45,h:0,v:3.0}); put('loft-rug-2','g:red rug',{u:9.6,h:MH,v:5.3}); put('loft-rug-3','MAUVE RUG',{u:6.2,h:MH,v:1.3});
      put('loft-sofa','g:sofa',{u:4.45,h:0,v:4.6}); put('loft-lamp','g:floor lamp',{u:2.9,h:0,v:4.8});
      put('loft-art-1','g:portrait in a red frame',{u:W.We[0],h:1.85,v:3.2,ry:W.We[1]}); put('loft-art-2','g:framed flower print',{u:W.We[0],h:1.8,v:8.0,ry:W.We[1]}); put('loft-art-3','g:poster: night painting',{u:2.6,h:1.9,v:W.Wb[0],ry:W.Wb[1]});
      put('loft-art-4','g:round mirror',{u:7.2,h:1.7,v:W.Wb[0],ry:W.Wb[1]}); put('loft-art-5','g:poster: koi night',{u:W.We[0],h:MH+1.75,v:2.6,ry:W.We[1]}); put('loft-art-6','g:framed flower print',{u:W.We[0],h:MH+1.7,v:8.0,ry:W.We[1]}); put('loft-art-7','g:wall clock',{u:9.8,h:MH+2.1,v:W.Wb[0],ry:W.Wb[1]}); R.loftPC(A2); };
    R.loftPC=A2=>{ const K=A2.kinds(); if(!K['g:desk']||!K['HOME COMPUTER']||A2.units().some(u=>u.id==='loft-pc'))return; const d=A2.spawn('g:desk',{s:1,ry:Math.PI,u:8.86,h:0,v:.5},'loft-pcdesk'); if(!d)return; d.paid=0; d.obj.updateMatrixWorld(true);
      const bb=new THREE.Box3().setFromObject(d.obj), c=bb.getCenter(new THREE.Vector3()), t=A2.toApt(c.x,bb.max.y,c.z), pc=A2.spawn('HOME COMPUTER',{s:1,ry:0,u:t.u,h:t.h,v:t.v},'loft-pc'); if(pc)pc.paid=0; }; });
  // the loft's own start: light oak below, walnut above, white walls with the front one in brick (yours to change in DECORATE); its colours and which laying-out it has had are kept with your layout
  if(APTS&&APTS.R&&APTS.LOFT){ ROOMK.built.push(A=>{ '@apts'; if(!A.R.loft)return; A.wall('white','all'); A.wall('brick','Wf'); A.floor('oak'); A.floor('walnut',true); });
    ROOMK.keep.push({out:(L,A)=>{ if(A&&A.R.loft){ L.loft={...A.R.loftK}; if(A.R.loftV)L.loftV=A.R.loftV; } },in:(L,A)=>{ if(A&&A.R.loft){ if(L.loft)for(const k in L.loft)A.R.loftSet(k,L.loft[k]); A.R.loftV=L.loftV||0; } }}); }
  SYS.add('places',()=>{ const A=ROOMK.api, R=A&&A.R; if(R&&R.loftUnder)R.loftUnder(); },'150ac-loft');
  window.LOFTDBG=()=>{ const A=ROOMK.api, R=A&&A.R, Lf=R&&R.loft; if(!Lf)return null; const W=(u,h,v)=>A.W(u,h,v); return {MH:Lf.MH,top:W(Lf.top[0],Lf.MH,Lf.top[1]).toArray(),foot:W(Lf.foot[0],0,Lf.foot[1]).toArray(),deck:W(Lf.mx+1.6,Lf.MH,A.Ly/2).toArray(),h:(SHARED.py-R.fy)/A.M,up:!!(APTS.loftUp&&APTS.loftUp()),HW:A.HW,M:A.M,fy:R.fy}; }; }
