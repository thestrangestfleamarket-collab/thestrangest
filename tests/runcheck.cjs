// RUN CHECK (19 Oct 2026): node tests/runcheck.cjs <out dir>: runs the player along Market St and reads every frame (frame time, where
// the player is drawn on screen, the body's height) for jumps; pictures of the run, the subway, its tunnel and the frog.
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'runout', PAGE=path.resolve(__dirname,'../dist/market.html');
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); const errs=[], rep={}; pg.on('pageerror',e=>errs.push(e.message.slice(0,300)));
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__started))break; }
  await pg.waitForTimeout(5000);
  const place=async(f)=>{ await pg.evaluate(f); await pg.waitForTimeout(4000); };
  await place(()=>{ const B=__dbg.MAPK.BOD; STORE.goTo(B.XS(100),B.ZS((B.CURB+B.FAR)/2),'up'); });
  await pg.evaluate(()=>{ const S=window.__S=[]; let last=performance.now(); const V=new (__dbg.cam().position.constructor)();
    const f=now=>{ if(!window.__S)return; const c=__dbg.cam(), y=__dbg.you(), g=__dbg.W3.group.position; V.set(y.x,y.y+1,y.z).project(c);
      S.push([+(now-last).toFixed(1),+y.x.toFixed(4),+y.z.toFixed(4),+y.y.toFixed(4),+((V.x+1)*480).toFixed(2),+((1-V.y)*270).toFixed(2),+g.y.toFixed(4)]); last=now; requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const runs=[['wd',['w','d']],['sa',['s','a']],['w',['w']],['d',['d']]];
  for(const [n,ks] of runs){ await pg.keyboard.down('Shift'); for(const k of ks)await pg.keyboard.down(k);
    for(let i=0;i<3;i++){ await pg.waitForTimeout(900); await pg.screenshot({path:path.join(OUT,'run-'+n+'-'+i+'.png'),clip:{x:330,y:120,width:300,height:300}}); }
    for(const k of ks)await pg.keyboard.up(k); await pg.keyboard.up('Shift'); await pg.waitForTimeout(600); }
  const S=await pg.evaluate(()=>{ const s=window.__S; window.__S=null; return s; });
  const st=a=>{ a=a.filter(Number.isFinite); const m=a.reduce((p,q)=>p+q,0)/Math.max(1,a.length); return {n:a.length,mean:+m.toFixed(3),max:+Math.max(...a).toFixed(3),sd:+Math.sqrt(a.reduce((p,q)=>p+(q-m)**2,0)/Math.max(1,a.length)).toFixed(3)}; };
  const dts=S.map(r=>r[0]), step=S.slice(1).map((r,i)=>Math.hypot(r[1]-S[i][1],r[2]-S[i][2])/Math.max(1,r[0])*16.7), dpy=S.slice(1).map((r,i)=>Math.abs(r[3]-S[i][3])), dsx=S.slice(2).map((r,i)=>Math.abs(r[4]-2*S[i+1][4]+S[i][4])), dsy=S.slice(2).map((r,i)=>Math.abs(r[5]-2*S[i+1][5]+S[i][5]));
  rep.run={frames:st(dts),slow:dts.filter(d=>d>40).length,stepPer60:st(step),pyStep:st(dpy),screenJerkX:st(dsx),screenJerkY:st(dsy),gy:st(S.map(r=>r[6]))};
  rep.sun=await pg.evaluate(()=>window.SUNDBG&&SUNDBG());
  fs.writeFileSync(path.join(OUT,'frames.json'),JSON.stringify(S));
  await place(()=>{ const N=__dbg.npcs().find(n=>n.key==='scooterfrog'); if(N)STORE.goTo(N.st.x,N.st.z+1.5*(__dbg.cam().right-__dbg.cam().left)/30,'up'); });
  await pg.screenshot({path:path.join(OUT,'frog.png')}); rep.frog=await pg.evaluate(()=>{ const N=__dbg.npcs().find(n=>n.key==='scooterfrog'); return N&&{x:N.st.x,z:N.st.z,to:N.st.to}; });
  await pg.waitForTimeout(5000); rep.frog2=await pg.evaluate(()=>{ const N=__dbg.npcs().find(n=>n.key==='scooterfrog'); return N&&{x:N.st.x,z:N.st.z}; });
  await place(()=>{ STORE.goTo(METRO.plat.x,METRO.plat.z,'down'); });
  await pg.screenshot({path:path.join(OUT,'subway-iso.png')});
  await pg.keyboard.press('v'); await pg.waitForTimeout(3000); await pg.screenshot({path:path.join(OUT,'subway-behind.png')});
  await place(()=>{ const p=METRO.at(METRO.PLAT+2,METRO.OY-24); STORE.goTo(p.x,p.z,'down'); }); await pg.screenshot({path:path.join(OUT,'tunnel-behind.png')});
  await pg.keyboard.press('v'); await pg.keyboard.press('v'); await pg.waitForTimeout(3000);
  await place(()=>{ STORE.enter('bar',true); }); await pg.keyboard.press('v'); await pg.waitForTimeout(3000); await pg.screenshot({path:path.join(OUT,'bar-behind.png')});
  rep.errors=errs; fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep)); await b.close(); })();
