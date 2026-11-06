// THE GHOSTS: GHOSTS, the cloth ghosts that drift at night: the bath house's settle their cloth once and then only float, the hem rippling (no physics each frame, owner, 6 Nov 2026: "they shouldnt be causing any lag at all"); your own sheet when you die keeps a light cloth step.
import {SHARED, THREE} from './003-shx.js';
import {GHOSTS, pos, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';

{ const H=1/60, G=-9.8, DAMP=.98, ITER=4;
  GHOSTS.cloth=(R,sq,N,BR,mat,sx,y,sz)=>{ const IN=(i,j)=>sq||Math.hypot(i/(N-1)*2-1,j/(N-1)*2-1)<=1.02, REST=[], idx=[], live=[];
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){ if(!IN(i,j))continue; live.push((j*N+i)*3); for(const [di,dj] of [[1,0],[0,1],[1,1],[1,-1],[2,0],[0,2]]){ const i2=i+di, j2=j+dj; if(i2<0||i2>=N||j2<0||j2>=N||!IN(i2,j2))continue; REST.push([(j*N+i)*3,(j2*N+i2)*3,Math.hypot(di,dj)*2*R/(N-1),di===2||dj===2?.3:1]); } }
    for(let j=0;j<N-1;j++)for(let i=0;i<N-1;i++){ if(!IN(i,j)||!IN(i+1,j)||!IN(i,j+1)||!IN(i+1,j+1))continue; const a=j*N+i, b=a+1, c=a+N, d=c+1; idx.push(a,c,b,b,c,d); }
    const RA=Int32Array.from(REST,r=>r[0]), RB=Int32Array.from(REST,r=>r[1]), RL=Float32Array.from(REST,r=>r[2]), RS=Float32Array.from(REST,r=>r[3]), LV=Int32Array.from(live);
    const P=new Float32Array(N*N*3), O=new Float32Array(N*N*3), ST=new Float32Array(N*N*3).fill(NaN);
    const geo=new THREE.BufferGeometry(), pos=new THREE.BufferAttribute(new Float32Array(N*N*3),3); geo.setAttribute('position',pos); geo.setIndex(idx);
    const me=new THREE.Mesh(geo,mat); me.frustumCulled=false; me.renderOrder=3; scene.add(me);
    const Q={R,N,BR,P,O,ST,RA,RB,RL,RS,live:LV,geo,pos,me,ball:{x:sx,y,z:sz},d:{x:0,y:0,z:0},gnd:0,acc:0};
    Q.drop=()=>{ const b=Q.ball; for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const k=(j*N+i)*3; P[k]=b.x+((i/(N-1))*2-1)*R; P[k+1]=b.y+BR+.35; P[k+2]=b.z+((j/(N-1))*2-1)*R; } O.set(P); ST.fill(NaN); }; Q.drop(); return Q; };
  const step=(Q,others)=>{ const {P,O,ST,RA,RB,RL,RS,live,ball:b,d}=Q, rr=Q.BR+.012, g0=Q.gnd+.004, nl=live.length, nr=RA.length, no=others.length;
    for(let q=0;q<nl;q++){ const k=live[q], x=P[k], y=P[k+1], z=P[k+2]; P[k]=x+(x-O[k])*DAMP; P[k+1]=y+(y-O[k+1])*DAMP+G*H*H; P[k+2]=z+(z-O[k+2])*DAMP; O[k]=x; O[k+1]=y; O[k+2]=z; }
    for(let it=0;it<ITER;it++){
      for(let r=0;r<nr;r++){ const ia=RA[r], ib=RB[r], L=RL[r], s=RS[r], dx=P[ib]-P[ia], dy=P[ib+1]-P[ia+1], dz=P[ib+2]-P[ia+2], l=Math.sqrt(dx*dx+dy*dy+dz*dz)||1e-6; let f=(l-L)/l*.5*s; if(l<L){ if(s<1)continue; f*=.15; }
        P[ia]+=dx*f; P[ia+1]+=dy*f; P[ia+2]+=dz*f; P[ib]-=dx*f; P[ib+1]-=dy*f; P[ib+2]-=dz*f; }
      for(let q=0;q<nl;q++){ const k=live[q], dx=P[k]-b.x, dy=P[k+1]-b.y, dz=P[k+2]-b.z, l=Math.sqrt(dx*dx+dy*dy+dz*dz);
        if(l<rr){ if(ST[k]!==ST[k]){ ST[k]=dx/(l||1e-6); ST[k+1]=dy/(l||1e-6); ST[k+2]=dz/(l||1e-6); } P[k]=b.x+ST[k]*rr; P[k+1]=b.y+ST[k+1]*rr; P[k+2]=b.z+ST[k+2]*rr; O[k]=P[k]-d.x; O[k+1]=P[k+1]-d.y; O[k+2]=P[k+2]-d.z; }
        else if(l>rr+.03)ST[k]=NaN;
        for(let w=0;w<no;w++){ const o=others[w], ex=P[k]-o.x, ez=P[k+2]-o.z, e=Math.sqrt(ex*ex+ez*ez); if(e<.3&&P[k+1]<o.y){ const s=.3/(e||1e-6); P[k]=o.x+ex*s; P[k+2]=o.z+ez*s; } }
        if(P[k+1]<g0){ P[k+1]=g0; O[k]+=(P[k]-O[k])*.5; O[k+2]+=(P[k+2]-O[k+2])*.5; } } } };
  GHOSTS.move=(Q,to)=>{ const b=Q.ball, x=to.x-b.x, y=to.y-b.y, z=to.z-b.z; for(const k of Q.live){ Q.P[k]+=x; Q.P[k+1]+=y; Q.P[k+2]+=z; Q.O[k]+=x; Q.O[k+1]+=y; Q.O[k+2]+=z; } Object.assign(b,to); };
  GHOSTS.on=Q=>{ const b=Q.ball; for(const k of Q.live)if(Q.P[k+1]>b.y)return true; return false; };
  GHOSTS.settle=(Q,n)=>{ Q.d={x:0,y:0,z:0}; for(let s=0;s<n;s++)step(Q,[]); };
  GHOSTS.run=(Q,dt,to,others,MH,MV)=>{ Q.acc=Math.min(Q.acc+dt,H*2); const n=Math.max(1,Math.floor(Q.acc/H)); Q.acc=Math.max(0,Q.acc-n*H); const b=Q.ball, b0={...b};
    Q.d={x:(to.x-b0.x)/n,y:(to.y-b0.y)/n,z:(to.z-b0.z)/n}; for(let s=0;s<n;s++){ b.x+=Q.d.x; b.y+=Q.d.y; b.z+=Q.d.z; step(Q,others); } Object.assign(b,to);
    const A=Q.pos.array, P=Q.P; for(const k of Q.live){ A[k]=P[k]*MH; A[k+1]=P[k+1]*MV; A[k+2]=P[k+2]*MH; } Q.pos.needsUpdate=true; Q.geo.computeVertexNormals(); }; }
