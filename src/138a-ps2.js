// THE PS2 FILTER: PS2, the picture's last pass but the cinema's cut, five parts each on or off with one strength for all (GRAPHICS): 240 lines of chunky pixels, 15-bit colour (no dither), a slight colour bleed, faint rainbow fringes on hard edges and a faint echo, a faint grain (still, patchy, none in the dark).
import {SHARED, THREE} from './003-shx.js';
import {PS2} from './003b-systems.js';
import {RH, RW, ShaderPass} from './004-main.js';
import {SAVE} from './005-save.js';
import {SYS} from './006-map-pre.js';
PS2.shader={uniforms:{tDiffuse:{value:null},uT:{value:0},uL:{value:new THREE.Vector2(427,240)},uA:{value:0},uQ:{value:8},uK:{value:new THREE.Vector3(1,1,1)},uO:{value:new THREE.Vector2()}},
  vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader:`uniform sampler2D tDiffuse; uniform float uT,uA,uQ; uniform vec2 uL,uO; uniform vec3 uK; varying vec2 vUv;
    vec3 fb(vec2 cell){ vec3 c=.25*(texture2D(tDiffuse,(cell+vec2(.25,.25))/uL).rgb+texture2D(tDiffuse,(cell+vec2(.75,.25))/uL).rgb+texture2D(tDiffuse,(cell+vec2(.25,.75))/uL).rgb+texture2D(tDiffuse,(cell+vec2(.75,.75))/uL).rgb); return uQ>=1.?floor(clamp(c*255.,0.,255.)/uQ)*uQ/255.:c; }
    vec3 yiq(vec3 c){ return vec3(dot(c,vec3(.299,.587,.114)),dot(c,vec3(.596,-.274,-.322)),dot(c,vec3(.211,-.523,.312))); }
    vec3 rgb(vec3 y){ return vec3(y.x+.956*y.y+.621*y.z,y.x-.272*y.y-.647*y.z,y.x-1.106*y.y+1.703*y.z); }
    float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
    float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y); }
    float gr(vec2 cell,float Y){ return (mix(h(cell),h(floor(cell*.5)+71.),.45)-.5)*.034*mix(.2,1.7,vn(cell/9.))*smoothstep(.03,.28,Y); }
    void main(){ vec2 cell=floor(vUv*uL);
      vec3 c0=yiq(fb(cell)), cl=yiq(fb(cell-vec2(1.,0.))), cr=yiq(fb(cell+vec2(1.,0.)));
      float Y=c0.x+((cl.x+cr.x)*.08-c0.x*.16)*uK.x, e=cr.x-cl.x;
      Y+=(yiq(fb(cell-vec2(3.,0.))).x-c0.x)*.05*uK.x;
      vec2 IQ=c0.yz+((cl.yz+cr.yz)*.25-c0.yz*.5)*min(uK.x,2.);
      vec2 wc=cell+uO; float ph=(wc.x+wc.y)*1.5708;   // the grain and the fringes' phase ride with the world (uO: the camera's whole-cell offset), so walking moves them with the ground instead of every pixel changing (6 Nov 2026)
      IQ+=e*.18*uK.y*smoothstep(.2,.5,abs(e))*vec2(cos(ph),sin(ph));
      vec3 c=rgb(vec3(Y,IQ));
      c+=gr(wc,Y)*uK.z;
      gl_FragColor=vec4(clamp(c,0.,1.),mix(1.,texture2D(tDiffuse,(cell+.5)/uL).a,uA)); }`};
