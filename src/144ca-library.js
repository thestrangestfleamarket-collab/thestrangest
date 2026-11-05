// THE BOOKSTORE: a lending library on West St kept by the Professor: 100 public-domain books (data/books.json) on its shelves with their first editions' covers; borrow up to five free and read them anywhere; a book's text (Project Gutenberg) downloads only when it is opened.
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

  /* ---------- the shop, furnished from polyfork's models (data/bookstore.json, baked in metres): book walls to the ceiling, two free-standing stacks, the Professor's issue desk by the door,
     a reading nook of velvet chairs, a sofa and the long reading table under its green lamps; warm lamps, sconces, the window's curtains and radiator, dust in the light ---------- */
  const PJ=__LAZY__("data/bookstore.json"); let PG=null, GEO=null; const pfGeo=()=>PG||(PG=PJ().then(D=>{ const G={}; for(const k in D){ const g=KIT.decode(D[k]); g.computeBoundingBox(); G[k]=g; } return GEO=G; }));
  { let wrapped=false; SYS.add('places',()=>{ if(wrapped)return; const o=ROOMS.off&&ROOMS.off.books; if(!o)return; wrapped=true; const n0=o.need; o.need=()=>Promise.all([n0?n0():null,pfGeo(),load().catch(()=>null)]); },'144ca-library'); }
  // a shelf's painted front for the hundred: rows of their spines (their colour and gold title, or the real spine when there is one)
  const shelfTex=(w,rows,real)=>{ const H=rows*64, c=document.createElement('canvas'); c.width=w; c.height=H; const g=c.getContext('2d');
    g.fillStyle='#2a1a10'; g.fillRect(0,0,w,H); const hits=[];
    for(let r=0;r<rows;r++){ const y0=r*64; g.fillStyle='#6a4428'; g.fillRect(0,y0+58,w,6); let x=6; for(const b of real[r]||[]){ const bw=Math.max(12,Math.min(20,Math.round((b.words||90000)/12000))), bh=48+((b.id.length*7)%9); if(x+bw>w-4)break;
        g.fillStyle=b.col||'#6a3a2a'; g.fillRect(x,y0+58-bh,bw,bh); g.fillStyle='rgba(0,0,0,.28)'; g.fillRect(x+bw-2,y0+58-bh,2,bh); g.fillStyle='rgba(255,255,255,.08)'; g.fillRect(x+1,y0+58-bh,2,bh);
        g.fillStyle='#d8b860'; g.fillRect(x+2,y0+62-bh,bw-4,2); g.fillRect(x+2,y0+53,bw-4,2);
        g.save(); g.translate(x+bw/2+3,y0+51); g.rotate(-Math.PI/2); g.font='bold 8px Georgia,serif'; g.fillStyle='#ecd48c'; g.fillText(b.t.slice(0,12),0,0); g.restore(); hits.push([b.id,x,y0+58-bh,bw,bh]); x+=bw+1; } }
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4;
    for(const [id,x,y,bw,bh] of hits){ const f=spineF(id); if(!f)continue; const im=new Image(); im.onload=()=>{ g.drawImage(im,x,y,bw,bh); t.needsUpdate=true; }; im.src=f; }
    return t; };
  let DUST=null;
  // one great room two storeys high (owner, 5 Nov 2026): books on every wall floor to ceiling, two tiers with a gallery rail between, nothing standing in the room but tables, chairs and the desk
  MSHOP.kit.books=A=>{ '@later'; const R=A.R, F=IKIT.frame(R), MW=IKIT.MW, K=IKIT.room(F,o=>A.add(o),()=>{}), t=d=>d*TM, sol=(u0,v0,u1,v1)=>A.sol(R.x0+Math.min(u0,u1)/TM,R.y0+Math.min(v0,v1)/TM,R.x0+Math.max(u0,u1)/TM,R.y0+Math.max(v0,v1)/TM), {box,pic,use}=K, W=t(R.x1-R.x0), D=t(R.y1-R.y0);
    const tx=u=>R.x0+u/TM, ty=v=>R.y0+v/TM, HT=A.WH/24*TM;   // the room's height in metres
    // the floor: dark boards round a burgundy carpet; the walls: dark wood behind the books, a cream cornice under the ceiling
    A.floor((x,y)=>{ const iu=(x-R.x0)*TM, iv=(y-R.y0)*TM, rug=iu>1.4&&iu<W-1.4&&iv>1.4&&iv<D-1.0;
      if(rug){ const n=.92+.08*A.hs(Math.floor(iu*14),Math.floor(iv*14),7), edge=(iu<1.6||iu>W-1.6||iv<1.6||iv>D-1.2)?.7:1, m=(Math.abs(iu-W/2)<.08||Math.abs(iv-D/2)<.08)?.86:1; return [112*n*edge*m,30*n*edge*m,34*n*edge*m]; }
      const u=(x-R.x0), v=(y-R.y0), row=Math.floor(u*5), s=.8+.2*A.hs(row,Math.floor(v*1.1+row*.37),5), e=(u*5%1)<.07?.6:1; return [70*s*e,44*s*e,28*s*e]; });
    for(const sd of ['b','w','e','f'])A.wall(sd,(a,z)=>{ if(z<6)return [34,22,14]; if(z>A.WH-8)return [196,178,140]; return [46,30,20].map(c=>c*(.9+.1*A.hs(Math.floor(a*4),Math.floor(z/9),4))); });
    const DARKW=new THREE.MeshLambertMaterial({vertexColors:true,color:0x9c8270}), DK={trolley:1,issuedesk:1,sidetable:1};
    const put=(G,k,u,v,du,dv,o={})=>{ const g=G[k]; if(!g)return null; const bb=g.boundingBox, s=o.s||1, me=new THREE.Mesh(g,DK[k]?DARKW:KIT.mat), grp=new THREE.Group(), p=F.pw(u,v);
      me.position.set(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2); me.castShadow=o.shadow!==false; me.receiveShadow=true; grp.add(me); grp.scale.setScalar(MW*s); grp.position.set(p[0],(o.h||0)*MW,p[1]); grp.rotation.y=F.hd(du,dv); A.add(grp);
      if(o.solid){ const hw=(bb.max.x-bb.min.x)*s/2, hd=(bb.max.z-bb.min.z)*s/2, ax=Math.abs(du)>Math.abs(dv); sol(u-(ax?hd:hw),v-(ax?hw:hd),u+(ax?hd:hw),v+(ax?hw:hd)); }
      return grp; };
    const sitIn=(name,u,v,h,du,dv,w,read)=>use(name,u,v,w,1.1,()=>{ const p=F.pw(u,v); USE.sitAt(p[0],p[1],h*MW,F.hd(du,dv)); if(read)setTimeout(()=>LIB.open(),600); },1.2);
    const warm=(u,v,h,i,r,c=0xffc887)=>A.lamp(tx(u),ty(v),h/TM,c,i*3.2,r*1.6);
    const G=GEO||{}, d=LIB.data||{books:[]}, B=d.books;
    /* ---------- the walls of books: two tiers of cases all round (the door and the window left clear in the front wall), the gallery between them ---------- */
    const S1=1.25, CW=1.0*S1, CH=2.1*S1, CD=.315*S1, T2=CH+.32, HUW=4.0, DW=2.2, WIN=[W/2+DW/2-.15,W-.75];   // a case's width, height, depth; the second tier's foot; the hundred's case; the door's width; the window
    const run=(len,f)=>{ const n=Math.floor((len-.2)/CW), o=(len-n*CW)/2; for(let i=0;i<n;i++)f(o+CW*(i+.5)); };
    const TIERS=[0,T2,T2*2], up=TIERS.slice(1);
    run(W,u=>{ const mid=Math.abs(u-W/2)<HUW/2+CW/2-.01; if(!mid)put(G,'bookwall',u,CD/2,0,1,{s:S1}); for(const h of up)put(G,'bookwall',u,CD/2,0,1,{s:S1,h,shadow:false}); });
    run(D-.6,v=>{ v+=.3; for(const h of TIERS){ put(G,'bookwall',CD/2,v,1,0,{s:S1,h,shadow:!h}); put(G,'bookwall',W-CD/2,v,-1,0,{s:S1,h,shadow:!h}); } });
    run(W,u=>{ const door=Math.abs(u-W/2)<DW/2+CW/2-.05, win=u>WIN[0]-CW/2+.05&&u<WIN[1]+CW/2-.05; if(!door&&!win)put(G,'bookwall',u,D-CD/2,0,-1,{s:S1}); for(const h of up)if(!win||h>T2)put(G,'bookwall',u,D-CD/2,0,-1,{s:S1,h,shadow:false}); });
    sol(0,0,W,CD+.05); sol(0,0,CD+.05,D); sol(W-CD-.05,0,W,D); sol(0,D-CD-.05,W/2-DW/2,D); sol(W/2+DW/2,D-.2,W,D);
    // the gallery: a walkway of boards round the walls between the tiers, its balusters and rail; a cornice over the top tier
    const GD=.75, wood=0x4a2e1a, rail=0x3a2214;
    for(const GH of [CH+.05,T2+CH+.05])for(const [u0,v0,u1,v1] of [[0,0,W,CD+GD],[0,0,CD+GD,D],[W-CD-GD,0,W,D],[0,D-CD-GD,W,D]]){ box(u0,v0,u1,v1,GH,GH+.18,wood); }
    let GH=CH+.05;
    const ballust=(u0,v0,u1,v1)=>{ const L=Math.hypot(u1-u0,v1-v0), n=Math.floor(L/.32); for(let i=0;i<=n;i++){ const k=i/n, u=u0+(u1-u0)*k, v=v0+(v1-v0)*k; box(u-.025,v-.025,u+.025,v+.025,GH+.18,GH+1.0,rail); } box(Math.min(u0,u1)-.04,Math.min(v0,v1)-.04,Math.max(u0,u1)+.04,Math.max(v0,v1)+.04,GH+1.0,GH+1.07,rail); };
    const e=CD+GD; for(const gh of [CH+.05,T2+CH+.05]){ GH=gh; ballust(e,e,W-e,e); ballust(e,e,e,D-e); ballust(W-e,e,W-e,D-e); ballust(e,D-e,W-e,D-e); for(let u=e+1.6;u<W-e;u+=3.2)for(const v of [e,D-e])box(u-.03,v-.03,u+.03,v+.03,GH-.5,GH,rail); } GH=CH+.05;   // the galleries, their balusters, rails and brackets
    box(0,0,W,.12,HT-.32,HT,0xc8b48c); box(0,D-.12,W,D,HT-.32,HT,0xc8b48c); box(0,0,.12,D,HT-.32,HT,0xc8b48c); box(W-.12,0,W,D,HT-.32,HT,0xc8b48c);
    // rolling ladders on their brass rails, one on each long wall and the back
    for(const [u,v,du,dv] of [[W*.3,CD+.12,0,1],[.12+CD,D*.4,1,0],[W-CD-.12,D*.55,-1,0]]){ const ax=Math.abs(du)>0;
      for(const x of [-.24,.24]){ const a=ax?u+.25*du:u+x, b=ax?v+x:v+.25*dv; box(a-.025,b-.025,a+.025,b+.025,0,GH-.05,0x5a3a22); }
      for(let i=1;i<8;i++){ const h=i*.3; ax?box(u+.25*du-.02,v-.24,u+.25*du+.02,v+.24,h,h+.035,0x6a4428):box(u-.24,v+.25*dv-.02,u+.24,v+.25*dv+.02,h,h+.035,0x6a4428); } }
    for(const [u0,v0,u1,v1] of [[.3,CD+.02,W-.3,CD+.06],[CD+.02,.3,CD+.06,D-.3],[W-CD-.06,.3,W-CD-.02,D-.3]])box(u0,v0,u1,v1,GH-.15,GH-.11,0xb8923a);
    // the hundred: their own lit case in the middle of the back wall, at eye height, the sign over it
    if(B.length){ const per=Math.ceil(B.length/5), real=[0,1,2,3,4].map(i=>B.slice(i*per,(i+1)*per)); pic(W/2,.16,.3,HUW-.2,CH-.4,0,1,shelfTex(1200,5,real)); }
    box(W/2-HUW/2,0,W/2+HUW/2,CD,0,.3,0x3a2416); box(W/2-HUW/2,0,W/2-HUW/2+.1,CD,.3,CH,0x3a2416); box(W/2+HUW/2-.1,0,W/2+HUW/2,CD,.3,CH,0x3a2416); box(W/2-HUW/2,0,W/2+HUW/2,CD,CH-.12,CH,0x3a2416);
    pic(W/2,CD+.01,CH-.1,2.2,.3,0,1,K.words(176,26,'#2a1a10',[['THE HUNDRED',88,6,'#e8c870',12,'center']]),true);
    for(const [u,v,du,dv,lab] of [[W*.15,CD+.01,0,1,'FICTION'],[W*.85,CD+.01,0,1,'POETRY · DRAMA'],[CD+.01,D*.25,1,0,'HISTORY'],[CD+.01,D*.6,1,0,'PHILOSOPHY'],[W-CD-.01,D*.25,-1,0,'MYSTERY'],[W-CD-.01,D*.6,-1,0,'CHILDREN']])
      pic(u,v,GH+.22,1.1,.22,du,dv,K.words(132,26,'#2a1a10',[[lab,66,7,'#e8c870',10,'center']]),true);
    /* ---------- the floor: the long reading tables under their green lamps, the sofa and armchairs, the nook by the window, the display tables by the door, the Professor's desk ---------- */
    put(G,'rug2',W*.5,D*.46,1,0,{s:1.7,shadow:false});
    put(G,'sofa',W*.5,D*.62,0,-1,{solid:true}); put(G,'sofa',W*.5,D*.3,0,1,{solid:true}); put(G,'floorlamp',W*.3,D*.62,1,0); put(G,'floorlamp',W*.7,D*.62,-1,0); put(G,'armchair',W*.36,D*.46,1,0); put(G,'armchair',W*.64,D*.46,-1,0); put(G,'sidetable',W*.36,D*.36,0,1); put(G,'globe',W*.36,D*.36,0,1,{h:.51,s:1.5,shadow:false});
    put(G,'rug1',W*.82,D*.76,0,1,{s:1.3,shadow:false}); put(G,'tubchair',W*.76,D*.74,1,.3); put(G,'tubchair',W*.9,D*.74,-1,.3); put(G,'sidetable',W*.83,D*.7,0,1);
    put(G,'tablelamp',W*.83,D*.7,0,1,{h:.51,shadow:false}); put(G,'book',W*.845,D*.71,0,1,{h:.51,shadow:false}); put(G,'floorlamp',W-CD-.5,D*.64,-1,0); put(G,'blanket',W*.9,D*.74,-1,.3,{h:.42,shadow:false});
    put(G,'radiator',WIN[0]+1.2,D-CD-.06,0,-1,{shadow:false}); put(G,'radiator',WIN[1]-1.2,D-CD-.06,0,-1,{shadow:false}); for(const u of [WIN[0]+.15,WIN[1]-.15])put(G,'curtain',u,D-CD-.1,0,-1,{shadow:false,s:1.25});
    put(G,'issuedesk',W*.18,D*.74,0,1,{s:.8,solid:true}); put(G,'bookstack',W*.12,D*.74+.1,0,1,{h:.92,shadow:false}); put(G,'tablelamp',W*.24,D*.72,0,1,{h:.92,shadow:false});
    put(G,'trolley',CD+.4,D*.86,1,0,{solid:true}); put(G,'clock',CD+.02,D*.74,1,0,{h:GH+1.4}); put(G,'plant',W/2-DW/2-.5,D-CD-.5,0,-1); put(G,'plant',W-.6,D-.6,0,-1); put(G,'plant',CD+.6,CD+.6,1,1);
    // the light: two crystal chandeliers from the high ceiling, the reading tables' lamps, the nook's lamps, the desk's lamp
    for(const u of [W*.33,W*.67]){ const ch=4.4; put(G,'chandelier',u,D*.46,0,1,{h:ch,s:1.3,shadow:false}); box(u-.006,D*.46-.006,u+.006,D*.46+.006,ch+2.1,HT,0x2a1a10); warm(u,D*.46,ch+.6,2.4,16,0xffd29a); }
    for(const u of [W*.36,W*.64])warm(u,D*.62,1.6,1.2,7,0xffcf90); warm(W*.83,D*.7,.95,1.2,5,0xffc070); warm(W-CD-.5,D*.64,1.75,1.1,6,0xffc27a); warm(W*.24,D*.73,1.3,.9,5,0xffd090); warm(W*.5,D*.15,GH+1.2,1.0,12,0xffcf9a);
    A.add(new THREE.HemisphereLight(0xffd6a0,0x4a2414,1.6));   // the room's own warm fill: lamplight off the wood and the red carpet
    K.glow(()=>{ for(const [u,v,h,r] of [[W*.83,D*.7,.9,.07],[W-CD-.5,D*.64,1.62,.1]])K.cyl(u,v,r*.6,h-.02,h+.04,0xfff0c0); });
    // using it
    use('THE HUNDRED',W/2,.7,HUW,2.4,()=>LIB.open()); for(const [u,v] of [[1.0,D*.3],[1.0,D*.7],[W-1.0,D*.3],[W*.2,1.0],[W*.8,1.0]])use('THE SHELVES',u,v,1.4,2.4,()=>LIB.open());
   
    sitIn('VELVET CHAIR: SIT AND READ',W*.76,D*.74,.45,1,.3,.8,true); sitIn('VELVET CHAIR: SIT AND READ',W*.9,D*.74,.45,-1,.3,.8,true);
    sitIn('ARMCHAIR: SIT AND READ',W*.36,D*.46,.45,1,0,.9,true); sitIn('ARMCHAIR: SIT AND READ',W*.64,D*.46,.45,-1,0,.9,true); sitIn('SOFA: SIT AND READ',W*.5,D*.62,.45,0,-1,2.0,true); sitIn('SOFA: SIT AND READ',W*.5,D*.3,.45,0,1,2.0,true);
    use('RETURNS',CD+.4,D*.86,1.0,1.1,()=>{ if(!S.b.length)return say('YOU HAVE NOTHING OF OURS. TAKE SOMETHING.'); load().then(()=>{ for(const id of S.b.slice())LIB.giveBack(id); say('INTO THE RETURNS TROLLEY. THE PROFESSOR WILL SHELVE THEM.'); }); });
    // dust drifting in the lamplight
    { const N=220, P=new Float32Array(N*3), V=[]; for(let i=0;i<N;i++){ const p=F.pw(W*.1+Math.random()*W*.8,D*.15+Math.random()*D*.75); P[i*3]=p[0]; P[i*3+1]=(.3+Math.random()*(HT-1))*MW; P[i*3+2]=p[1]; V.push([(Math.random()-.5)*.02,(Math.random()-.4)*.01,(Math.random()-.5)*.02]); }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); const m=new THREE.PointsMaterial({color:0xffe2b0,size:.025*MW,transparent:true,opacity:.55,depthWrite:false});
      const pts=new THREE.Points(g,m); A.add(pts); DUST={pts,P,V,y0:.2*MW,y1:(HT-.4)*MW,t:0}; }
    K.flush(); };
  MSHOP.kit.books.drop=()=>{ DUST=null; };
  SYS.add('places',dt=>{ if(!DUST||!DUST.pts.parent)return; const {P,V}=DUST, MW=IKIT.MW, k=(dt||0)*MW*.5; DUST.t+=dt||0; for(let i=0;i<V.length;i++){ const j=i*3; P[j]+=V[i][0]*k+Math.sin(DUST.t*.3+i)*.0006*MW; P[j+1]+=V[i][1]*k; P[j+2]+=V[i][2]*k; if(P[j+1]>DUST.y1||P[j+1]<DUST.y0)V[i][1]*=-1; } DUST.pts.geometry.attributes.position.needsUpdate=true; },'144ca-library');
  /* ---------- outside: polyfork's awning over the window, the hanging sign, a cart of books and a plant on the sidewalk (data/bookfront.json, loaded when you come near) ---------- */
  { const FJ=__LAZY__("data/bookfront.json"); let done=false, chk=0;
    SYS.add('places',dt=>{ if(done||(chk-=dt||0)>0)return; chk=1; const at=MSHOP.at&&MSHOP.at.books, o=ROOMS.off&&ROOMS.off.books; if(!at||!o)return;
      if(Math.hypot(pos.x-at.door[0],pos.z-at.door[1])>60*IKIT.MW)return; done=true;
      FJ().then(Dd=>{ const MW=IKIT.MW, d=at.door, n0=[o.out[0]-d[0],o.out[1]-d[1]], nl=Math.hypot(n0[0],n0[1])||1, n=[n0[0]/nl,n0[1]/nl], tg=[n[1],-n[0]], G=new THREE.Group(); G.name='books-front'; scene.add(G);
        const put=(k,a,b,h,ry=0)=>{ const g=KIT.decode(Dd[k]); g.computeBoundingBox(); const bb=g.boundingBox, me=new THREE.Mesh(g,KIT.mat), grp=new THREE.Group(); me.position.set(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2); me.castShadow=me.receiveShadow=true; grp.add(me);
          const x=d[0]+n[0]*a*MW+tg[0]*b*MW, z=d[1]+n[1]*a*MW+tg[1]*b*MW; grp.scale.setScalar(MW); grp.position.set(x,(SHARED.groundY?SHARED.groundY(x,z):0)+h*MW,z); grp.rotation.y=Math.atan2(n[0],n[1])+ry; G.add(grp); return grp; };
        put('awning',.45,2.6,2.55); put('awning',.45,-2.6,2.55); put('sign',.35,4.6,2.0,Math.PI/2); put('trolley',1.1,2.4,0,Math.PI/2); put('plant',.6,-1.3,0); put('plant',.6,1.3,0); }).catch(()=>{ done=false; }); },'144ca-library'); }
  window.LIBDBG=()=>({data:!!LIB.data,n:LIB.data?LIB.data.books.length:0,borrowed:S.b.slice(),panel:!P.hidden,reading:cur?{id:cur.b.id,i:cur.i,lines:cur.L.length,pages:Math.ceil(cur.L.length/LPP)}:null,shop:!!(MSHOP.at&&MSHOP.at.books)});
}
