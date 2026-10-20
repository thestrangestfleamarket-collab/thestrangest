// THE LATER CHUNK, MARKED FROM WHAT THE START RUNS (20 Oct 2026, the code split). Build first with the later chunk kept in the page:
//   SKIP=later MIN=0 python3 build.py && node tools/later.cjs
// Opens dist/market.html in headless Chromium (software rendering: slow, run it in CI) and records which functions run: a new player's
// start with a few seconds of play (keys, mouse, the views, the menu), a walk to Market St and 15 s there, then a returning player's start
// by the park gate; with ?steps=0, so the rooms the store builds in the background (they wait for the later chunk) count as not run.
// Every function of 300 characters or more that never ran is given '@later'; (its code then comes in x-later.<hash>.js, fetched right
// after the first frame); every other '@later'; is taken out. Functions already in a place's chunk ('@park' and the like), methods,
// generators, one-line arrows and arrows that use this/arguments are left alone. Prints how many functions and characters it marked.
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
const {parse}=require('./scope.cjs');
const PAGE='file://'+path.resolve('dist/market.html'), Y='if(performance.now()-__YT>40)await __Y();', MARK=" '@later';", MIN=300;
const coverage=async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const ctx=await b.newContext({viewport:{width:960,height:540}}), LEN={}, ran={}, t0=Date.now(), say=m=>console.log('later: '+m+' ('+Math.round((Date.now()-t0)/1000)+' s)');
  let pg, cdp, K, M, src={};
  const snap=async()=>{ const r=await cdp.send('Profiler.takePreciseCoverage'); for(const s of r.result)if(LEN[s.scriptId])for(const f of s.functions){ const g=f.ranges[0], k=LEN[s.scriptId]+':'+g.startOffset+':'+g.endOffset; ran[k]=(ran[k]||0)+g.count; } };
  const start=async q=>{ if(pg){ await snap(); await pg.close({runBeforeUnload:false}); } pg=await ctx.newPage(); pg.setDefaultTimeout(120000); K=pg.keyboard; M=pg.mouse; pg.on('dialog',d=>d.dismiss().catch(()=>{}));
    cdp=await ctx.newCDPSession(pg); await cdp.send('Debugger.enable'); cdp.on('Debugger.scriptParsed',e=>{ if(e.length>500000){ LEN[e.scriptId]=e.length; src[e.length]=[cdp,e.scriptId]; } });
    await cdp.send('Profiler.enable'); await cdp.send('Profiler.startPreciseCoverage',{callCount:true,detailed:false});
    await pg.goto(PAGE+q,{waitUntil:'commit',timeout:600000}); let s=false; for(let i=0;i<3000&&!(s=await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(200); say('started '+q+' '+s); };
  await start('?fresh=1&hour=13&wx=CLEAR&steps=0'); await snap();
  await M.move(480,270); await M.move(600,300); await M.click(500,280); await M.wheel(0,300); await M.wheel(0,-300);
  for(const k of ['w','a','s','d']){ await K.down(k); await pg.waitForTimeout(400); await K.up(k); }
  await K.down('Shift'); await K.down('w'); await pg.waitForTimeout(600); await K.press(' '); await K.up('w'); await K.up('Shift');
  for(const k of ['v','v','v','q','e','Escape','Escape']){ await K.press(k); await pg.waitForTimeout(300); }
  await M.down({button:'right'}); await M.move(520,260); await M.up({button:'right'});
  say('played'); await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD; STORE.goTo(B.XS(99),B.ZS((B.CURB+B.FAR)/2),'up'); }); await pg.waitForTimeout(15000); await snap(); say('street');
  await pg.evaluate(()=>STORE.goTo(PARK.look[0],PARK.look[1],'up')); await pg.waitForTimeout(4000); await start('?hour=13&wx=CLEAR&steps=0'); await pg.waitForTimeout(12000);
  for(const k of ['w','d']){ await K.down(k); await pg.waitForTimeout(300); await K.up(k); } await snap(); say('returned');
  const out=[];
  for(const len in src){ const [c,id]=src[len], F=[], text=await c.send('Debugger.getScriptSource',{scriptId:id}).then(r=>r.scriptSource,()=>null); if(!text)continue;
    for(const k in ran){ const [l,a,c]=k.split(':'); if(l===len)F.push({a:+a,b:+c,n:ran[k]}); }
    F.sort((x,y)=>x.a-y.a||y.b-x.b); let end=-1;
    for(const f of F){ if(f.n||f.b-f.a<MIN||f.a<end)continue; end=f.b; out.push(text.slice(f.a,f.a+200)); } }
  await b.close(); return out;
};
(async()=>{
  const heads=await coverage();
  const src=fs.readdirSync('src').filter(f=>/^\d{3}/.test(f)).sort();
  for(const f of src){ const t=fs.readFileSync('src/'+f,'utf8'), u=t.split(MARK).join(''); if(u!==t)fs.writeFileSync('src/'+f,u); }
  let page='', off=[]; for(const f of src){ off.push(page.length); page+=fs.readFileSync('src/'+f,'utf8'); }
  const I=page.indexOf('<script type="module">')+22, body=page.slice(I,page.lastIndexOf('</script>')), FN=/^(Arrow)?Function(Expression|Declaration)$/, at=new Map(), up=new Map();
  (function w(n,p){ if(!n||typeof n.type!=='string')return; up.set(n,p); if(FN.test(n.type))at.set(n.start,n); for(const k in n){ if(k==='type')continue; const c=n[k]; if(Array.isArray(c))c.forEach(x=>w(x,n)); else if(c&&typeof c.type==='string')w(c,n); } })(parse(body),null);
  const walk=(n,f)=>{ (function w(q,d){ if(!q||typeof q.type!=='string')return; f(q,d); const e=d+(q!==n&&(q.type==='FunctionExpression'||q.type==='FunctionDeclaration')?1:0); for(const k in q){ if(k==='type')continue; const c=q[k]; if(Array.isArray(c))c.forEach(x=>w(x,e)); else if(c&&typeof c.type==='string')w(c,e); } })(n,0); };
  const marked=n=>{ const d=n.body&&n.body.type==='BlockStatement'&&n.body.body[0]; return !!d&&d.type==='ExpressionStatement'&&d.expression.type==='Literal'&&/^@/.test(String(d.expression.value)); };
  const near=n=>{ for(let p=up.get(n);p;p=up.get(p))if(FN.test(p.type)&&marked(p))return true; let h=false; walk(n,q=>{ if(q!==n&&FN.test(q.type)&&marked(q))h=true; }); return h; };
  const outer=n=>{ if(n.type!=='ArrowFunctionExpression')return false; let x=false; walk(n.body,(q,d)=>{ if(!d&&(q.type==='ThisExpression'||q.type==='Super'||q.type==='MetaProperty'||q.type==='Identifier'&&q.name==='arguments'))x=true; }); return x; };
  const ins=[]; let chars=0;
  for(const h0 of heads){ const h=h0.split(Y).join('').split(MARK).join(''); let pos=-1;
    for(const k of [120,80,50,30]){ const q=h.slice(0,k), a=body.indexOf(q); if(a>=0&&body.indexOf(q,a+1)<0){ pos=a; break; } }
    const n=at.get(pos), p=n&&up.get(n); if(!n||n.body.type!=='BlockStatement'||n.generator||marked(n)||near(n)||outer(n))continue;
    if(p&&(p.type==='MethodDefinition'||p.type==='Property'&&(p.method||p.kind!=='init')))continue;
    if(/__(DATA|LAZY|B64)__/.test(body.slice(n.start,n.end))||n.type==='FunctionDeclaration'&&new RegExp('new\\s+'+n.id.name+'\\b').test(body))continue;
    ins.push(n.body.start+1); chars+=n.end-n.start; }
  ins.sort((a,b)=>a-b);
  for(let k=0;k<src.length;k++){ const a=off[k]-I, e=(k+1<src.length?off[k+1]:page.length)-I, mine=ins.filter(x=>x>=a&&x<e); if(!mine.length)continue;
    let t=fs.readFileSync('src/'+src[k],'utf8'); for(const x of mine.reverse())t=t.slice(0,x-a)+MARK+t.slice(x-a); fs.writeFileSync('src/'+src[k],t); }
  console.log('later: marked',ins.length,'functions,',chars,'characters');
})().catch(e=>{ console.error(e); process.exit(1); });
