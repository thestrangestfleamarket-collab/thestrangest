// THE MEGAKIT BAKE: renders the Downtown City MegaKit's whole buildings (glTF) square-on from each side into one low-res atlas for the blocks.
// Needs python3 with PIL (the palette step). Run: node tools/megakit-bake.cjs <folder with Building_*.gltf/.bin and their T_*_BaseColor / interior .png>  → data/megakit.png, data/megakit-lit.png, data/megakit.json
const {chromium}=require('playwright'), fs=require('fs'), path=require('path'), {execFileSync}=require('child_process');
const DIR=path.resolve(process.argv[2]||'.'), R=path.resolve(__dirname,'..'), PX=12, SS=4;
const B=[['small','Building_Small_1',[-7,5],[-12,0],17],['medium','Building_Medium_2_001',[-7,7],[-12,0],25],['large','Building_Large_2',[-9,11],[-16,0],28]];
const LIT=/FakeInterior_[123]$/;
const page=`<!doctype html><body style="margin:0;background:#000"><script type="importmap">{"imports":{"three":"/three.module.js","three/addons/":"/jsm/"}}</script>
<script type="module">
import * as THREE from 'three'; import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const PX=${PX}, SS=${SS}, LIT=${LIT}, ren=new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true}); ren.outputColorSpace=THREE.SRGBColorSpace; document.body.appendChild(ren.domElement);
const shade=(sc)=>{ sc.add(new THREE.AmbientLight(0xffffff,1.1)); const d=new THREE.DirectionalLight(0xffffff,1.0); d.position.set(.35,.6,1); sc.add(d); sc.userData.d=d; };
window.bake=async(name,X,Z,H)=>{ const g=await new GLTFLoader().loadAsync('/kit/'+name+'.gltf'), root=g.scene, mats=new Map();
  root.traverse(o=>{ if(!o.isMesh)return; const ms=Array.isArray(o.material)?o.material:[o.material];
    o.material=ms.map(m=>{ if(!mats.has(m)){ m.vertexColors=false; const lit=LIT.test(m.name), al=new THREE.MeshLambertMaterial({map:m.map,color:m.color,transparent:m.transparent,opacity:m.opacity,side:THREE.DoubleSide}),
      em=lit?new THREE.MeshBasicMaterial({map:m.map,color:0xcccccc,side:THREE.DoubleSide}):new THREE.MeshBasicMaterial({color:0,side:THREE.DoubleSide,visible:!m.transparent}); mats.set(m,{al,em}); } return mats.get(m); });
    o.userData.m=o.material; o.material=o.material.length===1?o.material[0]:o.material; });
  const use=k=>root.traverse(o=>{ if(o.isMesh){ const m=o.userData.m.map(x=>x[k]); o.material=m.length===1?m[0]:m; } });
  const sc=new THREE.Scene(); sc.add(root); shade(sc); const out={};
  const W=X[1]-X[0], D=Z[1]-Z[0], cx=(X[0]+X[1])/2, cz=(Z[0]+Z[1])/2;
  const sides={front:[W,[cx,H/2,40],[cx,H/2,cz],[.35,.6,1]],back:[W,[cx,H/2,-40],[cx,H/2,cz],[-.35,.6,-1]],east:[D,[40,H/2,cz],[cx,H/2,cz],[1,.6,-.35]],west:[D,[-40,H/2,cz],[cx,H/2,cz],[-1,.6,.35]]};
  for(const [k,[w,p,t,l]] of Object.entries(sides)){ const cw=Math.round(w*PX), ch=Math.round(H*PX); ren.setSize(cw*SS,ch*SS,false);
    const cam=new THREE.OrthographicCamera(-w/2,w/2,H/2,-H/2,.1,200); cam.position.set(...p); cam.lookAt(...t); sc.userData.d.position.set(...l);
    const pic=[]; for(const pass of ['al','em']){ use(pass); ren.setClearColor(0,pass==='em'?1:0); ren.render(sc,cam);
      const c=document.createElement('canvas'); c.width=cw*SS; c.height=ch*SS; c.getContext('2d').drawImage(ren.domElement,0,0); const s=c.getContext('2d').getImageData(0,0,cw*SS,ch*SS).data;
      const o=new Uint8ClampedArray(cw*ch*4); for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){ let r=0,gg=0,b=0,a=0; for(let j=0;j<SS;j++)for(let i=0;i<SS;i++){ const q=((y*SS+j)*cw*SS+x*SS+i)*4; r+=s[q]*s[q+3]; gg+=s[q+1]*s[q+3]; b+=s[q+2]*s[q+3]; a+=s[q+3]; }
        const q=(y*cw+x)*4; if(a){ o[q]=r/a; o[q+1]=gg/a; o[q+2]=b/a; } o[q+3]=255; }
      pic.push(o); }
    out[k]={w:cw,h:ch,al:Array.from(pic[0]),em:Array.from(pic[1])}; }
  return out; };
window.ready=1;
</script>`;
const mime=f=>f.endsWith('.js')?'text/javascript':f.endsWith('.png')?'image/png':f.endsWith('.gltf')?'model/gltf+json':'application/octet-stream';
(async()=>{ const b=await chromium.launch({executablePath:process.env.CHROME||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const ctx=await b.newContext();
  await ctx.route('http://v/**',r=>{ const p=decodeURIComponent(new URL(r.request().url()).pathname);
    const f=p==='/'?null:p==='/three.module.js'?R+'/node_modules/three/build/three.module.js':p.startsWith('/jsm/')?R+'/node_modules/three/examples/jsm/'+p.slice(5):p.startsWith('/kit/')?path.join(DIR,path.basename(p)):null;
    if(p==='/')return r.fulfill({status:200,contentType:'text/html',body:page}); if(!f||!fs.existsSync(f))return r.fulfill({status:404,body:''}); r.fulfill({status:200,contentType:mime(f),body:fs.readFileSync(f)}); });
  const pg=await ctx.newPage(); pg.on('pageerror',e=>console.log('ERR',e.message)); pg.on('console',m=>{ if(m.type()==='error')console.log('console',m.text()); });
  await pg.goto('http://v/'); await pg.waitForFunction(()=>window.ready,null,{timeout:60000});
  const faces=[]; for(const [id,name,X,Z,H] of B){ const o=await pg.evaluate(a=>bake(...a),[name,X,Z,H]); faces.push([id,X,Z,H,o]); console.log(id,Object.values(o).map(f=>f.w+'x'+f.h).join(' ')); }
  let AW=0, AH=0; const meta={px:PX,b:{}}, place=[]; for(const [id,X,Z,H,o] of faces){ let x=0; const m={w:X[1]-X[0],d:Z[1]-Z[0],h:H}; for(const k of ['front','back','east','west']){ m[k]=[x,AH,o[k].w,o[k].h]; place.push([x,AH,o[k]]); x+=o[k].w; } AW=Math.max(AW,x); AH+=o.front.h; meta.b[id]=m; }
  const png=await pg.evaluate(([AW,AH,place])=>['al','em'].map(k=>{ const c=document.createElement('canvas'); c.width=AW; c.height=AH; const g=c.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,AW,AH);
    for(const [x,y,f] of place)g.putImageData(new ImageData(new Uint8ClampedArray(f[k]),f.w,f.h),x,y); return c.toDataURL('image/png').split(',')[1]; }),[AW,AH,place]);
  fs.writeFileSync(R+'/data/megakit.png',Buffer.from(png[0],'base64')); fs.writeFileSync(R+'/data/megakit-lit.png',Buffer.from(png[1],'base64'));
  execFileSync('python3',['-I','-c',"import sys\nfrom PIL import Image\nfor f in sys.argv[1:]: Image.open(f).convert('RGB').quantize(64,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).save(f,optimize=True)",R+'/data/megakit.png',R+'/data/megakit-lit.png']);   // 64 colours: a tenth of the download
  meta.aw=AW; meta.ah=AH; fs.writeFileSync(R+'/data/megakit.json',JSON.stringify(meta)); console.log('atlas',AW+'x'+AH,['megakit.png','megakit-lit.png'].map(f=>Math.round(fs.statSync(R+'/data/'+f).size/1024)+'KB').join(' '));
  await b.close(); })();
