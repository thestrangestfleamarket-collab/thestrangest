// THE FISH MARKET (owner, 9 Nov 2026): it stands east of the way through, its stalls open their wholesalers' shops (they buy fish and pay over the usual), its workers are at their posts, its roofs and the highway are not drawn over you in the overhead view, and you can walk its street.
// Run: node tests/fishmarket.cjs   (slow in a cloud container: software rendering)
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:640,height:360}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  const WJ=JSON.parse(require('fs').readFileSync(process.cwd()+'/data/world.json','utf8')), F=WJ.places.find(p=>p.id==='fishmarket'), O=WJ.block.origin, at=(x,y)=>[((x-O[0])*1.13).toFixed(2),((y-O[1])*1.13).toFixed(2)];
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=9&at='+at(F.stalls[0].x,F.y0-3).join(',')); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(15000);
  const d=await pg.evaluate(()=>FISHDBGM()); ok(d.made&&d.tris>5000&&d.tris<40000,'the market is built ('+d.tris+' triangles)'); ok(d.stalls.length===F.stalls.length&&d.things===d.stalls.length,'a counter to use at each of its '+d.stalls.length+' stalls'); ok(d.boards>=15,'its painted boards ('+d.boards+')');
  const s=await pg.evaluate(()=>{ const U=__dbg.ui(), T=U.things.find(t=>/SELL YOUR CATCH/.test(t.name||'')); INV.items.x_perch=3; SHOPS.open({key:'fm_bluewater',name:'BLUEWATER FISH CO.'}); const el=document.getElementById('shopg'), txt=el&&!el.hidden?el.innerText:'', pays=+((txt.match(/WHITE PERCH[^$]*\$(\d+)/)||[])[1]||0);
    SHOPS.close(); SHOPS.open({key:'fisherman_in_waders',name:'x'}); const t2=el&&!el.hidden?el.innerText:'', usual=+((t2.match(/WHITE PERCH[^$]*\$(\d+)/)||[])[1]||0); SHOPS.close(); delete INV.items.x_perch; return {thing:!!T,sells:/FLOUNDER/.test(txt),buys:/THEY BUY/.test(txt),pays,usual}; });
  ok(s.thing&&s.sells&&s.buys,'a stall sells fish and buys your catch'); ok(s.pays>s.usual&&s.usual>0,'a wholesaler pays more than the tackle shop ($'+s.pays+' against $'+s.usual+')');
  await pg.waitForTimeout(8000);
  const w=await pg.evaluate(()=>CREW.list.filter(c=>['hanga_roa_fisherman','trucker','railway_carter'].includes(c.key)).map(c=>[c.key,c.N.st.x/1.13,c.N.g.visible])); ok(w.length===3&&w.every(q=>q[2]&&q[1]+O[0]>F.x0-2&&q[1]+O[0]<F.x1+2),'the fishmonger, the trucker and the journeyman are on the market ('+w.map(q=>q[0]).join(', ')+')');
  const t=await pg.evaluate(async()=>{ const U=__dbg.ui(), raf=()=>new Promise(r=>requestAnimationFrame(r)), top=()=>Object.values(FISHMKT.tops).map(t=>t.on); U.setView('iso'); for(let i=0;i<6;i++)await raf(); const iso=top(); U.setView('third'); for(let i=0;i<6;i++)await raf(); return {iso,third:top()}; });
  ok(t.iso.some(v=>v===false)&&t.third.every(v=>v===true),'under the highway its deck is not drawn in the overhead view, and is in third person');
  await pg.evaluate(()=>{ if(document.activeElement&&document.activeElement.blur)document.activeElement.blur(); }); await pg.mouse.click(320,60);
  let far=0; for(const k of ['w','d']){ const p0=await pg.evaluate(()=>__dbg.pos()); await pg.keyboard.down(k); await pg.waitForTimeout(2500); await pg.keyboard.up(k); const p1=await pg.evaluate(()=>__dbg.pos()); far=Math.max(far,Math.hypot(p1[0]-p0[0],p1[2]-p0[2])); }
  ok(far>.2,'you can walk the street under the highway ('+far.toFixed(1)+')');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all fish market checks passed'); await b.close(); process.exit(bad?1:0); })();
