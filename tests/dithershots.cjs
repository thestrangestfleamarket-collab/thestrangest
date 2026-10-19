const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'ditherout', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={};
const fin=()=>{ rep.errors=errs.slice(0,40); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,4000)); };
process.on('unhandledRejection',e=>{ errs.push('TEST '+String(e&&e.message||e).slice(0,400)); fin(); process.exit(1); });
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const open=async q=>{ const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text().slice(0,300)); });
    await pg.goto('file://'+PAGE+'?fresh=1&hour=13&wx=CLEAR'+q,{waitUntil:'commit'}); for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; } await pg.waitForTimeout(5000); return pg; };
  const pg=await open('');
  const st=()=>pg.evaluate(()=>({...PEEK.stat(),view:__dbg.UI.view,dir:[PEEK.ray.direction.x,PEEK.ray.direction.z].map(v=>+v.toFixed(2)),P:{...PEEK.uDP},K:{...PEEK.uDK},cam:[__dbg.camO().position.x,__dbg.camO().position.y,__dbg.camO().position.z].map(v=>+(+v).toFixed(1)),W:[PEEK.W.x,PEEK.W.y].map(v=>+v.toFixed(2)),you:__dbg.pos().map(v=>+v.toFixed(1))}));
  const shot=async(n,f,w=3000,a)=>{ try{ if(f)rep[n]=await pg.evaluate(f,a); await pg.waitForTimeout(w); rep[n+'_stat']=await st(); await pg.screenshot({path:path.join(OUT,n+'.png')}); }catch(e){ errs.push(n+': '+e.message.slice(0,200)); } };
  const off=async n=>{ await pg.evaluate(()=>{ PEEK.on=false; }); await shot(n,null,1500); await pg.evaluate(()=>{ PEEK.on=true; }); };
  await pg.evaluate(()=>window.DN&&DN.set&&DN.set('day'));
  for(let i=0;i<4;i++){ const d=await pg.evaluate(()=>{ PEEK.tick(0); return [PEEK.ray.direction.x,PEEK.ray.direction.z]; }); rep['turn'+i]=d; if(d[1]<-.3)break; await pg.keyboard.press('e'); await pg.waitForTimeout(1500); }
  const behindTree=()=>{ const d=PEEK.ray.direction, h=Math.hypot(d.x,d.z)||1, T=__dbg.MAPK.BOD.XS(1)-__dbg.MAPK.BOD.XS(0); const P=__dbg.MAPK.PARK, o=P.oaks.slice().sort((a,b)=>b[2]-a[2])[0], it=P.trees.userData.items.find(q=>Math.hypot(q.x-o[0],q.z-o[1])<.5)||{r:3*T};
    STORE.goTo(o[0]-d.x/h*(.8*T+it.r*.45),o[1]-d.z/h*(.8*T+it.r*.45),'up'); const y=__dbg.you(); return {tree:o,r:it.r,you:[y.x,y.z]}; };
  const atRow=([x,y])=>{ const B=__dbg.MAPK.BOD, X=B.XS(x); let Y=null, hit=null; for(let v=-45;v>-95;v-=.1){ const Z=B.ZS(v), q=__dbg.collide(X,Z), dx=q[0]-X, dz=q[1]-Z; if(Math.abs(dz)>.01&&Math.abs(dz)>2*Math.abs(dx)&&(dz>0)===(B.ZS(1)>B.ZS(0))){ hit=v; Y=v+(y||1.2); break; } }
    if(Y==null)return {none:1}; STORE.goTo(X,B.ZS(Y),'up'); const u=__dbg.you(); return {hit,Y,want:[X,B.ZS(Y)],you:[u.x,u.z]}; };
  await shot('tree-iso',behindTree,4000); await off('tree-iso-off');
  rep.ease=await pg.evaluate(async()=>{ PEEK.on=false; await new Promise(r=>setTimeout(r,800)); PEEK.on=true; const s=[]; const t0=performance.now(); while(performance.now()-t0<600){ s.push([Math.round(performance.now()-t0),+PEEK.k.toFixed(2)]); await new Promise(r=>requestAnimationFrame(r)); } return s; });
  rep.tickMs=await pg.evaluate(()=>{ const t0=performance.now(); for(let i=0;i<500;i++)PEEK.tick(0); return (performance.now()-t0)/500; });
  await shot('wall-iso-apts',atRow,4000,[130,1.2]); await off('wall-iso-apts-off');
  await shot('wall-iso-bodega',atRow,4000,[108,1.2]);
  await shot('wall-iso-theatre',atRow,4000,[180,1.2]);
  await shot('wall-iso-museum',atRow,4000,[0,1.2]);
  await pg.keyboard.press('v'); await pg.waitForTimeout(2000);
  rep['tree-behind']=await pg.evaluate(async()=>{ const raf=()=>new Promise(r=>requestAnimationFrame(r)), T=__dbg.MAPK.BOD.XS(1)-__dbg.MAPK.BOD.XS(0), P=__dbg.MAPK.PARK, oaks=P.oaks.slice().sort((a,b)=>b[2]-a[2]).slice(0,6), tried=[];
    for(const o of oaks)for(const d of [2,3,4,5,7])for(const s of [2,-2,3,-3,1.2,-1.2]){ const c=__dbg.camO().position, y=__dbg.you(), ux=c.x-y.x, uz=c.z-y.z, h=Math.hypot(ux,uz)||1, nx=ux/h, nz=uz/h;
      STORE.goTo(o[0]-nx*d*T-nz*s*T,o[1]-nz*d*T+nx*s*T,'up'); for(let i=0;i<4;i++)await raf(); const W=PEEK.W; tried.push(PEEK.cov?1:0); if(PEEK.cov&&Math.abs(W.x)<.7&&Math.abs(W.y)<.7)return {o,d,s,tried:tried.length}; }
    return {none:1,tried}; });
  await shot('tree-behind',null,3000); await off('tree-behind-off');
  await pg.evaluate(()=>__dbg.face(Math.PI)); await shot('wall-behind',atRow,1000,[130,1.2]); await shot('wall-behind',()=>{ __dbg.face(Math.PI); },4000);
  await pg.evaluate(()=>__dbg.face(0)); await shot('wall-behind-2',atRow,1000,[130,1.2]); await shot('wall-behind-2',()=>{ __dbg.face(0); },4000);
  await pg.keyboard.press('v'); await pg.waitForTimeout(2000);
  await shot('first',behindTree,3000);
  await pg.keyboard.press('v'); await pg.waitForTimeout(1500);
  rep.fps=await pg.evaluate(()=>document.querySelector('#stat')?.textContent||'');
  await pg.close();
  const p2=await open('&dither=0'); await p2.evaluate(behindTree); await p2.waitForTimeout(3000); rep.statOff=await p2.evaluate(()=>PEEK.stat()); await p2.screenshot({path:path.join(OUT,'param-off.png')});
  fin(); await b.close(); })();
