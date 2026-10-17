// ---- THE SHARK HOOD (owner, 17 Oct 2026, his picture: a small kid on a wet street in a shark's-head hood; "same", then "build one part at
// a time and make it logical"). Built inside out, as he is dressed: FIRST HIS BODY (a round head with his small face, a neck, a torso, two arms
// ending in yellow mittens, two legs ending in yellow boots; the legs their own meshes so they swing as he walks); THEN THE COAT over the torso
// (a beige trench to the ankles, its shoulders, sleeves over his arms, lapels, one dark button); THEN THE BIB (the yellow raincoat's collar
// and the point it comes to down his chest); LAST THE HOOD, a shark's head worn over his head (the grey crown cupping the back and top of his
// head; the snout rising forward and up from its front; the yellow roof of the upper jaw under the snout; the yellow lower jaw hung under his
// chin, open; the teeth standing on both rims; the fin on the crown's back; the shark's black eyes on the snout's sides). Measured from the
// picture: 1.1 m from the fin's tip to the boots, the hood as wide as the coat, his face at the back of the open mouth. One flat colour an
// area. ?sharkstage=1..4 builds him up to a stage (the sheet shows him coming together). Some 3,000 triangles; his eyes lit by nothing ----
const SHARKKID={};
{ const {shape,limb,sph,cyl,box,blob}=PARTSNPC.T, PI=Math.PI;
  const part=(name,rank,of)=>({name,rank,of});
  const GREY=[.42,.46,.48], YEL=[.95,.75,.15], BEIGE=[.72,.68,.56], BEIGE2=[.62,.58,.47], WHITE=[1,1,1], GUM=[.75,.25,.25], FACE=[.96,.86,.8], CHEEK=[.95,.6,.65], BLACK=[0,0,0];
  const dome=(r,ph0,phL,th0,thL)=>new THREE.SphereGeometry(r,16,10,ph0,phL,th0,thL);   // (a piece of a sphere: phi round, theta from the top)
  const STAGE=+(QS.get('sharkstage')||4);
  // the shark's teeth: a row of small white cones along a rim at height y and reach z, standing up from the lower jaw or hanging from the upper
  const teeth=(y,z,r,up)=>Array.from({length:9},(_,i)=>{ const a=(i-4)/4*1.05; return shape(cyl(0,.017,.035,4),WHITE,[Math.sin(a)*r,y,z+Math.cos(a)*r*.45],null,[up?180:0,0,0]); });
  const gum=(y,z,r)=>Array.from({length:9},(_,i)=>{ const a=(i-4)/4*1.05; return shape(box(.045,.012,.014),GUM,[Math.sin(a)*r,y,z+Math.cos(a)*r*.45],null,[0,-a*57.3,0]); });
  const PARTS=[
    // 1. HIS BODY: the head (his face toward +z: two dot eyes, pink cheeks, a small mouth), the neck, the torso, the arms to his mittens
    part('eyes',0,[ ...[-1,1].map(sx=>shape(sph(.012,5,4),BLACK,[sx*.032,.75,.125])), shape(box(.035,.007,.01),GUM,[0,.705,.125]) ]),
    part('head',1,[ shape(sph(.1,12,9),FACE,[0,.74,.03]), ...[-1,1].map(sx=>shape(blob(.024,.016,.01,6,4),CHEEK,[sx*.06,.725,.117])) ]),
    part('neck',1,[ shape(cyl(.04,.04,.08,8),FACE,[0,.63,.02]) ]),
    part('torso',1,[ shape(cyl(.13,.12,.32,10),FACE,[0,.46,0]) ]),
    part('arms',1,[-1,1].map(sx=>limb([sx*.14,.58,0],[sx*.24,.32,.06],.045,.04,FACE,8))),
    part('mittens',3,[-1,1].map(sx=>shape(blob(.06,.05,.07,8,6),YEL,[sx*.26,.28,.08]))),
    part('legs',1,[]),   // (the legs and boots: their own meshes, hung at the hips below)
    // 2. THE COAT over the torso: the trench from the shoulders to the ankles, its shoulders rounded, sleeves over the arms, lapels, one button
    ...(STAGE<2?[]:[
    part('coat',2,[ shape(cyl(.2,.23,.5,14),BEIGE,[0,.35,0]), shape(dome(.2,0,2*PI,0,PI/2),BEIGE,[0,.6,0],[1,.45,1]) ]),
    part('lapels',3,[ shape(box(.08,.19,.015),BEIGE2,[-.1,.5,.2],null,[0,0,-22]), shape(box(.08,.19,.015),BEIGE2,[.1,.5,.2],null,[0,0,22]), shape(sph(.016,6,4),BLACK,[-.03,.36,.23]) ]),
    part('sleeves',2,[-1,1].map(sx=>limb([sx*.17,.58,0],[sx*.25,.32,.06],.07,.06,BEIGE,8))) ]),
    // 3. THE BIB: the yellow raincoat under the trench, its collar round the neck and the point it comes to down his chest, over the coat's front
    ...(STAGE<3?[]:[
    part('bib',3,[ shape(cyl(.09,.11,.07,10),YEL,[0,.62,.02]), shape(cyl(.015,.17,.3,4),YEL,[0,.46,.215],[1,1,.2],[0,45,0]) ]) ]),
    // 4. THE HOOD, a shark's head over his: the crown cups the back and top of his head (open at the front, where his face looks out); the snout
    //    rises forward and up from the crown's front; the upper jaw's yellow roof under the snout; the lower jaw hangs under his chin, wrapping the
    //    neck, its mouth open to the teeth; the fin on the crown's back; the shark's eyes on the snout's sides
    ...(STAGE<4?[]:[
    part('crown',2,[ shape(dome(.21,0,2*PI,0,PI*.55),GREY,[0,.85,-.02],[1,1,1.1]) ]),
    part('snout',2,[ shape(cyl(.03,.17,.32,10),GREY,[0,1.0,.14],[1,.9,1],[52,0,0]) ]),
    part('upper jaw',3,[ shape(dome(.215,0,PI,PI*.42,PI*.13),YEL,[0,.85,-.02],[1,1,1.1]) ]),
    part('lower jaw',2,[ shape(dome(.2,0,2*PI,PI*.55,PI*.45),YEL,[0,.66,.03],[1,1,1.1]) ]),
    part('teeth',4,[ ...gum(.82,-.02,.21), ...teeth(.805,-.02,.205,true), ...gum(.69,.03,.2), ...teeth(.705,.03,.195,false) ]),
    part('fin',3,[ shape(cyl(.005,.1,.22,4),GREY,[0,1.1,-.14],[1,1,.35],[22,45,0]) ]),
    part('shark eyes',0,[-1,1].map(sx=>shape(sph(.03,8,6),BLACK,[sx*.14,.95,.14]))) ]) ];
  const LEGS=[], REG=6;
  const legGeo=S=>{ let n=0; for(const c of S)n+=c.P.length/3; const P=new Float32Array(n*3), C=new Float32Array(n*3); let k=0; for(const c of S){ P.set(c.P,k*3); C.set(c.C,k*3); k+=c.P.length/3; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.setAttribute('reg',new THREE.BufferAttribute(new Float32Array(n).fill(REG),1)); g.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(n),1)); g.computeVertexNormals(); return g; };
  const N=PARTSNPC.make(PARTS,Object.assign({key:'sharkkid',name:'THE SHARK HOOD',eye:0,eyeC:'0.,0.,0.',metres:1.1,radius:.3,speed:.4,stride:6,rock:.03,bob:.02,
    anim:(dt,moving,st)=>{ const walk=moving||QS.has('stride'), ph0=QS.has('stride')?performance.now()/250:st.ph; LEGS.forEach((L,i)=>{ L.rotation.x+=((walk?Math.sin(ph0+i*PI)*.45:0)-L.rotation.x)*Math.min(1,dt*12); }); }},PARTSNPC.street(70,-73)));
  // the legs: each hung at its hip (the pivot), the thigh and shin one piece down to the ankle, the boot on its foot pointing forward
  for(const sx of [-1,1]){ const H=[sx*.08,.3,0], rel=p=>[p[0]-H[0],p[1]-H[1],p[2]-H[2]];
    const S=[ limb(rel(H),rel([sx*.09,.08,.02]),.05,.045,FACE,8), shape(blob(.06,.05,.095,8,6),YEL,rel([sx*.09,.05,.06])) ];
    const m=new THREE.Mesh(legGeo(S),N.me.material); m.castShadow=true; m.position.set(H[0],H[1],H[2]); N.body.add(m); LEGS.push(m); }
  SHARKKID.N=N; window.SHARKDBG=()=>({key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),tris:N.tris}); }
