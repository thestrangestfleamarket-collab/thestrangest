const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
const [srcFile,start,end,out,script='walk']=process.argv.slice(2), S=__dirname, R=process.cwd();
const all=fs.readFileSync(path.join(R,srcFile),'utf8'), i=all.indexOf(start), j=all.indexOf(end,i)+end.length; if(i<0||j<end.length)throw 'block not found';
const p80=fs.readFileSync(path.join(R,'src/080-npc-parts.js'),'utf8'), e=p80.indexOf('\n',p80.indexOf('PARTSNPC.T={'));
const F={'/a.html':[fs.readFileSync(S+'/charanim.html'),'text/html'],'/three.module.js':[fs.readFileSync(R+'/node_modules/three/build/three.module.js'),'text/javascript'],'/src.js':[all.slice(i,j),'text/plain'],
  '/parts.js':[p80.slice(0,e).replace(/const PARTSNPC=\{\};/,'')+' }','text/plain'],'/rig.js':[fs.readFileSync(path.join(R,'src/083-npc-rig.js'),'utf8'),'text/plain']};
const PLAN=[['stand',1,0,0],['walk',2.5,.5,0],['turn',1.2,.5,1.6],['walk',1,.5,0],['stop',2.5,0,0]];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const ctx=await b.newContext({viewport:{width:420,height:520}});
  await ctx.route('http://v/**',r=>{ const f=F[new URL(r.request().url()).pathname]; f?r.fulfill({status:200,contentType:f[1],body:f[0]}):r.abort(); });
  const pg=await ctx.newPage(); pg.on('pageerror',e=>console.log('ERR',e.message)); await pg.goto('http://v/a.html'); await pg.waitForFunction(()=>window.ready,null,{timeout:60000});
  let k=0; fs.mkdirSync(out,{recursive:true});
  for(const [nm,secs,v,turn] of PLAN){ for(let f=0;f<secs*12;f++){ await pg.evaluate(([v,turn])=>{ for(let s=0;s<5;s++)step(1/60,v,turn); },[v,turn]); await pg.evaluate(()=>shot(Math.PI/2+.5)); await pg.screenshot({path:`${out}/f${String(k++).padStart(3,'0')}.png`}); } }
  console.log('frames',k); await b.close(); })();
