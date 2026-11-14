// makes HULL DOWN's models ready for a headset: PWCHROME=/opt/pw-browsers/chromium node tools/tank-models.cjs [name ...]  ->  data/tank/m/*.glb + data/tank/models.json (each model in metres, facing -Z, standing on y 0, one mesh a material, thinned, pictures 1024 px or less as JPEG); the models as they come are kept in data/full/tank/src/ (fetched when missing from Objaverse's copy of Sketchfab, or by tools/tank-assets.py for Poly Haven's); credits in docs/tank-credits.md
const { chromium } = require('playwright'), fs = require('fs'), path = require('path'), http = require('http'), https = require('https');
const ROOT = path.resolve(__dirname, '..'), HF = 'https://huggingface.co/datasets/allenai/objaverse/resolve/main/glbs/';
// out: [source file, where it comes from, options]. fwd: the way the model faces as it comes; size: metres along `axis` (z after turning); tris: most triangles kept; tex: picture size
const LIST = {
  hero: ['src/challenger2_tomm8', HF + '000-041/e70234f6d695467499abc56646ab3e66.glb', { kind: 'hero', root: 'chellie_dio', tex: 1024 }],
  foe: ['src/battle_tank_alexander', HF + '000-000/5fcc302b89414348811eaa1ad4dc435f.glb', { kind: 'foe', turret: ['tank_low001'], fwd: '+x', size: 7.6, tris: 15000, tex: 512 }],
  seat: ['src/pilot_seat_pabooklas', HF + '000-051/310dca3487884ba690de7ac9e1995763.glb', { size: 1.15, axis: 'y', tris: 7000, tex: 512 }],
  console: ['src/old_control_panel', HF + '000-098/b84686130a2442d985c6f36c23d0836d.glb', { size: 1.0, axis: 'x', tex: 1024 }],
  display: ['src/medical_console', HF + '000-065/89065e109790417191467cfececf2c7c.glb', { size: 0.5, axis: 'x', tex: 1024 }],
  switchbox: ['src/switch_box', HF + '000-077/b0b683a931884c5197ff797b3bb363a4.glb', { size: 0.4, axis: 'y', tex: 512 }],
  radio: ['src/military_radio_curi', HF + '000-067/f5c8f0420f054b32a2e977fbcd248d84.glb', { size: 0.42, axis: 'x', tris: 8000, tex: 512 }],
  helmet: ['src/cvc_helmet', HF + '000-133/c1516dc3d0ea420b9246334a94e5681e.glb', { size: 0.27, axis: 'y', tris: 5000, tex: 512 }],
  barn: ['src/american_old_barn', HF + '000-119/1d0b768a8e2449de990b3f69f94c5db6.glb', { size: 14, axis: 'x', tex: 1024 }],
  cars: ['src/burned_cars', HF + '000-083/701066df6b914fd08318524c7ccd96a7.glb', { size: 4.6, axis: 'z', tex: 512 }],
  pipes: ['modular_industrial_pipes_01', '', { size: 0, tris: 3000, tex: 256 }], sconce: ['industrial_caged_sconce', '', { size: 0.22, axis: 'y', tris: 3000, tex: 256 }], ammobox: ['ammo_box', '', { size: 0, tex: 256 }],
  rocks: ['rock_moss_set_01', '', { size: 0, tris: 2500, tex: 512 }],
};
const NM = '/node_modules/', PAGE = `<script type="importmap">{"imports":{"three":"${NM}three/build/three.module.js","three/addons/":"${NM}three/examples/jsm/"}}</script><script type="module">
import * as THREE from 'three';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';import {MeshoptSimplifier as MS} from '${NM}meshoptimizer/meshopt_simplifier.js';
const V=(x,y,z)=>new THREE.Vector3(x,y,z),box=g=>{g.computeBoundingBox();return g.boundingBox;};
// every mesh under o, moved into o's own frame, joined one mesh a material
function gather(o,keep){const by=new Map();o.updateWorldMatrix(true,true);const inv=o.matrixWorld.clone().invert();
  o.traverse(m=>{if(!m.isMesh||(keep&&!keep(m)))return;let g=m.geometry.clone();for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
    if(!g.index)g=mergeVertices(g);g.applyMatrix4(inv.clone().multiply(m.matrixWorld));const mats=Array.isArray(m.material)?m.material:[m.material];(by.get(mats[0])||by.set(mats[0],[]).get(mats[0])).push(g);});
  return[...by].map(([mat,gs])=>({mat,geo:gs.length>1?mergeGeometries(gs,false):gs[0]}));}
const each=(ps,f)=>ps.forEach(p=>f(p.geo));
function thin(ps,max){const tot=ps.reduce((n,p)=>n+p.geo.index.count/3,0);if(!max||tot<=max)return tot;let out=0;for(const p of ps){const g=p.geo,idx=new Uint32Array(g.index.array),pos=new Float32Array(g.attributes.position.array);
  const[ni]=MS.simplify(idx,pos,3,Math.max(3,Math.floor(idx.length*max/tot/3)*3),.05);g.setIndex(new THREE.BufferAttribute(ni,1));out+=ni.length/3;}return out;}
function prune(g){const idx=g.index.array,map=new Map(),keep=[];const ni=new Uint32Array(idx.length);for(let i=0;i<idx.length;i++){let m=map.get(idx[i]);if(m===undefined){m=keep.length;map.set(idx[i],m);keep.push(idx[i]);}ni[i]=m;}
  const o=new THREE.BufferGeometry();for(const[k,a]of Object.entries(g.attributes)){const n=new Float32Array(keep.length*a.itemSize);keep.forEach((s,i)=>{for(let c=0;c<a.itemSize;c++)n[i*a.itemSize+c]=a.array[s*a.itemSize+c];});o.setAttribute(k,new THREE.BufferAttribute(n,a.itemSize));}o.setIndex(new THREE.BufferAttribute(keep.length<65536?new Uint16Array(ni):ni,1));return o;}
function node(name,ps){const g=new THREE.Group();g.name=name;ps.forEach((p,i)=>{const m=new THREE.Mesh(prune(p.geo),p.mat);m.name=name+'_'+i;g.add(m);});return g;}
const union=ps=>{const b=new THREE.Box3();each(ps,g=>b.union(box(g)));return b;};
window.prep=async(url,o)=>{await MS.ready;const scene=(await new GLTFLoader().loadAsync(url)).scene;scene.updateMatrixWorld(true);let root=o.root?scene.getObjectByName(o.root):scene;const out=new THREE.Scene(),info={};let tris=0;
  const M=new THREE.Matrix4();
  if(o.kind==='hero'){const under=n=>m=>{let p=m;while(p){if(p.name===n)return true;p=p.parent;}return false;},part=n=>gather(root,under(n)),hull=[...part('chassis'),...part('laufweerk'),...part('kettel'),...part('ketter')],tur=part('turret'),gun=part('barrel');
    // the turret is turned and the gun raised as it comes: find the gun's line, turn both back about the point where that line crosses the hull's middle
    const pts=[];each(gun,g=>{const p=g.attributes.position;for(let i=0;i<p.count;i++)pts.push(V(p.getX(i),p.getY(i),p.getZ(i)));});const c=pts.reduce((a,p)=>a.add(p),V(0,0,0)).multiplyScalar(1/pts.length);
    let d=V(0,0,1);for(let k=0;k<40;k++){const n=V(0,0,0);for(const p of pts){const q=p.clone().sub(c);n.addScaledVector(q,q.dot(d));}d=n.normalize();}
    const tb=union(tur),tc=tb.getCenter(V(0,0,0));if(c.clone().sub(tc).dot(d)<0)d.negate();
    const hb=union(hull),cx=(hb.min.x+hb.max.x)/2,t=(cx-c.x)/d.x,P=V(cx,0,Math.abs(d.x)>.05?c.z+d.z*t:tc.z),yaw=Math.atan2(d.x,d.z),pitch=Math.asin(d.y);
    M.makeRotationY(-yaw).multiply(new THREE.Matrix4().makeTranslation(-P.x,0,-P.z));each(tur,g=>g.applyMatrix4(M));each(gun,g=>g.applyMatrix4(M));each(hull,g=>g.translate(-P.x,0,-P.z));
    let gb=union(gun);const T=V((gb.min.x+gb.max.x)/2,0,gb.min.z);{let n=0,y=0;each(gun,g=>{const p=g.attributes.position;for(let i=0;i<p.count;i++)if(p.getZ(i)<gb.min.z+(gb.max.z-gb.min.z)*.06){y+=p.getY(i);n++;}});T.y=y/n;}
    M.makeTranslation(T.x,T.y,T.z).multiply(new THREE.Matrix4().makeRotationX(pitch)).multiply(new THREE.Matrix4().makeTranslation(-T.x,-T.y,-T.z));each(gun,g=>g.applyMatrix4(M));
    const s=3.55/(hb.max.x-hb.min.x),y0=union(hull).min.y;M.makeScale(s,s,s).multiply(new THREE.Matrix4().makeRotationY(Math.PI)).multiply(new THREE.Matrix4().makeTranslation(0,-y0,0));
    for(const ps of[hull,tur,gun])each(ps,g=>g.applyMatrix4(M));T.applyMatrix4(M);each(gun,g=>g.translate(-T.x,-T.y,-T.z));
    const gN=node('gun',gun);gN.position.copy(T);const tN=node('turret',tur);tN.add(gN);out.add(node('hull',hull),tN);gb=union(gun);const ub=union(tur),hb2=union(hull);
    Object.assign(info,{yaw,pitch,trunnion:T.toArray(),muzzle:[0,0,gb.min.z],turret:[ub.min.toArray(),ub.max.toArray()],hull:[hb2.min.toArray(),hb2.max.toArray()]});tris=[hull,tur,gun].flat().reduce((n,p)=>n+p.geo.index.count/3,0);
  }else{const all=gather(root),b=union(all),sz=b.getSize(V(0,0,0)),ce=b.getCenter(V(0,0,0)),turn={'+x':Math.PI/2,'-x':-Math.PI/2,'+z':Math.PI,'-z':0}[o.fwd||'-z'];
    const along=o.fwd&&o.fwd[1]==='x'?sz.x:o.axis==='x'?sz.x:o.axis==='y'?sz.y:sz.z,s=o.size?o.size/along:1;
    M.makeScale(s,s,s).multiply(new THREE.Matrix4().makeRotationY(turn)).multiply(new THREE.Matrix4().makeTranslation(-ce.x,-b.min.y,-ce.z));
    if(o.kind==='foe'){const isT=m=>{let p=m;while(p){if(o.turret.includes(p.name))return true;p=p.parent;}return false;},hull=gather(root,m=>!isT(m)),tur=gather(root,isT);for(const ps of[hull,tur])each(ps,g=>g.applyMatrix4(M));
      const ub=union(tur),hb=union(hull),px=(hb.min.x+hb.max.x)/2;let n=0,z=0;each(tur,g=>{const p=g.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)<ub.min.y+.35){z+=p.getZ(i);n++;}});const P=V(px,0,z/n);
      for(const ps of[hull,tur])each(ps,g=>g.translate(-P.x,0,-P.z));tris=thin([...hull,...tur],o.tris);out.add(node('hull',hull),node('turret',tur));const u2=union(tur),h2=union(hull);Object.assign(info,{turret:[u2.min.toArray(),u2.max.toArray()],hull:[h2.min.toArray(),h2.max.toArray()]});
    }else{each(all,g=>g.applyMatrix4(M));tris=thin(all,o.tris);out.add(node('m',all));const b2=union(all);info.box=[b2.min.toArray(),b2.max.toArray()];}}
  out.traverse(m=>{if(!m.isMesh)return;const a=m.material;for(const k of['map','normalMap','roughnessMap','metalnessMap','aoMap','emissiveMap'])if(a[k])a[k].userData.mimeType=a.transparent||a.alphaTest>0?'image/png':'image/jpeg';});
  const bin=await new GLTFExporter().parseAsync(out,{binary:true,maxTextureSize:o.tex||1024});info.tris=Math.round(tris);const u=new Uint8Array(bin);let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return{info,b64:btoa(s)};};window.ready=1;</script>`;
