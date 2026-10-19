// THE FOUNTAIN TERRACE AND THE LAKE (060a-fount.js): node tests/fountshot.cjs <outdir> [page, default dist/market.html] [stats]: by day (14:00) the terrace from two
// angles (with and without the oaks), the lake zoomed out into the mist; a walk onto the terrace, into the basin (it must stop you) and into the lake (you swim);
// triangles in view, programs, ms a frame, the fountain's own ms; the page's errors. With "stats" only the numbers at the terrace (for a build without the fountain too).
const {chromium}=require('playwright'), fs=require('fs');
(async()=>{ const [out,page='dist/market.html',only]=process.argv.slice(2); fs.mkdirSync(out,{recursive:true});
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1100,height:760}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; }); pg.on('console',m=>{ if(m.type()==='error'&&!/Fetch API|file:/.test(m.text()))errs[m.text().slice(0,300)]=1; });
  const C=[156,8], W=(x,y)=>[+((x-72)*1.13).toFixed(2),+((y+77)*1.13).toFixed(2)], front=W(C[0],C[1]-4.8);
  await pg.goto('file://'+require('path').resolve(page)+'?fresh=1&hour=14&at='+front.join(','),{timeout:180000});
  await pg.waitForFunction(()=>window.__started&&window.PARK&&PARK.fire,{timeout:400000}); await pg.waitForTimeout(9000);
  const zoom=async n=>{ for(let k=0;k<Math.abs(n);k++){ await pg.mouse.move(550,380); await pg.mouse.wheel(0,n<0?-250:250); await pg.waitForTimeout(150); } await pg.waitForTimeout(1500); };
  const turn=async n=>{ for(let i=0;i<n;i++){ await pg.evaluate(()=>__dbg.UI.isoStep(1)); await pg.waitForTimeout(300); } await pg.waitForTimeout(2000); };
  const shot=async n=>{ await pg.screenshot({path:`${out}/${n}.png`}); console.log('shot',n); };
  const stats=async()=>pg.evaluate(()=>new Promise(r=>{ let n=0; const t0=performance.now(), f=()=>{ if(++n<90)requestAnimationFrame(f); else { const ms=(performance.now()-t0)/90; let fm=null;
    if(window.FOUNT&&FOUNT.tick){ const p={x:__dbg.pos()[0],z:__dbg.pos()[2]}, t1=performance.now(); for(let i=0;i<300;i++)FOUNT.tick(1/60,p); fm=+((performance.now()-t1)/300).toFixed(3); }
    r({tris:__dbg.tris(),progs:__dbg.renderer.info.programs.length,calls:__dbg.info().calls,frameMs:+ms.toFixed(1),fountMs:fm,lamps:__dbg.lamps.length,fount:window.FOUNT&&FOUNT.tris||null}); } }; requestAnimationFrame(f); }));
  await zoom(4); await turn(3);
  console.log('stats',JSON.stringify(await stats()));
  if(only==='stats'){ console.log('errors',Object.keys(errs)); await b.close(); return; }
  await shot('terrace-a'); await pg.evaluate(()=>{ if(PARK.trees)PARK.trees.visible=false; }); await pg.waitForTimeout(1500); await shot('terrace-a-notrees'); await pg.evaluate(()=>{ if(PARK.trees)PARK.trees.visible=true; });
  await turn(1); await shot('terrace-b'); await turn(1); await shot('terrace-c'); await turn(2);
  await zoom(10); await pg.evaluate(()=>{ if(PARK.trees)PARK.trees.visible=false; }); await shot('far-notrees'); await pg.evaluate(()=>{ if(PARK.trees)PARK.trees.visible=true; });
  const here=async()=>{ const p=await pg.evaluate(()=>__dbg.pos()); return [+(p[0]/1.13+72).toFixed(2),+(p[2]/1.13-77).toFixed(2),+p[1].toFixed(3)]; };
  const at=async(x,y,s)=>{ const [wx,wz]=W(x,y); let p=await here(), still=0; for(let t=0;t<s&&still<4;t+=2){ await pg.evaluate(([a,c])=>__dbg.go(a,c),[wx,wz]); await pg.waitForTimeout(2000); const q=await here(); still=Math.hypot(q[0]-p[0],q[1]-p[1])<.05?still+1:0; p=q; if(Math.hypot(p[0]-x,p[1]-y)<.3)break; } return p; };
  const d=p=>+Math.hypot(p[0]-C[0],p[1]-C[1]).toFixed(2);
  let p=await at(C[0],C[1]-2.3,90); console.log('on the terrace',p,'from the middle',d(p),d(p)<2.6&&d(p)>1.4?'ok':'NOT');
  p=await at(C[0],C[1],60); console.log('into the basin',p,'from the middle',d(p),d(p)>=1.45?'ok (stopped at the rim)':'NOT');
  await shot('basin-block');
  const deep=await pg.evaluate(()=>{ for(let r=6;r<30;r+=.5)for(let a=0;a<6.28;a+=.2){ const x=156+Math.cos(a)*r, y=8+Math.sin(a)*r; if(FOUNT.lake(x,y)<-4.5&&y<26)return [+x.toFixed(1),+y.toFixed(1)]; } return null; });
  p=await at(C[0]+5,C[1]-3.5,60); p=await at(deep[0],deep[1],150);
  const sw=await pg.evaluate(()=>({swim:FOUNT.swim,lake:+FOUNT.lake(__dbg.pos()[0]/1.13+72,__dbg.pos()[2]/1.13-77).toFixed(2)})); console.log('into the lake',p,JSON.stringify(sw),sw.swim?'ok (swimming)':'NOT');
  await shot('swim');
  p=await at(C[0]+5,C[1]-3.5,150); const sw2=await pg.evaluate(()=>FOUNT.swim); console.log('out again',p,'swim',sw2,!sw2?'ok':'NOT');
  await pg.goto('file://'+require('path').resolve(page)+'?fresh=1&hour=14&at='+W(200,1).join(','),{timeout:180000}); await pg.waitForFunction(()=>window.__started&&window.FOUNT&&FOUNT.ready,{timeout:400000}); await pg.waitForTimeout(9000);
  await zoom(10); await pg.evaluate(()=>{ if(PARK.trees)PARK.trees.visible=false; }); for(let i=0;i<4;i++){ await shot('lake-mist-'+i); await turn(1); }
  console.log('errors',Object.keys(errs)); await b.close(); })();
