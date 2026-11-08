// THE MUSHROOM FOLK: MUSH builds the mushroom characters in parts.
import {SHARED, THREE} from './003-shx.js';
import {PARK} from './003b-systems.js';
import {MODS} from './006-map-pre.js';
import {HOMES} from './076-npc-map.js';
import {PARTSNPC} from './080-npc-parts.js';
import {STALL} from './081-stalls.js';
import {RIGNPC} from './083-npc-rig.js';
const MUSH={};
{ const {shape,limb,sph,cyl,box,torus,blob,noise}=PARTSNPC.T;
  const CREAM=[.93,.87,.7], BONE=[.95,.95,.93], HAT=[.72,.47,.2], HAT2=[.66,.42,.17], CAP=[.74,.5,.22], RUST=[.74,.42,.14], OLIVE=[.47,.43,.18], ROPE=[.58,.42,.2], BAG=[.7,.53,.3], TRAY=[.68,.44,.19], BLACK=[0,0,0], WOOD=[.55,.4,.22], STRAW=[.8,.66,.34];
  const HAIR=[[.8,.64,.36],[.74,.58,.32],[.86,.7,.42]];
  const part=(name,rank,bone,of)=>({name,rank,bone,of});
  const mush=(stems,caps,x,y,z,h,r,cap,lean=[0,0,0])=>{ const st=cyl(r*.3,r*.38,h,6); st.translate(0,h/2,0); const cp=sph(r,8,5); cp.scale(1,.62,1); cp.translate(0,h,0);
    stems.push(shape(st,CREAM,[x,y,z],null,lean)); caps.push(shape(cp,cap,[x,y,z],null,lean)); };
  const mottle=(x,y,z)=>{ const v=noise(x,y,z); return v>.6?OLIVE:v>.5?[.62,.42,.16]:RUST; };
  const hatStems=[], hatCaps=[], trayStems=[], trayCaps=[], held=[];
  for(let i=0;i<9;i++){ const a=i/9*Math.PI*2, r=.155, big=i%2===0; mush(hatStems,hatCaps,Math.sin(a)*r,1.605,Math.cos(a)*r,big?.09:.065,big?.045:.035,big?CAP:CREAM,[Math.cos(a)*14,0,-Math.sin(a)*14]); }
  for(let i=0;i<4;i++){ const a=(i+.5)/4*Math.PI*2, r=.095; mush(hatStems,hatCaps,Math.sin(a)*r,1.715,Math.cos(a)*r,.07,.038,i%2?CAP:CREAM,[Math.cos(a)*8,0,-Math.sin(a)*8]); }
  mush(hatStems,hatCaps,0,1.715,0,.14,.11,CAP);
  { let seed=3; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
    for(let i=0;i<13;i++){ const a=rnd()*Math.PI*2, r=.05+rnd()*.15, big=rnd()<.5; mush(trayStems,trayCaps,Math.sin(a)*r,1.0,.33+Math.cos(a)*r,big?.1:.07,big?.045:.032,rnd()<.45?CAP:CREAM,[(rnd()-.5)*20,0,(rnd()-.5)*20]); } }
  for(const [x,z,c] of [[.1,.3,CAP],[.15,.27,[.77,.17,.12]],[.12,.33,CREAM]])mush(held,held,x,.9,z,.07,.04,c);
  const SA=[-104,-84,-64,-46,-28,-10,10,28,46,64,84,104], HB=[], HP=[], HS={}, ST=[];
  SA.forEach((d,i)=>{ const a=d*Math.PI/180, sx=Math.sin(a), cz=-Math.cos(a), side=Math.abs(d)/180, y3=.66+.2*side, col=HAIR[i%3];
    const p=[[sx*.165,1.5,cz*.165],[sx*.22,1.27,cz*.22],[sx*.25,1.02+.05*side,cz*.25],[sx*.255,y3,cz*.25]], nm=['a','b','c'].map(k=>'h'+i+k);
    nm.forEach((n,k)=>{ HB.push([n,k?nm[k-1]:'head',p[k]]); HP.push(part('hair '+n,2,n,[ limb(p[k],p[k+1],[.028,.024,.018][k],[.024,.018,.01][k],col,5) ]));
      HS[n]={f:[.06,.1,.14][k],s:-[.06,.1,.14][k],k:[46,32,24][k],c:[4.5,3.2,2.4][k],lim:[.45,.6,.75][k]}; });
    ST.push([nm,p[0][0],p[0][2]]); });
  const scalp=new THREE.SphereGeometry(.168,10,6,Math.PI,Math.PI,0,Math.PI*.62);
  const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.6,0]],['head','hips',[0,1.26,0]],['hat','head',[0,1.56,0]],['armL','hips',[-.17,1.17,.02]],['armR','hips',[.17,1.17,.02]],
      ['held','armR',[.12,.96,.25]],['tray','hips',[0,.99,.33]],['broom','hips',[0,1.0,.3]],...HB],
    parts:[
      part('face',0,'head',[ ...[-1,1].map(sx=>shape(sph(.052,8,6),BLACK,[sx*.06,1.405,.118],[1,1.12,.7])),
        ...[-1,1].map(sx=>shape(box(.022,.04,.03),BLACK,[sx*.013,1.335,.142],null,[0,0,sx*-20])), shape(box(.1,.03,.03),BLACK,[0,1.285,.122]),
        ...[-2,-1,0,1,2].map(i=>shape(box(.016,.026,.02),BONE,[i*.02,1.29,.134])), ...[-1,1].map(sx=>shape(box(.03,.05,.02),[.8,.8,.78],[sx*.11,1.33,.105],null,[0,sx*30,0])) ]),
      part('skull',2,'head',[ shape(sph(.155,10,7),BONE,[0,1.38,0],[1,1.1,1]), shape(blob(.085,.055,.085,10,6),BONE,[0,1.27,.03]) ]),
      part('scalp',3,'head',[ shape(scalp,HAIR[0],[0,1.4,-.005],[1,1.1,1]) ]),
      ...HP,
      part('hat',2,'hat',[ shape(cyl(.21,.23,.08,14),HAT,[0,1.565,0]), shape(cyl(.15,.17,.11,12),HAT2,[0,1.66,0]) ]),
      part('hat mushrooms',4,'hat',hatCaps), part('hat stems',3,'hat',hatStems),
      part('robe',0,'hips',[ shape(cyl(.17,.31,1.2,12),mottle,[0,.62,0]), shape(sph(.185,10,5),mottle,[0,1.2,0],[1,.55,1]), shape(cyl(.085,.1,.07,8),RUST,[0,1.255,0]) ]),
      ...[['L',-1],['R',1]].flatMap(([s,sx])=>[ part('sleeve '+s,1,'arm'+s,[ limb([sx*.17,1.17,.02],[sx*.13,.98,.22],.055,.085,mottle) ]), part('hand '+s,1,'arm'+s,[ shape(sph(.05,8,6),CREAM,[sx*.12,.96,.25],[1.1,.8,1.3]) ]) ]),
      part('tray',2,'tray',[ shape(cyl(.25,.23,.03,16),TRAY,[0,.99,.33]), shape(torus(.245,.016,6,16),TRAY,[0,1.005,.33],null,[90,0,0]) ]),
      part('tray mushrooms',4,'tray',trayCaps), part('tray stems',3,'tray',trayStems),
      part('held',0,'held',held),
      part('broom',0,'broom',[ limb([0,1.14,.27],[0,.12,.6],.018,.018,WOOD,5), shape(box(.26,.16,.05),STRAW,[0,.07,.63],null,[-18,0,0]), shape(box(.2,.03,.055),[.6,.22,.16],[0,.16,.61],null,[-18,0,0]) ]),
      part('strap',2,'hips',[ limb([.12,1.24,.1],[-.22,.72,.13],.02,.02,ROPE,6), limb([.12,1.24,-.06],[-.24,.72,-.06],.02,.02,ROPE,6),
        ...Array.from({length:7},(_,i)=>{ const u=(i+.5)/7; return shape(sph(.024,6,4),[.52,.37,.17],[.12-.34*u,1.24-.52*u,.1+.03*u]); }) ]),
      part('bag',1,'hips',[ shape(blob(.08,.12,.05,10,8),BAG,[-.26,.62,.04],null,[0,0,-6]), shape(blob(.085,.03,.055,10,6),[.62,.46,.25],[-.26,.72,.04],null,[0,0,-6]) ]) ],
    springs:Object.assign({hat:{f:-.02,s:.02,k:90,c:9,lim:.08}},HS),
    pose:(c)=>{ const B=c.B, J=c.job||{}; RIGNPC.walk(c,{legs:[],arm:J.tray===0&&!J.broom?.3:0,bob:.02,rock:.03}); B.head.rotation.y=c.look; STALL.pose(c,A);
      const dt=c.dt||.1, yaw=c.st.h+c.look, w=Math.max(0,(PARK.windK?PARK.windK.value:0)-.6), gu=w*(.5+.5*Math.sin(c.t*.8))*(.5+.5*Math.sin(c.t*.31+1)); if(c.pw==null)c.pw=yaw;
      const om=(((yaw-c.pw+Math.PI*3)%(Math.PI*2))-Math.PI)/dt, dw=om-(c.pom||0); c.pw=yaw; c.pom=om; if(c.sheet)return;
      for(const [nm,px,pz] of ST)nm.forEach((n,k)=>{ const g=[1,1.4,1.8][k]*3.5; c.kick(n,'z',-dw*pz*g+gu*dt*(4+3*Math.sin(c.t*2.3+px*40))); c.kick(n,'x',-dw*px*g-gu*dt*2*(1+Math.sin(c.t*1.7+pz*30))); }); } };
  const A={drop:.6,put:.55,reach:[-.2,.3,.85,1.25],lean:[.3,.16,.04,0],sw:[.1,0,.1,0]};
  const BOOTH=()=>{ const P=PARK, X=x=>SHARED.BOD.XS(x+(P.ox||0)), Z=y=>SHARED.BOD.ZS(y+(P.oy||0)), A=STALL.at('mush');
    MUSH.booth=STALL.build({X,Z,x0:A.x0,x1:A.x1,y:P.y0,veg:false,seed:7,gate:A.gate,name:A.name}); };
  const N=RIGNPC.make(def,Object.assign({key:'mushroom',name:'THE MUSHROOM SELLER',eye:0,eyeC:'0.,0.,0.',metres:3.16, radius:.3,speed:.4,stride:6},PARTSNPC.street(72,-70),{roam:false}));
  { const wait=()=>{ if(!MODS.park)return setTimeout(wait,500); BOOTH(); if(!N.sheet&&!HOMES.keeper(N))STALL.work(N,MUSH.booth,{tray:1,jobs:['look'],wait:()=>2+Math.random()*3}); }; wait(); }
  MUSH.N=N; window.MUSHDBG=()=>({booth:!!MUSH.booth,life:!!N.life,fire:!!PARK.fire,key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),to:!!N.st.to,vis:N.g.visible,tris:N.tris,job:N.rig.job&&N.rig.job.k}); }
export {MUSH};
