// THE BLOCK: the robot clad in coloured cube tiles who sells puzzle cubes from a cart on Market St; a cube in your pack opens a real one to solve — drag a face to turn its layer, drag the background to turn the cube, solved when every side is one colour; your best times are kept.
import {THREE} from './003-shx.js';
import {FORAGE, keys, NPCS, SHOPS, UI} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {SOL, TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
const CUBE={on:null}; window.CUBE=CUBE;
{ const T=TILE, K=MERCH.K, {mk,grp,SPH,LATHE}=K, say=(t,c)=>FORAGE.say&&FORAGE.say(t,c||'#e8e2cc');
  const SIZES={cube2:2,cube3:3,cube4:4}; FORAGE.add({names:{cube2:'POCKET PUZZLE CUBE (2)',cube3:'PUZZLE CUBE (3)',cube4:'MASTER PUZZLE CUBE (4)'}});
  const COL=[0xc8202a,0xf07818,0xf2f2ee,0xf2d218,0x1a4ec8,0x1a9a3a];   // +x red, -x orange, +y white, -y yellow, +z blue, -z green
  let best={}; try{ best=JSON.parse(OWNED.get('cubebest')||'{}')||{}; }catch(e){}

  /* ---------- the window: its own little renderer, the cube in the middle ---------- */
  const W=document.createElement('div'); W.hidden=true; W.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:22;background:#0b0d13f4;border:2px solid #3a3f4e;padding:10px;font:11px Silkscreen,monospace;color:#d8dae2;zoom:var(--uiz,1)';
  W.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b data-t style="color:#f2c14e">PUZZLE CUBE</b><span data-s></span></div><canvas width="420" height="420" style="display:block;cursor:grab;touch-action:none"></canvas><div style="margin-top:6px;display:flex;gap:6px;justify-content:space-between"><span style="color:#9b9584">DRAG A FACE TO TURN IT · DRAG THE DARK TO LOOK ROUND</span><span><button data-m style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer">MIX</button> <button data-x style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer">PUT AWAY</button></span></div>';
  document.body.appendChild(W); const CV=W.querySelector('canvas'), ST=W.querySelector('[data-s]'), TI=W.querySelector('[data-t]');
  for(const ev of ['keydown','keyup'])W.addEventListener(ev,e=>{ if(e.key==='Escape')CUBE.close(); e.stopPropagation(); });
  let R=null, S=null, C=null, root=null, cubies=[], N=3, anim=null, queue=[], moves=0, t0=0, solved=false, run=0;
  const V=THREE.Vector3;
  const build=n=>{ N=n; if(!R){ R=new THREE.WebGLRenderer({canvas:CV,antialias:true}); R.setPixelRatio(1); R.outputColorSpace=THREE.SRGBColorSpace; S=new THREE.Scene(); S.background=new THREE.Color(0x101218); C=new THREE.PerspectiveCamera(32,1,.1,50);
      S.add(new THREE.HemisphereLight(0xffffff,0x40404a,1.6)); const d=new THREE.DirectionalLight(0xffffff,1.6); d.position.set(3,5,4); S.add(d); }
    anim=null; queue.length=0; if(root)S.remove(root); root=new THREE.Group(); S.add(root); cubies=[]; const h=(n-1)/2, sz=.96, body=new THREE.MeshStandardMaterial({color:0x111214,roughness:.5});
    for(let x=0;x<n;x++)for(let y=0;y<n;y++)for(let z=0;z<n;z++){ if(x>0&&x<n-1&&y>0&&y<n-1&&z>0&&z<n-1)continue; const g=new THREE.Group(); g.position.set(x-h,y-h,z-h);
      g.add(new THREE.Mesh(new THREE.BoxGeometry(sz,sz,sz),body));
      const st=(nx,ny,nz,c)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(.82,.82),new THREE.MeshStandardMaterial({color:c,roughness:.35})); m.position.set(nx*.485,ny*.485,nz*.485); m.lookAt(nx*2,ny*2,nz*2); m.userData.sticker=1; g.add(m); };
      if(x===n-1)st(1,0,0,COL[0]); if(x===0)st(-1,0,0,COL[1]); if(y===n-1)st(0,1,0,COL[2]); if(y===0)st(0,-1,0,COL[3]); if(z===n-1)st(0,0,1,COL[4]); if(z===0)st(0,0,-1,COL[5]);
      root.add(g); cubies.push(g); }
    root.rotation.set(.5,-.7,0); C.position.set(0,0,n*3.4+1.5); C.lookAt(0,0,0); };
  // a turn: every cubie whose coordinate on the axis is the layer, round the axis by a quarter (dir +1/-1), eased over 0.18 s, then snapped back to the grid
  const AX={x:new V(1,0,0),y:new V(0,1,0),z:new V(0,0,1)}, M4=new THREE.Matrix4();
  const turn=(ax,layer,dir)=>queue.push({ax,layer,dir});
  const grab=m=>{ const h=(N-1)/2, piv=new THREE.Group(); root.add(piv); const L=cubies.filter(c=>Math.round(c.position[m.ax]+h)===m.layer); for(const c of L)piv.attach(c); return {...m,piv,L,t:0,T:.18}; };
  // a finished turn puts every cubie back on the grid: its place to the half, its turn to the quarter
  const land=a=>{ a.piv.setRotationFromAxisAngle(AX[a.ax],a.dir*Math.PI/2); a.piv.updateMatrixWorld(true); for(const c of a.L){ root.attach(c); c.position.set(Math.round(c.position.x*2)/2,Math.round(c.position.y*2)/2,Math.round(c.position.z*2)/2);
      M4.makeRotationFromQuaternion(c.quaternion); const e=M4.elements; for(let i=0;i<16;i++)e[i]=Math.round(e[i]); c.quaternion.setFromRotationMatrix(M4); } root.remove(a.piv); };
  const step=dt=>{ if(!anim){ const m=queue.shift(); if(m)anim=grab(m); return; } anim.t+=dt; const u=Math.min(1,anim.t/anim.T); anim.piv.setRotationFromAxisAngle(AX[anim.ax],anim.dir*Math.PI/2*u*u*(3-2*u));
    if(u>=1){ land(anim); anim=null; moves++; check(); } };
  // solved: on each of the six sides every sticker faces the same way and has the same colour
  const check=()=>{ const by={}, n=new V(); root.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();
    for(const c of cubies)for(const s of c.children)if(s.userData.sticker){ s.getWorldDirection(n); n.transformDirection(inv); const k=[Math.round(n.x),Math.round(n.y),Math.round(n.z)].join(); (by[k]=by[k]||new Set()).add(s.material.color.getHex()); }
    const ok=Object.values(by).every(s=>s.size===1); if(ok&&!solved&&moves>0){ solved=true; const sec=(performance.now()-t0)/1000, k='n'+N; if(!best[k]||sec<best[k]){ best[k]=sec; try{ OWNED.set('cubebest',JSON.stringify(best)); }catch(e){} }
      say('SOLVED IN '+sec.toFixed(1)+' S, '+moves+' TURNS. BEST '+best[k].toFixed(1)+' S.','#bff0a0'); } return ok; };
  CUBE.solved=()=>check();
  const mix=()=>{ if(anim){ land(anim); anim=null; } queue.length=0; const A=['x','y','z']; CUBE.log=[]; for(let i=0;i<N*10;i++){ const m={ax:A[Math.floor(Math.random()*3)],layer:Math.floor(Math.random()*N),dir:Math.random()<.5?1:-1}; CUBE.log.push(m); land(grab(m)); } t0=performance.now(); moves=0; solved=false; };
  CUBE.turn=(ax,l,d)=>turn(ax,l,d);
  /* ---------- the hands: a drag on a sticker picks the layer and the way, a drag elsewhere turns the cube ---------- */
  const rc=new THREE.Raycaster(), ndc=e=>{ const r=CV.getBoundingClientRect(); return new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1)); };
  let drag=null;
  CV.addEventListener('pointerdown',e=>{ CV.setPointerCapture(e.pointerId); rc.setFromCamera(ndc(e),C); const hit=rc.intersectObjects(cubies,true).find(h=>h.object.userData.sticker); drag={x:e.clientX,y:e.clientY,hit,done:false}; });
  CV.addEventListener('pointermove',e=>{ if(!drag||drag.done)return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y; if(!drag.hit){ root.rotation.y+=dx*.01; root.rotation.x+=dy*.01; drag.x=e.clientX; drag.y=e.clientY; return; }
    if(Math.hypot(dx,dy)<14||anim||queue.length)return; drag.done=true; const h=drag.hit, inv=new THREE.Matrix4().copy(root.matrixWorld).invert(), n=new V(); h.object.getWorldDirection(n); n.transformDirection(inv).round();
    const p=h.point.clone().applyMatrix4(inv), cand=['x','y','z'].filter(a=>Math.abs(n[a])<.5); let bestA=null, bs=0, sg=1;
    for(const a of cand){ const p2=p.clone(); p2[a]+=.5; const s0=h.point.clone().project(C), s1=p2.applyMatrix4(root.matrixWorld).project(C), sx=(s1.x-s0.x), sy=-(s1.y-s0.y), L=Math.hypot(sx,sy)||1, d=(sx*dx+sy*dy)/L/Math.hypot(dx,dy); if(Math.abs(d)>bs){ bs=Math.abs(d); bestA=a; sg=Math.sign(d); } }
    if(!bestA)return; const axis=['x','y','z'].find(a=>a!==bestA&&Math.abs(n[a])<.5), m=new V(); m[bestA]=sg; const ax=new V(); ax[axis]=1; const dir=Math.sign(new V().crossVectors(n,m).dot(ax))||1;
    const cub=h.object.parent, layer=Math.round(cub.position[axis]+(N-1)/2); turn(axis,layer,dir,false); });
  CV.addEventListener('pointerup',()=>{ drag=null; });
  W.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; if(b.dataset.x!==undefined)CUBE.close(); if(b.dataset.m!==undefined)mix(); });
  let last=0; const loop=(t,k)=>{ if(!CUBE.on||k!==run)return; const dt=Math.min(.05,(t-last)/1000||0); last=t; step(dt); R.render(S,C); ST.textContent=solved?'SOLVED':(((performance.now()-t0)/1000).toFixed(0)+' S · '+moves+' TURNS'+(best['n'+N]?' · BEST '+best['n'+N].toFixed(1)+' S':'')); requestAnimationFrame(t=>loop(t,k)); };
  CUBE.open=id=>{ const n=SIZES[id]; if(!n||!FORAGE.has(id))return; CUBE.on=id; build(n); TI.textContent=FORAGE.NM[id]; W.hidden=false; keys.clear(); mix(); last=performance.now(); const k=++run; requestAnimationFrame(t=>loop(t,k)); };
  CUBE.close=()=>{ CUBE.on=null; W.hidden=true; };
  FORAGE.ROWB.push(id=>SIZES[id]?[['PLAY','cube']]:[]); FORAGE.ACT.cube=id=>CUBE.open(id);

  /* ---------- him: a grey steel box head (a round lens, two studs, a row of dot holes), a black body and arms clad in scuffed coloured tiles, a woven waist ---------- */
  const TC=['#c8202a','#e87ab0','#f2d218','#2a6ad8','#2a9a4a','#ececec','#1a1a1c','#f07818'], STEEL='metal:#8a8c90', BLK='plastic:#18181a';
  const tiles=(g,w,h,d,seed)=>{ const nx=Math.max(1,Math.round(w/.1)), ny=Math.max(1,Math.round(h/.1)), sx=w/nx, sy=h/ny; for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){ const c=TC[Math.floor(K.hash3(i,j,seed)*TC.length)]; mk(g,new THREE.BoxGeometry(sx*.9,sy*.9,.012),'plastic:'+c,[-w/2+sx*(i+.5),-h/2+sy*(j+.5),d]); } };
  const model=()=>{ const sk=MERCH.skel({hipY:.95,neck:.52,shX:.24,shY:.42,upper:.29,fore:.27,hipX:.1}), {B}=sk;
    mk(B.torso,new THREE.BoxGeometry(.42,.48,.26,2,2,2),BLK,[0,.24,0]); tiles(grp(B.torso,[0,.24,.131]),.4,.46,0,3); tiles(grp(B.torso,[0,.24,-.131],[0,Math.PI,0]),.4,.46,0,5);
    mk(B.hips,new THREE.BoxGeometry(.36,.16,.24),'cloth:#7a3a2a',[0,-.06,0]); mk(B.torso,new THREE.CylinderGeometry(.06,.07,.1,20),BLK,[0,.53,0]);
    const H=grp(B.head,[0,.16,0]); mk(H,new THREE.BoxGeometry(.26,.24,.22,2,2,2),STEEL); for(const s of [1,-1]){ mk(H,new THREE.BoxGeometry(.05,.12,.12),STEEL,[.155*s,-.01,0]); mk(H,new THREE.CylinderGeometry(.012,.012,.07,12),STEEL,[.05*s,.15,0]); }
    mk(H,new THREE.CylinderGeometry(.035,.035,.03,24),'metal:#3a3a3e',[.03,0,.115],[Math.PI/2,0,0]); mk(H,SPH(.022,16,12),'glass:#101014',[.03,0,.13],[0,0,0],[1,1,.4]); for(let i=0;i<5;i++)mk(H,SPH(.006,8,6),'plain:#202022',[-.04+i*.02,-.07,.112]);
    for(let i=0;i<4;i++)mk(H,new THREE.BoxGeometry(.008,.04,.006),'plain:#303034',[-.09+i*.014,.05,.112]);
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      const ua=grp(B['upperArm'+n],[0,-.14,0]); mk(ua,new THREE.BoxGeometry(.12,.28,.12),BLK); tiles(grp(ua,[0,0,.061]),.11,.27,0,7+s); tiles(grp(ua,[.061*s,0,0],[0,s*Math.PI/2,0]),.11,.27,0,9+s); mk(B['upperArm'+n],new THREE.BoxGeometry(.16,.14,.16),BLK,[0,.0,0]); tiles(grp(B['upperArm'+n],[0,0,.081]),.15,.13,0,11+s);
      const fa=grp(B['forearm'+n],[0,-.13,0]); mk(fa,new THREE.BoxGeometry(.11,.26,.11),BLK); tiles(grp(fa,[0,0,.056]),.1,.25,0,13+s); tiles(grp(fa,[.056*s,0,0],[0,s*Math.PI/2,0]),.1,.25,0,15+s);
      mk(B['hand'+n],new THREE.BoxGeometry(.09,.12,.06),STEEL,[0,-.06,0]);
      mk(B['thigh'+n],new THREE.CylinderGeometry(.075,.065,.43,16),'cloth:#3a3036',[0,-.2,0]); mk(B['shin'+n],new THREE.CylinderGeometry(.065,.06,.43,16),'cloth:#3a3036',[0,-.2,0]); mk(B['shoe'+n],new THREE.BoxGeometry(.11,.08,.24),BLK,[0,-.06,.05]); }
    return sk; };
  const CART={g:null};
  MERCH.add({key:'block',label:'THE BLOCK',height:1.9,model,size:11,hd:0,
    after:(B,N)=>{ if(CART.g)CART.g.visible=N.g.visible; },
    idle:t=>{ const tw=(t%8)<3; return MERCH.pose({nod:tw?14:Math.sin(t*.5)*4,L:{ua:[tw?50:20,8],fa:[tw?90:30,-20]},R:{ua:[tw?50:20,-8],fa:[tw?90:30,20]}}); }});

  /* ---------- his cart: a striped awning, a pyramid of cubes, some half-turned ---------- */
  const cart=N=>{ const G=new THREE.Group(), std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.6,...o}), add=(geo,m,x,y,z)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); o.castShadow=o.receiveShadow=true; G.add(o); return o; };
    add(new THREE.BoxGeometry(1.5,.8,.8),std(0x2a3a4a),0,.55,0); for(const s of [-1,1]){ const w=add(new THREE.CylinderGeometry(.2,.2,.06,20),std(0x1a1a1a),s*.6,.2,.43); w.rotation.x=Math.PI/2; }
    for(const s of [-1,1])add(new THREE.CylinderGeometry(.02,.02,1.4,8),std(0xc0c0c0,{metalness:.6}),s*.72,1.6,-.35);
    for(let i=0;i<8;i++){ const a=add(new THREE.BoxGeometry(.2,.03,1.1),std(i%2?0xf2ece0:0xc8302a),-.7+i*.2,2.28,-.05); a.rotation.x=.25; }
    const cols=COL; let k=0; for(let r=0;r<3;r++)for(let i=0;i<4-r;i++){ const g=new THREE.Group(); g.position.set(-.35+i*.24+r*.12,1.02+r*.2,0); for(let f=0;f<6;f++){ const m=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,.18),[0,1,2,3,4,5].map(q=>std(cols[(q+k+f)%6],{roughness:.35}))); if(f===0)g.add(m); } g.rotation.y=k*.4; G.add(g); k++; }
    G.scale.setScalar(T); const hd=N.st.hd; G.position.set(N.st.x+Math.sin(hd)*.9*T,N.st.y||0,N.st.z+Math.cos(hd)*.9*T); G.rotation.y=hd; N.g.parent.add(G); return G; };
  { const go=()=>{ const N=NPCS.extra.find(q=>q.key==='block'); if(!window.__started||!N||!N.g)return setTimeout(go,800); const G=CART.g=cart(N);
      const hb=new THREE.Mesh(new THREE.BoxGeometry(1.6*T,1.4*T,1*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(G.position.x,.7*T,G.position.z); N.g.parent.add(hb);
      UI.thing({name:'THE BLOCK\'S CART',obj:hb,reach:2.2*T,near:3*T,tall:1.4*T,act:()=>{ if(SHOPS.open)SHOPS.open(N); }}); const x=G.position.x, z=G.position.z; SOL.up.push([x-.85*T,z-.5*T,x+.85*T,z+.5*T]); };
    go(); }
  window.CUBEDBG=()=>({on:CUBE.on,n:N,moves,solved,queue:queue.length,anim:!!anim,best});
}
