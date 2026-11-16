// draws HULL DOWN's trees and bushes (millions of triangles each as they come) into cards: PWCHROME=/opt/pw-browsers/chromium node tools/tank-bake.cjs [name ...]  ->  data/tank/tex/<name>_<0|1>_d.webp (colour, cut out), data/tank/trees.json (their sizes in metres); after python3 tools/tank-assets.py
const { chromium } = require('playwright'), fs = require('fs'), path = require('path'), http = require('http');
const ROOT = path.resolve(__dirname, '..'), T = 'node_modules/three147/', LIST = ['island_tree_01', 'island_tree_02', 'island_tree_03', 'tree_small_02', 'jacaranda_tree', 'shrub_02'], only = process.argv.slice(2);
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
const PAGE = `<canvas id=c></canvas><script src="/${T}build/three.min.js"></script><script src="/${T}examples/js/loaders/GLTFLoader.js"></script><script>
const R=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true,premultipliedAlpha:false,preserveDrawingBuffer:true});R.outputEncoding=THREE.sRGBEncoding;R.setClearColor(0,0);
window.bake=async(url,H)=>{const g=(await new Promise((ok,no)=>new THREE.GLTFLoader().load(url,ok,null,no))).scene,S=new THREE.Scene();S.add(g);g.updateMatrixWorld(true);
  const b=new THREE.Box3().setFromObject(g),sz=b.getSize(new THREE.Vector3()),ce=b.getCenter(new THREE.Vector3()),w=Math.max(sz.x,sz.z)*1.02,h=sz.y*1.02,W=Math.min(1024,Math.round(H*w/h/4)*4);R.setSize(W,H,false);
  const flat=[],norm=[];g.traverse(o=>{if(!o.isMesh)return;const m=o.material,cut=m.transparent||m.alphaTest>0||(m.map&&m.map.format===THREE.RGBAFormat);
    o.userData.d=new THREE.MeshBasicMaterial({map:m.map,color:m.color,side:THREE.DoubleSide,alphaTest:cut?.45:0});
    o.userData.n=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{map:{value:m.map},cut:{value:cut?.45:0}},vertexShader:'varying vec3 n;varying vec2 u;void main(){u=uv;n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:'uniform sampler2D map;uniform float cut;varying vec3 n;varying vec2 u;void main(){if(cut>0.&&texture2D(map,u).a<cut)discard;vec3 m=normalize(n);if(!gl_FrontFacing)m=-m;m.z=abs(m.z);gl_FragColor=vec4(m*.5+.5,1.);}'});});
  const cam=new THREE.OrthographicCamera(-w/2,w/2,h/2,-h/2,.1,1000),out=[];
  for(let v=0;v<2;v++){const a=v*Math.PI/2;cam.position.set(ce.x+Math.sin(a)*200,ce.y,ce.z+Math.cos(a)*200);cam.lookAt(ce);
    for(const k of['d']){g.traverse(o=>{if(o.isMesh)o.material=o.userData[k];});R.outputEncoding=k==='d'?THREE.sRGBEncoding:THREE.LinearEncoding;R.setClearColor(k==='d'?0:0x8080ff,k==='d'?0:1);R.render(S,cam);out.push(c.toDataURL('image/webp',k==='d'?.9:.82));}}
  return{w,h,W,H,out,foot:-b.min.y/h};};</script>`;
(async () => {
  await new Promise(r => srv.listen(0, '127.0.0.1', r)); const base = 'http://127.0.0.1:' + srv.address().port;
  fs.writeFileSync(path.join(ROOT, 'dist/_bake.html'), PAGE);
  const b = await chromium.launch({ ...(process.env.PWCHROME ? { executablePath: process.env.PWCHROME } : {}), args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--js-flags=--max-old-space-size=8192'] });
  const J = fs.existsSync('data/tank/trees.json') ? JSON.parse(fs.readFileSync('data/tank/trees.json')) : {};
  for (const n of LIST) { if (only.length && !only.includes(n)) continue; const pg = await b.newPage(); pg.on('pageerror', e => console.log(n, e.message));
    await pg.goto(base + '/dist/_bake.html'); const r = await pg.evaluate(([u, H]) => bake(u, H), ['/data/full/tank/' + n + '.glb', /tree/.test(n) ? 768 : 384]).catch(e => console.log(n, 'FAILED', e.message.slice(0, 200)));
    if (r) { r.out.forEach((d, i) => fs.writeFileSync('data/tank/tex/' + n + '_' + i + '_d.webp', Buffer.from(d.split(',')[1], 'base64'))); J[n] = { w: +r.w.toFixed(2), h: +r.h.toFixed(2), px: [r.W, r.H] }; console.log(n, J[n], r.out.map(d => Math.round(d.length * .75 / 1024) + 'KB').join(' ')); }
    await pg.close(); }
  fs.writeFileSync('data/tank/trees.json', JSON.stringify(J)); fs.rmSync(path.join(ROOT, 'dist/_bake.html')); await b.close(); srv.close();
})();
