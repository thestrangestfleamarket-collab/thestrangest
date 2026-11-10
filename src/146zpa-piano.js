// THE PIANO (owner, 7 Nov 2026: "lets do piano and drums and harp"): an upright of 88 keys, set down and sat at (INSTR, 146zp): each key a lever that dips under its finger, the sustain pedal under the right foot; its sound each string struck by a felt hammer (the strings' partials a little sharp as real stiff strings are, two strings a note beating, a damper on every key below the top two octaves); the book is Mutopia's solo piano pieces (data/piano-songs.json).
import {THREE} from './003-shx.js';
import {INSTR} from './003b-systems.js';
{ const {box,cyl,mat,sm}=INSTR, V3=THREE.Vector3, M4=THREE.Matrix4, Q4=THREE.Quaternion;
  // the keyboard (metres, the player at the origin facing +z, +x their left): white keys 20.5 mm (an upright sized for the Walker), the low notes on the left
  const WK=.0205, KF=.27, KL=.135, BL=.085, BW=.011, KY=.65, LO=21, HI=108;
  const BLACK=m=>[1,3,6,8,10].includes(m%12), WI=[], KX=[];
  { let w=0; for(let m=LO;m<=HI;m++){ if(BLACK(m)){ WI[m]=w-.5; } else { WI[m]=w; w++; } KX[m]=(25.5-WI[m])*WK; } }
  const top=(m,o=new V3())=>BLACK(m)?o.set(KX[m],KY+.022,KF+.06):o.set(KX[m],KY,KF+.03);
  const imHz=m=>440*Math.pow(2,(m-69)/12);
  const K={id:'piano',name:'A PIANO',skill:'piano',seat:{y:.46,z:0},lean:.16,look:.42,BOOK:[],slip:[21,108],cam:{p:[-1.5,1.3,.12],t:[0,.64,.28]},
    help:'Z S X D C… AND Q 2 W 3 E… THE KEYS · ← → THE OCTAVE · SPACE THE PEDAL · SHIFT LOUDER · ` A SONG'};

  /* ---------- the sound: a struck string's partials (n f0 √(1+Bn²), B the string's stiffness, rising up the keyboard), the hammer's felt softer when played soft, struck an eighth along the string (so the 8th partial is missing), each partial's ring shorter the higher it is; the lowest five on two strings a hair apart (the beat and the long second decay) ---------- */
  const hit=(m,v)=>{ const f0=imHz(m), B=Math.max(6e-5,1e-4*Math.pow(10,.028*(m-60))), T1=Math.max(1.6,19-(m-21)*.19), fc=350+4200*v*v+f0*1.5, modes=[];
    for(let n=1;n<=18;n++){ const f=n*f0*Math.sqrt(1+B*n*n); if(f>9500)break; const hs=Math.abs(Math.sin(n*Math.PI/8.2))+.04, hm=1/(1+Math.pow(f/fc,2)), a=.16*v*hs*hm/Math.pow(n,.55)*(m<36?1.25:1), t=T1/(1+.13*(n-1)+f/2600);
      if(n<=5){ const dc=.00045*(1+((m*7)%5)*.25); modes.push([f*(1-dc),t*1.15,a*.55],[f*(1+dc),t*.55,a*.5]); } else modes.push([f,t,a]); }
    return {k:'hit',modes,tau:.0008,id:m,ch:200+m,noise:[.035*v,.012,70,1800]}; };
  K.dsp=()=>({fam:'hit',poly:40,body:[],dry:0,wet:0,gain:.72});
  // the recordings: the Salamander grand, every third note, each played at the nearest one's speed; played soft, darker, as a real hammer's felt is
  K.samples={...__DATA__("data/piano-samples.json"),file:__FILE__("data/piano-samples.mp3")}; const PS=K.samples.s.map(r=>r[0]);
  K.sample=e=>{ const m=e.n, v=Math.max(.05,Math.min(1,e.v)); let m0=PS[0]; for(const k of PS)if(Math.abs(k-m)<Math.abs(m0-m))m0=k; return [{k:m0,rate:Math.pow(2,(m-m0)/12),gain:1.1*Math.pow(v,1.5),lp:900+15000*v*v,id:m,re:true}]; };
  K.sound=e=>[hit(e.n,Math.max(.08,Math.min(1,e.v)))];
  K.release=(e,P)=>{ if(e.n>88)return []; if(P&&P.st.ped){ (P.st.held||(P.st.held=new Set())).add(e.n); return []; } return [{k:'damp',id:e.n,T:.1+(88-e.n)*.004}]; };
  K.hush=P=>{ const o=[]; for(let m=LO;m<=HI;m++)o.push({k:'damp',id:m,T:.25}); if(P.st.held)P.st.held.clear(); return o; };
  const pedal=(P,d)=>{ P.st.ped=d; if(!d&&P.st.held){ const down=new Set(P.live.ev.filter(e=>e.d>1e6).map(e=>e.n)), out=[]; for(const m of P.st.held)if(!down.has(m))out.push({k:'damp',id:m,T:.12+(88-m)*.004}); P.st.held.clear(); INSTR.raw(P,out); } };

  /* ---------- the book: each piece's notes as [dt, midi, length, velocity*2+hand] (centiseconds), compiled to events ---------- */
  INSTR.lazyBook(K,__LAZY__("data/piano-songs.json"));
  K.compile=T=>{ const n=T.n, ev=[]; let t=0; for(let i=0;i+3<n.length;i+=4){ t+=n[i]/100; const vh=n[i+3]; ev.push({t,n:n[i+1],d:n[i+2]/100,v:(vh>>1)/15,h:vh&1?'R':'L'}); }
    T.c={ev,len:ev.reduce((a,e)=>Math.max(a,e.t+e.d),0)}; };

  /* ---------- the model: the case, the keys (two instanced sets, each key turned about its far end as it goes down), the pedals, the bench ---------- */
  const IM=new M4(), IQ=new Q4(), IP=new V3(), IS=new V3(1,1,1), AX=new V3(1,0,0);
  K.model=()=>{ const g=new THREE.Group(), wood=mat(0x2a1a12), dark=mat(0x150e0a);
    const NW=52, NB=36, wh=new THREE.InstancedMesh(new THREE.BoxGeometry(WK-.0013,.022,KL),mat(0xece4d0),NW), bk=new THREE.InstancedMesh(new THREE.BoxGeometry(BW,.022,BL),mat(0x111111),NB);
    wh.castShadow=bk.castShadow=true; wh.receiveShadow=true; const keys={}; let iw=0, ib=0;
    for(let m=LO;m<=HI;m++){ const b=BLACK(m), y=b?KY+.011:KY-.011, z=b?KF+KL-BL/2:KF+KL/2; keys[m]={b,i:b?ib++:iw++,y,z,dip:0,set:-1}; }
    g.add(wh,bk); g.userData.keys=keys; g.userData.wh=wh; g.userData.bk=bk;
    for(let m=LO;m<=HI;m++)place(g,m,0);
    const W=NW*WK;
    g.add(box(W+.05,.03,.2,dark,0,KY-.022-.015,KF+.08));   // the keybed
    for(const s of [-1,1])g.add(box(.035,.075,.24,wood,s*(W/2+.02),KY-.005,KF+.1));   // the cheeks
    g.add(box(W+.08,.05,.035,wood,0,KY+.03,KF+KL+.018));   // the rail behind the keys
    g.add(box(W+.12,1.2,.29,wood,0,.6,KF+KL+.18));   // the case
    g.add(box(W+.16,.035,.33,dark,0,1.215,KF+KL+.17));   // the lid
    { const d=box(.62,.2,.018,dark,0,KY+.2,KF+KL+.03); d.rotation.x=-.2; g.add(d); }   // the music desk
    g.add(box(W-.04,KY-.12,.025,wood,0,(KY-.12)/2+.04,KF+.25));   // the lower panel
    for(const s of [-1,1]){ g.add(box(.05,KY-.04,.05,wood,s*(W/2+.03),(KY-.04)/2,KF+.07)); g.add(box(.07,.04,.3,dark,s*(W/2+.03),.02,KF+.12)); }   // the legs and toe blocks
    const peds=[]; for(const x of [.055,0,-.055]){ const p=box(.022,.012,.075,mat(0xc9a24c),0,0,.0375); const pv=new THREE.Group(); pv.position.set(x,.05,KF+.2); pv.add(p); p.position.z=-.0375; g.add(pv); peds.push(pv); }   // soft, middle, sustain (the right)
    g.userData.peds=peds;
    // the bench
    g.add(box(.72,.05,.32,dark,0,K.seat.y-.025,-.04)); for(const x of [-.32,.32])for(const z of [-.17,.09])g.add(box(.035,K.seat.y-.05,.035,dark,x,(K.seat.y-.05)/2,z));
    return g; };
  const place=(g,m,dip)=>{ const k=g.userData.keys[m]; if(Math.abs(k.set-dip)<.003)return; k.set=dip; const mesh=k.b?g.userData.bk:g.userData.wh, L=k.b?BL:KL, piv=KF+KL+.24;
    // (a key is a lever: its front goes down about 9 mm, turning about a point far behind)
    const a=-dip*.009/(piv-(k.z-L/2)); IQ.setFromAxisAngle(AX,a); IP.set(KX[m],k.y+(piv-k.z)*Math.sin(a),k.z); IM.compose(IP,IQ,IS); mesh.setMatrixAt(k.i,IM); mesh.instanceMatrix.needsUpdate=true; };

  /* ---------- the hands: each a five-finger place along the keys that moves to the notes it must play; a note held or coming keeps the finger it was given; the fingers over the rest hover ---------- */
  const window_=(P,H,t)=>{ const sc=INSTR.score(P), ev=sc.ev; if(H.sc!==sc){ H.sc=sc; H.lo=0; H.c={L:WI[52]+.0,R:WI[69]}; }
    if(H.lo>ev.length)H.lo=0; while(H.lo<ev.length&&ev[H.lo].t+Math.min(ev[H.lo].d,8)<t-1)H.lo++;
    const out=[]; for(let i=H.lo;i<ev.length&&ev[i].t<=t+.25;i++){ const e=ev[i]; if(e.t+Math.min(e.d,1e5)>=t-.12)out.push(e); } return out; };
  const press=(e,t)=>{ const a=sm((t-(e.t-.035))/.035), end=e.t+Math.min(e.d,1e5); return Math.min(a,1-sm((t-end)/.05)); };
  K.hands=(P,t,H)=>{ const near=window_(P,H,t), out={}, S=H.c;
    for(const sd of ['L','R']){ const mine=near.filter(e=>e.h===sd), sg=sd==='R'?1:-1;
      // where the hand goes: over the notes it has now or next (a jump when one is out of its reach)
      const want=mine.filter(e=>e.t+Math.min(e.d,1e5)>t&&e.t<t+.25); if(want.length){ const lo=Math.min(...want.map(e=>WI[e.n])), hi=Math.max(...want.map(e=>WI[e.n])), mid=(lo+hi)/2, far=Math.abs(mid-S[sd])>3;
        S[sd]+=(mid-S[sd])*Math.min(1,(far?.5:.18)*(H.dt||1)); }
      // a finger for each note (kept while it lasts): by where it lies against the hand, no two on one finger
      const used=new Set(mine.filter(e=>e['f'+sd]!=null&&e.t<=t).map(e=>e['f'+sd]));
      for(const e of mine.sort((a,b)=>sg*(a.n-b.n)))if(e['f'+sd]==null){ let f=Math.max(0,Math.min(4,Math.round(sg*(WI[e.n]-S[sd]))+2)); for(let d=0;d<5&&used.has(f);d++){ const a=f+d, b=f-d; f=a<=4&&!used.has(a)?a:b>=0&&!used.has(b)?b:f; } e['f'+sd]=f; used.add(f); }
      const tips=[], w=[];
      for(let f=0;f<5;f++){ const wk=S[sd]+sg*(f-2), hov=new V3((25.5-wk)*WK,KY+.016,KF+.045+(f===0?-.025:0)); let best=null, ba=-1;
        // (the finger's note: the one sounding, else the next; it moves over its key as the note nears, goes down with the key, and lifts after)
        for(const e of mine)if(e['f'+sd]===f){ const a=e.t>t?1-sm((e.t-t)/.25):2+press(e,t); if(a>ba){ best=e; ba=a; } }
        if(best){ const k=top(best.n), a=best.t>t?1-sm((best.t-t)/.25):1, p=press(best,t), over=k.clone().setY(k.y+.016), dn=k.clone().setY(k.y-.009);
          tips[f]=hov.clone().lerp(over,a).lerp(dn,p); w[f]=1.4; }
        else { tips[f]=hov; w[f]=f===0?.4:.7; } }
      const cx=(25.5-S[sd])*WK;
      out[sd]={wr:new V3(cx-sg*.012,KY+.06,KF-.085),Fd:new V3(-sg*.08,-.42,1),Dd:new V3(sg*.1,1,.3),pole:new V3(sd==='L'?1:-1,-.55,-.7),tips,w}; }
    return out; };
  K.feet=(P,t)=>{ const d=P.st.ped?1:0; P.st.pd=(P.st.pd||0)+(d-(P.st.pd||0))*.35; return {L:new V3(.13,.09,.33),R:new V3(-.06,.1-.016*P.st.pd,.35)}; };
  K.sway=(P,t)=>{ const sc=INSTR.score(P), n=sc.ev.length; return n&&t-sc.ev[n-1].t<3?.02*Math.sin(t*1.6):0; };
  K.roll=(P,t,H)=>H.c?-.06*Math.max(-1,Math.min(1,((H.c.L+H.c.R)/2-25.5)/14)):0;
  K.lookY=(P,t,H)=>H.c?.25*Math.max(-1,Math.min(1,(25.5-(H.c.L+H.c.R)/2)/18)):0;
  // each frame: every key as deep as it is played, the sustain pedal down with the foot
  K.anim=(P,H,t,dt)=>{ H.dt=dt*60; const g=H.G, keys=g.userData.keys, down={};
    for(const e of window_(P,H,t)){ const p=press(e,t); if(p>(down[e.n]||0))down[e.n]=p; }
    for(let m=LO;m<=HI;m++){ const k=keys[m], d=down[m]||0; if(d!==k.dip||k.set<0){ k.dip=d; place(g,m,d); } }
    g.userData.peds[2].rotation.x=.18*(P.st.pd||0); };

  /* ---------- playing it: the computer's keys as two rows of a piano (as music programs have them), the octave, the pedal; the panel's keys by click ---------- */
  const ROW={KeyZ:0,KeyS:1,KeyX:2,KeyD:3,KeyC:4,KeyV:5,KeyG:6,KeyB:7,KeyH:8,KeyN:9,KeyJ:10,KeyM:11,Comma:12,KeyL:13,Period:14,Semicolon:15,Slash:16,
    KeyQ:12,Digit2:13,KeyW:14,Digit3:15,KeyE:16,KeyR:17,Digit5:18,KeyT:19,Digit6:20,KeyY:21,Digit7:22,KeyU:23,KeyI:24,Digit9:25,KeyO:26,Digit0:27,KeyP:28,BracketLeft:29,Equal:30,BracketRight:31};
  const LAB={}; for(const [c,i] of Object.entries(ROW))if(!LAB[i]||/^Key[Q-Y]|Digit/.test(c))LAB[i]=c.replace(/^Key|^Digit/,'').replace('Comma',',').replace('Period','.').replace('Semicolon',';').replace('Slash','/').replace('BracketLeft','[').replace('BracketRight',']').replace('Equal','=');
  const held=new Map(); let vel=.7;
  const ME=()=>INSTR.ME, oct=()=>ME().st.oct??48;
  const down=(id,m,v)=>{ const P=ME(); if(m<LO||m>HI||held.has(id))return; const e=INSTR.note(P,{n:m,v,d:1e9,h:m<60?'L':'R'}); held.set(id,e); INSTR.tell('n',m+'.'+Math.round(v*9)); light(m,true); };
  const up=id=>{ const e=held.get(id); if(!e)return; held.delete(id); INSTR.off(ME(),e); INSTR.tell('u',e.n); light(e.n,false); };
  K.blur=()=>{ for(const id of [...held.keys()])up(id); if(ME().st.ped){ pedal(ME(),false); INSTR.tell('p','0'); } };
  K.keys=(e,dn)=>{ const c=e.code, P=ME();
    if(ROW[c]!=null){ if(dn){ if(!e.repeat)down(c,oct()+ROW[c],Math.min(1,vel*(e.shiftKey?1.35:1))); } else up(c); return true; }
    if(c==='Space'){ if(dn&&!e.repeat){ pedal(P,true); INSTR.tell('p','1'); } else if(!dn){ pedal(P,false); INSTR.tell('p','0'); } INSTR.drawPanel(); return true; }
    if(dn&&(c==='ArrowLeft'||c==='ArrowRight')){ P.st.oct=Math.max(24,Math.min(84,oct()+(c==='ArrowRight'?12:-12))); INSTR.drawPanel(); keysHTML(); return true; }
    return false; };
  K.click=(b,dn)=>{ const P=ME(); if(b.dataset.n!=null){ const m=+b.dataset.n; if(dn)down('ptr'+m,m,vel); else up('ptr'+m); return; } if(!dn)return;
    if(b.dataset.o){ P.st.oct=Math.max(24,Math.min(84,oct()+(+b.dataset.o))); INSTR.drawPanel(); keysHTML(); }
    else if(b.dataset.ped){ pedal(P,!P.st.ped); INSTR.tell('p',P.st.ped?'1':'0'); INSTR.drawPanel(); } };
  const light=(m,v)=>{ const el=document.querySelector('#inp .kb b[data-n="'+m+'"]'); if(el)el.classList.toggle('on',v); };
  const keysHTML=()=>{ const el=document.querySelector('#inp .kb'); if(!el)return; const o=oct(), ws=[]; for(let i=0;i<=31;i++)if(!BLACK(o+i))ws.push(i); const w=100/ws.length; let h='';
    for(let i=0;i<=31;i++){ const m=o+i; if(!BLACK(m))h+=`<b class="w" data-n="${m}" style="left:${ws.indexOf(i)*w}%;width:${w}%">${LAB[i]||''}</b>`; else h+=`<b class="k" data-n="${m}" style="left:${(ws.indexOf(i-1)+1)*w-w*.3}%;width:${w*.6}%">${LAB[i]||''}</b>`; }
    el.innerHTML=h; };
  K.panel=()=>{ setTimeout(keysHTML,0); return `<div class="kb"></div><div class="r"><span class="d">OCTAVE</span><button data-o="-12" title="←">−</button><span id="pnoct"></span><button data-o="12" title="→">+</button><button data-ped="1" id="pnped" title="space">PEDAL</button><span class="d">TOUCH</span><input type="range" id="pnvel" min=".15" max="1" step=".05" value="${vel}" aria-label="touch"></div>`; };
  const NN=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  K.status=P=>'OCTAVE '+NN[oct()%12]+(oct()/12-1)+(P.st.ped?' · PEDAL DOWN':'');
  K.draw=(PN,P)=>{ const pv=PN.querySelector('#pnvel'); if(pv&&!pv.oninput)pv.oninput=e=>{ vel=+e.target.value; }; const o=PN.querySelector('#pnoct'); if(o)o.textContent=NN[oct()%12]+(oct()/12-1); const pd=PN.querySelector('#pnped'); if(pd)pd.setAttribute('aria-pressed',String(!!P.st.ped)); };

  /* ---------- the others: their notes ('n' midi.velocity, several by commas), their lifts ('u'), their pedal ('p') ---------- */
  K.hear=(P,k,v)=>{ if(k==='n')for(const s of v.split(',')){ const [m,q]=s.split('.').map(Number); if(m>=LO&&m<=HI)INSTR.note(P,{n:m,v:(q||6)/9,d:1e9,h:m<60?'L':'R'}); }
    else if(k==='u'){ const m=+v; const e=P.live.ev.find(e=>e.n===m&&e.d>1e6); if(e)INSTR.off(P,e); }
    else if(k==='p')pedal(P,v==='1'); };

  INSTR.kind(K); INSTR.shelf('piano',K.model,.16); }
