// SPRAY PAINT: a can from the bodega (ordered on your computer, the drone brings it) holds 256 colours; SPRAY it from the pack, pick a colour on the grid, hold the mouse on a wall or floor to paint; every tag is the block's shared world (kept for all), and the can runs out.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, LEVELS, ONLINE, pos, SFX, SPRAY, W3} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer, scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {SECTION, SYS, TILE} from './006-map-pre.js';
{
  const T=TILE, V3=THREE.Vector3, DOTS=20000, PER={spray_silver:900,spray_gold:900}, say=(t,c)=>SAY(t,c||'#c8c2b0');
  FORAGE.add({names:{spray_silver:'SPRAY PAINT, SILVER',spray_gold:'SPRAY PAINT, GOLD'},prices:{spray_silver:6,spray_gold:14}});
  const COL=[]; { const c=new THREE.Color(); for(let i=0;i<256;i++){ const r=i>>4, k=i&15; if(r===0)c.setHSL(0,0,k/15); else c.setHSL(k/16,.85,.18+(r-1)/14*.68); COL.push(c.getHex()); } }
  SPRAY.COL=COL; Object.assign(SPRAY,{on:false,id:'',c:0x25,w:.045*T});
  const geo=new THREE.CircleGeometry(1,10), mat=new THREE.MeshBasicMaterial({color:0xffffff,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,fog:false}), IM=new THREE.InstancedMesh(geo,mat,DOTS);
  IM.count=0; IM.frustumCulled=false; IM.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(DOTS*3),3); IM.userData.spray=true; scene.add(LEVELS.own?LEVELS.own(IM,'*'):IM); SPRAY.mesh=IM;
  const M4=new THREE.Matrix4(), Q=new THREE.Quaternion(), S3=new V3(), Z=new V3(0,0,1), tmp=new V3();
  const put=(p,n,w,col)=>{ if(IM.count>=DOTS)return; const i=IM.count++; M4.compose(tmp.copy(p).addScaledVector(n,.006),Q.setFromUnitVectors(Z,n),S3.set(w,w,1)); IM.setMatrixAt(i,M4); IM.setColorAt(i,col); IM.instanceMatrix.needsUpdate=true; IM.instanceColor.needsUpdate=true; };
  const basis=n=>{ const u=Math.abs(n.y)<.9?new V3(0,1,0):new V3(1,0,0); const a=new V3().crossVectors(n,u).normalize(), b=new V3().crossVectors(n,a).normalize(); return [a,b]; };
  const mine=new Set(), C=new THREE.Color();
  const drawTag=t=>{ const o=new V3(...t.o), n=new V3(...t.n).normalize(), [a,b]=basis(n), p=String(t.p).split(',').map(Number); C.setHex(COL[t.c]||0xffffff); for(let i=0;i+1<p.length;i+=2)put(o.clone().addScaledVector(a,p[i]/100).addScaledVector(b,p[i+1]/100),n,t.w,C); };
  SYS.add('world',(k,v)=>{ if(!k.startsWith('tag:')||typeof v!=='string'||mine.has(k))return; try{ drawTag(JSON.parse(v)); }catch(e){} },'159f-spray');
  // a tag cleaned off (the park's rovers, 150ph): its word cleared for everyone, the dots drawn again from the tags left
  SPRAY.wipe=(x,z,r)=>{ const W=ONLINE.world||{}; let n=0; for(const k in W){ if(!k.startsWith('tag:')||!W[k])continue; try{ const t=JSON.parse(W[k]); if(Math.hypot(t.o[0]-x,t.o[2]-z)<r){ ONLINE.put(k,''); W[k]=''; mine.delete(k); n++; } }catch(e){} }
    if(n){ IM.count=0; for(const k in W)if(k.startsWith('tag:')&&W[k])try{ drawTag(JSON.parse(W[k])); }catch(e){} IM.instanceMatrix.needsUpdate=true; } return n; };
  const S=()=>{ try{ return JSON.parse(OWNED.get('spray')||'{}'); }catch(e){ return {}; } };
  SPRAY.left=id=>{ const s=S(); return s[id]==null?PER[id]||0:s[id]; }; const use=(id,n)=>{ const s=S(); s[id]=Math.max(0,SPRAY.left(id)-n); OWNED.set('spray',JSON.stringify(s)); return s[id]; };
  const sp=document.createElement('div'); sp.id='sprayp'; sp.hidden=true;
  sp.style.cssText='position:fixed;right:18px;top:18px;z-index:21;width:300px;padding:12px;box-sizing:border-box;font:11px Silkscreen,monospace;color:#ece5d3;background:rgba(16,18,26,.92);border:2px solid #2a2e3a;zoom:var(--uiz,1)';
  document.body.appendChild(sp); sp.addEventListener('keydown',e=>{ if(e.key==='Escape')SPRAY.close(); e.stopPropagation(); }); sp.addEventListener('keyup',e=>e.stopPropagation());
  const hex=i=>'#'+COL[i].toString(16).padStart(6,'0');
  const draw=()=>{ '@later'; if(sp.hidden)return; const L=SPRAY.left(SPRAY.id), pc=Math.round(L/(PER[SPRAY.id]||1)*100);
    sp.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="color:#f2c14e;font-size:13px">${SPRAY.id==='spray_gold'?'GOLD':'SILVER'} SPRAY PAINT</span><span style="color:#8a8a92">256 COLOURS</span><button class="pX" style="font:inherit;color:#c9ccd6;background:#0e1016;border:2px solid #3a3f4e;padding:2px 6px;cursor:pointer">X</button></div>
      <div style="display:grid;grid-template-columns:repeat(16,16px);gap:1px;background:#0b0d12;padding:3px">${COL.map((c,i)=>`<div data-c="${i}" tabindex="0" role="button" title="${i}" style="width:16px;height:16px;cursor:pointer;background-color:${hex(i)};${i===SPRAY.c?'outline:2px solid #fff;outline-offset:-1px':''}"></div>`).join('')}</div>
      <div style="display:flex;justify-content:space-between;margin-top:8px"><span>COLOUR <span style="display:inline-block;width:12px;height:12px;background:${hex(SPRAY.c)};vertical-align:middle"></span> 0x${SPRAY.c.toString(16).toUpperCase().padStart(2,'0')}</span><span>CAN <span style="color:${pc>20?'#7dffa8':'#e5403a'}">${pc}%</span></span></div>
      <div style="height:6px;background:#0b0d12;margin-top:4px"><div style="height:6px;width:${pc}%;background:#7dffa8"></div></div>
      <div style="display:flex;gap:6px;margin-top:8px;align-items:center"><span>WIDTH</span><input type="range" data-w="1" min="0.02" max="0.12" step="0.005" value="${(SPRAY.w/T).toFixed(3)}" style="flex:1"></div>
      <div style="color:#8a8a92;margin-top:8px;line-height:1.7">HOLD THE MOUSE ON A WALL OR THE FLOOR TO SPRAY<br>WHEEL: WIDTH · ESC: PUT THE CAN AWAY</div>`;
    sp.querySelector('.pX').onclick=()=>SPRAY.close(); sp.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{ SPRAY.c=+b.dataset.c; end(); draw(); }); sp.querySelector('[data-w]').oninput=e=>{ SPRAY.w=+e.target.value*T; }; };
  let cur=null, down=false;
  const end=()=>{ '@later'; if(cur&&cur.p.length){ const k='tag:'+(SECTION.id)+':'+Date.now().toString(36)+Math.random().toString(36).slice(2,5); mine.add(k);
      ONLINE.put(k,JSON.stringify({o:cur.o.toArray().map(v=>+v.toFixed(2)),n:cur.n.toArray().map(v=>+v.toFixed(3)),c:cur.c,w:+cur.w.toFixed(3),p:cur.p.map(v=>Math.round(v*100)).join(',')})); } cur=null; };
  const out=()=>{ say('THE CAN IS EMPTY. THE BODEGA SELLS MORE.','#e5403a'); FORAGE.take(SPRAY.id,1); FORAGE.draw(); SPRAY.close(); };
  SPRAY.at=(p,n)=>{ '@later'; if(!SPRAY.on)return false; if(SPRAY.left(SPRAY.id)<=0){ out(); return false; } n=n.clone().normalize();
    if(!cur||cur.n.dot(n)<.95||cur.p.length>=400||p.distanceTo(cur.o)>6*T){ end(); cur={o:p.clone(),n:n.clone(),c:SPRAY.c,w:SPRAY.w,p:[],ab:basis(n)}; }
    const d=p.clone().sub(cur.o), u=d.dot(cur.ab[0]), v=d.dot(cur.ab[1]), L=cur.p.length; if(L>=2&&Math.hypot(u-cur.p[L-2],v-cur.p[L-1])<cur.w*.45)return true;
    cur.p.push(u,v); C.setHex(COL[cur.c]); put(p,n,cur.w,C); if(use(SPRAY.id,1)<=0)out(); else if(cur.p.length%20===0)draw(); return true; };
  const cv=renderer.domElement, ray=new THREE.Raycaster();
  const hitAt=(x,y)=>{ '@later'; const r=cv.getBoundingClientRect(); ray.setFromCamera(new THREE.Vector2((x-r.left)/r.width*2-1,-((y-r.top)/r.height*2-1)),SHARED.cam); ray.far=14*T;
    const L=scene.children.filter(o=>o.visible&&o!==IM&&o!==W3.group&&!o.userData.blob&&!o.isSprite&&!o.isLight&&!o.isCamera); const h=ray.intersectObjects(L,true).find(h=>h.face&&h.object!==IM&&!h.object.isSprite&&!(h.object.material&&h.object.material.transparent&&h.object.material.opacity<.6)); if(!h)return null;
    if(Math.hypot(h.point.x-pos.x,h.point.z-pos.z)>4*T)return null; const n=h.face.normal.clone().transformDirection(h.object.matrixWorld).normalize(); if(n.dot(ray.ray.direction)>0)n.negate(); return {p:h.point,n}; };
  cv.addEventListener('pointerdown',e=>{ if(!SPRAY.on||e.button!==0)return; e.preventDefault(); e.stopImmediatePropagation(); down=true; const h=hitAt(e.clientX,e.clientY); if(h)SPRAY.at(h.p,h.n); },true);
  cv.addEventListener('pointermove',e=>{ if(!SPRAY.on||!down)return; e.stopImmediatePropagation(); const h=hitAt(e.clientX,e.clientY); if(h)SPRAY.at(h.p,h.n); },true);
  for(const t of ['pointerup','pointercancel'])addEventListener(t,()=>{ if(down){ down=false; end(); if(!sp.hidden)draw(); } },true);
  cv.addEventListener('click',e=>{ if(SPRAY.on){ e.stopImmediatePropagation(); e.preventDefault(); } },true); cv.addEventListener('dblclick',e=>{ if(SPRAY.on){ e.stopImmediatePropagation(); e.preventDefault(); } },true);
  cv.addEventListener('wheel',e=>{ if(!SPRAY.on)return; e.preventDefault(); e.stopImmediatePropagation(); SPRAY.w=Math.max(.02*T,Math.min(.12*T,SPRAY.w*(e.deltaY<0?1.15:.87))); draw(); },{capture:true,passive:false});
  addEventListener('keydown',e=>{ if(SPRAY.on&&e.key==='Escape'){ e.stopImmediatePropagation(); SPRAY.close(); } },true);
  SPRAY.open=id=>{ if(!FORAGE.has(id))return say('YOU HAVE NO SPRAY PAINT. THE BODEGA SELLS IT.','#c8a090'); SPRAY.id=id; SPRAY.on=true; sp.hidden=false; draw(); say('HOLD THE MOUSE ON A WALL TO SPRAY. ESC PUTS THE CAN AWAY.','#7dffa8'); SFX.play('click',{vol:.3}); };
  SPRAY.close=()=>{ if(down){ down=false; } end(); SPRAY.on=false; sp.hidden=true; };
  FORAGE.ACT.spray=id=>SPRAY.open(id); FORAGE.ROWB.push(id=>id.startsWith('spray_')?[['SPRAY','spray']]:[]);
  SPRAY.state=()=>({on:SPRAY.on,id:SPRAY.id,c:SPRAY.c,dots:IM.count,left:SPRAY.id?SPRAY.left(SPRAY.id):null,open:!sp.hidden});
  window.SPRAY=SPRAY;
}
