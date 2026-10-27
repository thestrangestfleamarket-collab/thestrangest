// THE PS2 FILTER: PS2, the picture's last pass: 240 lines of chunky pixels, 15-bit colour with the console's 4x4 dither, a slight colour bleed, faint rainbow fringes on hard edges and a faint echo, a faint grain.
import {SHARED, THREE} from './003-shx.js';
import {PS2} from './003b-systems.js';
import {RH, RW, ShaderPass} from './004-main.js';
import {SAVE} from './005-save.js';
import {SYS} from './006-map-pre.js';
PS2.shader={uniforms:{tDiffuse:{value:null},uT:{value:0},uL:{value:new THREE.Vector2(427,240)}},
  vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader:`uniform sampler2D tDiffuse; uniform float uT; uniform vec2 uL; varying vec2 vUv;
    float dm(vec2 c){ int i=int(mod(c.x,4.))+4*int(mod(c.y,4.)); float d[16]; d[0]=-4.;d[1]=0.;d[2]=-3.;d[3]=1.;d[4]=2.;d[5]=-2.;d[6]=3.;d[7]=-1.;d[8]=-3.;d[9]=1.;d[10]=-4.;d[11]=0.;d[12]=3.;d[13]=-1.;d[14]=2.;d[15]=-2.;
      for(int k=0;k<16;k++)if(k==i)return d[k]; return 0.; }
    vec3 fb(vec2 cell){ vec3 c=texture2D(tDiffuse,(cell+.5)/uL).rgb; return floor(clamp(c*255.+dm(cell)*1.5,0.,255.)/8.)*8./255.; }
    vec3 yiq(vec3 c){ return vec3(dot(c,vec3(.299,.587,.114)),dot(c,vec3(.596,-.274,-.322)),dot(c,vec3(.211,-.523,.312))); }
    vec3 rgb(vec3 y){ return vec3(y.x+.956*y.y+.621*y.z,y.x-.272*y.y-.647*y.z,y.x-1.106*y.y+1.703*y.z); }
    float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
    void main(){ vec2 cell=floor(vUv*uL);
      vec3 c0=yiq(fb(cell)), cl=yiq(fb(cell-vec2(1.,0.))), cr=yiq(fb(cell+vec2(1.,0.)));
      float Y=c0.x*.84+(cl.x+cr.x)*.08, e=cr.x-cl.x;
      Y+=(yiq(fb(cell-vec2(3.,0.))).x-c0.x)*.05;
      vec2 IQ=c0.yz*.5+(cl.yz+cr.yz)*.25;
      float ph=(cell.x+cell.y)*1.5708+uT*3.1416; IQ+=e*.18*smoothstep(.2,.5,abs(e))*vec2(cos(ph),sin(ph));
      vec3 c=rgb(vec3(Y,IQ));
      c+=(h(cell+fract(uT))-.5)*.03;
      gl_FragColor=vec4(clamp(c,0.,1.),1.); }`};
PS2.sp=new ShaderPass(PS2.shader); PS2.sp.material.toneMapped=false; SHARED.composer.addPass(PS2.sp);
PS2.set=on=>{ PS2.on=!!on; PS2.sp.enabled=PS2.on; try{ SAVE.set('ps2',PS2.on?'1':'0'); }catch(e){} };
{ let v='1'; try{ v=SAVE.get('ps2')||'1'; }catch(e){} PS2.on=v==='1'; PS2.sp.enabled=PS2.on; }
SYS.add('sky',()=>{ const P=SHARED.composer.passes; if(P[P.length-1]!==PS2.sp){ P.splice(P.indexOf(PS2.sp),1); P.push(PS2.sp); }
  if(!PS2.on)return; const u=PS2.sp.uniforms; u.uT.value=1-u.uT.value; u.uL.value.set(Math.round(240*RW/Math.max(1,RH)),240); },'138a-ps2');
