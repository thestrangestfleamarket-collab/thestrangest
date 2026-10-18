const SUBX={};
{ const T=TILE, XS=BOD.XS, ZS=BOD.ZS, Y=z=>z*ZU, R=RING, DY=-98*ZU, G=MAPG.down;
  const yS=(BOD.CURB+BOD.FAR)/2, yN=(R.nr0+R.nr1)/2, xW=(R.wr0+R.wr1)/2, xE=(AVE.r0+AVE.r1)/2, HW=2.5;
  const BL=[], blk=(x0,y0,z0,x1,y1,z1,c)=>BL.push([x0,y0,z0,x1,y1,z1,c]);
  const sol=(x0,y0,x1,y1)=>{ const a=XS(x0), b=XS(x1), c=ZS(y0), d=ZS(y1); SOL.down.push([Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]); FIX.down.push([Math.min(a,b),Math.min(c,d),DY,Math.max(a,b),Math.max(c,d),Y(-4)]); };
  const WALL=0xc4beae, FLOOR=0x6e6a64, BAL=0x4a4038, SLP=0x3a2c22, RAIL=0x9a9ca0;
  const gaps=R.stairs.map(S=>S.leg==='w'?{side:'wO',a:S.y0-2.2,b:S.y0+.2,x0:S.x0,x1:xW-HW}:{side:'eO',a:S.y0-2.2,b:S.y0+.2,x0:xE+HW,x1:S.x1});
  const wall=(ax,at,a0,a1,cut)=>{ const runs=[[a0,a1]]; for(const g of cut){ for(let i=runs.length-1;i>=0;i--){ const [p,q]=runs[i]; if(g.b<=p||g.a>=q)continue; runs.splice(i,1,...[[p,g.a],[g.b,q]].filter(([u,v])=>v-u>.05)); } }
    for(const [p,q] of runs){ if(ax==='x'){ blk(p,at-.15,0,q,at+.15,96,WALL); sol(p,at-.15,q,at+.15); } else { blk(at-.15,p,0,at+.15,q,96,WALL); sol(at-.15,p,at+.15,q); } } };
  const o={x0:xW-HW,x1:xE+HW,y0:yS-HW,y1:yN+HW}, n={x0:xW+HW,x1:xE-HW,y0:yS+HW,y1:yN-HW};
  wall('x',o.y0,o.x0,o.x1,[]); wall('x',o.y1,o.x0,o.x1,[]); wall('y',o.x0,o.y0,o.y1,gaps.filter(g=>g.side==='wO')); wall('y',o.x1,o.y0,o.y1,gaps.filter(g=>g.side==='eO'));
  wall('x',n.y0,n.x0,n.x1,R.mine?[{a:R.mine.x-1.25,b:R.mine.x+1.25}]:[]); wall('x',n.y1,n.x0,n.x1,[]); wall('y',n.x0,n.y0,n.y1,[]); wall('y',n.x1,n.y0,n.y1,[]);
  for(const [x0,y0,x1,y1] of [[o.x0,o.y0,o.x1,n.y0],[o.x0,n.y1,o.x1,o.y1],[o.x0,n.y0,n.x0,n.y1],[n.x1,n.y0,o.x1,n.y1]])blk(x0,y0,-2,x1,y1,0,FLOOR);
  for(const [S,g] of R.stairs.map((S,i)=>[S,gaps[i]])){ const x0=Math.min(g.x0,g.x1), x1=Math.max(g.x0,g.x1); blk(x0,g.a,-2,x1,g.b,0,FLOOR); wall('x',g.a,x0,x1,[]); wall('x',g.b,x0,Math.min(S.x0,S.x1)<x0?x1:x1,[{a:S.x0-.1,b:S.x1+.1}]); }
  const PATH=[[xW,yS],[xE,yS],[xE,yN],[xW,yN]];
  for(let i=0;i<4;i++){ const [ax,ay]=PATH[i], [bx,by]=PATH[(i+1)%4], horiz=ay===by, len=Math.abs(horiz?bx-ax:by-ay), sgn=Math.sign(horiz?bx-ax:by-ay);
    if(horiz){ blk(Math.min(ax,bx)-.9,ay-.9,0,Math.max(ax,bx)+.9,ay+.9,1.5,BAL); for(const r of [-.45,.45])blk(Math.min(ax,bx)-.45,ay+r-.05,1.5,Math.max(ax,bx)+.45,ay+r+.05,4,RAIL); for(let k=0;k<len;k+=.5){ const x=ax+sgn*k; blk(x-.08,ay-.7,1.5,x+.08,ay+.7,2.5,SLP); } }
    else { blk(ax-.9,Math.min(ay,by)-.9,0,ax+.9,Math.max(ay,by)+.9,1.5,BAL); for(const r of [-.45,.45])blk(ax+r-.05,Math.min(ay,by)-.45,1.5,ax+r+.05,Math.max(ay,by)+.45,4,RAIL); for(let k=0;k<len;k+=.5){ const y=ay+sgn*k; blk(ax-.7,y-.08,1.5,ax+.7,y+.08,2.5,SLP); } } }
  { const me=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial(),BL.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color(), V=THREE.Vector3;
    BL.forEach(([x0,y0,z0,x1,y1,z1,col],i)=>{ const a=XS(x0), b=XS(x1), e=ZS(y0), f=ZS(y1), lo=DY+Y(z0), hi=DY+Y(z1); me.setMatrixAt(i,m4.compose(new V((a+b)/2,(lo+hi)/2,(e+f)/2),q,new V(Math.abs(b-a),hi-lo,Math.abs(f-e)))); me.setColorAt(i,c.setHex(col)); });
    me.receiveShadow=true; G.add(me); SUBX.tunnel=me; SUBX.boxes=BL.length; }
  { const per=2*((xE-xW)+(yN-yS)), at=s=>{ s=((s%per)+per)%per; const L1=xE-xW, L2=yN-yS; if(s<L1)return [xW+s,yS]; s-=L1; if(s<L2)return [xE,yS+s]; s-=L2; if(s<L1)return [xE-s,yN]; s-=L1; return [xW,yN-s]; };
    SUBX.per=per; SUBX.at=at;
    for(let s=0;s<per;s+=18){ const [x,y]=at(s), L=new THREE.PointLight(new THREE.Color(.78,.82,.92),14,13*T,1.6); L.position.set(XS(x),DY+Y(80),ZS(y)); L.userData.i0=L.intensity; G.add(L); lamps.push(L); } }
  { const P=[], Cc=[], c3=new THREE.Color(), X=x=>XS(x), Z=y=>ZS(y);
    const quad=(a,b,c,d,col)=>{ c3.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(const v of [a,b,c,a,c,d]){ P.push(...v); Cc.push(c3.r,c3.g,c3.b); } };
    const box=(x0,y0,z0,x1,y1,z1,col)=>{ const [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[Y(z0),Y(z1)], dk=col.map(v=>v*.8);
      quad([a,f,d],[b,f,d],[b,f,c],[a,f,c],col); quad([a,e,d],[b,e,d],[b,f,d],[a,f,d],col); quad([b,e,c],[a,e,c],[a,f,c],[b,f,c],col); quad([a,e,c],[a,e,d],[a,f,d],[a,f,c],dk); quad([b,e,d],[b,e,c],[b,f,c],[b,f,d],dk); };
    const CON=[132,128,120], CON2=[118,114,108], RL=[52,84,62];
    for(const S of R.stairs){ const n=S.steps, rise=S.depth/n, run=(S.y1-S.y0)/n;
      for(let k=0;k<n;k++){ const yA=S.y1-(k+1)*run, yB=S.y1-k*run, zt=-(k+1)*rise, zr=-k*rise, a=X(S.x0), b=X(S.x1);
        quad([a,Y(zt),Z(yB)],[b,Y(zt),Z(yB)],[b,Y(zt),Z(yA)],[a,Y(zt),Z(yA)],(k&1)?CON:CON2); quad([a,Y(zt),Z(yB)],[b,Y(zt),Z(yB)],[b,Y(zr),Z(yB)],[a,Y(zr),Z(yB)],CON2.map(v=>v*.82)); }
      for(const x of [S.x0-.2,S.x1]){ box(x,S.y0,-S.depth,x+.2,S.y1,0,CON2); box(x,S.y0,0,x+.2,S.y1,30,RL); } box(S.x0-.2,S.y0-.2,0,S.x1+.2,S.y0,30,RL);
      for(const lv of ['up','down'])for(const x of [S.x0-.2,S.x1]){ SOL[lv].push([X(x),Z(S.y0),X(x+.2),Z(S.y1)]); FIX[lv].push([X(x),Z(S.y0),0,X(x+.2),Z(S.y1),Y(30)]); }
      SOL.up.push([X(S.x0-.2),Z(S.y0-.2),X(S.x1+.2),Z(S.y0)]); FIX.up.push([X(S.x0-.2),Z(S.y0-.2),0,X(S.x1+.2),Z(S.y0),Y(30)]);
      const L=new THREE.PointLight(new THREE.Color(1,.92,.78),5,7*T,1.6); L.position.set(X((S.x0+S.x1)/2),Y(60),Z(S.y1-.3)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L); }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,clippingPlanes:[MODS.stairCut]})); m.receiveShadow=m.castShadow=true; scene.add(m); SUBX.stairs=m; }
  { const cars=[], CL=4.2, GAP=.4, mat=new THREE.MeshLambertMaterial({color:0xb8bcc2}), win=new THREE.MeshBasicMaterial({color:0xf2e2b0}), dark=new THREE.MeshLambertMaterial({color:0x2a2c30});
    for(let i=0;i<3;i++){ const g=new THREE.Group(), H=Y(70), W=1.7*T, L=CL*T;
      const body=new THREE.Mesh(new THREE.BoxGeometry(L,H,W),mat); body.position.y=H/2+Y(6); g.add(body);
      for(const sd of [-1,1]){ const w=new THREE.Mesh(new THREE.BoxGeometry(L*.86,H*.26,.02*T),win); w.position.set(0,H*.62+Y(6),sd*(W/2+.01*T)); g.add(w); }
      for(const e of [-1,1]){ const d=new THREE.Mesh(new THREE.BoxGeometry(.04*T,H*.9,W*.9),dark); d.position.set(e*(L/2+.01*T),H*.5+Y(6),0); g.add(d); }
      g.traverse(o=>{ if(o.isMesh)o.castShadow=true; }); G.add(g); cars.push(g); }
    const stops=gaps.map(g=>{ let best=0, bd=1e9; for(let s=0;s<SUBX.per;s+=.5){ const [x,y]=SUBX.at(s), d=Math.hypot(x-(g.side==='wO'?xW:xE),y-(g.a+g.b)/2); if(d<bd){ bd=d; best=s; } } return best; });
    let s=0, wait=0, v=0; SUBX.cars=cars;
    SUBX.tick=dt=>{ if(!G.visible)return; const next=stops.map(t=>((t-s)%SUBX.per+SUBX.per)%SUBX.per).reduce((a,b)=>Math.min(a,b),1e9);
      if(wait>0){ wait-=dt; v=0; } else { const vmax=7, want=next<6?Math.max(.6,vmax*next/6):vmax; v+=(want-v)*Math.min(1,dt*1.5); s+=v*dt; if(next<.15&&v<1){ wait=12; s+=next; } }
      cars.forEach((g,i)=>{ const a=s-i*(CL+GAP)-CL/2, [x0,y0]=SUBX.at(a-CL/2), [x1,y1]=SUBX.at(a+CL/2); g.position.set(XS((x0+x1)/2),DY+Y(2),ZS((y0+y1)/2)); g.rotation.y=Math.atan2(XS(x1)-XS(x0),ZS(y1)-ZS(y0))-Math.PI/2; }); };
    SUBX.tick(0); }
  window.SUBX=SUBX; }
