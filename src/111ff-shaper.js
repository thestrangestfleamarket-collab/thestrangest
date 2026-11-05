// THE DESIGNER (owner, 4 Nov 2026: "a fully fleshed out featured character designer", the Sims' options): DESIGN YOURSELF, your new body in the studio — BODY (start A–F and its 18 sliders), FACE (20), SKIN and HAIR (style; skin, hair and eye colours) now; CLOTHES and YOU next.
import {THREE} from './003-shx.js';
import {W3} from './003b-systems.js';
import {renderer} from './004-main.js';
import {DESIGN} from './102b-designer.js';
import {BODIES} from './111a-bodies.js';
import {SHAPES} from './111fe-playerbodies.js';
const SHAPER={on:false}; window.SHAPER=SHAPER;
{ const TABS=['BODY','FACE','SKIN','HAIR','CLOTHES','YOU'], FRAME=['HEIGHT','WEIGHT','MUSCLE','HEAD SIZE','NECK','SHOULDERS','ARM LENGTH','LEG LENGTH'];
  const FACE=[['HEAD',['HEAD WIDTH','HEAD HEIGHT','JAW','CHIN','CHEEKS']],['EYES',['EYE SIZE','EYE SPACING','EYE HEIGHT','EYE TILT']],['BROWS',['BROW HEIGHT','BROW TILT','BROW THICKNESS']],['NOSE',['NOSE WIDTH','NOSE LENGTH','NOSE TIP']],['MOUTH',['MOUTH WIDTH','LIPS','MOUTH HEIGHT']],['EARS',['EAR SIZE','EARS OUT']]];
  SHAPER.open=()=>{ '@later';
    if(!SHAPER.el)build(); SHAPER.el.hidden=false; SHAPER.on=true; SHAPER.redraw(); requestAnimationFrame(SHAPER.loop); };
  function build(){ '@later';
    const SW=480, SH=640, cam=new THREE.OrthographicCamera(-1,1,1,-1,.01,500), Y=new THREE.Vector3(0,1,0); let az=0, elv=.1, zoom=1, tab='BODY', last=0, drag=null, rt=null;
    const undo=[], redo=[]; let snap=null;
    const css=document.createElement('style'); css.textContent=`#shaper{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:22;display:flex;flex-direction:column;gap:8px;padding:12px;background:#0b0d13f4;border:2px solid #2a3040;color:#d8dbe4;font:11px Silkscreen,monospace;max-height:96vh}
      #shaper[hidden]{display:none} #shaper .sz-top{display:flex;gap:8px;align-items:center} #shaper .sz-t{color:#ffd27a;font-size:13px;letter-spacing:2px;margin-right:10px}
      #shaper button{font:inherit;color:inherit;background:#1a1f2b;border:2px solid #2a3040;padding:3px 7px;cursor:pointer} #shaper button[aria-pressed=true]{border-color:#ffd27a;color:#ffd27a}
      #shaper .sz-main{display:flex;gap:14px;min-height:0} #shaper canvas{display:block;height:min(${SH}px,74vh);aspect-ratio:${SW}/${SH};background:#a7adb2;cursor:grab;touch-action:none;image-rendering:pixelated}
      #shaper .sz-side{width:560px;display:flex;flex-direction:column;gap:6px;overflow:auto} #shaper h3{margin:6px 0 2px;font-size:11px;color:#cfe9d4;letter-spacing:2px;border-bottom:2px solid #2a3040;padding-bottom:3px;font-weight:normal}
      #shaper .sz-cols{display:flex;gap:18px} #shaper .sz-col{flex:1;display:flex;flex-direction:column;gap:4px} #shaper .sz-sl{display:grid;grid-template-columns:112px 1fr 44px;gap:6px;align-items:center}
      #shaper input[type=range]{width:100%;accent-color:#ffd27a} #shaper .sz-v{text-align:right;color:#8a8f9c} #shaper .row{display:flex;flex-wrap:wrap;gap:5px;align-items:center} #shaper .sz-sw{width:22px;height:22px;padding:0} #shaper input[type=color]{width:30px;height:24px;padding:0;border:2px solid #2a3040;background:#1a1f2b;cursor:pointer} #shaper .sz-note{color:#8a8f9c;font-size:10px;line-height:1.6}`;
    document.head.appendChild(css);
    const el=document.createElement('div'); el.id='shaper'; el.hidden=true; el.setAttribute('role','dialog'); el.setAttribute('aria-label','Design yourself');
    const sl=(n,i)=>`<div class="sz-sl"><span>${n}</span><input type="range" min="-1" max="1" step=".01" data-i="${i}"><span class="sz-v"></span></div>`;
    const names=()=>SHAPES.names.length?SHAPES.names:[...FRAME,'CHEST','WAIST','BELLY','HIPS','BOTTOM','UPPER ARMS','THIGHS','CALVES','HANDS','FEET'];
    el.innerHTML=`<div class="sz-top"><span class="sz-t">DESIGN YOURSELF</span>${TABS.map(t=>`<button data-tab="${t}">${t}</button>`).join('')}<button id="szx" style="margin-left:auto">X</button></div>
      <div class="sz-main"><div><div class="row" style="margin-bottom:4px">${['front','side','back','three'].map(v=>`<button data-view="${v}">${v==='three'?'¾':v.toUpperCase()}</button>`).join('')}</div>
        <canvas width="${SW}" height="${SH}" title="drag to turn, wheel to zoom"></canvas></div><div class="sz-side" id="szside"></div></div>
      <div class="row"><button id="szun">UNDO</button><button id="szre">REDO</button><button id="szra">RANDOM</button><button id="szrs">RESET</button><button id="szok" style="margin-left:auto;border-color:#ffd27a;color:#ffd27a">DONE</button></div>`;
    document.body.appendChild(el); SHAPER.el=el;
    const cv=el.querySelector('canvas'), g2=cv.getContext('2d'), side=el.querySelector('#szside');
    ['pointerdown','pointermove','pointerup','wheel','click','contextmenu','keydown','keyup'].forEach(t=>el.addEventListener(t,e=>e.stopPropagation()));
    addEventListener('keydown',e=>{ if(!SHAPER.on)return; e.stopPropagation(); if(e.key==='Escape'){ e.preventDefault(); close(); } },true);
    // the design you're shaping: its start and values; each finished change kept, undone and redone whole
    const cur=()=>SHAPES.mine||{k:(BODIES.pick()||'pA').slice(1,2),v:new Float32Array(SHAPES.NS),L:{}};
    const save=()=>{ const s=JSON.stringify({k:cur().k,v:[...cur().v],L:cur().L||{}}); if(s===snap)return; if(snap){ undo.push(snap); if(undo.length>100)undo.shift(); redo.length=0; } snap=s; };
    const put=(k,v,keep,L)=>{ SHAPES.set(k,v,L).then(()=>SHAPER.redraw(false)); if(keep)save(); SHAPER.redraw(false); };
    const loadS=s=>{ const d=JSON.parse(s); snap=s; put(d.k,d.v,false,d.L||{}); SHAPER.redraw(); };
    // colours: a row of swatches, the start's own, and any colour you pick
    const hex=c=>'#'+c.toString(16).padStart(6,'0'), SKIN=[0xf6dcc6,0xf0cdb0,0xe8c0a0,0xe2b498,0xd9a988,0xc99474,0xb98262,0xa8714f,0x9a6a4c,0x8a5a3e,0x7a4c34,0x6e4a36,0x5e3c2a,0x4e3022,0x3f261b], ODD=[0xa9c4a0,0xa4b8cc,0xc9b6d6,0xd8d2c4,0x9aa0a8];
    const HAIRC=[0x1e1714,0x2c221d,0x3d2b20,0x5b4636,0x6e4a32,0x8b6a48,0xb07a3c,0xc9a066,0xe0c98a,0x8a3a1e,0xb0502a,0x8e8a86,0xd8d6d0,0x3a5a9a,0x7a3a8a,0xc44a6a,0x4a8a5a], EYES=[0x21140e,0x4a3428,0x6a4a2a,0x5a6a3a,0x3d5a6a,0x3a6a9a,0x7a8a96,0x8a6a2a];
    const SK={skin:'skin',hairC:'hair',eyeC:'eye'};
    const pal=(n,h,cs,more)=>`<h3>${h}</h3><div class="row">${more?'':`<button data-c="${n}" data-v="">OWN</button>`}${cs.map(c=>`<button class="sz-sw" data-c="${n}" data-v="${c}" title="${hex(c)}" style="background:${hex(c)}"></button>`).join('')}${more?'':`<input type="color" data-c="${n}" title="any colour">`}</div>`;
    const look=(n,v)=>{ const c=cur(), L={...(c.L||{})}; if(v==null||v==='')delete L[n]; else L[n]=v; put(c.k,c.v,true,L); };
    const tabs={
      BODY:()=>`<h3>START FROM</h3><div class="row">${'ABCDEF'.split('').map(k=>{ const b=BODIES.by['p'+k]; return `<button data-start="${k}" title="${b?b.label:''}">${k} ${b?b.label.replace(/^THE /,''):''}</button>`; }).join('')}</div>
        <div class="sz-cols"><div class="sz-col"><h3>FRAME</h3>${names().slice(0,8).map((n,i)=>sl(n,i)).join('')}</div><div class="sz-col"><h3>SHAPE</h3>${names().slice(8,18).map((n,i)=>sl(n,i+8)).join('')}</div></div>
        <div class="sz-note">EACH START IS WHERE THE SLIDERS BEGIN: ITS HAIR AND CLOTHES COME WITH IT FOR NOW. YOUR DESIGN IS KEPT ON THE SERVER AND OTHER PLAYERS SEE IT.</div>`,
      FACE:()=>{ const col=gs=>`<div class="sz-col">${gs.map(([h,ns])=>`<h3>${h}</h3>`+ns.map(n=>sl(n,SHAPES.names.indexOf(n))).join('')).join('')}</div>`;
        return SHAPES.names.includes('HEAD WIDTH')?`<div class="sz-cols">${col(FACE.slice(0,3))}${col(FACE.slice(3))}</div><div class="sz-note">THE FACE SHAPES COME FROM YOUR START; SKIN, EYE AND HAIR COLOURS ARE NEXT.</div>`:`<h3>FACE</h3><div class="sz-note">LOADING…</div>`; },
      SKIN:()=>pal('skin','SKIN TONE',SKIN)+pal('skin','UNUSUAL',ODD,true)+`<div class="sz-note">LIPS FOLLOW YOUR SKIN.</div>`,
      HAIR:()=>`<h3>STYLE</h3><div class="row">${SHAPES.STYLES.map(st=>`<button data-style="${st}">${st.toUpperCase()}</button>`).join('')}</div>`+pal('hairC','HAIR COLOUR',HAIRC)+pal('eyeC','EYES',EYES)+`<div class="sz-note">BROWS FOLLOW YOUR HAIR.</div>`,
      other:t=>`<h3>${t}</h3><div class="sz-note">COMING NEXT.</div>`};
    SHAPER.redraw=(full=true)=>{ const c=cur();
      if(full){ side.innerHTML=tabs[tab]?tabs[tab]():tabs.other(tab);
        side.querySelectorAll('input[type=color]').forEach(inp=>{ inp.onchange=()=>look(inp.dataset.c,parseInt(inp.value.slice(1),16)); });
        side.querySelectorAll('input[type=range]').forEach(inp=>{ const i=+inp.dataset.i; inp.oninput=()=>{ const d=cur(), v=Float32Array.from(d.v); v[i]=+inp.value; put(d.k,v,false); }; inp.onchange=()=>save(); }); }
      el.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));
      el.querySelectorAll('[data-start]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.start===c.k)));
      const L=c.L||{}, own=SHAPES.start(c.k); side.querySelectorAll('button[data-c]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===''?L[b.dataset.c]==null:+b.dataset.v===L[b.dataset.c])));
      side.querySelectorAll('input[type=color]').forEach(i=>{ const v=L[i.dataset.c]!=null?L[i.dataset.c]:own[SK[i.dataset.c]]; if(v!=null)i.value=hex(v); });
      side.querySelectorAll('[data-style]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.style===(L.hair||own.style))));
      side.querySelectorAll('input[type=range]').forEach(inp=>{ const v=c.v[+inp.dataset.i]||0; if(document.activeElement!==inp)inp.value=v; inp.nextElementSibling.textContent=(v>0?'+':'')+Math.round(v*100); }); };
    el.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; const c=cur();
      if(b.dataset.tab){ setTab(b.dataset.tab); } else if(b.dataset.view)view(b.dataset.view);
      else if(b.dataset.c){ look(b.dataset.c,b.dataset.v===''?null:+b.dataset.v); } else if(b.dataset.style){ look('hair',b.dataset.style===SHAPES.start(c.k).style?null:b.dataset.style); }
      else if(b.dataset.start){ put(b.dataset.start,c.v,true,c.L); }
      else if(b.id==='szun'){ save(); if(undo.length){ redo.push(snap); loadS(undo.pop()); } } else if(b.id==='szre'){ if(redo.length){ undo.push(snap); loadS(redo.pop()); } }
      else if((b.id==='szra'||b.id==='szrs')&&(tab==='SKIN'||tab==='HAIR')){ const L={...(c.L||{})}, ks=tab==='SKIN'?['skin']:['hair','hairC','eyeC'], pick=a=>a[Math.floor(Math.random()*a.length)];
        for(const n of ks){ if(b.id==='szrs')delete L[n]; else L[n]=n==='skin'?pick(SKIN):n==='hair'?pick(SHAPES.STYLES):n==='hairC'?pick(HAIRC):pick(EYES); } put(c.k,c.v,true,L); }
      else if(b.id==='szra'||b.id==='szrs'){ const v=Float32Array.from(c.v); for(const i of mine())v[i]=b.id==='szrs'?0:Math.round((Math.random()*2-1)*Math.random()*70)/100; put(c.k,v,true,c.L); } else if(b.id==='szok'||b.id==='szx')close(); });
    // the sliders RANDOM and RESET change: the open tab's (BODY's first 18, FACE's after)
    const mine=()=>tab==='FACE'?FACE.flatMap(g=>g[1]).map(n=>SHAPES.names.indexOf(n)).filter(i=>i>=0):[...Array(18).keys()];
    const ZOOM={FACE:3.8,HAIR:3}, setTab=t=>{ if((ZOOM[t]||1)!==(ZOOM[tab]||1)){ zoom=ZOOM[t]||1; if(ZOOM[t])view('front'); } tab=t; SHAPER.redraw(); };
    const close=()=>{ save(); el.hidden=true; SHAPER.on=false; };
    // the view: you in the studio's light, turned and zoomed, drawn at the game's pixel size
    const view=v=>{ az={front:0,side:Math.PI/2,back:Math.PI,three:Math.PI/4}[v]||0; el.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===v))); };
    const TOPV=new WeakMap(), crown=()=>{ const me=W3.group.children.find(m=>m.isMesh&&m.visible&&m.userData.PM); if(!me)return null; const g=me.geometry, P=g.attributes.position, bi=g.attributes.bi; let t=TOPV.get(g);
      if(t==null||P.version!==g.userData.tv){ t=0; for(let i=1;i<P.count;i++)if(P.getY(i)>P.getY(t))t=i; TOPV.set(g,t); g.userData.tv=P.version; } const v=new THREE.Vector3().fromBufferAttribute(P,t); return v.applyMatrix4(me.userData.PM.value[Math.round(bi.getX(t))]).applyMatrix4(me.matrixWorld); };
    const frame=()=>{ const g=W3.group, gp=g.getWorldPosition(new THREE.Vector3()), c0=crown(), head=W3.eyeAt&&W3.eyeAt(new THREE.Vector3()), top=c0?c0.y+(c0.y-gp.y)*.04:(head?head.y:gp.y+2.2)+.35*(head?head.y-gp.y:2)/7, bot=gp.y-.06, h0=(top-bot)*1.1;
      const hh=h0/2/zoom, hw=hh*SW/SH, c=new THREE.Vector3(gp.x,(top+bot)/2+(1-1/zoom)*(top-bot)*.5,gp.z), d=h0*3+8, a=az+(g.rotation?g.rotation.y:0);
      cam.left=-hw; cam.right=hw; cam.top=hh; cam.bottom=-hh; cam.near=.01; cam.far=d*2+40; cam.updateProjectionMatrix();
      cam.position.set(c.x+Math.sin(a)*Math.cos(elv)*d,c.y+Math.sin(elv)*d,c.z+Math.cos(a)*Math.cos(elv)*d); cam.up.copy(Y); cam.lookAt(c); cam.updateMatrixWorld(true); };
    const small=document.createElement('canvas'), gs=small.getContext('2d');
    const shot=()=>{ const sh=Math.round(SH/2), sw=Math.round(SW/2); if(!rt){ rt=new THREE.WebGLRenderTarget(sw,sh); rt.texture.colorSpace=THREE.SRGBColorSpace; small.width=sw; small.height=sh; }
      frame(); DESIGN.portrait(rt,cam,null); const px=new Uint8Array(sw*sh*4); renderer.readRenderTargetPixels(rt,0,0,sw,sh,px);
      const im=gs.createImageData(sw,sh); for(let y=0;y<sh;y++)im.data.set(px.subarray((sh-1-y)*sw*4,(sh-y)*sw*4),y*sw*4); gs.putImageData(im,0,0); g2.imageSmoothingEnabled=false; g2.clearRect(0,0,SW,SH); g2.drawImage(small,0,0,SW,SH); };
    SHAPER.loop=t=>{ if(!SHAPER.on)return; requestAnimationFrame(SHAPER.loop); if(t-last<40)return; last=t; shot(); };
    cv.addEventListener('pointerdown',e=>{ cv.setPointerCapture(e.pointerId); drag={x:e.clientX,y:e.clientY}; cv.style.cursor='grabbing'; });
    cv.addEventListener('pointermove',e=>{ if(!drag)return; az-=(e.clientX-drag.x)*.012; elv=Math.max(-.5,Math.min(.8,elv+(e.clientY-drag.y)*.006)); drag={x:e.clientX,y:e.clientY}; });
    cv.addEventListener('pointerup',()=>{ drag=null; cv.style.cursor='grab'; });
    cv.addEventListener('wheel',e=>{ e.preventDefault(); zoom=Math.max(1,Math.min(6,zoom*Math.exp(-e.deltaY*.0015))); },{passive:false});
    view('front'); snap=JSON.stringify({k:cur().k,v:[...cur().v],L:cur().L||{}}); SHAPES.load(cur().k).then(()=>SHAPER.redraw());
    SHAPER.test={view,set:(i,v)=>{ const d=cur(), w=Float32Array.from(d.v); w[i]=v; put(d.k,w,true,d.L); },look,tab:t=>setTab(t)};
  }
  // YOU's button opens it while you wear one of the new bodies
  const b=document.getElementById('ldesign'); if(b){ b.textContent='DESIGN YOURSELF'; const old=b.onclick; b.onclick=e=>{ if(/^p[A-F]$/.test(BODIES.pick())){ const lp=document.getElementById('looks'); if(lp)lp.hidden=true; SHAPER.open(); } else if(old)old(e); }; }
}
