// THE PAINTINGS: canvases to paint on (the painter, 159g) or to copy a masterwork on (PAINTINGS.copy, 159ha), your unfinished and finished paintings in the pack, their pictures kept on the server (/art), an easel and every painting as a thing for your wall (DECORATE) that visitors see too.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INV, ITEMS, ONLINE, TEXT, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {ROOMK} from './150a-bedroom.js';
import {PAINTER} from './159g-paint.js';
const PAINTINGS={}; window.PAINTINGS=PAINTINGS;
{
  const say=(t,c)=>SAY(t,c||'#e8e2cc');
  PAINTER.say=t=>say(t,'#c8a090');
  const CAN={canvas_s:{n:'CANVAS, SMALL',w:384,h:384,p:4,bg:'#f4efe4'},canvas_m:{n:'CANVAS',w:512,h:512,p:8,bg:'#f4efe4'},canvas_w:{n:'CANVAS, WIDE',w:768,h:512,p:12,bg:'#f4efe4'},
    canvas_t:{n:'CANVAS, TALL',w:512,h:768,p:12,bg:'#f4efe4'},paper:{n:'DRAWING PAPER',w:512,h:384,p:1,bg:'#ffffff'}};
  const FR={'':['NO FRAME',null],pine:['PINE',0xc89a5a],oak:['OAK',0x6e4224],black:['BLACK',0x1c1c1e],gilt:['GILT',0xc9a250]};
  const PXM=.0016;   // a painting's pixel in metres on the wall: 512 px is 82 cm
  PAINTINGS.CAN=CAN; PAINTINGS.FR=FR;
  FORAGE.add({names:Object.fromEntries(Object.entries(CAN).map(([k,v])=>[k,v.n])),prices:Object.fromEntries(Object.entries(CAN).map(([k,v])=>[k,v.p]))});
  for(const k in CAN)ITEMS.reg(k,{burnable:true,weight:k==='paper'?.1:1});
  // every painting and unfinished painting is one class on the item model (the item editor edits PAINTING's value: what a medium canvas well painted is worth)
  FORAGE.add({names:{painting:'PAINTING (EVERY PAINTING)',unfinished:'UNFINISHED PAINTING (EVERY ONE)'}});
  ITEMS.reg('painting',{burnable:true,sellable:true,value:30,weight:1.5}); ITEMS.reg('unfinished',{burnable:true,value:0,weight:1});

  /* ---------- what you own: the paintings' titles, painters and sizes (the pictures themselves are kept by ART) ---------- */
  const KEY='paint'; let M={v:1,wip:{},art:{}};
  try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1)M=Object.assign(M,D); }catch(e){}
  const save=()=>{ try{ OWNED.set(KEY,JSON.stringify(M)); }catch(e){} };
  const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  const names=()=>{ const n={}; for(const id in M.wip)n['wip_'+id]='UNFINISHED: '+(M.wip[id].t||CAN[M.wip[id].c].n); for(const id in M.art)n['pt_'+id]='PAINTING: “'+M.art[id].t+'”'; FORAGE.add({names:n}); };
  names();
  const worth=(id,def)=>{ const a=M.art[id]; const base=+(def&&def.value)||30; if(!a)return Math.round(base); const e=a.e==null?.5:a.e;
    const sz=Math.sqrt(a.w*a.h/(512*512)); if(a.cp)return Math.max(1,Math.round(base*sz*(.1+.9*Math.pow(a.cp.s/100,1.5))*(1+.35*a.cp.b)));
    return e<.02?1:Math.max(1,Math.round(base*sz*(.2+.8*Math.min(1,e/.5)))); };
  ITEMS.cls.push({is:id=>id.startsWith('pt_'),as:'painting',calc:{value:(id,d)=>worth(id.slice(3),d)}},{is:id=>id.startsWith('wip_'),as:'unfinished'});
  FORAGE.BUYK.paintings=['pt_'];

  /* ---------- ART: the pictures; on the website the server (/art) with this browser's copy, in the single-file page this browser only ---------- */
  const ART={mem:new Map()}; PAINTINGS.ART=ART;
  const web=()=>!!OWNED.server;
  const ask=b=>fetch('/art',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify(b)});
  let dbp=null; const db=()=>dbp||(dbp=new Promise(res=>{ try{ const r=indexedDB.open('market-art',1); r.onupgradeneeded=()=>r.result.createObjectStore('a'); r.onsuccess=()=>res(r.result); r.onerror=()=>res(null); }catch(e){ res(null); } }));
  const idb=async(mode,f)=>{ const d=await db(); if(!d)return null; return new Promise(res=>{ try{ const tx=d.transaction('a',mode), q=f(tx.objectStore('a')); tx.oncomplete=()=>res(q&&q.result); tx.onerror=tx.onabort=()=>res(null); }catch(e){ res(null); } }); };
  ART.put=async(k,d,fin)=>{ '@later'; if(fin)ART.mem.set(k,d); await idb('readwrite',s=>s.put(d,k)); if(!web())return true;
    try{ const r=await ask({put:{id:k,d,fin:fin?1:0}}); if(r.ok)return true; const j=await r.json().catch(()=>({})); say(j.full?'YOUR PAINTINGS ARE FULL ON THE SERVER: KEPT ON THIS DEVICE ONLY.':'THE PAINTING WAS NOT SAVED TO THE SERVER: KEPT ON THIS DEVICE.','#e8a23a'); }catch(e){ say('THE PAINTING WAS NOT SAVED TO THE SERVER: KEPT ON THIS DEVICE.','#e8a23a'); } return false; };
  const okP=new Map();   // a finished picture an owner took down (TENANTS) shows nothing, even from this browser's copy
  ART.ok=k=>{ if(!web()||k[0]!=='a')return Promise.resolve(true); if(!okP.has(k))okP.set(k,ask({have:k}).then(r=>{ if(r.status!==410)return true; ART.mem.delete(k); idb('readwrite',s=>s.delete(k)); return false; }).catch(()=>true)); return okP.get(k); };
  ART.get=async k=>{ if(!(await ART.ok(k)))return null; if(ART.mem.has(k))return ART.mem.get(k); let d=await idb('readonly',s=>s.get(k)); if(!d&&web()){ try{ const r=await ask({get:k}); if(r.ok){ d=(await r.json()).d; if(d)idb('readwrite',s=>s.put(d,k)); } }catch(e){} }
    if(d&&k[0]==='a')ART.mem.set(k,d); return d||null; };
  ART.del=async k=>{ ART.mem.delete(k); await idb('readwrite',s=>s.delete(k)); if(web())try{ await ask({del:k}); }catch(e){} };

  const mk=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; };
  const thumb=(img,max=112)=>{ const s=Math.min(1,max/Math.max(img.width,img.height)), c=mk(Math.max(1,Math.round(img.width*s)),Math.max(1,Math.round(img.height*s))), x=c.getContext('2d'); x.imageSmoothingQuality='high'; x.drawImage(img,0,0,c.width,c.height); return c.toDataURL('image/webp',.8); };
  const effort=(img,bg)=>{ '@later'; const c=mk(48,48), x=c.getContext('2d',{willReadFrequently:true}); x.drawImage(img,0,0,48,48); const d=x.getImageData(0,0,48,48).data, n=parseInt(bg.slice(1),16), b=[n>>16&255,n>>8&255,n&255]; let k=0;
    for(let i=0;i<d.length;i+=4)if(Math.abs(d[i]-b[0])+Math.abs(d[i+1]-b[1])+Math.abs(d[i+2]-b[2])>30)k++; return k/2304; };
  const today=()=>new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}).toUpperCase();

  /* ---------- painting: start on a canvas, carry on, finish ---------- */
  const opened=()=>{ const P=FORAGE.PACK; if(P&&P.open&&P.toggle)try{ P.toggle(); }catch(e){} };
  // cp (a copy): {i: the masterwork, t: the copy's title, w, h: the masterwork's shape, fitted to the canvas's longer side}
  PAINTINGS.start=(can,cp)=>{ const c=CAN[can]; if(!c)return; if(!FORAGE.has(can))return say('YOU HAVE NO '+c.n+'.','#c8a090'); FORAGE.take(can,1);
    let w=c.w, h=c.h; if(cp){ const L=Math.max(c.w,c.h), r=cp.w/cp.h; if(r>=1){ w=L; h=Math.round(L/r); } else { h=L; w=Math.round(L*r); } }
    const id=uid(); M.wip[id]={c:can,w,h,t:cp?cp.t:'',at:Date.now()}; if(cp)M.wip[id].cp={i:cp.i}; save(); names(); FORAGE.give('wip_'+id,1); if(INV.save)INV.save(); return open(id,true); };
  const open=async(id,fresh)=>{ '@later'; const w=M.wip[id]; if(!w)return; if(PAINTER.isOpen)return; let layers=null;
    if(!fresh){ try{ layers=JSON.parse(await ART.get('w'+id)||'null'); layers=layers&&layers.layers; }catch(e){ layers=null; } if(!layers)say('ITS PICTURE IS NOT ON THIS DEVICE YET: A FRESH START ON IT.','#e8a23a'); }
    const C=w.cp&&PAINTINGS.copy, guide=C?await C.guide(w.cp.i):null;
    opened(); UI.gamewin='paint';
    await PAINTER.open({w:w.w,h:w.h,title:w.t,bg:CAN[w.c].bg,layers,frames:Object.entries(FR).map(([k,v])=>[k,v[0]]),guide,fixTitle:w.cp?w.t:null,note:C?C.note(w.cp.i):null,
      onSave:(L,flat)=>{ w.th=thumb(flat); w.at=Date.now(); save(); ART.put('w'+id,JSON.stringify({w:w.w,h:w.h,layers:L})); easel(); },
      onFinish:o=>finish(id,o), onClose:()=>{ if(UI.gamewin==='paint')UI.gamewin=null; }});
    return id; };
  PAINTINGS.open=id=>open(id,false);
  const finish=async(id,{title,frame,img})=>{ '@later'; const w=M.wip[id]; if(!w)return; const d=img.toDataURL('image/webp',.92), by=(ONLINE.myName&&ONLINE.myName())||'A TENANT';
    const C=w.cp&&PAINTINGS.copy, cp=C?await C.judge(w.cp.i,img,CAN[w.c].bg):null; if(cp)title=w.t;
    M.art[id]={t:title,by:String(by).toUpperCase().slice(0,24),w:w.w,h:w.h,c:w.c,fr:frame||'',d:today(),e:+effort(img,CAN[w.c].bg).toFixed(3),th:thumb(img)}; if(cp)M.art[id].cp={i:cp.i,s:cp.s,b:cp.b,a:cp.a}; delete M.wip[id]; save(); names();
    FORAGE.take('wip_'+id,1); FORAGE.give('pt_'+id,1); if(INV.save)INV.save(); kind(id); easel();
    say(cp?cp.said:`SIGNED: “${title}”. IT IS IN YOUR PACK: HANG IT AT HOME (DECORATE), GIVE IT OR SELL IT.`,cp&&!cp.pass?'#e8c27a':'#b8f0a0'); if(FORAGE.draw)FORAGE.draw();
    await ART.put('a'+id,d,true); ART.del('w'+id); };
  PAINTINGS.atEasel=()=>{ '@later'; const ids=Object.keys(M.wip).filter(id=>FORAGE.has('wip_'+id)).sort((a,b)=>(M.wip[b].at||0)-(M.wip[a].at||0)); if(ids.length)return open(ids[0],false);
    const can=['canvas_m','canvas_s','canvas_w','canvas_t','paper'].find(k=>FORAGE.has(k)); if(can)return PAINTINGS.start(can);
    say('YOU NEED A CANVAS. THE PROFESSOR AT THE BOOKSTORE SELLS THEM.','#c8a090'); };

  /* ---------- the pack: PAINT a canvas or an unfinished painting, VIEW a finished one ---------- */
  FORAGE.ACT.paint=id=>{ if(CAN[id])return PAINTINGS.start(id); if(id.startsWith('wip_'))return open(id.slice(4),false); };
  FORAGE.ACT.artview=id=>PAINTINGS.view(id.slice(3)); FORAGE.ACT.paintcopy=id=>PAINTINGS.copy&&PAINTINGS.copy.list(id);
  FORAGE.ROWB.push(id=>CAN[id]?[['PAINT','paint'],['COPY','paintcopy']]:id.startsWith('wip_')?[['PAINT','paint']]:id.startsWith('pt_')?[['VIEW','artview']]:[]);
  const cpOf=a=>a&&a.cp?`A COPY AFTER ${a.cp.a} · SCORED ${a.cp.s}% · `:'';
  FORAGE.NOTE.push(id=>{ if(id.startsWith('pt_')){ const a=M.art[id.slice(3)]; return a?`${cpOf(a)}BY ${a.by} · ${a.w}×${a.h}${a.fr?' · '+FR[a.fr][0]+' FRAME':''}`:''; } if(CAN[id])return `${CAN[id].w}×${CAN[id].h}: PAINT ON IT`; if(id.startsWith('wip_'))return 'PAINT TO CARRY ON'; return ''; });
  FORAGE.HELP.push('PAINTING: PAINT on a canvas from your pack, or double-click your easel at home; COPY paints over a masterwork, scored when you finish (your PAINTING skill opens harder ones and shows the guide stronger). FINISH signs it: one of a kind, to hang (DECORATE), give or sell (the Professor at the bookstore buys them).');

  /* ---------- looking at a painting, full screen ---------- */
  const V=document.createElement('div'); V.id='artview'; V.hidden=true; V.setAttribute('role','dialog');
  V.style.cssText='position:fixed;inset:0;z-index:44;display:none;grid-template-rows:minmax(0,1fr) auto;gap:10px;padding:24px;box-sizing:border-box;background:rgba(4,5,8,.94);font:12px Silkscreen,monospace;letter-spacing:1px;color:#ece5d3;text-align:center';
  document.body.appendChild(V);
  const closeV=()=>{ if(V.hidden)return; V.hidden=true; V.style.display='none'; V.innerHTML=''; if(UI.gamewin==='paintv')UI.gamewin=null; SHARED.covered=PAINTER.isOpen; };
  V.addEventListener('click',e=>{ if(e.target===V||e.target.dataset.x)closeV(); });
  addEventListener('keydown',e=>{ if(!V.hidden&&e.key==='Escape'){ e.stopImmediatePropagation(); closeV(); } },true);
  PAINTINGS.view=async(id,a)=>{ '@later'; a=a||M.art[id]; if(!a)return; V.innerHTML=`<div style="display:grid;place-items:center;min-height:0"><img alt="" style="max-width:100%;max-height:100%;object-fit:contain;box-shadow:0 0 0 ${a.fr?10:2}px #${(FR[a.fr||'']&&FR[a.fr][1]!=null?FR[a.fr][1]:0x3a3f4e).toString(16).padStart(6,'0')},0 8px 30px #000;image-rendering:auto"></div>
      <div><div style="color:#f2c14e;font-size:14px">“${TEXT.esc(a.t)}”</div><div style="color:#9b9584;margin-top:4px">${TEXT.esc(cpOf(a))}BY ${TEXT.esc(a.by)} · ${TEXT.esc(a.d||'')} · ${a.w}×${a.h}</div><button data-x="1" style="margin-top:10px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:4px 10px;cursor:pointer">CLOSE</button></div>`;
    V.hidden=false; V.style.display='grid'; if(!UI.gamewin)UI.gamewin='paintv'; SHARED.covered=true; const im=V.querySelector('img'); if(!(await ART.ok('a'+id))){ im.alt='TAKEN DOWN'; return; } if(a.th&&!V.hidden)im.src=a.th; const d=await ART.get('a'+id); if(d&&!V.hidden)im.src=d; };

  /* ---------- on the wall: a painting is a DECORATE thing of its own (as a photo is), framed; its picture loads from ART ---------- */
  const tex=new Map();
  const texOf=(id,a)=>{ '@later'; if(tex.has(id))return tex.get(id); const c=mk(4,4), x=c.getContext('2d'); x.fillStyle='#d8d2c4'; x.fillRect(0,0,4,4); const t=new THREE.Texture(c); t.colorSpace=THREE.SRGBColorSpace; t.needsUpdate=true; tex.set(id,t);
    const put=src=>{ const im=new Image(); im.onload=()=>{ t.image=im; t.needsUpdate=true; }; im.src=src; }; ART.ok('a'+id).then(ok=>{ if(!ok)return; if(a&&a.th)put(a.th); ART.get('a'+id).then(d=>{ if(d)put(d); }); }); return t; };
  const framed=(id,a)=>{ '@later'; const G=new THREE.Group(), W=a.w*PXM, H=a.h*PXM, f=FR[a.fr||'']||FR[''];
    const back=new THREE.Mesh(new THREE.BoxGeometry(W,H,.024),new THREE.MeshStandardMaterial({color:0xe9e3d4,roughness:.9})); back.position.z=.012; G.add(back);
    const face=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshStandardMaterial({map:texOf(id,a),roughness:.85})); face.position.z=.0245; G.add(face);
    if(f[1]!=null){ const t=.05, d=.045, m=new THREE.MeshStandardMaterial({color:f[1],roughness:a.fr==='gilt'?.35:.65,metalness:a.fr==='gilt'?.55:0});
      for(const [w,h,x,y] of [[W+2*t,t,0,H/2+t/2],[W+2*t,t,0,-H/2-t/2],[t,H,-W/2-t/2,0],[t,H,W/2+t/2,0]]){ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); b.position.set(x,y,d/2); G.add(b); } }
    return G; };
  const lazy=(D,make)=>Object.defineProperty(D,'tpl',{configurable:true,enumerable:true,get(){ const t=make(); Object.defineProperty(D,'tpl',{value:t,enumerable:true}); return t; }});
  const kind=(id,a,R)=>{ '@later'; R=R||(ROOMK.api&&ROOMK.api.R); a=a||M.art[id]; if(!R||!a)return; const k='pt:'+id; if(R.kinds[k])return;
    const D={kind:k,name:'PAINTING: '+a.t,own:'pt_'+id,loose:false,m:0,wire:null,sol:[],shf:[],mount:'wall',dept:'art',deptName:'ART',art:{id,t:a.t,by:a.by,w:a.w,h:a.h,fr:a.fr||'',d:a.d||'',...(a.cp?{cp:a.cp}:{})}}; lazy(D,()=>framed(id,a)); R.kinds[k]=D; };

  /* ---------- the easel: a DECORATE thing ($40); double-click it to paint; your latest unfinished painting stands on it ---------- */
  const ec=mk(128,128), ex=ec.getContext('2d'), etex=new THREE.CanvasTexture(ec); etex.colorSpace=THREE.SRGBColorSpace;
  const emat=new THREE.MeshStandardMaterial({map:etex,roughness:.85}); emat.visible=false;
  const easel=()=>{ const ids=Object.keys(M.wip).filter(id=>M.wip[id].th&&FORAGE.has('wip_'+id)).sort((a,b)=>(M.wip[b].at||0)-(M.wip[a].at||0)); if(!ids.length){ emat.visible=false; return; }
    const im=new Image(); im.onload=()=>{ ex.fillStyle='#e9e3d4'; ex.fillRect(0,0,128,128); const s=Math.min(128/im.width,128/im.height); ex.drawImage(im,(128-im.width*s)/2,(128-im.height*s)/2,im.width*s,im.height*s); etex.needsUpdate=true; emat.visible=true; }; im.src=M.wip[ids[0]].th; };
  easel();
  const makeEasel=()=>{ '@later'; const G=new THREE.Group(), wood=new THREE.MeshStandardMaterial({color:0x8a5a32,roughness:.75}), bx=(w,h,d,x,y,z,rx,rz)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wood); m.position.set(x,y,z); m.rotation.set(rx||0,0,rz||0); G.add(m); return m; };
    bx(.04,1.75,.04,-.26,.86,.08,-.05,-.12); bx(.04,1.75,.04,.26,.86,.08,-.05,.12); bx(.04,1.7,.04,0,.8,-.24,.3,0); bx(.22,.05,.05,0,1.7,.03); bx(.74,.04,.11,0,.74,.15); bx(.74,.035,.015,0,.775,.2);
    const cv=new THREE.Mesh(new THREE.PlaneGeometry(.62,.62),emat); cv.position.set(0,1.08,.17); cv.rotation.x=-.06; G.add(cv);
    return G; };
  ROOMK.wires.easel=(un,c)=>c.hit(un,()=>'THE EASEL: PAINT OR COPY',()=>PAINTINGS.copy?PAINTINGS.copy.list():PAINTINGS.atEasel());
  ROOMK.parts.push(ctx=>{ const R=ctx.R; for(const id in M.art)kind(id,M.art[id],R);
    if(!R.kinds['pt:easel']){ const D={kind:'pt:easel',name:'EASEL',loose:false,m:0,wire:'easel',sol:[[-.36,-.3,.36,.3,1.75]],shf:[],dept:'art',deptName:'ART',price:40}; lazy(D,makeEasel); R.kinds['pt:easel']=D; } });
  // the layout carries each hung painting's title and size, so a visitor's game can hang it too (its picture comes from the server)
  ROOMK.keep.push({ out:(L,A)=>{ const art={}; for(const un of A.units()){ const K=A.R.kinds[un.kind]; if(un.added&&!un.gone&&K&&K.art)art[K.art.id]=K.art; } if(Object.keys(art).length)L.art=art; },
    in:(L,A)=>{ for(const id in L.art||{}){ const a=L.art[id]; if(a&&/^[a-z0-9]{6,40}$/.test(id))kind(id,{t:String(a.t||''),by:String(a.by||''),w:+a.w||512,h:+a.h||512,fr:FR[a.fr]?a.fr:'',d:String(a.d||''),cp:cpIn(a.cp)},A.R); } } });

  /* ---------- giving and getting (TRADE, 159i) ---------- */
  function cpIn(c){ return c&&typeof c==='object'?{i:String(c.i||'').slice(0,24),s:Math.max(0,Math.min(100,Math.round(+c.s||0))),b:Math.max(0,Math.min(9,Math.floor(+c.b||0))),a:String(c.a||'').toUpperCase().slice(0,40)}:undefined; }
  PAINTINGS.meta=id=>{ const a=M.art[id]; return a?{t:a.t,by:a.by,w:a.w,h:a.h,c:a.c,fr:a.fr,d:a.d,e:a.e,...(a.cp?{cp:a.cp}:{})}:null; };
  PAINTINGS.gave=id=>{ if(M.art[id]&&!FORAGE.has('pt_'+id)){ delete M.art[id]; save(); } };
  FORAGE.SOLD.push(id=>{ if(id.startsWith('pt_'))PAINTINGS.gave(id.slice(3)); });
  PAINTINGS.got=(id,a)=>{ if(!/^[a-z0-9]{6,40}$/.test(id)||!a)return; M.art[id]={t:String(a.t||'UNTITLED'),by:String(a.by||''),w:+a.w||512,h:+a.h||512,c:CAN[a.c]?a.c:'canvas_m',fr:FR[a.fr]?a.fr:'',d:String(a.d||''),e:+a.e||0}; const cp=cpIn(a.cp); if(cp)M.art[id].cp=cp; save(); names(); kind(id); };
  PAINTINGS.mine=()=>M;
  window.PAINTDBG=()=>({wip:Object.keys(M.wip).length,art:Object.keys(M.art).length,painter:PAINTER.state(),gamewin:UI.gamewin});
}
export {PAINTINGS};
