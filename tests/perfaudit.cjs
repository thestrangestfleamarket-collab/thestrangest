// THE PERF AUDIT (17 Oct 2026): at a spot, what a frame costs. Build first, then the profiling copy:
//   python3 build.py && python3 tools/perfprof.py   (dist/market-prof.html: a timer round each system of the frame, the renderer on window.__R)
//   node tests/perfaudit.cjs <out.json> "<query>" [frames]      e.g. "hour=13", "hour=21&place=the bodega", "view=follow"
// Reports: the frame's systems (CPU ms, median and mean), every render call (its target, draws, triangles, ms; again with gl.finish after each
// pass, so the graphics' own time lands on the pass that caused it), the shadow lights, every draw of one frame by its owner (triangles,
// how many of them inside the view, inside a room's box while you're outside it), the render targets, programs, textures, frustumCulled=false.
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
(async()=>{ const out=process.argv[2]||'perf.json', q=process.argv[3]||'hour=13', NF=+(process.argv[4]||60);
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1920,height:1080}}); pg.setDefaultTimeout(600000);
  pg.on('pageerror',e=>console.log('ERR',e.message.slice(0,200)));
  await pg.goto('file://'+path.resolve(__dirname,'../dist/market-prof.html')+'?npcwait=99&'+q,{waitUntil:'commit'});
  for(let i=0;i<300;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started&&!!window.__R).catch(()=>false))break; }
  await pg.waitForTimeout(15000);   // (the stacked rooms are built a piece a moment after the start; let them finish and the spot settle)
  const R=await pg.evaluate(async NF=>{ const {renderer,composer,scene}=__R, gl=renderer.getContext();
    // ---- names: who owns each object ----
    renderer.info.autoReset=false; const own=new Map(), tag=(root,l)=>{ if(root&&root.traverse)root.traverse(o=>{ if(!own.has(o))own.set(o,l); }); };
    const place=me=>{ const c={}; for(const o of me.userData.objOf||[])if(o)c[o.place]=(c[o.place]||0)+1; const e=Object.entries(c).sort((a,b)=>b[1]-a[1]); return e.length?e.map(x=>x[0]).slice(0,2).join('+'):'?'; };
    scene.traverse(o=>{ if(o.isMesh&&o.userData&&o.userData.objOf)own.set(o,'batch:'+place(o)+':'+o.material.type.replace('Mesh','').replace('Material','')); });
    for(const N of (window.CREATS||[]))tag(N.g,'creature:'+String(N.key).replace(/\d+$/,''));
    for(const N of (window.DROIDS||[]))tag(N.g,'droid');
    for(const N of (window.PAWNL||[]))tag(N.g,'pawn');
    for(const N of __R.NPCS)tag(N.g,'npc:'+String(N.key).replace(/\d+$/,''));
    tag(__R.W3.group,'walker (you)'); for(const k of ['MUS','PNM','SGM','DRM'])if(__R[k]&&__R[k].g)tag(__R[k].g,'musician:'+k);
    if(__R.WATER.mesh)tag(__R.WATER.mesh,'water:pool'); for(const w of __R.WATER.extra||[])if(w.mesh)tag(w.mesh,'water:extra');
    if(window.WX)for(const [k,v] of Object.entries(WX))if(v&&v.isObject3D)tag(v,'weather:'+k);
    for(const [k,g] of Object.entries(__R.MAPG))tag(g,'mapg:'+k);
    scene.children.forEach((c,i)=>{ if(own.has(c))return; if(c.userData&&c.userData.objOf){ tag(c,'batch:'+place(c)+':'+c.material.type.replace('Mesh','').replace('Material','')); return; }
      tag(c,(c.name||c.type)+(c.isLight?'':'#'+i)); });
    const label=o=>{ if(own.has(o))return own.get(o); let p=o; while(p.parent&&!own.has(p))p=p.parent; return own.get(p)||('detached:'+o.type+':'+(o.material&&o.material.type)+':'+(o.geometry&&o.geometry.attributes.position?o.geometry.attributes.position.count:0)); };
    // ---- the render targets, by who holds them ----
    const rtName=new Map(); const nm=(rt,l)=>{ if(rt&&rt.isWebGLRenderTarget&&!rtName.has(rt))rtName.set(rt,l); };
    for(const N of __R.NPCS)nm(N.sm,'npc self-shadow'); nm(__R.W3.sm,'walker self-shadow'); nm(composer.renderTarget1,'composer'); nm(composer.renderTarget2,'composer');
    for(const [k,v] of Object.entries(__R.WATER))nm(v,'water.'+k); for(const w of __R.WATER.extra||[])for(const [k,v] of Object.entries(w))nm(v,'waterx.'+k); if(__R.OUTL)for(const [k,v] of Object.entries(__R.OUTL))nm(v,'outline.'+k);
    const lights=[]; scene.traverse(o=>{ if(o.isLight)lights.push(o); });
    const camL=new Map(); lights.forEach((L,i)=>{ if(L.shadow&&L.shadow.camera)camL.set(L.shadow.camera,(L.isPointLight?'point':L.isDirectionalLight?'sun':L.type)+'#'+i+'('+L.shadow.mapSize.x+')'); });
    const rtl=t=>t?(rtName.get(t)||('rt '+t.width+'x'+t.height)):'screen';
    // ---- hooks: every render call, the shadow maps, every draw ----
    let FIN=false, REC=null, pass='?'; const PASS={}, stack=[];
    const r0=renderer.render.bind(renderer); renderer.render=(s,c)=>{ const tgt=renderer.getRenderTarget(), l=rtl(tgt)+' <- '+(s===scene?'world':(s.isScene?'scene:'+(s.name||s.children.length+'ch'):s.type))+' / '+(c.isOrthographicCamera?'ortho':c.isPerspectiveCamera?'persp':c.type);
      const p0=pass; pass=l; const i0=renderer.info.render.calls, t0=renderer.info.render.triangles; stack.push(0); const a=performance.now(); r0(s,c); if(FIN)gl.finish(); const d=performance.now()-a, inner=stack.pop();
      const P=PASS[l]||(PASS[l]={n:0,ms:0,calls:0,tris:0}); P.n++; P.ms+=d-inner; P.calls+=renderer.info.render.calls-i0; P.tris+=renderer.info.render.triangles-t0; pass=p0; if(stack.length)stack[stack.length-1]+=d; };
    const sm=renderer.shadowMap, s0=sm.render.bind(sm); sm.render=(L,s,c)=>{ const p0=pass; pass='shadow'; const i0=renderer.info.render.calls, t0=renderer.info.render.triangles; stack.push(0); const a=performance.now(); s0(L,s,c); if(FIN)gl.finish(); const d=performance.now()-a; stack.pop();
      const P=PASS['shadow maps']||(PASS['shadow maps']={n:0,ms:0,calls:0,tris:0}); P.n++; P.ms+=d; P.calls+=renderer.info.render.calls-i0; P.tris+=renderer.info.render.triangles-t0; pass=p0; if(stack.length)stack[stack.length-1]+=d; };
    const rb0=renderer.renderBufferDirect.bind(renderer); renderer.renderBufferDirect=(c,s,g,m,o,grp)=>{ if(REC){ const n=g.index?g.index.count:g.attributes.position?g.attributes.position.count:0, dr=g.drawRange;
        let st=Math.max(dr.start,grp?grp.start:0), en=Math.min(dr.start+dr.count,grp?grp.start+grp.count:Infinity,n); const inst=o.isInstancedMesh?o.count:g.isInstancedBufferGeometry?g.instanceCount:1;
        const prim=o.isPoints?'pts':o.isLine||o.isLineSegments?'line':'tri'; let cnt=Math.max(0,en-st)/(prim==='tri'?3:1)*inst;
        if(o.isBatchedMesh&&o._multiDrawCounts){ let k=0; for(let i=0;i<o._multiDrawCount;i++)k+=o._multiDrawCounts[i]; cnt=k/(prim==='tri'?3:1); }   // a batch draws only its pieces left after its own cull
        REC.push({pass:s===null?('shadow '+(camL.get(c)||'?')):pass,owner:label(o),prim,cnt,o,culled:o.frustumCulled,mat:m.type}); } rb0(c,s,g,m,o,grp); };
    const fr=()=>new Promise(r=>requestAnimationFrame(()=>r()));
    // ---- frames: CPU by system, render calls ----
    const IA={n:0,calls:0,tris:0,pts:0,lines:0,max:0}; __PF.onFrame=()=>{ const r=renderer.info.render; IA.n++; IA.calls+=r.calls; IA.tris+=r.triangles; IA.pts+=r.points; IA.lines+=r.lines; IA.max=Math.max(IA.max,r.triangles); };
    __PF.hist.length=0; for(const k in PASS)delete PASS[k]; for(let i=0;i<NF;i++)await fr(); await fr(); __PF.onFrame=null;
    const H=__PF.hist.slice(-NF), segs={}; for(const f of H)for(const [k,v] of Object.entries(f))(segs[k]||(segs[k]=[])).push(v);
    const med=a=>{ const s=a.slice().sort((x,y)=>x-y); return s[s.length>>1]; }, mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
    const cpu=Object.fromEntries(Object.entries(segs).map(([k,a])=>[k,{med:+med(a).toFixed(3),mean:+mean(a).toFixed(3),max:+Math.max(...a).toFixed(2)}]).sort((a,b)=>b[1].mean-a[1].mean));
    const passes=Object.fromEntries(Object.entries(PASS).map(([k,P])=>[k,{perFrame:+(P.n/NF).toFixed(2),calls:+(P.calls/NF).toFixed(1),tris:Math.round(P.tris/NF),ms:+(P.ms/NF).toFixed(2)}]));
    const info={frames:IA.n,callsPerFrame:Math.round(IA.calls/IA.n),trisPerFrame:Math.round(IA.tris/IA.n),trisMaxFrame:IA.max,points:Math.round(IA.pts/IA.n),lines:Math.round(IA.lines/IA.n)};
    // ---- again with the graphics waited on after each pass (software graphics: relative only) ----
    const NFF=Math.max(10,NF>>2); for(const k in PASS)delete PASS[k]; FIN=true; __PF.hist.length=0; for(let i=0;i<NFF;i++)await fr(); FIN=false;
    const HF=__PF.hist.slice(-NFF), passesFin=Object.fromEntries(Object.entries(PASS).map(([k,P])=>[k,{perFrame:+(P.n/NFF).toFixed(2),ms:+(P.ms/NFF).toFixed(2)}]).sort((a,b)=>b[1].ms-a[1].ms));
    const totalFin=+mean(HF.map(f=>f.total)).toFixed(1);
    // ---- one frame's every draw, by its owner ----
    REC=[]; await fr(); await fr(); const D=REC; REC=null; const NR=2;
    const cam=__R.cam; cam.updateMatrixWorld(); const M4=cam.projectionMatrix.clone().multiply(cam.matrixWorldInverse); const e=M4.elements;
    const inView=(x,y,z)=>{ const w=e[3]*x+e[7]*y+e[11]*z+e[15], X=(e[0]*x+e[4]*y+e[8]*z+e[12])/w, Y=(e[1]*x+e[5]*y+e[9]*z+e[13])/w, Z=(e[2]*x+e[6]*y+e[10]*z+e[14])/w; return X>-1.05&&X<1.05&&Y>-1.05&&Y<1.05&&Z>-1&&Z<1; };
    const PL=[[e[3]+e[0],e[7]+e[4],e[11]+e[8],e[15]+e[12]],[e[3]-e[0],e[7]-e[4],e[11]-e[8],e[15]-e[12]],[e[3]+e[1],e[7]+e[5],e[11]+e[9],e[15]+e[13]],[e[3]-e[1],e[7]-e[5],e[11]-e[9],e[15]-e[13]],[e[3]+e[2],e[7]+e[6],e[11]+e[10],e[15]+e[14]],[e[3]-e[2],e[7]-e[6],e[11]-e[10],e[15]-e[14]]].map(p=>{ const l=Math.hypot(p[0],p[1],p[2]); return p.map(v=>v/l); });
    const sphereIn=(x,y,z,r)=>PL.every(p=>p[0]*x+p[1]*y+p[2]*z+p[3]>-r);
    const boxes=__R.ROOMS.boxes(), cur=__R.ROOMS.cur, inRoom=(x,y,z)=>boxes.some(B=>B!==cur&&x>B.x0&&x<B.x1&&z>B.z0&&z<B.z1&&(B.y0==null||y>B.y0-.1)&&(B.y1==null||y<B.y1+.1));
    const geomStat=new Map(); const stat=o=>{ if(geomStat.has(o))return geomStat.get(o); const g=o.geometry, P=g&&g.attributes.position; let r={n:0,vis:0,room:0};
      if(o.isInstancedMesh||o.isBatchedMesh){ o.updateWorldMatrix(true,false); const MW=o.matrixWorld, S=o.matrixWorld.getMaxScaleOnAxis(), M=MW.clone(), c=MW.elements.slice(0,0); const pieces=[];
          if(o.isInstancedMesh){ const g=o.geometry; if(!g.boundingSphere)g.computeBoundingSphere(); for(let i=0;i<o.count;i++){ o.getMatrixAt(i,M); pieces.push([M.clone().premultiply(MW),g.boundingSphere,(g.index?g.index.count:g.attributes.position.count)/3]); } }
          else if(o._instanceInfo)o._instanceInfo.forEach((r,i)=>{ if(!r||!r.active||!r.visible)return; const G=o._geometryInfo[r.geometryIndex]; const bs=o.getBoundingSphereAt(r.geometryIndex,G.boundingSphere?G.boundingSphere.clone():undefined); if(!bs)return; o.getMatrixAt(i,M); pieces.push([M.clone().premultiply(MW),bs,G.count/3]); });
          let all=0, in_=0; for(const [m,bs,t] of pieces){ const v=bs.center.clone().applyMatrix4(m), rr=bs.radius*m.getMaxScaleOnAxis(); all+=t; if(sphereIn(v.x,v.y,v.z,rr))in_+=t; } r={n:all||1,vis:in_,room:0}; }
      else if(P&&!o.isSkinnedMesh&&!o.isPoints&&!o.isLine){ o.updateWorldMatrix(true,false); const m=o.matrixWorld.elements, I=g.index?g.index.array:null, nT=(I?I.length:P.count)/3, A=P.array, st=P.itemSize, step=Math.max(1,Math.floor(nT/400000));
        const id=k=>I?I[k]:k; let s=0; for(let t=0;t<nT;t+=step){ let x=0,y=0,z=0; for(let k=0;k<3;k++){ const v=id(t*3+k)*(P.isInterleavedBufferAttribute?P.data.stride:st)+(P.isInterleavedBufferAttribute?P.offset:0); x+=A[v]; y+=A[v+1]; z+=A[v+2]; } x/=3; y/=3; z/=3;
          const wx=m[0]*x+m[4]*y+m[8]*z+m[12], wy=m[1]*x+m[5]*y+m[9]*z+m[13], wz=m[2]*x+m[6]*y+m[10]*z+m[14]; s++; if(inView(wx,wy,wz))r.vis++; if(!cur&&inRoom(wx,wy,wz))r.room++; }
        r.n=s; } else if(o.isObject3D){ const p=o.getWorldPosition(o.position.clone()); r={n:1,vis:inView(p.x,p.y+.5,p.z)?1:0,room:0}; } geomStat.set(o,r); return r; };
    const byOwner={}, byPass={};
    for(const d of D){ const k=d.pass.startsWith('shadow')?'shadow':d.pass, O=(byOwner[d.owner]||(byOwner[d.owner]={draws:0,tris:0,shadowDraws:0,shadowTris:0,visTris:0,roomTris:0,pts:0,noCull:0}));
      const BP=(byPass[d.pass]||(byPass[d.pass]={draws:0,tris:0}));  BP.draws++; BP.tris+=d.prim==='tri'?d.cnt:0;
      if(d.prim!=='tri'){ O.pts+=d.cnt; continue; }
      if(k==='shadow'){ O.shadowDraws++; O.shadowTris+=d.cnt; continue; }
      if(!d.pass.includes('<- world')){ (O.other||(O.other={}))[d.pass]=(O.other[d.pass]||0)+d.cnt; continue; }
      O.draws++; O.tris+=d.cnt; if(!d.culled)O.noCull++; const s=stat(d.o); if(s.n){ O.visTris+=d.cnt*s.vis/s.n; O.roomTris+=d.cnt*s.room/s.n; } }
    for(const O of Object.values(byOwner))for(const k of ['draws','tris','shadowDraws','shadowTris','visTris','roomTris','pts','noCull'])O[k]=Math.round(O[k]/NR); for(const P of Object.values(byPass)){ P.draws=Math.round(P.draws/NR); P.tris=Math.round(P.tris/NR); }
    // ---- what's held: lights, targets, programs, frustumCulled=false ----
    const L=lights.map((L,i)=>({i,type:L.type,on:L.visible&&L.intensity>0,owner:label(L),shadow:!!L.castShadow,map:L.castShadow?L.shadow.mapSize.x:0,auto:L.castShadow?L.shadow.autoUpdate:null}));
    const lightSum={total:L.length,lit:L.filter(l=>l.on).length,shadow:L.filter(l=>l.shadow).map(l=>`${l.type}#${l.i} ${l.map} ${l.auto?'every frame':'once'} on:${l.on} ${l.owner}`)};
    const rts={}; for(const [t,l] of rtName){ const k=l+' '+t.width+'x'+t.height; rts[k]=(rts[k]||0)+1; } for(const l of lights)if(l.shadow&&l.shadow.map){ const k='shadow map '+l.type+' '+l.shadow.map.width+'x'+l.shadow.map.height; rts[k]=(rts[k]||0)+1; }
    const progs={}; for(const p of renderer.info.programs||[]){ progs[p.name]=(progs[p.name]||0)+1; }
    const noCull={}; scene.traverse(o=>{ if((o.isMesh||o.isPoints||o.isLine)&&!o.frustumCulled){ let v=o.visible, p=o.parent; while(v&&p){ v=p.visible; p=p.parent; } const k=label(o)+(v?'':' (hidden)'); noCull[k]=(noCull[k]||0)+1; } });
    let objs=0, vis=0; scene.traverse(o=>{ if(o.isMesh||o.isPoints||o.isLine){ objs++; let v=o.visible, p=o.parent; while(v&&p){ v=p.visible; p=p.parent; } if(v)vis++; } });
    const res={RW:__R.RW,RH:__R.RH,canvas:[renderer.domElement.width,renderer.domElement.height],css:[innerWidth,innerHeight],dpr:devicePixelRatio,pixelRatio:renderer.getPixelRatio(),composerRT:[composer.renderTarget1.width,composer.renderTarget1.height]};
    return {where:{pos:[+__R.pos.x.toFixed(1),+__R.pos.z.toFixed(1)],LVL:__R.LVL,room:cur?[+cur.x0.toFixed(1),+cur.z0.toFixed(1),+cur.x1.toFixed(1),+cur.z1.toFixed(1)]:null,clip:renderer.clippingPlanes.length},
      res,info,cpu,passes,totalFin,passesFin,byPass,byOwner:Object.fromEntries(Object.entries(byOwner).sort((a,b)=>(b[1].tris+b[1].shadowTris)-(a[1].tris+a[1].shadowTris))),
      lights:lightSum,rts,programs:{count:(renderer.info.programs||[]).length,byName:progs},memory:renderer.info.memory,noCull,objects:{meshes:objs,visible:vis},
      npcs:{all:__R.NPCS.length,far:__R.NPCS.filter(N=>N.far).length,shown:__R.NPCS.filter(N=>N.g.visible&&!N.far).length}};
  },NF);
  R.query=q; fs.writeFileSync(out,JSON.stringify(R,null,1)); await pg.screenshot({path:out.replace(/\.json$/,'.png')}); console.log('done',out,'frame',R.cpu.total,'calls',R.info.callsPerFrame,'tris',R.info.trisPerFrame); await b.close(); })();
