// REPORT A BUG (owner, 19 Oct 2026): node tests/bugcheck.cjs [art|site] [out.png]: F8, a report sent with its picture, then the owner's queue
// (art: a stand-in for claude.ai's db; site: a stand-in for Supabase), APPROVED moves it, the picture shows; prints what reached the store
const {chromium}=require('playwright');
(async()=>{ const [mode='art',out='']=process.argv.slice(2); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1095,height:765}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  const store={reports:[],shots:{},marks:[]};
  if(mode==='art')await pg.addInitScript(()=>{ const D=window.__D={}; const snap=(id,v)=>({id,exists:!!v,data:()=>v});
    const doc=p=>({get:async()=>snap(p.split('/').pop(),D[p]),set:async v=>{ D[p]=JSON.parse(JSON.stringify(v)); },update:async v=>{ D[p]={...D[p],...v}; },onSnapshot:()=>()=>{}});
    const db={doc,collection:c=>{ const q={orderBy:()=>q,limit:()=>q,get:async()=>({docs:Object.keys(D).filter(k=>k.startsWith(c+'/')).map(k=>snap(k.slice(c.length+1),D[k])).sort((a,b)=>b.data().at-a.data().at)})}; return q; }};
    window.claude={use:async n=>n==='db'?db:n==='user'?{isOwner:async()=>true}:null}; });
  else{ const sub='11111111-2222-3333-4444-555555555555', jwt='x.'+Buffer.from(JSON.stringify({sub,exp:Date.now()/1000+3600})).toString('base64url')+'.y';
    await pg.addInitScript(()=>localStorage.setItem('sb-jvcetttmqseoteidfggn-auth-token',JSON.stringify({refresh_token:'r'})));
    await pg.route('https://jvcetttmqseoteidfggn.supabase.co/**',async r=>{ const u=new URL(r.request().url()), m=r.request().method(); if(process.env.LOGREQ)console.log(m,u.pathname+u.search), body=r.request().postData(), J=o=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(o)});
      if(u.pathname==='/auth/v1/token')return J({access_token:jwt,refresh_token:'r2'});
      if(u.pathname==='/rest/v1/admins')return J([{user_id:sub}]);
      if(u.pathname==='/rest/v1/bug_reports'&&m==='POST'){ store.reports.push({...JSON.parse(body),player:sub,status:'new',created_at:new Date().toISOString()}); return r.fulfill({status:201}); }
      if(u.pathname==='/rest/v1/bug_reports'&&m==='PATCH'){ const id=u.searchParams.get('id').slice(3), s=JSON.parse(body).status; store.marks.push(s); for(const x of store.reports)if(x.id===id)x.status=s; return r.fulfill({status:204}); }
      if(u.pathname==='/rest/v1/bug_reports'){ if(process.env.LOGREQ)console.log('LIST',store.reports.map(x=>x.status)); return J(store.reports.slice().reverse()); }
      if(u.pathname==='/rest/v1/bug_shots'&&m==='POST'){ const o=JSON.parse(body); store.shots[o.report]=o.jpg; return r.fulfill({status:201}); }
      if(u.pathname==='/rest/v1/bug_shots'){ const id=u.searchParams.get('report').slice(3); return J(store.shots[id]?[{jpg:store.shots[id]}]:[]); }
      r.fulfill({status:404}); }); }
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=13&place=THE%20BODEGA',{timeout:180000}); await pg.waitForFunction(()=>window.__started,null,{timeout:240000}); await pg.waitForTimeout(4000);
  await pg.keyboard.press('F8'); await pg.waitForSelector('#bugtx',{timeout:20000});
  const pic=await pg.evaluate(()=>{ const i=document.getElementById('bugim'); return i&&!i.hidden?i.src.length:0; });
  await pg.click('#bugtx'); await pg.keyboard.type('the door of the bodega flickers WASD'); await pg.click('#bugsend');
  await pg.waitForFunction(()=>/SENT|not sent/.test(document.getElementById('bugsay').textContent),null,{timeout:20000});
  const said=await pg.evaluate(()=>document.getElementById('bugsay').textContent); await pg.waitForSelector('#bugq [data-id]',{timeout:20000});
  await pg.click('#bugq [data-a="pic"]'); await pg.waitForTimeout(800); if(out)await pg.screenshot({path:out});
  await pg.click('#bugq [data-s="approved"]'); await pg.waitForFunction(()=>/APPROVED 1/.test(document.getElementById('bugst').textContent),null,{timeout:20000}).catch(()=>{});
  const after=await pg.evaluate(()=>[...document.querySelectorAll('#bugst [data-f]')].map(b=>b.textContent).join(' | '));
  const sent=mode==='art'?await pg.evaluate(()=>Object.entries(window.__D).map(([k,v])=>k+' '+(v.jpg?'jpg '+v.jpg.length:JSON.stringify({body:v.body,status:v.status,at:v.context&&v.context.at,near:v.context&&v.context.near,build:v.context&&v.context.build})))):store.reports.map(r=>JSON.stringify({body:r.body,status:r.status,at:r.context.at,near:r.context.near}))+' shots '+Object.values(store.shots).map(s=>s.length);
  console.log('picture',pic,'said',said,'\nstore',sent,'\nqueue after approve',after,'\nerrors',Object.keys(errs)); await b.close(); })();
