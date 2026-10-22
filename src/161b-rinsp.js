// THE RENDER INSPECTOR: RINSP, the panel showing what is drawn, its triangles, materials and cost.
import {SHARED, THREE} from './003-shx.js';
import {CULL, LEVELS, NPCS, pos, RINSP, ROOMS, UI, W3} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {MAPG, STORE, TILE} from './006-map-pre.js';
import {BATCH} from './008-batch.js';
Object.assign(RINSP,{on:false,sel:null,f:''}); window.RINSP=RINSP;
{ const T=TILE, V=new THREE.Vector3(), P3=new THREE.Vector3(), V2=new THREE.Vector3(), M4=new THREE.Matrix4(), F=new THREE.Frustum(), BX=new THREE.Box3(), BU=new THREE.Box3();
  let el=null, iv=0, raf=0, fc=0, f0=0, n=0, hl=null, hlT=0, last=null, lastH=[];
  const esc=s=>String(s).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';'), kb=b=>b<1048576?(b/1024).toFixed(0)+'K':(b/1048576).toFixed(1)+'M';
  const mats=o=>Array.isArray(o.material)?o.material:o.material?[o.material]:[];
  const tris=o=>{ '@later'; const g=o.geometry; if(o.isSprite)return 2; if(!g||!g.attributes)return 0; const c=g.index?g.index.count:g.attributes.position?g.attributes.position.count:0, d=g.drawRange, k=Math.max(0,Math.min(c-d.start,d.count));
    return Math.round((o.isMesh?k/3:o.isPoints?k:o.isLineSegments?k/2:Math.max(0,k-1))*(o.isInstancedMesh?o.count:1)); };
  const calls=o=>Array.isArray(o.material)?(o.geometry.groups.length||1):1;
  const gb=g=>{ if(!g||!g.attributes)return 0; let b=g.index?g.index.array.byteLength:0; for(const k in g.attributes){ const a=g.attributes[k]; b+=(a.isInterleavedBufferAttribute?a.data.array:a.array).byteLength; } return b; };
  const texs=m=>{ const L=[], add=t=>{ if(t&&t.isTexture&&!L.includes(t))L.push(t); }; for(const k in m)add(m[k]); if(m.uniforms)for(const k in m.uniforms){ const u=m.uniforms[k]; if(u)add(u.value); } return L; };
  const tsz=t=>{ const i=t.image||{}, w=i.width||i.videoWidth||0, h=i.height||i.videoHeight||0; return [w,h,Math.round(w*h*4*(t.generateMipmaps&&t.minFilter!==THREE.NearestFilter&&t.minFilter!==THREE.LinearFilter?1.33:1))]; };
  const prog=m=>{ const p=renderer.properties.get(m).currentProgram; return p?p.name+' #'+p.id:''; };
  let NM=new Map(), RN=new Map(); const OP=new WeakMap();
  const names=()=>{ '@later'; NM=new Map(); RN=new Map(); for(const k in MAPG)NM.set(MAPG[k],'MAP '+k); for(const k in BATCH.meshes||{})NM.set(BATCH.meshes[k],'BATCH '+k);
    for(const N of NPCS)if(N.g)NM.set(N.g,'NPC '+(N.name||N.key)); for(const X of NPCS.extra||[])if(X&&X.g)NM.set(X.g,'NPC '+(X.name||X.key||'extra')); NM.set(W3.group,'YOU');
    for(const R of STORE.rooms||[])RN.set('store:'+R.id,R.name||R.id); };
  const objOf=o=>{ '@later'; const A=o.userData.objOf; if(!A)return null; let r=OP.get(o); if(r&&r.A===A)return r; const c=new Map(), w=new Map();
    for(const q of A)if(q){ c.set(q.place,(c.get(q.place)||0)+1); w.set(q,(w.get(q)||0)+1); } const pl=[...c.entries()].sort((a,b)=>b[1]-a[1]);
    r={A,top:pl.length?(RN.get(pl[0][0])||pl[0][0])+(pl.length>1?' +'+(pl.length-1):''):'',objs:[...w.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([q,k])=>(RN.get(q.place)||q.place)+':'+q.name+' '+k*2)}; OP.set(o,r); return r; };
  const label=o0=>{ '@later'; let o=o0.userData.cullOf||o0, leaf=null, top=null, bt=null; for(let q=o;q&&q!==scene;q=q.parent){ const k=NM.get(q); if(k){ if(k[0]==='M')top=top||k; else if(k[0]==='B')bt=bt||k; else leaf=leaf||k; } else if(!leaf&&q.name)leaf=q.name; }
    const r=objOf(o)||(o.parent&&objOf(o.parent)); if(!leaf&&(bt||r))leaf=(bt||'BATCH')+(r&&r.top?' · '+r.top:''); if(!leaf){ const m=mats(o)[0]; leaf=(o.parent&&o.parent!==scene&&o.parent.name?o.parent.name+' › ':'')+(o.geometry?o.geometry.type.replace('Geometry',''):o.type)+(m?' '+m.type.replace('Material',''):''); }
    if(o.userData.inner)leaf+=' (room part)'; return (top?top.slice(4)+' / ':'')+leaf; };
  const youIn=b=>pos.x>b.x0&&pos.x<b.x1&&pos.z>b.z0&&pos.z<b.z1&&SHARED.py>b.y0-.3&&SHARED.py<b.y1;
  const wbox=o=>{ if(o.isInstancedMesh){ if(!o.boundingBox)o.computeBoundingBox(); return BX.copy(o.boundingBox).applyMatrix4(o.matrixWorld); } const g=o.geometry; if(!g)return BX.makeEmpty(); if(!g.boundingBox)g.computeBoundingBox(); return BX.copy(g.boundingBox).applyMatrix4(o.matrixWorld); };
  const collect=full=>{ '@later'; names(); M4.multiplyMatrices(SHARED.cam.projectionMatrix,SHARED.cam.matrixWorldInverse); F.setFromProjectionMatrix(M4); P3.set(pos.x,SHARED.py,pos.z);
    const RB=ROOMS.boxes(), fg=scene.fog&&scene.fog.isFog?scene.fog:null, seen=new Set(), drawn=new Set(), rows=new Map(), progs=new Set(), lights=[];
    const TH=(UI.things||[]).filter(th=>th.obj&&th.obj.visible&&(!th.obj.parent||th.obj.parent.visible)&&LEVELS.drawn(th.obj)).map(th=>[th.name,th.obj.getWorldPosition(new THREE.Vector3()),th.near||th.reach||T]);
    scene.traverseVisible(o=>{ seen.add(o); if(o.isLight){ lights.push(o); return; } if(o.userData.rin||o.userData.cullOf||!(o.isMesh||o.isPoints||o.isLine||o.isSprite))return;
      const ms=mats(o); if(!ms.some(m=>m.visible)||!o.layers.test(SHARED.cam.layers))return; const R=CULL.M&&CULL.M.get(o); let tr=0, inV;
      if(R&&!R.off&&R.px.length){ inV=false; for(const p of R.px)if(F.intersectsObject(p)){ inV=true; tr+=tris(p); } } else { inV=o.isSprite||!o.geometry?true:F.intersectsObject(o); tr=tris(o); }
      if(o.frustumCulled&&!inV)return; drawn.add(o); for(const m of ms)progs.add(prog(m));
      const b=wbox(o), d=b.isEmpty()?o.getWorldPosition(V).distanceTo(P3):b.distanceToPoint(P3), why=[];
      if(!inV)why.push('OFFSCREEN NO-CULL'); if(d>60*T)why.push('FAR');
      if(!b.isEmpty()){ if(SHARED.LVL==='up'&&b.max.y<-.6)why.push('BELOW GROUND'); if(SHARED.LVL!=='up'&&b.min.y>.5)why.push('ABOVE YOU');
        for(const r of RB)if(b.min.x>r.x0-.2*T&&b.max.x<r.x1+.2*T&&b.min.z>r.z0-.2*T&&b.max.z<r.z1+.2*T&&b.min.y>r.y0-.5&&!youIn(r)){ why.push('SHUT IN '+(r.name||r.id||'ROOM')); break; }
        if(fg){ const c=b.getCenter(V).applyMatrix4(SHARED.cam.matrixWorldInverse), rad=b.getSize(V2).length()/2; if(-c.z-rad>fg.far)why.push('IN FOG'); } }
      let act=null; if(!b.isEmpty()&&b.max.distanceTo(b.min)<8*T)for(const [nm,p,r] of TH)if(b.distanceToPoint(p)<r){ act=nm; break; }
      const k=label(o); let w=rows.get(k); if(!w)rows.set(k,w={name:k,tris:0,calls:0,n:0,sh:0,dist:1e9,inView:false,why:new Set(),act:null,objs:[]});
      w.tris+=tr; w.calls+=calls(o); w.n++; if(o.castShadow)w.sh++; w.dist=Math.min(w.dist,d); w.inView=w.inView||inV; for(const y of why)w.why.add(y); if(act)w.act=act; if(w.objs.length<40)w.objs.push(o); });
    const out=[...rows.values()].map(w=>({...w,dist:+(w.dist/T).toFixed(1),why:[...w.why]})).sort((a,b)=>b.tris-a.tris), I=renderer.info, lit=lights.filter(l=>(l.isPointLight||l.isSpotLight)&&l.intensity>0);
    const head={fps:Math.round(RINSP.fps||0),ms:+(RINSP.ms||0).toFixed(1),calls:I.render.calls,tris:I.render.triangles,points:I.render.points,lines:I.render.lines,programs:(I.programs||[]).length,progsOnScreen:progs.size,
      geometries:I.memory.geometries,textures:I.memory.textures,lightsInScene:0,lightsLit:lit.length,shadows:lights.filter(l=>l.castShadow).map(l=>l.type.replace('Light','')+' '+(l.shadow&&l.shadow.mapSize?l.shadow.mapSize.x:'?')+(l.isPointLight?'x6':'')),
      lvl:SHARED.LVL,place:ROOMS.cur?(ROOMS.cur.name||ROOMS.cur.id||'room'):'',at:[+(pos.x/T).toFixed(1),+(pos.z/T).toFixed(1)],drawnObjs:drawn.size,drawnTris:out.reduce((a,w)=>a+w.tris,0),fog:fg?+(fg.far/T).toFixed(0):null};
    let hid=lastH; if(full){ const H=new Map(), gs=new Set(), ts=new Set(); let all=0, gB=0, tB=0;
      scene.traverse(o=>{ if(o.isLight){ head.lightsInScene++; return; } if(!(o.isMesh||o.isPoints||o.isLine)||o.userData.rin||o.userData.cullOf)return; const ms=mats(o), t=tris(o); all+=t;
        let g0=0, t0=0; if(o.geometry&&!gs.has(o.geometry)){ gs.add(o.geometry); g0=gb(o.geometry); gB+=g0; } for(const m of ms)for(const x of texs(m))if(!ts.has(x)){ ts.add(x); t0+=tsz(x)[2]; } tB+=t0;
        if(drawn.has(o)||!ms.some(m=>m.visible))return; const why=!seen.has(o)?'HIDDEN':!o.layers.test(SHARED.cam.layers)?(o.castShadow?'LAYER OFF, STILL CASTS SHADOW':'LAYER OFF'):'OUT OF VIEW';
        const k=label(o); let w=H.get(k); if(!w)H.set(k,w={name:k,tris:0,n:0,geoB:0,texB:0,why:new Set(),objs:[]}); w.tris+=t; w.n++; if(w.objs.length<40)w.objs.push(o); w.geoB+=g0; w.texB+=t0; w.why.add(why); });
      hid=lastH=[...H.values()].map(w=>({...w,why:[...w.why]})).sort((a,b)=>b.geoB+b.texB+b.tris*30-(a.geoB+a.texB+a.tris*30)); head.loadedTris=all; head.geoBytes=gB; head.texBytes=tB; RINSP.tot={all,gB,tB,L:head.lightsInScene}; }
    else if(RINSP.tot){ head.loadedTris=RINSP.tot.all; head.geoBytes=RINSP.tot.gB; head.texBytes=RINSP.tot.tB; head.lightsInScene=RINSP.tot.L; }
    return last={head,drawn:out,hidden:hid}; };
  const detail=w=>{ '@later'; if(!w)return ''; return w.objs.slice(0,6).map(o=>{ const ms=mats(o), r=objOf(o.userData.cullOf||o)||(o.parent&&objOf(o.parent));
      return '<div class="o">'+esc(o.type+(o.name?' "'+o.name+'"':'')+' · '+tris(o)+' tris'+(o.isInstancedMesh?' ('+o.count+' copies)':'')+' · shadow '+(o.castShadow?'CAST':'-')+'/'+(o.receiveShadow?'RECV':'-')+(o.frustumCulled?'':' · NEVER CULLED')+' · layers '+o.layers.mask+' · geo '+kb(gb(o.geometry)))+
        ms.map(m=>'<br>&nbsp;'+esc(m.type+(m.name?' "'+m.name+'"':'')+' · '+prog(m)+(m.customProgramCacheKey&&m.customProgramCacheKey()?' · key '+m.customProgramCacheKey().slice(0,60):'')+(m.transparent?' · transparent':''))+texs(m).map(t=>{ const [a,b,c]=tsz(t); return '<br>&nbsp;&nbsp;'+esc('texture '+a+'x'+b+' '+kb(c)); }).join('')).join('')+
        (r?'<br>&nbsp;'+esc('holds: '+r.objs.join(', ')):'')+'</div>'; }).join('')+(w.objs.length>6?'<div class="o">… '+(w.n-6)+' more</div>':''); };
  const mark=w=>{ '@later'; if(hl){ hl.removeFromParent(); hl.geometry.dispose(); hl.material.dispose(); hl=null; } if(!w)return; BU.makeEmpty(); for(const o of w.objs){ const b=wbox(o); if(!b.isEmpty())BU.union(b); } if(BU.isEmpty())return;
    hl=new THREE.Box3Helper(BU.clone(),0xff3df0); hl.material.depthTest=false; hl.material.transparent=true; hl.renderOrder=9999; hl.frustumCulled=false; hl.layers.mask=SHARED.cam.layers.mask; hl.userData.rin=1; scene.add(LEVELS.own(hl,'*')); hlT=performance.now()+5000; };
  const row=(w,i,h)=>'<tr data-i="'+i+'"'+(RINSP.sel===w.name?' class="s"':'')+'><td>'+esc(w.name)+(w.n>1?' <span class="d">×'+w.n+'</span>':'')+'</td><td>'+w.tris.toLocaleString()+'</td>'+
    (h?'<td>'+kb(w.geoB+w.texB)+'</td><td class="w">'+esc(w.why.join(', '))+'</td>':'<td>'+w.calls+'</td><td>'+(w.sh?'Y':'')+'</td><td>'+w.dist+'</td><td>'+(w.inView?'Y':'<b>N</b>')+'</td><td class="w">'+esc(w.why.join(', '))+(w.act?' <span class="a">USE: '+esc(w.act)+'</span>':'')+'</td>')+'</tr>';
  const draw=()=>{ '@later'; if(!el)return; const D=collect(n++%4===0), h=D.head, f=RINSP.f.toLowerCase(), ok=w=>!f||w.name.toLowerCase().includes(f)||w.why.join(' ').toLowerCase().includes(f), dr=D.drawn.filter(ok).slice(0,60), hd=D.hidden.filter(ok).slice(0,30);
    el.querySelector('.h').innerHTML=esc(h.fps+' FPS · '+h.ms+' MS · '+h.calls+' CALLS · '+h.tris.toLocaleString()+' TRIS'+(h.points?' · '+h.points+' PTS':'')+' (all passes)')+'<br>'+
      esc('PROGRAMS '+h.programs+' ('+h.progsOnScreen+' on screen) · GEOMETRIES '+h.geometries+' · TEXTURES '+h.textures)+'<br>'+
      esc('LIGHTS '+h.lightsInScene+' in scene, '+h.lightsLit+' lighting · SHADOWS '+(h.shadows.join(', ')||'none'))+'<br>'+
      esc('MAIN VIEW '+h.drawnObjs+' objects, '+h.drawnTris.toLocaleString()+' tris · LOADED '+(h.loadedTris||0).toLocaleString()+' tris, geo '+kb(h.geoBytes||0)+', tex '+kb(h.texBytes||0))+'<br>'+
      esc((h.lvl==='up'?'STREET':String(h.lvl).toUpperCase())+(h.place?' · '+h.place:'')+' · at '+h.at.join(',')+(h.fog!=null?' · fog '+h.fog+' tiles':''));
    el.querySelector('.t1').innerHTML='<tr><th>DRAWN</th><th>TRIS</th><th>CALLS</th><th>SHD</th><th>DIST</th><th>VIEW</th><th>NOTES</th></tr>'+dr.map(w=>row(w,D.drawn.indexOf(w),0)).join('');
    el.querySelector('.t2').innerHTML='<tr><th>NOT DRAWN</th><th>TRIS</th><th>MEMORY</th><th>WHY</th></tr>'+hd.map(w=>row(w,D.hidden.indexOf(w),1)).join('');
    const s=D.drawn.find(w=>w.name===RINSP.sel)||D.hidden.find(w=>w.name===RINSP.sel); el.querySelector('.dt').innerHTML=s?'<b>'+esc(s.name)+'</b>'+detail(s):'<span class="d">click a row to light it up and see its parts</span>';
    if(hl&&performance.now()>hlT)mark(null); };
  const pick=h=>e=>{ const tr=e.target.closest('tr[data-i]'); if(!tr||!last)return; const w=(h?last.hidden:last.drawn)[+tr.dataset.i]; if(!w)return; RINSP.sel=RINSP.sel===w.name?null:w.name; mark(RINSP.sel?w:null); draw(); };
  const make=()=>{ '@later'; const css=document.createElement('style'); css.textContent=`#rinsp{position:fixed;left:calc(12px + env(safe-area-inset-left,0px));top:12px;z-index:16;width:min(620px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;box-sizing:border-box;font:10px/1.5 var(--pixel);color:var(--fg);background:rgba(11,13,19,.94);border:2px solid var(--line);padding:8px 10px}
#rinsp[hidden]{display:none}#rinsp h3{font:inherit;font-size:11px;color:var(--key);margin:8px 0 4px}#rinsp h3:first-child{margin-top:0}#rinsp .h{font-variant-numeric:tabular-nums}#rinsp .d{color:var(--dim)}#rinsp .a{color:#7fe08a}
#rinsp input{font:inherit;color:var(--fg);background:#0e1016;border:2px solid #3a3f4e;padding:3px 6px;width:100%;box-sizing:border-box}#rinsp table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums}
#rinsp th{color:var(--dim);text-align:right;font-weight:normal;padding:2px 4px;border-bottom:1px solid var(--line)}#rinsp th:first-child,#rinsp td:first-child{text-align:left}#rinsp td{padding:2px 4px;border-bottom:1px solid #22252f;text-align:right;white-space:nowrap}
#rinsp td:first-child{max-width:210px;overflow:hidden;text-overflow:ellipsis}#rinsp td.w{white-space:normal;text-align:left;color:#f2a35e;max-width:170px}#rinsp tr[data-i]{cursor:pointer}#rinsp tr[data-i]:hover{background:#1a1d27}#rinsp tr.s{background:#2a1f33}
#rinsp .dt{margin:6px 0;padding:6px;border:1px solid var(--line);word-break:break-word}#rinsp .o{margin-top:4px;color:var(--dim)}`; document.head.appendChild(css);
    el=document.createElement('div'); el.id='rinsp'; el.hidden=true; el.innerHTML='<h3>RENDER INSPECTOR</h3><div class="h"></div><h3>FIND</h3><input placeholder="name or note (FAR, SHUT IN, FOG...)"><div class="dt"></div><table class="t1"></table><h3>LOADED BUT NOT DRAWN</h3><table class="t2"></table>';
    document.body.appendChild(el); const inp=el.querySelector('input'); inp.oninput=()=>{ RINSP.f=inp.value; draw(); }; el.querySelector('.t1').onclick=pick(0); el.querySelector('.t2').onclick=pick(1); };
  const loop=now=>{ raf=requestAnimationFrame(loop); fc++; if(!f0)f0=now; if(now-f0>=500){ RINSP.fps=fc*1000/(now-f0); RINSP.ms=(now-f0)/fc; fc=0; f0=now; } };
  RINSP.toggle=v=>{ const on=v===undefined?!RINSP.on:!!v; if(on===RINSP.on)return; RINSP.on=on; if(!el)make(); el.hidden=!on;
    if(on){ n=0; fc=0; f0=0; raf=requestAnimationFrame(loop); draw(); iv=setInterval(draw,500); } else { clearInterval(iv); cancelAnimationFrame(raf); mark(null); RINSP.sel=null; } };
  window.RENDERLIST=()=>{ const D=collect(true), strip=w=>{ const {objs,...r}=w; return r; }; return JSON.parse(JSON.stringify({head:D.head,drawn:D.drawn.map(strip),hidden:D.hidden.map(strip)})); }; }
