// STRICT HITBOXES' CHECK (owner, 17 Oct 2026: "we need to avoid clipping. all objects and characters need hitboxes. strictly"): node tests/clipcheck.cjs
// loads THE MARKET, finishes the stacked rooms, and lists (CLIP.audit, src/clip.js) every thing standing knee to chest high on a floor whose faces
// no solid holds, and every character standing in a solid or in another; once at the start and again after the street has walked a while.
// Prints what the load's pass found and made solid, and who it moved; exits 1 if anything's left
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:640,height:420}});
  const errs={}, warns=[]; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; }); pg.on('console',m=>{ if(/^CLIP/.test(m.text()))warns.push(m.text()); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=21&hideme=1',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<120&&!(await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(1000);
  await pg.evaluate(()=>STORE.ensure()); await pg.waitForTimeout(8000);
  const a=await pg.evaluate(()=>CLIP.audit());
  console.log('the load\'s pass: '+a.found.length+' things had faces no solid held; '+a.added+' boxes added in '+a.ms+' ms');
  for(const f of a.found)console.log('  was open: '+f.id+' '+JSON.stringify(f.name)+' ('+f.lvl+') '+f.miss+'/'+f.of+' samples');
  console.log('moved at load: '+a.moved.length); for(const w of warns)console.log('  '+w);
  await pg.waitForTimeout(25000); const a2=await pg.evaluate(()=>CLIP.audit());
  let bad=0; for(const [k,r] of [['at the start',a],['after walking',a2]]){ console.log(k+': checked '+r.checked.things+' things, '+r.checked.chars+' characters');
    for(const t of r.things){ bad++; console.log('  THING WITHOUT A SOLID '+t.id+' '+JSON.stringify(t.name)+' '+t.miss+'/'+t.of); }
    for(const c of r.chars){ bad++; console.log('  CHARACTER CLIPPING '+c.key+' at '+c.at+' R '+c.R+(c.solid?' in solid '+c.solid:'')+(c.other?' in '+c.other:'')); } }
  console.log('page errors',JSON.stringify(errs)); console.log(bad?'FAIL: '+bad:'PASS'); await b.close(); process.exit(bad?1:0); })();
