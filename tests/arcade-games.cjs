// THE ARCADE'S SMALL GAMES CHECK: node tests/arcade-games.cjs [dist/market.html] [shots dir]. Skee-ball's power rises and falls while held; the claw holds a centred grab and carries it to the chute, misses a sloppy one; the token machine trades 10 tickets for a token; no prize counter.
const {chromium}=require('playwright'), path=require('path');
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c){ bad++; if(process.env.GITHUB_ACTIONS)console.log('::error title=arcade-games::'+String(m).replace(/\n/g,' ').slice(0,900)); } };
(async()=>{
  const b=await chromium.launch({...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message.slice(0,300)));
  await pg.goto('file://'+path.resolve(process.argv[2]||'dist/market.html')+'?fresh=1&hour=13',{waitUntil:'commit',timeout:240000});
  await pg.waitForFunction(()=>window.__started,null,{timeout:300000}); await pg.waitForTimeout(2000);
  const r=await pg.evaluate(()=>{ const run=(G,S0,f)=>{ const S={mx:150,my:200,down:false,press:false,release:false,keys:new Set(),t:0,over:'',line:'',score:0,...S0}; G.start(S); f(S,n=>{ for(let i=0;i<n&&!S.over;i++){ G.tick(S,1/60); S.press=S.release=false; } }); return S; };
    const out={};
    run(GAMES.skee(),{},(S,step)=>{ S.press=S.down=true; const pw=[]; for(let i=0;i<180;i++){ step(1); S.down=true; pw.push(S.pw); } out.peak=Math.max(...pw); out.after=pw[pw.length-1]; out.fell=pw.some((p,i)=>i&&p<pw[i-1]); });
    const claw=aim=>run(GAMES.claw(),{},(S,step)=>{ S.toys.sort((a,b)=>a.y-b.y); const t=S.toys[0]; if(aim){ S.toys=[t]; aim=t.r*.7; } for(let i=0;i<240;i++){ S.mx=t.x+aim; S.lastmx=S.mx; step(1); } S.press=true; step(1); for(let i=0;i<300&&S.ph!=='up';i++)step(1); out['grip'+(aim?1:0)]=S.grip||0; out['held'+(aim?1:0)]=!!S.held; if(S.held)S.grip=1;
      if(S.held){ for(let i=0;i<300&&S.ph!=='carry';i++)step(1); for(let x=S.tx;x>40;x-=1.2){ S.mx=x; S.lastmx=x; step(1); } S.mx=40; step(240); S.press=true; step(1); step(200); } out['won'+(aim?1:0)]=!!S.won; });
    claw(0); claw(1);
    INV.items.ptix=0; INV.add('ptix',25); const tok0=INV.items.arc_token||0; ARCADE.trade(); out.trade=[(INV.items.arc_token||0)-tok0,INV.items.ptix];
    return out; });
  ok(r.peak>=.99&&r.fell&&r.after<.99,'skee-ball: held, the power reaches the top and comes back down ('+r.peak.toFixed(2)+', ends '+r.after.toFixed(2)+')');
  ok(r.held0&&r.grip0>.6&&r.won0,'the claw: a centred grab holds and goes down the chute (grip '+r.grip0.toFixed(2)+')');
  ok(!r.held1,'the claw: a sloppy grab slides off (grip '+r.grip1.toFixed(2)+')');
  ok(r.trade[0]===2&&r.trade[1]===5,'25 tickets trade for 2 market tokens, 5 left ('+r.trade+')');
  const shots=process.argv[3]; if(shots)for(const n of ['skee','claw']){ const url=await pg.evaluate(async n=>{ const G=GAMES[n](), c=document.createElement('canvas'); c.width=G.w; c.height=G.h; const g=c.getContext('2d'), S={mx:G.w*.6,my:200,down:false,press:false,release:false,keys:new Set(),t:0,over:'',line:'',score:0};
      G.start(S); if(n==='skee'){ S.press=S.down=true; for(let i=0;i<40;i++){ S.t+=0; G.tick(S,1/60); S.press=false; } } else for(let i=0;i<60;i++)G.tick(S,1/60); G.draw(S,g); return c.toDataURL(); },n);
    require('fs').writeFileSync(path.join(shots,n+'.png'),Buffer.from(url.split(',')[1],'base64')); }
  ok(!errs.length,'no page errors '+errs.slice(0,3).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'all ok'); process.exit(bad?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
