// ---- THE DEEP MINES (owner, 18 Oct 2026: "gems and finding them in deep cave mines"; his picks: on the map, ways in from the park and
// underground "like a tunnel you take through the subway tunnel", every layout ("all": a few fixed ways in, one network, and a part that
// changes each day), every sci-fi tool ("all": no pickaxe)): one network of tunnels under Central Park, cut through the rock at the loop
// subway's depth and on down. FOUR WAYS IN: a gap in the loop tunnel's inner wall under the main street by the park's gate (walk in), a
// steel hatch on the park's lawn with a lift down, a crack in the golems' cave's floor with a lift of rough stone, and each day a second
// hatch somewhere else in the park, at the end of that day's deepest branch. THE NETWORK: a spine joining the three fixed ways in (the same
// every day) and branches off it cut afresh each day (the calendar day's seed), each ending in a cavern; the further from a way in, the
// deeper the floor (some 6 m under the loop's tunnel at the far ends) and the rarer the stones in its walls. SEAMS: stones hidden in the rock
// faces along the tunnels (the golems' ten, GEMS in gems.js), unseen till scanned. THE TOOLS (a DEPOT terminal at the foot of each way in):
// the RESONANCE SCANNER (P, or SCAN on the mine's bar: a ping that lights the seams within its reach, the rarer ones only for a skilled
// prospector, for a minute), and three ways to free a stone: the CUTTER BEAM (you at the seam, a beam and sparks), the SONIC EXTRACTOR (a pulse
// at your feet frees every lit seam near you at once, loose on the floor to pick up, but some shatter), the EXTRACTION DRONE (sent from
// where you stand to a lit seam, it cuts it out and flies it back: the surest, the slowest). PROSPECTING (forage.js's skills, UO's gains)
// for all of it. The golems buy what you find (gems.js). A mined seam stays mined till the day turns. Kept in the save (`mines`). Cost:
// underground only (MAPG.down): the rock some 1,500 boxes and the floors some 900, one draw each (about 29,000 triangles); the lit seams one
// draw; one lamp record a stretch of tunnel (LITE's eight nearest); nothing drawn or run on the street but the hatch's lid; built a moment
// after the game runs, and again when the day turns while you're up top ----
const MINE={ready:false}; window.MINE=MINE;
{ const T=TILE, XS=BOD.XS, ZS=BOD.ZS, Yp=z=>z*ZU, R=RING, say=(t,c)=>FORAGE.say(t,c), V3=THREE.Vector3;
  const tX=x=>x/T+BOD.OX, tY=z=>z/T+BOD.OY;   // (world to the street's tiles)
  const yS=(BOD.CURB+BOD.FAR)/2, yN=(R.nr0+R.nr1)/2, xW=(R.wr0+R.wr1)/2, xE=(AVE.r0+AVE.r1)/2, HW=2.5, CS=2.5;
  const G0={x0:xW+HW+.2,x1:xE-HW-.2,y0:yS+HW,y1:yN-HW-.2}, NX=Math.floor((G0.x1-G0.x0)/CS), NY=Math.floor((G0.y1-G0.y0)/CS);
  const cx=i=>G0.x0+(i+.5)*CS, cy=j=>G0.y0+(j+.5)*CS, K=(i,j)=>j*NX+i, inG=(i,j)=>i>=0&&j>=0&&i<NX&&j<NY;
  const cellAt=(x,z)=>{ const i=Math.floor((tX(x)-G0.x0)/CS), j=Math.floor((tY(z)-G0.y0)/CS); return inG(i,j)?[i,j]:null; };
  const GEMC={quartz:0xe8e8f4,amethyst:0xa060e0,geode:0xb09878,amber:0xe8a030,moonstone:0xc8dcf4,opal:0xf4d8ec,emerald:0x30c878,sapphire:0x3868f0,ruby:0xe82848,meteor:0xb8a8ff};
  const S={mined:{},tool:'cutter'}; try{ const D=JSON.parse(SAVE.get('mines')||'null'); if(D)Object.assign(S,D); }catch(e){} const save=()=>SAVE.set('mines',JSON.stringify(S));
  const day=()=>window.MAIL&&MAIL.ready?MAIL.day():window.CITY?CITY.day||0:0;
  const rngOf=s=>()=>{ s|=0; s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  FORAGE.add({names:{scanner:'RESONANCE SCANNER',cutter:'CUTTER BEAM',sonic:'SONIC EXTRACTOR',mdrone:'EXTRACTION DRONE'}});
  const TOOLS=[['scanner','RESONANCE SCANNER',40,'P or SCAN: lights the seams near you for a minute'],['cutter','CUTTER BEAM',60,'stand at a seam: cut the stone out'],
    ['sonic','SONIC EXTRACTOR',90,'a pulse frees every lit seam near you; some shatter'],['mdrone','EXTRACTION DRONE',150,'sent to a lit seam up to 14 tiles off; the surest']];
  // ---- THE GAP IN THE LOOP TUNNEL'S INNER WALL is sub.js's (RING.mine); the rest is made here
  const G=new THREE.Group(); G.name='mine'; MAPG.down.add(G); let built=null;
  const top=new THREE.Group(); (MAPG.park||scene).add(top);
  const lawnAt=(x,z)=>{ const rc=new THREE.Raycaster(new V3(x,40,z),new V3(0,-1,0)); const vis=o=>{ for(;o;o=o.parent)if(!o.visible)return false; return true; };
    for(const h of rc.intersectObjects([MAPG.park,MAPG.castle,MODS.land,typeof POND!=='undefined'&&POND.hills].filter(Boolean),true)){ const o=h.object; if(o.isInstancedMesh||o.isSkinnedMesh||o.isPoints||o.isLine||o.isSprite||!vis(o)||(o.material&&o.material.visible===false))continue; return (o===MODS.land||(typeof POND!=='undefined'&&o===POND.hills))&&h.point.y>-.6&&h.point.y<.6; } return false; };
  // ---- THE LIFTS: a platform rides you down and up; while it carries you the ground under you is its own
  const LIFTS=[]; let ride=null;
  const liftMesh=(stone)=>{ const g=new THREE.Group(); const a=new THREE.Mesh(new THREE.CylinderGeometry(.72*T,.72*T,.06*T,10),new THREE.MeshLambertMaterial({color:stone?0x6a6660:0x4a5058,flatShading:true})); g.add(a);
    if(!stone){ const r=new THREE.Mesh(new THREE.CylinderGeometry(.8*T,.8*T,.04*T,10),new THREE.MeshLambertMaterial({color:0xd8b020,flatShading:true})); r.position.y=-.01*T; g.add(r); const l=new THREE.Mesh(new THREE.BoxGeometry(.16*T,.03*T,.16*T),new THREE.MeshBasicMaterial({color:0x48e8ff})); l.position.set(.5*T,.04*T,0); g.add(l); }
    return g; };
  const RIDE=liftMesh(false); RIDE.visible=false; scene.add(RIDE); const RIDES=liftMesh(true); RIDES.visible=false; scene.add(RIDES);
  const hitBox=(grp,x,y,z,w,h,o)=>{ const hb=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(x,y,z); grp.add(hb); const th={obj:hb}; Object.defineProperties(th,Object.getOwnPropertyDescriptors(o)); UI.thing(th); return th; };   // (descriptors: a seam's reach is a getter, by the tool in hand)
  const things=[]; const unthing=()=>{ for(const t of things){ const i=UI.things.indexOf(t); if(i>=0)UI.things.splice(i,1); } things.length=0; };
  MINE.ride=(L,down)=>{ if(ride)return; if(Math.hypot(pos.x-L.x,pos.z-L.z)>1.3*T)return say('STEP ONTO THE LIFT FIRST.','#c8a090');
    ride={L,y:down?L.top:L.bot,to:down?L.bot:L.top,down}; pos.x=L.x; pos.z=L.z; target=null; const M=L.stone?RIDES:RIDE; M.visible=true; if(L.lid)L.lid.visible=false;
    say(down?(L.stone?'THE STONE SINKS UNDER YOU.':'THE LIFT HUMS AND GOES DOWN.'):'UP YOU GO.'); if(typeof SFX!=='undefined')SFX.play('creak',{vol:.5}); };
  const rideTick=dt=>{ if(!ride)return; const L=ride.L, M=L.stone?RIDES:RIDE, sp=Yp(98)/3.2; ride.y+=Math.sign(ride.to-ride.y)*Math.min(Math.abs(ride.to-ride.y),sp*dt); keys.clear(); target=null; pos.x=L.x; pos.z=L.z;
    M.position.set(L.x,ride.y-.03*T,L.z); if(Math.abs(ride.y-ride.to)<1e-4){ M.visible=false; if(L.lid)L.lid.visible=true; if(!ride.down)py=L.top; ride=null; } };
  { const g0=groundY; groundY=(x,z)=>{ if(ride&&Math.hypot(x-ride.L.x,z-ride.L.z)<1.2*T)return ride.y; if(LVL==='down'&&built){ const c=cellAt(x,z); if(c){ const f=built.floor[K(...c)]; if(f!=null)return f; } } return g0(x,z); }; }
  MINE.inside=(x,z)=>{ if(!built||LVL!=='down')return false; const c=cellAt(x,z); return !!c&&built.floor[K(...c)]!=null; };
  // ---- THE NETWORK, made for a day
  const make=d=>{ const forb=new Uint8Array(NX*NY), carved=new Uint8Array(NX*NY);
    for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){ const x=XS(cx(i)), z=ZS(cy(j)); let f=false; if(MODS.dungeon&&MODS.dungeon.inside)for(const [a,b] of [[0,0],[-1,-1],[1,1],[-1,1],[1,-1]])if(MODS.dungeon.inside(x+a*2.4*T,z+b*2.4*T))f=true;
      const S2=CASTLE.stair; if(tX(x)>S2.x0-3&&tX(x)<S2.x1+3&&tY(z)>S2.y0-3&&tY(z)<S2.y1+3)f=true; if(f)forb[K(i,j)]=1; }
    const ok=(i,j)=>inG(i,j)&&i>0&&j>=0&&i<NX-1&&j<NY-1&&!forb[K(i,j)], cut=(i,j)=>{ if(ok(i,j))carved[K(i,j)]=1; };
    const room=(i,j,r)=>{ for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)cut(i+a,j+b); };
    const walk=(rng,a,b)=>{ let [i,j]=a; for(let n=0;n<4000&&(i!==b[0]||j!==b[1]);n++){ cut(i,j); let di=Math.sign(b[0]-i), dj=Math.sign(b[1]-j);
        if(rng()<.35){ const r=rng(); [di,dj]=r<.25?[1,0]:r<.5?[-1,0]:r<.75?[0,1]:[0,-1]; } else if(di&&dj){ if(rng()<.5)dj=0; else di=0; }
        if(ok(i+di,j+dj)||(i+di===b[0]&&j+dj===b[1])){ i+=di; j+=dj; } if(rng()<.15)cut(i+(rng()<.5?1:-1),j); } cut(...b); };
    // the ways in
    const ent=[]; const gi=Math.floor((R.mine.x-G0.x0)/CS); ent.push({k:'sub',c:[gi,0]});
    { const P=PARK; let best=null; for(let n=0;n<40&&!best;n++){ const a=n*2.4, r=n*.9, x=XS(P.round[0]+(P.ox||0)+26+Math.cos(a)*r), z=ZS(P.round[1]+(P.oy||0)+9+Math.sin(a)*r), c=cellAt(x,z); if(c&&ok(...c)&&lawnAt(x,z))best={x,z,c}; }
      if(best)ent.push({k:'hatch',c:best.c,x:best.x,z:best.z}); }
    if(window.GCAVE&&GCAVE.c){ const C=GCAVE.c; let best=null; for(const [a,r] of [[2.4,1.6],[1.8,1.9],[3,1.4],[-2.6,1.6],[2.2,2.4],[-2,2.2],[0,0]]){ const x=C.x+Math.cos(a)*r*T, z=C.z+Math.sin(a)*r*T; if(!SOL.up.some(b=>x>b[0]-.6*T&&x<b[2]+.6*T&&z>b[1]-.6*T&&z<b[3]+.6*T)){ best={x,z}; break; } }
      const c=best&&cellAt(best.x,best.z); if(c&&ok(...c))ent.push({k:'cave',c,x:best.x,z:best.z}); }
    // the spine (the same every day) and the day's branches
    const r0=rngOf(9157); for(let n=1;n<ent.length;n++)walk(r0,ent[n-1].c,ent[n].c); if(ent.length>2)walk(r0,ent[0].c,ent[ent.length-1].c);
    for(const e of ent)room(e.c[0],e.c[1],1);
    const rd=rngOf(7919+d*131), spine=[]; for(let k=0;k<NX*NY;k++)if(carved[k])spine.push(k); const ends=[];
    for(let b=0;b<8;b++){ let k=spine[Math.floor(rd()*spine.length)], i=k%NX, j=Math.floor(k/NX), dir=Math.floor(rd()*4); const L=25+Math.floor(rd()*45);
      for(let n=0;n<L;n++){ if(rd()<.22)dir=(dir+(rd()<.5?1:3))%4; const [di,dj]=[[1,0],[0,1],[-1,0],[0,-1]][dir]; if(!ok(i+di,j+dj)){ dir=(dir+1)%4; continue; } i+=di; j+=dj; cut(i,j); if(rd()<.12)cut(i+dj,j+di); }
      room(i,j,1); if(rd()<.5)room(i+1,j,1); ends.push([i,j]); }
    // how deep: from the ways in, a step down each cell further (the floor in world units)
    const dist=new Int32Array(NX*NY).fill(-1), Q=[]; const seed=c=>{ const k=K(...c); if(carved[k]&&dist[k]<0){ dist[k]=0; Q.push(k); } };
    for(const e of ent)seed(e.c); for(let q=0;q<Q.length;q++){ const k=Q[q], i=k%NX, j=Math.floor(k/NX); for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const n=K(i+a,j+b); if(inG(i+a,j+b)&&carved[n]&&dist[n]<0){ dist[n]=dist[k]+1; Q.push(n); } } }
    // the day's hatch: the deepest branch end under a lawn
    ends.sort((a,b)=>dist[K(...b)]-dist[K(...a)]); for(const c of ends){ const x=XS(cx(c[0])), z=ZS(cy(c[1])); if(dist[K(...c)]>8&&lawnAt(x,z)){ ent.push({k:'day',c,x,z}); break; } }
    const floor=new Array(NX*NY).fill(null), dep=new Float32Array(NX*NY); for(let k=0;k<NX*NY;k++)if(carved[k]){ const t=Math.min(dist[k]<0?40:dist[k],70); dep[k]=t/70; floor[k]=Yp(-98-t*1.6); }
    for(const e of ent){ const k=K(...e.c); dep[k]=0; floor[k]=Yp(-98); }   // (a lift's foot level with the loop's tunnel)
    return {forb,carved,floor,dep,ent,dist}; };
  // ---- BUILT: the rock, the floors, the lamps, the lifts, the depots, the seams
  const sol=[], fix=[], recs=[];
  const build=()=>{ const d=day(); if(built)unbuild(); const M=make(d), {carved,floor,dep}=M; built=M; built.day=d;
    const BX=[], FL=[], m4=new THREE.Matrix4(), q=new THREE.Quaternion(), col=new THREE.Color(), rr=rngOf(331+d), top0=Yp(-12);
    for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){ const k=K(i,j); if(carved[k]){ FL.push([i,j,floor[k],dep[k]]); continue; }
      let lo=1e9; for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){ const n=K(i+a,j+b); if(inG(i+a,j+b)&&carved[n])lo=Math.min(lo,floor[n]); } if(lo>1e8)continue;
      let dd=0; for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){ const n=K(i+a,j+b); if(inG(i+a,j+b)&&carved[n])dd=Math.max(dd,dep[n]); }
      BX.push([i,j,lo-Yp(6),top0-rr()*Yp(16),dd,rr()]); }
    const box=new THREE.BoxGeometry(1,1,1), rock=new THREE.InstancedMesh(box,new THREE.MeshLambertMaterial({flatShading:true}),BX.length), fl=new THREE.InstancedMesh(box,new THREE.MeshLambertMaterial(),FL.length);
    BX.forEach(([i,j,lo,hi,dd,r],n)=>{ const s=1+r*.12; m4.compose(new V3(XS(cx(i)),(lo+hi)/2,ZS(cy(j))),q,new V3(CS*T*s,hi-lo,CS*T*s)); rock.setMatrixAt(n,m4);
      const g=.36-dd*.14+r*.06; rock.setColorAt(n,col.setRGB(g*1.02,g*.96,g*(.92+dd*.3)));   // (bluer and darker the deeper)
      const x0=XS(cx(i)-CS/2), x1=XS(cx(i)+CS/2), z0=ZS(cy(j)-CS/2), z1=ZS(cy(j)+CS/2), a=[Math.min(x0,x1),Math.min(z0,z1),Math.max(x0,x1),Math.max(z0,z1)]; sol.push(a); fix.push([a[0],a[1],lo,a[2],a[3],hi]); });
    FL.forEach(([i,j,f,dd],n)=>{ m4.compose(new V3(XS(cx(i)),f-Yp(3),ZS(cy(j))),q,new V3(CS*T*1.01,Yp(6),CS*T*1.01)); fl.setMatrixAt(n,m4); const g=.24-dd*.08+rr()*.03; fl.setColorAt(n,col.setRGB(g*1.05,g,g*.95+dd*.06)); });
    for(const me of [rock,fl]){ me.receiveShadow=true; me.castShadow=me===rock; me.computeBoundingSphere(); G.add(me); } built.rock=rock; built.fl=fl;
    SOL.down.push(...sol); FIX.down.push(...fix);
    // the work lamps: one a stretch, cool white, a glowing fixture on the wall
    { const pts=[], fx=[]; const order=[...Array(NX*NY).keys()].filter(k=>carved[k]).sort(()=>rr()-.5); for(const e of M.ent)order.unshift(K(...e.c));
      for(const k of order){ const i=k%NX, j=Math.floor(k/NX); if(pts.some(([a,b])=>Math.abs(a-i)+Math.abs(b-j)<7))continue; pts.push([i,j]); }
      for(const [i,j] of pts){ const L=new THREE.PointLight(new THREE.Color(.78,.9,1),12,10*T,1.6); L.position.set(XS(cx(i)),floor[K(i,j)]+Yp(70),ZS(cy(j))); L.userData.i0=L.intensity; L.userData.grp=MAPG.down; LITE.recs.push(L); recs.push(L); fx.push(L.position); }
      const lm=new THREE.InstancedMesh(new THREE.BoxGeometry(.5*T,.06*T,.2*T),new THREE.MeshBasicMaterial({color:0xd8f4ff}),fx.length); fx.forEach((p,n)=>{ lm.setMatrixAt(n,m4.makeTranslation(p.x,p.y+.2*T,p.z)); }); G.add(lm); built.lm=lm; built.lamps=pts.length; }
    // the ways in: lifts and depots
    for(const e of M.ent){ const k=K(...e.c), x=e.x??XS(cx(e.c[0])), z=e.z??ZS(cy(e.c[1])), bot=floor[k];
      if(e.k==='hatch'||e.k==='day'||e.k==='cave'){ const L={x,z,top:e.k==='cave'?0:0,bot,stone:e.k==='cave',k:e.k}; LIFTS.push(L);
        const lid=liftMesh(L.stone); lid.position.set(x,(L.stone?Yp(1):.02*T),z); top.add(lid); L.lid=lid; built.lids=(built.lids||[]).concat(lid);
        const foot=liftMesh(L.stone); foot.position.set(x,bot-.02*T,z); G.add(foot);
        things.push(hitBox(top,x,.4*T,z,1.4*T,.8*T,{name:L.stone?'A CRACK IN THE FLOOR':(e.k==='day'?'A NEW HATCH':'THE MINE HATCH'),reach:.6*T,near:1.2*T,tall:.6*T,act:()=>MINE.ride(L,true)}));
        things.push(hitBox(G,x,bot+.4*T,z,1.4*T,.8*T,{name:'THE LIFT UP',reach:.6*T,near:1.2*T,tall:.6*T,act:()=>MINE.ride(L,false)})); }
      // the depot: a terminal against the chamber's corner
      const dx=x+.95*CS*T*.5*(e.k==='sub'?1:-1), dz=z+.95*CS*T*.5*(e.k==='sub'?1:1), th=hitBox(G,dx,bot+Yp(40),dz,.7*T,Yp(80),{name:'DEPOT',reach:1.1*T,near:1.8*T,tall:Yp(90),act:()=>DEPOT.open()});
      th.obj.material=new THREE.MeshLambertMaterial({color:0x2a3440}); th.obj.material.visible=true; const sc=new THREE.Mesh(new THREE.BoxGeometry(.5*T,Yp(22),.72*T),new THREE.MeshBasicMaterial({color:0x40d8f0})); sc.position.set(dx,bot+Yp(56),dz); G.add(sc); built.screens=(built.screens||[]).concat(sc);
      things.push(th); const a=[dx-.35*T,dz-.35*T,dx+.35*T,dz+.35*T]; sol.push(a); SOL.down.push(a); }
    // the seams
    const SE=[]; const rs=rngOf(4441+d*17); for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){ const k=K(i,j); if(!carved[k])continue;
      for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const n=K(i+a,j+b); if(!inG(i+a,j+b)||carved[n]||rs()>.075)continue; const t=dep[k], r=rs();
        let w=GEMS.filter(g=>g[3]>0).map((g,gk)=>[g,Math.exp(-((gk/9-t*1.05)**2)/.05)+(gk<2?.15:0)]), s=w.reduce((p,c)=>p+c[1],0)*r, gem=GEMS[0]; for(const [g,v] of w)if((s-=v)<0){ gem=g; break; }
        const gk=GEMS.indexOf(gem), id=d+':'+k+':'+(a+1)*3+(b+1); if(S.mined[id])continue;
        SE.push({id,gem:gem[0],name:gem[1],d:gk*9,x:XS(cx(i)+a*CS*.46),z:ZS(cy(j)+b*CS*.46),y:floor[k]+Yp(22),rev:0,th:null}); } }
    built.seams=SE; MINE.n=SE.length;
    const cg=new THREE.OctahedronGeometry(.14*T,0); cg.scale(1,1.8,1); built.cry=new THREE.InstancedMesh(cg,new THREE.MeshBasicMaterial(),Math.max(1,SE.length*3)); built.cry.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1,SE.length*3)*3),3); built.cry.count=0; built.cry.frustumCulled=false; G.add(built.cry);
    MINE.ready=true; };
  const unbuild=()=>{ unthing(); for(const a of sol){ const i=SOL.down.indexOf(a); if(i>=0)SOL.down.splice(i,1); } for(const a of fix){ const i=FIX.down.indexOf(a); if(i>=0)FIX.down.splice(i,1); } sol.length=fix.length=0;
    for(const L of recs){ const i=LITE.recs.indexOf(L); if(i>=0)LITE.recs.splice(i,1); } recs.length=0; LIFTS.length=0;
    while(G.children.length){ const o=G.children[0]; G.remove(o); o.traverse(c=>{ if(c.geometry)c.geometry.dispose(); }); } while(top.children.length)top.remove(top.children[0]); built=null; MINE.ready=false; };
  // ---- THE SEAMS LIT: their crystals drawn (three a seam), a thing each to double click
  const syncSeams=()=>{ if(!built)return; const now=performance.now()/1000, C=built.cry, m4=new THREE.Matrix4(), q=new THREE.Quaternion(), col=new THREE.Color(); let n=0;
    for(const s of built.seams){ const on=s.rev>now&&!s.gone; if(on&&!s.th){ s.th=hitBox(G,s.x,s.y,s.z,.6*T,.6*T,{name:s.name,get reach(){ return S.tool==='mdrone'?14*T:S.tool==='sonic'?2.4*T:1.1*T; },near:2*T,tall:.4*T,act:()=>MINE.extract(s)}); things.push(s.th); }
      if(!on&&s.th){ const i=UI.things.indexOf(s.th); if(i>=0)UI.things.splice(i,1); s.th.obj.removeFromParent(); s.th=null; }
      if(on)for(let k=0;k<3;k++){ q.setFromEuler(new THREE.Euler((k-1)*.5,k*1.3,(k-1)*.35)); m4.compose(new V3(s.x+(k-1)*.12*T,s.y+(k===1?.08*T:0),s.z+(k-1)*.06*T),q,new V3(1,1,1).multiplyScalar(k===1?1:.7)); C.setMatrixAt(n,m4); C.setColorAt(n++,col.setHex(GEMC[s.gem]||0xffffff)); } }
    C.count=n; C.instanceMatrix.needsUpdate=true; C.instanceColor.needsUpdate=true; };
  // ---- THE TOOLS AT WORK
  const ring=new THREE.Mesh(new THREE.RingGeometry(.94,1,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x48e8ff,side:THREE.DoubleSide})); ring.visible=false; scene.add(ring); let ringT=-1, ringR=1, ringY=0, scanCD=0;
  const beam=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0x7ff4ff})); beam.visible=false; scene.add(beam);
  const drone=new THREE.Group(); { const m=new THREE.MeshLambertMaterial({color:0x5a6270}); drone.add(new THREE.Mesh(new THREE.BoxGeometry(.3*T,.08*T,.3*T),m)); for(const [a,b] of [[1,1],[1,-1],[-1,1],[-1,-1]]){ const r=new THREE.Mesh(new THREE.BoxGeometry(.16*T,.02*T,.04*T),new THREE.MeshLambertMaterial({color:0x2a2e34})); r.position.set(a*.18*T,.06*T,b*.18*T); drone.add(r); } const e=new THREE.Mesh(new THREE.BoxGeometry(.08*T,.05*T,.08*T),new THREE.MeshBasicMaterial({color:0x48e8ff})); e.position.y=-.05*T; drone.add(e); } drone.visible=false; scene.add(drone);
  const owns=k=>FORAGE.has(k)>0, kb=()=>FORAGE.keen?FORAGE.keen():0;
  MINE.scan=()=>{ if(!MINE.inside(pos.x,pos.z))return say('THE SCANNER ONLY READS ROCK: GO DOWN INTO THE MINE.','#c8a090'); if(!owns('scanner'))return say('YOU NEED A RESONANCE SCANNER (THE DEPOT).','#c8a090'); if(scanCD>0)return;
    const sk=FORAGE.sk('prosp')+kb(), Rr=(5+sk/12)*T, now=performance.now()/1000; let lit=0, dmax=0; scanCD=2.5; ringT=0; ringR=Rr; ringY=py+.05*T;
    for(const s of built.seams){ if(s.gone||Math.hypot(s.x-pos.x,s.z-pos.z)>Rr)continue; if(s.d>sk+20)continue; s.rev=now+60; lit++; dmax=Math.max(dmax,s.d); }
    FORAGE.use('prosp',(lit?dmax:8)-25,(lit?dmax:8)+25); say(lit?`THE SCANNER LIGHTS ${lit} SEAM${lit>1?'S':''}.`:'THE SCANNER FINDS NOTHING HERE.',lit?'#7ff4ff':'#c8c2b0'); if(typeof SFX!=='undefined')SFX.play('chirp',{vol:.4}); syncSeams(); };
  const win=(s,bonus)=>{ const ok=FORAGE.use('prosp',s.d-25-bonus,s.d+25-bonus); return ok; };
  const got=(s,n=1)=>{ INV.add(s.gem,n); s.gone=true; S.mined[s.id]=1; save(); say(`YOU FREE ${n>1?n+' STONES':'A STONE'}: ${s.name}${n>1?'S':''}.`,'#f2c14e'); if(typeof SFX!=='undefined')SFX.play('clunk',{vol:.5}); syncSeams(); FORAGE.draw(); };
  let job=null; const extra=s=>FORAGE.sk('prosp')>s.d+30&&Math.random()<.3?2:1;
  MINE.extract=s=>{ if(s.gone||job)return; const t=S.tool;
    if(!owns(t)){ const o=['cutter','sonic','mdrone'].find(owns); if(!o)return say('YOU NEED A CUTTER, A SONIC EXTRACTOR OR A DRONE (THE DEPOT).','#c8a090'); S.tool=o; }
    if(S.tool==='cutter')job={k:'cut',s,t:2.2}; else if(S.tool==='mdrone')job={k:'drone',s,t:0,ph:0,from:new V3(pos.x,py+Yp(60),pos.z)}; else { job={k:'sonic',t:.8}; ringT=0; ringR=2.6*T; ringY=py+.05*T; if(typeof SFX!=='undefined')SFX.play('boom',{vol:.25}); }
    HUD.draw(); };
  const loose=[]; const drop=(s)=>{ const m=new THREE.Mesh(new THREE.OctahedronGeometry(.1*T,0),new THREE.MeshBasicMaterial({color:GEMC[s.gem]||0xffffff})); const x=s.x+(pos.x-s.x)*.3, z=s.z+(pos.z-s.z)*.3; m.position.set(x,groundY(x,z)+.08*T,z); G.add(m);
    const th={name:'A LOOSE '+s.name,obj:m,reach:.8*T,near:1.4*T,tall:.3*T,act:()=>{ INV.add(s.gem); say('YOU PICK UP THE '+s.name+'.','#f2c14e'); m.removeFromParent(); const i=UI.things.indexOf(th); if(i>=0)UI.things.splice(i,1); FORAGE.draw(); }}; UI.thing(th); things.push(th); };
  const jobTick=dt=>{ if(!job)return; job.t-=dt;
    if(job.k==='cut'){ const s=job.s, hx=pos.x, hy=py+Yp(48), hz=pos.z, L=Math.hypot(s.x-hx,s.y-hy,s.z-hz); beam.visible=true; beam.scale.set(.025*T,.025*T,L); beam.position.set((s.x+hx)/2,(s.y+hy)/2,(s.z+hz)/2); beam.lookAt(s.x,s.y,s.z);
      if(typeof FLAME!=='undefined'&&Math.random()<dt*25)FLAME.ember(s.x,s.y,s.z,.5); if(Math.hypot(pos.x-s.x,pos.z-s.z)>1.8*T){ job=null; beam.visible=false; return say('YOU STEP AWAY. THE BEAM CUTS OUT.','#c8a090'); }
      if(job.t<=0){ beam.visible=false; job=null; if(win(s,0))got(s,extra(s)); else if(Math.random()<.35){ s.gone=true; S.mined[s.id]=1; save(); say('THE CRYSTAL FRACTURES. LOST.','#c8a090'); syncSeams(); } else say('THE BEAM SLIPS. TRY AGAIN.','#c8a090'); } }
    else if(job.k==='sonic'){ if(job.t<=0){ job=null; let n=0; for(const s of built.seams){ if(s.gone||!(s.rev>performance.now()/1000)||Math.hypot(s.x-pos.x,s.z-pos.z)>2.8*T)continue; n++;
          if(win(s,-10)){ s.gone=true; S.mined[s.id]=1; drop(s); } else if(Math.random()<.5){ s.gone=true; S.mined[s.id]=1; say(s.name+' SHATTERS.','#c8a090'); } }
        save(); syncSeams(); say(n?'THE PULSE SHAKES THE ROCK LOOSE.':'THE PULSE FINDS NO LIT SEAM NEAR YOU.',n?'#7ff4ff':'#c8c2b0'); } }
    else if(job.k==='drone'){ const s=job.s, hov=new V3(s.x+(pos.x-s.x)*.12,s.y+.1*T,s.z+(pos.z-s.z)*.12), home=new V3(pos.x,py+Yp(60),pos.z); drone.visible=true;
      if(job.ph===0){ drone.position.copy(job.from); job.ph=1; }
      if(job.ph===1){ const d=hov.clone().sub(drone.position), L=d.length(); if(L<.05*T){ job.ph=2; job.t=2.5; } else drone.position.addScaledVector(d,Math.min(1,4*T*dt/L)); }
      else if(job.ph===2){ beam.visible=true; const L=drone.position.distanceTo(new V3(s.x,s.y,s.z)); beam.scale.set(.02*T,.02*T,Math.max(.01,L)); beam.position.copy(drone.position).add(new V3(s.x,s.y,s.z)).multiplyScalar(.5); beam.lookAt(s.x,s.y,s.z);
        if(typeof FLAME!=='undefined'&&Math.random()<dt*20)FLAME.ember(s.x,s.y,s.z,.4); if(job.t<=0){ beam.visible=false; job.ok=win(s,10); job.ph=3; } }
      else { const d=home.clone().sub(drone.position), L=d.length(); if(L<.1*T){ drone.visible=false; const s2=job.s, ok=job.ok; job=null; if(ok)got(s2,extra(s2)); else say('THE DRONE COMES BACK EMPTY.','#c8a090'); } else drone.position.addScaledVector(d,Math.min(1,5*T*dt/L)); }
      drone.rotation.y+=dt*2; } };
  // ---- THE DEPOT (an X and a drag: ui.js's PANS, 'minep')
  const DEPOT={}; MINE.DEPOT=DEPOT; const Bt='style="margin:0 0 0 4px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer"';
  const dp=document.createElement('div'); dp.id='minep'; dp.hidden=true; dp.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);width:min(480px,92vw);max-height:80vh;overflow:auto;z-index:21;padding:14px 16px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #2a5866;zoom:var(--uiz,1)'; document.body.appendChild(dp);
  DEPOT.draw=()=>{ if(dp.hidden)return; let o=`<h3 style="margin:0 0 4px;color:#7ff4ff;font:12px Silkscreen,monospace">PROSPECTOR'S DEPOT</h3><div style="color:#9b9584;margin-bottom:8px">Tools for the deep rock. The golems in the park buy every stone you free.</div><div style="margin-bottom:8px">YOU HAVE <b style="color:#f2c14e">$${Math.round(INV.cash)}</b> · PROSPECTING ${FORAGE.sk('prosp').toFixed(1)}</div><table style="border-collapse:collapse;width:100%">`;
    for(const [id,nm,p,txt] of TOOLS){ const h=owns(id), sel=S.tool===id; o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">${nm}<div style="color:#8a8676;font-size:10px">${txt}</div></td><td style="text-align:right;padding:4px 6px">$${p}</td><td style="text-align:right;white-space:nowrap">${h?(id==='scanner'?'YOURS':`<button ${Bt} data-use="${id}" style="${sel?'color:#7ff4ff;':''}font:inherit;background:#0e1016;border:2px solid ${sel?'#7ff4ff':'#3a3f4e'};padding:2px 7px;cursor:pointer">${sel?'IN HAND':'USE'}</button>`):`<button ${Bt} data-buy="${id}">BUY</button>`}</td></tr>`; }
    o+='</table>'; const x=dp.querySelector(':scope>.pX'); dp.innerHTML=o; if(x)dp.appendChild(x); };
  dp.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||b.classList.contains('pX'))return; const d=b.dataset;
    if(d.buy){ const t=TOOLS.find(x=>x[0]===d.buy); if(INV.cash<t[2])say('YOU CANNOT AFFORD THAT.','#c8a090'); else { INV.cash-=t[2]; FORAGE.give(t[0]); if(t[0]!=='scanner')S.tool=t[0]; save(); say('THE DEPOT HANDS YOU A '+t[1]+'.','#7ff4ff'); } }
    if(d.use){ S.tool=d.use; save(); } DEPOT.draw(); HUD.draw(); });
  DEPOT.open=()=>{ dp.hidden=false; DEPOT.draw(); };
  // ---- THE MINE'S BAR: depth, SCAN, the tool in hand (only down in the mine)
  const HUD=document.createElement('div'); HUD.id='minehud'; HUD.hidden=true; HUD.style.cssText='position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:7;font:11px Silkscreen,monospace;color:#d8f4ff;background:#0b0d13e0;border:2px solid #2a5866;padding:6px 10px;display:flex;gap:8px;align-items:center;zoom:var(--uiz,1)'; document.body.appendChild(HUD);
  HUD.draw=()=>{ const tb=(id,nm)=>owns(id)?`<button data-t="${id}" style="font:inherit;color:${S.tool===id?'#7ff4ff':'#ece5d3'};background:#0e1016;border:2px solid ${S.tool===id?'#7ff4ff':'#3a3f4e'};padding:2px 7px;cursor:pointer">${nm}</button>`:'';
    HUD.innerHTML=`<span id="mdep">MINE</span><button data-s="1" style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer">SCAN (P)</button>${tb('cutter','CUTTER')}${tb('sonic','SONIC')}${tb('mdrone','DRONE')}`; };
  HUD.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; if(b.dataset.s)MINE.scan(); if(b.dataset.t){ S.tool=b.dataset.t; save(); HUD.draw(); } });
  addEventListener('keydown',e=>{ if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.key.toLowerCase()!=='p')return; if(e.target&&e.target.closest&&e.target.closest('input,textarea,select'))return; if(MINE.inside(pos.x,pos.z))MINE.scan(); });
  // ---- EACH FRAME (only while there's something to do) and each second
  { const t0=CLOCK.tick; CLOCK.tick=dt=>{ t0(dt); rideTick(dt); jobTick(dt); if(scanCD>0)scanCD-=dt;
      if(ringT>=0){ ringT+=dt; const k=Math.min(1,ringT/.7); ring.visible=true; ring.scale.setScalar(Math.max(.01,ringR*k)); ring.position.set(pos.x,ringY,pos.z); if(ringT>.8){ ringT=-1; ring.visible=false; } } }; }
  let lastIn=false; setInterval(()=>{ const inn=MINE.inside(pos.x,pos.z); if(inn!==lastIn){ lastIn=inn; HUD.hidden=!inn; if(inn){ HUD.draw(); say('THE DEEP MINE. P SCANS THE ROCK.','#7ff4ff'); } }
      if(inn){ const e=HUD.querySelector('#mdep'); if(e)e.textContent='MINE · '+Math.round(-py*.84/T)+' M DOWN'; } if(built)syncSeams();
      if(built&&day()!==built.day&&LVL==='up'&&!ride){ S.mined=Object.fromEntries(Object.entries(S.mined).filter(([k])=>k.startsWith(day()+':'))); save(); build(); } },1000);
  // built a moment after the game runs, once the park and the golems' cave are (the hatch's lawn found by looking down at it)
  { const go=()=>{ if(!window.__started||!(window.GCAVE&&GCAVE.ready)||!PARK.round)return setTimeout(go,1500); try{ build(); }catch(e){ console.warn('MINE',e); } }; setTimeout(go,4000); }
  window.MINEDBG=()=>built?({day:built.day,ent:built.ent.map(e=>[e.k,e.c,e.x!=null?[+e.x.toFixed(1),+e.z.toFixed(1)]:null]),cells:built.carved.reduce((a,b)=>a+b,0),rock:built.rock.count,lamps:built.lamps,seams:built.seams.length,lit:built.cry.count/3,tool:S.tool,inside:MINE.inside(pos.x,pos.z),lifts:LIFTS.map(L=>[L.k,+L.x.toFixed(1),+L.z.toFixed(1),+L.bot.toFixed(2)])}):null;
  MINE.build=build; MINE.LIFTS=LIFTS; MINE.cellW=(i,j)=>[XS(cx(i)),ZS(cy(j))]; MINE.seams=()=>built?built.seams:[]; }
