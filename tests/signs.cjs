// SIGN LANGUAGE (src/146zs-signs.js, the books' rule 146znz-songbook.js, the chat 111d-online.js, the shops' gate 159b-shops.js): node tests/signs.cjs [dist/market.html] [out folder].
// The skill under LANGUAGE starting at 0; its book the 26 letters in the first two bands, then the words; a practice passes or fails, three clean learn a sign; a signed chat line moves your hands;
// another player's signed line moves theirs and reads "(…)" below your skill, the words above it; a signing trader refuses below the gate and opens above it.
const {chromium}=require('playwright'), path=require('path'), fs=require('fs'), http=require('http');
const PAGE=path.resolve(process.argv[2]||'dist/market.html'), OUT=process.argv[3];
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640},deviceScaleFactor:1}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  { const DIR=path.join(process.cwd(),'node_modules/@dimforge/rapier3d-compat');
    await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/,r=>{ const f=path.join(DIR,new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1]||''); if(!fs.existsSync(f))return r.continue(); r.fulfill({path:f,contentType:/\.wasm$/.test(f)?'application/wasm':'text/javascript'}); }); }
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const ROOT=path.resolve(path.dirname(PAGE),'..'), TYPES={'.html':'text/html','.js':'text/javascript','.json':'application/json','.wasm':'application/wasm'};
  const srv=http.createServer((q,r)=>{ const f=path.join(ROOT,decodeURIComponent(new URL(q.url,'http://x').pathname)); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){ r.writeHead(404); return r.end(); } r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
  await new Promise(r=>srv.listen(0,'127.0.0.1',r)); const URL0='http://127.0.0.1:'+srv.address().port+'/'+path.relative(ROOT,PAGE);
  await pg.goto(URL0+'?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.waitForFunction(()=>window.AVATAR&&AVATAR.ready()&&W3.group.children.some(m=>m.userData&&m.userData.hands&&m.userData.PM),null,{timeout:120000}); await wait(1200);
  await pg.evaluate(()=>{ __dbg.UI.setView('third'); });
  // the skill and its book
  const sk=await pg.evaluate(async()=>{ __dbg.UI.menuTab('pack','skills'); await new Promise(r=>setTimeout(r,500)); const t=(document.getElementById('packp')||{}).innerText||''; __dbg.UI.toggleMenu&&__dbg.UI.toggleMenu();
    const S=FORAGE.S, B=ASL.BOOK, cnt=v=>{ S.sk.sign=v; const o={}; for(const x of SONGBK.state('sign',B).values())o[x]=(o[x]||0)+1; return o; }, a=cnt(0), c=cnt(250); S.sk.sign=0;
    return {lang:t.indexOf('LANGUAGE'),sign:t.indexOf('SIGN LANGUAGE'),sk:FORAGE.sk('sign'),n:B.length,letters:B.filter(T=>T.kind==='l').length,words:B.filter(T=>T.kind==='w').length,
      band0:B.filter(T=>SONGBK.band(T)===0).map(T=>T.name).join(''),band1:B.filter(T=>SONGBK.band(T)===1).map(T=>T.name).join(''),band2:B.filter(T=>SONGBK.band(T)===2).slice(0,5).map(T=>T.name),at0:a,at25:c,
      btn:[...document.querySelectorAll('#emotes button')].some(b=>b.textContent==='SIGN BOOK'),credit:/Manual Alphabet/.test(ASL.credit)}; });
  rec('SIGN LANGUAGE is a skill under LANGUAGE starting at 0; the emotes window has a SIGN BOOK button',sk.lang>=0&&sk.sign>sk.lang&&sk.sk===0&&sk.btn&&sk.credit,JSON.stringify({lang:sk.lang,sign:sk.sign,sk:sk.sk,btn:sk.btn}));
  rec('the book: the 26 letters in the first two bands (A-M, N-Z), then 200-odd words by band; five open at 0-10, fifteen by 20-30',sk.letters===26&&sk.words>=200&&sk.band0==='ABCDEFGHIJKLM'&&sk.band1==='NOPQRSTUVWXYZ'&&sk.at0.open===5&&sk.at25.open===15,JSON.stringify({n:sk.n,words:sk.words,b0:sk.band0,b1:sk.band1,b2:sk.band2,at0:sk.at0,at25:sk.at25}));
  // a practice: a pass counts one of three clean, a fail does not; three clean learn it
  const pr=await pg.evaluate(async()=>{ const S=FORAGE.S, B=ASL.BOOK, T=B[0], r={}; S.songs=S.songs||{}; S.songs.sign={}; S.sk.sign=0;
    const until=async(f,ms)=>{ const e=performance.now()+ms; while(performance.now()<e){ if(f())return true; await new Promise(r=>setTimeout(r,50)); } return false; };
    let pass=0; for(let i=0;i<400;i++)if(SONGBK.start('sign',T).ok)pass++; r.pass=pass/400;
    r.go=ASL.practice(0,{ok:false,at:.5}); await until(()=>!ASL.ME.prac,15000); r.afterFail=(S.songs.sign||{})[T.name]||0; r.gained=S.sk.sign>0;
    r.go2=ASL.practice(0,{ok:true,at:1}); await until(()=>!ASL.ME.prac,15000); r.afterPass=(S.songs.sign||{})[T.name]||0;
    r.locked=!ASL.practice(B.length-1,{ok:true}); for(let n=0;n<2;n++)SONGBK.done('sign',T,true); r.learnt=SONGBK.learnt('sign',T); r.knows=ASL.knows(T); return r; });
  rec('a practice passes or fails by its chance; a forced fail counts nothing, a clean one counts one of three; three clean learn the sign (a locked one refused)',pr.go&&pr.go2&&pr.afterFail===0&&pr.afterPass===1&&pr.learnt&&pr.knows&&pr.locked&&pr.pass>.4&&pr.pass<.8,JSON.stringify(pr));
  // a signed chat line: your hands sign it
  const ch=await pg.evaluate(async()=>{ const S=FORAGE.S, r={}; S.sk.sign=1000; ASL.toggle(true); const me=W3.group.children.find(m=>m.userData&&m.userData.hands&&m.userData.PM), PM=me.userData.PM;
    const wr=()=>{ const e=PM.value[8].elements; return [e[12],e[13],e[14]].map(x=>x.toFixed(2)).join(); }, w0=wr(); ONLINE.said('hello friend how much thank you please'); r.log=ONLINE.log[ONLINE.log.length-1];
    const fg=new Set(), wp=new Set(); let post=0; for(let i=0;i<40;i++){ await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,100))); const h=PM.hands; if(PM.post&&PM.post.signs){ post++; wp.add(wr()); } if(h&&h.fg&&h.fg.R)fg.add(h.fg.R.map(f=>f[0].toFixed(1)).join()); }
    r.shapes=fg.size; r.wrists=wp.size; r.post=post;
    for(let i=0;i<150&&PM.post&&PM.post.signs;i++)await new Promise(r=>setTimeout(r,100)); r.letGo=!PM.post&&!(PM.hands&&PM.hands.fg);
    S.sk.sign=0; r.wrong=ONLINE.signs.mine('hello friend'); ASL.toggle(false); r.plain=ONLINE.signs.mine('hello'); return r; });
  rec('a signed chat line moves your hands: the right hand through several handshapes and places, then lets go; the chat shows it signed',ch.shapes>=3&&ch.wrists>=3&&ch.post>=3&&ch.letGo&&/SIGNS/.test(ch.log[0])&&ch.log[1]==='hello friend how much thank you please',JSON.stringify(ch));
  rec('signs you do not know come out wrong (skill 0: spelled with wrong letters); the toggle off sends plain words',ch.wrong&&ch.wrong.k==='ss'&&ch.wrong.text!=='hello friend'&&ch.plain===null,JSON.stringify({wrong:ch.wrong,plain:ch.plain}));
  if(OUT){ await pg.evaluate(async()=>{ FORAGE.S.sk.sign=1000; ASL.toggle(true); __dbg.UI.dist*=.5; __dbg.UI.orbit(200,0); ONLINE.said('thank you friend'); }); await wait(1600); await pg.screenshot({path:OUT+'/signs.png'}); await pg.evaluate(()=>ASL.toggle(false)); }
  // another player's signed line: their hands sign it; you read it as far as your skill reaches
  const o=await pg.evaluate(async()=>{ const P=__dbg.you(), at=[P.x+1.8,P.z+.4,SHARED.py,0,SHARED.LVL,''], S=FORAGE.S, r={};
    ONLINE.feed({t:'hi',you:'me',all:[{id:'p1',name:'IVY',look:'b:avatar:'+AVATAR.code(),at,x:{}}]}); await new Promise(r=>setTimeout(r,1500));
    S.sk.sign=0; ONLINE.feed({t:'say',id:'p1',name:'IVY',text:'hello my name ivy',sg:'wwws'}); r.low=ONLINE.log[ONLINE.log.length-1]; await new Promise(r=>setTimeout(r,900));
    const Q=ASL.THEM().get('p1'); r.run=!!(Q&&Q.run); r.held=!!(Q&&Q.H);
    S.sk.sign=1000; ONLINE.feed({t:'say',id:'p1',name:'IVY',text:'hello my name ivy',sg:'wwws'}); r.high=ONLINE.log[ONLINE.log.length-1]; r.tag=ONLINE.others.get('p1').say;
    S.sk.sign=0; ONLINE.feed({t:'say',id:'p1',name:'IVY',text:'plain words'}); r.plain=ONLINE.log[ONLINE.log.length-1]; ONLINE.feed({t:'out',id:'p1'}); return r; });
  rec('another player\'s signed line moves their hands here; at skill 0 it reads "(…)", at 100 the words; plain chat stays plain',o.run&&o.held&&o.low[1]==='(…) (…) (…) (…)'&&o.high[1]==='hello my name ivy'&&o.tag==='hello my name ivy'&&o.plain[1]==='plain words'&&/SIGNS/.test(o.low[0]),JSON.stringify(o));
  // the townsfolk who sign: a trader refuses you below the gate, opens above it; their line reads as far as you know
  const tr=await pg.evaluate(async()=>{ const S=FORAGE.S, r={}, W={key:'diner_waitress',name:'THE DINER WAITRESS'}; r.signers=['diner_waitress','village_gardener'].map(id=>ASL.signer(id)); r.not=ASL.signer('w_badger');
    S.sk.sign=0; SHOPS.close&&SHOPS.close(); SHOPS.open(W); r.low=SHOPS.cur===W; r.lowLine=ASL.line(W,'Fresh fruit and honey'); r.quest=ASL.follows('village_gardener',true);
    S.sk.sign=1000; SHOPS.open(W); r.high=SHOPS.cur===W; r.highLine=ASL.line(W,'Fresh fruit and honey'); r.quest2=ASL.follows('village_gardener',true); SHOPS.close(); S.sk.sign=0;
    r.badger=(SHOPS.open({key:'w_badger',name:'THE BADGER'}),SHOPS.cur&&SHOPS.cur.key==='w_badger'); SHOPS.close(); return r; });
  rec('two townsfolk sign (signs: true): the waitress\'s shop refuses at skill 0 and opens at 100; the gardener\'s asks too; the badger, who speaks, opens at 0',tr.signers.every(Boolean)&&!tr.not&&!tr.low&&tr.high&&!tr.quest&&tr.quest2&&tr.badger&&/\(…\)/.test(tr.lowLine)&&tr.highLine==='(SIGNS) fresh fruit and honey',JSON.stringify(tr));
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,n])=>n+'× '+k).join(' | '));
  console.log(bad?bad+' FAILED':'ALL PASS'); srv.close(); await b.close(); process.exit(bad?1:0); })();
