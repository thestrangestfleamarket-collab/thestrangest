
{
  const FX={items:[],N:220}; { const geo=new THREE.BoxGeometry(1,1,1), lit=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}),FX.N), glow=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}),FX.N);
    for(const m of [lit,glow]){ m.count=0; m.frustumCulled=false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.castShadow=false; MAPG.bodega.add(m); } FX.lit=lit; FX.glow=glow;
    const M=new THREE.Matrix4(), Q=new THREE.Quaternion(), V=new THREE.Vector3(), C=new THREE.Color();
    FX.add=o=>{ if(FX.items.length>=FX.N*2)FX.items.shift(); FX.items.push(Object.assign({t:0,spin:Math.random()*6},o)); };
    FX.step=dt=>{ let nl=0, ng=0; for(const o of FX.items){ o.t+=dt; if(o.t>=o.life)continue; const u=o.t/o.life; o.x+=o.vx*dt; o.y+=o.vy*dt; o.z+=o.vz*dt; if(o.gravity){ o.vy-=o.gravity*dt; if(o.y<o.floor){ o.y=o.floor; o.vx*=.6; o.vz*=.6; o.vy=0; } }
        if(o.drag){ const k=Math.max(0,1-o.drag*dt); o.vx*=k; o.vz*=k; } const s=o.size(u); if(s<=.002)continue; const m=o.glow?FX.glow:FX.lit, i=o.glow?ng++:nl++; if(i>=FX.N)continue;
        Q.setFromAxisAngle(V.set(0,1,0),o.spin+o.t*o.turn); M.compose(V.set(o.x,o.y,o.z),Q,V.set(s,s,s)); m.setMatrixAt(i,M); m.setColorAt(i,C.setRGB(...o.col(u))); }
      FX.items=FX.items.filter(o=>o.t<o.life); for(const [m,c] of [[FX.lit,nl],[FX.glow,ng]]){ m.count=c; m.instanceMatrix.needsUpdate=true; if(m.instanceColor)m.instanceColor.needsUpdate=true; } };
    FX.puff=(x,y,z,k,wind)=>{ '@later'; const a=Math.random()*6.28, r=.05+.08*Math.random(); FX.add({x:x+(Math.random()-.5)*.03,y,z:z+(Math.random()-.5)*.03,vx:Math.cos(a)*r+(wind?wind.x:0),vy:.18+.14*Math.random(),vz:Math.sin(a)*r+(wind?wind.z:0),drag:.6,turn:.8,life:1.8+Math.random()*1.4*k,
      size:u=>(.035+.06*k*Math.min(1,u*2.5))*(u>.7?(1-u)/.3:1)*TILE/.84,col:u=>{ const g=.62+.3*u; return [g,g,g*1.03]; }}); };
    FX.dust=(x,y,z,R)=>{ '@later'; for(let i=0;i<9;i++){ const a=i/9*6.28+Math.random()*.5, v=(1.2+Math.random()*.8)*TILE; FX.add({x:x+Math.cos(a)*R*.5,y:y+.02,z:z+Math.sin(a)*R*.5,vx:Math.cos(a)*v,vy:.5*TILE,vz:Math.sin(a)*v,gravity:9,floor:y+.02,drag:3,turn:3,life:.5+Math.random()*.25,
        size:u=>.045*(1-u)*TILE/.84,col:()=>[.55,.5,.42]}); } };
    FX.trail=(a,c,col)=>{ '@later'; const d=a.distanceTo(c), n=Math.max(1,Math.ceil(d/(.04*TILE))); for(let i=0;i<n;i++){ const u=(i+.5)/n; FX.add({x:a.x+(c.x-a.x)*u,y:a.y+(c.y-a.y)*u,z:a.z+(c.z-a.z)*u,vx:0,vy:0,vz:0,turn:0,life:.32,glow:true,size:u=>.05*(1-u)*TILE/.84,col:u=>[col[0]*(1-u*.5)+u*.5,col[1]*(1-u*.5)+u*.5,col[2]]}); } }; }
  FIGFX.tick=(dt,you)=>{ FX.step(dt); if(typeof PARK!=='undefined'){ PARK.tick(you);
 } };
  FIGFX.FX=FX; }
