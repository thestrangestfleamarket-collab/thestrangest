// THE SPOT CODE (owner, 7 Nov 2026: "add a # to screen that will give you the precise spot in game with the right angle im looking from"): a # under the map copies a code of where you are (place, height, level, inside, facing), the view (kind, turn, tilt, zoom, pan), the hour and the weather; ?spot=<code> starts the game there (071 puts you there, this sets the view).
import {SHARED} from './003-shx.js';
import {DN, pos, ROOMS, UI, WX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {FADE, SECTION, SYS} from './006-map-pre.js';
import {SPOT0} from './071-main-11.js';
const SPOT={};
{ const f2=v=>Math.round(v*100)/100, f4=v=>Math.round(v*1e4)/1e4;
  SPOT.make=()=>{ const o={x:f2(pos.x),z:f2(pos.z),y:f2(SHARED.py),h:f4(SHARED.heading),lv:SHARED.floor,v:UI.view,yw:f4(SHARED.yaw),pt:f4(SHARED.pitch),pp:f4(SHARED.ppu||0),d:f2(UI.dist||0),fz:f2(UI.fz||1),
      of:[f2(UI.off.x),f2(UI.off.y),f2(UI.off.z)],sec:SECTION.id,hr:f2(DN.clockH?DN.clockH():0),wx:WX.now&&WX.kind?WX.kind(WX.now):''};
    try{ o.in=ROOMS.offIn()||''; }catch(e){} try{ o.lvl=SHARED.LVL||''; }catch(e){}
    return 'S1'+btoa(JSON.stringify(o)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); };
  const put=o=>{ if(!o)return; if(o.v&&UI.view!==o.v)UI.setView(o.v); if(Number.isFinite(o.yw))SHARED.yaw=SHARED.yawTo=o.yw; if(Number.isFinite(o.pt))SHARED.pitch=SHARED.pitchTo=o.pt;
    if(o.pp>0)SHARED.ppu=SHARED.ppuTo=o.pp; if(o.d>0)UI.dist=UI.distTo=o.d; if(o.fz>0)UI.fz=o.fz; if(Array.isArray(o.of))UI.off.set(o.of[0]||0,o.of[1]||0,o.of[2]||0); UI.hold=o.v==='iso'; };
  // what moved in a second (owner, 11 Nov 2026: "find what's moving"): every frame the camera, you, the picture's size, the passes' numbers, the lights and every drawn thing are read; what changed goes in the code as mv
  const flat=(o,pre,U)=>{ for(const k in U){ const v=U[k]&&U[k].value; if(typeof v==='number')o[pre+k]=v; else if(v&&v.toArray&&!v.isMatrix4&&!v.isMatrix3&&!v.isTexture){ const A=v.toArray(); if(A.length<=4)A.forEach((x,i)=>{ o[pre+k+i]=x; }); } } };
  const tag=m=>{ let t=m.name||m.type, q=m.parent, n=0; const u=Object.keys(m.userData||{}).slice(0,3).join('.'); if(u)t+='{'+u+'}'; while(q&&n++<3){ if(q.name)t+='<'+q.name; q=q.parent; } return t+(m.isInstancedMesh?'#'+m.count:'')+'/'+(m.geometry&&m.geometry.attributes.position?m.geometry.attributes.position.count:0); };
  SPOT.watch=(ms=1000)=>new Promise(res=>{ const cam=SHARED.cam, L=[], M=[], S=[], t0=performance.now(), W=window; let root=cam; while(root.parent)root=root.parent; if(!root.isScene&&SHARED.RPASS)root=SHARED.RPASS.scene;
    root.traverse(m=>{ if(m.isLight)L.push(m); else if((m.isMesh||m.isPoints||m.isLine)&&M.length<20000)M.push(m); });
    const O=M.map(()=>({v:0,m:0,i:0,d:0,lv:null,lm:null,li:null,ld:null}));
    const step=()=>{ const o={}, c=cam.position, q=cam.quaternion, e=cam.projectionMatrix.elements, rt=SHARED.composer&&SHARED.composer.renderTarget1;
      Object.assign(o,{cx:c.x,cy:c.y,cz:c.z,qx:q.x,qy:q.y,qz:q.z,qw:q.w,fov:cam.fov||0,p0:e[0],p5:e[5],p8:e[8],p9:e[9],x:pos.x,z:pos.z,y:SHARED.py,yaw:SHARED.yaw,pit:SHARED.pitch,hd:SHARED.heading,rw:rt?rt.width:0,rh:rt?rt.height:0,rk:SHARED.RESK||1,ppu:SHARED.ppu||0,lod:SHARED.lodK||0});
      try{ if(W.DFOG)flat(o,'fog.',W.DFOG.pass.uniforms); if(W.LOOK&&W.LOOK.sp)flat(o,'look.',W.LOOK.sp.uniforms); if(W.PS2&&W.PS2.sp)flat(o,'ps2.',W.PS2.sp.uniforms); if(W.PEEK){ o.pk=W.PEEK.k; o.pw=W.PEEK.w||0; } const bg=root.background; if(bg&&bg.isColor){ o.bgr=bg.r; o.bgg=bg.g; o.bgb=bg.b; } }catch(er){}
      L.forEach((l,i)=>{ const k='L'+i+l.type.slice(0,3); o[k+'i']=l.visible?l.intensity:0; o[k+'c']=l.color.r+l.color.g*3+l.color.b*7; o[k+'p']=l.position.x+l.position.y*3+l.position.z*7; if(l.groundColor)o[k+'g']=l.groundColor.r+l.groundColor.g*3+l.groundColor.b*7; });
      S.push(o);
      M.forEach((m,i)=>{ const r=O[i], w=m.matrixWorld.elements, mm=w[12]+w[13]*3+w[14]*7+w[0]*11+w[5]*13+w[10]*17, iv=m.instanceMatrix?m.instanceMatrix.version+(m.instanceColor?m.instanceColor.version:0)+m.count*1e6:0, dr=m.geometry?m.geometry.drawRange.count+(m.geometry.attributes.position?m.geometry.attributes.position.version:0):0; let vis=m.visible, a=m.parent; while(vis&&a){ vis=a.visible; a=a.parent; }
        if(r.lv!==null){ if(vis!==r.lv)r.v++; if(Math.abs(mm-r.lm)>1e-6)r.m++; if(iv!==r.li)r.i++; if(dr!==r.ld)r.d++; } r.lv=vis; r.lm=mm; r.li=iv; r.ld=dr; });
      if(performance.now()-t0<ms){ requestAnimationFrame(step); return; }
      const g=v=>+v.toPrecision(6), ch={}; for(const k in S[0]){ let lo=1e99, hi=-1e99, n=0, p=S[0][k]; for(const s of S){ const v=s[k]; if(v===undefined)continue; if(v<lo)lo=v; if(v>hi)hi=v; if(v!==p)n++; p=v; } if(hi-lo>1e-9*Math.max(1,Math.abs(hi)))ch[k]=[g(lo),g(hi),n]; }
      const V=new cam.position.constructor(), G=new Map(); M.forEach((m,i)=>{ const r=O[i]; if(!(r.v||r.m||r.i||r.d))return; m.getWorldPosition(V); const d=Math.round(V.distanceTo(cam.position)); let top=null, q=m.parent; while(q){ if(q.name)top=q; q=q.parent; } const k=top?top.name:tag(m), g=G.get(k)||G.set(k,[k,d,0,0,0,0,0]).get(k); g[1]=Math.min(g[1],d); g[2]+=r.v; g[3]+=r.m; g[4]+=r.i; g[5]+=r.d; g[6]++; }); const ob=[...G.values()].sort((a,b)=>(b[2]+b[4]+b[5]>0)-(a[2]+a[4]+a[5]>0)||a[1]-b[1]);   // each: what, metres off, times shown/hidden, moved, copies rewritten, redrawn, meshes
      res({n:S.length,ms:Math.round(performance.now()-t0),ch,nob:ob.length,ob:ob.slice(0,120)}); }; requestAnimationFrame(step); });
  SPOT.put=put;
  if(SPOT0)SYS.onStart(()=>{ let n=0; const go=()=>{ if(FADE&&FADE.busy&&n++<40)return setTimeout(go,250); put(SPOT0); setTimeout(()=>put(SPOT0),600); }; setTimeout(go,800); },'162fb-spot');
  const b=document.createElement('button'); b.id='hspot'; b.textContent='#'; b.title='copy this exact spot and view (paste it to Claude)';
  const css=document.createElement('style'); css.textContent='#hspot{font:11px Silkscreen,monospace;color:#7de0a4;background:#00000066;border:1px solid #2d5a40;padding:1px 6px;margin-left:6px;cursor:pointer;pointer-events:auto} #hspot:hover{color:#f2c14e;border-color:#f2c14e}';
  document.head.appendChild(css);
  b.onclick=async e=>{ e.stopPropagation(); SAY('WATCHING WHAT MOVES FOR A SECOND...','#7de0a4'); let mv=null; try{ mv=await SPOT.watch(1000); }catch(er){} let c=SPOT.make(); if(mv)try{ const o=JSON.parse(atob(c.slice(2).replace(/-/g,'+').replace(/_/g,'/'))); o.mv=mv; c='S1'+btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }catch(er){} let ok=false; try{ await navigator.clipboard.writeText(c); ok=true; }catch(er){}
    if(!ok)try{ prompt('YOUR SPOT', c); }catch(er){} SAY(ok?'SPOT COPIED. PASTE IT TO CLAUDE.':'SPOT: '+c,'#7de0a4'); };
  const place=()=>{ const xy=document.getElementById('hmxy'); if(!xy){ setTimeout(place,500); return; } xy.parentNode.insertBefore(b,xy.nextSibling); };
  place();
  window.SPOT=SPOT; }
