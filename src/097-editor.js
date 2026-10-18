const ED={on:false};
{ const R=RIG, PCS=W3.pcs, NP=PCS.length, g=W3.mesh.geometry, PA=g.attributes.position, NA=g.attributes.normal, PI=g.attributes.pidx, NV=PA.count;
  const BASE=PA.array.slice(), NBASE=NA.array.slice();
  W3.E=PCS.map(()=>null); const E0=()=>({s:[1,1,1],o:[0,0,0],q:[0,0,0,1]});
  const mS=new THREE.Matrix4(), mT=new THREE.Matrix4(), mQ=new THREE.Matrix4(), qq=new THREE.Quaternion();
  W3.applyE=(M,E,o)=>{ M.multiply(mS.makeScale(E.s[0],E.s[1],E.s[2])); M.premultiply(mT.makeTranslation(-o.x,-o.y,-o.z)); M.premultiply(mQ.makeRotationFromQuaternion(qq.set(...E.q))); M.premultiply(mT.makeTranslation(o.x+E.o[0],o.y+E.o[1],o.z+E.o[2])); };
  const RJ=R.restOf().B.J, dS=[RJ.shoulderL.x-RJ.shoulderR.x,RJ.shoulderL.y-RJ.shoulderR.y,RJ.shoulderL.z-RJ.shoulderR.z], AX=dS.map(Math.abs).indexOf(Math.max(...dS.map(Math.abs))), MID=([RJ.shoulderL.x,RJ.shoulderL.y,RJ.shoulderL.z][AX]+[RJ.shoulderR.x,RJ.shoulderR.y,RJ.shoulderR.z][AX])/2;
  const NAMES=PCS.map(P=>P.n), PART=NAMES.map(n=>/[LR]$/.test(n)?NAMES.indexOf(n.slice(0,-1)+(n.endsWith('L')?'R':'L')):-1);
  const mirE=E=>{ const o=E.o.slice(), q=E.q.slice(); o[AX]=-o[AX]; for(let k=0;k<3;k++)if(k!==AX)q[k]=-q[k]; return {s:E.s.slice(),o,q}; };
  const key=new Map(), gid=new Int32Array(NV), GV=[]; for(let i=0;i<NV;i++){ const k=PI.array[i]+'|'+BASE[i*3]+'|'+BASE[i*3+1]+'|'+BASE[i*3+2]; let c=key.get(k); if(c==null){ c=GV.length; key.set(k,c); GV.push([]); } GV[c].push(i); gid[i]=c; }
  const NG=GV.length, NB=GV.map(()=>new Set()); for(let i=0;i<NV;i+=3){ const a=gid[i],b=gid[i+1],c=gid[i+2]; NB[a].add(b).add(c); NB[b].add(a).add(c); NB[c].add(a).add(b); }
  const NBA=NB.map(s=>[...s]), GP=new Float32Array(NG*3), GN=new Float32Array(NG*3);
  const readG=()=>{ for(let c=0;c<NG;c++){ const i=GV[c][0]; GP[c*3]=PA.array[i*3]; GP[c*3+1]=PA.array[i*3+1]; GP[c*3+2]=PA.array[i*3+2]; } };
  const writeG=c=>{ for(const i of GV[c]){ PA.array[i*3]=GP[c*3]; PA.array[i*3+1]=GP[c*3+1]; PA.array[i*3+2]=GP[c*3+2]; } };
  let sculpted=false, dirty=false;
  function normals(){ GN.fill(0); const p=PA.array; for(let i=0;i<NV;i+=3){ const ax=p[i*3],ay=p[i*3+1],az=p[i*3+2], ux=p[i*3+3]-ax,uy=p[i*3+4]-ay,uz=p[i*3+5]-az, vx=p[i*3+6]-ax,vy=p[i*3+7]-ay,vz=p[i*3+8]-az;
      let nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx; const b=NBASE, o=i*3; if(nx*b[o]+ny*b[o+1]+nz*b[o+2]<0){ nx=-nx; ny=-ny; nz=-nz; }
      for(let k=0;k<3;k++){ const c=gid[i+k]; GN[c*3]+=nx; GN[c*3+1]+=ny; GN[c*3+2]+=nz; } }
    for(let c=0;c<NG;c++){ const l=Math.hypot(GN[c*3],GN[c*3+1],GN[c*3+2])||1; GN[c*3]/=l; GN[c*3+1]/=l; GN[c*3+2]/=l; for(const i of GV[c]){ NA.array[i*3]=GN[c*3]; NA.array[i*3+1]=GN[c*3+1]; NA.array[i*3+2]=GN[c*3+2]; } }
    NA.needsUpdate=true; PA.needsUpdate=true; }
  const BP=new Float32Array(NG*3), SP=new Float32Array(NG*3), v=new THREE.Vector3();
  function project(){ W3.group.updateMatrixWorld(); const r=renderer.domElement.getBoundingClientRect(), PM=W3.PM.value;
    for(let c=0;c<NG;c++){ const i=GV[c][0]; v.set(PA.array[i*3],PA.array[i*3+1],PA.array[i*3+2]).applyMatrix4(PM[PI.array[i]|0]); BP[c*3]=v.x; BP[c*3+1]=v.y; BP[c*3+2]=v.z;
      v.applyMatrix4(W3.group.matrixWorld).project(cam); SP[c*3]=(v.x+1)/2*r.width; SP[c*3+1]=(1-v.y)/2*r.height; SP[c*3+2]=v.z; } }
  function pick(e){ const r=renderer.domElement.getBoundingClientRect(), x=e.clientX-r.left, y=e.clientY-r.top; project(); let best=-1, bz=1e9;
    for(let c=0;c<NG;c++){ const dx=SP[c*3]-x, dy=SP[c*3+1]-y; if(dx*dx+dy*dy<64&&SP[c*3+2]<bz){ bz=SP[c*3+2]; best=c; } }
    return best<0?null:{c:best,p:[BP[best*3],BP[best*3+1],BP[best*3+2]],piece:PI.array[GV[best][0]]|0}; }
  const UNDO=[]; const snap=()=>{ UNDO.push({p:PA.array.slice(),E:JSON.stringify(W3.E),sc:sculpted}); if(UNDO.length>30)UNDO.shift(); };
  function undo(){ const u=UNDO.pop(); if(!u)return; PA.array.set(u.p); W3.E=JSON.parse(u.E); sculpted=u.sc; normals(); save(); draw(); }
  const B={mode:'push',size:4,str:0.5,mirror:true};
  function brush(h){ readG(); const spots=[h.p]; if(B.mirror){ const m=h.p.slice(); m[AX]=2*MID-m[AX]; spots.push(m); }
    const hit=new Map(); for(const s of spots)for(let c=0;c<NG;c++){ const d=Math.hypot(BP[c*3]-s[0],BP[c*3+1]-s[1],BP[c*3+2]-s[2]); if(d<B.size){ const f=Math.pow(1-d/B.size,2); hit.set(c,Math.max(hit.get(c)||0,f)); } }
    if(B.mode==='smooth'){ const nw=new Map(); for(const [c,f] of hit){ const n=NBA[c]; if(!n.length)continue; let ax=0,ay=0,az=0; for(const q of n){ ax+=GP[q*3]; ay+=GP[q*3+1]; az+=GP[q*3+2]; } const k=f*B.str; nw.set(c,[GP[c*3]+(ax/n.length-GP[c*3])*k,GP[c*3+1]+(ay/n.length-GP[c*3+1])*k,GP[c*3+2]+(az/n.length-GP[c*3+2])*k]); }
      for(const [c,p] of nw){ GP.set(p,c*3); writeG(c); } }
    else { const sg=B.mode==='push'?1:-1; for(const [c,f] of hit){ const i=GV[c][0], a=f*B.str*0.35*sg; for(let k=0;k<3;k++)GP[c*3+k]+=NA.array[i*3+k]*a; writeG(c); } }
    sculpted=true; dirty=true; }
  const sel=new THREE.Mesh(g,new THREE.ShaderMaterial({uniforms:{uPM:W3.PM,uSel:{value:-1}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
    vertexShader:`attribute float pidx; uniform mat4 uPM[${NP}]; uniform float uSel; void main(){ if(abs(pidx-uSel)>0.5){ gl_Position=vec4(2.,2.,2.,1.); return; } gl_Position=projectionMatrix*modelViewMatrix*(uPM[int(pidx+0.5)]*vec4(position,1.)); }`,
    fragmentShader:`void main(){ gl_FragColor=vec4(1.,.78,.25,.35); }`}));
  sel.matrixAutoUpdate=false; sel.frustumCulled=false; sel.visible=false; sel.renderOrder=5; scene.add(sel);
  { const h0=OUTL.hidden; OUTL.hidden=()=>(h0?h0():[]).concat([sel]); }
  let cur=-1; const setSel=i=>{ cur=i; sel.material.uniforms.uSel.value=i; draw(); };
  const both=()=>$('#eboth').getAttribute('aria-pressed')==='true';
  const setE=(i,f)=>{ const E=W3.E[i]||(W3.E[i]=E0()); f(E); if(both()&&PART[i]>=0)W3.E[PART[i]]=mirE(E); };
  const b64=u8=>{ let s=''; for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000)); return btoa(s); };
  const pack2=()=>{ const E={}; W3.E.forEach((e,i)=>{ if(e)E[NAMES[i]]=e; }); let d=null; if(sculpted){ const f=new Float32Array(NV*3); for(let i=0;i<NV*3;i++)f[i]=PA.array[i]-BASE[i]; d=b64(new Uint8Array(f.buffer)); } return {v:1,n:NV,E,d}; };
  function unpack(o){ if(!o||o.v!==1)return false; W3.E=PCS.map(()=>null); for(const n in o.E||{}){ const i=NAMES.indexOf(n); if(i>=0)W3.E[i]=o.E[n]; }
    PA.array.set(BASE); sculpted=false; if(o.d&&o.n===NV){ const s=atob(o.d), u=new Uint8Array(s.length); for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i); const f=new Float32Array(u.buffer); for(let i=0;i<NV*3;i++)PA.array[i]=BASE[i]+f[i]; sculpted=true; }
    normals(); if(!sculpted){ NA.array.set(NBASE); NA.needsUpdate=true; } return true; }
  const save=()=>{ try{ SAVE.set('walker',JSON.stringify(pack2())); }catch(e){} };
  try{ unpack(JSON.parse(SAVE.get('walker')||'null')); }catch(e){}
  const css=document.createElement('style'); css.textContent=`
  #ed{position:fixed;left:calc(12px + env(safe-area-inset-left,0px));top:12px;bottom:12px;width:300px;overflow:auto;background:var(--bg);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg);z-index:20}
  #ed[hidden],#ering[hidden]{display:none} #ed h2{font:12px var(--pixel);color:var(--key);margin:0;padding:12px 14px;border-bottom:2px solid var(--line)}
  #ed .tabs{display:flex;border-bottom:2px solid var(--line)} #ed .tabs{flex-wrap:wrap} #ed .tabs button{flex:1 1 30%;font:inherit;color:var(--dim);background:transparent;border:0;border-right:2px solid var(--line);padding:10px 4px;cursor:pointer} #ed .tabs button:last-child{border-right:0}
  #ed .tabs button[aria-selected="true"]{color:var(--key);background:var(--panel)} #ed .pane{padding:10px 14px} #ed .pane[hidden]{display:none}
  #ed .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0} #ed .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 8px;cursor:pointer}
  #ed .btn[aria-pressed="true"]{color:var(--key);border-color:#6b6f80} #ed .dim{color:var(--dim)} #ed input[type=range]{width:150px} #ed .lab{width:90px}
  #ed .list{display:flex;flex-wrap:wrap;gap:4px;max-height:200px;overflow:auto;margin:6px 0} #ed .list .btn{padding:4px 6px}
  #ed .foot{padding:10px 14px;border-top:2px solid var(--line)}
  #ering{position:fixed;border:2px solid #f2c14e;pointer-events:none;z-index:19}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='ed'; P.hidden=true; P.innerHTML=`<h2>HIS SHAPE</h2>
    <div class="tabs"><button data-m="sizes">SIZES</button><button data-m="sculpt">SCULPT</button><button data-m="pieces">PIECES</button></div>
    <div class="pane" data-q="sizes"><div class="row"><span class="lab">BODY</span><button class="btn" data-body="current">CURRENT</button><button class="btn" data-body="male">MALE</button><button class="btn" data-body="female">FEMALE</button></div><div class="dim">pick a piece (or click it on him)</div><div class="list" id="elist"></div>
      <div id="esz"><div class="row"><span class="lab">LENGTH</span><input type="range" min="0.4" max="2.2" step="0.01" data-k="1"></div>
      <div class="row"><span class="lab">WIDTH</span><input type="range" min="0.4" max="2.2" step="0.01" data-k="0"></div>
      <div class="row"><span class="lab">THICKNESS</span><input type="range" min="0.4" max="2.2" step="0.01" data-k="2"></div></div></div>
    <div class="pane" data-q="sculpt"><div class="row"><button class="btn" data-b="push">PUSH OUT</button><button class="btn" data-b="pull">PULL IN</button><button class="btn" data-b="smooth">SMOOTH</button></div>
      <div class="row"><span class="lab">SIZE</span><input type="range" id="ebs" min="1" max="14" step="0.1"></div><div class="row"><span class="lab">STRENGTH</span><input type="range" id="ebt" min="0.05" max="1" step="0.01"></div>
      <div class="row"><button class="btn" id="emir">MIRROR</button></div><div class="dim">drag on him to shape him</div></div>
    <div class="pane" data-q="pieces"><div class="dim">click a piece on him, then drag</div><div class="row"><button class="btn" data-g="move">MOVE</button><button class="btn" data-g="scale">SCALE</button><button class="btn" data-g="turn">TURN</button></div>
      <div class="row"><button class="btn" id="eresp">THIS PIECE BACK</button></div></div>
    <div class="pane" id="egen"><div class="row"><span id="ename" class="dim"></span></div><div class="row"><button class="btn" id="eboth">BOTH SIDES</button></div>
      <div class="dim">drag off him moves the view · right-drag (or Shift + drag) turns it round the point you grab · wheel zooms at the mouse · 0 back</div></div>
    <div class="foot"><div class="row"><button class="btn" id="eundo">UNDO</button><button class="btn" id="eall">ALL BACK</button></div>
      <div class="row"><button class="btn" id="eload">LOAD</button><button class="btn" id="edone">DONE</button></div></div>`;
  document.body.appendChild(P); const ring=document.createElement('div'); ring.id='ering'; ring.hidden=true; document.body.appendChild(ring);
  const $=s=>P.querySelector(s); let mode='sizes', gmode='move';
  const NICE=n=>n.replace(/([LR])$/,' $1').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/(\d)/g,' $1').toUpperCase();
  for(const [i,n] of NAMES.entries()){ const b=document.createElement('button'); b.className='btn'; b.textContent=NICE(n); b.dataset.i=i; b.onclick=()=>setSel(i); $('#elist').appendChild(b); }
  $('#eboth').setAttribute('aria-pressed','true'); $('#emir').setAttribute('aria-pressed','true');
  function draw(){ P.querySelectorAll('[data-m]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.m===mode))); P.querySelectorAll('[data-q]').forEach(p=>p.hidden=p.dataset.q!==mode);
    P.querySelectorAll('[data-b]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.b===B.mode))); P.querySelectorAll('[data-g]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.g===gmode)));
    P.querySelectorAll('#elist .btn').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.i===cur))); $('#ename').textContent=cur>=0?'PIECE: '+NICE(NAMES[cur]):'NO PIECE PICKED';
    $('#esz').style.opacity=cur>=0?1:.4; const E=cur>=0&&W3.E[cur]||E0(); P.querySelectorAll('#esz input').forEach(s=>s.value=E.s[+s.dataset.k]); $('#ebs').value=B.size; $('#ebt').value=B.str;
    $('#egen').hidden=!!(ED.ext&&ED.ext[mode]);
    sel.visible=ED.on&&mode!=='sculpt'&&cur>=0; ring.hidden=!(ED.on&&mode==='sculpt'); }
  P.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ mode=b.dataset.m; draw(); });
  ED.ext={}; ED.selMesh=sel; ED.save=()=>save(); ED.mode=()=>mode; ED.redraw=()=>draw(); ED.pick=e=>pick(e); ED.setSel=i=>setSel(i); ED.sel=()=>cur; ED.names=NAMES;
  ED.addTab=(key,label,pane,h)=>{ const b=document.createElement('button'); b.dataset.m=key; b.textContent=label; b.onclick=()=>{ mode=key; draw(); if(h.show)h.show(); }; P.querySelector('.tabs').appendChild(b);
    pane.classList.add('pane'); pane.dataset.q=key; P.querySelector('.foot').before(pane); ED.ext[key]=h; };
  P.querySelectorAll('[data-b]').forEach(b=>b.onclick=()=>{ B.mode=b.dataset.b; draw(); });
  P.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{ gmode=b.dataset.g; draw(); });
  P.querySelectorAll('#esz input').forEach(s=>{ s.onpointerdown=()=>snap(); s.oninput=()=>{ if(cur<0)return; setE(cur,E=>E.s[+s.dataset.k]=+s.value); }; s.onchange=save; });
  $('#ebs').oninput=e=>{ B.size=+e.target.value; }; $('#ebt').oninput=e=>{ B.str=+e.target.value; };
  $('#emir').onclick=()=>{ B.mirror=!B.mirror; $('#emir').setAttribute('aria-pressed',String(B.mirror)); };
  $('#eboth').onclick=()=>{ $('#eboth').setAttribute('aria-pressed',String(!both())); };
  $('#eresp').onclick=()=>{ if(cur<0)return; snap(); W3.E[cur]=null; if(both()&&PART[cur]>=0)W3.E[PART[cur]]=null; save(); draw(); };
  const e3=(s,o=[0,0,0])=>({s,o,q:[0,0,0,1]}), two=(n,v)=>({[n+'L']:v,[n+'R']:v});
  const BODIES={current:{},
    male:{torso:e3([1.12,1,1.06]),neck:e3([1.12,1,1.12]),hips:e3([0.95,1,0.98]),...two('sleeve',e3([1.12,1,1.12])),...two('upperArm',e3([1.12,1,1.12])),...two('forearm',e3([1.08,1,1.08])),...two('hand',e3([1.08,1.04,1.08])),...two('thigh',e3([1.02,1,1.02]))},
    female:{torso:e3([0.86,0.98,1.08]),neck:e3([0.84,1.04,0.84]),head:e3([0.95,0.97,0.95]),beard:e3([0.2,0.2,0.2],[0,1.5,-1.2]),hair:e3([1.1,1.75,1.16],[0,-5.5,-0.6]),hips:e3([1.18,1.04,1.1]),
      ...two('sleeve',e3([0.84,0.97,0.84])),...two('upperArm',e3([0.84,0.97,0.84])),...two('forearm',e3([0.84,1,0.84])),...two('hand',e3([0.84,0.9,0.84])),...two('thigh',e3([1.12,1,1.12])),...two('shin',e3([0.92,1,0.92])),...two('shoe',e3([0.85,0.92,0.85]))}};
  let body='current'; try{ body=SAVE.get('body')||'current'; }catch(e){}
  const drawBody=()=>P.querySelectorAll('[data-body]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.body===body)));
  P.querySelectorAll('[data-body]').forEach(b=>b.onclick=()=>{ snap(); body=b.dataset.body; W3.E=PCS.map(()=>null); const B0=BODIES[body]; for(const n in B0){ const i=NAMES.indexOf(n); if(i>=0)W3.E[i]=JSON.parse(JSON.stringify(B0[n])); }
    try{ SAVE.set('body',body); }catch(e){} save(); draw(); drawBody(); });
  drawBody();
  $('#eundo').onclick=undo; $('#eall').onclick=()=>{ snap(); W3.E=PCS.map(()=>null); PA.array.set(BASE); NA.array.set(NBASE); PA.needsUpdate=NA.needsUpdate=true; sculpted=false; save(); draw(); };
  $('#eload').onclick=()=>{ const f=document.createElement('input'); f.type='file'; f.accept='.json,application/json'; f.onchange=async()=>{ try{ snap(); if(unpack(JSON.parse(await f.files[0].text()))){ save(); draw(); } }catch(e){} }; f.click(); };
  $('#edone').onclick=()=>ED.exit();
  const cv=renderer.domElement; let drag=null;
  const ringAt=e=>{ if(mode!=='sculpt')return; const r=cv.getBoundingClientRect(), s=B.size/PPU*ppu*r.width/RW; ring.style.left=(e.clientX-s)+'px'; ring.style.top=(e.clientY-s)+'px'; ring.style.width=ring.style.height=(2*s)+'px'; };
  const inv=new THREE.Matrix4(), d3=new THREE.Vector3();
  let panD=null; ED.pickW=e=>{ const h=pick(e); return h?new THREE.Vector3(...h.p).applyMatrix4(W3.group.matrixWorld):null; };
  const toBody=(dx,dy)=>{ const r=cv.getBoundingClientRect(), k=RW/r.width/ppu; d3.setFromMatrixColumn(cam.matrixWorld,0).multiplyScalar(dx*k).addScaledVector(new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,1),-dy*k);
    inv.copy(W3.group.matrixWorld).invert().setPosition(0,0,0); return d3.applyMatrix4(inv); };
  cv.addEventListener('pointerdown',e=>{ if(!ED.on||e.button!==0)return; const h=pick(e);
    if(e.shiftKey||e.altKey){ UI.grab(e); panD={x:e.clientX,y:e.clientY,turn:true}; cv.setPointerCapture(e.pointerId); return; }
    if(!h&&!(ED.ext[mode]&&ED.ext[mode].down&&ED.ext[mode].down(h,e))){ panD={x:e.clientX,y:e.clientY}; cv.setPointerCapture(e.pointerId); return; }
    if(ED.ext[mode]){ if(h)setSel(h.piece); if(ED.ext[mode].down&&ED.ext[mode].down(h,e)){ drag={x:e.clientX,y:e.clientY}; cv.setPointerCapture(e.pointerId); } return; }
    if(mode==='sculpt'){ if(!h)return; snap(); brush(h); drag={x:e.clientX,y:e.clientY}; }
    else { if(h)setSel(h.piece); if(mode==='pieces'&&cur>=0){ snap(); drag={x:e.clientX,y:e.clientY}; } }
    if(drag)cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove',e=>{ if(!ED.on)return; ringAt(e); if(panD){ (panD.turn?UI.orbit:UI.pan)(e.clientX-panD.x,e.clientY-panD.y); panD={x:e.clientX,y:e.clientY,turn:panD.turn}; return; } if(!drag)return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y; drag={x:e.clientX,y:e.clientY};
    if(ED.ext[mode]){ if(ED.ext[mode].move)ED.ext[mode].move(dx,dy,e); return; }
    if(mode==='sculpt'){ const h=pick(e); if(h)brush(h); return; }
    if(mode==='pieces'&&cur>=0){
      if(gmode==='move'){ const d=toBody(dx,dy); setE(cur,E=>{ E.o[0]+=d.x; E.o[1]+=d.y; E.o[2]+=d.z; }); }
      else if(gmode==='scale'){ const k=Math.exp(-dy*0.01); setE(cur,E=>{ E.s=E.s.map(x=>Math.max(0.2,Math.min(4,x*k))); }); }
      else { const ax=new THREE.Vector3(); cam.getWorldDirection(ax); inv.copy(W3.group.matrixWorld).invert().setPosition(0,0,0); ax.applyMatrix4(inv).normalize(); const t=new THREE.Quaternion().setFromAxisAngle(ax,dx*0.012);
        setE(cur,E=>{ const q=new THREE.Quaternion(...E.q).premultiply(t); E.q=[q.x,q.y,q.z,q.w]; }); } } });
  cv.addEventListener('pointerup',()=>{ if(!ED.on)return; if(panD){ panD=null; return; } if(drag&&ED.ext[mode]){ drag=null; if(ED.ext[mode].up)ED.ext[mode].up(); return; } if(drag){ drag=null; if(sculpted)normals(); save(); draw(); } });
  let V0=null;
  for(const N of NPCS)UI.thing({name:N.name,npc:N,obj:N.g,reach:1.3,tall:N.H||1.8,act:()=>{ if(!st.move)RIG.act(st,'V'); setTimeout(()=>RIG.release(st,'V'),900); }});
  ED.enter=quiet=>{ if(UI.menuOpen)UI.toggleMenu(); if(UI.freeCam)UI.setFree(false); if(UI.fly)UI.setFly(false); target=null; ED.on=true; V0={yaw:yawTo,pitch:pitchTo,ppu:ppuTo,off:UI.off.clone()}; UI.off.set(0,0,0); pitchTo=clampP(0.22); ppuTo=Math.min(240,PPU*3.2); P.hidden=!!quiet; draw(); };
  ED.P=P; ED.B=B; ED.setMode=m=>{ mode=m; draw(); }; ED.show=m=>{ if(m)mode=m; P.hidden=false; draw(); }; ED.snap=()=>snap(); ED.undo=()=>undo(); ED.allBack=()=>$('#eall').onclick(); ED.pack=()=>pack2(); ED.unpack=o=>{ if(unpack(o)){ save(); draw(); } };
  ED.toe=k=>{ snap(); for(const [pi,n] of NAMES.entries()){ if(!/^shoe[LR]$/.test(n))continue; const vs=[]; let x0=1e9,x1=-1e9,y0=1e9,z0=1e9,z1=-1e9;
      for(let i=0;i<NV;i++)if((PI.array[i]|0)===pi){ vs.push(i); const x=BASE[i*3],y=BASE[i*3+1],z=BASE[i*3+2]; x0=Math.min(x0,x); x1=Math.max(x1,x); y0=Math.min(y0,y); z0=Math.min(z0,z); z1=Math.max(z1,z); }
      const xm=(x0+x1)/2, hw=(x1-x0)/2;
      for(const i of vs){ let x=BASE[i*3],y=BASE[i*3+1],z=BASE[i*3+2]; const t=(z-z0)/(z1-z0), f=Math.max(0,Math.min(1,(t-.5)/.5)), e=f*f*(3-2*f);
        if(k==='pointed'){ x=xm+(x-xm)*(1-.6*e); y=y0+(y-y0)*(1-.3*e); z+=e*1.6; }
        else if(k==='square'){ const a=Math.abs(x-xm); x=xm+Math.sign(x-xm)*Math.min(hw*.92,a+(hw*.92-a)*e*.8); z=Math.min(z,z1-.9)+(z>z1-.9?(z-(z1-.9))*.25:0); }
        PA.array[i*3]=x; PA.array[i*3+1]=y; PA.array[i*3+2]=z; } }
    sculpted=true; normals(); save(); draw(); try{ localStorage.setItem('market-toe',k); }catch(e){} };
  ED.HEADS={round:{w:1,h:1,d:1,sq:0,tp:0},oval:{w:.94,h:1.08,d:.98,sq:0,tp:0},square:{w:1.03,h:.98,d:1,sq:.85,tp:0},long:{w:.92,h:1.13,d:.96,sq:.2,tp:0},
    wide:{w:1.12,h:.93,d:1.02,sq:.2,tp:0},heart:{w:1.02,h:1.02,d:1,sq:0,tp:.2},pear:{w:1,h:1,d:1,sq:.25,tp:-.18}};
  ED.FACE0={shape:'round',nose:1,noseL:0,jaw:5.6,square:0,chin:0,ears:1,eyes:1}; ED.FACE=Object.assign({},ED.FACE0); try{ Object.assign(ED.FACE,JSON.parse(SAVE.get('face')||'{}')); }catch(e){}
  window.EDDBG=()=>({ED,W3});
  ED.face=(F,keep)=>{ if(!keep)snap(); Object.assign(ED.FACE,F||{}); F=ED.FACE; try{ SAVE.set('face',JSON.stringify(F)); }catch(e){}
    const ss=(a,b,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); }, kx=F.jaw/5.6;
    const HS=ED.HEADS[F.shape]||ED.HEADS.round;
    for(const [pi,n] of NAMES.entries()){ const hd=n==='head', ey=/^eyes\d$/.test(n), hr=/^hair(Pony|Long|Bun)?$/.test(n); if(!hd&&!ey&&!hr)continue;
      for(let i=0;i<NV;i++){ if((PI.array[i]|0)!==pi)continue; let x=BASE[i*3],y=BASE[i*3+1],z=BASE[i*3+2];
        if(ey){ const cx=Math.sign(x)*2.35; x=cx+(x-cx)*F.eyes; y=.7+(y-.7)*F.eyes; }
        else{ const t=ss(-2,-6,y);
          { const w=1-ss(1.3,2.6,Math.hypot(x,y+2.6,z-6.5)); if(w>0&&z>5){ const c=[0,-2.6,6.0], k=1+(F.nose-1)*w; x=c[0]+(x-c[0])*k; y=c[1]+(y-c[1])*k; z=c[2]+(z-c[2])*k+F.noseL*w*1.2; } }
          { const ex=Math.sign(x)*6.8, w=1-ss(1.5,2.8,Math.hypot(x-ex,y+1.8,z+1)); if(w>0&&Math.abs(x)>5.4){ const k=1+(F.ears-1)*w; x=ex+(x-ex)*k; y=-1.8+(y+1.8)*k; z=-1+(z+1)*k; } }
          x*=1+(kx-1)*t;
          if(F.square>0&&t>0){ const cz=.8, dz=z-cz, r=Math.hypot(x,dz), a=Math.atan2(dz,x), f=Math.min(1.3,1/Math.max(Math.abs(Math.cos(a)),Math.abs(Math.sin(a)))), k=1+(f-1)*F.square*t*.55; x*=k; z=cz+dz*k; }
          if(F.chin){ const w=ss(-5,-9,y)*ss(1,4,z); z+=F.chin*1.2*w; y-=F.chin*.7*w; } }
        { y*=HS.h; x*=HS.w*(1+HS.tp*y/8); z*=HS.d;
          if(HS.sq){ const t=ss(-5,-2,y), cz=-.2, dz=z-cz, a=Math.atan2(dz,x), f=Math.min(1.25,1/Math.max(Math.abs(Math.cos(a)),Math.abs(Math.sin(a)))), k=1+(f-1)*HS.sq*t*.5; x*=k; z=cz+dz*k; } }
        PA.array[i*3]=x; PA.array[i*3+1]=y; PA.array[i*3+2]=z; } }
    sculpted=true; normals(); save(); draw(); };
  ED.exit=()=>{ if(ED.onExit)ED.onExit(); ED.on=false; P.hidden=true; sel.visible=false; ring.hidden=true; drag=null; if(V0){ yawTo=V0.yaw; pitchTo=V0.pitch; ppuTo=V0.ppu; UI.off.copy(V0.off); } save(); };
  ED.tick=()=>{ W3.group.updateMatrixWorld(); sel.matrix.copy(W3.group.matrixWorld); sel.matrixWorldNeedsUpdate=true; if(dirty){ dirty=false; normals(); } };
}
