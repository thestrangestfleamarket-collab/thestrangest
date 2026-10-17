// THE PERF AUDIT's extras (17 Oct 2026; needs dist/market-prof.html, tools/perfprof.py): the batched meshes by place (triangles, how many
// inside a room's box, how many in the store far east), the Walker's triangles worn and folded away, every character's triangles and state.
//   node tests/perfextra.cjs <out.json> "<query>"
const {chromium}=require('playwright'); const fs=require('fs'), path=require('path');
(async()=>{ const out=process.argv[2]||'extra.json', q=process.argv[3]||'hour=13';
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']}); const pg=await b.newPage({viewport:{width:1920,height:1080}}); pg.setDefaultTimeout(600000);
  await pg.goto('file://'+path.resolve(__dirname,'../dist/market-prof.html')+'?npcwait=99&'+q,{waitUntil:'commit'});
  for(let i=0;i<300;i++){ await pg.waitForTimeout(1000); if(await pg.evaluate(()=>!!window.__started&&!!window.__R).catch(()=>false))break; }
  await pg.waitForTimeout(15000);
  const R=await pg.evaluate(()=>{ const {scene}=__R, boxes=__R.ROOMS.boxes(), SB=__R.STORE.bound;
    const tris=g=>(g.index?g.index.count:g.attributes.position.count)/3;
    // the batched meshes: every face by its thing's place, inside a room's box or not, in the store or not
    const batches=[]; scene.traverse(o=>{ if(!(o.isMesh&&o.userData.objOf))return; const g=o.geometry, P=g.attributes.position.array, I=g.index?g.index.array:null, n=tris(g), byP={};
      let par=o.parent, grp='scene'; while(par&&par!==scene){ for(const [k,G] of Object.entries(__R.MAPG))if(G===par)grp=k; par=par.parent; }
      o.updateWorldMatrix(true,false); const m=o.matrixWorld.elements;
      for(let t=0;t<n;t++){ let x=0,y=0,z=0; for(let k=0;k<3;k++){ const v=(I?I[t*3+k]:t*3+k)*3; x+=P[v]; y+=P[v+1]; z+=P[v+2]; } x/=3; y/=3; z/=3;
        const wx=m[0]*x+m[4]*y+m[8]*z+m[12], wy=m[1]*x+m[5]*y+m[9]*z+m[13], wz=m[2]*x+m[6]*y+m[10]*z+m[14];
        const ob=o.userData.objOf[Math.floor(t/2)], pl=ob?ob.place:'(untagged)', B=byP[pl]||(byP[pl]={tris:0,inRoom:0,inStore:0});
        B.tris++; if(boxes.some(r=>wx>r.x0&&wx<r.x1&&wz>r.z0&&wz<r.z1&&(r.y0==null||wy>r.y0-.1)&&(r.y1==null||wy<r.y1+.1)))B.inRoom++; if(SB&&wx>SB.x0&&wx<SB.x1&&wz>SB.z0&&wz<SB.z1)B.inStore++; }
      batches.push({group:grp,mat:o.material.type,tris:n,visible:o.visible,castShadow:o.castShadow,clipPlanes:(o.material.clippingPlanes||[]).length,byPlace:byP}); });
    // the Walker: each piece's triangles, worn or folded away
    const W3=__R.W3, g=W3.mesh.geometry, pid=g.attributes.pidx.array, I=g.index?g.index.array:null, n=tris(g), per=new Array(W3.pcs.length).fill(0);
    for(let t=0;t<n;t++)per[Math.round(pid[I?I[t*3]:t*3])]++;
    const walker={tris:n,worn:per.reduce((a,c,i)=>a+(W3.HIDE[i]?0:c),0),hidden:per.reduce((a,c,i)=>a+(W3.HIDE[i]?c:0),0),
      top:W3.pcs.map((P,i)=>[P.n,per[i],W3.HIDE[i]]).sort((a,b)=>b[1]-a[1]).slice(0,25)};
    const npcs=__R.NPCS.map(N=>{ let t=0; N.g.traverse(o=>{ if(o.isMesh)t+=tris(o.geometry); }); return {key:N.key,lv:N.lv,tris:t,far:!!N.far,visible:N.g.visible,skinned:!!N.me&&N.me.isSkinnedMesh,mixer:!!N.mixer,bones:N.me&&N.me.skeleton?N.me.skeleton.bones.length:0}; });
    const mus=['MUS','PNM','SGM','DRM'].map(k=>{ const M=__R[k]; if(!M||!M.g)return [k,null]; let t=0; M.g.traverse(o=>{ if(o.isMesh)t+=tris(o.geometry); }); return [k,{tris:t,visible:M.g.visible}]; });
    const progs=(__R.renderer.info.programs||[]).map(p=>p.cacheKey.slice(0,60));
    return {rooms:boxes.length,store:SB,batches,walker,npcs,mus,progs};
  });
  fs.writeFileSync(out,JSON.stringify(R,null,1)); console.log('done',out); await b.close(); })();
