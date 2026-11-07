// THE ART MUSEUM: on Market St, Polyfork's bank building (its outside, 068a); its inside, built off the map behind the fade when you go in: three floors, each one square room with a free-standing wall in its middle, the paintings of data/art.json hung round them, an open brass cage lift in the back-left corner you ride by its lever; double-click a painting to see it full screen on its wall, its full-resolution file fetched from its museum only then, with a guided tour where one is written (data/art-tours.json).
import {SHARED, THREE} from './003-shx.js';
import {PERFX, pos, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {AWAY, BLDK, FADE, grab, OFFDX, SOL, STORE, SYS, TILE, TURN, WP} from './006-map-pre.js';
const ART=__LAZY__("data/art.json"), ARTTOURS=__LAZY__("data/art-tours.json"), ARTTEX=__LAZY__("data/art-tex.json");
await grab('art',async()=>{ if(AWAY.has('art')||!WP.art)return;
  const K=STORE.kit, {room,rec,STEPS,sol,put}=K, SK=SHARED.BOD.STOREK, {LAMPS,sh,hash}=SK, MK=SK.museum, {X,Y,Z}=SHARED.BOD, MS=STORE.main, U=TILE*BLDK;
  const H=450, IW=16, DEP=16, FL=4.6, ZC=52, ZPU=1/(SHARED.BOD.Y(1)/U), FZ=FL*ZPU, NF=3, GAP=.9;   // H: the Polyfork building's height (z units); FL: a floor's height (map units), FZ the same in z units; GAP: the least space between two paintings
  const LW=MS.lot('art',H), TP=TURN(LW,WP.art.face||'n'), L=TP.L, OX=1060+OFFDX/BLDK-TP.cx, cxL=(L.x0+L.x1)/2, cx=cxL+OX;
  const B={id:'lart',x0:cx-IW/2,x1:cx+IW/2,y0:L.y1-DEP,y1:L.y1,h:NF*FZ+20}, cy=(B.y0+B.y1)/2, CW={x0:cx-4.5,x1:cx+4.5,y0:cy-.15,y1:cy+.15};
  // the lift's shaft in the back-left corner, its gate on the side facing the street door
  const LS={x0:B.x0+.1,y0:B.y0+.1,x1:B.x0+3.1,y1:B.y0+3.1}, EX=(LS.x0+LS.x1)/2, EY=(LS.y0+LS.y1)/2, DW=.9, DH=84;
  const OAK=[118,82,50], OAKL=[134,96,58], OAKD=[98,66,40];
  const GAL=[['DUTCH MASTERS',[104,124,106]],['OLD MASTERS',[150,78,70]],['VAN GOGH AND HIS TIME',[110,128,152]],['FRENCH PAINTING',[204,194,174]],['AMERICAN PAINTING',[162,146,118]],['ROMANTICS AND VISIONARIES',[124,110,134]]];
  const D={w:'f',a:cx,wd:3,h:82};
  const fk=(nx,ny,at,k)=>nx+','+ny+','+at.toFixed(2)+'@'+k;
  const GROUP=t=>{ '@later'; const a=t.a, n=t.t; if(/Delaware|Andes|Twilight|Oxbow|Schroon|Gulf Stream|Madame X|George Washington|Stag at/.test(n))return 4; if(/Turner|Blake|Hokusai|Vedder|Redon|Bosch/.test(a))return 5;
    if(/Gogh|Gauguin|Seurat|Klimt|Hammersh/.test(a))return 2; if(/Monet|Cézanne|Degas|Rousseau|Bastien/.test(a))return 3; if(/Caravaggio|Botticelli|El Greco|Goya|David|Bruegel/.test(a)||/Aristotle/.test(n))return 1; return 0; };
  const size=t=>{ const ar=t.w/t.h, big=/Delaware|Andes|Night Watch/.test(t.t); let h=big?2.4:ar<.8?1.7:1.35, w=h*ar; if(!big&&w>2.6){ w=2.6; h=w/ar; } return [w,h]; };
  let DATA=null, LAY=null, RS=[];
  // the floors: the paintings grouped by school and split evenly over the three; each floor named by the schools on it and coloured by its first
  const plan=()=>{ '@later'; const ids=DATA.map((t,i)=>i).sort((a,b)=>GROUP(DATA[a])-GROUP(DATA[b])||a-b), n=Math.ceil(ids.length/NF);
    RS=[...Array(NF)].map((_,k)=>{ const mine=ids.slice(k*n,k*n+n), gs=[...new Set(mine.map(i=>GROUP(DATA[i])))]; return {k,ids:mine,name:gs.map(g=>GAL[g][0]).join(' · '),col:GAL[gs[0]||0][1],g:gs[0]||0}; }); A_.RS=RS; };
  // a floor's walls: the four outer walls clear of the corners and the lift (and of the street door on the first floor), and both faces of the middle wall
  const faces=k=>{ const c=.9, fr={ax:'x',at:B.y1-.1,nx:0,ny:-1}, W=[{ax:'x',at:B.y0+.1,nx:0,ny:1,a0:LS.x1+.6,a1:B.x1-c},{ax:'y',at:B.x0+.1,nx:1,ny:0,a0:LS.y1+.6,a1:B.y1-c},{ax:'y',at:B.x1-.1,nx:-1,ny:0,a0:B.y0+c,a1:B.y1-c},
      {ax:'x',at:CW.y0-.01,nx:0,ny:-1,a0:CW.x0+.3,a1:CW.x1-.3},{ax:'x',at:CW.y1+.01,nx:0,ny:1,a0:CW.x0+.3,a1:CW.x1-.3}];
    if(k)W.push({...fr,a0:B.x0+c,a1:B.x1-c}); else W.push({...fr,a0:B.x0+c,a1:cx-D.wd/2-1},{...fr,a0:cx+D.wd/2+1,a1:B.x1-c}); return W; };
  // the hang: each painting to the wall with the most room left, spread evenly along it; all a little smaller only if a floor is short
  const layout=()=>{ '@later'; plan(); LAY=[];
    for(const r of RS){ let out=null; for(let sc=1;sc>.4&&!out;sc-=.05){ const S=faces(r.k).map(f=>({f:{...f,rm:r},it:[],used:0})); let ok=true;
        for(const i of r.ids){ const [w,h]=size(DATA[i]), it={i,w:w*sc,h:h*sc}; let best=null, bs=-1;
          for(const s of S){ const sp=(s.f.a1-s.f.a0-s.used-it.w-GAP*(s.it.length+2))/(s.it.length+2); if(sp>=0&&sp>bs){ bs=sp; best=s; } }
          if(!best){ ok=false; break; } best.it.push(it); best.used+=it.w; }
        if(!ok)continue; out=[]; for(const s of S){ if(!s.it.length)continue; const g=(s.f.a1-s.f.a0-s.used)/(s.it.length+1); let a=s.f.a0+g; for(const it of s.it){ out.push({...it,f:s.f,a:a+it.w/2}); a+=it.w+g; } } }
      if(!out){ console.warn('art museum: floor '+(r.k+1)+' is short of wall'); continue; } for(const p of out)LAY.push(p); } };
  const parquet=(x,y)=>{ '@later'; const Lb=.84, Wb=.14, a=(x+y)*Math.SQRT1_2, b=(x-y)*Math.SQRT1_2, i=Math.floor(a/Lb), j=Math.floor(b/Lb), A=(i+j)&1, p=A?b-j*Lb:a-i*Lb, q=A?a-i*Lb:b-j*Lb, k=Math.floor(p/Wb);
    if(p-k*Wb<.045||q<.045)return [70,48,30]; const n=hash(i*5+k,j*3+A,1751), c=n<.3?OAKD:n<.68?OAK:OAKL, g=hash(Math.floor(a*40),Math.floor(b*8),1753); return g<.06?sh(c,.9):g>.95?sh(c,1.07):c; };
  const marble=(x,y)=>MK.museumHallCol(x,y,{x0:B.x0+.1,x1:B.x1-.1,y0:B.y0+.1,y1:B.y1-.1});
  const lamp=(x,y,z,r,c)=>LAMPS.push({own:1,room:1,day:true,x,y,z,r,c});
  // the first floor's desk, a bench either side of the middle wall, four lamps over each floor, the walls solid
  const set0=()=>{ '@later'; put('information desk',cx+4.8,B.y1-3); put('museum bench',cx,cy-2.6,1); put('museum bench',cx,cy+2.6,3); put('dust in the air',cx-3,B.y1-6);
    for(let k=0;k<NF;k++)for(const [x,y] of [[cx-4,cy-4.2],[cx+4,cy-4.2],[cx-4,cy+4.2],[cx+4,cy+4.2]])lamp(x,y,k*FZ+FZ*.82,9,[1.55,1.46,1.3]);
    const T0=.1; for(const [a,b,c,d] of [[B.x0,B.y0,B.x1,B.y0+T0],[B.x0,B.y0,B.x0+T0,B.y1],[B.x1-T0,B.y0,B.x1,B.y1],[B.x0,B.y1-T0,cx-D.wd/2,B.y1],[cx+D.wd/2,B.y1-T0,B.x1,B.y1],[CW.x0,CW.y0,CW.x1,CW.y1]])sol(a,b,c,d,FZ); };
  const A_=STORE.art={B,FZ,NF,hung:0,groups:[],built:false,busy:false,lv:0,RS:[],pics:()=>A_.groups.flatMap(g=>g.children.filter(c=>c.userData.at))};
  // where you stand: your floor (the first is the ground), the cage's floor in the shaft; the shaft's bars are solid, its gate while shut
  const inB=(x,z)=>{ const u=x/U+SHARED.BOD.OX, v=z/U+SHARED.BOD.OY; return u>B.x0&&u<B.x1&&v>B.y0&&v<B.y1; };
  const CAB={z:0,at:0,door:0,open:false,to:null,ride:null,pz:0,dir:0};   // at: the floor the cage stands at (null while it moves); door: how far its gates are open
  const mu=(x,z)=>[x/U+SHARED.BOD.OX,z/U+SHARED.BOD.OY], inShaft=(x,z,m=0)=>{ const [u,v]=mu(x,z); return u>LS.x0+m&&u<LS.x1-m&&v>LS.y0+m&&v<LS.y1-m; };
  const inCab=()=>A_.built&&inB(pos.x,pos.z)&&inShaft(pos.x,pos.z,.36/U+.06), inDoor=()=>A_.built&&inShaft(pos.x,pos.z)&&!inCab();
  { const sg0=STORE.stackGround; STORE.stackGround=(x,z)=>{ if(A_.built&&SHARED.LVL==='up'&&inB(x,z)){ if(inShaft(x,z))return Y(CAB.z); if(A_.lv>0)return Y(A_.lv*FZ); } return sg0?sg0(x,z):null; }; }
  const rect=(x0,y0,x1,y1)=>{ const a=X(x0), b=X(x1), c=Z(y0), d=Z(y1); return [Math.min(a,b),Math.min(c,d),Math.max(a,b),Math.max(c,d)]; };
  const T1=.05, WALLS=[rect(LS.x1-T1,LS.y0,LS.x1+T1,LS.y1),rect(LS.x0,LS.y1-T1,EX-DW,LS.y1+T1),rect(EX+DW,LS.y1-T1,LS.x1,LS.y1+T1)], SHUT=rect(EX-DW,LS.y1-T1,EX+DW,LS.y1+T1);
  const passable=()=>CAB.at!=null&&CAB.door>.85&&(inShaft(pos.x,pos.z)||CAB.at===A_.lv);
  { const t0=STORE.stackTick; let was=''; STORE.stackTick=()=>{ const on=A_.built&&SHARED.LVL==='up'&&inB(pos.x,pos.z), op=on&&passable(), key=on?A_.lv+(op?'o':''):'';
      if(key!==was){ was=key; if(!on)return SOL[SHARED.LVL]||SOL.up; return SOL.up.concat(WALLS,op?[]:[SHUT]); } return t0?t0():null; }; }
  SYS.add('places',()=>{ if(A_.lv&&!CAB.ride&&!inB(pos.x,pos.z))A_.lv=0; },'059p-art');
  A_.floor=()=>inB(pos.x,pos.z)?A_.lv:-1;
  // the ride: the cage comes to your floor when you double-click its gate; inside, its lever sends it up or down a floor: the gates fold shut, it climbs with you standing on its floor, they fold open
  A_.go=k=>{ if(!RS[k]||FADE.busy)return; if(CAB.at===k&&CAB.to==null){ CAB.open=true; return; } if(CAB.ride)return; CAB.to=k; A_.busy=true; };
  A_.call=()=>A_.go(A_.lv);
  const lever=()=>{ if(!inCab()||CAB.ride||CAB.to!=null)return; const k=A_.lv, up=k<NF-1, dn=k>0; if(up&&dn)return liftMenu(); A_.go(up?k+1:k-1); };
  A_.lever=lever;
  A_.lift=()=>({z:+(CAB.z/FZ).toFixed(3),at:CAB.at,door:+CAB.door.toFixed(2),to:CAB.to,riding:!!CAB.ride,inCab:inCab(),menu:!!(LM&&!LM.hidden),y:Y(CAB.z),cab:[X(EX),Z(EY)],out:[X(EX),Z(LS.y1+1.4)]});
  SYS.add('places',dt=>{ if(!A_.built)return; const d=Math.min(.1,dt||0);
    CAB.door=Math.max(0,Math.min(1,CAB.door+(CAB.open?1:-1)*d/.6));
    if(CAB.to!=null&&!CAB.ride){ if(CAB.open&&!inDoor())CAB.open=false;
      if(!CAB.open&&CAB.door===0){ const k=CAB.to; if(k===CAB.at){ CAB.to=null; CAB.open=true; A_.busy=false; } else { CAB.ride={from:CAB.z,to:k*FZ,t0:performance.now(),dur:1600+Math.abs(k*FZ-CAB.z)/FZ*1800,k}; CAB.dir=Math.sign(k*FZ-CAB.z); CAB.at=null; } } }
    const me=inCab(); CAB.pz=CAB.z;
    if(CAB.ride){ const R=CAB.ride, t=Math.min(1,(performance.now()-R.t0)/R.dur), e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; CAB.z=R.from+(R.to-R.from)*e;
      if(me)SHARED.py=Y(CAB.z);
      if(t>=1){ CAB.z=R.to; CAB.at=R.k; CAB.ride=null; CAB.to=null; CAB.open=true; CAB.dir=0; A_.busy=false; if(me)A_.lv=R.k; } }
    else if(CAB.at!=null&&inShaft(pos.x,pos.z)&&inB(pos.x,pos.z))A_.lv=CAB.at;
    if(!me&&LM&&!LM.hidden)LM.hidden=true;
    if(A_.cab)A_.cab.position.y=Y(CAB.pz)-Y(0);
    if(A_.handle)A_.handle.rotation.x+=((CAB.dir*.6)-A_.handle.rotation.x)*Math.min(1,d*8);
    for(const [g,k] of A_.gates||[])g.scale.x=1-.85*(k==null||CAB.at===k?CAB.door:0); },'059p-art');
  // the paintings: each a framed canvas (its picture a small JPEG from data/art.json) on its wall, a plaque beside it, a thing to read
  const plaque=t=>{ '@later'; const cv=document.createElement('canvas'); cv.width=256; cv.height=112; const g=cv.getContext('2d'); g.fillStyle='#ebe6d8'; g.fillRect(0,0,256,112); g.fillStyle='#2a2622'; g.font='bold 20px Georgia,serif';
    const fit=(s,w)=>{ while(g.measureText(s).width>w&&s.length>3)s=s.slice(0,-2)+'…'; return s; }; g.fillText(fit(t.t,236),12,34); g.font='17px Georgia,serif'; g.fillText(fit(t.a+', '+t.d,236),12,62); g.fillStyle='#6a645c'; g.font='14px Georgia,serif'; g.fillText(fit(t.m,236),12,90);
    const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; return new THREE.Mesh(new THREE.PlaneGeometry(.44*U,.19*U),new THREE.MeshBasicMaterial({map:tx})); };
  const canvasTex=(w,h,draw,rx=1,ry=1)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx,ry); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; };
  const img=src=>new Promise(r=>{ if(!src)return r(null); const i=new Image(); i.onload=()=>r(i); i.onerror=()=>r(null); i.src=src; });
  // the inside drawn when you go in: each floor's walls and middle wall, the floors between them, the lift, then the paintings
  const build=async()=>{ '@art'; if(!DATA||!LAY)return; const gen=A_.gen; const G=new THREE.Group(); G.name='art museum'; const WL=await img(TEX&&TEX.plaster), WD=await img(TEX&&TEX.wood), WDV=await img(TEX&&TEX.woodv);
    const rgb=a=>'rgb('+a.map(v=>Math.round(v)).join(',')+')';
    // a floor's band of wall, one floor high: the plaster in the floor's colour, the wood dado and its rail, the picture rail, the slab's edge above
    const wallTex=col=>canvasTex(512,512,(g,w,h)=>{ const zy=z=>h*(1-z/FZ); g.fillStyle=rgb(col); g.fillRect(0,0,w,h); if(WL){ g.globalCompositeOperation='multiply'; for(let x=0;x<w;x+=256)for(let y=0;y<h;y+=256)g.drawImage(WL,x,y,256,256); g.globalCompositeOperation='source-over'; }
      if(WD){ for(let x=0;x<w;x+=128)g.drawImage(WD,x,zy(30),128,zy(4)-zy(30)); } else { g.fillStyle='#5a3a24'; g.fillRect(0,zy(30),w,zy(4)-zy(30)); }
      g.fillStyle='#2a221b'; g.fillRect(0,zy(4),w,h-zy(4)); g.fillStyle='#c4a052'; g.fillRect(0,zy(33),w,zy(30)-zy(33)); g.fillRect(0,zy(109),w,zy(107)-zy(109));
      g.fillStyle='rgba(0,0,0,.18)'; g.fillRect(0,zy(30),w,2); g.fillStyle='rgb(186,178,160)'; g.fillRect(0,0,w,zy(FZ-8)); },1,1);
    const M=(o)=>new THREE.MeshLambertMaterial(o);
    const plane=(w,h,mat,x,y,z,ry)=>{ const me=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat); me.position.set(x,y,z); me.rotation.y=ry; me.receiveShadow=true; G.add(me); return me; };
    const box=(x0,y0,x1,y1,z0,z1,mat,cast=true,to=G)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(X(x1)-X(x0)),Math.max(.001,Y(z1)-Y(z0)),Math.abs(Z(y1)-Z(y0))),mat); me.position.set((X(x0)+X(x1))/2,(Y(z0)+Y(z1))/2,(Z(y0)+Z(y1))/2); me.castShadow=cast; me.receiveShadow=true; to.add(me); return me; };
    const band=(t,len,off=0)=>{ const tt=t.clone(); tt.needsUpdate=true; tt.repeat.set(len/FL,1); tt.offset.x=off/FL; return M({map:tt}); }, bandH=Y(FZ)-Y(0);
    for(let k=0;k<NF;k++){ const t=wallTex(RS[k].col), y=Y(k*FZ+FZ/2);
      for(const [len,x,z,ry] of [[IW,X(cx),Z(B.y0+.1),0],[DEP,X(B.x0+.1),Z(cy),Math.PI/2],[DEP,X(B.x1-.1),Z(cy),-Math.PI/2]])plane(len*U,bandH,band(t,len),x,y,z,ry);
      if(k)plane(IW*U,bandH,band(t,IW),X(cx),y,Z(B.y1-.1),Math.PI);
      else { const side=(IW-D.wd)/2; for(const s of [-1,1])plane(side*U,bandH,band(t,side,s>0?IW-side:0),X(cx+s*(D.wd/2+side/2)),y,Z(B.y1-.1),Math.PI);
        const tt=t.clone(); tt.needsUpdate=true; tt.repeat.set(D.wd/FL,(FZ-D.h)/FZ); tt.offset.set((IW/2-D.wd/2)/FL,0); plane(D.wd*U,Y(FZ)-Y(D.h),M({map:tt}),X(cx),(Y(D.h)+Y(FZ))/2,Z(B.y1-.1),Math.PI);
        plane(D.wd*U,Y(D.h)-Y(0),M({color:0x3a2416,...(WDV?{map:canvasTex(128,256,(g,w,h)=>{ g.drawImage(WDV,0,0,w,h); g.fillStyle='rgba(0,0,0,.35)'; g.fillRect(w/2-1,0,2,h); g.fillStyle='#c9a250'; g.fillRect(w/2-10,h*.5,4,22); g.fillRect(w/2+6,h*.5,4,22); })}:{})}),X(cx),Y(D.h/2),Z(B.y1-.12),Math.PI); }
      // the middle wall: the floor's band on both faces, plaster on its ends
      const plain=M({color:new THREE.Color(rgb(RS[k].col))}); box(CW.x0,CW.y0,CW.x1,CW.y1,k*FZ,(k+1)*FZ-9,[plain,plain,plain,plain,band(t,CW.x1-CW.x0),band(t,CW.x1-CW.x0)]); }
    // the floors above the first: parquet on top, plaster under, a hole where the lift climbs; the ceiling over the third
    const pq=canvasTex(256,256,(g,w,h)=>{ const im=g.createImageData(w,h); for(let j=0;j<h;j++)for(let i=0;i<w;i++){ const c=parquet(i/64,j/64), o=(j*w+i)*4; im.data[o]=c[0]; im.data[o+1]=c[1]; im.data[o+2]=c[2]; im.data[o+3]=255; } g.putImageData(im,0,0); });
    const ceil=M({color:0xe4ddd0});
    for(let k=1;k<=NF;k++){ const z=k*FZ, top=k===NF;
      for(const [a,b,c,d] of top?[[B.x0,B.y0,B.x1,B.y1]]:[[LS.x1+.05,B.y0,B.x1,B.y1],[B.x0,LS.y1+.05,LS.x1+.05,B.y1]]){ const pm=pq.clone(); pm.needsUpdate=true; pm.repeat.set(Math.abs(c-a)/4,Math.abs(d-b)/4); box(a,b,c,d,z-9,z,top?ceil:[ceil,ceil,M({map:pm}),ceil,ceil,ceil]); } }
    // the lift: brass guide rails up the corner, a lattice round the shaft on each floor with a folding gate, the cage (a brass floor and roof, bars, its own gate and lamp, the lever)
    const brass=new THREE.MeshStandardMaterial({color:0xc9a250,metalness:.7,roughness:.35}), dark=new THREE.MeshStandardMaterial({color:0x3a2a1a,metalness:.4,roughness:.6});
    for(const [x,y] of [[LS.x0+.06,EY],[EX,LS.y0+.06]])box(x-.05,y-.05,x+.05,y+.05,0,NF*FZ,dark,false);
    for(const [x,y] of [[LS.x1,LS.y1],[LS.x1,LS.y0],[LS.x0,LS.y1],[EX-DW,LS.y1],[EX+DW,LS.y1]])box(x-.06,y-.06,x+.06,y+.06,0,NF*FZ,brass);
    const bars=(ax,at,a0,a1,z0,z1,to,step=.3)=>{ for(let a=a0+step/2;a<a1;a+=step)ax==='x'?box(a-.02,at-.02,a+.02,at+.02,z0,z1,brass,false,to):box(at-.02,a-.02,at+.02,a+.02,z0,z1,brass,false,to);
      for(const z of [z0,z1-2])ax==='x'?box(a0,at-.03,a1,at+.03,z,z+2,brass,false,to):box(at-.03,a0,at+.03,a1,z,z+2,brass,false,to); };
    // a folding gate across the opening: its bars squeeze toward the post at its east end as it opens
    const gate=(y,z0,to)=>{ const g=new THREE.Group(), px=X(EX+DW); g.position.x=px; const inner=new THREE.Group(); inner.position.x=-px; g.add(inner); const w=2*DW;
      for(let i=0;i<=12;i++){ const a=EX-DW+w*i/12; box(a-.015,y-.015,a+.015,y+.015,z0+2,z0+DH-2,brass,false,inner); }
      for(const z of [z0+2,z0+DH/2,z0+DH-4])box(EX-DW,y-.02,EX+DW,y+.02,z,z+2,brass,false,inner); to.add(g); return g; };
    A_.gates=[];
    for(let k=0;k<NF;k++){ const z0=k*FZ, z1=(k+1)*FZ-9; bars('y',LS.x1,LS.y0,LS.y1,z0,z1,G); bars('x',LS.y1,LS.x0,EX-DW,z0,z1,G); bars('x',LS.y1,EX+DW,LS.x1,z0,z1,G); box(EX-DW,LS.y1-.03,EX+DW,LS.y1+.03,z0+DH+4,z1,brass,false); A_.gates.push([gate(LS.y1+.05,z0,G),k]); }
    const cab=new THREE.Group(), C0={x0:LS.x0+.12,y0:LS.y0+.12,x1:LS.x1-.12,y1:LS.y1-.12};
    box(C0.x0,C0.y0,C0.x1,C0.y1,-3,0,brass,true,cab); box(C0.x0,C0.y0,C0.x1,C0.y1,DH,DH+3,brass,true,cab); box(EX-.2,EY-.2,EX+.2,EY+.2,DH+3,DH+12,brass,false,cab);
    for(const [x,y] of [[C0.x0,C0.y0],[C0.x1,C0.y0],[C0.x0,C0.y1],[C0.x1,C0.y1]])box(x-.04,y-.04,x+.04,y+.04,0,DH,brass,true,cab);
    bars('x',C0.y0,C0.x0,C0.x1,0,DH,cab,.4); bars('y',C0.x0,C0.y0,C0.y1,0,DH,cab,.4); bars('y',C0.x1,C0.y0,C0.y1,0,DH,cab,.4); bars('x',C0.y1,C0.x0,EX-DW,0,DH,cab,.4); bars('x',C0.y1,EX+DW,C0.x1,0,DH,cab,.4);
    A_.gates.push([gate(C0.y1-.03,0,cab),null]);
    const cl=new THREE.PointLight(0xffe2b0,1.2,4*U); cl.position.set(X(EX),Y(80),Z(EY)); cab.add(cl);
    // the lever: a brass stand by the cage's east bars, its handle forward for up and back for down while it climbs
    const lx=C0.x1-.35, ly=EY+.4; box(lx-.08,ly-.08,lx+.08,ly+.08,0,36,dark,true,cab); const hd=new THREE.Group(); hd.position.set(X(lx),Y(36),Z(ly)); const hm=new THREE.Mesh(new THREE.BoxGeometry(.05*U,Y(22)-Y(0),.05*U),brass); hm.position.y=(Y(22)-Y(0))/2; hd.add(hm);
    const kn=new THREE.Mesh(new THREE.SphereGeometry(.07*U,8,6),new THREE.MeshStandardMaterial({color:0x7a1a14,roughness:.4})); kn.position.y=Y(22)-Y(0); hd.add(kn); cab.add(hd); A_.handle=hd;
    cab.position.y=Y(CAB.z)-Y(0); G.add(cab); A_.cab=cab;
    { const pt=new THREE.Mesh(new THREE.BoxGeometry(.5*U,Y(50)-Y(0),.5*U),new THREE.MeshBasicMaterial({visible:false})); pt.position.set(X(lx),Y(30),Z(ly)); cab.add(pt);
      UI.thing({name:'THE LIFT LEVER',ghost:1,obj:pt,reach:1.6*U,near:2.4*U,tall:Y(50)-Y(0),act:lever}); }
    for(let k=0;k<NF;k++){ const hb=new THREE.Mesh(new THREE.BoxGeometry(2*DW*U,Y(DH)-Y(0),.6*U),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(EX),Y(k*FZ+42),Z(LS.y1+.2)); G.add(hb);
      UI.thing({name:'THE LIFT',ghost:1,obj:hb,reach:1.8*U,near:3*U,tall:Y(DH)-Y(0),act:()=>inCab()?lever():A_.call()}); }
    // the paintings: each a framed canvas (its picture a small JPEG from data/art.json) on its floor's wall, a plaque beside it, a thing to look at
    const TL=new THREE.TextureLoader(), gilt=M({color:0x9a7a34}), darkF=M({color:0x2a1c14});
    for(const p of LAY){ const t=DATA[p.i], f=p.f, g=new THREE.Group(), w=p.w*U, h=p.h*U, k=f.rm.k, old=[0,1,5].includes(f.rm.g)||/Stuart|Cole|Church|Leutze/.test(t.a);
      const fr=new THREE.Mesh(new THREE.BoxGeometry(w+.12*U,h+.12*U,.05*U),old?gilt:darkF); fr.position.z=.025*U; g.add(fr);
      const tx=TL.load(t.i); tx.colorSpace=THREE.SRGBColorSpace; tx.anisotropy=4; const cv=new THREE.Mesh(new THREE.PlaneGeometry(w,h),M({map:tx})); cv.position.z=.052*U; g.add(cv);
      const pq2=plaque(t); pq2.position.set(w/2+.4*U,Y(44)-Y(ZC),.008*U); g.add(pq2);
      const yy=Y(k*FZ+ZC); if(f.ax==='y'){ g.position.set(X(f.at+f.nx*.012),yy,Z(p.a)); g.rotation.y=f.nx>0?Math.PI/2:-Math.PI/2; } else { g.position.set(X(p.a),yy,Z(f.at+f.ny*.012)); g.rotation.y=f.ny>0?0:Math.PI; }
      g.userData.at={k,g:f.rm.g,key:fk(f.nx,f.ny,f.at,k),a:+p.a.toFixed(2),w:+p.w.toFixed(2)}; G.add(g); UI.thing({name:t.t.toUpperCase(),obj:g,reach:1.6*U,near:3.4*U,tall:h+.3*U,act:()=>view(t,p)}); }
    if(gen!==A_.gen){ for(let i=UI.things.length-1;i>=0;i--){ let q=UI.things[i].obj; while(q&&q!==G)q=q.parent; if(q)UI.things.splice(i,1); } return; }   // left before it was hung: nothing kept
    scene.add(G); PERFX.own(G); A_.groups=[G]; A_.hung=LAY.length; A_.built=true;
    // the third person's camera stays under the floor above you (in the cage, the one above your head)
    if(!A_.cam&&UI.camKeeps){ A_.cam=1; UI.camKeeps.push((c,t)=>{ if(!A_.built||!UI.persp||!inB(t.x,t.z))return; const lv=inShaft(t.x,t.z)?(CAB.z+50)/FZ:A_.lv, top=Y(Math.min(NF,Math.floor(lv)+1)*FZ-14); if(c.y>top&&c.y>t.y+1e-6){ const k=Math.max(0,(top-t.y)/(c.y-t.y)); c.lerpVectors(t,c,k); } }); } };
  // the lever's choice on the middle floor: up or down
  let LM=null; const liftMenu=()=>{ '@art'; if(!LM){ LM=document.createElement('div'); LM.id='artlift'; LM.hidden=true; LM.style.cssText='position:fixed;left:50%;top:22%;transform:translateX(-50%);width:min(320px,92vw);z-index:22;padding:14px 16px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#e8e2cc;background:#121110f2;border:2px solid #5a5248;zoom:var(--uiz,1)';
      document.body.appendChild(LM); LM.addEventListener('keydown',e=>{ if(e.key==='Escape')LM.hidden=true; e.stopPropagation(); }); LM.addEventListener('keyup',e=>e.stopPropagation()); }
    const k=A_.lv, bt=(f,s)=>RS[f]?'<button data-f="'+f+'" style="display:block;width:100%;text-align:left;margin:0 0 6px;font:inherit;color:#e8e2cc;background:#1c1a18;border:1px solid #5a5248;padding:8px 10px;cursor:pointer">'+s+' · FLOOR '+(f+1)+'<br><span style="color:#a89c84">'+RS[f].name+'</span></button>':'';
    LM.innerHTML='<div style="margin-bottom:10px;color:#c8b98a">THE LIFT · FLOOR '+(k+1)+'</div>'+bt(k+1,'UP')+bt(k-1,'DOWN')+'<button data-f="x" style="font:inherit;color:#e8e2cc;background:#1c1a18;border:1px solid #5a5248;padding:6px 10px;cursor:pointer">CLOSE</button>';
    for(const b of LM.querySelectorAll('button'))b.onclick=()=>{ LM.hidden=true; const f=b.dataset.f; if(f!=='x')A_.go(+f); };
    LM.hidden=false; if(UI.menuLook)UI.menuLook(); };
  A_.lay=()=>LAY?LAY.map(p=>({k:p.f.rm.k,g:p.f.rm.g,key:fk(p.f.nx,p.f.ny,p.f.at,p.f.rm.k),a:+p.a.toFixed(2),w:+p.w.toFixed(2)})):[];
  A_.dbg=()=>({hung:A_.hung,n:DATA?DATA.length:0,lay:LAY?LAY.length:0,drawn:A_.groups.map(g=>window.VIS&&window.VIS.why(g).length?0:g.visible?1:0).join(''),galleries:RS.length,floors:NF,floor:A_.floor(),per:RS.map(r=>LAY?LAY.filter(p=>p.f.rm.k===r.k).length:0)});
  // the viewer: double-click a painting and it fills the screen, framed on its own wall; the museum's full-resolution file is fetched only then (the small picture shows until it comes); wheel, pinch, + and - zoom, drag pans, double-click zooms in or back; a painting with a tour (data/art-tours.json) has GUIDED TOUR
  let V=null, TOURS={}, TEX=null;
  const view=(t,p)=>{ '@art'; if(!V){ const el=document.createElement('div'); el.id='artview'; el.hidden=true;
      el.style.cssText='position:fixed;inset:0;z-index:30;background:#0c0b0a;overflow:hidden;touch-action:none;user-select:none;cursor:grab;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#e8e2cc';
      el.innerHTML='<div data-k="world" style="position:absolute;left:0;top:0;transform-origin:0 0"><div data-k="wall" style="position:absolute;left:0;top:0"><div data-k="plaster" style="position:absolute"></div><div data-k="cornice" style="position:absolute"></div><div data-k="light" style="position:absolute"></div><div data-k="prail" style="position:absolute"></div><div data-k="dado" style="position:absolute"></div><div data-k="drail" style="position:absolute"></div><div data-k="skirt" style="position:absolute"></div></div><div data-k="frame" style="position:absolute"><div data-k="ftop" style="position:absolute;left:0;right:0;top:0"></div><div data-k="fbot" style="position:absolute;left:0;right:0;bottom:0"></div></div><img alt="" draggable="false" style="position:absolute;left:0;top:0;image-rendering:auto;max-width:none;max-height:none"></div>'+
        '<div data-k="cap" style="position:absolute;left:0;right:0;bottom:0;padding:14px 18px;background:linear-gradient(transparent,#0c0b0ae8 40%);pointer-events:none"></div>'+
        '<div style="position:absolute;top:12px;right:12px;display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end"><button data-k="tour">GUIDED TOUR</button><button data-k="out">−</button><button data-k="in">+</button><button data-k="fit">FIT</button><button data-k="one">FULL SIZE</button><button data-k="x">CLOSE ✕</button></div>'+
        '<div data-k="st" style="position:absolute;top:16px;left:18px;color:#c8b98a;text-shadow:0 1px 2px #000"></div>'+
        '<div data-k="card" hidden style="position:absolute;right:16px;bottom:72px;width:min(380px,calc(100vw - 32px));max-height:calc(100vh - 150px);overflow:auto;padding:14px 16px;background:#14120fef;border:2px solid #5a5248;line-height:1.55;font:12px Georgia,serif;letter-spacing:0;color:#e8e2cc;cursor:default">'+
          '<div data-k="cn" style="font:10px Silkscreen,monospace;letter-spacing:.4px;color:#a89c84"></div><div data-k="ct" style="font:13px Silkscreen,monospace;letter-spacing:.4px;color:#f4ecd4;margin:6px 0 8px"></div><div data-k="cx"></div>'+
          '<div style="display:flex;gap:6px;margin-top:12px;font:11px Silkscreen,monospace"><button data-k="back">BACK</button><button data-k="next">NEXT</button><span style="flex:1"></span><button data-k="end">END TOUR</button></div></div>';
      for(const b of el.querySelectorAll('button'))b.style.cssText='font:11px Silkscreen,monospace;letter-spacing:.4px;color:#e8e2cc;background:#1c1a18e0;border:1px solid #5a5248;padding:6px 10px;cursor:pointer';
      document.body.appendChild(el); const im=el.querySelector('img'), q=k=>el.querySelector('[data-k="'+k+'"]'), W0=q('world');
      V={el,im,s:1,x:0,y:0,w:1,h:1,fit:1,max:8,full:null,t:null,tour:null};
      const put=()=>{ W0.style.transform='translate('+V.x+'px,'+V.y+'px) scale('+V.s+')'; };
      const clamp=()=>{ const W=el.clientWidth, H=el.clientHeight, w=V.w*V.s, h=V.h*V.s; V.x=w<W?(W-w)/2:Math.min(0,Math.max(W-w,V.x)); V.y=h<H?(H-h)/2:Math.min(0,Math.max(H-h,V.y)); put(); };
      const zoom=(k,cx=el.clientWidth/2,cy=el.clientHeight/2)=>{ stop(); const s=Math.min(V.max,Math.max(V.fit,V.s*k)), r=s/V.s; V.x=cx-(cx-V.x)*r; V.y=cy-(cy-V.y)*r; V.s=s; clamp(); };
      const fitNow=()=>{ stop(); const W=el.clientWidth, H=el.clientHeight; V.fit=Math.min((W-40)/(V.w*1.14),(H-90)/(V.h*1.14)); V.max=V.got?Math.max(V.fit*1.5,4):V.fit*3; V.s=V.fit; V.x=V.y=0; clamp(); };
      // the wall round it, in the painting's own pixels so it zooms with it: the gallery's colour (the hall's stone), the dado and its rail below, the picture rail above, a light's pool over the painting; the frame gilt or dark wood
      V.dress=()=>{ const L=V.look||{}, u=V.h/(L.h||1.35), c=L.col||[214,206,188], X=TEX||{}, rgb=a=>'rgb('+a.map(v=>Math.round(Math.max(0,Math.min(255,v)))).join(',')+')', px=v=>v+'px', tile=t=>px(Math.max(8,t*u));
        const top=(108-ZC)/ZPU*u, dado=(ZC-30)/ZPU*u, floor=ZC/ZPU*u, ext=Math.max(V.w,V.h)*5, mid=V.h/2, y0=mid-top-.6*u, y1=mid+floor, GILT='linear-gradient(to bottom,#e8cc7e,#a8842e 45%,#d8b45e 60%,#7d5f24)';
        const woodBg=sz=>({backgroundColor:'#4a2c1a',backgroundImage:X.wood?'url('+X.wood+')':'none',backgroundSize:tile(sz),backgroundBlendMode:'normal'});
        const band=(k,y,h,css)=>{ const d=q(k).style; d.left=px(-ext); d.width=px(V.w+2*ext); d.top=px(y); d.height=px(Math.max(0,h)); d.background=''; d.boxShadow=''; Object.assign(d,css); };
        band('plaster',y0,y1-y0,{backgroundColor:rgb(c),backgroundImage:X.plaster?'url('+X.plaster+')':'none',backgroundBlendMode:'multiply',backgroundSize:tile(1.6)});
        band('cornice',y0,.6*u,{background:'linear-gradient(to bottom,rgba(0,0,0,.22),rgba(0,0,0,.08))'});
        band('light',y0,y1-y0,{background:'radial-gradient(ellipse '+px(V.w*.95)+' '+px(V.h)+' at '+px(ext+V.w/2)+' '+px(mid-V.h*.15-y0)+',rgba(255,238,205,.34),rgba(255,238,205,.08) 55%,transparent 75%)'});
        band('prail',mid-top,.05*u,{background:GILT,boxShadow:'0 '+px(.02*u)+' '+px(.03*u)+' rgba(0,0,0,.35)'});
        band('dado',mid+dado+.1*u,floor-dado-.22*u,{...woodBg(1.4),boxShadow:'inset 0 '+px(.05*u)+' '+px(.08*u)+' rgba(0,0,0,.5)'});
        band('drail',mid+dado,.1*u,{...woodBg(.8),boxShadow:'inset 0 '+px(.015*u)+' 0 rgba(255,220,180,.25),0 '+px(.02*u)+' '+px(.04*u)+' rgba(0,0,0,.45)'});
        band('skirt',mid+floor-.12*u,.12*u,{background:'#2a221b'});
        // the frame: gilt or the dark wood's grain, bevelled, a dark lip round the canvas
        const b=.07*u, fr=q('frame').style, e=Math.max(1,.012*u); fr.left=px(-b); fr.top=px(-b); fr.width=px(V.w+2*b); fr.height=px(V.h+2*b); fr.background='';
        const vb=sz=>({backgroundColor:'#4a2c1a',backgroundImage:X.woodv?'url('+X.woodv+')':'none',backgroundSize:tile(sz)});
        Object.assign(fr,L.gilt?{background:'linear-gradient(135deg,#e6c878,#9a7a34 28%,#dcb860 52%,#7d5f24 78%,#c8a24e)'}:vb(.7));
        for(const k of ['ftop','fbot']){ const d=q(k).style; d.height=px(b); d.background=''; Object.assign(d,L.gilt?{background:'none'}:woodBg(.7)); d.clipPath=k==='ftop'?'polygon(0 0,100% 0,calc(100% - '+px(b)+') 100%,'+px(b)+' 100%)':'polygon('+px(b)+' 0,calc(100% - '+px(b)+') 0,100% 100%,0 100%)'; }   // the top and bottom rails mitred into the sides
        fr.boxShadow='0 '+px(.06*u)+' '+px(.14*u)+' rgba(0,0,0,.6),inset '+px(e)+' '+px(e)+' '+px(2*e)+' rgba(255,235,200,.35),inset -'+px(e)+' -'+px(e)+' '+px(2*e)+' rgba(0,0,0,.55),inset 0 0 0 '+px(b*.35)+' rgba(0,0,0,.12)';
        im.style.boxShadow='0 0 0 '+px(Math.max(1,.012*u))+' #1a120c,inset 0 0 '+px(.04*u)+' rgba(0,0,0,.35)'; };
      V.size=(w,h,keep)=>{ const c=keep?{cx:(el.clientWidth/2-V.x)/(V.w*V.s),cy:(el.clientHeight/2-V.y)/(V.h*V.s),r:V.s/V.fit}:null; V.w=w; V.h=h; im.style.width=w+'px'; im.style.height=h+'px'; V.dress(); fitNow();
        if(V.tour){ V.go(V.tour.i,true); return; } if(c){ V.s=Math.min(V.max,V.fit*c.r); V.x=el.clientWidth/2-c.cx*V.w*V.s; V.y=el.clientHeight/2-c.cy*V.h*V.s; clamp(); } };
      // the tour: each step glides to its part of the painting (at: [x, y, w, h] as fractions of it; none: the whole) and tells its story in the card
      let anim=0; const stop=()=>{ cancelAnimationFrame(anim); anim=0; };
      const card=q('card');
      V.go=(i,now)=>{ const T=V.tour; if(!T)return; i=Math.max(0,Math.min(T.steps.length-1,i)); T.i=i; const S=T.steps[i], W=el.clientWidth, H=el.clientHeight, wide=W>760, aw=wide?W-420:W, ah=wide?H-60:H*.55;
        const a=S.at||[-.04,-.04,1.08,1.08], rw=a[2]*V.w, rh=a[3]*V.h, s=Math.min(V.max,Math.min(aw*.86/rw,ah*.86/rh)), x=aw/2-(a[0]*V.w+rw/2)*s, y=(wide?H/2:ah/2+12)-(a[1]*V.h+rh/2)*s;
        q('cn').textContent=(T.name||'GUIDED TOUR')+' · '+(i+1)+' / '+T.steps.length; q('ct').textContent=S.title||''; q('cx').innerHTML=(S.text||'').split('\n').map(x=>'<p style="margin:0 0 8px">'+esc(x)+'</p>').join('');
        q('back').style.visibility=i?'visible':'hidden'; q('next').textContent=i<T.steps.length-1?'NEXT':'FINISH';
        stop(); if(now){ V.s=s; V.x=x; V.y=y; put(); return; } const s0=V.s, x0=V.x, y0=V.y, t0=performance.now(), D=1300;
        const f=()=>{ const k=Math.min(1,(performance.now()-t0)/D), e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2, ls=Math.log(s0)+(Math.log(s)-Math.log(s0))*e, ss=Math.exp(ls), r=(ss-s0)/((s-s0)||1);
          V.s=ss; V.x=x0+(x-x0)*(Math.abs(s-s0)>1e-6?r:e); V.y=y0+(y-y0)*(Math.abs(s-s0)>1e-6?r:e); put(); if(k<1)anim=requestAnimationFrame(f); else anim=0; }; anim=requestAnimationFrame(f); };
      V.tourOn=()=>{ const T=TOURS[tkey(V.t)]; if(!T)return; V.tour={...T,i:0}; card.hidden=false; q('tour').hidden=true; V.go(0); };
      V.tourOff=()=>{ if(!V.tour)return; V.tour=null; card.hidden=true; q('tour').hidden=!TOURS[tkey(V.t)]; stop(); fitNow(); };
      q('tour').onclick=V.tourOn; q('next').onclick=()=>{ const T=V.tour; if(!T)return; if(T.i>=T.steps.length-1)V.tourOff(); else V.go(T.i+1); }; q('back').onclick=()=>V.tour&&V.go(V.tour.i-1); q('end').onclick=()=>V.tourOff();
      for(const k of ['pointerdown','wheel','dblclick'])card.addEventListener(k,e=>e.stopPropagation(),{passive:true});
      V.close=()=>{ if(!el.hidden&&UI.gamewin==='art')UI.gamewin=null; V.tour=null; card.hidden=true; stop(); el.hidden=true; im.onload=null; if(V.full)V.full.src=''; V.full=null; V.got=false; V.t=null; };
      q('x').onclick=V.close; q('in').onclick=()=>zoom(1.6); q('out').onclick=()=>zoom(1/1.6); q('fit').onclick=fitNow; q('one').onclick=()=>zoom(1/V.s);
      el.addEventListener('wheel',e=>{ e.preventDefault(); zoom(Math.exp(-e.deltaY*.0018),e.clientX,e.clientY); },{passive:false});
      const P=new Map(); let pd=0;
      el.addEventListener('pointerdown',e=>{ if(e.target.tagName==='BUTTON')return; stop(); el.setPointerCapture(e.pointerId); P.set(e.pointerId,[e.clientX,e.clientY]); el.style.cursor='grabbing'; if(P.size===2){ const [a,b]=[...P.values()]; pd=Math.hypot(a[0]-b[0],a[1]-b[1]); } });
      el.addEventListener('pointermove',e=>{ const o=P.get(e.pointerId); if(!o)return; if(P.size===1){ V.x+=e.clientX-o[0]; V.y+=e.clientY-o[1]; P.set(e.pointerId,[e.clientX,e.clientY]); if(V.tour)put(); else clamp(); return; }
        P.set(e.pointerId,[e.clientX,e.clientY]); const [a,b]=[...P.values()], d=Math.hypot(a[0]-b[0],a[1]-b[1]); if(pd>0)zoom(d/pd,(a[0]+b[0])/2,(a[1]+b[1])/2); pd=d; });
      const up=e=>{ P.delete(e.pointerId); pd=0; if(!P.size)el.style.cursor='grab'; }; el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up);
      el.addEventListener('dblclick',e=>{ if(e.target.tagName==='BUTTON')return; if(V.s>V.fit*1.05)fitNow(); else zoom(3,e.clientX,e.clientY); });
      addEventListener('resize',()=>{ if(!el.hidden)V.size(V.w,V.h,true); });
      addEventListener('keydown',e=>{ if(el.hidden)return; e.stopImmediatePropagation(); e.preventDefault(); const k=e.key;
        if(V.tour&&(k==='ArrowRight'||k===' '))return q('next').onclick(); if(V.tour&&k==='ArrowLeft')return V.go(V.tour.i-1); if(k==='Escape')return V.tour?V.tourOff():V.close();
        if(k==='+'||k==='=')zoom(1.6); else if(k==='-'||k==='_')zoom(1/1.6); else if(k==='0')fitNow();
        else if(/^Arrow/.test(k)){ V.x+=k==='ArrowLeft'?80:k==='ArrowRight'?-80:0; V.y+=k==='ArrowUp'?80:k==='ArrowDown'?-80:0; clamp(); } },true);
      addEventListener('keyup',e=>{ if(!el.hidden){ e.stopImmediatePropagation(); } },true);
      V.cap=q('cap'); V.st=q('st'); V.q=q; }
    const {el,im}=V; V.close(); V.t=t; V.look=p?{col:p.f.rm.col,gilt:[0,1,5].includes(p.f.rm.g)||/Stuart|Cole|Church|Leutze/.test(t.a),h:p.h}:null; el.hidden=false; if(!UI.gamewin)UI.gamewin='art'; V.q('tour').hidden=!TOURS[tkey(t)];
    V.cap.innerHTML='<div style="font-size:15px;color:#f4ecd4">'+esc(t.t.toUpperCase())+'</div><div style="margin-top:4px">'+esc(t.a.toUpperCase())+', '+esc(t.d)+'</div><div style="margin-top:4px;color:#a89c84">'+esc(t.m.toUpperCase())+' · PUBLIC DOMAIN (CC0)</div>';
    im.onload=null; im.src=t.i; V.size(t.w*4,t.h*4); V.st.textContent=t.f?'LOADING FULL RESOLUTION…':'';
    if(t.f){ const F=V.full=new Image(); F.decoding='async'; F.onload=()=>{ if(V.full!==F||V.t!==t)return; im.src=F.src; V.got=true; V.size(F.naturalWidth,F.naturalHeight,true); V.st.textContent='FULL RESOLUTION · '+F.naturalWidth+' × '+F.naturalHeight; };
      F.onerror=()=>{ if(V.full===F)V.st.textContent='THE FULL PICTURE COULD NOT BE FETCHED'; }; F.src=t.f; } };
  const tkey=t=>t?t.t+'|'+t.a:'';
  A_.view=view; A_.viewer=()=>V&&{open:!V.el.hidden,full:!!V.got,w:V.w,h:V.h,s:+V.s.toFixed(3),fit:+V.fit.toFixed(3),max:+V.max.toFixed(3),t:V.t&&V.t.t,wall:!!V.look,tour:V.tour?{i:V.tour.i,n:V.tour.steps.length,title:V.tour.steps[V.tour.i].title}:null,hasTour:!!TOURS[tkey(V.t)]}; A_.tourOn=()=>V&&V.tourOn(); A_.tourNext=()=>V&&V.q('next').onclick(); A_.tourOff=()=>V&&V.tourOff();
  const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  STORE.pre.art=async()=>{ await LOAD('art'); if(!DATA){ DATA=await ART(); try{ TOURS=await ARTTOURS()||{}; }catch(e){ TOURS={}; } try{ TEX=await ARTTEX(); }catch(e){ TEX=null; } layout(); } };
  rec('art','THE ART MUSEUM',B,D,true);
  STORE.artFrame={B,FZ,cx,cy,LS,data:()=>DATA};   // the inside's corner, its middle, floor height and lift, the paintings' list, for what furnishes it
  STEPS.push(()=>{ '@later'; room('art','THE ART MUSEUM',B,{floor:null,in:()=>[214,206,188]},D,set0,{xo:1,noCeil:1,noWins:1}); const S=STORE.inside.art;
    if(S&&!S.done){ const g0=S.go; S.go=()=>{ g0(); for(const [a,c] of [[B.x0,cx],[cx,B.x1]])K.flat(a,B.y0,c,B.y1,.15,marble,'L'); build(); if(STORE.furnish&&STORE.furnish.art)STORE.furnish.art(STORE.artFrame); }; }
    if(S)S.un=()=>{ A_.gen=(A_.gen||0)+1; for(const G of A_.groups){ const inG=o=>{ for(let q=o;q;q=q.parent)if(q===G)return true; return false; }; for(let i=UI.things.length-1;i>=0;i--)if(UI.things[i].obj&&inG(UI.things[i].obj))UI.things.splice(i,1);
      PERFX.owned.delete(G); G.removeFromParent(); G.traverse(c=>{ if(c.geometry)c.geometry.dispose(); for(const q of c.material?[].concat(c.material):[]){ if(q.map)q.map.dispose(); q.dispose(); } }); } A_.groups=[]; A_.built=false; A_.hung=0; A_.cab=A_.handle=A_.gates=null; Object.assign(CAB,{z:0,pz:0,at:0,door:0,open:false,to:null,ride:null,dir:0}); A_.lv=0; A_.busy=false; if(LM)LM.hidden=true; };   // dropped when you leave (the paintings come back next time)
    // the outside is the Polyfork building on the lot (068a); its solid as deep as the building
    const DB=15/.924; sol(LW.x0,Math.min(LW.y0,LW.y1-DB),LW.x1,LW.y1,H); STORE.streetDoor.art={door:TP.pt(cxL,L.y1+.35),out:[...TP.pt(cxL,L.y1+1.4),TP.hd(0)]};
    STORE.bound.x1=Math.max(STORE.bound.x1,X(B.x1+20)); STORE.bound.z0=Math.min(STORE.bound.z0,Z(B.y0-6)); STORE.bound.z1=Math.max(STORE.bound.z1,Z(B.y1+6)); });
});
