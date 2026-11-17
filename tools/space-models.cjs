// makes SPACE FLEET's models and sky ready for a headset: PWCHROME=/opt/pw-browsers/chromium node tools/space-models.cjs [name ... | sky]  ->  data/space/m/*.glb + data/space/models.json + data/space/sky.jpg
// each model: centred on the origin, nose +Z, up +Y, longest side 1 unit, all transforms baked in, one mesh a material and two materials at most (a model that comes with more has its pictures packed side by side into one), thinned, pictures 1024 px or less as JPEG, plain GLB (no Draco, meshopt or KTX2)
// the models as they come are kept in data/full/space/<uid>.glb (not in git), fetched when missing from Objaverse's copy of Sketchfab; the sky is ESO's Milky Way panorama; credits in docs/space-credits.md
const { chromium } = require('playwright'), fs = require('fs'), path = require('path'), http = require('http'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..'), HF = 'https://huggingface.co/datasets/allenai/objaverse/resolve/main/glbs/', SKY = 'https://cdn.eso.org/images/large/eso0932a.jpg';
// out: [Sketchfab uid, Objaverse shard, options]. fwd, up: the way the model's nose and top point as it comes; tris: most triangles kept; tex: picture size; mats: materials kept (1 or 2); mesh: use only the n-th mesh (a pack of several); drop: leave out nodes whose name matches; clear: leave out see-through parts
const LIST = {
  mother: ['474f62d00ed54212b37f93ce91569c53', '000-134', { fwd: '+x', tris: 40000, tex: 1024, mats: 2 }],
  cruiser: ['781e531c00d94c9e89dcc8ad9b967d87', '000-087', { fwd: '+z', tris: 14000, tex: 1024, mats: 2 }],
  frigate: ['4cccb0378e474f8a8d3c7079e2e56d63', '000-049', { fwd: '+z', tris: 8000, tex: 1024 }],
  fighter: ['99c1d15965c74f3aa7b5999e2d4e42e1', '000-024', { fwd: '+z', tris: 3500, tex: 1024, mats: 1 }],
  turret: ['5ebad179815d44a8a8fa221d203fb383', '000-073', { fwd: '-z', tris: 6000, tex: 1024 }],
  mine: ['609990d577c645689181a2e1fc82ab1f', '000-024', { fwd: '+z', tris: 900, tex: 512 }],
  relay: ['7a5556a83ec24141b93c7fcce82a01de', '000-130', { fwd: '+z', tris: 4000, tex: 512 }],
  rock1: ['adde1ecf129e4509be8af61b84bafa85', '000-037', { mesh: 0, tris: 900, tex: 512 }],
  rock2: ['adde1ecf129e4509be8af61b84bafa85', '000-037', { mesh: 4, tris: 900, tex: 512 }],
  rock3: ['adde1ecf129e4509be8af61b84bafa85', '000-037', { mesh: 7, tris: 900, tex: 512 }],
  // the second fleet
  mother2: ['1b121a8965e241ada855288eef2732ba', '000-069', { fwd: '-x', tris: 36000, tex: 1024, mats: 2 }],
  cruiser2: ['a53147cc2da943e7ae07f1e0b0a31518', '000-128', { fwd: '-z', tris: 32000, tex: 1024, mats: 2 }],
  frigate2: ['025fb009e24746eba87d3458fb7db7d9', '000-123', { fwd: '-z', tris: 8000, tex: 1024 }],
  fighter2: ['303d3e5b8d544653bfde45189ca10c73', '000-051', { fwd: '-z', tris: 2000, tex: 512 }],
  turret2: ['59b72a8e3ec24a0bb7b072cf6e130574', '000-036', { fwd: '+x', tris: 6000, tex: 1024, mats: 2 }],
  mine2: ['5df948888c3748479a8b83ac1c5e0066', '000-044', { fwd: '+z', tris: 5000, tex: 512 }],
};
const NM = '/node_modules/', PAGE = `<script type="importmap">{"imports":{"three":"${NM}three/build/three.module.js","three/addons/":"${NM}three/examples/jsm/"}}</script><script type="module">
import * as THREE from 'three';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';import {mergeGeometries,mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';import {MeshoptSimplifier as MS} from '${NM}meshoptimizer/meshopt_simplifier.js';
const V=(x,y,z)=>new THREE.Vector3(x,y,z),AX={'+x':V(1,0,0),'-x':V(-1,0,0),'+y':V(0,1,0),'-y':V(0,-1,0),'+z':V(0,0,1),'-z':V(0,0,-1)},b64=u=>{let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s);};
// every mesh wanted, moved into the world's frame (a mirrored one turned right side out), joined one mesh a material
function gather(scene,o){const by=new Map();let n=-1;const drop=o.drop&&new RegExp(o.drop,'i');
  scene.traverse(m=>{if(!m.isMesh)return;n++;if(o.mesh!==undefined&&o.mesh!==n)return;for(let p=m;p;p=p.parent)if(!p.visible||(drop&&drop.test(p.name)))return;let g=m.geometry.clone();for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
    for(const k of['position','normal','uv']){const a=g.attributes[k];if(a.isInterleavedBufferAttribute||a.normalized||!(a.array instanceof Float32Array)){const f=new Float32Array(a.count*a.itemSize);for(let i=0;i<a.count;i++)for(let c=0;c<a.itemSize;c++)f[i*a.itemSize+c]=a.getComponent(i,c);g.setAttribute(k,new THREE.BufferAttribute(f,a.itemSize));}}
    if(!g.index)g=mergeVertices(g);g.applyMatrix4(m.matrixWorld);if(m.matrixWorld.determinant()<0){const ix=Array.from(g.index.array);for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t;}g.setIndex(ix);}
    const mat=Array.isArray(m.material)?m.material[0]:m.material;if(o.clear&&(mat.transparent||mat.alphaTest>0))return;(by.get(mat)||by.set(mat,[]).get(mat)).push(g);});
  return[...by].map(([mat,gs])=>({mat,geo:gs.length>1?mergeGeometries(gs,false):gs[0]}));}
const count=ps=>ps.reduce((n,p)=>n+p.geo.index.count/3,0);
// fewer triangles, shared out by how many each part has; looser and looser until it fits
function thin(ps,max,flags){let tot=count(ps);if(!max||tot<=max)return tot;const src=ps.map(p=>new Uint32Array(p.geo.index.array));
  for(const[err,k,fl,sloppy]of flags?[[1,1,flags],[1,.95,flags]]:[[.02,1,[]],[.05,1,['Prune']],[.15,1,['Prune']],[.15,1,['Prune','Permissive']],[.5,.98,['Prune','Permissive']],[1,.96,['Prune','Permissive']],[1,.9,[],1]]){ps.forEach((p,i)=>{const pos=new Float32Array(p.geo.attributes.position.array),want=Math.max(3,Math.floor(src[i].length*max*k/tot/3)*3);
      const[ni]=sloppy?MS.simplifySloppy(src[i],pos,3,null,want,1):MS.simplify(src[i],pos,3,want,err,fl);p.geo.setIndex(new THREE.BufferAttribute(ni,1));});if(count(ps)<=max)break;}
  return count(ps);}
function prune(g){const idx=g.index.array,map=new Map(),keep=[];const ni=new Uint32Array(idx.length);for(let i=0;i<idx.length;i++){let m=map.get(idx[i]);if(m===undefined){m=keep.length;map.set(idx[i],m);keep.push(idx[i]);}ni[i]=m;}
  const o=new THREE.BufferGeometry();for(const[k,a]of Object.entries(g.attributes)){const n=new Float32Array(keep.length*a.itemSize);keep.forEach((s,i)=>{for(let c=0;c<a.itemSize;c++)n[i*a.itemSize+c]=a.array[s*a.itemSize+c];});o.setAttribute(k,new THREE.BufferAttribute(n,a.itemSize));}o.setIndex(new THREE.BufferAttribute(keep.length<65536?new Uint16Array(ni):ni,1));return o;}
// a picture drawn smaller by halves, so fine detail is averaged and does not sparkle
function small(img,w,h){let c=img,cw=img.width,ch=img.height;while(cw>w*2||ch>h*2){const n=document.createElement('canvas');n.width=cw=Math.max(w,cw>>1);n.height=ch=Math.max(h,ch>>1);const x=n.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(c,0,0,cw,ch);c=n;}return c;}
const css=(r,g,b)=>'rgb('+[r,g,b].map(v=>Math.round(Math.min(1,Math.max(0,v))*255)).join(',')+')';
// several materials' pictures packed side by side into one material's; each part's uv moved into its own tile. Colours, roughness, metalness and glow that a material gives as plain numbers are painted into its tile
function pack(ps,S,name,warn){const n=ps.length,cols=Math.ceil(Math.sqrt(n)),rows=Math.ceil(n/cols),tw=S/cols,th=S/rows,pad=n>1?2:0,can={},has={};
  for(const k of['map','normalMap','orm','emissiveMap']){can[k]=document.createElement('canvas');can[k].width=can[k].height=S;}
  ps.forEach((p,i)=>{const a=p.mat,x0=(i%cols)*tw,y0=Math.floor(i/cols)*th;if(a.transparent||a.alphaTest>0)warn.push(name+': see-through material '+a.name+' made solid');
    const uv=p.geo.attributes.uv;let lo=[1e9,1e9],hi=[-1e9,-1e9];for(let q=0;q<uv.count;q++){const u=uv.getX(q),v=uv.getY(q);lo[0]=Math.min(lo[0],u);hi[0]=Math.max(hi[0],u);lo[1]=Math.min(lo[1],v);hi[1]=Math.max(hi[1],v);}
    // only the part of the picture this model's uv reaches is kept, so a small model cut from a shared sheet stays sharp
    const inside=lo[0]>=-.001&&lo[1]>=-.001&&hi[0]<=1.001&&hi[1]<=1.001,R=inside?[Math.max(0,lo[0]-.004),Math.max(0,lo[1]-.004),Math.min(1,hi[0]+.004),Math.min(1,hi[1]+.004)]:[0,0,1,1],whole=R[2]-R[0]>.9&&R[3]-R[1]>.9;if(whole){R[0]=R[1]=0;R[2]=R[3]=1;}
    const cut=img=>{if(whole)return small(img,tw,th);const c=document.createElement('canvas'),sx=Math.floor(R[0]*img.width),sy=Math.floor(R[1]*img.height);c.width=Math.max(1,Math.ceil(R[2]*img.width)-sx);c.height=Math.max(1,Math.ceil(R[3]*img.height)-sy);c.getContext('2d').drawImage(img,-sx,-sy);return small(c,tw,th);};
    const put=(k,tex,fill,mul)=>{const x=can[k].getContext('2d');x.imageSmoothingQuality='high';x.globalCompositeOperation='source-over';x.fillStyle=fill;x.fillRect(x0,y0,tw,th);if(tex&&tex.image){if(tex.repeat.x!==1||tex.repeat.y!==1||tex.offset.x||tex.offset.y)warn.push(name+': texture transform on '+a.name+' ignored');const im=cut(tex.image);if(pad)x.drawImage(im,x0,y0,tw,th);x.drawImage(im,x0+pad,y0+pad,tw-2*pad,th-2*pad);if(mul&&mul!=='rgb(255,255,255)'){x.globalCompositeOperation='multiply';x.fillStyle=mul;x.fillRect(x0,y0,tw,th);}has[k]=1;}return x;};
    const col=new THREE.Color().copy(a.color).convertLinearToSRGB();put('map',a.map,css(col.r,col.g,col.b),css(col.r,col.g,col.b));if(!a.map)has.map=1;
    put('normalMap',a.normalMap,'rgb(128,128,255)');
    const mr=a.roughnessMap||a.metalnessMap,f=css(1,a.roughness,a.metalness),x=put('orm',mr,f,f);has.orm=1;
    // red is shadowing: only where the material has it, else white
    const ao=a.aoMap&&a.aoMap.image&&a.aoMap.channel===0?a.aoMap:null;if(mr&&!(ao&&ao.image===mr.image)){const d=x.getImageData(x0,y0,tw,th);let src=null;if(ao){const t=document.createElement('canvas');t.width=tw;t.height=th;const tx=t.getContext('2d');const im=cut(ao.image);tx.drawImage(im,0,0,tw,th);tx.drawImage(im,pad,pad,tw-2*pad,th-2*pad);src=tx.getImageData(0,0,tw,th).data;}for(let q=0;q<d.data.length;q+=4)d.data[q]=src?src[q]:255;x.putImageData(d,x0,y0);}if(ao)has.ao=1;
    const e=new THREE.Color().copy(a.emissive).multiplyScalar(a.emissiveIntensity).convertLinearToSRGB(),lit=e.r+e.g+e.b>0;put('emissiveMap',lit?a.emissiveMap:null,lit&&!a.emissiveMap?css(e.r,e.g,e.b):'#000',css(e.r,e.g,e.b));if(lit)has.emissiveMap=1;
    if(!inside&&n>1)warn.push(name+': uv of '+a.name+' runs '+Math.min(...lo).toFixed(2)+'..'+Math.max(...hi).toFixed(2)+', wrapped into its tile');
    if(n>1||!whole)for(let q=0;q<uv.count;q++){let u=uv.getX(q),v=uv.getY(q);if(!inside){u-=Math.floor(u);v-=Math.floor(v);}u=(u-R[0])/(R[2]-R[0]);v=(v-R[1])/(R[3]-R[1]);uv.setXY(q,(x0+pad+u*(tw-2*pad))/S,(y0+pad+v*(th-2*pad))/S);}});
  const T=(k,srgb)=>{const t=new THREE.CanvasTexture(can[k]);t.flipY=false;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=srgb?THREE.SRGBColorSpace:THREE.NoColorSpace;t.userData.mimeType='image/jpeg';return t;};
  const m=new THREE.MeshStandardMaterial({name,color:0xffffff,metalness:1,roughness:1,side:ps.some(p=>p.mat.side===THREE.DoubleSide)?THREE.DoubleSide:THREE.FrontSide});m.map=T('map',1);if(has.normalMap)m.normalMap=T('normalMap');const orm=T('orm');m.roughnessMap=m.metalnessMap=orm;if(has.ao)m.aoMap=orm;if(has.emissiveMap){m.emissiveMap=T('emissiveMap',1);m.emissive.set(0xffffff);}
  return{mat:m,geo:n>1?mergeGeometries(ps.map(p=>p.geo),false):ps[0].geo,from:ps.map(p=>p.mat.name),maps:['map','normalMap','roughnessMap','aoMap','emissiveMap'].filter(k=>m[k])};}
window.prep=async(url,o,name)=>{await MS.ready;const scene=(await new GLTFLoader().loadAsync(url)).scene;scene.updateMatrixWorld(true);const warn=[];let ps=gather(scene,o);if(!ps.length)throw new Error('no meshes');
  // turn the nose to +Z and the top to +Y, put the middle of the box on the origin, make the longest side 1
  const f=AX[o.fwd||'+z'],u=AX[o.up||'+y'],r=new THREE.Vector3().crossVectors(u,f),M=new THREE.Matrix4().set(r.x,r.y,r.z,0,u.x,u.y,u.z,0,f.x,f.y,f.z,0,0,0,0,1);ps.forEach(p=>p.geo.applyMatrix4(M));
  const before=count(ps),tris=thin(ps,o.tris,o.flags);ps=ps.filter(p=>p.geo.index.count).map(p=>({mat:p.mat,geo:prune(p.geo)}));
  const b=new THREE.Box3();ps.forEach(p=>{p.geo.computeBoundingBox();b.union(p.geo.boundingBox);});const sz=b.getSize(V(0,0,0)),ce=b.getCenter(V(0,0,0)),s=1/Math.max(sz.x,sz.y,sz.z);
  M.makeScale(s,s,s).multiply(new THREE.Matrix4().makeTranslation(-ce.x,-ce.y,-ce.z));ps.forEach(p=>p.geo.applyMatrix4(M));
  // the parts with most triangles first; shared out over the materials kept
  ps.sort((a,b)=>b.geo.index.count-a.geo.index.count);const k=Math.min(o.mats||1,ps.length),groups=[];if(ps.length<=k)ps.forEach(p=>groups.push([p]));else{for(let i=0;i<k;i++)groups.push([]);ps.forEach((p,i)=>groups[i<k?i:k-1-(i-k)%k].push(p));}
  const out=new THREE.Scene(),mats=[];groups.forEach((g,i)=>{const p=pack(g,o.tex||1024,name+(groups.length>1?'_'+i:''),warn),m=new THREE.Mesh(prune(p.geo),p.mat);m.name=name+'_'+i;out.add(m);mats.push({name:p.mat.name,from:p.from,maps:p.maps,tex:o.tex||1024,tris:p.geo.index.count/3});});
  const b2=new THREE.Box3().setFromObject(out),bin=await new GLTFExporter().parseAsync(out,{binary:true,maxTextureSize:o.tex||1024});
  return{info:{tris:Math.round(tris),was:Math.round(before),materials:mats,size:sz.toArray().map(v=>+v.toPrecision(5)),scale:+s.toPrecision(6),box:[b2.min.toArray().map(v=>+v.toFixed(4)),b2.max.toArray().map(v=>+v.toFixed(4))]},warn,b64:b64(new Uint8Array(bin))};};
// the sky: made 4096 x 2048, its dark made black and its glow held down so it reads as space with stars, not a bright band
window.sky=async(url,w,h,q)=>{const im=new Image();im.src=url;await im.decode();const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(small(im,w,h),0,0,w,h);const d=x.getImageData(0,0,w,h),a=d.data,lut=new Uint8Array(256);
  for(let i=0;i<256;i++){const v=Math.max(0,i/255-.05)/.95;lut[i]=Math.round(255*Math.min(1,.82*Math.pow(v,1.55)+.18*Math.pow(v,.9)*v));}for(let i=0;i<a.length;i+=4){a[i]=lut[a[i]];a[i+1]=lut[a[i+1]];a[i+2]=lut[a[i+2]];}x.putImageData(d,0,0);
  const bl=await new Promise(r=>c.toBlob(r,'image/jpeg',q));return b64(new Uint8Array(await bl.arrayBuffer()));};window.ready=1;</script>`;
const fetchTo = (url, f) => { execFileSync('curl', ['-sSfL', '--retry', '3', '-A', 'asset-fetch', '-o', f + '.part', url], { stdio: 'inherit' }); fs.renameSync(f + '.part', f); };
(async () => {
  process.chdir(ROOT);
  const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : /\.m?js$/.test(f) ? 'text/javascript' : f.endsWith('.jpg') ? 'image/jpeg' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); fs.mkdirSync('dist', { recursive: true }); fs.writeFileSync('dist/_space_models.html', PAGE); fs.mkdirSync('data/space/m', { recursive: true }); fs.mkdirSync('data/full/space', { recursive: true });
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const open = async () => { const pg = await b.newPage(); pg.on('pageerror', e => console.log(e.message)); await pg.goto('http://127.0.0.1:' + srv.address().port + '/dist/_space_models.html'); await pg.waitForFunction(() => window.ready); return pg; };
  const J = fs.existsSync('data/space/models.json') ? JSON.parse(fs.readFileSync('data/space/models.json')) : {}, only = process.argv.slice(2);
  for (const [name, [uid, shard, o]] of Object.entries(LIST)) { if (only.length && !only.includes(name)) continue; const f = 'data/full/space/' + uid + '.glb';
    if (!fs.existsSync(f)) fetchTo(HF + shard + '/' + uid + '.glb', f);
    const pg = await open(), r = await pg.evaluate(([u, o, n]) => prep(u, o, n), ['/' + f, o, name]).catch(e => console.log(name, 'FAILED', e.message.slice(0, 300))); await pg.close(); if (!r) continue;
    const buf = Buffer.from(r.b64, 'base64'); fs.writeFileSync('data/space/m/' + name + '.glb', buf); J[name] = { file: 'm/' + name + '.glb', uid, bytes: buf.length, ...r.info }; r.warn.forEach(w => console.log('  ! ' + w));
    console.log(name, r.info.tris + ' of ' + r.info.was + ' tris', r.info.materials.map(m => m.from.length + '>' + m.maps.join('+')).join(' | '), 'size ' + r.info.size.join(' x '), Math.round(buf.length / 1024) + ' KB'); }
  if (!only.length || only.includes('sky')) { const f = 'data/full/space/eso0932a.jpg'; if (!fs.existsSync(f)) fetchTo(SKY, f); const pg = await open(); let buf, q = .86;
    do { buf = Buffer.from(await pg.evaluate(([u, q]) => sky(u, 4096, 2048, q), ['/' + f, q]), 'base64'); q -= .05; } while (buf.length > 1.05e6 && q > .4); await pg.close(); fs.writeFileSync('data/space/sky.jpg', buf); console.log('sky', Math.round(buf.length / 1024) + ' KB'); }
  fs.writeFileSync('data/space/models.json', JSON.stringify(J)); fs.rmSync('dist/_space_models.html'); await b.close(); srv.close();
})();
