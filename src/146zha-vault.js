// THE MUSEUM'S SEALED VAULT: a steel hatch in the art museum's floor with three dials and a star chart; the curator sets a new combination each night and leaves its parts round the city (the cornerstone, the founder's statue, a note in the bookstore, the theatre's sky poster); each clue read and the vault opened gives INTELLIGENCE; inside, a case of antiquities a day to donate to the museum, which pays and shows them.
import {SHARED, THREE} from './003-shx.js';
import {CITY, FORAGE, INSPECT, INV, MAIL, pos, ROOMS, SFX, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {FADE, SOL, STORE, SYS, TILE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
import {LIB} from './144ca-library.js';
const MVAULT={}; window.MVAULT=MVAULT;
{ const say=(t,c)=>SAY(t,c||'#e8dcb0'), T=TILE, MW=TILE/.84, TM=.924, KEY='vault', OX=()=>SHARED.BOD.XS(-3280), OZ=()=>SHARED.BOD.ZS(0), RW=7, RD=7, H=3.2;
  const day=()=>window.MAIL&&MAIL.ready?MAIL.day():window.CITY?CITY.day||0:0;
  const hs=(a,b)=>{ let h=Math.imul(a|0,374761393)+Math.imul(b|0,668265263); h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
  // the antiquities: found in the vault, donated to the museum (the first of each pays twice its worth and goes on show), the Professor buys the rest
  const ART=[['va_astrolabe','A BRASS ASTROLABE',90],['va_scarab','A LAPIS SCARAB',60],['va_coin','A GOLD COIN OF ROME',70],['va_lamp','A CLAY OIL LAMP',40],['va_seal','A JADE SEAL',80],['va_globe','A CELESTIAL GLOBE',120],['va_chart','A SEA CHART ON VELLUM',75],['va_idol','A STONE IDOL',100]];
  const NM=Object.fromEntries(ART.map(a=>[a[0],a[1]])), PR=Object.fromEntries(ART.map(a=>[a[0],a[2]]));
  FORAGE.add({names:NM,prices:PR,sellable:true}); (FORAGE.BUYK.antiquities=FORAGE.BUYK.antiquities||[]).push('va_');
  FORAGE.GIFTS.push({is:id=>/^va_/.test(id),place:'art',pay:id=>(PR[id]||20)*2,thanks:(id,p)=>`THE CURATOR SETS YOUR ${NM[id]} IN THE MUSEUM'S CASE AND PAYS $${p}.`});
  FORAGE.BOOK.push({id:'vault',title:'THE VAULT',rows:()=>ART.map(a=>[a[1],FORAGE.has(a[0])>0||FORAGE.gave('art',a[0]),FORAGE.gave('art',a[0])?'IN THE MUSEUM':'',a[2]>=100]),foot:'The art museum\'s sealed vault opens to the night\'s combination; its parts are hidden round the city. Donate what you find there.'});
  FORAGE.HELP.push("THE MUSEUM'S VAULT: a hatch in the art museum's floor. Three dials and a star, new each night; the cornerstone, the founder's statue, a note in the bookstore and the sky poster hold the parts.");
  const LOOK={va_astrolabe:P=>[P('tor',0xc8a040,0,.12,0,.11,.11,.02,Math.PI/2,0,0,{metal:1,rough:.3}),P('cyl',0xb08a30,0,.12,0,.1,.01,.1,Math.PI/2,0,0,{metal:1,rough:.3}),P('box',0x8a6a20,0,.12,.012,.2,.012,.006,0,.6,0,{metal:1})],
    va_scarab:P=>[P('sph',0x2a4aa0,0,.03,0,.07,.035,.09,0,0,0,{rough:.2}),P('sph',0x22408a,0,.035,.07,.035,.025,.03)],va_coin:P=>[P('cyl',0xe8c040,0,.006,0,.05,.012,.05,0,0,0,{metal:1,rough:.25})],
    va_lamp:P=>[P('sph',0xa86a40,0,.04,0,.08,.04,.06),P('cone',0xa86a40,.08,.045,0,.03,.06,.03,0,Math.PI/2)],va_seal:P=>[P('box',0x4a8a5a,0,.04,0,.07,.08,.07,0,0,0,{rough:.25}),P('sph',0x4a8a5a,0,.1,0,.035,.03,.035)],
    va_globe:P=>[P('cyl',0x6a4a2a,0,.02,0,.06,.04,.06),P('ball',0x1a2a5a,0,.16,0,.11,.11,.11),P('tor',0xc8a040,0,.16,0,.12,.12,.012,0,.4,0,{metal:1})],
    va_chart:P=>[P('box',0xd8c8a0,0,.004,0,.26,.008,.18),P('cyl',0x8a6a44,-.13,.015,0,.015,.19,.015,Math.PI/2)],va_idol:P=>[P('box',0x7a766a,0,.08,0,.08,.16,.06),P('sph',0x7a766a,0,.2,0,.05,.05,.05),P('box',0x6a665a,0,.01,0,.12,.02,.09)]};
  const model=id=>{ const g=new THREE.Group(), f=LOOK[id]; if(f&&INSPECT.part)for(const m of f(INSPECT.part))g.add(m); return g; };
  if(INSPECT.kinds)INSPECT.kinds.push({is:id=>!!LOOK[id],make:id=>{ '@later'; return model(id); }});
  // the day's state: the dials as you left them, the star, opened today, the clues read today (the time lock clears it all at midnight)
  const S={v:1,d:-1,dials:[0,0,0],star:-1,open:-1,read:{}}; try{ const o=JSON.parse(OWNED.get(KEY)||'null'); if(o&&o.v===1)Object.assign(S,o); }catch(e){} const save=()=>OWNED.set(KEY,JSON.stringify(S));
  const lock=()=>{ const d=day(); if(S.d!==d){ S.d=d; S.dials=[0,0,0]; S.star=-1; S.read={}; save(); } return d; };
  // the night's combination
  const STARS=[['THE LANTERN',[[.5,.15],[.3,.35],[.7,.35],[.3,.75],[.7,.75],[.5,.9]],[[0,1],[0,2],[1,3],[2,4],[3,5],[4,5],[1,2]]],['THE HARE',[[.2,.3],[.3,.15],[.4,.35],[.6,.5],[.85,.55],[.7,.8],[.4,.8]],[[0,2],[1,2],[2,3],[3,4],[3,5],[3,6]]],
    ['THE SCALES',[[.5,.15],[.5,.6],[.15,.45],[.85,.45],[.2,.7],[.8,.7]],[[0,1],[2,3],[2,4],[3,5]]],['THE KEY',[[.2,.3],[.35,.2],[.35,.4],[.5,.3],[.85,.3],[.85,.45],[.7,.45]],[[0,1],[1,3],[0,2],[2,3],[3,4],[4,5],[6,4]]],
    ['THE SHIP',[[.15,.6],[.85,.6],[.7,.8],[.3,.8],[.5,.15],[.5,.6],[.75,.45]],[[0,1],[1,2],[2,3],[3,0],[4,5],[4,6]]],['THE CROWN',[[.15,.7],[.85,.7],[.15,.35],[.33,.5],[.5,.25],[.67,.5],[.85,.35]],[[0,1],[0,2],[2,3],[3,4],[4,5],[5,6],[6,1]]]];
  const WORDS={3:['OWL','ARK','URN'],4:['MOON','LAMP','VASE'],5:['COMET','ATLAS','CROWN'],6:['PLANET','STATUE','CANVAS'],7:['GALLERY','LANTERN','HISTORY'],8:['CURATORS','TREASURE','MOONRISE'],9:['TELESCOPE','ANTIQUITY','STARLIGHT']};
  const ROMAN=['','I','II','III','IV','V','VI','VII','VIII','IX'];
  const code=d=>{ const a=1+Math.floor(hs(d,71)*9), b=1+Math.floor(hs(d,73)*9), c=3+Math.floor(hs(d,79)*7), s=Math.floor(hs(d,83)*STARS.length); return {dials:[a,b,c],star:s}; };
  const riddle=(b,d)=>{ const k=Math.floor(hs(d,89)*3), x=1+Math.floor(hs(d,97)*8); return k===0?`HALF OF ${2*b}`:k===1?`${b+x} TAKE AWAY ${x}`:b%3===0?`THREE TIMES ${b/3}`:`ONE MORE THAN ${b-1}`; };
  MVAULT.code=()=>code(lock());
  // INTELLIGENCE grows by reading the city (a stat, 141-forage; capped at its most)
  const smart=(n,why)=>{ const g=FORAGE.stats.gain('int',n); if(g)say(`${why} YOUR INTELLIGENCE RISES TO ${FORAGE.ST.int}.`,'#7fd0ff'); };
  const clue=(id,title,draw,cap)=>{ const d=lock(); MINI.look(title,draw,cap); if(S.read[id]!==d){ S.read[id]=d; save(); smart(1,'YOU WORK IT OUT.'); } MVAULT.reads=(MVAULT.reads||0)+1; };
  const paper=(g,w,h,bg='#e8dcb8')=>{ g.fillStyle=bg; g.fillRect(0,0,w,h); g.strokeStyle='#8a6a3a'; g.lineWidth=2; g.strokeRect(10,10,w-20,h-20); g.fillStyle='#2a2420'; g.textAlign='center'; };
  const lines=(g,w,L,y0,sz=14)=>{ g.font=sz+'px Georgia,serif'; let y=y0; for(const l of L){ g.fillText(l,w/2,y); y+=sz*1.5; } };
  const starPic=(g,s,x,y,w,c='#f4ecd0')=>{ const [,P,E]=STARS[s]; g.strokeStyle=c; g.globalAlpha=.6; g.lineWidth=1; for(const [a,b] of E){ g.beginPath(); g.moveTo(x+P[a][0]*w,y+P[a][1]*w); g.lineTo(x+P[b][0]*w,y+P[b][1]*w); g.stroke(); } g.globalAlpha=1; g.fillStyle=c; for(const p of P)g.fillRect(x+p[0]*w-2,y+p[1]*w-2,4,4); };
  MVAULT.clues={
    plaque:()=>{ const c=code(lock()); clue('plaque','THE CORNERSTONE',(g,w,h)=>{ paper(g,w,h,'#9a8a6a'); g.fillStyle='#2a2016'; lines(g,w,['THIS HOUSE OF ART','WAS RAISED BY ITS FRIENDS','FOR EVERYONE'],70,18); g.fillStyle='#f4f0e4'; lines(g,w,['BENEATH IT, IN FRESH CHALK:',`"THE FIRST DIAL: ${ROMAN[c.dials[0]]}"`],200,15); },'Bronze letters on the museum\'s cornerstone, and the curator\'s chalk.'); },
    statue:()=>{ const d=lock(), c=code(d); clue('statue',"THE FOUNDER'S STATUE",(g,w,h)=>{ paper(g,w,h,'#5a5a4a'); g.fillStyle='#e8e0c0'; lines(g,w,['ADA PELL, FOUNDER','"WHO SEEKS, COUNTS."'],80,18); g.fillStyle='#f4f0e4'; lines(g,w,['SCRATCHED INTO THE PLINTH:',`"THE SECOND DIAL IS ${riddle(c.dials[1],d)}"`],190,14); },'The inscription on the bronze founder.'); },
    note:()=>{ const d=lock(), c=code(d), L=WORDS[c.dials[2]], wd=L[Math.floor(hs(d,101)*L.length)]; clue('note','A FOLDED NOTE',(g,w,h)=>{ paper(g,w,h); lines(g,w,['PROFESSOR, FOR THE VAULT TONIGHT:','','THE LAST DIAL IS AS MANY','AS THE LETTERS IN',`"${wd}"`,'','BURN THIS.'],60,15); },'Tucked into the lectern\'s book, in the curator\'s hand.'); },
    sky:()=>{ const c=code(lock()); clue('sky',"TONIGHT'S SKY",(g,w,h)=>{ g.fillStyle='#0e1428'; g.fillRect(0,0,w,h); g.fillStyle='#f4ecd0'; g.textAlign='center'; g.font='16px Georgia,serif'; g.fillText('THE PLANETARIUM SHOW: TONIGHT\'S SKY',w/2,34); starPic(g,c.star,w/2-90,60,180); g.font='14px Georgia,serif'; g.fillText('LOOK UP FOR '+STARS[c.star][0],w/2,270); },'A poster by the theatre\'s door.'); }};
  // the dials and the star chart: set them, then turn the wheel
  const B='style="margin:0 2px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 8px;cursor:pointer"';
  const P=document.createElement('div'); P.id='vaultp'; P.hidden=true; P.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);width:min(480px,92vw);max-height:80vh;overflow:auto;z-index:21;padding:14px 16px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #5a6070;zoom:var(--uiz,1)';
  document.body.appendChild(P); for(const ev of ['keydown','keyup'])P.addEventListener(ev,e=>{ if(ev==='keydown'&&e.key==='Escape')P.hidden=true; e.stopPropagation(); });
  const SPIC=STARS.map((_,i)=>{ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'); g.fillStyle='#0e1428'; g.fillRect(0,0,64,64); starPic(g,i,6,6,52); return c.toDataURL(); });
  const draw=()=>{ '@later'; lock(); let o=`<h3 style="margin:0 0 4px;color:#f2c14e;font:12px Silkscreen,monospace">THE SEALED VAULT</h3><div style="color:#9b9584;margin-bottom:10px">Three brass dials and a star chart on a steel hatch. A time lock clears them at midnight; the curator sets a new combination each night.</div><div style="display:flex;gap:14px;justify-content:center;margin-bottom:10px">`;
    S.dials.forEach((v,i)=>{ o+=`<div style="text-align:center"><button ${B} data-dial="${i}" data-d="1">▲</button><div style="font-size:22px;color:#f2c14e;margin:4px 0">${v}</div><button ${B} data-dial="${i}" data-d="-1">▼</button></div>`; });
    o+=`</div><div style="color:#9b9584;margin-bottom:4px">THE STAR</div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">`+STARS.map((s,i)=>`<button data-star="${i}" style="font:inherit;color:#ece5d3;background:#0e1016;border:2px solid ${S.star===i?'#f2c14e':'#3a3f4e'};padding:3px;cursor:pointer;width:96px"><img src="${SPIC[i]}" width="64" height="64" style="image-rendering:pixelated;display:block;margin:0 auto"><div style="font-size:9px">${s[0]}</div></button>`).join('')+'</div>';
    o+=`<div style="text-align:center"><button ${B} data-turn="1">TURN THE WHEEL</button></div>`; const x=P.querySelector(':scope>.pX'); P.innerHTML=o; if(x)P.appendChild(x); };
  { const x=document.createElement('button'); x.className='pX'; x.textContent='X'; x.style.cssText='position:absolute;right:10px;top:10px;font:inherit;color:#c9ccd6;background:#0e1016;border:2px solid #3a3f4e;padding:3px 8px;cursor:pointer'; x.onclick=()=>{ P.hidden=true; }; P.appendChild(x); }
  P.addEventListener('click',e=>{ '@later'; const b=e.target.closest('button'); if(!b||b.classList.contains('pX'))return; const d=b.dataset; lock();
    if(d.dial){ const i=+d.dial; S.dials[i]=(S.dials[i]+(+d.d)+10)%10; save(); if(SFX.play)SFX.play('clunk',{vol:.15,pitch:1.6}); }
    if(d.star){ S.star=+d.star; save(); }
    if(d.turn){ if(MVAULT.try())return; } draw(); });
  MVAULT.set=(dials,star)=>{ lock(); S.dials=dials.slice(); S.star=star; save(); };
  MVAULT.try=()=>{ const d=lock(), c=code(d), ok=S.dials.every((v,i)=>v===c.dials[i])&&S.star===c.star;
    if(!ok){ say('THE WHEEL WILL NOT TURN. SOMETHING IS WRONG.','#c8a090'); if(SFX.play)SFX.play('clunk',{vol:.3,pitch:.6}); return false; }
    const first=S.open!==d; S.open=d; save(); P.hidden=true; if(first)smart(2,'THE TUMBLERS FALL. THE VAULT OPENS.'); else say('THE VAULT IS OPEN TILL MIDNIGHT.'); if(SFX.play)SFX.play('chirp',{vol:.4,pitch:.7}); setTimeout(()=>ROOMS.enter('vault'),700); return true; };
  MVAULT.isOpen=()=>S.open===lock();
  MVAULT.hatch=()=>{ if(MVAULT.isOpen())return ROOMS.enter('vault'); P.hidden=false; draw(); };
  // in the art museum: the hatch and its pedestal on the first floor, and the case of what has been given
  const DISP={g:null,n:-1}, gave=()=>ART.filter(a=>FORAGE.gave('art',a[0])).map(a=>a[0]);
  const fill=()=>{ const g=DISP.g; if(!g)return; for(const c of g.children.slice())g.remove(c); const L=gave(); DISP.n=L.length; L.forEach((id,i)=>{ const m=model(id); m.scale.setScalar(MW*1.6); m.position.set((i-(L.length-1)/2)*.32*MW,0,0); g.add(m); }); };
  { const f0=STORE.furnish&&STORE.furnish.art; STORE.furnish=STORE.furnish||{}; STORE.furnish.art=Sx=>{ '@later'; if(f0)f0(Sx); const F=IKIT.frame({x0:Sx.B.x0,y0:Sx.B.y0,x1:Sx.B.x1,y1:Sx.B.y1}), K=IKIT.room(F,o=>scene.add(o)), {box,cyl,use,pic,words}=K, t=d=>d*TM;
      const u=t(8), v=t(8.5), steel=0x6a7078, brass=0xb8923a;
      cyl(u,v,.85,0,.04,0x4a5058); cyl(u,v,.7,.04,.06,steel); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; cyl(u+Math.cos(a)*.78,v+Math.sin(a)*.78,.04,.04,.07,brass); }
      box(u-.05,v-.5,u+.05,v+.5,.06,.08,0x50565e); box(u-.5,v-.05,u+.5,v+.05,.06,.08,0x50565e);
      const pu=u+1.15; box(pu-.18,v-.18,pu+.18,v+.18,0,1.0,0x3a3e44); box(pu-.24,v-.24,pu+.24,v+.24,1.0,1.06,steel); for(let i=0;i<3;i++)cyl(pu-.12+i*.12,v+.25,.04,1.03,1.09,brass);
      pic(pu,v+.25,.62,.3,.3,0,1,words(32,32,'#0e1428',[['* .',4,6,'#f4ecd0',8],['. *',14,16,'#f4ecd0',8]]));
      use('THE SEALED VAULT (DIALS AND A STAR CHART)',u+.5,v,1.8,1.2,()=>MVAULT.hatch(),1.8);
      const cu=t(22), cv=t(8.5); box(cu-1.3,cv-.3,cu+1.3,cv+.3,0,.9,0x3a2a20); box(cu-1.32,cv-.32,cu+1.32,cv+.32,.9,.95,0x6a4a2a); K.sol(cu-1.35,cv-.35,cu+1.35,cv+.35);
      pic(cu,cv+.33,.45,.9,.3,0,1,words(72,24,'#efe6cf',[['FROM THE VAULT',36,3,'#2a2420',8,'center'],['GIVEN BY VISITORS',36,13,'#6a5a48',7,'center']]));
      use("THE VAULT'S CASE (WHAT VISITORS HAVE GIVEN)",cu,cv,2.6,1.6,()=>{ const L=gave(); say(L.length?'IN THE CASE: '+L.map(id=>NM[id]).join(', ')+'.':'THE CASE IS EMPTY. DONATE WHAT YOU FIND IN THE VAULT (YOUR PACK: DONATE).'); },1.8);
      K.flush(); const gm=new THREE.Mesh(new THREE.BoxGeometry(2.6*MW,.6*MW,.6*MW),new THREE.MeshLambertMaterial({color:0xcfe3ea,transparent:true,opacity:.18,depthWrite:false})), p=F.pw(cu,cv); gm.position.set(p[0],1.25*MW,p[1]); gm.rotation.y=F.hd(0,1); scene.add(gm);
      DISP.g=new THREE.Group(); DISP.g.position.set(p[0],.96*MW,p[1]); DISP.g.rotation.y=F.hd(0,1); scene.add(DISP.g); fill(); }; }
  { let t=0; SYS.add('life',dt=>{ if((t+=dt||0)<1)return; t=0; if(DISP.g&&DISP.g.parent&&gave().length!==DISP.n)fill(); if(DISP.g&&!DISP.g.parent)DISP.g=null; },'146zha-vault-case'); }
  // the clues round the city, made once you come near: the cornerstone and the founder by the art museum's door, the sky poster by the theatre's (by the art museum's while the theatre is away), the note on the bookstore's lectern
  LIB.inside.push(({K,W})=>{ '@later'; const u=W-.9, v=6.2; K.box(u-.12,v-.08,u+.02,v+.08,1.12,1.13,0xe8dcb8); K.use('A FOLDED NOTE (ON THE LECTERN)',u,v,.6,1.3,()=>MVAULT.clues.note(),1.4); });
  const ON=[]; let made=false, chk=0;
  const at=(SD,a,b)=>{ const X=SHARED.BOD.X, Z=SHARED.BOD.Z, d=[X(SD.door[0]),Z(SD.door[1])], o=[X(SD.out[0]),Z(SD.out[1])], n0=[o[0]-d[0],o[1]-d[1]], l=Math.hypot(n0[0],n0[1])||1, n=[n0[0]/l,n0[1]/l], tg=[n[1],-n[0]];
    const x=d[0]+n[0]*a*MW+tg[0]*b*MW, z=d[1]+n[1]*a*MW+tg[1]*b*MW; return {x,z,y:SHARED.groundY?SHARED.groundY(x,z):0,ry:Math.atan2(n[0],n[1]),n}; };
  const mk=(p,name,act,w,h,ah=0)=>{ const hb=new THREE.Mesh(new THREE.BoxGeometry(w*MW,h*MW,w*MW),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(p.x,p.y+(ah+h/2)*MW,p.z); scene.add(hb); ON.push(hb); UI.thing({name,obj:hb,reach:1.4*T,near:2.6*T,tall:(ah+h)*MW,act}); };
  const plate=(p,w,h,y,tex)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w*MW,h*MW),new THREE.MeshLambertMaterial({map:tex})); m.position.set(p.x,p.y+y*MW,p.z); m.rotation.y=p.ry; scene.add(m); ON.push(m); return m; };
  const make=()=>{ '@later'; const A=STORE.streetDoor.art, Th=STORE.streetDoor.theatre;
    { const p=at(A,-.3,-2.4); plate(p,.6,.4,1.2,IKIT.tex(24,16,(g,w,h)=>{ g.fillStyle='#8a6a3a'; g.fillRect(0,0,w,h); g.fillStyle='#d8b860'; g.fillRect(1,1,w-2,1); g.fillRect(1,h-2,w-2,1); for(let i=0;i<3;i++)g.fillRect(4,4+i*3,w-8,1); g.fillStyle='#f4f0e4'; g.fillRect(6,13,12,1); }));
      mk(p,'THE CORNERSTONE',()=>MVAULT.clues.plaque(),.8,1.4,.6); }
    { const p=at(A,2.4,3.6), G=new THREE.Group(), stone=new THREE.MeshLambertMaterial({color:0x8a8478}), bronze=new THREE.MeshLambertMaterial({color:0x5a6a4a}), add=(g,m,x,y,z,rx=0,rz=0)=>{ const o=new THREE.Mesh(g,m); o.position.set(x*MW,y*MW,z*MW); o.rotation.set(rx,0,rz); o.castShadow=true; G.add(o); };
      add(new THREE.BoxGeometry(.9,1.1,.9).scale(MW,MW,MW),stone,0,.55,0); add(new THREE.BoxGeometry(1,.1,1).scale(MW,MW,MW),stone,0,1.12,0);
      add(new THREE.CylinderGeometry(.16*MW,.22*MW,.9*MW,10),bronze,0,1.62,0); add(new THREE.CylinderGeometry(.13*MW,.16*MW,.45*MW,10),bronze,0,2.28,0); add(new THREE.SphereGeometry(.12*MW,10,8),bronze,0,2.62,0);
      add(new THREE.CylinderGeometry(.04*MW,.04*MW,.5*MW,6),bronze,.2,2.4,.12,-.6,-.4); add(new THREE.BoxGeometry(.18*MW,.24*MW,.05*MW),bronze,.26,2.62,.25,-.3);
      G.position.set(p.x,p.y,p.z); G.rotation.y=p.ry; scene.add(G); ON.push(G); SOL.up.push([p.x-.5*MW,p.z-.5*MW,p.x+.5*MW,p.z+.5*MW]);
      mk(p,"THE FOUNDER'S STATUE (AN INSCRIPTION)",()=>MVAULT.clues.statue(),1.2,2.8); }
    { const p=Th?at(Th,-.3,2.2):at(A,-.3,-4.4); plate(p,.7,1,1.0,IKIT.tex(28,40,(g,w,h)=>{ g.fillStyle='#0e1428'; g.fillRect(0,0,w,h); g.fillStyle='#f2c14e'; g.fillRect(3,3,w-6,3); g.fillStyle='#f4ecd0'; for(let i=0;i<14;i++)g.fillRect(3+Math.floor(hs(i,5)*(w-6)),9+Math.floor(hs(i,9)*(h-16)),1,1); g.fillRect(3,h-6,w-6,2); }));
      mk(p,"TONIGHT'S SKY (A POSTER)",()=>MVAULT.clues.sky(),.9,1.6,.4); } };
  SYS.add('places',dt=>{ if((chk-=dt||0)>0)return; chk=1; if(!made){ const A=STORE.streetDoor&&STORE.streetDoor.art; if(!A)return; const X=SHARED.BOD.X, Z=SHARED.BOD.Z, Th=STORE.streetDoor.theatre;
      const near=SD=>SD&&Math.hypot(pos.x-X(SD.door[0]),pos.z-Z(SD.door[1]))<70*MW; if(!near(A)&&!near(Th))return; made=true; make(); }
    for(const o of ON)o.visible=SHARED.LVL==='up'&&Math.hypot(pos.x-o.position.x,pos.z-o.position.z)<140*MW; },'146zha-vault-clues');
  // the vault off the map: steel walls, the round door behind you, three glass cases of the day's antiquities, crates on racks
  const frame=()=>{ const o=[OX(),OZ()]; return IKIT.frame({x0:0,y0:0,x1:1,y1:1},(x,y)=>[o[0]+x*RW*MW,o[1]+y*RD*MW]); };
  let G=null; const CASES=[[1.6,2],[3.5,1.6],[5.4,2]];
  MVAULT.pick=i=>{ const d=day(); return ART[(Math.floor(hs(d,113)*ART.length)+i*3)%ART.length][0]; };
  const take=i=>{ const k='vault'+i; if(!INV.ready(k))return say('THE CASE IS EMPTY. THE CURATOR RESTOCKS IT BY TOMORROW.','#c8c2b0'); const id=MVAULT.pick(i); INV.picked[k]=day(); INV.save(); FORAGE.give(id,1); FORAGE.draw();
    say(`YOU LIFT OUT ${NM[id]}. THE MUSEUM WOULD PAY FOR IT (DONATE IT IN THE ART MUSEUM).`,'#f2c14e'); if(SFX.play)SFX.play('chirp',{vol:.4}); syncV(); };
  const syncV=()=>{ for(const c of MVAULT.cases||[]){ const full=INV.ready('vault'+c.i); c.m.visible=full; c.th.name=full?'A GLASS CASE ('+NM[MVAULT.pick(c.i)]+')':'A GLASS CASE (EMPTY)'; } };
  const furnish=()=>{ '@later'; const F=frame(), first=!MVAULT.sol; MVAULT.sol=true; const K=IKIT.room(F,o=>G.add(o),first?undefined:()=>{}), {box,cyl,ball,glow,use,pic}=K, steel=0x5a6068, dark=0x30343a;
    box(0,0,RW,RD,-.05,0,0x3a3c40); for(let u=.5;u<RW;u+=1)box(u-.01,0,u+.01,RD,0,.003,0x2a2c30);
    for(const [a,b,c,d] of [[-.2,-.2,RW+.2,0],[-.2,RD,RW+.2,RD+.2],[-.2,0,0,RD],[RW,0,RW+.2,RD]]){ box(a,b,c,d,0,H,steel); K.sol(a,b,c,d); }
    for(let u=.6;u<RW;u+=1.2)box(u-.04,0,u+.04,.06,0,H,dark);
    const door=IKIT.tex(48,48,(g,w,h)=>{ g.fillStyle='#5a6068'; g.fillRect(0,0,w,h); g.fillStyle='#8a929c'; g.beginPath(); g.arc(24,24,22,0,7); g.fill(); g.fillStyle='#6a727c'; g.beginPath(); g.arc(24,24,17,0,7); g.fill(); g.fillStyle='#b8923a'; g.fillRect(22,8,4,32); g.fillRect(8,22,32,4); g.beginPath(); g.arc(24,24,5,0,7); g.fill(); });
    pic(RW/2,RD-.02,.3,2.2,2.2,0,-1,door);
    for(const [i,[u,v]] of CASES.entries()){ box(u-.35,v-.35,u+.35,v+.35,0,.9,dark); box(u-.38,v-.38,u+.38,v+.38,.9,.94,0x8a929c); K.sol(u-.4,v-.4,u+.4,v+.4); }
    for(const u of [.4,RW-.4]){ box(u-.25,1,u+.25,RD-1.5,0,.05,dark); for(let h=.5;h<2.6;h+=.7){ box(u-.25,1,u+.25,RD-1.5,h,h+.04,dark); for(let v=1.2;v<RD-1.7;v+=.6)if(hs(u*9,v*7+h*3)>.3)box(u-.2,v,u+.2,v+.45,h+.04,h+.34+hs(v,h)*.1,hs(v*3,h)>.5?0x6a4a2a:0x7a6a50); } K.sol(u-.3,1,u+.3,RD-1.5); }
    glow(()=>{ for(const u of [2,5])ball(u,RD/2,H-.15,.1,0xfff0d0); }); for(const u of [2,5]){ const L=new THREE.PointLight(0xfff0d8,2.4,8*T,1.6), p=F.pw(u,RD/2); L.position.set(p[0],(H-.3)*MW,p[1]); G.add(L); } G.add(new THREE.HemisphereLight(0xd8e0f0,0x2a2c30,1.1));
    MVAULT.cases=CASES.map(([u,v],i)=>{ const m=model(MVAULT.pick(i)); m.scale.setScalar(MW*2); const p=F.pw(u,v); m.position.set(p[0],.95*MW,p[1]); G.add(m);
      const gm=new THREE.Mesh(new THREE.BoxGeometry(.7*MW,.6*MW,.7*MW),new THREE.MeshLambertMaterial({color:0xcfe3ea,transparent:true,opacity:.15,depthWrite:false})); gm.position.set(p[0],1.25*MW,p[1]); G.add(gm);
      const th=use('A GLASS CASE',u,v,.8,1.6,()=>take(i),1.4); return {i,m,th}; });
    use('THE LADDER UP (THE ART MUSEUM)',RW/2,RD-.5,1.2,2,()=>MVAULT.up(),1.5);
    K.flush(); syncV(); };
  const outAt=()=>{ const Sx=STORE.artFrame; if(!Sx)return null; const F=IKIT.frame({x0:Sx.B.x0,y0:Sx.B.y0,x1:Sx.B.x1,y1:Sx.B.y1}), p=F.pw(8*TM,9.9*TM); return [p[0],p[1],0,F.hd(0,1)]; };
  MVAULT.up=async()=>{ const R=STORE.inside&&STORE.inside.art, IV=ROOMS.iv; if(FADE.busy||IV.busy)return; if(!R)return ROOMS.exit('vault'); IV.busy=true;
    try{ await FADE.run('',async()=>{ if(!R.done){ await STORE.ensure(); if(STORE.pre.art)await STORE.pre.art(); } ROOMS.goOut('vault'); if(!R.done)STORE.inGo('art'); },{cut:true}); } finally{ IV.busy=false; } };
  const reg=()=>{ if(ROOMS.off.vault)return true; const o=outAt(); if(!o)return false; const F=frame(), sp=F.pw(RW/2,RD-1.4), a=F.pw(0,0), b=F.pw(RW,RD);
    ROOMS.off.vault={name:'THE SEALED VAULT',box:{x0:Math.min(a[0],b[0])-.3*T,z0:Math.min(a[1],b[1])-.3*T,x1:Math.max(a[0],b[0])+.3*T,z1:Math.max(a[1],b[1])+.3*T,y0:-1,y1:(H+.5)*MW},noCeil:true,need:()=>LOAD('later'),
      build:()=>{ const P=ROOMS.part(G=Object.assign(new THREE.Group(),{name:'vault-in'}),furnish); scene.add(G); return P; },unbuild:()=>{ if(G)G.removeFromParent(); G=null; MVAULT.cases=null; },spawn:[sp[0],sp[1],0,F.hd(0,-1)],out:o};
    if(ROOMS.reset)ROOMS.reset(); return true; };
  { let done=false; SYS.add('life',()=>{ if(!done)done=reg(); },'146zha-vault-reg'); }
  window.MVAULTDBG=()=>({reg:!!ROOMS.off.vault,inside:ROOMS.offIn&&ROOMS.offIn()==='vault',open:MVAULT.isOpen(),dials:S.dials.slice(),star:S.star,read:Object.keys(S.read),clues:ON.length,int:FORAGE.ST.int,cases:(MVAULT.cases||[]).map(c=>c.th.name),shown:DISP.n,code:code(day())});
}
