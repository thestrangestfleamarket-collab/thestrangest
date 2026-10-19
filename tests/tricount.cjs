// THE TRIANGLE COUNT (19 Oct 2026): node tests/tricount.cjs [out prefix] [page] [spots]: at fixed spots at the opening ISOMETRIC view, one frame's
// triangles by pass (the main picture, the river's pre-pass of it, each shadow light, the other passes; PERFX.bounds() called at each spot as the game does every 2 s) and the main picture's top 25 owners (with how much of each is inside
// the view), a screenshot each (frames are taken until the lawn's chunks round you are made, a one-off pass each); out prefix.json holds it all. The owner's budget: the main picture under 100,000.
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'/tmp/tricount', PAGE=path.resolve(process.argv[3]||path.resolve(__dirname,'../dist/market.html')), ONLY=process.argv[4]?process.argv[4].split(','):null;
const SPOTS=[['bodega','()=>[12,3]'],['inbodega','()=>[9.9,-3.4]'],['parkgate','()=>{ const P=PARK,B=__dbg.MAPK.BOD; return [B.XS(P.round[0]+(P.ox||0)),B.ZS(P.y0+(P.oy||0))-1.2]; }'],['mainrow','()=>[33,2.5]'],
  ['barmuseum','()=>[-57,2.5]'],['holodeck','()=>[118.6,2.5]'],['parkmid','()=>{ const P=PARK,B=__dbg.MAPK.BOD; return [B.XS(P.round[0]+(P.ox||0))+4,B.ZS(P.round[1]+(P.oy||0))]; }'],
  ['barinside','()=>[-69.9,-8]'],['night','()=>(__dbg.CLOCK.set(22),[12,3])']].filter(s=>!ONLY||ONLY.includes(s[0]));
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1920,height:1080}}); pg.setDefaultTimeout(600000);
  pg.on('pageerror',e=>console.log('ERR',e.message.slice(0,200)));
  await pg.goto('file://'+PAGE+'?fresh=1&hideme=1&hour=13',{waitUntil:'commit'});
  for(let i=0;i<400&&!(await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(1000);
  await pg.evaluate(()=>{ STORE.ensure(); const D=__dbg, renderer=D.renderer, scene=D.scene, cam=D.camera; const own=new Map(), tag=(root,l)=>{ if(root&&root.traverse)root.traverse(o=>{ if(!own.has(o))own.set(o,l); }); };
    const place=me=>{ const c={}; for(const o of me.userData.objOf||[])if(o)c[o.place]=(c[o.place]||0)+1; const e=Object.entries(c).sort((a,b)=>b[1]-a[1]); return e.length?e.map(x=>x[0]).slice(0,2).join('+'):'?'; };
    window.__TC={own,tag,place,REC:null,pass:'?'}; const T=window.__TC;
    T.label=o=>{ if(o.userData.cullOf)o=o.userData.cullOf; if(own.has(o))return own.get(o); if(o.userData&&o.userData.objOf)return 'batch:'+place(o)+':'+o.material.type.replace('Mesh','').replace('Material','');
      const P=[]; for(let q=o;q&&q!==scene;q=q.parent){ const n=q.name||(q.userData&&(q.userData.key||q.userData.kind)); if(n)P.push(n); if(P.length>=2)break; } let r=o; while(r.parent&&r.parent!==scene)r=r.parent; const mk=Object.entries(D.MAPG).find(([k,g])=>g===r||g===r.parent);
      return (mk?mk[0]+':':'')+(P.length?P.reverse().join('/'):o.type+':'+(o.material&&o.material.type))+(o.isInstancedMesh?' (inst)':'')+(o.isBatchedMesh?' (batched)':''); };
    T.retag=()=>{ own.clear(); for(const N of (window.CREATS||[]))tag(N.g,'creature:'+String(N.key).replace(/\d+$/,'')); for(const N of (window.PAWNL||[]))tag(N.g,'pawn'); for(const N of D.NPCS)tag(N.g,'npc:'+String(N.key).replace(/\d+$/,''));
      tag(D.W3.group,'walker (you)'); for(const k of ['MUS','PNM','SGM','DRM','BWK'])if(window[k]&&window[k].g)tag(window[k].g,'musician:'+k); };
    const lights=[]; scene.traverse(o=>{ if(o.isLight)lights.push(o); }); T.camL=new Map(); lights.forEach((L,i)=>{ if(L.shadow&&L.shadow.camera)T.camL.set(L.shadow.camera,(L.isPointLight?'lamp':L.isDirectionalLight?'sun':L.type)+'#'+i); });
    const rtl=t=>t?('rt '+t.width+'x'+t.height):'screen';
    const r0=renderer.render.bind(renderer); renderer.render=(s,c)=>{ const p0=T.pass; T.pass=rtl(renderer.getRenderTarget())+' <- '+(s===scene?(c===cam?(new Error().stack.includes('RenderPass')?'MAIN':'river pre-pass (main camera)'):'world/other cam'):(s.isScene?'scene:'+(s.name||s.children.length+'ch'):s.type)); r0(s,c); T.pass=p0; };
    const rb0=renderer.renderBufferDirect.bind(renderer); renderer.renderBufferDirect=(c,s,g,m,o,grp)=>{ if(!T.REC)return rb0(c,s,g,m,o,grp); const t0=renderer.info.render.triangles; rb0(c,s,g,m,o,grp);
      const n=renderer.info.render.triangles-t0; if(n)T.REC.push({pass:s===null||T.camL.has(c)?'shadow '+(T.camL.get(c)||'?'):T.pass,o,n,cull:o.frustumCulled}); };
    T.frame=()=>new Promise(res=>requestAnimationFrame(()=>{ T.REC=[]; requestAnimationFrame(()=>{ const R=T.REC; T.REC=null; res(R); }); }));
    T.inView=()=>{ cam.updateMatrixWorld(); const e=cam.projectionMatrix.clone().multiply(cam.matrixWorldInverse).elements; return (x,y,z)=>{ const w=e[3]*x+e[7]*y+e[11]*z+e[15], X=(e[0]*x+e[4]*y+e[8]*z+e[12])/w, Y=(e[1]*x+e[5]*y+e[9]*z+e[13])/w; return X>-1.05&&X<1.05&&Y>-1.05&&Y<1.05; }; };
    T.vis=(o,iv)=>{ const g=o.geometry, P=g&&g.attributes.position; if(!P||o.isSkinnedMesh||o.isPoints)return null; o.updateWorldMatrix(true,false); const I=g.index?g.index.array:null, nT=(I?I.length:P.count)/3, step=Math.max(1,Math.floor(nT/3000));
      const inst=o.isInstancedMesh?o.count:1, M=new D.THREE.Matrix4(), Mi=new D.THREE.Matrix4(), v=new D.THREE.Vector3(); let n=0,k=0; for(let i=0;i<inst;i+=Math.max(1,Math.floor(inst/200))){ if(o.isInstancedMesh){ o.getMatrixAt(i,Mi); M.multiplyMatrices(o.matrixWorld,Mi); } else M.copy(o.matrixWorld);
        for(let t=0;t<nT;t+=step){ const a=I?I[t*3]:t*3; v.fromBufferAttribute(P,a).applyMatrix4(M); n++; if(iv(v.x,v.y,v.z))k++; } } return n?k/n:null; };
  });
  const res={}; const T0=Date.now();
  for(const [name,fn] of SPOTS){ await pg.evaluate(f=>{ const [x,z]=eval(f)(); __dbg.UI.goTo(x,z,'up'); },fn); await pg.waitForTimeout(9000); await pg.evaluate(()=>__dbg.PERFX.bounds()); await pg.waitForTimeout(2000);
    const r=await pg.evaluate(async()=>{ const T=__TC; T.retag(); const ms=[]; let R; for(let i=0;i<40;i++){ const a=performance.now(); R=await T.frame(); ms.push(performance.now()-a); if(i>=3&&!R.some(d=>d.pass.includes('other cam')))break; }
      const iv=T.inView(), byPass={}, by={}; for(const d of R){ byPass[d.pass]=(byPass[d.pass]||0)+d.n; if(!d.pass.includes('MAIN'))continue; const L=T.label(d.o), O=by[L]||(by[L]={tris:0,draws:0,vis:0,nocull:0,_v:[]}); O.tris+=d.n; O.draws++; if(!d.cull)O.nocull++; const f=T.vis(d.o,iv); if(f!=null)O._v.push([f,d.n]); }
      for(const O of Object.values(by)){ const s=O._v.reduce((a,x)=>a+x[1],0); O.vis=s?Math.round(O._v.reduce((a,x)=>a+x[0]*x[1],0)/s*100):null; delete O._v; }
      const main=Object.entries(byPass).filter(([k])=>k.includes('MAIN')).reduce((a,x)=>a+x[1],0), shadow=Object.entries(byPass).filter(([k])=>k.startsWith('shadow')).reduce((a,x)=>a+x[1],0);
      return {pos:__dbg.pos().map(v=>+v.toFixed(1)),main,shadow,total:Object.values(byPass).reduce((a,x)=>a+x,0),byPass,frames:ms.length,frameMs:ms.slice(-3).map(x=>Math.round(x)),top:Object.entries(by).sort((a,b)=>b[1].tris-a[1].tris).slice(0,25)}; });
    res[name]=r; await pg.screenshot({path:OUT+'_'+name+'.png'});
    console.log(`== ${name} at ${r.pos}: MAIN ${r.main}  shadow ${r.shadow}  all ${r.total}  frame ms ${r.frameMs}`); for(const [k,v] of Object.entries(r.byPass))console.log('   pass '+String(v).padStart(7)+'  '+k);
    for(const [k,O] of r.top)console.log('   '+String(O.tris).padStart(7)+'  '+String(O.draws).padStart(3)+'d  '+(O.vis==null?'  ?':String(O.vis).padStart(3))+'% in view'+(O.nocull?' nocull'+O.nocull:'')+'  '+k); }
  fs.writeFileSync(OUT+'.json',JSON.stringify(res,null,1)); console.log('secs',Math.round((Date.now()-T0)/1000)); await b.close(); })();
