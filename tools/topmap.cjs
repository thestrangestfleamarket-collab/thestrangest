// THE MAP EDITOR'S GROUND PICTURE: node tools/topmap.cjs [--json] — runs dist/market.html headless at noon, shoots the street level straight down in pieces (data/topmap/t<i>_<j>.jpg) and writes data/topmap.json (the pieces, the map's bounds, the old editor's things with their sizes). --json skips the pictures. Re-run after the map changes; build after.
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT='data/topmap', C=56, PX=1024, JPX=512, onlyJson=process.argv.includes('--json');
(async()=>{ fs.mkdirSync(OUT,{recursive:true});
  const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM||undefined,args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']}); const pg=await b.newPage({viewport:{width:1000,height:800}});
  const errs={}; pg.on('pageerror',e=>{ errs[e.message.slice(0,150)]=1; });
  await pg.goto('file://'+path.resolve('dist/market.html')+'?hour=12&hideme=1&at=35,25',{timeout:240000}); await pg.waitForFunction(()=>window.__started,{timeout:400000}); await pg.waitForTimeout(8000);
  const G=await pg.evaluate(()=>{ const K=__dbg.MAPK, F=K.RING.cf, T=__dbg.cv().TILE, OX=K.BOD.OX, OY=K.BOD.OY; return {F:{...F},OX,OY,T,B:{x0:(F.x0-OX)*T,x1:(F.x1-OX)*T,z0:(F.y0-OY)*T,z1:(F.y1-OY)*T}}; });
  const NX=Math.ceil((G.B.x1-G.B.x0)/C), NZ=Math.ceil((G.B.z1-G.B.z0)/C), tiles=[];
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){ const name=`t${i}_${j}.jpg`, cx=G.B.x0+(i+.5)*C, cz=G.B.z0+(j+.5)*C; tiles.push(name); if(onlyJson)continue;
    await pg.evaluate(([x,z])=>{ __dbg.UI.goTo(x,z,'up'); },[cx,cz]); await pg.waitForTimeout(5000);
    const url=await pg.evaluate(([x,z,C,PX,JPX])=>{ const D=__dbg, R=D.renderer, TH=D.THREE, s=new TH.Vector2(); R.getSize(s); const pr=R.getPixelRatio();
      const cam=new TH.OrthographicCamera(-C/2,C/2,C/2,-C/2,1,3000); cam.up.set(0,0,-1); cam.position.set(x,800,z); cam.lookAt(x,0,z); cam.updateMatrixWorld(); cam.layers.mask=D.camera.layers.mask;
      const fog=D.scene.fog; D.scene.fog=null; R.setPixelRatio(1); R.setSize(PX,PX,false); R.setRenderTarget(null); R.render(D.scene,cam);
      const c=document.createElement('canvas'); c.width=c.height=JPX; const g=c.getContext('2d'); g.filter='brightness(1.35) contrast(1.08)'; g.drawImage(R.domElement,0,0,JPX,JPX);
      D.scene.fog=fog; R.setPixelRatio(pr); R.setSize(s.x,s.y,false); return c.toDataURL('image/jpeg',.82); },[cx,cz,C,PX,JPX]);
    fs.writeFileSync(path.join(OUT,name),Buffer.from(url.split(',')[1],'base64')); console.log('piece',i,j); }
  // the things the editor moves, as the game builds them (the old editor's list: map tiles, x east, y as the game's z)
  const items=await pg.evaluate(async()=>{ const P=__dbg.MAPK.PARK; if(P.load&&!P.ready){ await P.load(); } await GAMEED.ensure(); const r2=v=>v==null?v:Math.round(v*1000)/1000;
    return MAPED.base().filter(o=>o.gid).map(o=>({gid:o.gid,n:o.n,ly:o.ly,sh:o.sh,x:r2(o.x),y:r2(o.y),w:r2(o.w),d:r2(o.d),r:r2(o.r),rot:r2(o.rot||0),ox:r2(P.ox||0),oy:r2(P.oy||0)})); });
  const at=new Date().toISOString().slice(0,10);
  fs.writeFileSync('data/topmap.json',JSON.stringify({about:'the map editor\'s ground picture and things (tools/topmap.cjs): pieces of C world units from B.x0,B.z0, NX across; map tiles = O + world / T',at,C,NX,NZ,PX:JPX,O:[G.OX,G.OY],T:G.T,F:G.F,B:G.B,tiles,items}));
  console.log('topmap',NX+'x'+NZ,'pieces,',items.length,'things','errors',JSON.stringify(Object.keys(errs))); await b.close(); })();
