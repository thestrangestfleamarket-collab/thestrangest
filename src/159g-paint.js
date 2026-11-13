// THE PAINTER: paint and draw on a canvas from your pack, with brushes, pencil, airbrush, eraser, smudge, fill, shapes, an eyedropper, a colour picker, layers, undo and zoom (a copy shows its masterwork faintly over the canvas as a guide); finished, it is a painting to hang (DECORATE), give or sell.
import {SHARED} from './003-shx.js';
const PAINTER={}; window.PAINTER=PAINTER;
{
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v)), mk=(w,h)=>{ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; };
  const hex2=c=>'#'+c.map(v=>Math.round(v).toString(16).padStart(2,'0')).join(''), rgbOf=h=>{ h=String(h).replace('#',''); if(h.length===3)h=h.split('').map(c=>c+c).join(''); const n=parseInt(h,16); return isNaN(n)||h.length!==6?null:[n>>16&255,n>>8&255,n&255]; };
  const hsv2rgb=(h,s,v)=>{ const f=n=>{ const k=(n+h*6)%6; return v-v*s*Math.max(0,Math.min(k,4-k,1)); }; return [f(5),f(3),f(1)].map(x=>Math.round(x*255)); };
  const rgb2hsv=([r,g,b])=>{ r/=255; g/=255; b/=255; const M=Math.max(r,g,b), m=Math.min(r,g,b), d=M-m; let h=0; if(d){ h=M===r?((g-b)/d)%6:M===g?(b-r)/d+2:(r-g)/d+4; h/=6; if(h<0)h+=1; } return [h,M?d/M:0,M]; };
  const PALETTE=['#000000','#3b3b3b','#7a7a7a','#b9b9b9','#ffffff','#f4efe4','#5c2a1d','#8b4513','#c46a2b','#e8a33d','#f6d36b','#fff3b0',
    '#7a1020','#c0272d','#ef5b5b','#f7a1a1','#4a1f5c','#7d3c98','#b47cc7','#2a2470','#3f51b5','#6f8fe6','#a9c6f5','#0f4c5c',
    '#1a8a8a','#5fd0c8','#123d22','#2e7d32','#66bb6a','#b5e08a','#556b2f','#a8b06b','#3a2b20','#8d6e52','#d2b48c','#ffdbb5'];
  const TOOLS=[['brush','BRUSH','B'],['pencil','PENCIL','P'],['air','AIRBRUSH','A'],['erase','ERASER','E'],['smudge','SMUDGE','S'],['fill','FILL','G'],['line','LINE','L'],['rect','BOX','R'],['oval','OVAL','O'],['pick','EYEDROPPER','I'],['hand','HAND','H']];

  /* ---------- the state of the open painting ---------- */
  let P=null;   // {w,h,layers:[{n,cv,cx,vis,op}],cur,undo,redo,rec,...}
  const B={tool:'brush',col:[32,40,72],col2:[244,239,228],size:14,op:1,hard:.7,press:true,tol:40,fillShape:false,mirror:false};
  const hsv=rgb2hsv(B.col); let HSV=hsv;
  const layer=(n,w,h)=>{ const cv=mk(w,h); return {n,cv,cx:cv.getContext('2d',{willReadFrequently:true}),vis:true,op:1}; };

  /* ---------- the window ---------- */
  const ui=document.createElement('div'); ui.id='paintp'; ui.hidden=true; ui.setAttribute('role','dialog'); ui.setAttribute('aria-label','The painter');
  const st=document.createElement('style'); st.textContent=`
  #paintp{--g:#7dffa8;--g2:#3aa866;--gk:#020a06;--gb:#031a0d;--go:#d8ffe4;position:fixed;inset:0;z-index:45;display:grid;grid-template-columns:auto minmax(0,1fr) 270px;grid-template-rows:auto minmax(0,1fr);gap:8px;padding:8px;box-sizing:border-box;background:rgba(2,6,4,.94);font:13px/1.35 'Share Tech Mono',ui-monospace,monospace;letter-spacing:1px;color:var(--g);text-transform:uppercase;user-select:none}
  #paintp[hidden]{display:none}
  #paintp *{box-sizing:border-box}
  #paintp .pbar{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:6px;align-items:center;background:var(--gk);box-shadow:inset 0 0 0 2px var(--g2);padding:6px 8px}
  #paintp .pbar .pt{font-size:16px;letter-spacing:3px;margin-right:8px;color:var(--g)}
  #paintp .pbar .ps{color:var(--g2);margin-right:auto}
  #paintp button{font:inherit;color:var(--g);background:transparent;border:0;padding:5px 8px;cursor:pointer;text-transform:uppercase;letter-spacing:1px}
  #paintp button:hover,#paintp button[aria-pressed="true"]{color:var(--gk);background:var(--g)}
  #paintp button:disabled{color:#245c3a;background:transparent;cursor:default}
  #paintp button:focus-visible,#paintp input:focus-visible{outline:2px solid var(--go);outline-offset:1px}
  #paintp .ptools{display:flex;flex-direction:column;gap:2px;background:var(--gk);box-shadow:inset 0 0 0 2px var(--g2);padding:6px;overflow:auto}
  #paintp .ptools button{text-align:left;white-space:nowrap}
  #paintp .ptools button span{color:var(--g2);margin-left:6px}
  #paintp .ptools button[aria-pressed="true"] span{color:var(--gk)}
  #paintp .pview{position:relative;background:#16181c;box-shadow:inset 0 0 0 2px var(--g2);overflow:hidden;touch-action:none}
  #paintp .pview canvas{position:absolute;inset:0;width:100%;height:100%}
  #paintp .pside{display:flex;flex-direction:column;gap:8px;overflow:auto;min-width:0}
  #paintp .pbox{background:var(--gk);box-shadow:inset 0 0 0 2px var(--g2);padding:8px;display:grid;gap:6px}
  #paintp h4{font:inherit;font-size:11px;color:var(--g2);margin:0;letter-spacing:2px}
  #paintp .prow{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
  #paintp .prow label{color:var(--g2);min-width:64px}
  #paintp input[type=range]{flex:1;accent-color:var(--g);min-width:60px}
  #paintp input[type=text]{font:inherit;color:var(--go);background:var(--gb);border:0;box-shadow:inset 0 0 0 2px var(--g2);padding:4px 6px;text-transform:uppercase;letter-spacing:1px;min-width:0}
  #paintp .pnum{min-width:38px;text-align:right;color:var(--go);font-variant-numeric:tabular-nums}
  #paintp .psv{position:relative;width:100%;aspect-ratio:1.4;cursor:crosshair;touch-action:none}
  #paintp .phue{width:100%;height:14px;cursor:pointer;touch-action:none;display:block}
  #paintp .psw{display:grid;grid-template-columns:repeat(12,1fr);gap:2px}
  #paintp .psw button{aspect-ratio:1;padding:0;border:0;min-width:0}
  #paintp .psw button:hover{outline:2px solid #fff;outline-offset:-1px}
  #paintp .pcur{display:flex;align-items:center;gap:6px}
  #paintp .pcur i{display:block;width:30px;height:30px;box-shadow:0 0 0 2px var(--g2)}
  #paintp .pcur i+i{width:20px;height:20px;align-self:flex-end;margin-left:-14px}
  #paintp .play{display:grid;gap:2px;max-height:180px;overflow:auto}
  #paintp .play div{display:flex;align-items:center;gap:4px;padding:2px 4px;cursor:pointer;box-shadow:inset 0 0 0 1px #0d3a1f}
  #paintp .play div.on{box-shadow:inset 0 0 0 2px var(--g)}
  #paintp .play canvas{width:34px;height:26px;background:#888;flex:none;image-rendering:auto}
  #paintp .play span{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
  #paintp .pdlg{position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.6);z-index:2}
  #paintp .pdlg>div{background:var(--gk);box-shadow:inset 0 0 0 2px var(--g);padding:14px;display:grid;gap:10px;width:min(440px,92vw)}
  #paintp .phint{color:var(--g2);font-size:11px;line-height:1.5}
  @media (max-width:820px){#paintp{grid-template-columns:auto minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) 40%}#paintp .pside{grid-column:1/-1}#paintp .ptools button{padding:4px 5px}#paintp .ptools button span{display:none}}`;
  document.head.appendChild(st);
  ui.innerHTML=`<div class="pbar"><span class="pt">[ PAINT ]</span><span class="ps" id="pp-sub"></span>
    <button id="pp-undo" title="Ctrl+Z">UNDO</button><button id="pp-redo" title="Ctrl+Shift+Z">REDO</button><button id="pp-mirror" title="M">MIRROR</button><button id="pp-guide" title="U" hidden>GUIDE</button><button id="pp-fit" title="0">FIT</button><button id="pp-z" title="1">100%</button>
    <button id="pp-done">FINISH</button><button id="pp-close" title="Esc">SAVE & CLOSE</button></div>
    <div class="ptools" id="pp-tools" role="toolbar" aria-label="Tools"></div>
    <div class="pview" id="pp-view"><canvas id="pp-cv" aria-label="The painting"></canvas></div>
    <div class="pside">
      <div class="pbox"><h4>COLOUR</h4><div class="pcur"><i id="pp-c1" title="Colour"></i><i id="pp-c2" title="Second colour (X swaps)"></i><input type="text" id="pp-hex" maxlength="7" style="width:92px" aria-label="Colour as hex"><button id="pp-swap" title="X">SWAP</button></div>
        <canvas class="psv" id="pp-sv" width="240" height="172" aria-label="Saturation and brightness"></canvas><canvas class="phue" id="pp-hue" width="240" height="14" aria-label="Hue"></canvas>
        <div class="psw" id="pp-sw"></div><div class="psw" id="pp-recent" aria-label="Recent colours"></div></div>
      <div class="pbox" id="pp-brush"></div>
      <div class="pbox"><h4>LAYERS</h4><div class="play" id="pp-layers"></div>
        <div class="prow"><button id="pp-ladd">NEW</button><button id="pp-ldup">COPY</button><button id="pp-lup">UP</button><button id="pp-ldn">DOWN</button><button id="pp-lmerge">MERGE</button><button id="pp-ldel">DELETE</button></div>
        <div class="prow"><label for="pp-lop">OPACITY</label><input type="range" id="pp-lop" min="0" max="100"><span class="pnum" id="pp-lopn"></span></div></div>
      <div class="phint">B P A E S G L R O I H: TOOLS · [ ]: SIZE · X: SWAP · U: GUIDE · ALT+CLICK: PICK · SPACE OR RIGHT DRAG: MOVE · WHEEL: ZOOM · SHIFT: STRAIGHT</div>
    </div>`;
  document.body.appendChild(ui);
  const $=id=>ui.querySelector('#pp-'+id);
  const view=$('view'), cv=$('cv'), cx=cv.getContext('2d');

  /* ---------- drawing the view: checker, the layers, the stroke being made, the brush outline ---------- */
  const V={z:1,x:0,y:0,dpr:1,W:0,H:0}; let dirty=true, raf=0;
  const checker=(()=>{ const c=mk(16,16), x=c.getContext('2d'); x.fillStyle='#cfcfcf'; x.fillRect(0,0,16,16); x.fillStyle='#ececec'; x.fillRect(0,0,8,8); x.fillRect(8,8,8,8); return c; })();
  let chkPat=null, hover=null;
  const sizeView=()=>{ const r=view.getBoundingClientRect(); V.dpr=Math.min(2,devicePixelRatio||1); V.W=Math.max(1,r.width); V.H=Math.max(1,r.height); cv.width=Math.round(V.W*V.dpr); cv.height=Math.round(V.H*V.dpr); chkPat=cx.createPattern(checker,'repeat'); dirty=true; };
  const fit=()=>{ if(!P)return; sizeView(); V.z=Math.min((V.W-40)/P.w,(V.H-40)/P.h); V.x=(V.W-P.w*V.z)/2; V.y=(V.H-P.h*V.z)/2; dirty=true; bar(); };
  const zoomAt=(z,sx,sy)=>{ z=cl(z,.1,32); const px=(sx-V.x)/V.z, py=(sy-V.y)/V.z; V.z=z; V.x=sx-px*z; V.y=sy-py*z; dirty=true; bar(); };
  const toC=(e)=>{ const r=view.getBoundingClientRect(); return [(e.clientX-r.left-V.x)/V.z,(e.clientY-r.top-V.y)/V.z]; };
  const draw=()=>{ '@later'; raf=0; if(!P||ui.hidden)return; if(!dirty)return; dirty=false;
    cx.setTransform(V.dpr,0,0,V.dpr,0,0); cx.fillStyle='#16181c'; cx.fillRect(0,0,V.W,V.H);
    cx.save(); cx.translate(V.x,V.y); cx.fillStyle=chkPat; cx.fillRect(0,0,P.w*V.z,P.h*V.z); cx.restore();
    cx.imageSmoothingEnabled=V.z<2; cx.imageSmoothingQuality='high';
    P.layers.forEach((L,i)=>{ if(!L.vis)return; cx.globalAlpha=L.op; cx.drawImage(i===P.cur&&S.live?S.tmp:L.cv,V.x,V.y,P.w*V.z,P.h*V.z); }); cx.globalAlpha=1;
    const G=P.o.guide; if(G&&G.on&&G.img){ cx.globalAlpha=G.a; cx.drawImage(G.img,V.x,V.y,P.w*V.z,P.h*V.z); cx.globalAlpha=1; }
    cx.strokeStyle='rgba(0,0,0,.6)'; cx.lineWidth=1; cx.strokeRect(V.x-.5,V.y-.5,P.w*V.z+1,P.h*V.z+1);
    if(B.mirror){ cx.strokeStyle='rgba(125,255,168,.5)'; cx.setLineDash([6,6]); cx.beginPath(); cx.moveTo(V.x+P.w*V.z/2,V.y); cx.lineTo(V.x+P.w*V.z/2,V.y+P.h*V.z); cx.stroke(); cx.setLineDash([]); }
    if(hover&&['brush','pencil','air','erase','smudge'].includes(B.tool)){ const r=Math.max(1,B.size/2*V.z); cx.beginPath(); cx.arc(V.x+hover[0]*V.z,V.y+hover[1]*V.z,r,0,7); cx.strokeStyle='rgba(0,0,0,.7)'; cx.lineWidth=2; cx.stroke(); cx.strokeStyle='rgba(255,255,255,.9)'; cx.lineWidth=1; cx.stroke(); } };
  const redraw=()=>{ dirty=true; if(!raf)raf=requestAnimationFrame(draw); };
  new ResizeObserver(()=>{ if(!ui.hidden&&P){ const keep=V.W; sizeView(); if(!keep)fit(); redraw(); } }).observe(view);

  /* ---------- undo: the part of a layer an action changed, or the whole stack for layer actions ---------- */
  const pushUndo=(u)=>{ P.undo.push(u); if(P.undo.length>40)P.undo.shift(); P.redo.length=0; P.changed=true; bar(); };
  const snapRect=(li,x,y,w,h)=>{ x=cl(Math.floor(x),0,P.w); y=cl(Math.floor(y),0,P.h); w=cl(Math.ceil(w),0,P.w-x); h=cl(Math.ceil(h),0,P.h-y); if(!w||!h)return null; return {li,x,y,d:P.layers[li].cx.getImageData(x,y,w,h)}; };
  const snapAll=()=>({all:P.layers.map(L=>({n:L.n,vis:L.vis,op:L.op,d:L.cx.getImageData(0,0,P.w,P.h)})),cur:P.cur});
  const restore=u=>{ '@later'; if(u.all){ const back=snapAll(); P.layers=u.all.map(s=>{ const L=layer(s.n,P.w,P.h); L.vis=s.vis; L.op=s.op; L.cx.putImageData(s.d,0,0); return L; }); P.cur=cl(u.cur,0,P.layers.length-1); return back; }
    const L=P.layers[u.li]; if(!L)return null; const back={li:u.li,x:u.x,y:u.y,d:L.cx.getImageData(u.x,u.y,u.d.width,u.d.height)}; L.cx.putImageData(u.d,u.x,u.y); return back; };
  const undo=()=>{ const u=P&&P.undo.pop(); if(!u)return; const b=restore(u); if(b)P.redo.push(b); P.changed=true; panels(); redraw(); };
  const redo=()=>{ const u=P&&P.redo.pop(); if(!u)return; const b=restore(u); if(b)P.undo.push(b); P.changed=true; panels(); redraw(); };

  /* ---------- strokes: dabs go onto a stroke sheet at full strength, laid over the layer at the brush's opacity (so a stroke never darkens where it crosses itself) ---------- */
  const S={live:false,sheet:null,sx:null,tmp:null,tx:null,before:null,box:null,last:null,start:null,air:0,shift:false,pts:[]};
  const grow=(x,y,r)=>{ const b=S.box; b[0]=Math.min(b[0],x-r-2); b[1]=Math.min(b[1],y-r-2); b[2]=Math.max(b[2],x+r+2); b[3]=Math.max(b[3],y+r+2); };
  const css=c=>`rgb(${c[0]},${c[1]},${c[2]})`;
  const dab=(x,y,pr)=>{ '@later'; const t=B.tool, c=t==='erase'?[0,0,0]:B.col; let r=B.size/2*(B.press&&pr!=null?Math.max(.08,pr):1);
    const one=(x,y)=>{ const X=S.sx;
      if(t==='pencil'){ const s=Math.max(1,Math.round(r*2)); X.fillStyle=css(c); X.fillRect(Math.round(x-s/2),Math.round(y-s/2),s,s); grow(x,y,s); return; }
      if(t==='air'){ const n=Math.max(4,Math.round(r*r*.08)); X.fillStyle=css(c); for(let i=0;i<n;i++){ const a=Math.random()*6.283, d=Math.sqrt(Math.random())*r; X.globalAlpha=.25; X.fillRect(x+Math.cos(a)*d,y+Math.sin(a)*d,1,1); } X.globalAlpha=1; grow(x,y,r); return; }
      if(B.hard>=.98||r<1.5){ X.fillStyle=css(c); X.beginPath(); X.arc(x,y,Math.max(.5,r),0,7); X.fill(); }
      else { const g=X.createRadialGradient(x,y,r*B.hard,x,y,r); g.addColorStop(0,`rgba(${c[0]},${c[1]},${c[2]},1)`); g.addColorStop(1,`rgba(${c[0]},${c[1]},${c[2]},0)`); X.fillStyle=g; X.beginPath(); X.arc(x,y,r,0,7); X.fill(); }
      grow(x,y,r); };
    one(x,y); if(B.mirror)one(P.w-x,y); };
  const smudgeAt=(x,y,px,py)=>{ '@later'; const r=Math.max(2,B.size/2), L=P.layers[P.cur], s=Math.ceil(r*2), pc=S.patch||(S.patch=mk(256,256)), pcx=pc.getContext('2d');
    const go=(x,y,px,py)=>{ pcx.clearRect(0,0,s,s); pcx.drawImage(L.cv,px-r,py-r,s,s,0,0,s,s); L.cx.save(); L.cx.beginPath(); L.cx.arc(x,y,r,0,7); L.cx.clip(); L.cx.globalAlpha=.55*B.op; L.cx.drawImage(pc,0,0,s,s,x-r,y-r,s,s); L.cx.restore(); grow(x,y,r); grow(px,py,r); };
    go(x,y,px,py); if(B.mirror)go(P.w-x,y,P.w-px,py); };
  const along=(a,b,pr,f)=>{ const d=Math.hypot(b[0]-a[0],b[1]-a[1]), step=B.tool==='pencil'?.75:Math.max(.6,B.size*(B.tool==='air'?.35:.12)), n=Math.max(1,Math.ceil(d/step));
    for(let i=1;i<=n;i++){ const t=i/n; f(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,pr); } };
  const compose=()=>{ const L=P.layers[P.cur], X=S.tx; X.globalCompositeOperation='copy'; X.globalAlpha=1; X.drawImage(L.cv,0,0); X.globalCompositeOperation=B.tool==='erase'?'destination-out':'source-over'; X.globalAlpha=B.op; X.drawImage(S.sheet,0,0); X.globalCompositeOperation='source-over'; X.globalAlpha=1; };
  const shape=(a,b)=>{ '@later'; const X=S.sx; X.clearRect(0,0,P.w,P.h); let [x0,y0]=a, [x1,y1]=b;
    if(S.shift){ if(B.tool==='line'){ const ang=Math.round(Math.atan2(y1-y0,x1-x0)/(Math.PI/4))*(Math.PI/4), d=Math.hypot(x1-x0,y1-y0); x1=x0+Math.cos(ang)*d; y1=y0+Math.sin(ang)*d; } else { const s=Math.max(Math.abs(x1-x0),Math.abs(y1-y0)); x1=x0+Math.sign(x1-x0||1)*s; y1=y0+Math.sign(y1-y0||1)*s; } }
    X.strokeStyle=X.fillStyle=css(B.col); X.lineWidth=Math.max(1,B.size); X.lineCap=X.lineJoin='round';
    const one=(f)=>{ X.beginPath(); if(B.tool==='line'){ X.moveTo(f(x0),y0); X.lineTo(f(x1),y1); X.stroke(); } else if(B.tool==='rect'){ X.rect(Math.min(f(x0),f(x1)),Math.min(y0,y1),Math.abs(x1-x0),Math.abs(y1-y0)); B.fillShape?X.fill():X.stroke(); } else { X.ellipse((f(x0)+f(x1))/2,(y0+y1)/2,Math.abs(x1-x0)/2,Math.abs(y1-y0)/2,0,0,7); B.fillShape?X.fill():X.stroke(); } };
    one(x=>x); if(B.mirror)one(x=>P.w-x); S.box=[0,0,P.w,P.h]; };
  const begin=(e,p)=>{ '@later'; const L=P.layers[P.cur]; if(!L.vis)return say('THAT LAYER IS HIDDEN.');
    S.box=[1e9,1e9,-1e9,-1e9]; S.shift=e.shiftKey; S.before=mk(P.w,P.h); S.before.getContext('2d').drawImage(L.cv,0,0);
    if(B.tool==='smudge'){ S.live=false; S.last=p; return; }
    if(!S.sheet||S.sheet.width!==P.w||S.sheet.height!==P.h){ S.sheet=mk(P.w,P.h); S.sx=S.sheet.getContext('2d'); S.tmp=mk(P.w,P.h); S.tx=S.tmp.getContext('2d'); }
    S.sx.clearRect(0,0,P.w,P.h); S.live=true; S.start=p; S.last=p;
    if(['line','rect','oval'].includes(B.tool))shape(p,p); else dab(p[0],p[1],e.pointerType==='pen'?e.pressure:null);
    if(B.tool==='air'){ clearInterval(S.air); S.air=setInterval(()=>{ if(S.live&&S.last){ dab(S.last[0],S.last[1],null); compose(); redraw(); } },40); }
    compose(); redraw(); };
  const move=(e,p)=>{ '@later'; if(B.tool==='smudge'){ along(S.last,p,null,(x,y)=>{ smudgeAt(x,y,S.last[0],S.last[1]); S.last=[x,y]; }); S.last=p; redraw(); return; }
    if(!S.live)return; S.shift=e.shiftKey;
    if(['line','rect','oval'].includes(B.tool))shape(S.start,p);
    else { const evs=e.getCoalescedEvents?e.getCoalescedEvents():[e]; for(const ev of evs.length?evs:[e]){ const q=toC(ev); along(S.last,q,ev.pointerType==='pen'?ev.pressure:null,(x,y,pr)=>dab(x,y,pr)); S.last=q; } }
    compose(); redraw(); };
  const end=()=>{ '@later'; clearInterval(S.air); if(!S.before)return; const L=P.layers[P.cur];
    if(S.live){ compose(); L.cx.globalCompositeOperation='copy'; L.cx.drawImage(S.tmp,0,0); L.cx.globalCompositeOperation='source-over'; }
    S.live=false; const b=S.box; if(b[2]>b[0]){ const x=cl(Math.floor(b[0]),0,P.w), y=cl(Math.floor(b[1]),0,P.h), w=cl(Math.ceil(b[2]),0,P.w)-x, h=cl(Math.ceil(b[3]),0,P.h)-y; if(w>0&&h>0)pushUndo({li:P.cur,x,y,d:S.before.getContext('2d').getImageData(x,y,w,h)}); }
    S.before=null; if(B.tool!=='erase'&&B.tool!=='smudge')recent(B.col); thumbs(); redraw(); };

  /* ---------- fill and pick ---------- */
  const fillAt=(x,y)=>{ '@later'; x=Math.floor(x); y=Math.floor(y); if(x<0||y<0||x>=P.w||y>=P.h)return; const L=P.layers[P.cur]; if(!L.vis)return say('THAT LAYER IS HIDDEN.');
    const u=snapRect(P.cur,0,0,P.w,P.h), im=L.cx.getImageData(0,0,P.w,P.h), d=im.data, W=P.w, i0=(y*W+x)*4, s=[d[i0],d[i0+1],d[i0+2],d[i0+3]], tol=B.tol*4, a=B.op, c=B.col, seen=new Uint8Array(W*P.h);
    const same=i=>Math.abs(d[i]-s[0])+Math.abs(d[i+1]-s[1])+Math.abs(d[i+2]-s[2])+Math.abs(d[i+3]-s[3])<=tol;
    const paint=i=>{ const da=d[i+3]/255, oa=a+da*(1-a); if(oa<=0)return; for(let k=0;k<3;k++)d[i+k]=(c[k]*a+d[i+k]*da*(1-a))/oa; d[i+3]=oa*255; };
    const st=[x,y]; let n=0; while(st.length){ const yy=st.pop(); let xx=st.pop(); while(xx>=0&&!seen[yy*W+xx]&&same((yy*W+xx)*4))xx--; xx++; let up=false, dn=false;
      while(xx<W&&!seen[yy*W+xx]&&same((yy*W+xx)*4)){ const p=yy*W+xx; seen[p]=1; n++;
        if(yy>0){ const q=p-W; if(!seen[q]&&same(q*4)){ if(!up){ st.push(xx,yy-1); up=true; } } else up=false; }
        if(yy<P.h-1){ const q=p+W; if(!seen[q]&&same(q*4)){ if(!dn){ st.push(xx,yy+1); dn=true; } } else dn=false; } xx++; } }
    for(let p=0;p<W*P.h;p++)if(seen[p])paint(p*4); L.cx.putImageData(im,0,0); if(n&&u)pushUndo(u); recent(B.col); thumbs(); redraw(); };
  const pickAt=(x,y,second)=>{ '@later'; x=Math.floor(x); y=Math.floor(y); if(x<0||y<0||x>=P.w||y>=P.h)return; const c=mk(1,1), X=c.getContext('2d',{willReadFrequently:true});
    for(const L of P.layers)if(L.vis){ X.globalAlpha=L.op; X.drawImage(L.cv,x,y,1,1,0,0,1,1); } const d=X.getImageData(0,0,1,1).data; if(!d[3])return; setCol([d[0],d[1],d[2]],second); };

  /* ---------- pointer and keys on the view ---------- */
  let pan=null, spaceDown=false, drawing=false;
  const inDlg=e=>e.target.closest&&e.target.closest('.pdlg');   // the FINISH window sits over the painting: its clicks are its own
  const touch=new Map(); let pinch=null;
  const pinchAt=()=>{ const [a,b]=[...touch.values()], r=view.getBoundingClientRect(); return {d:Math.hypot(a[0]-b[0],a[1]-b[1])||1,x:(a[0]+b[0])/2-r.left,y:(a[1]+b[1])/2-r.top}; };
  view.addEventListener('pointerdown',e=>{ '@later'; if(!P||inDlg(e))return; e.preventDefault(); view.setPointerCapture(e.pointerId); const p=toC(e);
    if(e.pointerType==='touch'){ touch.set(e.pointerId,[e.clientX,e.clientY]); if(touch.size===2){ if(drawing){ drawing=false; end(); undo(); P.redo.length=0; bar(); } const q=pinchAt(); pinch={...q,z:V.z,vx:V.x,vy:V.y}; return; } if(touch.size>2)return; }
    if(e.button===1||e.button===2||spaceDown||B.tool==='hand'){ pan=[e.clientX,e.clientY,V.x,V.y]; return; }
    if(e.button!==0)return;
    if(B.tool==='pick'||e.altKey){ pickAt(p[0],p[1]); return; }
    if(B.tool==='fill'){ fillAt(p[0],p[1]); return; }
    drawing=true; begin(e,p); });
  view.addEventListener('pointermove',e=>{ '@later'; if(!P||inDlg(e))return; const p=toC(e); hover=e.pointerType==='touch'?null:p;
    if(touch.has(e.pointerId))touch.set(e.pointerId,[e.clientX,e.clientY]);
    if(pinch&&touch.size===2){ const q=pinchAt(), z=cl(pinch.z*q.d/pinch.d,.1,32), cx=(pinch.x-pinch.vx)/pinch.z, cy=(pinch.y-pinch.vy)/pinch.z; V.z=z; V.x=q.x-cx*z; V.y=q.y-cy*z; bar(); redraw(); return; }
    if(pan){ V.x=pan[2]+e.clientX-pan[0]; V.y=pan[3]+e.clientY-pan[1]; redraw(); return; }
    if(drawing)move(e,p); else redraw(); });
  const up=e=>{ if(e&&touch.delete(e.pointerId)&&pinch){ if(touch.size<2)pinch=null; return; } if(pinch)return; if(pan){ pan=null; return; } if(drawing){ drawing=false; end(); } };
  view.addEventListener('pointerup',up); view.addEventListener('pointercancel',up); view.addEventListener('pointerleave',()=>{ hover=null; redraw(); });
  view.addEventListener('contextmenu',e=>e.preventDefault());
  view.addEventListener('wheel',e=>{ if(!P||inDlg(e))return; e.preventDefault(); const r=view.getBoundingClientRect(); if(e.ctrlKey||!e.shiftKey)zoomAt(V.z*(e.deltaY<0?1.15:1/1.15),e.clientX-r.left,e.clientY-r.top); else { V.x-=e.deltaY; redraw(); } },{passive:false});
  const KEYT=Object.fromEntries(TOOLS.map(t=>[t[2].toLowerCase(),t[0]]));
  const onKey=e=>{ '@later'; e.stopPropagation(); const k=e.key.toLowerCase(), typing=e.target.tagName==='INPUT'&&e.target.type==='text';
    if(e.key==='Escape'){ const d=ui.querySelector('.pdlg'); if(d)d.remove(); else PAINTER.close(); e.preventDefault(); return; }
    if(typing)return;
    if((e.ctrlKey||e.metaKey)&&k==='z'){ e.preventDefault(); e.shiftKey?redo():undo(); return; }
    if((e.ctrlKey||e.metaKey)&&k==='y'){ e.preventDefault(); redo(); return; }
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(k===' '){ spaceDown=true; e.preventDefault(); return; }
    if(KEYT[k]){ setTool(KEYT[k]); return; }
    if(k==='['){ B.size=cl(Math.round(B.size/1.2),1,300); brushBox(); redraw(); } else if(k===']'){ B.size=cl(Math.round(B.size*1.2+1),1,300); brushBox(); redraw(); }
    else if(k==='x')swap(); else if(k==='m')toggleMirror(); else if(k==='u')toggleGuide(); else if(k==='0')fit(); else if(k==='1'){ const r=view.getBoundingClientRect(); zoomAt(1,r.width/2,r.height/2); } };
  ui.addEventListener('keydown',onKey);
  // a click on a layer or the painting can take the keys' focus off the window: while it is open, the painter keeps them
  ui.tabIndex=-1; ui.addEventListener('pointerdown',e=>{ if(!e.target.closest('input,button,select'))ui.focus({preventScroll:true}); });
  addEventListener('keydown',e=>{ if(ui.hidden||ui.contains(e.target))return; e.stopImmediatePropagation(); e.preventDefault(); ui.focus({preventScroll:true}); onKey(e); },true);
  addEventListener('keyup',e=>{ if(ui.hidden||ui.contains(e.target))return; e.stopImmediatePropagation(); if(e.key===' ')spaceDown=false; },true);
  ui.addEventListener('keyup',e=>{ e.stopPropagation(); if(e.key===' ')spaceDown=false; });
  ui.addEventListener('keypress',e=>e.stopPropagation());

  /* ---------- the tools, the brush, the colour ---------- */
  const tools=()=>{ $('tools').innerHTML=TOOLS.map(([k,n,key])=>`<button data-t="${k}" aria-pressed="${B.tool===k}">${n}<span>${key}</span></button>`).join(''); };
  $('tools').addEventListener('click',e=>{ const b=e.target.closest('[data-t]'); if(b)setTool(b.dataset.t); });
  const setTool=t=>{ B.tool=t; tools(); brushBox(); redraw(); };
  const brushBox=()=>{ '@later'; const t=B.tool, b=$('brush');
    const r=(id,lab,min,max,val,unit)=>`<div class="prow"><label for="pp-${id}">${lab}</label><input type="range" id="pp-${id}" min="${min}" max="${max}" value="${val}"><span class="pnum" id="pp-${id}n">${val}${unit||''}</span></div>`;
    let h=`<h4>${(TOOLS.find(x=>x[0]===t)||[0,''])[1]}</h4>`;
    if(['brush','pencil','air','erase','smudge','line','rect','oval'].includes(t))h+=r('size',t==='line'||t==='rect'||t==='oval'?'WIDTH':'SIZE',1,300,B.size,'PX');
    if(t!=='pick'&&t!=='hand')h+=r('op',t==='smudge'?'STRENGTH':'OPACITY',1,100,Math.round(B.op*100),'%');
    if(t==='brush'||t==='erase')h+=r('hard','HARDNESS',0,100,Math.round(B.hard*100),'%');
    if(t==='fill')h+=r('tol','TOLERANCE',0,255,B.tol);
    if(['brush','pencil','air','erase'].includes(t))h+=`<div class="prow"><button id="pp-press" aria-pressed="${B.press}">PEN PRESSURE</button></div>`;
    if(t==='rect'||t==='oval')h+=`<div class="prow"><button id="pp-fs" aria-pressed="${B.fillShape}">FILLED</button><button id="pp-os" aria-pressed="${!B.fillShape}">OUTLINE</button></div>`;
    if(t==='pick')h+=`<div class="phint">CLICK TO TAKE A COLOUR FROM THE PAINTING. ALT+CLICK DOES IT WITH ANY TOOL.</div>`;
    if(t==='hand')h+=`<div class="phint">DRAG TO MOVE THE PAINTING. THE WHEEL ZOOMS.</div>`;
    b.innerHTML=h;
    const on=(id,f)=>{ const el=$(id); if(el)el.oninput=()=>{ f(+el.value); const n=$(id+'n'); if(n)n.textContent=el.value+(id==='size'?'PX':id==='tol'?'':'%'); redraw(); }; };
    on('size',v=>B.size=v); on('op',v=>B.op=v/100); on('hard',v=>B.hard=v/100); on('tol',v=>B.tol=v);
    const pr=$('press'); if(pr)pr.onclick=()=>{ B.press=!B.press; brushBox(); };
    const fs=$('fs'); if(fs){ fs.onclick=()=>{ B.fillShape=true; brushBox(); }; $('os').onclick=()=>{ B.fillShape=false; brushBox(); }; } };
  const sv=$('sv'), svx=sv.getContext('2d'), hue=$('hue'), hux=hue.getContext('2d');
  const colourBox=()=>{ '@later'; const [h,s,v]=HSV, W=sv.width, H=sv.height;
    svx.fillStyle=css(hsv2rgb(h,1,1)); svx.fillRect(0,0,W,H); let g=svx.createLinearGradient(0,0,W,0); g.addColorStop(0,'#fff'); g.addColorStop(1,'rgba(255,255,255,0)'); svx.fillStyle=g; svx.fillRect(0,0,W,H);
    g=svx.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'#000'); svx.fillStyle=g; svx.fillRect(0,0,W,H);
    svx.beginPath(); svx.arc(s*W,(1-v)*H,6,0,7); svx.strokeStyle='#000'; svx.lineWidth=3; svx.stroke(); svx.strokeStyle='#fff'; svx.lineWidth=1.5; svx.stroke();
    const hg=hux.createLinearGradient(0,0,hue.width,0); for(let i=0;i<=6;i++)hg.addColorStop(i/6,css(hsv2rgb(i/6,1,1))); hux.fillStyle=hg; hux.fillRect(0,0,hue.width,hue.height);
    hux.fillStyle='#fff'; hux.fillRect(h*hue.width-2,0,4,hue.height); hux.strokeStyle='#000'; hux.strokeRect(h*hue.width-2.5,.5,5,hue.height-1);
    $('c1').style.background=css(B.col); $('c2').style.background=css(B.col2); const hx=$('hex'); if(document.activeElement!==hx)hx.value=hex2(B.col).toUpperCase(); };
  const setCol=(c,second)=>{ if(second){ B.col2=c; } else { B.col=c; HSV=rgb2hsv(c); } colourBox(); };
  const swap=()=>{ const t=B.col; B.col=B.col2; B.col2=t; HSV=rgb2hsv(B.col); colourBox(); };
  const drag=(el,f)=>{ el.addEventListener('pointerdown',e=>{ el.setPointerCapture(e.pointerId); f(e); const mv=ev=>f(ev), u=()=>{ el.removeEventListener('pointermove',mv); el.removeEventListener('pointerup',u); }; el.addEventListener('pointermove',mv); el.addEventListener('pointerup',u); }); };
  drag(sv,e=>{ const r=sv.getBoundingClientRect(); HSV=[HSV[0],cl((e.clientX-r.left)/r.width,0,1),1-cl((e.clientY-r.top)/r.height,0,1)]; B.col=hsv2rgb(...HSV); colourBox(); });
  drag(hue,e=>{ const r=hue.getBoundingClientRect(); HSV=[cl((e.clientX-r.left)/r.width,0,.999),HSV[1],HSV[2]]; B.col=hsv2rgb(...HSV); colourBox(); });
  $('hex').addEventListener('change',e=>{ const c=rgbOf(e.target.value); if(c)setCol(c); else colourBox(); });
  $('swap').onclick=swap; $('c2').onclick=swap;
  $('sw').innerHTML=PALETTE.map(h=>`<button style="background:${h}" data-h="${h}" aria-label="${h}"></button>`).join('');
  const REC=[]; const recent=c=>{ const h=hex2(c); const i=REC.indexOf(h); if(i>=0)REC.splice(i,1); REC.unshift(h); REC.length=Math.min(REC.length,12); $('recent').innerHTML=REC.map(h=>`<button style="background:${h}" data-h="${h}" aria-label="${h}"></button>`).join(''); };
  for(const id of ['sw','recent'])$(id).addEventListener('click',e=>{ const b=e.target.closest('[data-h]'); if(b)setCol(rgbOf(b.dataset.h)); });

  /* ---------- layers ---------- */
  const thumbs=()=>{ ui.querySelectorAll('#pp-layers canvas').forEach(c=>{ const L=P.layers[+c.dataset.i]; if(!L)return; const x=c.getContext('2d'); x.clearRect(0,0,c.width,c.height); x.drawImage(L.cv,0,0,c.width,c.height); }); };
  const layers=()=>{ '@later'; const el=$('layers'); el.innerHTML=P.layers.map((L,i)=>({L,i})).reverse().map(({L,i})=>`<div data-i="${i}" class="${i===P.cur?'on':''}"><button data-eye="${i}" aria-pressed="${L.vis}" title="Show or hide">${L.vis?'ON':'OFF'}</button><canvas data-i="${i}" width="68" height="52"></canvas><span>${L.n}</span></div>`).join('');
    const L=P.layers[P.cur]; $('lop').value=Math.round(L.op*100); $('lopn').textContent=Math.round(L.op*100)+'%';
    $('ldel').disabled=P.layers.length<2; $('lmerge').disabled=P.cur===0; $('ldn').disabled=P.cur===0; $('lup').disabled=P.cur===P.layers.length-1; $('ladd').disabled=$('ldup').disabled=P.layers.length>=8; thumbs(); };
  $('layers').addEventListener('click',e=>{ const eye=e.target.closest('[data-eye]'); if(eye){ const L=P.layers[+eye.dataset.eye]; L.vis=!L.vis; P.changed=true; layers(); redraw(); return; } const r=e.target.closest('[data-i]'); if(r){ P.cur=+r.dataset.i; layers(); } });
  const lact=f=>()=>{ const u=snapAll(); f(); pushUndo(u); layers(); redraw(); };
  $('ladd').onclick=lact(()=>{ P.layers.splice(P.cur+1,0,layer('LAYER '+(++P.ln),P.w,P.h)); P.cur++; });
  $('ldup').onclick=lact(()=>{ const s=P.layers[P.cur], L=layer(s.n+' COPY',P.w,P.h); L.cx.drawImage(s.cv,0,0); L.op=s.op; P.layers.splice(P.cur+1,0,L); P.cur++; });
  $('ldel').onclick=lact(()=>{ P.layers.splice(P.cur,1); P.cur=Math.max(0,P.cur-1); });
  $('lup').onclick=lact(()=>{ const i=P.cur; [P.layers[i],P.layers[i+1]]=[P.layers[i+1],P.layers[i]]; P.cur++; });
  $('ldn').onclick=lact(()=>{ const i=P.cur; [P.layers[i],P.layers[i-1]]=[P.layers[i-1],P.layers[i]]; P.cur--; });
  $('lmerge').onclick=lact(()=>{ const i=P.cur, a=P.layers[i-1], b=P.layers[i]; if(b.vis){ a.cx.globalAlpha=b.op; a.cx.drawImage(b.cv,0,0); a.cx.globalAlpha=1; } P.layers.splice(i,1); P.cur=i-1; });
  let opU=null; $('lop').addEventListener('pointerdown',()=>{ opU=snapAll(); }); $('lop').addEventListener('input',e=>{ P.layers[P.cur].op=+e.target.value/100; $('lopn').textContent=e.target.value+'%'; redraw(); });
  $('lop').addEventListener('change',()=>{ if(opU)pushUndo(opU); opU=null; });

  /* ---------- the bar ---------- */
  const toggleMirror=()=>{ B.mirror=!B.mirror; bar(); redraw(); };
  const toggleGuide=()=>{ const G=P&&P.o.guide; if(!G)return; G.on=!G.on; bar(); redraw(); };
  const bar=()=>{ if(!P)return; $('sub').textContent=`${P.title||'UNTITLED'} · ${P.w}×${P.h}`; $('z').textContent=Math.round(V.z*100)+'%'; $('undo').disabled=!P.undo.length; $('redo').disabled=!P.redo.length; $('mirror').setAttribute('aria-pressed',B.mirror); const G=P.o.guide; $('guide').hidden=!G; if(G)$('guide').setAttribute('aria-pressed',!!G.on); };
  $('undo').onclick=undo; $('redo').onclick=redo; $('mirror').onclick=toggleMirror; $('guide').onclick=toggleGuide; $('fit').onclick=fit; $('z').onclick=()=>{ const r=view.getBoundingClientRect(); zoomAt(1,r.width/2,r.height/2); };
  const panels=()=>{ tools(); brushBox(); colourBox(); layers(); bar(); };

  let say=t=>{ if(PAINTER.say)PAINTER.say(t); };
  const flat=()=>{ const c=mk(P.w,P.h), x=c.getContext('2d'); for(const L of P.layers)if(L.vis){ x.globalAlpha=L.op; x.drawImage(L.cv,0,0); } return c; };

  /* ---------- open, close, finish: the hooks (PAINTER.onSave, onFinish) belong to the paintings (159h) ---------- */
  PAINTER.open=async(o)=>{ '@later'; // o: {w,h,title,bg,layers:[{n,vis,op,src}],onSave,onFinish,frames,guide:{img,a,on},fixTitle,note}
    P={w:o.w,h:o.h,title:o.title||'',layers:[],cur:0,undo:[],redo:[],ln:1,changed:false,o};
    if(o.layers&&o.layers.length){ for(const s of o.layers){ const L=layer(s.n||'LAYER',o.w,o.h); L.vis=s.vis!==false; L.op=s.op==null?1:s.op; if(s.src){ const im=new Image(); im.src=s.src; try{ await im.decode(); L.cx.drawImage(im,0,0); }catch(e){} } P.layers.push(L); } P.ln=P.layers.length; P.cur=P.layers.length-1; }
    else { const bg=layer('BACKGROUND',o.w,o.h); bg.cx.fillStyle=o.bg||'#f4efe4'; bg.cx.fillRect(0,0,o.w,o.h); P.layers.push(bg, layer('LAYER 1',o.w,o.h)); P.cur=1; }
    ui.hidden=false; V.W=0; panels(); requestAnimationFrame(()=>{ fit(); redraw(); }); ui.querySelector('#pp-tools button').focus(); PAINTER.isOpen=true; SHARED.covered=true; };   // the painter covers the game: its picture is not drawn behind it
  const pack=()=>P.layers.map(L=>({n:L.n,vis:L.vis,op:L.op,src:L.cv.toDataURL('image/png')}));
  PAINTER.close=()=>{ if(!P)return; if(drawing){ drawing=false; end(); } const o=P.o; try{ if(o.onSave&&P.changed)o.onSave(pack(),flat()); }catch(e){ console.warn('painter save',e); } ui.hidden=true; P=null; PAINTER.isOpen=false; SHARED.covered=false; try{ o.onClose&&o.onClose(); }catch(e){} };
  $('close').onclick=()=>PAINTER.close();
  $('done').onclick=()=>{ '@later'; if(!P)return; const o=P.o, dlg=document.createElement('div'); dlg.className='pdlg'; const F=o.frames||[['','NO FRAME']]; let fr=F[1]?F[1][0]:'';
    dlg.innerHTML=`<div><h4>FINISH AND SIGN</h4><div class="prow"><label for="pp-title">TITLE</label><input type="text" id="pp-title" maxlength="60" style="flex:1" value="${String(P.title||'').replace(/"/g,'')}"${o.fixTitle?' readonly':''}></div>
      <div class="prow"><label>FRAME</label>${F.map(([k,n])=>`<button data-fr="${k}" aria-pressed="${k===fr}">${n}</button>`).join('')}</div>
      <div class="phint">${o.note||'ONCE FINISHED IT CAN NO LONGER BE PAINTED ON. IT IS ONE OF A KIND: HANG IT AT HOME WITH DECORATE, GIVE IT OR SELL IT.'}</div>
      <div class="prow" style="justify-content:flex-end"><button id="pp-back">KEEP PAINTING</button><button id="pp-sign" style="box-shadow:inset 0 0 0 2px var(--g)">SIGN</button></div></div>`;
    view.appendChild(dlg); const ti=dlg.querySelector('#pp-title'); ti.focus(); ti.select();
    dlg.querySelectorAll('[data-fr]').forEach(b=>b.onclick=()=>{ fr=b.dataset.fr; dlg.querySelectorAll('[data-fr]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.fr===fr)); });
    dlg.querySelector('#pp-back').onclick=()=>dlg.remove();
    dlg.querySelector('#pp-sign').onclick=()=>{ const title=(o.fixTitle||ti.value||'').trim().toUpperCase()||'UNTITLED'; P.title=title; const img=flat(); const oo=P.o; dlg.remove(); ui.hidden=true; P=null; PAINTER.isOpen=false; SHARED.covered=false; try{ oo.onClose&&oo.onClose(); }catch(e){} try{ oo.onFinish&&oo.onFinish({title,frame:fr,img}); }catch(e){ console.warn('painter finish',e); } }; };
  PAINTER.state=()=>P?{w:P.w,h:P.h,layers:P.layers.length,cur:P.cur,tool:B.tool,size:B.size,op:B.op,col:hex2(B.col),undo:P.undo.length,redo:P.redo.length,zoom:V.z,open:!ui.hidden,guide:P.o.guide?{a:P.o.guide.a,on:!!P.o.guide.on}:null}:{open:false};
  PAINTER.B=B; PAINTER.setTool=setTool; PAINTER.setCol=c=>setCol(rgbOf(c)||c); PAINTER.flat=()=>P&&flat(); PAINTER.undo=undo; PAINTER.redo=redo; PAINTER.guide=toggleGuide;
  PAINTER.paintImage=img=>{ if(!P)return; const L=P.layers[P.cur], u=snapRect(P.cur,0,0,P.w,P.h); L.cx.drawImage(img,0,0,P.w,P.h); if(u)pushUndo(u); thumbs(); redraw(); };   // a picture laid on the current layer (the tests)
  PAINTER.screen=(x,y)=>{ const r=view.getBoundingClientRect(); return [r.left+V.x+x*V.z,r.top+V.y+y*V.z]; };   // a painting's pixel on the screen (the tests)
  PAINTER.pixel=(x,y)=>{ if(!P)return null; const d=flat().getContext('2d').getImageData(x,y,1,1).data; return [d[0],d[1],d[2],d[3]]; };
}
export {PAINTER};
