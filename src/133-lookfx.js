// THE LOOK EFFECTS: LFX's shading, ambient occlusion and wetness on the world, by weather and hour.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, LOOK, PARK, pos, ROOMS, WX} from './003b-systems.js';
import {scene} from './004-main.js';
import {LFX, OUT, SOL, SYS, TILE} from './006-map-pre.js';
{ const F=LFX.on, cl=v=>Math.max(0,Math.min(1,v));
  if(LFX.shade){ const E=LFX.env.image.data;
    const h=(x,y)=>{ const s=Math.sin(((x%16+16)%16)*127.1+((y%16+16)%16)*311.7)*43758.5453; return s-Math.floor(s); }, vn=(x,y)=>{ const i=Math.floor(x), j=Math.floor(y), u=x-i, v=y-j, a=u*u*(3-2*u), b=v*v*(3-2*v);
      return (h(i,j)*(1-a)+h(i+1,j)*a)*(1-b)+(h(i,j+1)*(1-a)+h(i+1,j+1)*a)*b; };
    for(let y=0;y<63;y++)for(let x=0;x<64;x++){ const n=vn(x/8,y/8)*.65+vn(x/4+5,y/4+3)*.35; E[(y*64+x)*4]=Math.round(n*255); }
    LFX.bakeAO=()=>{ if(LFX.aoDone)return; LFX.aoDone=true; setTimeout(()=>{ '@later'; const A=LFX.AO, W=A.w*A.k, H=A.h*A.k, D=new Float32Array(W*H).fill(1e9);
      for(const b of SOL.up){ const i0=Math.max(0,Math.floor((b[0]-A.x0)*A.k)), i1=Math.min(W-1,Math.ceil((b[2]-A.x0)*A.k)), j0=Math.max(0,Math.floor((b[1]-A.z0)*A.k)), j1=Math.min(H-1,Math.ceil((b[3]-A.z0)*A.k)); for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)D[j*W+i]=0; }
      for(let j=0;j<H;j++)for(let i=0;i<W;i++){ const k=j*W+i; if(i)D[k]=Math.min(D[k],D[k-1]+1); if(j)D[k]=Math.min(D[k],D[k-W]+1,i?D[k-W-1]+1.41:1e9,i<W-1?D[k-W+1]+1.41:1e9); }
      for(let j=H-1;j>=0;j--)for(let i=W-1;i>=0;i--){ const k=j*W+i; if(i<W-1)D[k]=Math.min(D[k],D[k+1]+1); if(j<H-1)D[k]=Math.min(D[k],D[k+W]+1,i<W-1?D[k+W+1]+1.41:1e9,i?D[k+W-1]+1.41:1e9); }
      const R=.42*TILE*A.k, O=LFX.ao.image.data; for(let k=0;k<W*H;k++)O[k]=Math.round(255*(.62+.38*cl(D[k]/R))); LFX.ao.needsUpdate=true; },200); }; if(F.has('ao'))LFX.bakeAO();   // the contact shade's map, made once (at the start, or when GRAPHICS HIGH first wants it)
    const sky=new THREE.Color(); let t0=performance.now(); const WS={wet:null,snow:0,h:null,t:t0}; window.WETQ=o=>{ if(o)Object.assign(WS,o); return {...WS}; };
    LFX.tick=()=>{ const day=cl((CLOCK.elev()+3)/12), W=WX.now||{cloud:.3,wind:.3,rain:0}, inside=!OUT.open, t=(performance.now()-t0)/1000, row=63*64*4;
      E[row]=F.has('cs')&&!inside?Math.round(255*day*(.55+.45*cl(W.cloud*1.4))):0;
      const now=performance.now(), dt=Math.min(1,(now-WS.t)/1000); let dh=WS.h==null?0:CLOCK.h-WS.h; if(dh<0)dh+=24; if(dh>2)dh=0; WS.t=now; WS.h=CLOCK.h;
      if(WS.wet==null&&typeof WX!=='undefined'&&WX.now){ if(WX.hold||WX.fix&&!WX.nat){ WS.wet=W.rain>.05?1:0; WS.snow=W.snow>.05?1:0; } else { const Tm=Math.floor(Date.now()/86400000)*1440+CLOCK.h*60; WS.wet=WS.snow=0; for(let k=0;k<=180;k+=10){ const p=WX.at(Tm-k); if(p.rain>.05)WS.wet=Math.max(WS.wet,1-k/120); if(p.snow>.05)WS.snow=Math.max(WS.snow,1-k/180); } } }
      if(WS.wet==null){} else if(W.rain>.05)WS.wet=Math.min(1,WS.wet+dt/25*(.5+W.rain)); else WS.wet=Math.max(0,WS.wet-Math.max(dt/240,dh/2));
      if(WS.wet==null){} else if(W.snow>.05)WS.snow=Math.min(1,WS.snow+dt/90*(.5+W.snow)); else WS.snow=Math.max(CLOCK.seasonLook().snow,WS.snow-Math.max(dt/(W.rain>.05?60:300),dh/3));
      E[row+1]=inside?0:Math.round(255*(F.has('wet')?1:WS.wet||0)); E[row+6]=inside?0:Math.round(255*WS.snow); LFX.ws=WS;
      
      E[row+2]=F.has('ao')?255:0; E[row+3]=F.has('var')?255:0;
      const sp=.004+W.wind*.02; E[row+4]=Math.round(((t*sp)%1)*255); E[row+5]=Math.round(((t*sp*.6)%1)*255);
      sky.copy(scene.background); E[row+8]=Math.round(sky.r*255); E[row+9]=Math.round(sky.g*255); E[row+10]=Math.round(sky.b*255);
      LFX.env.needsUpdate=true; }; }
  const tick1=LFX.tick||(()=>{}); LFX.tick=()=>{ tick1(); if(F.has('cool')&&typeof LOOK!=='undefined')LOOK.cool.value=LFX.cool??Math.max(.5*cl((CLOCK.elev()+3)/12),.7*cl(1-Math.abs(CLOCK.elev()-3)/10))*(SHARED.LVL==='down'||ROOMS.cur?0:1); };
  if(F.has('life')){ const NB=9, NL=60;
    const bg=new THREE.BufferGeometry(), bp=new Float32Array(NB*12); bg.setAttribute('position',new THREE.BufferAttribute(bp,3).setUsage(THREE.DynamicDrawUsage));
    const BIRDS=new THREE.LineSegments(bg,new THREE.LineBasicMaterial({color:0x1d2026})); BIRDS.frustumCulled=false; scene.add(BIRDS);
    const lg=new THREE.BufferGeometry(), lp=new Float32Array(NL*3), lc=new Float32Array(NL*3), ls=[]; lg.setAttribute('position',new THREE.BufferAttribute(lp,3).setUsage(THREE.DynamicDrawUsage)); lg.setAttribute('color',new THREE.BufferAttribute(lc,3));
    const LEAVES=new THREE.Points(lg,new THREE.PointsMaterial({size:3,sizeAttenuation:false,vertexColors:true})); LEAVES.frustumCulled=false; scene.add(LEAVES);
    const LC=[[.42,.55,.18],[.62,.6,.2],[.78,.48,.16],[.6,.3,.12]]; for(let i=0;i<NL;i++){ ls.push({o:i%16,t:Math.random()*8,ph:Math.random()*6}); lc.set(LC[i%4],i*3); }
    for(const o of [BIRDS,LEAVES])OUT.add(o,'open');
    const tick2=LFX.tick; LFX.tick=()=>{ '@later'; tick2(); const t=performance.now()/1000, dt=1/60, up=SHARED.LVL!=='down', day=cl((CLOCK.elev()+3)/12), park=PARK.in&&PARK.oaks;
      const cx=SHARED.BOD.XS(96+PARK.ox), cz=SHARED.BOD.ZS(-40+PARK.oy); for(let i=0;i<NB;i++){ const a=t*.18+i*.35, r=(14+i*1.3)*TILE, x=cx+Math.cos(a)*r, z=cz+Math.sin(a)*r*.7, y=(9+Math.sin(i*2.1+t*.5))*TILE, w=.35*TILE, f=Math.sin(t*9+i)*.18*TILE, dx=-Math.sin(a), dz=Math.cos(a)*.7;
        bp.set([x-dz*w,y+f,z+dx*w, x,y,z, x,y,z, x+dz*w,y+f,z-dx*w],i*12); } bg.attributes.position.needsUpdate=true;
      if(park)for(let i=0;i<NL;i++){ const L=ls[i], o=park[L.o%park.length]; L.t+=dt; const T=L.t%9, y=o[2]*.8-T*.9; if(y<.02){ lp.set([o[0]+Math.sin(L.ph)*1.6,.02,o[1]+Math.cos(L.ph)*1.6],i*3); continue; }
        lp.set([o[0]+Math.sin(L.ph+T*.8)*1.6+T*.25,y,o[1]+Math.cos(L.ph)*1.6+Math.sin(T*2.3+L.ph)*.3],i*3); } lg.attributes.position.needsUpdate=true;
      LEAVES.visible=LEAVES.visible&&!!park; MOTES.visible=MOTES.visible&&day>.3; for(let i=0;i<NM;i++){ const m=ms[i]; mp.set([pos.x+m[0]+Math.sin(t*.3+m[3])*.4,SHARED.py+m[1]+Math.sin(t*.5+m[3]*2)*.2,pos.z+m[2]+Math.cos(t*.25+m[3])*.4],i*3); } mg.attributes.position.needsUpdate=true; }; }
  if(LFX.tick){ SYS.add('sky',(dt)=>{ LFX.tick(); },'133-lookfx'); } }
