// THE KITCHEN: the owner's cozy kitchen picture in your apartment's back corner (25 Oct 2026): the red fridge, the farmhouse sink under the window, white subway tiles, open shelves, the stove under its hood, the peninsula, the gingham table and its two chairs; the small things real bodies; the fridge opens, the stove lights, the tap runs.
import {THREE} from './003-shx.js';
import {SFX} from './003b-systems.js';
import {ROOMK} from './150a-bedroom.js';
{ ROOMK.parts.push(c=>{ '@apts'; const {R,M,part,thing,mat,rbox,col,tex,rnd,V3,Lx,fw,WW,clip,solid,shelf,cur}=c;
    const p=(geo,m,u,h,v,ry=0,par=cur(),cast=true)=>part(geo,m,u,h,v,ry,par,cast), KU=[], cap=(...a)=>{ const u=c.cap(...a); KU.push(u); return u; }; R.kitchen=KU;
    const clipAll=(g,k)=>{ const cm=new Map(); g.traverse(o=>{ if(!o.isMesh)return; if(!cm.has(o.material)){ const m=o.material.clone(); Object.assign(m,clip(k)); cm.set(o.material,m); } o.material=cm.get(o.material); }); };
    const CAB=[236,231,218], CABD=[224,218,203], BUT=[214,160,112], RED=[232,48,36], GRN=[128,176,140], MAUVE=[176,118,116], WOODL=[214,172,128];
    const cab=mat(CAB,{roughness:.6}), cabd=mat(CABD,{roughness:.65}), knobM=mat([170,112,66],{roughness:.5}), chrome=mat([220,222,226],{roughness:.18,metalness:.95}), steel=mat([190,192,196],{roughness:.3,metalness:.8}),
      white=mat([244,242,236],{roughness:.35}), black=mat([28,28,30],{roughness:.4}), woodl=mat(WOODL,{roughness:.55}), warm=new THREE.MeshBasicMaterial({color:col([255,226,170])});
    const butcher=tex(256,256,(g,w,h)=>{ let x=0; while(x<w){ const sw=10+rnd()*14, k=.86+rnd()*.24; g.fillStyle=`rgb(${BUT[0]*k|0},${BUT[1]*k|0},${BUT[2]*k|0})`; g.fillRect(x,0,sw,h);
        for(let i=0;i<3;i++){ g.strokeStyle=`rgba(150,96,56,${.08+rnd()*.08})`; g.beginPath(); const xx=x+rnd()*sw; g.moveTo(xx,0); g.lineTo(xx+(rnd()-.5)*4,h); g.stroke(); } g.fillStyle='rgba(120,70,30,.25)'; g.fillRect(x,0,1,h); x+=sw; } },true);
    const tile=tex(512,256,(g,w,h)=>{ g.fillStyle='#cfcac0'; g.fillRect(0,0,w,h); const tw=w/4, th=h/4;
      for(let r=0;r<4;r++)for(let i=-1;i<5;i++){ const x=i*tw+(r&1?tw/2:0), y=r*th; g.fillStyle='#f6f4ee'; g.fillRect(x+3,y+3,tw-6,th-6); g.fillStyle='#e4e0d6'; g.fillRect(x+3,y+th-7,tw-6,4); } },true);
    const ging=tex(128,128,(g,w,h)=>{ const n=8, s=w/n; g.fillStyle='#faf6f0'; g.fillRect(0,0,w,h); g.fillStyle='rgba(204,36,36,.55)'; for(let i=0;i<n;i+=2){ g.fillRect(i*s,0,s,h); g.fillRect(0,i*s,w,s); } },true);
    const art=tex(96,112,(g,w,h)=>{ g.fillStyle='#f0dbb8'; g.fillRect(0,0,w,h); g.fillStyle='#f0b070'; g.beginPath(); g.arc(62,40,12,0,7); g.fill();
      g.fillStyle='#9cb890'; g.beginPath(); g.moveTo(0,80); g.quadraticCurveTo(30,58,60,76); g.quadraticCurveTo(80,86,96,70); g.lineTo(96,112); g.lineTo(0,112); g.fill(); g.fillStyle='#7a9c76'; g.beginPath(); g.moveTo(0,96); g.quadraticCurveTo(40,80,96,98); g.lineTo(96,112); g.lineTo(0,112); g.fill(); });
    const light=(c0,i,d,u,h,v,o={})=>{ const L=new THREE.PointLight(c0,i,d*M,1.8); L.userData.pool=true; L.userData.i0=i; Object.assign(L.userData,o); L.position.set(u,h,v); cur().add(L); return L; };   // inside the piece being built: it moves with it
    const keep=me=>{ me.userData.keep=1; return me; };

    /* ---------- where it stands: the fridge left of the sink, the counter under the window into the corner, down the side wall past the stove, the peninsula back out ---------- */
    const CH=.92, TT=.04, KK=.1, DD=.62, F0=7.12, F1=7.94, BU=7.95, SC=fw[1], SW=.78, S0=SC-SW/2, S1=SC+SW/2, UC=Lx-DD, ST0=1.86, ST1=2.62, P0=2.9, P1=3.56, PU=Lx-1.85;

    /* ---------- the cabinets: cream shaker doors and drawers with wooden knobs, butcher-block tops ---------- */
    const butM=mat([255,255,255],{map:butcher,roughness:.5}), kick=mat([150,140,126],{roughness:.8});
    const top=(u0,v0,u1,v1)=>p(rbox(u1-u0,TT,v1-v0,.008,2),butM,(u0+u1)/2,CH-TT/2,(v0+v1)/2);
    const body=(u0,v0,u1,v1,h1=CH-TT)=>{ p(rbox(u1-u0,h1-KK,v1-v0,.006,1),cab,(u0+u1)/2,KK+(h1-KK)/2,(v0+v1)/2); p(new THREE.BoxGeometry(u1-u0-.06,KK,v1-v0-.06),kick,(u0+u1)/2,KK/2,(v0+v1)/2,0,cur(),false); };
    const panel=(g,x,y,w,h,door,s=1,low=false)=>{ p(rbox(w,h,.02,.004,1),cabd,x,y,.01,0,g); const f=Math.min(.055,h*.22);
      for(const [px,py,pw,ph] of [[x,y+h/2-f/2,w,f],[x,y-h/2+f/2,w,f],[x-w/2+f/2,y,f,h-2*f],[x+w/2-f/2,y,f,h-2*f]])p(rbox(pw,ph,.012,.003,1),cab,px,py,.026,0,g);
      p(new THREE.SphereGeometry(.017,10,8),knobM,door?x+s*(w/2-.065):x,door?y+(low?-1:1)*(h/2-.075):y,.045,0,g); };
    const fronts=(o,ry,a0,a1,n,dr=true,dT=CH-TT-.012)=>{ const g=new THREE.Group(); g.position.set(o[0],0,o[1]); g.rotation.y=ry; cur().add(g); const cw=(a1-a0)/n, t0=KK+.012, dB=dr?dT-.17:dT;
      for(let i=0;i<n;i++){ const x=a0+cw*(i+.5); if(dr)panel(g,x,(dB+.006+dT)/2,cw-.012,dT-dB-.006,false); panel(g,x,(t0+dB-.006)/2,cw-.012,dB-.006-t0,true,i%2?-1:1); } return g; };
    const BK={bake:true};
    cap('COUNTER',()=>{ body(BU,0,S0,DD); top(BU,0,S0,DD+.03); fronts([0,DD],0,BU,S0,1); solid(BU,0,S0,DD+.03,CH); },BK);
    cap('CORNER COUNTER',()=>{ body(S1,0,Lx,DD); top(S1,0,Lx,DD+.03); fronts([0,DD],0,S1,UC,4); solid(S1,0,Lx,DD+.03,CH); },BK);
    cap('SIDE COUNTER',()=>{ body(UC,DD,Lx,ST0); top(UC-.03,DD+.03,Lx,ST0); fronts([UC,0],-Math.PI/2,DD,ST0,3); solid(UC-.03,DD+.03,Lx,ST0,CH); },BK);
    cap('SHORT COUNTER',()=>{ body(UC,ST1,Lx,P0); top(UC-.03,ST1,Lx,P0-.03); fronts([UC,0],-Math.PI/2,ST1,P0,1); solid(UC-.03,ST1,Lx,P0-.03,CH); },BK);
    cap('PENINSULA',()=>{ body(PU,P0,Lx,P1); top(PU-.03,P0-.03,Lx,P1+.03); fronts([Lx,P0],Math.PI,DD,Lx-PU,2);
      p(rbox(Lx-PU-.04,CH-TT-KK-.04,.015,.004,1),cabd,(PU+Lx)/2,KK+(CH-TT-KK)/2,P1+.008); p(rbox(.015,CH-TT-KK-.04,P1-P0-.04,.004,1),cabd,PU-.008,KK+(CH-TT-KK)/2,(P0+P1)/2);   // its plain panels
      solid(PU-.03,P0-.03,Lx,P1+.03,CH); },BK);

    /* ---------- the kitchen's own floor: its corner of the room, edged in dark wood where it meets the room's floor (the room editor sets it) ---------- */
    { const z=R.kzone=[6.85,0,Lx,4.35], w=z[2]-z[0], d=z[3]-z[1]; R.kfloorMat=mat([255,255,255],{roughness:.5,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
      const fl=part(new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2),R.kfloorMat,z[0]+w/2,.002,z[1]+d/2,0,c.apt,false), tm=mat([66,36,20],{roughness:.5});
      R.kfloor=[fl,part(rbox(.04,.008,d,.003,1),tm,z[0],.004,z[1]+d/2,0,c.apt,false),part(rbox(w,.008,.04,.003,1),tm,z[0]+w/2,.004,z[3],0,c.apt,false)]; }
    /* ---------- the white subway tiles from the counter up, round the window ---------- */
    const tF=mat([255,255,255],{map:tile,roughness:.3,...clip('Wf')}), tE=mat([255,255,255],{map:tile,roughness:.3,...clip('We')});
    const tiles=(m,w,h,u,hh,v,ry)=>{ const g=new THREE.PlaneGeometry(w,h), uv=g.attributes.uv; for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/.6,uv.getY(i)*h/.3); p(g,m,u,hh,v,ry,cur(),false); };
    const w0=SC-WW/2-.1, w1=SC+WW/2+.1;
    tiles(tF,w0-BU,.8,(BU+w0)/2,CH+.4,.004,0); tiles(tF,Lx-w1,.8,(w1+Lx)/2,CH+.4,.004,0); tiles(tF,w1-w0,.1,(w0+w1)/2,CH+.05,.004,0);
    tiles(tE,P1,.8,Lx-.004,CH+.4,P1/2,-Math.PI/2);

    /* ---------- the farmhouse sink, its swan-neck tap, the rack, the soap, the paper towels ---------- */
    const sinkM=mat([246,244,238],{roughness:.25});
    cap('SINK',()=>{ body(S0,0,S1,DD,CH-.29); top(S0,0,S1,.05); fronts([0,DD],0,S0+.01,S1-.01,2,false,CH-.3); solid(S0,0,S1,DD+.03,CH);
    p(rbox(SW,.28,.05,.015,2),sinkM,SC,CH-.14,DD+.005); p(rbox(SW,.28,.05,.015,2),sinkM,SC,CH-.14,.07);
    for(const s of [-1,1])p(rbox(.05,.28,DD-.07,.015,2),sinkM,SC+s*(SW/2-.025),CH-.14,(DD+.07)/2);
    p(rbox(SW-.08,.03,DD-.1,.01,2),sinkM,SC,CH-.265,(DD+.07)/2); p(new THREE.CircleGeometry(.025,14).rotateX(-Math.PI/2),steel,SC,CH-.249,(DD+.07)/2,0,cur(),false);
    p(new THREE.CylinderGeometry(.028,.032,.05,16),chrome,SC,CH+.025,.035);
    p(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(0,0,0),new V3(0,.22,0),new V3(0,.33,.05),new V3(0,.33,.15),new V3(0,.25,.2)]),24,.012,8),chrome,SC,CH+.04,.035);
    p(new THREE.CylinderGeometry(.008,.008,.09,8).rotateZ(Math.PI/2),chrome,SC+.05,CH+.12,.035);
    { const wm=new THREE.MeshLambertMaterial({color:col([196,224,240]),transparent:true,opacity:.55,emissive:col([120,160,190]),emissiveIntensity:.3}), h0=CH+.285, h1=CH-.25;
      const wt=keep(p(new THREE.CylinderGeometry(.007,.009,h0-h1,8),wm,SC,(h0+h1)/2,.235,0,cur(),false)); wt.visible=false; wt.userData.water=1; } },{bake:true,wire:'tap'});
    { const g=thing(9.62,CH,.3,.15), wr=mat([200,160,110],{roughness:.6}); part(rbox(.34,.02,.24,.005,1),wr,0,.01,0,0,g);
      for(let i=0;i<6;i++)part(new THREE.CylinderGeometry(.005,.005,.12,6),wr,-.14+i*.056,.07,-.08,0,g);
      for(let i=0;i<3;i++){ const pl=part(new THREE.CylinderGeometry(.1,.1,.012,24),white,-.08+i*.07,.115,0,0,g); pl.rotation.z=Math.PI/2-.2; } R.loose.push([g,'DISH RACK',1.2]); }
    { const g=thing(9.3,CH,.1); part(new THREE.CylinderGeometry(.03,.032,.13,14),mat([110,170,110],{roughness:.2}),0,.065,0,0,g); part(new THREE.CylinderGeometry(.008,.008,.04,8),white,0,.15,0,0,g); part(rbox(.04,.01,.012,.003,1),white,.015,.17,0,0,g); R.loose.push([g,'DISH SOAP',.3]); }
    { const g=thing(Lx-.95,CH,.14); part(new THREE.CylinderGeometry(.07,.07,.015,18),woodl,0,.008,0,0,g); part(new THREE.CylinderGeometry(.008,.008,.3,8),woodl,0,.16,0,0,g);
      part(new THREE.CylinderGeometry(.055,.055,.26,18),mat([248,246,240],{roughness:.9}),0,.15,0,0,g); R.loose.push([g,'PAPER TOWELS',.4]); }

    /* ---------- the open shelves: canisters, the green pots, the plates and mugs ---------- */
    cap('OPEN SHELVES',()=>{ for(const t of [1.52,1.9]){ p(rbox(.26,.05,1.5,.008,2),woodl,Lx-.13,t-.025,.93); shelf(Lx-.26,.18,Lx,1.68,t-.05,t); } },BK);
    const can=(v,hh)=>{ const g=thing(Lx-.13,1.9,v); part(new THREE.CylinderGeometry(.075,.075,hh,20),mat([238,236,228],{roughness:.4}),0,hh/2,0,0,g);
      part(new THREE.CylinderGeometry(.078,.078,.04,20),woodl,0,hh+.02,0,0,g); part(new THREE.SphereGeometry(.018,10,8),woodl,0,hh+.045,0,0,g); R.loose.push([g,'CANISTER',.6]); };
    can(.4,.24); can(.62,.19);
    const gpot=(u,h,v,s=1,name='POT',cl0=GRN)=>{ const g=thing(u,h,v), gm=mat(cl0,{roughness:.35});
      part(new THREE.LatheGeometry([[0,0],[.07,0],[.09,.02],[.095,.06],[.09,.1],[.085,.105]].map(([x,y])=>new THREE.Vector2(x*s,y*s)),20),gm,0,0,0,0,g);
      const lid=new THREE.SphereGeometry(.088*s,20,10,0,Math.PI*2,0,Math.PI/2); lid.scale(1,.45,1); part(lid,gm,0,.105*s,0,0,g); part(new THREE.SphereGeometry(.018*s,10,8),gm,0,.15*s,0,0,g);
      for(const sd of [-1,1])part(new THREE.TorusGeometry(.022*s,.007*s,6,12),gm,sd*.095*s,.08*s,0,0,g); R.loose.push([g,name,.8*s*s]); return g; };
    gpot(Lx-.13,1.9,1.05); gpot(Lx-.13,1.9,1.33,.9);
    { const g=thing(Lx-.13,1.52,.45); for(let i=0;i<6;i++)part(new THREE.CylinderGeometry(.1,.085,.012,24),white,0,.006+i*.014,0,0,g); R.loose.push([g,'PLATES',2]); }
    const mug=(u,h,v,ry=0)=>{ const g=thing(u,h,v,ry), m=mat(MAUVE,{roughness:.45}); part(new THREE.CylinderGeometry(.04,.036,.09,16),m,0,.045,0,0,g);
      part(new THREE.CircleGeometry(.034,14).rotateX(-Math.PI/2),mat([90,56,40],{roughness:.3}),0,.08,0,0,g,false); part(new THREE.TorusGeometry(.025,.008,6,12,Math.PI),m,.04,.045,0,0,g).rotation.z=-Math.PI/2; R.loose.push([g,'MUG',.3]); };
    for(const v of [.95,1.13,1.31,1.49])mug(Lx-.13,1.52,v,rnd()*6);

    /* ---------- along the side wall: the microwave, the mint toaster, the mills, the stove and its pot, the crock and the oils ---------- */
    { const g=thing(Lx-.3,CH,.98,-Math.PI/2); part(rbox(.5,.29,.36,.02,2),white,0,.145,0,0,g); part(rbox(.32,.2,.01,.008,1),mat([30,32,34],{roughness:.15,metalness:.3}),-.06,.15,.181,0,g);
      part(rbox(.09,.22,.008,.004,1),mat([226,224,216],{roughness:.5}),.18,.15,.182,0,g); for(let i=0;i<3;i++)part(new THREE.CylinderGeometry(.012,.012,.01,10).rotateX(Math.PI/2),black,.18,.21-i*.05,.188,0,g); R.loose.push([g,'MICROWAVE',12]); }
    { const g=thing(Lx-.2,CH,1.45,-Math.PI/2), mm=mat([180,222,196],{roughness:.3}); part(rbox(.26,.18,.15,.03,3),mm,0,.09,0,0,g);
      for(const z of [-.035,.035])part(new THREE.BoxGeometry(.19,.012,.025),black,0,.176,z,0,g); part(rbox(.02,.03,.02,.005,1),chrome,.14,.12,0,0,g); R.loose.push([g,'TOASTER',1.5]); }
    const mill=(u,v,c0)=>{ const g=thing(u,CH,v); part(new THREE.LatheGeometry([[0,0],[.022,0],[.024,.02],[.018,.06],[.022,.1],[.02,.13],[.008,.145],[0,.15]].map(([x,y])=>new THREE.Vector2(x,y)),14),mat(c0,{roughness:.45}),0,0,0,0,g); R.loose.push([g,'MILL',.2]); };
    mill(Lx-.12,1.7,[150,92,52]); mill(Lx-.12,1.77,[196,140,90]);
    cap('STOVE',()=>{ const g=new THREE.Group(); g.position.set(Lx-.31,0,(ST0+ST1)/2); g.rotation.y=-Math.PI/2; cur().add(g); const w=ST1-ST0-.01;
      p(rbox(w,CH-.02,.6,.012,2),white,0,(CH-.02)/2,0,0,g); p(rbox(w-.08,.48,.03,.01,1),white,0,.38,.31,0,g); p(rbox(w-.24,.24,.012,.006,1),mat([22,22,24],{roughness:.1,metalness:.4}),0,.4,.327,0,g);
      p(new THREE.CylinderGeometry(.012,.012,w-.16,10).rotateZ(Math.PI/2),chrome,0,.66,.37,0,g); for(const s of [-1,1])p(new THREE.CylinderGeometry(.008,.008,.05,8).rotateX(Math.PI/2),chrome,s*(w/2-.1),.66,.345,0,g);
      p(rbox(w-.08,.1,.03,.008,1),white,0,.07,.31,0,g); p(rbox(w-.02,.11,.02,.006,1),mat([232,228,218],{roughness:.4}),0,.82,.305,0,g);
      for(const x of [-.27,-.13,.13,.27])p(new THREE.CylinderGeometry(.024,.026,.03,16).rotateX(Math.PI/2),mat([238,234,224],{roughness:.4}),x,.82,.33,0,g);
      p(rbox(w-.01,.02,.58,.004,1),black,0,CH-.01,0,0,g);
      for(const s of [-1,1]){ for(let i=0;i<3;i++)p(new THREE.BoxGeometry(.33,.015,.012),black,s*.18,CH+.01,-.22+i*.22,0,g); for(let i=0;i<3;i++)p(new THREE.BoxGeometry(.012,.015,.5),black,s*.18+(i-1)*.15,CH+.01,0,0,g); }
      const fm=new THREE.MeshBasicMaterial({color:col([90,140,255]),transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false});
      for(const [x,z] of [[-.17,.12],[.17,.12],[-.17,-.14],[.17,-.14]]){ p(new THREE.CylinderGeometry(.04,.045,.02,16),mat([40,40,42],{roughness:.5}),x,CH+.006,z,0,g);
        const f=keep(p(new THREE.TorusGeometry(.045,.006,6,24).rotateX(Math.PI/2),fm,x,CH+.018,z,0,g,false)); f.visible=false; f.userData.flame=1; }
      p(rbox(w,.16,.04,.008,1),white,0,CH+.08,-.29,0,g); light(0x9fb8ff,0,1.4,Lx-.4,CH+.1,2.24,{flame:1}); solid(UC,ST0,Lx,ST1,CH+.0175); },{bake:true,wire:'stove'});
    gpot(Lx-.43,CH+.018,2.07,1.25,'DUTCH OVEN',[118,168,140]);
    { const g=thing(Lx-.2,CH,2.76); part(new THREE.CylinderGeometry(.05,.045,.13,16),mat([238,232,214],{roughness:.4}),0,.065,0,0,g);
      for(let i=0;i<3;i++){ const a=i*2.1, sp=new THREE.Group(); sp.position.set(Math.cos(a)*.015,.1,Math.sin(a)*.015); sp.rotation.set(Math.sin(a)*.25,0,-Math.cos(a)*.25); g.add(sp);
        part(new THREE.CylinderGeometry(.006,.006,.2,6),woodl,0,.05,0,0,sp); const hd=part(new THREE.SphereGeometry(.02,8,6),woodl,0,.16,0,0,sp); hd.scale.set(1,1.4,.5); } R.loose.push([g,'UTENSILS',.6]); }
    for(const v of [2.66,2.86]){ const g=thing(Lx-.08,CH,v); part(new THREE.LatheGeometry([[0,0],[.022,0],[.024,.08],[.01,.12],[.007,.15]].map(([x,y])=>new THREE.Vector2(x,y)),12),mat([186,112,40],{roughness:.15,transparent:true,opacity:.9}),0,0,0,0,g);
      part(new THREE.CylinderGeometry(.008,.008,.02,8),mat([140,100,70]),0,.155,0,0,g); R.loose.push([g,'OIL',.3]); }

    /* ---------- the hood over the stove, the cabinet over the peninsula, and their warm lights ---------- */
    const pu=(geo,m,u,h,v,ry=0,cast=true)=>p(geo,m,u,h,v,ry,cur(),cast);
    cap('HOOD',()=>{ const hd=pu(new THREE.CylinderGeometry(.4,1,.26,4,1).rotateY(Math.PI/4),steel,Lx-.27,1.81,(ST0+ST1)/2); hd.scale.set(.25/.7071,1,.4/.7071);
      pu(rbox(.5,.04,.8,.008,1),steel,Lx-.25,1.68,(ST0+ST1)/2); const HW=c.HW; pu(rbox(.2,HW-1.94,.32,.006,1),steel,Lx-.11,(1.94+HW)/2,(ST0+ST1)/2);
      pu(new THREE.PlaneGeometry(.3,.1).rotateX(Math.PI/2),warm,Lx-.25,1.657,(ST0+ST1)/2,0,false); light(0xffd9a0,.6,1.6,Lx-.25,1.6,(ST0+ST1)/2); clipAll(cur(),'We'); },BK);
    cap('WALL CABINET',()=>{ pu(rbox(.36,.8,.86,.01,2),cab,Lx-.18,1.92,3.15); const g=new THREE.Group(); g.position.set(Lx-.36,0,0); g.rotation.y=-Math.PI/2; cur().add(g);
      panel(g,2.94,1.92,.41,.76,true,1,true); panel(g,3.36,1.92,.41,.76,true,-1,true);
      pu(new THREE.BoxGeometry(.02,.012,.8),warm,Lx-.33,1.514,3.15,0,false); light(0xffd7a0,.7,2,Lx-.2,1.45,3.15); clipAll(cur(),'We'); },BK);   // the hood and the high cabinet go with the side wall when it is cut away

    /* ---------- on the peninsula: the bowl of oranges, a little plant, the board and the knife ---------- */
    { const g=thing(Lx-.42,CH,3.18), om=mat([236,120,40],{roughness:.6}); part(new THREE.LatheGeometry([[0,0],[.06,0],[.12,.04],[.13,.07],[.12,.07],[.06,.015],[0,.015]].map(([x,y])=>new THREE.Vector2(x,y)),20),mat([150,92,52],{roughness:.5,side:THREE.DoubleSide}),0,0,0,0,g);
      for(const [x,y,z] of [[-.05,.045,-.03],[.04,.045,-.04],[.05,.045,.04],[-.04,.045,.05],[0,.045,0],[.0,.09,-.01]])part(new THREE.SphereGeometry(.036,12,10),om,x,y,z,0,g); R.loose.push([g,'ORANGES',1.5]); }
    { const g=thing(Lx-.16,CH,3.42), lm=mat([84,150,64],{roughness:.6,side:THREE.DoubleSide}); part(new THREE.CylinderGeometry(.055,.045,.09,16),mat([236,232,222],{roughness:.5}),0,.045,0,0,g);
      for(let k=0;k<9;k++){ const a=k/9*Math.PI*2, lf=part(new THREE.SphereGeometry(.04,8,6),lm,Math.cos(a)*.04,.12+(k%3)*.02,Math.sin(a)*.04,0,g); lf.scale.set(1,.35,.6); lf.rotation.set(0,-a,.5); } R.loose.push([g,'PLANT',.5]); }
    { const g=thing(Lx-1.15,CH,3.22,.35); part(rbox(.42,.022,.24,.01,2),woodl,0,.011,0,0,g); part(rbox(.12,.022,.07,.01,1),woodl,.26,.011,0,0,g); R.loose.push([g,'CUTTING BOARD',.8]); }
    { const g=thing(Lx-.72,CH,3.32,-.3); part(rbox(.2,.004,.03,.002,1),steel,0,.006,0,0,g); part(rbox(.1,.016,.022,.006,1),mat([70,44,30],{roughness:.5}),-.15,.008,0,0,g); R.loose.push([g,'KNIFE',.15]); }

    /* ---------- the red fridge: rounded, two doors with chrome handles, lit inside; books and a trailing plant on top, a picture above ---------- */
    const redM=mat(RED,{roughness:.28,metalness:.05}), lin=mat([240,240,236],{roughness:.5,emissive:col([255,250,235]),emissiveIntensity:.25}), FC=(F0+F1)/2;
    cap('FRIDGE',()=>{ for(const u of [F0+.025,F1-.025])p(rbox(.05,1.74,.66,.02,2),redM,u,.87,.35); solid(F0,0,F1,.76,1.74);
    p(rbox(.82,.06,.66,.03,2),redM,FC,1.71,.35); p(rbox(.82,.1,.66,.02,1),redM,FC,.05,.35); p(rbox(.82,1.74,.04,.01,1),redM,FC,.87,.04);
    p(new THREE.PlaneGeometry(.72,1.58),lin,FC,.88,.062,0,cur(),false); for(const u of [F0+.052,F1-.052])p(new THREE.BoxGeometry(.004,1.58,.6),lin,u,.88,.36,0,cur(),false);
    p(rbox(.72,.04,.62,.005,1),lin,FC,1.17,.37);
    const glass=mat([220,235,240],{transparent:true,opacity:.35,roughness:.1}); for(const h of [.45,.8,1.45])p(rbox(.7,.01,.55,.003,1),glass,FC,h,.36,0,cur(),false);
    p(new THREE.CylinderGeometry(.04,.04,.22,14),mat([250,250,248],{roughness:.4}),F0+.2,.92,.3); p(new THREE.CylinderGeometry(.045,.045,.1,14),mat([200,50,60],{roughness:.3}),F0+.42,.51,.32);
    p(rbox(.1,.2,.07,.006,1),mat([240,160,50],{roughness:.5}),F0+.6,.91,.3); p(new THREE.CylinderGeometry(.04,.04,.07,14),mat([240,220,120],{roughness:.4}),F0+.4,1.51,.3);
    const door=(y0,y1,yh)=>{ const g=new THREE.Group(); g.position.set(F0,0,.68); g.userData.door=1; cur().add(g); const h=y1-y0, add=(geo,m,x,y,z)=>{ const me=keep(new THREE.Mesh(geo,m)); me.position.set(x,y,z); me.castShadow=me.receiveShadow=true; g.add(me); return me; };
      add(rbox(.82,h,.07,.035,3),redM,.41,(y0+y1)/2,.035); add(new THREE.BoxGeometry(.72,h-.1,.004),lin,.41,(y0+y1)/2,-.002);
      add(new THREE.CylinderGeometry(.013,.013,.2,10).rotateZ(Math.PI/2),chrome,.68,yh,.115); for(const x of [.6,.76])add(new THREE.CylinderGeometry(.008,.008,.05,8).rotateX(Math.PI/2),chrome,x,yh,.09);
      };
    door(.03,1.15,1.07); door(1.19,1.74,1.27); },{bake:true,wire:'fridge'});
    { const g=thing(FC+.12,1.74,.42); [[90,110,170],[200,180,90],[170,90,140]].forEach((c0,i)=>part(rbox(.035,.2+i%2*.03,.15,.004,1),mat(c0,{roughness:.6}),i*.04,.1+i%2*.015,0,0,g)); R.loose.push([g,'BOOKS',.8]); }
    { const g=thing(F0+.17,1.74,.45), lm=mat([70,140,60],{roughness:.6,side:THREE.DoubleSide}); part(new THREE.CylinderGeometry(.07,.055,.1,16),mat([96,62,44],{roughness:.6}),0,.05,0,0,g);
      for(let k=0;k<7;k++){ const a=k/7*Math.PI*2, lf=part(new THREE.CircleGeometry(.035,8),lm,Math.cos(a)*.05,.12,Math.sin(a)*.05,0,g,false); lf.rotation.set(-1.1,a,0); }
      for(const [dx,dz,n] of [[-1,0,10],[-1,.4,8],[0,1,9]]){ const L=Math.hypot(dx,dz)||1, ex=dx/L, ez=dz/L, reach=ez>.9?.3:.19;
        for(let t=0;t<n;t++){ const out=Math.min(t*.06,reach), dn=Math.max(0,t*.06-reach), lf=part(new THREE.CircleGeometry(.03,7),lm,ex*out+Math.sin(t)*.012,.1-dn*1.4,ez*out+Math.cos(t*1.3)*.012,0,g,false); lf.rotation.set(.4,t,0); lf.userData.soft=1; } }
      R.loose.push([g,'TRAILING PLANT',.6]); }
    cap('PICTURE',()=>{ p(rbox(.3,.36,.025,.006,1),mat([96,60,36],{roughness:.5,...clip('Wf')}),7.42,2.28,.0125); p(new THREE.PlaneGeometry(.24,.3),mat([255,255,255],{map:art,roughness:.8,...clip('Wf')}),7.42,2.28,.026,0,cur(),false); },BK);

    /* ---------- the table under its gingham cloth, donuts and coffee for two, the two chairs, the pet's bowl ---------- */
    const TU=5.6, TV=.42, TW=.92, TD=.72, TH=.74;   // against the north wall (owner, 7 Nov 2026: "put all the stuff in apartment along the walls")
    cap('TABLE',()=>{ p(rbox(TW,.04,TD,.01,2),woodl,TU,TH-.02,TV); p(rbox(TW-.1,.06,TD-.1,.006,1),cab,TU,TH-.07,TV);
    for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]])p(rbox(.05,TH-.04,.05,.008,1),cab,TU+sx*(TW/2-.06),(TH-.04)/2,TV+sz*(TD/2-.06));
    { const nu=40, nv=32, Dr=.2, X0=TW/2, Z0=TD/2, gc=new THREE.PlaneGeometry(1,1,nu,nv), pp=gc.attributes.position, uv=gc.attributes.uv;
      for(let i=0;i<pp.count;i++){ const a=pp.getX(i)*(TW+2*Dr), b=-pp.getY(i)*(TD+2*Dr), ox=Math.max(0,Math.abs(a)-X0), oz=Math.max(0,Math.abs(b)-Z0), dr=Math.hypot(ox,oz), w=Math.min(1,dr*6);
        pp.setXYZ(i,Math.max(-X0,Math.min(X0,a))+Math.sign(a)*(ox*.08+.012*Math.sin(b*28)*w),TH+.004-dr*.98,Math.max(-Z0,Math.min(Z0,b))+Math.sign(b)*(oz*.08+.012*Math.sin(a*28)*w)); uv.setXY(i,a/.24,b/.24); }
      gc.computeVertexNormals(); p(gc,mat([255,255,255],{map:ging,roughness:.85,side:THREE.DoubleSide}),TU,0,TV); }
    for(const [x,z,r] of [[-.3,-.05,.2],[.3,.05,-.4]]){ const g=new THREE.Group(); g.position.set(TU+x,TH+.008,TV+z); g.rotation.y=r; cur().add(g); p(rbox(.015,.003,.14,.001,1),steel,0,0,0,0,g); p(rbox(.015,.003,.14,.001,1),steel,.03,0,0,0,g); }
    solid(TU-TW/2,TV-TD/2,TU+TW/2,TV+TD/2,TH+.004); },BK);
    const dough=mat([222,170,108],{roughness:.6}), plateM=mat([246,240,230],{roughness:.35});
    const donut=(g,x,y,z,c0)=>{ part(new THREE.TorusGeometry(.036,.018,10,20).rotateX(Math.PI/2),dough,x,y+.018,z,0,g); const ic=part(new THREE.TorusGeometry(.036,.0185,10,20).rotateX(Math.PI/2),mat(c0,{roughness:.3}),x,y+.024,z,0,g); ic.scale.set(1.02,.6,1.02); };
    const plate=(x,z,r,ds,name='DONUTS')=>{ const g=thing(TU+x,TH+.004,TV+z); part(new THREE.CylinderGeometry(r,r*.82,.016,24),plateM,0,.008,0,0,g); for(const [dx,dy,dz,c0] of ds)donut(g,dx,.016+dy,dz,c0); R.loose.push([g,name,.5]); return g; };
    const PINK=[240,150,180], LIME=[190,220,120], CHOC=[96,56,36], PURP=[176,140,214];
    plate(0,0,.13,[[-.035,0,-.02,PINK],[.04,0,-.015,PURP],[0,0,.045,CHOC],[0,.034,.005,PINK]]);
    plate(-.3,-.18,.09,[[0,0,0,LIME]]); plate(.28,.18,.09,[[-.02,0,-.01,LIME],[.03,.03,.02,CHOC]]);
    mug(TU-.12,TH+.004,TV-.24,1.2); mug(TU+.3,TH+.004,TV-.14,4.1);
    const chair=(u,v,ry)=>{ const g=thing(u,0,v,ry); part(rbox(.42,.055,.42,.012,2),woodl,0,.45,0,0,g); for(const [x,z] of [[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17]])part(rbox(.055,.45,.055,.008,1),woodl,x,.225,z,0,g);
      for(const s of [-1,1])part(rbox(.055,.48,.055,.008,1),woodl,s*.17,.71,-.17,0,g); part(rbox(.4,.17,.05,.015,2),woodl,0,.84,-.17,0,g); part(rbox(.32,.03,.03,.006,1),woodl,0,.6,-.17,0,g); R.loose.push([g,'KITCHEN CHAIR',5,true]); };
    chair(TU-.74,TV-.05,Math.PI/2); chair(TU+.12,TV+.74,Math.PI);
    { const g=thing(PU-.4,0,P1+.32); part(new THREE.LatheGeometry([[0,0],[.08,0],[.11,.05],[.1,.055],[.06,.012],[0,.012]].map(([x,y])=>new THREE.Vector2(x,y)),20),mat([200,202,206],{roughness:.25,metalness:.8,side:THREE.DoubleSide}),0,0,0,0,g); R.loose.push([g,'PET BOWL',.4]); }

  });
  // what the kitchen's pieces do (each copy of one too): the fridge opens, the stove lights, the tap runs
  const W=ROOMK.wires;
  W.fridge=(un,c)=>{ '@later'; const D=[]; un.obj.traverse(o=>{ if(o.userData.door)D.push({g:o,a:o.rotation.y}); }); un.st.open=false;
    c.hit(un,()=>un.st.open?'CLOSE THE FRIDGE':'OPEN THE FRIDGE',()=>{ un.st.open=!un.st.open; if(SFX)SFX.play('latch',{vol:.8,vary:.2}); });
    un.tick=dt=>{ const k=Math.min(1,dt*6); for(const d of D){ d.a+=((un.st.open?-1.85:0)-d.a)*k; d.g.rotation.y=d.a; } }; };
  W.stove=(un,c)=>{ '@later'; const F=[]; let L=null; un.obj.traverse(o=>{ if(o.userData.flame){ if(o.isPointLight)L=o; else F.push(o); } }); un.st.on=false;
    c.hit(un,()=>'STOVE: '+(un.st.on?'ON':'OFF'),()=>{ un.st.on=!un.st.on; if(SFX)SFX.play('click',{vol:.8,vary:.2}); });
    un.tick=()=>{ for(const f of F)f.visible=un.st.on; if(L)L.intensity=un.st.on?.5:0; }; };
  W.tap=(un,c)=>{ '@later'; let w=null; un.obj.traverse(o=>{ if(o.userData.water)w=o; }); un.st.on=false;
    c.hit(un,()=>'TAP: '+(un.st.on?'ON':'OFF'),()=>{ un.st.on=!un.st.on; if(SFX)SFX.play(un.st.on?'drip':'click',{vol:.6,vary:.2}); });
    un.tick=()=>{ if(!w)return; w.visible=un.st.on; if(un.st.on)w.scale.x=w.scale.z=.9+.2*Math.sin(performance.now()*.03); }; };
  window.KITCHENDBG=()=>{ '@later'; const A=ROOMK.api; if(!A||!A.R.kitchen)return {built:false}; const U=A.units(), f=k=>U.find(u=>u.wire===k&&!u.gone);
    let n=0; for(const u of A.R.kitchen)u.obj.traverse(o=>{ if(o.isMesh)n++; });
    return {built:!!f('fridge'),fridge:!!(f('fridge')&&f('fridge').st.open),stove:!!(f('stove')&&f('stove').st.on),tap:!!(f('tap')&&f('tap').st.on),meshes:n}; };
}
