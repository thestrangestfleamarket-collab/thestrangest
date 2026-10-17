// ---- THE FORTUNE TELLER'S CRYSTAL BALL (owner, 17 Oct 2026, his picture: a glass ball on a black ringed base on a speckled stone table, and in
// it a man's head, pale blue-lit, a wild frizzed mane of white hair risen above his forehead and long wavy locks hanging round him, a thin
// moustache, light eyes; "create 3d model, simple graphics, match 1:1, different elements sep items"; then "i always want to be able to tell what
// the faces look like"; "stop rounding things in bubble shapes, smooth flowing shapes"; "match the shapes closer, think real textures"). Built in
// code in its parts (npc-parts.js: the table, the base, the glow, the head, the eyes, the brows, the moustache, the crown and the locks of hair;
// each reshapable: N.reshape, N.recolour) from smooth shapes: the head turned on a lathe from a real profile (forehead, brow, cheek, jaw, chin),
// every strand of hair a tube swept along a curve (the crown's strands rising and curling over, the locks waving down round the sides and back,
// none over the face), the brows and the moustache arcs, the base and the glow turned; the stone cut fine enough for its speckle to show.
// The eyes the glowing part (lit by nothing, a pale blue); the glass a clear sphere of its own over the head (one basic material). It stands on the
// shops' sidewalk by the bodega and never moves. ?sheet=crystal its sheet. Cost: ~9,000 triangles (the strands), no lights ----
const CRYSTAL={};
{ const {shape,sph,box,noise}=PARTSNPC.T, part=(name,rank,of)=>({name,rank,of}), V3=(x,y,z)=>new THREE.Vector3(x,y,z);
  const tube=(pts,r,col,seg=14,rad=6)=>shape(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>V3(...p))),seg,r,rad,false),col);
  const lathe=(prof,col,at,seg=18,sc)=>shape(new THREE.LatheGeometry(prof.map(([x,y])=>new THREE.Vector2(x,y)),seg),col,at,sc);
  const STONE=(x,y,z)=>{ const v=noise(x,y,z,9), w=noise(x+5,y,z,46); return w>.74?[.66,.62,.58]:w<.2?[.3,.28,.27]:v>.55?[.52,.48,.45]:[.45,.42,.4]; };   // (a slow mottle, a fine speckle over it)   // (the table: a dark stone, speckled with lighter grains)
  const BLACK=[.05,.05,.06], RIM=[.14,.14,.16], SKIN=[.8,.92,.93], HAIR=(x,y,z)=>{ const v=noise(x,y,z,17); return v>.55?[.96,.96,.92]:[.84,.86,.84]; }, GLOW=[.45,.95,1];
  const Y=.92, C=[0,Y+.4,0], R=.37;   // (the table's top, the ball's middle and its radius, metres)
  let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  // THE HAIR: the crown, strands rising from the top of the head and curling over, a frizzed mass above the forehead; the locks, long strands
  // from the sides and back of the crown waving down to the ball's foot
  const crown=[], locks=[];
  for(let i=0;i<22;i++){ const a=(i/22)*Math.PI*2+rnd()*.25, r0=.09, up=.08+rnd()*.08, out=.08+rnd()*.08, sx=Math.sin(a), cz=Math.cos(a), lean=cz>0?.5:.1;   // (risen, curling over; all inside the glass)
    crown.push(tube([[sx*r0*.8,C[1]+.14,cz*r0*.8-.03],[sx*(r0+out*.5),C[1]+.14+up*.7,cz*(r0+out*.5)*.8-.04+lean*up*.3],[sx*(r0+out),C[1]+.14+up,cz*(r0+out)*.8-.05+lean*up*.6],[sx*(r0+out*1.2),C[1]+.14+up*.75,cz*(r0+out*1.2)*.8-.06+lean*up*.9]],.03+rnd()*.012,HAIR,12,6)); }
  for(let i=0;i<18;i++){ const a=(i/18)*Math.PI*2+rnd()*.3, sx=Math.sin(a), cz=Math.cos(a); if(cz>.25&&Math.abs(sx)<.85)continue;   // (never over the face; two frame it at the sides)
    const r=.17+rnd()*.04, len=.26+rnd()*.14, w=.03+rnd()*.03, ph=rnd()*6, pts=[];
    for(let k=0;k<=5;k++){ const u=k/5, rr=r+Math.sin(u*2.6+ph)*w+u*.03; pts.push([sx*rr+Math.cos(u*5+ph)*.015,C[1]+.1-len*u,cz*rr*.85-.06+Math.sin(u*4+ph)*.015]); }
    locks.push(tube(pts,.028+rnd()*.012,HAIR,14,6)); }
  // THE FACE (owner: "i always want to be able to tell what the faces look like"): a long pale face lit blue from below, turned from its profile
  // (the chin, the jaw, the cheeks, the brow, the forehead, the crown), the eyes set in with whites and light pupils (the glowing part), thick white
  // brows arched, a nose, a thin moustache drooping at its ends, a mouth line
  const HEAD=[[0,-.2],[.05,-.195],[.085,-.17],[.11,-.12],[.125,-.06],[.135,0],[.135,.06],[.125,.11],[.105,.15],[.07,.185],[0,.2]];
  const PARTS=[
    part('table',0,[ shape(new THREE.BoxGeometry(.95,.1,.75,18,2,14),STONE,[0,Y-.05,0]), shape(new THREE.BoxGeometry(.8,.82,.6,16,16,12),STONE,[0,(Y-.1)/2,0]) ]),
    part('base',1,[ lathe([[0,0],[.22,0],[.225,.03],[.19,.035],[.2,.07],[.165,.075],[.165,.1],[.12,.11],[0,.11]],(x,y)=>y>Y+.062?RIM:BLACK,[0,Y,0],20) ]),
    part('glow',0,[ lathe([[0,0],[.16,0],[.2,.03],[.17,.07],[.08,.09],[0,.09]],GLOW,[0,Y+.1,0],16) ]),
    part('head',1,[ lathe(HEAD,SKIN,[0,C[1],0],16,[1,1,.92]), tube([[0,C[1]+.05,.125],[0,C[1]+.01,.138],[0,C[1]-.025,.148],[0,C[1]-.04,.14]],.017,[.6,.78,.82],8,6), shape(box(.055,.006,.01).toNonIndexed(),[.28,.42,.48],[0,C[1]-.09,.134]) ]),   // (the face, the nose, the mouth)
    part('eye whites',2,[-1,1].map(sx=>shape(sph(.026,10,7),[.96,.98,1],[sx*.055,C[1]+.025,.118],[1,.75,.55]))),
    part('eyes',3,[-1,1].map(sx=>shape(sph(.012,8,6),[1,1,1],[sx*.055,C[1]+.025,.136]))),
    part('brows',3,[-1,1].map(sx=>tube([[sx*.02,C[1]+.058,.128],[sx*.055,C[1]+.07,.126],[sx*.09,C[1]+.06,.11]],.011,[.94,.94,.9],8,5))),
    part('moustache',3,[-1,1].map(sx=>tube([[sx*.006,C[1]-.062,.138],[sx*.03,C[1]-.065,.137],[sx*.052,C[1]-.08,.128]],.008,[.84,.86,.84],8,5))),
    part('crown',3,crown), part('locks',3,locks) ];
  const AT=PARTSNPC.street(62.5,-75.2);
  const N=PARTSNPC.make(PARTS,Object.assign({key:'crystal',name:'THE CRYSTAL BALL',eye:5,eyeC:'.6,.88,1.',metres:Y+.4+R,radius:.55,speed:0,stride:0,rock:0,bob:0,
    brain:(dt,you,st,N)=>{ if(N.sheet)return; st.to=null; st.hold=true; st.face=null; st.x=AT.x; st.z=AT.z; st.h=Math.PI; }},AT));   // (its place by the kerb; its face to the street)
  // THE GLASS: a clear sphere over the head, the picture's turquoise added faintly, drawn last so the head shows through it
  const glass=new THREE.Mesh(new THREE.SphereGeometry(R,24,16),new THREE.MeshBasicMaterial({color:0x6fd8e8,transparent:true,opacity:.13,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
  glass.position.set(0,C[1],0); glass.renderOrder=5; N.body.add(glass); N.glass=glass;
  CRYSTAL.N=N; window.CRYSTALCAM=(k=2.4)=>{ UI.setFree(true); UI.camT.set(N.st.x,N.g.position.y+N.H*.72,N.st.z); ppu=ppuTo=PPU*k; };   /* (a test's look) */ window.CRYSTALDBG=()=>({x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),vis:N.g.visible,tris:N.tris}); }
