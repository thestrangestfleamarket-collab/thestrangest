const {chromium}=require('playwright');const path=require('path'),fs=require('fs'),http=require('http');
const ROOT=path.join(__dirname,'..'),TH=path.dirname(require.resolve('three/package.json'));
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('.wasm')&&!fs.existsSync(f))f=f.slice(0,-5);if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}
 const ext=path.extname(f);r.writeHead(200,{'content-type':{'.html':'text/html; charset=utf-8','.webp':'image/webp','.glb':'model/gltf-binary','.hdr':'application/octet-stream'}[ext]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(8765);
(async()=>{
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}).catch(async e=>{console.log(e.message);return chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']})});
 const p=await b.newPage({viewport:{width:+(process.env.W||1280),height:+(process.env.HH||800)}});
 p.on('console',m=>{if(m.type()!=='log'||process.env.LOG)console.log('console',m.type(),m.text().slice(0,400))});p.on('pageerror',e=>console.log('pageerror',e.message));
 await p.route('https://cdn.jsdelivr.net/npm/three@0.170.0/**',(rt)=>{const u=rt.request().url().replace('https://cdn.jsdelivr.net/npm/three@0.170.0/','');rt.fulfill({path:path.join(TH,u),contentType:'text/javascript'})});
 await p.route('https://fonts.googleapis.com/**',rt=>rt.fulfill({body:'',contentType:'text/css'}));
 const shots=(process.env.SHOTS||'island').split(' ');
 for(const s of shots){const [q,name]=s.split('|');
  await p.goto('http://localhost:8765/index.html?'+(q.includes('=')?q:'view='+q));
  await p.waitForFunction(()=>window.__ready,null,{timeout:900000});
  await p.waitForTimeout(+(process.env.WAIT||4000));
  const out=path.join(process.env.OUT||'.','shot_'+(name||q.replace(/[^a-z0-9]+/gi,'_'))+'.png');await p.screenshot({path:out,timeout:300000});console.log('saved',out)}
 await b.close();srv.close();
})();
