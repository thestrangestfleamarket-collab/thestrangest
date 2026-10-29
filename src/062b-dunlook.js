// THE DUNGEON'S LOOK: lava pools and the falls that feed them, mist, fog, embers, cracks, moss, webs, stalactites, rubble and lived-in corners (the dungeon's builder calls it).
import {SHARED, THREE} from './003-shx.js';
import {pos} from './003b-systems.js';
import {scene} from './004-main.js';
import {MODS, STN, SYS, TILE} from './006-map-pre.js';
{ const X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, Y=SHARED.BOD.YS, dy=STN.DY, F32=THREE.Float32BufferAttribute, U={uT:{value:0}}, NP=8;
  const rng=s=>()=>{ s=s*16807%2147483647; return (s-1)/2147483646; };
  const NOISE='float h(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5); } float n(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y); }';
  const can=(w,h,f)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; f(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; return t; };
  const TX={}, tex=(k,f)=>TX[k]||(TX[k]=f());
  const CRACK=()=>tex('crack',()=>can(128,128,(g)=>{ const r=rng(77); g.strokeStyle='#fff'; g.lineCap='square';   // four cracks, one a corner of the sheet
    const line=(x,y,a,len,w)=>{ g.lineWidth=w; g.beginPath(); g.moveTo(x,y); for(let s=0;s<len;s+=3){ a+=(r()-.5)*.9; x+=Math.cos(a)*3; y+=Math.sin(a)*3; g.lineTo(x,y); if(r()<.08&&w>1)line(x,y,a+(r()<.5?-1:1)*(.7+r()*.6),len*.4,w-1); } g.stroke(); };
    for(let v=0;v<4;v++){ const ox=(v&1)*64, oy=(v>>1)*64; g.save(); g.beginPath(); g.rect(ox,oy,64,64); g.clip(); line(ox+8,oy+32+(r()-.5)*20,(r()-.5)*.6,58,2); line(ox+32,oy+8,1.57+(r()-.5)*.6,40,2); g.restore(); } }));
  const MOSS=()=>tex('moss',()=>can(64,64,(g)=>{ const r=rng(91), P=['#2c3a1c','#3b4a22','#4d5a2a','#24301a','#5b6630'];
    for(let v=0;v<4;v++){ const ox=(v&1)*32, oy=(v>>1)*32; for(let k=0;k<70;k++){ const a=r()*6.283, q=Math.pow(r(),.7)*13*(.8+.3*Math.sin(a*3+v)); g.fillStyle=P[(r()*P.length)|0]; g.fillRect(ox+16+Math.cos(a)*q|0,oy+16+Math.sin(a)*q|0,1+(r()*2|0),1+(r()*2|0)); } } }));
  const WEBT=()=>tex('web',()=>can(128,128,(g)=>{ g.strokeStyle='rgba(220,220,210,.8)'; g.lineWidth=1.2; const c=64, r=rng(13);
    for(let k=0;k<11;k++){ const a=k/11*6.283+r()*.3; g.beginPath(); g.moveTo(c,c); g.lineTo(c+Math.cos(a)*64,c+Math.sin(a)*64); g.stroke(); }
    for(let q=5;q<62;q+=5.5+r()*2){ g.beginPath(); for(let k=0;k<=11;k++){ const a=k/11*6.283, s=q*(.9+.1*Math.sin(k*5+q)); k?g.lineTo(c+Math.cos(a)*s,c+Math.sin(a)*s):g.moveTo(c+Math.cos(a)*s,c+Math.sin(a)*s); } g.stroke(); }
    g.strokeStyle='rgba(220,220,210,.35)'; for(let k=0;k<5;k++){ g.beginPath(); g.moveTo(r()*128,r()*128); g.quadraticCurveTo(64,64+r()*40,r()*128,r()*128); g.stroke(); } }));
  const GLOW=()=>tex('glow',()=>can(32,32,(g)=>{ const q=g.createRadialGradient(16,16,0,16,16,16); q.addColorStop(0,'rgba(255,255,255,1)'); q.addColorStop(.4,'rgba(255,255,255,.45)'); q.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=q; g.fillRect(0,0,32,32); }));
  const AO=()=>tex('ao',()=>can(16,16,(g)=>{ for(let i=0;i<16;i++){ g.fillStyle=`rgba(0,0,0,${Math.pow(1-i/16,1.8).toFixed(3)})`; g.fillRect(i,0,1,16); } }));
  const LAVA=()=>TX.lava||(TX.lava=new THREE.ShaderMaterial({uniforms:{uT:U.uT,uK:{value:8/TILE}},side:THREE.DoubleSide,
    vertexShader:'attribute float aE; varying vec2 vW; varying float vE; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xz; vE=aE; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader:'uniform float uT,uK; varying vec2 vW; varying float vE; '+NOISE+
      'void main(){ vec2 p=floor(vW*uK)/8.; float v=n(p*1.1+vec2(uT*.11,uT*.06))*.62+n(p*2.7-vec2(uT*.23,uT*.05))*.38;'+
      ' vec3 c=v>.7?vec3(1.,.9,.5):v>.55?vec3(1.,.52,.1):v>.38?vec3(.8,.19,.03):vec3(.34,.06,.02);'+
      ' float e=smoothstep(.55,1.,vE+(n(p*3.1+7.)-.5)*.35), k=abs(n(p*1.7+vec2(-uT*.03,uT*.02))-.5);'+   // cooling crust at the edge, split by glowing seams
      ' c=mix(c,k<.05?vec3(1.,.48,.1):k<.09?vec3(.5,.12,.03):vec3(.11,.06,.05),e*.95);'+
      ' vec2 q=p*1.6, f=fract(q)-.5; float b=h(floor(q)), t=fract(uT*.3+b*9.); if(b>.82&&vE<.75&&length(f)<.42*t) c=mix(vec3(1.,.95,.7),c,t);'+   // bubbles that swell and pop
      ' gl_FragColor=vec4(c,1.); }'}));
  const FALL=()=>TX.fall||(TX.fall=new THREE.ShaderMaterial({uniforms:{uT:U.uT},clipping:true,side:THREE.DoubleSide,
    vertexShader:'#include <clipping_planes_pars_vertex>\nvarying vec2 vU; void main(){ vU=uv; vec4 mvPosition=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mvPosition;\n#include <clipping_planes_vertex>\n}',
    fragmentShader:'#include <clipping_planes_pars_fragment>\nuniform float uT; varying vec2 vU; '+NOISE+'void main(){\n#include <clipping_planes_fragment>\n'+
      ' vec2 p=floor(vU*vec2(10.,36.))/vec2(10.,36.); float e=abs(p.x-.5)*2., s=n(vec2(p.x*7.,p.y*9.+uT*2.2))*.6+n(vec2(p.x*15.,p.y*21.+uT*3.1))*.4;'+
      ' if(e>.78+.2*s) discard; vec3 c=s>.62?vec3(1.,.92,.55):s>.42?vec3(1.,.55,.12):vec3(.75,.18,.03); c*=1.-.45*e*e;'+
      ' gl_FragColor=vec4(c,1.); }'}));
  const EMB=()=>TX.emb||(TX.emb=new THREE.ShaderMaterial({uniforms:{uT:U.uT,uH:{value:3.2*TILE}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:'attribute float aS; uniform float uT,uH; varying float vA; void main(){ float t=fract(uT*(.12+.1*aS)+aS*7.31); vec3 p=position; p.y+=t*uH*(.5+.5*aS); p.x+=sin(uT*1.3+aS*40.)*.25*uH*t*.3; p.z+=cos(uT*1.1+aS*23.)*.25*uH*t*.3;'+
      ' vA=(1.-t)*smoothstep(0.,.08,t); vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=2.+2.*aS; }',
    fragmentShader:'varying float vA; void main(){ gl_FragColor=vec4(vec3(1.,.55,.15)*vA,1.); }'}));
  const MISTU={uT:U.uT,uP:{value:Array.from({length:NP},()=>new THREE.Vector3(0,0,-1))},uK:{value:3/TILE}};
  const MIST=a=>new THREE.ShaderMaterial({uniforms:{...MISTU,uA:{value:a}},transparent:true,depthWrite:false,
    vertexShader:'varying vec2 vW; varying vec3 vP; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xz; vP=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
    fragmentShader:'uniform float uT,uA,uK; uniform vec3 uP['+NP+']; varying vec2 vW; varying vec3 vP; '+NOISE+'void main(){ vec2 p=floor(vW*uK*6.)/6.;'+
      ' float v=n(p*.35+vec2(uT*.05,uT*.02))*.6+n(p*.9-vec2(uT*.07,-uT*.03))*.4, a=smoothstep(.4,.9,v)*uA, g=0.;'+
      ' for(int i=0;i<'+NP+';i++){ if(uP[i].z>0.) g+=max(0.,1.-length(vW-uP[i].xy)/uP[i].z); }'+   // lit orange over the pools
      ' g=min(g,1.); a*=mix(1.,.3,abs(normalize(cameraPosition-vP).y));'+   /* thin when you look down through it */
      ' gl_FragColor=vec4(mix(vec3(.1,.11,.1),vec3(1.,.42,.12),g*.8),a*(1.+g*1.5)); }'});
  const DF=new THREE.Fog(0x080605,1,2), V3=new THREE.Vector3();
  const S={lights:[],up:[]};   // the level dressed now: its pool lights, the things hidden from above
  const quads=()=>({p:[],u:[],c:[]}), WK={l:'Kw',r:'Ke',b:'Kb',f:'Kf'};
  const put=(g,a,b,c,d,v,col)=>{ const [u0,v0,s]=v<0?[0,0,1]:[(v&1)*.5,(v>>1)*.5,.5], UV=[[u0,v0],[u0+s,v0],[u0+s,v0+s],[u0,v0+s]], P=[a,b,c,d];
    for(const i of [0,1,2,0,2,3]){ g.p.push(...P[i]); g.u.push(...UV[i]); if(col)g.c.push(...col); } };
  const geo=g=>{ const o=new THREE.BufferGeometry(); o.setAttribute('position',new F32(g.p,3)); o.setAttribute('uv',new F32(g.u,2)); if(g.c.length)o.setAttribute('color',new F32(g.c,3)); o.computeVertexNormals(); return o; };
  const props=(L,Kc)=>{ '@dungeon'; const {R,up,dn,hz,n}=L, r=rng(n*4111+7), out=[], took=[];   // the same bones, crates and camp each time you come to a level
    const free=(x,y,m)=>!hz.some(h=>h.t==='web'?Math.hypot(x-h.cx,y-h.cy)<h.r+m:x>h.x0-m&&x<h.x1+m&&y>h.y0-m&&y<h.y1+m)&&!(y<up.y1+2&&x>up.x0-1.5&&x<up.x1+1.5)&&!(dn&&y>dn.y0-2.5&&x>dn.x0-1.5&&x<dn.x1+1.5)&&!took.some(t=>Math.hypot(x-t[0],y-t[1])<t[2]+m);
    const spot=(m,wall)=>{ for(let k=0;k<40;k++){ const w=r()<.5, x=wall?(w?R.x0+.45+r()*.4:R.x1-.45-r()*.4):R.x0+1+r()*(R.x1-R.x0-2), y=R.y0+4+r()*(R.y1-R.y0-7); if(free(x,y,m)){ took.push([x,y,m]); return [x,y]; } } return null; };
    const put1=(k,x,y,s)=>{ const p=Kc[k](x,y); if(s)out.push([p.x0,p.y0,p.x1,p.y1,s]); return p; };
    const camp=spot(1.6,true); if(camp){ const [x,y]=camp, sx=x<R.cx?1:-1; put1('straw',x-sx*.05,y-.5); put1('crate',x,y+.75,16); put1('oak barrel',x,y+1.3,28); put1('bones',x+sx*.9,y-.9); L.camp={x:x+sx*1.05,y:y+.25}; }
    for(let k=0;k<3+n;k++){ const s=spot(.5,r()<.8); if(s)put1(['bone pile','skull','bones'][(r()*3)|0],...s); }
    for(let k=0;k<1+(n>2);k++){ const s=spot(.7,true); if(!s)continue; const [x,y]=s; put1('crate',x,y,16); if(r()<.6)put1(r()<.5?'oak barrel':'crate',x,y+.62,r()<.5?28:16); }
    if(n>2){ const s=spot(.6,true); if(s)put1('iron chest',...s,12); }
    if(n>1){ const s=spot(1,false); if(s)put1('gibbet',...s); }
    L.took=took; return out; };
  const dress=(L,ctx)=>{ '@dungeon'; const {R,B,hz,n}=L, {own,light,PL,lavaR}=ctx, r=rng(n*9157+3), fy=Y(.3)+dy, top=Y(R.H+4)+dy, c3=new THREE.Color(), LV=hz.filter(h=>h.t==='lava'), e=.004*TILE;
    S.lights=[]; S.up=[];
    const col=(a)=>{ c3.setRGB(a[0]/255,a[1]/255,a[2]/255,THREE.SRGBColorSpace); return [c3.r,c3.g,c3.b]; };
    const cx=x=>Math.max(R.x0,Math.min(R.x1,x)), W=(x,z,y)=>[X(x),z,Z(y)];
    const wpt=(w,a,z,o=.02)=>w==='l'?W(R.x0+o,z,a):w==='r'?W(R.x1-o,z,a):w==='b'?W(a,z,R.y0+o):W(a,z,R.y1-o);
    const flat=(g,x,y,z,w,h,rot,v)=>{ const c=Math.cos(rot), s=Math.sin(rot), pt=(i,j)=>W(x+i*w/2*c-j*h/2*s,z,y+i*w/2*s+j*h/2*c); put(g,pt(-1,-1),pt(1,-1),pt(1,1),pt(-1,1),v); };
    const wq=(g,w,u,z0,wd,ht,v,o)=>put(g,wpt(w,u-wd/2,z0,o),wpt(w,u+wd/2,z0,o),wpt(w,u+wd/2,z0+ht,o),wpt(w,u-wd/2,z0+ht,o),v);
    const G={}, gq=(k,w)=>G[k+'|'+(w||'')]||(G[k+'|'+(w||'')]=quads());
    const mats={crack:()=>new THREE.MeshBasicMaterial({map:CRACK(),color:0x0d0a08,transparent:true,opacity:.8,depthWrite:false,side:2}),
      glowc:()=>new THREE.MeshBasicMaterial({map:CRACK(),color:0xff5a14,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:2}),
      moss:()=>new THREE.MeshLambertMaterial({map:MOSS(),transparent:true,alphaTest:.3,side:2}),
      web:()=>new THREE.MeshLambertMaterial({map:WEBT(),transparent:true,depthWrite:false,alphaTest:.04,side:2}),
      ao:()=>new THREE.MeshBasicMaterial({map:AO(),color:0,transparent:true,opacity:.75,depthWrite:false,side:2}),
      glow:()=>new THREE.MeshBasicMaterial({map:GLOW(),color:0xff6a1c,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:2})};
    // the pools: lava, a lumpy crust round it, its glow on the floor, a light, embers
    const lp=[], lE=[], kp=[], kc=[], gp=[], gc=[], EP=[], ES=[], N=56, zl=fy+.012*TILE;
    LV.forEach((h,i)=>{ const ed=[]; for(let k=0;k<N;k++){ const a=k/N*6.2832, q=lavaR(h,a), x=cx(h.cx+Math.cos(a)*h.rx*q), y=h.cy+Math.sin(a)*h.ry*q, l=Math.hypot(x-h.cx,y-h.cy)||1; ed.push([x,y,(x-h.cx)/l,(y-h.cy)/l]); }
      for(let k=0;k<N;k++){ const A=ed[k], Bq=ed[(k+1)%N], m=(P,f)=>[h.cx+(P[0]-h.cx)*f,h.cy+(P[1]-h.cy)*f];
        for(const [P,eE] of [[[h.cx,h.cy],0],[m(A,.6),.6],[m(Bq,.6),.6],[m(A,.6),.6],[[A[0],A[1]],1],[[Bq[0],Bq[1]],1],[m(A,.6),.6],[[Bq[0],Bq[1]],1],[m(Bq,.6),.6]]){ lp.push(...W(P[0],zl,P[1])); lE.push(eE); }
        const w1=k=>.12+.1*Math.sin(k*1.7+h.ph[0])+.06*Math.sin(k*4.1), hi=k=>Y(2.4+1.6*(.5+.5*Math.sin(k*2.3+h.ph[1])))+dy;
        const ring=(P,k,o,z)=>W(cx(P[0]+P[2]*o),z,P[1]+P[3]*o), I=[ring(A,k,0,zl),ring(Bq,k+1,0,zl)], Mi=[ring(A,k,w1(k),hi(k)),ring(Bq,k+1,w1(k+1),hi(k+1))], O=[ring(A,k,w1(k)+.2,fy+e),ring(Bq,k+1,w1(k+1)+.2,fy+e)];
        const cI=col([96,34,16]), cM=col([52+12*Math.sin(k*3.1)|0,41,36]), cO=col([40,34,30]);
        for(const [P,c] of [[I[0],cI],[I[1],cI],[Mi[1],cM],[I[0],cI],[Mi[1],cM],[Mi[0],cM],[Mi[0],cM],[Mi[1],cM],[O[1],cO],[Mi[0],cM],[O[1],cO],[O[0],cO]]){ kp.push(...P); kc.push(...c); }
        const gw=.8+.25*h.rx, G0=[ring(A,k,-.15,fy+2*e),ring(Bq,k+1,-.15,fy+2*e)], G1=[ring(A,k,gw,fy+2*e),ring(Bq,k+1,gw,fy+2*e)], hot=[.55,.2,.05], z0=[0,0,0];
        for(const [P,c] of [[G0[0],hot],[G0[1],hot],[G1[1],z0],[G0[0],hot],[G1[1],z0],[G1[0],z0]]){ gp.push(...P); gc.push(...c); }
        if(k%5===0)for(let j=0;j<2;j++){ const f=r()*.8; EP.push(...W(h.cx+(A[0]-h.cx)*f,zl,h.cy+(A[1]-h.cy)*f)); ES.push(r()); } }
      MISTU.uP.value[i]&&MISTU.uP.value[i].set(X(h.cx),Z(h.cy),(h.rx+1.6)*TILE);
      // the falls that feed it: out of a crack in the wall or down from the ceiling
      let lz=Y(12)+dy, ly=h.cy, lx=h.cx;
      if(h.src==='wall'){ const w=h.cx<R.cx?'l':'r', fyy=h.cy+h.fo*h.ry*.6, wd=.35+r()*.35, zt=Y(h.fz)+dy, g=quads(); wq(g,w,fyy,zl,wd,zt-zl,-1,.035);
        const fm=FALL().clone(); fm.uniforms.uT=U.uT; fm.clippingPlanes=[PL[WK[w]]]; const me=new THREE.Mesh(geo(g),fm); own(me);
        wq(gq('glowc',w),w,fyy,zt-Y(14),1.6,Y(30),(r()*4)|0,.025); wq(gq('glow',w),w,fyy,zt-Y(12),1.4,Y(24),-1,.03); lx=w==='l'?R.x0+.5:R.x1-.5; ly=fyy; lz=(zt+zl)/2; }
      if(h.src==='ceil'){ const fx=h.cx+(r()-.5)*h.rx*.5, fyy=h.cy+(r()-.5)*h.ry*.5, rr=(.12+r()*.1)*TILE, cy=new THREE.CylinderGeometry(rr*.8,rr*1.3,top-zl,9,1,true), me=new THREE.Mesh(cy,FALL());
        me.position.set(X(fx),(top+zl)/2,Z(fyy)); own(me); const hole=new THREE.Mesh(new THREE.PlaneGeometry(1.6*TILE,1.6*TILE).rotateX(Math.PI/2),mats.glow()); hole.position.set(X(fx),top-.01*TILE,Z(fyy)); own(hole);
        flat(gq('glow'),fx,fyy,zl+2*e,1.3,1.3,0,-1); lx=fx; ly=fyy; lz=zl+Y(40); }
      const Lt=light({x:lx,y:ly,z:(lz-dy)/SHARED.BOD.YS(1),c:[1,.42,.12],r:3.4+h.rx*1.2}); S.lights.push([Lt,Lt.intensity,r()*6]);
      for(let k=0;k<3;k++){ const a=r()*6.283, q=lavaR(h,a)*1.15, d=.5+r()*.7, x=h.cx+Math.cos(a)*(h.rx*q+d), y=h.cy+Math.sin(a)*(h.ry*q+d); if(x>R.x0+.3&&x<R.x1-.3)flat(gq('glowc'),x,y,fy+3*e,1.4+r()*.8,1.4+r()*.8,a,(r()*4)|0); } });
    for(let i=LV.length;i<NP;i++)MISTU.uP.value[i].set(0,0,-1);
    if(lp.length){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new F32(lp,3)); g.setAttribute('aE',new F32(lE,1)); own(new THREE.Mesh(g,LAVA()));
      const k=new THREE.BufferGeometry(); k.setAttribute('position',new F32(kp,3)); k.setAttribute('color',new F32(kc,3)); k.computeVertexNormals(); const km=new THREE.Mesh(k,new THREE.MeshLambertMaterial({vertexColors:true,side:2})); km.receiveShadow=true; own(km);
      const gl=new THREE.BufferGeometry(); gl.setAttribute('position',new F32(gp,3)); gl.setAttribute('color',new F32(gc,3)); const gm=new THREE.Mesh(gl,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:2})); gm.renderOrder=1; own(gm);
      const eg=new THREE.BufferGeometry(); eg.setAttribute('position',new F32(EP,3)); eg.setAttribute('aS',new F32(ES,1)); const pts=new THREE.Points(eg,EMB()); pts.frustumCulled=false; own(pts); }
    for(const [z,a] of [[3,.16],[10,.11],[20,.07]]){ const m=new THREE.Mesh(new THREE.PlaneGeometry(X(B.x1)-X(B.x0),Math.abs(Z(B.y1)-Z(B.y0))).rotateX(-Math.PI/2),MIST(a)); m.position.set((X(B.x0)+X(B.x1))/2,fy+Y(z),(Z(B.y0)+Z(B.y1))/2); m.renderOrder=3; own(m); }   // low mist over the floor
    // cracks, moss and webs; dark edges where the walls meet the floor
    const bad=(x,y,m)=>LV.some(h=>x>h.x0-m&&x<h.x1+m&&y>h.y0-m&&y<h.y1+m);
    for(let k=0;k<14+2*n;k++){ const x=R.x0+.6+r()*(R.x1-R.x0-1.2), y=R.y0+3+r()*(R.y1-R.y0-6); if(!bad(x,y,.4))flat(gq('crack'),x,y,fy+e,1.2+r(),1.2+r(),r()*6.3,(r()*4)|0); }
    for(let k=0;k<6;k++){ const w='lrlrbf'[k], u=w==='l'||w==='r'?R.y0+3+r()*(R.y1-R.y0-6):R.x0+2+r()*(R.x1-R.x0-4); wq(gq('crack',w),w,u,fy+Y(10+r()*60),1.4+r(),Y(30+r()*30),(r()*4)|0,.02); }
    for(let k=0;k<16+2*n;k++){ const w='lrlrbf'[k%6], side=w==='l'||w==='r', u=side?R.y0+2+r()*(R.y1-R.y0-4):R.x0+1+r()*(R.x1-R.x0-2), o=.15+r()*.9;
      const [x,y]=w==='l'?[R.x0+o,u]:w==='r'?[R.x1-o,u]:w==='b'?[u,R.y0+o]:[u,R.y1-o]; if(bad(x,y,1.2))continue;
      flat(gq('moss'),x,y,fy+2*e,.7+r()*.9,.6+r()*.7,r()*6.3,(r()*4)|0); if(r()<.6)wq(gq('moss',w),w,u+(r()-.5)*.6,fy,.6+r()*.8,Y(8+r()*20),(r()*4)|0,.03); }
    for(const [x,y,a] of [[R.x0,R.y0,.785],[R.x1,R.y0,2.356],[R.x1,R.y1,-2.356],[R.x0,R.y1,-.785]]){ const s=1.2+r()*.5, c=Math.cos(a)*s*.5, sn=Math.sin(a)*s*.5, x0=x+c-sn*1, y0=y+sn+c*1, x1=x+c+sn, y1=y+sn-c;   // across each corner, floor up
      put(gq('web'),W(x0,fy,y0),W(x1,fy,y1),W(x1,fy+Y(46),y1),W(x0,fy+Y(46),y0),-1); }
    for(let k=0;k<7+n;k++){ const w=k&1?'l':'r', u=R.y0+3+r()*(R.y1-R.y0-6), wd=1+r()*.6, o=.8+r()*.4, hi=r()<.5, zt=hi?top:fy+Y(34+r()*20), zb=hi?top-Y(26):fy+e*3, ins=w==='l'?1:-1, wx=w==='l'?R.x0:R.x1;
      if(!hi&&bad(wx+ins*o,u,.4))continue;   // stretched from the wall down to the floor, or from the wall up into the ceiling
      const a=hi?[wx,top-Y(30)]:[wx,zt], b=hi?[wx+ins*o,top-e]:[wx+ins*o,zb], gg=gq(hi?'webhi':'web',w); put(gg,W(a[0],a[1],u-wd/2),W(a[0],a[1],u+wd/2),W(b[0],b[1],u+wd/2),W(b[0],b[1],u-wd/2),-1); }
    for(const w of 'lrbf'){ const side=w==='l'||w==='r', a0=side?R.y0:R.x0, a1=side?R.y1:R.x1, d=.9, g=gq('ao');   // contact shade on the floor along the wall, and up its foot
      const P=w==='l'?[[R.x0,a0],[R.x0+d,a0],[R.x0+d,a1],[R.x0,a1]]:w==='r'?[[R.x1,a1],[R.x1-d,a1],[R.x1-d,a0],[R.x1,a0]]:w==='b'?[[a1,R.y0],[a1,R.y0+d],[a0,R.y0+d],[a0,R.y0]]:[[a0,R.y1],[a0,R.y1-d],[a1,R.y1-d],[a1,R.y1]];
      put(g,...P.map(([x,y])=>W(x,fy+e*.5,y)),-1); const gw=gq('ao',w), z1=Y(30)+dy; put(gw,wpt(w,a0,fy,.012),wpt(w,a0,z1,.012),wpt(w,a1,z1,.012),wpt(w,a1,fy,.012),-1); }
    if(L.camp){ const {x,y}=L.camp; flat(gq('crack'),x,y,fy+2*e,.9,.9,r()*6,(r()*4)|0); }
    for(const k in G){ const [kind,w]=k.split('|'), g=G[k]; if(!g.p.length)continue; const m=(mats[kind]||mats.web)(); if(w)m.clippingPlanes=[PL[WK[w]]]; const me=new THREE.Mesh(geo(g),m); me.renderOrder=kind==='ao'?0:2; own(me); if(kind==='webhi')S.up.push(me); }
    // stalactites from the ceiling and rubble on the floor
    { const NS=22+4*n, cg=new THREE.ConeGeometry(1,1,5,1,true).rotateX(Math.PI).translate(0,-.5,0), IM=new THREE.InstancedMesh(cg,new THREE.MeshLambertMaterial({color:0x4a423c,flatShading:true}),NS), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), s=new THREE.Vector3(), v=new THREE.Vector3();
      for(let i=0;i<NS;i++){ const big=r()<.25, rr=(big?.16:.06)+r()*.08, len=(big?.5:.18)+r()*.4; IM.setMatrixAt(i,m4.compose(v.set(X(R.x0+.4+r()*(R.x1-R.x0-.8)),top+.02*TILE,Z(R.y0+.4+r()*(R.y1-R.y0-.8))),q.setFromAxisAngle(v3y,r()*6),s.set(rr*TILE,len*TILE,rr*TILE))); }
      IM.castShadow=true; own(IM); S.up.push(IM);
      const NR=40+6*n, RG=new THREE.DodecahedronGeometry(1,0), RI=new THREE.InstancedMesh(RG,new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),NR);
      for(let i=0;i<NR;i++){ let x, y; const t=r(); if(t<.45&&LV.length){ const h=LV[(r()*LV.length)|0], a=r()*6.283, qq=lavaR(h,a)*1.12+.15+r()*.3; x=cx(h.cx+Math.cos(a)*h.rx*qq); y=h.cy+Math.sin(a)*h.ry*qq; }
        else { const w=r()<.5; x=w?R.x0+.1+r()*.6:R.x1-.1-r()*.6; y=R.y0+1+r()*(R.y1-R.y0-2); }
        const sc=(.03+r()*.07)*TILE; RI.setMatrixAt(i,m4.compose(v.set(X(x),fy+sc*.3,Z(y)),q.setFromAxisAngle(v3y,r()*6),s.set(sc,sc*(.5+r()*.4),sc*(.8+r()*.4)))); RI.setColorAt(i,c3.setRGB(...col([62+r()*30|0,56+r()*24|0,50+r()*20|0]))); }
      RI.receiveShadow=true; own(RI); }
    if(L.camp){ const {x,y}=L.camp, g=quads(), cS=[col([70,66,62]),col([54,50,48])];   // a cold fire: a stone ring, ash, charred logs
      const blk=(x0,y0,z0,x1,y1,z1,c)=>{ const a=X(x0),b=X(x1),c0=Z(y0),d=Z(y1),e0=Y(z0)+dy,f=Y(z1)+dy; for(const Q of [[[a,f,d],[b,f,d],[b,f,c0],[a,f,c0]],[[a,e0,d],[b,e0,d],[b,f,d],[a,f,d]],[[b,e0,c0],[a,e0,c0],[a,f,c0],[b,f,c0]],[[a,e0,c0],[a,e0,d],[a,f,d],[a,f,c0]],[[b,e0,d],[b,e0,c0],[b,f,c0],[b,f,d]]])put(g,...Q,-1,c); };
      for(let k=0;k<9;k++){ const a=k/9*6.283, sx=x+Math.cos(a)*.42, sy=y+Math.sin(a)*.42; blk(sx-.07,sy-.06,0,sx+.07,sy+.06,2.6+r()*1.4,cS[k&1]); }
      blk(x-.25,y-.04,0,x+.22,y+.04,1.8,col([30,24,20])); blk(x-.05,y-.24,0,x+.04,y+.2,2.6,col([24,20,18])); blk(x-.2,y+.06,0,x+.16,y+.12,1.4,col([36,28,22]));
      const me=new THREE.Mesh(geo(g),new THREE.MeshLambertMaterial({vertexColors:true})); me.castShadow=true; me.receiveShadow=true; own(me);
      const ash=new THREE.Mesh(new THREE.CircleGeometry(.36*TILE,10).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({color:0x3a3633})); ash.position.set(X(x),fy+e,Z(y)); own(ash); } };
  const v3y=new THREE.Vector3(0,1,0);
  SYS.add('life',()=>{ const D=MODS.dungeon, on=!!(D&&D.level&&SHARED.LVL==='down');
    if(!on){ if(scene.fog===DF)scene.fog=null; return; }
    const t=performance.now()/1000; U.uT.value=t;
    for(const [L,i0,ph] of S.lights)L.intensity=i0*(.8+.12*Math.sin(t*1.7+ph)+.08*Math.sin(t*4.3+ph*2));
    const cam=SHARED.cam, above=cam.position.y>Y(D.B.h)+dy; for(const o of S.up)o.visible=!above;   // what hangs from the ceiling is gone from above, as the ceiling is
    const d=Math.max(0,-V3.copy(pos).applyMatrix4(cam.matrixWorldInverse).z); DF.near=d+3*TILE; DF.far=d+26*TILE; scene.fog=DF; },'062b-dunlook');
  MODS.dunLook={props,dress}; }
