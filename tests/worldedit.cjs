// THE WORLD EDITOR ON PARK PROPS (099-worldedit.js, WED): enters the park, waits for its BatchedMesh scenery to register, then
// picks a prop and checks the editor moves it (its instance matrix changes), deletes it (hidden), and puts it back. node tests/worldedit.cjs. Exits 1 on failure.
const {chromium}=require('playwright');
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}});
  pg.on('pageerror',e=>console.log('pageerror:',e.message.slice(0,200)));
  await pg.goto('file://'+process.cwd()+'/dist/market.html?hour=13&hideme=1&npcwait=99',{waitUntil:'commit',timeout:180000});
  for(let i=0;i<180&&!await pg.evaluate(()=>!!window.__started).catch(()=>false);i++)await wait(1000);
  ok(await pg.evaluate(()=>!!window.__started),'the market starts');
  // walk into the park
  await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD, P=PARK; STORE.goTo(B.XS(P.round[0]+(P.ox||0)+3),B.ZS(P.round[1]+(P.oy||0)+3),'up'); });
  let built=false; for(let i=0;i<180&&!built;i++){ await wait(1000); built=await pg.evaluate(()=>!!(window.WE&&WE.dbgProps&&WE.dbgProps().length)&&PARK.in&&!(window.FADE&&FADE.busy)).catch(()=>false); }
  ok(built,'the park\'s editable props registered in WED');
  const R=await pg.evaluate(async()=>{ const out={}; const metas=WE.dbgProps(); out.meshes=metas.length; out.props=metas.reduce((a,e)=>a+e.ids.length,0);
    const mi=metas.findIndex(e=>e.me.isBatchedMesh&&e.ids.length); if(mi<0)return {...out,err:'no batched mesh'};
    const en=metas[mi], me=en.me, m=me.matrixWorld.clone();
    if(!WE.on)await WE.toggle(); out.key=WE.dbgPick(mi,0); out.name=en.items[en.ids[0]].k;
    me.getMatrixAt(0,m); const y0=m.elements[13];
    const up=document.querySelector('#we [data-up="1"]'); up.click(); up.click();
    me.getMatrixAt(0,m); out.movedUp=m.elements[13]-y0;
    document.querySelector('#we #wdel').click(); out.hidden=me.getVisibleAt(0);
    WE.dbgPick(mi,0); document.querySelector('#we #wback').click();
    me.getMatrixAt(0,m); out.visBack=me.getVisibleAt(0); out.backToStart=Math.abs(m.elements[13]-y0)<1e-4;
    out.colHidden=document.querySelector('#we [data-prow]').style.display==='none';
    WE.dbgPick(mi,0); document.querySelector('#we #wcopy').click(); { const c=WE.copies(), st=WE.getState(), e=c.length&&st[c[0]]; out.copies=c.length; out.copyOf=e&&e.copy;
      const up2=document.querySelector('#we [data-up="1"]'); up2.click(); out.copyUp=e?e.t[1]:0; document.querySelector('#we #wdel').click(); out.copiesAfterDel=WE.copies().length; }
    WE.toggle(); return out; });
  console.log(JSON.stringify(R));
  ok(R.meshes>0&&R.props>0,'WED holds '+R.props+' props across '+R.meshes+' meshes');
  ok(typeof R.key==='string'&&/^park\|/.test(R.key),'a prop picks with a stable park key ('+R.key+', a '+R.name+')');
  ok(R.movedUp>0.01,'UP moves the prop\'s instance matrix ('+(R.movedUp||0).toFixed(2)+')');
  ok(R.hidden===false,'DELETE hides the prop');
  ok(R.visBack===true&&R.backToStart,'BACK AS IT WAS restores it');
  ok(R.colHidden===true,'colour/brightness rows hidden for a prop');
  ok(R.copies===1&&R.copyOf===R.name,'COPY puts a second '+R.name+' beside it, kept in the edits ('+R.copyOf+')');
  ok(R.copyUp>0,'the copy is picked and moves on its own');
  ok(R.copiesAfterDel===0,'DELETE takes the copy away');
  // every kind of thing: a park lamp (painted quads, its light goes with it), a river rock, a lake rock, a kerb brick, a gate lantern (instances), an oak (crown and trunk together)
  const Q=await pg.evaluate(async()=>{ const out={}, metas=WE.dbgProps(), M=metas[0].me.matrixWorld.clone(), Y=(me,i)=>{ me.getMatrixAt(i,M); return M.elements[13]; };
    if(!WE.on)await WE.toggle(); const $=s=>document.querySelector('#we '+s), up=()=>{ $('[data-up="1"]').click(); $('[data-up="1"]').click(); };
    const inst=name=>{ const mi=metas.findIndex(e=>e.me.isInstancedMesh&&e.items.some(it=>it.k===name)); if(mi<0)return {err:'none'}; const en=metas[mi], bid=en.ids.findIndex(j=>en.items[j].k===name), y0=Y(en.me,bid);
      const key=WE.dbgPick(mi,bid), parts=WE.dbgLinked(), tint=$('#wcol').closest('[data-prow]').style.display!=='none'; up(); const dy=Y(en.me,bid)-y0; $('#wdel').click(); en.me.getMatrixAt(bid,M); const gone=M.elements[0]===0&&M.elements[5]===0;
      WE.dbgPick(mi,bid); $('#wback').click(); return {key,parts,tint,dy:+dy.toFixed(3),gone,back:Math.abs(Y(en.me,bid)-y0)<1e-4}; };
    for(const k of ['river rock','lake rock','kerb brick','gate lantern'])out[k]=inst(k);
    { const ti=metas.findIndex(e=>e.me.isInstancedMesh&&/^OakTree/.test(e.items[0].k)), te=metas[ti], it=te&&te.items[te.ids[0]];
      const ci=metas.findIndex(e=>e.me.isBatchedMesh&&e.items.some(c=>c.k===it.k&&Math.abs(c.x-it.x)<1e-3&&Math.abs(c.z-it.z)<1e-3)), ce=metas[ci], cb=ce?ce.ids.findIndex(j=>{ const c=ce.items[j]; return c.k===it.k&&Math.abs(c.x-it.x)<1e-3&&Math.abs(c.z-it.z)<1e-3; }):-1;
      if(ti<0||cb<0)out.oak={err:'no oak '+ti+' '+cb}; else { const t0=Y(te.me,0), c0=Y(ce.me,cb), key=WE.dbgPick(ti,0), parts=WE.dbgLinked(); up(); const dt=Y(te.me,0)-t0, dc=Y(ce.me,cb)-c0; $('#wdel').click(); const cHid=ce.me.getVisibleAt(cb)===false; WE.dbgPick(ti,0); $('#wback').click();
        out.oak={key,parts,dt:+dt.toFixed(3),dc:+dc.toFixed(3),cHid,back:Math.abs(Y(te.me,0)-t0)<1e-4&&ce.me.getVisibleAt(cb)}; } }
    { const key=WE.dbgObj('park lamp',0), s=WE.dbgSel(), p=s.parts[0], P=p.me.geometry.attributes.position.array, y0=P[p.v0*3+1], L=s.follow&&s.follow[0], ly0=L&&L.position.y, f0=s.fix&&s.fix.slice();
      $('#wdel').click(); WE.dbgObj('park lamp',0); const dark=L&&L.userData.i0===0, hole=s.sol[0]>1e8; $('#wback').click(); WE.dbgObj('park lamp',0); up();
      const q=s.parts[0]; out.lamp={key,dy:+(q.me.geometry.attributes.position.array[q.v0*3+1]-y0).toFixed(3),light:L?+(L.position.y-ly0).toFixed(3):null,dark,hole,lit:L&&L.userData.i0>0};
      $('#wcopy').click(); out.lamp.copies=WE.copies().length; $('#wdel').click(); out.lamp.copiesAfter=WE.copies().length; WE.dbgObj('park lamp',0); $('#wback').click(); }
    WE.toggle(); return out; });
  console.log(JSON.stringify(Q));
  for(const k of ['river rock','lake rock','kerb brick','gate lantern']){ const r=Q[k]||{}; ok(/^park\|/.test(r.key||'')&&r.dy>0.01&&r.gone&&r.back,'a '+k+' picks, moves up, goes and comes back ('+(r.key||r.err)+')'); }
  ok(Q['kerb brick']&&Q['kerb brick'].tint,'a kerb brick can be recoloured');
  ok(Q['gate lantern']&&Q['gate lantern'].parts>=3,'a gate lantern\'s frame, glass and core are one thing ('+(Q['gate lantern']||{}).parts+' parts)');
  ok(Q.oak&&Q.oak.parts===2&&Q.oak.dt>0.01&&Math.abs(Q.oak.dt-Q.oak.dc)<1e-3&&Q.oak.cHid&&Q.oak.back,'an oak\'s trunk and crown move and go together ('+JSON.stringify(Q.oak)+')');
  ok(Q.lamp&&Q.lamp.dy>0.01&&Math.abs(Q.lamp.light-Q.lamp.dy)<1e-3,'a park lamp moves and its light goes with it');
  ok(Q.lamp&&Q.lamp.dark&&Q.lamp.hole&&Q.lamp.lit,'a removed lamp goes dark and stops blocking, and comes back lit');
  ok(Q.lamp&&Q.lamp.copies===1&&Q.lamp.copiesAfter===0,'COPY makes a second park lamp; DELETE takes it away');
  await b.close(); process.exit(bad?1:0);
})();
