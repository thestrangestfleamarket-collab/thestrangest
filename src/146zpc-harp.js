// THE HARP (owner, 7 Nov 2026: "lets do piano and drums and harp"): a pedal harp of 34 strings (C2 to A6, the C strings red, the F strings dark blue), set down and sat at (INSTR, 146zp), leaning on your right shoulder: seven pedals under the feet (D C B left, E F G A right), each making every string of its letter flat, natural or sharp; both hands pluck with the thumb and three fingers (never the little one), the strings shimmering as they ring; its sound the music engine's strings on a soundboard (120); the book is the piano's and the guitar's pieces a pedal harp can really play (data/harp-songs.json).
import {THREE} from './003-shx.js';
import {IMK, INSTR} from './003b-systems.js';
import {imAct} from './120-game-music-2-instruments.js';
{ const {box,cyl,mat,sm}=INSTR, V3=THREE.Vector3;
  // the strings where Polyfork's concert harp has them (tools/pfitems-list.json harp_pf; metres, the harpist at the origin facing +z, +x their left): its 47 (C1 to G7) along the soundboard, these the 34 from C2 to A6;
  // the model scaled by FS, turned so its strings run away from you, at FZ: each string's foot on the soundboard's line, its top under the neck
  const N=34, PX=-.07, FS=.72, FZ=.45, TOPS=[1.531,1.526,1.52,1.51,1.5,1.49,1.48,1.47,1.46,1.45,1.44,1.427,1.414,1.401,1.387,1.374,1.361,1.347,1.334,1.321,1.307,1.294,1.28,1.267,1.254,1.24,1.238,1.235,1.233,1.231,1.229,1.226,1.224,1.222];
  const root=s=>new V3(PX,FS*(.217+.020543*(s+7)),FZ+FS*(.24-.012348*(s+7))), topY=s=>FS*TOPS[s], SB0=root(0), SB1=root(N-1);
  const pluckY=s=>{ const r=root(s).y, t=topY(s); return Math.max(r+.04,Math.min(t-.04,.86)); };
  // the harp leans back onto your shoulder, TILT about its foot: the strings' places as you see them
  const TILT=.1, tl=v=>{ const z=v.z-FZ; return new V3(v.x,v.y*Math.cos(TILT)+z*Math.sin(TILT),FZ+z*Math.cos(TILT)-v.y*Math.sin(TILT)); };
  const at=s=>{ const r=root(s); return tl(new V3(PX,pluckY(s),r.z)); };
  const LET=['C','D','E','F','G','A','B'], letter=s=>s%7, NAT=[0,2,4,5,7,9,11];
  // the pedals left to right as a harpist's feet find them: D C B under the left, E F G A under the right; where the model has their ends
  const PORD=[1,0,6,2,3,4,5], PX0=[.06,.029,-.031,-.07,-.109,-.169,-.2], PZ0=[.397,.373,.36,.36,.36,.373,.397], PNAME=['pedal-d','pedal-c','pedal-b','pedal-e','pedal-f','pedal-g','pedal-a'];
  const K={id:'harp',name:'A HARP',skill:'harp',seat:{y:.46,z:-.04},lean:.06,look:.2,BOOK:[],slip:[0,N-1],cam:{p:[-1.4,1.05,.35],t:[PX,.8,.2]},
    help:'Z X C… A S D… Q W E… EACH KEY A STRING, LOW TO HIGH · 1-7 THE PEDALS D C B E F G A · ↑ ↓ A GLISSANDO · ` A SONG'};
  K.dsp=()=>IMK.harp.dsp;
  const ped=(P)=>P.st.ped||(P.st.ped=[0,0,0,0,0,0,0]);
  K.sound=(e,P)=>imAct('harp',{k:'pluck',s:e.n,f:e.f??ped(P)[letter(e.n)],v:Math.max(.1,Math.min(1,e.v)),p:.4+.06*Math.random(),b:.45+.25*e.v});
  // the recordings: a real concert harp, every few strings, each played at the nearest one's speed; a string plucked again stops its last ring
  K.samples={...__DATA__("data/harp-samples.json"),file:__FILE__("data/harp-samples.mp3")}; const HS=K.samples.s.map(r=>r[0]);
  K.sample=(e,P)=>{ const m=IMK.harp.notes[e.n]+(e.f??ped(P)[letter(e.n)]), v=Math.max(.05,Math.min(1,e.v)); let m0=HS[0]; for(const k of HS)if(Math.abs(k-m)<Math.abs(m0-m))m0=k; return [{k:m0,rate:Math.pow(2,(m-m0)/12),gain:1.15*Math.pow(v,1.2),lp:2500+12000*v,id:e.n,re:true}]; };
  K.hush=()=>{ const o=[]; for(let s=0;s<N;s++)o.push({k:'mute',s,v:.2}); return o; };

  /* ---------- the book: each piece's notes as [dt, string, pedal+1, length, hand] (centiseconds) ---------- */
  INSTR.lazyBook(K,__LAZY__("data/harp-songs.json"));
  K.compile=T=>{ const n=T.n, ev=[]; let t=0; for(let i=0;i+4<n.length;i+=5){ t+=n[i]/100; ev.push({t,n:n[i+1],f:n[i+2]-1,d:n[i+3]/100,v:.7,h:n[i+4]?'R':'L'}); }
    T.c={ev,len:ev.reduce((a,e)=>Math.max(a,e.t+e.d),0)}; };

  /* ---------- the model: Polyfork's concert pedal harp (its strings cut out, its seven pedals its own parts), the game's strings on it; the first shapes (the soundboard and its box, the neck, the column, the base and pedals) till it comes ---------- */
  const GOLD=0xc9a24c, WOOD=0x6b3f22, COLZ=FZ+FS*.39;
  K.model=()=>{ const g=new THREE.Group(), U=g.userData, first=new THREE.Group(), lean=new THREE.Group(), hp=new THREE.Group(); lean.position.z=FZ; lean.rotation.x=-TILT; hp.position.z=-FZ; lean.add(hp); g.add(lean); hp.add(first);
    const len=SB0.distanceTo(SB1), mid=SB0.clone().add(SB1).multiplyScalar(.5), ang=Math.atan2(SB1.z-SB0.z,SB1.y-SB0.y);
    const sb=box(.16,len+.06,.025,WOOD,0,0,0); sb.position.copy(mid); sb.rotation.x=ang; first.add(sb);
    const bx=new THREE.Mesh(new THREE.CylinderGeometry(.04,.13,len,10,1,false,Math.PI/2,Math.PI),mat(0x5a3218)); bx.castShadow=true; bx.position.copy(mid).add(new V3(0,-.07*Math.cos(ang),.07*Math.sin(ang)).multiplyScalar(-1)); bx.rotation.x=ang; first.add(bx);
    // the neck through the strings' tops, on to the column's head
    const pts=[]; for(let s=0;s<N;s+=3)pts.push(new V3(PX,topY(s)+.03,root(s).z)); pts.unshift(new V3(PX,topY(0)+.06,COLZ)); pts.push(new V3(PX,topY(N-1)+.02,SB1.z-.04),new V3(PX,SB1.y+.02,SB1.z-.03));
    const neck=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.02,8),mat(WOOD)); neck.castShadow=true; first.add(neck);
    first.add(cyl(.028,.034,topY(0),GOLD,12,PX,topY(0)/2,COLZ)); first.add(cyl(.05,.035,.08,GOLD,12,PX,topY(0)+.05,COLZ));   // the column and its crown
    first.add(box(.3,.1,.34,mat(WOOD),PX,.05,FZ+.12));   // the base
    U.peds=PORD.map((L,i)=>{ const p=new THREE.Group(); p.position.set(PX0[i],.035,PZ0[i]+.05); p.add(box(.016,.012,.07,GOLD,0,0,-.035)); first.add(p); return {g:p,L}; });
    // the strings: gut, the C strings red, the F strings dark blue, the lowest wound in copper
    U.str=[]; for(let s=0;s<N;s++){ const r=root(s), tY=topY(s), L=tY-r.y, l=letter(s), c=l===0?0xb3262a:l===3?0x232c6e:s<7?0xb07a4a:0xe6dcc2, th=s<7?.0024:s<20?.0017:.0012;
      const m=cyl(th,th,L,c,5,PX,r.y+L/2,r.z); m.castShadow=false; hp.add(m); U.str[s]={m,a:0}; }
    INSTR.stool(g,K.seat.y,-.04);
    // (the model's strings run along its x, the bass at +x: turned a quarter so they run away from you, their plane at PX)
    INSTR.pf(mk=>{ const m=mk('harp_pf'); if(!m)return; first.visible=false; hp.add(INSTR.fit(m,-Math.PI/2,FS,[PX,0,FZ])); const pp=m.userData.parts; U.peds.forEach((p,i)=>{ if(pp[PNAME[i]])p.pf=pp[PNAME[i]]; }); });
    return g; };

  /* ---------- the hands: each a place along the strings; its thumb takes the highest of its notes, then the index, middle and ring fingers downward; a finger comes onto its string and pulls through it into the palm ---------- */
  const window_=(P,H,t)=>{ const sc=INSTR.score(P), ev=sc.ev; if(H.sc!==sc){ H.sc=sc; H.lo=0; H.c={L:9,R:22}; } if(H.lo>ev.length)H.lo=0; while(H.lo<ev.length&&ev[H.lo].t<t-1)H.lo++;
    const out=[]; for(let i=H.lo;i<ev.length&&ev[i].t<=t+.3;i++)if(ev[i].t>=t-.25)out.push(ev[i]); return out; };
  K.hands=(P,t,H)=>{ const near=window_(P,H,t), out={}, S=H.c;
    for(const sd of ['L','R']){ const sg=sd==='L'?1:-1, mine=near.filter(e=>e.h===sd), want=mine;
      if(want.length){ const mid=(Math.min(...want.map(e=>e.n))+Math.max(...want.map(e=>e.n)))/2; S[sd]+=(mid-S[sd])*Math.min(1,(Math.abs(mid-S[sd])>3?.4:.15)*(H.dt||1)); }
      const used=new Set(); for(const e of mine.sort((a,b)=>b.n-a.n))if(e.fh==null){ let f=Math.max(0,Math.min(3,Math.round(S[sd]+1.5-e.n))); for(let d=0;d<4&&used.has(f);d++){ const a=f+d, b=f-d; f=a<=3&&!used.has(a)?a:b>=0&&!used.has(b)?b:f; } e.fh=f; used.add(f); }
      const tips=[], w=[];
      for(let f=0;f<5;f++){ if(f===4){ tips[4]=null; continue; } const ds=S[sd]+1.5-f, sr=Math.max(0,Math.min(N-1,ds)), hov=at(Math.round(sr)).add(new V3(sg*.016,f===0?.03:-.01*f,0)); let best=null, ba=-9;
        for(const e of mine)if(e.fh===f){ const a=e.t>t?-(e.t-t):1-(t-e.t); if(a>ba){ ba=a; best=e; } }
        if(best){ const p=at(best.n), on=p.clone().add(new V3(sg*.003,0,0)), thru=p.clone().add(new V3(sg*.022,.012,-.006)); let q;
          if(best.t>t){ const u=1-sm((best.t-t)/.2); q=hov.clone().lerp(on,u); } else { const u=t-best.t; q=u<.06?on.clone().lerp(thru,sm(u/.06)):thru.clone().lerp(hov,sm((u-.06)/.2)); }
          tips[f]=q; w[f]=1.3; }
        else { tips[f]=hov; w[f]=.6; } }
      // (the wrist behind the four fingertips, along the way the fingers point)
      const Fd=new V3(-sg*.75,-.5,.35), Dd=new V3(sg*.8,.5,-.2), cen=new V3(); for(let f=0;f<4;f++)cen.add(tips[f]); cen.multiplyScalar(.25);
      out[sd]={wr:cen.addScaledVector(Fd.clone().normalize(),-.13).addScaledVector(Dd.clone().normalize(),.02),Fd,Dd,pole:new V3(sg,-.6,-.5),tips,w,rest:[[.2,.3,.2,0],[.3,.4,.3,0],[.3,.4,.3,0],[.3,.4,.3,0],[1.4,1.6,1,.2]]}; }
    return out; };
  // the feet on the pedals: a foot goes to the pedal about to change and moves it; at rest they wait by their pedals
  K.feet=(P,t,H)=>{ const pl=ped(P), want=H.pw||(H.pw=pl.slice()); for(const e of window_(P,H,t))if(e.f!=null&&e.t<=t+.25&&e.t>=t-.05)want[letter(e.n)]=e.f;
    let fl=null, fr=null; for(let L=0;L<7;L++)if(want[L]!==pl[L]){ const i=PORD.indexOf(L); if(i<3)fl=i; else fr=i; }
    const ft=(i,dflt)=>i==null?dflt:new V3(PX0[i],.1,PZ0[i]-.07);
    H.pf={L:fl,R:fr}; return {L:ft(fl,new V3(PX0[1]+.04,.1,PZ0[1]-.12)),R:ft(fr,new V3(PX0[4]-.03,.1,PZ0[4]-.12))}; };
  K.after=(P,H,t)=>{ const pl=ped(P), want=H.pw; if(!want)return; for(let L=0;L<7;L++)if(want[L]!==pl[L]&&INSTR.score(P)!==P.live)pl[L]=want[L]; };
  K.sway=(P,t)=>{ const sc=INSTR.score(P), n=sc.ev.length; return n&&t-sc.ev[n-1].t<3?.018*Math.sin(t*1.1):0; };
  // each frame: a plucked string shimmers wide and settles as it rings; the pedals sit in their notches
  K.anim=(P,H,t,dt)=>{ H.dt=dt*60; const U=H.G.userData, t0=H.at??t; H.at=t; const sc=INSTR.score(P), ev=sc.ev;
    for(let i=H.lo||0;i<ev.length&&ev[i].t<=t;i++){ const e=ev[i]; if(e.t>t0&&U.str[e.n])U.str[e.n].a=Math.min(1,.5+e.v); }
    for(const S of U.str){ if(S.a<.01){ if(S.on){ S.m.scale.set(1,1,1); S.on=false; } continue; } S.a*=Math.pow(.25,dt); const k=1+S.a*2.2*(.7+.3*Math.sin(t*70)); S.m.scale.set(k,1,k); S.on=true; }
    const pl=ped(P); for(const p of U.peds){ p.g.rotation.x=.25*pl[p.L]; if(p.pf)p.pf.quaternion.copy(p.pf.userData.q0).multiply(QX.setFromAxisAngle(XA,.25*pl[p.L])); } };
  const QX=new THREE.Quaternion(), XA=new V3(1,0,0);

  /* ---------- playing it: the letter rows of the computer's keys are the strings low to high (each key one string), the number keys the pedals, the arrows a glissando ---------- */
  const ROWS=['KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash','KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon','Quote','KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft','BracketRight','Backslash'];
  const SK={}; ROWS.forEach((c,s)=>SK[c]=s);
  const ME=()=>INSTR.ME, sym=p=>p<0?'♭':p>0?'♯':'♮';
  const pluck=(s,v)=>{ const P=ME(); INSTR.note(P,{n:s,f:ped(P)[letter(s)],v,d:2,h:s<14?'L':'R'}); INSTR.tell('n',s+'.'+Math.round(v*9)); };
  const setPed=(L,p)=>{ const P=ME(); ped(P)[L]=p; INSTR.tell('p',L+'.'+(p+1)); INSTR.drawPanel(); };
  let gl=null; const gliss=up=>{ clearInterval(gl); let i=0; gl=setInterval(()=>{ if(!INSTR.on()||i>=N)return clearInterval(gl); pluck(up?i:N-1-i,.55); i++; },26); };
  K.keys=(e,dn)=>{ const c=e.code; if(SK[c]!=null){ if(dn&&!e.repeat)pluck(SK[c],e.shiftKey?.95:.65); return true; }
    if(/^Digit[1-7]$/.test(c)){ if(dn&&!e.repeat){ const L=PORD[+c.slice(5)-1], p=ped(ME())[L]; setPed(L,e.shiftKey?0:p===0?1:p===1?-1:0); } return true; }
    if(c==='ArrowUp'||c==='ArrowDown'){ if(dn&&!e.repeat)gliss(c==='ArrowUp'); return true; } return false; };
  K.click=(b,dn)=>{ if(!dn)return; if(b.dataset.n!=null)pluck(+b.dataset.n,.65); else if(b.dataset.pd!=null){ const L=+b.dataset.pd, p=ped(ME())[L]; setPed(L,p===0?1:p===1?-1:0); } else if(b.dataset.gl)gliss(b.dataset.gl==='u'); };
  K.panel=()=>`<div class="r"><span class="d">PEDALS</span>${PORD.map((L,i)=>`<button data-pd="${L}" title="key ${i+1}" id="hp${L}">${LET[L]}♮</button>${i===2?'<span class="d">|</span>':''}`).join('')}<span class="d">GLISS</span><button data-gl="u" title="↑">↑</button><button data-gl="d" title="↓">↓</button></div>
    <div class="r" style="gap:1px">${Array.from({length:N},(_,s)=>`<button data-n="${s}" style="padding:6px 0;width:calc((100% - 34px) / 34);${letter(s)===0?'color:#e05a5a':letter(s)===3?'color:#7f8ae0':''}" title="${ROWS[s].replace(/^Key/,'')}">${LET[letter(s)]}</button>`).join('')}</div>`;
  K.status=P=>'PEDALS '+PORD.map(L=>LET[L]+sym(ped(P)[L])).join(' ');
  K.draw=(PN,P)=>{ for(let L=0;L<7;L++){ const b=PN.querySelector('#hp'+L); if(b){ b.textContent=LET[L]+sym(ped(P)[L]); b.setAttribute('aria-pressed',String(ped(P)[L]!==0)); } } };
  K.hear=(P,k,v)=>{ if(k==='n'){ const [s,q]=v.split('.').map(Number); if(s>=0&&s<N)INSTR.note(P,{n:s,f:ped(P)[letter(s)],v:(q||6)/9,d:2,h:s<14?'L':'R'}); }
    else if(k==='p'){ const [L,p]=v.split('.').map(Number); if(L>=0&&L<7&&p>=0&&p<=2)ped(P)[L]=p-1; } };
  INSTR.harp={at,root,topY,N,PX};

  INSTR.kind(K); INSTR.shelf('harp',K.model,.16); }
