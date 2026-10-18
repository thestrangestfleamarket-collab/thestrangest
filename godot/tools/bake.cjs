// THE GODOT TEST'S DATA (owner, 18 Oct 2026: "lets start on a rebuild using godot ... a test small game with just one building and my walker on
// godot. match graphics exactly"): the three.js game itself is the source. This opens dist/market.html headless, and from the running page takes
// what Godot needs to draw the same picture: the bodega's faces (and the ground round it) with their atlases, its lamps, the solids and the
// ground's heights there, the clock's light hour by hour, and the Walker: his mesh (his pieces, their colours) and his moves, sampled from the
// game's own rig (the idle by the clock, the walk and the run by the distance walked, as the rig steps them).
// node godot/tools/bake.cjs   (after python3 build.py; writes godot/data/)
const {chromium}=require('playwright'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'../..'), OUT=path.join(ROOT,'godot/data');
(async()=>{ fs.mkdirSync(OUT,{recursive:true});
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const pg=await b.newPage({viewport:{width:800,height:600}}); pg.on('pageerror',e=>console.log('page error:',e.message));
  await pg.goto('file://'+ROOT+'/dist/market.html?hour=15.5&fresh=1&interiors=0&perfx=0&trees=0&walkers=0&at='+(process.env.AT||'9.9,1.6')+'',{timeout:180000});
  await pg.waitForFunction(()=>window.__started,null,{timeout:240000}); await pg.waitForTimeout(3000);

  // ---- the world round the bodega ----
  const W=await pg.evaluate(()=>{ const D=__dbg, T=D.THREE, rooms=D.ROOMS.boxes(), BB={x0:Math.min(rooms[0].x0,rooms[1].x0),x1:Math.max(rooms[0].x1,rooms[1].x1),z0:Math.min(rooms[0].z0,rooms[1].z0),z1:Math.max(rooms[0].z1,rooms[1].z1),y1:rooms[0].y1};
    const R={x0:BB.x0-19,x1:BB.x1+19,z0:BB.z0-9,z1:BB.z1+22}, others=rooms.slice(2), M=.6;
    const inB=(x,z)=>x>BB.x0-M&&x<BB.x1+M&&z>BB.z0-M&&z<BB.z1+M, inR=(x,z)=>x>R.x0&&x<R.x1&&z>R.z0&&z<R.z1, inOther=(x,z)=>others.some(o=>x>o.x0&&x<o.x1&&z>o.z0&&z<o.z1);
    const skip=new Set([D.W3.group,...D.NPCS.map(N=>N.g)]); const TX=new Map(), groups=new Map(); let ntri=0;
    const texOf=t=>{ if(!t||!t.image)return -1; if(TX.has(t.uuid))return TX.get(t.uuid).i; const im=t.image, w=im.width, h=im.height, c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d');
      if(im.data){ const id=g.createImageData(w,h); id.data.set(new Uint8Array(im.data.buffer,im.data.byteOffset,w*h*4)); g.putImageData(id,0,0); } else g.drawImage(im,0,0);
      const e={i:TX.size,w,h,flip:!!t.flipY&&!im.data,png:c.toDataURL('image/png')}; TX.set(t.uuid,e); return e.i; };
    const hidden=o=>{ for(let q=o;q;q=q.parent){ if(skip.has(q)||!q.visible)return true; if(q.name==='down')return true; } return false; };
    const P=new T.Vector3(), N=new T.Vector3(), NM=new T.Matrix3();
    D.scene.updateMatrixWorld(true);
    D.scene.traverse(o=>{ if(!o.isMesh||o.isSkinnedMesh||hidden(o))return; const m=o.material; if(!m||Array.isArray(m)||m.isShaderMaterial||m.isRawShaderMaterial)return;
      if(!(m.isMeshLambertMaterial||m.isMeshBasicMaterial||m.isMeshStandardMaterial||m.isMeshPhongMaterial))return;
      const g=o.geometry, pa=g.attributes.position; if(!pa)return; const na=g.attributes.normal, ua=g.attributes.uv, ca=g.attributes.aCol, va=m.vertexColors?g.attributes.color:null, oa=g.attributes.aOp;
      const ti=texOf(m.map), ei=texOf(m.emissiveMap), lit=!m.isMeshBasicMaterial, add=m.blending===T.AdditiveBlending, op=m.transparent&&!add?+m.opacity.toFixed(3):1, cs=!!o.castShadow, key=[ti,ei,lit?1:0,op,cs?1:0,add?1:0].join(','), mc=m.color, ek=m.emissiveMap?(m.emissiveIntensity||1):0;
      let G=groups.get(key); if(!G){ G={tex:ti,em:ei,lit,ek,op,cs,add,pos:[],nrm:[],uv:[],col:[]}; groups.set(key,G); }
      const IM=new T.Matrix4(), MW=new T.Matrix4(), IC=new T.Color(), ni=o.isInstancedMesh?o.count:1;
      for(let ii=0;ii<ni;ii++){ if(o.isInstancedMesh){ o.getMatrixAt(ii,IM); MW.multiplyMatrices(o.matrixWorld,IM); if(o.instanceColor)o.getColorAt(ii,IC); else IC.setRGB(1,1,1); } else { MW.copy(o.matrixWorld); IC.setRGB(1,1,1); }
      NM.getNormalMatrix(MW); const n=g.index?g.index.count:pa.count, I=g.index?g.index.array:null;
      for(let t=0;t<n;t+=3){ const vi=[0,1,2].map(k=>I?I[t+k]:t+k); if(oa&&vi.some(v=>oa.getX(v)<.01))continue;
        const W=vi.map(v=>P.fromBufferAttribute(pa,v).applyMatrix4(MW).toArray()); const cx=(W[0][0]+W[1][0]+W[2][0])/3, cz=(W[0][2]+W[1][2]+W[2][2])/3, ymax=Math.max(W[0][1],W[1][1],W[2][1]), ymin=Math.min(W[0][1],W[1][1],W[2][1]);
        if(ymin<-1.2)continue;
        const bx0=Math.min(W[0][0],W[1][0],W[2][0]), bx1=Math.max(W[0][0],W[1][0],W[2][0]), bz0=Math.min(W[0][2],W[1][2],W[2][2]), bz1=Math.max(W[0][2],W[1][2],W[2][2]);   // (the ground's pieces are big: kept whole if they reach the region)
        const keep=inB(cx,cz)&&ymin<BB.y1+3 || bx1>R.x0&&bx0<R.x1&&bz1>R.z0&&bz0<R.z1&&ymax<.4&&!others.some(o=>bx0>o.x0&&bx1<o.x1&&bz0>o.z0&&bz1<o.z1); if(!keep)continue;
        vi.forEach((v,k)=>{ G.pos.push(...W[k]); if(na)N.fromBufferAttribute(na,v).applyMatrix3(NM).normalize(); else N.set(0,1,0); G.nrm.push(N.x,N.y,N.z);
          if(ua){ const u=ua.getX(v), w=ua.getY(v); G.uv.push(u,w); } else G.uv.push(0,0);
          let r=mc.r*IC.r,gg=mc.g*IC.g,bb=mc.b*IC.b; if(ca){ r*=ca.getX(v); gg*=ca.getY(v); bb*=ca.getZ(v); } if(va){ r*=va.getX(v); gg*=va.getY(v); bb*=va.getZ(v); } G.col.push(r,gg,bb); }); ntri++; } } });
    // the lamps in and round the bodega (all of them as built; LITE lights the eight nearest you)
    // (LITE's own rule: a lamp lights only while its group is shown; one in a room lights only that room (map-post.js); its position used as stored)
    const lamps=[]; for(const L of D.LITE.recs){ const p=L.position, gp=L.userData&&L.userData.grp; if(gp&&!gp.visible)continue; if(!(L.intensity>0)||L.userData.off)continue;
      if(!(p.x>BB.x0-1&&p.x<BB.x1+1&&p.z>BB.z0-1&&p.z<BB.z1+1&&p.y>-1))continue;
      lamps.push({p:p.toArray(),c:[L.color.r,L.color.g,L.color.b],i:L.intensity,d:L.distance,dec:L.decay,fire:!!L.userData.fire,both:!!L.userData.both}); }
    // the solids and the ground's height on a grid
    const sol=D.SOL.up.filter(s=>Array.isArray(s)&&s[2]>R.x0&&s[0]<R.x1&&s[3]>R.z0&&s[1]<R.z1);
    const st=.25, nx=Math.round((R.x1-R.x0)/st)+1, nz=Math.round((R.z1-R.z0)/st)+1, hg=[]; for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)hg.push(+D.ground(R.x0+i*st,R.z0+j*st).toFixed(4));
    const out={BB,R,rooms:rooms.slice(0,2),allRooms:rooms.map(b=>({x0:b.x0,x1:b.x1,z0:b.z0,z1:b.z1,y0:b.y0,y1:b.y1})),ntri,lamps,sol,ground:{x0:R.x0,z0:R.z0,st,nx,nz,h:hg},tex:[...TX.values()],groups:[...groups.values()],
      start:{pos:D.pos(),hd:D.hd()},cv:D.cv(),px:D.px()};
    return out; });
  W.groups=W.groups.filter(G=>G.pos.length); { const used=new Map(); const re=i=>{ if(i<0)return -1; if(!used.has(i))used.set(i,used.size); return used.get(i); }; for(const G of W.groups){ G.tex=re(G.tex); G.em=re(G.em); } W.tex=[...used.keys()].map(i=>({...W.tex[i],i:used.get(i)})); }
  console.log('world: triangles',W.ntri,'groups',W.groups.length,'textures',W.tex.length,'lamps',W.lamps.length,'solids',W.sol.length);
  // textures as PNG bytes (named .pngdata so Godot packs them as they are and reads them at the start)
  W.tex.forEach(t=>{ fs.writeFileSync(path.join(OUT,`tex${t.i}.pngdata`),Buffer.from(t.png.split(',')[1],'base64')); delete t.png; });
  const bins=[]; let off=0; const add=a=>{ const f=new Float32Array(a); bins.push(Buffer.from(f.buffer)); const o=off; off+=f.byteLength; return o; };
  const groups=W.groups.map(G=>{ const flip=G.tex>=0&&W.tex[G.tex].flip; const uv=flip?G.uv.map((v,i)=>i%2?1-v:v):G.uv;
    return {tex:G.tex,em:G.em,lit:G.lit,ek:G.ek,op:G.op,cs:G.cs,add:G.add,n:G.pos.length/3,pos:add(G.pos),nrm:add(G.nrm),uv:add(uv),col:add(G.col)}; });
  fs.writeFileSync(path.join(OUT,'world.bin'),Buffer.concat(bins));
  const ground={...W.ground}; ground.off=0; fs.writeFileSync(path.join(OUT,'ground.bin'),Buffer.from(new Float32Array(W.ground.h).buffer)); delete ground.h;

  // ---- the clock's light, every half hour ----
  const hours=[]; for(let h=0;h<24;h+=.5){ await pg.evaluate(h=>{ __dbg.CLOCK.set?__dbg.CLOCK.set(h):(__dbg.CLOCK.h=h); },h); await pg.waitForTimeout(350);
    hours.push(await pg.evaluate(h=>{ const D=__dbg, o={h}; D.scene.traverse(L=>{ if(L.isDirectionalLight&&L.visible&&!o.sun){ const d=L.position.clone().sub(L.target.position).normalize(); o.sun={d:d.toArray(),c:[L.color.r,L.color.g,L.color.b],i:L.intensity,sh:L.castShadow}; }
        if(L.isHemisphereLight&&L.visible&&!o.hemi)o.hemi={sky:[L.color.r,L.color.g,L.color.b],gnd:[L.groundColor.r,L.groundColor.g,L.groundColor.b],i:L.intensity};
        if(L.isAmbientLight&&L.visible)o.amb=(o.amb||0)+L.intensity; });
      const bg=D.scene.background; o.bg=bg&&bg.isColor?[bg.r,bg.g,bg.b]:null; o.fog=D.scene.fog?{c:[D.scene.fog.color.r,D.scene.fog.color.g,D.scene.fog.color.b],near:D.scene.fog.near,far:D.scene.fog.far}:null;
      o.dark=D.CLOCK.dark()?1:0; o.elev=D.CLOCK.elev(); return o; },h)); }
  await pg.evaluate(()=>{ __dbg.CLOCK.set?__dbg.CLOCK.set(15.5):(__dbg.CLOCK.h=15.5); }); await pg.waitForTimeout(500);
  const sunSh=await pg.evaluate(()=>{ let o=null; __dbg.scene.traverse(L=>{ if(L.isDirectionalLight&&L.castShadow&&!o){ const c=L.shadow.camera; o={l:c.left,r:c.right,t:c.top,b:c.bottom,near:c.near,far:c.far,map:L.shadow.mapSize.x,bias:L.shadow.bias,nb:L.shadow.normalBias,rad:L.shadow.radius}; } }); return o; });

  // ---- the Walker: his mesh and his moves, from the game's own rig ----
  const WK=await pg.evaluate(()=>{ const D=__dbg, W3=D.W3, R=RIG, g=W3.mesh.geometry, NP=W3.pcs.length;
    const worn=[]; for(let i=0;i<NP;i++)if(!W3.HIDE[i])worn.push(i); const remap=new Map(worn.map((p,k)=>[p,k]));
    const I=g.index.array, used=new Map(), pos=[], nrm=[], col=[], pid=[], idx=[]; const pa=g.attributes.position, na=g.attributes.normal, ca=g.attributes.c1, xa=g.attributes.pidx;
    for(let t=0;t<I.length;t++){ const v=I[t]; let k=used.get(v); if(k==null){ k=used.size; used.set(v,k); pos.push(pa.getX(v),pa.getY(v),pa.getZ(v)); nrm.push(na.getX(v),na.getY(v),na.getZ(v)); col.push(ca.getX(v),ca.getY(v),ca.getZ(v)); pid.push(remap.get(Math.round(xa.getX(v)))); } idx.push(k); }
    const ZY=W3.group.scale.y/(W3.SZ*(W3.BH||1)), sc=W3.group.scale.toArray();
    const PM=()=>{ const f=[]; for(const p of worn){ const e=W3.PM.value[p].elements; f.push(e[0],e[1],e[2],e[4],e[5],e[6],e[8],e[9],e[10],e[12],e[13],e[14]); } return f; };
    // the self-shadow light: which way it falls for a heading and a camera yaw (W3.place's own sums)
    const st0=R.create(); st0.snap=true; const B0=R.pose(st0); const Lw=[]; for(const [hd,ya] of [[0,0],[1,1],[0,1],[1,0]]){ W3.place(B0,0,0,0,hd,ya,ZY); Lw.push([hd,ya,...W3.Lw.toArray()]); }
    const run=(target,runT,settle,dur,every)=>{ const st=R.create(); st.snap=true; st.target=target; st.runTarget=runT; if(runT)st.run=1; const dt=1/120, fr=[]; let t=0;
      for(let s=0;s<settle/dt;s++)R.step(st,dt);
      for(let s=0;s<dur/dt;s++){ const d0=st.dist; R.step(st,dt); t+=dt; if(s%every===0){ const B=R.pose(st); W3.place(B,0,0,0,0,0,ZY); fr.push({t,d:st.dist,ph:st.ph,m:PM()}); } } return fr; };
    const idle=run(0,0,1,16,4);   // (30 a second)
    const walk=run(1,0,4,4,1), runf=run(1,1,4,4,1);   // (120 a second: the walk's frames go by the distance)
    const PPU=D.cv().PPU;
    const cyc=fr=>{ let a=-1,b=-1; for(let i=1;i<fr.length;i++)if(fr[i].ph<fr[i-1].ph-.3){ if(a<0)a=i; else { b=i; break; } } const s=fr.slice(a,b), d0=s[0].d, len=(fr[b].d-d0)/PPU, sp=(fr[fr.length-1].d-fr[0].d)/PPU/(fr[fr.length-1].t-fr[0].t);
      // keep a frame only where the pose changed (the walk's frames step by distance)
      const keep=[]; for(const f of s){ const L=keep[keep.length-1]; if(!L||f.m.some((v,i)=>Math.abs(v-L.m[i])>1e-4))keep.push(f); }
      return {len,speed:sp,frames:keep.map(f=>({d:(f.d-d0)/PPU,m:f.m}))}; };
    const ic=idle.map(f=>({t:f.t-idle[0].t,m:f.m}));
    return {np:worn.length,names:worn.map(p=>W3.pcs[p].n),pos,nrm,col,pid,idx,scale:sc,ZY,SZ:W3.SZ,Lw,shade:W3.shade,uSelf:W3.uSelf.value,
      idle:{dur:ic[ic.length-1].t,frames:ic},walk:cyc(walk),run:cyc(runf)}; });
  console.log('walker: pieces',WK.np,'verts',WK.pos.length/3,'tris',WK.idx.length/3,'idle frames',WK.idle.frames.length,'walk',WK.walk.frames.length,WK.walk.len.toFixed(3),WK.walk.speed.toFixed(3),'run',WK.run.frames.length,WK.run.len.toFixed(3),WK.run.speed.toFixed(3));
  console.log('self light',JSON.stringify(WK.Lw));
  { const bw=[]; let o=0; const put=(a,T)=>{ const f=new T(a); bw.push(Buffer.from(f.buffer)); const r=o; o+=f.byteLength; return r; };
    const meta={np:WK.np,names:WK.names,nv:WK.pos.length/3,ni:WK.idx.length,scale:WK.scale,ZY:WK.ZY,SZ:WK.SZ,Lw:WK.Lw,shade:WK.shade,uSelf:WK.uSelf};
    meta.pos=put(WK.pos,Float32Array); meta.nrm=put(WK.nrm,Float32Array); meta.col=put(WK.col,Float32Array); meta.pid=put(WK.pid,Float32Array); meta.idx=put(WK.idx,Int32Array);
    const clip=(c,key)=>({...(key==='t'?{dur:c.dur}:{len:c.len,speed:c.speed}),n:c.frames.length,keys:c.frames.map(f=>+f[key].toFixed(5)),m:put(c.frames.flatMap(f=>f.m),Float32Array)});
    meta.idle=clip(WK.idle,'t'); meta.walk=clip(WK.walk,'d'); meta.run=clip(WK.run,'d');
    fs.writeFileSync(path.join(OUT,'walker.bin'),Buffer.concat(bw)); fs.writeFileSync(path.join(OUT,'walker.json'),JSON.stringify(meta)); }
  const meta={BB:W.BB,R:W.R,rooms:W.rooms,allRooms:W.allRooms,lamps:W.lamps,sol:W.sol,ground,tex:W.tex,groups,start:W.start,cv:W.cv,px:W.px,hours,sunShadow:sunSh};
  fs.writeFileSync(path.join(OUT,'world.json'),JSON.stringify(meta));
  await b.close(); console.log('wrote',OUT); })();
