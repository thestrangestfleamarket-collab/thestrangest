// A moving picture of the Godot test in a browser: node godot/tools/webgif.cjs <url> <out-dir> [frames] [ms apart] [keys "d@0-1500,a@2000-2600"]
// (frames saved as PNGs in out-dir; tools/gif.py makes them a GIF)
const {chromium}=require('playwright'), fs=require('fs');
(async()=>{ const [url,dir,n='40',gap='150',keys='']=process.argv.slice(2); fs.mkdirSync(dir,{recursive:true});
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:640,height:480}});
  pg.on('pageerror',e=>console.log('page error:',e.message));
  await pg.goto(url); await pg.waitForFunction(()=>!document.getElementById('loading'),null,{timeout:240000}); await pg.waitForTimeout(2000); await pg.click('canvas');
  const plan=keys?keys.split(',').map(k=>{ const [key,r]=k.split('@'); const [a,z]=r.split('-').map(Number); return {key,a,z,down:false,done:false}; }):[];
  const t0=Date.now();
  for(let i=0;i<+n;i++){ const t=Date.now()-t0; for(const p of plan){ if(!p.down&&!p.done&&t>=p.a){ await pg.keyboard.down(p.key); p.down=true; } if(p.down&&t>=p.z){ await pg.keyboard.up(p.key); p.down=false; p.done=true; } }
    await pg.screenshot({path:`${dir}/f${String(i).padStart(3,'0')}.png`}); await pg.waitForTimeout(+gap); }
  await b.close(); })();
