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
    pose:(c,dt)=>{ const B=c.B, k=A.k=(A.k||0)+((A.act?1:0)-(A.k||0))*Math.min(1,dt*7), w=A.act==='wave'?1:0; A.wk=(A.wk||0)+(w-(A.wk||0))*Math.min(1,dt*8);
      RIGNPC.walk(c,{arm:.4,leg:.5,bob:.02,rock:.05}); B.head.rotation.y=c.look;
      if(c.sheet)return;
      B.armR.rotation.x=-1.15+.05*Math.sin(c.t*1.3); B.armR.rotation.z=.12; B.armL.rotation.z=-.15;
      const t=A.t||0, sc=A.act==='scan'?k:0, sa=A.act==='salute'?k:0;
      if(sc){ B.armL.rotation.x=-2.55*sc; B.armL.rotation.z=-.15+.6*sc; B.head.rotation.y=Math.sin(t*.7)*.9*sc+c.look*(1-sc); B.head.rotation.x=-.08*sc; B.hips.rotation.x=.08*sc; }
      if(sa){ const u=t<.25?t/.25:t<1.4?1:Math.max(0,1-(t-1.4)/.3); B.armL.rotation.x=-2.3*u*sa; B.armL.rotation.z=-.15+.85*u*sa; B.armR.rotation.x-=.35*u*sa; B.hips.position.y+=.012*u*sa; B.head.rotation.y*=1-u; }
      if(A.wk>.01){ const q=A.wk; B.armL.rotation.x=-.3*q; B.armL.rotation.z=-.15-2.45*q+Math.sin(c.t*11)*.35*q; B.head.rotation.z=.12*q; B.head.rotation.y*=1-q; }
      c.vT=(c.vT??6)-dt; if(c.vT<0){ c.up=!c.up; c.vT=c.up?2.5+Math.random()*2:7+Math.random()*9; } if(A.act==='wave'||A.act==='scan')c.up=true; c.vis=(c.vis||0)+((c.up?1:0)-(c.vis||0))*Math.min(1,dt*6); B.visor.rotation.x=-1.2*c.vis; } };
  const A={act:'',t:0}, G=GTOWER.ring(), S=GTOWER.site(), PI=Math.PI;
  const RR=G?G.RI-.36:0, rp=a=>({x:G.X(G.cx+Math.cos(a)*RR),z:G.Z(G.cy+Math.sin(a)*RR)}), angOf=(x,z)=>Math.atan2((z-G.Z(G.cy))/TILE,(x-G.X(G.cx))/TILE), wrap=a=>((a+PI*3)%(PI*2))-PI;
  const LOOK=[-PI/3,0,PI/4,PI/2,PI*.75,PI], at=G?rp(LOOK[3]):{x:BOD.XS(PARK.x0+4),z:BOD.ZS(PARK.y0+4)}, onRoof=(x,z)=>S&&Math.hypot(x-S.x,z-S.z)<S.r;
  const near=a=>Math.abs(wrap(a-G.TA))<.75, ACTS=['scan','scan','salute','look','flick'];
  const N=RIGNPC.make(def,{key:'squirrel',name:'THE SQUIRREL KNIGHT',eye:0,eyeC:'0.,0.,0.',metres:.55,radius:.18,speed:.3,stride:7,lv:'up',group:'bodega',x:at.x,z:at.z,
    ground:(x,z)=>onRoof(x,z)?S.top:MODS.bodega.ground(x,z),
    brain:(dt,you,s,N)=>{ if(N.sheet||!G)return; s.hold=true; A.t+=dt; N.li=N.li??3; N.mode=N.mode||'post'; N.tT=N.tT??6;
      const waving=st.up?.name==='wave'&&LVL==='up'&&Math.hypot(you.x-s.x,you.z-s.z)<25*TILE;
      if(waving){ if(N.mode!=='wave'){ N.prev=N.mode==='walk'?'walk':'post'; N.mode='wave'; } N.wT=1.6; }
      if(N.mode==='wave'){ s.to=null; s.face={x:you.x,z:you.z}; if(A.act!=='wave'){ A.act='wave'; A.t=0; } if((N.wT-=dt)<=0){ N.mode=N.prev||'post'; A.act=''; N.tT=2+Math.random()*3; } return; }
      if(N.mode==='walk'){ A.act=''; const ca=angOf(s.x,s.z), ta=LOOK[N.li], d=wrap(ta-ca), dir=N.dir||Math.sign(d)||1;
        if(Math.abs(d)<.06){ N.mode='post'; N.tT=6+Math.random()*8; A.act=''; A.t=0; N.aT=1+Math.random()*2; s.to=null; }
        else s.to=rp(ca+dir*Math.min(.3,Math.abs(d))); return; }
      s.to=null; const a=LOOK[N.li]; s.face={x:s.x+Math.cos(a)*TILE*5,z:s.z+Math.sin(a)*TILE*5};
      if((N.aT=(N.aT??2)-dt)<=0){ const n=A.act?'':ACTS[Math.floor(Math.random()*ACTS.length)]; A.act=n==='look'||n==='flick'?'':n; A.t=0; N.aT=A.act==='scan'?4+Math.random()*3:A.act==='salute'?1.9:1.5+Math.random()*2.5;
        if(n==='flick'||Math.random()<.3){ N.rig.kick('tail2','x',-6); N.rig.kick('tail3','x',-9); N.rig.kick('tail3','z',(Math.random()-.5)*8); } }
      if((N.tT-=dt)<=0&&!A.act){ const step=Math.random()<.5?1:-1; let li=(N.li+step+LOOK.length)%LOOK.length; const ca=angOf(s.x,s.z);
        const d=wrap(LOOK[li]-ca); N.dir=Math.sign(d)||1; if([.25,.5,.75].some(f=>near(ca+d*f)))N.dir=-N.dir; N.li=li; N.mode='walk'; } }});
  N.st.hold=true; N.free=()=>true; SQUIRREL.N=N; SQUIRREL.A=A; SQUIRREL.cam=()=>cam; window.SQDBG=()=>({x:N.st.x,z:N.st.z,y:N.g.position.y,vis:N.g.visible,tris:N.tris,top:S&&S.top,mode:N.mode,act:A.act,li:N.li,tower:GTOWER.tris}); }
