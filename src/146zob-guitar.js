// THE GUITAR (owner, 7 Nov 2026: "i want to add the guitar back into game. use the polyfork assets ... hand 3d model, physics, real string acoustics, sounds, closeup, fingers"; his picks: own one and play it anywhere, and the park's is anyone's; play it yourself or a song from the book; the strings' physics): GUITAR, the item (the bodega sells it), the park's guitar on its stand, playing (keys and the panel), the close-up, and everyone near hearing and seeing it.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INSTR, INV, NPCS, ONLINE, PARK, pos, st, UI, W3, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {LEVEL, MAPG, SYS, TILE} from './006-map-pre.js';
import {GTBOOK, GTCHORD, gtCompile} from './108-game-play-3-guitar-2-tunes.js';
import {BODIES} from './111a-bodies.js';
import {BODEGA} from './146ze-bodega.js';
import {SONGBK} from './146znz-songbook.js';
import {GSND} from './146zo-guitar-sound.js';
import {GHOLD} from './146zoa-guitar-hold.js';
const GUITAR={}; window.GUITAR=GUITAR;
{ const say=(t,c)=>SAY(t,c||'#e8e2cc'), now=()=>performance.now()/1000;
  FORAGE.add({names:{guitar:'A GUITAR'}}); FORAGE.sell('guitar');
  // the book: the old game's five, then the downloaded pieces (data/guitar-songs.json, fetched the first time anyone near plays), each with the GUITAR skill it needs
  const LV0={'Romance':35,'Cielito Lindo':4,'La Cucaracha':1,'De Colores':6,'Las Mañanitas':3}; for(const b of GTBOOK)if(b.lvl==null)b.lvl=LV0[b.name]??10;
  const SONGF=__LAZY__("data/guitar-songs.json"); let songsP=null;
  const loadSongs=()=>songsP||(songsP=SONGF().then(J=>{ for(const g of J.songs)GTBOOK.push({name:g.name,by:g.by,lvl:g.lvl,secs:g.secs,credit:g.credit,notes:g.n}); fillSongs(); }).catch(e=>{ songsP=null; console.warn('guitar songs',e); }));
  const SONGS=()=>GTBOOK.map((b,i)=>[i,b]).filter(([,b])=>!b.kept);
  const skill=()=>FORAGE.sk?FORAGE.sk('guitar')||0:0, canPlay=i=>!!GTBOOK[i]&&SONGBK.can('guitar',GTBOOK,GTBOOK[i]);
  FORAGE.MAXFN.push(()=>fillSongs());
  GUITAR.loadSongs=loadSongs; GUITAR.canPlay=canPlay; GUITAR.BOOK=GTBOOK;
  // the chords on the number keys (more on the panel)
  const BRIGHT={p:.5,i:1,m:1,a:1,s:.85};

  /* ---------- a player: their live score (what they play, the same shape as a song's), or a song from the book; their voice; the guitar on their body ---------- */
  const mk=(id)=>({id,live:{tune:[],strum:[],lh:[],pos:[{t:0,p:1}]},song:-1,s0:0,cur:0,chord:'',capo:0,H:null,V:null});
  const score=P=>P.song>=0?GTBOOK[P.song].c:P.live, time=P=>P.song>=0?now()-P.s0:now();
  const voice=P=>{ if(!GSND.ok){ GSND.wake(); return null; } return P.V||(P.V=GSND.voice(P.id)); };
  const trim=P=>{ const L=P.live, t=now()-8; for(const k of ['tune','strum'])while(L[k].length>60&&L[k][0].t0==null?L[k][0].t<t:L[k].length>60&&L[k][0].t0<t)L[k].shift(); L.lh=L.lh.filter(q=>q.t1>t); if(L.pos.length>20)L.pos.splice(0,L.pos.length-20); };
  const fretOf=(P,s)=>{ const c=P.chord&&GTCHORD[P.chord]; const q=c&&c.find(x=>x.s===s); return q?q.k:0; };
  const note=(P,n)=>{ const V=voice(P); if(!V)return; GSND.pluck(V,n.s,n.at,GSND.now()+Math.max(0,n.t-now())+.01,n.amp,BRIGHT[n.r]||1,GHOLD.plFrac(n.r)); };
  // GUITAR rises by playing: a song played through (a try every half minute of it, nearer its level the likelier), and playing freely (a try every 25 notes, worth less past 40)
  // busking: a song played through near townsfolk earns tips, more for a harder song, a better player and a bigger crowd (at most six count)
  const busk=T=>{ let k=0; for(const N of NPCS.all())if(N.g&&N.g.visible&&N.st&&Math.hypot(N.st.x-pos.x,N.st.z-pos.z)<12*TILE)k++; k=Math.min(6,k); if(!k)return; const tip=Math.max(1,Math.round(k*(.5+(T.lvl||10)/40)*(.5+FORAGE.sk('guitar')/50)*(.7+Math.random()*.6))); INV.cash+=tip; SAY(`${k} ${k>1?'PEOPLE':'PERSON'} LISTENED. YOU MAKE $${tip} IN TIPS.`,'#f2c14e'); };
  let freeN=0; const practise=()=>{ if(++freeN%25===0)FORAGE.use('guitar',-10,45); };
  const ACT={
    chord:(P,nm)=>{ if(nm&&!GTCHORD[nm])return; const t=now(), L=P.live, old=P.chord&&GTCHORD[P.chord]||[], nw=nm?GTCHORD[nm]:[], V=P.V;
      for(const q of L.lh)if(q.t1>t)q.t1=t+.02;
      for(const c of nw)if(c.k)L.lh.push({f:c.f,s:c.s,k:c.k+P.capo,t0:t+.04,t1:1e9});
      for(let s=1;s<=6;s++){ const a=old.find(c=>c.s===s), b=nw.find(c=>c.s===s); if(V&&(a?a.k:0)!==(b?b.k:0))GSND.mute(V,s,GSND.now()+.02); }
      L.pos.push({t:t+.15,p:1+P.capo}); P.chord=nm||''; },
    strum:(P,kind)=>{ const t=now(), L=P.live, ch=P.chord?GTCHORD[P.chord]:[1,2,3,4,5,6].map(s=>({s,k:0})), dn=kind!=='u', full=kind==='D';
      const ss=ch.filter(c=>full||c.s<=4).map(c=>c.s).sort((a,b)=>dn?b-a:a-b); if(!ss.length)return; const T=full?.055:.03; L.strum.push({t0:t,T,dn});
      ss.forEach((s,i)=>{ const n={t:t+T*i/Math.max(1,ss.length-1),s,k:fretOf(P,s),r:'s',amp:(dn?.42:.32)*(full&&s>4?1.12:1)}; n.at=n.k+P.capo; L.tune.push(n); note(P,n); }); trim(P); },
    pluck:(P,s)=>{ const t=now(), r=s>=4?'p':s===3?'i':s===2?'m':'a', n={t,s,k:fretOf(P,s),r,amp:r==='p'?.6:.5}; n.at=n.k+P.capo; P.live.tune.push(n); note(P,n); trim(P); },
    capo:(P,c)=>{ P.capo=Math.max(0,Math.min(7,c|0)); ACT.chord(P,P.chord); },
    song:(P,v)=>{ const r=SONGBK.read(v), i=r.i, T=GTBOOK[i]; if(!T)return; if(!T.c)gtCompile(T); P.song=i; P.s0=now(); P.cur=0; P.done=0; P.fail=r.fail; P.miss=r.miss; P.seed=r.seed; },
    stop:P=>{ if(P.song<0)return; P.song=-1; if(P.V)for(let s=1;s<=6;s++)GSND.mute(P.V,s,GSND.now()+.01,.05); ACT.chord(P,P.chord); }};
  // a song's notes go to the strings a little ahead of the clock, and the left hand's lifts mute them
  const songTick=P=>{ if(P.song<0)return; const T=GTBOOK[P.song], c=T.c, t=time(P); if(P.fail&&t>P.fail){ ACT.stop(P); if(P===ME){ tell('stop'); SONGBK.done('guitar',T,false); fillSongs(); drawPanel(); } return; }
    if(P===ME&&SONGBK.tick('guitar',T,P,t))drawPanel();
    if(t>c.len){ ACT.stop(P); if(P===ME){ SONGBK.done('guitar',T,true); busk(T); fillSongs(); drawPanel(); } return; } const V=voice(P); if(!V)return;
    while(P.cur<c.ev.length&&c.ev[P.cur].t<=t+.12){ const e=c.ev[P.cur++]; if(e.t<t-.05)continue; const when=GSND.now()+Math.max(0,e.t-t)+.02; let d=0; if(e.n&&(P.fail&&e.t>P.fail-SONGBK.LEAD||SONGBK.wrong(P,P.cur))){ d=SONGBK.slip(); if(d===0)continue; d=d||0; }
      if(e.n)GSND.pluck(V,e.n.s,Math.max(0,e.n.at+d),when,e.n.amp,e.n.tone>=4000?1:e.n.tone>=3500?.8:.5,GHOLD.plFrac(e.n.r)); else GSND.mute(V,e.s,when); } };
  const hold=(P,me,PM,body)=>{ if(P.H&&P.H.me===me)return; if(P.H)GHOLD.detach(P.H); P.H=me&&PM?GHOLD.attach(me,PM,body,{score:()=>score(P),time:()=>time(P)}):null; };
  const unhold=P=>{ if(P.H)GHOLD.detach(P.H); P.H=null; if(P.V){ GSND.drop(P.id); P.V=null; } };
  const unsling=P=>{ if(P.B)GHOLD.unsling(P.B); P.B=null; }, sling=(P,me,PM)=>{ if(P.B&&P.B.me===me)return P.B.upd(); unsling(P); if(me&&PM)P.B=GHOLD.sling(me,PM); };

  /* ---------- you ---------- */
  const ME=mk('me'); let on=false, from='', prevView='';
  const myMesh=()=>W3.group.children.find(m=>m.userData&&m.userData.hands&&m.userData.PM&&m.visible!==undefined);
  const tell=(k,v)=>{ if(ONLINE.send)ONLINE.send({t:'gtr',k,v:v==null?'':v}); };
  GUITAR.start=(src='own')=>{ if(on)return; if(st.water&&st.water.in||st.ride||st.climb||st.hang)return say('NOT HERE: STAND SOMEWHERE STEADY TO PLAY.','#c8a090');
    if(WIELD.on)return say('YOUR HANDS ARE FULL: PUT AWAY THE '+WIELD.what()+' FIRST.','#c8a090');
    if(INSTR&&INSTR.on())INSTR.stop(); GSND.wake(); on=true; from=src; GUITAR.stow(); ME.song=-1; ME.chord=''; ME.live={tune:[],strum:[],lh:[],pos:[{t:0,p:1}]}; ACT.chord(ME,'');
    prevView=UI.view; if(CU.on&&!UI.persp)UI.setView('third'); panel(true); tell('on',src==='park'?'k':'f'); if(src==='park'&&STAND.g)STAND.gm.visible=false;
    say('YOU TAKE UP THE GUITAR. PICK A PIECE FROM THE BOOK · P PLAYS IT · TAB THE CLOSE-UP · ESC TO STOP.'); };
  // put down, your own guitar goes on your back (others see it) till you stow it in the bag
  let slung=false; GUITAR.slung=()=>slung; GUITAR.stow=()=>{ slung=false; unsling(ME); };
  GUITAR.stop=()=>{ if(!on)return; on=false; unhold(ME); if(from==='own'&&FORAGE.has('guitar'))slung=true; panel(false); tell('off'); if(STAND.gm)STAND.gm.visible=true; if(prevView&&prevView!==UI.view&&!/third/.test(prevView))UI.setView(prevView); prevView=''; };
  GUITAR.on=()=>on; GUITAR.ME=ME; GUITAR.ACT=ACT;
  GUITAR.play=(k,v)=>{ if(!on)return; if(k==='song'&&v===ME.song)k='stop';
    if(k==='song'&&!canPlay(v)){ const T=GTBOOK[v]; return say(T?`${T.name.toUpperCase()} IS NOT OPEN TO YOU YET (GUITAR ${T.lvl}; YOURS IS ${skill().toFixed(1)}). LEARN THE PIECES YOU HAVE.`:'THAT PIECE IS NOT IN THE BOOK.','#c8a090'); }
    if(k==='song'){ const T=GTBOOK[v]; if(!T.c)gtCompile(T); v=SONGBK.code(v,SONGBK.start('guitar',T),T.c.len); }
    if(k==='strum'||k==='pluck')practise(); ACT[k](ME,v); tell(k,v); drawPanel(); };
  FORAGE.ACT.guitar=()=>{ if(on)GUITAR.stop(); else GUITAR.start('own'); };
  FORAGE.ACT.gplay=FORAGE.ACT.guitar;
  FORAGE.ACT.gstow=()=>{ GUITAR.stow(); say('YOU STOW THE GUITAR IN YOUR BAG.'); };
  FORAGE.ROWB.push(id=>id==='guitar'?[[on?'PUT IT AWAY':'PLAY','gplay'],...(slung&&!on?[['STOW IT','gstow']]:[])]:[]);

  /* ---------- keys while you play (they are the guitar's, not your feet's) ---------- */
  addEventListener('keydown',e=>{ if(!on||e.ctrlKey||e.metaKey||e.altKey)return; if(e.target&&e.target.closest&&e.target.closest('input,textarea,select,[contenteditable="true"]'))return; if(UI.menuOpen)return;
    const c=e.code; let used=true;
    if(c==='Escape')GUITAR.stop();
    else if(c==='KeyP'){ if(!e.repeat)GUITAR.play(ME.song>=0?'stop':'song',ME.song>=0?null:+(PN&&PN.querySelector('#gtsong').value||0)); }
    else if(c==='Tab'){ if(!e.repeat)closeUp(!CU.on); }
    else if(/^(Key[A-Z]|Digit\d|Arrow\w+|Space|Shift\w*|Bracket\w+)$/.test(c)){}   // (your feet stay put while you play)
    else used=false;
    if(used){ e.preventDefault(); e.stopImmediatePropagation(); } },true);

  /* ---------- the panel ---------- */
  let PN=null;
  const css=document.createElement('style'); css.textContent=`#gtp{position:fixed;left:50%;bottom:calc((84px + env(safe-area-inset-bottom,0px)) / var(--uiz,1));transform:translateX(-50%);z-index:7;zoom:var(--uiz,1);background:#0b0d13e6;border:2px solid #2a3040;padding:6px 8px;color:#e8e2cc;font:9px Silkscreen,monospace;width:min(640px,calc(100vw - 32px));box-sizing:border-box}
    #gtp .r{display:flex;flex-wrap:wrap;gap:2px 4px;align-items:center;margin:2px 0} #gtp button{font:inherit;color:inherit;background:#161a24;border:2px solid #2a3040;padding:2px 5px;cursor:pointer} #gtp button[aria-pressed=true]{background:#2c4a36;border-color:#5fa06e}
    #gtp select{font:inherit;color:inherit;background:#0b0d13;border:2px solid #2a3040;padding:2px;max-width:190px} #gtp input[type=range]{width:70px} #gtp .h{margin-right:8px} #gtp .d{opacity:.6;margin:0 2px 0 8px} #gtp.ml{font-size:15px!important}`;
  document.head.appendChild(css);
  const panel=show=>{ if(!show){ if(PN)PN.hidden=true; return; } if(!PN){ PN=document.createElement('div'); PN.id='gtp'; document.body.appendChild(PN);
      PN.innerHTML=`<div class="r"><span class="h" id="gtsk">GUITAR</span><span id="gtnow"></span></div>
        <div class="r"><select id="gtsong" aria-label="song"></select><button id="gtplay" title="P">PLAY</button><button id="gtcu" title="tab">CLOSE-UP</button><span class="d">VOL</span><input type="range" id="gtvol" min="0" max="1" step=".05" aria-label="volume"><button id="gtoff" title="esc">PUT AWAY</button></div>`;
      PN.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; GSND.wake();
        if(b.id==='gtplay')GUITAR.play(ME.song>=0?'stop':'song',ME.song>=0?null:+PN.querySelector('#gtsong').value); else if(b.id==='gtcu')closeUp(!CU.on); else if(b.id==='gtoff')GUITAR.stop(); b.blur(); });
      for(const el of PN.querySelectorAll('select,input'))el.addEventListener('keydown',e=>e.stopPropagation());
      PN.querySelector('#gtvol').oninput=e=>GSND.setVol(+e.target.value); }
    PN.hidden=false; fillSongs(); loadSongs(); drawPanel(); };
  const esc=t=>String(t).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
  const fillSongs=()=>{ const el=PN&&PN.querySelector('#gtsong'); if(!el)return; const v=el.value;
    el.innerHTML=SONGBK.options('guitar',GTBOOK);
    if(v)el.value=v; };
  const drawPanel=()=>{ if(!PN||PN.hidden)return; const sel=(b,v)=>{ b.setAttribute('aria-pressed',String(v)); b.setAttribute('aria-selected',String(v)); }; 
    PN.querySelector('#gtplay').textContent=ME.song>=0?'STOP':'PLAY'; sel(PN.querySelector('#gtcu'),CU.on); sel(PN.querySelector('#gtplay'),ME.song>=0); PN.querySelector('#gtvol').value=GSND.vol;
    PN.querySelector('#gtsk').textContent='GUITAR '+skill().toFixed(1); PN.querySelector('#gtnow').textContent=ME.song>=0?'PLAYING '+GTBOOK[ME.song].name.toUpperCase()+(GTBOOK[ME.song].credit?' · '+GTBOOK[ME.song].credit.split(': ').pop().split(', http')[0]:''):'PICK A PIECE'; };

  /* ---------- the close-up: the view cut in close on the guitar and both hands (TAB) ---------- */
  const CU={on:true}, CV=new THREE.Vector3(), CT=new THREE.Vector3();
  const closeUp=v=>{ CU.on=v; if(v&&!UI.persp)UI.setView('third'); drawPanel(); };
  UI.camKeeps.push((p,T)=>{ if(!on||!CU.on||!ME.H||UI.view==='first')return; const m=ME.H.gm.matrixWorld; CT.set(.02,.52,.04).applyMatrix4(m); CV.set(.16,.46,.95).applyMatrix4(m); p.copy(CV); T.copy(CT); });
  GUITAR.closeUp=closeUp; GUITAR.CU=CU; GUITAR.GSND=GSND; GUITAR.GHOLD=GHOLD; GUITAR.THEM=()=>THEM;

  /* ---------- the park's guitar on its stand (data/world.json parkPlaces.guitar): double-click it and it's yours to play while you stay ---------- */
  const STAND={g:null,gm:null}; GUITAR.STAND=STAND;
  GUITAR.standTile=()=>{ const q=LEVEL.parkPlaces&&LEVEL.parkPlaces.guitar; return q&&PARK.ox!=null?[q.x+PARK.ox,q.y+PARK.oy]:null; };
  const standAt=()=>{ const q=LEVEL.parkPlaces&&LEVEL.parkPlaces.guitar; if(!q||PARK.ox==null||!MAPG.park)return null; return {x:SHARED.BOD.XS(q.x+PARK.ox),z:SHARED.BOD.ZS(q.y+PARK.oy),hd:(q.hd||0)*Math.PI/180}; };
  const buildStand=at=>{ const MW=TILE/.84, g=new THREE.Group(), wood=new THREE.MeshLambertMaterial({color:0x2a2420}), y=SHARED.groundY(at.x,at.z);
    for(const [a,l] of [[0,.62],[2.1,.5],[-2.1,.5]]){ const leg=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,l,5),wood); leg.position.set(Math.sin(a)*.14,l/2*.95,Math.cos(a)*.14-.04); leg.rotation.set(Math.cos(a)*.35*(a?1:-1),0,-Math.sin(a)*.35); g.add(leg); }
    const cradle=new THREE.Mesh(new THREE.BoxGeometry(.3,.03,.08),wood); cradle.position.set(0,.13,.02); g.add(cradle);
    const gm=GHOLD.model(); gm.rotation.x=-.22; gm.position.set(0,.12,.06); g.add(gm);
    g.scale.setScalar(MW); g.position.set(at.x,y,at.z); g.rotation.y=at.hd; MAPG.park.add(g); STAND.g=g; STAND.gm=gm;
    UI.thing({name:'THE PARK\'S GUITAR (PLAY IT)',obj:gm,reach:1.8*TILE,near:3*TILE,tall:y+1.1*MW,act:()=>{ if(on)GUITAR.stop(); else GUITAR.start('park'); }}); };
  let sT=0; SYS.add('places',dt=>{ if((sT-=dt||0)>0)return; sT=.5; if(STAND.g)return; const at=standAt(); if(at&&Math.hypot(at.x-pos.x,at.z-pos.z)<60*TILE)buildStand(at); },'146zob-guitar');

  /* ---------- the bodega sells it, laid on its bottom shelf ---------- */
  if(BODEGA.MAKE){ BODEGA.MAKE.guitar=()=>{ const g=new THREE.Group(), m=GHOLD.model(); m.rotation.set(-Math.PI/2,0,Math.PI/2); m.position.set(.5,.065,0); g.add(m); return g; }; BODEGA.LAYOUT.push(['wr1',0,['guitar']]); }

  /* ---------- the others: their guitars from their word ('gtr'), their sound from where they stand ---------- */
  const THEM=new Map();
  ONLINE.mine.gtr=()=>on?(ME.song>=0?'s':from==='park'?'k':'f'):slung?'b':null;
  ONLINE.hear.gtr=m=>{ if(!m.id)return; let P=THEM.get(m.id); if(!P){ P=mk(m.id); THEM.set(m.id,P); } const k=m.k, v=m.v;
    if(k==='on'||k==='off'){ if(k==='off'){ unhold(P); } return; }
    if(k==='chord'&&(v===''||GTCHORD[v]))ACT.chord(P,v); else if(k==='strum'&&/^[Ddu]$/.test(v))ACT.strum(P,v); else if(k==='pluck'&&+v>=1&&+v<=6)ACT.pluck(P,+v); else if(k==='capo')ACT.capo(P,+v||0);
    else if(k==='song'&&parseInt(v)>=0)(GTBOOK[parseInt(v)]?Promise.resolve():loadSongs()).then(()=>{ if(GTBOOK[parseInt(v)])ACT.song(P,String(v)); }); else if(k==='stop')ACT.stop(P); };

  /* ---------- each frame: your guitar on your body, the songs' notes, the others' guitars on theirs ---------- */
  SYS.add('dress',()=>{
    if(on){ if(!FORAGE.has('guitar')&&from==='own'){ GUITAR.stop(); return; } if(st.water&&st.water.in||st.ride){ GUITAR.stop(); return; }
      if(from==='park'&&STAND.g&&Math.hypot(STAND.g.position.x-pos.x,STAND.g.position.z-pos.z)>4*TILE){ GUITAR.stop(); say('YOU LEAVE THE PARK\'S GUITAR ON ITS STAND.'); return; }
      const me=myMesh(), body=BODIES.by[BODIES.pick()]; hold(ME,me,me&&me.userData.PM,body); songTick(ME); if(ME.V)GSND.place(ME.V,pos.x,pos.z); }
    else if(slung){ if(!FORAGE.has('guitar'))GUITAR.stow(); else { const me=myMesh(); sling(ME,me,me&&me.userData.PM); } }
    for(const [id,P] of THEM){ const o=ONLINE.others.get(id); if(!o||!o.x||!o.x.gtr){ unhold(P); unsling(P); THEM.delete(id); continue; }
      const F=o.fig; if(o.x.gtr==='b'){ unhold(P); if(F&&F.body)sling(P,F.me,F.PM); continue; } unsling(P); if(F&&F.body&&F.g.visible){ hold(P,F.me,F.PM,F.body); o.wantPose=true; } else if(P.H){ GHOLD.detach(P.H); P.H=null; }
      songTick(P); if(P.V&&o.p)GSND.place(P.V,o.p.x,o.p.z); }
    // someone already playing when you came: their guitar, open strings till they play
    for(const o of ONLINE.others.values())if(o.x&&o.x.gtr&&!THEM.has(o.id)&&o.id){ THEM.set(o.id,mk(o.id)); } },'146zob-guitar'); }
export {GUITAR};
