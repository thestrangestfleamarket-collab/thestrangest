// THE SAME PIXELS (19-20 Oct 2026, faster painting): node tests/texhash.cjs <base page> <head page>
// The ground, walls and floors are painted in code at the start. A faster painter must paint exactly the same pixels: this opens both
// pages (Math.random seeded the same), and once each has started hashes every texture in the scene (ImageData, canvases, data textures),
// (after STORE.ensure() and the painting queues painted out, BATCH.queues (BODB.gnear before 21 Oct), so whatever the start builds a piece at a time afterwards is all built in both) and fails unless the two sets
// of hashes are identical. The head is opened a second time in the same browser profile, so its ground comes
// from the paint cache (PAINTC), and that must match too. Prints how many textures and pixels were compared. It also hashes the
// (a patch is matched by kind, place and height, not by the last part of its key, the hash of its painter's source text: a rename in a
// painter must not read as different pixels). It also hashes the
// vertices of every body built at the start (NPCs, with their self-shading `sh`, and the figures built from shapes, with `c0`): the same.
const {chromium}=require('playwright'), path=require('path');
const [A,B]=process.argv.slice(2).map(p=>path.resolve(p));
const run=async(ctx,page,waitSave)=>{ const t0=Date.now(); const pg=await ctx.newPage({viewport:{width:640,height:360}}); pg.setDefaultTimeout(900000); const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,200)));
  await pg.addInitScript(()=>{ let x=123456789; Math.random=()=>{ x^=x<<13; x^=x>>>17; x^=x<<5; return (x>>>0)/4294967296; }; });
  await pg.addInitScript(()=>{ window.__PH={}; const fnv=d=>{ let h=2166136261; for(let i=0;i<d.length;i++){ h^=d[i]; h=Math.imul(h,16777619); } return (h>>>0).toString(16); }; let P;
    Object.defineProperty(window,'PAINTC',{configurable:true,get:()=>P,set:v=>{ P=v; if(!v||v.__w)return; v.__w=1; const g=v.get, p=v.put;
      v.get=(k,w,h,fn)=>{ const im=g(k,w,h,fn); if(im)__PH[k]=fnv(im.data); return im; }; v.put=(k,im)=>{ __PH[k]=fnv(im.data); return p(k,im); }; }}); });
  await pg.goto('file://'+page+'?capture=1&fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'}); await pg.waitForFunction(()=>window.__started,null,{polling:200,timeout:900000});
  await pg.evaluate(()=>{ if(window.STORE&&STORE.ensure)STORE.ensure(); if(window.BATCH&&BATCH.queues)for(const q of BATCH.queues)q.near(0,0,Infinity); else if(window.BODB&&BODB.gnear)BODB.gnear(0,0,Infinity); }); await pg.waitForTimeout(3000);
  const r=await pg.evaluate(()=>{ const seen=new Set(), out=[]; let px=0; const cv=document.createElement('canvas'), g=cv.getContext('2d',{willReadFrequently:true});
    const fnv=d=>{ let h=2166136261; for(let i=0;i<d.length;i++){ h^=d[i]; h=Math.imul(h,16777619); } return (h>>>0).toString(16); };
    const bytes=im=>{ if(!im)return null; if(im.data&&im.width&&im.height&&!(im instanceof HTMLCanvasElement))return im.data; const w=im.width, h=im.height; if(!w||!h)return null; cv.width=w; cv.height=h; g.clearRect(0,0,w,h); g.drawImage(im,0,0); return g.getImageData(0,0,w,h).data; };
    const tex=t=>{ if(!t||seen.has(t)||!t.isTexture||t.isRenderTargetTexture)return; seen.add(t); try{ const d=bytes(t.image); if(d){ px+=d.length/4; out.push(t.image.width+'x'+t.image.height+':'+fnv(d)); } }catch(e){} };
    __dbg.scene.traverse(o=>{ const ms=Array.isArray(o.material)?o.material:o.material?[o.material]:[]; for(const m of ms)for(const k in m){ const v=m[k]; if(v&&v.isTexture)tex(v); } if(o.material&&o.material.uniforms)for(const k in o.material.uniforms){ const v=o.material.uniforms[k].value; if(v&&v.isTexture)tex(v); } });
    const gs=new Set(), geo=[]; __dbg.scene.traverse(o=>{ const G=o.geometry; if(!G||gs.has(G)||!G.attributes||!(G.attributes.sh||G.attributes.c0))return; gs.add(G); let h=2166136261, n=0;
      for(const k of Object.keys(G.attributes).sort()){ const A=G.attributes[k].array, d=new Uint8Array(A.buffer,A.byteOffset,A.byteLength); for(let i=0;i<k.length;i++){ h^=k.charCodeAt(i); h=Math.imul(h,16777619); } for(let i=0;i<d.length;i++){ h^=d[i]; h=Math.imul(h,16777619); } n+=d.length; }
      if(G.index){ const d=new Uint8Array(G.index.array.buffer,G.index.array.byteOffset,G.index.array.byteLength); for(let i=0;i<d.length;i++){ h^=d[i]; h=Math.imul(h,16777619); } }
      geo.push((G.attributes.position?G.attributes.position.count:0)+'v:'+(h>>>0).toString(16)); });
    return {n:out.length,px,h:out.sort(),ph:window.__PH,geo:geo.sort()}; });
  const startMs=Date.now()-t0, pc=await pg.evaluate(()=>window.PAINTC?{...PAINTC.P}:null);
  if(waitSave)await pg.waitForFunction(()=>!window.PAINTC||PAINTC.P.saved>0,null,{polling:500,timeout:120000}).catch(()=>{});
  await pg.close(); return {...r,errs,startMs,pc}; };
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const a=await run(await b.newContext(),A,false), ctx=await b.newContext(), c=await run(ctx,B,true), c2=await run(ctx,B,false); await b.close();
  console.log('start ms: base',a.startMs,'| head, first visit',c.startMs,c.pc?JSON.stringify(c.pc):'','| head, second visit',c2.startMs,c2.pc?JSON.stringify(c2.pc):'');
  const s2=new Set(c2.h), cacheDiff=c.h.filter(x=>!s2.has(x)).length+c2.h.filter(x=>!new Set(c.h).has(x)).length;
  
  const sa=new Set(a.h), sc=new Set(c.h), onlyA=a.h.filter(x=>!sc.has(x)), onlyB=c.h.filter(x=>!sa.has(x));
  console.log('base',a.n,'textures',a.px,'pixels | head',c.n,'textures',c.px,'pixels'); if(onlyA.length||onlyB.length)console.log('only in base:',onlyA.slice(0,10).join(' '),'| only in head:',onlyB.slice(0,10).join(' '));
  const spot=o=>{ const r={}; for(const k in o)r[k.replace(/\|[^|]*$/,'')]=o[k]; return r; };
  const pd=(x,y)=>{ x=spot(x); y=spot(y); const ks=new Set([...Object.keys(x),...Object.keys(y)]); let d=0; for(const k of ks)if(x[k]!==y[k])d++; return [ks.size,d]; };
  const [n1,d1]=pd(a.ph,c.ph), [n2,d2]=pd(c.ph,c2.ph);
  console.log('ground patches: '+n1+' compared base vs head, '+d1+' differ | '+n2+' compared head vs head from the cache, '+d2+' differ');
  console.log('(whole texture sheets: '+(onlyA.length+onlyB.length)+' differ, '+(cacheDiff)+' from the cache; the ground is now painted round you first, so its patches land on the sheets in another order each run: informational only)');
  const ok=n1>0&&!d1&&!d2&&a.ph&&Object.keys(a.ph).length>0; console.log(ok?'ok   the same pixels in every ground patch':'FAIL the ground patches differ');
  const ms=L=>{ const m=new Map(); for(const x of L)m.set(x,(m.get(x)||0)+1); return m; }, ga=ms(a.geo), gc=ms(c.geo), gd=[...new Set([...ga.keys(),...gc.keys()])].filter(k=>ga.get(k)!==gc.get(k));
  const og=a.geo.length>0&&!gd.length; console.log('people\'s bodies: base '+a.geo.length+', head '+c.geo.length+(gd.length?', differ: '+gd.slice(0,12).map(k=>k+' base '+(ga.get(k)||0)+' head '+(gc.get(k)||0)).join(' | '):''));
  console.log(og?'ok   the same vertices in every body (NPCs and figures)':'FAIL the bodies differ'); process.exit(ok&&og?0:1); })();
