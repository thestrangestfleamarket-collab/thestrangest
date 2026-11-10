// THE ITEM EDITOR (src/140ba-itembench.js): node tests/itemed.cjs [out folder]. Shift+7 opens the owner's workbench (off the website you are the owner); every family lists its items
// (game, wear, held, place); a wear piece, a held piece and a placeable thing each draw in the 360 view, alone and on your body; a game item is its own 3D model; the list draws pictures;
// a change makes the item's settings; Esc closes it and frees its renderer. With an out folder, screenshots of the editor.
const {chromium}=require('playwright'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader'],...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{})}); const pg=await b.newPage({viewport:{width:1280,height:760}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; }); pg.on('console',m=>{ if(/ITEM editor/.test(m.text()))console.log('  console:',m.text().slice(0,200)); });
  { const DIR=require('path').join(process.cwd(),'node_modules/@dimforge/rapier3d-compat'), fs=require('fs');
    await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/,r=>{ const f=require('path').join(DIR,new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1]||''); if(!fs.existsSync(f))return r.continue();
      r.fulfill({path:f,contentType:/\.wasm$/.test(f)?'application/wasm':'text/javascript'}); }); }
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms=60000,a)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(300))if(await pg.evaluate(f,a))return true; return false; };
  const shot=async n=>{ if(OUT)await pg.screenshot({path:require('path').join(OUT,n+'.png')}); };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.mouse.click(640,380); await pg.keyboard.press('Shift+Digit7');
  rec('shift+7 opens the ITEM editor',await U(()=>!!(window.ITEMED&&ITEMED.on&&ITEMED.dbg&&!document.getElementById('itb').hidden)));
  // a drawn 360 view: enough of the canvas is not empty
  const drawn=()=>{ const R=ITEMED.dbg.R(); if(!R)return 0; const c=R.domElement, k=document.createElement('canvas'); k.width=96; k.height=64; const g=k.getContext('2d'); g.drawImage(c,0,0,96,64); const d=g.getImageData(0,0,96,64).data; let n=0; for(let i=3;i<d.length;i+=4)if(d[i]>20)n++; return n; };
  const ready=()=>document.querySelector('#itb .note').textContent==='';
  const counts=await pg.evaluate(async()=>{ const o={}; for(const f of ['game','wear','held','place']){ await ITEMED.dbg.tab(f); o[f]=ITEMED.dbg.byId().size; } await ITEMED.dbg.tab('wear'); return o; });
  rec('every family is listed: game items, wear and held kinds, placeable things',counts.game>=40&&counts.wear>=150&&counts.held>=60&&counts.place>=500,JSON.stringify(counts));
  for(const [f,id,n] of [['wear','pf_coat_plate_armour','a wear piece (plate armour)'],['held','pf_righthand_skateboard','a held piece (skateboard)'],['place','pfp_food-truck-3c4e0e','a placeable thing (food truck)']]){
    await pg.evaluate(([f,id])=>ITEMED.dbg.tab(f).then(()=>ITEMED.dbg.pick(id)),[f,id]);
    const ok=await U(ready,90000); await wait(400); const px=await pg.evaluate(drawn);
    rec(n+' draws in the 360 view',ok&&px>150,px+' px');
    await pg.evaluate(()=>ITEMED.dbg.body(true)); const ok2=await U(ready,90000); await wait(400); const px2=await pg.evaluate(drawn);
    rec(n+(f==='place'?' beside you':' on your body'),ok2&&px2>150,px2+' px');
    if(f==='wear')await shot('itemed-armour-on-body');
    if(f==='place')await shot('itemed-truck-beside-you');
    await pg.evaluate(()=>ITEMED.dbg.body(false)); await U(ready,60000); }
  await pg.evaluate(()=>ITEMED.dbg.tab('wear').then(()=>ITEMED.dbg.pick('pf_hat_top_hat'))); await U(ready,60000); await wait(500); await shot('itemed-top-hat');
  const g=await pg.evaluate(async()=>{ await ITEMED.dbg.tab('game'); const id=ITEMED.dbg.byId().has('cage')?'cage':[...ITEMED.dbg.byId().keys()][0]; ITEMED.dbg.pick(id); await new Promise(r=>setTimeout(r,2500)); const z=ITEMED.dbg.size(); return {id,note:document.querySelector('#itb .note').textContent,thin:Math.min(...z)/Math.max(...z),pic:!!document.querySelector('#itb .cell .im.px[style]')}; });
  rec('a game item turns as its own 3D model (the bird cage, not a flat picture)',g.id==='cage'&&g.note===''&&g.thin>.3&&g.pic,JSON.stringify(g)); await shot('itemed-game'); const par=await pg.evaluate(async()=>{ await ITEMED.dbg.tab('game'); const sig=o=>{ let n=0,v=0; o.traverse(m=>{ if(m.geometry){ n++; v+=m.geometry.attributes.position.count; } }); return n+':'+v; }, P=sig(INSPECT.shape('parcel',0xb08a5a,0x6a4a2a)), out=[];
    for(const id of ITEMED.dbg.byId().keys()){ let s='err'; try{ s=sig(INSPECT.model(id)); }catch(e){} if(s===P||s==='err')out.push(id); } return out; });
  rec('every game item has a model of its own (none is the parcel)',!par.length,par.join(' ')||'none');
  await pg.evaluate(()=>ITEMED.dbg.tab('place'));
  rec('the list draws pictures of what is on screen',await U(()=>ITEMED.dbg.thumbs()>=6,120000),await pg.evaluate(()=>ITEMED.dbg.thumbs())+' pictures'); await shot('itemed-place-list');
  const set=await pg.evaluate(async()=>{ await ITEMED.dbg.tab('wear'); ITEMED.dbg.pick('pf_hat_kabuto'); for(let i=0;i<50&&!document.querySelector('#itb .tp').__tp;i++)await new Promise(r=>setTimeout(r,100));
    const before=!!ITEMS.defs.pf_hat_kabuto; const pane=document.querySelector('#itb .tp').__tp; const flags=pane&&pane.children[0]; const sell=flags&&flags.children.find(c=>c.label==='SELLABLE');
    if(sell){ sell.controller.value.setRawValue(true); } await new Promise(r=>setTimeout(r,200)); const d=ITEMS.defs.pf_hat_kabuto; return {before,after:!!d,sellable:!!(d&&d.sellable),slot:d&&d.slot}; });
  rec('a change makes the item\'s settings (a kind\'s slot filled in)',!set.before&&set.after&&set.sellable&&set.slot==='head',JSON.stringify(set));
  await pg.keyboard.press('Escape');
  rec('Esc closes it and frees its renderer',await U(()=>!ITEMED.on&&document.getElementById('itb').hidden&&!ITEMED.dbg.R(),10000));
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,n])=>n+'× '+k).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'ALL PASS'); process.exit(bad?1:0); })();
