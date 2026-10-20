// THE SAME PIXELS (19 Oct 2026, faster painting): node tests/texhash.cjs <base page> <head page>
// The ground, walls and floors are painted in code at the start. A faster painter must paint exactly the same pixels: this opens both
// pages (Math.random seeded the same), and once each has started hashes every texture in the scene (ImageData, canvases, data textures),
// and fails unless the two sets of hashes are identical. Prints how many textures and pixels were compared.
const {chromium}=require('playwright'), path=require('path');
const [A,B]=process.argv.slice(2).map(p=>path.resolve(p));
const run=async(b,page)=>{ const pg=await b.newPage({viewport:{width:640,height:360}}); pg.setDefaultTimeout(900000); const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,200)));
  await pg.addInitScript(()=>{ let x=123456789; Math.random=()=>{ x^=x<<13; x^=x>>>17; x^=x<<5; return (x>>>0)/4294967296; }; });
  await pg.goto('file://'+page+'?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'}); await pg.waitForFunction(()=>window.__started,null,{polling:200,timeout:900000});
  const r=await pg.evaluate(()=>{ const seen=new Set(), out=[]; let px=0; const cv=document.createElement('canvas'), g=cv.getContext('2d',{willReadFrequently:true});
    const fnv=d=>{ let h=2166136261; for(let i=0;i<d.length;i++){ h^=d[i]; h=Math.imul(h,16777619); } return (h>>>0).toString(16); };
    const bytes=im=>{ if(!im)return null; if(im.data&&im.width&&im.height&&!(im instanceof HTMLCanvasElement))return im.data; const w=im.width, h=im.height; if(!w||!h)return null; cv.width=w; cv.height=h; g.clearRect(0,0,w,h); g.drawImage(im,0,0); return g.getImageData(0,0,w,h).data; };
    const tex=t=>{ if(!t||seen.has(t)||!t.isTexture||t.isRenderTargetTexture)return; seen.add(t); try{ const d=bytes(t.image); if(d){ px+=d.length/4; out.push(t.image.width+'x'+t.image.height+':'+fnv(d)); } }catch(e){} };
    __dbg.scene.traverse(o=>{ const ms=Array.isArray(o.material)?o.material:o.material?[o.material]:[]; for(const m of ms)for(const k in m){ const v=m[k]; if(v&&v.isTexture)tex(v); } if(o.material&&o.material.uniforms)for(const k in o.material.uniforms){ const v=o.material.uniforms[k].value; if(v&&v.isTexture)tex(v); } });
    return {n:out.length,px,h:out.sort()}; });
  await pg.close(); return {...r,errs}; };
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const a=await run(b,A), c=await run(b,B); await b.close();
  const sa=new Set(a.h), sc=new Set(c.h), onlyA=a.h.filter(x=>!sc.has(x)), onlyB=c.h.filter(x=>!sa.has(x));
  console.log('base',a.n,'textures',a.px,'pixels | head',c.n,'textures',c.px,'pixels'); if(onlyA.length||onlyB.length)console.log('only in base:',onlyA.slice(0,10).join(' '),'| only in head:',onlyB.slice(0,10).join(' '));
  const ok=!onlyA.length&&!onlyB.length&&a.n>0; console.log(ok?'ok   the same pixels':'FAIL the pixels differ ('+onlyA.length+' / '+onlyB.length+' textures)'); process.exit(ok?0:1); })();
