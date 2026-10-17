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
  const HAIRS=[['SHORT','hair'],['BUZZ','hairBuzz'],['LONG','hairLong'],['BUN','hairBun'],['BALD',null]], BEARDS=[['FULL','beard'],['SHORT','beardShort'],['GOATEE','beardGoatee'],['MOUSTACHE','beardMoustache'],['NONE',null]];
  const L={name:'',sex:'M',hair:0,beard:0,skin:1,hairc:1,eye:0,shirt:0,pants:0,shoes:0};
  try{ Object.assign(L,JSON.parse(localStorage.getItem('market-looks')||'{}')); }catch(e){}
  const save=()=>{ try{ localStorage.setItem('market-looks',JSON.stringify(L)); }catch(e){} };
  // a colour's four tones (light, mid, shade, the deepest), as his ramps have them
  const tones=h=>{ const c=new THREE.Color(h); return [1,.9,.7,.42].map(k=>c.clone().multiplyScalar(k)); };
  const recolor=()=>{ const g=W3.mesh.geometry, A=g.attributes, mt=A.mat.array, n=mt.length;
    for(let i=0;i<n;i++){ const r=W3.ramp[mt[i]|0]; if(!r)continue; A.c0.setXYZ(i,r[0].r,r[0].g,r[0].b); A.c1.setXYZ(i,r[1].r,r[1].g,r[1].b); A.c2.setXYZ(i,r[2].r,r[2].g,r[2].b); A.cd.setXYZ(i,(r[2].r+r[3].r)/2,(r[2].g+r[3].g)/2,(r[2].b+r[3].b)/2); if(A.color)A.color.setXYZ(i,r[1].r,r[1].g,r[1].b); }
    for(const k of ['c0','c1','c2','cd','color'])if(A[k])A[k].needsUpdate=true; };
  const apply=()=>{ const set=(m,h)=>{ const i=MATS.indexOf(m); if(i>=0)W3.ramp[i]=tones(h); };
    set('skin',PAL.skin[L.skin]); set('hair',PAL.hair[L.hairc]); set('eye',PAL.eye[L.eye]); set('shirt',PAL.shirt[L.shirt]); set('pants',PAL.pants[L.pants]); set('shoes',PAL.shoes[L.shoes]); recolor();
    for(const [,n] of HAIRS.concat(BEARDS))if(n){ const i=W3.idx(n); if(i>=0)W3.HIDE[i]=true; }
    const h=HAIRS[L.hair][1], b=BEARDS[L.beard][1]; if(h)W3.HIDE[W3.idx(h)]=false; if(b)W3.HIDE[W3.idx(b)]=false; };
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
    ${pick('sex',['MALE','FEMALE'],'BODY')}${pick('hair',HAIRS.map(h=>h[0]),'HAIR')}${pick('beard',BEARDS.map(h=>h[0]),'FACIAL HAIR')}
    ${['skin','hair','eye','shirt','pants','shoes'].map(sw).join('')}
    <h3>SHADING ON YOU</h3><div class="row"><span style="width:70px">STEPS</span><input type="range" id="lsteps" min="2" max="5" step="1" style="flex:1"><span id="lstepsv" style="width:14px"></span></div>
    <div class="row"><span style="width:70px">DEPTH</span><input type="range" id="ldepth" min="0.1" max="0.9" step="0.01" style="flex:1"></div>`;
  document.body.appendChild(P);
  const draw=()=>{ $('#lname').value=L.name; P.querySelectorAll('[data-k]').forEach(r=>{ const k=r.dataset.k, v=k==='sex'?(L.sex==='F'?1:0):L[k]; r.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.i===v))); });
    $('#lsteps').value=W3.shade.steps; $('#lstepsv').textContent=W3.shade.steps; $('#ldepth').value=W3.shade.depth; };
  P.addEventListener('click',e=>{ const b=e.target.closest('button[data-i]'); if(!b)return; const k=b.parentElement.dataset.k, i=+b.dataset.i;
    if(k==='sex'){ const s=i?'F':'M'; if(s!==L.sex){ L.sex=s; const bb=document.querySelector(`[data-body="${s==='F'?'female':'male'}"]`); if(bb)bb.click(); if(s==='F'){ if(L.beard!==4)L.beard=4; if(L.hair===0||L.hair===1)L.hair=2; } } }
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
  apply(); }
