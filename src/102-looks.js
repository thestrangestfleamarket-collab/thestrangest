// THE LOOKS: LOOKS keeps the player's name and shoes, and YOU, the window you change your look in (the avatar's lines join it: 111c).
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DOLL, FIRSTDAY, LEVELS, LOOKS, pos, st, UI, W3} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer, scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {QS, SHL, SYS, TILE} from './006-map-pre.js';
import {GARB} from './072b-garb.js';

LOOKS.over={};
{ const $=s=>document.querySelector(s), MATS=RIG.MATS;
  const COL={skin:'#e6c4b0',hair:'#6a5958',eye:'#5a3a26',shirt:'#a9a57e',pants:'#434e58',shoes:'#77614a'};
  const sz=(w,d=w)=>[w,1,d], LR=(n,v)=>({[n+'L']:v,[n+'R']:v}), arms=(u,f=u)=>({...LR('upperArm',sz(u)),...LR('sleeve',sz(u)),...LR('forearm',sz(f))}), legs=(t,sh=t)=>({...LR('thigh',sz(t)),...LR('shin',sz(sh))});
  const MALE={hips:[.81,1,.873],torso:sz(1.05,1.06),...arms(1.05,1.03),...legs(1.04,1)};
  const FEMALE={hips:[1.08,1,1.02],torso:sz(.92,.94),neck:sz(.82),...arms(.84,.82),...legs(1.1,.94),...LR('hand',sz(.84,.88)),...LR('shoe',[.86,.92,.88])};
  // the hairstyles and beards you choose from (new ones at the end of their list: a look's code keeps its meaning); '' is bald, or no beard
  const HAIRS=[['hair','SHORT'],['hairBuzz','BUZZ'],['hairSlick','SLICKED BACK'],['hairSpiky','SPIKY'],['hairMohawk','MOHAWK'],['hairCurly','CURLY'],['','BALD'],
    ['hairPixie','PIXIE'],['hairBob','BOB'],['hairPony','PONYTAIL'],['hairPigtails','PIGTAILS'],['hairBraid','BRAID'],['hairBun','BUN'],['hairLong','LONG'],['hairWavy','WAVY LONG']];
  const BEARDS=[['','NONE'],['beardStubble','STUBBLE'],['beardShort','SHORT'],['beardFull','FULL'],['beardGoatee','GOATEE'],['beardMoustache','MOUSTACHE']];
  const L={name:'',bare:false,form:'M',hair:'hair',beard:''};
  try{ const o=JSON.parse(SAVE.get('looks')||'{}'); L.name=o.name||''; L.bare=!!o.bare; if(o.form==='F')L.form='F'; if(HAIRS.some(h=>h[0]===o.hair))L.hair=o.hair; if(L.form==='M'&&BEARDS.some(b=>b[0]===o.beard))L.beard=o.beard; }catch(e){}
  const save=()=>{ try{ SAVE.set('looks',JSON.stringify({name:L.name,bare:L.bare,form:L.form,hair:L.hair,beard:L.beard})); }catch(e){} };
  // a look's style as a short code for the other players (build, hair, beard), and back
  LOOKS.code=(o=L)=>(o.form==='F'?'F':'M')+Math.max(0,HAIRS.findIndex(h=>h[0]===o.hair)).toString(36)+Math.max(0,BEARDS.findIndex(b=>b[0]===o.beard)).toString(36);
  LOOKS.decode=c=>{ const h=HAIRS[parseInt((c||'')[1],36)], b=BEARDS[parseInt((c||'')[2],36)], form=(c||'')[0]==='F'?'F':'M'; return {form,hair:h?h[0]:'hair',beard:form==='M'&&b?b[0]:''}; };
  const layers=()=>{ Object.assign(W3.worn,GARB.worn()); };
  const tones=h=>{ const c=new THREE.Color(h); return [1,.9,.7,.42].map(k=>c.clone().multiplyScalar(k)); };
  const put=(A,i,r)=>{ A.c0.setXYZ(i,r[0].r,r[0].g,r[0].b); A.c1.setXYZ(i,r[1].r,r[1].g,r[1].b); A.c2.setXYZ(i,r[2].r,r[2].g,r[2].b); A.cd.setXYZ(i,(r[2].r+r[3].r)/2,(r[2].g+r[3].g)/2,(r[2].b+r[3].b)/2); if(A.color)A.color.setXYZ(i,r[1].r,r[1].g,r[1].b); };
  const recolor=()=>{ const g=W3.mesh.geometry, A=g.attributes, mt=A.mat.array, n=mt.length;
    for(let i=0;i<n;i++){ const r=W3.ramp[mt[i]|0]; if(r)put(A,i,r); }
    for(const k of ['c0','c1','c2','cd','color'])if(A[k])A[k].needsUpdate=true; };
  let E0=null, EF=null;
  const shape=(form=L.form)=>W3.pcs.map((P,i)=>(form==='F'?EF:E0)[i]);
  LOOKS.shape=shape;
  W3.recolor=()=>LOOKS.refresh(); window.LOOKS=LOOKS;
  LOOKS.refresh=()=>{ recolor(); shape().forEach((e,i)=>{ W3.E[i]=LOOKS.mix?LOOKS.mix(e,i):e; }); feet(); };
  const feet=()=>{ if(!L.bare)return; const A=W3.mesh.geometry.attributes, n=A.mat.count, SK=W3.ramp[MATS.indexOf('skin')]; if(!SK)return;
    for(let i=0;i<n;i++){ const P=W3.pcs[A.pidx.getX(i)|0]; if(P&&/^shoe/.test(P.n))put(A,i,SK); } for(const k of ['c0','c1','c2','cd','color'])if(A[k])A[k].needsUpdate=true; };
  LOOKS.shoes=on=>{ '@later'; on=on===undefined?L.bare:!!on; if(on===!L.bare)return; L.bare=!on; save(); if(typeof RIG!=='undefined'&&RIG.act&&!st.move){ RIG.act(st,'C'); setTimeout(()=>RIG.release(st,'C'),650); }
    setTimeout(()=>{ LOOKS.refresh(); draw(); if(LOOKS.onChange)LOOKS.onChange(); },320); SAY(on?'YOU PUT YOUR SHOES BACK ON.':'YOU TAKE OFF YOUR SHOES.'); };
  const apply=()=>{ const set=(m,h)=>{ const i=MATS.indexOf(m); if(i>=0)W3.ramp[i]=tones(h); }; for(const k in COL)set(k,LOOKS.over[k]||COL[k]); { const i=MATS.indexOf('lid'); if(i>=0)W3.ramp[i]=tones(COL.skin).map(c=>c.multiplyScalar(.78)); } { const h=new THREE.Color(COL.hair); for(const [m,k] of [['hairHi',1.2],['hairLo',.78]]){ const i=MATS.indexOf(m); if(i>=0)W3.ramp[i]=tones('#'+h.clone().multiplyScalar(k).getHexString()); } } recolor();
    for(let k=0;k<7;k++){ const i=W3.idx('eyes'+k); if(i>=0)W3.HIDE[i]=k!==6; } layers(); if(W3.dress)W3.dress(); else if(W3.reindex)W3.reindex(); };
  // YOU (owner, 5 Nov 2026: "redo the character menu to fit this new avatar, make sure has all options and fits on screen"): your name and three tabs, LOOK, WEAR (the avatar's clothes) and WORDS;
  // every option one line, its name on the left (LOOKS.add), only the ones for the body you wear (LOOKS.who); wide and short so it fits the screen, one column on a phone
  const css=document.createElement('style'); css.textContent=`#looks{position:fixed;right:12px;top:12px;width:min(860px,calc(100vw - 24px));box-sizing:border-box;max-height:calc(100vh - 24px);overflow:auto;background:var(--panel,#10131b);border:2px solid var(--line,#2a3040);color:var(--fg,#d8dbe4);font:11px var(--pixel,monospace);padding:12px;z-index:30}
    #looks h2{margin:0 0 8px;font-size:13px;color:#ffd27a;letter-spacing:1px} #looks h3{margin:10px 0 4px;font-size:10px;color:var(--dim,#8a8f9c);letter-spacing:1px}
    #looks .row{display:flex;flex-wrap:wrap;gap:4px;align-items:center} #looks button{font:inherit;color:inherit;background:#1a1f2b;border:2px solid #2a3040;padding:3px 6px;cursor:pointer} #looks button[aria-pressed=true]{border-color:#ffd27a;color:#ffd27a}
    #looks.ml button[aria-pressed="true"]{color:#020a06!important;background:#7dffa8!important}
    #looks input[type=text]{font:inherit;background:#0b0d13;color:inherit;border:2px solid #2a3040;padding:3px;width:220px;max-width:100%}
    #looks .lhd{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px} #looks .ltabs{display:flex;gap:4px;margin-left:auto} #looks .ltabs button[data-t]{min-width:84px}
    #looks .ltab{display:grid;grid-template-columns:150px minmax(0,1fr);gap:6px 12px;align-items:center} #looks .ltab[hidden]{display:none}
    #looks .lr{display:contents} #looks .lr[hidden]{display:none} #looks .lk{color:var(--dim,#8a8f9c);letter-spacing:1px;white-space:nowrap} #looks .lr.full>.lv{grid-column:1/-1}
    #looks .lv{min-width:0} #looks .lv>.row{gap:2px 4px}
    #looks .ltab[data-t=wear]{grid-template-columns:120px minmax(0,1fr)}
    @media (max-width:640px){ #looks .ltab,#looks .ltab[data-t=wear]{grid-template-columns:110px minmax(0,1fr)} #looks .ltabs{margin-left:0} }
`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='looks'; P.hidden=true; P.setAttribute('role','dialog'); P.setAttribute('aria-label','Your character');
  P.innerHTML=`<h2>YOU</h2><div class="lhd"><input type="text" id="lname" maxlength="24" placeholder="your name" aria-label="your name"><div class="ltabs" role="tablist"><button data-t="look" role="tab">LOOK</button><button data-t="wear" role="tab">WEAR</button><button data-t="words" role="tab">WORDS</button><button data-t="pet" role="tab">PET</button></div><button id="lclose">CLOSE</button></div>
    <div class="ltab" data-t="look" role="tabpanel"></div><div class="ltab" data-t="wear" role="tabpanel"></div><div class="ltab" data-t="words" role="tabpanel"></div><div class="ltab" data-t="pet" role="tabpanel"></div>`;
  document.body.appendChild(P);
  // a line of the window: key, its name (none: the whole width), what you set it with; o.tab (look, wear, words), o.who (walker or avatar: shown only while you wear that body), o.order
  let tab='look'; LOOKS.who=()=>'avatar';
  LOOKS.add=(key,label,el,o={})=>{ const T=P.querySelector(`.ltab[data-t="${o.tab||'look'}"]`), r=document.createElement('div'); r.className='lr'+(label?'':' full'); r.dataset.k=key; r.dataset.o=o.order??50; if(o.who)r.dataset.who=o.who;
    r.innerHTML=label?`<span class="lk">${label}</span>`:''; const v=document.createElement('div'); v.className='lv'; v.appendChild(el); r.appendChild(v);
    const after=[...T.children].find(x=>+x.dataset.o>+r.dataset.o); T.insertBefore(r,after||null); LOOKS.layout(); return r; };
  LOOKS.layout=()=>{ const who=LOOKS.who();
    for(const r of P.querySelectorAll('.lr'))r.hidden=!!(r.dataset.who&&r.dataset.who!==who)||r.dataset.off==='1';
    const only=!P.classList.contains('inmenu')&&LOOKS.only;   // (the paper doll's WEAR and WORDS: no LOOK; owner, 9 Nov 2026)
    for(const b of P.querySelectorAll('.ltabs [data-t]')){ const T=P.querySelector(`.ltab[data-t="${b.dataset.t}"]`); b.hidden=![...T.children].some(r=>!r.hidden)||!!(only&&!only.has(b.dataset.t)); }
    $('#lname').hidden=!!(only&&!only.has('look'));
    if(P.querySelector(`.ltabs [data-t="${tab}"]`).hidden){ const f=[...P.querySelectorAll('.ltabs [data-t]')].find(b=>!b.hidden); tab=f?f.dataset.t:'look'; }
    for(const T of P.querySelectorAll('.ltab'))T.hidden=T.dataset.t!==tab;
    for(const b of P.querySelectorAll('.ltabs [data-t]')){ const on=String(b.dataset.t===tab); b.setAttribute('aria-pressed',on); b.setAttribute('aria-selected',on); } };
  LOOKS.tab=t=>{ tab=t; LOOKS.layout(); };
  P.querySelector('.ltabs').onclick=e=>{ const b=e.target.closest('[data-t]'); if(b)LOOKS.tab(b.dataset.t); };
  const line=(id,html)=>{ const d=document.createElement('div'); d.className='row'; d.id=id; if(html)d.innerHTML=html; return d; };
  // (the Walker's own build, hair and beard are gone from YOU: the avatar is the only body you play, owner 5 Nov 2026; barefoot stays, it matters for foraging)
  LOOKS.add('shoes','SHOES',line('lshoes','<button id="lshoe1">SHOES ON</button><button id="lshoe0">BAREFOOT</button><span id="lshoek" style="color:var(--dim,#8a8f9c)"></span>'),{tab:'wear',order:99});
  const draw=()=>{ $('#lname').value=L.name; LOOKS.layout(); $('#lshoe1').setAttribute('aria-pressed',String(!L.bare)); $('#lshoe0').setAttribute('aria-pressed',String(L.bare)); $('#lshoek').textContent='KEY '+UI.keyOf('shoes').toUpperCase(); };
  $('#lshoe1').onclick=()=>LOOKS.shoes(true); $('#lshoe0').onclick=()=>LOOKS.shoes(false);
  $('#lname').oninput=e=>{ if(!FIRSTDAY.claim){ L.name=e.target.value; save(); } };
  $('#lname').onchange=e=>{ if(!FIRSTDAY.claim)return; const was=L.name; FIRSTDAY.claim(e.target.value).then(r=>{ if(r.ok){ L.name=r.name; save(); } else { e.target.value=was; SAY(r.why==='taken'?'THAT NAME IS TAKEN.':'A NAME IS 3 TO 16 LETTERS OR DIGITS.','#c8a090'); } }); };   // (a unique name: the server says if it is free)
  LOOKS.setName=n=>{ L.name=n; save(); try{ $('#lname').value=n; }catch(e){} };
  $('#lname').addEventListener('keydown',e=>e.stopPropagation());
  $('#lclose').onclick=()=>{ P.hidden=true; };
  // worn clothes dye your shirt or trousers (EQUIP sets LOOKS.over from the item's colour)
  LOOKS.dye=()=>{ apply(); recolor(); if(LOOKS.onChange)LOOKS.onChange(); };   // (onChange: the avatar takes the dyes and bare feet)
  LOOKS.open=()=>{ draw(); LOOKS.layout(); P.hidden=false; }; LOOKS.L=L; LOOKS.COL=COL;
  const hit=new THREE.Mesh(new THREE.BoxGeometry(.8*TILE,2.2*TILE,.8*TILE),new THREE.MeshBasicMaterial({visible:false})); scene.add(LEVELS.own(hit,'*'));
  renderer.domElement.addEventListener('pointerdown',()=>{ hit.position.set(pos.x,SHARED.py+1.1*TILE,pos.z); hit.updateMatrixWorld(); },true);
  UI.thing({name:'YOU',ghost:1,quiet:1,obj:hit,reach:99,tall:2,act:()=>DOLL.me()});
  SYS.add('life',()=>{ hit.visible=UI.view!=='first'; },'102-looks you');   // through your own eyes you are not a thing in front of you
  W3.E=W3.pcs.map(()=>null); W3.pcs.forEach((P,i)=>{ const v=MALE[P.under||P.n]; if(v)W3.E[i]={s:v.slice(),o:[0,0,0],q:[0,0,0,1]}; });
  E0=W3.E.map(e=>e&&{...e,s:e.s.slice()}); EF=W3.pcs.map(P=>{ const v=FEMALE[P.under||P.n]; return v?{s:v.slice(),o:[0,0,0],q:[0,0,0,1]}:null; });
  W3.style={form:L.form,hair:L.hair,beard:L.beard};
  const LT=new THREE.Vector3(), LS=new THREE.Vector3(), LSTEP=+(QS.get('lstep')??7)*Math.PI/180; let lt0=performance.now();
  LOOKS.light=()=>{ const now=performance.now(), k=1-Math.exp(-Math.min(.1,(now-lt0)/1000)*7); lt0=now; const sun=CLOCK.sun;
    if(sun&&sun.intensity>.3&&SHARED.LVL==='up')LT.copy(sun.position).sub(sun.target.position).normalize();
    else{ const best=SHL.find(S=>S.intensity>0); if(!best)return; LT.set(best.position.x-pos.x,Math.max(.25*TILE,best.position.y-(SHARED.py+1.2*TILE)),best.position.z-pos.z).normalize(); }
    if(!(LS.lengthSq()>.5))LS.copy(LT); else LS.lerp(LT,k).normalize();
    if(!W3.realL||!(W3.Lw.lengthSq()>.5)||W3.Lw.angleTo(LS)>LSTEP)W3.Lw.copy(LS); W3.realL=true; };
  apply(); if(L.form==='F')LOOKS.refresh(); else feet(); }
