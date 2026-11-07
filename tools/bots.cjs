// THE BOT RUNNER: runs the bots the owner spawns in ADMIN > TENANTS > BOTS, each a whole game in a hidden browser on this PC.
// Once:  npm install playwright   then   npx playwright install chromium
// Run:   node bots.cjs <RUNNER KEY> [site]      (Ctrl+C stops every bot; SHOW=1 opens a window a bot to watch them)
const {chromium}=require('playwright');
const KEY=process.argv[2]||process.env.BOT_KEY||'', SITE=(process.argv[3]||process.env.BOT_SITE||'https://thestrangestfleamarket.com').replace(/\/$/,'');
const LS='sb-jvcetttmqseoteidfggn-auth-token', EVERY=5000;
if(!KEY){ console.log('usage: node bots.cjs <RUNNER KEY from ADMIN > TENANTS > BOTS> [site]'); process.exit(1); }
const run=new Map();   // id -> {ctx, page, cfg, tok, status}
const log=(b,m)=>console.log(new Date().toLocaleTimeString(),(b?b.name+':':''),m);
let browser=null;
const cfgOf=b=>{ const {login,...c}=b; return c; };

async function start(b){
  if(!browser)browser=await chromium.launch({headless:!process.env.SHOW,...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{}),args:['--mute-audio','--autoplay-policy=no-user-gesture-required']});
  const ctx=await browser.newContext({viewport:{width:480,height:270}});
  const R={ctx,page:null,cfg:'',tok:'',status:{doing:'starting'}}; run.set(b.id,R);
  await login(R,b);
  const page=R.page=await ctx.newPage();
  page.on('pageerror',e=>log(b,'page error: '+String(e.message||e).slice(0,160)));
  page.on('close',()=>{ if(run.get(b.id)===R){ run.delete(b.id); ctx.close().catch(()=>{}); } });
  log(b,'starting');
  await page.goto(SITE+'/?bot=1',{timeout:120000}).catch(e=>log(b,'could not open the game: '+e.message));
}
async function login(R,b){ const L=b.login; if(!L||!L.access_token||L.access_token===R.tok)return; R.tok=L.access_token;
  const u=new URL(SITE);
  await R.ctx.addCookies([{name:'tsfm-pass',value:L.access_token,domain:u.hostname,path:'/',secure:u.protocol==='https:',sameSite:'Strict'}]);
  const s=JSON.stringify({access_token:L.access_token,refresh_token:L.refresh_token||''});
  if(R.page)await R.page.evaluate(([k,v])=>{ try{ localStorage.setItem(k,v); }catch(e){} },[LS,s]).catch(()=>{});
  else await R.ctx.addInitScript(([k,v])=>{ try{ localStorage.setItem(k,v); }catch(e){} },[LS,s]); }
async function stop(id){ const R=run.get(id); if(!R)return; run.delete(id); try{ if(R.page)await R.page.evaluate(()=>window.BOT&&BOT.bye()).catch(()=>{}); }catch(e){} await R.ctx.close().catch(()=>{}); }

async function tick(){
  const status={}; for(const [id,R] of run){ if(R.page)R.status=await R.page.evaluate(()=>window.BOT&&BOT.ready?BOT.status():{doing:'loading the game'}).catch(()=>R.status)||R.status; status[id]=R.status; }
  let j; try{ const r=await fetch(SITE+'/bots/run',{method:'POST',headers:{'content-type':'application/json','x-bot-key':KEY},body:JSON.stringify({status})}); j=await r.json(); if(!r.ok){ log(null,'the site said: '+(j.why||r.status)); return; } }
  catch(e){ log(null,'could not reach '+SITE+': '+e.message); return; }
  const want=new Map(j.bots.map(b=>[b.id,b]));
  for(const id of [...run.keys()])if(!want.has(id)){ log(null,'stopping '+id.slice(0,8)); await stop(id); }
  for(const b of want.values()){ if(!b.login){ log(b,'could not log in'); continue; }
    let R=run.get(b.id); if(!R){ await start(b); R=run.get(b.id); if(!R)continue; }
    await login(R,b);
    const c=JSON.stringify(cfgOf(b)); if(c!==R.cfg&&R.page){ const ok=await R.page.evaluate(c=>window.BOT&&BOT.ready?(BOT.set(JSON.parse(c)),true):false,c).catch(()=>false); if(ok){ R.cfg=c; log(b,'job: '+b.job); } } }
}
(async()=>{ log(null,'bot runner for '+SITE+' (Ctrl+C to stop)'); for(;;){ await tick().catch(e=>log(null,String(e.message||e))); await new Promise(r=>setTimeout(r,EVERY)); } })();
const bye=async()=>{ log(null,'stopping every bot'); for(const id of [...run.keys()])await stop(id); if(browser)await browser.close().catch(()=>{}); process.exit(0); };
process.on('SIGINT',bye); process.on('SIGTERM',bye);
