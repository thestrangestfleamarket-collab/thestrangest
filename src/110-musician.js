// THE MUSICIAN: MUS, the street musician, and the shared figure makers (musBody, figureMesh) the players use.
import {SHARED, THREE} from './003-shx.js';
import {LEVELS, MUS, NPCS, pos, SKY, SND, UI, W3} from './003b-systems.js';
import {PPU, renderer, RES, resize, RESL, RESMAX, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {ASTEP, MAPG, MODS, STORE, TILE, ZU} from './006-map-pre.js';
import {SOUND} from './091-sfx.js';
import {GT, GTA, gtAudio, gtMute, gtPlay, GTWR} from './106-game-play-3-guitar-1-body.js';
import {GTBEAT, GTEND, GTEV, gtNext, GTS, gtSet} from './108-game-play-3-guitar-2-tunes.js';
import {GTF, gtFing, GTH, GTPOLE, gtPose, NPCARMS, NPCFING, npcSpring} from './109-game-play-3-guitar-3-hands.js';
Object.assign(MUS,{shelf:true,tick:()=>{}}); STORE.MUS=MUS;
function musBody(){ const R=RIG; if(!musBody.FG){ R.farOnly(false); R.fine(true); const J=R.build(R.walkPose({ph:0,w:0},null),null).J, FG=R.shell(J,0).filter(p=>/^fing\d\d[LR]$/.test(p.n)); R.fine(false);
    const around=(ps,m)=>{ const b=[1e9,-1e9,1e9,-1e9,1e9,-1e9]; for(const p of ps){ b[0]=Math.min(b[0],p.x-m); b[1]=Math.max(b[1],p.x+m); b[2]=Math.min(b[2],p.y-m); b[3]=Math.max(b[3],p.y+m); b[4]=Math.min(b[4],p.z-m); b[5]=Math.max(b[5],p.z+m); } return b; };
    for(const p of FG){ const f=/^fing(\d)(\d)([LR])$/.exec(p.n); p.bb=around([J['k'+f[1]+f[2]+f[3]],J['k'+f[1]+(+f[2]+1)+f[3]]],1); p.step=.12; p.cell=.12; p.share=p; }
    musBody.FG=FG; musBody.J=J; }
  const own=W3.pcs.map((p,i)=>W3.HIDE[i]||/^fing/.test(p.n)?null:Object.assign({},p,{e:i,share:p})).filter(Boolean);
  return {PCS:own.concat(musBody.FG.map(p=>Object.assign({},p))),J:musBody.J}; }
const MUSGEO=new Map(), MUSNP=180;
function figureMesh(PCS,key){ const NP=Math.max(MUSNP,PCS.length), PM={value:Array.from({length:NP},()=>new THREE.Matrix4().makeScale(0,0,0))};
  if(!PCS.ALL){ const geos=PCS.map((P,i)=>{ const fine=P.step<1||/^(head|hair|beard|brow|eye|nose|ear|mouth)/.test(P.n), k=P.share||P; let g0=MUSGEO.get(k); if(!g0){ g0=P.box?musBox(P):W3.meshOf(P,P.step||(fine?.5:1),fine,null); if(P.share)MUSGEO.set(k,g0); }
    const g=new THREE.BufferGeometry(), n=g0.attributes.position.count; for(const a of ['position','normal','c1','mat'])g.setAttribute(a,g0.attributes[a]);
    if(P.recol){ const c=new Float32Array(n*3), mt=g0.attributes.mat.array; for(let j=0;j<n;j++){ const r=W3.ramp[P.recol(mt[j])]||W3.ramp[mt[j]]; c.set([r[1].r,r[1].g,r[1].b],j*3); } g.setAttribute('c1',new THREE.BufferAttribute(c,3)); }
    g.setAttribute('pidx',new THREE.BufferAttribute(new Float32Array(n).fill(i),1)); return g; });
  const all=new THREE.BufferGeometry(); for(const k of ['position','normal','c1','pidx']){ const sz=geos[0].attributes[k].itemSize, arr=new Float32Array(geos.reduce((a,g)=>a+g.attributes[k].array.length,0)); let o=0; for(const g of geos){ arr.set(g.attributes[k].array,o); o+=g.attributes[k].array.length; } all.setAttribute(k,new THREE.BufferAttribute(arr,sz)); }
  all.setAttribute('color',all.attributes.c1); PCS.ALL=all; PCS.PER=geos.map((g,i)=>[PCS[i].n,g.attributes.position.count/3]); }
  const all=PCS.ALL;
  const MOVE=`attribute float pidx; uniform mat4 uPM[${NP}];`, AT_=`mat4 PM=uPM[int(pidx+0.5)];`;
  const mat=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:W3.GP,side:THREE.DoubleSide});
  mat.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <beginnormal_vertex>',AT_+' vec3 objectNormal=mat3(PM)*normal;').replace('#include <begin_vertex>','vec3 transformed=(PM*vec4(position,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(vNormal); vec3 nonPerturbedNormal=normal;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*0.16;'); };
  mat.customProgramCacheKey=()=>'mus'+NP;
  const dist=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dist.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; dist.customProgramCacheKey=()=>'musdist'+NP;
  const depth=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}); depth.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; depth.customProgramCacheKey=()=>'musdepth'+NP;
  const me=new THREE.Mesh(all,mat); me.customDistanceMaterial=dist; me.customDepthMaterial=depth; me.castShadow=true; me.receiveShadow=true; me.frustumCulled=false;
  const M=(F,out)=>out.set(F.x.x,F.y.x,F.z.x,F.o.x, F.x.y,F.y.y,F.z.y,F.o.y, F.x.z,F.y.z,F.z.z,F.o.z, 0,0,0,1);
  return {me,PM,tris:all.attributes.position.count/3,per:PCS.PER,set:(i,F)=>{ M(F,PM.value[i]); const p=PCS[i], E=p.E!==undefined?p.E:p.e!=null&&W3.E&&W3.E[p.e]; if(E)W3.applyE(PM.value[i],E,F.o); }}; }
