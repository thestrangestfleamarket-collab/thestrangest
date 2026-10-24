// THE OLD LOOK: LOOK, the picture's last pass: the old game's glow, and the look's colour of everything and haze over everything (DN.U). The sun's rays are the shafts in the world (134d), never a star drawn on the screen at the player.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DN, LOOK} from './003b-systems.js';
import {RH, RW, ShaderPass} from './004-main.js';
import {SAVE} from './005-save.js';
import {OUT} from './006-map-pre.js';
Object.assign(LOOK,{on:true, glowK:{value:0}, night:{value:0}, cool:{value:0}});
{ let v='1'; try{ v=SAVE.get('look')||'1'; }catch(e){} LOOK.on=v==='1'; }
LOOK.shader={uniforms:{tDiffuse:{value:null},uSmear:{value:(q=>q.get('grass')==='smear'?Math.max(1,Math.min(6,+q.get('sm')||1)):q.get('grass')==='dark'?7:0)(new URLSearchParams(location.search))},uRes:{value:new THREE.Vector2(1,1)},uNight:LOOK.night,uGlowK:LOOK.glowK,uCool:LOOK.cool,uGrade:DN.U.grade,uLift:DN.U.lift,uLiftK:DN.U.liftK},
  vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader:`uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uNight,uGlowK,uCool,uLiftK,uSmear; uniform vec3 uGrade,uLift; varying vec2 vUv;
    float lum(vec3 c){ return dot(c,vec3(.3,.59,.11)); }
    float gm(vec3 c){ return smoothstep(.03,.1,c.g-max(c.r,c.b))*(1.-smoothstep(.6,.8,lum(c))); }
    float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float n2(vec2 p){ vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y); }
    vec3 bright(vec2 u){ vec3 c=texture2D(tDiffuse,u).rgb; float l=lum(c), mx=max(c.r,max(c.g,c.b)), mn=min(c.r,min(c.g,c.b));
      return c*max(smoothstep(.55,.9,l),smoothstep(.7,1.,mx)*smoothstep(.3,.7,mx-mn)); }
    void main(){ vec2 px=1./uRes; vec3 col=texture2D(tDiffuse,vUv).rgb;
      if(uGlowK>0.){ vec3 g=vec3(0.); float wt=0.;
      for(int i=-4;i<=4;i++)for(int j=-4;j<=4;j++){ float r=length(vec2(i,j)); if(r>4.5)continue; float w=exp(-r*r/6.); g+=bright(vUv+vec2(i,j)*px)*w; wt+=w; }
      g/=wt; float gm=max(g.r,max(g.g,g.b)); if(gm>.001)g*=floor(gm*8.)/8./gm;
      col=1.-(1.-col)*(1.-clamp(g*uGlowK,0.,1.)); }
      if(uSmear>0.){ int v=int(uSmear+.5); float m=gm(col); if(v==7)m*=smoothstep(.2,.34,lum(col)); if(m>0.){ vec2 q=vUv*uRes;
        float a=(v==1||v==7)?.5+(fract(sin(dot(floor(q/14.),vec2(12.9898,78.233)))*43758.5453)-.5)*1.2:.5+(n2(q/60.)-.5)*2.6+(n2(q/22.+7.)-.5)*.8;
        vec2 d=vec2(cos(a),sin(a))*px*((v==1||v==7)?1.6:1.5); int R=(v==1||v==7)?5:8; vec3 sm=vec3(0.), wide=vec3(0.); float wt=0., ww=0.;
        for(int i=-10;i<=10;i++){ if(i<-R||i>R)continue; vec3 t=texture2D(tDiffuse,vUv+d*float(i)).rgb; float w=(1.-abs(float(i))/float(R+1))*(v==1?1.:v==7?gm(t)*smoothstep(.2,.34,lum(t)):.2+.8*gm(t)); sm+=t*w; wt+=w; }
        sm/=max(wt,1e-4);
        if(v==5){ for(int i=-10;i<=10;i++){ vec3 t=texture2D(tDiffuse,vUv+d*float(i)*1.8).rgb; float w=(1.-abs(float(i))/11.)*(.2+.8*gm(t)); wide+=t*w; ww+=w; } wide/=max(ww,1e-4); sm=clamp(sm+(sm-wide)*.9,0.,1.); }
        if(v==3){ float l=lum(sm), b=floor(l*5.+.5)/5.; sm*=mix(1.,b/max(l,1e-3),.7); }
        if(v==4||v==6){ float hb=n2(q/9.+vec2(cos(a),sin(a))*q.x*.04), lo=n2(q/13.+31.); sm*=1.+.16*smoothstep(.68,.8,hb)*vec3(1.,.95,.6)-.14*smoothstep(.72,.9,lo); }
        if(v==6){ float near=1.; for(int i=-6;i<=6;i+=3)for(int j=-6;j<=6;j+=3){ near=min(near,gm(texture2D(tDiffuse,vUv+vec2(i,j)*px*1.5).rgb)); } sm*=mix(.72,1.,smoothstep(0.,.6,near)); }
        col=mix(col,sm,m); } }
      { float l0=lum(col); col*=mix(vec3(1.),mix(vec3(.84,.92,1.16),vec3(1.08,1.,.88),smoothstep(.18,.62,l0)),uCool); }
      float l=lum(col), k=uNight*.8*(1.-smoothstep(.06,.42,l));
      col=mix(col,vec3(l),k)*mix(vec3(1.),vec3(.62,.87,1.31),k);
      col=mix(col,vec3(.039,.063,.188),uNight*.3*(1.-l)*(1.-l));
      col=mix(col*uGrade,uLift,uLiftK);
      gl_FragColor=vec4(col,texture2D(tDiffuse,vUv).a); }`};
LOOK.tick=()=>{ const dark=CLOCK.dark()?1:0, inside=!OUT.open;
  LOOK.night.value+=(dark-LOOK.night.value)*.1; if(Math.abs(dark-LOOK.night.value)<.01)LOOK.night.value=dark;
  LOOK.glowK.value=(LOOK.on?(dark||inside?1.28:.5):0)*(DN.P&&DN.P().glow!=null?DN.P().glow:1); if(LOOK.sp){ LOOK.sp.enabled=LOOK.on||LOOK.shader.uniforms.uSmear.value>0||DN.U.liftK.value>0||DN.U.grade.value.r+DN.U.grade.value.g+DN.U.grade.value.b<2.99; LOOK.sp.uniforms.uRes.value.set(RW,RH); } };

LOOK.sp=new ShaderPass(LOOK.shader); SHARED.composer.addPass(LOOK.sp); LOOK.sp.uniforms.uNight=LOOK.night; LOOK.sp.uniforms.uCool=LOOK.cool; LOOK.sp.uniforms.uGlowK=LOOK.glowK; LOOK.sp.uniforms.uGrade=DN.U.grade; LOOK.sp.uniforms.uLift=DN.U.lift; LOOK.sp.uniforms.uLiftK=DN.U.liftK; window.LOOK=LOOK;
