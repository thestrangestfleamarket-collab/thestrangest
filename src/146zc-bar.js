// THE BAR, FURNISHED: what a working bar has on top of the owner's dark room (STORE.furnish.bar, after its own props): taps and a register on the counter, kegs, the glass rack and ice well behind it, a cue rack, the darts' oche and scoreboard; the badger at the taps selling drinks; where its staff work and its drinkers sit or stand; a game of darts.
import {THREE} from './003-shx.js';
import {FORAGE, UI, VIT, WORKERS} from './003b-systems.js';
import {scene} from './004-main.js';
import {STORE, TILE} from './006-map-pre.js';
import {OBJS} from './008-batch.js';
import {IKIT} from './038zc-ikit.js';
const BAR={places:[]}; window.BAR=BAR;
{ // the drinks the badger pours (items.json: edible), what each does
  FORAGE.add({names:{d_ale:'A PINT OF ALE',d_stout:'A PINT OF STOUT',d_cola:'A GLASS OF COLA'},does:{d_ale:()=>{ VIT.sta=1; },d_stout:()=>{ VIT.sta=1; VIT.hp=Math.min(1,VIT.hp+.1); },d_cola:()=>{ VIT.sta=Math.min(1,VIT.sta+.5); }}});
  // the room in metres: u from the west wall (the counter's side) east, v from the back (the stage) to the front door
  const frameOf=S=>{ const B=S.B; return IKIT.frame({x0:B.x0+.1,y0:B.y0+.1,x1:B.x1-.1,y1:B.y1-.1},(x,y)=>{ const q=S.at(x,y); return [q.x,q.z]; }); };
  // a dart's score: the board's numbers clockwise from the top, treble and double rings, the bulls
  const SEG=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
  const score=(x,y)=>{ const r=Math.hypot(x,y); if(r<.0064)return [50,'BULL']; if(r<.016)return [25,'25']; if(r>.17)return [0,'MISS']; const a=(Math.atan2(x,y)*180/Math.PI+360+9)%360, n=SEG[Math.floor(a/18)];
    return r>.099&&r<.107?[n*3,'T'+n]:r>.162?[n*2,'D'+n]:[n,''+n]; };
  BAR.score=score;
  (STORE.furnish||(STORE.furnish={})).bar=S=>{ '@later'; const F=frameOf(S), {W,D,pw,hd}=F, K=IKIT.room(F,o=>scene.add(o)), {box,cyl,ball,glow,pic,words,spot,sol}=K, CU=2.46, CH=1.08;
    const C={chrome:0xb8bcc0,brass:0xb08838,wood:0x3a2418,steel:0x8a8e92,black:0x141416,keg:0x9aa0a6};
    // two tap towers on the counter, four handles each
    for(const v of [18.4,20.1]){ cyl(CU,v,.04,CH,CH+.32,C.chrome); box(CU-.06,v-.32,CU+.06,v+.32,CH+.28,CH+.36,C.chrome); for(let i=0;i<4;i++){ const vv=v-.24+i*.16; cyl(CU-.08,vv,.012,CH+.2,CH+.28,C.chrome); cyl(CU-.08,vv,.018,CH+.36,CH+.5,[0x7a2a1a,0xd8c060,0x1a1a1a,0x2a5a2a][i]); } box(CU-.1,v-.3,CU+.1,v+.3,CH,CH+.015,C.black); }
    // the register at the counter's back end
    box(CU-.22,16.2,CU+.18,16.62,CH,CH+.1,C.black); box(CU-.18,16.24,CU+.14,16.58,CH+.1,CH+.3,C.brass); box(CU-.18,16.4,CU+.14,16.58,CH+.3,CH+.4,C.brass); glow(()=>box(CU+.14,16.3,CU+.15,16.52,CH+.32,CH+.38,0x60ff90));
    // behind the counter: the glass rack and ice well under it, kegs by the fridge
    box(1.2,17.0,1.9,18.0,0,.85,C.steel); box(1.25,17.05,1.85,17.5,.85,.86,0xd8e8f0); for(let i=0;i<6;i++)for(let j=0;j<2;j++)cyl(1.32+i*.1,17.65+j*.15,.03,.85,.97,0xbcd4dc,.035);
    for(const [u,v,h] of [[.45,12.2,0],[.45,12.75,0],[.45,12.47,.58]]){ cyl(u,v,.22,h,h+.58,C.keg); cyl(u,v,.225,h+.1,h+.13,0x6a6e72); cyl(u,v,.225,h+.45,h+.48,0x6a6e72); } sol(.2,11.95,.7,13.0);
    // a cue rack on the west wall by the pool table, a chalked board of the darts' scores by the board
    box(.0,9.6,.04,10.6,.9,1.7,C.wood); for(let i=0;i<4;i++){ const v=9.72+i*.25; cyl(.06,v,.012,.25,1.65,0xc8a070,.008,6); }
    box(.0,7.5,.035,8.0,1.5,1.7,0x1a1a1a);
    box(W-.03,16.2,W,17.1,1.25,1.95,0x2a2a2a); pic(W-.035,16.65,1.3,.8,.6,-1,0,words(48,36,'#1c1c1c',[['DARTS',24,2,'#e8e4d8',8,'center'],['301',24,13,'#c8c0a8',7,'center'],['3 DARTS',24,24,'#c8c0a8',7,'center']]));
    box(W-2.42,15.05,W-2.37,15.65,0,.01,0xe8e0c8);   // the oche
    pic(4.4,.02,1.7,1.4,.5,0,1,words(56,20,'#141414',[['TONIGHT · THE OCTOPUS',28,2,'#e8d8b0',6,'center'],['DRAFT $6',28,11,'#d8a050',7,'center']]));
    K.flush();
    // darts: three from the oche, each landing by your hand
    // the board's own middle (its painted face, a named thing); the throws land round it
    const bo=OBJS.filter(o=>o.name==='dartboard'&&o.parts.length).map(o=>{ const b=new THREE.Box3(); for(const p of o.parts){ const A=p.me.geometry.attributes.position.array; for(let i=0;i<6;i++)b.expandByPoint(new THREE.Vector3().fromArray(A,(p.v0+i)*3)); } return b.getCenter(new THREE.Vector3()); })
      .sort((a,b)=>Math.hypot(a.x-F.pw(W,15.36)[0],a.z-F.pw(W,15.36)[1])-Math.hypot(b.x-F.pw(W,15.36)[0],b.z-F.pw(W,15.36)[1]))[0];
    const BX=W-.02, BV=bo?(()=>{ const o=F.pw(0,0); return ((bo.x-o[0])*F.ev[0]+(bo.z-o[1])*F.ev[1])/K.MW; })():15.36, BH=bo?bo.y/K.MW:1.73, darts=[];
    const hb=new THREE.Mesh(new THREE.BoxGeometry(.6*K.MW,.6*K.MW,.6*K.MW),new THREE.MeshBasicMaterial({visible:false})); { const p=pw(BX-.2,BV); hb.position.set(p[0],BH*K.MW,p[1]); } scene.add(hb);
    const dartM=new THREE.MeshLambertMaterial({color:0xd03020}), dartG=new THREE.CylinderGeometry(.004*K.MW,.002*K.MW,.12*K.MW,6); dartG.rotateZ(Math.PI/2);
    const th={name:'DARTS',obj:hb,reach:2.6*TILE,near:3.6*TILE,tall:1.9*K.MW,act:()=>{ for(const d of darts)d.removeFromParent(); darts.length=0; let tot=0; const said=[];
      for(let i=0;i<3;i++){ const r=.12*Math.sqrt(Math.random()), a=Math.random()*Math.PI*2, x=Math.cos(a)*r, y=Math.sin(a)*r, [s,lab]=score(x,y); tot+=s; said.push(lab);
        if(s){ const d=new THREE.Mesh(dartG,dartM), p=pw(BX-.06,BV+x); d.position.set(p[0],(BH+y)*K.MW,p[1]); d.rotation.y=hd(1,0)-Math.PI/2; scene.add(d); darts.push(d); } }
      th.name='DARTS: '+said.join(' · ')+' = '+tot; BAR.last={said,tot}; }};
    UI.thing(th);
    WORKERS.make('bar'); };
  // where its people go: the staff by title, the drinkers on the five stools and two armchairs or standing at the games
  { const S0=STORE.barFrame, R=(STORE.rooms||[]).find(r=>r.id==='bar');
    if(S0&&R){ const F=frameOf(S0), sp=(u,v,du,dv,h)=>{ const p=F.pw(u,v); return {x:p[0],z:p[1],hd:F.hd(du,dv),...(h!=null?{y:h*IKIT.MW}:{})}; }, B=S0.B;
      const st=[2.7,3.85,5,6.15,7.3].map(x=>{ const q=S0.at(B.x0+.1+3.62,B.y1-.1-1.35-(x-1.84)); return {x:q.x,z:q.z,hd:F.hd(-1,0),y:.76*IKIT.MW}; });
      R.spots={TAPS:sp(1.4,18.9,1,0),BARKEEP:sp(1.4,20.6,1,0),OWNER:sp(1.4,16.9,1,0),SERVER:sp(6.3,19.6,1,0),HOST:sp(5.6,22.0,0,-1)};
      R.seats=BAR.places=[...st,sp(8.4,21.0,-1,0,.45),sp(6.7,21.0,1,0,.45),sp(4.25,8.6,0,1),sp(2.7,10.4,1,0),sp(5.8,11.6,-1,0),sp(6.6,15.36,1,0),sp(6.1,16.0,1,0),sp(3.45,15.2,-1,0),sp(5.0,3.6,0,-1),sp(3.8,3.9,0,-1)]; } }
  window.BARDBG=()=>({places:BAR.places.length,spots:Object.keys((STORE.rooms.find(r=>r.id==='bar')||{}).spots||{}),last:BAR.last||null});
}
