// THE VEHICLE EDITOR: VLOOK, every vehicle's look as the owner sets it in ADMIN > VEHICLE EDITOR (its size, the colours it is painted in, each part hidden, sized, moved or tinted), a copy of a car parked where you stand, more of a vehicle in the traffic; one shared file (/shared/vlooks.json), the same for everyone.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, ITEMS, ONLINE, pos, RIDE, TEXT, VLOOK} from './003b-systems.js';
import {renderer} from './004-main.js';
import {MAPFILE, MODS, SYS, TILE} from './006-map-pre.js';
{ const FILE='/shared/vlooks.json', V3=THREE.Vector3, esc=TEXT.esc, web=/^https?:$/.test(location.protocol);
  VLOOK.looks={}; VLOOK.more={};
  const BASE=new WeakMap(), ORIG=new WeakMap(), KEYS=new WeakMap(), OWN=new WeakSet(), CC=new THREE.Color(), V=new V3();
  const hex=n=>(n>>>0).toString(16).padStart(6,'0').slice(-6), qk=h=>hex(h&0xf8f8f8);
  // a vehicle's meshes, each by its path: the groups it sits in (by name, else place) and its place among its siblings
  const parts=o=>{ const out=[]; const walk=(n,path)=>n.children.forEach((c,i)=>{ const p=path+(path?'/':'')+(c.name||i); if(c.isMesh)out.push({key:p,m:c}); walk(c,p); }); walk(o,''); return out; };
  VLOOK.parts=parts;
  const origCol=m=>{ if(!ORIG.has(m))ORIG.set(m,m.color?m.color.getHex():null); return ORIG.get(m); };
  const origArr=a=>{ if(!ORIG.has(a))ORIG.set(a,Float32Array.from(a.array)); return ORIG.get(a); };
  const keysOf=a=>{ let k=KEYS.get(a); if(k)return k; const o=origArr(a); k=new Int32Array(o.length/3); for(let i=0;i<k.length;i++){ CC.setRGB(o[i*3],o[i*3+1],o[i*3+2]); k[i]=CC.getHex()&0xf8f8f8; } KEYS.set(a,k); return k; };
  // what it was made as: its scale, and each part's place, size and how a move in the vehicle's own frame turns into its parent's
  const base=o=>{ let B=BASE.get(o); if(B)return B; o.updateMatrixWorld(true); const inv=o.matrixWorld.clone().invert(), box=new THREE.Box3(), bb=new THREE.Box3(), M4=new THREE.Matrix4();
    const P=parts(o).map(p=>{ const m=p.m; if(m.geometry&&m.geometry.attributes.position){ if(!m.geometry.boundingBox)m.geometry.computeBoundingBox(); bb.copy(m.geometry.boundingBox).applyMatrix4(M4.multiplyMatrices(inv,m.matrixWorld)); box.union(bb); }
      const toP=new THREE.Matrix3().setFromMatrix4(M4.multiplyMatrices(inv,m.parent.matrixWorld).invert()); return {...p,pos:m.position.clone(),scl:m.scale.clone(),toP}; });
    B={s:o.scale.clone(),parts:P,sz:box.isEmpty()?new V3(1,1,1):box.getSize(new V3())}; BASE.set(o,B); return B; };
  // a part's own materials and colours, the first time its colour changes
  const own=m=>{ if(OWN.has(m))return; OWN.add(m); const one=x=>{ origCol(x); const c=x.clone(); ORIG.set(c,ORIG.get(x)); return c; };
    m.material=Array.isArray(m.material)?m.material.map(one):one(m.material);
    const a=m.geometry&&m.geometry.attributes.color; if(a){ const o0=origArr(a), k0=keysOf(a); m.geometry=m.geometry.clone(); const b=m.geometry.attributes.color; ORIG.set(b,o0); KEYS.set(b,k0); } };
  VLOOK.apply=o=>{ const id=o.userData.vlook, L=VLOOK.looks[id]||{}, B=base(o), pal=L.pal||{}, P=L.parts||{}, np=Object.keys(pal).length;
    o.scale.copy(B.s).multiplyScalar(+L.s>0?+L.s:1);
    for(const p of B.parts){ const m=p.m, q=P[p.key]||{}, U=m.userData;
      if(q.h){ m.visible=false; U.vlH=1; } else if(U.vlH){ m.visible=true; delete U.vlH; }
      const mv=!!(q.s||q.x||q.y||q.z); if(mv||U.vlM){ m.scale.copy(p.scl).multiplyScalar(q.s||1); V.set((q.x||0)*B.sz.x,(q.y||0)*B.sz.y,(q.z||0)*B.sz.z).applyMatrix3(p.toP); m.position.copy(p.pos).add(V); U.vlM=mv; }
      if(np||q.c)own(m); if(!OWN.has(m))continue;
      for(const mt of [].concat(m.material)){ const h=ORIG.get(mt); if(h==null||!mt.color)continue; const t=q.c||(!mt.vertexColors&&pal[qk(h)]); mt.color.setHex(t?parseInt(t,16):h); }
      const a=m.geometry.attributes.color, o0=a&&ORIG.get(a); if(o0){ const k=keysOf(a), arr=a.array, T={}; for(const f in pal){ CC.setHex(parseInt(pal[f],16)); T[parseInt(f,16)]=[CC.r,CC.g,CC.b]; }
        for(let i=0;i<k.length;i++){ const t=np&&T[k[i]], j=i*3; if(t){ arr[j]=t[0]; arr[j+1]=t[1]; arr[j+2]=t[2]; } else { arr[j]=o0[j]; arr[j+1]=o0[j+1]; arr[j+2]=o0[j+2]; } } a.needsUpdate=true; } } };
  // the colours a vehicle is painted in, most used first
  VLOOK.palette=o=>{ const n=new Map(), add=(k,c)=>n.set(k,(n.get(k)||0)+c);
    for(const {m} of parts(o)){ for(const mt of [].concat(m.material))if(mt&&mt.color&&!mt.vertexColors){ const h=origCol(mt); if(h!=null)add(h&0xf8f8f8,300); } const a=m.geometry&&m.geometry.attributes.color; if(a)for(const k of keysOf(a))add(k,1); }
    return [...n.entries()].sort((a,b)=>b[1]-a[1]).slice(0,18).map(e=>hex(e[0])); };
  // a look changed: every vehicle of it made again, then whoever keeps copies of them (the traffic, the parked cars) told
  let tq=null, pend=new Set();
  const changed=id=>{ for(const o of VLOOK.live)if(!id||o.userData.vlook===id)VLOOK.apply(o); pend.add(id||'*'); clearTimeout(tq);
    tq=setTimeout(()=>{ const one=pend.size===1&&!pend.has('*')?[...pend][0]:null; pend=new Set(); for(const f of VLOOK.fn)try{ f(one); }catch(e){ console.warn('VLOOK',e); } },150); };
  VLOOK.set=(id,L)=>{ if(L&&Object.keys(L).length)VLOOK.looks[id]=L; else delete VLOOK.looks[id]; changed(id); };

  /* ---------- the shared file: looks and the traffic's extra vehicles, the owner's to write ---------- */
  const H6=/^[0-9a-f]{6}$/, num=(v,a,b)=>{ v=+v; return isFinite(v)&&v>=a&&v<=b?Math.round(v*1000)/1000:null; };
  const clean=j=>{ const looks={}, more={}; if(!j||typeof j!=='object')return {looks,more};
    for(const id of Object.keys(j.looks||{}).slice(0,400)){ const L=j.looks[id], o={}; if(!/^[\w:.-]{1,60}$/.test(id)||!L||typeof L!=='object')continue;
      const s=num(L.s,.5,2); if(s&&s!==1)o.s=s;
      const pal={}; for(const k of Object.keys(L.pal||{}).slice(0,32))if(H6.test(k)&&H6.test(L.pal[k]))pal[k]=L.pal[k]; if(Object.keys(pal).length)o.pal=pal;
      const P={}; for(const k of Object.keys(L.parts||{}).slice(0,300)){ const q=L.parts[k], r={}; if(k.length>120||!q||typeof q!=='object')continue; if(q.h)r.h=1; const ps=num(q.s,.2,3); if(ps&&ps!==1)r.s=ps;
        for(const a of 'xyz'){ const v=num(q[a],-.5,.5); if(v)r[a]=v; } if(H6.test(q.c))r.c=q.c; if(Object.keys(r).length)P[k]=r; } if(Object.keys(P).length)o.parts=P;
      if(Object.keys(o).length)looks[id]=o; }
    for(const k of Object.keys(j.more||{}).slice(0,60)){ const n=Math.floor(+j.more[k]); if(/^[\w-]{1,40}$/.test(k)&&n>0&&n<=20)more[k]=n; }
    return {looks,more}; };
  const take=j=>{ const c=clean(j); VLOOK.looks=c.looks; VLOOK.more=c.more; changed(null); draw(); };
  const get=()=>fetch(FILE,{credentials:'same-origin'}).then(r=>r.ok&&r.status!==204?r.json():null).then(take).catch(()=>{});
  const post=(f,body)=>fetch(f,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(body)}).then(async r=>{ const o=await r.json().catch(()=>({})); if(!r.ok||!o.ok)throw new Error(o.why||r.status); });
  const told=()=>{ if(ONLINE.put&&ONLINE.on)ONLINE.put('veh',Date.now()); };
  VLOOK.save=()=>post(FILE,clean({looks:VLOOK.looks,more:VLOOK.more})).then(told);
  VLOOK.load=get;

  /* ---------- parked copies: new cars in the map's live edits (newcars), where the map keeps its cars ---------- */
  const patch=()=>fetch(MAPFILE,{credentials:'same-origin'}).then(r=>r.status===200?r.json():null).then(j=>j&&j.v===1&&j.set&&typeof j.set==='object'?j:{v:1,set:{}});
  const copies=()=>[...((MODS.cars&&MODS.cars.cars)||new Map()).values()].filter(C=>/^m\d+$/.test(C.id));
  VLOOK.park=model=>{ const C0=MODS.cars; if(!C0||!C0.add)return Promise.reject(new Error('the cars are not here yet'));
    const B=SHARED.BOD, h=SHARED.heading, d=7*TILE, x=pos.x+Math.sin(h)*d, z=pos.z+Math.cos(h)*d, n=Math.max(0,...[...C0.cars.keys()].map(k=>/^m(\d+)$/.test(k)?+k.slice(1):0))+1;
    const c={id:'m'+n,model,x:+B.MX(x).toFixed(2),y:+B.MY(z).toFixed(2),hd:Math.round(h*180/Math.PI)}; C0.add(c);
    if(!web)return Promise.resolve(c);
    return patch().then(P=>{ const L=Array.isArray(P.set.newcars)?P.set.newcars:[]; L.push(c); P.set.newcars=L; return post(MAPFILE,P); }).then(()=>{ told(); return c; }); };
  VLOOK.unpark=id=>{ if(MODS.cars&&MODS.cars.remove)MODS.cars.remove(id); if(!web)return Promise.resolve();
    return patch().then(P=>{ P.set.newcars=(P.set.newcars||[]).filter(c=>c&&c.id!==id); return post(MAPFILE,P); }).then(told); };
  const syncCars=()=>patch().then(P=>{ const C0=MODS.cars; if(!C0||!C0.add)return; const L=(P.set.newcars||[]).filter(c=>c&&/^m\d+$/.test(c.id)), ids=new Set(L.map(c=>c.id));
    for(const c of L)C0.add(c); for(const C of copies())if(!ids.has(C.id))C0.remove(C.id); }).catch(()=>{});
  if(web)SYS.onStart(get,'150pd-vedit');
  let lastV=null; SYS.add('world',(k,v)=>{ if(k==='veh'&&v!==lastV){ lastV=v; if(web){ get(); syncCars(); } } },'150pd-vedit');

  /* ---------- the editor: every vehicle in a list, the one picked turning in a little studio, its look's controls under it ---------- */
  const W=360, Hh=240, ROOM=new THREE.Scene(), PIV=new THREE.Group(), cam=new THREE.PerspectiveCamera(30,W/Hh,.01,500), SP=new THREE.Sphere(), BX=new THREE.Box3();
  { const k=new THREE.DirectionalLight(0xfff4e2,2.2), f=new THREE.DirectionalLight(0xbcd0ff,.8); k.position.set(-3,4,4); f.position.set(4,1,-3); ROOM.add(new THREE.AmbientLight(0xffffff,.9),k,f,PIV); }
  const HL=new THREE.Box3Helper(new THREE.Box3(),0xffd04a); HL.visible=false; ROOM.add(HL);
  let host=null, cur=null, obj=null, part='', say='', rt=null, px=null, g2=null, im=null, yaw=-.7, pitch=.3, drag=null, last=0, R=1;
  const ridesIn=()=>{ for(const id of (ITEMS.ids?ITEMS.ids():[])){ const g=ITEMS.prop(id,'grants'), k=g&&RIDE.kinds[g]; if(!k||k.world||k.noLook||VLOOK.kinds[id])continue;
    VLOOK.kind(id,{name:(FORAGE.NM&&FORAGE.NM[id])||String(ITEMS.prop(id,'name')||id).toUpperCase(),grp:'RIDES',make:()=>VLOOK.dress(id,k.make(id))}); } };
  const drop=()=>{ if(!obj)return; PIV.remove(obj); VLOOK.live.delete(obj); obj.traverse(c=>{ if(c.isMesh&&OWN.has(c)){ c.geometry.dispose(); for(const m of [].concat(c.material))m.dispose(); } }); obj=null; HL.visible=false; };
  const frame=()=>{ if(!obj)return; PIV.rotation.set(0,0,0); obj.position.set(0,0,0); obj.updateMatrixWorld(true); BX.setFromObject(obj); if(BX.isEmpty())return; BX.getBoundingSphere(SP); obj.position.sub(SP.center); R=Math.max(.01,SP.radius); };
  const pick=id=>{ drop(); cur=id; part=''; const K=VLOOK.kinds[id]; let o=null; try{ o=K&&K.make(); }catch(e){ console.warn('VLOOK make',id,e); }
    if(o){ obj=o; obj.position.set(0,0,0); obj.rotation.set(0,0,0); obj.traverse(c=>{ c.frustumCulled=false; }); PIV.add(obj); frame(); } draw(); };
  const look=()=>VLOOK.looks[cur]||(VLOOK.looks[cur]={});
  const edit=f=>{ const L=look(); f(L); if(L.pal&&!Object.keys(L.pal).length)delete L.pal; if(L.parts){ for(const k in L.parts)if(!Object.keys(L.parts[k]).length)delete L.parts[k]; if(!Object.keys(L.parts).length)delete L.parts; }
    VLOOK.set(cur,Object.keys(L).length?L:null); frame(); say='NOT SAVED YET'; const s=host&&host.querySelector('.vsay'); if(s)s.textContent=say; };
  const S='font:inherit;background:#0e1016;color:var(--fg,#d8dae2);border:2px solid #3a3f4e;padding:3px 6px';
  const slider=(f,lo,hi,st,v,lab)=>'<div class="row"><span>'+lab+'</span><input type="range" data-f="'+f+'" min="'+lo+'" max="'+hi+'" step="'+st+'" value="'+v+'" style="--p:'+((v-lo)/(hi-lo)*100).toFixed(1)+'%"><span class="dim" data-v="'+f+'" style="min-width:3.5em;text-align:right">'+(+v).toFixed(2)+'</span></div>';
  const draw=()=>{ if(!host||!host.isConnected)return; ridesIn(); const K=VLOOK.kinds, groups={};
    for(const id in K)(groups[K[id].grp]=groups[K[id].grp]||[]).push(id);
    const list=Object.keys(groups).map(g=>'<h3>'+esc(g)+'</h3>'+groups[g].map(id=>'<button class="btn" data-pick="'+esc(id)+'" aria-pressed="'+(id===cur)+'" style="display:block;width:100%;text-align:left;margin:2px 0">'+esc(K[id].name)+(VLOOK.looks[id]?' ✎':'')+'</button>').join('')).join('');
    let right='<div class="dim">PICK A VEHICLE</div>';
    if(cur&&K[cur]){ const k=K[cur], L=VLOOK.looks[cur]||{}, only=!!k.colour;
      right='<b style="color:#f2c14e">'+esc(k.name)+'</b><canvas class="vcv" width="'+W+'" height="'+Hh+'" style="display:block;width:100%;max-width:'+W+'px;aspect-ratio:3/2;margin:6px 0;background:#15171e;cursor:grab;touch-action:none"></canvas><div class="dim">DRAG TO TURN IT</div>';
      if(!obj)right+='<div class="dim">IT IS NOT IN THE GAME YET HERE (GO NEAR IT ONCE)</div>';
      if(!only)right+=slider('s',.5,2,.05,L.s||1,'SIZE');
      if(obj){ const pal=VLOOK.palette(obj), P=L.pal||{};
        right+='<h3>COLOURS</h3><div style="display:flex;flex-wrap:wrap;gap:6px">'+pal.map(h=>'<label title="#'+h+'" style="display:flex;flex-direction:column;align-items:center;gap:2px"><input type="color" data-pal="'+h+'" value="#'+(P[h]||h)+'" style="width:34px;height:26px;padding:0;border:2px solid '+(P[h]?'#f2c14e':'#3a3f4e')+';background:none"></label>').join('')+'</div>';
        if(!only){ const ps=parts(obj), q=(L.parts||{})[part]||{};
          right+='<h3>PARTS</h3><select data-part style="'+S+';max-width:100%"><option value="">PICK A PART ('+ps.length+')</option>'+ps.map(p=>'<option value="'+esc(p.key)+'"'+(p.key===part?' selected':'')+'>'+esc(p.key.replace(/\//g,' · '))+((L.parts||{})[p.key]?' ✎':'')+'</option>').join('')+'</select>';
          if(part)right+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0"><button class="btn" data-act="hide" aria-pressed="'+!!q.h+'">'+(q.h?'HIDDEN':'SHOWN')+'</button><label class="row" style="gap:6px"><span>TINT</span><input type="color" data-tint value="#'+(q.c||'ffffff')+'" style="width:34px;height:26px;padding:0;background:none;border:2px solid #3a3f4e"></label><button class="btn" data-act="untint">NO TINT</button></div>'
            +slider('ps',.2,3,.05,q.s||1,'PART SIZE')+slider('x',-.5,.5,.01,q.x||0,'MOVE ACROSS')+slider('y',-.5,.5,.01,q.y||0,'MOVE UP')+slider('z',-.5,.5,.01,q.z||0,'MOVE ALONG')+'<div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0"><button class="btn" data-act="unpart">RESET THIS PART</button></div>'; } }
      if(k.park||k.traffic){ right+='<h3>COPIES</h3>';
        if(k.park){ const cs=copies().filter(C=>C.model===k.park); right+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0"><button class="btn" data-act="park">PARK A COPY IN FRONT OF YOU</button></div>'+cs.map(C=>'<div class="row"><span>COPY '+esc(C.id.toUpperCase())+'</span><button class="btn" data-unpark="'+esc(C.id)+'">REMOVE</button></div>').join(''); }
        if(k.traffic){ const n=VLOOK.more[k.traffic]||0; right+='<div class="row"><span>MORE IN THE TRAFFIC: '+n+'</span><span><button class="btn" data-act="less">−</button> <button class="btn" data-act="more">+</button></span></div>'; } }
      right+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0"><button class="btn" data-act="reset">RESET THIS ONE</button></div>'; }
    host.innerHTML='<h3>VEHICLE EDITOR</h3><div class="dim">every vehicle in the game; what you change shows at once, SAVE FOR EVERYONE keeps it for every player</div><div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0"><button class="btn" data-act="save">SAVE FOR EVERYONE</button><button class="btn" data-act="undo">UNDO UNSAVED</button></div><div class="dim vsay">'+esc(say)+'</div>'
      +'<div style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap"><div style="flex:0 0 190px;max-height:60vh;overflow:auto">'+list+'</div><div style="flex:1 1 300px;min-width:0">'+right+'</div></div>';
    const cv=host.querySelector('.vcv'); g2=null; if(cv){ g2=cv.getContext('2d'); im=g2.createImageData(W,Hh);
      cv.onpointerdown=e=>{ drag={x:e.clientX,y:e.clientY}; cv.setPointerCapture(e.pointerId); }; cv.onpointermove=e=>{ if(!drag)return; yaw+=(e.clientX-drag.x)*.012; pitch=Math.max(-1.2,Math.min(1.2,pitch+(e.clientY-drag.y)*.012)); drag={x:e.clientX,y:e.clientY}; };
      cv.onpointerup=cv.onpointercancel=()=>{ drag=null; }; } };
  const shot=()=>{ if(!obj||!g2)return; if(!rt){ rt=new THREE.WebGLRenderTarget(W,Hh); rt.texture.colorSpace=THREE.SRGBColorSpace; px=new Uint8Array(W*Hh*4); }
    if(!drag)yaw+=.01; PIV.rotation.set(pitch,yaw,0,'XYZ'); PIV.updateMatrixWorld(true);
    const pm=part&&parts(obj).find(p=>p.key===part); if(pm){ HL.box.setFromObject(pm.m); HL.visible=!HL.box.isEmpty(); } else HL.visible=false;
    const d=R/Math.sin(cam.fov*Math.PI/360)*.8; cam.position.set(0,0,d); cam.near=Math.max(.001,d-R*3); cam.far=d+R*3; cam.lookAt(0,0,0); cam.updateProjectionMatrix();
    const cc=new THREE.Color(); renderer.getClearColor(cc); const ca=renderer.getClearAlpha(); renderer.setRenderTarget(rt); renderer.setClearColor(0x15171e,1); renderer.clear(); renderer.render(ROOM,cam); renderer.setRenderTarget(null); renderer.setClearColor(cc,ca);
    renderer.readRenderTargetPixels(rt,0,0,W,Hh,px); for(let y=0;y<Hh;y++)im.data.set(px.subarray((Hh-1-y)*W*4,(Hh-y)*W*4),y*W*4); g2.putImageData(im,0,0); };
  SYS.add('win',t=>{ if(!host||!g2||!host.isConnected||!host.offsetParent||t-last<66)return; last=t; shot(); },'150pd-vedit');
  const tell=p=>p.then(()=>{ say='SAVED FOR EVERYONE'; },e=>{ say='NOT SAVED: '+String(e&&e.message||e).toUpperCase(); }).then(draw);
  let bound=null;
  VLOOK.panel=el=>{ host=el; draw(); if(bound===el)return; bound=el;
    el.addEventListener('input',e=>{ const t=e.target; if(!cur)return;
      if(t.dataset.f){ const v=+t.value, f=t.dataset.f; const s=el.querySelector('[data-v="'+f+'"]'); if(s)s.textContent=v.toFixed(2); t.style.setProperty('--p',((v-t.min)/(t.max-t.min)*100)+'%');
        edit(L=>{ if(f==='s'){ if(v===1)delete L.s; else L.s=v; return; } if(!part)return; const P=L.parts=L.parts||{}, q=P[part]=P[part]||{}, k=f==='ps'?'s':f; if(v===(k==='s'?1:0))delete q[k]; else q[k]=v; }); }
      else if(t.dataset.pal){ const f=t.dataset.pal, v=t.value.slice(1); edit(L=>{ const P=L.pal=L.pal||{}; if(v===f)delete P[f]; else P[f]=v; }); t.style.borderColor='#f2c14e'; }
      else if(t.matches('[data-tint]')){ const v=t.value.slice(1); edit(L=>{ const P=L.parts=L.parts||{}, q=P[part]=P[part]||{}; if(v==='ffffff')delete q.c; else q.c=v; }); } });
    el.addEventListener('change',e=>{ const t=e.target; if(t.matches('[data-part]')){ part=t.value; draw(); } });
    el.addEventListener('click',e=>{ const b=e.target.closest('[data-pick],[data-act],[data-unpark]'); if(!b)return;
      if(b.dataset.pick){ pick(b.dataset.pick); return; }
      if(b.dataset.unpark){ say='TAKING IT AWAY...'; tell(VLOOK.unpark(b.dataset.unpark)); return; }
      const a=b.dataset.act, k=VLOOK.kinds[cur];
      if(a==='save'){ say='SAVING...'; draw(); tell(VLOOK.save()); return; }
      if(a==='undo'){ say='BACK TO WHAT IS SAVED'; if(web)get(); else take({}); return; }
      if(!cur)return;
      if(a==='reset'){ VLOOK.set(cur,null); frame(); say='NOT SAVED YET'; draw(); }
      else if(a==='hide'&&part){ edit(L=>{ const P=L.parts=L.parts||{}, q=P[part]=P[part]||{}; if(q.h)delete q.h; else q.h=1; }); draw(); }
      else if(a==='untint'&&part){ edit(L=>{ const q=L.parts&&L.parts[part]; if(q)delete q.c; }); draw(); }
      else if(a==='unpart'&&part){ edit(L=>{ if(L.parts)delete L.parts[part]; }); draw(); }
      else if(a==='park'&&k&&k.park){ say='PARKING A COPY...'; draw(); tell(VLOOK.park(k.park)); }
      else if((a==='more'||a==='less')&&k&&k.traffic){ const n=Math.max(0,Math.min(20,(VLOOK.more[k.traffic]||0)+(a==='more'?1:-1))); if(n)VLOOK.more[k.traffic]=n; else delete VLOOK.more[k.traffic]; changed(null); say='NOT SAVED YET'; draw(); } });
    for(const ev of ['keydown','keyup'])el.addEventListener(ev,e=>{ if(e.target.matches('input,select'))e.stopPropagation(); }); };
}
