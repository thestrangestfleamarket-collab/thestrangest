// THE STATION'S END AND THE BODEGA'S START: closes grab('down') (the platform under the street) and sets up BOD, the bodega's bag of makers.
  M.exit=()=>{ const S=SM, X=x=>(x-72)*TILE, Z=y=>(y+77)*TILE, n=S.steps, rise=S.depth/n, run=(S.y1-S.y0)/n, c3=new THREE.Color(), TR=[[],[]], WL=[[],[]];
    const q4=(B,a,b,c,d,col)=>{ c3.setRGB(col[0]/255,col[1]/255,col[2]/255,THREE.SRGBColorSpace); for(const v of [a,b,c,a,c,d]){ B[0].push(...v); B[1].push(c3.r,c3.g,c3.b); } };
    const bx=(x0,y0,z0,x1,y1,z1,col)=>{ const [a,b,c,d]=[X(x0),X(x1),Z(y0),Z(y1)], [e,f]=[z0*ZU,z1*ZU], dk=col.map(v=>v*.8), lt=col.map(v=>Math.min(255,v*1.08));
      q4(WL,[a,f,d],[b,f,d],[b,f,c],[a,f,c],lt); q4(WL,[a,e,d],[b,e,d],[b,f,d],[a,f,d],col); q4(WL,[b,e,c],[a,e,c],[a,f,c],[b,f,c],col); q4(WL,[a,e,c],[a,e,d],[a,f,d],[a,f,c],dk); q4(WL,[b,e,d],[b,e,c],[b,f,c],[b,f,d],dk); };
    const CON=[132,128,120], CON2=[118,114,108], TL=[186,190,197], RAIL=[52,84,62];
    for(let k=0;k<n;k++){ const yA=S.y1-(k+1)*run, yB=S.y1-k*run, zt=-(k+1)*rise*ZU, zr=-k*rise*ZU, a=X(S.x0), b=X(S.x1);
      q4(TR,[a,zt,Z(yB)],[b,zt,Z(yB)],[b,zt,Z(yA)],[a,zt,Z(yA)],(k&1)?CON:CON2); q4(TR,[a,zt,Z(yB)],[b,zt,Z(yB)],[b,zr,Z(yB)],[a,zr,Z(yB)],CON2.map(v=>v*.82));
      q4(TR,[a,zt,Z(yB-.03)],[b,zt,Z(yB-.03)],[b,zt+1.2*ZU,Z(yB-.03)],[a,zt+1.2*ZU,Z(yB-.03)],[196,170,64]); }
    for(const x of [S.x0-.2,S.x1]){ for(let k=0;k<n;k++)bx(x,S.y1-(k+1)*run,-(k+1)*rise-2,x+.2,S.y1-k*run,0,TL); bx(x+.05,S.y0,27,x+.15,S.y1,30,RAIL); bx(x+.07,S.y0,14,x+.13,S.y1,16,RAIL); for(let y=S.y0;y<S.y1;y+=(S.y1-S.y0)/5)bx(x+.06,y,0,x+.14,y+.08,27,RAIL); bx(x+.06,S.y1-.08,0,x+.14,S.y1,27,RAIL); }
    bx(S.x0-.15,S.y0-.15,27,S.x1+.15,S.y0-.05,30,RAIL); bx(S.x0-.15,S.y0-.13,14,S.x1+.15,S.y0-.07,16,RAIL); for(let x=S.x0+1;x<S.x1;x+=1)bx(x-.04,S.y0-.14,0,x+.04,S.y0-.06,27,RAIL);
    MODS.stairCut=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6); const SW=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
    const mk=(B,pl)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(B[0],3)); g.setAttribute('color',new THREE.Float32BufferAttribute(B[1],3)); g.computeVertexNormals();
      const me=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,clippingPlanes:pl})); me.receiveShadow=me.castShadow=true; scene.add(me); return me; };
    mk(TR,[MODS.stairCut]); cutWalls.push({pl:SW,nx:0,nz:0,foot:Y(SZ+8),me:mk(WL,[MODS.stairCut,SW]),get always(){ return LVL==='down'&&inStair(pos.x,pos.z)==null; }});
    for(const [y,z,c,i] of [[S.y1-.3,60,[1,.92,.78],5],[S.y0+.6,-40,[.5,.54,.64],6]]){ const L=new THREE.PointLight(new THREE.Color(...c),i,7*TILE,1.6); L.position.set(XC,z*ZU,Z(y)); L.userData.i0=i; scene.add(L); lamps.push(L); }
    const sol=(lv,x0,y0,x1,y1,h)=>{ SOL[lv].push([X(x0),Z(y0),X(x1),Z(y1)]); FIX[lv].push([X(x0),Z(y0),0,X(x1),Z(y1),h]); };
    for(const lv of ['up','down'])for(const x of [S.x0-.2,S.x1])sol(lv,x,S.y0,x+.2,S.y1,30*ZU);
    sol('up',S.x0-.2,S.y0-.2,S.x1+.2,S.y0,30*ZU); };
  { const run=(SM.y1-SM.y0)/SM.steps, tread=(x,z)=>{ const gx=x/TILE+72, gy=z/TILE-77; return gx>=SM.x0&&gx<SM.x1&&gy>=SM.y0&&gy<SM.y1?Math.min(SM.steps,Math.floor((SM.y1-gy)/run)+1):null; };
    const lid=new THREE.Mesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x000000,fog:false}));
    lid.scale.set((SM.x1-SM.x0)*TILE,1,(SM.y1-SM.y0)*TILE); lid.position.set(XC,-6*SM.depth/SM.steps*ZU+.012,(SM.y0+SM.y1)/2*TILE+77*TILE); M.lid=lid;
    const el=document.createElement('div'); el.id='subfade';
    el.style.cssText='position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .32s steps(4);z-index:60;display:flex;align-items:center;justify-content:center;color:#d8d2c4;font:14px/1 monospace;letter-spacing:3px';
    document.body.appendChild(el);
    const qy=QS.get('subyaw'); M.YAW=-Math.PI/4+(qy!=null?+qy:0)*Math.PI/2;
    let busy=false, lidT=0; const wait=ms=>new Promise(r=>setTimeout(r,ms)), frames=k=>new Promise(r=>{ const f=()=>--k<=0?r():requestAnimationFrame(f); requestAnimationFrame(f); });
    const go=async dir=>{ busy=true; el.textContent=dir==='in'?'ENTERING SUBWAY':'LEAVING SUBWAY'; el.style.pointerEvents='auto'; el.style.opacity='1'; await wait(340);
      const p=dir==='in'?M.foot:M.street; UI.goTo(p.x,p.z,dir==='in'?'down':'up'); keys.clear();
      if(UI.view==='iso'||UI.view==='map'){ if(dir==='in'){ yaw=yawTo=M.YAW; } else if(UI.isoTo){ UI.isoTo(); yaw=yawTo; } }
      await frames(3); await wait(260); el.style.opacity='0'; el.style.pointerEvents='none'; await wait(360); busy=false; };
    M.door=(py,p)=>{ lid.visible=LVL==='up'; if(!lidT++){ const top=MAPG.bodega; if(top)top.add(lid); } if(busy||UI.freeCam||(typeof RAG!=='undefined'&&RAG.on))return; const k=tread(p.x,p.z);
      if(LVL!=='down'&&k!=null&&k>=3)go('in'); else if(LVL==='down'&&k!=null&&k<=SM.steps-5)go('out'); };
    M.doorBusy=()=>busy; window.SUBGO=(x,z,lv)=>UI.goTo(x,z,lv); }
  { const G=new THREE.Group(), lam=c=>new THREE.MeshLambertMaterial({color:c}), flat=c=>new THREE.MeshBasicMaterial({color:c}), R=.2, H=46*ZU, S0=Y(SZ)+H+R+.02, SAY='THANK YOU FOR YOUR COOPERATION.';
    const BODY=lam(0xb8bec8), RIM=lam(0x3a3e48), DK=lam(0x2a2d34), LENS=flat(0x4dff86), TALK=flat(0x9be8ff), BEAM=new THREE.MeshBasicMaterial({color:0x5dff8e,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide});
    const ring=new THREE.Mesh(new THREE.RingGeometry(.3,.35,16).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x5dff8e,side:THREE.DoubleSide})), CG=new THREE.ConeGeometry(1,1,12,1,true).translate(0,-.5,0).rotateX(-Math.PI/2);
    ring.visible=false; G.add(ring); scene.add(G);
    const D=[-.2,.2].map((o,i)=>{ const g=new THREE.Group(), body=new THREE.Mesh(new THREE.IcosahedronGeometry(R,1),BODY), band=new THREE.Mesh(new THREE.CylinderGeometry(R*1.02,R*1.02,R*.22,10),RIM), lens=new THREE.Mesh(new THREE.BoxGeometry(R*.5,R*.3,R*.2),LENS);
      lens.position.set(0,-R*.15,R*.92); const rot=new THREE.Group(), mast=new THREE.Mesh(new THREE.BoxGeometry(R*.12,R*.5,R*.12),DK), blade=new THREE.Mesh(new THREE.BoxGeometry(R*2.2,R*.06,R*.16),DK);
      mast.position.y=R*1.1; blade.position.y=R*1.35; rot.add(blade); g.add(body,band,lens,mast,rot); const home=new THREE.Vector3(...V(M.MACH.x,M.MACH.y+o,0)).setY(S0); g.position.copy(home); const cone=new THREE.Mesh(CG,BEAM); cone.visible=false; G.add(g,cone);
      return {i,g,lens,rot,cone,home,st:'perch',t:0,N:{g,st:{x:home.x,z:home.z},lv:'down',H:R*2,key:'security drone '+i}}; });
    const mach=new THREE.Vector3(...V(M.MACH.x,M.MACH.y,0)), tv=new THREE.Vector3(); let seen=false;
    const home=()=>{ for(const d of D){ d.st='perch'; d.t=0; d.g.position.copy(d.home); d.g.rotation.set(0,0,0); d.lens.material=LENS; d.cone.visible=false; } ring.visible=false; };
    M.drones=D; M.tick=(dt,you)=>{ if(!MAPG.down.visible||LVL!=='down'){ if(LVL!=='down'){ seen=false; if(D.some(d=>d.st!=='perch'))home(); } return; }
      if(!seen&&M.inside(you.x,you.z)&&Math.hypot(you.x-mach.x,you.z-mach.z)<4*TILE&&Math.abs(py-M.DY)<.3){ seen=true; for(const d of D){ d.st='wait'; d.t=-d.i*.7; } if(typeof SFX!=='undefined')SFX.play('chirp',{at:{x:mach.x,z:mach.z}}); }
      if(D.every(d=>d.st==='perch'))return;
      const rx=Math.cos(yaw), rz=-Math.sin(yaw); let scan=null;
      for(const d of D){ d.t+=dt; const p=d.g.position, sd=d.i?-.62:.62, out=d.st==='go'||d.st==='scan'||d.st==='say';
        if(d.st==='wait'&&d.t>1){ d.st='go'; d.t=0; }
        if(d.st==='wait')continue;
        if(out)tv.set(you.x+rx*sd,py+1.85+.35,you.z+rz*sd); else tv.copy(d.home);
        const dx=tv.x-p.x, dz=tv.z-p.z, l=Math.hypot(dx,dz), s=Math.min(l,1.8*dt*(d.st==='go'||d.st==='home'?1:2)); if(l>1e-6){ p.x+=dx/l*s; p.z+=dz/l*s; } p.y+=(tv.y-p.y)*Math.min(1,dt*2);
        if(d.st!=='home')p.y+=Math.sin(d.t*3)*.004; d.rot.rotation.y+=dt*40; d.g.rotation.y=Math.atan2(you.x-p.x,you.z-p.z);
        if(d.st==='go'&&l<.12){ d.st='scan'; d.t=0; if(!d.i&&typeof SFX!=='undefined')SFX.play('scan',{at:{x:p.x,z:p.z}}); }
        else if(d.st==='scan'&&d.t>6){ d.st=d.i?'home':'say'; d.t=0; if(!d.i){ d.lens.material=TALK; if(typeof LINES!=='undefined')LINES.say(d.N,SAY); } }
        else if(d.st==='say'&&d.t>3){ d.st='home'; d.t=0; d.lens.material=LENS; }
        else if(d.st==='home'&&l<.05&&Math.abs(tv.y-p.y)<.04){ d.st='perch'; p.copy(d.home); d.g.rotation.set(0,0,0); }
        d.N.st.x=p.x; d.N.st.z=p.z; d.cone.visible=d.st==='scan'; if(d.cone.visible&&(!scan||d.t>scan.t))scan=d; }
      ring.visible=!!scan; if(scan){ const h=(1-Math.abs(((scan.t/3)%1)*2-1))*1.85; ring.position.set(you.x,py+h+.02,you.z);
        for(const d of D)if(d.cone.visible){ const a=d.g.position; d.cone.position.copy(a); d.cone.lookAt(ring.position); d.cone.scale.set(.32,.32,a.distanceTo(ring.position)); } } };
    M.droneScan=()=>{ seen=false; }; }
}
MODS.station={BOUND,ground:(x,z)=>METRO.inside(x,z)?METRO.ground(x,z):STN.DY,DY:METRO.DY,plat:METRO.plat,lane:METRO.lane,path:METRO.path};
 for(const w of cutWalls.slice(c0))if(!w.when)w.when=()=>LVL==='down'; for(const L of SHL)L.removeFromParent(); });
await grab('bodega',async()=>{ const solids=SOL.up, fixed=FIX.up, SHL=[]; let BOUND, groundY; const c0=cutWalls.length;
BOD={meshes:[], walls:{}, lamps:[]};
