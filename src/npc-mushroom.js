// ---- THE MUSHROOM SELLER (owner, 17 Oct 2026, his picture: a felted skeleton in a mottled rust robe, long tan hair, a hat crowned with
// mushrooms, a rope strap and a woven bag over his shoulder, a tray of mushrooms held out in his mitts; "add this is a 3d character in the game").
// Built here in code, no model: a few plain shapes (spheres, cylinders, boxes) coloured as the felt is, in one mesh of some 2,500 triangles;
// his skull's sockets, nose and teeth pure black (makeNPC's "eye" part, lit by nothing); his robe mottled rust and olive by a value noise;
// the hat's brim shades the hair, the strap the robe, the caps their stems (makeNPC's ranks). Shaded as the fish and the bear (tones in bands,
// the clothes' shadows, SELF), lit by the lamps. He walks the whole street as the others do (owner, 17 Oct 2026: "put any new characters that
// go in the game into the street walking around"), rocking a little under his tray, and turns to face you when you come near ----
const MUSH={};
{ const PARTS=['sockets','skull','hair','hat','caps','stems','robe','strap','bag','hands','tray'], PI=Object.fromEntries(PARTS.map((p,i)=>[p,i])), D2R=Math.PI/180;
  const RANK=[0,0,1,2,4,3,0,2,1,1,2];   // (which layer shades which: the hat over the hair, the strap and the bag over the robe, the tray over the hands, the caps over the stems)
  const CREAM=[.93,.87,.7], BONE=[.91,.85,.66], TAN=[.76,.6,.36], HAT=[.72,.47,.2], HAT2=[.66,.42,.17], CAP=[.74,.5,.22], RUST=[.74,.42,.14], OLIVE=[.47,.43,.18], ROPE=[.58,.42,.2], BAG=[.7,.53,.3], TRAY=[.68,.44,.19], BLACK=[0,0,0];
  const chunks=[]; let n=0; const M4=new THREE.Matrix4(), E=new THREE.Euler(), Q=new THREE.Quaternion(), UP=new THREE.Vector3(0,1,0), V=new THREE.Vector3();
  // a shape placed: sized (sz), turned (rot, degrees), then set at (at); its part; its colour, or a colour by place (the robe's mottling)
  const add=(g,part,col,at,sz,rot)=>{ g=g.toNonIndexed(); if(sz)g.scale(sz[0],sz[1],sz[2]); if(rot)g.applyMatrix4(M4.makeRotationFromEuler(E.set(rot[0]*D2R,rot[1]*D2R,rot[2]*D2R))); g.translate(at[0],at[1],at[2]);
    const P=g.attributes.position.array, m=P.length/3, C=new Float32Array(m*3), R=new Float32Array(m).fill(PI[part]);
    for(let i=0;i<m;i++){ const c=typeof col==='function'?col(P[i*3],P[i*3+1],P[i*3+2]):col; C[i*3]=c[0]; C[i*3+1]=c[1]; C[i*3+2]=c[2]; } chunks.push([P,C,R]); n+=m; };
  // a limb: a tapered cylinder from a to b (radii r0 at a, r1 at b)
  const limb=(a,b,r0,r1,part,col,seg=8)=>{ const d=V.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length(); d.normalize(); const g=new THREE.CylinderGeometry(r1,r0,L,seg).toNonIndexed(); g.translate(0,L/2,0);
    Q.setFromUnitVectors(UP,d); g.applyQuaternion(Q); g.translate(a[0],a[1],a[2]); add(g,part,col,[0,0,0]); };
  const sph=(r,w=8,h=6)=>new THREE.SphereGeometry(r,w,h), cyl=(r0,r1,h,s=8)=>new THREE.CylinderGeometry(r0,r1,h,s), box=(x,y,z)=>new THREE.BoxGeometry(x,y,z);
  // a mushroom: a cream stem and a puffy cap (cream or tan), its foot at (x,y,z), h high, the cap r wide; a little lean
  const mush=(x,y,z,h,r,cap,lean=[0,0,0])=>{ const st=cyl(r*.3,r*.38,h,6).toNonIndexed(); st.translate(0,h/2,0); const cp=sph(r,8,5).toNonIndexed(); cp.scale(1,.62,1); cp.translate(0,h,0);
    for(const [g,part,col] of [[st,'stems',CREAM],[cp,'caps',cap]]){ g.applyMatrix4(M4.makeRotationFromEuler(E.set(lean[0]*D2R,lean[1]*D2R,lean[2]*D2R))); g.translate(x,y,z); add(g,part,col,[0,0,0]); } };
  // ---- HIM: y up, z his front; in metres. The skull and its face
  add(sph(.13,10,7),'skull',BONE,[0,1.38,0],[1,1.1,1]);
  add(box(.17,.07,.12),'skull',BONE,[0,1.285,.015]);   // (the jaw)
  for(const sx of [-1,1])add(cyl(.036,.036,.03,8),'sockets',BLACK,[sx*.05,1.415,.118],null,[90,0,0]);   // (the sockets)
  add(box(.032,.032,.03),'sockets',BLACK,[0,1.352,.124],null,[0,0,45]);   // (the nose)
  add(box(.1,.01,.025),'sockets',BLACK,[0,1.302,.118]);   // (the grin's line)
  for(let i=-2;i<=2;i++)add(box(.009,.028,.025),'sockets',BLACK,[i*.022,1.302,.118]);   // (its teeth)
  // the hair: long, tan, blocky, down past his shoulders either side and behind
  for(const sx of [-1,1]){ add(box(.09,.5,.2),'hair',TAN,[sx*.17,1.17,-.02],null,[0,0,sx*-6]); add(box(.06,.36,.14),'hair',TAN,[sx*.22,.98,0],null,[0,0,sx*-10]); }
  add(box(.3,.52,.12),'hair',TAN,[0,1.17,-.13]); add(box(.2,.3,.09),'hair',TAN,[0,.92,-.15]);
  // the hat: a wide brim, its drum, mushrooms ringed round it and one big one on top
  add(cyl(.2,.22,.08,14),'hat',HAT,[0,1.535,0]); add(cyl(.15,.17,.11,12),'hat',HAT2,[0,1.63,0]);
  for(let i=0;i<9;i++){ const a=i/9*Math.PI*2, r=.155, big=i%2===0; mush(Math.sin(a)*r,1.575,Math.cos(a)*r,big?.09:.065,big?.045:.035,big?CAP:CREAM,[Math.cos(a)*14,0,-Math.sin(a)*14]); }
  for(let i=0;i<4;i++){ const a=(i+.5)/4*Math.PI*2, r=.095; mush(Math.sin(a)*r,1.685,Math.cos(a)*r,.07,.038,i%2?CAP:CREAM,[Math.cos(a)*8,0,-Math.sin(a)*8]); }
  mush(0,1.685,0,.14,.11,CAP);   // (the crown)
  // the robe: rust felt mottled olive (a value noise in bands), from his shoulders to the ground; the collar
  const hsh=(x,y,z)=>{ const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return s-Math.floor(s); };
  const noise=(x,y,z)=>{ const k=7; x*=k; y*=k; z*=k; const x0=Math.floor(x), y0=Math.floor(y), z0=Math.floor(z), fx=x-x0, fy=y-y0, fz=z-z0, s=t=>t*t*(3-2*t), l=(a,b,t)=>a+(b-a)*t;
    const c=(dx,dy,dz)=>hsh(x0+dx,y0+dy,z0+dz); return l(l(l(c(0,0,0),c(1,0,0),s(fx)),l(c(0,1,0),c(1,1,0),s(fx)),s(fy)),l(l(c(0,0,1),c(1,0,1),s(fx)),l(c(0,1,1),c(1,1,1),s(fx)),s(fy)),s(fz)); };
  const mottle=(x,y,z)=>{ const v=noise(x,y,z); return v>.6?OLIVE:v>.5?[.62,.42,.16]:RUST; };
  add(cyl(.17,.31,1.2,12),'robe',mottle,[0,.62,0]); add(sph(.185,10,5),'robe',mottle,[0,1.2,0],[1,.55,1]); add(cyl(.085,.1,.07,8),'robe',RUST,[0,1.255,0]);
  // his arms in their wide sleeves, out before him, the mitts, the tray held in them
  for(const sx of [-1,1]){ limb([sx*.17,1.17,.02],[sx*.13,.98,.22],.055,.085,'robe',mottle); add(sph(.05,8,6),'hands',CREAM,[sx*.12,.96,.25],[1.1,.8,1.3]); }
  add(cyl(.25,.23,.03,16),'tray',TRAY,[0,.99,.33]); add(new THREE.TorusGeometry(.245,.016,6,16),'tray',TRAY,[0,1.005,.33],null,[90,0,0]);
  { let seed=3; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
    for(let i=0;i<13;i++){ const a=rnd()*Math.PI*2, r=.05+rnd()*.15, big=rnd()<.5; mush(Math.sin(a)*r,1.0,.33+Math.cos(a)*r,big?.1:.07,big?.045:.032,rnd()<.45?CAP:CREAM,[(rnd()-.5)*20,0,(rnd()-.5)*20]); } }
  // the rope strap over his right shoulder to his left hip, the woven bag hanging there
  limb([.12,1.24,.1],[-.22,.72,.13],.02,.02,'strap',ROPE,6); limb([.12,1.24,-.06],[-.24,.72,-.06],.02,.02,'strap',ROPE,6);
  for(let i=0;i<7;i++){ const u=(i+.5)/7; add(sph(.024,6,4),'strap',[.52,.37,.17],[.12-.34*u,1.24-.52*u,.1+.03*u]); }   // (its braid's knots)
  add(box(.15,.22,.09),'bag',BAG,[-.26,.62,.04],null,[0,0,-6]); add(box(.16,.05,.1),'bag',[.62,.46,.25],[-.26,.72,.04],null,[0,0,-6]);
  // ---- ONE MESH of it all
  const P=new Float32Array(n*3), C=new Float32Array(n*3), R=new Float32Array(n); let o=0; for(const [p,c,r] of chunks){ P.set(p,o*3); C.set(c,o*3); R.set(r,o); o+=p.length/3; }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(P,3)); geo.setAttribute('color',new THREE.BufferAttribute(C,3)); geo.setAttribute('reg',new THREE.BufferAttribute(R,1));
  MUSH.tris=n/3;
  // ---- ON THE STREET, all of it (the figures' and the skeletons' lane), never into a wall, the stairs or another
  const LANE={x0:BOD.XS(BOD.MAP.x0+2),x1:BOD.XS(BOD.MAP.x1-2),z0:BOD.ZS(-76.3),z1:BOD.ZS(-61.2)}, HOLE=[BOD.XS(MAPSTAIR.x0-.6),BOD.ZS(MAPSTAIR.y0),BOD.XS(MAPSTAIR.x1+.6),BOD.ZS(MAPSTAIR.y1+.6)],
    free=(x,z,R)=>!(x>HOLE[0]-R&&x<HOLE[2]+R&&z>HOLE[1]-R&&z<HOLE[3]+R)&&!SOL.up.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R);
  const N=makeNPC(null,{key:'mushroom',name:'THE MUSHROOM SELLER',names:PARTS,lv:'up',group:'bodega',geo,eye:PI.sockets,eyeC:'0.,0.,0.',rank:RANK,
    metres:1.8,x:BOD.XS(72),z:BOD.ZS(-70),lane:LANE,free,ground:(x,z)=>MODS.bodega.ground(x,z),radius:.3,speed:.4,stride:6,rock:.05,bob:.025});
  MUSH.N=N; window.MUSHDBG=()=>({key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),to:!!N.st.to,vis:N.g.visible,tris:MUSH.tris}); }
