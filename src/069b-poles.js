// THE WIRES: WIRES strings the street's telephone poles and wires, with perches for birds.
import {SHARED, THREE} from './003-shx.js';
import {CULL, DRESS, pos} from './003b-systems.js';
import {scene} from './004-main.js';
import {BLOCK, FIX, MAPSTAIR, MODS, OUT, SOL, STORE, SYS, TILE} from './006-map-pre.js';
const WIRES=window.WIRES={perch:[],poles:[],tick:()=>{}};
{ const M=TILE/.84, V3=THREE.Vector3, G=MODS.bodega.ground, h3=(a,b,c)=>{ const v=Math.sin(a*12.9898+b*78.233+c*37.719)*43758.5453; return v-Math.floor(v); };
  const X0=SHARED.BOD.XS(BLOCK.x0), X1=SHARED.BOD.XS(BLOCK.x1), zp=DRESS.kerb.sw+.5-.5*M, A=MODS.apts&&MODS.apts.A;
  const doors=[SHARED.BOD.X((SHARED.BOD.B0.x0+SHARED.BOD.B0.x1)/2),A?SHARED.BOD.X(MODS.apts.DX):1e9,SHARED.BOD.GD?SHARED.BOD.X(SHARED.BOD.GD.door[0]):1e9,SHARED.BOD.XS((MAPSTAIR.x0+MAPSTAIR.x1)/2),...(STORE.main?STORE.main.doors.map(d=>d[1]):[])];
  const free=x=>DRESS.poles.every(p=>Math.abs(p.z-zp)>3*M||Math.abs(p.x-x)>3*M)&&SHARED.BOD.signs.every(s=>Math.abs(SHARED.BOD.ZS(s.y)-zp)>3*M||Math.abs(SHARED.BOD.XS(s.x)-x)>2*M)&&DRESS.cans.every(c=>Math.abs(c.x-x)>1.6*M)
    &&doors.every(d=>Math.abs(d-x)>3.2*M)&&!SOL.up.some(b=>x>b[0]-.8*M&&x<b[2]+.8*M&&zp>b[1]-.8*M&&zp<b[3]+.8*M);
  const XS=[]; for(let i=0;i<4;i++){ const c=X0+(X1-X0)*(i+.5)/4; for(let k=0;k<60;k++){ const x=c+(k&1?-1:1)*Math.ceil(k/2)*.4*M; if(free(x)){ XS.push(x); break; } } }
  const HP=8*M, AY=7.35*M, AW=1.2*M, IW=1*M, AT=256, AH=512, cv=document.createElement('canvas'); cv.width=AT; cv.height=AH;
  const g=cv.getContext('2d'), im=g.createImageData(AT,AH), put=(i,j,c)=>{ const q=(j*AT+i)*4; im.data[q]=c[0]; im.data[q+1]=c[1]; im.data[q+2]=c[2]; im.data[q+3]=255; }, mix=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*k);
  const SW=64, SH=448;
  XS.forEach((x,p)=>{ const s=p*17+3, cracks=[0,1,2,3].map(k=>[Math.floor(h3(s,k,1)*SW),Math.floor(h3(s,k,2)*SH*.7),Math.floor(SH*.2+h3(s,k,3)*SH*.5)]), fly=[0,1,2,3].filter(k=>h3(s,k,4)<.85).map(k=>[Math.floor(h3(s,k,5)*(SW-14)),Math.floor(SH*(.72+h3(s,k,6)*.12)),9+Math.floor(h3(s,k,7)*6),11+Math.floor(h3(s,k,8)*8),[[228,222,204],[232,224,96],[232,160,188],[170,206,232],[236,236,232]][Math.floor(h3(s,k,9)*5)]]);
    for(let j=0;j<SH;j++)for(let i=0;i<SW;i++){ const y=1-j/SH, r=h3(i,j,s), col=h3(i,Math.floor(j/37),s+1), wav=Math.floor(h3(i,Math.floor(j/90),s+2)*4);
      let c=y>.66+.05*h3(i,9,s)?[104,88,72]:y<.06+.01*wav?[42,32,24]:[72,52,36]; c=c.map(v=>v*(.86+.24*col)); if(r<.05)c=c.map(v=>v*.78);
      if((i+wav)%9===0)c=c.map(v=>v*.82);
      for(const [ci,j0,L] of cracks)if(j>=j0&&j<j0+L&&i===ci+(Math.floor((j-j0)/23)%2))c=[28,20,14];
      if(y>.14&&y<.3&&h3(i,j,s+7)<.035)c=h3(i,j,s+8)<.6?[176,178,184]:[120,70,40];
      for(const [fx,fy,fw,fh,fc] of fly)if(i>=fx&&i<fx+fw&&j>=fy&&j<fy+fh){ const e=Math.min(i-fx,fx+fw-1-i,j-fy,fy+fh-1-j); if(e<2&&h3(i,j,s+9)<.45)continue; const tab=j>fy+fh-4;
        c=tab&&i%2?c:mix(fc,[150,140,120],h3(fx,fy,4)<.5?.25:0); if(!tab&&(j-fy)%2===1&&i>fx+1&&i<fx+fw-2&&h3(i,j,s+10)<.7)c=[70,64,70]; }
      if(y>.22&&y<.235&&i>=26&&i<34)c=(i+j)%3?[190,192,196]:[60,60,64];
      put(p*SW+i,j,c); } });
  const SWT={wood:[0,448,64,16],glass:[64,448,8,16],can:[72,448,40,32],steel:[112,448,8,8],wire:[120,448,8,8],step:[128,448,8,8],cap:[136,448,8,8]};
  for(let j=448;j<AH;j++)for(let i=0;i<AT;i++){ const r=h3(i,j,77); let c=[30,30,30];
    if(i<64&&j<464)c=((j-448)%5===0||r<.06?[86,74,62]:[118,104,88]).map(v=>v*(.9+.15*h3(i,Math.floor(j/3),5)));
    else if(i>=64&&i<72&&j<464)c=i===66&&j<452?[180,230,210]:j%4===0?[52,118,94]:[72,150,122];
    else if(i>=72&&i<112&&j<480)c=j<451?[96,104,106]:(i===80||i===81)&&j>452&&j<452+Math.floor(h3(i,1,1)*14)?[128,72,40]:i>=92&&i<98&&j>=462&&j<466?[226,226,220]:[128,136,138].map(v=>v*(.94+.08*r));
    else if(i>=112&&i<120&&j<456)c=[150,152,156];
    else if(i>=120&&i<128&&j<456)c=[26,26,30];
    else if(i>=128&&i<136&&j<456)c=[166,168,172];
    else if(i>=136&&i<144&&j<456)c=[40,34,28];
    put(i,j,c); }
  g.putImageData(im,0,0); const map=new THREE.CanvasTexture(cv); map.magFilter=map.minFilter=THREE.NearestFilter; map.generateMipmaps=false; map.colorSpace=THREE.SRGBColorSpace;
  const UV=(r,a,b)=>[(r[0]+a*r[2])/AT,1-(r[1]+(1-b)*r[3])/AH];
  const Pp=[], Uu=[], Ff=[], tri=(a,b,c,ua,ub,uc,f)=>{ Pp.push(...a.toArray(),...b.toArray(),...c.toArray()); Uu.push(...ua,...ub,...uc); Ff.push(f,f,f); }, quad=(a,b,c,d,ua,ub,uc,ud,f)=>{ tri(a,b,c,ua,ub,uc,f); tri(a,c,d,ua,uc,ud,f); };
  const box=(c,a,b,e,sw,f)=>{ const q=(x,y,z)=>c.clone().addScaledVector(a,x).addScaledVector(b,y).addScaledVector(e,z), u=[UV(sw,0,0),UV(sw,1,0),UV(sw,1,1),UV(sw,0,1)];
    for(const [P0,P1,P2,P3] of [[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]],[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]],[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]],[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]],[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]])
      quad(q(...P0),q(...P1),q(...P2),q(...P3),...u,f); };
  const cyl=(B,ax,L,r0,r1,n,uv,f,cap)=>{ const e1=new V3(1,0,0).addScaledVector(ax,-ax.x).normalize(), e2=new V3().crossVectors(ax,e1), pt=(k,t)=>{ const a=k/n*Math.PI*2, r=r0+(r1-r0)*t; return B.clone().addScaledVector(ax,L*t).addScaledVector(e1,Math.cos(a)*r).addScaledVector(e2,Math.sin(a)*r); };
    for(let k=0;k<n;k++)quad(pt(k,0),pt(k+1,0),pt(k+1,1),pt(k,1),uv(k/n,0),uv((k+1)/n,0),uv((k+1)/n,1),uv(k/n,1),f);
    if(cap){ const T=B.clone().addScaledVector(ax,L), u=UV(cap,.5,.5); for(let k=0;k<n;k++)tri(T,pt(k,1),pt(k+1,1),u,u,u,f); } };
  const X_=new V3(1,0,0), Y_=new V3(0,1,0), Z_=new V3(0,0,1), v=(a,s)=>a.clone().multiplyScalar(s);
  const ends=[];
  XS.forEach((x,p)=>{ const s=p*17+3, y0=G(x,zp), lean=h3(s,1,1)<.5?.012+.018*h3(s,2,1):0, la=h3(s,3,1)*6.28, ax=new V3(Math.sin(la)*lean,1,Math.cos(la)*lean).normalize(), B=new V3(x,y0-.4*M,zp), at=h=>B.clone().addScaledVector(ax,h+.4*M);
    cyl(B,ax,HP+.4*M,.135*M,.1*M,8,(u,t)=>UV([p*SW,0,SW,SH],u,t),p,SWT.cap);
    const arm=at(AY), ex=new V3().crossVectors(ax,Z_).normalize(), ez=new V3().crossVectors(ex,ax).normalize();
    box(arm,v(ex,.055*M),v(ax,.06*M),v(ez,AW),SWT.wood,p);
    for(const sd of [-1,1]){ const a=at(AY-.62*M), b=arm.clone().addScaledVector(ez,sd*.62*M), m=a.clone().add(b).multiplyScalar(.5), d=b.clone().sub(a);
      box(m,v(ex,.012*M),v(d,.5),v(new V3().crossVectors(d,ex).normalize(),.02*M),SWT.steel,p);
      const ins=arm.clone().addScaledVector(ez,sd*IW).addScaledVector(ax,.06*M); cyl(ins,ax,.05*M,.022*M,.022*M,6,()=>UV(SWT.steel,.5,.5),p); cyl(ins.clone().addScaledVector(ax,.05*M),ax,.11*M,.055*M,.035*M,6,(u,t)=>UV(SWT.glass,u,t),p,SWT.glass);
      ends.push({p,sd,at:ins.clone().addScaledVector(ax,.15*M)}); }
    { const k=h3(s,4,1)<.5, ins=arm.clone().addScaledVector(ez,(k?.35:-.35)*M).addScaledVector(ax,.06*M); cyl(ins,ax,.12*M,.04*M,.03*M,6,(u,t)=>UV(SWT.glass,u,t),p,SWT.glass); }
    for(let h=2.6*M,k=0;h<AY-.5*M;h+=.42*M,k++){ const c=at(h).addScaledVector(k&1?ex:v(ex,-1),.17*M); box(c,v(ex,.11*M),v(ax,.018*M),v(ez,.018*M),SWT.step,p); box(c.clone().addScaledVector(k&1?ex:v(ex,-1),.1*M).addScaledVector(ax,.035*M),v(ex,.012*M),v(ax,.035*M),v(ez,.012*M),SWT.step,p); }
    if(p===1){ const c=at(6.1*M).addScaledVector(ez,.42*M); box(at(6.25*M).addScaledVector(ez,.16*M),v(ex,.06*M),v(ax,.2*M),v(ez,.05*M),SWT.steel,p);
      cyl(c.clone().addScaledVector(ax,-.38*M),ax,.76*M,.24*M,.24*M,8,(u,t)=>UV(SWT.can,u,t),p); cyl(c.clone().addScaledVector(ax,.38*M),ax,.05*M,.255*M,.2*M,8,()=>UV(SWT.can,.5,.02),p,SWT.can);
      for(const o of [-.1,.1])cyl(c.clone().addScaledVector(ax,.43*M).addScaledVector(ex,o*M),ax,.12*M,.03*M,.022*M,6,(u,t)=>UV(SWT.glass,u,t),p,SWT.glass); }
    const top=at(HP); WIRES.poles.push({x,z:zp,y0,top}); WIRES.perch.push({x:top.x,z:top.z,y:top.y+.02*M,h:h3(s,5,1)<.5?0:Math.PI,pole:p});
    SOL.up.push([x-.15*M,zp-.15*M,x+.15*M,zp+.15*M]); FIX.up.push([x-.15*M,zp-.15*M,y0,x+.15*M,zp+.15*M,y0+HP]); });
  if(XS.length>1){ const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(Uu,2)); geo.setAttribute('pf',new THREE.Float32BufferAttribute(Ff,1)); geo.computeVertexNormals();
    const uF={value:new THREE.Vector4(1,1,1,1)}; WIRES.fade=uF.value; const mat=new THREE.MeshLambertMaterial({map,flatShading:true});
    mat.onBeforeCompile=sh=>{ sh.uniforms.uF=uF; sh.vertexShader='attribute float pf; varying float vPf;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vPf=pf;');
      sh.fragmentShader='uniform vec4 uF; varying float vPf;\n'+sh.fragmentShader.replace('void main() {','void main() { if(vPf>-.5){ float o=uF[int(vPf+.5)]; if(o<.999&&fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453)>o)discard; }'); };
    mat.customProgramCacheKey=()=>'poles';
    const me=new THREE.Mesh(geo,mat); me.castShadow=me.receiveShadow=true; me.userData.cull=1; scene.add(me); OUT.add(me,'world');
    const NS=24, R=.032*M, WN=2, spans=[]; for(let w=0;w<WN;w++)for(let k=0;k+1<XS.length;k++){ const a=ends.find(e=>e.p===k&&e.sd===(w?1:-1)).at, b=ends.find(e=>e.p===k+1&&e.sd===(w?1:-1)).at; spans.push({w,k,a,b,L:a.distanceTo(b),ph:h3(w,k,6)*6}); }
    const NV=spans.length*NS*4*6, wp=new Float32Array(NV*3), wu=new Float32Array(NV*2), wf=new Float32Array(NV).fill(-1), u0=UV(SWT.wire,.5,.5); for(let i=0;i<NV;i++){ wu[i*2]=u0[0]; wu[i*2+1]=u0[1]; }
    const wg=new THREE.BufferGeometry(); wg.setAttribute('position',new THREE.BufferAttribute(wp,3)); wg.setAttribute('uv',new THREE.BufferAttribute(wu,2)); wg.setAttribute('pf',new THREE.BufferAttribute(wf,1));
    const uR={value:0}, uPl={value:new THREE.Vector2()}, wmat=new THREE.MeshLambertMaterial({map,flatShading:true});   // the wires end where the draw distance hides their poles (owner, 7 Nov 2026: no wires hanging in the sky)
    wmat.onBeforeCompile=sh=>{ mat.onBeforeCompile(sh); sh.uniforms.uR=uR; sh.uniforms.uPl=uPl; sh.vertexShader='varying vec3 vWW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vWW=(modelMatrix*vec4(transformed,1.)).xyz;');
      sh.fragmentShader='varying vec3 vWW; uniform float uR; uniform vec2 uPl;\n'+sh.fragmentShader.replace('void main() {','void main() { if(uR>0.&&distance(vWW.xz,uPl)>uR)discard;'); }; wmat.customProgramCacheKey=()=>'wires';
    SYS.add('life',()=>{ uR.value=CULL.R||0; uPl.value.set(pos.x,pos.z); },'069b-wires');
    const wm=new THREE.Mesh(wg,wmat); wm.frustumCulled=false; scene.add(wm); OUT.add(wm,'world');
    for(const S of spans)if(S.w===S.k%2){ const t=S.w?.38+.1*h3(S.k,1,2):.55+.1*h3(S.k,2,2); WIRES.perch.push({x:0,z:0,y:0,h:S.w?Math.PI:0,span:S,t,d:0,on:0}); }
    const sag=S=>{ const c=S.L*S.L/(8*.024*S.L); return t=>c*(Math.cosh((t-.5)*S.L/c)-Math.cosh(S.L/2/c)); };
    for(const S of spans)S.f=sag(S);
    const pt=(S,t,o)=>{ let dip=0; for(const P of WIRES.perch)if(P.span===S&&P.d>0)dip+=P.d*(t<P.t?t/P.t:(1-t)/(1-P.t));
      o.set(S.a.x+(S.b.x-S.a.x)*t,S.a.y+(S.b.y-S.a.y)*t+S.f(t)-dip,S.a.z+(S.b.z-S.a.z)*t); return o; };   // the wires hang still: only a perching bird's weight moves one
    const q=new V3(), q2=new V3(), RING=[[0,R],[R,0],[0,-R],[-R,0]], cam0=new V3(), nd=new V3(), you=new V3();
    let still=-1, xm=(XS[0]+XS[XS.length-1])/2, half=(XS[XS.length-1]-XS[0])/2;
    WIRES.tick=(dt,P)=>{
      let busy=false; for(const p of WIRES.perch)if(p.span){ const want=p.on?.16*M:0; if(Math.abs(p.d-want)>1e-4){ p.d+=(want-p.d)*Math.min(1,dt*3); busy=true; } pt(p.span,p.t,q); p.x=q.x; p.z=q.z; p.y=q.y+R; }
      const near=OUT.world&&Math.abs(P.x-xm)<half+60*M;
      if(near&&(busy||still!==0)){ still=busy?1:0; let o=0; for(const S of spans){ for(let i=0;i<NS;i++){ pt(S,i/NS,q); pt(S,(i+1)/NS,q2);
          for(let r=0;r<4;r++){ const A=RING[r], B=RING[(r+1)%4], C=[[q,A],[q2,A],[q2,B],[q,A],[q2,B],[q,B]]; for(const [p,d] of C){ wp[o++]=p.x; wp[o++]=p.y+d[0]; wp[o++]=p.z+d[1]; } } } }
        wg.attributes.position.needsUpdate=true; }
      if(near){ you.set(P.x,(P.y||0)+.9*M,P.z).project(SHARED.cam); SHARED.cam.getWorldDirection(nd); cam0.copy(SHARED.cam.position);
        WIRES.poles.forEach((pl,i)=>{ q.set(pl.x,pl.y0+1*M,pl.z).project(SHARED.cam); q2.copy(pl.top).project(SHARED.cam); const dy=Math.abs(q.x-q2.x), w=Math.abs(q.x-you.x)<.07+dy, yy=you.y>Math.min(q.y,q2.y)&&you.y<Math.max(q.y,q2.y);
          const behind=new V3(P.x,0,P.z).sub(cam0).dot(nd)>new V3(pl.x,0,pl.z).sub(cam0).dot(nd)+.3*M, k=['x','y','z','w'][i], want=1; uF.value[k]+=(want-uF.value[k])*Math.min(1,dt*6); if(Math.abs(uF.value[k]-want)<.01)uF.value[k]=want; }); } };
    WIRES.tick(0,{x:xm,z:zp,y:0});
    WIRES.cost={tris:Pp.length/9+NV/3,spans:spans.length};
    SYS.add('dress',(dt,p)=>{ WIRES.tick(dt||0,p||pos); },'069b-poles'); }
  window.WIRESDBG=()=>({x:XS.map(x=>+x.toFixed(1)),z:+zp.toFixed(2),perch:WIRES.perch.map(p=>[+p.x.toFixed(1),+p.y.toFixed(2),+p.z.toFixed(1),p.on|0]),cost:WIRES.cost});
}
export {WIRES};
