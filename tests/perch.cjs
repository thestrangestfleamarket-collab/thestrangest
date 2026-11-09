// Winged pets in the air always flap; small flyers land on your head, the rest on a shoulder when you stand still; a pet that cannot fly waits on the ground while you fly (src/146zj-pets.js): node tests/perch.cjs [out folder]
const {chromium}=require('playwright'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader'],...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{})}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms=120000)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(400))if(await pg.evaluate(f))return true; return false; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.evaluate(()=>{ for(const k of ['UI','OWNED','pos'])if(!window[k])window[k]=PETS.dbg[k]; const f=document.getElementById('fday'); if(f)f.hidden=true; });
  // a parrot held up in the air beside you: its wings beat (the clip alone holds them still)
  const fl=await pg.evaluate(async()=>{ const W=PETS.WU, N=await PETS.make('tparrot',{k:'parrot',n:'',c:[],s:[],z:100,h:false},()=>({x:pos.x+2*W,z:pos.z,y:SHARED.py+2*W,hd:0}));
    const bone=()=>{ let q=null; N.g.traverse(o=>{ if(o.isBone&&o.name==='LeftWing')q=o.quaternion.clone(); }); return q; }, qs=[];
    for(let i=0;i<12;i++){ await new Promise(r=>setTimeout(r,1500)); qs.push(bone()); } let mx=0; for(const a of qs)for(const c of qs)mx=Math.max(mx,2*Math.acos(Math.min(1,Math.abs(a.dot(c))))*57.3);
    const air=N.restless(); PETS.drop(N); return {deg:+mx.toFixed(1),air}; });
  rec('a parrot in the air beats its wings and is never frozen still',fl.deg>20&&fl.air,JSON.stringify(fl));
  for(const [k,where,w] of [['parrot','shoulder'],['budgie','head'],['crow','shoulder'],['scarletmacaw','shoulder'],['owl','head','head'],['bee','head'],['parrot','fly','fly']]){
    await pg.evaluate(([k,w])=>{ for(const r of PETS.list().slice())if(!r.perma)PETS.letGo(r.id); for(const r of PETS.list().slice())if(r.perma)r.perma=false,PETS.letGo(r.id); const P={k,n:'',c:[],s:[],z:100,h:false,w:w||''}; PETS.add(P); },[k,w]);
    await pg.waitForFunction(([k,w])=>{ const N=PETS.mine(); return !!(N&&N.pet.k===k&&(N.pet.w||'')===(w||'')&&N.g.visible); },[k,w],{timeout:60000});
    await pg.evaluate(()=>{ PETS.mine().PR.still=5; });   // (the page runs about a frame a second here: skip the wait for you to stand still)
    const ok=await U(()=>{ const N=PETS.mine(); return !!(N&&N.perched()); },w==='fly'?40000:180000);
    const p=await pg.evaluate(()=>{ const N=PETS.mine(), W=PETS.WU; return {k:N.pet.k,on:N.perched(),up:+((N.g.position.y-SHARED.py)/W).toFixed(2),off:+(Math.hypot(N.g.position.x-pos.x,N.g.position.z-pos.z)/W).toFixed(2)}; });
    if(where==='fly'){ rec('a parrot set to fly behind you never lands, its wings beating',!ok&&!p.on&&await pg.evaluate(()=>PETS.mine().restless()),JSON.stringify(p)); continue; }
    rec('a still '+k+' lands on your '+where,ok&&p.on===where&&p.up>1&&p.off<.4,JSON.stringify(p));
    if(OUT)for(const a of [0,1.57,3.14,-1.57]){ await pg.evaluate(a=>{ UI.setView('third'); UI.dist=Math.min(UI.dist,2.2*PETS.WU); SHARED.pitchTo=SHARED.pitch=.12; SHARED.yawTo=SHARED.yaw=SHARED.heading+a; },a); await wait(2500); await pg.screenshot({path:OUT+'/perch-'+k+'-'+Math.round(a*10)+'.png'}); } }
  // a dog whose person is up in the air (flying, up high): it waits on the ground below
  const dg=await pg.evaluate(async()=>{ const W=PETS.WU, gy=SHARED.groundY(pos.x,pos.z); let L={x:pos.x,z:pos.z,y:gy,hd:0}; const N=await PETS.make('tdog',{k:'dog',n:'',c:[],s:[],z:100,h:false},()=>L);
    for(let i=0;i<20&&!N.placed;i++)await new Promise(r=>setTimeout(r,300)); L={x:pos.x+3*W,z:pos.z,y:gy+4*W,hd:0}; await new Promise(r=>setTimeout(r,8000));
    const r={dog:+((N.g.position.y-gy)/W).toFixed(2),moved:+(Math.hypot(N.st.x-pos.x,N.st.z-pos.z)/W).toFixed(2)}; PETS.drop(N); return r; });
  rec('a dog stays on the ground while you are up in the air',Math.abs(dg.dog)<.3,JSON.stringify(dg));
  const mn=await pg.evaluate(()=>{ const d=document.createElement('div'); document.body.appendChild(d); PETS.menu(d); return new Promise(r=>setTimeout(()=>{ const b=[...d.querySelectorAll('[data-pa=seat]')].map(x=>x.dataset.w); d.remove(); r(b.join()); },1500)); });
  rec('the PETS menu lets you choose where a flying pet sits',mn==='head,shoulder,fly,walk',mn);
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,v])=>v+'× '+k).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'ALL PASS'); process.exit(bad?1:0); })();
