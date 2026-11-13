// THE DOUBLE BASS (owner, 8 Nov 2026: "add bass guitar too", then Polyfork's Double Bass): Polyfork's upright bass (data/pfbass.json, tools/pfbass-bake.py) set down and played from a tall stool (INSTR, 146zp): four strings E1 A1 D2 G2, the left hand stopping them up the neck (the thumb behind it, fingering 1-2-4), the right hand's first two fingers plucking by the end of the fingerboard, the plucked string shimmering; its sound the VS Chamber Orchestra's solo contrabass plucked (CC0), the music engine's bass strings till it comes; the book each piano piece's bass line (data/bass-songs.json).
import {THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {IMK, INSPECT, INSTR} from './003b-systems.js';
import {imAct} from './120-game-music-2-instruments.js';
{ const {cyl,sm}=INSTR, V3=THREE.Vector3, G=__DATA__("data/pfbass.json"), F=G.frame;
  const OPEN=[28,33,38,43], NM=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'], nm=m=>NM[m%12]+(Math.floor(m/12)-1);
  // where it stands before you (metres, you at the origin facing +z, +x your left): its back against your left knee, leaning in to your left shoulder, turned a little to your right
  const MB=new THREE.Matrix4().makeTranslation(.13,0,.3).multiply(new THREE.Matrix4().makeRotationY(-.32)).multiply(new THREE.Matrix4().makeRotationX(-.21));
  // a string's point (string 0 the low E, on your left; u 0 at the nut, 1 at the bridge), on its top or a little off it
  const XS=F.x.map(r=>r.slice()).reverse(), LEN=F.nut[0]-F.bri[0];
  const sp=(s,u,lift=0,out=0)=>new V3(XS[s][0]+(XS[s][1]-XS[s][0])*u,F.nut[0]-LEN*u,F.nut[1]+(F.bri[1]-F.nut[1])*u+lift-out).applyMatrix4(MB);
  const fretU=f=>1-Math.pow(2,-f/12), PLUCK=(F.nut[0]-(F.fb+.04))/LEN;
  const K={id:'bass',name:'A DOUBLE BASS',skill:'bass',seat:{y:.72,z:-.06},lean:.08,look:.35,BOOK:[],cam:{p:[1.35,1.4,1.35],t:[.1,1.0,.25]},
    help:'Z X C… E · A S D… A · Q W E… D · 1 2 3… G: EACH ROW A STRING, EACH KEY A STOP UP IT · SHIFT HARDER · ` A SONG'};
  K.dsp=()=>IMK['bass guitar'].dsp;
  const es=s=>3-s;   // the music engine's bass strings run G D A E
  K.sound=e=>imAct('bass guitar',{k:'pluck',s:es(e.s),f:e.f,v:Math.max(.1,Math.min(1,e.v)),p:.22,b:.5+.2*e.v});
  K.samples={...__DATA__("data/bass-samples.json"),file:__FILE__("data/bass-samples.mp3")}; const HS=K.samples.s.map(r=>r[0]);
  K.sample=e=>{ const m=OPEN[e.s]+e.f, v=Math.max(.05,Math.min(1,e.v)); let m0=HS[0]; for(const k of HS)if(Math.abs(k-m)<Math.abs(m0-m))m0=k; return [{k:m0,rate:Math.pow(2,(m-m0)/12),gain:1.2*Math.pow(v,1.1),lp:900+5000*v,id:es(e.s),re:true}]; };
  K.release=e=>imAct('bass guitar',{k:'mute',s:es(e.s),v:.3});
  K.hush=()=>[0,1,2,3].flatMap(s=>imAct('bass guitar',{k:'mute',s,v:.2}));

  /* ---------- the book: each piece's line as [dt, midi, length] (centiseconds), fingered as a bassist would: the stop nearest where the hand is, low on the neck ---------- */
  INSTR.lazyBook(K,__LAZY__("data/bass-songs.json"));
  const finger=(m,pos)=>{ let b=null, bc=1e9; for(let s=0;s<4;s++){ const f=m-OPEN[s]; if(f<0||f>14)continue; const c=(f?Math.abs(f-pos):1)+(f>7?2:0); if(c<bc){ bc=c; b={s,f}; } } return b||{s:0,f:Math.max(0,m-28)}; };
  K.compile=T=>{ const n=T.n, ev=[]; let t=0, pos=1; for(let i=0;i+2<n.length;i+=3){ t+=n[i]/100; const q=finger(n[i+1],pos); if(q.f)pos=q.f; ev.push({t,s:q.s,f:q.f,d:n[i+2]/100,v:.75}); }
    T.c={ev,len:ev.reduce((a,e)=>Math.max(a,e.t+e.d),0)}; };

  /* ---------- the model: the bass where it stands, its strings to shimmer, the stool ---------- */
  let GEO=null; const geo=()=>{ if(GEO)return GEO; const q=I16(G.pos), n=q.length/3, P=new Float32Array(q.length); for(let i=0;i<q.length;i++)P[i]=(q[i]+32500)*G.sc+G.lo[i%3];
    const c=B64(G.col), C=new Float32Array(n*3), col=new THREE.Color(); for(let i=0;i<n;i++){ col.setRGB(c[i*3]/255,c[i*3+1]/255,c[i*3+2]/255,THREE.SRGBColorSpace); C[i*3]=col.r; C[i*3+1]=col.g; C[i*3+2]=col.b; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('color',new THREE.BufferAttribute(C,3)); g.setIndex(new THREE.BufferAttribute(U16(G.tri),1)); g.computeVertexNormals(); g.computeBoundingSphere(); return GEO=g; };
  let MAT=null; const bassMesh=()=>{ const m=new THREE.Mesh(geo(),MAT||(MAT=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true}))); m.castShadow=m.receiveShadow=true; return m; };
  K.model=()=>{ const g=new THREE.Group(), U=g.userData, b=bassMesh(); b.matrixAutoUpdate=false; b.matrix.copy(MB); g.add(b);
    U.str=[0,1,2,3].map(s=>{ const a=sp(s,0,.003), c=sp(s,1,.003), m=cyl(.0035,.0035,a.distanceTo(c),0xb8b4a6,5); m.position.copy(a).add(c).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new V3(0,1,0),a.clone().sub(c).normalize()); m.castShadow=false; m.visible=false; g.add(m); return {m,a:0}; });
    g.add(cyl(.16,.16,.05,0x1a1414,18,0,K.seat.y-.025,K.seat.z)); for(const a of [.6,2.7,-1.5])g.add(cyl(.012,.014,K.seat.y-.05,0x1a1414,6,Math.sin(a)*.13,(K.seat.y-.05)/2,K.seat.z+Math.cos(a)*.13));
    g.add(cyl(.11,.11,.012,0x2a2222,14,0,.3,K.seat.z));   // the stool's rung
    return g; };
  K.shelf=()=>{ const g=new THREE.Group(), b=bassMesh(); b.rotation.z=Math.PI/2; b.position.set(.9,.3,0); g.add(b); return g; };   // lying on the bodega's shelf

  /* ---------- the hands: the left at its place up the neck (index on the stop, middle a semitone up, the little finger two), the thumb behind; the right's index and middle pluck in turn, pulling through towards you ---------- */
  const win=(P,H,t)=>{ const sc=INSTR.score(P), ev=sc.ev; if(H.sc!==sc){ H.sc=sc; H.lo=0; H.pos=H.pos||1; H.str=H.str??1; H.nx=0; } if(H.lo>ev.length)H.lo=0; while(H.lo<ev.length&&ev[H.lo].t<t-1.5)H.lo++;
    let cur=H.lo>0?ev[H.lo-1]:null, nxt=null; for(let i=H.lo;i<ev.length&&ev[i].t<=t+.4;i++){ const e=ev[i]; if(e.t<=t)cur=e; else if(!nxt)nxt=e; } return {cur,nxt}; };
  const TUNE={L:{Fd:[-.51,-.16,.66],Dd:[.98,-.24,.79],back:.093,add:[.002,.006,-.096],pole:[.33,-.94,-.58]},R:{Fd:[.64,-.46,.55],Dd:[-.79,.28,-.54],back:.11,add:[-.014,.005,.018],pole:[-1.06,-.7,-.51]},wt:.15,wh:.1};   // (the hands' ways, found by a search for the fingertips nearest their strings)
  const FG=[1,2,4];   // a stop a hand's place, one or two semitones up: index, middle, little
  K.hands=(P,t,H)=>{ const {cur,nxt}=win(P,H,t), want=nxt&&nxt.t-t<.18?nxt:cur;
    if(want&&want.f){ if(want.f<H.pos||want.f>H.pos+2)H.pos=want.f; } if(want)H.str=want.s;
    const pos=H.pos, s=H.str, up=f=>fretU(Math.max(.5,f-.45));
    // the left hand: each finger over its stop; the one stopping the note pressed down onto it
    const tips=[], w=[]; const press=want&&want.f?FG[Math.max(0,Math.min(2,want.f-pos))]:-1;
    tips[0]=sp(1,up(pos+1),-.075).lerp(sp(2,up(pos+1),-.075),.5); w[0]=TUNE.wt;   // (the thumb behind the neck)
    for(const [k,fi] of [[0,1],[1,2],[2,4],[2,3]]){ const f=pos+k, on=fi===press||(press===4&&fi===3); tips[fi]=sp(s,up(f),on?.004:.025); w[fi]=on?1.4:TUNE.wh; }
    const TL=TUNE.L, cL=tips[1].clone().add(tips[2]).add(tips[4]).multiplyScalar(1/3), FdL=new V3(...TL.Fd), DdL=new V3(...TL.Dd);
    const L={wr:cL.clone().addScaledVector(FdL.clone().normalize(),-TL.back).add(new V3(...TL.add)),Fd:FdL,Dd:DdL,pole:new V3(...TL.pole),tips,w,rest:[[.3,.4,.3,0],[.4,.6,.4,0],[.4,.6,.4,0],[.4,.6,.4,0],[.4,.6,.4,.2]]};
    // the right hand: the finger whose turn it is comes onto the string and pulls through it
    const pe=cur&&t-cur.t<.35?cur:null, pk=want?want.s:s, fin=pe?(H.nx===pe.t?H.fin:(H.fin=H.fin===1?2:1,H.nx=pe.t,H.fin)):(H.fin||1);
    const rt=[], rw=[]; for(const fi of [1,2]){ const base=sp(pk,PLUCK,.02); let q=base;
      if(fi===fin&&pe){ const u=t-pe.t; const on=sp(pe.s,PLUCK,.002), thru=sp(Math.min(3,pe.s+1),PLUCK,.004).add(new V3(0,.01,-.01)); q=u<.07?on.clone().lerp(thru,sm(u/.07)):thru.clone().lerp(base,sm((u-.07)/.25)); }
      else if(fi===fin&&want&&want.t>t){ q=base.clone().lerp(sp(want.s,PLUCK,.002),1-sm((want.t-t)/.18)); }
      rt[fi]=q; rw[fi]=fi===fin?1.3:TUNE.wh; }
    rt[0]=sp(3,PLUCK-.05,-.02).add(new V3(-.03,0,0)); rw[0]=.4; rt[3]=null; rt[4]=null;
    const TR=TUNE.R, FdR=new V3(...TR.Fd), DdR=new V3(...TR.Dd), cR=rt[1].clone().add(rt[2]).multiplyScalar(.5);
    const R={wr:cR.clone().addScaledVector(FdR.clone().normalize(),-TR.back).add(new V3(...TR.add)),Fd:FdR,Dd:DdR,pole:new V3(...TR.pole),tips:rt,w:rw,rest:[[.3,.4,.3,0],[.3,.4,.3,0],[.3,.4,.3,0],[.9,1.1,.8,.1],[1,1.2,.9,.2]]};
    return {L,R}; };
  K.feet=()=>({L:new V3(.2,.05,.3),R:new V3(-.12,.31,.04)});
  K.sway=(P,t)=>{ const sc=INSTR.score(P), n=sc.ev.length; return n&&t-sc.ev[n-1].t<3?.015*Math.sin(t*1.7):0; };
  K.lookY=()=>.35;
  K.anim=(P,H,t,dt)=>{ const U=H.G.userData, t0=H.at??t; H.at=t; const ev=INSTR.score(P).ev;
    for(let i=H.lo||0;i<ev.length&&ev[i].t<=t;i++){ const e=ev[i]; if(e.t>t0&&U.str[e.s])U.str[e.s].a=Math.min(1,.5+e.v); }
    for(const S of U.str){ if(S.a<.01){ if(S.m.visible){ S.m.visible=false; S.m.scale.set(1,1,1); } continue; } S.a*=Math.pow(.2,dt); const k=1+S.a*1.8*(.7+.3*Math.sin(t*60)); S.m.scale.set(k,1,k); S.m.visible=true; } };

  /* ---------- playing it: the four letter rows of the keys are the strings (Z row E, A row A, Q row D, the numbers G), each key a semitone up from the open string ---------- */
  const ROWS=[['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash'],['KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon'],
    ['KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP'],['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0']];
  const KS={}; ROWS.forEach((r,s)=>r.forEach((c,f)=>KS[c]=[s,f]));
  const ME=()=>INSTR.ME;
  const pluck=(s,f,v)=>{ INSTR.note(ME(),{s,f,v,d:2.5}); INSTR.tell('n',s+'.'+f+'.'+Math.round(v*9)); };
  K.keys=(e,dn)=>{ const q=KS[e.code]; if(!q)return false; if(dn&&!e.repeat)pluck(q[0],q[1],e.shiftKey?.95:.7); return true; };
  K.click=(b,dn)=>{ if(dn&&b.dataset.n!=null){ const [s,f]=b.dataset.n.split('.').map(Number); pluck(s,f,.7); } };
  K.hear=(P,k,v)=>{ if(k!=='n')return; const [s,f,q]=v.split('.').map(Number); if(s>=0&&s<4&&f>=0&&f<=14)INSTR.note(P,{s,f,v:(q||6)/9,d:2.5}); };
  INSTR.bass={sp,fretU,PLUCK,OPEN,finger,MB,TUNE};

  INSPECT.kinds.push({is:id=>id==='bass',make:()=>{ const g=new THREE.Group(); g.add(bassMesh()); return g; }});
  INSTR.kind(K); INSTR.shelf('bass',K.shelf,.14); }
