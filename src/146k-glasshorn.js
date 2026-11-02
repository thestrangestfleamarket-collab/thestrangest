// THE GLASS HORN: the busker of living glass outside the playhouse; her body (clear glass, a gold engraved cap under a white fur hood, a gold shoulder plate and collar, a tulle skirt), her gold trumpet with its glass bell, her fingers on its valves note by note, her songs (her own, or a MIDI file the owner uploads), played silently (no sound in the game, owner 2 Nov 2026), and the tips you drop in her cup.
import {SHARED, THREE} from './003-shx.js';
import {BUGS, FORAGE, INV, NPCS, pos, ROOMS, UI} from './003b-systems.js';
import {SYS, TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
const HORN={on:false,now:{m:0,v:0,valves:[0,0,0]},song:null,tips:0}; window.HORN=HORN;
{ const T=TILE, K=MERCH.K, {mk,grp,BOX,SPH,LATHE,drape}=K, say=(t,c)=>FORAGE.say&&FORAGE.say(t,c||'#e8e2cc');

  /* ---------- her body ---------- */
  const GL='glass:#a8d8d0', GLD='glass:#78b0a8', GOLD='metal:#d0a248', GOLDD='metal:#8a6424', FUR='fur:#eceae4', TUL='tulle:#efe6d8';
  const TUBE=(rt,rb,h,s=24)=>new THREE.CylinderGeometry(rt,rb,h,s,8,true);
  const model=()=>{ const sk=MERCH.skel({hipY:.92,neck:.49,shX:.19,shY:.4,upper:.28,fore:.25,thigh:.43,shin:.42,hipX:.085}), {B}=sk;
    mk(B.torso,LATHE([[.12,-.06],[.14,.06],[.15,.2],[.165,.3],[.17,.36],[.15,.42],[.1,.47],[.06,.5]],28,.75),GL);
    mk(B.torso,LATHE([[.0,.18],[.12,.2],[.15,.3],[.13,.38],[.0,.4]],20,.4),GOLD,[0,0,.07]);
    for(let i=0;i<5;i++)mk(B.torso,SPH(.012,10,8),GOLDD,[-.06+i*.03,.3+Math.sin(i)*.02,.14]);
    mk(B.torso,new THREE.TorusGeometry(.07,.022,12,28),GOLD,[0,.47,.0],[Math.PI/2-.15,0,0],[1.1,1,1]); for(let i=0;i<9;i++){ const a=i/9*Math.PI*2; mk(B.torso,SPH(.011,8,6),GOLDD,[Math.sin(a)*.08,.45,Math.cos(a)*.07]); }
    mk(B.torso,drape(LATHE([[.17,.4],[.2,.46],[.16,.52],[.08,.55]],24,.85),.01),FUR);
    mk(B.torso,SPH(.105,24,16,0,Math.PI*2,0,Math.PI*.55),GOLD,[-.2,.4,0],[0,0,.5],[1,.85,1.1]); for(let i=0;i<3;i++)mk(B.torso,new THREE.TorusGeometry(.085-i*.012,.006,8,24,Math.PI),GOLDD,[-.215,.43-i*.03,0],[0,Math.PI/2,.5]);
    mk(B.hips,drape(LATHE([[.13,.05],[.17,-.05],[.26,-.2],[.34,-.36],[.38,-.46]],32),.025),TUL); mk(B.hips,drape(LATHE([[.12,.04],[.2,-.12],[.3,-.3],[.33,-.4]],32),.02),TUL,[0,0,0],[0,.4,0]);
    mk(B.hips,TUBE(.13,.12,.1),GL,[0,-.02,0]);
    // the head: a smooth glass skull, a gold engraved cap with a boss over each ear, the white fur hood round it, muffs over the bosses
    const H=grp(B.head,[0,.17,.01]); H.scale.setScalar(1.12);
    const sg=new THREE.SphereGeometry(.11,48,36), sp=sg.attributes.position; for(let i=0;i<sp.count;i++){ let x=sp.getX(i), y=sp.getY(i), z=sp.getZ(i); const u=y/.11; if(u<0){ x*=1-.38*u*u; z*=1-.1*u*u; } if(z>0&&u<.1&&u>-.5)z+=.012*(1-Math.min(1,Math.abs(x)/.09)); sp.setXYZ(i,x,y*1.08,z); }
    mk(H,sg,GL); for(const s of [1,-1])mk(H,SPH(.028,16,12),GLD,[.04*s,.0,.09],[0,0,0],[1.2,.9,.5]); mk(H,new THREE.ConeGeometry(.012,.04,12),GL,[0,-.03,.115],[1.5,0,0]);
    mk(H,new THREE.CapsuleGeometry(.008,.03,4,10),GLD,[0,-.07,.098],[0,0,Math.PI/2]);
    mk(H,SPH(.122,40,24,0,Math.PI*2,0,Math.PI*.5),GOLD,[0,.012,-.008],[-.25,0,0],[1,1.02,1.05]); mk(H,new THREE.TorusGeometry(.115,.006,8,40),GOLDD,[0,.03,0],[Math.PI/2-.25,0,0]);
    for(const s of [1,-1]){ mk(H,new THREE.CylinderGeometry(.045,.045,.016,28),GOLD,[.118*s,.0,-.01],[0,0,Math.PI/2]); mk(H,new THREE.TorusGeometry(.033,.004,8,24),GOLDD,[.127*s,.0,-.01],[0,Math.PI/2,0]); mk(H,drape(SPH(.06,20,14),.008),FUR,[.15*s,.0,-.02],[0,0,0],[.6,1,1]); }
    mk(H,drape(new THREE.TorusGeometry(.13,.045,14,36),.012),FUR,[0,.02,-.02],[.15,0,0],[1,1.1,.85]); mk(H,drape(SPH(.075,20,14),.01),FUR,[0,.14,-.06]);
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['upperArm'+n],TUBE(.042,.036,.3),GL,[0,-.14,0]); mk(B['upperArm'+n],SPH(.05,18,12),GL);
      mk(B['forearm'+n],TUBE(.035,.03,.25),GL,[0,-.12,0]); for(let i=0;i<3;i++)mk(B['forearm'+n],new THREE.TorusGeometry(.034,.004,8,20),GOLD,[0,-.17-i*.02,0],[Math.PI/2,0,0]);
      for(let i=0;i<4;i++)mk(B['forearm'+n],SPH(.009,8,6),GLD,[Math.sin(i*1.6)*.032,-.24,Math.cos(i*1.6)*.032]);
      const h=grp(B['hand'+n],[0,0,0]); h.rotation.y=-s*Math.PI/2; mk(h,new THREE.CapsuleGeometry(.026,.04,6,12),GL,[0,-.04,0],[0,0,0],[1.15,1,.5]);
      for(let i=0;i<4;i++){ const f=grp(h,[-.022+i*.015,-.08,.003],[-.25,0,0]); mk(f,new THREE.CapsuleGeometry(.0065,.04,4,8),GL,[0,-.025,0]); const f2=grp(f,[0,-.05,0],[-.35,0,0]); mk(f2,new THREE.CapsuleGeometry(.006,.028,4,8),GL,[0,-.018,0]); }
      const t=grp(h,[.032,-.035,.012],[-.4,0,.6]); mk(t,new THREE.CapsuleGeometry(.007,.03,4,8),GL,[0,-.02,0]); }
    for(const s of [1,-1]){ const n=s>0?'L':'R'; mk(B['thigh'+n],TUBE(.05,.04,.43),GL,[0,-.2,0]); mk(B['shin'+n],TUBE(.04,.03,.42),GL,[0,-.2,0]); mk(B['shoe'+n],new THREE.CapsuleGeometry(.032,.12,6,12),GL,[0,-.05,.04],[Math.PI/2,0,0],[1,1,.7]); }
    return sk; };

  /* ---------- the trumpet: gold, its bell of glass, the three valves under her fingers; metres, the mouthpiece at 0, the bell toward +z ---------- */
  const gold=new THREE.MeshStandardMaterial({color:0xd8a844,metalness:.9,roughness:.28}), goldD=new THREE.MeshStandardMaterial({color:0xa07828,metalness:.9,roughness:.35}),
    glassM=new THREE.MeshStandardMaterial({color:0xcfeee8,metalness:.1,roughness:.05,transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false});
  const horn=()=>{ const G=new THREE.Group(), tube=(pts,r,m=gold)=>{ const c=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))); const o=new THREE.Mesh(new THREE.TubeGeometry(c,24,r,8),m); G.add(o); return o; };
    const mp=new THREE.Mesh(new THREE.CylinderGeometry(.012,.005,.05,12),goldD); mp.rotation.x=Math.PI/2; mp.position.z=.02; G.add(mp);
    tube([[0,0,.04],[0,0,.2],[0,0,.3],[0,-.02,.33],[0,-.045,.31],[0,-.05,.25]],.0055);
    tube([[0,-.05,.25],[0,-.05,.14],[0,-.05,.09],[0,-.07,.06],[0,-.095,.08],[0,-.1,.14],[0,-.1,.32]],.0058);
    const V=[]; for(let i=0;i<3;i++){ const z=.15+i*.033, c=new THREE.Mesh(new THREE.CylinderGeometry(.011,.011,.09,14),gold); c.position.set(0,-.06,z); G.add(c);
      const cap=new THREE.Mesh(new THREE.CylinderGeometry(.009,.009,.012,14),goldD); cap.position.set(0,-.01,z); G.add(cap); const stem=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.02,6),gold); stem.position.set(0,-.02,z); G.add(stem);
      const fing=new THREE.Mesh(new THREE.CapsuleGeometry(.0068,.025,4,10),glassM); fing.position.set(0,.008,z); fing.rotation.x=.25; G.add(fing); V.push({cap,stem,fing,z}); }
    const bell=new THREE.Mesh(new THREE.LatheGeometry([[.006,0],[.008,.06],[.013,.11],[.025,.15],[.05,.175],[.068,.185]].map(p=>new THREE.Vector2(...p)),28),glassM); bell.rotation.x=Math.PI/2; bell.position.set(0,-.1,.32); G.add(bell);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.067,.003,8,40),gold); rim.position.set(0,-.1,.505); G.add(rim); G.userData.V=V; return G; };

  /* ---------- the fingering: which valves each written note takes (a B-flat trumpet reads two semitones above what sounds) ---------- */
  const FING={54:'123',55:'13',56:'23',57:'12',58:'1',59:'2',60:'',61:'123',62:'13',63:'23',64:'12',65:'1',66:'2',67:'',68:'23',69:'12',70:'1',71:'2',72:'',73:'12',74:'1',75:'2',76:'',77:'1',78:'2',79:'',80:'23',81:'12',82:'1',83:'2',84:''};
  const valvesOf=m=>{ let w=Math.round(m)+2; while(w<54)w+=12; while(w>84)w-=12; const f=FING[w]||''; return [+f.includes('1'),+f.includes('2'),+f.includes('3')]; };

  /* ---------- her songs: notes [start beat, beats, written MIDI] in her own tunes, or a MIDI file's top voice ---------- */
  const SAINTS=[[0,1,72],[1,1,76],[2,1,77],[3,5,79],[8,1,72],[9,1,76],[10,1,77],[11,5,79],[16,1,72],[17,1,76],[18,1,77],[19,2,79],[21,2,76],[23,2,72],[25,2,76],[27,4,74],[31,1,76],[32,1,76],[33,1,74],[34,3,72],[37,1,72],[38,2,76],[40,2,79],[42,1,79],[43,1,79],[44,4,77],[48,1,76],[49,1,77],[50,2,79],[52,2,76],[54,2,72],[56,2,74],[58,5,72]];
  const blues=seed=>{ let s=seed; const r=()=>((s=(s*16807)%2147483647)/2147483647), SC=[72,75,77,78,79,82,84], out=[]; let b=0;
    for(let bar=0;bar<12;bar++){ const root=[0,0,0,0,5,5,0,0,7,5,0,7][bar]; let x=0; while(x<4){ const d=[.5,.5,1,1.5,1,2][Math.floor(r()*6)]; if(r()<.22){ x+=d; continue; } let m=SC[Math.floor(r()*SC.length)]+(root&&r()<.5?root-12+(root>5?0:12):0); if(m>86)m-=12; out.push([b+x,Math.min(d,4-x)*.92,m]); x+=d; } b+=4; } return out; };
  const tunes=()=>[{name:'WHEN THE SAINTS',bpm:112,notes:SAINTS},{name:'A SLOW BLUES',bpm:76,notes:blues(7)},{name:'ANOTHER BLUES',bpm:84,notes:blues(31)}];
  // a MIDI file (format 0 or 1): every note on/off with the tempo map, the top voice kept, moved into the horn's range
  HORN.midi=buf=>{ const d=new DataView(buf); let p=0; const u32=()=>{ const v=d.getUint32(p); p+=4; return v; }, u16=()=>{ const v=d.getUint16(p); p+=2; return v; }, vlq=()=>{ let v=0, b; do{ b=d.getUint8(p++); v=(v<<7)|(b&127); }while(b&128); return v; };
    if(u32()!==0x4d546864)throw new Error('not a MIDI file'); const hl=u32(), fmt=u16(), nt=u16(), div=u16(); p=14+hl-6; const ev=[], tempo=[[0,500000]];
    for(let k=0;k<nt&&p<d.byteLength;k++){ if(u32()!==0x4d54726b)break; const len=u32(), end=p+len; let tk=0, rs=0;
      while(p<end){ tk+=vlq(); let st=d.getUint8(p); if(st&128){ p++; rs=st; } else st=rs; const ty=st&240;
        if(st===255){ const mt=d.getUint8(p++), l=vlq(); if(mt===81)tempo.push([tk,(d.getUint8(p)<<16)|(d.getUint8(p+1)<<8)|d.getUint8(p+2)]); p+=l; }
        else if(st===240||st===247){ p+=vlq(); }
        else if(ty===144||ty===128){ const n=d.getUint8(p++), v=d.getUint8(p++); if((st&15)!==9)ev.push([tk,ty===144&&v>0?1:0,n,v]); }
        else if(ty===192||ty===208)p+=1; else p+=2; } p=end; }
    tempo.sort((a,b)=>a[0]-b[0]); const sec=tk=>{ let t=0, last=0, us=500000; for(const [at,v] of tempo){ if(at>tk)break; t+=(at-last)*us/div/1e6; last=at; us=v; } return t+(tk-last)*us/div/1e6; };
    ev.sort((a,b)=>a[0]-b[0]||a[1]-b[1]); const open=new Map(), notes=[]; for(const [tk,on,n,v] of ev){ if(on){ if(!open.has(n))open.set(n,[tk,v]); } else if(open.has(n)){ const [t0,v0]=open.get(n); open.delete(n); notes.push([sec(t0),Math.max(.06,sec(tk)-sec(t0)),n,v0/127]); } }
    notes.sort((a,b)=>a[0]-b[0]||b[2]-a[2]); const top=[]; for(const q of notes){ const L=top[top.length-1]; if(L&&q[0]<L[0]+L[1]-.02){ if(q[2]>L[2]&&q[0]-L[0]<.03)top[top.length-1]=q; continue; } top.push(q); }
    return top.slice(0,3000).map(([t,d,n,v])=>{ let w=n; while(w<58)w+=12; while(w>86)w-=12; return [t,d,w-2,v]; }); };

  /* ---------- playing: a song, a rest while she listens, the next; only while you are near enough to see her play ---------- */
  const P={i:0,t:0,sent:0,rest:4,list:tunes(),cur:null,beat:.5,src:'own'};
  const load=async()=>{ try{ const r=await fetch('/shared/tune.glasshorn',{credentials:'same-origin'}); if(!r.ok||r.status===204)return; const ty=r.headers.get('content-type')||'', buf=await r.arrayBuffer(); HORN.use(buf,ty,'THE OWNER\'S SONG'); }catch(e){} };
  HORN.use=(buf,ty,name)=>{ if(/midi|mid$/.test(ty)||(new Uint8Array(buf,0,4)).join()==='77,84,104,100'){ const n=HORN.midi(buf); if(n.length){ P.list=[{name,sec:true,notes:n}]; P.src='midi'; P.cur=null; P.rest=1; } return 'midi'; } return null; };
  const near=N=>N&&N.on&&!ROOMS.cur&&SHARED.LVL==='up'&&Math.hypot(pos.x-N.st.x,pos.z-N.st.z)<30*T;
  SYS.add('life',dt=>{ const N=NPCS.extra.find(q=>q.key==='glasshorn'), hear=near(N); HORN.on=!!hear;
    if(!hear){ HORN.now.v+=(0-HORN.now.v)*Math.min(1,dt*4); return; }
    if(!P.cur){ P.rest-=dt; HORN.now.v=0; if(P.rest>0)return; const S=P.list[P.i++%P.list.length]; P.cur=S; P.t=0; P.sent=0; P.beat=S.sec?1:60/S.bpm; }
    const S=P.cur; P.t+=dt;
    const B=P.beat, L=S.notes, now=P.t; let on=null; for(let i=Math.max(0,P.sent-3);i<L.length;i++){ const [b,l,m]=L[i]; if(b*B>now+.05)break; if(b*B<=now&&now<(b+l)*B){ on=L[i]; } }
    while(P.sent<L.length&&L[P.sent][0]*B<P.t+.3)P.sent++;   // the scan above starts near the notes playing now
    if(on){ HORN.now.m=on[2]-2; HORN.now.v+=(1-HORN.now.v)*Math.min(1,dt*20); HORN.now.valves=valvesOf(on[2]-2); } else HORN.now.v+=(0-HORN.now.v)*Math.min(1,dt*12);
    const last=L[L.length-1]; if(!last||now>(last[0]+last[1])*B+.5){ P.cur=null; P.rest=6+Math.random()*5; } },'146k-glasshorn');

  /* ---------- her playing pose: the horn up to her lips, her fingers on the valves; she sways with the phrase and lifts the bell on the high notes; between songs she lowers it and listens ---------- */
  const H0={g:null}, V=new THREE.Vector3(), Vm=new THREE.Vector3(), Vh=new THREE.Vector3(), Q=new THREE.Quaternion(), M4=new THREE.Matrix4(), UP=new THREE.Vector3(0,1,0);
  MERCH.add({key:'glasshorn',label:'THE GLASS HORN',height:1.74,model,size:10,hd:Math.PI/2,
    idle:t=>{ const p=HORN.on&&(P.cur||P.rest<1), v=HORN.now.v, hi=Math.max(0,(HORN.now.m-70)/14), sw=Math.sin(t*1.3)*4*v;
      return p?MERCH.pose({nod:-4-hi*10+Math.sin(t*2.6)*2*v,bend:2-hi*6,yaw:sw,L:{ua:[80+hi*6,-20],fa:[130,-30]},R:{ua:[75+hi*6,-30],fa:[125,-45]}})
        :MERCH.pose({nod:6,L:{ua:[30,-4],fa:[96,-26]},R:{ua:[18,6],fa:[30,0]}}); },
    after:(B,N)=>{ const J=B.J; if(!J||!J.head||!J.palmR)return; if(!H0.g){ H0.g=horn(); H0.g.userData.anyRoom=true; for(const c of H0.g.children)c.castShadow=true; N.g.parent.add(H0.g); }
      const G=H0.g, playing=HORN.on&&(P.cur||P.rest<1); G.visible=N.g.visible; N.g.updateMatrixWorld();
      const hd=N.st.hd, fx=Math.sin(hd), fz=Math.cos(hd); MERCH.at(N,'head',[0,.09,.125],Vh);
      if(playing){ const hi=Math.max(0,(HORN.now.m-70)/14), dn=.22-hi*.18; G.position.copy(Vh); G.quaternion.setFromAxisAngle(UP,hd); G.rotateX(dn); }
      else { MERCH.at(N,'handL',[0,-.05,0],V); G.position.copy(V); G.quaternion.setFromAxisAngle(UP,hd+Math.PI/2); G.rotateX(1.2); }
      G.scale.setScalar(T); for(let i=0;i<3;i++){ const q=G.userData.V[i], dn=playing&&HORN.now.v>.3&&HORN.now.valves[i]?-.012:0; q.cap.position.y+=((-.01+dn)-q.cap.position.y)*.6; q.stem.position.y=q.cap.position.y-.01; q.fing.position.y=q.cap.position.y+.017; q.fing.visible=playing; } }});

  /* ---------- her cup, and what a double-click on her gives: tip her, and for the owner a new song ---------- */
  const panel=document.createElement('div'); panel.id='hornp'; panel.hidden=true; panel.style.cssText='position:fixed;left:50%;top:14%;transform:translateX(-50%);width:min(380px,92vw);z-index:21;padding:14px 16px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  document.body.appendChild(panel); panel.addEventListener('keydown',e=>{ if(e.key==='Escape')panel.hidden=true; e.stopPropagation(); }); panel.addEventListener('keyup',e=>e.stopPropagation());
  const Bt='style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:3px 8px;cursor:pointer;margin:2px"';
  const draw=async()=>{ const own=await (BUGS.owner?BUGS.owner().catch(()=>false):false), S=P.cur||P.list[(P.i)%P.list.length];
    panel.innerHTML=`<h3 style="margin:0 0 4px;color:#f2c14e;font:12px Silkscreen,monospace">THE GLASS HORN</h3><div style="color:#9b9584;margin-bottom:8px">"Listen. No — listen."</div>
      <div>NOW: <b style="color:#f2c14e">${S?S.name:'—'}</b></div><div style="margin:8px 0">HER CUP: $${HORN.tips} · YOU HAVE $${Math.round(INV.cash||0)}</div>
      <div><button ${Bt} data-tip="1">TIP $1</button><button ${Bt} data-tip="5">TIP $5</button></div>
      ${own?`<div style="margin-top:10px;border-top:2px solid #22252f;padding-top:8px;color:#9b9584">OWNER: GIVE HER A NEW SONG (A MIDI FILE, 8 MB AT MOST; SHE PLAYS IT SILENTLY)</div><input type="file" accept=".mid,.midi,audio/midi" data-up style="margin-top:6px;color:#d8dae2"><div data-st style="color:#9b9584;margin-top:4px"></div>`:''}
      <div style="margin-top:10px"><button ${Bt} data-x>CLOSE</button></div>`; };
  panel.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; if(b.dataset.x!==undefined){ panel.hidden=true; return; }
    if(b.dataset.tip){ const n=+b.dataset.tip; if((INV.cash||0)<n)return say('YOU CANNOT SPARE IT.','#c8a090'); INV.cash-=n; HORN.tips+=n; INV.add('x',0); delete INV.items.x; if(FORAGE.draw)FORAGE.draw(); say(n>1?'SHE BOWS HER HEAD, STILL PLAYING.':'A NOTE BENDS YOUR WAY.','#bff0e6'); draw(); } });
  panel.addEventListener('change',async e=>{ const f=e.target.files&&e.target.files[0]; if(!f||e.target.dataset.up===undefined)return; const st=panel.querySelector('[data-st]'); if(f.size>8<<20){ st.textContent='TOO BIG.'; return; }
    const ty=f.type||(/\.midi?$/i.test(f.name)?'audio/midi':'application/octet-stream'), buf=await f.arrayBuffer(); if(!HORN.use(buf,ty,f.name.replace(/\.[^.]+$/,'').toUpperCase().slice(0,30))){ st.textContent='NOT A MIDI FILE.'; return; } st.textContent='SENDING…';
    try{ const r=await fetch('/shared/tune.glasshorn',{method:'POST',credentials:'same-origin',headers:{'content-type':ty},body:buf}), j=await r.json().catch(()=>({})); st.textContent=r.ok&&j.ok?'SENT. SHE PLAYS IT FROM NOW ON.':'NOT SENT: '+(j.why||r.status); }
    catch(er){ st.textContent='NOT SENT (NO SERVER HERE); SHE PLAYS IT FOR YOU.'; } });
  HORN.panel=()=>{ panel.hidden=false; draw(); };
  { const go=()=>{ const N=NPCS.extra.find(q=>q.key==='glasshorn'); if(!window.__started||!N||!N.g||!UI.thing)return setTimeout(go,700);
      const hb=new THREE.Mesh(new THREE.BoxGeometry(30,58,30),new THREE.MeshBasicMaterial({visible:false})); hb.position.y=29; N.g.add(hb); UI.thing({name:'THE GLASS HORN',npc:N,obj:hb,reach:2.2*T,near:3*T,tall:1.9*T,act:()=>HORN.panel()});
      const cup=new THREE.Mesh(new THREE.CylinderGeometry(.06*T,.045*T,.13*T,14,1,true),new THREE.MeshStandardMaterial({color:0x6a4a34,roughness:.8,side:THREE.DoubleSide})); cup.position.set(N.st.x+Math.sin(N.st.hd)*.55*T+Math.cos(N.st.hd)*.3*T,(N.st.y||0)+.065*T,N.st.z+Math.cos(N.st.hd)*.55*T-Math.sin(N.st.hd)*.3*T); N.g.parent.add(cup); load(); };
    go(); }
  HORN.make=horn; HORN.next=()=>{ P.cur=null; P.rest=0; };
  window.HORNDBG=()=>({on:HORN.on,src:P.src,song:P.cur&&P.cur.name,rest:+P.rest.toFixed(1),note:+HORN.now.m.toFixed(1),v:+HORN.now.v.toFixed(2),valves:HORN.now.valves.join(''),tips:HORN.tips,trumpet:!!H0.g&&H0.g.visible});
}
