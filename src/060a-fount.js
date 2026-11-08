// THE FOUNTAIN LAKE: FOUNT shapes the lake and its fountain in the park: its shore, bed, water and swimming.
import {SHARED, THREE} from './003-shx.js';
import {BROOK, CLOCK, FLOW, PARK, ROOMS, SKY, VIT, WED} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, LEVEL, MAPG, SOL, STORE, TILE, ZU} from './006-map-pre.js';
const FOUNT={ready:false,swim:false,on:false,holds:[]}; window.FOUNT=FOUNT;   // holds: what holds you up over the lake (the ice, the footbridges), each (x,z)=>bool
FOUNT.held=(x,z)=>FOUNT.holds.some(f=>f(x,z));
{ const ss=(a,b,v)=>{ const t=Math.max(0,Math.min(1,(v-a)/(b-a))); return t*t*(3-2*t); }, hs=(a,b,c=0)=>{ const s=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453; return s-Math.floor(s); };
  const raw=(x,y)=>{ const {C,R,L}=FOUNT.S, dx=x-L.x, dy=y-L.y, e=Math.hypot(dx/L.rx,dy/L.ry)||1e-6, g=Math.hypot(dx/(L.rx*L.rx),dy/(L.ry*L.ry))/e||1e-6, a=Math.atan2(dy,dx), k=Math.hypot(x-C.x,y-C.y);
    return FOUNT.on?Math.max((e-1)/g-(1.6*Math.sin(a*19+1.3)+.9*Math.sin(a*37+.4))*ss(R+3,R+12,k),R+1.5-k):(e-1)/g-(1.6*Math.sin(a*19+1.3)+.9*Math.sin(a*37+.4)); };
  // the islands (data/world.json parkPlaces.islands; owner, 8 Nov 2026: the bath house "on a small little island in the middle of the lake"): land inside the water, its edge a little ragged
  const ISL=(LEVEL.parkPlaces&&LEVEL.parkPlaces.islands)||[], isl=(x,y)=>{ let v=-1e9; for(const I of ISL){ const dx=x-I.x, dy=y-I.y, a=Math.atan2(dy,dx), e=Math.hypot(dx/I.rx,dy/I.ry); v=Math.max(v,(1-e)*Math.min(I.rx,I.ry)+.7*Math.sin(a*5+I.x)+.4*Math.sin(a*11+I.y)); } return v; };
  const shoreL=(x,y)=>{ if(!FOUNT.S)return 1e9; const L=FOUNT.S.L; return Math.max(raw(x,y),x-L.cx,y-L.cy); };
  const lake=FOUNT.lake=(x,y)=>ISL.length?Math.max(shoreL(x,y),isl(x,y)):shoreL(x,y); FOUNT.islands=ISL;
  // the footbridges (parkPlaces.bridges): a plank walk over the water from an island to the shore; how far a map point is from the nearest one's deck
  const BRG=(LEVEL.parkPlaces&&LEVEL.parkPlaces.bridges)||[], brD=FOUNT.bridgeD=(x,y)=>{ let m=1e9; for(const B of BRG){ const dx=B.x1-B.x0, dy=B.y1-B.y0, l2=dx*dx+dy*dy||1, t=Math.max(0,Math.min(1,((x-B.x0)*dx+(y-B.y0)*dy)/l2)); m=Math.min(m,Math.hypot(x-B.x0-dx*t,y-B.y0-dy*t)-B.w/2); } return m; };
  if(BRG.length)FOUNT.holds.push((x,z)=>brD(x/TILE+SHARED.BOD.OX-((window.PARK&&PARK.ox)||0),z/TILE+SHARED.BOD.OY-((window.PARK&&PARK.oy)||0))<0);
  const ter=FOUNT.ter=(x,y)=>FOUNT.S&&FOUNT.on?Math.hypot(x-FOUNT.S.C.x,y-FOUNT.S.C.y)-FOUNT.S.R:1e9;
  FOUNT.bedM=d=>Math.min(3.5,Math.max(0,d)*.42);
  FOUNT.away=(x,y)=>Math.min(lake(x,y)-1,ter(x,y)-1);
  // the running track round the lake (owner, 2 Nov 2026, his picture of the reservoir's path and rail): a band TRACK[1] either side of TRACK[0] tiles off the water, along the whole shore inside the park
  const TRACK=FOUNT.TRACK=[4.2,1.9]; FOUNT.trackD=(x,y)=>{ const S=FOUNT.S; if(!S||x>S.wx1+2.5||y>S.wy1+2.5)return 1e9; return Math.abs(shoreL(x,y)-TRACK[0])-TRACK[1]; };
  FOUNT.at=P=>{ if(FOUNT.S)return FOUNT.S; const wx1=P.x1-8, wy1=P.y1-8, R=23, cx=wx1-R-8; let yS=P.round[1]+4.2+3;
    const C={x:cx,y:Math.ceil(yS+3.5+R)}, BL=LEVEL.parkPlaces.bigLake||{}, L={x:BL.x??P.x1,y:BL.y??P.y1,rx:BL.rx||110,ry:BL.ry||85}; L.cx=L.x+L.rx+6; L.cy=L.y+L.ry+6;
    FOUNT.S={C,R,L,wx1,wy1}; const S=FOUNT.S, pts=[];
    for(let i=0;i<600;i++){ const a=Math.PI*2*i/600, cx=Math.cos(a), cy=Math.sin(a); let t=0; while(t<220&&raw(L.x+cx*t,L.y+cy*t)<0)t+=.2; let t0=Math.max(0,t-.2), t1=t; for(let k=0;k<16;k++){ const t=(t0+t1)/2; if(raw(L.x+cx*t,L.y+cy*t)<0)t0=t; else t1=t; } pts.push([L.x+cx*t0,L.y+cy*t0]); }
    // the whole shore (owner, 7 Nov 2026: "the stream should lead to the actual large lake in corner ... not all fitting in this section"): most of it lies past the forcefield, seen, never walked
    const cut=(Q,k,v)=>{ const o=[]; for(let i=0;i<Q.length;i++){ const p=Q[i], q=Q[(i+1)%Q.length], ip=p[k]<=v, iq=q[k]<=v; if(ip)o.push(p); if(ip!==iq){ const t=(v-p[k])/(q[k]-p[k]); o.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]); } } return o; };
    const poly=cut(cut(pts,0,L.cx),1,L.cy);
    S.poly=poly; S.x0=Math.min(...poly.map(p=>p[0])); S.y0=Math.min(...poly.map(p=>p[1]));
    const X=x=>SHARED.BOD.XS(x+(P.ox||0)), Z=y=>SHARED.BOD.ZS(y+(P.oy||0)), strips=[];
    for(let x=Math.floor(S.x0);x<L.cx;x+=2){ const x2=Math.min(x+2,L.cx-.01), w=y=>lake(x,y)<0||lake(x+1,y)<0||lake(x2,y)<0; let y0=null; for(let y=S.y0-1;y<=L.cy+.5;y+=.5){ const i_=y<L.cy&&w(y); if(i_&&y0===null)y0=y; if(!i_&&y0!==null){ strips.push([X(x),Z(y0),X(x2),Z(Math.min(y,L.cy))]); y0=null; } } }
    S.strips=strips;
    const nrm=(x,y)=>{ const e=.25, gx=lake(x+e,y)-lake(x-e,y), gy=lake(x,y+e)-lake(x,y-e), n=Math.hypot(gx,gy)||1; return [gx/n,gy/n]; };
    const shore=[]; for(let i=1;i<poly.length;i++){ const [ax,ay]=poly[i-1], [bx,by]=poly[i], l=Math.hypot(bx-ax,by-ay); for(let s=0;s<l;s+=.25){ const x=ax+(bx-ax)*s/l, y=ay+(by-ay)*s/l; if(x<L.cx-.5&&y<L.cy-.5&&x<wx1+6&&y<wy1+6)shore.push([x,y]); } }
    const rocks=[]; let acc=0; for(let i=0;i<shore.length;i++){ acc+=.25; const gap=1.3+.8*hs(i,3,1); if(acc<gap)continue; acc=0; const [x,y]=shore[i], n=nrm(x,y), k=.15+.5*hs(i,5,2), s=.24+.5*Math.pow(hs(i,7,3),1.5);
      const rx=x-n[0]*k, ry=y-n[1]*k; if(ter(rx,ry)<.25)continue; rocks.push([rx,ry,s,hs(i,9,4)]); }
    S.rocks=rocks;
    S.shore=shore; S.nrm=nrm;
    // the shore's trees stand past the running track (owner, 2 Nov 2026), their crowns over it and the water
    const oaks=[]; acc=0; for(let i=0;i<shore.length;i++){ acc+=.25; if(acc<14+4*hs(i,11,5))continue; const [x,y]=shore[i]; if(x>wx1+2||y>wy1+2)continue; const n=nrm(x,y), k=TRACK[0]+TRACK[1]+2.6+3*hs(i,13,6), ox=x+n[0]*k, oy=y+n[1]*k, m=12+hs(i,17,8)*6, r=m*.42, [rx,ry]=P.round;
      if(ter(ox,oy)<r+.5||P.pd(ox,oy)<2.2||oy<P.y0+18)continue; acc=0; oaks.push(['OakTree'+(1+Math.floor(hs(i,15,7)*3)),+ox.toFixed(1),+oy.toFixed(1),+m.toFixed(1)]); }
    S.oaks=oaks; S.lamps=!FOUNT.on?[]:[200,228,256,284,312,340].map(a=>[C.x+Math.cos(a*Math.PI/180)*(R-.6),C.y+Math.sin(a*Math.PI/180)*(R-.6)]);
    if(FOUNT.on&&STORE.places)STORE.places.push(['THE FOUNTAIN',X(C.x),Z(C.y-R-1.6),'up']);
    return S; };
  FOUNT.wet=(x,z,R=0)=>{ const S=FOUNT.S; if(!S)return false; const P=PARK, px=x/TILE+SHARED.BOD.OX-(P.ox||0), py=z/TILE+SHARED.BOD.OY-(P.oy||0); if(px<S.x0-3||py<S.y0-3)return false; return lake(px,py)<R/TILE; };
  FOUNT.paint=({flat,X,Z,Y,hash,grain,speck})=>{ '@park'; const S=FOUNT.S, {C,R}=S, sol=(x,y,b,h)=>{ SOL.up.push([X(x)-b*TILE,Z(y)-b*TILE,X(x)+b*TILE,Z(y)+b*TILE]); FIX.up.push([X(x)-b*TILE,Z(y)-b*TILE,0,X(x)+b*TILE,Z(y)+b*TILE,Y(h)]); };
    const RB=8.6, solR=(r,x,y,b,h)=>{ sol(x,y,b,h); r.sol=SOL.up[SOL.up.length-1]; r.fix=FIX.up[FIX.up.length-1]; }, slab=(u,j,k,x,y)=>{ const n=Math.floor(u); let c=(146+22*grain(x,y,k,1.3))*(.92+.16*hash(n,k,713)); if(j||u-n<.04)c*=.62; return speck([c,c*.96,c*.88],x,y,k+2); };
    const pav=(x,y)=>{ const dx=x-C.x, dy=y-C.y, r=Math.hypot(dx,dy); if(r>R)return null; const a=Math.atan2(dy,dx)+Math.PI, wear=SHARED.BOD.g.cvNoise(x*1.3,y*1.3,707);
      if(r>R-.4)return slab(a*R/.9,r>R-.045||Math.abs(r-(R-.4))<.04,711,x,y);
      if(r<RB+.9)return slab(a*r/.9,Math.abs(r-(RB+.45))<.04||Math.abs(r-(RB+.9))<.04,741,x,y);
      { const sp=a*16/(2*Math.PI), sw=Math.abs(sp-Math.round(sp))*2*Math.PI/16*r; if(sw<.16)return slab((r-RB)/1.1,sw>.12,751,x,y); }
      const ring=Math.floor(r/.125), fr=r/.125-ring, band=ring%16>=14;
      if(band){ const u=a*r/.55, n=Math.floor(u), j=fr<.12&&ring%16===14||u-n<.06; let c=(150+20*grain(x,y,721,1.4))*(.93+.14*hash(n,ring,723)); if(j)c*=.64; else if(fr>.8&&ring%16===15)c*=.9; return speck([c,c*.96,c*.88],x,y,725); }
      const u=a*Math.max(r,.2)/.25+(ring&1)*.5, n=Math.floor(u), j=fr<.2||u-n<.12, h=hash(n,ring,731);
      if(j)return wear>.68&&hash(Math.floor(x*24),Math.floor(y*24),733)<.5?[58,80,42]:[92,82,72];
      let c=[146+24*h,76+14*h,56+10*h]; if(h<.12)c=[118,62,48]; else if(h>.93)c=[168,104,78]; const g=(.9+.16*grain(x,y,735,1))*(1-.12*Math.max(0,wear-.5)); return speck(c.map(v=>v*g),x,y,737); };
    if(FOUNT.on){
    const PS=11.5; for(let x0=C.x-R;x0<C.x+R;x0+=PS)for(let y0=C.y-R;y0<C.y+R;y0+=PS){ const x1=Math.min(x0+PS,C.x+R), y1=Math.min(y0+PS,C.y+R), qx=Math.max(x0,Math.min(C.x,x1)), qy=Math.max(y0,Math.min(C.y,y1)); if(Math.hypot(qx-C.x,qy-C.y)<R)flat(x0,y0,x1,y1,0,pav); }
    { const n=Math.ceil(2*Math.PI*8.35/.55); for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; sol(C.x+Math.cos(a)*8.35,C.y+Math.sin(a)*8.35,.32,20); } sol(C.x,C.y,5.9,20); }
    for(let a=8;a<=172;a+=.5/(R-.14)*180/Math.PI){ const t=a*Math.PI/180; sol(C.x+Math.cos(t)*(R-.14),C.y+Math.sin(t)*(R-.14),.28,30); }
    }
    for(const r of S.rocks)if(r[2]>.56)solR(r,r[0],r[1],r[2]*.42,r[2]*24);
    PARK.later(()=>{ try{ build(); }catch(e){ console.warn('FOUNT: not built',e); } }); };
  const build=()=>{ '@park'; const P=PARK, S=FOUNT.S, {C,R,L}=S, X=x=>SHARED.BOD.XS(x+(P.ox||0)), Z=y=>SHARED.BOD.ZS(y+(P.oy||0)), Y=SHARED.BOD.YS, T=TILE, WU=T/.84, V3=THREE.Vector3, grp=MAPG.park||scene, CX=X(C.x), CZ=Z(C.y);
    const LV=-.22*WU, bedM=FOUNT.bedM, BK=P.brook, bk=(a,b)=>{ const h=BK&&BK.h(a,b); return h==null?1e9:h*WU-.5*ZU; }, bedY0=d=>-bedM(d)*WU-.04; FOUNT.LV=LV;
    // the lake's deep holes (owner, 28 Oct 2026: "make the lake and hudson go very deep in certain spots"): two, 25 and 40 m down, black without a light
    const HOLE=[[L.x-L.rx*.45,L.y-L.ry*.15,7,25],[L.x+L.rx*.2,L.y-L.ry*.35,9,40]], pit=(x,y)=>HOLE.reduce((a,[hx,hy,r,dd])=>a+dd*Math.exp(-((x-hx)**2+(y-hy)**2)/(r*r)),0);
    const bedY=(d,x,y)=>bedY0(d)-(x!=null&&d>1.5?pit(x,y)*Math.min(1,(d-1.5)/3)*WU:0); FOUNT.bedY=bedY;
    FOUNT.bedAt=(x,z)=>{ if(SHARED.LVL!=='up')return null; const d=-lake(x/T+SHARED.BOD.OX-(P.ox||0),z/T+SHARED.BOD.OY-(P.oy||0)); const px=x/T+SHARED.BOD.OX-(P.ox||0), py=z/T+SHARED.BOD.OY-(P.oy||0); return d>-1?bedY(d,px,py):null; };
    { const mx=x=>x/T+SHARED.BOD.OX-(P.ox||0), mz=z=>z/T+SHARED.BOD.OY-(P.oy||0), a=[X(S.x0-3),X(L.cx+3)], b=[Z(S.y0-3),Z(L.cy+3)];   // the big lake in the one water (065a): its bed, a bank that rises past the shore
      FLOW.add({name:'lake',kind:'lake',shown:()=>grp.visible,box:[Math.min(...a),Math.min(...b),Math.max(...a),Math.max(...b)],has:(x,z)=>SHARED.LVL==='up'&&lake(mx(x),mz(z))<.4,bed:(x,z)=>{ const d=-lake(mx(x),mz(z)); return d>0?bedY(d,mx(x),mz(z)):LV-.04+(-d)*.5*WU; },rest:()=>LV}); }
    const uT=FOUNT.uT={value:0}, uGl={value:1}, uP=FOUNT.uP={value:new THREE.Vector4()}, uO={value:new THREE.Vector4()}, uOw={value:new THREE.Vector2()}; FOUNT.uGl=uGl;
    if(BK&&BK.kM!=null){ const k=BK.kM, c=BK.C[k], a=BK.C[Math.max(0,k-1)], b=BK.C[Math.min(BK.N,k+1)], tx=X(b[0])-X(a[0]), tz=Z(b[1])-Z(a[1]), l=Math.hypot(tx,tz); uO.value.set(X(c[0]),Z(c[1]),tx/l,tz/l); uOw.value.set((BK.W(c[2])+BK.B+.3)*T,10*T); }
    const wmat=(deep,shal,ring)=>{ const m=new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,side:THREE.DoubleSide}), uC={value:new THREE.Vector4(...ring)}, uD={value:new THREE.Color().setRGB(...deep,THREE.SRGBColorSpace)}, uS={value:new THREE.Color().setRGB(...shal,THREE.SRGBColorSpace)};
      m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,{uT,uGl,uP,uO,uOw,uC,uDeep:uD,uShal:uS});
        sh.vertexShader='attribute float aD; varying float vD; varying vec3 vWq;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vD=aD;').replace('#include <project_vertex>','#include <project_vertex>\n vWq=(modelMatrix*vec4(transformed,1.)).xyz;');
        sh.fragmentShader='uniform float uT,uGl; uniform vec4 uC,uP,uO; uniform vec2 uOw; uniform vec3 uDeep,uShal; varying float vD; varying vec3 vWq; float wg=0.;\nfloat wh(vec2 p){ p=fract(p*vec2(.1031,.1030)); p+=dot(p,p.yx+33.33); return fract((p.x+p.y)*p.x); }\n'+sh.fragmentShader
          .replace('#include <color_fragment>',`#include <color_fragment>
 if(uOw.x>0.){ vec2 o=vWq.xz-uO.xy; float a=dot(o,uO.zw); if(a>0.&&a<uOw.y&&abs(o.x*uO.w-o.y*uO.z)<uOw.x)discard; }
 { vec2 p=vWq.xz/${T.toFixed(3)}; float h=sin(p.x*.9+p.y*.35+uT*.8)+sin(p.y*1.3-p.x*.5-uT*.6)+.6*sin((p.x+p.y)*2.1+uT*1.3);
   if(uC.w>0.){ float d=length(vWq.xz-uC.xy)/${T.toFixed(3)}; h+=uC.w*1.8*sin(d*24.-uT*7.)*exp(-abs(d-uC.z)*1.2); }
   if(uP.z>0.){ float d=length(vWq.xz-uP.xy)/${T.toFixed(3)}; h+=uP.z*2.2*sin(d*8.-uT*6.)*exp(-d*.6); }
   float b=floor(clamp(h*.2+.5,0.,.999)*3.)/2., q=floor(clamp(vD,0.,.999)*4.)/3.;
   diffuseColor.rgb=mix(uShal,uDeep,q)*(.86+.2*b); diffuseColor.a=mix(.62,.96,q);
   if(b>.9&&wh(floor(p*6.)+floor(uT*1.5))>.975)wg=uGl; }`)
          .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=vec3(.7,.82,.78)*wg;'); };
      m.customProgramCacheKey=()=>'fwater'; return m; };
    const lakeM=wmat([.13,.25,.18],[.24,.33,.21],[0,0,0,0]); FOUNT.lakeM=lakeM;
    const chunks=(cell,keep,make)=>{ const x0=Math.floor(S.x0)-6, y0=Math.floor(S.y0)-6, CH=16; let tris=0;
      for(let cx=x0;cx<L.cx;cx+=CH)for(let cy=y0;cy<L.cy;cy+=CH){ const pos=[], ex=[], cl=cx>=P.x1||cy>=P.y1?cell*4:cell; for(let x=cx;x<Math.min(cx+CH,L.cx+cl);x+=cl)for(let y=cy;y<Math.min(cy+CH,L.cy+cl);y+=cl){ const cell=cl; const q=[[x,y],[x+cell,y],[x+cell,y+cell],[x,y+cell]], d=q.map(([a,b])=>-lake(a,b)); if(!keep(d,x+cell/2,y+cell/2))continue; make(q,d,pos,ex); }
        if(!pos.length)continue; tris+=pos.length/9; FOUNT.parts.push([pos,ex]); }
      return tris; };
    FOUNT.parts=[]; const BD=[[.36,.32,.22],[.29,.28,.19],[.21,.23,.15],[.14,.18,.12]], lin=new THREE.Color();
    const bedTris=chunks(1,(d,a,b)=>Math.max(...d)>-1.4&&!(lake(a,b)>0&&BK&&BK.wet(a,b)),(q,d,pos,col)=>{ const v=q.map(([a,b],k)=>[X(a),Math.min(bedY(d[k],a,b),bk(a,b)),Z(b)]); for(const t of [[0,2,1],[0,3,2]]){ const m=(d[t[0]]+d[t[1]]+d[t[2]])/3, dm=bedM(m), h=hs(Math.floor(q[0][0]*3+t[1]),Math.floor(q[0][1]*3),21);
      const g=Math.min(2.999,dm/.6), i=Math.floor(g), f=g-i, c=lin.setRGB(...BD[i].map((v,j)=>(v+(BD[i+1][j]-v)*f)*.8*(.92+.16*h)),THREE.SRGBColorSpace).toArray(); for(const k of t){ pos.push(...v[k]); col.push(...c); } } });
    // the bed seen through clear water (owner, 29 Oct 2026, of the lake from above: "fix it"): sand at the edge, mud deeper, patches of weed, pebbles,
    // dark down the holes, the sun's light dancing on it in the shallows; worked out where it is drawn, so it needs no more triangles; lit as one smooth floor
    const bedM_=new THREE.MeshLambertMaterial({color:0xffffff}); bedM_.onBeforeCompile=sh=>{ sh.uniforms.uLV={value:LV}; sh.uniforms.uT=FOUNT.uT;
      sh.vertexShader='varying vec3 vWb;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vWb=(modelMatrix*vec4(transformed,1.)).xyz;');
      sh.fragmentShader=`uniform float uLV,uT; varying vec3 vWb;
        float bh(vec2 p){ p=fract(p*vec2(.1031,.1030)); p+=dot(p,p.yx+33.33); return fract((p.x+p.y)*p.x); }
        float bn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(bh(i),bh(i+vec2(1.,0.)),f.x),mix(bh(i+vec2(0.,1.)),bh(i+vec2(1.,1.)),f.x),f.y); }
        float cau(vec2 p,float t){ vec2 i=p; float c=1.; for(int n=0;n<3;n++){ float tt=t*(1.-(3.5/float(n+1))); i=p+vec2(cos(tt-i.x)+sin(tt+i.y),sin(tt-i.y)+cos(tt+i.x)); vec2 q=vec2(sin(i.x+tt),cos(i.y+tt)); q=sign(q)*max(abs(q),vec2(1e-3)); c+=1./max(length(vec2(p.x/(q.x/.005),p.y/(q.y/.005))),1e-4); } c/=3.; c=1.17-pow(max(c,0.),1.4); return min(pow(abs(c),8.),3.); }
        `+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        { float d=max(0.,uLV-vWb.y)*${(.84/T).toFixed(5)}; vec2 p=vWb.xz*${(.84/T).toFixed(5)}; float n=bn(p*.7)*.6+bn(p*2.6+3.)*.4;
          vec3 c=mix(vec3(.62,.56,.42),vec3(.34,.3,.22),smoothstep(.3,1.8,d+(n-.5)*.9)); c=mix(c,vec3(.17,.24,.11),smoothstep(.56,.74,n)*smoothstep(.8,2.4,d));
          float pb=bn(p*13.); if(pb>.8&&d<2.5)c*=.72+.4*bh(floor(p*13.)); c*=.86+.22*bn(p*6.); c=mix(c,vec3(.06,.09,.07),smoothstep(4.,14.,d));
          float k=d>.05?cau(mod(p*.9,6.2831),uT*.5)*exp(-d*.35):0.; c+=vec3(.22,.28,.24)*min(k,1.2)*.5;
          diffuseColor.rgb=pow(c,vec3(2.2)); }`); };
    bedM_.customProgramCacheKey=()=>'lakebed';
    for(const [pos,col] of FOUNT.parts.splice(0)){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(pos.map((_,i)=>i%3===1?1:0),3)); g.computeBoundingSphere(); const me=new THREE.Mesh(g,bedM_); me.receiveShadow=true; grp.add(me); }
    // the islands' land: a grassy top at the ground's height, a sandy rim down to the lake bed
    for(const I of ISL){ const NA=64, NR=6, pos=[], col=[], R0=Math.max(I.rx,I.ry)+2.5, top=[[86,116,58],[96,126,64]], sand=[178,164,124];
      const pt=(a,k)=>{ let t=0, t1=R0; const dx=Math.cos(a), dy=Math.sin(a); for(let i=0;i<20;i++){ const m=(t+t1)/2; if(lake(I.x+dx*m,I.y+dy*m)>-.6)t=m; else t1=m; } const r=t*k/NR, x=I.x+dx*r, y=I.y+dy*r, l=lake(x,y);
        return [X(x),l>.8?.01:l>0?.01-(.8-l)*.02*WU:bedY0(Math.max(0,-l))+.02,Z(y),l>1.6?top[(Math.floor(a*9)+k)&1]:sand]; };
      for(let i=0;i<NA;i++){ const a0=i/NA*Math.PI*2, a1=(i+1)/NA*Math.PI*2; for(let k=0;k<NR;k++){ const A=pt(a0,k), B=pt(a0,k+1), C2=pt(a1,k+1), D=pt(a1,k);
        for(const v of k?[A,B,C2,A,C2,D]:[A,B,C2]){ pos.push(v[0],v[1],v[2]); col.push(...v[3].map(c=>Math.pow(c/255,2.2))); } } }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.computeVertexNormals(); g.computeBoundingSphere();
      const me=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); me.receiveShadow=true; me.name='the island'; grp.add(me); }
    // the footbridges: planks across on two stringers, posts down into the water, a rail each side
    for(const B of BRG){ const ax=X(B.x0), az=Z(B.y0), bx=X(B.x1), bz=Z(B.y1), L=Math.hypot(bx-ax,bz-az), yaw=Math.atan2(bx-ax,bz-az), W=B.w*T, n=Math.max(2,Math.round(L/(.45*T))), m4=new THREE.Matrix4(), q=new THREE.Quaternion().setFromAxisAngle(new V3(0,1,0),yaw), c=new THREE.Color();
      const at=(t,side,y)=>new V3(ax+(bx-ax)*t+Math.cos(yaw)*side,y,az+(bz-az)*t-Math.sin(yaw)*side), wood=new THREE.MeshLambertMaterial({color:0xffffff});
      const pl=new THREE.InstancedMesh(new THREE.BoxGeometry(W,.06*T,.4*T),wood,n); for(let i=0;i<n;i++){ pl.setMatrixAt(i,m4.compose(at((i+.5)/n,0,.0),q,new V3(1,1,1))); const k=.82+.18*Math.sin(i*12.9898)*Math.sin(i*4.1); pl.setColorAt(i,c.setRGB(.52*k,.38*k,.24*k)); }
      const np=Math.max(2,Math.round(L/(2.4*T)))+1, po=new THREE.InstancedMesh(new THREE.BoxGeometry(.16*T,1.6*T,.16*T),wood,np*2);
      for(let i=0;i<np;i++)for(const s of [-1,1]){ const k=i*2+(s>0); po.setMatrixAt(k,m4.compose(at(i/(np-1),s*(W/2+.05*T),-.35*T),q,new V3(1,1,1))); po.setColorAt(k,c.setRGB(.36,.27,.18)); }
      const rl=new THREE.InstancedMesh(new THREE.BoxGeometry(.09*T,.09*T,L),wood,6); let k=0;
      for(const s of [-1,1])for(const y of [.42,.9]){ rl.setMatrixAt(k,m4.compose(at(.5,s*(W/2+.05*T),y*T),q,new V3(1,1,1))); rl.setColorAt(k++,c.setRGB(.44,.33,.21)); }
      for(const s of [-1,1]){ rl.setMatrixAt(k,m4.compose(at(.5,s*W*.3,-.07*T),q,new V3(1.6,1.4,1))); rl.setColorAt(k++,c.setRGB(.3,.22,.15)); }
      for(const me of [pl,po,rl]){ me.castShadow=me.receiveShadow=true; me.name='the footbridge'; grp.add(me); } }
    const wTris=chunks(2,(d,a,b)=>{ if(Math.max(...d)>-1)return true; const r=BK&&BK.q(a,b); return !!r&&r[1]<BK.m+1&&r[0]<BK.W(r[1])+BK.B+1; },(q,d,pos,ad)=>{ const v=q.map(([a,b])=>[X(a),LV,Z(b)]); for(const t of [[0,2,1],[0,3,2]])for(const k of t){ pos.push(...v[k]); ad.push(Math.max(0,Math.min(25,(bedM(d[k])+pit(q[k][0],q[k][1])-.22)/2.4))); } });
    for(const [pos,ad] of FOUNT.parts.splice(0)){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('aD',new THREE.Float32BufferAttribute(ad,1)); g.computeVertexNormals(); g.computeBoundingSphere(); const me=new THREE.Mesh(g,lakeM); (FOUNT.waters=FOUNT.waters||[]).push(me); me.receiveShadow=true; me.renderOrder=1; grp.add(me); }
    // the lake's water is the Hudson's (owner, 2 Nov 2026: "calm, real water, clear, like hudson same options"): the river's surface shader over the lake's own depth picture, no swell; the river's panel (a double click on the water) sets it
    const RV=window.RIVER; let swap; { const N=128, ax=Math.min(X(S.x0-3),X(L.cx+1)), az=Math.min(Z(S.y0-3),Z(L.cy+1)), wx=Math.abs(X(L.cx+1)-X(S.x0-3)), wz=Math.abs(Z(L.cy+1)-Z(S.y0-3)), img=new Uint8Array(N*N*4), mx=x=>x/T+SHARED.BOD.OX-(P.ox||0), mz=z=>z/T+SHARED.BOD.OY-(P.oy||0);
      for(let j=0;j<N;j++)for(let i=0;i<N;i++){ const px=mx(ax+wx*(i+.5)/N), py=mz(az+wz*(j+.5)/N), d=-lake(px,py), m=d>0?bedM(d)+pit(px,py)*Math.min(1,Math.max(0,(d-1.5)/3)):0, k=(j*N+i)*4; img[k]=Math.min(255,Math.round(m*20)); img[k+3]=255; }
      const bt=new THREE.DataTexture(img,N,N); bt.magFilter=bt.minFilter=THREE.LinearFilter; bt.needsUpdate=true;
      swap=()=>{ if(!RV||!RV.surface)return; const m=RV.surface({bed:bt,bedR:new THREE.Vector4(ax,az,wx,wz),lv:LV}); for(const me of FOUNT.waters||[])me.material=m; FOUNT.lakeM=m; };
      if(RV&&RV.surface)swap(); else if(RV)RV.onBuild.push(swap);
      if(RV&&RV.pickers){ const pl=new THREE.Plane(new THREE.Vector3(0,1,0),-LV), ph=new THREE.Vector3(); RV.pickers.push((ray,pos)=>SHARED.LVL==='up'&&grp.visible&&!!ray.intersectPlane(pl,ph)&&FOUNT.bedAt(ph.x,ph.z)!=null&&Math.hypot(ph.x-pos.x,ph.z-pos.z)<40*T); } }
    { const N=S.rocks.length, me=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),N), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), c=new THREE.Color();
      S.rocks.forEach(([x,y,s,h],i)=>{ const w=s*T*.5, d=-lake(x,y); me.setMatrixAt(i,m4.compose(new V3(X(x),bedY(d,x,y)+w*.25,Z(y)),q.setFromEuler(e.set(h*3,h*9,h*2)),new V3(w*(1+.3*h),w*(.55+.3*hs(i,2)),w*(.9-.2*h)))); const g=.4+.16*hs(i,4); me.setColorAt(i,c.setRGB(g,g*.99,g*.95)); });
      me.castShadow=me.receiveShadow=true; grp.add(me); FOUNT.rockN=N;
      WED.meshes.push({place:'park',me,items:S.rocks.map((r,i)=>{ me.getMatrixAt(i,m4); const E=m4.elements; return {k:'lake rock',x:E[12],y:E[13],z:E[14],sol:r.sol,fix:r.fix}; })}); }
    let drops=null, flow=()=>{}, discT=0; if(FOUNT.on){
    const box=new THREE.BoxGeometry(1,1,1), stoneI=[], put=(x,z,y0,y1,len,th,phi,g)=>stoneI.push([x,(y0+y1)/2,z,len,y1-y0,th,phi,g]);
    { const Rb=R-.14, A=[], NP=Math.round(Rb*164*Math.PI/180/2.6)+1; for(let i=0;i<NP;i++)A.push((8+164*i/(NP-1))*Math.PI/180); const at=a=>[X(C.x+Math.cos(a)*Rb),Z(C.y+Math.sin(a)*Rb)], ph=a=>Math.atan2(-Math.cos(a),-Math.sin(a));
      A.forEach((a,i)=>{ const [x,z]=at(a); put(x,z,0,Y(30),.3*T,.3*T,ph(a),.62+.06*hs(i,1)); put(x,z,Y(30),Y(33.5),.38*T,.38*T,ph(a),.7); put(x,z,Y(33.5),Y(36),.16*T,.16*T,ph(a),.66); });
      for(let i=0;i<NP-1;i++){ const a=A[i], b=A[i+1], m=(a+b)/2, [x0,z0]=at(a), [x1,z1]=at(b), len=Math.hypot(x1-x0,z1-z0)-.3*T, [xm,zm]=at(m), cm=Math.cos((b-a)/2), mx=X(C.x+Math.cos(m)*Rb*cm), mz=Z(C.y+Math.sin(m)*Rb*cm);
        put(mx,mz,0,Y(4.5),len,.26*T,ph(m),.58+.05*hs(i,3)); put(mx,mz,Y(21.5),Y(26),len,.28*T,ph(m),.68+.05*hs(i,5));
        const n=Math.max(3,Math.round(((b-a)*Rb-.3)/.22)); for(let k=1;k<=n;k++){ const t=a+(b-a)*(k/(n+1)), [bx,bz]=at(t); put(bx,bz,Y(4.5),Y(21.5),.085*T,.085*T,ph(t),.64+.06*hs(i,k)); put(bx,bz,Y(9),Y(15),.12*T,.12*T,ph(t)+.78,.6+.06*hs(k,i)); } } }
    { const me=new THREE.InstancedMesh(box,new THREE.MeshLambertMaterial({color:0xffffff}),stoneI.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color(), up=new V3(0,1,0);
      stoneI.forEach(([x,y,z,sx,sy,sz,phi,g],i)=>{ me.setMatrixAt(i,m4.compose(new V3(x,y,z),q.setFromAxisAngle(up,phi),new V3(sx,sy,sz))); me.setColorAt(i,c.setRGB(g,g*.96,g*.88)); }); me.castShadow=me.receiveShadow=true; grp.add(me); FOUNT.balN=stoneI.length; }
    const pos=[], col=[], tri=(a,b,c,k)=>{ pos.push(...a,...b,...c); col.push(...k,...k,...k); };
    const STONE=i=>{ const g=.6+.08*hs(i,31); return [g,g*.96,g*.88]; }, BRONZE=i=>{ const h=hs(i,37); return h<.22?[.3,.44,.36]:h<.3?[.42,.36,.22]:[.26*(.9+.2*h),.24*(.9+.2*h),.17]; };
    const lathe=(prof,n,cf,x=CX,z=CZ,y0=0,rs=1)=>{ const P=(i,j)=>{ const a=i/n*Math.PI*2, [r,h]=prof[j]; return [x+Math.cos(a)*r*T*rs,y0+Y(h),z+Math.sin(a)*r*T*rs]; }; let k=0;
      for(let i=0;i<n;i++)for(let j=0;j<prof.length-1;j++){ const a=P(i,j), b=P(i+1,j), c=P(i+1,j+1), d=P(i,j+1), cc=cf(k++); if(prof[j][0]>1e-4)tri(a,b,c,cc); if(prof[j+1][0]>1e-4)tri(a,c,d,cc); } };
    const SC=2.6, LS=(prof,n,cf,x,z)=>lathe(prof.map(([r,h])=>[r*SC,h*SC]),n,cf,x,z);
    lathe([[8.1,1],[8.1,17],[8.2,20],[8.5,20],[8.6,17.5],[8.6,0]],96,STONE);
    lathe([[0,1],[8.1,1]],48,i=>[.3,.31,.27]);
    LS([[.42,0],[.42,10],[.34,13],[.3,16]],20,STONE);
    LS([[.3,16],[.15,19],[.13,30],[.17,37],[.13,44],[.16,46]],18,BRONZE);
    LS([[.16,46],[.42,48],[.72,51],[.92,54],[.95,56.5],[.88,56.5],[.6,54.5],[.22,53],[0,53]],44,BRONZE);
    LS([[.12,53],[.09,60],[.13,64],[.09,68],[.1,74]],14,BRONZE);
    LS([[.1,74],[.26,76],[.43,79.5],[.46,81.5],[.41,81.5],[.2,80],[0,80]],32,BRONZE);
    LS([[.13,80],[.13,86],[.16,87.5],[.16,89],[0,89]],14,BRONZE);
    { const F=(dx,h,dz)=>[CX+dx*T*SC,Y(h*SC),CZ+dz*T*SC], seg=(a,b,r0,r1,cf)=>{ const A=new V3(...a), B=new V3(...b), ax=new V3().subVectors(B,A).normalize(), u=new V3(Math.abs(ax.y)<.9?0:1,Math.abs(ax.y)<.9?1:0,0).cross(ax).normalize(), v=new V3().crossVectors(ax,u), N=5, ring=(c,r)=>Array.from({length:N},(_,i)=>{ const t=i/N*Math.PI*2; return new V3().copy(c).addScaledVector(u,Math.cos(t)*r).addScaledVector(v,Math.sin(t)*r).toArray(); });
        const ra=ring(A,r0*T*SC), rb=ring(B,r1*T*SC); for(let i=0;i<N;i++){ const cc=cf(i); tri(ra[i],ra[(i+1)%N],rb[(i+1)%N],cc); tri(ra[i],rb[(i+1)%N],rb[i],cc); } };
      LS([[.15,89],[.13,96],[.1,104],[.085,110],[.11,113],[.07,116],[0,116]],12,BRONZE);
      LS([[0,114.5],[.06,115.5],[.085,118],[.075,121],[.04,122.5],[0,123]],10,BRONZE);
      seg(F(.09,113,0),F(.17,123,-.1),.032,.026,BRONZE); seg(F(.17,123,-.1),F(.2,131,-.16),.026,.02,BRONZE);
      seg(F(-.09,113,0),F(-.17,104,-.12),.032,.026,BRONZE); seg(F(-.17,104,-.12),F(-.2,96,-.2),.026,.02,BRONZE); seg(F(-.2,92,-.2),F(-.2,101,-.2),.008,.008,BRONZE); LS([[0,100],[.05,103],[.02,105],[0,105]],5,i=>[.3,.44,.36],CX-.2*T*SC,CZ-.2*T*SC);
      for(const s of [-1,1]){ const root=F(s*.05,113,.06), tips=[[.16,135,.18],[.34,141,.24],[.48,134,.26],[.52,124,.24],[.46,114,.2],[.34,106,.16],[.2,103,.1]].map(([a,h,b])=>F(s*a,h,b));
        for(let i=0;i<tips.length-1;i++)tri(root,tips[i],tips[i+1],BRONZE(i+(s>0?9:0)).map(v=>v*(i%2?1:1.14))); } }
    { const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.computeVertexNormals(); g.computeBoundingSphere();
      const me=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})); me.castShadow=me.receiveShadow=true; grp.add(me); FOUNT.statTris=pos.length/9; }
    const disc=(r,h,ring,deep,shal,dv,n)=>{ discT+=n; const g=new THREE.CircleGeometry(r*T,n).rotateX(-Math.PI/2); g.setAttribute('aD',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(dv),1)); const me=new THREE.Mesh(g,wmat(deep,shal,[CX,CZ,ring,1])); me.position.set(CX,Y(h),CZ); me.receiveShadow=true; me.renderOrder=1; grp.add(me); return me; };
    disc(8.1,13.5,3.05,[.2,.36,.32],[.32,.46,.4],.75,64); disc(.88*SC,55.5*SC,1.55,[.22,.38,.34],[.34,.48,.42],.6,32); disc(.41*SC,80.8*SC,.9,[.22,.38,.34],[.34,.48,.42],.6,24);
    const SPR=[]; { const st=(n,r,h,vo,vu,hl,k,ph)=>{ for(let i=0;i<n;i++){ const a=(i+.5*ph)/n*Math.PI*2; SPR.push({a,r,h,vo:vo*(.9+.2*hs(i,n)),vu,hl,k,o:hs(i,k*7)}); } };
      st(36,.46*SC,81.5*SC,.45,0,55.5*SC,4,0); st(56,.95*SC,56.5*SC,.55,0,13.5,6,1); st(16,.17*SC,88*SC,.8,1.5,80.8*SC,5,0); }
    const NS=SPR.reduce((a,s)=>a+s.k,0), dG=new THREE.OctahedronGeometry(.5,0); drops=new THREE.InstancedMesh(dG,new THREE.MeshLambertMaterial({color:0xffffff,emissive:new THREE.Color(.22,.27,.27)}),NS); drops.frustumCulled=false;
    { const c=new THREE.Color(); for(let i=0;i<NS;i++)drops.setColorAt(i,c.setRGB(.74+.12*hs(i,1),.86+.08*hs(i,2),.9)); } grp.add(drops);
    const g=9.81*WU, m4=new THREE.Matrix4(), q=new THREE.Quaternion(), up=new V3(0,1,0), vv=new V3(), pp=new V3(), sc=new V3();
    flow=t=>{ let n=0; for(const s of SPR){ const ca=Math.cos(s.a), sa=Math.sin(s.a), x0=CX+ca*s.r*T, z0=CZ+sa*s.r*T, y0=Y(s.h), vo=s.vo*WU, vu=s.vu*WU, yl=Y(s.hl), tf=(vu+Math.sqrt(vu*vu+2*g*Math.max(.01,y0-yl)))/g;
        for(let k=0;k<s.k;k++){ const f=((t/tf+s.o+k/s.k)%1+1)%1, tt=f*tf, y=y0+vu*tt-.5*g*tt*tt; pp.set(x0+ca*vo*tt,Math.max(yl,y),z0+sa*vo*tt); vv.set(ca*vo,vu-g*tt,sa*vo); const sp=vv.length();
          q.setFromUnitVectors(up,vv.multiplyScalar(1/sp)); sc.set(.1*T,Math.min(tf*sp/s.k*.8,T)+.06*T,.1*T); drops.setMatrixAt(n++,m4.compose(pp,q,sc)); } }
      drops.instanceMatrix.needsUpdate=true; };
    flow(0); FOUNT.drops=drops; FOUNT.flowN=NS; FOUNT.tris0={rocks:0,balustrade:FOUNT.balN*12,statue:FOUNT.statTris,drops:NS*8,discs:discT};
    }
    FOUNT.tris={bed:bedTris,water:wTris,rocks:FOUNT.rockN*36,...(FOUNT.tris0||{})};
    const near=(pos,d)=>Math.hypot(pos.x-CX,pos.z-CZ)<d*T;
    FOUNT.hear=pos=>FOUNT.on&&SHARED.LVL==='up'&&!(ROOMS.cur)?Math.pow(Math.max(0,1-Math.hypot(pos.x-CX,pos.z-CZ)/(40*T)),2):0;
    let wasIn=false;
    FOUNT.feed=(st,pos,dt,go,keys)=>{ if(SHARED.LVL!=='up'||pos.x<X(S.x0-1)||pos.z<Z(S.y0-1)){ if(FOUNT.swim||wasIn){ FOUNT.swim=false; wasIn=false; uP.value.z=0; } return false; }
      const d=-lake(pos.x/T+SHARED.BOD.OX-(P.ox||0),pos.z/T+SHARED.BOD.OY-(P.oy||0)); if(d<=0||FOUNT.held&&FOUNT.held(pos.x,pos.z)||VIT.dead){ FOUNT.swim=false; uP.value.z=0; if(VIT.dead&&st.water){ st.water.in=false; st.water.level=null; } return false; }   // (a ghost floats over the water, never swims)
      const W=RIG.water(st,{level:(LV+(FOUNT.swim?FLOW.carry(pos,dt):0))/ZU,floor:bedY(d,pos.x/T+SHARED.BOD.OX-(P.ox||0),pos.z/T+SHARED.BOD.OY-(P.oy||0))/ZU}); W.go=!!go; W.fast=W.in&&(keys.has('k')||keys.has('shift'))?1:0;
      if(W.in&&W.floor>=W.level-30&&!st.move&&!W.dive){ W.in=false; if(st.last)st.out={pose:JSON.parse(JSON.stringify(st.last)),t:0,T:.4}; }
      let kick=0; for(const e of W.events)if(e.k==='splash')kick=Math.max(kick,Math.min(1.6,.4+e.v*.01)); W.events.length=0; if(W.in&&!wasIn)kick=1.4; wasIn=W.in; FOUNT.swim=W.in;
      const wet=W.in||W.floor<W.level, z=wet?Math.max(kick,W.in?(go?.9:.35):(go?.55:0)):0; uP.value.set(pos.x,pos.z,uP.value.z+(z-uP.value.z)*Math.min(1,dt*(z>uP.value.z?12:2)),0); return true; };
    let ft=0; FOUNT.tick=(dt,pos)=>{ if(SHARED.LVL!=='up'||!grp.visible)return; if(RV&&!RV.on&&RV.shade)RV.shade(); const fn=near(pos,80), ln=pos.x>X(S.x0-50)&&pos.z>Z(S.y0-50); if(!fn&&!ln)return; ft+=dt; uT.value=ft;
      try{ uGl.value=Math.max(0,Math.min(1,(CLOCK.elev()+2)/10)); }catch(e){} if(drops){ drops.visible=fn; if(fn)flow(ft); } };
    const UF=new THREE.Fog(0,0,1), bg0=new THREE.Color(); let fog0=null, uw=false, dome=true;
    FOUNT.pre=(scene,cam)=>{ const c=cam.position; uw=!cam.isOrthographicCamera&&grp.visible&&c.y<LV&&FOUNT.bedAt(c.x,c.z)!=null&&!!(scene.background&&scene.background.isColor); if(!uw)return;
      let k=1; try{ k=.3+.7*Math.max(0,Math.min(1,(CLOCK.elev()+4)/14)); }catch(e){}
      const see=FLOW.see(Math.max(0,(LV-c.y)*.84/T),9); UF.color.setRGB(.2,.4,.36,THREE.SRGBColorSpace).multiplyScalar(k*see.k); UF.near=0; UF.far=see.far/.84*T; UF.uw=true; fog0=scene.fog; bg0.copy(scene.background); scene.fog=UF; scene.background.copy(UF.color);
      if(window.SKY&&SKY.dome){ dome=SKY.dome.visible; SKY.dome.visible=false; } };
    FOUNT.post=scene=>{ if(!uw)return; scene.fog=fog0; scene.background.copy(bg0); if(window.SKY&&SKY.dome)SKY.dome.visible=dome; uw=false; };
    if(window.BROOK&&BROOK.still)BROOK.still(FOUNT.waters||[]);
    FOUNT.ready=true; };
}
export {FOUNT};
