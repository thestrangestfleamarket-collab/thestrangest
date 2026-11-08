// THE STALLS: STALL builds the market stalls and the mushrooms and goods laid out on them.
import {THREE} from './003-shx.js';
import {CLOCK, NPCS, PARK, WEEDS} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, LEVEL, MAPG, SOL, STORE, TILE, ZU} from './006-map-pre.js';
const STALL=(()=>{ const M=TILE/.84, VS=ZU*24/TILE, mv=m=>m*M*VS;
  const MUSH={
    button:{s:.035,h:1.2,f:(p,s)=>{ p('cyl',0xe8e2d4,0,s*.4,0,s*.35,s*.8,s*.35); p('cap',0xf2ede2,0,s*.7,0,s,s*.7,s); }},
    puffball:{s:.045,h:1.6,f:(p,s)=>{ p('ball',0xf4f0e6,0,s*.8,0,s,s*.85,s); }},
    chanterelle:{s:.04,h:1.2,f:(p,s)=>{ p('cone',0xe0a032,0,s*.6,0,s,s*1.2,s,Math.PI); }},
    redcap:{s:.045,h:1.6,f:(p,s,r)=>{ p('cyl',0xeee6d6,0,s*.5,0,s*.3,s,s*.3); p('cap',0xc42a20,0,s*.95,0,s,s*.6,s); for(let k=0;k<2;k++){ const a=r+k*3.1; p('ball',0xf6f0e0,Math.cos(a)*s*.55,s*1.3,Math.sin(a)*s*.55,s*.16,s*.1,s*.16); } }},
    inkcap:{s:.03,h:1.6,f:(p,s)=>{ p('cyl',0xe6e0d0,0,s*.8,0,s*.8,s*3.4,s*.8,Math.PI/2); }},
    bolete:{s:.055,h:1.4,f:(p,s)=>{ p('cyl',0xd8c4a0,0,s*.45,0,s*.45,s*.9,s*.45); p('cap',0x7a4a24,0,s*.85,0,s,s*.55,s); }},
    morel:{s:.03,h:2.2,f:(p,s)=>{ p('cyl',0xe2d4b4,0,s*.35,0,s*.4,s*.7,s*.4); p('cone',0x5e4428,0,s*1.5,0,s*.75,s*1.8,s*.75); }},
    moonglow:{s:.035,h:1.5,f:(p,s)=>{ p('cyl',0x9fe8f0,0,s*.5,0,s*.3,s,s*.3,0,1); p('cap',0x48d8f0,0,s*.9,0,s,s*.6,s,0,1); }},
    flyagaric:{s:.05,h:1.6,f:(p,s,r)=>{ p('cyl',0xf2ece0,0,s*.5,0,s*.32,s,s*.32); p('cap',0xd8261a,0,s*.95,0,s,s*.6,s); for(let k=0;k<3;k++){ const a=r+k*2.1; p('ball',0xfaf6ec,Math.cos(a)*s*.5,s*1.3,Math.sin(a)*s*.5,s*.14,s*.08,s*.14); } }},
    trumpet:{s:.035,h:1.8,f:(p,s)=>{ p('cone',0x2a2428,0,s*.8,0,s*.8,s*1.6,s*.8,Math.PI); }},
    ghostcap:{s:.04,h:1.5,f:(p,s)=>{ p('cyl',0xe8ddf6,0,s*.5,0,s*.28,s,s*.28,0,1); p('cap',0xc8a8ff,0,s*.95,0,s,s*.7,s,0,1); }},
    ember:{s:.035,h:1.6,f:(p,s)=>{ p('cyl',0xffd8a0,0,s*.5,0,s*.3,s,s*.3,0,1); p('cone',0xff8a2a,0,s*1.1,0,s*.8,s*.9,s*.8,0,0,1); }},
    oyster:{s:.05,h:1,f:(p,s,r)=>{ p('cap',0xb8b4aa,0,s*.4,0,s,s*.3,s*.7,.5); p('cap',0x9a968c,s*.5,s*.6,0,s*.7,s*.25,s*.5,.6); }},
    violet:{s:.035,h:1.5,f:(p,s)=>{ p('cyl',0x8a5ab8,0,s*.5,0,s*.28,s,s*.28); p('cap',0x6a2a9a,0,s*.9,0,s,s*.55,s); }},
    sulphur:{s:.05,h:1,f:(p,s)=>{ p('cap',0xf0b828,0,s*.4,0,s,s*.3,s*.8,.4); p('cap',0xe8781e,0,s*.75,0,s*.8,s*.25,s*.6,.4); }}};
  const VEG={
    tomato:{s:.04,h:1.7,f:(p,s)=>{ p('ball',0xcc3420,0,s*.85,0,s,s*.85,s); p('ball',0x3e8a2a,0,s*1.6,0,s*.35,s*.15,s*.35); }},
    pepper:{s:.045,h:2,f:(p,s,r,R)=>{ p('ball',[0x2f8a2a,0xd8b028,0xc8321e][Math.floor(R()*3)],0,s,0,s,s*1.1,s); }},
    carrot:{s:.02,h:2,f:(p,s)=>{ p('cone',0xe0742a,0,s,0,s,s*8,s,Math.PI/2); p('cone',0x4aa03a,0,s,-s*5,s*1.4,s*3,s*1.4,-Math.PI/2); }},
    corn:{s:.03,h:2,f:(p,s)=>{ p('cyl',0xe8c84a,0,s,0,s,s*6,s,Math.PI/2); p('cone',0x9ab04a,0,s,-s*3.8,s*1.3,s*2.5,s*1.3,-Math.PI/2); }},
    cabbage:{s:.075,h:1.7,f:(p,s)=>{ p('ball',0x8ac05a,0,s*.85,0,s,s*.85,s); p('cap',0x6aa040,0,s*.5,0,s*1.08,s*.55,s*1.08,Math.PI); }},
    eggplant:{s:.035,h:2,f:(p,s)=>{ p('ball',0x4a2a5a,0,s,0,s,s,s*2); p('cone',0x3a7a2a,0,s,s*2,s*.6,s*.8,s*.6,Math.PI/2); }},
    potato:{s:.035,h:1.6,f:(p,s)=>{ p('ball',0xb08a5a,0,s*.8,0,s*1.3,s*.8,s); }},
    onion:{s:.035,h:2,f:(p,s,r,R)=>{ p('ball',R()<.3?0x8a3a5a:0xd8b88a,0,s,0,s,s,s); p('cone',0xa8884a,0,s*2.1,0,s*.3,s*.5,s*.3); }},
    greens:{s:.06,h:.8,f:(p,s)=>{ for(let k=0;k<3;k++)p('ball',k?0x4a9a3a:0x3a7a2a,(k-1)*s*.4,s*.4,0,s*.7,s*.35,s*.9); }},
    pumpkin:{s:.12,h:1.4,f:(p,s)=>{ p('ball',0xe0782a,0,s*.7,0,s,s*.7,s); p('cyl',0x5a4a24,0,s*1.4,0,s*.1,s*.3,s*.1); }}};
  // the park-wall stalls' goods (owner, 8 Nov 2026): butterflies in jars, honey and hives, birds in cages, seed, gems
  const GOODS={
    bjar:{s:.05,h:2.4,f:(p,s,r,R)=>{ p('cyl',0xcfe4ec,0,s*1.1,0,s*.8,s*2.2,s*.8); p('cyl',0x8a6a3e,0,s*2.3,0,s*.85,s*.2,s*.85); p('cap',[0xe0782a,0x4a8ad8,0xe8c84a,0xa858c8][R()*4|0],0,s*1.2,0,s*.6,s*.25,s*.3,Math.PI/2); }},
    net:{s:.05,h:1,f:(p,s)=>{ p('cyl',0x9a7044,0,s*.3,0,s*.2,s*6,s*.2,Math.PI/2); p('cap',0xe8e4d8,0,s*.6,s*3.4,s*1.4,s*1.6,s*1.4,Math.PI/2); }},
    honey:{s:.045,h:2.2,f:(p,s)=>{ p('cyl',0xd8962a,0,s*1,0,s*.8,s*2,s*.8); p('cap',0xc8b088,0,s*2,0,s*.85,s*.4,s*.85); }},
    comb:{s:.07,h:.6,f:(p,s)=>{ p('box',0xe8b040,0,s*.2,0,s*1.6,s*.4,s); }},
    hive:{s:.2,h:1.3,f:(p,s)=>{ p('box',0xe8d08a,0,s*.45,0,s*1.2,s*.9,s); p('box',0xd8b868,0,s*1.05,0,s*1.2,s*.3,s); p('box',0x8a6a3e,0,s*1.25,0,s*1.35,s*.1,s*1.15); }},
    cage:{s:.1,h:2,f:(p,s,r,R)=>{ p('cyl',0xc8a84a,0,s*.9,0,s*.8,s*1.6,s*.8); p('cap',0xc8a84a,0,s*1.7,0,s*.8,s*.5,s*.8); p('box',0x6a5434,0,s*.08,0,s*1.7,s*.16,s*1.7); p('ball',[0xe8c84a,0x4a9ad8,0xd84a3a,0x5ab84a][R()*4|0],0,s*.75,0,s*.3,s*.3,s*.36); }},
    seed:{s:.05,h:1.4,f:(p,s)=>{ p('box',0xb89a6a,0,s*.7,0,s*1.2,s*1.4,s*.7); p('ball',0xd8c080,0,s*1.45,0,s*.5,s*.2,s*.3); }},
    crystal:{s:.04,h:2.4,f:(p,s,r,R)=>{ p('cone',[0x9a6ad8,0x4ad8c8,0xe84a8a,0xe8e8f0][R()*4|0],0,s*1.2,0,s*.6,s*2.4,s*.6,0,0,1); }},
    geode:{s:.06,h:1.2,f:(p,s)=>{ p('cap',0x8a8278,0,s*.5,0,s,s*.6,s); p('cap',0x8a58c8,0,s*.56,0,s*.7,s*.4,s*.7,0,0,1); }},
    stone:{s:.035,h:1.2,f:(p,s,r,R)=>{ p('ball',[0x3a8ad8,0xd83a4a,0x3ac87a,0xe8c84a][R()*4|0],0,s*.6,0,s*.7,s*.6,s*.7); }}};
  const G={ball:new THREE.IcosahedronGeometry(1,0),cap:new THREE.SphereGeometry(1,5,2,0,Math.PI*2,0,Math.PI/2),cone:new THREE.ConeGeometry(1,1,6),cyl:new THREE.CylinderGeometry(1,1,1,5,1,true),box:new THREE.BoxGeometry(1,1,1)};
  const zones=[], Z0=new THREE.Matrix4().makeScale(0,0,0);
  const face=(X,Z,xa,xb,y)=>{ const a=Math.min(X(xa),X(xb)), b=Math.max(X(xa),X(xb)), z0=Z(y), k=Z(y+1)-z0, s=Math.sign(k); let f=null;
    for(const B of FIX.up){ if(B[0]>a||B[3]<b||B[3]-B[0]<6*Math.abs(k))continue; const e=s>0?B[1]:B[4]; if(Math.abs(e-z0)<5*Math.abs(k)&&(f==null||e*s<f*s))f=e; }
    return f==null?y:y+(f-z0)/k; };
  const build=o=>{ const {X,Z,gate=1}=o, tab=!!o.goods, veg=o.veg||tab, KS=tab?GOODS:o.veg?VEG:MUSH, I={ball:[],cap:[],cone:[],cyl:[],box:[],glow:[]}, TG=[];
    const x0=Math.min(o.x0,o.x1), x1=Math.max(o.x0,o.x1), wy=face(X,Z,x0,x1,o.y)-.03, xm=(x0+x1)/2, xg=gate>0?x1:x0, xo=gate>0?x0:x1, fo=-gate, CY1=wy-2.85, CY0=wy-3.65, ya=wy-.78, yb=wy-.02, xa=x0+.4, xb=x1-.4;
    let t=o.seed||7; const R=()=>{ t=(t*16807)%2147483647; return t/2147483647; }, RR=(a,b)=>a+R()*(b-a), BX=[1e9,1e9,-1e9,-1e9];
    const e=new THREE.Euler(), q=new THREE.Quaternion(), m4=new THREE.Matrix4(), V3=THREE.Vector3;
    const inst=(g,col,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0)=>{ q.setFromEuler(e.set(rx,ry,rz)); I[g].push([m4.compose(new V3(x,y,z),q,new V3(sx,sy,sz)).clone(),col]); return [g,I[g].length-1]; };
    const box=(a,b,c,d,h0,h1,col)=>inst('box',col,(X(a)+X(b))/2,mv((h0+h1)/2),(Z(c)+Z(d))/2,Math.abs(X(b)-X(a)),mv(h1-h0),Math.abs(Z(d)-Z(c)));
    const solid=(a,b,c,d,h)=>{ const r=[Math.min(X(a),X(b)),Math.min(Z(c),Z(d)),Math.max(X(a),X(b)),Math.max(Z(c),Z(d))]; SOL.up.push(r); FIX.up.push([r[0],r[1],0,r[2],r[3],mv(h)]); for(let i=0;i<4;i++)BX[i]=i<2?Math.min(BX[i],r[i]):Math.max(BX[i],r[i]); };
    const item=(K,wx,h,wz,s,ry)=>{ const c=Math.cos(ry), sn=Math.sin(ry);
      K.f((g,col,ox,oy,oz,sx,sy,sz,rx=0,rz=0,glow=0)=>{ const lay=Math.abs(Math.abs(rx)-Math.PI/2)<.01;
        inst(glow?'glow':g,col,wx+(ox*c+oz*sn)*M,mv(h+oy),wz+(-ox*sn+oz*c)*M,sx*M,sy*M*(lay?1:VS),sz*M*(lay?VS:1),rx,ry,rz); },s,ry,R); };
    const heap=(K,cx,cy,h,w,d,n)=>{ let left=n, lay=0; while(left>0&&lay<6){ const k=1-lay*.17, cnt=Math.max(1,Math.round(n*(.34-lay*.05)));
        for(let i=0;i<cnt&&left>0;i++,left--)item(K,X(cx+RR(-.5,.5)*w*k),h+lay*K.s*1.3*K.h*.8,Z(cy+RR(-.5,.5)*d*k),K.s*1.3*RR(.85,1.15),RR(0,6.28)); lay++; } };
    const many=(K,w,d)=>Math.round((K.s<.05?8:4)*(w*d)/(.43*.24));
    const row=(K,a,b,c,d,h,f=1)=>{ const n=Math.max(1,Math.round((b-a)/.42)); for(let k=0;k<n;k++){ const w=(b-a)/n, cx=a+w*(k+.5)+RR(-.05,.05)*w, dd=(d-c)*.88; heap(K,cx,(c+d)/2,h,w*RR(.95,1.15),dd,Math.round(many(K,w,dd)*f*RR(.8,1.25))); } };
    const crate=(a,b,c,d,h0,h1,col=0x9a7044)=>{ box(a,b,c,d,h0,h1,col); box(a-.005,b+.005,c-.005,d+.005,(h0+h1)/2-.012,(h0+h1)/2+.012,0x6e4e2c); };
    const H=.8, WOOD=0x9e7a4c, LEG=0x6e5434, DARK=0x7a5c38, ki={i:0};
    const legs=(a,b,c,d,h)=>{ const L=.1; for(const [u,v] of [[a+.05,c+.05],[b-.05-L,c+.05],[a+.05,d-.05-L],[b-.05-L,d-.05-L]])box(u,u+L,v,v+L,0,h,LEG); };
    const RW=tab?o.goods.map(k=>GOODS[k]):veg?[KS.potato,KS.cabbage,KS.tomato,KS.eggplant]:[KS.puffball,KS.chanterelle,KS.redcap,KS.moonglow], RH=[.24,H,1.2,1.6];
    const TOP=veg?1.78:2.58; legs(xa,xb,ya,yb,H-.05); box(xa,xb,ya,yb,H-.05,H,WOOD); box(xa+.04,xb-.04,ya+.04,yb-.04,.2,.24,DARK); box(xa,xb,yb-.035,yb,H,TOP,DARK);
    box(xa,xb,yb-.5,yb,1.15,1.2,WOOD); box(xa,xb,yb-.3,yb,1.55,1.6,WOOD);
    for(const u of [xa,(xa+xb)/2-.04,xb-.08]){ box(u,u+.08,yb-.5,yb-.42,H,1.15,LEG); box(u,u+.08,yb-.3,yb-.22,1.2,1.55,LEG); box(u,u+.08,yb-.1,yb-.02,H,TOP,LEG); if(!veg){ box(u,u+.08,yb-.24,yb-.16,1.6,1.95,LEG); box(u,u+.08,yb-.18,yb-.1,2,2.35,LEG); } }
    if(!veg){ box(xa,xb,yb-.24,yb,1.95,2,WOOD); box(xa,xb,yb-.18,yb,2.35,2.4,WOOD); }
    row(RW[0],xa+.08,xb-.08,ya+.06,yb-.06,RH[0],.45); row(RW[1],xa+.04,xb-.04,ya+.03,yb-.52,RH[1],.8); row(RW[2],xa+.04,xb-.04,yb-.48,yb-.04,RH[2],.8); row(RW[3],xa+.04,xb-.04,yb-.28,yb-.04,RH[3],.9); if(!veg){ row(KS.ghostcap,xa+.04,(xa+xb)/2,yb-.22,yb-.04,2,.9); row(KS.violet,(xa+xb)/2,xb-.04,yb-.22,yb-.04,2,.9); row(KS.ember,xa+.04,(xa+xb)/2,yb-.16,yb-.04,2.4,.9); row(KS.oyster,(xa+xb)/2,xb-.04,yb-.16,yb-.04,2.4,.9); row(KS.sulphur,xa+.04,xb-.04,yb-.16,yb-.04,2.4,.3); }
    solid(xa,xb,ya,yb,veg?1.8:2.6);
    const CK=tab?RW:veg?[KS.carrot,KS.pepper,KS.corn,KS.onion,KS.greens,KS.tomato]:[KS.button,KS.bolete,KS.inkcap,KS.morel,KS.redcap,KS.chanterelle];
    const fx=(u0,u1)=>[Math.min(xo+fo*u0,xo+fo*u1),Math.max(xo+fo*u0,xo+fo*u1)];
    if(veg&&!tab){ const SK=[KS.tomato,KS.cabbage,KS.pepper,KS.onion,KS.potato,KS.eggplant,KS.carrot,KS.corn]; let n=0;
      for(const [u0,u1] of [[.12,.66],[.7,1.24]])for(const [c,d,hi] of [[wy-.5,yb,3],[wy-.98,wy-.52,2],[wy-1.46,wy-1,1]]){ const [a,b]=fx(u0,u1), dh=.28+RR(-.02,.02), sh=RR(-.02,.02);
        for(let k=0;k<hi;k++)crate(a+sh,b+sh,c,d,k*.29,k*.29+dh,[0x9a7044,0x8a6238,0xa47a4a][(n+k)%3]); heap(SK[n++%SK.length],(a+b)/2+sh,(c+d)/2,(hi-1)*.29+dh-.08,(b-a)*.82,(d-c)*.8,9); solid(a,b,c,d,hi*.29); }
      }
    { const bx=xg-gate*.16, fz=Z(wy-.46), tz=Z(yb-.04), dy=mv(1.3), dz=tz-fz, a=Math.atan2(dz,dy), L=Math.hypot(dz,dy);
      TG.push(inst('cyl',0x8a6a3e,X(bx),dy/2,(fz+tz)/2,.02*M,L,.02*M,a), inst('box',0xc8a85a,X(bx),mv(.13),fz+.02*M,.3*M,mv(.26),.07*M,a), inst('box',0x9a3a2a,X(bx),mv(.27),fz+.05*M,.2*M,mv(.04),.06*M,a)); }
    const grp=(MAPG.parkwall)||scene, c=new THREE.Color(), ME={}; let tris=0;
    const lam=new THREE.MeshLambertMaterial({color:0xffffff}), glow=new THREE.MeshBasicMaterial({color:0xffffff});
    for(const [g,L] of Object.entries(I)){ if(!L.length)continue; const geo=G[g==='glow'?'cap':g], me=ME[g]=new THREE.InstancedMesh(geo,g==='glow'?glow:lam,L.length);
      L.forEach(([m,col],i)=>{ me.setMatrixAt(i,m); me.setColorAt(i,c.setHex(col)); }); me.computeBoundingSphere&&me.computeBoundingSphere(); me.castShadow=g!=='glow'; me.receiveShadow=true; if(g==='glow')me.onBeforeRender=()=>{ glow.color.setScalar(CLOCK.dark&&CLOCK.dark()?1.25:.55); }; grp.add(me);
      tris+=L.length*(geo.index?geo.index.count:geo.attributes.position.count)/3; }
    const W=(x,y)=>({x:X(x),z:Z(y)}), HY=(CY1+ya)/2, sg=gate, far=wy-9, zone=[BX[0]-.7*TILE,Math.min(Z(CY0-1.4),Z(wy+.5)),BX[2]+.7*TILE,Math.max(Z(CY0-1.4),Z(wy+.5))];
    zones.push(zone); if(window.WEEDS&&WEEDS.clear)WEEDS.clear(zone);
    const S={name:o.name,bx:BX.slice(),x0,x1,y0:CY0,y1:yb,wy,veg,hx:X(xm),hz:Z(HY),fz:Z(far),tris:Math.round(tris),items:Object.values(I).reduce((a,L)=>a+L.length,0),zone,
      home:W(xm,ya-.75), face:W(xm,far), shelf:[xa+.9,xm,xb-.9].map(x=>W(x,ya-.72)), shelfF:[xa+.9,xm,xb-.9].map(x=>W(x,wy+4)), counter:[x0+1.25,xm,x1-1.25].map(x=>W(x,CY1+.7)),
      wing:[[x0+1.45,-1],[x1-1.45,1]].map(([x,s])=>({p:W(x,CY1+.5),f:W(x+s*5,CY1+.5)})), broom:{p:W(xg-sg*.85,wy-1.35),f:W(xg+sg*.3,wy)},
      sweepIn:[W(xm+.9,HY+.1),W(xm-.9,HY+.1),W(xm,HY-.25),W(xg-sg*.85,wy-1.35)],
      sweepOut:[W(xg-sg*.85,wy-1.35),W(xg+sg*.85,wy-1.35),W(xg+sg*.85,CY0-.9),W(xm,CY0-.9),W(xo-sg*.3,CY0-.9),W(xm+sg*.4,CY0-.95),W(xg+sg*.85,CY0-.9),W(xg+sg*.85,wy-1.35),W(xg-sg*.85,wy-1.35)],
      broomOn:v=>{ for(const [g,i] of TG)ME[g].setMatrixAt(i,v?I[g][i][0]:Z0); for(const g of new Set(TG.map(a=>a[0])))ME[g].instanceMatrix.needsUpdate=true; }};
    if(o.name)STORE.places.push([o.name,S.home.x,S.home.z,'up']);   // GO TO and the map list it
    made.push(S); return S; };
  const wrap=a=>((a+Math.PI*3)%(Math.PI*2))-Math.PI;
  const work=(N,S,o={})=>{ const st=N.st, c=N.rig, J={k:'stand',t:0,d:1,row:1,tray:o.tray?1:0,broom:0,item:0}, v0=st.v; c.job=J;
    S.N=N; N.free=()=>true; N.home={x:S.home.x,z:S.home.z}; st.x=S.home.x; st.z=S.home.z; st.to=st.next=null; st.hold=true; st.face=S.face;
    let plan=[], cur=null, wait=3+Math.random()*6, lk=0, lt=null, lw=0, ld=0;
    const pick=a=>a[Math.floor(Math.random()*a.length)], go=(p,v=1,sw=0)=>({go:p,v,sw}), act=(k,f,d,x)=>Object.assign({k,f,d},x);
    const off=()=>o.tray?[act('put',S.face,1.1,{end:{tray:0}})]:[], on=()=>o.tray?[act('grab',S.face,1.1,{mid:{tray:1}})]:[];
    const plans={
      tidy:()=>{ const i=Math.floor(Math.random()*S.shelf.length); return [...off(),go(S.shelf[i]),act('reach',S.shelfF[i],1.9,{row:Math.floor(Math.random()*4),mid:{item:1}}),go(pick(S.counter)),act('put',S.face,1.3,{mid:{item:0}}),act('pat',S.face,2.6),go(S.home),...on()]; },
      pat:()=>[act('pat',S.face,2.5+Math.random()*2.5)],
      look:()=>[],
      wing:()=>{ const w=pick(S.wing); return [...off(),go(w.p),act('pat',w.f,3.2),go(S.home),...on()]; },
      sweep:()=>{ '@later'; const P=Math.random()<.5?S.sweepIn:S.sweepOut, L=[...off(),go(S.broom.p),act('reach',S.broom.f,1.2,{row:1,mid:{broom:1}})], m=Math.floor(P.length/2);
        P.forEach((p,i)=>{ L.push(go(p,.5,1)); if(i===m)L.push(act('sweep',S.face,2.5+Math.random()*2)); });
        return [...L,go(S.broom.p),act('reach',S.broom.f,1.2,{row:1,mid:{broom:0}}),go(S.home),...on()]; }};
    const set=s=>{ if(!s)return; Object.assign(J,s); if('broom' in s)S.broomOn(!s.broom); };
    const next=()=>{ '@later'; if(cur)set(cur.end); cur=plan.shift()||null; J.t=0; st.to=null; st.v=v0;
      if(!cur){ J.k='stand'; st.face=S.face; wait=o.wait?o.wait():9+Math.random()*16; return; }
      if(cur.go){ st.to={x:cur.go.x,z:cur.go.z}; st.v=v0*cur.v; J.k=cur.sw?'sweep':'walk'; } else { st.face=cur.f; J.k=cur.k; J.d=cur.d; J.row=cur.row??1; } };
    const rel=p=>wrap(Math.atan2(p.x-st.x,p.z-st.z)-st.h);
    N.job=k=>{ plan=plans[k](); cur=null; next(); };
    const tk=N.tick; N.tick=(dt,you)=>{ if(!N.sheet){ J.t+=dt; c.lookT=1e9;
        if(cur){ if(cur.go){ if(!st.to)next(); } else { if(J.t>=cur.d/2&&!cur.m){ cur.m=1; set(cur.mid); } if(J.t>=cur.d)next(); } }
        else if((wait-=dt)<=0){ plan=plans[pick(o.jobs||['tidy','tidy','pat','sweep','sweep','wing'])](); next(); }
        let to=0, dn=0;
        if(J.k==='stand'){ if((lk-=dt)<=0){ lk=1.5+Math.random()*3; let bd=7*TILE; lt=null;
            for(const p of [you,...NPCS.filter(q=>q!==N&&!q.far&&q.lv==='up').map(q=>q.st)]){ const d=Math.hypot(p.x-st.x,p.z-st.z); if(d<bd&&d>.3*TILE&&Math.abs(rel(p))<1.6){ bd=d; lt=p; } }
            if(lt&&Math.random()<.2)lt=null; lw=Math.random()<.3?0:(Math.random()<.5?-1:1)*(.4+Math.random()*.7); ld=Math.random()<.2?.3:0; }
          to=lt?Math.max(-1.1,Math.min(1.1,rel(lt))):lw; dn=lt?0:ld; }
        else if(J.k!=='walk')dn=J.k==='reach'?(J.row>1?-.2:.3):.35;
        c.lookTo=to; c.down=(c.down||0)+(dn-(c.down||0))*Math.min(1,dt*3); }
      tk(dt,you); };
    return J; };
  const NO={k:'stand',t:0,d:1,row:1,tray:1,broom:0,item:0};
  const pose=(c,A)=>{ const J=c.job||NO, B=c.B, R=B.armR, L=B.armL, Hp=B.hips, t=J.t, u=Math.sin(Math.PI*Math.min(1,t/J.d)), w=Math.min(1,t*2,Math.max(0,J.d-t)*2), s=Math.sin(t*4.4);
    B.head.rotation.x+=c.down||0;
    if(A.drop&&!J.tray&&!J.broom){ R.rotation.x+=A.drop; L.rotation.x+=A.drop; }
    if(J.k==='reach'){ R.rotation.x-=A.reach[J.row]*u; L.rotation.x-=A.reach[J.row]*.35*u; Hp.rotation.x+=A.lean[J.row]*u; }
    else if(J.k==='put'||J.k==='grab'){ R.rotation.x-=A.put*u; L.rotation.x-=A.put*u; Hp.rotation.x+=.12*u; }
    else if(J.k==='pat'){ R.rotation.x-=(A.put+.28*Math.sin(t*6.3))*w; L.rotation.x-=(A.put+.28*Math.sin(t*6.3+2.4))*w; R.rotation.y+=.35*Math.sin(t*1.9)*w; L.rotation.y+=.3*Math.sin(t*1.5+1)*w; Hp.rotation.x+=.1*w; }
    if(J.item&&J.k==='walk'){ R.rotation.x=L.rotation.x=(A.drop||0)-A.put; }
    if(J.broom&&(J.k==='sweep'||J.k==='walk')){ const k=J.k==='sweep'?1:0; R.rotation.set(A.sw[0],s*.3*k,A.sw[1]); L.rotation.set(A.sw[2],s*.3*k,A.sw[3]); B.broom.rotation.set(k?0:-.45,s*.5*k,0); Hp.rotation.y+=s*.12*k; Hp.rotation.x+=.08*k; }
    B.broom.scale.setScalar(J.broom?1:1e-4); B.held.scale.setScalar(J.item?1:1e-4); if(B.tray)B.tray.scale.setScalar(J.tray?1:1e-4); };
  // where each park-wall stall stands (data/world.json parkPlaces.stalls): its side of the gate and its place out from it
  const at=id=>{ const L=(LEVEL.parkPlaces&&LEVEL.parkPlaces.stalls)||[], s=L.find(q=>q.id===id); if(!s)return null; const g=PARK.gate, W=4.8, step=5.4, k=s.slot||0;
    return s.side==='w'?{...s,x0:g[0]-3-k*step-W,x1:g[0]-3-k*step,gate:1}:{...s,x0:g[1]+3+k*step,x1:g[1]+3+k*step+W,gate:-1}; };
  const made=[]; return {build,made,MUSH,VEG,GOODS,zones,work,pose,face,at}; })();
window.STALL=STALL;
export {STALL};
