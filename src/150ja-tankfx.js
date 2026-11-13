// THE FISH TANK'S LOOK: TANKFX makes the tank's sand, stones, wood, plants, glass and water as a real tank's (owner, 12 Nov 2026); 150k builds the tank from it.
import {THREE} from './003-shx.js';
const TANKFX={NX:96,NZ:56,kit:null};
TANKFX.make=()=>{ '@apts'; const V3=THREE.Vector3, cc=new THREE.Color();
  const lin=c=>{ cc.setRGB(c[0]/255,c[1]/255,c[2]/255,THREE.SRGBColorSpace); return [cc.r,cc.g,cc.b]; }, mix3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t], cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const h3=(x,y,z)=>{ const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return s-Math.floor(s); };
  const vn=(x,y,z)=>{ const xi=Math.floor(x), yi=Math.floor(y), zi=Math.floor(z), s=t=>t*t*(3-2*t), a=s(x-xi), b=s(y-yi), c=s(z-zi), L=(p,q,t)=>p+(q-p)*t;
    return L(L(L(h3(xi,yi,zi),h3(xi+1,yi,zi),a),L(h3(xi,yi+1,zi),h3(xi+1,yi+1,zi),a),b),L(L(h3(xi,yi,zi+1),h3(xi+1,yi,zi+1),a),L(h3(xi,yi+1,zi+1),h3(xi+1,yi+1,zi+1),a),b),c); };
  const fbm=(x,y,z,o=4)=>{ let a=.5, f=1, s=0; for(let i=0;i<o;i++){ s+=a*vn(x*f,y*f,z*f); a*=.5; f*=2.03; } return s; };
  // one mesh being put together: positions, normals, colours, how far each point bends in the current
  const mesh=()=>{ const P=[], N=[], C=[], S=[], I=[]; return {P,N,C,S,I,v(x,y,z,nx,ny,nz,c,s0=0,s1=0){ P.push(x,y,z); N.push(nx,ny,nz); C.push(c[0],c[1],c[2]); S.push(s0,s1); return P.length/3-1; },
    geo(sway){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); if(sway)g.setAttribute('aSway',new THREE.Float32BufferAttribute(S,2)); g.setIndex(I); return g; }}; };

  /* ---------- the shaders' shared parts ---------- */
  const GN=`float th(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
float tn(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f); return mix(mix(mix(th(i),th(i+vec3(1,0,0)),f.x),mix(th(i+vec3(0,1,0)),th(i+vec3(1,1,0)),f.x),f.y),mix(mix(th(i+vec3(0,0,1)),th(i+vec3(1,0,1)),f.x),mix(th(i+vec3(0,1,1)),th(i+vec3(1,1,1)),f.x),f.y),f.z); }
float tcaus(vec2 v,float uT){ vec2 p=mod(v*8.8,6.2832)-250., q=p; float c=1.; for(int n=0;n<3;n++){ float t=uT*.55*(1.-3.5/float(n+1)); q=p+vec2(cos(t-q.x)+sin(t+q.y),sin(t-q.y)+cos(t+q.x)); c+=1./length(vec2(p.x/(sin(q.x+t)/.006),p.y/(cos(q.y+t)/.006))); } c=1.17-pow(c/3.,1.4); return min(pow(abs(c),7.),2.); }
float tlen(vec3 ro,vec3 p,vec3 b0,vec3 b1){ vec3 rd=p-ro; float L=length(rd); rd/=max(L,1e-5); rd=mix(rd,vec3(1e-5),lessThan(abs(rd),vec3(1e-5))); vec3 t0=(b0-ro)/rd, t1=(b1-ro)/rd, a=min(t0,t1), b=max(t0,t1); return max(0.,min(L,min(min(b.x,b.y),b.z))-max(max(max(a.x,a.y),a.z),0.)); }
`;
  const UD='uniform float uT,uK,uE,uFog,uAmb,uTop; uniform vec3 uL,uWC,uAb,uCam,uB0,uB1,uBar; uniform sampler2D uF; uniform vec2 uWD;\n';
  const END='\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}';
  // every tank its own: the time, the light, the water's colour and haze, where the eye is (all in the tank's own metres)
  const uniforms=()=>({uT:{value:0},uL:{value:new THREE.Color(1,1,1)},uK:{value:1},uE:{value:0},uF:{value:null},uWD:{value:new THREE.Vector2(1,1)},uTI:{value:new THREE.Matrix4()},uCam:{value:new V3()},uB0:{value:new V3()},uB1:{value:new V3()},
    uWC:{value:new THREE.Color(.3,.6,.7)},uAb:{value:new V3(.5,.2,.1)},uFog:{value:.5},uAmb:{value:.2},uTop:{value:1},uBar:{value:new V3()}});
  // a thing under the water: lit from above by the tank's light (dimmer and bluer with depth), the surface's caustics running over it, hazed by the water between it and the eye
  const GRAIN=['',`{ vec2 q=vTp.xz*650.; float fw=max(fwidth(q.x),fwidth(q.y)), h=th(vec3(floor(q),1.)), g=mix(h,.5,clamp(fw*1.6,0.,1.));
  diffuseColor.rgb*=(.74+.5*g)*(.84+.22*tn(vec3(vTp.xz*11.,3.))+.1*tn(vec3(vTp.xz*37.,7.))); diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.4,.36,.33),step(.93,h)*(1.-clamp(fw*2.,0.,1.)));
  diffuseColor.rgb*=mix(1.,.62+.3*tn(vec3(vTp.x*3.,vTp.y*90.,1.)),step(abs(normalize(vTn).y),.5)); }`,
    '{ diffuseColor.rgb*=.76+.32*tn(vTp*46.)+.16*tn(vTp*150.); }','{ diffuseColor.rgb*=.86+.28*tn(vTp*120.); }'];
  const SWAY=`{ float k=aSway.y, k2=k*k, gx=sin(uT*.6+aSway.x)+.5*sin(uT*1.7+aSway.x*2.3+position.x*3.), gz=sin(uT*.45+aSway.x*1.7);
  transformed.x+=k2*(.085*gx+.05); transformed.z+=k2*.045*gz; float ov=max(0.,transformed.y-uTop); transformed.y-=ov*.97; transformed.x+=ov*.85;
  transformed.x=clamp(transformed.x,-uWD.x*.5+.012,uWD.x*.5-.012); transformed.z=clamp(transformed.z,-uWD.y*.5+.012,uWD.y*.5-.012); }`;
  const wet=(m,U,o={})=>{ const prev=m.onBeforeCompile, pk=m.customProgramCacheKey?m.customProgramCacheKey():'';
    m.onBeforeCompile=(sh,r)=>{ if(prev)prev(sh,r); Object.assign(sh.uniforms,U);
      sh.vertexShader='uniform mat4 uTI; uniform float uT,uTop; uniform vec2 uWD; varying vec3 vTp,vTn;\n'+(o.sway?'attribute vec2 aSway;\n':'')+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n'+(o.sway?SWAY:'')).replace('#include <project_vertex>',`#include <project_vertex>
{ vec4 wp=vec4(transformed,1.); vec3 on=objectNormal;
#ifdef USE_INSTANCING
wp=instanceMatrix*wp; on=mat3(instanceMatrix)*on;
#endif
vTp=(uTI*(modelMatrix*wp)).xyz; vTn=mat3(uTI)*(mat3(modelMatrix)*on); }`);
      sh.fragmentShader=UD+'varying vec3 vTp,vTn;\n'+GN+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+GRAIN[o.grain||0]+'\nvec3 tAlb=diffuseColor.rgb; diffuseColor.rgb*=.3;').replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
{ vec3 tnn=normalize(vTn); float H=uB1.y-uB0.y, dep=clamp((uB1.y-vTp.y)/H,0.,1.), inw=step(vTp.y,uB1.y+.003), f=texture2D(uF,vTp.xz/uWD+.5).r*2.-1.;
  float ca=tcaus(vTp.xz+vTp.y*.2,uT)*(.6+.6*uE)+max(f,0.)*1.3, up=${o.trans?'.45+.5*abs(tnn.y)':'clamp(tnn.y*.62+.46,0.,1.)'};
  totalEmissiveRadiance+=tAlb*uL*uK*exp(-uAb*dep*H)*(up*${(o.gain||.58).toFixed(2)}+ca*${o.trans?'.5':'max(tnn.y,0.)'}*1.5*inw); }`)
        .replace('#include <tonemapping_fragment>',`{ float ln=tlen(uCam,vTp,uB0,uB1)${o.far?'+'+o.far.toFixed(2):''}; gl_FragColor.rgb=mix(gl_FragColor.rgb,uWC*(uL*uK*.34+uAmb*.5),1.-exp(-ln*uFog)); }
#include <tonemapping_fragment>`); };
    m.customProgramCacheKey=()=>'tankwet'+(o.grain||0)+(o.sway?1:0)+(o.trans?1:0)+(o.far||0)+(o.gain||0)+pk; return m; };

  /* ---------- the bed ---------- */
  // the sand's top: banked up toward the back, low dunes, fine ripples
  const sandY=(SH,SD)=>(x,z)=>{ const t=cl((z+SD/2)/SD); return SH+.1+.11*t*t+.045*(fbm(x*2.1+5,0,z*2.1,3)-.5)+.0035*Math.sin(x*36+z*9+5*vn(x*3,z*3,1))*(1-t*.6); };
  const sand=(SW,SD,SH,sY,U,col)=>{ const g=new THREE.BoxGeometry(SW,.08,SD,Math.round(SW*60),1,Math.round(SD*52)), p=g.attributes.position; for(let i=0;i<p.count;i++)if(p.getY(i)>0)p.setY(i,sY(p.getX(i),p.getZ(i))-SH-.04); g.computeVertexNormals();
    return [g,wet(new THREE.MeshStandardMaterial({color:new THREE.Color(...col),roughness:1}),U,{grain:1,gain:.4})]; };
  // a stone: a ball pushed out into lumps and sharp ridges, its own normals; veined, dark in its hollows, green where it looks up
  const rock=(M,cx,cy,cz,r,sc,rot,seed,pal,det,moss=0)=>{ const g=new THREE.IcosahedronGeometry(1,det), p=g.attributes.position, q=new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0],rot[1],rot[2])), d=new V3(), a=new V3(), b=new V3(), t1=new V3(), t2=new V3(), u=new V3(), w=new V3(), nn=new V3(), b0=M.P.length/3, rg=det>1?1:.35;
    const R=v=>1+rg*(.55*(fbm(v.x*1.3+seed,v.y*1.3,v.z*1.3,4)-.5)+.2*(1-Math.abs(2*vn(v.x*2.3+seed*3,v.y*2.3,v.z*2.3)-1))**2), Pt=(v,o)=>{ const k=R(v); return o.set(v.x*k*sc[0],v.y*k*sc[1],v.z*k*sc[2]); };
    for(let i=0;i<p.count;i++){ d.fromBufferAttribute(p,i).normalize(); Pt(d,a); t1.set(-d.z,0,d.x); if(t1.lengthSq()<1e-4)t1.set(1,0,0); t1.normalize(); t2.crossVectors(d,t1);
      u.copy(Pt(b.copy(d).addScaledVector(t1,.04).normalize(),nn)).sub(a); w.copy(Pt(b.copy(d).addScaledVector(t2,.04).normalize(),nn)).sub(a); nn.crossVectors(u,w).normalize(); if(nn.dot(d)<0)nn.negate();
      a.multiplyScalar(r).applyQuaternion(q); nn.applyQuaternion(q); const k=R(d), f=fbm(d.x*2+seed,d.y*2,d.z*2,3), vein=1-Math.abs(2*vn(d.x*3.1+seed,d.y*5.3,d.z*3.1)-1);
      let c=mix3(pal[0],pal[1],cl(f*1.6-.3)); c=mix3(c,pal[2],cl((vein-.9)*9)*.8); const sh=cl(.62+(k-1)*1.3,det>1?.35:.9,1.15); c=[c[0]*sh,c[1]*sh,c[2]*sh]; if(moss)c=mix3(c,[.03,.13,.04],cl((nn.y-.35)*1.6)*moss*(.4+.6*vn(d.x*4,d.y*4,d.z*4+seed)));
      M.v(a.x+cx,a.y+cy,a.z+cz,nn.x,nn.y,nn.z,c); }
    for(let i=0;i<p.count;i++)M.I.push(b0+i); };
  // a limb of driftwood: a tube along a curve, thinning, knotted and grooved, streaked along its length
  const limb=(M,pts,r0,r1,seed,pal)=>{ const cv=new THREE.CatmullRomCurve3(pts.map(p=>new V3(p[0],p[1],p[2]))), n=Math.max(8,Math.round(cv.getLength()/.03)), RS=10, fr=cv.computeFrenetFrames(n,false), b0=M.P.length/3;
    for(let i=0;i<=n;i++){ const t=i/n, c=cv.getPointAt(t), N=fr.normals[i], B=fr.binormals[i], rr=(r0+(r1-r0)*t)*(1+.5*(fbm(t*7+seed,seed,0,3)-.5));
      for(let j=0;j<=RS;j++){ const a=j/RS*6.2832, ca=Math.cos(a), sa=Math.sin(a), k=1+.34*(vn(ca*1.4+seed,sa*1.4,t*12)-.5)+.1*Math.sin(a*5+t*17+seed), nx=N.x*ca+B.x*sa, ny=N.y*ca+B.y*sa, nz=N.z*ca+B.z*sa, s=vn(ca*2.2+seed,sa*2.2,t*2.5), sh=cl(.55+(k-1)*2.2+.35*s,.3,1.15), col=mix3(pal[0],pal[1],s);
        M.v(c.x+nx*rr*k,c.y+ny*rr*k,c.z+nz*rr*k,nx,ny,nz,[col[0]*sh,col[1]*sh,col[2]*sh]); } }
    for(let i=0;i<n;i++)for(let j=0;j<RS;j++){ const a=b0+i*(RS+1)+j, b=a+RS+1; M.I.push(a,a+1,b,a+1,b+1,b); } return cv; };
  // a leaf: a strip from its root, arching over as it goes, folded along its midrib, three points across
  const leaf=(M,x,y,z,yaw,pitch,len,wid,curl,col,rib,ph,fx0,stiff,seg,shape)=>{ const b0=M.P.length/3, sy=Math.sin(yaw), cy=Math.cos(yaw); let px=x, py=y, pz=z;
    for(let k=0;k<=seg;k++){ const t=k/seg, pt=pitch-curl*t*t, cp=Math.cos(pt), sp=Math.sin(pt), ux=-sp*cy, uy=cp, uz=sp*sy, w=wid/2*(shape?Math.pow(Math.sin(Math.PI*(t*.9+.08)),.75):1-t*.82), sh=.5+.5*t, fl=fx0+t*len*stiff;
      for(const s of [-1,0,1]){ const f=s?w*.3:0, nx=ux-s*sy*.45, nz=uz-s*cy*.45, nl=Math.hypot(nx,uy,nz), c=s?col:rib; M.v(px+sy*w*s+ux*f,py+uy*f,pz+cy*w*s+uz*f,nx/nl,uy/nl,nz/nl,[c[0]*sh,c[1]*sh,c[2]*sh],ph,fl); }
      px+=cp*cy*len/seg; py+=sp*len/seg; pz-=cp*sy*len/seg; }
    for(let k=0;k<seg;k++)for(let j=0;j<2;j++){ const a=b0+k*3+j, b=a+3; M.I.push(a,a+1,b,a+1,b+1,b); } };
  // everything on the sand of a planted tank, laid out as an aquascaper would: the stones a third of the way along, the wood arching over the middle, tall plants behind, bushes between, a carpet in front
  const bed=(SW,SD,SH,WY,sY,U)=>{ const o={}, R=(i,k)=>h3(i*1.37+.11,k*2.71+.3,.5);
    { const M=mesh(), grey=[lin([104,108,116]),lin([62,66,76]),lin([214,214,206])], river=[[lin([176,160,138]),lin([138,124,108]),lin([216,204,180])],[lin([150,148,150]),lin([112,112,120]),lin([200,198,190])],[lin([190,164,128]),lin([150,124,96]),lin([226,212,186])],[lin([164,156,150]),lin([124,120,122]),lin([206,200,190])]];
      const RX=-SW*.27, RZ=SD*.08; for(const [dx,dz,r,sc,rot,det] of [[0,0,.2,[.8,1.5,.7],[.1,.4,.24],6],[.25,-.1,.12,[1,1.15,.8],[.2,1.3,-.3],5],[-.21,-.14,.1,[1.1,.9,.8],[0,2.2,.15],5],[.1,-.27,.06,[1.1,.7,.9],[0,.6,0],3],[-.34,.03,.05,[1,.7,.9],[.2,3,.3],3],[.42,.08,.045,[1.2,.6,.9],[0,1,0],3]]){ const x=RX+dx, z=RZ+dz; rock(M,x,sY(x,z)+r*sc[1]*.42,z,r,sc,rot,dx*7+dz*13+3,grey,det,.75); }
      for(let i=0;i<170;i++){ const big=i<40, x=(R(i,1)-.5)*(SW-.07), z=-SD/2+.035+R(i,2)**(big?1.6:2.4)*(SD-.09), r=big?.014+R(i,3)*.016:.006+R(i,3)*.008; rock(M,x,sY(x,z)+r*.22,z,r,[1,.55+R(i,6)*.25,.75+R(i,7)*.3],[R(i,4)*.5,R(i,5)*6.28,R(i,8)*.5],i*1.7,river[i%4],big?1:0); }
      o.pebbles=[M.geo(),wet(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9}),U,{grain:2})]; }
    { const M=mesh(), bark=[lin([122,86,56]),lin([58,38,26])], x0=SW*.24, z0=SD*.1, y0=sY(x0,z0)-.03, A=(dx,dy,dz)=>[x0+dx,y0+dy,z0+dz];
      const trunk=limb(M,[A(.1,0,.04),A(0,.1,0),A(-.2,.3,-.03),A(-.45,.44,.02),A(-.72,.5,.05),A(-.95,.62,.02)],.06,.012,1.3,bark);
      limb(M,[A(-.18,.28,-.03),A(-.25,.46,-.12),A(-.2,.64,-.2),A(-.28,.8,-.24)],.026,.006,4.1,bark); limb(M,[A(-.42,.43,.02),A(-.5,.56,.12),A(-.62,.7,.16)],.022,.005,7.7,bark);
      limb(M,[A(.02,.08,0),A(.16,.16,.1),A(.3,.14,.2),A(.42,.03,.26)],.034,.01,2.9,bark); limb(M,[A(-.7,.5,.05),A(-.76,.38,.12),A(-.86,.3,.14)],.016,.004,5.5,bark); limb(M,[A(-.05,.14,-.01),A(-.1,.06,-.16),A(-.22,-.01,-.26)],.03,.008,9.2,bark);
      o.driftwood=[M.geo(),wet(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85}),U,{grain:2})]; o.perch=[.2,.34,.5,.66].map(t=>trunk.getPointAt(t)); o.anch=[[-SW*.27,SD*.08],[x0-.4,z0],[-.44*SW,SD*.3],[.3*SW,SD*.3]]; }
    { const M=mesh(), G=[lin([44,128,62]),lin([72,150,60]),lin([30,98,54]),lin([112,164,58]),lin([150,56,50]),lin([24,84,44])], RB=[lin([150,196,96]),lin([196,112,84])], back=SD/2-.05; let n=0; const r=k=>R(n,k);
      // ribbon grass to the surface and over it, in clumps along the back
      for(const [cx,nb,ci] of [[-.45,11,0],[-.33,7,1],[.12,6,2],[.33,8,0],[.46,11,1]])for(let i=0;i<nb;i++,n++){ const x=cx*SW+(r(11)-.5)*.2, z=back-r(12)*.16; leaf(M,x,sY(x,z)-.01,z,r(15)*6.28,1.5-r(16)*.12,(WY-SH)*(.55+r(13)*.75),.016+r(14)*.012,.12,G[ci],RB[0],r(17)*6.28,0,.8,12,0); }
      // stem plants: a stem with pairs of leaves, each pair turned from the last; one bunch red at its tips
      for(const [cx,cz,ns,hh,red] of [[-.12,.3,7,.5,0],[.22,.34,6,.62,1],[-.4,.12,5,.36,0],[.42,.1,5,.4,1]])for(let i=0;i<ns;i++,n++){ const x=cx*SW+(r(21)-.5)*.14, z=cz*SD+(r(22)-.5)*.12, y=sY(x,z)-.01, h=hh*(.7+r(23)*.45), ph=r(24)*6.28, nodes=Math.round(h/.035); leaf(M,x,y,z,r(25)*6,1.52,h,.006,.05,G[2],G[2],ph,0,.75,8,0);
          for(let k=1;k<=nodes;k++){ const t=k/nodes, c=red?mix3(G[1],G[4],t*t):G[k%2], ya=k*1.57+r(26)*6; for(const s of [0,3.1416])leaf(M,x,y+t*h,z,ya+s,.45,.03+.03*Math.sin(t*2.6),.014,.5,c,red?RB[1]:RB[0],ph,t*h*.75,.2,3,1); } }
      // broad rosettes in the middle ground
      for(const [cx,cz,nl,L] of [[-.03,.14,13,.34],[.36,-.04,10,.24],[-.42,-.1,9,.2]]){ const x=cx*SW, z=cz*SD, y=sY(x,z)-.01; for(let i=0;i<nl;i++,n++)leaf(M,x+(r(31)-.5)*.02,y,z+(r(32)-.5)*.02,i/nl*6.28+r(33)*.5,1.25-r(34)*.5,L*(.65+r(35)*.5),.05+r(36)*.02,.9+r(37)*.5,G[i%2],RB[0],r(38)*6.28,0,.5,8,1); }
      // dark broad leaves tied along the wood
      for(const p of o.perch||[])for(let i=0;i<4;i++,n++)leaf(M,p.x+(r(41)-.5)*.04,p.y+.02,p.z+(r(42)-.5)*.04,r(43)*6.28,.9-r(44)*.5,.07+r(45)*.05,.045,.7,G[5],G[0],r(46)*6.28,0,.25,5,1);
      // the carpet: fine grass in tufts over the front, thinning toward the stones
      for(let i=0;i<620;i++,n++){ const x=(r(51)-.5)*(SW-.06), z=-SD/2+.03+r(52)*SD*.42; if(vn(x*4,z*4,3)<.36)continue; leaf(M,x,sY(x,z)-.004,z,r(53)*6.28,1.5-r(54)*.5,.03+r(55)*.045,.0045,.3,G[3],G[1],r(56)*6.28,0,.5,2,0); }
      const m=wet(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.7,side:THREE.DoubleSide}),U,{sway:1,trans:1,grain:3}); o.plants=[M.geo(1),m]; }
    return o; };

  /* ---------- the water and the glass ---------- */
  const VS='varying vec3 vP,vN; uniform float uOff; void main(){ vP=position+vec3(0.,uOff,0.); vN=normal; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }';
  const sm=(U,fs,o={})=>new THREE.ShaderMaterial({uniforms:{...U,uOff:{value:o.off||0}},vertexShader:o.vs||VS,fragmentShader:UD+'varying vec3 vP,vN;\n'+GN+fs+END,transparent:true,depthWrite:false,side:o.side??THREE.DoubleSide,blending:o.add?THREE.AdditiveBlending:THREE.NormalBlending});
  // the light in the water: shafts slanting down from the light bar and motes drifting in them, on sheets through the tank's depth
  const rays=(SW,SD,SH,WY,U)=>{ const M=mesh(), K=6; for(let i=0;i<K;i++){ const z=-SD/2+(i+.5)*SD/K, b=M.P.length/3, w=SW/2-.004; M.v(-w,SH+.05,z,0,0,-1,[1,1,1]); M.v(w,SH+.05,z,0,0,-1,[1,1,1]); M.v(w,WY,z,0,0,-1,[1,1,1]); M.v(-w,WY,z,0,0,-1,[1,1,1]); M.I.push(b,b+1,b+2,b,b+2,b+3); }
    return [M.geo(),sm(U,`void main(){ float H=uB1.y-uB0.y, dep=clamp((uB1.y-vP.y)/H,0.,1.), sl=vP.z*7.3, x=vP.x+(uB1.y-vP.y)*.2;
  float r=tn(vec3(x*6.,uT*.1+sl,sl))*tn(vec3(x*15.+3.,uT*.17,sl*2.)); r=smoothstep(.2,.55,r)*pow(1.-dep,1.4)*smoothstep(0.,.04,dep);
  vec2 g=(vP.xy+vec2(uT*.007,uT*.0025*sin(sl)))*24., id=floor(g), f=fract(g)-.5; float h=th(vec3(id,sl)); vec2 o=(vec2(th(vec3(id,sl+1.)),th(vec3(id,sl+2.)))-.5)*.6+.12*vec2(sin(uT*.5+h*6.),cos(uT*.4+h*9.));
  float m=(1.-smoothstep(0.,.05,length(f-o)))*step(.7,h)*(.4+.6*(1.-dep));
  gl_FragColor=vec4(uL*uK*mix(vec3(1.),uWC*1.5,.5)*(r*.085+m*.38),1.);`,{add:1})]; };
  // the surface: seen from above it mirrors the room and the light bar; from under it is a mirror (all light turned back) but for the window straight up
  const surface=(SW,SD,WY,U)=>{ const NX=TANKFX.NX, NZ=TANKFX.NZ, g=new THREE.PlaneGeometry(SW,SD,NX-1,NZ-1); g.rotateX(-Math.PI/2); g.attributes.position.setUsage(THREE.DynamicDrawUsage); g.attributes.normal.setUsage(THREE.DynamicDrawUsage);
    return [g,sm(U,`void main(){ vec3 n=normalize(vN), v=normalize(uCam-vP); float under=step(v.y,0.); n*=1.-2.*under; float ndv=clamp(dot(n,v),0.,1.), F=.02+.98*pow(1.-ndv,5.); vec3 r=reflect(-v,n);
  float tb=(uBar.y-vP.y)/max(r.y,1e-3), gl=(1.-smoothstep(.03,.09,abs(vP.z+r.z*tb-uBar.z)))*step(abs(vP.x+r.x*tb),uBar.x)*step(0.,r.y);
  vec3 top=uL*uK*gl*2.4+vec3(uAmb)*F*.9+uWC*uL*uK*.06; float at=clamp(F*.75+gl+.06,0.,1.);
  float win=smoothstep(.6,.74,ndv), sh=1.+dot(vN.xz,vec2(9.,7.)); vec3 mir=uWC*(uL*uK*.62+uAmb)*clamp(sh,.4,2.2), lit=uL*uK*(.5+.6*win)+uWC*.2;
  vec3 bot=mix(mir,lit,win); float ab=mix(.93,.5,win);
  gl_FragColor=vec4(mix(top,bot,under),mix(at,ab,under));`,{off:WY})]; };
  // the glass: clear face on, a mirror at a glancing look; its cut edges green; a bright line where the water meets it
  const glass=(geo,U)=>[geo,sm(U,`void main(){ vec3 n=normalize(vN), v=normalize(uCam-vP); float d=dot(n,v), F=.03+.97*pow(1.-abs(d),5.); vec3 r=reflect(-v,n*sign(d)); float sk=.5+.5*r.y;
  vec3 col=mix(vec3(.05,.045,.04),vec3(.62,.6,.56),sk*sk)*uAmb*3.; float a=F*.5+.025;
  if(abs(n.y)>.5){ col=vec3(.3,.62,.5)*(uAmb*2.2+uL*uK*.35); a=.8; }
  float ml=(1.-smoothstep(.001,.007,abs(vP.y-uB1.y)))*step(abs(n.y),.5); col+=(uL*uK*.6+uAmb)*ml; a=max(a,ml*.6);
  gl_FragColor=vec4(col,a);`)];
  // a bubble: clear in its middle, bright round its rim and on top
  const bubble=U=>sm(U,`void main(){ float f=1.-abs(dot(normalize(vN),normalize(vP))); gl_FragColor=vec4(mix(uWC,vec3(1.),.7)*(uL*uK*.8+.3)*(.5+f+.7*smoothstep(.5,.9,normalize(vN).y)),.1+.85*pow(f,2.2));`,
    {side:THREE.FrontSide,vs:'varying vec3 vP,vN; void main(){ vec4 mv=modelViewMatrix*instanceMatrix*vec4(position,1.); vN=normalize(normalMatrix*mat3(instanceMatrix)*normal); vP=-mv.xyz; gl_Position=projectionMatrix*mv; }'});
  // the light the tank throws on the floor before it: the same moving caustics, faint
  const spill=(TW,TD,U)=>{ const g=new THREE.PlaneGeometry(TW+1.6,1.7); g.rotateX(-Math.PI/2); g.translate(0,0,-TD/2-.85);
    const m=sm(U,`void main(){ vec2 q=vec2(vP.x/(uWD.x*.5+.8),(vP.z+uWD.y*.5)/1.7); float fall=clamp(1.-abs(q.x),0.,1.)*clamp(1.+q.y,0.,1.)*smoothstep(0.,.08,-q.y); fall*=fall;
  gl_FragColor=vec4(uL*uK*mix(vec3(1.),uWC*1.4,.6)*fall*(.05+.5*tcaus(vP.xz*.45,uT*.7)),1.);`,{add:1,side:THREE.FrontSide}); m.polygonOffset=true; m.polygonOffsetFactor=-2; m.polygonOffsetUnits=-2; return [g,m]; };
  return {mesh,lin,uniforms,wet,sandY,sand,bed,rays,surface,glass,bubble,spill}; };
export {TANKFX};
