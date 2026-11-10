// THE AI DOUBLE'S MIND CHECK: node tests/twin.cjs [dist/market.html]. worker/twin.js with a stand-in for Claude (no network, no key): an order, its tool calls and results, the memory kept as plain words, a newer order replacing an older one, the step limit. With the page, the double's moves in the game: look, GO TO, use a merchant, buy, and its owner's chat heard.
const path=require('path'), {pathToFileURL}=require('url');
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
const fake=replies=>{ const sent=[]; return {sent,beta:{messages:{create:async q=>{ sent.push(JSON.parse(JSON.stringify(q))); const r=replies.shift(); if(r instanceof Error)throw r; return r; }}}}; };
const mem=()=>{ let v=null; return {get:async()=>v&&JSON.parse(JSON.stringify(v)),put:async x=>{ if(v&&(v.at||0)>(x.at||0))return false; v=JSON.parse(JSON.stringify(x)); return true; },peek:()=>v}; };
const tu=(id,name,input)=>({type:'tool_use',id,name,input});
(async()=>{
  const {TWIN}=await import(pathToFileURL(path.join(__dirname,'..','worker','twin.js')).href);
  ok(TWIN.TOOLS.every(t=>t.strict&&t.input_schema.additionalProperties===false&&Array.isArray(t.input_schema.required)),'every tool is strict, closed and lists what it needs ('+TWIN.TOOLS.map(t=>t.name).join(', ')+')');
  const S=mem(), C=fake([
    {stop_reason:'tool_use',content:[{type:'thinking',thinking:'',signature:'sig1'},{type:'text',text:'On my way.'},tu('t1','go_to_place',{place:'THE BODEGA'})]},
    {stop_reason:'end_turn',content:[{type:'thinking',thinking:'',signature:'sig2'},{type:'text',text:'I am at the bodega.'}]},
    {stop_reason:'end_turn',content:[{type:'text',text:'You asked me to go to the bodega.'}]}]);
  let r=await TWIN.step({},S,{say:'go to the bodega',owner:'BOSS',key:'k1',state:'YOU: here'},C);
  ok(r.say==='On my way.'&&r.calls&&r.calls[0].name==='go_to_place'&&r.calls[0].input.place==='THE BODEGA','an order: it answers and calls a move');
  const q0=C.sent[0]; ok(q0.model==='claude-opus-5-5'&&q0.tools.length===TWIN.TOOLS.length&&q0.system[0].text===TWIN.SYSTEM&&/BOSS, YOUR OWNER, SAYS\]\ngo to the bodega/.test(q0.messages[0].content[0].text)&&/YOU: here/.test(q0.messages[0].content[0].text),'what Claude is sent: the model, the tools, the fixed system words, the game now and the order');
  r=await TWIN.step({},S,{results:[{id:'nope',out:'x'}],key:'old',state:'s'},C);
  ok(r.why&&C.sent.length===1,'results for another order are turned away');
  r=await TWIN.step({},S,{results:[{id:'t1',out:'You are at THE BODEGA.'}],key:'k1',state:'YOU: at the bodega'},C);
  const q1=C.sent[1], m1=q1.messages;
  ok(r.done&&r.say==='I am at the bodega.','the results go back, it finishes');
  ok(m1.length===3&&m1[1].role==='assistant'&&m1[1].content[0].signature==='sig1'&&m1[2].content[0].type==='tool_result'&&m1[2].content[0].tool_use_id==='t1'&&m1[2].content[1].text.includes('at the bodega'),'within an order everything goes back as it came (its thinking too), then the result and the game now');
  const v=S.peek(); ok(v.turn===null&&v.hist.length===2&&typeof v.hist[0].content==='string'&&/go to the bodega/.test(v.hist[0].content)&&/I am at the bodega\..*go_to_place/.test(v.hist[1].content),'remembered as plain words: what was asked, what it said and did');
  r=await TWIN.step({},S,{say:'what did I ask?',owner:'BOSS',key:'k2',state:'s'},C);
  const q2=C.sent[2]; ok(r.done&&q2.messages.length===3&&!JSON.stringify(q2.messages.slice(0,2)).includes('thinking'),'the next order carries the memory and no earlier thinking');
  // a newer order while an older one is still out: the older one's write is refused
  const S2=mem(); await TWIN.step({},S2,{say:'one',key:'a',state:''},fake([{stop_reason:'tool_use',content:[tu('x1','wait',{seconds:5})]}]));
  const v1=JSON.parse(JSON.stringify(S2.peek())); await new Promise(r=>setTimeout(r,5)); await TWIN.step({},S2,{say:'two',key:'b',state:''},fake([{stop_reason:'tool_use',content:[tu('y1','look',{})]}]));
  ok(!(await S2.put(v1))&&S2.peek().turn.key==='b','an older order never writes over a newer one');
  // the step limit
  const S3=mem(), loop=Array.from({length:TWIN.ROUNDS+2},(_,i)=>({stop_reason:'tool_use',content:[tu('w'+i,'wait',{seconds:1})]})), C3=fake(loop);
  r=await TWIN.step({},S3,{say:'wait forever',key:'z',state:''},C3); let n=0; while(r.calls&&n<40){ r=await TWIN.step({},S3,{results:[{id:r.calls[0].id,out:'waited'}],key:'z',state:''},C3); n++; }
  ok(r.done&&C3.sent.length===TWIN.ROUNDS,'it stops after '+TWIN.ROUNDS+' rounds and says so');
  const S4=mem(); r=await TWIN.step({},S4,{say:'hi',key:'e',state:''},fake([Object.assign(new Error('boom'),{})]));
  ok(r.why&&S4.peek().turn===null,'Claude unreachable: it says why and drops the order');
  r=await TWIN.step({},mem(),{say:'x',key:'f',state:''},fake([{stop_reason:'refusal',content:[]}]));
  ok(r.done&&/can't/.test(r.say),'a refusal: it says it can\'t');
  if(process.argv[2])await page(process.argv[2]);
  console.log(bad?bad+' FAILED':'all ok'); process.exit(bad?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });

