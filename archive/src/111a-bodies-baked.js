// BODIES.baked, taken out of src/111a-bodies.js (owner, 10 Nov 2026: "do all"): nothing called it. It read data/hero.json (now archive/data/hero.json, made by tools/hero-bake.py). Put it back before the re-baked body's section if a baked body is wanted again.
  /* ---------- a baked body (hero-bake: pos, tri, col a face, bone and w a corner) as one flat-faced mesh in the palette PAL {colour:[hex, shade jitter]} ---------- */
  const hash=i=>{ const h=Math.sin(i*127.1+311.7)*43758.5453; return h-Math.floor(h); };
  BODIES.baked=(D,key,label,at,PAL,more)=>{ '@later'; const b=D.bodies[key], {off,binv}=BODIES.skeleton(b.origin,b.rest);
    const geo=()=>{ const P=b.pos, T=b.tri, nf=T.length/3, pos=new Float32Array(nf*9), nor=new Float32Array(nf*9), col=new Float32Array(nf*9), bi=new Float32Array(nf*6), bw=new Float32Array(nf*3);
      const C=D.colors.map(c=>new THREE.Color(PAL[c][0])), va=new V3(),vb=new V3(),vc=new V3(),n=new V3(),e=new V3();
      for(let f=0;f<nf;f++){ const ix=[T[f*3],T[f*3+1],T[f*3+2]]; va.fromArray(P,ix[0]*3); vb.fromArray(P,ix[1]*3); vc.fromArray(P,ix[2]*3); n.subVectors(vb,va).cross(e.subVectors(vc,va)).normalize();
        const ci=b.col[f], k=1+(hash(f)-.5)*2*PAL[D.colors[ci]][1];
        ix.forEach((v,j)=>{ const o=f*3+j; pos.set([P[v*3],P[v*3+1],P[v*3+2]],o*3); nor.set([n.x,n.y,n.z],o*3); col.set([C[ci].r*k,C[ci].g*k,C[ci].b*k],o*3); bi.set([b.bone[v*2],b.bone[v*2+1]],o*2); bw[o]=b.w[v]; }); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3));
      g.setAttribute('bi',new THREE.BufferAttribute(bi,2)); g.setAttribute('bw',new THREE.BufferAttribute(bw,1)); g.computeBoundingSphere(); return g; };
    BODIES.add({key,label,geo,height:b.height,hipY:b.hipY,off,binv,at,...more}); };
