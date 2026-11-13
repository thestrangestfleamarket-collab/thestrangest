// THE MINIGAMES' WINDOW: MINI.open(game) plays a small game on a canvas in a window of the menu's look (the game's start/tick/draw get its state, the mouse and keys; it ends with a line of result); MINI.look(title, picture) shows a sign, a menu or a board close up. While one is open the game's keys are its own.
const MINI={on:null}; window.MINI=MINI;
{ const W=document.createElement('div'); W.id='minig'; W.hidden=true; W.className='ml';
  W.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:23;padding:12px 14px;max-width:96vw;max-height:94vh;overflow:auto;zoom:var(--uiz,1)';
  W.innerHTML='<h3 data-t style="margin:0 0 8px"></h3><canvas width="400" height="440" style="display:block;margin:0 auto;image-rendering:pixelated;touch-action:none;cursor:crosshair;max-width:100%"></canvas><div data-s style="min-height:22px;margin-top:8px"></div><div data-h style="opacity:.7;font-size:14px!important"></div><div style="margin-top:8px;display:flex;gap:10px"><button data-again type="button">PLAY AGAIN</button><button data-close type="button">CLOSE</button></div>';
  const mount=()=>{ if(!W.parentNode)document.body.appendChild(W); };
  const CV=W.querySelector('canvas'), G=CV.getContext('2d'), TI=W.querySelector('[data-t]'), ST=W.querySelector('[data-s]'), HE=W.querySelector('[data-h]'), AG=W.querySelector('[data-again]'), CL=W.querySelector('[data-close]');
  let S=null, raf=0, last=0;
  const pos=e=>{ const r=CV.getBoundingClientRect(); return [(e.clientX-r.left)/r.width*CV.width,(e.clientY-r.top)/r.height*CV.height]; };
  CV.addEventListener('mousemove',e=>{ if(!S)return; [S.mx,S.my]=pos(e); });
  CV.addEventListener('mousedown',e=>{ if(!S)return; [S.mx,S.my]=pos(e); S.down=true; S.press=true; e.preventDefault(); e.stopPropagation(); });
  addEventListener('mouseup',()=>{ if(S&&S.down){ S.down=false; S.release=true; } });
  CV.addEventListener('dblclick',e=>e.stopPropagation());
  CV.addEventListener('wheel',e=>{ if(!S)return; S.wheel=(S.wheel||0)+e.deltaY; e.preventDefault(); e.stopPropagation(); },{passive:false});   // a game's window that scrolls reads S.wheel
  // the game's keys are its own while the window is open; Escape closes it
  addEventListener('keydown',e=>{ if(!MINI.on)return; if(e.key==='Escape'){ MINI.close(); } else if(S){ S.keys.add(e.key.toLowerCase()); if(e.key===' ')S.press=true; } e.stopImmediatePropagation(); if(/^(arrow|\s)/i.test(e.key))e.preventDefault(); },true);
  addEventListener('keyup',e=>{ if(!MINI.on)return; if(S)S.keys.delete(e.key.toLowerCase()); e.stopImmediatePropagation(); },true);
  const loop=t=>{ '@later'; if(!MINI.on||!S)return; const dt=Math.min(.05,(t-(last||t))/1000); last=t; const g=S.game;
    if(!S.over){ g.tick&&g.tick(S,dt); if(S.over){ ST.textContent=S.over; if(g.end)g.end(S); MINI.last={game:g.title,line:S.over,score:S.score}; } else ST.textContent=S.line||''; }
    G.setTransform(1,0,0,1,0,0); G.clearRect(0,0,CV.width,CV.height); g.draw&&g.draw(S,G); S.press=false; S.release=false; raf=requestAnimationFrame(loop); };
  const begin=game=>{ '@later'; if(game.can){ const no=game.can(); if(no){ ST.textContent=no; S=null; return false; } } CV.width=game.w||400; CV.height=game.h||440; S={game,mx:CV.width/2,my:CV.height/2,down:false,press:false,release:false,keys:new Set(),t:0,over:'',line:'',score:0}; if(game.start)game.start(S); return true; };
  MINI.open=game=>{ mount(); if(MINI.on&&MINI.on!==game&&MINI.on.close)MINI.on.close(); MINI.on=game; TI.textContent=game.title; HE.textContent=game.help||''; AG.hidden=!game.again; ST.textContent=''; W.hidden=false; cancelAnimationFrame(raf); last=0; if(begin(game))raf=requestAnimationFrame(loop); else G.clearRect(0,0,CV.width,CV.height); return S; };
  MINI.close=()=>{ if(!MINI.on)return; const g=MINI.on; MINI.on=null; cancelAnimationFrame(raf); if(S&&!S.over&&g.quit)g.quit(S); if(g.close)g.close(); S=null; W.hidden=true; };
  MINI.state=()=>S;
  AG.onclick=()=>{ const g=MINI.on; if(!g)return; ST.textContent=''; cancelAnimationFrame(raf); last=0; if(begin(g))raf=requestAnimationFrame(loop); };
  CL.onclick=()=>MINI.close();
  // a picture close up: draw(g,w,h) paints it (a canvas or an image is drawn whole)
  MINI.look=(title,pic,caption='')=>{ '@later'; const im=pic&&typeof pic!=='function'?(pic.image||pic):null, k=im&&im.width?Math.max(1,Math.floor(400/im.width)):1, w=im&&im.width?Math.min(560,im.width*k):400, h=im&&im.height?Math.min(520,Math.round(im.height*w/im.width)):300;
    return MINI.open({title,help:caption,w,h,draw:(S,g)=>{ g.imageSmoothingEnabled=false; if(typeof pic==='function')pic(g,g.canvas.width,g.canvas.height); else if(im)g.drawImage(im,0,0,g.canvas.width,g.canvas.height); }}); };
}
export {MINI};
