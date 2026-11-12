// THE INSTRUMENTS YOU SIT AT (src/146zp-instruments.js, 146zpa-piano.js, 146zpb-drums.js, 146zpc-harp.js, 146zpd-melody.js, their Polyfork models in 150cyb-pfitems.js): node tests/instruments.cjs [dist/market.html] [out folder].
// The skills list MUSIC first (guitar, piano, drums, harp); the bodega sells each; playing one sets it before you and seats you at it, each finger on its key or string
// (each stick on its drum when it strikes), its sound at its real pitch (the music engine rendered offline and measured), the piano's dampers stopping a released key;
// a song from its book plays (and one past your skill is refused); another player's instrument is drawn on them and heard; ESC puts it away. With an out folder, pictures.
const {chromium}=require('playwright'), path=require('path');
const PAGE=path.resolve(process.argv[2]||'dist/market.html'), OUT=process.argv[3];
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  { const DIR=path.join(process.cwd(),'node_modules/@dimforge/rapier3d-compat'), fs=require('fs');
    await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/,r=>{ const f=path.join(DIR,new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1]||''); if(!fs.existsSync(f))return r.continue(); r.fulfill({path:f,contentType:/\.wasm$/.test(f)?'application/wasm':'text/javascript'}); }); }
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  // (served over http, as the website is: the recorded sounds are files beside the page, which a page opened from a file may not fetch)
  const http=require('http'), fs=require('fs'), ROOT=path.resolve(path.dirname(PAGE),'..'), TYPES={'.html':'text/html','.js':'text/javascript','.json':'application/json','.mp3':'audio/mpeg','.wasm':'application/wasm','.png':'image/png','.jpg':'image/jpeg'};
  const srv=http.createServer((q,r)=>{ const f=path.join(ROOT,decodeURIComponent(new URL(q.url,'http://x').pathname)); if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){ r.writeHead(404); return r.end(); } r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(r); });
  await new Promise(r=>srv.listen(0,'127.0.0.1',r)); const URL0='http://127.0.0.1:'+srv.address().port+'/'+path.relative(ROOT,PAGE);
  await pg.route(/\/owned$/,r=>r.fulfill({status:200,contentType:'application/json',body:'{}'}));   // the owners' kit asks the server first (the website's /owned)
  await pg.goto(URL0+'?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.waitForFunction(()=>window.AVATAR&&AVATAR.ready(),null,{timeout:120000}); await wait(1200);
  // the skills: MUSIC the first kind, with the four instruments
  const sk=await pg.evaluate(async()=>{ __dbg.UI.menuTab('pack','skills'); await new Promise(r=>setTimeout(r,500)); const t=(document.getElementById('packp')||{}).innerText||''; __dbg.UI.toggleMenu&&__dbg.UI.toggleMenu();
    const i=k=>t.indexOf(k); return {music:i('MUSIC'),wild:i('THE WILD'),guitar:i('GUITAR'),piano:i('PIANO'),drums:i('DRUMS'),harp:i('HARP'),sk:['piano','drums','harp'].map(k=>FORAGE.sk(k))}; });
  rec('the skills list MUSIC first: GUITAR, PIANO, DRUMS, HARP, each starting at 0',sk.music>=0&&sk.music<sk.wild&&[sk.guitar,sk.piano,sk.drums,sk.harp].every(v=>v>sk.music&&v<sk.wild)&&sk.sk.every(v=>v===0),JSON.stringify(sk));
  const ok=await pg.evaluate(async()=>{ for(const k of ['guitar','piano','drums','harp'])delete INV.items[k]; await FORAGE.ownerKit(); const K=['guitar','piano','drums','harp'], r={items:K.map(k=>INV.items[k]||0)}; FORAGE.maxed(true); r.sk=K.map(k=>FORAGE.sk(k)); FORAGE.use('piano',0,200); r.kept=FORAGE.S.sk.piano; FORAGE.maxed(false); r.off=K.map(k=>FORAGE.sk(k)); return r; });
  rec('an owner starts with the guitar, piano, drum kit and harp in the bag; ALL SKILLS 100 reads every skill 100 and off gives the real levels back',ok.items.every(n=>n===1)&&ok.sk.every(v=>v===100)&&ok.kept===0&&ok.off.every(v=>v===0),JSON.stringify(ok));
  await pg.evaluate(()=>{ for(const k of ['guitar','piano','drums','harp'])FORAGE.S.sk[k]=100; });
  const sh=await pg.evaluate(()=>['piano','drums','harp'].map(id=>({id,name:FORAGE.name(id),price:ITEMS.prop(id,'value'),shelf:BODEGA.LAYOUT.some(r=>r[2].includes(id)),make:!!(BODEGA.MAKE[id]&&BODEGA.MAKE[id]().children.length)})));
  rec('the bodega sells A PIANO ($900), A DRUM KIT ($450) and A HARP ($700) on its shelf',sh.every(s=>s.shelf&&s.make)&&sh.map(s=>s.name+' '+s.price).join()==='PIANO 900,DRUM KIT 450,HARP 700',JSON.stringify(sh));
  // each: set down and sat at; fingers (or sticks) on what they play
  for(const K of ['piano','harp','drums']){
    const p=await pg.evaluate(async K=>{ __dbg.UI.setView('third'); __dbg.UI.dist*=.4; FORAGE.give(K,1); FORAGE.ACT[K](K); await new Promise(r=>setTimeout(r,1200)); for(let i=0;i<60&&!(INSTR.ME&&INSTR.ME.H&&INSTR.ME.H.W);i++)await new Promise(r=>setTimeout(r,250));   // (a slow runner sets it down later)
    const P=INSTR.ME, o={on:INSTR.on(),held:!!P.H&&!!P.H.G.parent,panel:!document.getElementById('inp').hidden,sat:null,miss:[]};
      const W=P.H.W, hipY=P.H.W&&new P.H.G.position.constructor().setFromMatrixPosition(W[0]).y/P.H.k; o.sat=+hipY.toFixed(2);
      const chords=K==='piano'?[[48,52,55,60,64,67],[41,45,72,76,79],[48,52,55,64,67,71]]:K==='harp'?[[7,9,11,16,18,20],[3,5,22,24,26],[10,12,26,28,30]]:[[1],[5],[2],[6],[4],[7]];
      for(const ch of chords){ const evs=ch.map(n=>INSTR.note(P,K==='piano'?{n,v:.8,d:1e9,h:n<60?'L':'R'}:K==='harp'?{n,f:0,v:.8,d:2,h:n<14?'L':'R'}:{n,v:.8,d:.1,h:n===1?'L':'R'})); await new Promise(r=>setTimeout(r,K==='drums'?40:450)); if(K!=='drums')for(let f=0;f<8;f++)await new Promise(r=>requestAnimationFrame(r));   // (the reach settles over frames: on a slow machine 450 ms is only a frame or two)
        if(K==='drums'){ const e=evs[0], H=P.H, sd=e.h; P.K.hands(P,e.t,H); const q=H.st[sd]; o.miss.push(Math.round(q.tp.distanceTo(P.K.at(e))*1000));
          await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))); const q2=H.st[sd]; o.reach=Math.max(o.reach||0,Math.round(H.wr[sd].distanceTo(q2.wr)*1000)); await new Promise(r=>setTimeout(r,300)); }
        else { const err=P.H.err; o.miss.push(Math.round(Math.max(...['L','R'].flatMap(sd=>[0,1,2,3,4].filter(f=>evs.some(e=>e['f'+sd]===f||e.fh===f&&e.h===sd)).map(f=>err[sd][f]||0)))*1000)); for(const e of evs)INSTR.off(P,e); await new Promise(r=>setTimeout(r,200)); } }
      return o; },K);
    rec(`PLAY sets ${K.toUpperCase()} before you, seats you at it (hips at the seat) and shows its panel`,p.on&&p.held&&p.panel&&p.sat>.4&&p.sat<.65,JSON.stringify({on:p.on,held:p.held,panel:p.panel,sat:p.sat}));
    rec(K==='drums'?'each stick comes down onto its drum or cymbal as it strikes (within 1 cm), the fist where the stick wants it (within 2 cm)':`every played ${K==='piano'?'key':'string'}'s fingertip lands on it (within 10 mm)`,K==='drums'?p.miss.every(m=>m<=10)&&p.reach<=20:p.miss.every(m=>m<=10),JSON.stringify(K==='drums'?{tip:p.miss,reach:p.reach}:p.miss));
    if(OUT){ await pg.evaluate(()=>{ document.getElementById('inp').style.visibility='hidden'; INSTR.closeUp(true); }); await wait(1500); await pg.screenshot({path:OUT+'/'+K+'-closeup.png'}); await pg.evaluate(()=>{ document.getElementById('inp').style.visibility=''; }); }
    // a song: its notes go out and what moves moves; one past your skill is refused
    const s=await pg.evaluate(async K=>{ const P=INSTR.ME; FORAGE.S.sk[K]=1000; if(P.K.loadBook)await P.K.loadBook(); const i=P.K.BOOK.findIndex(T=>T.lvl===1); INSTR.play('song',i); const seen=new Set(), keys=new Set();
      for(let k=0;k<14;k++){ await new Promise(r=>setTimeout(r,300)); const H=P.H; seen.add(JSON.stringify(K==='drums'?[H.wr.L,H.wr.R].map(v=>v.toArray().map(x=>x.toFixed(3))):[H.fg.L,H.fg.R])); if(K==='piano')for(const [m,q] of Object.entries(H.G.userData.keys))if(q.dip>.5)keys.add(m); }
      const r={song:P.song===i,notes:P.cur,poses:seen.size,keys:keys.size}; INSTR.play('stop'); FORAGE.S.sk[K]=100; const hard=P.K.BOOK.findIndex(T=>T.lvl>=50); INSTR.play('song',hard); r.refused=P.song===-1; return r; },K);
    // the book's learning: five open in each band reached, a stumble stops the piece, three clean plays learn it and open the next
    const lb=await pg.evaluate(async K=>{ const P=INSTR.ME, B=P.K.BOOK, S=FORAGE.S, cnt=()=>{ const o={}; for(const v of SONGBK.state(K,B).values())o[v]=(o[v]||0)+1; return o; }; S.songs={}; const r={};
      S.sk[K]=50; r.at5=cnt(); S.sk[K]=250; r.at25=cnt(); const T=B.slice().sort((a,b)=>a.lvl-b.lvl)[0]; r.ch=[SONGBK.chance(K,T)]; S.sk[K]=0; r.ch.push(SONGBK.chance(K,T));
      const i=B.indexOf(T); if(!T.c)P.K.compile(T); const say0=window.SAY; S.sk[K]=1000; INSTR.play('song',i); P.fail=1.2; await new Promise(r=>setTimeout(r,2600)); r.stumbled=P.song===-1&&!SONGBK.learnt(K,T);
      for(let n=0;n<3;n++)SONGBK.done(K,T,true); S.sk[K]=50; r.learnt=SONGBK.learnt(K,T); r.after=cnt(); S.songs={}; S.sk[K]=100; return r; },K);
    rec(`the ${K} book: five pieces open at 0-10, ten by 20-30, a stumble stops the piece, three clean plays learn it and the next opens`,lb.at5.open===5&&!lb.at5.learnt&&lb.at25.open===15&&lb.ch[0]===1&&lb.ch[1]>.3&&lb.ch[1]<.7&&lb.stumbled&&lb.learnt&&lb.after.learnt===1&&lb.after.open===5,JSON.stringify(lb));
    rec(`a ${K} song from the book plays (its notes go out, the hands move${K==='piano'?', keys go down':''}), and one past your skill is refused`,s.song&&s.notes>5&&s.poses>=5&&(K!=='piano'||s.keys>=3)&&s.refused,JSON.stringify(s));
    await pg.evaluate(()=>INSTR.stop()); await wait(300); }
  // the violin, the flute and the trumpet: held as you sit, a tune from the one book plays in the instrument's range, the hands move, its recordings come
  for(const K of ['violin','flute','trumpet']){
    const m=await pg.evaluate(async K=>{ const S=FORAGE.S; S.songs={}; S.sk[K]=1000; FORAGE.give(K,1); FORAGE.ACT[K](K); await new Promise(r=>setTimeout(r,700)); const P=INSTR.ME, o={on:INSTR.kindOn()===K,held:!!P.H,skill:FORAGE.SK.some(s=>s[0]===K),price:ITEMS.prop(K,'value'),shelf:BODEGA.LAYOUT.some(r=>r[2].includes(K))};
      await P.K.loadBook(); o.book=P.K.BOOK.length; const i=P.K.BOOK.findIndex(T=>T.lvl===1); INSTR.play('song',i); const seen=new Set();
      for(let k=0;k<16;k++){ await new Promise(r=>setTimeout(r,300)); seen.add(JSON.stringify([P.H.wr.L,P.H.wr.R,P.H.fg.L,P.H.fg.R].map(v=>(v.toArray?v.toArray():v.flat()).map(x=>+x.toFixed(2))))); }
      const ev=P.K.BOOK[i].c.ev, R=P.K.slip; o.notes=P.cur; o.poses=seen.size; o.inRange=ev.every(e=>e.n>=R[0]&&e.n<=R[1]); o.one=ev.every((e,j)=>!j||e.t>ev[j-1].t); INSTR.play('stop');
      S.sk[K]=50; const st={}; for(const v of SONGBK.state(K,P.K.BOOK).values())st[v]=(st[v]||0)+1; o.open=st.open; let Q=INSTR.loadSounds(P.K); for(let n=0;n<120&&!Q.ok;n++){ await new Promise(r=>setTimeout(r,250)); Q=INSTR.loadSounds(P.K); } o.sounds=Q.ok&&Object.keys(Q.at).length;
      S.sk[K]=0; INSTR.stop(); return o; },K);
    rec(`the ${K}: a skill, sold at the bodega, held as you sit; a tune from the book plays one note at a time in its range, the hands move, five pieces open at 0-10, its recordings come`,m.on&&m.held&&m.skill&&m.price>0&&m.shelf&&m.book>150&&m.notes>3&&m.poses>=4&&m.inRange&&m.one&&m.open===5&&m.sounds>=10,JSON.stringify(m));
    await wait(300); }
  // Polyfork's models (data/pfitems.json): once they have come, each of the six wears its own (the piano and its bench, the harp, the kit's snare, bass drum and cymbals, the stools), the first shapes hidden
  const pf=await pg.evaluate(async()=>{ await PFI.load(); const want={piano:['piano_pf','piano_bench'],harp:['harp_pf','stool'],drums:['drum_snare','drum_kick','drum_cymbal','stool'],violin:['violin','violin_bow'],flute:['flute'],trumpet:['trumpet']}, r={};
    for(const [K,ids] of Object.entries(want)){ const g=INSTR.KINDS[K].model(), on=new Set(), it=g.userData.it; if(it&&it.userData.bow)g.add(it.userData.bow); g.traverse(o=>{ if(!o.isMesh||!o.userData.pf)return; let v=true; for(let q=o;q;q=q.parent)if(q.visible===false)v=false; if(v)on.add(o.userData.pf); });
      r[K]={miss:ids.filter(id=>!on.has(PFI.mesh(id).userData.pf))}; }
    return r; });
  rec('each of the six wears its Polyfork model once it has come (piano and bench, harp, the kit\'s drums and cymbals, violin and bow, flute, trumpet; a stool for the harp and the kit)',Object.values(pf).every(o=>!o.miss.length),JSON.stringify(pf));
  const tv=await pg.evaluate(async()=>{ const S=FORAGE.S; S.sk.trumpet=1000; FORAGE.give('trumpet',1); FORAGE.ACT.trumpet('trumpet'); await new Promise(r=>setTimeout(r,800)); const P=INSTR.ME, pv=P.H&&P.H.G.userData.it.userData.pf||{}, v=[1,2,3].map(i=>pv['piston-'+i]);
    const y=()=>v.map(q=>q?+(q.position.y-q.userData.at.y).toFixed(4):null), r={has:v.every(Boolean),rest:y()};
    const till=async ok=>{ for(let i=0;i<40&&!ok(y());i++)await new Promise(r=>setTimeout(r,100)); return y(); };
    INSTR.note(P,{n:55,v:.8,d:4,h:'R'}); r.d55=await till(d=>d[0]<-.012&&d[2]<-.012); await new Promise(r=>setTimeout(r,300)); r.mid=y()[1]; INSTR.note(P,{n:60,v:.8,d:4,h:'R'}); r.d60=await till(d=>d.every(v=>Math.abs(v)<.002)); S.sk.trumpet=0; INSTR.stop(); return r; });
  rec('the trumpet\'s valves move: G3 (first and third) pushes those two pistons down, C4 (open) lets every one up',tv.has&&tv.rest.every(d=>Math.abs(d)<.002)&&tv.d55[0]<-.01&&tv.d55[2]<-.01&&Math.abs(tv.mid)<.003&&tv.d60.every(d=>Math.abs(d)<.003),JSON.stringify(tv));
  // the sound: each rings out loud through the instruments' own audio; each at its real pitch, rendered offline
  const a=await pg.evaluate(async()=>{ const G=INSTR.ME&&window.GUITAR.GSND; G.wake(); for(let i=0;i<40&&!G.imx;i++)await new Promise(r=>setTimeout(r,250)); if(!G.imx)return {ok:false};
    const an=G.ctx.createAnalyser(); an.fftSize=2048; G.out.connect(an); const buf=new Float32Array(an.fftSize), peak={};
    for(const K of ['piano','drums','harp']){ FORAGE.ACT[K](K); await new Promise(r=>setTimeout(r,400)); const P=INSTR.ME; INSTR.note(P,K==='piano'?{n:60,v:.9,d:1e9,h:'R'}:K==='harp'?{n:14,f:0,v:.9,d:2,h:'R'}:{n:6,v:1,d:.1,h:'R'}); let pk=0;
      for(let i=0;i<48&&pk<.02;i++){ await new Promise(r=>setTimeout(r,25)); an.getFloatTimeDomainData(buf); for(const v of buf)pk=Math.max(pk,Math.abs(v)); } peak[K]=+pk.toFixed(3); INSTR.stop(); await new Promise(r=>setTimeout(r,200)); }
    const SR=44100, src=__imx.src;
    const render=async(dsp,evs,secs)=>{ const oc=new OfflineAudioContext(1,Math.floor(SR*secs),SR); await oc.audioWorklet.addModule('data:application/javascript,'+encodeURIComponent(src)); const n=new AudioWorkletNode(oc,'imx',{outputChannelCount:[1],processorOptions:{...dsp,ev:evs}}); n.connect(oc.destination);
      return (await oc.startRendering()).getChannelData(0); };
    const pitch=(x,i0,lo,hi)=>{ const n=Math.floor(.1*SR), y=x.subarray(i0,i0+n); let best=0, lag=0; for(let L=Math.floor(SR/hi);L<Math.floor(SR/lo);L++){ let c=0; for(let i=0;i<n-L;i++)c+=y[i]*y[i+L]; if(c>best){ best=c; lag=L; } } return lag?+(SR/lag).toFixed(1):0; };
    const rms=(x,a,b)=>{ let s=0; for(let i=Math.floor(a*SR);i<Math.floor(b*SR);i++)s+=x[i]*x[i]; return Math.sqrt(s/((b-a)*SR)); };
    const PK=INSTR.KINDS.piano, HK=INSTR.KINDS.harp, hz={};
    for(const [m,want] of [[57,220],[69,440]]){ const x=await render(PK.dsp(),PK.sound({n:m,v:.8}).map(e=>({...e,t:.02})),.5); hz['piano '+m]=[pitch(x,Math.floor(.15*SR),want/1.6,want*1.6),want]; }
    for(const [s,want] of [[14,261.63],[21,523.25]]){ const x=await render(HK.dsp(),HK.sound({n:s,v:.8,f:0},{st:{}}).map(e=>({...e,t:.02})),.5); hz['harp '+s]=[pitch(x,Math.floor(.15*SR),want/1.6,want*1.6),want]; }
    { const x=await render(HK.dsp(),HK.sound({n:14,v:.8,f:1},{st:{}}).map(e=>({...e,t:.02})),.5); hz['harp C4 sharp']=[pitch(x,Math.floor(.15*SR),180,420),277.18]; }
    const DK=INSTR.KINDS.drums, dr={}; for(const n of [0,1,5]){ const x=await render(DK.dsp(),DK.sound({n,v:1,h:'L'},{st:{}}).map(e=>({...e,t:.02})),.4); let pk=0; for(const v of x)pk=Math.max(pk,Math.abs(v)); dr[['kick','snare','','','','hat'][n]]=+pk.toFixed(3); }
    const ring=await render(PK.dsp(),PK.sound({n:60,v:.8}).map(e=>({...e,t:.02})),1.2), damped=await render(PK.dsp(),[...PK.sound({n:60,v:.8}).map(e=>({...e,t:.02})),{k:'damp',id:60,T:.12,t:.3}],1.2);
    return {ok:true,peak,hz,dr,ring:+rms(ring,.8,1.1).toFixed(5),damped:+rms(damped,.8,1.1).toFixed(5)}; });
  rec('each sounds through the instruments\' own audio (piano, drums, harp)',a.ok&&Object.values(a.peak).every(p=>p>.005),JSON.stringify(a.peak));
  rec('each sounds at its real pitch (piano A3 A4, harp C4 C5, and C4 with its pedal sharp: within 3%)',a.ok&&Object.values(a.hz).every(([h,w])=>Math.abs(h-w)/w<.03),JSON.stringify(a.hz));
  rec('the kick, the snare and the hi-hat each strike loud (rendered offline)',a.ok&&Object.values(a.dr).every(p=>p>.05),JSON.stringify(a.dr));
  // the recordings: each instrument's fetched and decoded, every sound's start found, and played back at the note's pitch
  const rs=await pg.evaluate(async()=>{ const out={}; for(const id of ['piano','drums','harp']){ const K=INSTR.KINDS[id]; let S=INSTR.loadSounds(K); for(let i=0;i<120&&!S.ok;i++){ await new Promise(r=>setTimeout(r,250)); S=INSTR.loadSounds(K); } out[id]={ok:S.ok,n:S.ok?Object.keys(S.at).length:0,want:K.samples.s.length,secs:S.ok?+S.buf.duration.toFixed(1):0}; }
    const SR=44100, pitch=(x,lo,hi)=>{ const i0=Math.floor(.12*SR), n=Math.floor(.1*SR), y=x.subarray(i0,i0+n); let best=0, lag=0; for(let L=Math.floor(SR/hi);L<Math.floor(SR/lo);L++){ let c=0; for(let i=0;i<n-L;i++)c+=y[i]*y[i+L]; if(c>best){ best=c; lag=L; } } return lag?+(SR/lag).toFixed(1):0; };
    const play=async(id,e,P)=>{ const K=INSTR.KINDS[id], S=INSTR.SMP[id], h=K.sample(e,P||{st:{}},S)[0], A=S.at[h.k], oc=new OfflineAudioContext(1,Math.floor(SR*.4),SR), src=oc.createBufferSource(); src.buffer=S.buf; src.playbackRate.value=h.rate||1; src.connect(oc.destination); src.start(0,A.t,A.L); const x=(await oc.startRendering()).getChannelData(0); let pk=0; for(const v of x)pk=Math.max(pk,Math.abs(v)); return {x,pk}; };
    const hz={}; if(out.piano.ok)for(const [m,w] of [[69,440],[74,587.33],[50,146.83]]){ const r=await play('piano',{n:m,v:.8}); hz['piano '+m]=[pitch(r.x,w/1.5,w*1.5),w]; }
    if(out.harp.ok)for(const [s,w] of [[16,329.63],[14,261.63]]){ const r=await play('harp',{n:s,f:0,v:.8}); hz['harp '+s]=[pitch(r.x,w/1.5,w*1.5),w]; }
    const dk={}; if(out.drums.ok)for(const [n,o] of [[0,0],[1,0],[5,0],[5,1],[6,0],[7,0]]){ const r=await play('drums',{n,v:.9,o,h:'R'}); dk[n+(o?'o':'')]=+r.pk.toFixed(3); }
    // the piano's three loudnesses, the one-note instruments' held and short notes, the guitar's recordings
    const lay={}; if(out.piano.ok)for(const v of [.2,.6,.95])lay[v]=INSTR.KINDS.piano.sample({n:60,v},{st:{}},INSTR.SMP.piano)[0].k;
    const mel={}; for(const id of ['violin','flute','trumpet']){ const K=INSTR.KINDS[id]; let S=INSTR.loadSounds(K); for(let i=0;i<120&&!S.ok;i++){ await new Promise(r=>setTimeout(r,250)); S=INSTR.loadSounds(K); }
      mel[id]=S.ok?[K.sample({n:72,v:.8,d:1.2},{st:{}},S)[0].k,K.sample({n:72,v:.8,d:.15},{st:{}},S)[0].k,K.sample({n:72,v:.8,d:.15,sl:1},{st:{}},S)[0].off>0]:null; }
    const GSND=INSTR.GSND; let G=GSND.set('guitar',GSND.GS); for(let i=0;i<120&&!G.ok;i++){ await new Promise(r=>setTimeout(r,250)); G=GSND.set('guitar',GSND.GS); }
    let ghz=0; if(G.ok){ const n=GSND.near(G,'',57), A=G.at[n.k], oc=new OfflineAudioContext(1,Math.floor(SR*.4),SR), src=oc.createBufferSource(); src.buffer=G.buf; src.playbackRate.value=n.rate; src.connect(oc.destination); src.start(0,A.t,A.L); ghz=pitch((await oc.startRendering()).getChannelData(0),146,293); }
    return {out,hz,dk,lay,mel,guitar:{ok:G.ok,n:G.ok?Object.keys(G.at).length:0,hz:ghz}}; });
  rec('the recorded sounds come and decode (the Salamander piano, the VSCO harp, the MuldjordKit drums), every sound\'s start found',Object.values(rs.out).every(o=>o.ok&&o.n===o.want),JSON.stringify(rs.out));
  rec('a recorded note plays at its own pitch (piano A4, D5 and D3 from their nearest recordings, harp E4 and C4: within 2%)',Object.keys(rs.hz).length===5&&Object.values(rs.hz).every(([h,w])=>Math.abs(h-w)/w<.02),JSON.stringify(rs.hz));
  rec('the piano plays its soft, middle and loud recordings by touch',Object.values(rs.lay).join()==='p0:60,p1:60,p2:60',JSON.stringify(rs.lay));
  rec('the violin, flute and trumpet play a held recording for a long note, a short one for a short note, and a joined note without its attack',Object.values(rs.mel).every(m=>m&&m[0][0]==='l'&&m[1][0]==='s'&&m[2]),JSON.stringify(rs.mel));
  rec('the guitar\'s recordings come (FreePats\' classical guitar, 48 notes) and an A3 plays at its pitch (within 2%)',rs.guitar.ok&&rs.guitar.n===48&&Math.abs(rs.guitar.hz-220)/220<.02,JSON.stringify(rs.guitar));
  const fl=await pg.evaluate(()=>{ const K=INSTR.KINDS.violin, c={ev:[{t:1,n:60,d:.5,v:.75},{t:1.5,n:64,d:.5,v:.75},{t:2,n:67,d:1,v:.75},{t:4,n:72,d:.2,v:.75}],len:4.5}, d=JSON.parse(JSON.stringify(c)); INSTR.feel(c,K); INSTR.feel(d,K);
    return {same:JSON.stringify(c)===JSON.stringify(d),vs:new Set(c.ev.map(e=>e.v.toFixed(2))).size,off:c.ev.some((e,i)=>Math.abs(e.t-[1,1.5,2,4][i])>.001),lg:!!c.ev[0].lg&&!!c.ev[1].sl,order:c.ev.every((e,i)=>!i||e.t>=c.ev[i-1].t)}; });
  rec('a piece is played with feel: its loudness shaped, off the grid, joined notes marked, the same for everyone',fl.same&&fl.vs>=3&&fl.off&&fl.lg&&fl.order,JSON.stringify(fl));
  rec('every drum and cymbal has its recorded hit',Object.keys(rs.dk).length===6&&Object.values(rs.dk).every(p=>p>.05),JSON.stringify(rs.dk));
  // the 88-key panel (book-only: a display): every key A0 to C8 (52 white, 36 black), none playable by click; a piece from the book lights its keys; five octaves; the names
  await pg.evaluate(async()=>{ try{ localStorage.removeItem('tsfm.piano.kb'); }catch(_){} FORAGE.ACT.piano('piano'); await new Promise(r=>setTimeout(r,600)); });
  const kb=await pg.evaluate(()=>{ const q=s=>document.querySelectorAll('#inp .kb '+s).length; return {all:q('b'),w:q('b.w'),k:q('b.k'),lo:document.querySelector('#inp .kb b').dataset.m,hi:[...document.querySelectorAll('#inp .kb b')].pop().dataset.m,clickable:q('b[data-n]')}; });
  const sl=await pg.evaluate(async()=>{ const P=INSTR.ME, S=FORAGE.S; S.sk.piano=1000; await P.K.loadBook(); const i=P.K.BOOK.findIndex(T=>T.lvl===1); INSTR.play('song',i); const seen=new Set(); let ok=0;
    for(let k=0;k<20;k++){ await new Promise(r=>setTimeout(r,250)); const t=INSTR.time(P), sounding=new Set(INSTR.score(P).ev.filter(e=>e.t<=t-.05&&e.t+e.d>=t+.05).map(e=>e.n)); const on=[...document.querySelectorAll('#inp .kb b.pl')].map(b=>+b.dataset.m); for(const m of on)seen.add(m); if(sounding.size&&[...sounding].some(m=>on.includes(m)))ok++; }
    INSTR.play('stop'); S.sk.piano=100; await new Promise(r=>setTimeout(r,500)); return {lit:seen.size,match:ok,after:document.querySelectorAll('#inp .kb b.pl').length}; });
  const kv=await pg.evaluate(async()=>{ const b=s=>document.querySelector('#inp '+s); b('[data-kv="five"]').dispatchEvent(new MouseEvent('click',{bubbles:true})); const r={five:document.querySelectorAll('#inp .kb b').length};
    b('[data-kl="doremi"]').dispatchEvent(new MouseEvent('click',{bubbles:true})); r.do=[...document.querySelectorAll('#inp .kb b')].some(x=>x.textContent==='DO'); b('[data-kl="abc"]').dispatchEvent(new MouseEvent('click',{bubbles:true})); r.c4=b('.kb b[data-m="60"]').textContent==='C4';
    r.kept=JSON.parse(localStorage.getItem('tsfm.piano.kb')||'{}'); b('[data-kv="all"]').dispatchEvent(new MouseEvent('click',{bubbles:true})); b('[data-kl="none"]').dispatchEvent(new MouseEvent('click',{bubbles:true})); r.back=document.querySelectorAll('#inp .kb b').length; INSTR.stop(); return r; });
  rec('the piano\'s panel shows all 88 keys under the book (52 white, 36 black, A0 to C8), none played by clicking',kb.all===88&&kb.w===52&&kb.k===36&&kb.lo==='21'&&kb.hi==='108'&&kb.clickable===0,JSON.stringify(kb));
  rec('a piece from the book lights its keys on the 88-key panel as they sound, and they go dark after',sl.lit>=4&&sl.match>=5&&sl.after===0,JSON.stringify(sl));
  rec('the panel\'s five octaves (61 keys) and its note names (DO RE MI, C D E), kept for the viewer',kv.five===61&&kv.do&&kv.c4&&kv.kept.view==='five'&&kv.kept.lab==='abc'&&kv.back===88,JSON.stringify(kv));
  rec('a released piano key is stopped by its damper (far quieter than one held)',a.ok&&a.damped<a.ring*.1,JSON.stringify({ring:a.ring,damped:a.damped}));
  // another player at a piano: drawn on them, their note in their live score and their fingers, heard from where they sit; gone when they put it away
  const o=await pg.evaluate(async()=>{ __dbg.UI.dist*=.3; const P=__dbg.you(), at=[P.x+1.8,P.z+.4,SHARED.py,0,SHARED.LVL,''];
    ONLINE.feed({t:'hi',you:'me',all:[{id:'p1',name:'IVY',look:'b:avatar:'+AVATAR.code(),at,x:{ins:'p'}}]}); await new Promise(r=>setTimeout(r,1500));
    ONLINE.feed({t:'ins',id:'p1',k:'b',i:'piano',v:'n60.7,n64.7,n67.7'}); await new Promise(r=>setTimeout(r,900));
    const T=INSTR.THEM().get('p1'), r={them:!!T,held:!!(T&&T.H&&T.H.G.parent),notes:T?T.live.ev.length:0,voice:!!(T&&T.V)};
    ONLINE.feed({t:'ins',id:'p1',k:'b',i:'piano',v:'u60,u64,u67'}); ONLINE.feed({t:'ins',id:'p1',k:'off',i:'piano',v:''}); ONLINE.feed({t:'out',id:'p1'}); await new Promise(r=>setTimeout(r,500)); r.gone=!INSTR.THEM().has('p1'); return r; });
  rec('another player\'s piano is drawn on them, their chord plays in their hands and is heard; gone when they put it away',o.them&&o.held&&o.notes===3&&o.voice&&o.gone,JSON.stringify(o));
  const e=await pg.evaluate(async()=>{ FORAGE.ACT.harp('harp'); await new Promise(r=>setTimeout(r,500)); document.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape',bubbles:true})); await new Promise(r=>setTimeout(r,500)); return {on:INSTR.on(),panel:!document.getElementById('inp').hidden,held:!!INSTR.ME.H}; });
  rec('ESC puts it away (no instrument, no panel)',!e.on&&!e.panel&&!e.held,JSON.stringify(e));
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,n])=>n+'× '+k).join(' | '));
  console.log(bad?bad+' FAILED':'ALL PASS'); srv.close(); await b.close(); process.exit(bad?1:0); })();
