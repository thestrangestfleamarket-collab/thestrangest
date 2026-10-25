// THE MAP FOR GODOT, CHECKED: reads godot/map/ back with three.js's own glTF reader, puts the repeated things where instances.gd puts them
// (every _protos name found, world.bin's length right, no NaN), and draws it from the start's corner to argv[2] beside the game's own picture.
// node godot/tools/check.cjs [out folder]   (after godot/tools/export.cjs)
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'../..'), MAP=path.join(ROOT,'godot/map'), OUT=path.resolve(process.argv[2]||'.');
(async()=>{ const exe=fs.existsSync(chromium.executablePath())?undefined:process.env.CHROME||'/opt/pw-browsers/chromium';
  const b=await chromium.launch({executablePath:exe,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}), pg=await b.newPage({viewport:{width:960,height:640}}), errs=[];
  pg.on('pageerror',e=>errs.push(e.message)); pg.on('crash',()=>console.log('PAGE CRASHED')); if(process.env.LOG)pg.on('console',m=>console.log('page:',m.text())); pg.on('console',m=>{ if(m.type()==='error'&&!/favicon|404/.test(m.text()+m.location().url))errs.push(m.text()); });
  const PAGE=`<!doctype html><body style="margin:0"><script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>`;
  const srv=require('http').createServer((q,s)=>{ const n=path.basename(new URL(q.url,'http://x').pathname), f=path.join(MAP,n);
    if(q.url==='/'){ s.setHeader('content-type','text/html'); s.end(PAGE); } else if(n&&fs.existsSync(f))fs.createReadStream(f).pipe(s); else { s.statusCode=404; s.end(); } });
  await new Promise(r=>srv.listen(0,'127.0.0.1',r)); await pg.goto('http://127.0.0.1:'+srv.address().port+'/');
  const r=await pg.evaluate(async()=>{ const T=await import('three'), {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
    const info=await (await fetch('/world.json')).json(), data=new Float32Array(await (await fetch('/world.bin')).arrayBuffer());
    console.log('loading'); const g=await new GLTFLoader().loadAsync('/world.glb'); console.log('loaded'); const root=g.scene, protos=root.getObjectByName('_protos'), bad=[];
    let tris=0, meshes=0, copies=0; root.traverse(o=>{ if(o.isMesh&&!protos.getObjectById(o.id)){ meshes++; tris+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3; } });
    protos.visible=false; const M=new T.Matrix4(), C=new T.Color();
    for(const e of info.instances){ const p=protos.getObjectByName(e.proto); if(!p){ bad.push('no '+e.proto); continue; } if(e.at+e.n*15>data.length){ bad.push('short '+e.proto); continue; }
      const im=new T.InstancedMesh(p.geometry,p.material,e.n); for(let k=0;k<e.n;k++){ const o=e.at+k*15, d=data.subarray(o,o+15); if(d.some(v=>!Number.isFinite(v))){ bad.push('NaN '+e.proto); break; }
        M.set(d[0],d[3],d[6],d[9], d[1],d[4],d[7],d[10], d[2],d[5],d[8],d[11], 0,0,0,1); im.setMatrixAt(k,M); im.setColorAt(k,C.setRGB(d[12],d[13],d[14])); }
      root.add(im); copies+=e.n; }
    // the characters where main.tscn stands them, each read once
    const SkeletonUtils=await import('three/addons/utils/SkeletonUtils.js'), CH={}, anims={}; for(const c of info.characters||[]){ if(!CH[c.key]){ const g=await new GLTFLoader().loadAsync('/char-'+c.key+'.glb'); CH[c.key]=g; anims[c.key]=g.animations.length; }
      const o=SkeletonUtils.clone(CH[c.key].scene); o.matrixAutoUpdate=false; o.matrix.fromArray(c.m); root.add(o); }
    const sc=new T.Scene(); sc.add(root); const L=info.light, bg=L.bg; sc.background=new T.Color(...bg);
    if(L.hemi)sc.add(new T.HemisphereLight(new T.Color(...L.hemi.sky),new T.Color(...L.hemi.gnd),L.hemi.i)); if(L.amb)sc.add(new T.AmbientLight(0xffffff,L.amb));
    if(L.sun){ const s=new T.DirectionalLight(new T.Color(...L.sun.c),L.sun.i); s.position.set(...L.sun.d); sc.add(s); }
    const [x,y,z]=info.start, ren=new T.WebGLRenderer({antialias:true}); ren.setSize(960,640); document.body.appendChild(ren.domElement);
    const shot=(d,name)=>{ const cam=new T.PerspectiveCamera(40,960/640,.1,4000); cam.position.set(x+d,y+d,z+d); cam.lookAt(x,y,z); ren.render(sc,cam); return ren.domElement.toDataURL('image/png'); };
    const box=new T.Box3().setFromObject(root);
    // one of each character in a row, at its own size, lit like the map
    const who=()=>{ const keys=Object.keys(CH); if(!keys.length)return null; const row=new T.Scene(), q=new T.Quaternion(), v=new T.Vector3(), sz=new T.Vector3(); row.background=sc.background;
      sc.children.filter(o=>o.isLight).forEach(l=>row.add(l.clone())); const {clone}=SkeletonUtils, per=10, gap=2.2;
      keys.forEach((k,i)=>{ const c=info.characters.find(c=>c.key===k); new T.Matrix4().fromArray(c.m).decompose(v,q,sz); const o=clone(CH[k].scene); o.scale.copy(sz); o.position.set((i%per)*gap,0,Math.floor(i/per)*gap*1.6); row.add(o); });
      const cam=new T.PerspectiveCamera(30,960/640,.1,500); cam.position.set(per*gap/2,9,Math.ceil(keys.length/per)*gap*1.6+16); cam.lookAt(per*gap/2,0,Math.ceil(keys.length/per)*gap*.6); ren.render(row,cam); return ren.domElement.toDataURL('image/png'); };
    return {chars:Object.keys(CH).length,anims,people:who(),meshes,tris:Math.round(tris),copies,runs:info.instances.length,bad,box:[box.min.toArray().map(Math.round),box.max.toArray().map(Math.round)],near:shot(40),far:shot(120),over:(()=>{ const c=box.getCenter(new T.Vector3()), w=box.max.x-box.min.x, h=box.max.z-box.min.z, k=Math.max(w/960,h/640)/2*1.02, cam=new T.OrthographicCamera(-480*k,480*k,320*k,-320*k,1,5000); cam.position.set(c.x,box.max.y+100,c.z); cam.up.set(0,0,-1); cam.lookAt(c.x,0,c.z); ren.render(sc,cam); return ren.domElement.toDataURL('image/png'); })()}; });
  for(const k of ['near','far','over','people']){ fs.mkdirSync(OUT,{recursive:true}); if(r[k])fs.writeFileSync(path.join(OUT,`godot-map-${k}.png`),Buffer.from(r[k].split(',')[1],'base64')); }
  console.log('meshes',r.meshes,'triangles',r.tris,'| copies',r.copies,'in',r.runs,'runs | bounds',JSON.stringify(r.box));
  console.log('characters',r.chars,'kinds; clips:',Object.entries(r.anims).map(([k,n])=>k+' '+n).join(', '));
  console.log(r.bad.length?'PROBLEMS: '+r.bad.slice(0,10).join('; '):'every repeated thing found its shape'); if(errs.length)console.log('page errors:',errs.slice(0,5).join(' | '));
  srv.close(); await b.close(); process.exit(r.bad.length||errs.length?1:0); })();
