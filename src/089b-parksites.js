// THE PARK'S SITES: SITES builds the woodland folk's places in Central Park from parkPlaces.sites in data/world.json (the pub, the ruins, the broken bridge, the huts, the practice yard), in stone laid stone by stone; the pub has an inside off the map.
import {SHARED, THREE} from './003-shx.js';
import {PARK, ROOMS, WEEDS} from './003b-systems.js';
import {scene} from './004-main.js';
import {CASTLE, LEVEL, MAPG, MODS, SOL, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {PARTSNPC} from './080-npc-parts.js';
const SITES={list:[],at:{},homes:{}}; window.SITES=SITES;
PARK.later(()=>{ '@park'; const P=PARK, T=TILE, PI=Math.PI, X=x=>SHARED.BOD.XS(x+(P.ox||0)), Z=y=>SHARED.BOD.ZS(y+(P.oy||0)), MH=T/.84, MV=ZU*24/.84, gnd=(x,z)=>MODS.bodega.ground(x,z);
  const h3=(a,b,c)=>{ const s=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return s-Math.floor(s); }, C=h=>{ const n=parseInt(h.slice(1),16); return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]; };
  const mix=(a,c,t)=>a.map((v,i)=>v+(c[i]-v)*t), vary=(c,h,a=.14)=>c.map(v=>Math.max(0,v*(1-a/2+a*h)));
  const STONE=C('#8a8578'), STONE2=C('#6e6a62'), MOSS=C('#4f6a2e'), MOSS2=C('#6c8a3a'), WOOD=C('#5a3e26'), WOOD2=C('#3e2a1a'), THATCH=C('#8a7448'), SLATE=C('#56606c'), GLOW=C('#ffcf70'), IRON=C('#2a2a2e'), DIRT=C('#4a3a28'), BONE=C('#d8d0bc'), STRAW=C('#c8a860');
  const mat=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}), glowM=new THREE.MeshBasicMaterial({vertexColors:true});
  // a builder in metres (x right, y up, z toward the site's front), placed at a site's centre and turned to its face
  const kit=(cx,cy,face,base)=>{ const F={n:[0,-1],s:[0,1],e:[1,0],w:[-1,0]}[face]||[0,1], wx=X(cx), wz=Z(cy), fx=X(cx+F[0])-wx, fz=Z(cy+F[1])-wz, fl=Math.hypot(fx,fz), f=[fx/fl,fz/fl], r=[-f[1],f[0]], y0=base??gnd(wx,wz);
    const K={P:[],C:[],GP:[],GC:[],sol:[],wx,wz,f,r,y0,face};
    K.w=(lx,ly,lz)=>[wx+(r[0]*lx+f[0]*lz)*MH,y0+ly*MV,wz+(r[1]*lx+f[1]*lz)*MH];
    K.put=(g,col,{at=[0,0,0],rot,sc,glow,j=0}={})=>{ g=g.index?g.toNonIndexed():g; if(sc)g.scale(...sc); if(rot)g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rot))); g.translate(...at);
      const p=g.attributes.position, n=p.count, A=glow?K.GP:K.P, B=glow?K.GC:K.C; const loc=[];
      for(let i=0;i<n;i++){ let x=p.getX(i), y=p.getY(i), z=p.getZ(i); if(j){ const k=[x,y,z].map(v=>Math.round(v*300)); x+=(h3(...k)-.5)*j; y+=(h3(k[1],k[2],k[0]+3)-.5)*j; z+=(h3(k[2]+7,k[0],k[1])-.5)*j; } loc.push([x,y,z]); A.push(...K.w(x,y,z)); }
      for(let q=0;q<n;q+=3){ const m=[0,1,2].map(k=>(loc[q][k]+loc[q+1][k]+loc[q+2][k])/3), c=typeof col==='function'?col(m[0],m[1],m[2],h3(...m.map(v=>Math.round(v*97)))):col; for(let k=0;k<3;k++)B.push(...c); } };
    K.solid=(x0,z0,x1,z1)=>{ const a=K.w(x0,0,z0), b=K.w(x1,0,z1); K.sol.push([Math.min(a[0],b[0]),Math.min(a[2],b[2]),Math.max(a[0],b[0]),Math.max(a[2],b[2])]); };
    // a wall of laid stones from (x0,z0) to (x1,z1), h high, t thick; each stone its own block, mossier toward the ground and the top
    K.wall=(x0,z0,x1,z1,h,t=.3,{sw=.42,sh=.2,gaps,moss=.5,ruin=0,y=0}={})=>{ const L=Math.hypot(x1-x0,z1-z0), ux=(x1-x0)/L, uz=(z1-z0)/L, a=Math.atan2(ux,uz)-PI/2, rows=Math.max(1,Math.round(h/sh));
      for(let rI=0;rI<rows;rI++){ const yy=y+rI*h/rows, top=ruin?h*(1-ruin*h3(rI,x0*7,z0*3)):h; let s=(rI%2)*sw*.5*h3(rI,x0,z0);
        while(s<L){ const w=sw*(.65+.7*h3(rI,s*13,x0+z0)), e=Math.min(L,s+w), m=(s+e)/2; if(yy<top-(ruin?h*.35*h3(m*5,rI,1):0)&&!(gaps&&gaps.some(g=>m>g[0]&&m<g[1]&&yy<g[2]))){
            const hh=h/rows*(.9+.1*h3(m,rI,4)), cx=x0+ux*m, cz=z0+uz*m, k=h3(m*3,rI,9), c=k<moss*(rI===rows-1?.9:rI===0?.6:.2)?mix(STONE2,MOSS,.5+.4*k):mix(STONE,STONE2,h3(m,rI,2));
            K.put(new THREE.BoxGeometry(e-s-.025,hh-.02,t*(.9+.2*h3(m,rI,5))),(x,y2,z,hh2)=>vary(c,hh2,.12),{at:[cx,yy+hh/2,cz],rot:[0,a,0],j:.018}); } s=e; } } };
    K.col=(x,z,h,r=.18,{cap=true,broken=0}={})=>{ const hh=h*(1-broken*.6); K.put(new THREE.CylinderGeometry(r*.9,r,hh,10,4),(px,py,pz,hs)=>vary(mix(STONE,MOSS,py<.4?.4:h3(px*9,py*9,pz)>.92?.5:0),hs,.12),{at:[x,hh/2,z],j:.012});
      for(let i=0;i<8;i++)K.put(new THREE.BoxGeometry(.035,hh*.95,.035),STONE2,{at:[x+Math.sin(i*PI/4)*r*.92,hh/2,z+Math.cos(i*PI/4)*r*.92]});
      if(cap&&!broken){ K.put(new THREE.BoxGeometry(r*2.6,.12,r*2.6),vary(STONE,.5),{at:[x,hh+.06,z],j:.01}); K.put(new THREE.CylinderGeometry(r*1.2,r*.95,.1,10),STONE,{at:[x,hh-.03,z]}); }
      K.put(new THREE.BoxGeometry(r*2.4,.14,r*2.4),STONE2,{at:[x,.07,z],j:.01}); };
    K.door=(x,z,w,h,a=0,col=WOOD)=>{ const s=new THREE.Shape(); s.moveTo(-w/2,0); s.lineTo(-w/2,h-w/2); s.absarc(0,h-w/2,w/2,PI,0,true); s.lineTo(w/2,0); s.closePath();
      const g=new THREE.ExtrudeGeometry(s,{depth:.05,bevelEnabled:false,curveSegments:10}); K.put(g,(px,py,pz,hs)=>vary(Math.abs(Math.sin(px*28))<.15?WOOD2:col,hs,.18),{at:[x,0,z],rot:[0,a,0]});
      for(const yy of [h*.25,h*.62])K.put(new THREE.BoxGeometry(w*.9,.04,.02),IRON,{at:[x+Math.cos(a)*0,yy,z+.05],rot:[0,a,0]});
      K.put(new THREE.SphereGeometry(.03,6,4),C('#b08a3a'),{at:[x+w*.3,h*.45,z+.07]}); };
    K.window=(x,y,z,w,h,a=0)=>{ K.put(new THREE.BoxGeometry(w,h,.04),GLOW,{at:[x,y,z],rot:[0,a,0],glow:1}); K.put(new THREE.BoxGeometry(w+.08,.05,.12),WOOD2,{at:[x,y-h/2,z],rot:[0,a,0]}); K.put(new THREE.BoxGeometry(.035,h,.06),WOOD2,{at:[x,y,z+.02],rot:[0,a,0]}); K.put(new THREE.BoxGeometry(w,.035,.06),WOOD2,{at:[x,y,z+.02],rot:[0,a,0]}); };
    K.lantern=(x,y,z)=>{ K.put(new THREE.CylinderGeometry(.06,.07,.16,6),GLOW,{at:[x,y,z],glow:1}); K.put(new THREE.ConeGeometry(.09,.08,6),IRON,{at:[x,y+.12,z]}); K.put(new THREE.CylinderGeometry(.075,.075,.02,6),IRON,{at:[x,y-.09,z]}); };
    // a roof of mossy turf or thatch over a box w x d, gable along x
    K.roof=(w,d,y,rise,col,over=.25)=>{ const n=Math.ceil((d/2+over)/.18); for(let s of [-1,1])for(let i=0;i<n;i++){ const t0=i/n, zz=s*(d/2+over)*(1-t0), yy=y+rise*t0;
        K.put(new THREE.BoxGeometry(w+over*2+.1*h3(i,s,1),.12,(d/2+over)/n*1.6),(px,py,pz,hs)=>vary(h3(Math.round(px*6),i,s)>.7?MOSS2:col,hs,.25),{at:[0,yy,zz],rot:[s*Math.atan2(rise,d/2+over),0,0],j:.03}); }
      K.put(new THREE.BoxGeometry(w+over*2,.16,.22),MOSS,{at:[0,y+rise+.02,0],j:.03}); };
    K.dome=(x,z,r,y,col)=>{ const g=new THREE.SphereGeometry(r,14,8,0,PI*2,0,PI/2); K.put(g,(px,py,pz,hs)=>vary(h3(Math.round(px*8),Math.round(pz*8),2)>.6?MOSS2:col,hs,.3),{at:[x,y,z],sc:[1,.7,1],j:.06}); };
    K.done=(name)=>{ if(window.WEEDS&&WEEDS.clear)for(const b of K.sol)WEEDS.clear(b); const out=[]; for(const [A,B,m] of [[K.P,K.C,mat],[K.GP,K.GC,glowM]]){ if(!A.length)continue; const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(A,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(B,3)); g.computeVertexNormals();
        const me=new THREE.Mesh(g,m); me.name=name; me.castShadow=m===mat; me.receiveShadow=true; out.push(me); } for(const b of K.sol)SOL.up.push(b); return out; };
    return K; };
  SITES.kit=kit;

  const MAKE={
    pub:(s,K)=>{ const w=s.w*.84*.62, d=s.d*.84*.62, h=2.4;
      K.wall(-w/2,d/2,w/2,d/2,h,.32,{gaps:[[w/2-.55,w/2+.55,2.0],[w*.2-.4,w*.2+.4,1.6],[w*.8-.4,w*.8+.4,1.6]]}); K.wall(w/2,-d/2,-w/2,-d/2,h,.32,{gaps:[[w*.5-.4,w*.5+.4,1.6]]}); K.wall(-w/2,-d/2,-w/2,d/2,h,.32,{gaps:[[d*.5-.4,d*.5+.4,1.6]]}); K.wall(w/2,d/2,w/2,-d/2,h,.32);
      for(const x of [-w*.3,w*.3])K.window(x,1.2,d/2+.12,.55,.5); K.window(0,1.2,-d/2-.12,.6,.5,PI); K.window(-w/2-.12,1.2,0,.6,.5,PI/2);
      K.door(0,d/2+.13,1.0,2.0,0,C('#6a4428'));
      // the gable ends, the roof, the chimney
      for(const z of [-d/2,d/2]){ const s2=new THREE.Shape(); s2.moveTo(-w/2,0); s2.lineTo(w/2,0); s2.lineTo(0,1.5); s2.closePath(); K.put(new THREE.ExtrudeGeometry(s2,{depth:.28,bevelEnabled:false}),(px,py,pz,hs)=>vary(mix(STONE,STONE2,h3(Math.round(px*4),Math.round(py*6),1)),hs,.2),{at:[0,h,z-.14],j:.02}); }
      K.roof(w,d,h+.05,1.6,THATCH,.35);
      K.wall(w/2-.9,-.3,w/2-.9,.35,h+2.6,.62,{sw:.3,sh:.18,moss:.2}); K.put(new THREE.BoxGeometry(.75,.12,.8),STONE2,{at:[w/2-.9,h+2.65,.02]});
      // the sign on its bracket, the lanterns, benches and barrels out front
      K.put(new THREE.BoxGeometry(.06,.06,.9),IRON,{at:[w*.32,2.3,d/2+.5]}); const sg=sign(s.name); K.signs=(K.signs||[]).concat([[sg,[w*.32,1.95,d/2+.85]]]);
      K.lantern(-.75,1.75,d/2+.3); K.lantern(.75,1.75,d/2+.3);
      for(const [x,z] of [[-w/2+.5,d/2+1.1],[w/2-.5,d/2+1.1]]){ K.put(new THREE.BoxGeometry(1.4,.07,.4),WOOD,{at:[x,.48,z],j:.01}); for(const sx of [-.55,.55])K.put(new THREE.BoxGeometry(.08,.48,.3),WOOD2,{at:[x+sx,.24,z]}); }
      for(const [x,z] of [[w/2+.5,d/2-.3],[w/2+.55,d/2-1.1],[w/2+1.1,d/2-.6]])barrel(K,x,z,.32,.78);
      K.solid(-w/2-.2,-d/2-.2,w/2+.2,d/2+.2); K.door_=K.w(0,0,d/2+.6); K.doorIn=[0,d/2]; },
    ruins:(s,K)=>{ const w=s.w*.84, d=s.d*.84;
      K.wall(-w/2,-d/2,w/2,-d/2,3.0,.42,{ruin:.7,gaps:[[w*.3-.7,w*.3+.7,2.0],[w*.7-.7,w*.7+.7,2.0]]}); K.wall(-w/2,-d/2,-w/2,d/2*.4,2.6,.42,{ruin:.85});
      K.wall(w/2,d/2,w/2,-d/2,2.0,.42,{ruin:.9,gaps:[[d*.45,d*.62,1.8]]}); K.wall(-w/2+2,d/2,w/2-4,d/2,1.2,.4,{ruin:1});
      for(let i=0;i<5;i++){ const x=-w/2+2+i*(w-4)/4, br=h3(i,3,1); K.col(x,0,3.2,.24,{broken:br>.5?br:0}); }
      for(let i=0;i<3;i++){ const a=h3(i,7,2)*PI; K.put(new THREE.CylinderGeometry(.22,.24,1.6,10,2),(px,py,pz,hs)=>vary(mix(STONE,MOSS,hs>.7?.5:0),hs,.15),{at:[-w/4+i*2.4,.22,d/3+(h3(i,1,1)-.5)*1.5],rot:[PI/2,a,0],j:.015}); }
      for(let i=0;i<14;i++){ const x=(h3(i,1,9)-.5)*w*.9, z=(h3(i,2,9)-.5)*d*.9, sz=.2+.35*h3(i,5,5); K.put(new THREE.BoxGeometry(sz*1.4,sz,sz),(px,py,pz,hs)=>vary(hs>.65?MOSS:STONE2,hs,.2),{at:[x,sz/2-.05,z],rot:[0,h3(i,4,4)*PI,(h3(i,6,6)-.5)*.5],j:.03}); }
      // a broken tower stump with stairs that climb to nowhere, the pillar the lookout keeps
      const tx=w/2-2.2, tz=d/2-2.2; for(let a=0;a<12;a++){ const a0=a/12*PI*2, a1=(a+1)/12*PI*2, hh=1.6+2.2*h3(a,9,9)*(a<6?1:.3); K.wall(tx+Math.cos(a0)*1.5,tz+Math.sin(a0)*1.5,tx+Math.cos(a1)*1.5,tz+Math.sin(a1)*1.5,hh,.38,{moss:.6}); }
      for(let i=0;i<8;i++){ const a=i*.42+.3; K.put(new THREE.BoxGeometry(.7,.16,.35),STONE,{at:[tx+Math.cos(a)*1.0,.16+i*.24,tz+Math.sin(a)*1.0],rot:[0,-a,0],j:.012}); }
      K.col(-w/2+1.2,d/2-1.2,2.4,.3); K.pillar=K.w(-w/2+1.2,2.4+.12,d/2-1.2);
      K.solid(-w/2-.2,-d/2-.25,w/2+.2,-d/2+.25); K.solid(-w/2-.25,-d/2,-w/2+.25,d/2*.4); K.solid(w/2-.25,-d/2,w/2+.25,d/2); K.solid(tx-1.7,tz-1.7,tx+1.7,tz+1.7); K.solid(-w/2+.85,d/2-1.55,-w/2+1.55,d/2-.85); },
    bridge:(s,K)=>{ const L=s.w*.84, Wd=1.5, H=2.6;
      // the arch: voussoirs round a half circle, the spandrels, the deck broken through near the middle, parapets
      const R=Math.min(L*.22,(H-.3)/.85); for(let i=0;i<=14;i++){ const a=PI*i/14, x=-Math.cos(a)*R, y=Math.sin(a)*R*.85; K.put(new THREE.BoxGeometry(.32,.38,Wd),(px,py,pz,hs)=>vary(mix(STONE,MOSS,hs>.75?.6:0),hs,.18),{at:[x,y,0],rot:[0,0,-(a-PI/2)],j:.02}); }
      for(const sx of [-1,1]){ K.wall(sx*R,-Wd/2,sx*L/2,-Wd/2,H,.3,{moss:.6}); K.wall(sx*R,Wd/2,sx*L/2,Wd/2,H,.3,{moss:.6}); for(let i=0;i<5;i++){ const x=sx*(R+.2+i*(L/2-R)/5); K.put(new THREE.BoxGeometry((L/2-R)/5,H*(.5+.1*i),Wd-.4),STONE2,{at:[x,H*(.25+.05*i),0],j:.03}); } }
      for(const sx of [-1,1]){ const x0=sx*R*.42, x1=sx*L/2; K.put(new THREE.BoxGeometry(Math.abs(x1-x0),.2,Wd),(px,py,pz,hs)=>vary(hs>.7?MOSS2:STONE,hs,.2),{at:[(x0+x1)/2,H,0],j:.03}); for(const z of [-Wd/2+.12,Wd/2-.12])K.wall(x0,z,x1,z,.55,.2,{y:H+.1,ruin:.5,sw:.3,sh:.14}); }
      for(let i=0;i<6;i++)K.put(new THREE.BoxGeometry(.03,.6+.5*h3(i,2,2),.03),C('#3a5a2a'),{at:[(h3(i,1,1)-.5)*R*1.4,R*.5,(h3(i,3,3)-.5)*Wd],rot:[0,0,(h3(i,4,4)-.5)*.3]});
      K.deck=[[-L/2,-R*.42],[R*.42,L/2]].map(([a,b])=>[K.w(a,H+.1,-Wd/2),K.w(b,H+.1,Wd/2)]); K.top=H+.1;
      for(const sx of [-1,1])K.solid(sx>0?R*.9:-L/2-.1,-Wd/2-.1,sx>0?L/2+.1:-R*.9,Wd/2+.1); },
    hut:(s,K)=>{ const r=1.3, n=16;
      for(let i=0;i<n;i++){ const a0=i/n*PI*2+.15, a1=(i+1)/n*PI*2+.15, mid=(a0+a1)/2, door=Math.abs(((mid-PI/2+PI*3)%(PI*2))-PI)<.42; K.wall(Math.cos(a0)*r,Math.sin(a0)*r,Math.cos(a1)*r,Math.sin(a1)*r,1.5,.4,{sw:.5,sh:.26,moss:.7,gaps:door?[[0,9,1.3]]:null}); }
      K.dome(0,0,r*1.28,1.45,MOSS); for(let i=0;i<10;i++){ const a=h3(i,1,1)*PI*2, rr=r*1.1*h3(i,2,2); K.put(new THREE.ConeGeometry(.04,.3+.4*h3(i,3,3),4),C('#5a4a30'),{at:[Math.cos(a)*rr,1.9+.35*(1-rr/r),Math.sin(a)*rr],rot:[(h3(i,4,4)-.5)*.6,0,(h3(i,5,5)-.5)*.6]}); }
      K.door(0,r-.08,.82,1.3,0,C('#4a3220')); K.lantern(0,1.38,r+.12); K.put(new THREE.BoxGeometry(.04,.04,.25),IRON,{at:[0,1.52,r+.02]});
      K.put(new THREE.CylinderGeometry(.18,.2,.25,8),(px,py,pz,hs)=>vary(STONE2,hs),{at:[r*.5,2.45,-r*.3]});
      for(let i=0;i<4;i++){ const a=PI/2+(i-1.5)*.35; K.put(new THREE.BoxGeometry(.4,.06,.3),STONE2,{at:[Math.cos(a)*(r+.6+i*.0),.03,Math.sin(a)*(r+.5)+i*.18],j:.02}); }
      K.solid(-r-.2,-r-.2,r+.2,r+.2); K.door_=K.w(0,0,r+.5); },
    yard:(s,K)=>{ const w=s.w*.84, d=s.d*.84;
      for(const [x0,z0,x1,z1] of [[-w/2,-d/2,w/2,-d/2],[-w/2,d/2,w/2,d/2],[-w/2,-d/2,-w/2,d/2]]){ const L=Math.hypot(x1-x0,z1-z0), n=Math.round(L/1.2); for(let i=0;i<=n;i++){ const x=x0+(x1-x0)*i/n, z=z0+(z1-z0)*i/n; K.put(new THREE.CylinderGeometry(.05,.06,.8,6),WOOD,{at:[x,.4,z],j:.01}); }
        for(const y of [.35,.7])K.put(new THREE.BoxGeometry(.04,.05,L),WOOD2,{at:[(x0+x1)/2,y,(z0+z1)/2],rot:[0,Math.atan2(x1-x0,z1-z0),0],j:.01}); }
      K.pells=[]; for(let i=0;i<3;i++){ const x=-w/2+1.4, z=-d/2+1.4+i*1.6; K.put(new THREE.CylinderGeometry(.09,.1,1.4,8),(px,py,pz,hs)=>vary(Math.abs(Math.sin(py*30))<.1?WOOD2:WOOD,hs,.3),{at:[x,.7,z],j:.01}); K.put(new THREE.BoxGeometry(.5,.06,.06),WOOD2,{at:[x,1.0,z]}); K.pells.push(K.w(x,1.0,z)); }
      K.butts=[]; for(let i=0;i<2;i++){ const x=w/2-.5, z=-d/2+1.8+i*2.4; K.put(new THREE.CylinderGeometry(.5,.5,.3,16),(px,py,pz,hs)=>{ const rr=Math.hypot(py-.0,pz-0)/.5; return vary(rr<.2?C('#d02a20'):rr<.45?C('#f0e0b0'):rr<.7?C('#2a4a8a'):STRAW,hs,.15); },{at:[x,.95,z],rot:[0,0,PI/2]});
        for(const sz of [-.3,.3])K.put(new THREE.BoxGeometry(.06,1.1,.06),WOOD2,{at:[x+.25,.55,z+sz],rot:[0,0,.25]}); K.butts.push(K.w(x-.16,.95,z)); }
      K.put(new THREE.BoxGeometry(1.4,.08,.3),WOOD,{at:[0,1.1,d/2-.3]}); for(const sx of [-.6,.6])K.put(new THREE.BoxGeometry(.08,1.1,.3),WOOD2,{at:[sx,.55,d/2-.3]});
      for(let i=0;i<5;i++)K.put(new THREE.CylinderGeometry(.015,.015,1.2,4),i%2?WOOD:IRON,{at:[-.5+i*.25,.6,d/2-.25],rot:[.15,0,0]}); }};

  const sign=(text)=>{ const cv=document.createElement('canvas'); cv.width=256; cv.height=96; const c=cv.getContext('2d'); c.fillStyle='#3a2616'; c.fillRect(0,0,256,96); c.strokeStyle='#c8a050'; c.lineWidth=6; c.strokeRect(6,6,244,84);
    c.fillStyle='#e8c870'; c.font='bold 22px Georgia,serif'; c.textAlign='center'; c.textBaseline='middle'; const W=text.split(' '); const l1=W.slice(0,Math.ceil(W.length/2)).join(' '), l2=W.slice(Math.ceil(W.length/2)).join(' '); c.fillText(l1,128,34); c.fillText(l2,128,64);
    const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; const g=new THREE.BoxGeometry(.04,.5,.8); return {g,tx}; };
  const barrel=(K,x,z,r,h)=>{ K.put(PARTSNPC.T.lathe([[r*.85,0],[r,h*.5],[r*.85,h]],14,6),(px,py,pz,hs)=>vary(Math.abs(py-.1)<.04||Math.abs(py-h+.1)<.04?IRON:Math.sin(Math.atan2(px-x,pz-z)*14)>.85?WOOD2:WOOD,hs,.2),{at:[x,0,z]}); K.put(new THREE.CircleGeometry(r*.85,12),WOOD2,{at:[x,h,z],rot:[-PI/2,0,0]}); };
  const grp=MAPG.park||scene;
  for(const s of LEVEL.parkPlaces.sites||[]){ const fn=MAKE[s.kind]; if(!fn)continue; try{ const K=kit(s.x,s.y,s.face); fn(s,K); const ms=K.done(s.name); for(const m of ms)grp.add(m);
      for(const [sg,at] of K.signs||[]){ const m=new THREE.Mesh(sg.g,new THREE.MeshLambertMaterial({map:sg.tx})); const w=K.w(...at); m.position.set(w[0],w[1],w[2]); m.rotation.y=Math.atan2(K.f[0],K.f[1]); m.scale.set(MH,MV,MH); grp.add(m); }
      if(WEEDS.keepOff){ const hw=s.w/2*T, hd=s.d/2*T; if(s.kind==='ruins'||s.kind==='pub')WEEDS.keepOff([[K.wx,K.wz,Math.hypot(hw,hd)+(s.kind==='pub'?1.5*T:.5*T)]]); else if(s.kind==='hut')WEEDS.keepOff([[K.wx,K.wz,2.2*T]]); }
      const rec={...s,K,meshes:ms,wx:K.wx,wz:K.wz,door:K.door_,deck:K.deck,top:K.top,pillar:K.pillar,pells:K.pells,butts:K.butts}; SITES.list.push(rec); SITES.at[s.id]=rec; SITES.homes[s.id]=K.door_||[K.wx,K.y0,K.wz];
      if(STORE.places)STORE.places.push([s.name,K.door_?K.door_[0]:K.wx,K.door_?K.door_[2]+.8*T:K.wz,'up']); }catch(e){ console.warn('site '+s.id,e); } }
  // the moat: a stone-lined channel of still water round the castle, crossed only by the drawbridge at the gate
  { const [bx0,bx1,by0,by1]=CASTLE.b, gx=CASTLE.gate, {i:IN,o:OUT,bw:BW}=CASTLE.moat, cx=(bx0+bx1)/2, cy=(by0+by1)/2, K=kit(cx,cy,'s'), WAT=[], WP=[], WL=.16, CP={sw:.36,sh:.14,moss:.5};
    const LO=(x,y)=>{ const wx=X(x)-K.wx, wz=Z(y)-K.wz; return [(wx*K.r[0]+wz*K.r[1])/MH,(wx*K.f[0]+wz*K.f[1])/MH]; }, box=(a0,b0,a1,b1)=>{ const p=LO(a0,b0), q=LO(a1,b1); return [Math.min(p[0],q[0]),Math.min(p[1],q[1]),Math.max(p[0],q[0]),Math.max(p[1],q[1])]; };
    const cope=(x0,y0,x1,y1)=>{ const a=LO(x0,y0), b=LO(x1,y1); K.wall(a[0],a[1],b[0],b[1],.3,.22,CP); };
    // one sheet of water at one level all the way round, under the bridge too
    for(const [x0,y0,x1,y1] of [[bx0-OUT,by0-OUT,bx1+OUT,by0-IN],[bx0-OUT,by1+IN,bx1+OUT,by1+OUT],[bx0-OUT,by0-IN,bx0-IN,by1+IN],[bx1+IN,by0-IN,bx1+OUT,by1+IN]]){ const [X0,Z0,X1,Z1]=box(x0,y0,x1,y1); const a0=K.w(X0,WL,Z0), a1=K.w(X1,WL,Z0), a2=K.w(X1,WL,Z1), a3=K.w(X0,WL,Z1); WP.push(...a0,...a2,...a1,...a0,...a3,...a2); }
    // the stone kerb along both banks, unbroken but for the bridge's two landings
    for(const e of [OUT,IN]){ const s=e===OUT?1:-1, x0=bx0-e, x1=bx1+e, y0=by0-e, y1=by1+e; cope(x0,y1,x1,y1); cope(x0,y0+s*.1,x0,y1-s*.1); cope(x1,y0+s*.1,x1,y1-s*.1); cope(x0,y0,gx-BW,y0); cope(gx+BW,y0,x1,y0); }
    // what you cannot walk into: the four arms of the moat, the front one either side of the bridge
    for(const [x0,y0,x1,y1] of [[bx0-OUT,by0-OUT,gx-BW,by0-IN],[gx+BW,by0-OUT,bx1+OUT,by0-IN],[bx0-OUT,by1+IN,bx1+OUT,by1+OUT],[bx0-OUT,by0-IN,bx0-IN,by1+IN],[bx1+IN,by0-IN,bx1+OUT,by1+IN]]){ const [X0,Z0,X1,Z1]=box(x0,y0,x1,y1); WAT.push([X0,Z0,X1,Z1]); K.solid(X0,Z0,X1,Z1); }
    // the drawbridge: planks on two beams from the far bank to the gatehouse's threshold, as wide as the gate, its chains up to the gatehouse over the arch
    { const [X0,Z0,X1,Z1]=box(gx-BW,by0-OUT-.3,gx+BW,by0-1.1), outZ=LO(gx,by0-OUT-.3)[1], inZ=LO(gx,by0-1.1)[1], D=.26; for(let z=Z0;z<Z1;z+=.18)K.put(new THREE.BoxGeometry(X1-X0,.06,.16),(x,y,zz,h)=>vary(Math.abs(Math.sin(x*14))<.1?WOOD2:WOOD,h,.25),{at:[(X0+X1)/2,D,z+.09],j:.008});
      for(const x of [X0+.1,X1-.1]){ K.put(new THREE.BoxGeometry(.12,.12,Z1-Z0),WOOD2,{at:[x,D-.09,(Z0+Z1)/2]}); K.put(PARTSNPC.T.tube([[x,D+.05,outZ],[x,1.5,(outZ+inZ)/2],[x,2.5,inZ]],[.02,.02,.02],4,8),IRON); }
      for(const z of [outZ,inZ])K.put(new THREE.BoxGeometry(X1-X0+.3,D-.03,.3),(x,y,zz,h)=>vary(STONE2,h,.2),{at:[(X0+X1)/2,(D-.03)/2,z],j:.01}); }
    { const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(WP,3)); g.computeVertexNormals(); const wm=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0x3a6a7a,side:THREE.DoubleSide})); wm.receiveShadow=true; wm.name='moat water'; grp.add(wm); }
    for(const m of K.done('the moat'))grp.add(m); SITES.moat={rects:WAT.map(([a,b,c,d])=>[K.w(a,0,b),K.w(c,0,d)]),level:K.y0+WL*MV};
    if(window.WEEDS&&WEEDS.clear)for(const [p,q] of SITES.moat.rects)WEEDS.clear([Math.min(p[0],q[0]),Math.min(p[2],q[2]),Math.max(p[0],q[0]),Math.max(p[2],q[2])]); }
  // the ground on the bridge's deck and atop the lookout's pillar, for whoever stands there
  SITES.ground=(x,z,g0)=>{ const b=SITES.at.bridge; if(b&&b.deck)for(const [a,c] of b.deck)if(x>Math.min(a[0],c[0])&&x<Math.max(a[0],c[0])&&z>Math.min(a[2],c[2])&&z<Math.max(a[2],c[2]))return a[1];
    const r=SITES.at.ruins; if(r&&r.pillar&&Math.hypot(x-r.pillar[0],z-r.pillar[2])<.35*T)return r.pillar[1]; return g0; };
  // the inside, off the map west of everything: the pub's room
  const OFFX=-1500, inside=(id,ty,w,d,h,name,build,exitName)=>{ const site=SITES.at[id]; if(!site||!site.door)return; const cx=X(OFFX), cz=Z(ty), hw=w/2*MH, hd=d/2*MH; let G=null, S0=[];
    const room=()=>{ const K=kit(0,0,'s',0); K.w=(lx,ly,lz)=>[cx+lx*MH,ly*MV,cz+lz*MH]; return K; };
    ROOMS.off[id]={name,box:{x0:cx-hw,z0:cz-hd,x1:cx+hw,z1:cz+hd,y0:-1,y1:h*MV+1},need:()=>Promise.resolve(),
      build:()=>{ G=new THREE.Group(); G.name=id+'-in'; scene.add(G); const P2=ROOMS.part(G,()=>{ const K=room(); build(K,w,d,h); for(const m of K.done(name))scene.add(m); S0=K.sol; for(const L of K.lights||[]){ const l=new THREE.PointLight(L[3],L[4],L[5]*MH,1.6); const q=K.w(L[0],L[1],L[2]); l.position.set(...q); scene.add(l); } (K.after||[]).forEach(f=>f()); }); return P2; },
      unbuild:()=>{ for(const b of S0){ const i=SOL.up.indexOf(b); if(i>=0)SOL.up.splice(i,1); } S0=[]; if(G){ G.removeFromParent(); G=null; } },
      spawn:[cx,cz+hd-.9*MH,0,Math.PI],out:[site.door[0],site.door[2],0,0],door:site.door,exit:[cx,0,cz+hd-.15*MH],exitName:exitName||'OUTSIDE'};
    SITES.inside[id]={cx,cz,w,d,h,seats:id==='pub'?PUBT.flatMap(([x,z])=>[0,1,2].map(k=>{ const a=k*2.1+x; return {x:cx+(x+Math.cos(a)*.85)*MH,z:cz+(z+Math.sin(a)*.85)*MH,tx:cx+x*MH,tz:cz+z*MH}; })):[]}; };
  SITES.inside={}; const PUBT=[[-1.2,.6],[1.4,.4],[.1,2.0],[2.8,2.0],[-2.6,2.1]];
  const shell4=(K,w,d,h,floor,wallCol)=>{ K.put(new THREE.BoxGeometry(w,.1,d),floor,{at:[0,-.05,0]}); for(const [x0,z0,x1,z1] of [[-w/2,-d/2,w/2,-d/2],[-w/2,-d/2,-w/2,d/2],[w/2,d/2,w/2,-d/2],[w/2,d/2,-w/2,d/2]])K.wall(x0,z0,x1,z1,h,.3,{moss:wallCol?0:.15,gaps:x0===w/2&&z0===d/2?[[w/2-.6,w/2+.6,2.1]]:null});
    K.door(0,d/2-.2,1.0,2.0,PI,C('#5a3a22')); K.solid(-w/2-.3,-d/2-.3,w/2+.3,-d/2+.15); K.solid(-w/2-.3,-d/2,-w/2+.15,d/2); K.solid(w/2-.15,-d/2,w/2+.3,d/2); K.solid(-w/2,d/2-.15,-.6,d/2+.3); K.solid(.6,d/2-.15,w/2,d/2+.3); };
  inside('pub',0,10,7,3,'THE MOSSY FLAGON',(K,w,d,h)=>{ shell4(K,w,d,h,(x,y,z,hh)=>vary(Math.abs(Math.sin(x*6))<.12?WOOD2:C('#6a4a2e'),hh,.15));
      for(let i=-2;i<=2;i++)K.put(new THREE.BoxGeometry(.18,.22,d),(x,y,z,hh)=>vary(WOOD2,hh,.25),{at:[i*w/5,h-.15,0],j:.01});
      // the bar along the back, its taps and shelves of bottles, the keeper's barrels
      K.put(new THREE.BoxGeometry(w*.6,1.05,.6),(x,y,z,hh)=>vary(Math.abs(Math.sin(x*9))<.1?WOOD2:WOOD,hh,.2),{at:[-w*.12,.52,-d/2+1.3],j:.008}); K.put(new THREE.BoxGeometry(w*.62,.07,.72),C('#7a5232'),{at:[-w*.12,1.08,-d/2+1.3]});
      for(let i=0;i<4;i++)K.put(new THREE.CylinderGeometry(.03,.03,.25,6),C('#b08a3a'),{at:[-w*.3+i*.5,1.25,-d/2+1.2]});
      for(const y of [1.3,1.8,2.3]){ K.put(new THREE.BoxGeometry(w*.6,.05,.3),WOOD,{at:[-w*.12,y,-d/2+.3]}); for(let i=0;i<10;i++)K.put(PARTSNPC.T.lathe([[0,0],[.05,.01],[.05,.15],[.018,.2],[.018,.26]],8,5),[[.2,.4,.2],[.5,.2,.15],[.3,.25,.5],[.6,.5,.2]][(i+Math.round(y*3))%4],{at:[-w*.4+i*.4,y+.03,-d/2+.3]}); }
      for(const [x,z] of [[w/2-.6,-d/2+.6],[w/2-1.3,-d/2+.6],[w/2-.6,-d/2+1.3]])barrel(K,x,z,.35,.85);
      // the hearth on the west wall, its fire
      K.wall(-w/2+.35,-1,-w/2+.35,1,1.5,.5,{sw:.3,sh:.18,moss:0}); K.put(new THREE.BoxGeometry(.4,1.1,1.0),C('#140c08'),{at:[-w/2+.62,.55,0]}); K.put(new THREE.BoxGeometry(.6,.14,2.2),STONE2,{at:[-w/2+.5,1.55,0],j:.01});
      for(let i=0;i<5;i++)K.put(new THREE.ConeGeometry(.1+.05*h3(i,1,1),.35+.2*h3(i,2,2),5),i%2?C('#ffb040'):C('#ff6a20'),{at:[-w/2+.65,.25,(i-2)*.13],glow:1}); K.put(new THREE.BoxGeometry(.4,.1,.6),C('#3a2a1a'),{at:[-w/2+.65,.06,0]});
      // tables and stools, candles on each
      for(const [x,z] of PUBT){ K.put(new THREE.CylinderGeometry(.55,.55,.07,14),(px,py,pz,hh)=>vary(WOOD,hh,.15),{at:[x,.78,z]}); K.put(new THREE.CylinderGeometry(.07,.12,.75,8),WOOD2,{at:[x,.38,z]});
        for(let k=0;k<3;k++){ const a=k*2.1+x; K.put(new THREE.CylinderGeometry(.18,.18,.06,10),WOOD,{at:[x+Math.cos(a)*.85,.45,z+Math.sin(a)*.85]}); K.put(new THREE.CylinderGeometry(.04,.05,.43,6),WOOD2,{at:[x+Math.cos(a)*.85,.22,z+Math.sin(a)*.85]}); }
        K.put(new THREE.CylinderGeometry(.03,.03,.1,6),C('#e8e0c8'),{at:[x,.87,z]}); K.put(new THREE.ConeGeometry(.018,.04,5),GLOW,{at:[x,.95,z],glow:1}); K.solid(x-.6,z-.6,x+.6,z+.6); }
      K.solid(-w*.12-w*.31,-d/2+.9,-w*.12+w*.31,-d/2+1.65);
      K.lights=[[-w/2+.9,.9,0,0xff8a3a,4,7],[-w*.12,2.4,-d/2+1.6,0xffc070,3,8],[1.4,2.4,1.6,0xffb060,2.5,7]]; },'OUT TO THE PARK');
  ROOMS.reset&&ROOMS.reset();
  // the lawn round you is painted from above: let it look again where the sites now stand
  if(window.WEEDS&&WEEDS.lawnDrop){ const [bx0,bx1,by0,by1]=CASTLE.b; WEEDS.lawnDrop([Math.min(X(bx0-5),X(bx1+5)),Math.min(Z(by0-5),Z(by1+5)),Math.max(X(bx0-5),X(bx1+5)),Math.max(Z(by0-5),Z(by1+5))]);
    for(const q of LEVEL.parkPlaces.sites||[]){ const a=[X(q.x-q.w/2-2),Z(q.y-q.d/2-2),X(q.x+q.w/2+2),Z(q.y+q.d/2+2)]; WEEDS.lawnDrop([Math.min(a[0],a[2]),Math.min(a[1],a[3]),Math.max(a[0],a[2]),Math.max(a[1],a[3])]); } }
  SITES.ready=true; SYS.run('sites');
  window.SITESDBG=()=>Object.values(SITES.at).map(s=>({id:s.id,kind:s.kind,tris:(s.meshes||[]).reduce((a,m)=>a+m.geometry.attributes.position.count/3,0),door:s.door&&s.door.map(v=>+v.toFixed(1))})); });
export {SITES};
