// THE PET STORE'S CAGES AND THE AQUARIUM (src/146zj-pets.js, src/146zjb-aquarium.js): node tests/petstore.cjs [out folder]. The park keeps only its birds, bees and fireflies (the subway its rats);
// every kind stands in a cage in THE PET STORE and a cage opens the adoption book on its kind; every new kind (the snake, bat, slime, songbirds, cave creatures) builds a pet;
// THE AQUARIUM on the Hudson has a tank of every fish and sea animal, buying one keeps it with your account and puts it in your apartment's tank. With an out folder, shots.
const {chromium}=require('playwright'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader'],...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{})}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; }); pg.on('console',m=>{ if(/PET|AQUA/.test(m.text()))console.log('  console:',m.text().slice(0,200)); });
  { const DIR=require('path').join(process.cwd(),'node_modules/@dimforge/rapier3d-compat'), fs=require('fs');
    await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/,r=>{ const f=require('path').join(DIR,new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1]||''); if(!fs.existsSync(f))return r.continue();
      r.fulfill({path:f,contentType:/\.wasm$/.test(f)?'application/wasm':'text/javascript'}); }); }
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms=120000)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(400))if(await pg.evaluate(f))return true; return false; };
  const shot=async n=>{ if(OUT){ require('fs').mkdirSync(OUT,{recursive:true}); await pg.screenshot({path:require('path').join(OUT,n+'.png')}); } };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.evaluate(()=>{ for(const k of ['UI','OWNED','pos'])if(!window[k])window[k]=PETS.dbg[k]; });
  // the park: only birds, bees and fireflies walk or fly there now
  await U(()=>CREATS.length>0,60000); await wait(4000);
  const park=await pg.evaluate(()=>{ const K=new Set(); for(const N of CREATS)K.add(String(N.key).replace(/#\d+$/,'').replace(/\d+$/,'').toLowerCase()); return [...K]; });
  const ANIMALS=['snake','spider','bat','wasp','slime','fox','deer','wolf','bear','cat','blackcat','dog','wildhorse','ibex','lion','elephant','giraffe','zebra','camel','raptor','stego','brachio','ptera','frog','ant','beetle','mantis','snail','slug','crab'];
  rec('the park keeps no animals but its birds, bees, fireflies and the farm\'s',!park.some(k=>ANIMALS.some(a=>k===a||k.startsWith(a+' ')||k===a.toUpperCase())),park.join(','));
  // every new kind builds a pet body no bigger than a pet
  const NEW=['snake','bat','slime','pitsnake','cavebat','greenslime','robin','bluejay','cardinal','oriole','starling','sparrow','mockingbird','redwing','redtail','heron','squirrel','giantrat','cavefrog','radspider','giantwasp'];
  const nk=await pg.evaluate(async NEW=>{ const I=await PETS.idx(), out=[]; for(const k of NEW){ const K=I.by[k]; if(!K){ out.push(k+':none'); continue; } const P=PETS.decode(k+'|||'+'|100|0'); P.c=K.zones.map(z=>z[1]);
    try{ const N=await PETS.make('t'+k,P,()=>({x:pos.x,z:pos.z,y:0,hd:0}),{}); if(!N)out.push(k+':nobody'); else { if(N.H>1.3*PETS.WU)out.push(k+':too big'); PETS.drop(N); } }catch(e){ out.push(k+':'+e.message); } } return out; },NEW);
  rec('every new kind (snake, bat, slime, songbirds, cave creatures) builds a pet',!nk.length,nk.join(' '));
  // the pet shops and the barn: each its own kinds in its cages, its book only its kinds, a cage opens the book on its kind
  const SH=[['pets','beagle',30],['reptiles','bigliz',30],['birdshop','cardinal',20],['butterflies','butterfly',20],['barn','cow',25]];
  for(const [id,key,min] of SH){ const st=await pg.evaluate(async([id,key])=>{ await ROOMS.enter(id); for(let i=0;i<300&&!(PETS.caged&&PETS.caged[id]);i++)await new Promise(r=>setTimeout(r,200)); const I=await PETS.idx();
      const t=UI.things.find(t=>t.name==='A '+I.by[key].name+' ($'+/\$(\d+)\)$/.exec(t.name||'')?.[1]+')')||UI.things.find(t=>t.name.startsWith('A '+I.by[key].name+' ($')); if(!t)return {caged:PETS.caged&&PETS.caged[id],cage:false};
      t.act(t); for(let i=0;i<50&&!(PETS.inShop()&&document.querySelector('#lptk').value===key);i++)await new Promise(r=>setTimeout(r,100));
      const opts=[...document.querySelectorAll('#lptg option')].map(o=>o.value), only=opts.every(g=>I.kinds.some(k=>k.group===g&&k.shop===id));
      for(let i=0;i<150&&PETS.live()<5;i++)await new Promise(r=>setTimeout(r,200));
      return {caged:PETS.caged[id],cage:true,kind:document.querySelector('#lptk').value,groups:opts.length,only,live:PETS.live()}; },[id,key]);
    rec('the '+id+' shop: its cages, its animals alive in them, a cage opens its book on its kind, the book only its kinds',st.caged>=min&&st.cage&&st.kind===key&&st.only&&st.live>=5,JSON.stringify(st));
    if(OUT){ await pg.evaluate(()=>{ document.querySelector('#lclose')&&document.querySelector('#lclose').click(); UI.setView&&UI.setView('third'); }); await wait(2500); await shot('shop-'+id); }
    await pg.evaluate(id=>{ document.querySelector('#lclose')&&document.querySelector('#lclose').click(); ROOMS.goOut(id); },id); await wait(3000); }
  const fm=await pg.evaluate(()=>{ const n={}; for(const N of CREATS){ const k=String(N.key).replace(/#\d+$/,'').replace(/\d+$/,'').toLowerCase(); n[k]=(n[k]||0)+1; } const B=MSHOP.at.barn; return {cows:n.cow||0,pigs:n.pig||0,horses:n.horse||0,barn:!!(B&&B.door),door:B&&B.door}; });
  rec('the park\'s farm: the barn to go into, cows, pigs and horses in the paddock',fm.barn&&fm.cows>0&&fm.pigs>0&&fm.horses>0,JSON.stringify(fm));
  // the aquarium
  const aq=await pg.evaluate(async()=>{ for(let i=0;i<200&&!(window.AQUA&&AQUA.tanks.length);i++)await new Promise(r=>setTimeout(r,300)); const d=MSHOP.at.aquarium&&MSHOP.at.aquarium.door; return {tanks:AQUA.tanks.length,kinds:AQUA.kinds.length,door:d}; });
  rec('THE AQUARIUM on the Hudson: a tank for every fish and sea animal',aq.tanks>=50&&aq.tanks===aq.kinds,JSON.stringify(aq));
  const by=await pg.evaluate(async()=>{ INV.cash=500; const c0=INV.cash, n0=PETS.sea().length, t=UI.things.find(t=>/^A CLOWNFISH/.test(t.name)); if(!t)return {tank:false}; t.act(t); t.act(t); await new Promise(r=>setTimeout(r,200));
    return {tank:true,paid:c0-INV.cash,sea:PETS.sea().length-n0,saved:/clownfish/.test(OWNED.get('tank')||'')}; });
  rec('buying from a tank takes the price and keeps the fish with your account',by.tank&&by.paid>0&&by.sea===1&&by.saved,JSON.stringify(by));
  const mn=await pg.evaluate(()=>{ const el=document.createElement('div'); document.body.appendChild(el); PETS.menu(el); const ok=/IN YOUR FISH TANK/.test(el.innerHTML)&&/CLOWNFISH/.test(el.innerHTML); el.remove(); return ok; });
  rec('the menu\'s PETS lists it in your fish tank',mn);
  const cr=await pg.evaluate(async()=>{ for(let i=0;i<50&&!UI.things.some(t=>/HERMIT CRAB \(ADOPT\)/.test(t.name));i++)await new Promise(r=>setTimeout(r,200)); const t=UI.things.find(t=>/HERMIT CRAB \(ADOPT\)/.test(t.name)); if(!t)return {crab:false}; t.act(t);
    for(let i=0;i<50&&!(PETS.inShop()&&document.querySelector('#lptk').value==='hermit');i++)await new Promise(r=>setTimeout(r,100)); const k=document.querySelector('#lptk').value; document.querySelector('#lclose').click(); return {crab:true,kind:k}; });
  rec('the aquarium\'s crabs open the adoption book on the crab',cr.crab&&cr.kind==='hermit',JSON.stringify(cr));
  if(OUT&&aq.door){ await pg.evaluate(d=>{ pos.set(d[0],0,d[1]); },aq.door); await wait(6000); await shot('aquarium'); }

  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,n])=>n+'× '+k).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'ALL PASS'); process.exit(bad?1:0); })();
