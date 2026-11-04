// YOUR BODY (owner, 19 Oct 2026: his Humanoid.fbx, "make it my body"): the plain mannequin (Blender, no bones) read in Chromium by three's
// FBXLoader, its uv-less corners merged, cm to the UAL skeleton's metres (180 cm to 1.8286) -> data/full/humanoid.json {p: Float32, i: Uint16}.
// node tools/humanoid-bake.cjs   (needs the CDN for three 0.160)
const {chromium}=require('playwright'), http=require('http'), fs=require('fs'), path=require('path'), R=path.join(__dirname,'..');
const PAGE=`<html><body><script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
<script type="module">import * as THREE from 'three'; import {FBXLoader} from 'three/addons/loaders/FBXLoader.js'; import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
const o=new FBXLoader().parse(await (await fetch('/f.fbx')).arrayBuffer(),''); o.updateMatrixWorld(true); let m; o.traverse(x=>{ if(x.isMesh&&x.name==='HumanoidBase_NotOverlapping')m=x; });
let g=m.geometry.clone(); g.applyMatrix4(m.matrixWorld); for(const k of Object.keys(g.attributes))if(k!=='position')g.deleteAttribute(k); g=mergeVertices(g,1e-3); g.computeBoundingBox();
const P=g.attributes.position.array, k=1.8286/(g.boundingBox.max.y-g.boundingBox.min.y), y0=g.boundingBox.min.y; for(let i=0;i<P.length;i+=3){ P[i]*=k; P[i+1]=(P[i+1]-y0)*k; P[i+2]*=k; }
window.R={p:Array.from(P),i:Array.from(g.index.array)};</script></body></html>`;
const sv=http.createServer((q,s)=>s.end(q.url==='/f.fbx'?fs.readFileSync(R+'/data/full/humanoid.fbx'):PAGE)).listen(8766);
(async()=>{ const b=await chromium.launch(), pg=await b.newPage(); await pg.goto('http://localhost:8766/'); await pg.waitForFunction(()=>window.R,null,{timeout:60000});
  const r=await pg.evaluate(()=>R), b64=a=>Buffer.from(a.buffer).toString('base64');
  fs.writeFileSync(R+'/data/full/humanoid.json',JSON.stringify({p:b64(new Float32Array(r.p)),i:b64(new Uint16Array(r.i)),tris:r.i.length/3}));
  console.log('data/full/humanoid.json',r.p.length/3,'corners',r.i.length/3,'triangles'); await b.close(); sv.close(); })();