const fetchTo = (url, f) => new Promise((ok, no) => { const go = u => https.get(u, { headers: { 'User-Agent': 'asset-fetch' } }, r => { if (r.statusCode >= 300 && r.statusCode < 400) return go(new URL(r.headers.location, u).href); if (r.statusCode !== 200) return no(new Error(url + ' ' + r.statusCode)); const w = fs.createWriteStream(f); r.pipe(w); w.on('finish', ok); }).on('error', no); go(url); });
(async () => {
  const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : /\.m?js$/.test(f) ? 'text/javascript' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/_models.html', PAGE); fs.mkdirSync('data/tank/m', { recursive: true }); fs.mkdirSync('data/full/tank/src', { recursive: true });
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const J = fs.existsSync('data/tank/models.json') ? JSON.parse(fs.readFileSync('data/tank/models.json')) : {}, only = process.argv.slice(2);
  for (const [name, [src, url, o]] of Object.entries(LIST)) { if (only.length && !only.includes(name)) continue; const f = 'data/full/tank/' + src + '.glb';
    if (!fs.existsSync(f)) { if (!url) { console.log(name, 'missing: run python3 tools/tank-assets.py', src); continue; } await fetchTo(url, f); }
    const pg = await b.newPage(); pg.on('pageerror', e => console.log(name, e.message)); await pg.goto('http://127.0.0.1:' + srv.address().port + '/dist/_models.html'); await pg.waitForFunction(() => window.ready);
    const r = await pg.evaluate(([u, o]) => prep(u, o), ['/' + f, o]).catch(e => console.log(name, 'FAILED', e.message.slice(0, 300))); await pg.close(); if (!r) continue;
    const buf = Buffer.from(r.b64, 'base64'); fs.writeFileSync('data/tank/m/' + name + '.glb', buf); J[name] = r.info; console.log(name, JSON.stringify(r.info).slice(0, 260), Math.round(buf.length / 1024) + ' KB'); }
  fs.writeFileSync('data/tank/models.json', JSON.stringify(J)); fs.rmSync('dist/_models.html'); await b.close(); srv.close();
})();
