// THE SPIDERS CHECK: node tests/spiders.cjs [dist/market.html]. In the dungeon (its monsters the shared sim's, worker/dunmobs.js) a radioactive spider strikes on its Attack clip (the bite lands mid-strike), flinches on Hit and dies on its Death clip, then is gone.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:800,height:500}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/'+(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000});
  const r=await pg.evaluate(async()=>{ const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(250))if(f())return true; return false; };
    FORAGE.buff('invis',900); await DUNGEON.go(5); await U(()=>window.DUNMOBS&&DUNMOBS.MS.g,120000);   // unseen: the spider leaves you be while it is put through its moves
    let sp=null; const T0=__dbg.cv().TILE; for(let k=0;k<6&&!sp;k++){ const m=DUNMOBS.MS.m.find(q=>q.kind==='p'&&!q.dead); if(!m)break; __dbg.UI.goTo(m.x+1.5*T0,m.z,'down'); await U(()=>window.DUNSPI&&DUNSPI().some(r=>r.on),60000); sp=window.DUNSPI&&DUNSPI().find(r=>r.on); }
    if(!sp)return {err:'no spider came'}; const N=sp.N, A=n=>N.mixer._actions.find(a=>a.getClip().name===n), out={}, T=__dbg.cv().TILE;
    __dbg.UI.goTo(N.st.x+1.5*T,N.st.z,'down'); await wait(3000);
    let hits=0; sp.cool=99; sp.lunge={t:-2,hit:()=>hits++}; await U(()=>N.clip==='Spider_Attack'&&A('Spider_Attack')&&A('Spider_Attack').getEffectiveWeight()>.5,20000);
    out.attack={clip:N.clip,once:!!A('Spider_Attack')&&A('Spider_Attack').loop===2200}; await U(()=>!sp.lunge,20000); out.attack.hits=hits;
    sp.jolt=.6; await U(()=>N.clip==='Spider_Hit',20000); out.hit=N.clip==='Spider_Hit';
    sp.dead=true; sp.t=0; await U(()=>N.clip==='Spider_Death',20000); out.death=N.clip==='Spider_Death'; await U(()=>!sp.on,90000); out.gone=!sp.on;
    await DUNGEON.go(0); return out; });
  ok(r.attack&&r.attack.clip==='Spider_Attack'&&r.attack.once&&r.attack.hits===1,'a spider strikes on its Attack clip, once, and its bite lands once: '+JSON.stringify(r));
  ok(r.hit,'struck, it flinches on its Hit clip');
  ok(r.death&&r.gone,'killed, it dies on its Death clip and is gone after');
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs[0].slice(0,200):''));
  await b.close(); process.exit(bad?1:0); })();
