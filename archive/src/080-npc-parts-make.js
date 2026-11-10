// PARTSNPC.make, taken out of src/080-npc-parts.js (owner, 10 Nov 2026: "do all"): a character of rigid parts in one mesh; only the archived fox used it. Put it back after PARTSNPC.T's line.
  PARTSNPC.make=(parts,o)=>{ '@later'; let n=0; for(const p of parts)for(const c of p.of)n+=c.P.length/3;
    const P=new Float32Array(n*3), C=new Float32Array(n*3), R=new Float32Array(n), ranges={}; let at=0;
    const F=new Float32Array(n);
    parts.forEach((p,pi)=>{ const start=at; for(const c of p.of){ P.set(c.P,at*3); C.set(c.C,at*3); at+=c.P.length/3; } R.fill(pi,start,at); if(p.fab)F.fill(p.fab,start,at); ranges[p.name]={start,count:at-start}; });
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(P,3)); geo.setAttribute('color',new THREE.BufferAttribute(C,3)); geo.setAttribute('reg',new THREE.BufferAttribute(R,1)); geo.setAttribute('fab',new THREE.BufferAttribute(F,1));
    const N=makeNPC(null,Object.assign({names:parts.map(p=>p.name),rank:parts.map(p=>p.rank||0),geo},o));
    let base=Float32Array.from(geo.attributes.position.array), baseC=Float32Array.from(C);
    N.parts=ranges; N.tris=n/3;
    const flat=parts.some(p=>p.flat);
    if(flat){ const smooth=N.renorm; N.renorm=()=>{ smooth(); flatten(geo,ranges,parts); }; N.renorm(); }
    N.reshape=(name,{scale=[1,1,1],move=[0,0,0],pivot}={})=>{ const r=ranges[name]; if(!r)return; const A=geo.attributes.position.array; let cx=0, cy=0, cz=0;
      if(pivot)[cx,cy,cz]=pivot; else{ for(let i=r.start;i<r.start+r.count;i++){ cx+=base[i*3]; cy+=base[i*3+1]; cz+=base[i*3+2]; } cx/=r.count; cy/=r.count; cz/=r.count; }
      for(let i=r.start;i<r.start+r.count;i++){ A[i*3]=cx+(base[i*3]-cx)*scale[0]+move[0]; A[i*3+1]=cy+(base[i*3+1]-cy)*scale[1]+move[1]; A[i*3+2]=cz+(base[i*3+2]-cz)*scale[2]+move[2]; }
      geo.attributes.position.needsUpdate=true; N.renorm(); };
    N.recolour=(name,col)=>{ const r=ranges[name]; if(!r)return; const A=geo.attributes.color.array; for(let i=r.start;i<r.start+r.count;i++){ A[i*3]=col?col[0]:baseC[i*3]; A[i*3+1]=col?col[1]:baseC[i*3+1]; A[i*3+2]=col?col[2]:baseC[i*3+2]; } geo.attributes.color.needsUpdate=true; };
    if(!flat&&N.pack(ranges)){ base=Float32Array.from(geo.attributes.position.array); baseC=Float32Array.from(geo.attributes.color.array); }   // weld the body's duplicate vertices (flat parts keep their per-face layout for flatten)
    return N; };
