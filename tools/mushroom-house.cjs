const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
const out=process.argv[2]||'mockups/mushroom-house', R=process.cwd(), S=__dirname;
const p80=fs.readFileSync(path.join(R,'src/080-npc-parts.js'),'utf8'), e=p80.indexOf('\n',p80.indexOf('PARTSNPC.T={'));
const F={'/h.html':[fs.readFileSync(S+'/mushroom-house.html'),'text/html'],'/three.module.js':[fs.readFileSync(R+'/node_modules/three/build/three.module.js'),'text/javascript'],'/parts.js':[p80.slice(0,e).replace(/const PARTSNPC=\{\};/,'')+' }','text/plain']};
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const ctx=await b.newContext({viewport:{width:700,height:820}});
  await ctx.route('http://v/**',r=>{ const p=new URL(r.request().url()).pathname; if(p.startsWith('/jsm/'))return r.fulfill({status:200,contentType:'text/javascript',body:fs.readFileSync(R+'/node_modules/three/examples/jsm/'+p.slice(5))}); const f=F[p]; f?r.fulfill({status:200,contentType:f[1],body:f[0]}):r.abort(); });
  const pg=await ctx.newPage(); pg.on('pageerror',e=>console.log('ERR',e.message)); await pg.goto('http://v/h.html'); await pg.waitForFunction(()=>window.ready,null,{timeout:120000});
  console.log('tris',JSON.stringify(await pg.evaluate(()=>TRIS)));
  fs.writeFileSync(out+'.glb',Buffer.from(await pg.evaluate(()=>exp()),'base64')); console.log(out+'.glb',fs.statSync(out+'.glb').size,'bytes');
  const V={front:[1.2,4.5,19,1,4.3,0,6,10,12],side:[19,4.5,3,1,4.3,0,12,10,6],back:[-8,5.5,-17,1,4.3,0,-6,10,-12],above:[9,17,12,1,4,0,6,12,8]};
  for(const [k,v] of Object.entries(V)){ await pg.evaluate(v=>shot(...v),v); await pg.screenshot({path:`${out}-${k}.png`}); }
  await pg.evaluate(()=>open(1.3)); await pg.evaluate(()=>shot(2.3,2.8,7.5,2.1,2.4,0,6,10,12)); await pg.screenshot({path:`${out}-door.png`});
  await pg.evaluate(()=>shot(.9,3.0,1.2,-.6,2.6,-1.4,6,10,12,1)); await pg.screenshot({path:`${out}-inside1.png`});
  await pg.evaluate(()=>shot(.6,5.6,1.0,-.4,4.6,-1.0,6,10,12,1)); await pg.screenshot({path:`${out}-inside2.png`});
  await b.close(); })();
