{ const {BF_KINDS,bfPic}=SHARED.BOD.STOREK.bf, PICS=new Map(), hash=SHARED.BOD.g.hash;
  const tex=(k,pose)=>{ '@later'; const key=k+':'+pose; let t=PICS.get(key); if(t)return t; const Q=bfPic(k,16,pose), c=document.createElement('canvas'); c.width=Q.w; c.height=Q.h; const g=c.getContext('2d'), im=g.createImageData(Q.w,Q.h);
    for(let i=0;i<Q.w*Q.h;i++){ const p=Q.px[i]; if(!p)continue; im.data[i*4]=p[0]; im.data[i*4+1]=p[1]; im.data[i*4+2]=p[2]; im.data[i*4+3]=255; } g.putImageData(im,0,0);
    const T=new THREE.CanvasTexture(c); T.magFilter=T.minFilter=THREE.NearestFilter; T.generateMipmaps=false; T.colorSpace=THREE.SRGBColorSpace; t={T,w:Q.w,h:Q.h,oy:Q.oy}; PICS.set(key,t); return t; };
  BF.add=(k,perches)=>{ '@later'; const span=BF_KINDS[k][3]/1000*2/.84*TILE, s=span/16;
    const mat=pose=>new THREE.MeshLambertMaterial({map:tex(k,pose).T,transparent:true,alphaTest:.5,side:THREE.DoubleSide}), M=[0,1,2].map(mat), g=new THREE.Group();
    const flat=new THREE.Mesh(new THREE.PlaneGeometry(1,1),M[0]); flat.rotation.x=-Math.PI/2; const up=new THREE.Mesh(new THREE.PlaneGeometry(1,1),M[2]); up.rotation.y=Math.PI/2;
    { const t=tex(k,2); up.scale.set(t.w*s,t.h*s,1); up.position.y=t.h*s/2; } g.add(flat,up); flat.visible=false;
    const b={k,name:BF_KINDS[k][0],g,flat,up,M,perches,at:0,to:0,t0:0,dur:0,until:2+Math.random()*6,span:s,t:Math.random()*10,pose:2};
    g.position.set(...perches[0]); scene.add(g); BF.list.push(b); return b; };
  BF.tick=dt=>{ '@later'; const dark=typeof CLOCK!=='undefined'&&CLOCK.dark();
    for(const b of BF.list){ b.t+=dt; const t=b.t; let pose=2, P;
      if(b.dur&&t<b.t0+b.dur){ const u=(t-b.t0)/b.dur, A=b.perches[b.at], Cc=b.perches[b.to], dx=Cc[0]-A[0], dz=Cc[2]-A[2], L=Math.hypot(dx,dz)||1, hump=Math.sin(Math.PI*u)*.35*TILE, zig=Math.sin(u*Math.PI*5)*.06*TILE;
        P=[A[0]+dx*u+zig*dz/L,A[1]+(Cc[1]-A[1])*u+hump+Math.sin(t*9)*.05,A[2]+dz*u-zig*dx/L]; pose=[0,1,2,1][Math.floor(t*12)%4]; b.g.rotation.y=Math.atan2(dx,dz); }
      else{ if(b.dur){ b.at=b.to; b.dur=0; } P=b.perches[b.at];
        if(!dark&&t>b.until){ let n=Math.floor(hash(Math.floor(t*10),b.k,445)*b.perches.length); if(n===b.at)n=(n+1)%b.perches.length; const A=b.perches[b.at], Cc=b.perches[n]; b.to=n; b.t0=t; b.dur=.9+Math.hypot(Cc[0]-A[0],Cc[2]-A[2])/TILE*2.4; b.until=t+b.dur+4+hash(Math.floor(t),b.k,447)*9; }
        else { const c=(t*.55+b.k*.37)%2; pose=dark?2:c<.75?0:c<1?1:c<1.75?2:1; } }
      b.g.position.set(P[0],P[1],P[2]);
      if(pose!==b.pose){ b.pose=pose; b.flat.visible=pose!==2; b.up.visible=pose===2; if(pose!==2){ b.flat.material=b.M[pose]; const tt=tex(b.k,pose); b.flat.scale.set(tt.w*b.span,tt.h*b.span,1); } } } }; }
