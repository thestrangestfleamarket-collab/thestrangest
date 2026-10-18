const INTERIORS={on:QS.get('interiors')==='1'||(!FREE&&QS.get('interiors')!=='0'),list:[],near:5*TILE,seen:3*TILE,water:[]};
{ const m=.14*TILE, L=INTERIORS.list;
  const box=(X,Z,t,y0,y1)=>{ const a=X(t[0]), b=X(t[2]), c=Z(t[1]), d=Z(t[3]); return {x0:Math.min(a,b),x1:Math.max(a,b),z0:Math.min(c,d),z1:Math.max(c,d),y0,y1}; };
  const inBox=(b,x,y,z,e)=>x>b.x0+e&&x<b.x1-e&&z>b.z0+e&&z<b.z1-e&&y>b.y0+.05&&y<b.y1-.05;
  const mk=(id,boxes,doors,inside)=>{ if(L.some(I=>I.id===id))return; L.push({id,boxes,doors,inside,meshes:new Set(),walls:[],on:true}); };
  const places=()=>{ const B=BOD.B0, mB=(B.x0+B.x1)/2;
    mk('bodega',[box(BOD.X,BOD.Z,[B.x0,B.y0,B.x1,B.y1],-1,BOD.Y(B.h))],[[BOD.X(mB),BOD.Z(B.y1)]]);
    if(POOLR.ROOMS&&POOLR.ROOMS.length)mk('poolbld',POOLR.ROOMS.map(t=>box(POOLR.X,POOLR.Z,t,POOLR.Y(-150),POOLR.Y(POOLR.H))),[[POOLR.X(22.75),POOLR.Z(POOLR.y1)]]);
    if(BOD.GD)mk('dojo',[box(BOD.X,BOD.Z,BOD.GD.r,-1,BOD.Y(BOD.GD.H))],[[BOD.X(BOD.GD.door[0]),BOD.Z(BOD.GD.door[1])]]);
    if(MODS.apts){ const A=MODS.apts.A; mk('house',[box(BOD.X,BOD.Z,[A.x0,A.y0,A.x1,A.y1],-1,MODS.apts.SY*5)],[[BOD.X(A.x1-1.0),BOD.Z(A.y1)]],()=>MODS.apts.in); }
    for(const R of STORE.rooms)if(R.walls)mk('store:'+R.id,[{x0:R.x0,x1:R.x1,z0:R.z0,z1:R.z1,y0:R.y0,y1:R.y1}],[[R.at.x,R.at.z]],()=>R.inside(pos.x,pos.z)); };
  const near2=(I,x,z,y)=>Math.min(...I.doors.map(d=>Math.hypot(x-d[0],z-d[1],y==null?0:(y-Math.max(0,I.boxes[0].y0))*1.5)));
  const owner=(x,y,z)=>{ for(const I of L)for(const b of I.boxes)if(inBox(b,x,y,z,m))return I; return null; };
  const classify=me=>{ const g=me.geometry; if(!g.attributes.aOp||g.index||me.userData.intr===false)return; const p=g.attributes.position.array, nf=Math.floor(p.length/18), al=[], per={}; me.updateMatrixWorld(); const v=new THREE.Vector3();
    for(let f=0;f<nf;f++){ let x=0,y=0,z=0; for(let q=0;q<6;q++){ x+=p[f*18+q*3]; y+=p[f*18+q*3+1]; z+=p[f*18+q*3+2]; } v.set(x/6,y/6,z/6).applyMatrix4(me.matrixWorld);
      const I=owner(v.x,v.y,v.z); if(!I||near2(I,v.x,v.z)<INTERIORS.seen)al.push(f); else (per[I.id]||(per[I.id]=[])).push(f); }
    if(!Object.keys(per).length){ me.userData.intr=false; return; }
    const arr=fs=>{ const a=new Uint32Array(fs.length*6); fs.forEach((f,i)=>{ for(let q=0;q<6;q++)a[i*6+q]=f*6+q; }); return a; };
    me.userData.intr={always:arr(al),per:Object.fromEntries(Object.entries(per).map(([k,fs])=>[k,arr(fs)]))}; for(const k in per)L.find(I=>I.id===k).meshes.add(me); reindex(me); };
  const reindex=me=>{ const T=me.userData.intr, parts=[T.always]; for(const k in T.per)if(L.find(I=>I.id===k).on)parts.push(T.per[k]); let n=0; for(const a of parts)n+=a.length; const idx=new Uint32Array(n); let o=0; for(const a of parts){ idx.set(a,o); o+=a.length; }
    me.geometry.setIndex(new THREE.BufferAttribute(idx,1)); };
  INTERIORS.build=()=>{ if(!INTERIORS.on)return; places(); scene.traverse(o=>{ if(o.isMesh)classify(o); });
    const H=L.find(I=>I.id==='house'); if(H&&MODS.apts&&!H.walls.length){ const b=H.boxes[0], bb=new THREE.Box3(), c=new THREE.Vector3(); for(const me of MODS.apts.meshes){ if(me.geometry.attributes.aOp)continue; bb.setFromObject(me); bb.getCenter(c); if(inBox(b,c.x,c.y,c.z,m))H.walls.push(me); } }
    const W=INTERIORS.water; W.length=0; const P=L.find(I=>I.id==='poolbld'); if(P&&typeof WATER!=='undefined'&&WATER.mesh)W.push([P,WATER.mesh]); for(const w of (typeof WATER!=='undefined'&&WATER.extra)||[])if(w.mesh){ const I=owner(w.mesh.position.x,w.mesh.position.y+.1,w.mesh.position.z); if(I)W.push([I,w.mesh]); }
    INTERIORS.tick(true); };
  INTERIORS.tick=force=>{ if(!INTERIORS.on)return; const all=(typeof MAPED!=='undefined'&&MAPED.on);
    for(const I of L){ const d=near2(I,pos.x,pos.z,py), inn=I.inside?I.inside():I.boxes.some(b=>inBox(b,pos.x,py+.5,pos.z,0)), want=all||inn||d<(I.on?INTERIORS.near+TILE:INTERIORS.near);
      if(want!==I.on||force){ I.on=want; for(const me of I.meshes)reindex(me); for(const me of I.walls)me.visible=want; } } };
  INTERIORS.cull=on=>{ for(const [I,me] of INTERIORS.water){ if(on){ if(!I.on&&me.visible){ me.visible=false; me._ic=true; } } else if(me._ic){ me.visible=true; me._ic=false; } } };
  INTERIORS.state=()=>L.map(I=>[I.id,I.on,I.meshes.size,I.walls.length,Math.round(near2(I,pos.x,pos.z,py)/TILE*10)/10]);
}
