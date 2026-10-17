// ---- YOU AS THE MANNEQUIN (owner, 17 Oct 2026: "let me play as the animation model we are using as a framework", "lets make that the main
// avatar and i will sculpt it how i want"): the UAL animation library's standard body (data/ual.json, the droids' body in its own colours)
// is you now. The game's rig still runs you (your keys, your moves, the physics, the camera); the mannequin stands where you stand, turned as
// you are, and plays its own clips for what you're doing: standing, walking, jogging, sprinting (by your speed), in the air, a punch, a roll,
// falling, sitting, swimming. ?avatar=walker (or GRAPHICS' AVATAR) the Walker as before. Cost: 6,872 triangles, one draw, his own shadow ----
const PLAYAS={on:false};
{ const q=QS.get('avatar'); let v=null; try{ v=localStorage.getItem('market-avatar'); }catch(e){} PLAYAS.on=(q||v||'mannequin')!=='walker';
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
      let lift=0; const mv=st.move&&st.move.name;
      if(mv&&/jump|flip/.test(mv)&&B&&B.J&&B.J.pelvis)lift=Math.max(0,B.J.pelvis.y-18)*ZU*(W3.SZ||1)*(W3.BH||1);
      g.position.set(pos.x,py+lift,pos.z); g.rotation.set(0,RAG.on?RAG.hd:heading,0);
      let base='Idle_Loop', ts=1;
      if(RAG.on)base='Death01';
      else if(st.water&&st.water.in)base=sp>.3?'Swim_Fwd_Loop':'Swim_Idle_Loop';
      else if(st.sit)base='Sitting_Idle_Loop';
      else if(mv&&MOVE[mv])base=MOVE[mv];
      else if(sp>.25){ if(sp>3.6){ base='Sprint_Loop'; ts=sp/5; } else if(sp>2){ base='Jog_Fwd_Loop'; ts=sp/3.2; } else { base='Walk_Loop'; ts=sp/1.4; } }
      an.base=base; an.ts=Math.max(.4,Math.min(2.2,ts)); an.update(dt); };
    // GRAPHICS' AVATAR: the mannequin or the Walker, kept in the browser
    const g0=document.querySelector('#dgrain'); if(g0){ const b=document.createElement('button'); b.className='btn'; b.id='davatarpick'; const draw=()=>{ b.textContent='AVATAR: '+(PLAYAS.on?'MANNEQUIN':'WALKER'); b.setAttribute('aria-pressed',String(PLAYAS.on)); };
      b.onclick=()=>{ PLAYAS.on=!PLAYAS.on; try{ localStorage.setItem('market-avatar',PLAYAS.on?'mannequin':'walker'); }catch(e){} draw(); }; g0.parentNode.appendChild(b); draw(); }
    if(g0){ for(const name of ['hair','shirt','jeans','shoes']){ const b=document.createElement('button'); b.className='btn'; const draw=()=>{ const on=PLAYAS.items[name]&&PLAYAS.items[name].visible; b.textContent=name.toUpperCase()+(on?' ON':' OFF'); b.setAttribute('aria-pressed',String(!!on)); }; b.onclick=()=>{ PLAYAS.wear(name); draw(); }; g0.parentNode.appendChild(b); draw(); } }
    window.PLAYCAM=(k=4)=>{ UI.setFree(true); UI.camT.set(pos.x,py+N.H*ZU*24/TILE*.5,pos.z); ppu=ppuTo=PPU*k; };   // (a test's look: the free camera on his middle)
    window.PLAYASDBG=()=>({on:PLAYAS.on,mv:st.move&&st.move.name,base:an.base,ts:+an.ts.toFixed(2),sp:+sp.toFixed(2),x:+N.g.position.x.toFixed(2),z:+N.g.position.z.toFixed(2),vis:N.g.visible}); }
  else PLAYAS.tick=()=>{}; }
