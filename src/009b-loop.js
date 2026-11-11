// THE LOOP: the subway under the ring street round all eight sections (grab('loop')): both tracks' tunnels, the stations B to H, every station's signs and board, and each station's exit up to its street.
import {SHARED, THREE} from './003-shx.js';
import {DN, LEVELS, pos, RAG, ROOMS, TEXT, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {cutWalls, FADE, FIX, grab, LAMPD, LAMPI, lamps, LEVEL, MODS, ORIGIN, SECTIONS, SOL, SYS, TILE, ZU} from './006-map-pre.js';
import {PEEK} from './008-batch.js';
for(const [k,d] of Object.entries({'loop.name':'{street}','loop.track':'TO {next}','loop.shuttle':'SHUTTLE · {street} ONLY','loop.then':'THEN {then} · {after}','loop.exit':'EXIT {id}1','loop.up':'↑ {street}','loop.exitsub':'{name} · SECTION {id}','loop.map':'THE LOOP · {street}','loop.here':'● YOU ARE HERE','loop.train1':'TO {next}','loop.train2':'TO {next}'}))TEXT.t(k,d);
const LOOP=window.LOOP={};
await grab('loop',async()=>{ const M=SHARED.METRO, D=LEVEL.loop, T=TILE, SZ=-98, c0=cutWalls.length;
  const WX=mx=>(mx-ORIGIN[0])*T, WZ=my=>(my-ORIGIN[1])*T, H=h=>M.DY+h*ZU, MX=x=>x/T+ORIGIN[0], MY=z=>z/T+ORIGIN[1];
  const hash=(a,b,c=0)=>{ let h=(a*374761393+b*668265263+c*2147483647)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const sh=(c,f)=>[Math.min(255,c[0]*f),Math.min(255,c[1]*f),Math.min(255,c[2]*f)], mod=(a,n)=>((a%n)+n)%n;
  const vn=(x,y,c)=>{ const i=Math.floor(x), j=Math.floor(y), u=x-i, v=y-j, su=u*u*(3-2*u), sv=v*v*(3-2*v), a=hash(i,j,c), b=hash(i+1,j,c), d=hash(i,j+1,c), e=hash(i+1,j+1,c); return (a+(b-a)*su)*(1-sv)+(d+(e-d)*su)*sv; };

  // the two tracks: a rounded rectangle each, s the distance round it clockwise from its south side's east end
  const TRK={}; for(const id in D.tracks){ const t=D.tracks[id], R=D.r, xw=t.west, xe=t.east, ys=t.south, yn=t.north, A=Math.PI/2*R;
    const P=[{k:'l',a:[xe-R,ys],b:[xw+R,ys]},{k:'a',c:[xw+R,ys+R],t0:-Math.PI/2},{k:'l',a:[xw,ys+R],b:[xw,yn-R]},{k:'a',c:[xw+R,yn-R],t0:Math.PI},
      {k:'l',a:[xw+R,yn],b:[xe-R,yn]},{k:'a',c:[xe-R,yn-R],t0:Math.PI/2},{k:'l',a:[xe,yn-R],b:[xe,ys+R]},{k:'a',c:[xe-R,ys+R],t0:0}];
    let L=0; for(const p of P){ if(p.k==='l'){ p.len=Math.hypot(p.b[0]-p.a[0],p.b[1]-p.a[1]); p.u=[(p.b[0]-p.a[0])/p.len,(p.b[1]-p.a[1])/p.len]; } else p.len=A; p.s0=L; L+=p.len; }
    const pt=s=>{ s=mod(s,L); let p=P[P.length-1]; for(const q of P)if(s<q.s0+q.len){ p=q; break; } const d=s-p.s0;
      if(p.k==='l')return {x:p.a[0]+p.u[0]*d,y:p.a[1]+p.u[1]*d,hx:p.u[0],hy:p.u[1],arc:false};
      const th=p.t0-d/R; return {x:p.c[0]+R*Math.cos(th),y:p.c[1]+R*Math.sin(th),hx:Math.sin(th),hy:-Math.cos(th),arc:true}; };
    const near=(x,y)=>{ let best=null; for(const p of P){ let s, v, e;
        if(p.k==='l'){ const dx=x-p.a[0], dy=y-p.a[1], d=dx*p.u[0]+dy*p.u[1], dc=Math.max(0,Math.min(p.len,d)); s=p.s0+dc; v=dx*-p.u[1]+dy*p.u[0]; e=Math.abs(d-dc); }
        else { const dx=x-p.c[0], dy=y-p.c[1]; let th=Math.atan2(dy,dx), d=mod(p.t0-th,2*Math.PI); if(d>Math.PI*1.25)d-=2*Math.PI; const dc=Math.max(0,Math.min(A,d*R)); s=p.s0+dc; v=Math.hypot(dx,dy)-R; e=Math.abs(d*R-dc); }
        const sc=Math.hypot(v,e); if(!best||sc<best.sc)best={s,v,sc,arc:p.k==='a',e}; } return best; };
    const arcs=P.filter(p=>p.k==='a').map(p=>[p.s0,p.s0+p.len]), wide=s=>{ s=mod(s,L); let d=1e9; for(const [a,b] of arcs)d=Math.min(d,s<a?a-s:s>b?Math.min(s-b,L-s+a):0); d=Math.min(d,arcs[0][0]+L-s); return d<=0?1:d>=12?0:(t=>t*t*(3-2*t))(1-d/12); };
    TRK[id]={id,L,P,pt,near,wide,hin:s=>2.2+3*wide(s),hout:s=>2.2+.4*wide(s),line:t}; }

  // the stations: A's is the old one in 009-down; B to H are made here the same size as A's (29 along, 21.8 across: track, platform, track)
  const LEN=M.SL.L, XW=21.8, P0=4.4, P1=17.4, MID=(P0+P1)/2, EX0=10.9, EX1=13.9, ED=3, COLX=[P0+1.5,P1-2.2], COLY=M.SL.COLY, STEPU=[[.6,1.8],[LEN-1.6,LEN-.4]];
  const OLD=(SHARED.SECTION&&SHARED.SECTION.id)||'A';
  const STA=D.stations.filter(d=>SECTIONS.loaded.some(b=>b.id===d.id)).map(d=>d.id===OLD?{...d,x:MX(M.at(0,LEN/2).x)}:d).map((d,i)=>{ const sg=d.side==='south'?-1:1, yi=D.tracks.inner[d.side], st={...d,i,sg,x0:d.x-LEN/2,my:a=>yi-sg*2.2+sg*a,old:d.id===((SHARED.SECTION&&SHARED.SECTION.id)||'A')};
    st.s={}; for(const k in TRK)st.s[k]=TRK[k].near(d.x,D.tracks[k][d.side]).s;
    st.P=(u,a,h)=>[WX(st.x0+u),H(h),WZ(st.my(a))]; st.ua=(x,z)=>({u:MX(x)-st.x0,a:(MZ=>sg>0?MZ-(yi-2.2):(yi+2.2)-MZ)(MY(z))});
    const sec=SECTIONS.of(d.id); st.street=d.side==='south'?SECTIONS.streets.south:SECTIONS.streets.north; st.sec=sec;
    const ky=d.side==='south'?[-75.5,-72.5]:[418+72.5,418+75.5]; st.kiosk={x0:d.x-3,x1:d.x+3,y0:ky[0],y1:ky[1]}; st.out={x:d.x-4.5,y:d.side==='south'?-74.5:418+74.5};
    return st; });
  const order=t=>STA.slice().sort((a,b)=>t.dir*(a.s[t.track]-b.s[t.track]));

  // the textures: small pictures repeated, so the whole loop costs a few canvases
  const tex=(w,h,fn,rep)=>{ const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const g=cv.getContext('2d');
    const im=g.createImageData(w,h); for(let j=0;j<h;j++)for(let i=0;i<w;i++){ const c=fn(i,j), k=(j*w+i)*4; im.data[k]=c[0]; im.data[k+1]=c[1]; im.data[k+2]=c[2]; im.data[k+3]=255; } g.putImageData(im,0,0);
    const t=new THREE.CanvasTexture(cv); t.magFilter=THREE.NearestFilter; t.minFilter=THREE.NearestMipmapNearestFilter; t.colorSpace=THREE.SRGBColorSpace; if(rep)t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; };
  const draw=(w,h,fn)=>{ const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const g=cv.getContext('2d'); fn(g,w,h); const t=new THREE.CanvasTexture(cv); t.magFilter=THREE.LinearFilter; t.minFilter=THREE.LinearMipmapLinearFilter; t.colorSpace=THREE.SRGBColorSpace; return t; };
  const PX=12, BED=8.8;
  const bedTex=tex(Math.round(1.1*24),Math.round(BED*24),(i,j)=>{ const y=(i+.5)/24, x=(j+.5)/24-BED/2, ax=Math.abs(x), r=Math.abs(ax-.7);
    if(r<.07)return r<.025?[202,204,208]:sh([116,112,108],.85+.2*vn(y*2,x,7)); if(r<.14&&y<.34)return [70,52,40];
    if(ax<.98&&y<.34)return sh([96,66,44],.7+.35*hash(Math.floor(x*4),3,11)); const n=hash(Math.floor(x*14),Math.floor(y*14),103);
    return sh(n<.3?[34,32,34]:n<.6?[26,25,26]:[46,42,40],.8+.4*vn(x*.7,y*3,105)); },true);
  const wallTex=tex(9*PX,86,(i,j)=>{ const u=(i+.5)/PX, z=140-(j+.5)*2, n=hash(Math.floor(u*24),Math.floor(z/2),97), c=n<.3?[60,58,54]:n>.85?[78,76,72]:[68,66,62];
    const g=.8+.4*vn(u*.5,z/30,141); return z<-26?sh(c,.55*g):Math.abs(z-30)<3?sh(c,.6*g):u<.12?sh(c,.5*g):sh(c,g); },true);
  const tileTex=tex(6*PX,114,(i,j)=>{ const u=(i+.5)/PX, z=196-(j+.5)*2, px=u*24, tx=Math.floor(px/6), tz=Math.floor((z+32)/7), grout=px-tx*6<1||(z+32)-tz*7<1.4;
    const c=z<0?(grout?[52,54,52]:[80,82,78]):z>=96&&z<112?(grout?[16,16,18]:[30,92,58]):(grout?[160,166,160]:[194,200,192]);
    let g=(.93+.1*hash(tx,tz,5))*(.82+.24*vn(u*.35,z/40,9)); g*=1-.28*Math.max(0,1-(z+32)/80); g*=1-.3*Math.max(0,Math.min(1,(z-140)/56)); return sh(c,g); },true);
  const floorTex=tex(13*PX,4*PX,(i,j)=>{ const x=(i+.5)/PX, y=(j+.5)/PX, e=Math.min(x,13-x);
    if(e<.12)return sh([156,152,140],.9+.1*hash(i,j,3)); if(e<.9)return e>.84?[40,40,36]:sh([228,198,46],.9+.1*hash(i,j,77));
    const gx=mod(x-.9,1), gy=mod(y,1); if(gx<.05||gy<.05)return [94,102,98]; return sh([150,163,156],.86+.14*hash(Math.floor(x-.9),Math.floor(y),61)*(.8+.4*vn(x*.3,y*.3,71))); },true);
  const edgeTex=tex(2*PX,32,(i,j)=>{ const z=-(j+.5); if(z>-3)return [170,160,120]; if(z>-7)return [36,36,34]; return sh([98,98,92],.8+.3*vn(i/PX*2,z/6,133)); },true);
  const PT=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6); cutWalls.push({pl:PT,nx:0,nz:0,foot:H(40),always:true,me:null});
  const lam=(map,o={})=>new THREE.MeshLambertMaterial({map,side:THREE.DoubleSide,clippingPlanes:o.cut||[PT],...o.m});
  const MBED=lam(bedTex), MWALL=lam(wallTex), MTILE=lam(tileTex), MFLOOR=lam(floorTex), MEDGE=lam(edgeTex), MDARK=new THREE.MeshLambertMaterial({color:0x141416,side:THREE.DoubleSide,clippingPlanes:[PT]});
  const geo=(P,U)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2)); g.computeVertexNormals(); return g; };
  const quad=(a,b,c,d,mat,uv=[0,0,1,0,1,1,0,1])=>{ const me=new THREE.Mesh(geo([...a,...b,...c,...a,...c,...d],[uv[0],uv[1],uv[2],uv[3],uv[4],uv[5],uv[0],uv[1],uv[4],uv[5],uv[6],uv[7]]),mat); me.receiveShadow=true; scene.add(me); return me; };
  const solid=(q,h=196)=>{ SOL.down.push(q); FIX.down.push([q[0],q[1],0,q[2],q[3],h*ZU]); };
  const solidW=(ax,az,bx,bz,h)=>solid([Math.min(ax,bx),Math.min(az,bz),Math.max(ax,bx),Math.max(az,bz)],h);

  // the tunnels: one strip per stretch between stations on each track, its floor, two walls and a roof; lamps every 18 tiles, a real light every 36
  const TG=new THREE.Group(); TG.name='loop-tunnels'; scene.add(TG);
  const BEDS=STA.map(st=>{ if(!st.old)return {x0:st.x0,x1:st.x0+LEN,y0:Math.min(st.my(0),st.my(XW)),y1:Math.max(st.my(0),st.my(XW))}; const p=M.at(0,0), q=M.at(XW,LEN);
    return {x0:MX(Math.min(p.x,q.x)),x1:MX(Math.max(p.x,q.x)),y0:MY(Math.min(p.z,q.z)),y1:MY(Math.max(p.z,q.z))}; });   // A's bed is where 009-down built it
  const LAMPG=new THREE.BoxGeometry(.12*T,8*ZU,.6*T), LAMPM=new THREE.MeshBasicMaterial({color:0xffe2a0,clippingPlanes:[PT]}), lampAt=[];
  // only the loaded sections' stretch of each track: a tunnel runs from a station to the section's edge and stops at a black end wall
  const LV=SECTIONS.live, inLive=(tr,s)=>{ const o=tr.pt(s); return o.x>LV.x0&&o.x<LV.x1&&o.y>LV.y0&&o.y<LV.y1; }, ENDS={};
  const free=k=>{ const tr=TRK[k], L=tr.L, cut=STA.map(st=>[st.s[k]-LEN/2,st.s[k]+LEN/2]).sort((a,b)=>a[0]-b[0]), out=[]; ENDS[k]=[];
    for(let i=0;i<cut.length;i++){ const a=cut[i][1], b=i+1<cut.length?cut[i+1][0]:cut[0][0]+L; let p=a, q=b; while(p<b&&inLive(tr,p+.5))p+=.5; while(q>p&&inLive(tr,q-.5))q-=.5;
      if(p>=q-.5){ out.push([a,b]); continue; } if(p>a){ out.push([a,p]); ENDS[k].push({s:p,dir:1}); } if(q<b){ out.push([q,b]); ENDS[k].push({s:q,dir:-1}); } } return out; };
  for(const k in TRK){ const tr=TRK[k];
    for(const [a,b] of free(k)){ for(let p=a;p<b-.01;p+=60){ const q=Math.min(b,p+60), n=Math.max(2,Math.ceil((q-p)/2)), S=[]; for(let i=0;i<=n;i++)S.push(p+(q-p)*i/n);
        const F=[],FU=[],WL=[],WLU=[],WR=[],WRU=[],C=[],CU=[];
        const at=(s,v,h)=>{ const o=tr.pt(s), nx=-o.hy, ny=o.hx; return [WX(o.x+nx*v),H(h),WZ(o.y+ny*v)]; };
        // on a bend the floor's inner edge sweeps back over a station's track bed: what lies on one is left out
        const cut=(P,f)=>{ const O=[]; P.forEach((q,i)=>{ const r=P[(i+1)%P.length], dq=f(q), dr=f(r); if(dq>=0)O.push(q); if(dq>=0!==dr>=0){ const t=dq/(dq-dr); O.push({x:q.x+(r.x-q.x)*t,y:q.y+(r.y-q.y)*t,u:q.u+(r.u-q.u)*t,w:q.w+(r.w-q.w)*t}); } }); return O; };
        const off=P=>{ let L=[P]; for(const {x0,x1,y0,y1} of BEDS){ const N=[];
            for(const Q of L){ if(Q.every(q=>q.x<=x0)||Q.every(q=>q.x>=x1)||Q.every(q=>q.y<=y0)||Q.every(q=>q.y>=y1)){ N.push(Q); continue; }
              const mid=cut(cut(Q,q=>q.x-x0),q=>x1-q.x); N.push(cut(Q,q=>x0-q.x),cut(Q,q=>q.x-x1),cut(mid,q=>y0-q.y),cut(mid,q=>q.y-y1)); }
            L=N.filter(Q=>Q.length>2); } return L; };
        const floor=T3=>{ for(const P of off(T3.map(([s,v])=>{ const o=tr.pt(s); return {x:o.x-o.hy*v,y:o.y+o.hx*v,u:s/1.1,w:(v+BED/2)/BED}; })))
          for(let i=1;i+1<P.length;i++)for(const q of [P[0],P[i],P[i+1]]){ F.push(WX(q.x),H(-32),WZ(q.y)); FU.push(q.u,q.w); } };
        for(let i=0;i<n;i++){ const s0=S[i], s1=S[i+1], a0=-tr.hin(s0), a1=-tr.hin(s1), b0=tr.hout(s0), b1=tr.hout(s1);
          for(const T3 of [[[s0,a0],[s1,a1],[s1,b1]],[[s0,a0],[s1,b1],[s0,b0]]])floor(T3);
          for(const [B,U,v0,v1] of [[WL,WLU,a0,a1],[WR,WRU,b0,b1]]){ B.push(...at(s0,v0,-32),...at(s1,v1,-32),...at(s1,v1,140),...at(s0,v0,-32),...at(s1,v1,140),...at(s0,v0,140));
            U.push(s0/9,0,s1/9,0,s1/9,1,s0/9,0,s1/9,1,s0/9,1); }
          C.push(...at(s0,a0,140),...at(s1,b1,140),...at(s1,a1,140),...at(s0,a0,140),...at(s0,b0,140),...at(s1,b1,140)); for(let z=0;z<6;z++)CU.push(0,0); }
        for(const [B,U,m] of [[F,FU,MBED],[WL,WLU,MWALL],[WR,WRU,MWALL],[C,CU,MDARK]]){ const me=new THREE.Mesh(geo(B,U),m); me.receiveShadow=true; TG.add(me); } }
      { const at=(s,v)=>{ const o=tr.pt(s); return [o.x-o.hy*v,o.y+o.hx*v]; }, side=s=>[-tr.hin(s)-.3,tr.hout(s)+.3], run=(s0,s1)=>{ for(const k of [0,1]){ const p=at(s0,side(s0)[k]), q=at(s1,side(s1)[k]);
          solid([WX(Math.min(p[0],q[0])-.36),WZ(Math.min(p[1],q[1])-.36),WX(Math.max(p[0],q[0])+.36),WZ(Math.max(p[1],q[1])+.36)]); } };
        let r0=null; for(let s=a+.4;s<b-.3;s+=.7){ const bent=tr.pt(s).arc||tr.wide(s)>0; if(!bent){ if(r0==null)r0=s; continue; } if(r0!=null){ run(r0,s); r0=null; }
          for(const v of side(s)){ const [x,y]=at(s,v); solid([WX(x-.36),WZ(y-.36),WX(x+.36),WZ(y+.36)]); } } if(r0!=null)run(r0,b-.4); }
      for(let s=a+9;s<b-4;s+=18){ const o=tr.pt(s), v=tr.hout(s)-.06, x=o.x-o.hy*v, y=o.y+o.hx*v; lampAt.push({x:WX(x),z:WZ(y),r:Math.atan2(o.hx,o.hy)});
        if(Math.round((s-a-9)/18)%2===0){ const L=new THREE.PointLight(new THREE.Color(1,.86,.62),LAMPI*.4,10*T,LAMPD); L.position.set(WX(o.x),H(30),WZ(o.y)); L.userData.i0=L.intensity; TG.add(L); lamps.push(L); } } } }
  { const IM=new THREE.InstancedMesh(LAMPG,LAMPM,lampAt.length), o=new THREE.Object3D(); lampAt.forEach((l,i)=>{ o.position.set(l.x,H(66),l.z); o.rotation.set(0,l.r,0); o.updateMatrix(); IM.setMatrixAt(i,o.matrix); }); TG.add(IM); }

  { const CAPM=new THREE.MeshBasicMaterial({color:0x000000,side:THREE.DoubleSide,clippingPlanes:[PT]});
    for(const k in ENDS)for(const e of ENDS[k]){ const tr=TRK[k], o=tr.pt(e.s), nx=-o.hy, ny=o.hx, a=-tr.hin(e.s)-.3, b=tr.hout(e.s)+.3, at=(v,h)=>[WX(o.x+nx*v),H(h),WZ(o.y+ny*v)];
      const g=geo([...at(a,-32),...at(b,-32),...at(b,140),...at(a,-32),...at(b,140),...at(a,140)],[0,0,1,0,1,1,0,0,1,1,0,1]); TG.add(new THREE.Mesh(g,CAPM));
      const p=at(a,0), q=at(b,0), d=[o.hx*e.dir*.4*T,o.hy*e.dir*.4*T]; solid([Math.min(p[0],q[0],p[0]+d[0],q[0]+d[0])-.1,Math.min(p[2],q[2],p[2]+d[1],q[2]+d[1])-.1,Math.max(p[0],q[0],p[0]+d[0],q[0]+d[0])+.1,Math.max(p[2],q[2],p[2]+d[1],q[2]+d[1])+.1]); } }
  LOOP.ENDS=ENDS;

  // the stations B to H, and every station's signs
  const SIGN={y:[24,24,26],ink:[248,248,242],t1:'#f0a72a',t2:'#38b7a6',ex:'#0f6b34'};
  const font=(g,px,w=800)=>{ g.font=w+' '+px+'px "Helvetica Neue",Helvetica,Arial,sans-serif'; };
  const bullet=(g,x,y,r,n)=>{ g.fillStyle=n===1?SIGN.t1:SIGN.t2; g.beginPath(); g.arc(x,y,r,0,7); g.fill(); g.fillStyle='#111'; font(g,r*1.3,900); g.textAlign='center'; g.textBaseline='middle'; g.fillText(n,x,y+r*.06); g.textAlign='left'; };
  const TR=Object.fromEntries(D.trains.map(t=>[t.id,t])), next=(st,t)=>{ const L=order(t), i=L.indexOf(st); return L[(i+1)%L.length]; };
  const REP=[]; const sign=(mk,P,w,h,cut=[],peek,face)=>{ const t=draw(w,h,mk); REP.push({t,mk,w,h}); const m=new THREE.MeshBasicMaterial({map:t,clippingPlanes:cut}), me=[quad(...P,m),quad(P[1],P[0],P[3],P[2],m)];
    if(face){ const V=THREE.Vector3, c=new V(...P[0]).add(new V(...P[2])).multiplyScalar(.5), n=new V().crossVectors(new V(...P[1]).sub(new V(...P[0])),new V(...P[3]).sub(new V(...P[0]))), k=n.dot(new V(...face).sub(c))>0?1:0; me[k].removeFromParent(); me.splice(k,1); } if(peek)me.forEach(e=>PEEK.whole(e)); return {me,t,m}; };
  const nameSign=(g,w,h,st)=>{ '@later'; g.fillStyle='#ddd8c8'; g.fillRect(0,0,w,h); g.strokeStyle='#2f6b45'; g.lineWidth=h*.12; g.strokeRect(0,0,w,h); g.fillStyle='#111'; font(g,h*.52,900); g.textBaseline='middle';
    const nm=TEXT.t('loop.name',null,{street:st.name}), tw=g.measureText(nm).width; g.fillText(nm,(w-tw-h*.7)/2,h*.54); g.lineWidth=h*.05; g.strokeStyle='#111'; const bx=(w+tw-h*.5)/2+h*.1; g.strokeRect(bx,h*.27,h*.46,h*.46); font(g,h*.34,900); g.fillText(st.id,bx+h*.1,h*.52); };
  const trackSign=(g,w,h,st,t)=>{ g.fillStyle='#050505'; g.fillRect(0,0,w,h); bullet(g,h*.55,h/2,h*.36,t.id); g.fillStyle='#f6f6f1'; font(g,h*.34); g.textBaseline='middle';
    const nx=next(st,t), nn=next(nx,t); g.fillText(STA.length>1?TEXT.t('loop.track',null,{next:nx.name}):TEXT.t('loop.shuttle',null,{street:st.name}),h*1.1,h*.36); font(g,h*.22,600); g.fillStyle='#c9c9c0'; if(STA.length>1)g.fillText(TEXT.t('loop.then',null,{then:nn.name,after:next(nn,t).name}),h*1.1,h*.74); };
  const exitSign=(g,w,h,st)=>{ '@later'; g.fillStyle=SIGN.ex; g.fillRect(0,0,w,h); g.strokeStyle='#bff2b0'; g.lineWidth=h*.06; g.strokeRect(h*.12,h*.2,h*1.7,h*.6); g.fillStyle='#bff2b0'; font(g,h*.36,900); g.textBaseline='middle';
    g.fillText(TEXT.t('loop.exit',null,{id:st.id}),h*.24,h*.52); g.fillStyle='#f4fff0'; font(g,h*.42); g.fillText(TEXT.t('loop.up',null,{street:st.street}),h*2.1,h*.4); font(g,h*.24,600); g.fillText(TEXT.t('loop.exitsub',null,{name:st.name,id:st.id}),h*2.1,h*.76); };
  const mapSign=(g,w,h,st)=>{ g.fillStyle='#0b0d0c'; g.fillRect(0,0,w,h); g.fillStyle='#f6f6f1'; font(g,h*.07); g.fillText(TEXT.t('loop.map',null,{street:st.name}),w*.05,h*.1); const A=SECTIONS.live, m=w*.08, sx=(w-2*m)/(A.x1-A.x0), sy=(h*.62)/(A.y1-A.y0), X=x=>m+(x-A.x0)*sx, Y=y=>h*.16+(A.y1-y)*sy;
    g.fillStyle='#22382a'; g.fillRect(X(A.x0),Y(A.y1),(A.x1-A.x0)*sx,(A.y1-A.y0)*sy); g.strokeStyle='#3a3f3c'; g.lineWidth=1; for(const b of SECTIONS.loaded)g.strokeRect(X(b.x0),Y(b.y1),(b.x1-b.x0)*sx,(b.y1-b.y0)*sy);
    g.save(); g.beginPath(); g.rect(X(A.x0),Y(A.y1),(A.x1-A.x0)*sx,(A.y1-A.y0)*sy); g.clip(); for(const k of ['outer','inner']){ const t=D.tracks[k]; g.strokeStyle=k==='outer'?SIGN.t1:SIGN.t2; g.lineWidth=Math.max(2,h*.012); g.strokeRect(X(t.west),Y(t.north),(t.east-t.west)*sx,(t.north-t.south)*sy); } g.restore();
    for(const s of STA){ const x=X(s.x), y=Y(D.tracks.inner[s.side]+(s.side==='south'?-8.7:8.7)), r=h*.035; g.fillStyle=s===st?'#e7685a':'#050505'; g.beginPath(); g.arc(x,y,r,0,7); g.fill(); g.strokeStyle='#f6f6f1'; g.lineWidth=2; g.stroke();
      g.fillStyle='#f6f6f1'; font(g,r*1.1,900); g.textAlign='center'; g.textBaseline='middle'; g.fillText(s.id,x,y+1); font(g,h*.032,600); g.fillText(s.name,x,y+(s.side==='south'?r*2.2:-r*2.2)); g.textAlign='left'; }
    font(g,h*.05,700); g.fillStyle='#e7685a'; g.fillText(TEXT.t('loop.here',null),w*.05,h*.93); bullet(g,w*.5,h*.92,h*.035,1); g.fillStyle='#f6f6f1'; font(g,h*.04,600); g.fillText(TEXT.t('loop.train1',null,{next:STA.length>1?next(st,D.trains[0]).name:st.name}),w*.53,h*.92); bullet(g,w*.76,h*.92,h*.035,2); g.fillStyle='#f6f6f1'; g.fillText(TEXT.t('loop.train2',null,{next:STA.length>1?next(st,D.trains[1]).name:st.name}),w*.79,h*.92); };
  for(const st of STA){ const P=st.P, Q=(u0,a0,u1,a1,h)=>[P(u0,a0,h),P(u1,a0,h),P(u1,a1,h),P(u0,a1,h)];
    const IN=P(LEN/2,MID,90), cutAt=(a,nx)=>{ const pl=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6), n=new THREE.Vector3(...P(0,a+nx,0)).sub(new THREE.Vector3(...P(0,a,0))).normalize(); cutWalls.push({pl,nx:n.x,nz:n.z,foot:H(-24),me:null}); return pl; };
    st.signs={}; let pw0, pw1, pe1;
    if(!st.old){
      quad(...Q(0,P0,LEN,P1,0),MFLOOR,[0,0,0,LEN/4,1,LEN/4,1,0]);
      for(const [a0,a1] of [[0,P0],[P1,XW]]){ const v=x=>(x-(a0+a1)/2+BED/2)/BED; quad(P(0,a0,-32),P(LEN,a0,-32),P(LEN,a1,-32),P(0,a1,-32),MBED,[0,v(a0),LEN/1.1,v(a0),LEN/1.1,v(a1),0,v(a1)]); }
      for(const a of [P0,P1])quad(P(0,a,-32),P(LEN,a,-32),P(LEN,a,0),P(0,a,0),MEDGE,[0,0,LEN/2,0,LEN/2,1,0,1]);
      const wall=(a,nx)=>{ '@later'; const pl=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6), m=lam(tileTex,{cut:[pl]}), me=quad(P(0,a,-32),P(LEN,a,-32),P(LEN,a,196),P(0,a,196),m,[0,0,LEN/6,0,LEN/6,1,0,1]);
        const n=new THREE.Vector3(...P(0,a+nx,0)).sub(new THREE.Vector3(...P(0,a,0))).normalize(); cutWalls.push({pl,nx:n.x,nz:n.z,foot:H(-24),me}); return pl; };
      pw0=wall(0,1); pw1=wall(XW,-1);
      const endw=(u,R)=>{ '@later'; const pl=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6), m=lam(tileTex,{cut:[pl]}); for(const [a0,a1,z0,z1] of R)quad(P(u,a0,z0),P(u,a1,z0),P(u,a1,z1),P(u,a0,z1),m,[a0/6,(z0+32)/228,a1/6,(z0+32)/228,a1/6,(z1+32)/228,a0/6,(z1+32)/228]);
        const n=new THREE.Vector3(...P(u+(u?-1:1),0,0)).sub(new THREE.Vector3(...P(u,0,0))).normalize(); cutWalls.push({pl,nx:n.x,nz:n.z,foot:H(-24),me:null}); return pl; };
      const pe0=endw(0,[[P0,EX0,-32,196],[EX1,P1,-32,196],[EX0,EX1,-32,0],[EX0,EX1,86,196],[0,P0,140,196],[P1,XW,140,196]]); pe1=endw(LEN,[[P0,P1,-32,196],[0,P0,140,196],[P1,XW,140,196]]);
      quad(...Q(0,0,LEN,XW,196),MDARK);
      quad(...Q(-ED,EX0,0,EX1,0),MFLOOR,[.3,0,.3,ED/4,.53,ED/4,.53,0]); for(const a of [EX0,EX1])quad(P(-ED,a,0),P(0,a,0),P(0,a,86),P(-ED,a,86),MWALL,[0,0,ED/9,0,ED/9,.6,0,.6]); quad(P(-ED,EX0,0),P(-ED,EX1,0),P(-ED,EX1,86),P(-ED,EX0,86),MDARK); quad(...Q(-ED,EX0,0,EX1,86),MDARK);
      const sb=(u0,a0,u1,a1,h)=>{ const p=P(u0,a0,0), q=P(u1,a1,0); solidW(p[0],p[2],q[0],q[2],h); };
      sb(0,-.4,LEN,0); sb(0,XW,LEN,XW+.4); sb(LEN,P0,LEN+.4,P1); sb(-.4,P0,0,EX0); sb(-.4,EX1,0,P1); sb(-ED,EX0-.4,0,EX0); sb(-ED,EX1,0,EX1+.4); sb(-ED-.4,EX0,-ED,EX1);
      const colM=lam(tileTex,{m:{color:0xd8dcd6}}); for(const cx of COLX)for(const cy of COLY){ const bx=new THREE.Mesh(new THREE.BoxGeometry(.7*T,196*ZU,.7*T),colM), c=P(cy+.35,cx+.35,98); bx.position.set(...c); scene.add(bx); sb(cy,cx,cy+.7,cx+.7); }
      const woodM=new THREE.MeshLambertMaterial({color:0x9a6a3c}); for(const by of M.SL.BENCH){ const c=P(by+1.6,MID,8), seat=new THREE.Mesh(new THREE.BoxGeometry(3.2*T,16*ZU,1.4*T),woodM); seat.position.set(...c); scene.add(seat);
        const back=new THREE.Mesh(new THREE.BoxGeometry(3.2*T,36*ZU,.16*T),woodM); back.position.set(...P(by+1.6,MID,18)); scene.add(back); sb(by,MID-.7,by+3.2,MID+.7); }
      const tube=new THREE.MeshBasicMaterial({color:0xeaffef,clippingPlanes:[PT]}); const FIXY=M.SL.FIXY; for(const fy of FIXY){ const b=new THREE.Mesh(new THREE.BoxGeometry(3*T,2*ZU,.3*T),tube); b.position.set(...P(fy,MID,150)); scene.add(b); }
      for(const fy of FIXY){ const L=new THREE.PointLight(new THREE.Color(.74,1,.8),LAMPI*1.9,17*T,LAMPD); L.position.set(...P(fy,MID,140)); L.userData.i0=L.intensity; scene.add(L); lamps.push(L); }
      for(const [a,s] of [[.04,1],[XW-.04,-1]])for(const u of [7,22]){ const w=6; sign((g,W,Hh)=>nameSign(g,W,Hh,st),[P(u-w/2,a,62),P(u+w/2,a,62),P(u+w/2,a,86),P(u-w/2,a,86)],420,64,[s>0?pw0:pw1],false,IN); }
      st.signs.exit=sign((g,W,Hh)=>exitSign(g,W,Hh,st),[P(.05,EX0-2.6,92),P(.05,EX1+2.6,92),P(.05,EX1+2.6,116),P(.05,EX0-2.6,116)],512,72,[pe0],false,IN);
      st.signs.map=sign((g,W,Hh)=>mapSign(g,W,Hh,st),[P(LEN-.05,MID-1,40),P(LEN-.05,MID+1,40),P(LEN-.05,MID+1,99),P(LEN-.05,MID-1,99)],512,512,[pe1],false,IN); }
    else { pe1=cutAt(LEN,-1); pw0=cutAt(0,1); pw1=cutAt(XW,-1);   // gone with their walls when a wall is cut away
      st.signs.map=sign((g,W,Hh)=>mapSign(g,W,Hh,st),[P(LEN-.05,MID-1,36),P(LEN-.05,MID+1,36),P(LEN-.05,MID+1,95),P(LEN-.05,MID-1,95)],512,512,[pe1],false,IN);
      // the same map at the platform's other end, on the street end's wall beside the way out (owner, 11 Nov 2026)
      { const pl=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6), n=new THREE.Vector3(...P(1,0,0)).sub(new THREE.Vector3(...P(0,0,0))).normalize(); cutWalls.push({pl,nx:n.x,nz:n.z,foot:H(-24),me:null});
        st.signs.map0=sign((g,W,Hh)=>mapSign(g,W,Hh,st),[P(.05,EX0-1.4,36),P(.05,EX0-3.4,36),P(.05,EX0-3.4,95),P(.05,EX0-1.4,95)],512,512,[pl],false,IN); } }
    for(const t of D.trains){ const inn=t.track==='inner', a=inn?.04:XW-.04; for(const u0 of [LEN/2-3.5])st.signs['t'+t.id+'_'+u0]=sign((g,W,Hh)=>trackSign(g,W,Hh,st,t),[P(u0,a,100),P(u0+7,a,100),P(u0+7,a,125),P(u0,a,125)],840,150,[inn?pw0:pw1],false,IN); }
    const bz=st.old?100:108, bd=sign((g,w,h)=>{ g.fillStyle='#050505'; g.fillRect(0,0,w,h); },[P(LEN-.05,MID-3,bz),P(LEN-.05,MID+3,bz),P(LEN-.05,MID+3,bz+24),P(LEN-.05,MID-3,bz+24)],512,112,[pe1],false,IN); st.board={t:bd.t,last:''};
    { const steps=st.old?M.SL.STEPS:[STEPU,STEPU]; st.edge={};
      [['inner',P0,steps[0]],['outer',P1,steps[1]]].forEach(([k,e,stp])=>{ const L=st.edge[k]=[]; let u=0; const cut=(a,b)=>{ for(let p=a;p<b-1e-6;p+=1){ const q=Math.min(b,p+1), A=P(p,e-.05,0), B=P(q,e+.05,0), box=[Math.min(A[0],B[0]),Math.min(A[2],B[2]),Math.max(A[0],B[0]),Math.max(A[2],B[2])]; SOL.down.push(box); L.push({box,keep:box.slice(),u0:p,u1:q}); } };
        for(const [a,b] of stp){ if(a>u)cut(u,a); u=b; } if(u<LEN)cut(u,LEN); }); }
    st.box=(()=>{ const p=P(-ED-1,-1,0), q=P(LEN+1,XW+1,0); return {x0:Math.min(p[0],q[0]),x1:Math.max(p[0],q[0]),z0:Math.min(p[2],q[2]),z1:Math.max(p[2],q[2])}; })(); }

  // in a station the tunnels are not drawn: each track's way out is a black mouth; in a tunnel (on foot or riding) they are, and the mouths are not (owner, 28 Oct 2026)
  const MOUTHM=new THREE.MeshBasicMaterial({color:0x000000,side:THREE.DoubleSide,clippingPlanes:[PT]}), MOUTH=[];
  for(const st of STA)for(const u of [-.08,LEN+.08])for(const [a0,a1] of [[0,P0],[P1,XW]])MOUTH.push(quad(st.P(u,a0,-32),st.P(u,a1,-32),st.P(u,a1,140),st.P(u,a0,140),MOUTHM));
  const inStation=(x,z)=>STA.some(st=>{ const b=st.box; if(!(x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1))return false; const {u}=st.ua(x,z); return u>-ED-1&&u<LEN; });
  LOOP.inStation=inStation; LOOP.tunHid=false;
  SYS.add('places',()=>{ const hid=SHARED.LVL==='down'&&inStation(pos.x,pos.z); if(hid===LOOP.tunHid)return; LOOP.tunHid=hid; TG.visible=!hid; for(const m of MOUTH)m.visible=hid; },'009b-tunnels');
  for(const m of MOUTH)m.visible=false;
  // the tunnels are dark: out of a station the level's fill light falls away, leaving the tunnel lamps and the cars' own lights
  { let amb=.1; Object.defineProperty(LEVELS.of.station,'amb',{get:()=>amb,configurable:true});   // how dark: ATMOSPHERE's LIGHT IN THE SUBWAY TUNNELS
    SYS.add('places',dt=>{ const P=DN.P&&DN.P(), want=SHARED.LVL==='down'&&!inStation(pos.x,pos.z)?(P&&P.tun!=null?P.tun:.02):.1; amb+=(want-amb)*Math.min(1,(dt||.016)*1.5); },'009b-dark'); }

  // the board: rows of [train, where to, when], drawn only when they change
  LOOP.board=(st,rows)=>{ const k=JSON.stringify(rows); if(st.board.last===k)return; st.board.last=k; const cv=st.board.t.image, g=cv.getContext('2d'), w=cv.width, h=cv.height;
    g.fillStyle='#050505'; g.fillRect(0,0,w,h); g.textBaseline='middle'; rows.forEach((r,i)=>{ const y=h*(.3+.42*i); bullet(g,h*.2,y,h*.15,r[0]); font(g,h*.24,700); g.fillStyle='#ffb347'; g.fillText(r[1],h*.42,y); const tw=g.measureText(r[2]).width; g.fillText(r[2],w-tw-h*.12,y); });
    st.board.t.needsUpdate=true; };

  // where you are, the ground, and the way up and down
  const inTun=(mx,my)=>{ for(const k in TRK){ const tr=TRK[k], n=tr.near(mx,my); if(n.e<.5&&n.v>-tr.hin(n.s)-.3&&n.v<tr.hout(n.s)+.3&&!STA.some(st=>Math.abs(mod(n.s-st.s[k]+tr.L/2,tr.L)-tr.L/2)<LEN/2))return n; } return null; };
  const inSta=(x,z)=>{ for(const st of STA){ if(st.old)continue; const b=st.box; if(x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1)return st; } return null; };
  const stGround=(st,x,z)=>{ const {u,a}=st.ua(x,z); if(u<0)return u>-ED-.5&&a>EX0-.5&&a<EX1+.5?H(0):null; if(a>=P0&&a<=P1)return H(0);
    const e=a<P0?P0-a:a-P1; if(e<.75&&STEPU.some(([p,q])=>u>=p&&u<q))return H(-8*(1+Math.floor(e/.25))); return H(-32); };
  const hooks={inside:(x,z)=>LOOP.under.some(f=>f.inside(x,z))||!!inSta(x,z)||!!inTun(MX(x),MY(z)),ground:(x,z)=>{ for(const f of LOOP.under)if(f.inside(x,z))return f.ground(x,z); const st=inSta(x,z); if(st)return stGround(st,x,z); return inTun(MX(x),MY(z))?H(-32):null; }};
  LOOP.under=[]; M.more.push(hooks);
  const here=(x,z)=>{ let b=null, bd=1e9; for(const st of STA){ const d=Math.hypot(WX(st.x)-x,WZ(st.my(MID))-z); if(d<bd){ bd=d; b=st; } } return {st:b,d:bd}; };
  M.nextOf=(id,ti)=>{ const st=STA.find(q=>q.id===id); return st&&STA.length>1?next(st,D.trains[ti]).name:null; }; M.nextHere=()=>{ const h=here(pos.x,pos.z); return h.st&&STA.length>1?[next(h.st,D.trains[0]).name,next(h.st,D.trains[1]).name]:null; };
  TEXT.on.push(id=>{ if(id&&!/^loop\./.test(id))return; for(const r of REP){ r.mk(r.t.image.getContext('2d'),r.w,r.h); r.t.needsUpdate=true; } });
  M.label=()=>{ const r=LOOP.riding&&LOOP.riding(); if(r)return r; const h=here(pos.x,pos.z); return h.d<30*T?h.st.name+' STATION · '+h.st.id:'THE LOOP'; };
  LEVELS.of.station.groups.push('loop');
  { const all=[]; for(const k in TRK){ const t=TRK[k].line; all.push([WX(t.west-6),WZ(t.south-6)],[WX(t.east+6),WZ(t.north+6)]); } const B=MODS.station.BOUND;
    for(const [x,z] of all){ B.x0=Math.min(B.x0,x); B.x1=Math.max(B.x1,x); B.z0=Math.min(B.z0,z); B.z1=Math.max(B.z1,z); } }
  let busy=false; const go=async(st,dir)=>{ '@later'; busy=true; await FADE.run(dir==='in'?'ENTERING '+st.name+' STATION':'LEAVING '+st.name+' STATION',()=>{
      if(dir==='in'){ const p=st.P(1.1,(EX0+EX1)/2,0); UI.goTo(p[0],p[2],'down'); if(UI.view==='iso'||UI.view==='map')SHARED.yaw=SHARED.yawTo=M.YAW+(st.sg>0?Math.PI:0); }
      else { UI.goTo(WX(st.out.x),WZ(st.out.y),'up'); if((UI.view==='iso'||UI.view==='map')&&UI.isoTo){ UI.isoTo(); SHARED.yaw=SHARED.yawTo; } } },{hold:120}); busy=false; };
  SYS.add('places',()=>{ if(busy||FADE.busy||UI.freeCam||RAG.on)return; const x=pos.x, z=pos.z;
    if(SHARED.LVL==='down'){ const st=inSta(x,z); if(st){ const {u,a}=st.ua(x,z); if(u<-ED+.5&&a>EX0&&a<EX1)go(st,'out'); } return; }
    if(ROOMS.cur)return; const mx=MX(x), my=MY(z); for(const st of STA){ if(st.old)continue; const k=st.kiosk; if(mx>k.x0&&mx<k.x1&&my>k.y0&&my<k.y1){ go(st,'in'); return; } } },'009b-loop');
  Object.assign(LOOP,{D,TRK,STA,order,WX,WZ,MX,MY,H,here,inSta,hooks,P0,P1,LEN,XW,MID});
  for(const w of cutWalls.slice(c0))if(!w.when)w.when=()=>SHARED.LVL==='down'; });
export {LOOP};
