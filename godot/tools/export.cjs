// THE MAP FOR GODOT: opens dist/market.html headless and writes the whole outdoor map, as the game builds it, into godot/map/.
// node godot/tools/export.cjs   (after MIN=0 python3 build.py)
// world.glb: every mesh drawn (named by its place and its thing), the lamps, one copy of each repeated thing under _protos;
// world.json + world.bin: where the repeated things go (godot/scripts/instances.gd makes them MultiMeshes); char-<key>.glb: each character once,
// its body, its bones and every clip that moves them; main.tscn: the map, the characters where they stand, the sun, the sky, a camera.
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'../..'), GD=path.join(ROOT,'godot'), OUT=path.join(GD,'map'), HOUR=+(process.env.HOUR||15.5);
(async()=>{ fs.mkdirSync(OUT,{recursive:true});
  const exe=fs.existsSync(chromium.executablePath())?undefined:process.env.CHROME||'/opt/pw-browsers/chromium';
  const b=await chromium.launch({executablePath:exe,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:800,height:600}}); pg.on('pageerror',e=>console.log('page error:',e.message));
  // three.js from node_modules (the same version) for the page, with every AnimationClip made remembered: the characters' clips live in SKIN's cache
  const TH=path.join(ROOT,'node_modules/three'), CDN='https://cdn.jsdelivr.net/npm/three@0.160.0/';
  await pg.route(CDN+'**',r=>{ const u=r.request().url().slice(CDN.length).split('?')[0], f=path.join(TH,u==='build/three.module.min.js'?'build/three.module.js':u); if(!fs.existsSync(f))return r.continue();
    let t=fs.readFileSync(f,'utf8'); if(f.endsWith('three.module.js'))t=t.replace('class AnimationClip {\n\n\tconstructor( name, duration = - 1, tracks, blendMode = NormalAnimationBlendMode ) {\n','$&\t\t( globalThis.__CLIPS || ( globalThis.__CLIPS = [] ) ).push( this );\n');
    r.fulfill({body:t,headers:{'content-type':'application/javascript','access-control-allow-origin':'*'}}); });
  if(process.env.STANDS)pg.on('console',m=>{ if(m.text().startsWith('stand-in'))console.log(m.text()); });
  const parts={}; await pg.exposeFunction('__put',(name,s)=>{ (parts[name]||(parts[name]=[])).push(Buffer.from(s,'base64')); });
  await pg.goto('file://'+ROOT+'/dist/market.html?hour='+HOUR+'&fresh=1&cull=0&perfx=0&hideme=1&npcwait=99',{timeout:180000});
  await pg.waitForFunction(()=>window.__started,null,{timeout:240000,polling:1000}); await pg.waitForTimeout(3000);
  await pg.evaluate(async()=>{ const P=__dbg.MAPK.PARK; if(P&&!P.ready)await P.load(); if(P)P.show(true); const [x,,z]=__dbg.pos(); for(const q of BATCH.queues)q.near(x,z,1e9); });
  await pg.waitForTimeout(3000);

  const info=await pg.evaluate(async STANDS=>{ const D=__dbg, T=D.THREE;
    const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js'), BU=await import('three/addons/utils/BufferGeometryUtils.js');
    const skip=new Set(); for(const N of D.NPCS)if(N.g)N.g.traverse(o=>skip.add(o)); D.W3.group.traverse(o=>skip.add(o));
    const shown=o=>{ for(let q=o;q;q=q.parent)if(!q.visible||skip.has(q))return false; return o.layers.isEnabled(0); };
    const clean=s=>String(s||'').replace(/[^A-Za-z0-9_ -]+/g,'_').replace(/^_+|_+$/g,'').slice(0,60)||'thing';
    const top=o=>{ let q=o; while(q.parent&&q.parent!==D.scene)q=q.parent; return q===o?'misc':clean(q.name)||'misc'; };
    const named=o=>{ for(let q=o;q&&q!==D.scene;q=q.parent)if(q.name)return clean(q.name); return 'mesh'; };
    // the game's materials (lambert, toon, basic with its own shading patched in) as plain ones Godot reads: lit or unlit, colour, picture, glow
    const hx=c=>c?c.getHexString():'-', MC=new Map(), mat=(m,vc)=>{ if(m.isShaderMaterial)return stand(m);
      const k=[m.type,hx(m.color),m.map&&m.map.uuid,hx(m.emissive),m.emissiveMap&&m.emissiveMap.uuid,m.emissiveIntensity,m.transparent,m.opacity,m.alphaTest,m.side,m.blending,vc].join('|'); if(MC.has(k))return MC.get(k);
      const o={color:m.color?m.color.clone():new T.Color(1,1,1),map:m.map||null,vertexColors:vc,transparent:!!m.transparent,opacity:m.opacity??1,alphaTest:m.alphaTest||0,side:m.side,name:clean(m.name||m.type)};
      let n; if(m.isMeshBasicMaterial)n=new T.MeshBasicMaterial(o);
      else n=new T.MeshStandardMaterial({...o,roughness:1,metalness:0,emissive:m.emissive?m.emissive.clone():new T.Color(0,0,0),emissiveMap:m.emissiveMap||null,emissiveIntensity:m.emissiveIntensity??1});
      if(m.blending===T.AdditiveBlending){ n.transparent=true; n.depthWrite=false; }
      MC.set(k,n); return n; };
    // a custom-shaded surface (water and the like) stands in as a flat colour, its uniform's colour if it has one
    const stand=m=>{ const k='stand|'+m.uuid; if(MC.has(k))return MC.get(k); const u=m.uniforms||{}, c=Object.values(u).map(v=>v&&v.value).find(v=>v&&v.isColor);
      const n=new T.MeshStandardMaterial({color:c?c.clone():new T.Color(.3,.5,.65),roughness:1,metalness:0,transparent:!!m.transparent,opacity:m.transparent?.8:1,name:'stand-in'}); MC.set(k,n); return n; };
    const copy=(A,idx)=>{ const z=A.itemSize, n=idx?idx.length:A.count, d=new Float32Array(n*z), g=['getX','getY','getZ','getW'];
      for(let i=0;i<n;i++){ const v=idx?idx[i]:i; for(let k=0;k<z;k++)d[i*z+k]=A[g[k]](v); } return new T.BufferAttribute(d,z); };
    // a clean copy of a mesh's shape: position, normal, uv, colour (its own colours times the game's aCol); faces hidden by aOp dropped
    const shape=(g,m,keep)=>{ const A=g.attributes, aOp=A.aOp, vc=!!(m.vertexColors&&A.color)||!!A.aCol; let idx=g.index?Array.from(g.index.array):null;
      if(aOp||keep){ const n=idx?idx.length:A.position.count, L=[]; for(let t=0;t<n;t+=3){ const v=[0,1,2].map(k=>idx?idx[t+k]:t+k);
          if(keep&&!keep(t/3))continue; if(aOp&&v.some(q=>aOp.getX(q)<.01))continue; L.push(...v); } idx=L; }
      if(idx&&!idx.length)return null;
      const G=new T.BufferGeometry(); G.setAttribute('position',copy(A.position,idx)); if(A.normal)G.setAttribute('normal',copy(A.normal,idx)); if(A.uv)G.setAttribute('uv',copy(A.uv,idx));
      if(vc){ const n=G.attributes.position.count, C=new Float32Array(n*3); for(let i=0;i<n;i++){ const v=idx?idx[i]:i; let r=1,gg=1,bb=1;
          if(m.vertexColors&&A.color){ r*=A.color.getX(v); gg*=A.color.getY(v); bb*=A.color.getZ(v); } if(A.aCol){ r*=A.aCol.getX(v); gg*=A.aCol.getY(v); bb*=A.aCol.getZ(v); } C.set([r,gg,bb],i*3); }
        G.setAttribute('color',new T.BufferAttribute(C,3)); }
      if(g.groups.length&&!idx&&!aOp&&!keep)for(const q of g.groups)G.addGroup(q.start,q.count,q.materialIndex);
      return {G:BU.mergeVertices(G,1e-5),vc}; };
    const out=new T.Scene(), groups={}, grp=n=>groups[n]||(groups[n]=out.add(new T.Group())&&Object.assign(out.children[out.children.length-1],{name:n}));
    const protos=new T.Group(); protos.name='_protos'; const PK=new Map(), inst=[]; let floats=[], nf=0;
    const st={unseen:0,stand:0,meshes:0,tris:0,split:0,shader:0,skinned:0,hidden:0,protos:0,copies:0};
    D.scene.updateMatrixWorld(true);
    const all=[]; D.scene.traverse(o=>{ if(o.isMesh)all.push(o); });
    for(const o of all){ const g=o.geometry; if(!g||!g.attributes.position||skip.has(o))continue; if(!shown(o)){ st.hidden++; continue; }
      if(o.isSkinnedMesh){ st.skinned++; continue; } const ms=Array.isArray(o.material)?o.material:[o.material]; if(ms.some(m=>m.isRawShaderMaterial||m.isPointsMaterial)){ st.shader++; continue; }
      if(ms.every(m=>m.visible===false||m.colorWrite===false||m.transparent&&m.opacity<.01)){ st.unseen++; continue; }   // (boxes the game never draws: picking, depth)
      if(ms.some(m=>m.isShaderMaterial)){ if(!g.boundingSphere)g.computeBoundingSphere(); const big=g.boundingSphere.radius*o.matrixWorld.getMaxScaleOnAxis()>300, n=(g.index?g.index.count:g.attributes.position.count)/3;
        if(big||n<10){ st.shader++; continue; } st.stand++; if(STANDS)console.log('stand-in',top(o),named(o),n,o.getWorldPosition(new T.Vector3()).toArray().map(Math.round).join(','),Object.keys(ms[0].uniforms||{}).join(' ')); }
      if(o.isInstancedMesh){ if(!o.count)continue; const k=g.uuid+'|'+ms.map(m=>m.uuid).join(); let p=PK.get(k);
        if(!p){ const s=shape(g,ms[0]); if(!s)continue; const me=new T.Mesh(s.G,Array.isArray(o.material)?ms.map(m=>mat(m,s.vc)):mat(ms[0],s.vc)); me.name='proto_'+PK.size; protos.add(me); p={name:me.name}; PK.set(k,p); st.protos++; }
        const M=new T.Matrix4(), W=new T.Matrix4(), C=new T.Color(), e=W.elements, from=nf;
        for(let i=0;i<o.count;i++){ o.getMatrixAt(i,M); W.multiplyMatrices(o.matrixWorld,M); if(o.instanceColor)o.getColorAt(i,C); else C.setRGB(1,1,1);
          floats.push(e[0],e[1],e[2],e[4],e[5],e[6],e[8],e[9],e[10],e[12],e[13],e[14],C.r,C.g,C.b); nf+=15; }
        inst.push({proto:p.name,group:top(o),name:named(o),n:o.count,at:from}); st.copies+=o.count; continue; }
      const put=(G,vc,gname,name)=>{ const me=new T.Mesh(G,Array.isArray(o.material)?ms.map(m=>mat(m,vc)):mat(ms[0],vc)); me.name=name; me.matrixAutoUpdate=false; me.matrix.copy(o.matrixWorld);
        grp(gname).add(me); st.meshes++; st.tris+=(G.index?G.index.count:G.attributes.position.count)/3; };
      const of=o.userData.objOf;
      if(of&&!g.index&&g.attributes.position.count===of.length*6){   // a BATCH mesh: one per thing in it, named as the game names it
        const by=new Map(); of.forEach((ob,i)=>{ const L=by.get(ob)||by.set(ob,[]).get(ob); L.push(i); });
        for(const [ob,L] of by){ const S=new Set(L); const s=shape(g,ms[0],t=>S.has(t>>1)); if(!s)continue; put(s.G,s.vc,ob?clean(ob.place):top(o),ob?clean(ob.name):named(o)); st.split++; } continue; }
      const s=shape(g,ms[0]); if(s)put(s.G,s.vc,top(o),named(o)); }
    if(protos.children.length)out.add(protos);
    // the lamps, all of them as built (the game lights the nearest few at a time)
    const lamps=new T.Group(); lamps.name='lamps'; for(const L of D.LITE.recs){ if(!(L.intensity>0)||L.userData.off)continue; const gp=L.userData&&L.userData.grp; if(gp&&!shown(gp))continue;
      const l=new T.PointLight(L.color.clone(),L.intensity,L.distance,L.decay); l.position.copy(L.getWorldPosition?L.getWorldPosition(new T.Vector3()):L.position); l.name='lamp'; lamps.add(l); }
    out.add(lamps);
    // the light now: the sun, the sky's fill, the background
    const lit={}; D.scene.traverse(L=>{ if(L.isDirectionalLight&&L.visible&&!lit.sun){ const d=L.position.clone().sub(L.target.position).normalize(); lit.sun={d:d.toArray(),c:L.color.toArray(),i:L.intensity}; }
      if(L.isHemisphereLight&&L.visible&&!lit.hemi)lit.hemi={sky:L.color.toArray(),gnd:L.groundColor.toArray(),i:L.intensity}; if(L.isAmbientLight&&L.visible)lit.amb=(lit.amb||0)+L.intensity; });
    const bg=D.scene.background; lit.bg=bg&&bg.isColor?bg.toArray():[.5,.6,.7];
    const glb=await new GLTFExporter().parseAsync(out,{binary:true,onlyVisible:false,maxTextureSize:4096});
    const send=async(name,buf)=>{ const u=new Uint8Array(buf), N=3<<20; for(let i=0;i<u.length;i+=N){ let s=''; const c=u.subarray(i,i+N); for(let j=0;j<c.length;j+=32768)s+=String.fromCharCode.apply(null,c.subarray(j,j+32768)); await window.__put(name,btoa(s)); } };
    await send('world.glb',glb); await send('world.bin',new Float32Array(floats).buffer);
    // the characters: each kind once (its body, bones, and the clips whose tracks all move its bones), then where each stands
    const {clone}=await import('three/addons/utils/SkeletonUtils.js'), KEEP=['position','normal','uv','color','skinIndex','skinWeight'], CL=globalThis.__CLIPS||[], chars={}, placed=[];
    for(const N of D.NPCS){ if(!N.g)continue; const key=clean(N.key); N.g.updateMatrixWorld(true); placed.push({key,name:clean(N.name),m:N.g.matrixWorld.toArray()}); if(chars[key])continue;
      const c=clone(N.g); c.visible=true; c.position.set(0,0,0); c.quaternion.identity(); c.scale.set(1,1,1); c.name=key;
      const drop=[]; c.traverse(o=>{ if(!o.isMesh)return; const ms=Array.isArray(o.material)?o.material:[o.material]; if(!o.isSkinnedMesh&&ms.some(m=>m.isShaderMaterial)||ms.every(m=>m.visible===false||m.colorWrite===false||m.transparent&&m.opacity<.01)){ drop.push(o); return; }
        const g=o.geometry.clone(); for(const a in g.attributes)if(!KEEP.includes(a))g.deleteAttribute(a); if(!g.attributes.normal)g.computeVertexNormals(); o.geometry=g;
        if(g.attributes.color){ const A=g.attributes.color, C=new Float32Array(A.count*3); for(let i=0;i<A.count;i++){ C[i*3]=A.getX(i)**2.2; C[i*3+1]=A.getY(i)**2.2; C[i*3+2]=A.getZ(i)**2.2; } g.setAttribute('color',new T.BufferAttribute(C,3)); }   // (the characters' shaders take their colours as sRGB: pow(color,2.2))
        const vc=!!g.attributes.color, cm=m=>m.isShaderMaterial?new T.MeshStandardMaterial({color:0xffffff,vertexColors:vc,roughness:1,metalness:0,name:key}):mat(m,vc);
        o.material=Array.isArray(o.material)?ms.map(cm):cm(ms[0]); });
      for(const o of drop)o.removeFromParent();
      const inC=o=>{ for(let q=o;q;q=q.parent)if(q===c)return true; return false; };   // every bone in the file, shown (onlyVisible would drop a hidden one)
      c.traverse(o=>{ if(!o.isSkinnedMesh)return; const S=o.skeleton; S.bones=S.bones.map((bn,i)=>bn||c.add(Object.assign(new T.Bone(),{name:'loose_'+i})).children.at(-1));   // (a loose bone outside the body: clone leaves its slot empty)
        for(const bn of S.bones){ bn.visible=true; if(!inC(bn)){ let t=bn; while(t.parent&&!inC(t.parent))t=t.parent; c.add(t); } } });
      const bones=new Set(); c.traverse(o=>{ if(o.isBone)bones.add(o.name); }), seen=new Set();
      const clips=bones.size?CL.filter(k=>k.tracks.length&&!seen.has(k.name)&&k.tracks.every(t=>bones.has(T.PropertyBinding.parseTrackName(t.name).nodeName))&&seen.add(k.name)):[];
      const g=await new GLTFExporter().parseAsync(c,{binary:true,onlyVisible:true,animations:clips}); await send('char-'+key+'.glb',g);
      chars[key]={clips:clips.map(k=>k.name),bones:bones.size}; }
    const [x,y,z]=D.pos(); return {chars,placed,st,inst,lit,start:[x,y,z],groups:Object.keys(groups),textures:new Set([...MC.values()].map(m=>m.map&&m.map.uuid).filter(Boolean)).size,materials:MC.size}; },!!process.env.STANDS);

  for(const n in parts)fs.writeFileSync(path.join(OUT,n),Buffer.concat(parts[n]));
  fs.writeFileSync(path.join(OUT,'world.json'),JSON.stringify({hour:HOUR,start:info.start,light:info.lit,instances:info.inst,characters:info.placed}));
  fs.writeFileSync(path.join(GD,'main.tscn'),scene(info));
  const mb=f=>(fs.statSync(path.join(OUT,f)).size/1048576).toFixed(1)+' MB';
  console.log('meshes',info.st.meshes,'(split from batches',info.st.split+')','triangles',Math.round(info.st.tris),'| repeated:',info.st.protos,'shapes,',info.st.copies,'copies',
    '| stand-ins',info.st.stand,'| left out: never drawn',info.st.unseen,'shader',info.st.shader,'skinned',info.st.skinned,'hidden',info.st.hidden,'| textures',info.textures,'materials',info.materials);
  console.log('characters:',Object.entries(info.chars).map(([k,c])=>k+(c.bones?' ('+c.clips.length+' clips)':' (still)')).join(', '),'|',info.placed.length,'placed');
  console.log('groups:',info.groups.join(', ')); console.log('world.glb',mb('world.glb'),'world.bin',mb('world.bin'));
  await b.close(); })();

