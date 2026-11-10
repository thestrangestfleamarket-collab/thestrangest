// THE PAINTINGS' AND TRADES' SERVER CHECK: node tests/trade-server.cjs. Runs the website's worker (wrangler dev): a painting's picture is kept (/art), its painter alone changes it while unfinished, nobody once finished, anyone looks at a finished one; and a trade on a block's server: asked, said yes, offers (a new offer takes back both accepts), both accept, each told what to give and get; too far, called off, one leaving.
const {spawn}=require('child_process'), WS=require('ws'), PORT=8797, BASE='http://127.0.0.1:'+PORT, U='ws://127.0.0.1:'+PORT+'/parties/block/s-trtest'+Date.now();
const open=n=>new Promise((res,rej)=>{ const w=new WS(U,{headers:{Cookie:'tsfm-pass=dev:'+n,Origin:BASE}}); w.got=[]; w.on('message',d=>{ try{ w.got.push(JSON.parse(d)); }catch(e){} }); w.on('open',()=>res(w)); w.on('error',rej); });
const wait=ms=>new Promise(r=>setTimeout(r,ms)); const tr=(w,op)=>w.got.filter(m=>m.t==='tr'&&(!op||m.op===op));
const art=(n,b)=>fetch(BASE+'/art',{method:'POST',headers:{'content-type':'application/json',Cookie:'tsfm-pass=dev:'+n,Origin:BASE},body:JSON.stringify(b)}).then(async r=>({s:r.status,j:await r.json().catch(()=>({}))}));
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
const run=async()=>{
  const id='t'+Date.now().toString(36), pic='data:image/webp;base64,'+'A'.repeat(1500000);
  let r=await art('alice',{put:{id,d:'{"w":1,"h":1,"layers":[]}'}}); ok(r.s===200,'alice keeps an unfinished painting '+r.s);
  r=await art('bob',{get:id}); ok(r.s===404,'bob cannot see it while it is unfinished '+r.s);
  r=await art('bob',{put:{id,d:pic}}); ok(r.s===409,'bob cannot write over it '+r.s+' '+JSON.stringify(r.j));
  r=await art('alice',{put:{id,d:pic,fin:1}}); ok(r.s===200,'alice finishes it (1.5 MB: kept in parts) '+r.s);
  r=await art('bob',{get:id}); ok(r.s===200&&r.j.d===pic&&r.j.fin===1&&r.j.by==='dev-alice','anyone looks at a finished painting, whole '+r.s+' '+(r.j.d||'').length);
  r=await art('alice',{put:{id,d:'data:image/webp;base64,BB'}}); ok(r.s===409,'nobody changes a finished painting, not even its painter '+r.s);
  r=await art('alice',{del:id}); ok(r.j.ok===false,'nor deletes it');
  r=await art('alice',{put:{id:'../x',d:pic}}); ok(r.s===400,'a bad id is refused '+r.s);

  const own=(who,body)=>fetch(BASE+'/owned',{method:'POST',headers:{cookie:'tsfm-pass=dev:'+who,origin:BASE,'content-type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json());
  await own('alice',{put:{inv:JSON.stringify({v:1,items:{pt_abcdef12:1},cash:100})}}); await own('bob',{put:{inv:JSON.stringify({v:1,items:{},cash:500})}});   // (a trade pays from the server's copy of each pack)
  const a=await open('alice'), b=await open('bob'), c=await open('carol'); await wait(400);
  for(const [w,x] of [[a,0],[b,1],[c,400]])w.send(JSON.stringify({t:'mv',at:[x,0,0,0,'up','']})); await wait(300);
  c.send(JSON.stringify({t:'tr',op:'ask',to:'dev-alice'})); await wait(300);
  ok(tr(c,'far').length===1&&!tr(a,'ask').length,'carol is too far away to ask');
  a.send(JSON.stringify({t:'tr',op:'ask',to:'dev-bob'})); await wait(300);
  ok(tr(b,'ask').some(m=>m.from==='dev-alice'),'alice asks bob; bob hears it');
  b.send(JSON.stringify({t:'tr',op:'yes',to:'dev-alice'})); await wait(300);
  ok(tr(a,'open').some(m=>m.with==='dev-bob')&&tr(b,'open').some(m=>m.with==='dev-alice'),'bob says yes: both have it open');
  a.send(JSON.stringify({t:'tr',op:'offer',o:{items:{pt_abcdef12:1,'bad id!':3},cash:0,art:{abcdef12:{t:'RED',by:'ALICE',w:512,h:512,c:'canvas_m',fr:'oak',d:'4 NOV 2026',e:.5},zzzzzzzz:{t:'NOT IN IT'}}}})); await wait(300);
  const st=tr(b,'st').pop(); ok(st&&st.theirs.items.pt_abcdef12===1&&!st.theirs.items['bad id!']&&st.theirs.art.abcdef12.t==='RED'&&!st.theirs.art.zzzzzzzz,'alice offers a painting; bob sees it, cleaned '+JSON.stringify(st&&st.theirs));
  b.send(JSON.stringify({t:'tr',op:'offer',o:{items:{},cash:120}})); await wait(300);
  b.send(JSON.stringify({t:'tr',op:'ok',v:true})); await wait(300);
  ok(tr(a,'st').pop().okThem===true,'bob accepts');
  a.send(JSON.stringify({t:'tr',op:'offer',o:{items:{pt_abcdef12:1},cash:5,art:{abcdef12:{t:'RED',w:512,h:512}}}})); await wait(300);
  ok(tr(a,'st').pop().okThem===false,'alice changes her offer: bob\'s accept is taken back');
  b.send(JSON.stringify({t:'tr',op:'ok',v:true})); await wait(200); a.send(JSON.stringify({t:'tr',op:'ok',v:true})); await wait(400);
  const pa=tr(a,'pay').pop(), pb=tr(b,'pay').pop();
  ok(pa&&pb&&pa.give.items.pt_abcdef12===1&&pb.give.cash===120&&!tr(a,'done').length,'both accept: each is asked to pay what it put in, nothing is handed over yet');
  a.send(JSON.stringify({t:'tr',op:'paid',o:{items:{pt_abcdef12:1},cash:999,art:{abcdef12:{t:'RED',w:512,h:512}}}})); b.send(JSON.stringify({t:'tr',op:'paid',o:{items:{},cash:40}})); await wait(400);
  const da=tr(a,'done').pop(), db=tr(b,'done').pop();
  ok(da&&db&&da.get.cash===40&&db.get.items.pt_abcdef12===1&&db.get.cash===5&&db.get.art.abcdef12,'both paid: each gets only what the other really paid, never more than offered: '+JSON.stringify([da&&da.get,db&&db.get]));
  a.send(JSON.stringify({t:'tr',op:'ask',to:'dev-bob'})); await wait(200); b.send(JSON.stringify({t:'tr',op:'yes',to:'dev-alice'})); await wait(200);
  a.send(JSON.stringify({t:'tr',op:'offer',o:{cash:7}})); await wait(200); a.send(JSON.stringify({t:'tr',op:'ok',v:true})); b.send(JSON.stringify({t:'tr',op:'ok',v:true})); await wait(300);
  a.send(JSON.stringify({t:'tr',op:'paid',o:{cash:7}})); await wait(10800);
  ok(tr(a,'x').some(m=>m.back&&m.back.cash===7)&&!tr(b,'done').some(m=>m.get&&m.get.cash===7),'one side never pays: the other gets back what it paid, nothing is handed over');
  a.send(JSON.stringify({t:'tr',op:'ask',to:'dev-bob'})); await wait(200); b.send(JSON.stringify({t:'tr',op:'yes',to:'dev-alice'})); await wait(200);
  b.send(JSON.stringify({t:'mv',at:[300,0,0,0,'up','']})); await wait(200); a.send(JSON.stringify({t:'tr',op:'offer',o:{cash:1}})); await wait(300);
  ok(tr(a,'x').some(m=>/far/.test(m.why))&&tr(b,'x').some(m=>/far/.test(m.why)),'walking apart calls it off for both');
  b.send(JSON.stringify({t:'mv',at:[1,0,0,0,'up','']})); await wait(200); a.send(JSON.stringify({t:'tr',op:'ask',to:'dev-bob'})); await wait(200); b.send(JSON.stringify({t:'tr',op:'yes',to:'dev-alice'})); await wait(300);
  b.close(); await wait(600);
  ok(tr(a,'x').some(m=>/left/.test(m.why)),'bob leaving the game calls it off');
  a.close(); c.close(); };
(async()=>{ const w=spawn('npx',['wrangler','dev','--port',String(PORT),'--ip','127.0.0.1','--var','DEV_AUTH:1','--show-interactive-dev-session=false'],{stdio:['ignore','pipe','pipe'],env:{...process.env,WRANGLER_SEND_METRICS:'false'}});
  let log=''; w.stdout.on('data',d=>log+=d); w.stderr.on('data',d=>log+=d);
  let up=false; for(let i=0;i<120&&!up;i++){ await wait(1000); up=await fetch(BASE+'/').then(r=>r.ok).catch(()=>false); }
  if(!up){ console.log('FAIL: the worker never started\n'+log); w.kill(); process.exit(1); }
  try{ await run(); }catch(e){ ok(false,'the checks threw: '+e.message); }
  w.kill(); console.log(bad?bad+' FAILED':'all painting and trade server checks passed'); process.exit(bad?1:0); })();
