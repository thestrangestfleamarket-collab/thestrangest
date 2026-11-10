// THE WINDOWS' STILL PICTURES: PW_CHROMIUM=/opt/pw-browsers/chromium node tools/winpics.cjs  (after python3 build.py; then build again)
// Opens dist/market.html, builds each inside off the map that has glass looking in, pictures every such pane from the street
// (WINDOWS.shoot, src/130a-windows.js) and writes data/winpics.json: {id:[a JPEG data URL per pane, in the panes' order]}. Re-run when a shop's inside or front changes.
const {chromium}=require('playwright'), fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
(async()=>{ const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:640,height:360}}); pg.setDefaultTimeout(1800000); pg.on('pageerror',e=>console.log('ERR',e.message.slice(0,200)));
  await pg.goto('file://'+ROOT+'/dist/market.html?fresh=1&hour=13&online=0',{waitUntil:'commit'}); await pg.waitForFunction(()=>window.__started,null,{polling:1000});
  const ids=await pg.evaluate(()=>[...new Set(WINDOWS.panes.filter(p=>p.look==='in'&&p.me.parent).map(p=>p.off))]), out={}, skip=[];
  for(const id of ids){ const r=await pg.evaluate(id=>WINDOWS.shoot(id).catch(e=>'ERR '+e.message),id); if(Array.isArray(r)&&r.length&&r.every(Boolean)){ out[id]=r; console.log(id,r.length,'panes',Math.round(r.join('').length/1024)+' KB'); } else skip.push(id+(typeof r==='string'?' ('+r+')':'')); }
  fs.writeFileSync(ROOT+'/data/winpics.json',JSON.stringify(out)); console.log('wrote data/winpics.json',Object.keys(out).length,'insides',Math.round(fs.statSync(ROOT+'/data/winpics.json').size/1024)+' KB; not pictured:',skip.join(', ')||'none');
  await b.close(); })();
