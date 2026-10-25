// THE WEEDS: WEEDS grows the grass (the treetop grass: over every lawn one level sheet at ankle height, flat all the way across, faceted like a treetop; tufts only at the feet of things), the weeds and the gold reeds, bending them as things move through.
import {SHARED, THREE} from './003-shx.js';
import {NPCS, PARK, POND, pos, RAG, ROOMS, st, UI, W3, WEEDS} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {CASTLE, FIX, MAPG, MODS, SOL, STORE, SYS, TILE} from './006-map-pre.js';
import {GCAVE} from './060-cave.js';
import {FOUNT} from './060a-fount.js';
import {RINGX} from './065-ring.js';
import {STALL} from './081-stalls.js';

WEEDS.movers=[...Array(8)].map(()=>new THREE.Vector4(0,0,0,0)); WEEDS.UMV={value:WEEDS.movers};
WEEDS.PART=(T,k)=>'{ vec4 w0=modelMatrix*instanceMatrix*vec4(transformed,1.); vec3 dw=vec3(0.); for(int i=0;i<8;i++){ vec4 m=uMv[i]; if(m.w<.5)continue; vec2 d=w0.xz-m.xy; float l=length(d), f=1.-l/m.z; if(f<=0.)continue; f=f*f*(3.-2.*f); dw.xz+=d/max(l,.001)*f*'+(.22*T).toFixed(4)+'; dw.y-=f*'+(.05*T).toFixed(4)+'; } transformed+=inverse(mat3(instanceMatrix))*dw*'+k+'; }';
WEEDS.clear=r=>{ (WEEDS.clr=WEEDS.clr||[]).push(r); if(WEEDS.lawnDrop)WEEDS.lawnDrop(r); const M=new THREE.Matrix4(), Z=new THREE.Matrix4().makeScale(0,0,0); for(const me of WEEDS.meshes||[]){ let n=0; for(let i=0;i<me.count;i++){ me.getMatrixAt(i,M); const x=M.elements[12], z=M.elements[14]; if(x>r[0]&&x<r[2]&&z>r[1]&&z<r[3]){ me.setMatrixAt(i,Z); n++; } } if(n)me.instanceMatrix.needsUpdate=true; } };
WEEDS.GV=['','GOLDEN WHEAT','GOLDEN TUSSOCK','DRY GOLD REEDS','GILDED GRASS'];
WEEDS.gold=()=>{ if(WEEDS.GP)return WEEDS.GP; const P=window.PARK; if(!P||P.ox==null||!P.brook||!P.campAt||typeof FOUNT==='undefined'||!FOUNT.S)return null;
  const T=TILE, X=x=>SHARED.BOD.XS(x+P.ox), Z=y=>SHARED.BOD.ZS(y+P.oy), [cx,cy,cr]=P.round, BK=P.brook, F=FOUNT, CF=P.campAt(), h=(a,b,c)=>{ const v=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return v-Math.floor(v); };
  const KEEP=[[cx+12.5-7,cy+11.5-7,cx+12.5+7,cy+11.5+7],[CASTLE.b[0]-P.ox-3,CASTLE.b[2]-P.oy-3,CASTLE.b[1]-P.ox+3,CASTLE.b[3]-P.oy+3],[CF.x-5,CF.y-5,CF.x+5,CF.y+5],...(typeof GCAVE!=='undefined'?GCAVE.keep(P):[]),...(window.GCAVE&&GCAVE.S?[(t=>[t.x-12,t.y-12,t.x+12,t.y+12])(GCAVE.S.tw)]:[])];
  const GT=[[(P.gate[0]+P.gate[1])/2,P.y0],...(P.egate?[[P.x1,(P.egate[0]+P.egate[1])/2]]:[]),...(P.wgate?[[P.x0,(P.wgate[0]+P.wgate[1])/2]]:[]),...(P.ngate?[[(P.ngate[0]+P.ngate[1])/2,P.y1]]:[])];
  const xa=Math.min(X(P.x0),X(P.x1)), xb=Math.max(X(P.x0),X(P.x1)), za=Math.min(Z(P.y0),Z(P.y1)), zb=Math.max(Z(P.y0),Z(P.y1));
  const SB=SOL.up.filter(b=>b[2]>xa&&b[0]<xb&&b[3]>za&&b[1]<zb), RB=(STORE.rooms||[]).filter(R=>R.walls&&R.x0!=null&&!(R.y0>=1)), SZ=STALL.zones||[];
  const ok=(x,y,r)=>{ if(x<P.x0+5+r||x>P.x1-5-r||y<P.y0+7+r||y>P.y1-5-r)return false;
    if(P.pd(x,y)<r+1.2||BK.wet(x,y,r+1.4)||F.lake(x,y)<r+2||F.ter(x,y)<r+1.5)return false;
    if(KEEP.some(b=>x>b[0]-r&&x<b[2]+r&&y>b[1]-r&&y<b[3]+r)||GT.some(([gx,gy])=>Math.hypot(x-gx,y-gy)<r+7))return false;
    const wx=X(x), wz=Z(y), m=(r+.4)*T; if(SB.some(b=>wx>b[0]-m&&wx<b[2]+m&&wz>b[1]-m&&wz<b[3]+m)||RB.some(b=>wx>b.x0-m&&wx<b.x1+m&&wz>b.z0-m&&wz<b.z1+m)||SZ.some(b=>wx>b[0]-m&&wx<b[2]+m&&wz>b[1]-m&&wz<b[3]+m))return false;
    return !(P.oaks||[]).some(o=>Math.hypot(o[0]-wx,o[1]-wz)<(r+o[2]*.55+2)*T); };
  const out=[]; for(let i=0;i<8000&&out.length<16;i++){ const v=out.length%4+1, r=1.5+1.1*h(i,1,3), x=P.x0+(P.x1-P.x0)*h(i,2,5), y=P.y0+(P.y1-P.y0)*h(i,3,7);
    if(!ok(x,y,r)||out.some(o=>Math.hypot(o.x-x,o.y-y)<o.r+r+9))continue; out.push({v,x,y,r,sd:h(i,4,9)*6.28,wx:X(x),wz:Z(y),wr:r*T}); }
  return WEEDS.GP=out; };