// main.tscn: the map, its repeated things, the sun and sky as the game has them at HOUR, a camera over the start
// (a .tscn Transform3D is the basis row by row, then the origin; three.js's light intensity is Godot's energy x PI)
function scene(I){ const keys=Object.keys(I.chars), L=I.lit, f=a=>a.map(v=>+(+v).toFixed(4)).join(', '), [x,y,z]=I.start, PI=Math.PI;
  const xf=(Z,o)=>{ const up=Math.abs(Z[1])>.99?[1,0,0]:[0,1,0], X=norm(cross(up,Z)), Y=cross(Z,X); return `Transform3D(${f([X[0],Y[0],Z[0],X[1],Y[1],Z[1],X[2],Y[2],Z[2]])}, ${f(o)})`; };
  const sd=norm(L.sun?L.sun.d:[.4,.8,.3]), hemi=L.hemi||{sky:[.6,.7,.8],gnd:[.3,.3,.3],i:1}, amb=hemi.sky.map((v,i)=>(v+hemi.gnd[i])/2);
  const M=e=>`Transform3D(${f([e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10],e[12],e[13],e[14]])})`;
  const res=keys.map(k=>`[ext_resource type="PackedScene" path="res://map/char-${k}.glb" id="c_${k}"]`).join('\n');
  const who=I.placed.map((p,i)=>`[node name="${p.name}_${i}" parent="Characters" instance=ExtResource("c_${p.key}")]\ntransform = ${M(p.m)}\n`).join('\n');
  return `[gd_scene load_steps=${5+keys.length} format=3]

[ext_resource type="PackedScene" path="res://map/world.glb" id="1_world"]
[ext_resource type="Script" path="res://scripts/instances.gd" id="2_inst"]
[ext_resource type="Script" path="res://scripts/fly.gd" id="3_fly"]
${res}

[sub_resource type="Environment" id="Env"]
background_mode = 1
background_color = Color(${f(L.bg)}, 1)
ambient_light_source = 2
ambient_light_color = Color(${f(amb)}, 1)
ambient_light_energy = ${+(hemi.i+(L.amb||0)).toFixed(3)}

[node name="Market" type="Node3D"]

[node name="world" parent="." instance=ExtResource("1_world")]
script = ExtResource("2_inst")

[node name="Sun" type="DirectionalLight3D" parent="."]
transform = ${xf(sd,[x+sd[0]*50,y+sd[1]*50,z+sd[2]*50])}
light_color = Color(${f(L.sun?L.sun.c:[1,1,1])}, 1)
light_energy = ${+((L.sun?L.sun.i:PI)/PI).toFixed(3)}
shadow_enabled = true

[node name="Sky" type="WorldEnvironment" parent="."]
environment = SubResource("Env")

[node name="Camera" type="Camera3D" parent="."]
transform = ${xf(norm([1,1,1]),[x+14,y+14,z+14])}
far = 4000.0
script = ExtResource("3_fly")

[node name="Characters" type="Node3D" parent="."]

${who}`; }
function cross(a,b){ return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]; }
function norm(a){ const l=Math.hypot(...a)||1; return a.map(v=>v/l); }
