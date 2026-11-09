// THE FISH: FISHES are the fish you see swimming in every water near you (the catch, real models, and the colourful ones only to look at); the one you hook is one of them.
import {SHARED, THREE} from './003-shx.js';
import {BROOK, FLOW, ITEMS, pos} from './003b-systems.js';
import {scene} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
import {RIVER} from './066-river.js';
const FISHES={list:[],ready:false}; window.FISHES=FISHES;
{ const T=TILE, MPU=.84/T, WU=1/MPU, DATA=__LAZY__("data/fishes.json"), PACK=__LAZY__("data/fish.json"), IP=(id,k)=>ITEMS.prop(id,k);
  const B=s=>{ const t=atob(s), u=new Uint8Array(t.length); for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i); return u; }, F=s=>new Float32Array(B(s).buffer), U16=s=>new Uint16Array(B(s).buffer);
  // length in metres for a weight (kg): a fish a third of a metre at a third of a kilo, longer for the long ones; the reef shoal by the pack's sizes
  const LONG={x_eel:3.2,x_sturgeon:1.5,x_pike:1.6,x_crab:.55,x_flounder:1.1,x_trout:1.1,x_catfish:1.1,x_sunfish:.85,x_bluegill:.85}, PACKL={clownfish:.42,bluetang:.46,koi:.75,koi_gold:.75,koi_showa:.75,koi_sanke:.75,koi_platinum:.75,koi_asagi:.75,koi_orange:.75,koi_black:.75,goldfish:.3,puffer:.5,lionfish:.5,mandarinfish:.34,moorishidol:.44,butterflyfish:.4,shark:2.4,yellowtang:.44,firefish:.36,cardinalfish:.36,chromis:.3,cleanerwrasse:.34,foxface:.46,dolphin:2.4,stingray:1.4,seaturtle:1.2,moray:1.6,jellyfish:.5,octopus:1,coelacanth:1.7,barracuda:1.5,angelfish:.3,plesiosaur:4,chromisshoal:.3,shrimp:.2,
    sockeye:.8,goatfish:.45,seabream:.55,wrasse:.45,stripedpuffer:.45,trevally:.7,dace:.3,knifejaw:.5};
  const lenM=(id,kg)=>PACKL[id]?PACKL[id]*.84:.45*Math.cbrt(kg)*(LONG[id]||1);
  // how each swims: the body's wave across (most fish), up and down (the flounder lying flat), the eel's long wave, the crab not at all
  const STYLE={x_flounder:1,x_eel:2,x_crab:3,stingray:1,moray:2,jellyfish:3,octopus:3,seaturtle:3,shrimp:3}, CAP=12;
  const M={}, mats={}; let loading=null, packIds=[];
  const WAVE=v=>`#include <begin_vertex>
      { float w=clamp(.5-position.x,0.,1.), ph=${v}.x, a=${v}.y; int k=int(${v}.z+.5);
        if(k==0)transformed.z+=a*(.04+w*w*.22)*sin(ph+position.x*7.);
        else if(k==1)transformed.y+=a*(.03+w*w*.12)*sin(ph+position.x*8.);
        else if(k==2)transformed.z+=a*.07*(.3+w)*sin(ph+position.x*16.); }`;
  const swimMat=(map,vc)=>{ '@later'; const m=new THREE.MeshLambertMaterial({map:map||null,vertexColors:!!vc,side:THREE.DoubleSide});
    m.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*.3;');   // light of its own: under water the sun comes only from above
      sh.vertexShader='attribute vec3 aSw;\n'+sh.vertexShader.replace('#include <begin_vertex>',WAVE('aSw')); };
    m.customProgramCacheKey=()=>'fishswim'+(map?1:0)+(vc?1:0); return m; };
  const geoOf=(id,d)=>{ '@later'; const g=new THREE.BufferGeometry(); if(d.u){ g.setAttribute('position',new THREE.BufferAttribute(F(d.p),3)); g.setAttribute('uv',new THREE.BufferAttribute(U16(d.u),2,true)); g.setIndex(new THREE.BufferAttribute(U16(d.i),1)); }
      else { const p=F(d.p), c=B(d.c), n=c.length/3, C=new Float32Array(n*3), q=new THREE.Color(); for(let i=0;i<n;i++){ q.setRGB(c[i*3]/255,c[i*3+1]/255,c[i*3+2]/255,THREE.SRGBColorSpace); C[i*3]=q.r; C[i*3+1]=q.g; C[i*3+2]=q.b; }
        g.setAttribute('position',new THREE.BufferAttribute(p,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); }
    g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
  FISHES.load=()=>loading||(loading=Promise.all([DATA(),PACK()]).then(([real,pack])=>{
    const tl=new THREE.TextureLoader(), add=(id,d,real)=>{ let map=null; if(d.t){ map=tl.load(d.t); map.colorSpace=THREE.SRGBColorSpace; map.flipY=false; }
      const g=geoOf(id,d), mat=swimMat(map,!d.t), im=new THREE.InstancedMesh(g,mat,CAP); im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.count=0; im.frustumCulled=false;
      const sw=new THREE.InstancedBufferAttribute(new Float32Array(CAP*3),3); sw.setUsage(THREE.DynamicDrawUsage); g.setAttribute('aSw',sw); scene.add(im);
      M[id]={g,im,sw,map,vc:!d.t}; };
    for(const id in real)add(id,real[id],true); packIds=Object.keys(pack); for(const id of packIds)if(!M[id])add(id,pack[id],false);
    FISHES.ready=true; FISHES.ids=Object.keys(M); }));
  // a single fish to hold (the hooked one, the one in the inspect window): the species' own shape and picture, still
  FISHES.model=(id,kg=1)=>{ const m=M[id]; if(!m)return null; let mt=mats[id]; if(!mt){ mt=mats[id]=new THREE.MeshLambertMaterial({map:m.map,vertexColors:m.vc,side:THREE.DoubleSide}); }
    const o=new THREE.Mesh(m.g,mt); const L=lenM(id,kg)*WU; o.scale.setScalar(L); o.userData.shared=true; return o; };
  // one fish of a kind that swims on its own (the apartment tank): the body's wave as the river's, set by sw (x the wave's phase, y its size)
  FISHES.swimmer=(id,len)=>{ const m=M[id]; if(!m)return null; const u={value:new THREE.Vector3(0,0,STYLE[id]||0)}, mt=new THREE.MeshLambertMaterial({map:m.map,vertexColors:m.vc,side:THREE.DoubleSide});
    mt.onBeforeCompile=sh=>{ sh.uniforms.uSw=u; sh.vertexShader='uniform vec3 uSw;\n'+sh.vertexShader.replace('#include <begin_vertex>',WAVE('uSw')); }; mt.customProgramCacheKey=()=>'fishone'+(m.map?1:0)+(m.vc?1:0);
    const o=new THREE.Mesh(m.g,mt); o.scale.setScalar(len); o.userData.shared=true; return {o,sw:u.value,style:STYLE[id]||0}; };
  FISHES.len=(id,kg)=>lenM(id,kg)*WU;

  // who swims where: the catch of each water (the item model's LIVES IN and DEPTH), a few of each near you, more of the common ones; the Hudson's reef shoal when its water shows it
  const catchOf=kind=>Object.keys(ITEMS.defs||{}).filter(id=>IP(id,'water')===kind&&M[id]);
  const WANT={river:16,lake:12}, R0=4*T, R1=26*T, list=FISHES.list;
  // and the colourful ones that are only to look at (owner, 28 Oct 2026: "lots of differtny colorful fish, and diff types of things like koi fish"): koi of every colouring
  // and goldfish in the park's waters, the reef fish and the bright scans in the Hudson, a shark now and then
  const DECO={lake:['koi','koi_gold','koi_showa','koi_sanke','koi_platinum','koi_asagi','koi_orange','koi_black','goldfish','goldfish','dace','sockeye'],
    river:['clownfish','bluetang','puffer','lionfish','mandarinfish','moorishidol','butterflyfish','yellowtang','firefish','cardinalfish','chromis','chromis','cleanerwrasse','foxface','angelfish','chromisshoal','chromisshoal','shrimp','barracuda','moray','stingray','seaturtle','jellyfish','jellyfish','octopus','coelacanth','dolphin','plesiosaur','goatfish','seabream','wrasse','stripedpuffer','trevally','knifejaw','sockeye','koi','shark']}, WANTD={river:18,lake:16};
  const depth=(w,x,z)=>(w.rest(x,z)-w.bed(x,z))*MPU;
  const pick=ids=>{ let s=0; const c=ids.map(id=>{ const v=Math.max(.2,IP(id,'common')||1); s+=v; return v; }); let r=Math.random()*s; for(let i=0;i<ids.length;i++)if((r-=c[i])<0)return ids[i]; return ids[0]; };
  // sizes (owner, 28 Oct 2026: "do smaller and larger fish too"): most young and small, now and then an old giant three times the size
  const sizeK=()=>{ const r=Math.random(); return r<.35?.35+r:r<.93?.7+(r-.35)*.9:1.6+(r-.93)*20; };
  const spawnIn=(w,id,x,z)=>{ '@later'; const w0=IP(id,'weight')||.4, sk=sizeK(), kg=PACKL[id]?1:Math.min(w0*6,w0*sk**3*1.1), rs=w.rest(x,z), bs=w.bed(x,z), r=rs, b=Math.max(bs,rs-14*WU), L=lenM(id,kg)*WU*(PACKL[id]?sk:1);
    const f={id,kg,w,x,z,y:b+(r-b)*(.25+.5*Math.random()),h:Math.random()*6.28,v:0,tx:x,tz:z,ty:0,t:0,ph:Math.random()*6.28,L,lure:null}; f.ty=f.y; list.push(f); return f; };
  const spot=(w,minD,id)=>{ for(let k=0;k<12;k++){ const a=Math.random()*6.28, d=minD+Math.random()*(R1-minD), x=pos.x+Math.cos(a)*d, z=pos.z+Math.sin(a)*d; if(!w.has(x,z))continue; const dp=depth(w,x,z); if(dp<.5||id&&dp<(IP(id,'depth')||0))continue; return [x,z]; } return null; };
  const near=()=>FLOW.waters.filter(w=>w.kind&&(!w.shown||w.shown())&&w.box[0]<pos.x+R1&&w.box[2]>pos.x-R1&&w.box[1]<pos.z+R1&&w.box[3]>pos.z-R1);
  let wait=0;
  const populate=dt=>{ '@later'; if((wait-=dt)>0)return; wait=.4; const ws=near();
    for(let i=list.length-1;i>=0;i--){ const f=list[i]; if(f.lure||f.hooked)continue; if(Math.hypot(f.x-pos.x,f.z-pos.z)>R1*1.3||!ws.includes(f.w))list.splice(i,1); }
    for(let rep=0;rep<3;rep++)for(const w of ws){ const ids=catchOf(w.kind); if(!ids.length)continue; const have=list.filter(f=>f.w===w&&!f.deco).length; if(have>=WANT[w.kind])continue;
      const id=pick(ids), p=spot(w,have<4?R0:R0*2,id); if(p)spawnIn(w,id,p[0],p[1],null);
      const deco=DECO[w.kind].filter(k=>M[k]), dn=list.filter(f=>f.w===w&&f.deco).length; if(deco.length&&dn<WANTD[w.kind]){ const q=spot(w,dn<4?R0:R0*2,null); if(q)spawnIn(w,deco[Math.floor(Math.random()*deco.length)],q[0],q[1],null).deco=true; } } };
  // the swim: each wanders its water between the bed and the surface, turns smoothly, flees a swimmer, beats its tail as fast as it goes; a lured one heads for the hook
  const Mx=new THREE.Matrix4(), Q=new THREE.Quaternion(), E=new THREE.Euler(), Pv=new THREE.Vector3(), Sv=new THREE.Vector3();
  const swim=dt=>{ '@later'; const sw=window.RIVER&&RIVER.swim||window.FOUNT&&FOUNT.swim||window.BROOK&&BROOK.swim;
    for(const f of list){ if(f.hooked)continue; const w=f.w; f.t-=dt; let sp=(.25+.25*Math.min(1,f.kg/3))*WU;
      if(f.lure){ const l=f.lure, d=Math.hypot(l.x-f.x,l.z-f.z); f.tx=l.x; f.tz=l.z; f.ty=w.rest(l.x,l.z)-.3*WU; sp=Math.max(.2*WU,d/Math.max(.4,l.at-performance.now()/1000)); }
      else if(f.t<=0||Math.hypot(f.tx-f.x,f.tz-f.z)<.4*T){ f.t=3+Math.random()*6; for(let k=0;k<6;k++){ const a=Math.random()*6.28, d=(1+Math.random()*6)*T, x=f.x+Math.cos(a)*d, z=f.z+Math.sin(a)*d; if(!w.has(x,z)||depth(w,x,z)<.4)continue; f.tx=x; f.tz=z; const r=w.rest(x,z), b=Math.max(w.bed(x,z),r-14*WU); f.ty=f.id==='x_flounder'||f.id==='x_crab'?b+.05*WU:b+(r-b)*(.2+.6*Math.random()); break; } }
      if(sw&&!f.lure){ const dx=f.x-pos.x, dz=f.z-pos.z, d=Math.hypot(dx,dz); if(d<3*T){ f.tx=f.x+dx/(d||1)*4*T; f.tz=f.z+dz/(d||1)*4*T; sp*=3; f.t=1; } }
      const want=Math.atan2(-(f.tz-f.z),f.tx-f.x); let dh=Math.atan2(Math.sin(want-f.h),Math.cos(want-f.h)); f.h+=Math.max(-2.2*dt,Math.min(2.2*dt,dh)); f.v+=(sp*(Math.abs(dh)<1.4?1:.3)-f.v)*Math.min(1,dt*1.5);
      if(f.id==='x_crab')f.v=Math.min(f.v,.12*WU);
      const nx=f.x+Math.cos(f.h)*f.v*dt, nz=f.z-Math.sin(f.h)*f.v*dt; if(w.has(nx,nz)&&depth(w,nx,nz)>.3){ f.x=nx; f.z=nz; } else { f.h+=Math.PI*.6; f.t=0; }
      const r=w.rest(f.x,f.z), b=w.bed(f.x,f.z); f.y+=(f.ty-f.y)*Math.min(1,dt*.6); f.y=Math.min(r-Math.min(.25*WU,(r-b)*.3),Math.max(b+(f.id==='x_crab'?f.L*.15:f.L*.25),f.y));
      f.ph+=dt*(3+12*f.v/WU); } };
  const draw=()=>{ '@later'; for(const id in M)M[id].im.count=0;
    for(const f of list){ if(f.hooked)continue; const m=M[f.id]; if(!m||m.im.count>=CAP)continue; const i=m.im.count++; E.set(0,f.h,0); Q.setFromEuler(E); Mx.compose(Pv.set(f.x,f.y,f.z),Q,Sv.set(f.L,f.L,f.L)); m.im.setMatrixAt(i,Mx);
      m.sw.setXYZ(i,f.ph,.6+Math.min(1.4,f.v/WU*2),STYLE[f.id]||0); }
    for(const id in M){ const m=M[id]; if(m.im.count){ m.im.instanceMatrix.needsUpdate=true; m.sw.needsUpdate=true; } m.im.visible=m.im.count>0; } };

  // the hook: the fish that will bite swims to the float, to arrive when the bite is due; a fish of that kind joins the water if none is near
  FISHES.lure=(id,x,z,inS)=>{ '@later'; if(!FISHES.ready)return null; const ws=FLOW.waters.filter(w=>w.kind&&w.has(x,z)); const w=ws[0]; if(!w)return null;
    let f=list.filter(q=>q.id===id&&!q.lure&&!q.hooked&&!q.deco&&q.w===w).sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
    if(!f){ let p=null; for(let k=0;k<16&&!p;k++){ const a=Math.random()*6.28, d=(3+Math.random()*4)*T, px=x+Math.cos(a)*d, pz=z+Math.sin(a)*d; if(w.has(px,pz)&&depth(w,px,pz)>.4)p=[px,pz]; } f=spawnIn(w,id,...(p||[x,z]),null); }
    f.lure={x,z,at:performance.now()/1000+inS}; return f; };
  FISHES.free=f=>{ if(!f)return; f.lure=null; f.hooked=false; f.t=0; f.tx=f.x+(Math.random()-.5)*8*T; f.tz=f.z+(Math.random()-.5)*8*T; };
  FISHES.hook=f=>{ if(f)f.hooked=true; };
  FISHES.gone=f=>{ const i=list.indexOf(f); if(i>=0)list.splice(i,1); };
  SYS.add('life',dt=>{ const up=SHARED.LVL==='up', act=SHARED.fishing||(window.RIVER&&RIVER.swim)||(window.FOUNT&&FOUNT.swim)||(window.BROOK&&BROOK.swim);   // fish exist only while you swim or fish (owner, 5 Nov 2026)
    if(!up||!act||!near().length){ if(FISHES.ready)for(const id in M)M[id].im.visible=false; if(!act)list.length=0; return; } if(!FISHES.ready){ FISHES.load(); return; } populate(dt); swim(dt); draw(); },'141f-fishes'); }
export {FISHES};