// the double's moves in the built page (?bot=1: the bot's own game, offline)
async function page(file){
  const {chromium}=require('playwright'), b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'],...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{})}), p=await b.newPage({viewport:{width:640,height:360}});
  p.on('pageerror',e=>console.log('page error:',e.message));
  await p.goto(pathToFileURL(path.resolve(file)).href+'?bot=1&fresh=1&hour=12',{timeout:600000});
  await p.waitForFunction(()=>window.BOT&&BOT.ready&&window.TWINP&&TWINP.TOOL,null,{timeout:900000,polling:1000});
  await p.evaluate(()=>{ BOT.set({ai:1,who:'owner-1',job:'follow',name:'BOSS AI',hp:1,fight:1}); INV.cash=500; });
  const run=(name,input)=>p.evaluate(([name,input])=>new Promise(res=>{ const r=TWINP.TOOL[name](input); if(!r||!r.tick)return res(r); const s={t:0}; let n=0; const iv=setInterval(()=>{ s.t+=.1; const x=r.tick(.1,s); if(x!==true||s.t>r.limit||++n>4000){ clearInterval(iv); res(x===true?{out:'timed out',err:1}:x); } },100); }),[name,input]);
  let r=await run('look',{}); ok(r&&/PLACES YOU CAN GO TO: .*THE BODEGA/.test(r.out)&&/YOUR OWNER: not in the game/.test(r.out),'look: where it is, its owner (away), the places');
  r=await run('go_to_place',{place:'bodega'}); ok(r&&!r.err&&/THE BODEGA/.test(r.out),'go_to_place finds THE BODEGA from "bodega": '+(r&&r.out||'').split('\n')[0]);
  r=await run('look',{}); const near=(/NEAR YOU: (.*)/.exec(r.out)||[])[1]||''; console.log('     near the bodega: '+near.slice(0,240));
  r=await run('use',{thing:'the register'}); ok(r&&!r.err&&/SHOP WINDOW OPEN: THE BODEGA REGISTER/.test(r.out),'use the register: the bodega\'s list is open');
  const id=(/\[([a-z0-9_]+)\] \$/.exec(r.out||'')||[])[1], c0=await p.evaluate(()=>INV.cash);
  r=await run('buy',{item:id,count:2}); const c1=await p.evaluate(()=>INV.cash), has=await p.evaluate(id=>INV.items[id]||0,id);
  ok(r&&!r.err&&c1<c0&&has>=2,'buy 2 '+id+' at the register: paid $'+(c0-c1)+', in the pack ('+(r&&r.out)+')');
  r=await run('buy',{item:'a flying castle',count:1}); ok(r&&r.err,'buying what is not sold is refused');
  r=await run('go_to_place',{place:'THE BIRD SHOP'}); r=await run('look',{}); console.log('     on the street: '+((/NEAR YOU: (.*)/.exec(r.out)||[])[1]||'').slice(0,240));
  const shop=await p.evaluate(()=>{ let b=null, bd=1e18; for(const th of TWINP.things()){ if(th.npc&&TWINP.sells(th.npc)){ const d=TWINP.dist(th); if(d<bd&&d<40){ bd=d; b=th.name; } } } return b; });
  if(shop){ r=await run('use',{thing:shop}); ok(r&&!r.err&&/SHOP WINDOW OPEN/.test(r.out),'use '+shop+' (a merchant): their shop window opens'+(r&&r.err?' ('+r.out.slice(0,200)+')':''));
    const sid=await p.evaluate(()=>{ const r=document.querySelector('#shopg .shr[data-buy]:not(.no)'); return r&&r.dataset.buy; }), d0=await p.evaluate(()=>INV.cash);
    if(sid){ r=await run('buy',{item:sid,count:1}); const d1=await p.evaluate(()=>INV.cash); ok(r&&!r.err&&d1<d0,'buy '+sid+' from them: paid $'+(d0-d1)); } }
  else console.log('     (no merchant with a shop near the street to try)');
  r=await run('use',{thing:'adoption book'}); console.log('     the adoption book: '+String(r&&r.out).slice(0,300).replace(/\n/g,' | '));
  r=await run('look',{}); const w=(/OPEN WINDOWS: ([^\n]*)/.exec(r.out)||[])[1]; ok(!!w,'a window it opened is listed with its buttons: '+String(w).slice(0,200));
  if(w){ const b=(/\[(CLOSE|X|×|LEAVE[^\]]*)\]/i.exec(w)||/\[([^\]]+)\]/.exec(w))[1]; r=await run('press',{button:b}); ok(r&&!r.err,'press ['+b+'] in it: '+String(r&&r.out).split('\n')[0]); }
  r=await run('press',{button:'a button nowhere'}); ok(r&&r.err,'pressing a button that is not there is refused');
  r=await run('give_owner',{items:[],cash:5}); ok(r&&r.err&&/not near you/.test(r.out),'give_owner with its owner away says so');
  const h=await p.evaluate(()=>[TWINP.heard('@ go to the park'),TWINP.heard('BOSS AI, sit down'),TWINP.heard('hello everyone'),TWINP.heard('twin: stop')]);
  ok(h[0]==='go to the park'&&h[1]==='sit down'&&h[2]===null&&h[3]==='stop','orders: "@...", its name first, or "twin" first; other chat is not an order');
  const o2=await p.evaluate(()=>[TWINP.order('hey','pm'),TWINP.order('hey')]);
  ok(o2[0]==='hey'&&o2[1]===null,'a message to it is an order as it is; plain chat only when its owner is within 20 m');
  await b.close();
}