PS2.sp=new ShaderPass(PS2.shader); PS2.sp.material.toneMapped=false; SHARED.composer.addPass(PS2.sp);
// a see-through part of the picture (the cinema's screen) stays see-through while asked
PS2.keepAlpha=on=>{ PS2.sp.uniforms.uA.value=on?1:0; };
const hh=(x,y)=>{ const v=Math.sin(x*12.9898+y*78.233)*43758.5453; return v-Math.floor(v); }, ss=(a,b,x)=>{ const t=Math.min(1,Math.max(0,(x-a)/(b-a))); return t*t*(3-2*t); };
const vn=(x,y)=>{ const i=Math.floor(x), j=Math.floor(y); let fx=x-i, fy=y-j; fx=fx*fx*(3-2*fx); fy=fy*fy*(3-2*fy); const a=hh(i,j)+(hh(i+1,j)-hh(i,j))*fx, b=hh(i,j+1)+(hh(i+1,j+1)-hh(i,j+1))*fx; return a+(b-a)*fy; };
const gr=(i,j,Y)=>((hh(i,j)*.55+hh(Math.floor(i*.5)+71,Math.floor(j*.5)+71)*.45)-.5)*.034*(.2+1.5*vn(i/9,j/9))*ss(.03,.28,Y);
// a picture shown cssH tall on the page: the lines to give PS2.img so its pixels are the game's own size (the character page, the designer)
PS2.linesFor=cssH=>(SHARED.cellLines||PS2.lines()||240)*cssH/innerHeight*PS2.tune().k;
PS2.img=(px,W,H,lines)=>{ const T=PS2.tune(), L=Math.max(8,Math.round(T.pix?Math.min(H,lines/T.k):H)), Lx=Math.max(8,Math.round(W*L/H)), N=Lx*L, Y=new Float32Array(N), I=new Float32Array(N), Q=new Float32Array(N), A=new Uint8Array(N), q=v=>T.Q>=1?Math.floor(v/T.Q)*T.Q/255:v/255;
  for(let j=0;j<L;j++)for(let i=0;i<Lx;i++){ const k=(Math.floor((j+.5)*H/L)*W+Math.floor((i+.5)*W/Lx))*4, r=q(px[k]), g=q(px[k+1]), b=q(px[k+2]), n=j*Lx+i;
    A[n]=px[k+3]>=24?px[k+3]:0; Y[n]=.299*r+.587*g+.114*b; I[n]=.596*r-.274*g-.322*b; Q[n]=.211*r-.523*g+.312*b; }
  const at=(i,j,F,c)=>{ const n=j*Lx+i; return i<0||i>=Lx||!A[n]?c:F[n]; };
  for(let j=0;j<L;j++)for(let i=0;i<Lx;i++){ const n=j*Lx+i; if(!A[n])continue; const y0=Y[n], yl=at(i-1,j,Y,y0), yr=at(i+1,j,Y,y0), e=yr-yl, s=Math.min(1,Math.max(0,(Math.abs(e)-.2)/.3)), f=.18*T.K[1]*s*s*(3-2*s)*e, ph=(i+j)*1.5708, km=T.K[0], ki=Math.min(km,2);
    const y=y0+((yl+yr)*.08-y0*.16)*km+(at(i-3,j,Y,y0)-y0)*.05*km, ii=I[n]+((at(i-1,j,I,I[n])+at(i+1,j,I,I[n]))*.25-I[n]*.5)*ki+f*Math.cos(ph), qq=Q[n]+((at(i-1,j,Q,Q[n])+at(i+1,j,Q,Q[n]))*.25-Q[n]*.5)*ki+f*Math.sin(ph), z=gr(i,j,y)*T.K[2];
    const R=255*Math.min(1,Math.max(0,y+.956*ii+.621*qq+z)), G=255*Math.min(1,Math.max(0,y-.272*ii-.647*qq+z)), B=255*Math.min(1,Math.max(0,y-1.106*ii+1.703*qq+z));
    for(let yy=Math.floor(j*H/L);yy<Math.floor((j+1)*H/L);yy++)for(let xx=Math.floor(i*W/Lx);xx<Math.floor((i+1)*W/Lx);xx++){ const k=(yy*W+xx)*4; px[k]=R; px[k+1]=G; px[k+2]=B; px[k+3]=A[n]; } }
  return px; };   // the same look on a small picture (the menu's portrait): its pixels the size of the game's on screen
// its five parts, each on or off (PIXELS, COLOURS, SMEAR, FRINGES, GRAIN), and one STRENGTH for them all (1 is the look as made, 0 none, 2 twice)
PS2.parts={pix:false,col:true,smear:true,fringe:true,grain:true}; PS2.k=1;   // the defaults: no chunky pixels (owner, 7 Nov 2026); the switches back in the menu (8 Nov 2026)
try{ const v=SAVE.get('ps2p'); if(v&&v.length===5)['pix','col','smear','fringe','grain'].forEach((n,i)=>{ PS2.parts[n]=v[i]==='1'; }); const k=parseFloat(SAVE.get('ps2k')); if(k>=0&&k<=2)PS2.k=k; }catch(e){}
PS2.tune=()=>{ const P=PS2.parts, k=PS2.k; return {pix:P.pix&&k>.05,k:Math.max(.25,k),Q:P.col?Math.round(8*k):0,K:[P.smear?k:0,P.fringe?k:0,P.grain?k:0]}; };
PS2.lines=()=>{ const T=PS2.tune(); return T.pix?Math.round(240/T.k):0; };
PS2.save=()=>{ try{ SAVE.set('ps2p',['pix','col','smear','fringe','grain'].map(n=>PS2.parts[n]?'1':'0').join('')); SAVE.set('ps2k',String(PS2.k)); }catch(e){} };
PS2.set=on=>{ PS2.on=!!on; PS2.sp.enabled=PS2.on; try{ SAVE.set('ps2',PS2.on?'1':'0'); }catch(e){} };
PS2.on=(()=>{ try{ return SAVE.get('ps2')!=='0'; }catch(e){ return true; } })(); PS2.sp.enabled=PS2.on;
SYS.add('sky',()=>{ const P=SHARED.composer.passes; if(P[P.length-1]!==PS2.sp){ P.splice(P.indexOf(PS2.sp),1); P.push(PS2.sp); }
  const Ln=PS2.lines(), cap=PS2.on&&Ln?Math.min(480,2*Ln):0; if(cap!==PS2.cap){ PS2.cap=cap; if(SHARED.resize)SHARED.resize(); } const ck=Ln?Math.max(1,Math.round(RH/Ln)):1; SHARED.cellLines=PS2.on&&Ln?RH/ck:0; if(!PS2.on)return; const u=PS2.sp.uniforms, T=PS2.tune();
  u.uL.value.set(RW/ck,RH/ck); u.uQ.value=T.Q; u.uK.value.set(T.K[0],T.K[1],T.K[2]); },'138a-ps2');   // each cell a whole number of the picture's pixels (6 Nov 2026)
