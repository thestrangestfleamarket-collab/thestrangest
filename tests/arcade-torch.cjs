// THE TORCHBEARER CHECK: node tests/arcade-torch.cjs [dist/market.html]. Enters THE ARCADE, plays TORCHBEARER as the WARRIOR: the coin, the hero screen, floor 1 with 2000 health; walks floor 1 (a path found on the game's own map: the key, the door, the stairs) and reaches floor 2 with the health drained by the seconds spent; a shot kills a grunt and knocks a generator down; health 1 is GAME OVER. Exits 1 if anything fails.
const {chromium}=require('playwright'), path=require('path');
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c){ bad++; if(process.env.GITHUB_ACTIONS)console.log('::error title=arcade-torch::'+String(m).replace(/\n/g,' ').slice(0,900)); } };
const bfs=(map,from,to,doors)=>{ const h=map.length, w=map[0].length, solid=ch=>ch==='#'||ch==='%'||(!doors&&ch==='D'); const prev=new Map([[from.join(),null]]), q=[from];
  while(q.length){ const [x,y]=q.shift(); if(x===to[0]&&y===to[1]){ const p=[]; for(let k=[x,y];k;k=prev.get(k.join()))p.unshift(k); return p; }
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const X=x+dx, Y=y+dy; if(X<0||Y<0||X>=w||Y>=h||solid(map[Y][X])||prev.has(X+','+Y))continue; prev.set(X+','+Y,[x,y]); q.push([X,Y]); } } return null; };
const find=(map,ch)=>{ for(let y=0;y<map.length;y++){ const x=map[y].indexOf(ch); if(x>=0)return [x,y]; } return null; };
(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:600}}); const errs=[], late=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ const t=m.text(); if(/not loaded before use/.test(t))late.push(t); else if(m.type()==='error'&&!/file:|CORS|ERR_FAILED/.test(t))errs.push(t.slice(0,300)); });
  await pg.goto('file://'+path.resolve(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13',{waitUntil:'commit',timeout:240000});
  await pg.waitForFunction(()=>window.__started,null,{timeout:300000}); await pg.waitForTimeout(3000);
  await pg.evaluate(()=>ROOMS.enter('arcade')); const built=await pg.waitForFunction(()=>window.ARCDBG&&ARCDBG().built&&!(window.FADE&&FADE.busy),null,{timeout:240000}).then(()=>true,()=>false); ok(built,'THE ARCADE builds');
  await pg.evaluate(()=>{ INV.cash=Math.max(INV.cash||0,20); STORE.cabs.play('TORCHBEARER'); });
  const loaded=await pg.waitForFunction(()=>STORE.cabs.on&&STORE.cabs.dbg().loaded,null,{timeout:90000}).then(()=>true,()=>false); ok(loaded,"TORCHBEARER's code loads when the cabinet is played");
  const D=()=>pg.evaluate(()=>STORE.cabs.dbg()), G=()=>pg.evaluate(()=>TORCHDBG());
  const gwait=async(sec,until)=>{ const t0=(await G()).t, w0=Date.now(); for(;;){ const g=await G(); if(g.t-t0>=sec||(until&&until(g))||Date.now()-w0>60000)return g; await pg.waitForTimeout(50); } };   // game seconds, not wall-clock: frames are slow here
  await pg.keyboard.press('Space'); await pg.waitForTimeout(500); let d=await D(); ok(d.mode==='play'&&d.g&&d.g.mode==='hero','the coin goes in and CHOOSE YOUR HERO shows ('+JSON.stringify({mode:d.mode,g:d.g&&d.g.mode})+')');
  await pg.keyboard.press('Space'); await pg.waitForTimeout(400); d=await D(); ok(d.g&&d.g.hero==='WARRIOR'&&d.g.floor===1&&d.g.hp===2000,'the WARRIOR starts floor 1 with 2000 health ('+JSON.stringify(d.g&&{hero:d.g.hero,floor:d.g.floor,hp:d.g.hp})+')');
  await pg.evaluate(()=>TORCHDBG().cheat.skip());
  const walk=async(path_)=>{ for(let i=1;i<path_.length;i++){ const [tx,ty]=path_[i], [px,py]=path_[i-1], key=tx>px?'ArrowRight':tx<px?'ArrowLeft':ty>py?'ArrowDown':'ArrowUp';
      await pg.keyboard.down(key); const t0=Date.now(); let there=false; while(Date.now()-t0<8000){ const g=await G(); if(Math.floor(g.x)===tx&&Math.floor(g.y)===ty){ there=true; break; } if(g.mode!=='play'){ await pg.keyboard.up(key); return g.floor>1?true:'left play mode at '+i; } await pg.waitForTimeout(20); } await pg.keyboard.up(key);
      if(!there)return 'stuck at step '+i+' of '+path_.length+' going '+key+' to '+tx+','+ty; } return true; };
  let g=await G(); const map=g.map, start=[Math.floor(g.x),Math.floor(g.y)], key=find(map,'k'), exit=find(map,'1'); const gt0=g.t, hp0=g.hp;
  const p1=bfs(map,start,key,false); ok(!!p1,'floor 1: a path to a key without a door ('+(p1&&p1.length)+' steps)');
  let r=p1?await walk(p1):'no path'; g=await G(); ok(r===true&&g.keys>=1,'walked to the key and picked it up ('+r+', keys '+g.keys+')');
  const p2=bfs(map,[Math.floor(g.x),Math.floor(g.y)],exit,true); ok(!!p2,'floor 1: a path from the key to the stairs through a door ('+(p2&&p2.length)+' steps)');
  r=p2?await walk(p2):'no path'; await pg.waitForTimeout(300); g=await G(); const secs=g.t-gt0;
  ok(g.floor===2,'the door opened with the key and the stairs led to floor 2 ('+r+', floor '+g.floor+')');
  ok(g.hp<=hp0-Math.floor(secs)+2&&g.hp>0,'health drained by the game seconds spent ('+hp0+' → '+g.hp+' in '+secs.toFixed(1)+' s)');
  await pg.evaluate(()=>TORCHDBG().cheat.skip()); await gwait(.2);
  await pg.keyboard.down('ArrowRight'); await gwait(.15); await pg.keyboard.up('ArrowRight'); await gwait(.1); const n0=(await G()).mons, s0=(await G()).score; await pg.evaluate(()=>TORCHDBG().cheat.spawn('grunt',1,3,0));
  await pg.keyboard.down('Space'); g=await gwait(2,g=>g.mons<=n0&&g.score>=s0+20); await pg.keyboard.up('Space'); ok(g.mons<=n0&&g.score>=s0+20,'a shot kills a level-1 grunt (monsters '+(n0+1)+' → '+g.mons+', score +'+(g.score-s0)+')');
  await gwait(.3); const gn0=(await G()).gens.length; await pg.evaluate(()=>TORCHDBG().cheat.gen('grunt',3,3,0)); await pg.keyboard.down('Space'); g=await gwait(2,g=>g.gens.length===gn0); await pg.keyboard.up('Space');
  ok(g.gens.length===gn0,'the WARRIOR\'s shot knocks a level-3 generator out in one ('+(gn0+1)+' generators → '+g.gens.length+')');
  await pg.evaluate(()=>TORCHDBG().cheat.hp(1)); await gwait(2.5,g=>g.hp<=0); await pg.waitForTimeout(300); d=await D(); ok(d.over&&d.mode==='over','health 0 is GAME OVER ('+JSON.stringify({over:d.over,mode:d.mode})+')');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(300); ok(!(await pg.evaluate(()=>STORE.cabs.on)),'ESC leaves the cabinet');
  ok(!errs.length&&!late.length,'no page errors, no slow chunk fetch '+errs.concat(late).slice(0,3).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'all ok'); process.exit(bad?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
