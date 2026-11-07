// THE FIRST DAY (src/162g-firstday.js): node tests/firstday.cjs [out folder]. A new player's setup before the world: a name (a bad one refused), the look (figure, skin, hair, its colour) on your
// avatar turning on the stage, the stats (90 points), then out onto the platform with the starter money and things; with an out folder, a picture of each step.
const {chromium}=require('playwright'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1100,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  { const DIR=require('path').join(process.cwd(),'node_modules/@dimforge/rapier3d-compat'), fs=require('fs');
    await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/,r=>{ const f=require('path').join(DIR,new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1]||''); if(!fs.existsSync(f))return r.continue();
      r.fulfill({path:f,contentType:/\.wasm$/.test(f)?'application/wasm':'text/javascript'}); }); }
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms=60000)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(300))if(await pg.evaluate(f))return true; return false; };
  const shot=async n=>{ if(OUT){ require('fs').mkdirSync(OUT,{recursive:true}); await pg.screenshot({path:OUT+'/'+n+'.png'}); } };
  const click=async sel=>{ await pg.click('#fday '+sel); await wait(700); };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&firstday=1&hour=12',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  rec('a new player sees the first day before the world, at the name',await U(()=>{ const r=document.getElementById('fday'); return r&&!r.hidden&&FIRSTDAY.on&&!!document.getElementById('fdn'); }));
  await U(()=>AVATAR.ready()); await wait(1500);
  const lit=await pg.evaluate(()=>{ const c=document.querySelector('#fday canvas'), d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0; for(let i=3;i<d.length;i+=4)if(d[i]>0)n++; return n; });
  rec('your avatar stands on the stage',lit>3000,'pixels '+lit); await shot('1-name');
  await pg.fill('#fdn','x'); await click('[data-nav="1"]');
  rec('a name too short is refused, and you stay on the name',await pg.evaluate(()=>!!document.getElementById('fdn')&&/3 TO 16/.test(document.querySelector('#fday .why').textContent)));
  await pg.fill('#fdn','  rosa  the trader '); await click('[data-nav="1"]');
  rec('a good name is taken in capitals and you go on to the look',await pg.evaluate(()=>LOOKS.L.name==='ROSA THE TRADER'&&!!document.querySelector('#fday [data-f]')),await pg.evaluate(()=>LOOKS.L.name));
  await click('[data-f="f"]'); await U(()=>AVATAR.L().f==='f'&&AVATAR.ready()); await click('[data-skin="7e4c2f"]'); await click('[data-hc="b98a4e"]');
  const pony=await pg.evaluate(()=>{ const b=[...document.querySelectorAll('#fday [data-hair]')].find(x=>x.textContent==='PONYTAIL'); return b?b.dataset.hair:null; }); if(pony)await click(`[data-hair="${pony}"]`);
  await U(()=>AVATAR.ready()); await wait(1500); await shot('2-look');
  const L=await pg.evaluate(()=>{ const L=AVATAR.L(); return {f:L.f,skin:L.skin,hair:L.hair,w:L.w.hair&&L.w.hair[0]}; });
  rec('the look: woman, the skin, the hair and its colour, on your avatar',L.f==='f'&&L.skin==='7e4c2f'&&L.hair==='b98a4e'&&String(L.w)===String(pony),JSON.stringify(L));
  await click('[data-nav="1"]'); await click('[data-st="int"][data-d="-5"]'); await click('[data-st="int"][data-d="-5"]'); await click('[data-st="str"][data-d="5"]'); await click('[data-st="str"][data-d="5"]'); await click('[data-st="str"][data-d="5"]'); await shot('3-stats');
  const st0=await pg.evaluate(()=>document.querySelector('#fday .stp').textContent);
  await click('[data-nav="1"]');
  const end=await pg.evaluate(()=>({on:FIRSTDAY.on,hidden:document.getElementById('fday').hidden,st:FORAGE.stats.get(),picked:FORAGE.stats.picked(),cash:INV.cash,snacks:INV.items.fr_apple||0,rod:FORAGE.has('rod'),flag:__dbg.SAVE.get('firstday'),name:ONLINE.myName()}));
  rec('the stats are yours (90 points, each 10 to 60)',end.picked&&end.st.str+end.st.int+end.st.sta<=90&&end.st.str===40&&end.st.int===20,st0+' '+JSON.stringify(end.st));
  rec('out onto the platform: the setup gone, with $1,000, two apples and a fishing rod',!end.on&&end.hidden&&end.cash===1000&&end.snacks===2&&end.rod&&end.flag==='1',JSON.stringify(end));
  rec('other players see your name',end.name==='ROSA THE TRADER',end.name);
  await wait(1500); await shot('4-out');
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,v])=>v+'× '+k).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'ALL PASS'); process.exit(bad?1:0); })();
