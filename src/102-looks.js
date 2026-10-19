const LOOKS={};
{ const $=s=>document.querySelector(s), MATS=RIG.MATS;
  const COL={skin:'#e6c4b0',hair:'#6a5958',eye:'#5a3a26',shirt:'#a9a57e',pants:'#434e58',shoes:'#77614a'}, HAIRS=['hair','hairLong','hairLongA','hairBun','hairPony','hairPonyA'];
  const sz=(w,d=w)=>[w,1,d], LR=(n,v)=>({[n+'L']:v,[n+'R']:v}), arms=(u,f=u)=>({...LR('upperArm',sz(u)),...LR('sleeve',sz(u)),...LR('forearm',sz(f))}), legs=(t,sh=t)=>({...LR('thigh',sz(t)),...LR('shin',sz(sh))});
  const MALE={hips:[.81,1,.873],torso:sz(1.05,1.06),...arms(1.05,1.03),...legs(1.04,1)};
  const L={name:''};
  try{ L.name=JSON.parse(SAVE.get('looks')||'{}').name||''; }catch(e){}
  const save=()=>{ try{ SAVE.set('looks',JSON.stringify({name:L.name})); }catch(e){} };
  const tones=h=>{ const c=new THREE.Color(h); return [1,.9,.7,.42].map(k=>c.clone().multiplyScalar(k)); };
  const recolor=()=>{ const g=W3.mesh.geometry, A=g.attributes, mt=A.mat.array, n=mt.length;
    for(let i=0;i<n;i++){ const r=W3.ramp[mt[i]|0]; if(!r)continue; A.c0.setXYZ(i,r[0].r,r[0].g,r[0].b); A.c1.setXYZ(i,r[1].r,r[1].g,r[1].b); A.c2.setXYZ(i,r[2].r,r[2].g,r[2].b); A.cd.setXYZ(i,(r[2].r+r[3].r)/2,(r[2].g+r[3].g)/2,(r[2].b+r[3].b)/2); if(A.color)A.color.setXYZ(i,r[1].r,r[1].g,r[1].b); }
    for(const k of ['c0','c1','c2','cd','color'])if(A[k])A[k].needsUpdate=true; };
  const apply=()=>{ const set=(m,h)=>{ const i=MATS.indexOf(m); if(i>=0)W3.ramp[i]=tones(h); }; for(const k in COL)set(k,COL[k]); { const i=MATS.indexOf('lid'); if(i>=0)W3.ramp[i]=tones(COL.skin).map(c=>c.multiplyScalar(.78)); } recolor();
    for(const n of HAIRS){ const i=W3.idx(n); if(i>=0)W3.HIDE[i]=n!=='hair'; } for(let k=0;k<6;k++){ const i=W3.idx('eyes'+k); if(i>=0)W3.HIDE[i]=k!==0; } if(W3.reindex)W3.reindex(); };
  const css=document.createElement('style'); css.textContent=`#looks{position:fixed;right:12px;top:12px;width:330px;max-height:calc(100vh - 24px);overflow:auto;background:var(--panel,#10131b);border:2px solid var(--line,#2a3040);color:var(--fg,#d8dbe4);font:11px var(--pixel,monospace);padding:12px;z-index:30}
    #looks h2{margin:0 0 8px;font-size:13px;color:#ffd27a;letter-spacing:1px} #looks h3{margin:10px 0 4px;font-size:10px;color:var(--dim,#8a8f9c);letter-spacing:1px}
    #looks .row{display:flex;flex-wrap:wrap;gap:4px;align-items:center} #looks button{font:inherit;color:inherit;background:#1a1f2b;border:2px solid #2a3040;padding:3px 6px;cursor:pointer} #looks button[aria-pressed=true]{border-color:#ffd27a;color:#ffd27a}
    #looks input[type=text]{font:inherit;background:#0b0d13;color:inherit;border:2px solid #2a3040;padding:3px;width:180px}
    #looks .bar{height:8px;background:#0b0d13;border:1px solid #2a3040;flex:1} #looks .bar i{display:block;height:100%}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='looks'; P.hidden=true; P.setAttribute('role','dialog'); P.setAttribute('aria-label','Your character');
  P.innerHTML=`<h2>YOU</h2><div class="row"><input type="text" id="lname" maxlength="24" placeholder="your name"><button id="lclose">CLOSE</button></div>
    
    <h3>STATS</h3><div class="row"><span style="width:70px">HEALTH</span><div class="bar"><i id="lhp" style="background:#c84a3a;width:100%"></i></div></div>
    <div class="row" style="margin-top:4px"><span style="width:70px">STAMINA</span><div class="bar"><i id="lst" style="background:#d8b84a;width:100%"></i></div></div>`;
  document.body.appendChild(P);
  const draw=()=>{ $('#lname').value=L.name; };
  $('#lname').oninput=e=>{ L.name=e.target.value; save(); };
  $('#lname').addEventListener('keydown',e=>e.stopPropagation());
  $('#lclose').onclick=()=>{ P.hidden=true; };
  LOOKS.open=()=>{ draw(); P.hidden=false; }; LOOKS.L=L;
  LOOKS.stats=(hp,st)=>{ if(P.hidden)return; $('#lhp').style.width=Math.round(hp*100)+'%'; $('#lst').style.width=Math.round(st*100)+'%'; };
  const hit=new THREE.Mesh(new THREE.BoxGeometry(.8*TILE,2.2*TILE,.8*TILE),new THREE.MeshBasicMaterial({visible:false})); scene.add(hit);
  renderer.domElement.addEventListener('pointerdown',()=>{ hit.position.set(pos.x,py+1.1*TILE,pos.z); hit.updateMatrixWorld(); },true);
  UI.thing({name:'YOU',obj:hit,reach:99,tall:2,act:()=>LOOKS.open()});
  W3.E=W3.pcs.map(()=>null); for(const [n,v] of Object.entries(MALE)){ const i=W3.idx(n); if(i>=0)W3.E[i]={s:v.slice(),o:[0,0,0],q:[0,0,0,1]}; }
  const LT=new THREE.Vector3(), LS=new THREE.Vector3(), LSTEP=+(QS.get('lstep')??7)*Math.PI/180; let lt0=performance.now();
  LOOKS.light=()=>{ const now=performance.now(), k=1-Math.exp(-Math.min(.1,(now-lt0)/1000)*7); lt0=now; const sun=CLOCK.sun;
    if(sun&&sun.intensity>.3&&LVL==='up')LT.copy(sun.position).sub(sun.target.position).normalize();
    else{ const best=SHL.find(S=>S.intensity>0); if(!best)return; LT.set(best.position.x-pos.x,Math.max(.25*TILE,best.position.y-(py+1.2*TILE)),best.position.z-pos.z).normalize(); }
    if(!(LS.lengthSq()>.5))LS.copy(LT); else LS.lerp(LT,k).normalize();
    if(!W3.realL||!(W3.Lw.lengthSq()>.5)||W3.Lw.angleTo(LS)>LSTEP)W3.Lw.copy(LS); W3.realL=true; };
  apply(); }
