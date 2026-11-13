// THE EFFECTS: PS2, the picture's last pass but the cinema's cut, one shader. PS2 is the default; a player picks another in SETTINGS > EFFECTS (old machines, screens, film, old PC games, drawn styles) and sets each one's numbers there; the owner's SAVE FOR EVERYONE makes his pick, its numbers and the GRAPHICS level every player's (/shared/gfx.json). None is drawn at more lines than the GRAPHICS level.
import {SHARED, THREE} from './003-shx.js';
import {BUGS, ONLINE, PS2} from './003b-systems.js';
import {RH, RW, ShaderPass} from './004-main.js';
import {SAVE} from './005-save.js';
import {QS, SYS} from './006-map-pre.js';
PS2.shader={uniforms:{tDiffuse:{value:null},uT:{value:0},uL:{value:new THREE.Vector2(427,240)},uR:{value:new THREE.Vector2(854,480)},uA:{value:0},uB:{value:.25},uQ:{value:8},uK:{value:new THREE.Vector3(1,1,1)},uO:{value:new THREE.Vector2()},uG:{value:new THREE.Vector4(1,1,0,0)},uTi:{value:new THREE.Vector3(1,1,1)},uC:{value:new THREE.Vector4()},uX:{value:new THREE.Vector4()},uS:{value:new THREE.Vector4()},uM:{value:0}},
  vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  // uG: saturation, contrast, the palette (1 four greens, 2 EGA's sixteen, 3 two tones), dither; uS: ink outlines, flat bands, colour split, the style's strength; uM: the style (1 sketch, 2 painted, 3 letters, 4 wireframe, 5 whiteout, 6 print dots); uTi: tint; uC: scanlines, phosphor stripes, tube curve, dark corners; uX: glow, soft pixels, tape, film
  fragmentShader:`uniform sampler2D tDiffuse; uniform float uT,uA,uB,uQ,uM; uniform vec2 uL,uO,uR; uniform vec3 uK,uTi; uniform vec4 uG,uC,uX,uS; varying vec2 vUv;
    float b2(vec2 a){ a=floor(a); return fract(a.x/2.+a.y*a.y*.75); }
    float b4(vec2 a){ return b2(.5*a)*.25+b2(a); }
    vec3 fb(vec2 cell){ vec3 c=uB>0.?.25*(texture2D(tDiffuse,(cell+vec2(.5-uB,.5-uB))/uL).rgb+texture2D(tDiffuse,(cell+vec2(.5+uB,.5-uB))/uL).rgb+texture2D(tDiffuse,(cell+vec2(.5-uB,.5+uB))/uL).rgb+texture2D(tDiffuse,(cell+vec2(.5+uB,.5+uB))/uL).rgb):texture2D(tDiffuse,(cell+.5)/uL).rgb; return uQ>=1.?floor(clamp(c*255.+(b4(cell)-.47)*uQ*uG.w*min(1.,max(c.r,max(c.g,c.b))*10.),0.,255.)/uQ)*uQ/255.:c; }
    vec3 yiq(vec3 c){ return vec3(dot(c,vec3(.299,.587,.114)),dot(c,vec3(.596,-.274,-.322)),dot(c,vec3(.211,-.523,.312))); }
    vec3 rgb(vec3 y){ return vec3(y.x+.956*y.y+.621*y.z,y.x-.272*y.y-.647*y.z,y.x-1.106*y.y+1.703*y.z); }
    float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
    float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y); }
    float gr(vec2 cell,float Y){ return (mix(h(cell),h(floor(cell*.5)+71.),.45)-.5)*.034*mix(.2,1.7,vn(cell/9.))*smoothstep(.03,.28,Y); }
    vec3 gl(vec2 cell,vec2 o){ return max(texture2D(tDiffuse,(cell+.5+o*uL.y/50.)/uL).rgb-.6,0.); }
    float lm(vec3 c){ return dot(c,vec3(.299,.587,.114)); }
    vec3 raw(vec2 cell,vec2 o){ return texture2D(tDiffuse,(cell+.5+o)/uL).rgb; }
    vec3 pb; float pd; void pt(vec3 c,vec3 p){ vec3 d=c-p; float q=dot(d,d); if(q<pd){ pd=q; pb=p; } }
    vec3 ega(vec3 c){ pd=9.; pt(c,vec3(0.)); pt(c,vec3(0.,0.,.667)); pt(c,vec3(0.,.667,0.)); pt(c,vec3(0.,.667,.667)); pt(c,vec3(.667,0.,0.)); pt(c,vec3(.667,0.,.667)); pt(c,vec3(.667,.333,0.)); pt(c,vec3(.667)); pt(c,vec3(.333)); pt(c,vec3(.333,.333,1.)); pt(c,vec3(.333,1.,.333)); pt(c,vec3(.333,1.,1.)); pt(c,vec3(1.,.333,.333)); pt(c,vec3(1.,.333,1.)); pt(c,vec3(1.,1.,.333)); pt(c,vec3(1.)); return pb; }
    float glyph(float n,vec2 f){ vec2 p=floor(f*vec2(5.,5.)); p.y=4.-p.y; return (p.x<0.||p.x>4.||p.y<0.||p.y>4.)?0.:mod(floor(n/exp2(p.x+5.*p.y)),2.); }
    vec3 kuw(vec2 cell,float r){ vec3 best=vec3(0.); float bv=1e9; for(int q=0;q<4;q++){ vec2 s=vec2(q==0||q==2?-1.:1.,q<2?-1.:1.); vec3 m=vec3(0.),m2=vec3(0.); for(int j=0;j<3;j++)for(int i=0;i<3;i++){ vec3 t=raw(cell,s*vec2(float(i),float(j))*r); m+=t; m2+=t*t; } m/=9.; m2=abs(m2/9.-m*m); float v=m2.r+m2.g+m2.b; if(v<bv){ bv=v; best=m; } } return best; }
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
      if(uS.z>0.){ float o=uS.z*max(1.,uL.y/240.)*(.4+2.*length(uv-.5)); c.r=mix(c.r,fb(cell+vec2(o,0.)).r,.85); c.b=mix(c.b,fb(cell-vec2(o,0.)).b,.85); }
      float eg=0.; vec2 fc=fract(uv*uL);
      if(uS.x>0.||uM==1.||uM==4.||uM==5.){ float d=max(1.,floor(uL.y/400.+.5))*max(1.,uS.x), a=lm(raw(cell,vec2(-d,0.))), b=lm(raw(cell,vec2(d,0.))), e1=lm(raw(cell,vec2(0.,-d))), f1=lm(raw(cell,vec2(0.,d))), g1=lm(raw(cell,vec2(-d,-d))), h1=lm(raw(cell,vec2(d,d))); eg=smoothstep(.07,.22,abs(a-b)+abs(e1-f1)+.7*abs(g1-h1)); }
      if(uM==2.)c=mix(c,kuw(cell,max(1.,uL.y/170.))*(.93+.14*vn(wc/2.5)),uS.w);
      c+=gr(wc,Y)*uK.z;
      if(uX.x>0.)c+=(gl(cell,vec2(1.,0.))+gl(cell,vec2(-1.,0.))+gl(cell,vec2(0.,1.))+gl(cell,vec2(0.,-1.))+gl(cell,vec2(.7,.7))+gl(cell,vec2(-.7,.7))+gl(cell,vec2(.7,-.7))+gl(cell,vec2(-.7,-.7))+.6*(gl(cell,vec2(2.,0.))+gl(cell,vec2(-2.,0.))+gl(cell,vec2(0.,2.))+gl(cell,vec2(0.,-2.))))*.19*uX.x;
      if(uX.z>0.)c+=uX.z*((h(cell+floor(uT*24.)*17.)-.5)*.06*smoothstep(.02,.3,Y)+tb*h(cell*.37+uT)*.35);
      if(uX.w>0.){ float sx=h(vec2(floor(uT*7.),7.)); c=c*(1.+(h(vec2(fk,1.))-.5)*.14*uX.w)+uX.w*((h(cell+fk*13.)-.5)*.09*smoothstep(.02,.3,Y)+smoothstep(.0016,0.,abs(vUv.x-sx))*.22*step(.55,h(vec2(floor(uT*7.),9.)))); }
      if(uG.x!=1.||uG.y!=1.){ c=mix(vec3(dot(c,vec3(.299,.587,.114))),c,uG.x); c=(c-.5)*uG.y+.5; }
      c*=uTi;
      if(uS.y>=2.)c=floor(clamp(c,0.,1.)*uS.y+.5)/uS.y;
      if(uS.x>0.)c=mix(c,vec3(.02,.02,.04),eg*min(1.,uS.x));
      if(uM==1.){ float L=lm(c); vec2 px=vUv*uR; float k=max(3.,uR.y/110.), h1=step(.55,fract((px.x+px.y)/k)), h2=step(.55,fract((px.x-px.y)/k)); vec3 pp=vec3(.95,.93,.86)*(.96+.06*vn(px/3.)); float ink=clamp(eg*.9+h1*smoothstep(.62,.3,L)*.45+h2*smoothstep(.36,.1,L)*.5,0.,1.); c=mix(c,mix(pp,vec3(.16,.15,.2),ink),uS.w); }
      if(uM==3.){ float L=pow(clamp(lm(c)*1.25,0.,1.),.6), n=L<.08?0.:L<.2?4096.:L<.32?65600.:L<.45?332772.:L<.58?15255086.:L<.72?23385164.:L<.86?15252014.:11512810.; vec3 t=c/max(max(c.r,max(c.g,c.b)),.25); c=mix(c,t*glyph(n,(fc-.5)*1.2+.5)*(.45+.55*L)*1.15,uS.w); }
      if(uM==4.){ vec3 t=c/max(max(c.r,max(c.g,c.b)),.3); c=mix(c,mix(vec3(.1,1.,.85),t,.45)*eg*1.5+c*.05,uS.w); }
      if(uM==5.){ float L=lm(c), rd=smoothstep(.1,.28,c.r-max(c.g,c.b)); vec3 w=vec3(mix(.5,1.,smoothstep(.02,.55,L)))*vec3(.98,.99,1.)*(1.-.55*eg); c=mix(c,mix(w,vec3(.92,.07,.05)*(.55+.6*L),rd),uS.w); }
      if(uM==6.){ float L=pow(clamp(lm(c),0.,1.),.55), k=max(3.,uR.y/100.); vec2 px=vUv*uR, q=vec2(px.x+px.y,px.x-px.y)*.7071/k; float d=length(fract(q)-.5), r=sqrt(clamp(1.-L,0.,1.))*.72; vec3 fl=clamp(c/max(lm(c),.12)*max(L,.45),0.,1.); c=mix(c,mix(fl,vec3(.06,.05,.1),smoothstep(r+.06,r-.06,d)),uS.w); }
      if(uG.z>.5&&uG.z<1.5){ float g=floor(clamp(dot(c,vec3(.299,.587,.114))*1.15+(b4(cell)-.5)*.22*uG.w,0.,.999)*4.); c=g<1.?vec3(.059,.22,.059):g<2.?vec3(.188,.384,.188):g<3.?vec3(.545,.675,.059):vec3(.608,.737,.059); }
      if(uG.z>1.5&&uG.z<2.5)c=ega(clamp(c+(b4(cell)-.5)*.34*uG.w,0.,1.));
      if(uG.z>2.5)c=lm(c)+(b4(cell)-.5)*.9*uG.w>.5?vec3(.9,.91,.8):vec3(.2,.19,.15);
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
const ftone=(F,r,g,b)=>{ const s=F.sat??1, k=F.con??1, t=F.tr!==1||F.tg!==1||F.tb!==1?[F.tr,F.tg,F.tb]:null; if(s!==1||k!==1){ const l=.299*r+.587*g+.114*b; r=(l+(r-l)*s-.5)*k+.5; g=(l+(g-l)*s-.5)*k+.5; b=(l+(b-l)*s-.5)*k+.5; } if(t){ r*=t[0]; g*=t[1]; b*=t[2]; }
  return F.pal===1?GBP[Math.min(3,Math.max(0,Math.floor((.299*r+.587*g+.114*b)*1.15*4)))]:[c8(r),c8(g),c8(b)]; };
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
// the PS2 look as the owner fixed it (11 Nov 2026): pixels, colours, smear and fringes at 120%, no grain; its numbers are PS2.F.ps2's
PS2.parts={pix:true,col:true,smear:true,fringe:true,grain:false}; PS2.k=1.2;
// THE EFFECTS' NUMBERS, the same for every effect: key, its name in the menu, lowest, highest, step
PS2.FX=[['lines','PIXEL LINES (0 = OFF)',0,720,4],['draw','DRAWN AT (LINES)',120,1080,8],['Q','COLOUR STEP (0 = OFF)',0,64,1],['dith','DITHER',0,2,.05],['smear','SMEAR',0,3,.05],['fringe','COLOUR FRINGES',0,3,.05],['grain','GRAIN',0,4,.05],['soft','SOFT PIXELS',0,1,.05],['glow','GLOW',0,2,.05],
  ['sat','COLOUR',0,2,.02],['con','CONTRAST',.5,2,.02],['tr','RED',.5,1.5,.01],['tg','GREEN',.5,1.5,.01],['tb','BLUE',.5,1.5,.01],['vig','DARK CORNERS',0,1,.05],['scan','SCANLINES',0,1,.02],['mask','SCREEN STRIPES',0,.5,.01],['curve','TUBE CURVE',0,.3,.01],['tape','TAPE WOBBLE',0,2,.05],['film','FILM FLICKER',0,2,.05],
  ['ink','INK OUTLINES',0,3,.05],['post','COLOUR BANDS (0 = OFF)',0,12,1],['split','COLOUR SPLIT',0,3,.05],['style','STYLE STRENGTH',0,1,.05]];
const Z={lines:0,draw:1080,Q:0,dith:0,smear:0,fringe:0,grain:0,soft:0,glow:0,sat:1,con:1,tr:1,tg:1,tb:1,vig:0,scan:0,mask:0,curve:0,tape:0,film:0,ink:0,post:0,split:0,style:0,pal:0,mode:0};
// the effects: each its name and what differs from none (pal: 1 four greens, 2 EGA's sixteen, 3 two tones; mode: a drawn style)
PS2.F={none:{n:'NONE',off:1},
  ps1:{n:'PS1',lines:224,draw:448,Q:8,smear:.5,dith:1},
  ps2:{n:'PS2',lines:200,draw:400,Q:10,smear:1.2,fringe:1.2},
  n64:{n:'N64',lines:240,draw:480,smear:1.2,soft:1,sat:.94},
  dc:{n:'DREAMCAST',lines:480,draw:480,smear:.2,glow:.15,con:1.05,sat:1.16},
  gc:{n:'GAMECUBE',lines:480,draw:480,smear:.6,soft:.5,glow:.25,sat:1.08,tr:1.03,tb:.97},
  xbox:{n:'XBOX',lines:480,draw:480,smear:.5,glow:.45,con:1.14,sat:1.06,tr:.95,tg:1.02,tb:.96,vig:.2},
  psp:{n:'PSP',lines:272,draw:480,smear:1.7,mask:.05,con:.96,sat:1.1},
  ps3:{n:'PS3',lines:720,draw:720,smear:.25,grain:.5,glow:.8,con:1.1,sat:.68,tr:1.07,tg:.98,tb:.82,vig:.34},
  gb:{n:'GAME BOY',lines:144,draw:288,pal:1,dith:1},
  crt:{n:'CRT',lines:240,draw:480,smear:1.2,fringe:.8,scan:.42,mask:.12,curve:.11,vig:.45,glow:.3},
  arcade:{n:'ARCADE',lines:240,draw:480,smear:.8,fringe:.4,scan:.55,mask:.18,curve:.05,vig:.3,glow:.6,sat:1.25,con:1.1},
  vhs:{n:'VHS',lines:240,draw:480,smear:2,fringe:1,grain:1.5,tape:1,sat:.82,con:.94,tr:1.02,tg:.99,tb:1.05,scan:.12,vig:.25},
  noir:{n:'NOIR',grain:3,sat:0,con:1.3,glow:.3,vig:.5},
  sepia:{n:'SEPIA',grain:1.5,sat:0,con:1.05,tr:1.15,tb:.75,vig:.35},
  film:{n:'8MM',smear:.6,grain:2,film:1,sat:.55,con:1.2,tr:1.14,tb:.76,vig:.75,glow:.3},
  lucas:{n:'LUCASARTS',lines:200,draw:400,Q:36,dith:1,sat:1.12,con:1.06},
  ega:{n:'EGA',lines:200,draw:400,pal:2,dith:1,sat:1.25},
  bit:{n:'1-BIT',lines:240,draw:480,pal:3,dith:1,con:1.15},
  comic:{n:'COMIC',ink:1,post:5,sat:1.35,con:1.1},
  neon:{n:'NEON',glow:1.4,split:1.2,sat:1.7,con:1.25,tr:1.05,tg:.9,tb:1.15,scan:.18,vig:.45},
  sketch:{n:'SKETCH',mode:1,style:1,sat:.6},
  paint:{n:'PAINTED',mode:2,style:1,sat:1.15},
  ascii:{n:'ASCII',lines:45,draw:360,mode:3,style:1,sat:1.3},
  wire:{n:'WIREFRAME',mode:4,style:1,glow:.6},
  white:{n:'WHITEOUT',mode:5,style:1,con:1.1},
  half:{n:'HALFTONE',mode:6,style:1,sat:1.3}};
// a player's own numbers over an effect's ({effect:{key:number}}), kept with what they own
PS2.set={}; try{ const j=JSON.parse(SAVE.get('fxset')||'{}'); if(j&&typeof j==='object')PS2.set=j; }catch(e){}
{ let ck='', cv=null; PS2.cur=()=>{ if(ck!==PS2.f||!cv){ ck=PS2.f; cv={...Z,...PS2.F[PS2.f]}; const o=PS2.set[PS2.f]; if(o)for(const [k,,a,b] of PS2.FX)if(typeof o[k]==='number'&&isFinite(o[k]))cv[k]=Math.min(b,Math.max(a,o[k])); } return cv; }; PS2.fresh=()=>{ cv=null; }; }
PS2.keep=()=>{ try{ SAVE.set('fxset',JSON.stringify(PS2.set)); }catch(e){} };
PS2.put=(k,v)=>{ const F={...Z,...PS2.F[PS2.f]}, o=PS2.set[PS2.f]||(PS2.set[PS2.f]={}); if(v===F[k])delete o[k]; else o[k]=v; if(!Object.keys(o).length)delete PS2.set[PS2.f]; PS2.fresh(); PS2.keep(); };
PS2.f='ps2';
PS2.pick=(f,keep=true)=>{ if(!PS2.F[f])return; PS2.f=f; PS2.fresh(); PS2.on=PS2.sp.enabled=!PS2.F[f].off; if(keep)try{ SAVE.set('filter',f); }catch(e){} };
PS2.tune=()=>{ const F=PS2.cur(); return {pix:F.lines>0,k:F.lines?240/F.lines:1,Q:F.Q,K:[F.smear,F.fringe,F.grain],F}; };
PS2.lines=()=>{ const T=PS2.tune(); return T.pix?Math.round(240/T.k):0; };
PS2.pick(PS2.f,false);
{ let f=QS.get('filter'); if(!f)try{ f=SAVE.get('filter'); }catch(e){} if(f)PS2.pick(f,false); } PS2.f0=PS2.f;
SYS.add('sky',()=>{ const P=SHARED.composer.passes; if(P[P.length-1]!==PS2.sp){ P.splice(P.indexOf(PS2.sp),1); P.push(PS2.sp); }
  const T=PS2.tune(), F=T.F, Ln=PS2.lines(), draw=F.draw||0, cap=draw||(PS2.on&&Ln?Math.min(480,2*Ln):0); if(cap!==PS2.cap||draw!==PS2.draw){ PS2.cap=cap; PS2.draw=draw; if(SHARED.resize)SHARED.resize(); } const ck=Ln?Math.max(1,Math.round(RH/Ln)):1; SHARED.cellLines=PS2.on&&Ln?RH/ck:0; if(!PS2.on)return; const u=PS2.sp.uniforms;
  u.uL.value.set(RW/ck,RH/ck); u.uB.value=.25; u.uR.value.set(RW,RH); u.uQ.value=T.Q; u.uK.value.set(T.K[0],T.K[1],T.K[2]);
  u.uG.value.set(F.sat,F.con,F.pal,F.dith); u.uTi.value.set(F.tr,F.tg,F.tb); u.uC.value.set(F.scan,F.mask,F.curve,F.vig); u.uX.value.set(F.glow,F.soft,F.tape,F.film); u.uS.value.set(F.ink,F.post,F.split,F.mode?F.style:0); u.uM.value=F.mode&&F.style>0?F.mode:0; u.uT.value=F.tape||F.film?performance.now()/1000%600:0; },'138a-ps2');   // each cell a whole number of the picture's pixels (6 Nov 2026)

// THE EFFECT'S NUMBERS IN THE MENU (SETTINGS > EFFECTS, under the list): a slider each, kept as you move it; the owner's SAVE FOR EVERYONE
{ const FILE='/shared/gfx.json', web=/^https?:$/.test(location.protocol); let own=false, say='', host=null, lastG=null;
  const fmt=(v,st)=>st>=1?String(Math.round(v)):(+v).toFixed(2);
  PS2.panel=()=>{ const D=document.getElementById('dfil'); if(!D)return; if(!host){ host=document.createElement('div'); host.id='dfx'; D.parentNode.appendChild(host);
      host.addEventListener('input',e=>{ const k=e.target.dataset.fx; if(!k)return; const f=PS2.FX.find(x=>x[0]===k), v=+e.target.value; PS2.put(k,v); e.target.nextElementSibling.textContent=fmt(v,f[4]); });
      host.addEventListener('click',e=>{ const a=e.target.dataset.fxa; if(!a)return; if(a==='reset'){ delete PS2.set[PS2.f]; PS2.fresh(); PS2.keep(); } if(a==='all')PS2.pushAll(); if(a==='clear')PS2.pushAll(true); PS2.panel(); }); }
    const F=PS2.cur(), off=!!PS2.F[PS2.f].off;
    host.innerHTML=(off?'<div class="dim" style="margin:8px 0">NONE: THE PICTURE AS DRAWN, NOTHING TO SET.</div>':'<div class="dim" style="margin:8px 0">'+PS2.F[PS2.f].n+': ITS SETTINGS (YOURS, KEPT AS YOU MOVE THEM)</div>'+PS2.FX.map(([k,l,a,b,st])=>'<div class="row"><span style="flex:1;min-width:0">'+l+'</span><input type="range" data-fx="'+k+'" min="'+a+'" max="'+b+'" step="'+st+'" value="'+F[k]+'" style="flex:1"><span style="width:44px;text-align:right">'+fmt(F[k],st)+'</span></div>').join('')
      +'<div class="row"><button class="btn" data-fxa="reset">BACK TO '+PS2.F[PS2.f].n+'\'S OWN</button></div>')
      +(own?'<div class="row" style="margin-top:10px"><button class="btn" data-fxa="all">SAVE FOR EVERYONE</button><button class="btn" data-fxa="clear">EVERYONE BACK TO THE GAME\'S OWN</button></div><div class="dim">SAVE FOR EVERYONE: THIS EFFECT, EVERY EFFECT\'S SETTINGS AS YOU HAVE THEM AND YOUR GRAPHICS LEVEL BECOME EVERY PLAYER\'S, NOW AND WHEN THEY ARRIVE; EACH CAN STILL CHANGE THEIR OWN AFTER.</div>':'')
      +(say?'<div class="dim" style="margin-top:6px">'+say+'</div>':''); };
  // the owner's look for everyone: the effect, every effect's numbers and the GRAPHICS level, taken by each player once per save (their own changes after it stay theirs)
  const take=j=>{ if(!j||j.v!==1||!isFinite(j.at)||QS.get('filter'))return; let at=null; try{ at=SAVE.get('gfxat'); }catch(e){} if(String(j.at)===String(at))return;
    PS2.set=j.set&&typeof j.set==='object'?JSON.parse(JSON.stringify(j.set)):{}; PS2.keep(); PS2.pick(PS2.F[j.f]?j.f:'ps2'); PS2.f0=PS2.f;
    if(j.res===0||j.res===1){ SHARED.RESI=j.res; try{ SAVE.set('gfx',String(j.res)); }catch(e){} if(SHARED.resize)SHARED.resize(); }
    try{ SAVE.set('gfxat',String(j.at)); }catch(e){} if(host&&host.offsetParent){ document.querySelectorAll('#dfil [data-fil]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fil===PS2.f))); document.querySelectorAll('[data-res]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.res===SHARED.RESI))); PS2.panel(); } };
  const get=()=>web?fetch(FILE,{credentials:'same-origin'}).then(r=>r.ok&&r.status!==204?r.json():null).then(take).catch(()=>{}):Promise.resolve();
  PS2.take=take; PS2.pushAll=clear=>{ const at=Date.now(), j=clear?{v:1,at,f:'ps2',res:0,set:{}}:{v:1,at,f:PS2.f,res:SHARED.RESI,set:PS2.set}; say='SAVING...'; if(clear)take(j); else try{ SAVE.set('gfxat',String(at)); }catch(e){}
    return fetch(FILE,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(j)}).then(async r=>{ const o=await r.json().catch(()=>({})); if(!r.ok||!o.ok)throw new Error(o.why||r.status); if(ONLINE.put&&ONLINE.on)ONLINE.put('gfx',lastG=at); say=clear?'EVERYONE IS BACK ON THE GAME\'S OWN LOOK':'SAVED: EVERYONE HAS THIS LOOK NOW'; }).catch(e=>{ say='NOT SAVED: '+String(e.message||e).toUpperCase(); }).then(()=>{ if(host)PS2.panel(); }); };
  SYS.add('world',(k,v)=>{ if(k==='gfx'&&v!==lastG){ lastG=v; get(); } },'138a-gfx');
  get(); setTimeout(()=>{ if(BUGS.owner)BUGS.owner().then(o=>{ own=o===true||!!o; if(own&&host&&host.offsetParent)PS2.panel(); }).catch(()=>{}); },3000); }