function musBox(P){ const [cx,cy,cz,hx,hy,hz]=P.box, F=P.F0, g=new THREE.BoxGeometry(2*hx,2*hy,2*hz).toNonIndexed(), p=g.attributes.position, nn=g.attributes.normal, n=p.count, mi=RIG.MATS.indexOf(P.m), r=W3.ramp[mi];
  const pos=new Float32Array(n*3), nor=new Float32Array(n*3), c1=new Float32Array(n*3), d=(x,y,z,v)=>x*v.x+y*v.y+z*v.z;
  for(let i=0;i<n;i++){ const x=p.getX(i)+cx-F.o.x, y=p.getY(i)+cy-F.o.y, z=p.getZ(i)+cz-F.o.z, a=nn.getX(i), b=nn.getY(i), c=nn.getZ(i);
    pos.set([d(x,y,z,F.x),d(x,y,z,F.y),d(x,y,z,F.z)],i*3); nor.set([d(a,b,c,F.x),d(a,b,c,F.y),d(a,b,c,F.z)],i*3); c1.set([r[1].r,r[1].g,r[1].b],i*3); }
  const o=new THREE.BufferGeometry(); o.setAttribute('position',new THREE.BufferAttribute(pos,3)); o.setAttribute('normal',new THREE.BufferAttribute(nor,3)); o.setAttribute('c1',new THREE.BufferAttribute(c1,3)); o.setAttribute('mat',new THREE.BufferAttribute(new Float32Array(n).fill(mi),1)); return o; }
const musScale=(g,bh)=>g.scale.set(W3.SZ/PPU,ZU*W3.SZ*(bh||W3.BH||1),W3.SZ/PPU);
const sheetView=(g,y)=>{ '@later'; UI.setFree(true); UI.camT.set(g.position.x,y,g.position.z); SHARED.ppu=SHARED.ppuTo=PPU*4; window.SHEETTURN=d=>{ SHARED.yaw=SHARED.yawTo=d*Math.PI/180; }; window.SHEETZOOM=k=>{ SHARED.ppu=SHARED.ppuTo=PPU*k; };
  for(const G of Object.values(MAPG))for(const c of G.children)if(c!==g)c.visible=false; for(const c of scene.children)if(!c.isLight&&!c.isCamera&&c!==MAPG.bodega)c.visible=false;
  const K=new THREE.Color(0), r0=renderer.render.bind(renderer); renderer.render=(s,c)=>{ if(s===scene){ s.background=K; s.fog=null; if(SKY.dome)SKY.dome.visible=false; } r0(s,c); }; };
