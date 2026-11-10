// THE TUFTS: the standing grass over every lawn near you, each grass kind's own shape (GRASS: round or crown tufts, leaf clumps, tussocks, blades), in patches of five heights (whole ones close, coarser further out, sinking into the painted lawn at the edge, one draw a shape), leaning away from whoever walks through and springing back.
import {SHARED, THREE} from './003-shx.js';
import {NPCS, ONLINE, pos, ROOMS, W3, WEEDS, WX} from './003b-systems.js';
import {scene} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';
import {cvNoise, TUFTC} from './014-gamekit.js';
import {GRASS} from './014a-grass.js';
const TUFTS=window.TUFTS={wind:0,dir:1};
{ const T=TILE, R1=10*T, R2=22*T, NP=24, hsh=(a,b,s)=>{ let h=(a*374761393+b*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const RINGS=[{sp:.4,sz:1,cap:Math.ceil(Math.PI*R1*R1/(.4*.4)*1.15)},{sp:.62,sz:1,cap:Math.ceil(Math.PI*(R2*R2-R1*R1)/(.62*.62)*1.15)}];
  // each grass kind's standing shape (GRASS.K's shape; none for the flat ones), near and a little coarser far: geometry, and how wide and tall it stands
  const sph=(w,h)=>new THREE.SphereGeometry(.5,w,h,0,6.283,0,1.75), ico=()=>new THREE.IcosahedronGeometry(.5,0);
  const fan=n=>{ const v=[]; for(let i=0;i<n;i++){ const a=i/n*6.283+.4*Math.sin(i*2.1), c=Math.cos(a), sn=Math.sin(a), lean=.22+.12*(i%2); v.push(c*.04-sn*.035,0,sn*.04+c*.035, c*.04+sn*.035,0,sn*.04-c*.035, c*lean,1,sn*lean); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(v,3)); g.computeVertexNormals(); return g; };
  const SHP={round:{g:[sph(7,4),sph(5,3)],t:[.36,.5,.62],w:2.3},crown:{g:[ico(),ico()],t:[.42,.42,.86],w:2.1},clump:{g:[sph(6,3),sph(5,3)],t:[.3,.78,.42],w:2.2},tussock:{g:[sph(6,5),sph(5,3)],t:[.4,.5,1.25],w:1.7},blade:{g:[fan(6),fan(4)],t:[0,1,1],w:1.4,two:1}};
  const KC=GRASS.K.map(k=>{ const P=k.cols||TUFTC, W=P.reduce((a,c)=>a+c[3],0), C=P.map(c=>new THREE.Color().setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace)); return r=>{ r*=W; for(let i=0;i<P.length;i++)if((r-=P[i][3])<0)return C[i]; return C[0]; }; });
  const PP=[...Array(NP)].map(()=>new THREE.Vector4(0,0,0,0)), U={uPP:{value:PP},uTt:{value:0},uKn:{value:.6},uWd:{value:TUFTS.wind},uWr:{value:new THREE.Vector2(1,0)},uMe:{value:new THREE.Vector2()},uFd:{value:new THREE.Vector3(R2*.15,R2*.95,TUFTS.dark=1)}};
  // each tuft leans away from what presses it (more at its top); the push is turned into the tuft's own frame (a turn about Y and a scale); further out they widen, so the sparser far ring covers the ground as the near one does
  const mat=new THREE.MeshLambertMaterial(); mat.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U); sh.vertexShader=sh.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n objectNormal=vec3(0.,1.,0.);');   // lit as the lawn under it is (facing up), so the standing grass is the lawn's own colour and no patch follows you (owner, 6 Nov 2026)

    sh.vertexShader='attribute float aBend; uniform vec4 uPP['+NP+']; uniform float uTt,uKn,uWd; uniform vec2 uMe,uWr; uniform vec3 uFd; varying float vFd,vH,vTv;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      { vec3 b=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz; vec2 dv=vec2(0.); for(int i=0;i<${NP};i++){ vec4 p=uPP[i]; if(p.w==0.)continue; vec2 d=b.xz-p.xy; float l=length(d), f=1.-l/p.z; if(f<=0.)continue; f=f*f*(3.-2.*f); dv+=d/max(l,.001)*f*p.w; }
        dv*=aBend; float m=length(dv); if(m>1.)dv/=m; vec2 bt=b.xz*${(1/T).toFixed(5)}; float ph=dot(bt,uWr)*.45-uTt*1.7, gu=.55+.45*sin(ph)*(.65+.35*sin(ph*.37+1.3)); dv+=uWd*(uWr*gu+.22*vec2(sin(uTt*2.3+bt.x*1.7),sin(uTt*2.1+bt.y*1.7)));
        vH=clamp(position.y,0.,1.); vTv=.5+.25*sin(bt.x*.19+sin(bt.y*.13)*2.)+.25*sin(bt.y*.23+sin(bt.x*.11)*2.); float h=clamp(position.y,0.,1.);
        vec3 dw=vec3(dv.x,-.45*dot(dv,dv),dv.y)*uKn*h*h*1.1; vec3 c0=instanceMatrix[0].xyz, c1=instanceMatrix[1].xyz, c2=instanceMatrix[2].xyz;
        transformed+=vec3(dot(c0,dw)/dot(c0,c0),dot(c1,dw)/dot(c1,c1),dot(c2,dw)/dot(c2,c2));
        float dm=distance(b.xz,uMe); vFd=1.-smoothstep(uFd.x,uFd.y,dm); transformed.y*=mix(.08,1.,vFd); transformed.xz*=mix(1.,${(RINGS[1].sp/RINGS[0].sp).toFixed(3)},smoothstep(${(R1*.5).toFixed(3)},${R1.toFixed(3)},dm)); }`);
    sh.fragmentShader='uniform vec3 uFd; varying float vFd,vH,vTv;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n float gh=smoothstep(0.,1.,vH); diffuseColor.rgb*=vec3(.47,.41,.47)*mix(1.,mix(.9,1.1,gh),vFd); diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*mix(vec3(.86,.97,.92),vec3(1.12,1.07,.8),vTv),gh*vFd*.8);\n diffuseColor.rgb*=mix(uFd.z,1.,vFd);'); };
  mat.customProgramCacheKey=()=>'tufts'; const mat2=mat.clone(); mat2.side=THREE.DoubleSide; mat2.onBeforeCompile=mat.onBeforeCompile; mat2.customProgramCacheKey=()=>'tufts2';
  const SN=Object.keys(SHP), ME=[]; for(const R of RINGS){ R.M={}; for(const sn of SN){ const D=SHP[sn], g=D.g[RINGS.indexOf(R)]; if(!g.userData.done){ g.translate(0,D.t[0],0); g.scale(D.t[1],D.t[2],D.t[1]); g.userData.done=1; }
    if(!g.attributes.aBend){ const ab=new THREE.InstancedBufferAttribute(new Float32Array(R.cap),1); ab.setUsage(THREE.DynamicDrawUsage); g.setAttribute('aBend',ab); } if(!D.h){ g.computeBoundingBox(); D.h=Math.max(.05,g.boundingBox.max.y); }
    const me=new THREE.InstancedMesh(g,D.two?mat2:mat,R.cap); me.count=0; me.visible=false; me.instanceMatrix.setUsage(THREE.DynamicDrawUsage); me.setColorAt(0,new THREE.Color()); me.instanceColor.setUsage(THREE.DynamicDrawUsage); (TUFTS.meshes=TUFTS.meshes||[]).push(me);
    me.frustumCulled=false; me.receiveShadow=true; me.castShadow=false; me.raycast=()=>{}; me.userData.tufts=1; me.userData.shape=sn; me.userData.tris=g.attributes.position.count/3; R.M[sn]=me; ME.push(me); } }
  const G=new THREE.Group(); G.add(...ME); let added=false;
  // the grass's height in patches, five levels: 1 today's lawn, 5 up to your knee (owner, 8 Nov 2026); paths' edges stay at 1; 3 and up leans out of the way
  TUFTS.H=[.5,.75,1,1.4,1.9]; TUFTS.level=(x,z)=>Math.min(4,Math.max(0,Math.floor((cvNoise(x/T/16,z/T/16,711)*.8+cvNoise(x/T/5,z/T/5,713)*.2-.22)/.56*5))); TUFTS.height=(x,z)=>TUFTS.H[TUFTS.level(x,z)];
  const EDGE=.7*T, edged=(x,z)=>[[EDGE,0],[-EDGE,0],[0,EDGE],[0,-EDGE]].some(([u,v])=>typeof WEEDS.fine(x+u,z+v)!=='number'), lvOf=TUFTS.lv=(x,z)=>edged(x,z)?0:TUFTS.level(x,z);
  let knee=0; const kneeOf=()=>{ const e=W3.eyeAt&&W3.eyeAt(new THREE.Vector3()), g=SHARED.groundY?SHARED.groundY(pos.x,pos.z):0, h=e?e.y-g:0; return h>1&&h<4?.3*h:.63; };
  // a chunk's tufts, once: a jittered grid over its lawn, the same wherever you come from
  const CH=new Map(), M=new THREE.Matrix4(), Q=new THREE.Quaternion(), V=new THREE.Vector3(), S=new THREE.Vector3(), up=new THREE.Vector3(0,1,0);
  const make=(key,gb)=>{ if(!gb)return null; if(!knee){ knee=kneeOf(); U.uKn.value=knee; } const CS=WEEDS.CS, x0=gb.x0, z0=gb.z0, out=[];
    RINGS.forEach((R,ri)=>{ const sp=R.sp, L={}; for(let j=Math.floor(z0/sp)-1;j<=Math.floor((z0+CS)/sp);j++)for(let i=Math.floor(x0/sp)-1;i<=Math.floor((x0+CS)/sp);i++){
        const x=(i+.1+.8*hsh(i,j,11+ri))*sp, z=(j+.1+.8*hsh(j,i,13+ri))*sp; if(x<x0||x>=x0+CS||z<z0||z>=z0+CS)continue; const K=GRASS.at(x/T,z/T); if(!K.shape)continue; const y=lawnNear(x,z); if(typeof y!=='number')continue;
        const D=SHP[K.shape], s=knee*R.sz*(.75+.5*hsh(i,j,17+ri)), w=s*D.w*(K.flat?1.5:1), a=K.flat?.35+(hsh(i,j,19)-.5)*.6:hsh(i,j,19)*6.283;
        const lv=lvOf(x,z), sy0=s*K.hi*(K.flat?.4:1), sy5=Math.max(sy0,knee*(.9+.2*hsh(i,j,29+ri))/D.h), sy=sy0+(sy5-sy0)*lv/4;
        M.compose(V.set(x,y,z),Q.setFromAxisAngle(up,a),S.set(w,sy,w)); (L[K.shape]=L[K.shape]||[]).push(x,z,...M.elements,KC[K.i](hsh(i,j,23+ri)),lv>=2?1:0);
      }
      // tufts and weeds at the foot of every tree and thing on the lawn (owner, 2 Nov 2026: "add tufts at bottom of trees naturally"; 9 Nov 2026: "more natural tufts and weeds around the bases"): a ragged ring of taller ones hugging each foot (WEEDS.feet: [x, z, its radius, how far out they run]), thickest against it, some of them weeds' blades
      if(!ri)for(const [fx,fz,fr,fw=.9*T] of WEEDS.feet||[]){ if(fx<x0-fr-fw-T||fx>=x0+CS+fr+fw+T||fz<z0-fr-fw-T||fz>=z0+CS+fr+fw+T)continue; const n=Math.ceil(6.283*(fr+.4*fw)/(.17*T)*(.8+.4*hsh(Math.round(fx),Math.round(fz),31)));
        for(let k=0;k<n;k++){ const h1=hsh(Math.round(fx*7)+k,Math.round(fz*7),33), h2=hsh(k,Math.round(fx*3+fz*5),37), a=k/n*6.283+(h1-.5)*.7, d=fr+.05*T+Math.pow(h2,1.7)*fw, x=fx+Math.cos(a)*d, z=fz+Math.sin(a)*d; if(x<x0||x>=x0+CS||z<z0||z>=z0+CS)continue;
          const K=GRASS.at(x/T,z/T), sn=hsh(k,Math.round(fz*3+fx*5),39)<.35?'blade':K.shape||'clump'; let y=lawnNear(x,z); if(typeof y!=='number'){ if(typeof WEEDS.fine(x,z)==='undefined'||WEEDS.isOff(x,z))continue; y=SHARED.groundY(x,z); }
          const D=SHP[sn], tall=1.3+.9*(1-Math.min(1,(d-fr)/fw))*(.8+.4*h1), s=knee*R.sz*(.85+.4*h2), w=s*D.w*(K.flat?1.4:1.1), M2=M.compose(V.set(x,y,z),Q.setFromAxisAngle(up,h1*6.283),S.set(w,s*TUFTS.height(x,z)*Math.max(.7,K.hi)*tall*(K.flat?.5:1),w));
          (L[sn]=L[sn]||[]).push(x,z,...M2.elements,KC[K.i](h2),TUFTS.level(x,z)>=2?1:0); } }
      out.push(L); });
    return {x0,z0,CS,L:out,gb}; };
  const SP=.3*T, lawnNear=(x,z)=>{ const y=WEEDS.fine(x,z); if(typeof y==='number')return y; for(const [u,v] of [[SP,0],[-SP,0],[0,SP],[0,-SP]])if(typeof WEEDS.fine(x+u,z+v)==='number')return SHARED.groundY(x,z); return null; };   // a tuft a little past the lawn's edge, so they run right up to the paths
  let dirty=true, lx=1e9, lz=1e9;
  SYS.add('weedsAdd',(k,gb)=>{ CH.set(k,make(k,gb)); dirty=true; },'140a-tufts');
  WEEDS.addFeet=L=>{ const F=WEEDS.feet=WEEDS.feet||[]; F.push(...L); for(const [k,c] of CH)if(c&&L.some(([x,z,r,w=.9*T])=>x+r+w>c.x0&&x-r-w<c.x0+c.CS&&z+r+w>c.z0&&z-r-w<c.z0+c.CS))CH.set(k,make(k,c.gb)); dirty=true; };   // feet registered after their lawn's tufts were made SYS.add('weedsDrop',k=>{ if(CH.delete(k))dirty=true; },'140a-tufts');
  // the rings round you: copied in from the chunks near enough when you have walked a little or the lawn changed
  const fill=()=>{ const px=pos.x, pz=pos.z; RINGS.forEach((R,ri)=>{ const r0=ri?R1:0, r1=ri?R2:R1; for(const sn of SN){ const me=R.M[sn], A=me.instanceMatrix.array, C=me.instanceColor.array, BA=me.geometry.attributes.aBend, B=BA.array; let n=0;
      for(const c of CH.values()){ if(!c)continue; const L=c.L[ri][sn]; if(!L)continue; const dx=Math.max(c.x0-px,0,px-c.x0-c.CS), dz=Math.max(c.z0-pz,0,pz-c.z0-c.CS); if(dx*dx+dz*dz>=r1*r1)continue;
        for(let k=0;k<L.length&&n<R.cap;k+=20){ const d=(L[k]-px)**2+(L[k+1]-pz)**2; if(d<r0*r0||d>=r1*r1)continue; for(let e=0;e<16;e++)A[n*16+e]=L[k+2+e]; const cl=L[k+18]; C[n*3]=cl.r; C[n*3+1]=cl.g; C[n*3+2]=cl.b; B[n]=L[k+19]; n++; } }
      me.count=n; me.visible=n>0&&!TUFTS.off; me.instanceMatrix.needsUpdate=true; me.instanceColor.needsUpdate=true; BA.needsUpdate=true; } }); lx=px; lz=pz; dirty=false; };
  let clk=0;   // its own clock, a fifteenth of a second a frame at most
  const cnt=R=>SN.reduce((a,sn)=>a+R.M[sn].count,0);
  TUFTS.stat=()=>({near:cnt(RINGS[0]),far:cnt(RINGS[1]),tris:ME.reduce((a,m)=>a+m.count*m.userData.tris,0),draws:ME.filter(m=>m.visible&&m.count).length,shapes:Object.fromEntries(SN.map(sn=>[sn,RINGS[0].M[sn].count+RINGS[1].M[sn].count])),chunks:CH.size,knee,ms:TUFTS.ms});
  TUFTS.meshes=ME; TUFTS.pressing=()=>PP.filter(p=>p.w).map(p=>[p.x,p.y,p.z,p.w]);
  SYS.add('life',dt=>{ const on=SHARED.LVL==='up'&&!(ROOMS&&ROOMS.cur); G.visible=on; if(!on)return; if(!added){ scene.add(G); added=true; }
    clk+=Math.min(+dt||0,1/15); U.uTt.value=clk; U.uMe.value.set(pos.x,pos.z); U.uFd.value.z=TUFTS.dark; const W=WX.now; if(W){ TUFTS.wind=.08+.42*W.wind; TUFTS.dir=W.dir; } U.uWd.value=TUFTS.wind; U.uWr.value.set(Math.cos(TUFTS.dir),Math.sin(TUFTS.dir));
    { let np=0; const RP=.6*T, add=(x,z,y)=>{ if(np>=NP||(x-pos.x)**2+(z-pos.z)**2>R1*R1)return; if(y!=null&&SHARED.groundY&&y-SHARED.groundY(x,z)>.6*T)return; PP[np++].set(x,z,RP,1); };   // who walks through the tall grass parts it (owner, 8 Nov 2026: "moves out of the way when you walk through it if its 3 or higher")
      add(pos.x,pos.z,SHARED.py); if(ONLINE.others)for(const o of ONLINE.others.values()){ const g=o.fig&&o.fig.g; if(g&&g.visible)add(g.position.x,g.position.z,g.position.y); }
      for(const N of NPCS){ if(np>=NP)break; if(N.g&&N.g.visible&&!N.far&&(N.lv==null||N.lv==='up'))add(N.g.position.x,N.g.position.z,N.g.position.y); }
      for(let i=np;i<NP;i++)PP[i].w=0; }
    if(dirty||(pos.x-lx)**2+(pos.z-lz)**2>(.7*T)**2){ const a=performance.now(); fill(); TUFTS.ms=+(performance.now()-a).toFixed(2); } },'140a-tufts'); }
