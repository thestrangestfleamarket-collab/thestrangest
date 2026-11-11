// THE AQUARIUM: the Hudson row's shop of every fish and sea animal in the game, all swimming together in one long tank across the back wall, small; a price tag under it sells each kind, which lives in your apartment's fish tank (PETS.sea, kept with your account).
import {SHARED, THREE} from './003-shx.js';
import {INV, PETS, pos, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
import {MSHOP} from './059i-mshops.js';
import {PFROW} from './068a-pfrow.js';
import {FISHES} from './141f-fishes.js';
const AQUA={tanks:[]}; window.AQUA=AQUA;
{ const WU=TILE/.84, m=1/.84, zm=28.6, ID='aquarium';
  // every kind: [fish model, NAME, price]; their tags left to right: fresh water, the sea, the reef
  const FRESH=[['koi','KOI',25],['goldfish','GOLDFISH',10],['dace','DACE',10],['sockeye','SOCKEYE SALMON',30],['x_catfish','CHANNEL CATFISH',25],['x_carp','CARP',20],['x_trout','RAINBOW TROUT',25],['x_pike','NORTHERN PIKE',35],
      ['x_lbass','LARGEMOUTH BASS',25],['x_bluegill','BLUEGILL',10],['x_sunfish','SUNFISH',10],['x_yperch','YELLOW PERCH',15],['x_perch','WHITE PERCH',15],['x_eel','AMERICAN EEL',30],['x_sturgeon','ATLANTIC STURGEON',60],['x_shad','AMERICAN SHAD',15]],
    SEA=[['shark','SHARK',150],['dolphin','DOLPHIN',150],['plesiosaur','PLESIOSAUR',200],['seaturtle','SEA TURTLE',90],['octopus','OCTOPUS',80],['stingray','STINGRAY',70],['jellyfish','JELLYFISH',40],['moray','MORAY EEL',60],
      ['barracuda','BARRACUDA',60],['coelacanth','COELACANTH',120],['trevally','TREVALLY',30],['seabream','SEA BREAM',25],['x_bass','STRIPED BASS',30],['x_bluefish','BLUEFISH',25],['x_flounder','SUMMER FLOUNDER',25],['x_tomcod','ATLANTIC TOMCOD',15],
      ['x_crab','BLUE CRAB',20],['shrimp','SHRIMP',10],['goatfish','GOATFISH',20],['knifejaw','KNIFEJAW',25]],
    REEF=[['clownfish','CLOWNFISH',20],['bluetang','BLUE TANG',25],['yellowtang','YELLOW TANG',25],['angelfish','ANGELFISH',25],['butterflyfish','BUTTERFLYFISH',20],['cardinalfish','CARDINALFISH',15],['chromis','CHROMIS',10],['cleanerwrasse','CLEANER WRASSE',15],
      ['wrasse','WRASSE',15],['firefish','FIREFISH',20],['foxface','FOXFACE',25],['lionfish','LIONFISH',40],['mandarinfish','MANDARINFISH',35],['moorishidol','MOORISH IDOL',30],['puffer','PUFFERFISH',30],['stripedpuffer','STRIPED PUFFER',30]];
  const ALL=[...FRESH,...SEA,...REEF], BY=Object.fromEntries(ALL.map(a=>[a[0],a])); AQUA.kinds=ALL;
  // yours: every sea pet you have, each in your apartment's tank (OWNED 'tank')
  const recs=()=>{ try{ const j=JSON.parse(OWNED.get('tank')||'[]'); return Array.isArray(j)?j.filter(r=>r&&BY[r.k]):[]; }catch(e){ return []; } };
  let LIST=recs(); const keep=()=>{ try{ OWNED.set('tank',JSON.stringify(LIST)); }catch(e){} };
  PETS.sea=()=>LIST; PETS.seaName=k=>BY[k]&&BY[k][1];
  const buy=k=>{ const a=BY[k]; if(!a)return false; if(INV.cash<a[2]){ SAY('THE '+a[1]+' IS $'+a[2]+'. YOU HAVE $'+Math.round(INV.cash)+'.','#c8a090'); return false; }
    INV.cash-=a[2]; if(INV.save)INV.save(); LIST.push({id:LIST.reduce((n,r)=>Math.max(n,r.id||0),0)+1,k,born:Date.now()}); keep();
    SAY('THE '+a[1]+' IS YOURS: $'+a[2]+'. IT SWIMS IN YOUR APARTMENT\'S FISH TANK NOW (ESC, PETS).','#9fe07f'); if(PETS.menuDraw)PETS.menuDraw(); return true; };
  AQUA.buy=buy;
  PETS.seaMenu=()=>{ if(!LIST.length)return ''; return '<h3 style="margin-top:16px">IN YOUR FISH TANK</h3>'+LIST.map(r=>`<div class="row" style="justify-content:space-between"><span>${BY[r.k][1]} <span class="dim">· SINCE ${new Date(r.born).toLocaleDateString()}</span></span><button class="btn" data-sea="${r.id}">LET IT GO</button></div>`).join('')
    +'<div class="dim">SEA PETS LIVE IN YOUR APARTMENT\'S FISH TANK; FISH FOOD FEEDS THEM ALL (THE AQUARIUM ON THE HUDSON).</div>'; };
  PETS.seaAct=(id,b)=>{ const r=LIST.find(x=>x.id===+id); if(!r)return; if(!b.dataset.sure){ b.dataset.sure='1'; b.textContent='SURE? CLICK AGAIN'; return; }
    LIST.splice(LIST.indexOf(r),1); keep(); SAY('THE '+BY[r.k][1]+' GOES BACK TO THE AQUARIUM.','#c8d8e0'); if(PETS.menuDraw)PETS.menuDraw(); };
  /* ---------- the tanks: built once the Hudson row stands, on the shop's floor (in the shop's frame: u across, v from the back, z up in z-pixels) ---------- */
  let G=null, armed=null, BOXW=null; const FISH=[];
  const LOW=new Set(['x_crab','x_flounder','stingray','octopus','shrimp','x_catfish','x_sturgeon','goatfish','moray','x_eel']), BUB={};
  const LOOP=30, NS=240;
  const path=f=>{ const B=BOXW, R=Math.random, cl=v=>Math.max(0,Math.min(1,v)), ca=R(), cb=R(), wa=f.b==='swim'?1:.12, n=f.b==='swim'?5+Math.floor(R()*3):4, pts=[];
    for(let i=0;i<n;i++){ const a=f.b==='swim'?(i/n+R()*.15)%1:cl(ca+(R()-.5)*wa), b=f.b==='swim'?R():cl(cb+(R()-.5)*.4), h=f.b==='low'?R()*.06:f.b==='drift'?.3+R()*.6:.1+R()*.85;
      pts.push(B.o.clone().addScaledVector(B.a,a).addScaledVector(B.b,b).addScaledVector(B.c,h)); }
    if(f.b==='swim')pts.sort((p,q)=>Math.atan2(p.z-B.o.z-B.b.z/2,p.x-B.o.x-B.a.x/2)-Math.atan2(q.z-B.o.z-B.b.z/2,q.x-B.o.x-B.a.x/2));
    const C=new THREE.CatmullRomCurve3(pts,true,'centripetal'), P=new Float32Array((NS+1)*3), w=1+Math.floor(R()*3), A=f.b==='low'?.95:f.b==='drift'?.8:.55;   // speed eases (A: how near a rest)
    for(let i=0;i<=NS;i++){ const u=i/NS, q=C.getPointAt((((u+A*Math.sin(u*6.283*w)/(6.283*w))%1)+1)%1); P.set([q.x,q.y,q.z],i*3); } return P; };
  const Mx=new THREE.Matrix4(), Qf=new THREE.Quaternion(), Ef=new THREE.Euler(), Sf=new THREE.Vector3(), Vs=new THREE.Vector3(), Bub=[]; let T=0;
  const build=()=>{ const at=MSHOP.at[ID], F=PFROW.fronts.find(f=>f.id===ID); if(!at||!at.L||!F||!F.obj||!FISHES.load)return false; const {X,Y,Z}=SHARED.BOD, L=at.L, pt=at.pt, W=(u,v,z)=>{ const q=pt(u,v); return new THREE.Vector3(X(q[0]),Y(z),Z(q[1])); };
    G=new THREE.Group(); G.name='aquarium'; F.obj.add(G);
    const OP={p:[],c:[]}, WA={p:[],c:[]}, GL={p:[],c:[]}, col=new THREE.Color();
    const box=(T,u0,u1,v0,v1,z0,z1,c)=>{ col.set(c); const k=[[u0,v0,z0],[u1,v0,z0],[u1,v1,z0],[u0,v1,z0],[u0,v0,z1],[u1,v0,z1],[u1,v1,z1],[u0,v1,z1]].map(q=>W(...q));
      for(const f of [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7],[3,2,1,0]])for(const i of [f[0],f[1],f[2],f[0],f[2],f[3]]){ T.p.push(k[i].x,k[i].y,k[i].z); T.c.push(col.r,col.g,col.b); } };
    const mesh=(T,mat)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(T.p,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(T.c,3)); g.computeVertexNormals(); const me=new THREE.Mesh(g,mat); G.add(me); return me; };
    const th=.3*m, W0=L.x0+th, W1=L.x1-th, V0=L.y0+th, TD=.85*m, Z0=.7*zm, ZT=2.3*zm, WOOD=0x3a2a1e, SAND=0xd8c8a0;
    // one long tank across the back wall, every kind swimming in it together (owner, 11 Nov 2026)
    box(OP,W0,W1,V0,V0+TD,0,Z0-.05*zm,WOOD); box(OP,W0,W1,V0,V0+TD,Z0-.05*zm,Z0,0x202224); box(OP,W0+.03*m,W1-.03*m,V0+.03*m,V0+TD-.03*m,Z0,Z0+.08*zm,SAND);
    box(OP,W0,W1,V0,V0+.04*m,Z0,ZT,0x3a88b0); box(OP,W0,W1,V0,V0+TD,ZT,ZT+.08*zm,0x202224);
    box(WA,W0+.03*m,W1-.03*m,V0+.04*m,V0+TD-.03*m,Z0+.08*zm,ZT-.1*zm,0x8ad0e8); box(GL,W0+.05*m,W1-.05*m,V0+.05*m,V0+TD-.05*m,ZT-.1*zm,ZT-.09*zm,0xe8f8ff);
    for(const u of [W0,W1-.06*m])box(OP,u,u+.06*m,V0+TD-.06*m,V0+TD,Z0,ZT,0x202224);
    at.sb(W0,V0,W1,V0+TD,ZT+.08*zm);
    // the price tags on the stand's front, one a kind: double-click one to buy that kind
    const N=ALL.length, cols=Math.ceil(N/2), tw=(W1-W0)/cols, tv=V0+TD+.01*m, tz=[.36*zm,.06*zm], th2=.28*zm, cw=96, chh=96, cv=document.createElement('canvas'); cv.width=cw*cols; cv.height=chh*2;
    { const g=cv.getContext('2d'); g.fillStyle='#16202a'; g.fillRect(0,0,cv.width,cv.height); g.textAlign='center'; ALL.forEach(([k,nm,pr],i)=>{ const x=(i%cols)*cw, y=Math.floor(i/cols)*chh; g.fillStyle='#e8e0c8'; g.fillRect(x+3,y+3,cw-6,chh-6); g.fillStyle='#1a2a3a';
      const w=nm.split(' '), ln=w.length>1?[w.slice(0,Math.ceil(w.length/2)).join(' '),w.slice(Math.ceil(w.length/2)).join(' ')]:[nm]; let f=15; g.font=`bold ${f}px monospace`; while(f>8&&Math.max(...ln.map(l=>g.measureText(l).width))>cw-12){ f--; g.font=`bold ${f}px monospace`; }
      ln.forEach((l,j)=>g.fillText(l,x+cw/2,y+30+j*(f+3))); g.fillStyle='#a0402a'; g.font='bold 18px monospace'; g.fillText('$'+pr,x+cw/2,y+chh-14); }); }
    { const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; tx.anisotropy=4; const q=[W(W0,tv,tz[1]),W(W1,tv,tz[1]),W(W1,tv,tz[0]+th2),W(W0,tv,tz[0]+th2)], pg=new THREE.BufferGeometry();
      pg.setAttribute('position',new THREE.Float32BufferAttribute(q.flatMap(v=>[v.x,v.y,v.z]),3)); pg.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,1,0,1],2)); pg.setIndex([0,1,2,0,2,3]);
      G.add(new THREE.Mesh(pg,new THREE.MeshBasicMaterial({map:tx,side:THREE.DoubleSide}))); }
    const along=W(W0,V0,0).sub(W(W1,V0,0)).normalize(), yaw=Math.atan2(along.x,along.z)+Math.PI/2;
    ALL.forEach(([k,nm,pr],i)=>{ const c=W(W0+(i%cols+.5)*tw,tv,tz[Math.floor(i/cols)]+th2/2), hb=new THREE.Mesh(new THREE.BoxGeometry(tw*TILE*.9,th2/zm*WU,.1*WU),new THREE.MeshBasicMaterial({visible:false}));
      hb.position.copy(c); hb.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),yaw); G.add(hb);
      UI.thing({name:'A '+nm+' ($'+pr+')',obj:hb,reach:1.8*TILE,near:3*TILE,tall:th2/zm*WU,act:()=>{ if(armed&&armed.k===k&&Date.now()-armed.t<8000){ armed=null; buy(k); return; } armed={k,t:Date.now()};
        SAY('THE '+nm+' FOR YOUR APARTMENT\'S FISH TANK: $'+pr+'. DOUBLE-CLICK ITS TAG AGAIN TO BUY IT.','#c8e8f0'); }}); AQUA.tanks.push({k,c}); });
    // inside: rockwork with caves, coral of every kind on the reef end, kelp and grass on the fresh end, a log, a wreck's chest and pot, shells, a bubbler
    { const DE={p:[],c:[]}, S0=W(W0,V0,0), Sa=W(W1,V0,0).sub(S0), Sb=W(W0,V0+TD,0).sub(S0), sy=Y(Z0+.08*zm), M4=new THREE.Matrix4(), Qd=new THREE.Quaternion(), Eu=new THREE.Euler(), V=new THREE.Vector3(), Sc=new THREE.Vector3();
      let sd=7; const R=()=>(sd=(sd*16807)%2147483647)/2147483647;
      const at3=(a,b,h)=>S0.clone().addScaledVector(Sa,a).addScaledVector(Sb,b).setY(sy+h*WU);
      const put=(q,c,a,b,h,rx=0,ry=0,rz=0,sx=1,sy2=1,sz=1)=>{ const g=q.index?q.toNonIndexed():q, P=g.attributes.position, p=at3(a,b,h); M4.compose(p,Qd.setFromEuler(Eu.set(rx,ry,rz)),Sc.set(sx*WU,sy2*WU,sz*WU)); col.set(c);
        for(let i=0;i<P.count;i++){ V.fromBufferAttribute(P,i).applyMatrix4(M4); DE.p.push(V.x,V.y,V.z); DE.c.push(col.r,col.g,col.b); } };
      const rock=(a,b,r,h=0,c=0x6a6660)=>put(new THREE.DodecahedronGeometry(r,0),c,a,b,h+r*.5,R()*3,R()*3,R()*.6,1,.8+R()*.5,.9);
      // gravel all along the front, rockwork piles with a slab over each cave
      for(let i=0;i<160;i++)put(new THREE.IcosahedronGeometry(.012+R()*.02,0),[0x8a7e70,0xa89880,0x5e5a58,0xc0ae90][i%4],R(),.45+R()*.53,0,R()*3,R()*3);
      for(const a of [.1,.38,.63,.9]){ const k=.04; rock(a-k,.25,.22,0,0x5e5a58); rock(a+k,.22,.2,0,0x726c64); rock(a,.15,.28,0,0x544f4c); rock(a-.01,.22,.16,.32,0x7a7268);
        put(new THREE.BoxGeometry(.5,.07,.3),0x66605a,a,.3,.27,0,R()*.4,.08); rock(a+.06,.42,.1); rock(a-.07,.45,.08); }
      // coral (the reef end): branches, brains, fans, tables, anemones
      const CO=[0xe86a8a,0xf09040,0xb070d0,0xf0d050,0x60c8b0,0xe04848,0xff9ab8];
      const branch=(a,b,h,c,n=6)=>{ for(let i=0;i<n;i++){ const L=.12+R()*.2, t=R()*6.28, lean=.2+R()*.5; put(new THREE.CylinderGeometry(.012,.022,L,5),c,a+Math.cos(t)*.01,b+Math.sin(t)*.04,h+L*.45,Math.sin(t)*lean,0,Math.cos(t)*lean); } };
      for(let i=0;i<14;i++){ const a=.55+R()*.43, b=.15+R()*.65, c=CO[i%CO.length], k=i%5;
        if(k===0||k===3)branch(a,b,0,c,5+Math.floor(R()*4));
        else if(k===1){ const r=.07+R()*.07; put(new THREE.IcosahedronGeometry(r,1),c,a,b,r*.5,0,R()*3,0,1.2,.7,1.1); }
        else if(k===2)put(new THREE.CircleGeometry(.16+R()*.08,7),c,a,b,.2,0,R()*3,0,1,1.3,1);
        else { put(new THREE.CylinderGeometry(.02,.03,.16,5),0x8a7a68,a,b,.08); put(new THREE.CylinderGeometry(.18,.16,.03,8),c,a,b,.17); } }
      for(const [a,b,h] of [[.6,.2,.62],[.85,.25,.6],[.38,.24,.6],[.12,.2,.62]])branch(a,b,h,CO[Math.floor(R()*CO.length)],4);   // coral on the rock tops
      for(let i=0;i<6;i++){ const a=.6+R()*.38, b=.55+R()*.3; for(let j=0;j<9;j++){ const t=j/9*6.28; put(new THREE.ConeGeometry(.01,.12,4),0xffb0c8,a+Math.cos(t)*.012,b+Math.sin(t)*.03,.06,Math.sin(t)*.5,0,Math.cos(t)*.5); } put(new THREE.CylinderGeometry(.035,.04,.05,7),0xd05070,a,b,.025); }
      // the fresh end: kelp and grass along the back, a sunken log, lily-pad-green clumps at the front
      for(let i=0;i<40;i++){ const a=R()*.5, b=R()<.7?.05+R()*.2:.5+R()*.4, L=(b<.3?.5+R()*.9:.15+R()*.25); put(new THREE.BoxGeometry(.025,L,.006),[0x3f8a3a,0x5aa84a,0x2f6e3a,0x7ab850][i%4],a,b,L/2,R()*.3-.15,R()*3,R()*.3-.15); }
      put(new THREE.CylinderGeometry(.07,.09,1.1,7),0x5a4030,.24,.6,.07,0,.3,Math.PI/2); for(let i=0;i<3;i++)put(new THREE.CylinderGeometry(.015,.025,.3,5),0x4a3426,.18+i*.1,.58,.18,0,0,.7-i*.5);
      // the wreck's chest, a pot on its side, shells and starfish
      put(new THREE.BoxGeometry(.24,.14,.16),0x6a4424,.47,.62,.07,0,.4); put(new THREE.BoxGeometry(.25,.04,.17),0xc8a040,.47,.62,.16,0,.4,-.25);
      put(new THREE.CylinderGeometry(.05,.09,.24,8),0xa0603a,.53,.72,.08,0,0,1.35); for(let i=0;i<10;i++){ const st=i%2; put(st?new THREE.ConeGeometry(.04,.012,5):new THREE.IcosahedronGeometry(.025,0),st?0xf08050:0xf0e0d0,.3+R()*.68,.6+R()*.35,.01,0,R()*3,0,1,st?1:.5,1); }
      put(new THREE.CylinderGeometry(.03,.03,.06,8),0x303438,.05,.1,.03); BUB.at=at3(.05,.1,.06); BUB.top=sy+(ZT-Z0-.3*zm)/zm*WU;
      mesh(DE,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));
      const bi=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.02*WU,1),new THREE.MeshLambertMaterial({color:0xeaf8ff,transparent:true,opacity:.6,depthWrite:false}),24); bi.frustumCulled=false; bi.renderOrder=3; G.add(bi); BUB.im=bi; }
    // the water's box the fish keep to: a corner and its three edges
    const m0=.15*m; BOXW={o:W(W0+m0,V0+m0,Z0+.2*zm),a:W(W1-m0,V0+m0,Z0+.2*zm),b:W(W0+m0,V0+TD-m0,Z0+.2*zm),c:W(W0+m0,V0+m0,ZT-.3*zm)}; for(const e of 'abc')BOXW[e].sub(BOXW.o);
    ALL.forEach(([k])=>FISH.push({k,b:LOW.has(k)?'low':k==='jellyfish'?'drift':'swim',ph:Math.random(),o:null}));
    const cu=(L.x0+L.x1)/2, cv0=L.y0+5.6*m;
    // the crabs' tank on a low table in the middle: they walk with you, so they are adopted like any pet (the adoption book on the crabs)
    { const tu=cu, tv=cv0, tw=1.8*m, td=.7*m, z0=.75*zm, z1=z0+.5*zm; box(OP,tu-tw/2,tu+tw/2,tv-td/2,tv+td/2,0,z0,WOOD); box(OP,tu-tw/2+.03*m,tu+tw/2-.03*m,tv-td/2+.03*m,tv+td/2-.03*m,z0,z0+.06*zm,SAND);
      box(GL,tu-tw/2,tu+tw/2,tv-td/2,tv+td/2,z1,z1+.01*zm,0xe8f8ff); at.sb(tu-tw/2,tv-td/2,tu+tw/2,tv+td/2,z1);
      if(PETS.show)PETS.idx().then(I=>{ const C=I.kinds.filter(k=>k.shop===ID); C.forEach((K,i)=>{ const c=W(tu-tw/2+(i+.5)*tw/C.length,tv,z0+.06*zm);
        PETS.show(K.key,{w:tw/m/C.length*.84,h:.45,d:td/m*.84},{shop:ID}).then(B=>{ if(!B||!G)return; B.fitH=.45; B.base=c.clone(); B.along=W(1,0,0).sub(W(0,0,0)).normalize(); B.slide=B.g; B.g.position.copy(c); B.g.rotation.y=i*1.3; G.add(B.g); if(PETS.liveAdd)PETS.liveAdd(B); }).catch(()=>{});
        const hb=new THREE.Mesh(new THREE.BoxGeometry(.5*WU,.4*WU,.5*WU),new THREE.MeshBasicMaterial({visible:false})); hb.position.copy(c); G.add(hb);
        UI.thing({name:'A '+K.name+' (ADOPT)',obj:hb,reach:1.8*TILE,near:3*TILE,tall:.4*WU,act:()=>{ PETS.shop(ID); PETS.idx().then(()=>setTimeout(()=>PETS.choose(K.key),0)); }}); }); }).catch(e=>console.warn('AQUA CRABS',e)); }
    mesh(OP,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})).receiveShadow=true;   // (two-sided: the lot's frame may be a mirror's)
    mesh(WA,new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.14,depthWrite:false,emissive:0x0a2430,side:THREE.DoubleSide})).renderOrder=2;
    mesh(GL,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide})).renderOrder=3;
    // the fish, once their models come: small, a goldfish's size up to a small shark's
    // the fish, once their models come: small, and each on its own 30-second loop through the tank, baked once (owner, 11 Nov 2026: "repeat the same loop every 30 seconds but they seem alive")
    FISHES.load().then(()=>{ const g0=FISHES.len('goldfish',1)||1; for(const f of FISH){ const L0=FISHES.len(f.k,1); if(!L0)continue; const o=FISHES.school(f.k,1); if(!o)continue;
      f.L=WU*Math.min(.32,Math.max(.07,.11*Math.sqrt(L0/g0))); f.P=path(f); o.count=1; G.add(o); f.o=o; } }).catch(()=>{});
    return true; };
  let tries=0; SYS.every(()=>{ if(G||tries>600)return; tries++; build(); },1000,'aquarium');
  // the fish swim only while you are near enough to see them: each to a spot in the tank, turning as it goes, resting now and then
  SYS.add('life',dt=>{ if(!G||!BOXW)return; const c=BOXW.o; const near=Math.hypot(pos.x-c.x,pos.z-c.z)<40*TILE; G.visible=near; if(!near||!dt)return;
    T+=dt; for(const f of FISH){ const o=f.o; if(!o)continue; const P=f.P, x=((T/LOOP+f.ph)%1)*NS, i=Math.floor(x), j=i+1, k=x-i, i3=i*3, j3=Math.min(NS,j)*3;
      Sf.set(P[i3]+(P[j3]-P[i3])*k,P[i3+1]+(P[j3+1]-P[i3+1])*k,P[i3+2]+(P[j3+2]-P[i3+2])*k); const dx=P[j3]-P[i3], dy=P[j3+1]-P[i3+1], dz=P[j3+2]-P[i3+2], ds=Math.hypot(dx,dz), ms=Math.hypot(dx,dy,dz)*NS/LOOP/WU;
      if(ds>1e-6)f.h=Math.atan2(-dz,dx); f.sw=(f.sw||0)+dt*(3+14*ms); Mx.compose(Sf,Qf.setFromEuler(Ef.set(0,f.h||0,f.b==='drift'?0:Math.max(-.35,Math.min(.35,Math.atan2(dy,ds))))),Vs.setScalar(f.L)); o.setMatrixAt(0,Mx); o.instanceMatrix.needsUpdate=true;
      o.userData.sw.setXYZ(0,f.sw,.6+Math.min(1.4,ms*2.5),o.userData.style); o.userData.sw.needsUpdate=true; }
    if(BUB.im){ if(Bub.length<24&&Math.random()<dt*10)Bub.push({y:BUB.at.y,ph:Math.random()*6,r:.5+Math.random()}); let n=0; for(let i=Bub.length-1;i>=0;i--){ const q=Bub[i]; q.y+=(.25+q.r*.1)*WU*dt; q.ph+=dt*8; if(q.y>BUB.top){ Bub.splice(i,1); continue; }
      Mx.compose(Sf.set(BUB.at.x+Math.sin(q.ph)*.01*WU,q.y,BUB.at.z),Qf.identity(),Vs.setScalar(q.r)); BUB.im.setMatrixAt(n++,Mx); } BUB.im.count=n; BUB.im.instanceMatrix.needsUpdate=true; } },'146zjb-aquarium');
}
