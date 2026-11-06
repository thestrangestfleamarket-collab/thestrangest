// THE RECOVERY CHECK (tools/recover.js, the website's shell): a missing chunk reloads the page at most twice a minute, then shows RELOAD; a network failure retries once, then shows RELOAD; a good fetch passes through. node tests/recover.cjs
const fs=require('fs'), vm=require('vm'), fails=[], ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)fails.push(m); };
const SRC=fs.readFileSync(__dirname+'/../tools/recover.js','utf8');
const world=(fetchImpl)=>{ const store={}, els=[], W={reloads:0,fetches:0,now:1e12,timers:[],
    sessionStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{ store[k]=String(v); },removeItem:k=>{ delete store[k]; }},
    location:{reload(){ W.reloads++; }}, WHERE:{save(){ W.saved=(W.saved||0)+1; }},
    document:{getElementById:id=>els.find(e=>e.id===id)||null,createElement:tag=>({tag,style:{},children:[],appendChild(c){ this.children.push(c); },focus(){}}),body:{appendChild(e){ els.push(e); }}},
    fetch:(u)=>{ W.fetches++; return fetchImpl(u,W); }, setTimeout:(f,ms)=>{ W.timers.push(ms); f(); return 0; }, Date:{now:()=>W.now}, JSON, Error, Promise, els};
  W.shell=()=>els.find(e=>e.id==='recover'); vm.createContext(W); vm.runInContext(SRC+'\nthis.__cget=__cget; this.__stale=__stale;',W); return W; };
(async()=>{
  // a stale build: 404 → reload, 404 → reload, 404 → the shell
  { const W=world(()=>Promise.resolve({ok:false,status:404})); await W.__cget('park','/g/x-park.js',1).catch(()=>{}); ok(W.reloads===1&&!W.shell()&&W.saved===1,'a 404 saves where you are and reloads once');
    const W2=world(()=>Promise.resolve({ok:false,status:404})); W2.sessionStorage.setItem('market-reload',JSON.stringify([W2.now-1000,W2.now-2000])); await W2.__cget('park','/g/x-park.js',1).catch(()=>{}); ok(W2.reloads===0&&!!W2.shell()&&W2.shell().children[0].textContent.includes('park 404'),'the third 404 within a minute shows RELOAD instead of reloading again');
    const W3=world(()=>Promise.resolve({ok:false,status:404})); W3.sessionStorage.setItem('market-reload',JSON.stringify([W3.now-70000,W3.now-80000])); await W3.__cget('park','/g/x-park.js',1).catch(()=>{}); ok(W3.reloads===1,'reloads older than a minute no longer count'); }
  // a network failure: one retry after a pause, then the shell; no reload
  { let n=0; const W=world(()=>{ n++; return Promise.reject(new TypeError('Failed to fetch')); }); await W.__cget('park','/g/x-park.js',1).catch(()=>{}); ok(n===2&&W.timers[0]===1500&&W.reloads===0&&!!W.shell(),'a network failure retries once after 1.5 s, then shows RELOAD: '+n+' tries'); }
  // a 500: the shell at once
  { const W=world(()=>Promise.resolve({ok:false,status:500})); await W.__cget('park','/g/x-park.js',1).catch(()=>{}); ok(W.reloads===0&&!!W.shell(),'a 500 shows RELOAD, no reload loop'); }
  // a good fetch passes through, with a flaky first try
  { let n=0; const W=world(()=>{ n++; return n===1?Promise.reject(new TypeError('x')):Promise.resolve({ok:true,status:200,text:()=>Promise.resolve('hi')}); }); const r=await W.__cget('park','/g/x-park.js',1); ok(r.ok&&n===2&&!W.shell()&&W.reloads===0,'a fetch that fails once and then works passes through'); }
  // the RELOAD button clears the count and reloads
  { const W=world(()=>Promise.resolve({ok:false,status:500})); await W.__cget('park','/g/x-park.js',1).catch(()=>{}); const b=W.shell().children[1]; b.onclick(); ok(W.reloads===1&&W.sessionStorage.getItem('market-reload')===null,'RELOAD clears the count and reloads'); }
  if(fails.length){ console.log(fails.length+' failed'); process.exit(1); } console.log('all good'); })();
