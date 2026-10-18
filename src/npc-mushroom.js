// ---- THE MUSHROOM SELLER (owner, 17 Oct 2026, his picture: a felted skeleton in a mottled rust robe, long tan hair, a hat crowned with
// mushrooms, a rope strap and a woven bag over his shoulder, a tray of mushrooms held out in his mitts; "add this is a 3d character in the game").
// Built here in code, no model, in his parts (npc-parts.js: skull, face, hair, hat, its mushrooms, robe, sleeves, hands, tray and its mushrooms,
// strap, bag; each reshapable), one mesh of some 3,800 triangles; his skull's sockets, nose and teeth pure black (makeNPC's "eye" part, lit by
// nothing); his robe mottled rust and olive by a value noise; the strap shades the robe, the caps their stems (makeNPC's ranks). Shaded as the
// fish and the bear (tones in bands, the clothes' shadows, SELF), lit by the lamps. He walks the whole street as the others do (owner, 17 Oct
// 2026: "put any new characters that go in the game into the street walking around"), rocking a little under his tray; he roams the whole
// map (ROAM, npc-map.js) and takes no notice of you ----
const MUSH={};   // (17 Oct 2026, the owner: "the gold skeleton character is not the mushroom character. the mushroom skeleton is white, and taller": his bones white, 2.2 m; the gold skeleton, npc-skel.js, is another)
{ const {shape,limb,sph,cyl,box,torus,blob,noise}=PARTSNPC.T;
  const CREAM=[.93,.87,.7], BONE=[.95,.95,.93], TAN=[.76,.6,.36], HAT=[.72,.47,.2], HAT2=[.66,.42,.17], CAP=[.74,.5,.22], RUST=[.74,.42,.14], OLIVE=[.47,.43,.18], ROPE=[.58,.42,.2], BAG=[.7,.53,.3], TRAY=[.68,.44,.19], BLACK=[0,0,0];
  const part=(name,rank,of)=>({name,rank,of});
  // a mushroom: a cream stem and a puffy cap (cream or tan), its foot at (x,y,z), h high, the cap r wide; a little lean; into the stems' and the caps' parts
  const mush=(stems,caps,x,y,z,h,r,cap,lean=[0,0,0])=>{ const st=cyl(r*.3,r*.38,h,6); st.translate(0,h/2,0); const cp=sph(r,8,5); cp.scale(1,.62,1); cp.translate(0,h,0);
    stems.push(shape(st,CREAM,[x,y,z],null,lean)); caps.push(shape(cp,cap,[x,y,z],null,lean)); };
  const mottle=(x,y,z)=>{ const v=noise(x,y,z); return v>.6?OLIVE:v>.5?[.62,.42,.16]:RUST; };
  const hatStems=[], hatCaps=[], trayStems=[], trayCaps=[];
  for(let i=0;i<9;i++){ const a=i/9*Math.PI*2, r=.155, big=i%2===0; mush(hatStems,hatCaps,Math.sin(a)*r,1.605,Math.cos(a)*r,big?.09:.065,big?.045:.035,big?CAP:CREAM,[Math.cos(a)*14,0,-Math.sin(a)*14]); }
  for(let i=0;i<4;i++){ const a=(i+.5)/4*Math.PI*2, r=.095; mush(hatStems,hatCaps,Math.sin(a)*r,1.715,Math.cos(a)*r,.07,.038,i%2?CAP:CREAM,[Math.cos(a)*8,0,-Math.sin(a)*8]); }
  mush(hatStems,hatCaps,0,1.715,0,.14,.11,CAP);   // (the crown)
  { let seed=3; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
    for(let i=0;i<13;i++){ const a=rnd()*Math.PI*2, r=.05+rnd()*.15, big=rnd()<.5; mush(trayStems,trayCaps,Math.sin(a)*r,1.0,.33+Math.cos(a)*r,big?.1:.07,big?.045:.032,rnd()<.45?CAP:CREAM,[(rnd()-.5)*20,0,(rnd()-.5)*20]); } }
  const PARTS=[
    part('face',0,[ ...[-1,1].map(sx=>shape(cyl(.042,.042,.03,8),BLACK,[sx*.058,1.42,.136],null,[90,0,0])),   // (the sockets)
      shape(box(.036,.036,.03),BLACK,[0,1.345,.145],null,[0,0,45]), shape(box(.12,.012,.025),BLACK,[0,1.29,.128]),   // (the nose, the grin's line)
      ...[-2,-1,0,1,2].map(i=>shape(box(.01,.032,.025),BLACK,[i*.026,1.29,.128])) ]),   // (its teeth)
    part('skull',2,[ shape(sph(.155,10,7),BONE,[0,1.38,0],[1,1.1,1]), shape(blob(.11,.06,.09,10,6),BONE,[0,1.27,.02]) ]),
    part('hair',2,[ ...[-1,1].flatMap(sx=>[shape(blob(.06,.27,.12,10,8),TAN,[sx*.19,1.17,-.03],null,[0,0,sx*-6]),shape(blob(.045,.2,.08,8,6),TAN,[sx*.24,.98,0],null,[0,0,sx*-10]),shape(blob(.05,.14,.09,8,6),TAN,[sx*.2,1.35,-.1],null,[0,0,sx*-14])]),
      shape(blob(.17,.28,.08,12,8),TAN,[0,1.17,-.15]), shape(blob(.11,.17,.06,10,6),TAN,[0,.92,-.15]) ]),   // (soft locks, not blocks: owner, 17 Oct 2026, "rounded")
    part('hat',2,[ shape(cyl(.21,.23,.08,14),HAT,[0,1.565,0]), shape(cyl(.15,.17,.11,12),HAT2,[0,1.66,0]) ]),
    part('hat mushrooms',4,hatCaps), part('hat stems',3,hatStems),
    part('robe',0,[ shape(cyl(.17,.31,1.2,12),mottle,[0,.62,0]), shape(sph(.185,10,5),mottle,[0,1.2,0],[1,.55,1]), shape(cyl(.085,.1,.07,8),RUST,[0,1.255,0]) ]),
    part('sleeves',1,[-1,1].map(sx=>limb([sx*.17,1.17,.02],[sx*.13,.98,.22],.055,.085,mottle))),
    part('hands',1,[-1,1].map(sx=>shape(sph(.05,8,6),CREAM,[sx*.12,.96,.25],[1.1,.8,1.3]))),
    part('tray',2,[ shape(cyl(.25,.23,.03,16),TRAY,[0,.99,.33]), shape(torus(.245,.016,6,16),TRAY,[0,1.005,.33],null,[90,0,0]) ]),
    part('tray mushrooms',4,trayCaps), part('tray stems',3,trayStems),
    part('strap',2,[ limb([.12,1.24,.1],[-.22,.72,.13],.02,.02,ROPE,6), limb([.12,1.24,-.06],[-.24,.72,-.06],.02,.02,ROPE,6),
      ...Array.from({length:7},(_,i)=>{ const u=(i+.5)/7; return shape(sph(.024,6,4),[.52,.37,.17],[.12-.34*u,1.24-.52*u,.1+.03*u]); }) ]),   // (its braid's knots)
    part('bag',1,[ shape(blob(.08,.12,.05,10,8),BAG,[-.26,.62,.04],null,[0,0,-6]), shape(blob(.085,.03,.055,10,6),[.62,.46,.25],[-.26,.72,.04],null,[0,0,-6]) ]) ];
  // HIS BOOTH (owner, 18 Oct 2026: "i want to give the mushroom skeletong his own booth in the entrance of central park, his table is full of
  // mushrooms"): inside the park's gate, east of the toy stall: a trestle table under a striped awning on two posts, its top heaped with
  // mushrooms (red caps, browns, tans, cream, orange chanterelles) and three baskets of them; he stands behind it facing the gate, his tray still
  // in his hands, rocking a little, never wandering. Blocks and rounds in two instanced draws (some 4,000 triangles), solid at the table; no light
  const BOOTH=()=>{ const P=PARK, X=x=>BOD.XS(x+(P.ox||0)), Z=y=>BOD.ZS(y+(P.oy||0)), Y=BOD.YS, g1=P.gate[1], x0=g1+6.6, x1=g1+10.2, y0=P.y0+2.2, y1=P.y0+3.2, TP=27;
    const BX=[], CY=[], box=(a,b,c,d,z0,z1,col)=>BX.push([(X(a)+X(b))/2,(Y(z0)+Y(z1))/2,(Z(c)+Z(d))/2,Math.abs(X(b)-X(a)),Y(z1)-Y(z0),Math.abs(Z(d)-Z(c)),col]);
    const rnd=(()=>{ let t=7; return ()=>{ t=(t*16807)%2147483647; return t/2147483647; }; })(), WOOD=0x7a5634, DK=0x4e3622;
    box(x0,x1,y0,y1,TP-2,TP,WOOD); for(const [a,b] of [[x0+.08,y0+.08],[x1-.2,y0+.08],[x0+.08,y1-.2],[x1-.2,y1-.2]])box(a,a+.12,b,b+.12,0,TP-2,DK);   // (the table, its legs)
    box(x0+.1,x0+.22,y1-.1,y1+.02,0,74,DK); box(x1-.22,x1-.1,y1-.1,y1+.02,0,74,DK);   // (the awning's posts, at the back)
    for(let i=0;i<9;i++){ const a=x0-.15+i*(x1-x0+.3)/9; box(a,a+(x1-x0+.3)/9,y0-.35,y1+.05,72,75,i&1?0xeee4cc:0xb03a2e); }   // (the awning, striped)
    const cap=(x,y,z,r,col)=>CY.push([x,y,z,r,col]);
    const COLS=[0xb8321f,0xc9402a,0x8a5a36,0x6e4a2c,0xc8a878,0xe8dcc0,0xe08a2a,0xd09a52];
    for(let i=0;i<70;i++){ const x=x0+.15+rnd()*(x1-x0-.3), y=y0+.12+rnd()*(y1-y0-.24), r=.05+rnd()*.07; cap(X(x),Y(TP)+r*TILE*.5,Z(y),r*TILE,COLS[Math.floor(rnd()*COLS.length)]); }
    for(const bx of [x0+.5,x0+1.8,x1-.6]){ const by=(y0+y1)/2+(rnd()-.5)*.2; box(bx-.28,bx+.28,by-.25,by+.25,TP,TP+7,0x9c7a46); for(let k=0;k<9;k++)cap(X(bx+(rnd()-.5)*.4),Y(TP+7)+.05*TILE*(1+rnd()),Z(by+(rnd()-.5)*.36),(.06+rnd()*.05)*TILE,COLS[Math.floor(rnd()*COLS.length)]); }
    const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color(), V=THREE.Vector3, grp=(typeof MAPG!=='undefined'&&MAPG.park)||scene;
    const B=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff}),BX.length); BX.forEach(([x,y,z,sx,sy,sz,col],i)=>{ B.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(sx,sy,sz))); B.setColorAt(i,c.setHex(col)); });
    const capG=new THREE.SphereGeometry(1,8,4,0,Math.PI*2,0,Math.PI/2).scale(1,.62,1); capG.merge?0:0; const stemG=new THREE.CylinderGeometry(.32,.38,.9,6).translate(0,-.45,0);
    const C=new THREE.InstancedMesh(capG,new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),CY.length), S=new THREE.InstancedMesh(stemG,new THREE.MeshLambertMaterial({color:0xe6dcc4,flatShading:true}),CY.length);
    CY.forEach(([x,y,z,r,col],i)=>{ C.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(r,r,r))); C.setColorAt(i,c.setHex(col)); S.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(r,r,r))); });
    for(const me of [B,C,S]){ me.castShadow=me.receiveShadow=true; grp.add(me); }
    SOL.up.push([Math.min(X(x0),X(x1)),Math.min(Z(y0),Z(y1)),Math.max(X(x0),X(x1)),Math.max(Z(y0),Z(y1))]); FIX.up.push([Math.min(X(x0),X(x1)),Math.min(Z(y0),Z(y1)),0,Math.max(X(x0),X(x1)),Math.max(Z(y0),Z(y1)),Y(TP)]);
    // (him behind it, facing the gate: held there, his mind saying so every frame; LIVES and the roaming leave a held one be)
    MUSH.booth={x0,x1,y0,y1,hx:X((x0+x1)/2),hz:Z(y1+.75),fz:Z(y0-2)}; };
  // (built once the park is: its gate and wall where the layout and its growth put them, park.js's builder having run; then he steps behind it)

  const N=PARTSNPC.make(PARTS,Object.assign({key:'mushroom',name:'THE MUSHROOM SELLER',eye:0,eyeC:'0.,0.,0.',metres:2.2,radius:.3,speed:.4,stride:6,rock:.05,bob:.025},PARTSNPC.street(72,-70),
    {roam:false,brain:(dt,you,st)=>{ const MB=MUSH.booth; st.to=null; st.hold=true; if(MB){ st.x=MB.hx; st.z=MB.hz; st.face={x:MB.hx,z:MB.fz}; } }}));   // (held behind his table, facing the gate)
  { const wait=()=>{ if(!PARK.fire)return setTimeout(wait,500); BOOTH(); N.st.x=MUSH.booth.hx; N.st.z=MUSH.booth.hz; N.home={x:N.st.x,z:N.st.z}; }; wait(); }
  MUSH.N=N; window.MUSHDBG=()=>({booth:!!MUSH.booth,life:!!N.life,fire:!!PARK.fire,key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),to:!!N.st.to,vis:N.g.visible,tris:N.tris}); }
