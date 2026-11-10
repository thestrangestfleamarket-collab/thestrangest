// THE ROCK GOLEM (088a): the gem merchant stands at the Gem Stall, half again the dungeon golems' height, buys gems, sells the headlight, teaches GEMS and holds the gem ladder. Run: node tests/rockgolem.cjs [shot.png]
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:800,height:640}});
  const errs=[]; let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; }; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12',{timeout:300000}); await pg.waitForFunction(()=>window.__started,null,{timeout:400000});
  const up=await pg.waitForFunction(()=>window.ROCKGOLEMDBG&&window.GOLEMS&&GOLEMS.list.length,null,{timeout:120000}).then(()=>true).catch(()=>false); ok(up,'the rock golem is made after the start');
  const r=await pg.evaluate(()=>{ const D=ROCKGOLEMDBG(), T=__dbg.MAPK.BOD.XS(1)-__dbg.MAPK.BOD.XS(0), g=GOLEMS.list[0].N, s=PSTALLS.list.find(s=>s.key==='rock_golem');
    SHOPS.open({key:'rock_golem',name:'THE ROCK GOLEM'}); const open=!!SHOPS.cur; SHOPS.close(); const sc=CHARS.trade({key:'scuba_diver'})||{};
    return {D,ratio:D.H/(g.H/T),at:s?Math.hypot(D.x-s.S.home.x,D.z-s.S.home.z):99,open,tr:CHARS.trade({key:'rock_golem'}),teach:TRAINERS.of('rock_golem'),ask:TRAINERS.ask('gem'),sc}; });
  ok(Math.abs(r.ratio-1.5)<.05,'half again the dungeon golems\' height: '+r.ratio.toFixed(2));
  ok(r.at<.05&&r.D.vis&&r.D.lv==='up','stands at the Gem Stall: '+JSON.stringify(r.D));
  ok(r.open&&r.tr.buys.includes('gems')&&r.tr.sells.includes('headlight')&&r.tr.teaches.includes('gem'),'its shop buys gems, sells the headlight, teaches GEMS');
  ok(r.teach&&r.teach.skills.includes('gem')&&r.ask&&r.ask.item==='quartz','it holds the gem ladder');
  ok(!(r.sc.buys||[]).length&&!(r.sc.teaches||[]).length,'the Scuba Diver no longer trades gems');
  if(process.argv[2]){ await pg.evaluate(async()=>{ const D=ROCKGOLEMDBG(), s=PSTALLS.list.find(s=>s.key==='rock_golem'), f=s.S.face||{x:D.x,z:D.z+1}; let dx=f.x-D.x, dz=f.z-D.z; const l=Math.hypot(dx,dz)||1; dx/=l; dz/=l;
      __dbg.UI.goTo(D.x+dx*5+dz*1.2,D.z+dz*5-dx*1.2,'up'); await new Promise(r=>setTimeout(r,4000)); const a=Math.atan2(-dx,-dz); __dbg.setHd(a); __dbg.cam(a+Math.PI); __dbg.UI.setView('third');
      const st=document.createElement('style'); st.textContent='body>*{visibility:hidden!important}'; document.head.appendChild(st); __dbg.renderer.domElement.style.setProperty('visibility','visible','important'); await new Promise(r=>setTimeout(r,3000)); });
    await pg.screenshot({path:process.argv[2]}); }
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  await b.close(); console.log(bad?bad+' FAILED':'all rock golem checks passed'); process.exit(bad?1:0); })().catch(e=>{ console.error(e); process.exit(1); });
