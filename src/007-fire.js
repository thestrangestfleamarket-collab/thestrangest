// THE FLAME: FLAME draws every candle, torch, ember and wisp of smoke as instanced billboards in one shader.
import {THREE} from './003-shx.js';
import {LEVELS} from './003b-systems.js';
import {scene} from './004-main.js';
import {TILE} from './006-map-pre.js';
const FLAME=(()=>{ const N=640, K={candle:0,torch:1,bed:2,ball:3,ember:4,smoke:5,steam:6,frost:7,glint:8}, SRC=[], PT=[];
  const VS=`attribute vec4 iP; attribute vec4 iS; varying vec2 vUv; varying float vK, vSd, vA;
#include <clipping_planes_pars_vertex>
void main(){ vK=iP.w; vSd=iS.z; vA=iS.w; vUv=position.xy; vec4 mvPosition=viewMatrix*vec4(iP.xyz,1.); vec2 r=vec2(1.,0.), u=vec2(0.,1.), q=position.xy-.5;
  if(vK<2.5){ vec3 up=(viewMatrix*vec4(0.,1.,0.,0.)).xyz; float L=length(up.xy); if(L>1e-3){ u=up.xy/L; r=vec2(u.y,-u.x); } q.y=(position.y-.06)*max(L,.45); }
  mvPosition.xy+=r*q.x*iS.x+u*q.y*iS.y; mvPosition.z+=iS.x*.25;
  #include <clipping_planes_vertex>
  gl_Position=projectionMatrix*mvPosition; }`;
  const FS=`uniform float uT; varying vec2 vUv; varying float vK, vSd, vA;
#include <clipping_planes_pars_fragment>
float h3(vec3 p){ p=fract(p*.3183099+vec3(.1,.2,.3)); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vn(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.-2.*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z); }
float fbm(vec3 p){ return .5*vn(p)+.25*vn(p*2.03+7.1)+.125*vn(p*4.01+3.7)+.0625*vn(p*8.05+1.3); }
vec3 ramp(float h){ vec3 c=mix(vec3(.42,.035,.01),vec3(1.,.26,.03),smoothstep(.02,.32,h)); c=mix(c,vec3(1.,.62,.12),smoothstep(.28,.6,h)); return mix(c,vec3(1.,.93,.66),smoothstep(.62,.92,h)); }
void main(){
  #include <clipping_planes_fragment>
  ivec2 bq=ivec2(mod(gl_FragCoord.xy,4.)); float bt[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.), th=(bt[bq.x+bq.y*4]+.5)/16.;
  float t=uT+vSd*13.7, s=vSd*3.1; vec3 col; vec2 p=vUv;
  if(vK<2.5){ float y=(p.y-.06)/.94, x=(p.x-.5)*2., heat;
    if(vK<.5){
      float hh=.78+.22*vn(vec3(t*3.1,s,1.)), yy=y/hh, sw=(vn(vec3(t*1.4,s,4.))-.5)*.55*yy*yy, n=fbm(vec3(x*2.,yy*3.-t*3.,t*.7+s));
      float w=.62*sqrt(clamp(yy*5.,0.,1.))*pow(max(1.-yy,0.),.7)*(.9+.25*n), d=abs(x-sw)/max(w,1e-3); heat=(1.-d)*(1.05-.55*yy)+(n-.45)*.2;
      if(yy>1.||heat<th*.18)discard; col=ramp(heat*1.25); if(yy<.16&&d>.45)col=mix(col,vec3(.08,.12,.55),.75); }
    else if(vK<1.5){
      float n=fbm(vec3(x*2.2,y*2.6-t*2.9,t*.55+s)), n2=fbm(vec3(x*4.6,y*5.2-t*4.4,t*.9+s+5.)), tg=vn(vec3(x*3.+s,t*1.1,3.)), xs=x+(n-.47)*1.3*y+(vn(vec3(t*.9,s,7.))-.5)*.3*y;
      float w=.72*sqrt(clamp(y*5.,0.,1.))*pow(max(1.-y,0.),.45); heat=(1.-abs(xs)/max(w,1e-3))*(1.15-.8*y)+(n2-.47)*1.5*y+(n-.47)*.5+(tg-.5)*.6*y;
      if(heat<th*.25)discard; col=ramp(heat); }
    else{
      float n=fbm(vec3(x*3.,y*2.4-t*2.6,t*.6+s)), n2=fbm(vec3(x*6.2,y*4.6-t*3.9,t+s+9.)), tg=vn(vec3(x*3.6+s,t*.85,2.));
      float xx=x*(1.+.9*y)+(n-.47)*.45*y; heat=(1.-1.6*xx*xx)*(1.1-1.25*y)-max(abs(x)-.75,0.)*4.+(n-.47)*1.2*y+(n2-.47)*.5+(tg-.5)*.8*y;
      float b=y-.22*x*x+(n2-.47)*.07; heat-=max(-b,0.)*9.;
      if(heat<th*.25)discard; col=ramp(heat); } }
  else{ vec2 q=(p-.5)*2.; float r=length(q);
    if(vK<3.5){ float n=fbm(vec3(q*2.4+vec2(0.,-t*2.6),t*.8+s)), heat=1.05-r*1.15+(n-.47)*1.1; if(heat<th*.25)discard; col=ramp(heat*1.15); }
    else if(vK<4.5){ if(r>1.)discard; col=ramp(.3+.65*vA)*(1.2-r*.4); }
    else if(vK>7.5){ if(r>1.)discard; col=mix(vec3(.5,.78,1.),vec3(.95,1.,1.),vA)*(1.15-r*.35); }
    else{ float n=fbm(vec3(q*1.7,t*.35+s)), a=(1.-r)*(.45+n)*vA; if(a<th*.9+.05)discard; col=vK>6.5?vec3(.68,.86,1.)*(.9+.3*n):vK>5.5?vec3(.78,.8,.82)*(.85+.3*n):vec3(.075,.07,.066)*(.7+.8*n); } }
  gl_FragColor=vec4(col,1.);
  #include <colorspace_fragment>
}`;
  const g=new THREE.InstancedBufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,1,0,0,1,1,0,0,1,0],3)); g.setIndex([0,1,2,0,2,3]);
  const P=new Float32Array(N*4), S=new Float32Array(N*4), aP=new THREE.InstancedBufferAttribute(P,4), aS=new THREE.InstancedBufferAttribute(S,4); aP.setUsage(THREE.DynamicDrawUsage); aS.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute('iP',aP); g.setAttribute('iS',aS); g.instanceCount=0;
  const uT={value:0}, mat=new THREE.ShaderMaterial({uniforms:{uT},vertexShader:VS,fragmentShader:FS,clipping:true,toneMapped:false,side:THREE.DoubleSide});
  const me=new THREE.Mesh(g,mat); me.frustumCulled=false; me.raycast=()=>{}; me.name='fire'; scene.add(LEVELS.own(me,'*'));
  const n1=(t,s)=>{ const i=Math.floor(t), f=t-i, u=f*f*(3-2*f), h=k=>{ const v=Math.sin((k+s*31.7)*127.1)*43758.5453; return v-Math.floor(v); }; return h(i)+(h(i+1)-h(i))*u; };
  const flick=(s,t=performance.now()/1000)=>.8+.12*n1(t*5.3,s)+.1*n1(t*13.1,s+7)-.1*Math.max(0,n1(t*1.7,s+3)-.7)/.3;
  const add=o=>{ '@later'; const s={name:o.name||o.kind,k:K[o.kind]??-1,x:o.x,y:o.y,z:o.z,w:o.w||.1,h:o.h||.2,sd:o.seed??Math.random()*50,embers:o.embers||0,smoke:o.smoke||0,steam:o.steam?6:5,sk:o.sk||1,light:o.light||null,li:o.light?o.light.intensity:0,ride:o.ride||o.light||null,ea:Math.random(),sa:Math.random(),a:new THREE.Object3D(),on:true};
    if(s.ride)s.off=[s.x-s.ride.position.x,s.y-s.ride.position.y,s.z-s.ride.position.z];
    s.a.position.set(s.x,s.y,s.z); (o.parent||scene).add(s.a); SRC.push(s); return s; };
  const shown=o=>{ for(;o;o=o.parent)if(!o.visible)return false; return true; };
  const part=(k,x,y,z,vx,vy,vz,life,sz,sd=Math.random()*9,g=0)=>{ if(PT.length>=N-64)return null; const q={k,x,y,z,vx,vy,vz,t:0,life,sz,sd,g}; PT.push(q); return q; };
  const ember=(x,y,z,v=1)=>part(4,x,y,z,(Math.random()-.5)*.3*TILE*v,(.5+Math.random()*.7)*TILE*v,(Math.random()-.5)*.3*TILE*v,.7+Math.random()*1.1,(.025+Math.random()*.02)*TILE,Math.random()*9);
  const puff=(x,y,z,k=1,kk=5)=>part(kk,x,y,z,(Math.random()-.5)*.04*TILE,(.22+Math.random()*.12)*TILE*Math.sqrt(k),(Math.random()-.5)*.04*TILE,(2.2+Math.random()*1.6)*Math.sqrt(k),.14*TILE*k,Math.random()*9);
  const props=(list,X,Y,Z,lights=[])=>{ '@later'; const out=[], used=new Set();
    for(const p of list)for(const b of p.boxes){ const c=b.c; if(!b.life||!c||c[0]<240||c[2]>110||c[1]<100)continue;
      const nm=p.name||p.kind||'', cx=(b.x0+b.x1)/2, cy=(b.y0+b.y1)/2, x=X(cx), z=Z(cy), bw=X(b.x1)-X(b.x0), kind=/brazier/.test(nm)?'bed':/torch/.test(nm)?'torch':'candle';
      let L=null, best=.45*TILE; for(const q of lights){ const d=Math.hypot(q.position.x-x,q.position.z-z); if(d<best&&Math.abs(q.position.y-Y(b.z0))<1.5*TILE){ best=d; L=q; } }
      const o=kind==='bed'?{w:Math.abs(bw)*1.1,h:Math.abs(bw)*1.05,embers:2,smoke:.6}:kind==='torch'?{w:Math.abs(bw)*2.3,h:(Y(b.z1)-Y(b.z0))*1.4,embers:.9,smoke:1.4,sk:.7}:{w:Math.max(Math.abs(bw),.06*TILE)*1.9,h:Math.min(Y(b.z1)-Y(b.z0),Y(12)-Y(0))*1.05+(Y(4)-Y(0))};
      out.push(add({kind,x,y:Y(b.z0),z,...o,light:L&&!used.has(L)?L:null,ride:L,seed:cx*7+cy*13,name:nm})); if(L)used.add(L); }
    return out; };
  const tick=(dt,you)=>{ const t=performance.now()/1000; uT.value=t%2000; let n=0; const far=(36*TILE)**2;
    for(const s of SRC){ if(s.ride){ s.x=s.ride.position.x+s.off[0]; s.y=s.ride.position.y+s.off[1]; s.z=s.ride.position.z+s.off[2]; }
      if(s.light)s.light.intensity=s.li*flick(s.sd,t);
      s.vis=s.on&&shown(s.a)&&(!you||(s.x-you.x)**2+(s.z-you.z)**2<far); if(!s.vis)continue;
      if(s.embers){ s.ea+=dt*s.embers; while(s.ea>=1){ s.ea-=1; ember(s.x+(Math.random()-.5)*s.w*.4,s.y+s.h*.35,s.z+(Math.random()-.5)*s.w*.4); } }
      if(s.smoke){ s.sa+=dt*s.smoke; while(s.sa>=1){ s.sa-=1; puff(s.x+(Math.random()-.5)*s.w*.2,s.y+(s.k<0?0:s.h*.8),s.z+(Math.random()-.5)*s.w*.2,s.sk,s.steam); } }
      if(s.k>=0&&n<N){ P.set([s.x,s.y,s.z,s.k],n*4); S.set([s.w,s.h,s.sd,1],n*4); n++; } }
    for(const q of PT){ q.t+=dt; const u=q.t/q.life; if(u>=1)continue;
      if(q.k===4||q.k===8){ q.vx+=(Math.random()-.5)*.8*TILE*dt; q.vz+=(Math.random()-.5)*.8*TILE*dt; q.vy+=(q.g?-q.g:-.2*TILE)*dt; const dr=Math.max(0,1-1.2*dt); q.vx*=dr; q.vz*=dr; }
      else{ q.vx+=Math.sin(q.t*1.3+q.sd)*.05*TILE*dt; q.vz+=Math.cos(q.t*1.1+q.sd*1.7)*.05*TILE*dt; }
      q.x+=q.vx*dt; q.y+=q.vy*dt; q.z+=q.vz*dt; if(n>=N)continue;
      const em=q.k===4||q.k===8, sz=em?q.sz*(1-u*.7):q.sz*(1+2.2*u), a=em?1-u:Math.min(1,u*5)*(1-u)*.9;
      P.set([q.x,q.y,q.z,q.k],n*4); S.set([sz,sz,q.sd,a],n*4); n++; }
    for(let i=PT.length-1;i>=0;i--)if(PT[i].t>=PT[i].life)PT.splice(i,1);
    g.instanceCount=n; aP.needsUpdate=n>0; aS.needsUpdate=n>0; me.visible=n>0; FLAME.n=n; };
  return {add,props,tick,flick,ember,puff,part,src:SRC,pt:PT,me,K}; })(); window.FLAMES=FLAME.src;
window.FLAME=FLAME;
export {FLAME};
