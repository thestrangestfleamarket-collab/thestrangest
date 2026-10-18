// ASTEP (map-pre.js): every character's pose worked out ASTEP.fps times a second while he moves, his place every frame; at rest his clock held.
// Over 4 s: per kind, how many times a second the pose changed (his mixer's time, or his rig's pose object) and how many his place did; the flyers'
// height kept between poses; your own pose walking. node tests/stepcheck.cjs [query]
const {chromium}=require('playwright'), q=process.argv[2]||'';
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:640,height:420}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&wx=clear&hour=15.5&at=-2.2,3.2'+q,{waitUntil:'commit',timeout:180000});
  for(let i=0;i<150;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; } await pg.waitForTimeout(30000);
  const r=await pg.evaluate(()=>new Promise(res=>{ const L=[...__dbg.NPCS].filter(n=>n&&n.g&&!n.far&&n.g.visible!==false).slice(0,80), S=L.map(n=>({k:n.key,pose:0,place:0,frames:0,lastT:n.mixer?n.mixer.time:null,lastB:n.rig&&n.rig.B?JSON.stringify([n.B&&n.B.hips&&n.B.hips.rotation.x]):null,lp:n.g.position.x+','+n.g.position.z,ly:n.g.position.y,ymin:1e9,ymax:-1e9}));
    const you={pose:0,last:null,frames:0}; let t0=performance.now();
    // your own walk: hold W down for the run
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'w',code:'KeyW'}));
    const step=()=>{ L.forEach((n,i)=>{ const s=S[i]; s.frames++; if(n.mixer){ if(n.mixer.time!==s.lastT){ s.pose++; s.lastT=n.mixer.time; } } else if(n.B&&n.B.hips){ const v=n.B.hips.rotation.x+','+n.B.hips.rotation.z+','+(n.B.armL?n.B.armL.rotation.x:0); if(v!==s.lastB){ s.pose++; s.lastB=v; } }
        const p=n.g.position.x.toFixed(4)+','+n.g.position.z.toFixed(4); if(p!==s.lp){ s.place++; s.lp=p; } s.ymin=Math.min(s.ymin,n.g.position.y); s.ymax=Math.max(s.ymax,n.g.position.y); });
      you.frames++; const B=window.ASTEP&&ASTEP.you.B; if(B!==you.last){ you.pose++; you.last=B; }
      if(performance.now()-t0<6000)requestAnimationFrame(step); else { window.dispatchEvent(new KeyboardEvent('keyup',{key:'w',code:'KeyW'})); const sec=(performance.now()-t0)/1000;
        res({sec,you:{posePerS:+(you.pose/sec).toFixed(1),fps:+(you.frames/sec).toFixed(1)},npc:S.filter(s=>s.place>3||s.pose>0).map(s=>({k:s.k,posePerS:+(s.pose/sec).toFixed(1),placePerS:+(s.place/sec).toFixed(1),fps:+(s.frames/sec).toFixed(1),yRange:+(s.ymax-s.ymin).toFixed(2)}))}); } };
    requestAnimationFrame(step); }));
  console.log(JSON.stringify(r,null,0).replace(/\},\{/g,'},\n{')); console.log('errors',errs.slice(0,5)); await b.close(); })();
