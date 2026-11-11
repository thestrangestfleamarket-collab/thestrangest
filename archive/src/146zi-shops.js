// THE SMALL SHOPS, FURNISHED (on top of their own kits): the Boardwright's wax-and-grip bench (wax a deck you own and it rides faster a while), his chalk sketches, the photo, the cracked mirror, the old calendar, a bench; FIX-IT's bargain bin of broken sets, the screw jars and a repair bench to mend one yourself (the Fixer buys it back), a waiting bench; THE SCANNER's myna bird that repeats the police calls, a listening stool with the ON AIR light, the call-sign cards, a glass case; where their staff and customers go.
import {CIVIC, FORAGE, INV, NPCS, pos, ROOMS, SHOPS, st, USE} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS, TILE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
import {MSHOP} from './059i-mshops.js';
const SHOPS3={}; window.SHOPS3=SHOPS3;
{ const say=(t,c)=>SAY(t,c||'#f2c14e'), TM=.924;   // a shop tile in metres
  FORAGE.add({names:{fix_parts:'A BAG OF SCREWS AND PARTS',junk_walkman:'A BROKEN POCKET CASSETTE',junk_handheld:'A BROKEN HANDHELD GAME',junk_pockettv:'A BROKEN POCKET TV',walkman:'A POCKET CASSETTE',handheld:'A HANDHELD GAME',pockettv:'A POCKET TV'}});
  FORAGE.BUYK.electronics=['walkman','handheld','pockettv']; if(FORAGE.sell)FORAGE.sell('walkman','handheld','pockettv');
  const FIXES={junk_walkman:'walkman',junk_handheld:'handheld',junk_pockettv:'pockettv'};
  // where people go, in each shop's tiles from its back-left corner (the door is in the middle of the front wall)
  const spots=(id,S,P)=>{ const o=ROOMS.off[id], at=MSHOP.at&&MSHOP.at[id]; if(!o||!at)return; const F=IKIT.frame(at.R), sp=([x,y,du,dv,h])=>{ const p=F.pw(x*TM,y*TM); return {x:p[0],z:p[1],hd:F.hd(du,dv),...(h!=null?{y:h*IKIT.MW}:{})}; };
    o.spots=Object.fromEntries(Object.entries(S).map(([k,v])=>[k,sp(v)])); o.seats=P.map(sp); };
  spots('boards',{'HELPS BEHIND THE COUNTER':[9.8,5.6,-1,0]},[[9.9,6.4,1,0],[9.9,7.2,1,0],[3.2,5.0,0,-1],[7.3,8.6,0,-1,.45],[8.1,8.6,0,-1,.45],[5.0,2.4,0,-1]]);
  spots('fixit',{REPAIRS:[8.7,3.3,-1,0],MECHANIC:[7.7,6.5,0,1]},[[1.2,8.45,0,-1,.45],[2.0,8.45,0,-1,.45],[9.5,2.4,1,0],[9.5,6.0,1,0],[7.7,8.3,0,-1],[2.2,7.1,0,-1]]);
  spots('scanner',{},[[5.5,2.6,0,-1,.65],[9.6,3.0,1,0],[9.6,5.5,1,0],[2.4,7.4,-1,0],[8.4,7.6,0,-1]]);
  // a shop's own makers on top of its kit: things in metres, solid in its tiles
  const kitOf=(A,f)=>{ const R=A.R, F=IKIT.frame(R), K=IKIT.room(F,o=>A.add(o),()=>{}), t=d=>d*TM, sol=(x0,y0,x1,y1)=>A.sol(R.x0+x0,R.y0+y0,R.x0+x1,R.y0+y1); f(K,t,sol,F); K.flush(); };
  const merch=k=>NPCS.extra&&NPCS.extra.find(q=>q.key===k);
  const look=(title,draw,cap)=>MINI.look(title,draw,cap);
  /* ---------- THE BOARDWRIGHT ---------- */
  SHOPS3.wax=()=>MINI.open(GAMES.wax({title:'WAX AND GRIP A DECK',can:()=>!Object.keys(INV.items).some(k=>/^board_/.test(k)&&INV.items[k]>0)?'BRING A DECK: THE BOARDWRIGHT SELLS THEM ON THE WALL.':INV.cash<2?'THE WAX IS $2.':'',
    pay:()=>{ INV.cash-=2; },end:S=>{ SHOPS3.last={wax:S.score}; if(S.score){ FORAGE.buff&&FORAGE.buff('swift',300); say('YOUR DECK IS WAXED: IT RIDES FASTER FOR FIVE MINUTES.'); } }}));
  { const k0=MSHOP.kit.boards; if(k0){ MSHOP.kit.boards=A=>{ '@later'; k0(A); kitOf(A,({box,cyl,ball,glow,pic,words,use,seat,own},t,sol)=>{ const C={wood:0x5a3e28,dark:0x2a1e16,mat:0x2a2a2c,chalk:0x2a2c2a};
      // the wax and grip bench on its rubber mat, a deck clamped on it, a block of wax, a roll of grip
      box(t(2.0),t(3.3),t(4.4),t(4.7),0,.015,C.mat); box(t(2.2),t(3.6),t(4.2),t(4.4),.85,.92,0x6a4a2a); for(const [a,b] of [[2.25,3.65],[4.15,3.65],[2.25,4.35],[4.15,4.35]])box(t(a)-.03,t(b)-.03,t(a)+.03,t(b)+.03,0,.85,C.dark); sol(2.2,3.6,4.2,4.4);
      box(t(2.6),t(3.8),t(3.8),t(4.2),.92,.95,0xb08850); box(t(3.9),t(3.75),t(4.1),t(3.95),.92,.98,0xf0e8c0); cyl(t(2.4),t(4.1),.06,.92,1.0,0x1a1a1a);
      use('THE WAX AND GRIP BENCH (WAX A DECK $2)',t(3.2),t(4.0),t(2.0),1.0,SHOPS3.wax,1.6);
      // his chalk sketches above the drying rack, the photo, the cracked mirror, the calendar on the back wall
      const sk=IKIT.tex(64,40,(g,w,h)=>{ g.fillStyle='#2a2c2a'; g.fillRect(0,0,w,h); g.strokeStyle='#e8e8e0'; g.lineWidth=1; g.beginPath(); g.ellipse(18,20,14,6,0,0,7); g.stroke(); g.beginPath(); g.ellipse(46,20,14,6,.3,0,7); g.stroke(); g.fillStyle='#e8e8e0'; g.font='5px monospace'; g.fillText('GRAIN NOSE TO TAIL',4,36); g.fillText('LIFT',38,8); });
      pic(.03,t(3.0),1.95,1.4,.85,1,0,sk); use('THE CHALK SKETCHES',.15,t(3.0),.3,2.8,()=>look('THE CHALK SKETCHES',(g,w,h)=>{ g.imageSmoothingEnabled=false; g.drawImage(sk.image,0,0,w,h); },'Two decks drawn from above, the grain marked nose to tail; LIFT written by the rising one.'),1.6);
      const ph=IKIT.tex(40,30,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#a8c8e0'); gr.addColorStop(.6,'#e8e0c8'); gr.addColorStop(.61,'#4a7a9a'); gr.addColorStop(1,'#2a5a7a'); g.fillStyle=gr; g.fillRect(0,0,w,h); g.fillStyle='#8a5a2a'; g.fillRect(12,12,16,3); g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(13,22,14,2); g.strokeStyle='#f4f0e4'; g.lineWidth=2; g.strokeRect(1,1,w-2,h-2); });
      pic(t(5.6),.03,1.5,.4,.3,0,1,ph); use('AN OLD PHOTO',t(5.6),.2,.3,2.0,()=>look('AN OLD PHOTO',(g,w,h)=>{ g.imageSmoothingEnabled=false; g.drawImage(ph.image,0,0,w,h); },'A deck floating a hand above the water, nobody on it. On the back, in pencil: SHE WANTED TO.'),1.4);
      box(t(7.0),.02,t(7.7),.05,1.15,2.0,0x8a8c90); box(t(7.05),.05,t(7.65),.055,1.2,1.95,0xb8c8d0); box(t(7.2),.055,t(7.5),.06,1.4,1.42,0x6a6c70); use('A CRACKED MIRROR',t(7.35),.2,.4,2.0,()=>say('A CRACKED MIRROR. THE BOARDWRIGHT SAYS IT WAS LIKE THAT WHEN HE GOT HERE.','#c8a090'),1.4);
      const cal=IKIT.tex(32,40,(g,w,h)=>{ g.fillStyle='#f4f0e4'; g.fillRect(0,0,w,h); g.fillStyle='#c02028'; g.fillRect(0,0,w,9); g.fillStyle='#f4f0e4'; g.font='6px monospace'; g.fillText('JUNE',9,7); g.fillStyle='#2a2a2a'; for(let i=0;i<30;i++)g.fillRect(3+(i%7)*4,12+Math.floor(i/7)*5,2,2); g.strokeStyle='#c02028'; g.beginPath(); g.arc(23,22,3,0,7); g.stroke(); });
      pic(t(3.9),.03,1.45,.35,.45,0,1,cal); use('AN OLD CALENDAR',t(3.9),.2,.3,2.0,()=>look('AN OLD CALENDAR',(g,w,h)=>{ g.imageSmoothingEnabled=false; g.drawImage(cal.image,0,0,w,h); },'Years out of date. Someone circled a Saturday in June.'),1.4);
      // a bench by the door for whoever is waiting
      const b0=t(6.8), b1=t(8.6), v0=t(8.35), v1=t(8.85); seat('A BENCH',own(()=>{ box(b0,v0,b1,v1,.4,.46,C.wood); for(const u of [b0+.05,b1-.1])box(u,v0+.05,u+.05,v1-.05,0,.4,C.dark); }),[[t(7.3),t(8.6),.46,0,-1],[t(8.1),t(8.6),.46,0,-1]],1.0); sol(6.8,8.35,8.6,8.85); }); };
    MSHOP.kit.boards.drop=k0.drop; } }
  /* ---------- FIX-IT ---------- */
  SHOPS3.bin=()=>{ if(INV.cash<6)return say('THE BIN IS $6 A GO.','#c8a090'); const ks=Object.keys(FIXES), k=ks[Math.floor(Math.random()*ks.length)]; INV.cash-=6; INV.add(k,1); say(`YOU DIG OUT ${FORAGE.name(k)}. $6. (MEND IT AT THE BENCH.)`); return k; };
  SHOPS3.mend=()=>{ '@later'; const k=Object.keys(FIXES).find(j=>(INV.items[j]||0)>0); MINI.open(GAMES.solder({title:'MEND IT: '+(k?FORAGE.name(k):'NOTHING TO MEND'),
    can:()=>!k?'NOTHING BROKEN TO MEND: THE BARGAIN BIN BY THE DOOR HAS SOME.':!(INV.items.fix_parts>0)?'YOU NEED PARTS: THE SCREW JARS ON THE BENCH ($1).':'',
    pay:()=>{ FORAGE.take(k,1); FORAGE.take('fix_parts',1); },end:S=>{ SHOPS3.last={mend:S.score,k}; if(S.score){ INV.add(FIXES[k],1); say(`IT WORKS: ${FORAGE.name(FIXES[k])}. THE FIXER WILL BUY IT.`); } else say('IT IS SCRAP NOW. THE FIXER SHAKES HIS HEAD.','#c8a090'); }})); };
  { const k0=MSHOP.kit.fixit; if(k0){ MSHOP.kit.fixit=A=>{ '@later'; k0(A); kitOf(A,({box,cyl,ball,glow,pic,words,use,seat,own},t,sol)=>{ const C={steel:0x8a8c90,dark:0x2a2a2c,wood:0x6a4a2a,glass:0xcfe3ea};
      // the customers' repair bench: a magnifier lamp, jars of screws, a mat
      box(t(1.2),t(5.8),t(3.2),t(6.5),.86,.9,C.wood); for(const [a,b] of [[1.25,5.85],[3.15,5.85],[1.25,6.45],[3.15,6.45]])box(t(a)-.03,t(b)-.03,t(a)+.03,t(b)+.03,0,.86,C.dark); sol(1.2,5.8,3.2,6.5);
      box(t(1.6),t(5.9),t(2.6),t(6.3),.9,.905,0x2a6a3a); cyl(t(1.4),t(6.0),.08,.9,.93,C.dark); cyl(t(1.4),t(6.0),.012,.93,1.35,C.steel); cyl(t(1.6),t(6.1),.1,1.32,1.36,C.steel); glow(()=>cyl(t(1.6),t(6.1),.085,1.31,1.32,0xfff4d0));
      for(let i=0;i<4;i++){ const u=t(2.5)+i*.12; cyl(u,t(5.95),.045,.9,1.02,C.glass,.045); cyl(u,t(5.95),.047,1.02,1.04,[0xc02028,0x2050c0,0x30a040,0xd8a020][i]); }
      use('THE REPAIR BENCH (MEND A BROKEN SET)',t(2.2),t(6.15),t(2.0),1.4,SHOPS3.mend,1.6);
      use('THE SCREW JARS (PARTS $1)',t(2.7),t(5.95),.4,1.1,()=>IKIT.buy('fix_parts',1,'A BAG OF SCREWS AND PARTS. $1.'),1.4);
      // the bargain bin of broken sets by the door
      box(t(3.0),t(7.6),t(4.2),t(8.5),0,.6,0x5a4a3a); for(let i=0;i<6;i++)box(t(3.1)+(i%3)*.32,t(7.7)+Math.floor(i/3)*.38,t(3.3)+(i%3)*.32,t(7.95)+Math.floor(i/3)*.38,.6,.68+.04*(i%2),[0x3a3a3a,0x8a8a8a,0x2a2a4a][i%3]); sol(3.0,7.6,4.2,8.5);
      pic(t(3.6),t(7.59),.62,.9,.2,0,-1,words(48,12,'#e8dcc0',[['BROKEN · $6',24,2,'#8a2a20',8,'center']]));
      use('THE BARGAIN BIN (A BROKEN SET $6)',t(3.6),t(8.05),t(1.2),.8,SHOPS3.bin,1.4);
      // a waiting bench along the front wall
      const b0=t(.6), b1=t(2.6), v0=t(8.2), v1=t(8.7); seat('A BENCH',own(()=>{ box(b0,v0,b1,v1,.4,.46,C.wood); for(const u of [b0+.05,b1-.1])box(u,v0+.05,u+.05,v1-.05,0,.4,C.dark); }),[[t(1.2),t(8.45),.46,0,-1],[t(2.0),t(8.45),.46,0,-1]],1.0); sol(.6,8.2,2.6,8.7); }); };
    MSHOP.kit.fixit.drop=k0.drop; } }
  /* ---------- THE SCANNER ---------- */
  const CALLS=['ALL UNITS, A 10-15 ON MARKET ST. COPY.','10-4, DISPATCH. ROLLING BY THE BODEGA.','UNIT 3, CHECK THE PARK GATE. SOMEONE SAW A SKELETON.','DISPATCH: NOISE AT THE BAR. PROBABLY THE DRUMMER.','10-20? ... BY THE SUBWAY STAIRS. ALL QUIET.','UNIT 5, A CAT ON THE FIRE ESCAPE AGAIN. 10-4.','DISPATCH TO ALL: COFFEE AT THE DINER. 10-4.'];
  const call=()=>{ const L=(window.CIVIC&&CIVIC.log||[]).filter(e=>/precinct|street/.test(e.where||'')); return L.length&&Math.random()<.6?String(L[0].what).toUpperCase():CALLS[Math.floor(Math.random()*CALLS.length)]; };
  SHOPS3.myna=()=>say(`THE MYNA: "${call()}"`,'#a0e0ff');
  // the listening stool: sat on it, the calls come every so often and the ON AIR light is lit
  let lt=0; SYS.add('life',dt=>{ const on=SHOPS3.stool&&SHOPS3.stool.parent&&USE.seat&&st.sit&&ROOMS.offIn&&ROOMS.offIn()==='scanner'&&Math.hypot(pos.x-SHOPS3.stoolAt[0],pos.z-SHOPS3.stoolAt[1])<1.2*TILE;
    if(SHOPS3.air)SHOPS3.air.visible=!!on; if(!on){ lt=0; return; } if((lt-=dt||0)<=0){ lt=12; SHOPS3.heard=(SHOPS3.heard||0)+1; say('ON THE SCANNER: '+call(),'#a0e0ff'); } },'146zi-scanner');
  { const k0=MSHOP.kit.scanner; if(k0){ MSHOP.kit.scanner=A=>{ '@later'; k0(A); kitOf(A,({box,cyl,ball,glow,pic,words,use,seat,own,meshOf,matB},t,sol,F)=>{ const C={wood:0x5a3e28,dark:0x1e1e22,steel:0x8a8c90,glass:0xcfe3ea,red:0xc02028};
      // the listening stool before the desk, and the ON AIR light over it (lit while you listen)
      const su=t(5.5), sv=t(2.6); SHOPS3.stool=seat('THE LISTENING STOOL',own(()=>{ cyl(su,sv,.16,0,.03,C.steel); cyl(su,sv,.03,.03,.6,C.steel); cyl(su,sv,.18,.6,.66,C.red,.17); }),[[su,sv,.66,0,-1]],.9); SHOPS3.stoolAt=F.pw(su,sv);
      box(t(5.0),.02,t(6.0),.06,2.1,2.4,C.dark); pic(t(5.5),.065,2.12,.9,.26,0,1,words(48,14,'#2a0808',[['ON AIR',24,3,'#5a2020',9,'center']]));
      SHOPS3.air=meshOf(own(()=>box(t(5.05),.066,t(5.95),.07,2.13,2.37,0xff3030)),matB,false); SHOPS3.air.visible=false; SHOPS3.air.userData.noMerge=true;
      // the myna on its perch
      const mu=t(8.6), mv=t(2.0); cyl(mu,mv,.2,0,.03,C.dark); cyl(mu,mv,.02,.03,1.45,C.steel); box(mu-.22,mv-.015,mu+.22,mv+.015,1.45,1.48,C.wood); sol(8.4,1.8,8.8,2.2);
      ball(mu,mv,1.58,.08,0x101014,1.3); ball(mu+.06,mv,1.69,.05,0x101014); box(mu+.1,mv-.012,mu+.16,mv+.012,1.68,1.7,0xf0c020); ball(mu+.08,mv+.03,1.7,.014,0xf0c020); box(mu-.14,mv-.02,mu-.06,mv+.02,1.52,1.55,0x101014);
      use('THE MYNA BIRD',mu,mv,.4,1.8,SHOPS3.myna,1.6);
      // the call-sign cards pinned on the back wall
      box(t(7.0),.02,t(8.4),.04,1.35,1.95,0xb08850); for(let i=0;i<6;i++)box(t(7.1)+(i%3)*.42,.04,t(7.1)+(i%3)*.42+.32,.045,1.42+Math.floor(i/3)*.27,1.62+Math.floor(i/3)*.27,0xf4f0e0);
      use('THE CALL-SIGN CARDS',t(7.7),.2,t(1.4),2.0,()=>look('THE CALL-SIGN CARDS',(g,w,h)=>{ g.fillStyle='#b08850'; g.fillRect(0,0,w,h); const L=[['10-4','UNDERSTOOD'],['10-8','IN SERVICE'],['10-9','SAY AGAIN'],['10-15','IN CUSTODY'],['10-20','WHERE ARE YOU?'],['10-33','EMERGENCY'],['10-97','ON SCENE'],['10-99','ALL CLEAR']];
        L.forEach(([a,b],i)=>{ const x=14+(i%2)*(w-28)/2, y=14+Math.floor(i/2)*(h-28)/4; g.fillStyle='#f4f0e0'; g.fillRect(x,y,(w-28)/2-8,(h-28)/4-8); g.fillStyle='#2a2a2a'; g.font='bold 15px monospace'; g.textAlign='left'; g.textBaseline='top'; g.fillText(a,x+8,y+8); g.font='11px monospace'; g.fillText(b,x+8,y+30); }); },'What the voices on the scanner mean.'),1.6);
      // a glass case of radios and goggles by the door (the Scanner sells from it)
      box(t(7.4),t(6.3),t(9.4),t(6.9),0,.5,C.dark); box(t(7.4),t(6.3),t(9.4),t(6.9),.5,.95,C.glass); box(t(7.38),t(6.28),t(9.42),t(6.92),.95,.98,C.steel); for(let i=0;i<4;i++)box(t(7.6)+i*.42,t(6.45),t(7.9)+i*.42,t(6.75),.52,.66,[0x2a2a2a,0x3a5a3a,0x2a2a2a,0x3a5a3a][i]); glow(()=>box(t(7.45),t(6.35),t(9.35),t(6.85),.93,.94,0xfff4e0)); sol(7.4,6.3,9.4,6.9);
      use('THE GLASS CASE (RADIOS AND GOGGLES)',t(8.4),t(6.6),t(2.0),1.0,()=>{ const N=merch('scanner'); if(N&&SHOPS.open)SHOPS.open(N); },1.6); }); };
    MSHOP.kit.scanner.drop=k0.drop; } }
}
