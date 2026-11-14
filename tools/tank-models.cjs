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
  // the town
  h6: ['src/b_lg_nivelles_h6', HF + '000-019/8456355d5b74437bb4ac1397166b551a.glb', { tex: 1024, plain: 1 }],
  row: ['src/b_lg_lemans_row', HF + '000-139/03a7af7a44c7448ba1601a89ea9a87c2.glb', { tex: 1024, plain: 1 }],
  h9: ['src/b_lg_nivelles_h9', HF + '000-053/9a6bbcb6da704592b368e29b87cac11d.glb', { tex: 1024, plain: 1 }],
  shop: ['src/b_lg_mons_shop2', HF + '000-056/7397096856d3452fa15ae074f460ad36.glb', { tex: 1024, plain: 1 }],
  cork: ['src/b_lg_cork_shop', HF + '000-063/21818eaa4c1c402a82baf9031ebaa93a.glb', { tex: 512, plain: 1 }],
  flats: ['src/b_lg_bordeaux_flat2', HF + '000-042/d390f8d7c3064060b03a753ec02c1da1.glb', { tex: 1024, plain: 1 }],
  white: ['src/b_lg_brussels_h1', HF + '000-134/b79775c5152e4d0d803d048acab1daac.glb', { tex: 1024, plain: 1 }],
  cottage: ['src/b_lg_feluy_village', HF + '000-098/9304c869ff07425399a054d548bdf4fb.glb', { tex: 1024, plain: 1 }],
  villa: ['src/b_satik_h1', HF + '000-068/a81c9bcf068f47ccb737bead5fac3e0d.glb', { size: 9.5, axis: 'y', tex: 512, plain: 1 }],
  mill: ['src/w_colin_factory', HF + '000-104/4e033f90eaaa4e68931af60f0309f537.glb', { tex: 1024, plain: 1 }],
  works: ['src/w_rajib_warehouse', HF + '000-146/08a4f422bc634033b8023d53beaf8242.glb', { size: 15, axis: 'y', tex: 1024, plain: 1 }],
  church: ['src/k_lg_fagnolle_church', HF + '000-132/ae5bcac872ac47f9b644e08aeb19f936.glb', { sink: 5.1, tex: 1024, plain: 1 }],
  watertower: ['src/t_wt_nermin', HF + '000-109/f517b60777124dfc9e56158c9b0a94f1.glb', { size: 16, axis: 'y', tex: 512, plain: 1 }],
  silos: ['src/t_silos_nermin', HF + '000-044/ef3e7aa9a5254faaa2a612afe0cd92b3.glb', { size: 14, axis: 'y', tex: 256, plain: 1 }],
  stacks: ['src/t_smokestacks', HF + '000-001/ffaf6bfbd8b84eb985dee2a35ba79440.glb', { sink: 1, tex: 512, plain: 1 }],
  mast: ['src/t_radio_gunnar', HF + '000-033/4b3c733d8bfd4ee2b91dcbcd02670686.glb', { size: 46, axis: 'y', tex: 256, plain: 1 }],
  pylon: ['src/t_pylon_rh', HF + '000-009/5bc9e49be13b4803aed3c25e87bb4486.glb', { size: 26, axis: 'y', tex: 256, plain: 1 }],
  pole: ['src/t_pole_concrete', HF + '000-143/f8b3249e56484746b193389914df9331.glb', { size: 8, axis: 'y', tex: 256, plain: 1 }],
  stonewall: ['src/d_stonewall_hez', HF + '000-087/b5abfa01022948a19d7bc4a2ad212cf4.glb', { size: 5, axis: 'x', tex: 512, plain: 1 }],
  lamp: ['src/d_lamp_pinokio', HF + '000-065/17e2bc2ec7de42d08d98e3a6c886a8b2.glb', { size: 6.5, axis: 'y', tex: 256, plain: 1 }],
  hay: ['src/d_hay_frodo', HF + '000-118/6b775049e57e4d9da87977905493ebfb.glb', { tex: 512, plain: 1 }],
  brokenwall: ['src/d_damaged_wall', HF + '000-127/11616746d0ea4bd59a2d9cf9a2b2fdfa.glb', { size: 6, axis: 'x', tex: 512, plain: 1 }],
  rubble: ['src/d_rubble', HF + '000-117/0e6f85da3433468db226866bd43a43e7.glb', { size: 4, axis: 'x', tex: 512, plain: 1 }],
  trabant: ['src/v_trabant', HF + '000-111/0a79e91d3c3447e19c8c0c3339557a0b.glb', { tex: 512, plain: 1 }],
  lada: ['src/v_lada1200', HF + '000-018/6f05358afac347dcb11a88c32337c236.glb', { size: 4.1, axis: 'z', tex: 256, plain: 1 }],
  van: ['src/v_french_van', HF + '000-053/a350a422d200485ea57778dc42139edc.glb', { size: 4.3, axis: 'x', tex: 512, plain: 1 }],
  tractor: ['src/v_tractor_bevadek', HF + '000-109/1b258bcc01bf4ed0935ef73e80442c30.glb', { size: 3.6, axis: 'z', tex: 512, plain: 1 }],
  truck: ['src/v_ural', HF + '000-143/f953c51a5dbc4a15949f4dcc0905c4e8.glb', { tex: 512, plain: 1 }],
  busstop: ['src/d_bus_vagab', HF + '000-111/ac13a4bade94409fa688f1c4185f126d.glb', { size: 2.7, axis: 'y', tex: 256, plain: 1 }],
  crag: ['src/rk_valley_gray', HF + '000-126/e6b9729834dc4fdf99a8c932bc3c6a24.glb', { size: 7.7, axis: 'y', tris: 1500, tex: 1024, plain: 1 }],
  deadtree: ['src/tree_old_evolved', HF + '000-120/3cb4d59eb4844dc4802480e9ee53785e.glb', { size: 9, axis: 'y', tris: 1000, tex: 512, plain: 1 }],
  sandbags: ['src/sb_pile_finley', HF + '000-063/232b9407f5ad46f68764093f134591f4.glb', { size: 1.6, axis: 'x', tris: 900, tex: 512, plain: 1 }],
  hedgehog: ['src/ob_hedgehog', HF + '000-096/0e09cbddad864003bc4f10c612bb7284.glb', { size: 1.5, axis: 'y', tris: 1500, tex: 256, plain: 1 }],
  wreck: ['src/wr_cascavel', HF + '000-004/7ef593b344624e6388eaa44b5551fad7.glb', { size: 5.2, axis: 'z', tris: 8000, tex: 512, plain: 1 }],
  grenade: ['src/gr_m67_vextin', HF + '000-121/05e2a29118c3408eaa574bcec6997aba.glb', { size: 0.09, axis: 'y', tex: 256, plain: 1 }],
  pipes: ['modular_industrial_pipes_01', '', { size: 0, tris: 3000, tex: 256 }], sconce: ['industrial_caged_sconce', '', { size: 0.22, axis: 'y', tris: 3000, tex: 256 }], ammobox: ['ammo_box', '', { size: 0, tex: 256 }],
  binos: ['binoculars', '', { size: 0.19, axis: 'x', tris: 4000, tex: 512 }],
  pistol: ['service_pistol', '', { keep: '_a$', fwd: '+x', size: 0, tex: 512 }],
  rocks: ['rock_moss_set_01', '', { size: 0, tris: 700, tex: 512 }],
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
window.prep=async(url,o)=>{await MS.ready;const GL=new GLTFLoader();GL.register(parser=>({name:'KHR_materials_pbrSpecularGlossiness',extendMaterialParams(i,params){const e=(parser.json.materials[i].extensions||{}).KHR_materials_pbrSpecularGlossiness;if(!e)return null;const p=[];if(e.diffuseFactor){params.color=new THREE.Color().setRGB(e.diffuseFactor[0],e.diffuseFactor[1],e.diffuseFactor[2],THREE.LinearSRGBColorSpace);params.opacity=e.diffuseFactor[3];}params.metalness=0;params.roughness=.9;if(e.diffuseTexture)p.push(parser.assignTexture(params,'map',e.diffuseTexture,THREE.SRGBColorSpace));return Promise.all(p);}}));const scene=(await GL.loadAsync(url)).scene;scene.updateMatrixWorld(true);let root=o.root?scene.getObjectByName(o.root):scene;const out=new THREE.Scene(),info={};let tris=0;
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
    if(o.tris)thin([hull,tur,gun].flat(),o.tris);const gN=node('gun',gun);gN.position.copy(T);const tN=node('turret',tur);tN.add(gN);out.add(node('hull',hull),tN);gb=union(gun);const ub=union(tur),hb2=union(hull);
    Object.assign(info,{yaw,pitch,trunnion:T.toArray(),muzzle:[0,0,gb.min.z],turret:[ub.min.toArray(),ub.max.toArray()],hull:[hb2.min.toArray(),hb2.max.toArray()]});tris=o.tris?thin([hull,tur,gun].flat(),o.tris):[hull,tur,gun].flat().reduce((n,p)=>n+p.geo.index.count/3,0);
  }else{const all=gather(root,o.keep?m=>{let p=m;while(p){if(new RegExp(o.keep).test(p.name))return true;p=p.parent;}return false;}:null),b=union(all),sz=b.getSize(V(0,0,0)),ce=b.getCenter(V(0,0,0)),turn={'+x':Math.PI/2,'-x':-Math.PI/2,'+z':Math.PI,'-z':0}[o.fwd||'-z'];
    const along=o.fwd&&o.fwd[1]==='x'?sz.x:o.axis==='x'?sz.x:o.axis==='y'?sz.y:sz.z,s=o.size?o.size/along:1;
    M.makeTranslation(0,-(o.sink||0),0).multiply(new THREE.Matrix4().makeScale(s,s,s)).multiply(new THREE.Matrix4().makeRotationY(turn)).multiply(new THREE.Matrix4().makeTranslation(-ce.x,-b.min.y,-ce.z));
    if(o.kind==='foe'){const isT=m=>{let p=m;while(p){if(o.turret.includes(p.name))return true;p=p.parent;}return false;},hull=gather(root,m=>!isT(m)),tur=gather(root,isT);for(const ps of[hull,tur])each(ps,g=>g.applyMatrix4(M));
      const ub=union(tur),hb=union(hull),px=(hb.min.x+hb.max.x)/2;let n=0,z=0;each(tur,g=>{const p=g.attributes.position;for(let i=0;i<p.count;i++)if(p.getY(i)<ub.min.y+.35){z+=p.getZ(i);n++;}});const P=V(px,0,z/n);
      for(const ps of[hull,tur])each(ps,g=>g.translate(-P.x,0,-P.z));tris=thin([...hull,...tur],o.tris);out.add(node('hull',hull),node('turret',tur));const u2=union(tur),h2=union(hull);Object.assign(info,{turret:[u2.min.toArray(),u2.max.toArray()],hull:[h2.min.toArray(),h2.max.toArray()]});
    }else{each(all,g=>g.applyMatrix4(M));tris=thin(all,o.tris);out.add(node('m',all));const b2=union(all);info.box=[b2.min.toArray(),b2.max.toArray()];}}
  if(o.plain)out.traverse(m=>{if(m.isMesh){const a=m.material;a.normalMap=a.roughnessMap=a.metalnessMap=a.aoMap=a.emissiveMap=null;a.metalness=0;a.roughness=.9;}});
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
