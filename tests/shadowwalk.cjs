const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'shout', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={};
const fin=()=>{ rep.errors=errs.slice(0,40); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,6000)); };
process.on('unhandledRejection',e=>{ errs.push('TEST '+String(e&&e.message||e).slice(0,400)); fin(); process.exit(1); });
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error')errs.push(m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__started&&!!window.__dbg))break; }
  await pg.waitForTimeout(6000);
  await pg.evaluate(()=>{ window.SUNLOG=[]; window.DN&&DN.set('day'); });
  rep.diag=await pg.evaluate(()=>{ const B=__dbg.MAPK.BOD, T=33.9/30, M=B.MAP||{}, big=[]; let U=null, bb=null, V3=__dbg.camO().position.constructor;
    __scene.traverseVisible(o=>{ if(!o.isMesh||!o.castShadow)return; if(!o.geometry.boundingBox)o.geometry.computeBoundingBox(); if(!bb)bb=o.geometry.boundingBox.clone(); if(o.isInstancedMesh&&o.computeBoundingBox){ o.computeBoundingBox(); bb.copy(o.boundingBox).applyMatrix4(o.matrixWorld); } else { bb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); }
      if(!isFinite(bb.min.x))return; if(!U)U=bb.clone(); else U.union(bb); const s=bb.getSize(new V3()); big.push([o.name||o.type,+(s.x/T).toFixed(0),+(s.y/T).toFixed(0),+(s.z/T).toFixed(0),+(bb.min.x/T).toFixed(0),+(bb.min.z/T).toFixed(0),+(bb.max.y/T).toFixed(0)]); });
    big.sort((a,b)=>b[1]*b[3]-a[1]*a[3]);
    return {T,landR:__dbg.MAPK.MODS.landR,map:M&&{x0:B.XS(M.x0)/T,x1:B.XS(M.x1)/T,z0:B.ZS(M.y0)/T,z1:B.ZS(M.y1)/T},street:{z:B.ZS((B.CURB+B.FAR)/2)/T,x60:B.XS(60)/T,x0:B.XS(0)/T},casters:big.length,union:{min:U.min.clone().divideScalar(T),max:U.max.clone().divideScalar(T)},big:big.slice(0,25),sun:window.SUNDBG&&SUNDBG(),dir:CLOCK.dir}; });
  const T=rep.diag.T;
  const at=async(x,yaw,w=3500)=>{ await pg.evaluate(([x,yaw])=>{ const B=__dbg.MAPK.BOD; STORE.goTo(B.XS(x),B.ZS((B.CURB+B.FAR)/2),'up'); __dbg.face(yaw); },[x,yaw]); await pg.waitForTimeout(w); await pg.evaluate(y=>__dbg.face(y),yaw); await pg.waitForTimeout(800); };
  const shot=async n=>{ const p=path.join(OUT,n+'.png'); await pg.screenshot({path:p}); return p; };
  const diff=async(a,b2,n)=>{ const A=fs.readFileSync(a).toString('base64'), Bb=fs.readFileSync(b2).toString('base64');
    const r=await pg.evaluate(async([A,Bb])=>{ const ld=s=>new Promise(r=>{ const i=new Image(); i.onload=()=>r(i); i.src='data:image/png;base64,'+s; }); const [ia,ib]=await Promise.all([ld(A),ld(Bb)]);
      const c=document.createElement('canvas'); c.width=ia.width; c.height=ia.height; const g=c.getContext('2d'); g.drawImage(ia,0,0); const da=g.getImageData(0,0,c.width,c.height); g.drawImage(ib,0,0); const db=g.getImageData(0,0,c.width,c.height);
      const o=g.createImageData(c.width,c.height); let n=0; for(let i=0;i<da.data.length;i+=4){ const d=Math.abs(da.data[i]-db.data[i])+Math.abs(da.data[i+1]-db.data[i+1])+Math.abs(da.data[i+2]-db.data[i+2]); const on=d>30; if(on)n++; o.data[i]=on?255:da.data[i]*.3; o.data[i+1]=on?0:da.data[i+1]*.3; o.data[i+2]=on?0:da.data[i+2]*.3; o.data[i+3]=255; }
      g.putImageData(o,0,0); return {n,pct:+(100*n/(c.width*c.height)).toFixed(2),png:c.toDataURL('image/png').split(',')[1]}; },[A,Bb]);
    fs.writeFileSync(path.join(OUT,n+'.png'),Buffer.from(r.png,'base64')); return {n:r.n,pct:r.pct}; };
  const diffm=async(a,b2,a2,n)=>{ const R=[a,b2,a2].map(f=>fs.readFileSync(f).toString('base64'));
    const r=await pg.evaluate(async R=>{ const ld=s=>new Promise(r=>{ const i=new Image(); i.onload=()=>r(i); i.src='data:image/png;base64,'+s; }); const I=await Promise.all(R.map(ld)), c=document.createElement('canvas'); c.width=I[0].width; c.height=I[0].height; const g=c.getContext('2d'), W=c.width, H=c.height;
      const D=I.map(i=>{ g.drawImage(i,0,0); return g.getImageData(0,0,W,H).data; }), df=(p,q,i)=>Math.abs(p[i]-q[i])+Math.abs(p[i+1]-q[i+1])+Math.abs(p[i+2]-q[i+2])>30;
      const nz=new Uint8Array(W*H); for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(df(D[0],D[2],(y*W+x)*4))for(let v=-3;v<=3;v++)for(let u=-3;u<=3;u++){ const X=x+u, Y=y+v; if(X>=0&&Y>=0&&X<W&&Y<H)nz[Y*W+X]=1; }
      const o=g.createImageData(W,H); let n=0, m=0; for(let i=0;i<W*H;i++){ const k=i*4, d=df(D[0],D[1],k), on=d&&!nz[i]; if(on)n++; if(d&&nz[i])m++; o.data[k]=on?255:d?255:D[0][k]*.35; o.data[k+1]=on?0:d?220:D[0][k+1]*.35; o.data[k+2]=on?0:d?0:D[0][k+2]*.35; o.data[k+3]=255; }
      g.putImageData(o,0,0); return {n,noisy:m,png:c.toDataURL('image/png').split(',')[1]}; },R);
    fs.writeFileSync(path.join(OUT,n+'.png'),Buffer.from(r.png,'base64')); return {n:r.n,noisy:r.noisy}; };
  await pg.keyboard.press('v'); await pg.waitForTimeout(1500);
  const E=-Math.PI/2, Wd=Math.PI/2;
  rep.walk=[]; for(let k=0;k<13;k++){ const x=150+4*k; await at(x,E,2500); await shot('walk-'+String(k).padStart(2,'0')); rep.walk.push([x,(await pg.evaluate(()=>window.SUNDBG&&SUNDBG().still))]); }
  rep.ab={}; for(const [P,yaw,tag] of [[110,E,'E110'],[150,Wd,'W150'],[190,E,'E190'],[230,Wd,'W230']]){
    await at(P+11,yaw); await at(P,yaw); const a=await shot('ab-'+tag+'-a'); await pg.waitForTimeout(1500); const a2=await shot('ab-'+tag+'-a2');
    await at(P-11,yaw); await at(P,yaw); const b2=await shot('ab-'+tag+'-b');
    rep.ab[tag]=await diffm(a,b2,a2,'abd-'+tag); }
  await pg.keyboard.press('v'); await pg.keyboard.press('v'); await pg.waitForTimeout(1500);
  await at(150,-Math.PI/4); await pg.mouse.move(480,270);
  rep.zoom=[]; const z0=await shot('iso-z0'); for(let i=1;i<=4;i++){ await pg.mouse.wheel(0,i<3?400:-400); await pg.waitForTimeout(2500); const zz=await shot('iso-z'+i); rep.zoom.push([await pg.evaluate(()=>window.CAMW&&CAMW()),await pg.evaluate(()=>window.SUNDBG&&SUNDBG().still)]); }
  await pg.waitForTimeout(1500); const zb=await shot('iso-zback'); await pg.waitForTimeout(1500); const zb2=await shot('iso-zback2'); rep.zoomBack=await diffm(z0,zb,zb2,'isod-zoom');
  rep.sun=await pg.evaluate(()=>window.SUNDBG&&SUNDBG()); rep.sunlog=await pg.evaluate(()=>window.SUNLOG);
  fin(); await b.close(); })();
