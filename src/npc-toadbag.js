// ---- THE TOAD BAG (owner, 17 Oct 2026, his picture: a fat felted toad that is a bag; "turn into character in game", "just take an imprint
// of it and turn into simple 3d character including only details that matter", "pick single colors for complex color areas"). The imprint:
// the toad's outline cut from the picture's front view, row by row (ROWS: each row's left and right edge, 40 rows from the handle's top to
// the toes), lofted into his body (each row an ellipse, a little less deep than wide); the colours one flat colour an area: olive felt for
// the face, a darker olive for his knobbly belly, one brown for the furry bag and its handle, maroon for the warts, black for the eyes, the
// mouth and the zipper. The details that matter: the two glossy eyes on their brows, the wide mouth, the seam down the belly, the warts,
// the zipper's band where face meets bag, the handle on its tabs, the buckled pocket, four feet with pale toes. Built in his parts
// (npc-parts.js), some 3,000 triangles; his pupils and mouth lit by nothing. 0.85 m. He waddles the whole street as the others do, and
// turns to you when you come near ----
const TOAD={};
{ const {shape,limb,sph,cyl,box,torus,blob}=PARTSNPC.T, TAU=Math.PI*2;
  const part=(name,rank,of)=>({name,rank,of});
  let seed=29; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  const GREEN=[.5,.49,.31], BELLY=[.28,.28,.19], BROWN=[.33,.26,.21], WART=[.3,.2,.17], FOOT=[.4,.41,.33], TIP=[.62,.56,.48], BLACK=[0,0,0], WHITE=[1,1,1];
  const ROWS=[[0.454, 0.464], [0.307, 0.612], [0.317, 0.622], [0.152, 0.698], [0.148, 0.757], [0.165, 0.808], [0.138, 0.84], [0.118, 0.863], [0.103, 0.884], [0.089, 0.901], [0.078, 0.911], [0.067, 0.922], [0.059, 0.933], [0.052, 0.941], [0.047, 0.953], [0.039, 0.961], [0.035, 0.97], [0.037, 0.976], [0.025, 0.983], [0.008, 0.987], [0.012, 0.993], [0.01, 0.995], [0.01, 0.998], [0.005, 0.997], [0.013, 0.99], [0.007, 0.995], [0.013, 0.976], [0.017, 0.976], [0.025, 0.948], [0.024, 0.951], [0.032, 0.919], [0.04, 0.914], [0.047, 0.897], [0.052, 0.909], [0.059, 0.821], [0.066, 0.804], [0.076, 0.725], [0.089, 0.499], [0.108, 0.137], [0.13, 0.157]], HT=.95, WD=HT*1.09;   // (the picture's outline: left and right edge a row, 40 rows top to bottom, as a part of its width; its height 0.95 m, its width 1.09 of that)
  // the body: the rows wider than a third, each an ellipse (the depth .92 of the width), lofted; a lid at the top and the bottom
  const SEC=[]; ROWS.forEach(([l,r],i)=>{ const w=(r-l)*WD; if(w<WD*.33)return; SEC.push({y:HT-(i+.5)/40*HT,rx:w/2,rz:w/2*.92}); });
  const TOP=SEC[0].y, BOT=SEC[SEC.length-1].y, CY=(TOP+BOT)/2, RX=Math.max(...SEC.map(s=>s.rx)), RZ=RX*.92, FACE=.3;
  const skin=(x,y,z)=>{ const s=SEC.find(s=>s.y<=y)||SEC[SEC.length-1]; if(z/s.rz<FACE)return BROWN; return y<CY-.12?BELLY:GREEN; };
  const loft=(S,n=24)=>{ const P=[], ring=s=>Array.from({length:n},(_,k)=>{ const a=k/n*TAU; return [Math.sin(a)*s.rx,s.y,Math.cos(a)*s.rz]; }), R=S.map(ring);
    for(let i=0;i<S.length-1;i++)for(let k=0;k<n;k++){ const a=R[i][k], b=R[i][(k+1)%n], c=R[i+1][(k+1)%n], d=R[i+1][k]; P.push(...a,...b,...c, ...a,...c,...d); }
    for(const [i,sg] of [[0,1],[S.length-1,-1]]){ const s=S[i], r=R[i]; for(let k=0;k<n;k++)P.push(0,s.y,0, ...(sg>0?[...r[(k+1)%n],...r[k]]:[...r[k],...r[(k+1)%n]])); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(P),3)); return g; };
  // a point on the skin at a direction (a round from the front, e up), out by o
  const at=(a,e,o=0)=>{ const y=CY+Math.sin(e)*(TOP-CY), s=SEC.find(s=>s.y<=y)||SEC[SEC.length-1]; return [Math.cos(e)*Math.sin(a)*(s.rx+o),y,Math.cos(e)*Math.cos(a)*(s.rz+o)]; };
  const onFace=(a,e)=>Math.cos(e)*Math.cos(a)>FACE+.08;
  const zipper=[]; for(let i=0;i<40;i++){ const t=i/40*TAU, k=Math.sqrt(1-FACE*FACE); zipper.push(shape(box(.028,.028,.016),BLACK,[Math.sin(t)*RX*k,CY+Math.cos(t)*(TOP-CY)*k,FACE*RZ+.004],null,[0,0,-t*57.3])); }
  const warts=[]; for(let i=0;i<30;i++){ const a=(rnd()-.5)*2.4, e=(rnd()-.4)*1.5; if(!onFace(a,e)||(e>.2&&Math.abs(a)<.8)||e<-.55)continue; const r=.02+rnd()*.018; warts.push(shape(sph(r,8,6),WART,at(a,e,r*.4))); }
  const bumps=[]; for(let i=0;i<60;i++){ const a=(rnd()-.5)*2.4, e=-.5-rnd()*.6; if(!onFace(a,e))continue; bumps.push(shape(sph(.016+rnd()*.012,5,4),BELLY,at(a,e,.008))); }
  const seam=[]; for(let i=0;i<9;i++){ const e=-.02-i*.1; seam.push(shape(box(.016,.06,.012),BLACK,at(0,e,.004),null,[-e*57,0,0])); }
  const EY=CY+(TOP-CY)*.62, EZ=at(0,.62)[2];
  const MZ=at(0,.38)[2]; const mouth=[ shape(box(.25,.022,.03),BLACK,[-.12,EY-.12,MZ-.04],null,[0,-24,3]), shape(box(.25,.022,.03),BLACK,[.12,EY-.12,MZ-.04],null,[0,24,-3]) ];   // (on the skin under the eyes)
  const toes=(x,z,sx,back)=>[-1.5,-.5,.5,1.5].flatMap(k=>{ const a=k*.42+(back?sx*.5:0), dx=Math.sin(a)*.085, dz=Math.cos(a)*.085; return [limb([x,.045,z],[x+dx,.028,z+dz],.02,.013,FOOT,6),shape(sph(.014,6,4),TIP,[x+dx*1.12,.026,z+dz*1.12])]; });
  const PARTS=[
    part('pupils',0,[ ...[-1,1].map(sx=>shape(sph(.075,10,7),BLACK,[sx*.18,EY+.02,EZ+.06])), ...mouth ]),
    part('body',1,[ shape(loft(SEC,24),skin) ]),
    part('brows',2,[-1,1].map(sx=>shape(blob(.12,.09,.08,10,7),GREEN,[sx*.18,EY,EZ-.01]))),
    part('glints',4,[-1,1].map(sx=>shape(sph(.018,5,4),WHITE,[sx*.18-.025,EY+.05,EZ+.12]))),
    part('warts',2,warts), part('belly',2,bumps), part('seam',2,seam), part('zipper',2,zipper),
    part('handle',3,[ shape(torus(.11,.016,6,14,Math.PI),BROWN,[0,TOP-.005,-.02]), ...[-1,1].map(sx=>shape(box(.07,.028,.06),BROWN,[sx*.11,TOP-.004,-.02])) ]),
    part('pocket',3,[ shape(box(.05,.18,.13),BROWN,[-RX+.02,CY,-.08],null,[0,0,-6]), shape(box(.012,.05,.03),[.72,.72,.7],[-RX-.01,CY+.04,-.08]), shape(box(.02,.12,.03),BLACK,[-RX,CY-.05,-.08]) ]),
    part('legs',2,[]) ];   // (the legs are their own pieces, below: they swing)
  // ---- HIS LEGS (owner, 17 Oct 2026: "limbs should attach, make realistically designed to function and walk around"): four, each a thigh
  // from a hip on the body's underside to a knee, a shin down to the ankle, the foot and its pale toes; the front pair short and forward, the
  // back pair longer and bent out like a toad's; each leg one mesh hung at its hip and swung from it as he walks (anim), the front and back
  // pairs in opposite step, still when he stands ----
  const LEGS=[], REG=11;   // (REG: the legs' part, for the shading's layers)
  const legGeo=S=>{ let n=0; for(const c of S)n+=c.P.length/3; const P=new Float32Array(n*3), C=new Float32Array(n*3); let k=0; for(const c of S){ P.set(c.P,k*3); C.set(c.C,k*3); k+=c.P.length/3; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.setAttribute('reg',new THREE.BufferAttribute(new Float32Array(n).fill(REG),1)); g.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(n),1)); g.computeVertexNormals(); return g; };
  const LEG=[ [[-.24,.2,.26],[-.28,.11,.36],[-.27,.045,.37],false],[[.24,.2,.26],[.28,.11,.36],[.27,.045,.37],false],   // (hip, knee, ankle: the front pair)
    [[-.34,.24,-.02],[-.47,.14,.04],[-.43,.045,.12],true],[[.34,.24,-.02],[.47,.14,.04],[.43,.045,.12],true] ];   // (the back pair, bent out)
  const N=PARTSNPC.make(PARTS,Object.assign({key:'toadbag',name:'THE TOAD BAG',eye:0,eyeC:'0.,0.,0.',metres:.85,radius:.3,speed:.3,stride:5,rock:.04,bob:.03,
    anim:(dt,moving,st)=>{ const walk=moving||QS.has('stride'), ph0=QS.has('stride')?performance.now()/250:st.ph; LEGS.forEach((L,i)=>{ const ph=ph0+(i%2?Math.PI:0)+(i<2?0:Math.PI); L.rotation.x+=((walk?Math.sin(ph)*.5:0)-L.rotation.x)*Math.min(1,dt*12); }); } /* (?stride: a test's look at his step while he's held) */},PARTSNPC.street(60,-71)));
  LEG.forEach(([H,K,A,back],i)=>{ const sx=H[0]<0?-1:1, rel=p=>[p[0]-H[0],p[1]-H[1],p[2]-H[2]];
    const S=[ limb(rel(H),rel(K),.06,.05,FOOT,8), limb(rel(K),rel(A),.048,.04,FOOT,8), shape(sph(.05,8,6),FOOT,rel(K)), shape(blob(.07,.042,.095,8,6),FOOT,rel([A[0],.05,A[2]+.02])),
      ...toes(A[0],A[2]+.02,sx,back).map(c=>{ for(let j=0;j<c.P.length;j+=3){ c.P[j]-=H[0]; c.P[j+1]-=H[1]; c.P[j+2]-=H[2]; } return c; }) ];
    const m=new THREE.Mesh(legGeo(S),N.me.material); m.castShadow=true; m.position.set(H[0],H[1]-BOT,H[2]); N.body.add(m); LEGS.push(m); });   // (hung at the hip; the body's geometry stands on its lowest row, so the hip's height is from there)
  TOAD.N=N; window.TOADDBG=()=>({key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),tris:N.tris,top:TOP,bot:BOT,rx:RX}); }
