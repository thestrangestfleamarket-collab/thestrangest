// THE EFFECTS: PS2, the picture's last pass but the cinema's cut, one shader. PS2 is the default (as the owner fixed it); a player picks another in SETTINGS > EFFECTS: NONE, old machines (PS1, N64, ...), screens (CRT, ARCADE, VHS) and film (NOIR, SEPIA, 8MM). None is drawn at more lines than the GRAPHICS level.
import {SHARED, THREE} from './003-shx.js';
import {PS2} from './003b-systems.js';
import {RH, RW, ShaderPass} from './004-main.js';
import {SAVE} from './005-save.js';
import {QS, SYS} from './006-map-pre.js';
PS2.shader={uniforms:{tDiffuse:{value:null},uT:{value:0},uL:{value:new THREE.Vector2(427,240)},uR:{value:new THREE.Vector2(854,480)},uA:{value:0},uQ:{value:8},uK:{value:new THREE.Vector3(1,1,1)},uO:{value:new THREE.Vector2()},uG:{value:new THREE.Vector4(1,1,0,0)},uTi:{value:new THREE.Vector3(1,1,1)},uC:{value:new THREE.Vector4()},uX:{value:new THREE.Vector4()}},
  vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  // uG: saturation, contrast, the four-green palette, dither; uTi: tint; uC: scanlines, phosphor stripes, tube curve, dark corners; uX: glow, soft pixels, tape, film
  fragmentShader:`uniform sampler2D tDiffuse; uniform float uT,uA,uQ; uniform vec2 uL,uO,uR; uniform vec3 uK,uTi; uniform vec4 uG,uC,uX; varying vec2 vUv;
    float b2(vec2 a){ a=floor(a); return fract(a.x/2.+a.y*a.y*.75); }
    float b4(vec2 a){ return b2(.5*a)*.25+b2(a); }
    vec3 fb(vec2 cell){ vec3 c=.25*(texture2D(tDiffuse,(cell+vec2(.25,.25))/uL).rgb+texture2D(tDiffuse,(cell+vec2(.75,.25))/uL).rgb+texture2D(tDiffuse,(cell+vec2(.25,.75))/uL).rgb+texture2D(tDiffuse,(cell+vec2(.75,.75))/uL).rgb); return uQ>=1.?floor(clamp(c*255.+(b4(cell)-.47)*uQ*uG.w*min(1.,max(c.r,max(c.g,c.b))*10.),0.,255.)/uQ)*uQ/255.:c; }
    vec3 yiq(vec3 c){ return vec3(dot(c,vec3(.299,.587,.114)),dot(c,vec3(.596,-.274,-.322)),dot(c,vec3(.211,-.523,.312))); }
    vec3 rgb(vec3 y){ return vec3(y.x+.956*y.y+.621*y.z,y.x-.272*y.y-.647*y.z,y.x-1.106*y.y+1.703*y.z); }
    float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
    float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y); }
    float gr(vec2 cell,float Y){ return (mix(h(cell),h(floor(cell*.5)+71.),.45)-.5)*.034*mix(.2,1.7,vn(cell/9.))*smoothstep(.03,.28,Y); }
    vec3 gl(vec2 cell,vec2 o){ return max(texture2D(tDiffuse,(cell+.5+o*uL.y/50.)/uL).rgb-.6,0.); }
    void main(){ vec2 uv=vUv; float tb=0., fk=floor(uT*16.);
      if(uX.w>0.)uv+=(vec2(h(vec2(fk,3.)),h(vec2(fk,5.)))-.5)*.004*uX.w;
      if(uC.z>0.){ vec2 p=uv*2.-1.; p+=p*p.yx*p.yx*uC.z; uv=p*.5+.5; }
      if(uX.z>0.){ float ln=floor(uv.y*uL.y), bd=fract(uv.y*.8-uT*.07); tb=smoothstep(0.,.015,bd)*smoothstep(.05,.02,bd);
        uv.x+=uX.z*((h(vec2(ln,floor(uT*20.)))-.5)*.0018+tb*.012+smoothstep(.035,0.,uv.y)*.02*h(vec2(ln,floor(uT*12.)))); }
      float in0=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);
      vec2 cell=floor(uv*uL);
      vec3 c0=yiq(fb(cell)), cl=yiq(fb(cell-vec2(1.,0.))), cr=yiq(fb(cell+vec2(1.,0.))), c3=yiq(fb(cell-vec2(3.,0.)));
      if(uX.y>0.){ vec2 f=fract(uv*uL)-.5, s=sign(f); f=abs(f); c0=mix(c0,mix(mix(c0,s.x<0.?cl:cr,f.x),yiq(mix(fb(cell+vec2(0.,s.y)),fb(cell+s),f.x)),f.y),uX.y); }
      float Y=c0.x+((cl.x+cr.x)*.08-c0.x*.16)*uK.x, e=cr.x-cl.x;
      Y+=(c3.x-c0.x)*.05*uK.x;
      vec2 IQ=c0.yz+((cl.yz+cr.yz)*.25-c0.yz*.5)*min(uK.x,2.);
      if(uX.z>0.)IQ=mix(IQ,c3.yz,.55*uX.z);
      vec2 wc=cell+uO; float ph=(wc.x+wc.y)*1.5708;   // the grain and the fringes' phase ride with the world (uO: the camera's whole-cell offset), so walking moves them with the ground instead of every pixel changing (6 Nov 2026)
      IQ+=e*.18*uK.y*smoothstep(.2,.5,abs(e))*vec2(cos(ph),sin(ph));
      vec3 c=rgb(vec3(Y,IQ));
      c+=gr(wc,Y)*uK.z;
      if(uX.x>0.)c+=(gl(cell,vec2(1.,0.))+gl(cell,vec2(-1.,0.))+gl(cell,vec2(0.,1.))+gl(cell,vec2(0.,-1.))+gl(cell,vec2(.7,.7))+gl(cell,vec2(-.7,.7))+gl(cell,vec2(.7,-.7))+gl(cell,vec2(-.7,-.7))+.6*(gl(cell,vec2(2.,0.))+gl(cell,vec2(-2.,0.))+gl(cell,vec2(0.,2.))+gl(cell,vec2(0.,-2.))))*.19*uX.x;
      if(uX.z>0.)c+=uX.z*((h(cell+floor(uT*24.)*17.)-.5)*.06*smoothstep(.02,.3,Y)+tb*h(cell*.37+uT)*.35);
      if(uX.w>0.){ float sx=h(vec2(floor(uT*7.),7.)); c=c*(1.+(h(vec2(fk,1.))-.5)*.14*uX.w)+uX.w*((h(cell+fk*13.)-.5)*.09*smoothstep(.02,.3,Y)+smoothstep(.0016,0.,abs(vUv.x-sx))*.22*step(.55,h(vec2(floor(uT*7.),9.)))); }
      if(uG.x!=1.||uG.y!=1.){ c=mix(vec3(dot(c,vec3(.299,.587,.114))),c,uG.x); c=(c-.5)*uG.y+.5; }
      c*=uTi;
      if(uG.z>.5){ float g=floor(clamp(dot(c,vec3(.299,.587,.114))*1.15+(b4(cell)-.5)*.22*uG.w,0.,.999)*4.); c=g<1.?vec3(.059,.22,.059):g<2.?vec3(.188,.384,.188):g<3.?vec3(.545,.675,.059):vec3(.608,.737,.059); }
      if(uC.x>0.)c*=(1.-uC.x*smoothstep(.45,.7,fract(vUv.y*uL.y)))*(1.+uC.x*.4);
      if(uC.y>0.){ float m=mod(floor(vUv.x*uR.x),2.)*2.-1.; c*=1.+uC.y*vec3(m,-m,m); }
      if(uC.w>0.){ vec2 q=uv-.5; c*=1.-uC.w*smoothstep(.2,1.,dot(q,q)*2.); }
      gl_FragColor=vec4(clamp(c,0.,1.)*in0,mix(1.,texture2D(tDiffuse,(cell+.5)/uL).a,uA)); }`};
