const STALL=(()=>{ const M=TILE/.84, VS=ZU*24/TILE, mv=m=>m*M*VS;
  const MUSH={
    button:{s:.035,h:1.2,f:(p,s)=>{ p('cyl',0xe8e2d4,0,s*.4,0,s*.35,s*.8,s*.35); p('cap',0xf2ede2,0,s*.7,0,s,s*.7,s); }},
    puffball:{s:.045,h:1.6,f:(p,s)=>{ p('ball',0xf4f0e6,0,s*.8,0,s,s*.85,s); }},
    chanterelle:{s:.04,h:1.2,f:(p,s)=>{ p('cone',0xe0a032,0,s*.6,0,s,s*1.2,s,Math.PI); }},
    redcap:{s:.045,h:1.6,f:(p,s,r)=>{ p('cyl',0xeee6d6,0,s*.5,0,s*.3,s,s*.3); p('cap',0xc42a20,0,s*.95,0,s,s*.6,s); for(let k=0;k<3;k++){ const a=r+k*2.1; p('ball',0xf6f0e0,Math.cos(a)*s*.55,s*1.3,Math.sin(a)*s*.55,s*.16,s*.1,s*.16); } }},
    inkcap:{s:.03,h:1.6,f:(p,s)=>{ p('cyl',0xe6e0d0,0,s*.8,0,s*.8,s*3.4,s*.8,Math.PI/2); }},
    bolete:{s:.055,h:1.4,f:(p,s)=>{ p('cyl',0xd8c4a0,0,s*.45,0,s*.45,s*.9,s*.45); p('cap',0x7a4a24,0,s*.85,0,s,s*.55,s); }},
    morel:{s:.03,h:2.2,f:(p,s)=>{ p('cyl',0xe2d4b4,0,s*.35,0,s*.4,s*.7,s*.4); p('cone',0x5e4428,0,s*1.5,0,s*.75,s*1.8,s*.75); }},
    moonglow:{s:.035,h:1.5,f:(p,s)=>{ p('cyl',0x9fe8f0,0,s*.5,0,s*.3,s,s*.3,0,1); p('cap',0x48d8f0,0,s*.9,0,s,s*.6,s,0,1); }}};
  const VEG={
    tomato:{s:.04,h:1.7,f:(p,s)=>{ p('ball',0xcc3420,0,s*.85,0,s,s*.85,s); p('ball',0x3e8a2a,0,s*1.6,0,s*.35,s*.15,s*.35); }},
    pepper:{s:.045,h:2,f:(p,s,r,R)=>{ p('ball',[0x2f8a2a,0xd8b028,0xc8321e][Math.floor(R()*3)],0,s,0,s,s*1.1,s); }},
    carrot:{s:.02,h:2,f:(p,s)=>{ p('cone',0xe0742a,0,s,0,s,s*8,s,Math.PI/2); p('cone',0x4aa03a,0,s,-s*5,s*1.4,s*3,s*1.4,-Math.PI/2); }},
    corn:{s:.03,h:2,f:(p,s)=>{ p('cyl',0xe8c84a,0,s,0,s,s*6,s,Math.PI/2); p('cone',0x9ab04a,0,s,-s*3.8,s*1.3,s*2.5,s*1.3,-Math.PI/2); }},
    cabbage:{s:.075,h:1.7,f:(p,s)=>{ p('ball',0x8ac05a,0,s*.85,0,s,s*.85,s); p('cap',0x6aa040,0,s*.5,0,s*1.08,s*.55,s*1.08,Math.PI); }},
    eggplant:{s:.035,h:2,f:(p,s)=>{ p('ball',0x4a2a5a,0,s,0,s,s,s*2); p('cone',0x3a7a2a,0,s,s*2,s*.6,s*.8,s*.6,Math.PI/2); }},
    potato:{s:.035,h:1.6,f:(p,s)=>{ p('ball',0xb08a5a,0,s*.8,0,s*1.3,s*.8,s); }},
    onion:{s:.035,h:2,f:(p,s,r,R)=>{ p('ball',R()<.3?0x8a3a5a:0xd8b88a,0,s,0,s,s,s); p('cone',0xa8884a,0,s*2.1,0,s*.3,s*.5,s*.3); }},
    greens:{s:.06,h:.8,f:(p,s)=>{ for(let k=0;k<3;k++)p('ball',k?0x4a9a3a:0x3a7a2a,(k-1)*s*.4,s*.4,0,s*.7,s*.35,s*.9); }},
    pumpkin:{s:.12,h:1.4,f:(p,s)=>{ p('ball',0xe0782a,0,s*.7,0,s,s*.7,s); p('cyl',0x5a4a24,0,s*1.4,0,s*.1,s*.3,s*.1); }}};
  const G={ball:new THREE.IcosahedronGeometry(1,0),cap:new THREE.SphereGeometry(1,5,2,0,Math.PI*2,0,Math.PI/2),cone:new THREE.ConeGeometry(1,1,6),cyl:new THREE.CylinderGeometry(1,1,1,5,1,true),box:new THREE.BoxGeometry(1,1,1)};
  const build=o=>{ const {X,Z,x0,x1,y0,y1,veg}=o, KS=veg?VEG:MUSH, ks=Object.values(KS), I={ball:[],cap:[],cone:[],cyl:[],box:[],glow:[]};
    let t=o.seed||7; const R=()=>{ t=(t*16807)%2147483647; return t/2147483647; }, RR=(a,b)=>a+R()*(b-a);
    const e=new THREE.Euler(), q=new THREE.Quaternion(), m4=new THREE.Matrix4(), V3=THREE.Vector3;
    const inst=(g,col,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0)=>{ q.setFromEuler(e.set(rx,ry,rz)); I[g].push([m4.compose(new V3(x,y,z),q,new V3(sx,sy,sz)).clone(),col]); };
    const box=(a,b,c,d,h0,h1,col)=>inst('box',col,(X(a)+X(b))/2,mv((h0+h1)/2),(Z(c)+Z(d))/2,Math.abs(X(b)-X(a)),mv(h1-h0),Math.abs(Z(d)-Z(c)));
    const solid=(a,b,c,d,h)=>{ const r=[Math.min(X(a),X(b)),Math.min(Z(c),Z(d)),Math.max(X(a),X(b)),Math.max(Z(c),Z(d))]; SOL.up.push(r); FIX.up.push([r[0],r[1],0,r[2],r[3],mv(h)]); };
    const item=(K,wx,h,wz,s,ry)=>{ const c=Math.cos(ry), sn=Math.sin(ry);
      K.f((g,col,ox,oy,oz,sx,sy,sz,rx=0,rz=0,glow=0)=>{ const lay=Math.abs(Math.abs(rx)-Math.PI/2)<.01;
        inst(glow?'glow':g,col,wx+(ox*c+oz*sn)*M,mv(h+oy),wz+(-ox*sn+oz*c)*M,sx*M,sy*M*(lay?1:VS),sz*M*(lay?VS:1),rx,ry,rz); },s,ry,R); };
    const heap=(K,cx,cy,h,w,d,n)=>{ let left=n, lay=0; while(left>0&&lay<6){ const k=1-lay*.17, cnt=Math.max(1,Math.round(n*(.34-lay*.05)));
        for(let i=0;i<cnt&&left>0;i++,left--)item(K,X(cx+RR(-.5,.5)*w*k),h+lay*K.s*1.3*K.h*.8,Z(cy+RR(-.5,.5)*d*k),K.s*1.3*RR(.85,1.15),RR(0,6.28)); lay++; } };
    const basket=(K,cx,cy,h,r,n)=>{ inst('cyl',0xa8844a,X(cx),mv(h+.09),Z(cy),r*M,mv(.18),r*M); inst('cyl',0x7a5a2e,X(cx),mv(h+.185),Z(cy),r*1.03*M,mv(.02),r*1.03*M); heap(K,cx,cy,h+.16,r*2.2/.84,r*2.2/.84,n); };
    const crate=(a,b,c,d,h0,h1,col=0x9a7044)=>{ box(a,b,c,d,h0,h1,col); box(a-.005,b+.005,c-.005,d+.005,(h0+h1)/2-.012,(h0+h1)/2+.012,0x6e4e2c); };
    const sack=(cx,cy,col=0xc8b080)=>{ inst('ball',col,X(cx),mv(.24),Z(cy),.2*M,mv(.24),.17*M); inst('cyl',0x9a8458,X(cx),mv(.5),Z(cy),.07*M,mv(.08),.07*M); };
    const H=.8, TD=.8, WOOD=0x9e7a4c, LEG=0x6e5434, RISER=0x8a6238, ki={i:0};
    const table=(a,b,c,d,rise)=>{ box(a,b,c,d,H-.05,H,WOOD); const L=.12; for(const [u,v] of [[a+.06,c+.06],[b-.06-L,c+.06],[a+.06,d-.06-L],[b-.06-L,d-.06-L]])box(u,u+L,v,v+L,0,H-.05,LEG);
      box(a+.1,b-.1,(c+d)/2-.03,(c+d)/2+.03,.25,.3,LEG); solid(a,b,c,d,H+.4);
      const along=rise==='y'?'x':'y', len=along==='x'?b-a:d-c, cols=Math.max(1,Math.round(len/.48));
      for(let st=0;st<3;st++){ const sh=H+st*.12;
        let sa=a,sb=b,sc=c,sd=d; if(rise==='y'){ sc=c+(d-c)*st/3; sd=c+(d-c)*(st+1)/3; } else if(rise==='+x'){ sa=a+(b-a)*st/3; sb=a+(b-a)*(st+1)/3; } else { sb=b-(b-a)*st/3; sa=b-(b-a)*(st+1)/3; }
        if(st)crate(sa+.01,sb-.01,sc+.01,sd-.01,H,sh,RISER);
        for(let k=0;k<cols;k++){ const K=ks[ki.i++%ks.length]; let pa,pb,pc,pd; if(along==='x'){ pa=a+len*k/cols; pb=a+len*(k+1)/cols; pc=sc; pd=sd; } else { pc=c+len*k/cols; pd=c+len*(k+1)/cols; pa=sa; pb=sb; }
          const cx=(pa+pb)/2, cy=(pc+pd)/2, w=(pb-pa)*.9, dd=(pd-pc)*.82;
          if(st===2&&ki.i%3===0)basket(K,cx,cy,sh,.11,6); else heap(K,cx,cy,sh,w,dd,Math.round((K.s<.05?8:4)*(w*dd)/(.43*.24))); } } };
    const yb=y1-TD;
    table(x0,x1,yb,y1,'y'); table(x0,x0+TD,y0,yb-.04,'+x'); table(x1-TD,x1,y0,yb-.04,'-x');
    const [kA,kB,kC,kD]=[ks[2],ks[5],ks[0],ks[3]];
    crate(x0-.62,x0-.1,y1-.5,y1-.05,0,.3); crate(x0-.62,x0-.1,y1-.5,y1-.05,.3,.6); heap(kA,x0-.36,y1-.27,.6,.44,.36,veg?6:10); solid(x0-.62,x0-.1,y1-.5,y1-.05,.6);
    crate(x1+.1,x1+.62,y1-.5,y1-.05,0,.3); heap(kB,x1+.36,y1-.27,.3,.44,.36,veg?6:10); solid(x1+.1,x1+.62,y1-.5,y1-.05,.3);
    basket(kC,x1+.4,y0+.55,0,.16,veg?7:12); basket(kD,x0-.4,y0+.75,0,.15,veg?6:11); solid(x1+.2,x1+.6,y0+.35,y0+.75,.3); solid(x0-.6,x0-.2,y0+.55,y0+.95,.3);
    if(veg){ sack(x1+.38,y0+1.3); sack(x0-.38,y1-1.1,0xb89a6a); solid(x1+.15,x1+.6,y0+1.1,y0+1.5,.5); solid(x0-.6,x0-.15,y1-1.3,y1-.9,.5);
      for(let k=0;k<6;k++)item(KS.pumpkin,X(RR(x0-.75,x0-.2)),0,Z(RR(y0-.45,y0+.15)),KS.pumpkin.s*RR(.8,1.2),RR(0,6)); for(let k=0;k<4;k++)item(KS.pumpkin,X(RR(x1+.2,x1+.7)),0,Z(RR(y0-.45,y0+.1)),KS.pumpkin.s*RR(.8,1.1),RR(0,6));
      solid(x0-.8,x0-.15,y0-.5,y0+.2,.3); solid(x1+.15,x1+.75,y0-.5,y0+.15,.3); }
    else { const lx=X(x0-.45), lz=Z(y0); inst('cyl',0x6a4a2e,lx,mv(.16),lz,.16*M,.8*M,mv(.16),Math.PI/2,Math.PI/2,0); for(let k=0;k<9;k++)item(MUSH.chanterelle,lx+RR(-.3,.3)*M,.3,lz+RR(-.06,.06)*M,.04,0);
      inst('cyl',0x5a3e24,X(x1+.45),mv(.2),Z(y0+.05),.2*M,mv(.4),.2*M); for(let k=0;k<7;k++)item(MUSH.bolete,X(x1+.45)+RR(-.12,.12)*M,.4,Z(y0+.05)+RR(-.12,.12)*M,.05,0);
      solid(x0-.95,x0+.05,y0-.25,y0+.25,.3); solid(x1+.2,x1+.7,y0-.2,y0+.3,.4); }
    const grp=(typeof MAPG!=='undefined'&&MAPG.park)||scene, c=new THREE.Color(); let tris=0;
    const lam=new THREE.MeshLambertMaterial({color:0xffffff}), glow=new THREE.MeshBasicMaterial({color:0xffffff});
    for(const [g,L] of Object.entries(I)){ if(!L.length)continue; const geo=G[g==='glow'?'cap':g], me=new THREE.InstancedMesh(geo,g==='glow'?glow:lam,L.length);
      L.forEach(([m,col],i)=>{ me.setMatrixAt(i,m); me.setColorAt(i,c.setHex(col)); }); me.computeBoundingSphere&&me.computeBoundingSphere(); me.castShadow=g!=='glow'; me.receiveShadow=true; grp.add(me);
      tris+=L.length*(geo.index?geo.index.count:geo.attributes.position.count)/3; }
    const S={x0,x1,y0,y1,veg,hx:X((x0+x1)/2),hz:Z((y0+yb)/2+.15),fz:Z(y0-3),tris:Math.round(tris),items:Object.values(I).reduce((a,L)=>a+L.length,0)}; made.push(S); return S; };
  const made=[]; return {build,made,MUSH,VEG}; })();
window.STALL=STALL;
