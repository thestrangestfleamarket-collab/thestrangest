// THE CAR LAMPS: after dark every vehicle that drives (CARLAMPS.src: the traffic, the car you drive) shows its headlights and red tail lights; the nearest cars on the road throw real light ahead of them (a small pool of spotlights, made at the start so no material recompiles), the rest a beam painted on the road.
import {SHARED, THREE} from './003-shx.js';
import {CARLAMPS, CLOCK, pos, ROOMS} from './003b-systems.js';
import {scene} from './004-main.js';
import {OUT, SYS, TILE} from './006-map-pre.js';
{ const M=TILE/.84, N=48, NS=2, HEAD=new THREE.Color(0xfff1d6), TAIL=new THREE.Color(0xff2a18);
  const lens=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({toneMapped:false}),N*4); lens.count=0; lens.frustumCulled=false; scene.add(lens); OUT.add(lens,'world');
  lens.setColorAt(0,HEAD);
  // the beam on the road: a fan of light that fades with distance, painted once
  const bt=(()=>{ const c=document.createElement('canvas'); c.width=64; c.height=128; const g=c.getContext('2d'), d=g.createImageData(64,128);
    for(let y=0;y<128;y++)for(let x=0;x<64;x++){ const v=y/127, half=.18+.32*v, u=Math.abs(x/63-.5), side=Math.max(0,1-Math.max(0,u-half*.7)/(half*.3+1e-3)), a=side*Math.pow(1-v,1.6)*Math.min(1,v*8); const i=(y*64+x)*4; d.data[i]=255; d.data[i+1]=236; d.data[i+2]=200; d.data[i+3]=Math.round(255*Math.max(0,Math.min(1,a))); }
    g.putImageData(d,0,0); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; })();
  const beamM=new THREE.MeshBasicMaterial({map:bt,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,opacity:.5});
  const beam=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2).translate(0,0,.5),beamM,N); beam.count=0; beam.frustumCulled=false; beam.renderOrder=1; scene.add(beam); OUT.add(beam,'world');
  // the real light: two spotlights, given each frame to the nearest cars on the ground
  const SP=[]; for(let i=0;i<NS;i++){ const L=new THREE.SpotLight(0xfff0d8,0,18*M,.6,.95,1.8); L.castShadow=false; scene.add(L); scene.add(L.target); SP.push(L); }
  const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), Y=new THREE.Vector3(0,1,0), P=new THREE.Vector3(), S=new THREE.Vector3(), list=[];
  CARLAMPS.on=false; CARLAMPS.lit=0; window.CARLAMPS=CARLAMPS;
  SYS.add('life',()=>{ const e=CLOCK.dayElev(), k=Math.max(0,Math.min(1,(1.5-e)/5)), up=SHARED.LVL==='up'&&!(ROOMS.cur&&ROOMS.cur.off);
    list.length=0; if(k>0&&up)for(const f of CARLAMPS.src)try{ f(list); }catch(err){}
    CARLAMPS.on=list.length>0; let n=0, nb=0;
    for(const v of list.slice(0,N)){ const [w,h,l,y0]=v.dim, fx=Math.sin(v.r), fz=Math.cos(v.r), sx=fz, sz=-fx, yl=v.y+y0+h*.36; q.setFromAxisAngle(Y,v.r);
      for(const [ff,col,sz0] of [[1,HEAD,.08],[-1,TAIL,.06]])for(const sd of [-1,1]){ const o=l/2+.01*M, a=w*.33;
        P.set(v.x+fx*o*ff+sx*a*sd,yl+(ff<0?.04*M:0),v.z+fz*o*ff+sz*a*sd); S.set(w*.17,h*sz0,.04*M); lens.setMatrixAt(n,m4.compose(P,q,S)); lens.setColorAt(n,col); n++; }
      v.d=(v.x-pos.x)**2+(v.z-pos.z)**2; v.b=-1;
      if(!v.fly){ v.b=nb; P.set(v.x+fx*l/2,SHARED.groundY(v.x+fx*l/2,v.z+fz*l/2)+.03,v.z+fz*l/2); S.set(w*1.1,1,13*M); beam.setMatrixAt(nb,m4.compose(P,q,S)); nb++; } }
    // the nearest on the ground get the real light; their painted beam is put away (it would light the road twice)
    const near=list.filter(v=>v.b>=0).sort((a,b)=>a.d-b.d).slice(0,NS);
    SP.forEach((L,i)=>{ const v=near[i]; if(!v){ L.intensity=0; return; } const [w,h,l,y0]=v.dim, fx=Math.sin(v.r), fz=Math.cos(v.r);
      L.position.set(v.x+fx*(l/2+.1*M),v.y+y0+h*.4,v.z+fz*(l/2+.1*M)); L.target.position.set(v.x+fx*(l/2+8*M),v.y-1.5*M,v.z+fz*(l/2+8*M)); L.target.updateMatrixWorld(); L.intensity=110*k;
      beam.setMatrixAt(v.b,m4.makeScale(0,0,0)); });
    lens.count=n; beam.count=nb; beamM.opacity=.55*k; CARLAMPS.lit=near.length;
    if(n){ lens.instanceMatrix.needsUpdate=true; if(lens.instanceColor)lens.instanceColor.needsUpdate=true; } if(nb)beam.instanceMatrix.needsUpdate=true; },'150pc-carlamps');
  CARLAMPS.dbg=()=>({on:CARLAMPS.on,cars:list.length,lit:CARLAMPS.lit,lens:lens.count,beams:beam.count,spots:SP.map(L=>+L.intensity.toFixed(1))});
}
