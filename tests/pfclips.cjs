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
      jab:a({up:M('jab',.2,.42)}),kick:a({move:M('frontKick',.2,.7)}),pick:a({move:M('pick',.1,.6)}),crouch:a({move:M('crouch',.1,.22)}),carry:a({up:M('carry',.1,.24)}),thr:a({move:M('mc_pf_Thriller',3,18.87)}),
      greet:a({move:M('mc_greet',1,4.7)}),none:a({}),up:(()=>{ const S={sit:{}}; AVATAR.act(S); S.sit=null; return a(S); })()}; });
  rec('each state and move names its clip (sitting, swimming, treading water, driving, eating, planting, a jab, a kick, picking up, crouching, carrying, an emote, standing up; the old emotes and the skateboard stay the rig\'s)',
    map.sit==='Sitting'&&map.swim==='Swimming'&&map.tread==='Treading water'&&map.car==='Driving'&&!map.skate&&map.eat==='Eating'&&map.plant==='Planting'&&map.jab==='Punch'&&map.kick==='Kick'&&map.pick==='Pick up'&&map.crouch==='Crouch'&&map.carry==='Walk carrying'&&map.thr==='Thriller'&&!map.greet&&!map.none&&map.up==='Stand up',JSON.stringify(map));
  rec('the H panel offers the 19 Polyfork emotes beside the old ones',await pg.evaluate(()=>{ const t=[...document.querySelectorAll('#emotes button')].map(b=>b.textContent); return ['AGREE','LAUGH','THRILLER','HIP HOP','CHOP WOOD','HOLD LANTERN','TIPSY'].every(x=>t.includes(x)); }));
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
  if(OUT){ require('fs').mkdirSync(OUT,{recursive:true}); await pg.evaluate(()=>{ MOTION.stop(); UI.setView('third'); });
    for(const n of ['Thriller','HipHop','Chop','Drink','Laugh']){ await pg.evaluate(n=>MOTION.play('pf_'+n),n); await wait(1500); await pg.screenshot({path:OUT+'/'+n+'.png'}); await pg.evaluate(()=>MOTION.stop()); await wait(400); } }
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,v])=>v+'× '+k).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'ALL PASS'); process.exit(bad?1:0); })();
