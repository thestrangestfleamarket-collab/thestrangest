// THE VEHICLE EDITOR (150pd-vedit, ADMIN > VEHICLE EDITOR): node tests/vedit.cjs [out]: it lists every vehicle (the cars, the road and flying traffic, the helicopter, the train, the rides); the picked one turns in its studio; a colour, the size and a hidden part change the parked car itself; more of a model joins the traffic; a copy parks in front of you and goes again; <out>.png the editor.
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]; const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1100,height:800}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=13&at=275,-62',{timeout:300000});
  await pg.waitForFunction(()=>window.__started,null,{timeout:400000});
  await pg.waitForFunction(()=>!document.getElementById('loading')&&window.CARS&&CARS.dbg().loaded&&window.TRAFFIC&&TRAFFIC.dbg().loaded&&[...CARS.cars.values()].every(C=>C.mesh),null,{timeout:300000,polling:1000});
  const r=await pg.evaluate(()=>{ __dbg.UI.menuTab('set'); const el=document.getElementById('dvedit'); document.querySelectorAll('.panes>[data-p]').forEach(p=>p.hidden=p.dataset.p!=='vedit'); VLOOK.panel(el);
    const ids=[...el.querySelectorAll('[data-pick]')].map(b=>b.dataset.pick); el.querySelector('[data-pick="car:muscle-car-60s"]').click(); return {ids,canvas:!!el.querySelector('.vcv')}; });
  const has=p=>r.ids.some(i=>i.startsWith(p));
  ok(r.ids.filter(i=>i.startsWith('car:')).length>=6&&r.ids.filter(i=>i.startsWith('tr:')).length>=20&&has('heli:')&&r.ids.includes('train')&&r.ids.includes('magic_carpet')&&r.ids.includes('rowboat')&&r.ids.includes('moored')&&r.ids.length>=33,'every vehicle is listed ('+r.ids.length+'): '+r.ids.join(' '));
  await pg.waitForTimeout(2500);
  const lit=await pg.evaluate(()=>{ const c=document.querySelector('#dvedit .vcv'), d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0; for(let i=0;i<d.length;i+=4)if(Math.abs(d[i]-0x15)+Math.abs(d[i+1]-0x17)+Math.abs(d[i+2]-0x1e)>30)n++; return n/(d.length/4); });
  ok(lit>.05,'the picked car turns in its studio ('+(lit*100).toFixed(1)+'% drawn)');
  // the horse (10 Nov 2026, the owner's pick "Colours and size"): under RIDES, its coats' colours and its size, no parts; it turns in the studio like the rest
  const hz=await pg.evaluate(async()=>{ const el=document.getElementById('dvedit'); el.querySelector('[data-pick="horse"]').click(); const t0=performance.now(); while(!el.querySelector('input[data-pal]')&&performance.now()-t0<60000)await new Promise(r=>setTimeout(r,300));
    await new Promise(r=>setTimeout(r,2500)); const c=el.querySelector('.vcv'), d=c&&c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0; if(d)for(let i=0;i<d.length;i+=4)if(Math.abs(d[i]-0x15)+Math.abs(d[i+1]-0x17)+Math.abs(d[i+2]-0x1e)>30)n++;
    let h=el.querySelector('[data-pick="horse"]'); while(h&&h.tagName!=='H3')h=h.previousElementSibling; const grp=h&&h.textContent==='RIDES';
    const r={rides:!!grp,pals:el.querySelectorAll('input[data-pal]').length,size:!!el.querySelector('input[data-f="s"]'),parts:!!el.querySelector('[data-part]'),drawn:d?+(n/(d.length/4)*100).toFixed(1):0};
    el.querySelector('[data-pick="car:muscle-car-60s"]').click(); return r; });
  ok(hz.rides&&hz.pals>=8&&hz.size&&!hz.parts&&hz.drawn>3,'the horse is in the editor under RIDES: its coat colours and its size, no parts, turning in the studio '+JSON.stringify(hz));
  await pg.waitForTimeout(1500);
  const e=await pg.evaluate(async()=>{ const C=CARS.cars.get('c1'), m=C.mesh, P=VLOOK.palette(m), s0=m.scale.x, ps=VLOOK.parts(m), w=ps.find(p=>p.key.startsWith('WHEEL FL'));
    VLOOK.set('car:muscle-car-60s',{s:1.5,pal:{[P[0]]:'ff00ff'},parts:{[w.key]:{h:1}}}); await new Promise(r=>setTimeout(r,400));
    let pink=0; for(const p of VLOOK.parts(m)){ const a=p.m.geometry.attributes.color; if(a)for(let i=0;i<a.array.length;i+=3)if(a.array[i]>.95&&a.array[i+1]<.05&&a.array[i+2]>.95)pink++; }
    const got={pal:P.length,scale:+(m.scale.x/s0).toFixed(3),pink,wheel:!w.m.visible,other:CARS.cars.get('c2').mesh.scale.x/s0};
    VLOOK.set('car:muscle-car-60s',null); await new Promise(r=>setTimeout(r,400)); let back=0; for(const p of VLOOK.parts(m)){ const a=p.m.geometry.attributes.color; if(a)for(let i=0;i<a.array.length;i+=3)if(a.array[i]>.95&&a.array[i+1]<.05&&a.array[i+2]>.95)back++; }
    got.reset=back===0&&w.m.visible&&Math.abs(m.scale.x-s0)<1e-9; return got; });
  ok(e.pal>=3&&e.pink>0&&e.scale===1.5&&e.wheel&&e.other===1&&e.reset,'a colour, the size and a hidden wheel change that car (only that model), and RESET takes them off '+JSON.stringify(e));
  const t=await pg.evaluate(async()=>{ const n0=TRAFFIC.dbg().lanes.map(L=>L.cars.length); VLOOK.more={hatchback:2,'hover-pod':1}; VLOOK.set('tr:hatchback',null); await new Promise(r=>setTimeout(r,500));
    const d=TRAFFIC.dbg(), n1=d.lanes.map(L=>L.cars.length), road=d.lanes.filter(L=>!L.fly).flatMap(L=>L.cars).filter(c=>c.model==='hatchback').length, air=d.lanes.filter(L=>L.fly).flatMap(L=>L.cars).filter(c=>c.model==='hover-pod').length;
    VLOOK.more={}; VLOOK.set('tr:hatchback',null); await new Promise(r=>setTimeout(r,500)); return {n0,n1,road,air,n2:TRAFFIC.dbg().lanes.map(L=>L.cars.length)}; });
  ok(t.n1.reduce((a,b)=>a+b)===t.n0.reduce((a,b)=>a+b)+3&&t.road>=2&&t.air>=1&&t.n2.join()===t.n0.join(),'more of a model joins the traffic in its own lanes, and goes again '+JSON.stringify(t));
  const p=await pg.evaluate(async()=>{ const c=await VLOOK.park('camper-van'), C=CARS.cars.get(c.id); const had=!!(C&&C.model==='camper-van'); await new Promise(r=>setTimeout(r,1500)); const shown=!!(C.mesh&&C.mesh.visible), near=Math.hypot(C.x-STORE.pos.x,C.z-STORE.pos.z);
    await VLOOK.unpark(c.id); return {id:c.id,had,shown,near:+near.toFixed(1),gone:!CARS.cars.has(c.id)}; });
  ok(p.had&&p.shown&&p.near<12&&p.gone,'a copy parks in front of you and is taken away '+JSON.stringify(p));
  if(out){ await pg.evaluate(()=>{ __dbg.UI.toggleMenu(); __dbg.UI.toggleMenu(); __dbg.UI.menuTab('set'); document.querySelectorAll('.panes>[data-p]').forEach(p=>p.hidden=p.dataset.p!=='vedit'); const el=document.getElementById('dvedit'); VLOOK.panel(el); el.querySelector('[data-pick="tr:hover-coupe"]').click(); });
    await pg.waitForTimeout(2500); await pg.screenshot({path:out+'.png'}); }
  ok(!errs.length,'no page errors '+errs.slice(0,3).join(' | ')); await b.close(); process.exit(bad?1:0); })();
