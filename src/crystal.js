// ---- THE FORTUNE TELLER'S CRYSTAL BALL (owner, 17 Oct 2026, his picture: a glass ball on a black ringed base on a speckled stone table, and in
// it a man's head, pale blue-lit, a wild mane of white hair and locks hanging round it, a thin moustache, light eyes; "create 3d model, simple
// graphics, match 1:1, different elements sep items"). Built in code in its parts (npc-parts.js: the table, the base, the head, the hair, the
// moustache, the eyes, the brows, the glow at the ball's foot; each reshapable: N.reshape, N.recolour), one mesh of some 2,400 triangles, through
// makeNPC like the rest (lamp-lit, the tones in bands, SELF); the eyes the glowing part (lit by nothing, a pale blue); the glass a sphere of its
// own over the head, clear with a little of the picture's turquoise added (one basic material, no new program, drawn after the world). It stands
// on the shops' sidewalk by the bodega and never moves. ?sheet=crystal its sheet. Cost: ~2,400 triangles, no lights ----
const CRYSTAL={};
{ const {shape,sph,cyl,box,blob,noise}=PARTSNPC.T, part=(name,rank,of)=>({name,rank,of});
  const STONE=(x,y,z)=>{ const v=noise(x,y,z,11); return v>.68?[.42,.38,.36]:v>.36?[.33,.3,.29]:[.25,.23,.22]; };   // (the table: a dark stone, speckled)
  const BLACK=[.05,.05,.06], RIM=[.13,.13,.15], SKIN=[.66,.84,.86], LIP=[.5,.68,.74], HAIR=(x,y,z)=>{ const v=noise(x,y,z,9); return v>.55?[.95,.95,.9]:[.86,.87,.84]; }, GLOW=[.45,.95,1];
  const Y=.92, C=[0,Y+.37,0], R=.33;   // (the table's top, the ball's middle and its radius, metres)
  // the hair: a mane: a big crown over the head, clumps out to each side and up, and long locks hanging down and round inside the ball
  const hair=[ shape(blob(.2,.17,.17,12,8),HAIR,[0,C[1]+.1,-.02]), shape(blob(.13,.11,.11,10,7),HAIR,[.1,C[1]+.2,-.04],null,[0,0,-20]), shape(blob(.12,.1,.1,10,7),HAIR,[-.11,C[1]+.19,-.03],null,[0,0,25]), shape(blob(.07,.1,.06,8,6),HAIR,[.02,C[1]+.25,-.03],null,[0,0,10]) ];
  { let seed=11; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
    for(let i=0;i<14;i++){ const a=(i/14)*Math.PI*2+rnd()*.3, r=.16+rnd()*.06, len=.16+rnd()*.14, x=Math.sin(a)*r, z=Math.cos(a)*r*.75-.03, y=C[1]-len*.5-.02, front=Math.cos(a)>.5;
      if(front&&Math.abs(x)<.1)continue;   // (not over his face)
      hair.push(shape(blob(.045,len*.5,.04,8,6),HAIR,[x,y,z],null,[rnd()*20-10,0,-Math.sin(a)*18])); } }
  const PARTS=[
    part('table',0,[ shape(box(.95,.1,.75),STONE,[0,Y-.05,0]), shape(box(.8,.82,.6),STONE,[0,(Y-.1)/2,0]) ]),
    part('base',1,[ shape(cyl(.2,.22,.045,16),BLACK,[0,Y+.022,0]), shape(cyl(.17,.2,.03,16),RIM,[0,Y+.06,0]), shape(cyl(.15,.17,.025,16),BLACK,[0,Y+.088,0]) ]),
    part('glow',0,[ shape(blob(.22,.07,.2,12,6),GLOW,[0,Y+.11,0]) ]),   // (the light at the ball's foot)
    part('head',1,[ shape(sph(.115,12,9),SKIN,[0,C[1]-.01,.02],[.92,1.08,.95]), shape(blob(.08,.05,.05,8,6),SKIN,[0,C[1]-.12,.04]), shape(box(.012,.028,.012),LIP,[0,C[1]-.085,.125]) ]),   // (the face, the chin, the nose)
    part('eyes',2,[-1,1].map(sx=>shape(sph(.016,6,4),[1,1,1],[sx*.04,C[1]+.005,.115]))),
    part('brows',2,[-1,1].map(sx=>shape(blob(.03,.008,.012,6,4),[.9,.9,.88],[sx*.045,C[1]+.04,.11],null,[0,0,sx*-10]))),
    part('moustache',2,[-1,1].map(sx=>shape(blob(.03,.008,.012,6,4),[.8,.82,.8],[sx*.03,C[1]-.07,.118],null,[0,0,sx*-8]))),
    part('hair',3,hair) ];
  const AT=PARTSNPC.street(62.5,-75.2);
  const N=PARTSNPC.make(PARTS,Object.assign({key:'crystal',name:'THE CRYSTAL BALL',eye:4,eyeC:'.7,.92,1.',metres:Y+.37+R,radius:.55,speed:0,stride:0,rock:0,bob:0,
    brain:(dt,you,st,N)=>{ if(N.sheet)return; st.to=null; st.hold=true; st.face=null; st.x=AT.x; st.z=AT.z; st.h=Math.PI; }},AT));   // (its place by the kerb; its face to the street)
  // THE GLASS: a clear sphere over the head, the picture's turquoise added faintly, drawn last so the head shows through it
  const glass=new THREE.Mesh(new THREE.SphereGeometry(R,20,14),new THREE.MeshBasicMaterial({color:0x6fd8e8,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
  glass.position.set(0,C[1],0); glass.renderOrder=5; N.body.add(glass); N.glass=glass;
  CRYSTAL.N=N; window.CRYSTALCAM=(k=2.4)=>{ UI.setFree(true); UI.camT.set(N.st.x,N.g.position.y+N.H*.72,N.st.z); ppu=ppuTo=PPU*k; };   /* (a test's look) */ window.CRYSTALDBG=()=>({x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),vis:N.g.visible,tris:N.tris}); }
