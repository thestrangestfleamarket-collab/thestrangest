// ---- HIS LOOKS: THE CHARACTER EDITOR (owner, 17 Oct 2026: "if you double click yourself you can edit your appearance and other stats and info,
// including other hairstyle, facial hairstyle, colors of everything, eye color, (give them a face), let them switch to F and all same stuff. pick
// common 5 of all things and add it"): a double click on yourself opens it. His name; MALE or FEMALE (HIS SHAPE's bodies); five hairstyles and
// five beards (made once in walker3d.js, the ones not worn folded away: instant); five colours each for his skin, his hair (brows and beard
// with it), his eyes, his shirt, his trousers, his shoes; his shading (steps of light, how deep); his stats. Kept in the browser ----
const LOOKS={};
{ const $=s=>document.querySelector(s), MATS=RIG.MATS;
  const PAL={skin:['#f1d2bf','#e6c4b0','#c99a7a','#9a6a4a','#5e3b26'], hair:['#2a2220','#6a5958','#7a5432','#c9a25a','#8e3b22'], eye:['#5a3a26','#3c6a9a','#4a7a3a','#7a6a3a','#6a7078'],
    shirt:['#a9a57e','#e8e6e0','#3a4a6a','#a83a32','#303034'], pants:['#434e58','#2a2a2e','#a8946a','#6a6e74','#5a4634'], shoes:['#77614a','#2c2a28','#e0dcd4','#a83a32','#a8845a']};
  const NAMES={skin:'SKIN',hair:'HAIR COLOUR',eye:'EYES',shirt:'SHIRT',pants:'TROUSERS',shoes:'SHOES'};
  // (no beards and no buzz cut: owner, 17 Oct 2026, "remove the beard and buzzcut from game completely")
  const HAIRS=[['SHORT',['hair']],['LONG',['hairLong','hairLongA']],['BUN',['hairBun']],['PONYTAIL',['hairPony','hairPonyA']],['BALD',[]]];   // (a style's pieces: the long hair's fall and the ponytail's tail swing on their own, walker3d.js)
  const sz=(w,d=w)=>[w,1,d], LR=(n,v)=>({[n+'L']:v,[n+'R']:v}), arms=(u,f=u)=>({...LR('upperArm',sz(u)),...LR('sleeve',sz(u)),...LR('forearm',sz(f))}), legs=(t,sh=t)=>({...LR('thigh',sz(t)),...LR('shin',sz(sh))});
  // TWO BODIES ONLY (owner, 17 Oct 2026: "make female slim the only female avatar option, and him as the only male option, make the males hips
  // 10% smaller"): MALE is him, his hips a tenth narrower than they were; FEMALE the slim one; the other six builds gone
  const BUILDS=[['MALE',1,{hips:[.81,1,.873],torso:sz(1.05,1.06),...arms(1.05,1.03),...legs(1.04,1)}],
    ['FEMALE',.95,{torso:[.82,.98,1],neck:[.84,1.04,.84],head:sz(.95),hips:[1.08,1.04,1.04],...arms(.8),...LR('hand',[.84,.9,.84]),...legs(1.02,.9),...LR('shoe',[.85,.92,.85])},1]];
  const ALLN=[...new Set(BUILDS.flatMap(b=>Object.keys(b[2])))];
  const L={name:'',sex:'M',build:0,eyes:0,hair:0,skin:1,hairc:1,eye:0,shirt:0,pants:0,shoes:0};
  try{ const o=JSON.parse(localStorage.getItem('market-looks')||'{}'); o.build=o.sex==='F'||o.build>=6?1:0; Object.assign(L,o);   /* (a looks saved with the old eight builds: its sex keeps) */ }catch(e){}
  const save=()=>{ try{ localStorage.setItem('market-looks',JSON.stringify(L)); }catch(e){} };
  // a colour's four tones (light, mid, shade, the deepest), as his ramps have them
  const tones=h=>{ const c=new THREE.Color(h); return [1,.9,.7,.42].map(k=>c.clone().multiplyScalar(k)); };
  const recolor=()=>{ const g=W3.mesh.geometry, A=g.attributes, mt=A.mat.array, n=mt.length;
    for(let i=0;i<n;i++){ const r=W3.ramp[mt[i]|0]; if(!r)continue; A.c0.setXYZ(i,r[0].r,r[0].g,r[0].b); A.c1.setXYZ(i,r[1].r,r[1].g,r[1].b); A.c2.setXYZ(i,r[2].r,r[2].g,r[2].b); A.cd.setXYZ(i,(r[2].r+r[3].r)/2,(r[2].g+r[3].g)/2,(r[2].b+r[3].b)/2); if(A.color)A.color.setXYZ(i,r[1].r,r[1].g,r[1].b); }
    for(const k of ['c0','c1','c2','cd','color'])if(A[k])A[k].needsUpdate=true; };
  const apply=()=>{ const set=(m,h)=>{ const i=MATS.indexOf(m); if(i>=0)W3.ramp[i]=tones(h); };
    set('skin',PAL.skin[L.skin]); set('hair',PAL.hair[L.hairc]); set('eye',PAL.eye[L.eye]); set('shirt',PAL.shirt[L.shirt]); set('pants',PAL.pants[L.pants]); set('shoes',PAL.shoes[L.shoes]); { const i=MATS.indexOf('lid'); if(i>=0)W3.ramp[i]=tones(PAL.skin[L.skin]).map(c=>c.multiplyScalar(.78)); } recolor();
    if(!(L.hair>=0&&L.hair<HAIRS.length))L.hair=0; for(const [,ns] of HAIRS)for(const n of ns){ const i=W3.idx(n); if(i>=0)W3.HIDE[i]=true; }
    for(const n of HAIRS[L.hair][1]){ const i=W3.idx(n); if(i>=0)W3.HIDE[i]=false; }
    if(!(L.eyes>=0&&L.eyes<6))L.eyes=0; for(let k=0;k<6;k++){ const i=W3.idx('eyes'+k); if(i>=0)W3.HIDE[i]=k!==L.eyes; } };
  // THE PANEL
  const css=document.createElement('style'); css.textContent=`#looks{position:fixed;right:12px;top:12px;width:330px;max-height:calc(100vh - 24px);overflow:auto;background:var(--panel,#10131b);border:2px solid var(--line,#2a3040);color:var(--fg,#d8dbe4);font:11px var(--pixel,monospace);padding:12px;z-index:30}
    #looks h2{margin:0 0 8px;font-size:13px;color:#ffd27a;letter-spacing:1px} #looks h3{margin:10px 0 4px;font-size:10px;color:var(--dim,#8a8f9c);letter-spacing:1px}
    #looks .row{display:flex;flex-wrap:wrap;gap:4px;align-items:center} #looks button{font:inherit;color:inherit;background:#1a1f2b;border:2px solid #2a3040;padding:3px 6px;cursor:pointer}
    #looks button[aria-pressed=true]{border-color:#ffd27a;color:#ffd27a} #looks .sw{width:26px;height:20px;padding:0} #looks input[type=text]{font:inherit;background:#0b0d13;color:inherit;border:2px solid #2a3040;padding:3px;width:180px}
    #looks .bar{height:8px;background:#0b0d13;border:1px solid #2a3040;flex:1} #looks .bar i{display:block;height:100%}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='looks'; P.hidden=true; P.setAttribute('role','dialog'); P.setAttribute('aria-label','Your character');
  const pick=(key,list,lab)=>`<h3>${lab}</h3><div class="row" data-k="${key}">${list.map((x,i)=>`<button data-i="${i}">${x}</button>`).join('')}</div>`;
  const sw=key=>`<h3>${NAMES[key]}</h3><div class="row" data-k="${key==='hair'?'hairc':key}">${PAL[key].map((c,i)=>`<button class="sw" data-i="${i}" style="background:${c}" aria-label="${NAMES[key]} ${i+1}"></button>`).join('')}</div>`;
  P.innerHTML=`<h2>YOU</h2><div class="row"><input type="text" id="lname" maxlength="24" placeholder="your name"><button id="lclose">CLOSE</button></div>
    <h3>STATS</h3><div class="row"><span style="width:70px">HEALTH</span><div class="bar"><i id="lhp" style="background:#c84a3a;width:100%"></i></div></div>
    <div class="row" style="margin-top:4px"><span style="width:70px">STAMINA</span><div class="bar"><i id="lst" style="background:#d8b84a;width:100%"></i></div></div>
    ${pick('build',BUILDS.map(b=>b[0]),'BODY')}${pick('eyes',['DOTS','WHITES','BIG','HALF-LIDDED','LASHES','SMILING'],'EYES')}${pick('hair',HAIRS.map(h=>h[0]),'HAIR')}
    <details id="lcols"><summary style="cursor:pointer;color:#ffd27a;margin:10px 0 4px;font-size:10px;letter-spacing:1px">COLOURS &#9662;</summary>${['skin','hair','eye','shirt','pants','shoes'].map(sw).join('')}</details>
    <h3>SHADING ON YOU</h3><div class="row"><span style="width:70px">STEPS</span><input type="range" id="lsteps" min="2" max="12" step="1" style="flex:1"><span id="lstepsv" style="width:14px"></span></div>
    <div class="row"><span style="width:70px">DEPTH</span><input type="range" id="ldepth" min="0.02" max="0.98" step="0.005" style="flex:1"></div>`;
  document.body.appendChild(P);
  const draw=()=>{ $('#lname').value=L.name; P.querySelectorAll('[data-k]').forEach(r=>{ const k=r.dataset.k, v=L[k]; r.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.i===v))); });
    $('#lsteps').value=W3.shade.steps; $('#lstepsv').textContent=W3.shade.steps; $('#ldepth').value=W3.shade.depth; };
  P.addEventListener('click',e=>{ const b=e.target.closest('button[data-i]'); if(!b)return; const k=b.parentElement.dataset.k, i=+b.dataset.i;
    if(k==='build'){ L.build=i; const f=BUILDS[i][3]; if(f&&L.sex!=='F'&&L.hair===0)L.hair=1; L.sex=f?'F':'M'; build(true); }
    else L[k]=i; apply(); save(); draw(); });
  $('#lname').oninput=e=>{ L.name=e.target.value; save(); };
  $('#lname').addEventListener('keydown',e=>e.stopPropagation());
  $('#lclose').onclick=()=>{ P.hidden=true; };
  $('#lsteps').oninput=e=>{ W3.setShade(+e.target.value,W3.shade.depth); draw(); }; $('#ldepth').oninput=e=>{ W3.setShade(W3.shade.steps,+e.target.value); };
  LOOKS.open=()=>{ draw(); P.hidden=false; }; LOOKS.L=L;
  LOOKS.stats=(hp,st)=>{ if(P.hidden)return; $('#lhp').style.width=Math.round(hp*100)+'%'; $('#lst').style.width=Math.round(st*100)+'%'; };
  // a double click on yourself opens it (what the click finds: a box where you stand, put there as you press)
  const hit=new THREE.Mesh(new THREE.BoxGeometry(.8*TILE,2.2*TILE,.8*TILE),new THREE.MeshBasicMaterial({visible:false})); scene.add(hit);
  renderer.domElement.addEventListener('pointerdown',()=>{ hit.position.set(pos.x,py+1.1*TILE,pos.z); hit.updateMatrixWorld(); },true);
  UI.thing({name:'YOU',obj:hit,reach:99,tall:2,act:()=>LOOKS.open()});
  // HIS BUILD (owner, 17 Oct 2026: "make his hips a little less wide. gain 5 pounds"; then the eight body types of the mockup, "use all"): each
  // a set of his pieces' sizes (across, along, deep) and his height (W3.BH, from his feet), the skeleton his. HIM is his own (the hips a little
  // narrower, a touch fuller). Picked here, it sets those pieces (what's sculpted in HIS SHAPE stays); on load, only pieces not shaped there
  function build(force){ if(!(L.build>=0&&L.build<BUILDS.length))L.build=0; const B=BUILDS[L.build]; W3.BH=B[1]; W3.E=W3.E||[];
    for(const n of ALLN){ const i=W3.idx(n); if(i<0)continue; const v=B[2][n]; if(force||!W3.E[i])W3.E[i]=v?{s:v.slice(),o:[0,0,0],q:[0,0,0,1]}:null; }
    if(force&&typeof ED!=='undefined'&&ED.save)ED.save(); }
  build(false);
  // LOOKING ABOUT (owner, 17 Oct 2026: "look around idle"; then "stands still except for idle animations like look around, every once in a
  // while"): standing, he's still; every six to fourteen seconds he turns his head one way (now and then down a little), holds, and turns back
  { const R=RIG, f0=R.OVL.fn; let idle=0, next=4+Math.random()*6, lk=null;
    R.OVL.fn=(s,P)=>{ if(f0)f0(s,P); if(s!==st)return; const still=!s.move&&(s.w||0)<.05&&!RAG.on; if(!still){ idle=0; lk=null; return; } idle+=1/60;
      if(!lk&&idle>next){ lk={t:0,a:(Math.random()<.5?-1:1)*(25+Math.random()*20),n:Math.random()<.3?8+Math.random()*6:0,d:3+Math.random()*2}; }
      if(lk){ lk.t+=1/60; const u=lk.t/lk.d, k=u<.25?u/.25:u>.75?(1-u)/.25:1, e=k*k*(3-2*k); P.look=(P.look||0)+e*lk.a*R.D; P.nod=(P.nod||0)+e*lk.n*R.D;
        if(u>=1){ lk=null; idle=0; next=6+Math.random()*8; } } }; }
  // HIS SHADOWS, REAL (owner, 17 Oct 2026: "i should see more shadows on the person, make it realistic, all his body cast shadow, his right arm
  // should cast shadow on his body"): his own shadow on him falls from the light that's really on him: the sun by day, the nearest lamp at
  // night (not his fixed one), on a finer map, a little deeper by default
  LOOKS.light=()=>{ const sun=CLOCK.sun; if(sun&&sun.intensity>.3&&LVL==='up'){ W3.Lw.copy(sun.position).sub(sun.target.position).normalize(); return; }
    let best=null, bd=1e9; for(const S of SHL){ if(!(S.intensity>0))continue; const d=S.position.distanceTo(new THREE.Vector3(pos.x,py+1.2*TILE,pos.z)); if(d<bd){ bd=d; best=S; } }
    if(best)W3.Lw.set(best.position.x-pos.x,best.position.y-(py+1.2*TILE),best.position.z-pos.z).normalize(); };
  apply(); }
