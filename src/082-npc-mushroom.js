const MUSH={};
{ const {shape,limb,sph,cyl,box,torus,blob,noise}=PARTSNPC.T;
  const CREAM=[.93,.87,.7], BONE=[.95,.95,.93], TAN=[.76,.6,.36], HAT=[.72,.47,.2], HAT2=[.66,.42,.17], CAP=[.74,.5,.22], RUST=[.74,.42,.14], OLIVE=[.47,.43,.18], ROPE=[.58,.42,.2], BAG=[.7,.53,.3], TRAY=[.68,.44,.19], BLACK=[0,0,0];
  const part=(name,rank,of)=>({name,rank,of});
  const mush=(stems,caps,x,y,z,h,r,cap,lean=[0,0,0])=>{ const st=cyl(r*.3,r*.38,h,6); st.translate(0,h/2,0); const cp=sph(r,8,5); cp.scale(1,.62,1); cp.translate(0,h,0);
    stems.push(shape(st,CREAM,[x,y,z],null,lean)); caps.push(shape(cp,cap,[x,y,z],null,lean)); };
  const mottle=(x,y,z)=>{ const v=noise(x,y,z); return v>.6?OLIVE:v>.5?[.62,.42,.16]:RUST; };
  const hatStems=[], hatCaps=[], trayStems=[], trayCaps=[];
  for(let i=0;i<9;i++){ const a=i/9*Math.PI*2, r=.155, big=i%2===0; mush(hatStems,hatCaps,Math.sin(a)*r,1.605,Math.cos(a)*r,big?.09:.065,big?.045:.035,big?CAP:CREAM,[Math.cos(a)*14,0,-Math.sin(a)*14]); }
  for(let i=0;i<4;i++){ const a=(i+.5)/4*Math.PI*2, r=.095; mush(hatStems,hatCaps,Math.sin(a)*r,1.715,Math.cos(a)*r,.07,.038,i%2?CAP:CREAM,[Math.cos(a)*8,0,-Math.sin(a)*8]); }
  mush(hatStems,hatCaps,0,1.715,0,.14,.11,CAP);
  { let seed=3; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
    for(let i=0;i<13;i++){ const a=rnd()*Math.PI*2, r=.05+rnd()*.15, big=rnd()<.5; mush(trayStems,trayCaps,Math.sin(a)*r,1.0,.33+Math.cos(a)*r,big?.1:.07,big?.045:.032,rnd()<.45?CAP:CREAM,[(rnd()-.5)*20,0,(rnd()-.5)*20]); } }
  const PARTS=[
    part('face',0,[ ...[-1,1].map(sx=>shape(cyl(.042,.042,.03,8),BLACK,[sx*.058,1.42,.136],null,[90,0,0])),
      shape(box(.036,.036,.03),BLACK,[0,1.345,.145],null,[0,0,45]), shape(box(.12,.012,.025),BLACK,[0,1.29,.128]),
      ...[-2,-1,0,1,2].map(i=>shape(box(.01,.032,.025),BLACK,[i*.026,1.29,.128])) ]),
    part('skull',2,[ shape(sph(.155,10,7),BONE,[0,1.38,0],[1,1.1,1]), shape(blob(.11,.06,.09,10,6),BONE,[0,1.27,.02]) ]),
    part('hair',2,[ ...[-1,1].flatMap(sx=>[shape(blob(.06,.27,.12,10,8),TAN,[sx*.19,1.17,-.03],null,[0,0,sx*-6]),shape(blob(.045,.2,.08,8,6),TAN,[sx*.24,.98,0],null,[0,0,sx*-10]),shape(blob(.05,.14,.09,8,6),TAN,[sx*.2,1.35,-.1],null,[0,0,sx*-14])]),
      shape(blob(.17,.28,.08,12,8),TAN,[0,1.17,-.15]), shape(blob(.11,.17,.06,10,6),TAN,[0,.92,-.15]) ]),
    part('hat',2,[ shape(cyl(.21,.23,.08,14),HAT,[0,1.565,0]), shape(cyl(.15,.17,.11,12),HAT2,[0,1.66,0]) ]),
    part('hat mushrooms',4,hatCaps), part('hat stems',3,hatStems),
    part('robe',0,[ shape(cyl(.17,.31,1.2,12),mottle,[0,.62,0]), shape(sph(.185,10,5),mottle,[0,1.2,0],[1,.55,1]), shape(cyl(.085,.1,.07,8),RUST,[0,1.255,0]) ]),
    part('sleeves',1,[-1,1].map(sx=>limb([sx*.17,1.17,.02],[sx*.13,.98,.22],.055,.085,mottle))),
    part('hands',1,[-1,1].map(sx=>shape(sph(.05,8,6),CREAM,[sx*.12,.96,.25],[1.1,.8,1.3]))),
    part('tray',2,[ shape(cyl(.25,.23,.03,16),TRAY,[0,.99,.33]), shape(torus(.245,.016,6,16),TRAY,[0,1.005,.33],null,[90,0,0]) ]),
    part('tray mushrooms',4,trayCaps), part('tray stems',3,trayStems),
    part('strap',2,[ limb([.12,1.24,.1],[-.22,.72,.13],.02,.02,ROPE,6), limb([.12,1.24,-.06],[-.24,.72,-.06],.02,.02,ROPE,6),
      ...Array.from({length:7},(_,i)=>{ const u=(i+.5)/7; return shape(sph(.024,6,4),[.52,.37,.17],[.12-.34*u,1.24-.52*u,.1+.03*u]); }) ]),
    part('bag',1,[ shape(blob(.08,.12,.05,10,8),BAG,[-.26,.62,.04],null,[0,0,-6]), shape(blob(.085,.03,.055,10,6),[.62,.46,.25],[-.26,.72,.04],null,[0,0,-6]) ]) ];
  const BOOTH=()=>{ const P=PARK, X=x=>BOD.XS(x+(P.ox||0)), Z=y=>BOD.ZS(y+(P.oy||0)), g0=P.gate[0];
    MUSH.booth=STALL.build({X,Z,x0:g0-6.2,x1:g0-1.8,y0:P.y0-8.2,y1:P.y0-5.2,veg:false,seed:7}); };

  const N=PARTSNPC.make(PARTS,Object.assign({key:'mushroom',name:'THE MUSHROOM SELLER',eye:0,eyeC:'0.,0.,0.',metres:2.53, radius:.3,speed:.4,stride:6,rock:.05,bob:.025},PARTSNPC.street(72,-70),
    {roam:false,brain:(dt,you,st)=>{ const MB=MUSH.booth; st.to=null; st.hold=true; if(MB){ st.x=MB.hx; st.z=MB.hz; st.face={x:MB.hx,z:MB.fz}; } }}));
  { const wait=()=>{ if(!PARK.fire)return setTimeout(wait,500); BOOTH(); N.st.x=MUSH.booth.hx; N.st.z=MUSH.booth.hz; N.home={x:N.st.x,z:N.st.z}; }; wait(); }
  MUSH.N=N; window.MUSHDBG=()=>({booth:!!MUSH.booth,life:!!N.life,fire:!!PARK.fire,key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),to:!!N.st.to,vis:N.g.visible,tris:N.tris}); }