WEEDS.goldAt=(x,z)=>{ const G=WEEDS.GP||WEEDS.gold(); if(!G)return null; for(const p of G){ const dx=x-p.wx, dz=z-p.wz, b=p.wr*1.6; if(dx>b||dx<-b||dz>b||dz<-b)continue;
    const a=Math.atan2(dz,dx), d=Math.hypot(dx,dz)/(p.wr*(1+.2*Math.sin(3*a+p.sd)+.1*Math.sin(5*a+2*p.sd))); if(d<1.3)return [p.v,Math.max(0,Math.min(1,(1-d)/.3)),p]; } return null; };
WEEDS.init=()=>{ WEEDS.dbg=f=>f({FIX,SOL,TILE,MODS}); const T=TILE, hsh=(a,b,s)=>{ let h=(Math.floor(a)*374761393+Math.floor(b)*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const vn=(x,y,s)=>{ const xi=Math.floor(x), yi=Math.floor(y), fx=x-xi, fy=y-yi, u=fx*fx*(3-2*fx), v=fy*fy*(3-2*fy); return (hsh(xi,yi,s)*(1-u)+hsh(xi+1,yi,s)*u)*(1-v)+(hsh(xi,yi+1,s)*(1-u)+hsh(xi+1,yi+1,s)*u)*v; };
  const RW=RINGX.walls||[], B=(FIX.up||[]).filter(b=>b[5]-b[2]>.25*T&&b[2]<.6*T&&!RW.includes(b)), RB=ROOMS.boxes?ROOMS.boxes():[];
  const inside=(x,z)=>RB.some(b=>b.y0<1&&x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1)||(MODS.apts&&MODS.apts.inside&&MODS.apts.inside(x,z));
  const solidAt=(x,z)=>B.some(b=>x>b[0]&&x<b[3]&&z>b[1]&&z<b[4]);
  const gy=(x,z)=>MODS.bodega&&MODS.bodega.ground?MODS.bodega.ground(x,z):0;
  const TUFT=[], FLOW=[]; WEEDS.drop=[0,0,0];
  for(const b of B){ const [x0,z0,,x1,z1]=b; if(x1<SHARED.BOUND.x0||x0>SHARED.BOUND.x1||z1<SHARED.BOUND.z0||z0>SHARED.BOUND.z1)continue; const edges=[[x0,z0,x1,z0,0,-1],[x1,z0,x1,z1,1,0],[x1,z1,x0,z1,0,1],[x0,z1,x0,z0,-1,0]];
    for(const [ax,az,bx,bz,nx,nz] of edges){ const L=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.round(L/(.2*T)));
      for(let i=0;i<n;i++){ const t=(i+hsh(ax*7+i,az*3,11))/n, ex=ax+(bx-ax)*t, ez=az+(bz-az)*t, wild=vn(ex/(3*T),ez/(3*T),13);
        if(wild<.3||hsh(ex*13,ez*17,15)>wild*1.7){ WEEDS.drop[0]++; continue; }
        const out=(.03+hsh(ex*5,ez*9,17)*.12)*T, x=ex+nx*out, z=ez+nz*out; if(inside(x,z)||STALL.zones.some(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3])){ WEEDS.drop[1]++; continue; } if(solidAt(x,z)){ WEEDS.drop[2]++; continue; }
        const s=(.28+hsh(ex*3,ez*11,19)*.34)*T*(.7+.6*wild); TUFT.push([x,gy(x,z),z,s,hsh(ex,ez,21)*3.14,hsh(ez,ex,23)]);
        if(hsh(ex*19,ez*23,25)<.07)FLOW.push([x+(hsh(ex,ez,27)-.5)*.1*T,gy(x,z)+s*.4,z]); } } }
  let MT=null; WEEDS.meshes=[]; WEEDS.n=0; WEEDS.flowers=0;
  const put=(TUFT,FLOW)=>{ if(!TUFT.length)return; if(!MT){ const cv=document.createElement('canvas'); cv.width=cv.height=48; const g=cv.getContext('2d'), id=g.createImageData(48,48);
  for(let k=0;k<9;k++){ const bx=5+k*4.6+Math.sin(k*7)*1.5, lean=(hsh(k,1,41)-.5)*.7, top=Math.floor(48-(18+26*hsh(k,2,42))), wide=hsh(k,3,43)<.25;
    for(let y=top;y<48;y++){ const yy=47-y, px=bx+lean*yy, tt=yy/(47-top||1), w=(wide?3:2.2)*(1-tt*.7); for(let x=Math.floor(px-w);x<=Math.ceil(px+w);x++){ if(x<0||x>47||Math.abs(x-px)>w)continue; const i=(y*48+x)*4; id.data[i]=30+70*tt; id.data[i+1]=58+92*tt; id.data[i+2]=20+30*tt; id.data[i+3]=255; } } }
  g.putImageData(id,0,0); const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; tx.magFilter=THREE.NearestFilter;
  const card=new THREE.PlaneGeometry(1,1).translate(0,.5,0), c2=card.clone().rotateY(Math.PI/2), geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute([...card.attributes.position.array,...c2.attributes.position.array],3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute([...card.attributes.uv.array,...c2.attributes.uv.array],2));
  geo.setAttribute('normal',new THREE.Float32BufferAttribute(new Array(16).fill(0).flatMap(()=>[0,1,0]).slice(0,24),3)); geo.setIndex([0,2,1,2,3,1,4,6,5,6,7,5]);
  const mat=new THREE.MeshLambertMaterial({map:tx,alphaTest:.5,side:THREE.DoubleSide});
  mat.onBeforeCompile=sh=>{ sh.uniforms.uMv=WEEDS.UMV; sh.vertexShader='uniform vec4 uMv[8];\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n '+WEEDS.PART(T,'position.y')); };
  mat.customProgramCacheKey=()=>'weedsway'; MT={geo,mat}; } const {geo,mat}=MT;
  const CH=new Map(), cs=32*T; for(const t of TUFT){ const k=Math.floor(t[0]/cs)+','+Math.floor(t[2]/cs); if(!CH.has(k))CH.set(k,[]); CH.get(k).push(t); }
  const M=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new THREE.Vector3(0,1,0), col=new THREE.Color();
  for(const list of CH.values()){ const me=new THREE.InstancedMesh(geo,mat,list.length);
    list.forEach(([x,y,z,s,a,c],i)=>{ M.compose(new THREE.Vector3(x,y,z),q.setFromAxisAngle(up,a),new THREE.Vector3(s*1.1,s*.5,s*1.1)); me.setMatrixAt(i,M); me.setColorAt(i,col.setHSL(.24+c*.08,.35+c*.25,.42+c*.2)); });
    me.computeBoundingSphere(); me.receiveShadow=true; scene.add(me); WEEDS.meshes.push(me); }
  if(FLOW.length){ const fg=new THREE.OctahedronGeometry(.05*T,0), fmt=new THREE.MeshLambertMaterial({color:0xf0cc30,emissive:0x2a1c00}), FC=new Map();
    for(const f of FLOW){ const k=Math.floor(f[0]/cs)+','+Math.floor(f[2]/cs); if(!FC.has(k))FC.set(k,[]); FC.get(k).push(f); }
    for(const list of FC.values()){ const fm=new THREE.InstancedMesh(fg,fmt,list.length); list.forEach(([x,y,z],i)=>{ M.compose(new THREE.Vector3(x,y,z),q.identity(),new THREE.Vector3(1,1,1)); fm.setMatrixAt(i,M); }); fm.computeBoundingSphere(); scene.add(fm); WEEDS.meshes.push(fm); } }
  WEEDS.n+=TUFT.length; WEEDS.flowers+=FLOW.length; };
  put(TUFT,FLOW); WEEDS.more=L=>put(L.map(([px,py,r])=>{ const x=SHARED.BOD.XS(px+PARK.ox), z=SHARED.BOD.ZS(py+PARK.oy); return [x,gy(x,z),z,(.22+.24*r)*T,r*31%6.28,(r*7)%1]; }),[]); };
