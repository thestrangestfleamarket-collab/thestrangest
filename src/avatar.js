// ---- THE AVATAR EDITOR (owner, 17 Oct 2026: "i want to be able to edit my characters avatar by adding outlines, shadows, textures, reshape his
// body, feet, etc. create an avatar editor that has all that easy to use shift k"): Shift+K (or the menu's DISPLAY, or a double click on yourself,
// or YOUR LOOKS / EDIT HIS SHAPE) opens one panel over the game, the view brought close round him and turned by any drag (his old view back on
// DONE). Six tabs: BODY (MALE / FEMALE, his height, a slider a region, the two sides together or apart, his feet and toes, the sculpting brush;
// HIS SHAPE's pieces, moves and animation a button away), LOOK (name, hair, eyes, every colour: five swatches and a picker each), TEXTURES (a
// pattern made in his shader on the shirt, the trousers and the shoes: its kind, its scale, two colours), OUTLINE (on, its colour, its
// thickness), SHADING (smooth or stepped, steps, depth, his own shadow, a rim of light, lamps or flat), PRESETS (named looks kept in the browser,
// RESET, DOWNLOAD / LOAD a file). It rides HIS SHAPE's own mode (ED.on: the keys, the walk, his full light, the view on him; src/editor.js).
// Nothing runs while it's closed; the patterns and the rim are a few sums a pixel in his toon program (walker3d.js), the outline its own pass ----
const AV={on:false};
{ const T=TILE, PCS=W3.pcs, NAMES=PCS.map(P=>P.n), idx=n=>NAMES.indexOf(n), MATS=RIG.MATS;
  // ---- KEPT: the patterns, the outline's look, the rim (the shape, looks and shading keep their own: market-walker, market-looks, market-shade)
  const GAR=[['shirt','SHIRT'],['pants','TROUSERS'],['shoes','SHOES']], PATN=['PLAIN','STRIPES','PLAID','DENIM','KNIT','CAMO','DOTS'];
  const S0=()=>({pat:GAR.map(([g])=>({t:0,s:1,c2:g==='pants'?'#1e2a44':g==='shoes'?'#e8e2d6':'#3a2a2a'})),rim:0,ow:1,oc:'',});
  let S=S0(); try{ Object.assign(S,JSON.parse(localStorage.getItem('market-avatar')||'{}')); }catch(e){}
  const save=()=>{ try{ localStorage.setItem('market-avatar',JSON.stringify(S)); }catch(e){} };
  const lin=h=>new THREE.Color(h);
  // the state onto him: each garment's pattern (its stuff's index, its kind, scale), the second colour as his ramp's second tone; the rim; the outline
  const applyS=()=>{ GAR.forEach(([g],i)=>{ const p=S.pat[i]; W3.PAT.value[i].set(p.t,.28*p.s,MATS.indexOf(g),0); const c=lin(p.c2).multiplyScalar(.9); W3.PB.value[i].set(c.r,c.g,c.b); });
    W3.uRim.value=S.rim; const U=OUTL.pass.uniforms; U.wid.value=S.ow; U.ocK.value=S.oc?1:0; if(S.oc){ const c=lin(S.oc); U.oc.value.set(c.r,c.g,c.b); } };
  applyS();
  // ---- THE REGIONS: each a set of his pieces and which of their sizes (0 across, 1 along, 2 deep); a side's pieces end L or R
  const HEADG=NAMES.filter((n,i)=>/^(head|hair|beard|ear|nose)/.test(PCS[i].on||n)), SIDE=(b,s)=>s?[b+s]:[b+'L',b+'R'];
  const FING=s=>NAMES.filter(n=>/^fing/.test(n)&&(!s||n.endsWith(s)));
  const REG=[['HEAD',[['SIZE',()=>HEADG,[0,1,2]]]],['NECK',[['LENGTH',()=>['neck'],[1]],['THICKNESS',()=>['neck'],[0,2]]]],
    ['BODY',[['SHOULDERS',()=>['torso'],[0]],['CHEST',()=>['torso'],[2]],['BELLY',()=>['hips'],[2]],['HIPS',()=>['hips'],[0]]]],
    ['ARMS',[['UPPER LENGTH',s=>[...SIDE('upperArm',s),...SIDE('sleeve',s)],[1]],['UPPER THICKNESS',s=>[...SIDE('upperArm',s),...SIDE('sleeve',s)],[0,2]],['LOWER LENGTH',s=>SIDE('forearm',s),[1]],['LOWER THICKNESS',s=>SIDE('forearm',s),[0,2]],['HANDS',s=>[...SIDE('hand',s),...FING(s)],[0,1,2]]],1],
    ['LEGS',[['THIGH LENGTH',s=>SIDE('thigh',s),[1]],['THIGH THICKNESS',s=>SIDE('thigh',s),[0,2]],['SHIN LENGTH',s=>SIDE('shin',s),[1]],['SHIN THICKNESS',s=>SIDE('shin',s),[0,2]]],1],
    ['FEET',[['LENGTH',s=>SIDE('shoe',s),[2]],['WIDTH',s=>SIDE('shoe',s),[0]],['HEIGHT',s=>SIDE('shoe',s),[1]]],1]];
  let side='';   // ('' both sides together; 'L' or 'R' one alone)
  // WHO (owner, 18 Oct 2026: "allow to edit all the face and body properties in editor", his pick: both, with a switch): YOU, or THE BEARDED
  // WALKER (src/npc-walker2.js: his pieces' sizes BWK.EB, his face BWK.F; held before you while he's being edited)
  let who='you'; const BW=()=>who==='bwk'&&window.BWK&&BWK.F;
  const getR=(f,c)=>{ if(BW()){ const ns=f(side); if(ns.includes('head'))return BWK.F.head; const E=BWK.E(ns[0]); return E?E.s[c[0]]:1; } const i=idx(f(side)[0]), E=i>=0&&W3.E[i]; return E?E.s[c[0]]:1; };
  const setR=(f,c,v)=>{ if(BW()){ const ns=f(side); if(ns.includes('head')){ BWK.F.head=v; BWK.save(); return; } for(const n of ns){ const E=BWK.E(n); if(E)for(const k of c)E.s[k]=v; } BWK.save(); return; } for(const n of f(side)){ const i=idx(n); if(i<0)continue; const E=W3.E[i]||(W3.E[i]={s:[1,1,1],o:[0,0,0],q:[0,0,0,1]}); for(const k of c)E.s[k]=v; } };
  // HIS FACE's sliders (the same for you and for him: ED.face for you, src/editor.js; BWK.F for him, his head made again on letting go)
  const FACE=[['nose','NOSE SIZE',.3,1.6,.01],['noseL','NOSE LENGTH',-1,1.5,.01],['jaw','JAW WIDTH',4.4,6.8,.01],['square','JAW SQUARE',0,1,.01],['chin','CHIN',-1,1,.01],['ears','EARS',.4,1.8,.01],['eyes','EYES',.5,1.8,.01]];
  const faceOf=()=>BW()?BWK.F:ED.FACE;
  // ---- THE PANEL
  const css=document.createElement('style'); css.textContent=`
  #av{position:fixed;right:12px;top:12px;bottom:12px;width:340px;overflow:auto;background:var(--bg,#0b0d13);border:2px solid var(--line,#2a3040);font:12px var(--pixel,monospace);color:var(--fg,#d8dbe4);z-index:21}
  #av[hidden]{display:none} #av h2{font:13px var(--pixel,monospace);color:var(--key,#f2c14e);margin:0;padding:10px 14px;border-bottom:2px solid var(--line,#2a3040)}
  #av .tabs{display:flex;border-bottom:2px solid var(--line,#2a3040)} #av .tabs button{flex:1 1 0;font:inherit;color:var(--dim,#8a8f9c);background:transparent;border:0;border-right:2px solid var(--line,#2a3040);border-bottom:2px solid var(--line,#2a3040);padding:10px 2px;cursor:pointer;border-bottom:0} #av .tabs button:last-child{border-right:0}
  #av .tabs button[aria-selected="true"]{color:var(--key,#f2c14e);background:var(--panel,#151924)} #av .pane{padding:8px 14px} #av .pane[hidden]{display:none}
  #av h3{font:11px var(--pixel,monospace);color:var(--dim,#8a8f9c);margin:12px 0 4px;letter-spacing:1px}
  #av .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:5px 0} #av .btn{font:inherit;color:var(--fg,#d8dbe4);background:#0e1016;border:2px solid #3a3f4e;padding:7px 10px;cursor:pointer}
  #av .btn[aria-pressed="true"]{color:var(--key,#f2c14e);border-color:var(--key,#f2c14e)} #av .lab{width:96px} #av input[type=range]{flex:1;min-width:120px;height:22px} #av .val{width:38px;text-align:right;color:var(--dim,#8a8f9c)}
  #av .sw{width:30px;height:26px;padding:0;border:2px solid #3a3f4e;cursor:pointer} #av .sw[aria-pressed="true"]{border-color:#fff} #av input[type=color]{width:40px;height:28px;padding:0;border:2px solid #3a3f4e;background:#0e1016;cursor:pointer}
  #av input[type=text]{font:inherit;background:#0e1016;color:inherit;border:2px solid #3a3f4e;padding:6px;flex:1} #av .dim{color:var(--dim,#8a8f9c)} #av .grid{display:grid;grid-template-columns:110px 1fr auto;gap:6px 8px;align-items:center}
  #av .bar{height:10px;background:#0e1016;border:1px solid #3a3f4e;flex:1} #av .bar i{display:block;height:100%}
  #av .foot{padding:10px 14px;border-top:2px solid var(--line,#2a3040);position:sticky;bottom:0;background:var(--bg,#0b0d13)} #av .pl{display:flex;gap:6px;align-items:center;margin:4px 0} #av .pl span{flex:1}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='av'; P.hidden=true; P.setAttribute('role','dialog'); P.setAttribute('aria-label','Avatar editor');
  const TABS=[['body','BODY'],['pose','POSE'],['look','LOOK'],['style','STYLE'],['pre','SAVE']];   // (a few plain tabs, owner 18 Oct 2026: "very minimal and inituive GUI": LOOK takes the patterns, STYLE the outline and the shading)
  const TABG={look:['look','tex'],style:['outl','shade']};
  const sl=(id,lab,min,max,step)=>`<div class="row"><span class="lab">${lab}</span><input type="range" id="${id}" min="${min}" max="${max}" step="${step}"><span class="val" id="${id}v"></span></div>`;
  P.innerHTML=`<h2>AVATAR</h2>
    <div class="tabs">${TABS.map(([k,l])=>`<button data-t="${k}">${l}</button>`).join('')}</div>
    <div class="pane" data-p="body"><h3>WHO</h3><div class="row" id="avwho"><button class="btn" data-who="you">YOU</button><button class="btn" data-who="bwk">THE BEARDED WALKER</button></div>
      <div id="avlooks6" hidden><h3>HIS LOOKS (THE SIX MOCKUPS)</h3><div class="row">${[1,2,3,4,5,6].map(i=>`<button class="btn" data-l6="${i}">${i}</button>`).join('')}</div></div>
      <div id="avyou"><h3>BUILD</h3></div><div class="row" id="avbuild"><button class="btn" data-b="0">MALE</button><button class="btn" data-b="1">FEMALE</button></div>
      ${sl('avh','HEIGHT',0.8,1.2,0.01)}
      <h3>HEAD SHAPE</h3><div class="row" id="avshape">${Object.keys(ED.HEADS).map(k=>`<button class="btn" data-hs="${k}">${k.toUpperCase()}</button>`).join('')}</div>
      <h3>FACE</h3>${FACE.map(([k,l,a,b,st])=>sl('avf_'+k,l,a,b,st)).join('')}
      <div id="avbeard" hidden><h3>BEARD</h3><div class="row">${['full','boxed','trim','stubble','none'].map(b=>`<button class="btn" data-bd="${b}">${b.toUpperCase()}</button>`).join('')}</div></div>
      <h3>SIDES</h3><div class="row" id="avside"><button class="btn" data-s="">BOTH (MIRRORED)</button><button class="btn" data-s="L">LEFT ONLY</button><button class="btn" data-s="R">RIGHT ONLY</button></div>
      <div id="avreg"></div>
      <div id="avyou2"><h3>TOES</h3><div class="row" id="avtoe"><button class="btn" data-o="round">ROUND</button><button class="btn" data-o="pointed">POINTED</button><button class="btn" data-o="square">SQUARE</button></div>
      <h3>SCULPT (DRAG ON HIM)</h3><div class="row"><button class="btn" id="avsc">SCULPT OFF</button><button class="btn" data-k="push">PUSH OUT</button><button class="btn" data-k="pull">PULL IN</button><button class="btn" data-k="smooth">SMOOTH</button></div>
      ${sl('avbs','BRUSH SIZE',1,14,0.1)}${sl('avbt','STRENGTH',0.05,1,0.01)}<div class="row"><button class="btn" id="avmir">MIRROR</button></div></div>
      <h3>MORE</h3><div class="row"><button class="btn" data-ed="sizes">EVERY PIECE</button><button class="btn" data-ed="pieces">MOVE / TURN PIECES</button><button class="btn" data-ed="moves">MOVES</button><button class="btn" data-ed="animate">ANIMATE</button></div></div>
    <div class="pane" data-p="pose"><div class="dim">drag any part of him to pose it (up and down, side to side): an arm, a forearm, a leg, a shin, a foot, his body, his head, his hips. This is how he stands whenever he stands still in the game.</div>
      <div class="row"><span class="lab">PART</span><span id="avpart" class="dim">click a part of him</span></div>
      <h3>STANDING POSES</h3><div class="row" id="avsp"></div>
      <h3>MY POSES</h3><div class="row"><input type="text" id="avspn" maxlength="24" placeholder="a name for this pose"><button class="btn" id="avspk">KEEP</button></div><div class="row" id="avspl"></div>
      <h3>TIDY</h3><div class="row"><button class="btn" id="avspm1">MIRROR LEFT ONTO RIGHT</button><button class="btn" id="avspm2">MIRROR RIGHT ONTO LEFT</button><button class="btn" id="avspu">UNDO POSE</button></div></div>
    <div class="pane" data-p="look"><div class="row"><span class="lab">NAME</span><input type="text" id="avname" maxlength="24" placeholder="your name"></div>
      <div class="row"><span class="lab">HEALTH</span><div class="bar"><i id="avhp" style="background:#c84a3a;width:100%"></i></div></div><div class="row"><span class="lab">STAMINA</span><div class="bar"><i id="avst" style="background:#d8b84a;width:100%"></i></div></div>
      <h3>HAIR</h3><div class="row" id="avhair"></div><h3>EYES</h3><div class="row" id="aveyes"></div><h3>COLOURS</h3><div class="grid" id="avcols"></div></div>
    <div class="pane" data-p="tex"><h3>PATTERNS</h3><div class="dim">a pattern woven in his shader: on the shirt and sleeves, the trousers, the shoes</div><div id="avtex"></div></div>
    <div class="pane" data-p="outl"><h3>OUTLINE</h3><div class="row"><button class="btn" id="avoon">OUTLINE OFF</button></div>
      <h3>COLOUR</h3><div class="row"><button class="btn" id="avoown">EACH PART'S OWN DARK</button><input type="color" id="avoc"><button class="btn" data-oc="#101014">BLACK</button><button class="btn" data-oc="#f2ead2">LIGHT</button><button class="btn" data-oc="#c8302a">RED</button></div>
      <h3>THICKNESS (PIXELS)</h3><div class="row" id="avow">${[1,2,3,4].map(w=>`<button class="btn" data-w="${w}">${w}</button>`).join('')}</div></div>
    <div class="pane" data-p="shade"><h3>LIGHT ON HIM</h3><div class="row"><button class="btn" id="avst2">STEPPED</button></div>
      ${sl('avsteps','STEPS',2,12,1)}${sl('avdepth','SHADOW DEPTH',0.02,0.98,0.005)}
      <h3>HIS OWN SHADOW</h3><div class="row"><button class="btn" id="avself">SELF-SHADOW ON</button></div>
      ${sl('avrim','RIM LIGHT',0,1,0.01)}<h3>LIT BY</h3><div class="row"><button class="btn" id="avlit">LAMPS</button></div>
      <div class="dim">(the patterns and the rim show lit by the lamps; FLAT is his old fixed light. Steps and depth are everyone's: all the characters are shaded as you are)</div></div>
    <div class="pane" data-p="pre"><div class="row"><input type="text" id="avpn" maxlength="24" placeholder="a name for this look"><button class="btn" id="avps">SAVE</button></div>
      <div id="avpl"></div><h3>ALL</h3><div class="row"><button class="btn" id="avreset">RESET EVERYTHING</button></div>
      <div class="row"><button class="btn" id="avload">LOAD A FILE</button></div></div>
    <div class="foot"><div class="row"><button class="btn" id="avundo">UNDO SHAPE</button><button class="btn" id="avdone" style="margin-left:auto">DONE</button></div></div>`;
  document.body.appendChild(P);
  const $=s=>P.querySelector(s), press=(el,on)=>el.setAttribute('aria-pressed',String(!!on)), L=LOOKS.L;
  let tab='body', sculpt=false;
  // BODY's sliders
  { let o=''; REG.forEach(([g,rows],gi)=>{ o+=`<h3>${g}${rows.length&&REG[gi][2]?' <span class="dim">(SIDES ABOVE)</span>':''}</h3>`; rows.forEach(([l],ri)=>{ o+=sl(`avr${gi}_${ri}`,l,0.5,1.8,0.01); }); }); $('#avreg').innerHTML=o;
    REG.forEach(([,rows],gi)=>rows.forEach(([,f,c],ri)=>{ const s=$(`#avr${gi}_${ri}`); s.onpointerdown=()=>ED.snap(); s.oninput=()=>{ setR(f,c,+s.value); $(`#avr${gi}_${ri}v`).textContent=(+s.value).toFixed(2); }; s.onchange=()=>ED.save(); })); }
  // LOOK's picks and colours
  $('#avhair').innerHTML=LOOKS.HAIRS.map((h,i)=>`<button class="btn" data-h="${i}">${h[0]}</button>`).join('');
  $('#aveyes').innerHTML=['DOTS','WHITES','BIG','HALF-LIDDED','LASHES','SMILING'].map((e,i)=>`<button class="btn" data-e="${i}">${e}</button>`).join('');
  const COLS=[['skin','skin','SKIN'],['hair','hairc','HAIR'],['eye','eye','EYES'],['shirt','shirt','SHIRT'],['pants','pants','TROUSERS'],['shoes','shoes','SHOES']];
  $('#avcols').innerHTML=COLS.map(([k,f,l])=>`<span>${l}</span><div class="row" style="margin:0">${LOOKS.PAL[k].map((c,i)=>`<button class="sw" data-c="${k}" data-i="${i}" style="background:${c}" aria-label="${l} ${i+1}"></button>`).join('')}</div><input type="color" data-cp="${k}" aria-label="${l}, any colour">`).join('');
  // TEXTURES
  $('#avtex').innerHTML=GAR.map(([g,l],i)=>`<h3>${l}</h3><div class="row">${PATN.map((n,t)=>`<button class="btn" data-g="${i}" data-pt="${t}">${n}</button>`).join('')}</div>
    <div class="row"><span class="lab">SCALE</span><input type="range" data-gs="${i}" min="0.3" max="3" step="0.05"></div>
    <div class="row"><span class="lab">COLOURS</span><input type="color" data-cp="${g}" aria-label="${l} colour"><span class="dim">AND</span><input type="color" data-g2="${i}" aria-label="${l} second colour"></div>`).join('');
  const hex=c=>'#'+new THREE.Color(c).getHexString();
  function draw(){ P.querySelectorAll('[data-t]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.t===tab))); P.querySelectorAll('[data-p]').forEach(p=>p.hidden=!(TABG[tab]||[tab]).includes(p.dataset.p));
    P.querySelectorAll('#avwho [data-who]').forEach(b=>press(b,b.dataset.who===who)); const bw=!!BW(); $('#avbuild').hidden=$('#avyou').hidden=$('#avyou2').hidden=bw; $('#avbeard').hidden=$('#avlooks6').hidden=!bw;
    { const F=faceOf(); for(const [k] of FACE){ $('#avf_'+k).value=F[k]; $('#avf_'+k+'v').textContent=(+F[k]).toFixed(2); } P.querySelectorAll('[data-hs]').forEach(b=>press(b,b.dataset.hs===(F.shape||'round'))); if(bw)P.querySelectorAll('[data-bd]').forEach(b=>press(b,b.dataset.bd===BWK.F.beard)); }
    P.querySelectorAll('#avbuild [data-b]').forEach(b=>press(b,+b.dataset.b===L.build)); { const h=bw?BWK.F.h:(L.hk||1); $('#avh').value=h; $('#avhv').textContent=(+h).toFixed(2); }
    P.querySelectorAll('#avside [data-s]').forEach(b=>press(b,b.dataset.s===side));
    REG.forEach(([,rows,two],gi)=>rows.forEach(([,f,c],ri)=>{ const v=getR(f,c); $(`#avr${gi}_${ri}`).value=v; $(`#avr${gi}_${ri}v`).textContent=v.toFixed(2); }));
    let toe='round'; try{ toe=localStorage.getItem('market-toe')||'round'; }catch(e){} P.querySelectorAll('#avtoe [data-o]').forEach(b=>press(b,b.dataset.o===toe));
    $('#avsc').textContent='SCULPT '+(sculpt?'ON':'OFF'); press($('#avsc'),sculpt); P.querySelectorAll('[data-k]').forEach(b=>press(b,ED.B.mode===b.dataset.k)); $('#avbs').value=ED.B.size; $('#avbt').value=ED.B.str; press($('#avmir'),ED.B.mirror);
    $('#avname').value=L.name||''; P.querySelectorAll('[data-h]').forEach(b=>press(b,+b.dataset.h===L.hair)); P.querySelectorAll('[data-e]').forEach(b=>press(b,+b.dataset.e===L.eyes));
    P.querySelectorAll('.sw[data-c]').forEach(b=>{ const k=b.dataset.c, f=COLS.find(c=>c[0]===k)[1]; press(b,!(L.cx&&L.cx[k])&&+b.dataset.i===L[f]); });
    P.querySelectorAll('[data-cp]').forEach(i=>i.value=hex(LOOKS.col(i.dataset.cp)));
    P.querySelectorAll('[data-pt]').forEach(b=>press(b,S.pat[+b.dataset.g].t===+b.dataset.pt)); P.querySelectorAll('[data-gs]').forEach(s=>s.value=S.pat[+s.dataset.gs].s); P.querySelectorAll('[data-g2]').forEach(i=>i.value=S.pat[+i.dataset.g2].c2);
    $('#avoon').textContent='OUTLINE '+(OUTL.on?'ON':'OFF'); press($('#avoon'),OUTL.on); press($('#avoown'),!S.oc); $('#avoc').value=S.oc||'#101014'; P.querySelectorAll('[data-oc]').forEach(b=>press(b,S.oc===b.dataset.oc)); P.querySelectorAll('[data-w]').forEach(b=>press(b,+b.dataset.w===S.ow));
    const sh=W3.shade; press($('#avst2'),!sh.smooth); $('#avsteps').value=sh.steps; $('#avstepsv').textContent=sh.smooth?'—':sh.steps; $('#avsteps').disabled=sh.smooth; $('#avdepth').value=sh.depth; $('#avdepthv').textContent=sh.depth.toFixed(2);
    $('#avself').textContent='SELF-SHADOW '+(W3.selfOff?'OFF':'ON'); press($('#avself'),!W3.selfOff); $('#avrim').value=S.rim; $('#avrimv').textContent=S.rim.toFixed(2); $('#avlit').textContent=UI.lit?'LAMPS':'FLAT (HIS OWN LIGHT)'; press($('#avlit'),UI.lit);
    drawPre(); }
  // ---- WHAT EACH CONTROL DOES
  P.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ tab=b.dataset.t; if(tab!=='body')setSculpt(false); posing(); draw(); });
  // POSE (owner, 18 Oct 2026: "the avatar editor needs to have a section where i can pose the avatar and pull his limbs all around. i want to be
  // able to pick his standing pose"): his standing pose is the animator's standing key (src/animator.js, RIG.ANIMX), so it's him wherever he
  // stands still; on this tab a press on a part of him and a drag turns it (the animator's own drag), the presets set it whole. Changes from his
  // rig's standing, in degrees (ua / fa: an upper arm's, a forearm's way [forward, out]; th / sh: a thigh's, a shin's; root in his units)
  const SIDES2=(d,a)=>{ const o={...d}; for(const k in a){ o['L.'+k]=a[k]; o['R.'+k]=a[k]; } return o; };
  const SPOSE={
    'RELAXED':{},
    'HANDS ON HIPS':SIDES2({},{ua0:-12,ua1:38,fa0:-30,fa1:-100}),
    'ARMS CROSSED':SIDES2({},{ua0:16,ua1:6,fa0:62,fa1:-80}),
    'HANDS IN POCKETS':SIDES2({},{ua0:-4,ua1:6,fa0:-8,fa1:-22,fist:.7}),
    'HANDS BEHIND':SIDES2({},{ua0:-26,ua1:12,fa0:-40,fa1:-70}),
    'CONFIDENT':SIDES2({bend:-6,nod:-6},{ua1:10,th1:6}),
    'WEIGHT ON ONE LEG':{'root.x':1.5,side:4,'L.th1':5,'R.th0':8,'R.sh0':-18,'R.th1':-2},
    'SLOUCH':SIDES2({bend:14,nod:12,'root.y':-.6},{ua0:8}),
    'SHY':SIDES2({nod:14},{ua0:12,ua1:-4,fa0:30,fa1:-55,th1:-3}),
    'ONE HAND ON HIP':{'R.ua0':-12,'R.ua1':38,'R.fa0':-30,'R.fa1':-100,look:12},
    'THINKING':{'R.ua0':26,'R.ua1':10,'R.fa0':128,'R.fa1':-34,'L.ua0':18,'L.fa0':64,'L.fa1':-78,nod:8},
    'AT EASE':SIDES2({},{ua0:-14,ua1:4,fa0:-16,fa1:-30,th1:4}) };
  const keptPoses=()=>{ try{ return JSON.parse(SAVE.get('standposes')||'{}'); }catch(e){ return {}; } };
  const drawPoses=()=>{ const cur=JSON.stringify(RIG.ANIMX.stand()), kp=keptPoses();
    $('#avsp').innerHTML=Object.keys(SPOSE).map(n=>`<button class="btn" data-sp="${n}" aria-pressed="${JSON.stringify(SPOSE[n])===cur}">${n}</button>`).join('');
    $('#avspl').innerHTML=Object.keys(kp).map(n=>`<button class="btn" data-kp="${n}" aria-pressed="${JSON.stringify(kp[n])===cur}">${n}</button><button class="btn" data-kx="${n}" aria-label="forget ${n}">✕</button>`).join('')||'<span class="dim">none kept yet</span>';
    P.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{ RIG.ANIMX.setStand(SPOSE[b.dataset.sp]); drawPoses(); });
    P.querySelectorAll('[data-kp]').forEach(b=>b.onclick=()=>{ RIG.ANIMX.setStand(keptPoses()[b.dataset.kp]); drawPoses(); });
    P.querySelectorAll('[data-kx]').forEach(b=>b.onclick=()=>{ const k=keptPoses(); delete k[b.dataset.kx]; try{ SAVE.set('standposes',JSON.stringify(k)); }catch(e){} drawPoses(); }); };
  $('#avspk').onclick=()=>{ const n=($('#avspn').value||'').trim().toUpperCase()||'POSE '+(Object.keys(keptPoses()).length+1), k=keptPoses(); k[n]=RIG.ANIMX.stand(); try{ SAVE.set('standposes',JSON.stringify(k)); }catch(e){} $('#avspn').value=''; drawPoses(); };
  $('#avspm1').onclick=()=>{ RIG.ANIMX.mirror('L','R'); drawPoses(); }; $('#avspm2').onclick=()=>{ RIG.ANIMX.mirror('R','L'); drawPoses(); }; $('#avspu').onclick=()=>{ RIG.ANIMX.undo(); drawPoses(); };
  const posing=()=>{ if(!AV.on||sculpt)return; if(tab==='pose'){ RIG.ANIMX.edit(); ED.setMode('animate'); drawPoses(); } else ED.setMode('av'); };
  (typeof renderer!=='undefined'?renderer.domElement:document).addEventListener('pointerup',()=>{ if(AV.on&&tab==='pose'){ $('#avpart').textContent=RIG.ANIMX.part(); drawPoses(); } });
  window.AVPOSE=n=>{ RIG.ANIMX.setStand(SPOSE[n]||{}); return Object.keys(SPOSE); };   // (a test's)
  window.AVJ=()=>{ const s=RIG.create(); s.snap=true; const B=RIG.pose(s,true), why=[]; RIG.overlaps(B,why); return {J:B.J,why}; };   // (a test's: his joints standing, and what passes through what)
  P.querySelectorAll('#avbuild [data-b]').forEach(b=>b.onclick=()=>{ ED.snap(); LOOKS.setBuild(+b.dataset.b); LOOKS.height(L.hk||1); draw(); });
  $('#avh').oninput=e=>{ if(BW()){ BWK.F.h=+e.target.value; BWK.save(); } else LOOKS.height(+e.target.value); $('#avhv').textContent=(+e.target.value).toFixed(2); };
  // WHO: him held a step to your left as the view stands (clear of the panel), facing it, while he's being edited; let go to walk on when you're done or back to YOU
  const holdB=on=>{ if(!window.BWK)return; if(!on){ BWK.hold=null; return; } const f=new THREE.Vector3(0,0,-1).applyQuaternion(cam.quaternion), r=new THREE.Vector3(1,0,0).applyQuaternion(cam.quaternion); f.y=r.y=0; f.normalize(); r.normalize();
    BWK.hold={x:pos.x-r.x*1.4*T,z:pos.z-r.z*1.4*T,hd:Math.atan2(-f.x,-f.z)}; };
  P.querySelectorAll('#avwho [data-who]').forEach(b=>b.onclick=()=>{ who=b.dataset.who==='bwk'&&window.BWK&&BWK.F?'bwk':'you'; holdB(who==='bwk'); if(who==='bwk')setSculpt(false); draw(); });
  for(const [k] of FACE){ const el=$('#avf_'+k); el.onpointerdown=()=>{ if(!BW())ED.snap(); };
    el.oninput=()=>{ const v=+el.value; $('#avf_'+k+'v').textContent=v.toFixed(2); if(BW())BWK.F[k]=v; else ED.face({[k]:v},true); };
    el.onchange=()=>{ if(BW())BWK.remake(); }; }
  P.querySelectorAll('[data-hs]').forEach(b=>b.onclick=()=>{ if(BW()){ BWK.F.shape=b.dataset.hs; BWK.remake(); } else ED.face({shape:b.dataset.hs}); draw(); });
  P.querySelectorAll('[data-bd]').forEach(b=>b.onclick=()=>{ if(!BW())return; BWK.F.beard=b.dataset.bd; BWK.remake(); draw(); });
  P.querySelectorAll('[data-l6]').forEach(b=>b.onclick=()=>{ if(!BW())return; Object.assign(BWK.F,BWK.F0,BWK.LOOKS6[+b.dataset.l6],{h:BWK.F.h}); BWK.remake(); draw(); });
  P.querySelectorAll('#avside [data-s]').forEach(b=>b.onclick=()=>{ side=b.dataset.s; draw(); });
  P.querySelectorAll('#avtoe [data-o]').forEach(b=>b.onclick=()=>{ ED.toe(b.dataset.o); draw(); });
  const setSculpt=on=>{ sculpt=on; if(AV.on)ED.setMode(on?'sculpt':'av'); };
  $('#avsc').onclick=()=>{ setSculpt(!sculpt); draw(); };
  P.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{ ED.B.mode=b.dataset.k; setSculpt(true); draw(); });
  $('#avbs').oninput=e=>{ ED.B.size=+e.target.value; }; $('#avbt').oninput=e=>{ ED.B.str=+e.target.value; }; $('#avmir').onclick=()=>{ ED.B.mirror=!ED.B.mirror; draw(); };
  P.querySelectorAll('[data-ed]').forEach(b=>b.onclick=()=>{ P.hidden=true; ED.show(b.dataset.ed); });   // (HIS SHAPE's own panel on that tab; its AVATAR EDITOR button back)
  $('#avname').oninput=e=>{ L.name=e.target.value; LOOKS.save(); }; $('#avname').addEventListener('keydown',e=>e.stopPropagation()); $('#avpn').addEventListener('keydown',e=>e.stopPropagation());
  P.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{ L.hair=+b.dataset.h; LOOKS.apply(); draw(); });
  P.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{ L.eyes=+b.dataset.e; LOOKS.apply(); draw(); });
  P.querySelectorAll('.sw[data-c]').forEach(b=>b.onclick=()=>{ const k=b.dataset.c, f=COLS.find(c=>c[0]===k)[1]; L[f]=+b.dataset.i; if(L.cx)delete L.cx[k]; LOOKS.apply(); draw(); });
  P.querySelectorAll('[data-cp]').forEach(i=>i.oninput=()=>{ (L.cx||(L.cx={}))[i.dataset.cp]=i.value; LOOKS.apply(); P.querySelectorAll(`[data-cp="${i.dataset.cp}"]`).forEach(j=>{ if(j!==i)j.value=i.value; }); });
  P.querySelectorAll('[data-pt]').forEach(b=>b.onclick=()=>{ S.pat[+b.dataset.g].t=+b.dataset.pt; applyS(); save(); draw(); });
  P.querySelectorAll('[data-gs]').forEach(s=>s.oninput=()=>{ S.pat[+s.dataset.gs].s=+s.value; applyS(); save(); });
  P.querySelectorAll('[data-g2]').forEach(i=>i.oninput=()=>{ const p=S.pat[+i.dataset.g2]; p.c2=i.value; if(!p.t)p.t=1; applyS(); save(); draw(); });
  const outl=on=>{ OUTL.on=on; OUTL.sp.enabled=on; try{ localStorage.setItem('market-outline',on?'1':'0'); }catch(e){} };
  $('#avoon').onclick=()=>{ outl(!OUTL.on); draw(); };
  $('#avoown').onclick=()=>{ S.oc=''; applyS(); save(); draw(); }; $('#avoc').oninput=e=>{ S.oc=e.target.value; outl(true); applyS(); save(); };
  P.querySelectorAll('[data-oc]').forEach(b=>b.onclick=()=>{ S.oc=b.dataset.oc; outl(true); applyS(); save(); draw(); });
  P.querySelectorAll('[data-w]').forEach(b=>b.onclick=()=>{ S.ow=+b.dataset.w; outl(true); applyS(); save(); draw(); });
  $('#avst2').onclick=()=>{ W3.setShade(W3.shade.steps,W3.shade.depth,false); draw(); };
  $('#avsteps').oninput=e=>{ W3.setShade(+e.target.value,W3.shade.depth); $('#avstepsv').textContent=e.target.value; }; $('#avdepth').oninput=e=>{ W3.setShade(W3.shade.steps,+e.target.value); $('#avdepthv').textContent=(+e.target.value).toFixed(2); };
  $('#avself').onclick=()=>{ W3.setSelf(!!W3.selfOff); draw(); };
  $('#avrim').oninput=e=>{ S.rim=+e.target.value; applyS(); save(); $('#avrimv').textContent=S.rim.toFixed(2); };
  $('#avlit').onclick=()=>{ UI.setLit(!UI.lit); draw(); };
  $('#avundo').onclick=()=>{ ED.undo(); draw(); }; $('#avdone').onclick=()=>ED.exit();
  // ---- PRESETS: the whole of him (his looks, his shape, his shading, the patterns and the outline) under a name, in this browser; or a file
  const whole=()=>({v:1,looks:JSON.parse(JSON.stringify(L)),shape:ED.pack(),shade:W3.shade,self:!W3.selfOff,av:JSON.parse(JSON.stringify(S)),outline:OUTL.on,lit:UI.lit,toe:(()=>{ try{ return localStorage.getItem('market-toe'); }catch(e){ return null; } })()});
  const put=o=>{ if(!o||o.v!==1)return; ED.snap(); if(o.looks){ for(const k of Object.keys(L))if(k!=='name')delete L[k]; Object.assign(L,o.looks); LOOKS.apply(); W3.BH=LOOKS.BUILDS[L.build|0][1]*(L.hk||1); }
    if(o.shape)ED.unpack(o.shape); if(o.shade)W3.setShade(o.shade.steps,o.shade.depth,o.shade.smooth); if(o.self!=null)W3.setSelf(o.self);
    if(o.av){ S=Object.assign(S0(),o.av); applyS(); save(); } if(o.outline!=null)outl(o.outline); if(o.lit!=null)UI.setLit(o.lit); try{ localStorage.setItem('market-toe',o.toe||'round'); }catch(e){} draw(); };
  AV.whole=whole; AV.put=put;   // (the whole of him as data and back: the standalone avatar editor's outfits and files, src/avatar-post.js)
  let PRE={}; try{ PRE=JSON.parse(localStorage.getItem('market-avpresets')||'{}')||{}; }catch(e){}
  const savePre=()=>{ try{ localStorage.setItem('market-avpresets',JSON.stringify(PRE)); return true; }catch(e){ return false; } };
  function drawPre(){ const l=$('#avpl'), ks=Object.keys(PRE); l.innerHTML=ks.length?'':'<div class="dim">no looks saved yet</div>';
    for(const k of ks){ const d=document.createElement('div'); d.className='pl'; const n=document.createElement('span'); n.textContent=k; const a=document.createElement('button'); a.className='btn'; a.textContent='WEAR'; a.onclick=()=>put(PRE[k]);
      const x=document.createElement('button'); x.className='btn'; x.textContent='DELETE'; x.onclick=()=>{ delete PRE[k]; savePre(); drawPre(); }; d.append(n,a,x); l.appendChild(d); } }
  $('#avps').onclick=()=>{ const n=($('#avpn').value||'').trim()||'LOOK '+(Object.keys(PRE).length+1); PRE[n]=whole(); if(!savePre()){ delete PRE[n]; $('#avpl').insertAdjacentHTML('afterbegin','<div class="dim">too big to keep in the browser (a sculpted shape): DOWNLOAD it instead</div>'); return; } $('#avpn').value=''; drawPre(); };
  $('#avreset').onclick=()=>{ ED.snap(); ED.allBack(); for(const k of Object.keys(L))if(k!=='name')delete L[k]; Object.assign(L,{sex:'M',build:0,eyes:0,hair:0,skin:1,hairc:1,eye:0,shirt:0,pants:0,shoes:0,hk:1}); LOOKS.setBuild(0);
    W3.setShade(typeof CEL!=='undefined'?CEL:4,.72,false); W3.setSelf(true); S=S0(); applyS(); save(); outl(false); try{ localStorage.setItem('market-toe','round'); }catch(e){} draw(); };
  $('#avload').onclick=()=>{ const f=document.createElement('input'); f.type='file'; f.accept='.json,application/json'; f.onchange=async()=>{ try{ put(JSON.parse(await f.files[0].text())); }catch(e){} }; f.click(); };
  // ---- IN AND OUT: HIS SHAPE's mode underneath (its panel hidden, a tab of its own whose drag turns the view round him); the map view while
  // open (the isometric one doesn't turn), the view he had back when it closes
  const pane=document.createElement('div'); ED.addTab('av','AVATAR',pane,{down:(h,e)=>{ UI.grab(e); ED.setSel(-1); return true; },move:(dx,dy)=>UI.orbit(dx,dy)});
  { const b=document.querySelector('#ed .tabs [data-m="av"]'); if(b)b.hidden=true; }
  { const b=document.createElement('button'); b.className='btn'; b.textContent='AVATAR EDITOR'; b.onclick=()=>AV.open(); const r=document.querySelector('#ed .foot .row'); if(r)r.appendChild(b); }
  let view0=null;
  AV.open=t=>{ if(t)tab=t==='tex'?'look':t==='outl'||t==='shade'?'style':t; if(MAPED.on)MAPED.toggle(); if(WE.on)WE.toggle(); if(!ED.on){ ED.enter(true); view0=UI.view; if(UI.view!=='map'){ UI.setView('map'); pitchTo=clampP(0.22); ppuTo=Math.min(240,PPU*3.2); } } else ED.P.hidden=true;
    AV.on=true; setSculpt(tab==='body'&&sculpt); posing(); P.hidden=false; draw(); };
  const exit0=ED.exit; ED.exit=()=>{ holdB(false); who='you'; const v=view0; view0=null; AV.on=false; sculpt=false; P.hidden=true; if(v&&UI.view!==v)UI.setView(v); exit0(); };
  AV.toggle=()=>{ if(AV.on&&!P.hidden)ED.exit(); else AV.open(); };
  LOOKS.open=()=>AV.open('look');   // (a double click on yourself, and DISPLAY's YOUR LOOKS: this editor's LOOK)
  { const st0=LOOKS.stats; LOOKS.stats=(hp,st)=>{ st0(hp,st); if(P.hidden)return; $('#avhp').style.width=Math.round(hp*100)+'%'; $('#avst').style.width=Math.round(st*100)+'%'; }; }
}
