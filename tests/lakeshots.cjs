const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'lakeout', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={};
const fin=()=>{ rep.errors=errs.slice(0,40); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,3000)); };
process.on('unhandledRejection',e=>{ errs.push('TEST '+String(e&&e.message||e).slice(0,400)); fin(); process.exit(1); });
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error'||/BROOK|FOUNT|land/.test(m.text()))errs.push(m.type()+' '+m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13&wx=CLEAR&hideme=1',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; }
  await pg.waitForTimeout(5000); await pg.evaluate(()=>window.DN&&DN.set&&DN.set('day'));
  for(let i=0;i<60;i++){ if(await pg.evaluate(()=>!!(window.BROOK&&BROOK.ready&&window.FOUNT&&FOUNT.ready)))break; await pg.waitForTimeout(1000); }
  const shot=async(n,f,w=5000)=>{ try{ if(f)await pg.evaluate(f); await pg.waitForTimeout(w); await pg.screenshot({path:path.join(OUT,n+'.png')}); }catch(e){ errs.push(n+': '+e.message.slice(0,200)); } };
  const zoom=async(d,n)=>{ await pg.mouse.move(480,270); for(let i=0;i<n;i++){ await pg.mouse.wheel(0,d); await pg.waitForTimeout(150); } };
  rep.dump=await pg.evaluate(()=>{ const M=__dbg.MAPK, P=M.PARK, S=FOUNT.S, BK=P.brook, r=v=>+v.toFixed(2); return {x0:P.x0,x1:P.x1,y0:P.y0,y1:P.y1,round:P.round,ox:P.ox,oy:P.oy,L:S.L,C:S.C,R:S.R,poly:S.poly.filter((p,i)=>i%6===0).map(p=>p.map(r)),C0:BK.C[0],CN:BK.C[BK.N],SL:BK.SL,N:BK.N,mouth:BK.m,W0:BK.W(0),LV:FOUNT.LV,T:M.BOD.XS(1)-M.BOD.XS(0)}; });
  const at=(s,dx=0,dy=0)=>({s,dx,dy});
  const go=async o=>pg.evaluate(o=>{ const M=__dbg.MAPK, P=M.PARK, BK=P.brook, k=Math.max(0,Math.min(BK.N,Math.round(o.s/BK.SL*BK.N))), c=BK.C[k]; STORE.goTo(M.BOD.XS(c[0]+o.dx+(P.ox||0)),M.BOD.ZS(c[1]+o.dy+(P.oy||0)),'up'); },o);
  const m0=await pg.evaluate(()=>{ const BK=__dbg.MAPK.PARK.brook; return BK.m||0; });
  await go(at(m0)); await shot('outlet-iso',null,6000);
  rep.atMouth=await pg.evaluate(()=>{ const y=__dbg.you(); return {y:+y.y.toFixed(3),over:!!BROOK.over,wet:FOUNT.wet(y.x,y.z,1)}; });
  await zoom(-400,4); await shot('outlet-close',null,3000); await zoom(600,10); await shot('outlet-wide',null,4000); await zoom(-600,6);
  await pg.keyboard.press('v'); await shot('outlet-behind',()=>{ const M=__dbg.MAPK, P=M.PARK, BK=P.brook, k=Math.round((BK.m||0)/BK.SL*BK.N)+16, a=BK.C[k], b=BK.C[Math.max(0,k-24)]; STORE.goTo(M.BOD.XS(a[0]+(P.ox||0)),M.BOD.ZS(a[1]+(P.oy||0)),'up'); const dx=M.BOD.XS(b[0])-M.BOD.XS(a[0]), dz=M.BOD.ZS(b[1])-M.BOD.ZS(a[1]); __dbg.face(Math.atan2(dx,dz)); },5000);
  rep.walk=await pg.evaluate(async()=>{ const out=[]; for(let i=0;i<10;i++){ const y=__dbg.you(); out.push([+y.x.toFixed(1),+y.z.toFixed(1),+y.y.toFixed(3),BROOK.over?1:0,BROOK.wade?1:0,FOUNT.swim?1:0]); await new Promise(r=>setTimeout(r,400)); } return out; });
  await pg.keyboard.down('w'); await pg.waitForTimeout(3500); await pg.keyboard.up('w'); await shot('outlet-walked',null,1500);
  rep.walked=await pg.evaluate(()=>{ const y=__dbg.you(); return {y:+y.y.toFixed(3),over:!!BROOK.over,wade:!!BROOK.wade,swim:!!FOUNT.swim}; });
  await pg.keyboard.press('v'); await pg.keyboard.press('v');
  await go(at(1e9)); await shot('end-iso',null,6000); await zoom(600,10); await shot('end-wide',null,4000); await zoom(-600,10);
  await go(at(0,0,0)); await shot('spring-iso',null,5000);
  fin(); await b.close(); })();
