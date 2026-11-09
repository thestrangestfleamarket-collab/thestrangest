// THE FISH TANK: a huge tank in every apartment (owner, 5 Nov 2026): clear water with a calm, moving surface, light rippling on the sand, an air stone's bubbles, rocks and plants, and real-size koi that wander and school, their tails beating; double-click it with fish food and they rise to eat.
import {THREE} from './003-shx.js';
import {FORAGE, PETS, SFX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS} from './006-map-pre.js';
import {FISHES} from './141f-fishes.js';
import {ROOMK} from './150a-bedroom.js';
const TANKS=[]; window.TANKDBG=()=>TANKS.map(T=>({fish:T.fish.length,vis:T.g.visible,pos:[+T.g.position.x.toFixed(2),+T.g.position.z.toFixed(2)],fed:+(T.fed||0).toFixed(1),y:T.fish.length?+(T.fish.reduce((a,f)=>a+f.p.y,0)/T.fish.length).toFixed(3):0,
  len:T.fish.length?+(T.fish.reduce((a,f)=>a+f.len,0)/T.fish.length).toFixed(3):0,wave:T.fish.length?+(T.fish.reduce((a,f)=>a+f.sw.y,0)/T.fish.length).toFixed(2):0,inside:T.fish.every(f=>f.p.x>=T.BX[0]&&f.p.x<=T.BX[1]&&f.p.y>=T.BX[2]&&f.p.y<=T.BX[3]&&f.p.z>=T.BX[4]&&f.p.z<=T.BX[5]),bubbles:T.bub?T.bub.count:0,ph:T.fish.map(f=>[+f.p.x.toFixed(3),+f.p.z.toFixed(3)])}));
{ const TW=2.4, TD=.7, TH=1.0, SH=.78, GL=.012, KINDS=['koi','koi_gold','koi_showa','koi_sanke','koi_platinum','koi_asagi','koi_orange','koi_black'], N=8, NB=28;
  const X0=-TW/2+GL, X1=TW/2-GL, Z0=-TD/2+GL, Z1=TD/2-GL, YB=SH+.06, YT=SH+TH*.92;   // the water inside the glass, sand to surface
  const hs=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
  for(const k of ['FISH TANK'])ROOMK.always.add(k);   // in every apartment from the start (owner, 7 Nov 2026)
  // the light the surface throws on the sand: a caustic net that drifts
  const causticMat=()=>new THREE.ShaderMaterial({uniforms:{t:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,
    vertexShader:'varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:`uniform float t; varying vec2 vU;
      void main(){ vec2 p=mod(vU*vec2(${(TW*1.6).toFixed(2)},${(TD*1.6).toFixed(2)})*6.2832,6.2832)-250.; vec2 i=p; float c=1.;
        for(int n=0;n<4;n++){ float s=t*.35*(1.-(3.5/float(n+1))); i=p+vec2(cos(s-i.x)+sin(s+i.y),sin(s-i.y)+cos(s+i.x)); c+=1./length(vec2(p.x/(sin(i.x+s)/.005),p.y/(cos(i.y+s)/.005))); }
        c=1.17-pow(c/4.,1.4); float v=pow(abs(c),8.); gl_FragColor=vec4(vec3(.75,.92,1.)*min(v,1.)*.5,1.); }`});
  ROOMK.parts.push(c=>{ '@apts'; const {R,part,mat,rbox,cap,Lx,Ly}=c;
    cap('FISH TANK',g=>{ const tg=new THREE.Group(); tg.position.set(Lx-TD/2-.15,0,Ly*.42); tg.rotation.y=Math.PI/2; g.add(tg); const P=(geo,m,u,h,v,ry=0,cast=true)=>part(geo,m,u,h,v,ry,tg,cast);   // along the east wall, long side to it (owner, 7 Nov 2026: "put all the stuff in apartment along the walls")
      const soft=m=>{ m.userData.soft=true; return m; };
      // the stand: a dark walnut cabinet
      P(rbox(TW+.06,SH,TD+.06,.02),mat([70,46,32]),0,SH/2,0);
      // the sand, the rocks, the plants, the air stone
      P(new THREE.BoxGeometry(TW-2*GL,.06,TD-2*GL),new THREE.MeshStandardMaterial({color:new THREE.Color(.86,.8,.66),roughness:1}),0,SH+.03,0);
      const rock=new THREE.MeshStandardMaterial({color:new THREE.Color(.42,.4,.38),roughness:.9,flatShading:true});
      for(let i=0;i<5;i++){ const r=.05+hs(i,1)*.09, m=P(new THREE.DodecahedronGeometry(r,0),rock,(hs(i,2)-.5)*(TW-.3),YB+r*.5,(hs(i,3)-.5)*(TD-.25)); m.rotation.set(hs(i,4)*3,hs(i,5)*3,0); }
      const leaf=new THREE.MeshStandardMaterial({color:new THREE.Color(.22,.55,.28),roughness:.8,side:THREE.DoubleSide}), plants=[];
      for(let i=0;i<9;i++){ const h=.25+hs(i,6)*.5, m=P(new THREE.PlaneGeometry(.05,h).translate(0,h/2,0),leaf,(hs(i,7)-.5)*(TW-.2),YB,Z0+.07+hs(i,8)*(TD*.35),hs(i,9)*3); plants.push([m,hs(i,10)*6]); }
      const SX=X0+.14, SZ=Z0+.1; P(new THREE.CylinderGeometry(.025,.028,.03,10),mat([96,100,104]),SX,YB+.015,SZ);
      // the light on the sand
      const cm=causticMat(), cs=soft(P(new THREE.PlaneGeometry(TW-2*GL,TD-2*GL).rotateX(-Math.PI/2),cm,0,YB+.003,0,0,false)); cs.renderOrder=1;
      // the water: clear and faintly blue-green, you see the fish sharp through it
      const wm=soft(P(new THREE.BoxGeometry(TW-2*GL,YT-YB,TD-2*GL),new THREE.MeshStandardMaterial({color:new THREE.Color(.62,.86,.88),transparent:true,opacity:.13,roughness:.1,depthWrite:false}),0,(YB+YT)/2,0,0,false)); wm.renderOrder=2;
      // the surface: calm, a slow shimmer and the bubbles' rings
      const sg=new THREE.PlaneGeometry(TW-2*GL,TD-2*GL,40,12).rotateX(-Math.PI/2), sp=sg.attributes.position, sb=Float32Array.from(sp.array);
      const sm=soft(P(sg,new THREE.MeshStandardMaterial({color:new THREE.Color(.82,.94,.96),transparent:true,opacity:.32,roughness:.06,metalness:.1,side:THREE.DoubleSide,depthWrite:false}),0,YT,0,0,false)); sm.renderOrder=2;
      // the glass: thin, nearly invisible but for its green edges, and the rim and lit hood
      const glass=new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.05,roughness:.03,metalness:.2,depthWrite:false}), edge=new THREE.MeshStandardMaterial({color:new THREE.Color(.5,.74,.68),transparent:true,opacity:.55,roughness:.2});
      for(const [w,d,x,z] of [[TW,GL,0,-TD/2+GL/2],[TW,GL,0,TD/2-GL/2],[GL,TD,-TW/2+GL/2,0],[GL,TD,TW/2-GL/2,0]]){ const m=soft(P(new THREE.BoxGeometry(w,TH,d),glass,x,SH+TH/2,z,0,false)); m.renderOrder=3; }
      for(const [x,z] of [[-TW/2,-TD/2],[TW/2,-TD/2],[-TW/2,TD/2],[TW/2,TD/2]])soft(P(new THREE.BoxGeometry(GL*1.5,TH,GL*1.5),edge,x+(x<0?GL*.75:-GL*.75),SH+TH/2,z+(z<0?GL*.75:-GL*.75),0,false)).renderOrder=3;
      P(new THREE.BoxGeometry(TW+.02,.05,TD+.02),mat([28,28,30]),0,SH+TH+.025,0);
      P(new THREE.BoxGeometry(TW-.2,.006,.05),new THREE.MeshBasicMaterial({color:new THREE.Color(.85,.95,1)}),0,SH+TH-.004,0,0,false);
      // the bubbles from the air stone
      const bub=new THREE.InstancedMesh(new THREE.SphereGeometry(1,6,4),new THREE.MeshBasicMaterial({color:0xeaf6ff,transparent:true,opacity:.5,depthWrite:false}),NB); bub.userData.soft=true; bub.renderOrder=2; bub.frustumCulled=false; tg.add(bub);
      const B=[]; for(let i=0;i<NB;i++)B.push({y:YB+hs(i,30)*(YT-YB),s:.16+hs(i,31)*.1,r:.003+hs(i,32)*.004,w:hs(i,33)*6});
      const T={g,tg,plants,fish:[],mats:[],cm,sg,sp,sb,bub,B,SX,SZ,fed:0,t:Math.random()*100}; T.BX=[X0,X1,YB,YT,Z0,Z1]; TANKS.push(T);
      const add=(k,len,i)=>{ const s=FISHES.swimmer(k,len); if(!s)return; tg.add(s.o); T.mats.push(s.o.material); const crab=/crab/.test(k);
        T.fish.push({o:s.o,sw:s.sw,len,crab,i,p:new THREE.Vector3(X0+.3+hs(i,12)*(X1-X0-.6),crab?YB+len*.25:YB+.15+hs(i,16)*(YT-YB-.3),Z0+.15+hs(i,15)*(Z1-Z0-.3)),v:new THREE.Vector3((hs(i,18)-.5)*.1,0,(hs(i,19)-.5)*.05),
          t:new THREE.Vector3(),tt:0,cr:(crab?.02:.06)+hs(i,13)*.05,ph:hs(i,17)*6,yaw:0}); };
      FISHES.load().then(()=>{
        // koi at their real size, 20 to 34 cm (owner, 9 Nov 2026)
        for(let i=0;i<N;i++)add(KINDS[i%KINDS.length],.2+hs(i,11)*.14,i);
        // your sea pets from the aquarium, each its own size
        (PETS.sea?PETS.sea():[]).slice(0,24).forEach((r,j)=>{ const L0=FISHES.len(r.k,1), gl=FISHES.len('goldfish',1); add(r.k,Math.min(.3,Math.max(.06,.08*Math.sqrt(L0/gl))),N+j); }); }).catch(()=>{});
    },{id:'fishtank',wire:'tank'}); });
  ROOMK.wires.tank=(un,c)=>{ const T=TANKS.find(q=>q.g===un.obj); if(!T)return;
    c.hit(un,()=>FORAGE.has('g_fishfood')?'FEED THE FISH':'THE FISH TANK',()=>{ if(!FORAGE.has('g_fishfood'))return SAY('THE FISH DRIFT ROUND. A TUB OF FISH FOOD WOULD BRING THEM UP (THE BODEGA, THE PET STORE, THE AQUARIUM).','#c8d8e0');
      FORAGE.take('g_fishfood',1); if(FORAGE.draw)FORAGE.draw(); T.fed=30; if(SFX)SFX.play('click',{vol:.3,vary:.2}); SAY('YOU SHAKE IN A PINCH OF FOOD. THE FISH RISE AND SNAP IT UP.','#c8e8f0'); }); };
  const D=new THREE.Vector3(), Q=new THREE.Vector3(), Mx=new THREE.Matrix4();
  // each fish wanders to a spot of its own, keeps off the glass and the others, and drifts along with its neighbours; fed, they all go up to the food
  const swim=(T,f,dt,up)=>{ const m=f.len*.5+.02, lo=[X0+m,YB+(f.crab?f.len*.25:.05+f.len*.15),Z0+Math.min(m,.2)], hi=[X1-m,f.crab?YB+f.len*.25:YT-.04,Z1-Math.min(m,.2)];
    if(up>0&&!f.crab){ if(f.tt>.5||f.t.y<YT-.06){ f.t.set((hs(f.i,40)-.5)*.5,YT-.04,(hs(f.i,41)-.5)*.2); f.tt=.5; } }
    else if((f.tt-=dt)<0||f.p.distanceTo(f.t)<.08){ f.t.set(lo[0]+Math.random()*(hi[0]-lo[0]),lo[1]+Math.random()*Math.max(0,hi[1]-lo[1]),lo[2]+Math.random()*Math.max(0,hi[2]-lo[2])); f.tt=4+Math.random()*7; }
    const cr=f.cr*(1+up*1.5); D.subVectors(f.t,f.p); const dl=D.length(); D.multiplyScalar(dl>1e-4?Math.min(1,dl/.3)*cr/dl:0);
    let n=0; Q.set(0,0,0); for(const o of T.fish){ if(o===f)continue; const dx=f.p.x-o.p.x, dy=f.p.y-o.p.y, dz=f.p.z-o.p.z, d=Math.hypot(dx,dy,dz), r=(f.len+o.len)*.55;
      if(d<r&&d>1e-4){ const k=(r-d)/r*.12/d; D.x+=dx*k; D.y+=dy*k*.5; D.z+=dz*k; } else if(d<.6&&!f.crab&&!o.crab){ Q.add(o.v); n++; } }
    if(n){ Q.multiplyScalar(1/n).sub(f.v).multiplyScalar(.35); D.add(Q); }
    for(let a=0;a<3;a++){ const k=['x','y','z'][a], p=f.p[k]; if(p<lo[a]+.06)D[k]+=(lo[a]+.06-p)*2; if(p>hi[a]-.06)D[k]-=(p-hi[a]+.06)*2; }
    D.y*=f.crab?0:.5; f.v.lerp(D,1-Math.exp(-dt*1.4)); const sp=f.v.length(), mx=cr*1.8; if(sp>mx)f.v.multiplyScalar(mx/sp);
    f.p.addScaledVector(f.v,dt); f.p.x=Math.min(hi[0],Math.max(lo[0],f.p.x)); f.p.y=Math.min(Math.max(hi[1],lo[1]),Math.max(lo[1],f.p.y)); f.p.z=Math.min(hi[2],Math.max(lo[2],f.p.z));
    const hz=Math.hypot(f.v.x,f.v.z); if(hz>.004){ let a=Math.atan2(-f.v.z,f.v.x)-f.yaw; a=Math.atan2(Math.sin(a),Math.cos(a)); f.yaw+=Math.max(-dt*2.2,Math.min(dt*2.2,a)); }
    f.o.position.copy(f.p); f.o.rotation.set(0,f.yaw,f.crab?0:Math.max(-.4,Math.min(.4,Math.atan2(f.v.y,hz+.02)*.6)));
    const bt=f.crab?0:Math.min(1.6,.5+sp/f.len*2.5); f.ph+=dt*(3+sp/f.len*9); f.sw.x=f.ph; f.sw.y+=(bt-f.sw.y)*Math.min(1,dt*3); };
  SYS.add('life',dt=>{ dt=Math.min(dt,.05); for(let k=TANKS.length-1;k>=0;k--){ const T=TANKS[k]; if(!T.g.parent){ for(const m of T.mats)m.dispose(); T.cm.dispose(); TANKS.splice(k,1); continue; } if(!T.g.visible)continue; T.t+=dt;
    for(const [m,ph] of T.plants)m.rotation.z=.04*Math.sin(T.t*.6+ph);
    T.cm.uniforms.t.value=T.t;
    const up=T.fed>0?Math.min(1,T.fed/3,(30-T.fed)/.6):0; if(T.fed>0)T.fed-=dt;
    for(const f of T.fish)swim(T,f,dt,up);
    const a=T.sp.array, b=T.sb, t=T.t; for(let i=0;i<a.length;i+=3){ const x=b[i], z=b[i+2], r=Math.hypot(x-T.SX,z-T.SZ);
      a[i+1]=.0016*Math.sin(x*9+t*1.1)+.001*Math.sin(z*14-t*1.6+x*3)+.0025*Math.sin(r*55-t*7)*Math.exp(-r*9); }
    T.sp.needsUpdate=true; T.sg.computeVertexNormals();
    for(let i=0;i<T.B.length;i++){ const q=T.B[i]; q.y+=q.s*dt; if(q.y>YT){ q.y=YB+.03; q.w=Math.random()*6; } const s=q.r*(1+(q.y-YB)/(YT-YB)*.4);
      Mx.makeScale(s,s,s).setPosition(T.SX+.01*Math.sin(q.y*30+q.w),q.y,T.SZ+.01*Math.cos(q.y*26+q.w)); T.bub.setMatrixAt(i,Mx); }
    T.bub.instanceMatrix.needsUpdate=true; } },'150k-fishtank'); }
