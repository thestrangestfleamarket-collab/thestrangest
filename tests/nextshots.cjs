// NEXT SHOTS (19 Oct 2026): node tests/nextshots.cjs <out dir>: Market St from above, the apartment house front, lobby and roof,
// the arcade with the holodeck booth, the Hudson before and after its far part loads, and the frog's state; page errors in report.json.
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'nextout', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={};
const fin=()=>{ rep.errors=errs.slice(0,40); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,4000)); };
process.on('unhandledRejection',e=>{ errs.push('TEST '+String(e&&e.message||e).slice(0,400)); fin(); process.exit(1); });
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; }
  await pg.waitForTimeout(5000);
  const shot=async(n,f,w=5000)=>{ try{ if(f)await pg.evaluate(f); await pg.waitForTimeout(w); await pg.screenshot({path:path.join(OUT,n+'.png')}); }catch(e){ errs.push(n+': '+e.message.slice(0,200)); } };
  const A=()=>{ const M=__dbg.MAPK, a=M.MODS.apts.A; return {a,X:M.BOD.X,Z:M.BOD.Z}; };
  await shot('apts-front',()=>{ const {a,X,Z}=(()=>{ const M=__dbg.MAPK, a=M.MODS.apts.A; return {a,X:M.BOD.X,Z:M.BOD.Z}; })(); const B=__dbg.MAPK.BOD; STORE.goTo(X((a.x0+a.x1)/2),B.ZS((B.CURB+B.FAR)/2),'up'); });
  await pg.mouse.move(480,270); for(let i=0;i<8;i++){ await pg.mouse.wheel(0,600); await pg.waitForTimeout(150); }
  await shot('street-wide',null,4000);
  for(let i=0;i<8;i++){ await pg.mouse.wheel(0,-600); await pg.waitForTimeout(150); }
  await shot('apts-lobby',()=>{ const M=__dbg.MAPK, a=M.MODS.apts.A; STORE.goTo(M.BOD.X((a.x0+a.x1)/2),M.BOD.Z(a.y0+(a.y1-a.y0)*.6),'up'); });
  rep.elv=await pg.evaluate(()=>window.ELVDBG&&ELVDBG());
  await shot('apts-back',()=>{ const M=__dbg.MAPK, a=M.MODS.apts.A, z0=M.BOD.Z(a.y0), z1=M.BOD.Z(a.y1), zb=Math.abs(z0-M.BOD.ZS((M.BOD.CURB+M.BOD.FAR)/2))>Math.abs(z1-M.BOD.ZS((M.BOD.CURB+M.BOD.FAR)/2))?z0:z1; STORE.goTo(M.BOD.X((a.x0+a.x1)/2),zb+(zb>(z0+z1)/2?3:-3)*(M.BOD.ZS(1)-M.BOD.ZS(0)),'up'); });
  await shot('arcade-in',()=>{ const d=(STORE.main.doors||[]).find(q=>/ARCADE/.test(q[0])); if(d)return STORE.enter('arcade',true); });
  rep.places=await pg.evaluate(()=>(STORE.main.doors||[]).map(d=>[d[0],+d[1].toFixed(1)]));
  await shot('hudson-near',()=>{ const M=__dbg.MAPK, rv=M.RING.river, z=Math.max(M.BOD.ZS(rv.y0),M.BOD.ZS(rv.y1)), x=M.BOD.XS((M.LAY&&0)||100); STORE.goTo(x,z+1.5*(M.BOD.ZS(1)-M.BOD.ZS(0))*Math.sign(M.BOD.ZS(1)-M.BOD.ZS(0)),'up'); });
  rep.river0=await pg.evaluate(()=>({deep:!!(window.RIVER&&RIVER.deep)}));
  await shot('hudson-far',async()=>{ const R=window.RIVER; if(R&&R.load)await R.load(); },6000);
  rep.river1=await pg.evaluate(()=>({deep:!!(window.RIVER&&RIVER.deep)}));
  rep.frog=await pg.evaluate(()=>{ const N=__dbg.npcs().find(n=>n.key==='scooterfrog'); return N&&{x:N.st.x,z:N.st.z,to:N.st.to,wait:N.st.wait,hold:N.st.hold,far:N.far,mode:N.mode,life:!!N.life,free:N.st.to?N.free(N.st.to.x,N.st.to.z,N.st.R):null,freeHere:N.free(N.st.x,N.st.z,N.st.R)}; });
  fin(); await b.close(); })();
