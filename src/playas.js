// ---- YOU AS THE MANNEQUIN (owner, 17 Oct 2026: "let me play as the animation model we are using as a framework", "lets make that the main
// avatar and i will sculpt it how i want"): the UAL animation library's standard body (data/ual.json, the droids' body in its own colours)
// is you now. The game's rig still runs you (your keys, your moves, the physics, the camera); the mannequin stands where you stand, turned as
// you are, and plays its own clips for what you're doing: standing, walking, jogging, sprinting (by your speed), in the air, a punch, a roll,
// falling, sitting, swimming. ?avatar=walker (or GRAPHICS' AVATAR) the Walker as before. Cost: 6,872 triangles, one draw, his own shadow ----
const PLAYAS={on:false}; window.PLAYAS=PLAYAS;
{ const q=QS.get('avatar'); let v=null; try{ v=localStorage.getItem('market-avatarpick'); }catch(e){} PLAYAS.on=(q||v||'walker')==='mannequin';   // (the Walker, MALE or FEMALE, by default again: owner, 18 Oct 2026, "i want to switch back to the regular avatar that has man and woman, make that the default"; ?avatar=mannequin or GRAPHICS' AVATAR the mannequin)
  const K=window.UALK;
  // HIM AS A MAN, DRESSED IN ITEMS (owner, 17 Oct 2026: "make him look human, shoes, blue jeans, real color skin, hair, (no face) shirt";
  // then "lets make his base model no clothes just underwear, and then put jeans and shoes and hair on him as sep items"): the base body is
  // skin all over with plain briefs (no face); each item a mesh of its own, made from the body itself: the faces of the part it covers, pushed
  // out along the body's surface by the cloth's thickness (the hair more at the crown), bent by the same bones (the same weights), so it moves
  // as he does and can be put on, taken off and coloured alone (PLAYAS.wear, PLAYAS.colour; GRAPHICS' row of them). What a point is: the bone it
  // follows most, and where it sits along that bone
  PLAYAS.COL={skin:[222,180,150],briefs:[64,64,74],hair:[78,58,48],shirt:[156,152,115],jeans:[58,86,128],shoes:[70,52,40]};
  const region=(geo,R)=>{ const P=geo.attributes.position.array, SI=geo.attributes.skinIndex.array, SW=geo.attributes.skinWeight.array, n=P.length/3, N=R.names;
    const ibm=new Float32Array(Uint8Array.from(atob(R.ibm),c=>c.charCodeAt(0)).buffer), J=N.map((_,i)=>new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().fromArray(ibm,i*16).invert()));
    const B=n=>N.indexOf(n), dom=new Int32Array(n);
    for(let i=0;i<n;i++){ let b=0,w=-1; for(let k=0;k<4;k++){ const ww=SW[i*4+k]; if(ww>w){ w=ww; b=SI[i*4+k]; } } dom[i]=b; }
    const H=B('Head'); let y0=1e9,y1=-1e9,z0=1e9,z1=-1e9; for(let i=0;i<n;i++)if(dom[i]===H){ y0=Math.min(y0,P[i*3+1]); y1=Math.max(y1,P[i*3+1]); z0=Math.min(z0,P[i*3+2]); z1=Math.max(z1,P[i*3+2]); }
    const along=(i,a,b)=>{ const A=J[a], V=new THREE.Vector3().subVectors(J[b],A), l2=V.lengthSq()||1; return ((P[i*3]-A.x)*V.x+(P[i*3+1]-A.y)*V.y+(P[i*3+2]-A.z)*V.z)/l2; };
    const T=new Array(n), crown=new Float32Array(n), Ty=J[B('thigh_l')].y;
    for(let i=0;i<n;i++){ const nm=N[dom[i]], y=P[i*3+1], z=P[i*3+2]; const t=new Set();
      if(nm==='Head'){ const u=(y-y0)/((y1-y0)||1), back=(z1-z)/((z1-z0)||1); if(u>.6||(back>.6&&u>.16)||(back>.48&&u>.4)){ t.add('hair'); crown[i]=Math.max(0,(u-.55)/.45); } }
      if(/^spine|^clavicle/.test(nm))t.add('shirt');
      if(/^upperarm/.test(nm)){ const sd=nm.slice(-1); if(along(i,B('upperarm_'+sd),B('lowerarm_'+sd))<.55)t.add('shirt'); }
      if(nm==='pelvis'||/^thigh|^calf/.test(nm)){ if(!(/^calf/.test(nm)&&y<.1))t.add('jeans'); if(nm==='pelvis'||(/^thigh/.test(nm)&&y>Ty-.13))t.add('briefs'); if(nm==='pelvis'&&y>Ty+.12)t.add('shirt'); }
      if(/^foot|^ball/.test(nm)||(/^calf/.test(nm)&&y<.12))t.add('shoes');
      T[i]=t; }
    return {T,crown}; };
  // the base: skin, the briefs
  const paintBase=(geo,RG)=>{ const C=geo.attributes.color.array, K_=PLAYAS.COL; for(let i=0;i<RG.T.length;i++){ const c=RG.T[i].has('briefs')?K_.briefs:K_.skin; C[i*3]=c[0]; C[i*3+1]=c[1]; C[i*3+2]=c[2]; } geo.attributes.color.needsUpdate=true; };
  // an item: the body's faces whose three corners are all in its part, their own copy, pushed out along the surface by its thickness
  const THICK={hair:[.012,.03],shirt:[.012,0],jeans:[.009,0],shoes:[.014,0]};
  const itemGeo=(geo,RG,name)=>{ const P=geo.attributes.position.array, I=geo.index.array, nb=geo.clone(); nb.computeVertexNormals(); const Nn=nb.attributes.normal.array, map=new Map(), idx=[];
    for(let f=0;f<I.length;f+=3){ const a=I[f],b=I[f+1],c=I[f+2]; if((RG.T[a].has(name)?1:0)+(RG.T[b].has(name)?1:0)+(RG.T[c].has(name)?1:0)>=2){   /* (two corners of three in its part: no seams where the parts meet) */ for(const v of [a,b,c]){ if(!map.has(v))map.set(v,map.size); idx.push(map.get(v)); } } }
    const m=map.size, g=new THREE.BufferGeometry(), pos=new Float32Array(m*3), col=new Uint8Array(m*3), si=new Uint8Array(m*4), sw=new Uint8Array(m*4), SI=geo.attributes.skinIndex.array, SW=geo.attributes.skinWeight.array, [t0,t1]=THICK[name], K_=PLAYAS.COL[name];
    const swN=geo.attributes.skinWeight.normalized, SWa=geo.attributes.skinWeight.array;
    for(const [v,k] of map){ const o=t0+t1*RG.crown[v]; for(let d=0;d<3;d++){ pos[k*3+d]=P[v*3+d]+Nn[v*3+d]*o; col[k*3+d]=K_[d]; } for(let d=0;d<4;d++){ si[k*4+d]=SI[v*4+d]; sw[k*4+d]=SWa[v*4+d]; } }
    g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3,true)); g.setAttribute('skinIndex',new THREE.Uint8BufferAttribute(si,4)); g.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4,true));
    g.setAttribute('reg',new THREE.BufferAttribute(new Float32Array(m),1)); g.setAttribute('sh',new THREE.BufferAttribute(new Float32Array(m),1)); g.setAttribute('fab',new THREE.BufferAttribute(new Float32Array(m).fill(name==='jeans'?1:0),1));   // (the jeans woven as denim: npc-map.js's twill)
    g.setIndex(idx); g.computeVertexNormals(); return g; };
  if(K){ const geo=K.geomOf(K.D.mesh), RG=region(geo,K.D.rig); paintBase(geo,RG); const rig=K.rigOf(K.D.rig), mixer=new THREE.AnimationMixer(rig.bones[0]), an=K.Anim(mixer);
    const N=makeNPC(null,{key:'me',name:'YOU',names:K.D.mesh.parts,eye:-1,lv:'up',group:'bodega',geo,skin:rig,tall:K.D.tall,rank:K.D.mesh.parts.map(()=>0),metres:1.85*(W3.SZ||1),x:pos.x,z:pos.z,radius:.3,speed:0,stride:0,rock:0,bob:0});
    NPCS.splice(NPCS.indexOf(N),1);   // (not a character of the street: nothing moves him but you)
    MAPG.bodega.remove(N.g); scene.add(N.g);   // (with you on every level and in every room)
    PLAYAS.N=N; PLAYAS.an=an;
    // the items, worn: each its own skinned mesh on his bones, beside his body (and drawn with his body's own material, as it changes)
    PLAYAS.items={}; let wear={hair:1,shirt:1,jeans:1,shoes:1}; try{ Object.assign(wear,JSON.parse(localStorage.getItem('market-wear')||'{}')); }catch(e){}
    for(const name of ['jeans','shoes','shirt','hair']){ const ig=itemGeo(geo,RG,name), me=new THREE.SkinnedMesh(ig,N.me.material); me.frustumCulled=false; me.castShadow=me.receiveShadow=true; N.body.add(me); me.bind(rig.skeleton,N.me.bindMatrix); me.visible=!!wear[name]; me.name=name; PLAYAS.items[name]=me; }
    // the body's own faces under what he wears aren't drawn (nothing of him pokes through: his joints' rings); taken off, they're back
    const I0=geo.index.array.slice(), cover=()=>{ const on=Object.keys(PLAYAS.items).filter(k=>PLAYAS.items[k].visible), keep=[];
      for(let f=0;f<I0.length;f+=3){ const a=I0[f],b=I0[f+1],c=I0[f+2]; if(!on.some(k=>(RG.T[a].has(k)?1:0)+(RG.T[b].has(k)?1:0)+(RG.T[c].has(k)?1:0)>=2))keep.push(a,b,c); }
      geo.setIndex(keep); };
    PLAYAS.wear=(name,on)=>{ const me=PLAYAS.items[name]; if(!me)return; me.visible=on==null?!me.visible:!!on; wear[name]=me.visible?1:0; cover(); try{ localStorage.setItem('market-wear',JSON.stringify(wear)); }catch(e){} };
    cover();
    PLAYAS.colour=(name,rgb)=>{ const me=PLAYAS.items[name]; if(!me)return; const c=me.geometry.attributes.color; for(let i=0;i<c.count;i++)c.setXYZ(i,rgb[0],rgb[1],rgb[2]); c.needsUpdate=true; PLAYAS.COL[name]=rgb; };
    // the rig's move to his clip
    const MOVE={jump:'Jump_Loop',backflip:'Jump_Loop',frontflip:'Jump_Loop',jab:'Punch_Jab',cross:'Punch_Cross',hook:'Punch_Cross',uppercut:'Punch_Cross',slap:'Punch_Jab',
      frontKick:'Punch_Cross',roundhouse:'Punch_Cross',legSweep:'Crouch_Idle_Loop',fall:'Death01',roll:'Roll',block:'Spell_Simple_Idle_Loop',guard:'Spell_Simple_Idle_Loop',crouch:'Crouch_Idle_Loop',flinch:'Hit_Chest',wave:'Interact'};
    const M=TILE/.84;   // (world units a metre)
    let lx=pos.x, lz=pos.z, sp=0;
    PLAYAS.tick=(dt,B)=>{ const g=N.g, first=typeof UI!=='undefined'&&UI.view==='first';
      g.visible=PLAYAS.on&&!first&&!W3.hideMeQ; W3.hideMe=PLAYAS.on||W3.hideMeQ; if(!PLAYAS.on){ W3.group.traverse(o=>{ if(o.isMesh&&!W3.hideMeQ)o.visible=true; }); return; }
      for(const k in PLAYAS.items){ const me=PLAYAS.items[k]; if(me.material!==N.me.material)me.material=N.me.material; }   // (the items drawn as his body is: LAMPS or FLAT)
      if(!dt)return;
      const d=Math.hypot(pos.x-lx,pos.z-lz)/M/dt; lx=pos.x; lz=pos.z; sp+=(Math.min(d,9)-sp)*Math.min(1,dt*8);   // (his speed, metres a second, smoothed)
      PLAYAS.nimble(dt); let lift=nb.lift; const mv=st.move&&st.move.name;
      if(nb.state==='ground'&&mv&&/jump|flip/.test(mv)&&B&&B.J&&B.J.pelvis)lift=Math.max(0,B.J.pelvis.y-18)*ZU*(W3.SZ||1)*(W3.BH||1);
      g.position.set(pos.x,py+lift,pos.z); g.rotation.set(nb.state==='swing'?-(nb.tilt||0):0,RAG.on?RAG.hd:heading,0,'YXZ');
      let base='Idle_Loop', ts=1;
      if(RAG.on)base='Death01';
      else if(st.water&&st.water.in)base=sp>.3?'Swim_Fwd_Loop':'Swim_Idle_Loop';
      else if(st.sit)base='Sitting_Idle_Loop';
      else if(PLAYAS.nb&&PLAYAS.nb.clip){ base=PLAYAS.nb.clip; ts=PLAYAS.nb.ts||1; }
      else if(mv&&MOVE[mv])base=MOVE[mv];
      else if(st.up&&MOVE[st.up.name])base=MOVE[st.up.name];   /* (the punches: the rig's upper-body layer) */
      else if(sp>.25){ const sk=(st.wk||1)+((st.rk||1)-(st.wk||1))*st.run, sn=sp/sk;   /* (the clip by his pace as it would be at his own speeds: walking faster is still a walk, its clip quicker) */
        if(sn>3.6){ base='Sprint_Loop'; ts=sp/5; } else if(sn>2){ base='Jog_Fwd_Loop'; ts=sp/3.2; } else { base='Walk_Loop'; ts=sp/1.4; } }
      const ak=st.anim||1; an.base=base; an.ts=Math.max(.2,Math.min(4,ts*ak)); an.update(dt*(base==='Idle_Loop'||an.once?ak:1));   /* (the animation's speed: the loops by their pace times it, the moves and the idle by it alone) */
      PLAYAS.relax(dt,base==='Idle_Loop'&&!an.once&&!RAG.on); if(PLAYAS.nb&&PLAYAS.nb.arms)PLAYAS.armsUp(); };
    // ---- NIMBLE (owner, 17 Oct 2026: "lets make him super nimble, he can run jump roll grab things and swing, full actionable and fun to
    // play"): over the rig's own walking and moves, a layer of his own: he runs a third faster (PLAYAS.K, on the rig's stride); Space is his
    // jump (higher than the rig's, carrying his run); in the air he catches what's in reach of his hands: a bar (the playground's in the park,
    // PLAYAS.grabs) to hang and swing from (W / S pump, A / D along the bar, Space lets go with the swing's speed: from bar to bar), or a ledge
    // (the top of a wall, a fence, a counter: the level's solid boxes) to hang from (Space vaults over to the far side, S drops); a low thing in
    // his way, run at with Space, he vaults outright. The camera stays on the ground; his height is his own (lift). Roll (Y), punches (J),
    // kick (K) as the rig has them
    PLAYAS.K=1.35;
    const MX=TILE/.84, Hm=1.85*(W3.SZ||1), HY=N.H*ZU*24/TILE, MY=HY/Hm, G=9.8*MY, JV=Math.sqrt(2*9.8*1.6)*MY;   // (MX, MY: world units a metre across and up; HY his height up)
    const nb={state:'ground',lift:0,vy:0,vx:0,vz:0,t:0,clip:null,arms:false}; PLAYAS.nb=nb;
    const V=THREE.Vector3, fwd=()=>new V(Math.sin(heading),0,Math.cos(heading));
    const solidAt=(x,z)=>!!CLIP.hit(SOL[LVL]||SOL.up,x,z,.3*TILE);
    // the bars: a playground just inside the park's wall, west of the gate (posts solid, bars to catch)
    PLAYAS.grabs=[];
    { const gx=BOD.XS(PARK.gate[0]+PARK.ox-9), gz=BOD.ZS(PARK.y0+PARK.oy+4.5), y0=MODS.bodega.ground(gx,gz), BL=[], blk=(x,y,z,sx,sy,sz,c)=>BL.push([x,y,z,sx,sy,sz,c]), T=TILE, post=.09*T, MET=0x3a6a8a, RUNG=0xb8bcc0;
      const bar=(x0,z0,x1,z1,y)=>{ PLAYAS.grabs.push({a:new V(x0,y,z0),b:new V(x1,y,z1)}); const dx=x1-x0, dz=z1-z0, l=Math.hypot(dx,dz); blk((x0+x1)/2,y,(z0+z1)/2,Math.abs(dx)>Math.abs(dz)?l:.06*T,.06*T,Math.abs(dx)>Math.abs(dz)?.06*T:l,RUNG); };
      const pole=(x,z,h)=>{ blk(x,y0+h/2,z,post,h,post,MET); SOL.up.push([x-post,z-post,x+post,z+post]); FIX.up.push([x-post,z-post,y0,x+post,z+post,y0+h]); };
      // the monkey bars: two rails 6 tiles long, a rung every 0.8 tile
      const mh=y0+HY*1.33, mx=gx, mz0=gz, mz1=gz+6*T, w=.9*T;
      for(const s of [-1,1]){ pole(mx+s*w/2,mz0,mh-y0); pole(mx+s*w/2,mz1,mh-y0); blk(mx+s*w/2,mh+.04*T,(mz0+mz1)/2,.07*T,.07*T,mz1-mz0,MET); }
      for(let z=mz0+.4*T;z<mz1-.2*T;z+=.8*T)bar(mx-w/2,z,mx+w/2,z,mh);
      // the high bar, and a lower one, side by side
      for(const [ox,hk] of [[-3.2,1.42],[-5.2,1.22]]){ const hx=gx+ox*T, hy=y0+HY*hk; pole(hx,gz+1.5*T,hy-y0); pole(hx,gz+3.5*T,hy-y0); bar(hx,gz+1.5*T,hx,gz+3.5*T,hy); }
      const me=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial(),BL.length), m4=new THREE.Matrix4(), c=new THREE.Color(), q=new THREE.Quaternion();
      BL.forEach(([x,y,z,sx,sy,sz,col],i)=>{ me.setMatrixAt(i,m4.compose(new V(x,y,z),q,new V(sx,sy,sz))); me.setColorAt(i,c.setHex(col)); }); me.castShadow=me.receiveShadow=true; MAPG.park?MAPG.park.add(me):scene.add(me); PLAYAS.playground={x:gx,z:gz}; }
    // the arms up over his head (hanging): each arm bone turned so its next bone is straight up from it, after his clip has posed him
    const UP=new V(0,1,0), wq=new THREE.Quaternion(), pq=new THREE.Quaternion(), dq=new THREE.Quaternion(), A=new V(), B2=new V();
    const bone=n=>rig.bones[K.D.rig.names.indexOf(n)], aim=(b,c,dir)=>{ b.getWorldPosition(A); c.getWorldPosition(B2); const cur=B2.sub(A).normalize(); dq.setFromUnitVectors(cur,dir); b.getWorldQuaternion(wq); b.parent.getWorldQuaternion(pq); b.quaternion.copy(pq.invert().multiply(dq.multiply(wq))); b.updateMatrixWorld(true); };
    PLAYAS.armsUp=()=>{ N.g.updateMatrixWorld(true); for(const s of ['l','r']){ aim(bone('upperarm_'+s),bone('lowerarm_'+s),UP); aim(bone('lowerarm_'+s),bone('hand_'+s),UP); } };
    // what his hands can catch, in the air: a bar, or a ledge
    const hands=()=>py+nb.lift+HY*1.12;
    const catchBar=()=>{ const hy=hands(); let best=null; for(const G_ of PLAYAS.grabs){ const ab=new V().subVectors(G_.b,G_.a), l2=ab.x*ab.x+ab.z*ab.z, t=Math.max(0,Math.min(1,((pos.x-G_.a.x)*ab.x+(pos.z-G_.a.z)*ab.z)/l2)), px=G_.a.x+ab.x*t, pz=G_.a.z+ab.z*t, d=Math.hypot(pos.x-px,pos.z-pz);
        if(d<.45*TILE&&Math.abs(hy-G_.a.y)<HY*.22&&(!best||d<best.d))best={G:G_,t,d,p:new V(px,G_.a.y,pz)}; } return best; };
    const catchLedge=()=>{ const hy=hands(), f=fwd(); for(const b of FIX[LVL]||FIX.up){ const top=b[5], gy=MODS.bodega.ground((b[0]+b[3])/2,(b[1]+b[4])/2); if(top-gy<HY*.45||top-gy>HY*1.7)continue; if(Math.max(b[3]-b[0],b[4]-b[1])<.35*TILE)continue;   /* (a post or a pole is no ledge) */ if(hy<top-HY*.3||hy>top+HY*.3)continue;
        const nx=Math.max(b[0],Math.min(b[3],pos.x)), nz=Math.max(b[1],Math.min(b[4],pos.z)), dx=nx-pos.x, dz=nz-pos.z, d=Math.hypot(dx,dz); if(d>.6*TILE||d<1e-4||(dx*f.x+dz*f.z)/d<.5)continue;
        return {b,top,n:new V(dx/d,0,dz/d),at:new V(nx-dx/d*.32*TILE,top,nz-dz/d*.32*TILE)}; } return null; };
    const over=L=>{ const b=L.b, n=L.n; let t=0; for(let k=.3;k<4.5;k+=.15){ const x=L.at.x+n.x*k*TILE, z=L.at.z+n.z*k*TILE; if(x<b[0]-.3*TILE||x>b[3]+.3*TILE||z<b[1]-.3*TILE||z>b[4]+.3*TILE){ if(!solidAt(x,z)){ t=k; break; } } } return t?new V(L.at.x+n.x*(t+.2)*TILE,0,L.at.z+n.z*(t+.2)*TILE):null; };
    const jump=()=>{ if(st.water&&st.water.in)return false;
      if(nb.state==='swing'){ const v=nb.w*1.25, c=Math.cos(nb.th), s_=Math.sin(nb.th); nb.vx=nb.n.x*c*v*MX; nb.vz=nb.n.z*c*v*MX; nb.vy=(Math.max(0,s_*v*Math.sign(nb.w||1))+2.2)*MY; heading=Math.atan2(nb.n.x*Math.sign(nb.w||1),nb.n.z*Math.sign(nb.w||1)); nb.state='air'; nb.t=0; nb.cool=.35; return true; }
      if(nb.state==='ledge'){ const to=over(nb.L); if(to){ nb.state='vault'; nb.t=0; nb.from=new V(pos.x,0,pos.z); nb.to=to; nb.top=nb.L.top; } else { nb.state='air'; nb.vy=0; } return true; }
      if(nb.state!=='ground')return true;
      const L=catchLowVault(); if(L){ nb.state='vault'; nb.t=0; nb.from=new V(pos.x,0,pos.z); nb.to=L.to; nb.top=L.top; return true; }
      const f=fwd(), v=sp*MX*(sp>3?.45:.2); nb.state='air'; nb.t=0; nb.vy=JV; nb.vx=f.x*v; nb.vz=f.z*v; return true; };
    const catchLowVault=()=>{ if(sp<1.2)return null; const f=fwd(); for(const b of FIX[LVL]||FIX.up){ const top=b[5], gy=MODS.bodega.ground((b[0]+b[3])/2,(b[1]+b[4])/2); if(top-gy>HY*.55||top-gy<HY*.12)continue;
        const nx=Math.max(b[0],Math.min(b[3],pos.x)), nz=Math.max(b[1],Math.min(b[4],pos.z)), dx=nx-pos.x, dz=nz-pos.z, d=Math.hypot(dx,dz); if(d>.9*TILE||d<1e-4||(dx*f.x+dz*f.z)/d<.6)continue;
        const L={b,top,n:new V(dx/d,0,dz/d),at:new V(pos.x,top,pos.z)}, to=over(L); if(to)return {to,top}; } return null; };
    addEventListener('keydown',e=>{ if(!PLAYAS.on||e.key!==' '||e.repeat||UI.menuOpen||UI.freeCam||UI.fly||(typeof ED!=='undefined'&&ED.on)||(typeof MAPED!=='undefined'&&MAPED.on)||RAG.on)return; if(e.target&&/^(TEXTAREA|INPUT|SELECT)$/.test(e.target.tagName))return;
      if(jump()){ e.stopImmediatePropagation(); e.preventDefault(); } },true);
    // each frame, after the rig has walked him: his own height and what he's holding
    PLAYAS.nimble=dt=>{ nb.clip=null; nb.arms=false; nb.cool=Math.max(0,(nb.cool||0)-dt); const k=n=>typeof keys!=='undefined'&&keys.has(n);
      if(nb.state==='air'){ nb.t+=dt; pos.x+=nb.vx*dt; pos.z+=nb.vz*dt; collide(pos); const dk=Math.max(0,1-dt*.8); nb.vx*=dk; nb.vz*=dk;
        nb.vy-=G*dt; nb.lift+=nb.vy*dt; nb.clip=nb.t<.18&&nb.vy>0?'Jump_Start':'Jump_Loop';
        if(!nb.cool){ const c=catchBar(); if(c){ const ab=new V().subVectors(c.G.b,c.G.a); ab.y=0; ab.normalize(); let n=new V(-ab.z,0,ab.x); if(n.dot(fwd())<0)n.negate();
            nb.state='swing'; nb.G=c.G; nb.t=c.t; nb.p=c.p; nb.u=ab; nb.n=n; nb.th=Math.max(-.6,Math.min(.6,Math.atan2(Math.hypot(nb.vx,nb.vz)/MX,4)*Math.sign(nb.vx*n.x+nb.vz*n.z))); nb.w=Math.hypot(nb.vx,nb.vz)/MX*.6; nb.vx=nb.vz=0; return; }
          if(nb.vy<JV*.5){ const L=catchLedge(); if(L){ nb.state='ledge'; nb.L=L; nb.vx=nb.vz=nb.vy=0; return; } } }
        if(nb.lift<=0){ nb.lift=0; nb.state='ground'; nb.vx=nb.vz=0; an.play('Jump_Land',{speed:1.6}); } return; }
      if(nb.state==='swing'){ const L=1.25, pump=(k('w')||k('arrowup')?1:0)-(k('s')||k('arrowdown')?1:0);
        nb.w+=(-(9.8/L)*Math.sin(nb.th)+pump*3.2*Math.cos(nb.th)-nb.w*.35)*dt; nb.th+=nb.w*dt; nb.th=Math.max(-1.45,Math.min(1.45,nb.th));
        const sh=((k('d')||k('arrowright')?1:0)-(k('a')||k('arrowleft')?1:0)); if(sh){ const ab=new V().subVectors(nb.G.b,nb.G.a), l=Math.hypot(ab.x,ab.z)||1; nb.t=Math.max(0,Math.min(1,nb.t+sh*dt*1.2*TILE/l*(nb.u.dot(new V(Math.cos(heading),0,-Math.sin(heading)))>0?1:-1))); nb.p.set(nb.G.a.x+ab.x*nb.t,nb.G.a.y,nb.G.a.z+ab.z*nb.t); }
        pos.x=nb.p.x+nb.n.x*Math.sin(nb.th)*L*MX; pos.z=nb.p.z+nb.n.z*Math.sin(nb.th)*L*MX; heading=Math.atan2(nb.n.x,nb.n.z);
        nb.lift=nb.p.y-HY*1.12-py+(1-Math.cos(nb.th))*L*MY; nb.clip='Jump_Loop'; nb.arms=true; nb.tilt=nb.th; return; }
      if(nb.state==='ledge'){ pos.x=nb.L.at.x; pos.z=nb.L.at.z; heading=Math.atan2(nb.L.n.x,nb.L.n.z); nb.lift=nb.L.top-HY*1.12-py; nb.clip='Jump_Loop'; nb.arms=true;
        if(k('s')||k('arrowdown')){ nb.state='air'; nb.vy=0; nb.cool=.4; } return; }
      if(nb.state==='vault'){ nb.t+=dt; const T=.55, u=Math.min(1,nb.t/T); pos.x=nb.from.x+(nb.to.x-nb.from.x)*u; pos.z=nb.from.z+(nb.to.z-nb.from.z)*u; heading=Math.atan2(nb.to.x-nb.from.x,nb.to.z-nb.from.z);
        const g0=MODS.bodega.ground(pos.x,pos.z); nb.lift=Math.max(0,(nb.top+HY*.08-g0)*Math.sin(Math.PI*Math.min(1,u*1.15))); nb.clip=u<.5?'Jump_Start':'Jump_Loop'; nb.ts=1.4;
        if(u>=1){ nb.state='ground'; nb.lift=0; an.play('Jump_Land',{speed:1.8}); } return; }
      nb.lift=0; nb.tilt=0; };

    // ---- STANDING EASY (owner, 18 Oct 2026: "make sure the characters regular standing pose is normal standing like the walker and not like
    // he is ready for battle, this is casual gaming"): the pack's Idle_Loop stands guarded (knees bent, fists up by the waist). Over it, while he
    // stands, his arms hang by his sides (a little out, the elbows soft), his legs straight under his hips, his back up; his feet keep the
    // ground (the body lifted by what straightening the knees gained). Eased in and out (rx) so a walk starts from it smoothly
    let rx=0; const DOWN=new V(0,-1,0), q0=new THREE.Quaternion(), fq=new THREE.Quaternion(), fpq=new THREE.Quaternion(), P1=new V(), P2=new V();
    const blendAim=(b,c,dir,w)=>{ q0.copy(b.quaternion); aim(b,c,dir); if(w<1){ b.quaternion.slerpQuaternions(q0,b.quaternion.clone(),w); b.updateMatrixWorld(true); } };
    const outOf=(a,b)=>{ bone(a).getWorldPosition(P1); bone(b).getWorldPosition(P2); P2.sub(P1); P2.y=0; return P2.normalize().clone(); };
    const footY=()=>{ bone('foot_l').getWorldPosition(P1); bone('foot_r').getWorldPosition(P2); return Math.min(P1.y,P2.y); };
    PLAYAS.relax=(dt,on)=>{ rx+=((on?1:0)-rx)*Math.min(1,dt*6); if(rx<.01)return; N.g.updateMatrixWorld(true); const f=fwd(), y0=footY();
      blendAim(bone('spine_02'),bone('neck_01'),new V(0,1,0).addScaledVector(f,.05).normalize(),rx*.7);
      for(const sd of ['l','r']){ const o=outOf('spine_03','upperarm_'+sd);
        blendAim(bone('upperarm_'+sd),bone('lowerarm_'+sd),DOWN.clone().addScaledVector(o,.14).addScaledVector(f,.02).normalize(),rx);
        blendAim(bone('lowerarm_'+sd),bone('hand_'+sd),DOWN.clone().addScaledVector(o,.06).addScaledVector(f,.16).normalize(),rx); }
      for(const sd of ['l','r']){ const ft=bone('foot_'+sd); ft.getWorldQuaternion(fq); const o=outOf('pelvis','thigh_'+sd);
        blendAim(bone('thigh_'+sd),bone('calf_'+sd),DOWN.clone().addScaledVector(o,.03).normalize(),rx);
        blendAim(bone('calf_'+sd),ft,DOWN.clone().addScaledVector(f,-.02).normalize(),rx);
        ft.parent.getWorldQuaternion(fpq); ft.quaternion.copy(fpq.invert().multiply(fq)); ft.updateMatrixWorld(true); }   /* (the foot flat as the clip had it) */
      N.g.position.y+=y0-footY(); };
    // ---- BODY TYPES (owner, 18 Oct 2026: "create preset body types based on the current avatar that you can switch between, add 6 common body
    // types"): his own body reshaped at its bind pose: each point pushed out from (or in toward) the bone it rides by that region's girth (the
    // chest and waist by width and depth apart, the belly forward alone, the arms, thighs, calves and neck round), his worn items with him (the
    // same sums on their points), and his height. AVERAGE is the body as it came. PLAYAS.body(name); kept in the browser (market-bodytype)
    const BT={AVERAGE:{h:1},SLIM:{h:1.01,chest:[.88,.88],waist:[.84,.84],belly:.84,arm:.82,thigh:.85,calf:.88,neck:.9},
      ATHLETIC:{h:1.02,chest:[1.16,1.12],waist:[.96,.95],belly:.92,arm:1.22,thigh:1.12,calf:1.08,neck:1.12},
      HEAVY:{h:1,chest:[1.18,1.25],waist:[1.32,1.36],belly:1.45,arm:1.25,thigh:1.25,calf:1.14,neck:1.2},
      STOCKY:{h:.9,chest:[1.12,1.1],waist:[1.12,1.12],belly:1.15,arm:1.15,thigh:1.16,calf:1.12,neck:1.15},
      TALL:{h:1.1,chest:[.96,.95],waist:[.92,.92],belly:.92,arm:.93,thigh:.93,calf:.94,neck:.97}};
    PLAYAS.BODIES=Object.keys(BT); PLAYAS.BT=BT;   // (the Walker's own take on them: src/avmove.js)
    { const R=K.D.rig, NM=R.names, PA=R.parent, ibm=new Float32Array(Uint8Array.from(atob(R.ibm),c=>c.charCodeAt(0)).buffer), J=NM.map((_,i)=>new V().setFromMatrixPosition(new THREE.Matrix4().fromArray(ibm,i*16).invert()));
      const kid=b=>{ const pref={pelvis:'spine_01',spine_03:'neck_01'}[NM[b]]; if(pref)return NM.indexOf(pref); return PA.indexOf(b); };
      const fz=Math.sign(J[NM.indexOf('ball_l')].z-J[NM.indexOf('foot_l')].z)||1;   /* (which way he faces in his own frame: his toes) */
      const REGB=NM.map(n=>/^spine_0[23]$|^clavicle/.test(n)?'chest':/^pelvis$|^spine_01$/.test(n)?'waist':/^upperarm|^lowerarm/.test(n)?'arm':/^thigh/.test(n)?'thigh':/^calf/.test(n)?'calf':/^neck/.test(n)?'neck':null);
      const KID=NM.map((_,b)=>kid(b)), parts=[[geo,geo.attributes.position.array.slice()],...Object.values(PLAYAS.items).map(m=>[m.geometry,m.geometry.attributes.position.array.slice()])], s0=N.body.scale.clone(), A=new V(), D=new V(), C=new V();
      PLAYAS.body=name=>{ const T=BT[name]||BT.AVERAGE; PLAYAS.bodyType=BT[name]?name:'AVERAGE';
        for(const [g,P0] of parts){ const P=g.attributes.position.array, SI=g.attributes.skinIndex, SW=g.attributes.skinWeight, n=P.length/3;
          for(let i=0;i<n;i++){ let ox=0,oy=0,oz=0; const px=P0[i*3],py_=P0[i*3+1],pz=P0[i*3+2];
            for(let k=0;k<4;k++){ const w=SW.getComponent(i,k); if(w<=0)continue; const b=SI.getComponent(i,k), rg=REGB[b]; if(!rg||T[rg]==null)continue; const c=KID[b]; if(c<0)continue;
              A.subVectors(J[c],J[b]); const l2=A.lengthSq()||1, t=Math.max(0,Math.min(1,((px-J[b].x)*A.x+(py_-J[b].y)*A.y+(pz-J[b].z)*A.z)/l2)); C.copy(J[b]).addScaledVector(A,t); D.set(px-C.x,py_-C.y,pz-C.z);
              if(rg==='chest'||rg==='waist'){ const fx=T[rg][0], fd=rg==='waist'&&D.z*fz>0?T.belly:T[rg][1]; ox+=w*D.x*(fx-1); oz+=w*D.z*(fd-1); }
              else { const f=T[rg]-1; ox+=w*D.x*f; oy+=w*D.y*f; oz+=w*D.z*f; } }
            P[i*3]=px+ox; P[i*3+1]=py_+oy; P[i*3+2]=pz+oz; }
          g.attributes.position.needsUpdate=true; if(g.attributes.normal)g.computeVertexNormals(); g.computeBoundingSphere(); }
        N.body.scale.set(s0.x*T.h,s0.y*T.h,s0.z*T.h); try{ localStorage.setItem('market-bodytype',PLAYAS.bodyType); }catch(e){} };
      let b0='AVERAGE'; try{ b0=localStorage.getItem('market-bodytype')||'AVERAGE'; }catch(e){} if(b0!=='AVERAGE')PLAYAS.body(b0); else PLAYAS.bodyType='AVERAGE'; }

    const g0=document.querySelector('#dgrain'); if(g0){ const b=document.createElement('button'); b.className='btn'; b.id='davatarpick'; const draw=()=>{ b.textContent='AVATAR: '+(PLAYAS.on?'MANNEQUIN':'WALKER'); b.setAttribute('aria-pressed',String(PLAYAS.on)); };
      b.onclick=()=>{ PLAYAS.on=!PLAYAS.on; try{ localStorage.setItem('market-avatarpick',PLAYAS.on?'mannequin':'walker'); }catch(e){} draw(); }; g0.parentNode.appendChild(b); draw(); }
    if(g0){ for(const name of ['hair','shirt','jeans','shoes']){ const b=document.createElement('button'); b.className='btn'; const draw=()=>{ const on=PLAYAS.items[name]&&PLAYAS.items[name].visible; b.textContent=name.toUpperCase()+(on?' ON':' OFF'); b.setAttribute('aria-pressed',String(!!on)); }; b.onclick=()=>{ PLAYAS.wear(name); draw(); }; g0.parentNode.appendChild(b); draw(); } }
    window.PLAYCAM=(k=4,d,p)=>{ UI.setFree(true); UI.camT.set(pos.x,py+N.H*ZU*24/TILE*.5,pos.z); ppu=ppuTo=PPU*k; if(d!=null)yaw=yawTo=heading+Math.PI+d*Math.PI/180; if(p!=null)pitch=pitchTo=p; };   // (a test's look: the free camera on his middle; d degrees round from his front, p the tilt)
    window.PLAYVOID=()=>{ pos.x=BOUND.x1-.5*TILE; pos.z=BOD.ZS((BOD.MAP.y0+BOD.MAP.y1)/2); };   // (a test's: him out on the land's east edge, the sheets' black void)
    window.PLAYASDBG=()=>({on:PLAYAS.on,mv:st.move&&st.move.name,base:an.base,ts:+an.ts.toFixed(2),sp:+sp.toFixed(2),x:+N.g.position.x.toFixed(2),z:+N.g.position.z.toFixed(2),vis:N.g.visible}); }
  else PLAYAS.tick=()=>{}; }
