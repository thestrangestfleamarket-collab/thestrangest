// THE GAMEPAD: PAD lets the player play with an Xbox or PlayStation controller.
import {FORAGE, keys, UI, VR} from './003b-systems.js';
import {renderer} from './004-main.js';
import {SAVE} from './005-save.js';
import {PAD} from './075-main-13.js';
{
  const css=document.createElement('style'); css.textContent='.padon{outline:2px solid #f2c14e!important;outline-offset:2px}.padgrab{outline-color:#5cc337!important}body.padcur,body.padcur *{cursor:none!important}#keytab img.padi,#movesp img.padi{width:18px;height:18px;image-rendering:pixelated;vertical-align:middle}';
  document.head.appendChild(css);
  Object.assign(PAD,{id:'',ps:false,held:new Map(),ui:null,at:null,grab:null,mouse:false,cur:false,aWait:false,useX:false,capture:null,prev:[],t:0,xr:null,q:false});
  const PADXB=['A','B','X','Y','LB','RB','LT','RT','VIEW','START','L3','R3','D-PAD UP','D-PAD DOWN','D-PAD LEFT','D-PAD RIGHT'],
    PADPS=['CROSS','CIRCLE','SQUARE','TRIANGLE','L1','R1','L2','R2','CREATE','OPTIONS','L3','R3','D-PAD UP','D-PAD DOWN','D-PAD LEFT','D-PAD RIGHT'],
    PADQ=['A','B','X','Y','LEFT GRIP','RIGHT GRIP','LEFT TRIGGER','RIGHT TRIGGER',,,'LEFT STICK PRESS','RIGHT STICK PRESS'];
  const bn=i=>i<0?'NONE':(PAD.q?PADQ:PAD.ps?PADPS:PADXB)[i]||'BUTTON '+i;
  const GL={xb:[['.###.#...#######...##...#','#5cc337'],['####.#...#####.#...#####.','#e5403a'],['#...#.#.#...#...#.#.#...#','#3b7bff'],['#...#.#.#...#....#....#..','#f0c230']],
    ps:[['#...#.#.#...#...#.#.#...#','#7aa9ff'],['.###.#...##...##...#.###.','#ff6a6a'],['######...##...##...######','#f39bd6'],['.......#...#.#.#...######','#3ed8a6']]}, IC={};
  const icon=i=>{ '@later'; const k=(PAD.ps?'ps':'xb')+i; if(IC[k])return IC[k]; const [gl,col]=GL[PAD.ps?'ps':'xb'][i], c=document.createElement('canvas'); c.width=c.height=9; const g=c.getContext('2d');
    for(let y=0;y<9;y++){ const w=y===0||y===8?5:y===1||y===7?7:9; g.fillStyle='#8a8a92'; g.fillRect((9-w)/2,y,w,1); if(y>0&&y<8){ const w2=y===1||y===7?5:7; g.fillStyle='#111217'; g.fillRect((9-w2)/2,y,w2,1); } }
    g.fillStyle=col; for(let j=0;j<25;j++)if(gl[j]==='#')g.fillRect(2+j%5,2+(j/5|0),1,1); return IC[k]=c.toDataURL(); };
  const bhtml=i=>i>=0&&i<4?'<img class="padi" src="'+icon(i)+'" alt="'+bn(i)+'" title="'+bn(i)+'"> '+bn(i):bn(i);
  const ACTS=[['jump','jump · dive · yes'],['back','back · close'],['use','use what you face (when nothing, punch)'],['punch','punch'],['kick','kick'],['turnL','turn the view left'],['turnR','turn the view right'],
    ['roll','roll'],['cartwheel','cartwheel'],['run','run (held) · with d-pad up / down: zoom'],['moves','what you can do'],['menu','the menu'],['view','change the view'],['reset','reset the view'],['pack','your pack'],['wave','wave'],['fall','fall'],['guitar','the ghost\'s guitar: play · back on']];
  const B0={jump:0,back:1,use:2,punch:2,kick:3,turnL:4,turnR:5,roll:6,run:7,moves:8,menu:9,view:10,reset:11,pack:15,wave:-1,fall:-1,cartwheel:-1,guitar:14};
  const BIND=Object.assign({},B0); try{ const o=JSON.parse(SAVE.get('padkeys')||'{}'); for(const a in o)if(a in BIND&&Number.isInteger(o[a]))BIND[a]=o[a]; }catch(e){}
  const save=()=>{ try{ SAVE.set('padkeys',JSON.stringify(BIND)); }catch(e){} };
  const SHARE={use:'punch',punch:'use'};
  const bind=(a,b)=>{ const was=BIND[a]; for(const o of Object.keys(BIND))if(o!==a&&SHARE[a]!==o&&BIND[o]===b)BIND[o]=was; BIND[a]=b; save(); };
  const ev=(type,key)=>dispatchEvent(new KeyboardEvent(type,{key,bubbles:true,cancelable:true}));
  const hold=(src,key)=>{ const k=PAD.held.get(src); if(k===key)return; if(k!=null){ PAD.held.delete(src); ev('keyup',k); } if(key!=null){ PAD.held.set(src,key); ev('keydown',key); } };
  const tap=key=>{ ev('keydown',key); ev('keyup',key); };
  const letGo=()=>{ for(const s of [...PAD.held.keys()])hold(s,null); PAD.mv=null; };
  const K=a=>UI.keyOf(a);
  const cv=renderer.domElement;
  const zoom=d=>{ const r=cv.getBoundingClientRect(); cv.dispatchEvent(new WheelEvent('wheel',{deltaY:d*-240,clientX:r.left+r.width/2,clientY:r.top+r.height/2,bubbles:true,cancelable:true})); };
  const C='button:not([disabled]),input:not([type=hidden]):not([disabled]),select:not([disabled]),textarea,a[href],[tabindex]:not([tabindex="-1"])';
  const panels=PAD.panels=()=>[...document.body.children].filter(e=>e!==cv&&!/^(stage|newver|shbar|subfade|onl|vrbtn)$/.test(e.id)&&!e.hidden&&e.getClientRects().length&&getComputedStyle(e).display!=='none'&&e.querySelector(C));
  const ctls=()=>panels().flatMap(p=>[...p.querySelectorAll(C)]).filter(e=>{ if(e.closest('[inert],[hidden]'))return false; const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&getComputedStyle(e).visibility!=='hidden'; });
  const grab=el=>{ if(PAD.grab)PAD.grab.classList.remove('padgrab'); PAD.grab=el; if(el)el.classList.add('padgrab'); };
  const mark=el=>{ grab(null); if(PAD.ui)PAD.ui.classList.remove('padon'); PAD.ui=el; if(el){ el.classList.add('padon'); el.focus({preventScroll:true}); el.scrollIntoView({block:'nearest'}); const r=el.getBoundingClientRect(); PAD.at=[r.left+r.width/2,r.top+r.height/2]; } };
  const nearest=cs=>!PAD.at||!cs.length?cs[0]||null:cs.reduce((b,c)=>{ const r=c.getBoundingClientRect(), d=Math.hypot(r.left+r.width/2-PAD.at[0],r.top+r.height/2-PAD.at[1]); return d<b[1]?[c,d]:b; },[null,1e9])[0];
  const move=(dx,dy,cs)=>{ '@later'; const a=PAD.ui, r=a.getBoundingClientRect(), ax=r.left+r.width/2, ay=r.top+r.height/2; let best=null, bs=1e9;
    for(const c of cs){ if(c===a)continue; const q=c.getBoundingClientRect(), vx=q.left+q.width/2-ax, vy=q.top+q.height/2-ay, al=vx*dx+vy*dy, side=Math.abs(vx*dy)+Math.abs(vy*dx); if(al<=2)continue; const s=al+side*2; if(s<bs){ bs=s; best=c; } }
    if(best)mark(best); };
  const tab=d=>{ '@later'; const p=(PAD.ui&&PAD.ui.closest('body>*'))||panels()[0], ts=p?[...p.querySelectorAll('[role=tab]')].filter(t=>t.getClientRects().length):[]; if(!ts.length)return;
    const i=Math.max(0,ts.findIndex(t=>t.getAttribute('aria-selected')==='true')), t=ts[(i+d+ts.length)%ts.length]; t.click(); mark(t); };
  let nav='', navT=0;
  const step=(dx,dy)=>{ const k=dx+','+dy, now=performance.now(); if(k!==nav){ nav=k; navT=now+350; return !!(dx||dy); } if((dx||dy)&&now>=navT){ navT=now+120; return true; } return false; };
  const way=(on,ax)=>{ const x=ax[0]||0, y=ax[1]||0, dx=on(14)?-1:on(15)?1:Math.abs(x)>.5&&Math.abs(x)>Math.abs(y)?Math.sign(x):0, dy=dx?0:on(12)?-1:on(13)?1:Math.abs(y)>.5?Math.sign(y):0; return [dx,dy]; };
  const fire=el=>{ el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); };
  const closeBtn=p=>p&&[...p.querySelectorAll('button')].find(b=>b.classList.contains('pX')||/close/i.test(b.getAttribute('aria-label')||'')||/close$|x$/i.test(b.id)||/^(X|×|✕|CLOSE|DONE|LEAVE)$/i.test(b.textContent.trim()));
  const back=()=>{ '@later'; if(PAD.grab){ grab(null); return; } if(UI.menuOpen||document.getElementById('movesp')?.style.display==='block'){ tap('Escape'); return; }
    const p=(PAD.ui&&PAD.ui.closest('body>*'))||panels().slice(-1)[0], x=closeBtn(p); if(x){ x.click(); return; } if(FORAGE.PACK.open)FORAGE.PACK.toggle(); };
  const menus=(on,hit,ax,act)=>{ '@later'; if(PAD.mouse){ if(!act)return; PAD.mouse=false; } const [dx,dy]=way(on,ax), a=PAD.ui, cs=ctls();
    if(!a||!cs.includes(a))mark(nearest(cs));
    else if(step(dx,dy)){ if(dx&&PAD.grab===a){ dx>0?a.stepUp():a.stepDown(); fire(a); } else if(dx&&a.tagName==='SELECT'){ a.selectedIndex=Math.max(0,Math.min(a.options.length-1,a.selectedIndex+dx)); fire(a); } else { if(dy&&PAD.grab)grab(null); move(dx,dy,cs); } }
    if(hit(4))tab(-1); if(hit(5))tab(1);
    if(hit(0)&&PAD.ui){ if(PAD.ui.type==='range')grab(PAD.grab?null:PAD.ui); else if(PAD.ui.tagName!=='SELECT')PAD.ui.click(); } };
  let capUp=false, capT=0;
  const pick=()=>{ const gs=[...navigator.getGamepads()].filter(g=>g&&g.connected), st=gs.filter(g=>g.mapping==='standard'), pool=st.length?st:gs; return pool.reduce((a,g)=>!a||g.timestamp>a.timestamp?g:a,null); };
  const zr={};
  const rep=(k,on)=>{ const now=performance.now(); if(!on){ zr[k]=0; return false; } if(!zr[k]){ zr[k]=now+350; return true; } if(now>=zr[k]){ zr[k]=now+120; return true; } return false; };
  const pump=PAD.step=(now,gp)=>{ '@later'; const dt=Math.min(.05,(now-(PAD.t||now))/1000); PAD.t=now; if(!gp){ if(PAD.held.size)letGo(); return; }
    if(gp.id!==PAD.id){ PAD.id=gp.id; PAD.ps=/054c|playstation|dualsense|dualshock/i.test(gp.id); PAD.q=gp===PAD.xr; }
    const Bv=gp.buttons.map(b=>b.value), pr=PAD.prev, on=i=>i>=0&&(Bv[i]||0)>.5, hit=i=>on(i)&&!((pr[i]||0)>.5), ax=gp.axes, b=a=>BIND[a];
    const act=Bv.some((v,i)=>Math.abs(v-(pr[i]||0))>.1)||ax.some(a=>Math.abs(a)>.4); PAD.prev=Bv;
    if(act&&!PAD.cur){ PAD.cur=true; document.body.classList.add('padcur'); }
    if(PAD.capture){ const f=PAD.capture, i=Bv.findIndex((v,j)=>j<16&&v>.5); if(i<0)capUp=true; if(capUp&&i>=0||now>capT){ PAD.capture=null; f(i>=0&&capUp?i:null); } return; }
    if(UI.gamewin){ const lx=ax[0]||0, ly=ax[1]||0, dx=on(14)?-1:on(15)?1:Math.abs(lx)>.4?Math.sign(lx):0, dy=on(12)?-1:on(13)?1:Math.abs(ly)>.4?Math.sign(ly):0;   // a cabinet or the BBS: the stick is the arrows, A fires or enters, B leaves, X is the game's magic, Y its menu
      hold('h',dx<0?'ArrowLeft':dx>0?'ArrowRight':null); hold('v',dy<0?'ArrowUp':dy>0?'ArrowDown':null); hold('A',on(b('jump'))?(UI.gamewin==='bbs'?'Enter':' '):null); hold('X',on(b('use'))?'c':null); if(hit(b('kick')))tap('m'); if(hit(b('back')))tap('Escape'); PAD.mv=null; PAD.aWait=true; return; }
    if(panels().length){ letGo(); PAD.aWait=true; menus(on,hit,ax,act); if(hit(b('back')))back(); else if(hit(b('menu'))&&UI.menuOpen)tap('Escape'); return; }
    nav=''; if(PAD.ui||PAD.at){ mark(null); PAD.at=null; } if(PAD.aWait&&!on(b('jump')))PAD.aWait=false;
    const lx=ax[0]||0, ly=ax[1]||0; let h=null, v=null;
    if(Math.hypot(lx,ly)>.2){ const s=(Math.round(Math.atan2(ly,lx)/(Math.PI/4))+8)%8; h=s===0||s===1||s===7?'d':s>=3&&s<=5?'a':null; v=s>=1&&s<=3?'s':s>=5?'w':null; }
    hold('h',h&&K(h)); hold('v',v&&K(v)); PAD.mv=(h&&keys.has(h))||(v&&keys.has(v))?[lx,ly]:null;
    const rx=ax[2]||0, ry=ax[3]||0, rr=Math.hypot(rx,ry);
    if(rr>.2&&!UI.menuOpen&&!VR.on){ const k=(rr-.2)/.8/rr; if(UI.persp)UI.orbit(rx*k*dt*420,ry*k*dt*300); else UI.orbit(rx*k*dt*420,0); }
    if(!PAD.useX&&hit(b('use'))&&UI.useNear())PAD.useX=true; else if(PAD.useX&&!on(b('use')))PAD.useX=false;
    hold('A',on(b('jump'))&&!PAD.aWait?K(' '):null); hold('X',on(b('punch'))&&!PAD.useX?K('j'):null); hold('Y',on(b('kick'))?K('k'):null);
    const run=(Bv[b('run')]||0)>.3; hold('RT',run?K('shift'):null); hold('LB',on(b('turnL'))?K('q'):null); hold('RB',on(b('turnR'))?K('e'):null);
    hold('LT',on(b('roll'))?K('r'):null); hold('W',on(b('wave'))?K('v'):null); hold('CW',on(b('cartwheel'))?K('u'):null); hold('GT',on(b('guitar'))?K('t'):null); if(hit(b('fall')))tap(K('f'));
    if(hit(b('view')))tap(K('view')); if(hit(b('reset')))tap(K('0')); if(hit(b('moves')))tap('?'); if(hit(b('pack')))tap('i');
    if(run){ if(rep('zu',on(12)))zoom(1); if(rep('zd',on(13)))zoom(-1); } else { rep('zu',false); rep('zd',false); }
    if(hit(b('back'))&&(FORAGE.PACK.open||document.getElementById('movesp')?.style.display==='block'))back(); if(hit(b('menu')))tap('Escape'); };
  const tick=now=>{ '@later'; if(!PAD.n){ letGo(); return; } requestAnimationFrame(tick); if(!VR.on)pump(now,pick()); };
  addEventListener('gamepadconnected',()=>{ if(!PAD.n++){ PAD.t=0; requestAnimationFrame(tick); } if(UI.menuOpen)UI.padKeys(); });
  addEventListener('gamepaddisconnected',()=>{ PAD.n=Math.max(0,PAD.n-1); if(!PAD.n){ letGo(); mark(null); } });
  addEventListener('pointerdown',e=>{ if(e.isTrusted&&PAD.n){ mark(null); PAD.mouse=true; } },true);
  addEventListener('pointermove',e=>{ if(PAD.cur&&e.isTrusted&&(e.movementX||e.movementY)){ PAD.cur=false; document.body.classList.remove('padcur'); } },true);
  addEventListener('blur',()=>letGo());
  UI.padMoves=(row,h)=>{ '@later'; if(!PAD.n)return ''; if(VR.on){ let o=h('THE QUEST CONTROLLERS (CHANGE THEIR BUTTONS IN THE MENU\'S KEYS)')+row('LEFT STICK','WALK WHERE YOU LOOK')+row('RIGHT STICK','TURN, 30° A PUSH')+row('LEFT STICK PRESS','THE MENU')+row('RIGHT STICK PRESS','STAND HERE AGAIN (RECENTRE)');
      for(const [a,w] of ACTS)if(BIND[a]>=0&&BIND[a]<8)o+=row(bhtml(BIND[a]),w.toUpperCase()); return o+row('HOLD '+bn(1),'LEAVE VR')+row('IN A WINDOW','POINT AND PULL THE TRIGGER · THE RIGHT STICK SCROLLS · '+bn(1)+' BACK')+h('YOUR HANDS')+row('POINT AND PINCH','PRESS · PINCH AND DRAG SCROLLS')+row('YOUR LEFT WRIST','THE MENU BUTTON (TOUCH IT)'); }
    let o=h('THE CONTROLLER (CHANGE ITS BUTTONS IN THE MENU\'S KEYS)')+row('LEFT STICK','WALK, ANY WAY')+row('RIGHT STICK','LOOK ROUND (BEHIND, FIRST) · SPIN THE VIEW (ISOMETRIC)');
    for(const [a,w] of ACTS)if(BIND[a]>=0)o+=row(bhtml(BIND[a]),w.toUpperCase()); return o+row('IN A MENU OR A BOX','STICK OR D-PAD MOVES, '+bn(0)+' PRESSES, '+bn(4)+' / '+bn(5)+' THE TABS, '+bn(1)+' BACK'); };
  let waiting=null;
  UI.padKeys=t=>{ '@later'; t=t||document.getElementById('keytab'); if(!t||!PAD.n)return; [...t.querySelectorAll('.padrow')].forEach(r=>r.remove());
    const hd=document.createElement('tr'); hd.className='padrow'; hd.innerHTML='<td colspan="2" style="padding-top:14px;color:var(--key)">THE CONTROLLER</td>'; t.appendChild(hd);
    for(const [a,w] of ACTS){ const tr=document.createElement('tr'), bt=document.createElement('button'); tr.className='padrow'; bt.className='btn'; bt.innerHTML=waiting===a?'PRESS A BUTTON…':bhtml(BIND[a]); bt.setAttribute('aria-pressed',String(waiting===a));
      bt.onclick=()=>{ waiting=a; capUp=false; capT=performance.now()+6000; PAD.capture=i=>{ if(i!=null)bind(a,i); waiting=null; UI.padKeys(); }; UI.padKeys(); };
      const t1=document.createElement('td'); t1.textContent=w.toUpperCase(); const t2=document.createElement('td'); t2.appendChild(bt); tr.append(t1,t2); t.appendChild(tr); }
    const tr=document.createElement('tr'), bt=document.createElement('button'); tr.className='padrow'; bt.className='btn'; bt.textContent='CONTROLLER DEFAULTS'; bt.onclick=()=>{ Object.assign(BIND,B0); try{ SAVE.del('padkeys'); }catch(e){} UI.padKeys(); };
    const td=document.createElement('td'); td.colSpan=2; td.appendChild(bt); tr.appendChild(td); t.appendChild(tr);
    if(PAD.ui&&!PAD.ui.isConnected)mark(null); };
}
