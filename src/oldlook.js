// ---- THE OLD GAME'S FINAL TOUCH (owner, 17 Oct 2026, "go all": its recipe, docs/OLD-LOOK.md; its FS3 and bleed passes): one pass over the
// picture, after its colours are final. NIGHT EYE: at night the dark goes grey-blue, as eyes see it (k = .8 x how dark it is, the old game's
// smoothstep .06-.42). DEEP: the darkest sinks to a deep navy (#0a1030, a quarter, by how dark). THE GLOW, STEPPED: only what is far brighter
// than what's round it (a lamp's glass, the neon, the lit pool) gathers a halo a few art pixels wide, cut into 8 hard steps, added over;
// at night and indoors (allowed back by the owner, hard-stepped only: the budget's rule 1 otherwise holds) ----
const LOOK={on:true, glowK:{value:0}, night:{value:0}, cool:{value:0}};   // (cool: the warm sun and cool shade, ?fx=cool: lookfx.js)
{ let v='1'; try{ v=SAVE.get('look')||'1'; }catch(e){} LOOK.on=v==='1'; }   // (GRAPHICS' GLOW AND NIGHT LOOK, kept in this browser: ui.js)
LOOK.shader={uniforms:{tDiffuse:{value:null},uRes:{value:new THREE.Vector2(1,1)},uNight:LOOK.night,uGlowK:LOOK.glowK,uCool:LOOK.cool},
  vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader:`uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uNight,uGlowK,uCool; varying vec2 vUv;
    float lum(vec3 c){ return dot(c,vec3(.3,.59,.11)); }
    vec3 bright(vec2 u){ vec3 c=texture2D(tDiffuse,u).rgb; float l=lum(c), mx=max(c.r,max(c.g,c.b)), mn=min(c.r,min(c.g,c.b));
      return c*max(smoothstep(.55,.9,l),smoothstep(.7,1.,mx)*smoothstep(.3,.7,mx-mn)); }
    void main(){ vec2 px=1./uRes; vec3 col=texture2D(tDiffuse,vUv).rgb;
      // the glow: what's bright, gathered from a ring of art pixels round (1 to 4 away), weighted as the old game's 11 taps fall
      vec3 g=vec3(0.); float wt=0.;
      for(int i=-4;i<=4;i++)for(int j=-4;j<=4;j++){ float r=length(vec2(i,j)); if(r>4.5)continue; float w=exp(-r*r/6.); g+=bright(vUv+vec2(i,j)*px)*w; wt+=w; }
      g/=wt; float gm=max(g.r,max(g.g,g.b)); if(gm>.001)g*=floor(gm*8.)/8./gm;   // (8 hard steps)
      col=1.-(1.-col)*(1.-clamp(g*uGlowK,0.,1.));   // (laid over as light is: screen)
      // the warm sun and the cool shade (by day): the lit warmer, the shaded bluer
      { float l0=lum(col); col*=mix(vec3(1.),mix(vec3(.84,.92,1.16),vec3(1.08,1.,.88),smoothstep(.18,.62,l0)),uCool); }
      // the night eye and the deep
      float l=lum(col), k=uNight*.8*(1.-smoothstep(.06,.42,l));
      col=mix(col,vec3(l),k)*mix(vec3(1.),vec3(.62,.87,1.31),k);
      col=mix(col,vec3(.039,.063,.188),uNight*.3*(1.-l)*(1.-l));
      gl_FragColor=vec4(col,1.); }`};
// each frame: how much night (the clock's sun under the horizon; underground and indoors count as night for the glow)
LOOK.tick=()=>{ const dark=typeof CLOCK!=='undefined'&&CLOCK.dark()?1:0, inside=(typeof ROOMS!=='undefined'&&ROOMS.cur)||LVL==='down';
  LOOK.night.value+=(dark-LOOK.night.value)*.1; if(Math.abs(dark-LOOK.night.value)<.01)LOOK.night.value=dark;
  LOOK.glowK.value=LOOK.on?(dark||inside?1.28:.5):0; if(LOOK.sp){ LOOK.sp.enabled=LOOK.on; LOOK.sp.uniforms.uRes.value.set(RW,RH); } };
