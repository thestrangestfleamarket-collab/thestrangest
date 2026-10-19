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
  const basin=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); basin.receiveShadow=true; basin.userData.cull=1; scene.add(basin);
  window.DRAINSDBG=()=>({drains:R.DR.length,tris:P.length/9}); };
