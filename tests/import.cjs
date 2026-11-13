// IMPORT MUSIC (src/146zpe-import.js): node tests/import.cjs [dist/market.html] [out folder].
// A MIDI file, MusicXML, ABC and a text tab are each read into a piece; a piece added is under YOUR MUSIC in every book but the drums', fitted to each instrument
// (the tab's own strings and frets on the guitar), played at skill 0 with no try, kept in the save, and removed again; LOOP and NEXT; the window's button, paste and ADD work.
const {chromium}=require('playwright'), path=require('path'), fs=require('fs'), os=require('os'), es=require('esbuild');
const PAGE=path.resolve(process.argv[2]||'dist/market.html'), OUT=process.argv[3];
const XML=`<?xml version="1.0"?><score-partwise version="3.1"><work><work-title>Sheet Test</work-title></work><identification><creator type="composer">A. Player</creator></identification><part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list><part id="P1"><measure number="1"><attributes><divisions>1</divisions><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes>${['C','E','G','E','C','E','G','E'].map(s=>`<note><pitch><step>${s}</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>`).join('')}</measure></part></score-partwise>`;
const ABC='X:1\nT:Abc Test\nC:Trad\nM:4/4\nL:1/8\nQ:1/4=240\nK:C\nCDEF GABc|cBAG FEDC|C,E,G,C EGce|c8|]';
const TAB='e|-0---3---0-------|\nB|---1---1---1-----|\nG|-----0-------0---|\nD|---------2-------|\nA|-3-----------3---|\nE|-----------------|';
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); }, wait=ms=>new Promise(r=>setTimeout(r,ms));
  // the readers' packages from node_modules, bundled as the website bundles them
  const TMP=fs.mkdtempSync(path.join(os.tmpdir(),'imp-')), LIB={};
  for(const p of ['@tonejs/midi','abcjs','@coderline/alphatab']){ LIB[p]=path.join(TMP,p.replace(/\W+/g,'-')+'.js'); await es.build({bundle:true,format:'esm',target:'es2022',write:true,outfile:LIB[p],logLevel:'error',stdin:{contents:`export * from '${p}'; import * as M from '${p}'; export default (M.default ?? M);`,resolveDir:process.cwd()}}); }
  await pg.route(/cdn\.jsdelivr\.net\/npm\/(@tonejs\/midi|abcjs|@coderline\/alphatab)@/,r=>{ const p=Object.keys(LIB).find(p=>r.request().url().includes('/npm/'+p+'@')); r.fulfill({path:LIB[p],contentType:'text/javascript',headers:{'access-control-allow-origin':'*'}}); });
  { const DIR=path.join(process.cwd(),'node_modules/@dimforge/rapier3d-compat');
    await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/,r=>{ const f=path.join(DIR,new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1]||''); if(!fs.existsSync(f))return r.continue(); r.fulfill({path:f,contentType:/\.wasm$/.test(f)?'application/wasm':'text/javascript'}); }); }
  const http=require('http'), ROOT=path.resolve(path.dirname(PAGE),'..'), TYPES={'.html':'text/html','.js':'text/javascript','.json':'application/json','.mp3':'audio/mpeg','.wasm':'application/wasm'};
  const srv=http.createServer((q,r)=>{ const f=path.join(ROOT,decodeURIComponent(new URL(q.url,'http://x').pathname)); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){ r.writeHead(404); return r.end(); } r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
  await new Promise(r=>srv.listen(0,'127.0.0.1',r)); const URL0='http://127.0.0.1:'+srv.address().port+'/'+path.relative(ROOT,PAGE);
  // another player's piece, as the website's /owned hands it out
  await pg.route(/\/owned$/,r=>{ let j={}; try{ j=JSON.parse(r.request().postData()||'{}'); }catch(e){} r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(j.music?{piece:j.p==='777'?{id:'777',name:'Theirs',by:'',n:[0,60,40,1,50,64,40,1,50,67,40,1,50,72,80,1]}:null}:{})}); });
  await pg.goto(URL0+'?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.waitForFunction(()=>window.AVATAR&&AVATAR.ready(),null,{timeout:120000}); await wait(1000);
  // the four kinds of file
  const midi=[...require('abcjs').synth.getMidiFile(ABC,{midiOutputType:'binary'})[0]];
  const rd=await pg.evaluate(async({midi,XML,ABC,TAB})=>{ const o={}, enc=t=>new TextEncoder().encode(t), sum=p=>(p=p&&MUSICIN.clean(p))&&{name:p.name,by:p.by,notes:p.n.length/4,m:p.n.filter((v,i)=>i%4===1).slice(0,8),h:[...new Set(p.n.filter((v,i)=>i%4===3))].sort()};
    for(const [k,f] of [['midi',()=>MUSICIN.read(new Uint8Array(midi))],['xml',()=>MUSICIN.read(enc(XML))],['abc',()=>MUSICIN.read(null,ABC)],['abcfile',()=>MUSICIN.read(enc(ABC))],['tab',()=>MUSICIN.read(null,TAB)],['run',()=>MUSICIN.read(null,'[Intro] '+TAB.split('\n').join('')+' (words after it)  '+TAB.split('\n').join('').replace(/-3-/g,'\u20143-'))],['junk',()=>MUSICIN.read(null,'hello there')]])try{ o[k]=sum(await f()); }catch(e){ o[k]='ERR '+e.message; }
    return o; },{midi,XML,ABC,TAB});
  rec('a MIDI file is read: its 25 notes, a hand each',rd.midi&&rd.midi.notes===25&&rd.midi.m[0]===60&&rd.midi.h.join()==='0,1',JSON.stringify(rd.midi));
  rec('MusicXML is read: its title, composer and eight notes',rd.xml&&rd.xml.name==='Sheet Test'&&rd.xml.by==='A. Player'&&rd.xml.notes===8&&rd.xml.m.join()==='60,64,67,64,60,64,67,64',JSON.stringify(rd.xml));
  rec('ABC is read, pasted or as a file: its title and notes',rd.abc&&rd.abc.name==='Abc Test'&&rd.abc.by==='Trad'&&rd.abc.notes===25&&rd.abcfile&&rd.abcfile.notes===25,JSON.stringify(rd.abc));
  rec('a text tab is read: its strings kept (the fifth string\'s third fret a C)',rd.tab&&rd.tab.notes===11&&rd.tab.m[0]===48&&rd.tab.h.every(h=>h>=2),JSON.stringify(rd.tab));
  rec('a tab pasted with its lines run together, words round it and long dashes in it is read: both systems',rd.run&&rd.run.notes===22&&rd.run.m[0]===48,JSON.stringify(rd.run));
  rec('what is not music gives nothing',rd.junk===null,JSON.stringify(rd.junk));
  // added: in every book but the drums', fitted to each
  const ad=await pg.evaluate(async({ABC,TAB})=>{ for(const k of ['guitar','piano','drums','harp','violin','flute','trumpet']){ FORAGE.give(k,1); FORAGE.S.sk[k]=0; }
    const a=MUSICIN.add(await MUSICIN.read(null,ABC)), t=MUSICIN.add(await MUSICIN.read(null,TAB,-1,'Tab Test')), o={at:a,saved:JSON.parse(MUSICIN.saved()).map(p=>p.name),fit:{}};
    for(const k of ['piano','harp','violin','flute','trumpet']){ const T=INSTR.KINDS[k].BOOK[a[k]]; o.fit[k]=T.n.length/(k==='piano'?4:k==='harp'?5:3); }
    o.fit.guitar=GUITAR.BOOK[a.guitar].notes.length/4; o.drums=INSTR.KINDS.drums.BOOK.some(T=>T.imp); const g=GUITAR.BOOK[t.guitar].notes; o.tab=[g[1],g[2]]; o.can=SONGBK.can('piano',INSTR.KINDS.piano.BOOK,INSTR.KINDS.piano.BOOK[a.piano]); return o; },{ABC,TAB});
  rec('a piece added is saved and fitted to the guitar, piano, harp, violin, flute and trumpet (the tune alone on the last three), not the drums',ad.saved.join()==='Abc Test,Tab Test'&&ad.fit.piano===25&&ad.fit.guitar===25&&ad.fit.harp===25&&ad.fit.violin>=15&&ad.fit.flute>=15&&ad.fit.trumpet>=15&&!ad.drums&&ad.can,JSON.stringify(ad));
  rec('the tab\'s own string and fret are the guitar\'s (string 5, fret 3)',ad.tab.join()==='5,3',JSON.stringify(ad.tab));
  // played at skill 0, no try, on each instrument you sit at; the panel's button and YOUR MUSIC
  for(const K of ['piano','harp','violin']){
    const p=await pg.evaluate(async K=>{ FORAGE.ACT[K](K); await new Promise(r=>setTimeout(r,800)); const el=document.querySelector('#insong'), og=el.querySelector('optgroup'), i=INSTR.KINDS[K].BOOK.findIndex(T=>T.imp&&T.name==='Abc Test'), sk=FORAGE.sk(K);
      const o={btn:!!document.querySelector('#inimp'),group:og&&og.label,opts:og&&og.children.length}; INSTR.play('song',i); o.song=INSTR.ME.song===i; o.fail=INSTR.ME.fail; await new Promise(r=>setTimeout(r,1500)); o.ev=INSTR.KINDS[K].BOOK[i].c.ev.length;
      for(let n=0;n<80&&INSTR.ME.song>=0;n++)await new Promise(r=>setTimeout(r,250)); o.ended=INSTR.ME.song<0; o.sk=FORAGE.sk(K)===sk; o.learnt=Object.keys((FORAGE.S.songs||{})[K]||{}).length; INSTR.stop(); return o; },K);
    rec('the '+K+': IMPORT MUSIC on its panel, YOUR MUSIC in its book, the piece played through at skill 0 with no try and no skill gained',p.btn&&p.group==='YOUR MUSIC'&&p.opts===2&&p.song&&!p.fail&&p.ev>=15&&p.ended&&p.sk&&!p.learnt,JSON.stringify(p)); }
  // LOOP plays it again; NEXT goes on to the next piece you know and round to the first
  const lp=await pg.evaluate(async()=>{ FORAGE.ACT.harp('harp'); await new Promise(r=>setTimeout(r,600)); const B=INSTR.KINDS.harp.BOOK, a=B.findIndex(T=>T.imp&&T.name==='Abc Test'), t=B.findIndex(T=>T.imp&&T.name==='Tab Test'), ME=INSTR.ME, o={btns:document.querySelectorAll('#inp [data-after]').length};
    const ends=async()=>{ const s=ME.s0; for(let n=0;n<160&&ME.s0===s&&ME.song>=0;n++)await new Promise(r=>setTimeout(r,100)); return ME.song; };
    document.querySelector('#inp [data-after=loop]').click(); o.mode=SONGBK.mode; INSTR.play('song',a); o.loop=await ends()===a;
    document.querySelector('#inp [data-after=next]').click(); o.next=await ends()===t; o.round=await ends()===a; document.querySelector('#inp [data-after=next]').click(); o.off=SONGBK.mode===''; o.stops=await ends()===-1; INSTR.stop(); return o; });
  rec('LOOP plays the piece again when it ends; NEXT the next piece you know, round to the first; neither, it stops',lp.btns===2&&lp.mode==='loop'&&lp.loop&&lp.next&&lp.round&&lp.off&&lp.stops,JSON.stringify(lp));
  const dr=await pg.evaluate(async()=>{ FORAGE.ACT.drums('drums'); await new Promise(r=>setTimeout(r,600)); const o={btn:!!document.querySelector('#inimp')}; INSTR.stop(); return o; });
  rec('the drums have no IMPORT MUSIC',!dr.btn,JSON.stringify(dr));
  const gt=await pg.evaluate(async()=>{ GUITAR.start('own'); await new Promise(r=>setTimeout(r,1500)); const i=GUITAR.BOOK.findIndex(T=>T.imp&&T.name==='Tab Test'), og=document.querySelector('#gtsong optgroup'), o={btn:!!document.querySelector('#gtimp'),group:og&&og.label};
    GUITAR.play('song',i); await new Promise(r=>setTimeout(r,1500)); o.song=GUITAR.ME.song===i; o.tune=GUITAR.BOOK[i].c.tune.length; for(let n=0;n<80&&GUITAR.ME.song>=0;n++)await new Promise(r=>setTimeout(r,250)); o.ended=GUITAR.ME.song<0; return o; });
  rec('the guitar: IMPORT MUSIC on its panel, the tab under YOUR MUSIC and played through',gt.btn&&gt.group==='YOUR MUSIC'&&gt.song&&gt.tune===11&&gt.ended,JSON.stringify(gt));
  // the window: the button opens it, a pasted tab is read and added, a piece removed
  await pg.click('#gtimp'); await pg.waitForSelector('#mui:not([hidden])',{timeout:20000}); await pg.fill('#muitext',TAB); await pg.click('#muiread'); await pg.waitForSelector('#muigot:not([hidden])',{timeout:20000}); await pg.fill('#muiname','From The Window');
  if(OUT){ fs.mkdirSync(OUT,{recursive:true}); await pg.screenshot({path:path.join(OUT,'import-window.png')}); }
  await pg.click('#muiadd'); await wait(300);
  const wn=await pg.evaluate(()=>({shut:document.querySelector('#mui').hidden,list:MUSICIN.list().map(p=>p.name),picked:(GUITAR.BOOK[+document.querySelector('#gtsong').value]||{}).name}));
  rec('the window: a pasted tab read, named and added, picked in the book',wn.shut&&wn.list.join()==='Abc Test,Tab Test,From The Window'&&wn.picked==='From The Window',JSON.stringify(wn));
  if(OUT)await pg.screenshot({path:path.join(OUT,'import-book.png')});
  await pg.click('#gtimp'); await pg.waitForSelector('#mui:not([hidden])'); await pg.click('#mui [data-rm]'); await wait(200);
  const rm=await pg.evaluate(()=>{ const o={list:MUSICIN.list().map(p=>p.name),saved:JSON.parse(MUSICIN.saved()).length,opts:document.querySelector('#gtsong optgroup').children.length}; dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape'})); o.shut=document.querySelector('#mui').hidden&&!GUITAR.on(); return o; });
  rec('REMOVE takes a piece out of the save and the book; ESC puts the guitar away and shuts the window',rm.list.join()==='Tab Test,From The Window'&&rm.saved===2&&rm.opts===2&&rm.shut,JSON.stringify(rm));
  // another player's piece: fetched by its number, hidden from your own book, playable for them
  const th=await pg.evaluate(async()=>{ const i=await MUSICIN.theirs('someone','777','piano'), T=INSTR.KINDS.piano.BOOK[i], no=await MUSICIN.theirs('someone','778','piano'); return {i,name:T&&T.name,free:T&&T.free,n:T&&T.n.length,no}; });
  rec('another player\'s piece is fetched when they play it, and is not in your book',th.i>=0&&th.name==='Theirs'&&th.free===2&&th.n===16&&th.no===-1,JSON.stringify(th));
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,n])=>n+'x '+k).join(' | '));
  await b.close(); srv.close(); process.exit(bad?1:0); })();
