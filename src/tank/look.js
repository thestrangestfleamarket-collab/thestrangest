// HULL DOWN's living ground, after THE MARKET's: standing grass that leans in the wind and stays down where it is driven on or burnt, trees that sway, ponds that ripple where they are hit (put into main.js by tools/edge.cjs)
const LOOK=(()=>{
  const L={uT:{value:0},uCam:{value:new T.Vector2()},uWind:{value:new T.Vector3(.8,.6,.5)}};
  // the land's heights as a picture, for the grass to stand on
  const hd=new Float32Array((GN+1)*(GN+1));hd.set(HG);const tH=new T.DataTexture(hd,GN+1,GN+1,T.RedFormat,T.FloatType);tH.minFilter=tH.magFilter=renderer.extensions.has('OES_texture_float_linear')?T.LinearFilter:T.NearestFilter;tH.needsUpdate=true;
  const seg=(a,b)=>`rd=min(rd,sdS(w,vec2(${a[0]}.,${a[1]}.),vec2(${b[0]}.,${b[1]}.)));`;
  // tufts on a lattice that wraps round you, so it costs nothing to carry along
  function ring(N,sp,inner,tall,blades){
    const R=N*sp/2,bp=[],bi=[],r=rng(N*7+blades);
    for(let b=0;b<blades;b++){const a=r()*6.28,lean=.15+r()*.3,w=.035+r()*.03,ca=Math.cos(a),sa=Math.sin(a),o=bp.length/3,hh=.7+r()*.3;
      for(let j=0;j<3;j++){const t=j/2,ww=w*(1-t*.85),off=lean*t*t;for(const sd of[-1,1])bp.push(ca*off+sa*ww*sd+(r()-.5)*.02,t*hh,sa*off-ca*ww*sd);}
      bi.push(o,o+1,o+2,o+2,o+1,o+3,o+2,o+3,o+4,o+4,o+3,o+5);}
    const g=new T.InstancedBufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(bp,3));g.setIndex(bi);const ao=new Float32Array(N*N*3);
    for(let i=0;i<N;i++)for(let j=0;j<N;j++){const k=(i*N+j)*3;ao[k]=(i+r())*sp;ao[k+1]=(j+r())*sp;ao[k+2]=r();}
    g.setAttribute('aO',new T.InstancedBufferAttribute(ao,3));g.instanceCount=N*N;
    const mat=new T.MeshLambertMaterial({side:T.DoubleSide,color:new T.Color(2.1,2.05,1.9)});
    mat.onBeforeCompile=s=>{Object.assign(s.uniforms,{uT:L.uT,uCam:L.uCam,uWind:L.uWind,tH:{value:tH},tGS:{value:WORLD.tex},tG:{value:A0.grass.d},tDry:{value:A0.dry},tShade:landMat.userData.tShade,uShadeM:landMat.userData.uShadeM});
      s.vertexShader=s.vertexShader.replace('#include <common>',`#include <common>
attribute vec3 aO;uniform float uT;uniform vec2 uCam;uniform vec3 uWind;uniform sampler2D tH,tGS,tG,tDry,tShade;uniform mat4 uShadeM;varying vec3 vGc;
float fh(vec2 p){return fract(sin(p.x*127.1+p.y*311.7)*43758.5453);}
float sdS(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;return length(pa-ba*clamp(dot(pa,ba)/dot(ba,ba),0.,1.));}
float pondD(vec2 p){float m=9.;${PONDS.map(q=>`m=min(m,(length(p-vec2(${q[0]}.,${q[1]}.))-${q[2]}.)/9.+1.);`).join('')}return m;}`)
       .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nobjectNormal=vec3(0.,1.,0.);')
       .replace('#include <begin_vertex>',`const float RR=${R.toFixed(2)};vec2 w=mod(aO.xy-uCam+RR,2.*RR)-RR+uCam;float dc=distance(w,uCam);float sc=(1.-smoothstep(RR*.7,RR*.97,dc))*smoothstep(${(inner*.8).toFixed(2)},${Math.max(.01,inner).toFixed(2)},dc);
  vec2 q=vec2(${FCS.toFixed(5)}*w.x+${FSN.toFixed(5)}*w.y,${(-FSN).toFixed(5)}*w.x+${FCS.toFixed(5)}*w.y);vec2 fs=vec2(${FW}.,${FD}.);vec2 cell=floor(q/fs);vec2 ff=fract(q/fs);float fr=fh(vec2(cell.x*1.37+.5,cell.y*2.11+.25));float edge=min(min(ff.x,1.-ff.x)*fs.x,min(ff.y,1.-ff.y)*fs.y);float inF=smoothstep(2.5,5.5,edge);
  float kd=step(.4,fr)*step(fr,.6)*inF,ks=step(.6,fr)*step(fr,.72)*inF,kw=step(.72,fr)*inF;
  float rd=1e9;${ROAD.slice(0,-1).map((a,i)=>seg(a,ROAD[i+1])).join('')}
  float town=max(max(1.-smoothstep(105.,125.,length(w-vec2(150.,300.))),1.-smoothstep(60.,80.,length(w-vec2(-480.,-640.)))),1.-smoothstep(50.,65.,length(w-vec2(420.,-560.))));
  sc*=smoothstep(4.,7.5,rd)*(1.-town)*smoothstep(.95,1.25,pondD(w))*(1.-ks)*step(abs(w.x),845.)*step(abs(w.y),845.);
  vec4 gs=texture2D(tGS,w/1400.+.5);sc*=1.-smoothstep(.2,.5,gs.g);float down=max(gs.b,gs.r*.8);
  float hgt=texture2D(tH,((w-vec2(${G0}.))/${GS}.+.5)/${GN+1}.).r;
  float sz=(.55+.9*aO.z)*${tall.toFixed(2)}*mix(1.,.45,kd)*mix(1.,1.5,kw);float h=position.y;
  float an=aO.z*31.4;float ca=cos(an),sa=sin(an);vec3 p=vec3(ca*position.x-sa*position.z,position.y,sa*position.x+ca*position.z)*sz;p.y*=mix(1.,.14,down);p.xz*=mix(1.,1.7,down);
  float ph=dot(w,uWind.xy)*.22-uT*1.7,gu=.55+.45*sin(ph)*(.65+.35*sin(ph*.37+1.3));vec2 dv=uWind.z*(uWind.xy*gu+.22*vec2(sin(uT*2.3+w.x*1.7),sin(uT*2.1+w.y*1.7)))*(1.-down);
  p.xz+=dv*h*h*sz*.6;p.y-=.3*dot(dv,dv)*h*h*sz;
  vec3 transformed=vec3(w.x,hgt-.03,w.y)+p*sc;
  vec3 g1=texture2D(tG,w/5.3).rgb,g2=texture2D(tG,w/31.).rgb;vec3 gr=g1*(.55+1.1*g2);vec3 dr=texture2D(tDry,q/6.1).rgb*vec3(1.25,1.12,.8);vec3 gc=mix(mix(gr*vec3(.72,1.18,.5)*1.2,dr,kd),gr*vec3(.5,.8,.4),kw);
  float cl=texture2D(tG,w/1700.+vec2(uT*.0021,uT*.0009)).g*.6+texture2D(tG,w/640.-vec2(uT*.003,0.)).r*.4;gc*=mix(.55,1.08,smoothstep(.3,.56,cl))*vec3(.9,.93,.9);
  {vec4 c4=uShadeM*vec4(transformed,1.);vec3 sq=c4.xyz*.5+.5;float lit=(sq.x<0.||sq.x>1.||sq.y<0.||sq.y>1.)?1.:step(sq.z-.0016,unpackRGBAToDepth(texture2D(tShade,sq.xy)));gc*=mix(vec3(.26,.33,.5),vec3(1.),lit);}
  gc*=mix(1.,.2,gs.r)*mix(.62,1.3,h)*(.85+.3*fh(aO.xy));vGc=gc;`);
      s.vertexShader=s.vertexShader.replace('#include <packing>','');if(s.vertexShader.indexOf('unpackRGBAToDepth')>=0&&s.vertexShader.indexOf('float unpackRGBAToDepth')<0)s.vertexShader=s.vertexShader.replace('attribute vec3 aO;','const vec4 UnB=vec4(1.)/vec4(16581375.,65025.,255.,1.)*vec4(1.,1.,1.,1.);float unpackRGBAToDepth(vec4 v){return dot(v,vec4(255./256./(256.*256.*256.),255./256./(256.*256.),255./256./256.,255./256.));}\nattribute vec3 aO;');
      s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vGc;').replace('#include <map_fragment>','diffuseColor.rgb*=vGc;');};
    const m=new T.Mesh(g,mat);m.frustumCulled=false;m.receiveShadow=false;m.castShadow=false;scene.add(m);return m;}
  L.grass=[ring(72,.46,0,.62,5),ring(80,1.15,13,.95,4)];
  // the trees' crowns and the hedges move with the same wind
  land.traverse(o=>{if(!o.isInstancedMesh||!o.instanceColor||!(o.userData.sway||o.material.alphaTest&&o.material.vertexColors))return;const mt=o.material,hgt=o.geometry.boundingBox||(o.geometry.computeBoundingBox(),o.geometry.boundingBox);
    const was=mt.onBeforeCompile;mt.customProgramCacheKey=()=>'sway'+(was?was.toString().length:0)+hgt.max.y.toFixed(2);mt.onBeforeCompile=s=>{if(was)was(s);s.uniforms.uT=L.uT;s.uniforms.uWind=L.uWind;s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;uniform vec3 uWind;').replace('#include <begin_vertex>',`#include <begin_vertex>
  {float h=max(position.y,0.)/${hgt.max.y.toFixed(2)};vec3 ip=instanceMatrix[3].xyz;float ph=ip.x*.31+ip.z*.17;float g=(.7+.3*sin(uT*.23+ph))*uWind.z*2.;float am=${(hgt.max.y*.024).toFixed(3)}*g;transformed.x+=sin(uT*1.6+ph)*h*h*am;transformed.z+=sin(uT*1.2+ph*1.7)*h*h*am*.7;transformed.x+=sin(uT*3.1+ph*2.3+position.y*.9)*h*am*.18;}`);};mt.needsUpdate=true;});
  // the ponds: wind ripples, and rings that run out from whatever hits the water
  const rings=[];for(let i=0;i<8;i++)rings.push(new T.Vector4(0,0,-99,0));
  land.traverse(o=>{if(!o.isMesh||!o.material.isMeshStandardMaterial||!o.geometry||o.geometry.type!=='CircleGeometry'||o.material.userData.water)return;const mt=o.material;mt.userData.water=1;mt.roughness=.04;mt.envMapIntensity=1.7;
    mt.onBeforeCompile=s=>{s.uniforms.uT=L.uT;s.uniforms.uWind=L.uWind;s.uniforms.uRing={value:rings};
      s.fragmentShader=s.fragmentShader.replace('#include <common>',`#include <common>
uniform float uT;uniform vec3 uWind;uniform vec4 uRing[8];
float wh(vec2 p){p=fract(p*vec2(.1031,.1030));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}
float wn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(wh(i),wh(i+vec2(1,0)),f.x),mix(wh(i+vec2(0,1)),wh(i+vec2(1,1)),f.x),f.y);}`)
        .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
  {vec2 wp=vFogWorld.xz;vec2 fl=uWind.xy*uT;vec2 dn=vec2(wn(wp*.9+fl*.5)-wn(wp*.9+fl*.5+vec2(.35,0.)),wn(wp*.9+fl*.5)-wn(wp*.9+fl*.5+vec2(0.,.35)))*.5+vec2(wn(wp*2.7-fl*.8)-.5,wn(wp*2.7-fl*.8+9.)-.5)*.1;dn*=.5+uWind.z;
   for(int i=0;i<8;i++){vec4 r=uRing[i];float age=uT-r.z;if(age<0.||age>9.)continue;vec2 d=wp-r.xy;float dl=length(d)+.001,rr=age*5.5;float k=r.w*cos((dl-rr)*2.2)*exp(-abs(dl-rr)*.45)*exp(-age*.45);dn+=d/dl*k*.6;}
   normal=normalize(normal+mat3(viewMatrix)*vec3(dn.x,0.,dn.y));}`);};mt.needsUpdate=true;});
  let wakeT=0;
  L.update=dt=>{L.uT.value=time;camera.getWorldPosition(va);L.uCam.value.set(va.x,va.z);L.uWind.value.z=.35+.25*Math.sin(time*.11)+.12*Math.sin(time*.37);
    const far=!SET.grass||SET.grass>1;L.grass[0].visible=SET.grass!==0;L.grass[1].visible=SET.grass!==0&&far;
    WORLD.rings.forEach((r,i)=>rings[i].set(r.x,r.z,r.t,r.a));for(let i=WORLD.rings.length;i<8;i++)rings[i].z=-99;
    wakeT-=dt;if(wakeT<=0&&Math.abs(P.v)>1&&WORLD.wetAt(P.x,P.z)){wakeT=.45;WORLD.rings.push({x:P.x,z:P.z,t:time,a:.5});if(WORLD.rings.length>8)WORLD.rings.shift();puff(P.x+Math.sin(P.yaw)*3,P.y+.6,P.z+Math.cos(P.yaw)*3,{c:[.75,.8,.82],s0:1.5,s1:5,life:1,vy:2.5,op:.5});}};
  return L;
})();
