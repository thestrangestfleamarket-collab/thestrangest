// THE AVATAR DESIGNER (owner, 8 Nov 2026: "update the walker designer with the new avatar. make sure all the controls reall control the avatar"): your avatar in the studio, each part's SIZE, LENGTH, WIDTH and DEPTH and your HEIGHT, kept with your look so the other players see it.
import {THREE} from './003-shx.js';
import {PS2, W3} from './003b-systems.js';
import {renderer} from './004-main.js';
import {SYS} from './006-map-pre.js';
import {DESIGN} from './102b-designer.js';
import {BODIES} from './111a-bodies.js';
import {AVATAR} from './111c-avatar.js';
const DESIGNER={}; window.DESIGNER=DESIGNER;
{ const W=360, H=540, V=new THREE.Vector3(); let el=null, cv=null, g2=null, rt=null, cam=null, turn=0, zoom=1, part='head', sh={}, h=100, last=0, drag=null, timer=0;
  const P=()=>AVATAR.SHAPE, D=()=>AVATAR.DIMS, now=()=>sh[part]||[100,100,100,100];
  const css=`#avd{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:22;display:flex;gap:12px;padding:12px;background:#0b0d13f4;border:2px solid #2a3040;color:#d8dbe4;font:11px Silkscreen,monospace;letter-spacing:.4px;max-width:96vw;max-height:94vh}
    #avd canvas{display:block;height:min(${H}px,86vh);aspect-ratio:${W}/${H};background:#15171e;cursor:grab;touch-action:none;image-rendering:pixelated}
    #avd .s{width:260px;display:flex;flex-direction:column;gap:6px;overflow:auto} #avd h3{margin:6px 0 2px;font-size:10px;color:#8a8f9c;letter-spacing:1px}
    #avd .r{display:flex;flex-wrap:wrap;gap:4px;align-items:center} #avd button{font:inherit;color:inherit;background:#1a1f2b;border:2px solid #2a3040;padding:3px 6px;cursor:pointer}
    #avd button[aria-pressed=true]{border-color:#ffd27a;color:#ffd27a} #avd .d{display:grid;grid-template-columns:70px 1fr 44px;gap:4px;align-items:center}
    #avd input[type=range]{width:100%;accent-color:#ffd27a} #avd .v{text-align:right;color:#ffd27a} #avd .t{color:#ffd27a;font-size:13px;letter-spacing:1px}`;
  const build=()=>{ const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
    el=document.createElement('div'); el.id='avd'; el.hidden=true; el.tabIndex=-1; el.setAttribute('role','dialog'); el.setAttribute('aria-label','Avatar designer');
    el.innerHTML=`<canvas width="${W}" height="${H}" aria-label="your avatar: drag to turn, wheel to zoom"></canvas><div class="s"><div class="t">AVATAR DESIGNER</div>
      <div class="r" id="avdv"><button data-a="0">FRONT</button><button data-a="${Math.PI/2}">SIDE</button><button data-a="${Math.PI}">BACK</button></div>
      <h3>PART</h3><div class="r" id="avdp">${P().map(([k,n])=>`<button data-p="${k}">${n}</button>`).join('')}</div>
      <h3 id="avdn"></h3>${D().map((n,i)=>`<div class="d"><span>${n}</span><input type="range" min="50" max="150" step="1" data-i="${i}" aria-label="${n.toLowerCase()}"><span class="v" data-v="${i}"></span></div>`).join('')}
      <h3>WHOLE BODY</h3><div class="d"><span>HEIGHT</span><input type="range" min="90" max="110" step="1" id="avdh" aria-label="height"><span class="v" id="avdhv"></span></div>
      <div class="r" style="margin-top:8px"><button id="avdrp">RESET PART</button><button id="avdra">RESET ALL</button><button id="avdok">DONE</button></div></div>`;
    document.body.appendChild(el); cv=el.querySelector('canvas'); g2=cv.getContext('2d');
    el.addEventListener('keydown',e=>{ e.stopPropagation(); if(e.key==='Escape')DESIGNER.close(); }); el.addEventListener('keyup',e=>e.stopPropagation());
    el.querySelector('#avdv').onclick=e=>{ const b=e.target.closest('[data-a]'); if(b)turn=+b.dataset.a; };
    el.querySelector('#avdp').onclick=e=>{ const b=e.target.closest('[data-p]'); if(b){ part=b.dataset.p; draw(); } };
    el.querySelectorAll('[data-i]').forEach(r=>r.oninput=()=>{ const v=now().slice(); v[+r.dataset.i]=+r.value; set(part,v); });
    const hr=el.querySelector('#avdh'); hr.oninput=()=>{ h=+hr.value; draw(); push(); };
    el.querySelector('#avdrp').onclick=()=>set(part,null); el.querySelector('#avdra').onclick=()=>{ sh={}; h=100; draw(); push(true); };
    el.querySelector('#avdok').onclick=()=>DESIGNER.close();
    cv.addEventListener('pointerdown',e=>{ drag={x:e.clientX,a:turn}; cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; });
    cv.addEventListener('pointermove',e=>{ if(drag)turn=drag.a+(e.clientX-drag.x)*.012; });
    cv.addEventListener('pointerup',()=>{ drag=null; cv.style.cursor='grab'; });
    cv.addEventListener('wheel',e=>{ e.preventDefault(); zoom=Math.max(1,Math.min(4,zoom*(e.deltaY<0?1.15:1/1.15))); },{passive:false}); };
  // a part's values (null: back to as it was), on the avatar a moment after the last change
  const set=(k,v)=>{ if(!v||v.every(x=>x===100))delete sh[k]; else sh[k]=v; draw(); push(); };
  const push=fast=>{ clearTimeout(timer); const go=()=>AVATAR.set({sh:Object.keys(sh).length?JSON.parse(JSON.stringify(sh)):null,h}); if(fast)go(); else timer=setTimeout(go,120); };
  const draw=()=>{ if(!el)return; el.querySelectorAll('#avdp [data-p]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.p===part)));
    el.querySelector('#avdn').textContent=(P().find(x=>x[0]===part)||['',''])[1]; const v=now();
    el.querySelectorAll('[data-i]').forEach(r=>{ r.value=v[+r.dataset.i]; }); el.querySelectorAll('[data-v]').forEach(s=>{ s.textContent=v[+s.dataset.v]+'%'; });
    el.querySelector('#avdh').value=h; el.querySelector('#avdhv').textContent=h+'%'; };
  // the picture: you from where the view is turned, feet to head (zoomed: on the part you are shaping)
  const AT={head:.92,chest:.72,hips:.53,uarm:.7,farm:.58,hand:.47,thigh:.42,shin:.24,foot:.06};
  // how high and low you are as posed now (the body's points moved by their bones), not its rest
  const span=g=>{ const B=BODIES.by.avatar; let me=null; g.traverse(o=>{ if(!me&&o.isMesh&&B&&o.geometry===B.GEO)me=o; }); const PM=me&&me.userData.PM&&me.userData.PM.value; if(!PM)return null; me.updateMatrixWorld(true);
    const A=me.geometry.attributes, p=A.position.array, bi=A.bi.array, bw=A.bw.array, n=p.length/3, k=Math.max(1,Math.floor(n/1500)), e=me.matrixWorld.elements; let lo=1e9, hi=-1e9;
    for(let i=0;i<n;i+=k){ const a=PM[bi[i*2]|0].elements, c=PM[bi[i*2+1]|0].elements, w=bw[i], x=p[i*3], y=p[i*3+1], z=p[i*3+2], m=j=>a[j]*w+c[j]*(1-w);
      const X=m(0)*x+m(4)*y+m(8)*z+m(12), Yv=m(1)*x+m(5)*y+m(9)*z+m(13), Z=m(2)*x+m(6)*y+m(10)*z+m(14), wy=e[1]*X+e[5]*Yv+e[9]*Z+e[13]; if(wy<lo)lo=wy; if(wy>hi)hi=wy; }
    return hi>lo?[lo,hi]:null; };
  const shot=()=>{ const g=W3.group; if(!g||!W3.mesh)return; if(!rt){ rt=new THREE.WebGLRenderTarget(W,H); rt.texture.colorSpace=THREE.SRGBColorSpace; cam=new THREE.OrthographicCamera(-1,1,1,-1,.01,200); }
    g.updateMatrixWorld(true); const gp=g.getWorldPosition(V.clone()), Y=span(g), top=Y?Y[1]+.12:gp.y+2.2, bot=Y?Y[0]-.06:gp.y-.08, full=Math.max(.6,top-bot), hh=full/zoom, cy=zoom>1?bot+full*(AT[part]??.5):(top+bot)/2, ww=hh*W/H, a=g.rotation.y+turn;
    cam.left=-ww/2; cam.right=ww/2; cam.top=hh/2; cam.bottom=-hh/2; cam.updateProjectionMatrix(); cam.position.set(gp.x+Math.sin(a)*20,cy,gp.z+Math.cos(a)*20); cam.lookAt(gp.x,cy,gp.z); cam.updateMatrixWorld(true);
    DESIGN.portrait(rt,cam); const px=new Uint8Array(W*H*4); renderer.readRenderTargetPixels(rt,0,0,W,H,px); if(PS2.on)PS2.img(px,W,H,PS2.linesFor(cv.getBoundingClientRect().height||300));
    const im=g2.createImageData(W,H); for(let y=0;y<H;y++)im.data.set(px.subarray((H-1-y)*W*4,(H-y)*W*4),y*W*4); g2.putImageData(im,0,0); };
  SYS.add('win',t=>{ if(!DESIGNER.on||t-last<50)return; last=t; try{ shot(); }catch(e){ console.warn('DESIGNER',e); } },'111cb-designer');
  DESIGNER.open=()=>{ if(!el)build(); const L=AVATAR.L(); sh=L.sh?JSON.parse(JSON.stringify(L.sh)):{}; h=L.h||100; turn=0; zoom=1; draw(); el.hidden=false; DESIGNER.on=true; el.focus(); };
  DESIGNER.close=()=>{ if(!el)return; clearTimeout(timer); if(DESIGNER.on)push(true); el.hidden=true; DESIGNER.on=false; };
  DESIGNER.test={set:(k,v)=>set(k,v),push:()=>push(true),state:()=>({part,sh:JSON.parse(JSON.stringify(sh)),h,turn,zoom}),shot}; }
export {DESIGNER};
