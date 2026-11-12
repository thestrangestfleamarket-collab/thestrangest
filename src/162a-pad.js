// THE GAMEPAD: PAD lets the player play with an Xbox or PlayStation controller.
import {SHARED} from './003-shx.js';
import {FORAGE, keys, UI, VR} from './003b-systems.js';
import {renderer} from './004-main.js';
import {SAVE} from './005-save.js';
import {SYS} from './006-map-pre.js';
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
  const ACTS=[['jump','jump · dive · yes'],['use','use what you face'],['punch','punch'],['kick','kick'],['run','run (held)'],['roll','roll'],['back','back · close'],['menu','the menu'],['moves','what you can do'],['pack','your pack'],
    ['view','change the view'],['reset','reset the view'],['turnL','turn the view left'],['turnR','turn the view right'],['zin','zoom in'],['zout','zoom out'],['block','block (held)'],['dodge','dodge back'],
    ['crouch','crouch (held): punch an uppercut, kick a sweep'],['slap','slap'],['side','side kick (again as it lands: spin kick)'],['sweep','leg sweep'],['bflip','back flip'],['fflip','front flip'],['cartwheel','cartwheel'],
    ['wave','wave'],['emotes','emotes'],['hand','the next thing in your hand'],['inspect','look over what you hold'],['shoes','shoes off / on'],['chat','talk to your block'],['decor','decorate (your apartment)'],['fall','fall'],['mod','hold for more (the second layer)']];
  const KA={punch:'j',kick:'k',roll:'r',block:'p',dodge:'o',crouch:'i',slap:'n',side:'l',sweep:'2',bflip:'3',fflip:'4',cartwheel:'u',wave:'v',turnL:'q',turnR:'rot'}, TA={emotes:'h',hand:'1',inspect:'inspect',shoes:'shoes',chat:'chat',decor:'t',fall:'f',view:'view',reset:'0'};
  const TAPK=new Set([...Object.keys(TA),'moves','pack','menu','back']), M_=100;
  // three layouts to start from (owner, 8 Nov 2026); 100 + a button is that button with the hold-for-more button held
  const LAY={
    CLASSIC:{name:'CLASSIC',what:'the game as it was, every free button filled; hold VIEW for more (open-world games)',b:{jump:0,back:1,use:2,punch:2,kick:3,turnL:4,turnR:5,roll:6,run:7,moves:8,mod:8,menu:9,view:10,reset:11,emotes:12,wave:13,hand:14,pack:15,
      bflip:100,dodge:101,slap:102,side:103,crouch:104,block:105,cartwheel:106,fflip:107,chat:109,fall:110,decor:111,zin:112,zout:113,inspect:114,shoes:115,sweep:-1}},
    ACTION:{name:'ACTION',what:'fights first: X punch, Y kick, B dodge (and uses what you face), RB block, LB crouch (brawler games)',b:{jump:0,use:1,dodge:1,back:1,punch:2,kick:3,crouch:4,block:5,roll:6,run:7,moves:8,mod:8,menu:9,view:10,reset:11,emotes:12,wave:13,hand:14,pack:15,
      fflip:100,bflip:101,slap:102,side:103,turnL:104,turnR:105,cartwheel:106,sweep:107,chat:109,fall:110,decor:111,zin:112,zout:113,inspect:114,shoes:115}},
    EXPLORE:{name:'EXPLORE',what:'A uses what you face (else jumps), B held runs, X punch, Y kick; the camera on the bumpers (adventure and life games)',b:{use:0,jump:0,run:1,back:1,punch:2,kick:3,turnL:4,turnR:5,roll:6,block:7,moves:8,mod:8,menu:9,view:10,reset:11,emotes:12,wave:13,hand:14,pack:15,
      bflip:100,dodge:101,slap:102,side:103,crouch:104,sweep:105,cartwheel:106,fflip:107,chat:109,fall:110,decor:111,zin:112,zout:113,inspect:114,shoes:115}}};
  const BIND={}; let LNAME='CLASSIC';
  const useLay=n=>{ LNAME=LAY[n]?n:'CLASSIC'; for(const [a] of ACTS)BIND[a]=-1; Object.assign(BIND,LAY[LNAME].b); };
  try{ useLay(SAVE.get('padlay')||'CLASSIC'); const o=JSON.parse(SAVE.get('padkeys')||'{}'); for(const a in o)if(a in BIND&&Number.isInteger(o[a]))BIND[a]=o[a]; }catch(e){ useLay('CLASSIC'); }
  PAD.B=BIND; PAD.LAY=LAY;
  const save=()=>{ try{ SAVE.set('padlay',LNAME); SAVE.set('padkeys',JSON.stringify(BIND)); }catch(e){} };
  const bind=(a,b)=>{ const was=BIND[a]; for(const o of Object.keys(BIND))if(o!==a&&o!=='use'&&a!=='use'&&o!=='mod'&&a!=='mod'&&BIND[o]===b)BIND[o]=was; BIND[a]=b; save(); };
  const bnm=v=>v==null||v<0?'NONE':v>=M_?bn(BIND.mod)+' + '+bn(v-M_):bn(v), bhtm=v=>v==null||v<0?'NONE':v>=M_?bhtml(BIND.mod)+' + '+bhtml(v-M_):bhtml(v);
  const ev=(type,key)=>dispatchEvent(new KeyboardEvent(type,{key,bubbles:true,cancelable:true}));
  const hold=(src,key)=>{ const k=PAD.held.get(src); if(k===key)return; if(k!=null){ PAD.held.delete(src); ev('keyup',k); } if(key!=null){ PAD.held.set(src,key); ev('keydown',key); } };
  const tap=key=>{ ev('keydown',key); ev('keyup',key); };
  const letGo=()=>{ for(const s of [...PAD.held.keys()])hold(s,null); PAD.mv=null; };
  const K=a=>UI.keyOf(a);
  const cv=renderer.domElement;
  const zoom=d=>{ const r=cv.getBoundingClientRect(); cv.dispatchEvent(new WheelEvent('wheel',{deltaY:d*-240,clientX:r.left+r.width/2,clientY:r.top+r.height/2,bubbles:true,cancelable:true})); };
  const C='button:not([disabled]),input:not([type=hidden]):not([disabled]),select:not([disabled]),textarea,a[href],[tabindex]:not([tabindex="-1"])';
  const panels=PAD.panels=()=>[...document.body.children].filter(e=>e!==cv&&!/^(stage|newver|shbar|subfade|onl|vrbtn|tpad|tturn|hlog|hmap|hqb|vit|hud)$/.test(e.id)&&!e.hidden&&e.getClientRects().length&&getComputedStyle(e).display!=='none'&&e.querySelector(C));
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
  const back=()=>{ if(PAD.grab){ grab(null); return; } if(UI.menuOpen||document.getElementById('movesp')?.style.display==='block'){ tap('Escape'); return; }
    const p=(PAD.ui&&PAD.ui.closest('body>*'))||panels().slice(-1)[0], x=closeBtn(p); if(x){ x.click(); return; } if(p)(PAD.ui&&p.contains(PAD.ui)?PAD.ui:p).dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})); };   // a box with no close button (the emotes) takes Escape
  const menus=(on,hit,ax,act)=>{ '@later'; if(PAD.mouse){ if(!act)return; PAD.mouse=false; } const [dx,dy]=way(on,ax), a=PAD.ui, cs=ctls();
    if(!a||!cs.includes(a))mark(nearest(cs));
    else if(step(dx,dy)){ if(dx&&PAD.grab===a){ dx>0?a.stepUp():a.stepDown(); fire(a); } else if(dx&&a.tagName==='SELECT'){ a.selectedIndex=Math.max(0,Math.min(a.options.length-1,a.selectedIndex+dx)); fire(a); } else { if(dy&&PAD.grab)grab(null); move(dx,dy,cs); } }
    if(hit(4))tab(-1); if(hit(5))tab(1);
    if(hit(0)&&PAD.ui){ if(PAD.ui.type==='range')grab(PAD.grab?null:PAD.ui); else if(PAD.ui.tagName!=='SELECT')PAD.ui.click(); } };
  let capUp=false, capM=false, capT=0;
  const pick=()=>{ if(PAD.tp&&PAD.tp.live)return PAD.tp; const gs=[...navigator.getGamepads()].filter(g=>g&&g.connected), st=gs.filter(g=>g.mapping==='standard'), pool=st.length?st:gs; return pool.reduce((a,g)=>!a||g.timestamp>a.timestamp?g:a,null); };
  const zr={};
  const rep=(k,on)=>{ const now=performance.now(); if(!on){ zr[k]=0; return false; } if(!zr[k]){ zr[k]=now+350; return true; } if(now>=zr[k]){ zr[k]=now+120; return true; } return false; };
  const pump=PAD.step=(now,gp)=>{ const dt=Math.min(.05,(now-(PAD.t||now))/1000); PAD.t=now; if(!gp){ if(PAD.held.size)letGo(); return; }
    if(gp.id!==PAD.id){ PAD.id=gp.id; PAD.ps=/054c|playstation|dualsense|dualshock/i.test(gp.id); PAD.q=gp===PAD.xr; }
    const Bv=gp.buttons.map(b=>b.value), pr=PAD.prev, on=i=>i>=0&&(Bv[i]||0)>.5, hit=i=>on(i)&&!((pr[i]||0)>.5), ax=gp.axes, b=a=>{ const v=BIND[a]; return v>=M_?v-M_:v; };
    const act=Bv.some((v,i)=>Math.abs(v-(pr[i]||0))>.1)||ax.some(a=>Math.abs(a)>.4); PAD.prev=Bv;
    if(act&&!PAD.cur){ PAD.cur=true; document.body.classList.add('padcur'); }
    if(PAD.capture){ const f=PAD.capture, mo=BIND.mod, i=Bv.findIndex((v,j)=>j<16&&v>.5&&j!==mo);   // the next button pressed; with the hold-for-more button held, its second layer; that button alone, itself
      if(Bv.every(v=>!(v>.5))){ if(capUp&&capM){ PAD.capture=null; f(mo); return; } capUp=true; capM=false; } else if(capUp&&mo>=0&&on(mo)&&i<0)capM=true;
      if(capUp&&i>=0){ PAD.capture=null; f(mo>=0&&on(mo)?i+M_:i); return; } if(now>capT){ PAD.capture=null; f(null); } return; }
    if(UI.gamewin==='pin'){ hold('h',on(4)||on(6)||on(14)?'a':null); hold('v',on(5)||on(7)||on(15)?'d':null); hold('A',on(b('jump'))||(ax[3]||0)>.6?' ':null); if(hit(b('back')))tap('Escape'); PAD.mv=null; PAD.aWait=true; return; }   // a pinball table: a bumper or trigger a side is its flipper, A or the right stick pulled back the plunger, B steps away
    if(UI.gamewin){ const lx=ax[0]||0, ly=ax[1]||0, dx=on(14)?-1:on(15)?1:Math.abs(lx)>.4?Math.sign(lx):0, dy=on(12)?-1:on(13)?1:Math.abs(ly)>.4?Math.sign(ly):0;   // a cabinet or the BBS: the stick is the arrows, A fires or enters, B leaves, X is the game's magic, Y its menu
      hold('h',dx<0?'ArrowLeft':dx>0?'ArrowRight':null); hold('v',dy<0?'ArrowUp':dy>0?'ArrowDown':null); hold('A',on(b('jump'))?(UI.gamewin==='bbs'?'Enter':' '):null); hold('X',on(b('use'))?'c':null); if(hit(b('kick')))tap('m'); if(hit(b('back')))tap('Escape'); PAD.mv=null; PAD.aWait=true; return; }
    if(UI.hubOpen&&UI.hubPad){ letGo(); UI.hubPad(ax[0]||0,ax[1]||0,hit(b('jump')),hit(5)||hit(15)?1:hit(4)||hit(14)?-1:0,hit(3)); if(hit(b('back'))||hit(b('menu')))tap('Escape'); PAD.mv=null; PAD.aWait=true; return; }   // ESC's wheel (162ed-hub)
    if(panels().length){ letGo(); PAD.aWait=true; menus(on,hit,ax,act); if(hit(b('back')))back(); else if(hit(b('menu'))&&UI.menuOpen)tap('Escape'); return; }
    if(SHARED.drive){ letGo(); nav=''; PAD.mv=null; if(SHARED.drive.pad)SHARED.drive.pad(gp,dt,hit,on); if(hit(b('menu')))tap('Escape'); return; }
    nav=''; if(PAD.ui||PAD.at){ mark(null); PAD.at=null; } if(PAD.aWait&&!on(b('jump')))PAD.aWait=false;
    const lx=ax[0]||0, ly=ax[1]||0; let h=null, v=null;
    if(Math.hypot(lx,ly)>.2){ const s=(Math.round(Math.atan2(ly,lx)/(Math.PI/4))+8)%8; h=s===0||s===1||s===7?'d':s>=3&&s<=5?'a':null; v=s>=1&&s<=3?'s':s>=5?'w':null; }
    hold('h',h&&K(h)); hold('v',v&&K(v)); PAD.mv=(h&&keys.has(h))||(v&&keys.has(v))?[lx,ly]:null;
    const rx=ax[2]||0, ry=ax[3]||0, rr=Math.hypot(rx,ry);
    if(rr>.2&&!UI.menuOpen&&!VR.on){ const k=(rr-.2)/.8/rr; if(UI.persp)UI.orbit(rx*k*dt*420,ry*k*dt*300); else UI.orbit(rx*k*dt*420,0); }
    if(UI.view==='iso'&&!UI.menuOpen&&!VR.on){ if(!PAD.flk&&Math.abs(rx)>.7){ PAD.flk=true; if(UI.isoStep)UI.isoStep(rx<0?1:-1); } else if(Math.abs(rx)<.3)PAD.flk=false; }   // the overhead view turns a step a flick
    const MO=BIND.mod, modOn=MO>=0&&on(MO), SH=new Set(); for(const a in BIND)if(BIND[a]>=M_)SH.add(BIND[a]-M_);
    if(MO>=0&&hit(MO))PAD.modUsed=false; if(modOn&&[...SH].some(i=>on(i)))PAD.modUsed=true;
    const cur={}; for(const [a] of ACTS){ const v=BIND[a]; cur[a]=v==null||v<0?false:v>=M_?modOn&&on(v-M_):v===MO&&a!=='mod'&&TAPK.has(a)?false:on(v)&&!(modOn&&v!==MO&&SH.has(v)); }
    const AP=PAD.ap||{}, hitA=a=>cur[a]&&!AP[a]; PAD.ap=cur;
    if(MO>=0&&!on(MO)&&(pr[MO]||0)>.5&&!PAD.modUsed)for(const [a] of ACTS)if(BIND[a]===MO&&TAPK.has(a))cur[a]=true;   // a tap of the hold-for-more button does its own thing on letting go
    const UB=BIND.use, shares=a=>a!=='use'&&UB>=0&&BIND[a]===UB, alone=!ACTS.some(([a])=>shares(a));
    if(!PAD.useX&&hitA('use')){ if(alone){ tap(K('use')); PAD.useX=true; } else if(UI.useNear())PAD.useX=true; } else if(PAD.useX&&!cur.use)PAD.useX=false;   // use what you face; nothing there, the button's other action
    const ok=a=>cur[a]&&!(PAD.useX&&shares(a));
    hold('A',ok('jump')&&!PAD.aWait?K(' '):null); hold('RT',ok('run')?K('shift'):null);
    for(const a in KA)hold('k'+a,ok(a)?K(KA[a]):null);
    for(const a in TA)if(ok(a)&&!AP[a])tap(K(TA[a]));
    if(ok('moves')&&!AP.moves)tap('?'); if(ok('pack')&&!AP.pack)tap('i');
    if(rep('zu',ok('zin')))zoom(1); if(rep('zd',ok('zout')))zoom(-1);
    if(ok('back')&&!AP.back&&(FORAGE.PACK.open||document.getElementById('movesp')?.style.display==='block'))back(); if(ok('menu')&&!AP.menu)tap('Escape'); };
  const tick=now=>{ if(!VR.on)pump(now,pick()); }; SYS.add('win',now=>{ if(PAD.n||PAD.tp)tick(now); },'162a-pad');
  addEventListener('gamepadconnected',()=>{ if(!PAD.n++)PAD.t=0; if(UI.menuOpen)UI.padKeys(); });
  addEventListener('gamepaddisconnected',()=>{ PAD.n=Math.max(0,PAD.n-1); if(!PAD.n){ letGo(); mark(null); } });
  addEventListener('pointerdown',e=>{ if(e.isTrusted&&PAD.n){ mark(null); PAD.mouse=true; } },true);
  addEventListener('pointermove',e=>{ if(PAD.cur&&e.isTrusted&&(e.movementX||e.movementY)){ PAD.cur=false; document.body.classList.remove('padcur'); } },true);
  addEventListener('blur',()=>letGo());
  UI.padMoves=(row,h)=>{ '@later'; const tch=PAD.tp&&PAD.tp.on?h('THE SCREEN')+row('LEFT THUMB','WALK, ANY WAY')+row('RIGHT THUMB','DRAG TO LOOK ROUND · TWO FINGERS ZOOM · DOUBLE TAP USES WHAT YOU TAP')+row('RUN','TAP TO RUN, TAP AGAIN TO WALK'):''; if(!PAD.n)return tch;
    if(VR.on){ let o=h('THE QUEST CONTROLLERS (CHANGE THEIR BUTTONS IN SETTINGS, CONTROLLER)')+row('LEFT STICK','WALK WHERE YOU LOOK')+row('RIGHT STICK','TURN, 30° A PUSH')+row('LEFT STICK PRESS','THE MENU')+row('RIGHT STICK PRESS','STAND HERE AGAIN (RECENTRE)');
      for(const [a,w] of ACTS)if(BIND[a]>=0&&BIND[a]<8)o+=row(bhtml(BIND[a]),w.toUpperCase()); return o+row('HOLD '+bn(1),'LEAVE VR')+row('IN A WINDOW','POINT AND PULL THE TRIGGER · THE RIGHT STICK SCROLLS · '+bn(1)+' BACK')+h('YOUR HANDS')+row('POINT AND PINCH','PRESS · PINCH AND DRAG SCROLLS')+row('YOUR LEFT WRIST','THE MENU BUTTON (TOUCH IT)'); }
    let o=h('THE CONTROLLER · '+LNAME+' (CHANGE IT IN SETTINGS, CONTROLLER)')+row('LEFT STICK','WALK, ANY WAY')+row('RIGHT STICK','LOOK ROUND · A FLICK TURNS THE OVERHEAD VIEW');
    for(const [a,w] of ACTS)if(BIND[a]>=0)o+=row(bhtm(BIND[a]),w.toUpperCase()); return tch+o+row('IN A MENU OR A BOX','STICK OR D-PAD MOVES, '+bn(0)+' PRESSES, '+bn(4)+' / '+bn(5)+' THE TABS, '+bn(1)+' BACK'); };
  // the CONTROLLER page in SETTINGS (owner, 8 Nov 2026: "put those menus in game. allow to customize the controls. add 3 different settings"): the pad drawn with what each button does, the three layouts, every action to rebind
  const css2=document.createElement('style'); css2.textContent=`#dpad .lays{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0}#dpad .lays .btn{box-shadow:inset 0 0 0 1px var(--mi)}#dpad .lays .btn[aria-pressed=true]{background:var(--mf);color:var(--mk)}
#dpad svg{width:100%;height:auto;display:block;margin:6px 0}#dpad svg text{font-family:inherit;letter-spacing:1px}
#padtab{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));column-gap:20px}#padtab tbody{display:contents}#padtab tr{display:flex;align-items:center;justify-content:space-between;gap:8px;border-bottom:1px solid var(--me);min-width:0}#padtab td{border:0;padding:2px 4px;font-size:13px;letter-spacing:1px}#padtab td:first-child{flex:1;min-width:0}#padtab td:last-child{white-space:nowrap}`;
  document.head.appendChild(css2);
  const ACT=Object.fromEntries(ACTS); let waiting=null;
  const on1=(i,mod)=>{ const v=mod?i+M_:i; return ACTS.filter(([a])=>BIND[a]===v&&!(a==='mod')).map(([a])=>a); };
  const SHORT={use:'USE',hand:'NEXT IN HAND',inspect:'LOOK OVER IT',decor:'DECORATE',chat:'TALK',moves:'WHAT YOU CAN DO',mod:'MORE'}, say=a=>SHORT[a]||(ACT[a]||a).split(/[:(·]/)[0].trim().toUpperCase();
  const picture=()=>{ '@later'; const sc=.44, X=x=>550+(x-672)*sc, Y=y=>40+(y-100)*sc, esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;');
    const P=[[6,'LT',480,132,'L'],[4,'LB',485,170,'L'],[10,'L3',470,270,'L'],[12,'D-UP',596,306,'L'],[14,'D-LEFT',560,342,'L'],[13,'D-DOWN',596,378,'L'],[8,'VIEW',623,263,'L'],
      [7,'RT',864,132,'R'],[5,'RB',859,170,'R'],[3,'Y',874,230,'R'],[1,'B',910,266,'R'],[2,'X',838,266,'R'],[0,'A',874,302,'R'],[11,'R3',780,355,'R'],[15,'D-RIGHT',632,342,'R'],[9,'MENU',721,263,'R']];
    const MO=BIND.mod, mn=MO>=0?bn(MO):'';
    let o=`<svg viewBox="0 0 1100 560"><g transform="translate(550,40) scale(${sc}) translate(-672,-100)" fill="#123a22" stroke="#3aa866" stroke-width="2.5">
<path d="M470 175 C520 150 824 150 874 175 C930 185 960 210 985 280 C1010 350 1040 440 1035 500 C1030 560 975 580 945 540 C915 500 890 455 850 440 C800 425 544 425 494 440 C454 455 429 500 399 540 C369 580 314 560 309 500 C304 440 334 350 359 280 C384 210 414 185 470 175 Z" fill="#0b2416"/>
<path d="M420 178 Q470 150 540 152 L545 170 Q480 170 430 192 Z"/><path d="M924 178 Q874 150 804 152 L799 170 Q864 170 914 192 Z"/><rect x="445" y="112" width="70" height="40" rx="12"/><rect x="829" y="112" width="70" height="40" rx="12"/>
<circle cx="470" cy="270" r="40"/><circle cx="780" cy="355" r="40"/><path d="M560 330 h24 v-24 h24 v24 h24 v24 h-24 v24 h-24 v-24 h-24 z"/>
<rect x="610" y="255" width="26" height="16" rx="6"/><rect x="708" y="255" width="26" height="16" rx="6"/>
<circle cx="874" cy="230" r="17" fill="#0b2416" stroke="#f0c230"/><circle cx="838" cy="266" r="17" fill="#0b2416" stroke="#3b7bff"/><circle cx="910" cy="266" r="17" fill="#0b2416" stroke="#e5403a"/><circle cx="874" cy="302" r="17" fill="#0b2416" stroke="#5cc337"/></g>`;
    for(const side of ['L','R']){ let y=24; for(const [i,nm,bx,by] of P.filter(q=>q[4]===side)){ const a=on1(i,false), m=i===MO?[]:on1(i,true), lines=[[nm+' · '+(a.length?a.map(say).join(' / '):'—')+(i===MO?' · HELD: MORE':''),'#7dffa8']];
        if(m.length)lines.push(['+ '+mn+' · '+m.map(say).join(' / '),'#f2c14e']);
        const tx=side==='L'?4:1100-4, ex=side==='L'?392:708, ly=y+lines.length*10-5;
        o+=`<path d="M${X(bx).toFixed(0)} ${Y(by).toFixed(0)} L${ex} ${ly}" stroke="#3aa866" stroke-width="1.2" fill="none"/><circle cx="${X(bx).toFixed(0)}" cy="${Y(by).toFixed(0)}" r="3" fill="#d8ffe4"/>`;
        lines.forEach(([t,c],k)=>{ o+=`<text x="${tx}" y="${y+k*20+14}" font-size="16" fill="${c}" text-anchor="${side==='L'?'start':'end'}">${esc(t)}</text>`; }); y+=lines.length*20+10; } }
    return o+`<text x="550" y="548" font-size="14" fill="#3aa866" text-anchor="middle">LEFT STICK WALKS · RIGHT STICK LOOKS (A FLICK TURNS THE OVERHEAD VIEW) · YELLOW: HOLD ${esc(mn||'—')} FIRST</text></svg>`; };
  UI.padPage=el=>{ '@later'; el=el||document.getElementById('dpad'); if(!el||!el.isConnected)return;
    let o=`<h3>LAYOUT</h3><div class="lays">${Object.keys(LAY).map(n=>`<button class="btn" data-lay="${n}" aria-pressed="${n===LNAME}">${n}</button>`).join('')}</div><div class="dim">${LAY[LNAME].what}${PAD.n?'':' · no controller plugged in: plug one in to change its buttons; the layout is kept'}</div>`+picture()
      +`<h3>EVERY ACTION (CLICK ONE, THEN PRESS ITS BUTTON; HOLD ${bn(BIND.mod>=0?BIND.mod:8)} FIRST FOR THE SECOND LAYER)</h3><table id="padtab"></table><div class="row" style="margin-top:8px"><button class="btn" id="padrst">BACK TO ${LNAME} AS IT CAME</button></div>`;
    el.innerHTML=o; const t=el.querySelector('#padtab');
    for(const [a,w] of ACTS){ const tr=document.createElement('tr'), bt=document.createElement('button'); bt.className='btn'; bt.innerHTML=waiting===a?'PRESS A BUTTON…':bhtm(BIND[a]); bt.setAttribute('aria-pressed',String(waiting===a)); bt.disabled=!PAD.n;
      bt.onclick=()=>{ waiting=a; capUp=false; capM=false; capT=performance.now()+6000; PAD.capture=i=>{ if(i!=null)bind(a,i); waiting=null; UI.padPage(); }; UI.padPage(); };
      const t1=document.createElement('td'); t1.textContent=w.toUpperCase(); const t2=document.createElement('td'); t2.appendChild(bt); tr.append(t1,t2); t.appendChild(tr); }
    el.querySelectorAll('[data-lay]').forEach(b=>b.onclick=()=>{ useLay(b.dataset.lay); save(); UI.padPage(); });
    el.querySelector('#padrst').onclick=()=>{ useLay(LNAME); save(); UI.padPage(); };
    if(PAD.ui&&!PAD.ui.isConnected)mark(null); };
  UI.padKeys=()=>{ if(UI.menuOpen)UI.padPage(); };
  window.PAD=PAD; window.PADDBG=()=>({layout:LNAME,bind:{...BIND},held:[...PAD.held.entries()],useX:!!PAD.useX,modUsed:!!PAD.modUsed,panels:PAD.panels().map(e=>e.id||e.className)});
}
