// THE PLAYHOUSE'S HOUSE, THE WOODEN O (owner, 10 Nov 2026): a twenty-sided yard open to the sky, three tiers of galleries round it (the lower two walked and sat in, benches facing the stage), a thrust stage under the heavens on two painted pillars, the tiring house behind it with its two doors, curtain and balcony, the gate passage from the street with the pay hatch, a stair up to the middle gallery, lanterns on the posts.
import {THREE} from './003-shx.js';
const PHA={};
// the plan (metres; x across, stage left +x; z from the yard's middle, the stage at -z, the gate at +z; y up from the yard)
PHA.D={N:20,A0:9,A1:12.2,G1:.5,G2:3.8,G3:7.1,TOP:10,SY:1.4,SX:5.2,TZ:-7.2,SZ:-1.2,PX:3.8,PZ:-2,HV:7.4,GW:1.45,
  ST:{x0:1.7,x1:6.1,z0:10.35,z1:11.65,n:11},ENT:[3,7,13,17],SHUT:[9,10,11]};
PHA.make=K=>{ '@playhouse';
  const D=K.D=PHA.D, M=K.M, TX=K.TX, PI=Math.PI, {box,boxA,cyl,lathe,plane,rod,inst}=K, N=D.N, ST=D.ST;
  const c=k=>k*2*PI/N, RV=a=>a/Math.cos(PI/N), SIDE=a=>2*a*Math.tan(PI/N), at=(k,a,t=0)=>{ const s=Math.sin(c(k)), co=Math.cos(c(k)); return [s*a+co*t,co*a-s*t]; };
  const rho=(x,z)=>{ let m=-1e9; for(let k=0;k<N;k++)m=Math.max(m,x*Math.sin(c(k))+z*Math.cos(c(k))); return m; };
  const shut=k=>D.SHUT.includes(k), gate=k=>k===0, open=k=>D.ENT.includes(k);
  const tile=t=>{ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.needsUpdate=true; return t; };
  const rnd=(()=>{ let a=7; return ()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; })();
  // the surfaces: lime plaster between oak beams, thatch, the yard's beaten earth and rushes, the galleries' painted fronts, the heavens' stars
  const T={
    frame:tile(TX.print(256,256,(g,w,h)=>{ g.fillStyle='#ece2cc'; g.fillRect(0,0,w,h); for(let i=0;i<500;i++){ g.fillStyle=`rgba(150,130,100,${.04+rnd()*.06})`; g.fillRect(rnd()*w,rnd()*h,2+rnd()*8,2+rnd()*8); }
      g.fillStyle='#2e2016'; g.fillRect(0,0,w,18); g.fillRect(0,h-18,w,18); g.fillRect(0,h/2-9,w,18); g.fillRect(0,0,18,h); g.fillRect(w/2-9,0,18,h);
      g.lineWidth=14; g.strokeStyle='#2e2016'; g.beginPath(); g.moveTo(18,h/2); g.lineTo(w/2,18); g.moveTo(w/2,h/2); g.lineTo(w-9,18); g.stroke(); })),
    thatch:tile(TX.print(256,128,(g,w,h)=>{ g.fillStyle='#7a6440'; g.fillRect(0,0,w,h); for(let i=0;i<1400;i++){ const x=rnd()*w, y=rnd()*h, v=rnd(); g.strokeStyle=v<.5?'rgba(60,46,26,.5)':'rgba(170,146,96,.45)'; g.lineWidth=1; g.beginPath(); g.moveTo(x,y); g.lineTo(x+(rnd()-.5)*3,y+6+rnd()*10); g.stroke(); }
      g.fillStyle='rgba(40,30,18,.35)'; for(let y=0;y<h;y+=32)g.fillRect(0,y,w,3); })),
    earth:tile(TX.print(256,256,(g,w,h)=>{ g.fillStyle='#6a583e'; g.fillRect(0,0,w,h); for(let i=0;i<2600;i++){ const v=rnd(); g.fillStyle=v<.5?'rgba(40,30,20,.25)':'rgba(150,128,90,.25)'; g.fillRect(rnd()*w,rnd()*h,1+rnd()*4,1+rnd()*4); }
      g.strokeStyle='rgba(196,170,100,.55)'; g.lineWidth=1.5; for(let i=0;i<260;i++){ const x=rnd()*w, y=rnd()*h, a=rnd()*PI; g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*9,y+Math.sin(a)*9); g.stroke(); } })),
    front:tile(TX.print(256,96,(g,w,h)=>{ g.fillStyle='#c8b48c'; g.fillRect(0,0,w,h); for(let i=0;i<4;i++){ const x=8+i*62; g.fillStyle='#5a3a24'; g.fillRect(x,10,54,h-20); const gr=g.createLinearGradient(x,0,x+54,h); gr.addColorStop(0,'#8a5a5a'); gr.addColorStop(.5,'#b08080'); gr.addColorStop(1,'#6a4040'); g.fillStyle=gr; g.fillRect(x+5,15,44,h-30);
      g.strokeStyle='rgba(240,230,210,.35)'; g.lineWidth=1; for(let k=0;k<4;k++){ g.beginPath(); g.moveTo(x+5+rnd()*44,15); g.bezierCurveTo(x+rnd()*54,30,x+rnd()*54,60,x+5+rnd()*44,h-15); g.stroke(); } } g.fillStyle='#3a2616'; g.fillRect(0,0,w,6); g.fillRect(0,h-6,w,6); })),
    heavens:TX.print(512,256,(g,w,h)=>{ const gr=g.createRadialGradient(w/2,h/2,10,w/2,h/2,w*.6); gr.addColorStop(0,'#2a4a8a'); gr.addColorStop(1,'#0e1a3a'); g.fillStyle=gr; g.fillRect(0,0,w,h);
      g.fillStyle='#e8c060'; for(let i=0;i<140;i++){ const x=rnd()*w, y=rnd()*h, r=1+rnd()*2.5; g.beginPath(); for(let k=0;k<10;k++){ const a=k*PI/5, q=k%2?r*.45:r; g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q); } g.fill(); }
      g.beginPath(); g.arc(w*.3,h/2,30,0,7); g.fill(); g.fillStyle='#f2ead0'; g.beginPath(); g.arc(w*.7,h/2,26,0,7); g.fill(); g.fillStyle='#183060'; g.beginPath(); g.arc(w*.7+12,h/2-6,24,0,7); g.fill();
      g.strokeStyle='#e8c060'; g.lineWidth=4; g.strokeRect(6,6,w-12,h-12); g.font='bold 18px Georgia,serif'; g.textAlign='center'; g.fillStyle='#e8c060'; g.fillText('TOTUS MUNDUS AGIT HISTRIONEM',w/2,h-20); }),
    oak:tile(TX.print(128,128,(g,w,h)=>{ g.fillStyle='#4a3020'; g.fillRect(0,0,w,h); for(let i=0;i<60;i++){ g.strokeStyle=`rgba(${rnd()<.5?'30,18,10':'110,76,46'},.35)`; g.lineWidth=1; const y=rnd()*h; g.beginPath(); g.moveTo(0,y); g.bezierCurveTo(w*.3,y+(rnd()-.5)*8,w*.6,y+(rnd()-.5)*8,w,y+(rnd()-.5)*6); g.stroke(); } }))};
  const lam=o=>new THREE.MeshLambertMaterial(o);
  const MT={frame:lam({map:T.frame,side:THREE.DoubleSide}),thatch:lam({map:T.thatch,side:THREE.DoubleSide}),earth:lam({map:T.earth}),front:lam({map:T.front}),heavens:lam({map:T.heavens}),oak:lam({map:T.oak}),
    floor:lam({map:T.oak,side:THREE.DoubleSide}),beam:lam({color:0x2e2016}),bench:lam({color:0x6a4a2c}),door:lam({color:0x3a2414}),gold:M.gold,marble:M.marble,velvet:M.velvet,iron:M.iron};

  /* ---------- the ground, region by region (first that answers) ---------- */
  const inR=(x,z,x0,z0,x1,z1)=>x>=x0&&x<=x1&&z>=z0&&z<=z1, ax=Math.abs;
  K.ground((x,z)=>inR(ax(x),z,0,D.TZ,D.SX,D.SZ)?D.SY:null);                                                                      // the stage
  K.ground((x,z)=>inR(ax(x),z,D.SX,-3.6,D.SX+1.2,-1.6)?D.SY*Math.max(0,Math.min(4,Math.ceil((D.SX+1.2-ax(x))/.3)))/4:null);        // its steps up, both sides
  K.ground((x,z)=>{ if(!inR(x,z,ST.x0,ST.z0,ST.x1,ST.z1))return null; const k=Math.min(ST.n,Math.max(1,Math.ceil((x-ST.x0)/((ST.x1-ST.x0)/ST.n)))), h=D.G1+(D.G2-D.G1)*k/ST.n, you=K.you?K.you().y:0;
    return you>h-1.1?h:null; });                                                                                                   // the stair to the middle gallery (walked from its foot; under it you stay below)
  K.ground((x,z)=>{ const r=rho(x,z); if(r<D.A0||r>D.A1+.6)return null; const you=K.you?K.you().y:0; return you>(D.G1+D.G2)/2?D.G2:D.G1; });   // the galleries: the one you are on
  K.ground((x,z)=>rho(x,z)<D.A0?0:null);                                                                                           // the yard

  /* ---------- the solids ---------- */
  const S=K.solid, dot=(x,z,r=.2)=>S(x-r,z-r,x+r,z+r);
  for(let k=0;k<N;k++){ const L=SIDE(D.A1+.15); for(let t=-L/2;t<=L/2;t+=.45){ const [x,z]=at(k,D.A1+.15,t); dot(x,z,.25); } }           // the outer wall
  for(let k=0;k<N;k++){ const a=c(k)+PI/N; dot(Math.sin(a)*RV(D.A0),Math.cos(a)*RV(D.A0),.18); }   // the posts
  for(let k=0;k<N;k++){ if(gate(k)||open(k)||shut(k))continue; const L=SIDE(D.A0); for(let t=-L/2+.4;t<=L/2-.4;t+=.4){ const [x,z]=at(k,D.A0,t); dot(x,z,.14); } }   // the gallery fronts (open bays to step up from the yard)
  S(-7.6,-D.A1-1,7.6,D.TZ-.05);                                                                                                    // the tiring house
  for(const s of [-1,1])dot(s*D.PX,D.PZ,.32);                                                                                      // the heavens' pillars
  for(const s of [-1,1])for(let z=D.A0-.3;z<=D.A1;z+=.4)dot(s*(D.GW+.1),z,.12);                                                    // the passage walls
  for(let x=ST.x0;x<=ST.x1+.2;x+=.4){ dot(x,ST.z0-.08,.1); dot(x,ST.z1+.08,.1); }                                                   // the stair's sides

  /* ---------- the yard and the gallery floors, the posts, the outer wall ---------- */
  { const g=new THREE.CircleGeometry(RV(D.A0)+.02,N); const uv=g.attributes.uv; for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*4,uv.getY(i)*4);
    const m=K.put(new THREE.Mesh(g,MT.earth),0,.01,0,{rx:-PI/2,cast:false}); m.rotation.z=PI/N+PI/2; m.receiveShadow=true; }
  const ring=(a0,a1,y,mat)=>{ const m=lathe([[RV(a0),y],[RV(a1),y]],mat,0,0,0,{seg:N,cast:false}); m.rotation.y=PI/N; return m; };
  for(const y of [D.G1,D.G2,D.G3])ring(D.A0,D.A1,y,MT.floor);
  for(const y of [D.G2,D.G3])ring(D.A0,D.A1,y-.18,MT.floor);
  for(let k=0;k<N;k++){ const a=c(k)+PI/N, x=Math.sin(a)*RV(D.A0), z=Math.cos(a)*RV(D.A0); box(.28,D.TOP-.1,.28,MT.oak,x,(D.TOP-.1)/2,z,{ry:a}); }
  for(let k=0;k<N;k++){ const [x,z]=at(k,D.A1+.02); plane(SIDE(D.A1),D.TOP,MT.frame,x,D.TOP/2,z,{ry:c(k)+PI,s:2.6}); }
  for(let k=0;k<N;k++){ if(shut(k))continue; const [x,z]=at(k,D.A0); box(SIDE(D.A0),D.G1+.02,.16,MT.beam,x,(D.G1+.02)/2,z,{ry:c(k)}); }   // the lower gallery's skirting, down to the yard
  // the gallery fronts: painted panels between the posts with an oak rail, on every level (the lower open where you step up)
  for(let k=0;k<N;k++){ if(shut(k))continue; const L=SIDE(D.A0)-.3, [x,z]=at(k,D.A0);
    for(const [y,lv] of [[D.G1,1],[D.G2,2],[D.G3,3]]){ if(lv===1&&(open(k)||gate(k)))continue; if(gate(k)&&lv===1)continue;
      plane(L,.9,MT.front,x-Math.sin(c(k))*.06,y+.45,z-Math.cos(c(k))*.06,{ry:c(k)+PI,s:2.4}); box(L,.08,.16,MT.oak,x,y+.94,z,{ry:c(k)});
      box(L,.18,.22,MT.beam,x,y-.09,z,{ry:c(k)}); } }
  // the roof: thatch round the top, sloping out, over a deep eave
  { const m=lathe([[RV(D.A0-.6),D.TOP-.1],[RV(D.A0+1.6),D.TOP+1.5],[RV(D.A1+.6),D.TOP-.2]],MT.thatch,0,0,0,{seg:N}); m.rotation.y=PI/N; }

  /* ---------- the benches: two rows on each gallery side, the seats to sit in on the two lower galleries ---------- */
  { const rows=[], at3=[];
    for(let k=0;k<N;k++){ if(shut(k)||gate(k))continue;
      for(const [y,lv] of [[D.G1,1],[D.G2,2],[D.G3,3]])for(const [a,ri] of [[D.A0+.9,0],[D.A0+2.1,1]]){ if(lv===1&&k===1)continue; const L=SIDE(a)-.6, [x,z]=at(k,a), lift=ri*.3;
        if(ri)box(L+.3,lift,.9,MT.oak,x,y+lift/2,z,{ry:c(k)});
        rows.push([x,y+lift+.42,z,c(k),L]); if(lv<3)for(const t of [-L/3,0,L/3]){ const [sx,sz]=at(k,a,t); K.seats.push({x:sx,y:y+lift+.45,z:sz,hd:c(k)+PI,blk:'g'+lv+'k'+k,row:0,lv}); } } }
    for(const [x,y,z,ry,L] of rows){ box(L,.06,.36,MT.bench,x,y,z,{ry}); for(const t of [-L/2+.15,L/2-.15]){ const tx=x+Math.cos(ry)*t, tz=z-Math.sin(ry)*t; box(.08,.42,.3,MT.oak,tx,y-.21,tz,{ry}); } } }

  /* ---------- the stage: boards on trestles hung with black, a trap in its middle; steps up at its sides ---------- */
  boxA(-D.SX,0,D.TZ,D.SX,D.SY,D.SZ,M.boards,{s:1.2});
  boxA(-D.SX-.02,.05,D.SZ-.03,D.SX+.02,D.SY-.06,D.SZ+.02,M.blackVel,{s:1}); for(const s of [-1,1])boxA(s*D.SX-.03,.05,D.TZ,s*(D.SX+.02),D.SY-.06,D.SZ,M.blackVel,{s:1});
  plane(1.2,1.2,MT.beam,0,D.SY+.01,-4.4,{rx:-PI/2}); plane(1.1,1.1,M.boards,0,D.SY+.015,-4.4,{rx:-PI/2});
  for(const s of [-1,1])for(let i=0;i<4;i++){ const x0=s*(D.SX+1.2-i*.3), x1=s*(D.SX+1.2-(i+1)*.3); boxA(Math.min(x0,x1),0,-3.6,Math.max(x0,x1),D.SY*(i+1)/4,-1.6,MT.oak); }

  /* ---------- the heavens: two painted pillars, the canopy with its starry underside, its little gabled roof ---------- */
  for(const s of [-1,1]){ const x=s*D.PX; box(.8,.4,.8,MT.marble,x,D.SY+.2,D.PZ); cyl(.26,.3,D.HV-D.SY-.7,MT.marble,x,(D.HV+D.SY)/2,D.PZ,{seg:16}); box(.7,.3,.7,MT.gold,x,D.HV-.2,D.PZ); }
  { const x0=-D.SX-.6, x1=D.SX+.6, z0=D.TZ, z1=D.PZ+.8, w=x1-x0, d=z1-z0, zm=(z0+z1)/2;
    boxA(x0,D.HV,z0,x1,D.HV+.3,z1,MT.oak); plane(w-.2,d-.2,MT.heavens,0,D.HV-.01,zm,{rx:PI/2});
    boxA(x0-.05,D.HV+.3,z1-.1,x1+.05,D.HV+.55,z1+.05,MT.gold);
    for(const s of [-1,1]){ const m=box(w+.4,.12,d/2/Math.cos(.5)+.2,MT.thatch,0,D.HV+.3+Math.tan(.5)*d/4,zm+s*d/4,{rx:s*.5}); m.castShadow=true; }
    box(1.4,1.3,1.2,MT.frame,0,D.HV+1.6,zm); box(1.6,.12,1.4,MT.thatch,0,D.HV+2.3,zm); }

  /* ---------- the tiring house: its front in oak and paint, two doors, the curtained middle, the balcony over them ---------- */
  { const z=D.TZ, y0=D.SY, W=7.4;
    boxA(-W,0,-D.A1,W,D.TOP,z,MT.oak,{s:2});
    plane(2*W,D.TOP-y0-3,MT.frame,0,y0+3+(D.TOP-y0-3)/2,z+.01,{s:2.6});
    for(const s of [-1,1]){ const x=s*2.7; boxA(x-.75,y0,z,x+.75,y0+2.7,z+.06,MT.door); boxA(x-.9,y0+2.7,z,x+.9,y0+2.95,z+.1,MT.gold); for(let i=0;i<4;i++)for(let j=0;j<6;j++)K.sph(.03,MT.iron,x-.55+i*.37,y0+.3+j*.42,z+.07,{seg:6,seg2:4,cast:false}); }
    boxA(-1.3,y0,z,1.3,y0+2.8,z+.04,MT.velvet,{s:1});
    for(const x of [-4.4,-1.6,1.6,4.4]){ cyl(.16,.18,2.9,MT.marble,x,y0+1.45,z+.25,{seg:12}); box(.45,.15,.45,MT.gold,x,y0+2.95,z+.25); }
    boxA(-5.2,y0+3,z,5.2,y0+3.15,z+.9,MT.oak); boxA(-5.2,y0+3.15,z+.82,5.2,y0+3.95,z+.9,MT.front,{s:2.4}); boxA(-5.25,y0+3.95,z+.78,5.25,y0+4.05,z+.95,MT.oak);
    for(const x of [-5.1,5.1])box(.12,.9,.12,MT.oak,x,y0+3.6,z+.86); }

  /* ---------- the gate passage: plastered walls, the gate in the outer wall, the pay hatch on its left; the stair up on its right ---------- */
  { const z0=D.A0-.3, z1=D.A1+.1, L=z1-z0, zm=(z0+z1)/2;
    for(const s of [-1,1])plane(L,D.G2-.2,MT.frame,s*D.GW,(D.G2-.2)/2,zm,{ry:-s*PI/2,s:2.6});
    plane(2*D.GW,L,M.boards,0,D.G2-.19,zm,{rx:PI/2,s:1.2});
    boxA(-D.GW,D.G1,z1,D.GW,3.2,z1+.15,MT.door); boxA(-.04,D.G1,z1-.02,.04,3.1,z1,MT.beam); for(const s of [-1,1])rod([s*.3,1.2,z1-.04],[s*.3,1.5,z1-.04],.03,MT.iron);
    const hz=10.6; boxA(-D.GW-.06,1.0,hz-.6,-D.GW,1.9,hz+.6,MT.beam); boxA(-D.GW-.02,1.04,hz-.55,-D.GW+.01,1.86,hz+.55,lam({color:0x2a1a10})); boxA(-D.GW,1.0,hz-.65,-D.GW+.35,1.08,hz+.65,MT.oak);
    K.hatch={x:-D.GW+.2,y:1.4,z:hz}; K.sph(.06,M.bulb,-D.GW-.3,1.75,hz,{cast:false});
    K.gate={x:0,z:z1-.3}; }
  for(let i=0;i<ST.n;i++){ const x0=ST.x0+i*(ST.x1-ST.x0)/ST.n, x1=x0+(ST.x1-ST.x0)/ST.n, h=D.G1+(D.G2-D.G1)*(i+1)/ST.n; boxA(x0,h-.12,ST.z0,x1,h,ST.z1,MT.oak); box(.06,.9,.06,MT.oak,(x0+x1)/2,h+.45,ST.z0); }
  rod([ST.x0,D.G1+.95,ST.z0],[ST.x1,D.G2+.95,ST.z0],.03,MT.oak);

  /* ---------- the lanterns: one on every other post at the lower gallery's height, and over the gate ---------- */
  K.lanterns=[]; { const ls=[]; for(let k=0;k<N;k+=2){ if(shut(k)||shut(k+1))continue; const a=c(k)+PI/N, r=RV(D.A0)-.25; ls.push([Math.sin(a)*r,2.8,Math.cos(a)*r]); }
    for(const p of ls){ box(.22,.32,.22,MT.iron,p[0],p[1],p[2]); K.sph(.08,M.bulb,p[0],p[1],p[2],{cast:false}); K.lanterns.push(p); } }
};
export {PHA};
