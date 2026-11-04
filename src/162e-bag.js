// THE BAG: BAG is your inventory (I): a leather backpack that is its own window with no box round it, dragged about by its leather and made any size by its corner; its mouth holds item pictures LOOSE (anywhere, like desktop icons) or TILED (a sorted grid), or a LIST of them (a little picture, the name, the count), dragged onto the quick bar or out onto the ground (a loose thing at your feet, picked up by a double click); a pixel picture for every item family (the item model's PICTURE); what you wear (EQUIP) or hold (WIELD) stays in it, tagged.
import {SHARED, THREE} from './003-shx.js';
import {BAG, EQUIP, FORAGE, HUD, INV, ITEMS, LEVELS, pos, ROOMS, SFX, st, TEXT, UI, VIT, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer, scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
import {GEMS} from './101-gems.js';
window.BAG=BAG;
{ const T=TILE, esc=TEXT.esc, say=SAY, name=id=>FORAGE.name(id), prop=(id,k)=>ITEMS.prop(id,k);
  const PAL={k:'#1b1410',w:'#f4efe4',y:'#d8a52a',s:'#5e6270',S:'#a8adb8',t:'#d9c39a',n:'#6b4425',N:'#a4713f',d:'#222a33'};
  // 10x10 pictures: A the thing's own colour, a its shade, B a second colour, the rest the palette
  const ART={
    mush:['...kkkk...','..kAAAAk..','.kAaAAaAk.','kAAAAAAAAk','kkkkkkkkkk','...kttk...','...kttk...','...kttk...','..kttttk..','..kkkkkk..'],
    potion:['...kkkk...','...kwwk...','...kwwk...','..kkAAkk..','.kAAAAAAk.','.kAaAAAak.','.kAAAAAAk.','.kAAaaAAk.','..kAAAAk..','...kkkk...'],
    dish:['..........','..........','...kkkk...','..kAAAAk..','.kkkkkkkk.','.kSSSSSSk.','..kSSSSk..','...kkkk...','..........','..........'],
    fish:['..........','..kkkk....','.kAAAAk..k','kAwAAAAkkk','kAAAAAAAAk','.kAAAAk.kk','..kkkk...k','..........','..........','..........'],
    fruit:['....kk....','...kBBk...','..kkAAkk..','.kAAAAAAk.','kAwAAAAAAk','kAAAAAAAak','kAAAAAAaak','.kAAAAaak.','..kAAaak..','...kkkk...'],
    bfly:['..........','.kk....kk.','kAAk..kAAk','kAaAkkAaAk','kAAAkkAAAk','.kAAkkAAk.','..kAkkAk..','..kk..kk..','..........','..........'],
    bird:['..........','...kkk....','..kAAyk...','..kAAAk...','kkAAAAAk..','kAAAAAAk..','.kAAAAk...','..kkkk....','...k.k....','..........'],
    book:['.kkkkkkkk.','kAAAAAAAk.','kAAAAAAAkk','kAaAAAAAwk','kAAAAAAAwk','kAAAAAAAwk','kAaAAAAAwk','kAAAAAAAwk','kkkkkkkkk.','..........'],
    jar:['..kkkkkk..','..knnnnk..','.kkkkkkkk.','.kwAAAAAk.','.kwAAAAAk.','.kAAAAAAk.','.kAAAAAAk.','.kAAAAAAk.','.kkkkkkkk.','..........'],
    seed:['....kk....','...kttk...','..kttttk..','.kttttttk.','.ktAtAttk.','.kttAtAtk.','.ktAttAtk.','..kttttk..','...kkkk...','..........'],
    sword:['........k.','.......kAk','......kAak','.....kAak.','....kAak..','...kAak...','.kkkAak...','..kyyk....','.kyk.kk...','kk........'],
    net:['....kk....','...kNNk...','..kNkkNk..','.kSkSkSkS.','kSkSkSkSk.','.kSkSkSk..','..kSkSk...','...kkk....','....k.....','....k.....'],
    rod:['.........k','........kk','.......kNk','......kNk.','.....kNk..','....kNk...','...kNk....','..kNk..k..','.kNk..kyk.','kkk....k..'],
    goggles:['..........','..........','kkkkkkkkkk','kSSkkkkSSk','kSAAkkSAAk','kSAAk.kAAk','kkkk...kkk','..........','..........','..........'],
    lamp:['..........','..kkkkkk..','.kSSSSSSk.','.kSkkkkSk.','.kSkyykSk.','.kSkyykSk.','.kSkkkkSk.','.kSSSSSSk.','..kkkkkk..','..........'],
    armour:['..kkkkkk..','.kSSkkSSk.','kSSkSSkSSk','kSSkSSkSSk','kkkSSSSkkk','..kSdSSdk.','..kSSSSSk.','..kSSSSSk.','..kdSSSdk.','..kkkkkk..'],
    coat:['..kkkkkk..','.kAAkkAAk.','kAAkAAkAAk','kAAkAAkAAk','kkkAAAAAkk','..kAaAAAk.','..kAaAAAk.','..kAaAAAk.','..kAaAAAk.','..kkkkkk..'],
    jeans:['..........','.kkkkkkkk.','.kAAAAAAk.','.kAAAAAAk.','.kAAkkAAk.','.kAAk.kAAk','.kAAk.kAAk','.kAAk.kAAk','.kkkk.kkkk','..........'],
    tank:['...kkkk...','...kddk...','..kkkkkk..','.kAAAAAAk.','.kAAAAAAk.','.kAaAAAAk.','.kAAAAAAk.','.kAAAAAAk.','..kkkkkk..','..........'],
    board:['..........','..........','..........','.kkkkkkkk.','kAAAAAAAAk','kAaAAAAaAk','.kkkkkkkk.','..kk..kk..','..kk..kk..','..........'],
    cage:['....kk....','...kkkk...','.kkkkkkkk.','.kSkSkSkk.','.kSkSkSkk.','.kSkSkSkk.','.kSkSkSkk.','.kSkSkSkk.','.kkkkkkkk.','..........'],
    cigar:['..........','..........','..........','..........','kkkkkkkkkk','kNnnnnnnAk','kNnnnnnnak','kkkkkkkkkk','..........','..........'],
    gadget:['.kkkkkkkk.','.kddddddk.','.kdAAAAdk.','.kdAAAAdk.','.kdAAAAdk.','.kddddddk.','.kkkkkkkk.','..kSSSSk..','.kkkkkkkk.','..........'],
    cube:['..kkkkkk..','.kBBkAAk..','.kBBkAAk..','kkkkkkkkk.','kAAkBBkak.','kAAkBBkak.','kkkkkkkkk.','kBBkAAkak.','kBBkAAkak.','kkkkkkkkk.'],
    kite:['....kk....','...kAAk...','..kAaAAk..','.kAAAAAAk.','..kAAAAk..','...kAAk...','....kk....','....k.....','...k......','..k.......'],
    card:['..........','.kkkkkkkk.','.kAAAAAAk.','.kAwwAAAk.','.kAwwAAAk.','.kAAAAAAk.','.kAaaaaAk.','.kAAAAAAk.','.kkkkkkkk.','..........'],
    gem:['....kk....','..kkAAkk..','.kAAAAAAk.','kAAaAAaAAk','kAaAAAAaAk','.kAaAAaAk.','..kAaaAk..','...kAAk...','....kk....','..........'],
    mortar:['....kk....','...kttk...','...kttk...','kkkkttkkkk','kSSSSSSSSk','kSssssssSk','.kSSSSSSk.','..kSSSSk..','..kssssk..','..kkkkkk..'],
    sack:['...kkkk...','..kNttNk..','.kNkkkkNk.','.kNNNNNNk.','kNnNNNNnNk','kNNNNNNNNk','kNNnNNnNNk','kNNNNNNNNk','.kNNNNNNk.','..kkkkkk..'],
    tool:['...kkk....','...kAk....','..kkkkkk..','..kSSSSk..','..kSAASk..','..kSAASk..','..kSAASk..','..kSSSSk..','..kkkkkk..','..........'],
    crate:['..........','.kkkkkkkk.','.kNNNNNNk.','.kNkNNkNk.','.kNNkkNNk.','.kNNkkNNk.','.kNkNNkNk.','.kNNNNNNk.','.kkkkkkkk.','..........']};
  BAG.PICS=Object.keys(ART);
  const MAIN={mush:'#8fd36a',potion:'#ef6d5a',dish:'#e07a2a',fish:'#7fb2f0',fruit:'#c8342c',bfly:'#c49cf0',bird:'#7fb2f0',book:'#7a3fb0',jar:'#d8a52a',seed:'#8fd36a',sword:'#d8dce2',goggles:'#7fb2f0',coat:'#3f8a3a',jeans:'#2f5fb8',tank:'#d8a818',board:'#a4713f',cigar:'#c8342c',gadget:'#8fd36a',cube:'#c8342c',kite:'#ef6d5a',card:'#2f5fb8',gem:'#c49cf0',tool:'#a8adb8'};
  const KIND=[[/^(m_|u_)|shroom$|^glowcap$/,'mush'],[/^p_|^bottle$|^soda_|^slime_/,'potion'],[/^f_/,'dish'],[/^x_/,'fish'],[/^(fr_|nut_)/,'fruit'],[/^bu?_\d/,'bfly'],[/^(bd_|pet_)|^bird/,'bird'],[/^(bk_|br_)|book|^bs_/,'book'],[/^(jar_|honey_)/,'jar'],[/seed/,'seed'],[/^sword|blade|putter|axe/,'sword'],[/^b?net$/,'net'],[/^rod|reel|lure|bait|crabpot/,'rod'],[/goggles|shades|binoc/,'goggles'],[/headlight|lamp|lantern/,'lamp'],[/^armor$/,'armour'],[/coat|jacket/,'coat'],[/jeans|pants/,'jeans'],[/scuba|tank/,'tank'],[/board/,'board'],[/^cage|feeder/,'cage'],[/cigar/,'cigar'],[/phone|modem|pc_|radio|scanner|tv_/,'gadget'],[/cube|dice/,'cube'],[/kite|balloon/,'kite'],[/passport|ticket/,'card'],[/^cut_|gem|meteor/,'gem'],[/mortar/,'mortar'],[/spray|cutter|extractor|smoker/,'tool'],[/cooler|kart|skate/,'crate']];
  const hex=v=>'#'+(v>>>0).toString(16).padStart(6,'0').slice(-6), shade=c=>{ if(c[0]==='#'&&c.length===7){ const n=parseInt(c.slice(1),16); return hex(((n>>16)*.62<<16)|(((n>>8&255)*.62)<<8)|((n&255)*.62)); } const m=/hsl\((\d+),(\d+)%,(\d+)%\)/.exec(c); return m?`hsl(${m[1]},${m[2]}%,${Math.round(m[3]*.62)}%)`:c; };
  const hue=id=>{ let h=0; for(let i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))%360; return `hsl(${h},52%,56%)`; };
  BAG.kind=id=>{ const p=prop(id,'icon'); if(p&&p!=='auto'&&ART[p])return p; if(GEMS.some(g=>g[0]===id&&!id.startsWith('m_')))return 'gem'; for(const [re,k] of KIND)if(re.test(id))return k; return 'sack'; };
  const colour=(id,k)=>{ const c=prop(id,'color'); if(c&&c!=='none')return c; if(k==='mush'){ const m=(FORAGE.MU||{})[id.slice(2)]; if(m&&m[5]!=null)return hex(m[5]); } if(id.startsWith('cut_')){ const q=prop(id.slice(4),'color'); if(q&&q!=='none')return q; } if(id==='bottle')return '#a8adb8'; if(k==='fish'||k==='sack'||k==='crate'||k==='mortar'||k==='net'||k==='rod'||k==='lamp'||k==='armour')return MAIN[k]||'#a8adb8'; return MAIN[k]&&!/^(coat|gadget|cube|kite|card|bfly|bird|book|jar|potion|fruit|dish|board)$/.test(k)?MAIN[k]:hue(id); };
  const CV=new Map(); const paint=id=>{ '@later'; let c=CV.get(id); if(c)return c; const k=BAG.kind(id), A=colour(id,k), a=shade(A), B=k==='fruit'?'#3f8a3a':k==='cube'?'#f4efe4':a;
    c=document.createElement('canvas'); c.width=c.height=10; const g=c.getContext('2d'); ART[k].forEach((row,y)=>{ for(let x=0;x<10;x++){ const ch=row[x]; if(!ch||ch==='.')continue; g.fillStyle=ch==='A'?A:ch==='a'?a:ch==='B'?B:PAL[ch]||'#f0f'; g.fillRect(x,y,1,1); } }); CV.set(id,c); return c; };
  const URL=new Map(); BAG.icon=id=>{ let u=URL.get(id); if(!u){ u=paint(id).toDataURL(); URL.set(id,u); } return u; };

  /* ---------- the window and the mouth: where each thing lies ---------- */
  const MW=280, MH=260, IC=44, BW=400, BH=500; let POS={}, ORDER=[], S=1, TILED=false, LIST=false; try{ POS=JSON.parse(OWNED.get('bagpos')||'{}')||{}; ORDER=JSON.parse(OWNED.get('bagorder')||'[]')||[]; S=Math.max(.5,Math.min(3,+OWNED.get('bagsize')||1)); TILED=OWNED.get('bagsort')==='tiled'; LIST=OWNED.get('bagview')==='list'; }catch(e){ POS={}; }
  const saveSet=()=>{ try{ OWNED.set('bagsize',String(+S.toFixed(2))); OWNED.set('bagsort',TILED?'tiled':'loose'); OWNED.set('bagview',LIST?'list':'icons'); OWNED.set('bagorder',JSON.stringify(ORDER)); }catch(e){} };
  // TILED: a sorted grid, every cell the same, the cell shrinking so all fit; dragging a thing moves it to that cell in the order
  const cell=n=>Math.max(22,Math.min(IC+6,Math.floor(Math.sqrt(MW*MH/Math.max(1,n)))));
  const tiles=ids=>{ const c=cell(ids.length), cols=Math.max(1,Math.floor(MW/c)); ORDER=ORDER.filter(id=>ids.includes(id)); for(const id of ids)if(!ORDER.includes(id))ORDER.push(id); return {c,cols,at:id=>{ const i=ORDER.indexOf(id); return [(i%cols)*c,Math.floor(i/cols)*c]; }}; };
  const savePos=()=>{ try{ OWNED.set('bagpos',JSON.stringify(POS)); }catch(e){} };
  const wornAs=id=>WIELD.on===id?'HELD':Object.values(EQUIP.by).includes(id)?'WORN':'';
  const inBag=()=>Object.keys(INV.items).filter(id=>INV.items[id]>0).sort();
  const spot=(id,ids)=>{ if(POS[id])return POS[id]; const used=ids.filter(q=>q!==id&&POS[q]).map(q=>POS[q]); for(let y=0;y+IC<=MH;y+=26)for(let x=0;x+IC<=MW;x+=28)if(!used.some(p=>Math.abs(p[0]-x)<34&&Math.abs(p[1]-y)<34))return POS[id]=[x,y]; return POS[id]=[Math.round(Math.random()*(MW-IC)),Math.round(Math.random()*(MH-IC))]; };
  let sel=null;
  const SVG=`<svg class="bgart" width="400" height="500" viewBox="0 0 80 100"><rect x="4" y="30" width="5" height="50" fill="#4a2f17" stroke="#1b1410" stroke-width="1"/><rect x="71" y="30" width="5" height="50" fill="#4a2f17" stroke="#1b1410" stroke-width="1"/><path d="M8 24h64v66q0 6-6 6H14q-6 0-6-6z" fill="#6b4425" stroke="#1b1410" stroke-width="1"/><rect x="12" y="30" width="56" height="58" fill="#2a1a10" stroke="#3f2816" stroke-width="1"/><path d="M8 22h64v7q-8 6-32 6T8 29z" fill="#7d5230" stroke="#1b1410" stroke-width="1"/><rect x="37" y="27" width="6" height="7" fill="#d8a52a" stroke="#1b1410" stroke-width="1"/><rect x="36" y="91" width="8" height="3" fill="#d8a52a" stroke="#1b1410" stroke-width="1"/><path d="M8 24q-2-10 6-12h52q8 2 6 12" fill="none" stroke="#1b1410" stroke-width="1"/></svg>`;
  const B='style="margin:0 0 0 4px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer"';
  const icon=(id,n,x,y,sz=IC)=>{ const w=wornAs(id); return `<div class="bgi${sel===id?' sel':''}" data-id="${esc(id)}" title="${esc(name(id))}" style="left:${x}px;top:${y}px;width:${sz}px;height:${sz}px"><img alt="" draggable="false" src="${BAG.icon(id)}">${n>1?`<span>x${n}</span>`:''}${w?`<i>${w}</i>`:''}</div>`; };
  const row=id=>{ const w=wornAs(id), n=INV.items[id]; return `<div class="bgr${sel===id?' sel':''}" data-id="${esc(id)}" title="${esc(name(id))}"><img alt="" draggable="false" src="${BAG.icon(id)}"><b style="${id.startsWith('u_')?'color:#c8b0ff':''}">${esc(name(id))}</b>${w?`<u>${w}</u>`:''}${n>1?`<i>x${n}</i>`:''}</div>`; };
  const strip=()=>{ const id=sel; if(!id||!INV.items[id])return `<div class="bgf" style="color:#7d7a70">${inBag().length?'CLICK A THING · DOUBLE CLICK USES IT · DRAG IT ABOUT, ONTO THE QUICK BAR, OR OUT ONTO THE GROUND':'NOTHING. FIND MUSHROOMS ON THE LAWNS: A DOUBLE CLICK PICKS ONE.'}</div>`;
    const n=INV.items[id], eat=FORAGE.eats(id), w=wornAs(id), notes=FORAGE.NOTE.map(f=>f(id)).filter(Boolean).map(t=>` <span style="color:#9b9584">${esc(t)}</span>`).join(''), hand=!!(WIELD.LIST&&WIELD.LIST.includes(id));
    return `<div class="bgf"><span style="${id.startsWith('u_')?'color:#c8b0ff':''}">${esc(name(id))}</span>${n>1?' <span style="color:#9b9584">x'+n+'</span>':''}${w?' <span style="color:#f2c14e">'+w+'</span>':''}${notes}<span class="bgb">${eat?`<button ${B} data-eat="${id}">${id.startsWith('p_')?'DRINK':'EAT'}</button>`:''}${id.startsWith('u_')?`<button ${B} data-id="${id}">IDENTIFY</button>`:''}${hand?`<button ${B} data-hold="${id}">${WIELD.on===id?'LET GO':'HOLD'}</button>`:''}${FORAGE.ROWB.flatMap(f=>f(id)).map(([l,a])=>`<button ${B} data-act="${a}" data-aid="${id}">${l}</button>`).join('')}<button ${B} data-bagdrop="${id}">DROP</button>${n>1?`<button ${B} data-bagdrop="${id}" data-n="all">DROP ALL</button>`:''}</span></div>`; };
  const pk=document.createElement('div'); pk.id='bagp'; pk.hidden=true; pk.style.cssText='position:fixed;z-index:21;right:24px;top:190px;width:400px;padding:0;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:none;border:0;zoom:var(--uiz,1)';
  document.body.appendChild(pk); pk.addEventListener('keydown',e=>e.stopPropagation()); pk.addEventListener('keyup',e=>e.stopPropagation());
  const css=document.createElement('style'); css.textContent=`#bagp>.pX{right:52px;top:150px} #bagp .bgo{position:relative} #bagp .bgk{position:absolute;left:0;top:0;width:${BW}px;height:${BH}px;transform-origin:0 0} #bagp .bgart{display:block;shape-rendering:crispEdges;filter:drop-shadow(0 6px 0 #0006)}
    #bagp .bgt{position:absolute;left:60px;right:60px;top:122px;text-align:center;color:#f2c14e;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 0 #000;pointer-events:none} #bagp .bgsw{position:absolute;left:62px;top:138px;display:flex;gap:4px} #bagp .bgsw button{font:9px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#1b1410cc;border:1px solid #3f2816;padding:2px 6px;cursor:pointer} #bagp .bgsw button:hover{color:#f2c14e}
    #bagp .bgm.list{overflow-y:auto;overflow-x:hidden} #bagp .bgr{display:flex;align-items:center;gap:6px;height:24px;padding:0 4px;border-bottom:1px solid #3f2816;white-space:nowrap;cursor:grab;touch-action:pan-y;user-select:none;-webkit-user-select:none} #bagp .bgr img{width:18px;height:18px;image-rendering:pixelated;flex:none;pointer-events:none} #bagp .bgr b{font-weight:400;flex:1;overflow:hidden;text-overflow:ellipsis;color:#ece5d3} #bagp .bgr i{font-style:normal;color:#f2c14e;font-size:10px} #bagp .bgr u{text-decoration:none;color:#9fe07f;font-size:8px} #bagp .bgr.sel{background:#f2c14e22;outline:1px solid #f2c14e} #bagp .bgr.held{opacity:.3}
    #bagp .bggrip{position:absolute;right:48px;bottom:24px;width:26px;height:26px;background:none;border:0;padding:0;cursor:nwse-resize;touch-action:none} #bagp .bggrip::before{content:'';position:absolute;right:4px;bottom:4px;width:14px;height:14px;border-right:4px solid #d8a52a;border-bottom:4px solid #d8a52a;box-shadow:2px 2px 0 #1b1410}
    #bagp .bgm{position:absolute;left:60px;top:180px;width:${MW}px;height:${MH}px} #bagp .bgi{position:absolute;width:${IC}px;height:${IC}px;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none} #bagp .bgi img{width:100%;height:100%;image-rendering:pixelated;display:block;filter:drop-shadow(1px 1px 0 #0008);pointer-events:none} #bagp .bgi.sel img{filter:drop-shadow(0 0 0 #f2c14e) drop-shadow(1px 1px 0 #f2c14e) drop-shadow(-1px -1px 0 #f2c14e)} #bagp .bgi.held{opacity:.3}
    #bagp .bgi span,#bagp .bgi i{position:absolute;font-size:9px;font-style:normal;text-shadow:0 1px 0 #000,1px 0 0 #000,-1px 0 0 #000,0 -1px 0 #000;pointer-events:none} #bagp .bgi span{right:-3px;bottom:-4px;color:#f2c14e} #bagp .bgi i{left:-2px;top:-5px;color:#9fe07f;letter-spacing:0}
    #bagp .bgf{margin-top:4px;line-height:2;text-shadow:1px 1px 0 #000,0 0 3px #000} #bagp .bgb{margin-left:2px} .bgghost{position:fixed;pointer-events:none;z-index:60;image-rendering:pixelated;filter:drop-shadow(2px 4px 0 #0008)}`; document.head.appendChild(css);
  const uz=()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--uiz'))||1;
  BAG.draw=()=>{ '@later'; if(pk.hidden)return; const ids=inBag(); if(sel&&!INV.items[sel])sel=null;
    const x=pk.querySelector(':scope>.pX'), tl=TILED?tiles(ids):null;
    pk.innerHTML=`<div class="bgo"><div class="bgk">${SVG}<div class="bgt">$${Math.round(INV.cash)} · ${ids.length} ${ids.length===1?'THING':'THINGS'}${INV.count()?' · GEMS ×'+INV.count():''}</div><div class="bgsw"><button class="bgview" type="button" title="pictures or a list">${LIST?'LIST':'ICONS'}</button>${LIST?'':`<button class="bgsort" type="button" title="how the pictures lie">${TILED?'TILED':'LOOSE'}</button>`}</div><div class="bgm${LIST?' list':''}">${LIST?ids.slice().sort((a,b)=>name(a).localeCompare(name(b))).map(row).join(''):ids.map(id=>{ const [x,y]=tl?tl.at(id):spot(id,ids); return icon(id,INV.items[id],x,y,tl?Math.min(IC,tl.c-2):IC); }).join('')}</div><button class="bggrip" type="button" title="drag to make the bag bigger or smaller"></button></div></div>${strip()}`; if(x)pk.appendChild(x); sized(); };
  const sized=()=>{ const o=pk.querySelector('.bgo'), k=pk.querySelector('.bgk'); if(!o||!k)return; pk.style.width=o.style.width=Math.round(BW*S)+'px'; o.style.height=Math.round(BH*S)+'px'; k.style.transform='scale('+S+')'; const x=pk.querySelector(':scope>.pX'); if(x){ x.style.right=Math.round(52*S)+'px'; x.style.top=Math.round(150*S)+'px'; } };
  BAG.toggle=on=>{ pk.hidden=on===undefined?!pk.hidden:!on; BAG.draw(); };
  Object.defineProperty(BAG,'open',{get:()=>!pk.hidden});
  const redraw=()=>FORAGE.draw();

  /* ---------- wearing, holding ---------- */
  BAG.wear=(id,slot)=>{ '@later'; if(!FORAGE.has(id))return say('YOU HAVE NO '+name(id)+'.','#c8a090'); slot=slot||(WIELD.LIST&&WIELD.LIST.includes(id)?'hand':prop(id,'slot'));
    if(slot==='hand'){ if(!(WIELD.LIST&&WIELD.LIST.includes(id)))return say("YOU CAN'T HOLD THAT.",'#c8a090'); if(WIELD.on!==id){ WIELD.set(id); say('YOU HOLD THE '+name(id)+'.','#e8e2cc'); } }
    else { const s=prop(id,'slot'); if(!s||s==='none')return say("YOU CAN'T WEAR THAT.",'#c8a090'); if(s==='hand')return BAG.wear(id,'hand'); if(s!==slot)return say('THAT GOES ON YOUR '+s.toUpperCase()+'.','#c8a090'); if(EQUIP.by[s]!==id)EQUIP.wear(id); }
    redraw(); };
  BAG.off=slot=>{ '@later'; if(slot==='hand'){ if(WIELD.on){ WIELD.set(null); say('YOUR HANDS ARE FREE.','#e8e2cc'); } } else if(EQUIP.by[slot])EQUIP.wear(EQUIP.by[slot]); redraw(); };

  /* ---------- the ground: loose things at your feet ---------- */
  const GRD=[]; BAG.ground=GRD; const MAXG=30; let loaded=false;
  const saveG=()=>{ try{ OWNED.set('ground',JSON.stringify(GRD.map(g=>({id:g.id,n:g.n,x:+g.x.toFixed(2),y:+g.y.toFixed(2),z:+g.z.toFixed(2),lv:g.lv,t:g.t})))); }catch(e){} };
  const TEX=new Map(); const tex=id=>{ let t=TEX.get(id); if(!t){ t=new THREE.CanvasTexture(paint(id)); t.magFilter=t.minFilter=THREE.NearestFilter; t.generateMipmaps=false; t.colorSpace=THREE.SRGBColorSpace; TEX.set(id,t); } return t; };
  const unthing=th=>{ const i=UI.things.indexOf(th); if(i>=0)UI.things.splice(i,1); };
  const place=g=>{ '@later'; const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex(g.id),transparent:true,depthWrite:false})); sp.name='loose-'+g.id; sp.scale.set(.42*T,.42*T,1); sp.position.set(g.x,g.y+.24*T,g.z); sp.userData.level=g.lv||'street'; sp.renderOrder=1; scene.add(sp); g.sp=sp;
    g.th={name:'A LOOSE '+name(g.id)+(g.n>1?' ×'+g.n:''),pick:true,obj:sp,reach:.9*T,near:1.6*T,tall:.35*T,act:()=>BAG.pickUp(g)}; UI.thing(g.th); };
  const lose=g=>{ const i=GRD.indexOf(g); if(i>=0)GRD.splice(i,1); if(g.th)unthing(g.th); if(g.sp){ g.sp.removeFromParent(); g.sp.material.dispose(); } };
  BAG.pickUp=g=>{ '@later'; if(!GRD.includes(g))return; FORAGE.give(g.id,g.n); say('YOU PICK UP THE '+name(g.id)+(g.n>1?' ×'+g.n:'')+'.','#f2c14e'); SFX.play('clunk',{vol:.4,pitch:1.6}); lose(g); saveG(); redraw(); };
  BAG.drop=(id,n=1,at)=>{ '@later'; n=Math.min(n,FORAGE.has(id)); if(n<1)return false;
    if(VIT.dead)return say('A GHOST HOLDS NOTHING.','#c8a090'),false; if(ROOMS.cur)return say('NOT IN HERE. DROP IT OUTSIDE.','#c8a090'),false; if(st.water&&st.water.in)return say('NOT IN THE WATER.','#c8a090'),false;
    for(const s in EQUIP.by)if(EQUIP.by[s]===id&&FORAGE.has(id)<=n)EQUIP.wear(id,true); if(WIELD.on===id&&FORAGE.has(id)<=n)WIELD.set(null);
    FORAGE.take(id,n); const h=SHARED.heading||0, a=(Math.random()-.5)*.6, p=at||{x:pos.x+Math.sin(h+a)*.6*T,z:pos.z+Math.cos(h+a)*.6*T};
    const g={id,n,x:p.x,y:SHARED.py,z:p.z,lv:LEVELS.cur||'street',t:Date.now()}; GRD.push(g); place(g); while(GRD.length>MAXG)lose(GRD[0]);
    say('YOU DROP THE '+name(id)+(n>1?' ×'+n:'')+'.','#e8e2cc'); SFX.play('clunk',{vol:.35}); saveG(); if(sel===id&&!FORAGE.has(id))sel=null; redraw(); return true; };
  const restore=()=>{ loaded=true; let L=[]; try{ L=JSON.parse(OWNED.get('ground')||'[]')||[]; }catch(e){ L=[]; } for(const o of L)if(o&&o.id&&o.n>0&&GRD.length<MAXG){ const g={id:o.id,n:o.n,x:+o.x,y:+o.y,z:+o.z,lv:o.lv||'street',t:o.t||0}; GRD.push(g); place(g); } };
  SYS.add('life',()=>{ if(!loaded&&window.__started)restore(); },'162e-bag');

  /* ---------- dragging a picture: about the mouth, onto the quick bar, out onto the ground ---------- */
  const cv=renderer.domElement, ray=new THREE.Raycaster(), PL=new THREE.Plane(new THREE.Vector3(0,1,0),0), hit=new THREE.Vector3();
  const groundAt=(cx,cy)=>{ const r=cv.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height*2-1)),SHARED.cam); PL.constant=-SHARED.py; if(ray.ray.intersectPlane(PL,hit)&&Math.hypot(hit.x-pos.x,hit.z-pos.z)<2.2*T)return {x:hit.x,z:hit.z}; return null; };
  let drag=null, lastTap={id:null,t:0};
  const endDrag=()=>{ if(!drag)return; if(drag.ghost)drag.ghost.remove(); drag.el.classList.remove('held'); drag=null; };
  pk.addEventListener('pointerdown',e=>{ const el=e.target.closest('.bgi,.bgr'); if(!el||e.button)return; e.preventDefault(); e.stopPropagation(); const r=el.getBoundingClientRect(), g=el.classList.contains('bgr')?IC*uz()*S:r.width; drag={id:el.dataset.id,el,sx:e.clientX,sy:e.clientY,ox:el.classList.contains('bgr')?g/2:e.clientX-r.left,oy:el.classList.contains('bgr')?g/2:e.clientY-r.top,w:g,h:el.classList.contains('bgr')?g:r.height,moved:false,ghost:null}; try{ el.setPointerCapture(e.pointerId); }catch(x){} });
  pk.addEventListener('pointermove',e=>{ '@later'; if(!drag)return; if(!drag.moved){ if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<4)return; drag.moved=true; drag.el.classList.add('held'); const g=document.createElement('img'); g.className='bgghost'; g.src=BAG.icon(drag.id); g.style.width=drag.w+'px'; g.style.height=drag.h+'px'; document.body.appendChild(g); drag.ghost=g; }
    drag.ghost.style.left=(e.clientX-drag.ox)+'px'; drag.ghost.style.top=(e.clientY-drag.oy)+'px'; });
  pk.addEventListener('pointerup',e=>{ '@later'; if(!drag)return; const D=drag; endDrag(); const id=D.id;
    if(!D.moved){ const now=performance.now(); if(lastTap.id===id&&now-lastTap.t<400){ lastTap={id:null,t:0}; if(HUD.useItem)HUD.useItem(id); } else { lastTap={id,t:now}; sel=id; } redraw(); return; }
    const u=document.elementFromPoint(e.clientX,e.clientY); if(!u||!FORAGE.has(id))return;
    const m=u.closest('.bgm'); if(m&&LIST){ sel=id; redraw(); return; }   // the list keeps its own order
    if(m){ const r=m.getBoundingClientRect(), z=uz()*S, x=(e.clientX-r.left-D.ox)/z, y=(e.clientY-r.top-D.oy)/z;
      if(TILED){ const tl=tiles(inBag()), k=Math.max(0,Math.min(ORDER.length-1,Math.floor((y+tl.c/2)/tl.c)*tl.cols+Math.floor((x+tl.c/2)/tl.c))); ORDER.splice(ORDER.indexOf(id),1); ORDER.splice(k,0,id); saveSet(); }
      else { POS[id]=[Math.round(Math.max(0,Math.min(MW-IC,x))),Math.round(Math.max(0,Math.min(MH-IC,y)))]; savePos(); } sel=id; redraw(); return; }
    const q=u.closest('#hqb .qs'); if(q){ HUD.set(+q.dataset.i,id); return; }
    if(u===cv||u.closest('#stage')){ BAG.drop(id,1,groundAt(e.clientX,e.clientY)); return; }
    redraw(); });
  pk.addEventListener('pointercancel',endDrag);
  // the corner: drag it and the whole bag grows or shrinks (half to three times)
  let grip=null; pk.addEventListener('pointerdown',e=>{ const g=e.target.closest('.bggrip'); if(!g||e.button)return; e.preventDefault(); e.stopPropagation(); const r=pk.getBoundingClientRect(); grip={x0:r.left,y0:r.top,z:uz()}; try{ g.setPointerCapture(e.pointerId); }catch(x){} },true);
  pk.addEventListener('pointermove',e=>{ if(!grip)return; S=Math.max(.5,Math.min(3,Math.max((e.clientX-grip.x0)/grip.z/BW,(e.clientY-grip.y0)/grip.z/BH))); sized(); });
  const gripUp=()=>{ if(!grip)return; grip=null; saveSet(); }; pk.addEventListener('pointerup',gripUp); pk.addEventListener('pointercancel',gripUp); pk.addEventListener('lostpointercapture',gripUp);
  BAG.size=v=>{ if(v!=null){ S=Math.max(.5,Math.min(3,+v||1)); saveSet(); BAG.draw(); } return S; };
  BAG.tiled=v=>{ if(v!=null){ TILED=!!v; saveSet(); BAG.draw(); } return TILED; };
  BAG.list=v=>{ if(v!=null){ LIST=!!v; saveSet(); BAG.draw(); } return LIST; };
  pk.addEventListener('click',e=>{ '@later'; const b=e.target.closest('button'); if(!b||b.classList.contains('pX'))return; const d=b.dataset;
    if(b.classList.contains('bgsort')){ BAG.tiled(!TILED); return; } if(b.classList.contains('bgview')){ BAG.list(!LIST); return; } if(b.classList.contains('bggrip'))return;
    if(d.bagdrop)BAG.drop(d.bagdrop,d.n==='all'?FORAGE.has(d.bagdrop):1); else if(d.eat)FORAGE.eat(d.eat); else if(d.id)FORAGE.ident(d.id); else if(d.hold){ if(WIELD.on===d.hold)BAG.off('hand'); else BAG.wear(d.hold,'hand'); } else if(d.act&&FORAGE.ACT[d.act])FORAGE.ACT[d.act](d.aid);
    redraw(); });
  BAG.sel=()=>sel; BAG.select=id=>{ sel=id; redraw(); };
  window.BAGDBG=()=>({open:!pk.hidden,sel,size:S,tiled:TILED,list:LIST,order:[...ORDER],pos:{...POS},ground:GRD.map(g=>({id:g.id,n:g.n,x:+g.x.toFixed(1),z:+g.z.toFixed(1),lv:g.lv,d:+(Math.hypot(g.x-pos.x,g.z-pos.z)/T).toFixed(2),drawn:!!(g.sp&&g.sp.parent),thing:UI.things.includes(g.th),pick:!!(g.th&&g.th.pick)})),loose:UI.things.filter(t=>t.name.startsWith('A LOOSE ')).map(t=>t.name),inBag:inBag(),worn:{...EQUIP.by,hand:WIELD.on}}); }
