// THE BIG TREES (144d-bigtrees.js, 144e-trees.js) and the park's woods (061-park.js): the giants in the middle of the park stand (whole only near the eye, plain shapes further off) with their branches and leaves, every one climbable and no other tree; next to a trunk the prompt says SPACE · CLIMB and SPACE starts the climb. node tests/bigtrees.cjs [shotdir] (slow: software rendering)
const {chromium}=require('playwright'), out=process.argv[2];
(async()=>{ const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1000,height:620}}), errs=[]; let bad=0; pg.on('pageerror',e=>errs.push(e.message));
  const ok=(c,m)=>{ console.log((c?'ok  ':'FAIL')+' '+m); if(!c)bad++; };
  await pg.goto('file://'+process.cwd()+'/dist/market.html?at=54,168&hour=15&npcwait=99&fresh=1',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<300;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started).catch(()=>false))break; }
  await pg.waitForFunction(()=>window.BIGTREESDBG&&BIGTREESDBG().trees>0,null,{timeout:180000}).catch(()=>{});
  const d=await pg.evaluate(()=>({...BIGTREESDBG(),farTris:PARK.bigFar.count*20+PARK.big.length*24,others:(PARK.treeItems?PARK.treeItems():[]).filter(o=>PARK.climbable.includes(o)).length,spots:TREESDBG().spots}));
  d.want=require(process.cwd()+'/data/world.json').bigTrees.filter(o=>o.kind).length; ok(d.trees===d.want&&d.trees>=6&&d.climbable===d.trees,'every big tree in data/world.json stands, all climbable ('+d.trees+' of '+d.want+', '+d.climbable+' climbable)');
  ok(d.branches.every(n=>n>=9),'each has its big branch and 4 to 8 more ('+d.branches.join(', ')+' limb pieces)');
  ok(d.puffs>200||d.farBlobs>d.trees*10,'leaves on them ('+d.puffs+' puffs near, '+d.farBlobs+' far blobs)');
  ok(d.others===0,'no other tree is climbable');
  const G=await pg.evaluate(()=>{ const it=PARK.big.find(t=>t.k==='BIGG'); if(!it)return null; const TH=__dbg.THREE, m=new TH.Matrix4(), p=new TH.Vector3(), q=new TH.Quaternion(), s=new TH.Vector3(); let n=0, inside=0, top=0; const H=it.top-it.y, cy=it.y+H*.68/.92, RX=40*TREES.T/.84, RY=48*TREES.T/.84;
    for(let i=0;i<it.leaves.count;i++){ it.leaves.getMatrixAt(i,m); m.decompose(p,q,s); n++; if(((p.x-it.x)**2+(p.z-it.z)**2)/RX**2+((p.y-cy)/RY)**2<.7)inside++; top=Math.max(top,p.y-it.y); }
    return {n,inside,h:(top/TREES.T*.84)|0,limbs:it.lb.length}; });
  ok(G&&G.n>2000&&!G.inside&&G.h>140,'the giant (owner, 10 Nov 2026): '+(G?G.h+' m tall, '+G.n+' leaf puffs all on its outside shell ('+G.inside+' inside), '+G.limbs+' limb pieces to climb':'missing'));
  ok(d.farTris<20000,'cheap from far off (owner, 8 Nov 2026: "they shouldnt cost much from far off at all"): '+d.farTris+' triangles for every big tree as its plain shape; whole only near ('+d.near+' near now)');
  const w=await pg.evaluate(()=>{ const B=SHARED.BOD, ax=B.XS(0), bx=B.XS(1)-ax, az=B.ZS(0), bz=B.ZS(1)-az, L=PARK.treeItems().map(o=>[(o.x-ax)/bx-PARK.ox,(o.z-az)/bz-PARK.oy]); return {n:L.length,onPath:L.filter(([x,y])=>PARK.pd(x,y)<0).length,tris:PARK.ring.userData.P.length/9}; });
  ok(w.n>=300,'the park as thick with trees as Central Park ('+w.n+' trees, 8 Nov 2026)'); ok(!w.onPath,'no trunk on a path ('+w.onPath+')'); ok(w.tris<150000,'cheap: '+w.tris+' tree triangles, one draw');
  const rg=await pg.evaluate(()=>{ const R=PARK.ring, ids=(R&&R.userData.ids||[]).filter(id=>id>=0); return {n:ids.length,whole:ids.filter(id=>R.getVisibleAt(id)).length,far:!!PARK.ringFar}; });
  ok(rg.far&&rg.whole<rg.n/2,'the ring along the wall cheap from far off (owner, 8 Nov 2026: "simplify the other park trees too"): '+rg.whole+' of '+rg.n+' whole near you, the rest a crown on a trunk (about 32 triangles)');
  const shot=async n=>{ if(!out)return; await pg.waitForFunction(k=>TREESDBG().fr>=k,(await pg.evaluate(()=>TREESDBG().fr))+12,{timeout:120000}).catch(()=>{}); await pg.screenshot({path:`${out}/${n}.png`}); };
  const look=(x,z,tx,tz,view,pitch)=>pg.evaluate(([x,z,tx,tz,view,pitch])=>{ if(x!=null)STORE.goTo(x,z,'up'); __dbg.UI.setView(view); const q=__dbg.pos(), h=Math.atan2(tx-q[0],tz-q[2]); SHARED.heading=h; SHARED.yaw=SHARED.yawTo=h+Math.PI; SHARED.pitch=SHARED.pitchTo=pitch; },[x,z,tx,tz,view,pitch]);
  const T=await pg.evaluate(()=>PARK.climbable.map(t=>({x:t.x,z:t.z,tr:t.tr,st:Math.max(t.tr,t.rf||0)+.05*TREES.T,k:t.k})));   // st: where you stand beside its foot (solid out to its bark at the ground, 9 Nov 2026)
  if(out){ await look(54,168,T[0].x,T[0].z,'third',-.45); await pg.waitForTimeout(4000); await look(null,0,T[0].x,T[0].z,'third',-.45); await shot('middle');
    for(let i=0;i<T.length;i++){ const t=T[i], a=Math.atan2(t.z-168,t.x-54); await look(t.x+Math.cos(a)*55,t.z+Math.sin(a)*55,t.x,t.z,'third',-.5); await pg.waitForTimeout(4000); await look(null,0,t.x,t.z,'third',-.5); await shot('tree'+(i+1)+'-'+t.k); } }
  const t=T[1]; await look(t.x+t.st,t.z,t.x,t.z,'third',-.3); await pg.waitForTimeout(3000); await look(null,0,t.x,t.z,'third',-.3);
  await pg.waitForFunction(()=>/CLIMB/.test(PROMPT.text()),null,{timeout:60000}).catch(()=>{});
  const pr=await pg.evaluate(()=>PROMPT.text().replace(/<[^>]+>/g,'')); ok(/SPACE · CLIMB/.test(pr),'next to the trunk the prompt says SPACE · CLIMB ("'+pr+'")'); await shot('prompt');
  await pg.keyboard.down('w'); await pg.waitForTimeout(2500); await pg.keyboard.up('w');
  ok(!(await pg.evaluate(()=>TREESDBG().climbing)),'walking into the trunk does not climb it');
  await look(t.x+t.st,t.z,t.x,t.z,'third',-.3); await pg.waitForTimeout(2000);
  await pg.keyboard.down(' '); await pg.waitForTimeout(1500); await pg.keyboard.up(' '); await pg.keyboard.down('w'); await pg.waitForTimeout(8000); await pg.keyboard.up('w');
  const c=await pg.evaluate(()=>TREESDBG()); ok(c.climbing&&c.mode==='trunk'&&c.ch>0,'SPACE climbs it ('+c.mode+', '+(c.ch||0).toFixed(2)+' up the trunk)'); await shot('climbing');
  ok(!errs.length,'no page errors'+(errs.length?': '+errs.join(' | '):''));
  console.log(bad?bad+' failed':'all big tree checks passed'); await b.close(); process.exit(bad?1:0); })();
