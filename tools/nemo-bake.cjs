// THE PLESIOSAUR SKELETON (owner's Drive: PointNemo_plesiosaur_skeleton_EN.zip, a "Three.js AI" asset: JavaScript that builds the skeleton on its
// display base in three.js, no model file): built once here in a headless browser with the pack's own three.js, its faces and colours read off
// and written into data/props.json as 'plesio' (the still things' format: tools/props-bake.py), so the game carries none of the asset's code.
// Run: NODE_PATH=$(npm root -g) node tools/nemo-bake.cjs /path/to/PointNemo_plesiosaur_skeleton_EN
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
(async()=>{ const R=process.argv[2], three=fs.readFileSync(path.join(R,'vendor/three-r160.js'),'utf8'), bones=fs.readFileSync(path.join(R,'src/assets/point-nemo-plesiosaur-bones.js'),'utf8');
  const b=await chromium.launch(); const pg=await b.newPage(); pg.on('pageerror',e=>console.log('ERR',e.message));
  await pg.setContent('<html><body><canvas id="c"></canvas></body></html>'); await pg.addScriptTag({content:three}); await pg.addScriptTag({content:bones});
  const out=await pg.evaluate(()=>{ const r=NemoPlesiosaurBones.create(THREE), root=r.g||r.group||r.scene||r.object||r; const scene=new THREE.Scene(); scene.add(root); scene.updateMatrixWorld(true);
    const P=[], C=[], v=new THREE.Vector3(), col=new THREE.Color(); let n=0;
    root.traverse(o=>{ if(!o.isMesh||!o.geometry)return; const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry, pos=g.attributes.position, vc=g.attributes.color, mats=Array.isArray(o.material)?o.material:[o.material];
      const groups=g.groups&&g.groups.length?g.groups:[{start:0,count:pos.count,materialIndex:0}];
      for(const grp of groups){ const m=mats[grp.materialIndex]||mats[0]; const mc=m&&m.color?m.color:col.set(0xaaaaaa); const em=m&&m.emissive?m.emissive:null;
        for(let i=grp.start;i<grp.start+grp.count&&i<pos.count;i++){ v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld); P.push(v.x,v.y,v.z);
          let cr=mc.r, cg=mc.g, cb=mc.b; if(vc){ cr*=vc.getX(i); cg*=vc.getY(i); cb*=vc.getZ(i); } if(em){ cr=Math.min(1,cr+em.r*.5); cg=Math.min(1,cg+em.g*.5); cb=Math.min(1,cb+em.b*.5); }
          C.push(Math.round(Math.pow(cr,1/2.2)*255),Math.round(Math.pow(cg,1/2.2)*255),Math.round(Math.pow(cb,1/2.2)*255)); n++; } } });
    return {P,C,n,keys:Object.keys(r)}; });
  await b.close(); const n=out.n, P=new Float32Array(out.P); let lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9]; for(let i=0;i<P.length;i+=3)for(let k=0;k<3;k++){ lo[k]=Math.min(lo[k],P[i+k]); hi[k]=Math.max(hi[k],P[i+k]); }
  const h=hi[1]-lo[1], cx=(lo[0]+hi[0])/2, cz=(lo[2]+hi[2])/2; for(let i=0;i<P.length;i+=3){ P[i]=(P[i]-cx)/h; P[i+1]=(P[i+1]-lo[1])/h; P[i+2]=(P[i+2]-cz)/h; }
  const tris=n/3, foot=Math.max(hi[0]-lo[0],hi[2]-lo[2])/h; const D=JSON.parse(fs.readFileSync('data/props.json','utf8'));
  D.plesio={p:Buffer.from(P.buffer).toString('base64'),c:Buffer.from(Uint8Array.from(out.C)).toString('base64'),k:Buffer.from(new Uint8Array(tris)).toString('base64'),tris,metres:+h.toFixed(3),wide:+foot.toFixed(4),trunk:+(foot*.6).toFixed(4)};
  fs.writeFileSync('data/props.json',JSON.stringify(D)); console.log('plesio',tris,'tris',h.toFixed(2),'tall (its units), wide',foot.toFixed(2),'keys',out.keys.join(',')); })();
