// USE (src/094-ui.js: E and the double click on a thing): node tests/use.cjs. E uses what is in reach from where you stand, no walk; a double click
// walks you up, at the thing you stop dead and use it, no slide after; walking away calls the walk off.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader'],...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{})}); const pg=await b.newPage({viewport:{width:960,height:640}}); let bad=0;
  const errs={}; pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  { const DIR=require('path').join(process.cwd(),'node_modules/@dimforge/rapier3d-compat'), fs=require('fs');
    await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/,r=>{ const f=require('path').join(DIR,new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1]||''); if(!fs.existsSync(f))return r.continue();
      r.fulfill({path:f,contentType:/\.wasm$/.test(f)?'application/wasm':'text/javascript'}); }); }
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.evaluate(()=>{ const {UI,pos}=PETS.dbg; window.UI=UI; window.pos=pos; window.T=PETS.WU*.84;
    window.mk=(ahead,o={})=>{ const h=SHARED.heading, x=pos.x+Math.sin(h)*ahead*T, z=pos.z+Math.cos(h)*ahead*T, th={name:'TEST THING',n:0,obj:{visible:true,parent:null,userData:{},getWorldPosition:v=>v.set(x,SHARED.py,z)},reach:.8*T,near:3*T,...o};
      th.act=()=>{ th.n++; th.at=[pos.x,pos.z]; }; UI.things.forEach(t=>{ if(t.name!=='TEST THING')t.quiet=t.quiet||(t.__q=1); }); UI.things.push(th); return th; };
    window.drop=()=>{ for(let i=UI.things.length-1;i>=0;i--)if(UI.things[i].name==='TEST THING')UI.things.splice(i,1); }; });
  await pg.mouse.click(480,320); await wait(1500);
  // E: in reach (but past arm's length), used from where you stand
  await pg.evaluate(()=>{ window.th=mk(2); window.p0=[pos.x,pos.z]; }); await pg.keyboard.press('e'); await wait(2500);
  const e1=await pg.evaluate(()=>({n:th.n,moved:+(Math.hypot(pos.x-p0[0],pos.z-p0[1])/T).toFixed(3)}));
  rec('E uses a thing in reach from where you stand (no walk, no slide)',e1.n===1&&e1.moved<.05,JSON.stringify(e1)); await pg.evaluate(()=>drop());
  // the double click: walk up, stop dead, use, stay put
  await pg.evaluate(()=>{ window.th=mk(6); UI.walkUp(th); }); for(let i=0;i<40&&!(await pg.evaluate(()=>th.n));i++)await wait(250);
  await wait(2500); const w=await pg.evaluate(()=>{ const p=th.obj.getWorldPosition(pos.clone()); return {n:th.n,gap:+(Math.hypot(p.x-th.at[0],p.z-th.at[1])/T).toFixed(2),slid:+(Math.hypot(pos.x-th.at[0],pos.z-th.at[1])/T).toFixed(3)}; });
  rec('a double click walks you up and uses it',w.n===1&&w.gap<=.81,JSON.stringify(w));
  rec('no slide after you use it',w.slid<.05,JSON.stringify(w)); await pg.evaluate(()=>drop());
  // walking away calls it off
  await pg.evaluate(()=>{ window.th=mk(7); UI.walkUp(th); }); await wait(400); await pg.keyboard.down('s'); await wait(1200); await pg.keyboard.up('s'); await wait(3000);
  const c=await pg.evaluate(()=>({n:th.n})); rec('walking away calls the walk off',c.n===0,JSON.stringify(c)); await pg.evaluate(()=>drop());
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,n])=>n+'× '+k).join(' | '));
  await b.close(); process.exit(bad?1:0); })().catch(e=>{ console.error(e); process.exit(1); });
