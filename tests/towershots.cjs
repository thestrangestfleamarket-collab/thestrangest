const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'out', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={};
const fin=()=>{ rep.errors=errs.slice(0,40); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,4000)); };
process.on('unhandledRejection',e=>{ errs.push('TEST '+String(e&&e.message||e).slice(0,400)); fin(); process.exit(1); });
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error'||/TOWER/.test(m.text()))errs.push(m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; }
  await pg.waitForTimeout(5000); await pg.evaluate(()=>window.DN&&DN.set&&DN.set('day'));
  const shot=async(n,f,w=4000)=>{ try{ if(f)await pg.evaluate(f); await pg.waitForTimeout(w); await pg.screenshot({path:path.join(OUT,n+'.png')}); if(/^(sq|wave)/.test(n))await pg.screenshot({path:path.join(OUT,n+'-zoom.png'),clip:{x:330,y:170,width:300,height:170}}); rep[n]=await pg.evaluate(()=>window.SQDBG&&SQDBG()); }catch(e){ errs.push(n+': '+e.message.slice(0,200)); } };
  const go=(dx,dz)=>`(()=>{ const s=GTOWER.site(), T=window.TILE||(__dbg.cv().TILE); STORE.goTo(s.x+${dx}*T,s.z+${dz}*T,'up'); })()`;
  for(let i=0;i<20;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>window.GTOWER&&GTOWER.ready))break; }
  await shot('tower-iso',go(2.5,4),6000);
  const look=(k,yo,z)=>pg.evaluate(([k,yo,z])=>{ const s=GTOWER.site(), N=SQUIRREL.N, p=k==='sq'?{x:N.g.position.x,y:N.g.position.y+N.H*.5,z:N.g.position.z}:{x:s.x,y:s.top*yo,z:s.z}; LOOKAT(p.x,p.z,z,p.y); },[k,yo,z]);
  await look('tw',.55,.8); await shot('tower-whole',null,3000);
  await pg.keyboard.press('e'); await shot('tower-turned',null,3000); await pg.keyboard.press('e'); await shot('tower-back',null,3000); await pg.keyboard.press('q'); await pg.keyboard.press('q'); await pg.waitForTimeout(1500);
  await look('tw',1,2); await shot('roof',null,3000);
  rep.tdbg=[];
  for(let i=0;i<4;i++){ await look('sq',0,3.5); await shot('sq-'+i,null,6000); }
  await pg.evaluate(()=>{ const G=GTOWER.ring(), r=G.RI-.36, N=SQUIRREL.N; N.mode='post'; N.li=3; N.st.x=G.X(G.cx); N.st.z=G.Z(G.cy+r); SQUIRREL.A.act=''; N.tT=30; }); await pg.waitForTimeout(1500);
  await look('sq',0,3.5); await shot('sq-front',null,1500); await shot('sq-scan',()=>{ SQUIRREL.N.mode='post'; SQUIRREL.A.act='scan'; SQUIRREL.A.t=0; SQUIRREL.N.aT=6; SQUIRREL.N.tT=20; },1800);
  await shot('sq-salute',()=>{ SQUIRREL.A.act='salute'; SQUIRREL.A.t=0; SQUIRREL.N.aT=3; },700);
  await shot('sq-walk',()=>{ SQUIRREL.A.act=''; SQUIRREL.N.tT=0; },2500);
  await pg.waitForTimeout(3000); await pg.evaluate(()=>{ __dbg.UI.setFree(false); }); await pg.evaluate(go(2,3.5)); await pg.waitForTimeout(2500);
  await pg.keyboard.press('b'); await pg.waitForTimeout(100); await look('sq',0,2.2); rep.up=await pg.evaluate(()=>__rigst().up&&__rigst().up.name);
  await shot('wave-1',null,500); await shot('wave-2',null,600);
  rep.upTrace=await pg.evaluate(async()=>{ const o=[]; for(let i=0;i<12;i++){ const u=__rigst().up; o.push((u?u.name+':'+u.t.toFixed(2)+':'+u.held:'-')+'|'+SQUIRREL.N.mode+':'+(SQUIRREL.N.wT||0).toFixed(2)); await new Promise(r=>setTimeout(r,500)); } return o; });
  await shot('wave-after',null,1000);
  await look('tw',.55,.8); await shot('night',()=>DN.set('night'),3000);
  await pg.evaluate(()=>{ DN.set('day'); __dbg.setRes(8); const G=GTOWER.ring(), r=G.RI-.36, N=SQUIRREL.N; N.mode='post'; N.li=3; N.st.x=G.X(G.cx); N.st.z=G.Z(G.cy+r); SQUIRREL.A.act=''; N.tT=60; N.aT=60; }); await pg.waitForTimeout(2500);
  for(const [n,f] of [['c-idle',()=>{ SQUIRREL.A.act=''; }],['c-scan',()=>{ SQUIRREL.A.act='scan'; SQUIRREL.A.t=0; SQUIRREL.N.aT=60; }],['c-salute',()=>{ SQUIRREL.A.act='salute'; SQUIRREL.A.t=0; SQUIRREL.N.aT=60; }],['c-wave',()=>{ SQUIRREL.N.mode='wave'; SQUIRREL.N.wT=60; SQUIRREL.A.act='wave'; }]]){
    await look('sq',0,7); await pg.evaluate(f); await pg.waitForTimeout(1500); await pg.screenshot({path:path.join(OUT,n+'.png'),clip:{x:280,y:110,width:400,height:260}}); rep[n]=await pg.evaluate(()=>{ const B=SQUIRREL.N.B; return ['armL','armR','head'].map(k=>[k,+B[k].rotation.x.toFixed(2),+B[k].rotation.y.toFixed(2),+B[k].rotation.z.toFixed(2)]); }); }
  rep.tris=await pg.evaluate(()=>__dbg.tris());
  fin(); await b.close(); })();
