// THE DATA CHECK (17 Oct 2026, after the physician game's validate_data: a headless run that checks the game's tables against each other):
// node tests/datacheck.cjs loads THE MARKET with the old scattered browser keys planted, and checks: the one save (src/save.js) wiped them (since v4)
// and reads back what it writes; every sound recipe (src/sfx.js) makes a finite buffer that isn't silent, and every sound the ambience names
// (src/ambience.js) is a recipe; every pool of lines (src/lines.js) has lines and every blank in them is one the game can fill, a pick
// never repeats the last fourteen while others fit, and a line said shows over the character and is logged; every place and room the menu
// jumps to stands on ground (UI.places); a lamp clicked, a seat sat on and a wave make no page error. Exits 1 if anything fails.
const {chromium}=require('playwright'), fs=require('fs');
// the code's references, checked against the tables before the page runs: every SFX.play('x') a recipe in sfx.js, every LINES.say(N,'x') a pool in lines.js
const SRC=fs.readdirSync('src').filter(f=>f.endsWith('.js')).map(f=>[f,fs.readFileSync('src/'+f,'utf8')]), one=n=>fs.readFileSync('src/'+fs.readdirSync('src').find(f=>new RegExp('^\\d{3}-'+n+'\\.js$').test(f)),'utf8'), sfxSrc=one('sfx'), linesSrc=one('lines');
const RECIPES=[...sfxSrc.matchAll(/^\s{4}(\w+):\{len:/gm)].map(m=>m[1]).concat(...['sfx','amb','fight'].map(f=>Object.keys(JSON.parse(fs.readFileSync('data/'+f+'.json','utf8'))))), POOLS=[...linesSrc.matchAll(/^\s{4}(\w+):\[/gm)].map(m=>m[1]);
const refs=[]; for(const [f,s] of SRC){ for(const m of s.matchAll(/SFX\.play\('(\w+)'/g))refs.push(['sound',m[1],f]); for(const m of s.matchAll(/LINES\.say\(\w+,'(\w+)'/g))refs.push(['pool',m[1],f]); }
// every sound file the page plays has a provenance record in data/full/sounds.json (runtime path, source, licence and its snapshot), and every record's files exist
const SND=(()=>{ const out=[], ext=/\.(mp3|ogg|wav|m4a|opus|webm)$/i, walk=d=>{ for(const f of fs.readdirSync(d)){ const p=d+'/'+f; if(fs.statSync(p).isDirectory()){ if(p!=='data/full')walk(p); } else if(ext.test(f))out.push(p); } }; walk('data'); for(const [f,s] of SRC)for(const m of s.matchAll(/__FILE__\("(data\/[^"]+\.(?:mp3|ogg|wav|m4a|opus|webm))"\)/g))out.push(m[1]); return [...new Set(out)]; })();
const PROV=JSON.parse(fs.readFileSync('data/full/sounds.json','utf8')).sounds;
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']}); const pg=await b.newPage({viewport:{width:900,height:620}});
  const errs={}; pg.on('pageerror',e=>{ const k=e.message+(process.env.STACK?' @ '+(e.stack||'').split('\n').slice(1,3).join(' '):''); errs[k]=(errs[k]||0)+1; });
  const url='file://'+process.cwd()+'/dist/market.html?hour=21&hideme=1';
  // the old keys planted before the page runs (a browser that played before this save existed)
  await pg.addInitScript(()=>{ if(!localStorage.getItem('market-save')&&!localStorage.getItem('planted')){ localStorage.setItem('planted','1'); localStorage.setItem('market-looks',JSON.stringify({name:'TESTER',sex:'M'})); localStorage.setItem('market-outline','1'); localStorage.setItem('market-grain','12'); localStorage.setItem('market-keys',JSON.stringify({v:'p'})); } });
  await pg.goto(url,{waitUntil:'commit',timeout:180000});
  let up=false; for(let i=0;i<300&&!(up=await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(1000);
  if(!up){ console.log('FAIL: the page never started',JSON.stringify(errs)); await b.close(); process.exit(1); }
  let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
  ok(RECIPES.length>=20&&POOLS.length>=5,'the tables read from the source: '+RECIPES.length+' recipes, '+POOLS.length+' pools');
  for(const [k,n,f] of refs)ok((k==='sound'?RECIPES:POOLS).includes(n),'the code\'s '+k+' '+n+' ('+f+') is in its table');
  for(const p of SND){ const r=PROV.find(r=>r.runtime===p); ok(!!r&&r.licence&&r.licence.url&&fs.existsSync(r.licence.snapshot)&&(r.source||r.made),'the sound file '+p+' has a provenance record with a licence and its snapshot'); }
  for(const r of PROV)ok(fs.existsSync(r.runtime),'the provenance record '+r.id+' names a file that exists');
  const r=await pg.evaluate(async()=>{ const out={}, {SAVE,SFX,AMB,LINES,LOOKS,OUTL,DITH,UI}=__dbg, groundY=__dbg.ground;
    // the save: the old keys gathered, read back as they were, a write read back, the version
    const S=SAVE.all(); out.save={v:S.v,V:SAVE.V,raw:JSON.parse(localStorage.getItem('market-save')||'{}'),left:Object.keys(localStorage).filter(k=>/^(market-|isowalk-)/.test(k)&&k!=='market-save')};
    SAVE.set('probe','x'); out.save.probe=JSON.parse(localStorage.getItem('market-save')).probe; SAVE.del('probe'); out.save.gone=SAVE.get('probe');
    out.name=LOOKS.L.name; out.dith=DITH; out.outl=OUTL.on;
    // the sounds: every recipe a finite, audible buffer; the ambience's names recipes
    const c=SFX.wake(); if(c&&c.state!=='running')await c.resume().catch(()=>{}); out.ctx=c&&c.state;
    out.sfx={}; for(const k of SFX.names()){ const B=SFX.buffer(k,c), D=B.getChannelData(0); let mx=0, fin=true; for(let i=0;i<D.length;i++){ const v=Math.abs(D[i]); if(!isFinite(v)){ fin=false; break; } if(v>mx)mx=v; } out.sfx[k]={n:D.length,mx:+mx.toFixed(3),fin,len:SFX.recipe(k).len}; }
    out.ambNames=[...new Set(Object.values(AMB.sets).flat().map(e=>e[0]))].filter(k=>!SFX.has(k));
    SFX.mix.fx.click=.5; SFX.saveMix(); out.mix=JSON.parse(JSON.parse(localStorage.getItem('market-save')).sndmix).fx.click; out.mixLvl=SFX.fxLevel('click'); SFX.resetMix(); out.mixReset=SFX.fxLevel('click'); { const d=document.body.appendChild(document.createElement('div')); __dbg.SNDED.panel(d); out.edRows=d.querySelectorAll('[data-pick]').length; out.edAll=SFX.all().length; d.remove(); }
    out.playing=!!SFX.play('click'); out.blipped=(SFX.blip(SFX.voiceOf('tester')),true);
    // the lines: pools, blanks, freshness, a line shown and logged
    out.pools={}; for(const k in LINES.pools){ const P=LINES.pools[k]; out.pools[k]={n:P.length,blanks:[...new Set(P.flatMap(s=>(s.match(/\{\{(\w+)\}\}/g)||[])))]}; }
    const seen=[]; for(let i=0;i<10;i++)seen.push(LINES.pick('greet',{name:'TESTER'})); out.repeats=seen.length-new Set(seen).size; out.unfilled=seen.filter(s=>/\{\{/.test(s)).length; out.recentN=LINES.recent().length;
    const N=__dbg.NPCS.find(n=>n.lv==='up'&&!n.far&&n.g.visible)||__dbg.NPCS[0]; out.said=LINES.say(N,'greet'); out.spk=LINES.speaking(); out.logN=LINES.log.length; out.logWho=LINES.log[LINES.log.length-1].who;
    // the places: each on ground
    out.places=UI.places().map(([n,x,z,lv])=>{ let g=null; try{ g=groundY(x,z); }catch(e){ g='ERR '+e.message; } return [n,typeof g==='number'&&isFinite(g)]; });
    // using things: a lamp, a seat, the wave (their sounds and the lines ran, no error)
    try{ const th=UI.things.find(t=>t.npc); if(th){ th.act(); LINES.say(th.npc,'greet'); } out.waved=!!th; }catch(e){ out.waveErr=e.message; }
    return out; });
  ok(r.save.v===r.save.V&&r.save.raw.v===r.save.V&&r.save.V>=5,'the save is the current version ('+r.save.V+') under market-save');
  ok(!r.save.raw.looks&&!r.save.raw.outline&&!r.save.raw.grain&&!r.save.raw.keys&&r.name!=='TESTER','the old scattered keys planted before the start are not read (not gathered since v4; a save from before v4 wipes them): left '+r.save.left.join(' '));
  ok(r.save.probe==='x'&&r.save.gone===null,'a write goes to the one key at once and a delete takes it out');
  console.log('audio context: '+r.ctx);
  for(const k in r.sfx){ const s=r.sfx[k]; ok(s.fin&&s.mx>.02&&s.mx<=1.01&&s.n>0,'sound '+k+': '+s.len+' s, peak '+s.mx); }
  ok(r.ambNames.length===0,'every ambience sound is a recipe or a recording'+(r.ambNames.length?' (missing '+r.ambNames.join(', ')+')':''));
  ok(r.playing||r.ctx!=='running','a sound plays when the context runs');
  ok(r.mix===.5&&r.mixLvl===.5&&r.mixReset===1,'the sound mix\'s level is saved, used and reset ('+r.mix+', '+r.mixLvl+', '+r.mixReset+')');
  ok(r.edRows>=24&&r.edRows===r.edAll,'the sound editor (ADMIN) lists every sound ('+r.edRows+' of '+r.edAll+')');
  for(const k in r.pools){ const p=r.pools[k], min=/^gd:/.test(k)?2:5; ok(p.n>=min&&p.blanks.every(b=>b==='{{name}}'),'lines '+k+': '+p.n+' lines (at least '+min+'), blanks '+(p.blanks.join(' ')||'none')); }   // a guardian's own two lines (data/guardians.json) are a pool too; the shared pools keep five
  ok(r.repeats===0&&r.unfilled===0,'ten picks from greet: no repeat, no blank left ('+r.repeats+' repeats, '+r.unfilled+' unfilled)');
  ok(r.recentN<=14,'the recent list holds at most 14 ('+r.recentN+')');
  ok(r.said&&r.spk>=1&&r.logN>=1&&r.logWho,'a line said shows over '+r.logWho+' and is logged: "'+r.said+'"');
  for(const [n,g] of r.places)ok(g,'place '+n+' stands on ground');
  ok(r.waved&&!r.waveErr,'a wave at a character runs'+(r.waveErr?': '+r.waveErr:''));
  await pg.waitForTimeout(2500);
  const after=await pg.evaluate(()=>({spk:__dbg.LINES.speaking(),labels:document.querySelectorAll('.said2').length}));
  ok(after.labels<=3,'labels on screen at most 3 ('+after.labels+')');
  const E=Object.keys(errs); ok(E.length===0,'no page errors'+(E.length?': '+E.join(' | '):''));
  await b.close(); console.log(bad?'FAILED '+bad:'ALL OK'); process.exit(bad?1:0); })();
