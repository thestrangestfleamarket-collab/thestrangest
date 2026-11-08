// THE POLYFORK AVATAR (src/111c-avatar.js, data/pfavatar*.json): node tests/avatar.cjs [out folder]. You are the avatar, the only body you play (the Walker is never drawn); its figure's wardrobe loads and you are
// Polyfork's man or woman on your rig, dressed as chosen; clothes hide the body under them (Polyfork's own regions), a hat that covers the hair hides it, the look's code
// round-trips and another player's copy is the same body; with an out folder, third-person shots in an open field.
const {chromium}=require('playwright'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  // the physics engine from this checkout (the page fetches it from jsDelivr; a runner may not reach it)
  { const DIR=require('path').join(process.cwd(),'node_modules/@dimforge/rapier3d-compat'), fs=require('fs');
    await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/,r=>{ const f=require('path').join(DIR,new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1]||''); if(!fs.existsSync(f))return r.continue();
      r.fulfill({path:f,contentType:/\.wasm$/.test(f)?'application/wasm':'text/javascript'}); }); }
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms=120000)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(400))if(await pg.evaluate(f))return true; return false; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  rec('you are the avatar from the start, its wardrobe loaded; no other body to pick',await U(()=>AVATAR.ready()&&BODIES.pick()==='avatar'&&!document.querySelector('#looks [data-k=body]')));
  rec('the Walker is never drawn; YOU has none of its options',await pg.evaluate(()=>W3.meshes.every(m=>!m.visible)&&!document.querySelector('#lform,#lhair,#lbeard,#ldesign')));
  const tris=()=>pg.evaluate(()=>{ const g=BODIES.by.avatar.GEO; return g?g.attributes.position.count/3:0; });
  await wait(500); const t0=await tris(); rec('you are the avatar, dressed (hair, tee, trousers, sneakers)',t0>2000&&await pg.evaluate(()=>W3.body.on),'tris '+t0);
  const id=(slot,label)=>pg.evaluate(([s,l])=>{ const o=AVATAR.pieces.find(x=>x.slot===s&&x.label===l); return o?o.n:null; },[slot,label]);
  await pg.evaluate(()=>AVATAR.set({}));
  const bare=await pg.evaluate(async()=>{ const L=AVATAR.L(); const keep=JSON.stringify(L.w); for(const s of Object.keys(L.w))await AVATAR.wear(s,null); const n=BODIES.by.avatar.GEO.attributes.position.count/3; L.w=JSON.parse(keep); await AVATAR.set({}); return n; });
  rec('undressed you are the whole body, in underwear',bare>=1200&&bare<1800,'tris '+bare);   // (less the skin under the underwear: tools/pfavatar-pack.py under; and the mitten hands, cut away for the jointed ones, 7 Nov 2026)
  const trou=await id('bottom','TROUSERS'), none=await pg.evaluate(async()=>{ const L=AVATAR.L(), keep=JSON.stringify(L.w); for(const s of Object.keys(L.w))await AVATAR.wear(s,null); return keep; });
  const tr=await pg.evaluate(async n=>{ await AVATAR.wear('bottom',n); return BODIES.by.avatar.GEO.attributes.position.count/3; },trou);
  rec('trousers hide the legs and pelvis under them',tr<bare+700&&tr>bare-600,'bare '+bare+' with trousers '+tr);
  const hood=await id('hat','HOOD'), long=await id('hair','LONG');
  const hh=await pg.evaluate(async([h,l])=>{ await AVATAR.wear('hair',l); const a=BODIES.by.avatar.GEO.attributes.position.count/3; await AVATAR.wear('hat',h); const b=BODIES.by.avatar.GEO.attributes.position.count/3; await AVATAR.wear('hat',null); return [a,b]; },[hood,long]);
  rec('a hood hides the hair (and ears) under it',hh[1]>0&&hh[1]<hh[0]+600,JSON.stringify(hh));
  await pg.evaluate(async k=>{ const L=AVATAR.L(); L.w=JSON.parse(k); await AVATAR.set({}); },none);
  const bf=await pg.evaluate(async()=>{ const a=BODIES.by.avatar.GEO.attributes.position.count/3; LOOKS.L.bare=true; await LOOKS.onChange(); const b=BODIES.by.avatar.GEO.attributes.position.count/3, c=BODIES.by.avatar.look(); LOOKS.L.bare=false; await LOOKS.onChange(); return {a,b,c}; });
  rec('barefoot takes your shoes off, and other players see it',bf.b<bf.a&&/\.1$/.test(bf.c),JSON.stringify(bf));
  const dy=await pg.evaluate(async()=>{ LOOKS.over.pants='#34507e'; await LOOKS.onChange(); const c=BODIES.by.avatar.look(); delete LOOKS.over.pants; await LOOKS.onChange(); return c; });
  rec('worn clothes from the rack dye the avatar (jeans: your bottoms), and other players see it',/~34507e/.test(dy),dy);
  // the same moves and physics as the Walker had: the rig poses the avatar, and the physics body (DISPLAY's BODY: Rapier, the rig's 15 parts) moves its bones
  const ph=await pg.evaluate(async()=>{ const PB=__dbg.PB||window.PB; if(PB)PB.set(true,true); const t0=performance.now(); while(PB&&!PB.ready&&performance.now()-t0<60000)await new Promise(r=>setTimeout(r,300));
    const n0=W3.body.physN||0; dispatchEvent(new KeyboardEvent('keydown',{key:'w',bubbles:true})); await new Promise(r=>setTimeout(r,2500)); dispatchEvent(new KeyboardEvent('keyup',{key:'w',bubbles:true})); await new Promise(r=>setTimeout(r,800));
    const g=BODIES.by.avatar.GEO, me=W3.group.children.find(m=>m.geometry===g); return {ready:!!(PB&&PB.ready),steps:(W3.body.physN||0)-n0,shown:!!(me&&me.visible)}; });
  rec('the physics body moves the avatar as it moved the Walker',ph.ready&&ph.steps>=5&&ph.shown,JSON.stringify(ph));
  // every garment the cast wears (owner, 5 Nov 2026), and the back and both hands: each slot offers them, a pack or a held thing adds to you, a tool in that hand puts it down
  const cnt=await pg.evaluate(()=>({...Object.fromEntries(['hat','neck','back','bottom'].map(s=>[s,document.querySelectorAll('#lavt-'+s+' option').length-1])),hands:!!document.getElementById('lavt-righthand')||!!document.getElementById('lavt-lefthand')}));
  rec('the whole cast\'s wardrobe is offered by kind: hats, neck, back; no right or left hand (owner, 8 Nov 2026: "you cant just put them in your hand as props")',cnt.hat>=35&&cnt.neck>=20&&cnt.back>=10&&!cnt.hands,JSON.stringify(cnt));
  // every version too (owner, 5 Nov 2026), under its kind: TROUSERS lists each one who wears trousers, grouped by theme
  const tv=await pg.evaluate(async()=>{ const p=AVATAR.pieces.find(x=>x.slot==='bottom'&&x.label==='TROUSERS'); await AVATAR.wear('bottom',p.n); AVATAR.draw(); const s=document.getElementById('lav-bottom');
    return {kind:document.getElementById('lavt-bottom').value,versions:s.options.length,groups:s.querySelectorAll('optgroup').length,all:AVATAR.pieces.length}; });
  rec('every version of a garment: TROUSERS offers dozens, grouped by theme',tv.kind==='TROUSERS'&&tv.versions>=40&&tv.groups>=10&&tv.all>=900,JSON.stringify(tv));
  const pk=await id('back','BACKPACK'), fr=await pg.evaluate(()=>(AVATAR.pieces.find(p=>p.slot==='righthand')||{}).n), bk=await pg.evaluate(()=>(AVATAR.pieces.find(p=>p.slot==='lefthand')||{}).n);
  const hd=await pg.evaluate(async([pk,fr,bk])=>{ const t=()=>BODIES.by.avatar.GEO.attributes.position.count/3, a=t(); await AVATAR.wear('back',pk); const b=t(); await AVATAR.wear('righthand',fr); await AVATAR.wear('lefthand',bk); const c=t(), code=AVATAR.code();
    const was=WIELD.on; WIELD.on='net'; await AVATAR.set({}); const d=t(), seen=BODIES.by.avatar.look(); WIELD.on=was; await AVATAR.set({});
    return {a,b,c,d,code,seen,w:JSON.stringify(AVATAR.decode(code).w),rt:JSON.stringify(AVATAR.decode(code))===JSON.stringify(AVATAR.L())}; },[pk,fr,bk]);
  rec('a backpack is worn, a thing put in either hand from the wardrobe is not, and the look round-trips',hd.b>hd.a&&hd.c===hd.b&&hd.rt&&!/hand/.test(hd.w),JSON.stringify({a:hd.a,b:hd.b,c:hd.c,code:hd.code}));
  const oldc=await pg.evaluate(()=>{ const a=AVATAR.code().split('.').slice(0,17); return JSON.stringify(AVATAR.decode(a.join('.')).w); });
  rec('a look saved before the new slots still reads the same',!/back|hand"/.test(oldc)&&/top/.test(oldc),oldc);
  const mc=await pg.evaluate(async pk=>{ await AVATAR.wear('back',pk); AVATAR.draw(); const k=document.getElementById('lavk-back'), ins=[...k.querySelectorAll('input')], pack=ins.find(i=>/pack colour$/.test(i.getAttribute('aria-label')));
    pack.value='#ff00ff'; pack.dispatchEvent(new Event('change',{bubbles:true})); await new Promise(r=>setTimeout(r,300)); await AVATAR.set({}); const C=BODIES.by.avatar.GEO.attributes.color.array; let mag=0; for(let i=0;i<C.length;i+=3)if(C[i]>.9&&C[i+1]<.05&&C[i+2]>.9)mag++;
    const code=AVATAR.code(), old=AVATAR.decode(code.replace(/~[0-9a-f_]+/,'~ff00ff')); return {n:ins.length,mag,code,rt:JSON.stringify(AVATAR.decode(code))===JSON.stringify(AVATAR.L()),old:JSON.stringify(old.w.back)}; },pk);
  rec('a piece of many colours has a colour for each part: the backpack\'s pack goes magenta, the look keeps it, and an old single colour still reads',mc.n>=5&&mc.mag>50&&/_/.test(mc.code)&&mc.rt&&/ff00ff/.test(mc.old),JSON.stringify(mc));
  await pg.evaluate(async()=>{ for(const s of ['back','righthand','lefthand'])await AVATAR.wear(s,null); });
  // OUTFITS: every one of the cast's whole look, by theme then who; it all goes on at once
  const of=await pg.evaluate(async()=>{ const O=AVATAR.outfits, i=O.findIndex(o=>o.t==='SAMURAI WARRIOR'), keep=JSON.stringify(AVATAR.L().w); await AVATAR.outfit(i); const w=AVATAR.L().w, n=Object.keys(w).length, t=BODIES.by.avatar.GEO.attributes.position.count/3;
    const ok=Object.entries(O[i].w).filter(([s])=>w[s]).every(([s,[n]])=>w[s][0]===n); AVATAR.L().w=JSON.parse(keep); await AVATAR.set({});
    return {outfits:O.length,themes:new Set(O.map(o=>o.g)).size,slots:n,tris:t,ok,menu:document.querySelectorAll('#lavog option').length-1}; });
  rec('outfits: the whole cast, by theme; one goes on all together',of.outfits>=190&&of.themes>=30&&of.slots>=5&&of.ok&&of.tris>3000&&of.menu===of.themes,JSON.stringify(of));
  const c1=await pg.evaluate(()=>AVATAR.code()); rec('the look round-trips as a code',await pg.evaluate(c=>AVATAR.decode(c)&&JSON.stringify(AVATAR.decode(c))===JSON.stringify(AVATAR.L()),c1),c1);
  const rm=await pg.evaluate(c=>{ const v=BODIES.by.avatar.variant(c); return v?v.geo().attributes.position.count/3:0; },c1); rec('another player wearing it gets the same body',rm===await tris(),rm);
  // THE LANYARD (owner, 8 Nov 2026): you start wearing your passport round your neck; it is in the look's code (others see it) and taking it off leaves it in the pack
  const ly=await pg.evaluate(async()=>{ const on=PASSPORT.worn, c=AVATAR.code(), t1=BODIES.by.avatar.GEO.attributes.position.count/3; PASSPORT.wear(false); await new Promise(r=>setTimeout(r,1500));
    const t0=BODIES.by.avatar.GEO.attributes.position.count/3, off=PASSPORT.worn, has=FORAGE.has('passport'), drop=BAG.drop?BAG.drop('passport'):false; PASSPORT.wear(true); await new Promise(r=>setTimeout(r,1500));
    return {on,off,lan:AVATAR.decode(c).lan,t1,t0,has,drop,back:PASSPORT.worn}; });
  rec('the passport on its lanyard: worn from the start, in the code, off to the pack and on again; it cannot be dropped',ly.on&&ly.lan===1&&!ly.off&&ly.t1>ly.t0&&ly.has&&ly.drop===false&&ly.back,JSON.stringify(ly));
  await pg.evaluate(()=>AVATAR.set({f:'f'})); rec('the woman: her wardrobe loads, no beards offered',await U(()=>AVATAR.ready()&&AVATAR.L().f==='f'&&![...document.querySelectorAll('#lavt-face option')].some(o=>/BEARD|STUBBLE|GOATEE|MOUSTACHE/.test(o.textContent))));
  const fc=await pg.evaluate(()=>{ const g=BODIES.by.avatar.GEO; return g.attributes.position.count/3; }); rec('she is dressed too',fc>2000,'tris '+fc);
  await pg.evaluate(()=>AVATAR.set({b:2,h:108})); const tall=await pg.evaluate(()=>BODIES.by.avatar.S); await pg.evaluate(()=>AVATAR.set({h:92})); const short=await pg.evaluate(()=>BODIES.by.avatar.S);
  rec('height: taller is drawn bigger',tall>short*1.1,tall.toFixed(3)+' vs '+short.toFixed(3));
  if(OUT){   // in third person, the camera in front of you, in the park's open meadow (the shots' rule: an open field, third or first person)
    const look=async(nm,set,wear)=>{ await pg.evaluate(async([set,wear])=>{ document.getElementById('looks').hidden=true; const L=AVATAR.L(); L.w={}; await AVATAR.set(set);
        for(const [s,l,c] of wear){ const o=AVATAR.pieces.find(x=>x.slot===s&&x.label===l); await AVATAR.wear(s,o?o.n:null,c); }
        const UI=__dbg.UI; UI.setView('third'); UI.dist*=.55; SHARED.pitchTo=SHARED.pitch=.22; SHARED.yawTo=SHARED.yaw=SHARED.heading; },[set,wear]);
      await wait(2500); await pg.screenshot({path:OUT+'/avatar-'+nm+'.png'}); };
    await look('man',{f:'m',b:1,h:100},[['hair','SIDE PART'],['top','SHIRT'],['coat','JACKET','7a3b2e'],['bottom','TROUSERS'],['feet','SHOES']]);
    await look('woman',{f:'f',b:0,h:97},[['hair','PONYTAIL'],['top','T-SHIRT','2f6d8c'],['bottom','PLEATED SKIRT','3b3b48'],['feet','SNEAKERS'],['eyes','CAT-EYES']]);
    await look('broad',{f:'m',b:2,h:106,skin:'7e4c2f',hair:'1d1712'},[['hair','AFRO'],['face','FULL BEARD'],['top','WORK SHIRT'],['coat','HI-VIS VEST'],['bottom','DUNGAREES'],['feet','WORK BOOTS'],['hat','HARD HAT']]);
    await look('coat',{f:'f',b:1,h:102,skin:'c08a64',hair:'b98a4e'},[['hair','LONG'],['top','SHIRT'],['coat','LONG COAT','5a2a3a'],['bottom','TROUSERS'],['feet','TALL BOOTS'],['hat','FELT HAT'],['neck','SCARF']]);
    await pg.evaluate(()=>LOOKS.open()); await wait(800); await pg.screenshot({path:OUT+'/avatar-panel.png'}); }
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,n])=>n+'× '+k).join(' | '));
  console.log(bad?bad+' FAILED':'ALL PASS'); await b.close(); process.exit(bad?1:0); })();
