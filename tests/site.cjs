// THE SITE CHECK (18 Oct 2026, after the white screen: the copy on the website had an unclosed <!-- and showed nothing). Runs the
// website's own worker (worker/door.js, wrangler dev) on dist/ and checks it as a visitor would: / without a login is the door (the
// invite code box), / with a login (the dev: pass, only on this machine) is THE MARKET and it starts, and the files aren't handed out
// by themselves. The deploy (.github/workflows/site.yml) runs only if this passes. Exits 1 if anything fails.
const {chromium}=require('playwright'), {spawn}=require('child_process');
const PORT=8799, BASE='http://127.0.0.1:'+PORT;
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
(async()=>{
  const w=spawn('npx',['wrangler','dev','--port',String(PORT),'--ip','127.0.0.1','--var','DEV_AUTH:1','--show-interactive-dev-session=false','--persist-to',require('fs').mkdtempSync(require('path').join(require('os').tmpdir(),'site-'))],{stdio:['ignore','pipe','pipe'],detached:true,env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
  const stop=()=>{ try{ process.kill(-w.pid,'SIGKILL'); }catch(e){ try{ w.kill('SIGKILL'); }catch(_){} } };   // the worker's whole group: wrangler leaves workerd on the port otherwise, and the next test on it talks to this one
  let log=''; w.stdout.on('data',d=>log+=d); w.stderr.on('data',d=>log+=d);
  let up=false; for(let i=0;i<120&&!up;i++){ await new Promise(r=>setTimeout(r,1000)); up=await fetch(BASE+'/').then(r=>r.ok).catch(()=>false); }
  if(!up){ console.log('FAIL: the worker never started\n'+log); stop(); process.exit(1); }
  const fs=require('fs'), gf=fs.readdirSync('dist/g').filter(f=>f!=='market.html');
  for(const p of ['/market.html','/market','/door.html','/avatar.html','/g/market.html','/g/market','/g/'+gf[0]])ok((await fetch(BASE+p)).status===404,p+' is not handed out by itself');
  ok((await fetch(BASE+'/g/'+gf[0],{headers:{cookie:'tsfm-pass=dev:site-check'}})).status===200,'/g/'+gf[0]+' with a login');
  { const m=await fetch(BASE+'/app.webmanifest'), j=m.ok?await m.json().catch(()=>null):null, ic=j&&j.icons?await Promise.all(j.icons.map(i=>fetch(BASE+i.src).then(r=>r.ok&&/image\/png/.test(r.headers.get('content-type')||'')))):[];
    ok(!!j&&/manifest\+json/.test(m.headers.get('content-type')||'')&&j.start_url==='/'&&ic.length>=2&&ic.every(Boolean),'the installable app: its manifest and icons are handed to anyone'); }
  { const home=body=>fetch(BASE+'/home',{method:'POST',headers:{cookie:'tsfm-pass=dev:site-check',origin:BASE,'content-type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json()).catch(e=>({why:String(e)}));
    ok((await fetch(BASE+'/home',{method:'POST',headers:{origin:BASE},body:'{}'})).status===401,'/home without a login is refused');
    const put=await home({put:{v:1,wall:'brick',things:{}}}), got=await home({});
    ok(put.ok===true&&got.home&&got.home.wall==='brick','/home keeps your decorated room ('+JSON.stringify(got).slice(0,80)+')');
    const seen=await fetch(BASE+'/home',{method:'POST',headers:{cookie:'tsfm-pass=dev:a-visitor',origin:BASE,'content-type':'application/json'},body:JSON.stringify({who:'dev-site-check'})}).then(r=>r.json()).catch(e=>({why:String(e)}));
    ok(seen.home&&seen.home.wall==='brick','another player can look at your room when they visit ('+JSON.stringify(seen).slice(0,60)+')'); }
  { const own=body=>fetch(BASE+'/owned',{method:'POST',headers:{cookie:'tsfm-pass=dev:own-check',origin:BASE,'content-type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json()).catch(e=>({why:String(e)}));
    ok((await fetch(BASE+'/owned',{method:'POST',headers:{origin:BASE},body:'{}'})).status===401,'/owned without a login is refused');
    const p1=await own({put:{inv:'{"v":1}',birds:'x'}}), p2=await own({put:{birds:null}}), got=await own({}), bad=await own({put:{'no way':'x'}});
    ok(p1.ok===true&&p2.ok===true&&got.owned&&got.owned.inv==='{"v":1}'&&!('birds' in got.owned)&&!bad.ok,'/owned keeps what you own, key by key ('+JSON.stringify(got).slice(0,80)+')'); }
  { const orch=(who,body)=>fetch(BASE+'/orchard',{method:'POST',headers:{cookie:'tsfm-pass=dev:'+who,origin:BASE,'content-type':'application/json'},body:JSON.stringify({sec:'A',...body})}).then(r=>r.json()).catch(e=>({why:String(e)}));
    const c1=await orch('orch-a',{claim:2}), c2=await orch('orch-b',{claim:2}), p1=await orch('orch-a',{put:{v:1,trees:[{id:'x',k:'apple'},null,null,null]}}), p3=await orch('orch-c',{put:{v:1,trees:[]}}), L=await orch('orch-b',{}), a=L.plots&&L.plots.find(p=>p.plot===c1.plot);
    ok(c1.plot===2&&c2.plot!=null&&c2.plot!==2&&p1.ok===true&&p3.ok===false&&a&&a.d&&a.d.trees[0].k==='apple','/orchard: one plot a player, only its keeper writes it, everyone reads them ('+JSON.stringify(L).slice(0,90)+')'); }
  { const me=who=>fetch(BASE+'/owned',{method:'POST',headers:{cookie:'tsfm-pass='+who,origin:BASE,'content-type':'application/json'},body:'{}'}).then(r=>r.json()).then(j=>j.me&&j.me.no).catch(()=>null);
    const a1=await me('dev:pass-a'), a2=await me('dev:pass-a'), b1=await me('dev:pass-b');
    ok(Number.isInteger(a1)&&a1>=1000&&a1===a2&&Number.isInteger(b1)&&b1!==a1,'/owned issues each player one passport number, in order, and keeps it ('+a1+', '+b1+')'); }
  { const nm=(who,claim)=>fetch(BASE+'/name',{method:'POST',headers:{cookie:'tsfm-pass='+who,origin:BASE,'content-type':'application/json'},body:JSON.stringify({claim})}).then(async r=>({s:r.status,...(await r.json().catch(()=>({})))})).catch(e=>({why:String(e)}));
    const N='CHECK '+String(Date.now()%1e6), a=await nm('dev:name-a',N.toLowerCase()), b=await nm('dev:name-b',N), c=await nm('dev:name-a','x'), me=await fetch(BASE+'/owned',{method:'POST',headers:{cookie:'tsfm-pass=dev:name-a',origin:BASE,'content-type':'application/json'},body:'{}'}).then(r=>r.json()).then(j=>j.me&&j.me.name).catch(()=>null);
    ok(a.ok&&a.name===N&&b.s===409&&b.taken&&c.s===400&&me===N,'/name gives each player a name no one else has, in capitals, and the login says it ('+JSON.stringify([a,b.s,c.s,me])+')'); }
  { const sh=(who,init)=>fetch(BASE+'/shared/world-edits.json',{...init,headers:{cookie:'tsfm-pass='+who,origin:BASE,'content-type':'application/json',...(init&&init.headers||{})}});
    ok((await fetch(BASE+'/shared/world-edits.json')).status===401,'/shared/world-edits.json without a login is refused');
    ok((await sh('dev:site-check',{method:'POST',body:'{"x":1}'})).status===403,'a player cannot write the shared world edits');
    const put=await (await sh('dev:owner-check',{method:'POST',body:JSON.stringify({'park|rock|1,2,3':{t:[0,1,0],del:false}})})).json(), got=await (await sh('dev:site-check')).json().catch(()=>null);
    ok(put.ok===true&&got&&got['park|rock|1,2,3']&&got['park|rock|1,2,3'].t[1]===1,'the owner\'s world edits are kept and every player reads them ('+JSON.stringify(got).slice(0,80)+')'); }
  { const g=(p,who)=>fetch(BASE+p,who?{headers:{cookie:'tsfm-pass='+who}}:{}), mp=(who,body)=>fetch(BASE+'/shared/map-a.json',{method:'POST',headers:{cookie:'tsfm-pass='+who,origin:BASE,'content-type':'application/json'},body});
    ok((await g('/editor')).status===404&&(await g('/editor','dev:site-check')).status===404&&(await g('/edmap/t0_0.jpg','dev:site-check')).status===404,'the map editor and its picture are not there for a player or anyone without a login');
    ok((await g('/editor','dev:owner-ed')).status===404,'the map editor is archived: not there for the owner either (owner, 5 Nov 2026: "remove all editors for now")');
    ok((await mp('dev:owner-ed','{"x":1}')).status===400&&(await mp('dev:site-check','{"v":1,"set":{}}')).status===403,'/shared/map-a.json takes only a map editor file, only from the owner');
    ok((await (await mp('dev:owner-ed','{"v":1,"set":{}}')).json()).ok===true,'the owner publishes a map'); }
  { const CAB='CHECK '+String(Date.now()%1e6), sc=(body,who='dev:score-check')=>fetch(BASE+'/scores',{method:'POST',headers:{cookie:'tsfm-pass='+who,origin:BASE,'content-type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json()).catch(e=>({why:String(e)}));
    ok((await fetch(BASE+'/scores',{method:'POST',headers:{origin:BASE},body:'{"cab":"MAZE"}'})).status===401,'/scores without a login is refused');
    const p1=await sc({cab:CAB,put:{ini:'ABC',score:5000,sub:'ROUND 4'}}), p2=await sc({cab:CAB,put:{ini:'XYZ',score:9000,sub:'ROUND 7'}},'dev:score-two'), bad=await sc({cab:CAB,put:{ini:'a!',score:10}}), got=await sc({cab:CAB}), all=await sc({cab:'*'});
    ok(p1.ok===true&&p1.rank===1&&p2.ok===true&&p2.rank===1&&!bad.ok&&got.top&&got.top[0].ini==='XYZ'&&got.top[1].ini==='ABC'&&got.top[1].sub==='ROUND 4'&&all.top&&all.top[CAB]&&all.top[CAB].length===2,'/scores keeps the arcade\'s top ten a cabinet, shared ('+JSON.stringify(got).slice(0,90)+')'); }
  { const T=(body,ck)=>fetch(BASE+'/admin',{method:'POST',headers:{cookie:'tsfm-pass='+ck,origin:BASE,'content-type':'application/json'},body:JSON.stringify(body)});
    ok((await T({do:'text',key:'check.x',text:'HELLO'},'dev:site-check')).status===403,'/admin text: not for a player who is not the owner');
    const put=await (await T({do:'text',key:'check.x',text:'HELLO'},'dev:owner-check')).json(), got=await (await fetch(BASE+'/texts',{headers:{cookie:'tsfm-pass=dev:site-check'}})).json(); await T({do:'text',key:'check.x',text:''},'dev:owner-check');
    ok(put.ok===true&&got['check.x']==='HELLO'&&(await fetch(BASE+'/texts')).status===401,'/texts carries the owner\'s words to every player, and only to players ('+JSON.stringify(got).slice(0,80)+')'); }
  { const K='a'+Date.now().toString(36)+'chk', art=(body,ck)=>fetch(BASE+'/art',{method:'POST',headers:{cookie:'tsfm-pass='+ck,origin:BASE,'content-type':'application/json'},body:JSON.stringify(body)});
    const A=(body,ck='dev:owner-art')=>fetch(BASE+'/admin',{method:'POST',headers:{cookie:'tsfm-pass='+ck,origin:BASE,'content-type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json()).catch(e=>({why:String(e)}));
    const put=await (await art({put:{id:K,d:'data:image/webp;base64,AAAA',fin:1}},'dev:art-painter')).json(), seen=(await art({get:K},'dev:art-visitor')).status, list=await A({do:'art'}), pic=await A({do:'artget',art:K});
    const notP=await A({do:'artoff',art:K},'dev:art-visitor'), off=await A({do:'artoff',art:K}), have=(await art({have:K},'dev:art-visitor')).status, after=(await art({get:K},'dev:art-visitor')).status;
    const again=(await art({put:{id:K,d:'data:image/webp;base64,BBBB',fin:1}},'dev:art-painter')).status, list2=await A({do:'art'});
    ok(put.ok&&seen===200&&list.art&&list.art.some(a=>a.id===K&&a.who==='dev-art-painter')&&pic.d==='data:image/webp;base64,AAAA'&&notP.why&&off.ok&&have===410&&after===404&&again===409&&!list2.art.some(a=>a.id===K),
      'the owner sees a finished painting, takes it down, and it is gone for everyone and cannot be put back ('+JSON.stringify([put,seen,list.why||(list.art||[]).length,pic.why,off,have,after,again])+')'); }
  { const A=(body,ck='dev:owner-bots')=>fetch(BASE+'/admin',{method:'POST',headers:{cookie:'tsfm-pass='+ck,origin:BASE,'content-type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json()).catch(e=>({why:String(e)}));
    const run=await fetch(BASE+'/bots/run',{method:'POST',headers:{'content-type':'application/json'},body:'{}'}), L=await A({do:'bots'}), T=await fetch(BASE+'/twin',{method:'POST',headers:{cookie:'tsfm-pass=dev:owner-bots',origin:BASE,'content-type':'application/json'},body:'{}'});
    const rt=await run.text(), tt=await T.text(); ok(!/"bots"/.test(rt)&&!L.ok&&!L.bots&&!/"(say|calls|why)"/.test(tt),'the bots are gone: no runner, no BOTS for the owner, no AI double ('+[run.status,JSON.stringify(L).slice(0,80),T.status]+')'); }
  { const WS=require('ws'); const dish=who=>new Promise((res,rej)=>{ const w=new WS(BASE.replace(/^http/,'ws')+'/parties/dish/petri',{headers:{cookie:'tsfm-pass='+who,origin:BASE}}); const got=[]; w.on('message',d=>{ try{ got.push(JSON.parse(d)); }catch(e){} }); w.on('open',()=>res({w,got})); w.on('error',rej); setTimeout(()=>rej(new Error('no dish')),20000); });
    const wait=(c,f,ms=8000)=>new Promise(r=>{ const t0=Date.now(); const k=setInterval(()=>{ if(f(c.got)||Date.now()-t0>ms){ clearInterval(k); r(f(c.got)); } },100); });
    ok(await new Promise(r=>{ const w=new WS(BASE.replace(/^http/,'ws')+'/parties/dish/petri',{headers:{origin:BASE}}); w.on('unexpected-response',(q,res)=>r(res.statusCode===401||res.statusCode===404)); w.on('open',()=>r(false)); w.on('error',()=>r(true)); }),'the dish without a login is refused');
    let a=null, bb=null; try{ a=await dish('dev:dish-a'); bb=await dish('dev:dish-b'); }catch(e){ ok(false,'two players reach the dish ('+e.message+')'); }
    if(a&&bb){ const hiA=await wait(a,g=>g.find(m=>m.t==='hi')), hiB=await wait(bb,g=>g.find(m=>m.t==='hi'));
      const A=hiA&&hiA.you; ok(hiA&&hiB&&A&&A!==hiB.you&&hiB.S.players.some(p=>p[0]===A)&&hiB.S.players.length===2&&hiA.S.pellets.length===1000,'two players reach the dish and see each other, no bots ('+(hiB&&hiB.S.players.length)+' in it, you '+A+')');
      a.w.send(JSON.stringify({t:'in',dx:1,dy:0})); const tk=await wait(a,g=>g.filter(m=>m.t==='tk').length>=5&&g.filter(m=>m.t==='tk').slice(-1)[0]); const mv=tk&&tk.cells.find(c=>c[1]===A), first=hiA&&hiA.S.cells.find(c=>c[1]===A);
      ok(mv&&first&&mv[2]>first[2]+5&&tk.who.length===2&&tk.board.length>0,'the dish ticks ten times a second and steering moves your cell ('+(first&&first[2])+' → '+(mv&&mv[2])+')');
      a.w.close(); bb.w.close(); }
    // the section's room (the Block): a login reaches it, the second player hears the first is there, a move and a name go across
    const blk=who=>new Promise((res,rej)=>{ const w=new WS(BASE.replace(/^http/,'ws')+'/parties/block/s-a',{headers:{cookie:'tsfm-pass='+who,origin:BASE}}); const got=[]; w.on('message',d=>{ try{ got.push(JSON.parse(d)); }catch(e){} }); w.on('open',()=>res({w,got})); w.on('error',rej); setTimeout(()=>rej(new Error('no block')),20000); });
    ok(await new Promise(r=>{ const w=new WS(BASE.replace(/^http/,'ws')+'/parties/block/s-a',{headers:{origin:BASE}}); w.on('unexpected-response',(q,res)=>r(res.statusCode===401||res.statusCode===404)); w.on('open',()=>r(false)); w.on('error',()=>r(true)); }),'the block without a login is refused');
    let p=null, q=null; try{ p=await blk('dev:blk-a'); q=await blk('dev:blk-b'); }catch(e){ ok(false,'two players reach the block ('+e.message+')'); }
    if(p&&q){ const hiP=await wait(p,g=>g.find(m=>m.t==='hi')), hiQ=await wait(q,g=>g.find(m=>m.t==='hi'));
      ok(hiP&&hiQ&&hiP.you==='dev-blk-a'&&hiQ.you==='dev-blk-b'&&hiQ.all.some(o=>o.id==='dev-blk-a')&&hiP.world&&typeof hiP.world==='object','two players reach the block and the second is told the first is there');
      p.w.send(JSON.stringify({t:'mv',at:[12.5,-3,0,1.2,'up','']})); const mv=await wait(q,g=>g.find(m=>m.t==='mv'&&m.id==='dev-blk-a'));
      ok(mv&&mv.at[0]===12.5&&mv.at[1]===-3&&mv.at[4]==='up','a move goes across to the other player ('+JSON.stringify(mv&&mv.at)+')');
      p.w.send(JSON.stringify({t:'folk',set:[['tomato',{x:1,z:2,v:.4,R:.3,auto:1,mode:{roam:1}}]]})); const fk=await wait(q,g=>g.find(m=>m.t==='folk'&&Array.isArray(m.n)&&m.n.some(a=>a[0]==='tomato')),12000);
      ok(!!fk&&hiP.folk&&Array.isArray(hiP.folk.n)&&'fv' in hiP,'the folk\'s walks: the block runs them and tells both players where the tomato is ('+JSON.stringify(fk&&fk.n.find(a=>a[0]==='tomato'))+')');
      p.w.send(JSON.stringify({t:'me',name:'ADA',look:'w00',hp:1,x:{}})); const inn=await wait(q,g=>g.find(m=>m.t==='in'&&m.p&&m.p.id==='dev-blk-a'));
      ok(inn&&inn.p.name==='ADA','a player\'s name and look reach the others');
      { const k='drop:t'+Date.now().toString(36); p.w.send(JSON.stringify({t:'world',k,v:'{"id":"fr_apple","n":1}'})); const wd=await wait(q,g=>g.find(m=>m.t==='world'&&m.k===k&&m.v));
        q.w.send(JSON.stringify({t:'take',k})); const tk=await wait(q,g=>g.find(m=>m.t==='took'&&m.k===k)), gone=await wait(p,g=>g.find(m=>m.t==='world'&&m.k===k&&m.v===''));
        p.w.send(JSON.stringify({t:'take',k})); const tk2=await wait(p,g=>g.find(m=>m.t==='took'&&m.k===k));
        ok(!!wd&&tk&&typeof tk.v==='string'&&tk.v.includes('fr_apple')&&!!gone&&tk2&&tk2.v==='','a thing one player drops reaches the other; the first to take it gets it and the rest see it go; a second take gets nothing'); }
      const t0=Date.now(); p.w.send(JSON.stringify({t:'bye'})); const out=await wait(q,g=>g.find(m=>m.t==='out'&&m.id==='dev-blk-a'));
      ok(!!out,'a player who logs out (bye) is gone for the others at once ('+(Date.now()-t0)+' ms)');
      p.w.close(); q.w.close(); }
  }
  { const WS=require('ws'), U=BASE.replace(/^http/,'ws')+'/parties/block/s-sumcheck';
    const join=who=>new Promise((res,rej)=>{ const w=new WS(U,{headers:{cookie:'tsfm-pass='+who,origin:BASE}}); const got=[]; w.on('message',d=>{ try{ got.push(JSON.parse(d)); }catch(e){} }); w.on('open',()=>res({w,got})); w.on('error',rej); setTimeout(()=>rej(new Error('timeout')),15000); });
    const wait=(c,f,ms=6000)=>new Promise(r=>{ const t0=Date.now(); const k=setInterval(()=>{ const v=f(c.got); if(v||Date.now()-t0>ms){ clearInterval(k); r(v); } },100); });
    let P=null, O=null, V=null; try{ P=await join('dev:sum-player'); O=await join('dev:owner-sum'); await wait(P,g=>g.find(m=>m.t==='hi')); await wait(O,g=>g.find(m=>m.t==='hi'));
      P.w.send(JSON.stringify({t:'world',k:'sum:dragon#2',v:'1,2,0,0,street'})); const sneak=await wait(O,g=>g.find(m=>m.t==='world'&&m.k==='sum:dragon#2'),2500);
      O.w.send(JSON.stringify({t:'world',k:'sum:dragon#3',v:'5,6,0,1.5,street'})); const seen=await wait(P,g=>g.find(m=>m.t==='world'&&m.k==='sum:dragon#3'));
      V=await join('dev:sum-late'); const hi=await wait(V,g=>g.find(m=>m.t==='hi')); V.w.close();
      ok(!sneak&&seen&&seen.v==='5,6,0,1.5,street'&&hi&&hi.world['sum:dragon#3']==='5,6,0,1.5,street'&&!('sum:dragon#2' in hi.world),'SUMMON: a player cannot summon; the owner\'s summon reaches everyone in the section and is kept for whoever comes later');
      await new Promise(r=>setTimeout(r,200)); O.w.send(JSON.stringify({t:'world',k:'sum:dragon#3',v:''})); const back=await wait(P,g=>g.find(m=>m.t==='world'&&m.k==='sum:dragon#3'&&m.v===''));
      V=await join('dev:sum-late2'); const hi2=await wait(V,g=>g.find(m=>m.t==='hi')); V.w.close();
      ok(back&&hi2&&!('sum:dragon#3' in hi2.world),'SUMMON: SEND BACK reaches everyone and is forgotten'); }
    catch(e){ ok(false,'SUMMON: two players reach the block ('+e.message+')'); }
    finally{ if(P)P.w.close(); if(O)O.w.close(); } }
  const b=await chromium.launch({...(process.env.PWCHROME?{executablePath:process.env.PWCHROME}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const door=await b.newPage(), derr=[]; door.on('pageerror',e=>derr.push(e.message));
  await door.goto(BASE+'/',{waitUntil:'load'}); await door.waitForTimeout(1500);
  ok(await door.locator('#dcode').isVisible().catch(()=>false),'/ without a login: the door, with its invite code box');
  ok(!derr.length,'the door: no page errors '+derr.join(' | '));
  await door.click('[data-a="ask"]'); await door.fill('#dmail','asker@example.com'); await door.click('[data-a="doask"]'); await door.waitForTimeout(1000);
  ok(/asker@example\.com/.test(await door.locator('#door').innerText()),'the door: asking for an invite takes an email');
  { const pc=await b.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true}), ph=await pc.newPage(); await ph.goto(BASE+'/',{waitUntil:'load'}); await ph.waitForTimeout(1500);
    ok(await ph.locator('#dcode').isVisible().catch(()=>false),'the door on a phone: the invite code box, not turned away'); await pc.close(); }
  const ctx=await b.newContext(); await ctx.addCookies([{name:'tsfm-pass',value:'dev:site-check',url:BASE}]);
  const g=await ctx.newPage(), gerr=[]; g.on('pageerror',e=>gerr.push(e.message));
  await g.goto(BASE+'/',{waitUntil:'commit',timeout:180000});
  let started=false; for(let i=0;i<300&&!(started=await g.evaluate(()=>!!window.__started).catch(()=>false));i++)await g.waitForTimeout(1000);
  ok(await g.evaluate(()=>!!document.querySelector('meta[name=market-build]')).catch(()=>false),'/ with a login: THE MARKET');
  ok(started,'THE MARKET starts');
  ok(started&&await g.evaluate(()=>!!document.querySelector('#stage canvas')).catch(()=>false),'THE MARKET draws (its canvas is on the page)');
  if(started){ let keys=[]; for(let i=0;i<20&&!keys.includes('forage');i++){ await g.waitForTimeout(1500); keys=await g.evaluate(()=>fetch('/owned',{method:'POST',headers:{'content-type':'application/json'},body:'{}'}).then(r=>r.json()).then(j=>Object.keys(j.owned||{}))).catch(()=>[]); }
    ok(keys.includes('forage')&&keys.includes('inv'),'what you own in THE MARKET is kept on the server ('+keys.slice(0,8).join(' ')+')'); }
  if(started){ let st=null; for(let i=0;i<10&&!(st&&st['park|rock|1,2,3']);i++){ await g.waitForTimeout(1000); st=await g.evaluate(()=>window.WE&&WE.getState&&WE.getState()).catch(()=>null); }
    ok(st&&st['park|rock|1,2,3']&&st['park|rock|1,2,3'].t[1]===1,'the owner\'s world edits reach a player\'s page at start ('+Object.keys(st||{}).join(' ').slice(0,60)+')'); }
  ok((await fetch(BASE+'/sw.js')).status===404,'/sw.js without a login is not handed out');
  if(started){ const sw=await g.evaluate(async f=>{ if(!navigator.serviceWorker)return {no:1}; for(let i=0;i<60&&!navigator.serviceWorker.controller;i++)await new Promise(r=>setTimeout(r,500)); if(!navigator.serviceWorker.controller)return {ctl:false};
        const r=await fetch('/g/'+f), n=(await r.arrayBuffer()).byteLength; await new Promise(r=>setTimeout(r,800)); const c=await caches.open('g'), hit=await c.match('/g/'+f), m=hit?(await hit.arrayBuffer()).byteLength:-1, r2=await fetch('/g/'+f), n2=(await r2.arrayBuffer()).byteLength;
        return {ctl:true,ok:r.ok,n,m,n2,page:!!(await c.match('/'))}; },gf.find(f=>/^m\.[0-9a-f]+\.js$/.test(f))||gf[0]).catch(e=>({err:String(e)}));
    ok(sw.ctl&&sw.ok&&sw.n>0&&sw.m===sw.n&&sw.n2===sw.n&&!sw.page,'the service worker keeps the game\'s files on the device, and never the page: '+JSON.stringify(sw)); }
  ok(!gerr.length,'THE MARKET: no page errors '+[...new Set(gerr)].join(' | '));
  await b.close(); stop();
  console.log(bad?bad+' FAILED':'all good'); process.exit(bad?1:0);
})();
