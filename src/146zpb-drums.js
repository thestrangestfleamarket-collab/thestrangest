// THE DRUM KIT (owner, 7 Nov 2026: "lets do piano and drums and harp"): a five-piece kit with hi-hat, crash and ride, set down and sat at (INSTR, 146zp): a stick in each fist (the hand for each hit chosen as a drummer would, alternating when fast), the kick and the hi-hat under the feet, the cymbals swinging on their stands when struck; its sound the music engine's drum heads and cymbals (120); the book is grooves of every kind at every speed (made here, not downloaded).
import {THREE} from './003-shx.js';
import {IMK, INSTR} from './003b-systems.js';
import {imAct} from './120-game-music-2-instruments.js';
{ const {box,cyl,mat,sm,FIST}=INSTR, V3=THREE.Vector3;
  // where each piece is (metres, the drummer at the origin facing +z, +x their left): its centre, radius, depth, tilt toward the drummer; the music engine's order (IMK['drum kit'].parts)
  const PART=[{n:'KICK',c:[-.04,.27,.72],r:.26,d:.36,kick:1},{n:'SNARE',c:[.16,.6,.36],r:.17,d:.13,tilt:.12},{n:'TOM 1',c:[.15,.8,.56],r:.13,d:.2,tilt:.4},{n:'TOM 2',c:[-.17,.8,.56],r:.14,d:.21,tilt:.4},
    {n:'FLOOR TOM',c:[-.43,.55,.38],r:.18,d:.36,tilt:.05},{n:'HI-HAT',c:[.42,.78,.36],r:.18,cym:1,tilt:.08},{n:'CRASH',c:[.38,1.08,.66],r:.22,cym:1,tilt:.28},{n:'RIDE',c:[-.52,.98,.58],r:.26,cym:1,tilt:.18}];
  const K={id:'drums',name:'A DRUM KIT',skill:'drums',seat:{y:.48,z:0},lean:.1,look:.45,BOOK:[],slip:[1,7],cam:{p:[.85,1.65,1.45],t:[0,.7,.35]},
    help:'SPACE KICK · S SNARE · A HI-HAT, Q OPEN, Z ITS PEDAL · D F G THE TOMS · W CRASH · E RIDE, R ITS BELL · SHIFT ACCENT · ` A SONG'};
  K.dsp=()=>Object.assign({},IMK['drum kit'].dsp,{poly:40});
  // a hit's sound: a head struck nearer its middle or edge, a cymbal on its bow or bell, the hi-hat open when the left foot is up
  K.sound=(e,P)=>e.h==='P'?imAct('drum kit',{k:'hit',i:5,v:.35,r:.3}):imAct('drum kit',{k:'hit',i:e.n,v:Math.max(.1,Math.min(1,e.v)),r:e.b?.1:e.n>=5?.6:.25+.1*Math.random(),open:e.n===5&&e.o});
  K.hush=()=>[];
  // the recordings: a real kit, each piece at three loudnesses with two takes each (taken in turn); the hi-hat's foot or a closed hit cuts an open one short
  K.samples={...__DATA__("data/drums-samples.json"),file:__FILE__("data/drums-samples.mp3")};
  const KEY=['k','s','t1','t2','ft','hc','','cr','rd'], RR={};
  K.sample=e=>{ const v=Math.max(.05,Math.min(1,e.v)); let k=e.h==='P'?'hc':e.n===5?(e.o?'ho':'hc'):e.n===7&&e.b?'rb':e.n===6?'cr':KEY[e.n]; const L=e.h==='P'?0:v<.4?0:v<.85?1:2, r=RR[k]=(RR[k]||0)^1;
    return [{k:k+'.'+L+'.'+r,gain:(e.h==='P'?.45:.55+.45*v)*1.1,id:e.n,ch:e.n===5?'hh':null}]; };

  /* ---------- where a stick strikes each piece: a head a little nearer the drummer than its middle, a cymbal on its edge (crash) or bow (ride) or bell ---------- */
  const HIT=PART.map(p=>{ const c=new V3(...p.c), toMe=new V3(-c.x,0,-c.z).normalize(); if(p.kick)return c; if(p.cym)return c.clone().addScaledVector(toMe,p.r*(p.n==='CRASH'?.8:p.n==='RIDE'?.55:.6)).add(new V3(0,.012,0)); return c.clone().addScaledVector(toMe,p.r*.3).add(new V3(0,p.r*.3*Math.sin(p.tilt||0)+.004,0)); });
  const BELL=new V3(...PART[7].c).add(new V3(0,.03,0));
  const at=e=>e.b?BELL:HIT[e.n]; K.at=at;

  /* ---------- the book: grooves (steps of a bar: x a hit, X an accent, g a ghost note; o an open hi-hat), each at a few speeds, eight bars with a fill every fourth and a crash after ---------- */
  // [name, steps a bar, bpms, {k kick, s snare, h hi-hat, o open hi-hat, p hi-hat pedal, r ride, b ride bell, c crash, f floor tom}, how hard]
  const G=[['ROCK BEAT',16,[66,84,104,124],{k:'x.......x.......',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.'},1],
    ['FOUR ON THE FLOOR',16,[96,112,126],{k:'x...x...x...x...',s:'....x.......x...',h:'x...x...x...x...',o:'..x...x...x...x.'},3],
    ['ROCK, THE KICK PUSHED',16,[78,96,116],{k:'x.....x.x.....x.',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.'},4],
    ['HALF-TIME',16,[70,88,100],{k:'x.....x...x.....',s:'........X.......',h:'x.x.x.x.x.x.x.x.'},5],
    ['BACKBEAT IN SIXTEENTHS',16,[70,86,100],{k:'x.......x.x.....',s:'....x.......x...',h:'xxxxxxxxxxxxxxxx'},9],
    ['SHUFFLE',12,[76,96,116],{k:'x.....x..x..',s:'...x.....x..',h:'x.xx.xx.xx.x'},10],
    ['JAZZ RIDE',12,[110,150,190],{k:'g..g..g..g..',s:'.....g.....g',r:'x..x.xx..x.x',p:'...x.....x..'},14],
    ['BOSSA NOVA',16,[120,140,160],{k:'x..xx..xx..xx..x',s:'x..x..x...x..x..',r:'x.x.x.x.x.x.x.x.'},15],
    ['FUNK',16,[84,96,108],{k:'x.x....x..x.....',s:'....X..g.g..X..g',h:'x.x.x.x.x.x.x.x.',o:'..............x.'},18],
    ['TRAIN BEAT',16,[100,120,140],{k:'x...x...x...x...',s:'gxgXgxgXgxgXgxgX'},20],
    ['SAMBA',16,[96,112,128],{k:'x..xx..xx..xx..x',s:'x.x..x.x.x..x.x.',h:'xxxxxxxxxxxxxxxx'},24],
    ['SIX-EIGHT',12,[60,76,92],{k:'x.....x.....',s:'......x.....',h:'x.x.x.x.x.x.'},6],
    ['RIDE ROCK',16,[100,124,148],{k:'x.....x.x.......',s:'....x.......x...',r:'x.x.x.x.x.x.x.x.',b:'x...x...x...x...'},12],
    ['LINEAR FUNK',16,[84,98,112],{k:'x.....x...x.....',s:'...X.....X....X.',h:'.x.x.x.x.x.x.x.x'},26],
    ['DRUM AND BASS',16,[160,172,180],{k:'x.........x.....',s:'....X.......X...',h:'x.x.x.x.x.x.x.x.'},28],
    ['DOUBLE KICK',16,[110,130,150],{k:'x.x.x.x.x.x.x.x.',s:'....X.......X...',h:'x...x...x...x...'},32],
    ['FLOOR TOM GROOVE',16,[90,108,124],{k:'x.....x...x.....',s:'....x.......x...',f:'x.xxx.xxx.xxx.xx'},22],
    ['BLAST BEAT',16,[120,150,180],{k:'x.x.x.x.x.x.x.x.',s:'.x.x.x.x.x.x.x.x',r:'x.x.x.x.x.x.x.x.'},40]];
  const PN={k:0,s:1,h:5,o:5,p:5,r:7,b:7,c:6,f:4};
  // a fill: the last beat or two of the bar on the snare and toms, harder ones longer and in sixteenths
  const fill=(n,lvl)=>{ const o=[], L=lvl<10?4:lvl<22?8:n; for(let i=n-L;i<n;i++){ if(lvl<10&&i%2)continue; const u=(i-(n-L))/L; o.push([i,u<.3?1:u<.55?2:u<.8?3:4,i===n-1?1:.8]); } return o; };
  const make=(g,bpm)=>{ const [name,n,,P,base]=g, beat=60/bpm, step=beat*4/n, ev=[], lvl=base;
    for(let bar=0;bar<8;bar++){ const t0=1+bar*n*step, fb=bar%4===3, fs=fb?fill(n,lvl):[];
      for(const [k,pat] of Object.entries(P))for(let i=0;i<n;i++){ const ch=pat[i]; if(!ch||ch==='.')continue; if(fb&&k!=='k'&&k!=='p'&&i>=n-(fs.length?n-fs[0][0]:0))continue;
        ev.push({t:t0+i*step+(n===12&&i%3===2?0:0),n:PN[k],v:ch==='X'?1:ch==='g'?.28:.72,o:k==='o'?1:0,b:k==='b'?1:0,h:k==='k'?'F':k==='p'?'P':''}); }
      for(const [i,p,v] of fs)ev.push({t:t0+i*step,n:p,v,h:''});
      if(bar===0||bar===4)ev.push({t:t0,n:6,v:1,h:''}); }
    ev.push({t:1+8*n*step,n:6,v:1,h:''},{t:1+8*n*step,n:0,v:1,h:'F'});
    ev.sort((a,b)=>a.t-b.t||(a.h==='F'?-1:0)); stick(ev,step);
    const secs=ev[ev.length-1].t, nps=ev.length/secs;
    return {name:name+' · '+bpm+' BPM',by:'',hard:base*1.2+nps*2.2+bpm/12,secs:Math.round(secs),c:{ev,len:secs+1.5}}; };
  // the sticking: the hi-hat and ride the right hand, the snare the left, the toms and crash whichever is free; a hand that just struck lets the other take a fast note
  const PREF=['F','L','L','R','R','R','R','R'];
  const stick=(ev,step)=>{ const last={L:-9,R:-9}; let i=0;
    while(i<ev.length){ let j=i; while(j<ev.length&&Math.abs(ev[j].t-ev[i].t)<1e-4)j++; const g=ev.slice(i,j), busy=new Set();
      for(const e of g.sort((a,b)=>(a.n===5||a.n===7?-1:0)-(b.n===5||b.n===7?-1:0))){ if(e.h)continue; let h=PREF[e.n]; if(e.n===5||e.n===7)h='R';
        if(busy.has(h)||(e.t-last[h]<.13&&e.t-last[h==='L'?'R':'L']>=.13&&!busy.has(h==='L'?'R':'L')))h=h==='L'?'R':'L';
        if(busy.has(h))continue; e.h=h; busy.add(h); last[h]=e.t; }
      i=j; }
    for(let k=ev.length-1;k>=0;k--)if(!ev[k].h)ev.splice(k,1); };
  { const B=[]; for(const g of G)for(const bpm of g[2])B.push(make(g,bpm)); B.sort((a,b)=>a.hard-b.hard); B.forEach((T,i)=>{ T.lvl=Math.round(1+99*i/(B.length-1)); K.BOOK.push(T); }); }
  K.compile=()=>{};

  /* ---------- the model: the shells and heads, the cymbals on their stands, the pedals, the throne, the sticks ---------- */
  const SHELL=0x7a1a20, HEAD=0xe6e1d4, CHROME=0xb9bdc6, BRONZE=0xc79a3c;
  K.model=()=>{ const g=new THREE.Group(), U=g.userData; U.parts=[]; U.cym=[];
    const rod=(a,b,r=.008)=>{ const A=new V3(...a), B_=new V3(...b), m=cyl(r,r,A.distanceTo(B_),CHROME,6); m.position.copy(A).add(B_).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new V3(0,1,0),B_.clone().sub(A).normalize()); g.add(m); return m; };
    PART.forEach((p,i)=>{ const c=new V3(...p.c), o=new THREE.Group(); o.position.copy(c); g.add(o); U.parts[i]=o;
      if(p.kick){ const sh=cyl(p.r,p.r,p.d,SHELL,28); sh.rotation.x=Math.PI/2; o.add(sh); for(const s of [-1,1]){ const hd=cyl(p.r+.006,p.r+.006,.012,HEAD,28,0,0,s*p.d/2); hd.rotation.x=Math.PI/2; o.add(hd); }
        for(const s of [-1,1])rod([c.x+s*.2,0,c.z-.1],[c.x+s*.18,.06,c.z-.05],.01); return; }
      if(p.cym){ const cy=new THREE.Group(); cy.rotation.x=-(p.tilt||0); o.add(cy); const plate=cyl(p.r*.13,p.r,.012,BRONZE,32); cy.add(plate); cy.add(cyl(.004,p.r*.13,.022,BRONZE,12,0,.012,0));
        if(p.n==='HI-HAT'){ const bot=cyl(p.r,p.r*.13,.012,BRONZE,32,0,-.02,0); o.add(bot); rod([c.x,0,c.z],[c.x,c.y+.05,c.z]); for(const a of [0,2.1,-2.1])rod([c.x,.42,c.z],[c.x+Math.sin(a)*.22,0,c.z+Math.cos(a)*.22]); }
        else { rod([c.x,c.y-.02,c.z],[c.x*1.15,c.y-.25,c.z*1.12]); rod([c.x*1.15,c.y-.25,c.z*1.12],[c.x*1.15,.35,c.z*1.12]); for(const a of [0,2.1,-2.1])rod([c.x*1.15,.35,c.z*1.12],[c.x*1.15+Math.sin(a)*.25,0,c.z*1.12+Math.cos(a)*.25]); }
        U.cym[i]={g:cy,a:0,w:0,ax:new V3(1,0,0),tilt:p.tilt||0,k:p.n==='HI-HAT'?260:p.n==='RIDE'?60:90}; return; }
      const dr=new THREE.Group(); dr.rotation.x=-(p.tilt||0); o.add(dr); dr.add(cyl(p.r,p.r,p.d,SHELL,24,0,-p.d/2,0)); const hd=cyl(p.r+.004,p.r+.004,.006,HEAD,24,0,.002,0); dr.add(hd); dr.add(cyl(p.r+.008,p.r+.008,.014,CHROME,24,0,-.002,0,true)); U.parts[i].head=hd;
      if(p.n==='SNARE'){ rod([c.x,c.y-p.d,c.z],[c.x,.25,c.z]); for(const a of [0,2.1,-2.1])rod([c.x,.25,c.z],[c.x+Math.sin(a)*.2,0,c.z+Math.cos(a)*.2]); }
      else if(p.n==='FLOOR TOM'){ for(const a of [.6,2.6,-1.5])rod([c.x+Math.sin(a)*p.r,c.y-.1,c.z+Math.cos(a)*p.r],[c.x+Math.sin(a)*(p.r+.04),0,c.z+Math.cos(a)*(p.r+.04)]); }
      else rod([c.x,c.y-p.d*.8,c.z],[PART[0].c[0]+(c.x>0?.06:-.06),PART[0].c[1]+PART[0].r,PART[0].c[2]-.05],.01); });
    // the pedals: the kick's (a plate and a beater on its post) under the right foot, the hi-hat's under the left
    const kp=new THREE.Group(); kp.position.set(-.06,.03,.42); kp.add(box(.08,.012,.24,0x2a2c32,0,0,0)); g.add(kp); U.kp=kp; kp.children[0].position.z=-.12;
    const bt=new THREE.Group(); bt.position.set(-.05,.12,PART[0].c[2]-PART[0].d/2-.06); bt.add(cyl(.004,.004,.17,CHROME,6,0,.085,0)); bt.add(cyl(.025,.025,.04,0x3a3a3a,10,0,.17,0)); bt.children[1].rotation.z=Math.PI/2; g.add(bt); U.bt=bt;
    const hp=new THREE.Group(); hp.position.set(.32,.03,.46); hp.add(box(.08,.012,.24,0x2a2c32,0,0,-.12)); g.add(hp); U.hp=hp;
    // the throne
    g.add(cyl(.17,.16,.07,0x141416,20,0,K.seat.y-.035,-.02)); rod([0,K.seat.y-.07,-.02],[0,.22,-.02],.014); for(const a of [0,2.1,-2.1])rod([0,.22,-.02],[Math.sin(a)*.24,0,-.02+Math.cos(a)*.24]);
    // the sticks
    U.st={}; for(const sd of ['L','R']){ const s=cyl(.006,.0078,.4,0xd9bc85,8); g.add(s); U.st[sd]=s; }
    return g; };

  /* ---------- the hands: a stick in each fist; for each hit the stick comes up and down onto its piece, rebounds and waits over it ---------- */
  const SH={L:new V3(.21,.97,.06),R:new V3(-.21,.97,.06)}, UP=new V3(0,1,0), STL=.28;
  const hitsOf=(P,H,t)=>{ const sc=INSTR.score(P), ev=sc.ev; if(H.sc!==sc){ H.sc=sc; H.lo=0; } if(H.lo>ev.length)H.lo=0; while(H.lo<ev.length&&ev[H.lo].t<t-1.5)H.lo++; return ev; };
  const lim=(P,H,t,sd)=>{ const ev=hitsOf(P,H,t); let prev=null, next=null; for(let i=H.lo;i<ev.length;i++){ const e=ev[i]; if(e.h!==sd)continue; if(e.t<=t)prev=e; else { next=e; break; } } return [prev,next]; };
  const pose=(sd,tip,lift)=>{ const s=SH[sd], sd0=tip.clone().sub(s); sd0.y=Math.min(sd0.y,-.25*Math.hypot(sd0.x,sd0.z)); sd0.normalize();
    const ax=new V3().crossVectors(sd0,UP).normalize(), dir=sd0.clone().applyAxisAngle(ax,Math.min(1.1,lift*5)), grip=tip.clone().addScaledVector(sd0,-STL).add(new V3(0,lift*.35,0)), tp=grip.clone().addScaledVector(dir,STL);
    const Dd=new V3(sd==='L'?.5:-.5,1,0).normalize(), Fd=sd==='R'?new V3().crossVectors(Dd,dir).normalize():new V3().crossVectors(dir,Dd).normalize();
    return {grip,dir,tp,Fd,Dd,wr:grip.clone().addScaledVector(Fd,-.065).addScaledVector(Dd,.02)}; };
  K.hands=(P,t,H)=>{ const out={};
    for(const sd of ['L','R']){ const [pv,nx]=lim(P,H,t,sd), home=sd==='L'?HIT[1]:HIT[5]; let tip, lift;
      const lead=nx?Math.min(.2,Math.max(.07,(nx.t-(pv?pv.t:t-1))*.6)):.2, L=e=>.03+.11*e.v;
      if(nx&&nx.t-t<lead){ const u=sm(1-(nx.t-t)/lead), from=pv&&t-pv.t<.3?at(pv):at(nx); tip=from.clone().lerp(at(nx),u); lift=L(nx)*(1-u*u); }
      else if(pv&&t-pv.t<.12){ tip=at(pv).clone(); lift=Math.min(L(pv),.05)*sm((t-pv.t)/.12); }
      else { tip=(pv?at(pv):home).clone(); lift=.05; }
      const q=pose(sd,tip,lift); H.st[sd]=q; out[sd]={wr:q.wr,Fd:q.Fd,Dd:q.Dd,fist:FIST,pole:new V3(sd==='L'?1:-1,-.7,-.3)}; }
    return out; };
  K.feet=(P,t,H)=>{ const ev=hitsOf(P,H,t); let kd=0, hat=1;
    for(let i=H.lo;i<ev.length&&ev[i].t<t+.2;i++){ const e=ev[i]; if(e.h==='F'){ const d=e.t-t; kd=Math.max(kd,d>0?(d<.12?sm(1-d/.12):0):Math.max(0,1+d/.1)); } if(e.n===5&&e.t<=t)hat=e.o?0:1; if(e.h==='P'&&e.t<=t+.05)hat=1; }
    H.kd=kd; H.hat=(H.hat??1)+(hat-(H.hat??1))*.4;
    return {L:new V3(.31,.1-.015*H.hat,.34),R:new V3(-.07,.11-.02*kd,.32)}; };
  K.after=(P,H)=>{ const U=H.G.userData; for(const sd of ['L','R']){ const q=H.st[sd], s=U.st[sd]; if(!q)continue; const g=H.wr[sd].clone().addScaledVector(q.Fd,.065).addScaledVector(q.Dd,-.02);
    s.position.copy(g).addScaledVector(q.dir,.08); s.quaternion.setFromUnitVectors(UP,q.dir); } };
  K.sway=(P,t,H)=>{ const sc=INSTR.score(P), n=sc.ev.length; return n&&t-sc.ev[n-1].t<2?.025*Math.sin(t*3.2):0; };
  // each frame: struck cymbals swing on their stands (a damped spring), heads jump, the kick's beater and pedals follow the feet, the hi-hat opens and closes
  K.anim=(P,H,t,dt)=>{ const U=H.G.userData, ev=hitsOf(P,H,t), t0=H.at??t; H.at=t;
    for(let i=H.lo;i<ev.length&&ev[i].t<=t;i++){ const e=ev[i]; if(e.t<=t0||e.h==='P')continue; const C=U.cym[e.n]; if(C){ const p=at(e), c=new V3(...PART[e.n].c); C.ax.set(-(p.z-c.z),0,p.x-c.x).normalize(); C.w-=(e.n===5?3:7)*e.v; } else if(U.parts[e.n]&&U.parts[e.n].head)U.parts[e.n].kick=1; }
    for(const C of U.cym){ if(!C)continue; const k=C.k, c=3; C.w+=(-k*C.a-c*C.w)*dt; C.a+=C.w*dt; C.a=Math.max(-.35,Math.min(.35,C.a)); C.g.quaternion.setFromAxisAngle(C.ax,C.a).premultiply(new THREE.Quaternion().setFromAxisAngle(new V3(1,0,0),-C.tilt)); }
    for(const p of U.parts)if(p&&p.head){ p.kick=(p.kick||0)*Math.pow(.0005,dt); p.head.position.y=.002-.004*p.kick; }
    U.kp.rotation.x=-.22+.2*(H.kd||0); U.bt.rotation.x=-.5+.75*(H.kd||0); U.hp.rotation.x=-.2+.18*(H.hat??1); U.parts[5].children[0].position.y=.022*(1-(H.hat??1)); };

  /* ---------- playing it: each key a piece; the hand chosen as a drummer would (the one that did not just strike takes a fast note) ---------- */
  const PAD={Space:[0,'F'],KeyS:[1],KeyJ:[1],KeyA:[5],KeyQ:[5,'',1],KeyZ:[5,'P'],KeyD:[2],KeyF:[3],KeyG:[4],KeyW:[6],KeyE:[7],KeyR:[7,'',0,1]};
  const LAB=[['Space','KICK'],['KeyS','SNARE'],['KeyA','HI-HAT'],['KeyQ','OPEN HAT'],['KeyZ','HAT PEDAL'],['KeyD','TOM 1'],['KeyF','TOM 2'],['KeyG','FLOOR'],['KeyW','CRASH'],['KeyE','RIDE'],['KeyR','BELL']];
  const ME=()=>INSTR.ME, lastH={L:-9,R:-9};
  const strike=(code,acc)=>{ const p=PAD[code]; if(!p)return; const [n,foot,o,b]=p, t=performance.now()/1000; let h=foot||PREF[n]; if(n===5||n===7)h='R';
    if(h==='L'||h==='R'){ const other=h==='L'?'R':'L'; if(t-lastH[h]<.12&&t-lastH[other]>=.06)h=other; lastH[h]=t; }
    INSTR.note(ME(),{n,v:acc?1:.72,o:o?1:0,b:b?1:0,h,d:.1}); INSTR.tell('n',[n,h,acc?1:0,o?1:0,b?1:0].join('.')); flash(code); };
  K.keys=(e,dn)=>{ if(!PAD[e.code])return false; if(dn&&!e.repeat)strike(e.code,e.shiftKey); return true; };
  K.click=(b,dn)=>{ if(dn&&b.dataset.pad)strike(b.dataset.pad,false); };
  const flash=code=>{ const el=document.querySelector('#inp .pads button[data-pad="'+code+'"]'); if(!el)return; el.classList.add('hit'); setTimeout(()=>el.classList.remove('hit'),110); };
  K.panel=()=>`<div class="pads">${LAB.map(([c,n])=>`<button data-pad="${c}" title="${c.replace('Key','')}">${n}<br><span style="opacity:.55">${c.replace('Key','')}</span></button>`).join('')}</div>`;
  K.status=()=>'';
  K.hear=(P,k,v)=>{ if(k!=='n')return; const [n,h,acc,o,b]=v.split('.'); const i=+n; if(!(i>=0&&i<8)||!/^[LRFP]$/.test(h))return; INSTR.note(P,{n:i,v:acc==='1'?1:.72,o:o==='1'?1:0,b:b==='1'?1:0,h,d:.1}); };

  INSTR.kind(K); INSTR.shelf('drums',K.model,.2); }
