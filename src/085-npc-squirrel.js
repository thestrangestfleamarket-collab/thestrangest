const SQUIRREL={}; window.SQUIRREL=SQUIRREL;
{ const {shape,limb,sph,cyl,box,blob}=PARTSNPC.T, part=(name,rank,bone,of)=>({name,rank,bone,of});
  const FUR=[.52,.41,.32], FUR2=[.62,.5,.38], CREAM=[.88,.82,.7], STEEL=[.55,.59,.66], STEEL2=[.4,.43,.5], DARK=[.08,.08,.1], RED=[.78,.14,.12], LEATH=[.42,.27,.16], GOLD=[.86,.68,.26], BLACK=[0,0,0], PINK=[.42,.26,.26];
  const def={ bones:[['root',null,[0,0,0]],['hips','root',[0,.36,0]],['head','hips',[0,.66,0]],['visor','head',[0,.8,.02]],['plume','head',[0,.92,-.02]],
      ['armL','hips',[-.16,.56,0]],['armR','hips',[.16,.56,0]],['legL','hips',[-.08,.3,0]],['legR','hips',[.08,.3,0]],
      ['tail1','hips',[0,.3,-.13]],['tail2','tail1',[0,.48,-.27]],['tail3','tail2',[0,.74,-.27]]],
    parts:[
      part('eyes',0,'head',[-1,1].map(sx=>shape(cyl(.022,.022,.02,8),BLACK,[sx*.055,.75,.115],null,[90,0,0]))),
      part('head',2,'head',[ shape(blob(.13,.12,.12,10,7),FUR,[0,.74,0]), shape(blob(.07,.055,.06,8,5),CREAM,[0,.7,.08]) ]),
      part('nose',3,'head',[ shape(sph(.018,5,4),PINK,[0,.715,.14]) ]),
      part('ears',3,'head',[-1,1].map(sx=>shape(cyl(.002,.045,.11,4),FUR,[sx*.085,.96,-.01],[1,1,.6],[0,0,sx*-16]))),
      part('helmet',4,'head',[ shape(sph(.145,10,6,),STEEL,[0,.79,-.005],[1,.9,1.02]), shape(cyl(.15,.15,.025,10),STEEL2,[0,.74,0]) ]),
      part('visor',5,'visor',[ shape(box(.2,.072,.03),STEEL,[0,.785,.135],null,[-8,0,0]), shape(box(.17,.013,.034),DARK,[0,.79,.137],null,[-8,0,0]) ]),
      part('plume',5,'plume',[ shape(blob(.025,.06,.08,6,4),RED,[0,.97,-.03],null,[-20,0,0]), shape(blob(.02,.045,.06,6,4),RED,[0,.96,-.1],null,[-40,0,0]) ]),
      part('body',0,'hips',[ shape(blob(.13,.16,.11,10,7),FUR,[0,.42,0]), shape(blob(.08,.1,.05,8,5),CREAM,[0,.4,.07]) ]),
      part('breastplate',2,'hips',[ shape(blob(.135,.13,.12,10,6),STEEL,[0,.46,.012]), shape(box(.012,.17,.02),STEEL2,[0,.47,.13]) ]),
      part('pauldrons',3,'hips',[-1,1].map(sx=>shape(blob(.06,.04,.06,8,5),STEEL2,[sx*.14,.565,0]))),
      part('belt',3,'hips',[ shape(cyl(.122,.128,.035,10),LEATH,[0,.34,.005]), shape(box(.035,.03,.012),GOLD,[0,.34,.13]) ]),
      ...[['L',-1],['R',1]].flatMap(([s,sx])=>[ part('arm '+s,1,'arm'+s,[ limb([sx*.15,.56,0],[sx*.19,.38,.03],.035,.03,FUR,6) ]), part('paw '+s,2,'arm'+s,[ shape(blob(.032,.035,.03,6,4),FUR2,[sx*.195,.355,.035]) ]) ]),
      part('sword',2,'armR',[ shape(box(.022,.02,.075),LEATH,[.195,.355,.05]), shape(box(.11,.018,.018),GOLD,[.195,.355,.1]), shape(sph(.016,5,4),GOLD,[.195,.355,.002]),
        shape(box(.03,.008,.32),[.86,.88,.92],[.195,.355,.27]), shape(cyl(.0,.015,.035,4),[.86,.88,.92],[.195,.355,.445],[1,1,.4],[90,0,0]) ]),
      ...[['L',-1],['R',1]].flatMap(([s,sx])=>[ part('leg '+s,0,'leg'+s,[ shape(blob(.065,.11,.075,8,5),FUR,[sx*.085,.17,0]) ]), part('foot '+s,1,'leg'+s,[ shape(blob(.05,.035,.08,6,4),FUR2,[sx*.09,.04,.045]) ]) ]),
      part('tail',1,'tail1',[ shape(blob(.1,.15,.1,8,6),FUR,[0,.38,-.19],null,[-35,0,0]) ]),
      part('tail mid',1,'tail2',[ shape(blob(.12,.17,.11,8,6),FUR,[0,.6,-.29],null,[5,0,0]) ]),
      part('tail tip',2,'tail3',[ shape(blob(.12,.1,.12,8,6),FUR2,[0,.8,-.22],null,[40,0,0]) ]) ],
    springs:{ tail1:{f:-.12,s:.12,k:40,c:5,lim:.35}, tail2:{f:-.18,s:.16,k:30,c:4,lim:.45}, tail3:{f:-.24,s:.2,k:24,c:3.4,lim:.6}, plume:{f:-.2,s:.2,y:.2,k:45,c:4,lim:.5}, head:{f:-.03,s:.03,k:90,c:9,lim:.1} },
    pose:(c,dt)=>{ const B=c.B; RIGNPC.walk(c,{arm:.4,leg:.5,bob:.02,rock:.05}); B.head.rotation.y=c.look;
      if(c.sheet)return;
      B.armR.rotation.x=-1.15+.05*Math.sin(c.t*1.3); B.armR.rotation.z=.12; B.armL.rotation.z=-.15;
      c.vT=(c.vT??6)-dt; if(c.vT<0){ c.up=!c.up; c.vT=c.up?2.5+Math.random()*2:7+Math.random()*9; } c.vis=(c.vis||0)+((c.up?1:0)-(c.vis||0))*Math.min(1,dt*6); B.visor.rotation.x=-1.2*c.vis; } };
  const S=GTOWER.site(), at=S?{x:S.x-.25*TILE,z:S.z-.35*TILE}:{x:BOD.XS(PARK.x0+4),z:BOD.ZS(PARK.y0+4)}, onRoof=(x,z)=>S&&Math.abs(x-S.x)<S.w/2&&Math.abs(z-S.z)<S.d/2;
  const N=RIGNPC.make(def,{key:'squirrel',name:'THE SQUIRREL KNIGHT',eye:0,eyeC:'0.,0.,0.',metres:.55,radius:.18,speed:.3,stride:7,lv:'up',group:'bodega',x:at.x,z:at.z,
    ground:(x,z)=>onRoof(x,z)?S.top:MODS.bodega.ground(x,z),
    brain:(dt,you,st,N)=>{ if(N.sheet)return; st.to=null; st.hold=true; st.x=at.x; st.z=at.z;
      if((N.turnT=(N.turnT??3)-dt)<=0){ N.turnT=6+Math.random()*9; N.faceA=[Math.PI,Math.PI,Math.PI*.75,-Math.PI*.75,Math.PI/2,-Math.PI/2,0][Math.floor(Math.random()*7)]+(Math.random()-.5)*.4; }
      const a=N.faceA??Math.PI; st.face={x:st.x+Math.sin(a),z:st.z+Math.cos(a)}; }});
  N.st.hold=true; N.free=()=>true; SQUIRREL.N=N; SQUIRREL.cam=()=>cam; window.SQDBG=()=>({x:N.st.x,z:N.st.z,y:N.g.position.y,vis:N.g.visible,tris:N.tris,top:S&&S.top}); }
