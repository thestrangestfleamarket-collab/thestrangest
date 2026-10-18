const MUS={}; STORE.MUS=MUS;
function musBody(){ const R=RIG; if(!musBody.FG){ R.farOnly(false); R.fine(true); const J=R.build(R.walkPose({ph:0,w:0},null),null).J, FG=R.shell(J,0).filter(p=>/^fing\d\d[LR]$/.test(p.n)); R.fine(false);
    const around=(ps,m)=>{ const b=[1e9,-1e9,1e9,-1e9,1e9,-1e9]; for(const p of ps){ b[0]=Math.min(b[0],p.x-m); b[1]=Math.max(b[1],p.x+m); b[2]=Math.min(b[2],p.y-m); b[3]=Math.max(b[3],p.y+m); b[4]=Math.min(b[4],p.z-m); b[5]=Math.max(b[5],p.z+m); } return b; };
    for(const p of FG){ const f=/^fing(\d)(\d)([LR])$/.exec(p.n); p.bb=around([J['k'+f[1]+f[2]+f[3]],J['k'+f[1]+(+f[2]+1)+f[3]]],1); p.step=.12; p.cell=.12; p.share=p; }
    musBody.FG=FG; musBody.J=J; }
  const own=W3.pcs.map((p,i)=>W3.HIDE[i]||/^fing/.test(p.n)?null:Object.assign({},p,{e:i,share:p})).filter(Boolean);
  return {PCS:own.concat(musBody.FG.map(p=>Object.assign({},p))),J:musBody.J}; }
const MUSGEO=new Map(), MUSNP=180;
function figureMesh(PCS,key){ const NP=Math.max(MUSNP,PCS.length), PM={value:Array.from({length:NP},()=>new THREE.Matrix4().makeScale(0,0,0))};
  const geos=PCS.map((P,i)=>{ const fine=P.step<1||/^(head|hair|beard|brow|eye|nose|ear|mouth)/.test(P.n), k=P.share||P; let g0=MUSGEO.get(k); if(!g0){ g0=P.box?musBox(P):W3.meshOf(P,P.step||(fine?.5:1),fine,null); if(P.share)MUSGEO.set(k,g0); }
    const g=new THREE.BufferGeometry(), n=g0.attributes.position.count; for(const a of ['position','normal','c1','mat'])g.setAttribute(a,g0.attributes[a]);
    if(P.recol){ const c=new Float32Array(n*3), mt=g0.attributes.mat.array; for(let j=0;j<n;j++){ const r=W3.ramp[P.recol(mt[j])]||W3.ramp[mt[j]]; c.set([r[1].r,r[1].g,r[1].b],j*3); } g.setAttribute('c1',new THREE.BufferAttribute(c,3)); }
    g.setAttribute('pidx',new THREE.BufferAttribute(new Float32Array(n).fill(i),1)); return g; });
  const all=new THREE.BufferGeometry(); for(const k of ['position','normal','c1','pidx']){ const sz=geos[0].attributes[k].itemSize, arr=new Float32Array(geos.reduce((a,g)=>a+g.attributes[k].array.length,0)); let o=0; for(const g of geos){ arr.set(g.attributes[k].array,o); o+=g.attributes[k].array.length; } all.setAttribute(k,new THREE.BufferAttribute(arr,sz)); }
  all.setAttribute('color',all.attributes.c1);
  const MOVE=`attribute float pidx; uniform mat4 uPM[${NP}];`, AT_=`mat4 PM=uPM[int(pidx+0.5)];`;
  const mat=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:W3.GP,side:THREE.DoubleSide});
  mat.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <beginnormal_vertex>',AT_+' vec3 objectNormal=mat3(PM)*normal;').replace('#include <begin_vertex>','vec3 transformed=(PM*vec4(position,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(vNormal); vec3 nonPerturbedNormal=normal;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*0.16;'); };
  mat.customProgramCacheKey=()=>'mus'+NP;
  const dist=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dist.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; dist.customProgramCacheKey=()=>'musdist'+NP;
  const depth=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}); depth.onBeforeCompile=sh=>{ sh.uniforms.uPM=PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT_+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; depth.customProgramCacheKey=()=>'musdepth'+NP;
  const me=new THREE.Mesh(all,mat); me.customDistanceMaterial=dist; me.customDepthMaterial=depth; me.castShadow=true; me.receiveShadow=true; me.frustumCulled=false;
  const M=(F,out)=>out.set(F.x.x,F.y.x,F.z.x,F.o.x, F.x.y,F.y.y,F.z.y,F.o.y, F.x.z,F.y.z,F.z.z,F.o.z, 0,0,0,1);
  return {me,PM,tris:all.attributes.position.count/3,per:geos.map((g,i)=>[PCS[i].n,g.attributes.position.count/3]),set:(i,F)=>{ M(F,PM.value[i]); const p=PCS[i], E=p.E!==undefined?p.E:p.e!=null&&W3.E&&W3.E[p.e]; if(E)W3.applyE(PM.value[i],E,F.o); }}; }
