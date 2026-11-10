// THE SAME PICTURE (19 Oct 2026, the move to modules): node tests/samepic.cjs <base page> <head page> [out dir]
// Opens the base and the pull request at the same places and hour (in:<id> steps inside that address's door, as tests/jobsim.cjs does), takes a picture of each, and compares them pixel by pixel in the
// browser. Moving code around must not change what is drawn. People and birds walk and the clock runs, so a little always moves:
// Math.random is seeded the same in every page; the pull request fails when it differs from the base by more than 5% of the pixels
// (the base differs from itself by up to 2% at the street and the dungeon: SAMEPIC_NOISE=1 takes the base twice and measures it; the park waits for PARK.ready before its shot, as tests/startprof.cjs does). The sun's rays are hidden (they pick a spot near you on a timer, so a page that
// starts faster gets another beam). The pictures are kept in the out dir for a look.
const {chromium}=require('playwright'), path=require('path'), fs=require('fs');
const [BASE,HEAD,OUT='out/samepic']=process.argv.slice(2).map((p,i)=>i<2?path.resolve(p):p);
const PLACES=['THE STREET','THE DUNGEON','THE DUNGEON STAIR','CENTRAL PARK','THE PLATFORM','THE BODEGA','in:diner','in:bar'];
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const shot=async(page,place,tag)=>{ const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); const errs=[];
    pg.on('pageerror',e=>errs.push(e.message.slice(0,160)));
    await pg.addInitScript(()=>{ let x=123456789; Math.random=()=>{ x^=x<<13; x^=x>>>17; x^=x<<5; return (x>>>0)/4294967296; }; });
    const inside=place.startsWith('in:')?place.slice(3):null;
    await pg.goto('file://'+page+'?capture=1&fresh=1&hour=13'+(inside?'':'&place='+encodeURIComponent(place)),{waitUntil:'commit'});
    let s=false; for(let i=0;i<900&&!(s=await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(500);
    if(s&&inside)await pg.evaluate(id=>{ const T=__dbg.cv().TILE, A=MAIL.addr.find(a=>a.id===id); if(!A)return; const st=A.b.step; STORE.goTo(st.x-A.b.F.n.x*1.2*T,st.z-A.b.F.n.z*1.2*T,'up'); },inside);
    if(s&&place==='CENTRAL PARK')await pg.waitForFunction(()=>window.PARK&&PARK.ready,null,{polling:500,timeout:600000}).catch(()=>{});
    await pg.waitForTimeout(20000); const f=path.join(OUT,place.replace(/\W+/g,'-').toLowerCase()+'-'+tag+'.png'); await pg.screenshot({path:f}); await pg.close(); return {f,s,errs}; };
  const cmp=await b.newPage();
  const TWICE=!!process.env.SAMEPIC_NOISE;
  for(const place of PLACES){ const A=await shot(BASE,place,'base'), A2=TWICE?await shot(BASE,place,'base2'):null, B=await shot(HEAD,place,'head');
    ok(B.s,place+': starts'); ok(B.errs.filter(e=>!A.errs.includes(e)).length===0,place+': no new page errors '+B.errs.join(' | '));
    const diff=(P,Q)=>cmp.evaluate(async([a,c])=>{ const load=u=>new Promise(r=>{ const i=new Image(); i.onload=()=>r(i); i.src=u; });
      const [x,y]=await Promise.all([load(a),load(c)]), cv=document.createElement('canvas'); cv.width=x.width; cv.height=x.height; const g=cv.getContext('2d');
      g.drawImage(x,0,0); const p=g.getImageData(0,0,cv.width,cv.height).data; g.clearRect(0,0,cv.width,cv.height); g.drawImage(y,0,0); const q=g.getImageData(0,0,cv.width,cv.height).data;
      let n=0; for(let i=0;i<p.length;i+=4)if(Math.abs(p[i]-q[i])+Math.abs(p[i+1]-q[i+1])+Math.abs(p[i+2]-q[i+2])>48)n++; return n/(p.length/4); },['data:image/png;base64,'+fs.readFileSync(P.f).toString('base64'),'data:image/png;base64,'+fs.readFileSync(Q.f).toString('base64')]);
    const noise=A2?await diff(A,A2):.02, d=await diff(A,B);
    if(d>noise+0.03||process.env.SAMEPIC_THUMBS)for(const [tag,P] of [['base',A],['head',B]]){ const u=await cmp.evaluate(async src=>{ const i=new Image(); await new Promise(r=>{ i.onload=r; i.src=src; }); const c=document.createElement('canvas'); c.width=200; c.height=Math.round(320*i.height/i.width); c.getContext('2d').drawImage(i,0,0,c.width,c.height); return c.toDataURL('image/jpeg',.45); },'data:image/png;base64,'+fs.readFileSync(P.f).toString('base64'));
      const b64=u.split(',')[1]; for(let k=0,n=Math.ceil(b64.length/3800);k<n;k++)console.log('::notice title=thumb '+place+' '+tag+' '+k+'/'+n+'::'+b64.slice(k*3800,(k+1)*3800)); }
    ok(d<=noise+0.03,place+': '+(d*100).toFixed(2)+'% of pixels differ from the base (allowed '+((noise+.03)*100).toFixed(2)+'%'+(A2?', the base differs from itself by '+(noise*100).toFixed(2)+'%':'')+')'); }
  await b.close(); console.log(bad?bad+' FAILED':'all good'); process.exit(bad?1:0); })();
