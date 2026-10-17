// ---- THE SIX FIGURES (owner, 17 Oct 2026, "lets only do the new characters": the six low-poly figures from his Drive's G folder, KASA, GEKKOU,
// DRIZZEL, KURENAI, SAMIDALE and SHOGUN; each a rigged model on a Mixamo skeleton with no clips and no textures, its flat colours; baked by
// tools/figures-bake.py into data/figures.json). Each keeps the pack's bones and weights (a three.js SkinnedMesh, as the skeletons are), and is
// moved by poses made here: a bone's turn is given in the figure's own axes (x his left, y up, z his front; degrees: pitch, yaw, roll), laid
// on his rest pose, carried by the bones above it; so one set of moves fits all six. Each has his stance (the two the pack left T-posed stand
// with their arms down), a walk and a run, a breath and a look round standing, a wave back when you wave near him, a hop, and a thing of his
// own (KASA a flourish of his sword, SAMIDALE a pull on his pipe, GEKKOU and KURENAI a smoke, DRIZZEL a lean on his staff, SHOGUN a bow).
// Coloured as the packs colour them (no texture), shaded as the fish and the bear (makeNPC: tones in bands, the clothes' shadows, SELF), their
// glowing parts (a visor, a blade, a halo, a pipe's ember) lit by nothing (makeNPC's eye), so they glow in the GLOW pass.
// THE EFFECTS (owner, 17 Oct 2026, "use the sfx as references to make your own rendered fx": his Brackeys VFX bundle as the reference, the game's
// look as the rule, hard-edged blocks and no soft haze): smoke in puffs, small blocks that rise, drift, grow and go, from a pipe's bowl, a
// cigarette's end or a smoker's mouth; the sword's trail, a run of glowing blocks along the blade's way as it sweeps, gone in a moment; the dust
// of a landing, a ring of little blocks thrown out from the feet. All three one pool of blocks in two meshes (lit, and glowing), one draw each.
// They walk the whole street, the sidewalks and the road, as the skeletons do; never into a wall, the stairs, the musician or each other ----
const FIGFX={};   // (the figures' effects' tick, for the frame loop)
{ const S=FIGS, b=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)), f32=s=>new Float32Array(b(s).buffer), i16=s=>new Int16Array(b(s).buffer), u16=s=>new Uint16Array(b(s).buffer), D2R=Math.PI/180;
  const pts=M=>{ const q=i16(M.p), P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*M.sc+M.lo[i%3]; return P; };
  const geomOf=M=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pts(M),3)); g.setAttribute('color',new THREE.BufferAttribute(b(M.c),3,true)); g.setIndex(new THREE.BufferAttribute(u16(M.i),1));
    g.setAttribute('reg',new THREE.BufferAttribute(Float32Array.from(b(M.r)),1)); g.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(M.n),1));
    g.setAttribute('skinIndex',new THREE.Uint8BufferAttribute(b(M.j),4)); g.setAttribute('skinWeight',new THREE.BufferAttribute(b(M.w),4,true)); return g; };
  // the figure's rig: his bones in their rest pose, each under its parent; their bind matrices
  const rigOf=R=>{ const bones=R.names.map((n,i)=>{ const B=new THREE.Bone(); B.name=n; B.position.fromArray(R.t[i]); B.quaternion.fromArray(R.q[i]); return B; });
    R.parent.forEach((p,i)=>{ if(p>=0)bones[p].add(bones[i]); }); const ibm=f32(R.ibm); return {bones,skeleton:new THREE.Skeleton(bones,bones.map((_,i)=>new THREE.Matrix4().fromArray(ibm,i*16)))}; };
  // ---- THE POSER: a pose is {bone: [pitch, yaw, roll]} in the figure's axes (pitch about x: a hanging limb's end goes back, the head nods;
  // yaw about y; roll about z: a hanging arm's end goes out to his right), and root, his hips' lift (his units). A bone's turn is laid on its
  // rest world turn, in its parent's rest frame carried by the parent as it moves: local = inv(restW[parent]) · R(stance) · R(pose) · restW[bone]
  const Poser=(R,rig,stance)=>{ const n=R.names.length, restW=[], A=[], B=[], E=new THREE.Euler(), Q=new THREE.Quaternion(), Q2=new THREE.Quaternion(), ST=[];
    for(let i=0;i<n;i++){ const p=R.parent[i], q=rig.bones[i].quaternion; restW[i]=p>=0?restW[p].clone().multiply(q):q.clone(); A[i]=p>=0?restW[p].clone().invert():new THREE.Quaternion(); B[i]=restW[i].clone();
      const s=stance&&stance[R.names[i]]; ST[i]=s?new THREE.Quaternion().setFromEuler(E.set(s[0]*D2R,s[1]*D2R,s[2]*D2R,'ZYX')):null; }
    return P=>{ for(let i=0;i<n;i++){ const d=P[R.names[i]], s=ST[i]; if(!d&&!s){ rig.bones[i].quaternion.fromArray(R.q[i]); continue; }
        Q.copy(A[i]); if(s)Q.multiply(s); if(d){ Q2.setFromEuler(E.set(d[0]*D2R,d[1]*D2R,d[2]*D2R,'ZYX')); Q.multiply(Q2); } rig.bones[i].quaternion.copy(Q.multiply(B[i])); }
      rig.bones[0].position.y=R.t[0][1]+(P.root||0); }; };
  const sn=(a,p=0)=>Math.sin(a+p), cs=(a,p=0)=>Math.cos(a+p), up=x=>Math.max(0,x), bell=(u,a,b)=>u<a?u/a:u>b?(1-u)/(1-b):1;
  const mix=(A,B,w)=>{ const O={}; for(const k in A)O[k]=A[k]; for(const k in B){ const a=A[k], c=B[k]; O[k]=k==='root'?(a||0)*(1-w)+c*w:a?[a[0]+(c[0]-a[0])*w,a[1]+(c[1]-a[1])*w,a[2]+(c[2]-a[2])*w]:[c[0]*w,c[1]*w,c[2]*w]; } return O; };
  // ---- THE MOVES, one set for all (the arms hang: the stance brings them down first; a leg's swing forward is a pitch back of its end, so
  // negative; the knee bends on the swing; the arms counter the legs; standing he breathes, shifts, looks about; a move of T seconds, pose(u))
  const SWAY=(t,k,bones)=>{ const O={}; for(const [bn,a,f,p] of bones)O[bn]=[a*k*sn(t*f,p),0,a*.4*k*cs(t*f*.7,p)]; return O; };   // (hair, capes, tails, sleeves: a soft sway)
  const walk=(ph,run,t,X)=>{ const a=run?1.5:1, k=run?14:3, P={Hips:[k*.5,0,0],Spine:[k*.3,3*sn(ph)*a,0],Spine2:[0,2*sn(ph)*a,0],Head:[-k*.5,0,0],
      LeftUpLeg:[-30*sn(ph)*a,0,0],RightUpLeg:[30*sn(ph)*a,0,0],LeftLeg:[48*up(-sn(ph,-.6))*a,0,0],RightLeg:[48*up(sn(ph,-.6))*a,0,0],LeftFoot:[-10*sn(ph,.5)*a,0,0],RightFoot:[10*sn(ph,.5)*a,0,0],
      LeftArm:[22*sn(ph)*a,0,0],RightArm:[-22*sn(ph)*a,0,0],LeftForeArm:[-14*up(sn(ph))*a-8*(run?1:0),0,0],RightForeArm:[-14*up(-sn(ph))*a-8*(run?1:0),0,0],root:.015*Math.abs(sn(ph))*a};
    for(const bn of X.held||[]){ P[bn]=[4*sn(ph)*a,0,0]; P[bn.replace('Arm','ForeArm')]=[-6,0,0]; }   // (an arm that holds something keeps it still)
    return Object.assign(P,SWAY(t*3+ph,.6*a,X.sway)); };
  const idle=(t,X)=>Object.assign({Spine:[1.5*sn(t*1.4),0,0],Spine2:[1.5*sn(t*1.4,.5),0,0],Head:[2*sn(t*1.1,1),10*sn(t*.33),0],Hips:[0,0,1.5*sn(t*.4)],LeftArm:[0,0,2*sn(t*.9)],RightArm:[0,0,-2*sn(t*.9,1)],root:0},SWAY(t,.25,X.sway));
  const MOVES={
    wave:{T:2,pose:(u,t,X)=>{ const r=bell(u,.2,.75), s=X.waveR?-1:1; return X.waveR?{RightArm:[-20*r,0,-150*r],RightForeArm:[-30*r-25*r*sn(u*24),0,0],Head:[0,-12*r,0]}:{LeftArm:[-20*r,0,150*r],LeftForeArm:[-30*r-25*r*sn(u*24),0,0],Head:[0,12*r,0]}; }},
    jump:{T:1.1,pose:(u,t,X)=>{ const c=u<.28?u/.28:u>.78?(1-u)/.22:0, air=u>.28&&u<.78?1:0; return {Hips:[10*c,0,0],Spine:[8*c,0,0],LeftUpLeg:[-35*c-25*air,0,0],RightUpLeg:[-35*c-25*air,0,0],LeftLeg:[65*c+45*air,0,0],RightLeg:[65*c+45*air,0,0],
      LeftArm:[-25*air,0,15*c+30*air],RightArm:[-25*air,0,-15*c-30*air],root:-.09*c}; }},
    // the sword's flourish (KASA, the blade in his left hand): a wind-up, a sweep across and a cut down, back to his side; the trail follows the tip
    slash:{T:1.7,pose:(u,t)=>{ const w=bell(u,.2,.3), c=u>.3&&u<.5?(u-.3)/.2:u>=.5?1:0, d=u>.5&&u<.65?(u-.5)/.15:u>=.65?1:0, e=u>.8?(u-.8)/.2:0, k=1-e;
      return {Spine:[0,-25*w*k+20*c*k,0],Spine1:[-6*c*k,0,0],Head:[0,-15*w*k+10*c*k,0],LeftArm:[(-30*w+(-80)*c+40*d)*k,(40*w-30*c)*k,(60*w+20*c)*k],LeftForeArm:[(-40*w+10*c)*k,0,0],LeftHand:[0,0,(30*c-20*d)*k],
        RightArm:[(-15*w)*k,0,(-20*w)*k],LeftUpLeg:[-10*c*k,0,0],RightUpLeg:[12*c*k,0,0],RightLeg:[18*c*k,0,0]}; }},
    // a pull on the pipe (SAMIDALE, the pipe in his left hand): the hand to the mouth, a draw, the head back, the smoke from his mouth
    pipe:{T:3.4,pose:(u,t)=>{ const r=bell(u,.2,.6), h=u>.55&&u<.8?bell((u-.55)/.25,.3,.6):0; return {LeftArm:[-55*r,20*r,15*r],LeftForeArm:[-95*r,10*r,0],LeftHand:[-20*r,0,-30*r],Head:[-6*r-14*h,0,0],Spine:[-3*h,0,0]}; }},
    // a smoke (GEKKOU, KURENAI: what they smoke is at their lips): the head back and a long breath out
    smoke:{T:3,pose:(u,t)=>{ const h=u>.3&&u<.75?bell((u-.3)/.45,.3,.7):0; return {Head:[-16*h,6*h,0],Spine2:[-3*h,0,0],RightArm:[-40*bell(u,.15,.4),0,-10],RightForeArm:[-90*bell(u,.15,.4),0,0]}; }},
    // a lean on the staff (DRIZZEL, the staff in his right hand): both hands on it, his weight forward, a slow nod
    lean:{T:4,pose:(u,t)=>{ const r=bell(u,.2,.8); return {Spine:[10*r,0,-4*r],Spine1:[6*r,0,0],Head:[12*r+3*sn(u*12)*r,0,0],LeftArm:[-30*r,-20*r,-15*r],LeftForeArm:[-60*r,0,0],RightArm:[-5*r,0,0],LeftUpLeg:[-4*r,0,0],RightUpLeg:[6*r,0,0],RightLeg:[10*r,0,0]}; }},
    // a bow (SHOGUN): from the hips, held, and up
    bow:{T:3.2,pose:(u,t)=>{ const r=bell(u,.25,.7); return {Hips:[-6*r,0,0],Spine:[22*r,0,0],Spine1:[14*r,0,0],Spine2:[8*r,0,0],Head:[10*r,0,0],LeftArm:[-6*r,0,8*r],RightArm:[-6*r,0,-8*r],LeftForeArm:[-10*r,0,0],RightForeArm:[-10*r,0,0]}; }}};
  // ---- THE EFFECTS: one pool of blocks, lit (smoke, dust) and glowing (the blade's trail); each a place, a way, a life, a size that grows or
  // shrinks, a colour; set each frame into its mesh's instances. A puff of smoke rises slowly, drifts, grows and goes; dust flies out low and
  // settles; the trail stays put and fades by shrinking
  const FX={items:[],N:220}; { const geo=new THREE.BoxGeometry(1,1,1), lit=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}),FX.N), glow=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:false}),FX.N);
    for(const m of [lit,glow]){ m.count=0; m.frustumCulled=false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.castShadow=false; MAPG.bodega.add(m); } FX.lit=lit; FX.glow=glow;
    const M=new THREE.Matrix4(), Q=new THREE.Quaternion(), V=new THREE.Vector3(), C=new THREE.Color();
    FX.add=o=>{ if(FX.items.length>=FX.N*2)FX.items.shift(); FX.items.push(Object.assign({t:0,spin:Math.random()*6},o)); };
    FX.step=dt=>{ let nl=0, ng=0; for(const o of FX.items){ o.t+=dt; if(o.t>=o.life)continue; const u=o.t/o.life; o.x+=o.vx*dt; o.y+=o.vy*dt; o.z+=o.vz*dt; if(o.gravity){ o.vy-=o.gravity*dt; if(o.y<o.floor){ o.y=o.floor; o.vx*=.6; o.vz*=.6; o.vy=0; } }
        if(o.drag){ const k=Math.max(0,1-o.drag*dt); o.vx*=k; o.vz*=k; } const s=o.size(u); if(s<=.002)continue; const m=o.glow?FX.glow:FX.lit, i=o.glow?ng++:nl++; if(i>=FX.N)continue;
        Q.setFromAxisAngle(V.set(0,1,0),o.spin+o.t*o.turn); M.compose(V.set(o.x,o.y,o.z),Q,V.set(s,s,s)); m.setMatrixAt(i,M); m.setColorAt(i,C.setRGB(...o.col(u))); }
      FX.items=FX.items.filter(o=>o.t<o.life); for(const [m,c] of [[FX.lit,nl],[FX.glow,ng]]){ m.count=c; m.instanceMatrix.needsUpdate=true; if(m.instanceColor)m.instanceColor.needsUpdate=true; } };
    // a puff: from a point, up and a little away, growing, grey to pale, in a wobble; k: how big (1: a pipe's thin curl; 3: a breath out)
    FX.puff=(x,y,z,k,wind)=>{ const a=Math.random()*6.28, r=.05+.08*Math.random(); FX.add({x:x+(Math.random()-.5)*.03,y,z:z+(Math.random()-.5)*.03,vx:Math.cos(a)*r+(wind?wind.x:0),vy:.18+.14*Math.random(),vz:Math.sin(a)*r+(wind?wind.z:0),drag:.6,turn:.8,life:1.8+Math.random()*1.4*k,
      size:u=>(.035+.06*k*Math.min(1,u*2.5))*(u>.7?(1-u)/.3:1)*TILE/.84,col:u=>{ const g=.62+.3*u; return [g,g,g*1.03]; }}); };
    // the landing's dust: a ring of bits thrown out from the feet, settling at once
    FX.dust=(x,y,z,R)=>{ for(let i=0;i<9;i++){ const a=i/9*6.28+Math.random()*.5, v=(1.2+Math.random()*.8)*TILE; FX.add({x:x+Math.cos(a)*R*.5,y:y+.02,z:z+Math.sin(a)*R*.5,vx:Math.cos(a)*v,vy:.5*TILE,vz:Math.sin(a)*v,gravity:9,floor:y+.02,drag:3,turn:3,life:.5+Math.random()*.25,
        size:u=>.045*(1-u)*TILE/.84,col:()=>[.55,.5,.42]}); } };
    // the blade's trail: blocks laid from where the tip was to where it is, glowing, shrinking away
    FX.trail=(a,c,col)=>{ const d=a.distanceTo(c), n=Math.max(1,Math.ceil(d/(.04*TILE))); for(let i=0;i<n;i++){ const u=(i+.5)/n; FX.add({x:a.x+(c.x-a.x)*u,y:a.y+(c.y-a.y)*u,z:a.z+(c.z-a.z)*u,vx:0,vy:0,vz:0,turn:0,life:.32,glow:true,size:u=>.05*(1-u)*TILE/.84,col:u=>[col[0]*(1-u*.5)+u*.5,col[1]*(1-u*.5)+u*.5,col[2]]}); } }; }
  // ---- THE STREET, all of it (the skeletons' lane), where they may stand
  const LANE={x0:BOD.XS(BOD.MAP.x0+2),x1:BOD.XS(BOD.MAP.x1-2),z0:BOD.ZS(-76.3),z1:BOD.ZS(-61.2)}, HOLE=[BOD.XS(MAPSTAIR.x0-.6),BOD.ZS(MAPSTAIR.y0),BOD.XS(MAPSTAIR.x1+.6),BOD.ZS(MAPSTAIR.y1+.6)],
    free=(x,z,R)=>!(x>HOLE[0]-R&&x<HOLE[2]+R&&z>HOLE[1]-R&&z<HOLE[3]+R)&&!SOL.up.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R);
  const YS=ZU*24/TILE, V1=new THREE.Vector3(), V2=new THREE.Vector3();
  // ---- EACH FIGURE: key, name, height in metres, where he starts (bodega tiles), his pace, his glow's colour, his stance, his own move and its
  // part (which bone the smoke comes from, which the blade's tip is), what sways on him, which arm holds a thing, which hand waves
  const CH=[
    ['KASA','KASA',1.85,[57,-74],.5,'1.,.25,.2',{},'slash',{tip:'Katana_Bend_002',held:['LeftArm'],sway:[['Tail_001',14,1.3,0],['Tail_003',16,1.3,1],['Tail_005',18,1.3,2],['Tail_007',20,1.3,3],['Cape_Spine',5,1.1,0],['Cape_Side_L',6,1.2,.5],['Cape_Side_R',6,1.2,1.5],['Tissue_A',10,2.1,0],['Tissue_B',10,2.3,1]],waveR:true}],
    ['GEKKOU','GEKKOU',1.78,[66,-63],.55,'.45,.9,1.',{LeftArm:[0,0,-78],RightArm:[0,0,78],LeftShoulder:[0,0,-4],RightShoulder:[0,0,4]},'smoke',{smoke:'Smoke',sway:[['Hair_002',8,1.4,0],['Hair_005',10,1.4,1],['Hair_008',12,1.4,2],['Sleeve_L',8,1.6,0],['Sleeve_R',8,1.6,1],['Tissue',10,2,0]]}],
    ['DRIZZEL','DRIZZEL',1.8,[75,-75],.38,'1.,.6,.2',{},'lean',{held:['RightArm'],sway:[['Veil',6,1.2,0],['Veil_002',8,1.2,1]]}],
    ['KURENAI','KURENAI',1.72,[88,-62.5],.5,'1.,.3,.3',{},'smoke',{smoke:'Smoke',sway:[['Cape_Spine',5,1.1,0],['Cape_Spine_001',7,1.1,1],['Tissue_L',10,2,0],['Tissue_R',10,2,1]],waveR:true}],
    ['SAMIDALE','SAMIDALE',1.62,[97,-74.5],.45,'1.,.55,.15',{},'pipe',{smoke:'Smoke_mouth',held:['LeftArm'],sway:[['Cape_Spine_002',5,1.1,0],['Cape_Side_L',6,1.2,.5],['Cape_Side_R',6,1.2,1.5],['Pipe_Ribon',12,2,0]],waveR:true}],
    ['SHOGUN','SHOGUN',1.66,[103,-66],.42,'1.,.3,.25',{LeftArm:[0,0,-76],RightArm:[0,0,76],LeftShoulder:[0,0,-3],RightShoulder:[0,0,3]},'bow',{sway:[['Tissue_A',8,2,0],['Tissue_A_002',10,2,1]]}]];
  const FIGURES=[]; window.FIGURES=FIGURES;   // (a test's look)
  for(const [key,name,metres,[tx,tz],speed,eyeC,stance,own,X] of CH){ const M=S[key], rig=rigOf(M.rig), pose=Poser(M.rig,rig,stance), BN={}; rig.bones.forEach(B=>BN[B.name]=B);
    const st2={t:Math.random()*10,ph:Math.random()*6,move:null,wait:3+Math.random()*4,waved:-9,look:0,lookTo:0,vy:0,lift:0,ember:0,tip:null};
    const N=makeNPC(null,{key,name,names:M.parts,lv:'up',group:'bodega',geo:geomOf(M),skin:rig,tall:M.tall,eye:M.eye,eyeC,rank:M.parts.map(p=>/Cape|Cloth|coat|Hat|Veil/.test(p)?2:0),
      metres,x:BOD.XS(tx),z:BOD.ZS(tz),lane:LANE,free,ground:(x,z)=>MODS.bodega.ground(x,z),radius:.28,speed,stride:0,rock:0,bob:0,
      anim:(dt,moving,st,sc)=>{ const s2=st2; s2.t+=dt; const run=moving&&st.v>1.2*TILE; s2.ph+=dt*(moving?Math.PI*st.v/(.45*sc):0);   // (a step .45 of his metres; a cycle two steps)
        // what he does standing: a wave back when you wave near, else now and then his own thing, or a hop
        const you=pos, dx=you.x-st.x, dz=you.z-st.z, near=Math.hypot(dx,dz)<3.5*TILE;
        if(s2.move){ s2.move.t+=dt; if(s2.move.t>=s2.move.T)s2.move=null; }
        if(!s2.move&&!moving){ if(near&&typeof W3!=='undefined'&&st.move&&st.move.name==='wave'&&s2.t-s2.waved>5){ s2.waved=s2.t; act('wave'); }
          else if((s2.wait-=dt)<=0){ s2.wait=4+Math.random()*7; const u=Math.random(); if(near&&u<.3)act('wave'); else if(u<.5)act('jump'); else act(own); } }
        if(s2.move&&moving&&s2.move.name!=='wave')s2.move=null;   // (he walks off: the move drops)
        s2.lookTo=near&&!moving&&!s2.move?Math.max(-.7,Math.min(.7,((Math.atan2(dx,dz)-st.h+Math.PI*3)%(Math.PI*2))-Math.PI)):0; s2.look+=(s2.lookTo-s2.look)*Math.min(1,dt*3);
        let P=moving?walk(s2.ph,run,s2.t,X):idle(s2.t,X); if(s2.move){ const u=s2.move.t/s2.move.T, w=Math.max(0,Math.min(1,u/.15,(1-u)/.15)); P=mix(P,s2.move.pose(u,s2.t,X),w); }
        if(s2.look){ const h=P.Head||[0,0,0]; P.Head=[h[0],h[1]+s2.look/D2R,h[2]]; }
        // the hop: a real rise off the ground as the move's crouch ends, down again under gravity
        if(s2.move&&s2.move.name==='jump'&&!s2.move.done&&s2.move.t>s2.move.T*.28){ s2.move.done=true; s2.vy=3.6; }
        if(s2.vy||s2.lift>0){ s2.vy-=10*dt; s2.lift=Math.max(0,s2.lift+s2.vy*dt); if(s2.lift<=0&&s2.vy<0){ s2.vy=0; FX.dust(st.x,N.g.position.y,st.z,st.R); } }
        pose(P); N.body.position.y=s2.lift*YS;
        // the smoke: a thin curl from a lit pipe or cigarette while he stands, a breath out during his smoke; the blade's trail during the flourish
        if(X.smoke){ const bn=BN[X.smoke]||BN.Head, m=s2.move&&(s2.move.name==='smoke'||s2.move.name==='pipe')?s2.move:null, out=m&&m.t/m.T>.55&&m.t/m.T<.8;
          s2.ember+=dt*(out?12:moving?0:.9); if(s2.ember>=1){ s2.ember-=1; bn.getWorldPosition(V1); if(X.smoke==='Smoke_mouth'){ BN.Head.getWorldPosition(V1); V1.y+=.04*N.H; V1.x+=Math.sin(st.h)*.12*TILE; V1.z+=Math.cos(st.h)*.12*TILE; }
            FX.puff(V1.x,V1.y,V1.z,out?2.6:1,{x:Math.sin(st.h)*.1,z:Math.cos(st.h)*.1}); } }
        if(X.tip&&s2.move&&s2.move.name==='slash'){ const u=s2.move.t/s2.move.T; BN[X.tip].getWorldPosition(V2); if(u>.3&&u<.66&&s2.tip)FX.trail(s2.tip,V2,[.8,.95,1]); s2.tip=(s2.tip||new THREE.Vector3()).copy(V2); } else s2.tip=null; }});
    const act=n=>{ const Mv=MOVES[n]; if(!Mv||st2.move)return; st2.move={name:n,t:0,T:Mv.T,pose:Mv.pose,done:false}; };
    N.act=act; N.fig=st2; FIGURES.push(N); }
  let fireT=0; FIGFX.tick=(dt,you)=>{ FX.step(dt); if(typeof PARK!=='undefined'){ PARK.tick(you);
      // the park's campfire: a curl of smoke now and then, its light a flicker
      if(PARK.fire&&MAPG.park.visible){ fireT+=dt; if(fireT>.3){ fireT-=.3; FX.puff(PARK.fire.x,PARK.fire.y,PARK.fire.z,1.6,{x:.05,z:.03}); } PARK.fireL.intensity=3.2+Math.sin(performance.now()*.021)*.6+Math.sin(performance.now()*.0073)*.5; } } };   // (each frame, from the loop: the effects, and the park's cut of the trees before you)
  window.FIGDBG=()=>FIGURES.map(N=>({key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),to:!!N.st.to,wait:+N.st.wait.toFixed(1),move:N.fig.move&&N.fig.move.name,lift:+N.fig.lift.toFixed(2),fx:FX.items.length})); window.FIGFREE=free; }
