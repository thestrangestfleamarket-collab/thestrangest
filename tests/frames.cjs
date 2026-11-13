// PICTURE FRAMES CHECK (150ga): node tests/frames.cjs [dist/market.html]. DECORATE sells a PICTURE FRAME that hangs on a wall; a museum picture, one of your photographs or a picture from this device hangs in it; which one is kept with the layout; a visitor sees the museum's and an empty frame for the rest.
const {chromium}=require('playwright'), path=require('path');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:900,height:620}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,200)));
  const fails=[], ok=(c,m)=>{ if(!c)fails.push(m); console.log((c?'ok  ':'FAIL')+' '+m); };
  await pg.goto('file://'+path.resolve(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13&npcwait=99&place=your%20apartment',{waitUntil:'commit',timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:400000});
  for(let i=0;i<300;i++){ if(await pg.evaluate(()=>!!(window.ROOMED&&ROOMED._api&&ROOMED._api()&&__dbg.MAPK.MODS.apts.inReal)).catch(()=>false))break; await pg.waitForTimeout(500); } await pg.waitForTimeout(6000);
  const r=await pg.evaluate(async()=>{ const W=ms=>new Promise(r=>setTimeout(r,ms)), A=ROOMED._api(), K=A.kinds()['PICTURE FRAME'], un=A.spawn('PICTURE FRAME',{u:.03,h:1.6,v:3.2,ry:Math.PI/2,s:1},'frame-t1'), map=()=>{ let m=null; un.obj.traverse(o=>{ if(o.userData.fr==='p')m=o.material.map; }); return !!m; };
    const c=document.createElement('canvas'); c.width=300; c.height=200; const g=c.getContext('2d'); g.fillStyle='#c33'; g.fillRect(0,0,300,200); const blob=await new Promise(r=>c.toBlob(r,'image/png')), id=await FRAMES.upload(un,new File([blob],'x.png',{type:'image/png'})); for(let i=0;i<40&&!map();i++)await W(250);
    const mine=map(), L=ROOMED.snapshot(A), kept=L.frames&&L.frames['frame-t1'], thing=__dbg.UI.things.some(t=>/YOUR PICTURE/.test(typeof t.name==='function'?t.name():t.name));
    const g0=ROOMED.HOME.guest; ROOMED.HOME.guest={name:'X',layout:L}; await FRAMES.show(un); await W(800); const guest=map(); ROOMED.HOME.guest=g0||null;
    window.fetch=async()=>({json:async()=>({data:[{id:1,title:'Water Lilies',artist_title:'Claude Monet',image_id:'abc'},{id:2,title:'No picture',image_id:null}]})}); const res=await FRAMES.search('monet'); FRAMES.set(un,{t:'aic',id:res[0].id,n:res[0].n}); const L2=ROOMED.snapshot(A);
    FRAMES.set(un,null); await W(300); return {kind:!!K,price:ROOMED.price('PICTURE FRAME'),mount:K&&K.mount,mine,kept,thing,guest,res,aic:L2.frames&&L2.frames['frame-t1'],empty:!map()&&!FRAMES.pics['frame-t1']}; });
  ok(r.kind&&r.mount==='wall'&&r.price===20,'DECORATE has a PICTURE FRAME for the wall ($'+r.price+')');
  ok(r.mine&&r.kept&&r.kept.t==='my'&&r.thing,'a picture from this device hangs in it and is kept with the layout: '+JSON.stringify([r.kept,r.mine,r.thing]));
  ok(r.guest===false,'a visitor sees that frame empty');
  ok(r.res.length===1&&/Water Lilies, Claude Monet/.test(r.res[0].n)&&r.aic&&r.aic.t==='aic'&&r.aic.id==='abc','the museum\'s search lists works that have a picture; one hangs by its id: '+JSON.stringify(r.aic));
  ok(r.empty,'EMPTY IT takes the picture down');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
  await b.close(); console.log(fails.length?fails.length+' failed':'frames: all good'); process.exit(fails.length?1:0); })();