PS2.sp=new ShaderPass(PS2.shader); PS2.sp.material.toneMapped=false; SHARED.composer.addPass(PS2.sp);
// a see-through part of the picture (the cinema's screen) stays see-through while asked
PS2.keepAlpha=on=>{ PS2.sp.uniforms.uA.value=on?1:0; };
const hh=(x,y)=>{ const v=Math.sin(x*12.9898+y*78.233)*43758.5453; return v-Math.floor(v); }, ss=(a,b,x)=>{ const t=Math.min(1,Math.max(0,(x-a)/(b-a))); return t*t*(3-2*t); };
const vn=(x,y)=>{ const i=Math.floor(x), j=Math.floor(y); let fx=x-i, fy=y-j; fx=fx*fx*(3-2*fx); fy=fy*fy*(3-2*fy); const a=hh(i,j)+(hh(i+1,j)-hh(i,j))*fx, b=hh(i,j+1)+(hh(i+1,j+1)-hh(i,j+1))*fx; return a+(b-a)*fy; };
const gr=(i,j,Y)=>((hh(i,j)*.55+hh(Math.floor(i*.5)+71,Math.floor(j*.5)+71)*.45)-.5)*.034*(.2+1.5*vn(i/9,j/9))*ss(.03,.28,Y);
// a filter's colour (saturation, contrast, tint, the four greens) on one pixel of a small picture
const GBP=[[15,56,15],[48,98,48],[139,172,15],[155,188,15]], c8=v=>255*Math.min(1,Math.max(0,v));
const ftone=(F,r,g,b)=>{ const s=F.sat??1, k=F.con??1, t=F.tint; if(s!==1||k!==1){ const l=.299*r+.587*g+.114*b; r=(l+(r-l)*s-.5)*k+.5; g=(l+(g-l)*s-.5)*k+.5; b=(l+(b-l)*s-.5)*k+.5; } if(t){ r*=t[0]; g*=t[1]; b*=t[2]; }
  return F.pal?GBP[Math.min(3,Math.max(0,Math.floor((.299*r+.587*g+.114*b)*1.15*4)))]:[c8(r),c8(g),c8(b)]; };
