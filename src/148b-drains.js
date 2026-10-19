const DRAINS=window.DRAINS={};
DRAINS.init=()=>{ const R=typeof BOD!=='undefined'&&BOD.road; if(!R||!R.DR||!R.DR.length)return;
  const T=TILE, M=T/.84, X=BOD.XS, Z=BOD.ZS, Y0=BOD.YS(BOD.RD)-.003, D=1.15*M, hs=(a,b)=>{ const v=Math.sin(a*12.9898+b*78.233)*43758.5453; return v-Math.floor(v); };
  const P=[], C=[], quad=(a,b,c,d,col)=>{ for(const v of [a,b,c,a,c,d]){ P.push(...v); C.push(col[0]/255,col[1]/255,col[2]/255); } };
  const at=(d,u,w,y)=>d.ax==='x'?[X(d.a+u),y,Z(d.e+d.dir*w)]:[X(d.e+d.dir*w),y,Z(d.a+u)];
  const BAND=[[[74,70,64],0,.18],[[48,46,42],.18,.55],[[30,30,30],.55,.86],[[20,24,22],.86,1]];
  R.DR.forEach((d,i)=>{ const U=.54, W0=-.12, W1=.76, y=t=>Y0-D*t;
    for(const [col,t0,t1] of BAND){ const c=sh0(col,.9+.2*hs(i,t0*9));
      quad(at(d,-U,W0,y(t0)),at(d,U,W0,y(t0)),at(d,U,W0,y(t1)),at(d,-U,W0,y(t1)),c); quad(at(d,-U,W1,y(t0)),at(d,U,W1,y(t0)),at(d,U,W1,y(t1)),at(d,-U,W1,y(t1)),sh0(c,.85));
      quad(at(d,-U,W0,y(t0)),at(d,-U,W1,y(t0)),at(d,-U,W1,y(t1)),at(d,-U,W0,y(t1)),sh0(c,.75)); quad(at(d,U,W0,y(t0)),at(d,U,W1,y(t0)),at(d,U,W1,y(t1)),at(d,U,W0,y(t1)),sh0(c,.95)); }
    const yw=y(.9); quad(at(d,-U,W0,yw),at(d,U,W0,yw),at(d,U,W1,yw),at(d,-U,W1,yw),[22,30,32]);
    for(let k=0;k<3;k++){ const u=(hs(i,k)-.5)*.8, w=.1+hs(k,i)*.5, s=.06+.06*hs(i+k,3), yy=yw+.004; quad(at(d,u-s,w-s,yy),at(d,u+s,w-s,yy),at(d,u+s,w+s,yy),at(d,u-s,w+s,yy),[[96,70,40],[150,120,60],[210,206,196]][k]); } });
  function sh0(c,f){ return [Math.min(255,c[0]*f),Math.min(255,c[1]*f),Math.min(255,c[2]*f)]; }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.computeVertexNormals();
  const basin=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); basin.receiveShadow=true; scene.add(basin);
  const N=96, cv=document.createElement('canvas'); cv.width=cv.height=16; const cx=cv.getContext('2d'), im=cx.createImageData(16,16);
  for(let j=0;j<16;j++)for(let i=0;i<16;i++){ const r=Math.hypot(i-7.5,j-7.5)/8+(hs(i>>1,j>>1)-.5)*.22, a=r<.4?1:r<.68?.6:r<.9?.28:0, q=(j*16+i)*4; im.data[q]=im.data[q+1]=im.data[q+2]=Math.round(255*a); im.data[q+3]=255; }
  cx.putImageData(im,0,0); const tx=new THREE.CanvasTexture(cv); tx.magFilter=tx.minFilter=THREE.NearestFilter; tx.generateMipmaps=false;
  const puff=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}),N);
  puff.frustumCulled=false; puff.count=0; puff.renderOrder=2; scene.add(puff);
  const PS=[], m4=new THREE.Matrix4(), q=new THREE.Quaternion(), V=THREE.Vector3, sv=new V(), pv=new V(), col=new THREE.Color();
  const center=d=>{ const p=at(d,0,.36,Y0); return {x:p[0],z:p[2],d}; }, ALL=R.DR.map(center), bod=BOD.B0?{x:BOD.X((BOD.B0.x0+BOD.B0.x1)/2),z:BOD.Z(BOD.B0.y1)}:null;
  const near=bod&&ALL.reduce((m,c)=>Math.hypot(c.x-bod.x,c.z-bod.z)<Math.hypot(m.x-bod.x,m.z-bod.z)?c:m,ALL[0]); const STEAMY=ALL.filter((c,i)=>c===near||hs(i,41)<.45);
  let act=[], pick=0, tt=0;
  DRAINS.tick=dt=>{ if(!dt)return; tt+=dt; if((pick-=dt)<=0){ pick=.6; act=LVL==='up'?STEAMY.filter(c=>Math.hypot(c.x-pos.x,c.z-pos.z)<20*T).sort((a,b)=>Math.hypot(a.x-pos.x,a.z-pos.z)-Math.hypot(b.x-pos.x,b.z-pos.z)).slice(0,4):[]; }
    const Wn=(window.WX&&WX.now)||{wind:.2,dir:0}, wx=Math.cos(Wn.dir||0)*(Wn.wind||0)*.9*M, wz=Math.sin(Wn.dir||0)*(Wn.wind||0)*.9*M;
    for(const c of act){ c.acc=(c.acc||0)+dt*7; while(c.acc>=1&&PS.length<N){ c.acc--; const u=(Math.random()-.5)*.9, w=.12+Math.random()*.55, p=at(c.d,u,w,Y0+.02*M);
      PS.push({x:p[0],y:p[1],z:p[2],vx:0,vy:.15*M,vz:0,t:0,L:3+Math.random()*2.2,h:1,s:Math.random()*6.3}); } if(c.acc>1)c.acc=1; }
    for(let i=PS.length-1;i>=0;i--){ const p=PS[i]; p.t+=dt; if(p.t>=p.L){ PS.splice(i,1); continue; }
      p.h*=Math.exp(-dt/1.6); const shel=Math.min(1,(p.y-Y0)/(.6*M)), tx_=wx*shel+Math.sin(tt*1.3+p.s)*.12*M, tz_=wz*shel+Math.cos(tt*1.1+p.s*1.7)*.12*M;
      p.vy+=(.42*M*p.h-.9*p.vy*(1-p.h*.5))*dt; p.vx+=(tx_-p.vx)*Math.min(1,dt*1.4); p.vz+=(tz_-p.vz)*Math.min(1,dt*1.4); p.x+=p.vx*dt; p.y+=p.vy*dt; p.z+=p.vz*dt; }
    q.copy(cam.quaternion); const day=Math.max(.45,Math.min(1,(CLOCK.elev()+6)/20));
    PS.forEach((p,i)=>{ const k=p.t/p.L, s=(.3+1.1*k)*M, f=k<.12?.13:k<.5?.09:k<.8?.05:.025; m4.compose(pv.set(p.x,p.y,p.z),q,sv.set(s,s,s)); puff.setMatrixAt(i,m4); puff.setColorAt(i,col.setRGB(f*.55*day,f*.56*day,f*.6*day)); });
    puff.count=PS.length; if(PS.length){ puff.instanceMatrix.needsUpdate=true; puff.instanceColor.needsUpdate=true; } };
  const t0=CLOCK.tick; CLOCK.tick=dt=>{ t0(dt); DRAINS.tick(dt); };
  window.DRAINSDBG=()=>({drains:R.DR.length,steamy:STEAMY.length,active:act.length,puffs:PS.length,tris:P.length/9}); };
