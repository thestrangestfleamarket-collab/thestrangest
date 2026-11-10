// THE PAINTER CHECK: node tests/paint.cjs [dist/market.html] [shots dir]. A canvas from the pack opens the painter: brush, opacity, eraser, fill, eyedropper, shapes, mirror, layers, undo; it saves and opens again as it was, is signed into a one-of-a-kind painting with a price, is looked at full screen, traded (given and got) through the block, sold to the trader, and hung on your wall at home (an easel too), where a visitor's game can hang it.
const {chromium}=require('playwright');
const FILE=process.argv[2]||'dist/market.html', SHOTS=process.argv[3]||'';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const ctx=await b.newContext({viewport:{width:1280,height:800}}), pg=await ctx.newPage(), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  const url='file://'+process.cwd()+'/'+FILE;
  await pg.goto(url+'?fresh=1&hour=13&at=53,10'); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(2000);
  const px=(x,y)=>pg.evaluate(([x,y])=>PAINTER.pixel(x,y),[x,y]);
  const drag=async(pts,o={})=>{ const s=await pg.evaluate(p=>p.map(([x,y])=>PAINTER.screen(x,y)),pts); if(o.alt)await pg.keyboard.down('Alt'); await pg.mouse.move(s[0][0],s[0][1]); await pg.mouse.down(); for(const q of s.slice(1))await pg.mouse.move(q[0],q[1],{steps:6}); await pg.mouse.up(); if(o.alt)await pg.keyboard.up('Alt'); await pg.waitForTimeout(60); };
  const near=(a,c,t=40)=>a&&Math.abs(a[0]-c[0])+Math.abs(a[1]-c[1])+Math.abs(a[2]-c[2])<=t;

  ok(await pg.evaluate(()=>['paintp','artview','tradep','tradeq'].every(id=>{ const e=document.getElementById(id); return e&&getComputedStyle(e).display==='none'; })),'the painter, the viewer and the trade windows are not on screen until opened');
  // a canvas from the pack opens the painter, and the game stops taking your keys
  const A=await pg.evaluate(async()=>{ FORAGE.give('canvas_m',2); const r={rows:JSON.stringify(FORAGE.ROWB.map(f=>f('canvas_m')))}; await FORAGE.ACT.paint('canvas_m'); await new Promise(r=>setTimeout(r,400));
    return {...r,open:PAINTER.state().open,size:[PAINTER.state().w,PAINTER.state().h],layers:PAINTER.state().layers,gw:PAINTDBG().gamewin,left:INV.items.canvas_m,wip:PAINTDBG().wip,bg:PAINTER.pixel(5,5)}; });
  ok(A.rows.includes('PAINT')&&A.open&&A.size.join()==='512,512'&&A.layers===2&&A.gw==='paint','PAINT on a canvas opens the painter at 512×512 with a background and a layer ('+JSON.stringify(A)+')');
  ok(A.left===1&&A.wip===1&&near(A.bg,[244,239,228],3),'it uses the canvas: an unfinished painting in the pack, primed off-white');

  // the brush
  await pg.evaluate(()=>{ PAINTER.setTool('brush'); PAINTER.setCol('#c0272d'); PAINTER.B.size=20; PAINTER.B.op=1; PAINTER.B.hard=1; });
  await drag([[80,100],[300,100]]);
  const b1=await px(200,100), b2=await px(200,140);
  ok(near(b1,[192,39,45],10)&&near(b2,[244,239,228],3),'a red brush stroke paints red where it went and nothing beside it ('+b1+' / '+b2+')');
  await pg.evaluate(()=>{ PAINTER.setCol('#2a2470'); PAINTER.B.op=.5; });
  await drag([[100,200],[300,200],[300,203],[100,203]]);
  const b3=await px(200,201);
  ok(b3&&b3[2]>b3[0]&&b3[0]>60&&b3[0]<200,'at half opacity a stroke that crosses itself stays half strength ('+b3+')');
  // the eraser takes the layer away down to the background
  await pg.evaluate(()=>{ PAINTER.setTool('erase'); PAINTER.B.op=1; PAINTER.B.size=24; });
  await drag([[260,90],[260,110]]);
  ok(near(await px(260,100),[244,239,228],6),'the eraser takes the stroke off its layer, the background shows');
  // the eyedropper
  await pg.evaluate(()=>{ PAINTER.setTool('brush'); PAINTER.setCol('#00ff00'); });
  await drag([[150,100]],{alt:true});
  const pc=await pg.evaluate(()=>PAINTER.state().col); ok(near([1,3,5].map(i=>parseInt(pc.slice(i,i+2),16)),[192,39,45],8),'alt+click takes the colour from the painting ('+pc+')');
  // fill on the background layer leaves the red layer above it alone; undo and redo
  await pg.evaluate(()=>{ [...document.querySelectorAll('#pp-layers > div[data-i]')].find(d=>d.dataset.i==='0').click(); PAINTER.setTool('fill'); PAINTER.setCol('#6f8fe6'); PAINTER.B.op=1; });
  const cur=await pg.evaluate(()=>PAINTER.state().cur);
  await drag([[450,450]]);
  const f1=await px(450,450), f2=await px(150,100);
  ok(cur===0&&near(f1,[111,143,230],6)&&near(f2,[192,39,45],10),'fill on the background turns it blue under the red stroke ('+f1+')');
  await pg.keyboard.press('Control+z'); const u1=await px(450,450); await pg.keyboard.press('Control+Shift+z'); const u2=await px(450,450);
  ok(near(u1,[244,239,228],3)&&near(u2,[111,143,230],6),'Ctrl+Z takes the fill back, Ctrl+Shift+Z puts it back');
  // shapes and the mirror on a new layer
  await pg.evaluate(()=>{ document.getElementById('pp-ladd').click(); PAINTER.setTool('rect'); PAINTER.setCol('#000000'); PAINTER.B.size=6; PAINTER.B.fillShape=false; });
  await drag([[60,300],[200,420]]);
  const r1=await px(60,360), r2=await px(130,360);
  ok(near(r1,[0,0,0],20)&&!near(r2,[0,0,0],60),'a box is an outline: its edge black, its middle not ('+r1+' / '+r2+')');
  await pg.keyboard.press('m'); await pg.evaluate(()=>{ PAINTER.setTool('brush'); PAINTER.setCol('#e8a33d'); PAINTER.B.size=16; });
  await drag([[40,470],[90,470]]);
  const m1=await px(512-60,470);
  ok(near(m1,[232,163,61],12),'MIRROR paints the other half too ('+m1+')');
  await pg.keyboard.press('m');
  // keys pick tools and sizes; the game does not move
  const K=await pg.evaluate(()=>({p:SHARED.px||0,z:SHARED.pz||0}));
  await pg.keyboard.press('e'); const t1=await pg.evaluate(()=>PAINTER.state().tool); await pg.keyboard.press('b'); await pg.keyboard.press(']'); const s1=await pg.evaluate(()=>PAINTER.state().size);
  await pg.keyboard.down('w'); await pg.waitForTimeout(400); await pg.keyboard.up('w'); const K2=await pg.evaluate(()=>({p:SHARED.px||0,z:SHARED.pz||0}));
  ok(t1==='erase'&&s1>16&&K.p===K2.p&&K.z===K2.z,'E and B pick tools, ] makes the brush bigger, W does not walk while painting');
  const L=await pg.evaluate(()=>PAINTER.state().layers);
  ok(L===3,'NEW adds a layer ('+L+')');
  if(SHOTS){ await pg.screenshot({path:SHOTS+'/painter.png'}); }

  // SAVE & CLOSE keeps it; PAINT opens it again as it was
  const S=await pg.evaluate(async()=>{ document.getElementById('pp-close').click(); await new Promise(r=>setTimeout(r,600)); const M=PAINTINGS.mine(), id=Object.keys(M.wip)[0];
    const d=await PAINTINGS.ART.get('w'+id); return {open:PAINTER.state().open,gw:PAINTDBG().gamewin,id,th:!!(M.wip[id]&&M.wip[id].th),saved:!!d&&JSON.parse(d).layers.length}; });
  ok(!S.open&&!S.gw&&S.th&&S.saved===3,'SAVE & CLOSE shuts it, gives the game back and keeps its three layers ('+JSON.stringify(S)+')');
  await pg.evaluate(id=>FORAGE.ACT.paint('wip_'+id),S.id); await pg.waitForFunction(()=>PAINTER.state().open&&PAINTER.state().layers===3,null,{timeout:10000});
  ok(near(await px(150,100),[192,39,45],10)&&near(await px(450,450),[111,143,230],6),'opened again from the pack it is as it was');

  // FINISH and sign
  await pg.click('#pp-done'); await pg.fill('#pp-title','Red Over Blue'); await pg.click('[data-fr="oak"]'); await pg.click('#pp-sign'); await pg.waitForTimeout(800);
  const F=await pg.evaluate(()=>{ const M=PAINTINGS.mine(), id=Object.keys(M.art)[0], a=M.art[id]; return {id,a:a&&{t:a.t,fr:a.fr,by:a.by,e:a.e},has:INV.items['pt_'+id],wip:Object.keys(M.wip).length,name:FORAGE.name('pt_'+id),value:ITEMS.prop('pt_'+id,'value'),burn:ITEMS.prop('pt_'+id,'burnable'),sell:ITEMS.prop('pt_'+id,'sellable'),open:PAINTER.state().open,gw:PAINTDBG().gamewin,rows:JSON.stringify(FORAGE.ROWB.map(f=>f('pt_'+id)))}; });
  ok(F.a&&F.a.t==='RED OVER BLUE'&&F.a.fr==='oak'&&F.has===1&&F.wip===0&&!F.open&&!F.gw,'FINISH signs it: a painting in the pack, titled and framed, the unfinished one gone ('+JSON.stringify(F)+')');
  ok(F.name==='PAINTING: “RED OVER BLUE”'&&F.value>1&&F.burn===true&&F.sell===true&&F.rows.includes('VIEW'),'it is a painting on the item model: it has a price, it burns, it sells');
  await pg.waitForTimeout(500); const D=await pg.evaluate(async id=>{ const d=await PAINTINGS.ART.get('a'+id), w=await PAINTINGS.ART.get('w'+id); return {d:d&&d.slice(0,15),len:d&&d.length,w}; },F.id);
  ok(D.d==='data:image/webp'&&D.len>1000&&!D.w,'its picture is kept, the unfinished layers let go ('+JSON.stringify(D)+')');
  // a blank one is worth a dollar
  const blank=await pg.evaluate(async()=>{ await FORAGE.ACT.paint('canvas_m'); await new Promise(r=>setTimeout(r,300)); document.getElementById('pp-done').click(); document.getElementById('pp-title').value='NOTHING'; document.getElementById('pp-sign').click(); await new Promise(r=>setTimeout(r,500));
    const M=PAINTINGS.mine(), id=Object.keys(M.art).find(k=>M.art[k].t==='NOTHING'); return {id,v:ITEMS.prop('pt_'+id,'value')}; });
  ok(blank.v===1,'a blank canvas signed is worth $1 ('+blank.v+')');
  // looking at it
  const Vw=await pg.evaluate(async id=>{ FORAGE.ACT.artview('pt_'+id); await new Promise(r=>setTimeout(r,500)); const v=document.getElementById('artview'), im=v.querySelector('img'); return {open:!v.hidden,src:im&&im.src.slice(0,15),t:v.textContent.includes('RED OVER BLUE')}; },F.id);
  if(SHOTS)await pg.screenshot({path:SHOTS+'/view.png'});
  await pg.keyboard.press('Escape');
  ok(Vw.open&&Vw.src==='data:image/webp'&&Vw.t&&await pg.evaluate(()=>getComputedStyle(document.getElementById('artview')).display==='none'),'VIEW shows it full screen with its title; Esc closes it');

  // the trader buys paintings at their worth
  const Sh=await pg.evaluate(()=>{ const r=(CHARS.store&&CHARS.store.trader)||(CHARS.rec&&CHARS.rec('trader')), tr=r&&r.trade; return {sells:!!tr&&tr.sells.includes('canvas_m'),buys:!!tr&&(tr.buys||[]).includes('paintings'),k:FORAGE.BUYK.paintings}; });
  ok(Sh.k&&Sh.k[0]==='pt_'&&Sh.sells&&Sh.buys,'THE TRADER sells canvases and buys paintings ('+JSON.stringify(Sh)+')');

  // trade through the block: ask, open, put the painting in, accept, done
  const T0=await pg.evaluate(()=>{ window.__sent=[]; ONLINE.on=true; ONLINE.send=m=>__sent.push(JSON.parse(JSON.stringify(m))); ONLINE.use({id:'a',name:'ROSA'}); const card=document.getElementById('passportw'), shown=card&&card.style.display==='flex'&&/ROSA/.test(card.textContent); const bt=card&&card.querySelector('.pT'); if(bt)bt.click(); return {sent:__sent.slice(),shown}; });
  ok(T0.shown&&T0.sent.some(m=>m.t==='tr'&&m.op==='ask'&&m.to==='a'),'double-clicking a player who is standing shows their ID card, and its ASK TO TRADE asks them to trade (owner, 8 Nov 2026)');
  await pg.evaluate(()=>ONLINE.feed({t:'tr',op:'open',with:'a',name:'ROSA'}));
  ok(await pg.evaluate(()=>!document.getElementById('tradep').hidden),'they said yes: the trade window opens');
  await pg.evaluate(id=>{ [...document.querySelectorAll('#tradep [data-add]')].find(b=>b.dataset.add==='pt_'+id).click(); },F.id); await pg.waitForFunction(()=>__sent.some(m=>m.op==='offer'),null,{timeout:20000}).catch(()=>{});
  const T1=await pg.evaluate(()=>__sent.filter(m=>m.op==='offer').pop());
  ok(T1&&T1.o&&T1.o.items['pt_'+F.id]===1&&T1.o.art[F.id]&&T1.o.art[F.id].t==='RED OVER BLUE'&&JSON.stringify(T1).length<2500,'putting the painting in offers it, with its title and size ('+String(JSON.stringify(T1)).length+' characters)');
  const cash0=await pg.evaluate(()=>INV.cash);
  await pg.evaluate(id=>{ ONLINE.feed({t:'tr',op:'st',mine:{items:{['pt_'+id]:1},cash:0,art:{}},theirs:{items:{canvas_s:1},cash:50,art:{}},okMe:false,okThem:true}); },F.id);
  if(SHOTS)await pg.screenshot({path:SHOTS+'/trade.png'});
  await pg.evaluate(()=>[...document.querySelectorAll('#tradep [data-ok]')][0].click()); await pg.waitForFunction(()=>__sent.some(m=>m.op==='ok'),null,{timeout:20000}).catch(()=>{});
  ok(await pg.evaluate(()=>__sent.some(m=>m.op==='ok'&&m.v===true)),'ACCEPT tells the block');
  await pg.evaluate(id=>ONLINE.feed({t:'tr',op:'done',with:'a',give:{items:{['pt_'+id]:1},cash:0,art:{}},get:{items:{canvas_s:1},cash:50,art:{}}}),F.id);
  const T2=await pg.evaluate(id=>({has:INV.items['pt_'+id]||0,meta:!!PAINTINGS.mine().art[id],can:INV.items.canvas_s||0,cash:INV.cash,open:!document.getElementById('tradep').hidden}),F.id);
  ok(T2.has===0&&!T2.meta&&T2.can===1&&T2.cash===cash0+50&&!T2.open,'done: the painting is gone to them, their canvas and $50 are yours ('+JSON.stringify(T2)+')');
  // being given a painting
  await pg.evaluate(()=>{ ONLINE.feed({t:'tr',op:'ask',from:'b',name:'BOB'}); });
  ok(await pg.evaluate(()=>!document.getElementById('tradeq').hidden),'when someone asks you, YES or NO');
  await pg.evaluate(()=>document.querySelector('#tradeq [data-a="yes"]').click());
  ok(await pg.evaluate(()=>__sent.some(m=>m.op==='yes'&&m.to==='b')),'YES goes to the block');
  const G=await pg.evaluate(()=>{ ONLINE.feed({t:'tr',op:'open',with:'b',name:'BOB'}); ONLINE.feed({t:'tr',op:'done',with:'b',give:{items:{},cash:0,art:{}},get:{items:{pt_gift12345:1},cash:0,art:{gift12345:{t:'A GIFT',by:'BOB',w:768,h:512,c:'canvas_w',fr:'gilt',d:'1 NOV 2026',e:.4}}}});
    return {has:INV.items.pt_gift12345,a:PAINTINGS.mine().art.gift12345,name:FORAGE.name('pt_gift12345')}; });
  ok(G.has===1&&G.a&&G.a.by==='BOB'&&G.a.fr==='gilt'&&G.name==='PAINTING: “A GIFT”','a painting given to you is yours, with its painter and frame');
  await pg.evaluate(()=>{ ONLINE.feed({t:'tr',op:'open',with:'a',name:'ROSA'}); ONLINE.feed({t:'tr',op:'x',why:'too far apart'}); });
  ok(await pg.evaluate(()=>document.getElementById('tradep').hidden),'a trade called off by the block closes the window');

  // a second painting to hang at home
  await pg.evaluate(async()=>{ ONLINE.on=false; FORAGE.give('canvas_w',1); await FORAGE.ACT.paint('canvas_w'); await new Promise(r=>setTimeout(r,300)); PAINTER.setTool('fill'); PAINTER.setCol('#2e7d32'); });
  await drag([[300,300]]); await pg.evaluate(()=>{ PAINTER.setTool('oval'); PAINTER.B.fillShape=true; PAINTER.setCol('#f6d36b'); }); await drag([[200,120],[560,400]]);
  await pg.evaluate(async()=>{ document.getElementById('pp-done').click(); document.getElementById('pp-title').value='SUN OVER THE PARK'; document.querySelector('[data-fr="gilt"]').click(); document.getElementById('pp-sign').click(); await new Promise(r=>setTimeout(r,1200)); });
  ok(errs.length===0,'no page errors on the street'+(errs.length?': '+errs[0].slice(0,200):''));

  // at home: hang it, and the easel (the same browser, not fresh: what you own is kept)
  await pg.goto(url+'?hour=15&place=your%20apartment',{waitUntil:'commit'}); await pg.waitForFunction(()=>window.__started,null,{timeout:400000});
  for(let i=0;i<40&&!(await pg.evaluate(()=>window.BEDROOMDBG&&BEDROOMDBG().built&&window.ROOMEDDBG&&ROOMED._api()));i++)await pg.waitForTimeout(1000);
  const H=await pg.evaluate(()=>{ const M=PAINTINGS.mine(), id=Object.keys(M.art).find(k=>M.art[k].t==='SUN OVER THE PARK'), R=ROOMED._api().R; return {id,kind:!!R.kinds['pt:'+id],easel:!!R.kinds['pt:easel'],has:INV.items['pt_'+id]}; });
  ok(H.id&&H.kind&&H.easel&&H.has===1,'at home the painting and the EASEL are things to put in your room ('+JSON.stringify(H)+')');
  const W=await pg.evaluate(async id=>{ ROOMED.buy('pt:'+id); await new Promise(r=>setTimeout(r,300)); try{ ROOMED.place(); }catch(e){} const A=ROOMED._api(), un=A.units().find(u=>u.kind==='pt:'+id);
    await new Promise(r=>setTimeout(r,1500)); let img=0; un&&un.obj.traverse(o=>{ if(o.material&&o.material.map&&o.material.map.image)img=Math.max(img,o.material.map.image.width||0); });
    return {un:!!un,mount:un&&un.mount,inPack:INV.items['pt_'+id]||0,img,L:JSON.stringify(ROOMED.snapshot().art||null)}; },H.id);
  ok(W.un&&W.mount==='wall'&&W.inPack===0&&W.img>=700,'it hangs on the wall from your pack, its picture loaded ('+JSON.stringify(W).slice(0,200)+')');
  ok(W.L&&W.L.includes('SUN OVER THE PARK'),'the room as saved says what hangs, so a visitor\'s game can hang it too');
  const Vis=await pg.evaluate(()=>{ const A=ROOMED._api(); ROOMED.apply({added:[{id:'add-900',kind:'pt:visit12345',u:1,h:1.6,v:0.02,ry:0,s:1}],art:{visit12345:{t:'THEIRS',by:'ROSA',w:512,h:512,fr:'pine'}}}); return {kind:!!A.R.kinds['pt:visit12345'],un:!!A.units().find(u=>u.kind==='pt:visit12345')}; });
  ok(Vis.kind&&Vis.un,'a painting in someone else\'s room is hung from what their room says ('+JSON.stringify(Vis)+')');
  const E=await pg.evaluate(async()=>{ ROOMED.buy('pt:easel'); await new Promise(r=>setTimeout(r,300)); try{ ROOMED.place(); }catch(e){} const un=ROOMED._api().units().find(u=>u.kind==='pt:easel'); const th=un&&un.th&&un.th.length?{name:'hit'}:null;
    await PAINTINGS.atEasel(); await new Promise(r=>setTimeout(r,500)); const s=PAINTER.state(); return {un:!!un,th:!!th,name:th&&th.name,open:s.open,w:s.w}; });
  ok(E.un&&E.th&&E.open,'the EASEL is bought in DECORATE; double-clicking it opens the painter on a canvas ('+JSON.stringify(E)+')');
  await pg.evaluate(()=>document.getElementById('pp-close').click());
  if(SHOTS){ await pg.evaluate(id=>{ const A=ROOMED._api(), un=A.units().find(u=>u.kind==='pt:'+id); const p=A.W(A.getT(un).u,A.getT(un).h,A.getT(un).v); if(window.CAMAT)CAMAT(p.x,p.y,p.z,3); },H.id); await pg.waitForTimeout(1500); await pg.screenshot({path:SHOTS+'/home.png'}); }
  ok(errs.length===0,'no page errors'+(errs.length?': '+errs[0].slice(0,200):''));
  await b.close(); process.exit(bad?1:0); })();
