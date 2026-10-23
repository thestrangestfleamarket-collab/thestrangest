// THE OLD LOOK: LOOK, the picture's last pass: the sun's rays (LOOK.rays, from the shafts; each ray only where nothing stands between it and the sun: no cloud over the sky, nothing solid in front), the old game's glow, and the look's colour of everything and haze over everything (DN.U).
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DN, LOOK, SKY} from './003b-systems.js';
import {RH, RW, ShaderPass} from './004-main.js';
import {SAVE} from './005-save.js';
import {OUT} from './006-map-pre.js';
Object.assign(LOOK,{on:true, glowK:{value:0}, night:{value:0}, cool:{value:0}}); LOOK.rays=LOOK.rays||{uSun:{value:new THREE.Vector2(.5,.5)},uRayK:{value:0},uRayCol:{value:new THREE.Color(1,.9,.75)},uAsp:{value:1},uRayT:{value:0}};
{ let v='1'; try{ v=SAVE.get('look')||'1'; }catch(e){} LOOK.on=v==='1'; }
LOOK.shader={uniforms:{tDiffuse:{value:null},uRes:{value:new THREE.Vector2(1,1)},uNight:LOOK.night,uGlowK:LOOK.glowK,uCool:LOOK.cool,uGrade:DN.U.grade,uLift:DN.U.lift,uLiftK:DN.U.liftK,uSun:LOOK.rays.uSun,uRayK:LOOK.rays.uRayK,uRayCol:LOOK.rays.uRayCol,uAsp:LOOK.rays.uAsp,uRayT:LOOK.rays.uRayT,uT:{value:0},uCov:{value:.5},uGap:{value:0},uInvProj:{value:new THREE.Matrix4()},uCamM:{value:new THREE.Matrix4()},uOrtho:{value:0}},
  vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader:`uniform sampler2D tDiffuse; uniform vec2 uRes,uSun; uniform float uNight,uGlowK,uCool,uLiftK,uRayK,uAsp,uRayT,uT,uCov,uGap,uOrtho; uniform vec3 uGrade,uLift,uRayCol; uniform mat4 uInvProj,uCamM; varying vec2 vUv;
    ${SKY.GLSL}
    vec3 dirAt(vec2 uv){ vec4 p=uInvProj*vec4(uv*2.-1.,1.,1.); vec3 v=uOrtho>.5?vec3(0.,0.,-1.):normalize(p.xyz/p.w); return normalize((uCamM*vec4(v,0.)).xyz); }
    float lum(vec3 c){ return dot(c,vec3(.3,.59,.11)); }
    vec3 bright(vec2 u){ vec3 c=texture2D(tDiffuse,u).rgb; float l=lum(c), mx=max(c.r,max(c.g,c.b)), mn=min(c.r,min(c.g,c.b));
      return c*max(smoothstep(.55,.9,l),smoothstep(.7,1.,mx)*smoothstep(.3,.7,mx-mn)); }
    void main(){ vec2 px=1./uRes; vec3 col=texture2D(tDiffuse,vUv).rgb;
      if(uRayK>0.){ vec2 d=(vUv-uSun)*vec2(uAsp,1.); float dist=length(d), ang=atan(d.y,d.x), ray=0.;   // 14 distinct rays from the sun, each a different width and brightness, turning very slowly with the sun (uRayT)
        for(int k=0;k<14;k++){ float fk=float(k), h0=fract(sin(fk*12.9898)*43758.5453), h1=fract(sin(fk*78.233)*43758.5453), h2=fract(sin(fk*37.719)*43758.5453);
          float a0=h0*6.28318+uRayT*(.7+.6*h2), w=.014+.06*h1, dd=mod(ang-a0+3.14159,6.28318)-3.14159; ray+=smoothstep(w,0.,abs(dd))*(.5+.5*h2); }
        float open=1.; for(int i=0;i<6;i++){ vec2 su=uSun+(vUv-uSun)*float(i)*.045; vec3 cs=texture2D(tDiffuse,clamp(su,0.,1.)).rgb;   // what stands between the sun and this ray, from the sun outward: cloud over the sky, or something solid in front of it
          open=min(open,smoothstep(.16,.3,dot(cs,vec3(.3,.59,.11)))*(1.-cloudFast(dirAt(su),uT,uCov+uGap))); }
        float fade=exp(-dist*1.5)*.7+.3/(1.+dist*dist*5.); col+=uRayCol*ray*fade*uRayK*open; }
      if(uGlowK>0.){ vec3 g=vec3(0.); float wt=0.;
      for(int i=-4;i<=4;i++)for(int j=-4;j<=4;j++){ float r=length(vec2(i,j)); if(r>4.5)continue; float w=exp(-r*r/6.); g+=bright(vUv+vec2(i,j)*px)*w; wt+=w; }
      g/=wt; float gm=max(g.r,max(g.g,g.b)); if(gm>.001)g*=floor(gm*8.)/8./gm;
      col=1.-(1.-col)*(1.-clamp(g*uGlowK,0.,1.)); }
      { float l0=lum(col); col*=mix(vec3(1.),mix(vec3(.84,.92,1.16),vec3(1.08,1.,.88),smoothstep(.18,.62,l0)),uCool); }
      float l=lum(col), k=uNight*.8*(1.-smoothstep(.06,.42,l));
      col=mix(col,vec3(l),k)*mix(vec3(1.),vec3(.62,.87,1.31),k);
      col=mix(col,vec3(.039,.063,.188),uNight*.3*(1.-l)*(1.-l));
      col=mix(col*uGrade,uLift,uLiftK);
      gl_FragColor=vec4(col,1.); }`};
