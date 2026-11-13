// Winged pets in the air always flap; flyers fly behind you and land on the ground behind you when you stand still or sit; a pet that cannot fly waits on the ground while you fly (src/146zj-pets.js): node tests/perch.cjs [out folder]
const {chromium}=require('playwright'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader'],...(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{})}); const pg=await b.newPage({viewport:{width:960,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), U=async(f,ms=120000)=>{ for(const t=Date.now();Date.now()-t<ms;await wait(400))if(await pg.evaluate(f))return true; return false; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12&at=80,95',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000});
  await pg.evaluate(()=>{ for(const k of ['UI','OWNED','pos'])if(!window[k])window[k]=PETS.dbg[k]; const f=document.getElementById('fday'); if(f)f.hidden=true; });
  // a parrot held up in the air beside you: its wings beat (the clip alone holds them still)
  const fl=await pg.evaluate(async()=>{ const W=PETS.WU, N=await PETS.make('tparrot',{k:'parrot',n:'',c:[],s:[],z:100,h:false},()=>({x:pos.x+2*W,z:pos.z,y:SHARED.py+2*W,hd:0}));
    const ar=[], bone=()=>{ let q=null; N.g.traverse(o=>{ if(o.isBone&&o.name==='LeftWing')q=o.quaternion.clone(); }); return q; }, qs=[];
    for(let i=0;i<12;i++){ await new Promise(r=>setTimeout(r,1500)); qs.push(bone()); ar.push(N.restless()?1:0); } let mx=0; for(const a of qs)for(const c of qs)mx=Math.max(mx,2*Math.acos(Math.min(1,Math.abs(a.dot(c))))*57.3);
    const air=ar.join(''); PETS.drop(N); return {deg:+mx.toFixed(1),air}; });
  rec('a parrot in the air beats its wings and is never frozen still',fl.deg>20&&/^0*1+$/.test(fl.air),JSON.stringify(fl));
  for(const k of ['parrot','budgie','crow','bee','scarletmacaw','owl']){
    await pg.evaluate(k=>{ for(const r of PETS.list().slice())if(!r.perma)PETS.letGo(r.id); for(const r of PETS.list().slice())if(r.perma)r.perma=false,PETS.letGo(r.id); PETS.add({k,n:'',c:[],s:[],z:100,h:false,w:''}); },k);
    await pg.waitForFunction(k=>{ const N=PETS.mine(); return !!(N&&N.pet.k===k&&N.g.visible); },k,{timeout:60000});
    const ok=k==='bee'?(await wait(20000),false):await U(()=>{ const N=PETS.mine(); const q=N&&N.g.position; return !!(N&&N.landed()&&!N.restless()&&Math.abs(q.y-SHARED.groundY(q.x,q.z))<.05*PETS.WU); },180000);
    const p=await pg.evaluate(()=>{ const N=PETS.mine(), W=PETS.WU, q=N.g.position, dx=q.x-pos.x, dz=q.z-pos.z;
      return {k:N.pet.k,down:N.landed(),air:N.restless(),up:+((q.y-SHARED.groundY(q.x,q.z))/W).toFixed(2),off:+(Math.hypot(dx,dz)/W).toFixed(2),behind:+((dx*Math.sin(SHARED.heading)+dz*Math.cos(SHARED.heading))/W).toFixed(2),e:UI.choices().some(c=>c.th===N.th)}; });
    if(k==='bee'){ rec('a bee (only flies) hovers behind you, never lands',!p.down&&p.air&&p.behind<-.5&&p.off<2,JSON.stringify(p)); continue; }
    rec('a still '+k+' lands on the ground behind you, wings in, no E prompt behind you',ok&&p.down&&!p.air&&Math.abs(p.up)<.1&&p.behind<-.5&&p.off<2&&!p.e,JSON.stringify(p));
    if(OUT)for(const a of [0,1.57,3.14]){ await pg.evaluate(a=>{ UI.setView('third'); UI.dist=Math.min(UI.dist,2.6*PETS.WU); SHARED.pitchTo=SHARED.pitch=.2; SHARED.yawTo=SHARED.yaw=SHARED.heading+a; },a); await wait(2500); await pg.screenshot({path:OUT+'/land-'+k+'-'+Math.round(a*10)+'.png'}); } }
  // sat on a seat up off the ground (a theatre row): the parrot lands behind you, never flies on (owner, 11 Nov 2026)
  await pg.evaluate(()=>{ for(const r of PETS.list().slice())PETS.letGo(r.id); PETS.add({k:'parrot',n:'',c:[],s:[],z:100,h:false,w:''}); });
  await pg.waitForFunction(()=>{ const N=PETS.mine(); return !!(N&&N.pet.k==='parrot'&&N.g.visible); },null,{timeout:60000}); await wait(3000);
  await pg.evaluate(()=>{ SHARED.py=SHARED.groundY(pos.x,pos.z)+.8*PETS.WU; USE.sitAt(pos.x,pos.z,SHARED.py+.6*PETS.WU,SHARED.heading); });
  const sat=await U(()=>{ const N=PETS.mine(); return !!(N&&USE.seat&&N.landed()&&!N.restless()); },60000), sp=await pg.evaluate(()=>{ const N=PETS.mine(); return {seat:!!USE.seat,down:N.landed(),air:N.restless()}; });
  rec('you sit: your parrot lands and stays on the ground',sat&&sp.seat,JSON.stringify(sp)); await pg.evaluate(()=>USE.stand());
  // a dog whose person is up in the air (flying, up high): it waits on the ground below
  const dg=await pg.evaluate(async()=>{ const W=PETS.WU, gy=SHARED.groundY(pos.x,pos.z); let L={x:pos.x,z:pos.z,y:gy,hd:0}; const N=await PETS.make('tdog',{k:'dog',n:'',c:[],s:[],z:100,h:false},()=>L);
    for(let i=0;i<20&&!N.placed;i++)await new Promise(r=>setTimeout(r,300)); L={x:pos.x+3*W,z:pos.z,y:gy+4*W,hd:0}; await new Promise(r=>setTimeout(r,8000));
    const r={dog:+((N.g.position.y-gy)/W).toFixed(2),moved:+(Math.hypot(N.st.x-pos.x,N.st.z-pos.z)/W).toFixed(2)}; PETS.drop(N); return r; });
  rec('a dog stays on the ground while you are up in the air',Math.abs(dg.dog)<.3,JSON.stringify(dg));
  const mn=await pg.evaluate(()=>{ const d=document.createElement('div'); document.body.appendChild(d); PETS.menu(d); return new Promise(r=>setTimeout(()=>{ const b=[...d.querySelectorAll('[data-pa=seat]')].map(x=>x.dataset.w); d.remove(); r(b.join()); },1500)); });
  rec('the PETS menu lets you choose where a flying pet sits',mn==='fly,walk',mn);
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,v])=>v+'× '+k).join(' | '));
  await b.close(); console.log(bad?bad+' FAILED':'ALL PASS'); process.exit(bad?1:0); })();
