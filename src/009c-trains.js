// THE TRAINS: TRAINS runs the loop's two trains on the timetable (from the clock, so everyone sees the same train), carries whoever rides, and keeps the stations' boards and the cars' next-stop signs.
import {SHARED, THREE} from './003-shx.js';
import {LEVELS, LITE, pos, SPEED, st, TEXT, UI, USE, VLOOK} from './003b-systems.js';
import {scene} from './004-main.js';
import {grab, LAMPD, LAMPI, lamps, QS, SECTIONS, SYS, TILE, ZU} from './006-map-pre.js';
import {PEEK} from './008-batch.js';
import {LOOP} from './009b-loop.js';
for(const [k,d] of Object.entries({'loop.riding':'TRAIN {id} · TO {next}'}))TEXT.t(k,d);
const TRAINS=window.TRAINS={list:[],skew:0,T:TILE};
await grab('trains',async()=>{ const M=SHARED.METRO, L=LOOP, D=L.D, T=TILE, CARL=28, NCAR=1, SY0=50, CW=2.15, CWI=1.88, GAP=.6, DOORS=[-7.4,0,7.25], DWH=.78, FLOOR=2, FZ=34, SILL=30, WTOP=64, DOORH=82, CEIL=88, TOP=98;
  const mod=(a,n)=>((a%n)+n)%n; let V=0, A=0, ta=0, da=0;
  const runT=d=>d>=2*da?d/V+ta:2*Math.sqrt(d/A), runS=(d,t)=>{ const Tt=runT(d); if(t<=0)return 0; if(t>=Tt)return d; if(d>=2*da){ if(t<ta)return .5*A*t*t; if(t<Tt-ta)return da+V*(t-ta); return d-.5*A*(Tt-t)**2; } return t<Tt/2?.5*A*t*t:d-.5*A*(Tt-t)**2; };
  TRAINS.now=()=>Date.now()/1000+TRAINS.skew;
  { const q=QS.get('traint'); if(q!=null&&q!=='')TRAINS.skew=+q-Date.now()/1000; }

  // the timetable: from A round the loop, 60 s at every station, the runs between them at the trains' speed; train 2 runs a quarter lap behind train 1, so the two never call at a station together (a half lap put the shuttles there at once)
  // the owner's speed (SPEED.of('trains')) runs them faster or slower between stations; the timetable is made again when it changes
  const plan=()=>{ const k=SPEED.of('trains'); V=D.speed*k; A=D.accel*k; ta=V/A; da=V*V/(2*A);
  D.trains.forEach((t,ti)=>{ const tr=L.TRK[t.track], Lt=tr.L, stops=L.order(t), i0=stops.findIndex(s=>s.old), seq=stops.slice(i0).concat(stops.slice(0,i0)), tbl=[]; let tm=0;
    seq.forEach((st,i)=>{ const nx=seq[(i+1)%seq.length], d=mod(t.dir*(nx.s[t.track]-st.s[t.track]),Lt), Tr=runT(d); tbl.push({st,nx,arr:tm,dep:tm+D.dwell,d,T:Tr}); tm+=D.dwell+Tr; });
    const o={...t,i:ti,tr,tbl,lap:tm,off:ti*tm/4,legs:null}; if(TRAINS.list[ti])Object.assign(TRAINS.list[ti],o); else TRAINS.list.push({...o,cars:[]}); });
  // one station loaded: each train shuttles, the station, out to one tunnel end, back, the station, out to the other end, back; every leg takes the same time (a train waits longer in the dark at a nearer end), so the two trains take turns at the platform, one every half leg, for good
  if(L.STA.length===1){ const st=L.STA[0], s0of=tn=>st.s[tn.track], MG=NCAR*(CARL+GAP)/2+2;
    for(const tn of TRAINS.list){ const k=tn.track, s0=s0of(tn), Lt=tn.tr.L, E=L.ENDS[k]||[], fw=E.find(e=>e.dir>0), bk=E.find(e=>e.dir<0);
      tn.ends=[[tn.dir,Math.max(0,(tn.dir>0?(fw?mod(fw.s-s0,Lt):0):(bk?mod(s0-bk.s,Lt):0))-MG)],[-tn.dir,Math.max(0,(tn.dir>0?(bk?mod(s0-bk.s,Lt):0):(fw?mod(fw.s-s0,Lt):0))-MG)]]; }
    const P=D.dwell+12+2*Math.max(...TRAINS.list.flatMap(tn=>tn.ends.map(([,d])=>d>1?runT(d):0)));
    for(const tn of TRAINS.list){ const s0=s0of(tn), legs=[]; let tm=0;
      for(const [sg,d] of tn.ends){ if(d>1){ const Tr=runT(d); legs.push({t0:tm,dur:D.dwell,s0,sg:0,d:0,doors:true}); tm+=D.dwell; legs.push({t0:tm,dur:Tr,s0,sg,d}); tm+=Tr; legs.push({t0:tm,dur:P-D.dwell-2*Tr,s0:s0+sg*d,sg:0,d:0}); tm+=P-D.dwell-2*Tr; legs.push({t0:tm,dur:Tr,s0:s0+sg*d,sg:-sg,d}); tm+=Tr; } else { legs.push({t0:tm,dur:P,s0,sg:0,d:0,doors:true}); tm+=P; } }
      Object.assign(tn,{legs,lap:tm,off:tn.i*P/2,tbl:[{st,nx:st,arr:0,dep:D.dwell}]}); } }
  };
  plan(); SPEED.on(plan);
  const state=(tn,now=TRAINS.now())=>{ const t=mod(now-tn.off,tn.lap);
    if(tn.legs){ const st=L.STA[0]; for(const g of tn.legs)if(t<g.t0+g.dur){ const u=t-g.t0; return g.doors?{s:g.s0,doors:true,at:st,next:st,left:g.dur-u}:{s:g.s0+g.sg*runS(g.d,u),doors:false,at:null,from:st,next:st,left:tn.legs.filter(q=>q.doors&&q.t0>=g.t0+g.dur).concat(tn.legs.filter(q=>q.doors).map(q=>({...q,t0:q.t0+tn.lap})))[0].t0-t}; } return {s:tn.legs[0].s0,doors:true,at:st,next:st,left:0}; }
    for(const e of tn.tbl){ if(t<e.dep)return {s:e.st.s[tn.track],doors:true,at:e.st,next:e.nx,left:e.dep-t};
      if(t<e.dep+e.T)return {s:e.st.s[tn.track]+tn.dir*runS(e.d,t-e.dep),doors:false,at:null,from:e.st,next:e.nx,left:e.dep+e.T-t}; } const e=tn.tbl[0]; return {s:e.st.s[tn.track],doors:true,at:e.st,next:e.nx,left:0}; };
  const until=(tn,st,now=TRAINS.now())=>{ const t=mod(now-tn.off,tn.lap);
    if(tn.legs){ const g=tn.legs.find(q=>q.doors&&t>=q.t0&&t<q.t0+q.dur); if(g)return {now:true,left:g.t0+g.dur-t}; const n=tn.legs.filter(q=>q.doors).map(q=>q.t0<=t?q.t0+tn.lap:q.t0).sort((a,b)=>a-b)[0]; return {now:false,left:n-t}; }
    const e=tn.tbl.find(q=>q.st===st); if(t>=e.arr&&t<e.dep)return {now:true,left:e.dep-t}; return {now:false,left:mod(e.arr-t,tn.lap)}; };
  TRAINS.state=state; TRAINS.until=until;

  // the cars: steel outside under graffiti with real window openings and sliding doors; inside bucket seats, partitions, poles and rails, ad cards, two light strips and two lights
  const z=k=>k*ZU, HL0=CARL/2*T, W0=CW*T, WI=CWI*T, F=z(FZ), PX=16, GR=M.GRAF;
  const font=(g,px,w=800)=>{ g.font=w+' '+px+'px "Helvetica Neue",Helvetica,Arial,sans-serif'; };
  const canvas=(w,h)=>{ const cv=document.createElement('canvas'); cv.width=w; cv.height=h; return cv; }, ctex=(cv,rep)=>{ const t=new THREE.CanvasTexture(cv); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; if(rep)t.wrapS=t.wrapT=THREE.RepeatWrapping; return t; };
  const rng=seed=>{ let s=(Math.imul(seed|0,2654435761)^0x9e3779b9)>>>0||7; return ()=>{ s^=s<<13; s>>>=0; s^=s>>>17; s^=s<<5; s>>>=0; return s/4294967296; }; };
  const quad=(G,a,b,c,d,m,uv=[0,0,1,0,1,1,0,1])=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute([...a,...b,...c,...a,...c,...d],3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([uv[0],uv[1],uv[2],uv[3],uv[4],uv[5],uv[0],uv[1],uv[4],uv[5],uv[6],uv[7]],2)); g.computeVertexNormals(); const me=new THREE.Mesh(g,m); me.receiveShadow=true; G.add(me); return me; };
  const box=(G,w,h,d,x,y,zz,m)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); b.position.set(x,y,zz); G.add(b); return b; };
  // where the windows and doors are along a side (tiles from the car's middle)
  const bays=[[-CARL/2+.5,DOORS[0]-DWH],[DOORS[0]+DWH,DOORS[1]-DWH],[DOORS[1]+DWH,DOORS[2]-DWH],[DOORS[2]+DWH,CARL/2-.5]];
  const WINS=bays.flatMap(([a,b])=>{ const n=b-a>5?2:1, w=2.15, gap=(b-a-n*w)/(n+1); return Array.from({length:n},(_,i)=>[a+gap*(i+1)+w*i,a+gap*(i+1)+w*(i+1)]); });
  const Y0=FZ-12, HH=FZ+TOP+12-Y0;
  const sidePic=(seed)=>{ const W=CARL*PX, Hh=Math.round(HH*1.3), cv=canvas(W,Hh), g=cv.getContext('2d'), r=rng(seed), pick=a=>a[Math.floor(r()*a.length)], X=u=>(u+CARL/2)*PX, Yz=zz=>Hh-(zz-Y0)*1.3;
    const gr=g.createLinearGradient(0,0,0,Hh); gr.addColorStop(0,'#9ea3a7'); gr.addColorStop(.5,'#b9bdc0'); gr.addColorStop(1,'#7e8387'); g.fillStyle=gr; g.fillRect(0,0,W,Hh);
    for(let x=0;x<W;x+=3){ g.fillStyle=x%6?'rgba(255,255,255,.05)':'rgba(0,0,0,.07)'; g.fillRect(x,Yz(FZ+SILL-6),1,Yz(FZ+4)-Yz(FZ+SILL-6)); }
    g.fillStyle='#5c6166'; g.fillRect(0,Yz(FZ+SILL-2),W,2); g.fillRect(0,Yz(FZ+TOP-3),W,2); g.fillStyle='#2a2d30'; g.fillRect(0,Yz(FZ+2),W,Yz(Y0)-Yz(FZ+2));
    for(let x=4;x<W;x+=7){ g.fillStyle='rgba(40,40,44,.5)'; g.fillRect(x,Yz(FZ+SILL-4),1,1); g.fillRect(x,Yz(FZ+WTOP+6),1,1); }
    let x=-8; while(x<W){ const sz=24+r()*22; x+=GR.bubble(g,r,pick,x,Yz(FZ+6+r()*14),sz,null,pick(GR.BRIGHT),pick(GR.BRIGHT),pick(GR.BRIGHT))*(.8+r()*.25)+r()*26; }
    GR.wall(g,r,pick,W,Hh,40,Yz(FZ+TOP-6),Yz(FZ+4));
    g.fillStyle='#e9e6dc'; font(g,7,700); g.fillText(String(7000+seed*37%2900),X(-CARL/2+.6),Yz(FZ+WTOP+10));
    for(const m of DOORS){ g.strokeStyle='#33373b'; g.lineWidth=1.5; g.strokeRect(X(m-DWH)-1,Yz(FZ+DOORH)-1,DWH*2*PX+2,(DOORH)*1.3+2); }
    g.globalCompositeOperation='destination-out'; g.fillStyle='#000';
    const rr=(x0,y0,w,h,R)=>{ g.beginPath(); g.moveTo(x0+R,y0); g.arcTo(x0+w,y0,x0+w,y0+h,R); g.arcTo(x0+w,y0+h,x0,y0+h,R); g.arcTo(x0,y0+h,x0,y0,R); g.arcTo(x0,y0,x0+w,y0,R); g.fill(); };
    for(const [a,b] of WINS)rr(X(a),Yz(FZ+WTOP),(b-a)*PX,(WTOP-SILL)*1.3,5);
    for(const m of DOORS)g.fillRect(X(m-DWH),Yz(FZ+DOORH),DWH*2*PX,DOORH*1.3+1);
    g.globalCompositeOperation='source-over'; g.strokeStyle='#1c1e20'; g.lineWidth=2; for(const [a,b] of WINS){ g.beginPath(); g.roundRect?g.roundRect(X(a),Yz(FZ+WTOP),(b-a)*PX,(WTOP-SILL)*1.3,5):g.rect(X(a),Yz(FZ+WTOP),(b-a)*PX,(WTOP-SILL)*1.3); g.stroke(); }
    return cv; };
  const endPic=(front,tn)=>{ const W=Math.round(CW*2*PX*1.5), Hh=Math.round(HH*1.3), cv=canvas(W,Hh), g=cv.getContext('2d'), Yz=zz=>Hh-(zz-Y0)*1.3, cx=W/2;
    g.fillStyle='#a5aaae'; g.fillRect(0,0,W,Hh); g.fillStyle='#2a2d30'; g.fillRect(0,Yz(FZ+2),W,Hh); g.fillStyle='#4a4f54'; g.fillRect(0,Yz(FZ+TOP-3),W,3);
    g.globalCompositeOperation='destination-out'; g.fillRect(cx-W*.13,Yz(FZ+DOORH-4),W*.26,(DOORH-10)*1.3); g.fillRect(cx-W*.13,Yz(FZ+DOORH-4),W*.26,4);
    if(front){ g.fillRect(cx-W*.46,Yz(FZ+WTOP),W*.28,(WTOP-SILL-4)*1.3); g.fillRect(cx+W*.18,Yz(FZ+WTOP),W*.28,(WTOP-SILL-4)*1.3); }
    g.globalCompositeOperation='source-over';
    if(front){ g.fillStyle='#050505'; g.fillRect(cx-W*.42,Yz(FZ+TOP-6),W*.84,14); g.fillStyle=tn.id===1?'#f0a72a':'#38b7a6'; g.beginPath(); g.arc(cx-W*.34,Yz(FZ+TOP-6)+7,6,0,7); g.fill();
      g.fillStyle='#111'; font(g,9,900); g.textAlign='center'; g.textBaseline='middle'; g.fillText(tn.id,cx-W*.34,Yz(FZ+TOP-6)+7.5); g.fillStyle='#ffb347'; font(g,9,700); g.textAlign='left'; g.fillText(tn.way,cx-W*.28,Yz(FZ+TOP-6)+7.5); }
    for(const [lx,col] of [[-.38,front?'#fff6dc':'#ff3a28'],[.38,front?'#fff6dc':'#ff3a28']]){ g.fillStyle='#141414'; g.beginPath(); g.arc(cx+lx*W,Yz(FZ+14),5,0,7); g.fill(); g.fillStyle=col; g.beginPath(); g.arc(cx+lx*W,Yz(FZ+14),3.4,0,7); g.fill(); }
    return cv; };
  const leafPic=(()=>{ const cv=canvas(32,120), g=cv.getContext('2d'); g.fillStyle='#b4b8bb'; g.fillRect(0,0,32,120); g.fillStyle='#1b1d1f'; g.fillRect(0,0,2,120); g.fillRect(30,0,2,120);
    g.globalCompositeOperation='destination-out'; g.fillRect(6,18,20,44); g.globalCompositeOperation='source-over'; g.strokeStyle='#202224'; g.lineWidth=2; g.strokeRect(6,18,20,44);
    g.fillStyle='#d8392f'; g.fillRect(8,70,16,5); return ctex(cv); })();
  const floorTex=(()=>{ const cv=canvas(64,64), g=cv.getContext('2d'); g.fillStyle='#5d6167'; g.fillRect(0,0,64,64); const r=rng(5); for(let i=0;i<700;i++){ g.fillStyle=['#7d8188','#474a4f','#8f8576','#3a3c40'][Math.floor(r()*4)]; g.fillRect(r()*64,r()*64,1,1); } return ctex(cv,true); })();
  const ADS=[['THE STRANGEST FLEA MARKET','EVERY WEEKEND · '+SECTIONS.streets.south,'#f0a72a'],['INJURED? CALL DR. MOTH','1-800-MOTH-LAW','#2f6bd8'],['LEARN TO SWIM','THE BATH HOUSE','#38b7a6'],['MUSEUM OF EARTH','ROCKS · BONES · GEMS','#c94a3a'],
    ['THE ARCADE','INSERT COIN','#9b4ad8'],['THE BODEGA','OPEN ALL NIGHT','#3fbf5a'],['SEE SOMETHING ODD?','SAY SOMETHING ODD','#e8c24a'],['RAG ST LAUNDRY','FOLD · PRESS · FORGET','#e07b9a']];
  const adPic=(seed)=>{ const cv=canvas(1024,40), g=cv.getContext('2d'), r=rng(seed+11); g.fillStyle='#e8e5dc'; g.fillRect(0,0,1024,40); let x=4;
    while(x<1020){ const a=ADS[Math.floor(r()*ADS.length)], w=150+Math.floor(r()*70); g.fillStyle=a[2]; g.fillRect(x,3,w-6,34); g.fillStyle='#fff'; font(g,11,900); g.fillText(a[0].slice(0,24),x+6,17); font(g,8,600); g.fillText(a[1],x+6,30); x+=w; } return ctex(cv); };
  const M_=(c,o={})=>new THREE.MeshLambertMaterial({color:c,side:THREE.DoubleSide,...o});
  const MLOW=M_(0xc4c7c3), MWALL=M_(0xe2dfd5), MCEIL=M_(0xe9e7df,{side:THREE.FrontSide}), MSTEEL=M_(0xb9bdc0), MDARK=M_(0x2a2c2f), MSEAT=[M_(0xe0842a),M_(0xe8bf3e)], MPOLE=M_(0xd3d6d9), MFLOOR=M_(0xffffff,{map:floorTex}), MSTRIP=new THREE.MeshBasicMaterial({color:0xf4f8ff}),
    MGLASS=new THREE.MeshBasicMaterial({color:0x9db3c2,transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide}), MLEAF=new THREE.MeshLambertMaterial({map:leafPic,alphaTest:.5,side:THREE.DoubleSide}), MYEL=M_(0xd9b93a);
  // a car's outside alone (the vehicle editor's preview makes one too, in no scene, no lights)
  const outside=(tn,c)=>{ const ext=new THREE.Group(), HL=HL0, Y=zz=>z(zz);
    for(const s of [-1,1]){ const m=new THREE.MeshLambertMaterial({map:ctex(sidePic(tn.i*17+c*5+(s>0?3:0))),alphaTest:.5,side:THREE.DoubleSide}), zz=s*W0, a=s>0?-HL:HL, b=-a;
      quad(ext,[a,Y(Y0),zz],[b,Y(Y0),zz],[b,Y(FZ+TOP+12),zz],[a,Y(FZ+TOP+12),zz],m,s>0?[0,0,1,0,1,1,0,1]:[1,0,0,0,0,1,1,1]); }
    for(const e of [-1,1]){ const front=(c===0&&e>0), back=(c===NCAR-1&&e<0), m=new THREE.MeshLambertMaterial({map:ctex(endPic(front,tn)),alphaTest:.5,side:THREE.DoubleSide,...(front||back?{emissive:0x111111}:{})});
      quad(ext,[e*HL,Y(Y0),-e*W0],[e*HL,Y(Y0),e*W0],[e*HL,Y(FZ+TOP+12),e*W0],[e*HL,Y(FZ+TOP+12),-e*W0],m);
      if(front)for(const s of [-.38,.38]){ const L=box(ext,.06*T,z(5),.22*T,e*(HL+.03),Y(FZ+14),s*W0*2,new THREE.MeshBasicMaterial({color:0xfff2cc})); }
      if(back)for(const s of [-.38,.38])box(ext,.06*T,z(5),.22*T,e*(HL+.03),Y(FZ+14),s*W0*2,new THREE.MeshBasicMaterial({color:0xff3a28})); }
    { const sh=new THREE.Shape(); sh.moveTo(-W0,0); sh.lineTo(W0,0); sh.lineTo(W0-.35*T,z(8)); sh.lineTo(-W0+.35*T,z(8)); sh.closePath(); const g=new THREE.ExtrudeGeometry(sh,{depth:CARL*T,bevelEnabled:false}); g.rotateY(Math.PI/2); g.translate(-HL,Y(FZ+TOP+12),0);
      const r=new THREE.Mesh(g,M_(0x6e7276)); ext.add(r); for(let k=-2;k<=2;k++)box(ext,1.4*T,z(4),1.2*T,k*5*T,Y(FZ+TOP+21),0,MDARK); }
    box(ext,CARL*T-.4,z(12),W0*1.7,0,Y(FZ-6),0,MDARK); for(const k of [-1,1])box(ext,3.4*T,z(16),W0*1.6,k*(HL-3.4*T),Y(FZ-20),0,M_(0x1e2022));
    return ext; };
  const makeCar=(tn,c)=>{ const G=new THREE.Group(), ext=outside(tn,c), inner=new THREE.Group(), roof=new THREE.Group(), strips=new THREE.Group(), upper={'-1':new THREE.Group(),'1':new THREE.Group()}, seats=[], leaves=[], lights=[];
    G.rotation.order='YXZ'; G.add(ext,inner); inner.add(roof,strips,upper['-1'],upper['1']); const HL=HL0, Y=zz=>z(zz);
    // doors: two leaves each, sliding between the skins
    for(const s of [-1,1])for(const m of DOORS)for(const sg of [-1,1]){ const me=box(G,DWH*T,z(DOORH),.06*T,(m+sg*DWH/2)*T,Y(FZ+DOORH/2),s*(CW-.14)*T,MLEAF); leaves.push({me,x0:me.position.x,s:sg}); }
    // glass in every window
    for(const s of [-1,1])for(const [a,b] of WINS)quad(upper[String(s)],[a*T,Y(FZ+SILL),s*(CW-.04)*T],[b*T,Y(FZ+SILL),s*(CW-.04)*T],[b*T,Y(FZ+WTOP),s*(CW-.04)*T],[a*T,Y(FZ+WTOP),s*(CW-.04)*T],MGLASS);
    // inside: floor, walls round the windows and doors, ceiling and light strips, ad cards, ends
    quad(inner,[-HL+.1,F+.006,-WI],[HL-.1,F+.006,-WI],[HL-.1,F+.006,WI],[-HL+.1,F+.006,WI],MFLOOR,[0,0,CARL/1.5,0,CARL/1.5,CWI*2/1.5,0,CWI*2/1.5]);
    for(const m of DOORS)quad(inner,[(m-DWH)*T,F+.01,-WI],[(m+DWH)*T,F+.01,-WI],[(m+DWH)*T,F+.01,-WI+.35*T],[(m-DWH)*T,F+.01,-WI+.35*T],MYEL),quad(inner,[(m-DWH)*T,F+.01,WI-.35*T],[(m+DWH)*T,F+.01,WI-.35*T],[(m+DWH)*T,F+.01,WI],[(m-DWH)*T,F+.01,WI],MYEL);
    for(const s of [-1,1]){ const zz=s*WI, R=(G2,a,b,h0,h1,m)=>quad(G2,[a*T,Y(FZ+h0),zz],[b*T,Y(FZ+h0),zz],[b*T,Y(FZ+h1),zz],[a*T,Y(FZ+h1),zz],m), U=upper[String(s)];
      for(const [a,b] of bays){ R(inner,a,b,0,SILL,MLOW); const ws=WINS.filter(w=>w[0]>=a&&w[1]<=b); let u=a; for(const [w0,w1] of ws){ R(U,u,w0,SILL,WTOP,MWALL); u=w1; } R(U,u,b,SILL,WTOP,MWALL); R(U,a,b,WTOP,CEIL,MWALL); }
      for(const m of DOORS)R(U,m-DWH,m+DWH,DOORH,CEIL,MWALL);
      const ad=new THREE.MeshBasicMaterial({map:adPic(tn.i*9+c*4+(s>0?1:0))}); for(const [a,b] of bays)quad(U,[a*T,Y(FZ+WTOP+6),zz-s*.02],[b*T,Y(FZ+WTOP+6),zz-s*.02],[b*T,Y(FZ+WTOP+20),zz-s*.06],[a*T,Y(FZ+WTOP+20),zz-s*.06],ad,[a/CARL+.5,0,b/CARL+.5,0,b/CARL+.5,1,a/CARL+.5,1]); }
    quad(roof,[-HL,Y(FZ+CEIL),-WI],[HL,Y(FZ+CEIL),-WI],[HL,Y(FZ+CEIL),WI],[-HL,Y(FZ+CEIL),WI],MCEIL);   // faces down: the ceiling from inside, nothing from above
    for(const s of [-1,1])box(strips,CARL*T-1.2,z(1.6),.22*T,0,Y(FZ+CEIL-1),s*.75*T,MSTRIP);
    for(const e of [-1,1]){ const xe=e*(HL-.06), R=(a,b,h0,h1,m)=>quad(inner,[xe,Y(FZ+h0),a*T],[xe,Y(FZ+h0),b*T],[xe,Y(FZ+h1),b*T],[xe,Y(FZ+h1),a*T],m);
      R(-CWI,-.55,0,CEIL,MWALL); R(.55,CWI,0,CEIL,MWALL); R(-.55,.55,DOORH-6,CEIL,MWALL); R(-.55,.55,0,DOORH-6,MLEAF); }
    // seats along both walls between the doors, a partition at each end of a run, poles and rails
    const pan=[], back=[], skirt=[], part=[], poles=[];
    for(const s of [-1,1])for(const [a,b] of bays){ const n=Math.max(1,Math.floor((b-a-.5)/1.05)), w=(b-a-.5)/n; skirt.push([(a+b)/2,s,b-a-.5]);
      for(let i=0;i<n;i++){ const x=a+.25+w*(i+.5); pan.push([x,s,i%2]); back.push([x,s,i%2]); seats.push({x:x*T,y:Y(FZ+12.5),floor:Y(FZ),z:s*(CWI-.32)*T,hd:s>0?Math.PI:0,s}); }
      for(const e of [a,b])if(Math.abs(e)<CARL/2-1){ part.push([e,s]); poles.push([e,s*(CWI-1.05),FZ,FZ+CEIL]); } }
    for(const m of DOORS)poles.push([m,0,FZ,FZ+CEIL]);
    const im=(geo,mat,L,fn)=>{ if(!L.length)return; const I=new THREE.InstancedMesh(geo,mat,L.length), o=new THREE.Object3D(); L.forEach((q,i)=>{ fn(o,q); o.updateMatrix(); I.setMatrixAt(i,o.matrix); }); inner.add(I); return I; };
    for(const k of [0,1]){ im(new THREE.BoxGeometry(.92*T,z(3),.42*T),MSEAT[k],pan.filter(q=>q[2]===k),(o,[x,s])=>{ o.position.set(x*T,Y(FZ+11),s*(CWI-.32)*T); o.rotation.set(s*.06,0,0); });
      im(new THREE.BoxGeometry(.92*T,z(26),.1*T),MSEAT[k],back.filter(q=>q[2]===k),(o,[x,s])=>{ o.position.set(x*T,Y(FZ+24.5),s*(CWI-.1)*T); o.rotation.set(-s*.13,0,0); }); }
    im(new THREE.BoxGeometry(1,z(11),.42*T),MDARK,skirt,(o,[x,s,w])=>{ o.position.set(x*T,Y(FZ+5.5),s*(CWI-.32)*T); o.scale.set(w*T,1,1); });
    im(new THREE.BoxGeometry(.05*T,z(48),1.05*T),MSTEEL,part,(o,[x,s])=>{ o.position.set(x*T,Y(FZ+24),s*(CWI-.55)*T); });
    im(new THREE.CylinderGeometry(.045*T,.045*T,1,8),MPOLE,poles,(o,[x,zz,y0,y1])=>{ o.position.set(x*T,Y((y0+y1)/2),zz*T); o.scale.set(1,Y(y1)-Y(y0),1); });
    for(const s of [-1,1])box(inner,CARL*T-2,.06*T,.06*T,0,Y(FZ+74),s*(CWI-1.05)*T,MPOLE);
    const straps=[]; for(const s of [-1,1])for(let a=-(CARL/2-1.5);a<=CARL/2-1.5+1e-6;a+=1.5)straps.push([a,s*(CWI-1.05)]);   // hand straps from the rails, down to where a hand reaches
    im(new THREE.BoxGeometry(.03*T,z(74-SY0-3),.012*T),MDARK,straps,(o,[x,zz])=>{ o.position.set(x*T,Y(FZ+(SY0+3+74)/2),zz*T); });
    im(new THREE.TorusGeometry(.08*T,.016*T,5,10),MPOLE,straps,(o,[x,zz])=>{ o.position.set(x*T,Y(FZ+SY0+1.5),zz*T); o.rotation.set(0,Math.PI/2,0); });
    for(const e of [-1,1]){ const me=new THREE.Mesh(new THREE.PlaneGeometry(2.6*T,z(10)),tn.signM); me.position.set(e*(HL-.1),Y(FZ+DOORH+2),0); me.rotation.y=e>0?-Math.PI/2:Math.PI/2; inner.add(me); }
    for(const k of [-1,1]){ const Lp=new THREE.PointLight(new THREE.Color(.93,.97,1),LAMPI*.25,8*T,LAMPD); Lp.userData.i0=Lp.intensity; Lp.userData.at=new THREE.Vector3(k*HL/2,Y(FZ+CEIL-6),0); scene.add(Lp); lamps.push(Lp); lights.push(Lp); }
    VLOOK.dress('train',ext); scene.add(G); return {G,ext,inner,roof,strips,upper,leaves,lights,seats,c,door:0,poles:poles.map(([x,zz])=>({a:x*T,v:zz*T})),straps:straps.map(([x,zz])=>({a:x*T,v:zz*T}))}; };
  // the trains in the vehicle editor: their colours only (their size and parts are the stations' and the riders')
  // (a car's outside of its own, so it shows before the trains are built; dropped with its pictures)
  VLOOK.kind('train',{name:'THE LOOP TRAIN',grp:'TRAINS',colour:true,make:()=>{ const tn=TRAINS.list[0]; if(!tn)return null; const ext=outside(tn,0);
    ext.userData.vlDrop=()=>ext.traverse(o=>{ if(!o.isMesh)return; o.geometry.dispose(); for(const m of [].concat(o.material))if(m!==MDARK){ if(m.map)m.map.dispose(); m.dispose(); } }); return VLOOK.dress('train',ext); }});
  // the cars built only the first time you are down on the platforms (owner, 9 Nov 2026: "dont load the train unless you go into subway platform"); the timetable runs from the start without them
  TRAINS.ensure=()=>{ if(TRAINS.built)return; TRAINS.built=true;
  for(const tn of TRAINS.list){ const cv=document.createElement('canvas'); cv.width=512; cv.height=64; const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; tn.sign={cv,tx,last:''}; tn.signM=new THREE.MeshBasicMaterial({map:tx});
    for(let c=0;c<NCAR;c++)tn.cars.push(makeCar(tn,c)); }
  for(const tn of TRAINS.list)for(const car of tn.cars){ for(const g of [car.ext,car.upper['-1'],car.upper['1']])g.traverse(o=>{ if(o.isMesh&&!o.geometry.attributes.aWl)PEEK.mark(o.geometry); }); car.peek={me:car.G,b:new THREE.Box3()}; PEEK.boxes.push(car.peek); }
    if(LITE.ready)for(const tn of TRAINS.list)for(const car of tn.cars)for(const Lp of car.lights){ Lp.castShadow=false; Lp.userData.grp=null; Lp.removeFromParent(); LITE.recs.push(Lp); } };   // (lights made after the start join the lamp pool, as the start's did: a light added to the scene recompiles every material)
  LEVELS.of.station.groups.push('trains');

  // each frame: where the cars are (centre, along, across in world units), from where the train is on its track
  let clk=0;
  const at0=(tn,now)=>{ const S=state(tn,now), tr=tn.tr, sc=S.s+tn.dir*((NCAR-1)/2)*(CARL+GAP), a=tr.pt(sc-tn.dir*CARL/2), b=tr.pt(sc+tn.dir*CARL/2); return {x:(L.WX(a.x)+L.WX(b.x))/2,z:(L.WZ(a.y)+L.WZ(b.y))/2}; };   // where the first car is, built or not (the loop map)
  const place=(tn,now,dt)=>{ const S=state(tn,now), tr=tn.tr; tn.S=S; clk+=dt/TRAINS.list.length; const run=S.doors?0:Math.min(1,Math.abs(tn.v||0)/V);
    tn.cars.forEach((car,c)=>{ const sc=S.s+tn.dir*((NCAR-1)/2-c)*(CARL+GAP), a=tr.pt(sc-tn.dir*CARL/2), b=tr.pt(sc+tn.dir*CARL/2), x=(L.WX(a.x)+L.WX(b.x))/2, zz=(L.WZ(a.y)+L.WZ(b.y))/2;
      let ux=L.WX(b.x)-L.WX(a.x), uz=L.WZ(b.y)-L.WZ(a.y); const l=Math.hypot(ux,uz)||1; ux/=l; uz/=l;
      car.p0=car.p||null; car.p={x,z:zz,ux,uz}; car.G.position.set(x,L.H(-32),zz); car.G.rotation.set(0,Math.atan2(-uz,ux),0); car.G.updateMatrixWorld();
      if(car.peek){ const ex=Math.abs(ux)*HL0+Math.abs(uz)*W0, ez=Math.abs(uz)*HL0+Math.abs(ux)*W0, y0=car.G.position.y; car.peek.b.min.set(x-ex,y0,zz-ez); car.peek.b.max.set(x+ex,y0+z(FZ+TOP+25),zz+ez); }
      car.door+=((S.doors?1:0)-car.door)*Math.min(1,dt*2.6); for(const d of car.leaves)d.me.position.x=d.x0+d.s*car.door*DWH*.95*T;
      for(const Lp of car.lights){ Lp.position.copy(Lp.userData.at).applyMatrix4(car.G.matrixWorld); if(Math.random()<dt*.15)Lp.userData.fl=.12+Math.random()*.15; Lp.userData.fl=Math.max(0,(Lp.userData.fl||0)-dt); Lp.intensity=Lp.userData.i0*(Lp.userData.fl>0&&Lp.userData.fl<.07?.35:1); } });
    tn.v=S.doors?0:(S.s-(tn.s0??S.s))/Math.max(dt,1e-3); tn.s0=S.s; };
  const loc=(p,x,z)=>{ const dx=x-p.x, dz=z-p.z; return {a:dx*p.ux+dz*p.uz,v:-dx*p.uz+dz*p.ux}; }, wrl=(p,a,v)=>({x:p.x+a*p.ux-v*p.uz,z:p.z+a*p.uz+v*p.ux});
  const cars=()=>TRAINS.list.flatMap(tn=>tn.cars.map(c=>({tn,c})));
  const HL=CARL/2*T, HW=CW*T, HWI=CWI*T, R=.36, AISLE=(CWI-.95)*T-R;
  const inCar=(x,z)=>{ for(const {tn,c} of cars()){ if(!c.p)continue; const q=loc(c.p,x,z); if(Math.abs(q.a)<HL-.2&&Math.abs(q.v)<HWI)return {tn,c,q}; } return null; };
  L.under.push({inside:(x,z)=>!!inCar(x,z),ground:()=>L.H(FLOOR)}); TRAINS.cars=cars;
  const atDoor=a=>DOORS.some(m=>Math.abs(a-m*T)<DWH*T-.15);
  const ride={c:null,tn:null}, STEP=2.2*T;
  const edges=tn=>{ const S=tn.S, k=tn.track, st=S.doors?S.at:null;
    if(tn.open&&tn.open!==st){ for(const e of tn.open.edge[k])e.box.splice(0,4,...e.keep); tn.open=null; }
    if(st&&!tn.open){ const us=[]; for(const car of tn.cars)for(const m of DOORS)us.push(st.ua(car.p.x+car.p.ux*m*T,car.p.z+car.p.uz*m*T).u);
      for(const e of st.edge[k])if(us.some(u=>e.u0<u+DWH+.2&&e.u1>u-DWH-.2))e.box.splice(0,4,1e7,1e7,1e7,1e7); tn.open=st; } };
  L.riding=()=>ride.tn?TEXT.t('loop.riding',null,{id:ride.tn.id,next:ride.tn.S&&ride.tn.S.next?ride.tn.S.next.name:''}):null;
  TRAINS.ride=ride;
  const signText=(tn)=>{ '@later'; const S=tn.S, k=S.doors?S.at.name+' · '+S.at.id+'|DOORS CLOSE IN '+Math.ceil(S.left)+' S':'NEXT STOP  '+S.next.name+' · '+S.next.id+'|'+(S.left<30?'ARRIVING':Math.ceil(S.left/60)+' MIN');
    if(tn.sign.last===k)return; tn.sign.last=k; const g=tn.sign.cv.getContext('2d'), w=512, h=64, [a,b]=k.split('|'); g.fillStyle='#050505'; g.fillRect(0,0,w,h); g.textBaseline='middle';
    font(g,26); g.fillStyle='#ffb347'; g.fillText(a,12,h/2); font(g,18,700); const tw=g.measureText(b).width; g.fillStyle=S.doors?'#7fd36b':'#e7685a'; g.fillText(b,w-tw-12,h/2); tn.sign.tx.needsUpdate=true; };
  let bt=0;
  const ang=p=>Math.atan2(p.ux,p.uz);
  SYS.add('carry',dt=>{ if(SHARED.LVL==='down')TRAINS.ensure(); const now=TRAINS.now(); for(const tn of TRAINS.list){ tn.at=at0(tn,now); place(tn,now,dt||0); }   // before you move and are drawn, so you ride with the car, not a frame behind it
    if(SHARED.LVL!=='down'){ ride.c=ride.tn=null; SHARED.floorFrame=null; return; }
    if(ride.c&&ride.c.p0){ const q=loc(ride.c.p0,pos.x,pos.z), w=wrl(ride.c.p,q.a,q.v); pos.x=w.x; pos.z=w.z; SHARED.heading+=ang(ride.c.p)-ang(ride.c.p0); }
    const se=USE.seat; if(se&&se.car){ if(se.car!==ride.c){ USE.seat=null; st.sit=null; } else { const w=wrl(se.car.p,se.a,se.v), b=wrl(se.car.p,se.ba,se.bv); se.x=pos.x=w.x; se.z=pos.z=w.z; se.back.x=b.x; se.back.z=b.z; SHARED.heading=ang(se.car.p)+se.hl; } }
    SHARED.floorFrame=ride.c?ride.c.p:null; },'009c-trains');
  UI.camKeeps.push((c,t)=>{ const car=ride.c; if(!car||!car.p)return; const q=loc(car.p,c.x,c.z), qt=loc(car.p,t.x,t.z), lim=HWI-.25*T, la=HL-.4*T; let k=1;   // riding: the camera stays between the car's walls
    if(Math.abs(q.v)>lim&&Math.abs(q.v-qt.v)>1e-6)k=Math.min(k,(Math.sign(q.v)*lim-qt.v)/(q.v-qt.v)); if(Math.abs(q.a)>la&&Math.abs(q.a-qt.a)>1e-6)k=Math.min(k,(Math.sign(q.a)*la-qt.a)/(q.a-qt.a));
    if(k<1){ k=Math.max(0,k); c.set(t.x+(c.x-t.x)*k,t.y+(c.y-t.y)*k,t.z+(c.z-t.z)*k); } });
  let seatTh=null; const SEATH=new THREE.Mesh(new THREE.BoxGeometry(.8*T,.5*T,.8*T),new THREE.MeshBasicMaterial({visible:false})); SEATH.position.set(0,-1e4,0); scene.add(SEATH);
  const seatAt=()=>{ const c=ride.c; if(!c||USE.seat)return null; const q=loc(c.p,pos.x,pos.z); let best=null, bd=1e9; for(const se of c.seats){ if(se.taken)continue; const d=Math.hypot(se.x-q.a,se.z-q.v); if(d<bd){ bd=d; best=se; } } return best; };
  const sitDown=()=>{ const c=ride.c, se=seatAt(); if(!se)return; const q=loc(c.p,pos.x,pos.z), v=se.z+se.s*.18*T, w=wrl(c.p,se.x,v), hl=se.s*Math.PI/2;   // a seat in the car: you sit and ride in it
    USE.sitAt(w.x,w.z,c.G.position.y+se.y,ang(c.p)+hl,{car:c,a:se.x,v,hl,ba:q.a,bv:q.v}); };
  // holding on: double-click a pole or a strap under the overhead rails and one hand takes it (st.grip, in the body's own frame); walking along the rail the hand moves to the nearest strap; step away and you let go
  const PR=.045*T, HOLDR=1.3*T, POLEY=38, inv=new THREE.MeshBasicMaterial({visible:false}), POLEH=new THREE.Mesh(new THREE.BoxGeometry(.35*T,1.6*T,.35*T),inv), RAILH=new THREE.Mesh(new THREE.BoxGeometry(.5*T,.4*T,.35*T),inv), hold={h:null};
  for(const m of [POLEH,RAILH]){ m.position.set(0,-1e4,0); scene.add(m); }
  const nearHold=()=>{ const c=ride.c; if(!c||!c.p||USE.seat)return {}; const q=loc(c.p,pos.x,pos.z); let pole=null, pd=HOLDR, rail=null, rd=HOLDR;
    for(const p of c.poles){ const d=Math.hypot(p.a-q.a,p.v-q.v); if(d<pd){ pd=d; pole=p; } }
    for(const p of c.straps){ const d=Math.hypot(p.a-q.a,p.v-q.v); if(d<rd){ rd=d; rail=p; } } return {pole,rail}; };
  const grab=k=>{ const h=nearHold()[k]; if(h)hold.h={car:ride.c,k,a:h.a,v:h.v}; };
  const letGo=()=>{ hold.h=null; st.grip=null; };
  const holding=()=>{ const h=hold.h, c=ride.c, W=st.world; if(!h)return; if(c!==h.car||USE.seat||!W||!c.p)return letGo(); const q=loc(c.p,pos.x,pos.z);
    if(h.k==='rail'){ let b=null, bd=1e9; for(const p of c.straps)if(p.v===h.v){ const d=Math.abs(p.a-q.a); if(d<bd){ bd=d; b=p; } } if(b)h.a=b.a; } const dA=h.a-q.a, dV=h.v-q.v; if(Math.hypot(dA,dV)>HOLDR)return letGo();
    const hd=SHARED.heading-Math.atan2(c.p.ux,c.p.uz), cs=Math.cos(hd), sn=Math.sin(hd), dx=-dV*W.kx, dz=dA*W.kx; let lx=dx*cs-dz*sn, lz=dx*sn+dz*cs, ly;
    if(h.k==='pole'){ const l=Math.hypot(lx,lz)||1, k=Math.max(0,l-1.3)/l; lx*=k; lz*=k; ly=POLEY; } else ly=(c.G.position.y+z(FZ+SY0+1.5)-SHARED.py)*W.ky-.8;
    st.grip={side:lx>0?1:-1,x:lx,y:ly,z:lz}; };
  TRAINS.hold=hold; TRAINS.grab=grab; TRAINS.letGo=letGo;
  let holdTh=null;
  SYS.add('places',dt=>{ const now=TRAINS.now(), down=SHARED.LVL==='down';
    if(!seatTh&&UI.thing){ seatTh={name:'SEAT',obj:SEATH,reach:1.1*T,near:2.4*T,tall:.5*T,act:sitDown}; UI.thing(seatTh); }
    if(!holdTh&&UI.thing){ holdTh=[{name:'HOLD THE POLE',obj:POLEH,reach:HOLDR,near:2.4*T,tall:1.6*T,act:()=>grab('pole')},{name:'HOLD A STRAP',obj:RAILH,reach:HOLDR,near:2.4*T,tall:.4*T,act:()=>grab('rail')}]; holdTh.forEach(t=>UI.thing(t)); }
    { const n=down?nearHold():{}, c=ride.c; POLEH.position.set(0,-1e4,0); RAILH.position.set(0,-1e4,0);
      if(n.pole){ const w=wrl(c.p,n.pole.a,n.pole.v); POLEH.position.set(w.x,c.G.position.y+z(FZ+44),w.z); }
      if(n.rail){ const w=wrl(c.p,n.rail.a,n.rail.v); RAILH.position.set(w.x,c.G.position.y+z(FZ+SY0+1.5),w.z); RAILH.rotation.y=c.G.rotation.y; }
      if(down)holding(); else if(hold.h)letGo(); }
    { const se=down&&seatAt(); if(se){ const w=wrl(ride.c.p,se.x,se.z); SEATH.position.set(w.x,ride.c.G.position.y+se.y,w.z); } else SEATH.position.set(0,-1e4,0); }
    if(down){
      if(ride.c&&!(USE.seat&&USE.seat.car)){ const q=loc(ride.c.p,pos.x,pos.z), S=ride.tn.S;
        if(Math.abs(q.a)>HL+2||Math.abs(q.v)>HW+2)ride.c=ride.tn=null;
        else { let out=null; if(S.doors&&atDoor(q.a)&&Math.abs(q.v)>HWI-R-.02){ const w=wrl(ride.c.p,q.a,Math.sign(q.v)*(STEP+R+.15)); if(M.ground(w.x,w.z)>L.H(-2))out=w; }
          if(out){ pos.x=out.x; pos.z=out.z; ride.c=ride.tn=null; }
          else { let a=Math.max(-HL+.6,Math.min(HL-.6,q.a)), wv=atDoor(q.a)?HWI-R:AISLE, v=Math.max(-wv,Math.min(wv,q.v));
            for(const p of ride.c.poles){ const da=a-p.a, dv=v-p.v, d=Math.hypot(da,dv), m=R+PR; if(d<m){ if(d>1e-4){ a=p.a+da*m/d; v=p.v+dv*m/d; } else v=p.v+m; } }   // the poles are solid
            if(a!==q.a||v!==q.v){ const w=wrl(ride.c.p,a,v); pos.x=w.x; pos.z=w.z; } } } }
      if(!ride.c)for(const {tn,c} of cars()){ if(!c.p)continue; const q=loc(c.p,pos.x,pos.z); if(Math.abs(q.a)>=HL+R)continue;
        const door=tn.S.doors&&atDoor(q.a), low=SHARED.py<L.H(-16);
        if((door&&Math.abs(q.v)<Math.max(STEP,HW)+R+.1)||(low&&Math.abs(q.v)<HW+R)){ ride.c=c; ride.tn=tn; const w=wrl(c.p,q.a,Math.max(-HWI+R+.3,Math.min(HWI-R-.3,q.v))); pos.x=w.x; pos.z=w.z; break; }
        if(Math.abs(q.v)>=HW+R)continue; const w=wrl(c.p,q.a,Math.sign(q.v||1)*(HW+R)); pos.x=w.x; pos.z=w.z; } }
    for(const tn of TRAINS.list)edges(tn);
    const first=UI.view==='first', cam=SHARED.cam&&SHARED.cam.position;
    for(const tn of TRAINS.list)for(const c of tn.cars){ const on=ride.tn===tn&&!first, near=down&&Math.hypot(c.p.x-pos.x,c.p.z-pos.z)<60*T; c.G.visible=!(L.tunHid&&!L.inStation(c.p.x,c.p.z)); c.ext.visible=true; c.inner.visible=near; c.strips.visible=true; c.upper['-1'].visible=c.upper['1'].visible=true; }
    const ms=performance.now(); if(ms<bt)return; bt=ms+500; if(!down)return;
    if(ride.tn)signText(ride.tn);
    const h=L.here(pos.x,pos.z); if(h.d<40*T){ const st=h.st;
      L.board(st,TRAINS.list.map(tn=>{ const u=until(tn,st,now), nx=tn.tbl.find(e=>e.st===st).nx; return [tn.id,(tn.dir>0?'↻ ':'↺ ')+nx.name,u.now?'NOW':u.left<45?'ARRIVING':Math.ceil(u.left/60)+' MIN']; })); } },'009c-trains');
  });
export {TRAINS};