LOOK.tick=()=>{ const dark=CLOCK.dark()?1:0, inside=!OUT.open;
  LOOK.night.value+=(dark-LOOK.night.value)*.1; if(Math.abs(dark-LOOK.night.value)<.01)LOOK.night.value=dark;
  LOOK.glowK.value=(LOOK.on?(dark||inside?1.28:.5):0)*(DN.P&&DN.P().glow!=null?DN.P().glow:1); if(LOOK.sp){ LOOK.sp.enabled=LOOK.on||LOOK.rays.uRayK.value>0||DN.U.liftK.value>0||DN.U.grade.value.r+DN.U.grade.value.g+DN.U.grade.value.b<2.99; LOOK.sp.uniforms.uRes.value.set(RW,RH); const cam=SHARED.cam, u=LOOK.sp.uniforms; u.uInvProj.value.copy(cam.projectionMatrixInverse); u.uCamM.value.copy(cam.matrixWorld); u.uOrtho.value=cam.isOrthographicCamera?1:0; } };

LOOK.sp=new ShaderPass(LOOK.shader); SHARED.composer.addPass(LOOK.sp); LOOK.sp.uniforms.uNight=LOOK.night; LOOK.sp.uniforms.uCool=LOOK.cool; LOOK.sp.uniforms.uGlowK=LOOK.glowK; LOOK.sp.uniforms.uGrade=DN.U.grade; LOOK.sp.uniforms.uLift=DN.U.lift; LOOK.sp.uniforms.uLiftK=DN.U.liftK; LOOK.sp.uniforms.uSun=LOOK.rays.uSun; LOOK.sp.uniforms.uRayK=LOOK.rays.uRayK; LOOK.sp.uniforms.uRayCol=LOOK.rays.uRayCol; LOOK.sp.uniforms.uAsp=LOOK.rays.uAsp; LOOK.sp.uniforms.uRayT=LOOK.rays.uRayT; LOOK.sp.uniforms.uT=SKY.U.uT; LOOK.sp.uniforms.uCov=SKY.U.uCov; LOOK.sp.uniforms.uGap=SKY.U.uGap; window.LOOK=LOOK;
