// YOUR PETS AT HOME (src/146zj-pets.js, MODS.apts.room, CITY.route over a room): node tests/pethome.cjs. In your apartment the pet out with you and the ones waiting at home
// live there: they show, wander over time by the pathfinder, stay inside the room and out of the furniture (hopping onto tops is allowed), and sleep.
const {chromium}=require('playwright');
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader'],...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{})}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; }); pg.on('console',m=>{ if(/PET/.test(m.text()))console.log('  console:',m.text().slice(0,200)); });
  { const DIR=require('path').join(process.cwd(),'node_modules/@dimforge/rapier3d-compat'), fs=require('fs');
    await pg.route(/\/@dimforge\/rapier3d-compat@[^/]+\/(.+)$/,r=>{ const f=require('path').join(DIR,new URL(r.request().url()).pathname.split(/rapier3d-compat@[^/]+\//)[1]||''); if(!fs.existsSync(f))return r.continue();
      r.fulfill({path:f,contentType:/\.wasm$/.test(f)?'application/wasm':'text/javascript'}); }); }
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms=120000)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(400))if(await (typeof f==='function'&&f.length===0&&/^async/.test(String(f))?f():pg.evaluate(f)))return true; return false; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=2&place=your%20apartment',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  rec('in your apartment',await U(()=>!!(__dbg.MAPK.MODS.apts&&__dbg.MAPK.MODS.apts.inReal&&__dbg.MAPK.MODS.apts.room&&__dbg.MAPK.MODS.apts.room()),120000));
  // two pets: a cat, then a dog (the cat goes home to wait, the dog is out with you)
  await pg.evaluate(async()=>{ const I=await PETS.idx(), P=k=>{ const K=I.by[k]; return {k,n:k==='cat'?'Tom':'Rex',c:K.zones.map(z=>z[1]),s:K.knobs.map(()=>50),z:100,h:false}; }; PETS.add(P('cat'),true); PETS.add(P('dog'),false); });
  const all=()=>pg.evaluate(()=>{ const L=[]; const m=PETS.mine(); if(m)L.push(['out',m]); for(const [id,h] of PETS.home())if(h.N)L.push(['home'+id,h.N]); return L.map(([k,N])=>({k,on:!!(N.atHome&&N.atHome.on),vis:N.g.visible&&!!N.g.parent,x:N.st.x,z:N.st.z,y:N.g.position.y,mode:N.atHome&&N.atHome.mode,top:!!(N.atHome&&N.atHome.top)})); });
  rec('both show in the room, living there (the one out with you came in with you, not twice)',await U(async()=>{ const A=await all(); return A.length===2&&A.every(a=>a.on&&a.vis); },120000),JSON.stringify(await all()));
  const room=await pg.evaluate(()=>{ const R=PETS.room(); return R&&{box:[R.I.x0,R.I.z0,R.I.x1,R.I.z1],sol:R.I.sol.filter(r=>r[2]>R.I.x0&&r[0]<R.I.x1&&r[3]>R.I.z0&&r[1]<R.I.z1),tops:R.tops.length,y:R.y,WU:PETS.WU}; });
  rec('the room as a pet sees it: floor, furniture, tops to hop onto',!!room&&room.sol.length>0,room&&JSON.stringify({sol:room.sol.length,tops:room.tops}));
  // the game's own loop ticks them (in software rendering it runs slow): their clocks run down
  const c0=await pg.evaluate(()=>[...PETS.home().values()].map(h=>h.N).concat([PETS.mine()]).map(N=>N.atHome.t+N.st.x+N.st.z)); await wait(20000);
  const c1=await pg.evaluate(()=>[...PETS.home().values()].map(h=>h.N).concat([PETS.mine()]).map(N=>N.atHome.t+N.st.x+N.st.z));
  rec('the game loop ticks them at home',c0.every((v,i)=>v!==c1[i]),JSON.stringify([c0,c1]));
  // then four game minutes of their own ticks, ten a second, sampled every second
  const SA=await pg.evaluate(()=>{ const P=[['out',PETS.mine()],...[...PETS.home()].map(([id,h])=>['home'+id,h.N])], you={x:PETS.dbg.pos.x,z:PETS.dbg.pos.z}, out=[];
    for(let s=0;s<2400;s++){ for(const [,N] of P)N.tick(.1,you); if(s%10===0)for(const [k,N] of P)out.push({k,x:N.st.x,z:N.st.z,y:N.g.position.y,mode:N.atHome.mode,top:!!N.atHome.top}); } return out; });
  let moved={}, outside=[], stuck=[], modes=new Set(), tops=0, p0={};
  for(const a of SA){ modes.add(a.mode); if(a.top)tops++; const m=.02*room.WU; if(!p0[a.k])p0[a.k]=a;
    if(!(a.x>room.box[0]-m&&a.x<room.box[2]+m&&a.z>room.box[1]-m&&a.z<room.box[3]+m))outside.push(a);
    const inS=room.sol.some(r=>a.x>r[0]+m&&a.x<r[2]-m&&a.z>r[1]+m&&a.z<r[3]-m); if(inS&&!a.top&&a.mode!=='hop')stuck.push(a);
    const q=p0[a.k], d=Math.hypot(a.x-q.x,a.z-q.z)/room.WU; moved[a.k]=Math.max(moved[a.k]||0,+d.toFixed(2)); }
  rec('they move about over time (metres from where they started)',Object.keys(moved).length===2&&Object.values(moved).every(d=>d>.5),JSON.stringify(moved));
  rec('they stay inside the room',!outside.length,outside.length?JSON.stringify(outside[0]):'');
  rec('and out of the furniture, unless up on its top',!stuck.length,stuck.length?JSON.stringify(stuck[0]):'');
  rec('they sleep (more by night: hour 2)',modes.has('sleep'),[...modes].join(','));
  console.log('  info: samples up on a top (of 480): '+tops);
  // leaving: the one out with you comes out with you, the one at home stays home
  await pg.evaluate(()=>__dbg.MAPK.MODS.apts.exitReal()); await U(()=>!__dbg.MAPK.MODS.apts.inReal,60000); await wait(4000);
  const o=await pg.evaluate(()=>{ const m=PETS.mine(); return {out:!!m&&!m.atHome.on&&m.g.visible,near:m?+(Math.hypot(m.st.x-PETS.dbg.pos.x,m.st.z-PETS.dbg.pos.z)/PETS.WU).toFixed(2):null,home:PETS.home().size}; });
  rec('out on the street, the dog follows you again and the cat is not there',o.out&&o.near<4&&o.home===0,JSON.stringify(o));
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,v])=>v+'x '+k).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'ALL PASS'); process.exit(bad?1:0); })().catch(e=>{ console.error(e); process.exit(1); });
