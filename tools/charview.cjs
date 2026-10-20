const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
const [srcFile,start,end,out]=process.argv.slice(2), S=__dirname, R=process.cwd();
const all=fs.readFileSync(path.join(R,srcFile),'utf8'), i=all.indexOf(start), j=all.indexOf(end,i)+end.length; if(i<0||j<end.length)throw 'block not found'; const block=all.slice(i,j);
const p80=fs.readFileSync(path.join(R,'src/080-npc-parts.js'),'utf8'), e=p80.indexOf('\n',p80.indexOf('PARTSNPC.T={'));
const parts=p80.slice(0,e).replace(/^const PARTSNPC=\{\};/,'')+' }';
const F={'/view.html':[fs.readFileSync(S+'/charview.html'),'text/html'],'/three.module.js':[fs.readFileSync(R+'/node_modules/three/build/three.module.js'),'text/javascript'],'/src.js':[block,'text/plain'],'/parts.js':[parts,'text/plain']};
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const ctx=await b.newContext({viewport:{width:820,height:900}});
  await ctx.route('http://v/**',r=>{ const f=F[new URL(r.request().url()).pathname]; f?r.fulfill({status:200,contentType:f[1],body:f[0]}):r.abort(); });
  const pg=await ctx.newPage(); pg.on('pageerror',e=>console.log('ERR',e.message)); await pg.goto('http://v/view.html'); await pg.waitForFunction(()=>window.ready,null,{timeout:60000});
  console.log('tris',await pg.evaluate(()=>TRIS));
  for(const [k,a] of [['front',.15],['side',Math.PI/2+.1],['back',Math.PI+.15],['backside',-2.2]]){ await pg.evaluate(a=>shot(a),a); await pg.screenshot({path:out+'-'+k+'.png'}); }
  await b.close(); })();
