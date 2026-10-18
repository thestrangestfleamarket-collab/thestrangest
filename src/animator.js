// ---- HIS MOVES (owner, 17 Oct 2026: "i need to be able to edit his walk and other movements in the HIS SHAPE editor"; his picks: the walk's
// dials, a keyframe editor for every move, and new moves of his own). Two more tabs in HIS SHAPE:
//   MOVES: the walk's and the run's dials (step length and time, lean, bounce, arm swing, elbow, hip sway, twist, knee lift, stance width),
//   the jump's (height, time in the air, crouch, landing, gravity), the strikes' (speed, how soon a combo follows); he does it on the spot.
//   ANIMATE: any move (standing, the walk, the run, every move he has, and his own): a timeline; at any moment a part of him clicked and
//   dragged (or its sliders) turns it, and that's a key; his keys are added onto the move wherever he does it, blended smoothly between.
//   NEW MOVE: a name, a length, a key to do it with; it starts from standing and is his to pose.
// Kept in this browser; LOAD MOVES from a file (DOWNLOAD taken out, owner 18 Oct 2026) ----
{ const R=RIG, D=Math.PI/180, ARM=R.ARMMOVES;
  // ---- the dials: each the walk's or the run's own (1 as made; the step's length and time and the lean as numbers)
  const DIALS=[['stride','STEP LENGTH',5,32,.1],['cycle','STEP TIME',.3,1.8,.01],['lean','LEAN',-15,35,.5],['bounce','BOUNCE',0,3,.05],['arm','ARM SWING',0,3,.05],['elbow','ELBOW BEND',0,2.5,.05],
    ['sway','HIP SWAY',0,3,.05],['twist','TWIST',0,3,.05],['knee','KNEE LIFT',.3,2.5,.05],['width','STANCE WIDTH',.3,2.5,.05]];
  const W0={...R.WALK}, R0={...R.RUN}, J0={g:289,jh:87*87/(2*289),jT:2*87/289,crouch:.16,rec:.34}, T0={...R.RIGT}; let JT={...J0};
  const JDIALS=[['jh','HEIGHT',3,60,.5],['jT','TIME IN THE AIR',.2,1.6,.01],['crouch','CROUCH',.04,.6,.01],['rec','LANDING',.08,1,.01],['g','GRAVITY',80,700,1]];
  const SDIALS=[['moves','STRIKE SPEED',.3,3,.05],['combo','COMBO SOONER',.3,1.5,.05],['start','START WALKING',.5,12,.1]];
  // ---- his keys: for each move, keys in its time (the walk's and the run's in their step, 0 to 1, round and round; standing's one pose):
  // each key a set of changes ('root.y', 'bend', 'L.ua0' ...: degrees, his units for where he is, 0 to 1 for a fist)
  let OV={}, CUSTOM=[];
  const kind=c=>c==='stand'?'still':c==='walk'||c==='run'?'loop':'move', lenOf=c=>kind(c)==='move'?(R.MOVES[c]?R.MOVES[c].dur:1):1;
  const sm=x=>x*x*(3-2*x);
  function deltaAt(c,t){ const ks=OV[c]; if(!ks||!ks.length)return null; const K=kind(c); if(K==='still'||ks.length===1&&K!=='move')return ks[0].d;
    const L=lenOf(c), all=K==='move'?[...(ks[0].t>1e-3?[{t:0,d:{}}]:[]),...ks,...(ks[ks.length-1].t<L-1e-3?[{t:L,d:{}}]:[])]:ks;
    let a,b,u; if(K==='loop'){ const tt=((t%1)+1)%1; let i=all.findIndex(k=>k.t>tt); if(i<0)i=0; b=all[i]; a=all[(i-1+all.length)%all.length]; const span=((b.t-a.t)+1)%1||1; u=(((tt-a.t)+1)%1)/span; }
    else { const tt=Math.max(0,Math.min(L,t)); let i=all.findIndex(k=>k.t>=tt); if(i<=0){ a=b=all[Math.max(0,i)]; u=0; } else { a=all[i-1]; b=all[i]; u=b.t>a.t?(tt-a.t)/(b.t-a.t):1; } }
    u=sm(Math.max(0,Math.min(1,u))); const out={}; for(const p of new Set([...Object.keys(a.d),...Object.keys(b.d)]))out[p]=(a.d[p]||0)*(1-u)+(b.d[p]||0)*u; return out; }
  // the changes onto a pose (an upper arm turned takes the forearm with it, a thigh the shin: the rig aims each on its own)
  function addOn(P,d,w){ if(!d||w<=0)return; for(const p in d){ const v=d[p]*w; if(!v)continue;
      if(p.startsWith('root.')){ const a=p[5]; P.root={x:P.root.x+(a==='x'?v:0),y:P.root.y+(a==='y'?v:0),z:P.root.z+(a==='z'?v:0)}; continue; }
      const m=/^([LR])\.(\w+?)([01])?$/.exec(p); if(!m){ P[p]=(P[p]||0)+v*D; continue; }
      const g=P[m[1]], f=m[2], i=+(m[3]||0); if(!g)continue;
      if(f==='fist')g.fist=Math.max(0,Math.min(1,(g.fist||0)+v)); else if(f==='foot')g.foot+=v*D;
      else if(f==='ua'){ g.ua[i]+=v*D; g.fa[i]+=v*D; } else if(f==='fa')g.fa[i]+=v*D; else if(f==='th'){ g.th[i]+=v*D; g.sh[i]+=v*D; } else if(f==='sh')g.sh[i]+=v*D; } }
  R.OVL.fn=(st,P)=>{ if(st.move)addOn(P,deltaAt(st.move.name,st.move.t),1);
    else if(!(st.water&&st.water.in)&&!st.climb&&!st.hang&&!st.ride&&!st.sit){ const w=st.w||0, r=st.run||0; addOn(P,deltaAt('stand',0),1-w); addOn(P,deltaAt('walk',st.ph),w*(1-r)); addOn(P,deltaAt('run',st.ph),w*r); }
    if(st.up)addOn(P,deltaAt(st.up.name,st.up.t),1); };
  // ---- KEPT (in this browser)
  const save=()=>{ try{ SAVE.set('moves',JSON.stringify({gait:R.GAITV,walk:pick(R.WALK),run:pick(R.RUN),jump:JT,rigt:{moves:R.RIGT.moves,combo:R.RIGT.combo,start:R.RIGT.start},ov:OV,custom:CUSTOM})); }catch(e){} };
  const pick=o=>{ const q={}; for(const [k] of DIALS)q[k]=o[k]; return q; };
  function makeCustom(c){ R.MOVES[c.name]=R.mkMove({keys:[[0,{}],[c.dur,{}]]}); if(c.key){ MOVEK[c.key]=c.key.toUpperCase(); R.KEYMOVE[c.key.toUpperCase()]=c.name; } }
  function load(o){ if(!o)return; if(o.gait!==R.GAITV)for(const g of [o.walk,o.run])if(g){ delete g.stride; delete g.cycle; }   /* (saved before the planted walk, 18 Oct 2026: its step length and time made him skate again) */ Object.assign(R.WALK,o.walk||{}); Object.assign(R.RUN,o.run||{}); if(o.jump){ JT={...J0,...o.jump}; R.tune(JT); } if(o.rigt)Object.assign(R.RIGT,o.rigt);
    for(const c of o.custom||[])if(!R.MOVES[c.name]){ makeCustom(c); } CUSTOM=o.custom||[]; OV=o.ov||{}; }
  try{ load(JSON.parse(SAVE.get('moves')||'null')); }catch(e){}
  // ---- THE PREVIEW: in these two tabs he does the move on his own, in place (or stands frozen at the moment chosen)
  let clip='walk', t=0, play=true, last=performance.now();
  Object.defineProperty(ED,'anim',{get:()=>ED.on&&(ED.mode()==='moves'||ED.mode()==='animate')});
  ED.animPose=()=>{ const now=performance.now(), dt=Math.min(.05,(now-last)/1000); last=now; const K=kind(clip), L=lenOf(clip);
    if(play){ if(K==='loop')t=(t+dt/R.gaitOf(clip==='run'?1:0).cycle)%1; else if(K==='move'){ t+=dt*(R.MOVES[clip]&&R.MOVES[clip].air?1:R.RIGT.moves); if(t>L+.5)t=0; } drawTime(); }
    const s=R.create(); s.snap=true;
    if(K==='loop'){ s.w=1; s.target=1; s.run=s.runTarget=clip==='run'?1:0; s.ph=t; }
    else if(K==='move'&&R.MOVES[clip]){ if(ARM.has(clip)){ R.beginUp(s,clip); s.up.t=Math.min(t,L); } else { R.begin(s,clip); s.move.t=Math.min(t,L); } }
    return R.pose(s,true); };
  // ---- THE PANES
  const css=document.createElement('style'); css.textContent=`
  #ed select,#ed input[type=text]{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:4px 6px}
  #ed .tl{position:relative;height:26px;background:#0e1016;border:2px solid #3a3f4e;margin:8px 0;cursor:pointer}
  #ed .tl .k{position:absolute;top:7px;width:8px;height:8px;margin-left:-4px;background:#f2c14e} #ed .tl .now{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:#fff}
  #ed .sl{display:flex;align-items:center;gap:6px;margin:4px 0} #ed .sl span:first-child{width:108px} #ed .sl input{width:120px} #ed .sl .v{width:44px;text-align:right;color:var(--dim)}`;
  document.head.appendChild(css);
  // MOVES
  const PM=document.createElement('div'); PM.innerHTML=`<div class="row"><button class="btn" data-s="walk">WALK</button><button class="btn" data-s="run">RUN</button><button class="btn" data-s="jump">JUMP</button><button class="btn" data-s="strikes">STRIKES</button></div>
    <div id="mdials"></div><div class="row"><button class="btn" id="mreset">THESE BACK AS THEY WERE</button></div><div class="dim">he does it on the spot as you turn the dials</div>`;
  let sub='walk'; const $m=s=>PM.querySelector(s);
  const slider=(host,label,min,max,step,get,set,fmt)=>{ const r=document.createElement('div'); r.className='sl'; r.innerHTML=`<span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}"><span class="v"></span>`;
    const i=r.querySelector('input'), v=r.querySelector('.v'), show=()=>{ i.value=get(); v.textContent=(fmt||(x=>(+x).toFixed(2)))(get()); }; i.oninput=()=>{ set(+i.value); show(); }; i.onchange=save; show(); host.appendChild(r); return show; };
  function drawMoves(){ PM.querySelectorAll('[data-s]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.s===sub))); const h=$m('#mdials'); h.innerHTML='';
    if(sub==='walk'||sub==='run'){ const G=sub==='walk'?R.WALK:R.RUN; for(const [k,l,a,b,s] of DIALS)slider(h,l,a,b,s,()=>G[k],v=>{ G[k]=v; }); clip=sub; }
    else if(sub==='jump'){ for(const [k,l,a,b,s] of JDIALS)slider(h,l,a,b,s,()=>JT[k],v=>{ JT[k]=v; R.tune(JT); }); clip='jump'; }
    else { for(const [k,l,a,b,s] of SDIALS)slider(h,l,a,b,s,()=>R.RIGT[k],v=>{ R.RIGT[k]=v; }); clip='jab'; }
    play=true; t=0; }
  PM.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{ sub=b.dataset.s; drawMoves(); });
  $m('#mreset').onclick=()=>{ if(sub==='walk')Object.assign(R.WALK,W0); else if(sub==='run')Object.assign(R.RUN,R0); else if(sub==='jump'){ JT={...J0}; R.tune(JT); } else for(const [k] of SDIALS)R.RIGT[k]=T0[k]; save(); drawMoves(); };
  ED.addTab('moves','MOVES',PM,{show:()=>drawMoves()});
  // ANIMATE
  const GROUPS={hips:[['root.y','UP / DOWN',-25,25,.1],['root.x','SIDEWAYS',-20,20,.1],['root.z','FORWARD',-20,20,.1],['pitch','TIP FORWARD',-180,180,1],['roll','TIP SIDEWAYS',-180,180,1],['yaw','TURN',-180,180,1],['pyaw','HIP TWIST',-90,90,1]],
    torso:[['bend','BEND',-90,90,1],['side','SIDE BEND',-60,60,1],['cyaw','SHOULDER TWIST',-90,90,1]], head:[['nod','NOD',-70,70,1],['look','LOOK',-90,90,1]]};
  for(const n of 'LR'){ GROUPS['ua'+n]=[[n+'.ua0','SWING',-180,180,1],[n+'.ua1','OUT',-90,180,1]]; GROUPS['fa'+n]=[[n+'.fa0','BEND',-180,180,1],[n+'.fa1','OUT',-90,180,1],[n+'.fist','FIST',-1,1,.05]];
    GROUPS['th'+n]=[[n+'.th0','SWING',-120,120,1],[n+'.th1','OUT',-60,90,1]]; GROUPS['sh'+n]=[[n+'.sh0','KNEE',-150,40,1],[n+'.sh1','OUT',-60,60,1]]; GROUPS['foot'+n]=[[n+'.foot','TOE UP',-70,70,1]]; }
  const GNAME={hips:'HIPS',torso:'BODY',head:'HEAD',uaL:'UPPER ARM L',faL:'FOREARM L',thL:'THIGH L',shL:'SHIN L',footL:'FOOT L',uaR:'UPPER ARM R',faR:'FOREARM R',thR:'THIGH R',shR:'SHIN R',footR:'FOOT R'};
  const groupOf=n=>{ const s=n.slice(-1), sd=s==='L'||s==='R'?s:''; if(/^(head|hair|beard|brow|eye|nose|ear|mouth|neck)/.test(n))return 'head'; if(n==='torso')return 'torso'; if(n==='hips')return 'hips';
    if(/^(sleeve|upperArm)/.test(n))return 'ua'+sd; if(/^(forearm|hand|fing)/.test(n))return 'fa'+sd; if(/^thigh/.test(n))return 'th'+sd; if(/^shin/.test(n))return 'sh'+sd; if(/^shoe/.test(n))return 'foot'+sd; return 'torso'; };
  let grp='hips', clip0='walk'; const UNDO=[];
  const PA=document.createElement('div'); PA.innerHTML=`<div class="row"><select id="aclip"></select><button class="btn" id="aplay">PAUSE</button></div>
    <div class="tl" id="atl"><div class="now"></div></div><div class="row"><span class="dim" id="atime"></span></div>
    <div class="row"><button class="btn" id="akey">ADD KEY</button><button class="btn" id="adel">DELETE KEY</button><button class="btn" id="aprev">◀ KEY</button><button class="btn" id="anext">KEY ▶</button></div>
    <div class="row"><button class="btn" id="amlr">MIRROR L→R</button><button class="btn" id="amrl">MIRROR R→L</button><button class="btn" id="acopy">COPY</button><button class="btn" id="apaste">PASTE</button></div>
    <div class="dim" id="agrp" style="margin-top:8px"></div><div id="asl"></div>
    <div class="dim">click a part of him, drag it to turn it (up / down, side to side); a change makes a key at this moment</div>
    <div class="row"><button class="btn" id="aundo">UNDO</button><button class="btn" id="aclear">CLEAR THIS MOVE'S KEYS</button></div>
    <h3 style="font:12px var(--pixel);color:var(--key);margin:12px 0 6px">NEW MOVE</h3>
    <div class="row"><input type="text" id="aname" placeholder="name" size="10"><input type="text" id="alen" value="1.2" size="3"><span class="dim">s</span><input type="text" id="akeych" placeholder="key" size="2" maxlength="1"></div>
    <div class="row"><button class="btn" id="anew">MAKE IT</button><span class="dim">key: B I L M O P T U Y or 1-9</span></div><div class="list" id="acustom"></div>
    <div class="row"><button class="btn" id="aload">LOAD MOVES</button></div>`;
  const $a=s=>PA.querySelector(s);
  function fillClips(){ const sel=$a('#aclip'), names=['stand','walk','run',...Object.keys(R.MOVES).filter(k=>R.MOVES[k]&&R.MOVES[k].k).sort()]; sel.innerHTML='';
    for(const n of names){ const o=document.createElement('option'); o.value=n; o.textContent=(CUSTOM.some(c=>c.name===n)?'★ ':'')+n.toUpperCase()+(OV[n]&&OV[n].length?' ('+OV[n].length+')':''); sel.appendChild(o); } sel.value=clip0; }
  $a('#aclip').onchange=e=>{ clip0=clip=e.target.value; t=0; play=kind(clip)!=='still'; drawAnim(); };
  const tl=$a('#atl');
  function drawTime(){ if(ED.mode()!=='animate')return; const L=lenOf(clip); tl.querySelector('.now').style.left=(Math.min(1,t/L)*100)+'%'; $a('#atime').textContent=kind(clip)==='loop'?'STEP '+(t*100|0)+'%':kind(clip)==='still'?'STANDING (one pose)':t.toFixed(2)+' s of '+L.toFixed(2)+' s'; }
  function drawKeys(){ tl.querySelectorAll('.k').forEach(k=>k.remove()); const L=lenOf(clip); for(const k of OV[clip]||[]){ const d=document.createElement('div'); d.className='k'; d.style.left=(k.t/L*100)+'%'; tl.appendChild(d); } }
  let showSl=[];
  function drawSliders(){ const h=$a('#asl'); h.innerHTML=''; $a('#agrp').textContent='PART: '+GNAME[grp]; const cur=()=>deltaAt(clip,t)||{};
    showSl=GROUPS[grp].map(([p,l,a,b,s])=>slider(h,l,a,b,s,()=>cur()[p]||0,v=>{ setParam(p,v); },x=>(+x).toFixed(p.endsWith('fist')||p.startsWith('root')?2:0))); }
  function drawAnim(){ fillClips(); $a('#aplay').textContent=play?'PAUSE':'PLAY'; drawKeys(); drawTime(); drawSliders(); drawCustom(); }
  const snap=()=>{ UNDO.push(JSON.stringify(OV)); if(UNDO.length>40)UNDO.shift(); };
  // a change at this moment: the key here (made from what he's doing here, if there wasn't one), that part's change in it
  function keyHere(){ const L=lenOf(clip), ks=OV[clip]||(OV[clip]=[]), eps=kind(clip)==='still'?9:L*.02; let k=ks.find(k=>Math.abs(k.t-t)<eps);
    if(!k){ k={t:kind(clip)==='still'?0:t,d:{...(deltaAt(clip,t)||{})}}; ks.push(k); ks.sort((a,b)=>a.t-b.t); } play=false; $a('#aplay').textContent='PLAY'; return k; }
  function setParam(p,v){ keyHere().d[p]=v; drawKeys(); save(); }
  tl.addEventListener('pointerdown',e=>{ const r=tl.getBoundingClientRect(), go=x=>{ t=Math.max(0,Math.min(1,(x-r.left)/r.width))*lenOf(clip); if(kind(clip)==='loop')t=Math.min(t,.999); play=false; $a('#aplay').textContent='PLAY'; drawTime(); showSl.forEach(f=>f()); };
    go(e.clientX); const mv=ev=>go(ev.clientX), up=()=>{ removeEventListener('pointermove',mv); removeEventListener('pointerup',up); }; addEventListener('pointermove',mv); addEventListener('pointerup',up); });
  $a('#aplay').onclick=()=>{ play=!play; drawAnim(); };
  $a('#akey').onclick=()=>{ snap(); keyHere(); save(); drawAnim(); };
  $a('#adel').onclick=()=>{ const ks=OV[clip]; if(!ks||!ks.length)return; snap(); let j=0; ks.forEach((k,i)=>{ if(Math.abs(k.t-t)<Math.abs(ks[j].t-t))j=i; }); ks.splice(j,1); save(); drawAnim(); };
  const jump=dir=>{ const ks=OV[clip]; if(!ks||!ks.length)return; const L=lenOf(clip); let k=dir>0?ks.find(k=>k.t>t+1e-3):[...ks].reverse().find(k=>k.t<t-1e-3); if(!k)k=dir>0?ks[0]:ks[ks.length-1]; t=Math.min(k.t,L); play=false; drawAnim(); };
  $a('#aprev').onclick=()=>jump(-1); $a('#anext').onclick=()=>jump(1);
  const mirror=(a,b)=>{ snap(); const k=keyHere(); for(const p in k.d)if(p.startsWith(b+'.'))delete k.d[p]; for(const p in k.d)if(p.startsWith(a+'.'))k.d[b+p.slice(1)]=k.d[p]; save(); drawAnim(); };
  $a('#amlr').onclick=()=>mirror('L','R'); $a('#amrl').onclick=()=>mirror('R','L');
  let clipboard=null; $a('#acopy').onclick=()=>{ clipboard={...(deltaAt(clip,t)||{})}; }; $a('#apaste').onclick=()=>{ if(!clipboard)return; snap(); const k=keyHere(); k.d={...clipboard}; save(); drawAnim(); };
  $a('#aundo').onclick=()=>{ const u=UNDO.pop(); if(u){ OV=JSON.parse(u); save(); drawAnim(); } };
  $a('#aclear').onclick=()=>{ snap(); delete OV[clip]; save(); drawAnim(); };
  // NEW MOVES
  const FREE='ilmoptuy123456789';   // (B is the wave's now: V changes the view)
  function drawCustom(){ const h=$a('#acustom'); h.innerHTML=''; for(const c of CUSTOM){ const b=document.createElement('button'); b.className='btn'; b.textContent=c.name.toUpperCase()+(c.key?' ['+c.key.toUpperCase()+']':'')+' ✕';
      b.title='delete this move'; b.onclick=()=>{ if(!confirm('Delete the move '+c.name+'?'))return; CUSTOM=CUSTOM.filter(x=>x!==c); delete R.MOVES[c.name]; delete OV[c.name]; if(c.key){ delete R.KEYMOVE[c.key.toUpperCase()]; delete MOVEK[c.key]; } if(clip===c.name){ clip=clip0='stand'; } save(); drawAnim(); }; h.appendChild(b); } }
  $a('#anew').onclick=()=>{ const name=$a('#aname').value.trim().toLowerCase().replace(/[^a-z0-9]+/g,''), dur=Math.max(.2,Math.min(20,+$a('#alen').value||1.2)), key=($a('#akeych').value||'').toLowerCase();
    if(!name||R.MOVES[name]||['stand','walk','run'].includes(name)){ $a('#aname').value=''; $a('#aname').placeholder=name?'taken':'name'; return; }
    if(key&&(!FREE.includes(key)||CUSTOM.some(c=>c.key===key))){ $a('#akeych').value=''; return; }
    const c={name,dur,key:key||''}; makeCustom(c); CUSTOM.push(c); OV[name]=[]; clip=clip0=name; t=0; play=false; save(); drawAnim(); };
  $a('#aload').onclick=()=>{ const f=document.createElement('input'); f.type='file'; f.accept='.json,application/json'; f.onchange=async()=>{ try{ load(JSON.parse(await f.files[0].text())); save(); drawAnim(); }catch(e){} }; f.click(); };
  ED.addTab('animate','ANIMATE',PA,{show:()=>{ clip=clip0; play=kind(clip)!=='still'; drawAnim(); },
    // a press on him: that part picked; a drag turns it (up and down its first turn, side to side its second)
    down:h=>{ if(!h)return false; grp=groupOf(ED.names[h.piece]); snap(); keyHere(); drawSliders(); return true; },
    move:(dx,dy)=>{ const G=GROUPS[grp], cur=deltaAt(clip,t)||{}, sc=p=>p.startsWith('root')?.12:p.endsWith('fist')?.01:.6;
      const [p0]=G[0], p1=G[1]&&G[1][0]; const k=keyHere(); k.d[p0]=(cur[p0]||0)-dy*sc(p0); if(p1)k.d[p1]=(cur[p1]||0)+dx*sc(p1); showSl.forEach(f=>f()); },
    up:()=>{ save(); drawKeys(); }});
  ED.onExit=()=>{ save(); };
  // ---- HIS STANDING POSE, for the avatar editor's POSE tab (owner, 18 Oct 2026: "the avatar editor needs to have a section where i can pose the
  // avatar and pull his limbs all around. i want to be able to pick his standing pose"): standing's one key is his pose wherever he stands still
  R.ANIMX={ stand:()=>OV.stand&&OV.stand[0]?{...OV.stand[0].d}:{},
    setStand:d=>{ snap(); if(d&&Object.keys(d).length)OV.stand=[{t:0,d:JSON.parse(JSON.stringify(d))}]; else delete OV.stand; save(); },
    edit:()=>{ clip=clip0='stand'; t=0; play=false; },
    undo:()=>{ const u=UNDO.pop(); if(u){ OV=JSON.parse(u); save(); } },
    mirror:(a,b)=>{ clip='stand'; t=0; mirror(a,b); },
    part:()=>GNAME[grp] };
}
