// FISH REST GEOMETRY (owner, 24 Oct 2026, his Cute Fish Pack): each named fish .fbx converted to .glb (fbx2gltf) and rendered once in headless
// three, its rest-pose world triangles and each part's flat material colour (sRGB, as props-bake keeps them) read off into a raw JSON for
// tools/fish-bake.py to simplify and pack. The pack's armature (100x, turned a quarter) and the skin are resolved by three, not by hand.
// Run: node tools/fish-extract.cjs /path/to/FBX /tmp/fish-raw.json Clownfish BlueTang Koi ...
const {chromium}=require('playwright'), fs=require('fs'), os=require('os'), path=require('path');
const convert=require('fbx2gltf');
const FBX=process.argv[2], OUT=process.argv[3], NAMES=process.argv.slice(4);
const CDN={three:'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js','three/':'https://cdn.jsdelivr.net/npm/three@0.160.0/'};
(async()=>{
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fishglb-'));
  for(const n of NAMES){ await convert(path.join(FBX,n+'.fbx'),path.join(tmp,n+'.glb'),['--binary','--khr-materials-unlit']); }
  const b=await chromium.launch(); const pg=await b.newPage();
  pg.on('pageerror',e=>console.log('ERR',e.message)); pg.on('console',m=>{ if(m.type()==='error')console.log('CONSOLE',m.text()); });
  await pg.setContent(`<html><head><script type="importmap">${JSON.stringify({imports:CDN})}</script></head><body></body></html>`,{waitUntil:'load'});
  const RAW={};
  for(const n of NAMES){
    const glb=fs.readFileSync(path.join(tmp,n+'.glb')).toString('base64');
    const out=await pg.evaluate(async b64=>{
      const T=await import('three'), {GLTFLoader}=await import('three/examples/jsm/loaders/GLTFLoader.js');
      const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
      const gltf=await new Promise((res,rej)=>new GLTFLoader().parse(bin.buffer,'',res,rej));
      const scene=gltf.scene; scene.updateMatrixWorld(true);
      const P=[], C=[], I=[], v=new T.Vector3(); let base=0;
      scene.traverse(o=>{ if(!o.isMesh)return; const g=o.geometry, pos=g.attributes.position;
        const m=Array.isArray(o.material)?o.material[0]:o.material, col=m&&m.color?m.color.getHexString():'888888';
        const rgb=[parseInt(col.slice(0,2),16),parseInt(col.slice(2,4),16),parseInt(col.slice(4,6),16)];
        for(let i=0;i<pos.count;i++){ v.fromBufferAttribute(pos,i); if(o.isSkinnedMesh)(o.applyBoneTransform||o.boneTransform).call(o,i,v); o.localToWorld(v); P.push(v.x,v.y,v.z); C.push(rgb[0],rgb[1],rgb[2]); }
        const idx=g.index; if(idx){ for(let i=0;i<idx.count;i++)I.push(base+idx.getX(i)); } else { for(let i=0;i<pos.count;i++)I.push(base+i); }
        base+=pos.count; });
      return {P,C,I};
    },glb);
    RAW[n.toLowerCase()]={P:out.P,C:out.C,I:out.I};
    console.log(n,out.I.length/3,'tris',out.P.length/3,'verts');
  }
  await b.close(); fs.rmSync(tmp,{recursive:true,force:true});
  fs.writeFileSync(OUT,JSON.stringify(RAW)); console.log('wrote',OUT,Object.keys(RAW).length,'fish');
})().catch(e=>{ console.error('OUTER',e&&e.message||e); process.exit(1); });