const spreadPose=()=>{ const P=RIG.walkPose({ph:0,w:0},null), D=RIG.D; P.L.ua=[0,65*D]; P.R.ua=[0,65*D]; P.L.fa=[0,70*D]; P.R.fa=[0,70*D]; return P; };
function sheetFig(g){ '@later'; const V=RIG.V, MT=RIG.MATS; if(!MT.includes('sheet')){ MT.push('sheet'); W3.ramp.push(['#e6e4dc','#d8d6cd','#b6b3a9','#78756d'].map(h=>new THREE.Color(h))); } const SHI=MT.indexOf('sheet');
  const PCS=musBody().PCS.filter(p=>/^(sleeve|upperArm|forearm|hand|fing)/.test(p.n)); for(const p of PCS)p.recol=()=>SHI;
  PCS.push(Object.assign({},GT.PIECE,{d:GT.SOLID,F0:{o:V(0,0,0),x:V(1,0,0),y:V(0,1,0),z:V(0,0,1)},step:.25,cell:.25,share:GT.PIECE}));
  for(const P of PCS)if(!MUSGEO.has(P.share||P)){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?.5:1),fine,null); }
  const FM=figureMesh(PCS,'mus'); g.add(FM.me);
  const R=RIG, J0=musBody().J, NR=10, NS=16, rr=9.8, H=1/60, G=-330, DMP=.98, K=1+NR*NS, K3=K*3, NV=K+18, RA=[], RL=[], idx=[], I=(k,s)=>k?1+(k-1)*NS+(s+NS)%NS:0;
    const P=new Float32Array(K*3), O=new Float32Array(K*3), ST=new Float32Array(K*3).fill(NaN), pa=new THREE.BufferAttribute(new Float32Array(NV*3),3), col=new Float32Array(NV*3), W=new THREE.Color('#f1f0ea'), H0=J0.head;
    const put=(v,x,y,z)=>{ P[v*3]=H0.x+x; P[v*3+1]=y; P[v*3+2]=H0.z+z; }; put(0,0,H0.y+rr,0);
    for(let k=1;k<=NR;k++)for(let s=0;s<NS;s++){ const t=s/NS*Math.PI*2, a=Math.min(k,4)*27*R.D, b=Math.max(0,k-4)/(NR-4), r=k<=4?rr*Math.sin(a):9.8+b*3.4; put(I(k,s),Math.cos(t)*r,k<=4?H0.y+rr*Math.cos(a):H0.y-3-b*(H0.y-6)+(k===NR&&s%2?1.8:0),Math.sin(t)*r*Math.max(.64,Math.min(1,1.2-k*.1))); }
    const C=(a,b,w)=>{ RA.push(a*3,b*3); RL.push(Math.hypot(P[a*3]-P[b*3],P[a*3+1]-P[b*3+1],P[a*3+2]-P[b*3+2]),w); };
    for(let k=1;k<=NR;k++)for(let s=0;s<NS;s++){ const v=I(k,s); C(v,I(k,s+1),1); C(v,I(k,s+2),.3); C(v,I(k-1,s),1); if(k>1){ C(v,I(k-1,s+1),1); C(v,I(k-1,s-1),1); } if(k>2)C(v,I(k-2,s),.3);
      if(k===1)idx.push(0,I(1,s+1),v); else { const a=I(k-1,s), b=I(k-1,s+1), d=I(k,s+1); idx.push(a,b,v,b,d,v); } }
    for(let e=0;e<2;e++){ const c=K+e*9; for(let s=0;s<8;s++)idx.push(c,c+1+s,c+1+(s+1)%8); }
    for(let v=0;v<NV;v++)col.set(v<K?[W.r,W.g,W.b]:[.02,.02,.03],v*3);
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',pa); geo.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(NV*3),3)); geo.setAttribute('color',new THREE.BufferAttribute(col,3)); geo.setAttribute('pidx',new THREE.BufferAttribute(new Float32Array(NV).fill(PCS.length),1)); geo.setIndex(idx);
    FM.PM.value[PCS.length].identity();
    const cm=new THREE.Mesh(geo,FM.me.material); cm.customDistanceMaterial=FM.me.customDistanceMaterial; cm.customDepthMaterial=FM.me.customDepthMaterial; cm.castShadow=true; cm.frustumCulled=false; g.add(cm);
    O.set(P); const P0=P.slice(), NC=RA.length/2, CA=Int32Array.from(RA), CL=Float32Array.from(RL);
    const SP=[], HP=[], M0=new THREE.Matrix4(), M1=new THREE.Matrix4(), v=new THREE.Vector3(), hd={x:0,y:0,z:0}, hp={...H0}; let acc=0, first=true, FL=.6;
    const step=F=>{ for(let k=0;k<K3;k+=3){ const x=P[k], y=P[k+1], z=P[k+2]; P[k]=x+(x-O[k])*DMP; P[k+1]=y+(y-O[k+1])*DMP+G*H*H; P[k+2]=z+(z-O[k+2])*DMP; O[k]=x; O[k+1]=y; O[k+2]=z; }
      for(let it=0;it<6;it++){
        for(let q=0;q<NC;q++){ const ia=CA[q*2], ib=CA[q*2+1], L=CL[q*2], s=CL[q*2+1], dx=P[ib]-P[ia], dy=P[ib+1]-P[ia+1], dz=P[ib+2]-P[ia+2], l=Math.hypot(dx,dy,dz)||1e-6; let f=(l-L)/l*.5*s; if(l<L){ if(s<1)continue; f*=.15; }
          P[ia]+=dx*f; P[ia+1]+=dy*f; P[ia+2]+=dz*f; P[ib]-=dx*f; P[ib+1]-=dy*f; P[ib+2]-=dz*f; }
        if(it&1)for(let k=0;k<K3;k+=3){ for(let s=0;s<SP.length;s+=4){ const dx=P[k]-SP[s], dy=P[k+1]-SP[s+1], dz=P[k+2]-SP[s+2], l=Math.hypot(dx,dy,dz)||1e-6, r=SP[s+3]+.6;
            if(l<r){ if(!s){ if(ST[k]!==ST[k]){ ST[k]=dx/l; ST[k+1]=dy/l; ST[k+2]=dz/l; } P[k]=SP[0]+ST[k]*r; P[k+1]=SP[1]+ST[k+1]*r; P[k+2]=SP[2]+ST[k+2]*r; O[k]=P[k]-hd.x; O[k+1]=P[k+1]-hd.y; O[k+2]=P[k+2]-hd.z; }
              else { const m=r/l; P[k]=SP[s]+dx*m; P[k+1]=SP[s+1]+dy*m; P[k+2]=SP[s+2]+dz*m; } }
            else if(!s&&l>r+1.2)ST[k]=NaN; }
          for(let s=0;s<HP.length;s+=4){ const dx=P[k]-HP[s], dy=P[k+1]-HP[s+1], e=HP[s+3]*HP[s+3]-dx*dx-dy*dy; if(e>0){ const zb=HP[s+2]-Math.sqrt(e); if(P[k+2]>zb)P[k+2]=zb; } }
          if(F){ const dx=P[k]-F.o.x, dy=P[k+1]-F.o.y, dz=P[k+2]-F.o.z, qx=dx*F.x.x+dy*F.x.y+dz*F.x.z, qy=dx*F.y.x+dy*F.y.y+dz*F.y.z, qz=dx*F.z.x+dy*F.z.y+dz*F.z.z;
            if((qx/6.6)**2+((qy-2.2)/8.6)**2<1&&qz>-4.4&&qz<2){ const m=-4.4-qz; P[k]+=F.z.x*m; P[k+1]+=F.z.y*m; P[k+2]+=F.z.z*m; } }
          if(P[k+1]<FL){ P[k+1]=FL; O[k]+=(P[k]-O[k])*.5; O[k+2]+=(P[k+2]-O[k+2])*.5; } } } };
    const cloth=(dt,B,F,fl)=>{ FL=(fl||0)+.6; g.updateMatrix(); if(!first&&B){ M1.copy(g.matrix).invert().multiply(M0); if(Math.hypot(M1.elements[12],M1.elements[13],M1.elements[14])<12)for(const A of [P,O])for(let k=0;k<K3;k+=3){ v.set(A[k],A[k+1],A[k+2]).applyMatrix4(M1); A[k]=v.x; A[k+1]=v.y; A[k+2]=v.z; } }
      first=false; M0.copy(g.matrix); if(!B||!dt)return;
      if(Math.hypot(P[0]-B.J.head.x,P[1]-B.J.head.y-rr,P[2]-B.J.head.z)>24){ for(let k=0;k<K3;k+=3){ P[k]=P0[k]+B.J.head.x-H0.x; P[k+1]=P0[k+1]+B.J.head.y-H0.y; P[k+2]=P0[k+2]+B.J.head.z-H0.z; } O.set(P); ST.fill(NaN); }
      const J=B.J, S=(p,r)=>SP.push(p.x,p.y,p.z,r); SP.length=0; S(J.head,rr); for(const n of 'LR'){ S(J['shoulder'+n],3.6); S(J['knee'+n],3.8); S(J['ankle'+n],3.2); } S(J.chest,5); S(J.spine,4.8); S(J.pelvis,5); HP.length=0; for(const n of 'LR'){ const w=J['wrist'+n], c=R.mul(R.add(w,J['k20'+n]||w),.5); HP.push(w.x,w.y,w.z,3.5,c.x,c.y,c.z,4.5); }
      acc=Math.min(acc+dt,H*3); const n=Math.floor(acc/H); acc-=n*H; for(const c of 'xyz'){ hd[c]=n?(J.head[c]-hp[c])/n:0; hp[c]=J.head[c]; }
      for(let s=0;s<n;s++)step(F);
      const A=pa.array; A.set(P); const Rh=B.m.Rh, c=J.head;
      for(let e=0;e<2;e++){ const sd=e?1:-1, d=R.nrm(R.add(R.add(R.mul(Rh.z,.93),R.mul(Rh.x,sd*.34)),R.mul(Rh.y,.1))), o=R.add(c,R.mul(d,rr+1.1)), ax=R.nrm(R.cross(Rh.y,d)), ay=R.cross(d,ax), b=(K+e*9)*3;
        A.set([o.x,o.y,o.z],b); for(let s=0;s<8;s++){ const t=s/8*Math.PI*2, p=R.add(o,R.add(R.mul(ax,Math.cos(t)*1.8),R.mul(ay,Math.sin(t)*2.7))); A.set([p.x,p.y,p.z],b+3+s*3); } }
      pa.needsUpdate=true; geo.computeVertexNormals(); };
  const stat=()=>{ let lo=99, hi=-99; for(let k=0;k<K3;k+=3){ lo=Math.min(lo,P[k+1]); hi=Math.max(hi,P[k+1]); } return {hem:+lo.toFixed(1),top:+hi.toFixed(1),tris:idx.length/3}; };
  const sg=new THREE.Group(); sg.matrixAutoUpdate=false; g.add(sg);
  for(let i=1;i<=6;i++){ const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(GT.sx(i,0),0,GT.sz(0)),new THREE.Vector3(GT.sx(i,GT.S),GT.S,GT.sz(GT.S))]); sg.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:i<4?0x6a6e72:0x55595c}))); }
  const M=(F,out)=>out.set(F.x.x,F.y.x,F.z.x,F.o.x, F.x.y,F.y.y,F.z.y,F.o.y, F.x.z,F.y.z,F.z.z,F.o.z, 0,0,0,1);
  return {PCS,FM,P,stat,cloth,tris:FM.tris+idx.length/3,pose:(dt,B,F,fr,fl)=>{ PCS.forEach((pc,i)=>FM.set(i,pc.n==='guitar'?F:fr?fr(pc.on||pc.n):R.frameOf(pc.on||pc.n,B))); M(F,sg.matrix); sg.matrixWorldNeedsUpdate=true; cloth(dt,B,F,fl); }}; }
