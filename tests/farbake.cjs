// BAKE THE FAR CITY (owner, 18 Oct 2026: "bake the distance into the smallest perm files to use over and over"): the page in ?farbake=1 photographs
// the far blocks from the town's middle the four ways (FAR3.bake, skyline.js) at 5 pixels a degree, by day (the game's held 5:24 pm) and at night
// (21:00, its lit windows), and how deep into the distance each pixel is; written as data/far-day.png (alpha: the buildings), data/far-night.png
// (alpha: the distance, for the mist) and data/far.json. Run again only when the far rows change. node tests/farbake.cjs [dens=5]
const {chromium}=require('playwright'), fs=require('fs'), dens=+(process.argv[2]||5);
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:400,height:300}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&farbake=1&wx=cloudy',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(4000);
  const grab=(pk)=>pg.evaluate(([d,pk])=>{ const r=FAR3.bake(d,pk); return r; },[dens,pk]);
  const toPng=(img,alphaFrom)=>pg.evaluate(([img,af])=>{ const c=document.createElement('canvas'); c.width=img.W; c.height=img.H; const x=c.getContext('2d'), id=x.createImageData(img.W,img.H), s=v=>{ v=Math.max(0,Math.min(1,v)); return Math.round(255*(v<=.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-.055)); };
    for(let i=0;i<img.W*img.H;i++){ const cov=img.data[i*4+3]>.5; id.data[i*4]=s(img.data[i*4]); id.data[i*4+1]=s(img.data[i*4+1]); id.data[i*4+2]=s(img.data[i*4+2]); id.data[i*4+3]=cov?(af?Math.max(1,Math.round(255*Math.min(1,af.data[i*4]))):255):0; }
    x.putImageData(id,0,0); return c.toDataURL('image/png'); },[img,alphaFrom]);
  const half=r=>{ const W=r.W/2, d=[]; for(let y=0;y<r.H;y++) d.push(...r.data.slice(y*r.W*4,y*r.W*4+W*4)); return {...r,W,data:d}; };   // (half the ring: the owner's "cut it in half and just reuse it tile")
  const day=half(await grab(false));
  await pg.evaluate(()=>{ __dbg.CLOCK.h=21; }); await pg.waitForTimeout(3000);
  const night=half(await grab(false)), pk=half(await grab(true));
  const save=(f,u)=>fs.writeFileSync('data/'+f,Buffer.from(u.split(',')[1],'base64'));
  save('far-day.png',await toPng(day,null)); save('far-night.png',await toPng(night,pk));
  const m=day.meta; fs.writeFileSync('data/far.json',JSON.stringify({CX:+m.CX.toFixed(2),CZ:+m.CZ.toFixed(2),EYE:m.EYE,V0:+m.V0.toFixed(5),V1:+m.V1.toFixed(5),N:m.N,dens:m.dens,W:day.W,H:day.H,faces:2}));
  console.log('baked',day.W,'x',day.H,'| day',fs.statSync('data/far-day.png').size,'bytes, night',fs.statSync('data/far-night.png').size,'| errors',errs.slice(0,3)); await b.close(); })();
