// THE TOUCH PAD: on a phone or tablet, an on-screen stick and buttons that drive PAD as a controller would; hidden while a real controller plays.
import {UI, VR} from './003b-systems.js';
import {renderer} from './004-main.js';
import {SYS} from './006-map-pre.js';
import {PAD} from './075-main-13.js';
{
  const QS=new URLSearchParams(location.search), coarse=matchMedia('(pointer:coarse)').matches||QS.get('touch')==='1';
  const css=document.createElement('style'); css.textContent=`
#tpad{position:fixed;inset:0;z-index:4;pointer-events:none;touch-action:none;user-select:none;-webkit-user-select:none;font:9px var(--pixel);color:var(--fg)}
#tpad[hidden]{display:none}
#tpad .tz{position:absolute;pointer-events:auto;touch-action:none}
#tpad .tzl{left:0;top:30%;bottom:0;width:40%}
#tpad .tzr{right:0;top:0;bottom:0;left:40%}
#tpad .tb{position:absolute;pointer-events:auto;touch-action:none;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(10,12,18,.42);border:2px solid rgba(255,255,255,.4);box-sizing:border-box;text-shadow:1px 1px 0 #000;letter-spacing:1px}
#tpad .tb.on{background:rgba(242,193,78,.5);border-color:var(--key)}
#tpad .tb[hidden]{display:none}
#tpad .tcl{position:absolute;right:calc(8px + env(safe-area-inset-right,0px));bottom:calc(8px + env(safe-area-inset-bottom,0px));width:300px;height:300px;zoom:var(--tz,1);pointer-events:none}
#tpad .tcl .tuse{border-radius:20px;background:rgba(242,193,78,.35);border-color:var(--key);color:#fff}
#tpad .tcol{position:absolute;left:var(--tcx,200px);top:calc(8px + env(safe-area-inset-top,0px));display:flex;flex-direction:column;gap:6px;zoom:var(--tz,1)}
#tpad .tcol .tb{position:static;width:40px;height:40px}
#tpad .tstk{position:absolute;left:calc(var(--sx,110px) * var(--tz,1));top:calc(100% - var(--sy,110px) * var(--tz,1));zoom:1;pointer-events:none}
#tpad .tbase,#tpad .tknob{position:absolute;border-radius:50%;pointer-events:none;transform:translate(-50%,-50%)}
#tpad .tbase{width:calc(124px * var(--tz,1));height:calc(124px * var(--tz,1));background:rgba(10,12,18,.28);border:2px solid rgba(255,255,255,.3)}
#tpad .tknob{width:calc(54px * var(--tz,1));height:calc(54px * var(--tz,1));background:rgba(255,255,255,.35)}
#tpad.idle .tbase,#tpad.idle .tknob{opacity:.5}
#tturn{position:fixed;inset:0;z-index:99999;background:var(--bg);color:var(--fg);display:none;align-items:center;justify-content:center;text-align:center;font:14px var(--pixel);padding:24px}
@media (orientation:portrait){ body.touch #tturn{display:flex} }
body.touch{overscroll-behavior:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;--z:calc(var(--uiz,1)*var(--tz,1))}
body.touch input,body.touch textarea{-webkit-user-select:text;user-select:text}
body.touch .btn{min-height:34px}
body.touch #hmap:not([style*="top:"]){zoom:var(--z)!important;left:calc((8px + env(safe-area-inset-left,0px)) / var(--z))!important;right:auto!important;top:calc((8px + env(safe-area-inset-top,0px)) / var(--z))!important}
body.touch #vit:not([style*="top:"]){zoom:var(--z)!important;right:calc((8px + env(safe-area-inset-right,0px)) / var(--z))!important;left:auto!important;top:calc((8px + env(safe-area-inset-top,0px)) / var(--z))!important}
body.touch #hlog:not([style*="top:"]){zoom:var(--z)!important;left:calc(50vw / var(--z))!important;transform:translateX(-50%);bottom:calc((8px + env(safe-area-inset-bottom,0px)) / var(--z))!important;width:min(300px,34vw)}
body.touch #hqb:not([style*="top:"]){zoom:var(--tq,1)!important;left:calc(var(--tqx,50vw) / var(--tq,1))!important;top:calc((8px + env(safe-area-inset-top,0px)) / var(--tq,1))!important;bottom:auto!important}`;
  document.head.appendChild(css);
  const TP=PAD.tp={id:'touch',connected:true,mapping:'standard',timestamp:0,buttons:Array.from({length:17},()=>({value:0})),axes:[0,0,0,0],on:false,live:false};
  const el=document.createElement('div'); el.id='tpad'; el.hidden=true; el.className='idle';
  const at=(r,deg)=>[70-r*Math.cos(deg*Math.PI/180),70+r*Math.sin(deg*Math.PI/180)];   // the buttons on arcs round the bottom-right corner, as a phone game lays them
  const ARC=[['jump','JUMP',0,0,84],['punch','PUNCH',...at(112,95),62],['kick','KICK',...at(112,135),62],['roll','ROLL',...at(112,175),62],['run','RUN',...at(196,172),58,1],['use','USE',...at(196,104),0]];
  el.innerHTML='<div class="tz tzl"></div><div class="tz tzr"></div><div class="tstk"><div class="tbase"></div><div class="tknob"></div></div><div class="tcl">'
    +ARC.map(([a,t,x,y,d,lock])=>a==='use'?`<div class="tb tuse" data-a="use" hidden style="width:84px;height:40px;right:${x-42}px;bottom:${y-20}px">${t}</div>`
      :`<div class="tb" data-a="${a}"${lock?' data-lock="1"':''} style="width:${d}px;height:${d}px;right:${(a==='jump'?70:x)-d/2}px;bottom:${(a==='jump'?70:y)-d/2}px">${t}</div>`).join('')
    +'</div><div class="tcol">'+[['menu','☰'],['view','VIEW'],['pack','PACK'],['moves','?']].map(([a,t])=>`<div class="tb" data-a="${a}">${t}</div>`).join('')+'</div>';
  const turn=document.createElement('div'); turn.id='tturn'; turn.textContent='TURN YOUR DEVICE SIDEWAYS TO PLAY';
  document.body.append(el,turn);
  const $=s=>el.querySelector(s), stk=$('.tstk'), knob=$('.tknob'), useB=$('.tuse'), cv=renderer.domElement;
  const press=(a,v)=>{ const i=PAD.B[a]; if(i==null||i<0)return; if(i>=100){ const m=PAD.B.mod; if(m>=0)TP.buttons[m].value=v; TP.buttons[i-100].value=v; } else TP.buttons[i].value=v; };   // the button its action has in your layout (with the hold-for-more button, both)
  let stick=null; const look=new Map(); let pinch=0, lastTap=0, lastXY=[0,0];
  const rest=()=>{ stk.style.left=stk.style.top=''; knob.style.transform=''; el.classList.add('idle'); };
  const clear=()=>{ for(const b of TP.buttons)b.value=0; TP.axes.fill(0); for(const b of el.querySelectorAll('.tb.on'))b.classList.remove('on'); stick=null; rest(); look.clear(); };
  const show=v=>{ v=!!v; if(TP.on===v)return; TP.on=v; el.hidden=!v; if(!v)clear(); };
  const zl=$('.tzl'), zr=$('.tzr');
  zl.addEventListener('pointerdown',e=>{ if(stick)return; zl.setPointerCapture(e.pointerId); stick={id:e.pointerId,x:e.clientX,y:e.clientY}; stk.style.left=e.clientX+'px'; stk.style.top=e.clientY+'px'; el.classList.remove('idle'); });
  zl.addEventListener('pointermove',e=>{ if(!stick||e.pointerId!==stick.id)return; let dx=e.clientX-stick.x, dy=e.clientY-stick.y; const M=56*(+H.getPropertyValue('--tz')||1), d=Math.hypot(dx,dy); if(d>M){ dx*=M/d; dy*=M/d; }
    TP.axes[0]=dx/M; TP.axes[1]=dy/M; knob.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`; });
  const upL=e=>{ if(!stick||e.pointerId!==stick.id)return; stick=null; TP.axes[0]=TP.axes[1]=0; rest(); };
  zl.addEventListener('pointerup',upL); zl.addEventListener('pointercancel',upL);
  const span=()=>{ const p=[...look.values()]; return Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y); };
  zr.addEventListener('pointerdown',e=>{ zr.setPointerCapture(e.pointerId); look.set(e.pointerId,{x:e.clientX,y:e.clientY,t:performance.now(),x0:e.clientX,y0:e.clientY}); if(look.size===2)pinch=span(); });
  zr.addEventListener('pointermove',e=>{ const p=look.get(e.pointerId); if(!p)return; const dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY;
    if(look.size===1){ if(UI.menuOpen||VR.on){} else if(UI.view==='iso'){ p.sw=(p.sw||0)+dx; if(Math.abs(p.sw)>90){ UI.isoStep(p.sw<0?1:-1); p.sw=0; } }   // the overhead view turns in its steps: a swipe is Q or E
      else UI.orbit(dx*1.4,dy*1.4); }
    else if(look.size===2){ const s=span(), d=s-pinch; if(Math.abs(d)>24){ pinch=s; const r=cv.getBoundingClientRect(); cv.dispatchEvent(new WheelEvent('wheel',{deltaY:-Math.sign(d)*240,clientX:r.left+r.width/2,clientY:r.top+r.height/2,bubbles:true,cancelable:true})); } } });
  const upR=e=>{ const p=look.get(e.pointerId); if(!p)return; look.delete(e.pointerId); const now=performance.now();
    if(look.size===0&&now-p.t<250&&Math.hypot(e.clientX-p.x0,e.clientY-p.y0)<12){   // a double tap is the double click: use what you tap
      if(now-lastTap<350&&Math.hypot(e.clientX-lastXY[0],e.clientY-lastXY[1])<40){ lastTap=0; cv.dispatchEvent(new MouseEvent('dblclick',{clientX:e.clientX,clientY:e.clientY,button:0,bubbles:true,cancelable:true})); }
      else { lastTap=now; lastXY=[e.clientX,e.clientY]; } } };
  zr.addEventListener('pointerup',upR); zr.addEventListener('pointercancel',upR);
  for(const b of el.querySelectorAll('.tb')){ const a=b.dataset.a, lock=b.dataset.lock;
    b.addEventListener('pointerdown',e=>{ e.preventDefault(); b.setPointerCapture(e.pointerId); if(lock){ const v=!b.classList.contains('on'); b.classList.toggle('on',v); press(a,v?1:0); return; } b.classList.add('on'); press(a,1); });
    const up=()=>{ if(lock)return; b.classList.remove('on'); press(a,0); };
    b.addEventListener('pointerup',up); b.addEventListener('pointercancel',up); }
  addEventListener('contextmenu',e=>{ if(document.body.classList.contains('touch')&&!/^(INPUT|TEXTAREA)$/.test(e.target.tagName))e.preventDefault(); },true);
  let full=false;
  const first=()=>{ document.body.classList.add('touch'); };
  const goFull=()=>{ if(full||!document.documentElement.requestFullscreen||document.fullscreenElement)return; full=true;   // the first touch takes the whole screen, held sideways, as a phone game does
    document.documentElement.requestFullscreen({navigationUI:'hide'}).then(()=>screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape')).catch(()=>{}); };
  addEventListener('pointerdown',e=>{ if(e.isTrusted&&e.pointerType==='touch'){ if(!document.body.classList.contains('touch'))first(); goFull(); show(true); } },true);
  if(coarse){ first(); show(true); }
  window.TOUCHDBG=()=>({on:TP.on,live:TP.live,axes:TP.axes.slice(),down:TP.buttons.map((b,i)=>b.value?i:-1).filter(i=>i>=0),held:[...PAD.held.entries()],use:!useB.hidden});
  const H=document.documentElement.style; let lay=0, tq=1, useT=0;
  const fit=()=>{ const tz=Math.max(.6,Math.min(1,innerHeight/620)); H.setProperty('--tz',tz);   // GTA-style: the map top left with the round buttons beside it, the vitals top right, the quick bar between, the log bottom centre, the stick bottom left, the buttons round the bottom-right corner
    const V=document.getElementById('vit'), M=document.getElementById('hmap'), Q=document.getElementById('hqb'), C=$('.tcol');
    const mr=M&&M.getClientRects().length?M.getBoundingClientRect():{right:8}; H.setProperty('--tcx',(mr.right+8)/tz+'px');
    const l=C.getClientRects().length?C.getBoundingClientRect().right+8:mr.right+56, r=(V&&V.getClientRects().length?V.getBoundingClientRect().left:innerWidth)-8;
    if(Q&&!Q.hidden&&Q.getClientRects().length){ const uz=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--uiz'))||1, w=Q.getBoundingClientRect().width/tq;
      tq=Math.max(.35,Math.min(uz*tz,(r-l)/w)); H.setProperty('--tq',tq); H.setProperty('--tqx',(l+r)/2+'px'); } };
  addEventListener('resize',()=>{ lay=0; if(document.body.classList.contains('touch'))fit(); });
  SYS.add('win',now=>{ if(document.body.classList.contains('touch')&&now>=lay){ lay=now+500; fit(); } if(!TP.on){ TP.live=false; return; }
    if(PAD.n&&!VR.on){ for(const g of navigator.getGamepads())if(g&&g.connected&&g!==TP&&(g.buttons.some(b=>b.value>.5)||g.axes.some(a=>Math.abs(a)>.4))){ show(false); TP.live=false; return; } }   // a real controller pressed: the screen's controls step aside until the next touch
    const live=!VR.on&&(!!UI.gamewin||!PAD.panels().length); if(live!==TP.live){ TP.live=live; el.hidden=!live; if(!live)clear(); }
    if(live){ TP.timestamp=performance.now(); if(now>=useT){ useT=now+200; const n=!UI.gamewin&&UI.nearThing(); useB.hidden=!n; } } },'162aa-touch');   // USE shows only when something is in reach
}
