// THE SKY: SKY paints the sky's colours through the day, at sunrise, sunset and night, and its 3D cumulus (SKY.cumulus) that the sun lights and hides behind; SKY.sunCover says how much cloud is over the sun right now.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DN, LOOK, SKY, WX} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {CEL, LFX, OUT, QS, SMOOTH, SYS} from './006-map-pre.js';
import {HEMI} from './064-map-post.js';

{ const cl=v=>Math.max(0,Math.min(1,v));
  const P=[[-90,0x2a3346,0x1e2534,0x121824,0x2a3346,0x2a3346],[-18,0x2a3346,0x1e2534,0x121824,0x2a3346,0x2a3346],[-12,0x2e3450,0x1c2238,0x10162a,0x3a3048,0x262c44],
    [-6,0x3c4070,0x1f2a58,0x0f1838,0x8a4a40,0x2a3060],[-2.5,0x8a6a80,0x4a4a84,0x1e2a58,0xe8703a,0x6a5878],[0,0xd89070,0x8a7aa0,0x2e4078,0xff8a3a,0xb888a0],
    [3,0xf0b070,0x98aed0,0x3c62a8,0xffb050,0xb4bede],[8,0x9ec2ea,0x9ec2ea,0x4a84d0,0x9ec2ea,0x9ec2ea],[16,0x88b8ea,0x88b8ea,0x3f7fd8,0x88b8ea,0x88b8ea],[90,0x7aaee6,0x7aaee6,0x3270d0,0x7aaee6,0x7aaee6]];
  const MOOD={fire:{'-6':[0x4a3058,0x2a2a60,0x101838,0xb0304a,0x3a2a58],'-2.5':[0xa84a6a,0x6a3c80,0x24284e,0xff4a3a,0x8a4a78],'0':[0xff7a5a,0xc05a88,0x3a3a78,0xff5a2a,0xd87898],'3':[0xffa070,0xd08098,0x4a5aa0,0xff8a40,0xe898a8],'8':[0xa8c0e0,0xa8c0e0,0x5282cc,0xa8c0e0,0xa8c0e0]},
    soft:{'-6':[0x34405a,0x203050,0x121a34,0x6a5040,0x2a3450],'-2.5':[0x7a7888,0x4a5878,0x243050,0xc08060,0x6a6880],'0':[0xc8a088,0x8898a8,0x3a5078,0xe8a070,0xa8a0a8],'3':[0xd8b8a0,0xa0b8c0,0x4a6c98,0xf0c090,0xc0b8b8],'8':[0xa4bed8,0xa4bed8,0x5888c0,0xa4bed8,0xa4bed8]}};
  const hsh=(n,k)=>{ const v=Math.sin(n*12.9898+k*78.233)*43758.5453; return v-Math.floor(v); }, dayN=QS.get('day')!=null?+QS.get('day'):Math.floor(Date.now()/86400000);
  SKY.moodHold=QS.get('mood')||'clear';
  const W0={f:cl((hsh(dayN,1)-.2)/.6),s:cl((hsh(dayN,2)-.4)/.5)}; SKY.mood={f:0,s:0};
  const tmp=new THREE.Color(), stop=(X,k,out)=>{ out.setHex(X[k]); const F=MOOD.fire[String(X[0])], S=MOOD.soft[String(X[0])]; if(F&&SKY.mood.f)out.lerp(tmp.setHex(F[k-1]),SKY.mood.f); if(S&&SKY.mood.s)out.lerp(tmp.setHex(S[k-1]),SKY.mood.s); return out; };
  const cA=new THREE.Color(), cB=new THREE.Color(), mixS=(A,B,k,t,out)=>out.copy(stop(A,k,cA)).lerp(stop(B,k,cB),t);
  const SC={stars:0,gap:0,blood:0,sky:0}, MB=new THREE.Color(.78,.16,.09);
  const SUN=[[-2,0xff4a20],[0,0xff6428],[3,0xff8c3a],[8,0xffc070],[20,0xfff0d0],[90,0xfff8ee]];
  const U={uH:{value:new THREE.Color()},uM:{value:new THREE.Color()},uZ:{value:new THREE.Color()},uS:{value:new THREE.Color()},uA:{value:new THREE.Color()},
    uSunDir:{value:new THREE.Vector3(0,1,0)},uSunCol:{value:new THREE.Color()},uSunK:{value:0},uSunR:{value:.04},uSideK:{value:1},
    uMoonDir:{value:new THREE.Vector3(0,1,0)},uMoonK:{value:0},uMoonR:{value:.03},uMoonPh:{value:.5},uMoonCol:{value:new THREE.Color(.86,.89,.95)},uBlood:{value:0},uGap:{value:0},uSkyK:{value:0},uStar:{value:0},uStOn:{value:0},uStC:{value:null},uMwC:{value:null},uEq:{value:new THREE.Matrix3()},uSt:{value:new THREE.Vector3(0,1,1)},uMw:{value:new THREE.Vector2(1,1)},uMw1:{value:new THREE.Color(.74,.8,1)},uMw2:{value:new THREE.Color(1,.87,.64)},uFogC:{value:new THREE.Color()},uFogK:{value:0},uGrey:{value:new THREE.Color()},uGreyK:{value:0},
    uBands:{value:CEL?8:SMOOTH?0:24},uMistK:{value:0},uMistC:{value:new THREE.Color()},uT:{value:0},uCov:{value:.2},uCL:{value:1.16},uZk:{value:.62},uHk:{value:.5},uCldC:{value:new THREE.Color(.5,.49,.47)},uCldK:{value:.9},uCD:{value:1},uCumA:{value:0},uGr:{value:new THREE.Color(1,1,1)},uLift:{value:new THREE.Color()},uCool:{value:0},uLiftK:{value:0}};
  // THE CUMULUS: a field of lumpy 3D clouds (puffs heaped on a flat base) baked once into a cube the dome reads (each pixel its normal, its height in the cloud, its cover), lit live by the sun in cel steps; the field turns very slowly. SKY.cumulus makes the same clouds as meshes (the clouds below your landing, 141c).
  const CUMD='uniform vec3 uSunDir,uSunCol,uCldC,uZ,uGrey,uGr,uLift; uniform float uSunK,uCldK,uCL,uCD,uGreyK,uCool,uLiftK;';
  const CUMG=`vec3 cumShade(vec3 n,float h,vec3 v){ float r=1.-clamp(dot(n,v),0.,1.), k=clamp((dot(n,uSunDir)*.5+.5)*.8+h*.5-.2-r*r*.75,0.,1.);   // each puff's rim turned from you a step darker, so the heap reads round k=floor(k*3.+.5)/3.;
      vec3 lit=mix(vec3(1.),uCldC,uCldK)*(.62+.3*uCL)*mix(vec3(1.),uSunCol,.3*uSunK), sh=lit*vec3(.64,.65,.68)+uZ*.06, c=mix(sh,lit,k);
      c=mix(uZ*1.5+vec3(.035,.04,.055),c,uCD); return mix(c,uGrey,uGreyK*.6); }
    vec3 ungrade(vec3 c){ vec3 s=pow(max(c,0.),vec3(1./2.2)); s=(s-uLift*uLiftK)/max(1.-uLiftK,.05)/max(uGr,vec3(.05)); float l=dot(s,vec3(.3,.59,.11)); return pow(max(s/mix(vec3(1.),mix(vec3(.84,.92,1.16),vec3(1.08,1.,.88),smoothstep(.18,.62,l)),uCool),0.),vec3(2.2)); }`;   // the sky is not lit: the look's grades for lit things (138, after the screen colour: COLOUR OF EVERYTHING, HAZE OVER EVERYTHING, warm sun / cool shade) are taken back out, so it shows its own colours
  // the see-through circle in a cloud (pk): a cloud in front of you thins to a dither round where you stand on the screen, as the walls do (PEEK)
  const CUMPEEK='uniform vec3 uP; uniform vec2 uRes; float cpB(vec2 a){ a=floor(a); return fract(dot(a,vec2(.5,a.y*.75))); } void cumPeek(){ vec2 n=gl_FragCoord.xy/uRes*2.-1., d=n-uP.xy; d.x*=uRes.x/uRes.y; float r=length(d)/.34; if(r<1.&&gl_FragCoord.z*2.-1.<uP.z&&cpB(gl_FragCoord.xy*.5)*.25+cpB(gl_FragCoord.xy)<(1.-r*r)*1.25)discard; }\n';
  const CUMV=`attribute vec4 aC; attribute float aV; uniform float uDr,uSpan; uniform vec3 uIso; uniform vec2 uCC; varying vec3 vN,vW; varying float vH;
    void main(){ vec4 w=instanceMatrix*vec4(position,1.); vec3 n=normalize(mat3(instanceMatrix)*normal); float fl=step(w.y,aC.y); w.y=max(w.y,aC.y); n=normalize(mix(n,vec3(0.,-1.,0.),fl*.8)); vH=clamp((w.y-aC.y)/(aC.w*.9),0.,1.);
      if(uSpan>0.){ float x=mod(aC.x-uCC.x+uDr*aV+uSpan*.5,uSpan)-uSpan*.5+uCC.x; w.x+=x-aC.x; w.y-=((x-uCC.x)*uIso.x+(aC.z-uCC.y)*uIso.y)*uIso.z; }
      vN=normalize(mat3(modelMatrix)*n); w=modelMatrix*w; vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;
  SKY.puffs=s=>{ const P=[], n=4+Math.floor(hsh(s,1)*4), L=.5+hsh(s,2)*.35;   // in widths: a row of puffs along the base, a heap over the middle, a tower on top
    for(let k=0;k<n;k++){ const t=k/(n-1)*2-1, r=.24+.12*(1-Math.abs(t))+hsh(s,k+3)*.08; P.push([t*L,r*.3,(hsh(s,k+20)-.5)*.3,r]); }
    for(let k=0,m=2+Math.floor(hsh(s,40)*3);k<m;k++)P.push([(hsh(s,k+50)-.5)*L*1.1,.3+hsh(s,k+60)*.16,(hsh(s,k+70)-.5)*.26,.23+hsh(s,k+41)*.1]);
    for(let k=0,m=1+Math.floor(hsh(s,80)*2);k<m;k++)P.push([(hsh(s,k+90)-.5)*L*.6,.52+hsh(s,k+95)*.14,(hsh(s,k+99)-.5)*.2,.19+hsh(s,k+81)*.08]);
    return P; };
  SKY.lump=(w,h)=>{ const g=new THREE.SphereGeometry(1,w,h), P=g.attributes.position;
    for(let i=0;i<P.count;i++){ const x=P.getX(i), y=P.getY(i), z=P.getZ(i), k=1+.09*Math.sin(x*5.1+y*3.7)*Math.sin(z*4.3+y*2.9)+.05*Math.sin(x*11+z*9); P.setXYZ(i,x*k,y*k,z*k); }
    g.computeVertexNormals(); return g; };
  SKY.cumulus=(C,geo,mat)=>{ const L=[], ends=[]; for(const c of C){ for(const p of SKY.puffs(c.s))L.push([c,...p]); ends.push(L.length); }   // C: each cloud's foot (the middle of its flat base), width W, seed s, turn a, drift speed v
    const g=geo.clone(), m=new THREE.InstancedMesh(g,mat,L.length), A=new Float32Array(L.length*4), V=new Float32Array(L.length), m4=new THREE.Matrix4();
    L.forEach(([c,x,y,z,r],i)=>{ const ca=Math.cos(c.a||0), sa=Math.sin(c.a||0), W=c.W; m.setMatrixAt(i,m4.makeScale(r*W,r*W,r*W).setPosition(c.x+(x*ca-z*sa)*W,c.y+y*W,c.z+(x*sa+z*ca)*W)); A.set([c.x,c.y,c.z,W],i*4); V[i]=c.v||0; });
    g.setAttribute('aC',new THREE.InstancedBufferAttribute(A,4)); g.setAttribute('aV',new THREE.InstancedBufferAttribute(V,1)); m.frustumCulled=false; m.userData.ends=ends; return m; };
  SKY.cumMat=(U2,frag)=>new THREE.ShaderMaterial({uniforms:Object.assign({uDr:{value:0},uSpan:{value:0},uIso:{value:new THREE.Vector3()},uCC:{value:new THREE.Vector2()}},U2),vertexShader:CUMV,fragmentShader:frag});
  SKY.cumLive=pk=>SKY.cumMat({uSunDir:U.uSunDir,uSunCol:U.uSunCol,uCldC:U.uCldC,uZ:U.uZ,uGrey:U.uGrey,uSunK:U.uSunK,uCldK:U.uCldK,uCL:U.uCL,uCD:U.uCD,uGreyK:U.uGreyK,uGr:U.uGr,uLift:U.uLift,uCool:U.uCool,uLiftK:U.uLiftK,...(pk?{uP:{value:new THREE.Vector3(0,0,2)},uRes:{value:new THREE.Vector2(1,1)}}:{})},CUMD+CUMG+(pk?CUMPEEK:'')+'varying vec3 vN; varying float vH; varying vec3 vW; void main(){ '+(pk?'cumPeek(); ':'')+'gl_FragColor=vec4(ungrade(cumShade(normalize(vN),vH,normalize(cameraPosition-vW))),1.); }');   // lit as the sky's are
  const CU={N:180,n:-1,F:[]}; for(let i=0;i<CU.N;i++){ const a=hsh(i,11)*6.2832, r=Math.sqrt(hsh(i,12)*289); CU.F.push({x:Math.cos(a)*r,y:1+hsh(i,14)*.3,z:Math.sin(a)*r,W:1.2+hsh(i,13)*1.3,s:i+1,a:hsh(i,16)*6.28}); }   // a deck of clouds 1 up, out to 17 round you, heaped over each other so the whole sky is cloud
  CU.rt=new THREE.WebGLCubeRenderTarget(512,{generateMipmaps:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter}); CU.cam=new THREE.CubeCamera(.05,60,CU.rt); CU.scene=new THREE.Scene(); CU.scene.add(CU.cam);
  CU.mesh=SKY.cumulus(CU.F,SKY.lump(16,12),SKY.cumMat({},'varying vec3 vN; varying float vH; void main(){ gl_FragColor=vec4(.5+.5*normalize(vN)*(.3+.7*vH),1.); }')); CU.scene.add(CU.mesh);
  CU.bake=n=>{ CU.mesh.count=n?CU.mesh.userData.ends[n-1]:0; const cc=renderer.getClearColor(new THREE.Color()), ca=renderer.getClearAlpha(); renderer.setClearColor(0x000000,0); CU.cam.update(renderer,CU.scene); renderer.setClearColor(cc,ca); CU.n=n; };
  CU.want=cov=>Math.round(CU.N*Math.pow(cl((1-cov)/.6),.8));   // the look's CLOUD COVER (lower = more) is how many of the field's clouds are there
  CU.cover=(sx,sy,sz,ang)=>{ const ca=Math.cos(ang), sa=Math.sin(ang), rx=ca*sx+sa*sz, rz=ca*sz-sa*sx; let v=0;
    for(let i=0;i<CU.n;i++){ const C=CU.F[i], cy=C.y+.35*C.W, t=C.x*rx+cy*sy+C.z*rz; if(t<=0)continue; const d=Math.hypot(C.x-t*rx,cy-t*sy,C.z-t*rz), R=.5*C.W; v=Math.max(v,cl((R-d)/(.4*R))); } return v; };
  U.uCum={value:CU.rt.texture}; SKY.CU=CU;
  const mat=new THREE.ShaderMaterial({uniforms:U,side:THREE.BackSide,depthWrite:false,depthTest:true,
    vertexShader:'varying vec3 vD; void main(){ vD=position; vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position=p.xyww; }',
    fragmentShader:`uniform vec3 uH,uM,uS,uA,uMoonDir,uFogC; uniform float uSunR,uSideK,uMoonK,uMoonR,uMoonPh,uStar,uFogK,uBands,uMistK,uZk,uHk,uCumA,uT; uniform vec3 uMistC,uMoonCol; uniform float uBlood,uSkyK,uStOn; uniform vec3 uSt,uMw1,uMw2; uniform vec2 uMw; uniform mat3 uEq; uniform samplerCube uCum,uStC,uMwC; varying vec3 vD;
      ${CUMD}
      float hs(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); vec2 m=mod(i,256.); return mix(mix(hs(m),hs(mod(m+vec2(1,0),256.)),f.x),mix(hs(mod(m+vec2(0,1),256.)),hs(mod(m+vec2(1,1),256.)),f.x),f.y); }
      ${CUMG}
      vec3 moon(vec3 c,vec3 d,float k){ float a=acos(clamp(dot(d,uMoonDir),-1.,1.)), disc=1.-step(uMoonR,a), hr=(step(a,uMoonR*2.3)+step(a,uMoonR*4.))*.5*(1.-disc); c=mix(c,vec3(.34,.05,.04),hr*.45*uBlood*k);
        vec3 t1=normalize(cross(uMoonDir,vec3(0.,1.,0.))), t2=cross(uMoonDir,t1); vec2 q=vec2(dot(d,t1),dot(d,t2))/uMoonR; float ph=uMoonPh*6.2832, lit=step(0.,dot(vec3(q,sqrt(max(0.,1.-dot(q,q)))),vec3(sin(ph),0.,-cos(ph)))); return mix(c,mix(uMoonCol*.12,uMoonCol,lit),disc*k); }
      vec3 bt(vec3 c,float el){ return mix(c,c*vec3(1.4,.42,.38)+vec3(.05,.003,0.),uBlood*(.3+.7*(1.-smoothstep(0.,.55,el)))); }
      void main(){ vec3 d=normalize(vD); float el=max(d.y,0.); vec2 hz=normalize(d.xz+vec2(1e-4,0.)), sh=normalize(uSunDir.xz+vec2(1e-4,0.)); float cs=dot(hz,sh);
        vec3 c=mix(uH,uM,smoothstep(0.,.3,el)); c=mix(c,uZ,smoothstep(.2,.85,el));
        c=mix(c,uS,pow(max(cs,0.),3.)*exp(-el*5.)*uSideK); c=mix(c,uA,pow(max(-cs,0.),2.)*exp(-el*6.)*uSideK*.7);
        c*=1.-clamp(-d.y*2.,0.,1.)*.5; vec3 mwc=vec3(0.), st=vec3(0.);
        if(uStar>0.&&uStOn>.5){ vec3 q=uEq*d; float ex=smoothstep(-.01,.3,d.y), tw=1.+(vn(q.xy*140.+uT*5.)+vn(q.zx*140.-uT*4.)-1.)*.5*uSt.y*(1.-.7*el);   // the real sky (134ba): dimmer low down through more air, where it twinkles more
          vec3 s=textureCube(uStC,q).rgb; vec4 m=textureCube(uMwC,q); s*=smoothstep(uSt.x-.06,uSt.x,max(s.r,max(s.g,s.b))); s*=s; s=max(mix(vec3(dot(s,vec3(.3333))),s,uSt.z),0.); st=s*2.2*uStar*(.25+.75*ex)*max(tw,0.);
          mwc=mix(uMw1,uMw2,m.g)*m.r*m.r*.5*uMw.x*min(uStar,1.2)*ex*mix(1.,.35+1.3*hs(floor(q.xy*420.)+floor(q.z*420.)*37.),uMw.y); }   // grained like the countless faint stars it is, so the picture's 15-bit colour never steps it into flat patches
        c=moon(c,d,uMoonK);
        { float ang=acos(clamp(dot(d,uSunDir),-1.,1.)); float disc=1.-step(uSunR,ang); float halo=(1.-smoothstep(uSunR,uSunR*4.,ang))*.45; if(uBands>0.)halo=floor(halo*3.)/3.*.45;
          c=mix(c,mix(uSunCol,vec3(1.,.96,.9),.45),halo*uSunK); c=mix(c,uSunCol,disc*uSunK); }
        c=mix(c,uGrey,uGreyK); c=mix(c,uFogC,uFogK*(1.-smoothstep(0.,.4,el)));
        if(uMistK>0.){ vec3 sk=c, m=mix(uMistC*uHk,uMistC*.95,smoothstep(0.,.22,el)); m=mix(m,uMistC*uZk,smoothstep(.35,.95,el)); m=mix(m,uMistC*uHk,1.-smoothstep(0.,.06,el));
          m=mix(m,mix(sk,uS*.7+uMistC*.3,.3),uSkyK*smoothstep(0.,.08,el)); c=mix(c,m,uMistK*(1.-smoothstep(0.,.06,el))); }   // only where land meets sky: above it the sky, clouds and sun are clear of the mist (owner, 2 Nov 2026)
        float D=0.; if(d.y>-.02){ float sa=sin(uCumA), ca=cos(uCumA); vec4 g=textureCube(uCum,vec3(ca*d.x+sa*d.z,d.y,ca*d.z-sa*d.x)); D=smoothstep(.12,.8,g.a)*smoothstep(-.01,.04,d.y);   // the cumulus: soft-edged puffs
          if(D>.003){ vec3 v=g.rgb/max(g.a,.02)*2.-1.; float m=length(v); vec3 n=v/max(m,.001); n=vec3(ca*n.x-sa*n.z,n.y,sa*n.x+ca*n.z);
            vec3 cc=cumShade(n,clamp((m-.3)/.7,0.,1.),-d); float sp=max(dot(d,uSunDir),0.); cc+=uSunCol*g.a*(1.-g.a)*4.*(pow(sp,10.)*1.3+pow(sp,3.)*.25)*uSunK;   // a silver lining by the sun
            cc=mix(cc,c,(1.-smoothstep(0.,.22,el))*.5); c=mix(c,cc,D); } }   // the far ones low down fade into the sky
        { float sp=dot(d,uSunDir); if(sp>0.&&uSunK>0.){ vec3 ax=normalize(cross(uSunDir,vec3(0.,1.,.001))), ay=cross(uSunDir,ax); float an=atan(dot(d,ay),dot(d,ax)), r=vn(vec2(an*7.,uT*.015))*.6+vn(vec2(an*19.,uT*.01+5.))*.4;   // rays from the sun behind the clouds, through the gaps most
            c+=mix(uSunCol,vec3(1.,.97,.9),.5)*smoothstep(.45,.95,r)*pow(sp,3.)*(.1+.16*(1.-D))*uSunK; } }
        c=bt(c,el);
        if(uMistK>0.){ vec3 q=pow(max(c,0.),vec3(1./2.2)); float y=max(dot(q,vec3(.299,.587,.114)),1e-4); c=pow(q*(floor(y*16.+.5)/16./y),vec3(2.2)); } else if(uBands>0.){ float y=max(dot(c,vec3(.299,.587,.114)),1e-4); c*=floor(y*uBands+.5)/uBands/y; }   // bands of brightness, each its own hue: rounding each colour apart striped the blue with lilac
        c+=(st+mwc)*(1.-uGreyK)*(1.-uFogK)*(1.-D)*(1.-.85*uMoonK*smoothstep(uMoonR*1.05,uMoonR,acos(clamp(dot(d,uMoonDir),-1.,1.))));   // the stars and the Milky Way, smooth over the banded sky, never through the moon
        gl_FragColor=vec4(ungrade(c),1.); }`});
  const dome=new THREE.Mesh(new THREE.BoxGeometry(2000,2000,2000),mat); dome.frustumCulled=false; dome.renderOrder=900; dome.matrixAutoUpdate=true; scene.add(dome); SKY.dome=dome; SKY.on=()=>dome.visible||!!(SKY.cumOn&&SKY.cumOn()); OUT.add(dome,'sky');
  dome.onBeforeRender=(r,s,c)=>{ dome.position.copy(c.position); dome.scale.setScalar(c.isOrthographicCamera?Math.max(1,(c.right-c.left)*1.2/2000):1); dome.updateMatrixWorld(); };
  {
    SKY.sunCover=0; }
  const ca=new THREE.Color(), cb=new THREE.Color(), mixC=(a,b,t,out)=>out.copy(ca.setHex(a)).lerp(cb.setHex(b),t), D=Math.PI/180;
  SYS.add('sky',(dt)=>{
    const up=SHARED.LVL!=='down'; 
    if(!(LFX.on&&LFX.on.has&&LFX.on.has('cool')))LOOK.cool.value=dome.visible?.7*cl(1-Math.abs(CLOCK.elev()-3)/10):0;
    U.uT.value+=dt; if(!SKY.on())return;
    { const on=!!(LOOK.sp&&LOOK.sp.enabled&&DN.U); U.uGr.value.setRGB(1,1,1); U.uLiftK.value=0; U.uCool.value=on?LOOK.cool.value:0; if(on){ U.uGr.value.copy(DN.U.grade.value); U.uLift.value.copy(DN.U.lift.value); U.uLiftK.value=DN.U.liftK.value; } }
    const e=CLOCK.elev(); let i=0; while(i<P.length-2&&e>P[i+1][0])i++; const A=P[i], B=P[i+1], t=cl((e-A[0])/(B[0]-A[0]));
    const W=WX.now||{cloud:.2,storm:0,fog:0,flash:false}, day=cl((e+4)/14);
    { const hold=SKY.moodHold, ws=hold==='soft'?1:hold?0:cl(W0.s+cl((W.cloud-.35)/.4)*.7), wf=hold==='fire'?1:hold?0:W0.f*(1-ws); SKY.mood.f=wf; SKY.mood.s=ws; }
    mixS(A,B,1,t,U.uH.value); mixS(A,B,2,t,U.uM.value); mixS(A,B,3,t,U.uZ.value); mixS(A,B,4,t,U.uS.value); mixS(A,B,5,t,U.uA.value);
    U.uSideK.value=1-.6*cl((e-8)/20);
    U.uSunDir.value.copy(CLOCK.sunV); U.uSunR.value=(1.6+1.4*(1-cl(e/12)))*D; { let j=0; while(j<SUN.length-2&&e>SUN[j+1][0])j++; mixC(SUN[j][1],SUN[j+1][1],cl((e-SUN[j][0])/(SUN[j+1][0]-SUN[j][0])),U.uSunCol.value); }
    U.uSunK.value=cl((e+1.5)/1.5)*(1-.9*cl((W.cloud-.3)/.6));
    { const n=CU.want(U.uCov.value+U.uGap.value); if(n!==CU.n)CU.bake(n); U.uCumA.value=U.uT.value*1.5e-4; U.uCD.value=cl((e+5)/10);   // the field turns about once in twelve hours
      const sv=CLOCK.sunV, cv=CU.cover(sv.x,sv.y,sv.z,U.uCumA.value); SKY.sunCover+=(cv-SKY.sunCover)*Math.min(1,dt*2.5); }
    U.uMoonDir.value.copy(CLOCK.moonV); const night=cl((-e-4)/6), ml=CLOCK.moonLit(); U.uMoonPh.value=CLOCK.moonPhase(); U.uMoonK.value=night*(1-.8*cl((W.cloud-.3)/.6)); U.uStar.value=night*(1-cl(W.cloud*1.4)*(1-SC.stars))*(1-.35*ml); U.uGap.value=SC.gap; U.uSkyK.value=Math.max(SC.sky,cl((e-3)/10)*(1-cl((W.cloud-.4)/.5))*.85); U.uBlood.value=SC.blood*night; U.uMoonR.value=.03+.025*SC.blood; U.uMoonCol.value.setRGB(.86,.89,.95).lerp(MB,SC.blood); if(SC.blood&&up)HEMI.color.lerp(MB,.55*SC.blood*night);
    U.uGrey.value.setRGB(.55,.58,.62).multiplyScalar(.25+.75*day); if(W.storm)U.uGrey.value.multiplyScalar(1-.45*W.storm); U.uGreyK.value=cl(W.cloud*W.cloud*.85);
    if(W.flash&&up){ U.uGrey.value.setRGB(.85,.88,.95); U.uGreyK.value=Math.max(U.uGreyK.value,.9); }
    if(scene.fog){ U.uFogC.value.copy(scene.fog.color); U.uFogK.value=cl(W.fog*1.3); } else U.uFogK.value=0; },'132-sky');
  SKY.dbg=()=>({elev:+CLOCK.elev().toFixed(2),cover:+SKY.sunCover.toFixed(2),fire:+SKY.mood.f.toFixed(2),soft:+SKY.mood.s.toFixed(2),cool:typeof LOOK!=='undefined'?+LOOK.cool.value.toFixed(2):null,sun:U.uSunK.value.toFixed(2),moon:U.uMoonK.value.toFixed(2),star:U.uStar.value.toFixed(2),grey:U.uGreyK.value.toFixed(2),H:'#'+U.uH.value.getHexString(),Z:'#'+U.uZ.value.getHexString()});
  SKY.U=U; SKY.P=P; SKY.SC=SC; SKY.MB=MB; window.SKY=SKY; }
