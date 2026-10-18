// THE AVATAR EDITOR, STANDALONE, its working parts: node tests/avpagefunc.cjs <outdir> : the game's own brush through real drags on him
// (SCULPT ON, PUSH OUT), a piece's size, the moves' list, every outfit and shading, every file (the game's avatar file, shape, moves; GLB,
// OBJ, picture, sheet), the avatar file back in, a reload keeping him
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
(async()=>{ const [out='.']=process.argv.slice(2);
  const page=path.join(out,'avpage.html'); fs.writeFileSync(page,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>[hidden]{display:none!important}</style></head><body>'+fs.readFileSync('dist/avatar.html','utf8')+'</body></html>');
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const ctx=await b.newContext({viewport:{width:1400,height:860},acceptDownloads:true}); const pg=await ctx.newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text()); });
  await pg.goto('file://'+path.resolve(page)); await pg.waitForFunction(()=>window.AVE&&window.AVE.draw,null,{timeout:180000});
  const moved=()=>pg.evaluate(()=>{ const a=W3.mesh.geometry.attributes.position.array; let s=0; for(let i=0;i<a.length;i++)s+=Math.abs(a[i]); return +s.toFixed(2); });
  await pg.evaluate(()=>{ AVE.setPose('T-POSE'); AVE.MODE.Pnow=AVE.MODE.P; AVE.goView('FRONT'); }); await pg.waitForTimeout(800);
  const s0=await moved(); await pg.click('#avsc'); await pg.click('#av [data-k="push"]');
  const box=await pg.locator('canvas').boundingBox(), cx=box.x+box.width/2, cy=box.y+box.height*.48;
  await pg.mouse.move(cx,cy); await pg.mouse.down(); for(let i=0;i<10;i++)await pg.mouse.move(cx+i*2,cy+i); await pg.mouse.up(); await pg.waitForTimeout(300);
  const s1=await moved(); console.log('sculpt: his points moved',s0!==s1,'(sum',s0,'->',s1+')');
  await pg.screenshot({path:path.join(out,'apf-sculpt.png')});
  await pg.click('#avundo'); await pg.waitForTimeout(200); console.log('undo back',(await moved())===s0);
  await pg.click('#avsc');   // sculpt off
  console.log('head size slider:',await pg.evaluate(()=>{ const s=document.querySelector('#avr0_0'); s.value=1.4; s.dispatchEvent(new Event('input')); return JSON.stringify(W3.E[W3.idx('head')].s); }));
  console.log('moves:',await pg.evaluate(()=>AVE.moveNames().join(' ')));
  console.log('every outfit and shading:',await pg.evaluate(()=>{ const bad=[]; for(const k of ['THE WALKER','DENIM DAY','LUMBERJACK','SAILOR','KNIT SWEATER','CAMO','POLKA DOTS','OFFICE','PUNK','GOTH','SPORTY','WINTER','FARMER','ROYAL','CHEF','NINJA','ZOMBIE','ROBOT','ALIEN','BEACH','MARKET VENDOR','DETECTIVE'])try{ AVE.wear(k); }catch(e){ bad.push(k+':'+e.message); }
    for(const k of ['THE GAME\'S','PIXEL STEPS','COMIC','SOFT','DRAMATIC','GLOW EDGE','FLAT (HIS OWN LIGHT)','THE GAME\'S'])try{ AVE.shadeAs(k); }catch(e){ bad.push(k+':'+e.message); } return bad.length?bad:'ok'; }));
  await pg.evaluate(()=>{ AVE.wear('SAILOR'); AVE.setPose('CHEER'); });
  for(const lab of ['AVATAR FILE','HIS SHAPE','HIS MOVES','GLB (POSED)','OBJ (POSED)','PICTURE','CHARACTER SHEET']){
    await pg.click('#wbtabs [data-t="files"]'); const [dl]=await Promise.all([pg.waitForEvent('download',{timeout:90000}),pg.getByRole('button',{name:lab,exact:true}).click()]);
    const f=path.join(out,dl.suggestedFilename()); await dl.saveAs(f); console.log(lab,'->',dl.suggestedFilename(),fs.statSync(f).size,'bytes'); }
  // the avatar file back in, after the outfit's changed
  await pg.evaluate(()=>AVE.wear('NINJA'));
  const [fc]=await Promise.all([pg.waitForEvent('filechooser'),pg.getByRole('button',{name:'OPEN A FILE...'}).click()]); await fc.setFiles(path.join(out,'walker-avatar.json')); await pg.waitForTimeout(500);
  console.log('file back in: shirt pattern',await pg.evaluate(()=>W3.PAT.value[0].x),'(sailor stripes = 1)');
  await pg.reload(); await pg.waitForFunction(()=>window.AVE&&window.AVE.draw,null,{timeout:180000}); console.log('after reload: shirt pattern',await pg.evaluate(()=>W3.PAT.value[0].x),'head size',await pg.evaluate(()=>JSON.stringify(W3.E[W3.idx('head')]&&W3.E[W3.idx('head')].s)));
  console.log('errors',JSON.stringify(errs.slice(0,10))); await b.close(); })();
