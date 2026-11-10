// THE USE: USE lets the player sit on, switch, open and pick up the things around them.
import {SHARED, THREE} from './003-shx.js';
import {LEVELS, LITE, MOTION, PARK, PERFX, pos, RAG, SFX, st, UI, USE, VIT, W3} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {TILE, ZU} from './006-map-pre.js';
import {OBJS} from './008-batch.js';
import {KIT} from './068-kit.js';
Object.assign(USE,{seat:null}); window.USE=USE;
{ const T=TILE, V3=THREE.Vector3, v=new V3(), KINDS=[[/bench|chair|stool|sofa|armchair|couch|recliner|sitting log/i,'sit'],[/lamp|lantern|wall light|fluorescent tube|andon/i,'lamp'],[/drinks fridge/i,'fridge'],[/drinks machine/i,'vend'],[/^radio$/i,'radio']];
  const kindOf=o=>{ if(o.useK!==undefined)return o.useK; const k=KINDS.find(([r])=>r.test(o.name||'')); return o.useK=k?k[1]:null; };
  const tris=(o,near)=>{ '@later'; const out=[];
    if(o.parts){ for(const p of o.parts){ const a=p.me.geometry.attributes.position.array; for(const t0 of [p.v0,p.v0+3])out.push(a.slice(t0*3,t0*3+9)); } return out; }
    o.updateWorldMatrix(true,true); o.traverse(m=>{ if(!m.isMesh)return; const P=m.geometry.attributes.position, I=m.geometry.index, n=I?I.count:P.count;
      for(let i=0;i+2<n;i+=3){ const t=new Float32Array(9); for(let k=0;k<3;k++){ v.fromBufferAttribute(P,I?I.getX(i+k):i+k).applyMatrix4(m.matrixWorld); t[k*3]=v.x; t[k*3+1]=v.y; t[k*3+2]=v.z; }
        if(!near||Math.hypot((t[0]+t[3]+t[6])/3-near[0],(t[2]+t[5]+t[8])/3-near[1])<near[2])out.push(t); } }); return out; };
  const look=TR=>{ '@later'; const b=new THREE.Box3(), F=[]; for(const t of TR){ for(let k=0;k<9;k+=3)b.expandByPoint(v.set(t[k],t[k+1],t[k+2]));
      const ux=t[3]-t[0], uy=t[4]-t[1], uz=t[5]-t[2], wx=t[6]-t[0], wy=t[7]-t[1], wz=t[8]-t[2], nx=uy*wz-uz*wy, ny=uz*wx-ux*wz, nz=ux*wy-uy*wx, l=Math.hypot(nx,ny,nz); if(!(l>1e-9))continue;
      F.push({A:l/2,nx:nx/l,ny:ny/l,nz:nz/l,cx:(t[0]+t[3]+t[6])/3,cy:(t[1]+t[4]+t[7])/3,cz:(t[2]+t[5]+t[8])/3,t}); } return {b,F}; };
  const seatOf=TR=>{ '@later'; const {b,F}=look(TR), y0=b.min.y, q=.04*T, bins={}; for(const f of F)if(Math.abs(f.ny)>.8){ const h=f.cy-y0; if(h>.15*T&&h<1.6*T){ const k=Math.round(f.cy/q); bins[k]=(bins[k]||0)+f.A; } }
    let bk=null, ba=0; for(const k in bins)if(bins[k]>ba){ ba=bins[k]; bk=+k; } if(bk==null)return null;
    const S=new THREE.Box3(); let sy=0, sw=0; for(const f of F)if(Math.abs(f.ny)>.8&&Math.round(f.cy/q)===bk){ for(let k=0;k<9;k+=3)S.expandByPoint(v.set(f.t[k],f.t[k+1],f.t[k+2])); sy+=f.cy*f.A; sw+=f.A; }
    const cx=(S.min.x+S.max.x)/2, cz=(S.min.z+S.max.z)/2; let bx=0, bz=0, bw=0; for(const f of F)if(f.cy>sy/sw+.3*T){ bx+=f.cx*f.A; bz+=f.cz*f.A; bw+=f.A; }
    let fx=0, fz=0; if(bw){ fx=cx-bx/bw; fz=cz-bz/bw; const l=Math.hypot(fx,fz); if(l>.05*T){ fx/=l; fz/=l; } else fx=fz=0; }
    if(fx&&Math.abs(fx)<.35){ fx=0; fz=Math.sign(fz); } else if(fz&&Math.abs(fz)<.35){ fz=0; fx=Math.sign(fx); }
    return {y:sy/sw,S,fx,fz,b,mid:bw&&!fx&&!fz?[bx/bw,bz/bw]:null}; };
  const near=(S,m)=>{ const x0=Math.min(S.min.x+m,(S.min.x+S.max.x)/2), x1=Math.max(S.max.x-m,(S.min.x+S.max.x)/2), z0=Math.min(S.min.z+m,(S.min.z+S.max.z)/2), z1=Math.max(S.max.z-m,(S.min.z+S.max.z)/2);
    return [Math.max(x0,Math.min(x1,pos.x)),Math.max(z0,Math.min(z1,pos.z))]; };
  VIT.mends.push(()=>USE.seat&&st.sit?1/150:0);   // resting on a seat or a bed mends you slowly
  const stand=back=>{ const s=USE.seat; if(!s)return; USE.seat=null; st.sit=null; if(back){ pos.x=s.back.x; pos.z=s.back.z; } };
  USE.stand=()=>stand(true);
  USE.sitAt=(x,z,y,hd,more)=>{ '@later'; SFX.play('creak',{vol:.5,vary:.3,delay:.4}); const g=SHARED.groundY(x,z);   // sit at a point: a chair's top, a train's seat (more: what carries the seat)
    USE.seat={back:pos.clone(),x,z,...more}; pos.x=x; pos.z=z; SHARED.target=null; SHARED.heading=hd; st.sit={z:Math.max(2,(y-g)/(ZU*W3.SZ*(W3.BH||1)))}; st.target=0; st.w=0; MOTION.play('sitDown'); st.mv=st.mvw=0; };   // (no stride carried onto the seat: it slid you off a bench, owner 9 Nov 2026)
  const sitOn=(se,th)=>{ let [x,z]=near(se.S,.4*T), fx=se.fx, fz=se.fz;
    if(se.mid){ const S=se.S, wx=S.max.x-S.min.x, wz=S.max.z-S.min.z;   // a back down the middle: sit on your side of it, facing out
      if(wx<wz){ fx=pos.x<se.mid[0]?-1:1; x=se.mid[0]+fx*wx/4; } else { fz=pos.z<se.mid[1]?-1:1; z=se.mid[1]+fz*wz/4; } }
    else if(!fx&&!fz){ fx=pos.x-x; fz=pos.z-z; const l=Math.hypot(fx,fz)||1; fx/=l; fz/=l; }
    USE.sitAt(x-fx*.06*T,z-fz*.06*T,se.y,Math.atan2(fx,fz)); };
  const lightsOf=b=>{ const e=.8*T; return LITE.recs.filter(L=>{ const p=L.position; return p.x>b.min.x-e&&p.x<b.max.x+e&&p.y>b.min.y-e&&p.y<b.max.y+e&&p.z>b.min.z-e&&p.z<b.max.z+e; }); };
  const tint=(o,c,which)=>{ for(const p of o.parts){ if(!which(p))continue; const g=p.me.geometry, C=g.attributes.aCol; for(let i=0;i<18;i++)C.array[p.v0*3+i]=c[i%3]; C.needsUpdate=true; } };
  const glows=p=>p.e||p.me.material.isMeshBasicMaterial;
  const lamp=(o,th)=>{ o.useOff=!o.useOff; for(const L of lightsOf(box(o)))L.userData.off=o.useOff; LITE.t=0; tint(o,o.useOff?[.2,.2,.22]:[1,1,1],glows); th.name=o.useOff?'OFF':'ON'; SFX.play('click',{at:box(o).getCenter(new V3()),vol:.9,vary:.2}); };
  const box=o=>o.ub||(o.ub=look(tris(o)).b);
  const front=o=>{ const b=box(o), c=b.getCenter(new V3()), L=lightsOf(b).sort((p,q)=>p.position.distanceTo(c)-q.position.distanceTo(c))[0]; let dx=L?L.position.x-c.x:pos.x-c.x, dz=L?L.position.z-c.z:pos.z-c.z;
    return Math.abs(dx)>Math.abs(dz)?[Math.sign(dx),0]:[0,Math.sign(dz)]; };
  const glassM=new THREE.MeshLambertMaterial({color:new THREE.Color('rgb(150,190,210)'),transparent:true,opacity:.24,side:THREE.DoubleSide,depthWrite:false}), frameM=new THREE.MeshLambertMaterial({color:new THREE.Color('rgb(226,228,226)')});
  const boxes=L=>{ '@later'; const P=[], N=[]; for(const [w,h,d,x,y,z] of L){ const g=new THREE.BoxGeometry(w,h,d).toNonIndexed(); g.translate(x,y,z); P.push(...g.attributes.position.array); N.push(...g.attributes.normal.array); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); return g; };
  const doorOf=o=>{ '@later'; if(o.door!==undefined)return o.door; const b=box(o), [nx,nz]=front(o), c=b.getCenter(new V3()), H=b.max.y-b.min.y, y0=b.min.y+H*7/64, y1=b.max.y-H*6/64;
    const at=nx>0?b.max.x:nx<0?b.min.x:nz>0?b.max.z:b.min.z, ax=nx?'z':'x', a0=b.min[ax], a1=b.max[ax], sl=.07*T, e=.01*T;
    const P=[]; for(const p of o.parts){ const A=p.me.geometry.attributes.position.array; let ok=true; for(let i=0;i<6&&ok;i++){ const j=(p.v0+i)*3, x=A[j], y=A[j+1], z=A[j+2], d=nx?(x-at)*nx:(z-at)*nz;
        ok=d<=e&&d>=-sl&&y>=y0-e&&y<=y1+e; } if(ok)P.push(p); }
    const cv=new THREE.Box3(); for(const p of P){ const A=p.me.geometry.attributes.position.array; for(let i=0;i<6;i++)cv.expandByPoint(v.fromArray(A,(p.v0+i)*3)); }
    if(!P.length||cv.max[ax]-cv.min[ax]<.8*(a1-a0)||cv.max.y-cv.min.y<.75*(y1-y0))P.length=0;
    const hinge=nx?new V3(at,y0,a0):new V3(a0,y0,at), dir=nx?new V3(0,0,1):new V3(1,0,0), out=new V3(nx,0,nz);
    let leaf=null; if(!P.length){
      const w=a1-a0-.1*T, h=y1-y0, f=.05*T, t=.03*T; leaf=new THREE.Group();
      const gl=new THREE.Mesh(new THREE.PlaneGeometry(w-2*f,h-2*f),glassM); gl.position.set(w/2,h/2,0); const fr=new THREE.Mesh(boxes([[w,f,t,w/2,f/2,0],[w,f,t,w/2,h-f/2,0],[f,h,t,f/2,h/2,0],[f,h,t,w-f/2,h/2,0],[f*.6,h*.3,t*2.2,w-f*1.6,h*.55,0]]),frameM);
      leaf.add(gl,fr); leaf.position.copy(hinge).addScaledVector(dir,.05*T).addScaledVector(out,-.02*T); leaf.rotation.y=Math.atan2(-dir.z,dir.x); scene.add(leaf); }
    const s=Math.cos(Math.atan2(-dir.z,dir.x)+1.75)*out.x-Math.sin(Math.atan2(-dir.z,dir.x)+1.75)*out.z>0?1:-1;
    return o.door={P,base:P.map(p=>p.me.geometry.attributes.position.array.slice(p.v0*3,p.v0*3+18)),hinge,leaf,a:0,to:0,s,r0:leaf?leaf.rotation.y:0}; };
  const DOORS=new Set();
  const turnDoor=d=>{ '@later'; const ca=Math.cos(d.a*d.s), sa=Math.sin(d.a*d.s), h=d.hinge, tg=new Set();
    if(d.leaf)d.leaf.rotation.y=d.r0+d.a*d.s;
    d.P.forEach((p,k)=>{ const g=p.me.geometry, A=g.attributes.position.array, N=g.attributes.normal.array, B=d.base[k];
      for(let i=0;i<6;i++){ const x=B[i*3]-h.x, z=B[i*3+2]-h.z, j=(p.v0+i)*3; A[j]=h.x+x*ca+z*sa; A[j+1]=B[i*3+1]; A[j+2]=h.z-x*sa+z*ca; }
      for(const t0 of [p.v0,p.v0+3]){ const j=t0*3, ux=A[j+3]-A[j], uy=A[j+4]-A[j+1], uz=A[j+5]-A[j+2], wx=A[j+6]-A[j], wy=A[j+7]-A[j+1], wz=A[j+8]-A[j+2];
        let nx=uy*wz-uz*wy, ny=uz*wx-ux*wz, nz=ux*wy-uy*wx; const l=Math.hypot(nx,ny,nz)||1; for(let q=0;q<3;q++){ N[j+q*3]=nx/l; N[j+q*3+1]=ny/l; N[j+q*3+2]=nz/l; } }
      tg.add(g); }); for(const g of tg){ g.attributes.position.needsUpdate=g.attributes.normal.needsUpdate=true; } };
  const fridge=(o,th)=>{ const d=doorOf(o); d.to=d.to?0:1.75; DOORS.add(d); th.name=d.to?'OPEN':'SHUT'; const at=box(o).getCenter(new V3()); if(d.to)SFX.play('latch',{at,vol:.8}); else SFX.play('door',{at,vol:.35,pitch:1.6,delay:.25}); };
  const ac=()=>SFX.ctx();
  const BLINK=new Set(), canM=new THREE.MeshLambertMaterial({color:new THREE.Color('rgb(196,44,40)')}), canG=new THREE.BoxGeometry(.07*T,.13*T,.07*T), CANS=[];
  const vend=(o,th)=>{ '@later'; const b=box(o), c=b.getCenter(new V3()); let dx=pos.x-c.x, dz=pos.z-c.z; if(Math.abs(dx)>Math.abs(dz)){ dx=Math.sign(dx); dz=0; } else { dz=Math.sign(dz); dx=0; }
    const m=new THREE.Mesh(canG,canM); m.position.set(dx?(dx>0?b.max.x:b.min.x)+dx*.12*T:c.x+(Math.random()-.5)*.2*T,b.min.y+.45*T,dz?(dz>0?b.max.z:b.min.z)+dz*.12*T:c.z+(Math.random()-.5)*.2*T); m.castShadow=true;
    m.userData.vy=0; m.userData.floor=b.min.y+.065*T; scene.add(m); CANS.push(m); if(CANS.length>4)scene.remove(CANS.shift()); SFX.play('clunk',{at:c,vol:.9,delay:.35});
    o.blink=.5; BLINK.add(o); th.name='A CAN'; };
  const TUNE=[[0,.25],[4,.25],[7,.25],[9,.5],[7,.25],[4,.25],[2,.5],[0,.25],[2,.25],[4,.5],[-3,.25],[0,.75],[null,.5]];
  const radio=(o,th)=>{ o.on=!o.on; USE.radio=o.on?{o,n:0,t:0}:null; if(USE.rg){ USE.rg.gain.cancelScheduledValues(0); USE.rg.disconnect(); USE.rg=null; } th.name=o.on?'RADIO ON':'RADIO OFF'; };
  const radioTick=()=>{ '@later'; const R=USE.radio, c=R&&ac(); if(!c||c.state!=='running')return; if(!USE.rg){ USE.rg=c.createGain(); USE.rg.connect(SFX.out(c)); R.t=c.currentTime+.05; }
    const p=box(R.o).getCenter(v), d=Math.hypot(p.x-pos.x,p.z-pos.z); USE.rg.gain.setTargetAtTime(.07*Math.max(0,1-d/(9*T)),c.currentTime,.1);
    while(R.t<c.currentTime+.3){ const [s,len]=TUNE[R.n%TUNE.length], dur=len*.42; R.n++; if(s!=null)for(const [k,typ,amp] of [[0,'square',.5],[-12,'triangle',.8]]){ const os=c.createOscillator(), G=c.createGain(); os.type=typ; os.frequency.value=392*Math.pow(2,(s+k)/12);
        G.gain.setValueAtTime(amp,R.t); G.gain.setTargetAtTime(0,R.t+dur*.6,.04); os.connect(G).connect(USE.rg); os.start(R.t); os.stop(R.t+dur+.2); } R.t+=dur; } };
  const ray0=new THREE.Raycaster(); let MS=[], nO=-1;
  const shown=m=>{ let q=m; while(q){ if(!q.visible)return false; q=q.parent; } return LEVELS.drawn(m); };
  const cut=h=>{ const P=[...(renderer.clippingPlanes||[]),...(h.object.material.clippingPlanes||[])]; return P.some(pl=>pl.distanceToPoint(h.point)<0); };
  const goal=(o,k)=>{ '@later'; const b=box(o), c=b.getCenter(new V3()), hx=(b.max.x-b.min.x)/2, hz=(b.max.z-b.min.z)/2, th={name:(o.name||'').toUpperCase(),obj:new THREE.Object3D(),tall:b.max.y-b.min.y+.3*T};
    let at=[c.x,c.z], reach=Math.max(hx,hz)+.9*T;
    if(k==='sit'){ const se=o.seat||(o.seat=seatOf(tris(o))); if(!se)return null; at=near(se.S,.4*T); reach=Math.min(hx,hz)+.55*T; th.act=()=>sitOn(se,th); }
    else if(k==='fridge'){ const [nx,nz]=front(o); at=[c.x+nx*(hx+.55*T),c.z+nz*(hz+.55*T)]; reach=.6*T; th.act=()=>fridge(o,th); }
    else if(k==='lamp')th.act=()=>lamp(o,th); else if(k==='vend'){ reach=Math.max(hx,hz)+.6*T; th.pick=.9*T; th.act=()=>vend(o,th); } else { reach=1.4*T; th.act=()=>radio(o,th); }
    th.reach=reach; th.near=reach+(k==='lamp'?2.5:k==='fridge'?2.2:1.2)*T; th.obj.position.set(at[0],b.min.y,at[1]); return th; };
  USE.pick=ray=>{ if(OBJS.length+(typeof PERFX!=='undefined'?PERFX.gen*1e6:0)!==nO){ nO=OBJS.length+(typeof PERFX!=='undefined'?PERFX.gen*1e6:0); MS=[...new Set(OBJS.flatMap(o=>o.parts.map(p=>p.me)))]; }
    for(const h of ray.intersectObjects(MS.filter(shown),false)){ if(cut(h))continue; const o=h.object.userData.objOf[Math.floor(h.faceIndex/2)], k=o&&kindOf(o); if(!k)return null; const th=goal(o,k); return th?{th,d:h.distance}:null; } return null; };
  for(const th of (typeof KIT!=='undefined'?KIT.things:[]))if(th.name==='BENCH'){ th.act=()=>{ const se=seatOf(tris(th.obj)); if(se)sitOn(se,th); }; th.reach=1.5; th.near=1.5+1.2*T; }
  PARK.later(()=>{ '@later'; if(!PARK.sitlog||!PARK.more)return; const [x,z]=PARK.sitlog, hb=new THREE.Mesh(new THREE.BoxGeometry(1.4*T,.6*T,1.4*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(x,.3*T,z); scene.add(hb);
    let se=null; const th={name:'SITTING LOG',obj:hb,reach:1.3*T,near:2.5*T,tall:.8*T,act:()=>{ se=se||seatOf(tris(PARK.more,[x,z,.9*T])); if(se)sitOn(se,th); }}; UI.thing(th); });
  const sitKeys=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' ','f','j','k','n','b','x','shift']);
  addEventListener('keydown',e=>{ if(USE.seat&&!e.repeat&&(sitKeys.has((e.key||'').toLowerCase())||!/^(q|e|r|z|x|v|c|0|=|-|\+|escape|control|alt|meta|tab)$/i.test(e.key||'')))stand(true); });
  const g0=UI.goTick; let last=performance.now();
  UI.goTick=()=>{ g0(); const now=performance.now(), dt=Math.min(.05,(now-last)/1000); last=now;
    const S=USE.seat; if(S){ if(SHARED.target||st.move&&!/sitDown/.test(st.move.name)||RAG.on)stand(!RAG.on); else if(Math.hypot(pos.x-S.x,pos.z-S.z)>.3*T){ USE.seat=null; st.sit=null; } else { pos.x=S.x; pos.z=S.z; st.mv=0; } }
    for(const d of DOORS){ const step=dt*9, k=d.to-d.a; d.a=Math.abs(k)<=step?d.to:d.a+Math.sign(k)*step; turnDoor(d); if(d.a===d.to)DOORS.delete(d); }
    for(let i=0;i<CANS.length;i++){ const m=CANS[i], u=m.userData; if(u.rest)continue; u.vy-=30*T*dt; m.position.y+=u.vy*dt; if(m.position.y<=u.floor){ m.position.y=u.floor; if(Math.abs(u.vy)>2*T){ u.vy*=-.3; } else { u.rest=true; m.rotation.z=Math.PI/2; m.position.y=u.floor-.03*T; } } }
    for(const o of BLINK){ o.blink-=dt; tint(o,o.blink>0&&Math.floor(o.blink/.125)%2===0?[1.8,1.8,1.8]:[1,1,1],glows); if(!(o.blink>0))BLINK.delete(o); }
    if(USE.radio)radioTick(); };
  USE.sit=(obj,th)=>{ const se=seatOf(tris(obj)); if(se)sitOn(se,th); };   // sit on any object's top (a chair, a bed's edge)
  USE.test={kindOf,goal,seatOf,tris,doorOf,stand,CANS,DOORS,box,pos:()=>[pos.x,SHARED.py,pos.z],sit:()=>st.sit,hits:(x,y)=>{ const r=renderer.domElement.getBoundingClientRect(); ray0.setFromCamera(new THREE.Vector2((x-r.left)/r.width*2-1,-((y-r.top)/r.height*2-1)),SHARED.cam); if(OBJS.length!==nO){ nO=OBJS.length; MS=[...new Set(OBJS.flatMap(o=>o.parts.map(p=>p.me)))]; } return ray0.intersectObjects(MS.filter(shown),false).slice(0,6).map(h=>{ const o=h.object.userData.objOf[Math.floor(h.faceIndex/2)]; return [o&&o.name,+h.distance.toFixed(2),cut(h)]; }); },pick:(x,y)=>{ const r=renderer.domElement.getBoundingClientRect(); ray0.setFromCamera(new THREE.Vector2((x-r.left)/r.width*2-1,-((y-r.top)/r.height*2-1)),SHARED.cam); const u=USE.pick(ray0); return u&&[u.th.name,u.d]; },scr:p=>{ const q=p.clone().project(SHARED.cam), r=renderer.domElement.getBoundingClientRect(); return [r.left+(q.x+1)/2*r.width,r.top+(1-q.y)/2*r.height]; }};
}
