// THE PETS (src/146zj-pets.js, data/pets/*.json from tools/pets-bake.py): node tests/pets.cjs [out folder]. No pet at first (YOU's PET tab says where to adopt one); THE PET STORE's
// adoption book opens the PET tab with every kind; adopting takes the price and keeps the pet with your account; it follows you as you walk, other players get its code;
// colours, shape and size change it; every kind builds a body no bigger than a pet. With an out folder, third-person shots of pets in an open field.
const {chromium}=require('playwright'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader'],...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{})}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; }); pg.on('console',m=>{ if(/PET/.test(m.text()))console.log('  console:',m.text().slice(0,200)); });
  { const DIR=require('path').join(process.cwd(),'node_modules/@dimforge/rapier3d-compat'), fs=require('fs');
    await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/,r=>{ const f=require('path').join(DIR,new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1]||''); if(!fs.existsSync(f))return r.continue();
      r.fulfill({path:f,contentType:/\.wasm$/.test(f)?'application/wasm':'text/javascript'}); }); }
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms=120000)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(400))if(await pg.evaluate(f))return true; return false; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.evaluate(()=>{ for(const k of ['UI','OWNED','pos'])if(!window[k])window[k]=PETS.dbg[k]; });
  const home=await pg.evaluate(()=>[pos.x,pos.z,0,SHARED.heading]);
  rec('no pet at first; YOU has a PET tab saying where to adopt one',await pg.evaluate(async()=>{ LOOKS.open(); await PETS.idx(); PETS.draw(); LOOKS.tab('pet'); const ok=!PETS.my()&&!document.querySelector('.ltabs [data-t=pet]').hidden&&/PET STORE/.test(document.querySelector('#lptnone').textContent)&&!document.querySelector('[data-k=pt-none]').hidden; document.querySelector('#lclose').click(); return ok; }));
  const n=await pg.evaluate(async()=>(await PETS.idx()).kinds.length); rec('the kinds: cats, dogs, birds and every other land and air animal',n>=60,n+' kinds');
  // the store: in through its door, the adoption book
  const sh=await pg.evaluate(async()=>{ await ROOMS.enter('pets'); for(let i=0;i<100&&!UI.things.some(t=>/ADOPTION BOOK/.test(t.name));i++)await new Promise(r=>setTimeout(r,200)); const th=UI.things.find(t=>/ADOPTION BOOK/.test(t.name)); if(!th)return {book:false}; th.act(th);
    for(let i=0;i<50&&!PETS.inShop();i++)await new Promise(r=>setTimeout(r,100)); const k=document.querySelectorAll('#lptk option').length, g=document.querySelectorAll('#lptg option').length; return {book:true,shop:PETS.inShop(),groups:g,kinds:k,tab:!document.querySelector('.ltab[data-t=pet]').hidden}; });
  rec('THE PET STORE\'s adoption book opens the PET tab with every kind',sh.book&&sh.shop&&sh.groups>=6&&sh.kinds>=3&&sh.tab,JSON.stringify(sh));
  const ad=await pg.evaluate(async()=>{ PETS.choose('dog'); PETS.set({n:'Biscuit',c:['#c08040','#f4f0e0','#e0b070','#c09060','#1a1410','#c7778e']}); INV.cash=500; const c0=INV.cash; PETS.adopt(); await new Promise(r=>setTimeout(r,300));
    return {my:PETS.my()&&PETS.my().k,paid:c0-INV.cash,saved:OWNED.get('pet')}; });
  rec('adopting takes the price and keeps the pet with your account',ad.my==='dog'&&ad.paid>0&&/^dog\|Biscuit/.test(ad.saved||''),JSON.stringify(ad));
  rec('in a room off the map (the store) your pet is drawn, not hidden with the street',await U(()=>{ const N=PETS.mine(); if(!N)return false; let o=N.g; while(o){ if(!o.visible||VIS.hidden(o))return false; o=o.parent; } return true; },30000));
  await pg.evaluate(async()=>{ document.querySelector('#lclose').click(); ROOMS.goOut('pets'); }); await wait(3000);
  rec('it comes out with you',await U(()=>!!(PETS.mine()&&PETS.mine().pet.k==='dog'&&PETS.mine().g.visible),60000));
  await pg.mouse.click(480,320); const x0=await pg.evaluate(()=>[pos.x,pos.z]); await pg.keyboard.down('w'); await wait(3500); await pg.keyboard.up('w'); await wait(3000);
  const fo=await pg.evaluate(x0=>{ const N=PETS.mine(), W=PETS.WU; return {moved:+(Math.hypot(pos.x-x0[0],pos.z-x0[1])/W).toFixed(2),near:+(Math.hypot(N.st.x-pos.x,N.st.z-pos.z)/W).toFixed(2)}; },x0);
  rec('it keeps up with you as you walk (metres)',fo.near<2.5,JSON.stringify(fo));
  const on=await pg.evaluate(()=>{ const c=ONLINE.mine.pf(), P=PETS.decode(c); return {c,rt:PETS.code(P)===c}; });
  rec('other players get its code (the same pet round-trips)',on.rt&&/^dog/.test(on.c),on.c);
  const ch=await pg.evaluate(async()=>{ const a=PETS.mine(), c0=Array.from(a.me.geometry.attributes.color.array.slice(0,30)).join(); PETS.set({c:['#202020','#202020','#202020','#202020','#202020','#202020'],z:150,s:PETS.my().s.map(()=>100)});
    for(let i=0;i<80&&(PETS.mine()===a||!PETS.mine());i++)await new Promise(r=>setTimeout(r,150)); const b=PETS.mine(); return {re:b!==a,col:b&&Array.from(b.me.geometry.attributes.color.array.slice(0,30)).join()!==c0,bigger:b&&b.H>a.H,saved:/\|150\|/.test(OWNED.get('pet'))}; });
  rec('colours, shape and size change it, and are kept',ch.re&&ch.col&&ch.bigger&&ch.saved,JSON.stringify(ch));
  const all=await pg.evaluate(async()=>{ const I=await PETS.idx(), out={bad:[],big:[],n:0}; for(const K of I.kinds){ try{ const P={k:K.key,n:'',c:K.zones.map(z=>z[1]),s:K.knobs.map(()=>50),z:100,h:false}; const N=await PETS.make('t'+K.key,P,()=>({x:pos.x,z:pos.z,y:SHARED.py,hd:0})); if(!(N.me.geometry.attributes.position.count>50))out.bad.push(K.key); if(N.H/PETS.WU>1.5)out.big.push(K.key+' '+(N.H/PETS.WU).toFixed(2)); out.n++; PETS.drop(N); }catch(e){ out.bad.push(K.key+': '+e.message); } } return out; });
  rec('every kind builds a pet body',all.bad.length===0&&!all.big.length&&all.n===n,JSON.stringify(all));
  // the breeds (owner, 8 Nov 2026: "try to add every breed possible"): each its own kind on the base dog or cat, its own body and coat
  const br=await pg.evaluate(async()=>{ const I=await PETS.idx(), d=I.kinds.filter(k=>k.of==='dog').length, c=I.kinds.filter(k=>k.of==='cat').length;
    const mk=async k=>{ const K=I.by[k], N=await PETS.make('b'+k,{k,n:'',c:K.zones.map(z=>z[1]),s:K.s0||K.knobs.map(()=>50),z:100,h:false},()=>({x:pos.x,z:pos.z,y:SHARED.py,hd:0})); const p=Array.from(N.me.geometry.attributes.position.array.slice(0,600)), H=N.H; PETS.drop(N); return {p,H}; };
    const dog=await mk('dog'), dach=await mk('dachshund'), lab=await mk('labrador'), dal=I.by.dalmatian;
    return {d,c,differ:dach.p.join()!==dog.p.join()&&lab.p.join()!==dach.p.join(),low:dach.H<lab.H,spots:dal.zones.some(z=>z[0]==='mark'),varieties:Object.keys(I.by.labrador.presets).length}; });
  rec('every dog and cat breed: its own body, size, coat and colour varieties',br.d>=100&&br.c>=50&&br.differ&&br.low&&br.spots&&br.varieties>=3,JSON.stringify(br));
  // the first day: the PET step chooses your permapet, any animal, free
  const fd=await pg.evaluate(async()=>{ const W=ms=>new Promise(r=>setTimeout(r,ms)), q=s=>document.querySelector('#fday '+s), c0=INV.cash; FIRSTDAY.open(); await W(300);
    q('#fdn').value='PETTEST'; q('#fdn').dispatchEvent(new Event('input')); q('#fdb').value='2000-01-01'; q('#fdb').dispatchEvent(new Event('input'));
    for(let i=0;i<3;i++){ q('[data-nav="1"]').click(); await W(400); }
    for(let i=0;i<30&&!q('#fdpet select');i++)await W(200); const g=q('#fdpet [data-pk=g]'); if(!g)return {step:false}; g.value='cats'; g.dispatchEvent(new Event('change',{bubbles:true})); await W(300);
    const k=q('#fdpet [data-pk=k]'); k.value='siamese'; k.dispatchEvent(new Event('change',{bubbles:true})); await W(300); const n=q('#fdpet [data-pk=n]'); n.value='Miso'; n.dispatchEvent(new Event('input',{bubbles:true}));
    await W(1500); const cv=q('canvas'), px=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; let lit=0; for(let i=3;i<px.length;i+=4)if(px[i]>0)lit++;
    q('[data-nav="1"]').click(); await W(500); const P=PETS.perma(), D=P&&PETS.decode(P.c);
    return {step:true,kinds:k.options.length,portrait:lit,perma:D&&D.k,name:D&&D.n,out:!!P&&P.out,free:INV.cash===c0,list:PETS.list().length,shut:document.getElementById('fday').hidden}; });
  rec('the first day\'s PET step: any animal as your permapet, free, out with you',fd.step&&fd.kinds>=50&&fd.portrait>200&&fd.perma==='siamese'&&fd.name==='MISO'&&fd.out&&fd.free&&fd.list===2&&fd.shut,JSON.stringify(fd));
  const pm=await pg.evaluate(async()=>{ const L=PETS.list(), p=L.find(r=>r.perma), o=L.find(r=>!r.perma); const again=PETS.setPerma({k:'cat',n:'',c:[],s:[],z:100,h:false});
    FORAGE.give('g_catfood',3); p.hu=90; PETS.feed(p); const fed=p.hu;
    o.hu=100; o.hp=1; o.at=Date.now()-3600e3; p.hu=100; p.hp=1; p.at=Date.now()-3600e3; PETS.tick(false); const kept=PETS.list().length, faint=p.hp, perma=PETS.list().includes(p), gone=!PETS.list().includes(o);
    PETS.feed(p); return {again,fed,kept,faint,perma,gone,woke:p.hp}; });
  rec('your permapet can never be lost (it faints when starved, feeding wakes it); another starved pet runs away; food fills them',pm.again===false&&pm.fed<=50&&pm.perma&&pm.faint===0&&pm.gone&&pm.kept===1&&pm.woke>0,JSON.stringify(pm));
  const mn=await pg.evaluate(async()=>{ UI.menuTab('pets','mine'); await new Promise(r=>setTimeout(r,2500)); const el=document.getElementById('dpets'), t=el.textContent, cv=el.querySelector('canvas'); let lit=0;
    if(cv){ const px=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data; for(let i=3;i<px.length;i+=4)if(px[i]>0)lit++; }
    const nav=!!document.querySelector('#mnav [data-sec=pets]'); UI.toggleMenu(); return {nav,info:['MISO','SIAMESE','PERMAPET','AGE','HEALTH','HUNGER','LOYALTY','MOOD','SPEED'].filter(w=>!t.includes(w)),portrait:lit}; });
  rec('the menu\'s PETS: every pet\'s name, age, breed, kind, stats, hunger and loyalty, its portrait',mn.nav&&!mn.info.length&&mn.portrait>200,JSON.stringify(mn));
  if(OUT){ require('fs').mkdirSync(OUT,{recursive:true});   // in the park's open meadow, third person, the pet in front of you, side on
    await pg.evaluate(h=>{ document.getElementById('looks').hidden=true; UI.goTo(h[0],h[1],h[2],h[3]); },home); await wait(4000);
    for(const k of ['dog','cat','parrot','pigeon','crow','rabbit','elephant','giraffe','trex','rdragonling','lion','bee']){
      const ok=await pg.evaluate(async k=>{ const I=await PETS.idx(), K=I.by[k]; if(!K)return false; PETS.set({k,n:'',c:K.zones.map(z=>z[1]),s:K.knobs.map(()=>50),z:100}); return true; },k); if(!ok)continue;
      await U(()=>!!PETS.mine()&&PETS.mine().pet.k===PETS.my().k,30000);
      await pg.evaluate(()=>{ const N=PETS.mine(), h=SHARED.heading, W=PETS.WU; const a=h+Math.PI*.62; N.st.x=pos.x+Math.sin(a)*1.6*W; N.st.z=pos.z+Math.cos(a)*1.6*W; N.st.to=null; N.st.h=h+Math.PI/2; N.st.face=null;
        UI.setView('third'); UI.dist*=.55; SHARED.pitchTo=SHARED.pitch=.22; SHARED.yawTo=SHARED.yaw=SHARED.heading; });
      await wait(2000); await pg.screenshot({path:OUT+'/pet-'+k+'.png'}); }
    await pg.evaluate(()=>{ LOOKS.open(); LOOKS.tab('pet'); }); await wait(800); await pg.screenshot({path:OUT+'/pet-panel.png'}); }
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,v])=>v+'× '+k).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'ALL PASS'); process.exit(bad?1:0); })();
