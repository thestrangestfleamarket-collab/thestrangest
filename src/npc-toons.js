// ---- THE TOMATO AND HIS FRIENDS (owner, 17 Oct 2026, his pictures: a tomato-headed mascot in a yellow apron, "simple graphics, like the
// character on right (the old game's deer), a little more complex but not much", his pick the third mockup; then a grumpy cat in a yellow
// raincoat reading the paper by his ink jar, a rusty orange TV set with cat ears on furry legs, a frog in a riveted helmet and an orange cape on
// a white scooter, a man in a shark's hood and a trench coat: "lets do the same thing with them. simpel designed characters. each part its own
// so it can be animated. give it physics and animations for walking, each item separate thing (newspaper, motorcycle) use same style as the
// tomato guy"): each built here in plain shapes, every part on a bone of its own (npc-rig.js), the things they carry their own parts on their
// own bones (the newspaper and its page, the ink jar, the scooter, its fork, its wheels, the box on its rack, the TV's cable); the springs give
// what hangs or stands its swing. They walk the whole street (every new character does: owner, 17 Oct 2026). ?toonhold=1 stands them in a row ----
const TOONS={};
{ const {shape,limb,sph,cyl,box,torus,blob,shell,noise}=PARTSNPC.T;
  const part=(name,rank,bone,of)=>({name,rank,bone,of}), BLACK=[0,0,0], WHITE=[.96,.95,.9];
  const make=(def,o,i)=>RIGNPC.make(def,Object.assign({eye:0,eyeC:'0.,0.,0.',stride:6},PARTSNPC.street(o.at,-70),o,RIGNPC.hold(i)));

  // ---- THE TOMATO: a big ball of a head with freckles, seven leaves and a curled stem on springs, bulging eyes, a black lip; a red body, the
  // yellow apron and its bib, white arms and gloves, white shoes. Some 2,100 triangles
  { const RED=[.86,.16,.1], RED2=[.7,.11,.07], LEAF=[.36,.6,.24], LEAF2=[.27,.48,.18], STEM=[.42,.62,.3], YEL=[.96,.82,.36], YEL2=[.86,.7,.28], GOLD=[.98,.66,.2], GLOVE=[.88,.87,.82];
    const HY=1.2, HR=.32, TOP=HY+HR*.9;
    const freckle=(x,y,z)=>noise(x,y,z,38)>.78&&y<HY+.18?GOLD:RED;
    const leaves=Array.from({length:7},(_,i)=>{ const a=i/7*Math.PI*2+.3, r=.13; return shape(blob(.16,.018,.075,8,4),i%2?LEAF2:LEAF,[Math.cos(a)*r,TOP-.03,-Math.sin(a)*r],null,[0,a*180/Math.PI,-14]); });
    const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.5,0]],['head','hips',[0,.9,0]],['leaves','head',[0,TOP-.03,0]],['stem','leaves',[0,TOP,0]],
        ['apron','hips',[0,.74,.2]],['armL','hips',[-.18,.8,0]],['armR','hips',[.18,.8,0]],['footL','root',[-.1,.04,.06]],['footR','root',[.1,.04,.06]]],
      parts:[ part('face',0,'head',[ ...[-1,1].map(sx=>shape(blob(.042,.048,.02,8,6),BLACK,[sx*.1+.012,HY+.04,HR-.003])), shape(blob(.075,.016,.02,10,4),BLACK,[.02,HY-.12,HR-.035]), shape(sph(.01,4,3),BLACK,[-.01,HY-.04,HR-.01]) ]),
        part('head',2,'head',[ shape(blob(HR,HR*.9,HR*.97,16,12),freckle,[0,HY,0]) ]),
        part('eye whites',3,'head',[-1,1].map(sx=>shape(blob(.085,.1,.045,12,8),WHITE,[sx*.1,HY+.05,HR-.045]))),
        part('leaves',3,'leaves',leaves),
        part('stem',3,'stem',[ limb([0,TOP-.02,0],[.01,TOP+.14,0],.034,.026,STEM,6), limb([.01,TOP+.14,0],[.06,TOP+.19,0],.026,.022,STEM,6), limb([.06,TOP+.19,0],[.1,TOP+.17,0],.022,.016,STEM,6) ]),
        part('body',0,'hips',[ shape(cyl(.17,.27,.8,14),RED2,[0,.46,0]), shape(cyl(.14,.17,.1,12),RED,[0,.88,0]) ]),
        part('bib',1,'hips',[ shape(box(.2,.17,.02),YEL,[0,.83,.15],null,[-6,0,0]), shape(box(.38,.03,.02),YEL2,[0,.73,0]) ]),
        part('strap',2,'hips',[-1,1].map(sx=>limb([sx*.09,.91,.15],[sx*.05,1.0,.05],.012,.012,YEL2,4))),
        part('apron',1,'apron',[ shape(shell(.2,.31,.7,14,-1.1,2.2),YEL,[0,.38,.012]), shape(box(.13,.1,.01),YEL2,[.06,.42,.268],null,[-7,0,0]) ]),
        ...[['L',-1],['R',1]].flatMap(([s,sx])=>[ part('arm '+s,1,'arm'+s,[ limb([sx*.18,.8,0],[sx*.27,.52,.07],.045,.04,WHITE,6) ]),
          part('glove '+s,2,'arm'+s,[ shape(blob(.058,.068,.05,8,6),WHITE,[sx*.28,.46,.08]), shape(blob(.02,.035,.02,6,4),WHITE,[sx*.25,.48,.12],null,[0,0,sx*30]), shape(cyl(.05,.05,.03,8),GLOVE,[sx*.275,.53,.075]) ]),
          part('shoe '+s,1,'foot'+s,[ shape(blob(.075,.045,.11,10,6),WHITE,[sx*.1,.035,.07]) ]) ]) ],
      springs:{ head:{f:-.03,s:.03,k:90,c:9,lim:.15}, leaves:{f:-.12,s:.12,k:55,c:5,lim:.4}, stem:{f:-.2,s:.2,k:40,c:4,lim:.6}, apron:{f:.1,s:-.06,k:45,c:6,lim:.4} },
      pose:(c,dt)=>{ const B=c.B, ph=c.st.ph, m=c.mv; RIGNPC.walk(c,{legs:[],arms:['armL','armR'],arm:.5,bob:.03,rock:.05});
        if(!c.sheet){ B.footL.position.z+=Math.sin(ph)*.08*m; B.footR.position.z-=Math.sin(ph)*.08*m; B.footL.position.y+=Math.max(0,Math.cos(ph))*.03*m; B.footR.position.y+=Math.max(0,-Math.cos(ph))*.03*m; }
        else{ B.footL.position.x-=.04; B.footR.position.x+=.04; }
        B.head.rotation.y=c.look; B.head.rotation.z=Math.sin(ph*2)*.03*m; } };
    TOONS.tomato=make(def,{key:'tomato',name:'THE TOMATO',metres:1.6,radius:.32,speed:.45,stride:6.5,at:60},0); }

  // ---- THE CAT IN THE RAINCOAT: a grumpy cream cat (half-shut eyes, a pink nose, whiskers) in a peaked yellow hood, his ears through it on
  // springs, a yellow coat and trousers, black boots. His things, each its own: the newspaper (two pages on a fold, the page its own bone),
  // under his arm as he walks and opened before him to read when he stops; the ink jar in his hand, set down by his foot while he reads.
  // Some 2,300 triangles
  { const YEL=[.95,.78,.16], YEL2=[.82,.64,.1], FUR=[.92,.86,.68], FUR2=[.8,.72,.52], PINK=[.9,.6,.55], BOOT=[.12,.11,.1], PAPER=[.88,.86,.8], INK=[.95,.92,.82], LID=[.15,.15,.17];
    const print=(x,y,z)=>{ const r=Math.floor((y-.4)*90); return y>.735?[.75,.2,.18]:r%2?[.55,.55,.53]:PAPER; };   // (a red masthead, the columns' lines)
    const label=(x,y,z)=>y>.05&&y<.075&&x>0?[.8,.2,.16]:INK;
    const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.42,0]],['head','hips',[0,.7,0]],['earL','head',[-.14,.98,-.02]],['earR','head',[.14,.98,-.02]],
        ['armL','hips',[-.17,.66,0]],['armR','hips',[.17,.66,0]],['legL','hips',[-.08,.38,0]],['legR','hips',[.08,.38,0]],
        ['paper','root',[0,.6,.22]],['page','paper',[0,.6,.22]],['jar','root',[.22,0,.1]]],
      parts:[ part('eyes',0,'head',[-1,1].map(sx=>shape(blob(.032,.02,.012,8,5),BLACK,[sx*.065,.86,.165]))),
        part('face',2,'head',[ shape(blob(.15,.13,.11,14,10),FUR,[0,.85,.07]), shape(blob(.06,.04,.04,8,6),FUR2,[0,.79,.16]) ]),
        part('lids',3,'head',[-1,1].map(sx=>shape(blob(.04,.022,.016,8,5),FUR2,[sx*.065,.878,.163],null,[0,0,sx*-12]))),
        part('nose',3,'head',[ shape(blob(.02,.015,.015,6,4),PINK,[0,.81,.19]), shape(box(.03,.006,.01),FUR2,[0,.775,.185]) ]),
        part('whiskers',3,'head',[-1,1].flatMap(sx=>[-1,0,1].map(k=>shape(box(.12,.004,.004),WHITE,[sx*.12,.79+k*.012,.15],null,[0,sx*-15,sx*k*8])))),
        part('hood',4,'head',[ shape(blob(.2,.19,.18,14,10),YEL,[0,.88,-.01]), shape(torus(.135,.03,6,16),YEL,[0,.86,.11],[1,1.05,1]), shape(cyl(.002,.05,.14,4),YEL2,[0,1.06,.0],[2.6,1,1],[-30,0,0]) ]),   // (the hood, its rim round his face, its peak)
        ...[['L',-1],['R',1]].map(([s,sx])=>part('ear '+s,3,'ear'+s,[ shape(cyl(.002,.065,.14,4),FUR,[sx*.17,1.02,-.03],[1,1,.45],[0,0,sx*-35]) ])),
        part('coat',1,'hips',[ shape(cyl(.15,.24,.38,14),YEL,[0,.5,0]), shape(cyl(.13,.16,.08,12),YEL2,[0,.71,0]), ...[.6,.5,.4].map(y=>shape(sph(.012,4,3),YEL2,[0,y,.205])) ]),
        ...[['L',-1],['R',1]].flatMap(([s,sx])=>[ part('sleeve '+s,2,'arm'+s,[ limb([sx*.17,.66,0],[sx*.2,.42,.04],.055,.06,YEL,8), shape(cyl(.065,.065,.04,8),YEL2,[sx*.2,.43,.04]) ]),
          part('paw '+s,3,'arm'+s,[ shape(blob(.045,.05,.045,8,6),FUR,[sx*.2,.38,.05]) ]),
          part('leg '+s,0,'leg'+s,[ limb([sx*.08,.38,0],[sx*.08,.08,.01],.065,.07,YEL,8) ]),
          part('boot '+s,1,'leg'+s,[ shape(blob(.07,.06,.1,8,6),BOOT,[sx*.08,.05,.04]) ]) ]),
        part('newspaper',2,'paper',[ shape(box(.22,.3,.006),print,[-.11,.6,.22]) ]), part('page',2,'page',[ shape(box(.22,.3,.006),print,[.11,.6,.22]) ]),
        part('ink jar',1,'jar',[ shape(cyl(.04,.04,.09,10),label,[.22,.045,.1]), shape(cyl(.037,.037,.025,10),LID,[.22,.1,.1]) ]) ],
      springs:{ earL:{f:-.15,s:.12,k:70,c:6,lim:.4}, earR:{f:-.15,s:.12,k:70,c:6,lim:.4}, head:{f:-.04,s:.04,k:90,c:9,lim:.12}, page:{y:.3,k:30,c:3,lim:.5} },
      pose:(c,dt,moving)=>{ const B=c.B, V=c.v||(c.v=new THREE.Vector3()), Q=c.q||(c.q=new THREE.Quaternion()), E=c.e||(c.e=new THREE.Euler());
        c.read=Math.max(0,Math.min(1,(c.read||0)+(c.still>.4&&!c.sheet?dt:-dt)*2.5)); const r=c.read*c.read*(3-2*c.read);   // (reading: the paper opened before him, the jar set down)
        RIGNPC.walk(c,{arm:.4,leg:.55,bob:.02,rock:.05}); B.head.rotation.y=c.look*(1-r); B.head.rotation.x=r*.25;
        if(!c.sheet){ B.armL.rotation.x=B.armL.rotation.x*(1-r)-1.05*r; B.armR.rotation.x=B.armR.rotation.x*(1-r)-1.05*r; B.armL.rotation.z=-.2*(1-r)+.32*r; B.armR.rotation.z=.08*(1-r)-.32*r; }   // (the left arm out a little round the paper under it)
        // the paper: under his left arm (folded, along his side), or open before him; its page turned now and then
        const tuck=[-.23,.52,.02], open=[0,.5,.3]; B.paper.position.set(tuck[0]+(open[0]-tuck[0])*r,tuck[1]+(open[1]-tuck[1])*r,tuck[2]+(open[2]-tuck[2])*r);
        B.paper.rotation.set(-.6*r,(Math.PI/2)*(1-r)+.18*r,0); B.page.rotation.y=-Math.PI*(1-r)-.36*r;
        if(c.sheet){ B.paper.rotation.set(0,.18,0); B.page.rotation.y=-.36; B.paper.position.set(0,.6,.34); }
        if(r>.9&&(c.turnT=(c.turnT??5)-dt)<=0){ c.turnT=4+Math.random()*5; c.kick('page','w',-3); }
        // the ink jar: in his right hand, or on the ground by his foot
        c.at('armR',[.2,.37,.05],V); V.y-=.11; const g=[.25,0,.16]; B.jar.position.set(V.x+(g[0]-V.x)*r,V.y+(g[1]-V.y)*r,V.z+(g[2]-V.z)*r); } };
    TOONS.cat=make(def,{key:'raincat',name:'THE CAT IN THE RAINCOAT',metres:1.1,radius:.25,speed:.32,stride:8,at:66},1); }

  // ---- THE TV CAT: a rusty orange television on four furry legs, a cat's ears on its lid with silver rivets, its carrying handle, the screen
  // its face (glowing a little, a cat's face on it: white eyes with red round them, a nose, a red moustache; it blinks), knobs, a dial, a
  // grille; its cable trailing behind on springs. He trots. Some 1,700 triangles
  { const ORA=[.84,.47,.32], ORA2=[.7,.36,.24], FUR=[.74,.53,.3], FUR2=[.62,.42,.22], CHROME=[.82,.82,.8], DARK=[.1,.1,.11], SCREEN=[.2,.24,.27];
    const rust=(x,y,z)=>{ const v=noise(x,y,z,30); return v>.8?ORA2:v<.12?[.9,.58,.42]:ORA; };
    const CAB=[[-.25,.3,-.02],[-.34,.14,-.08],[-.4,.03,-.24],[-.42,.02,-.46],[-.44,.02,-.7]];
    const def={ bones:[['root',null,[0,0,0]],['body','root',[0,.2,0]],['eyes','body',[0,.37,.18]],['legFL','root',[-.15,.22,.1]],['legFR','root',[.15,.22,.1]],['legBL','root',[-.15,.22,-.1]],['legBR','root',[.15,.22,-.1]],
        ['cab0','body',CAB[0]],['cab1','cab0',CAB[1]],['cab2','cab1',CAB[2]],['cab3','cab2',CAB[3]]],
      parts:[ part('screen',0,'body',[ shape(box(.26,.2,.01),SCREEN,[.05,.37,.172]) ]),
        part('box',2,'body',[ shape(box(.5,.34,.34),rust,[0,.38,0]), shape(box(.3,.24,.02),DARK,[.05,.37,.166]), shape(box(.48,.04,.32),ORA2,[0,.215,0]) ]),
        part('face',3,'eyes',[ ...[-1,1].flatMap(sx=>[shape(cyl(.028,.028,.01,10),WHITE,[.05+sx*.06,.39,.18],null,[90,0,0]), shape(cyl(.036,.036,.008,10),[.75,.18,.15],[.05+sx*.06,.395,.177],null,[90,0,0])]) ]),
        part('pupils',4,'eyes',[-1,1].map(sx=>shape(cyl(.015,.015,.01,8),BLACK,[.05+sx*.06,.388,.186],null,[90,0,0]))),
        part('nose',3,'body',[ shape(sph(.01,4,3),WHITE,[.05,.355,.18]), ...[-1,1].map(sx=>shape(box(.035,.008,.006),[.75,.18,.15],[.05+sx*.02,.34,.18],null,[0,0,sx*-20])) ]),
        part('ears',3,'body',[-1,1].flatMap(sx=>[ shape(cyl(.002,.13,.2,4),ORA,[sx*.15,.64,.06],[1,1,.35]), shape(sph(.022,6,4),CHROME,[sx*.15,.61,.12]) ])),
        part('handle',3,'body',[ limb([-.16,.55,-.04],[-.14,.6,-.04],.012,.012,ORA2,5), limb([-.14,.6,-.04],[-.02,.6,-.04],.012,.012,ORA2,5), limb([-.02,.6,-.04],[0,.55,-.04],.012,.012,ORA2,5) ]),
        part('knobs',3,'body',[ shape(cyl(.026,.026,.02,10),CHROME,[-.15,.24,.175],null,[90,0,0]), shape(cyl(.02,.02,.04,8),DARK,[.13,.24,.18],null,[90,0,0]), shape(cyl(.02,.02,.04,8),DARK,[.18,.24,.18],null,[90,0,0]), shape(box(.06,.025,.01),DARK,[.01,.25,.172]),
          ...[[-.25,.47,.0],[-.25,.47,-.1],[-.25,.35,.08],[-.25,.25,-.08]].map(p=>shape(sph(.022,6,4),ORA2,p)),   // (the domes on its side)
          ...[.3,.33,.36,.39].map(y=>shape(box(.005,.012,.2),ORA2,[-.252,y,-.03])) ]),   // (its grille)
        ...[['FL',-1,1],['FR',1,1],['BL',-1,-1],['BR',1,-1]].map(([s,sx,sz])=>part('leg '+s,1,'leg'+s,[ shape(blob(.075,.11,.08,8,6),FUR,[sx*.15,.12,sz*.1]), shape(blob(.075,.04,.09,8,5),FUR2,[sx*.15,.03,sz*.1+.02]) ])),
        part('cable',2,'cab0',[ shape(cyl(.018,.018,.04,6),DARK,[-.255,.3,-.02],null,[0,0,90]) ]),
        ...[0,1,2,3].map(i=>part('cable '+i,2,'cab'+i,[ limb(CAB[i],CAB[i+1],.01,.01,DARK,5) ])) ],
      springs:{ body:{f:-.06,s:.05,k:110,c:10,lim:.12}, cab1:{y:.25,k:25,c:4,lim:.5}, cab2:{y:.35,k:20,c:3.5,lim:.6}, cab3:{y:.45,k:16,c:3,lim:.7} },
      pose:(c,dt)=>{ const B=c.B, ph=c.st.ph, m=c.mv, sw=Math.sin(ph)*m;
        if(c.sheet){ B.legFL.rotation.set(.3,0,-.3); B.legFR.rotation.set(.3,0,.3); B.legBL.rotation.set(-.3,0,-.3); B.legBR.rotation.set(-.3,0,.3); }
        else{ B.legFL.rotation.x=B.legBR.rotation.x=-sw*.6; B.legFR.rotation.x=B.legBL.rotation.x=sw*.6; }   // (the trot: the diagonals together)
        B.body.position.y+=Math.abs(Math.cos(ph))*.015*m; B.body.rotation.z=Math.sin(ph*2)*.02*m; B.body.rotation.y=c.look*.4;
        B.cab1.rotation.y=Math.sin(ph)*.1*m; B.cab2.rotation.y=Math.sin(ph-1)*.12*m;   // (the cable wags as he trots)
        if((c.blink=(c.blink??3)-dt)<0){ B.eyes.scale.y=.1; if(c.blink<-.12)c.blink=2+Math.random()*4; } } };
    TOONS.tv=make(def,{key:'tvcat',name:'THE TV CAT',metres:.62,radius:.32,speed:.5,stride:10,eyeC:'.2,.27,.3',at:76},2); }

  // ---- THE FROG ON HIS SCOOTER: a green frog in a white riveted helmet (its pods, his big black eyes), an orange scarf and cape on springs,
  // orange ribbed sleeves, his hands on the bars; the scooter his own: a white egg of a body with rust, the headlight, the bars, the fork on its
  // spring with the front wheel, the rear axle's two wheels (the wheels turn as he rolls), a box on the rack (it jiggles). He leans into his
  // turns, bounces over the street. Some 3,000 triangles
  { const GRN=[.45,.52,.3], GRN2=[.36,.42,.24], HEL=[.92,.9,.83], ORA=[.85,.5,.22], ORA2=[.68,.37,.15], CREAM=[.9,.88,.8], CHROME=[.85,.85,.85], TIRE=[.12,.12,.12], DECK=[.15,.15,.16], CARD=[.86,.8,.66];
    const rivets=(x,y,z)=>noise(x,y,z,45)>.8?[.8,.45,.2]:HEL, rusty=(x,y,z)=>noise(x,y,z,22)>.76?[.6,.35,.2]:CREAM, ribs=(x,y,z)=>Math.floor((x*x+y*y)**.5*70)%2?ORA:ORA2;
    const wheel=(r,w,at)=>[ shape(torus(r*.72,r*.28,6,14),TIRE,at,[1,1,w/r],[0,90,0]), shape(cyl(r*.42,r*.42,w*.9,10),CHROME,at,null,[0,0,90]) ];
    const def={ bones:[['root',null,[0,0,0]],['scooter','root',[0,.15,0]],['fork','scooter',[0,.56,.3]],['wheelF','fork',[0,.17,.38]],['wheelR','scooter',[0,.13,-.24]],['box','scooter',[0,.36,-.38]],
        ['frog','scooter',[0,.62,-.02]],['head','frog',[0,.88,0]],['cape1','frog',[0,.87,-.12]],['cape2','cape1',[0,.64,-.24]]],
      parts:[ part('eyes',0,'head',[-1,1].map(sx=>shape(sph(.055,10,7),BLACK,[sx*.1,1.0,.13]))),
        part('glints',4,'head',[-1,1].map(sx=>shape(sph(.012,4,3),WHITE,[sx*.1+.02,1.025,.18]))),
        part('head',2,'head',[ shape(blob(.2,.13,.17,14,9),GRN,[0,.95,.07]), shape(blob(.17,.05,.12,12,5),GRN2,[0,.88,.09]), shape(blob(.035,.025,.01,6,4),[.75,.55,.45],[-.07,.93,.235]), shape(box(.18,.006,.01),GRN2,[0,.885,.21]) ]),
        part('helmet',3,'head',[ shape(new THREE.SphereGeometry(.21,14,8,0,Math.PI*2,0,Math.PI/2),rivets,[0,1.0,0],[1,.9,1.05]), shape(torus(.2,.02,5,18),HEL,[0,1.0,.0],[1,1.05,1],[90,0,0]),
          ...[-1,1].flatMap(sx=>[ shape(cyl(.06,.06,.07,10),HEL,[sx*.21,.98,.02],null,[0,0,90]), shape(cyl(.035,.035,.075,8),[.8,.45,.2],[sx*.215,.98,.02],null,[0,0,90]) ]) ]),
        part('torso',1,'frog',[ shape(blob(.17,.16,.14,12,8),[.36,.36,.34],[0,.74,-.02]) ]),
        part('scarf',2,'frog',[ shape(torus(.13,.04,6,14),ORA,[0,.86,0],[1,1,1],[90,0,0]) ]),
        ...[['L',-1],['R',1]].flatMap(([s,sx])=>[ part('sleeve '+s,2,'frog',[ limb([sx*.16,.82,-.02],[sx*.2,.72,.1],.05,.045,ribs,8), limb([sx*.2,.72,.1],[sx*.2,.67,.22],.045,.04,ribs,8) ]),
          part('hand '+s,3,'frog',[ shape(blob(.045,.035,.05,8,6),GRN,[sx*.2,.67,.25]) ]) ]),
        part('cape',3,'cape1',[ shape(box(.34,.26,.015),ORA,[0,.75,-.18],null,[-25,0,0]) ]), part('cape tail',3,'cape2',[ shape(box(.36,.22,.015),ORA2,[0,.55,-.28],null,[-12,0,0]) ]),
        part('scooter',1,'scooter',[ shape(blob(.22,.24,.3,14,10),rusty,[0,.44,.04]), shape(box(.42,.04,.56),DECK,[0,.19,-.12]), shape(box(.36,.03,.08),DECK,[0,.32,-.4]),
          shape(cyl(.075,.075,.06,12),CHROME,[0,.52,.3],null,[90,0,0]), shape(cyl(.055,.055,.065,12),[.95,.93,.75],[0,.52,.31],null,[90,0,0]),   // (the headlight)
          limb([-.22,.66,.24],[.22,.66,.24],.012,.012,CHROME,5), ...[-1,1].map(sx=>limb([sx*.17,.66,.24],[sx*.24,.66,.24],.02,.02,TIRE,6)) ]),
        part('fork',2,'fork',[ ...[-1,1].map(sx=>limb([sx*.04,.52,.32],[sx*.04,.17,.38],.012,.012,CHROME,5)), ...[.3,.34,.38,.42].map(y=>shape(torus(.03,.007,4,10),TIRE,[0,y,.36],null,[90,0,0])), shape(shell(.13,.13,.08,10,-1.8,3.6),CREAM,[0,.25,.38],[1,1,1],[0,0,90]) ]),
        part('front wheel',1,'wheelF',wheel(.16,.07,[0,.17,.38])),
        part('rear wheels',1,'wheelR',[ ...[-1,1].flatMap(sx=>wheel(.13,.06,[sx*.21,.13,-.24])), limb([-.21,.13,-.24],[.21,.13,-.24],.012,.012,CHROME,5) ]),
        part('box',2,'box',[ shape(box(.32,.26,.24),CARD,[0,.47,-.4]), shape(box(.33,.04,.25),[.75,.66,.48],[0,.58,-.4]) ]) ],
      springs:{ head:{f:-.05,s:.06,k:80,c:8,lim:.2}, frog:{f:-.05,s:.04,k:70,c:7,lim:.15}, cape1:{f:.25,s:-.15,k:30,c:4,lim:.7}, cape2:{f:.3,s:-.2,k:24,c:3.5,lim:.8}, box:{f:.06,s:-.05,k:120,c:8,lim:.1} },
      pose:(c,dt,moving)=>{ const B=c.B, m=c.mv;
        B.scooter.rotation.z=Math.max(-.25,Math.min(.25,-c.turn*c.spd*.25));   // (he leans into his turns)
        B.wheelF.rotation.x=c.dist/(.16*1.12); B.wheelR.rotation.x=c.dist/(.13*1.12);   // (the wheels turn as he rolls)
        // the fork's spring: a bump now and then on the street
        c.fy=c.fy||0; c.fv=c.fv||0; if(moving&&(c.bump=(c.bump??.5)-dt)<=0){ c.bump=.3+Math.random()*.7; c.fv-=.25+Math.random()*.25; c.kick('box','x',1.5); c.kick('frog','x',.6); }
        c.fv+=(-300*c.fy-14*c.fv)*dt; c.fy+=c.fv*dt; if(!moving&&Math.abs(c.fy)<.0005&&Math.abs(c.fv)<.005)c.fy=c.fv=0; B.fork.position.y+=c.fy; B.scooter.position.y+=c.fy*.4;
        B.cape1.rotation.x=.5*Math.min(1,c.spd*2)+Math.sin(c.t*11)*.06*m; B.cape2.rotation.x=.3*Math.min(1,c.spd*2)+Math.sin(c.t*13+1)*.1*m;   // (the wind of his going lifts the cape)
        B.head.rotation.y=c.look; if(c.sheet)B.head.rotation.y=0; } };
    TOONS.frog=make(def,{key:'frog',name:'THE FROG ON HIS SCOOTER',metres:1.15,radius:.4,speed:1.1,stride:4,at:80},3); }

  // ---- THE SHARK: a man in a shark's hood (teal, speckled, its fin up on a spring, a yellow eye each side, the jaw open with its teeth; now and
  // then it snaps), a khaki trench coat (lapels, a belt, cuffs; its skirt on a spring), teal gloves, grey trousers, brown shoes. Some 2,400 triangles
  { const TEAL=[.22,.5,.5], TEAL2=[.17,.4,.41], BELLY=[.84,.82,.74], COAT=[.73,.68,.48], COAT2=[.6,.55,.37], TROU=[.32,.32,.33], SHOE=[.3,.2,.13], EYE=[.98,.82,.15];
    const speck=(x,y,z)=>noise(x,y,z,60)>.82?[.45,.68,.66]:TEAL;
    const teeth=Array.from({length:9},(_,i)=>{ const u=(i-4)/4, x=u*.14, z=.36-u*u*.1; return shape(cyl(.002,.022,.05,4),WHITE,[x,1.5,z],null,[180,0,0]); });
    const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.95,0]],['head','hips',[0,1.42,0]],['jaw','head',[0,1.5,.05]],['fin','head',[0,1.84,-.05]],
        ['armL','hips',[-.23,1.36,0]],['armR','hips',[.23,1.36,0]],['legL','hips',[-.1,.92,0]],['legR','hips',[.1,.92,0]],['skirt','hips',[0,.95,0]]],
      parts:[ part('mouth',0,'head',[ shape(blob(.13,.05,.2,10,6),BLACK,[0,1.48,.18]) ]),
        part('hood',2,'head',[ shape(blob(.2,.17,.34,16,10),speck,[0,1.6,.12],null,[-10,0,0]), shape(shell(.19,.27,.26,14,Math.PI*.55,Math.PI*.9),speck,[0,1.4,-.02]), shape(blob(.16,.03,.26,12,5),BELLY,[0,1.505,.2]) ]),
        part('teeth',3,'head',teeth),
        part('eyes',3,'head',[-1,1].map(sx=>shape(cyl(.04,.04,.02,10),EYE,[sx*.18,1.66,.2],null,[0,0,90]))), part('pupils',4,'head',[-1,1].map(sx=>shape(cyl(.018,.018,.022,8),BLACK,[sx*.19,1.66,.2],null,[0,0,90]))),
        part('jaw',2,'jaw',[ shape(blob(.15,.06,.27,12,6),BELLY,[0,1.43,.18]), shape(blob(.16,.05,.27,12,6),TEAL2,[0,1.41,.17]) ]),
        part('fin',3,'fin',[ shape(cyl(.002,.12,.3,4),speck,[0,1.95,-.1],[.25,1,1],[-28,0,0]) ]),
        part('coat',1,'hips',[ shape(cyl(.2,.22,.48,14),COAT,[0,1.18,0]), shape(cyl(.15,.2,.06,12),COAT2,[0,1.42,0]), shape(torus(.215,.02,5,16),COAT2,[0,.97,0],null,[90,0,0]), shape(box(.05,.04,.02),[.4,.36,.25],[0,.97,.22]),
          ...[-1,1].map(sx=>shape(box(.08,.22,.02),COAT2,[sx*.06,1.28,.2],null,[0,0,sx*-14])) ]),   // (the collar, the belt and its buckle, the lapels)
        part('skirt',1,'skirt',[ shape(shell(.22,.31,.55,14,.25,Math.PI*2-.5),COAT,[0,.68,0]) ]),
        ...[['L',-1],['R',1]].flatMap(([s,sx])=>[ part('sleeve '+s,2,'arm'+s,[ limb([sx*.23,1.36,0],[sx*.29,.98,.06],.07,.065,COAT,8), shape(cyl(.07,.07,.04,8),COAT2,[sx*.29,1.0,.06]) ]),
          part('glove '+s,3,'arm'+s,[ shape(blob(.05,.07,.05,8,6),TEAL,[sx*.29,.92,.07]), shape(blob(.018,.035,.018,6,4),TEAL,[sx*.26,.94,.1],null,[0,0,sx*30]) ]),
          part('leg '+s,0,'leg'+s,[ limb([sx*.1,.92,0],[sx*.1,.08,0],.08,.065,TROU,8) ]), part('shoe '+s,1,'leg'+s,[ shape(blob(.065,.05,.12,8,6),SHOE,[sx*.1,.05,.04]) ]) ]) ],
      springs:{ fin:{f:-.2,s:.2,k:50,c:5,lim:.4}, skirt:{f:.12,s:-.1,k:40,c:6,lim:.3}, head:{f:-.03,s:.03,k:90,c:9,lim:.12}, jaw:{f:.05,k:60,c:6,lim:.2} },
      pose:(c,dt)=>{ const B=c.B, ph=c.st.ph, m=c.mv; RIGNPC.walk(c,{arm:.35,leg:.45,bob:.035,rock:.03});
        B.skirt.rotation.z=Math.sin(ph)*.05*m; B.head.rotation.y=c.look;
        if((c.snap=(c.snap??6)-dt)<.5){ B.jaw.rotation.x=Math.sin(Math.max(0,c.snap)/.5*Math.PI)*.35; if(c.snap<0)c.snap=6+Math.random()*8; } else B.jaw.rotation.x=.08;   // (now and then the jaw snaps)
        if(c.sheet)B.jaw.rotation.x=.2; } };
    TOONS.shark=make(def,{key:'shark',name:'THE SHARK',metres:1.85,radius:.3,speed:.42,stride:6,at:84},4); }
  window.TOONSDBG=()=>Object.fromEntries(Object.entries(TOONS).map(([k,N])=>[k,{key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),tris:N.tris,vis:N.g.visible}])); }
