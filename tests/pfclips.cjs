// THE AVATAR'S MIXAMO CLIPS (owner, 7 Nov 2026: "yes lets use mixamo"; Polyfork's 44: src/111c-avatar.js AVATAR.act/clip, src/111a-bodies.js mocap, src/111da-motion.js pf_ moves): node tests/pfclips.cjs [out folder]
// every clip loads for both figures; each rig state and move names its Polyfork clip; each Polyfork move, sitting, swimming and a punch move your avatar's hand, never to NaN; with an out folder, third-person shots.
const {chromium}=require('playwright'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  { const DIR=require('path').join(process.cwd(),'node_modules/@dimforge/rapier3d-compat'), fs=require('fs');
    await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/,r=>{ const f=require('path').join(DIR,new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1]||''); if(!fs.existsSync(f))return r.continue();
      r.fulfill({path:f,contentType:/\.wasm$/.test(f)?'application/wasm':'text/javascript'}); }); }
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms=120000)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(400))if(await pg.evaluate(f))return true; return false; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await U(()=>AVATAR.ready());
  const ld=await U(()=>AVATAR.clips.every(n=>AVATAR.clip('m',n)&&AVATAR.clip('f',n)),60000);
  rec('all 41 new clips load for the man and the woman',ld&&await pg.evaluate(()=>AVATAR.clips.length===41),await pg.evaluate(()=>AVATAR.clips.filter(n=>!AVATAR.clip('m',n)||!AVATAR.clip('f',n)).join(',')));
  const map=await pg.evaluate(()=>{ const a=S=>{ const r=AVATAR.act(S); return r&&r.n; }, M=(name,t,dur)=>({name,t,def:{dur}});
    return {sit:a({sit:{}}),swim:a({water:{in:true,swim:1}}),tread:a({water:{in:true,swim:0}}),car:a({ride:{k:'car'}}),skate:a({ride:{k:'skate'}}),eat:a({move:M('mc_eat',.4,1.3)}),plant:a({move:M('mc_plant',1,2.77)}),
      jab:a({up:M('jab',.2,.42)}),kick:a({move:M('frontKick',.2,.7)}),pick:a({move:M('pick',.1,.6)}),crouch:a({move:M('crouch',.1,.22)}),jog:a({jog:1}),carry:a({up:M('carry',.1,.24)}),thr:a({move:M('mc_pf_Thriller',3,18.87)}),
      greet:a({move:M('mc_greet',1,4.7)}),none:a({}),up:(()=>{ const S={sit:{}}; AVATAR.act(S); S.sit=null; return a(S); })()}; });
  rec('each state and move names its clip (sitting, swimming, treading water, driving, eating, planting, the punches and kicks stay the rig\'s (drawn from recordings, 7 Nov 2026), picking up, crouching, carrying, jogging, an emote, standing up; the old emotes and the skateboard stay the rig\'s)',
    map.sit==='Sitting'&&map.swim==='Swimming'&&map.tread==='Treading water'&&map.car==='Driving'&&!map.skate&&map.eat==='Drinking'&&map.plant==='Planting'&&!map.jab&&!map.kick&&map.pick==='Pick up'&&map.crouch==='Crouch'&&map.carry==='Walk carrying'&&map.thr==='Thriller'&&!map.greet&&!map.none&&map.up==='Stand up'&&map.jog==='Jog',JSON.stringify(map));
  rec('the H panel offers the Polyfork emotes beside the old ones, none miming a thing you do not hold',await pg.evaluate(()=>{ const t=[...document.querySelectorAll('#emotes button')].map(b=>b.textContent); return ['AGREE','LAUGH','THRILLER','HIP HOP','TIPSY'].every(x=>t.includes(x))&&!['CHOP WOOD','HOLD LANTERN','HOLD TORCH','DIG','LEAN ON RAIL','FIX','PUSH'].some(x=>t.includes(x)); }));
  // each Polyfork move on you: the clip plays (the avatar's hand moves, finite), the rig's move ends as the clip's part does
  const hand=()=>pg.evaluate(()=>{ const h=BODIES.hand('R'); return h&&[h.wrist.x,h.wrist.y,h.wrist.z]; });
  const moves=await pg.evaluate(()=>Object.keys(AVATAR.PF)), still=[], nan=[];
  for(const n of moves){ await pg.evaluate(n=>MOTION.play('pf_'+n),n); await wait(250); const a=await hand(); await wait(700); const c=await hand();
    if(!a||!c||![...a,...c].every(Number.isFinite))nan.push(n); else if(Math.hypot(a[0]-c[0],a[1]-c[1],a[2]-c[2])<1e-4&&!/Lean|Torch|Cross/.test(n))still.push(n);
    await pg.evaluate(()=>MOTION.stop()); await wait(300); }
  rec('every Polyfork move plays on you, never NaN',!nan.length,'NaN: '+nan.join(','));
  rec('every Polyfork move moves the body (the held poses aside)',!still.length,'still: '+still.join(','));
  const on=await pg.evaluate(async()=>{ MOTION.play('pf_Chat'); await new Promise(r=>setTimeout(r,900)); const s=__dbg.ST; return {mw:s._mw,aw:s._aw,n:s._an}; });
  rec('a Polyfork move is drawn from its clip, not the rig',on.mw===1&&on.aw>.9&&on.n==='Talking',JSON.stringify(on));
  // the emote window looks like the other windows, and an emote dragged onto the quick bar stays there and plays on its key
  const look=await pg.evaluate(async()=>{ MOTION.open(); await new Promise(r=>setTimeout(r,1200)); const e=document.getElementById('emotes'), r={ml:e.classList.contains('ml'),x:!!e.querySelector(':scope>.pX'),kinds:[...e.querySelectorAll('h3')].length,drag:[...e.querySelectorAll('button[draggable="true"]')].length}; MOTION.close(); return r; });
  rec('the emote window has the menus\' look and close button, every emote draggable',look.ml&&look.x&&look.kinds===1&&look.drag>=47,JSON.stringify(look));
  const bar=await pg.evaluate(async()=>{ const s=document.querySelector('#hqb .qs[data-i="0"]'), dt=new DataTransfer(); dt.setData('text/plain','emote:pf_Bop');
    s.dispatchEvent(new DragEvent('dragover',{dataTransfer:dt,bubbles:true,cancelable:true})); s.dispatchEvent(new DragEvent('drop',{dataTransfer:dt,bubbles:true,cancelable:true}));
    const slot=HUDDBG().slots[0], txt=document.querySelector('#hqb .qs[data-i="0"]').textContent; dispatchEvent(new KeyboardEvent('keydown',{code:'Digit1',key:'1',bubbles:true}));
    await new Promise(r=>setTimeout(r,800)); const cur=MOTION.cur; MOTION.stop(); return {slot,txt,cur}; });
  rec('an emote dropped on the quick bar stays there, named, and plays on its number',bar.slot==='emote:pf_Bop'&&/BOP/.test(bar.txt)&&bar.cur==='pf_Bop',JSON.stringify(bar));
  const g=await pg.$('#hqb .qg'), gb=g&&await g.boundingBox(), q0=await pg.evaluate(()=>document.getElementById('hqb').getBoundingClientRect().left);
  if(gb){ await pg.mouse.move(gb.x+gb.width/2,gb.y+gb.height/2); await pg.mouse.down(); await pg.mouse.move(gb.x-60,gb.y-80,{steps:8}); await pg.mouse.up(); }
  const q1=await pg.evaluate(()=>document.getElementById('hqb').getBoundingClientRect().left);
  rec('the quick bar moves by its grip',!!gb&&q1-q0<-40,'moved '+(q1-q0));
  // emotes that go somewhere move you (owner, 7 Nov 2026: "the player should really moev when needed for the emote"): the moonwalk back, Thriller forward, through the walls like walking
  const goes=async n=>pg.evaluate(async n=>{ const S=__dbg.ST, P=()=>__dbg.pos(), d0=S.dist, p0=P(); await MOTION.play(n); for(let i=0;i<120&&!(S.move&&S.move.t>2.6);i++)await new Promise(r=>setTimeout(r,250));   // (the move's own clock: software rendering runs slow)
    const p1=P(), r={dist:+(S.dist-d0).toFixed(1),moved:+Math.hypot(p1[0]-p0[0],p1[1]-p0[1]).toFixed(2)}; MOTION.stop(); await new Promise(r=>setTimeout(r,500)); return r; },n);
  const mw=await goes('moonwalk'), th=await goes('pf_Thriller'), cl=await goes('clap');
  rec('the moonwalk glides you backwards, Thriller walks you forward, a clap stays put',mw.dist<-20&&mw.moved>.3&&th.dist>10&&th.moved>.1&&Math.abs(cl.dist)<.5&&cl.moved<.05,JSON.stringify({mw,th,cl}));
  // the new recorded moves (owner, 7 Nov 2026: "start adding emotes and animations ... we probably need 50"): the walks move you their way, the roll is drawn from its recording and still carries you, standing tired you bend over
  const st2=await goes('stroll'), bk=await goes('backUp');
  const lk=await pg.evaluate(async()=>{ const S=__dbg.ST, d0=S.dist; __dbg.RIG.begin(S,'roll'); await new Promise(r=>setTimeout(r,400)); const r={look:__dbg.RIG.LOOK.roll,move:S.move&&S.move.name}; for(let i=0;i<60&&S.move;i++)await new Promise(r=>setTimeout(r,200)); r.went=+(S.dist-d0).toFixed(1); return r; });
  rec('the stroll walks you forward, backing up walks you back, the roll is drawn from its recording and still carries you',st2.dist>10&&st2.moved>.1&&bk.dist<-3&&lk.look==='mc_roll2'&&lk.move==='roll'&&lk.went>5,JSON.stringify({st2,bk,lk}));
  const tired=await pg.evaluate(async()=>{ const V=__dbg.VIT; for(let i=0;i<60&&MOTION.cur!=='tired';i++){ V.sta=0; await new Promise(r=>setTimeout(r,250)); } const c=MOTION.cur; V.sta=1; await new Promise(r=>setTimeout(r,1500)); return {on:c,off:MOTION.cur}; });
  rec('standing still out of breath, you bend over; rested, you stand',tired.on==='tired'&&tired.off!=='tired',JSON.stringify(tired));
  // a window keeps its size when clicked, resizes from its corner (kept), and the emotes fit it without scrolling
  const win=async()=>pg.evaluate(()=>{ const r=document.getElementById('emotes').getBoundingClientRect(); return [Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)]; });
  await pg.evaluate(()=>MOTION.open()); await wait(800); const w0=await win();
  for(let i=0;i<4;i++){ const w=await win(); await pg.mouse.click(w[0]+w[2]/2,w[1]+6); await wait(200); }
  const w1=await win(); rec('clicking a window four times leaves it as it was',JSON.stringify(w0)===JSON.stringify(w1),JSON.stringify([w0,w1]));
  const fit=await pg.evaluate(()=>{ const e=document.getElementById('emotes'); return {sh:e.scrollHeight,ch:e.clientHeight,btn:[...e.querySelectorAll('.emg button')].every(b=>b.offsetWidth>b.offsetHeight*2&&b.scrollWidth<=b.clientWidth)}; });
  rec('every emote a rectangle with its name inside, all in the window without scrolling',fit.sh<=fit.ch+1&&fit.btn,JSON.stringify(fit));
  await pg.mouse.move(w1[0]+w1[2]-5,w1[1]+w1[3]-5); await pg.mouse.down(); await pg.mouse.move(w1[0]+w1[2]-85,w1[1]+w1[3]-65,{steps:8}); await pg.mouse.up(); await wait(300); const w2=await win();
  await pg.evaluate(()=>MOTION.close()); await wait(200); await pg.evaluate(()=>MOTION.open()); await wait(600); const w3=await win();
  rec('a window resizes from its bottom right corner, and keeps that size',w2[2]<w1[2]-40&&w2[3]<w1[3]-30&&Math.abs(w3[2]-w2[2])<3&&Math.abs(w3[3]-w2[3])<3,JSON.stringify([w1,w2,w3]));
  await pg.evaluate(()=>{ MOTION.close(); __dbg.UI.resetLayout(); });
  if(OUT){ require('fs').mkdirSync(OUT,{recursive:true}); await pg.evaluate(()=>{ MOTION.stop(); __dbg.UI.setView('third'); __dbg.UI.dist*=.55; });
    await pg.evaluate(()=>MOTION.open()); await wait(800); await pg.screenshot({path:OUT+'/emotes.png'}); await pg.evaluate(()=>MOTION.close());
    for(const n of ['Thriller','HipHop','Chop','Drink','Laugh']){ await pg.evaluate(n=>MOTION.play('pf_'+n),n); await wait(1500); await pg.screenshot({path:OUT+'/'+n+'.png'}); await pg.evaluate(()=>MOTION.stop()); await wait(400); } }
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,v])=>v+'× '+k).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'ALL PASS'); process.exit(bad?1:0); })();