function musBox(P){ const [cx,cy,cz,hx,hy,hz]=P.box, F=P.F0, g=new THREE.BoxGeometry(2*hx,2*hy,2*hz).toNonIndexed(), p=g.attributes.position, nn=g.attributes.normal, n=p.count, mi=RIG.MATS.indexOf(P.m), r=W3.ramp[mi];
  const pos=new Float32Array(n*3), nor=new Float32Array(n*3), c1=new Float32Array(n*3), d=(x,y,z,v)=>x*v.x+y*v.y+z*v.z;
  for(let i=0;i<n;i++){ const x=p.getX(i)+cx-F.o.x, y=p.getY(i)+cy-F.o.y, z=p.getZ(i)+cz-F.o.z, a=nn.getX(i), b=nn.getY(i), c=nn.getZ(i);
    pos.set([d(x,y,z,F.x),d(x,y,z,F.y),d(x,y,z,F.z)],i*3); nor.set([d(a,b,c,F.x),d(a,b,c,F.y),d(a,b,c,F.z)],i*3); c1.set([r[1].r,r[1].g,r[1].b],i*3); }
  const o=new THREE.BufferGeometry(); o.setAttribute('position',new THREE.BufferAttribute(pos,3)); o.setAttribute('normal',new THREE.BufferAttribute(nor,3)); o.setAttribute('c1',new THREE.BufferAttribute(c1,3)); o.setAttribute('mat',new THREE.BufferAttribute(new Float32Array(n).fill(mi),1)); return o; }
