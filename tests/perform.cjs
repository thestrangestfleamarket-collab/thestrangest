// DANCE AND JUGGLING (src/146zq-dance.js, 146zr-juggle.js, the books' rule 146znz-songbook.js): node tests/perform.cjs [dist/market.html] [out folder].
// Both skills under PERFORMANCE, starting at 0; each book fifty pieces, five open at 0-10; a try passes or fails by its chance; a forced fail breaks the dance off into a wobble
// and drops the juggled balls to the ground; three clean plays learn a piece; the dance plays on the body, the balls go round the hands; another player's dance and juggling show on them.
const {chromium}=require('playwright'), path=require('path'), fs=require('fs'), http=require('http');
const PAGE=path.resolve(process.argv[2]||'dist/market.html'), OUT=process.argv[3];
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  { const DIR=path.join(process.cwd(),'node_modules/@dimforge/rapier3d-compat');
    await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/,r=>{ const f=path.join(DIR,new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1]||''); if(!fs.existsSync(f))return r.continue(); r.fulfill({path:f,contentType:/\.wasm$/.test(f)?'application/wasm':'text/javascript'}); }); }
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const ROOT=path.resolve(path.dirname(PAGE),'..'), TYPES={'.html':'text/html','.js':'text/javascript','.json':'application/json','.wasm':'application/wasm'};
  const srv=http.createServer((q,r)=>{ const f=path.join(ROOT,decodeURIComponent(new URL(q.url,'http://x').pathname)); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){ r.writeHead(404); return r.end(); } r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
  await new Promise(r=>srv.listen(0,'127.0.0.1',r)); const URL0='http://127.0.0.1:'+srv.address().port+'/'+path.relative(ROOT,PAGE);
  await pg.goto(URL0+'?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.waitForFunction(()=>window.AVATAR&&AVATAR.ready(),null,{timeout:120000}); await wait(1200);
  // the skills
  const sk=await pg.evaluate(async()=>{ __dbg.UI.menuTab('pack','skills'); await new Promise(r=>setTimeout(r,500)); const t=(document.getElementById('packp')||{}).innerText||''; __dbg.UI.toggleMenu&&__dbg.UI.toggleMenu();
    const i=k=>t.indexOf(k); return {perf:i('PERFORMANCE'),music:i('MUSIC'),wild:i('THE WILD'),dance:i('DANCE'),juggle:i('JUGGLING'),sk:[FORAGE.sk('dance'),FORAGE.sk('juggle')],btn:[...document.querySelectorAll('#emotes button')].some(b=>b.textContent==='DANCE BOOK')}; });
  rec('DANCE and JUGGLING are skills under PERFORMANCE (after MUSIC), each starting at 0; the emotes window has a DANCE BOOK button',sk.perf>sk.music&&sk.perf<sk.wild&&sk.dance>sk.perf&&sk.juggle>sk.perf&&sk.sk.every(v=>v===0)&&sk.btn,JSON.stringify(sk));
  // the books: fifty each, five open at 0-10, ten by 20-30; the chance of a pass
  const bk=await pg.evaluate(async()=>{ await DANCE.load(); const S=FORAGE.S, r={}, cnt=(k,B)=>{ const o={}; for(const v of SONGBK.state(k,B).values())o[v]=(o[v]||0)+1; return o; }; S.songs={};
    for(const [k,B] of [['dance',DANCE.BOOK],['juggle',JUGGLE.BOOK]]){ S.sk[k]=0; const a=cnt(k,B); S.sk[k]=250; const c=cnt(k,B); S.sk[k]=0; const T=B[0], ch=[SONGBK.chance(k,T)]; S.sk[k]=1000; ch.push(SONGBK.chance(k,T)); S.sk[k]=0;
      let pass=0; for(let i=0;i<400;i++)if(SONGBK.start(k,T).ok)pass++; r[k]={n:B.length,at0:a,at25:c,ch,pass:pass/400,max:B[B.length-1].by||B[B.length-1].name}; }
    r.cmu=DANCE.BOOK.filter(T=>/^dn_/.test(T.m)).length; r.credit=DANCE.credit; return r; });
  rec('each book has fifty pieces: five open at skill 0-10, fifteen by 20-30 (the dances: the emotes\' 11 and 39 CMU recordings, credited; juggling up to 7 balls)',['dance','juggle'].every(k=>bk[k].n===50&&bk[k].at0.open===5&&bk[k].at25.open===15)&&bk.cmu===39&&/CMU/.test(bk.credit)&&bk.juggle.max==='7 BALLS',JSON.stringify(bk));
  rec('a try passes or fails by its chance (about 60% for the first piece at 0, sure at 100)',['dance','juggle'].every(k=>bk[k].ch[0]>.4&&bk[k].ch[0]<.8&&bk[k].ch[1]===1&&bk[k].pass>.4&&bk[k].pass<.8),JSON.stringify({d:bk.dance.ch,dp:bk.dance.pass,j:bk.juggle.ch,jp:bk.juggle.pass}));
  // a dance: on the body; a forced fail breaks off into the wobble; three clean plays learn it; a real clean play counts
  await pg.evaluate(()=>{ __dbg.UI.setView('third'); });
  const dn=await pg.evaluate(async()=>{ const S=FORAGE.S, B=DANCE.BOOK, i=B.findIndex(T=>T.m.startsWith('dn_')), T=B[i], r={name:T.name,m:T.m}; S.sk.dance=1000; T.secs=8;
    const st=__dbg.ST, nm=()=>st.move&&st.move.name, P=()=>{ const me=W3.group.children.find(m=>m.userData&&m.userData.PM); return me?me.userData.PM.value.map(m=>m.elements.slice(12,15).map(x=>+x.toFixed(2)).join()).join('|'):''; };
    const until=async(f,ms)=>{ const e=performance.now()+ms; while(performance.now()<e){ if(f())return true; await new Promise(r=>setTimeout(r,50)); } return false; };
    // (frames are slow in software: the checks wait on what happens, not on a clock)
    await DANCE.go(i,{ok:false,at:.5}); await until(()=>nm()==='mc_'+T.m,3000); r.on=nm(); const poses=new Set(); for(let k=0;k<6&&nm()==='mc_'+T.m;k++){ poses.add(P()); await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); } r.poses=poses.size;
    let dz=null; await until(()=>{ if(MOTION.cur==='dizzy')dz='dizzy'; return nm()==='mc_dizzy'; },12000); r.wobble=nm(); r.cur=MOTION.cur||dz;   // (the wobble is short: on a slow machine it may be over by the time its clip shows) r.learntAfterFail=SONGBK.learnt('dance',T);
    await until(()=>!MOTION.cur,8000); T.secs=3; const was=(S.songs.dance||{})[T.name]||0; await DANCE.go(i,{ok:true,at:1}); await until(()=>!DANCE.cur(),15000); r.clean=((S.songs.dance||{})[T.name]||0)-was;
    for(let n=0;n<3;n++)SONGBK.done('dance',T,true); r.learnt=SONGBK.learnt('dance',T); r.sure=SONGBK.chance('dance',T); S.sk.dance=0; r.tip=typeof SONGBK.busk('dance',T)==='number'; T.secs=12; return r; });
  rec('a CMU dance plays on the body (its move on the rig, the pose changing)',dn.on==='mc_'+dn.m&&dn.poses>=2,JSON.stringify({on:dn.on,poses:dn.poses}));
  rec('a forced fail breaks the dance off into a wobble (and it is not learnt)',dn.wobble==='mc_dizzy'&&dn.cur==='dizzy'&&!dn.learntAfterFail,JSON.stringify({wobble:dn.wobble,cur:dn.cur}));
  rec('a clean dance danced through counts one of three; three clean plays learn it, then it always passes; busking answers',dn.clean===1&&dn.learnt&&dn.sure===1&&dn.tip,JSON.stringify({clean:dn.clean,learnt:dn.learnt,sure:dn.sure,tip:dn.tip}));
  if(OUT){ await pg.evaluate(async()=>{ const B=DANCE.BOOK; FORAGE.S.sk.dance=1000; await DANCE.go(B.length-1,{ok:true}); }); await wait(1500); await pg.screenshot({path:OUT+'/dance.png'}); await pg.evaluate(()=>{ DANCE.stop(); FORAGE.S.sk.dance=0; }); await wait(600); }
  // juggling: the balls go round the hands as the siteswap says; a forced fail drops them to the ground
  const jg=await pg.evaluate(async()=>{ const S=FORAGE.S, B=JUGGLE.BOOK, i=B.findIndex(T=>T.ss==='3'), T=B[i], r={}; S.sk.juggle=1000; delete INV.items.jugball; delete INV.items.jugclub;
    r.refused=!JUGGLE.go(i,{ok:true}); FORAGE.give('jugball',3); T.secs=6; r.go=JUGGLE.go(i,{ok:false,at:.6}); await new Promise(r=>setTimeout(r,700));
    const J=JUGGLE.ME.J, H=JUGGLE.ME.H, w=[]; r.props=J?J.m.length:0; r.onBody=J?J.m.every(m=>!!m.parent):false; r.attached=!!H;
    const hw=()=>{ const me=H.me, P=H.PM.value; return [5,8].map(b=>new __dbg.THREE.Vector3().setFromMatrixPosition(P[b]).toArray().map(x=>+x.toFixed(2)).join()).join('|'); };
    const pp=()=>J.m.map(m=>new __dbg.THREE.Vector3().setFromMatrixPosition(m.matrix).toArray().map(x=>+x.toFixed(2)).join()).join('|');
    const hs=new Set(), ps=new Set(); let hi=-1e9, lo=1e9; for(let k=0;k<8;k++){ if(H){ hs.add(hw()); ps.add(pp()); for(const m of J.m){ const y=m.matrix.elements[13]; hi=Math.max(hi,y); lo=Math.min(lo,y); } } await new Promise(r=>setTimeout(r,120)); }
    r.handPoses=hs.size; r.propPoses=ps.size; r.span=+(hi-lo).toFixed(2);
    for(let k=0;k<80&&(JUGGLE.ME.J||JUGGLE.ME.free.some(f=>f.v.lengthSq()>1e-6));k++)await new Promise(r=>setTimeout(r,100)); const F=JUGGLE.ME.free; r.free=F.length; r.ended=!JUGGLE.ME.J; r.ys=F.map(f=>+((f.m.position.y-SHARED.groundY(f.m.position.x,f.m.position.z))/f.r).toFixed(2)); r.inWorld=F.every(f=>f.m.parent===W3.group);
    r.learnt=SONGBK.learnt('juggle',T); for(let n=0;n<3;n++)SONGBK.done('juggle',T,true); r.learnt3=SONGBK.learnt('juggle',T); S.sk.juggle=0; T.secs=12; return r; });
  rec('a pattern needs its balls (refused with none); with three the cascade goes: three balls on the body, the hands and balls moving as it says',jg.refused&&jg.go&&jg.props===3&&jg.onBody&&jg.attached&&jg.handPoses>=4&&jg.propPoses>=4&&jg.span>0,JSON.stringify(jg));
  rec('a forced fail drops the balls: off the body into the world, fallen to the ground (within a ball or two of it); three clean plays learn the pattern',jg.free===3&&jg.ended&&jg.inWorld&&jg.ys.every(y=>y>.9&&y<3)&&!jg.learnt&&jg.learnt3,JSON.stringify({free:jg.free,ys:jg.ys,ended:jg.ended,learnt:jg.learnt3}));
  if(OUT){ await pg.evaluate(()=>{ const B=JUGGLE.BOOK; FORAGE.give('jugball',4); FORAGE.S.sk.juggle=1000; JUGGLE.go(B.findIndex(T=>T.ss==='5'),{ok:true}); __dbg.UI.dist*=.5; __dbg.UI.orbit(260,0); }); await wait(2500); await pg.screenshot({path:OUT+'/juggle.png'}); await pg.evaluate(()=>JUGGLE.stop(true)); }
  // another player: their dance on their body; their juggling on theirs
  const o=await pg.evaluate(async()=>{ const P=__dbg.you(), at=[P.x+1.8,P.z+.4,SHARED.py,0,SHARED.LVL,''];
    ONLINE.feed({t:'hi',you:'me',all:[{id:'p1',name:'IVY',look:'b:avatar:'+AVATAR.code(),at,x:{}}]}); await new Promise(r=>setTimeout(r,1500));
    const d=DANCE.BOOK.find(T=>/^dn_/.test(T.m)); ONLINE.feed({t:'act',id:'p1',m:'mc_'+d.m,loop:1}); await new Promise(r=>setTimeout(r,1200)); const O=ONLINE.others.get('p1'), r={dance:O&&O.S.move&&O.S.move.name,want:'mc_'+d.m};
    ONLINE.feed({t:'act',id:'p1',stop:1}); const k=JUGGLE.BOOK.findIndex(T=>T.ss==='3'); ONLINE.feed({t:'jug',id:'p1',v:k+':0:b'}); await new Promise(r=>setTimeout(r,1200));
    const Q=JUGGLE.THEM().get('p1'); r.jug=!!(Q&&Q.J); r.held=!!(Q&&Q.H); r.props=Q&&Q.J?Q.J.m.filter(m=>m.parent).length:0;
    ONLINE.feed({t:'jug',id:'p1',v:''}); await new Promise(r=>setTimeout(r,300)); r.gone=!(JUGGLE.THEM().get('p1')||{}).J; ONLINE.feed({t:'out',id:'p1'}); return r; });
  rec('another player\'s dance plays on their body here, and their juggling (three balls in their hands) until they stop',o.dance===o.want&&o.jug&&o.held&&o.props===3&&o.gone,JSON.stringify(o));
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,n])=>n+'× '+k).join(' | '));
  console.log(bad?bad+' FAILED':'ALL PASS'); srv.close(); await b.close(); process.exit(bad?1:0); })();
