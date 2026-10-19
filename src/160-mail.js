const MAIL={on:QS.get('mail')!=='0',addr:[],L:[],nid:0,day0:0,you:{cash:100},cboxes:[],ready:false}; window.MAIL=MAIL;
if(MAIL.on){ const T=TILE, M=1/.84*T, X=BOD.XS, Z=BOD.ZS, G=(x,z)=>MODS.bodega.ground(x,z), rnd=Math.random, pick=a=>a[Math.floor(rnd()*a.length)], log=(w,p)=>CIVIC.note(w,p||'post');
  const hs=s=>{ let h=2166136261; for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619); return (h>>>0)/4294967296; };
  const FIRST=['ADA','BEN','CORA','DEV','EDIE','FINN','GUS','HAZEL','IVO','JUNE','KAI','LENA','MILO','NELL','OTIS','PIA','QUINN','ROSA','SAUL','TESS','URI','VERA','WES','YARA','ZEKE'];
  const LAST=['ODELL','PRATT','QUAN','RUIZ','SOLE','TANAKA','UNGER','VOSS','WEBB','YATES','ABARA','BRINK','CALLO','DUNNE','EZRA','FONTE','GRAY','HOLT','IBSEN','JUNG','KOVAC','LUND','MERCER','NAVA'];
  const person=key=>FIRST[Math.floor(hs(key+'f')*FIRST.length)]+' '+LAST[Math.floor(hs(key+'l')*LAST.length)];
  MAIL.day=()=>MAIL.day0+CITY.day;
  const stamp=()=>({day:MAIL.day(),h:+CLOCK.h.toFixed(2)});
  const fmt=p=>p?'DAY '+p.day+' '+(Math.floor(p.h)%24)+':'+String(Math.floor(p.h*60)%60).padStart(2,'0'):'';
  MAIL.fmt=fmt;

  const front=(at,door)=>{ const dx=door.x-at.x, dz=door.z-at.z; const n=Math.abs(dx)>Math.abs(dz)?{x:Math.sign(dx),z:0}:{x:0,z:Math.sign(dz)||1}; return {at,n,t:{x:-n.z,z:n.x}}; };
  const parkZ0=()=>Z(PARK.y0+PARK.oy), parkZ1=()=>Z(PARK.y1+PARK.oy);
  const streetOf=F=>{ const {at,n}=F; if(n.x<0&&at.x>X(AVE.x0-2))return 'THE AVENUE'; if(n.z<0&&at.z>Z(RING.ny0-2))return 'NORTH STREET'; if(n.x>0&&at.x<X(RING.wx1+2))return 'WEST STREET';
    if(n.z>0&&at.z<parkZ0())return 'MARKET STREET'; return 'CENTRAL PARK'; };
  const along=(st,F)=>st==='THE AVENUE'||st==='WEST STREET'?F.at.z:F.at.x;
  const B=[]; const bld=(id,name,F,kind,units)=>B.push({id,name,F,kind,units:units||null});
  const fromPlace=(pid,id,name,kind,units)=>{ const P=CITY.place(pid); if(!P||P.lv!=='up')return; bld(id,name,front(P.at,P.door),kind,units); };
  const fromRoom=(rid,id,name,kind)=>{ const R=(STORE.rooms||[]).find(r=>r.id===rid); if(!R||!R.dw)return; const d=R.dw, Bx=R.B;
    const xOf=a=>R.x0+(a-Bx.x0)/(Bx.x1-Bx.x0)*(R.x1-R.x0), zOf=a=>R.z0+(a-Bx.y0)/(Bx.y1-Bx.y0)*(R.z1-R.z0), w=d.w, a=d.a; let at, n;
    if(w==='f'){ at={x:xOf(a),z:R.z1}; n={x:0,z:1}; } else if(w==='b'){ at={x:xOf(a),z:R.z0}; n={x:0,z:-1}; } else if(w==='w'){ at={x:R.x0,z:zOf(a)}; n={x:-1,z:0}; } else { at={x:R.x1,z:zOf(a)}; n={x:1,z:0}; }
    if(R.z1<R.z0){ n.z=-n.z; }
    bld(id,name,{at,n,t:{x:-n.z,z:n.x}},kind); };
  MAIL.build=()=>{ if(MAIL.ready)return; const W=(window.WALKERS&&WALKERS.list||[]).filter(w=>w.N&&!w.N.staff);
    fromPlace('bodega','bodega','THE BODEGA','shop'); fromPlace('dojo','dojo','GHOST STREET','shop');
    fromRoom('diner','diner','THE DINER','shop'); fromRoom('bar','bar','THE BAR','shop'); fromRoom('octo','aquarium','THE AQUARIUM','biz');
    for(const R of (STORE.rooms||[]))if(/^av_/.test(R.id))fromRoom(R.id,R.id.slice(3),R.name,'biz');
    fromRoom('keep','keep','THE KEEP','biz'); fromRoom('cottage','cottage','THE HERB COTTAGE','biz');
    { const T0=CITY.place('tower'); if(T0)bld('tower','THE CIVIC TOWER',front(T0.at,T0.door),'flats',(CIVIC.row||[]).map(h=>({unit:h.name,dept:h.id,who:{type:'civic',ref:h.id,name:h.name}}))); }
    if(window.JOBS&&JOBS.plan)JOBS.plan(B,W);
    for(const b of B)for(const u of b.up||[])if(u.who&&u.who.type==='walker')u.who.name=person(u.who.ref.N.key);
    const byS={}; for(const b of B){ b.street=streetOf(b.F); (byS[b.street]=byS[b.street]||[]).push(b); }
    for(const [s,L] of Object.entries(byS)){ L.sort((a,b)=>along(s,a.F)-along(s,b.F)); let last=-1; for(const b of L){ const s0=s==='MARKET STREET'?X(30):s==='THE AVENUE'?Z(-80):s==='NORTH STREET'?X(30):Z(-80);
        let k=1+2*Math.max(0,Math.round((along(s,b.F)-s0)/T/3)); if(k<=last)k=last+2; last=k; b.num=k; } }
    for(const b of B){ const line=(b.street==='CENTRAL PARK'?'':b.num+' ')+b.street;
      if(b.units)for(const u of b.units){ const id=b.id+'-'+u.unit.replace(/\s+/g,'').replace(/^THE/,'').toLowerCase(); MAIL.addr.push({id,b,unit:u.unit,name:u.who?u.who.name:'OCCUPANT',who:u.who,kind:'civic',label:u.unit+', '+line}); }
      else MAIL.addr.push({id:b.id,b,unit:null,name:b.name,who:{type:b.kind,ref:b.id,name:b.name},kind:b.kind,label:b.name+', '+line});
      for(const u of b.up||[]){ const A={id:b.id+'-'+u.unit,b,unit:u.unit,up:true,name:u.who.name,who:u.who,kind:'home',label:'APT '+u.unit+', '+line}; MAIL.addr.push(A); if(u.who.type==='walker')u.who.ref.home=A; } }
    MAIL.office=MAIL.addr.find(a=>a.id==='tower-postoffice')||MAIL.addr.find(a=>/POST/.test(a.unit||''));
    MAIL.hall=MAIL.addr.find(a=>/CITY HALL/.test(a.unit||'')); MAIL.depot=MAIL.addr.find(a=>/DEPOT/.test(a.unit||''));
    for(const w of W)if(w.home&&w.home.id){ w.N.name=w.home.name; w.cash=w.cash??60; }
    const ORD={'MARKET STREET':[0,1],'THE AVENUE':[1,1],'NORTH STREET':[2,-1],'WEST STREET':[3,-1],'CENTRAL PARK':[4,1]};
    B.sort((a,b)=>ORD[a.street][0]-ORD[b.street][0]||ORD[a.street][1]*(along(a.street,a.F)-along(b.street,b.F)));
    MAIL.B=B; boxes(); MAIL.ready=true; restore(); log('the post office opened: '+MAIL.addr.length+' addresses'); };

  const BL=[], blk=(x,y,z,sx,sy,sz,c,tag)=>BL.push([x,y,z,sx,sy,sz,c]);
  const FL=[], TK=[], PC=[];
  const place=(F,off,h)=>({x:F.at.x+F.t.x*off+F.n.x*.1*T,z:F.at.z+F.t.z*off+F.n.z*.1*T,y:G(F.at.x+F.n.x*.6*T,F.at.z+F.n.z*.6*T)+h});
  const orient=(F,w,d)=>F.n.x?[d,w]:[w,d];
  const boxes=()=>{ const RED=0xb8322a, MET=0x3c4048, BRASS=0xb89a4a;
    for(const b of MAIL.B){ const F=b.F, side=b.id==='tower'?1.6*T:1.25*T;
      if(!b.units){ const p=place(F,side,1.1*M), [sx,sz]=orient(F,.36*M,.2*M); blk(p.x,p.y,p.z,sx,.42*M,sz,MET); const [lx,lz]=orient(F,.22*M,.02*M); blk(p.x+F.n.x*.1*M,p.y+.08*M,p.z+F.n.z*.1*M,lx,.025*M,lz,0x14161a);
        const A=MAIL.addr.find(a=>a.b===b); A.box={x:p.x,y:p.y,z:p.z,F}; A.flag=FL.push({x:p.x+F.t.x*.2*M,y:p.y,z:p.z+F.t.z*.2*M,F,up:false})-1; A.tick=TK.push({x:p.x+F.n.x*.11*M,y:p.y+.08*M,z:p.z+F.n.z*.11*M,F,on:false})-1; }
      else{ const n=b.units.length, cols=n>6?3:2, rows=Math.ceil(n/cols), cw=.2*M, rh=.15*M, W=cols*cw+.06*M, H=rows*rh+.2*M, p=place(F,side+.1*T,1.05*M), [sx,sz]=orient(F,W,.12*M);
        blk(p.x,p.y,p.z,sx,H,sz,BRASS);
        b.units.forEach((u,i)=>{ const c=i%cols, r=Math.floor(i/cols), ox=(c-(cols-1)/2)*cw, oy=H/2-.13*M-r*rh, q={x:p.x+F.t.x*ox+F.n.x*.065*M,y:p.y+oy,z:p.z+F.t.z*ox+F.n.z*.065*M}, [dx,dz]=orient(F,cw*.86,.02*M);
          blk(q.x,q.y,q.z,dx,rh*.8,dz,0x6a5a3a); const A=MAIL.addr.find(a=>a.b===b&&a.unit===u.unit); A.box={x:q.x,y:q.y,z:q.z,F}; A.tick=TK.push({x:q.x+F.n.x*.012*M,y:q.y+rh*.22,z:q.z+F.n.z*.012*M,F,on:false,small:true})-1; });
        const s={x:p.x+F.n.x*.07*M,y:p.y-H/2+.07*M,z:p.z+F.n.z*.07*M}, [ox,oz]=orient(F,W*.6,.02*M); blk(s.x,s.y,s.z,ox,.035*M,oz,0x14161a);
        b.slot={x:p.x,y:p.y,z:p.z,F}; b.flag=FL.push({x:p.x+F.t.x*(W/2+.03*M),y:p.y,z:p.z+F.t.z*(W/2+.03*M),F,up:false})-1; for(const A of MAIL.addr)if(A.b===b)A.flag=b.flag; }
      b.step={x:F.at.x+F.n.x*.55*T+F.t.x*.6*T,z:F.at.z+F.n.z*.55*T+F.t.z*.6*T};
      if(b.up&&b.up.length){ const off=-(b.id==='dojo'?2.6:1.9)*T, p=place(F,off,1.05*M), [dx,dz]=orient(F,.95*M,.06*T), y0=p.y-1.05*M;
        blk(p.x,y0+1.08*M,p.z,dx,2.15*M,dz,0x2c4a3a); const [kx,kz]=orient(F,.04*M,.03*T); blk(p.x+F.t.x*.32*M+F.n.x*.05*T,y0+1.05*M,p.z+F.t.z*.32*M+F.n.z*.05*T,kx,.06*M,kz,0xc8a850);
        const [sx2,sz2]=orient(F,1.2*M,.5*T); blk(p.x+F.n.x*.25*T,y0+.05*M,p.z+F.n.z*.25*T,sx2,.1*M,sz2,0x8a8478);
        b.upStep={x:F.at.x+F.n.x*.75*T+F.t.x*off,z:F.at.z+F.n.z*.75*T+F.t.z*off};
        b.up.forEach((u,i)=>{ const q=place(F,off-(.75+i*.5)*T,1.2*M), [bx,bz]=orient(F,.3*M,.16*M); blk(q.x,q.y,q.z,bx,.36*M,bz,0x3c4048); const A=MAIL.addr.find(a=>a.b===b&&a.unit===u.unit&&a.up);
          A.box={x:q.x,y:q.y,z:q.z,F}; A.flag=FL.push({x:q.x+F.t.x*.17*M,y:q.y,z:q.z+F.t.z*.17*M,F,up:false})-1; A.tick=TK.push({x:q.x+F.n.x*.09*M,y:q.y+.07*M,z:q.z+F.n.z*.09*M,F,on:false})-1; A.step=b.upStep; }); } }
    for(const A of MAIL.addr)if(!A.step)A.step=A.b.step;
    const pm=(PARK.x0+PARK.x1)/2, py=(PARK.y0+PARK.y1)/2, want=[[pm+6,BOD.FAR+.9],[RING.wr1+.9,py+7],[pm+9,RING.nr0-.9],[AVE.r0-.9,py-7]], free=window.STFREE||(()=>true);
    for(const [tx,ty] of want){ let s=null; for(let r=0;r<6&&!s;r+=.5)for(let a=0;a<8&&!s;a++){ const x=X(tx)+Math.cos(a*Math.PI/4)*r*T, z=Z(ty)+Math.sin(a*Math.PI/4)*r*T; if(free(x,z,.6*T))s={x,z}; } if(!s)continue;
      const y=G(s.x,s.z), w=.55*M, d=.5*M; for(const [lx,lz] of [[-1,-1],[1,-1],[-1,1],[1,1]])blk(s.x+lx*w*.38,y+.08*M,s.z+lz*d*.38,.06*M,.16*M,.06*M,0x1a2440);
      blk(s.x,y+.6*M,s.z,w,.88*M,d,0x24448c); blk(s.x,y+1.08*M,s.z,w*.9,.12*M,d*.9,0x2a4e9c); blk(s.x,y+.8*M,s.z,w+.01*M,.08*M,d+.01*M,0xe8e8e0); blk(s.x,y+.96*M,s.z+d/2+.005*M,w*.6,.04*M,.02*M,0x101420);
      SOL.up.push([s.x-w/2-.05*T,s.z-d/2-.05*T,s.x+w/2+.05*T,s.z+d/2+.05*T]); FIX.up.push([s.x-w/2,s.z-d/2,y,s.x+w/2,s.z+d/2,y+1.15*M]);
      MAIL.cboxes.push({id:'cb'+MAIL.cboxes.length,x:s.x,z:s.z,y,in:[],name:'COLLECTION BOX'}); }
    const geo=new THREE.BoxGeometry(1,1,1), mk=(n,mat)=>{ const me=new THREE.InstancedMesh(geo,mat,Math.max(1,n)); me.castShadow=true; me.receiveShadow=true; MAPG.bodega.add(me); return me; };
    const me=mk(BL.length,new THREE.MeshLambertMaterial()), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color();
    BL.forEach(([x,y,z,sx,sy,sz,col],i)=>{ me.setMatrixAt(i,m4.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(sx,sy,sz))); me.setColorAt(i,c.setHex(col)); }); me.frustumCulled=false;
    MAIL.meFL=mk(FL.length,new THREE.MeshLambertMaterial({color:0xd8342a})); MAIL.meTK=mk(TK.length,new THREE.MeshLambertMaterial({color:0xf4f0e2})); MAIL.mePC=mk(24,new THREE.MeshLambertMaterial({color:0x9a7448})); MAIL.mePC.count=0;
    for(const m of [MAIL.meFL,MAIL.meTK])m.frustumCulled=false; MAIL.mePC.frustumCulled=false;
    MAIL.tris=(BL.length+FL.length+TK.length+24)*12; MAIL.mesh=me;
    const hit=(p,w,h,act,name)=>{ const hb=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(p.x,p.y,p.z); MAPG.bodega.add(hb); UI.thing({name,obj:hb,reach:1.1*T,near:2.4*T,tall:h+.3*T,act}); };
    for(const b of MAIL.B){ const s=b.units?b.slot:MAIL.addr.find(a=>a.b===b).box; hit(s,.7*M,b.units?.8*M:.6*M,()=>openBox(b),'MAILBOX'); }
    for(const A of MAIL.addr)if(A.up)hit(A.box,.5*M,.5*M,()=>note(A.label+' · '+A.name+(MAIL.waiting(A)?' · MAIL IN':' · EMPTY')),'MAILBOX');
    for(const cb of MAIL.cboxes)hit({x:cb.x,y:cb.y+.6*M,z:cb.z},.7*M,1.2*M,()=>note('COLLECTION BOX · PICKUPS 9:30 AND 16:00 · '+(cb.in.length?cb.in.length+' INSIDE':'EMPTY')),'COLLECTION BOX');
    draw(); };
  const draw=()=>{ if(!MAIL.meFL)return; const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), V=THREE.Vector3;
    FL.forEach((f,i)=>{ const F=f.F, up=f.up; e.set(0,F.n.x?Math.PI/2:0,0); q.setFromEuler(e); const sx=.03*M, len=.24*M; m4.compose(new V(f.x,f.y+(up?len/2:0),f.z),q,up?new V(sx,len,sx):new V(sx,sx,len*.9)); MAIL.meFL.setMatrixAt(i,m4); });
    TK.forEach((t,i)=>{ const F=t.F, w=t.small?.1*M:.2*M; m4.compose(new V(t.x,t.y+(t.small?0:.03*M),t.z),q.identity(),t.on?new V(F.n.x?.01*M:w,.06*M,F.n.x?w:.01*M):new V(0,0,0)); MAIL.meTK.setMatrixAt(i,m4); });
    let n=0; for(const A of MAIL.addr){ const k=MAIL.L.filter(l=>l.to===A.id&&l.state==='delivered'&&l.kind==='PARCEL').length, st=A.step||A.b.step; for(let j=0;j<k&&n<24;j++,n++){ const y=G(st.x,st.z)+.18*M+j*.36*M; m4.compose(new V(st.x+(n%2)*.1*T,y,st.z),q.identity(),new V(.34*M,.34*M,.3*M)); MAIL.mePC.setMatrixAt(n,m4); } }
    MAIL.mePC.count=n; for(const m of [MAIL.meFL,MAIL.meTK,MAIL.mePC])m.instanceMatrix.needsUpdate=true; };
  const refresh=()=>{ if(!MAIL.ready)return; for(const f of FL)f.up=false; for(const t of TK)t.on=false;
    for(const l of MAIL.L){ const A=MAIL.byId(l.to), S=MAIL.byId(l.at);
      if(l.state==='delivered'&&A&&A.tick!=null&&l.kind!=='PARCEL')TK[A.tick].on=true;
      if(l.state==='posted'&&S&&S.flag!=null)FL[S.flag].up=true; }
    draw(); };
  MAIL.byId=id=>id&&MAIL.addr.find(a=>a.id===id);

  const PRICE={LETTER:1,POSTCARD:1,PARCEL:4,BILL:0,ADVERT:0,NOTICE:0,PAYMENT:1,GIFT:1};
  const purse=A=>{ if(!A||!A.who)return null; const w=A.who;
    if(w.type==='walker')return {get:()=>w.ref.cash||0,add:v=>{ w.ref.cash=(w.ref.cash||0)+v; }};
    if(w.type==='shop'||w.type==='biz'){ const S=CIVIC.shops[w.ref]||CIVIC.shops['store:'+w.ref]; if(S)return {get:()=>S.till,add:v=>{ S.till+=v; }}; }
    return {get:()=>CIVIC.ledger.treasury,add:v=>{ CIVIC.ledger.treasury+=v; }}; };
  const H=(l,ev)=>{ l.hist.push([MAIL.day(),+CLOCK.h.toFixed(2),ev]); };
  MAIL.post=o=>{ const from=MAIL.byId(o.from), kind=o.kind||'LETTER', price=PRICE[kind]??1, P=purse(from);
    if(price&&P&&P.get()<price){ if(o.from)log((from?from.name:'someone')+' had no money for a stamp'); return null; }
    if(price&&P){ P.add(-price); CIVIC.ledger.treasury+=price; }
    const to=MAIL.byId(o.to), l={id:++MAIL.nid,kind,from:o.from||null,fromName:o.fromName||(from?from.name:'?'),fromLabel:from?from.label:(o.fromLabel||''),to:o.to,toName:to?to.name:(o.toName||'?'),toLabel:to?to.label:(o.toLabel||'NO SUCH ADDRESS'),
      subject:o.subject||'',body:o.body||'',amount:o.amount||0,re:o.re||null,state:'posted',at:o.at||o.from||'counter',post:null,hist:[],tries:0};
    H(l,'posted '+(l.at==='counter'?'at the post office counter':MAIL.cboxes.find(c=>c.id===l.at)?'in a collection box':'in the sender\'s box')+(price?' ($'+price+' stamp)':''));
    if(l.at==='counter'){ l.state='collected'; l.post=stamp(); H(l,'postmarked '+fmt(l.post)); } else { const cb=MAIL.cboxes.find(c=>c.id===l.at); if(cb)cb.in.push(l.id); }
    MAIL.L.push(l); trim(); refresh(); return l; };
  const trim=()=>{ if(MAIL.L.length<=500)return; const old=MAIL.L.filter(l=>l.state==='read'||l.state==='dead'||l.state==='discarded'); old.slice(0,MAIL.L.length-500).forEach(l=>MAIL.L.splice(MAIL.L.indexOf(l),1)); };
  MAIL.nearCB=(x,z)=>MAIL.cboxes.slice().sort((a,b)=>Math.hypot(a.x-x,a.z-z)-Math.hypot(b.x-x,b.z-z))[0];
  MAIL.take=(id,reader)=>{ const got=MAIL.L.filter(l=>l.to===id&&l.state==='delivered'); for(const l of got){ l.state='read'; H(l,'taken out and read'+(reader?' by '+reader:'')); readEffect(l); } if(got.length)refresh(); return got; };
  const readEffect=l=>{ const A=MAIL.byId(l.to), P=purse(A);
    if(l.kind==='GIFT'&&l.amount&&P){ P.add(l.amount); log(A.name+' found $'+l.amount+' in a card'); }
    if(l.kind==='PAYMENT'&&l.amount&&P){ P.add(l.amount); const b=MAIL.L.find(x=>x.id===l.re); if(b){ b.paid=true; H(b,'paid'); } log(A.name+' banked a payment of $'+l.amount); }
    if(l.kind==='BILL'&&A)pay(l);
    if((l.kind==='LETTER'||l.kind==='POSTCARD')&&l.from&&A&&!l.auto&&rnd()<(MAIL.replyP??.55))setTimeout(()=>reply(l),400+rnd()*2000); };
  const pay=b=>{ const A=MAIL.byId(b.to), P=purse(A); if(!P||b.paid)return; if(P.get()<b.amount+1){ b.owed=true; H(b,'could not be paid'); log(A.name+' could not pay '+b.subject.toLowerCase()); return false; }
    P.add(-b.amount); b.paid=true; MAIL.post({from:A.id,to:b.from,kind:'PAYMENT',amount:b.amount,re:b.id,subject:'PAYMENT: '+b.subject,body:'Enclosed, a check for $'+b.amount+'.\n'+A.name,at:postAt(A)}); return true; };
  MAIL.pay=pay;
  const postAt=A=>{ if(!A)return 'counter'; if(A.kind==='civic')return 'counter'; if(A.who&&(A.who.type==='shop'||A.who.type==='biz')){ const s=A.b.step; return MAIL.nearCB(s.x,s.z).id; } return A.id; };
  MAIL.postAt=postAt;

  const W=(a)=>pick(a);
  const LETTERS=[['HELLO','Just a note to say hello. The street has been lively lately. Write back when you can.'],['THE WEATHER','Did you see the sky last night? I sat on the stoop till late.'],['DINNER?','Are you free one evening this week? The Diner does a good plate.'],
    ['THANK YOU','Thank you for the other day. It meant a lot.'],['NEWS','I finally fixed the radiator. It knocks now, but it is warm.'],['THE PARK','The lamps along the paths come on one by one at dusk. You should see it.'],['A FAVOUR','Could you water my plants while I am away on the seventh day?']];
  const CARDS=[['GREETINGS FROM THE PARK','The round in the middle of the park, the lamps, a little rain. Wish you were here.'],['FROM THE AVENUE','Walked the whole loop today. My feet!'],['THE RIVER','The Hudson was silver this morning.']];
  const COMPLAINTS=[['THE STREET LIGHT','The light outside my door flickers. Please send someone.'],['NOISE','The bar is loud past curfew.'],['THE TRASH','The can on our corner was full again.']];
  const REPLIES=[['RE: ','Lovely to hear from you. All is well here.'],['RE: ','Yes! Let us do that soon.'],['RE: ','Thank you for writing. I keep your letters.'],['RE: ','Ha! Same here. See you on the street.']];
  const SHOPREPLY=['Thank you for your letter. Do come by: we keep the shelves full for you.','We have passed your note to the owner. Thank you!'];
  const HALLREPLY='Your letter has been received by City Hall and passed to the right department. Thank you for writing.';
  const reply=l=>{ const A=MAIL.byId(l.to); if(!A)return; let s, b;
    if(A.kind==='civic'){ s='RE: '+l.subject; b=HALLREPLY+'\n'+A.name; }
    else if(A.kind==='shop'||A.kind==='biz'){ s='RE: '+l.subject; b=W(SHOPREPLY)+'\n'+A.name; }
    else { const r=W(REPLIES); s=r[0]+l.subject.replace(/^RE: /,''); b=r[1]+'\n'+A.name; }
    MAIL.post({from:A.id,to:l.from,kind:'LETTER',subject:s,body:b,re:l.id,at:postAt(A)}); };
  MAIL.reply=reply;
  const people=()=>MAIL.addr.filter(a=>a.kind==='home'&&a.who);
  CITY.at(20.5,()=>{ if(!MAIL.ready)return; for(const A of people()){ if(rnd()>.3)continue; const r=rnd(), others=MAIL.addr.filter(a=>a!==A);
      if(r<.6){ const to=pick(people().filter(a=>a!==A)), c=rnd()<.25?W(CARDS):W(LETTERS); MAIL.post({from:A.id,to:to.id,kind:CARDS.includes(c)?'POSTCARD':'LETTER',subject:c[0],body:c[1]+'\n'+A.name,at:postAt(A)}); }
      else if(r<.85){ const to=pick(others.filter(a=>a.kind==='shop'||a.kind==='biz')); if(to)MAIL.post({from:A.id,to:to.id,subject:'AN ORDER',body:'Please put aside a few things for me. I will come by.\n'+A.name,at:postAt(A)}); }
      else if(MAIL.hall){ const c=W(COMPLAINTS); MAIL.post({from:A.id,to:MAIL.hall.id,subject:c[0],body:c[1]+'\n'+A.name+', '+A.label,at:postAt(A)}); } } },'the evening letters');
  CITY.at(11,()=>{ if(!MAIL.ready||MAIL.day()%7!==6)return; for(const S of MAIL.addr.filter(a=>a.kind==='shop')){ const to=people().sort(()=>rnd()-.5).slice(0,4); for(const A of to)MAIL.post({from:S.id,to:A.id,kind:'ADVERT',subject:S.name+': THIS WEEK',body:'Fresh on our shelves this week. Show this card for a little something extra.\n'+S.name,at:postAt(S)}); } },'the shops\' adverts');
  { const b0=CIVIC.buy; CIVIC.restocked=id=>{ const A=MAIL.byId(id.replace(/^store:/,'')); if(A&&MAIL.depot)MAIL.post({from:MAIL.depot.id,to:A.id,kind:'BILL',amount:15,subject:'DELIVERY: 12 CRATES',body:'For goods delivered to '+A.name+': $15.',at:'counter'}); }; }

  CIVIC.send=(to,from,subject,body)=>{ const A=MAIL.byId(to)||MAIL.byId(String(to).replace(/^store:/,'')); return MAIL.post({to:A&&A.id,toName:String(to),fromName:from,subject,body,at:'counter'}); };
  CIVIC.box=to=>{ const A=MAIL.byId(to); return A?MAIL.L.filter(l=>l.to===A.id&&(l.state==='delivered'||l.state==='read')):[]; };
  const S_=()=>CIVIC.staff.carrier;
  const sortMail=()=>{ let n=0; for(const l of MAIL.L.filter(l=>l.state==='collected')){
      if(!MAIL.byId(l.to)){ if(MAIL.byId(l.from)&&!l.returned){ l.returned=true; l.to=l.from; l.toName=l.fromName; l.toLabel=l.fromLabel; l.subject='RETURN TO SENDER: '+l.subject; H(l,'no such address: returned to sender'); } else { l.state='dead'; H(l,'no such address, no sender: to the dead letters'); continue; } }
      l.state='sorted'; H(l,'sorted at the post office'); n++; } return n; };
  CITY.at(8,()=>{ if(!MAIL.ready)return; const S=S_(); const n=sortMail(); if(S&&S.state==='free'){ S.state='sorting'; S.N.st.wait=3; setTimeout(()=>{ if(S.state==='sorting')S.state='free'; },3000); } log('the post office sorted '+n+' piece'+(n===1?'':'s')+' of mail'); },'the sort');
  const clear=s=>{ const f=window.STFREE||(()=>true); for(let r=0;r<4;r+=.4)for(let a=0;a<8;a++){ const x=s.x+Math.cos(a*Math.PI/4)*r*T, z=s.z+Math.sin(a*Math.PI/4)*r*T; if(f(x,z,.35*T))return {x,z}; } return s; };
  const stopsFor=(sweep)=>{ const out=[];
    if(!sweep)for(const b of MAIL.B){ const ids=MAIL.addr.filter(a=>a.b===b).map(a=>a.id); const has=MAIL.L.some(l=>(l.state==='sorted'||l.state==='held')&&ids.includes(l.to)||l.state==='posted'&&ids.includes(l.at)); if(has)out.push({b,spot:clear(b.step)}); }
    for(const cb of MAIL.cboxes)if(cb.in.length||!sweep){ if(cb.in.length)out.push({cb,spot:clear({x:cb.x,z:cb.z+.9*T})}); }
    const ord=p=>{ const i=p.b?MAIL.B.indexOf(p.b):MAIL.B.findIndex(b=>Math.hypot(b.step.x-p.spot.x,b.step.z-p.spot.z)<12*T); return i<0?999:i; };
    return out.sort((a,b)=>ord(a)-ord(b)); };
  const collectAt=(st)=>{ let n=0; const ids=st.b?MAIL.addr.filter(a=>a.b===st.b).map(a=>a.id):[];
    for(const l of MAIL.L){ if(l.state!=='posted')continue; if(st.cb?st.cb.in.includes(l.id):ids.includes(l.at)){ l.state='collected'; l.post=l.post||stamp(); H(l,'collected by the carrier, postmarked '+fmt(l.post)); n++; } }
    if(st.cb)st.cb.in.length=0; return n; };
  const deliverAt=(b)=>{ let n=0; for(const A of MAIL.addr.filter(a=>a.b===b)){ const inBox=MAIL.L.filter(l=>l.to===A.id&&l.state==='delivered'&&l.kind!=='PARCEL').length;
      const mine=MAIL.L.filter(l=>l.to===A.id&&(l.state==='sorted'||l.state==='held')); let room=15-inBox, slip=false;
      for(const l of mine){ if(l.kind==='PARCEL'||room>0){ l.state='delivered'; H(l,l.kind==='PARCEL'?'left on the step':'delivered to the box'); if(l.kind!=='PARCEL')room--; n++; }
        else if(l.state!=='held'){ l.state='held'; H(l,'the box was full: held at the post office'); slip=true; } }
      if(slip)MAIL.post({to:A.id,fromName:'THE POST OFFICE',kind:'NOTICE',subject:'MAIL HELD FOR YOU',body:'Your box was full. We are holding your mail at the post office; it comes on the next round once there is room.',at:'counter'}); }
    return n; };
  const round=(sweep)=>{ const S=S_(); if(!MAIL.ready||!S||S.state!=='free'&&S.state!=='sorting')return; const stops=stopsFor(sweep); if(!stops.length)return;
    if(!sweep)for(const l of MAIL.L)if(l.state==='sorted'){ l.state='out'; H(l,'out for delivery'); }
    S.state='on the round'; S.job={kind:sweep?'collection':'mail',n:stops.length}; CIVIC.carry(S,0x3a6ac8); log((sweep?'the afternoon collection':'the mail round')+' began: '+stops.length+' stops','post'); let got=0, gave=0;
    const next=()=>{ const st=stops.shift(); if(!st){ for(const l of MAIL.L)if(l.state==='out'){ l.state='sorted'; l.tries++; H(l,'not delivered this round'); if(l.tries>=3&&MAIL.byId(l.from)&&!l.returned){ l.returned=true; l.to=l.from; l.subject='RETURN TO SENDER: '+l.subject; H(l,'undeliverable: returned to sender'); } }
        CIVIC.carry(S,null); log((sweep?'the collection':'the round')+' is done: '+gave+' delivered, '+got+' collected','post'); refresh(); CIVIC.home(S); return; }
      CIVIC.go(S,st.spot,ok=>{ if(ok){ if(st.b&&!sweep){ for(const l of MAIL.L)if(l.state==='out'&&MAIL.byId(l.to)&&MAIL.byId(l.to).b===st.b)l.state='sorted'; gave+=deliverAt(st.b); } got+=collectAt(st); refresh(); }
        else if(st.b)for(const l of MAIL.L)if(l.state==='out'&&MAIL.byId(l.to)&&MAIL.byId(l.to).b===st.b){ l.state='sorted'; l.tries++; H(l,'no way to the door this round'); }
        S.N.st.wait=1.2; setTimeout(next,MAIL.stopMs??1300); },MAIL.v||1.8); };
    next(); };
  CITY.at(9.5,()=>round(false),'the mail round'); CITY.at(16,()=>round(true),'the afternoon collection');
  MAIL.round=round; MAIL.sort=sortMail;

  CITY.at(9,()=>{ for(const A of MAIL.addr)if(A.kind==='civic')MAIL.take(A.id,A.name); },'the departments read their mail');
  CITY.at(10,()=>{ for(const A of MAIL.addr)if(A.kind==='shop'||A.kind==='biz'||A.up&&A.who&&A.who.type==='shop')MAIL.take(A.id,A.name); },'the shops read their mail');
  MAIL.waiting=A=>!!A&&MAIL.L.some(l=>l.to===A.id&&l.state==='delivered');

  const note=t=>{ let d=document.getElementById('mailnote'); if(!d){ d=document.createElement('div'); d.id='mailnote'; d.style.cssText='position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:19;padding:6px 12px;font:12px Silkscreen,monospace;letter-spacing:.5px;color:#f2c14e;background:#0e1016e8;border:2px solid #3a3f4e;pointer-events:none'; document.body.appendChild(d); }
    d.textContent=t; d.style.display='block'; clearTimeout(d.tm); d.tm=setTimeout(()=>{ d.style.display='none'; },4500); };
  MAIL.note=note;
  const openBox=b=>{ const As=MAIL.addr.filter(a=>a.b===b&&!a.up), n=As.filter(a=>MAIL.waiting(a)).length, out=MAIL.L.some(l=>l.state==='posted'&&As.some(a=>a.id===l.at));
    note((b.units?b.name+' · '+As.length+' BOXES':As[0].label)+(n?' · MAIL IN '+n:' · EMPTY')+(out?' · FLAG UP':'')); };

  const save=()=>{ if(!MAIL.ready)return; try{ SAVE.set('mail',JSON.stringify({v:1,day:MAIL.day(),h:CLOCK.h,nid:MAIL.nid,you:MAIL.you,L:MAIL.L.slice(-500),cb:MAIL.cboxes.map(c=>c.in),cash:Object.fromEntries(MAIL.addr.filter(a=>a.who&&a.who.type==='walker').map(a=>[a.id,a.who.ref.cash||0]))})); }catch(e){} };
  const restore=()=>{ let D=null; try{ D=JSON.parse(SAVE.get('mail')||'null'); }catch(e){} if(QS.get('fresh')&&QS.get('keepmail')!=='1')D=null;
    if(!D||D.v!==1)return;
    MAIL.day0=Math.max(0,(D.day||0)+((D.h||0)>CLOCK.h?1:0)); MAIL.nid=D.nid||0; MAIL.you=D.you||MAIL.you; MAIL.L=(D.L||[]).filter(l=>l&&l.id);
    (D.cb||[]).forEach((a,i)=>{ if(MAIL.cboxes[i])MAIL.cboxes[i].in=a||[]; }); for(const [id,v] of Object.entries(D.cash||{})){ const A=MAIL.byId(id); if(A&&A.who&&A.who.ref)A.who.ref.cash=v; }
    for(const l of MAIL.L)if(l.state==='out')l.state='sorted'; refresh(); };
  setInterval(save,30000); addEventListener('beforeunload',save); MAIL.save=save;

  const wait=()=>{ const ok=(STORE.places||[]).every(p=>p[1]||p[2])||performance.now()-(MAIL.t0||(MAIL.t0=performance.now()))>90000; if(ok&&window.WALKERS&&(WALKERS.list.length||!WALKERS.on))MAIL.build(); else setTimeout(wait,1500); };
  setTimeout(wait,1500);
  window.MAILDBG=()=>({ready:MAIL.ready,addr:MAIL.addr.length,boxes:MAIL.cboxes.length,you:MAIL.you,states:MAIL.L.reduce((a,l)=>(a[l.state]=(a[l.state]||0)+1,a),{}),carrier:S_()&&S_().state,day:MAIL.day()});
}
