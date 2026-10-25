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
  const R=await pg.evaluate(()=>{ const out={}; const metas=WE.dbgProps(); out.meshes=metas.length; out.props=metas.reduce((a,e)=>a+e.ids.length,0);
    const mi=metas.findIndex(e=>e.me.isBatchedMesh&&e.ids.length); if(mi<0)return {...out,err:'no batched mesh'};
    const en=metas[mi], me=en.me, m=me.matrixWorld.clone();
    if(!WE.on)WE.toggle(); out.key=WE.dbgPick(mi,0); out.name=en.items[en.ids[0]].k;
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
  await b.close(); process.exit(bad?1:0);
})();
