// THE START, BY FUNCTION (measurement only, 19 Oct 2026): node tests/cpuprof.cjs <out dir>
// Opens the readable page under Chrome's sampling profiler from the first byte to the start and writes the functions that used the most
// time themselves (self time) and with what they call (total), with the source file and line, so the slow painters can be found.
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'out/cpu'; fs.mkdirSync(OUT,{recursive:true});
const src=fs.readdirSync('src').filter(f=>/^\d{3}[a-z]?-.+\.(js|html)$/.test(f)).sort();
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000);
  const cdp=await pg.context().newCDPSession(pg); await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval',{interval:500}); await cdp.send('Profiler.start');
  await pg.goto('file://'+path.resolve('dist/market.html')+'?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'}); await pg.waitForFunction(()=>window.__started,null,{polling:200,timeout:900000});
  const {profile}=await cdp.send('Profiler.stop'); await b.close();
  const N=new Map(profile.nodes.map(n=>[n.id,n])), self=new Map(); const dt=profile.timeDeltas; for(let i=0;i<profile.samples.length;i++){ const id=profile.samples[i]; self.set(id,(self.get(id)||0)+(dt[i]||0)); }
  const key=n=>{ const c=n.callFrame; return (c.functionName||'(anon)')+' @'+(c.url?path.basename(c.url):'')+':'+(c.lineNumber+1)+':'+(c.columnNumber+1); };
  const S={}; for(const [id,t] of self){ const k=key(N.get(id)); S[k]=(S[k]||0)+t; }
  const parent=new Map(); for(const n of profile.nodes)for(const c of n.children||[])parent.set(c,n.id);
  const T={}; for(const [id,t] of self){ const seen=new Set(); for(let q=id;q!=null;q=parent.get(q)){ const k=key(N.get(q)); if(!seen.has(k)){ seen.add(k); T[k]=(T[k]||0)+t; } } }
  const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,45).map(([k,v])=>[Math.round(v/1000),k]);
  const rep={totalMs:Math.round(dt.reduce((a,x)=>a+x,0)/1000),self:top(S),total:top(T)}; fs.writeFileSync(path.join(OUT,'cpu.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep.self.slice(0,20))); })();
