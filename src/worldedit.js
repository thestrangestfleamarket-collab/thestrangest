// ---- EDIT THE WORLD (owner, 17 Oct 2026: "shift + e is edit mode where if i double click something i get option to move it around or delete,
// change it (size, direction, shape, color, opaque, etc) ... let me also type something in a box to describe the change and you do it").
// Shift+E in and out. A double click on a thing (the shop's things, the station's benches, columns, signs, signals, the train) picks it, lit
// by a box; then: drag it along the ground, the arrows and UP / DOWN, TURN, SIZE (all of it, or its width, height, depth), COLOUR (a tint),
// SEE-THROUGH (dithered, the pixel art's way), DELETE, back as it was. DESCRIBE: a change in words, Claude turns it into these same edits
// (on the artifact page, where the page may ask Claude). Kept in this browser; what he bumps into stays where it was (for now) ----
const WE={on:false};
{ const T=TILE, ST={}; let sel=null, box=null, drag=null;
  // a thing's faces: where they were made, their middle; its edit: moved (t), turned (r, degrees about up), sized (s), tint (col), see-through (op), gone (del)
  const base=o=>{ if(o.base)return o.base; const B=o.parts.map(p=>p.me.geometry.attributes.position.array.slice(p.v0*3,p.v0*3+18)); const c=new THREE.Vector3(); let n=0, y0=1e9;
    for(const a of B)for(let i=0;i<18;i+=3){ c.x+=a[i]; c.y+=a[i+1]; c.z+=a[i+2]; n++; y0=Math.min(y0,a[i+1]); } c.divideScalar(n||1); c.y=y0; o.base=B; o.c=c; return B; };
  const E0=()=>({t:[0,0,0],r:0,s:[1,1,1],col:'#ffffff',op:1,del:false});
  const stOf=o=>ST[o.id]||(ST[o.id]=E0());
  const v=new THREE.Vector3(), col=new THREE.Color(), touched=new Set();
  function apply(o){ const B=base(o), e=stOf(o), c=o.c, ca=Math.cos(e.r*Math.PI/180), sa=Math.sin(e.r*Math.PI/180); col.set(e.col);
    o.parts.forEach((p,k)=>{ const g=p.me.geometry, P=g.attributes.position.array, N=g.attributes.normal.array, C=g.attributes.aCol.array, O=g.attributes.aOp.array, a=B[k];
      for(let i=0;i<6;i++){ let x=(a[i*3]-c.x)*e.s[0], y=(a[i*3+1]-c.y)*e.s[1], z=(a[i*3+2]-c.z)*e.s[2]; const X=x*ca+z*sa, Z=-x*sa+z*ca;
        const j=(p.v0+i)*3; if(e.del){ P[j]=c.x; P[j+1]=c.y-50; P[j+2]=c.z; } else { P[j]=c.x+X+e.t[0]; P[j+1]=c.y+y+e.t[1]; P[j+2]=c.z+Z+e.t[2]; }
        C[j]=col.r; C[j+1]=col.g; C[j+2]=col.b; O[p.v0+i]=e.op; }
      for(const t0 of [p.v0,p.v0+3]){ const j=t0*3, ux=P[j+3]-P[j], uy=P[j+4]-P[j+1], uz=P[j+5]-P[j+2], wx=P[j+6]-P[j], wy=P[j+7]-P[j+1], wz=P[j+8]-P[j+2];   // (its faces' new facing, for the light)
        let nx=uy*wz-uz*wy, ny=uz*wx-ux*wz, nz=ux*wy-uy*wx; const l=Math.hypot(nx,ny,nz)||1; for(let q=0;q<3;q++){ N[j+q*3]=nx/l; N[j+q*3+1]=ny/l; N[j+q*3+2]=nz/l; } }
      g.attributes.position.needsUpdate=g.attributes.normal.needsUpdate=g.attributes.aCol.needsUpdate=g.attributes.aOp.needsUpdate=true; touched.add(g); }); }
  // after a change: the bounds for clicking and the lamps' shadows drawn again (they're drawn once, so they'd still show it where it was)
  let reshade=0; const settle=()=>{ for(const g of touched)g.computeBoundingSphere(); touched.clear(); clearTimeout(reshade); reshade=setTimeout(()=>{ scene.traverse(L=>{ if(L.isLight&&L.castShadow&&L.shadow&&L.shadow.autoUpdate===false)L.shadow.needsUpdate=true; }); },250); };
  const save=()=>{ try{ localStorage.setItem('market-world',JSON.stringify(ST)); }catch(e){} };
  try{ Object.assign(ST,JSON.parse(localStorage.getItem('market-world')||'{}')); for(const o of OBJS)if(ST[o.id])apply(o); settle(); }catch(e){}
  // ---- THE PANEL
  const css=document.createElement('style'); css.textContent=`
  #we{position:fixed;right:calc(12px + env(safe-area-inset-right,0px));top:12px;width:300px;max-height:calc(100vh - 24px);overflow:auto;background:var(--bg);border:2px solid var(--line);font:12px var(--pixel);color:var(--fg);z-index:20}
  #we[hidden]{display:none} #we h2{font:12px var(--pixel);color:var(--key);margin:0;padding:12px 14px;border-bottom:2px solid var(--line)} #we .pane{padding:10px 14px}
  #we .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:6px 0} #we .btn{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 8px;cursor:pointer}
  #we .dim{color:var(--dim)} #we .lab{width:84px} #we input[type=range]{width:140px} #we textarea{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;width:100%;box-sizing:border-box;min-height:56px;padding:6px}
  #we input[type=color]{width:44px;height:26px;border:2px solid #3a3f4e;background:#0e1016;padding:0}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='we'; P.hidden=true; P.innerHTML=`<h2>EDIT THE WORLD</h2><div class="pane">
    <div class="dim" id="wname">double-click a thing to pick it</div>
    <div id="wtools" hidden>
      <div class="row"><span class="lab">MOVE</span><button class="btn" data-mv="-1,0">◀</button><button class="btn" data-mv="1,0">▶</button><button class="btn" data-mv="0,-1">▲</button><button class="btn" data-mv="0,1">▼</button><button class="btn" data-up="1">UP</button><button class="btn" data-up="-1">DOWN</button></div>
      <div class="dim">or drag it along the ground</div>
      <div class="row"><span class="lab">TURN</span><button class="btn" data-turn="-15">⟲ 15°</button><button class="btn" data-turn="15">⟳ 15°</button><button class="btn" data-turn="90">90°</button></div>
      <div class="row"><span class="lab">SIZE</span><input type="range" id="wsz" min="0.2" max="3" step="0.01"></div>
      <div class="row"><span class="lab">WIDTH</span><input type="range" data-ax="0" min="0.2" max="3" step="0.01"></div>
      <div class="row"><span class="lab">HEIGHT</span><input type="range" data-ax="1" min="0.2" max="3" step="0.01"></div>
      <div class="row"><span class="lab">DEPTH</span><input type="range" data-ax="2" min="0.2" max="3" step="0.01"></div>
      <div class="row"><span class="lab">COLOUR</span><input type="color" id="wcol"><button class="btn" id="wcol0">NONE</button></div>
      <div class="row"><span class="lab">SEE-THROUGH</span><input type="range" id="wop" min="0" max="0.9" step="0.01"></div>
      <div class="row"><button class="btn" id="wdel">DELETE</button><button class="btn" id="wback">BACK AS IT WAS</button></div>
      <div class="dim" style="margin-top:10px">DESCRIBE A CHANGE</div><textarea id="wsay" placeholder="e.g. make it twice as tall and dark red, turn it to face the door"></textarea>
      <div class="row"><button class="btn" id="wdo">DO IT</button><span class="dim" id="wans"></span></div></div>
    <div class="row" style="margin-top:10px"><button class="btn" id="wall">EVERYTHING BACK</button><button class="btn" id="wout">DONE (SHIFT+E)</button></div>
    <div class="dim">what he bumps into stays where it was, for now</div></div>`;
  document.body.appendChild(P); const $=s=>P.querySelector(s);
  function draw(){ $('#wtools').hidden=!sel; $('#wname').textContent=sel?'PICKED: '+sel.name.toUpperCase()+' ('+sel.place+')':'double-click a thing to pick it'; if(!sel)return; const e=stOf(sel);
    $('#wsz').value=Math.cbrt(e.s[0]*e.s[1]*e.s[2]); P.querySelectorAll('[data-ax]').forEach(i=>i.value=e.s[+i.dataset.ax]); $('#wcol').value=e.col; $('#wop').value=1-e.op; }
  function frame(){ if(box){ scene.remove(box); box=null; } if(!sel||stOf(sel).del)return; const b=new THREE.Box3(); for(const p of sel.parts){ const a=p.me.geometry.attributes.position.array; for(let i=0;i<6;i++)b.expandByPoint(v.fromArray(a,(p.v0+i)*3)); }
    box=new THREE.Box3Helper(b,0xf2c14e); scene.add(box); }
  const change=f=>{ if(!sel)return; f(stOf(sel)); apply(sel); settle(); save(); frame(); draw(); };
  // the camera's right and its forward along the ground, for the arrows and the drag
  const ground=()=>{ const r=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0); r.y=0; r.normalize(); const f=new THREE.Vector3(-r.z,0,r.x); return [r,f]; };
  P.querySelectorAll('[data-mv]').forEach(b=>b.onclick=()=>{ const [dx,dz]=b.dataset.mv.split(',').map(Number), [r,f]=ground(); change(e=>{ e.t[0]+=(r.x*dx+f.x*dz)*.25*T; e.t[2]+=(r.z*dx+f.z*dz)*.25*T; }); });
  P.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>change(e=>{ e.t[1]+=+b.dataset.up*.1*T; }));
  P.querySelectorAll('[data-turn]').forEach(b=>b.onclick=()=>change(e=>{ e.r=(e.r+ +b.dataset.turn)%360; }));
  $('#wsz').oninput=ev=>change(e=>{ const k=+ev.target.value/Math.cbrt(e.s[0]*e.s[1]*e.s[2]); e.s=e.s.map(x=>x*k); });
  P.querySelectorAll('[data-ax]').forEach(i=>i.oninput=()=>change(e=>{ e.s[+i.dataset.ax]=+i.value; }));
  $('#wcol').oninput=ev=>change(e=>{ e.col=ev.target.value; }); $('#wcol0').onclick=()=>change(e=>{ e.col='#ffffff'; });
  $('#wop').oninput=ev=>change(e=>{ e.op=1-+ev.target.value; });
  $('#wdel').onclick=()=>{ change(e=>{ e.del=true; }); sel=null; frame(); draw(); };
  $('#wback').onclick=()=>change(e=>{ Object.assign(e,E0()); });
  $('#wall').onclick=()=>{ if(!confirm('Put everything back as it was?'))return; for(const o of OBJS)if(ST[o.id]){ ST[o.id]=E0(); apply(o); delete ST[o.id]; } settle(); save(); frame(); draw(); };
  $('#wout').onclick=()=>WE.toggle();
  // DESCRIBE: the words, the thing and where it stands to Claude; back, the same edits as the buttons make
  let sample=null; if(window.claude&&window.claude.use)window.claude.use('sample').then(s=>{ sample=s; }).catch(()=>{});   // (null away from the artifact page)
  $('#wdo').onclick=async()=>{ const say=$('#wsay').value.trim(); if(!sel||!say)return; if(!sample){ $('#wans').textContent='only on the artifact page (it asks Claude)'; return; }
    const e=stOf(sel), b=new THREE.Box3(); for(const p of sel.parts){ const a=p.me.geometry.attributes.position.array; for(let i=0;i<6;i++)b.expandByPoint(v.fromArray(a,(p.v0+i)*3)); } const sz=b.getSize(new THREE.Vector3()).divideScalar(T);
    const near=[...new Set(OBJS.filter(o=>o!==sel&&o.place===sel.place&&o.c&&o.c.distanceTo(sel.c||o.c)<6*T).map(o=>o.name))].slice(0,12);
    $('#wans').textContent='thinking…'; $('#wdo').disabled=true;
    try{ const r=await sample.json(`You edit one object in a small 3D pixel-art game world. Units: tiles (a tile is 84 cm), angles in degrees, +y is up.
The object: "${sel.name}" in the ${sel.place}. Its size now: ${sz.x.toFixed(2)} wide (x), ${sz.y.toFixed(2)} tall (y), ${sz.z.toFixed(2)} deep (z) tiles.
Its edit so far: moved ${JSON.stringify(e.t.map(x=>+(x/T).toFixed(2)))} tiles, turned ${e.r} degrees, scaled ${JSON.stringify(e.s)}, tint ${e.col}, opacity ${e.op}.
Things near it: ${near.join(', ')||'none'}.
The owner asks: "${say}"
Answer with JSON only, the change to make relative to now (leave out what doesn't change): {"move":[x,y,z] tiles,"turn":degrees,"scale":[x,y,z] multipliers,"color":"#rrggbb" tint or "#ffffff" for none,"opacity":0.1-1,"delete":true|false,"reply":"one short line saying what you did"}. If it can't be done with these, say so in reply and change nothing.`,{modelTier:'quick'});
      change(st=>{ if(Array.isArray(r.move))for(let k=0;k<3;k++)st.t[k]+=(+r.move[k]||0)*T; if(r.turn)st.r=(st.r+ +r.turn)%360; if(Array.isArray(r.scale))for(let k=0;k<3;k++)st.s[k]=Math.max(.05,Math.min(10,st.s[k]*(+r.scale[k]||1)));
        if(typeof r.color==='string'&&/^#[0-9a-f]{6}$/i.test(r.color))st.col=r.color; if(r.opacity!=null)st.op=Math.max(.1,Math.min(1,+r.opacity)); if(r.delete===true)st.del=true; });
      if(r.delete===true){ sel=null; frame(); draw(); } $('#wans').textContent=r.reply||'done'; }
    catch(err){ $('#wans').textContent=err&&err.code==='rate_limited'?'too many at once: try again in a moment':'that didn\'t work'+(err&&err.code?' ('+err.code+')':''); }
    $('#wdo').disabled=false; };
  // ---- IN AND OUT; PICKING (a double click); DRAGGING the picked thing along the ground
  WE.toggle=()=>{ WE.on=!WE.on; P.hidden=!WE.on; if(!WE.on){ sel=null; frame(); } draw(); UI.badge&&UI.badge(); };
  const ray=new THREE.Raycaster(), meshes=()=>[...new Set(OBJS.flatMap(o=>o.parts.map(p=>p.me)))].filter(m=>{ let q=m; while(q){ if(!q.visible)return false; q=q.parent; } return true; });
  const hitAt=e=>{ const r=renderer.domElement.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)),cam);
    for(const h of ray.intersectObjects(meshes(),false)){ const o=h.object.userData.objOf[Math.floor(h.faceIndex/2)]; if(o&&!(ST[o.id]&&ST[o.id].del))return {o,p:h.point}; return null; } return null; };
  WE.pick=e=>{ const h=hitAt(e); sel=h?h.o:null; if(sel)base(sel); frame(); draw(); };
  WE.down=e=>{ if(!WE.on||!sel||e.button!==0)return false; const h=hitAt(e); if(!h||h.o!==sel)return false; drag={y:h.p.y,last:h.p.clone()}; return true; };
  WE.move=e=>{ if(!drag)return; const r=renderer.domElement.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)),cam);
    const pl=new THREE.Plane(new THREE.Vector3(0,1,0),-drag.y), q=new THREE.Vector3(); if(!ray.ray.intersectPlane(pl,q))return; const dx=q.x-drag.last.x, dz=q.z-drag.last.z; drag.last.copy(q);
    const s=stOf(sel); s.t[0]+=dx; s.t[2]+=dz; apply(sel); frame(); };
  WE.up=()=>{ if(!drag)return; drag=null; settle(); save(); };
  Object.defineProperty(WE,'dragging',{get:()=>!!drag});
}
