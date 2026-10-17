// ---- THE MOTH MAN (owner, 17 Oct 2026, his sticker: a stout greybeard with a moth's yellow wings and antennae, a denim cap, round black
// sunglasses, shaggy grey hair, a denim jacket open over a tan shirt and his belly, jeans, brown boots; "lets add him into the game, exactly like
// this"). Built here in code in his parts (npc-parts.js: wings, antennae, cap, glasses, hair, beard, head, jacket, sleeves, shirt, hands, jeans,
// boots; each reshapable), one mesh of some 3,000 triangles; his glasses pure black (lit by nothing); the wings' veins as bands of a deeper
// yellow. Shaded as the others, lit by the lamps; he walks the whole street, waddling a little, and turns to you when you come near ----
const MOTH={};
{ const {shape,limb,sph,cyl,box}=PARTSNPC.T;
  const SKIN=[.86,.63,.48], SHIRT=[.56,.5,.36], DENIM=[.36,.46,.56], DENIM2=[.3,.38,.48], CAPC=[.4,.5,.6], GREY=[.52,.5,.47], GREY2=[.45,.43,.4], BROWN=[.6,.4,.2], SOLE=[.4,.27,.14], DARK=[.25,.22,.2], BLACK=[0,0,0], YEL=[.9,.82,.48], YEL2=[.8,.7,.36];
  const part=(name,rank,of)=>({name,rank,of});
  const vein=(x,y,z)=>Math.sin(y*70+x*20)>.6?YEL2:YEL;   // (the wings' veins: bands of a deeper yellow)
  const wing=(sx,r,ry,at,rz,ryaw)=>shape(sph(r,12,8),vein,at,[1,ry,.05],[0,sx*ryaw,sx*rz]);
  const PARTS=[
    part('wings',0,[-1,1].flatMap(sx=>[ wing(sx,.38,.6,[sx*.5,1.25,-.22],25,-30), wing(sx,.27,.6,[sx*.4,.82,-.2],-15,-30) ])),
    part('antennae',0,[-1,1].flatMap(sx=>[ limb([sx*.07,1.7,0],[sx*.3,1.98,-.04],.012,.008,DARK,5), shape(sph(.02,6,4),DARK,[sx*.3,1.98,-.04]) ])),
    part('cap',3,[ shape(sph(.215,12,7),CAPC,[0,1.55,0],[1,.72,1]), shape(box(.3,.03,.2),CAPC,[0,1.56,.24],null,[12,0,0]), shape(sph(.025,6,4),DENIM2,[0,1.71,0]), shape(box(.44,.03,.44),DENIM2,[0,1.56,0],null,[0,45,0]) ]),   // (the dome, the peak, its button, a band under)
    part('glasses',0,[ ...[-1,1].map(sx=>shape(cyl(.058,.058,.02,10),BLACK,[sx*.08,1.45,.19],null,[90,0,0])), shape(box(.05,.012,.02),BLACK,[0,1.455,.195]),
      ...[-1,1].map(sx=>shape(box(.012,.012,.2),BLACK,[sx*.19,1.45,.08])) ]),   // (the lenses, the bridge, the arms)
    part('hair',2,[ ...[-1,1].flatMap(sx=>[ shape(box(.11,.24,.28),GREY,[sx*.2,1.4,-.03],null,[0,0,sx*-8]), shape(box(.08,.12,.12),GREY2,[sx*.26,1.3,-.08],null,[0,sx*20,sx*-20]) ]),
      shape(box(.38,.26,.14),GREY,[0,1.4,-.17]), shape(box(.3,.1,.1),GREY2,[0,1.27,-.19]), shape(box(.2,.08,.1),GREY,[0,1.56,.12],null,[-15,0,0]) ]),   // (the sides, their tufts, the back, a fringe under the peak)
    part('beard',2,[ shape(sph(.17,10,7),GREY,[0,1.29,.1],[1,.95,.7]), shape(box(.22,.055,.07),GREY2,[0,1.375,.18]), shape(box(.18,.1,.08),GREY2,[0,1.17,.14]) ]),   // (the beard, the moustache, its point)
    part('head',1,[ shape(sph(.2,12,8),SKIN,[0,1.42,0]), shape(sph(.045,6,5),SKIN,[0,1.4,.2]), ...[-1,1].map(sx=>shape(sph(.035,6,4),SKIN,[sx*.2,1.42,0])) ]),   // (the head, the nose, the ears)
    part('jacket',2,[ shape(box(.6,.52,.12),DENIM,[0,.95,-.24]), shape(sph(.36,10,6),DENIM,[0,1.17,0],[1,.42,.92]), shape(box(.32,.07,.12),DENIM2,[0,1.3,-.06]),   // (the back, the shoulders, the collar)
      ...[-1,1].flatMap(sx=>[ shape(box(.2,.52,.1),DENIM,[sx*.26,.92,.2],null,[0,sx*-22,sx*-4]), shape(box(.11,.09,.025),DENIM2,[sx*.27,1.0,.26],null,[0,sx*-22,0]), shape(sph(.012,5,4),[.75,.7,.55],[sx*.27,1.04,.28]) ]) ]),   // (the front panels, their pockets and buttons)
    part('sleeves',2,[-1,1].flatMap(sx=>[ limb([sx*.33,1.14,0],[sx*.44,.62,.06],.11,.085,DENIM), shape(cyl(.09,.09,.05,8),DENIM2,[sx*.44,.6,.06]) ])),   // (the sleeves, their cuffs)
    part('shirt',0,[ shape(sph(.33,12,8),SHIRT,[0,.85,.02],[1,1.0,.8]), shape(cyl(.3,.3,.3,12),SHIRT,[0,.68,0],[1,1,.8]) ]),   // (his belly)
    part('hands',0,[-1,1].map(sx=>shape(sph(.07,8,6),SKIN,[sx*.45,.52,.08],[1,1.2,.9]))),
    part('jeans',0,[ shape(cyl(.31,.27,.3,12),DENIM2,[0,.5,0],[1,1,.8]), ...[-1,1].flatMap(sx=>[ limb([sx*.13,.52,0],[sx*.14,.14,0],.11,.09,DENIM2), shape(cyl(.1,.1,.06,8),DENIM,[sx*.14,.15,0]) ]) ]),   // (the seat, the legs, the turned cuffs)
    part('boots',1,[-1,1].flatMap(sx=>[ shape(box(.17,.12,.3),BROWN,[sx*.15,.07,.05]), shape(sph(.085,8,6),BROWN,[sx*.15,.075,.18],[1,.9,1]), shape(box(.18,.03,.33),SOLE,[sx*.15,.015,.06]) ])) ];
  const N=PARTSNPC.make(PARTS,Object.assign({key:'mothman',name:'THE MOTH MAN',eye:3,eyeC:'0.,0.,0.',metres:1.95,radius:.36,speed:.32,stride:7,rock:.06,bob:.03},PARTSNPC.street(84,-64)));
  MOTH.N=N; window.MOTHDBG=()=>({key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),to:!!N.st.to,vis:N.g.visible,tris:N.tris}); }