WEEDS.lawnInit=()=>{ const T=TILE, CS=8*T, N=16, CELL=CS/N, MG=4, W=N+2*MG, hsh=(a,b,s)=>{ let h=(Math.floor(a*97)*374761393+Math.floor(b*89)*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const LC=(r,g,b)=>{ const c=new THREE.Color().setRGB(r/255,g/255,b/255,THREE.SRGBColorSpace); return 'vec3('+c.r.toFixed(4)+','+c.g.toFixed(4)+','+c.b.toFixed(4)+')'; }, MV=WEEDS.movers, NT=12, TR=[...Array(NT)].map(()=>new THREE.Vector4(0,0,0,0)), TK=[...Array(NT)].map(()=>new THREE.Vector4(0,0,0,0)), TT=new Float64Array(NT).fill(-1e9), TM=new Int8Array(NT), F=x=>(x*T).toFixed(4);
  const MODE=[[.7,.85,3,0,0],[1.05,.9,1.5,1,1],[.5,.32,1,0,0],[1.5,.95,3,0,0],[1.15,1,5,0,0]]; WEEDS.UTR={value:TR}; WEEDS.UTK={value:TK};
  const mat=new THREE.MeshLambertMaterial({color:new THREE.Color().setRGB(92/255,186/255,84/255,THREE.SRGBColorSpace)});
  const HEAD='attribute float aH; attribute float aT; attribute vec3 aG; attribute float aL; attribute float aC; attribute float aS; varying vec3 vG; varying vec2 vB; uniform vec4 uMv[8]; uniform vec4 uTr[12]; uniform vec4 uTk[12]; uniform vec4 uSwAt; uniform float uSw, uWk;\n'
    +'void tgA(vec2 d, float r, float w, vec4 q, inout float k, inout vec2 pu, inout float rp){ float l=length(d), e=l-r, bd=clamp(1.-abs(e)/'+F(.45)+',0.,1.); k=max(k,w*clamp(-e/'+F(.2)+',0.,1.)); pu+=d/max(l,.001)*q.x*w*bd; rp+=q.y*sin(e*'+(6.2832/(.5*T)).toFixed(4)+'-q.z*12.)*bd; }\n'
    +'float tgP(vec2 p, out vec2 pu, out float rp){ float k=0.; pu=vec2(0.); rp=0.; for(int i=1;i<8;i++){ vec4 m=uMv[i]; if(m.w<.5)continue; k=max(k,clamp(('+F(.7)+'-length(p-m.xy))/'+F(.2)+',0.,1.)); }\n'
    +' for(int i=0;i<12;i++){ vec4 a=uTr[i]; if(a.w<=0.)continue; vec4 q=uTk[i]; vec2 d=p-a.xy; tgA(d,a.z,a.w,q,k,pu,rp);\n'
    +'  if(i<11){ vec4 b=uTr[i+1]; if(b.w>0.){ vec2 ab=b.xy-a.xy; float t=clamp(dot(d,ab)/max(dot(ab,ab),1e-4),0.,1.); tgA(d-ab*t,mix(a.z,b.z,t),mix(a.w,b.w,t),q,k,pu,rp); } } }\n'
    +' pu/=max(1.,length(pu)); rp=clamp(rp,-1.,1.); return k; }\n';
  mat.onBeforeCompile=sh=>{ WEEDS.shader=sh; Object.assign(sh.uniforms,{uMv:WEEDS.UMV,uTr:WEEDS.UTR,uTk:WEEDS.UTK,uSw:PARK.sway,uWk:PARK.windK,uSwAt:PARK.swayAt});
    sh.vertexShader=HEAD+sh.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n vec3 tgW=(modelMatrix*vec4(position,1.)).xyz; vec2 tgU, tgD; float tgR, tgS, tgK=tgP(tgW.xz,tgU,tgR); if(aT>.5){ vec2 tgG=vec2(tgP(tgW.xz+vec2('+F(.15)+',0.),tgD,tgS),tgP(tgW.xz+vec2(0.,'+F(.15)+'),tgD,tgS))-tgK; objectNormal=normalize(objectNormal+vec3(tgG.x,0.,tgG.y)*aH*.9/'+F(.15)+'); }')
    .replace('#include <begin_vertex>','#include <begin_vertex>\n vG=aG; vB=vec2(aH,aC); { transformed.xz+=tgU*(aH*.3+aL*.45); transformed.y+=tgR*aH*.15-aH*tgK*(aT>1.5?.12:.55); }\n { float sr=1.-smoothstep(uSwAt.w*.85,uSwAt.w,distance(tgW.xz,uSwAt.xz)), ph=(tgW.x*.31+tgW.z*.17)/'+F(1)+', g=(.6+.4*sin(uSw*.37+ph*.5))*uWk*sr, s1=sin(uSw*1.3-ph*1.1+aS*2.)*.6+sin(uSw*2.3-ph*2.2+1.3+aS)*.3, b=aH*aH/'+F(.6)+'*(1.-tgK)*(.35+.65*max(aC,0.)); transformed.xz+=vec2(cos(aS),sin(aS))*s1*b*.2*g; transformed.y-=abs(s1)*b*.1*g*step(aT,1.5); }')
    .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n if(aC>=0.&&aT<.5)objectNormal=vec3(0.,1.,0.);').replace('#include <shadowmap_vertex>',THREE.ShaderChunk.shadowmap_vertex.replace(/(directional|point)LightShadows\[ i \]\.shadowNormalBias/g,'($&+.12)'));
    sh.fragmentShader='uniform float uSw; varying vec3 vG; varying vec2 vB;\n'+sh.fragmentShader.replace('#include <normal_fragment_begin>',THREE.ShaderChunk.normal_fragment_begin.replace(/normal\s*\*?=\s*normal\s*\*\s*faceDirection;|normal\s*\*=\s*faceDirection;/g,'')).replace('#include <color_fragment>','#include <color_fragment>\n if(vB.y>1.5)diffuseColor.rgb*=vB.y>2.2?vec3(.8,.87,.6):vec3(1.,1.09,.75); else { diffuseColor.rgb*=lfn(vWP.xz*.031+7.)>.6?1.07:1.; if(vB.y>=0.)diffuseColor.rgb*=mix(vec3(.74,.84,.82),vec3(1.34,1.34,.9),clamp(vB.x/'+F(.6)+',0.,1.)*.4+vB.y*.6)*mix(vec3(.9,.96,.84),vec3(1.06,1.03,.9),lfn(vWP.xz*.23+3.)); }'
      +' { int gv=int(vG.x+.5); if(vG.z>.5||gv>0&&vG.y>.42){ vec3 gc=gv==1?'+LC(222,184,92)+':gv==2?'+LC(201,140,46)+':gv==3?'+LC(208,172,86)+':'+LC(236,190,40)+';'
      +' if(vG.z>3.5)gc='+LC(255,246,200)+'; else if(vG.z>2.5)gc='+LC(238,222,170)+'; else if(vG.z>1.5)gc=gv==2?'+LC(232,200,120)+':'+LC(160,128,70)+'; else if(vG.z>.5)gc='+LC(186,132,44)+';'
      +' diffuseColor.rgb=gc*(lfn(vWP.xz*.11+float(gv)*3.7)>.58?1.08:1.); } }')
      .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n { int gv=int(vG.x+.5); float tw=0.; if(vG.z>3.5){ float r=fract(sin(dot(floor(vWP.xz/'+F(.3)+'),vec2(127.1,311.7)))*43758.5453); tw=step(.45,fract(uSw*.4+r*7.)); }'
      +' else if(gv==4&&vG.y>.42&&vG.z<.5){ float r=fract(sin(dot(floor(vWP.xz/'+F(.08)+'),vec2(12.9898,78.233)))*43758.5453); tw=step(.965,r)*step(.7,fract(uSw*.5+r*13.)); } totalEmissiveRadiance+=vec3(1.,.82,.4)*(tw*.9+(vG.z>3.5?.35:0.)); }'); };
  mat.customProgramCacheKey=()=>'treetops2'; mat.side=THREE.DoubleSide;
  const seg=(px,pz,ax,az,bx,bz)=>{ const ux=bx-ax, uz=bz-az, t=Math.max(0,Math.min(1,((px-ax)*ux+(pz-az)*uz)/Math.max(ux*ux+uz*uz,1e-4))); return [Math.hypot(px-ax-ux*t,pz-az-uz*t),t]; };
  WEEDS.pressAt=(x,z)=>{ '@later'; let k=0; const E=.2*T, c=(e,w)=>{ k=Math.max(k,w*Math.max(0,Math.min(1,-e/E))); };
    for(let i=1;i<8;i++){ const m=MV[i]; if(m.w>=.5)c(Math.hypot(x-m.x,z-m.y)-.7*T,1); }
    for(let i=0;i<NT;i++){ const a=TR[i]; if(a.w<=0)continue; c(Math.hypot(x-a.x,z-a.y)-a.z,a.w); const b=TR[i+1]; if(b&&b.w>0){ const [l,t]=seg(x,z,a.x,a.y,b.x,b.y); c(l-(a.z+(b.z-a.z)*t),a.w+(b.w-a.w)*t); } } return k; };
  let air0=false, stop0=0, px0=0, pz0=0; const modeNow=()=>{ const m=st.move, nm=m&&m.name, a=m&&m.def&&m.def.air; if(RAG.on||nm==='roll'||nm==='fall')return 4; if(UI.fly||a&&m.t>=a.t0&&m.t<a.t0+a.T)return -1; if(nm==='crouch')return 2; return st.target>0&&st.run>.5?1:0; };
  const push=(md,now)=>{ for(let i=NT-1;i>1;i--){ TR[i].copy(TR[i-1]); TT[i]=TT[i-1]; TM[i]=TM[i-1]; } TR[1].set(pos.x,pos.z,0,0); TT[1]=now; TM[1]=md; };
  const WEEDS_moveTick0=()=>{ near.length=0; near.push([pos.x,pos.z,0]); for(const N of NPCS){ if(N.lv!=='up'||N.far||!N.st)continue; const small=!!(window.CREATS&&CREATS.includes(N)), gy=N.ground?N.ground(N.st.x,N.st.z):0, fly=N.g.position.y-gy>.35*T, tp=small&&!fly&&WEEDS.top?WEEDS.top(N.st.x,N.st.z):null, hide=tp!=null&&isFinite(tp);
      if(hide!==!!N._ing){ N._ing=hide; N.g.visible=!hide; } if(fly||!N.g.visible&&!hide)continue; const d=Math.hypot(N.st.x-pos.x,N.st.z-pos.z); if(d<14*T)near.push([N.st.x,N.st.z,d,small]); }
    near.sort((a,b)=>a[2]-b[2]); for(let i=0;i<8;i++){ const n=near[i]; if(n)MV[i].set(n[0],n[1],n[3]?.3*T:.55*T,n[3]?.6:1); else MV[i].w=0; }
    const now=performance.now()/1e3, up=SHARED.LVL==='up', md=up?modeNow():-1, air=md<0&&!!(st.move&&st.move.def&&st.move.def.air);
    if(Math.hypot(pos.x-TR[0].x,pos.z-TR[0].y)>3*T||!up)TT.fill(-1e9);
    if(air0&&!air&&up)push(3,now); else if(md>=0&&(Math.hypot(pos.x-TR[1].x,pos.z-TR[1].y)>.5*T||TT[1]<0||TM[1]!==md&&TM[1]!==3))push(md,now); air0=air;
    if(st.target>0||Math.hypot(pos.x-px0,pos.z-pz0)>.02*T||md!==0)stop0=now; px0=pos.x; pz0=pos.z; TR[0].set(pos.x,pos.z,0,0); TT[0]=md<0?-1e9:now; TM[0]=Math.max(0,md);
    for(let i=0;i<NT;i++){ const M=MODE[TM[i]], age=now-TT[i]; TR[i].z=M[0]*T; TR[i].w=M[1]*Math.max(0,Math.min(1,1.6*(1-age/M[2]))); TK[i].set(M[3],M[4]*Math.max(0,1-age/.7),Math.min(age,9),0); }
    { let f=Math.max(0,Math.min(1,(now-stop0-.6)/2.2)); f=f*f*(3-2*f); if(f>0){ TR[0].z+=(.28*T-TR[0].z)*f; TR[0].w*=1-.45*f; } } };
  const near=[]; WEEDS.moveTick=(...a)=>{ const r=WEEDS_moveTick0(...a); SYS.run('weedsMove'); return r; };
  const skip=o=>o.isInstancedMesh||o.isSkinnedMesh||o.isPoints||o.isSprite||o.isLine||(o.material&&(o.material.visible===false||o.material.isMeshToonMaterial||o.material.transparent||o.material.depthWrite===false||o.material.side===THREE.BackSide));
  const CH=new Map(); WEEDS.chunks=CH; WEEDS.lawnN=0; const clr=WEEDS.clr||(WEEDS.clr=[]);
  const RT=new THREE.WebGLRenderTarget(W,W,{depthBuffer:true}), CAM=new THREE.OrthographicCamera(-CS/2-MG*CELL,CS/2+MG*CELL,CS/2+MG*CELL,-CS/2-MG*CELL,.1,80*T), PIX=new Uint8Array(W*W*4);
  const VS='varying float vY; void main(){ vec4 w=modelMatrix*vec4(position,1.);'+'\n#ifdef USE_INSTANCING\n w=modelMatrix*instanceMatrix*vec4(position,1.);\n#endif\n vY=w.y; gl_Position=projectionMatrix*viewMatrix*w; }';
  const M0=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:'varying float vY; void main(){ gl_FragColor=vec4(0.); }',side:THREE.DoubleSide});
  const M1=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:'varying float vY; void main(){ gl_FragColor=vec4(1.,clamp((vY+.5)/4.,0.,1.),0.,1.); }',side:THREE.DoubleSide});
  const PS=24*T, KINDS=['flat','roll','little','big','giant','bigflat','tuft'];
  const vn=(x,z,s)=>{ const ix=Math.floor(x), iz=Math.floor(z), fx=x-ix, fz=z-iz, u=fx*fx*(3-2*fx), v=fz*fz*(3-2*fz), h=(a,b)=>hsh(a/97,b/89,s);
    return (h(ix,iz)*(1-u)+h(ix+1,iz)*u)*(1-v)+(h(ix,iz+1)*(1-u)+h(ix+1,iz+1)*u)*v; };
  const lump=(x,z)=>{ const S=.78*T, gx=Math.floor(x/S), gz=Math.floor(z/S); let b=0; for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){ const a=gx+i, c=gz+j, px=(a+.15+.7*hsh(a,c,411))*S, pz=(c+.15+.7*hsh(c,a,412))*S, r=S*(.7+.35*hsh(a,c,413)), d=((x-px)**2+(z-pz)**2)/(r*r); if(d<1)b=Math.max(b,Math.sqrt(1-d)*(.8+.2*hsh(c,a,414))); } return b; };
  const CPH=.27*T, SH=.35*T;   // the old canopy's height (the reeds and tufts stand by it); the lawn sheet's height, to your ankles
  const gat=(x,z)=>WEEDS.goldAt?WEEDS.goldAt(x,z):null;
  const WK=[3,2,2,1.5,1,1.5,3], WS=WK.reduce((a,b)=>a+b,0), pickK=r=>{ r*=WS; for(let i=0;i<WK.length;i++)if((r-=WK[i])<0)return KINDS[i]; return 'flat'; };
  const inPark=(x,z,m=0)=>{ if(typeof PARK==='undefined'||PARK.ox==null)return false; const xa=SHARED.BOD.XS(PARK.x0+PARK.ox+m), xb=SHARED.BOD.XS(PARK.x1+PARK.ox-m), za=SHARED.BOD.ZS(PARK.y0+PARK.oy+m), zb=SHARED.BOD.ZS(PARK.y1+PARK.oy-m);
    return x>Math.min(xa,xb)&&x<Math.max(xa,xb)&&z>Math.min(za,zb)&&z<Math.max(za,zb); };
  WEEDS.inPark=inPark;
  const deep=(x,z)=>{ '@later'; if(typeof PARK==='undefined'||PARK.ox==null)return 0; const tx=x/T, tz=z/T, xa=SHARED.BOD.XS(PARK.x0+PARK.ox)/T, xb=SHARED.BOD.XS(PARK.x1+PARK.ox)/T, za=SHARED.BOD.ZS(PARK.y0+PARK.oy)/T, zb=SHARED.BOD.ZS(PARK.y1+PARK.oy)/T;
    return Math.min(tx-Math.min(xa,xb),Math.max(xa,xb)-tx,tz-Math.min(za,zb),Math.max(za,zb)-tz)+10*(vn(tx/11,tz/11,97)-.5); };
  WEEDS.deep=deep;
  const patch=(x,z)=>{ const k=patch0(x,z); if(k==='flat'||k==='tuft')return k; const d=inPark(x,z)?deep(x,z):0;
    if(d<14)return k==='roll'||k==='bigflat'?'flat':'tuft'; if(d<28&&(k==='big'||k==='giant'))return k==='big'?'little':'roll'; return k; };
  WEEDS.mushAt=(x,z)=>vn(x/T/13,z/T/13,311)>.7;
  const patch0=(x,z)=>{ const tx=x/T, tz=z/T, wx=tx+16*(vn(tx/18,tz/18,91)-.5)+5*(vn(tx/6,tz/6,93)-.5), wz=tz+16*(vn(tx/18,tz/18,92)-.5)+5*(vn(tx/6,tz/6,94)-.5), PSt=PS/T, gx=Math.floor(wx/PSt), gz=Math.floor(wz/PSt);
    let d1=1e18, d2=1e18, k1='flat', k2='flat'; for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){ const a=gx+i, b=gz+j, px=(a+hsh(a,b,71))*PSt, pz=(b+hsh(b,a,72))*PSt, d=(wx-px)**2+(wz-pz)**2, k=pickK(hsh(a,b,73));
      if(d<d1){ d2=d1; k2=k1; d1=d; k1=k; } else if(d<d2){ d2=d; k2=k; } }
    let kind=Math.sqrt(d2)-Math.sqrt(d1)<3.5*hsh(tx*2,tz*2,95)?k2:k1;
    const isl=vn(tx/2.6,tz/2.6,96); if(isl>.8)kind=kind==='tuft'?'flat':'tuft';
    return kind; };
  WEEDS.kindAt=patch;
  const stalks=(x0,z0,G,I,ci,P,AH,AT,AG,IX)=>{ '@later'; const V3=THREE.Vector3, tri=(a,b,c,o,g,v,pt)=>{ const n=new V3().subVectors(b,a).cross(new V3().subVectors(c,a)), m=new V3().add(a).add(b).add(c).multiplyScalar(1/3); if(n.dot(m.sub(o))<0)[b,c]=[c,b];
      for(const q of [a,b,c]){ IX.push(P.length/3); P.push(q.x,q.y,q.z); AH.push(Math.max(0,q.y-g)); AT.push(0); AG.push(v,1,pt); } };
    const spin=(x,y,z,y0,y1,r,n,lx,lz,g,v,pt,mid=.5)=>{ const A=new V3(x+lx*(y1-y),y1,z+lz*(y1-y)), B=new V3(x+lx*(y0-y),y0,z+lz*(y0-y)), ym=y0+(y1-y0)*mid, R=[], o=new V3(x+lx*(ym-y),ym,z+lz*(ym-y)), a0=hsh(x,z,611)*6.28;
      for(let k=0;k<n;k++){ const a=a0+k/n*6.28; R.push(new V3(o.x+Math.cos(a)*r,ym,o.z+Math.sin(a)*r)); } for(let k=0;k<n;k++){ tri(A,R[k],R[(k+1)%n],o,g,v,pt); tri(B,R[(k+1)%n],R[k],o,g,v,pt); } };
    const prism=(x,y,z,y0,y1,r,lx,lz,g,v,pt)=>{ const ym=(y0+y1)/2, o=new V3(x+lx*(ym-y),ym,z+lz*(ym-y)), at=(yy,a)=>new V3(x+lx*(yy-y)+Math.cos(a)*r,yy,z+lz*(yy-y)+Math.sin(a)*r), a0=hsh(z,x,613)*6.28;
      for(let k=0;k<3;k++){ const a=a0+k*2.094, b=a+2.094, p=at(y0,a), q=at(y0,b), u=at(y1,a), w=at(y1,b); tri(p,q,w,o,g,v,pt); tri(p,w,u,o,g,v,pt); } };
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const c=ci(i,j); if(!I[c])continue; const x=x0+(i+.2+.6*hsh(i+x0,j+z0,601))*CELL, z=z0+(j+.2+.6*hsh(j+z0,i+x0,602))*CELL, gd=gat(x,z); if(!gd||gd[1]<.7)continue;
      const v=gd[0], r=hsh(x,z,603), g=G[c], top=g+CPH*.8, la=hsh(z,x,604)*6.28, ll=.12+.25*hsh(x,z,605), lx=Math.cos(la)*ll, lz=Math.sin(la)*ll;
      if(v===1&&r<.42)spin(x,top,z,top-.06*T,top+(.24+.1*hsh(x,z,606))*T,.045*T,4,lx,lz,g,1,1,.4);
      else if(v===2&&r<.07)for(let k=0;k<3;k++){ const a=la+k*2.1, f=.35+.2*hsh(x,z,620+k); prism(x,top,z,top-.25*T,top+(.28+.22*hsh(z,x,630+k))*T,.018*T,Math.cos(a)*f,Math.sin(a)*f,g,2,2); }
      else if(v===3&&r<.11){ const yt=top+(.45+.3*hsh(x,z,607))*T; prism(x,top,z,top-.3*T,yt,.022*T,lx*.5,lz*.5,g,3,2); spin(x,top,z,yt-.04*T,yt+.26*T,.05*T,3,lx*.5,lz*.5,g,3,3,.35); }
      else if(v===4&&r<.09)spin(x,top,z,top-.02*T,top+.13*T,.05*T,4,0,0,g,4,4,.5); } };
  const build=(cx,cz)=>{ const x0=cx*CS, z0=cz*CS, LW=[MODS.land,typeof POND!=='undefined'?POND.hills:null].filter(Boolean), hid=[];
    scene.traverseVisible(o=>{ if((o.isMesh||o.isPoints||o.isLine||o.isSprite)&&skip(o))hid.push(o); }); for(const g of [W3.group,...NPCS.map(N=>N.g)])if(g&&g.visible)hid.push(g); for(const m of CH.values())if(m&&m.visible)hid.push(m); hid.forEach(o=>o.visible=false);
    const lm=LW.map(o=>o.layers.mask); LW.forEach(o=>o.layers.set(5));
    const rt0=renderer.getRenderTarget(), ac=renderer.autoClear, ov=scene.overrideMaterial, cc=renderer.getClearColor(new THREE.Color()), ca=renderer.getClearAlpha(), bg=scene.background, fg=scene.fog;
    CAM.position.set(x0+CS/2,40*T,z0+CS/2); CAM.up.set(0,0,-1); CAM.lookAt(x0+CS/2,0,z0+CS/2); CAM.updateMatrixWorld();
    renderer.setRenderTarget(RT); renderer.setClearColor(0,0); scene.background=null; scene.fog=null; renderer.autoClear=false; renderer.clear();
    CAM.layers.set(0); scene.overrideMaterial=M0; renderer.render(scene,CAM); CAM.layers.set(5); scene.overrideMaterial=M1; renderer.render(scene,CAM);
    renderer.readRenderTargetPixels(RT,0,0,W,W,PIX);
    scene.overrideMaterial=ov; renderer.setRenderTarget(rt0); renderer.autoClear=ac; renderer.setClearColor(cc,ca); scene.background=bg; scene.fog=fg;
    LW.forEach((o,i)=>o.layers.mask=lm[i]); hid.forEach(o=>o.visible=true);
    const G=new Float32Array(W*W), I=new Uint8Array(W*W), SQ=[], P=[], AH=[], AT=[], AG=[], IX=[], AS=[], UV=[], AN=[], ci=(i,j)=>(j+MG)*W+i+MG;
    for(let r=0;r<W;r++)for(let u=0;u<W;u++){ const k=(r*W+u)*4, i=u-MG, j=N+MG-1-r, x=x0+(i+.5)*CELL, z=z0+(j+.5)*CELL; if(PIX[k]<128||clr.some(q=>x>q[0]&&x<q[2]&&z>q[1]&&z<q[3]))continue; I[ci(i,j)]=1; G[ci(i,j)]=PIX[k+1]/255*4-.5; }
    for(let j=0;j<N;j+=2)for(let i=0;i<N;i+=2){ const c=ci(i,j); if(I[c])SQ.push(x0+(i+1)*CELL,G[c],z0+(j+1)*CELL); }
    const AL=[], AC=[];
    const blade=(x,g,z,ang,len,rise,w,h,c)=>{ const dx=Math.cos(ang), dz=Math.sin(ang), v=P.length/3, g0=g+.04*T; P.push(x-dz*w,g0,z+dx*w, x+dz*w,g0,z-dx*w, x+dx*len,g0+rise,z+dz*len); AH.push(0,0,h); AL.push(0,0,len); AT.push(0,0,0); AG.push(0,0,0,0,0,0,0,0,0); AC.push(c,c,c); IX.push(v,v+1,v+2); };
    // the lawn: one level sheet of grass at ankle height, flat all the way across, of irregular triangles each lit as a facet like a treetop's; at the lawn's edge it slopes down
    const N1=N+1, VI=new Int32Array(N1*N1).fill(-1), put=(x,y,z,h,c)=>{ P.push(x,y,z); AH.push(h); AT.push(2); AG.push(0,0,0); AL.push(0); AC.push(c); AS.push(.5); UV.push(0,0); AN.push(0,1,0); return P.length/3-1; };
    const top=(a,b)=>{ const k=b*N1+a; if(VI[k]>=0)return VI[k]; let g=0, n=0, ox=0, oz=0; for(const [di,dj] of [[-1,-1],[0,-1],[-1,0],[0,0]]){ const c=ci(a+di,b+dj); if(I[c]){ g+=G[c]; n++; ox+=di+.5; oz+=dj+.5; } }
      const f=n===1?.5:n===3?-.5:0, h=n===4?SH:SH*.35, jx=n===4?(hsh(x0+a,z0+b,971)-.5)*.7:0, jz=n===4?(hsh(z0+b,x0+a,972)-.5)*.7:0; return VI[k]=put(x0+(a+ox*f+jx)*CELL,g/n+h,z0+(b+oz*f+jz)*CELL,h,2); };
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){ if(!I[ci(i,j)])continue; const A=top(i,j), B=top(i+1,j), C=top(i,j+1), D=top(i+1,j+1), cr=(p,q,r)=>(P[q*3+2]-P[p*3+2])*(P[r*3]-P[p*3])-(P[q*3]-P[p*3])*(P[r*3+2]-P[p*3+2]);
      if(cr(A,C,B)>0&&cr(B,C,D)>0)IX.push(A,C,B,B,C,D); else IX.push(A,C,D,A,D,B); }
    const bx0=x0-1.5*T, bz0=z0-1.5*T, bx1=x0+CS+1.5*T, bz1=z0+CS+1.5*T;   // tufts scattered out from the foot of every small solid thing on the lawn (posts, rocks, logs, trunks), thickest against it
    for(const b of SOL.up){ if(b[2]<bx0||b[0]>bx1||b[3]<bz0||b[1]>bz1)continue; const w=b[2]-b[0], d=b[3]-b[1]; if(Math.max(w,d)>5*T||Math.min(w,d)<.05*T)continue; const per=2*(w+d), n=Math.ceil(per/(.22*T));
      for(let q=0;q<n;q++){ const u=q/n*per; let px,pz,nx,nz; if(u<w){ px=b[0]+u; pz=b[1]; nx=0; nz=-1; } else if(u<w+d){ px=b[2]; pz=b[1]+u-w; nx=1; nz=0; } else if(u<2*w+d){ px=b[2]-(u-w-d); pz=b[3]; nx=0; nz=1; } else { px=b[0]; pz=b[3]-(u-2*w-d); nx=-1; nz=0; }
        const r1=hsh(px,pz,531), r2=hsh(pz,px,532), dist=(.08+r1*r1*1.2)*T, x=px+nx*dist+(r2-.5)*.2*T, z=pz+nz*dist+(r2-.5)*.2*T; if(x<x0||x>=x0+CS||z<z0||z>=z0+CS||x>b[0]&&x<b[2]&&z>b[1]&&z<b[3])continue;
        const c=ci(Math.floor((x-x0)/CELL),Math.floor((z-z0)/CELL)); if(!I[c])continue; const s=.75+.55*(1-Math.min(1,dist/(1.2*T))), nb=3+Math.floor(r2*3);
        for(let k=0;k<nb;k++){ const a=hsh(x,z+k,533)*6.28, len=(.08+.1*hsh(x+k,z,534))*T*s, rise=(.22+.14*hsh(z,x+k,535))*T*s; blade(x,G[c]+CPH*.7,z,a,len,rise,.03*T*s,rise,.5+.3*r1); } } }
    if(!IX.length)return null; if(WEEDS.GP&&WEEDS.GP.some(p=>p.wx+p.wr*1.6>x0&&p.wx-p.wr*1.6<x0+CS&&p.wz+p.wr*1.6>z0&&p.wz-p.wr*1.6<z0+CS))stalks(x0,z0,G,I,ci,P,AH,AT,AG,IX);
    while(AL.length<AH.length){ AL.push(0); AC.push(-1); } while(AS.length<AH.length)AS.push(.5); while(UV.length<AH.length*2)UV.push(0,0); while(AN.length<AH.length*3)AN.push(0,1,0);   // the reeds take the plain colour and the lawn's sway
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('aH',new THREE.Float32BufferAttribute(AH,1)); geo.setAttribute('aT',new THREE.Float32BufferAttribute(AT,1)); geo.setAttribute('aG',new THREE.Float32BufferAttribute(AG,3)); geo.setAttribute('aL',new THREE.Float32BufferAttribute(AL,1)); geo.setAttribute('aC',new THREE.Float32BufferAttribute(AC,1)); geo.setAttribute('aS',new THREE.Float32BufferAttribute(AS,1));
    geo.setAttribute('aN',new THREE.Float32BufferAttribute(AN,3)); geo.setIndex(IX); geo.computeVertexNormals(); const gf=geo.toNonIndexed(); geo.dispose(); { const nr=gf.attributes.normal.array, an=gf.attributes.aN.array, at=gf.attributes.aT.array; for(let v=0;v<at.length;v++)if(at[v]>1.5){ nr[v*3]=an[v*3]; nr[v*3+1]=an[v*3+1]; nr[v*3+2]=an[v*3+2]; } gf.deleteAttribute('aN'); { for(let v=0;v<at.length;v+=3){   // each triangle of the sheet lit as its own facet, tilted a little, like a crown's
 if(at[v]<1.5)continue; const t=v/3+x0*7.31+z0*3.17, th=hsh(t,1,964)*6.28, tl=.18+.4*hsh(t,2,965), nx=Math.cos(th)*tl, nz=Math.sin(th)*tl, m=Math.hypot(nx,1,nz); for(let q=0;q<3;q++){ nr[(v+q)*3]=nx/m; nr[(v+q)*3+1]=1/m; nr[(v+q)*3+2]=nz/m; } } } } const me=new THREE.Mesh(gf,mat); me.receiveShadow=true; me.tri=IX.length/3; me.sq=SQ; me.top=(x,y,z)=>y+SH; me.I=I; me.G=G; me.x0=x0; me.z0=z0; me.dispose=()=>gf.dispose();
    MAPG.bodega.add(me); WEEDS.lawnN+=me.tri; return me; };
  const drop=k=>{ const me=CH.get(k); if(me){ MAPG.bodega.remove(me); me.dispose(); WEEDS.lawnN-=me.tri; } CH.delete(k); SYS.run('weedsDrop',k); };
  WEEDS.top=(x,z)=>{ const k=Math.floor(x/CS)+','+Math.floor(z/CS); if(!CH.has(k))return undefined; const me=CH.get(k); if(!me)return null; const i=Math.floor((x-me.x0)/CELL), j=Math.floor((z-me.z0)/CELL); if(i<0||j<0||i>=N||j>=N)return null; const c=(j+MG)*W+i+MG; return me.I[c]?me.G[c]+SH:null; };
  WEEDS.lawnDrop=r=>{ for(const k of [...CH.keys()]){ const [a,b]=k.split(',').map(Number); if(r[2]>a*CS-MG*CELL&&r[0]<(a+1)*CS+MG*CELL&&r[3]>b*CS-MG*CELL&&r[1]<(b+1)*CS+MG*CELL)drop(k); } };
  let busy=0, next=0; WEEDS.lawnTick=()=>{ if(SHARED.LVL!=='up'||(ROOMS&&ROOMS.cur)||STORE.rooms&&STORE.rooms.some(R=>R.inside(pos.x,pos.z)))return; const pcx=Math.floor(pos.x/CS), pcz=Math.floor(pos.z/CS);
    for(const k of [...CH.keys()]){ const [a,b]=k.split(',').map(Number); if(Math.max(Math.abs(a-pcx),Math.abs(b-pcz))>3)drop(k); }
    let best=null, bd=1e9; for(let b=-2;b<=2;b++)for(let a=-2;a<=2;a++){ const k=(pcx+a)+','+(pcz+b); if(CH.has(k))continue; const d=a*a+b*b; if(d<bd){ bd=d; best=[pcx+a,pcz+b,k]; } }
    if(best&&performance.now()>=next){ const t0=performance.now(); const gb=build(best[0],best[1]); CH.set(best[2],gb); if(gb)SYS.run('weedsAdd',best[2],gb); busy=performance.now()-t0; WEEDS.busy=busy; next=performance.now()+Math.max(120,busy*3); } };
  SYS.add('life',(dt)=>{ WEEDS.lawnTick(); WEEDS.moveTick(); },'140-weeds'); };
