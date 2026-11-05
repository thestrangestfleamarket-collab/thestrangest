// THE BOOKSTORE: a cozy lending library on West St kept by the Professor: 16 bookcases, one genre each, of 4 shelves of 10 real public-domain books (data/library.json); double-click a case to read its spines; borrow up to five free and read them anywhere; a book's text (Project Gutenberg) downloads only when it is opened.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INSPECT, pos, ROOMS, SFX, USE} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {SYS} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MSHOP} from './059i-mshops.js';
import {KIT} from './068-kit.js';
const LIB={data:null,max:5}; window.LIB=LIB;
{ const BJ=__LAZY__("data/library.json"), say=(t,c)=>SAY(t,c||'#e8d6a8'), TM=.924;
  LIB.files={};   // id -> the cover's file (and spine's, id+'~s'), filled below from the baked list
  const load=()=>LIB.data?Promise.resolve(LIB.data):BJ().then(d=>{ d.books=[]; for(const c of d.cases)for(const b of c.books){ b.genre=c.name; b.case=c.id; d.books.push(b); } LIB.data=d; LIB.by=Object.fromEntries(d.books.map(b=>[b.id,b])); names(); return d; });   // the shop's cases, each one genre of forty
  const S={v:1,b:[],p:{}}; try{ const D=JSON.parse(OWNED.get('library')||'null'); if(D&&D.v===1)Object.assign(S,D); }catch(e){} const save=()=>OWNED.set('library',JSON.stringify(S));
  LIB.S=S;
  const spineF=id=>LIB.files[id+'~s']||'';
  // a book's cover: its edition's scan when there is a public-domain one, else a cloth binding drawn from its title and author, as plain books were bound
  const DRAWN={}, drawn=b=>DRAWN[b.id]||(DRAWN[b.id]=(()=>{ const c=document.createElement('canvas'); c.width=300; c.height=450; const g=c.getContext('2d'); g.fillStyle=b.col||'#5a3a24'; g.fillRect(0,0,300,450);
    for(let i=0;i<2600;i++){ g.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},${Math.random()<.5?0:255},.035)`; g.fillRect(Math.random()*300,Math.random()*450,2,2); }
    g.strokeStyle='#d8b860'; g.lineWidth=3; g.strokeRect(18,18,264,414); g.lineWidth=1; g.strokeRect(26,26,248,398); g.fillStyle='#e6c878'; g.textAlign='center';
    const words=(t,y,sz,max)=>{ g.font=`${sz}px Georgia,serif`; const ws=String(t).split(' '); let l='', yy=y; for(const w of ws){ const tt=l?l+' '+w:w; if(g.measureText(tt).width>max&&l){ g.fillText(l,150,yy); l=w; yy+=sz*1.15; } else l=tt; } g.fillText(l,150,yy); return yy; };
    const y=words(String(b.t).toUpperCase(),150,26,220); g.fillRect(110,y+26,80,2); words(String(b.a).toUpperCase(),y+64,15,220); return c.toDataURL('image/jpeg',.85); })());
  const cover=id=>LIB.files[id]||(LIB.by&&LIB.by[id]?drawn(LIB.by[id]):'');
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
  const css=document.createElement('style'); css.textContent='#libr[hidden],#libp[hidden]{display:none!important} #libp .btn,#libr .btn{font:inherit;padding:4px 8px;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer} #libp .btn.on{background:#3b2a1e;color:#ece5d3} #libp .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:10px;margin-top:10px} #libp .bk{cursor:pointer;text-align:center} #libp .bk img{width:88px;height:128px;object-fit:cover;border:1px solid #3b2a1e;background:#cfc4ae;box-shadow:2px 2px 0 #3b2a1e55} #libp .bk div{font-size:9px;margin-top:3px;line-height:1.2} #libp input{font:inherit;padding:4px;border:2px solid #3b2a1e;background:#f6f0e2;width:180px} #libp .mine{outline:3px solid #b8862a}';
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
      <div style="color:#6a4a32">${LIB.files[id]?'THE COVER: '+esc(b.ed||'an early edition'):'A PLAIN CLOTH BINDING'}</div><div style="color:#6a4a32;margin-top:4px">${b.pages?'ABOUT '+b.pages+' PAGES · ':''}${b.y?b.y+' · ':''}${esc(String(b.genre).toUpperCase())}</div>
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

  /* ---------- the furniture is polyfork's (data/bookstore.json, baked in metres): chairs, rugs, lamps, the radiator and curtains, the clock; loaded behind the fade on the way in ---------- */
  const PJ=__LAZY__("data/bookstore.json"); let PG=null, GEO=null; const pfGeo=()=>PG||(PG=PJ().then(D=>{ const G={}; for(const k in D){ const g=KIT.decode(D[k]); g.computeBoundingBox(); G[k]=g; } return GEO=G; }));
  { let wrapped=false; SYS.add('places',()=>{ if(wrapped)return; const o=ROOMS.off&&ROOMS.off.books; if(!o)return; wrapped=true; const n0=o.need; o.need=()=>Promise.all([n0?n0():null,pfGeo(),load().catch(()=>null)]); },'144ca-library'); }
  let DUST=null;
  /* ---------- a bookcase: four shelves of ten real books, each a spine painted from the book (its cloth, gold bands, title and author; the real spine where one survives), thick or thin by its length ---------- */
  const BC={W:.62,H:2.05,D:.32,SH:[.08,.55,1.02,1.49],IN:.56,BW:.02};   // metres: the case, its shelves' tops, the room inside a shelf, the boards
  const hsh=s=>{ let h=7; for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0; return (h%1000)/1000; };
  const bookDims=b=>({th:.012+(b.pages||300)*.00007,h:.33+hsh(b.id)*.08,d:.23+hsh(b.t)*.05});
  LIB.shelfOf=C=>{ const rows=[0,1,2,3].map(r=>C.books.slice(r*10,r*10+10)); return rows.map(row=>{ const L=row.map(bookDims), sum=L.reduce((a,q)=>a+q.th,0), k=(BC.IN-.012)/sum; let x=-BC.IN/2+.006;   // ten to a shelf, filling it left to right: thick or thin by length
    return row.map((b,i)=>{ const q=L[i], th=q.th*k, o={b,x:x+th/2,th,h:q.h,d:q.d}; x+=th; return o; }); }); };
  // one spine on a canvas: w x h px, x/y its corner
  const paintSpine=(g,x,y,w,h,b,im)=>{ g.save(); g.beginPath(); g.rect(x,y,w,h); g.clip(); g.fillStyle=b.col||'#5a3a24'; g.fillRect(x,y,w,h);
    if(im){ g.drawImage(im,x,y,w,h); g.restore(); return; }
    for(let i=0;i<w*h/30;i++){ g.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},${Math.random()<.5?0:255},.05)`; g.fillRect(x+Math.random()*w,y+Math.random()*h,1,1); }
    g.fillStyle='rgba(0,0,0,.22)'; g.fillRect(x,y,w*.08,h); g.fillRect(x+w*.92,y,w*.08,h); g.fillStyle='rgba(255,255,255,.07)'; g.fillRect(x+w*.12,y,w*.08,h);
    const gold='#e2c272'; g.fillStyle=gold; for(const yy of [y+h*.05,y+h*.09,y+h*.91,y+h*.95])g.fillRect(x+w*.12,yy,w*.76,Math.max(1,h*.006));
    g.translate(x+w/2,y+h*.13); g.rotate(Math.PI/2); g.fillStyle=gold; g.textBaseline='middle';
    const fs=Math.max(6,Math.min(w*.42,h*.07)); g.font=`600 ${fs}px Georgia,serif`; let t=String(b.t).toUpperCase(); const max=h*.56; while(t.length>3&&g.measureText(t).width>max)t=t.slice(0,-2)+'…'; g.fillText(t,0,0);
    g.font=`${fs*.72}px Georgia,serif`; let a=String(b.a).split(' ').pop().toUpperCase(); g.fillText(a,h*.6,0); g.restore(); };
  const IMS={}, spineIm=id=>{ const f=spineF(id); if(!f)return null; if(!IMS[id]){ const im=new Image(); im.src=f; IMS[id]=im; } return IMS[id].complete&&IMS[id].naturalWidth?IMS[id]:null; };
  // the case's mesh, in metres (x across, y up, z out toward the room)
  const caseMesh=C=>{ const G=new THREE.Group(), wood=new THREE.MeshLambertMaterial({color:0x4a2e1c}), boards=[];
    const bx=(w,h,d,x,y,z)=>{ const g=new THREE.BoxGeometry(w,h,d); g.translate(x,y,z); boards.push(g); };
    bx(BC.BW,BC.H,BC.D,-BC.W/2+BC.BW/2,BC.H/2,0); bx(BC.BW,BC.H,BC.D,BC.W/2-BC.BW/2,BC.H/2,0); bx(BC.W,BC.H,.015,0,BC.H/2,-BC.D/2+.008); bx(BC.W+.04,.05,BC.D+.03,0,BC.H+.025,.01); bx(BC.W,.08,BC.D,0,.04,0);
    for(const y of BC.SH.slice(1))bx(BC.W-.02,BC.BW,BC.D-.02,0,y-BC.BW/2,0);
    const mg=(L,mat)=>{ let n=0; for(const g of L)n+=g.attributes.position.count; const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2),I=[]; let o=0;
      for(const g of L){ P.set(g.attributes.position.array,o*3); N.set(g.attributes.normal.array,o*3); U.set(g.attributes.uv.array,o*2); for(const i of g.index.array)I.push(i+o); o+=g.attributes.position.count; g.dispose(); }
      const b=new THREE.BufferGeometry(); b.setAttribute('position',new THREE.BufferAttribute(P,3)); b.setAttribute('normal',new THREE.BufferAttribute(N,3)); b.setAttribute('uv',new THREE.BufferAttribute(U,2)); b.setIndex(I); const me=new THREE.Mesh(b,mat); me.castShadow=me.receiveShadow=true; return me; };
    G.add(mg(boards,wood));
    // the spines' sheet: ten columns, four rows, each cell one book
    const CW=48, CH=320, cv=document.createElement('canvas'); cv.width=CW*10; cv.height=CH*4; const g=cv.getContext('2d'), tex=new THREE.CanvasTexture(cv); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=4;
    const rows=LIB.shelfOf(C), books=[];
    rows.forEach((row,r)=>row.forEach((q,i)=>{ const cx=i*CW, cy=r*CH; paintSpine(g,cx,cy,CW,CH,q.b,spineIm(q.b.id));
      const geo=new THREE.BoxGeometry(q.th,q.h,q.d), uv=geo.attributes.uv, u0=cx/cv.width, u1=(cx+CW)/cv.width, v0=1-(cy+CH)/cv.height, v1=1-cy/cv.height;
      for(let k=0;k<uv.count;k++){ const face=Math.floor(k/4); if(face===4){ const a=uv.getX(k), c=uv.getY(k); uv.setXY(k,u0+(u1-u0)*a,v0+(v1-v0)*c); } else uv.setXY(k,u0+(u1-u0)*.5,v0+(v1-v0)*.5); }
      geo.translate(q.x,BC.SH[r]+q.h/2,BC.D/2-q.d/2-.012); books.push(geo); }));
    const bm=mg(books,new THREE.MeshLambertMaterial({map:tex})); G.add(bm);
    for(const id of C.books.map(b=>b.id))if(spineF(id)){ const im=new Image(); im.onload=()=>{ rows.forEach((row,r)=>row.forEach((q,i)=>{ if(q.b.id===id){ paintSpine(g,i*CW,r*CH,CW,CH,q.b,im); tex.needsUpdate=true; } })); }; im.src=spineF(id); }
    // its brass plate: the genre
    const pc=document.createElement('canvas'); pc.width=256; pc.height=40; const pg=pc.getContext('2d'); pg.fillStyle='#b8923a'; pg.fillRect(0,0,256,40); pg.fillStyle='#2a1a10'; pg.font='600 19px Georgia,serif'; pg.textAlign='center'; pg.textBaseline='middle'; pg.fillText(C.name.slice(0,24),128,21);
    const pt=new THREE.CanvasTexture(pc); pt.colorSpace=THREE.SRGBColorSpace; const plate=new THREE.Mesh(new THREE.PlaneGeometry(.46,.072),new THREE.MeshLambertMaterial({map:pt})); plate.position.set(0,BC.H-.05,BC.D/2+.004); G.add(plate);
    return G; };

  /* ---------- up close (double-click a case): the case fills the screen on its wall, the real spines legible; wheel or pinch to zoom, drag to slide along, click a book to open its card ---------- */
  const VW=document.createElement('div'); VW.id='libv'; VW.hidden=true; VW.style.cssText='position:fixed;inset:0;z-index:22;background:#120c08;touch-action:none';
  document.body.appendChild(VW); const VC=document.createElement('canvas'); VC.style.cssText='position:absolute;inset:0;width:100%;height:100%;cursor:grab'; VW.appendChild(VC);
  const VB=document.createElement('div'); VB.style.cssText='position:absolute;left:50%;bottom:max(14px,env(safe-area-inset-bottom,0px));transform:translateX(-50%);display:flex;gap:6px;font:11px Silkscreen,monospace;zoom:var(--uiz,1)';
  VB.innerHTML='<button class="btn" data-v="prev">&lt; CASE</button><button class="btn" data-v="out">−</button><button class="btn" data-v="fit">FIT</button><button class="btn" data-v="in">+</button><button class="btn" data-v="next">CASE &gt;</button><button class="btn" data-v="x">CLOSE</button>';
  VW.appendChild(VB); { const st=document.createElement('style'); st.textContent='#libv .btn{font:inherit;padding:6px 10px;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer} #libv[hidden]{display:none!important}'; document.head.appendChild(st); }
  const V={ci:0,s:1,x:0,y:0,fit:1,rows:null,hit:[]};
  const vdraw=()=>{ const C=LIB.data.cases[V.ci], dpr=Math.min(2,window.devicePixelRatio||1), w=VC.clientWidth, h=VC.clientHeight; if(VC.width!==w*dpr||VC.height!==h*dpr){ VC.width=w*dpr; VC.height=h*dpr; }
    const g=VC.getContext('2d'); g.setTransform(dpr,0,0,dpr,0,0); g.fillStyle='#2a1810'; g.fillRect(0,0,w,h);
    const k=V.s, X=m=>w/2+V.x+m*k, Y=m=>h/2+V.y-(m-BC.H/2)*k;   // metres to the screen
    // the wall, the case, its plate, its books
    g.fillStyle='#3a2416'; g.fillRect(X(-BC.W/2-.02),Y(BC.H+.05),(BC.W+.04)*k,(BC.H+.05)*k); g.fillStyle='#1c120c'; g.fillRect(X(-BC.W/2+BC.BW),Y(BC.H-.05),(BC.W-2*BC.BW)*k,(BC.H-.13)*k);
    g.fillStyle='#b8923a'; g.fillRect(X(-.23),Y(BC.H-.014),.46*k,.072*k); g.fillStyle='#2a1a10'; g.font=`600 ${Math.max(6,.04*k)}px Georgia,serif`; g.textAlign='center'; g.textBaseline='middle'; g.fillText(C.name,X(0),Y(BC.H-.05)); g.textAlign='left';
    V.hit=[]; V.rows.forEach((row,r)=>{ g.fillStyle='#5a3a22'; g.fillRect(X(-BC.W/2+BC.BW),Y(BC.SH[r]),(BC.W-2*BC.BW)*k,Math.max(2,BC.BW*k));
      for(const q of row){ const x=X(q.x-q.th/2), y=Y(BC.SH[r]+q.h), bw=q.th*k, bh=q.h*k; paintSpine(g,x,y,bw,bh,q.b,spineIm(q.b.id)); V.hit.push([q.b.id,x,y,bw,bh]); } });
    g.fillStyle='rgba(236,229,211,.9)'; g.font='12px Silkscreen,monospace'; g.fillText(`${C.name} · CASE ${V.ci+1} OF ${LIB.data.cases.length} · CLICK A BOOK`,16,24); };
  const vfit=()=>{ V.fit=Math.min(VC.clientWidth/(BC.W+.2),VC.clientHeight/(BC.H+.3))*.92; V.s=V.fit; V.x=0; V.y=0; };
  const vopen=ci=>{ V.ci=(ci+LIB.data.cases.length)%LIB.data.cases.length; V.rows=LIB.shelfOf(LIB.data.cases[V.ci]); VW.hidden=false; vfit(); vdraw(); };
  LIB.look=ci=>load().then(()=>vopen(ci)).catch(()=>say('THE SHELF IS TOO DARK TO READ. TRY AGAIN.','#c8a090')); LIB.closeLook=()=>{ VW.hidden=true; };
  const vzoom=(f,cx=VC.clientWidth/2,cy=VC.clientHeight/2)=>{ const s=Math.max(V.fit,Math.min(V.fit*9,V.s*f)), r=s/V.s; V.x=(V.x+VC.clientWidth/2-cx)*r-VC.clientWidth/2+cx; V.y=(V.y+VC.clientHeight/2-cy)*r-VC.clientHeight/2+cy; V.s=s; vdraw(); };
  VC.addEventListener('wheel',e=>{ e.preventDefault(); vzoom(e.deltaY<0?1.15:1/1.15,e.offsetX,e.offsetY); },{passive:false});
  let drag=null, moved=0; const pts=new Map();
  VC.addEventListener('pointerdown',e=>{ VC.setPointerCapture(e.pointerId); pts.set(e.pointerId,[e.offsetX,e.offsetY]); drag=[e.offsetX,e.offsetY,V.x,V.y,pts.size===2?Math.hypot(...[...pts.values()].reduce((a,p)=>[a[0]-p[0],a[1]-p[1]],[0,0])):0]; moved=0; VC.style.cursor='grabbing'; });
  VC.addEventListener('pointermove',e=>{ if(!drag)return; const prev=pts.get(e.pointerId); pts.set(e.pointerId,[e.offsetX,e.offsetY]);
    if(pts.size===2){ const [a,b]=[...pts.values()], d=Math.hypot(a[0]-b[0],a[1]-b[1]); if(prev&&drag.pd)vzoom(d/drag.pd,(a[0]+b[0])/2,(a[1]+b[1])/2); drag.pd=d; moved=99; return; }
    moved+=Math.abs(e.movementX||0)+Math.abs(e.movementY||0); V.x=drag[2]+(e.offsetX-drag[0]); V.y=drag[3]+(e.offsetY-drag[1]); vdraw(); });
  VC.addEventListener('pointerup',e=>{ pts.delete(e.pointerId); VC.style.cursor='grab'; if(drag&&moved<6&&!pts.size){ const h=V.hit.find(([,x,y,w,hh])=>e.offsetX>=x&&e.offsetX<=x+w&&e.offsetY>=y&&e.offsetY<=y+hh); if(h){ if(SFX)SFX.play('page',{vol:.4}); LIB.open(h[0]); } } if(!pts.size)drag=null; });
  VB.addEventListener('click',e=>{ const b=e.target.closest('[data-v]'); if(!b)return; const a=b.dataset.v; if(a==='x')LIB.closeLook(); else if(a==='in')vzoom(1.5); else if(a==='out')vzoom(1/1.5); else if(a==='fit'){ vfit(); vdraw(); } else if(a==='prev')vopen(V.ci-1); else if(a==='next')vopen(V.ci+1); });
  for(const ev of ['keydown','keyup'])VW.addEventListener(ev,e=>{ if(ev==='keydown'&&e.key==='Escape')LIB.closeLook(); e.stopPropagation(); });
  window.addEventListener('resize',()=>{ if(!VW.hidden){ vfit(); vdraw(); } });

  /* ---------- the shop: one cozy room, its walls lined with the sixteen cases (one genre each), the door and window to West St; in the middle only a rug, chairs and lamps; the Professor's counter by the door ---------- */
  MSHOP.kit.books=A=>{ '@later'; const R=A.R, F=IKIT.frame(R), MW=IKIT.MW, K=IKIT.room(F,o=>A.add(o),()=>{}), t=d=>d*TM, sol=(u0,v0,u1,v1)=>A.sol(R.x0+Math.min(u0,u1)/TM,R.y0+Math.min(v0,v1)/TM,R.x0+Math.max(u0,u1)/TM,R.y0+Math.max(v0,v1)/TM), {box,use}=K, W=t(R.x1-R.x0), D=t(R.y1-R.y0);
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
    // the cases round the walls: the back wall's run, then the left wall, then the right, in the order of the list
    const slots=[], gap=.04, step=BC.W+gap; { const nb=Math.min(7,d.cases.length), x0=W/2-(nb*step-gap)/2; for(let i=0;i<nb;i++)slots.push([x0+step*(i+.5),BC.D/2,0,1]);
      const left=Math.ceil((d.cases.length-nb)/2), right=d.cases.length-nb-left; for(let i=0;i<right;i++)slots.push([W-BC.D/2,.75+step*(i+.5),-1,0]); for(let i=0;i<left;i++)slots.push([BC.D/2,.75+step*(i+.5),1,0]); }
    d.cases.forEach((C,i)=>{ const s=slots[i]; if(!s)return; const [u,v,du,dv]=s, M=caseMesh(C), p=F.pw(u,v); M.scale.setScalar(MW); M.position.set(p[0],0,p[1]); M.rotation.y=F.hd(du,dv); A.add(M);
      const ax=Math.abs(du)>0; sol(u-(ax?BC.D/2:BC.W/2),v-(ax?BC.W/2:BC.D/2),u+(ax?BC.D/2:BC.W/2),v+(ax?BC.W/2:BC.D/2));
      use(C.name+': LOOK CLOSER',u+du*.45,v+dv*.45,.62,2.0,()=>LIB.look(i),1.4); });
    // the middle: a rug, two armchairs and a velvet chair round a small table with its lamp, a floor lamp; the window's radiator and curtains; the counter by the door
    put(G,'rug2',W/2,D*.54,1,0,{s:.95,shadow:false}); put(G,'armchair',W*.36,D*.5,1,.2); put(G,'tubchair',W*.64,D*.5,-1,.2); put(G,'tubchair',W/2,D*.7,0,-1);
    put(G,'sidetable',W/2,D*.47,0,1); put(G,'tablelamp',W/2,D*.47,0,1,{h:.51,shadow:false}); put(G,'bookstack',W/2+.08,D*.47+.08,0,1,{h:.51,shadow:false}); put(G,'floorlamp',W*.26,D*.38,1,0); put(G,'blanket',W*.36,D*.5,1,.2,{h:.42,shadow:false});
    const hfg=(R.x1-R.x0)/2-.3, GL={left:[W/2+(-hfg+.08)*TM,W/2-1.53*TM],right:[W/2+1.53*TM,W/2+(hfg-.08)*TM]}; put(G,'radiator',(GL.right[0]+GL.right[1])/2,D-.08,0,-1,{shadow:false}); for(const u of [...GL.left,...GL.right])put(G,'curtain',u+(u===GL.left[0]||u===GL.right[0]?-.12:.12),D-.14,0,-1,{shadow:false,s:.9});
    { const cu=W*.2, cv=D-.85; box(cu-.65,cv-.3,cu+.65,cv+.3,0,.95,0x4a2e1c); box(cu-.7,cv-.34,cu+.7,cv+.34,.95,1.0,0x2e1c10); sol(cu-.7,cv-.34,cu+.7,cv+.34);
      box(cu+.3,cv-.18,cu+.58,cv+.12,1.0,1.2,0x2c2c2e); K.cyl(cu-.4,cv,.05,1.0,1.06,0xb8923a); put(G,'tablelamp',cu-.1,cv-.12,0,1,{h:1.0,shadow:false}); put(G,'book',cu+.05,cv+.1,0,1,{h:1.0,shadow:false});
      use('RETURNS',cu,cv,1.4,1.1,()=>{ if(!S.b.length)return say('YOU HAVE NOTHING OF OURS. TAKE SOMETHING.'); load().then(()=>{ for(const id of S.b.slice())LIB.giveBack(id); say('THE PROFESSOR TAKES THEM BACK AND SHELVES THEM.'); }); }); }
    // the front wall's real glass (the panes are the shop's own, 059i: the street seen through them): frames round the two doors and both windows, brass bars on the doors
    { const cxm=W/2, dwm=1.25*TM, hf=(R.x1-R.x0)/2-.3, fr=0x2e3a32, m=z=>z/24*TM, tm=o=>cxm+o*TM;
      const frame=(o0,o1,z0,z1)=>{ const u0=tm(o0), u1=tm(o1); box(u0-.05,D-.07,u0,D,m(z0),m(z1),fr); box(u1,D-.07,u1+.05,D,m(z0),m(z1),fr); box(u0-.05,D-.07,u1+.05,D,m(z0)-.05,m(z0),fr); box(u0-.05,D-.07,u1+.05,D,m(z1),m(z1)+.05,fr); };
      frame(-hf+.08,-1.25-.28,19,89); frame(1.25+.28,hf-.08,19,89); frame(-1.25+.12,-.06,12,86); frame(.06,1.25-.12,12,86);
      for(const sgn of [-1,1])box(cxm+sgn*.32-.15,D-.11,cxm+sgn*.32+.15,D-.08,1.05,1.09,0xb8923a);
      box(tm(-hf+.08)-.05,D-.2,tm(-1.25-.28)+.05,D-.07,m(19)-.05,m(19),0x4a2e1c); box(tm(1.25+.28)-.05,D-.2,tm(hf-.08)+.05,D-.07,m(19)-.05,m(19),0x4a2e1c); }   // the window sills
    for(const [u,v] of [[W*.12,D-.55],[W*.88,D-.55],[W/2,D*.18],[W*.25,D*.62],[W*.75,D*.62]]){ put(G,'hangplant',u,v,0,1,{h:HT-1.35,s:1.2,shadow:false}); box(u-.004,v-.004,u+.004,v+.004,HT-.1,HT,0x3a2a1a); }
    put(G,'clock',W*.85,D-.02,0,-1,{h:2.25}); put(G,'plant',W-.45,D-.45,0,-1); put(G,'globe',W*.2+.45,D-.85,0,1,{h:1.0,s:1.3,shadow:false});
    sitIn('ARMCHAIR: SIT AND READ',W*.36,D*.5,.45,1,.2,.9); sitIn('VELVET CHAIR: SIT AND READ',W*.64,D*.5,.45,-1,.2,.8); sitIn('VELVET CHAIR: SIT AND READ',W/2,D*.7,.45,0,-1,.8);
    // the light: two glass pendants and the lamps, warm and low; a warm fill off the wood
    for(const [u,v] of [[W*.35,D*.36],[W*.65,D*.36]]){ box(u-.005,v-.005,u+.005,v+.005,HT-.75,HT,0x1c1c1c); K.glow(()=>K.ball(u,v,HT-.85,.09,0xfff0d0)); warm(u,v,HT-1.0,1.3,6,0xffd29a); }
    warm(W/2,D*.47,.95,1.2,4,0xffc070); warm(W*.26,D*.38,1.7,1.1,5,0xffc27a); warm(W*.2-.1,D-.97,1.3,.8,4,0xffd090);
    A.add(new THREE.HemisphereLight(0xffd6a0,0x4a2414,1.1));
    K.glow(()=>{ for(const [u,v,h,r] of [[W/2,D*.47,.9,.07],[W*.26,D*.38,1.62,.1]])K.cyl(u,v,r*.6,h-.02,h+.04,0xfff0c0); });
    { const N=90, P=new Float32Array(N*3), Vv=[]; for(let i=0;i<N;i++){ const p=F.pw(W*.2+Math.random()*W*.6,D*.2+Math.random()*D*.6); P[i*3]=p[0]; P[i*3+1]=(.3+Math.random()*(HT-.6))*MW; P[i*3+2]=p[1]; Vv.push([(Math.random()-.5)*.02,(Math.random()-.4)*.01,(Math.random()-.5)*.02]); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); const m=new THREE.PointsMaterial({color:0xffe2b0,size:.022*MW,transparent:true,opacity:.5,depthWrite:false});
      const pts=new THREE.Points(g,m); A.add(pts); DUST={pts,P,V:Vv,y0:.2*MW,y1:(HT-.3)*MW,t:0}; }
    K.flush(); };
  MSHOP.kit.books.drop=()=>{ DUST=null; };
  SYS.add('places',dt=>{ if(!DUST||!DUST.pts.parent)return; const {P,V}=DUST, MW=IKIT.MW, k=(dt||0)*MW*.5; DUST.t+=dt||0; for(let i=0;i<V.length;i++){ const j=i*3; P[j]+=V[i][0]*k+Math.sin(DUST.t*.3+i)*.0006*MW; P[j+1]+=V[i][1]*k; P[j+2]+=V[i][2]*k; if(P[j+1]>DUST.y1||P[j+1]<DUST.y0)V[i][1]*=-1; } DUST.pts.geometry.attributes.position.needsUpdate=true; },'144ca-library');
  /* ---------- outside: polyfork's hanging sign, a cart of books, hanging baskets by the doors and flower planters under the windows (data/bookfront.json, loaded when you come near) ---------- */
  { const FJ=__LAZY__("data/bookfront.json"); let done=false, chk=0;
    SYS.add('places',dt=>{ if(done||(chk-=dt||0)>0)return; chk=1; const at=MSHOP.at&&MSHOP.at.books, o=ROOMS.off&&ROOMS.off.books; if(!at||!o)return;
      if(Math.hypot(pos.x-at.door[0],pos.z-at.door[1])>60*IKIT.MW)return; done=true;
      FJ().then(Dd=>{ const MW=IKIT.MW, d=at.door, n0=[o.out[0]-d[0],o.out[1]-d[1]], nl=Math.hypot(n0[0],n0[1])||1, n=[n0[0]/nl,n0[1]/nl], tg=[n[1],-n[0]], G=new THREE.Group(); G.name='books-front'; scene.add(G);
        const put=(k,a,b,h,ry=0)=>{ const g=KIT.decode(Dd[k]); g.computeBoundingBox(); const bb=g.boundingBox, me=new THREE.Mesh(g,KIT.mat), grp=new THREE.Group(); me.position.set(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2); me.castShadow=me.receiveShadow=true; grp.add(me);
          const x=d[0]+n[0]*a*MW+tg[0]*b*MW, z=d[1]+n[1]*a*MW+tg[1]*b*MW; grp.scale.setScalar(MW); grp.position.set(x,(SHARED.groundY?SHARED.groundY(x,z):0)+h*MW,z); grp.rotation.y=Math.atan2(n[0],n[1])+ry; G.add(grp); return grp; };
        put('sign',.35,4.6,2.0,Math.PI/2); put('trolley',1.1,3.4,0,Math.PI/2); for(const b of [-1.5,1.5])put('hangplant',.4,b,1.7); for(const b of [-2.6,2.6])put('planter',.25,b,0); }).catch(()=>{ done=false; }); },'144ca-library'); }
  window.LIBDBG=()=>({data:!!LIB.data,n:LIB.data?LIB.data.books.length:0,borrowed:S.b.slice(),panel:!P.hidden,reading:cur?{id:cur.b.id,i:cur.i,lines:cur.L.length,pages:Math.ceil(cur.L.length/LPP)}:null,shop:!!(MSHOP.at&&MSHOP.at.books)});
}
