// THE BOOKSTORE: a one-floor lending library kept by the Professor: 16 Polyfork bookcases round its walls (three of the most read, then one per skill), of 4 shelves of 10 real public-domain books (data/library.json); double-click a case to read its spines; borrow up to five free and read them anywhere; a book's text (Project Gutenberg) downloads only when it is opened.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INSPECT, pos, PS2, ROOMS, SFX, TABLES, UI, USE} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {STORE, SYS} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
import {MSHOP} from './059i-mshops.js';
import {KIT} from './068-kit.js';
const LIB={data:null,max:5,inside:[]}; window.LIB=LIB;   // inside: what else furnishes the shop ({A,F,K,W,D})
{ const BJ=__LAZY__("data/library.json"), say=(t,c)=>SAY(t,c||'#e8d6a8'), TM=.924;
  LIB.files={};   // id -> the cover's file (and spine's, id+'~s'), filled below from the baked list
  const load=()=>LIB.data?Promise.resolve(LIB.data):BJ().then(d=>{ d.books=[]; for(const c of d.cases)for(const b of c.books){ b.genre=c.name; b.case=c.id; d.books.push(b); } LIB.data=d; LIB.by=Object.fromEntries(d.books.map(b=>[b.id,b])); names(); gone(); return d; });   // the shop's cases, each one genre of forty
  const S={v:1,b:[],p:{},h:[]}; try{ const D=JSON.parse(OWNED.get('library')||'null'); if(D&&D.v===1)Object.assign(S,D); }catch(e){} const save=()=>OWNED.set('library',JSON.stringify(S));
  LIB.S=S; LIB.load=load; LIB.save=save;   // S.h: your own books (your bookcase's, 150fh) off their shelf and in your pack
  const spineF=id=>LIB.files[id+'~s']||'';
  // a book's cover: its edition's scan when there is a public-domain one, else a cloth binding drawn from its title and author, as plain books were bound
  const DRAWN={}, drawn=b=>DRAWN[b.id]||(DRAWN[b.id]=(()=>{ const c=document.createElement('canvas'); c.width=300; c.height=450; const g=c.getContext('2d'); g.fillStyle=b.col||'#5a3a24'; g.fillRect(0,0,300,450);
    for(let i=0;i<2600;i++){ g.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},${Math.random()<.5?0:255},.035)`; g.fillRect(Math.random()*300,Math.random()*450,2,2); }
    g.strokeStyle='#d8b860'; g.lineWidth=3; g.strokeRect(18,18,264,414); g.lineWidth=1; g.strokeRect(26,26,248,398); g.fillStyle='#e6c878'; g.textAlign='center';
    const words=(t,y,sz,max)=>{ g.font=`${sz}px Georgia,serif`; const ws=String(t).split(' '); let l='', yy=y; for(const w of ws){ const tt=l?l+' '+w:w; if(g.measureText(tt).width>max&&l){ g.fillText(l,150,yy); l=w; yy+=sz*1.15; } else l=tt; } g.fillText(l,150,yy); return yy; };
    const y=words(String(b.t).toUpperCase(),150,26,220); g.fillRect(110,y+26,80,2); words(String(b.a).toUpperCase(),y+64,15,220); return c.toDataURL('image/jpeg',.85); })());
  const cover=id=>LIB.files[id]||(LIB.by&&LIB.by[id]?drawn(LIB.by[id]):'');
  // a borrowed book is a thing in your pack you can open anywhere
  const names=()=>{ if(!LIB.data)return; FORAGE.add({names:Object.fromEntries(LIB.data.books.flatMap(b=>[['lb_'+b.id,'LIBRARY BOOK: '+b.t],['hb_'+b.id,'YOUR BOOK: '+b.t]]))}); };
  FORAGE.ROWB.push(id=>/^[lh]b_/.test(id)?[['READ','lread']]:[]);
  FORAGE.ACT.lread=id=>LIB.read(id.slice(3));
  if(window.INSPECT&&INSPECT.kinds)INSPECT.kinds.push({is:id=>/^[lh]b_/.test(id),make:id=>{ const b=LIB.by&&LIB.by[id.slice(3)]; const c=b&&b.col?parseInt(b.col.slice(1),16):0x6a3a2a; return INSPECT.shape('book',c,0xf2ead6); }});
  if(S.b.length||S.h.length)load().catch(()=>{});
  const borrowed=id=>S.b.includes(id);
  // a borrowed book no longer on the shelves goes back by itself
  const gone=()=>{ const g=S.b.filter(id=>!LIB.by[id]); if(!g.length)return; S.b=S.b.filter(id=>LIB.by[id]); for(const id of g)if(FORAGE.has('lb_'+id))FORAGE.take('lb_'+id,FORAGE.has('lb_'+id)); save(); };
  LIB.borrow=id=>{ '@later'; if(borrowed(id))return say('THAT ONE IS ALREADY IN YOUR PACK.'); if(S.b.length>=LIB.max)return say('FIVE AT A TIME. BRING ONE BACK FIRST.','#c8a090');
    S.b.push(id); save(); FORAGE.give('lb_'+id,1); if(FORAGE.draw)FORAGE.draw(); say('BORROWED: '+LIB.by[id].t+'. READ IT ANYWHERE FROM YOUR PACK.'); if(SFX)SFX.play('page',{vol:.5}); };
  LIB.giveBack=id=>{ if(!borrowed(id))return; S.b=S.b.filter(x=>x!==id); save(); if(FORAGE.has('lb_'+id))FORAGE.take('lb_'+id,FORAGE.has('lb_'+id)); if(FORAGE.draw)FORAGE.draw(); say('RETURNED: '+LIB.by[id].t+'.'); };

  /* ---------- the windows: the catalogue (every cover, by kind or a search) and one book's card ---------- */
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const P=document.createElement('div'); P.id='libp'; P.hidden=true;
  P.style.cssText='position:fixed;left:50%;top:6%;transform:translateX(-50%);width:min(760px,94vw);max-height:84vh;overflow:auto;z-index:24;padding:12px 14px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#3b2a1e;background:#ece5d3;border:3px solid #3b2a1e;zoom:var(--uiz,1)';
  const css=document.createElement('style'); css.textContent='#libr[hidden],#libp[hidden]{display:none!important} #libp .btn,#libr .btn{font:inherit;padding:4px 8px;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer} #libp .btn.on{background:#3b2a1e;color:#ece5d3} #libp .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:10px;margin-top:10px} #libp .bk{cursor:pointer;text-align:center} #libp .bk img{width:88px;height:128px;object-fit:cover;border:1px solid #3b2a1e;background:#cfc4ae;box-shadow:2px 2px 0 #3b2a1e55} #libp .bk div{font-size:9px;margin-top:3px;line-height:1.2} #libp input{font:inherit;padding:4px;border:2px solid #3b2a1e;background:#f6f0e2;width:180px} #libp .mine{outline:3px solid #b8862a}';
  document.head.appendChild(css); document.body.appendChild(P);
  let tab='ALL', q='', home=null;   // home: a shelf of your own (150fh) {name, ids(), off(id), take(id), put(id)}, browsed in the same windows
  const books=()=>home?home.ids().map(i=>LIB.by[i]).filter(Boolean):LIB.data.books, mine=id=>home?home.off(id):borrowed(id);
  const list=()=>books().filter(b=>(tab==='ALL'||(tab==='BORROWED'||tab==='OFF THE SHELF'?mine(b.id):String(b.genre).toUpperCase()===tab))&&(!q||(b.t+' '+b.a).toLowerCase().includes(q.toLowerCase())));
  const drawCat=()=>{ '@later'; const B=books(), G=['ALL',home?'OFF THE SHELF':'BORROWED',...[...new Set(B.map(b=>String(b.genre).toUpperCase()))]];
    P.innerHTML=`<div><b>${home?esc(home.name):'THE BOOKSTORE · A LENDING LIBRARY'}</b> <button class="btn" data-a="x" style="float:right">DONE</button></div>
      <div style="margin:6px 0;color:#6a4a32">${home?`${B.length} BOOKS, A FEW FROM EVERY CASE OF THE BOOKSTORE. ${B.filter(b=>mine(b.id)).length} OFF THE SHELF, IN YOUR PACK.`:`${LIB.data.books.length} BOOKS, ALL FREE TO BORROW. YOU HAVE ${S.b.length} OF ${LIB.max}.`}</div>
      <div>${G.map(g=>`<button class="btn ${g===tab?'on':''}" data-t="${esc(g)}">${esc(g)}</button>`).join(' ')} <input data-q placeholder="TITLE OR AUTHOR" value="${esc(q)}"></div>
      <div class="grid">${list().map(b=>`<div class="bk ${mine(b.id)?'mine':''}" data-b="${b.id}"><img loading="lazy" alt="" src="${esc(cover(b.id))}"><div>${esc(b.t)}<br><span style="color:#7a5a40">${esc(b.a)}</span></div></div>`).join('')||'<div>NOTHING ON THE SHELF BY THAT NAME.</div>'}</div>`; };
  const drawCard=id=>{ '@later'; const b=LIB.by[id], m=mine(id), pg=S.p[id];
    P.innerHTML=`<div><button class="btn" data-a="back">&lt; THE SHELVES</button> <button class="btn" data-a="x" style="float:right">DONE</button></div>
      <div style="display:flex;gap:14px;margin-top:10px;flex-wrap:wrap"><img src="${esc(cover(id))}" alt="" style="width:200px;border:2px solid #3b2a1e;background:#cfc4ae">
      <div style="flex:1;min-width:220px"><div style="font-size:14px"><b>${esc(b.t)}</b></div><div style="margin:4px 0 8px">${esc(b.a)}${b.y?' · '+b.y:''}</div>
      <div style="color:#6a4a32">${LIB.files[id]?(b.txt?'THE COVER: ITS OWN FIRST PAGE':'THE COVER: '+esc(b.ed||'an early edition')):'A PLAIN CLOTH BINDING'}</div><div style="color:#6a4a32;margin-top:4px">${b.pages?'ABOUT '+b.pages+' PAGES · ':''}${b.y?b.y+' · ':''}${esc(String(b.genre).toUpperCase())}</div>
      <div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap"><button class="btn" data-a="read" data-b="${id}">${pg?'READ ON':'READ HERE'}</button>
      ${home?(m?`<button class="btn" data-a="put" data-b="${id}">PUT IT BACK ON THE SHELF</button>`:`<button class="btn" data-a="take" data-b="${id}">TAKE IT OFF THE SHELF</button>`):m?`<button class="btn" data-a="ret" data-b="${id}">GIVE IT BACK</button>`:`<button class="btn" data-a="bor" data-b="${id}">BORROW IT (FREE)</button>`}</div>
      <div style="margin-top:10px;color:#8a6a50;font-size:9px">${b.txt?`THE TEXT: ${esc(b.src)} · ${esc(b.lic)} · ${esc(String(b.page).replace(/^https?:\/\/(www\.)?/,'').split('/')[0])} · DOWNLOADED WHEN YOU OPEN IT.`:"THE TEXT: PROJECT GUTENBERG'S EDITION, DOWNLOADED WHEN YOU OPEN IT."}</div></div></div>`; };
  let atShop=false;
  LIB.open=(id,shop=true,h=null)=>load().then(()=>{ atShop=shop; if(h!==home){ home=h; tab='ALL'; q=''; } P.hidden=false; if(id&&LIB.by[id])drawCard(id); else drawCat(); }).catch(e=>{ console.warn('LIB: the list did not load',e); say('THE CATALOGUE IS STUCK. TRY AGAIN.','#c8a090'); });
  LIB.close=()=>{ P.hidden=true; };
  P.addEventListener('click',e=>{ '@later'; const t=e.target.closest('[data-a],[data-t],[data-b]'); if(!t)return; const a=t.dataset.a;
    if(a==='x')return LIB.close(); if(a==='back')return drawCat(); if(t.dataset.t){ tab=t.dataset.t; return drawCat(); }
    const id=t.dataset.b; if(a==='read'){ LIB.close(); return LIB.read(id); } if(a==='bor'){ if(!atShop)return say('BORROW IT AT THE BOOKSTORE.'); LIB.borrow(id); return drawCard(id); } if(a==='ret'){ LIB.giveBack(id); return drawCard(id); } if(home&&(a==='take'||a==='put')){ home[a](id); return drawCard(id); }
    if(id)drawCard(id); });
  P.addEventListener('input',e=>{ if(e.target.dataset.q==null)return; q=e.target.value; const c=e.target.selectionStart; drawCat(); const i=P.querySelector('[data-q]'); i.focus(); i.setSelectionRange(c,c); });
  for(const ev of ['keydown','keyup','keypress'])P.addEventListener(ev,e=>{ if(e.key==='Escape'&&ev==='keydown')LIB.close(); e.stopPropagation(); });

  /* ---------- the reader (after the old game's: a chapter at a time on a page you scroll, owner 5 Nov 2026 "very easy to read the whole book ... fully featured"): its contents, a slider through the whole book,
     search, bookmarks, the type's size, face, spacing and width, paper, sepia or night; your place and your settings kept with what you own ---------- */
  const TX={}, R=document.createElement('div'); R.id='libr'; R.hidden=true; R.tabIndex=-1; document.body.appendChild(R);
  { const st=document.createElement('style'); st.textContent=`#libr{position:fixed;inset:0;z-index:25;display:flex;flex-direction:column;outline:none;background:var(--rb);color:var(--rf);font:14px Georgia,serif}
    #libr[hidden]{display:none!important} #libr *{box-sizing:border-box} #libr .bar{display:flex;gap:6px;align-items:center;padding:8px max(12px,env(safe-area-inset-left,0px));background:var(--rbar);color:var(--rf);font:11px Silkscreen,monospace;letter-spacing:.3px;flex-wrap:wrap}
    #libr .bar .t{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis} #libr button{font:11px Silkscreen,monospace;padding:6px 9px;background:var(--rbtn);color:var(--rf);border:2px solid var(--rline);cursor:pointer} #libr button.on{background:var(--rf);color:var(--rb)}
    #libr .scroll{flex:1;overflow-y:auto;overscroll-behavior:contain} #libr .pg{margin:0 auto;padding:28px 22px 60px;white-space:normal;color:var(--rf)} #libr .pg h2{font-weight:600;text-align:center;margin:10px 0 28px;color:var(--rf)} #libr .pg p{margin:0 0 .9em;text-indent:1.4em;color:var(--rf);text-align:justify;hyphens:auto}
    #libr .pg p.hit{background:var(--rhit)} #libr .end{text-align:center;margin:30px 0} #libr input[type=range]{flex:1;min-width:120px} #libr .side{position:absolute;top:44px;right:0;bottom:48px;width:min(380px,92vw);overflow-y:auto;background:var(--rbar);border-left:2px solid var(--rline);padding:12px;font:13px Georgia,serif;color:var(--rf)}
    #libr .side .it{padding:7px 6px;border-bottom:1px solid var(--rline);cursor:pointer} #libr .side .it:hover,#libr .side .it.cur{background:var(--rhit)} #libr .side input[type=text]{width:100%;font:14px Georgia,serif;padding:6px;background:var(--rb);color:var(--rf);border:2px solid var(--rline)} #libr .row{display:flex;gap:6px;align-items:center;margin:10px 0;flex-wrap:wrap} #libr .row>span{width:80px;font:11px Silkscreen,monospace}`;
    document.head.appendChild(st); }
  const THEMES={paper:{rb:'#f4ecd8',rf:'#2a2018',rbar:'#e6dcc4',rbtn:'#f4ecd8',rline:'#8a7a60',rhit:'rgba(216,170,60,.35)'},sepia:{rb:'#e8d6b0',rf:'#3a2a18',rbar:'#d8c49a',rbtn:'#e8d6b0',rline:'#7a6040',rhit:'rgba(180,120,40,.35)'},night:{rb:'#16130f',rf:'#d8ccb4',rbar:'#221d17',rbtn:'#16130f',rline:'#5a4c38',rhit:'rgba(216,170,60,.25)'}};
  const FACES={serif:'Georgia,"Times New Roman",serif',sans:'"Helvetica Neue",Arial,sans-serif',mono:'"Courier New",monospace'};
  const SET=()=>S.set||(S.set={fs:19,face:'serif',lh:1.6,w:38,theme:'paper'});
  const url=b=>b.txt?LIB.files[b.id+'~t']:location.protocol==='file:'?'https://www.gutenberg.org/cache/epub/'+b.pg+'/pg'+b.pg+'.txt':'/book/'+b.pg+'.txt';
  LIB.url=url;
  // the book's own words: without Project Gutenberg's header and licence, its paragraphs joined back from the hard-wrapped lines
  const clean=txt=>{ '@later'; txt=txt.replace(/\r/g,''); const s=txt.search(/\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG[^\n]*\n/i); if(s>=0)txt=txt.slice(txt.indexOf('\n',s)+1); const e=txt.search(/\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG/i); if(e>=0)txt=txt.slice(0,e);
    return txt.split(/\n\s*\n/).map(p=>p.replace(/\s*\n\s*/g,' ').replace(/_/g,'').trim()).filter(Boolean); };
  // its chapters: the headings the book itself uses (a contents list at the front, its headings close together, is left in the text); a book without any, in parts of sixty paragraphs
  const HEAD=/^(chapter|book|part|act|scene|stave|canto|letter|section|volume)\b[\s.:—-]*([0-9ivxlcdm]+|the |one|two|three|four|five|six|seven|eight|nine|ten|first|second|third|[a-z]+)?/i, PROSE=/^\w+\s+[a-z]+\s+[a-z]/, ROMAN=/^[ivxlcdm]+\.?$/i;
  const chapters=(P,modern)=>{ '@later'; const c=[]; P.forEach((p,i)=>{ if(p.length<=90&&((HEAD.test(p)&&!PROSE.test(p))||ROMAN.test(p)))c.push(i); });
    const nm=i=>P[i].toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,40), later=new Map(); c.forEach(i=>later.set(nm(i),i));
    let prevToc=false; const keep=c.filter((i,k)=>{ const nx=c[k+1], dup=later.get(nm(i))!==i, adj=nx!=null&&nx-i<=2, run=nx!=null&&P.slice(i+1,nx).every(q=>q.length<100), toc=dup&&(run||prevToc); prevToc=toc; return !(toc||adj); }); const out=[];   // a heading met again further on was the contents list's
    for(const i of keep){ let t=P[i], sk=1; if(!modern&&!/:/.test(t)&&P[i+1]&&P[i+1].length<=80&&!HEAD.test(P[i+1])&&P[i+1]===P[i+1].toUpperCase()&&/[A-Z]/.test(P[i+1])){ t+=': '+P[i+1]; sk=2; } out.push({t:t.replace(/[.\]\[]+$/,'').replace(/^\[/,''),i,sk}); }
    if(out.length<2){ out.length=0; for(let i=0;i<P.length;i+=60)out.push({t:'PART '+(out.length+1),i,sk:0}); }
    if(out[0].i>0)out.unshift({t:'THE BEGINNING',i:0,sk:0}); return out; };   // sk: how many of its first paragraphs are its own heading
  let cur=null, side=null;   // the book open: {b, P paragraphs, ch chapters, c chapter}
  const posOf=()=>S.p[cur.b.id]&&typeof S.p[cur.b.id]==='object'?S.p[cur.b.id]:{c:0,p:0,m:[]};
  const keep=()=>{ const Q=posOf(), sc=R.querySelector('.scroll'); let p=cur.ch[cur.c].i; if(sc){ for(const el of sc.querySelectorAll('.pg p[data-i]')){ if(el.offsetTop>=sc.scrollTop){ p=+el.dataset.i; break; } } }
    S.p[cur.b.id]={c:cur.c,p,m:Q.m||[]}; save(); };
  let keepT=0; const keepSoon=()=>{ clearTimeout(keepT); keepT=setTimeout(()=>cur&&keep(),600); };
  const theme=()=>{ const T=THEMES[SET().theme]||THEMES.paper; for(const k in T)R.style.setProperty('--'+k,T[k]); };
  const pct=()=>{ const sc=R.querySelector('.scroll'), C=cur.ch[cur.c], end=(cur.ch[cur.c+1]||{i:cur.P.length}).i, f=sc&&sc.scrollHeight>sc.clientHeight?sc.scrollTop/(sc.scrollHeight-sc.clientHeight):0; return Math.round(((C.i+(end-C.i)*f)/cur.P.length)*1000)/10; };
  const bars=()=>{ const n=cur.ch.length, p=pct(); const lab=R.querySelector('[data-pos]'); if(lab)lab.textContent=`CH ${cur.c+1} OF ${n} · ${p}%`; const sl=R.querySelector('[data-k=go]'); if(sl&&document.activeElement!==sl)sl.value=p; };
  const show=(c,toPara)=>{ '@later'; cur.c=Math.max(0,Math.min(cur.ch.length-1,c)); const C=cur.ch[cur.c], end=(cur.ch[cur.c+1]||{i:cur.P.length}).i, Z=SET();
    const body=`<h2 style="font-size:${Z.fs*1.25}px">${esc(C.t)}</h2>`+cur.P.slice(C.i+(C.sk||0),end).map((p,k)=>`<p data-i="${C.i+(C.sk||0)+k}">${esc(p)}</p>`).join('');
    const sc=R.querySelector('.scroll'); sc.innerHTML=`<div class="pg" style="max-width:${Z.w}em;font-size:${Z.fs}px;line-height:${Z.lh};font-family:${FACES[Z.face]}">${body}<div class="end">${cur.c<cur.ch.length-1?`<button data-a="nextch">NEXT: ${esc(cur.ch[cur.c+1].t.slice(0,40))} &gt;</button>`:'<b>THE END</b>'}</div></div>`;
    sc.scrollTop=0; if(toPara!=null){ const el=sc.querySelector(`p[data-i="${toPara}"]`); if(el){ sc.scrollTop=el.offsetTop-20; } }
    bars(); keep(); };
  const frame=()=>{ '@later'; const Q=posOf();
    R.innerHTML=`<div class="bar"><span class="t">${esc(cur.b.t)} · ${esc(cur.b.a)}</span><button data-a="toc">CONTENTS</button><button data-a="find">SEARCH</button><button data-a="mark">★ MARK</button><button data-a="set">Aa</button><button data-a="x">CLOSE</button></div>
      <div class="scroll" tabindex="0"></div>
      <div class="bar"><button data-a="prevch">&lt; CH</button><input type="range" min="0" max="100" step=".1" value="0" data-k="go" aria-label="Where in the book"><span data-pos style="min-width:140px;text-align:center"></span><button data-a="nextch">CH &gt;</button></div>`;
    R.querySelector('.scroll').addEventListener('scroll',()=>{ if(!cur)return; bars(); keepSoon(); }); show(Q.c||0,Q.p); };
  const sideDraw=()=>{ '@later'; const old=R.querySelector('.side'); if(old)old.remove(); if(!side)return; const d=document.createElement('div'); d.className='side'; const Q=posOf(), Z=SET();
    if(side==='toc')d.innerHTML=`<div style="font:11px Silkscreen,monospace;margin-bottom:8px">CONTENTS</div>`+cur.ch.map((c,k)=>`<div class="it ${k===cur.c?'cur':''}" data-ch="${k}">${esc(c.t)}</div>`).join('')+(Q.m&&Q.m.length?`<div style="font:11px Silkscreen,monospace;margin:14px 0 6px">BOOKMARKS</div>`+Q.m.map((m,k)=>`<div class="it" data-bm="${k}">★ ${esc(cur.ch[m.c]?cur.ch[m.c].t:'')} — ${esc((cur.P[m.p]||'').slice(0,60))}…</div>`).join(''):'');
    if(side==='find')d.innerHTML=`<div style="font:11px Silkscreen,monospace;margin-bottom:8px">SEARCH THE BOOK</div><input type="text" data-k="q" placeholder="a word or phrase"><div data-res></div>`;
    if(side==='set')d.innerHTML=`<div style="font:11px Silkscreen,monospace">THE PAGE</div>
      <div class="row"><span>SIZE</span><button data-s="fs" data-v="-1">A−</button><b>${Z.fs}</b><button data-s="fs" data-v="1">A+</button></div>
      <div class="row"><span>TYPE</span>${Object.keys(FACES).map(f=>`<button class="${Z.face===f?'on':''}" data-s="face" data-v="${f}">${f.toUpperCase()}</button>`).join('')}</div>
      <div class="row"><span>SPACING</span>${[1.4,1.6,1.9].map(v=>`<button class="${Z.lh===v?'on':''}" data-s="lh" data-v="${v}">${v}</button>`).join('')}</div>
      <div class="row"><span>WIDTH</span>${[30,38,48].map(v=>`<button class="${Z.w===v?'on':''}" data-s="w" data-v="${v}">${v===30?'NARROW':v===38?'MEDIUM':'WIDE'}</button>`).join('')}</div>
      <div class="row"><span>LIGHT</span>${Object.keys(THEMES).map(t=>`<button class="${Z.theme===t?'on':''}" data-s="theme" data-v="${t}">${t.toUpperCase()}</button>`).join('')}</div>`;
    R.appendChild(d); const q=d.querySelector('[data-k=q]'); if(q){ q.focus(); q.addEventListener('input',()=>{ const w=q.value.trim().toLowerCase(), out=[]; if(w.length>=3)for(let i=0;i<cur.P.length&&out.length<80;i++){ const p=cur.P[i], j=p.toLowerCase().indexOf(w); if(j>=0)out.push([i,p.slice(Math.max(0,j-40),j+60)]); }
      d.querySelector('[data-res]').innerHTML=w.length<3?'':out.length?out.map(([i,t])=>`<div class="it" data-hit="${i}">…${esc(t)}…</div>`).join(''):'<div class="it">NOTHING FOUND.</div>'; }); } };
  const goPara=i=>{ let c=0; for(let k=0;k<cur.ch.length;k++)if(cur.ch[k].i<=i)c=k; show(c,i); const el=R.querySelector(`p[data-i="${i}"]`); if(el){ el.classList.add('hit'); setTimeout(()=>el.classList.remove('hit'),2400); } };
  LIB.read=id=>load().then(async()=>{ const b=LIB.by[id]; if(!b)return; theme(); R.hidden=false; side=null; R.innerHTML='<div class="bar"><span class="t">OPENING '+esc(b.t)+'…</span><button data-a="x">CLOSE</button></div>'; R.focus();
    try{ if(!TX[id]){ const r=await fetch(url(b)); if(!r.ok)throw new Error(r.status); const P=clean(b.txt?await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).text():await r.text()); TX[id]={P,ch:chapters(P,!!b.txt)}; }   // a modern book's own words come packed (gzip)
      cur={b,P:TX[id].P,ch:TX[id].ch,c:0}; frame(); R.querySelector('.scroll').focus(); }
    catch(e){ console.warn('LIB: the text did not come',e); R.innerHTML='<div class="bar"><span class="t">THE PAGES WILL NOT OPEN RIGHT NOW.</span><button data-a="x">CLOSE</button></div>'; } });
  LIB.closeBook=()=>{ if(cur)keep(); R.hidden=true; R.innerHTML=''; cur=null; side=null; };
  R.addEventListener('click',e=>{ '@later'; const t=e.target.closest('[data-a],[data-ch],[data-bm],[data-hit],[data-s]'); if(!t)return; const a=t.dataset.a;
    if(a==='x')return LIB.closeBook(); if(!cur)return;
    if(a==='prevch')return show(cur.c-1); if(a==='nextch'){ if(SFX)SFX.play('page',{vol:.35,vary:.2}); return show(cur.c+1); }
    if(a==='toc'||a==='find'||a==='set'){ side=side===a?null:a; return sideDraw(); }
    if(a==='mark'){ keep(); const Q=posOf(); Q.m=(Q.m||[]).filter(m=>m.p!==Q.p); Q.m.push({c:Q.c,p:Q.p}); S.p[cur.b.id]=Q; save(); say('BOOKMARKED.'); if(side==='toc')sideDraw(); return; }
    if(t.dataset.ch!=null){ show(+t.dataset.ch); side=null; return sideDraw(); }
    if(t.dataset.bm!=null){ const m=posOf().m[+t.dataset.bm]; if(m)goPara(m.p); side=null; return sideDraw(); }
    if(t.dataset.hit!=null){ goPara(+t.dataset.hit); return; }
    if(t.dataset.s){ const Z=SET(), k=t.dataset.s, v=t.dataset.v; if(k==='fs')Z.fs=Math.max(13,Math.min(32,Z.fs+ +v)); else if(k==='lh'||k==='w')Z[k]=+v; else Z[k]=v; save(); keep(); theme(); const Q=posOf(); show(cur.c,Q.p); sideDraw(); } });
  R.addEventListener('input',e=>{ if(!cur||e.target.dataset.k!=='go')return; const want=+e.target.value/100*cur.P.length; let c=0; for(let k=0;k<cur.ch.length;k++)if(cur.ch[k].i<=want)c=k; const i=Math.max(cur.ch[c].i,Math.floor(want)); show(c,i); e.target.value=pct(); });
  for(const ev of ['keydown','keyup','keypress'])R.addEventListener(ev,e=>{ '@later'; const typing=e.target&&e.target.tagName==='INPUT'&&e.target.type==='text';
    if(ev==='keydown'&&cur&&!typing){ const sc=R.querySelector('.scroll'), k=e.key;
      if(k==='Escape'){ if(side){ side=null; sideDraw(); } else LIB.closeBook(); } else if(k==='ArrowRight')show(cur.c+1); else if(k==='ArrowLeft')show(cur.c-1);
      else if(k===' '||k==='PageDown'){ sc.scrollTop+=sc.clientHeight*.9; e.preventDefault(); } else if(k==='PageUp'){ sc.scrollTop-=sc.clientHeight*.9; e.preventDefault(); } else if(k==='ArrowDown')sc.scrollTop+=60; else if(k==='ArrowUp')sc.scrollTop-=60; }
    else if(ev==='keydown'&&!cur&&e.key==='Escape')LIB.closeBook();
    e.stopPropagation(); });

  /* ---------- the furniture is polyfork's (data/bookstore.json, baked in metres): chairs, rugs, lamps, the radiator and curtains, the clock; loaded behind the fade on the way in ---------- */
  const PJ=__LAZY__("data/bookstore.json"); let PG=null, GEO=null; const pfGeo=()=>PG||(PG=PJ().then(D=>{ const G={}; for(const k in D){ const g=KIT.decode(D[k]); g.computeBoundingBox(); G[k]=g; } return GEO=G; }));
  { let wrapped=false; SYS.add('places',()=>{ if(wrapped)return; const o=ROOMS.off&&ROOMS.off.books; if(!o)return; wrapped=true; const n0=o.need; o.need=()=>Promise.all([n0?n0():null,pfGeo(),load().catch(()=>null),typeof LOAD==='function'?LOAD('tables'):null,arts()]); },'144ca-library'); }
  let DUST=null;
  /* ---------- a bookcase: Polyfork's alcove bookcase, empty, its four open shelves holding ten real books each, each a spine painted from the book (its cloth, gold bands, title and author; the real spine where one survives), thick or thin by its length ---------- */
  const BC={W:1,H:2.2,D:.355,Z0:-.15,FZ:.15,SH:[.65,1.04,1.415,1.79],TOPS:[1.01,1.385,1.76,2.15],IN:.94,BW:.03};   // metres: the case (its back at Z0, its shelves' front at FZ), its shelves' tops and the boards over them, the room inside a shelf, the boards
  const hsh=s=>{ let h=7; for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0; return (h%1000)/1000; };
  const bookDims=b=>({th:.012+(b.pages||300)*.00007,h:.25+hsh(b.id)*.07,d:.2+hsh(b.t)*.05});
  // a case reads from its top shelf down (row 0 is the bottom shelf)
  // a shelf's books side by side, filling its width IN left to right: thick or thin by length
  LIB.layRow=(row,IN)=>{ const L=row.map(bookDims), sum=L.reduce((a,q)=>a+q.th,0), k=(IN-.012)/sum; let x=-IN/2+.006;
    return row.map((b,i)=>{ const q=L[i], th=q.th*k, o={b,x:x+th/2,th,h:q.h,d:q.d}; x+=th; return o; }); };
  LIB.shelfOf=C=>{ '@later'; return [0,1,2,3].map(r=>LIB.layRow(C.books.slice((3-r)*10,(3-r)*10+10),BC.IN)); };   // ten to a shelf
  // one spine on a canvas: w x h px, x/y its corner
  const paintSpine=(g,x,y,w,h,b,im)=>{ '@later'; g.save(); g.beginPath(); g.rect(x,y,w,h); g.clip(); g.fillStyle=b.col||'#5a3a24'; g.fillRect(x,y,w,h);
    if(im){ g.drawImage(im,x,y,w,h); g.restore(); return; }
    for(let i=0;i<w*h/30;i++){ g.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},${Math.random()<.5?0:255},.05)`; g.fillRect(x+Math.random()*w,y+Math.random()*h,1,1); }
    g.fillStyle='rgba(0,0,0,.22)'; g.fillRect(x,y,w*.08,h); g.fillRect(x+w*.92,y,w*.08,h); g.fillStyle='rgba(255,255,255,.07)'; g.fillRect(x+w*.12,y,w*.08,h);
    const gold='#e2c272'; g.fillStyle=gold; for(const yy of [y+h*.05,y+h*.09,y+h*.91,y+h*.95])g.fillRect(x+w*.12,yy,w*.76,Math.max(1,h*.006));
    // the title down the spine between the bands, whole: one line if it fits, else two, the type shrunk until it does; the author's name below it, clear of the bands
    const T=String(b.t).toUpperCase(), t0=y+h*.12, t1=y+h*.72, len=t1-t0, mid=(t0+t1)/2; g.fillStyle=gold; g.textBaseline='middle'; g.textAlign='center';
    const fit=(lines,max)=>{ let fs=max; g.font=`600 ${fs}px Georgia,serif`; const wd=Math.max(...lines.map(l=>g.measureText(l).width)); if(wd>len)fs=fs*len/wd; return fs; };
    let lines=[T], fs=fit(lines,Math.min(w*.58,h*.075));
    if(fs<Math.min(w*.58,h*.075)*.7&&T.includes(' ')){ const ws=T.split(' '); let best=null; for(let k=1;k<ws.length;k++){ const L=[ws.slice(0,k).join(' '),ws.slice(k).join(' ')], f=fit(L,Math.min(w*.36,h*.075)); if(!best||f>best[1])best=[L,f]; } if(best[1]>fs){ lines=best[0]; fs=best[1]; } }
    g.save(); g.translate(x+w/2,mid); g.rotate(Math.PI/2); g.font=`600 ${fs}px Georgia,serif`; lines.forEach((l,i)=>g.fillText(l,0,(i-(lines.length-1)/2)*fs*1.08)); g.restore();
    const A=String(b.a).split(' ').pop().toUpperCase(), a0=y+h*.75, a1=y+h*.885; let afs=Math.min(w*.4,h*.045); g.font=`${afs}px Georgia,serif`; const aw=g.measureText(A).width; if(aw>a1-a0){ afs*= (a1-a0)/aw; }
    g.save(); g.translate(x+w/2,(a0+a1)/2); g.rotate(Math.PI/2); g.font=`${afs}px Georgia,serif`; g.fillText(A,0,0); g.restore(); g.restore(); };
  const IMS={}, spineIm=id=>{ const f=spineF(id); if(!f)return null; if(!IMS[id]){ const im=new Image(); im.src=f; IMS[id]=im; } return IMS[id].complete&&IMS[id].naturalWidth?IMS[id]:null; };
  // the books of a case as one mesh: each a box, its spine painted on one sheet (a cell a book), the real spine laid over where one survives; rows[r] stand on SH[r], their fronts at FZ; skip(ids) takes those off the shelf
  LIB.spines=(rows,SH,FZ)=>{ '@later';
    const mg=(L,mat)=>{ let n=0; for(const g of L)n+=g.attributes.position.count; const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2),I=[]; let o=0;
      for(const g of L){ P.set(g.attributes.position.array,o*3); N.set(g.attributes.normal.array,o*3); U.set(g.attributes.uv.array,o*2); for(const i of g.index.array)I.push(i+o); o+=g.attributes.position.count; g.dispose(); }
      const b=new THREE.BufferGeometry(); b.setAttribute('position',new THREE.BufferAttribute(P,3)); b.setAttribute('normal',new THREE.BufferAttribute(N,3)); b.setAttribute('uv',new THREE.BufferAttribute(U,2)); b.setIndex(I); const me=new THREE.Mesh(b,mat); me.castShadow=me.receiveShadow=true; return me; };
    const CW=48, CH=320, NC=Math.max(1,...rows.map(r=>r.length)), cv=document.createElement('canvas'); cv.width=CW*NC; cv.height=CH*rows.length; const g=cv.getContext('2d'), tex=new THREE.CanvasTexture(cv); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=4;
    rows.forEach((row,r)=>row.forEach((q,i)=>paintSpine(g,i*CW,r*CH,CW,CH,q.b,spineIm(q.b.id))));
    const geos=out=>{ const L=[]; rows.forEach((row,r)=>row.forEach((q,i)=>{ if(out&&out.has(q.b.id))return; const cx=i*CW, cy=r*CH;
      const geo=new THREE.BoxGeometry(q.th,q.h,q.d), uv=geo.attributes.uv, u0=cx/cv.width, u1=(cx+CW)/cv.width, v0=1-(cy+CH)/cv.height, v1=1-cy/cv.height;
      for(let k=0;k<uv.count;k++){ const face=Math.floor(k/4); if(face===4){ const a=uv.getX(k), c=uv.getY(k); uv.setXY(k,u0+(u1-u0)*a,v0+(v1-v0)*c); } else uv.setXY(k,u0+(u1-u0)*.5,v0+(v1-v0)*.5); }
      geo.translate(q.x,SH[r]+q.h/2,FZ-q.d/2-.01); L.push(geo); })); return L; };
    const mesh=mg(geos(null),new THREE.MeshLambertMaterial({map:tex}));
    for(const row of rows)for(const q of row)if(spineF(q.b.id)){ const im=new Image(); im.onload=()=>{ rows.forEach((rw,r)=>rw.forEach((z,i)=>{ if(z.b.id===q.b.id){ paintSpine(g,i*CW,r*CH,CW,CH,z.b,im); tex.needsUpdate=true; } })); }; im.src=spineF(q.b.id); }
    return {mesh,tex,skip:ids=>{ const m=mg(geos(new Set(ids)),mesh.material); mesh.geometry.dispose(); mesh.geometry=m.geometry; }}; };
  // the case's mesh, in metres (x across, y up, z out toward the room)
  const caseMesh=C=>{ '@later'; const G=new THREE.Group();
    if(GEO&&GEO.alcove){ const me=new THREE.Mesh(GEO.alcove,KIT.mat); me.castShadow=me.receiveShadow=true; G.add(me); }
    G.add(LIB.spines(LIB.shelfOf(C),BC.SH,BC.FZ).mesh);
    // its brass plate: the genre
    const pc=document.createElement('canvas'); pc.width=256; pc.height=40; const pg=pc.getContext('2d'); pg.fillStyle='#b8923a'; pg.fillRect(0,0,256,40); pg.fillStyle='#2a1a10'; let pfs=19; pg.font=`600 ${pfs}px Georgia,serif`; const pww=pg.measureText(C.name).width; if(pww>240){ pfs*=240/pww; pg.font=`600 ${pfs}px Georgia,serif`; } pg.textAlign='center'; pg.textBaseline='middle'; pg.fillText(C.name,128,21);
    const pt=new THREE.CanvasTexture(pc); pt.colorSpace=THREE.SRGBColorSpace; const plate=new THREE.Mesh(new THREE.PlaneGeometry(.46,.072),new THREE.MeshLambertMaterial({map:pt})); plate.position.set(0,.5,BC.FZ+.03); G.add(plate);
    return G; };

  /* ---------- up close (double-click a case): the case fills the screen on its wall, the real spines legible; wheel or pinch to zoom, drag to slide along, click a book to open its card ---------- */
  const VW=document.createElement('div'); VW.id='libv'; VW.hidden=true; VW.style.cssText='position:fixed;inset:0;z-index:22;background:#120c08;touch-action:none';
  document.body.appendChild(VW); const VC=document.createElement('canvas'); VC.style.cssText='position:absolute;inset:0;width:100%;height:100%;cursor:grab'; VW.appendChild(VC);
  const VB=document.createElement('div'); VB.style.cssText='position:absolute;left:50%;bottom:max(14px,env(safe-area-inset-bottom,0px));transform:translateX(-50%);display:flex;gap:6px;font:11px Silkscreen,monospace;zoom:var(--uiz,1)';
  VB.innerHTML='<button class="btn" data-v="prev">&lt; CASE</button><button class="btn" data-v="out">−</button><button class="btn" data-v="fit">FIT</button><button class="btn" data-v="in">+</button><button class="btn" data-v="next">CASE &gt;</button><button class="btn" data-v="up">▲ SHELF</button><button class="btn" data-v="down">▼ SHELF</button><button class="btn" data-v="rot">ROTATE</button><button class="btn" data-v="x">CLOSE</button>';
  VW.appendChild(VB); { const st=document.createElement('style'); st.textContent='#libv .btn{font:inherit;padding:6px 10px;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer} #libv[hidden]{display:none!important}'; document.head.appendChild(st); }
  const V={ci:0,s:1,x:0,y:0,fit:1,rows:null,hit:[],row:null,rot:0};
  let vpend=false; const vdraw=()=>{ if(vpend)return; vpend=true; requestAnimationFrame(()=>{ vpend=false; if(!VW.hidden)vpaint(); }); };   // one redraw a frame: the filter is a pass over every pixel
  const vpaint=()=>{ '@later'; const C=LIB.data.cases[V.ci], dpr=Math.min(2,window.devicePixelRatio||1), w=VC.clientWidth, h=VC.clientHeight; if(VC.width!==w*dpr||VC.height!==h*dpr){ VC.width=w*dpr; VC.height=h*dpr; }
    const g=VC.getContext('2d'); g.setTransform(dpr,0,0,dpr,0,0); g.fillStyle='#2a1810'; g.fillRect(0,0,w,h);
    const k=V.s, X=m=>w/2+V.x+m*k, Y=m=>h/2+V.y-(m-BC.H/2)*k;   // metres to the screen
    g.save(); g.translate(w/2,h/2); g.rotate(-V.rot*Math.PI/180); g.translate(-w/2,-h/2);   // ROTATE turns the case so the spines read across
    // the wall, the case, its plate, its books
    g.fillStyle='#3a2416'; g.fillRect(X(-BC.W/2-.02),Y(BC.H+.05),(BC.W+.04)*k,(BC.H+.05)*k); g.fillStyle='#1c120c'; g.fillRect(X(-BC.W/2+BC.BW),Y(BC.H-.05),(BC.W-2*BC.BW)*k,(BC.H-.13)*k);
    g.fillStyle='#4a2e1c'; g.fillRect(X(-BC.W/2+BC.BW),Y(BC.SH[0]-.03),(BC.W-2*BC.BW)*k,(BC.SH[0]-.13)*k); g.fillStyle='#b8923a'; g.fillRect(X(-.23),Y(.536),.46*k,.072*k); g.fillStyle='#2a1a10'; let pf=Math.max(6,.04*k); g.font=`600 ${pf}px Georgia,serif`; const pw_=g.measureText(C.name).width; if(pw_>.42*k){ pf*=.42*k/pw_; g.font=`600 ${pf}px Georgia,serif`; } g.textAlign='center'; g.textBaseline='middle'; g.fillText(C.name,X(0),Y(.5)); g.textAlign='left';
    V.hit=[]; V.rows.forEach((row,r)=>{ g.fillStyle='#5a3a22'; g.fillRect(X(-BC.W/2+BC.BW),Y(BC.SH[r]),(BC.W-2*BC.BW)*k,Math.max(2,BC.BW*k));
      for(const q of row){ const x=X(q.x-q.th/2), y=Y(BC.SH[r]+q.h), bw=q.th*k, bh=q.h*k; paintSpine(g,x,y,bw,bh,q.b,spineIm(q.b.id)); V.hit.push([q.b.id,x,y,bw,bh]); } });
    g.restore();
    if(PS2.on&&PS2.img){ const W_=VC.width, H_=VC.height, im=g.getImageData(0,0,W_,H_); PS2.img(im.data,W_,H_,480); g.putImageData(im,0,0); }   // the game's own look, at MED's 480 lines
    g.textAlign='left'; g.textBaseline='alphabetic'; g.fillStyle='rgba(236,229,211,.9)'; g.font='12px Silkscreen,monospace'; g.fillText(`${C.name} · CASE ${V.ci+1} OF ${LIB.data.cases.length}${V.row!=null?' · SHELF '+(4-V.row)+' FROM THE TOP':''} · CLICK A BOOK`,16,24); };
  const rowTop=r=>BC.TOPS[r];
  const vfit=()=>{ '@later'; const a=V.rot*Math.PI/180, c=Math.abs(Math.cos(a)), sn=Math.abs(Math.sin(a)), cw=VC.clientWidth, ch=VC.clientHeight;
    const bw=BC.W+.2, bh=V.row==null?BC.H+.3:rowTop(V.row)-BC.SH[V.row]+.12, ew=bw*c+bh*sn, eh=bw*sn+bh*c;   // the box to show, turned
    V.fit=Math.min(cw/ew,ch/eh)*.92; V.s=V.fit; V.x=0; V.y=V.row==null?0:((BC.SH[V.row]+rowTop(V.row))/2-BC.H/2)*V.s; };
  const vopen=(ci,row)=>{ if(row!==undefined)V.row=row; V.ci=(ci+LIB.data.cases.length)%LIB.data.cases.length; V.rows=LIB.shelfOf(LIB.data.cases[V.ci]); VW.hidden=false; vfit(); vdraw(); };
  LIB.look=(ci,row=null)=>load().then(()=>vopen(ci,row)).catch(()=>say('THE SHELF IS TOO DARK TO READ. TRY AGAIN.','#c8a090')); LIB.closeLook=()=>{ VW.hidden=true; };
  const vzoom=(f,cx=VC.clientWidth/2,cy=VC.clientHeight/2)=>{ const s=Math.max(V.fit,Math.min(V.fit*9,V.s*f)), r=s/V.s; V.x=(V.x+VC.clientWidth/2-cx)*r-VC.clientWidth/2+cx; V.y=(V.y+VC.clientHeight/2-cy)*r-VC.clientHeight/2+cy; V.s=s; vdraw(); };
  VC.addEventListener('wheel',e=>{ e.preventDefault(); vzoom(e.deltaY<0?1.15:1/1.15,e.offsetX,e.offsetY); },{passive:false});
  let drag=null, moved=0; const pts=new Map();
  const unturn=(x,y)=>{ const a=V.rot*Math.PI/180, cx=VC.clientWidth/2, cy=VC.clientHeight/2, dx=x-cx, dy=y-cy; return [cx+dx*Math.cos(a)-dy*Math.sin(a),cy+dx*Math.sin(a)+dy*Math.cos(a)]; };
  VC.addEventListener('pointerdown',e=>{ VC.setPointerCapture(e.pointerId); pts.set(e.pointerId,[e.offsetX,e.offsetY]); drag=[e.offsetX,e.offsetY,V.x,V.y,pts.size===2?Math.hypot(...[...pts.values()].reduce((a,p)=>[a[0]-p[0],a[1]-p[1]],[0,0])):0]; moved=0; VC.style.cursor='grabbing'; });
  VC.addEventListener('pointermove',e=>{ '@later'; if(!drag)return; const prev=pts.get(e.pointerId); pts.set(e.pointerId,[e.offsetX,e.offsetY]);
    if(pts.size===2){ const [a,b]=[...pts.values()], d=Math.hypot(a[0]-b[0],a[1]-b[1]); if(prev&&drag.pd)vzoom(d/drag.pd,(a[0]+b[0])/2,(a[1]+b[1])/2); drag.pd=d; moved=99; return; }
    moved+=Math.abs(e.movementX||0)+Math.abs(e.movementY||0); { const a=V.rot*Math.PI/180, dx=e.offsetX-drag[0], dy=e.offsetY-drag[1]; V.x=drag[2]+dx*Math.cos(a)-dy*Math.sin(a); V.y=drag[3]+dx*Math.sin(a)+dy*Math.cos(a); } vdraw(); });
  VC.addEventListener('pointerup',e=>{ pts.delete(e.pointerId); VC.style.cursor='grab'; if(drag&&moved<6&&!pts.size){ const [px,py]=unturn(e.offsetX,e.offsetY), h=V.hit.find(([,x,y,w,hh])=>px>=x&&px<=x+w&&py>=y&&py<=y+hh); if(h){ if(SFX)SFX.play('page',{vol:.4}); LIB.open(h[0]); } } if(!pts.size)drag=null; });
  VB.addEventListener('click',e=>{ '@later'; const b=e.target.closest('[data-v]'); if(!b)return; const a=b.dataset.v; if(a==='x')LIB.closeLook(); else if(a==='in')vzoom(1.5); else if(a==='out')vzoom(1/1.5); else if(a==='fit'){ vfit(); vdraw(); } else if(a==='prev')vopen(V.ci-1); else if(a==='next')vopen(V.ci+1); else if(a==='up')vshelf(1); else if(a==='down')vshelf(-1); else if(a==='rot'){ V.rot=(V.rot+45)%135; vfit(); vdraw(); } });
  const vshelf=d=>{ V.row=V.row==null?(d>0?3:0):Math.max(0,Math.min(3,V.row+d)); vfit(); vdraw(); };   // up and down the same case, a shelf at a time
  for(const ev of ['keydown','keyup'])VW.addEventListener(ev,e=>{ if(ev==='keydown'&&e.key==='Escape')LIB.closeLook(); e.stopPropagation(); });
  addEventListener('keydown',e=>{ if(VW.hidden||!LIB.data)return; const m={ArrowUp:()=>vshelf(1),ArrowDown:()=>vshelf(-1),ArrowLeft:()=>vopen(V.ci-1),ArrowRight:()=>vopen(V.ci+1)}[e.key]; if(m){ m(); e.preventDefault(); e.stopPropagation(); } },true);
  window.addEventListener('resize',()=>{ if(!VW.hidden){ vfit(); vdraw(); } });

  /* ---------- the shop: one floor twice as wide as it was, the books in its left half (six cases on the back, five down each side; in the middle only a rug, chairs and lamps; the Professor's counter by the door), the café in its right half (144cc's game tables) ---------- */
  // the café, the room's right half: Polyfork's counter on the back wall with an espresso machine and a pastry case, the chalkboard menu over it, five bistro tables of four chairs (144cc's game tables), the game cupboard
  const CAFE=[[1.45,3.1],[3.7,3.1],[5.95,3.1],[2.55,6.35],[4.85,6.35]], SEATS=[[0,.62,0,-1],[-.62,0,1,0],[0,-.62,0,1],[.62,0,-1,0]], TUSE=[];
  /* ---------- the café's paintings (data/bookart.json, the Art Institute of Chicago's, public domain): each in a real moulded frame, swept from its moulding's profile round the picture with mitred corners, the canvas set back in the rebate, a soft shadow on the wall; double-click opens the art museum's viewer and its guided tour ---------- */
  const BART=__LAZY__("data/bookart.json"); let ARTS=null; const arts=()=>ARTS?Promise.resolve(ARTS):BART().then(d=>ARTS=d).catch(()=>ARTS=[]);
  // mouldings: [out from the sight edge, up off the wall, light (1 lit, lower in the hollows)] in metres, inner edge first
  const MOULD={
    barbizon:{f:'gilt',p:[[-.005,.012,0.65],[0,.022,0.62],[.004,.028,0.9],[.01,.026,0.62],[.016,.03,0.95],[.03,.034,0.75],[.05,.04,0.62],[.065,.052,0.7],[.08,.066,0.95],[.092,.07,1],[.104,.068,1],[.115,.06,0.9],[.124,.048,0.75],[.13,.03,0.62],[.132,0,0.62]]},
    cassetta:{f:'gilt',p:[[-.005,.012,0.65],[0,.02,0.62],[.006,.03,1],[.012,.03,0.95],[.016,.024,0.62],[.02,.022,0.75],[.09,.022,0.8],[.094,.026,0.62],[.1,.036,0.9],[.106,.04,1],[.112,.036,0.9],[.115,.02,0.62],[.116,0,0.62]]},
    ogee:{f:'walnut',p:[[-.005,.012,0.65],[0,.02,0.62],[.005,.026,0.9],[.02,.032,0.8],[.035,.042,0.75],[.05,.055,0.9],[.06,.06,1],[.072,.058,0.95],[.08,.04,0.7],[.082,0,0.62]]},
    white:{f:'white',p:[[-.005,.012,0.62],[0,.015,0.7],[.004,.02,1],[.07,.024,0.95],[.074,.02,0.8],[.075,0,0.62]]},
    oak:{f:'oak',p:[[-.005,.012,0.65],[0,.018,0.62],[.006,.026,1],[.05,.03,0.95],[.056,.026,0.8],[.058,0,0.62]]}};
  const FINISH={};
  const finish=k=>FINISH[k]||(FINISH[k]=(()=>{ const c=document.createElement('canvas'); c.width=512; c.height=64; const g=c.getContext('2d'), rnd=Math.random, I=g.createImageData(512,64), d=I.data;
    for(let y=0;y<64;y++)for(let x=0;x<512;x++){ const i=(y*512+x)*4; let r,gg,b;
      if(k==='gilt'){ const s=.86+.14*Math.sin(x*.9+y*.3)*Math.sin(y*1.7)+.1*(rnd()-.5), worn=Math.sin(x*.031+Math.sin(y*.5)*2)*Math.sin(x*.007+y*.11)>.82; r=worn?150:226*s; gg=worn?70:178*s; b=worn?44:84*s; }   // leaf gold, burnished in streaks, the red bole through where it is worn
      else if(k==='walnut'){ const gr=.75+.25*Math.sin(y*.9+Math.sin(x*.02)*3+Math.sin(x*.005)*6)+.06*(rnd()-.5); r=92*gr; gg=60*gr; b=38*gr; }   // the grain runs along each side
      else if(k==='oak'){ const gr=.8+.2*Math.sin(y*1.4+Math.sin(x*.03)*2)+(rnd()<.02?-.25:0)+.05*(rnd()-.5); r=168*gr; gg=126*gr; b=78*gr; }
      else { const s=.95+.05*(rnd()-.5); r=236*s; gg=232*s; b=222*s; }
      d[i]=r; d[i+1]=gg; d[i+2]=b; d[i+3]=255; }
    g.putImageData(I,0,0); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=THREE.RepeatWrapping; t.anisotropy=4;
    const sp={gilt:[0x8a6a2a,42],walnut:[0x2a2a2a,18],oak:[0x1c1c1c,10],white:[0x202020,8]}[k];
    return new THREE.MeshPhongMaterial({map:t,vertexColors:true,specular:sp[0],shininess:sp[1]}); })());
  // the frame round a w x h picture (metres): one ring of the rectangle for each profile point, joined side by side (the mitres fall at the corners)
  const frameGeo=(w,h,P)=>{ const pos=[],nor=[],uv=[],col=[], L=[0]; for(let i=1;i<P.length;i++)L.push(L[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
    const ring=d=>[[-(w/2+d),-(h/2+d)],[w/2+d,-(h/2+d)],[w/2+d,h/2+d],[-(w/2+d),h/2+d]], OUT=[[0,-1],[1,0],[0,1],[-1,0]];
    const pn=i=>{ const a=P[Math.max(0,i-1)], b=P[Math.min(P.length-1,i+1)], td=b[0]-a[0], tz=b[1]-a[1], l=Math.hypot(td,tz)||1; return [-tz/l,td/l]; };
    for(let s=0;s<4;s++){ const o=OUT[s];
      for(let i=0;i<P.length-1;i++){ const A=ring(P[i][0]), B=ring(P[i+1][0]), q=[[A[s],P[i],i],[A[(s+1)%4],P[i],i],[B[(s+1)%4],P[i+1],i+1],[B[s],P[i+1],i+1]];
        for(const k of [0,2,1,0,3,2]){ const [xy,p,j]=q[k], n=pn(j); pos.push(xy[0],xy[1],p[1]); nor.push(o[0]*n[0],o[1]*n[0],n[1]); uv.push((s%2?xy[1]:xy[0])*2.2,L[j]/L[L.length-1]); col.push(p[2],p[2],p[2]); } } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); return g; };
  let SHADOW=null; const shadowTex=()=>SHADOW||(SHADOW=(()=>{ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'), gr=g.createRadialGradient(32,32,8,32,32,32); gr.addColorStop(0,'rgba(0,0,0,.55)'); gr.addColorStop(.7,'rgba(0,0,0,.35)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64); const t=new THREE.CanvasTexture(c); return t; })());
  const hang=(A,use,F,t,u,v,du,dv,hc)=>{ const MW=IKIT.MW, M=MOULD[t.fr]||MOULD.barbizon, s=Math.min(1,(t.big||.95)/Math.max(t.cm[0],t.cm[1])*100), h=t.cm[0]/100*s, w=t.cm[1]/100*s, ow=M.p[M.p.length-1][0];
    const G=new THREE.Group(), me=new THREE.Mesh(frameGeo(w,h,M.p),finish(M.f)); me.castShadow=me.receiveShadow=true; G.add(me);
    const tx=new THREE.TextureLoader().load(t.i); tx.colorSpace=THREE.SRGBColorSpace; tx.anisotropy=4; const cv=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:tx,emissiveMap:tx,emissive:0x5a4a3a})); cv.position.z=.013; G.add(cv);   // (lit a little by its picture light)
    const bk=new THREE.Mesh(new THREE.BoxGeometry(w+.01,h+.01,.008),new THREE.MeshLambertMaterial({color:0x3a2a1c})); bk.position.z=.004; G.add(bk);
    { const br=new THREE.MeshPhongMaterial({color:0xb8923a,specular:0x806030,shininess:50}), y=h/2+ow+.06, L=Math.max(.25,w*.45);   // the brass picture light over it: two arms off the wall, the hood, its warm glow
      for(const x of [-L*.3,L*.3]){ const a=new THREE.Mesh(new THREE.BoxGeometry(.012,.012,.16),br); a.position.set(x,y,.08); G.add(a); }
      const hd=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,L,12,1,false,0,Math.PI),br); hd.rotation.z=Math.PI/2; hd.rotation.x=-Math.PI*.35; hd.position.set(0,y,.17); hd.castShadow=true; G.add(hd);
      const gl=new THREE.Mesh(new THREE.BoxGeometry(L*.94,.008,.03),new THREE.MeshBasicMaterial({color:0xfff0c8})); gl.position.set(0,y-.022,.17); G.add(gl); }
    const sh=new THREE.Mesh(new THREE.PlaneGeometry(w+2*ow+.12,h+2*ow+.12),new THREE.MeshBasicMaterial({map:shadowTex(),transparent:true,depthWrite:false})); sh.position.set(.015,-.035,.002); G.add(sh);   // the soft shadow it throws on the wall, below and to one side
    G.scale.setScalar(MW); const p=F.pw(u,v); G.position.set(p[0],hc*MW,p[1]); G.rotation.y=F.hd(du,dv); A.add(G);
    use(t.t.toUpperCase()+' · '+t.a.toUpperCase(),u+du*.25,v+dv*.25,Math.max(w,.6),hc+h/2+.2,()=>{ if(STORE.art&&STORE.art.viewOne)STORE.art.viewOne(t); else MINI.look(t.t.toUpperCase(),Object.assign(new Image(),{src:t.i}),t.a+', '+t.d); },2.2); };
  const cafe=(A,G,put,box,sol,use,K,F,W,D,Wb,HT,warm)=>{ '@later'; const MW=IKIT.MW, cx=Wb+Wb/2;
    put(G,'cafecounter',cx,.62,0,1); sol(cx-1.02,.1,cx+1.02,1.14);
    { const u=cx-.55, v=.4; box(u-.24,v-.18,u+.24,v+.18,1.4,1.82,0xb8b8bc); box(u-.22,v+.18,u+.22,v+.2,1.48,1.76,0x2a2a2e); box(u-.2,v-.16,u+.2,v+.16,1.82,1.86,0x9a9aa0);   // the espresso machine: steel, its group heads and the cups warming on top
      for(const d of [-.12,.12]){ box(u+d-.035,v+.18,u+d+.035,v+.27,1.5,1.56,0x1c1c1c); box(u+d-.03,v+.2,u+d+.03,v+.26,1.42,1.47,0xf4f0e8); } for(let i=0;i<4;i++)box(u-.15+i*.1-.03,v-.03,u-.15+i*.1+.03,v+.03,1.86,1.92,0xf4f0e8);
      const w=cx+.45; box(w-.38,.3,w+.38,.62,1.4,1.66,0x3a2a1e); box(w-.36,.6,w+.36,.63,1.42,1.64,0xdfe8ea); box(w-.36,.32,w+.36,.6,1.66,1.67,0xdfe8ea);   // the pastry case: croissants and cake behind the glass
      for(let i=0;i<5;i++)box(w-.3+i*.14,.4,w-.22+i*.14,.5,1.43,1.48,[0xd8a050,0xe8c070,0xc87a3a,0xf0e0c0,0xd89a4a][i]); for(let i=0;i<3;i++)box(w-.28+i*.22,.38,w-.12+i*.22,.52,1.53,1.6,[0x6a3a2a,0xf4e4d0,0xe0a0b0][i]); }
    put(G,'chalkmenu',cx,.06,0,1,{h:1.75,shadow:false});
    use('THE COFFEE BAR: COFFEE, PASTRY',cx,1.2,2,1.4,()=>TABLES.bar(),1.6);
    put(G,'sideboard',W-.3,7.6,-1,0); sol(W-.55,6.85,W-.05,8.35);
    for(let i=0;i<6;i++){ const v=7.05+i*.24, c=[0x7a2430,0x1f4a6a,0x2f5a3a,0xc8a040,0x5a3a6a,0xe8e0d0][i]; box(W-.5,v,W-.12,v+.2,.85,.85+.05+(i%3)*.02,c); }   // the games' boxes on the cupboard
    use('THE GAME CUPBOARD: EVERY GAME WE HAVE',W-.4,7.6,1.5,1,()=>TABLES.list(),1.4);
    TUSE.length=0; CAFE.forEach(([du,v],n)=>{ const u=Wb+du; put(G,'bistrotable',u,v,0,1); sol(u-.36,v-.36,u+.36,v+.36);
      const top=TABLES.top(n,.62*MW); if(top){ const p=F.pw(u,v); top.position.set(p[0],.757*MW,p[1]); top.rotation.z=F.hd(0,1); A.add(top); }
      SEATS.forEach(([a,b,fu,fv],i)=>{ put(G,'bistrochair',u+a,v+b,fu,fv); const go=()=>{ const p=F.pw(u+a*.85,v+b*.85); USE.sitAt(p[0],p[1],.46*MW,F.hd(fu,fv)); setTimeout(()=>TABLES.sit(n,i),600); }; TABLES.chairs[n*4+i]=go; const th=use(TABLES.label(n),u+a,v+b,.5,.9,go,1.1); TUSE.push([th,n]); }); });
    warm(Wb+3.7,2.6,2.3,1.5,6.5,0xffd29a); warm(Wb+3.7,6.35,2.3,1.3,6,0xffd29a);
    for(const t of ARTS||[]){ const a=t.at, e=.005; if(t.wall==='b')hang(A,use,F,t,Wb+a,e,0,1,1.75); else if(t.wall==='e')hang(A,use,F,t,W-e,a,-1,0,t.hc||1.75); else if(t.wall==='p')hang(A,use,F,t,Wb+.06+e,a,1,0,1.7); else hang(A,use,F,t,Wb+a,D-e,0,-1,1.75); } };
  SYS.every(()=>{ for(const [th,n] of TUSE)th.name=TABLES.label(n); },1000,'144ca-cafe');
  MSHOP.kit.books=A=>{ '@later'; const R=A.R, F=IKIT.frame(R), MW=IKIT.MW, K=IKIT.room(F,o=>A.add(o),()=>{}), t=d=>d*TM, sol=(u0,v0,u1,v1)=>A.sol(R.x0+Math.min(u0,u1)/TM,R.y0+Math.min(v0,v1)/TM,R.x0+Math.max(u0,u1)/TM,R.y0+Math.max(v0,v1)/TM), {box,use}=K, W=t(R.x1-R.x0), D=t(R.y1-R.y0), Wb=W/2;
    const tx=u=>R.x0+u/TM, ty=v=>R.y0+v/TM, HT=A.WH/24*TM;
    // dark oak boards; plaster walls the colour of old paper over a dark wainscot; a cornice
    A.floor((x,y)=>{ const u=(x-R.x0), v=(y-R.y0), row=Math.floor(u*6), s=.82+.18*A.hs(row,Math.floor(v*1.3+row*.37),5), e=(u*6%1)<.06?.62:1; return [92*s*e,58*s*e,34*s*e]; });
    for(const sd of ['b','w','e','f'])A.wall(sd,(a,z)=>{ if(z<5)return [40,26,16]; if(z<26)return (Math.floor(a*3)%2&&z>8&&z<23)?[66,42,26]:[74,48,30]; if(z<28)return [120,86,52]; if(z>A.WH-6)return [214,198,164];
      const n=.95+.05*A.hs(Math.floor(a*30),Math.floor(z/3),2); return [206*n,186*n,150*n]; });
    const put=(G,k,u,v,du,dv,o={})=>{ const g=G&&G[k]; if(!g)return null; const bb=g.boundingBox, s=o.s||1, me=new THREE.Mesh(g,KIT.mat), grp=new THREE.Group(), p=F.pw(u,v);
      me.position.set(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2); me.castShadow=o.shadow!==false; me.receiveShadow=true; grp.add(me); grp.scale.setScalar(MW*s); grp.position.set(p[0],(o.h||0)*MW,p[1]); grp.rotation.y=F.hd(du,dv); A.add(grp); return grp; };
    const sitIn=(name,u,v,h,du,dv,w)=>use(name,u,v,w,1.1,()=>{ const p=F.pw(u,v); USE.sitAt(p[0],p[1],h*MW,F.hd(du,dv)); setTimeout(()=>LIB.open(),600); },1.2);
    const warm=(u,v,h,i,r,c=0xffc887)=>A.lamp(tx(u),ty(v),h/TM,c,i*3.2,r*1.6);
    const G=GEO, d=LIB.data; if(!d)return;
    { const p0=F.pw(0,0), pu=F.pw(1,0), pv=F.pw(0,1), a=pu[0]-p0[0], b=pv[0]-p0[0], c=pu[1]-p0[1], e=pv[1]-p0[1], det=a*e-b*c; KEEP={loc:(x,z)=>[(e*(x-p0[0])-b*(z-p0[1]))/det,(a*(z-p0[1])-c*(x-p0[0]))/det],W:Wb,side:.55+5*BC.W,in:.42-BC.Z0}; }   // the camera stays in front of the cases
    // the cases round one floor: six on the back wall, five down each side, the front left to the counter and the window
    const ROW=[...[0,1,2,3,4,5].map(j=>[(Wb-6*BC.W)/2+(j+.5)*BC.W,-BC.Z0+.01,0,1]),...[0,1,2,3,4].map(j=>[-BC.Z0+.01,.55+(j+.5)*BC.W,1,0]),...[0,1,2,3,4].map(j=>[Wb+BC.Z0-.01,.55+(j+.5)*BC.W,-1,0])];
    d.cases.slice(0,16).forEach((C,i)=>{ const [u,v,du,dv]=ROW[i], M=caseMesh(C), p=F.pw(u,v); M.scale.setScalar(MW); M.position.set(p[0],0,p[1]); M.rotation.y=F.hd(du,dv); A.add(M);
      const hw=BC.W/2, bk=-BC.Z0+.01, fr=BC.FZ+.06; if(dv)sol(u-hw,v-bk,u+hw,v+fr); else sol(Math.min(u-du*bk,u+du*fr),v-hw,Math.max(u-du*bk,u+du*fr),v+hw);
      ['BOTTOM','LOW','HIGH','TOP'].forEach((nm,r)=>{ const hh=rowTop(r)-BC.SH[r], th=use(C.name+': '+nm+' SHELF',u+du*.5,v+dv*.5,.9,hh,()=>LIB.look(i,r),1.4); th.obj.position.y=(BC.SH[r]+hh/2)*MW; th.tall=(BC.SH[r]+hh)*MW; }); });
    // the middle: a rug, two armchairs and a velvet chair round a small table with its lamp, a floor lamp; the window's radiator and curtains; Polyfork's counter by the door, a lectern and a book trolley where the side cases end
    put(G,'rug2',Wb/2,D*.54,1,0,{s:.95,shadow:false}); put(G,'armchair',Wb*.36,D*.5,1,.2); put(G,'tubchair',Wb*.64,D*.5,-1,.2); put(G,'tubchair',Wb/2,D*.7,0,-1);
    put(G,'lectern',Wb-.9,6.2,-1,0); put(G,'trolley2',.75,6.3,1,0); sol(Wb-1.15,5.95,Wb-.65,6.45); sol(.5,5.8,1.0,6.8);
    put(G,'sidetable',Wb/2,D*.47,0,1); put(G,'tablelamp',Wb/2,D*.47,0,1,{h:.51,shadow:false}); put(G,'bookstack',Wb/2+.08,D*.47+.08,0,1,{h:.51,shadow:false}); put(G,'floorlamp',Wb*.26,D*.38,1,0); put(G,'blanket',Wb*.36,D*.5,1,.2,{h:.42,shadow:false});
    // the wall between the books and the café: the side cases on its book side, open from where they end to the front
    { const pe=.55+5*BC.W+.1; box(Wb-.06,0,Wb+.06,pe,0,HT,0xcebd96); box(Wb-.07,0,Wb+.07,pe,0,.6,0x4a301e); box(Wb-.08,pe-.06,Wb+.08,pe,0,HT,0x5a3a24); sol(Wb-.08,0,Wb+.08,pe); }
    cafe(A,G,put,box,sol,use,K,F,W,D,Wb,HT,warm);
    const hfg=8/2-.3, GL={left:[W/2+(-hfg+.08)*TM,W/2-1.53*TM],right:[W/2+1.53*TM,W/2+(hfg-.08)*TM]}; put(G,'radiator',(GL.right[0]+GL.right[1])/2,D-.08,0,-1,{shadow:false}); for(const u of [...GL.left,...GL.right])put(G,'curtain',u+(u===GL.left[0]||u===GL.right[0]?-.12:.12),D-.14,0,-1,{shadow:false,s:.9});
    { const cu=W/2-2.2, cv=D-1.1; put(G,'desk',cu,cv,0,-1); sol(cu-1,cv-.6,cu+1,cv+.6); put(G,'tablelamp',cu+.6,cv,0,-1,{h:1.1,shadow:false}); put(G,'book',cu-.3,cv-.3,0,-1,{h:1.1,shadow:false});
      use('RETURNS',cu,cv,1.4,1.1,()=>{ if(!S.b.length)return say('YOU HAVE NOTHING OF OURS. TAKE SOMETHING.'); load().then(()=>{ for(const id of S.b.slice())LIB.giveBack(id); say('THE PROFESSOR TAKES THEM BACK AND SHELVES THEM.'); }); }); }
    // the front wall's real glass (the panes are the shop's own, 059i: the street seen through them): frames round the two doors and both windows, brass bars on the doors
    { const cxm=W/2, dwm=1.25*TM, hf=8/2-.3, fr=0x2e3a32, m=z=>z/24*TM, tm=o=>cxm+o*TM;
      const frame=(o0,o1,z0,z1)=>{ const u0=tm(o0), u1=tm(o1); box(u0-.05,D-.07,u0,D,m(z0),m(z1),fr); box(u1,D-.07,u1+.05,D,m(z0),m(z1),fr); box(u0-.05,D-.07,u1+.05,D,m(z0)-.05,m(z0),fr); box(u0-.05,D-.07,u1+.05,D,m(z1),m(z1)+.05,fr); };
      frame(-hf+.08,-1.25-.28,19,89); frame(1.25+.28,hf-.08,19,89); frame(-1.25+.12,-.06,12,86); frame(.06,1.25-.12,12,86);
      for(const sgn of [-1,1])box(cxm+sgn*.32-.15,D-.11,cxm+sgn*.32+.15,D-.08,1.05,1.09,0xb8923a);
      box(tm(-hf+.08)-.05,D-.2,tm(-1.25-.28)+.05,D-.07,m(19)-.05,m(19),0x4a2e1c); box(tm(1.25+.28)-.05,D-.2,tm(hf-.08)+.05,D-.07,m(19)-.05,m(19),0x4a2e1c); }   // the window sills
    for(const [u,v] of [[Wb*.12,D-.55],[W-Wb*.12,D-.55],[Wb/2,D*.3],[Wb*.25,D*.62],[Wb*.75,D*.62]]){ const hp=put(G,'hangplant',u,v,0,1,{h:2.3,s:1.2,shadow:false}); if(hp)PLANTS.push(hp); box(u-.004,v-.004,u+.004,v+.004,3.2,HT,0x3a2a1a); }
    put(G,'clock',Wb*.6,D-.02,0,-1,{h:2.25}); put(G,'plant',.45,D-.45,0,-1); put(G,'globe',W/2-2.2+.45,D-.85,0,1,{h:1.0,s:1.3,shadow:false});
    sitIn('ARMCHAIR: SIT AND READ',Wb*.36,D*.5,.45,1,.2,.9); sitIn('VELVET CHAIR: SIT AND READ',Wb*.64,D*.5,.45,-1,.2,.8); sitIn('VELVET CHAIR: SIT AND READ',Wb/2,D*.7,.45,0,-1,.8);
    // the light: two glass pendants and the lamps, warm and low; a warm fill off the wood
    for(const [u,v] of [[Wb*.35,D*.4],[Wb*.65,D*.4]]){ box(u-.005,v-.005,u+.005,v+.005,3.4,HT,0x1c1c1c); K.glow(()=>K.ball(u,v,3.3,.09,0xfff0d0)); warm(u,v,3.1,1.3,6,0xffd29a); }
    warm(Wb/2,D*.47,.95,1.2,4,0xffc070); warm(Wb*.26,D*.38,1.7,1.1,5,0xffc27a); warm(W/2-2.3,D-.97,1.3,.8,4,0xffd090);
    A.add(new THREE.HemisphereLight(0xffd6a0,0x4a2414,1.5));
    { const u=Wb/2-.3, v=D*.42, h=3.0, R=.48, ring=new THREE.Mesh(new THREE.TorusGeometry(R*MW,.014*MW,6,32),new THREE.MeshLambertMaterial({color:0xb8923a})), p=F.pw(u,v);
      ring.rotation.x=Math.PI/2; ring.position.set(p[0],(h+.36)*MW,p[1]); A.add(ring); box(u-.006,v-.006,u+.006,v+.006,h+.4,HT,0x1c1c1c); K.cyl(u,v,.04,h+.2,h+.42,0xb8923a);
      box(u-R,v-.008,u+R,v+.008,h+.35,h+.37,0xb8923a); box(u-.008,v-R,u+.008,v+R,h+.35,h+.37,0xb8923a);
      for(let i=0;i<8;i++){ const a=i/8*Math.PI*2, uu=u+Math.cos(a)*R, vv=v+Math.sin(a)*R; K.cyl(uu,vv,.022,h+.36,h+.44,0xb8923a); K.glow(()=>K.ball(uu,vv,h+.5,.05,0xfff0d0)); } warm(u,v,h+.4,1.6,9,0xffd29a); }   // a brass ring of lamps high over the room: an open ring on a cross, a lamp on each of its eight cups
    K.glow(()=>{ for(const [u,v,h,r] of [[Wb/2,D*.47,.9,.07],[Wb*.26,D*.38,1.62,.1]])K.cyl(u,v,r*.6,h-.02,h+.04,0xfff0c0); });
    { const N=90, P=new Float32Array(N*3), Vv=[]; for(let i=0;i<N;i++){ const p=F.pw(W*.2+Math.random()*W*.6,D*.2+Math.random()*D*.6); P[i*3]=p[0]; P[i*3+1]=(.3+Math.random()*(HT-.6))*MW; P[i*3+2]=p[1]; Vv.push([(Math.random()-.5)*.02,(Math.random()-.4)*.01,(Math.random()-.5)*.02]); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); const m=new THREE.PointsMaterial({color:0xffe2b0,size:.022*MW,transparent:true,opacity:.5,depthWrite:false});
      const pts=new THREE.Points(g,m); A.add(pts); DUST={pts,P,V:Vv,y0:.2*MW,y1:(HT-.3)*MW,t:0}; }
    for(const f of LIB.inside)f({A,F,K,W:Wb,D});   // (the books' half: what furnishes it reads its width)
    K.flush(); };
  MSHOP.kit.books.drop=()=>{ DUST=null; KEEP=null; PLANTS.length=0; };
  // a hanging plant between the camera and you steps aside (it is hidden), so its vines never fill the view
  const PLANTS=[]; SYS.add('places',()=>{ if(!PLANTS.length||!PLANTS[0].parent)return; const c=SHARED.cam.position, r=.9*IKIT.MW, ax=pos.x-c.x, az=pos.z-c.z, L2=ax*ax+az*az||1; for(const g of PLANTS){ const dx=g.position.x-c.x, dz=g.position.z-c.z, f=Math.max(0,Math.min(1,(dx*ax+dz*az)/L2)), ex=dx-ax*f, ez=dz-az*f; g.visible=ex*ex+ez*ez>r*r; } },'144ca-plants');   // (near the line from the camera to you)
  // the third person's camera stays out of the cases round the walls, pulled in along the line to you (as a room keeps it within its walls)
  let KEEP=null; UI.camKeeps.push((c,t)=>{ if(!KEEP||!UI.persp)return; const K_=KEEP, [cu,cv]=K_.loc(c.x,c.z), [tu,tv]=K_.loc(t.x,t.z), du=cu-tu, dv=cv-tv, m=K_.in; let k=1; if(tu>K_.W)return;
    if(cv<m&&dv<-1e-6)k=Math.min(k,Math.max(0,(m-tv)/dv));
    for(const [lim,s] of [[m,-1],[K_.W-m,1]]){ const out=s<0?cu<lim:cu>lim; if(out&&s*du>1e-6){ const f=Math.max(0,(lim-tu)/du), vAt=tv+dv*f; if(vAt<K_.side)k=Math.min(k,f); } }
    if(k<1)c.lerpVectors(t,c,k); });
  SYS.add('places',dt=>{ if(!DUST||!DUST.pts.parent)return; const {P,V}=DUST, MW=IKIT.MW, k=(dt||0)*MW*.5; DUST.t+=dt||0; for(let i=0;i<V.length;i++){ const j=i*3; P[j]+=V[i][0]*k+Math.sin(DUST.t*.3+i)*.0006*MW; P[j+1]+=V[i][1]*k; P[j+2]+=V[i][2]*k; if(P[j+1]>DUST.y1||P[j+1]<DUST.y0)V[i][1]*=-1; } DUST.pts.geometry.attributes.position.needsUpdate=true; },'144ca-library');
  /* ---------- outside: polyfork's hanging sign, a cart of books, hanging baskets by the doors and flower planters under the windows (data/bookfront.json, loaded when you come near) ---------- */
  { const FJ=__LAZY__("data/bookfront.json"); let done=false, chk=0;
    SYS.add('places',dt=>{ if(done||(chk-=dt||0)>0)return; chk=1; const at=MSHOP.at&&MSHOP.at.books, o=ROOMS.off&&ROOMS.off.books; if(!at||!o)return;
      if(Math.hypot(pos.x-at.door[0],pos.z-at.door[1])>60*IKIT.MW)return; done=true;
      FJ().then(Dd=>{ '@later'; const MW=IKIT.MW, d=at.door, n0=[o.out[0]-d[0],o.out[1]-d[1]], nl=Math.hypot(n0[0],n0[1])||1, n=[n0[0]/nl,n0[1]/nl], tg=[n[1],-n[0]], G=new THREE.Group(); G.name='books-front'; scene.add(G);
        const put=(k,a,b,h,ry=0)=>{ const g=KIT.decode(Dd[k]); g.computeBoundingBox(); const bb=g.boundingBox, me=new THREE.Mesh(g,KIT.mat), grp=new THREE.Group(); me.position.set(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2); me.castShadow=me.receiveShadow=true; grp.add(me);
          const x=d[0]+n[0]*a*MW+tg[0]*b*MW, z=d[1]+n[1]*a*MW+tg[1]*b*MW; grp.scale.setScalar(MW); grp.position.set(x,(SHARED.groundY?SHARED.groundY(x,z):0)+h*MW,z); grp.rotation.y=Math.atan2(n[0],n[1])+ry; G.add(grp); return grp; };
        put('sign',.35,4.6,2.0,Math.PI/2); put('trolley',1.1,3.4,0,Math.PI/2); for(const b of [-1.5,1.5])put('hangplant',.4,b,1.7); for(const b of [-2.6,2.6])put('planter',.25,b,0); }).catch(()=>{ done=false; }); },'144ca-library'); }
  window.LIBDBG=()=>({look:VW.hidden?null:{ci:V.ci,row:V.row,rot:V.rot,s:+V.s.toFixed(1),caseFit:+(Math.min(VC.clientWidth/(BC.W+.2),VC.clientHeight/(BC.H+.3))*.92).toFixed(1)},data:!!LIB.data,n:LIB.data?LIB.data.books.length:0,borrowed:S.b.slice(),panel:!P.hidden,reading:cur?{id:cur.b.id,c:cur.c,chapters:cur.ch.length,paras:cur.P.length,p:(posOf()||{}).p,marks:((posOf()||{}).m||[]).length,set:SET()}:null,shop:!!(MSHOP.at&&MSHOP.at.books)});
}
export {LIB};
