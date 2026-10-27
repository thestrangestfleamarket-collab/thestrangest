// THE PS2 FILTER: PS2, the picture's last pass: 240 lines of chunky pixels, 15-bit colour (no dither), a slight colour bleed, faint rainbow fringes on hard edges and a faint echo, a faint grain.
import {SHARED, THREE} from './003-shx.js';
import {PS2} from './003b-systems.js';
import {RH, RW, ShaderPass} from './004-main.js';
import {SAVE} from './005-save.js';
import {SYS} from './006-map-pre.js';
PS2.shader={uniforms:{tDiffuse:{value:null},uT:{value:0},uL:{value:new THREE.Vector2(427,240)}},
  vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader:`uniform sampler2D tDiffuse; uniform float uT; uniform vec2 uL; varying vec2 vUv;
    vec3 fb(vec2 cell){ vec3 c=texture2D(tDiffuse,(cell+.5)/uL).rgb; return floor(clamp(c*255.,0.,255.)/8.)*8./255.; }
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
PS2.img=(px,W,H,lines)=>{ const L=Math.max(8,Math.round(lines)), Lx=Math.max(8,Math.round(W*L/H)), N=Lx*L, Y=new Float32Array(N), I=new Float32Array(N), Q=new Float32Array(N), A=new Uint8Array(N), q=v=>Math.floor(v/8)*8/255;
  for(let j=0;j<L;j++)for(let i=0;i<Lx;i++){ const k=(Math.floor((j+.5)*H/L)*W+Math.floor((i+.5)*W/Lx))*4, r=q(px[k]), g=q(px[k+1]), b=q(px[k+2]), n=j*Lx+i;
    A[n]=px[k+3]>=24?px[k+3]:0; Y[n]=.299*r+.587*g+.114*b; I[n]=.596*r-.274*g-.322*b; Q[n]=.211*r-.523*g+.312*b; }
  const t=PS2.sp.uniforms.uT.value, at=(i,j,F,c)=>{ const n=j*Lx+i; return i<0||i>=Lx||!A[n]?c:F[n]; };
  for(let j=0;j<L;j++)for(let i=0;i<Lx;i++){ const n=j*Lx+i; if(!A[n])continue; const y0=Y[n], yl=at(i-1,j,Y,y0), yr=at(i+1,j,Y,y0), e=yr-yl, s=Math.min(1,Math.max(0,(Math.abs(e)-.2)/.3)), f=.18*s*s*(3-2*s)*e, ph=(i+j)*1.5708+t*3.1416;
    const y=y0*.84+(yl+yr)*.08+(at(i-3,j,Y,y0)-y0)*.05, ii=I[n]*.5+(at(i-1,j,I,I[n])+at(i+1,j,I,I[n]))*.25+f*Math.cos(ph), qq=Q[n]*.5+(at(i-1,j,Q,Q[n])+at(i+1,j,Q,Q[n]))*.25+f*Math.sin(ph), h=Math.sin(i*12.9898+j*78.233+t)*43758.5453, z=(h-Math.floor(h)-.5)*.03;
    const R=255*Math.min(1,Math.max(0,y+.956*ii+.621*qq+z)), G=255*Math.min(1,Math.max(0,y-.272*ii-.647*qq+z)), B=255*Math.min(1,Math.max(0,y-1.106*ii+1.703*qq+z));
    for(let yy=Math.floor(j*H/L);yy<Math.floor((j+1)*H/L);yy++)for(let xx=Math.floor(i*W/Lx);xx<Math.floor((i+1)*W/Lx);xx++){ const k=(yy*W+xx)*4; px[k]=R; px[k+1]=G; px[k+2]=B; px[k+3]=A[n]; } }
  return px; };   // the same look on a small picture (the menu's portrait): its pixels the size of the game's on screen
PS2.set=on=>{ PS2.on=!!on; PS2.sp.enabled=PS2.on; try{ SAVE.set('ps2',PS2.on?'1':'0'); }catch(e){} };
{ let v='1'; try{ v=SAVE.get('ps2')||'1'; }catch(e){} PS2.on=v==='1'; PS2.sp.enabled=PS2.on; }
SYS.add('sky',()=>{ const P=SHARED.composer.passes; if(P[P.length-1]!==PS2.sp){ P.splice(P.indexOf(PS2.sp),1); P.push(PS2.sp); }
  if(!PS2.on)return; const u=PS2.sp.uniforms; u.uT.value=1-u.uT.value; u.uL.value.set(Math.round(240*RW/Math.max(1,RH)),240); },'138a-ps2');
