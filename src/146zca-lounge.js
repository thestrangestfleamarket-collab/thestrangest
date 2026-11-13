// THE BAR, THE LOUNGE (owner, 7 Nov 2026: "build the new bar based on polyfork assets, octopus plays drums"; his pick: the lounge, off the map, tall): Polyfork's casino-lounge pieces (data/bar.json) in a dark, tall room behind the Hudson row's BAR door: the back bar and counter with stools, velvet booths, drum tables, a pool table under its lamp, darts, a jukebox, a grand piano, and the stage where the octopus plays its kit.
import {SHARED, THREE} from './003-shx.js';
import {CHARS, DRM, INSTR, ROOMS, SHOPS, STAGE, USE, VIS, WORKERS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {SYS} from './006-map-pre.js';
import {CATALOG, PROPL} from './014-gamekit.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
import {MSHOP} from './059i-mshops.js';
import {KIT} from './068-kit.js';
import {BODIES} from './111a-bodies.js';
const LOUNGE={uses:[]}; window.LOUNGE=LOUNGE;   // uses: later files add to the room as it builds (K, F)
{ const PJ=__LAZY__("data/bar.json"); let PG=null, GEO=null; const geo=()=>PG||(PG=PJ().then(D=>{ const G={}; for(const k in D){ const g=KIT.decode(D[k]); g.computeBoundingBox(); G[k]=g; } return GEO=G; }));
  { let wrapped=false; const wrap=()=>{ if(wrapped)return; const o=ROOMS.off&&ROOMS.off.bar; if(!o)return; wrapped=true; const n0=o.need; o.need=()=>Promise.all([n0?n0():null,geo()]); }; wrap(); SYS.add('places',wrap,'146zca-lounge'); }   // (now when the bar is there already: going in before the first frame must wait for the pieces too)
  const say=(t,c)=>SAY(t,c||'#e8c8a0'), inBar=()=>!!(ROOMS.offIn&&ROOMS.offIn()==='bar');
  MSHOP.kit.bar=A=>{ '@later'; const R=A.R, F=IKIT.frame(R), MW=IKIT.MW, W=F.W, D=F.D, tm=D/(R.y1-R.y0), K=IKIT.room(F,o=>A.add(o),()=>{}), {box,pic,words,use}=K, G=GEO||{}, HT=A.WH/24*tm;
    const tx=u=>F.tu(u), ty=v=>F.tv(v), sol=(u0,v0,u1,v1)=>A.sol(R.x0+Math.min(u0,u1)/tm,R.y0+Math.min(v0,v1)/tm,R.x0+Math.max(u0,u1)/tm,R.y0+Math.max(v0,v1)/tm);
    // a Polyfork piece on the floor (or at h metres), facing (du,dv), s its scale (sy its height's)
    const put=(k,u,v,du,dv,o={})=>{ const g=G[k]; if(!g)return null; const bb=g.boundingBox, s=o.s||1, me=new THREE.Mesh(g,KIT.mat), grp=new THREE.Group(), p=F.pw(u,v);
      me.position.set(-(bb.min.x+bb.max.x)/2,-bb.min.y,-(bb.min.z+bb.max.z)/2); me.castShadow=o.shadow!==false; me.receiveShadow=true; grp.add(me); grp.scale.set(MW*s,MW*s*(o.sy||1),MW*s); grp.position.set(p[0],(o.h||0)*MW,p[1]); grp.rotation.y=F.hd(du,dv); A.add(grp); return grp; };
    const lamp=(u,v,h,c,i,r)=>A.lamp(tx(u),ty(v),h/tm,c,i*9,r*1.6/tm);   // (a tall room: the game's lamps fall off fast, and only the eight nearest light it)
    const sit=(name,u,v,h,du,dv,w=.6)=>use(name,u,v,w,1.1,()=>{ const p=F.pw(u,v); USE.sitAt(p[0],p[1],h*MW,F.hd(du,dv)); },1.4);
    // the room: dark herringbone boards; oxblood plaster over a black wainscot, a brass rail
    A.floor((x,y)=>{ const u=(x-R.x0)*tm, v=(y-R.y0)*tm, a=Math.floor((u+v)*3), b=Math.floor((u-v)*3), s=.8+.2*A.hs(a,b,3), e=((u+v)*3%1)<.06||((u-v)*3%1+1)%1<.06?.7:1; return [58*s*e,36*s*e,26*s*e]; });
    for(const sd of ['b','w','e','f'])A.wall(sd,(a,z)=>{ if(z<6)return [18,14,14]; if(z<30)return (Math.floor(a*4)%2&&z>9&&z<27)?[30,22,22]:[22,16,16]; if(z<33)return [150,118,70];
      const n=.9+.1*A.hs(Math.floor(a*20),Math.floor(z/4),5); return [86*n,26*n,30*n]; });
    // THE STAGE, back-east corner: four deck pieces at the kit's height, the curtain behind, a truss of lights over it; the octopus's kit on it
    const SU=W-2.6, SV=2.4, SH=14/28.6;
    for(const [u,v] of [[SU-1,SV-1],[SU+1,SV-1],[SU-1,SV+1],[SU+1,SV+1]])put('stage',u,v,0,1,{sy:SH});
    sol(SU-2,.0,SU+2,SV+2); put('curtain',SU,.28,0,1,{sy:1.5});
    for(const u of [SU-1,SU+1])put('truss',u,SV+2.1,0,1,{h:4.6});
    put('mic',SU-1.5,SV+1.4,0,1,{h:SH}); put('followspot',W-8.2,9.4,1,-1);
    { const n0=PROPL.length, kx=tx(SU), ky=ty(SV+.2), p=CATALOG['drum kit on a stage'](kx,ky); SHARED.BOD.place(p,0); for(const b of p.boxes)SHARED.BOD.gbox(b,'A'); PROPL.length=n0;
      DRM.make({at:(x,y)=>({x:SHARED.BOD.X(x),z:SHARED.BOD.Z(y)}),hd:0,stage:{z:14},drums:{x:kx,y:ky}},{add:g=>A.add(g),live:inBar}); STAGE.make({}); LOUNGE.kit={x:kx,y:ky};
      // the kit played in place: the octopus steps off, you sit on his throne up on the stage
      let GR=null; const kw={x:SHARED.BOD.X(kx),z:SHARED.BOD.Z(ky)};
      LOUNGE.drums={live:inBar,at:()=>{ const a=DRM.at; return {x:a.x,z:a.z,hd:Math.atan2(kw.x-a.x,kw.z-a.z)}; },
        take:()=>{ DRM.taken=true; if(DRM.stop)DRM.stop(); if(DRM.g)VIS.hide(DRM.g,'play',true); const a=DRM.at, e=.5*MW; GR={x0:a.x-e,x1:a.x+e,z0:a.z-e,z1:a.z+e,ground:()=>a.y}; ROOMS.grounds.push(GR); },
        back:()=>{ DRM.taken=false; if(DRM.g)VIS.hide(DRM.g,'play',false); const i=ROOMS.grounds.indexOf(GR); if(i>=0)ROOMS.grounds.splice(i,1); GR=null; }}; }
    put('piano',W-6.6,2.6,0,1); put('pianobench',W-6.6,4.0,0,-1); sol(W-7.4,1.5,W-5.8,3.7);
    { const s=F.pw(W-6.6,4.0), p=F.pw(W-6.6,2.6); LOUNGE.piano={live:inBar,at:()=>({x:s[0],z:s[1],hd:Math.atan2(p[0]-s[0],p[1]-s[1])})}; }
    const inPlace=(id,P)=>()=>{ if(INSTR.kindOn()===id&&INSTR.ME.place===P)INSTR.stop(); else INSTR.start(id,P); };
    // THE BAR down the west wall: the back bar's lit shelves, the onyx counter, seven stools, glasses and a bottle on top
    for(const v of [7,9,11,13])put('backbar',.25,v,1,0);
    for(const v of [7,9,11,13])put('counter',2.05,v,1,0);
    sol(0,6,.5,14); sol(1.65,6,2.45,14);
    for(let i=0;i<7;i++){ const v=6.6+i*1.15; put('stool',2.95,v,-1,0); sit('A BAR STOOL',2.95,v,.78,-1,0,.45); }
    for(const [v,k] of [[7.4,'martini'],[9.6,'whiskey'],[11.2,'martini'],[12.8,'martini']])put(k,2.2,v,1,0,{h:1.1,shadow:false});
    put('icebucket',3.4,14.6,0,1);
    use('THE BAR (DRINKS)',2.05,10,1.2,1.3,()=>SHOPS.open((BODIES.by.w_badger&&BODIES.by.w_badger.npc)||{key:'w_badger',name:'THE BADGER'}),2.2);   // the badger pours (back with his drinks: owner, 7 Nov 2026)
    // the booths down the east wall, a drum table in each; drum tables and chairs in the middle by the door
    for(const v of [8.6,11.8,15]){ put('booth',W-.7,v,-1,0); put('drumtable',W-1.9,v,0,1); sol(W-1.3,v-1.2,W,v+1.2); sit('A VELVET BOOTH',W-.9,v,.48,-1,0,1.2); }
    for(const [u,v] of [[5.2,18.2],[9.4,18.2],[5.2,21.4],[9.4,21.4]]){ put('drumtable',u,v,0,1); for(const s of [-1,1]){ put('chair',u+s*.75,v,-s,0); sit('A CHAIR',u+s*.75,v,.48,-s,0,.5); } }
    // THE POOL TABLE under its lamp, the darts on the east wall by the door, the jukebox, the palms by the door
    const PU=W/2-.6, PV=9.6; put('pooltable',PU,PV,1,0); sol(PU-.8,PV-1.3,PU+.8,PV+1.3); put('pendant',PU,PV,1,0,{h:1.05});
    box(PU-.01,PV-.01,PU+.01,PV+.01,2.85,HT,0x111111);
    use('POOL TABLE',PU,PV,1.6,1.0,()=>MINI.open(GAMES.pool({end:S=>{ LOUNGE.pool={line:S.over,shots:S.score}; }})),2.2);
    const DB=IKIT.tex(32,32,g=>{ g.fillStyle='#141414'; g.fillRect(0,0,32,32); for(const [r,c] of [[15,'#1a1a1a'],[13,'#d8c8a0'],[10,'#2a6a2a'],[8,'#d8c8a0'],[5,'#a02020'],[2,'#2a6a2a'],[1,'#a02020']]){ g.fillStyle=c; g.beginPath(); g.arc(16,16,r,0,7); g.fill(); } });
    pic(W-.04,19.2,1.35,.5,.5,-1,0,DB); box(W-2.45,18.9,W-2.4,19.5,0,.01,0xe8e0c8);
    use('DARTS',W-.3,19.2,.8,1.9,()=>MINI.open(GAMES.darts({end:S=>{ LOUNGE.darts={line:S.over,turns:S.score}; }})),2.8);
    put('jukebox',.5,D-2.6,1,0); sol(0,D-3.1,.8,D-2.1);
    use('THE JUKEBOX',.5,D-2.6,.9,1.5,()=>{ if(DRM.on){ DRM.on=false; if(DRM.stop)DRM.stop(); say('THE JUKEBOX PLAYS SOMETHING SLOW. THE OCTOPUS TAKES FIVE.'); } else{ DRM.on=true; say('THE JUKEBOX GOES QUIET. THE OCTOPUS PICKS UP HIS STICKS.'); } },1.6);
    for(const u of [W-8.6,W-.6]){ put('column',u,.6,0,1,{sy:HT/4}); sol(u-.4,.2,u+.4,1); }   // either side of the stage, floor to ceiling
    for(const u of [.9,W-.9]){ put('palm',u,D-.9,0,-1); sol(u-.45,D-1.35,u+.45,D-.45); }
    put('ashtray',W/2-1.4,D-.6,0,-1); put('ashtray',W/2+1.4,D-.6,0,-1);
    use('THE GRAND PIANO (PLAY IT)',W-6.6,2.6,1.5,1.9,inPlace('piano',LOUNGE.piano),2.2);
    use('THE DRUM KIT (PLAY IT)',SU,SV+.2,1.6,1.4,inPlace('drums',LOUNGE.drums),3);
    // the sconces, low and warm; the sign over the stage
    for(const v of [10.2,13.4,16.6])put('sconce',W-.05,v,-1,0,{h:2.2,shadow:false});
    for(const v of [16.5,19.5,22.5])put('sconce',.05,v,1,0,{h:2.2,shadow:false});
    pic(SU,.04,4.7,2.6,.6,0,1,words(104,24,'#140c10',[['THE OCTOPUS',52,3,'#ff78aa',9,'center'],['LIVE · NIGHTLY',52,14,'#e8c890',6,'center']]),true);
    // the light: dim and warm; the stage, the pool table and the back bar lit, the rest in their glow
    lamp(SU,SV+2.2,2.9,0xffb070,9,9); lamp(SU-1.2,SV+.6,2.4,0xff6aa0,2.2,4);
    lamp(PU,PV,1.7,0xffd29a,4,3.6);
    lamp(1.2,8,1.6,0xffa860,2.6,4.5); lamp(1.2,12,1.6,0xffa860,2.6,4.5);
    for(const v of [10.2,13.4,16.6])lamp(W-.5,v,2.2,0xff9a60,1.2,3); for(const v of [16.5,19.5,22.5])lamp(.5,v,2.2,0xff9a60,1.2,3);
    lamp(W/2,D-1.5,2.8,0xffc890,1.4,4);
    // a little lamp on every drum table (booths and the floor): its own warm pool in the dark
    for(const [u,v] of [[W-1.9,8.6],[W-1.9,11.8],[W-1.9,15],[5.2,18.2],[9.4,18.2],[5.2,21.4],[9.4,21.4]]){ K.cyl(u,v,.035,.55,.82,0xb08838); K.glow(()=>K.cyl(u,v,.11,.8,.95,0xffc070,.07)); lamp(u,v,.95,0xffb070,1.6,2.8); }
    for(const f of LOUNGE.uses)f(K,F);
    K.flush();
    setTimeout(()=>WORKERS.make('bar'),0);   // the badger at the taps (once the room's spots are set, below)
    // where people go: the staff at the counter and the stage, the drinkers on the stools, booths and chairs
    const sp=(u,v,du,dv,h)=>{ const p=F.pw(u,v); return {x:p[0],z:p[1],hd:F.hd(du,dv),...(h!=null?{y:h*MW}:{})}; }, o=ROOMS.off.bar;
    if(o){ o.spots={TAPS:sp(1.1,10,1,0),SERVER:sp(4.2,15.6,0,1),HOST:sp(W/2,D-2.4,0,-1)};
      o.seats=[...Array.from({length:7},(_,i)=>sp(2.95,6.6+i*1.15,-1,0,.78)),...[8.6,11.8,15].map(v=>sp(W-.9,v,-1,0,.48)),sp(PU,PV+1.8,0,-1),sp(W-2.6,19.2,1,0),sp(3.2,D-1.4,0,-1),sp(W-3.2,D-1.4,0,-1)]; } };
  MSHOP.kit.bar.drop=()=>{ if(DRM.stop)DRM.stop(); };
  LOUNGE.dbg={DRM,KIT,MINI,SHOPS,CHARS,scene};
  window.LOUNGEDBG=()=>({built:!!(ROOMS.lazy.bar&&ROOMS.lazy.bar.done),geo:!!GEO,kit:LOUNGE.kit||null,drum:!!DRM.g,at:DRM.at?{x:+DRM.at.x.toFixed(1),z:+DRM.at.z.toFixed(1)}:null,on:!!DRM.on,live:DRM.live?DRM.live():null}); }
