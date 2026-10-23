// THE SKY: SKY paints the sky's colours through the day, at sunrise, sunset and night, and its clouds in layers that the sun lights and hides behind; SKY.sunCover says how much cloud is over the sun right now.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, LOOK, SKY, WX} from './003b-systems.js';
import {scene} from './004-main.js';
import {CEL, LFX, OUT, QS, SMOOTH, SYS} from './006-map-pre.js';
import {HEMI} from './064-map-post.js';

{ const cl=v=>Math.max(0,Math.min(1,v));
  const P=[[-90,0x0b1024,0x060918,0x030409,0x0b1024,0x0b1024],[-18,0x0b1024,0x060918,0x030409,0x0b1024,0x0b1024],[-12,0x1a2048,0x0e1430,0x070a1c,0x2a2440,0x141a38],
    [-6,0x3c4070,0x1f2a58,0x0f1838,0x8a4a40,0x2a3060],[-2.5,0x8a6a80,0x4a4a84,0x1e2a58,0xe8703a,0x6a5878],[0,0xd89070,0x8a7aa0,0x2e4078,0xff8a3a,0xb888a0],
    [3,0xf0b070,0xb09aa8,0x3c62a8,0xffb050,0xd0a0b0],[8,0xf4d0a0,0xa8c0e0,0x4a84d0,0xffe0a0,0xd8c8d8],[16,0xd0e0f0,0x88b8ea,0x3f7fd8,0xffffff,0xd0e0f0],[90,0xc4dcf2,0x7aaee6,0x3270d0,0xffffff,0xc4dcf2]];
  const MOOD={fire:{'-6':[0x4a3058,0x2a2a60,0x101838,0xb0304a,0x3a2a58],'-2.5':[0xa84a6a,0x6a3c80,0x24284e,0xff4a3a,0x8a4a78],'0':[0xff7a5a,0xc05a88,0x3a3a78,0xff5a2a,0xd87898],'3':[0xffa070,0xd08098,0x4a5aa0,0xff8a40,0xe898a8],'8':[0xf8c8a0,0xb8a8c8,0x5a80c8,0xffd890,0xe0b8c8]},
    soft:{'-6':[0x34405a,0x203050,0x121a34,0x6a5040,0x2a3450],'-2.5':[0x7a7888,0x4a5878,0x243050,0xc08060,0x6a6880],'0':[0xc8a088,0x8898a8,0x3a5078,0xe8a070,0xa8a0a8],'3':[0xd8b8a0,0xa0b8c0,0x4a6c98,0xf0c090,0xc0b8b8],'8':[0xe0d0c0,0xa8c0d0,0x5888c0,0xf0d8b0,0xd0c8c8]}};
  const hsh=(n,k)=>{ const v=Math.sin(n*12.9898+k*78.233)*43758.5453; return v-Math.floor(v); }, dayN=QS.get('day')!=null?+QS.get('day'):Math.floor(Date.now()/86400000);
  SKY.moodHold=QS.get('mood')||'clear';
  const W0={f:cl((hsh(dayN,1)-.2)/.6),s:cl((hsh(dayN,2)-.4)/.5)}; SKY.mood={f:0,s:0};
  const tmp=new THREE.Color(), stop=(X,k,out)=>{ out.setHex(X[k]); const F=MOOD.fire[String(X[0])], S=MOOD.soft[String(X[0])]; if(F&&SKY.mood.f)out.lerp(tmp.setHex(F[k-1]),SKY.mood.f); if(S&&SKY.mood.s)out.lerp(tmp.setHex(S[k-1]),SKY.mood.s); return out; };
  const cA=new THREE.Color(), cB=new THREE.Color(), mixS=(A,B,k,t,out)=>out.copy(stop(A,k,cA)).lerp(stop(B,k,cB),t);
  const SC={stars:0,gap:0,blood:0,sky:0}, MB=new THREE.Color(.78,.16,.09);
  const SUN=[[-2,0xff4a20],[0,0xff6428],[3,0xff8c3a],[8,0xffc070],[20,0xfff0d0],[90,0xfff8ee]];
  const U={uH:{value:new THREE.Color()},uM:{value:new THREE.Color()},uZ:{value:new THREE.Color()},uS:{value:new THREE.Color()},uA:{value:new THREE.Color()},
    uSunDir:{value:new THREE.Vector3(0,1,0)},uSunCol:{value:new THREE.Color()},uSunK:{value:0},uSunR:{value:.04},uSideK:{value:1},
    uMoonDir:{value:new THREE.Vector3(0,1,0)},uMoonK:{value:0},uMoonR:{value:.03},uMoonCol:{value:new THREE.Color(.86,.89,.95)},uBlood:{value:0},uGap:{value:0},uSkyK:{value:0},uStar:{value:0},uFogC:{value:new THREE.Color()},uFogK:{value:0},uGrey:{value:new THREE.Color()},uGreyK:{value:0},
    uBands:{value:CEL?8:SMOOTH?0:24},uMistK:{value:0},uMistC:{value:new THREE.Color()},uT:{value:0},uCov:{value:.47},uCL:{value:1.16},uZk:{value:.62},uHk:{value:.5},uCldC:{value:new THREE.Color(1,1,1)},uCldK:{value:0}};
  const CLOUD=`float hs(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); vec2 m=mod(i,256.); return mix(mix(hs(m),hs(mod(m+vec2(1,0),256.)),f.x),mix(hs(mod(m+vec2(0,1),256.)),hs(mod(m+vec2(1,1),256.)),f.x),f.y); }
      float fbm(vec2 p){ return vn(p)*.55+vn(p*2.1+7.3)*.3+vn(p*4.3+3.1)*.15; }
      float fbm4(vec2 p){ return vn(p)*.5+vn(p*2.03+7.3)*.27+vn(p*4.1+3.1)*.14+vn(p*8.3+11.7)*.09; }
      float sheet(vec2 q,float sc,float cov,float sh){ vec2 w=vec2(fbm(q*.55+3.1),fbm(q*.55+9.4))-.5; float n=fbm4((q+w*.6)*sc)*.64+fbm4((q+w*.28)*sc*2.7+5.)*.36; return smoothstep(cov,cov+sh,n); }
      float cloudAt(vec3 d,float t,float cov){ float el=abs(d.y); vec2 q=d.xz/(el+.06);   // abs, not max: clouds mirror below the horizon too, so high up you float in sky and clouds above and below (owner, 23 Oct 2026)
        float hi=sheet(q*vec2(.3,.62)+vec2(t*.004,t*.0015),1.,cov+.12,.5)*.45, cu=sheet(q*.9+vec2(t*.012,t*.005),1.,cov,.22), lo=sheet(q*1.7+vec2(t*.02,t*.009)+vec2(31.,17.),1.,cov+.08,.3)*.85;
        return (1.-(1.-hi)*(1.-cu)*(1.-lo))*smoothstep(.015,.12,el); }
      float cloudFast(vec3 d,float t,float cov){ float el=abs(d.y); vec2 q=d.xz/(el+.06); return sheet(q*.9+vec2(t*.012,t*.005),1.,cov,.22)*smoothstep(.015,.12,el); }`;
  SKY.GLSL=CLOUD;   // the clouds as a function of a direction: the dome paints them, the look's last pass asks it what stands in front of the sun
  const mat=new THREE.ShaderMaterial({uniforms:U,side:THREE.BackSide,depthWrite:false,depthTest:true,
    vertexShader:'varying vec3 vD; void main(){ vD=position; vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position=p.xyww; }',
    fragmentShader:`uniform vec3 uH,uM,uZ,uS,uA,uSunDir,uSunCol,uMoonDir,uFogC,uGrey; uniform float uSunK,uSunR,uSideK,uMoonK,uMoonR,uStar,uFogK,uGreyK,uBands,uMistK,uT,uCov,uCL,uZk,uHk; uniform vec3 uMistC,uMoonCol,uCldC; uniform float uBlood,uGap,uSkyK,uCldK; varying vec3 vD;
      ${CLOUD}
      vec3 moon(vec3 c,vec3 d,float k){ float a=acos(clamp(dot(d,uMoonDir),-1.,1.)), disc=1.-step(uMoonR,a), hr=(step(a,uMoonR*2.3)+step(a,uMoonR*4.))*.5*(1.-disc); c=mix(c,vec3(.34,.05,.04),hr*.45*uBlood*k); return mix(c,uMoonCol,disc*k); }
      vec3 bt(vec3 c,float el){ return mix(c,c*vec3(1.4,.42,.38)+vec3(.05,.003,0.),uBlood*(.3+.7*(1.-smoothstep(0.,.55,el)))); }
      void main(){ vec3 d=normalize(vD); float el=max(d.y,0.); vec2 hz=normalize(d.xz+vec2(1e-4,0.)), sh=normalize(uSunDir.xz+vec2(1e-4,0.)); float cs=dot(hz,sh);
        vec3 c=mix(uH,uM,smoothstep(0.,.3,el)); c=mix(c,uZ,smoothstep(.2,.85,el));
        c=mix(c,uS,pow(max(cs,0.),3.)*exp(-el*5.)*uSideK); c=mix(c,uA,pow(max(-cs,0.),2.)*exp(-el*6.)*uSideK*.7);
        c*=1.-clamp(-d.y*2.,0.,1.)*.5; vec3 mwc=vec3(0.), st=vec3(0.);
        if(uStar>0.){ vec3 a=abs(d); vec2 uv; float f; if(a.x>=a.y&&a.x>=a.z){ uv=d.yz/a.x; f=d.x>0.?0.:1.; } else if(a.y>=a.z){ uv=d.xz/a.y; f=d.y>0.?2.:3.; } else { uv=d.xy/a.z; f=d.z>0.?4.:5.; }
          float gb=dot(d,normalize(vec3(.42,.55,-.72))), nw=.5*vn(d.xy*4.+3.)+.5*vn(d.zx*4.+11.), nc=.5*vn(d.yz*2.6+5.)+.5*vn(d.xy*2.6+17.);
          float w=exp(-gb*gb/(.008+.008*nw)), mw=w*(.55+.9*nw)*(1.-.8*step(.62,nc)*step(abs(gb),.06));
          mwc=vec3(.011,.013,.022)*(step(.38,mw)+step(.7,mw)+step(1.,mw))*step(.5,uStar)*step(.08,el);
          vec2 g=(uv*.5+.5)*44.; vec2 id=floor(g)+f*100.; float h=hs(id); if(h<.14*(.25+1.6*nc*nc)+.16*w){ vec2 o=vec2(hs(id+3.1),hs(id+7.3))*.6+.2; float r=length(fract(g)-o);
            float br=(.35+.65*hs(id+1.7))*step(r,.05+.07*hs(id+9.1)); st=vec3(.82,.88,1.)*br*uStar*smoothstep(0.,.12,el); } }
        c=moon(c,d,uMoonK);
        { float ang=acos(clamp(dot(d,uSunDir),-1.,1.)); float disc=1.-step(uSunR,ang); float halo=(1.-smoothstep(uSunR,uSunR*4.,ang))*.45; if(uBands>0.)halo=floor(halo*3.)/3.*.45;
          c=mix(c,mix(uSunCol,vec3(1.,.96,.9),.45),halo*uSunK); c=mix(c,uSunCol,disc*uSunK); }
        c=mix(c,uGrey,uGreyK); c=mix(c,uFogC,uFogK*(1.-smoothstep(0.,.4,el)));
        if(uMistK>0.){ vec3 sk=c, m=mix(uMistC*uHk,uMistC*.95,smoothstep(0.,.22,el)); m=mix(m,uMistC*uZk,smoothstep(.35,.95,el)); m=mix(m,uMistC*uHk,1.-smoothstep(0.,.06,el));
          m=mix(m,mix(sk,uS*.7+uMistC*.3,.3),uSkyK*smoothstep(0.,.08,el)); c=mix(c,m,uMistK); }
        float cov=uCov+uGap, D=cloudAt(d,uT,cov);
        if(D>.002){ float Ds=cloudAt(normalize(d+uSunDir*.28),uT,cov); float shade=clamp(.62-(Ds-D)*4.5,.08,1.), core=1.-.7*D*D;   // thinner toward the sun: a lit edge; thicker toward it: the shaded side; thick cores and undersides darker
          float sp=max(dot(d,uSunDir),0.), near=pow(sp,10.), wide=pow(sp,3.);
          vec3 cLit=mix(uMistC,uCldC,uCldK)*uCL, cSh=mix(uMistC*.58,uZ,.3), cc=mix(cSh,cLit,shade*core);   // the shaded side takes the sky's blue, as real cloud does
          cc+=uSunCol*D*(1.-D)*4.*(near*1.3+wide*.25)*uSunK;   // the light through the thin parts: a silver lining by the sun, a warm glow in a wider cone
          cc=mix(cc,uGrey,uGreyK*.6); c=mix(c,cc,D); }
        c+=st*(1.-D); c=bt(c,el);
        if(uMistK>0.)c=pow(floor(pow(max(c,0.),vec3(1./2.2))*16.+.5)/16.,vec3(2.2)); else if(uBands>0.)c=floor(c*uBands+.5)/uBands;
        c+=mwc*(1.-uGreyK)*(1.-uFogK)*(1.-D);
        gl_FragColor=vec4(c,1.); }`});
  const dome=new THREE.Mesh(new THREE.BoxGeometry(2000,2000,2000),mat); dome.frustumCulled=false; dome.renderOrder=900; dome.matrixAutoUpdate=true; scene.add(dome); SKY.dome=dome; OUT.add(dome,'open');
  dome.onBeforeRender=(r,s,c)=>{ dome.position.copy(c.position); dome.scale.setScalar(c.isOrthographicCamera?Math.max(1,(c.right-c.left)*1.2/2000):1); dome.updateMatrixWorld(); };
  { const jh=(x,y)=>{ const v=Math.sin(x*127.1+y*311.7)*43758.5453; return v-Math.floor(v); }, M=v=>((v%256)+256)%256;
    const jv=(x,y)=>{ const ix=Math.floor(x), iy=Math.floor(y); let fx=x-ix, fy=y-iy; fx=fx*fx*(3-2*fx); fy=fy*fy*(3-2*fy); const mx=M(ix), my=M(iy), a=jh(mx,my), b=jh(M(mx+1),my), c2=jh(mx,M(my+1)), d2=jh(M(mx+1),M(my+1)), lo=a+(b-a)*fx, hi=c2+(d2-c2)*fx; return lo+(hi-lo)*fy; };
    const jf=(x,y)=>jv(x,y)*.55+jv(x*2.1+7.3,y*2.1+7.3)*.3+jv(x*4.3+3.1,y*4.3+3.1)*.15, jf4=(x,y)=>jv(x,y)*.5+jv(x*2.03+7.3,y*2.03+7.3)*.27+jv(x*4.1+3.1,y*4.1+3.1)*.14+jv(x*8.3+11.7,y*8.3+11.7)*.09;
    const ss=(a,b,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
    const sheet=(qx,qy,sc,cov,sh)=>{ const wx=jf(qx*.55+3.1,qy*.55+3.1)-.5, wy=jf(qx*.55+9.4,qy*.55+9.4)-.5; const n=jf4((qx+wx*.6)*sc,(qy+wy*.6)*sc)*.64+jf4((qx+wx*.28)*sc*2.7+5,(qy+wy*.28)*sc*2.7+5)*.36; return ss(cov,cov+sh,n); };
    SKY.cloudAt=(dx,dy,dz,t,cov)=>{ const el=Math.max(dy,0), qx=dx/(el+.06), qy=dz/(el+.06);   // the same clouds as the dome's cloudAt, for the sun's direction
      const hi=sheet(qx*.3+t*.004,qy*.62+t*.0015,1,cov+.12,.5)*.45, cu=sheet(qx*.9+t*.012,qy*.9+t*.005,1,cov,.22), lo=sheet(qx*1.7+t*.02+31,qy*1.7+t*.009+17,1,cov+.08,.3)*.85;
      return (1-(1-hi)*(1-cu)*(1-lo))*ss(.015,.12,el); };
    SKY.sunCover=0; }
  const ca=new THREE.Color(), cb=new THREE.Color(), mixC=(a,b,t,out)=>out.copy(ca.setHex(a)).lerp(cb.setHex(b),t), D=Math.PI/180;
  SYS.add('sky',(dt)=>{
    const up=SHARED.LVL!=='down'; 
    if(!(LFX.on&&LFX.on.has&&LFX.on.has('cool')))LOOK.cool.value=dome.visible?.7*cl(1-Math.abs(CLOCK.elev()-3)/10):0;
    U.uT.value+=dt; if(!dome.visible)return;
    const e=CLOCK.elev(); let i=0; while(i<P.length-2&&e>P[i+1][0])i++; const A=P[i], B=P[i+1], t=cl((e-A[0])/(B[0]-A[0]));
    const W=WX.now||{cloud:.2,storm:0,fog:0,flash:false}, day=cl((e+4)/14);
    { const hold=SKY.moodHold, ws=hold==='soft'?1:hold?0:cl(W0.s+cl((W.cloud-.35)/.4)*.7), wf=hold==='fire'?1:hold?0:W0.f*(1-ws); SKY.mood.f=wf; SKY.mood.s=ws; }
    mixS(A,B,1,t,U.uH.value); mixS(A,B,2,t,U.uM.value); mixS(A,B,3,t,U.uZ.value); mixS(A,B,4,t,U.uS.value); mixS(A,B,5,t,U.uA.value);
    U.uSideK.value=1-.6*cl((e-8)/20);
    U.uSunDir.value.copy(CLOCK.sunV); U.uSunR.value=(1.6+1.4*(1-cl(e/12)))*D; { let j=0; while(j<SUN.length-2&&e>SUN[j+1][0])j++; mixC(SUN[j][1],SUN[j+1][1],cl((e-SUN[j][0])/(SUN[j+1][0]-SUN[j][0])),U.uSunCol.value); }
    U.uSunK.value=cl((e+1.5)/1.5)*(1-.9*cl((W.cloud-.3)/.6));
    { const sv=CLOCK.sunV, cv=SKY.cloudAt(sv.x,sv.y,sv.z,U.uT.value,U.uCov.value+U.uGap.value); SKY.sunCover+=(cv-SKY.sunCover)*Math.min(1,dt*2.5); if(up){ CLOCK.sun.intensity*=1-.78*SKY.sunCover; HEMI.intensity*=1+.25*SKY.sunCover; } }
    U.uMoonDir.value.copy(CLOCK.moonV); const night=cl((-e-4)/6); U.uMoonK.value=night*(1-.8*cl((W.cloud-.3)/.6)); U.uStar.value=night*(1-cl(W.cloud*1.4)*(1-SC.stars)); U.uGap.value=SC.gap; U.uSkyK.value=Math.max(SC.sky,cl((e-3)/10)*(1-cl((W.cloud-.4)/.5))*.85); U.uBlood.value=SC.blood*night; U.uMoonR.value=.03+.025*SC.blood; U.uMoonCol.value.setRGB(.86,.89,.95).lerp(MB,SC.blood); if(SC.blood&&up)HEMI.color.lerp(MB,.55*SC.blood*night);
    U.uGrey.value.setRGB(.55,.58,.62).multiplyScalar(.25+.75*day); if(W.storm)U.uGrey.value.multiplyScalar(1-.45*W.storm); U.uGreyK.value=cl(W.cloud*W.cloud*.85);
    if(W.flash&&up){ U.uGrey.value.setRGB(.85,.88,.95); U.uGreyK.value=Math.max(U.uGreyK.value,.9); }
    if(scene.fog){ U.uFogC.value.copy(scene.fog.color); U.uFogK.value=cl(W.fog*1.3); } else U.uFogK.value=0; },'132-sky');
  SKY.dbg=()=>({elev:+CLOCK.elev().toFixed(2),cover:+SKY.sunCover.toFixed(2),fire:+SKY.mood.f.toFixed(2),soft:+SKY.mood.s.toFixed(2),cool:typeof LOOK!=='undefined'?+LOOK.cool.value.toFixed(2):null,sun:U.uSunK.value.toFixed(2),moon:U.uMoonK.value.toFixed(2),star:U.uStar.value.toFixed(2),grey:U.uGreyK.value.toFixed(2),H:'#'+U.uH.value.getHexString(),Z:'#'+U.uZ.value.getHexString()});
  SKY.U=U; SKY.P=P; SKY.SC=SC; SKY.MB=MB; window.SKY=SKY; }
