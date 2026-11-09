// THE FIGURE MAKERS: musBody, figureMesh and their helpers, shared by the other players' bodies and the subway riders; the street musician himself is archived (owner, 5 Nov 2026).
import {SHARED, THREE} from './003-shx.js';
import {MUS, SKY, UI, W3} from './003b-systems.js';
import {PPU, renderer, scene} from './004-main.js';
import {MAPG, STORE, ZU} from './006-map-pre.js';
Object.assign(MUS,{shelf:true,tick:()=>{}}); STORE.MUS=MUS;
function musBody(st){ const R=RIG; if(!musBody.FG){ R.farOnly(false); R.fine(true); const J=R.build(R.walkPose({ph:0,w:0},null),null).J, FG=R.shell(J,0).filter(p=>/^fing\d\d[LR]$/.test(p.n)); R.fine(false);
    const around=(ps,m)=>{ const b=[1e9,-1e9,1e9,-1e9,1e9,-1e9]; for(const p of ps){ b[0]=Math.min(b[0],p.x-m); b[1]=Math.max(b[1],p.x+m); b[2]=Math.min(b[2],p.y-m); b[3]=Math.max(b[3],p.y+m); b[4]=Math.min(b[4],p.z-m); b[5]=Math.max(b[5],p.z+m); } return b; };
    for(const p of FG){ const f=/^fing(\d)(\d)([LR])$/.exec(p.n); p.bb=around([J['k'+f[1]+f[2]+f[3]],J['k'+f[1]+(+f[2]+1)+f[3]]],1); p.step=.12; p.cell=.12; p.share=p; }
    musBody.FG=FG; musBody.J=J; }
  const ALL={shirt:1,pants:1,shoes:1,hair:1,beard:1}, S=st||{form:'M',hair:'hair',beard:''}, hid=(p,i)=>{ const v=W3.shows?W3.shows(p,S,S.worn||ALL):null; return v===null?W3.HIDE[i]:!v; };
  const own=W3.pcs.map((p,i)=>hid(p,i)||/^fing/.test(p.n)?null:Object.assign({},p,{e:i,share:p})).filter(Boolean);
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
    sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(vNormal); vec3 nonPerturbedNormal=normal;'); W3.rim(sh); };
  mat.customProgramCacheKey=()=>'mus'+NP;
  const dist=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dist.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; dist.customProgramCacheKey=()=>'musdist'+NP;
  const depth=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}); depth.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; depth.customProgramCacheKey=()=>'musdepth'+NP;
  const me=new THREE.Mesh(all,mat); me.customDistanceMaterial=dist; me.customDepthMaterial=depth; me.castShadow=true; me.receiveShadow=true; me.frustumCulled=false;
  const M=(F,out)=>out.set(F.x.x,F.y.x,F.z.x,F.o.x, F.x.y,F.y.y,F.z.y,F.o.y, F.x.z,F.y.z,F.z.z,F.o.z, 0,0,0,1);
  return {me,PM,tris:all.attributes.position.count/3,per:PCS.PER,set:(i,F)=>{ M(F,PM.value[i]); const p=PCS[i], E=p.E!==undefined?p.E:p.e!=null&&W3.E&&W3.E[p.e]; if(E)W3.applyE(PM.value[i],E,F.o); }}; }
function musBox(P){ '@later'; const [cx,cy,cz,hx,hy,hz]=P.box, F=P.F0, g=new THREE.BoxGeometry(2*hx,2*hy,2*hz).toNonIndexed(), p=g.attributes.position, nn=g.attributes.normal, n=p.count, mi=RIG.MATS.indexOf(P.m), r=W3.ramp[mi];
  const pos=new Float32Array(n*3), nor=new Float32Array(n*3), c1=new Float32Array(n*3), d=(x,y,z,v)=>x*v.x+y*v.y+z*v.z;
  for(let i=0;i<n;i++){ const x=p.getX(i)+cx-F.o.x, y=p.getY(i)+cy-F.o.y, z=p.getZ(i)+cz-F.o.z, a=nn.getX(i), b=nn.getY(i), c=nn.getZ(i);
    pos.set([d(x,y,z,F.x),d(x,y,z,F.y),d(x,y,z,F.z)],i*3); nor.set([d(a,b,c,F.x),d(a,b,c,F.y),d(a,b,c,F.z)],i*3); c1.set([r[1].r,r[1].g,r[1].b],i*3); }
  const o=new THREE.BufferGeometry(); o.setAttribute('position',new THREE.BufferAttribute(pos,3)); o.setAttribute('normal',new THREE.BufferAttribute(nor,3)); o.setAttribute('c1',new THREE.BufferAttribute(c1,3)); o.setAttribute('mat',new THREE.BufferAttribute(new Float32Array(n).fill(mi),1)); return o; }
const musScale=(g,bh)=>g.scale.set(W3.SZ/PPU,ZU*W3.SZ*(bh||W3.BH||1),W3.SZ/PPU);
const sheetView=(g,y)=>{ '@later'; UI.setFree(true); UI.camT.set(g.position.x,y,g.position.z); SHARED.ppu=SHARED.ppuTo=PPU*4; window.SHEETTURN=d=>{ SHARED.yaw=SHARED.yawTo=d*Math.PI/180; }; window.SHEETZOOM=k=>{ SHARED.ppu=SHARED.ppuTo=PPU*k; };
  for(const G of Object.values(MAPG))for(const c of G.children)if(c!==g)c.visible=false; for(const c of scene.children)if(!c.isLight&&!c.isCamera&&c!==MAPG.bodega)c.visible=false;
  const K=new THREE.Color(0), r0=renderer.render.bind(renderer); renderer.render=(s,c)=>{ if(s===scene){ s.background=K; s.fog=null; if(SKY.dome)SKY.dome.visible=false; } r0(s,c); }; };
const spreadPose=()=>{ const P=RIG.walkPose({ph:0,w:0},null), D=RIG.D; P.L.ua=[0,65*D]; P.R.ua=[0,65*D]; P.L.fa=[0,70*D]; P.R.fa=[0,70*D]; return P; };
export {figureMesh, musBody, MUSGEO, musScale, sheetView, spreadPose};
