const LOOK={on:true, glowK:{value:0}, night:{value:0}, cool:{value:0}};
{ let v='1'; try{ v=SAVE.get('look')||'1'; }catch(e){} LOOK.on=v==='1'; }
LOOK.shader={uniforms:{tDiffuse:{value:null},uRes:{value:new THREE.Vector2(1,1)},uNight:LOOK.night,uGlowK:LOOK.glowK,uCool:LOOK.cool},
  vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader:`uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uNight,uGlowK,uCool; varying vec2 vUv;
    float lum(vec3 c){ return dot(c,vec3(.3,.59,.11)); }
    vec3 bright(vec2 u){ vec3 c=texture2D(tDiffuse,u).rgb; float l=lum(c), mx=max(c.r,max(c.g,c.b)), mn=min(c.r,min(c.g,c.b));
      return c*max(smoothstep(.55,.9,l),smoothstep(.7,1.,mx)*smoothstep(.3,.7,mx-mn)); }
    void main(){ vec2 px=1./uRes; vec3 col=texture2D(tDiffuse,vUv).rgb;
      vec3 g=vec3(0.); float wt=0.;
      for(int i=-4;i<=4;i++)for(int j=-4;j<=4;j++){ float r=length(vec2(i,j)); if(r>4.5)continue; float w=exp(-r*r/6.); g+=bright(vUv+vec2(i,j)*px)*w; wt+=w; }
      g/=wt; float gm=max(g.r,max(g.g,g.b)); if(gm>.001)g*=floor(gm*8.)/8./gm;
      col=1.-(1.-col)*(1.-clamp(g*uGlowK,0.,1.));
      { float l0=lum(col); col*=mix(vec3(1.),mix(vec3(.84,.92,1.16),vec3(1.08,1.,.88),smoothstep(.18,.62,l0)),uCool); }
      float l=lum(col), k=uNight*.8*(1.-smoothstep(.06,.42,l));
      col=mix(col,vec3(l),k)*mix(vec3(1.),vec3(.62,.87,1.31),k);
      col=mix(col,vec3(.039,.063,.188),uNight*.3*(1.-l)*(1.-l));
      gl_FragColor=vec4(col,1.); }`};
LOOK.tick=()=>{ const dark=typeof CLOCK!=='undefined'&&CLOCK.dark()?1:0, inside=!OUT.open;
  LOOK.night.value+=(dark-LOOK.night.value)*.1; if(Math.abs(dark-LOOK.night.value)<.01)LOOK.night.value=dark;
  LOOK.glowK.value=LOOK.on?(dark||inside?1.28:.5):0; if(LOOK.sp){ LOOK.sp.enabled=LOOK.on; LOOK.sp.uniforms.uRes.value.set(RW,RH); } };

LOOK.sp=new ShaderPass(LOOK.shader); composer.addPass(LOOK.sp); LOOK.sp.uniforms.uNight=LOOK.night; LOOK.sp.uniforms.uCool=LOOK.cool; LOOK.sp.uniforms.uGlowK=LOOK.glowK;
