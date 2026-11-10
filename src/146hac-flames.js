// THE FLAMES: the flamethrower's other looks, one per mode (FLAMES.MODES): JET (a jet of burning fuel as glowing drops stretched along their flight, white at the nozzle, orange, red, then smoke), TUBE (a cel flame wrapped round the stream, hard bands of yellow, orange and red licking along it) and PLASMA (a straight blue-white bolt in a glow, lightning crackling round it); FLUID is the fire sim (146hab).
import {THREE} from './003-shx.js';
import {LEVELS} from './003b-systems.js';
import {scene} from './004-main.js';
import {MODS, TILE} from './006-map-pre.js';
{ const M=TILE/.84, V3=THREE.Vector3, rnd=Math.random, uT={value:0};
  const FL={MODES:['fluid','jet','tube','plasma'],NAMES:{fluid:'FLUID FIRE',jet:'FUEL JET',tube:'CEL FLAME',plasma:'PLASMA'}}; MODS.flames=FL;
  const own=o=>{ o.frustumCulled=false; o.raycast=()=>{}; o.userData.anyRoom=1; scene.add(LEVELS.own(o,'*')); return o; };
  const HASH='float h1(float n){ return fract(sin(n)*43758.5453); } float h2(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); } float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y); } float fbm(vec2 p){ return .55*vn(p)+.3*vn(p*2.1+3.7)+.15*vn(p*4.3+9.1); }\n';
  const RAMP='vec3 ramp(float h){ vec3 c=mix(vec3(.42,.035,.01),vec3(1.,.26,.03),smoothstep(.02,.32,h)); c=mix(c,vec3(1.,.62,.12),smoothstep(.28,.6,h)); return mix(c,vec3(1.,.93,.66),smoothstep(.62,.92,h)); }\n';

  /* ---------- JET: each drop of burning fuel a billboard stretched along its flight; premultiplied, so fire adds light and smoke darkens ---------- */
  const NJ=1600, jg=new THREE.InstancedBufferGeometry(); jg.index=new THREE.PlaneGeometry(1,1).index; jg.setAttribute('position',new THREE.PlaneGeometry(1,1).attributes.position); jg.setAttribute('uv',new THREE.PlaneGeometry(1,1).attributes.uv);
  const iP=new THREE.InstancedBufferAttribute(new Float32Array(NJ*4),4), iV=new THREE.InstancedBufferAttribute(new Float32Array(NJ*3),3), iD=new THREE.InstancedBufferAttribute(new Float32Array(NJ*2),2);
  for(const a of [iP,iV,iD])a.setUsage(THREE.DynamicDrawUsage); jg.setAttribute('iP',iP); jg.setAttribute('iV',iV); jg.setAttribute('iD',iD); jg.instanceCount=0;
  const jMat=new THREE.ShaderMaterial({uniforms:{uT},transparent:true,depthWrite:false,toneMapped:false,blending:THREE.CustomBlending,blendSrc:THREE.OneFactor,blendDst:THREE.OneMinusSrcAlphaFactor,
    vertexShader:`attribute vec4 iP; attribute vec3 iV; attribute vec2 iD; varying vec2 vU; varying vec2 vD;
void main(){ vU=uv; vD=iD; vec4 mv=viewMatrix*vec4(iP.xyz,1.); vec2 d=(viewMatrix*vec4(iV,0.)).xy; float L=length(d); vec2 a=L>1e-5?d/L:vec2(1.,0.), b=vec2(-a.y,a.x);
  mv.xy+=a*position.x*(iP.w+L)+b*position.y*iP.w; gl_Position=projectionMatrix*mv; }`,
    fragmentShader:HASH+RAMP+`uniform float uT; varying vec2 vU; varying vec2 vD;
void main(){ vec2 p=vU*2.-1.; float r=length(p), n=fbm(p*1.6+vec2(vD.y*7.,-uT*6.)), a=(1.-smoothstep(.15,1.,r+(.5-n)*.55)); if(a<.01)discard;
  float age=vD.x, heat=clamp(1.15-age*1.25,0.,1.)*(.75+.5*n), smoke=smoothstep(.55,.95,age);
  vec3 fire=ramp(heat)*(1.+1.4*heat); vec4 f=vec4(fire*a,a*.25), s=vec4(vec3(.05,.045,.04)*a,a*.55); gl_FragColor=mix(f,s,smoke)*(1.-smoothstep(.85,1.,age)); }`});
  const jMe=own(new THREE.Mesh(jg,jMat)); jMe.renderOrder=6; jMe.name='fuel jet'; jMe.visible=false;
  // L: the stream's drops {q:{x,y,z,vx,vy,vz,t,life,sd}}, hot ones first
  FL.jet=L=>{ '@later'; let n=0; const P=iP.array, V=iV.array, D=iD.array;
    for(const q of L){ if(n>=NJ)break; const age=Math.min(1,q.t/q.life), s=(.05+age*.75)*M*(q.big||1), k=.035*(1-age*.6);
      P[n*4]=q.x; P[n*4+1]=q.y; P[n*4+2]=q.z; P[n*4+3]=s; V[n*3]=q.vx*k; V[n*3+1]=q.vy*k; V[n*3+2]=q.vz*k; D[n*2]=age; D[n*2+1]=q.sd||0; n++; }
    jg.instanceCount=n; jMe.visible=n>0; if(n){ iP.needsUpdate=true; iV.needsUpdate=true; iD.needsUpdate=true; } };

  /* ---------- the tubes along a stream's path (TUBE's flame, PLASMA's bolt and glow): rings resampled by length, rebuilt each frame ---------- */
  const K=28, SD=10, tubeG=()=>{ const g=new THREE.BufferGeometry(), I=[]; for(let i=0;i<K-1;i++)for(let j=0;j<SD;j++){ const a=i*(SD+1)+j, b=a+SD+1; I.push(a,b,a+1,b,b+1,a+1); }
      g.setIndex(I); g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(K*(SD+1)*3),3).setUsage(THREE.DynamicDrawUsage)); g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(K*(SD+1)*3),3).setUsage(THREE.DynamicDrawUsage));
      const uv=new Float32Array(K*(SD+1)*2); for(let i=0;i<K;i++)for(let j=0;j<=SD;j++){ uv[(i*(SD+1)+j)*2]=j/SD; uv[(i*(SD+1)+j)*2+1]=i/(K-1); } g.setAttribute('uv',new THREE.BufferAttribute(uv,2)); return g; };
  const C=[...Array(K)].map(()=>new V3()), Tn=new V3(), N1=new V3(), B1=new V3(), A=new V3(), W=new V3(0,1,0);
  // the path resampled into K points evenly by length; returns its length
  const resample=P=>{ let tot=0; const cum=[0]; for(let i=1;i<P.length;i++){ tot+=P[i].distanceTo(P[i-1]); cum.push(tot); }
    for(let i=0,s=1;i<K;i++){ const d=tot*i/(K-1); while(s<P.length-1&&cum[s]<d)s++; const a=P[s-1]||P[0], b=P[s]||P[0], l=(cum[s]-cum[s-1])||1; C[i].copy(a).lerp(b,Math.max(0,Math.min(1,(d-cum[s-1])/l))); } return tot; };
  const ringUp=(g,rad)=>{ const p=g.attributes.position.array, nm=g.attributes.normal.array;
    for(let i=0;i<K;i++){ Tn.subVectors(C[Math.min(K-1,i+1)],C[Math.max(0,i-1)]); if(Tn.lengthSq()<1e-10)Tn.set(0,0,1); Tn.normalize(); N1.crossVectors(Tn,Math.abs(Tn.y)>.95?A.set(1,0,0):W).normalize(); B1.crossVectors(Tn,N1);
      const r=rad(i/(K-1),i); for(let j=0;j<=SD;j++){ const a=j/SD*Math.PI*2, cx=Math.cos(a), sy=Math.sin(a), q=(i*(SD+1)+j)*3, nx=N1.x*cx+B1.x*sy, ny=N1.y*cx+B1.y*sy, nz=N1.z*cx+B1.z*sy;
        p[q]=C[i].x+nx*r; p[q+1]=C[i].y+ny*r; p[q+2]=C[i].z+nz*r; nm[q]=nx; nm[q+1]=ny; nm[q+2]=nz; } }
    g.attributes.position.needsUpdate=true; g.attributes.normal.needsUpdate=true; };
  const pool=make=>{ const L=[]; return {get:i=>L[i]||(L[i]=make()),hide:n=>{ for(let i=n;i<L.length;i++)L[i].visible=false; }}; };

  /* ---------- TUBE: an opaque cel flame: noise running along the stream cut into hard bands; ragged where it thins out ---------- */
  const tMat=new THREE.ShaderMaterial({uniforms:{uT},toneMapped:false,side:THREE.DoubleSide,
    vertexShader:'varying vec2 vU; varying float vF; void main(){ vU=uv; vec4 mv=modelViewMatrix*vec4(position,1.); vec3 n=normalize(normalMatrix*normal); vF=abs(dot(n,normalize(-mv.xyz))); gl_Position=projectionMatrix*mv; }',
    fragmentShader:HASH+`uniform float uT; varying vec2 vU; varying float vF;
void main(){ float v=vU.y, n=fbm(vec2(vU.x*5.,v*9.-uT*14.)), h=(1.-v*.55)*(.35+.65*vF)+(n-.5)*.9-smoothstep(.75,1.,v)*.35;
  if(h<.12)discard; vec3 c=h>.72?vec3(1.,.96,.72):h>.5?vec3(1.,.8,.2):h>.3?vec3(1.,.45,.06):vec3(.78,.13,.03); gl_FragColor=vec4(c*1.15,1.); }`});
  const TP=pool(()=>{ const m=own(new THREE.Mesh(tubeG(),tMat)); m.name='cel flame'; m.renderOrder=5; return m; });
  FL.tube=(L,t)=>{ '@later'; let n=0; for(const S of L){ if(S.P.length<2)continue; const m=TP.get(n++), len=resample(S.P), w=Math.min(1,len/(2*M));
      ringUp(m.geometry,(v,i)=>M*(.05+.62*w*Math.pow(v,1.1))*(1+.22*Math.sin(t*23+i*1.9)+.12*Math.sin(t*41-i*3.1))); m.visible=true; } TP.hide(n); };

  /* ---------- PLASMA: a white-hot core, a blue glow round it (both added light) and lightning crackling along it ---------- */
  const pMat=(core)=>new THREE.ShaderMaterial({uniforms:{uT},transparent:true,depthWrite:false,toneMapped:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
    vertexShader:'varying vec2 vU; varying float vF; void main(){ vU=uv; vec4 mv=modelViewMatrix*vec4(position,1.); vec3 n=normalize(normalMatrix*normal); vF=abs(dot(n,normalize(-mv.xyz))); gl_Position=projectionMatrix*mv; }',
    fragmentShader:HASH+`uniform float uT; varying vec2 vU; varying float vF;
void main(){ float v=vU.y, pulse=.75+.25*sin(v*60.-uT*90.), n=vn(vec2(vU.x*6.,v*30.-uT*40.));`+(core
      ?' float a=pow(vF,1.5)*pulse*(.8+.4*n); gl_FragColor=vec4(mix(vec3(.55,.75,1.),vec3(1.),vF)*a*1.6,1.); }'
      :' float a=pow(vF,2.5)*(.35+.25*n)*pulse*(1.-.4*v); gl_FragColor=vec4(vec3(.25,.45,1.)*a,1.); }')});
  const pCore=pMat(1), pGlow=pMat(0), arcMat=new THREE.LineBasicMaterial({color:0xcfe9ff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
  const NA=5, SG=9, PP=pool(()=>{ const g=new THREE.Group(), c=new THREE.Mesh(tubeG(),pCore), o=new THREE.Mesh(tubeG(),pGlow), ag=new THREE.BufferGeometry();
      ag.setAttribute('position',new THREE.BufferAttribute(new Float32Array(NA*SG*2*3),3).setUsage(THREE.DynamicDrawUsage)); const a=new THREE.LineSegments(ag,arcMat);
      for(const x of [c,o,a]){ x.frustumCulled=false; x.raycast=()=>{}; } c.renderOrder=7; o.renderOrder=7; a.renderOrder=7; g.add(c,o,a); g.c=c; g.o=o; g.a=a; g.at=0; g.name='plasma'; return own(g); });
  FL.plasma=(L,t)=>{ '@later'; let n=0; for(const S of L){ if(S.P.length<2)continue; const g=PP.get(n++), len=resample(S.P);
      ringUp(g.c.geometry,v=>M*.035*(1+.3*Math.sin(t*60+v*30))*(v<.03?v/.03:1)); ringUp(g.o.geometry,v=>M*(.16+.06*Math.sin(t*17+v*9))*Math.min(1,.4+v*3));
      if(t-g.at>.05){ g.at=t; const p=g.a.geometry.attributes.position.array; let q=0;
        for(let k=0;k<NA;k++){ const i0=Math.floor(rnd()*(K-4)), i1=Math.min(K-1,i0+2+Math.floor(rnd()*4)), sp=(.12+rnd()*.25)*M; let x=C[i0].x, y=C[i0].y, z=C[i0].z;
          for(let s=1;s<=SG;s++){ const f=s/SG, e=s===SG?.3:1; A.copy(C[i0]).lerp(C[i1],f); const nx=A.x+(rnd()-.5)*2*sp*e, ny=A.y+(rnd()-.5)*2*sp*e, nz=A.z+(rnd()-.5)*2*sp*e;
            p[q++]=x; p[q++]=y; p[q++]=z; p[q++]=nx; p[q++]=ny; p[q++]=nz; x=nx; y=ny; z=nz; } }
        g.a.geometry.attributes.position.needsUpdate=true; }
      g.visible=len>.05*M; } PP.hide(n); };
  FL.time=t=>{ uT.value=t; }; }
