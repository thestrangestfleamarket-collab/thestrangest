// ---- THE FLYING VAN (owner, 17 Oct 2026, his picture: a boxy cream-and-teal robot van hovering over a New York street on two rotor discs, two
// big round camera eyes and an orange nose with a smile, a sign panel of orange lettering, blue double doors, a shuttered window, a little
// plaque on its side, four dark-teal ball wheels hanging under it; "same rules", "not the man"). Measured from the picture: the body a box
// 0.9 wide, 0.62 tall, 0.8 deep, its top half cream, its lower half teal; the eyes a quarter of the width across, set a third out from the
// middle; the rotor stand up from the top to a crossbar with a disc at each end. One flat colour an area; only the details that matter.
// Its parts that move: the rotor discs spin (anim) and it hovers 1.5 m over the street, bobbing a little; it keeps the street as the others
// do, and turns to you when you come near. Some 2,400 triangles ----
const FLYBOT={};
{ const {shape,limb,sph,cyl,box,torus,blob}=PARTSNPC.T;
  const part=(name,rank,of)=>({name,rank,of});
  const CREAM=[.9,.88,.82], TEAL=[.26,.46,.43], TEAL2=[.18,.34,.32], GREY=[.62,.62,.6], ORANGE=[.86,.55,.35], SIGN=[.36,.22,.12], TEXT=[.92,.52,.2], DOOR=[.2,.36,.56], DOOR2=[.15,.28,.46], SHUT=[.76,.76,.73], BLACK=[0,0,0], WHITE=[1,1,1], GLASS=[.12,.14,.18];
  const W=.9, H=.62, D=.8, Y0=.0, SPLIT=.31, F=D/2;   // (the body from Y0 up: its underside, the wheels hang below it)
  const PARTS=[
    part('eyes',0,[ ...[-1,1].map(sx=>shape(sph(.1,12,9),GLASS,[sx*.26,Y0+H-.16,F+.03],[1,1,.6])) ]),   // (the camera lenses, lit by nothing)
    part('body',1,[ shape(box(W,SPLIT,D),CREAM,[0,Y0+H-SPLIT/2,0]), shape(box(W,H-SPLIT,D),TEAL,[0,Y0+(H-SPLIT)/2,0]), shape(box(.05,.02,.01),BLACK,[-.05,Y0+H-.03,F+.004]) ]),   // (the cream top, the teal bottom, the slot on its brow)
    part('eye rims',2,[-1,1].map(sx=>shape(torus(.115,.03,8,18),GREY,[sx*.26,Y0+H-.16,F+.02]))),
    part('glints',4,[-1,1].map(sx=>shape(sph(.02,5,4),WHITE,[sx*.26-.03,Y0+H-.13,F+.09]))),
    part('nose',2,[ shape(blob(.06,.085,.05,10,7),ORANGE,[0,Y0+H-.17,F+.02]) ]),
    part('mouth',2,[ shape(box(.14,.016,.015),BLACK,[-.07,Y0+H-.27,F+.004],null,[0,0,12]), shape(box(.14,.016,.015),BLACK,[.07,Y0+H-.27,F+.004],null,[0,0,-12]) ]),   // (the smile)
    part('sign',2,[ shape(box(.25,.2,.02),SIGN,[-.3,Y0+.17,F+.005]), ...[0,1,2,3].map(i=>shape(box(.18-(i%2)*.04,.03,.01),TEXT,[-.3-(i%2)*.02,Y0+.24-i*.045,F+.018])) ]),   // (the orange lettering, line by line)
    part('doors',2,[ shape(box(.16,.26,.02),DOOR,[-.02,Y0+.15,F+.005]), shape(box(.012,.26,.015),DOOR2,[-.02,Y0+.15,F+.012]), ...[-1,1].map(sx=>shape(box(.02,.01,.02),GREY,[-.02+sx*.03,Y0+.15,F+.02])) ]),   // (two leaves, their handles)
    part('window',2,[ shape(box(.2,.19,.02),SHUT,[.27,Y0+.17,F+.005]), ...[0,1,2,3,4,5].map(i=>shape(box(.19,.006,.01),GREY,[.27,Y0+.26-i*.035,F+.016])) ]),   // (the shutter's slats)
    part('plaque',3,[ shape(box(.02,.06,.1),WHITE,[W/2+.01,Y0+.22,-.05]), shape(box(.03,.03,.03),BLACK,[W/2+.02,Y0+.17,-.05]) ]),   // (on its right side, a little lamp under it)
    part('rotor stand',2,[ shape(cyl(.03,.04,.1,8),TEAL,[0,Y0+H+.05,-.02]), limb([0,Y0+H+.1,-.02],[0,Y0+H+.2,-.02],.025,.02,TEAL,8), limb([-.3,Y0+H+.22,-.02],[.3,Y0+H+.22,-.02],.018,.018,TEAL,8), ...[-1,1].map(sx=>shape(cyl(.02,.02,.05,8),TEAL2,[sx*.3,Y0+H+.24,-.02])) ]),   // (the stand, the crossbar, the hubs)
    part('wheel stems',1,[ ...[[-.27,.22],[.27,.22],[-.27,-.2],[.27,-.2]].map(([x,z])=>shape(cyl(.02,.02,.08,6),TEAL2,[x,Y0-.04,z])) ]),
    part('wheels',2,[ ...[[-.27,.22],[.27,.22],[-.27,-.2],[.27,-.2]].map(([x,z])=>shape(sph(.085,10,7),TEAL2,[x,Y0-.12,z])) ]) ];
  const ROTORS=[], REG=14;
  const N=PARTSNPC.make(PARTS,Object.assign({key:'flybot',name:'THE FLYING VAN',eye:0,eyeC:'.05,.06,.09',metres:.98,radius:.5,speed:.5,stride:0,rock:0,bob:0,
    anim:(dt,moving,st)=>{ N.t=(N.t||0)+dt; for(const R of ROTORS)R.rotation.y+=dt*22; N.g.position.y+=(1.5+Math.sin(N.t*1.3)*.08)*TILE/.84; N.body.rotation.z=moving?Math.sin(N.t*2)*.03:0; }},PARTSNPC.street(78,-66)));
  // the rotor discs, their own meshes on the hubs, spun each frame
  const discGeo=()=>{ const S=[shape(cyl(.12,.12,.012,14),TEAL,[0,0,0]),shape(box(.26,.008,.03),TEAL2,[0,.01,0]),shape(box(.03,.008,.26),TEAL2,[0,.01,0])]; let n=0; for(const c of S)n+=c.P.length/3; const P=new Float32Array(n*3), C=new Float32Array(n*3); let k=0; for(const c of S){ P.set(c.P,k*3); C.set(c.C,k*3); k+=c.P.length/3; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.setAttribute('reg',new THREE.BufferAttribute(new Float32Array(n).fill(REG),1)); g.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(n),1)); g.computeVertexNormals(); return g; };
  for(const sx of [-1,1]){ const m=new THREE.Mesh(discGeo(),N.me.material); m.castShadow=true; m.position.set(sx*.3,H+.27+.12,-.02); N.body.add(m); ROTORS.push(m); }   // (the body's geometry stands on the wheels' bottoms, .12 under the box)
  FLYBOT.N=N; window.FLYDBG=()=>({key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),tris:N.tris}); }