function gtBody(a,dt){ '@later'; const R=RIG; R.farOnly(false); GTS.t+=dt; const t=GTS.t, P=gtPose(t); npcSpring(a,P,dt,NPCARMS); gtFing(P,R.build(P,null),P._T); npcSpring(a,P,dt,NPCFING); a.t+=dt;
  P.nod+=Math.sin(a.t*1.6)*0.6*R.D+Math.sin(t/GTBEAT*Math.PI)*0.8*R.D; a.P=P; return R.settle(R.build(P,null),0); }
if(!MUS.shelf){ const R=RIG, V=R.V, AT={x:SHARED.BOD.XS(70),z:SHARED.BOD.ZS(-73),hd:Math.PI/2,y:0};
  const g=new THREE.Group(); MAPG.bodega.add(g); MUS.g=g; const SF=sheetFig(g), PCS=SF.PCS; MUS.tris=SF.FM.tris; MUS.per=SF.FM.per; MUS.ghost=SF.stat;
  g.position.set(AT.x,AT.y,AT.z); g.rotation.set(0,AT.hd,0); musScale(g); MUS.at=AT; MUS.on=true; if(NPCS.extra&&!NPCS.extra.includes(MUS))NPCS.extra.push(MUS);
  const F0={o:{...GTF.o},x:{...GTF.x},y:{...GTF.y},z:{...GTF.z}};
  MUS.hold=(drop,tilt,wr,pole)=>{ '@later'; const c=Math.cos(tilt), s=Math.sin(tilt), rot=v=>V(v.x*c-v.y*s,v.x*s+v.y*c,v.z), P0=V(F0.o.x,F0.o.y,F0.o.z);
    GTF.x=rot(F0.x); GTF.y=rot(F0.y); GTF.z=rot(F0.z); GTF.o=R.add(rot(P0),V(0,-drop,0));
    const {add,mul,nrm}=R; GTH.L={y:GTF.z,z:nrm(add(mul(GTF.x,-0.225),mul(GTF.y,-0.974)))}; GTH.R={y:nrm(add(GTF.x,mul(GTF.z,-0.017))),z:nrm(add(add(mul(GTF.x,-0.008),mul(GTF.y,-0.891)),mul(GTF.z,-0.454)))};
    const arr=v=>[v.x,v.y,v.z]; GTH.hf={L:{y:arr(GTH.L.y),z:arr(GTH.L.z)},R:{y:arr(GTH.R.y),z:arr(GTH.R.z)}}; if(wr)GTWR.R=wr; if(pole)GTPOLE.R=V(...pole); };
  MUS.hold(4,10*R.D,[-4.2,2.2,2],[-.3,-1,-.2]);
  MUS.elbow=()=>MUS.B&&['shoulderR','elbowR','wristR','shoulderL','elbowL','wristL'].map(k=>{ const p=MUS.B.J[k]; return k+' '+[p.x,p.y,p.z].map(v=>v.toFixed(1)).join(','); });
  const a={t:0}; let song=0;
  MUS.start=()=>{ song=gtNext(song); gtSet(song); }; MUS.stop=()=>gtHush(); MUS.rest=()=>{ if(WK.mode==='play'){ WK.mode='stop'; WK.t=2; } }; MUS.tones=(t,d,x,z)=>gtTones(t,d,x,z); MUS.hush=()=>gtHush();
  const WK={mode:'stop',t:1+Math.random()*3,dir:1,to:AT.x,st:R.create(),d0:0}, X0=SHARED.BOD.XS(36), X1=SHARED.BOD.XS(165), Z0=AT.z, RAD=.3*TILE; MUS.wk=WK;
  const free=(x,z)=>typeof STFREE!=='function'||STFREE(x,z,RAD), turn=hd=>{ let e=hd-AT.hd; e=Math.atan2(Math.sin(e),Math.cos(e)); return e; };
  const pickTo=()=>{ if(Math.random()<.35)WK.dir=-WK.dir; let x=AT.x+WK.dir*(6+Math.random()*22)*TILE; if(x<X0||x>X1){ WK.dir=-WK.dir; x=AT.x+WK.dir*(6+Math.random()*22)*TILE; } WK.to=Math.max(X0,Math.min(X1,x)); };
  MUS.ask=()=>{ if(MUS.lent)MUS.lent(); WK.mode='play'; WK.st.target=0; AT.hd=Math.atan2(pos.x-AT.x,pos.z-AT.z); g.rotation.y=AT.hd; song=gtNext(song); gtSet(song); };
  const clear=()=>{ for(let k=0;k<160;k++){ const dx=(k>>1)*.25*TILE*(k&1?-1:1); for(const dz of [0,.6,-.6,1.2]){ const x=AT.x+dx, z=AT.z+dz*TILE; if(free(x,z)){ AT.x=x; AT.z=z; return; } } } };
  const walkTick=(dt,near)=>{ '@later'; const S=WK.st; if(!free(AT.x,AT.z))clear();
    if(WK.mode==='stop'){ S.target=0; WK.t-=dt; if(WK.t<=0){ pickTo(); WK.mode='walk'; } }
    if(WK.mode==='walk'){ const want=WK.to>AT.x?Math.PI/2:-Math.PI/2, e=turn(want); AT.hd+=Math.sign(e)*Math.min(Math.abs(e),dt*4); S.target=Math.abs(e)<.6?1:0;
      if(Math.abs(WK.to-AT.x)<.2*TILE){ WK.mode='stop'; WK.t=3+Math.random()*7; S.target=0; } }
    const d0=S.dist; R.step(S,dt); const go=(S.dist-d0)*W3.SZ/PPU;
    if(go>0){ const nx=AT.x+Math.sin(AT.hd)*go, nz=AT.z+Math.cos(AT.hd)*go, side=[0,.5,-.5,1,-1].find(o=>free(nx,nz+o*TILE*Math.min(1,go*8)));
      if(side!=null){ AT.x=nx; AT.z=nz+side*TILE*Math.min(1,go*8); } else { WK.mode='stop'; WK.t=1+Math.random()*2; WK.dir=-WK.dir; } }
    if(WK.mode==='walk'&&Math.abs(AT.z-Z0)>.05*TILE&&free(AT.x,AT.z+Math.sign(Z0-AT.z)*.02*TILE))AT.z+=Math.sign(Z0-AT.z)*Math.min(Math.abs(Z0-AT.z),dt*.3*TILE);
    AT.y=MODS.bodega.ground(AT.x,AT.z); g.position.set(AT.x,AT.y,AT.z); g.rotation.y=AT.hd;
    if(!near)return null; if(MUS.wB&&!ASTEP.gate(WK,dt))return MUS.wB;
    R.farOnly(false); const B=R.pose(S,true); MUS.wB=B; return B; };
  const BACK={}; const backOf=()=>{ for(const k of ['x','y','z'])BACK[k]={x:-GTF[k].x,y:GTF[k].y,z:-GTF[k].z}; BACK.o={x:-GTF.o.x,y:GTF.o.y+2,z:-GTF.o.z-1}; return BACK; };
  const SHEET=new URLSearchParams(location.search).get('sheet')==='guitarist';
  MUS.tick=dt=>{ '@later'; if(SHEET){ R.farOnly(false); const B=MUS.B=R.settle(R.build(spreadPose(),null),0), F=backOf(); AT.x=SHARED.BOD.XS(100); AT.z=SHARED.BOD.ZS((SHARED.BOD.MAP.y0+SHARED.BOD.MAP.y1)/2); AT.hd=Math.PI/4; AT.y=MODS.bodega.ground(AT.x,AT.z);
      g.position.set(AT.x,AT.y,AT.z); g.rotation.y=AT.hd; musScale(g); SF.pose(dt,B,F);
      if(!MUS.sheetOn){ MUS.sheetOn=true; sheetView(g,AT.y+g.scale.y*27); } return; }
    if(MUS.watch&&!UI.freeCam){ MUS.watch=false; SHB.hidden=true; SHB.style.display='none'; if(MUS.res0!=null){ SHARED.RESI=MUS.res0; MUS.res0=null; resize(); } } const d=Math.hypot(pos.x-AT.x,pos.z-AT.z);
    if(WK.mode==='play'&&(d>18&&!MUS.watch||GTS.t>GTEND+1.5)){ WK.mode='stop'; WK.t=1.5+Math.random()*2; }
    if(WK.mode!=='play'){ if(!MUS.lent)gtHush(); const near=MAPG.bodega.visible&&LEVELS.drawn(MAPG.bodega)&&d<40, B=MUS.on&&near?walkTick(dt,near):null; if(!B)return SF.cloth(dt,null); MUS.B=B; SF.pose(dt,B,backOf()); musScale(g); return; }
    if(!MUS.on||!MAPG.bodega.visible){ gtHush(); return; }
    const B=gtBody(a,dt), t=GTS.t; MUS.B=B; musScale(g);
    if(MUS.err){ const T=a.P._T; for(const n of 'LR')for(let i=0;i<5;i++)if(T[n][i]&&T[n].w[i]>=.99){ const k=B.J['k'+i+'3'+n]; if(k){ const e=MUS.err[n]; e[0]+=R.len(R.sub(k,T[n][i])); e[1]++; } } }
    SF.pose(dt,B,GTF); R.farOnly(false);
    gtTones(t,d,AT.x,AT.z); };
  function gtTones(t,d,x,z){ '@later'; if(!SND.ctx||SND.ctx.state!=='running')return; if(!gtAudio())return; const c=SND.ctx, ct=c.currentTime, A=t+0.1, when=x=>ct+Math.max(0,x-t)+0.03;
    if(GTA.wet)GTA.wet.gain.value=.08;
    GTA.g.gain.setTargetAtTime(0.5*Math.max(0,1-d/16),ct,0.05);
    const v=new THREE.Vector3(x,1,z).project(SHARED.cam); GTA.pan.pan.setTargetAtTime(Math.max(-0.8,Math.min(0.8,v.x*0.8)),ct,0.1);
    while(GTS.sent<GTEV.length&&GTEV[GTS.sent].t<=A){ const e=GTEV[GTS.sent++]; if(e.t<t-0.05)continue; if(e.n)gtPlay(e.n.s,e.n.at,when(e.t),e.n.amp,e.n.tone,e.n.r); else gtMute(e.s,when(e.t),0.04); } }
  function gtHush(){ if(GTA.g&&SND.ctx)GTA.g.gain.setTargetAtTime(0,SND.ctx.currentTime,0.2); }
  const wake=()=>{ if(!SOUND)return; if(!SND.ctx){ try{ SND.ctx=new (window.AudioContext||window.webkitAudioContext)(); SND.out=SND.ctx.destination; }catch(e){ return; } } if(SND.ctx.state!=='running')SND.ctx.resume(); };
  addEventListener('pointerdown',wake); addEventListener('keydown',wake);
  const hitBox=new THREE.Mesh(new THREE.BoxGeometry(22,58,24),new THREE.MeshBasicMaterial({visible:false})); hitBox.position.set(0,29,2); g.add(hitBox);
  UI.thing({name:'THE GUITARIST',obj:hitBox,reach:1.6,tall:1.9,act:()=>{ '@later'; MUS.ask(); const p=new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().multiplyMatrices(g.matrixWorld,new THREE.Matrix4().makeTranslation(GTF.o.x,GTF.o.y,GTF.o.z)));
    UI.setFree(true); UI.camT.copy(p); SHARED.ppuTo=PPU*16; MUS.watch=true; MUS.res0=SHARED.RESI; SHARED.RESI=MUS.sharp(); resize(); SHB.show(); }});
  const SHB=document.createElement('div'); SHB.id='shbar'; SHB.hidden=true; SHB.style.cssText='position:fixed;left:50%;bottom:52px;transform:translateX(-50%);z-index:6;display:none;gap:10px;align-items:center;padding:8px 12px;background:#0b0d13e0;border:2px solid #2a3040;font:11px Silkscreen,monospace;letter-spacing:1px;color:#c9ccd6';
  SHB.innerHTML='<span>SHARPEN</span><input type="range" min="0" step="1" style="width:220px"><span class="v" style="width:52px;text-align:right"></span><span style="color:#8a8f9c">C BACK</span>'; document.body.appendChild(SHB);
  const shIn=SHB.querySelector('input'), shV=SHB.querySelector('.v'); shIn.max=RESL.length-1;
  MUS.sharp=()=>{ let v=null; try{ v=SAVE.get('gtsharp'); }catch(e){} return v!=null?+v:Math.min(RESL.length-1,RESMAX+2); };
  SHB.show=()=>{ shIn.value=SHARED.RESI; shV.textContent=RES()+'x'; SHB.hidden=false; SHB.style.display='flex'; };
  shIn.oninput=()=>{ SHARED.RESI=+shIn.value; resize(); shV.textContent=RES()+'x'; try{ SAVE.set('gtsharp',String(SHARED.RESI)); }catch(e){} };
  shIn.addEventListener('pointerdown',e=>e.stopPropagation()); shIn.addEventListener('keydown',e=>e.stopPropagation());
}
export {figureMesh, musBody, MUSGEO, musScale, sheetView, spreadPose};
