// THE LOOKS: LOOKS keeps the player's name, colours, hair and body shape and puts them on the Walker.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, LEVELS, LOOKS, pos, st, UI, W3} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer, scene} from './004-main.js';
import {OWNED, SAVE} from './005-save.js';
import {QS, SHL, TILE} from './006-map-pre.js';
import {GARB} from './072b-garb.js';

LOOKS.over={};
{ const $=s=>document.querySelector(s), MATS=RIG.MATS;
  // your colours: COL0 the defaults (the clothes' are the real clothes' own), COL what you wear now (yours where you picked one)
  const COL0={skin:'#e6c4b0',hair:'#6a5958',eye:'#5a3a26',shirt:GARB.COL.shirt,pants:GARB.COL.pants,shoes:GARB.COL.shoes}, KS=Object.keys(COL0), COL={...COL0};
  const sz=(w,d=w)=>[w,1,d], LR=(n,v)=>({[n+'L']:v,[n+'R']:v}), arms=(u,f=u)=>({...LR('upperArm',sz(u)),...LR('sleeve',sz(u)),...LR('forearm',sz(f))}), legs=(t,sh=t)=>({...LR('thigh',sz(t)),...LR('shin',sz(sh))});
  const MALE={hips:[.81,1,.873],torso:sz(1.05,1.06),...arms(1.05,1.03),...legs(1.04,1)};
  const FEMALE={hips:[1.08,1,1.02],torso:sz(.92,.94),neck:sz(.82),...arms(.84,.82),...legs(1.1,.94),...LR('hand',sz(.84,.88)),...LR('shoe',[.86,.92,.88])};
  // the hairstyles and beards you choose from (new ones at the end of their list: a look's code keeps its meaning); '' is bald, or no beard
  const HAIRS=[['hair','SHORT'],['hairBuzz','BUZZ'],['hairSlick','SLICKED BACK'],['hairSpiky','SPIKY'],['hairMohawk','MOHAWK'],['hairCurly','CURLY'],['','BALD'],
    ['hairPixie','PIXIE'],['hairBob','BOB'],['hairPony','PONYTAIL'],['hairPigtails','PIGTAILS'],['hairBraid','BRAID'],['hairBun','BUN'],['hairLong','LONG'],['hairWavy','WAVY LONG']];
  const BEARDS=[['','NONE'],['beardStubble','STUBBLE'],['beardShort','SHORT'],['beardFull','FULL'],['beardGoatee','GOATEE'],['beardMoustache','MOUSTACHE']];
  const HEX=/^#[0-9a-f]{6}$/, L={name:'',bare:false,form:'M',hair:'hair',beard:'',col:{}};
  try{ const o=JSON.parse(OWNED.get('looks')||SAVE.get('looks')||'{}'); L.name=o.name||''; L.bare=!!o.bare; if(o.form==='F')L.form='F'; if(HAIRS.some(h=>h[0]===o.hair))L.hair=o.hair; if(L.form==='M'&&BEARDS.some(b=>b[0]===o.beard))L.beard=o.beard; for(const k of KS)if(HEX.test((o.col||{})[k]||''))L.col[k]=o.col[k]; }catch(e){}
  Object.assign(COL,L.col);
  const save=()=>{ try{ OWNED.set('looks',JSON.stringify({name:L.name,bare:L.bare,form:L.form,hair:L.hair,beard:L.beard,col:L.col})); }catch(e){} };
  // a look's style as a short code for the other players (build, hair, beard, then your colours when you picked any: six hex fields, empty for the default), and back
  LOOKS.code=(o=L)=>{ const c=o.col||{}, b=(o.form==='F'?'F':'M')+Math.max(0,HAIRS.findIndex(h=>h[0]===o.hair)).toString(36)+Math.max(0,BEARDS.findIndex(b=>b[0]===o.beard)).toString(36); return KS.some(k=>c[k])?b+'-'+KS.map(k=>c[k]?c[k].slice(1):'').join('-'):b; };
  LOOKS.decode=c=>{ const [s,...f]=String(c||'').split('-'), h=HAIRS[parseInt((s||'')[1],36)], b=BEARDS[parseInt((s||'')[2],36)], form=(s||'')[0]==='F'?'F':'M', col={}; KS.forEach((k,i)=>{ if(HEX.test('#'+(f[i]||'')))col[k]='#'+f[i]; }); return {form,hair:h?h[0]:'hair',beard:form==='M'&&b?b[0]:'',col}; };
  // what your real clothes are dyed: a worn thing's colour (EQUIP sets LOOKS.over) over the colour you picked
  LOOKS.clothes=()=>({shirt:LOOKS.over.shirt||L.col.shirt,pants:LOOKS.over.pants||L.col.pants,shoes:L.col.shoes});
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
    setTimeout(()=>{ LOOKS.refresh(); draw(); },320); SAY(on?'YOU PUT YOUR SHOES BACK ON.':'YOU TAKE OFF YOUR SHOES.'); };
  const tintAll=()=>{ const set=(m,h)=>{ const i=MATS.indexOf(m); if(i>=0)W3.ramp[i]=tones(h); }; for(const k in COL)set(k,LOOKS.over[k]||COL[k]); { const i=MATS.indexOf('lid'); if(i>=0)W3.ramp[i]=tones(COL.skin).map(c=>c.multiplyScalar(.78)); } { const h=new THREE.Color(COL.hair); for(const [m,k] of [['hairHi',1.2],['hairLo',.78]]){ const i=MATS.indexOf(m); if(i>=0)W3.ramp[i]=tones('#'+h.clone().multiplyScalar(k).getHexString()); } } };
  const apply=()=>{ tintAll(); recolor();
    for(let k=0;k<7;k++){ const i=W3.idx('eyes'+k); if(i>=0)W3.HIDE[i]=k!==6; } layers(); if(W3.dress)W3.dress(); else if(W3.reindex)W3.reindex(); };
  // the swatches each colour offers (any other colour from ANY COLOUR)
  const SW={
    skin:[['#f6dcc8','PORCELAIN'],['#efd0b8','IVORY'],['#e6c4b0','FAIR'],['#e8bf9c','PEACH'],['#dcb08e','BEIGE'],['#d4a07a','SAND'],['#c99470','HONEY'],['#c08562','WARM TAN'],['#b37a58','TAN'],['#a86e4c','CARAMEL'],['#9a6342','AMBER'],['#8d5638','BRONZE'],['#7e4b30','CHESTNUT'],['#704028','COCOA'],['#62371f','MAHOGANY'],['#54301c','ESPRESSO'],['#462818','DEEP'],['#3a2014','EBONY'],['#f2d6c2','ROSE'],['#d9b49a','OLIVE'],['#b98d6f','GOLDEN'],['#c3a2a6','ASHEN'],['#a7c4a0','GOBLIN'],['#9fb4d8','FROST']],
    hair:[['#16120f','JET BLACK'],['#2b211b','SOFT BLACK'],['#3d2c22','DARK BROWN'],['#523a2b','BROWN'],['#6a5958','ASH BROWN'],['#7a5537','CHESTNUT'],['#8f6a46','LIGHT BROWN'],['#a7835a','DARK BLONDE'],['#c9a874','BLONDE'],['#e0c896','GOLDEN'],['#ece0bf','PLATINUM'],['#8e3b1f','AUBURN'],['#b0471f','COPPER'],['#c8642c','GINGER'],['#7d7a76','GREY'],['#b7b4ae','SILVER'],['#eeece6','WHITE'],['#e26aa6','PINK'],['#a63a3a','CHERRY'],['#6b3fa0','VIOLET'],['#3a6fd0','BLUE'],['#2f9f8a','TEAL'],['#5fae3c','GREEN'],['#e7d34a','LEMON']],
    eye:[['#5a3a26','BROWN'],['#3a2416','DARK BROWN'],['#21140c','BLACK'],['#7a5130','HAZEL'],['#8e6a2c','AMBER'],['#a68a3c','GOLD'],['#6b7a3a','OLIVE'],['#4f7a4a','GREEN'],['#3c8a6a','JADE'],['#5f8f9a','GREY GREEN'],['#7d8e98','GREY'],['#5f86b8','BLUE'],['#3a5fa0','DEEP BLUE'],['#8fb8e0','ICE BLUE'],['#2a8fb0','TEAL'],['#6a4fa0','VIOLET'],['#a03a3a','RED'],['#c8c8d0','PALE'],['#e0b830','YELLOW'],['#e06a20','ORANGE'],['#30c0a0','MINT'],['#d050a0','PINK'],['#101830','NIGHT'],['#f0f0f0','WHITE']],
    wear:[['#e2dccd','CREAM'],['#f4f1e8','WHITE'],['#2a2a2e','BLACK'],['#7a7d85','GREY'],['#b8322a','RED'],['#e07a2f','ORANGE'],['#e3c547','YELLOW'],['#4f8a3c','GREEN'],['#2f7f6f','TEAL'],['#3a5070','DENIM'],['#2b4fa8','BLUE'],['#6a3fa0','PURPLE'],['#c25a8c','PINK'],['#5b3b25','LEATHER'],['#8a5a3a','TAN'],['#c9a27a','CAMEL'],['#5a6b4f','OLIVE'],['#ff4fa3','HOT PINK'],['#4fe3ff','CYAN'],['#b6ff4f','LIME'],['#ffd24f','GOLD'],['#101014','INK'],['#8f1f1f','MAROON'],['#1f6f3a','FOREST']]};
  const CROWS=[['skin','SKIN','skin'],['hair','HAIR','hair'],['eye','EYES','eye'],['shirt','T-SHIRT','wear'],['pants','PANTS','wear'],['shoes','SHOES','wear']];
  const css=document.createElement('style'); css.textContent=`#looks{position:fixed;right:12px;top:12px;width:400px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;box-sizing:border-box;background:var(--panel,#10131b);border:2px solid var(--line,#2a3040);color:#7dffa8;font:11px var(--pixel,monospace);padding:12px 16px 16px;z-index:30}
    #looks h2{margin:0 0 10px;font-size:13px;letter-spacing:1px} #looks h3{margin:14px 0 4px;font-size:10px;letter-spacing:1px}
    #looks .lnm{display:flex;gap:8px;align-items:center;margin:6px 0 2px} #looks .lnm input{flex:1;min-width:0;font:inherit;color:inherit;background:#031a0d;border:0;box-shadow:inset 0 0 0 2px #3aa866;padding:2px 8px}
    #looks .lrow{display:grid;grid-template-columns:120px minmax(0,1fr);align-items:center;gap:8px;margin:6px 0;position:relative} #looks .lrow[hidden]{display:none} #looks .lk{color:#3aa866}
    #looks .ldd{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:3px 8px;background:#031a0d;box-shadow:inset 0 0 0 2px #3aa866;cursor:pointer;white-space:nowrap;overflow:hidden;outline:0}
    #looks .ldd i{font-style:normal;color:#3aa866} #looks .ldd:hover,#looks .ldd:focus-visible,#looks .ldd[aria-expanded=true]{color:#020a06;background:#7dffa8} #looks .ldd:hover i,#looks .ldd:focus-visible i,#looks .ldd[aria-expanded=true] i{color:#020a06}
    #looks .lsw{display:inline-block;width:18px;height:18px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.45);vertical-align:-3px;margin-right:8px;flex:none}
    #looks .lpop{grid-column:2;z-index:5;background:#020a06;box-shadow:0 0 0 2px #3aa866;padding:4px 0} #looks .lpop[hidden]{display:none}
    #looks .lopt{padding:2px 8px;cursor:pointer;outline:0} #looks .lopt:hover,#looks .lopt:focus-visible{color:#020a06;background:#3aa866} #looks .lopt[aria-selected=true]{color:#020a06;background:#7dffa8}
    #looks .lgrid{padding:8px} #looks .lg{display:grid;grid-template-columns:repeat(8,1fr);gap:6px}
    #looks .lg b{display:block;aspect-ratio:1;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(0,0,0,.5);outline:0} #looks .lg b:hover,#looks .lg b:focus-visible{outline:2px solid #3aa866;outline-offset:1px} #looks .lg b[aria-selected=true]{outline:2px solid #7dffa8;outline-offset:1px}
    #looks .lany{margin-top:8px;display:flex;justify-content:space-between;align-items:center;gap:8px;white-space:nowrap} #looks .lany input{width:120px;height:22px;padding:0 2px;cursor:pointer}
    #looks .lgo{display:flex;gap:8px;margin-top:4px} #looks .lgo button{flex:1}
    #looks .ldes{display:block;width:100%;margin-top:14px;box-shadow:inset 0 0 0 2px #3aa866!important} #looks .lhint{margin-top:8px;color:#3aa866;font-size:14px!important}`;
  document.head.appendChild(css);
  const P=document.createElement('div'); P.id='looks'; P.hidden=true; P.setAttribute('role','dialog'); P.setAttribute('aria-label','Your character');
  const opt=(k,v,t)=>`<div class="lopt" role="option" tabindex="-1" data-${k}="${v}">${t}</div>`;
  const pick=(id,k,label,list)=>`<div class="lrow" id="${id}" data-k="${k}"><span class="lk">${label}</span><div class="ldd" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false"><span class="lv"></span><i>▾</i></div><div class="lpop" role="listbox" hidden>${list.map(([v,t])=>opt(k,v,t)).join('')}</div></div>`;
  const tint=(id,k,label,pal)=>`<div class="lrow" id="${id}" data-c="${k}"><span class="lk">${label}</span><div class="ldd" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false"><span><b class="lsw"></b><span class="lv"></span></span><i>▾</i></div><div class="lpop lgrid" role="listbox" hidden><div class="lg">${SW[pal].map(([h,t])=>`<b role="option" tabindex="-1" title="${t}" data-v="${h}" style="background:${h}"></b>`).join('')}</div><label class="lany">ANY COLOUR <input type="color" data-any="${k}"></label><div class="lgo"><button type="button" data-def="${k}">DEFAULT</button></div></div></div>`;
  P.innerHTML=`<h2>YOU</h2><div class="lnm"><input type="text" id="lname" maxlength="24" placeholder="your name"><button id="lclose">CLOSE</button></div>
    <h3>LOOK</h3>${pick('lform','form','BUILD',[['M','MALE'],['F','FEMALE']])}${pick('lhair','hair','HAIR',HAIRS)}${pick('lbeard','beard','BEARD',BEARDS)}${pick('lshoe','shoes','SHOES',[['1','ON'],['0','BAREFOOT']])}
    <h3>COLOURS</h3>${CROWS.map(([k,t,pal])=>tint('lc-'+k,k,t,pal)).join('')}
    <div id="ldesign-at"></div><div class="lhint" id="lshoek"></div>`;
  document.body.appendChild(P);
  const rows=[['#lform','form',[['M','MALE'],['F','FEMALE']]],['#lhair','hair',HAIRS],['#lbeard','beard',BEARDS],['#lshoe','shoes',[['1','ON'],['0','BAREFOOT']]]];
  LOOKS.style=(k,v)=>{ '@later'; if(k==='shoes')return LOOKS.shoes(v==='1'); L[k]=v; if(L.form==='F')L.beard=''; save(); W3.style={form:L.form,hair:L.hair,beard:L.beard}; W3.dress(); if(k==='form')LOOKS.refresh(); draw(); };
  // a colour: yours (null, or the default, puts the default back); the body's are its ramps, the clothes' the real clothes' dye
  const nameOf=(k,h)=>{ const pal=CROWS.find(r=>r[0]===k)[2], s=SW[pal].find(q=>q[0]===h); return s?s[1]:h.toUpperCase(); };
  let tq=0; LOOKS.paint=(k,h,keep)=>{ '@later'; if(!KS.includes(k))return; h=h&&HEX.test(h.toLowerCase())?h.toLowerCase():null; if(!h||h===COL0[k])delete L.col[k]; else L.col[k]=h; COL[k]=L.col[k]||COL0[k]; if(!keep)save();
    if(!tq)tq=requestAnimationFrame(()=>{ tq=0; tintAll(); recolor(); feet(); }); draw(); };
  const shut=()=>{ for(const r of P.querySelectorAll('.lrow')){ const p=r.querySelector('.lpop'); if(p&&!p.hidden){ p.hidden=true; r.querySelector('.ldd').setAttribute('aria-expanded','false'); } } };
  const open=r=>{ const p=r.querySelector('.lpop'), was=!p.hidden; shut(); if(was)return; p.hidden=false; r.querySelector('.ldd').setAttribute('aria-expanded','true'); const s=p.querySelector('[aria-selected=true]')||p.querySelector('[role=option]'); if(s)s.focus({preventScroll:true}); p.scrollIntoView({block:'nearest'}); };
  const choose=el=>{ const r=el.closest('.lrow'); if(!r)return; const x=EXT.find(q=>q.id===r.id); if(x)x.set(el.dataset.v); else if(r.dataset.c)LOOKS.paint(r.dataset.c,el.dataset.v); else { const k=r.dataset.k; LOOKS.style(k,el.dataset[k]); } shut(); draw(); r.querySelector('.ldd').focus({preventScroll:true}); };
  // a section another system adds to YOU, in the same dropdowns: rows [{id, label, list:[[value, name, font?]], get, set, swatch}] (a swatch row's values are colours), at the end with its heading, or first under LOOK (top, no heading); a row's refill(list) changes its choices
  const EXT=[], opts=x=>x.list.map(([v,t])=>`<div class="lopt" role="option" tabindex="-1" id="${x.id}-${v}" data-v="${v}">${t}</div>`).join('');
  LOOKS.section=(title,list,o={})=>{ const at=o.top?$('#lform'):$('#ldesign-at'), h=document.createElement('h3'), S=document.createElement('div'); h.textContent=title;
    S.innerHTML=list.map(x=>x.swatch?`<div class="lrow" id="${x.id}" data-sw="1"><span class="lk">${x.label}</span><div class="ldd" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false"><span><b class="lsw"></b><span class="lv"></span></span><i>▾</i></div><div class="lpop lgrid" role="listbox" hidden><div class="lg">${x.list.map(([v,t])=>`<b role="option" tabindex="-1" title="${t}" data-v="${v}" style="background:${v}"></b>`).join('')}</div></div></div>`
      :`<div class="lrow" id="${x.id}"><span class="lk">${x.label}</span><div class="ldd" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false"><span class="lv"></span><i>▾</i></div><div class="lpop" role="listbox" hidden>${opts(x)}</div></div>`).join('');
    if(o.top)at.before(S); else at.before(h,S); for(const x of list){ EXT.push(x); x.refill=l=>{ x.list=l; if(!x.swatch)S.querySelector('#'+x.id+' .lpop').innerHTML=opts(x); }; x.list.forEach(([v,,f],i)=>{ if(f)S.querySelector('#'+x.id).querySelectorAll('[role=option]')[i].style.setProperty('font-family',f,'important'); }); } return S; };
  P.addEventListener('click',e=>{ const d=e.target.closest('.ldd'); if(d)return open(d.closest('.lrow')); const o=e.target.closest('[role=option]'); if(o)return choose(o); const df=e.target.closest('[data-def]'); if(df){ LOOKS.paint(df.dataset.def,null); shut(); return; } if(!e.target.closest('.lpop'))shut(); });
  P.addEventListener('input',e=>{ const k=e.target.dataset&&e.target.dataset.any; if(k)LOOKS.paint(k,e.target.value,true); });
  P.addEventListener('change',e=>{ const k=e.target.dataset&&e.target.dataset.any; if(k)LOOKS.paint(k,e.target.value); });
  P.addEventListener('mousedown',e=>{ if(e.target.closest('.lrow'))e.stopPropagation(); });   // (a dropdown is not a handle to drag the window by)
  P.addEventListener('keydown',e=>{ const r=e.target.closest&&e.target.closest('.lrow'); if(!r||e.target.id==='lname')return; const k=e.key;
    if(k==='Escape'){ if(!r.querySelector('.lpop').hidden){ shut(); r.querySelector('.ldd').focus(); e.stopPropagation(); e.preventDefault(); } return; }
    if(k==='Enter'||k===' '){ if(e.target.type==='color'||e.target.tagName==='BUTTON')return; e.preventDefault(); e.stopPropagation(); if(e.target.classList.contains('ldd'))open(r); else if(e.target.getAttribute('role')==='option')choose(e.target); return; }
    if(/^Arrow/.test(k)&&e.target.getAttribute('role')==='option'){ const L2=[...r.querySelectorAll('[role=option]')], i=L2.indexOf(e.target), n=r.dataset.c?(k==='ArrowLeft'?-1:k==='ArrowRight'?1:k==='ArrowUp'?-8:8):(k==='ArrowUp'||k==='ArrowLeft'?-1:1); const t=L2[Math.max(0,Math.min(L2.length-1,i+n))]; if(t)t.focus(); e.preventDefault(); e.stopPropagation(); } });
  document.addEventListener('mousedown',e=>{ if(!P.hidden&&!P.contains(e.target))shut(); },true);
  const draw=()=>{ '@later'; $('#lname').value=L.name; const val={form:L.form,hair:L.hair,beard:L.beard,shoes:L.bare?'0':'1'};
    for(const [id,k,list] of rows){ const r=$(id), v=val[k]; r.querySelector('.lv').textContent=(list.find(q=>q[0]===v)||list[0])[1]; for(const o of r.querySelectorAll('[role=option]'))o.setAttribute('aria-selected',String(o.dataset[k]===v)); }
    $('#lbeard').hidden=L.form==='F';
    for(const [k] of CROWS){ const r=$('#lc-'+k), h=COL[k]; r.querySelector('.lsw').style.background=h; r.querySelector('.lv').textContent=nameOf(k,h); for(const o of r.querySelectorAll('[role=option]'))o.setAttribute('aria-selected',String(o.dataset.v===h)); const a=r.querySelector('[data-any]'); if(document.activeElement!==a)a.value=h; }
    for(const x of EXT){ const r=$('#'+x.id), v=String(x.get()), it=x.list.find(q=>String(q[0])===v)||x.list[0]; r.querySelector('.lv').textContent=it[1]; if(x.swatch)r.querySelector('.lsw').style.background=it[0]; else if(it[2])r.querySelector('.lv').style.setProperty('font-family',it[2],'important'); for(const o of r.querySelectorAll('[role=option]'))o.setAttribute('aria-selected',String(o.dataset.v===v)); if(x.after)x.after(); }
    $('#lshoek').textContent='SHOES OFF / ON: KEY '+UI.keyOf('shoes').toUpperCase(); };
  $('#lname').oninput=e=>{ L.name=e.target.value; save(); };
  $('#lname').addEventListener('keydown',e=>e.stopPropagation());
  $('#lclose').onclick=()=>{ shut(); P.hidden=true; };
  // worn clothes dye your shirt or trousers (EQUIP sets LOOKS.over from the item's colour)
  LOOKS.dye=()=>{ apply(); recolor(); };
  LOOKS.open=()=>{ shut(); draw(); P.hidden=false; }; LOOKS.L=L; LOOKS.COL=COL;
  const hit=new THREE.Mesh(new THREE.BoxGeometry(.8*TILE,2.2*TILE,.8*TILE),new THREE.MeshBasicMaterial({visible:false})); scene.add(LEVELS.own(hit,'*'));
  renderer.domElement.addEventListener('pointerdown',()=>{ hit.position.set(pos.x,SHARED.py+1.1*TILE,pos.z); hit.updateMatrixWorld(); },true);
  UI.thing({name:'YOU',ghost:1,obj:hit,reach:99,tall:2,act:()=>LOOKS.open()});
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
