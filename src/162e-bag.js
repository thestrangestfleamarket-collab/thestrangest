// THE BAG: BAG is your inventory (I): INVENTORY > BAG in the menu; it holds a list of your things, each with its picture, in the order you drag them to; dragged out of the bag a thing drops at your feet, onto another player it starts a trade, onto a shopkeeper it opens the shop; a pixel picture for every item family (the item model's PICTURE); what you wear (EQUIP) or hold (WIELD) stays in it, tagged. Containers (the item model's HOLDS THINGS: a pouch, a chest) open as bags of their own and carry what is in them. Things dragged out onto the ground (or off the quick bar onto the world) are loose things everyone in the section sees (the Block keeps them, each 60 to 120 minutes), in their own 3D look near you, picked up by a double click; a stack asks how many.
import {SHARED, THREE} from './003-shx.js';
import {ARCHI, BAG, CHARS, DOLL, EQUIP, FORAGE, HUD, INSPECT, INV, ITEMS, LEVELS, ONLINE, pos, ROOMS, SFX, SHOPS, st, TALK, TEXT, UI, VIT, WE, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer, scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
import {GEMS} from './101-gems.js';
import {PFI} from './150cyb-pfitems.js';
import {SWAP} from './159i-trade.js';
window.BAG=BAG;
{ const T=TILE, esc=TEXT.esc, say=SAY, kindOf=id=>String(id).split('~')[0], prop=(id,k)=>ITEMS.prop(kindOf(id),k), name=id=>FORAGE.name(kindOf(id));
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
  const KIND=[[/^(m_|u_)|shroom$|^glowcap$/,'mush'],[/^p_|^bottle$|^soda_|^slime_/,'potion'],[/^f_/,'dish'],[/^x_/,'fish'],[/^(fr_|nut_)/,'fruit'],[/^bu?_\d/,'bfly'],[/^(bd_|pet_)|^bird/,'bird'],[/^(bk_|br_)|book|^bs_/,'book'],[/^(jar_|honey_)/,'jar'],[/seed/,'seed'],[/^sword|blade|putter|axe/,'sword'],[/^b?net$/,'net'],[/^rod|reel|lure|bait|crabpot/,'rod'],[/goggles|shades|binoc/,'goggles'],[/headlight|lamp|lantern/,'lamp'],[/^armor$/,'armour'],[/coat|jacket/,'coat'],[/jeans|pants/,'jeans'],[/scuba|tank/,'tank'],[/board/,'board'],[/^cage|feeder/,'cage'],[/cigar/,'cigar'],[/phone|modem|pc_|radio|scanner|tv_/,'gadget'],[/cube|dice/,'cube'],[/kite|balloon/,'kite'],[/passport|ticket/,'card'],[/^cut_|gem|meteor/,'gem'],[/mortar/,'mortar'],[/spray|cutter|extractor|smoker/,'tool'],[/chest|cooler|kart|skate/,'crate'],[/pouch|sack|bag/,'sack']];
  const hex=v=>'#'+(v>>>0).toString(16).padStart(6,'0').slice(-6), shade=c=>{ if(c[0]==='#'&&c.length===7){ const n=parseInt(c.slice(1),16); return hex(((n>>16)*.62<<16)|(((n>>8&255)*.62)<<8)|((n&255)*.62)); } const m=/hsl\((\d+),(\d+)%,(\d+)%\)/.exec(c); return m?`hsl(${m[1]},${m[2]}%,${Math.round(m[3]*.62)}%)`:c; };
  const hue=id=>{ let h=0; for(let i=0;i<id.length;i++)h=(h*31+id.charCodeAt(i))%360; return `hsl(${h},52%,56%)`; };
  BAG.kind=id0=>{ const id=kindOf(id0), p=prop(id,'icon'); if(p&&p!=='auto'&&ART[p])return p; if(GEMS.some(g=>g[0]===id&&!id.startsWith('m_')))return 'gem'; for(const [re,k] of KIND)if(re.test(id))return k; return 'sack'; };
  const colour=(id,k)=>{ const c=prop(id,'color'); if(c&&c!=='none')return c; if(k==='mush'){ const m=(FORAGE.MU||{})[id.slice(2)]; if(m&&m[5]!=null)return hex(m[5]); } if(id.startsWith('cut_')){ const q=prop(id.slice(4),'color'); if(q&&q!=='none')return q; } if(id==='bottle')return '#a8adb8'; if(k==='fish'||k==='sack'||k==='crate'||k==='mortar'||k==='net'||k==='rod'||k==='lamp'||k==='armour')return MAIN[k]||'#a8adb8'; return MAIN[k]&&!/^(coat|gadget|cube|kite|card|bfly|bird|book|jar|potion|fruit|dish|board)$/.test(k)?MAIN[k]:hue(id); };
  // each item's own 16-pixel picture (data/icons.json, tools/icons.py; owner, 7 Nov 2026: "go with A"); the family pictures above until it has loaded, and for anything it lacks
  let SH=null; try{ SH=__DATA__("data/icons.json"); }catch(e){} const SI=new Map(SH?SH.ids.map((id,i)=>[id,i]):[]); let SIMG=null;
  const CV=new Map(); const paint=id0=>{ const id=kindOf(id0); let c=CV.get(id); if(c)return c;
    if(SIMG&&SI.has(id)){ const i=SI.get(id), n=SH.s; c=document.createElement('canvas'); c.width=c.height=n; c.getContext('2d').drawImage(SIMG,(i%SH.cols)*n,Math.floor(i/SH.cols)*n,n,n,0,0,n,n); CV.set(id,c); return c; }
    const k=BAG.kind(id), A=colour(id,k), a=shade(A), B=k==='fruit'?'#3f8a3a':k==='cube'?'#f4efe4':a;
    c=document.createElement('canvas'); c.width=c.height=10; const g=c.getContext('2d'); ART[k].forEach((row,y)=>{ for(let x=0;x<10;x++){ const ch=row[x]; if(!ch||ch==='.')continue; g.fillStyle=ch==='A'?A:ch==='a'?a:ch==='B'?B:PAL[ch]||'#f0f'; g.fillRect(x,y,1,1); } }); CV.set(id,c); return c; };
  BAG.pic=paint;
  // a thing's picture everywhere (the bag, the quick bar, the vault; owner, 8 Nov 2026: "lets use the 3d models in inventory too and quickslot, etc. no more icons to represent anything"): its own 3D model (INSPECT.model) photographed in a little studio, turned three-quarters; a few a frame, blank until its turn, every list redrawn as they come
  const URL=new Map(), WANT=new Set(), BLANK='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', TS=96; let TR=null, TC=null, TSC=null, TCV=null, TPX=null, again=0;
  BAG.icon=id0=>{ const id=kindOf(id0), u=URL.get(id); if(u)return u; WANT.add(id); return BLANK; };
  const shoot=id=>{ '@later'; if(!TR){ TR=new THREE.WebGLRenderTarget(TS,TS); TR.texture.colorSpace=THREE.SRGBColorSpace; TC=new THREE.OrthographicCamera(-1,1,1,-1,.01,100); TSC=new THREE.Scene(); const k=new THREE.DirectionalLight(0xffffff,2.2); k.position.set(-2,4,3); TSC.add(new THREE.AmbientLight(0xffffff,1.1),new THREE.HemisphereLight(0xdfe8ff,0x3a3020,.6),k); TCV=document.createElement('canvas'); TCV.width=TCV.height=TS; TPX=new Uint8Array(TS*TS*4); }
    let m=null; try{ m=INSPECT.model(id); }catch(e){} if(!m)return BLANK; TSC.add(m); m.updateMatrixWorld(true);
    const b=new THREE.Box3().setFromObject(m); if(b.isEmpty()){ TSC.remove(m); return BLANK; } const c=b.getCenter(new THREE.Vector3()), z=b.getSize(new THREE.Vector3()), r=Math.max(z.x,z.y,z.z)*.6||1;
    TC.left=TC.bottom=-r; TC.right=TC.top=r; TC.far=r*12; TC.updateProjectionMatrix(); TC.position.set(c.x+Math.sin(.7)*r*5,c.y+r*2.6,c.z+Math.cos(.7)*r*5); TC.lookAt(c); TC.updateMatrixWorld(true);
    const rt=renderer.getRenderTarget(), cc=new THREE.Color(), ca=renderer.getClearAlpha(); renderer.getClearColor(cc); renderer.setRenderTarget(TR); renderer.setClearColor(0,0); renderer.clear(); renderer.render(TSC,TC);
    renderer.readRenderTargetPixels(TR,0,0,TS,TS,TPX); renderer.setRenderTarget(rt); renderer.setClearColor(cc,ca); TSC.remove(m);
    const im=TCV.getContext('2d').createImageData(TS,TS); for(let y=0;y<TS;y++)im.data.set(TPX.subarray((TS-1-y)*TS*4,(TS-y)*TS*4),y*TS*4); TCV.getContext('2d').putImageData(im,0,0); return TCV.toDataURL(); };
  SYS.add('win',()=>{ if(!WANT.size)return; let k=0; for(const id of WANT){ WANT.delete(id); try{ URL.set(id,shoot(id)); }catch(e){ URL.set(id,BLANK); console.warn('BAG picture',id,e); } if(++k>=3)break; } again=1; },'162e-bag pictures');
  SYS.every(()=>{ if(!again||WANT.size)return; again=0; try{ redraw(); }catch(e){} if(HUD.qdraw)HUD.qdraw(); },300,'162e-bag pictures redraw');
  BAG.look=id=>{ '@later'; const P=look(id).clone(); return P; };   // a thing at its real size, its foot at 0 (the shop's shelves)
  if(HUD.qdraw)HUD.qdraw();
  if(SH){ const im=new Image(); im.onload=()=>{ SIMG=im; CV.clear(); URL.clear(); if(HUD.qdraw)HUD.qdraw(); if(SYS.started&&BAG.draw)try{ BAG.draw(); }catch(e){} }; im.src=SH.png; }

  /* ---------- containers: a pouch or a chest is one thing each (pouch~3), holding things of its own ---------- */
  FORAGE.add({names:{pouch:'LEATHER POUCH',chest:'WOODEN CHEST'},prices:{pouch:12,chest:60}}); ITEMS.reg('pouch',{container:true,holds:12,sellable:true}); ITEMS.reg('chest',{container:true,holds:40,sellable:true});
  FORAGE.SELLS.push(['pouch',12,()=>true],['chest',60,()=>true]);
  INV.inside=INV.inside||{}; const isCont=id=>!!prop(id,'container');
  const def=id=>{ const k=kindOf(id); if(!ITEMS.defs[id]&&ITEMS.defs[k])ITEMS.defs[id]=ITEMS.defs[k]; if(FORAGE.NM&&!FORAGE.NM[id]&&FORAGE.NM[k])FORAGE.NM[id]=FORAGE.NM[k]; };
  const fresh=k=>{ INV.inst=(INV.inst||0)+1; const id=k+'~'+INV.inst; def(id); return id; };
  const instances=()=>{ let ch=false; for(const id of Object.keys(INV.items)){ if(!id.includes('~')&&isCont(id)&&INV.items[id]>0){ const n=INV.items[id]; delete INV.items[id]; for(let i=0;i<n;i++)INV.items[fresh(id)]=1; ch=true; } else if(id.includes('~'))def(id); }
    for(const c in INV.inside){ if(!INV.items[c]){ delete INV.inside[c]; ch=true; continue; } for(const id in INV.inside[c]){ const n=Math.min(INV.inside[c][id],INV.items[id]||0); if(n<=0){ delete INV.inside[c][id]; ch=true; } else if(n!==INV.inside[c][id]){ INV.inside[c][id]=n; ch=true; } } } if(ch&&INV.save)INV.save(); };
  const held=id=>{ let n=0; for(const c in INV.inside)n+=INV.inside[c][id]||0; return n; };
  const have=(id,where='bag')=>where==='bag'?(INV.items[id]||0)-held(id):(INV.inside[where]||{})[id]||0;
  const contents=where=>(where==='bag'?Object.keys(INV.items).filter(id=>have(id,'bag')>0):Object.keys(INV.inside[where]||{}).filter(id=>have(id,where)>0)).filter(id=>!ARCHI(id)).sort();
  const holdsOf=c=>+prop(c,'holds')||12, within=(c,x)=>{ if(c===x)return true; for(const id in INV.inside[c]||{})if(isCont(id)&&within(id,x))return true; return false; };
  BAG.move=(id,n,from,to)=>{ '@later'; n=Math.min(n,have(id,from)); if(n<1||from===to)return false;
    if(to!=='bag'){ if(!isCont(to)||!INV.items[to])return false; if(isCont(id)&&within(id,to))return say("IT WON'T GO INTO ITSELF.",'#c8a090'),false; const I=INV.inside[to]||(INV.inside[to]={}); if(!I[id]&&Object.keys(I).length>=holdsOf(to))return say('THE '+name(to)+' IS FULL.','#c8a090'),false; I[id]=(I[id]||0)+n; }
    if(from!=='bag'){ const I=INV.inside[from]||{}; I[id]=(I[id]||0)-n; if(I[id]<=0)delete I[id]; }
    if(INV.save)INV.save(); return true; };
  FORAGE.ROWB.push(id=>isCont(id)?[['OPEN','open']]:[]); FORAGE.ACT.open=id=>BAG.open(id);

  /* ---------- the windows: the bag, and one for each open container ---------- */
  const MW=280, MH=400, IC=44, BW=304, BH=446; let POS={}, ORD={}, SZ={}, TILED=false, LIST=true;
  try{ const p=JSON.parse(OWNED.get('bagpos')||'{}')||{}; POS=p&&p.bag&&typeof p.bag==='object'?p:{bag:p}; const o=JSON.parse(OWNED.get('bagorder')||'{}'); ORD=Array.isArray(o)?{bag:o}:o||{}; const z=OWNED.get('bagsize'); let s=null; try{ s=JSON.parse(z); }catch(e){ s=+z||null; } SZ=s&&typeof s==='object'?s:{bag:Math.max(.5,Math.min(3,+s||1))}; TILED=false; LIST=true; }catch(e){ POS={}; ORD={}; SZ={}; }
  const saveSet=()=>{ try{ OWNED.set('bagsize',JSON.stringify(SZ)); OWNED.set('bagorder',JSON.stringify(ORD)); }catch(e){} };
  const savePos=()=>{ try{ OWNED.set('bagpos',JSON.stringify(POS)); }catch(e){} };
  const sizeOf=key=>key==='bag'?1:.7;
  const cell=n=>Math.max(22,Math.min(IC+6,Math.floor(Math.sqrt(MW*MH/Math.max(1,n)))));
  const tiles=(key,ids)=>{ const c=cell(ids.length), cols=Math.max(1,Math.floor(MW/c)); let O=ORD[key]||(ORD[key]=[]); O=ORD[key]=O.filter(id=>ids.includes(id)); for(const id of ids)if(!O.includes(id))O.push(id); return {c,cols,at:id=>{ const i=O.indexOf(id); return [(i%cols)*c,Math.floor(i/cols)*c]; }}; };
  const listed=(key,ids)=>{ let O=ORD[key]||(ORD[key]=[]); O=ORD[key]=O.filter(id=>ids.includes(id)); for(const id of ids.filter(id=>!O.includes(id)).sort((a,b)=>name(a).localeCompare(name(b))))O.push(id); return O.slice(); };
  const spot=(key,id,ids)=>{ const P=POS[key]||(POS[key]={}); if(P[id])return P[id]; const used=ids.filter(q=>q!==id&&P[q]).map(q=>P[q]); for(let y=0;y+IC<=MH;y+=26)for(let x=0;x+IC<=MW;x+=28)if(!used.some(p=>Math.abs(p[0]-x)<34&&Math.abs(p[1]-y)<34))return P[id]=[x,y]; return P[id]=[Math.round(Math.random()*(MW-IC)),Math.round(Math.random()*(MH-IC))]; };
  let sel=null, selWin='bag';
  const wornAs=id=>WIELD.on===id?'HELD':Object.values(EQUIP.by).includes(id)?'WORN':'';
  const icon=(key,id,n,x,y,sz=IC)=>{ const w=wornAs(id); return `<div class="bgi${sel===id&&selWin===key?' sel':''}${isCont(id)?' cont':''}" data-id="${esc(id)}" title="${esc(name(id))}" style="left:${x}px;top:${y}px;width:${sz}px;height:${sz}px"><img alt="" draggable="false" src="${BAG.icon(id)}">${n>1?`<span>x${n}</span>`:''}${w?`<i>${w}</i>`:''}</div>`; };
  const row=(key,id,n)=>{ const w=wornAs(id); return `<div class="bgr${sel===id&&selWin===key?' sel':''}${isCont(id)?' cont':''}" data-id="${esc(id)}" title="${esc(name(id))}"><img alt="" draggable="false" src="${BAG.icon(id)}"><b style="${id.startsWith('u_')?'color:#c8b0ff':''}">${esc(name(id))}</b>${w?`<u>${w}</u>`:''}${n>1?`<i>x${n}</i>`:''}</div>`; };
  const strip=key=>`<div class="bgf">${contents(key).length?'DOUBLE CLICK TO USE · DRAG OUT TO DROP':key==='bag'?'NOTHING. FIND MUSHROOMS ON THE LAWNS: A DOUBLE CLICK PICKS ONE.':'EMPTY. DRAG THINGS IN FROM YOUR BAG.'}</div>`;
  const css=document.createElement('style'); css.textContent=`.bagw{position:fixed;z-index:21;resize:none!important;overflow:visible!important;padding:0;font-family:'Share Tech Mono',ui-monospace,monospace;font-size:13px;letter-spacing:.4px;color:#7dffa8;background:none;border:0;zoom:var(--uiz,1)} .bagw[hidden]{display:none} .bagw>.pX,.bagw .bgx{position:absolute;right:8px;top:6px}
    .bagw .bgx,.bagw>.pX{font:inherit;color:#7dffa8!important;background:#020a06!important;border:0!important;box-shadow:inset 0 0 0 1px #3aa866!important;padding:1px 6px;cursor:pointer} .bagw .bgx:hover,.bagw>.pX:hover{color:#020a06!important;background:#7dffa8!important} .bagw .bgo{position:relative} .bagw .bgk{position:absolute;left:0;top:0;width:${BW}px;height:${BH}px;transform-origin:0 0} .bagw .bgpan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(125,255,168,.05) 0 1px,transparent 1px 3px),rgba(2,10,6,.82);box-shadow:0 0 0 1px #2d5a40}
    .bagw .bgt{position:absolute;left:12px;right:44px;top:9px;color:#3aa866;font-size:12px;letter-spacing:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}
    .bagw .bgm{position:absolute;left:12px;top:32px;width:${MW}px;height:${MH}px} .bagw .bgi{position:absolute;width:${IC}px;height:${IC}px;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none} .bagw .bgi img{width:32px;height:32px;margin:6px;image-rendering:pixelated;display:block;pointer-events:none} .bagw .held{opacity:.3} .bagw .over{outline:1px dashed #7dffa8}
    .bagw .bgi span,.bagw .bgi i{position:absolute;font-size:9px;font-style:normal;pointer-events:none} .bagw .bgi span{right:-3px;bottom:-4px;color:#3aa866} .bagw .bgi i{left:-2px;top:-5px;color:#3aa866}
    .bagw .bgm.list{overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;gap:3px;padding:1px;box-sizing:border-box;scrollbar-color:#3aa866 #020a06;scrollbar-width:thin} .bagw .bgr{display:flex;align-items:center;gap:8px;flex:none;height:30px;padding:0 8px;background:repeating-linear-gradient(0deg,rgba(125,255,168,.05) 0 1px,transparent 1px 3px),rgba(2,10,6,.82);box-shadow:0 0 0 1px #2d5a40;text-shadow:0 0 5px #4aff9055;white-space:nowrap;cursor:grab;touch-action:pan-y;user-select:none;-webkit-user-select:none} .bagw .bgr:hover{background:#0d3a1f} .bagw .bgr img{width:16px;height:16px;image-rendering:pixelated;flex:none;pointer-events:none} .bagw .bgr b{font-weight:400;flex:1;overflow:hidden;text-overflow:ellipsis;color:#7dffa8} .bagw .bgr i{font-style:normal;color:#3aa866;font-size:11px} .bagw .bgr u{text-decoration:none;color:#3aa866;font-size:10px} .bagw .bgr.sel{box-shadow:0 0 0 1px #7dffa8,0 0 8px #4aff9066}
    .bagw .bgf{margin-top:6px;padding:3px 8px;line-height:1.7;color:#3aa866;font-size:11px;background:repeating-linear-gradient(0deg,rgba(125,255,168,.05) 0 1px,transparent 1px 3px),rgba(2,10,6,.82);box-shadow:0 0 0 1px #2d5a40;text-shadow:0 0 5px #4aff9055} .bagw .bgb{margin-left:2px} .bgghost{position:fixed;pointer-events:none;z-index:60;image-rendering:pixelated;filter:drop-shadow(2px 4px 0 #0008)}
    .bagw.inmenu{position:relative;zoom:1;width:auto!important} .bagw.inmenu>.pX,.bagw.inmenu .bgpan,.bagw.inmenu .bgt{display:none} .bagw.inmenu .bgo{width:auto!important;height:calc(92vh - 235px)!important;min-height:240px} .bagw.inmenu .bgr img{width:24px;height:24px} .bagw.inmenu .bgk{width:auto;height:auto;inset:0;transform:none!important} .bagw.inmenu .bgm{left:0;top:0;right:0;bottom:0;width:auto;height:auto} .bagw.inmenu .bgr{height:34px;font-size:16px} .bagw.inmenu .bgr:hover{background:#7dffa8;color:#020a06} .bagw.inmenu .bgr:hover b,.bagw.inmenu .bgr:hover i,.bagw.inmenu .bgr:hover u{color:#020a06} .bagw.inmenu .bgf{font-size:13px}
    .bagw[data-cont]{z-index:31} body.bagdrag #menu{pointer-events:none} body.bagdrag #menu .box{pointer-events:auto} body.bagout #menu{opacity:0} body.bagout #menu,body.bagout #menu *{pointer-events:none!important}
    #bagask{position:fixed;z-index:62;padding:8px 10px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #f2c14e;display:flex;gap:6px;align-items:center;zoom:var(--uiz,1)} #bagask[hidden]{display:none} #bagask input[type=number]{width:52px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 4px} #bagask input[type=range]{width:110px} #bagask button{font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer}`; document.head.appendChild(css);
  const uz=()=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--uiz'))||1;
  const WINS=new Map();
  const win=key=>{ let W=WINS.get(key); if(W)return W; const el=document.createElement('div'); el.className='bagw'; el.hidden=true; if(key==='bag')el.id='bagp'; else el.dataset.cont=key; el.style.cssText=key==='bag'?'right:24px;top:190px':'left:40px;top:220px'; document.body.appendChild(el); el.addEventListener('keydown',e=>e.stopPropagation()); el.addEventListener('keyup',e=>e.stopPropagation()); W={key,el}; WINS.set(key,W); bind(W); return W; };
  const winOf=el=>{ const w=el&&el.closest&&el.closest('.bagw'); return w?(w.id==='bagp'?'bag':w.dataset.cont):null; };
  const draw=W=>{ const {key,el}=W; if(el.hidden)return; instances(); if(key!=='bag'&&!INV.items[key]){ el.hidden=true; return; } const ids=contents(key), tl=TILED&&!LIST?tiles(key,ids):null, x=el.querySelector(':scope>.pX');
    const title=key==='bag'?'BAG':`${esc(name(key))} · ${ids.length} OF ${holdsOf(key)}`;
    const sc0=(el.querySelector('.bgm')||{}).scrollTop||0;   // the list keeps its place when it is drawn again, so a second click lands on the same thing (owner, 7 Nov 2026)
    el.innerHTML=`<div class="bgo"><div class="bgk"><div class="bgpan"></div><div class="bgt">${title}</div>${key==='bag'?'':'<button class="bgx" type="button" title="close">X</button>'}<div class="bgm${LIST?' list':''}">${LIST?listed(key,ids).map(id=>row(key,id,have(id,key))).join(''):ids.map(id=>{ const [x,y]=tl?tl.at(id):spot(key,id,ids); return icon(key,id,have(id,key),x,y,tl?Math.min(IC,tl.c-2):IC); }).join('')}</div></div></div>${strip(key)}`; if(x)el.appendChild(x); sized(W); if(sc0){ const m=el.querySelector('.bgm'); if(m)m.scrollTop=sc0; } };
  const sized=W=>{ const S=sizeOf(W.key), o=W.el.querySelector('.bgo'), k=W.el.querySelector('.bgk'); if(!o||!k)return; W.el.style.width=o.style.width=Math.round(BW*S)+'px'; o.style.height=Math.round(BH*S)+'px'; k.style.transform='scale('+S+')'; const x=W.el.querySelector(':scope>.pX'); if(x){ x.style.right=Math.round(8*S)+'px'; x.style.top=Math.round(6*S)+'px'; } };
  BAG.draw=()=>{ for(const W of WINS.values())if(!W.el.hidden)draw(W); };   // a shut window waits: its drawing is later code
  const pk=win('bag').el;
  // the bag is INVENTORY > BAG in the menu (owner, 10 Nov 2026): I, the quick bar's BAG and the menu open it there; the menu mounts it (BAG.into) and lets it go (BAG.out)
  const inMenu=()=>!!(UI.menuOpen&&pk.classList.contains('inmenu')&&!pk.hidden); BAG.inMenu=inMenu;
  BAG.into=host=>{ if(pk.parentNode!==host)host.appendChild(pk); pk.classList.add('inmenu'); pk.hidden=false; BAG.draw(); };
  BAG.out=()=>{ if(!pk.classList.contains('inmenu'))return; endDrag(); pk.classList.remove('inmenu'); pk.hidden=true; document.body.appendChild(pk); };
  BAG.toggle=on=>{ const want=on===undefined?!inMenu():!!on; if(want){ if(!inMenu())UI.menuTab('pack','bag'); } else if(inMenu())UI.toggleMenu(); };
  Object.defineProperty(BAG,'open_',{get:()=>!pk.hidden});
  BAG.open=id=>{ '@later'; if(!isCont(id)||!INV.items[id])return say("THAT DOESN'T OPEN.",'#c8a090'); const W=win(id); if(!W.el.hidden){ W.el.hidden=true; return; } const r=pk.getBoundingClientRect(), z=uz(); W.el.style.left=Math.max(8,Math.round(r.left/z-BW*sizeOf(id)-20))+'px'; W.el.style.top=Math.round(r.top/z+40)+'px'; W.el.hidden=false; draw(W); };
  BAG.close=id=>{ const W=WINS.get(id); if(W)W.el.hidden=true; };
  const redraw=()=>FORAGE.draw();

  /* ---------- how many of a stack ---------- */
  let ask=null; const AK=document.createElement('div'); AK.id='bagask'; AK.hidden=true; AK.innerHTML='<span>HOW MANY?</span><input type="range" min="1" max="1" value="1"><input type="number" min="1" max="1" value="1"><button type="button" class="ak-go">MOVE</button><button type="button" class="ak-all">ALL</button><button type="button" class="ak-x">X</button>'; document.body.appendChild(AK);
  const AR=AK.querySelector('[type=range]'), AN=AK.querySelector('[type=number]'); AR.oninput=()=>AN.value=AR.value; AN.oninput=()=>{ AR.value=Math.max(1,Math.min(+AR.max,+AN.value||1)); }; AK.addEventListener('keydown',e=>{ e.stopPropagation(); if(e.key==='Enter')done(+AN.value); if(e.key==='Escape')done(null); });
  const done=v=>{ AK.hidden=true; const a=ask; ask=null; if(a)a(v==null?null:Math.max(1,Math.min(+AR.max,Math.round(v)||1))); };
  AK.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; if(b.classList.contains('ak-go'))done(+AN.value); else if(b.classList.contains('ak-all'))done(+AR.max); else done(null); });
  BAG.ask=(n,x,y)=>new Promise(res=>{ if(n<=1)return res(1); if(ask)done(null); ask=res; AR.max=AN.max=n; AR.value=AN.value=n; const z=uz(); AK.style.left=Math.max(4,Math.min(innerWidth/z-300,(x||innerWidth/2)/z-100))+'px'; AK.style.top=Math.max(4,(y||innerHeight/2)/z-50)+'px'; AK.hidden=false; AN.focus(); AN.select(); });

  /* ---------- wearing, holding ---------- */
  BAG.wear=(id,slot)=>{ '@later'; if(!FORAGE.has(id))return say('YOU HAVE NO '+name(id)+'.','#c8a090'); slot=slot||(WIELD.LIST&&WIELD.LIST.includes(id)?'hand':prop(id,'slot'));
    if(slot==='hand'){ if(!(WIELD.LIST&&WIELD.LIST.includes(id)))return say("YOU CAN'T HOLD THAT.",'#c8a090'); if(WIELD.on!==id){ WIELD.set(id); say('YOU HOLD THE '+name(id)+'.','#e8e2cc'); } }
    else { const s=EQUIP.fits(id,slot)?slot:EQUIP.slotOf(id); if(!s)return WIELD.LIST&&WIELD.LIST.includes(id)?BAG.wear(id,'hand'):say("YOU CAN'T WEAR THAT.",'#c8a090'); if(s!==slot)return say('THAT GOES ON YOUR '+s.toUpperCase()+'.','#c8a090'); if(EQUIP.by[s]!==id)EQUIP.wear(id); }
    redraw(); };
  BAG.off=slot=>{ if(slot==='hand'){ if(WIELD.on){ WIELD.set(null); say('YOUR HANDS ARE FREE.','#e8e2cc'); } } else if(EQUIP.by[slot])EQUIP.wear(EQUIP.by[slot]); redraw(); };

  /* ---------- the ground: loose things, shared through the section's room when you are online, each gone 60 to 120 minutes after it was dropped ---------- */
  const GRD=[]; BAG.ground=GRD; const MAXG=30, LIFE=()=>(60+Math.random()*60)*6e4, SEE=20*T, KEEP=26*T, MOST=24; let loaded=false;
  const online=()=>!!(ONLINE.on&&ONLINE.me), uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  const saveG=()=>{ try{ OWNED.set('ground',JSON.stringify(GRD.filter(g=>!g.key.startsWith('drop:')).map(g=>({key:g.key,id:g.id,n:g.n,x:+g.x.toFixed(2),y:+g.y.toFixed(2),z:+g.z.toFixed(2),lv:g.lv,t:g.t,until:g.until,rm:g.rm,in:g.in,subs:g.subs})))); }catch(e){} };
  const rec=g=>{ const r={id:g.id,n:g.n,x:+g.x.toFixed(2),y:+g.y.toFixed(2),z:+g.z.toFixed(2),lv:g.lv,t:g.t}; if(g.rm)r.rm=g.rm; if(g.in)r.in=g.in; if(g.subs)r.subs=g.subs; return JSON.stringify(r); };
  // a thing's look on the ground (owner, 8 Nov 2026: "they should have their own icons and be realistic relative size"): its own model (INSPECT.model) at its real size (ITEMS size: its longest side in metres, else the model's own metres), its glass made plain; a thing with no model stands as its own picture at its real size; made once a kind and copied
  const LOOK=new Map(), PLAIN=new Map(), V3=new THREE.Vector3(), MTR=T/.84;
  const plain=q=>{ let r=PLAIN.get(q); if(!r){ r=new THREE.MeshStandardMaterial({color:q.color,roughness:.15,transparent:true,opacity:.5,depthWrite:false}); PLAIN.set(q,r); } return r; };
  const realM=id=>{ const s=+prop(kindOf(id),'size'); return s>0?s:0; };
  const look=id=>{ '@later'; let P=LOOK.get(id); if(P)return P; P=new THREE.Group();
    if(!INSPECT.has(id)){ const tex=new THREE.CanvasTexture(paint(id)); tex.magFilter=tex.minFilter=THREE.NearestFilter; tex.colorSpace=THREE.SRGBColorSpace; tex.generateMipmaps=false;
      const c=paint(id), W=c.width, H=c.height, D=c.getContext('2d').getImageData(0,0,W,H).data; let x0=W, x1=-1, y1=-1;   // (the drawn part of the picture, not its empty edge, is the thing's size; it stands on its lowest drawn row)
      for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(D[(y*W+x)*4+3]>127){ if(x<x0)x0=x; if(x>x1)x1=x; if(y>y1)y1=y; } let y0=H; for(let y=0;y<H&&y0===H;y++)for(let x=0;x<W;x++)if(D[(y*W+x)*4+3]>127){ y0=y; break; }
      const ext=x1<0?W:Math.max(x1-x0+1,y1-y0+1), h=(realM(id)||.3)*MTR*W/ext, sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,alphaTest:.5})); sp.scale.set(h,h,1); sp.position.y=h/2-(x1<0?0:(H-1-y1)/H*h); P.add(sp); P.userData.tall=x1<0?h:(y1-y0+1)/H*h; LOOK.set(id,P); return P; }
    let m=null; try{ m=INSPECT.model(id); }catch(e){} if(!m)m=INSPECT.shape('sack');
    m.traverse(c=>{ if(c.material&&!Array.isArray(c.material)&&c.material.transmission>0)c.material=plain(c.material); });
    { const b0=new THREE.Box3().setFromObject(m), z=b0.getSize(V3); if(!b0.isEmpty()&&!m.userData.pf&&z.y>1.8*Math.max(z.x,z.z)&&!/^(fl_|bnet$|net$|balloon$)/.test(kindOf(id))){ const W=new THREE.Group(); W.add(m); W.rotation.x=-Math.PI/2; m=W; } }   // (a long thin thing, a sword, lies on its side; a flower or a net on its stand stays up, and Polyfork's stand as made)
    const b=new THREE.Box3().setFromObject(m), L=b.isEmpty()?1:Math.max(.001,...b.getSize(V3).toArray()), want=realM(id), S=b.isEmpty()?MTR:want?want*MTR/L:L>5||L<.01?.3*MTR/L:MTR, I=new THREE.Group(); I.add(m); I.scale.setScalar(S); if(!b.isEmpty())I.position.set(-(b.min.x+b.max.x)/2*S,-b.min.y*S,-(b.min.z+b.max.z)/2*S);
    P.add(I); P.userData.tall=b.isEmpty()?.3*MTR:(b.max.y-b.min.y)*S; LOOK.set(id,P); return P; };
  PFI.on.push(()=>{ LOOK.clear(); for(const g of GRD)if(g.m){ g.m.removeFromParent(); g.m=null; } near(); for(const id of URL.keys())WANT.add(id); URL.clear(); });   // Polyfork's models came: what lies about takes them
  const room=()=>{ const c=ROOMS.cur; return c?String(c.off||c.id||''):''; };
  const unthing=th=>{ const i=UI.things.indexOf(th); if(i>=0)UI.things.splice(i,1); };
  const place=g=>{ '@later'; const sp=new THREE.Group(); sp.name='loose-'+g.id; sp.position.set(g.x,g.y,g.z); sp.rotation.y=(parseInt(g.key.slice(-4),36)||0)%628/100; sp.userData.level=g.lv||'street'; sp.visible=false; scene.add(sp); g.sp=sp;
    const full=g.in&&Object.keys(g.in).length; g.th={name:'A LOOSE '+name(g.id)+(g.n>1?' ×'+g.n:'')+(full?' (THINGS INSIDE)':''),pick:true,obj:sp,reach:.9*T,near:1.6*T,tall:Math.max(.2*T,Math.min(2*T,look(g.id).userData.tall||.35*T)),act:()=>BAG.pickUp(g)}; UI.thing(g.th); GRD.push(g); near(); };
  const lose=g=>{ const i=GRD.indexOf(g); if(i>=0)GRD.splice(i,1); if(g.th)unthing(g.th); if(g.sp)g.sp.removeFromParent(); g.m=null; };
  // drawn only near you: the nearest 24 within 20 tiles on your level and in your room, kept until 26
  const near=()=>{ const rm=room(), now=Date.now(); let ex=false; for(const g of GRD.slice())if(g.until&&now>g.until&&!g.taking){ lose(g); ex=ex||!g.key.startsWith('drop:'); } if(ex)saveG();
    const L=[]; for(const g of GRD){ const d=Math.hypot(g.x-pos.x,g.z-pos.z); if((g.rm||'')===rm&&d<(g.m?KEEP:SEE)&&LEVELS.drawn(g.sp))L.push([g,d]); } const on=new Set(L.sort((a,b)=>a[1]-b[1]).slice(0,MOST).map(q=>q[0]));
    for(const g of GRD){ const v=on.has(g); if(v&&!g.m){ g.m=look(g.id).clone(); g.sp.add(g.m); } else if(!v&&g.m){ g.m.removeFromParent(); g.m=null; } g.sp.visible=v; } };
  // a container leaves with what is in it (and what is in those), as a record; back in a bag it is a fresh one of its kind
  const pack=c=>{ const I=INV.inside[c]||{}, out={in:{},subs:{}}; for(const id in I){ const n=I[id]; if(n<1)continue; if(isCont(id)){ const k=kindOf(id)+'#'+id; out.subs[k]=pack(id); out.in[k]=1; delete INV.items[id]; } else { FORAGE.take(id,n); out.in[id]=n; } } delete INV.inside[c]; return out; };
  const unpack=(k,r)=>{ const inst=fresh(kindOf(k)); INV.items[inst]=1; INV.inside[inst]={}; for(const id in r.in||{}){ const n=r.in[id]; if(id.includes('#')){ const sub=unpack(id,(r.subs||{})[id]||{}); INV.inside[inst][sub]=1; } else { FORAGE.give(id,n); INV.inside[inst][id]=n; } } return inst; };
  const finish=(g,r)=>{ if(r.id==='cash')INV.cash=(INV.cash||0)+Math.max(0,Math.floor(+r.n||0)); else if(isCont(r.id))unpack(r.id,r); else FORAGE.give(r.id,r.n||1); if(INV.save)INV.save(); say(r.id==='cash'?'YOU PICK UP $'+r.n+'.':'YOU PICK UP '+(/^(A|AN|THE) /.test(name(r.id))?'':'THE ')+name(r.id)+(r.n>1?' ×'+r.n:'')+'.','#f2c14e'); SFX.play('clunk',{vol:.4,pitch:1.6}); lose(g); saveG(); redraw(); };
  BAG.pickUp=g=>{ if(!GRD.includes(g)||g.taking)return; if(g.key.startsWith('drop:')){ if(!online()){ say('YOU CANNOT REACH IT OFFLINE.','#c8a090'); return; } g.taking=true; ONLINE.send({t:'take',k:g.key}); return; } finish(g,{id:g.id,n:g.n,in:g.in,subs:g.subs}); };
  BAG.drop=(id,n=1,at,from='bag')=>{ '@later'; if(id==='passport')return say('YOUR PASSPORT STAYS WITH YOU.','#c8a090'),false; if(isCont(id))n=1; n=Math.min(n,have(id,from)); if(n<1)return false;
    if(VIT.dead)return say('A GHOST HOLDS NOTHING.','#c8a090'),false; const rm=room(); if(ROOMS.cur&&(!rm||/^apt/i.test(rm)))return say('NOT IN HERE. DROP IT OUTSIDE.','#c8a090'),false; if(st.water&&st.water.in)return say('NOT IN THE WATER.','#c8a090'),false;
    for(const s in EQUIP.by)if(EQUIP.by[s]===id&&FORAGE.has(id)<=n)EQUIP.wear(id,true); if(WIELD.on===id&&FORAGE.has(id)<=n)WIELD.set(null);
    let inside=null; if(isCont(id)){ inside=pack(id); if(WINS.get(id))WINS.get(id).el.hidden=true; } if(from!=='bag'){ const I=INV.inside[from]||{}; I[id]=(I[id]||0)-n; if(I[id]<=0)delete I[id]; }
    FORAGE.take(id,n); if(INV.save)INV.save(); const h=SHARED.heading||0, a=(Math.random()-.5)*.6, p=at||{x:pos.x+Math.sin(h+a)*.6*T,z:pos.z+Math.cos(h+a)*.6*T};
    const g={key:(online()?'drop:':'local:')+uid(),id:kindOf(id),n,x:p.x,y:at&&isFinite(at.y)?at.y:SHARED.py,z:p.z,lv:LEVELS.cur||'street',t:Date.now(),until:Date.now()+LIFE()}; if(rm)g.rm=rm; if(inside){ g.in=inside.in; g.subs=inside.subs; }
    place(g); if(online())ONLINE.put(g.key,rec(g)); else { while(GRD.filter(q=>q.key.startsWith('local:')).length>MAXG)lose(GRD.find(q=>q.key.startsWith('local:'))); saveG(); }
    say('YOU DROP '+(/^(A|AN|THE) /.test(name(id))?'':'THE ')+name(id)+(n>1?' ×'+n:'')+'.','#e8e2cc'); SFX.play('clunk',{vol:.35}); if(sel===id&&!have(id,from))sel=null; redraw(); return true; };
  const restore=()=>{ loaded=true; let L=[]; try{ L=JSON.parse(OWNED.get('ground')||'[]')||[]; }catch(e){ L=[]; } for(const o of L)if(o&&o.id&&o.n>0&&!GRD.some(g=>g.key===o.key))place({key:o.key||'local:'+uid(),id:o.id,n:o.n,x:+o.x,y:+o.y,z:+o.z,lv:o.lv||'street',t:o.t||0,until:+o.until||(+o.t||0)+LIFE(),rm:o.rm||'',in:o.in,subs:o.subs}); };
  let nt=0; SYS.add('life',()=>{ if(!loaded&&SYS.started)restore(); const t=performance.now(); if(GRD.length&&t>nt){ nt=t+250; near(); } },'162e-bag');
  SYS.add('hi',m=>{ const W=m&&m.world||{}; for(const g of GRD.slice())if(g.key.startsWith('drop:')&&!g.taking&&!(g.key in W))lose(g); },'162e-bag');   // a drop gone while you were away
  SYS.add('world',(k,v)=>{ '@later'; if(typeof k!=='string'||!k.startsWith('drop:'))return; const g=GRD.find(q=>q.key===k);
    if(v===''||v==null){ if(g&&!g.taking)lose(g); return; } let r=null; try{ r=JSON.parse(v); }catch(e){} if(!r||!r.id||!(r.n>0))return; if(g){ if(r.until)g.until=+r.until; return; }
    if(r.until&&Date.now()>r.until)return; place({key:k,id:String(r.id),n:+r.n,x:+r.x||0,y:+r.y||0,z:+r.z||0,lv:r.lv||'street',t:+r.t||0,until:+r.until||0,rm:r.rm||'',in:r.in,subs:r.subs}); },'162e-bag');
  SYS.add('took',(k,v)=>{ const g=GRD.find(q=>q.key===k); if(!g)return; g.taking=false; let r=null; if(v){ try{ r=JSON.parse(v); }catch(e){} } if(r&&r.id)finish(g,r); else { say('SOMEONE GOT THERE FIRST.','#c8a090'); lose(g); redraw(); } },'162e-bag');

  /* ---------- dragging a picture or a row: about the mouth, into a container, onto the quick bar, out onto the ground ---------- */
  const cv=renderer.domElement, ray=new THREE.Raycaster();
  const who=(cx,cy)=>{ '@later'; if(!SHARED.cam)return null; const r=cv.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((cx-r.left)/r.width*2-1,-((cy-r.top)/r.height*2-1)),SHARED.cam); const L=UI.things.filter(t=>(t.player||t.npc)&&t.obj&&t.obj.visible&&(!t.obj.parent||t.obj.parent.visible)), h=ray.intersectObjects(L.map(t=>t.obj),true); if(!h.length)return null; return L.find(t=>{ for(let q=h[0].object;q;q=q.parent)if(q===t.obj)return true; return false; })||null; };
  // a quick bar slot dragged onto the world: one drops where you point (within 3 tiles) or at your feet, Shift the whole stack; its slot empties when none is left
  cv.addEventListener('dragover',e=>{ if(e.dataTransfer&&[...e.dataTransfer.types].includes('application/x-slot')){   // only a quick bar slot drops on the world (a bag row dragged past the list stays a reorder)
    e.preventDefault(); e.dataTransfer.dropEffect='move'; } });
  cv.addEventListener('drop',e=>{ '@later'; const d=e.dataTransfer&&e.dataTransfer.getData('text/plain')||''; if(!d.startsWith('slot:'))return; e.preventDefault(); const i=+d.slice(5), id=HUD.slots[i]; if(!id)return; if(id.startsWith('emote:'))return HUD.set(i,null);
    const q=WE.ground?WE.ground(e):null, at=q&&Math.hypot(q[0]-pos.x,q[2]-pos.z)<=3*T&&Math.abs(q[1]-SHARED.py)<T?{x:q[0],y:q[1],z:q[2]}:null;
    BAG.drop(id,e.shiftKey?have(id,'bag'):1,at,'bag'); if(have(id,'bag')<1)HUD.set(i,null); else HUD.qdraw(); });
  let drag=null, lastTap={id:null,t:0};
  for(const [t,f] of [['pointermove','mvf'],['pointerup','upf']])addEventListener(t,e=>{ if(!drag)return; const W=WINS.get(drag.from); if(W&&W[f]&&!W.el.contains(e.target))W[f](e); });   // a drag outside its window (the list redrawn under it, the menu stepped aside) still moves and lands
  // a held thing near a list's top or bottom edge scrolls that list, faster the nearer (owner, 8 Nov 2026)
  let scT=0, scL=0; const edgeScroll=t=>{ scT=0; if(!drag||!drag.moved)return; const dt=Math.min(.1,scL?(t-scL)/1000:0); scL=t; for(const m of document.querySelectorAll('.bagw:not([hidden]) .bgm.list')){ const r=m.getBoundingClientRect(), E=36*uz(); if(drag.cx<r.left||drag.cx>r.right||drag.cy<r.top-E||drag.cy>r.bottom+E)continue;
      const d=drag.cy<r.top+E?-(r.top+E-drag.cy):drag.cy>r.bottom-E?drag.cy-(r.bottom-E):0; if(d)m.scrollTop+=Math.sign(d)*Math.min(900,120+Math.abs(d)*20)*dt; }
    scT=requestAnimationFrame(edgeScroll); };
  const endDrag=()=>{ if(scT){ cancelAnimationFrame(scT); scT=0; } scL=0; document.body.classList.remove('bagdrag','bagout'); if(!drag)return; if(drag.ghost)drag.ghost.remove(); drag.el.classList.remove('held'); document.querySelectorAll('.bagw .over').forEach(x=>x.classList.remove('over')); drag=null; };
  const howMany=async(id,from,x,y)=>{ const n=have(id,from); if(n<=1||isCont(id))return n>=1?1:0; return (await BAG.ask(n,x,y))||0; };
  function bind(W){ const {el,key}=W, S=()=>sizeOf(key);
    el.addEventListener('pointerdown',e=>{ '@later'; 
      const it=e.target.closest('.bgi,.bgr'); if(it&&!e.button){ e.preventDefault(); e.stopPropagation(); const r=it.getBoundingClientRect(), isRow=it.classList.contains('bgr'), gsz=IC*uz()*S(); drag={id:it.dataset.id,from:key,el:it,sx:e.clientX,sy:e.clientY,ox:isRow?gsz/2:e.clientX-r.left,oy:isRow?gsz/2:e.clientY-r.top,w:isRow?gsz:r.width,h:isRow?gsz:r.height,moved:false,ghost:null}; try{ it.setPointerCapture(e.pointerId); }catch(x){} return; }
      if(key!=='bag'&&!e.button&&!e.target.closest('button,input,.bgm,.bgf')){ e.preventDefault(); const r=el.getBoundingClientRect(), z=uz(); W.mv={dx:e.clientX-r.left,dy:e.clientY-r.top,z}; try{ el.setPointerCapture(e.pointerId); }catch(x){} } },true);
    const mv=e=>{ '@later'; 
      if(W.mv){ el.style.left=Math.round((e.clientX-W.mv.dx)/W.mv.z)+'px'; el.style.top=Math.round((e.clientY-W.mv.dy)/W.mv.z)+'px'; return; }
      if(!drag||drag.from!==key)return; if(!drag.moved){ if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<4)return; drag.moved=true; drag.el.classList.add('held'); document.body.classList.add('bagdrag'); const g=document.createElement('img'); g.className='bgghost'; g.src=BAG.icon(drag.id); g.style.width=drag.w+'px'; g.style.height=drag.h+'px'; document.body.appendChild(g); drag.ghost=g; }
      drag.cx=e.clientX; drag.cy=e.clientY; if(!scT)scT=requestAnimationFrame(edgeScroll);
      if(el.classList.contains('inmenu')){ const lr=drag.lr||(drag.lr=el.querySelector('.bgm').getBoundingClientRect()), outside=e.clientX<lr.left-8||e.clientX>lr.right+8||e.clientY<lr.top-8||e.clientY>lr.bottom+8; document.body.classList.toggle('bagout',outside); }   // out of the list the menu steps aside, so a thing can go onto the world, the quick bar or someone
      drag.ghost.style.left=(e.clientX-drag.ox)+'px'; drag.ghost.style.top=(e.clientY-drag.oy)+'px'; document.querySelectorAll('.bagw .over').forEach(x=>x.classList.remove('over')); const u=document.elementFromPoint(e.clientX,e.clientY), c=u&&u.closest('.cont'); if(c&&c.dataset.id!==drag.id)c.classList.add('over'); }; el.addEventListener('pointermove',mv);
    const up=e=>{ '@later'; if(W.mv){ W.mv=null; return; } if(!drag||drag.from!==key)return; const D=drag, U0=document.elementFromPoint(e.clientX,e.clientY); endDrag(); const id=D.id, from=D.from;
      if(!D.moved){ const now=performance.now(); if(lastTap.id===id&&now-lastTap.t<400){ lastTap={id:null,t:0}; if(isCont(id))BAG.open(id); else if(HUD.useItem)HUD.useItem(id); } else { lastTap={id,t:now}; sel=id; selWin=from; } redraw(); return; }
      const u=U0; if(!u||have(id,from)<1)return;
      const onto=u.closest('.cont'); if(onto&&onto.dataset.id!==id){ const to=onto.dataset.id; howMany(id,from,e.clientX,e.clientY).then(n=>{ if(n&&BAG.move(id,n,from,to))say('YOU PUT THE '+name(id)+(n>1?' ×'+n:'')+' IN THE '+name(to)+'.'); redraw(); }); return; }
      const m=u.closest('.bgm'), tk=winOf(u);
      if(m&&tk&&tk!==from){ howMany(id,from,e.clientX,e.clientY).then(n=>{ if(n&&BAG.move(id,n,from,tk))say((tk==='bag'?'YOU TAKE THE ':'YOU PUT THE ')+name(id)+(n>1?' ×'+n:'')+(tk==='bag'?' OUT OF THE '+name(from):' IN THE '+name(tk))+'.'); redraw(); }); return; }
      if(m&&LIST){ const O=listed(key,contents(key)), r=u.closest('.bgr'); O.splice(O.indexOf(id),1); let k=O.length; if(r&&r.dataset.id!==id){ const b=r.getBoundingClientRect(); k=O.indexOf(r.dataset.id)+(e.clientY>b.top+b.height/2?1:0); } O.splice(k,0,id); ORD[key]=O; saveSet(); sel=id; selWin=from; redraw(); return; }
      if(m){ const r=m.getBoundingClientRect(), z=uz()*S(), x=(e.clientX-r.left-D.ox)/z, y=(e.clientY-r.top-D.oy)/z;
        if(TILED){ const tl=tiles(key,contents(key)), O=ORD[key], k=Math.max(0,Math.min(O.length-1,Math.floor((y+tl.c/2)/tl.c)*tl.cols+Math.floor((x+tl.c/2)/tl.c))); O.splice(O.indexOf(id),1); O.splice(k,0,id); saveSet(); }
        else { (POS[key]||(POS[key]={}))[id]=[Math.round(Math.max(0,Math.min(MW-IC,x))),Math.round(Math.max(0,Math.min(MH-IC,y)))]; savePos(); } sel=id; selWin=key; redraw(); return; }
      const q=u.closest('#hqb .qs'); if(q){ HUD.set(+q.dataset.i,id); return; }
      if(u.closest('#doll')&&DOLL.drop){ if(from!=='bag')return say('TAKE IT OUT OF THE '+name(from)+' FIRST.','#c8a090'); const ds=u.closest('#doll [data-s]'); DOLL.drop(id,ds&&ds.dataset.s); return redraw(); }
      if(u.closest('#dollo')&&DOLL.who&&DOLL.who()){ if(from!=='bag')return say('TAKE IT OUT OF THE '+name(from)+' FIRST.','#c8a090'); const o=DOLL.who(); howMany(id,from,e.clientX,e.clientY).then(n=>{ if(n&&SWAP)SWAP.ask(o,{id,n}); }); return; }
      if(u.closest('.bagw,#hqb'))return redraw();
      const th=who(e.clientX,e.clientY); if(th){ if(inMenu())UI.toggleMenu(); if(th.player){ if(from!=='bag')return say('TAKE IT OUT OF THE '+name(from)+' FIRST.','#c8a090'); howMany(id,from,e.clientX,e.clientY).then(n=>{ if(n&&SWAP)SWAP.ask(th.player,{id,n}); }); return; }
        const N=th.npc; if(TALK.shops.has(N))return TALK.shops.get(N)(); if(CHARS.trade&&CHARS.trade(N)&&SHOPS)return SHOPS.open(N); return say((N.name||'THEY')+" DOESN'T TRADE.",'#c8a090'); }
      howMany(id,from,e.clientX,e.clientY).then(n=>{ if(n)BAG.drop(id,n,null,from); }); };
    el.addEventListener('pointerup',up); W.mvf=mv; W.upf=up; el.addEventListener('pointercancel',()=>{ W.mv=null; endDrag(); }); el.addEventListener('lostpointercapture',()=>{ W.mv=null; });
    el.addEventListener('click',e=>{ '@later'; const b=e.target.closest('button'); if(!b||b.classList.contains('pX'))return; const d=b.dataset;
      if(b.classList.contains('bgx')){ el.hidden=true; return; }
      const from=d.win||key;
      if(d.bagdrop){ const n=d.n==='all'?have(d.bagdrop,from):1; if(d.n==='all'&&n>1)BAG.ask(n,e.clientX,e.clientY).then(k=>{ if(k)BAG.drop(d.bagdrop,k,null,from); }); else BAG.drop(d.bagdrop,n,null,from); }
      else if(d.out){ const n=have(d.out,from); BAG.ask(n,e.clientX,e.clientY).then(k=>{ if(k&&BAG.move(d.out,k,from,'bag'))say('YOU TAKE THE '+name(d.out)+(k>1?' ×'+k:'')+' OUT OF THE '+name(from)+'.'); redraw(); }); return; }
      else if(d.eat){ if(from!=='bag'){ const I=INV.inside[from]; if(I&&I[d.eat]){ I[d.eat]--; if(I[d.eat]<=0)delete I[d.eat]; } } FORAGE.eat(d.eat); }
      else if(d.id)FORAGE.ident(d.id); else if(d.hold){ if(WIELD.on===d.hold)BAG.off('hand'); else BAG.wear(d.hold,'hand'); } else if(d.act&&FORAGE.ACT[d.act])FORAGE.ACT[d.act](d.aid);
      redraw(); }); }
  BAG.size=(v,key='bag')=>sizeOf(key);
  BAG.tiled=v=>{ if(v!=null){ TILED=!!v; saveSet(); BAG.draw(); } return TILED; };
  BAG.list=v=>{ if(v!=null){ LIST=!!v; saveSet(); BAG.draw(); } return LIST; };
  BAG.sel=()=>sel; BAG.select=(id,key='bag')=>{ sel=id; selWin=key; redraw(); }; BAG.have=have; BAG.contents=contents;
  window.BAGDBG=()=>({open:!pk.hidden,sel,selWin,size:sizeOf('bag'),tiled:TILED,list:LIST,order:[...(ORD.bag||[])],pos:{...(POS.bag||{})},inside:JSON.parse(JSON.stringify(INV.inside)),wins:[...WINS.keys()].filter(k=>!WINS.get(k).el.hidden),ground:GRD.map(g=>({key:g.key,id:g.id,n:g.n,x:+g.x.toFixed(1),z:+g.z.toFixed(1),lv:g.lv,d:+(Math.hypot(g.x-pos.x,g.z-pos.z)/T).toFixed(2),drawn:!!(g.m&&g.m.parent&&g.sp.visible),until:g.until||0,rm:g.rm||'',thing:UI.things.includes(g.th),pick:!!(g.th&&g.th.pick),in:g.in||null,taking:!!g.taking})),loose:UI.things.filter(t=>t.name.startsWith('A LOOSE ')).map(t=>t.name),inBag:contents('bag'),worn:{...EQUIP.by,hand:WIELD.on}}); }