const musScale=(g,bh)=>g.scale.set(W3.SZ/PPU,ZU*W3.SZ*(bh||W3.BH||1),W3.SZ/PPU);
{ const R=RIG, V=R.V, AT={x:BOD.XS(70),z:BOD.ZS(-73),hd:Math.PI/2,y:0};
  const PCS=musBody().PCS;
  PCS.push(Object.assign({},GT.PIECE,{d:GT.SOLID,F0:{o:V(0,0,0),x:V(1,0,0),y:V(0,1,0),z:V(0,0,1)},step:.25,cell:.25}));
  for(const P of PCS)if(!MUSGEO.has(P.share||P)){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?.5:1),fine,null); }
  const FM=figureMesh(PCS,'mus'), me=FM.me;
  const g=new THREE.Group(); g.add(me); MAPG.bodega.add(g); MUS.g=g; MUS.tris=FM.tris; MUS.per=FM.per;
  const sg=new THREE.Group(); sg.matrixAutoUpdate=false; g.add(sg);
  for(let i=1;i<=6;i++){ const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(GT.sx(i,0),0,GT.sz(0)),new THREE.Vector3(GT.sx(i,GT.S),GT.S,GT.sz(GT.S))]); sg.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:i<4?0x6a6e72:0x55595c}))); }
  const M=(F,out)=>out.set(F.x.x,F.y.x,F.z.x,F.o.x, F.x.y,F.y.y,F.z.y,F.o.y, F.x.z,F.y.z,F.z.z,F.o.z, 0,0,0,1);
  g.position.set(AT.x,AT.y,AT.z); g.rotation.set(0,AT.hd,0); musScale(g); MUS.at=AT; MUS.on=true; if(typeof NPCS!=='undefined'&&NPCS.extra&&!NPCS.extra.includes(MUS))NPCS.extra.push(MUS);
  const F0={o:{...GTF.o},x:{...GTF.x},y:{...GTF.y},z:{...GTF.z}};
  MUS.hold=(drop,tilt,wr,pole)=>{ const c=Math.cos(tilt), s=Math.sin(tilt), rot=v=>V(v.x*c-v.y*s,v.x*s+v.y*c,v.z), P0=V(F0.o.x,F0.o.y,F0.o.z);
    GTF.x=rot(F0.x); GTF.y=rot(F0.y); GTF.z=rot(F0.z); GTF.o=R.add(rot(P0),V(0,-drop,0));
    const {add,mul,nrm}=R; GTH.L={y:GTF.z,z:nrm(add(mul(GTF.x,-0.225),mul(GTF.y,-0.974)))}; GTH.R={y:nrm(add(GTF.x,mul(GTF.z,-0.017))),z:nrm(add(add(mul(GTF.x,-0.008),mul(GTF.y,-0.891)),mul(GTF.z,-0.454)))};
    const arr=v=>[v.x,v.y,v.z]; GTH.hf={L:{y:arr(GTH.L.y),z:arr(GTH.L.z)},R:{y:arr(GTH.R.y),z:arr(GTH.R.z)}}; if(wr)GTWR.R=wr; if(pole)GTPOLE.R=V(...pole); };
  MUS.hold(4,10*R.D,[-4.2,2.2,2],[-.3,-1,-.2]);
  MUS.elbow=()=>MUS.B&&['shoulderR','elbowR','wristR','shoulderL','elbowL','wristL'].map(k=>{ const p=MUS.B.J[k]; return k+' '+[p.x,p.y,p.z].map(v=>v.toFixed(1)).join(','); });
  const a={t:0}; let song=0;
  MUS.start=()=>{ song=gtNext(song); gtSet(song); }; MUS.stop=()=>gtHush();
  const WK={mode:'stop',t:1+Math.random()*3,dir:1,to:AT.x,st:R.create(),d0:0}, X0=BOD.XS(36), X1=BOD.XS(165), Z0=AT.z, RAD=.3*TILE; MUS.wk=WK;
  const free=(x,z)=>typeof STFREE!=='function'||STFREE(x,z,RAD), turn=hd=>{ let e=hd-AT.hd; e=Math.atan2(Math.sin(e),Math.cos(e)); return e; };
  const pickTo=()=>{ if(Math.random()<.35)WK.dir=-WK.dir; let x=AT.x+WK.dir*(6+Math.random()*22)*TILE; if(x<X0||x>X1){ WK.dir=-WK.dir; x=AT.x+WK.dir*(6+Math.random()*22)*TILE; } WK.to=Math.max(X0,Math.min(X1,x)); };
  MUS.ask=()=>{ WK.mode='play'; WK.st.target=0; AT.hd=Math.atan2(pos.x-AT.x,pos.z-AT.z); g.rotation.y=AT.hd; song=gtNext(song); gtSet(song); };
  const clear=()=>{ for(let k=0;k<160;k++){ const dx=(k>>1)*.25*TILE*(k&1?-1:1); for(const dz of [0,.6,-.6,1.2]){ const x=AT.x+dx, z=AT.z+dz*TILE; if(free(x,z)){ AT.x=x; AT.z=z; return; } } } };
  const walkTick=(dt,near)=>{ const S=WK.st; if(!free(AT.x,AT.z))clear();
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
  MUS.tick=dt=>{ if(MUS.watch&&!UI.freeCam){ MUS.watch=false; SHB.hidden=true; SHB.style.display='none'; if(MUS.res0!=null){ RESI=MUS.res0; MUS.res0=null; resize(); } } const d=Math.hypot(pos.x-AT.x,pos.z-AT.z);
    if(WK.mode==='play'&&(d>18&&!MUS.watch||GTS.t>GTEND+1.5)){ WK.mode='stop'; WK.t=1.5+Math.random()*2; }
    if(WK.mode!=='play'){ gtHush(); const B=MUS.on?walkTick(dt,MAPG.bodega.visible&&d<40):null; if(!B)return; MUS.B=B; const F=backOf();
      PCS.forEach((pc,i)=>{ if(pc.n==='guitar')FM.set(i,F); else FM.set(i,R.frameOf(pc.on||pc.n,B)); }); M(F,sg.matrix); sg.matrixWorldNeedsUpdate=true; musScale(g); return; }
    if(!MUS.on||!MAPG.bodega.visible){ gtHush(); return; }
    R.farOnly(false); GTS.t+=dt; const t=GTS.t, P=gtPose(t); npcSpring(a,P,dt,NPCARMS); gtFing(P,RIG.build(P,null),P._T); npcSpring(a,P,dt,NPCFING); a.t+=dt;
    P.nod+=Math.sin(a.t*1.6)*0.6*R.D+Math.sin(t/GTBEAT*Math.PI)*0.8*R.D; a.P=P; musScale(g);
    const B=R.settle(R.build(P,null),0); MUS.B=B;
    if(MUS.err){ const T=P._T; for(const n of 'LR')for(let i=0;i<5;i++)if(T[n][i]&&T[n].w[i]>=.99){ const k=B.J['k'+i+'3'+n]; if(k){ const e=MUS.err[n]; e[0]+=R.len(R.sub(k,T[n][i])); e[1]++; } } }
    PCS.forEach((pc,i)=>{ if(pc.n==='guitar')FM.set(i,GTF); else FM.set(i,R.frameOf(pc.on||pc.n,B)); }); M(GTF,sg.matrix); sg.matrixWorldNeedsUpdate=true; R.farOnly(false);
    gtTones(t,d); };
  function gtTones(t,d){ if(!SND.ctx||SND.ctx.state!=='running')return; if(!gtAudio())return; const c=SND.ctx, ct=c.currentTime, A=t+0.1, when=x=>ct+Math.max(0,x-t)+0.03;
    if(GTA.wet)GTA.wet.gain.value=.08;
    GTA.g.gain.setTargetAtTime(0.5*Math.max(0,1-d/16),ct,0.05);
    const v=new THREE.Vector3(AT.x,1,AT.z).project(cam); GTA.pan.pan.setTargetAtTime(Math.max(-0.8,Math.min(0.8,v.x*0.8)),ct,0.1);
    while(GTS.sent<GTEV.length&&GTEV[GTS.sent].t<=A){ const e=GTEV[GTS.sent++]; if(e.t<t-0.05)continue; if(e.n)gtPlay(e.n.s,e.n.at,when(e.t),e.n.amp,e.n.tone,e.n.r); else gtMute(e.s,when(e.t),0.04); } }
  function gtHush(){ if(GTA.g&&SND.ctx)GTA.g.gain.setTargetAtTime(0,SND.ctx.currentTime,0.2); }
  const wake=()=>{ if(!SND.ctx){ try{ SND.ctx=new (window.AudioContext||window.webkitAudioContext)(); SND.out=SND.ctx.destination; }catch(e){ return; } } if(SND.ctx.state!=='running')SND.ctx.resume(); };
  addEventListener('pointerdown',wake); addEventListener('keydown',wake);
  const hitBox=new THREE.Mesh(new THREE.BoxGeometry(22,58,24),new THREE.MeshBasicMaterial({visible:false})); hitBox.position.set(0,29,2); g.add(hitBox);
  UI.thing({name:'THE GUITARIST',obj:hitBox,reach:1.6,tall:1.9,act:()=>{ MUS.ask(); const p=new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().multiplyMatrices(g.matrixWorld,new THREE.Matrix4().makeTranslation(GTF.o.x,GTF.o.y,GTF.o.z)));
    UI.setFree(true); UI.camT.copy(p); ppuTo=PPU*16; MUS.watch=true; MUS.res0=RESI; RESI=MUS.sharp(); resize(); SHB.show(); }});
  const SHB=document.createElement('div'); SHB.id='shbar'; SHB.hidden=true; SHB.style.cssText='position:fixed;left:50%;bottom:52px;transform:translateX(-50%);z-index:6;display:none;gap:10px;align-items:center;padding:8px 12px;background:#0b0d13e0;border:2px solid #2a3040;font:11px Silkscreen,monospace;letter-spacing:1px;color:#c9ccd6';
  SHB.innerHTML='<span>SHARPEN</span><input type="range" min="0" step="1" style="width:220px"><span class="v" style="width:52px;text-align:right"></span><span style="color:#8a8f9c">C BACK</span>'; document.body.appendChild(SHB);
  const shIn=SHB.querySelector('input'), shV=SHB.querySelector('.v'); shIn.max=RESL.length-1;
  MUS.sharp=()=>{ let v=null; try{ v=SAVE.get('gtsharp'); }catch(e){} return v!=null?+v:Math.min(RESL.length-1,RESMAX+2); };
  SHB.show=()=>{ shIn.value=RESI; shV.textContent=RES()+'x'; SHB.hidden=false; SHB.style.display='flex'; };
  shIn.oninput=()=>{ RESI=+shIn.value; resize(); shV.textContent=RES()+'x'; try{ SAVE.set('gtsharp',String(RESI)); }catch(e){} };
  shIn.addEventListener('pointerdown',e=>e.stopPropagation()); shIn.addEventListener('keydown',e=>e.stopPropagation());
}
