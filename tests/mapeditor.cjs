// THE MAP EDITOR CHECK: node tests/mapeditor.cjs [dist/market.html] [shot.png] — the editor page (dist/editor.html) opens and moves a building, the lake and a car and paints a road; the shared patch code drops what is malformed; the game started with that published file moves them and lays the road.
const {chromium}=require('playwright'); const path=require('path');
const GAME=process.argv[2]||'dist/market.html', SHOT=process.argv[3];
let bad=0; const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
(async()=>{ const {MAPPATCH}=await import(path.resolve('worker/mappatch.js')), W=require(path.resolve('data/world.json'));
  { const r=MAPPATCH.apply(W,{v:1,set:{places:{bar:{x0:5,x1:1},nope:{x0:0,x1:1}},parkPlaces:{lake:{r:-2},round:{x:'a'}},paths:{path0:{a:[1],b:[2,3]}},ground:[{x0:0,x1:1,y0:0,y1:1,t:'lava'},{x0:0,x1:1,y0:0,y1:1,t:'road'}]}});
    ok(r.used.join()==='ground:1','a malformed file changes nothing but its good ground ('+r.used.join()+')'); ok(JSON.stringify(r.W)===JSON.stringify(W),'the baked level is left as it was');
    ok(MAPPATCH.apply(W,null).used.length===0&&MAPPATCH.apply(W,{v:2,set:{}}).used.length===0,'no file or another version: the baked level'); }
  const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  // the editor
  const ed=await b.newPage({viewport:{width:1280,height:800}}), eerr=[]; ed.on('pageerror',e=>eerr.push(e.message));
  await ed.goto('file://'+path.resolve('dist/editor.html')); await ed.waitForFunction(()=>window.EDITOR&&EDITOR.ready,{timeout:30000});
  const bar=W.places.find(p=>p.id==='bar'), lake=W.parkPlaces.lake, car=W.cars[0];
  const P=await ed.evaluate(([bar,lake,car])=>{ const n=EDITOR.items().length; const it=k=>EDITOR.items().find(o=>o.k===k[0]&&o.id===k[1]);
    const o=it(['place','bar']); EDITOR.write('place','bar',o.x+3,o.y); EDITOR.write('park','lake',lake.x+4,lake.y-2,{r:11}); EDITOR.write('car',car.id,car.x-5,car.y);
    EDITOR.paint(103,-55,5,'road'); EDITOR.paint(110,-55,3,'cobble');
    const g0=EDITOR.items().find(o=>o.k==='garden'), placed=[EDITOR.place('pf_corner_shop',150,-40,90),EDITOR.place('OakTree1',112,-50),EDITOR.place('car:camper-van',100,-67,0)];
    const cleared=[EDITOR.clear('garden',g0.id),EDITOR.clear('car','c2'),EDITOR.clear('place','bar')];
    const lamps=EDITOR.lamp(110,-60); EDITOR.brook(5,201,92); EDITOR.names({streets:{south:'GRAND ST'},station:'GRAND ST'});
    return {n,P:EDITOR.patch(),g0:g0.id,placed,cleared,lamps}; },[bar,lake,car]);
  ok(P.n>150,'the editor shows the map\'s things ('+P.n+')');
  const S=P.P.set; ok(S.places&&S.places.bar&&Math.abs(S.places.bar.x0-(bar.x0+3))<.01&&S.places.bar.face===(bar.face||'n'),'moving THE BAR writes its new place');
  ok(S.parkPlaces&&S.parkPlaces.lake&&S.parkPlaces.lake.x===lake.x+4&&S.parkPlaces.lake.r===11,'moving and sizing the lake');
  ok(S.cars&&S.cars[car.id]&&S.cars[car.id].x===+(car.x-5).toFixed(2),'moving a car');
  ok(S.add&&S.add.length===2&&S.add[0].k==='pf_corner_shop'&&S.add[1].k==='OakTree1'&&S.add[1].s>5&&P.placed[2]==='m1'&&S.newcars&&S.newcars[0].model==='camper-van','BUILD, NATURE and PROPS put down a shop, a full-size oak and a drivable camper van');
  ok(P.cleared.join()==='true,true,false'&&S.garden[P.g0]===null&&S.del.includes('car:c2'),'CLEAR takes a placed model and a car away, not a building from the game\'s code');
  ok(Array.isArray(S.lamps)&&S.lamps.length===P.lamps&&P.lamps>1&&S.parkPlaces.brook&&S.parkPlaces.brook.pts[5][0]===201&&S.names.streets.south==='GRAND ST','POWER adds a lamp post, WATER moves a point of the brook, SECTION renames Market St and its station');
  ok(Array.isArray(S.ground)&&S.ground.some(g=>g.t==='road')&&S.ground.reduce((a,g)=>a+(g.x1-g.x0)*(g.y1-g.y0),0)===34,'painting: 25 tiles of road and 9 of cobble, merged into '+(S.ground||[]).length+' patches');
  await ed.keyboard.press('Control+z'); ok(await ed.evaluate(()=>!(EDITOR.state().set.names||{}).station),'undo takes the last change back (the new names)');
  await ed.keyboard.press('Control+y');
  { const box=await (await ed.$('#cv')).boundingBox(), at=async(k,id,h)=>{ const q=await ed.evaluate(([k,id,h])=>{ const o=EDITOR.items().find(o=>o.k===k&&o.id===id); return EDITOR.project(o.x,o.y,h); },[k,id,h]); return [box.x+q[0],box.y+q[1]]; };
    await ed.evaluate(()=>EDITOR.view({iso:1,rot:1,level:'up'})); await ed.keyboard.press('Escape'); let p=await at('place','museum',0); await ed.mouse.click(p[0],p[1]);
    ok(JSON.stringify(await ed.evaluate(()=>EDITOR.sel()))==='{"k":"place","id":"museum"}','turned to iso, a click on a building\'s ground picks it');
    await ed.keyboard.press('q'); ok((await ed.evaluate(()=>EDITOR.view({})).then(v=>v.rot))===2,'Q turns the view a quarter');
    await ed.evaluate(()=>EDITOR.view({iso:0,rot:0,level:'down'})); const under=await ed.evaluate(()=>EDITOR.items().filter(o=>o.lv==='down').map(o=>o.id));
    p=await at('place','museum',0); await ed.mouse.click(p[0],p[1]); const s2=await ed.evaluate(()=>EDITOR.sel());
    ok(under.length>0&&(!s2||s2.k!=='place'),'underground shows what is under the street ('+under.join(' ')+') and not the street\'s buildings');
    await ed.evaluate(()=>EDITOR.view({level:'up'})); }
  ok(eerr.length===0,'the editor ran without errors '+JSON.stringify(eerr.slice(0,3)));
  if(SHOT)await ed.screenshot({path:SHOT.replace(/\.png$/,'')+'-editor.png'});
  // the game with that file published
  const pg=await b.newPage({viewport:{width:1000,height:700}}), errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.addInitScript(p=>{ window.__MAPLIVE=p; },P.P);
  await pg.goto('file://'+path.resolve(GAME)+'?at=35,25&hour=12',{timeout:240000}); await pg.waitForFunction(()=>window.__started,{timeout:400000}); await pg.waitForTimeout(6000);
  const G=await pg.evaluate(()=>{ const L=SHARED.MAPLIVE, m=[], props=__dbg.LAND.props(); __dbg.scene.traverse(o=>{ if(o.userData&&o.userData.mapPub)m.push(o.userData.landPatch); }); return {lamps:window.DRESS.own,street:window.LEVELS.of.street.name,used:L.used,meshes:m,props:props.length,shop:props.some(o=>o.k==='pf_corner_shop'),oak:props.some(o=>o.k==='OakTree1')}; });
  ok(['place:bar','park:lake','car:'+car.id].every(k=>G.used.includes(k)),'the game lays the published file over its level ('+G.used.join(' ')+')');
  const GN=require(path.resolve('data/garden.json')).length; ok(G.props===GN+1&&G.shop&&G.oak&&G.used.includes('cars-gone:1')&&G.used.includes('car-new:m1'),'the game puts the new things down and takes the cleared ones away ('+G.props+' placed models, was '+GN+')');
  ok(G.used.includes('brook')&&G.lamps===P.lamps&&G.street==='GRAND ST'&&G.used.includes('station'),'the game takes the new lamp posts ('+G.lamps+'), the brook\'s course and the names ('+G.street+')');
  ok(G.meshes.includes('road')&&G.meshes.includes('cobble')&&G.meshes.length===2,'the painted ground is one mesh a kind ('+G.meshes.join(' ')+')');
  ok(errs.length===0,'the game ran without errors '+JSON.stringify(errs.slice(0,3)));
  if(SHOT){ await pg.screenshot({path:SHOT}); }
  await b.close(); console.log(bad?bad+' FAILED':'all ok'); process.exit(bad?1:0); })().catch(e=>{ console.log('FAIL',e.message); process.exit(1); });
