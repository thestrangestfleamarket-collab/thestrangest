// THE BIRDS AS A SHEET (owner's rule: new characters shown first, black void): node tests/birdsheet.cjs <out> [zoom]: every kind in two
// rows, side on, everything else hidden; <out>-a.png wings folded, <out>-b.png wings spread
const {chromium}=require('playwright');
(async()=>{ const out=process.argv[2]||'bs', zoom=+(process.argv[3]||3); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:1200,height:700}}); const errs={}; pg.on('pageerror',e=>{ errs[e.message]=1; });
  await pg.goto('file://'+process.cwd()+'/dist/market.html?fresh=1&hour=12&hideme=1&at='+(process.env.AT||'0,3'),{timeout:180000}); await pg.waitForTimeout(28000);
  await pg.evaluate(()=>{ NEWSCLK(12,0); for(const b of [...BIRDS.list])BIRDS.drop(b); const T=BIRDS.T, p=STORE.pos, n=BIRDS.K.length, sc=BIRDS.ME.body.parent, keep=new Set(Object.values(BIRDS.ME));
    for(const o of sc.children)if(!keep.has(o)&&!o.isLight)o.visible=false; sc.background.setRGB(0,0,0); sc.fog=null;
    const ax=.7071, az=-.7071; window.SHEETB=BIRDS.K.map((k,i)=>{ const r=i<7?0:1, c=r?i-7-2.5:i-3, x=p.x+c*.75*T*ax+r*1.1*T*.7071, z=p.z+c*.75*T*az+r*1.1*T*.7071;
      const b=BIRDS.add(i,x,p.y+.3*T,z,{st:'still',src:'sheet'}); b.yaw=Math.atan2(ax,az); return b; }); });
  for(let i=0;i<zoom;i++){ await pg.mouse.move(600,350); await pg.mouse.wheel(0,-250); await pg.waitForTimeout(150); } await pg.waitForTimeout(3000);
  await pg.screenshot({path:out+'-a.png'});
  await pg.evaluate(()=>{ for(const b of SHEETB)b.wing=1.5; }); await pg.waitForTimeout(1500); await pg.screenshot({path:out+'-b.png'});
  console.log(JSON.stringify(await pg.evaluate(()=>BIRDDBG()))); console.log('errors',Object.keys(errs)); await b.close(); })();
