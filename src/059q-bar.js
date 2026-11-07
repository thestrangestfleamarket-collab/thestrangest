// THE BAR: on the Hudson row a painted brick front with a neon BAR sign (MSHOP's shopfront) and a door; its inside off the map, built behind the fade when you go in: the dark underground bar of 30 Oct as it was (the counter, the pool table, the darts, one table, the octopus on its stage, the stairs up to the street).
import {SHARED} from './003-shx.js';
import {AWAY, BLDK, grab, LAY, OFFDX, STORE, TILE, TURN, WP, ZU} from './006-map-pre.js';
import {BLOCKS} from './038zb-blocks.js';
import {MSHOP} from './059i-mshops.js';
await grab('bar',async()=>{ if(AWAY.has('bar')||!WP.bar)return;
  const K=STORE.kit, {room,STEPS,sol,put}=K, SK=SHARED.BOD.STOREK, {PROPS,LAMPS,T}=SK, {X,Z}=SHARED.BOD, sh=SHARED.BOD.K.sh, hs=SHARED.BOD.g.hash, MS=STORE.main, H=170;
  const LW=MS.lot('bar',H), TP=TURN(LW,WP.bar.face||'n'), L=TP.L, cxL=(L.x0+L.x1)/2, OX=1180+OFFDX/BLDK-TP.cx, cx=cxL+OX, W=10, DEP=25;   // the room 10 wide and 25 deep, as on West St
  const BL={id:'lbar',x0:cx-W/2,x1:cx+W/2,y0:L.y1-DEP,y1:L.y1,h:130}, TB=TURN(BL,'n'), D={w:'f',a:cx,wd:1.56,h:94};
K.rec('bar','THE BAR',BL,D,true); STORE.barFrame={B:BL,at:(x,y)=>({x:X(x),z:Z(y)})};
  const FRONT={name:'THE BAR',sign:'BAR',signC:[255,64,96],neon:true,signBg:[20,16,18],wall:BLOCKS.brick([72,56,52]),trim:[120,108,98],frame:[34,26,24],door:.5,h:H,
    win:(u,v,n)=>{ if(v>.15&&v<.85){ const k=Math.floor(u*5); return n?Object.assign([90+40*hs(k,2,5),30,34],{e:1}):[34,22,24]; } return null; }};   // dark glass, a low red glow inside after dark
  STEPS.push(()=>{ '@later'; room('bar','THE BAR',BL,{floor:SK.bar.barFloorCol,in:SK.bar.barWall},D,(B0,l0)=>{ const n0=PROPS.length, B=BL, L=B.x0+T, R=B.x1-T, Kb=B.y0+T, F=B.y1-T, m=(B.x0+B.x1)/2, yE=F-1.35, along=x=>yE-(x-1.84);
      const mid=(Kb+F)/2;
      // THE BAR: counter, back-bar shelves and stools down the front-west wall
      put('back bar',L+.42,along(5.2),3); put('bar soffit',L+1.5,along(4.5),3); put('neon sign: BAR',L+.08,along(5.2),0);
      put('bar round end',L+2.56,yE,3); put('bar counter: ashtray',L+2.66,along(3.3),3); put('bar counter: bottle',L+2.66,along(5.1),3); put('bar counter: glass',L+2.66,along(6.9),3); put('bar corner',L+1.6,along(8.26),3);
      const stools=[2.7,3.85,5,6.15,7.3].map(x=>{ put('bar stool',L+3.62,along(x)); return {x:L+3.62,y:along(x)}; });
      put('bar fridge',L+.4,along(9.7)); put('potted plant',L+.55,along(10.9));
      for(const x of [2.5,4.3,6.1])put('candle on the bar',L+2.76,along(x));
      // the octopus drummer's stage, back-east corner (125-128)
      const SX=R-2.5, SY=Kb+1.4; put('wide stage cloth',SX,Kb+.07,0); put('stage',SX,SY); put('neon sign: LIVE',SX+1.0,Kb+.16,1);
      const PX=SX-1.4, PY=Kb+2.686; put('drum kit on a stage',SX+.35,Kb+1.25,0);   // octopus-only stage (owner, 30 Oct 2026); no piano
      // a wooden staircase up to the street, back-west corner
      put('staircase',L+1.0,Kb+.15);
      // the pool table, mid-room; darts on the east wall with a throw lane in front
      put('pool table',m-.3,mid-1.2);
      put('dartboard',R-.03,mid+4.2,2);
      // one table by the door
      put('red rug',R-1.9,F-2.1,1); put('bar table',R-1.6,F-2.1); put('red leather armchair',R-.7,F-2.1,2); put('red leather armchair',R-2.5,F-2.1);
      // posters (made in-house), a palm, the way out
      put('poster: moon shrine',R-.02,Kb+4.4,2); put('poster: ghost sale',R-.02,mid-1.2,2); put('poster: koi night',R-.02,F-5.2,2); put('poster: night painting',L+.02,mid+1.2,0);
      put('potted palm',L+.8,F-.8); put('exit sign, lit',m,F-.05,3);
      put('ceiling fan',m,Kb+5.2); put('ceiling fan',m,mid+.4); put('ceiling fan',m,F-3.6);
      // warm wall sconces down both long walls
      for(const [i,y] of [[0,Kb+3.6],[1,Kb+8],[2,mid-2],[3,mid+2.5],[4,F-6],[5,F-2.6]]){ const x=i&1?R:L, n=i&1?[-1,0]:[1,0]; SK.bar.theatreSconce(x,y,n); LAMPS.push({x:x+n[0]*.35,y,z:68,r:3.4,c:[1,.62,.34],room:true,own:true,day:true,sconce:1}); }
      // super dark: keep the candles, the pool light, the stair's street glow and dim sconces; the rest off
      for(const l of LAMPS.slice(l0)){ const k=l.prop&&(l.prop.kind||l.prop.name)||''; if(k==='bar table'||k==='pool table'||k==='staircase')continue; if(l.sconce){ l.c=l.c.map(v=>v*.6); continue; } if(k==='exit sign, lit'){ l.c=l.c.map(v=>v*.45); continue; } l.off=1; }
      LAMPS.push({x:SX,y:SY,z:92,r:5,c:[1.2,.9,.55],room:true,own:true,day:true});   // a dim spot on the stage
      LAMPS.push({own:1,room:1,day:true,x:stools[1].x,y:stools[1].y,z:38,r:1.4,c:[.9,.36,.1]});
      STORE.turnIn(TB,n0,l0); STORE.bar={B,at:(x,y)=>{ const q=TB.pt(x,y); return {x:X(q[0]),z:Z(q[1])}; },hd:TB.hd(0),stage:{x:SX,y:SY,z:14+LAY.h('bar')*TILE/ZU/BLDK},piano:{x:PX,y:PY,keys:PY-1.736},drums:{x:SX+.35,y:Kb+1.25},gtr:{x:SX-.35,y:Kb+2.35},singer:{x:SX+.8,y:Kb+2.4},stools}; if(STORE.furnish&&STORE.furnish.bar)STORE.furnish.bar(STORE.bar); },{noOut:1,noWins:1});
    const fr=MSHOP.front(FRONT,L.x1-L.x0);
    if(!WP.bar.pf)BLOCKS.make({...LW,z0:0,z1:H,kind:'Rbar',turn:TP,roof:(x,y)=>sh([48,46,50],.9+.14*hs(Math.floor(x*4),Math.floor(y*4),73)),
      paint:(sd,u,z,f)=>{ if(sd==='f'){ const q=fr(u-L.x0,z,f,0); if(q)return q; } if(z>H-14)return sh(FRONT.trim,f*(z>H-4?1.1:.85)); return FRONT.wall(u,z,f); }});
    sol(LW.x0,LW.y0,LW.x1,LW.y1,H); STORE.streetDoor.bar={door:TP.pt(cxL,L.y1+.35),out:[...TP.pt(cxL,L.y1+1.4),TP.hd(0)]};
    STORE.bound.x1=Math.max(STORE.bound.x1,X(BL.x1+20)); STORE.bound.z0=Math.min(STORE.bound.z0,Z(BL.y0-6)); STORE.bound.z1=Math.max(STORE.bound.z1,Z(BL.y1+6)); });
});
