// THE FALLS: FALLS is Central Park's waterfall beside the big lake (data/world.json parkPlaces.falls): an 18 m rock face of Polyfork rocks and moss, its plunge pool, the ledge behind the water, the jump rock, the mossy stairs, the lip with its spring, rope bridge and cairns, the rope swing, the rill to the brook; its ground is the park's (PARK.hill).
import {SHARED, THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {BROOK, CLOCK, DN, FALLS, FLOW, INV, keys, LITE, ONLINE, PARK, pos, RIDE, SFX, SKY, st, UI, WEEDS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer} from './004-main.js';
import {LEVEL, MAPG, MODS, SYS, TILE, ZU} from './006-map-pre.js';
import {cvNoise} from './014-gamekit.js';
import {FOUNT} from './060a-fount.js';
window.FALLS=FALLS;
{ const CF=LEVEL.parkPlaces&&LEVEL.parkPlaces.falls;
  if(CF&&typeof PARK!=='undefined'&&PARK.hill&&PARK.brook){
  const P=PARK, BK=P.brook, T=TILE, M=T/.84, G0=-.5*ZU, ox=P.ox||0, oy=P.oy||0, X=x=>SHARED.BOD.XS(x+ox), Z=y=>SHARED.BOD.ZS(y+oy), mx=wx=>SHARED.BOD.MX(wx)-ox, my=wz=>SHARED.BOD.MY(wz)-oy;
  const ss=(a,b,v)=>{ const t=Math.max(0,Math.min(1,(v-a)/(b-a))); return t*t*(3-2*t); }, mix=(a,b,t)=>a+(b-a)*t, nz=cvNoise;
  const C=[CF.x-ox,CF.y-oy], R=CF.r, HM=CF.h, BX=[CF.box[0]-ox,CF.box[1]-oy,CF.box[2]-ox,CF.box[3]-oy], LB=[CF.lobe[0]-ox,CF.lobe[1]-oy,CF.lobe[2]];
  const WL=-.2, CW=4.4, ARC=1.62, LEDGE=WL+.45, STEP=.6;   // metres: the pool's water, the ledge behind the falls, the highest step you take
  /* ---------- the shape: map tiles across, metres up ---------- */
  const foot=th=>R+1.7*(nz(th*2.2+7,1.3,611)-.5)+1.3*(1-ss(.06,.4,Math.abs(th)));   // the cliff's foot round the pool; deeper in behind the falls
  const polar=(x,y)=>{ const dx=x-C[0], dy=y-C[1]; return [Math.hypot(dx,dy),Math.atan2(dy,-dx)]; };   // th 0: west, into the rock
  const side=th=>1-ss(ARC-.3,ARC+.25,Math.abs(th));
  const boxD=(x,y)=>{ const rr=6, hw=(BX[2]-BX[0])/2, hh=(BX[3]-BX[1])/2, qx=Math.abs(x-(BX[0]+hw))-(hw-rr), qy=Math.abs(y-(BX[1]+hh))-(hh-rr); return -(Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-rr); };
  const cutD=(x,y)=>{ const [r,th]=polar(x,y); return Math.min(r-foot(th),Math.hypot(x-LB[0],y-LB[1])-LB[2]); };
  const terr=s=>{ const k=7, f=s*k, i=Math.floor(f); return mix(s,Math.min(1,(i+Math.pow(f-i,3.2))/k),.62); };
  const top=(x,y)=>HM*(.95+.14*(nz(x/7,y/7,613)-.5))*(1-.55*ss(C[0]+1,BX[2],x))*(1-.12*ss(BX[0]+9,BX[0],x));
  const mass=(x,y)=>Math.min(ss(0,3.2,boxD(x,y)),terr(ss(0,CW,cutD(x,y))));
  const LIP=[C[0]-foot(0)-CW+.2,C[1]], TARN=[BX[0]+7.5,C[1]+.6,2.4], BRX=LIP[0]-3.2;   // the lip, the spring on top, the rope bridge's line
  const segD=(x,y,a,b)=>{ const vx=b[0]-a[0], vy=b[1]-a[1], t=Math.max(0,Math.min(1,((x-a[0])*vx+(y-a[1])*vy)/(vx*vx+vy*vy))); return [Math.hypot(x-a[0]-vx*t,y-a[1]-vy*t),t]; };
  const streamD=(x,y)=>{ const w=.35*Math.sin(x*.9); return segD(x,y-w,[TARN[0],TARN[1]],[LIP[0]+1.1,LIP[1]])[0]; };
  const STY=BX[3]-2.6, STX0=BX[2]+1.5, STX1=BX[0]+6;   // the mossy stairs: up the north side from the shore to the top
  const RILL=(()=>{ let x=C[0]+R-1; while(x<C[0]+R+20&&!BK.wet(x,C[1],1.9))x+=.25; return [[C[0]+R-1.5,C[1]],[x,C[1]]]; })();
  const rillD=(x,y)=>{ const w=.45*Math.sin(x*.7+1); return segD(x,y-w,RILL[0],RILL[1]); };
  const JA=.8, JD=[-Math.cos(JA),Math.sin(JA)], JR0=foot(JA)+CW-.6, JR1=foot(JA)-1.4;   // the jump rock: a tongue of rock out over the deep water
  const FP=[Math.min(BX[0],TARN[0]-3)-2,Math.min(BX[1],LB[1]-LB[2])-2.5,RILL[1][0]+.5,BX[3]+2];
  const inFP=(x,y)=>x>FP[0]&&x<FP[2]&&y>FP[1]&&y<FP[3]&&!BK.wet(x,y,1.3)&&P.pd(x,y)>1&&FOUNT.trackD(x,y)>1&&FOUNT.lake(x,y)>1;   // (the paths, the shore's track and the lake keep their own ground)
  let stTop=null;
  const shape=(x,y,h0,walk)=>{ const [r,th]=polar(x,y), cd=Math.min(r-foot(th),Math.hypot(x-LB[0],y-LB[1])-LB[2]), sd=side(th);
    let g; if(cd<0){ const deep=Math.max(ss(0,5.5,-cd),sd*(r<foot(th)?ss(0,1.6,-cd):0)); g=WL-(.35+3.1*deep)*(r<foot(th)?1:.8)+.12*(nz(x*.9,y*.9,615)-.5); }
    else g=mix(Math.max(h0,WL+.14),h0,ss(0,2.5,cd));
    const ms=Math.min(ss(0,3.2,boxD(x,y)),terr(ss(0,CW,cd))), tp=top(x,y); let h=cd<0?g:Math.max(g,tp*ms);
    if(ms>.35){ const sd2=streamD(x,y); if(sd2<1.6)h-=.8*(1-ss(.55,1.5,sd2))*ss(.35,.7,ms); const td=Math.hypot(x-TARN[0],y-TARN[1]); if(td<TARN[2]+1)h-=1.05*(1-ss(TARN[2]*.45,TARN[2]+.6,td)); }
    if(Math.abs(y-STY)<1.15&&x>STX1-1&&x<STX0+.6){ const t=Math.max(0,Math.min(1,(STX0-x)/(STX0-STX1))); h=Math.max(h0,Math.floor(t*(stTop??HM*.86)/.24)*.24); }
    if(sd>.5&&cd>-1.5&&cd<.35)h=Math.max(h,LEDGE+.06*(nz(x*2,y*2,617)-.5));
    const [rd,rt]=rillD(x,y); if(rd<1.3&&rt>0&&rt<1)h=Math.min(h,mix(WL-.16-.1*rt,h,ss(.35,1.3,rd)));
    if(walk){ const along=(x-C[0])*JD[0]+(y-C[1])*JD[1], acr=Math.abs(-(x-C[0])*JD[1]+(y-C[1])*JD[0]); if(along<JR0&&along>JR1&&acr<.9){ const ex=C[0]+JD[0]*JR0, ey=C[1]+JD[1]*JR0; h=Math.max(h,top(ex,ey)*mass(ex,ey)-1); }
      if(Math.abs(x-BRX)<.8&&streamD(x,y)<2.4)h=Math.max(h,top(x,y)*mass(x,y)+.05); }
    return h; };
  stTop=(()=>{ let best=0; for(let y=STY-4;y<STY-1;y+=.5)best=Math.max(best,top(STX1-1,y)*mass(STX1-1,y)); return best||HM*.86; })();
  const h0=P.hill; P.hill=(x,y)=>inFP(x,y)?shape(x,y,h0(x,y)/M,true)*M:h0(x,y);
  const drawH=(x,y)=>shape(x,y,h0(x,y)/M,false);
  (MODS.batRoosts=MODS.batRoosts||[]).push({x:X(C[0]),z:Z(C[1]),r:R*.85*T,n:4});   // bats over the pool at night (owner, 10 Nov 2026: "add bats at night"; the creatures' bats, 087)
  Object.assign(FALLS,{C,R,WL,LIP,TARN,JA,inFP,cutD,drawH,walkH:(x,y)=>shape(x,y,h0(x,y)/M,true),side:(x,y)=>side(polar(x,y)[1]),FP,ready:false});
  // the land is open under the pool and the rill (MODS.landHoles): their outline, from the middle out
  { const w0=P.wetHole; P.wetHole=()=>{ const o=w0(), H=[]; for(let i=0;i<96;i++){ const a=i/96*Math.PI*2, dx=Math.cos(a), dy=Math.sin(a); let r=.5, last=0; while(r<R+12){ const x=C[0]+dx*r, y=C[1]+dy*r; if(drawH(x,y)<WL+.02)last=r; r+=.25; } if(last>0)H.push([C[0]+dx*(last+.2),C[1]+dy*(last+.2)]); }
      return H.length>8?[...o,H]:o; }; }
  // the park's own hills (089-pond) and lawn leave this ground to the falls' mesh
  (P.ownGround=P.ownGround||[]).push(inFP);
  // a ledge too high to step up stops you; one you walk off, you drop from (075 collide)
  (MODS.ledges=MODS.ledges||[]).push({lv:'up',tooHigh:(x,z,py)=>{ const a=mx(x), b=my(z); if(!inFP(a,b))return false; const w=st.water&&st.water.in?(WL*M+G0)+.4*M:py; const wh=(u,v)=>shape(u,v,h0(u,v)/M,true), h=wh(a,b); if(h*M-w>STEP*M)return true; if(h*M-w<.15*M)return false;
    return Math.max(Math.abs(wh(a+.5,b)-wh(a-.5,b)),Math.abs(wh(a,b+.5)-wh(a,b-.5)))/.84>1.45; }});   // (and ground steeper than about 55 degrees, however small the step: the stairs are 37)
  // the pool: you swim and dive in it; fish and the rod know it as still water (MODS.hill under the water)
  const wet=(x,y)=>cutD(x,y)<0&&drawH(x,y)<WL-.05;
  (MODS.waters=MODS.waters||[]).push({feed:(st,pos,dt,go,keys)=>{ if(SHARED.LVL!=='up')return false; const a=mx(pos.x), b=my(pos.z); if(!inFP(a,b)||!wet(a,b))return false;
      const W=RIG.water(st,{level:(WL*M+G0)/ZU,floor:SHARED.groundY(pos.x,pos.z)/ZU}); W.go=!!go; W.fast=W.in&&(keys.has('k')||keys.has('shift'))?1:0;
      if(W.in&&W.floor>=W.level-30&&!st.move&&!W.dive){ W.in=false; if(st.last)st.out={pose:JSON.parse(JSON.stringify(st.last)),t:0,T:.4}; }
      FALLS.swim=W.in; return true; }});
  FALLS.wet=(wx,wz)=>{ const a=mx(wx), b=my(wz); return inFP(a,b)&&wet(a,b); };

  /* ---------- what you see: built with the park, drawn near ---------- */
  const DATA=__LAZY__("data/fallspf.json");
  const go=async()=>{ '@park'; if(!P.G||!BROOK.ready||!MODS.land)return setTimeout(go,500);
    const D=await DATA(), root=new THREE.Group(), near=new THREE.Group(); root.name='falls'; near.name='falls near'; (MAPG.park||P.G).add(root); root.add(near);
    const hs=(i,s)=>{ const v=Math.sin(i*12.9898+s*78.233)*43758.5453; return v-Math.floor(v); };
    let seed=9; const rnd=()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };
    const col=(r,g,b)=>new THREE.Color().setRGB(r/255,g/255,b/255,THREE.SRGBColorSpace);
    /* the ground and the rock face: one grid over the falls, rock where it is steep or wet, the park's lawn where it is not */
    const S=.4, nx=Math.ceil((FP[2]-FP[0])/S), ny=Math.ceil((FP[3]-FP[1])/S), W1=nx+1, Hh=new Float32Array(W1*(ny+1)), V=new Float32Array(W1*(ny+1)*3);
    for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){ const x=FP[0]+i*S, y=FP[1]+j*S, k=j*W1+i; Hh[k]=drawH(x,y); V[k*3]=X(x); V[k*3+1]=Hh[k]*M+G0+.006; V[k*3+2]=Z(y); }
    const use=(i,j)=>inFP(FP[0]+(i+.5)*S,FP[1]+(j+.5)*S), I=[], IG=[];
    const rockQ=(i,j)=>{ const k=j*W1+i, hs4=[Hh[k],Hh[k+1],Hh[k+W1],Hh[k+W1+1]], d=Math.max(...hs4)-Math.min(...hs4), x=FP[0]+(i+.5)*S, y=FP[1]+(j+.5)*S;
      return d>.32*S/.84*1.6||Math.min(...hs4)<WL+.25||mass(x,y)>.06&&nz(x/3,y/3,621)>.62||cutD(x,y)<1&&side(polar(x,y)[1])>.3; };
    for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){ if(!use(i,j))continue; const a=j*W1+i, b=a+1, c=a+W1, d=c+1; (rockQ(i,j)?I:IG).push(a,c,b,b,c,d); }
    let g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(V,3)); g.setIndex([...I,...IG]); g.addGroup(0,I.length,0); g.addGroup(I.length,IG.length,1);
    g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(W1*(ny+1)*2).map((_,q)=>q&1?-V[(q>>1)*3+2]/T:V[(q>>1)*3]/T),2)); g.computeVertexNormals();
    { const n=g.attributes.normal, p=g.attributes.position;   // the face broken into buttresses and ledges (only seen: you never stand on the face)
      for(let k=0;k<W1*(ny+1);k++){ const ny0=n.getY(k); if(ny0>.7)continue; const i=k%W1, j=(k/W1)|0, x=FP[0]+i*S, y=FP[1]+j*S, th=polar(x,y)[1], a=ss(.7,.3,ny0)*(.25+.75*ss(.2,.5,Math.abs(th)))*(Hh[k]>WL+.3?1:0);
        const hl=Math.hypot(n.getX(k),n.getZ(k))||1, h=Hh[k], e=((nz(th*7+3,h*.12,623)-.5)*3.6+(nz(x*.5+h*.3,y*.5-h*.25,625)-.5)*1.2+.3*Math.sin(h*2.7+nz(th*3,1,627)*4))*a*M;
        p.setX(k,p.getX(k)+n.getX(k)/hl*e); p.setZ(k,p.getZ(k)+n.getZ(k)/hl*e); } g.computeVertexNormals(); }
    { const n=g.attributes.normal, c=new Float32Array(W1*(ny+1)*3), A=col(94,90,82), B2=col(58,58,55), C3=col(122,109,88), MO=col(60,90,34), MO2=col(86,112,42), WE=col(42,44,39), SA=col(140,125,94), BE=col(79,90,60), q=new THREE.Color();
      for(let k=0;k<W1*(ny+1);k++){ const i=k%W1, j=(k/W1)|0, x=FP[0]+i*S, y=FP[1]+j*S, h=Hh[k], up=n.getY(k), n1=nz(x/2.5,y/2.5,631), n2=nz(x*1.6+h,y*1.6-h,633);
        q.copy(A).lerp(B2,.5+.5*Math.sin(h*1.9+n1*5)).lerp(C3,ss(.55,.8,nz(h*.7,x*.05+y*.05,635))*.6); if(n2<.25)q.multiplyScalar(.72); q.multiplyScalar(.78+.4*nz(polar(x,y)[1]*40,h*.08,637));
        if(up>.15){ const m=ss(.3,.7,up)*ss(.35,.65,nz(x/1.6+h*.3,y/1.6,639)); q.lerp(MO.clone().lerp(MO2,n2),m*.85); }
        const wt=(1-ss(1.5,6,Math.hypot(x-(LIP[0]+3),y-C[1])))*ss(-1,2,h); q.lerp(WE,wt*.5);
        if(h<WL-.05){ const dd=ss(0,-3.2,h-WL); q.copy(SA).lerp(BE,dd*.8).multiplyScalar(1-dd*.45); }
        c[k*3]=q.r; c[k*3+1]=q.g; c[k*3+2]=q.b; } g.setAttribute('color',new THREE.BufferAttribute(c,3)); }
    g.computeBoundingSphere();
    const rockM=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
    const lawnM=new THREE.MeshLambertMaterial({map:MODS.land.material.map,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
    const ground=new THREE.Mesh(g,[rockM,lawnM]); ground.receiveShadow=true; ground.castShadow=true; ground.name='falls ground'; root.add(ground);
    if(WEEDS.lawnDrop)WEEDS.lawnDrop([X(FP[0]),Math.min(Z(FP[1]),Z(FP[3])),X(FP[2]),Math.max(Z(FP[1]),Z(FP[3]))]);
    /* the Polyfork pieces: rocks, moss, ferns, logs and lanterns, merged into a few still meshes */
    const model=k=>{ const d=D[k]; if(!d)return null; if(d.m)return d.m; const q=I16(d.p), n=d.n, Pp=new Float32Array(n*3), Cc=new Float32Array(n*3), cl=B64(d.c), cc=new THREE.Color();
      for(let i=0;i<n*3;i++)Pp[i]=(q[i]+32500)*d.sc+d.lo[i%3];
      let x0=1e9,x1=-1e9,y0=1e9,z0=1e9,z1=-1e9; for(let i=0;i<n*3;i+=3){ x0=Math.min(x0,Pp[i]); x1=Math.max(x1,Pp[i]); y0=Math.min(y0,Pp[i+1]); z0=Math.min(z0,Pp[i+2]); z1=Math.max(z1,Pp[i+2]); }
      for(let i=0;i<n*3;i+=3){ Pp[i]-=(x0+x1)/2; Pp[i+1]-=y0; Pp[i+2]-=(z0+z1)/2; cc.setRGB(cl[i]/255,cl[i+1]/255,cl[i+2]/255,THREE.SRGBColorSpace); Cc[i]=cc.r; Cc[i+1]=cc.g; Cc[i+2]=cc.b; }
      return d.m={P:Pp,C:Cc,I:d.i32?new Uint32Array(B64(d.i).buffer):U16(d.i),n}; };
    const bins={rock:[],plant:[],wood:[],glow:[]}, solids=[], m4=new THREE.Matrix4(), q4=new THREE.Quaternion(), e3=new THREE.Euler(), v3=new THREE.Vector3(), s3=new THREE.Vector3();
    const put=(k,x,y,hm,s,ry,bin='rock',o={})=>{ const md=model(k); if(!md)return; const yy=hm==null?drawH(x,y):hm; v3.set(X(x),yy*M+G0,Z(y)); if(Array.isArray(s))s3.set(s[0]*M,s[1]*M,s[2]*M); else s3.setScalar(s*M);
      m4.compose(v3,q4.setFromEuler(e3.set(o.rx||0,ry,o.rz||0)),s3); bins[bin].push([md,m4.clone()]); return v3.clone(); };
    const onFace=(th,hm)=>{ let lo=4, hi=R+CW+8; const pt=t=>[C[0]-Math.cos(th)*t,C[1]+Math.sin(th)*t]; for(let i=0;i<28;i++){ const m=(lo+hi)/2, [x,y]=pt(m); if(drawH(x,y)<hm)lo=m; else hi=m; } return pt(lo); };
    const ledgeAt=(th,hm)=>{ const [x0,y0]=onFace(th,hm), ux=-Math.cos(th), uy=Math.sin(th), gr=(x,y)=>Math.hypot(drawH(x+.6,y)-drawH(x-.6,y),drawH(x,y+.6)-drawH(x,y-.6));
      for(let k=0;k<14;k++){ const x=x0+ux*k*.4, y=y0+uy*k*.4; if(gr(x,y)<.45&&gr(x+ux*.8,y+uy*.8)<.45)return [x+ux*.7,y+uy*.7]; } return null; };
    const ROCKS=['outcrop','columns','boulder','basalt','cluster','fernboulder','lboulder','basalt','boulder','fernboulder'], LOWS=['fernclump','fern','mosscush','clubmoss','mosspatch','treefern'];
    seed=11; for(let i=0;i<150;i++){ const th=(rnd()*2-1)*1.9, hm=rnd()*HM*.9, L=ledgeAt(th,hm); if(!L||Math.abs(th)<.4)continue; const k=ROCKS[Math.floor(rnd()*ROCKS.length)], sc=(k==='outcrop'?.85:k==='columns'?.8:1.3)*(.55+rnd()*.6);
      put(k,L[0],L[1],drawH(L[0],L[1])-.6*sc,sc,Math.atan2(Math.sin(th),-Math.cos(th))+(rnd()-.5)*1.2);
      if(rnd()<.7){ const k2=LOWS[Math.floor(rnd()*LOWS.length)], a=rnd()*6.28, r=.9+rnd()*1.5, x=L[0]+Math.cos(a)*r, y=L[1]+Math.sin(a)*r; put(k2,x,y,null,k2==='mosscush'?.22+rnd()*.18:k2==='treefern'?.28+rnd()*.14:.8+rnd()*.5,rnd()*6.3,/moss/.test(k2)?'rock':'plant'); } }
    seed=23; for(let i=0;i<70;i++){ const x=BX[0]+2+rnd()*(BX[2]-BX[0]-4), y=BX[1]+2+rnd()*(BX[3]-BX[1]-4); if(mass(x,y)<.9||streamD(x,y)<2.4||Math.abs(y-STY)<2.2||Math.hypot(x-TARN[0],y-TARN[1])<TARN[2]+1.5)continue;
      const k=rnd()<.45?ROCKS[Math.floor(rnd()*ROCKS.length)]:LOWS[Math.floor(rnd()*LOWS.length)]; put(k,x,y,drawH(x,y)-.25,ROCKS.includes(k)?.6+rnd()*.9:k==='treefern'?.35+rnd()*.2:k==='mosscush'?.3+rnd()*.3:1+rnd()*.5,rnd()*6.3,ROCKS.includes(k)||/moss/.test(k)?'rock':'plant'); }
    // the lip's cap stones, the basalt at the pool's back corners, rocks in the shallows
    { const [lx,ly]=LIP, hl=drawH(lx-1,ly); put('outcrop',lx+.6,ly-3.1,hl-1.8,[1.3,.9,1.2],.3); put('outcrop',lx+.6,ly+3.2,hl-1.9,[1.3,.9,1.2],2.3); put('basalt',lx+1.4,ly-2.1,hl-1,1.1,.8); put('basalt',lx+1.4,ly+2.2,hl-1.05,1,2.5);
      for(const s of [-1,1]){ const [x,y]=onFace(s*1.2,0); put('columns',x,y,WL-1.6,1.4,s); } }
    seed=31; for(let i=0;i<40;i++){ const a=rnd()*6.28, r=R+.5+rnd()*4, x=C[0]+Math.cos(a)*r, y=C[1]+Math.sin(a)*r; if(cutD(x,y)<-.3||cutD(x,y)>3.5||mass(x,y)>.2||rillD(x,y)[0]<1.6||Math.abs(y-STY)<2)continue;
      const k=['boulder','lboulder','medrock','basalt','fernboulder','smallrock','cluster','fernclump','reeds','cattail','fern'][Math.floor(rnd()*11)], pl=/fern$|reeds|cattail/.test(k)&&k!=='fernboulder';
      put(k,x,y,drawH(x,y)-(pl?0:.3),k==='smallrock'?1.8:k==='cattail'?1.3+rnd()*.5:pl?1+rnd()*.5:.7+rnd()*1.1,rnd()*6.3,pl?'plant':'rock'); }
    for(let i=0;i<14;i++){ const t=rnd(), [ax,ay]=RILL[0], [bx,by]=RILL[1], x=ax+(bx-ax)*t, y=ay+(by-ay)*t+.45*Math.sin(x*.7+1)+(rnd()<.5?-1:1)*(1+rnd()*1.2); const k=['reeds','cattail','smallrock','medrock','mosspatch'][Math.floor(rnd()*5)]; put(k,x,y,null,k==='cattail'?1.2:1,rnd()*6.3,/rock|moss/.test(k)?'rock':'plant'); }
    put('lilies',C[0]+R*.55,C[1]-R*.45,WL-.06,1.3,.3,'plant'); put('lilies',C[0]+R*.7,C[1]+R*.3,WL-.06,1,2.2,'plant'); put('lilies',LB[0]+1.5,LB[1]-1,WL-.06,1.1,1,'plant');
    put('pebbles',C[0]+R*.75,C[1]-1.5,WL-.35,1.4,.2); put('pebbles',RILL[0][0]+2,C[1],WL-.3,1,1.4);
    { const t0=JR1+.8, t1=(JR0+JR1)/2+.6; for(const [t,s] of [[t0,[1.1,.75,1.1]],[t1,[1.2,.8,1.4]]]){ const x=C[0]+JD[0]*t, y=C[1]+JD[1]*t, ex=C[0]+JD[0]*JR0, ey=C[1]+JD[1]*JR0, ht=top(ex,ey)*mass(ex,ey)-1; put('outcrop',x,y,ht-2.05*s[1]+.05,s,Math.atan2(JD[1],JD[0])); } }
    // the logs and roots by the water and on top
    put('fungilog',C[0]+R+2.5,C[1]-R*.75,null,.9,1.1,'wood'); put('hollowlog',BX[0]+4,BX[1]+5,drawH(BX[0]+4,BX[1]+5)-.2,1,.4,'wood'); put('mossstump',TARN[0]+3.5,TARN[1]-3.5,null,1.1,0,'wood'); put('roots',C[0]+R+1.5,C[1]+R*.8,null,1.3,2.2,'wood');
    // the stairs, the bridge, the cairns
    for(let x=STX0-1;x>STX1;x-=2.6)put('mosssteps',x,STY,drawH(x,STY)-.9,[.95,1,.8],-Math.PI/2);
    put('ropebridge',BRX,LIP[1]+.35*Math.sin(BRX*.9),drawH(BRX,LIP[1]+2.4)-.15,[1.25,1,1],Math.PI/2,'wood');
    const cairns=[[LIP[0]-4.5,LIP[1]+5],[LIP[0]-6,LIP[1]+6.2],[LIP[0]-5,LIP[1]-5.5]];
    // vines down the top edge
    seed=61; for(let i=0;i<12;i++){ const th=(rnd()*2-1)*1.3; if(Math.abs(th)<.25)continue; const [x,y]=onFace(th,top(C[0]-Math.cos(th)*(R+CW),C[1]+Math.sin(th)*(R+CW))-.7); put('vine',x,y,null,[1.2,1.5+rnd()*2,1.2],Math.atan2(Math.sin(th),-Math.cos(th))+Math.PI/2,'plant'); }
    // glowing mushrooms in the rocks (they glow at night), mushrooms on the shore
    seed=53; for(let i=0;i<50;i++){ const th=(rnd()*2-1)*1.7, L=ledgeAt(th,rnd()*HM*.75); if(!L)continue; put('glowmush',L[0],L[1],null,.035+rnd()*.03,rnd()*6,'glow'); }
    for(let i=0;i<16;i++){ const a=rnd()*6.28, r=R+1+rnd()*5, x=C[0]+Math.cos(a)*r, y=C[1]+Math.sin(a)*r; if(cutD(x,y)<.4||mass(x,y)>.15)continue; put('mush',x,y,null,1.4+rnd()*1.4,rnd()*6,'plant'); }
    // the lanterns (lit from dusk): the stairs' foot and head, the pool's shore, the lip
    const LAN=[[STX0+.3,STY-2.2],[STX1+1,STY-2.6],[C[0]+R+2.2,C[1]+R*.55],[C[0]+R+2.5,C[1]-R*.6],[LIP[0]-3,LIP[1]-3.2]], lamp=[];
    for(const [x,y] of LAN){ const at=put('lantern',x,y,null,1.1,rnd()*6); if(at)lamp.push([at.x,at.y+1.08*M,at.z]); }
    const merge=(list,mat,cast)=>{ if(!list.length)return null; let n=0, ni=0; for(const [md] of list){ n+=md.n; ni+=md.I.length; } const Pq=new Float32Array(n*3), Cq=new Float32Array(n*3), Iq=new Uint32Array(ni), vv=new THREE.Vector3(); let o=0, oi=0;
      for(const [md,mm] of list){ for(let i=0;i<md.n;i++){ vv.set(md.P[i*3],md.P[i*3+1],md.P[i*3+2]).applyMatrix4(mm); Pq[(o+i)*3]=vv.x; Pq[(o+i)*3+1]=vv.y; Pq[(o+i)*3+2]=vv.z; } Cq.set(md.C,o*3); for(let i=0;i<md.I.length;i++)Iq[oi+i]=md.I[i]+o; o+=md.n; oi+=md.I.length; }
      let gg=new THREE.BufferGeometry(); gg.setAttribute('position',new THREE.BufferAttribute(Pq,3)); gg.setAttribute('color',new THREE.BufferAttribute(Cq,3)); gg.setIndex(new THREE.BufferAttribute(Iq,1)); gg=gg.toNonIndexed(); gg.computeVertexNormals(); gg.computeBoundingSphere();
      const me=new THREE.Mesh(gg,mat); me.castShadow=cast; me.receiveShadow=true; root.add(me); FALLS.tris=(FALLS.tris||0)+ni/3; return me; };
    const mossM=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});
    mossM.onBeforeCompile=sh=>{ sh.vertexShader='varying vec3 vWN; varying vec3 vWQ;\n'+sh.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n vWQ=(modelMatrix*vec4(transformed,1.)).xyz; vWN=normalize(mat3(modelMatrix)*objectNormal);');
      sh.fragmentShader='varying vec3 vWN; varying vec3 vWQ;\n float fh(vec2 p){ return fract(sin(dot(floor(p),vec2(127.1,311.7)))*43758.5453); }\n'+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        vec2 mp=vWQ.xz/${T.toFixed(4)}; float n=fh(mp*1.3)*.5+fh(mp*3.1+7.)*.5, m=smoothstep(.3,.75,vWN.y+(n-.5)*.6);
        diffuseColor.rgb*=vec3(.62,.61,.57); diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(.12,.21,.05),vec3(.22,.32,.07),fh(mp*5.)),m*.88);`); };
    mossM.customProgramCacheKey=()=>'fallsmoss';
    const glowM=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true,color:0x8a8a80,emissive:0x2ff0c8,emissiveIntensity:0});
    merge(bins.rock,mossM,true); merge(bins.wood,mossM,true); merge(bins.plant,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true,side:THREE.DoubleSide}),true); const glow=merge(bins.glow,glowM,false);
    /* the water: the pool still (the brook's own still water), the rill and the stream on top running (the brook's water) */
    const water=(cells,lv,mk)=>{ const pos=[], ad=[], fl=[]; for(const [x,y,s] of cells){ const qd=[[x,y],[x+s,y],[x+s,y+s],[x,y],[x+s,y+s],[x,y+s]]; for(const [a,b] of qd){ pos.push(X(a),lv(a,b)*M+G0,Z(b)); ad.push(Math.max(0,(lv(a,b)-drawH(a,b))/2.4)); if(mk)fl.push(...mk(a,b)); } }
      const gw=new THREE.BufferGeometry(); gw.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); gw.setAttribute('aD',new THREE.Float32BufferAttribute(ad,1)); if(mk)gw.setAttribute('aF',new THREE.Float32BufferAttribute(fl,4)); gw.computeVertexNormals(); gw.computeBoundingSphere(); gw.userData.still=true; return gw; };
    const cellsOf=(f,s=.5,b=FP)=>{ const o=[]; for(let y=b[1];y<b[3];y+=s)for(let x=b[0];x<b[2];x+=s)if(f(x+s/2,y+s/2)||f(x,y)||f(x+s,y+s)||f(x+s,y)||f(x,y+s))o.push([x,y,s]); return o; };
    const poolG=water(cellsOf((x,y)=>inFP(x,y)&&cutD(x,y)<.6&&drawH(x,y)<WL+.05&&rillD(x,y)[0]>.3,.5,[C[0]-R-4,LB[1]-LB[2]-1,C[0]+R+2,C[1]+R+3]),()=>WL);
    const poolMe=new THREE.Mesh(poolG,new THREE.MeshBasicMaterial()); poolMe.renderOrder=1; root.add(poolMe); BROOK.still([poolMe]);
    const runs=[]; if(BROOK.flowMat){
      const rl=(x,y)=>{ const [d,t]=rillD(x,y); return WL-.03-t*.06; }, rc=cellsOf((x,y)=>{ const [d,t]=rillD(x,y); return d<.85&&t>0&&t<1&&cutD(x,y)>-.2; },.35,[RILL[0][0]-1,C[1]-2,RILL[1][0]+.5,C[1]+2]);
      const rg=water(rc,rl,(x,y)=>{ const [d,t]=rillD(x,y); return [t*14,Math.min(1,d/.85),Math.max(0,(rl(x,y)-drawH(x,y)))*2.4+.22,1.6]; }); const rme=new THREE.Mesh(rg,BROOK.flowMat()); rme.renderOrder=1; root.add(rme); runs.push(rme);
      const ul=(x,y)=>{ const d=streamD(x,y), td=Math.hypot(x-TARN[0],y-TARN[1]); return td<TARN[2]?top(TARN[0],TARN[1])*mass(TARN[0],TARN[1])-.55:drawH(x,y)+.32*(1-ss(.4,.9,d)); };
      const uc=cellsOf((x,y)=>mass(x,y)>.35&&(streamD(x,y)<.8||Math.hypot(x-TARN[0],y-TARN[1])<TARN[2]-.2)&&x<LIP[0]+.9,.3,[TARN[0]-TARN[2]-1,C[1]-TARN[2]-2,LIP[0]+1.2,C[1]+TARN[2]+2]);
      const ug=water(uc,(x,y)=>{ const td=Math.hypot(x-TARN[0],y-TARN[1]); return td<TARN[2]?ul(x,y):Math.min(ul(TARN[0],TARN[1]),drawH(x,y)+.3); },(x,y)=>{ const td=Math.hypot(x-TARN[0],y-TARN[1]), t=(x-TARN[0])/(LIP[0]-TARN[0]); return td<TARN[2]?[0,.5,.8,0]:[t*9,Math.min(1,streamD(x,y)/.8),.5,2.2+1.4*t]; });
      const ume=new THREE.Mesh(ug,BROOK.flowMat()); ume.renderOrder=1; root.add(ume); runs.push(ume); }
    FLOW.add({name:'falls',kind:'lake',shown:()=>root.visible,box:[X(FP[0]),Math.min(Z(FP[1]),Z(FP[3])),X(FP[2]),Math.max(Z(FP[1]),Z(FP[3]))],has:(x,z)=>FALLS.wet(x,z),bed:(x,z)=>drawH(mx(x),my(z))*M+G0,rest:()=>WL*M+G0});
    /* the falls: three sheets on a thrown arc, and side trickles over the ledges */
    const U={uT:{value:0},uDay:{value:1},uSun:{value:new THREE.Color(1,1,1)},uSky:{value:new THREE.Color(.5,.62,.75)}};
    const fallM=layer=>{ const m=new THREE.ShaderMaterial({uniforms:{...U,uL:{value:layer}},transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false,
      vertexShader:'uniform float uT,uL; varying vec2 vU; void main(){ vU=uv; vec3 p=position; p.z+=sin(uT*3.1+uv.y*9.+uL*2.)*.05*uv.y*'+M.toFixed(4)+'; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }',
      fragmentShader:`uniform float uT,uL,uDay; uniform vec3 uSun,uSky; varying vec2 vU;
        float h1(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); } float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y); }
        float fb(vec2 p){ float s=0.,a=.5; for(int i=0;i<4;i++){ s+=a*vn(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return s; }
        void main(){ float v=vU.y, u=vU.x, sp=2.2+uL*.6, a=fb(vec2(u*16.+uL*7.,v*2.2-uT*sp)), b=fb(vec2(u*38.+uL*3.,v*5.-uT*sp*1.7));
          float rag=.06+.1*fb(vec2(v*6.-uT,uL*5.))+.12*v, edge=smoothstep(0.,rag,u)*smoothstep(1.,1.-rag,u), aer=smoothstep(0.,.45,v), holes=smoothstep(.2,.5,b+.5-.28*smoothstep(.55,1.,v));
          float al=edge*mix(.8,.97,aer)*mix(1.,holes,smoothstep(.4,.95,v)*.7)*(.6+.4*a)*smoothstep(1.,.96,v);
          vec3 am=uSky*(.3+.6*uDay); vec3 gl=mix(vec3(.05,.2,.18),vec3(.55,.68,.62),.35)*(am*1.2+uSun*.3), fo=am*1.5+uSun*.55*uDay+vec3(.08);
          vec3 c=mix(gl,fo,clamp(aer*.6+smoothstep(.45,.8,b)*.6+a*.25,0.,1.))*(1.-uL*.15); c+=uSun*smoothstep(.8,.95,b)*.3*uDay;
          c=floor(c*24.+.5)/24.; gl_FragColor=vec4(c,al); }`}); m.customProgramCacheKey=()=>'fallsheet'; return m; };
    const lipY=drawH(LIP[0]-1.2,LIP[1])+.25, sheet=(x0,yt,yb,w0,w1,vz,lay,cy=LIP[1])=>{ const NU=24, NV=72, pos=[], uv=[], idx=[], H0=yt-yb, Tt=Math.sqrt(2*H0/9.8);
      for(let j=0;j<=NV;j++){ const v=j/NV, t=v*Tt; for(let i=0;i<=NU;i++){ const u=i/NU, cu=u*2-1, w=mix(w0,w1,Math.pow(v,.8)), h=yt-.5*9.8*t*t, fx=x0+(vz*t*(1-.3*cu*cu)+lay*.25+.15*Math.sin(cu*3+lay))/.84, fy=cy+cu*w/2/.84+.3*Math.sin(v*4+cu*2);
        pos.push(X(fx),h*M+G0,Z(fy)); uv.push(u,v); if(i<NU&&j<NV){ const a=j*(NU+1)+i; idx.push(a,a+NU+1,a+1,a+1,a+NU+1,a+NU+2); } } }
      const gs=new THREE.BufferGeometry(); gs.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); gs.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); gs.setIndex(idx); gs.computeBoundingSphere(); return gs; };
    const sheets=[]; for(const [l,w0,w1,vz] of [[0,4.6,7.4,3],[1,3.8,6.6,2.6],[2,5,8.2,3.3]]){ const me=new THREE.Mesh(sheet(LIP[0]+.6,lipY,WL-.1,w0,w1,vz,l*(l===1?-1:1)),fallM(l)); me.renderOrder=3+(l===1?-1:l); root.add(me); sheets.push(me); }
    const FZ=LIP[0]+.6+3*Math.sqrt(2*(lipY-WL)/9.8)*.85/.84;   // where the water comes down
    for(const s of [-1,1]){ const th=s*.75, [x,y]=onFace(th,HM*.5); const yt=drawH(x-.6,y)+.2, me=new THREE.Mesh(sheet(x-.3,yt,WL,.7,1.1,.7,0,y),fallM(1.5)); me.renderOrder=3; root.add(me); sheets.push(me); }
    /* spray, mist and the rainbow: near only */
    const soft=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const x=c.getContext('2d'), gr=x.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.45,'rgba(255,255,255,.4)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })();
    const pts=(N,vs,blend)=>{ const gp=new THREE.BufferGeometry(), sd=new Float32Array(N*4); for(let i=0;i<N*4;i++)sd[i]=hs(i,7.3); gp.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*3),3)); gp.setAttribute('seed',new THREE.BufferAttribute(sd,4));
      const pm=new THREE.ShaderMaterial({uniforms:{...U,map:{value:soft},uPx:{value:1},uOp:{value:1}},transparent:true,depthWrite:false,fog:false,blending:blend||THREE.NormalBlending,vertexShader:vs,
        fragmentShader:'uniform sampler2D map; uniform float uDay,uOp; uniform vec3 uSun,uSky; varying float vA; void main(){ gl_FragColor=vec4(uSky*(.35+.6*uDay)*1.1+uSun*.3*uDay+vec3(.04),texture2D(map,gl_PointCoord).a*vA*uOp); }'});
      const p=new THREE.Points(gp,pm); p.frustumCulled=false; p.renderOrder=6; near.add(p); return p; };
    const WX0=X(FZ), WZ0=Z(C[1]), WY=WL*M+G0, MM=M.toFixed(4);
    const spray=pts(900,`uniform float uT,uPx; attribute vec4 seed; varying float vA; void main(){ float L=1.1+seed.w*1.4, ph=fract(uT/L+seed.x), a=ph*L, an=seed.y*6.283, r=seed.z*2.;
      vec3 p0=vec3(${WX0.toFixed(3)}+cos(an)*r*${MM}*.9,${WY.toFixed(3)},${WZ0.toFixed(3)}+sin(an)*r*${MM}*1.4), v=vec3(cos(an)*(1.+seed.w*2.)+.9,2.+seed.z*5.5,sin(an)*(1.+seed.w*2.4))*${MM};
      vec3 p=p0+v*a-vec3(0.,4.9*a*a*.55*${MM},0.); p.y=max(p.y,${WY.toFixed(3)}); vA=(1.-ph)*smoothstep(0.,.08,ph)*.35; vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=(.12+.5*ph)*(.6+seed.w)*uPx*${MM}/(-mv.z); }`);
    const mist=pts(40,`uniform float uT,uPx; attribute vec4 seed; varying float vA; void main(){ float ph=fract(uT*(.025+seed.x*.035)+seed.y), an=seed.z*6.283, r=(1.5+seed.w*5.)*(1.+ph);
      vec3 p=vec3(${WX0.toFixed(3)}+(cos(an)*r*.6+ph*4.)*${MM},${WY.toFixed(3)}+(.3+ph*10.)*${MM},${WZ0.toFixed(3)}+sin(an)*r*${MM}); vA=sin(ph*3.1416)*.055; vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=min(420.,(3.+5.*ph)*uPx*${MM}/(-mv.z)); }`);
    const lipS=pts(300,`uniform float uT,uPx; attribute vec4 seed; varying float vA; void main(){ float ph=fract(uT*.6+seed.x); vec3 p=vec3(${X(LIP[0]+.6).toFixed(3)}+(ph*1.8+seed.z*.5)*${MM},${(lipY*M+G0).toFixed(3)}-ph*ph*6.*${MM},${Z(LIP[1]).toFixed(3)}+(seed.y-.5)*4.6*${MM});
      vA=(1.-ph)*.28; vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=(.08+.25*ph)*uPx*${MM}/(-mv.z); }`);
    const bow=(()=>{ const c=document.createElement('canvas'); c.width=256; c.height=128; const x=c.getContext('2d'), cs=['#ff3b30','#ff9500','#ffcc00','#34c759','#32ade6','#5856d6','#af52de'];
      for(let i=0;i<7;i++){ x.beginPath(); x.lineWidth=5; x.strokeStyle=cs[i]; x.arc(128,128,100-i*4,Math.PI,0); x.stroke(); }
      x.globalCompositeOperation='destination-in'; const gr=x.createLinearGradient(0,0,0,128); gr.addColorStop(0,'rgba(0,0,0,.9)'); gr.addColorStop(.8,'rgba(0,0,0,.4)'); gr.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=gr; x.fillRect(0,0,256,128);
      const me=new THREE.Mesh(new THREE.PlaneGeometry(12*M,6*M),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0,side:THREE.DoubleSide,fog:false}));
      me.position.set(X(FZ+5),WY+2.6*M,WZ0); me.renderOrder=8; near.add(me); return me; })();
    /* the lanterns' light and the mushrooms' glow at night */
    const recs=lamp.map(([x,y,z])=>{ const l=new THREE.PointLight(new THREE.Color(1,.78,.48),30,10*T,1.6); l.position.set(x,y,z); l.userData.i0=30; l.userData.grp=root; l.intensity=0; l.castShadow=false; LITE.recs.push(l); return l; });
    const heads=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(lamp.flat(),3)),new THREE.PointsMaterial({map:soft,color:0xffc070,size:1.6*T,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));
    heads.visible=false; heads.raycast=()=>{}; root.add(heads); LITE.t=0;
    const lit=()=>{ let d=false; try{ d=CLOCK.dark(); }catch(_){ } heads.visible=d; for(const l of recs)l.intensity=d?l.userData.i0*(DN?DN.lk:1):0; glowM.emissiveIntensity=d?1.4:0; FALLS.lit=d; };
    lit(); SYS.every(lit,2000,'089b-falls lights');
    /* the rope swing: hung from a bough off big tree A over the pool's south lobe; you grab it on the shore and it swings you out over the water */
    { const TA=(LEVEL.bigTrees||[]).filter(o=>o.kind&&o.kind!=='G').map(o=>[o.x-ox,o.y-oy]).sort((a,b)=>Math.hypot(a[0]-LB[0],a[1]-LB[1])-Math.hypot(b[0]-LB[0],b[1]-LB[1]))[0]||[LB[0]+8,LB[1]];
      const dl=Math.hypot(TA[0]-LB[0],TA[1]-LB[1])||1, DX=(TA[0]-LB[0])/dl, DY=(TA[1]-LB[1])/dl, SWP=[LB[0]+DX*(LB[2]-.4),LB[1]+DY*(LB[2]-.4)], BRH=8.6, L=BRH-WL-2.4;
      const piv=new THREE.Vector3(X(SWP[0]),BRH*M+G0,Z(SWP[1])), out=new THREE.Vector3(X(SWP[0]-DX)-piv.x,0,Z(SWP[1]-DY)-piv.z).normalize();   // out: toward the water
      const yaw=new THREE.Group(), arm=new THREE.Group(); yaw.position.copy(piv); yaw.rotation.y=Math.atan2(-out.z,out.x); yaw.add(arm); root.add(yaw);
      const rope=new THREE.MeshLambertMaterial({color:0xb9a17a}); for(const dz of [-.22,.22]){ const r=new THREE.Mesh(new THREE.CylinderGeometry(.02*M,.02*M,L*M,5),rope); r.position.set(0,-L*M/2,dz*M); arm.add(r); }
      const seat=new THREE.Mesh(new THREE.BoxGeometry(.25*M,.05*M,.6*M),new THREE.MeshLambertMaterial({color:0x6b4a2e})); seat.position.y=-L*M; arm.add(seat); arm.traverse(o=>{ if(o.isMesh)o.castShadow=true; });
      const tw=new THREE.Vector3(X(TA[0]),piv.y+.4*M,Z(TA[1])), bl=tw.distanceTo(piv)+.6*M, bough=new THREE.Mesh(new THREE.CylinderGeometry(.13*M,.26*M,bl,7),new THREE.MeshLambertMaterial({color:0x4a3a2c}));
      bough.position.copy(piv).lerp(tw,.5); bough.lookAt(tw); bough.rotateX(Math.PI/2); bough.castShadow=true; root.add(bough);
      const hit=new THREE.Mesh(new THREE.BoxGeometry(.9*M,1.4*M,.9*M),new THREE.MeshBasicMaterial({visible:false})); hit.position.y=-L*M+.5*M; arm.add(hit);
      const POSE={k:'zip',z:0,sway:0}; let ang=0, av=0;
      RIDE.kind('ropeswing',{name:'THE ROPE SWING',world:true,dry:true,hop:false,ease:30,onSay:'YOU GRAB THE ROPE. SPACE LETS GO.',make:()=>new THREE.Group(),
        on:R=>{ ang=0; av=1.3; R.t=0; R.y=null; }, pose:()=>POSE, floor:(g,R)=>R.y==null?g:R.y, off:()=>{ arm.rotation.z=0; },
        step:(R,dt)=>{ R.t+=dt; av+=-9.8/L*Math.sin(ang)*dt; if(R.t<2.5&&av*Math.cos(ang)>0)av+=.5*dt*Math.sign(av); ang+=av*dt; arm.rotation.z=ang;
          const o=Math.sin(ang)*L*M; pos.x=piv.x+out.x*o; pos.z=piv.z+out.z*o; R.y=piv.y-Math.cos(ang)*L*M-1.25*M; R.lift=0; SHARED.heading=Math.atan2(out.x,out.z); POSE.sway=ang*.3; st.ride=POSE;
          if(keys.has(' ')||R.t>12){ RIDE.off(o>1.5*M?'YOU LET GO AND DROP INTO THE POOL.':'YOU LET GO.'); if(SFX.play&&o>1.5*M)SFX.play('splash',{vol:.7}); } return true; }});
      UI.thing({name:'THE ROPE SWING',obj:hit,reach:1.6*T,near:2.6*T,tall:1.4*T,act:()=>{ if(!RIDE.on)RIDE.mount('ropeswing'); }}); FALLS.swing={piv,out,L}; }
    /* the cairns on the lip (owner, 10 Nov 2026: "add ... cairn building"): double click one to set a stone on it; its stones are the section's (world cairn:<n>, kept on the server, the same for everyone); past twelve it tumbles back to its base */
    { const md=model('smallrock'), sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.BufferAttribute(md.P,3)); sg.setAttribute('color',new THREE.BufferAttribute(md.C,3)); sg.setIndex(new THREE.BufferAttribute(md.I,1));
      const stoneG=sg.toNonIndexed(); stoneG.computeVertexNormals(); const MAXC=12, CR=FALLS.cairns=[];
      cairns.forEach(([x,y],i)=>{ const k='cairn:'+i, g=new THREE.Group(); g.position.set(X(x),drawH(x,y)*M+G0,Z(y)); root.add(g);
        const draw=v=>{ const n=Math.max(0,Math.floor(+v||0))%(MAXC+1); g.clear(); let h=0; for(let j=0;j<3+n;j++){ const f=(1.7-j*.085)*(.9+.2*hs(i*31+j,1)), me=new THREE.Mesh(stoneG,mossM);
            me.scale.set(f*M,f*M*.9,f*M); me.position.set((hs(i,j)-.5)*.05*M,h*M,(hs(j,i)-.5)*.05*M); me.rotation.y=hs(i*7+j,3)*6.28; me.castShadow=true; me.receiveShadow=true; g.add(me); h+=.22*f*.82; } CR[i]={k,n,h}; };
        draw((ONLINE.world||{})[k]);
        const hb=new THREE.Mesh(new THREE.BoxGeometry(.9*M,1.2*M,.9*M),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(g.position.x,g.position.y+.6*M,g.position.z); root.add(hb);
        UI.thing({name:'A CAIRN',obj:hb,reach:1.4*T,near:2.4*T,tall:1.2*T,act:()=>{ const was=Math.floor(+(ONLINE.world||{})[k]||0)%(MAXC+1); ONLINE.add(k,1); draw((ONLINE.world||{})[k]); if(SFX.play)SFX.play('step_stone',{vol:.5,pitch:.8});
          SAY(was===MAXC?'THE CAIRN TUMBLES DOWN TO ITS BASE. YOU SET THE FIRST STONE AGAIN.':'YOU SET A STONE ON THE CAIRN. IT STANDS '+(4+was)+' HIGH.','#c8c2b0'); }});
        SYS.add('world',(kk,v)=>{ if(kk===k)draw(v); },'089b-falls cairn'); }); }
    /* toss a coin: a dollar into the pool for a wish */
    { const hb=new THREE.Mesh(new THREE.BoxGeometry(1.2*T,.6*T,1.2*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(C[0]+R-1.2),WY,Z(C[1]-1)); root.add(hb);
      UI.thing({name:'TOSS A COIN',obj:hb,reach:3*T,near:4*T,tall:.6*T,act:()=>{ if(!INV||INV.cash<1)return SAY('YOU HAVE NO COIN TO TOSS.','#c8a090'); INV.cash-=1; if(SFX.play)SFX.play('splash',{vol:.25,pitch:1.8}); SAY('YOU TOSS A DOLLAR IN AND MAKE A WISH.','#9fd6dc'); }}); }
    /* the roar: one placed sound at the foot of the falls (a recorded loop held as a voice), louder as you come near */
    let roar=null; const sound=()=>{ const c=SFX.live&&SFX.live(), d=Math.hypot(pos.x-X(FZ),pos.z-WZ0)/M, on=!!c&&SFX.on&&d<90&&root.visible;
      if(!on){ if(roar){ roar.set(0,1); } return; } if(!roar)roar=SFX.voice('falls'); if(roar)roar.set(Math.min(.9,14/(d+8)),1,{x:X(FZ),y:WY+3*M,z:WZ0}); };
    /* each frame near: the water's light, the spray, near only */
    let cullT=0, sT=0;
    SYS.add('places',dt=>{ if(!FALLS.ready)return; const up=SHARED.LVL==='up'&&P.in!==false, d=Math.hypot(pos.x-X(C[0]),pos.z-Z(C[1]))/T; if((cullT-=dt)<=0){ cullT=.4; root.visible=up&&d<300; near.visible=root.visible&&d<90; }
      if(!root.visible)return; U.uT.value+=dt; if(CLOCK.sun){ U.uSun.value.copy(CLOCK.sun.color).multiplyScalar(Math.min(1.2,CLOCK.sun.intensity)); U.uDay.value=Math.max(.15,Math.min(1,(CLOCK.elev()+4)/14)); } if(SKY&&SKY.U)U.uSky.value.copy(SKY.U.uH.value);
      const px=renderer.domElement.height; for(const p of [spray,mist,lipS])p.material.uniforms.uPx.value=px;
      bow.lookAt(SHARED.cam?SHARED.cam.position.x:pos.x,bow.position.y,SHARED.cam?SHARED.cam.position.z:pos.z); bow.material.opacity=Math.max(0,Math.min(1,(CLOCK.elev?CLOCK.elev():0)/20))*.3*(FALLS.lit?0:1);
      if((sT-=dt)<=0){ sT=.5; try{ sound(); }catch(_){ } } },'089b-falls');
    FALLS.root=root; FALLS.tris=(FALLS.tris||0)+g.index.count/3; FALLS.ready=true; };
  PARK.later(go); } }
