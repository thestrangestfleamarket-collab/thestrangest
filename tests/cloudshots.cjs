const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
const OUT=process.argv[2]||'out', PAGE=path.resolve(__dirname,'../dist/market.html'), errs=[], rep={};
const fin=()=>{ rep.errors=errs.slice(0,40); fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(rep,null,1)); console.log(JSON.stringify(rep).slice(0,3000)); };
(async()=>{ fs.mkdirSync(OUT,{recursive:true}); const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 for(const H of ['13','15.5']){
  const pg=await b.newPage({viewport:{width:960,height:540}}); pg.setDefaultTimeout(900000); pg.on('pageerror',e=>errs.push(H+' '+e.message.slice(0,300))); pg.on('console',m=>{ if(m.type()==='error')errs.push(H+' '+m.text().slice(0,300)); });
  await pg.goto('file://'+PAGE+'?fresh=1&hide=1&hour='+H+'&wx=CLEAR',{waitUntil:'commit'});
  for(let i=0;i<900;i++){ await pg.waitForTimeout(500); if(await pg.evaluate(()=>!!window.__dbg))break; }
  await pg.waitForTimeout(5000);
  const shot=async(n,f,w=4000,a)=>{ try{ if(f)await pg.evaluate(f,a); await pg.waitForTimeout(w); await pg.screenshot({path:path.join(OUT,H+'-'+n+'.png')}); }catch(e){ errs.push(n+': '+e.message.slice(0,200)); } };
  const SPOT=[[-13,-15],[13,-15],[-14,3],[14,3],[-12,21],[13,21]];
  rep['wx'+H]=await pg.evaluate(()=>({show:WX.show,vis:WX.clouds.visible,n:WX.cld.length,inst:WX.clouds.geometry.instanceCount,cy:WX.cy,pos:WX.clouds.position.toArray().map(v=>+v.toFixed(1)),sun:CLOCK.dir.toArray().map(v=>+v.toFixed(2))}));
  const mk=await pg.evaluate(()=>{ const C=WX.csm, N=C.n, cv=document.createElement('canvas'); cv.width=cv.height=N/2; const x=cv.getContext('2d'), im=x.createImageData(N/2,N/2), d=C.tex.image.data;
    for(let j=0;j<N/2;j++)for(let i=0;i<N/2;i++){ const v=d[(j*2)*N+i*2]; const o=(j*N/2+i)*4; im.data[o]=im.data[o+1]=im.data[o+2]=v>127?255:v*.5; im.data[o+3]=255; } x.putImageData(im,0,0);
    const M=__dbg.MAPK, P=M.PARK, T=window.TILE||33.9/30, cx=M.BOD.XS(P.round[0]+(P.ox||0)), cz=M.BOD.ZS(P.round[1]+(P.oy||0)), px=(wx,wz)=>[((wx-C.V.z)/C.w+.5)*N/2,((wz-C.V.w)/C.w+.5)*N/2];
    x.fillStyle='red'; for(const g of WX.spot){ const [a,b]=px(C.V.z+g[0],C.V.w+g[1]); x.fillRect(a-2,b-2,4,4); }
    x.strokeStyle='lime'; const w=(P.x1-P.x0)*T, h=(P.y1-P.y0)*T, [a,b]=px(M.BOD.XS(P.x0+(P.ox||0)),M.BOD.ZS(P.y0+(P.oy||0))), [c,e]=px(M.BOD.XS(P.x1+(P.ox||0)),M.BOD.ZS(P.y1+(P.oy||0))); x.strokeRect(Math.min(a,c),Math.min(b,e),Math.abs(c-a),Math.abs(e-b));
    return {url:cv.toDataURL(),V:[C.V.x,C.V.y,C.V.z,C.V.w],cc:[cx,cz]}; });
  fs.writeFileSync(path.join(OUT,H+'-mask.png'),Buffer.from(mk.url.split(',')[1],'base64')); rep['mask'+H]={V:mk.V,cc:mk.cc};
  rep['hook'+H]=await pg.evaluate(async()=>{ const S=WX.csm.tex.source, out={same:S===WX.lfx.env.source, v0:S.version}; let v=S.version, st=[]; Object.defineProperty(S,'version',{get(){return v;},set(x){ if(st.length<3)st.push(new Error().stack.slice(0,600)); v=x; }}); await new Promise(r=>setTimeout(r,2000)); out.v1=v; out.st=st; return out; });
  await pg.evaluate(()=>{ WX.bkl=null; });
  rep['diag'+H]=await pg.evaluate(()=>{ const R=WX.dbgR, out=[], seen=new Set(); let n=0; __scene.traverse(o=>{ if(!o.isMesh||n>12)return; const m=Array.isArray(o.material)?o.material[0]:o.material; if(!m||m.type!=='MeshLambertMaterial'||seen.has(m))return; seen.add(m); const p=R.properties.get(m), u=p.uniforms; if(!u)return; n++;
     out.push({name:o.name||o.parent&&o.parent.name, tCS:!!u.tCS, same:u.tCS&&u.tCS.value===WX.csm.tex, ver:u.tCS&&u.tCS.value.version, src:u.tCS&&u.tCS.value.source===WX.csm.tex.source, csV:u.csV&&JSON.stringify(u.csV.value), env:u.tENV&&u.tENV.value.version, envSrcV:u.tENV&&u.tENV.value.source.version, prog:!!p.currentProgram, hasCS:p.currentProgram?R.getContext().getShaderSource(R.getContext().getAttachedShaders(p.currentProgram.program)[1]).includes('tCS'):null}); });
     const E=WX.lfx.env.image.data, row=63*64*4; return {bkl:(WX.bkl||[]).slice(0,10).concat((WX.bkl||[]).slice(-5)),bkn:(WX.bkl||[]).length,mats:out.slice(0,1), P0:[E[row],E[row+1],E[row+2]], texV:WX.csm.tex.version, fx:[...WX.lfx.on]}; });
  await pg.mouse.move(480,270); for(let i=0;i<10;i++){ await pg.mouse.wheel(0,600); await pg.waitForTimeout(150); }
  for(let i=0;i<6;i++)await shot('animal'+i,(g)=>{ const M=__dbg.MAPK, P=M.PARK, T=window.TILE||33.9/30; const s=WX.spot[g]; STORE.goTo(WX.clouds.position.x+s[0],WX.clouds.position.z+s[1],'up'); },3000,i);
  await shot('allshadow',()=>{ window.__sv=WX.csm.tex.image.data.slice(); WX.csm.tex.image.data.fill(255); WX.csm.tex.needsUpdate=true; },2500); await shot('noshadow',()=>{ WX.csm.tex.image.data.fill(0); WX.csm.tex.needsUpdate=true; },2500); await pg.evaluate(()=>{ WX.csm.tex.image.data.set(__sv); WX.csm.tex.needsUpdate=true; });

  if(H==='13'){
   await shot('wide',()=>{ const M=__dbg.MAPK, P=M.PARK; STORE.goTo(M.BOD.XS(P.round[0]+(P.ox||0)),M.BOD.ZS(P.round[1]+(P.oy||0)),'up'); },3000);
   await pg.keyboard.press('v'); await shot('behind',()=>{ const s=__dbg.clock.sunV; __dbg.face(Math.atan2(-s.x,-s.z)); window.LOOKPITCH&&LOOKPITCH(4); },4000);
   await shot('behind-away',()=>{ const s=__dbg.clock.sunV; __dbg.face(Math.atan2(s.x,s.z)); window.LOOKPITCH&&LOOKPITCH(4); },4000);
   await pg.keyboard.press('v'); await shot('first-up',()=>{ const s=__dbg.clock.sunV; __dbg.face(Math.atan2(-s.x,-s.z)); window.LOOKPITCH&&LOOKPITCH(-40); },4000);
   await shot('first-up2',()=>{ window.LOOKPITCH&&LOOKPITCH(40); },4000);
   await shot('first-away',()=>{ const s=__dbg.clock.sunV; __dbg.face(Math.atan2(s.x,s.z)); window.LOOKPITCH&&LOOKPITCH(-25); },4000);
   rep.render=await pg.evaluate(()=>{ try{ const r=RENDERLIST(); return {head:r.head||r.totals||null}; }catch(e){ return 'ERR '+e.message; } });
   rep.info=await pg.evaluate(()=>{ const i=__dbg && window.__scene ? null:null; return null; });
  }
  await pg.close(); }
 fin(); await b.close(); })();
