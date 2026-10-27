// THE TUFTS: knee-high faceted tufts like little tree crowns over every lawn near you (whole ones close, the same rounded ones a little coarser further out, one draw each), leaning away from whoever walks through and springing back.
import {SHARED, THREE} from './003-shx.js';
import {pos, ROOMS, W3, WEEDS} from './003b-systems.js';
import {scene} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';
import {TUFTC} from './014-gamekit.js';
const TUFTS=window.TUFTS={wind:0};
{ const T=TILE, R1=10*T, R2=22*T, NP=24, hsh=(a,b,s)=>{ let h=(a*374761393+b*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const RINGS=[{sp:.4,sz:1,cap:Math.ceil(Math.PI*R1*R1/(.4*.4)*1.15),geo:new THREE.SphereGeometry(.5,7,4,0,6.283,0,1.75)},{sp:.62,sz:1,cap:Math.ceil(Math.PI*(R2*R2-R1*R1)/(.62*.62)*1.15),geo:new THREE.SphereGeometry(.5,5,3,0,6.283,0,1.75)}];
  const W=TUFTC.reduce((a,c)=>a+c[3],0), COLS=TUFTC.map(c=>new THREE.Color().setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace)), pick=r=>{ r*=W; for(let i=0;i<TUFTC.length;i++)if((r-=TUFTC[i][3])<0)return COLS[i]; return COLS[0]; };
  const PP=[...Array(NP)].map(()=>new THREE.Vector4()), U={uPP:{value:PP},uTt:{value:0},uKn:{value:.6},uWd:{value:TUFTS.wind}};
  // each tuft leans away from what presses it (more at its top); the push is turned into the tuft's own frame (a turn about Y and a scale)
  const mat=new THREE.MeshLambertMaterial({flatShading:true}); mat.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U);
    sh.vertexShader='uniform vec4 uPP['+NP+']; uniform float uTt,uKn,uWd;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      { vec3 b=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz; vec2 dv=vec2(0.); for(int i=0;i<${NP};i++){ vec4 p=uPP[i]; if(p.w==0.)continue; vec2 d=b.xz-p.xy; float l=length(d), f=1.-l/p.z; if(f<=0.)continue; f=f*f*(3.-2.*f); dv+=d/max(l,.001)*f*p.w; }
        float m=length(dv); if(m>1.)dv/=m; dv+=uWd*vec2(sin(uTt*.9+b.x*.35+b.z*.2),sin(uTt*.7+b.z*.3-b.x*.15)); float h=clamp(position.y,0.,1.);
        vec3 dw=vec3(dv.x,-.45*dot(dv,dv),dv.y)*uKn*h*h*1.1; vec3 c0=instanceMatrix[0].xyz, c1=instanceMatrix[1].xyz, c2=instanceMatrix[2].xyz;
        transformed+=vec3(dot(c0,dw)/dot(c0,c0),dot(c1,dw)/dot(c1,c1),dot(c2,dw)/dot(c2,c2)); }`); };
  mat.customProgramCacheKey=()=>'tufts';
  for(const R of RINGS){ R.geo.translate(0,.36,0); R.geo.scale(.5,.62,.5); R.me=new THREE.InstancedMesh(R.geo,mat,R.cap); R.me.count=0; R.me.instanceMatrix.setUsage(THREE.DynamicDrawUsage); R.me.setColorAt(0,COLS[0]); R.me.instanceColor.setUsage(THREE.DynamicDrawUsage);
    R.me.frustumCulled=false; R.me.receiveShadow=true; R.me.castShadow=false; R.me.raycast=()=>{}; R.me.userData.tufts=1; }
  const G=new THREE.Group(); G.add(...RINGS.map(R=>R.me)); let added=false;
  let knee=0; const kneeOf=()=>{ const e=W3.eyeAt&&W3.eyeAt(new THREE.Vector3()), g=SHARED.groundY?SHARED.groundY(pos.x,pos.z):0, h=e?e.y-g:0; return h>1&&h<4?.3*h:.63; };
  // a chunk's tufts, once: a jittered grid over its lawn, the same wherever you come from
  const CH=new Map(), M=new THREE.Matrix4(), Q=new THREE.Quaternion(), V=new THREE.Vector3(), S=new THREE.Vector3(), up=new THREE.Vector3(0,1,0);
  const make=(key,gb)=>{ if(!gb)return null; if(!knee){ knee=kneeOf(); U.uKn.value=knee; } const CS=WEEDS.CS, x0=gb.x0, z0=gb.z0, out=[];
    RINGS.forEach((R,ri)=>{ const sp=R.sp, L=[]; for(let j=Math.floor(z0/sp)-1;j<=Math.floor((z0+CS)/sp);j++)for(let i=Math.floor(x0/sp)-1;i<=Math.floor((x0+CS)/sp);i++){
        const x=(i+.1+.8*hsh(i,j,11+ri))*sp, z=(j+.1+.8*hsh(j,i,13+ri))*sp; if(x<x0||x>=x0+CS||z<z0||z>=z0+CS)continue; const y=lawnNear(x,z); if(typeof y!=='number')continue;
        const s=knee*R.sz*(.75+.5*hsh(i,j,17+ri)); M.compose(V.set(x,y,z),Q.setFromAxisAngle(up,hsh(i,j,19)*6.283),S.set(s*2.3,s,s*2.3)); L.push(x,z,...M.elements,pick(hsh(i,j,23+ri)));
      } out.push(L); });
    return {x0,z0,CS,L:out}; };
  const SP=.3*T, lawnNear=(x,z)=>{ const y=WEEDS.fine(x,z); if(typeof y==='number')return y; for(const [u,v] of [[SP,0],[-SP,0],[0,SP],[0,-SP]])if(typeof WEEDS.fine(x+u,z+v)==='number')return SHARED.groundY(x,z); return null; };   // a tuft a little past the lawn's edge, so they run right up to the paths
  let dirty=true, lx=1e9, lz=1e9;
  SYS.add('weedsAdd',(k,gb)=>{ CH.set(k,make(k,gb)); dirty=true; },'140a-tufts'); SYS.add('weedsDrop',k=>{ if(CH.delete(k))dirty=true; },'140a-tufts');
  // the rings round you: copied in from the chunks near enough when you have walked a little or the lawn changed
  const fill=()=>{ const px=pos.x, pz=pos.z; RINGS.forEach((R,ri)=>{ const r0=ri?R1:0, r1=ri?R2:R1, A=R.me.instanceMatrix.array, C=R.me.instanceColor.array; let n=0;
      for(const c of CH.values()){ if(!c)continue; const dx=Math.max(c.x0-px,0,px-c.x0-c.CS), dz=Math.max(c.z0-pz,0,pz-c.z0-c.CS); if(dx*dx+dz*dz>=r1*r1)continue; const L=c.L[ri];
        for(let k=0;k<L.length&&n<R.cap;k+=19){ const d=(L[k]-px)**2+(L[k+1]-pz)**2; if(d<r0*r0||d>=r1*r1)continue; for(let e=0;e<16;e++)A[n*16+e]=L[k+2+e]; const cl=L[k+18]; C[n*3]=cl.r; C[n*3+1]=cl.g; C[n*3+2]=cl.b; n++; } }
      R.me.count=n; R.me.instanceMatrix.needsUpdate=true; R.me.instanceColor.needsUpdate=true; }); lx=px; lz=pz; dirty=false; };
  // what presses: whoever walks near (WEEDS.movers), and where they were a moment ago, springing back
  const trail=[]; let clk=0;   // its own clock, a fifteenth of a second a frame at most, so a slow frame doesn't skip the spring
  const press=now=>{ const MV=WEEDS.movers||[], live=[]; for(const m of MV){ if(m.w<.5)continue; const r=m.z*2.1; live.push([m.x,m.y,r]); let q=null;
      for(const p of trail)if((p[0]-m.x)**2+(p[1]-m.y)**2<(.4*T)**2){ q=p; break; } if(q)q[3]=now; else trail.push([m.x,m.y,r,now]); }
    for(let i=trail.length-1;i>=0;i--)if(now-trail[i][3]>1.4)trail.splice(i,1);
    const rel=trail.filter(p=>now-p[3]>.02).sort((a,b)=>b[3]-a[3]); let i=0;
    for(const l of live)if(i<NP)PP[i++].set(l[0],l[1],l[2],1);
    for(const p of rel){ if(i>=NP)break; const a=now-p[3]; PP[i++].set(p[0],p[1],p[2],Math.exp(-3*a)*Math.cos(4*a)); }
    for(;i<NP;i++)PP[i].w=0; };
  TUFTS.stat=()=>({near:RINGS[0].me.count,far:RINGS[1].me.count,tris:RINGS[0].me.count*20+RINGS[1].me.count*8,draws:RINGS.filter(R=>R.me.visible&&R.me.count).length,chunks:CH.size,knee,ms:TUFTS.ms});
  TUFTS.meshes=RINGS.map(R=>R.me); TUFTS.pressing=()=>PP.filter(p=>p.w).map(p=>[p.x,p.y,p.z,p.w]);
  SYS.add('life',dt=>{ const on=SHARED.LVL==='up'&&!(ROOMS&&ROOMS.cur); G.visible=on; if(!on)return; if(!added){ scene.add(G); added=true; }
    clk+=Math.min(+dt||0,1/15); U.uTt.value=clk; U.uWd.value=TUFTS.wind; press(clk);
    if(dirty||(pos.x-lx)**2+(pos.z-lz)**2>(.7*T)**2){ const a=performance.now(); fill(); TUFTS.ms=+(performance.now()-a).toFixed(2); } },'140a-tufts'); }