GHOSTS.init=()=>{ if(typeof SHARED.BOD==='undefined'||!SHARED.BOD.GD)return; const X=SHARED.BOD.X, Z=SHARED.BOD.Z, MH=TILE/.84, MV=SHARED.BOD.YS(24)/.84;
  const [a0,b0,a1,b1]=SHARED.BOD.GD.r, Y1=SHARED.BOD.GD.door[1], fy=Z(Y1)>Z((b0+b1)/2)?1:-1;
  const sh=SHARED.BOD.GD.shift||[0,0], mx=v=>v/MH, ix0=mx(Math.min(X(a0),X(a1)))+.6, ix1=mx(Math.max(X(a0),X(a1)))-.6, iz0=mx(Math.min(Z(b0),Z(b1)))+.6, iz1=mx(Math.max(Z(b0),Z(b1)))-.6;
  const fz0=mx(Z(Y1))+fy*.5, fz1=mx(Z(Y1+4*fy))-fy*.3, FZ0=Math.min(fz0,fz1), FZ1=Math.max(fz0,fz1);
  const spot=inside=>inside?[ix0+mx(sh[0])+Math.random()*(ix1-ix0),iz0+mx(sh[1])+Math.random()*(iz1-iz0)]:[ix0-1+Math.random()*(ix1-ix0+2),FZ0+Math.random()*(FZ1-FZ0)];
  const KINDS=[['THE HAND TOWEL',.34,false,13],['THE PILLOWCASE',.52,false,15],['THE NAPKIN',.36,true,13],['THE BEDSHEET',.62,true,17]];
  const BR=.12;
  const mat=new THREE.MeshLambertMaterial({color:0xf2f0ea,emissive:0x3a4050,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false});
  const eyeM=new THREE.MeshBasicMaterial({color:0x0c0c10}), eg=new THREE.CircleGeometry(1,10);
  KINDS.forEach(([name,R,sq,N],g)=>{ const [sx,sz]=spot(g%2===0), C=GHOSTS.cloth(R,sq,N,BR,mat,sx,.52,sz), me=C.me;
    const eyes=[0,1,2].map(k=>{ const e=new THREE.Mesh(eg,eyeM); e.scale.set((k<2?.026:.016)*MH,(k<2?.036:.013)*MV,1); e.renderOrder=4; scene.add(e); return e; });
    GHOSTS.settle(C,180); const REL=new Float32Array(C.P.length); for(const k of C.live){ REL[k]=C.P[k]-C.ball.x; REL[k+1]=C.P[k+1]-C.ball.y; REL[k+2]=C.P[k+2]-C.ball.z; const A=C.pos.array; A[k]=C.P[k]*MH; A[k+1]=C.P[k+1]*MV; A[k+2]=C.P[k+2]*MH; } C.pos.needsUpdate=true; C.geo.computeVertexNormals();   // its drape, settled once
    GHOSTS.list.push(Object.assign(C,{REL,ph:Math.random()*6.28,name,eyes,v:{x:0,z:0},yaw:Math.random()*6.28,yawTo:0,to:spot(g%2===0),wait:3+Math.random()*6,in:g%2===0,t:Math.random()*10}));
    const reg=()=>{ try{ UI.thing({name,obj:me,reach:1.2*TILE,near:2.6*TILE,tall:.9*TILE,act:()=>{}}); }catch(e){ setTimeout(reg,400); } }; setTimeout(reg,0); });
  const V=new THREE.Vector3();
  GHOSTS.tick=dt=>{ if(!dt)return; const near=SHARED.LVL!=='down'&&Math.hypot(pos.x/MH-(ix0+ix1)/2,pos.z/MH-(iz0+iz1)/2)<45*.84;
    for(const Q of GHOSTS.list){ Q.me.visible=near; for(const e of Q.eyes)e.visible=near; }
    if(!near)return;
    for(const Q of GHOSTS.list){ const b=Q.ball; Q.t+=dt;
      const dx=Q.to[0]-b.x, dz=Q.to[1]-b.z, dd=Math.hypot(dx,dz);
      if(dd>.12){ const sp=.28, k=Math.min(1,dt*.8); Q.v.x+=((dx/dd)*Math.min(sp,dd*.5)-Q.v.x)*k; Q.v.z+=((dz/dd)*Math.min(sp,dd*.5)-Q.v.z)*k; Q.yawTo=Math.atan2(dx,dz); }
      else { Q.v.x*=1-Math.min(1,dt*2); Q.v.z*=1-Math.min(1,dt*2); if((Q.wait-=dt)<=0){ Q.to=spot(Q.in); Q.wait=4+Math.random()*10; }
        else if(Math.random()<dt*.25)Q.yawTo=Math.random()<.7?Math.atan2(SHARED.cam.position.x/MH-b.x,SHARED.cam.position.z/MH-b.z)+(Math.random()-.5)*.6:Q.yawTo+(Math.random()-.5)*2; }
      b.x+=Q.v.x*dt; b.z+=Q.v.z*dt; b.y=.52+Math.sin(Q.t*1.6)*.05+Math.sin(Q.t*.55)*.03;
      let dy=Q.yawTo-Q.yaw; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); Q.yaw+=dy*Math.min(1,dt*1.5);
      { const P=Q.P, R=Q.REL, A=Q.pos.array, t=Q.t*2.1+Q.ph, lx=-Q.v.x*.9, lz=-Q.v.z*.9;   // the drape floats with it; the hem ripples and trails as it moves
        for(const k of Q.live){ const dn=Math.max(0,-R[k+1]-Q.BR*.5), w=dn*.12; P[k]=b.x+R[k]+(Math.sin(t+k*.37)*w+lx*dn); P[k+1]=Math.max(Q.gnd+.004,b.y+R[k+1]+Math.sin(t*1.3+k*.21)*w*.4); P[k+2]=b.z+R[k+2]+(Math.cos(t*.9+k*.29)*w+lz*dn);
          A[k]=P[k]*MH; A[k+1]=P[k+1]*MV; A[k+2]=P[k+2]*MH; } Q.pos.needsUpdate=true; }
      const fx=Math.sin(Q.yaw), fz=Math.cos(Q.yaw);
      Q.eyes.forEach((e,k)=>{ const sd=k===2?0:k?1:-1, ey=b.y+(k===2?-.035:.02), ex=b.x+fx*(BR+.045)+fz*sd*.05, ez=b.z+fz*(BR+.045)-fx*sd*.05; e.position.set(ex*MH,ey*MV,ez*MH); e.lookAt(V.set((ex+fx)*MH,ey*MV,(ez+fz)*MH)); }); } };
  SYS.add('life',(dt)=>{ GHOSTS.tick(dt); },'149-ghosts');
  window.GHOSTDBG=()=>GHOSTS.list.map(Q=>{ let hem=9, top=-9; for(const k of Q.live){ hem=Math.min(hem,Q.P[k+1]); top=Math.max(top,Q.P[k+1]); } return {name:Q.name,x:+Q.ball.x.toFixed(2),z:+Q.ball.z.toFixed(2),in:Q.in,hem:+hem.toFixed(2),top:+top.toFixed(2),vis:Q.me.visible,world:[+(Q.ball.x*MH).toFixed(2),+(Q.ball.z*MH).toFixed(2)]}; }); };
