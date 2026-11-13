// THE ITEM EDITOR (owner, 7 Nov 2026: layout A, every item, on body): ITEMED is the owner's full-screen workbench: every item by family with its picture, a 360 view you turn, on you or alone, and its settings (ITEMED.props, 140b).
import {THREE} from './003-shx.js';
import {ARCHI, BAG, CINEMA, INSPECT, ITEMED, ITEMS, UI, W3, WE} from './003b-systems.js';
import {TILE} from './006-map-pre.js';
import {AVATAR} from './111c-avatar.js';
{ const owner=async()=>{ if(!/^https?:$/.test(location.protocol))return true; try{ return !!(CINEMA.isAdmin&&await CINEMA.isAdmin()); }catch(e){ return false; } };
  let B=null;
  ITEMED.on=false; window.ITEMED=ITEMED;
  ITEMED.toggle=async()=>{ if(!B){ if(typeof LOAD==='function')await LOAD('itemed'); B=B||make(); } B.toggle(); };
  ITEMED.key=async()=>{ if(ITEMED.on)return ITEMED.toggle(); if(!await owner()){ if(UI.log)UI.log('The ITEM editor is the owner\'s.','#e8a23a'); return; } return ITEMED.toggle(); };

  const make=()=>{ '@itemed';
    const M=TILE/.84, esc=s=>String(s??'').replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';'), norm=ITEMED.norm;
    const SLOTN={hair:'HAIR',hat:'HAT',face:'FACE',eyes:'EYES',neck:'NECK',top:'TOP',coat:'COAT',hands:'HANDS',belt:'BELT',bottom:'BOTTOM',feet:'FEET',back:'BACK',righthand:'RIGHT HAND',lefthand:'LEFT HAND'};
    const HELD=new Set(['back','righthand','lefthand']), SLOTOF={hat:'head',hair:'head',face:'head',eyes:'eyes',back:'back',righthand:'hand',lefthand:'hand',bottom:'legs',feet:'legs'};
    const FAM=[['game','GAME'],['wear','WEAR'],['held','HELD'],['place','PLACE']];
    const css=document.createElement('style'); css.textContent=`
    #itb{position:fixed;inset:calc(10px + env(safe-area-inset-top,0px)) calc(10px + env(safe-area-inset-right,0px)) calc(10px + env(safe-area-inset-bottom,0px)) calc(10px + env(safe-area-inset-left,0px));z-index:26;display:grid;grid-template-columns:minmax(240px,29%) 1fr minmax(280px,29%);gap:8px;font:12px var(--pixel);color:var(--fg)}
    #itb[hidden]{display:none} #itb>div{background:var(--bg);border:2px solid var(--line);display:flex;flex-direction:column;min-width:0;min-height:0}
    #itb h4{margin:0;padding:9px 12px;font:12px var(--pixel);color:var(--key);border-bottom:2px solid var(--line);display:flex;justify-content:space-between;gap:8px;align-items:center}
    #itb h4 span{color:var(--dim);font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #itb .btn{font:10px var(--pixel);color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 8px;cursor:pointer}
    #itb .btn[aria-pressed=true]{border-color:var(--key);color:var(--key)} #itb .btn:disabled{opacity:.4;cursor:default}
    #itb .tabs{display:flex;gap:4px;padding:8px 10px 0;flex-wrap:wrap}
    #itb input[type=text],#itb select{font:12px var(--pixel);color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:5px 7px;min-width:0;box-sizing:border-box}
    #itb .q{margin:8px 10px 4px} #itb .nw{display:flex;gap:4px;margin:0 10px 4px} #itb .nw input{flex:1}
    #itb .list{overflow:auto;padding:4px 10px 10px;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;align-content:start;flex:1}
    #itb .gh{grid-column:1/-1;color:var(--key);font-size:10px;margin-top:6px;border-bottom:1px dashed var(--line);padding-bottom:3px}
    #itb .cell{background:#0e1016;border:2px solid #2c303c;padding:3px;cursor:pointer;display:grid;gap:2px;text-align:center;color:var(--fg);font:9px var(--pixel);min-width:0}
    #itb .cell[aria-pressed=true]{border-color:var(--key);background:#1c2130}
    #itb .cell .im{width:100%;aspect-ratio:1;background:#151923 center/contain no-repeat;image-rendering:auto}
    #itb .cell .im.px{image-rendering:pixelated;background-size:62%}
    #itb .cell b{font-weight:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #itb .spin{position:relative;flex:1;min-height:0;cursor:grab;touch-action:none;background:radial-gradient(60% 55% at 50% 55%,#2a3142 0%,#10131a 78%)}
    #itb .spin:active{cursor:grabbing} #itb .spin canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
    #itb .spin .hint{position:absolute;left:10px;top:8px;color:var(--dim);font-size:10px;pointer-events:none} #itb .spin .deg{position:absolute;right:10px;top:8px;color:var(--dim);font-size:10px;pointer-events:none}
    #itb .spin .note{position:absolute;left:0;right:0;bottom:12px;text-align:center;color:var(--dim);font-size:10px;pointer-events:none}
    #itb .ctl{display:flex;gap:6px;padding:8px 10px;border-top:2px solid var(--line);flex-wrap:wrap}
    #itb .info{padding:10px 12px;display:grid;gap:6px;border-bottom:2px solid var(--line)}
    #itb .info .nm{color:var(--fg);font-size:13px} #itb .info .dim{color:var(--dim);font-size:10px;line-height:1.5}
    #itb .info select{width:100%}
    #itb .tp{overflow:auto;flex:1;padding:6px 8px}
    #itb .foot{display:flex;gap:6px;padding:8px 10px;border-top:2px solid var(--line)}`;
    document.head.appendChild(css);
    const P=document.createElement('div'); P.id='itb'; P.hidden=true;
    P.innerHTML=`<div class="l"><h4>ITEMS <span class="cnt"></span></h4><div class="tabs">${FAM.map(([k,n])=>`<button class="btn" data-f="${k}" aria-pressed="false">${n}</button>`).join('')}</div>
      <input type="text" class="q" placeholder="search" aria-label="Search items" autocomplete="off"><div class="nw"><input type="text" placeholder="new item id, e.g. crate" aria-label="New item id"><button class="btn" data-a="add">ADD</button></div><div class="list" role="listbox"></div></div>
      <div class="c"><h4>360 <span class="cn"></span></h4><div class="spin"><canvas></canvas><span class="hint">DRAG TO TURN · WHEEL TO ZOOM</span><span class="deg">0°</span><span class="note"></span></div>
      <div class="ctl"><button class="btn" data-a="prev">◀</button><button class="btn" data-a="play" aria-pressed="true">STOP</button><button class="btn" data-a="next">▶</button><button class="btn" data-a="body" aria-pressed="false">ON BODY</button></div></div>
      <div class="r"><h4>ITEM <span>SHIFT+7 · ESC</span></h4><div class="info"></div><div class="tp"></div><div class="foot"><button class="btn" data-a="export">EXPORT ITEMS.JSON</button><button class="btn" data-a="done">DONE</button></div></div>`;
    document.body.appendChild(P);
    const $=s=>P.querySelector(s), list=$('.list'), info=$('.info'), tpEl=$('.tp'), spin=$('.spin'); let cv=$('canvas');
    for(const ev of ['keydown','keyup'])P.addEventListener(ev,e=>{ if(e.target.matches('input,textarea,select'))e.stopPropagation(); });

    /* ---------- every item, by family ---------- */
    const E={game:[],wear:[],held:[],place:null};
    const gameList=()=>{ const ids=new Set([...ITEMS.ids(),...ITEMED.discovered()]); return [...ids].filter(id=>!/^(pfp?|pt|wip)_/.test(id)&&!(ARCHI&&ARCHI(id))).map(id=>{ let g='ITEMS'; try{ if(BAG.kind)g=BAG.kind(id).toUpperCase(); }catch(e){}
      return {fam:'game',id,name:String(ITEMED.nameOf(id)).toUpperCase(),grp:g}; }).sort((a,b)=>a.grp.localeCompare(b.grp)||a.name.localeCompare(b.name)); };
    { const K=new Map(); for(const p of AVATAR.pieces){ const key=p.slot+'|'+p.k; if(!K.has(key))K.set(key,{fam:HELD.has(p.slot)?'held':'wear',id:'pf_'+p.slot+'_'+norm(p.k),name:p.k,grp:SLOTN[p.slot]||p.slot.toUpperCase(),slot:p.slot,vers:[]}); K.get(key).vers.push(p); }
      const order=Object.keys(SLOTN); for(const e of [...K.values()].sort((a,b)=>order.indexOf(a.slot)-order.indexOf(b.slot)||a.name.localeCompare(b.name)))E[e.fam].push(e); }
    const placeList=()=>E.place?Promise.resolve(E.place):WE.pfList().then(j=>E.place=j.list.map(([ci,k,n])=>({fam:'place',id:'pfp_'+k,key:k,name:String(n).toUpperCase(),grp:j.cats[ci]||'',ci})).sort((a,b)=>a.ci-b.ci||a.name.localeCompare(b.name)));
    let fam='wear', q='', cur=null, ver=0, onBody=false;

    /* ---------- the 360 view: its own small renderer, only while the editor is open ---------- */
    let R=null, scene=null, cam=null, pivot=null, rt=null, raf=0, ang=.6, el=.18, zoom=1, play=true, last=0, tok=0, made=[], rad=1;
    const mat=()=>new THREE.MeshToonMaterial({vertexColors:true,gradientMap:W3.GP||null,side:THREE.DoubleSide});
    let MAT=null;
    const up=()=>{ if(R)return; const nc=document.createElement('canvas'); cv.replaceWith(nc); cv=nc; R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true,preserveDrawingBuffer:true}); R.setPixelRatio(Math.min(2,devicePixelRatio||1)); R.outputColorSpace=THREE.SRGBColorSpace; R.setClearColor(0,0);
      scene=new THREE.Scene(); scene.add(new THREE.HemisphereLight(0xffffff,0x5a6478,1.5)); const dl=new THREE.DirectionalLight(0xffffff,2.1); dl.position.set(2,4,3); scene.add(dl);
      cam=new THREE.PerspectiveCamera(30,1,.01,5000); pivot=new THREE.Group(); scene.add(pivot); MAT=mat();
      rt=new THREE.WebGLRenderTarget(128,128,{samples:4}); rt.texture.colorSpace=THREE.SRGBColorSpace; size(); };
    const size=()=>{ if(!R)return; const w=Math.max(2,spin.clientWidth), h=Math.max(2,spin.clientHeight); R.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix(); };
    const ro=new ResizeObserver(size); ro.observe(spin);
    const down=()=>{ cancelAnimationFrame(raf); raf=0; clear(); if(MAT){ MAT.dispose(); MAT=null; } if(rt){ rt.dispose(); rt=null; } if(R){ R.dispose(); R.forceContextLoss(); R=null; } };
    const clear=()=>{ if(pivot)pivot.clear(); for(const x of made)x.dispose(); made=[]; };
    // a model for an item: {obj, keep[]} (keep: geometry and textures this view made, freed when it goes)
    const model=async(e,body,v=0)=>{ const keep=[];
      if(e.fam==='game'){ const o=INSPECT.model?INSPECT.model(e.id):null; return o?{obj:o,keep}:null; }
      if(e.fam==='place'){ await WE.pfLoad(e.key); const g=WE.pfGeo(e.key); if(!g)return null; const o=new THREE.Group(); o.add(new THREE.Mesh(g,MAT));
        if(body){ const s=await AVATAR.statue(AVATAR.L().w); keep.push(s); const me=new THREE.Mesh(s,MAT); me.scale.setScalar(M); g.computeBoundingBox(); me.position.x=g.boundingBox.max.x+.45*M; o.add(me); }
        return {obj:o,keep}; }
      const p=e.vers[Math.min(v,e.vers.length-1)]||e.vers[0], L=AVATAR.L(), f=p.figs.includes(L.f)?L.f:p.figs[0], w={[e.slot]:[p.n,'']};
      const g=await AVATAR.statue(body?Object.assign(f===L.f?{...L.w}:{},w):w,{body,f}); keep.push(g); return {obj:new THREE.Mesh(g,MAT),keep}; };
    const fit=obj=>{ pivot.clear(); const box=new THREE.Box3().setFromObject(obj), c=box.getCenter(new THREE.Vector3()); rad=Math.max(1e-3,box.getBoundingSphere(new THREE.Sphere()).radius);
      obj.position.sub(c); pivot.add(obj); refit(); };
    const refit=()=>{ if(!cam)return; const d=rad/Math.sin(THREE.MathUtils.degToRad(cam.fov/2))*1.04*zoom; cam.position.set(0,Math.sin(el)*d,Math.cos(el)*d); cam.lookAt(0,0,0); cam.near=d/100; cam.far=d*10; cam.updateProjectionMatrix(); };
    const show=async()=>{ if(!R||!cur)return; const t=++tok, note=$('.note'); note.textContent='LOADING…';
      let m=null; try{ m=await model(cur,onBody,ver); }catch(err){ console.warn('ITEM editor',err); }
      if(t!==tok||!R){ if(m)for(const x of m.keep)x.dispose(); return; }
      clear(); if(!m){ note.textContent='NO PICTURE'; return; } made=m.keep; fit(m.obj); note.textContent=cur.fam==='game'&&INSPECT.has&&!INSPECT.has(cur.id)?'NO MODEL OF ITS OWN YET · A PARCEL':''; };
    const frame=now=>{ raf=requestAnimationFrame(frame); if(!R)return; const dt=Math.min(.1,(now-(last||now))/1000); last=now; if(play)ang+=dt*.9; pivot.rotation.y=ang;
      $('.deg').textContent=Math.round(((ang*180/Math.PI)%360+360)%360)+'°'; R.render(scene,cam); thumbStep(); };
    { let x0=null,y0=0,a0=0,e0=0; spin.addEventListener('pointerdown',e=>{ x0=e.clientX; y0=e.clientY; a0=ang; e0=el; spin.setPointerCapture(e.pointerId); setPlay(false); });
      spin.addEventListener('pointermove',e=>{ if(x0==null)return; ang=a0+(e.clientX-x0)*.012; el=Math.max(-.6,Math.min(1.2,e0+(e.clientY-y0)*.006)); refit(); });
      const end=()=>{ x0=null; }; spin.addEventListener('pointerup',end); spin.addEventListener('pointercancel',end);
      spin.addEventListener('wheel',e=>{ e.preventDefault(); zoom=Math.max(.35,Math.min(3,zoom*Math.exp(e.deltaY*.0012))); refit(); },{passive:false}); }
    const setPlay=v=>{ play=v; const b=$('[data-a="play"]'); b.textContent=v?'STOP':'PLAY'; b.setAttribute('aria-pressed',String(v)); };

    /* ---------- pictures in the list: drawn once each into a small target, a few a frame, only for what is on screen ---------- */
    const TH=new Map(), want=[], seen=new Set(); let busy=false;
    const io=new IntersectionObserver(es=>{ for(const x of es){ const c=x.target; if(!x.isIntersecting)continue; io.unobserve(c); const e=byId.get(c.dataset.id); if(e&&!TH.has(e.id)&&!seen.has(e.id)){ seen.add(e.id); want.push(e); } } },{root:list,rootMargin:'120px'});
    const thumbStep=async()=>{ if(busy||!want.length||!R)return; busy=true; const e=want.shift(); let url=null;
      try{ const m=await model(e,false,0); if(m&&R){ const s=new THREE.Scene(); s.add(new THREE.HemisphereLight(0xffffff,0x5a6478,1.5)); const dl=new THREE.DirectionalLight(0xffffff,2.1); dl.position.set(2,4,3); s.add(dl);
          const c=new THREE.PerspectiveCamera(30,1,.01,5000), box=new THREE.Box3().setFromObject(m.obj), ctr=box.getCenter(new THREE.Vector3()), r=Math.max(1e-3,box.getBoundingSphere(new THREE.Sphere()).radius), d=r/Math.sin(THREE.MathUtils.degToRad(15))*1.02;
          const h=new THREE.Group(); m.obj.position.sub(ctr); h.add(m.obj); h.rotation.y=.6; s.add(h); c.position.set(0,Math.sin(.28)*d,Math.cos(.28)*d); c.lookAt(0,0,0); c.near=d/100; c.far=d*10; c.updateProjectionMatrix();
          R.setRenderTarget(rt); R.setClearColor(0,0); R.clear(); R.render(s,c); const px=new Uint8Array(128*128*4); R.readRenderTargetPixels(rt,0,0,128,128,px); R.setRenderTarget(null);
          const k=document.createElement('canvas'); k.width=k.height=128; const g=k.getContext('2d'), id=g.createImageData(128,128); for(let y=0;y<128;y++)id.data.set(px.subarray((127-y)*512,(128-y)*512),y*512); g.putImageData(id,0,0); url=k.toDataURL(); }
        if(m)for(const x of m.keep)x.dispose(); }catch(err){ console.warn('ITEM editor picture',e.id,err); }
      if(url){ TH.set(e.id,url); const c=list.querySelector(`[data-id="${CSS.escape(e.id)}"] .im`); if(c)c.style.backgroundImage=`url(${url})`; } busy=false; };

    /* ---------- the list, the settings ---------- */
    let byId=new Map();
    const pic=e=>e.fam==='game'?(BAG.icon?BAG.icon(e.id):''):TH.get(e.id)||'';
    const draw=async()=>{ const L=fam==='place'?await placeList():fam==='game'?(E.game=gameList()):E[fam]; byId=new Map(L.map(e=>[e.id,e]));
      for(const b of P.querySelectorAll('[data-f]'))b.setAttribute('aria-pressed',String(b.dataset.f===fam)); $('.nw').hidden=fam!=='game';
      const s=q.toLowerCase(), F=s?L.filter(e=>(e.name+' '+e.id+' '+e.grp+' '+(e.vers?e.vers.map(p=>p.v+' '+p.g).join(' '):'')).toLowerCase().includes(s)):L;
      $('.cnt').textContent=F.length+(F.length!==L.length?' OF '+L.length:''); let g=null, h='';
      for(const e of F){ if(e.grp!==g){ g=e.grp; h+=`<div class="gh">${esc(g)}</div>`; } const u=pic(e);
        h+=`<button class="cell" data-id="${esc(e.id)}" aria-pressed="${!!cur&&cur.id===e.id}" title="${esc(e.name)}${e.vers?' · '+e.vers.length+' versions':''}"><div class="im${e.fam==='game'?' px':''}"${u?` style="background-image:url(${u})"`:''}></div><b>${esc(e.name)}</b></button>`; }
      list.innerHTML=h||'<div class="gh">NOTHING MATCHES</div>'; if(fam!=='game')for(const c of list.querySelectorAll('.cell'))if(!TH.has(c.dataset.id))io.observe(c); };
    const pick=e=>{ cur=e; ver=0; for(const c of list.querySelectorAll('.cell'))c.setAttribute('aria-pressed',String(c.dataset.id===e.id)); $('.cn').textContent=e.name; zoom=1;
      const bb=$('[data-a="body"]'); bb.disabled=e.fam==='game'; bb.textContent=e.fam==='place'?'BESIDE YOU':'ON BODY';
      const kind=e.fam==='game'?'GAME ITEM':e.fam==='place'?'PLACEABLE · '+e.grp:(e.fam==='held'?'HELD · ':'WEAR · ')+e.grp;
      info.innerHTML=`<div class="nm">${esc(e.name)}</div><div class="dim">${esc(kind)} · ${esc(e.id)}${ITEMS.defs[e.id]?'':' · NO SETTINGS YET (MADE ON YOUR FIRST CHANGE)'}</div>`+
        (e.vers?`<label class="dim">VERSION · ${e.vers.length}</label><select class="ver" aria-label="Version">${e.vers.map((p,i)=>`<option value="${i}">${esc(p.v)} · ${esc(p.g)}</option>`).join('')}</select><div class="dim">A setting covers every version of this kind.</div>`:'');
      const vs=info.querySelector('.ver'); if(vs)vs.onchange=()=>{ ver=+vs.value; show(); };
      ITEMED.props(tpEl,e.id,e.slot?{slot:SLOTOF[e.slot]||'body',pickup:true}:e.fam==='place'?{pickup:false}:null).catch(err=>console.warn('ITEM editor',err)); show(); };
    ITEMED.removed=id=>{ if(cur&&cur.id===id){ draw(); pick(cur); } };
    P.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return;
      if(b.dataset.f){ fam=b.dataset.f; draw(); return; }
      if(b.dataset.id){ const it=byId.get(b.dataset.id); if(it)pick(it); return; }
      const a=b.dataset.a; if(a==='prev'){ setPlay(false); ang-=Math.PI/6; } if(a==='next'){ setPlay(false); ang+=Math.PI/6; } if(a==='play')setPlay(!play);
      if(a==='body'){ onBody=!onBody; b.setAttribute('aria-pressed',String(onBody)); show(); }
      if(a==='export')ITEMED.export(); if(a==='done')toggle();
      if(a==='add'){ const i=$('.nw input'), id=ITEMED.add(i.value); i.value=''; if(id){ draw().then(()=>{ const it=byId.get(id); if(it)pick(it); }); } } });
    $('.q').addEventListener('input',e=>{ q=e.target.value.trim(); draw(); });
    const toggle=()=>{ ITEMED.on=!ITEMED.on; P.hidden=!ITEMED.on;
      if(ITEMED.on){ up(); last=0; raf=requestAnimationFrame(frame); draw().then(()=>{ if(!cur){ const L=fam==='place'?E.place:E[fam]; if(L&&L.length)pick(L.find(e=>/PLATE ARMOUR/.test(e.name))||L[0]); } else show(); }); }
      else { down(); want.length=0; seen.clear(); if(tpEl.__tp){ tpEl.__tp.dispose(); tpEl.__tp=null; } }
      if(UI.log&&ITEMED.on===false)UI.log('Item settings saved with your account. EXPORT writes items.json to ship them.','#9b9584'); };
    ITEMED.dbg={E,byId:()=>byId,cur:()=>cur,pick:id=>{ const e=byId.get(id); if(e)pick(e); return !!e; },tab:f=>{ fam=f; return draw(); },R:()=>R,size:()=>{ const z=new THREE.Box3().setFromObject(pivot).getSize(new THREE.Vector3()); return [z.x,z.y,z.z]; },show:()=>show(),body:v=>{ onBody=v; return show(); },thumbs:()=>TH.size,q:s=>{ q=s; return draw(); }};
    return {toggle}; };
}
