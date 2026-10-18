// ---- THE TOMATO AND HIS FRIENDS (owner, 17 Oct 2026, his pictures: a tomato-headed mascot in a yellow apron, "simple graphics, like the
// character on right (the old game's deer)"; then a grumpy cat in a yellow raincoat reading the paper by his ink jar, a rusty orange TV set with
// cat ears on furry legs, a frog in a riveted helmet and an orange cape on a white scooter, a man in a shark's hood and a trench coat: "lets do the
// same thing with them. simpel designed characters. each part its own so it can be animated. give it physics and animations for walking, each
// item separate thing (newspaper, motorcycle)"; of a ladder of the tomato at complexity 1 to 5 his pick: "#1 but with #2s arms"): the sprite's
// level, a few plain shapes each in flat colours, round things in few faces, flat eyes; only the arms the second level's (a sleeve from the
// shoulder to the wrist, a glove with its thumb and its cuff). Every part on a bone of its own (npc-rig.js), the things they carry their own
// parts on their own bones (the newspaper and its page, the ink jar, the scooter, its fork, its wheels, the box on its rack, the TV's cable); the
// springs give what hangs or stands its swing. They walk the whole street (every new character does: owner, 17 Oct 2026). ?toonhold=1 stands
// them in a row ----
const TOONS={};
{ const {shape,limb,sph,cyl,box,torus,blob,shell}=PARTSNPC.T;
  const part=(name,rank,bone,of)=>({name,rank,bone,of}), BLACK=[0,0,0], WHITE=[.96,.95,.9];
  const make=(def,o,i)=>RIGNPC.make(def,Object.assign({eye:0,eyeC:'0.,0.,0.',stride:6},PARTSNPC.street(o.at,-70),o,RIGNPC.hold(i)));
  // the second level's arm: a sleeve from the shoulder (sh) to the wrist (wr), a glove (its thumb toward his middle) and a cuff
  const arm=(s,sx,sh,wr,col,glove,cuff,r=.045)=>[ part('arm '+s,1,'arm'+s,[ limb(sh,wr,r,r*.9,col,6) ]),
    part('glove '+s,2,'arm'+s,[ shape(blob(.058,.068,.05,8,6),glove,[wr[0]+sx*.005,wr[1]-.06,wr[2]+.01]), shape(blob(.02,.035,.02,6,4),glove,[wr[0]-sx*.025,wr[1]-.04,wr[2]+.05],null,[0,0,sx*30]),
      shape(cyl(.05,.05,.03,8),cuff,[wr[0],wr[1]+.01,wr[2]]) ]) ];
  const flatEye=(x,y,z,r,col,rot=[90,0,0])=>shape(cyl(r,r,.02,8),col,[x,y,z],null,rot);

  // ---- THE TOMATO: a ball of a head, five leaves and a stub of a stem on springs, flat eyes; a yellow robe to the ground; white arms and gloves
  { const RED=[.86,.16,.1], LEAF=[.36,.6,.24], LEAF2=[.27,.48,.18], STEM=[.42,.62,.3], YEL=[.96,.82,.36], GLOVE=[.88,.87,.82];
    const HY=1.2, HR=.32, TOP=HY+HR*.9;
    const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.5,0]],['head','hips',[0,.9,0]],['leaves','head',[0,TOP-.03,0]],['stem','leaves',[0,TOP,0]],['armL','hips',[-.18,.8,0]],['armR','hips',[.18,.8,0]]],
      parts:[ part('eyes',0,'head',[-1,1].map(sx=>flatEye(sx*.1,HY+.06,HR-.005,.035,BLACK))),
        part('head',2,'head',[ shape(sph(HR,10,7),RED,[0,HY,0],[1,.9,1]) ]),
        part('eye whites',3,'head',[-1,1].map(sx=>flatEye(sx*.1,HY+.06,HR-.02,.075,WHITE))),
        part('leaves',3,'leaves',Array.from({length:5},(_,i)=>{ const a=i/5*Math.PI*2+.3; return shape(blob(.13,.018,.06,6,4),i%2?LEAF2:LEAF,[Math.cos(a)*.13,TOP-.03,-Math.sin(a)*.13],null,[0,a*180/Math.PI,-12]); })),
        part('stem',3,'stem',[ shape(cyl(.025,.03,.14,5),STEM,[0,TOP+.05,0]) ]),
        part('robe',0,'hips',[ shape(cyl(.15,.3,.86,10),YEL,[0,.43,0]) ]),
        ...arm('L',-1,[-.15,.8,0],[-.27,.52,.07],WHITE,WHITE,GLOVE), ...arm('R',1,[.15,.8,0],[.27,.52,.07],WHITE,WHITE,GLOVE) ],
      springs:{ head:{f:-.03,s:.03,k:90,c:9,lim:.15}, leaves:{f:-.12,s:.12,k:55,c:5,lim:.4}, stem:{f:-.2,s:.2,k:40,c:4,lim:.6} },
      pose:(c)=>{ RIGNPC.walk(c,{legs:[],arm:.5,bob:.03,rock:.05}); c.B.head.rotation.y=c.look; c.B.head.rotation.z=Math.sin(c.st.ph*2)*.03*c.mv; } };
    TOONS.tomato=make(def,{key:'tomato',name:'THE TOMATO',metres:1.6,radius:.32,speed:.45,stride:6.5,at:60},0); }

  // ---- THE CAT IN THE RAINCOAT: a cream face (half-shut eyes, a pink nose) in a yellow hood with a peak, his ears through it on springs, a
  // yellow coat and trousers, black boots; yellow sleeves, cream paws. His things, each its own: the newspaper (two pages on a fold, the page its
  // own bone), under his arm as he walks and opened before him to read when he stops, its page turned now and then; the ink jar in his hand, set
  // down by his foot while he reads
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
        c.read=Math.max(0,Math.min(1,(c.read||0)+(c.still>.4&&!c.sheet&&!c.busy?dt:-dt)*2.5)); const r=c.read*c.read*(3-2*c.read);   // (reading: the paper opened before him, the jar set down)
        RIGNPC.walk(c,{arm:.4,leg:.55,bob:.02,rock:.05}); B.head.rotation.y=c.look*(1-r); B.head.rotation.x=r*.25;
        if(!c.sheet){ B.armL.rotation.x=B.armL.rotation.x*(1-r)-1.05*r; B.armR.rotation.x=B.armR.rotation.x*(1-r)-1.05*r; B.armL.rotation.z=-.2*(1-r)+.32*r; B.armR.rotation.z=.08*(1-r)-.32*r; }   // (the left arm out a little round the paper under it)
        // the paper: under his left arm (folded, along his side), or open before him; its page turned now and then
        const tuck=[-.23,.52,.02], open=[0,.5,.3]; B.paper.position.set(tuck[0]+(open[0]-tuck[0])*r,tuck[1]+(open[1]-tuck[1])*r,tuck[2]+(open[2]-tuck[2])*r);
        B.paper.rotation.set(-.6*r,(Math.PI/2)*(1-r)+.18*r,0); B.page.rotation.y=-Math.PI*(1-r)-.36*r;
        if(c.sheet){ B.paper.rotation.set(0,.18,0); B.page.rotation.y=-.36; B.paper.position.set(0,.6,.27); }
        if(r>.9&&(c.turnT=(c.turnT??5)-dt)<=0){ c.turnT=4+Math.random()*5; c.kick('page','w',-3); }
        // the ink jar: in his right hand, or on the ground by his foot
        c.at('armR',[.2,.38,.05],V); V.y-=.11; const g=[.25,0,.16]; B.jar.position.set(V.x+(g[0]-V.x)*r,V.y+(g[1]-V.y)*r,V.z+(g[2]-V.z)*r);
        if(c.extra)c.extra(c,dt,r); } };   // (c.extra: what his newsstand has him do: newsstand.js)
    TOONS.cat=make(def,{key:'raincat',name:'THE CAT IN THE RAINCOAT',metres:1.1,radius:.25,speed:.32,stride:8,at:66},1); }

  // ---- THE TV CAT: an orange television on four furry legs, a cat's ears on its lid, its handle, the screen its face (glowing a little: white
  // eyes, a red moustache; it blinks), a dial and two knobs; its cable trailing behind on springs. He trots
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
        else{ B.legFL.rotation.x=B.legBR.rotation.x=-sw*.6; B.legFR.rotation.x=B.legBL.rotation.x=sw*.6; }   // (the trot: the diagonals together)
        B.body.position.y+=Math.abs(Math.cos(ph))*.015*m; B.body.rotation.z=Math.sin(ph*2)*.02*m; B.body.rotation.y=c.look*.4;
        B.cab1.rotation.y=Math.sin(ph)*.1*m; B.cab2.rotation.y=Math.sin(ph-1)*.12*m;   // (the cable wags as he trots)
        if((c.blink=(c.blink??3)-dt)<0){ B.eyes.scale.y=.1; if(c.blink<-.12)c.blink=2+Math.random()*4; } } };
    TOONS.tv=make(def,{key:'tvcat',name:'THE TV CAT',metres:.62,radius:.32,speed:.5,stride:10,eyeC:'.2,.27,.3',at:76},2); }

  // ---- THE FROG ON HIS SCOOTER: a green frog in a white helmet with its two pods, big black eyes, an orange scarf and cape on springs, orange
  // sleeves, his gloved hands on the bars; the scooter his own: a white egg of a body, the headlight, the bars, the fork on its spring with the
  // front wheel, the rear axle's two wheels (they turn as he rolls), a box on the rack (it jiggles). He leans into his turns, bounces over the street
  { const GRN=[.45,.52,.3], HEL=[.92,.9,.83], ORA=[.85,.5,.22], ORA2=[.68,.37,.15], CREAM=[.9,.88,.8], CHROME=[.85,.85,.85], TIRE=[.12,.12,.12], DECK=[.15,.15,.16], CARD=[.86,.8,.66];
    const wheel=(r,w,at)=>[ shape(torus(r*.72,r*.28,4,10),TIRE,at,[1,1,w/r],[0,90,0]), shape(cyl(r*.42,r*.42,w*.9,8),CHROME,at,null,[0,0,90]) ];
    const def={ bones:[['root',null,[0,0,0]],['scooter','root',[0,.15,0]],['fork','scooter',[0,.56,.3]],['wheelF','fork',[0,.17,.38]],['wheelR','scooter',[0,.13,-.24]],['box','scooter',[0,.36,-.38]],
        ['frog','scooter',[0,.62,-.02]],['head','frog',[0,.88,0]],['armL','frog',[-.16,.82,-.02]],['armR','frog',[.16,.82,-.02]],['cape1','frog',[0,.87,-.12]],['cape2','cape1',[0,.64,-.24]]],
      parts:[ part('eyes',0,'head',[-1,1].map(sx=>shape(sph(.055,6,4),BLACK,[sx*.1,1.0,.13]))),
        part('head',2,'head',[ shape(sph(.18,10,7),GRN,[0,.95,.07],[1.05,.72,.95]) ]),
        part('helmet',3,'head',[ shape(new THREE.SphereGeometry(.2,10,5,0,Math.PI*2,0,Math.PI/2),HEL,[0,.99,0],[1,1.05,1.05]), shape(cyl(.205,.205,.035,10),[.82,.8,.72],[0,1.0,0],[1,1,1.05]),
          shape(new THREE.TorusGeometry(.205,.012,4,10,Math.PI),[.82,.8,.72],[0,.99,0],[1,1.05,1.05],[0,90,0]),   // (its rim and the seam over its top)
          ...[-1,1].flatMap(sx=>[ shape(cyl(.06,.06,.07,8),HEL,[sx*.21,.98,.02],null,[0,0,90]), shape(cyl(.035,.035,.075,6),[.8,.45,.2],[sx*.215,.98,.02],null,[0,0,90]) ]) ]),
        part('torso',1,'frog',[ shape(sph(.15,8,6),ORA2,[0,.74,-.02]) ]),
        part('scarf',2,'frog',[ shape(torus(.13,.04,4,10),ORA,[0,.86,0],null,[90,0,0]) ]),
        ...arm('L',-1,[-.16,.82,-.02],[-.2,.72,.2],ORA,GRN,ORA2,.048), ...arm('R',1,[.16,.82,-.02],[.2,.72,.2],ORA,GRN,ORA2,.048),
        part('cape',3,'cape1',[ shape(box(.34,.26,.015),ORA,[0,.75,-.18],null,[-25,0,0]) ]), part('cape tail',3,'cape2',[ shape(box(.36,.22,.015),ORA2,[0,.55,-.28],null,[-12,0,0]) ]),
        part('scooter',1,'scooter',[ shape(sph(.25,10,7),CREAM,[0,.44,.04],[.88,.96,1.2]), shape(box(.42,.04,.56),DECK,[0,.19,-.12]), shape(box(.36,.03,.08),DECK,[0,.32,-.4]),
          flatEye(0,.52,.31,.075,CHROME), flatEye(0,.52,.322,.055,[.95,.93,.75]),   // (the headlight)
          limb([-.22,.66,.24],[.22,.66,.24],.012,.012,CHROME,4), ...[-1,1].map(sx=>limb([sx*.17,.66,.24],[sx*.24,.66,.24],.02,.02,TIRE,6)) ]),
        part('fork',2,'fork',[ ...[-1,1].map(sx=>limb([sx*.04,.52,.32],[sx*.04,.17,.38],.012,.012,CHROME,4)), shape(shell(.13,.13,.08,8,-1.8,3.6),CREAM,[0,.25,.38],null,[0,0,90]) ]),
        part('front wheel',1,'wheelF',wheel(.16,.07,[0,.17,.38])),
        part('rear wheels',1,'wheelR',[ ...[-1,1].flatMap(sx=>wheel(.13,.06,[sx*.21,.13,-.24])), limb([-.21,.13,-.24],[.21,.13,-.24],.012,.012,CHROME,4) ]),
        part('box',2,'box',[ shape(box(.32,.26,.24),CARD,[0,.47,-.4]) ]) ],
      springs:{ head:{f:-.05,s:.06,k:80,c:8,lim:.2}, frog:{f:-.05,s:.04,k:70,c:7,lim:.15}, cape1:{f:.25,s:-.15,k:30,c:4,lim:.7}, cape2:{f:.3,s:-.2,k:24,c:3.5,lim:.8}, box:{f:.06,s:-.05,k:120,c:8,lim:.1} },
      pose:(c,dt,moving)=>{ const B=c.B, m=c.mv;
        B.armL.rotation.x=B.armR.rotation.x=-.05; if(c.sheet){ B.armL.rotation.z=-1.1; B.armR.rotation.z=1.1; }   // (his hands on the bars; spread for his sheet)
        B.scooter.rotation.z=Math.max(-.25,Math.min(.25,-c.turn*c.spd*.25));   // (he leans into his turns)
        B.wheelF.rotation.x=c.dist/(.16*1.12); B.wheelR.rotation.x=c.dist/(.13*1.12);   // (the wheels turn as he rolls)
        // the fork's spring: a bump now and then on the street
        c.fy=c.fy||0; c.fv=c.fv||0; if(moving&&(c.bump=(c.bump??.5)-dt)<=0){ c.bump=.3+Math.random()*.7; c.fv-=.25+Math.random()*.25; c.kick('box','x',1.5); c.kick('frog','x',.6); }
        c.fv+=(-300*c.fy-14*c.fv)*dt; c.fy+=c.fv*dt; if(!moving&&Math.abs(c.fy)<.0005&&Math.abs(c.fv)<.005)c.fy=c.fv=0; B.fork.position.y+=c.fy; B.scooter.position.y+=c.fy*.4;
        B.cape1.rotation.x=.5*Math.min(1,c.spd*2)+Math.sin(c.t*11)*.06*m; B.cape2.rotation.x=.3*Math.min(1,c.spd*2)+Math.sin(c.t*13+1)*.1*m;   // (the wind of his going lifts the cape)
        B.head.rotation.y=c.sheet?0:c.look; } };
    TOONS.frog=make(def,{key:'scooterfrog',name:'THE FROG ON HIS SCOOTER',metres:1.15,radius:.4,speed:1.1,stride:4,at:80},3); }

  // ---- THE SHARK: a man in a shark's hood (teal, its fin up on a spring, a yellow eye each side, the jaw open with its teeth; now and then it
  // snaps), a khaki trench coat (a belt; its skirt on a spring), khaki sleeves, teal gloves, grey trousers, brown shoes
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
        if((c.snap=(c.snap??6)-dt)<.5){ B.jaw.rotation.x=Math.sin(Math.max(0,c.snap)/.5*Math.PI)*.35; if(c.snap<0)c.snap=6+Math.random()*8; } else B.jaw.rotation.x=.08;   // (now and then the jaw snaps)
        if(c.sheet)B.jaw.rotation.x=.2; } };
    TOONS.shark=make(def,{key:'shark',name:'THE SHARK',metres:1.85,radius:.3,speed:.42,stride:6,at:84},4); }
  window.TOONSDBG=()=>Object.fromEntries(Object.entries(TOONS).map(([k,N])=>[k,{key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),tris:N.tris,vis:N.g.visible}])); }
