// THE BAR, FURNISHED: what a working bar has on top of the owner's dark room (STORE.furnish.bar, after its own props): taps and a register (the badger serves at both), kegs, the glass rack and ice well, a cue rack and the pool table (a game of pool), the darts' oche and a scoreboard chalked with the last games (a game of 301); where its staff work and its drinkers sit or stand.
import {FORAGE, SHOPS, VIT, WORKERS} from './003b-systems.js';
import {scene} from './004-main.js';
import {STORE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
import {BODIES} from './111a-bodies.js';
const BAR={places:[]}; window.BAR=BAR;
{ // the drinks the badger pours (items.json: edible), what each does
  FORAGE.add({names:{d_ale:'A PINT OF ALE',d_stout:'A PINT OF STOUT',d_cola:'A GLASS OF COLA'},does:{d_ale:()=>{ VIT.sta=1; },d_stout:()=>{ VIT.sta=1; VIT.heal(.1); },d_cola:()=>{ VIT.sta=Math.min(1,VIT.sta+.5); }}});
  // the room in metres: u from the west wall (the counter's side) east, v from the back (the stage) to the front door
  const frameOf=S=>{ const B=S.B; return IKIT.frame({x0:B.x0+.1,y0:B.y0+.1,x1:B.x1-.1,y1:B.y1-.1},(x,y)=>{ const q=S.at(x,y); return [q.x,q.z]; }); };
  BAR.board=[];   // the chalked scores: the last games of 301
  (STORE.furnish||(STORE.furnish={})).bar=S=>{ '@later'; const F=frameOf(S), {W,D,pw,hd}=F, K=IKIT.room(F,o=>scene.add(o)), {box,cyl,ball,glow,pic,words,spot,sol}=K, CU=2.46, CH=1.08;
    const C={chrome:0xb8bcc0,brass:0xb08838,wood:0x3a2418,steel:0x8a8e92,black:0x141416,keg:0x9aa0a6};
    // two tap towers on the counter, four handles each
    for(const v of [18.4,20.1]){ cyl(CU,v,.04,CH,CH+.32,C.chrome); box(CU-.06,v-.32,CU+.06,v+.32,CH+.28,CH+.36,C.chrome); for(let i=0;i<4;i++){ const vv=v-.24+i*.16; cyl(CU-.08,vv,.012,CH+.2,CH+.28,C.chrome); cyl(CU-.08,vv,.018,CH+.36,CH+.5,[0x7a2a1a,0xd8c060,0x1a1a1a,0x2a5a2a][i]); } box(CU-.1,v-.3,CU+.1,v+.3,CH,CH+.015,C.black); }
    // the register at the counter's back end
    box(CU-.22,16.2,CU+.18,16.62,CH,CH+.1,C.black); box(CU-.18,16.24,CU+.14,16.58,CH+.1,CH+.3,C.brass); box(CU-.18,16.4,CU+.14,16.58,CH+.3,CH+.4,C.brass); glow(()=>box(CU+.14,16.3,CU+.15,16.52,CH+.32,CH+.38,0x60ff90));
    // behind the counter: the glass rack and ice well under it, kegs by the fridge
    box(1.2,17.0,1.9,18.0,0,.85,C.steel); box(1.25,17.05,1.85,17.5,.85,.86,0xd8e8f0); for(let i=0;i<6;i++)for(let j=0;j<2;j++)cyl(1.32+i*.1,17.65+j*.15,.03,.85,.97,0xbcd4dc,.035);
    for(const [u,v,h] of [[.45,12.2,0],[.45,12.75,0],[.45,12.47,.58]]){ cyl(u,v,.22,h,h+.58,C.keg); cyl(u,v,.225,h+.1,h+.13,0x6a6e72); cyl(u,v,.225,h+.45,h+.48,0x6a6e72); } sol(.2,11.95,.7,13.0);
    // a cue rack on the west wall by the pool table, the darts' scoreboard by the board (chalked with the last games), the night's board by the stage
    box(.0,9.6,.04,10.6,.9,1.7,C.wood); for(let i=0;i<4;i++){ const v=9.72+i*.25; cyl(.06,v,.012,.25,1.65,0xc8a070,.008,6); }
    const SB=IKIT.tex(48,48,()=>{}), chalk=()=>{ const c=SB.image, g=c.getContext('2d'); g.fillStyle='#1c1c1c'; g.fillRect(0,0,48,48); g.textAlign='center'; g.textBaseline='top'; g.font='8px monospace'; g.fillStyle='#e8e4d8'; g.fillText('DARTS 301',24,2);
      g.font='7px monospace'; g.fillStyle='#c8c0a8'; BAR.board.slice(-4).forEach((l,i)=>g.fillText(l,24,13+i*8)); if(!BAR.board.length)g.fillText('NO GAMES YET',24,22); SB.needsUpdate=true; }; chalk();
    box(W-.03,16.2,W,17.1,1.25,1.95,0x2a2a2a); pic(W-.035,16.65,1.3,.8,.6,-1,0,SB);
    box(W-2.42,15.05,W-2.37,15.65,0,.01,0xe8e0c8);   // the oche
    const TN=words(56,20,'#141414',[['TONIGHT · THE OCTOPUS',28,2,'#e8d8b0',6,'center'],['DRAFT $6',28,11,'#d8a050',7,'center']]); pic(4.4,.02,1.7,1.4,.5,0,1,TN);
    K.flush();
    // what you do here: darts, pool, the taps and the register (the badger serves), the boards to read
    const badger=()=>(BODIES.by.w_badger&&BODIES.by.w_badger.npc)||{key:'w_badger',name:'THE BADGER'};
    K.use('DARTS',W-.3,15.36,.8,1.9,()=>MINI.open(GAMES.darts({end:S=>{ BAR.last={line:S.over,turns:S.score}; BAR.board.push(S.score<99?'OUT IN '+S.score:'NO OUT'); chalk(); }})),2.8);
    K.use('THE SCOREBOARD',W-.3,16.65,.9,1.95,()=>MINI.look('THE SCOREBOARD',SB));
    K.use('POOL TABLE',4.25,10.36,1.4,.9,()=>MINI.open(GAMES.pool({end:S=>{ BAR.pool={line:S.over,shots:S.score}; }})),2.0);
    K.use('THE CUE RACK',.2,10.1,.6,1.7,()=>MINI.open(GAMES.pool({end:S=>{ BAR.pool={line:S.over,shots:S.score}; }})));
    for(const v of [18.4,20.1])K.use('THE TAPS',CU,v,.5,1.5,()=>SHOPS.open(badger()));
    K.use('THE REGISTER',CU,16.4,.5,1.5,()=>SHOPS.open(badger()));
    K.use("TONIGHT'S BOARD",4.4,.3,1.4,2.2,()=>MINI.look("TONIGHT'S BOARD",TN));
    WORKERS.make('bar'); };
  // where its people go: the staff by title, the drinkers on the five stools and two armchairs or standing at the games
  { const S0=STORE.barFrame, R=(STORE.rooms||[]).find(r=>r.id==='bar');
    if(S0&&R){ const F=frameOf(S0), sp=(u,v,du,dv,h)=>{ const p=F.pw(u,v); return {x:p[0],z:p[1],hd:F.hd(du,dv),...(h!=null?{y:h*IKIT.MW}:{})}; }, B=S0.B;
      const st=[2.7,3.85,5,6.15,7.3].map(x=>{ const q=S0.at(B.x0+.1+3.62,B.y1-.1-1.35-(x-1.84)); return {x:q.x,z:q.z,hd:F.hd(-1,0),y:.76*IKIT.MW}; });
      R.spots={TAPS:sp(1.4,18.9,1,0),BARKEEP:sp(1.4,20.6,1,0),OWNER:sp(1.4,16.9,1,0),SERVER:sp(6.3,19.6,1,0),HOST:sp(5.6,22.0,0,-1)};
      R.seats=BAR.places=[...st,sp(8.4,21.0,-1,0,.45),sp(6.7,21.0,1,0,.45),sp(4.25,8.6,0,1),sp(2.7,10.4,1,0),sp(5.8,11.6,-1,0),sp(6.6,15.36,1,0),sp(6.1,16.0,1,0),sp(3.45,15.2,-1,0),sp(5.0,3.6,0,-1),sp(3.8,3.9,0,-1)]; } }
  window.BARDBG=()=>({places:BAR.places.length,spots:Object.keys((STORE.rooms.find(r=>r.id==='bar')||{}).spots||{}),last:BAR.last||null,board:BAR.board.slice(-4)});
}
