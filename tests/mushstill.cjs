// THE MUSHROOM SELLER STANDING STILL (npc-map.js's standing pose): close on him at his booth, 12 frames a quarter second apart; how many of
// his pixels change from frame to frame (his own shadow crawling over his robe). node tests/mushstill.cjs <out> [query]
const {chromium}=require('playwright'), {PNG}=(()=>{ try{ return require('pngjs'); }catch(e){ return {}; } })(), out=process.argv[2]||'.', q=process.argv[3]||'';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:640,height:480}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message));
  const load=async qq=>{ await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&wx=clear&hideme=1&hour=15.5&walkers=0'+q+qq,{waitUntil:'commit',timeout:180000});
    for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; }
    for(let i=0;i<60;i++){ if(await pg.evaluate(()=>!!(window.SELLERDBG&&SELLERDBG().booth)))break; await pg.waitForTimeout(500); } };
  await load(''); const m=await pg.evaluate(()=>Object.assign(SELLERDBG(),{T:__dbg.cv().TILE})); console.log(JSON.stringify(m));
  await load(`&at=${m.x},${m.z-1.5*m.T}`); await pg.evaluate(()=>__dbg.cam(null,null,__dbg.cv().PPU*2.4)); await pg.waitForTimeout(12000);
  const shots=[]; for(let i=0;i<12;i++){ shots.push(await pg.screenshot({clip:{x:400,y:0,width:220,height:400}})); await pg.waitForTimeout(250); }
  require('fs').writeFileSync(out+'/mush0.png',shots[0]); await pg.screenshot({path:out+'/full.png'}); require('fs').writeFileSync(out+'/mush11.png',shots[11]);
  const px=await pg.evaluate(async bs=>{ const L=[]; for(const s of bs){ const im=new Image(); im.src='data:image/png;base64,'+s; await im.decode(); const c=document.createElement('canvas'); c.width=im.width; c.height=im.height; const x=c.getContext('2d'); x.drawImage(im,0,0); L.push(x.getImageData(0,0,c.width,c.height).data); }
    const d=[]; for(let i=1;i<L.length;i++){ let n=0; for(let k=0;k<L[i].length;k+=4)if(Math.abs(L[i][k]-L[i-1][k])+Math.abs(L[i][k+1]-L[i-1][k+1])+Math.abs(L[i][k+2]-L[i-1][k+2])>12)n++; d.push(n); } return d; },shots.map(s=>s.toString('base64')));
  console.log('changed pixels frame to frame',px.join(' '),'mean',Math.round(px.reduce((a,b)=>a+b,0)/px.length)); await b.close(); })();
