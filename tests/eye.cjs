// THE EYE (src/162fa-eye.js): node tests/eye.cjs [out folder]. Click the eye, then: a quick bar slot (its thing, and the slot not used), the minimap, yourself, the ground (and the street),
// a window (the bag); Esc stops it; a picture of each card with an out folder.
const {chromium}=require('playwright'); const OUT=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1100,height:640}}); const errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const wait=ms=>new Promise(r=>setTimeout(r,ms)), shot=async n=>{ if(OUT){ require('fs').mkdirSync(OUT,{recursive:true}); await pg.screenshot({path:OUT+'/'+n+'.png'}); } };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:300000}); await wait(4000);
  await pg.evaluate(()=>__dbg.UI.goName('THE STREET')); await wait(9000);
  await pg.evaluate(()=>{ __dbg.UI.setView('third'); SHARED.yawTo=SHARED.yaw=SHARED.heading+Math.PI; SHARED.pitchTo=SHARED.pitch=.35; }); await wait(2500);
  rec('the eye is on the vitals panel',await pg.evaluate(()=>{ const e=document.getElementById('heye'); return !!e&&!!e.closest('#vit')&&e.getBoundingClientRect().width>0; }));
  const look=async(sel,xy)=>{ await pg.click('#heye'); await wait(300); if(sel)await pg.click(sel); else await pg.mouse.click(xy[0],xy[1]); await wait(500); return pg.evaluate(()=>({on:EYE.on,last:EYE.last})); };
  // a quick bar slot: what is in it, and it is not used
  const slot=await pg.evaluate(()=>HUDDBG().slots.indexOf('act:map'));
  const q=await look(`#hqb [data-i="${slot}"]`); const mapOpen=await pg.evaluate(()=>!!(__dbg.UI.brochure&&__dbg.UI.brochure.isOpen&&__dbg.UI.brochure.isOpen())||[...document.querySelectorAll('#bro')].some(e=>!e.hidden));
  rec('a quick bar slot: its thing and which slot, and the click does not use it',/MAP/.test(q.last.name)&&/QUICK BAR SLOT/.test(q.last.kind)&&!mapOpen&&!q.on,JSON.stringify(q)); await shot('1-slot');
  const m=await look('#hmap canvas'); rec('the minimap',m.last.name==='THE MINIMAP',JSON.stringify(m.last)); await shot('2-minimap');
  const me=await pg.evaluate(()=>{ const T=__dbg.THREE, p=__dbg.pos(), v=new T.Vector3(p[0],SHARED.py+1.3,p[2]).project(SHARED.cam), r=__dbg.renderer.domElement.getBoundingClientRect(); return [r.left+(v.x+1)/2*r.width,r.top+(1-v.y)/2*r.height]; });
  const y=await look(null,me); rec('yourself',y.last.name==='YOU',JSON.stringify(y.last)); await shot('3-you');
  const g=await look(null,[me[0]+170,me[1]+60]); rec('the ground, and the street it is on',/GROUND|WALL|FLOOR/.test(g.last.name)||g.last.kind!=null,JSON.stringify(g.last)); await shot('4-ground');
  await pg.evaluate(()=>BAG.toggle(true)); await wait(800);
  // someone on the street (owner, 8 Nov 2026: "the eye icon just says wall even when i clicked on the person"): their name, not the ground, a wall or the tunnels under the street
  let ppl=[]; for(let k=0;k<8&&!ppl.length;k++){ if(k){ await pg.evaluate(k=>{ SHARED.yawTo=SHARED.yaw=SHARED.heading+Math.PI+k*Math.PI/4; },k); await wait(1500); }
  ppl=await pg.evaluate(()=>{ const T=__dbg.THREE, c=__dbg.camO(), r=document.querySelector('canvas').getBoundingClientRect(), me=__dbg.you(), out=[];
    for(const n of __dbg.NPCS.all()){ if(!n||!n.g||!n.g.visible)continue; const w=new T.Vector3(); n.g.getWorldPosition(w); if(Math.hypot(w.x-me.x,w.z-me.z)>30)continue; const C=new T.Box3().setFromObject(n.g).getCenter(new T.Vector3()), q=C.project(c);
      if(Math.abs(q.x)<.85&&Math.abs(q.y)<.8&&q.z<1)out.push({name:n.name,x:(q.x+1)/2*r.width+r.left,y:(1-q.y)/2*r.height+r.top}); } return out.slice(0,6); }); }
  // (each one asked where they stand at that moment: they walk)
  const named=await pg.evaluate(names=>{ const T=__dbg.THREE, c=__dbg.camO(), r=document.querySelector('canvas').getBoundingClientRect(), out=[];
    for(const n of __dbg.NPCS.all()){ if(!n||!n.g||!names.includes(n.name))continue; const q=new T.Box3().setFromObject(n.g).getCenter(new T.Vector3()).project(c), x=(q.x+1)/2*r.width+r.left, y=(1-q.y)/2*r.height+r.top;
      out.push([n.name,EYE.what(document.elementFromPoint(x,y)||document.body,x,y).name]); } return out; },ppl.map(p=>p.name));
  rec('someone on the street: their name (at least one of those in view, none the tunnels under the street)',named.some(([n,w])=>w&&!/GROUND|WALL|FLOOR|CEILING|SKY|TUNNEL/.test(w)&&n.toUpperCase().startsWith(w.split(' ')[0])),JSON.stringify(named));
  const bg=await look('#bagp'); rec('a window: the bag',/BAG/.test(bg.last.kind||bg.last.name),JSON.stringify(bg.last)); await shot('5-bag'); await pg.evaluate(()=>BAG.toggle(false));
  await pg.click('#heye'); await wait(200); await pg.keyboard.press('Escape'); await wait(200); rec('Esc stops the eye',await pg.evaluate(()=>!EYE.on));
  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,n])=>n+'× '+k).join(' | '));
  console.log(bad?bad+' FAILED':'ALL PASS'); await b.close(); process.exit(bad?1:0); })();
