// THE VIOLIN, THE FLUTE AND THE TRUMPET (owner, 9 Nov 2026: "Violin, flute, trumpet"): the instruments of one note at a time, held as you sit (INSTR, 146zp): the violin under the chin with its bow drawn down and up a note, the flute across to the right, the trumpet out front with its three valves; their sound real recordings of each (the VS Chamber Orchestra's, CC0); one book for the three, the tunes of the piano's pieces (data/melody-songs.json), each moved by octaves into the instrument's range.
import {THREE} from './003-shx.js';
import {INSTR} from './003b-systems.js';
import {GSND} from './146zo-guitar-sound.js';
{ const {box,cyl,mat,sm}=INSTR, V3=THREE.Vector3, Q4=THREE.Quaternion, UP=new V3(0,1,0), Z=new V3(0,0,1);
  const MEL=__LAZY__("data/melody-songs.json"), hz=m=>440*Math.pow(2,(m-69)/12);
  const HALF=[[.35,.25,.2,0],[.55,.6,.4,-.1],[.55,.65,.4,-.03],[.55,.65,.4,.04],[.5,.6,.4,.12]], DOWN=[[.45,.3,.25,0],[.85,.9,.55,-.1],[.85,.95,.55,-.03],[.85,.95,.55,.04],[.8,.9,.55,.12]], GRIP=[[.5,.5,.35,0],[1.1,1.2,.8,-.1],[1.15,1.25,.8,-.03],[1.15,1.25,.8,.04],[1.1,1.2,.8,.12]];
  const fing=dn=>HALF.map((f,i)=>dn[i]?DOWN[i]:f);
  // the top of the neck as you sit (last frame's), which the instrument is held against
  const head=H=>{ const v=H.hd||(H.hd=new V3()); return H.W?v.setFromMatrixPosition(H.W[2]).multiplyScalar(1/H.k):v.set(0,1.1,.02); };
  // the note sounding now (or the last one): its place in the score, and whether it still sounds
  const cur=(P,H,t)=>{ const ev=INSTR.score(P).ev; let i=H.ci||0; if(i>=ev.length||ev[i]&&ev[i].t>t)i=0; while(i+1<ev.length&&ev[i+1].t<=t)i++; H.ci=i; const e=ev[i]; return e&&e.t<=t?{e,i,on:t<e.t+e.d+.04}:null; };
  const lay=m=>{ m.rotation.x=Math.PI/2; return m; };
  const stool=g=>{ g.add(cyl(.17,.17,.06,0x1a1414,18,0,.43,0)); for(const a of [.5,2.6,-1.6])g.add(cyl(.012,.012,.4,0x1a1414,6,Math.sin(a)*.12,.2,Math.cos(a)*.12)); };
  // Polyfork's models of them (150cyb, when they have come): each laid along its instrument's own line, the first shapes hidden under it
  let PF=null; const LIVE=new Set();
  const dress=(it,C)=>{ const m=PF(C.id); if(!m)return; for(const c of it.children)c.visible=false; m.rotation.y=C.pf[0]; m.position.set(C.pf[1],C.pf[2],C.pf[3]); it.add(m);
    const bow=it.userData.bow, b=bow&&PF('violin_bow'); if(b){ for(const c of bow.children)c.visible=false; b.position.y=-.03; bow.add(b); } };
  INSTR.dressMel=mk=>{ PF=mk; for(const [it,C] of LIVE)dress(it,C); LIVE.clear(); };
  const make=(C)=>{ const [LO,HI]=C.range;
    const K={id:C.id,name:C.name,skill:C.id,seat:{y:.46,z:0},lean:0,look:C.look||0,BOOK:[],slip:[LO,HI],cam:C.cam};
    K.dsp=()=>({fam:'hit',poly:6,body:[],dry:0,wet:0,gain:.5});
    K.sound=e=>{ const f=hz(e.n), T=Math.max(.5,e.d*1.3), v=Math.max(.1,Math.min(1,e.v)); return [{k:'hit',modes:C.parts.map(([n,a])=>[f*n,T/(1+.15*n),a*v]),tau:.01,id:e.n,ch:300+e.n,noise:[.01*v,.02,300,3000]}]; };
    // the recordings: a held note (soft or loud) or a short one (each group as loud as the touch, data/<id>-samples.json lv), the nearest one's at its speed; a note joined to the last comes in without its new attack, the last fading under it; a held note swells a little, and the trumpet's (recorded straight) takes a player's vibrato
    K.samples=C.samples; K.mel=1;
    K.sample=(e,P,S)=>{ const m=e.n, v=Math.max(.05,Math.min(1,e.v)), L=v<.62?0:1, sh=e.d<.24&&!e.sl&&!e.lg, pick=g=>GSND.near(S,g,m), n=(sh&&(pick('s'+L)||pick('s'+(1-L))))||pick('l'+L)||pick('l'+(1-L)); if(!n)return [];
      const short=n.k[0]==='s', long=!short&&e.d>.6;
      const lv=K.samples.lv||{}, g=n.k.split(':')[0], ref=lv.l1||1;
      return [{...n,gain:C.gain*1.15*Math.pow(v,1.3)*Math.min(6,ref/(lv[g]||ref)),lp:C.lp*(.65+.35*v),id:m,ch:1,re:true,off:e.sl?C.leg:0,fin:e.sl?.05:.008,xf:e.sl?.09:.05,sw:long?.12:0,swT:Math.min(.8,e.d*.4),vib:long&&C.vib?C.vib:null}]; };
    K.release=e=>e.lg?[]:[{k:'damp',id:e.n,T:C.rel}];
    K.hush=()=>{ const o=[]; for(let m=LO;m<=HI;m++)o.push({k:'damp',id:m,T:.12}); return o; };
    K.click=()=>{};
    // the book: each piece's tune as [dt, midi, length] (centiseconds), moved by whole octaves into this instrument's range
    INSTR.lazyBook(K,()=>MEL().then(J=>({songs:J.songs.map(g=>({...g}))})));
    K.compile=T=>{ const n=T.n, ev=[]; let lo=127, hi=0, t=0; for(let i=0;i+2<n.length;i+=3){ lo=Math.min(lo,n[i+1]); hi=Math.max(hi,n[i+1]); } const sh=12*Math.round((LO+HI-lo-hi)/24);
      for(let i=0;i+2<n.length;i+=3){ t+=n[i]/100; let m=n[i+1]+sh; while(m<LO)m+=12; while(m>HI)m-=12; ev.push({t,n:m,d:n[i+2]/100,v:.75,h:'R'}); }
      T.c={ev,len:ev.reduce((a,e)=>Math.max(a,e.t+e.d),0)}; };
    K.model=()=>{ const g=new THREE.Group(), it=new THREE.Group(); stool(g); g.add(it); g.userData.it=it; C.build(it,it.userData); it.position.copy(C.at(new V3(0,1.1,.02))); it.quaternion.copy(C.q); if(PF)dress(it,C); else LIVE.add([it,C]); return g; };
    K.feet=()=>({L:new V3(.11,.09,.3),R:new V3(-.11,.09,.3)});
    K.sway=(P,t)=>{ const sc=INSTR.score(P), n=sc.ev.length; return n&&t-sc.ev[n-1].t<3?.03*Math.sin(t*1.2):0; };
    if(C.lookY)K.lookY=()=>C.lookY;
    K.hands=(P,t,H)=>C.hands(P,t,H,head(H),cur(P,H,t));
    K.anim=(P,H,t,dt)=>{ const it=H.G.userData.it; it.position.copy(C.at(head(H))); if(C.anim)C.anim(P,H,t,dt,it.userData,cur(P,H,t)); };
    INSTR.kind(K); INSTR.shelf(C.id,K.model,.16); return K; };

  /* ---------- the violin: under the left jaw, pointing out to the left; the left hand at the neck, a finger down for the note; the right draws the bow across by the bridge, down one note and up the next ---------- */
  { const A=new V3(.55,-.14,.8).normalize(), q=new Q4().setFromUnitVectors(Z,A).multiply(new Q4().setFromAxisAngle(Z,-.45)), B=new V3(-A.z,-.22,A.x).normalize();
    const at=h=>h.clone().add(new V3(.05,-.035,.07)), top=new V3(0,1,0).applyQuaternion(q), bowAt=(o,s)=>o.clone().addScaledVector(A,.22).addScaledVector(top,.05).addScaledVector(B,s);
    const stroke=(H,c,t)=>{ let s=.3; if(c&&c.on){ const u=Math.max(0,Math.min(1,(t-c.e.t)/Math.max(.18,c.e.d))), L=Math.min(.4,.14+c.e.d*.5); s=c.i%2?.12+L*(1-u):.12+L*u; } H.bs=H.bs==null?s:H.bs+(s-H.bs)*.45; return H.bs; };
    make({id:'violin',name:'A VIOLIN',pf:[-Math.PI/2,0,-.035,.3],range:[55,96],gain:1.25,lp:9000,rel:.22,leg:.07,look:.12,lookY:.35,cam:{p:[.95,1.4,.95],t:[.08,1.08,.22]},q,at,
      samples:{...__DATA__("data/violin-samples.json"),file:__FILE__("data/violin-samples.mp3")},parts:[[1,.14],[2,.1],[3,.07],[4,.04],[5,.03]],
      build:(g,U)=>{ const W=0x8a4a1c, bd=box(.2,.035,.36,W,0,0,.18); g.add(bd); for(const z of [.09,.27]){ const c=cyl(.105,.105,.036,W,20,0,0,z); g.add(c); }
        g.add(box(.03,.02,.27,0x1a1410,0,.03,.45)); g.add(box(.04,.035,.05,W,0,.01,.6)); g.add(box(.045,.03,.004,0xd8c8a0,0,.035,.14)); g.add(box(.05,.012,.09,0x1a1410,0,.03,.05));
        for(let i=0;i<4;i++)g.add(lay(cyl(.0008,.0008,.5,0xd8d8d8,4,(i-1.5)*.008,.045,.33)));
        const bow=new THREE.Group(); bow.add(cyl(.004,.004,.72,0x5a3218,6,0,.36,0)); bow.add(box(.012,.72,.002,0xe8e2d0,0,.36,.012)); bow.add(box(.014,.04,.022,0x1a1410,0,.02,.008)); U.bow=bow; },
      hands:(P,t,H,h,c)=>{ const o=at(h), nk=o.clone().addScaledVector(A,.47), dn=[0,0,0,0,0]; if(c&&c.on){ const k=(c.e.n-55)%7; if(k>0)dn[1+((k-1)%4)]=1; }
        const s=stroke(H,c,t), bh=bowAt(o,s);
        return {L:{wr:nk.clone().add(new V3(-.03,-.085,-.02)),Fd:new V3(.25,.85,-.3),Dd:new V3(-.4,-.1,.9),pole:new V3(.3,-.9,-.2),fist:fing(dn).map((f,i)=>i?[f[0]+.35,f[1]+.35,f[2]+.2,f[3]]:f)},
          R:{wr:bh.clone().add(new V3(0,.055,-.03)),Fd:new V3(.25,-.75,.45),Dd:new V3(-.2,.6,.75),pole:new V3(-.9,-.5,-.2),fist:GRIP}}; },
      anim:(P,H,t,dt,U,c)=>{ const bow=U.bow; if(bow.parent!==H.G)H.G.add(bow); const o=at(head(H)), s=H.bs==null?.3:H.bs; bow.position.copy(bowAt(o,s)); bow.quaternion.setFromUnitVectors(UP,B.clone().negate()); } }); }

  /* ---------- the flute: across the lips and out to the right, the left hand nearer, more fingers down the lower the note ---------- */
  { const F=new V3(-1,-.1,.12).normalize(), q=new Q4().setFromUnitVectors(Z,F), at=h=>h.clone().add(new V3(0,.058,.118));
    make({id:'flute',name:'A FLUTE',pf:[Math.PI/2,-.018,-.042,.2667],range:[60,96],gain:1.5,lp:11000,rel:.14,leg:.06,cam:{p:[-.75,1.35,1.15],t:[-.2,1.1,.15]},q,at,
      samples:{...__DATA__("data/flute-samples.json"),file:__FILE__("data/flute-samples.mp3")},parts:[[1,.2],[2,.06],[3,.03]],
      build:(g)=>{ const S=0xd0d4dc; g.add(lay(cyl(.0095,.0095,.66,S,10,0,0,.28))); g.add(lay(cyl(.012,.012,.03,S,10,0,.004,0))); for(let i=0;i<11;i++)g.add(cyl(.008,.008,.006,0xb8bcc6,8,0,.012,.17+i*.034)); },
      hands:(P,t,H,h,c)=>{ const o=at(h), n=c&&c.on?Math.round((1-((c.e.n-60)%12)/12)*6):3, l=o.clone().addScaledVector(F,.2), r=o.clone().addScaledVector(F,.42);
        return {L:{wr:l.clone().add(new V3(.035,-.075,.045)),Fd:new V3(-.45,.75,-.35),Dd:new V3(.1,.15,1),pole:new V3(.6,-.8,-.1),fist:fing([0,n>0,n>1,n>2,0])},
          R:{wr:r.clone().add(new V3(-.01,.03,-.085)),Fd:new V3(.05,-.2,1),Dd:new V3(0,.85,-.5),pole:new V3(-.8,-.6,-.3),fist:fing([0,n>3,n>4,n>5,0])}}; } }); }

  /* ---------- the trumpet: out from the lips, the right hand's three fingers on the valves, the left holding it ---------- */
  { const T=new V3(0,-.08,1).normalize(), q=new Q4().setFromUnitVectors(Z,T), at=h=>h.clone().add(new V3(0,.058,.118)), COMBO=[[1,1,1],[1,0,1],[0,1,1],[1,1,0],[1,0,0],[0,1,0],[0,0,0]];
    const valves=c=>c&&c.on?COMBO[(c.e.n-54)%7]:[0,0,0];
    make({id:'trumpet',name:'A TRUMPET',pf:[-Math.PI/2,.045,-.124,.25],range:[54,84],gain:1.1,lp:8000,rel:.12,leg:.05,vib:[14,5.2],cam:{p:[-.85,1.35,1.1],t:[0,1.1,.3]},q,at,
      samples:{...__DATA__("data/trumpet-samples.json"),file:__FILE__("data/trumpet-samples.mp3")},parts:[[1,.12],[2,.1],[3,.08],[4,.06],[5,.04],[6,.03]],
      build:(g,U)=>{ const Bz=0xd8b04a; g.add(lay(cyl(.006,.006,.5,Bz,8,0,0,.25))); g.add(lay(cyl(.011,.007,.03,Bz,8,0,0,.005)));
        const bell=cyl(.06,.008,.13,Bz,16,0,0,.5,true); bell.rotation.x=Math.PI/2; bell.material.side=THREE.DoubleSide; g.add(bell); g.add(lay(cyl(.006,.006,.3,Bz,8,0,-.05,.3)));
        U.v=[]; for(let i=0;i<3;i++){ g.add(cyl(.011,.011,.085,Bz,10,0,-.025,.21+i*.03)); const cap=cyl(.008,.008,.012,0xf4efe4,8,0,.035,.21+i*.03); g.add(cap); U.v.push(cap); } },
      hands:(P,t,H,h,c)=>{ const o=at(h), v=o.clone().addScaledVector(T,.22).add(new V3(.024,.045,0)), d=valves(c);
        return {R:{wr:v.clone().add(new V3(-.085,.04,-.03)),Fd:new V3(1,-.25,.15),Dd:new V3(-.1,.9,-.35),pole:new V3(-.8,-.6,-.3),fist:fing([0,d[0],d[1],d[2],0])},
          L:{wr:v.clone().add(new V3(.09,-.05,-.025)),Fd:new V3(-.9,.3,.1),Dd:new V3(.35,-.15,.9),pole:new V3(.8,-.6,-.2),fist:GRIP}}; },
      anim:(P,H,t,dt,U,c)=>{ const d=valves(c); U.v.forEach((m,i)=>{ m.position.y+=((d[i]?.022:.035)-m.position.y)*.5; }); } }); } }