// a picture shown cssH tall on the page: the lines to give PS2.img so its pixels are the game's own size (the character page, the designer)
PS2.linesFor=cssH=>(SHARED.cellLines||PS2.lines()||240)*cssH/innerHeight*PS2.tune().k;
// a picture at the game's own resolution (each of its pixels pxS of the screen's), its PS2 look after: px read back W x H (bottom row first), shown cssH tall
PS2.page=(px,W,H,cssH,pxS)=>{ const L=Math.round(cssH*(devicePixelRatio||1)/pxS);
  if(L>=8&&L<H){ const Lx=Math.max(1,Math.round(W*L/H)), o=new Uint8Array(px);
    for(let y=0;y<H;y++){ const sy=Math.min(H-1,Math.floor((Math.floor(y*L/H)+.5)*H/L)); for(let x=0;x<W;x++){ const sx=Math.min(W-1,Math.floor((Math.floor(x*Lx/W)+.5)*W/Lx)), a=(y*W+x)*4, b=(sy*W+sx)*4; px[a]=o[b]; px[a+1]=o[b+1]; px[a+2]=o[b+2]; px[a+3]=o[b+3]; } } }
  if(PS2.on)PS2.img(px,W,H,PS2.linesFor(cssH)); };
PS2.img=(px,W,H,lines)=>{ const T=PS2.tune(), L=Math.max(8,Math.round(T.pix?Math.min(H,lines/T.k):H)), Lx=Math.max(8,Math.round(W*L/H)), N=Lx*L, Y=new Float32Array(N), I=new Float32Array(N), Q=new Float32Array(N), A=new Uint8Array(N), q=v=>T.Q>=1?Math.floor(v/T.Q)*T.Q/255:v/255;
  for(let j=0;j<L;j++)for(let i=0;i<Lx;i++){ const k=(Math.floor((j+.5)*H/L)*W+Math.floor((i+.5)*W/Lx))*4, r=q(px[k]), g=q(px[k+1]), b=q(px[k+2]), n=j*Lx+i;
    A[n]=px[k+3]>=24?px[k+3]:0; Y[n]=.299*r+.587*g+.114*b; I[n]=.596*r-.274*g-.322*b; Q[n]=.211*r-.523*g+.312*b; }
  const at=(i,j,F,c)=>{ const n=j*Lx+i; return i<0||i>=Lx||!A[n]?c:F[n]; };
  for(let j=0;j<L;j++)for(let i=0;i<Lx;i++){ const n=j*Lx+i; if(!A[n])continue; const y0=Y[n], yl=at(i-1,j,Y,y0), yr=at(i+1,j,Y,y0), e=yr-yl, s=Math.min(1,Math.max(0,(Math.abs(e)-.2)/.3)), f=.18*T.K[1]*s*s*(3-2*s)*e, ph=(i+j)*1.5708, km=T.K[0], ki=Math.min(km,2);
    const y=y0+((yl+yr)*.08-y0*.16)*km+(at(i-3,j,Y,y0)-y0)*.05*km, ii=I[n]+((at(i-1,j,I,I[n])+at(i+1,j,I,I[n]))*.25-I[n]*.5)*ki+f*Math.cos(ph), qq=Q[n]+((at(i-1,j,Q,Q[n])+at(i+1,j,Q,Q[n]))*.25-Q[n]*.5)*ki+f*Math.sin(ph), z=gr(i,j,y)*T.K[2];
    const o=ftone(T.F,y+.956*ii+.621*qq+z,y-.272*ii-.647*qq+z,y-1.106*ii+1.703*qq+z), R=o[0], G=o[1], B=o[2];
    for(let yy=Math.floor(j*H/L);yy<Math.floor((j+1)*H/L);yy++)for(let xx=Math.floor(i*W/Lx);xx<Math.floor((i+1)*W/Lx);xx++){ const k=(yy*W+xx)*4; px[k]=R; px[k+1]=G; px[k+2]=B; px[k+3]=A[n]; } }
  return px; };   // the same look on a small picture (the menu's portrait): its pixels the size of the game's on screen
