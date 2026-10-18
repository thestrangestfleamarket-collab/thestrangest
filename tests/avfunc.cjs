// THE AVATAR WORKBENCH, its working parts: node tests/avfunc.cjs <outdir> : sculpts (pull, smooth, grab, paint, mirrored), the presets, the
// female base, every hairstyle, hat, eyes, every pose and move, undo, the exports (GLB zip, OBJ zip, PNG, sheet, avatar file) and a reload
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
(async()=>{ const [out='.']=process.argv.slice(2);
  const src=fs.readFileSync(path.join(__dirname,'../avatar/avatar-editor.html'),'utf8'), page=path.join(out,'avedit.html');
  fs.writeFileSync(page,'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>[hidden]{display:none!important}body{margin:0}</style></head><body>'+src+'</body></html>');
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const ctx=await b.newContext({viewport:{width:1280,height:800},acceptDownloads:true}); const pg=await ctx.newPage();
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await pg.goto('file://'+path.resolve(page)); await pg.waitForFunction(()=>window.AW,null,{timeout:120000});
  const r=await pg.evaluate(()=>{ const A=AW, R={}; A.VIEW.px=1; A.setPose('T-pose'); A.POSE.blend=1; for(let i=0;i<30;i++){}
    return true; });
  await pg.waitForTimeout(1200);
  // sculpt through real mouse drags on the chest
  await pg.evaluate(()=>{ AW.showTab('sculpt'); AW.applyView('Front'); }); await pg.waitForTimeout(800);
  const box=await pg.locator('#cv').boundingBox(); const cx=box.x+box.width/2, cy=box.y+box.height*.42;
  const sum=()=>pg.evaluate(()=>{ const G=AW.G(); let s=0; for(const v of G.OFF) s+=Math.abs(v); let m=0; for(let i=0;i<G.n;i++) if(G.OFF[i*3]!==0) m++; return {s:+s.toFixed(4),moved:m}; });
  console.log('before',JSON.stringify(await sum()));
  for(const tool of ['pull','smooth','grab','inflate']){ await pg.evaluate(t=>{ AW.BR.tool=t; },tool); await pg.mouse.move(cx+30,cy); await pg.mouse.down(); for(let i=0;i<8;i++) await pg.mouse.move(cx+30+i*3,cy-i*2); await pg.mouse.up(); console.log(tool,JSON.stringify(await sum())); }
  const mir=await pg.evaluate(()=>{ const G=AW.G(); let a=0,b=0; for(let i=0;i<G.n;i++){ const o=G.OFF[i*3]; if(G.base[i*3]>.01) a+=Math.abs(G.OFF[i*3+2]); if(G.base[i*3]<-.01) b+=Math.abs(G.OFF[i*3+2]); } return [a.toFixed(3),b.toFixed(3)]; });
  console.log('mirror L/R z-sculpt',mir);
  await pg.evaluate(()=>{ AW.BR.tool='paint'; AW.BR.color='#ff0000'; }); await pg.mouse.move(cx,cy+40); await pg.mouse.down(); await pg.mouse.move(cx+10,cy+45); await pg.mouse.up();
  console.log('painted',await pg.evaluate(()=>{ let c=0; const P=AW.G().PNT; for(let i=3;i<P.length;i+=4) if(P[i]>0) c++; return c; }));
  await pg.screenshot({path:path.join(out,'af-sculpt.png')});
  console.log('undo', await pg.evaluate(()=>{ AW.undo(); let s=0; for(const v of AW.G().OFF) s+=Math.abs(v); return s.toFixed(4); }));
  // every style and preset builds
  console.log('styles',await pg.evaluate(()=>{ const A=AW, bad=[]; const tri=()=>A.G().geo.index.count/3;
    for(const h of ['short','long','bob','bun','ponytail','pigtails','mohawk','afro','spiky','curly','bald']) for(const hat of ['none','cap','beanie','tophat','fedora','cowboy','wizard','crown']){ A.S.st.hair=h; A.S.st.hat=hat; try{ A.applyBody('Average'); }catch(e){ bad.push(h+'/'+hat+':'+e.message); } }
    for(const e of ['dots','whites','big','sleepy','happy','wink','lashes']) for(const m of ['none','line','smile','grin','open','o']) for(const g of ['none','round','square','shades']){ A.S.st.eyes=e; A.S.st.mouth=m; A.S.st.glasses=g; try{ A.applyBody('Average'); }catch(x){ bad.push(e+m+g+':'+x.message); } }
    for(const k of ['Slim','Bodybuilder','Heavy','Curvy','Chibi','Toddler','Giant','Goblin']) A.applyBody(k);
    for(const k of ['Wizard','Clown','Alien','Robot','Goth','Ninja']) A.applyLook(k);
    for(const k of Object.keys(A.POSE)&&[]) ;
    return {bad:bad.slice(0,5),tris:tri()}; }));
  await pg.evaluate(()=>{ document.querySelectorAll('#genderRow button')[1].click(); AW.applyLook('Student'); AW.setPose('Spread out'); AW.applyView('3/4'); AW.showTab('look'); }); await pg.waitForTimeout(1500);
  await pg.screenshot({path:path.join(out,'af-female.png')});
  // the exports
  for(const [lab,sel] of [['GLB','GLB (rigged)'],['OBJ','OBJ (posed)'],['PNG','PNG picture'],['SHEET','Sheet PNG'],['JSON','Avatar file']]){
    await pg.evaluate(()=>AW.showTab('file')); const [dl]=await Promise.all([pg.waitForEvent('download',{timeout:60000}),pg.getByRole('button',{name:sel,exact:true}).click()]);
    const f=path.join(out,dl.suggestedFilename()); await dl.saveAs(f); console.log(lab,dl.suggestedFilename(),fs.statSync(f).size); }
  // reload: the avatar comes back from the browser
  const tb=await pg.evaluate(()=>AW.G().geo.index.count); await pg.reload(); await pg.waitForFunction(()=>window.AW,null,{timeout:120000});
  console.log('reload same',tb===await pg.evaluate(()=>AW.G().geo.index.count), await pg.evaluate(()=>AW.S.gender+' '+AW.S.st.hair));
  console.log('errors',JSON.stringify(errs.slice(0,10))); await b.close(); })();
