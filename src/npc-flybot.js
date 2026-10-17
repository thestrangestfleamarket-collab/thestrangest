// ---- THE FLYING VAN (owner, 17 Oct 2026, his picture: a cream-and-teal robot van hovering over a New York street on two rotor discs, two big
// goggle eyes in thick cream rims, an orange button nose high between them, a smile, a slot on its brow, a sign of orange lettering, blue
// double doors, a shuttered window, a plaque on its side, four dark-teal ball wheels hanging under it; "same rules", "not the man"; then "yours
// is too square, face doesnt match, 1:1"). Measured from the picture's face (its front 0.9 m wide, 0.73 m tall, cream above 0.37, teal below;
// the corners and the top rounded, 0.1 m): the eye rims 0.27 m across at 0.27 m out from the middle, 0.19 m under the top, standing proud,
// the lens dark inside; the nose 0.14 m wide at 0.09 m under the top; the slot 0.12 m wide on the brow; the smile 0.22 m across, sagging
// 0.03 m; the sign 0.26 x 0.27 m on the left, the doors 0.24 m wide to the floor in the middle, the shutter 0.25 x 0.26 m on the right; the
// wheels 0.16 m balls a tenth under it. One flat colour an area; only the details that matter. The body lofted from rounded rectangles
// (`rr`), its top and bottom edges rounded by the rows. Its parts that move: the rotor discs spin (anim) and it hovers 1.5 m over the
// street, bobbing a little; it keeps the street as the others do, and turns to you when you come near. Some 3,000 triangles ----
const FLYBOT={};
{ const {shape,limb,sph,cyl,box,torus,blob}=PARTSNPC.T, TAU=Math.PI*2;
  const part=(name,rank,of)=>({name,rank,of});
  const CREAM=[.9,.88,.8], TEAL=[.25,.45,.42], TEAL2=[.18,.35,.33], TEAL3=[.4,.6,.57], GREY=[.8,.8,.78], ORANGE=[.86,.55,.38], MOUTH=[.5,.2,.15], SIGN=[.12,.09,.06], TEXT=[.9,.5,.2], DOOR=[.2,.38,.5], DOOR2=[.12,.25,.36], BLACK=[0,0,0], WHITE=[1,1,1], LENS=[.08,.1,.12];
  const HW=.45, HD=.4, HT=.73, SPLIT=.37, CR=.1, F=HD;   // (half width, half depth, height; the cream/teal split; the corners' round)
  // a ring round a rounded rectangle (half sizes rx, rz, corner r), n points; a loft of them, rows top to bottom; the top and bottom rows
  // drawn in with a quarter-round so the edges are rounded as the picture's are
  const rr=(rx,rz,r,n=32)=>{ const P=[], cs=[[1,1],[-1,1],[-1,-1],[1,-1]]; for(let c=0;c<4;c++){ const [sx,sz]=cs[c], a0=c*Math.PI/2; for(let k=0;k<n/4;k++){ const a=a0+k/(n/4)*Math.PI/2; P.push([sx*(rx-r)+Math.cos(a)*r,sz*(rz-r)+Math.sin(a)*r]); } } return P; };
  const loft=(S,n=32)=>{ const R=S.map(s=>rr(s.rx,s.rz,Math.min(CR,s.rx-.001,s.rz-.001),n).map(([x,z])=>[x,s.y,z])), P=[];
    for(let i=0;i<S.length-1;i++)for(let k=0;k<n;k++){ const a=R[i][k], b=R[i][(k+1)%n], c=R[i+1][(k+1)%n], d=R[i+1][k]; P.push(...a,...b,...c, ...a,...c,...d); }
    for(const [i,sg] of [[0,1],[S.length-1,-1]]){ const s=S[i], r=R[i]; for(let k=0;k<n;k++)P.push(0,s.y,0, ...(sg>0?[...r[(k+1)%n],...r[k]]:[...r[k],...r[(k+1)%n]])); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(P),3)); return g; };
  const SEC=[]; const ER=.08;   // (the edges' round, top and bottom)
  for(let i=0;i<=5;i++){ const t=i/5, y=HT-ER+Math.sin(t*Math.PI/2)*ER, k=Math.cos(t*Math.PI/2); SEC.push({y,rx:HW-ER+ER*k,rz:HD-ER+ER*k}); }
  SEC.reverse(); SEC.push({y:SPLIT+.002,rx:HW,rz:HD},{y:SPLIT-.002,rx:HW,rz:HD});
  for(let i=5;i>=0;i--){ const t=i/5, y=ER-Math.sin(t*Math.PI/2)*ER, k=Math.cos(t*Math.PI/2); SEC.push({y:Math.max(0,y),rx:HW-ER+ER*k,rz:HD-ER+ER*k}); }
  const skin=(x,y,z)=>y>SPLIT?CREAM:TEAL;
  const smile=[]; for(let i=0;i<9;i++){ const u=i/8-.5, x=u*.22, y=HT-.3-Math.cos(u*Math.PI)*.03, dx=.22/8; smile.push(shape(box(dx*1.1,.025,.02),MOUTH,[x,y,F+.004],null,[0,0,-Math.sin(u*Math.PI)*22])); }
  const PARTS=[
    part('lenses',0,[-1,1].map(sx=>shape(sph(.075,12,9),LENS,[sx*.27,HT-.19,F+.05],[1,1,.55]))),   // (lit by nothing)
    part('body',1,[ shape(loft(SEC),skin), shape(box(.12,.04,.012),BLACK,[0,HT-.045,F+.004]) ]),   // (the slot on its brow)
    part('eye rims',2,[-1,1].map(sx=>shape(torus(.1,.038,8,22),CREAM,[sx*.27,HT-.19,F+.03]))),
    part('glints',4,[-1,1].map(sx=>shape(sph(.016,5,4),WHITE,[sx*.27-.03,HT-.16,F+.085]))),
    part('nose',2,[ shape(blob(.07,.05,.045,10,7),ORANGE,[0,HT-.12,F+.025]) ]),
    part('mouth',2,smile),
    part('sign',2,[ shape(box(.26,.27,.016),SIGN,[-.28,.19,F+.004]), ...[0,1,2,3].map(i=>shape(box(.2-(i%2)*.04,.035,.01),TEXT,[-.28-(i%2)*.015,.29-i*.055,F+.014])) ]),
    part('doors',2,[ shape(box(.24,.36,.016),DOOR,[0,.18,F+.004]), shape(box(.012,.36,.014),DOOR2,[0,.18,F+.01]), shape(box(.024,.012,.016),GREY,[-.03,.19,F+.016]) ]),
    part('window',2,[ shape(box(.25,.26,.016),TEAL3,[.31,.185,F+.004]), shape(box(.2,.21,.012),GREY,[.31,.185,F+.012]), ...[0,1,2,3,4,5].map(i=>shape(box(.19,.006,.01),[.6,.6,.58],[.31,.27-i*.035,F+.019])) ]),   // (the frame, the shutter, its slats)
    part('plaque',3,[ shape(box(.02,.06,.1),WHITE,[HW+.01,.26,-.08]), shape(box(.03,.03,.03),GREY,[HW+.02,.2,-.08]) ]),
    part('rotor stand',2,[ shape(cyl(.03,.045,.08,8),TEAL,[.05,HT+.03,-.02]), limb([.05,HT+.06,-.02],[.05,HT+.19,-.02],.025,.02,TEAL,8), limb([-.25,HT+.21,-.02],[.35,HT+.21,-.02],.018,.018,TEAL,8), ...[-.25,.35].map(x=>shape(cyl(.02,.02,.05,8),TEAL2,[x,HT+.23,-.02])) ]),
    part('wheel stems',1,[ ...[[-.28,.22],[.28,.22],[-.28,-.2],[.28,-.2]].map(([x,z])=>shape(cyl(.02,.02,.08,6),TEAL2,[x,-.04,z])) ]),
    part('wheels',2,[ ...[[-.28,.22],[.28,.22],[-.28,-.2],[.28,-.2]].map(([x,z])=>shape(sph(.08,10,7),TEAL2,[x,-.12,z])) ]) ];
  const ROTORS=[], REG=14;
  const N=PARTSNPC.make(PARTS,Object.assign({key:'flybot',name:'THE FLYING VAN',eye:0,eyeC:'.05,.06,.09',metres:1.07,radius:.5,speed:.5,stride:0,rock:0,bob:0,
    anim:(dt,moving,st)=>{ N.t=(N.t||0)+dt; for(const R of ROTORS)R.rotation.y+=dt*22; N.g.position.y+=(1.5+Math.sin(N.t*1.3)*.08)*TILE/.84; N.body.rotation.z=moving?Math.sin(N.t*2)*.03:0; }},PARTSNPC.street(78,-66)));
  // the rotor discs, their own meshes on the hubs, spun each frame
  const discGeo=()=>{ const S=[shape(cyl(.12,.12,.012,14),TEAL,[0,0,0]),shape(box(.26,.008,.03),TEAL2,[0,.01,0]),shape(box(.03,.008,.26),TEAL2,[0,.01,0])]; let n=0; for(const c of S)n+=c.P.length/3; const P=new Float32Array(n*3), C=new Float32Array(n*3); let k=0; for(const c of S){ P.set(c.P,k*3); C.set(c.C,k*3); k+=c.P.length/3; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.setAttribute('reg',new THREE.BufferAttribute(new Float32Array(n).fill(REG),1)); g.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(n),1)); g.computeVertexNormals(); return g; };
  for(const x of [-.25,.35]){ const m=new THREE.Mesh(discGeo(),N.me.material); m.castShadow=true; m.position.set(x,HT+.26+.2,-.02); N.body.add(m); ROTORS.push(m); }   // (the body's geometry stands on the wheels' bottoms, .2 under the box)
  FLYBOT.N=N; window.FLYDBG=()=>({key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),tris:N.tris}); }
