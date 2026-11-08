// THE BOOKS: BOOKS, the old books the player finds, mends and sells.
import {SHARED, THREE} from './003-shx.js';
import {BOOKS, CITY, DRESS, FORAGE, INSPECT, INV, MAIL, SFX, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {TILE} from './006-map-pre.js';
 window.BOOKS=BOOKS;
{ const T=TILE, KEY='books', say=SAY, use=FORAGE.use;
  const BK=[['paper','TATTERED PAPERBACK','MENDED PAPERBACK',0,2,6,1,{bs_glue:1},[0,45]],['novel','WATER-STAINED NOVEL','RESTORED NOVEL',15,4,14,2,{bs_glue:1,bs_thread:1},[10,55]],
    ['atlas','BROKEN-SPINED ATLAS','RESTORED ATLAS',30,8,30,4,{bs_glue:1,bs_thread:1,bs_cloth:1},[25,70]],['hymnal','LOOSE-LEAFED HYMNAL','REBOUND HYMNAL',40,10,40,5,{bs_thread:2,bs_cloth:1},[35,80]],
    ['ledger','MOLDY SHOP LEDGER','RESTORED LEDGER',50,12,55,6,{bs_glue:1,bs_thread:1,bs_leather:1},[45,90]],['herbal','CRUMBLING HERBAL','RESTORED HERBAL',60,0,90,10,{bs_glue:2,bs_thread:2,bs_leather:1},[55,100]],
    ['first','RUINED FIRST EDITION','RESTORED FIRST EDITION',75,0,220,15,{bs_glue:1,bs_thread:2,bs_leather:2},[70,115]]];
  const SUP=[['bs_kit',"BINDER'S KIT",15],['bs_glue',"BOOKBINDER'S GLUE",1],['bs_thread','LINEN THREAD',1],['bs_cloth','BOOKCLOTH',2],['bs_leather','CALF LEATHER',6]];
  const NM={}, PR={}, RC=[]; for(const [id,w,r,,,rp,wp,ins,mm] of BK){ NM['bk_'+id]=w; NM['br_'+id]=r; PR['bk_'+id]=wp; PR['br_'+id]=rp; RC.push(['br_'+id,r,'bind',mm,Object.assign({['bk_'+id]:1},ins),'sells for $'+rp]); }
  for(const [id,n] of SUP)NM[id]=n; FORAGE.add({names:NM,prices:PR,recipes:RC});
  // bookcloth from flowers (their dye), and the museum's library takes the first of each restored book
  FORAGE.add({recipes:[['bs_cloth','BOOKCLOTH','bind',[0,40],{fl_daisy:2,fl_bluebell:2},'dyed with flowers; mends atlases and hymnals']]});
  FORAGE.GIFTS.push({is:id=>/^br_/.test(id),place:'museum',pay:id=>(PR[id]||10)*2,thanks:(id,p)=>`THE MUSEUM'S LIBRARY SHELVES YOUR ${NM[id]} AND PAYS $${p}.`});
  FORAGE.BOOK.push({id:'books',title:'BOOKS',rows:()=>BK.map(b=>[b[2],FORAGE.has('br_'+b[0])>0||FORAGE.gave('museum','br_'+b[0])||!!(FORAGE.S.made&&FORAGE.S.made['br_'+b[0]]),FORAGE.gave('museum','br_'+b[0])?'IN THE MUSEUM':'',b[3]>=60]),foot:'Old books turn up in the trash cans. Mend them with a binder\'s kit; give the museum\'s library the first of each.'});
  const BC={atlas:0x2a5a8a,first:0x6a1a1a,herbal:0x3a6a2a,hymnal:0x2a2a2a,ledger:0x5a3a1a,novel:0x7a4a6a,paper:0xc8a040};
  INSPECT.kinds.push({is:id=>/^(bk|br)_/.test(id)&&!!BC[id.slice(3)]||/^bs_/.test(id),make:id=>{ '@later'; const P=INSPECT.part;
    if(id==='bs_glue')return INSPECT.shape('jar',0xe8e0c0,0xb08a5a); if(id==='bs_kit')return INSPECT.shape('parcel',0x5a4030,0x2a2018);
    if(id==='bs_thread'){ const g=new THREE.Group(); g.add(P('cyl',0xe8e0cc,0,0,0,.04,.07,.04),P('cyl',0x8a6a44,0,0,0,.05,.012,.05),P('cyl',0x8a6a44,0,.04,0,.05,.012,.05)); g.children[2].position.y=-.04; g.children[1].position.y=.04; return g; }
    if(/^bs_/.test(id))return INSPECT.shape('book',id==='bs_leather'?0x8a5a32:0x6a7a9a,id==='bs_leather'?0x7a4a28:0x5a6a8a);
    const c=new THREE.Color(BC[id.slice(3)]); if(id.startsWith('bk_'))c.lerp(new THREE.Color(0x8a8070),.45); return INSPECT.shape('book',c.getHex(),id.startsWith('bk_')?0xc8bc98:0xf2ead6); }});
  FORAGE.CK.bind={short:'BIND',bonus:()=>FORAGE.has('quill_pen')?10:0,need:()=>FORAGE.has('bs_kit')?null:"YOU NEED A BINDER'S KIT (THE PROFESSOR AT THE BOOKSTORE SELLS ONE).",made:nm=>`YOU MEND IT, PAGE BY PAGE: ${nm}.`,fail:'THE GLUE SETS CROOKED. THE BOOK IS NO WORSE, BUT YOUR SUPPLIES ARE WASTED.',keep:id=>id.startsWith('bk_'),
    status:()=>FORAGE.has('bs_kit')?"BINDER'S KIT":"NO BINDER'S KIT"};
  FORAGE.HELP.push("BOOKBINDING restores worn books (a binder's kit, glue, thread, cloth, leather); find them in trash cans and the river, or buy them from the Professor at the bookstore, who buys them back mended.");
  const day=()=>window.MAIL&&MAIL.ready?MAIL.day():window.CITY?CITY.day||0:0;
  const S={v:1,cans:{},sd:-1,stock:{}}; try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1)Object.assign(S,D); }catch(e){} const save=()=>OWNED.set(KEY,JSON.stringify(S));
  const restock=()=>{ if(S.sd===day())return; S.sd=day(); S.stock={paper:4,novel:3,atlas:2,hymnal:2,ledger:1}; save(); };
  const roll=L=>{ let s=L.reduce((a,b)=>a+b[1],0)*Math.random(); for(const [id,w] of L)if((s-=w)<0)return id; return L[0][0]; };
  BOOKS.find=(L,where)=>{ const id=roll(L); FORAGE.give('bk_'+id,1); say(`${where}: ${/^[AEIOU]/.test(NM['bk_'+id])?'AN':'A'} ${NM['bk_'+id]}.`,id==='first'||id==='herbal'?'#f2c14e':'#c8b0ff'); FORAGE.draw(); };
  BOOKS.chest=()=>BOOKS.find([['atlas',3],['ledger',3],['herbal',2],['first',1]],'ALSO IN THE CHEST, WRAPPED IN OILCLOTH');
  for(const [i,c] of ((window.DRESS&&DRESS.cans)||[]).entries()){ const hb=new THREE.Mesh(new THREE.BoxGeometry(.6*T,.9*T,.6*T),new THREE.MeshBasicMaterial({visible:false})), y=typeof SHARED.groundY!=='undefined'?SHARED.groundY(c.x,c.z):0; hb.position.set(c.x,y+.45*T,c.z); scene.add(hb);
    UI.thing({name:'TRASH CAN',pick:true,obj:hb,reach:1*T,near:1.8*T,tall:1*T,act:()=>{ '@later'; const k='c'+i; if(S.cans[k]===day())return say('YOU HAVE BEEN THROUGH THIS ONE TODAY. NOTHING BUT WRAPPERS.','#c8c2b0');
      S.cans[k]=day(); save(); SFX.play('clunk',{vol:.3}); if(Math.random()<.4)BOOKS.find([['paper',6],['novel',3],['atlas',1],['hymnal',1]],'UNDER THE NEWSPAPERS');
      else say(['NOTHING BUT WRAPPERS AND A BENT FORK.','A SODA CAN, A SHOE, NOTHING YOU WANT.','JUST YESTERDAY\'S PAPERS.'][Math.floor(Math.random()*3)],'#c8c2b0'); }}); }
  const B='style="margin:0 0 0 4px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer"';
  const row=(a,b,c,d)=>`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">${a}</td><td style="text-align:right;padding:4px 6px">${b}</td><td style="text-align:right">${c}</td><td style="text-align:right;white-space:nowrap">${d}</td></tr>`;
  const P=document.createElement('div'); P.id='bookp'; P.hidden=true; P.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);width:min(470px,92vw);max-height:80vh;overflow:auto;z-index:21;padding:14px 16px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  document.body.appendChild(P); P.addEventListener('keydown',e=>e.stopPropagation()); P.addEventListener('keyup',e=>e.stopPropagation());
  const draw=()=>{ '@later'; if(P.hidden)return; restock(); const has=FORAGE.has, mine=Object.keys(INV.items).filter(id=>INV.items[id]>0&&/^(bk_|br_)/.test(id)).sort((a,b)=>b.localeCompare(a));
    let o=`<h3 style="margin:0 0 4px;color:#f2c14e;font:12px Silkscreen,monospace">THE ODDITIES STALL</h3><div style="color:#9b9584;margin-bottom:8px">Self serve. Old books and the things to mend them. Mended books bought back. Pay in the tin.</div><div style="margin-bottom:8px">YOU HAVE <b style="color:#f2c14e">$${Math.round(INV.cash)}</b></div>`;
    o+=`<div style="margin-bottom:8px"><button ${B} data-gem="1" style="margin:0">THE GEM OF THE DAY</button></div><div style="margin:6px 0 4px;color:#9b9584">WORN BOOKS (TODAY'S BOX)</div><table style="border-collapse:collapse;width:100%">`;
    for(const [id,w,,,p] of BK){ if(!p)continue; const n=S.stock[id]||0; o+=row(w+`<div style="color:#8a8676;font-size:10px">${n} LEFT</div>`,'$'+p,has('bk_'+id)?'x'+has('bk_'+id):'',n?`<button ${B} data-buy="bk_${id}">BUY</button>`:''); }
    o+=`</table><div style="margin:10px 0 4px;color:#9b9584">BINDING THINGS</div><table style="border-collapse:collapse;width:100%">`;
    for(const [id,n,p] of SUP){ if(id==='bs_kit'&&has('bs_kit'))continue; o+=row(n,'$'+p,has(id)?'x'+has(id):'',`<button ${B} data-buy="${id}">BUY</button>${id==='bs_kit'?'':`<button ${B} data-buy="${id}" data-n="5">5 $${p*5}</button>`}`); }
    o+=`</table><div style="margin:10px 0 4px;color:#9b9584">IT BUYS</div><table style="border-collapse:collapse;width:100%">`+mine.map(id=>{ const n=has(id), v=PR[id]; return row(NM[id],'$'+v,'x'+n,`<button ${B} data-sell="${id}">SELL</button>${n>1?`<button ${B} data-sell="${id}" data-n="all">ALL $${v*n}</button>`:''}`); }).join('')+'</table>';
    if(!mine.length)o+='<div style="color:#7d7a70;margin-top:6px">No books on you. Mend one with a binder\'s kit (THE PACK, CRAFT) and bring it here.</div>';
    const x=P.querySelector(':scope>.pX'); P.innerHTML=o; if(x)P.appendChild(x); };
  P.addEventListener('click',e=>{ '@later'; const b=e.target.closest('button'); if(!b||b.classList.contains('pX'))return; const d=b.dataset;
    if(d.gem){ P.hidden=true; INV.pick('stall'); return; }
    if(d.buy){ const n=+d.n||1, bk=d.buy.startsWith('bk_'), id=d.buy.slice(3), p=bk?BK.find(x=>x[0]===id)[4]:SUP.find(x=>x[0]===d.buy)[2], c=p*n;
      if(bk&&!(S.stock[id]>0))say('NONE LEFT TODAY.','#c8a090'); else if(INV.cash<c)say('YOU CANNOT AFFORD THAT.','#c8a090'); else { INV.cash-=c; FORAGE.give(d.buy,n); if(bk){ S.stock[id]--; save(); } say(`YOU DROP $${c} IN THE TIN AND TAKE ${n>1?n+' ':''}${NM[d.buy]}.`); } }
    if(d.sell){ const n=d.n==='all'?FORAGE.has(d.sell):1, v=PR[d.sell]*n; FORAGE.take(d.sell,n); INV.cash+=v; say(`YOU SELL ${n} ${NM[d.sell]} FOR $${v}.`,'#f2c14e'); SFX.play('clunk',{vol:.5}); }
    INV.add('x',0); delete INV.items.x; draw(); FORAGE.draw(); });
  BOOKS.open=()=>{ P.hidden=false; draw(); };
  for(const th of UI.things)if(th.name==='THE ODDITIES STALL')th.act=BOOKS.open;
  window.BOOKDBG=()=>({stock:{...S.stock},cans:{...S.cans},mine:Object.keys(INV.items).filter(id=>/^(bk_|br_)/.test(id)),bind:FORAGE.sk('bind'),kit:FORAGE.has('bs_kit')}); }
