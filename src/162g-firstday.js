// THE FIRST DAY: a new player's setup before the world (owner, 7 Nov 2026: "lets work on the 1st time a player creates account, choosing looks, stats, starting"; his picks: a setup screen first, basics only for looks, a unique name, starter money and items): your name, your look, your stats, your permapet, then out onto the platform.
import {FIRSTDAY, FORAGE, HUD, LOOKS, PASSPORT, PETS, TEXT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {SYS} from './006-map-pre.js';
import {DESIGN} from './102b-designer.js';
import {AVATAR} from './111c-avatar.js';
{ const QS=new URLSearchParams(location.search), esc=TEXT.esc;
  // a name the server keeps for you alone (worker/door.js /name); the single-file page has no server, so any good name is yours
  const RX=/^[A-Z0-9][A-Z0-9 '-]{1,14}[A-Z0-9]$/, clean=n=>String(n||'').toUpperCase().replace(/\s+/g,' ').trim();
  FIRSTDAY.claim=async n=>{ n=clean(n); if(!RX.test(n)||/^(TENANT|ADMIN|OWNER|MODERATOR|SYSTEM|GUEST)\b/.test(n))return {ok:false,why:'bad'};
    if(!OWNED.me)return {ok:true,name:n};
    try{ const r=await fetch('/name',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify({claim:n})}), j=await r.json().catch(()=>({}));
      return j.ok?{ok:true,name:j.name}:{ok:false,why:j.taken?'taken':r.status===429?'busy':'bad'}; }catch(e){ return {ok:false,why:'offline'}; } };
  PASSPORT.claim=FIRSTDAY.claim;   // (renaming yourself on the passport goes the same way)
  if(OWNED.me&&OWNED.me.name)LOOKS.setName(OWNED.me.name);   // (the server's name is the one you go by)
  // the starter things, once (owner: "$1,000", two snacks, a fishing rod; the money is INV.START, 101-gems; the map is everyone's already: Shift+M)
  const STARTER=[['fr_apple',2],['rod',1]];
  const starter=()=>{ if(OWNED.get('starter'))return; for(const [id,n] of STARTER)FORAGE.give(id,n); OWNED.set('starter','1');
    if(HUD.set&&HUD.slots)STARTER.forEach(([id],i)=>{ if(!HUD.slots.includes(id)){ const j=HUD.slots.findIndex((s,k)=>k>=i&&!s); if(j>=0)HUD.set(j,id); } }); };   // (and on the quick bar, 1 and 2, owner 7 Nov 2026)
  const need=()=>QS.get('firstday')==='1'||(!!OWNED.me&&!OWNED.me.name&&!OWNED.get('firstday')&&!/^dev-/.test(OWNED.me.id||''));   // (the checks' made-up logins go straight in)
  FIRSTDAY.on=false; window.FIRSTDAY=FIRSTDAY;

  const css=document.createElement('style'); css.textContent=`#fday{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;gap:28px;padding:24px;box-sizing:border-box;background:#020a06;font-family:'Share Tech Mono',ui-monospace,monospace;color:#7dffa8;letter-spacing:1px}
    #fday[hidden]{display:none} #fday .stage{width:300px;height:420px;flex:none;background:radial-gradient(ellipse at 50% 85%,#0d3a1f 0,#04140b 55%,#020a06 75%);box-shadow:0 0 0 1px #2d5a40} #fday canvas{width:300px;height:420px;display:block}
    #fday .pan{width:min(460px,90vw);min-height:420px;display:flex;flex-direction:column;gap:12px} #fday h1{font-size:22px;letter-spacing:4px;margin:0;font-weight:normal;padding-bottom:8px;border-bottom:2px solid #3aa866}
    #fday .stp{color:#3aa866;font-size:13px} #fday .stp b{color:#d8ffe4;font-weight:normal} #fday label{display:block;color:#3aa866;font-size:13px;margin:6px 0 4px}
    #fday input[type=text],#fday input[type=date]{width:100%;box-sizing:border-box;font:inherit;font-size:20px;letter-spacing:2px;text-transform:uppercase;color:#d8ffe4;background:#031a0d;border:0;box-shadow:inset 0 0 0 2px #3aa866;padding:8px 10px}
    #fday button{font:inherit;font-size:14px;color:#7dffa8;background:transparent;border:0;box-shadow:inset 0 0 0 1px #2d5a40;padding:6px 10px;cursor:pointer} #fday button:hover,#fday button[aria-pressed=true]{color:#020a06;background:#7dffa8}
    #fday .row{display:flex;flex-wrap:wrap;gap:5px} #fday .sw{width:30px;height:30px;padding:0} #fday .sw i{display:block;width:22px;height:22px;margin:4px}
    #fday .why{min-height:18px;color:#ffb07d;font-size:13px} #fday .st{display:grid;grid-template-columns:1fr auto 44px auto;gap:6px;align-items:center} #fday .st small{grid-column:1/-1;color:#3aa866;margin-top:-4px}
    #fday select{font:inherit;font-size:15px;color:#d8ffe4;background:#031a0d;border:0;box-shadow:inset 0 0 0 1px #3aa866;padding:6px 8px;max-width:100%} #fday .dim{color:#3aa866;font-size:13px}
    #fday .nav{margin-top:auto;display:flex;justify-content:space-between} #fday .go{font-size:16px;padding:8px 16px;box-shadow:inset 0 0 0 2px #7dffa8}`;
  document.head.appendChild(css);
  const W=300, H=420, root=document.createElement('div'); root.id='fday'; root.hidden=true; root.innerHTML=`<div class="stage"><canvas width="${W}" height="${H}"></canvas></div><div class="pan"></div>`; document.body.appendChild(root);
  for(const ev of ['keydown','keyup'])root.addEventListener(ev,e=>e.stopPropagation());   // (typing your name never walks you)
  const pan=root.querySelector('.pan'), cv=root.querySelector('canvas'), cx=cv.getContext('2d');

  // the stage: your avatar alone, turning slowly (DESIGN.snap, as the passport's photo)
  let a0=0, raf=0;
  const paint=()=>{ if(!FIRSTDAY.on)return; raf=requestAnimationFrame(paint); try{ cx.clearRect(0,0,W,H); if(step===3&&PETS.portrait)PETS.portrait(cv,pet,a0+=.006); else DESIGN.snap(cx,W,H,{a:a0+=.006}); }catch(e){ console.warn('FIRSTDAY stage',e); cancelAnimationFrame(raf); } };

  // the steps: NAME, LOOK, STATS, PET (your permapet: any animal, free, never lost; owner, 8 Nov 2026), then out
  let pet=null, step=0, name=clean(LOOKS.L&&LOOKS.L.name||''), why='', st=FORAGE.stats.get(), dob=(PASSPORT.P&&PASSPORT.P.dob)||'';
  const STEPS=['YOU','LOOK','STATS','PET'], MAXDOB=new Date().toISOString().slice(0,10);   // (date of birth on the passport, owner 7 Nov 2026)
  const hairs=()=>{ const L=AVATAR.L(), want=['SHORT','CROPPED','SIDE PART','BUZZ','BOB','PONYTAIL','BUN','LONG','AFRO']; return want.map(l=>AVATAR.pieces.find(p=>p.slot==='hair'&&p.label===l&&p.figs.includes(L.f))).filter(Boolean); };
  const draw=()=>{ const L=AVATAR.L(), on=v=>`aria-pressed="${!!v}"`;
    let o=`<h1>YOUR FIRST DAY</h1><div class="stp">${STEPS.map((s,i)=>i===step?`<b>${i+1} ${s}</b>`:`${i+1} ${s}`).join(' &nbsp;·&nbsp; ')}</div>`;
    if(step===0)o+=`<label for="fdn">WHAT DO THEY CALL YOU?</label><input type="text" id="fdn" maxlength="24" autocomplete="off" spellcheck="false" value="${esc(name)}"><div class="stp">3 TO 16 LETTERS OR DIGITS. NO ONE ELSE WILL HAVE IT.</div><label for="fdb">DATE OF BIRTH</label><input type="date" id="fdb" min="1900-01-01" max="${MAXDOB}" value="${esc(dob)}"><div class="stp">IT GOES ON YOUR PASSPORT.</div>`;
    if(step===1){ const hs=hairs(), cur=L.w.hair&&L.w.hair[0];
      o+=`<label>FIGURE</label><div class="row"><button data-f="m" ${on(L.f==='m')}>MAN</button><button data-f="f" ${on(L.f==='f')}>WOMAN</button></div>`
        +`<label>SKIN</label><div class="row">${AVATAR.SKINS.map(c=>`<button class="sw" data-skin="${c}" ${on(L.skin===c)} aria-label="skin #${c}"><i style="background:#${c}"></i></button>`).join('')}</div>`
        +`<label>HAIR</label><div class="row"><button data-hair="" ${on(!cur)}>NONE</button>${hs.map(p=>`<button data-hair="${p.n}" ${on(cur===p.n)}>${esc(p.label)}</button>`).join('')}</div>`
        +`<label>HAIR COLOUR</label><div class="row">${AVATAR.HAIRC.map(c=>`<button class="sw" data-hc="${c}" ${on(L.hair===c)} aria-label="hair #${c}"><i style="background:#${c}"></i></button>`).join('')}</div>`
        +`<label>EYES</label><div class="row">${AVATAR.EYES.map(([c])=>`<button class="sw" data-eye="${c}" ${on((L.eye||'2a2019')===c)} aria-label="eyes #${c}"><i style="background:#${c}"></i></button>`).join('')}</div>`
        +`<div class="stp">CLOTHES COME FROM THE SHOPS. YOU CAN CHANGE ALL OF THIS LATER (YOU).</div>`; }
    if(step===2){ const left=FORAGE.stats.SUM-st.str-st.int-st.sta;
      o+=`<div class="stp">${FORAGE.stats.SUM} POINTS, EACH ${FORAGE.stats.MIN} TO ${FORAGE.stats.MAX}. <b>${left} LEFT</b></div><div class="st">`+FORAGE.stats.N.map(([k,n,w])=>`<span>${n}</span><button data-st="${k}" data-d="-5">−</button><b style="text-align:center;color:#d8ffe4;font-weight:normal">${st[k]}</b><button data-st="${k}" data-d="5">+</button><small>${w}</small>`).join('')+`</div>`; }
    if(step===3)o+=`<div class="stp">YOUR PERMAPET: ANY ANIMAL YOU LIKE, FREE. IT FOLLOWS YOU EVERYWHERE AND CAN NEVER BE LOST.</div><div id="fdpet"></div>`;
    o+=`<div class="why">${esc(why)}</div><div class="nav">${step?'<button data-nav="-1">BACK</button>':'<span></span>'}<button class="go" data-nav="1">${step<3?'NEXT':'STEP OUT ONTO THE PLATFORM'}</button></div>`;
    pan.innerHTML=o; const fp=pan.querySelector('#fdpet'); if(fp&&PETS.picker)PETS.picker(fp,pet,P=>{ pet=P; }); const n=pan.querySelector('#fdn'); if(n){ n.oninput=()=>{ name=n.value; }; n.onkeydown=e=>{ if(e.key==='Enter')next(1); }; setTimeout(()=>n.focus(),0); } const db=pan.querySelector('#fdb'); if(db)db.oninput=()=>{ dob=db.value; }; };
  let busy=false;
  const next=async d=>{ if(busy)return; why='';
    if(d<0){ step=Math.max(0,step-1); return draw(); }
    if(step===0){ if(!/^\d{4}-\d\d-\d\d$/.test(dob)||dob<'1900-01-01'||dob>MAXDOB){ why='YOUR DATE OF BIRTH, PLEASE.'; return draw(); } busy=true; const r=await FIRSTDAY.claim(name); busy=false; if(!r.ok){ why=r.why==='taken'?'THAT NAME IS TAKEN. TRY ANOTHER.':r.why==='offline'?'THE MARKET CANNOT BE REACHED. TRY AGAIN.':r.why==='busy'?'TOO MANY TRIES. WAIT A MINUTE.':'3 TO 16 LETTERS OR DIGITS, PLEASE.'; return draw(); } name=r.name; LOOKS.setName(name); PASSPORT.set({dob}); }
    if(step===2&&!FORAGE.stats.set(st)){ why='TOO MANY POINTS.'; return draw(); }
    if(step===3){ if(pet&&PETS.setPerma&&!(PETS.perma&&PETS.perma()))PETS.setPerma(pet); return done(); }
    step++; draw(); };
  pan.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; const s=b.dataset;
    if(s.nav)return next(+s.nav);
    if(s.f)AVATAR.set({f:s.f}).then(draw); else if(s.skin)AVATAR.set({skin:s.skin}).then(draw); else if(s.hc)AVATAR.set({hair:s.hc}).then(draw); else if(s.eye)AVATAR.set({eye:s.eye}).then(draw); else if(s.hair!=null)AVATAR.wear('hair',s.hair===''?null:+s.hair).then(draw);
    else if(s.st){ const v=st[s.st]+(+s.d), left=FORAGE.stats.SUM-st.str-st.int-st.sta; if(v>=FORAGE.stats.MIN&&v<=FORAGE.stats.MAX&&(+s.d<0||left>=+s.d)){ st[s.st]=v; draw(); } } });

  const done=()=>{ OWNED.set('firstday','1'); starter(); FIRSTDAY.on=false; root.hidden=true; SAY('WELCOME TO THE MARKET, '+name+'. YOUR PASSPORT OPENS THE GATE.','#7dffa8'); };
  FIRSTDAY.open=()=>{ step=0; pet=null; why=''; name=clean(LOOKS.L&&LOOKS.L.name||''); st=FORAGE.stats.get(); dob=(PASSPORT.P&&PASSPORT.P.dob)||''; FIRSTDAY.on=true; root.hidden=false; draw(); paint(); };
  SYS.onStart(()=>{ if(need())FIRSTDAY.open(); },'162g-firstday');
}
