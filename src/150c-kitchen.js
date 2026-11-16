// THE KITCHEN: a real kitchen along the loft's back wall, left of your door (owner, 16 Nov 2026: "make like a real kitchen, 100%"; the cozy kitchen of 25 Oct, archived 9 Nov, back and fitted to the loft): the red fridge by the door, a prep counter, the range under its hood, the dishwasher, the farmhouse sink, the corner and a short run up the window wall to the first window; cream shaker cabinets, butcher-block tops, white subway tiles, wall cabinets either side of the hood, open shelves on the window wall; the fridge opens, the range lights, the tap runs, the dishwasher opens; the small things real bodies.
import {THREE} from './003-shx.js';
import {SFX} from './003b-systems.js';
import {APTS} from './059a-apts.js';
import {ROOMK} from './150a-bedroom.js';
{ const KINDS=['FRIDGE','COUNTER','STOVE','HOOD','DISHWASHER','SINK','CORNER COUNTER','SIDE COUNTER','WALL CABINET','OPEN SHELVES','BACKSPLASH','KITCHEN PRINT'];
  for(const k of KINDS)ROOMK.always.add(k);   // in every loft from the start
  ROOMK.parts.push(c=>{ '@apts'; if(!APTS.LOFT)return; const {R,M,part,thing,mat,rbox,col,tex,rnd,V3,Ly,clip,solid,shelf,cur}=c;
    // the kitchen is built facing out from the back wall: its own x runs along the wall from the door end (x 0) to the window wall's corner (x X0), its z out into the room; X0 is where your door's frame leaves room
    const X0=4.85, KR=Math.PI, toU=x=>X0-x, toV=z=>Ly-z;
    let KG=null; const KUs=[], cap=(name,fn,o={})=>{ const u=c.cap(name,g=>{ KG=new THREE.Group(); KG.position.set(X0,0,Ly); KG.rotation.y=KR; g.add(KG); fn(KG); KG=null; },o); KUs.push(u); return u; }; R.kitchen=KUs;
    const here=()=>KG||cur(), p=(geo,m,x,h,z,ry=0,par=here(),cast=true)=>part(geo,m,x,h,z,ry,par,cast);
    const sol=(x0,z0,x1,z1,h)=>solid(toU(x1),toV(z1),toU(x0),toV(z0),h), shf=(x0,z0,x1,z1,y0,y1)=>shelf(toU(x1),toV(z1),toU(x0),toV(z0),y0,y1);
    const th=(x,h,z,ry=0,...a)=>thing(toU(x),h,toV(z),ry+KR,...a);
    const CAB=[236,231,218], CABD=[224,218,203], BUT=[214,160,112], RED=[232,48,36], GRN=[128,176,140], MAUVE=[176,118,116], WOODL=[214,172,128];
    const cab=mat(CAB,{roughness:.6}), cabd=mat(CABD,{roughness:.65}), knobM=mat([170,112,66],{roughness:.5}), chrome=mat([220,222,226],{roughness:.18,metalness:.95}), steel=mat([190,192,196],{roughness:.3,metalness:.8}),
      white=mat([244,242,236],{roughness:.35}), black=mat([28,28,30],{roughness:.4}), woodl=mat(WOODL,{roughness:.55}), warm=new THREE.MeshBasicMaterial({color:col([255,226,170])});
    const butcher=tex(256,256,(g,w,h)=>{ let x=0; while(x<w){ const sw=10+rnd()*14, k=.86+rnd()*.24; g.fillStyle=`rgb(${BUT[0]*k|0},${BUT[1]*k|0},${BUT[2]*k|0})`; g.fillRect(x,0,sw,h);
        for(let i=0;i<3;i++){ g.strokeStyle=`rgba(150,96,56,${.08+rnd()*.08})`; g.beginPath(); const xx=x+rnd()*sw; g.moveTo(xx,0); g.lineTo(xx+(rnd()-.5)*4,h); g.stroke(); } g.fillStyle='rgba(120,70,30,.25)'; g.fillRect(x,0,1,h); x+=sw; } },true);
    const tile=tex(512,256,(g,w,h)=>{ g.fillStyle='#cfcac0'; g.fillRect(0,0,w,h); const tw=w/4, th_=h/4;
      for(let r=0;r<4;r++)for(let i=-1;i<5;i++){ const x=i*tw+(r&1?tw/2:0), y=r*th_; g.fillStyle='#f6f4ee'; g.fillRect(x+3,y+3,tw-6,th_-6); g.fillStyle='#e4e0d6'; g.fillRect(x+3,y+th_-7,tw-6,4); } },true);
    const art=tex(96,112,(g,w,h)=>{ g.fillStyle='#f0dbb8'; g.fillRect(0,0,w,h); g.fillStyle='#f0b070'; g.beginPath(); g.arc(62,40,12,0,7); g.fill();
      g.fillStyle='#9cb890'; g.beginPath(); g.moveTo(0,80); g.quadraticCurveTo(30,58,60,76); g.quadraticCurveTo(80,86,96,70); g.lineTo(96,112); g.lineTo(0,112); g.fill(); g.fillStyle='#7a9c76'; g.beginPath(); g.moveTo(0,96); g.quadraticCurveTo(40,80,96,98); g.lineTo(96,112); g.lineTo(0,112); g.fill(); });
    const light=(c0,i,d,x,h,z,o={})=>{ const L=new THREE.PointLight(c0,i,d*M,1.8); L.userData.pool=true; L.userData.i0=i; Object.assign(L.userData,o); L.position.set(x,h,z); here().add(L); return L; };
    const keep=me=>{ me.userData.keep=1; return me; };
    /* ---------- where it stands, along the wall from your door: the fridge, the prep counter, the range, the dishwasher, the sink, the corner; then up the window wall to just short of the first window ---------- */
    const CH=.92, TT=.04, KK=.1, DD=.62, F0=.03, F1=.85, BU=.87, ST0=1.67, ST1=2.43, DW1=3.03, SW=.78, S0=DW1, S1=S0+SW, SC=(S0+S1)/2, UC=X0-DD, RZ=2.35, MHk=(APTS.MH||4.375)-.36;
    /* ---------- the cabinets: cream shaker doors and drawers with wooden knobs, butcher-block tops ---------- */
    const butM=mat([255,255,255],{map:butcher,roughness:.5}), kick=mat([150,140,126],{roughness:.8});
    const top=(x0,z0,x1,z1)=>p(rbox(x1-x0,TT,z1-z0,.008,2),butM,(x0+x1)/2,CH-TT/2,(z0+z1)/2);
    const body=(x0,z0,x1,z1,h1=CH-TT)=>{ p(rbox(x1-x0,h1-KK,z1-z0,.006,1),cab,(x0+x1)/2,KK+(h1-KK)/2,(z0+z1)/2); p(new THREE.BoxGeometry(x1-x0-.06,KK,z1-z0-.06),kick,(x0+x1)/2,KK/2,(z0+z1)/2,0,here(),false); };
    const panel=(g,x,y,w,h,door,s=1,low=false)=>{ p(rbox(w,h,.02,.004,1),cabd,x,y,.01,0,g); const f=Math.min(.055,h*.22);
      for(const [px,py,pw,ph] of [[x,y+h/2-f/2,w,f],[x,y-h/2+f/2,w,f],[x-w/2+f/2,y,f,h-2*f],[x+w/2-f/2,y,f,h-2*f]])p(rbox(pw,ph,.012,.003,1),cab,px,py,.026,0,g);
      p(new THREE.SphereGeometry(.017,10,8),knobM,door?x+s*(w/2-.065):x,door?y+(low?-1:1)*(h/2-.075):y,.045,0,g); };
    const fronts=(o,ry,a0,a1,n,dr=true,dT=CH-TT-.012)=>{ const g=new THREE.Group(); g.position.set(o[0],0,o[1]); g.rotation.y=ry; here().add(g); const cw=(a1-a0)/n, t0=KK+.012, dB=dr?dT-.17:dT;
      for(let i=0;i<n;i++){ const x=a0+cw*(i+.5); if(dr)panel(g,x,(dB+.006+dT)/2,cw-.012,dT-dB-.006,false); panel(g,x,(t0+dB-.006)/2,cw-.012,dB-.006-t0,true,i%2?-1:1); } return g; };
    const BK={bake:true};
    cap('COUNTER',()=>{ body(BU,0,ST0,DD); top(BU,0,ST0,DD+.03); fronts([0,DD],0,BU,ST0,1); sol(BU,0,ST0,DD+.03,CH); },BK);
    cap('CORNER COUNTER',()=>{ body(S1,0,X0,DD); top(S1,0,X0,DD+.03); fronts([0,DD],0,S1,UC,1); sol(S1,0,X0,DD+.03,CH); },BK);
    cap('SIDE COUNTER',()=>{ body(UC,DD,X0,RZ); top(UC-.03,DD+.03,X0,RZ); fronts([UC,0],-Math.PI/2,DD,RZ,3); sol(UC-.03,DD+.03,X0,RZ,CH); },BK);
    /* ---------- the white subway tiles from the counter up: the back wall from the prep counter to the corner, the window wall to the run's end ---------- */
    const tB=mat([255,255,255],{map:tile,roughness:.3,...clip('Wb')}), tW=mat([255,255,255],{map:tile,roughness:.3,...clip('Ww')});
    const tiles=(m,w,h,x,hh,z,ry)=>{ const g=new THREE.PlaneGeometry(w,h), uv=g.attributes.uv; for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/.6,uv.getY(i)*h/.3); p(g,m,x,hh,z,ry,here(),false); };
    cap('BACKSPLASH',()=>{ tiles(tB,X0-BU,.6,(BU+X0)/2,CH+.3,.004,0); tiles(tW,RZ,.6,X0-.004,CH+.3,RZ/2,-Math.PI/2); },BK);
    cap('SINK',()=>{ body(S0,0,S1,DD,CH-.29); top(S0,0,S1,.05); fronts([0,DD],0,S0+.01,S1-.01,2,false,CH-.3); sol(S0,0,S1,DD+.03,CH);
      const sinkM=mat([246,244,238],{roughness:.25});
      p(rbox(SW,.28,.05,.015,2),sinkM,SC,CH-.14,DD+.005); p(rbox(SW,.28,.05,.015,2),sinkM,SC,CH-.14,.07);
      for(const s of [-1,1])p(rbox(.05,.28,DD-.07,.015,2),sinkM,SC+s*(SW/2-.025),CH-.14,(DD+.07)/2);
      p(rbox(SW-.08,.03,DD-.1,.01,2),sinkM,SC,CH-.265,(DD+.07)/2); p(new THREE.CircleGeometry(.025,14).rotateX(-Math.PI/2),steel,SC,CH-.249,(DD+.07)/2,0,here(),false);
      p(new THREE.CylinderGeometry(.028,.032,.05,16),chrome,SC,CH+.025,.035);
      p(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(0,0,0),new V3(0,.22,0),new V3(0,.33,.05),new V3(0,.33,.15),new V3(0,.25,.2)]),24,.012,8),chrome,SC,CH+.04,.035);
      p(new THREE.CylinderGeometry(.008,.008,.09,8).rotateZ(Math.PI/2),chrome,SC+.05,CH+.12,.035);
      { const wm=new THREE.MeshLambertMaterial({color:col([196,224,240]),transparent:true,opacity:.55,emissive:col([120,160,190]),emissiveIntensity:.3}), h0=CH+.285, h1=CH-.25;
        const wt=keep(p(new THREE.CylinderGeometry(.007,.009,h0-h1,8),wm,SC,(h0+h1)/2,.235,0,here(),false)); wt.visible=false; wt.userData.water=1; } },{bake:true,wire:'tap'});
    /* ---------- the dishwasher under the counter, left of the sink: a steel front that opens ---------- */
    cap('DISHWASHER',()=>{ const w=DW1-ST1; body(ST1,0,DW1,DD-.02); top(ST1,0,DW1,DD+.03); sol(ST1,0,DW1,DD+.03,CH);
      p(rbox(w-.012,.1,.02,.004,1),steel,(ST1+DW1)/2,CH-TT-.06,DD-.01); const dg=new THREE.Group(); dg.position.set((ST1+DW1)/2,KK+.01,DD-.005); dg.userData.door=1; here().add(dg);
      const add=(geo,m,x,y,z)=>{ const me=keep(new THREE.Mesh(geo,m)); me.position.set(x,y,z); me.castShadow=me.receiveShadow=true; dg.add(me); return me; };
      add(rbox(w-.012,CH-TT-KK-.13,.03,.006,1),steel,0,(CH-TT-KK-.13)/2,.015); add(new THREE.CylinderGeometry(.01,.01,w-.14,10).rotateZ(Math.PI/2),chrome,0,CH-TT-KK-.2,.05); },{bake:true,wire:'dishwasher'});
    { const g=th(SC+.62,CH,.3,.15), wr=mat([200,160,110],{roughness:.6}); part(rbox(.34,.02,.24,.005,1),wr,0,.01,0,0,g);
      for(let i=0;i<6;i++)part(new THREE.CylinderGeometry(.005,.005,.12,6),wr,-.14+i*.056,.07,-.08,0,g);
      for(let i=0;i<3;i++){ const pl=part(new THREE.CylinderGeometry(.1,.1,.012,24),white,-.08+i*.07,.115,0,0,g); pl.rotation.z=Math.PI/2-.2; } R.loose.push([g,'DISH RACK',1.2]); }
    { const g=th(S1+.08,CH,.1); part(new THREE.CylinderGeometry(.03,.032,.13,14),mat([110,170,110],{roughness:.2}),0,.065,0,0,g); part(new THREE.CylinderGeometry(.008,.008,.04,8),white,0,.15,0,0,g); part(rbox(.04,.01,.012,.003,1),white,.015,.17,0,0,g); R.loose.push([g,'DISH SOAP',.3]); }
    { const g=th(X0-.14,CH,.14); part(new THREE.CylinderGeometry(.07,.07,.015,18),woodl,0,.008,0,0,g); part(new THREE.CylinderGeometry(.008,.008,.3,8),woodl,0,.16,0,0,g);
      part(new THREE.CylinderGeometry(.055,.055,.26,18),mat([248,246,240],{roughness:.9}),0,.15,0,0,g); R.loose.push([g,'PAPER TOWELS',.4]); }
    /* ---------- the open shelves on the window wall over the short run: canisters, the green pots, the plates and mugs ---------- */
    cap('OPEN SHELVES',()=>{ for(const t of [1.52,1.9]){ p(rbox(.26,.05,1.5,.008,2),woodl,X0-.13,t-.025,.93); shf(X0-.26,.18,X0,1.68,t-.05,t); } },BK);
    const can=(z,hh)=>{ const g=th(X0-.13,1.9,z); part(new THREE.CylinderGeometry(.075,.075,hh,20),mat([238,236,228],{roughness:.4}),0,hh/2,0,0,g);
      part(new THREE.CylinderGeometry(.078,.078,.04,20),woodl,0,hh+.02,0,0,g); part(new THREE.SphereGeometry(.018,10,8),woodl,0,hh+.045,0,0,g); R.loose.push([g,'CANISTER',.6]); };
    can(.4,.24); can(.62,.19);
    const gpot=(x,h,z,s=1,name='POT',cl0=GRN)=>{ const g=th(x,h,z), gm=mat(cl0,{roughness:.35});
      part(new THREE.LatheGeometry([[0,0],[.07,0],[.09,.02],[.095,.06],[.09,.1],[.085,.105]].map(([a,b])=>new THREE.Vector2(a*s,b*s)),20),gm,0,0,0,0,g);
      const lid=new THREE.SphereGeometry(.088*s,20,10,0,Math.PI*2,0,Math.PI/2); lid.scale(1,.45,1); part(lid,gm,0,.105*s,0,0,g); part(new THREE.SphereGeometry(.018*s,10,8),gm,0,.15*s,0,0,g);
      for(const sd of [-1,1])part(new THREE.TorusGeometry(.022*s,.007*s,6,12),gm,sd*.095*s,.08*s,0,0,g); R.loose.push([g,name,.8*s*s]); return g; };
    gpot(X0-.13,1.9,1.05); gpot(X0-.13,1.9,1.33,.9);
    { const g=th(X0-.13,1.52,.45); for(let i=0;i<6;i++)part(new THREE.CylinderGeometry(.1,.085,.012,24),white,0,.006+i*.014,0,0,g); R.loose.push([g,'PLATES',2]); }
    const mug=(x,h,z,ry=0)=>{ const g=th(x,h,z,ry), m=mat(MAUVE,{roughness:.45}); part(new THREE.CylinderGeometry(.04,.036,.09,16),m,0,.045,0,0,g);
      part(new THREE.CircleGeometry(.034,14).rotateX(-Math.PI/2),mat([90,56,40],{roughness:.3}),0,.08,0,0,g,false); part(new THREE.TorusGeometry(.025,.008,6,12,Math.PI),m,.04,.045,0,0,g).rotation.z=-Math.PI/2; R.loose.push([g,'MUG',.3]); };
    for(const z of [.95,1.13,1.31,1.49])mug(X0-.13,1.52,z,rnd()*6);
    /* ---------- on the short run: the microwave, the mint toaster, the mills, the bowl of oranges, a little plant ---------- */
    { const g=th(X0-.3,CH,1.0,-Math.PI/2); part(rbox(.5,.29,.36,.02,2),white,0,.145,0,0,g); part(rbox(.32,.2,.01,.008,1),mat([30,32,34],{roughness:.15,metalness:.3}),-.06,.15,.181,0,g);
      part(rbox(.09,.22,.008,.004,1),mat([226,224,216],{roughness:.5}),.18,.15,.182,0,g); for(let i=0;i<3;i++)part(new THREE.CylinderGeometry(.012,.012,.01,10).rotateX(Math.PI/2),black,.18,.21-i*.05,.188,0,g); R.loose.push([g,'MICROWAVE',12]); }
    { const g=th(X0-.2,CH,1.5,-Math.PI/2), mm=mat([180,222,196],{roughness:.3}); part(rbox(.26,.18,.15,.03,3),mm,0,.09,0,0,g);
      for(const z of [-.035,.035])part(new THREE.BoxGeometry(.19,.012,.025),black,0,.176,z,0,g); part(rbox(.02,.03,.02,.005,1),chrome,.14,.12,0,0,g); R.loose.push([g,'TOASTER',1.5]); }
    const mill=(x,z,c0)=>{ const g=th(x,CH,z); part(new THREE.LatheGeometry([[0,0],[.022,0],[.024,.02],[.018,.06],[.022,.1],[.02,.13],[.008,.145],[0,.15]].map(([a,b])=>new THREE.Vector2(a,b)),14),mat(c0,{roughness:.45}),0,0,0,0,g); R.loose.push([g,'MILL',.2]); };
    mill(X0-.12,1.76,[150,92,52]); mill(X0-.12,1.83,[196,140,90]);
    { const g=th(X0-.38,CH,2.02), om=mat([236,120,40],{roughness:.6}); part(new THREE.LatheGeometry([[0,0],[.06,0],[.12,.04],[.13,.07],[.12,.07],[.06,.015],[0,.015]].map(([a,b])=>new THREE.Vector2(a,b)),20),mat([150,92,52],{roughness:.5,side:THREE.DoubleSide}),0,0,0,0,g);
      for(const [x,y,z] of [[-.05,.045,-.03],[.04,.045,-.04],[.05,.045,.04],[-.04,.045,.05],[0,.045,0],[.0,.09,-.01]])part(new THREE.SphereGeometry(.036,12,10),om,x,y,z,0,g); R.loose.push([g,'ORANGES',1.5]); }
    { const g=th(X0-.14,CH,2.22), lm=mat([84,150,64],{roughness:.6,side:THREE.DoubleSide}); part(new THREE.CylinderGeometry(.055,.045,.09,16),mat([236,232,222],{roughness:.5}),0,.045,0,0,g);
      for(let k=0;k<9;k++){ const a=k/9*Math.PI*2, lf=part(new THREE.SphereGeometry(.04,8,6),lm,Math.cos(a)*.04,.12+(k%3)*.02,Math.sin(a)*.04,0,g); lf.scale.set(1,.35,.6); lf.rotation.set(0,-a,.5); } R.loose.push([g,'PLANT',.5]); }
    /* ---------- the range: oven below, four burners that light, under its hood; the dutch oven on it, the crock of spoons and the oils beside it ---------- */
    cap('STOVE',()=>{ const g=new THREE.Group(); g.position.set((ST0+ST1)/2,0,.31); here().add(g); const w=ST1-ST0-.01;
      p(rbox(w,CH-.02,.6,.012,2),white,0,(CH-.02)/2,0,0,g); p(rbox(w-.08,.48,.03,.01,1),white,0,.38,.31,0,g); p(rbox(w-.24,.24,.012,.006,1),mat([22,22,24],{roughness:.1,metalness:.4}),0,.4,.327,0,g);
      p(new THREE.CylinderGeometry(.012,.012,w-.16,10).rotateZ(Math.PI/2),chrome,0,.66,.37,0,g); for(const s of [-1,1])p(new THREE.CylinderGeometry(.008,.008,.05,8).rotateX(Math.PI/2),chrome,s*(w/2-.1),.66,.345,0,g);
      p(rbox(w-.08,.1,.03,.008,1),white,0,.07,.31,0,g); p(rbox(w-.02,.11,.02,.006,1),mat([232,228,218],{roughness:.4}),0,.82,.305,0,g);
      for(const x of [-.27,-.13,.13,.27])p(new THREE.CylinderGeometry(.024,.026,.03,16).rotateX(Math.PI/2),mat([238,234,224],{roughness:.4}),x,.82,.33,0,g);
      p(rbox(w-.01,.02,.58,.004,1),black,0,CH-.01,0,0,g);
      for(const s of [-1,1]){ for(let i=0;i<3;i++)p(new THREE.BoxGeometry(.33,.015,.012),black,s*.18,CH+.01,-.22+i*.22,0,g); for(let i=0;i<3;i++)p(new THREE.BoxGeometry(.012,.015,.5),black,s*.18+(i-1)*.15,CH+.01,0,0,g); }
      const fm=new THREE.MeshBasicMaterial({color:col([90,140,255]),transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false});
      for(const [x,z] of [[-.17,.12],[.17,.12],[-.17,-.14],[.17,-.14]]){ p(new THREE.CylinderGeometry(.04,.045,.02,16),mat([40,40,42],{roughness:.5}),x,CH+.006,z,0,g);
        const f=keep(p(new THREE.TorusGeometry(.045,.006,6,24).rotateX(Math.PI/2),fm,x,CH+.018,z,0,g,false)); f.visible=false; f.userData.flame=1; }
      p(rbox(w,.16,.04,.008,1),white,0,CH+.08,-.29,0,g); light(0x9fb8ff,0,1.4,(ST0+ST1)/2,CH+.1,.4,{flame:1}); sol(ST0,0,ST1,DD,CH+.0175); },{bake:true,wire:'stove'});
    gpot((ST0+ST1)/2-.17,CH+.018,.43,1.25,'DUTCH OVEN',[118,168,140]);
    { const g=th(ST1+.12,CH,.16); part(new THREE.CylinderGeometry(.05,.045,.13,16),mat([238,232,214],{roughness:.4}),0,.065,0,0,g);
      for(let i=0;i<3;i++){ const a=i*2.1, sp=new THREE.Group(); sp.position.set(Math.cos(a)*.015,.1,Math.sin(a)*.015); sp.rotation.set(Math.sin(a)*.25,0,-Math.cos(a)*.25); g.add(sp);
        part(new THREE.CylinderGeometry(.006,.006,.2,6),woodl,0,.05,0,0,sp); const hd=part(new THREE.SphereGeometry(.02,8,6),woodl,0,.16,0,0,sp); hd.scale.set(1,1.4,.5); } R.loose.push([g,'UTENSILS',.6]); }
    for(const x of [ST0-.1,ST0-.2]){ const g=th(x,CH,.08); part(new THREE.LatheGeometry([[0,0],[.022,0],[.024,.08],[.01,.12],[.007,.15]].map(([a,b])=>new THREE.Vector2(a,b)),12),mat([186,112,40],{roughness:.15,transparent:true,opacity:.9}),0,0,0,0,g);
      part(new THREE.CylinderGeometry(.008,.008,.02,8),mat([140,100,70]),0,.155,0,0,g); R.loose.push([g,'OIL',.3]); }
    /* ---------- on the prep counter: the board and the knife ---------- */
    { const g=th((BU+ST0)/2,CH,.34,.1); part(rbox(.42,.022,.24,.01,2),woodl,0,.011,0,0,g); part(rbox(.12,.022,.07,.01,1),woodl,.26,.011,0,0,g); R.loose.push([g,'CUTTING BOARD',.8]); }
    { const g=th((BU+ST0)/2+.05,CH+.022,.36,-.3); part(rbox(.2,.004,.03,.002,1),steel,0,.006,0,0,g); part(rbox(.1,.016,.022,.006,1),mat([70,44,30],{roughness:.5}),-.15,.008,0,0,g); R.loose.push([g,'KNIFE',.15]); }
    /* ---------- the hood over the range, its duct up to the gallery overhead; the wall cabinets either side of it ---------- */
    const STC=(ST0+ST1)/2;
    cap('HOOD',()=>{ const hd=p(new THREE.CylinderGeometry(.4,1,.26,4,1).rotateY(Math.PI/4),steel,STC,1.81,.27); hd.scale.set(.4/.7071,1,.25/.7071);
      p(rbox(.8,.04,.5,.008,1),steel,STC,1.68,.25); p(rbox(.32,MHk-1.94,.2,.006,1),steel,STC,(1.94+MHk)/2,.11);
      p(new THREE.PlaneGeometry(.1,.3).rotateX(Math.PI/2),warm,STC,1.657,.25,0,here(),false); light(0xffd9a0,.6,1.6,STC,1.6,.25); },BK);
    const wallCab=(x0,x1)=>{ p(rbox(x1-x0,.8,.36,.01,2),cab,(x0+x1)/2,1.92,.18); const g=new THREE.Group(); g.position.set(0,0,.36); here().add(g); const w=(x1-x0)/2;
      panel(g,x0+w/2,1.92,w-.01,.76,true,1,true); panel(g,x1-w/2,1.92,w-.01,.76,true,-1,true); };
    cap('WALL CABINET',()=>{ wallCab(BU+.02,ST0-.06); wallCab(ST1+.06,S1-.02); },BK);
    /* ---------- the red fridge by the door: rounded, two doors with chrome handles, lit inside; books and a trailing plant on top, a picture above ---------- */
    const redM=mat(RED,{roughness:.28,metalness:.05}), lin=mat([240,240,236],{roughness:.5,emissive:col([255,250,235]),emissiveIntensity:.25}), FC=(F0+F1)/2;
    cap('FRIDGE',()=>{ for(const x of [F0+.025,F1-.025])p(rbox(.05,1.74,.66,.02,2),redM,x,.87,.35); sol(F0,0,F1,.76,1.74);
      p(rbox(.82,.06,.66,.03,2),redM,FC,1.71,.35); p(rbox(.82,.1,.66,.02,1),redM,FC,.05,.35); p(rbox(.82,1.74,.04,.01,1),redM,FC,.87,.04);
      p(new THREE.PlaneGeometry(.72,1.58),lin,FC,.88,.062,0,here(),false); for(const x of [F0+.052,F1-.052])p(new THREE.BoxGeometry(.004,1.58,.6),lin,x,.88,.36,0,here(),false);
      p(rbox(.72,.04,.62,.005,1),lin,FC,1.17,.37);
      const glass=mat([220,235,240],{transparent:true,opacity:.35,roughness:.1}); for(const h of [.45,.8,1.45])p(rbox(.7,.01,.55,.003,1),glass,FC,h,.36,0,here(),false);
      p(new THREE.CylinderGeometry(.04,.04,.22,14),mat([250,250,248],{roughness:.4}),F0+.2,.92,.3); p(new THREE.CylinderGeometry(.045,.045,.1,14),mat([200,50,60],{roughness:.3}),F0+.42,.51,.32);
      p(rbox(.1,.2,.07,.006,1),mat([240,160,50],{roughness:.5}),F0+.6,.91,.3); p(new THREE.CylinderGeometry(.04,.04,.07,14),mat([240,220,120],{roughness:.4}),F0+.4,1.51,.3);
      const door=(y0,y1,yh)=>{ const g=new THREE.Group(); g.position.set(F1,0,.68); g.userData.door=1; here().add(g); const h=y1-y0, add=(geo,m,x,y,z)=>{ const me=keep(new THREE.Mesh(geo,m)); me.position.set(x,y,z); me.castShadow=me.receiveShadow=true; g.add(me); return me; };
        add(rbox(.82,h,.07,.035,3),redM,-.41,(y0+y1)/2,.035); add(new THREE.BoxGeometry(.72,h-.1,.004),lin,-.41,(y0+y1)/2,-.002);
        add(new THREE.CylinderGeometry(.013,.013,.2,10).rotateZ(Math.PI/2),chrome,-.68,yh,.115); for(const x of [-.6,-.76])add(new THREE.CylinderGeometry(.008,.008,.05,8).rotateX(Math.PI/2),chrome,x,yh,.09); };
      door(.03,1.15,1.07); door(1.19,1.74,1.27); },{bake:true,wire:'fridge'});
    { const g=th(FC+.12,1.74,.42); [[90,110,170],[200,180,90],[170,90,140]].forEach((c0,i)=>part(rbox(.035,.2+i%2*.03,.15,.004,1),mat(c0,{roughness:.6}),i*.04,.1+i%2*.015,0,0,g)); R.loose.push([g,'BOOKS',.8]); }
    { const g=th(F0+.17,1.74,.45), lm=mat([70,140,60],{roughness:.6,side:THREE.DoubleSide}); part(new THREE.CylinderGeometry(.07,.055,.1,16),mat([96,62,44],{roughness:.6}),0,.05,0,0,g);
      for(let k=0;k<7;k++){ const a=k/7*Math.PI*2, lf=part(new THREE.CircleGeometry(.035,8),lm,Math.cos(a)*.05,.12,Math.sin(a)*.05,0,g,false); lf.rotation.set(-1.1,a,0); }
      for(const [dx,dz,n] of [[-1,0,10],[-1,.4,8],[0,1,9]]){ const L=Math.hypot(dx,dz)||1, ex=dx/L, ez=dz/L, reach=ez>.9?.3:.19;
        for(let t=0;t<n;t++){ const out=Math.min(t*.06,reach), dn=Math.max(0,t*.06-reach), lf=part(new THREE.CircleGeometry(.03,7),lm,ex*out+Math.sin(t)*.012,.1-dn*1.4,ez*out+Math.cos(t*1.3)*.012,0,g,false); lf.rotation.set(.4,t,0); lf.userData.soft=1; } }
      R.loose.push([g,'TRAILING PLANT',.6]); }
    cap('KITCHEN PRINT',()=>{ const pc=mat([96,60,36],{roughness:.5,...clip('Wb')}); p(rbox(.3,.36,.025,.006,1),pc,FC,2.28,.0125); p(new THREE.PlaneGeometry(.24,.3),mat([255,255,255],{map:art,roughness:.8,...clip('Wb')}),FC,2.28,.026,0,here(),false); },BK);
  });
  // what the kitchen's pieces do (each copy of one too): the fridge and the dishwasher open, the range lights, the tap runs
  const W=ROOMK.wires;
  const opens=(name,shut,open,ax,amt)=>(un,c)=>{ '@later'; const D=[]; un.obj.traverse(o=>{ if(o.userData.door)D.push({g:o,a:o.rotation[ax]}); }); un.st.open=false;
    c.hit(un,()=>un.st.open?shut:open,()=>{ un.st.open=!un.st.open; if(SFX)SFX.play('latch',{vol:.8,vary:.2}); });
    un.tick=dt=>{ const k=Math.min(1,dt*6); for(const d of D){ d.a+=((un.st.open?amt:0)-d.a)*k; d.g.rotation[ax]=d.a; } }; };
  W.fridge=opens('FRIDGE','CLOSE THE FRIDGE','OPEN THE FRIDGE','y',1.85);
  W.dishwasher=opens('DISHWASHER','CLOSE THE DISHWASHER','OPEN THE DISHWASHER','x',1.45);
  W.stove=(un,c)=>{ '@later'; const F=[]; let L=null; un.obj.traverse(o=>{ if(o.userData.flame){ if(o.isPointLight)L=o; else F.push(o); } }); un.st.on=false;
    c.hit(un,()=>'STOVE: '+(un.st.on?'ON':'OFF'),()=>{ un.st.on=!un.st.on; if(SFX)SFX.play('click',{vol:.8,vary:.2}); });
    un.tick=()=>{ for(const f of F)f.visible=un.st.on; if(L)L.intensity=un.st.on?.5:0; }; };
  W.tap=(un,c)=>{ '@later'; let w=null; un.obj.traverse(o=>{ if(o.userData.water)w=o; }); un.st.on=false;
    c.hit(un,()=>'TAP: '+(un.st.on?'ON':'OFF'),()=>{ un.st.on=!un.st.on; if(SFX)SFX.play(un.st.on?'drip':'click',{vol:.6,vary:.2}); });
    un.tick=()=>{ if(!w)return; w.visible=un.st.on; if(un.st.on)w.scale.x=w.scale.z=.9+.2*Math.sin(performance.now()*.03); }; };
  window.KITCHENDBG=()=>{ '@later'; const A=ROOMK.api; if(!A||!A.R.kitchen)return {built:false}; const U=A.units(), f=k=>U.find(u=>u.wire===k&&!u.gone);
    let n=0; for(const u of A.R.kitchen)u.obj.traverse(o=>{ if(o.isMesh)n++; });
    return {built:!!f('fridge'),fridge:!!(f('fridge')&&f('fridge').st.open),stove:!!(f('stove')&&f('stove').st.on),tap:!!(f('tap')&&f('tap').st.on),dish:!!(f('dishwasher')&&f('dishwasher').st.open),meshes:n,kinds:A.R.kitchen.map(u=>u.kind)}; };
}
