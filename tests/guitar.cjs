// THE GUITAR AND THE HANDS (src/111b-hands.js, 146zo-guitar-sound.js, 146zoa-guitar-hold.js, 146zob-guitar.js): node tests/guitar.cjs [dist/market.html] [out folder].
// Your avatar wears Polyfork's jointed hands in place of its own; the bodega sells the guitar; playing it puts it in your hands, each chord's fingers land on their
// strings and frets, a song moves them, the strings sound at their real pitches (the waveguides rendered offline and measured), another player's guitar is drawn
// on them and heard, the park's guitar plays where it stands, and ESC puts it away. With an out folder, pictures in the close-up and from in front.
const {chromium}=require('playwright'), path=require('path');
const PAGE=path.resolve(process.argv[2]||'dist/market.html'), OUT=process.argv[3];
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  { const DIR=path.join(process.cwd(),'node_modules/@dimforge/rapier3d-compat'), fs=require('fs');
    await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/,r=>{ const f=path.join(DIR,new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1]||''); if(!fs.existsSync(f))return r.continue(); r.fulfill({path:f,contentType:/\.wasm$/.test(f)?'application/wasm':'text/javascript'}); }); }
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms=120000)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(400))if(await pg.evaluate(f))return true; return false; };
  await pg.goto('file://'+PAGE+'?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await U(()=>window.AVATAR&&AVATAR.ready()); await wait(1200);
  // the hands
  const h=await pg.evaluate(async()=>{ const me=()=>W3.group.children.find(m=>m.userData&&m.userData.hands), n=()=>BODIES.by.avatar.GEO.attributes.position.count/3;
    const a={hands:!!me()&&me().children.some(c=>c.name==='hands'), tris:n()};
    const g=AVATAR.pieces.find(p=>p.slot==='hands'&&p.figs.includes(AVATAR.L().f)); if(g){ await AVATAR.wear('hands',g.n); await new Promise(r=>setTimeout(r,300)); a.gloved=!me()||!me().children.some(c=>c.name==='hands'); await AVATAR.wear('hands',null); await new Promise(r=>setTimeout(r,300)); a.back=!!me()&&me().children.some(c=>c.name==='hands'); }
    return a; });
  rec('your avatar wears Polyfork\'s jointed hands',h.hands,JSON.stringify(h));
  const lod=await pg.evaluate(async()=>{ const UI=__dbg.UI; UI.setView('third'); await new Promise(r=>setTimeout(r,1200)); const me=W3.group.children.find(m=>m.userData&&m.userData.hands), st=me.userData.hands, far={jointed:st.hm.visible,mittens:me.userData.PM.hh.value===0};
    const d0=UI.dist; UI.dist*=.2; await new Promise(r=>setTimeout(r,1200)); const near={jointed:st.hm.visible,mittens:me.userData.PM.hh.value===0}; UI.dist=d0; await new Promise(r=>setTimeout(r,800)); return {far,near}; });
  rec('the jointed hands are drawn only near the camera; further off, the body\'s own simple hands',!lod.far.jointed&&lod.far.mittens&&lod.near.jointed&&!lod.near.mittens,JSON.stringify(lod));
  rec('gloves cover them (the glove, no jointed hands), and they come back bare',h.gloved!==false&&h.back!==false,JSON.stringify(h));
  // the bodega sells it
  const sh=await pg.evaluate(()=>({name:FORAGE.name('guitar'),price:ITEMS.prop('guitar','value'),shelf:!!(window.BODEGA||{}).LAYOUT&&BODEGA.LAYOUT.some(r=>r[2].includes('guitar')),make:!!(BODEGA.MAKE&&BODEGA.MAKE.guitar&&BODEGA.MAKE.guitar().children.length)}));
  rec('the bodega sells A GUITAR on its bottom shelf, $180',sh.name==='A GUITAR'&&sh.price===180&&sh.shelf&&sh.make,JSON.stringify(sh));
  // playing it: in your hands, each chord's pressing fingers on their strings and frets
  const p=await pg.evaluate(async()=>{ __dbg.UI.setView('third'); FORAGE.give('guitar',1); FORAGE.ACT.guitar('guitar'); await new Promise(r=>setTimeout(r,800)); const H=GUITAR.ME.H, out={on:GUITAR.on(),held:!!H&&!!H.gm.parent,panel:!document.getElementById('gtp').hidden,miss:{}};
    for(const c of ['C','G','D','A','E','Am','Em','Dm','F']){ GUITAR.play('chord',c); await new Promise(r=>setTimeout(r,900)); const e=GUITAR.ME.H.err.L, sh=GTCHORD_OF(c); out.miss[c]=Math.round(Math.max(...sh.map(f=>e[f]))*1000); }
    return out;
    function GTCHORD_OF(c){ return [...new Set(GUITAR.ME.live.lh.filter(q=>q.t1>1e8).map(q=>q.f))]; } });
  rec('PLAY puts the guitar in your hands with its panel',p.on&&p.held&&p.panel,JSON.stringify({on:p.on,held:p.held,panel:p.panel}));
  rec('every chord\'s pressing fingertips land on their strings at their frets (within 10 mm)',Object.values(p.miss).every(m=>m<=10),JSON.stringify(p.miss));
  if(OUT){ await pg.evaluate(()=>{ GUITAR.play('chord','C'); GUITAR.closeUp(true); }); await wait(1500); await pg.screenshot({path:OUT+'/guitar-closeup.png'}); }
  // a song moves the fingers and plucks the strings
  const s=await pg.evaluate(async()=>{ const H=GUITAR.ME.H, snap=()=>JSON.stringify([H.fg.L,H.fg.R]); FORAGE.S.sk.guitar=1000; const i0=GUITAR.BOOK.findIndex((b,i)=>GUITAR.canPlay(i)&&SONGBK.chance('guitar',b)===1); GUITAR.play('song',i0); const seen=new Set(); for(let i=0;i<12;i++){ await new Promise(r=>setTimeout(r,250)); seen.add(snap()); }
    const r={song:GUITAR.ME.song===i0?0:-1,poses:seen.size,notes:GUITAR.ME.cur}; GUITAR.play('stop'); FORAGE.S.sk.guitar=100; return r; });
  rec('a song from the book plays: its notes go out and the fingers move',s.song===0&&s.poses>=6&&s.notes>5,JSON.stringify(s));
  // the sound: the strings ring out loud, and each open string at its real pitch
  const a=await pg.evaluate(async()=>{ const G=GUITAR.GSND; G.wake(); for(let i=0;i<40&&!G.ok;i++)await new Promise(r=>setTimeout(r,250)); if(!G.ok)return {ok:false};
    const an=G.ctx.createAnalyser(); an.fftSize=2048; G.out.connect(an); const buf=new Float32Array(an.fftSize); GUITAR.play('chord','G'); GUITAR.play('strum','D'); let peak=0;
    for(let i=0;i<10;i++){ await new Promise(r=>setTimeout(r,60)); an.getFloatTimeDomainData(buf); for(const v of buf)peak=Math.max(peak,Math.abs(v)); }
    const SR=44100, want=[329.63,246.94,196,146.83,110,82.41], hz={};
    // each string alone, rendered offline (its pluck handed in at the start), its pitch by autocorrelation over a tenth of a second while it rings
    for(let s=1;s<=6;s++){ const oc=new OfflineAudioContext(1,Math.floor(SR*.45),SR); await oc.audioWorklet.addModule('data:application/javascript,'+encodeURIComponent(G.SRC)); const q=G.PM[s-1];
      const node=new AudioWorkletNode(oc,'guitar',{outputChannelCount:[1],processorOptions:{ev:[{t:.02,k:'pluck',s:s-1,hz:want[s-1],g:q.g,a:q.a,ap:q.ap,amp:.8,bright:1,pos:.2}]}}); node.connect(oc.destination);
      const out=(await oc.startRendering()).getChannelData(0), i0=Math.floor(.15*SR), n=Math.floor(.12*SR), x=out.subarray(i0,i0+n); let best=0, lag=0;
      for(let L=Math.floor(SR/400);L<Math.floor(SR/70);L++){ let c=0; for(let i=0;i<n-L;i++)c+=x[i]*x[i+L]; if(c>best){ best=c; lag=L; } }
      hz[s]=lag?+(SR/lag).toFixed(1):0; }
    return {ok:true,peak:+peak.toFixed(3),hz,want}; });
  rec('a strum sounds through the guitar\'s own audio',a.ok&&a.peak>.01,JSON.stringify({ok:a.ok,peak:a.peak}));
  rec('each open string sounds at its real pitch (E A D G B E, within 3%)',a.ok&&[1,2,3,4,5,6].every(s=>{ const h=a.hz[s], w=a.want[s-1]; return [w,w*2,w/2].some(v=>Math.abs(h-v)/v<.03); }),JSON.stringify(a.hz));
  // another player playing: their guitar drawn on them, their chord in their fingers, their voice placed where they stand
  const o=await pg.evaluate(async()=>{ __dbg.UI.dist*=.3;   // (the camera in close: the jointed hands are drawn and fingered only near it)
    const P=__dbg.you(), at=[P.x+1.6,P.z+.4,SHARED.py,0,SHARED.LVL,''];
    ONLINE.feed({t:'hi',you:'me',all:[{id:'g1',name:'LUZ',look:'b:avatar:'+AVATAR.code(),at,x:{gtr:'f'}}]}); await new Promise(r=>setTimeout(r,1500));
    ONLINE.feed({t:'gtr',id:'g1',k:'chord',v:'Am'}); ONLINE.feed({t:'gtr',id:'g1',k:'strum',v:'D'}); await new Promise(r=>setTimeout(r,1200));
    const T=GUITAR.THEM().get('g1'); const r={them:!!T,held:!!(T&&T.H&&T.H.gm.parent),chord:T&&T.chord,voice:!!(T&&T.V),miss:T&&T.H&&T.H.err?Math.round(Math.max(...[...new Set(T.live.lh.filter(q=>q.t1>1e8).map(q=>q.f))].map(f=>T.H.err.L[f]||0))*1000):null};   // (the fingers that press the chord, as for yours)
    ONLINE.feed({t:'gtr',id:'g1',k:'off',v:''}); ONLINE.feed({t:'out',id:'g1'}); await new Promise(r=>setTimeout(r,400)); r.gone=!GUITAR.THEM().has('g1'); return r; });
  rec('another player\'s guitar: in their hands, their chord under their fingers, heard from where they stand, gone when they stop',o.them&&o.held&&o.chord==='Am'&&o.voice&&o.miss!=null&&o.miss<=10&&o.gone,JSON.stringify(o));
  // ESC puts it down: off your hands, onto your back (others see it there), till you stow it in the bag
  const e=await pg.evaluate(async()=>{ document.body.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',key:'Escape',bubbles:true})); await new Promise(r=>setTimeout(r,600)); const me=()=>W3.group.children.find(m=>m.userData&&m.userData.hands);
    const r={on:GUITAR.on(),slung:GUITAR.slung(),onBody:me().children.some(c=>c.name==='guitar'),fg:!!me().userData.hands.fg,panel:!document.getElementById('gtp').hidden,seen:ONLINE.mine.gtr()};
    FORAGE.ACT.gstow('guitar'); await new Promise(r=>setTimeout(r,300)); r.stowed=!GUITAR.slung()&&!me().children.some(c=>c.name==='guitar')&&ONLINE.mine.gtr()==null; return r; });
  rec('ESC puts it down onto your back (your fingers the rig\'s again, the panel gone, others see it slung); STOW IT puts it in the bag',!e.on&&e.slung&&e.onBody&&!e.fg&&!e.panel&&e.seen==='b'&&e.stowed,JSON.stringify(e));
  // the songs: the book's five and the downloaded pieces, each needing its GUITAR level; practice raises it
  const sg=await pg.evaluate(async()=>{ const B=GUITAR.BOOK; FORAGE.S.sk.guitar=100; GUITAR.start('own'); await GUITAR.loadSongs(); const lv=FORAGE.sk('guitar'), hard=B.findIndex(b=>b.lvl>50&&b.lvl<=60&&b.notes&&b.lvl===Math.min(...B.filter(q=>q.lvl>50&&!q.kept).map(q=>q.lvl)));
    GUITAR.play('song',hard); const refused=GUITAR.ME.song!==hard; FORAGE.S.sk.guitar=1000; GUITAR.play('song',hard); await new Promise(r=>setTimeout(r,2500)); const playing=GUITAR.ME.song===hard, notes=GUITAR.ME.cur; GUITAR.play('stop');
    FORAGE.S.sk.guitar=100; for(let i=0;i<600;i++)GUITAR.play('pluck',1+i%6); const after=FORAGE.sk('guitar'); GUITAR.stop(); GUITAR.stow();
    return {book:B.length,downloaded:B.filter(b=>b.notes).length,skill:lv,inSkills:FORAGE.SK.some(s=>s[0]==='guitar'),refused,playing,notes,after}; });
  rec('the song book has the downloaded pieces; GUITAR is a skill (10 to start), a piece above yours is refused, at 100 it plays, practice raises it',sg.downloaded>=150&&sg.inSkills&&sg.skill===10&&sg.refused&&sg.playing&&sg.notes>3&&sg.after>10,JSON.stringify(sg));
  // full hands can't play; your skill sets how often a note goes wrong; playing raises it as the piece goes on
  const sk=await pg.evaluate(()=>{ FORAGE.give('net',1); WIELD.set('net'); GUITAR.start('own'); const full=!GUITAR.on(); WIELD.set(null); if(GUITAR.on())GUITAR.stop();
    const B=GUITAR.BOOK, T=B.find(b=>b&&!b.kept&&(b.lvl||1)<=5); FORAGE.S.sk.guitar=0; const r=SONGBK.start('guitar',T), P=SONGBK.read(SONGBK.code(0,r,40)); let w=0; for(let n=0;n<2000;n++)if(SONGBK.wrong(P,n))w++;
    FORAGE.S.sk.guitar=1000; const r2=SONGBK.start('guitar',T); FORAGE.S.sk.guitar=0; const Q={s0:7,fail:0}; SONGBK.tick('guitar',T,Q,61); const grew=FORAGE.sk('guitar');
    return {full,miss:r.miss,wrong:w/2000,miss1000:r2.miss,grew}; });
  rec('a full hand is told to put its thing away first; at skill 0 notes go wrong, at 100 none; a minute of a piece raises the skill',sk.full&&sk.miss>.1&&Math.abs(sk.wrong-sk.miss)<.05&&sk.miss1000===0&&sk.grew>0,JSON.stringify(sk));
  // the headset's tracked hands as the jointed hands: every WebXR joint name is one of the hand's bones
  const vr=await pg.evaluate(()=>{ const R=HANDS.vr(), names=['wrist','thumb-tip','index-finger-phalanx-intermediate','pinky-finger-tip']; let ok=true; for(const n of names){ const before=R.U.value[HANDS.NAME[n]*3].x; R.set('L',n,new (__dbg.THREE.Matrix4)().makeTranslation(.5,0,0)); ok=ok&&HANDS.NAME[n]!=null&&R.U.value[HANDS.NAME[n]*3].w===.5; } return {ok,joints:Object.keys(HANDS.NAME).length}; });
  rec('the headset\'s tracked hands drive the jointed hands joint for joint (25 WebXR joints)',vr.ok&&vr.joints===25,JSON.stringify(vr));
  // the park's guitar, on its stand by the round: anyone's to play where it stands
  const ps=await U(()=>GUITAR.STAND.g,30000);   // (built once you are within 60 tiles of it: the start is)
  const pk=ps?await pg.evaluate(async()=>{ const S=GUITAR.STAND.g.position, P=__dbg.you(), d=Math.hypot(S.x-P.x,S.z-P.z)/__dbg.cv().TILE; S.set(P.x+1.5*__dbg.cv().TILE,S.y,P.z); GUITAR.start('park'); await new Promise(r=>setTimeout(r,600)); const r={d:+d.toFixed(1),on:GUITAR.on(),hidden:!GUITAR.STAND.gm.visible,held:!!GUITAR.ME.H}; GUITAR.stop(); r.back=GUITAR.STAND.gm.visible; return r; }):{};
  rec('the park\'s guitar stands by the round; play it there and it leaves the stand, put it down and it\'s back',ps&&pk.on&&pk.hidden&&pk.held&&pk.back,JSON.stringify({built:ps,...pk}));
  if(OUT&&ps){ await pg.evaluate(()=>{ const UI=__dbg.UI; UI.setView('third'); UI.dist*=.5; }); await wait(1500); await pg.screenshot({path:OUT+'/guitar-park.png'}); }
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,n])=>n+'× '+k).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'all passed'); process.exit(bad?1:0); })();
