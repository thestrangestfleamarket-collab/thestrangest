// THE OLD LOOK: LOOK, the picture's last pass: the old game's glow, and the look's colour of everything and haze over everything (DN.U). The sun's rays are the shafts in the world (134d), never a star drawn on the screen at the player.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DN, LOOK} from './003b-systems.js';
import {renderer, RH, RW, ShaderPass} from './004-main.js';
import {SAVE} from './005-save.js';
import {OUT} from './006-map-pre.js';
Object.assign(LOOK,{on:true, glowK:{value:0}, night:{value:0}, cool:{value:0}});
{ let v='1'; try{ v=SAVE.get('look')||'1'; }catch(e){} LOOK.on=v==='1'; }
// the glow is a round 9×9 blur of the bright parts, split in two: a row pass (LOOK.hp, into LOOK.rtH), then the column sum here minus the 12 corners outside the circle
const LOOKV='varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  LOOKB=`float lum(vec3 c){ return dot(c,vec3(.3,.59,.11)); }
    vec3 bright(vec2 u){ vec3 c=texture2D(tDiffuse,u).rgb; float l=lum(c), mx=max(c.r,max(c.g,c.b)), mn=min(c.r,min(c.g,c.b));
      return c*max(smoothstep(.55,.9,l),smoothstep(.7,1.,mx)*smoothstep(.3,.7,mx-mn)); }`;
let LOOKW=0; for(let i=-4;i<=4;i++)for(let j=-4;j<=4;j++)if(i*i+j*j<=20.25)LOOKW+=Math.exp(-(i*i+j*j)/6);
LOOK.shader={uniforms:{tDiffuse:{value:null},tH:{value:null},uRes:{value:new THREE.Vector2(1,1)},uNight:LOOK.night,uGlowK:LOOK.glowK,uCool:LOOK.cool,uGrade:DN.U.grade,uLift:DN.U.lift,uLiftK:DN.U.liftK},
  vertexShader:LOOKV,
  fragmentShader:`uniform sampler2D tDiffuse,tH; uniform vec2 uRes; uniform float uNight,uGlowK,uCool,uLiftK; uniform vec3 uGrade,uLift; varying vec2 vUv;
    ${LOOKB}
    void main(){ vec2 px=1./uRes; vec3 col=texture2D(tDiffuse,vUv).rgb;
      if(uGlowK>0.){ vec3 g=vec3(0.), k5=vec3(0.), k8=vec3(0.);
      for(int j=-4;j<=4;j++)g+=texture2D(tH,vUv+vec2(0.,float(j))*px).rgb*exp(-float(j*j)/6.);
      for(int a=-1;a<=1;a+=2)for(int b=-1;b<=1;b+=2){ vec2 s=vec2(float(a),float(b)); k5+=bright(vUv+s*vec2(4.,3.)*px)+bright(vUv+s*vec2(3.,4.)*px); k8+=bright(vUv+s*4.*px); }
      g=(g-k5*(exp(-16./6.)*exp(-9./6.))-k8*(exp(-16./6.)*exp(-16./6.)))/${LOOKW}; float gm=max(g.r,max(g.g,g.b)); if(gm>.001)g*=floor(gm*8.)/8./gm;
      col=1.-(1.-col)*(1.-clamp(g*uGlowK,0.,1.)); }
      { float l0=lum(col); col*=mix(vec3(1.),mix(vec3(.84,.92,1.16),vec3(1.08,1.,.88),smoothstep(.18,.62,l0)),uCool); }
      float l=lum(col), k=uNight*.8*(1.-smoothstep(.06,.42,l));
      col=mix(col,vec3(l),k)*mix(vec3(1.),vec3(.62,.87,1.31),k);
      col=mix(col,vec3(.039,.063,.188),uNight*.3*(1.-l)*(1.-l));
      col=mix(col*uGrade,uLift,uLiftK);
      gl_FragColor=vec4(col,texture2D(tDiffuse,vUv).a); }`};
LOOK.tick=()=>{ const dark=CLOCK.dark()?1:0, inside=!OUT.open;
  LOOK.night.value+=(dark-LOOK.night.value)*.1; if(Math.abs(dark-LOOK.night.value)<.01)LOOK.night.value=dark;
  LOOK.glowK.value=(LOOK.on?(dark||inside?1.28:.5):0)*(DN.P&&DN.P().glow!=null?DN.P().glow:1); if(LOOK.sp){ LOOK.sp.enabled=LOOK.on||DN.U.liftK.value>0||DN.U.grade.value.r+DN.U.grade.value.g+DN.U.grade.value.b<2.99; LOOK.sp.uniforms.uRes.value.set(RW,RH); } };

LOOK.sp=new ShaderPass(LOOK.shader); SHARED.composer.addPass(LOOK.sp); SHARED.carry(LOOK.sp);
LOOK.rtH=new THREE.WebGLRenderTarget(1,1,{type:renderer.extensions.has('EXT_color_buffer_float')?THREE.FloatType:THREE.HalfFloatType,minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:false}); LOOK.sp.uniforms.tH.value=LOOK.rtH.texture;
LOOK.hp=new ShaderPass({uniforms:{tDiffuse:{value:null},uRes:{value:null}},vertexShader:LOOKV,
  fragmentShader:`uniform sampler2D tDiffuse; uniform vec2 uRes; varying vec2 vUv;
    ${LOOKB}
    void main(){ vec2 px=1./uRes; vec3 h=vec3(0.); for(int i=-4;i<=4;i++)h+=bright(vUv+vec2(float(i),0.)*px)*exp(-float(i*i)/6.); gl_FragColor=vec4(h,1.); }`}); LOOK.hp.uniforms.uRes=LOOK.sp.uniforms.uRes;
{ const draw=LOOK.sp.render.bind(LOOK.sp); LOOK.sp.render=(r,w,rb,dt,mask)=>{ if(LOOK.glowK.value>0){ if(LOOK.rtH.width!==rb.width||LOOK.rtH.height!==rb.height)LOOK.rtH.setSize(rb.width,rb.height); LOOK.hp.render(r,LOOK.rtH,rb); } draw(r,w,rb,dt,mask); }; } LOOK.sp.uniforms.uNight=LOOK.night; LOOK.sp.uniforms.uCool=LOOK.cool; LOOK.sp.uniforms.uGlowK=LOOK.glowK; LOOK.sp.uniforms.uGrade=DN.U.grade; LOOK.sp.uniforms.uLift=DN.U.lift; LOOK.sp.uniforms.uLiftK=DN.U.liftK; window.LOOK=LOOK;
