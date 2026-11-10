// THE FRUIT TREES (144j, 147d, 150hb): node tests/fruittrees.cjs [dist/market.html]. 57 real trees and their goods; a tree ages a year a real day and fruits in its real months; the real rules (pollination, random pips, frost and burlap, birds and nets, windfalls and wasps, pruning, thinning, black walnut, male and female); the park orchard's plots (claim, plant, pick); a big pot at home. SHOT=dir saves a picture of the orchard.
const {chromium}=require('playwright'), path=require('path');
(async()=>{ const b=await chromium.launch({...(process.env.PWCHROME?{executablePath:process.env.PWCHROME}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:960,height:600}}), errs=[]; let bad=0;
  const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; }; pg.on('pageerror',e=>errs.push(e.message.slice(0,300)));
  await pg.goto('file://'+path.resolve(process.argv[2]||'dist/market.html')+'?hour=13&fresh=1',{waitUntil:'commit',timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:400000,polling:2000});
  const r=await pg.evaluate(()=>{ const F=FTREES, C=F.CAT, D=864e5, o={};
    o.kinds=F.ids.length; o.items=F.ids.every(k=>FORAGE.NM[C[k].item]&&FORAGE.NM[C[k].sapling]&&ITEMS.prop(C[k].item,'value')>0);
    // time: a tree's clock is FTREES.now(); jump it to the 15th of a month
    const at=(y,m,d=15)=>{ F.shift=Date.UTC(y,m-1,d,12)-Date.now(); }; const Y=new Date().getUTCFullYear()+1;
    at(Y,4,1); const a=F.plant('apple'); a.wet=F.now()+400*D;
    const v0=F.view(a,{}); at(Y,4,3); const v1=F.view(a,{}); at(Y,9,15); const v2=F.view(a,{partner:true}), v3=F.view(a,{partner:false});
    o.growth=[v0.stage,v1.stage,v2.stage]; o.apple={with:v2.crop,without:v3.crop,avail:v2.avail,blk:!!v2.blk};
    at(Y,6,15); o.offSeason=F.view(a,{partner:true}).crop;
    at(Y,9,20); const w=F.view(a,{partner:true}); F.pick(a,w,w.avail); o.picked=F.view(a,{partner:true}).avail===0&&w.avail>0;
    at(Y,10,20); const lo=F.view(a,{partner:true}); at(Y,11,10); const wf=F.view(a,{partner:true}); o.wind={n:wf.wind,wasps:F.view(a,{partner:true,now:Date.UTC(Y,10,1)}).wasps}; a.wc=wf.pb&&wf.pb.key; o.cleared=F.view(a,{partner:true}).wind===0;
    // birds: the ground loses some of a ripe crop, a net keeps it
    at(Y,6,25); const c=F.plant('sweetcherry'); c.g=10; c.at=F.now(); const cb=F.view(c,{partner:true}); c.nt=1; const cn=F.view(c,{partner:true}); o.birds=[cb.birds,cn.birds]; o.potBirds=F.view(c,{partner:true,pot:true}).birds;
    // frost: a lemon in the ground dies in its first winter, in a pot it lives; a fig dies back unless wrapped
    at(Y,10,1); const l=F.plant('lemon'); at(Y+1,1,10); o.lemon=[F.view(l,{}).dead,F.view(l,{pot:true}).dead];
    at(Y,10,1); const f1=F.plant('fig'), f2=F.plant('fig'); for(const f of [f1,f2]){ f.g=5; f.at=F.now(); f.wet=F.now()+500*D; } f2.wr=1; at(Y+1,1,10); o.fig=[F.view(f1,{}).die,F.view(f2,{}).die];
    // male and female; a pip is random and slow; a black walnut halves a neighbour
    const p=F.plant('pistachio'); p.sx='f'; p.g=20; p.at=F.now(); at(Y+1,9,15); o.mf=[F.view(p,{male:false}).crop,F.view(p,{male:true}).crop>0,(()=>{ const m=F.plant('pistachio'); m.sx='m'; m.g=20; m.at=F.now(); return F.view(m,{}).crop; })()];
    const pip=F.plant('apple',{pip:true}); o.pip={q:pip.q,g:pip.g,Y:F.view(pip,{}).Y>F.view(a,{}).Y};
    at(Y+1,9,15); const g1=F.plant('gage'); g1.g=10; g1.at=F.now(); g1.th=F.block(F.now(),C.gage.m).key; o.walnut=[F.view(g1,{}).crop,F.view(g1,{walnut:true}).crop];
    // pruning in winter: a bigger crop
    at(Y+1,1,20); const pr=F.plant('gage'); pr.g=10; pr.at=F.now(); o.canPrune=F.canPrune(pr,F.view(pr,{})); pr.pr=F.now(); pr.th=F.block(Date.UTC(Y+1,7,15),C.gage.m).key; at(Y+1,8,20); const g2=F.plant('gage'); g2.g=10; g2.at=F.now(); g2.th=pr.th; o.prune=[F.view(pr,{}).crop,F.view(g2,{}).crop];
    // thinning: some unthinned peaches snap a branch
    let snaps=0; for(let i=0;i<20;i++){ const q=F.plant('peach',{id:'pk'+i}); q.g=10; q.at=F.now(); at(Y+1,7,20); if(F.view(q,{}).why.some(x=>/SNAPPED/.test(x)))snaps++; } o.snaps=snaps;
    // the shop: saplings for sale
    o.sap=!!(VEG.SHOP&&FORAGE.NM.sp_apple); F.shift=0; return o; });
  ok(r.kinds===57&&r.items,'57 trees, each with its sapling and its crop as items ('+r.kinds+')');
  ok(r.growth[0]>=2&&r.growth[2]===4,'a grafted sapling grows a year a day and fruits at its real age: '+r.growth);
  ok(r.apple.blk&&r.apple.with>r.apple.without*3&&r.apple.avail>0,'an apple fruits in September, far better with a second apple near: '+JSON.stringify(r.apple));
  ok(r.offSeason===0,'no apples in June'); ok(r.picked,'picking takes what is ripe');
  ok(r.wind.n>0&&r.wind.wasps&&r.cleared,'what was left falls, brings wasps, and can be cleared: '+JSON.stringify(r.wind));
  ok(r.birds[0]>0&&r.birds[1]===0&&r.potBirds===0,'birds take ripe cherries in the ground, not under a net or in a pot: '+r.birds+' / '+r.potBirds);
  ok(r.lemon[0]&&!r.lemon[1],'a lemon in the ground dies in a New York winter, in a pot it lives');
  ok(r.fig[0]&&!r.fig[1],'a fig dies back in winter unless wrapped in burlap');
  ok(r.mf[0]===0&&r.mf[1]&&r.mf[2]===0,'a female pistachio fruits only with a male near; a male never: '+JSON.stringify(r.mf));
  ok(r.pip.q>=.3&&r.pip.q<=1.4&&r.pip.g===0&&r.pip.Y,'a pip grows a random tree, slower: '+JSON.stringify(r.pip));
  ok(r.walnut[1]<r.walnut[0],'a black walnut beside it halves the crop: '+r.walnut);
  ok(r.canPrune&&r.prune[0]>r.prune[1],'pruned in winter, a bigger crop: '+r.prune);
  ok(r.snaps>2&&r.snaps<18,'unthinned peaches snap a branch some years ('+r.snaps+'/20)');
  ok(r.sap,'the Tomato sells saplings');
  // the orchard: by the farm, eight plots; claim one, plant two apples, see them grow and fruit
  const site=await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD; return [B.XS(72),B.ZS(-10)]; });
  await pg.evaluate(async([x,z])=>{ __dbg.ui().goTo(x,z+6*ORCHARD.T,'up',Math.PI); await PARK.load(); },site);   // (a jump into the park: it is built as when you walk in)
  await pg.waitForFunction(()=>window.ORCHDBG&&ORCHDBG().built&&ORCHDBG().loaded,null,{timeout:200000,polling:2000}).catch(()=>{});
  const o1=await pg.evaluate(()=>ORCHDBG()); ok(o1.built&&o1.plots.length===8,'the orchard is built when you come near, eight plots: '+JSON.stringify({built:o1.built,c:o1.center}));
  const o2=await pg.evaluate(async()=>{ await ORCHARD.claim(0); const F=FTREES, D=864e5; FORAGE.give('sp_apple',1); FORAGE.give('sp_crabapple',1); FORAGE.give('sp_lemon',1); ORCHARD.tap(0,0); ORCHARD.tap(0,1); ORCHARD.tap(0,2);
    const T=ORCHARD.PL[0].d.trees, ks=T.map(s=>s&&s.k); for(const s of T)if(s){ s.g=8; s.at=F.now(); }
    const Y=new Date().getUTCFullYear()+1; F.shift=Date.UTC(Y,8,20,12)-Date.now(); ORCHARD.redraw(); const V=ORCHARD.view(0,0), acts=ORCHARD.acts(0,0).map(a=>a.name);
    const n0=FORAGE.has('tf_apple'); ORCHARD.tap(0,0); const got=FORAGE.has('tf_apple')-n0; const d=ORCHDBG(); F.shift=0;
    return {mine:ORCHARD.mine(),ks,avail:V.avail,acts,got,shown:d.shown,sols:d.sols}; });
  ok(o2.mine===0&&o2.ks[0]&&o2.ks[1]&&o2.ks[2],'you claim a plot and plant in its spots: '+o2.ks);
  ok(o2.avail>0&&o2.got===o2.avail,'in September your apple (with the crabapple beside it) is ripe and you pick it: '+o2.got);
  ok(o2.shown>=3&&o2.sols>=2,'the trees stand in the orchard, their trunks solid: '+o2.shown+' / '+o2.sols);
  ok(o2.acts.some(a=>/NET/.test(a))&&o2.acts.some(a=>/ABOUT/.test(a)),'the extra acts are offered: '+o2.acts.join(' | '));
  if(process.env.SHOT){ await pg.evaluate(([x,z])=>{ const Y=new Date().getUTCFullYear()+1; FTREES.shift=Date.UTC(Y,8,20,12)-Date.now(); for(let i=1;i<8;i++){ const P=ORCHARD.PL[i]; P.who='x'+i; P.name=['MARA','DEX','JO','KIT','SAL','REN','BO'][i-1];
      P.d.trees=[0,1,2,3].map(j=>{ const k=FTREES.ids[(i*4+j)%FTREES.ids.length], s=FTREES.plant(k); s.g=60; s.at=FTREES.now(); return s; }); } ORCHARD.redraw(); __dbg.ui().setView&&__dbg.ui().setView('third'); __dbg.ui().goTo(x-9*ORCHARD.T,z+12*ORCHARD.T,'up',Math.PI*.8); },site);
    await pg.waitForTimeout(12000); await pg.screenshot({path:path.join(process.env.SHOT,'orchard.png')}); }
  // a big pot at home: dirt, a lemon, water, and in winter its fruit
  const p=await pg.evaluate(()=>{ const W=TREEPOTDBG.wire, THREE=TREEPOTDBG.THREE, G=new THREE.Group(), d=new THREE.Mesh(new THREE.CircleGeometry(.2,8),new THREE.MeshBasicMaterial()); d.name='tpdirt'; G.add(d); const t=new THREE.Group(); t.name='tptree'; G.add(t);
    let th=null; const un={obj:G,id:'testpot',th:[]}; W(un,{hit:(u,name,act)=>{ th={name:name(),act:()=>{ act(th); th.name=name(); }}; return th; }});
    for(const k of FTREES.ids)for(const id of [FTREES.CAT[k].sapling,FTREES.CAT[k].pipItem]){ const n=FORAGE.has(id); if(n)FORAGE.take(id,n); } FORAGE.give('dirt',1); FORAGE.give('sp_lemon',1); FORAGE.give('water',2); th.act(); const a=th.name; th.act(); const b=th.name; const s=TREEPOTDBG().S.testpot.t; s.g=5; s.at=FTREES.now(); s.wet=FTREES.now()+9e9;
    const Y=new Date().getUTCFullYear()+1; FTREES.shift=Date.UTC(Y,0,20,12)-Date.now(); const n0=FORAGE.has('tf_lemon'); th.act(); const got=FORAGE.has('tf_lemon')-n0; FTREES.shift=0; return {a,b,got,k:s.k}; });
  ok(/DIRT/.test(p.a)&&p.k==='lemon'&&p.got>0,'a big pot at home: dirt, a lemon planted, and lemons in January: '+JSON.stringify(p));
  ok(!errs.length,'no page errors '+errs.slice(0,3).join(' | '));
  await b.close(); process.exit(bad?1:0); })();
