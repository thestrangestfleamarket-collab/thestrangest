// PAINTING COPIES (src/159ha-copies.js, with the painter 159g and the paintings 159h): node tests/copies.cjs [dist/market.html] [out folder].
// PAINTING starts at 0 with five masterworks open (the first band); COPY on a canvas lists them; picked, the painter opens at the work's shape with the work shown faintly
// over the canvas (GUIDE toggles it); a copy of the work's own pixels scores high and passes, a blank one fails; each is a painting you own, marked as a copy, worth more
// for its score; a higher skill opens the next band and shows the guide stronger. With an out folder, pictures.
const {chromium}=require('playwright'), path=require('path');
const PAGE=path.resolve(process.argv[2]||'dist/market.html'), OUT=process.argv[3];
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:1280,height:800}}), errs={}; let bad=0;
  pg.on('pageerror',e=>{ const k=e.message.slice(0,160); errs[k]=(errs[k]||0)+1; });
  const rec=(n,ok,i)=>{ if(!ok)bad++; console.log((ok?'PASS ':'FAIL ')+n+(i?'  · '+i:'')); };
  const shot=async n=>{ if(!OUT)return; await pg.evaluate(()=>{ const L=document.getElementById('loading'); if(L)L.style.display='none'; }); await pg.screenshot({path:path.join(OUT,n+'.png')}); };
  await pg.goto('file://'+PAGE+'?fresh=1&hour=13&at=53,10',{timeout:240000}); await pg.waitForFunction(()=>window.__started,null,{timeout:400000}); await pg.waitForTimeout(1500);

  const a=await pg.evaluate(()=>({sk:FORAGE.sk('paint'),named:FORAGE.SK.some(s=>s[0]==='paint'&&s[1]==='PAINTING'),hidden:document.getElementById('copyp').hidden}));
  rec('PAINTING is a skill and starts at 0; the COPY list is not on screen',a.sk===0&&a.named&&a.hidden,JSON.stringify(a));
  const l=await pg.evaluate(async()=>{ FORAGE.give('canvas_m',3); const rows=JSON.stringify(FORAGE.ROWB.map(f=>f('canvas_m'))); await FORAGE.ACT.paintcopy('canvas_m'); const D=COPIES.dbg(), el=document.getElementById('copyp');
    return {rows,works:D.works,open:D.open.length,cards:el.querySelectorAll('.cw').length,locked:el.querySelectorAll('h4.lock').length,shown:!el.hidden&&getComputedStyle(el).display!=='none',credit:/CC0/.test(el.textContent)}; });
  rec('COPY on a canvas lists 50 masterworks, five open at skill 0-10, the other nine bands locked, each credited',l.rows.includes('COPY')&&l.works===50&&l.open===5&&l.cards===5&&l.locked===9&&l.shown&&l.credit,JSON.stringify(l));
  await shot('copies-list');

  // pick the first: the painter opens at the work's shape, the guide over the canvas
  const p=await pg.evaluate(async()=>{ const id=COPIES.dbg().open[0]; document.querySelector('#copyp .cw[data-w="'+id+'"]').click(); for(let i=0;i<40&&!PAINTER.state().open;i++)await new Promise(r=>setTimeout(r,100)); await new Promise(r=>setTimeout(r,400));
    const s=PAINTER.state(), g=await COPIES.guide(id), M=PAINTINGS.mine(), wid=Object.keys(M.wip)[0];
    return {id,open:s.open,w:s.w,h:s.h,ratio:g.img.width/g.img.height,guide:s.guide,btn:!document.getElementById('pp-guide').hidden,cp:M.wip[wid]&&M.wip[wid].cp,listGone:document.getElementById('copyp').hidden,canvas:INV.items.canvas_m}; });
  rec('a picked work opens the painter at its shape on a canvas from the pack, the guide on at about 20% (skill 0)',p.open&&Math.abs(p.w/p.h-p.ratio)<.02&&Math.max(p.w,p.h)===512&&p.guide&&p.guide.on&&Math.abs(p.guide.a-.2)<.01&&p.btn&&p.cp&&p.cp.i===p.id&&p.listGone&&p.canvas===2,JSON.stringify(p));
  // the guide shows: the view's pixels over the blank canvas differ with it on and off
  const seen=async()=>pg.evaluate(()=>{ const cv=document.getElementById('pp-cv'), x=cv.getContext('2d'), r=cv.getBoundingClientRect(), dpr=cv.width/r.width, s=PAINTER.state(), o=[];
    for(let i=1;i<8;i++)for(let j=1;j<8;j++){ const [sx,sy]=PAINTER.screen(s.w*i/8,s.h*j/8), d=x.getImageData(Math.round((sx-r.left)*dpr),Math.round((sy-r.top)*dpr),1,1).data; o.push(d[0],d[1],d[2]); } return o; });
  const on=await seen(); await shot('copies-guide'); await pg.evaluate(()=>PAINTER.guide()); await pg.waitForTimeout(200); const off=await seen(); await pg.evaluate(()=>PAINTER.guide()); await pg.waitForTimeout(100);
  const diff=on.reduce((t,v,i)=>t+Math.abs(v-off[i]),0)/on.length;
  rec('the masterwork shows faintly over the canvas (the view changes with GUIDE on and off) and is not on the painting itself',diff>4&&off.every((v,i)=>i%3!==0||Math.abs(v-244)<6),'mean change '+diff.toFixed(1));

  // a perfect copy: the work's own pixels drawn in, then FINISH and SIGN
  const sign=async()=>{ await pg.click('#pp-done'); await pg.waitForTimeout(200); const ro=await pg.evaluate(()=>document.getElementById('pp-title').readOnly); await pg.click('#pp-sign');
    await pg.waitForFunction(()=>!PAINTER.state().open,null,{timeout:10000}); await pg.waitForTimeout(1200); return ro; };
  await pg.evaluate(async id=>{ const g=await COPIES.guide(id); PAINTER.paintImage(g.img); },p.id);
  const ro=await sign();
  const f=await pg.evaluate(id=>{ const M=PAINTINGS.mine(), k=Object.keys(M.art).find(k=>M.art[k].cp&&M.art[k].cp.i===id); const a=k&&M.art[k];
    return {k,t:a&&a.t,by:a&&a.by,cp:a&&a.cp,own:k&&INV.items['pt_'+k],val:k&&ITEMS.prop('pt_'+k,'value'),mark:COPIES.mark(0),best:COPIES.dbg().best[id],note:k&&FORAGE.NOTE.map(n=>n('pt_'+k)).join(''),meta:k&&PAINTINGS.meta(k)}; },p.id);
  rec('a copy of the masterwork\'s own pixels scores high and passes',f.cp&&f.cp.s>=90&&f.cp.s>=f.mark&&f.best===f.cp.s,JSON.stringify(f.cp)+' mark '+f.mark);
  rec('the copy is a painting you own, titled after its artist, signed by you, marked as a copy everywhere it goes (the pack, a trade)',ro&&f.own===1&&/, AFTER /.test(f.t)&&f.by&&/A COPY AFTER/.test(f.note)&&f.meta&&f.meta.cp&&f.meta.cp.s===f.cp.s,JSON.stringify({t:f.t,by:f.by,note:f.note}));

  // a blank copy of the next work fails, and is worth less
  const q=await pg.evaluate(async()=>{ const id=COPIES.dbg().open[1]; await COPIES.begin(id); for(let i=0;i<40&&!PAINTER.state().open;i++)await new Promise(r=>setTimeout(r,100)); await new Promise(r=>setTimeout(r,300)); return {id,open:PAINTER.state().open}; });
  await sign();
  const g=await pg.evaluate(id=>{ const M=PAINTINGS.mine(), k=Object.keys(M.art).find(k=>M.art[k].cp&&M.art[k].cp.i===id); const a=k&&M.art[k]; return {cp:a&&a.cp,own:k&&INV.items['pt_'+k],val:k&&ITEMS.prop('pt_'+k,'value')}; },q.id);
  rec('a blank copy scores low and fails; still yours, worth less than the good one',q.open&&g.cp&&g.cp.s<f.mark&&g.own===1&&g.val<f.val,JSON.stringify({blank:g,good:{s:f.cp&&f.cp.s,val:f.val}}));

  // more skill: the next band opens, the guide shows stronger, a locked work is refused at a lower skill
  const s=await pg.evaluate(async()=>{ const lockId=(await COPIES.ready()).find(w=>w.b===1).id; FORAGE.S.sk.paint=0; const before=PAINTINGS.mine(); const n0=Object.keys(before.wip).length; await COPIES.begin(lockId); const refused=Object.keys(PAINTINGS.mine().wip).length===n0&&!PAINTER.state().open;
    FORAGE.S.sk.paint=150; const D=COPIES.dbg(); return {refused,open:D.open.length,guide:D.guide}; });
  rec('a work past your band is refused; at PAINTING 15 ten are open and the guide shows stronger',s.refused&&s.open===10&&s.guide>.25,JSON.stringify(s));

  const E=Object.entries(errs); rec('no page errors',!E.length,E.map(([k,n])=>n+'× '+k).join(' | '));
  console.log(bad?bad+' FAILED':'ALL PASS'); await b.close(); process.exit(bad?1:0); })();
