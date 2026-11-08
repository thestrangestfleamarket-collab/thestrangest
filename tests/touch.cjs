// The touch pad on an emulated phone: the overlay shows, LOW resolution at first start, the stick walks, JUMP holds jump, a swipe turns the overhead view and a drag looks round in third person, MENU opens the menu (the pad steps aside), a real controller hides it, portrait asks to turn.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
  const ctx=await b.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:1}); const pg=await ctx.newPage(); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.addInitScript(()=>{ window.PAD_PANELS=()=>[...document.body.children].filter(e=>!e.hidden&&e.getClientRects().length&&getComputedStyle(e).display!=='none'&&e.querySelector('button')).map(e=>e.id); const P={id:'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e)',index:0,connected:true,mapping:'standard',timestamp:1,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};
    window.__realpad=P; navigator.getGamepads=()=>window.__padin?[P]:[]; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&at=0,6',{timeout:300000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000}); await pg.waitForTimeout(8000);
  const cdp=await ctx.newCDPSession(pg), T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map(([x,y],i)=>({x,y,id:i}))});
  const drag=async(x0,y0,x1,y1,ms)=>{ await T('touchStart',[[x0,y0]]); for(let i=1;i<=6;i++){ await T('touchMove',[[x0+(x1-x0)*i/6,y0+(y1-y0)*i/6]]); await pg.waitForTimeout(30); } await pg.waitForTimeout(ms); await T('touchEnd',[]); };
  const tapA=async a=>{ const r=await pg.evaluate(a=>{ const e=document.querySelector(`#tpad [data-a="${a}"]`).getBoundingClientRect(); return [e.left+e.width/2,e.top+e.height/2]; },a); await T('touchStart',[r]); await pg.waitForTimeout(150); await T('touchEnd',[]); await pg.waitForTimeout(200); };
  const P=()=>pg.evaluate(()=>__dbg.pos().map(v=>+v.toFixed(2)));
  ok(await pg.evaluate(()=>!document.getElementById('tpad').hidden&&document.body.classList.contains('touch')),'the touch pad shows on a phone');
  ok(await pg.evaluate(()=>SHARED.RESI===0),'LOW resolution at first start');
  const p0=await P(); await drag(150,280,210,280,1500); await pg.waitForTimeout(400); const p1=await P();
  ok(Math.hypot(p1[0]-p0[0],p1[2]-p0[2])>.3,'the stick walks '+p0+' -> '+p1);
  if(Math.hypot(p1[0]-p0[0],p1[2]-p0[2])<=.3)console.log(await pg.evaluate(()=>({t:TOUCHDBG(),panels:PAD_PANELS()})));
  const jc=await pg.evaluate(()=>{ const e=document.querySelector('#tpad [data-a="jump"]').getBoundingClientRect(); return [e.left+e.width/2,e.top+e.height/2]; });
  await T('touchStart',[jc]); await pg.waitForTimeout(300); const held=await pg.evaluate(()=>JSON.stringify(TOUCHDBG().held)); await T('touchEnd',[]);
  ok(held.includes('" "'),'JUMP holds the jump key, as Space does '+held);
  await pg.waitForTimeout(400); ok(await pg.evaluate(()=>!TOUCHDBG().held.length),'letting go lets go of the key');
  const i0=await pg.evaluate(()=>__UI.view==='iso'?SHARED.yawTo:null); if(i0!=null){ await drag(500,200,700,200,100); ok(Math.abs(await pg.evaluate(()=>SHARED.yawTo)-i0)>.3,'a swipe turns the overhead view a step'); }
  await pg.evaluate(()=>__UI.setView('third')); await pg.waitForTimeout(1500); const w0=await pg.evaluate(()=>SHARED.yawTo); await drag(500,200,640,200,100); const w1=await pg.evaluate(()=>SHARED.yawTo);
  ok(Math.abs(w1-w0)>.05,'a drag on the right looks round (third person) '+w0.toFixed(2)+' -> '+w1.toFixed(2));
  await tapA('menu'); await pg.waitForTimeout(400); ok(await pg.evaluate(()=>__UI.menuOpen&&document.getElementById('tpad').hidden),'MENU opens the menu, the pad steps aside');
  await pg.screenshot({path:process.argv[2]||'/tmp/touch-menu.png'});
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(500); ok(await pg.evaluate(()=>!__UI.menuOpen&&!document.getElementById('tpad').hidden),'menu closed, the pad back');
  await pg.screenshot({path:process.argv[3]||'/tmp/touch.png'});
  const ov=await pg.evaluate(()=>{ const L=['vit','hmap','hqb'].map(i=>document.getElementById(i)).filter(e=>e&&e.getClientRects().length).concat([...document.querySelectorAll('#tpad .tb')].filter(e=>!e.hidden));
    const R=L.map(e=>[e.id||e.dataset.a,e.getBoundingClientRect()]), o=[]; for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){ const [a,p]=R[i],[c,q]=R[j]; if(p.left<q.right-1&&q.left<p.right-1&&p.top<q.bottom-1&&q.top<p.bottom-1)o.push(a+'/'+c); }
    for(const [a,r] of R)if(r.left<0||r.top<0||r.right>innerWidth||r.bottom>innerHeight)o.push(a+' off screen'); return o; });
  ok(!ov.length,'the HUD and the pad do not overlap '+ov.join(' '));
  await pg.evaluate(()=>{ window.__padin=1; dispatchEvent(new Event('gamepadconnected')); __realpad.buttons[0]={pressed:true,value:1}; __realpad.timestamp++; }); await pg.waitForTimeout(300);
  await pg.evaluate(()=>{ __realpad.buttons[0]={pressed:false,value:0}; __realpad.timestamp++; }); await pg.waitForTimeout(300);
  ok(await pg.evaluate(()=>document.getElementById('tpad').hidden),'a real controller hides the pad');
  await T('touchStart',[[400,200]]); await T('touchEnd',[]); await pg.waitForTimeout(300); ok(await pg.evaluate(()=>!document.getElementById('tpad').hidden),'the next touch brings it back');
  await pg.setViewportSize({width:390,height:844}); await pg.waitForTimeout(400); ok(await pg.evaluate(()=>getComputedStyle(document.getElementById('tturn')).display==='flex'),'portrait asks to turn the device');
  ok(!Object.keys(errs).length,'no page errors '+Object.keys(errs).join(' | ')); await b.close(); process.exit(bad?1:0); })();
