// THE STREET'S TOONS: the tomato, the cat in the raincoat, the TV cat, the frog on his scooter, the shark, the manatee, the rain fish, NUMBER 80, the ember knight, MR. BLOCKS and the bear in the coat.
const TOONS={};
{ const {shape,limb,sph,cyl,box,torus,blob,shell}=PARTSNPC.T;
  const part=(name,rank,bone,of)=>({name,rank,bone,of}), BLACK=[0,0,0], WHITE=[.96,.95,.9];
  const make=(def,o,i)=>RIGNPC.make(def,Object.assign({eye:0,eyeC:'0.,0.,0.',stride:6},PARTSNPC.street(o.at,-70),o,RIGNPC.hold(i)));
  const arm=(s,sx,sh,wr,col,glove,cuff,r=.045)=>[ part('arm '+s,1,'arm'+s,[ limb(sh,wr,r,r*.9,col,6) ]),
    part('glove '+s,2,'arm'+s,[ shape(blob(.058,.068,.05,8,6),glove,[wr[0]+sx*.005,wr[1]-.06,wr[2]+.01]), shape(blob(.02,.035,.02,6,4),glove,[wr[0]-sx*.025,wr[1]-.04,wr[2]+.05],null,[0,0,sx*30]),
      shape(cyl(.05,.05,.03,8),cuff,[wr[0],wr[1]+.01,wr[2]]) ]) ];
  const flatEye=(x,y,z,r,col,rot=[90,0,0])=>shape(cyl(r,r,.02,8),col,[x,y,z],null,rot);

  { const RED=[.86,.16,.1], LEAF=[.36,.6,.24], LEAF2=[.27,.48,.18], STEM=[.42,.62,.3], YEL=[.96,.82,.36], GLOVE=[.88,.87,.82];
    const HY=1.2, HR=.32, TOP=HY+HR*.9;
    const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.5,0]],['head','hips',[0,.9,0]],['leaves','head',[0,TOP-.03,0]],['stem','leaves',[0,TOP,0]],['armL','hips',[-.18,.8,0]],['armR','hips',[.18,.8,0]],['held','armR',[.27,.52,.07]],['broom','hips',[0,.64,.3]]],
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
    TOONS.tomato=make(def,{key:'tomato',name:'THE TOMATO',metres:1.84, radius:.32,speed:.45,stride:6.5,at:60},0); }

  { const YEL=[.95,.78,.16], YEL2=[.82,.64,.1], FUR=[.92,.86,.68], FUR2=[.8,.72,.52], PINK=[.9,.6,.55], BOOT=[.12,.11,.1], PAPER=[.88,.86,.8], INK=[.95,.92,.82], LID=[.15,.15,.17], HEAD=[.75,.2,.18], INKP=[.45,.45,.45];
    const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.42,0]],['head','hips',[0,.7,0]],['earL','head',[-.14,.98,-.02]],['earR','head',[.14,.98,-.02]],
        ['armL','hips',[-.17,.66,0]],['armR','hips',[.17,.66,0]],['legL','hips',[-.08,.38,0]],['legR','hips',[.08,.38,0]],
        ['paper','root',[0,.6,.22]],['page','paper',[0,.6,.22]],['jar','root',[.22,0,.1]]],
      parts:[ part('eyes',0,'head',[-1,1].map(sx=>shape(cyl(.03,.03,.02,8),BLACK,[sx*.065,.86,.2],[1,1,.5],[90,0,0]))),
        part('face',2,'head',[ shape(sph(.14,10,7),FUR,[0,.85,.1],[1,.9,.8]) ]),
        part('nose',3,'head',[ shape(sph(.02,4,3),PINK,[0,.81,.215]) ]),
        part('hood',4,'head',[ shape(sph(.19,10,7),YEL,[0,.89,-.06]), shape(torus(.135,.03,4,12),YEL,[0,.86,.1],[1,1.05,1]), shape(cyl(.002,.05,.14,4),YEL2,[0,1.06,0],[2.6,1,1],[-30,0,0]) ]),
        ...[['L',-1],['R',1]].map(([s,sx])=>part('ear '+s,3,'ear'+s,[ shape(cyl(.002,.065,.14,4),FUR,[sx*.17,1.02,-.03],[1,1,.45],[0,0,sx*-35]) ])),
        part('coat',1,'hips',[ shape(cyl(.15,.24,.38,10),YEL,[0,.5,0]) ]),
        ...[['L',-1],['R',1]].flatMap(([s,sx])=>[ ...arm(s,sx,[sx*.16,.66,0],[sx*.2,.44,.04],YEL,FUR,YEL2,.05),
          part('leg '+s,0,'leg'+s,[ shape(cyl(.065,.065,.3,8),YEL,[sx*.08,.23,0]) ]), part('boot '+s,1,'leg'+s,[ shape(blob(.07,.06,.1,6,4),BOOT,[sx*.08,.05,.04]) ]) ]),
        part('newspaper',2,'paper',[ shape(box(.22,.3,.006),PAPER,[-.11,.6,.22]), shape(box(.2,.04,.008),HEAD,[-.11,.72,.22]), shape(box(.09,.08,.008),INKP,[-.11-.045,.645,.22]), ...[.66,.63,.6,.55,.52,.49,.46].map((y,k)=>shape(box(k<3?.08:.18,.008,.008),INKP,[-.11+(k<3?.05:0),y,.22])) ]),
        part('page',2,'page',[ shape(box(.22,.3,.006),PAPER,[.11,.6,.22]), shape(box(.2,.04,.008),HEAD,[.11,.72,.22]), shape(box(.09,.08,.008),INKP,[.11-.045,.645,.22]), ...[.66,.63,.6,.55,.52,.49,.46].map((y,k)=>shape(box(k<3?.08:.18,.008,.008),INKP,[.11+(k<3?.05:0),y,.22])) ]),
        part('ink jar',1,'jar',[ shape(cyl(.04,.04,.09,8),INK,[.22,.045,.1]), shape(cyl(.037,.037,.025,8),LID,[.22,.1,.1]) ]) ],
      springs:{ earL:{f:-.15,s:.12,k:70,c:6,lim:.4}, earR:{f:-.15,s:.12,k:70,c:6,lim:.4}, head:{f:-.04,s:.04,k:90,c:9,lim:.12}, page:{y:.3,k:30,c:3,lim:.5} },
      pose:(c,dt)=>{ const B=c.B, V=c.v||(c.v=new THREE.Vector3());
        c.read=Math.max(0,Math.min(1,(c.read||0)+(c.still>.4&&!c.sheet&&!c.busy?dt:-dt)*2.5)); const r=c.read*c.read*(3-2*c.read);
        RIGNPC.walk(c,{arm:.4,leg:.55,bob:.02,rock:.05}); B.head.rotation.y=c.look*(1-r); B.head.rotation.x=r*.25;
        if(!c.sheet){ B.armL.rotation.x=B.armL.rotation.x*(1-r)-1.05*r; B.armR.rotation.x=B.armR.rotation.x*(1-r)-1.05*r; B.armL.rotation.z=-.2*(1-r)+.32*r; B.armR.rotation.z=.08*(1-r)-.32*r; }
        const tuck=[-.23,.52,.02], open=[0,.5,.3]; B.paper.position.set(tuck[0]+(open[0]-tuck[0])*r,tuck[1]+(open[1]-tuck[1])*r,tuck[2]+(open[2]-tuck[2])*r);
        B.paper.rotation.set(-.6*r,(Math.PI/2)*(1-r)+.18*r,0); B.page.rotation.y=-Math.PI*(1-r)-.36*r;
        if(c.sheet){ B.paper.rotation.set(0,.18,0); B.page.rotation.y=-.36; B.paper.position.set(0,.6,.27); }
        if(r>.9&&(c.turnT=(c.turnT??5)-dt)<=0){ c.turnT=4+Math.random()*5; c.kick('page','w',-3); }
        c.at('armR',[.2,.38,.05],V); V.y-=.11; const g=[.25,0,.16]; B.jar.position.set(V.x+(g[0]-V.x)*r,V.y+(g[1]-V.y)*r,V.z+(g[2]-V.z)*r);
        if(c.extra)c.extra(c,dt,r); } };
    TOONS.cat=make(def,{key:'raincat',name:'THE CAT IN THE RAINCOAT',metres:1.1,radius:.25,speed:.32,stride:8,at:66},1); }

  { const ORA=[.84,.47,.32], ORA2=[.7,.36,.24], FUR=[.74,.53,.3], FUR2=[.62,.42,.22], CHROME=[.82,.82,.8], DARK=[.1,.1,.11], SCREEN=[.2,.24,.27];
    const CAB=[[-.25,.3,-.02],[-.34,.14,-.08],[-.4,.03,-.24],[-.42,.02,-.46],[-.44,.02,-.7]];
    const def={ bones:[['root',null,[0,0,0]],['body','root',[0,.2,0]],['eyes','body',[0,.37,.18]],['legFL','root',[-.15,.22,.1]],['legFR','root',[.15,.22,.1]],['legBL','root',[-.15,.22,-.1]],['legBR','root',[.15,.22,-.1]],
        ['cab0','body',CAB[0]],['cab1','cab0',CAB[1]],['cab2','cab1',CAB[2]],['cab3','cab2',CAB[3]]],
      parts:[ part('screen',0,'body',[ shape(box(.26,.2,.01),SCREEN,[.05,.37,.172]) ]),
        part('box',2,'body',[ shape(box(.5,.34,.34),ORA,[0,.38,0]), shape(box(.3,.24,.02),DARK,[.05,.37,.166]) ]),
        part('face',3,'eyes',[-1,1].map(sx=>flatEye(.05+sx*.06,.39,.18,.03,WHITE))),
        part('pupils',4,'eyes',[-1,1].map(sx=>flatEye(.05+sx*.06,.388,.186,.015,BLACK))),
        part('moustache',3,'body',[-1,1].map(sx=>shape(box(.04,.01,.006),[.75,.18,.15],[.05+sx*.02,.34,.18],null,[0,0,sx*-20]))),
        part('ears',3,'body',[-1,1].flatMap(sx=>[shape(cyl(.002,.13,.2,3),ORA,[sx*.15,.64,.06],[1,1,.3]), shape(cyl(.002,.07,.11,3),ORA2,[sx*.15,.62,.075],[1,1,.3])])),
        part('handle',3,'body',[ limb([-.16,.55,-.04],[-.14,.6,-.04],.012,.012,ORA2,5), limb([-.14,.6,-.04],[-.02,.6,-.04],.012,.012,ORA2,5), limb([-.02,.6,-.04],[0,.55,-.04],.012,.012,ORA2,5) ]),
        part('knobs',3,'body',[ flatEye(-.15,.24,.175,.026,CHROME), shape(cyl(.02,.02,.04,6),DARK,[.13,.24,.18],null,[90,0,0]), shape(cyl(.02,.02,.04,6),DARK,[.18,.24,.18],null,[90,0,0]) ]),
        ...[['FL',-1,1],['FR',1,1],['BL',-1,-1],['BR',1,-1]].map(([s,sx,sz])=>part('leg '+s,1,'leg'+s,[ shape(blob(.075,.11,.08,6,4),FUR,[sx*.15,.12,sz*.1]), shape(blob(.075,.04,.09,6,4),FUR2,[sx*.15,.03,sz*.1+.02]) ])),
        ...[0,1,2,3].map(i=>part('cable '+i,2,'cab'+i,[ limb(CAB[i],CAB[i+1],.01,.01,DARK,4) ])) ],
      springs:{ body:{f:-.06,s:.05,k:110,c:10,lim:.12}, cab1:{y:.25,k:25,c:4,lim:.5}, cab2:{y:.35,k:20,c:3.5,lim:.6}, cab3:{y:.45,k:16,c:3,lim:.7} },
      pose:(c,dt)=>{ const B=c.B, ph=c.st.ph, m=c.mv, sw=Math.sin(ph)*m;
        if(c.sheet){ B.legFL.rotation.set(.3,0,-.3); B.legFR.rotation.set(.3,0,.3); B.legBL.rotation.set(-.3,0,-.3); B.legBR.rotation.set(-.3,0,.3); }
        else{ B.legFL.rotation.x=B.legBR.rotation.x=-sw*.6; B.legFR.rotation.x=B.legBL.rotation.x=sw*.6; }
        B.body.position.y+=Math.abs(Math.cos(ph))*.015*m; B.body.rotation.z=Math.sin(ph*2)*.02*m; B.body.rotation.y=c.look*.4;
        B.cab1.rotation.y=Math.sin(ph)*.1*m; B.cab2.rotation.y=Math.sin(ph-1)*.12*m;
        if((c.blink=(c.blink??3)-dt)<0){ B.eyes.scale.y=.1; if(c.blink<-.12)c.blink=2+Math.random()*4; } } };
    TOONS.tv=make(def,{key:'tvcat',name:'THE TV CAT',metres:.62,radius:.32,speed:.5,stride:10,eyeC:'.2,.27,.3',at:76},2); }

  { const GRN=[.45,.52,.3], HEL=[.92,.9,.83], ORA=[.85,.5,.22], ORA2=[.68,.37,.15], CREAM=[.9,.88,.8], CHROME=[.85,.85,.85], TIRE=[.12,.12,.12], DECK=[.15,.15,.16], CARD=[.86,.8,.66];
    const wheel=(r,w,at)=>[ shape(torus(r*.72,r*.28,4,10),TIRE,at,[1,1,w/r],[0,90,0]), shape(cyl(r*.42,r*.42,w*.9,8),CHROME,at,null,[0,0,90]) ];
    const def={ bones:[['root',null,[0,0,0]],['scooter','root',[0,.15,0]],['fork','scooter',[0,.56,.3]],['wheelF','fork',[0,.17,.38]],['wheelR','scooter',[0,.13,-.24]],['box','scooter',[0,.36,-.38]],
        ['frog','scooter',[0,.62,-.02]],['head','frog',[0,.88,0]],['armL','frog',[-.16,.82,-.02]],['armR','frog',[.16,.82,-.02]],['cape1','frog',[0,.87,-.12]],['cape2','cape1',[0,.64,-.24]]],
      parts:[ part('eyes',0,'head',[-1,1].map(sx=>shape(sph(.055,6,4),BLACK,[sx*.1,1.0,.13]))),
        part('head',2,'head',[ shape(sph(.18,10,7),GRN,[0,.95,.07],[1.05,.72,.95]) ]),
        part('helmet',3,'head',[ shape(new THREE.SphereGeometry(.2,10,5,0,Math.PI*2,0,Math.PI/2),HEL,[0,.99,0],[1,1.05,1.05]), shape(cyl(.205,.205,.035,10),[.82,.8,.72],[0,1.0,0],[1,1,1.05]),
          shape(new THREE.TorusGeometry(.205,.012,4,10,Math.PI),[.82,.8,.72],[0,.99,0],[1,1.05,1.05],[0,90,0]),
          ...[-1,1].flatMap(sx=>[ shape(cyl(.06,.06,.07,8),HEL,[sx*.21,.98,.02],null,[0,0,90]), shape(cyl(.035,.035,.075,6),[.8,.45,.2],[sx*.215,.98,.02],null,[0,0,90]) ]) ]),
        part('torso',1,'frog',[ shape(sph(.15,8,6),ORA2,[0,.74,-.02]) ]),
        part('scarf',2,'frog',[ shape(torus(.13,.04,4,10),ORA,[0,.86,0],null,[90,0,0]) ]),
        ...arm('L',-1,[-.16,.82,-.02],[-.2,.72,.2],ORA,GRN,ORA2,.048), ...arm('R',1,[.16,.82,-.02],[.2,.72,.2],ORA,GRN,ORA2,.048),
        part('cape',3,'cape1',[ shape(box(.34,.26,.015),ORA,[0,.75,-.18],null,[-25,0,0]) ]), part('cape tail',3,'cape2',[ shape(box(.36,.22,.015),ORA2,[0,.55,-.28],null,[-12,0,0]) ]),
        part('scooter',1,'scooter',[ shape(sph(.25,10,7),CREAM,[0,.44,.04],[.88,.96,1.2]), shape(box(.42,.04,.56),DECK,[0,.19,-.12]), shape(box(.36,.03,.08),DECK,[0,.32,-.4]),
          flatEye(0,.52,.31,.075,CHROME), flatEye(0,.52,.322,.055,[.95,.93,.75]),
          limb([-.22,.66,.24],[.22,.66,.24],.012,.012,CHROME,4), ...[-1,1].map(sx=>limb([sx*.17,.66,.24],[sx*.24,.66,.24],.02,.02,TIRE,6)) ]),
        part('fork',2,'fork',[ ...[-1,1].map(sx=>limb([sx*.04,.52,.32],[sx*.04,.17,.38],.012,.012,CHROME,4)), shape(shell(.13,.13,.08,8,-1.8,3.6),CREAM,[0,.25,.38],null,[0,0,90]) ]),
        part('front wheel',1,'wheelF',wheel(.16,.07,[0,.17,.38])),
        part('rear wheels',1,'wheelR',[ ...[-1,1].flatMap(sx=>wheel(.13,.06,[sx*.21,.13,-.24])), limb([-.21,.13,-.24],[.21,.13,-.24],.012,.012,CHROME,4) ]),
        part('box',2,'box',[ shape(box(.32,.26,.24),CARD,[0,.47,-.4]) ]) ],
      springs:{ head:{f:-.05,s:.06,k:80,c:8,lim:.2}, frog:{f:-.05,s:.04,k:70,c:7,lim:.15}, cape1:{f:.25,s:-.15,k:30,c:4,lim:.7}, cape2:{f:.3,s:-.2,k:24,c:3.5,lim:.8}, box:{f:.06,s:-.05,k:120,c:8,lim:.1} },
      pose:(c,dt,moving)=>{ const B=c.B, m=c.mv;
        B.armL.rotation.x=B.armR.rotation.x=-.05; if(c.sheet){ B.armL.rotation.z=-1.1; B.armR.rotation.z=1.1; }
        B.scooter.rotation.z=Math.max(-.25,Math.min(.25,-c.turn*c.spd*.25));
        B.wheelF.rotation.x=c.dist/(.16*1.12); B.wheelR.rotation.x=c.dist/(.13*1.12);
        c.fy=c.fy||0; c.fv=c.fv||0; if(moving&&(c.bump=(c.bump??.5)-dt)<=0){ c.bump=.3+Math.random()*.7; c.fv-=.25+Math.random()*.25; c.kick('box','x',1.5); c.kick('frog','x',.6); }
        c.fv+=(-300*c.fy-14*c.fv)*dt; c.fy+=c.fv*dt; if(!moving&&Math.abs(c.fy)<.0005&&Math.abs(c.fv)<.005)c.fy=c.fv=0; B.fork.position.y+=c.fy; B.scooter.position.y+=c.fy*.4;
        B.cape1.rotation.x=.5*Math.min(1,c.spd*2)+Math.sin(c.t*11)*.06*m; B.cape2.rotation.x=.3*Math.min(1,c.spd*2)+Math.sin(c.t*13+1)*.1*m;
        B.head.rotation.y=c.sheet?0:c.look; } };
    const yC=BOD.CURB+.74, yF=BOD.FAR-.74, xa=RING.wr1+3, xb=AVE.r0-3, ym=(yC+yF)/2, LOOP=[[xa,yC],[xb,yC],[xb+1.2,ym],[xb,yF],[xa,yF],[xa-1.2,ym]].map(([x,y])=>({x:BOD.XS(x),z:BOD.ZS(y)}));
    let li=0; const pick=st=>{ li=(li+1)%LOOP.length; st.to=LOOP[li]; st.wait=0; };
    TOONS.frog=make(def,{key:'scooterfrog',name:'THE FROG ON HIS SCOOTER',metres:1.725,radius:.55,speed:.7,stride:4,x:LOOP[0].x,z:LOOP[0].z,pick,roam:false},3); TOONS.frog.cullR=4*TILE; TOONS.frog.farMove=dt=>{ const st=TOONS.frog.st; if(!st.to)pick(st); const dx=st.to.x-st.x, dz=st.to.z-st.z, d=Math.hypot(dx,dz), s2=Math.min(d,st.v*dt); if(d<.05){ pick(st); return; } st.x+=dx/d*s2; st.z+=dz/d*s2; st.h=Math.atan2(dx,dz); TOONS.frog.g.position.set(st.x,TOONS.frog.ground(st.x,st.z),st.z); TOONS.frog.g.rotation.y=st.h; }; }

  { const TEAL=[.22,.5,.5], TEAL2=[.17,.4,.41], BELLY=[.84,.82,.74], COAT=[.73,.68,.48], COAT2=[.6,.55,.37], TROU=[.32,.32,.33], SHOE=[.3,.2,.13], EYE=[.98,.82,.15];
    const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.95,0]],['head','hips',[0,1.42,0]],['jaw','head',[0,1.5,.05]],['fin','head',[0,1.84,-.05]],
        ['armL','hips',[-.23,1.36,0]],['armR','hips',[.23,1.36,0]],['legL','hips',[-.1,.92,0]],['legR','hips',[.1,.92,0]],['skirt','hips',[0,.95,0]]],
      parts:[ part('mouth',0,'head',[ shape(sph(.1,6,4),BLACK,[0,1.48,.2],[1.3,.5,2]) ]),
        part('hood',2,'head',[ shape(sph(.2,10,7),TEAL,[0,1.6,.14],[1.05,.85,1.8],[-10,0,0]), shape(cyl(.19,.27,.26,10),TEAL,[0,1.4,-.02]) ]),
        part('teeth',3,'head',Array.from({length:5},(_,i)=>{ const u=(i-2)/2; return shape(cyl(.002,.025,.05,4),WHITE,[u*.13,1.5,.42-u*u*.1],null,[180,0,0]); })),
        part('eyes',3,'head',[-1,1].map(sx=>flatEye(sx*.19,1.66,.2,.04,EYE,[0,0,90]))), part('pupils',4,'head',[-1,1].map(sx=>flatEye(sx*.2,1.66,.2,.018,BLACK,[0,0,90]))),
        part('jaw',2,'jaw',[ shape(sph(.15,8,5),BELLY,[0,1.43,.2],[1,.4,1.8]) ]),
        part('fin',3,'fin',[ shape(cyl(.002,.14,.38,4),TEAL,[0,1.98,-.12],[.45,1,1],[-28,0,0]) ]),
        part('coat',1,'hips',[ shape(cyl(.2,.22,.48,10),COAT,[0,1.18,0]), shape(torus(.215,.02,4,10),COAT2,[0,.97,0],null,[90,0,0]) ]),
        part('skirt',1,'skirt',[ shape(shell(.22,.31,.55,10,.25,Math.PI*2-.5),COAT,[0,.68,0]) ]),
        ...[['L',-1],['R',1]].flatMap(([s,sx])=>[ ...arm(s,sx,[sx*.23,1.36,0],[sx*.29,1.0,.06],COAT,TEAL,COAT2,.07),
          part('leg '+s,0,'leg'+s,[ shape(cyl(.075,.065,.84,8),TROU,[sx*.1,.5,0]) ]), part('shoe '+s,1,'leg'+s,[ shape(blob(.065,.05,.12,6,4),SHOE,[sx*.1,.05,.04]) ]) ]) ],
      springs:{ fin:{f:-.2,s:.2,k:50,c:5,lim:.4}, skirt:{f:.12,s:-.1,k:40,c:6,lim:.3}, head:{f:-.03,s:.03,k:90,c:9,lim:.12}, jaw:{f:.05,k:60,c:6,lim:.2} },
      pose:(c,dt)=>{ const B=c.B, ph=c.st.ph, m=c.mv; RIGNPC.walk(c,{arm:.35,leg:.45,bob:.035,rock:.03});
        B.skirt.rotation.z=Math.sin(ph)*.05*m; B.head.rotation.y=c.look;
        if((c.snap=(c.snap??6)-dt)<.5){ B.jaw.rotation.x=Math.sin(Math.max(0,c.snap)/.5*Math.PI)*.35; if(c.snap<0)c.snap=6+Math.random()*8; } else B.jaw.rotation.x=.08;
        if(c.sheet)B.jaw.rotation.x=.2; } };
    TOONS.shark=make(def,{key:'shark',name:'THE SHARK',metres:1.85,radius:.3,speed:.42,stride:6,at:84},4); }
  { const {spl,prof,surf,lathe,tube,skin,ss,noise}=PARTSNPC.T, F=(a,b,c,k=70)=>(x,y,z)=>{ const v=noise(x,y,z,k); return v>.68?c:v<.3?b:a; };
    const BL=F([.27,.4,.57],[.26,.39,.56],[.29,.42,.59],90), PK=F([.8,.49,.52],[.79,.48,.51],[.82,.51,.54],90), PK2=[.72,.42,.46], SHINE=[.9,.9,.95], WH=[.42,.52,.66], TAU=Math.PI*2, D=Math.PI/180;
    const melt=(c,E,nu,nv,k=8)=>surf(nu,nv,(u,v)=>{ const th=v*Math.PI, ph=u*TAU, d=[Math.sin(th)*Math.sin(ph),-Math.cos(th),Math.sin(th)*Math.cos(ph)]; let s=0;
      for(const [e,R] of E){ const o=[0,1,2].map(i=>(c[i]-e[i])/R[i]), q=[0,1,2].map(i=>d[i]/R[i]), A=q[0]**2+q[1]**2+q[2]**2, B=2*(o[0]*q[0]+o[1]*q[1]+o[2]*q[2]), C=o[0]**2+o[1]**2+o[2]**2-1, h=B*B-4*A*C; if(h>0){ const t=(-B+Math.sqrt(h))/(2*A); if(t>0)s+=t**k; } }
      const t=s**(1/k); return [c[0]+d[0]*t,c[1]+d[1]*t,c[2]+d[2]*t]; });
    const ROBE=prof([[.13,.7],[.18,.66],[.205,.62],[.22,.55],[.235,.45],[.245,.35],[.255,.22],[.26,.1],[.262,.063]]), RZ=.8;
    const fold=(a,y)=>1+.06*ss(.62,.15,y)*Math.sin(a*7+1.3)+.02*Math.sin(a*13+.4), rp=(a,y)=>{ const r=ROBE.R(y)*fold(a,y); return [r*Math.sin(a),y,r*RZ*Math.cos(a)]; };
    const NC=16, NR=6, YR=Array.from({length:NR},(_,j)=>.62-(.62-.063)*j/(NR-1)), NODE=[], CON=[], K=(i,j)=>j*NC+(i+NC)%NC, dl=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
    for(let j=0;j<NR;j++)for(let i=0;i<NC;i++)NODE.push(rp(i/NC*TAU,YR[j]));
    for(let j=0;j<NR;j++)for(let i=0;i<NC;i++){ if(j>0)CON.push([K(i,j-1),K(i,j)]); if(j>1)CON.push([K(i,j-2),K(i,j)]); if(j>0)CON.push([K(i,j),K(i+1,j)]); }
    CON.forEach(q=>q.push(dl(NODE[q[0]],NODE[q[1]])));
    const robeW=(x,y,z)=>{ if(y>=YR[0])return ['hips',1]; let a=Math.atan2(x,z); if(a<0)a+=TAU; const fu=a/TAU*NC, i0=Math.floor(fu)%NC, tu=fu-Math.floor(fu), fv=Math.min(NR-1.0001,Math.max(0,(YR[0]-y)/(YR[0]-YR[NR-1])*(NR-1))), j0=Math.floor(fv), tv=fv-j0;
      return ['c'+K(i0,j0),(1-tu)*(1-tv),'c'+K(i0+1,j0),tu*(1-tv),'c'+K(i0,j0+1),(1-tu)*tv,'c'+K(i0+1,j0+1),tu*tv]; };
    const HOOD=prof([[.13,.7],[.14,.78],[.142,.86],[.135,.93],[.115,.975],[.07,1.0],[0,1.01]]), he=f=>.7+.29*ss(1.45,.2,f), hp=(a,y,o=0)=>{ const r=HOOD.R(Math.min(1.009,y))+o; return [r*Math.sin(a),y,r*Math.cos(a)-.01]; };
    const sleeve=sx=>{ const s=sx<0?'L':'R', up=sx<0?0:.08; return skin(shape(tube([[sx*.17,.66,0],[sx*.215,.56,.02],[sx*.25,.45+up*.5,.04],[sx*.27,.36+up,.07],[sx*.275,.29+up,.09]],[.06,.058,.06,.07,.08,.082],10,10,{up:[0,0,1],sz:.85,
      d:(p,u,v)=>{ const k=1+.05*Math.sin(u*TAU*5)*v; return [p[0]*1+(p[0]-sx*.25)*(k-1),p[1],p[2]]; }}),PK),(x,y)=>{ const e=ss(.52,.42,y), h=ss(.6,.66,y)*.6; return ['arm'+s,1-e-h,'elbow'+s,e,'hips',h]; }); };
    const hand=sx=>{ const s=sx<0?'L':'R', y=sx<0?.29:.37, x=sx*.275, z=.1; return [shape(blob(.034,.042,.026,8,5),BL,[x,y-.03,z]), ...[-1.5,-.5,.5,1.5].map(k=>shape(blob(.01,.027,.011,5,3),BL,[x+k*.016,y-.075+Math.abs(k)*.006,z+.004],null,[0,0,-k*9])), shape(blob(.01,.024,.011,5,3),BL,[x-sx*.034,y-.035,z+.018],null,[30,0,sx*40])]; };
    const foot=sx=>{ const g=blob(.088,.045,.075,12,7), P=g.attributes.position; for(let i=0;i<P.count;i++)if(P.getY(i)<0)P.setY(i,P.getY(i)*.4); return [shape(g,BL,[sx*.11,.035,.04]), ...[-1.5,-.5,.5,1.5].map(k=>shape(blob(.024,.026,.03,6,4),BL,[sx*.11+k*.04,.026,.105]))]; };
    const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.4,0]],['head','hips',[0,.72,0]],['armL','hips',[-.17,.63,0]],['elbowL','armL',[-.25,.45,.04]],['handL','elbowL',[-.275,.3,.09]],
        ['armR','hips',[.17,.63,0]],['elbowR','armR',[.25,.49,.04]],['handR','elbowR',[.275,.38,.09]],['legL','hips',[-.11,.25,0]],['legR','hips',[.11,.25,0]],...NODE.map((p,k)=>['c'+k,'root',p])],
      parts:[ part('eyes',3,'head',[-1,1].flatMap(sx=>[ shape(sph(.026,8,5),BLACK,[sx*.07,.925,.088],[1.25,.8,.7],[0,sx*40,0]), shape(sph(.007,4,3),SHINE,[sx*.076,.935,.106]) ])),
        part('nostrils',3,'head',[-1,1].map(sx=>shape(sph(.011,6,4),BLACK,[sx*.024,.907,.196],[1,.6,.7],[-30,0,0]))),
        part('mouth',3,'head',[ shape(tube([[-.082,.852,.13],[-.047,.857,.178],[0,.862,.199],[.047,.857,.178],[.082,.852,.13]],[.004,.004],4,10),[.08,.1,.14]) ]),
        part('head',1,'head',[ shape(melt([0,.84,.05],[[[0,.86,.03],[.108,.13,.115]],[[0,.885,.13],[.08,.058,.08]],[[0,.79,.085],[.108,.08,.105]]],18,12),BL) ]),
        part('hood',2,'head',[ shape(surf(20,9,(u,v)=>{ const a=u*TAU, f=Math.min(u,1-u)*TAU, e=he(f), y=e+(1.01-e)*Math.pow(v,.85); return hp(a,y,.004*Math.sin(a*9+y*30)); }),PK),
          shape(tube(Array.from({length:13},(_,i)=>{ const f=(i/12-.5)*2.9; return hp(f,he(Math.abs(f)),.012); }),[.02,.026,.026,.026,.02],6,16),PK) ]),
        part('cowl',3,'hips',[ shape(surf(22,7,(u,v)=>{ const a=u*TAU, b=v*TAU, r=.05*(1+.15*Math.sin(a*5+1)), R=1+r*Math.cos(b)/.15; return [.155*R*Math.sin(a),.705+r*Math.sin(b)*1.1+.008*Math.sin(a*3),.14*R*Math.cos(a)]; }),PK) ]),
        part('robe',0,'root',[ skin(shape(surf(28,14,(u,v)=>rp(u*TAU,.7-(.7-.063)*v)),PK),robeW), skin(shape(surf(28,1,(u,v)=>{ const p=rp(u*TAU,.063); return [p[0]*(1-.025*v),p[1]+.012*v,p[2]*(1-.025*v)]; }),PK2),robeW) ]),
        part('sleeve L',1,'armL',[ sleeve(-1) ]), part('sleeve R',1,'armR',[ sleeve(1) ]),
        part('hand L',2,'handL',hand(-1)), part('hand R',2,'handR',hand(1)),
        part('foot L',0,'legL',foot(-1)), part('foot R',0,'legR',foot(1)) ],
      springs:{ elbowL:{f:-.15,s:.12,k:40,c:5,lim:.4}, elbowR:{f:-.15,s:-.12,k:40,c:5,lim:.4}, head:{f:-.03,s:.03,k:80,c:8,lim:.08} },
      pose:(c,dt,moving)=>{ const B=c.B, m=c.mv, sw=Math.sin(c.st.ph)*m; RIGNPC.walk(c,{arm:.22,leg:.4,bob:.02,rock:.035}); B.head.rotation.y=c.look;
        if(c.sheet)return; B.elbowL.rotation.x=-.12-Math.max(0,sw)*.3; B.elbowR.rotation.x=-.3-Math.max(0,-sw)*.3;
        if((c.gest=(c.gest??6+Math.random()*6)-dt)<1.8){ const g=Math.sin(Math.max(0,c.gest)/1.8*Math.PI); B.elbowR.rotation.x-=g*.9; B.handR.rotation.z=g*.4; if(c.gest<0)c.gest=7+Math.random()*8; }
        const S=c.cl||(c.cl={p:NODE.map(q=>q.slice()),o:NODE.map(q=>q.slice()),calm:0}), V=c.v3||(c.v3=new THREE.Vector3()), M=c.m4||(c.m4=new THREE.Matrix4()); M.makeRotationFromEuler(B.hips.rotation); const H=B.hips.position;
        for(let i=0;i<NC;i++){ const q=NODE[i], P=S.p[i]; V.set(q[0],q[1]-.4,q[2]).applyMatrix4(M); P[0]=V.x+H.x; P[1]=V.y+H.y; P[2]=V.z+H.z; S.o[i][0]=P[0]; S.o[i][1]=P[1]; S.o[i][2]=P[2]; }
        if(moving||c.mv>0)S.calm=0;
        if(S.calm<1.5){ const n=Math.min(4,Math.ceil(dt/.017)), h=dt/n, ax=-c.as*.6, az=-c.af*.6-c.spd*.9, w=c.turn*1.4, LG=[[-.11,B.legL.rotation.x],[.11,B.legR.rotation.x]]; let mv=0;
          for(let s=0;s<n;s++){ for(let k=NC;k<NODE.length;k++){ const p=S.p[k], o=S.o[k], vx=(p[0]-o[0])*.96, vy=(p[1]-o[1])*.96, vz=(p[2]-o[2])*.96; o[0]=p[0]; o[1]=p[1]; o[2]=p[2];
              p[0]+=vx+(ax+w*p[2])*h*h; p[1]+=vy-3*h*h; p[2]+=vz+(az-w*p[0])*h*h; mv+=Math.abs(vx)+Math.abs(vy)+Math.abs(vz); }
            for(let it=0;it<4;it++){ for(const [a,b,L] of CON){ const A=S.p[a], Bp=S.p[b], dx=Bp[0]-A[0], dy=Bp[1]-A[1], dz=Bp[2]-A[2], d=Math.hypot(dx,dy,dz)||1e-6, e=(d-L)/d;
                if(a<NC){ Bp[0]-=dx*e; Bp[1]-=dy*e; Bp[2]-=dz*e; } else{ A[0]+=dx*e*.5; A[1]+=dy*e*.5; A[2]+=dz*e*.5; Bp[0]-=dx*e*.5; Bp[1]-=dy*e*.5; Bp[2]-=dz*e*.5; } }
              for(let k=NC;k<NODE.length;k++){ const p=S.p[k], y=Math.max(.063,Math.min(.7,p[1])), r=Math.hypot(p[0],p[2]/RZ), mn=ROBE.R(y)*.8; if(r<mn){ p[0]*=mn/r; p[2]*=mn/r; }
                if(p[1]<.063)p[1]=.063; if(p[1]<.25)for(const [lx,ra] of LG){ const lz=-(.25-p[1])*Math.sin(ra), dx=p[0]-lx, dz=p[2]-lz, d=Math.hypot(dx,dz); if(d<.12){ p[0]=lx+dx/(d||1)*.12; p[2]=lz+dz/(d||1)*.12; } } } } }
          S.calm=mv<.0005*n?S.calm+dt:0; }
        for(let k=0;k<NODE.length;k++)B['c'+k].position.set(S.p[k][0],S.p[k][1],S.p[k][2]); } };
    TOONS.manatee=make(def,{key:'manatee',name:'THE MANATEE',metres:3.7,radius:.42,speed:.36,stride:6,at:80},5); }
  { const {spl,prof,surf,lathe,tube,skin,ss,noise}=PARTSNPC.T, F=(a,b,c,k=30)=>(x,y,z)=>{ const v=noise(x,y,z,k); return v>.68?c:v<.3?b:a; };
    const OR=F([.94,.53,.13],[.92,.51,.12],[.96,.57,.17],70), MU=F([.86,.64,.17],[.84,.62,.16],[.89,.68,.21],70), MU2=[.9,.69,.22], FL=F([.93,.64,.19],[.91,.62,.18],[.95,.68,.23],70), LIP=[.95,.73,.69], LIP2=[.8,.5,.47], RIM=[.94,.89,.76], SHINE=[.97,.97,1];
    const HOOD=prof([[.25,.52],[.262,.6],[.272,.68],[.268,.76],[.245,.83],[.2,.9],[.13,.955],[.05,.99],[0,1.0]]), BODY=prof([[0,.092],[.13,.1],[.215,.11],[.268,.16],[.292,.23],[.298,.3],[.293,.38],[.28,.45],[.262,.51],[.245,.555]]), BZ=.9;
    const HEAD=prof([[.205,.5],[.232,.56],[.245,.63],[.246,.69],[.238,.75],[.218,.81],[.185,.865],[.14,.91],[.085,.94],[.03,.952],[0,.955]]), HZ=.93;
    const onB=(P,Z,a,y,o=0)=>{ const r=P.R(y)+o; return [r*Math.sin(a),y,r*Z*Math.cos(a)]; }, D=Math.PI/180;
    const eye=sx=>{ const a=34*D*sx, y=.728, p=onB(HEAD,HZ,a,y), n=[Math.sin(a),0,Math.cos(a)], at=k=>p.map((q,i)=>q+n[i]*k);
      return [shape(blob(.06,.06,.026,10,5),RIM,at(.004),null,[0,a/D,0]), shape(blob(.047,.047,.03,10,5),BLACK,at(.02),null,[0,a/D,0]), shape(sph(.009,4,3),SHINE,[at(.047)[0]-.012,y+.016,at(.047)[2]])]; };
    const lip=(xs,ys,rs,dz)=>tube(xs.map((x,i)=>[x,ys[i],Math.sqrt(Math.max(0,HEAD.R(ys[i])**2-x*x))*HZ+dz]),rs,6,10);
    const lapel=sx=>surf(8,6,(u,v)=>onB(BODY,BZ,-sx*D*(2+60*u*(.15+.85*Math.pow(Math.sin(v*Math.PI/2),.7))),.39+.175*v,.012+.022*u*v));
    const pocket=sx=>surf(8,4,(u,v)=>onB(BODY,BZ,(18+20*u)*D*sx,.33+.055*v,.012+.016*(1-v)));
    const foot=sx=>{ const g=blob(.082,.07,.11,10,7), P=g.attributes.position; for(let i=0;i<P.count;i++)if(P.getY(i)<0)P.setY(i,P.getY(i)*.35); return shape(g,FL,[sx*.195,.05,.05],null,[0,sx*18,0]); };
    const arm=sx=>{ const s=sx<0?'L':'R'; return skin(shape(tube([[sx*.245,.5,.07],[sx*.29,.44,.11],[sx*.3,.37,.14],[sx*.27,.3,.17],[sx*.24,.27,.18]],[.03,.05,.056,.05,.032,0],8,10,{up:[1,0,0],sz:.6}),FL),
      (x,y)=>{ const t=ss(.42,.33,y), h=ss(.46,.5,y)*.5; return ['arm'+s,1-t-h,'arm'+s+'t',t,'hips',h]; }); };
    const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.3,0]],['head','hips',[0,.55,0]],['hood','head',[0,.95,0]],
        ['armL','hips',[-.25,.5,.07]],['armLt','armL',[-.29,.38,.13]],['armR','hips',[.25,.5,.07]],['armRt','armR',[.29,.38,.13]],['tail','hips',[0,.25,-.24]],['tailFin','tail',[0,.25,-.26]],['legL','hips',[-.195,.13,.03]],['legR','hips',[.195,.13,.03]]],
      parts:[ part('eyes',3,'head',[...eye(-1),...eye(1)]),
        part('lips',3,'head',[ shape(lip([-.09,-.05,0,.05,.09],[.628,.656,.668,.656,.628],[0,.024,.03,.03,.024,0],.016),LIP), shape(lip([-.055,0,.055],[.627,.618,.627],[0,.022,.026,.022,0],.012),LIP), shape(lip([-.06,0,.06],[.634,.642,.634],[0,.006,.007,.006,0],.03),LIP2) ]),
        part('marks',3,'head',[ shape(sph(.013,6,4),[.98,.8,.55],onB(HEAD,HZ,Math.asin(-.16/HEAD.R(.815)),.815,.004)), shape(blob(.016,.024,.012,8,6),[.93,.38,.1],onB(HEAD,HZ,Math.asin(-.185/HEAD.R(.61)),.61,.004),null,[0,-50,0]) ]),
        part('head',1,'head',[ shape(lathe(HEAD,22,13,{sz:HZ}),OR) ]),
        {name:'hood',rank:5,bone:'hood',glass:true,of:[ shape(surf(22,11,(u,v)=>{ const a=u*Math.PI*2, f=Math.min(u,1-u)*Math.PI*2, e=f>1.9?.52:.52+.34*Math.pow(1-f/1.9,.8), y=e+(1-e)*Math.pow(v,.8), r=HOOD.R(Math.min(.999,y))*(1+.035*Math.sin(a*9+y*25));
          return [r*Math.sin(a)-Math.max(0,y-.8)*.12,y,r*(HZ+.02)*Math.cos(a)]; }),(x,y,z)=>Math.sin(Math.atan2(x,z)*9+y*25)>.72?[1,1,1]:[.95,.95,.92]) ]},
        part('coat',0,'hips',[ shape(lathe(BODY,22,12,{sz:BZ}),MU), shape(tube([.53,.45,.36,.27,.19,.12].map(y=>onB(BODY,BZ,0,y,.004)),[.005,.005],4,8),[.62,.45,.1]) ]),
        part('collar',2,'hips',[ shape(lathe([[.228,.52],[.23,.59],[.245,.614],[.268,.604],[.284,.568],[.29,.5]],22,5,{sz:BZ+.02,keep:(u)=>Math.min(u,1-u)>.1}),MU) ]),
        part('lapels',2,'hips',[ shape(lapel(-1),MU2), shape(lapel(1),MU2) ]),
        part('pockets',1,'hips',[ shape(pocket(-1),MU2), shape(pocket(1),MU2) ]),
        part('arm L',2,'armL',[ arm(-1) ]), part('arm R',2,'armR',[ arm(1) ]),
        part('tail fin',2,'tailFin',[ ...[[.44,-.46],[.1,-.44]].map(([y,z])=>shape(tube([[0,.25,-.24],[0,(.25+y)/2,(z-.24)/2-.02],[0,y,z]],[.035,.07,.065,.03,0],6,8,{up:[1,0,0],sz:.28}),FL)),
          shape(blob(.014,.1,.07,6,4),FL,[0,.26,-.34]) ]),
        part('foot L',0,'legL',[ foot(-1) ]), part('foot R',0,'legR',[ foot(1) ]) ],
      springs:{ tail:{y:.4,k:35,c:4,lim:.5}, tailFin:{y:.5,k:30,c:3,lim:.6}, hood:{f:-.05,s:.05,k:60,c:5,lim:.12}, armLt:{f:-.25,s:.2,k:40,c:4,lim:.5}, armRt:{f:-.25,s:.2,k:40,c:4,lim:.5}, head:{f:-.03,s:.03,k:80,c:8,lim:.1} },
      pose:(c,dt)=>{ const B=c.B, m=c.mv, ph=c.st.ph, sw=Math.sin(ph)*m; RIGNPC.walk(c,{arm:.35,leg:.55,bob:.035,rock:.09});
        B.head.rotation.y=c.look; B.head.rotation.z=-Math.sin(ph)*.05*m; B.armLt.rotation.x=sw*.35; B.armRt.rotation.x=-sw*.35; B.tail.rotation.y=Math.sin(ph)*.3*m; B.tailFin.rotation.y=Math.sin(ph-1)*.35*m;
        if(c.sheet)return; if((c.flap=(c.flap??4+Math.random()*5)-dt)<.8){ const f=Math.sin(Math.max(0,c.flap)/.8*Math.PI*2)*Math.sin(Math.max(0,c.flap)/.8*Math.PI); B.armL.rotation.z-=Math.abs(f)*.5; B.armR.rotation.z+=Math.abs(f)*.5; if(c.flap<0)c.flap=5+Math.random()*7; } } };
    TOONS.rainfish=make(def,{key:'rainfish',name:'THE RAIN FISH',metres:2.2,radius:.32,speed:.3,stride:9,at:88},6); }
  { const {spl,prof,surf,lathe,tube,skin,ss,noise}=PARTSNPC.T, F=(a,b,c,k=90)=>(x,y,z)=>{ const v=noise(x,y,z,k); return v>.68?c:v<.3?b:a; }, TAU=Math.PI*2, D=Math.PI/180;
    const MAR=F([.5,.12,.14],[.48,.11,.13],[.53,.14,.16]), MAR2=F([.45,.1,.12],[.43,.09,.11],[.48,.12,.14]), GRN=F([.25,.36,.25],[.24,.34,.24],[.27,.38,.27]), TAN=F([.86,.72,.55],[.84,.7,.53],[.88,.75,.58]),
      HEL=F([.37,.43,.52],[.35,.41,.5],[.4,.46,.55]), VIS=F([.43,.48,.56],[.41,.46,.54],[.46,.51,.59]), GLD=F([.82,.62,.25],[.79,.59,.23],[.85,.66,.29]), CRM=F([.92,.88,.76],[.9,.85,.73],[.94,.9,.8]), BRN=F([.47,.32,.17],[.44,.3,.16],[.5,.35,.19]), SOLE=[.22,.17,.13];
    const melt=(c,E,nu,nv,k=8)=>surf(nu,nv,(u,v)=>{ const th=v*Math.PI, ph=u*TAU, d=[Math.sin(th)*Math.sin(ph),-Math.cos(th),Math.sin(th)*Math.cos(ph)]; let s=0;
      for(const [e,R] of E){ const o=[0,1,2].map(i=>(c[i]-e[i])/R[i]), q=[0,1,2].map(i=>d[i]/R[i]), A=q[0]**2+q[1]**2+q[2]**2, B=2*(o[0]*q[0]+o[1]*q[1]+o[2]*q[2]), C=o[0]**2+o[1]**2+o[2]**2-1, h=B*B-4*A*C; if(h>0){ const t=(-B+Math.sqrt(h))/(2*A); if(t>0)s+=t**k; } }
      const t=s**(1/k); return [c[0]+d[0]*t,c[1]+d[1]*t,c[2]+d[2]*t]; });
    const TOR=prof([[.07,.25],[.1,.262],[.108,.3],[.108,.4],[.105,.47],[.092,.512],[.06,.533],[0,.54]]), TZ=.78, DOME=prof([[.13,.655],[.133,.69],[.126,.73],[.106,.77],[.07,.8],[.03,.81],[0,.812]]), DZ=.95;
    const onT=(x,y,o)=>[x,y,Math.sqrt(Math.max(0,TOR.R(y)**2-x*x))*TZ+o], onD=(a,y,o=0)=>{ const r=DOME.R(y)+o; return [r*Math.sin(a),y,r*DZ*Math.cos(a)]; };
    const loop=(cx,cy,rx,ry)=>shape(tube(Array.from({length:25},(_,i)=>{ const a=i/24*TAU; return onT(cx+rx*Math.sin(a),cy+ry*Math.cos(a),.006); }),[.007,.007],4,14),GLD);
    const VW=v=>.118*Math.pow(1-v,.85)+.004, visor=(u,v)=>{ const x=u*VW(v), y=.665-v*.19, R=.13; return [x,y,Math.sqrt(Math.max(0,R*R-x*x))*.95+.012*(1-Math.abs(u))-.035*v*v]; };
    const arm=sx=>{ const s=sx<0?'L':'R'; return skin(shape(tube([[sx*.1,.52,0],[sx*.122,.47,.004],[sx*.13,.42,.01],[sx*.132,.37,.016],[sx*.134,.345,.02]],[.042,.046,.043,.04,.041,.043],8,10),(x,y,z)=>y>.405?GRN(x,y,z):MAR(x,y,z)),
      (x,y)=>{ const e=ss(.44,.39,y), h=ss(.5,.53,y)*.5; return ['arm'+s,1-e-h,'elbow'+s,e,'chest',h]; }); };
    const hand=sx=>[shape(blob(.032,.034,.03,8,6),TAN,[sx*.136,.31,.022]), shape(blob(.012,.02,.012,6,4),TAN,[sx*.12,.322,.045],null,[20,0,sx*30])];
    const leg=sx=>{ const s=sx<0?'L':'R', x=sx*.065; return skin(shape(tube([[x,.31,0],[x,.24,0],[x,.17,.004],[x,.1,0]],[.05,.05,.047,.044,.042],7,10,{d:(p,u,v)=>{ const k=1+.05*Math.sin(v*TAU*5); return [x+(p[0]-x)*k,p[1],p[2]*k]; }}),MAR2),
      (x,y)=>{ const k=ss(.2,.15,y); return ['leg'+s,1-k,'knee'+s,k]; }); };
    const boot=sx=>{ const x=sx*.065; return [ shape(melt([x,.06,.02],[[[x,.085,0],[.046,.045,.046]],[[x,.04,.035],[.052,.04,.075]]],12,8),BRN), shape(blob(.055,.012,.08,8,3),SOLE,[x,.008,.035]),
      ...[0,1,2].map(k=>shape(box(.04,.006,.008),GLD,[x,.075-k*.018,.045+k*.012],null,[-30,0,0])) ]; };
    const STUDS=[[.755,-55],[.755,-25],[.755,25],[.755,55],[.71,-75],[.71,-45],[.71,45],[.71,75],[.735,-90],[.735,90],[.72,180],[.75,150],[.75,-150],[.72,120],[.72,-120]];
    const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.27,0]],['chest','hips',[0,.4,0]],['head','chest',[0,.53,0]],['horn','head',[0,.8,0]],
        ['armL','chest',[-.1,.515,0]],['elbowL','armL',[-.13,.42,.01]],['handL','elbowL',[-.134,.34,.02]],['armR','chest',[.1,.515,0]],['elbowR','armR',[.13,.42,.01]],['handR','elbowR',[.134,.34,.02]],
        ['legL','hips',[-.065,.27,0]],['kneeL','legL',[-.065,.17,0]],['footL','kneeL',[-.065,.09,0]],['legR','hips',[.065,.27,0]],['kneeR','legR',[.065,.17,0]],['footR','kneeR',[.065,.09,0]]],
      parts:[ part('eye holes',4,'head',[-1,1].map(sx=>shape(blob(.022,.017,.008,8,4),BLACK,[...visor(sx*.52,.34).map((q,i)=>i===2?q+.004:q)],null,[0,sx*28,sx*-12]))),
        part('visor',3,'head',[ shape(surf(10,8,(u,v)=>visor(u*2-1,v)),VIS), shape(tube(Array.from({length:9},(_,i)=>visor(0,i/8*.98).map((q,k)=>k===2?q+.003:q)),[.006,.005],4,8),HEL) ]),
        part('face',1,'head',[ shape(blob(.094,.088,.09,10,6),TAN,[0,.6,.02]) ]),
        part('helmet',2,'head',[ shape(surf(20,9,(u,v)=>{ const a=u*TAU, f=Math.min(u,1-u)*TAU, e=.655-.11*ss(1,1.7,f), y=e+(.812-e)*v, r=y<.655?.133+.006*(.655-y)/.11:DOME.R(y); return [r*Math.sin(a),y,r*DZ*Math.cos(a)]; }),HEL), shape(lathe([[.133,.648],[.142,.655],[.142,.672],[.133,.678]],20,2,{sz:DZ}),HEL) ]),
        part('studs',3,'head',STUDS.map(([y,a])=>shape(sph(.012,4,3),GLD,onD(a*D,y,.004)))),
        part('crest',3,'head',[ shape(blob(.022,.058,.012,8,6),GLD,onD(0,.75,.004),null,[-28,0,0]), shape(box(.003,.08,.004),[.66,.48,.18],onD(0,.75,.016),null,[-28,0,0]) ]),
        part('horn',3,'horn',[ shape(tube([[0,.795,0],[0,.86,.004],[0,.93,-.004],[0,1.0,-.012]],[.043,.034,.024,.012,0],8,12,{d:(p,u,v)=>{ const k=1+.08*Math.abs(Math.sin(v*Math.PI*4)); return [p[0]*k,p[1],(p[2]+.004)*k-.004]; }}),GLD) ]),
        part('side horns',3,'head',[-1,1].map(sx=>shape(tube([[sx*.118,.715,0],[sx*.15,.75,0],[sx*.172,.79,-.004],[sx*.18,.835,-.01]],[.024,.02,.013,.006,0],6,8),CRM))),
        part('ear cups',3,'head',[-1,1].flatMap(sx=>[ shape(blob(.014,.058,.038,6,5),GLD,[sx*.136,.635,0]), shape(torus(.04,.011,4,10),CRM,[sx*.14,.635,0],[1,1.45,1],[0,90,0]) ])),
        part('neck guard',2,'chest',[-1,1].map(sx=>shape(blob(.05,.032,.045,6,5),CRM,[sx*.1,.548,.02]))),
        part('shirt',0,'chest',[ skin(shape(lathe(TOR,18,10,{sz:TZ}),MAR),(x,y)=>{ const k=ss(.3,.42,y); return ['hips',1-k,'chest',k]; }),
          skin(shape(lathe([[.1,.25],[.104,.256],[.104,.272],[.1,.278]],18,2,{sz:TZ}),MAR2),()=>['hips',1]) ]),
        part('number',2,'chest',[ loop(-.034,.468,.022,.026), loop(-.034,.41,.026,.032), loop(.04,.44,.026,.058) ]),
        part('sleeve L',1,'armL',[ arm(-1) ]), part('sleeve R',1,'armR',[ arm(1) ]), part('hand L',2,'handL',hand(-1)), part('hand R',2,'handR',hand(1)),
        part('leg L',0,'legL',[ leg(-1) ]), part('leg R',0,'legR',[ leg(1) ]), part('boot L',1,'footL',boot(-1)), part('boot R',1,'footR',boot(1)) ],
      springs:{ horn:{f:-.1,s:.1,k:50,c:4,lim:.25}, head:{f:-.04,s:.04,k:70,c:7,lim:.1}, elbowL:{f:-.12,k:40,c:5,lim:.3}, elbowR:{f:-.12,k:40,c:5,lim:.3} },
      pose:(c,dt)=>{ const B=c.B, m=c.mv, ph=c.st.ph, sw=Math.sin(ph)*m, cp=Math.cos(ph)*m; RIGNPC.walk(c,{arm:.4,leg:.5,bob:.018,rock:.04}); B.head.rotation.y=c.look;
        if(c.sheet)return; B.kneeL.rotation.x=Math.max(0,cp)*.8; B.kneeR.rotation.x=Math.max(0,-cp)*.8; B.footL.rotation.x=-B.kneeL.rotation.x*.5; B.footR.rotation.x=-B.kneeR.rotation.x*.5;
        B.elbowL.rotation.x=-.25-Math.max(0,-sw)*.45; B.elbowR.rotation.x=-.25-Math.max(0,sw)*.45; B.chest.rotation.y=-sw*.08;
        if((c.fix=(c.fix??8+Math.random()*6)-dt)<2.2&&!m){ const g=Math.sin(Math.max(0,c.fix)/2.2*Math.PI); B.armR.rotation.x-=g*1.1; B.armR.rotation.z+=g*.5; B.elbowR.rotation.x-=g*1.3; B.head.rotation.z=-g*.08; if(c.fix<0)c.fix=9+Math.random()*9; } } };
    TOONS.eighty=make(def,{key:'eighty',name:'NUMBER 80',metres:2.2,radius:.26,speed:.4,stride:8,at:92},7); }
  { const {spl,prof,surf,lathe,tube,skin,ss,noise}=PARTSNPC.T, F=(a,b,c,k=80)=>(x,y,z)=>{ const v=noise(x,y,z,k); return v>.68?c:v<.3?b:a; }, TAU=Math.PI*2, D=Math.PI/180;
    const DK=F([.2,.2,.21],[.18,.18,.19],[.23,.23,.24]), GR=F([.55,.52,.48],[.51,.48,.44],[.6,.57,.52]), RED=F([.45,.1,.11],[.42,.09,.1],[.5,.13,.13]), BRN=F([.33,.22,.15],[.31,.2,.14],[.36,.25,.17]), CAPE=F([.12,.12,.13],[.11,.11,.12],[.14,.14,.15]), EMB=[1,.55,.18];
    const melt=(c,E,nu,nv,k=8)=>surf(nu,nv,(u,v)=>{ const th=v*Math.PI, ph=u*TAU, d=[Math.sin(th)*Math.sin(ph),-Math.cos(th),Math.sin(th)*Math.cos(ph)]; let s=0;
      for(const [e,R] of E){ const o=[0,1,2].map(i=>(c[i]-e[i])/R[i]), q=[0,1,2].map(i=>d[i]/R[i]), A=q[0]**2+q[1]**2+q[2]**2, B=2*(o[0]*q[0]+o[1]*q[1]+o[2]*q[2]), C=o[0]**2+o[1]**2+o[2]**2-1, h=B*B-4*A*C; if(h>0){ const t=(-B+Math.sqrt(h))/(2*A); if(t>0)s+=t**k; } }
      const t=s**(1/k); return [c[0]+d[0]*t,c[1]+d[1]*t,c[2]+d[2]*t]; });
    const HELM=prof([[.07,.73],[.08,.76],[.083,.8],[.088,.85],[.09,.88],[.085,.91],[.065,.94],[.035,.955],[0,.96]]), hp=(a,y,o=0)=>{ const r=(HELM.R(y)+o)*(1+.3*Math.pow(Math.max(0,Math.cos(a)),8)); return [r*Math.sin(a),y,r*.95*Math.cos(a)]; };
    const helmC=(x,y,z)=>z<0||y>.805+1.05*Math.abs(x)?GR(x,y,z):DK(x,y,z);
    const TOR=prof([[.08,.38],[.1,.4],[.108,.45],[.11,.52],[.112,.58],[.105,.63],[.08,.665],[0,.67]]), TZ=.75, onT=(x,y,o)=>[x,y,Math.sqrt(Math.max(0,TOR.R(y)**2-x*x))*TZ+o];
    const NC=7, NR=5, CN=[], CC=[], cp=(s,t)=>{ const a=Math.PI+s*1.45, r=.14+.2*t; return [r*Math.sin(a),.63-.55*t,r*.85*Math.cos(a)-.03*t]; };
    for(let j=0;j<NR;j++)for(let i=0;i<NC;i++)CN.push(cp(i/(NC-1)*2-1,j/(NR-1)));
    for(let j=0;j<NR;j++)for(let i=0;i<NC;i++){ const k=j*NC+i; if(j>0)CC.push([k-NC,k]); if(j>1)CC.push([k-2*NC,k]); if(i>0)CC.push([k-1,k]); }
    CC.forEach(q=>q.push(Math.hypot(...[0,1,2].map(n=>CN[q[0]][n]-CN[q[1]][n]))));
    const capeW=(x,y,z)=>{ let a=Math.atan2(x,z); if(a<0)a+=TAU; const fu=Math.max(0,Math.min(NC-1.0001,((a-Math.PI)/1.45+1)/2*(NC-1))), fv=Math.max(0,Math.min(NR-1.0001,(.63-y)/.55*(NR-1))), i=Math.floor(fu), j=Math.floor(fv), tu=fu-i, tv=fv-j, k=j*NC+i;
      return ['k'+k,(1-tu)*(1-tv),'k'+(k+1),tu*(1-tv),'k'+(k+NC),(1-tu)*tv,'k'+(k+NC+1),tu*tv]; };
    const arm=sx=>{ const s=sx<0?'L':'R'; return [ skin(shape(tube([[sx*.16,.62,0],[sx*.172,.54,.004],[sx*.18,.47,.01],[sx*.184,.42,.016],[sx*.185,.385,.02]],[.042,.044,.042,.04,.04,.042],8,10),DK),(x,y)=>{ const e=ss(.5,.45,y); return ['arm'+s,1-e,'elbow'+s,e]; }),
      skin(shape(tube([[sx*.183,.475,.012],[sx*.185,.42,.018]],[.05,.052,.05],8,2),GR),()=>['elbow'+s,1]), skin(shape(sph(.008,4,3),[.15,.15,.15],[sx*.2,.45,.06]),()=>['elbow'+s,1]) ]; };
    const hand=sx=>[shape(blob(.04,.045,.035,8,6),DK,[sx*.186,.345,.025]), shape(blob(.014,.024,.014,6,4),DK,[sx*.165,.36,.055],null,[20,0,sx*30])];
    const pauld=sx=>[ shape(blob(.078,.05,.07,10,6),GR,[sx*.175,.635,0],null,[0,0,sx*-22]), ...[0,1,2,3].map(k=>{ const a=(20+k*28)*D; return shape(cyl(0,.013,.05,4),GR,[sx*(.13+.07*Math.sin(a)),.655+.035*Math.cos(a),(k-1.5)*.02],null,[0,0,-sx*(a/D-10)]); }) ];
    const leg=sx=>{ const s=sx<0?'L':'R', x=sx*.105; return [ skin(shape(tube([[x,.4,0],[x,.29,0],[x,.2,.004],[x,.09,0]],[.058,.056,.052,.05,.05],7,10),DK),(x,y)=>{ const k=ss(.24,.18,y); return ['leg'+s,1-k,'knee'+s,k]; }),
      skin(shape(tube([[x,.15,.002],[x,.11,0]],[.058,.06,.058],8,2),GR),()=>['knee'+s,1]) ]; };
    const boot=sx=>{ const x=sx*.105; return [shape(melt([x,.05,.02],[[[x,.07,0],[.055,.045,.055]],[[x,.04,.035],[.06,.04,.085]]],10,7),DK)]; };
    const flap=sx=>surf(4,6,(u,v)=>{ const x=sx*(.02+.11*u), y=.385-.205*v, z=Math.sqrt(Math.max(0,TOR.R(.385)**2-x*x))*TZ+.012+.01*v; return [x,y,z]; });
    const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.4,0]],['chest','hips',[0,.55,0]],['head','chest',[0,.72,0]],
        ['armL','chest',[-.16,.61,0]],['elbowL','armL',[-.18,.47,.01]],['handL','elbowL',[-.185,.37,.02]],['armR','chest',[.16,.61,0]],['elbowR','armR',[.18,.47,.01]],['handR','elbowR',[.185,.37,.02]],
        ['legL','hips',[-.105,.38,0]],['kneeL','legL',[-.105,.2,0]],['footL','kneeL',[-.105,.08,0]],['legR','hips',[.105,.38,0]],['kneeR','legR',[.105,.2,0]],['footR','kneeR',[.105,.08,0]],
        ['flapL','hips',[-.075,.385,.09]],['flapR','hips',[.075,.385,.09]],...CN.map((p,k)=>['k'+k,'root',p])],
      parts:[ part('eyes',5,'head',[-1,1].map(sx=>{ const p=hp(sx*.48,.837,.004); return shape(blob(.024,.009,.006,6,3),EMB,p,null,[0,sx*28,sx*-14]); })),
        part('helmet',2,'head',[ shape(surf(20,10,(u,v)=>{ const a=u*TAU, f=Math.min(u,1-u)*TAU, e=.705+.055*ss(0,1,f); return hp(a,e+(.96-e)*v); }),helmC) ]),
        part('crest',3,'head',[[0,.955,.02,0,1.0,-.01],[-.032,.945,0,-.04,.99,-.025],[.032,.945,0,.04,.985,-.025],[0,.95,-.04,0,.985,-.075]].map(([x0,y0,z0,x1,y1,z1])=>shape(tube([[x0,y0,z0],[(x0+x1)/2,(y0+y1)/2+.004,(z0+z1)/2],[x1,y1,z1]],[.02,.012,0],5,4,{up:[1,0,0],sz:.45}),GR))),
        part('side horns',3,'head',[-1,1].map(sx=>shape(tube([[sx*.085,.81,0],[sx*.105,.85,-.005],[sx*.122,.885,-.012]],[.022,.012,0],5,4,{up:[0,0,1],sz:.5}),GR))),
        part('scarf',4,'chest',[[.715,.115,.1,.034],[.678,.125,.11,.036]].map(([y,rx,rz,r])=>shape(surf(18,5,(u,v)=>{ const a=u*TAU, b=v*TAU, q=r*(1+.18*Math.sin(a*4+y*40)), R=1+q*Math.cos(b)/.11; return [rx*R*Math.sin(a),y+q*Math.sin(b),rz*R*Math.cos(a)]; }),RED))),
        part('body',0,'chest',[ skin(shape(lathe(TOR,16,10,{sz:TZ}),DK),(x,y)=>{ const k=ss(.42,.52,y); return ['hips',1-k,'chest',k]; }) ]),
        part('chest plate',2,'chest',[ shape(surf(10,5,(u,v)=>{ const a=(u-.5)*140*D, y=.55+.1*v, r=TOR.R(y)+.008; return [r*Math.sin(a),y,r*TZ*Math.cos(a)]; }),GR), shape(blob(.024,.03,.01,6,4),GR,onT(0,.6,.022)),
          ...[.525,.495].map(y=>shape(tube([-.08,-.04,0,.04,.08].map(x=>onT(x,y+.006*(1-Math.abs(x)/.08),.004)),[.005,.005],4,8),GR)) ]),
        part('belt',2,'hips',[ shape(lathe([[.112,.39],[.116,.395],[.116,.42],[.112,.425]],16,2,{sz:TZ}),[.24,.21,.19]), shape(box(.05,.03,.01),GR,onT(0,.407,.012)),
          ...[-1,1].map(sx=>shape(blob(.032,.036,.026,6,4),[.25,.24,.23],[sx*.118,.4,.055])) ]),
        part('pauldrons',3,'chest',[...pauld(-1),...pauld(1)]),
        part('arm L',1,'armL',arm(-1)), part('arm R',1,'armR',arm(1)), part('hand L',2,'handL',hand(-1)), part('hand R',2,'handR',hand(1)),
        part('flap L',2,'flapL',[ shape(flap(-1),BRN) ]), part('flap R',2,'flapR',[ shape(flap(1),BRN) ]),
        part('leg L',0,'legL',leg(-1)), part('leg R',0,'legR',leg(1)), part('boot L',1,'footL',boot(-1)), part('boot R',1,'footR',boot(1)),
        part('cape',0,'root',[ skin(shape(surf(16,12,(u,v)=>cp(u*2-1,v)),CAPE),capeW) ]) ],
      springs:{ flapL:{f:.3,k:30,c:4,lim:.5}, flapR:{f:.3,k:30,c:4,lim:.5}, head:{f:-.03,s:.03,k:80,c:8,lim:.08}, elbowL:{f:-.12,k:40,c:5,lim:.3}, elbowR:{f:-.12,k:40,c:5,lim:.3} },
      pose:(c,dt,moving)=>{ const B=c.B, m=c.mv, ph=c.st.ph, sw=Math.sin(ph)*m, cp2=Math.cos(ph)*m; RIGNPC.walk(c,{arm:.35,leg:.45,bob:.015,rock:.03}); B.head.rotation.y=c.look;
        if(c.sheet)return; B.kneeL.rotation.x=Math.max(0,cp2)*.7; B.kneeR.rotation.x=Math.max(0,-cp2)*.7; B.footL.rotation.x=-B.kneeL.rotation.x*.5; B.footR.rotation.x=-B.kneeR.rotation.x*.5;
        B.elbowL.rotation.x=-.2-Math.max(0,-sw)*.4; B.elbowR.rotation.x=-.2-Math.max(0,sw)*.4; B.flapL.rotation.x=Math.min(0,B.legL.rotation.x)*.9; B.flapR.rotation.x=Math.min(0,B.legR.rotation.x)*.9;
        if((c.sq=(c.sq??7+Math.random()*6)-dt)<1.6&&!m){ const g=Math.sin(Math.max(0,c.sq)/1.6*Math.PI); B.armL.rotation.z-=g*.25; B.armR.rotation.z+=g*.25; B.elbowL.rotation.x-=g*.5; B.elbowR.rotation.x-=g*.5; B.chest.position.y+=g*.01; if(c.sq<0)c.sq=8+Math.random()*8; }
        const S=c.cl||(c.cl={p:CN.map(q=>q.slice()),o:CN.map(q=>q.slice()),calm:0}), V=c.v3||(c.v3=new THREE.Vector3()), M=c.m4||(c.m4=new THREE.Matrix4()); M.makeRotationFromEuler(B.hips.rotation); const H=B.hips.position;
        for(let i=0;i<NC;i++){ const q=CN[i], P=S.p[i]; V.set(q[0],q[1]-.4,q[2]).applyMatrix4(M); P[0]=V.x+H.x; P[1]=V.y+H.y; P[2]=V.z+H.z; S.o[i][0]=P[0]; S.o[i][1]=P[1]; S.o[i][2]=P[2]; }
        if(moving||m>0)S.calm=0;
        if(S.calm<1.5){ const n=Math.min(4,Math.ceil(dt/.017)), h=dt/n, ax=-c.as*.6, az=-c.af*.6-c.spd*.9, w=c.turn*1.4, LG=[[-.105,B.legL.rotation.x],[.105,B.legR.rotation.x]]; let mv=0;
          for(let s=0;s<n;s++){ for(let k=NC;k<CN.length;k++){ const p=S.p[k], o=S.o[k], vx=(p[0]-o[0])*.96, vy=(p[1]-o[1])*.96, vz=(p[2]-o[2])*.96; o[0]=p[0]; o[1]=p[1]; o[2]=p[2];
              p[0]+=vx+(ax+w*p[2])*h*h; p[1]+=vy-3*h*h; p[2]+=vz+(az-w*p[0])*h*h; mv+=Math.abs(vx)+Math.abs(vy)+Math.abs(vz); }
            for(let it=0;it<4;it++){ for(const [a,b,L] of CC){ const A=S.p[a], Bp=S.p[b], dx=Bp[0]-A[0], dy=Bp[1]-A[1], dz=Bp[2]-A[2], d=Math.hypot(dx,dy,dz)||1e-6, e=(d-L)/d;
                if(a<NC){ Bp[0]-=dx*e; Bp[1]-=dy*e; Bp[2]-=dz*e; } else{ A[0]+=dx*e*.5; A[1]+=dy*e*.5; A[2]+=dz*e*.5; Bp[0]-=dx*e*.5; Bp[1]-=dy*e*.5; Bp[2]-=dz*e*.5; } }
              for(let k=NC;k<CN.length;k++){ const p=S.p[k], r=Math.hypot(p[0],p[2]/.85), mn=p[1]>.38?.14:.16; if(r<mn){ p[0]*=mn/r; p[2]*=mn/r; } if(p[1]<.02)p[1]=.02;
                if(p[1]<.38)for(const [lx,ra] of LG){ const lz=-(.38-p[1])*Math.sin(ra), dx=p[0]-lx, dz=p[2]-lz, d=Math.hypot(dx,dz); if(d<.085){ p[0]=lx+dx/(d||1)*.085; p[2]=lz+dz/(d||1)*.085; } } } } }
          S.calm=mv<.0005*n?S.calm+dt:0; }
        for(let k=0;k<CN.length;k++)B['k'+k].position.set(S.p[k][0],S.p[k][1],S.p[k][2]); } };
    TOONS.knight=make(def,{key:'emberknight',name:'THE EMBER KNIGHT',metres:2.4,radius:.3,speed:.38,stride:7,at:96,eyeC:'1.,.55,.18'},8); }
  { const {spl,prof,surf,lathe,tube,skin,ss,noise}=PARTSNPC.T, F=(a,b,c,k=80)=>(x,y,z)=>{ const v=noise(x,y,z,k); return v>.68?c:v<.3?b:a; }, TAU=Math.PI*2;
    const BLU=F([.42,.6,.75],[.4,.58,.73],[.45,.63,.78]), HAT=F([.42,.25,.17],[.4,.23,.16],[.45,.27,.19]), BAND=[.3,.17,.11], GRN=F([.42,.7,.6],[.4,.67,.57],[.45,.73,.63]), YEL=F([.93,.72,.15],[.9,.69,.13],[.95,.76,.2]), ORA=F([.82,.33,.14],[.79,.31,.13],[.85,.36,.16]), INK=[.04,.04,.04];
    const melt=(c,E,nu,nv,k=6)=>surf(nu,nv,(u,v)=>{ const th=v*Math.PI, ph=u*TAU, d=[Math.sin(th)*Math.sin(ph),-Math.cos(th),Math.sin(th)*Math.cos(ph)]; let s=0;
      for(const [e,R] of E){ const o=[0,1,2].map(i=>(c[i]-e[i])/R[i]), q=[0,1,2].map(i=>d[i]/R[i]), A=q[0]**2+q[1]**2+q[2]**2, B=2*(o[0]*q[0]+o[1]*q[1]+o[2]*q[2]), C=o[0]**2+o[1]**2+o[2]**2-1, h=B*B-4*A*C; if(h>0){ const t=(-B+Math.sqrt(h))/(2*A); if(t>0)s+=t**k; } }
      const t=s**(1/k); return [c[0]+d[0]*t,c[1]+d[1]*t,c[2]+d[2]*t]; });
    const rbox=(hx,hy,hz,nu,nv,e=.35)=>surf(nu,nv,(u,v)=>{ const th=v*Math.PI-Math.PI/2, ph=u*TAU, f=(c,p)=>Math.sign(c)*Math.pow(Math.abs(c),p), cy=Math.cos(th);
      return [hx*f(cy,e)*f(Math.sin(ph),e),hy*f(Math.sin(th),e),hz*f(cy,e)*f(Math.cos(ph),e)]; });
    const BODY=[[[0,.33,0],[.3,.25,.24]],[[0,.6,0],[.25,.22,.21]]], bodyZ=(x,y)=>{ let z=0; for(const [e,R] of BODY){ const q=1-((x-e[0])/R[0])**2-((y-e[1])/R[1])**2; if(q>0)z=Math.max(z,e[2]+R[2]*Math.sqrt(q)); } return z; };
    const onB=(x,y,o=0)=>[x,y,bodyZ(x,y)+o];
    const arm=sx=>skin(shape(rbox(.085,.115,.08,10,8,.6),BLU,[sx*.31,.43,0],null,[0,0,sx*18]),()=>['arm'+(sx<0?'L':'R'),1]);
    const leg=(sx,C)=>[ shape(rbox(.12,.13,.105,10,8,.35),C,[sx*.12,.22,.14]), shape(rbox(.11,.055,.12,10,6,.45),C,[sx*.15,.055,.13],null,[0,sx*12,0]) ];
    const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.3,0]],['body','hips',[0,.4,0]],['hat','body',[0,.8,0]],['armL','body',[-.25,.5,0]],['armR','body',[.25,.5,0]],['legL','hips',[-.12,.32,.12]],['legR','hips',[.12,.32,.12]]],
      parts:[ part('face',3,'body',[ ...[-1,1].map(sx=>shape(blob(.04,.04,.012,10,6),INK,onB(sx*.079,.655,.002))), shape(rbox(.068,.016,.012,8,4,.4),INK,onB(0,.53,.002)) ]),
        part('nose',2,'body',[ shape(blob(.035,.03,.025,8,6),BLU,onB(0,.595,-.005)) ]),
        part('badge',2,'body',[ shape(rbox(.09,.033,.03,8,4,.4),GRN,onB(-.06,.41,.005),null,[0,0,-18]) ]),
        part('body',0,'body',[ skin(shape(melt([0,.45,0],BODY,28,18),BLU),(x,y)=>{ const k=ss(.3,.45,y); return ['hips',1-k,'body',k]; }) ]),
        part('hat',4,'hat',[ shape(lathe([[.19,.01],[.188,.075],[.18,.14],[.165,.17],[.08,.175],[0,.175]],20,7),HAT,[0,.81,0],null,[0,0,-9]), shape(lathe([[.19,.015],[.192,.03],[.191,.045],[.189,.05]],20,2),BAND,[0,.81,0],null,[0,0,-9]),
          shape(lathe([[.185,.015],[.28,-.005],[.33,-.007],[.342,.005],[.335,.018],[.28,.008],[.185,.027]],24,6),HAT,[0,.81,0],null,[0,0,-9]) ]),
        part('arm L',1,'armL',[ arm(-1) ]), part('arm R',1,'armR',[ arm(1) ]),
        part('leg L',1,'legL',leg(-1,YEL)), part('leg R',1,'legR',leg(1,ORA)) ],
      springs:{ hat:{f:-.1,s:.1,k:45,c:4,lim:.25}, armL:{f:-.2,s:.15,k:35,c:4,lim:.4}, armR:{f:-.2,s:-.15,k:35,c:4,lim:.4}, body:{f:-.04,s:.05,k:70,c:7,lim:.12} },
      pose:(c,dt)=>{ const B=c.B, m=c.mv, ph=c.st.ph; RIGNPC.walk(c,{arm:.45,leg:.45,bob:.03,rock:.1}); B.body.rotation.y=c.look; B.body.rotation.z=-Math.sin(ph)*.05*m;
        if(c.sheet)return; if((c.tip=(c.tip??6+Math.random()*6)-dt)<1.6&&!m){ const g=Math.sin(Math.max(0,c.tip)/1.6*Math.PI); B.armR.rotation.z+=g*2.3; B.armR.rotation.x-=g*.3; B.hat.position.y+=g*.05; B.hat.rotation.z-=g*.25; if(c.tip<0)c.tip=8+Math.random()*8; } } };
    TOONS.blocks=make(def,{key:'blocks',name:'MR. BLOCKS',metres:2.0,radius:.32,speed:.32,stride:8,at:100},9); }
  { const {spl,prof,surf,lathe,tube,skin,ss,noise}=PARTSNPC.T, TAU=Math.PI*2, D=Math.PI/180;
    const fur=(a,b,c)=>(x,y,z)=>{ const v=noise(x,y,z,120), w=noise(x+3,y,z,40); return v>.66?c:v<.32?b:w>.6?c:a; };
    const GRY=fur([.5,.47,.44],[.4,.37,.35],[.64,.61,.57]), BRN=fur([.36,.25,.18],[.29,.2,.14],[.45,.33,.24]), FELT=(x,y,z)=>noise(x,y,z,90)>.6?[.6,.58,.55]:[.53,.51,.48];
    const TAN=[.62,.48,.34], CRM=[.86,.8,.7], BLU=(x,y,z)=>noise(x,y,z,90)>.62?[.5,.64,.8]:[.45,.6,.77], STR=[.9,.88,.82], BELT=[.33,.24,.18];
    const shag=(g,amp,k=110)=>{ g.computeVertexNormals(); const P=g.attributes.position, N=g.attributes.normal; let cx=0, cy=0, cz=0; for(let i=0;i<P.count;i++){ cx+=P.getX(i); cy+=P.getY(i); cz+=P.getZ(i); } cx/=P.count; cy/=P.count; cz/=P.count;
      for(let i=0;i<P.count;i++){ const x=P.getX(i), y=P.getY(i), z=P.getZ(i); let nx=N.getX(i), ny=N.getY(i), nz=N.getZ(i); if(nx*(x-cx)+ny*(y-cy)+nz*(z-cz)<0){ nx=-nx; ny=-ny; nz=-nz; N.setXYZ(i,nx,ny,nz); }
        const s=amp*(.3+noise(x,y,z,k)); P.setXYZ(i,x+nx*s,y+ny*s,z+nz*s); } return g; };
    const hair=(g,col,n,len,seed,W)=>{ let q=seed; const r=()=>{ q=(q*16807)%2147483647; return q/2147483647; }, P=g.attributes.position, N=g.attributes.normal, out=[], d=new THREE.Vector3(), tg=new THREE.Vector3(), nv=new THREE.Vector3(), V=[];
      for(let i=0;i<n;i++){ const j=Math.floor(r()*P.count), x=P.getX(j), y=P.getY(j), z=P.getZ(j); nv.set(N.getX(j),N.getY(j),N.getZ(j)); d.copy(nv).multiplyScalar(.7).add(tg.set((r()-.5)*.5,-1,(r()-.5)*.5)).normalize(); tg.crossVectors(nv,d).normalize();
        const L=len*(.6+r()*.8), w=.009+r()*.006; V.push(x+tg.x*w,y+tg.y*w,z+tg.z*w, x-tg.x*w,y-tg.y*w,z-tg.z*w, x+d.x*L,y+d.y*L,z+d.z*L); }
      const h=new THREE.BufferGeometry(); h.setAttribute('position',new THREE.Float32BufferAttribute(V,3)); const s=shape(h,col); return [W?skin(s,W):s]; };
    const furry=(g,amp,col,n,len,seed,W)=>{ shag(g,amp); const m=shape(g,col); return [W?skin(m,W):m,...hair(g,col,n,len,seed,W)]; };
    const melt=(c,E,nu,nv,k=8)=>surf(nu,nv,(u,v)=>{ const th=v*Math.PI, ph=u*TAU, d=[Math.sin(th)*Math.sin(ph),-Math.cos(th),Math.sin(th)*Math.cos(ph)]; let s=0;
      for(const [e,R] of E){ const o=[0,1,2].map(i=>(c[i]-e[i])/R[i]), q=[0,1,2].map(i=>d[i]/R[i]), A=q[0]**2+q[1]**2+q[2]**2, B=2*(o[0]*q[0]+o[1]*q[1]+o[2]*q[2]), C=o[0]**2+o[1]**2+o[2]**2-1, h=B*B-4*A*C; if(h>0){ const t=(-B+Math.sqrt(h))/(2*A); if(t>0)s+=t**k; } }
      const t=s**(1/k); return [c[0]+d[0]*t,c[1]+d[1]*t,c[2]+d[2]*t]; });
    const HEAD=[[[0,.9,0],[.147,.1,.13]],[[0,.86,.07],[.12,.07,.09]]];
    const TOR=prof([[.12,.43],[.15,.45],[.165,.5],[.17,.6],[.16,.7],[.12,.77],[.06,.8]]), TZ=.75, onT=(x,y,o)=>[x,y,Math.sqrt(Math.max(0,TOR.R(y)**2-x*x))*TZ+o];
    const JK=prof([[.215,.3],[.21,.4],[.2,.55],[.195,.67],[.17,.75],[.12,.8]]), JZ=.8, OPEN=26*D;
    const jw=(x,y,z)=>{ const a=Math.atan2(x,z), k=ss(.62,.38,y); return a>0&&a<1.4?['chest',1-k,'jR',k]:a<0&&a>-1.4?['chest',1-k,'jL',k]:['chest',1-k,'jB',k]; };
    const jcol=(x,y,z)=>{ const a=Math.abs(Math.atan2(x,z)); return a<OPEN+.16&&y<.75?TAN:GRY(x,y,z); };
    const sleeve=sx=>{ const s=sx<0?'L':'R'; return furry(tube([[sx*.18,.75,0],[sx*.215,.66,.005],[sx*.235,.56,.012],[sx*.24,.47,.02],[sx*.24,.4,.03]],[.075,.08,.075,.072,.075,.078],8,10),.008,GRY,110,.035,sx<0?3:5,(x,y)=>{ const e=ss(.6,.52,y); return ['arm'+s,1-e,'elbow'+s,e]; }); };
    const leg=sx=>{ const s=sx<0?'L':'R', x=sx*.08; return furry(tube([[x,.46,0],[x,.33,0],[x,.22,.005],[x,.08,0]],[.08,.078,.074,.072,.074],8,10),.008,BRN,110,.035,sx<0?9:13,(x,y)=>{ const k=ss(.29,.21,y); return ['leg'+s,1-k,'knee'+s,k]; }); };
    const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.45,0]],['chest','hips',[0,.6,0]],['head','chest',[0,.8,0]],['earL','head',[-.12,.94,0]],['earR','head',[.12,.94,0]],
        ['armL','chest',[-.18,.74,0]],['elbowL','armL',[-.23,.56,.01]],['handL','elbowL',[-.24,.4,.03]],['armR','chest',[.18,.74,0]],['elbowR','armR',[.23,.56,.01]],['handR','elbowR',[.24,.4,.03]],
        ['jL','chest',[-.12,.55,.12]],['jR','chest',[.12,.55,.12]],['jB','chest',[0,.55,-.14]],
        ['legL','hips',[-.08,.45,0]],['kneeL','legL',[-.08,.26,0]],['footL','kneeL',[-.08,.08,0]],['legR','hips',[.08,.45,0]],['kneeR','legR',[.08,.26,0]],['footR','kneeR',[.08,.08,0]]],
      parts:[ part('eyes',4,'head',[-1,1].map(sx=>shape(sph(.012,6,4),BLACK,[sx*.043,.905,.152]))),
        part('nose',4,'head',[ shape(blob(.022,.015,.014,8,5),BLACK,[0,.874,.176]), shape(tube([[-.025,.842,.163],[0,.848,.171],[.025,.842,.163]],[.003,.003],3,6),BLACK) ]),
        part('muzzle',3,'head',[ shape(blob(.05,.035,.04,10,6),CRM,[0,.855,.144]) ]),
        part('head',2,'head',furry(melt([0,.88,.02],HEAD,18,12),.005,GRY,90,.03,21)),
        ...[['L',-1],['R',1]].map(([s,sx])=>part('ear '+s,3,'ear'+s,[ ...furry(blob(.045,.045,.022,10,6).translate(sx*.125,.955,-.01),.003,GRY,14,.02,sx<0?31:37), shape(blob(.028,.03,.01,8,5),TAN,[sx*.123,.952,.01]) ])),
        part('sweater',0,'chest',[ skin(shape(lathe(TOR,14,8,{sz:TZ}),BLU),(x,y)=>{ const k=ss(.45,.55,y); return ['hips',1-k,'chest',k]; }),
          ...[.686,.652,.619,.583].map(y=>shape(tube([-.1,-.05,0,.05,.1].map(x=>onT(x,y,.004)),[.004,.004],3,8),STR)), ...[-.04,0,.04].map(x=>shape(tube([onT(x,.56,.004),onT(x,.48,.004)],[.003,.003],3,2),STR)) ]),
        part('belt',1,'hips',[ shape(lathe([[.165,.432],[.172,.44],[.172,.465],[.168,.472]],18,2,{sz:TZ}),BELT) ]),
        part('jacket',2,'chest',[ ...furry(surf(30,12,(u,v)=>{ const a=OPEN+u*(TAU-2*OPEN), y=.3+.5*v, r=JK.R(y); return [r*Math.sin(a),y,r*JZ*Math.cos(a)]; }),.009,jcol,330,.04,7,jw),
          ...furry(surf(26,5,(u,v)=>{ const a=OPEN*.6+u*(TAU-1.2*OPEN), b=v*Math.PI, r=.135+.04*Math.sin(b); return [r*Math.sin(a),.775+.04*Math.cos(b),r*JZ*Math.cos(a)]; }),.01,GRY,80,.04,17,()=>['chest',1]),
          skin(shape(sph(.018,6,4),[.45,.3,.18],[-.1,.48,.19],[1,1,.4]),()=>['jL',1]),
          ]),
        part('sleeve L',2,'armL',sleeve(-1)), part('sleeve R',2,'armR',sleeve(1)),
        ...[['L',-1],['R',1]].map(([s,sx])=>part('paw '+s,3,'hand'+s,[ shape(blob(.045,.05,.04,10,6),FELT,[sx*.24,.36,.035]) ])),
        part('trousers',0,'hips',[ ...furry(lathe([[.15,.38],[.165,.42],[.168,.46],[.16,.48]],18,3,{sz:TZ}),.008,BRN,30,.03,23,()=>['hips',1]) ]),
        part('leg L',1,'legL',leg(-1)), part('leg R',1,'legR',leg(1)),
        ...[['L',-1],['R',1]].map(([s,sx])=>part('foot '+s,1,'foot'+s,[ shape(blob(.065,.045,.095,12,7),FELT,[sx*.085,.04,.025]) ])) ],
      springs:{ jL:{f:.25,s:.15,k:30,c:3,lim:.45}, jR:{f:.25,s:.15,k:30,c:3,lim:.45}, jB:{f:.3,s:.15,k:30,c:3,lim:.45}, earL:{f:-.15,s:.12,k:55,c:5,lim:.35}, earR:{f:-.15,s:.12,k:55,c:5,lim:.35}, head:{f:-.03,s:.03,k:80,c:8,lim:.08}, elbowL:{f:-.12,k:40,c:5,lim:.3}, elbowR:{f:-.12,k:40,c:5,lim:.3} },
      pose:(c,dt)=>{ const B=c.B, m=c.mv, ph=c.st.ph, sw=Math.sin(ph)*m, cp=Math.cos(ph)*m; RIGNPC.walk(c,{arm:.3,leg:.4,bob:.015,rock:.035}); B.head.rotation.y=c.look;
        if(c.sheet)return; B.kneeL.rotation.x=Math.max(0,cp)*.65; B.kneeR.rotation.x=Math.max(0,-cp)*.65; B.footL.rotation.x=-B.kneeL.rotation.x*.5; B.footR.rotation.x=-B.kneeR.rotation.x*.5;
        B.elbowL.rotation.x=-.15-Math.max(0,-sw)*.35; B.elbowR.rotation.x=-.15-Math.max(0,sw)*.35; B.jL.rotation.x=Math.min(0,B.legL.rotation.x)*.5; B.jR.rotation.x=Math.min(0,B.legR.rotation.x)*.5;
        if((c.ear=(c.ear??5+Math.random()*5)-dt)<0&&!m){ c.ear=6+Math.random()*7; c.kick(Math.random()<.5?'earL':'earR','z',(Math.random()<.5?-1:1)*6); }
        if((c.tilt=(c.tilt??9+Math.random()*6)-dt)<1.6&&!m){ const g=Math.sin(Math.max(0,c.tilt)/1.6*Math.PI); B.head.rotation.z=g*.2; if(c.tilt<0)c.tilt=10+Math.random()*8; } } };
    TOONS.bear=make(def,{key:'coatbear',name:'THE BEAR IN THE COAT',metres:3.6,radius:.36,speed:.36,stride:6.5,at:104},10); }
  window.TOONSDBG=()=>Object.fromEntries(Object.entries(TOONS).map(([k,N])=>[k,{key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),tris:N.tris,vis:N.g.visible}])); }
