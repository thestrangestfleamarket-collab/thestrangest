// JUGGLING (owner, 9 Nov 2026: "juggling"; 10 Nov 2026: "do 1-8"): JUGGLE, the JUGGLING skill: balls and clubs from the bodega, a book of fifty siteswap patterns (two balls up to seven, made here) learnt by SONGBK's rule, the hands and the props thrown and caught as the siteswap says (the arms by the guitar's IK), a fail drops them to the ground where they bounce and roll; others see it; tips from townsfolk watching.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INSTR, ONLINE, RAG, st, VIT, W3} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
import {HANDS} from './111b-hands.js';
import {BODEGA} from './146ze-bodega.js';
import {SONGBK} from './146znz-songbook.js';
import {GHOLD} from './146zoa-guitar-hold.js';
import {GUITAR} from './146zob-guitar.js';
const JUGGLE={}; window.JUGGLE=JUGGLE;
{ const now=()=>performance.now()/1000, V3=THREE.Vector3, M4=THREE.Matrix4, SECS=12, BEAT=.24, DW=.55, G=9.8;
  SONGBK.words.juggle={done:'JUGGLED',piece:'PATTERN',stumble:n=>`YOU DROP EVERYTHING IN ${n}. PICK THEM UP AND TRY IT AGAIN.`,crowd:'WATCHED'};
  FORAGE.add({names:{jugball:'A JUGGLING BALL',jugclub:'A JUGGLING CLUB'}}); FORAGE.sell('jugball','jugclub');
  /* ---------- the book: siteswaps (each throw's height in beats; a valid one lands every ball on a beat of its own), by how hard: more balls, higher throws, longer patterns ---------- */
  const NAMES={'3':'Cascade','4':'Fountain','5':'Five-Ball Cascade','6':'Six-Ball Fountain','7':'Seven-Ball Cascade','31':'Two-Ball Shower','51':'Shower','71':'Four-Ball Shower','91':'Five-Ball Shower','40':'Two In One Hand','330':'Two-Ball Flash','55500':'Five-Ball Flash','86':'Seven-Ball Half Shower'};
  const SS=['31','312','330','40','420','3','42','51','441','531','423','52512','50505','4413','45141','55500','612','711','4','53','534','552','5551','633','642','6451','71','741','7531','660',
    '5','645','744','663','753','771','6662','7562','91','97531','6','75','756','855','774','9555','7','867','966','86'];
  const th=s=>[...s].map(c=>parseInt(c,36)), valid=s=>{ const v=th(s), n=v.length, at=new Set(v.map((x,i)=>(i+x)%n)); return at.size===n&&v.reduce((a,b)=>a+b,0)%n===0; };
  const BOOK=SS.filter(valid).map(s=>{ const v=th(s), b=v.reduce((a,x)=>a+x,0)/v.length; return {name:NAMES[s]||'Siteswap '+s,by:b+' BALLS',ss:s,v,balls:b,secs:SECS,d:b*10+Math.max(...v)*1.5+v.length*.6}; }).sort((a,b)=>a.d-b.d);
  BOOK.forEach((T,i)=>{ T.lvl=Math.floor(i/5)*10+1+(i%5)*2; });
  // a pattern's throws laid out from empty hands: each beat's throw takes the prop landing then (a new one from the hand at the start); each prop's throws in order
  const plan=(T,beats)=>{ const land=new Map(), props=[]; for(let i=0;i<beats;i++){ const s=T.v[i%T.v.length]; if(!s)continue; let p=land.get(i); if(p==null){ p=props.length; props.push([]); } land.delete(i); props[p].push([i,s]); land.set(i+s,p); } return props; };
  /* ---------- where things are, in the body's own rest frame (metres; +x its left, +y up, +z ahead), at a moment counted in beats ---------- */
  const sm=u=>{ u=Math.max(0,Math.min(1,u)); return u*u*(3-2*u); };
  const geo=body=>{ const r=body.binv.map(m=>m.clone().invert()), sh=new V3().setFromMatrixPosition(r[3]), y0=sh.y-.42, z0=sh.z+.34, sg=h=>h?-1:1;   // (hand 0 his left, 1 his right)
    return {y0,z0,TP:[0,1].map(h=>new V3(sg(h)*.08,y0,z0)),CP:[0,1].map(h=>new V3(sg(h)*.25,y0+.03,z0)),RS:[0,1].map(h=>new V3(sg(h)*.17,y0-.05,z0-.03))}; };
  // a prop at beat t: in the air between a throw and its catch, else in a hand (scooping from the catch to its next throw), else (before its first throw) resting in the hand that will throw it
  const propAt=(J,p,t,o)=>{ const L=J.props[p], g=J.g, b=J.b; let k=-1; for(let i=0;i<L.length&&L[i][0]<=t;i++)k=i;
    if(k<0){ const h=L[0][0]%2, n=J.props.slice(0,p).filter(q=>q[0][0]%2===h).length; o.p.copy(g.RS[h]); o.p.y+=n*.07; o.h=h; o.air=false; o.u=0; return o; }
    const [i,s]=L[k], h0=i%2, h1=(i+s)%2, nxt=L[k+1]?L[k+1][0]:i+s;
    if(s<=2){ const u=(t-i)/Math.max(1,nxt-i); o.p.lerpVectors(g.RS[h1],g.TP[h1],sm(u*2-1)); o.h=h1; o.air=false; o.u=0; return o; }   // (a 2 held, a 1 passed low and quick)
    const c=i+s-DW; if(t<c){ const T=(s-DW)*b, x=(t-i)*b, a=g.TP[h0], e=g.CP[h1], v=(e.y-a.y)/T+G*T/2; o.p.lerpVectors(a,e,x/T); o.p.y=a.y+v*x-G*x*x/2; o.p.z+=Math.sin(Math.PI*x/T)*.05; o.h=-1; o.air=true; o.u=x/T; o.T=T; o.vy=v-G*x; o.s=s; return o; }
    const u=(t-c)/(nxt-c); o.p.lerpVectors(g.CP[h1],g.TP[h1],sm(u)); o.p.y-=Math.sin(Math.PI*u)*.08; o.h=h1; o.air=false; o.u=0; return o; };
  // a hand at beat t: under the prop it holds, else on its way from its last throw out to its next catch
  const handAt=(J,h,t,out,props)=>{ const held=props.find(q=>q.h===h); if(held)return out.copy(held.p);
    const H=J.hands[h]; let tl=-9, tn=null; for(const x of H.th)if(x<=t)tl=x; for(const x of H.ca)if(x>t){ tn=x; break; }
    if(tn==null||tl<0)return out.copy(J.g.RS[h]); const u=sm((t-tl)/Math.max(.1,tn-tl)); out.lerpVectors(J.g.TP[h],J.g.CP[h],u); out.y-=Math.sin(Math.PI*u)*.04; return out; };
  /* ---------- the props: a bean bag or a club, each its own colour ---------- */
  const COL=[0xe8433a,0xf2c14e,0x3a8ee8,0x4ec46a,0xc04ee8,0xf08a2a,0xeeeeee];
  const mkProp=(kind,i)=>{ const m=new THREE.MeshLambertMaterial({color:COL[i%COL.length]}); if(kind==='ball'){ const b=new THREE.Mesh(new THREE.SphereGeometry(.034,10,8),m); b.castShadow=true; return b; }
    const g=new THREE.Group(), w=new THREE.MeshLambertMaterial({color:0xf4f0e6}), h=new THREE.Mesh(new THREE.CylinderGeometry(.011,.014,.2,8),w), bd=new THREE.Mesh(new THREE.CylinderGeometry(.034,.018,.26,10),m), kn=new THREE.Mesh(new THREE.SphereGeometry(.016,8,6),w);
    h.position.y=-.12; bd.position.y=.1; kn.position.y=-.23; g.add(h,bd,kn); g.traverse(o=>{ if(o.isMesh)o.castShadow=true; }); return g; };
  /* ---------- a juggler: the pattern, its clock, its drop, the props on the body; the arms brought to the hands' places each frame (PM.post, as the guitar and the instruments) ---------- */
  const mk=id=>({id,J:null,H:null,free:[]});
  const begin=(P,i,fail,kind,t0)=>{ const T=BOOK[i]; if(!T)return; end(P,true); const beats=Math.ceil(T.secs/BEAT)+12, props=plan(T,beats), hands=[0,1].map(()=>({th:[],ca:[]}));
    props.forEach(L=>L.forEach(([b0,s])=>{ hands[b0%2].th.push(b0); hands[(b0+s)%2].ca.push(s<=2?b0+s:b0+s-DW); })); for(const H of hands){ H.th.sort((a,b)=>a-b); H.ca.sort((a,b)=>a-b); }
    P.J={T,i,t0:t0??now(),fail,kind,props,hands,b:BEAT,g:null,m:props.map((_,k)=>mkProp(kind,k)),st:props.map(()=>({p:new V3(),h:-1})),dropped:false}; };
  const end=(P,quiet)=>{ if(P.H){ P.H.on=false; if(P.H.PM.post===P.H.fn)P.H.PM.post=null; const s=P.H.PM.hands; if(s)s.fg=null; } P.H=null; if(P.J)for(const m of P.J.m)if(m.parent&&!m.userData.free)m.parent.remove(m); P.J=null; };
  const {reach,aim,untwist,org}=GHOLD.IK, FG=HANDS.R0.map((f,i)=>i?[.55,.7,.45,f[3]]:[.35,.3,.2,f[3]]);
  const POLE=[new V3(.4,-1,-.5),new V3(-.4,-1,-.5)], FD=[new V3(-.25,.05,1),new V3(.25,.05,1)], DD=new V3(0,-1,0), PALM=new V3(0,.05,.065), VA=new V3(), MP=new M4(), MR=new M4(), HP=new V3();
  const attach=(P,me,PM,body)=>{ if(!body||!body.binv||!PM)return null; const restM=body.binv.map(m=>m.clone().invert()), W=restM.map(()=>new M4()), PB=new M4(), fg={L:FG.map(f=>f.slice()),R:FG.map(f=>f.slice())};
    const H={me,PM,on:true,PB}; P.J.g=geo(body); for(const m of P.J.m){ m.matrixAutoUpdate=false; me.add(m); }
    const toB=v=>v.clone().applyMatrix4(PB), dirB=v=>v.clone().transformDirection(PB);
    H.fn=PM.post=PMx=>{ const J=P.J; if(!H.on||!J)return; const Pv=PMx.value; PB.copy(Pv[1]); const t=(now()-J.t0)/J.b, held=J.dropped?null:J.st;
      if(!J.dropped)for(let p=0;p<J.props.length;p++)propAt(J,p,t,J.st[p]);
      if(held){ for(let i=0;i<15;i++)W[i].multiplyMatrices(Pv[i],restM[i]);
        for(const [h,sd,ids] of [[0,'L',[3,4,5]],[1,'R',[6,7,8]]]){ handAt(J,h,t,HP,held); reach(W,ids,toB(HP.sub(PALM)),dirB(POLE[h])); untwist(W,ids,1); aim(W,ids[2],sd,dirB(FD[h]),dirB(DD)); untwist(W,ids,2); }
        for(let i=0;i<15;i++)Pv[i].multiplyMatrices(W[i],body.binv[i]); if(PMx.hands)PMx.hands.fg=fg; }
      // the props on the body: a club turns over in the air (once a throw, twice for a high one), held pointing up and out
      if(!J.dropped)J.m.forEach((m,p)=>{ const q=J.st[p]; MP.copy(PB).multiply(MR.makeTranslation(q.p.x,q.p.y,q.p.z)); if(J.kind==='club'){ const a=q.air?q.u*Math.PI*2*(q.s>4?2:1):0; MP.multiply(MR.makeRotationX(.45+a)); } m.matrix.copy(MP); m.matrixWorldNeedsUpdate=true; }); };
    return H; };
  // dropped: every prop off the body into the world, falling, bouncing and rolling on the ground till it comes to rest (picked up after a while)
  const drop=P=>{ const J=P.J; if(!J||J.dropped)return; J.dropped=true; const me=P.H&&P.H.me; if(!me){ return; } me.updateMatrixWorld(true);
    const mpu=VA.setFromMatrixColumn(MR.multiplyMatrices(me.matrixWorld,P.H.PB),0).length(), up=new V3(0,1,0).transformDirection(MR);
    J.m.forEach((m,p)=>{ const q=J.st[p], w=new V3(), Q=new THREE.Quaternion(), S=new V3(); MR.multiplyMatrices(me.matrixWorld,m.matrix).decompose(w,Q,S); me.remove(m); W3.group.add(m);
      m.matrixAutoUpdate=true; m.position.copy(w); m.quaternion.copy(Q); m.scale.copy(S); m.userData.free=true;
      const v=up.clone().multiplyScalar((q.air?q.vy:0)*mpu).add(new V3((Math.random()-.5)*.5,0,(Math.random()-.5)*.5).multiplyScalar(mpu));
      P.free.push({m,v,r:.034*S.x,spin:(Math.random()-.5)*8,g:G*mpu,life:8}); }); };
  const fall=(P,dt)=>{ for(const f of P.free){ const m=f.m, p=m.position; f.life-=dt; f.v.y-=f.g*dt; p.addScaledVector(f.v,dt); const gy=(SHARED.groundY?SHARED.groundY(p.x,p.z):0)+f.r;
      if(p.y<gy){ p.y=gy; if(f.v.y<0)f.v.y=-f.v.y*.35; if(f.v.y<f.g*.06)f.v.y=0; f.v.x*=Math.exp(-5*dt); f.v.z*=Math.exp(-5*dt); m.rotation.x+=f.v.z*dt/f.r*.3; m.rotation.z-=f.v.x*dt/f.r*.3; } else m.rotation.y+=f.spin*dt; }
    for(let i=P.free.length-1;i>=0;i--)if(P.free[i].life<=0){ const m=P.free[i].m; if(m.parent)m.parent.remove(m); P.free.splice(i,1); } };
  /* ---------- you ---------- */
  const ME=mk('me'); let on=false;
  const myMesh=()=>W3.group.children.find(m=>m.userData&&m.userData.hands&&m.userData.PM&&m.visible!==undefined);
  const tell=v=>{ if(ONLINE.send)ONLINE.send({t:'jug',v}); };
  const kindFor=T=>FORAGE.has('jugball')>=T.balls?'ball':FORAGE.has('jugclub')>=T.balls?'club':null;
  const can=()=>!SHARED.drive&&!RAG.on&&!VIT.dead&&!st.sit&&!st.ride&&!st.climb&&!st.hang&&!(st.water&&st.water.in);
  JUGGLE.go=(i,force)=>{ const T=BOOK[i]; if(!T)return false;
    if(!SONGBK.can('juggle',BOOK,T)){ SAY(`${T.name.toUpperCase()} IS NOT OPEN TO YOU YET (JUGGLING ${T.lvl}; YOURS IS ${(FORAGE.sk('juggle')||0).toFixed(1)}). LEARN THE PATTERNS YOU HAVE.`,'#c8a090'); return false; }
    const kind=kindFor(T); if(!kind){ SAY(`${T.name.toUpperCase()} NEEDS ${T.balls} JUGGLING BALLS OR CLUBS (YOU HAVE ${FORAGE.has('jugball')} BALLS, ${FORAGE.has('jugclub')} CLUBS). THE BODEGA SELLS THEM.`,'#c8a090'); return false; }
    if(!can()){ SAY('NOT HERE: STAND SOMEWHERE STEADY TO JUGGLE.','#c8a090'); return false; }
    if(GUITAR.on&&GUITAR.on())GUITAR.stop(); if(INSTR.on&&INSTR.on())INSTR.stop();
    const r=force||SONGBK.start('juggle',T), fail=r.ok?0:+(T.secs*r.at).toFixed(2); begin(ME,i,fail,kind); on=true; tell(i+':'+fail+':'+kind[0]); PN.draw(); return true; };
  JUGGLE.stop=quiet=>{ if(!ME.J)return; end(ME); on=false; tell(''); if(!quiet)SAY('YOU CATCH EVERYTHING AND STOP.'); PN.draw(); };
  const after=P=>{ const J=P.J; if(!J)return null; const t=now()-J.t0;
    if(J.fail&&t>=J.fail){ drop(P); end(P); return 'fail'; } if(t>=J.T.secs)return 'pass'; return null; };
  ONLINE.mine.jug=()=>ME.J?ME.J.i+':'+ME.J.fail+':'+ME.J.kind[0]+':'+(now()-ME.J.t0).toFixed(1):null;
  /* ---------- the others: their pattern from their word ('jug', and their state for those who come later), on their bodies here ---------- */
  const THEM=new Map();
  const hearIt=(id,v)=>{ let P=THEM.get(id); if(!P){ P=mk(id); THEM.set(id,P); } if(!v){ end(P); return; } const [i,f,k,ago]=String(v).split(':'); if(P.J&&P.J.i===+i&&ago)return;
    begin(P,+i,+f||0,k==='c'?'club':'ball',now()-(+ago||0)); };
  ONLINE.hear.jug=m=>{ if(m.id)hearIt(m.id,m.v); };
  SYS.add('dress',dt=>{ const me=myMesh(), body=BODIES.by[BODIES.pick()];
    if(ME.J){ if(!can())JUGGLE.stop(true); else if(!ME.H&&me)ME.H=attach(ME,me,me.userData.PM,body); }
    fall(ME,dt||0);
    for(const [id,P] of THEM){ const o=ONLINE.others.get(id); if(!o){ end(P); for(const f of P.free)if(f.m.parent)f.m.parent.remove(f.m); THEM.delete(id); continue; }
      if(P.J){ const F=o.fig; if(!P.H&&F&&F.body&&F.g.visible)P.H=attach(P,F.me,F.PM,F.body); if(P.H)o.wantPose=true; if(after(P)==='pass')end(P); }
      fall(P,dt||0); }
    for(const o of ONLINE.others.values())if(o.id&&o.x&&o.x.jug&&!THEM.has(o.id))hearIt(o.id,o.x.jug); },'146zr-juggle');
  // the try's end, yours: a pass caught and counted (tips if townsfolk watch), a drop counted as a stumble
  SYS.add('life',()=>{ const J=ME.J; if(!J)return; const t=now()-J.t0, T=J.T;
    if(J.fail&&t>=J.fail){ drop(ME); end(ME); on=false; SONGBK.done('juggle',T,false,J.fail/T.secs); PN.fill(); return; }   // (the others drop theirs at the same moment: it was in the word)
    if(!J.fail&&t>=T.secs){ end(ME); on=false; tell(''); SONGBK.done('juggle',T,true); SONGBK.busk('juggle',T); PN.fill(); } },'146zr-juggle');
  /* ---------- the book's panel: from a ball or club in the bag (JUGGLE) ---------- */
  const PN=SONGBK.panel({id:'jgp',title:'JUGGLING',skill:'juggle',book:()=>BOOK,goWord:'JUGGLE',go:i=>JUGGLE.go(i),stop:()=>JUGGLE.stop(),busy:()=>!!ME.J,off:()=>JUGGLE.close(),
    now:()=>ME.J?'JUGGLING '+ME.J.T.name.toUpperCase()+' · '+ME.J.T.balls+(ME.J.kind==='club'?' CLUBS':' BALLS'):''});
  JUGGLE.open=()=>PN.show(true); JUGGLE.close=()=>{ JUGGLE.stop(true); PN.show(false); };
  FORAGE.ACT.juggle=()=>{ if(PN.shown())JUGGLE.close(); else JUGGLE.open(); };
  FORAGE.ROWB.push(id=>id==='jugball'||id==='jugclub'?[[PN.shown()?'PUT THEM AWAY':'JUGGLE','juggle']]:[]);
  /* ---------- the bodega sells them, on the toys' shelf ---------- */
  if(BODEGA.MAKE){ BODEGA.MAKE.jugball=()=>{ const g=new THREE.Group(); for(let i=0;i<3;i++){ const b=mkProp('ball',i); b.scale.setScalar(2.4); b.position.set((i-1)*.17,.08,0); g.add(b); } return g; };
    BODEGA.MAKE.jugclub=()=>{ const g=new THREE.Group(); for(let i=0;i<3;i++){ const c=mkProp('club',i); c.scale.setScalar(1.5); c.rotation.z=Math.PI/2; c.position.set(0,.06,(i-1)*.12); g.add(c); } return g; };
    const row=BODEGA.LAYOUT.find(r=>r[0]==='wl1'&&r[1]===3); if(row)row[2].push('jugball','jugclub'); else BODEGA.LAYOUT.push(['wl1',3,['jugball','jugclub']]); }
  Object.assign(JUGGLE,{BOOK,PN,ME,THEM:()=>THEM,plan,valid,on:()=>on}); }