// the PS2 look's five parts (PIXELS, COLOURS, SMEAR, FRINGES, GRAIN) and its STRENGTH, as the owner fixed them (11 Nov 2026)
PS2.parts={pix:true,col:true,smear:true,fringe:true,grain:false}; PS2.k=1.2;
// THE FILTERS (SETTINGS > FILTER), one pass: lines its chunky pixels, draw the lines the picture is drawn at, Q the colour step, K smear, fringes, grain; PS2 has none of these, it is the look above
PS2.F={none:{n:'NONE',lines:0,draw:1080,off:1,Q:0,K:[0,0,0]},
  ps1:{n:'PS1',lines:224,draw:448,Q:8,K:[.5,0,0],dith:1},
  ps2:{n:'PS2'},
  n64:{n:'N64',lines:240,draw:480,Q:0,K:[1.2,0,0],soft:1,sat:.94},
  dc:{n:'DREAMCAST',lines:480,draw:480,Q:0,K:[.2,0,0],glow:.15,con:1.05,sat:1.16},
  gc:{n:'GAMECUBE',lines:480,draw:480,Q:0,K:[.6,0,0],soft:.5,glow:.25,sat:1.08,tint:[1.03,1,.97]},
  xbox:{n:'XBOX',lines:480,draw:480,Q:0,K:[.5,0,0],glow:.45,con:1.14,sat:1.06,tint:[.95,1.02,.96],vig:.2},
  psp:{n:'PSP',lines:272,draw:544,Q:0,K:[1.7,0,0],mask:.05,con:.96,sat:1.1},
  ps3:{n:'PS3',lines:720,draw:720,Q:0,K:[.25,0,.5],glow:.8,con:1.1,sat:.68,tint:[1.07,.98,.82],vig:.34},
  gb:{n:'GAME BOY',lines:144,draw:288,Q:0,K:[0,0,0],pal:1,dith:1},
  crt:{n:'CRT',lines:240,draw:480,Q:0,K:[1.2,.8,0],scan:.42,mask:.12,curve:.11,vig:.45,glow:.3},
  arcade:{n:'ARCADE',lines:240,draw:480,Q:0,K:[.8,.4,0],scan:.55,mask:.18,curve:.05,vig:.3,glow:.6,sat:1.25,con:1.1},
  vhs:{n:'VHS',lines:240,draw:480,Q:0,K:[2,1,1.5],tape:1,sat:.82,con:.94,tint:[1.02,.99,1.05],scan:.12,vig:.25},
  noir:{n:'NOIR',lines:0,draw:1080,Q:0,K:[0,0,3],sat:0,con:1.3,glow:.3,vig:.5},
  sepia:{n:'SEPIA',lines:0,draw:1080,Q:0,K:[0,0,1.5],sat:0,con:1.05,tint:[1.15,1,.75],vig:.35},
  film:{n:'8MM',lines:0,draw:1080,Q:0,K:[.6,0,2],film:1,sat:.55,con:1.2,tint:[1.14,1,.76],vig:.75,glow:.3}};
