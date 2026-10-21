const SGM={tick:()=>{}}; STORE.SGM=SGM;
if(!AWAY.has('bar')){ const R=RIG;
  const D=WOMAN.DESIGNS[2], LOOK={...D.look,metal:'#d6d8de',tie:'#1a181c',cover:'#2c2620',linen:'#ece4cc',ember:'#ff3a28',hole:'#2a282e'};
  const tones=h=>{ const c=new THREE.Color(h); return [1.14,1,.72,.46].map(k=>c.clone().multiplyScalar(k)); };
  for(const m in LOOK){ const n='sg_'+m; if(!R.MATS.includes(n)){ R.MATS.push(n); W3.ramp.push(tones(LOOK[m])); } }
}
SGM.make=()=>{ if(!STORE.bar)return; const R=RIG, V=R.V, S=STORE.bar, AT={x:SHARED.BOD.X(S.singer.x),z:SHARED.BOD.Z(S.singer.y),hd:0,y:SHARED.BOD.Y(S.stage.z)};
  const own=p=>{ const q=Object.assign({},p), pm=p.paint; q.m='sg_'+(p.m||'skin'); if(pm)q.paint=x=>{ const r=pm(x); return r?'sg_'+r:null; }; return q; };
  const B0=R.settle(R.build(castPose('singA'),null),0), MIC0=singMic(B0), MI=n=>R.MATS.indexOf(n), SH=MI('shirt'), PA=MI('pants'), SO=MI('shoes'), SK=MI('skin'), RED=MI('sg_shirt'), SRED=MI('sg_shoes');
  const FEM=['',.95,{torso:[.82,.98,1],neck:[.84,1.04,.84],head:[.95,1,.95],hips:[1.08,1.04,1.04],upperArmL:[.8,1,.8],upperArmR:[.8,1,.8],sleeveL:[.8,1,.8],sleeveR:[.8,1,.8],forearmL:[.8,1,.8],forearmR:[.8,1,.8],handL:[.84,.9,.84],handR:[.84,.9,.84],thighL:[1.02,1,1.02],thighR:[1.02,1,1.02],shinL:[.9,1,.9],shinR:[.9,1,.9],shoeL:[.85,.92,.85],shoeR:[.85,.92,.85]},1], GS=WOMAN.SKIRT.gown, top=22.4, bare=WOMAN.NECK.strapless;
  const skirt={n:'skirt',on:'hips',m:'sg_shirt',bb:[-15,15,-1,24,-12,12],d:q=>{ const y=Math.max(GS.hem,Math.min(top,q.y)), a=GS.a(y), bz=a*.7; return Math.max((Math.hypot(q.x/a,(q.z+.4)/bz)-1)*Math.min(a,bz),GS.hem-q.y,q.y-top); }};
  const PCS=musBody().PCS.filter(p=>!/^sleeve/.test(p.n)).concat([skirt],SINGMIC.map(own));
  for(const p of PCS){ if(p.e!=null||/^fing/.test(p.n)){ const s=FEM[2][p.n]; p.E=s?{s:s.slice(),o:[0,0,0],q:[0,0,0,1]}:null; p.recol=m=>m===SH?RED:m===PA?SK:m===SO?SRED:undefined; }
    if(p.n==='torso'){ delete p.share; p.paint=q=>bare(q)?'skin':null; }
    if(/^mic/.test(p.n)){ p.step=.15; p.cell=.2; p.F0=MIC0; } else if(/^amp/.test(p.n)){ p.step=.3; p.cell=.4; p.F0=SINGF; } }
  for(const P of PCS)if(!MUSGEO.has(P.share)){ const fine=W3.fine(P); W3.warm(P,P.step||(fine?.5:1),fine,null); }
  const FM=figureMesh(PCS,'sgm'), g=new THREE.Group(); g.add(FM.me); MAPG.bodega.add(g); SGM.g=g; SGM.at=AT; SGM.tris=FM.tris; SGM.per=FM.per;
  g.position.set(AT.x,AT.y,AT.z); g.rotation.set(0,AT.hd,0); musScale(g,FEM[1]);
  const cg=new THREE.BufferGeometry(); cg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(CORDN*3),3)); const cord=new THREE.Line(cg,new THREE.LineBasicMaterial({color:0x1a1618})); cord.frustumCulled=false; g.add(cord);
  const a={pose:'singA',from:null,P:null,B:null,bt:1,bT:1.6,t:0,next:2.5,props:{}};
  SGM.dist=()=>Math.hypot(pos.x-AT.x,pos.z-AT.z); SGM.pan=()=>{ const v=new THREE.Vector3(AT.x,1,AT.z).project(SHARED.cam); return Math.max(-.8,Math.min(.8,v.x*.8)); };
  SGM.stop=()=>voxStop();
  SGM.tick=dt=>{ const d=SGM.dist(); if(!SGM.on||!MAPG.bodega.visible||d>18){ voxStop(); return; } musScale(g,FEM[1]);
    a.t+=dt; a.next-=dt; if(a.next<=0){ a.next=1.8+Math.random()*1.6; const ps=['singA','singB','singC'].filter(p=>p!==a.pose); a.from=a.P?JSON.parse(JSON.stringify(a.P)):null; a.pose=ps[Math.random()*ps.length|0]; a.bt=0; a.bT=1.4+Math.random()*.6; }
    a.bt+=dt; const T=castPose(a.pose), u=a.from?Math.min(1,a.bt/a.bT):1, e=u*u*(3-2*u), P=u<1?R.mix(a.from,T,e):JSON.parse(JSON.stringify(T));
    P.bend+=Math.sin(a.t*1.6)*.5*R.D; P.nod+=Math.sin(a.t*.9)*1.5*R.D; P.look+=Math.sin(a.t*.5)*.25; a.P=P;
    const B=R.settle(R.build(P,null),0); B.props={}; a.B=B; singStep(a,dt);
    PCS.forEach((pc,i)=>FM.set(i,pc.on==='prop'?B.props[pc.n]:R.frameOf(pc.on||pc.n,B)));
    const q=cg.attributes.position.array; a.cord.forEach((c,i)=>{ q[i*3]=c.p.x; q[i*3+1]=c.p.y; q[i*3+2]=c.p.z; }); cg.attributes.position.needsUpdate=true;
    if(SND.ctx&&SND.ctx.state==='running')voxStep(dt,performance.now()); }; };

const E=(x,y,z,rx,ry,rz,c,yaw=0,pit=0,rol=0,grp)=>[x,y,z,rx,ry,rz,yaw,pit,rol,c,grp]; const pupPaint=()=>null; const BARP={lead:'d'};

