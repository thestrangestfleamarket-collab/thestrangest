// STRICT HITBOXES' CHECK (owner, 17 Oct 2026: "we need to avoid clipping. all objects and characters need hitboxes. strictly"): node tests/clipcheck.cjs
// loads THE MARKET, finishes the stacked rooms, and lists (CLIP.audit, src/clip.js) every thing standing knee to chest high on a floor whose faces
// no solid holds, every character standing in a solid or in another, and every spot you could reach before the pass and can't after (a way closed);
// at the start, then every three seconds over half a minute of the street walking (the goldfish and the mushroom seller watched as a pair: the
// owner's screenshot of the one inside the other). Prints what the load's pass found and made solid, and who it moved; exits 1 if anything's left
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:900,height:620}});
  const errs={}, warns=[]; pg.on('pageerror',e=>{ errs[e.message]=(errs[e.message]||0)+1; }); pg.on('framenavigated',f=>{ if(f===pg.mainFrame())console.log('(page loaded)'); }); pg.on('console',m=>{ if(/^CLIP/.test(m.text()))warns.push(m.text()); });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=21&hideme=1',{waitUntil:'commit',timeout:180000});
  let up=false; for(let i=0;i<300&&!(up=await pg.evaluate(()=>!!window.__started&&!!window.CLIP).catch(()=>false));i++)await pg.waitForTimeout(1000);
  if(!up){ console.log('FAIL: the page never started',JSON.stringify(errs)); await b.close(); process.exit(1); }
  await pg.evaluate(()=>STORE.ensure()); await pg.waitForTimeout(8000);
  const a=await pg.evaluate(()=>{ const r=CLIP.audit(), T=__dbg.cv().TILE; r.blocked=STORE.rooms.filter(R=>r.closed.some(c=>Math.hypot(c[1]-R.at.x,c[2]-R.at.z)<2*T)).map(R=>R.name); return r; });
  console.log('the load\'s pass: '+a.found.length+' things had faces no solid held; '+a.added+' boxes added in '+a.ms+' ms');
  for(const f of a.found)console.log('  was open: '+f.id+' '+JSON.stringify(f.name)+' ('+f.lvl+') '+f.miss+'/'+f.of+' samples');
  console.log('moved at load: '+a.moved.length); for(const w of warns)console.log('  '+w);
  let bad=0; const report=(k,r)=>{ console.log(k+': checked '+r.checked.things+' things, '+r.checked.chars+' characters');
    for(const t of r.things){ bad++; console.log('  THING WITHOUT A SOLID '+t.id+' '+JSON.stringify(t.name)+' '+t.miss+'/'+t.of); }
    for(const c of r.chars){ bad++; console.log('  CHARACTER CLIPPING '+c.key+' at '+c.at+' R '+c.R+(c.solid?' in solid '+c.solid:'')+(c.other?' in '+c.other:'')); }
    // (a spot reached before only through a thing now solid: a note, listed for a look (a pocket between chairs, a corner behind a table, a garden
    // walled all round); a way in closed fails: one within two tiles of a room's door spot (the menu takes you there))
    if(r.blocked&&r.blocked.length){ bad++; console.log('  DOOR CLOSED near '+JSON.stringify(r.blocked)); }
    if(r.closed.length){ const by={}; for(const c of r.closed)(by[c[3]]=by[c[3]]||[]).push(c.slice(0,3)); console.log('  note, cut off now (reached before only through what is now solid): '+r.closed.length+' spots'); for(const k in by){ const L=by[k], cl={}; for(const [lv,x,z] of L){ const q=lv+' '+Math.round(x/6)*6+','+Math.round(z/6)*6; (cl[q]=cl[q]||[]).push([x,z]); }   // (where: each six-unit patch, its spots' extent)
      console.log('    by '+(k||'nothing near (cut off behind)')+': '+L.length+' in '+Object.entries(cl).map(([q,P])=>q+' ['+[Math.min(...P.map(p=>p[0])),Math.min(...P.map(p=>p[1])),Math.max(...P.map(p=>p[0])),Math.max(...P.map(p=>p[1]))].map(v=>v.toFixed(1))+'] '+P.length).join('; ')); } } };
  report('at the start',a);
  // the street walking: the characters near the camera move (the far ones are frozen, the budget's rule), so the view is put on the pair
  const pair=()=>pg.evaluate(()=>{ const N=__dbg.NPCS, f=N.find(n=>n.key==='fish'), m=N.find(n=>n.key==='mushroom'); if(!f||!m)return null;
    return {d:+Math.hypot(f.st.x-m.st.x,f.st.z-m.st.z).toFixed(2),R:+(f.st.R+m.st.R).toFixed(2),fish:[+f.st.x.toFixed(1),+f.st.z.toFixed(1)],mush:[+m.st.x.toFixed(1),+m.st.z.toFixed(1)],far:[!!f.far,!!m.far]}; });
  let minGap=1e9, walked=0;
  // (the pair sent at each other: the mushroom seller stood three tiles along the street from the goldfish, each told to walk to where the other is, again every three seconds)
  await pg.evaluate(()=>{ const N=__dbg.NPCS, f=N.find(n=>n.key==='fish'), m=N.find(n=>n.key==='mushroom'); const T=__dbg.cv().TILE; if(f&&m){ for(let k=1.6;k<12;k+=.2){ const x=f.st.x+k*T; if(f.free(x,f.st.z,m.st.R)){ m.st.x=x; m.st.z=f.st.z; m.home=null; break; } } } });
  for(let t=0;t<10;t++){ await pg.evaluate(()=>{ const N=__dbg.NPCS, f=N.find(n=>n.key==='fish'), m=N.find(n=>n.key==='mushroom'); if(f&&m){ __dbg.UI.setFree(true); __dbg.UI.camT.set(f.st.x,1,f.st.z); f.st.to={x:m.st.x,z:m.st.z}; m.st.to={x:f.st.x,z:f.st.z}; f.st.wait=m.st.wait=0; } });
    await pg.waitForTimeout(3000); const r=await pg.evaluate(()=>{ const x=CLIP.audit(); x.things=[]; x.closed=[]; return x; }), p=await pair();
    if(p){ minGap=Math.min(minGap,p.d-p.R); console.log('  t+'+(t+1)*3+'s goldfish '+p.fish+' mushroom seller '+p.mush+' apart '+p.d+' (their radii '+p.R+')'+(p.far[0]||p.far[1]?' (one frozen far)':'')); }
    if(r.chars.length)report('walking, t+'+(t+1)*3+'s',r); walked++; }
  console.log('goldfish and mushroom seller: closest '+minGap.toFixed(2)+' beyond touching'+(minGap<-.01?' : OVERLAP':''));
  if(minGap<-.01)bad++;
  console.log('page errors',JSON.stringify(errs)); console.log(bad?'FAIL: '+bad:'PASS'); await b.close(); process.exit(bad?1:0); })();
