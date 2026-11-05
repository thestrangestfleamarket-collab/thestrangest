// THE BOOKSTORE: a lending library on West St kept by the Professor: 100 public-domain books (data/books.json) on its shelves with their first editions' covers; borrow up to five free and read them anywhere; a book's text (Project Gutenberg) downloads only when it is opened.
import {THREE} from './003-shx.js';
import {FORAGE, INSPECT, SFX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {IKIT} from './038zc-ikit.js';
import {MSHOP} from './059i-mshops.js';
const LIB={data:null,max:5}; window.LIB=LIB;
{ const BJ=__LAZY__("data/books.json"), say=(t,c)=>SAY(t,c||'#e8d6a8'), TM=.924;
  LIB.files={};   // id -> the cover's file (and spine's, id+'~s'), filled below from the baked list
  const load=()=>LIB.data?Promise.resolve(LIB.data):BJ().then(d=>{ LIB.data=d; LIB.by=Object.fromEntries(d.books.map(b=>[b.id,b])); names(); return d; });
  const S={v:1,b:[],p:{}}; try{ const D=JSON.parse(OWNED.get('library')||'null'); if(D&&D.v===1)Object.assign(S,D); }catch(e){} const save=()=>OWNED.set('library',JSON.stringify(S));
  LIB.S=S;
  const cover=id=>LIB.files[id]||'', spineF=id=>LIB.files[id+'~s']||'';
  // a borrowed book is a thing in your pack you can open anywhere
  const names=()=>{ if(!LIB.data)return; FORAGE.add({names:Object.fromEntries(LIB.data.books.map(b=>['lb_'+b.id,'LIBRARY BOOK: '+b.t]))}); };
  FORAGE.ROWB.push(id=>/^lb_/.test(id)?[['READ','lread']]:[]);
  FORAGE.ACT.lread=id=>LIB.read(id.slice(3));
  if(window.INSPECT&&INSPECT.kinds)INSPECT.kinds.push({is:id=>/^lb_/.test(id),make:id=>{ const b=LIB.by&&LIB.by[id.slice(3)]; const c=b&&b.col?parseInt(b.col.slice(1),16):0x6a3a2a; return INSPECT.shape('book',c,0xf2ead6); }});
  if(S.b.length)load().catch(()=>{});
  const borrowed=id=>S.b.includes(id);
  LIB.borrow=id=>{ if(borrowed(id))return say('THAT ONE IS ALREADY IN YOUR PACK.'); if(S.b.length>=LIB.max)return say('FIVE AT A TIME. BRING ONE BACK FIRST.','#c8a090');
    S.b.push(id); save(); FORAGE.give('lb_'+id,1); if(FORAGE.draw)FORAGE.draw(); say('BORROWED: '+LIB.by[id].t+'. READ IT ANYWHERE FROM YOUR PACK.'); if(SFX)SFX.play('page',{vol:.5}); };
  LIB.giveBack=id=>{ if(!borrowed(id))return; S.b=S.b.filter(x=>x!==id); save(); if(FORAGE.has('lb_'+id))FORAGE.take('lb_'+id,FORAGE.has('lb_'+id)); if(FORAGE.draw)FORAGE.draw(); say('RETURNED: '+LIB.by[id].t+'.'); };

  /* ---------- the windows: the catalogue (every cover, by kind or a search) and one book's card ---------- */
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const P=document.createElement('div'); P.id='libp'; P.hidden=true;
  P.style.cssText='position:fixed;left:50%;top:6%;transform:translateX(-50%);width:min(760px,94vw);max-height:84vh;overflow:auto;z-index:22;padding:12px 14px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#3b2a1e;background:#ece5d3;border:3px solid #3b2a1e;zoom:var(--uiz,1)';
  const css=document.createElement('style'); css.textContent='#libp .btn,#libr .btn{font:inherit;padding:4px 8px;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer} #libp .btn.on{background:#3b2a1e;color:#ece5d3} #libp .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:10px;margin-top:10px} #libp .bk{cursor:pointer;text-align:center} #libp .bk img{width:88px;height:128px;object-fit:cover;border:1px solid #3b2a1e;background:#cfc4ae;box-shadow:2px 2px 0 #3b2a1e55} #libp .bk div{font-size:9px;margin-top:3px;line-height:1.2} #libp input{font:inherit;padding:4px;border:2px solid #3b2a1e;background:#f6f0e2;width:180px} #libp .mine{outline:3px solid #b8862a}';
  document.head.appendChild(css); document.body.appendChild(P);
  let tab='ALL', q='';
  const list=()=>{ const B=LIB.data.books; return B.filter(b=>(tab==='ALL'||(tab==='BORROWED'?borrowed(b.id):String(b.genre).toUpperCase()===tab))&&(!q||(b.t+' '+b.a).toLowerCase().includes(q.toLowerCase()))); };
  const drawCat=()=>{ const G=['ALL','BORROWED',...[...new Set(LIB.data.books.map(b=>String(b.genre).toUpperCase()))]];
    P.innerHTML=`<div><b>THE BOOKSTORE · A LENDING LIBRARY</b> <button class="btn" data-a="x" style="float:right">DONE</button></div>
      <div style="margin:6px 0;color:#6a4a32">${LIB.data.books.length} BOOKS, ALL FREE TO BORROW. YOU HAVE ${S.b.length} OF ${LIB.max}.</div>
      <div>${G.map(g=>`<button class="btn ${g===tab?'on':''}" data-t="${esc(g)}">${esc(g)}</button>`).join(' ')} <input data-q placeholder="TITLE OR AUTHOR" value="${esc(q)}"></div>
      <div class="grid">${list().map(b=>`<div class="bk ${borrowed(b.id)?'mine':''}" data-b="${b.id}"><img loading="lazy" alt="" src="${esc(cover(b.id))}"><div>${esc(b.t)}<br><span style="color:#7a5a40">${esc(b.a)}</span></div></div>`).join('')||'<div>NOTHING ON THE SHELF BY THAT NAME.</div>'}</div>`; };
  const drawCard=id=>{ const b=LIB.by[id], m=borrowed(id), pg=S.p[id];
    P.innerHTML=`<div><button class="btn" data-a="back">&lt; THE SHELVES</button> <button class="btn" data-a="x" style="float:right">DONE</button></div>
      <div style="display:flex;gap:14px;margin-top:10px;flex-wrap:wrap"><img src="${esc(cover(id))}" alt="" style="width:200px;border:2px solid #3b2a1e;background:#cfc4ae">
      <div style="flex:1;min-width:220px"><div style="font-size:14px"><b>${esc(b.t)}</b></div><div style="margin:4px 0 8px">${esc(b.a)} · ${b.y}</div>
      <div style="color:#6a4a32">THE COVER: ${esc(b.ed)}</div><div style="color:#6a4a32;margin-top:4px">${b.words?'ABOUT '+Math.round(b.words/1000)+',000 WORDS · ':''}${esc(String(b.genre).toUpperCase())}</div>
      <div style="margin-top:12px;display:flex;gap:6px;flex-wrap:wrap"><button class="btn" data-a="read" data-b="${id}">${pg?'READ ON':'READ HERE'}</button>
      ${m?`<button class="btn" data-a="ret" data-b="${id}">GIVE IT BACK</button>`:`<button class="btn" data-a="bor" data-b="${id}">BORROW IT (FREE)</button>`}</div>
      <div style="margin-top:10px;color:#8a6a50;font-size:9px">THE TEXT: PROJECT GUTENBERG'S EDITION, DOWNLOADED WHEN YOU OPEN IT.</div></div></div>`; };
  let atShop=false;
  LIB.open=(id,shop=true)=>load().then(()=>{ atShop=shop; P.hidden=false; if(id&&LIB.by[id])drawCard(id); else drawCat(); }).catch(e=>{ console.warn('LIB: the list did not load',e); say('THE CATALOGUE IS STUCK. TRY AGAIN.','#c8a090'); });
  LIB.close=()=>{ P.hidden=true; };
  P.addEventListener('click',e=>{ const t=e.target.closest('[data-a],[data-t],[data-b]'); if(!t)return; const a=t.dataset.a;
    if(a==='x')return LIB.close(); if(a==='back')return drawCat(); if(t.dataset.t){ tab=t.dataset.t; return drawCat(); }
    const id=t.dataset.b; if(a==='read'){ LIB.close(); return LIB.read(id); } if(a==='bor'){ if(!atShop)return say('BORROW IT AT THE BOOKSTORE.'); LIB.borrow(id); return drawCard(id); } if(a==='ret'){ LIB.giveBack(id); return drawCard(id); }
    if(id)drawCard(id); });
  P.addEventListener('input',e=>{ if(e.target.dataset.q==null)return; q=e.target.value; const c=e.target.selectionStart; drawCat(); const i=P.querySelector('[data-q]'); i.focus(); i.setSelectionRange(c,c); });
  for(const ev of ['keydown','keyup','keypress'])P.addEventListener(ev,e=>{ if(e.key==='Escape'&&ev==='keydown')LIB.close(); e.stopPropagation(); });

  /* ---------- the reader: two pages, the lines laid out once with the page's own font, turned with the arrows or a click; your place kept ---------- */
  const TX={}, R=document.createElement('div'); R.id='libr'; R.hidden=true; R.tabIndex=-1;
  R.style.cssText='position:fixed;inset:0;z-index:23;background:rgba(10,8,6,.82);display:flex;align-items:center;justify-content:center;outline:none';
  document.body.appendChild(R);
  const FONT='17px Georgia, "Times New Roman", serif', LH=24, PW=380, PH=560, PAD=34, LPP=Math.floor((PH-PAD*2-20)/LH);
  const url=b=>location.protocol==='file:'?'https://www.gutenberg.org/cache/epub/'+b.pg+'/pg'+b.pg+'.txt':'/book/'+b.pg+'.txt';
  LIB.url=url;
  // the book's own words: without Project Gutenberg's header and licence, its paragraphs joined back from the hard-wrapped lines
  const clean=txt=>{ txt=txt.replace(/\r/g,''); const s=txt.search(/\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG[^\n]*\n/i); if(s>=0)txt=txt.slice(txt.indexOf('\n',s)+1); const e=txt.search(/\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG/i); if(e>=0)txt=txt.slice(0,e);
    return txt.split(/\n\s*\n/).map(p=>p.replace(/\s*\n\s*/g,' ').replace(/_/g,'').trim()).filter(Boolean); };
  const mc=document.createElement('canvas').getContext('2d');
  const lay=paras=>{ mc.font=FONT; const W=PW-PAD*2, L=[]; for(const p of paras){ const words=p.split(' '); let line='';
      for(const w of words){ const t=line?line+' '+w:w; if(mc.measureText(t).width>W&&line){ L.push(line); line=w; } else line=t; } if(line)L.push(line); L.push(''); } return L; };
  let cur=null;
  const page=(i,side)=>{ const B=cur, lines=B.L.slice(i*LPP,(i+1)*LPP); return `<div style="width:${PW}px;height:${PH}px;box-sizing:border-box;padding:${PAD}px;background:#f4ecd8;${side?'border-left:1px solid #d8cdb2;box-shadow:inset 8px 0 14px -10px #0006':'box-shadow:inset -8px 0 14px -10px #0006'};position:relative;font:${FONT};line-height:${LH}px;color:#2a2018;white-space:pre">${lines.map(l=>esc(l)||' ').join('\n')}<div style="position:absolute;bottom:14px;${side?'right':'left'}:${PAD}px;font:11px Georgia,serif;color:#8a7a60">${i+1}</div></div>`; };
  const draw=()=>{ const B=cur, n=Math.ceil(B.L.length/LPP), i=Math.max(0,Math.min(B.i,n-1))&~1; B.i=i; S.p[B.b.id]=i; save();
    R.innerHTML=`<div style="display:flex;flex-direction:column;align-items:center;gap:8px;zoom:var(--uiz,1)"><div style="font:11px Silkscreen,monospace;color:#ece5d3">${esc(B.b.t)} · ${esc(B.b.a)} <button class="btn" data-a="x" style="margin-left:10px">CLOSE</button></div>
      <div style="display:flex;box-shadow:0 10px 40px #000a" data-a="turn">${page(i,0)}${i+1<n?page(i+1,1):`<div style="width:${PW}px;height:${PH}px;background:#f4ecd8"></div>`}</div>
      <div style="font:11px Silkscreen,monospace;color:#cfc4ae"><button class="btn" data-a="prev">&lt;</button> PAGES ${i+1}–${Math.min(i+2,n)} OF ${n} <button class="btn" data-a="next">&gt;</button></div></div>`; };
  const turn=d=>{ if(!cur)return; const n=Math.ceil(cur.L.length/LPP), j=cur.i+d*2; if(j<0||j>=n)return; cur.i=j; draw(); if(SFX)SFX.play('page',{vol:.35,vary:.2}); };
  LIB.read=id=>load().then(async()=>{ const b=LIB.by[id]; if(!b)return; R.hidden=false; R.innerHTML='<div style="font:12px Silkscreen,monospace;color:#ece5d3">OPENING '+esc(b.t)+'...</div>'; R.focus();
    try{ if(!TX[id]){ const r=await fetch(url(b)); if(!r.ok)throw new Error(r.status); TX[id]=lay(clean(await r.text())); }
      cur={b,L:TX[id],i:S.p[id]||0}; draw(); R.focus(); }
    catch(e){ console.warn('LIB: the text did not come',e); R.innerHTML='<div style="font:12px Silkscreen,monospace;color:#ece5d3;text-align:center">THE PAGES WILL NOT OPEN RIGHT NOW.<br><br><button class="btn" data-a="x">CLOSE</button></div>'; } });
  LIB.closeBook=()=>{ R.hidden=true; R.innerHTML=''; cur=null; };
  R.addEventListener('click',e=>{ const t=e.target.closest('[data-a]'); if(!t)return; const a=t.dataset.a; if(a==='x')return LIB.closeBook(); if(a==='prev')return turn(-1); if(a==='next')return turn(1);
    if(a==='turn'){ const r=t.getBoundingClientRect(); turn(e.clientX<r.left+r.width/2?-1:1); } });
  for(const ev of ['keydown','keyup','keypress'])R.addEventListener(ev,e=>{ if(ev==='keydown'){ if(e.key==='Escape')LIB.closeBook(); else if(e.key==='ArrowRight'||e.key===' ')turn(1); else if(e.key==='ArrowLeft')turn(-1); } e.stopPropagation(); e.preventDefault(); });

  /* ---------- the shop: shelves to the ceiling, the hundred on the back wall at eye height, the new arrivals face-up on the table, the reading chair, the Professor's counter by the door ---------- */
  // a shelf's painted front: rows of spines; the hundred (their colour, gold title and author, or the real spine when there is one) where given, old cloth bindings elsewhere
  const shelfTex=(w,rows,real)=>{ const H=rows*64, c=document.createElement('canvas'); c.width=w; c.height=H; const g=c.getContext('2d'), rnd=(i,j)=>{ const x=Math.sin(i*127.1+j*311.7)*43758.5453; return x-Math.floor(x); };
    g.fillStyle='#3a2416'; g.fillRect(0,0,w,H); const hits=[];
    for(let r=0;r<rows;r++){ const y0=r*64; g.fillStyle='#5a3a22'; g.fillRect(0,y0+58,w,6); let x=4, k=0; const mine=real&&real[r]||[];
      while(x<w-6){ const b=mine[k]; const bw=b?14:8+Math.floor(rnd(x,r)*8), bh=b?52:34+Math.floor(rnd(r,x)*20); if(x+bw>w-4)break;
        const col=b?(b.col||'#6a3a2a'):['#5a2a24','#24364e','#2e4a30','#6a5a34','#3a2a48','#1e1e22','#7a6a52'][Math.floor(rnd(x*3,r)*7)];
        g.fillStyle=col; g.fillRect(x,y0+58-bh,bw,bh); g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(x+bw-2,y0+58-bh,2,bh);
        g.fillStyle=b?'#d8b860':'rgba(216,184,96,.55)'; g.fillRect(x+2,y0+62-bh,bw-4,2); g.fillRect(x+2,y0+54,bw-4,2);
        if(b){ g.save(); g.translate(x+bw/2+3,y0+54); g.rotate(-Math.PI/2); g.font='bold 8px Georgia,serif'; g.fillStyle='#ecd48c'; g.fillText(b.t.slice(0,11),2,0); g.restore(); hits.push([b.id,x,y0+58-bh,bw,bh]); k++; }
        x+=bw+(rnd(k,x)>.92?6:1); } }
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4;
    // the real spines, where there are, drawn over their place once they come
    for(const [id,x,y,bw,bh] of hits){ const f=spineF(id); if(!f)continue; const im=new Image(); im.onload=()=>{ g.drawImage(im,x,y,bw,bh); t.needsUpdate=true; }; im.src=f; }
    return t; };
  MSHOP.kit.books=A=>{ '@later'; const R=A.R, F=IKIT.frame(R), K=IKIT.room(F,o=>A.add(o),()=>{}), t=d=>d*TM, sol=(x0,y0,x1,y1)=>A.sol(R.x0+x0,R.y0+y0,R.x0+x1,R.y0+y1), {box,cyl,pic,words,use,seat}=K, W=t(R.x1-R.x0), D=t(R.y1-R.y0);
    const C={wood:0x5a3a22,dark:0x2e1e14,green:0x2e4a3a,brass:0xb8923a,cream:0xe6dcc4,rug:0x7a2a24};
    A.floor((x,y)=>{ const u=(x-R.x0)*4, v=(y-R.y0); const pl=Math.floor(v*3), s=.86+.14*A.hs(Math.floor(u/3+pl*7),pl,5); const e=(v*3)%1<.06?.7:1; return [118*s*e,78*s*e,48*s*e]; });
    for(const sd of ['b','w','e','f'])A.wall(sd,(a,z)=>z<12?[60,40,26]:z<14?[150,120,70]:[54,74,62].map(c=>c*(.94+.08*A.hs(Math.floor(a*3),Math.floor(z/8),9))));
    const H=3.1;
    // the back wall's case, its middle three rows the hundred; the side walls' cases
    box(.15,0,W-.15,.42,0,H,C.wood); box(.15,.38,W-.15,.42,H-.12,H,C.dark); sol(.1,0,R.x1-R.x0-.1,.5);
    box(0,.6,.42,D*.72,0,H,C.wood); sol(0,.6,.5,(D*.72)/TM);
    box(W-.42,.6,W,D*.55,0,H,C.wood); sol(R.x1-R.x0-.5,.6,R.x1-R.x0,(D*.55)/TM);
    load().then(d=>{ const B=d.books, per=Math.ceil(B.length/3), real=[[],B.slice(0,per),B.slice(per,per*2),B.slice(per*2),[]];
      pic(W/2,.43,.15,W-.4,H-.3,0,1,shelfTex(1536,5,real)); pic(.43,D*.36+.3,.15,D*.72-.6,H-.3,1,0,shelfTex(1024,5,null)); pic(W-.43,D*.275+.3,.15,D*.55-.6,H-.3,-1,0,shelfTex(800,5,null));
      // the new arrivals: eight covers face-up on the table
      B.slice(0,8).forEach((b,i)=>{ const im=new Image(), tx=new THREE.Texture(im); tx.colorSpace=THREE.SRGBColorSpace; im.onload=()=>{ tx.needsUpdate=true; }; im.src=cover(b.id);
        const m=pic(W/2-1.05+(i%4)*.7,D*.5-.25+Math.floor(i/4)*.5,.79,.3,.42,0,1,tx); m.rotation.x=-Math.PI/2+.25; }); }).catch(()=>{});
    use('THE SHELVES: ALL HUNDRED',W/2,.9,2.4,2.2,()=>LIB.open());
    use('THE SHELVES',.9,D*.4,1.2,2.2,()=>LIB.open()); use('THE SHELVES',W-.9,D*.3,1.2,2.2,()=>LIB.open());
    // a ladder on its rail
    box(W*.66,.5,W*.66+.06,.58,0,H-.1,C.wood); box(W*.66+.42,.5,W*.66+.48,.58,0,H-.1,C.wood); for(let i=1;i<9;i++)box(W*.66,.5,W*.66+.48,.56,i*.32,i*.32+.04,C.wood); box(.2,.5,W-.2,.54,H-.2,H-.16,C.brass);
    // the table of new arrivals
    box(W/2-1.4,D*.5-.6,W/2+1.4,D*.5+.6,.72,.78,C.wood); for(const [x,y] of [[-1.3,-.5],[1.3,-.5],[-1.3,.5],[1.3,.5]])box(W/2+x-.05,D*.5+y-.05,W/2+x+.05,D*.5+y+.05,0,.72,C.dark);
    sol((W/2-1.4)/TM,(D*.5-.6)/TM,(W/2+1.4)/TM,(D*.5+.6)/TM); use('NEW ARRIVALS',W/2,D*.5,2.8,1.1,()=>LIB.open());
    // the reading chair, its lamp and rug
    box(1.2,D*.74,3.4,D*.74+1.6,0,.01,C.rug);
    const ch=K.own(()=>{ box(1.5,D*.78,2.4,D*.78+.8,.0,.42,C.green); box(1.5,D*.78+.66,2.4,D*.78+.8,.42,1.05,C.green); box(1.5,D*.78,1.62,D*.78+.8,.42,.66,C.green); box(2.28,D*.78,2.4,D*.78+.8,.42,.66,C.green); });
    seat('READING CHAIR',ch,[[1.95,D*.78+.38,.44,0,-1]]);
    cyl(3.0,D*.8,.14,0,.04,C.brass); cyl(3.0,D*.8,.02,0,1.5,C.brass); K.glow(()=>cyl(3.0,D*.8,.2,1.38,1.62,0xf0d8a0,.12));
    // the Professor's counter by the door, its till and bell, the returns slot
    box(W/2+1.8,D-2.1,W-.6,D-1.5,0,1.0,C.wood); box(W/2+1.75,D-2.15,W-.55,D-1.45,1.0,1.05,C.dark); sol((W/2+1.8)/TM,(D-2.1)/TM,(W-.6)/TM,(D-1.5)/TM);
    cyl(W-1.2,D-1.8,.06,1.05,1.12,C.brass); box(W-2.0,D-1.95,W-1.6,D-1.65,1.05,1.25,0x3a3a3c);
    pic(W/2+2.6,D-1.49,.35,1.1,.4,0,1,words(96,36,'#2e1e14',[['RETURNS',48,6,'#e8d090',10,'center'],['THANK YOU',48,22,'#c8b080',8,'center']]));
    use('RETURNS',W/2+2.6,D-1.4,1.2,1.1,()=>{ if(!S.b.length)return say('YOU HAVE NOTHING OF OURS. TAKE SOMETHING.'); load().then(()=>{ for(const id of S.b.slice())LIB.giveBack(id); }); });
    A.lamp(R.x0+(R.x1-R.x0)*.5,R.y0+(R.y1-R.y0)*.35,2.8,0xffd8a0,3.2,10); A.lamp(R.x0+(R.x1-R.x0)*.5,R.y0+(R.y1-R.y0)*.75,2.8,0xffd8a0,2.6,9);
    K.flush(); };
  window.LIBDBG=()=>({data:!!LIB.data,n:LIB.data?LIB.data.books.length:0,borrowed:S.b.slice(),panel:!P.hidden,reading:cur?{id:cur.b.id,i:cur.i,lines:cur.L.length,pages:Math.ceil(cur.L.length/LPP)}:null,shop:!!(MSHOP.at&&MSHOP.at.books)});
}
