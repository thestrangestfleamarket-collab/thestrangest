// THE STREET'S TOONS: the tomato (the cat in the raincoat, the TV cat, the frog on his scooter and the shark are archived, owner 5 Nov 2026).
import {PARTSNPC} from './080-npc-parts.js';
import {STALL} from './081-stalls.js';
import {RIGNPC} from './083-npc-rig.js';
const TOONS={};
{ const {shape,limb,sph,cyl,box,torus,blob,shell}=PARTSNPC.T;
  const part=(name,rank,bone,of)=>({name,rank,bone,of}), BLACK=[0,0,0], WHITE=[.96,.95,.9];
  const make=(def,o,i)=>RIGNPC.make(def,Object.assign({eye:0,eyeC:'0.,0.,0.',stride:6},PARTSNPC.street(o.at,-70),o,RIGNPC.hold(i)));
  // a jointed arm: the upper arm on arm<s>, the forearm and glove on fore<s> (at the elbow), so the elbow bends. the def must carry a fore<s> bone, child of arm<s>, at elbow().
  const elbow=(sh,wr)=>[(sh[0]+wr[0])/2,(sh[1]+wr[1])/2+ (wr[1]-sh[1])*.04,(sh[2]+wr[2])/2], foreBone=(s,sh,wr)=>['fore'+s,'arm'+s,elbow(sh,wr)];
  const arm=(s,sx,sh,wr,col,glove,cuff,r=.045)=>{ const el=elbow(sh,wr);
    return [ part('arm '+s,1,'arm'+s,[ limb(sh,el,r,r*.96,col,6) ]),
    part('fore '+s,1,'fore'+s,[ limb(el,wr,r*.96,r*.9,col,6) ]),
    part('glove '+s,2,'fore'+s,[ shape(blob(.058,.068,.05,8,6),glove,[wr[0]+sx*.005,wr[1]-.06,wr[2]+.01]), shape(blob(.02,.035,.02,6,4),glove,[wr[0]-sx*.025,wr[1]-.04,wr[2]+.05],null,[0,0,sx*30]),
      shape(cyl(.05,.05,.03,8),cuff,[wr[0],wr[1]+.01,wr[2]]) ]) ]; };
  const flatEye=(x,y,z,r,col,rot=[90,0,0])=>shape(cyl(r,r,.02,8),col,[x,y,z],null,rot);

  { const RED=[.86,.16,.1], LEAF=[.36,.6,.24], LEAF2=[.27,.48,.18], STEM=[.42,.62,.3], YEL=[.96,.82,.36], GLOVE=[.88,.87,.82];
    const HY=1.2, HR=.32, TOP=HY+HR*.9;
    const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.5,0]],['head','hips',[0,.9,0]],['leaves','head',[0,TOP-.03,0]],['stem','leaves',[0,TOP,0]],['armL','hips',[-.18,.8,0]],['armR','hips',[.18,.8,0]],foreBone('L',[-.15,.8,0],[-.27,.52,.07]),foreBone('R',[.15,.8,0],[.27,.52,.07]),['held','armR',[.27,.52,.07]],['broom','hips',[0,.64,.3]]],
      parts:[ part('eyes',0,'head',[-1,1].map(sx=>flatEye(sx*.1,HY+.06,HR-.005,.035,BLACK))),
        part('head',2,'head',[ shape(sph(HR,10,7),RED,[0,HY,0],[1,.9,1]) ]),
        part('eye whites',3,'head',[-1,1].map(sx=>flatEye(sx*.1,HY+.06,HR-.02,.075,WHITE))),
        part('leaves',3,'leaves',Array.from({length:5},(_,i)=>{ const a=i/5*Math.PI*2+.3; return shape(blob(.13,.018,.06,6,4),i%2?LEAF2:LEAF,[Math.cos(a)*.13,TOP-.03,-Math.sin(a)*.13],null,[0,a*180/Math.PI,-12]); })),
        part('stem',3,'stem',[ shape(cyl(.025,.03,.14,5),STEM,[0,TOP+.05,0]) ]),
        part('robe',0,'hips',[ shape(cyl(.15,.3,.86,10),YEL,[0,.43,0]) ]),
        ...arm('L',-1,[-.15,.8,0],[-.27,.52,.07],WHITE,WHITE,GLOVE), ...arm('R',1,[.15,.8,0],[.27,.52,.07],WHITE,WHITE,GLOVE),
        part('held',0,'held',[ shape(box(.2,.08,.14),[.6,.44,.26],[.27,.43,.16]), ...[[-.05,-.03],[.04,-.02],[0,.03],[-.06,.04],[.06,.04]].map(([x,z],k)=>shape(sph(.042,6,4),k%2?[.84,.2,.12]:[.9,.3,.14],[.27+x,.49,.16+z])) ]),
        part('broom',0,'broom',[ limb([0,.8,.25],[0,.1,.62],.016,.016,[.55,.4,.22],5), shape(box(.24,.14,.05),[.8,.66,.34],[0,.06,.65],null,[-22,0,0]), shape(box(.19,.03,.055),[.6,.22,.16],[0,.14,.63],null,[-22,0,0]) ]) ],
      springs:{ head:{f:-.03,s:.03,k:90,c:9,lim:.15}, leaves:{f:-.12,s:.12,k:55,c:5,lim:.4}, stem:{f:-.2,s:.2,k:40,c:4,lim:.6} },
      pose:(c)=>{ RIGNPC.walk(c,{legs:[],arm:.5,bob:.03,rock:.05}); c.B.head.rotation.y=c.look; c.B.head.rotation.z=Math.sin(c.st.ph*2)*.03*c.mv; STALL.pose(c,TA); } }, TA={put:.75,reach:[.3,1.1,1.9,2.4],lean:[.35,.12,0,-.05],sw:[-.75,-.95,-.75,.95]};
    TOONS.tomato=make(def,{key:'tomato',name:'THE TOMATO',metres:2.3, radius:.32,speed:.45,stride:6.5,at:60},0); }

  window.TOONSDBG=()=>Object.fromEntries(Object.entries(TOONS).map(([k,N])=>[k,{key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),tris:N.tris,vis:N.g.visible}])); }
export {TOONS};