PS2.f='ps2';
PS2.pick=(f,keep=true)=>{ if(!PS2.F[f])return; PS2.f=f; PS2.on=PS2.sp.enabled=!PS2.F[f].off; if(keep)try{ SAVE.set('filter',f); }catch(e){} };
PS2.tune=()=>{ const F=PS2.F[PS2.f]; if(F.K)return {pix:F.lines>0,k:F.lines?240/F.lines:1,Q:F.Q,K:F.K,F}; const P=PS2.parts, k=PS2.k; return {pix:P.pix&&k>.05,k:Math.max(.25,k),Q:P.col?Math.round(8*k):0,K:[P.smear?k:0,P.fringe?k:0,P.grain?k:0],F}; };
PS2.lines=()=>{ const T=PS2.tune(); return T.pix?Math.round(240/T.k):0; };
PS2.pick(PS2.f,false);
{ let f=QS.get('filter'); if(!f)try{ f=SAVE.get('filter'); }catch(e){} if(f)PS2.pick(f,false); } PS2.f0=PS2.f;
SYS.add('sky',()=>{ const P=SHARED.composer.passes; if(P[P.length-1]!==PS2.sp){ P.splice(P.indexOf(PS2.sp),1); P.push(PS2.sp); }
  const T=PS2.tune(), F=T.F, Ln=PS2.lines(), draw=F.draw||0, cap=draw||(PS2.on&&Ln?Math.min(480,2*Ln):0); if(cap!==PS2.cap||draw!==PS2.draw){ PS2.cap=cap; PS2.draw=draw; if(SHARED.resize)SHARED.resize(); } const ck=Ln?Math.max(1,Math.round(RH/Ln)):1; SHARED.cellLines=PS2.on&&Ln?RH/ck:0; if(!PS2.on)return; const u=PS2.sp.uniforms, t=F.tint;
  u.uL.value.set(RW/ck,RH/ck); u.uR.value.set(RW,RH); u.uQ.value=T.Q; u.uK.value.set(T.K[0],T.K[1],T.K[2]);
  u.uG.value.set(F.sat??1,F.con??1,F.pal||0,F.dith||0); u.uTi.value.set(t?t[0]:1,t?t[1]:1,t?t[2]:1); u.uC.value.set(F.scan||0,F.mask||0,F.curve||0,F.vig||0); u.uX.value.set(F.glow||0,F.soft||0,F.tape||0,F.film||0); u.uT.value=F.tape||F.film?performance.now()/1000%600:0; },'138a-ps2');   // each cell a whole number of the picture's pixels (6 Nov 2026)
