// SISTER PETTY: her table under a red parasol in Central Park, near the golems' cave; she sells petty curses (nothing magic: little transmitters and drones; legal, only annoying) — CURSE puts one on the nearest character or player: rats that follow them, a cloud that rains on them, a stink; a golem with rats at its feet fights the rats and forgets the cave.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, NPCS, ONLINE, pos, SHOPS, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {SOL, SYS, TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
import {GOLEMS} from './146e-golems.js';
const CURSE={list:[],T:60}; window.CURSE=CURSE;
{ const T=TILE, K=MERCH.K, {mk,grp,SPH,LATHE,drape}=K, say=(t,c)=>FORAGE.say&&FORAGE.say(t,c||'#e8e2cc'), now=()=>performance.now()/1000;
  const KINDS={curse_rats:{name:'RATS ON A STRING',what:'rats'},curse_cloud:{name:'A RAIN CLOUD',what:'cloud'},curse_stink:{name:'A STINK',what:'stink'}};
  FORAGE.add({names:Object.fromEntries(Object.entries(KINDS).map(([k,v])=>[k,v.name]))});

  /* ---------- what each curse draws: rats (smooth little bodies that scurry round the target's feet), a cloud drone that rains, a green stink rising ---------- */
  const rat=()=>{ const G=new THREE.Group(), fur=new THREE.MeshStandardMaterial({color:0x5a5048,roughness:.9}), pink=new THREE.MeshStandardMaterial({color:0xc89088,roughness:.7});
    const b=new THREE.Mesh(new THREE.CapsuleGeometry(.05,.1,6,12),fur); b.rotation.x=Math.PI/2; b.position.y=.05; G.add(b); const h=new THREE.Mesh(new THREE.ConeGeometry(.04,.09,12),fur); h.rotation.x=Math.PI/2; h.position.set(0,.06,.12); G.add(h);
    for(const s of [-1,1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(.018,10,8),pink); e.position.set(s*.03,.1,.09); G.add(e); }
    const tail=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,.04,-.1),new THREE.Vector3(.03,.02,-.2),new THREE.Vector3(-.02,.01,-.3)]),10,.007,6),pink); G.add(tail); G.scale.setScalar(T); return G; };
  const cloud=()=>{ const G=new THREE.Group(), m=new THREE.MeshStandardMaterial({color:0x8a8e96,roughness:1}); for(let i=0;i<7;i++){ const p=new THREE.Mesh(new THREE.SphereGeometry(.18+.08*Math.sin(i*2.1),16,12),m); p.position.set(Math.cos(i*.9)*.25,Math.sin(i*1.7)*.06,Math.sin(i*.9)*.18); G.add(p); }
    const N=60, P=new Float32Array(N*6); const rg=new THREE.BufferGeometry(); rg.setAttribute('position',new THREE.BufferAttribute(P,3)); const rain=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0xa8c0e0,transparent:true,opacity:.6})); rain.frustumCulled=false; G.add(rain); G.userData.rain=rain; G.scale.setScalar(T); return G; };
  const stink=()=>{ const G=new THREE.Group(), m=new THREE.MeshBasicMaterial({color:0x8ad04a,transparent:true,opacity:.45,depthWrite:false}); for(let i=0;i<5;i++){ const c=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([0,1,2,3,4].map(k=>new THREE.Vector3(Math.sin(k*1.4+i)*.08,k*.18,Math.cos(k*1.2+i)*.06))),16,.012,5),m); c.position.set(Math.cos(i*1.26)*.18,.4,Math.sin(i*1.26)*.18); G.add(c); } G.scale.setScalar(T); return G; };

  /* ---------- who: the nearest character (any walking body, a golem) or player within 7 tiles who is not you ---------- */
  const where=t=>t.N?{x:t.N.st.x,z:t.N.st.z,y:t.N.g?t.N.g.position.y:0}:t.id?(()=>{ const o=ONLINE.others&&ONLINE.others.get(t.id); return o&&o.p?{x:o.p.x,z:o.p.z,y:o.p.y||0}:null; })():{x:pos.x,z:pos.z,y:SHARED.py};
  const nearest=()=>{ let best=null, bd=7*T; const all=NPCS.concat(NPCS.extra||[]).concat((window.GOLEMS&&GOLEMS.list||[]).map(r=>r.N));
    for(const N of all){ if(!N||!N.st||N.key==='petty'||N.g&&!N.g.visible||N.lv&&N.lv!==SHARED.LVL)continue; const d=Math.hypot(N.st.x-pos.x,N.st.z-pos.z); if(d<bd){ bd=d; best={N}; } }
    for(const [id,o] of ONLINE.others||[]){ if(!o.p||o.why!=='near you')continue; const d=Math.hypot(o.p.x-pos.x,o.p.z-pos.z); if(d<bd){ bd=d; best={id,name:o.name}; } } return best; };
  const make={rats:()=>[0,1,2,3].map(rat),cloud:()=>[cloud()],stink:()=>[stink()]};
  // rats loose in a group of golems busy them all
  CURSE.put=(what,tgt,silent)=>{ const fx=make[what](); for(const m of fx){ m.userData.anyRoom=true; scene.add(m); } const c={what,tgt,until:now()+CURSE.T,fx,ph:Math.random()*6}; CURSE.list.push(c);
    if(tgt.N){ tgt.N.distract=c.until; if(what==='rats')for(const r of window.GOLEMS&&GOLEMS.list||[]){ const q=r.N; if(q!==tgt.N&&Math.hypot(q.st.x-tgt.N.st.x,q.st.z-tgt.N.st.z)<6*T){ q.distract=c.until; c.also=(c.also||[]).concat(q); } } } return c; };
  CURSE.cast=id=>{ const k=KINDS[id]; if(!k||!FORAGE.has(id))return; const t=nearest(); if(!t)return say('NO ONE CLOSE ENOUGH TO CURSE.','#c8a090');
    FORAGE.take(id,1); if(FORAGE.draw)FORAGE.draw(); CURSE.put(k.what,t); if(t.id&&ONLINE.send)ONLINE.send({t:'curse',to:t.id,k:k.what});
    say((t.N?(t.N.name||'THEM'):(t.name||'THEM'))+': '+({rats:'THE RATS FIND THEM.',cloud:'A LITTLE CLOUD SETTLES OVER THEM.',stink:'OH. OH NO.'}[k.what]),'#b8d890'); };
  // a curse on someone else reaches every player near them; one on you shows on you
  ONLINE.hear.curse=msg=>{ if(!msg||!/^(rats|cloud|stink)$/.test(msg.k))return; const tgt=msg.to===ONLINE.me?{}:{id:msg.to}; CURSE.put(msg.k,tgt,true); if(!tgt.id)say(({rats:'RATS. FOLLOWING YOU.',cloud:'A CLOUD FOLLOWS YOU. IT IS RAINING ON YOU.',stink:'YOU SMELL. EVERYONE CAN TELL.'})[msg.k],'#c8a090'); };
  FORAGE.ROWB.push(id=>KINDS[id]?[['CURSE THE NEAREST','curse']]:[]); FORAGE.ACT.curse=id=>CURSE.cast(id);

  SYS.add('life',dt=>{ dt=dt||0; const t=now(); for(let i=CURSE.list.length-1;i>=0;i--){ const c=CURSE.list[i], p=where(c.tgt);
      if(!p||t>c.until){ for(const m of c.fx)m.removeFromParent(); if(c.tgt.N&&c.tgt.N.distract<=c.until)c.tgt.N.distract=0; for(const q of c.also||[])if(q.distract<=c.until)q.distract=0; CURSE.list.splice(i,1); continue; }
      if(c.what==='rats'){ c.fx.forEach((m,k)=>{ const a=c.ph+t*(1.6+k*.3)+k*1.57, r=(.6+.25*Math.sin(t*2+k))*T, x=p.x+Math.cos(a)*r, z=p.z+Math.sin(a)*r; m.position.set(x,p.y+.01,z); m.rotation.y=-a; m.position.y+=Math.abs(Math.sin(t*14+k))*.03*T; });
        if(c.tgt.N){ const R=c.fx[Math.floor(t)%4].position; c.tgt.N.distractAt={x:R.x,z:R.z}; for(const q of c.also||[])q.distractAt={x:R.x,z:R.z}; } }
      if(c.what==='cloud'){ const m=c.fx[0]; m.position.set(p.x,p.y+2.6*T,p.z); const r=m.userData.rain, P=r.geometry.attributes.position; for(let j=0;j<60;j++){ const u=((j*.137+t*1.8)%1), x=Math.sin(j*12.9)*.3, z=Math.cos(j*7.1)*.25, y=-u*2.3; P.setXYZ(j*2,x,y,z); P.setXYZ(j*2+1,x,y-.12,z); } P.needsUpdate=true; }
      if(c.what==='stink'){ const m=c.fx[0]; m.position.set(p.x,p.y,p.z); m.rotation.y=t*.4; m.children.forEach((q,k)=>{ q.position.y=.4+((t*.35+k*.2)%1)*.5; q.material.opacity=.45; });
        for(const N of NPCS){ if(!N.st||N===c.tgt.N||N.lv&&N.lv!==SHARED.LVL)continue; const dx=N.st.x-p.x, dz=N.st.z-p.z, d=Math.hypot(dx,dz); if(d<3*T&&d>.01&&!N.st.hold){ N.st.to={x:p.x+dx/d*4.5*T,z:p.z+dz/d*4.5*T}; N.st.next=null; } } } } },'146o-petty');

  /* ---------- her: a black wimple and veil, a pale blue mask to the brows with a silver spike and jewelled cross-bar, a red ruff, a fitted blue gown ---------- */
  const BLK='cloth:#16141a', BLUE='cloth:#4a78c0', MASK='plastic:#8ab4e0', SKN='skin:#e6c8b4', SIL='metal:#d0d0d4', RED='cloth:#a82a2a';
  const model=()=>{ const sk=MERCH.skel({hipY:.92,neck:.48,shX:.18,shY:.4,upper:.28,fore:.25,hipX:.085}), {B}=sk;
    mk(B.torso,LATHE([[.13,-.06],[.15,.08],[.16,.22],[.17,.32],[.15,.42],[.09,.48],[.05,.5]],28,.75),BLUE); mk(B.torso,drape(new THREE.TorusGeometry(.085,.03,12,32),.012),RED,[0,.47,0],[Math.PI/2-.1,0,0],[1.15,1,1]);
    mk(B.torso,drape(new THREE.LatheGeometry([[.0,.6],[.12,.55],[.2,.42],[.24,.25],[.26,.05]].map(p=>new THREE.Vector2(p[0],p[1])),28,Math.PI*.55,Math.PI*.9),.01),BLK,[0,0,-.03],[0,0,0],[1,1,.8]);
    mk(B.hips,drape(LATHE([[.14,.05],[.17,-.1],[.22,-.4],[.26,-.75],[.28,-.88]],32,.85),.01),BLUE);
    const H=grp(B.head,[0,.15,.01]); mk(H,SPH(.1,32,24),SKN,[0,0,0],[0,0,0],[.85,1.1,.95]);
    mk(H,SPH(.104,32,20,-Math.PI*.7,Math.PI*1.4,0,Math.PI*.62),MASK,[0,.005,.006],[0,Math.PI,0],[.87,1.12,.98]); for(const s of [1,-1])mk(H,SPH(.016,12,8),'plain:#dce8f8',[.035*s,.005,.088],[0,0,0],[1.3,.7,.5]);
    for(const s of [1,-1])mk(H,SPH(.008,10,8),'plain:#5a88b8',[.035*s,.005,.094]); mk(H,new THREE.TorusGeometry(.012,.004,8,16),'plain:#a82a3a',[0,-.055,.083],[0,0,0],[1.3,.6,1]);
    mk(H,new THREE.ConeGeometry(.008,.12,10),SIL,[0,.16,.07],[-.2,0,0]); mk(H,new THREE.BoxGeometry(.08,.008,.01),SIL,[0,.1,.092]); mk(H,SPH(.008,10,8),'plain:#b01818',[0,.1,.098]);
    mk(H,drape(SPH(.13,32,24,Math.PI/2+.85,Math.PI*2-1.7,0,Math.PI*.72),.008),BLK,[0,.01,-.01],[0,0,0],[1,1.08,1.02]); mk(H,drape(new THREE.LatheGeometry([[.13,.0],[.15,-.12],[.18,-.25]].map(p=>new THREE.Vector2(p[0],p[1])),28,Math.PI*.4,Math.PI*1.2),.01),BLK,[0,-.02,-.02]);
    for(const s of [1,-1]){ const n=s>0?'L':'R'; mk(B['upperArm'+n],new THREE.CylinderGeometry(.05,.045,.29,18),BLUE,[0,-.13,0]); mk(B['upperArm'+n],SPH(.055,16,12),BLUE);
      mk(B['forearm'+n],new THREE.CylinderGeometry(.045,.05,.26,18),BLUE,[0,-.12,0]); const h=grp(B['hand'+n]); h.rotation.y=-s*Math.PI/2; mk(h,new THREE.CapsuleGeometry(.026,.04,6,12),SKN,[0,-.045,0],[0,0,0],[1.15,1,.55]);
      for(let i=0;i<4;i++){ const f=grp(h,[-.02+i*.014,-.085,.003],[-.3,0,0]); mk(f,new THREE.CapsuleGeometry(.006,.038,4,8),SKN,[0,-.022,0]); }
      mk(B['thigh'+n],new THREE.CylinderGeometry(.06,.05,.42,16),BLUE,[0,-.2,0]); mk(B['shin'+n],new THREE.CylinderGeometry(.045,.04,.42,16),BLK,[0,-.2,0]); mk(B['shoe'+n],new THREE.CapsuleGeometry(.04,.12,6,12),'leather:#141216',[0,-.05,.04],[Math.PI/2,0,0],[1,1,.8]); }
    return sk; };
  const TABLE={g:null};
  MERCH.add({key:'petty',label:'SISTER PETTY',height:1.76,model,size:10,hd:0,
    idle:t=>{ const sq=(t%10)<2.5; return MERCH.pose({nod:4+Math.sin(t*.6)*3,yaw:Math.sin(t*.3)*8,L:{ua:[sq?52:28,-14],fa:[sq?70:90,-30]},R:{ua:[sq?50:28,-14],fa:[sq?72:90,-30]}}); },
    after:(B,N)=>{ if(TABLE.g)TABLE.g.visible=N.g.visible; }});

  /* ---------- her table: a blue cloth, a red parasol, rows of little black boxes with red labels, a skull-faced speaker box, a tray of jam biscuits, a dried root like a figure on a black box ---------- */
  const table=N=>{ const G=new THREE.Group(), std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.7,...o}), add=(geo,m,x,y,z,ry=0)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); o.rotation.y=ry; o.castShadow=o.receiveShadow=true; G.add(o); return o; };
    add(new THREE.BoxGeometry(1.6,.04,.7),std(0x3a5aa8),0,.76,0); for(const s of [-1,1])for(const q of [-1,1])add(new THREE.CylinderGeometry(.02,.02,.76,8),std(0x8a8a8a,{metalness:.6}),s*.72,.38,q*.3);
    const cl=add(new THREE.BoxGeometry(1.64,.3,.74),std(0x3a5aa8),0,.62,0); cl.scale.y=.5;
    for(let i=0;i<8;i++){ add(new THREE.BoxGeometry(.12,.08,.09),std(0x141418),-.45+(i%4)*.13,.82,.08+(i>3?.12:0)); add(new THREE.BoxGeometry(.1,.03,.002),std(0xa82a2a),-.45+(i%4)*.13,.82,.125+(i>3?.12:0)); }
    const sk=add(new THREE.BoxGeometry(.26,.3,.24),std(0x18161a),-.6,.93,-.1); const face=new THREE.Mesh(new THREE.SphereGeometry(.1,20,14),std(0xd8c8a0,{roughness:.5})); face.scale.set(1,1.1,.5); face.position.set(-.6,.93,.03); G.add(face);
    for(const s of [-1,1]){ const e=new THREE.Mesh(new THREE.SphereGeometry(.022,10,8),std(0x101010)); e.position.set(-.6+s*.035,.96,.075); G.add(e); }
    const tray=add(new THREE.BoxGeometry(.32,.04,.24),std(0xb89060),.15,.8,.1); for(let i=0;i<6;i++){ const b=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.015,14),std(i%2?0xd8b880:0xa82a30)); b.position.set(.06+(i%3)*.08,.83,.05+Math.floor(i/3)*.09); G.add(b); }
    add(new THREE.BoxGeometry(.2,.12,.16),std(0x141418),.55,.84,-.12); const root=new THREE.Group(); for(let i=0;i<9;i++){ const r=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(Math.sin(i)*.04,-.08,Math.cos(i)*.04),new THREE.Vector3(Math.sin(i)*.07,-.18,Math.cos(i*1.3)*.06)]),8,.008,5),std(0x5a3a28)); root.add(r); }
    const top=new THREE.Mesh(new THREE.SphereGeometry(.035,12,10),std(0x5a3a28)); top.position.y=.02; root.add(top); root.position.set(.55,1.1,-.12); G.add(root);
    const pole=add(new THREE.CylinderGeometry(.015,.015,2.1,8),std(0xd8d8d8,{metalness:.6}),-.2,1.05,-.4); const um=new THREE.Mesh(new THREE.ConeGeometry(1.2,.35,16,1,true),std(0xb02a2a,{side:THREE.DoubleSide,roughness:.8})); um.position.set(-.2,2.05,-.4); G.add(um);
    G.scale.setScalar(T); const hd=N.st.hd; G.position.set(N.st.x+Math.sin(hd)*.8*T,(N.st.y||0),N.st.z+Math.cos(hd)*.8*T); G.rotation.y=hd+Math.PI; N.g.parent.add(G); return G; };
  { const go=()=>{ const N=NPCS.extra.find(q=>q.key==='petty'); if(!window.__started||!N||!N.g)return setTimeout(go,800); TABLE.g=table(N);
      const hb=new THREE.Mesh(new THREE.BoxGeometry(1.8*T,1.2*T,1*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(TABLE.g.position.x,.6*T,TABLE.g.position.z); N.g.parent.add(hb);
      UI.thing({name:'SISTER PETTY\'S TABLE',obj:hb,reach:2.2*T,near:3.2*T,tall:1.2*T,act:()=>{ if(window.SHOPS&&SHOPS.open)SHOPS.open(N); }});
      const x=TABLE.g.position.x, z=TABLE.g.position.z; SOL.up.push([x-.85*T,z-.85*T,x+.85*T,z+.85*T]); };
    go(); }
  window.CURSEDBG=()=>CURSE.list.map(c=>({what:c.what,tgt:c.tgt.N?(c.tgt.N.key||c.tgt.N.name):c.tgt.id||'me',left:+(c.until-now()).toFixed(1)}));
}
