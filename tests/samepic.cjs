// THE SAME PICTURE (19 Oct 2026, the move to modules): node tests/samepic.cjs <base page> <head page> [out dir]
// Opens the base and the pull request at the same places and hour, takes a picture of each, and compares them pixel by pixel in the
// browser. Moving code around must not change what is drawn: fails when more than 3% of the pixels differ in a place (people and
// birds walk, so a little always moves). The pictures are kept in the out dir for a look.
const {chromium}=require('playwright'), path=require('path'), fs=require('fs');
const [BASE,HEAD,OUT='out/samepic']=process.argv.slice(2).map((p,i)=>i<2?path.resolve(p):p);
const PLACES=['THE STREET','THE DUNGEON','THE CASTLE','THE BODEGA'];
let bad=0; const ok=(c,m)=>{ console.log((c?'ok   ':'FAIL ')+m); if(!c)bad++; };
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const shot=async(page,place,tag)=>{ const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); const errs=[];
    pg.on('pageerror',e=>errs.push(e.message.slice(0,160)));
    await pg.goto('file://'+page+'?fresh=1&hour=13&place='+encodeURIComponent(place),{waitUntil:'commit'});
    let s=false; for(let i=0;i<900&&!(s=await pg.evaluate(()=>!!window.__started).catch(()=>false));i++)await pg.waitForTimeout(500);
    await pg.waitForTimeout(8000); const f=path.join(OUT,place.replace(/\W+/g,'-').toLowerCase()+'-'+tag+'.png'); await pg.screenshot({path:f}); await pg.close(); return {f,s,errs}; };
  const cmp=await b.newPage();
  for(const place of PLACES){ const A=await shot(BASE,place,'base'), B=await shot(HEAD,place,'head');
    ok(B.s,place+': starts'); ok(B.errs.filter(e=>!A.errs.includes(e)).length===0,place+': no new page errors '+B.errs.join(' | '));
    const d=await cmp.evaluate(async([a,c])=>{ const load=u=>new Promise(r=>{ const i=new Image(); i.onload=()=>r(i); i.src=u; });
      const [x,y]=await Promise.all([load(a),load(c)]), cv=document.createElement('canvas'); cv.width=x.width; cv.height=x.height; const g=cv.getContext('2d');
      g.drawImage(x,0,0); const p=g.getImageData(0,0,cv.width,cv.height).data; g.clearRect(0,0,cv.width,cv.height); g.drawImage(y,0,0); const q=g.getImageData(0,0,cv.width,cv.height).data;
      let n=0; for(let i=0;i<p.length;i+=4)if(Math.abs(p[i]-q[i])+Math.abs(p[i+1]-q[i+1])+Math.abs(p[i+2]-q[i+2])>48)n++; return n/(p.length/4); },
      ['data:image/png;base64,'+fs.readFileSync(A.f).toString('base64'),'data:image/png;base64,'+fs.readFileSync(B.f).toString('base64')]);
    ok(d<=0.03,place+': '+(d*100).toFixed(2)+'% of pixels differ'); }
  await b.close(); console.log(bad?bad+' FAILED':'all good'); process.exit(bad?1:0); })();
