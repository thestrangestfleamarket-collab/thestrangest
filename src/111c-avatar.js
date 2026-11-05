// THE POLYFORK AVATAR: AVATAR, a body you dress (owner, 5 Nov 2026: "a playable avatar based on the polyfork base character"): Polyfork's man or woman on your rig, three builds, a height, and a wardrobe of 87 pieces from the cast, each in its own colours; your look is kept with your account and other players see it.
import {THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {LOOKS, ONLINE} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {SYS} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
const AVATAR={}; window.AVATAR=AVATAR;
{ const I=__DATA__("data/pfavatar.json"), LOAD={m:__LAZY__("data/pfavatar-m.json"),f:__LAZY__("data/pfavatar-f.json")}, D={}, WAIT={};
  const SLOTS=[['hair','HAIR'],['face','BEARD'],['eyes','GLASSES'],['hat','HAT'],['top','TOP'],['coat','JACKET'],['bottom','BOTTOMS'],['feet','SHOES'],['belt','BELT'],['neck','NECK'],['hands','HANDS']];
  const SKINS=['f3d5bd','e6b892','d9a984','c08a64','a26a45','7e4c2f','5c3622','3e2416'], HAIRC=['1d1712','3b2a1e','5a3a24','8a5a32','b98a4e','d8c28a','8c8c8c','e8e4dc'];
  const BUILDN=['SLIM','MEDIUM','BROAD'], byN=new Map(I.pieces.map(p=>[p.n,p])), nOf=(slot,label)=>{ const p=I.pieces.find(q=>q.slot===slot&&q.label===label); return p?p.n:null; };
  const DEF=()=>({f:'m',b:1,h:100,skin:'d9a984',hair:'4b2519',w:{hair:[nOf('hair','SHORT'),''],top:[nOf('top','T-SHIRT'),''],bottom:[nOf('bottom','TROUSERS'),''],feet:[nOf('feet','SNEAKERS'),'']}});

  /* ---------- a look as a short code for the other players: figure.build.height.skin.hair, then each slot (piece number in base 36, ~colour) ---------- */
  const code=L=>[L.f,L.b,L.h,L.skin,L.hair,...SLOTS.map(([s])=>{ const w=L.w[s]; return w&&w[0]!=null?w[0].toString(36)+(w[1]?'~'+w[1]:''):''; }),L.bare?'1':''].join('.');   // (last: barefoot)
  const hex=s=>/^[0-9a-f]{6}$/.test(s||'')?s:null;
  const decode=c=>{ const a=String(c||'').split('.'), L=DEF(); if(a.length<5)return L;
    L.f=a[0]==='f'?'f':'m'; L.b=Math.min(2,Math.max(0,parseInt(a[1])||0)); L.h=Math.min(110,Math.max(90,parseInt(a[2])||100)); L.skin=hex(a[3])||L.skin; L.hair=hex(a[4])||L.hair; L.w={};
    if(a[5+SLOTS.length]==='1')L.bare=true;
    SLOTS.forEach(([s],i)=>{ const v=a[5+i]; if(!v)return; const [n,col]=v.split('~'), p=byN.get(parseInt(n,36)); if(p&&p.slot===s&&p.figs.includes(L.f))L.w[s]=[p.n,hex(col)||'']; });
    return L; };

  /* ---------- the figure's data, fetched once someone wears it ---------- */
  const load=f=>D[f]?Promise.resolve(D[f]):(WAIT[f]||(WAIT[f]=LOAD[f]().then(J=>{ J.byN=new Map(J.pieces.map(p=>[p.n,p])); D[f]=J; return J; })));
  const dec=v=>v.$||(v.$={pos:I16(v.pos),tri:U16(v.tri),bone:B64(v.bone),w:B64(v.w),zone:B64(v.zone),reg:v.reg?B64(v.reg):null});
  // Polyfork's own rule for which of the body's regions its clothes hide (its culled())
  const culled=has=>{ const A=has('arms')&&has('hands'); return [has('trunk')&&has('waist'),has('waist')&&has('seat'),has('briefs'),has('legs')&&(!has('shins')||has('feet')),has('feet'),A,
    has('upperArms')&&has('hands')&&!A,has('upperArms')&&has('armCut')&&!has('hands')&&!has('arms'),has('ears'),has('eyes')]; };
  const lin=h=>new THREE.Color('#'+h);
  function geoFor(J,L,bare){ const worn=[]; for(const [s] of SLOTS){ const w=L.w[s], p=w&&J.byN.get(w[0]); if(p&&!(bare&&s==='feet'))worn.push([s,p,w[1]]); }   // (barefoot: your shoes off, LOOKS.shoes)
    const cov=new Set(); for(const [,p] of worn)for(const c of p.covers)cov.add(c); const hide=culled(c=>cov.has(c));
    const hat=worn.find(x=>x[0]==='hat'), coat=worn.find(x=>x[0]==='coat');
    const parts=[{v:J.body.v[L.b],zones:J.body.zones,pal:J.body.pal,main:null,col:null,slot:'body'}];
    for(const [s,p,c] of worn){ if(s==='hair'&&cov.has('hair'))continue;
      const alt=(s==='hair'&&hat||s==='top'&&coat&&coat[1].covers.includes('sleeves'))&&p.alt&&p.alt[L.b], v=alt||p.v[L.b]; if(v)parts.push({v,zones:p.zones,pal:p.pal,main:p.main,col:c,slot:s}); }
    let nf=0; const D_=parts.map(P=>{ const d=dec(P.v); let k=0; for(let t=0;t<d.tri.length/3;t++)if(!(d.reg&&d.reg[t]<255&&hide[d.reg[t]]))k++; nf+=k; return d; });
    const pos=new Float32Array(nf*9), nor=new Float32Array(nf*9), col=new Float32Array(nf*9), bi=new Float32Array(nf*6), bw=new Float32Array(nf*3), va=new THREE.Vector3(), vb=new THREE.Vector3(), vc=new THREE.Vector3(), n=new THREE.Vector3(), e=new THREE.Vector3();
    let f=0;
    parts.forEach((P,pi)=>{ const d=D_[pi], v=P.v, Q=d.pos, X=new Float32Array(Q.length); for(let i=0;i<Q.length;i++)X[i]=(Q[i]+32500)*v.sc+v.lo[i%3];
      const C=P.zones.map((z,i)=>{ if(z==='skin')return lin(L.skin); if(P.slot==='body'&&z==='brow')return lin(L.hair);
        if((P.slot==='hair'||P.slot==='face')&&P.main&&i===P.main[0])return lin(L.hair); if(P.col&&P.main&&i===P.main[0])return lin(P.col); return lin(String(P.pal[i]).slice(1)); });
      for(let t=0;t<d.tri.length/3;t++){ if(d.reg&&d.reg[t]<255&&hide[d.reg[t]])continue; const ix=[d.tri[t*3],d.tri[t*3+1],d.tri[t*3+2]];
        va.fromArray(X,ix[0]*3); vb.fromArray(X,ix[1]*3); vc.fromArray(X,ix[2]*3); n.subVectors(vb,va).cross(e.subVectors(vc,va)).normalize();
        ix.forEach((q,j)=>{ const o=f*3+j, c=C[d.zone[q]]||C[0]; pos.set([X[q*3],X[q*3+1],X[q*3+2]],o*3); nor.set([n.x,n.y,n.z],o*3); col.set([c.r,c.g,c.b],o*3); bi.set([d.bone[q*2],d.bone[q*2+1]],o*2); bw[o]=d.w[q]/255; }); f++; } });
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3));
    g.setAttribute('bi',new THREE.BufferAttribute(bi,2)); g.setAttribute('bw',new THREE.BufferAttribute(bw,1)); g.computeBoundingSphere(); return g; }
  const empty=()=>{ const g=new THREE.BufferGeometry(); for(const [k,s] of [['position',3],['normal',3],['color',3],['bi',2],['bw',1]])g.setAttribute(k,new THREE.BufferAttribute(new Float32Array(0),s)); return g; };
  // a body's skeleton for a figure and a height (taller: the same body drawn bigger on the rig)
  const fitTo=(body,L)=>{ const S=I.skel[L.f], {off,binv}=BODIES.skeleton(S.origin,S.rest); Object.assign(body,{height:S.height*100/L.h,hipY:S.hipY,off,binv,contact:true}); delete body._calG; return BODIES.fit(body); };   // (contact: rests on what the rig rests on, 111a)

  /* ---------- you ---------- */
  let L=DEF(); try{ const c=OWNED.get('pfav'); if(c)L=decode(c); }catch(e){}
  const save=()=>{ try{ OWNED.set('pfav',code({...L,bare:false})); }catch(e){} };
  // what you wear on top of your choice: bare feet (LOOKS.shoes), and worn clothes' dyes (EQUIP: a shirt, jacket or coat colours your jacket, or your top without one; trousers your bottoms)
  const mine=()=>{ const o=LOOKS.over||{}, w={...L.w}; const up=w.coat?'coat':w.top?'top':null; if(o.shirt&&up)w[up]=[w[up][0],o.shirt.replace('#','')]; if(o.pants&&w.bottom)w.bottom=[w.bottom[0],o.pants.replace('#','')]; return {...L,w,bare:!!(LOOKS.L&&LOOKS.L.bare)}; };
  const VAR=new Map();
  const body={key:'avatar',label:'AVATAR',playable:true,geo:empty,look:()=>code(mine()),
    variant:c=>{ const k=String(c); let b=VAR.get(k); if(b)return b; const M=decode(k), J=D[M.f];
      if(!J){ load(M.f).then(()=>{ if(ONLINE.refig)ONLINE.refig('b:avatar'); }).catch(e=>console.warn('AVATAR',e)); return null; }
      b=fitTo({key:'avatar~'+k,geo:()=>geoFor(J,M,M.bare)},M); VAR.set(k,b); return b; }};
  AVATAR.code=()=>code(L); AVATAR.decode=decode; AVATAR.L=()=>L; AVATAR.ready=()=>!!D[L.f];
  let gen=0;
  const refresh=()=>{ const my=++gen; return load(L.f).then(J=>{ if(my!==gen)return; fitTo(body,L); const M=mine(); body.GEO=geoFor(J,M,M.bare); draw(); }).catch(e=>console.warn('AVATAR',e)); };
  AVATAR.set=o=>{ L=Object.assign(L,o); if(o.f){ for(const s in L.w)if(L.w[s]&&!byN.get(L.w[s][0]).figs.includes(L.f))delete L.w[s]; } save(); return refresh(); };
  AVATAR.wear=(slot,n,c)=>{ if(n==null)delete L.w[slot]; else L.w[slot]=[n,c||(L.w[slot]&&L.w[slot][0]===n?L.w[slot][1]:'')]; save(); return refresh(); };

  /* ---------- YOU: the avatar's lines (LOOKS.add) — figure, build, height, skin and hair colour on LOOK; a piece and its colour for each slot on WEAR ---------- */
  const $=s=>document.querySelector(s);
  const css=document.createElement('style'); css.textContent=`#looks .sw{padding:3px!important} #looks .sw i{display:block;width:16px;height:16px}
    #looks .avw{display:grid;grid-template-columns:minmax(0,1fr) 34px;gap:4px;align-items:center} #looks .avw select{font:inherit;color:inherit;background:#0b0d13;border:2px solid #2a3040;padding:2px;min-width:0;width:100%}
    #looks input[type=color]{width:30px;height:24px;padding:0;border:2px solid #2a3040;background:#0b0d13} #looks input[type=range]{width:min(220px,100%)} #looks .dim{color:var(--dim,#8a8f9c)}`;
  document.head.appendChild(css);
  const stop=el=>el.addEventListener('keydown',e=>e.stopPropagation());
  const el=(id,html,cls='row')=>{ const d=document.createElement('div'); d.className=cls; if(id)d.id=id; d.innerHTML=html; return d; };
  let made=false;
  function panel(){ if(made)return true; if(!LOOKS.add||!$('#looks'))return false; made=true; const A={who:'avatar'};
    LOOKS.add('avf','FIGURE',el('lavf','<button data-f="m">MAN</button><button data-f="f">WOMAN</button>'),{...A,order:1});
    LOOKS.add('avb','BUILD',el('lavb',BUILDN.map((t,i)=>`<button data-b="${i}">${t}</button>`).join('')),{...A,order:2});
    LOOKS.add('avh','HEIGHT',el(null,'<input type="range" id="lavh" min="90" max="110" step="1" aria-label="height"><span id="lavhv" class="dim"></span>'),{...A,order:3});
    LOOKS.add('avs','SKIN',el('lavs',SKINS.map(h=>`<button class="sw" data-c="${h}" aria-label="skin #${h}"><i style="background:#${h}"></i></button>`).join('')+'<input type="color" id="lavsc" aria-label="any skin colour">'),{...A,order:4});
    LOOKS.add('avc','HAIR COLOUR',el('lavc',HAIRC.map(h=>`<button class="sw" data-c="${h}" aria-label="hair #${h}"><i style="background:#${h}"></i></button>`).join('')+'<input type="color" id="lavcc" aria-label="any hair colour">'),{...A,order:5});
    LOOKS.add('avwear','OUTFIT',el(null,'<button id="lavgo">CHOOSE WHAT YOU WEAR</button><span id="lavw" class="dim"></span>'),{...A,order:6});
    SLOTS.forEach(([s,t],i)=>LOOKS.add('w-'+s,t,el(null,`<select id="lav-${s}" aria-label="${t}"></select><input type="color" id="lavk-${s}" aria-label="${t} colour">`,'avw'),{...A,tab:'wear',order:i}));
    $('#lavgo').onclick=()=>LOOKS.tab('wear');
    $('#lavf').onclick=e=>{ const b=e.target.closest('button'); if(b)AVATAR.set({f:b.dataset.f}); };
    $('#lavb').onclick=e=>{ const b=e.target.closest('button'); if(b)AVATAR.set({b:+b.dataset.b}); };
    const h=$('#lavh'); stop(h); h.oninput=()=>{ $('#lavhv').textContent=' '+h.value+'%'; }; h.onchange=()=>AVATAR.set({h:+h.value});
    $('#lavs').onclick=e=>{ const b=e.target.closest('button'); if(b)AVATAR.set({skin:b.dataset.c}); }; $('#lavsc').onchange=e=>AVATAR.set({skin:e.target.value.slice(1)});
    $('#lavc').onclick=e=>{ const b=e.target.closest('button'); if(b)AVATAR.set({hair:b.dataset.c}); }; $('#lavcc').onchange=e=>AVATAR.set({hair:e.target.value.slice(1)});
    for(const [s] of SLOTS){ const sel=$('#lav-'+s), k=$('#lavk-'+s); stop(sel);
      sel.onchange=()=>AVATAR.wear(s,sel.value===''?null:+sel.value); k.onchange=()=>{ const w=L.w[s]; if(w)AVATAR.wear(s,w[0],k.value.slice(1)); }; }
    return true; }
  const on=(b,v)=>{ b.setAttribute('aria-pressed',String(v)); b.setAttribute('aria-selected',String(v)); };   // (the menus' look marks the chosen one by aria-selected)
  function draw(){ if(!panel())return; if(BODIES.pick()!=='avatar')return LOOKS.layout();
    for(const b of $('#lavf').children)on(b,b.dataset.f===L.f); for(const b of $('#lavb').children)on(b,+b.dataset.b===L.b);
    $('#lavh').value=L.h; $('#lavhv').textContent=' '+L.h+'%'; $('#lavsc').value='#'+L.skin; $('#lavcc').value='#'+L.hair;
    for(const b of $('#lavs').children)if(b.dataset.c)on(b,b.dataset.c===L.skin); for(const b of $('#lavc').children)if(b.dataset.c)on(b,b.dataset.c===L.hair);
    $('#lavw').textContent=D[L.f]?'':' LOADING…';
    for(const [s] of SLOTS){ const list=I.pieces.filter(p=>p.slot===s&&p.figs.includes(L.f)), sel=$('#lav-'+s), k=$('#lavk-'+s), w=L.w[s], J=D[L.f];
      sel.closest('.lr').dataset.off=list.length?'':'1'; sel.innerHTML='<option value="">NONE</option>'+list.map(p=>`<option value="${p.n}">${p.label}</option>`).join(''); sel.value=w?String(w[0]):'';
      const p=w&&J&&J.byN.get(w[0]); k.style.visibility=!p||s==='hair'||s==='face'?'hidden':''; if(p&&s!=='hair'&&s!=='face')k.value='#'+(w[1]||String(p.pal[p.main[0]]).slice(1)); }
    LOOKS.layout(); }
  AVATAR.draw=draw; LOOKS.onChange=()=>refresh();
  load(L.f).catch(()=>{});   // (your figure's wardrobe starts coming with the page: you are only ever the avatar)
  SYS.onStart(()=>{ LOOKS.who=()=>BODIES.pick()==='avatar'?'avatar':'walker'; fitTo(body,L); BODIES.add(body); BODIES.onPick.push(k=>{ if(k==='avatar')refresh(); draw(); }); if(BODIES.pick()==='avatar')refresh(); draw();
    const P=$('#looks'); if(P)new MutationObserver(()=>{ if(!P.hidden)draw(); }).observe(P,{attributes:true,attributeFilter:['hidden']}); },'111c-avatar'); }
