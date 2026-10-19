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
  rep.mouth=await pg.evaluate(()=>{ const M=__dbg.MAPK, P=M.PARK, BK=P.brook, r=v=>+v.toFixed(2); const H=P.wetHole?P.wetHole():[]; return {m:BK.m,kM:BK.kM,sW:BK.sW,sK:BK.sK,C0:BK.C[0].map(r),CM:BK.C[BK.kM||0].map(r),holes:H.map(h=>h.length),W:[0,5,10,15,20].map(s=>r(BK.W(s))),L:[0,5,8,10,12,15,20].map(s=>r(BK.L(s))),
    prof:BK.C.slice(0,(BK.kM||0)+30).filter((c,i)=>i%3===0).map(c=>{ const x=M.BOD.XS(c[0]+(P.ox||0)), z=M.BOD.ZS(c[1]+(P.oy||0)); return [r(c[2]),r(HILL(x,z)),+FOUNT.lake(c[0],c[1]).toFixed(1),FOUNT.wet(x,z,0)?1:0]; }),camp:P.campAt(),fountTris:FOUNT.tris,brookTris:BROOK.tris&&BROOK.tris()}; });
  const go=async(k,dx=0,dy=0)=>pg.evaluate(([k,dx,dy])=>{ const M=__dbg.MAPK, P=M.PARK, BK=P.brook, c=BK.C[Math.max(0,Math.min(BK.N,k))]; STORE.goTo(M.BOD.XS(c[0]+dx+(P.ox||0)),M.BOD.ZS(c[1]+dy+(P.oy||0)),'up'); },[k,dx,dy]);
  const kM=rep.mouth.kM||0;
  const kv=kM||20; await zoom(600,10);
  await go(kv+4); await shot('outlet-iso-a0',null,6000);
  for(const n of [1,2,3]){ await pg.keyboard.press('q'); await shot('outlet-iso-q'+n,null,4000); }
  await go(kv+4,-3,3); await shot('outlet-iso-q3b',null,4000); await go(kv+2,3,-2); await shot('outlet-iso-q3c',null,4000);
  await go(99999); await shot('end-iso-q3',null,5000); await pg.keyboard.press('q'); await shot('end-iso-a0',null,4000);
  rep.atMouth=await pg.evaluate(k=>{ const M=__dbg.MAPK, P=M.PARK, c=P.brook.C[k]; STORE.goTo(M.BOD.XS(c[0]),M.BOD.ZS(c[1]),'up'); return 1; },kv);
  await pg.waitForTimeout(2000); rep.atMouth=await pg.evaluate(()=>{ const y=__dbg.you(); return {y:+y.y.toFixed(3),over:!!BROOK.over,wade:!!BROOK.wade,wet:FOUNT.wet(y.x,y.z,1)}; });
  fin(); await b.close(); })();
