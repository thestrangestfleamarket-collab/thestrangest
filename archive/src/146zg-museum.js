// THE MUSEUM OF EARTH, FURNISHED: a plaque you can read at every exhibit, the curator's quiz at the information desk (a dollar a right answer, once a day), a fish tank in the Earth gallery (feed the fish), benches, rope barriers, a donation box by the door, a gift shop in the back gallery run by THE PANGOLIN, THE OWL on guard; where its staff and its visitors go.
import {THREE} from './003-shx.js';
import {CITY, FORAGE, INV, SHOPS, WORKERS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {STORE, SYS} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
const MUSEUM={read:new Set(),fund:0}; window.MUSEUM=MUSEUM;
{ const say=(t,c)=>SAY(t,c||'#f2c14e'), TM=.924;   // a museum tile in metres
  FORAGE.add({names:{mus_postcard:'A POSTCARD OF THE MAMMOTH',mus_plush:'A PLUSH MAMMOTH',mus_replica:'A REPLICA HAND AXE',mus_guidebook:'THE MUSEUM GUIDEBOOK'}});
  // the exhibits as the store lays them (tiles from the museum's own corner, the door side first): where each stands, which way it faces you, how far to stand back, its plaque, a question for the quiz
  const EX=[
    ['THE ROSETTA STONE',3.4,6.5,1,0,1.5,['EGYPT, 196 BC · GRANODIORITE','One decree in three scripts: hieroglyphs,','Demotic and Greek. The Greek let','Champollion read hieroglyphs in 1822.'],['Which script on the Rosetta Stone let scholars read hieroglyphs?','GREEK','LATIN','HEBREW']],
    ["TUTANKHAMUN'S MASK",3.4,2.0,1,0,1.5,['EGYPT, c. 1323 BC · GOLD, LAPIS, GLASS','Made for a boy king who died at about','nineteen. Found by Howard Carter\'s','team in 1925.'],["Tutankhamun's mask is made mostly of what?",'GOLD','BRONZE','CLAY']],
    ['A PAINTED COFFIN',.55,10.8,1,0,1.4,['EGYPT, c. 1000 BC · WOOD, PLASTER, PAINT','Spells and gods painted to guide the','dead through the underworld.']],
    ['LUCY',22.4,6.5,-1,0,1.5,['ETHIOPIA, 3.2 MILLION YEARS AGO','Australopithecus afarensis: about two','fifths of one skeleton. She walked','upright. Named after a Beatles song.'],['Lucy was named after what?','A SONG','A RIVER','A QUEEN']],
    ['THE LAETOLI FOOTPRINTS',25.35,4.0,-1,0,1.4,['TANZANIA, 3.66 MILLION YEARS AGO','The oldest known trail of walking','upright, kept in volcanic ash.'],['What kept the Laetoli footprints?','VOLCANIC ASH','RIVER MUD','SNOW']],
    ['FOUR SKULLS',25.65,8.0,-1,0,1.4,['AFRICA AND EUROPE, 2 MILLION YEARS','Four of our relatives: Homo habilis,','Homo erectus, a Neanderthal and','one of us, Homo sapiens.']],
    ['HAND AXES',19.4,2.5,1,0,1.4,['AFRICA, FROM 1.7 MILLION YEARS AGO','Acheulean tools, shaped on both faces,','made the same way for over a million','years.']],
    ['THE ISHANGO BONE',19.4,11.5,1,0,1.4,['CONGO, c. 20,000 YEARS AGO','A baboon bone with rows of notches:','maybe the oldest counting tool.'],['The Ishango bone may be the oldest what?','COUNTING TOOL','FLUTE','MAP']],
    ['THE WOOLLY MAMMOTH',13.0,17.4,0,-1,2.4,['THE ICE AGE, TO 4,000 YEARS AGO','Up to 3.5 m at the shoulder. The last','ones lived on Wrangel Island while','the pyramids were being built.'],['Where did the last mammoths live?','WRANGEL ISLAND','ICELAND','MADAGASCAR']],
    ['THE GIBEON METEORITE',1.6,19.1,1,0,1.5,['NAMIBIA, FELL BEFORE HISTORY','Iron and nickel from the core of a','broken asteroid; crystals show when','it is cut and etched.'],['The Gibeon meteorite is mostly what?','IRON','STONE','ICE']],
    ['THE TERRACOTTA WARRIORS',22.5,20.1,0,-1,1.9,['CHINA, c. 210 BC · FIRED CLAY','Over 8,000 soldiers buried to guard','the first emperor, Qin Shi Huang. No','two faces are alike.'],['About how many terracotta soldiers were buried?','8,000','800','80']],
    ['THE JADE BURIAL SUIT',25.45,15.4,-1,0,1.4,['CHINA, HAN DYNASTY, c. 113 BC','Over 2,000 jade plates sewn with gold','wire, made for Prince Liu Sheng.']],
    ['THE SUTTON HOO HELMET',19.6,14.0,1,0,1.4,['ENGLAND, EARLY 600s AD · IRON, BRONZE','From a king\'s ship burial, found in','1939 in hundreds of pieces.'],['Sutton Hoo was what?','A SHIP BURIAL','A CASTLE','A TEMPLE']],
    ['CLAY TABLETS',19.35,16.4,1,0,1.4,['MESOPOTAMIA, c. 3000 BC','Cuneiform: wedges pressed into wet','clay. Many of them are receipts.'],['What were many cuneiform tablets?','RECEIPTS','LOVE LETTERS','MAPS']],
    ['THE ANTIKYTHERA MECHANISM',22.5,15.9,0,-1,1.4,['GREECE, c. 100 BC · BRONZE','Gears that worked out eclipses and the','moon\'s phases. Found in a shipwreck','in 1901.'],['The Antikythera mechanism worked out what?','ECLIPSES','EARTHQUAKES','TIDES']]];
  MUSEUM.exhibits=EX;
  const room=()=>(STORE.rooms||[]).find(r=>r.id==='museum');
  const frameOf=S=>{ const B=S.B; return IKIT.frame({x0:B.x0,y0:B.y0,x1:B.x1,y1:B.y1},(x,y)=>{ const q=S.at(x,y); return [q.x,q.z]; }); };
  // where its people go: the curator behind the information desk, the guard at the back of the hall, the others in their galleries; visitors before the exhibits, at the tank, the gift shop and on the benches
  { const S=STORE.museumFrame, R=room(); if(S&&R){ const F=frameOf(S), sp=(dx,dy,du,dv,h)=>{ const p=F.pw(dx*TM,dy*TM); return {x:p[0],z:p[1],hd:F.hd(du,dv),...(h!=null?{y:h*IKIT.MW}:{})}; };
    R.spots={CURATOR:sp(9.9,1.0,0,1),COLLECTIONS:sp(21.0,18.0,-1,0),ASSISTANT:sp(5.6,10.0,-1,0),'KEEPS THE TANKS':sp(1.7,15.8,-1,0),GUARD:sp(16.8,12.4,-1,0),KEEPER:sp(17.7,20.25,0,-1)};
    const view=[0,1,3,6,8,9,10,12,14].map(i=>{ const [,x,y,fx,fy,d]=EX[i]; return sp(x+fx*d,y+fy*d,-fx,-fy); });
    R.seats=MUSEUM.places=[...view,sp(2.4,14.8,-1,0),sp(17.7,18.4,0,1),sp(9.75,7.45,0,1,.45),sp(10.55,7.45,0,1,.45),sp(15.45,7.45,0,1,.45),sp(16.25,7.45,0,1,.45)]; } }
  // a plaque close up
  const plaque=([name,,,,,,L])=>MINI.look(name,(g,w,h)=>{ g.fillStyle='#2a2420'; g.fillRect(0,0,w,h); g.fillStyle='#efe6cf'; g.fillRect(14,14,w-28,h-28); g.strokeStyle='#8a6a3a'; g.lineWidth=3; g.strokeRect(20,20,w-40,h-40);
    g.fillStyle='#2a2420'; g.textAlign='center'; g.textBaseline='top'; g.font='bold 18px serif'; g.fillText(name,w/2,36); g.font='11px monospace'; g.fillStyle='#6a4a2a'; g.fillText(L[0],w/2,66); g.fillRect(60,86,w-120,1);
    g.font='14px serif'; g.fillStyle='#2a2420'; L.slice(1).forEach((l,i)=>g.fillText(l,w/2,100+i*22)); g.font='10px monospace'; g.fillStyle='#8a7a5a'; g.fillText('MUSEUM OF EARTH',w/2,h-40); },'Every plaque you read is a question you can answer at the information desk.');
  // the curator's quiz: five questions from the plaques, three answers each, a dollar a right one, once a game day
  const today=()=>(window.CITY&&CITY.day)||0;
  const quiz=()=>({title:"THE CURATOR'S QUIZ",w:420,h:360,help:'Click an answer. A dollar for each right one; one quiz a day. The plaques have every answer.',
    can:()=>MUSEUM.quizDay===today()?'THE CURATOR SMILES: ONE QUIZ A DAY. COME BACK TOMORROW.':'',
    start:S=>{ const Q=EX.filter(e=>e[7]).sort(()=>Math.random()-.5).slice(0,5); S.qs=Q.map(e=>{ const [q,a,...b]=e[7], o=[a,...b].sort(()=>Math.random()-.5); return {q,a,o,from:e[0]}; }); S.i=0; S.right=0; S.pick=-1; S.wait=0; MUSEUM.quizDay=today(); },
    tick:(S,dt)=>{ if(S.wait>0){ S.wait-=dt; if(S.wait<=0){ S.i++; S.pick=-1; if(S.i>=S.qs.length){ S.score=S.right; S.over=`${S.right} OF 5 RIGHT: $${S.right}.`; } } return; }
      if(S.press){ const k=Math.floor((S.my-170)/52); if(k>=0&&k<3&&S.mx>30&&S.mx<390){ const Q=S.qs[S.i]; S.pick=k; if(Q.o[k]===Q.a){ S.right++; S.line='RIGHT.'; } else S.line=`NO: ${Q.a}. (THE PLAQUE: ${Q.from})`; S.wait=1.4; } } },
    draw:(S,g)=>{ g.fillStyle='#1c1a16'; g.fillRect(0,0,420,360); const Q=S.qs[Math.min(S.i,S.qs.length-1)]; g.fillStyle='#f0c040'; g.font='12px monospace'; g.textAlign='left'; g.textBaseline='top'; g.fillText(`QUESTION ${Math.min(S.i+1,5)} OF 5 · ${S.right} RIGHT`,20,18);
      g.fillStyle='#f4ecd8'; g.font='15px serif'; const ws=Q.q.split(' '); let l='', y=56; for(const x of ws){ if(g.measureText(l+x).width>380){ g.fillText(l,20,y); l=''; y+=22; } l+=x+' '; } g.fillText(l,20,y);
      Q.o.forEach((o,k)=>{ const y0=170+k*52; g.fillStyle=S.pick===k?(o===Q.a?'#2a6a3a':'#6a2a24'):S.pick>=0&&o===Q.a?'#2a6a3a':'#2c2822'; g.fillRect(30,y0,360,42); g.fillStyle='#f4ecd8'; g.font='14px monospace'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(o,210,y0+21); g.textAlign='left'; g.textBaseline='top'; }); },
    end:S=>{ MUSEUM.last={right:S.right}; if(S.right>0){ INV.cash+=S.right; say(`THE CURATOR PAYS YOU $${S.right}.`); } }});
  MUSEUM.quiz=()=>MINI.open(quiz());
  // feeding the fish (the bodega sells fish food)
  MUSEUM.feed=()=>{ if(FORAGE.has&&FORAGE.has('g_fishfood')){ FORAGE.take('g_fishfood',1); MUSEUM.fed=performance.now()/1000; FORAGE.buff&&FORAGE.buff('regen',60); say('THE FISH RUSH UP FOR THE FLAKES. WATCHING THEM CALMS YOU.'); }
    else say('THE FISH WATCH YOU, HOPEFUL. (FISH FOOD: THE BODEGA, AISLE 2.)','#c8a090'); };
  MUSEUM.donate=()=>{ if(INV.cash<1)return say('THE BOX TAKES A DOLLAR.','#c8a090'); INV.cash-=1; MUSEUM.fund++; say(`THANK YOU. $${MUSEUM.fund} IN THE BOX TODAY.`); };
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.museum=S=>{ '@later'; const F=frameOf(S), K=IKIT.room(F,o=>scene.add(o)), {box,cyl,ball,glow,pic,words,sol,use,seat,own,meshOf,MW}=K, t=d=>d*TM;
    const C={brass:0xb08838,wood:0x6a4a2a,dark:0x2a2420,cream:0xefe6cf,red:0x8a1c24,glass:0xcfe3ea,steel:0xa8acb0};
    // a plaque on a slanted stand beside each exhibit, and its rope in front
    for(const e of EX){ const [name,x,y,fx,fy,d]=e, px=-fy, py=fx, u=t(x+fx*(d-.35)+px*.8), v=t(y+fy*(d-.35)+py*.8);
      box(u-.04,v-.04,u+.04,v+.04,0,.95,C.dark); box(u-.2,v-.14,u+.2,v+.14,.95,1.0,C.brass); box(u-.17,v-.11,u+.17,v+.11,1.0,1.005,C.cream);
      use(name+' (THE PLAQUE)',u,v,.45,1.1,()=>{ MUSEUM.read.add(name); plaque(e); },1.4); }
    const rope=(x0,y0,x1,y1)=>{ const a=[t(x0),t(y0)], b=[t(x1),t(y1)]; for(const p of [a,b]){ cyl(p[0],p[1],.12,0,.03,C.brass); cyl(p[0],p[1],.025,.03,.9,C.brass); ball(p[0],p[1],.92,.04,C.brass); }
      const n=8; for(let i=0;i<n;i++){ const k=(i+.5)/n, s=Math.sin(k*Math.PI)*.12; ball(a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,.82-s,.022,C.red); } sol(Math.min(a[0],b[0])-.03,Math.min(a[1],b[1])-.03,Math.max(a[0],b[0])+.03,Math.max(a[1],b[1])+.03); };
    rope(4.55,5.4,4.55,7.6); rope(4.55,1.0,4.55,3.0); rope(21.25,5.4,21.25,7.6); rope(10.2,15.3,15.8,15.3);
    // benches in the middle of the hall
    for(const x0 of [9.3,15.0]){ const u0=t(x0), u1=t(x0+1.7), v0=t(7.2), v1=t(7.7); seat('A MUSEUM BENCH',own(()=>{ box(u0,v0,u1,v1,.4,.47,C.wood); for(const u of [u0+.05,u1-.1])box(u,v0+.05,u+.05,v1-.05,0,.4,C.dark); }),[[t(x0+.45),t(7.45),.47,0,1],[t(x0+1.25),t(7.45),.47,0,1]],1.0); sol(u0,v0,u1,v1); }
    // the donation box by the door
    { const u=t(15.0), v=t(1.0); box(u-.2,v-.15,u+.2,v+.15,0,.85,C.dark); box(u-.18,v-.13,u+.18,v+.13,.85,1.25,C.glass); for(let i=0;i<6;i++)box(u-.14+i*.05,v-.08,u-.1+i*.05,v+.06,.86,.9+.03*(i%3),0x5a8a4a);
      pic(u,v-.151,1.3,.6,.22,0,-1,words(64,22,'#1a1612',[['ADMISSION FREE',32,2,'#f0c040',8,'center'],['DONATIONS WELCOME',32,12,'#f4ecd8',7,'center']]),true); sol(u-.2,v-.15,u+.2,v+.15);
      use('THE DONATION BOX ($1)',u,v,.45,1.3,MUSEUM.donate,1.4); }
    use("THE INFORMATION DESK (THE CURATOR'S QUIZ)",t(9.9),t(1.8),t(1.5),1.2,MUSEUM.quiz,1.8);
    // the fish tank on the Earth gallery's outer wall: a cabinet, the water, the fish
    { const u0=t(.15), u1=t(.95), v0=t(14.2), v1=t(17.4); box(u0,v0,u1,v1,0,.7,C.wood); box(u0,v0,u1,v1,1.65,1.75,C.wood); box(u0+.02,v0+.02,u1-.02,v1-.02,.7,.74,0xd8c890); for(let i=0;i<5;i++)ball(u0+.2+i*.04,v0+.3+i*.55,.78,.08,0x3a7a3a,1.6); sol(u0,v0,u1,v1);
      const wm=meshOf(own(()=>box(u0+.02,v0+.02,u1-.02,v1-.02,.74,1.62,0x3a8ac8)),new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.32,depthWrite:false})); wm.castShadow=false; wm.userData.noMerge=true;
      glow(()=>box(u0+.05,v0+.05,u1-.05,v1-.05,1.64,1.65,0xe0f4ff)); pic((u0+u1)/2+.42,(v0+v1)/2,1.78,1.2,.18,1,0,words(64,12,'#1a2a3a',[['THE REEF TANK',32,2,'#a0e0ff',8,'center']]),true);
      const fish=new THREE.Group(); MUSEUM.fish=[]; for(let i=0;i<9;i++){ const m=new THREE.Mesh(new THREE.SphereGeometry(.05*MW,8,6),new THREE.MeshLambertMaterial({color:[0xff8a20,0xf0e040,0x40a0ff,0xff4060,0xffffff][i%5]})); m.scale.set(1.6,1,.6); m.userData.noMerge=true; fish.add(m); MUSEUM.fish.push({m,a:Math.random()*7,s:.4+Math.random()*.5,h:.9+Math.random()*.5}); }
      scene.add(fish); MUSEUM.tank={F,u0,u1,v0,v1,fish};
      use('THE REEF TANK (FEED THE FISH)',(u0+u1)/2,(v0+v1)/2,.9,1.8,MUSEUM.feed,1.6); }
    // the gift shop in the back gallery's corner: a counter, shelves of plush mammoths, postcards and axes
    { const u0=t(16.8), u1=t(18.6), v0=t(19.1), v1=t(19.6); box(u0,v0,u1,v1,0,.95,C.wood); box(u0-.02,v0-.02,u1+.02,v1+.02,.95,.99,C.cream); sol(u0,v0,u1,v1);
      for(let r=0;r<3;r++){ box(u0,t(20.75),u1,t(20.95),.5+r*.5,.53+r*.5,C.wood); for(let i=0;i<5;i++){ const u=u0+.15+i*.35; if(r===0)ball(u,t(20.85),.65,.12,0x7a4a2a,1.1); else if(r===1)box(u-.06,t(20.8),u+.06,t(20.9),1.03,1.2,0xc8b090); else box(u-.1,t(20.82),u+.1,t(20.88),1.53,1.68,[0x80c0e0,0xe0c080,0xc08080][i%3]); } }
      sol(u0,t(20.7),u1,t(21)); pic((u0+u1)/2,t(20.98),2.15,1.6,.28,0,-1,words(72,14,'#1a1612',[['THE GIFT SHOP',36,3,'#f0c040',8,'center']]),true);
      use('THE GIFT SHOP (BROWSE)',(u0+u1)/2,(v0+v1)/2,1.0,1.2,()=>SHOPS.open({key:'w_pangolin',name:'THE GIFT SHOP'}),1.8); }
    K.flush(); setTimeout(()=>WORKERS.make('museum'),0); };
  // the fish swim round their tank, and up to the top for a while once fed
  SYS.add('life',dt=>{ const T=MUSEUM.tank; if(!T||!T.fish.parent)return; const now=performance.now()/1000, fed=MUSEUM.fed&&now-MUSEUM.fed<8, {F,u0,u1,v0,v1}=T, MW=IKIT.MW;
    for(const f of MUSEUM.fish){ f.a+=(dt||0)*f.s*(fed?2.2:1); const cu=(u0+u1)/2+Math.sin(f.a*1.3)*(u1-u0)*.32, cv=(v0+v1)/2+Math.cos(f.a)*(v1-v0)*.4, h=fed?1.5+.04*Math.sin(f.a*5):f.h+.06*Math.sin(f.a*2), p=F.pw(cu,cv);
      f.m.position.set(p[0],h*MW,p[1]); f.m.rotation.y=F.hd(-Math.sin(f.a)*(v1-v0)*.4,Math.cos(f.a*1.3)*1.3*(u1-u0)*.32)-Math.PI/2; } },'146zg-fish');
}
