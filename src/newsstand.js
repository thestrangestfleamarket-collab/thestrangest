// ---- THE NEWSSTAND (owner, 18 Oct 2026: "Newsstand with newspaper cat character already in game. He runs it. Drones deliver newspapers every
// morning. Realistic stand with real inventory / NYC style / Give him all the animations he will need"; his pick: by the subway entrance): a New
// York kiosk of green sheet steel on the main street's sidewalk just east of the Metro's opening, its back to the empty lot: the counter open to
// the street under a flat overhang with a light tube, NEWS on its header, the roll-down shutter in its housing; the papers on a stepped rack
// below the counter (four made-up titles, each stack as high as its stock), magazines clipped up the posts and hung in rows on both outer sides,
// candy, gum and mints along the counter, snacks on the back wall's shelves, a drinks cooler at its east end. THE CAT IN THE RAINCOAT runs it
// (npc-toons.js), on a crate behind the counter, held there: he reads his paper; waves when you come up; serves you and counts your change;
// tidies the magazines, stretches, dozes in the afternoon lull; opens the shutter at a quarter to six and pulls it down at ten, dozing behind
// it at night. Every morning at half past five two delivery drones bring the day's bundles (two each, hung under them on a line) and set them
// down beside the stand; he heaves each one up, cuts its twine and the stack it fills grows. A double click on the stand: its stock, its
// prices, your money (the drone link's purse), BUY; a paper bought shows its front page. Stock is real: each sale takes one, each bundle adds
// 25 to its title, the cooler and the sweets restocked with the morning's bundles. Cost: some 2,100 triangles (one instanced draw of boxes, one
// of the glowing faces, the shutter's eight slats, up to four bundles, the drones 2 x 150 while they fly); no lamp, no program of its own ----
const NEWS=window.NEWS={};
NEWS.init=()=>{ const N=typeof TOONS!=='undefined'&&TOONS.cat; if(!N||typeof BOD==='undefined')return;
  const X=BOD.XS, Y=z=>BOD.YS(z*.64), Z=BOD.ZS, T=TILE, x0=65.6, x1=70.4, y0=-76.85, y1=-74.85, xm=(x0+x1)/2;
  const GRN=0x2e5b3e, GRN2=0x23472f, GRN3=0x3b7050, STEEL=0x7c8288, DARK=0x22262a, WOOD=0x8a6440, CREAM=0xeee6cc;
  const BX=[], GL=[]; const box=(a,b,c,d,z0,z1,col,L=BX)=>{ L.push([(X(a)+X(b))/2,(Y(z0)+Y(z1))/2,(Z(c)+Z(d))/2,Math.abs(X(b)-X(a)),Y(z1)-Y(z0),Math.abs(Z(d)-Z(c)),col]); };
  const rnd=(()=>{ let t=11; return ()=>{ t=(t*16807)%2147483647; return t/2147483647; }; })();
  // the body: plinth, back, sides, the panel under the counter, the counter, the posts, the header, the roof and its overhang
  box(x0,x1,y0,y1,0,3,DARK); box(x0,x1,y0,y0+.1,3,112,GRN); box(x0,x0+.1,y0,y1,3,112,GRN); box(x1-.1,x1,y0,y1,3,112,GRN);
  box(x0+.1,x1-.1,y1-.1,y1,3,40,GRN); for(let i=0;i<5;i++)box(x0+.3+i*(x1-x0-.6)/5,x0+.3+i*(x1-x0-.6)/5+.06,y1,y1+.02,8,36,GRN2);   // (the panel's pressed ribs)
  box(x0+.1,x1-.1,y1-.55,y1+.2,40,44,STEEL); box(x0,x0+.18,y1-.18,y1,44,96,GRN2); box(x1-.18,x1,y1-.18,y1,44,96,GRN2);
  box(x0,x1,y1-.12,y1,96,112,GRN); box(x0-.12,x1+.12,y0-.12,y1+.12,112,116,GRN2); box(x0-.12,x1+.12,y1+.12,y1+.42,109,112,GRN3);
  box(x0+.18,x1-.18,y1-.3,y1-.1,91,96,STEEL);   // (the shutter's housing)
  // the sign: NEWS in a pixel face on a lit cream panel, LOTTO in red at its east end
  box(xm-1.3,xm+1.3,y1,y1+.03,98,110,CREAM,GL); box(x1-1.05,x1-.25,y1,y1+.03,99,105,0xd03a2a,GL);
  const F={N:['101','111','111','101','101'],E:['111','100','110','100','111'],W:['101','101','101','111','101'],S:['111','100','111','001','111']};
  [...'NEWS'].forEach((ch,k)=>F[ch].forEach((row,j)=>[...row].forEach((v,i)=>{ if(v==='1'){ const a=xm-.75+k*.4+i*.1; box(a,a+.1,y1+.03,y1+.05,108-(j+1)*2,108-j*2,GRN2); } })));
  box(x0+.4,x1-.4,y1+.3,y1+.38,106.5,108,0xfff4d0,GL);   // (the tube under the overhang)
  // inside: the crate he stands on, the back wall's three shelves of snacks
  box(xm-.45,xm+.45,y1-1.15,y1-.5,0,16,WOOD);
  for(let s=0;s<3;s++){ const z=52+s*14; box(x0+.15,x1-.15,y0+.1,y0+.45,z,z+1.5,STEEL); for(let a=x0+.25;a<x1-.35;a+=.22+rnd()*.06){ const h=6+rnd()*6; box(a,a+.16,y0+.14,y0+.4,z+1.5,z+1.5+h,[0xd8442e,0x2e74c9,0xf2c230,0x3aa04a,0xe87a2a,0x8a3ab0,0xf0f0e8][Math.floor(rnd()*7)]); } }
  // the counter's front edge: candy bars, gum, mints in rows of little boxes
  for(let a=x0+.3;a<x1-.3;a+=.14){ const k=Math.floor(rnd()*6); box(a,a+.11,y1-.05,y1+.15,44,44+(k<2?3:2),[0xc8322a,0x7a4a2a,0x2a8a4a,0xf0d030,0x3a6ad0,0xf08ac0][k]); }
  box(x0+.4,x0+1.1,y1-.45,y1-.1,44,49,0xd8d4c8); box(x1-1.1,x1-.4,y1-.45,y1-.1,44,48,0xb8b0a0);   // (the change tray, the gum box; every height here in the game's px at .64: the stand 2.6 m)
  // the magazines: three columns clipped up each post's inner edge, and rows on both outer sides
  const COV=[0xd8442e,0x2e74c9,0xf2c230,0x3aa04a,0xe87a2a,0x8a3ab0,0xe8e0d0,0x202428,0xf08ac0,0x40b8c0];
  for(const [a,b] of [[x0+.18,x0+.62],[x1-.62,x1-.18]])for(let k=0;k<3;k++){ const z=58+k*12, c=COV[Math.floor(rnd()*COV.length)]; box(a,b,y1-.16,y1-.14,z,z+10,c); box(a+.04,b-.04,y1-.14,y1-.13,z+7,z+9,CREAM); }
  for(const [xa,xb,s] of [[x0-.03,x0,-1],[x1,x1+.03,1]])for(let r=0;r<3;r++)for(let k=0;k<3;k++){ const ya=y0+.15+k*.58, za=46+r*20, c=COV[Math.floor(rnd()*COV.length)];
    box(xa,xb,ya,ya+.48,za,za+16,c); box(s<0?xa-.01:xb,s<0?xa:xb+.01,ya+.05,ya+.43,za+11,za+14,CREAM); if(r===0&&k===0)box(xa,xb,y0+.1,y1-.1,za+17,za+18,STEEL); }
  // the drinks cooler at its east end: white, its glass front lit, cans in rows behind it
  const cx0=x1+.08, cx1=x1+1.05, cy0=y0+.15, cy1=y0+1.2; box(cx0,cx1,cy0,cy1,0,72,0xe8e8e4); box(cx0+.08,cx1-.08,cy1,cy1+.02,10,66,0xa8d8f0,GL);
  for(let r=0;r<4;r++)for(let a=cx0+.14;a<cx1-.16;a+=.13)box(a,a+.1,cy1-.25,cy1-.05,14+r*13,23+r*13,[0xd8442e,0x2e74c9,0x3aa04a,0xf2c230,0xe8e8e8][Math.floor(rnd()*5)]);
  box(cx0,cx1,cy0,cy1,72,78,0x2e74c9,GL);   // (its lit top: COLD DRINKS)
  // ---- the papers: the stepped rack before the counter's panel, four titles, each stack as high as its stock
  const TITLES=[['THE DAILY ODDITY',0xc8322a,1],['METRO HERALD',0x2e5aa8,1],['THE FLEA TIMES',0x202428,2],['MORNING BUGLE',0xe8a020,1]];
  box(x0+.25,x1-.25,y1,y1+.5,0,6,DARK); box(x0+.25,x1-.25,y1+.02,y1+.32,6,18,STEEL);   // (the rack's two steps)
  const geo=new THREE.BoxGeometry(1,1,1), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), V=THREE.Vector3, col=new THREE.Color();
  const inst=(L,mat)=>{ const M=new THREE.InstancedMesh(geo,mat,Math.max(1,L.length)); L.forEach(([x,y,z,sx,sy,sz,c],i)=>{ M.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(sx,sy,sz))); M.setColorAt(i,col.setHex(c)); }); M.count=L.length; return M; };
  const lam=new THREE.MeshLambertMaterial({color:0xffffff}), body=inst(BX,lam), glow=inst(GL,new THREE.MeshBasicMaterial({color:0xffffff}));
  body.castShadow=body.receiveShadow=true; scene.add(body,glow);
  const PAPER=0xe6e2d6, STK=new THREE.InstancedMesh(geo,lam,8); STK.castShadow=true; scene.add(STK);
  const stock={papers:[40,40,30,25],mags:24,sweets:60,drinks:24};
  const stacks=()=>{ TITLES.forEach(([n,c],i)=>{ const w=(x1-x0-.6)/4, a=x0+.3+i*w, top=i%2?18:6, h=Math.max(.3,Math.min(14,stock.papers[i]*.25)), b=i%2?y1+.04:y1+.34, d=i%2?.26:.14;
    STK.setMatrixAt(i*2,m4.compose(new V(X(a+w/2),Y(top+h/2),Z(b+d/2)),q,new V(Math.abs(X(a+w-.06)-X(a)),Y(h)-Y(0),Math.abs(Z(b+d)-Z(b))))); STK.setColorAt(i*2,col.setHex(stock.papers[i]?PAPER:DARK));
    STK.setMatrixAt(i*2+1,m4.compose(new V(X(a+w/2),Y(top+h+.3),Z(b+d*.75)),q,new V(Math.abs(X(a+w-.12)-X(a)),Y(.6)-Y(0),Math.abs(Z(b+d*.5)-Z(b))))); STK.setColorAt(i*2+1,col.setHex(stock.papers[i]?c:DARK)); });
    STK.instanceMatrix.needsUpdate=true; STK.instanceColor.needsUpdate=true; };
  stacks();
  // ---- the shutter: eight slats rolled up into the housing or let down to the counter
  const SH=new THREE.InstancedMesh(geo,lam,8); scene.add(SH); let shut=1;   // (shut: 1 down, 0 up)
  const shutter=o=>{ shut=o; for(let i=0;i<8;i++){ const h=6*o, zt=96-i*h; SH.setMatrixAt(i,m4.compose(new V(X(xm),Y(zt-h/2),Z(y1-.04)),q,new V(Math.abs(X(x1-.2)-X(x0+.2)),Math.max(.002,Y(h)-Y(0)),Math.abs(Z(y1-.02)-Z(y1-.06))))); SH.setColorAt(i,col.setHex(i&1?0x8a9096:0x9ea4aa)); }
    SH.instanceMatrix.needsUpdate=true; SH.instanceColor.needsUpdate=true; SH.visible=o>.02; };
  // ---- the bundles: up to four by the stand's west side, each a stack tied with twine
  const BU=new THREE.InstancedMesh(geo,lam,12); BU.castShadow=true; scene.add(BU); const bundles=[];
  const bspot=k=>[x0-.55,y1-.4-(k>>1)*.5+.1,(k&1)*11];
  const drawB=()=>{ let n=0; for(const b of bundles){ const [bx,by,bz]=b.at, w=.5, d=.36;
      const put=(a,b2,c,d2,z0,z1,cc)=>{ BU.setMatrixAt(n,m4.compose(new V((X(a)+X(b2))/2,(Y(z0)+Y(z1))/2,(Z(c)+Z(d2))/2),q,new V(Math.abs(X(b2)-X(a)),Y(z1)-Y(z0),Math.abs(Z(d2)-Z(c))))); BU.setColorAt(n,col.setHex(cc)); n++; };
      put(bx-w/2,bx+w/2,by-d/2,by+d/2,bz,bz+10,PAPER); put(bx-.03,bx+.03,by-d/2-.01,by+d/2+.01,bz,bz+10.4,0x9a7040); put(bx-w/2-.01,bx+w/2+.01,by-.03,by+.03,bz,bz+10.4,0x9a7040); }
    BU.count=n; if(n){ BU.instanceMatrix.needsUpdate=true; BU.instanceColor.needsUpdate=true; } };
  // where you can't walk: the stand and its cooler
  const sol=(a,b,c,d,h)=>{ const r=[Math.min(X(a),X(b)),Math.min(Z(c),Z(d)),Math.max(X(a),X(b)),Math.max(Z(c),Z(d))]; SOL.up.push(r); FIX.up.push([r[0],r[1],0,r[2],r[3],Y(h)]); };
  sol(x0-.12,x1+.12,y0,y1+.5,116); sol(cx0,cx1,cy0,cy1,78);
  // ---- the delivery drones: two little quads, a line under each with two bundles
  const DR=[0,1].map(i=>{ const g=new THREE.Group(), m=c=>new THREE.MeshLambertMaterial({color:c}); const bx=(w,h,d,mm)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mm);
    g.add(bx(.36,.1,.36,m(0x30343a))); for(const [a,b] of [[1,1],[1,-1],[-1,1],[-1,-1]]){ const arm=bx(.3,.03,.04,m(0x50565e)); arm.position.set(a*.15,.02,b*.15); arm.rotation.y=Math.atan2(b,a); g.add(arm); const r=bx(.26,.01,.03,m(0x9aa0a8)); r.position.set(a*.24,.07,b*.24); r.userData.rot=1; g.add(r); }
    const line=bx(.01,.5,.01,m(0x9a7040)); line.position.y=-.3; g.add(line); const load=bx(.5*T*.9,Y(10)-Y(0),.36*T*.9,m(PAPER)); load.position.y=-.6; g.add(load); g.userData.load=load;
    const dot=bx(.05,.04,.05,new THREE.MeshBasicMaterial({color:0xff4040})); dot.position.set(0,-.06,.18); g.add(dot); g.visible=false; scene.add(g); return {g,legs:[],carry:0,spin:0}; });
  const fly=(d,k)=>{ const s=[bspot(k*2),bspot(k*2+1)], home=new V(X(x1+60),Y(420),Z(y1+2+k*2)); d.g.position.copy(home); d.g.visible=true; d.carry=2; d.legs=[];
    for(let j=0;j<2;j++){ const [bx,by,bz]=s[j], over=new V(X(bx),Y(260),Z(by)), down=new V(X(bx),Y(bz+10)+.75,Z(by)); d.legs.push([over,6],[down,2],['drop',[bx,by,bz]],['wait',.6],[over,2.5]); }
    d.legs.push([home,6],['gone']); };
  const FK=+(QS.get("newsk")||1), flyTick=dt=>{ dt*=FK; for(const d of DR){ if(!d.g.visible)continue; const L=d.legs[0]; if(!L){ d.g.visible=false; continue; }
    if(L[0]==='gone'){ d.g.visible=false; d.legs=[]; continue; }
    if(L[0]==='drop'){ bundles.push({at:L[1],t:CLOCK.h}); drawB(); d.carry--; d.g.userData.load.visible=d.carry>0; d.legs.shift(); continue; }
    if(L[0]==='wait'){ if((L[1]-=dt)<=0)d.legs.shift(); }
    else { const v=new V().subVectors(L[0],d.g.position), l=v.length(), s=L[1]*dt; if(l<=s){ d.g.position.copy(L[0]); d.legs.shift(); } else d.g.position.addScaledVector(v,s/l); d.g.rotation.x=v.y>-.1&&Math.hypot(v.x,v.z)>.1?.15:0; d.g.rotation.y=Math.atan2(v.x,v.z); }
    d.spin+=dt*40; for(const c of d.g.children)if(c.userData.rot)c.rotation.y=d.spin; } };
  // ---- what he does: his acts, each a name and how long; the stand's day decides which
  const ACT={serve:1.6,change:2,wave:2,stack:2.6,cut:1.8,arrange:3,stretch:3,open:2.6,close:2.6,doze:1e9,yawn:2.2};
  let act=null, queue=[], idleT=12, waved=false, napT=0;
  const doAct=(n,then)=>queue.push({n,d:ACT[n],t:0,then});
  const cat=N.rig; N.home={x:X(xm),z:Z(y1-.82)};
  N.st.hold=true; N.st.to=null; N.st.x=X(xm); N.st.z=Z(y1-.82); N.key==='raincat'&&(N.life=null);
  const hold=st=>{ st.to=null; st.hold=true; st.x=X(xm); st.z=Z(y1-.82); st.face={x:X(xm),z:Z(y1+4)}; }, tk=N.tick; N.tick=(dt,you)=>{ hold(N.st); tk(dt,you); hold(N.st); };   // (held behind his counter, facing the street, his own tick wrapped)
  cat.extra=(c,dt,r)=>{ const B=c.B; B.root.position.y+=.36;   // (on his crate)
    if(!act){ act=queue.shift()||null; if(act&&act.n==='doze')act.d=ACT.doze; }
    c.busy=!!act&&act.n!=='doze'; if(!act)return;
    const t=act.t+=dt, u=Math.min(1,t/act.d), e=Math.sin(Math.PI*u), n=act.n;
    if(n==='serve'){ B.armR.rotation.x=-1.55*e; B.armL.rotation.x=-.5*e; B.hips.rotation.x=.14*e; B.head.rotation.x=.12*e; }
    if(n==='change'){ B.armL.rotation.x=-1.1*e; B.armR.rotation.x=-1.15*e; B.armL.rotation.z=(.25+Math.sin(t*15)*.07)*e; B.armR.rotation.z=(-.25+Math.sin(t*15+1.5)*.07)*e; B.head.rotation.x=.4*e; }
    if(n==='wave'){ const k=Math.min(1,e*3); B.armR.rotation.z=2.5*k; B.armR.rotation.x=Math.sin(t*12)*.35*k; B.head.rotation.z=-.15*k; }
    if(n==='stack'){ B.hips.rotation.x=.6*e; B.armL.rotation.x=-.9*e; B.armR.rotation.x=-.9*e; B.armL.rotation.z=.3*e; B.armR.rotation.z=-.3*e; B.head.rotation.x=.25*e; B.root.position.y-=.06*e; }
    if(n==='cut'){ B.hips.rotation.x=.35*e; B.armL.rotation.x=-1.2*e; B.armR.rotation.x=-1.25*e; B.armR.rotation.y=Math.sin(t*16)*.35*e; B.head.rotation.x=.4*e; }
    if(n==='arrange'){ const s=Math.sin(u*Math.PI*2); B.hips.rotation.y=.75*s*e; B.armR.rotation.x=-2*Math.max(0,s)*e; B.armL.rotation.x=-2*Math.max(0,-s)*e; B.head.rotation.y=.5*s*e; }
    if(n==='stretch'||n==='yawn'){ B.armL.rotation.x=-2.9*e; B.armR.rotation.x=-2.9*e; B.armL.rotation.z=-.35*e; B.armR.rotation.z=.35*e; B.head.rotation.x=-.35*e; B.hips.rotation.x=-.08*e; }
    if(n==='open'||n==='close'){ const k=Math.min(1,e*2.5), pull=n==='open'?u:1-u; B.armL.rotation.x=-(2.9-1.2*pull)*k; B.armR.rotation.x=-(2.9-1.2*pull)*k; B.head.rotation.x=-.25*k; shutter(n==='open'?1-u:u); }
    if(n==='doze'){ const k=Math.min(1,t*.8); B.head.rotation.x=(.5+Math.sin(t*1.3)*.05)*k; B.hips.rotation.x=.06*k; B.armL.rotation.x=-.3*k; B.armR.rotation.x=-.3*k; B.root.position.y-=.03*k; }
    if(u>=1){ const f=act.then; act=null; if(f)f(); } };
  const wake=()=>{ if(act&&act.n==='doze')act=null; };
  // ---- the stand's day: open at 5:45, the bundles at 5:30 and his work on them, the lull, closing at 22:00
  const isOpen=h=>h>=5.75&&h<22;
  shutter(isOpen(CLOCK.h)?0:1); if(!isOpen(CLOCK.h))doAct('doze');
  let lastH=CLOCK.h, day=-1;
  const passed=(a,h)=>lastH<=h?(a>lastH&&a<=h):(a>lastH||a<=h);
  const work=()=>{ // each bundle by the stand: up onto the counter, its twine cut, its title's stack grown
    const b=bundles[0]; if(!b||!isOpen(CLOCK.h))return; doAct('stack',()=>{ doAct('cut',()=>{ bundles.shift(); drawB(); const i=TITLES.reduce((m,_,k)=>stock.papers[k]<stock.papers[m]?k:m,0); stock.papers[i]+=25; stock.sweets=Math.min(80,stock.sweets+15); stock.drinks=Math.min(32,stock.drinks+8); stock.mags=Math.min(36,stock.mags+4); stacks(); work(); }); }); };
  const t0=CLOCK.tick; CLOCK.tick=dt=>{ t0(dt); const h=CLOCK.h;
    if(passed(5.5,h)){ DR.forEach((d,k)=>fly(d,k)); stock.papers=stock.papers.map(v=>Math.floor(v*.2)); stacks(); }   // (yesterday's papers mostly gone back: the morning's fresh)
    if(passed(5.75,h)){ wake(); queue=[]; doAct('yawn'); doAct('open'); }
    if(passed(22,h)){ wake(); queue=[]; doAct('close',()=>doAct('doze')); }
    lastH=h; flyTick(dt);
    if(isOpen(h)&&!act&&!queue.length){
      if(bundles.length&&shut<.1){ work(); }
      else { const d=Math.hypot(pos.x-X(xm),pos.z-Z(y1+1)); if(d<3.2*T&&!waved&&LVL!=='down'){ waved=true; doAct('wave'); } else if(d>5*T)waved=false;
        if((idleT-=dt)<=0){ idleT=14+Math.random()*22; const lull=h>13&&h<15.5&&Math.random()<.5; if(lull){ napT=20+Math.random()*30; doAct('doze'); } else doAct(Math.random()<.6?'arrange':'stretch'); } } }
    if(act&&act.n==='doze'&&isOpen(h)&&napT>0&&(napT-=dt)<=0)act=null; };
  // ---- a double click on the stand: its stock and prices, your money, BUY; a paper bought shows its front page
  const purse=DRONE.purse||{get:()=>0,add:()=>{}};
  const ITEMS=[...TITLES.map(([n,,p],i)=>({n,p,k:'papers',i})),{n:'STRANGE WEEKLY',p:4,k:'mags'},{n:'CRYPTID QUARTERLY',p:6,k:'mags'},{n:'CITY GARDENER',p:4,k:'mags'},{n:'PUZZLE BOOK',p:3,k:'mags'},
    {n:'GUM',p:1,k:'sweets'},{n:'MINTS',p:1,k:'sweets'},{n:'CHOCOLATE BAR',p:1,k:'sweets'},{n:'LICORICE',p:1,k:'sweets'},{n:'SODA',p:2,k:'drinks'},{n:'WATER',p:1,k:'drinks'},{n:'ICED TEA',p:2,k:'drinks'}];
  const left=it=>it.k==='papers'?stock.papers[it.i]:stock[it.k];
  const HEAD=[['FIREBALL SCORCHES PARK BENCH','dragons blamed; the city shrugs'],['BODEGA FOX DENIES PRICE HIKE','"a dollar is a dollar," he says'],['SKELETON GUARDS SEE OFF TROUBLEMAKERS','three hooded figures flee down the subway stairs'],
    ['MUSHROOM STALL A HIT AT THE PARK GATE','the seller is said to be "very calm"'],['METRO RUNS ON TIME, MOSTLY','riders surprised'],['CASTLE FOUND TO BE HALF SIZE','built for the woodland folk, the mayor explains'],['TOYS SEEN WALKING THE STREETS AT NIGHT','"they wave," says a witness']];
  const front=i=>{ const d=(window.CITY&&CITY.day)||0, w=null, a=HEAD[(d*3+i)%HEAD.length], b=HEAD[(d*3+i+2)%HEAD.length];
    return `<div class="np"><div class="nh" style="border-color:#${TITLES[i][1].toString(16).padStart(6,'0')}">${TITLES[i][0]}</div><div class="nd">DAY ${d+1} · 25¢ MORE THAN YESTERDAY${w?' · '+String(w).toUpperCase():''}</div><b>${a[0]}</b><p>${a[1]}</p><b class="s">${b[0]}</b><p>${b[1]}</p></div>`; };
  const css=document.createElement('style'); css.textContent='#nsp{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(420px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow:auto;font:12px var(--pixel,monospace);color:#e8e2c8;background:#18241c;border:2px solid #4c7a58;padding:14px 16px 12px;z-index:16;user-select:none}#nsp h3{margin:0 0 6px;font-size:13px}#nsp .row{display:flex;gap:8px;align-items:center;margin:3px 0}#nsp .it{flex:1}#nsp .sec{margin:8px 0 2px;color:#9cc8a4}#nsp .st{margin-top:8px;color:#f0d890;min-height:1em}#nsp .np{background:#eee8d8;color:#222;padding:8px 10px;margin-top:8px}#nsp .nh{font-size:15px;border-bottom:3px solid;margin-bottom:4px}#nsp .nd{font-size:10px;margin-bottom:6px}#nsp .np p{margin:2px 0 6px}#nsp .s{font-size:11px}';
  document.head.appendChild(css); const P=document.createElement('div'); P.id='nsp'; P.hidden=true; P.setAttribute('role','dialog'); P.setAttribute('aria-label','Newsstand'); document.body.appendChild(P);
  const draw=(msg='',page='')=>{ const open=isOpen(CLOCK.h), sec={papers:'NEWSPAPERS',mags:'MAGAZINES',sweets:'CANDY AND GUM',drinks:'COLD DRINKS'}; let last='';
    P.innerHTML=`<h3>THE NEWSSTAND · THE CAT IN THE RAINCOAT</h3><div>${open?'OPEN 5:45 TO 10 PM':'CLOSED. OPENS AT 5:45 AM'} · YOU HAVE $${purse.get()}</div>`+ITEMS.map((it,i)=>{ const s=sec[it.k]!==last?`<div class="sec">${sec[it.k]}</div>`:''; last=sec[it.k]; const l=left(it);
      return s+`<div class="row"><span class="it">${it.n}</span><span>${l} LEFT</span><span>$${it.p}</span><button class="btn" data-i="${i}" ${open&&l>0?'':'disabled'}>BUY</button></div>`; }).join('')+`<div class="st">${msg}</div>${page}<div class="row" style="margin-top:8px"><button class="btn" id="nsx">CLOSE</button></div>`;
    P.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{ const it=ITEMS[+b.dataset.i]; if(purse.get()<it.p){ draw('NOT ENOUGH MONEY.'); return; } if(left(it)<=0){ draw('SOLD OUT.'); return; }
      purse.add(-it.p); if(it.k==='papers'){ stock.papers[it.i]--; stacks(); } else stock[it.k]--; if(window.CIVIC&&CIVIC.note)CIVIC.note('you bought '+it.n.toLowerCase()+' at the newsstand ($'+it.p+')','newsstand');
      wake(); queue=[]; act=null; doAct('serve',()=>doAct('change')); if(typeof LINES!=='undefined'&&LINES.say)try{ LINES.say(N,'thanks'); }catch(e){}
      draw('THANK YOU. ENJOY YOUR '+it.n+'.',it.k==='papers'?front(it.i):''); });
    P.querySelector('#nsx').onclick=()=>{ P.hidden=true; }; };
  NEWS.open=()=>{ draw(); P.hidden=false; if(isOpen(CLOCK.h)&&!act){ doAct('wave'); } };
  const hb=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(X(x1)-X(x0)),Y(116)-Y(0),Math.abs(Z(y1)-Z(y0))),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(xm),(Y(116)+Y(0))/2,(Z(y0)+Z(y1))/2); scene.add(hb);
  UI.thing({name:'NEWSSTAND',obj:hb,reach:1.6*T,near:3*T,tall:2.4*T,act:NEWS.open});
  NEWS.stock=stock; NEWS.bundles=bundles; NEWS.deliver=()=>DR.forEach((d,k)=>fly(d,k));
  window.NEWSCLK=(h,s)=>{ if(h!=null)CLOCK.h=h; if(s!=null){ CLOCK.run=true; CLOCK.speed=s; } return CLOCK.h; }; window.NEWSDBG=()=>({h:+CLOCK.h.toFixed(2),act:act&&act.n,queue:queue.map(a=>a.n),shut:+shut.toFixed(2),bundles:bundles.length,stock:JSON.parse(JSON.stringify(stock)),drones:DR.map(d=>d.g.visible?d.g.position.toArray().map(v=>+v.toFixed(1)):null),at:[+X(xm).toFixed(2),+Z(y1+2).toFixed(2)]}); };
