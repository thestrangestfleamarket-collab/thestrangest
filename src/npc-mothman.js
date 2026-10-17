// ---- THE MOTH MAN (owner, 17 Oct 2026, his sticker: a stout greybeard with a moth's yellow wings and antennae, a denim cap, round black
// sunglasses, shaggy grey hair, a denim jacket open over a tan shirt and his belly, jeans, brown boots; "lets add him into the game, exactly like
// this"; then "not so blocky, more natural shape, rounded, match the image"). Built here in code in his parts (npc-parts.js: wings, antennae,
// cap, glasses, hair, beard, head, jacket, sleeves, shirt, hands, jeans, boots; each reshapable) from rounded shapes only: soft clumps for the
// hair and the beard, capsules for the limbs, the jacket an open curved shell over his belly, the boots rounded; one mesh of some 8,000
// triangles; his glasses pure black (lit by nothing); the wings' veins as bands of a deeper yellow. Shaded as the others, lit by the lamps; he
// walks the whole street, waddling a little, and turns to you when you come near ----
const MOTH={};
{ const {shape,limb,sph,cyl,torus,capsule,shell,blob}=PARTSNPC.T, PI=Math.PI;
  const SKIN=[.86,.63,.48], SHIRT=[.56,.5,.36], DENIM=[.36,.46,.56], DENIM2=[.3,.38,.48], CAPC=[.4,.5,.6], GREY=[.52,.5,.47], GREY2=[.45,.43,.4], BROWN=[.6,.4,.2], DENIM3=[.22,.28,.38], STITCH=[.8,.62,.33], BRASS=[.72,.6,.35], SOLE=[.4,.27,.14], DARK=[.25,.22,.2], BLACK=[0,0,0], YEL=[.9,.82,.48], YEL2=[.8,.7,.36];
  const part=(name,rank,of,fab)=>({name,rank,of,fab});
  // the cloth's fading: the jacket lighter over the shoulders and the chest's front, the jeans at the thighs' front and the knees; darker in the folds behind the knees
  const fade=(c,k)=>[c[0]+(.5-c[0])*k,c[1]+(.58-c[1])*k,c[2]+(.66-c[2])*k];
  const jacketCol=(x,y,z)=>fade(DENIM,Math.max(0,z)*.9*(y>.95?1:.5)+Math.max(0,y-1.1)*1.5);
  const jeansCol=(x,y,z)=>{ const knee=Math.exp(-(((y-.28)/.09)**2)), front=Math.max(0,z)*4; return fade(DENIM2,Math.min(.7,front*(.12+.45*knee)+Math.max(0,y-.45)*front*.3)-(z<-.05&&knee>.4?.15:0)); };
  const vein=(x,y,z)=>Math.sin(y*70+x*20)>.6?YEL2:YEL;   // (the wings' veins: bands of a deeper yellow)
  // a wing: a soft leaf (a blob, broad, thin), its root at his back, tipped up or down and swept back
  const wing=(sx,rx,ry,at,rz,ryaw)=>shape(blob(rx,ry,.025,12,8),vein,at,null,[0,sx*ryaw,sx*rz]);
  // an antenna: three short limbs curving up and out, a bead at the tip
  const antenna=sx=>{ const p=[[sx*.06,1.7,.02],[sx*.14,1.84,0],[sx*.24,1.93,-.03],[sx*.32,1.97,-.05]], of=[]; for(let i=0;i<3;i++)of.push(limb(p[i],p[i+1],.013-i*.002,.011-i*.002,DARK,6)); of.push(shape(sph(.02,8,6),DARK,p[3])); return of; };
  // the hair's tufts: soft clumps standing out round the sides and back, a few under the cap's peak
  const TUFTS=[[.22,1.47,-.05,.07,.05,.09],[.25,1.36,-.02,.06,.09,.08],[.2,1.3,-.12,.07,.06,.07],[.1,1.33,-.2,.06,.05,.06],[0,1.3,-.22,.08,.06,.05],[.14,1.5,-.17,.07,.05,.07],[.1,1.55,.14,.06,.035,.05]];
  const PARTS=[
    part('wings',0,[-1,1].flatMap(sx=>[ wing(sx,.42,.26,[sx*.52,1.24,-.22],22,-28), wing(sx,.3,.18,[sx*.42,.84,-.2],-18,-28) ])),
    part('antennae',0,[-1,1].flatMap(antenna)),
    part('cap',3,[ shape(blob(.22,.16,.22,16,10),CAPC,[0,1.55,0]), shape(blob(.16,.02,.14,12,6),CAPC,[0,1.555,.25],null,[10,0,0]), shape(sph(.025,8,6),DENIM2,[0,1.71,0]), shape(torus(.215,.018,8,20),DENIM2,[0,1.555,0],null,[90,0,0]) ]),   // (the dome, the peak, its button, the band)
    part('glasses',0,[ ...[-1,1].map(sx=>shape(cyl(.058,.058,.02,14),BLACK,[sx*.08,1.45,.19],null,[90,0,0])), shape(capsule(.007,.03,2,6),BLACK,[0,1.455,.195],null,[0,0,90]),
      ...[-1,1].map(sx=>shape(capsule(.007,.18,2,6),BLACK,[sx*.19,1.45,.09],null,[90,0,0])) ]),   // (the lenses, the bridge, the arms)
    part('hair',2,[ ...[-1,1].flatMap(sx=>[ shape(blob(.1,.13,.15),GREY,[sx*.19,1.4,-.03]), ...TUFTS.map(([x,y,z,a,b,c])=>shape(blob(a,b,c,8,6),GREY2,[sx*x,y,z],null,[0,0,sx*-25])) ]),
      shape(blob(.2,.15,.13),GREY,[0,1.38,-.14]) ]),   // (the sides, the tufts, the back)
    part('beard',2,[ shape(blob(.18,.17,.12),GREY,[0,1.28,.08]), shape(blob(.1,.12,.08,10,7),GREY2,[0,1.14,.12]),   // (the beard, its point)
      ...[-1,1].map(sx=>shape(capsule(.03,.08,3,8),GREY2,[sx*.08,1.365,.18],null,[0,0,sx*70-sx*8])) ]),   // (the moustache, drooping a little)
    part('head',1,[ shape(sph(.2,12,9),SKIN,[0,1.42,0]), shape(sph(.045,8,6),SKIN,[0,1.4,.2]), ...[-1,1].map(sx=>shape(blob(.025,.04,.03,8,6),SKIN,[sx*.2,1.42,0])) ]),   // (the head, the nose, the ears)
    // THE JACKET, as a denim jacket is cut (owner: "logical design"): an open shell round the back and sides, the two fronts hanging open over the
    // belly, a yoke seam across the shoulders, the collar, chest pockets with buttoned flaps, a row of buttons down the left front, cuffs with a
    // button; its seams a darker line, its stitching tan; the denim twill woven in the shader (fab), faded a little over the shoulders and chest
    part('jacket',2,[ shape(shell(.36,.34,.56,16,PI*.32,PI*1.36),jacketCol,[0,.92,0],[1,1,.85]), shape(blob(.37,.15,.32,16,8),jacketCol,[0,1.17,0]), shape(shell(.2,.19,.09,12,PI*.3,PI*1.4),DENIM2,[0,1.3,-.03]),
      ...[-1,1].flatMap(sx=>[ shape(shell(.38,.36,.54,8,sx>0?PI*.12:-PI*.36,PI*.24),jacketCol,[0,.9,0],[1,1,.85]) ]) ],1),
    part('jacket seams',0,[ shape(capsule(.008,.5,2,5),DENIM3,[0,1.2,-.3],null,[0,0,90]),   // (the yoke seam across the back)
      ...[-1,1].flatMap(sx=>[ shape(capsule(.008,.5,2,5),DENIM3,[sx*.12,.9,.33]), shape(capsule(.005,.5,2,5),STITCH,[sx*.14,.9,.335]),   // (each front's edge, its stitching beside)
        shape(blob(.065,.05,.012,8,6),DENIM2,[sx*.27,1.0,.27],null,[0,sx*-25,0]), shape(capsule(.005,.1,2,5),STITCH,[sx*.27,1.04,.285],null,[0,sx*-25,90]), shape(sph(.012,6,5),BRASS,[sx*.27,.985,.285]),   // (a pocket's flap, its stitching, its button)
        shape(capsule(.006,.14,2,5),STITCH,[sx*.3,1.19,.12],null,[0,sx*-25,sx*60]) ]),   // (the pocket's seam down from the yoke)
      ...[0,1,2,3,4].map(k=>shape(sph(.012,6,5),BRASS,[-.11,1.12-k*.1,.34])) ]),   // (the buttons down the left front)
    part('sleeves',2,[-1,1].flatMap(sx=>[ shape(sph(.12,12,8),jacketCol,[sx*.33,1.12,0]), limb([sx*.33,1.12,0],[sx*.44,.62,.06],.11,.085,jacketCol,12), shape(torus(.085,.022,8,14),DENIM2,[sx*.44,.6,.06],null,[90,0,0]),   // (the shoulders, the sleeves, the cuffs)
      shape(capsule(.006,.42,2,5),DENIM3,[sx*.45,.87,-.04],null,[0,0,sx*-12]), shape(sph(.01,6,5),BRASS,[sx*.5,.6,.1]) ],1)),   // (the sleeve's seam, the cuff's button)
    part('shirt',1,[ shape(blob(.33,.34,.27,14,9),SHIRT,[0,.85,.02]), shape(blob(.3,.2,.24,14,8),SHIRT,[0,.66,.02]) ]),   // (his belly, his paunch: over the jeans, so it shades the waistband)
    part('hands',0,[-1,1].flatMap(sx=>[ shape(blob(.07,.085,.06,10,8),SKIN,[sx*.45,.52,.08]), shape(sph(.03,8,6),SKIN,[sx*.4,.55,.12]) ])),   // (the hands, their thumbs)
    // THE JEANS, as jeans are cut: the seat, the legs, a waistband with its button and belt loops, the fly, the front pockets' curved openings,
    // two back pockets, the outer seams, the inseams, the turned cuffs; the twill (fab), faded at the thighs and the knees, darker in the seams
    part('jeans',0,[ shape(blob(.31,.2,.25,16,8),jeansCol,[0,.5,0]), ...[-1,1].flatMap(sx=>[ shape(capsule(.105,.28,4,12),jeansCol,[sx*.13,.32,0]), shape(torus(.095,.025,8,14),DENIM,[sx*.14,.17,0],null,[90,0,0]) ]) ],1),
    part('jeans seams',0,[ shape(torus(.3,.028,8,20),DENIM3,[0,.63,0],[1,1,.8],[90,0,0]), shape(sph(.014,6,5),BRASS,[0,.63,.25]), shape(capsule(.006,.14,2,5),DENIM3,[0,.52,.26]),   // (the waistband, its button, the fly)
      ...[-1,1].flatMap(sx=>[ shape(capsule(.012,.04,2,5),DENIM3,[sx*.12,.63,.22]), shape(capsule(.012,.04,2,5),DENIM3,[sx*.2,.63,-.14]),   // (belt loops)
        shape(new THREE.TorusGeometry(.085,.006,5,10,PI*.55),STITCH,[sx*.16,.56,.2],null,[0,sx*-30,sx*-100]),   // (a front pocket's curved opening)
        shape(blob(.06,.065,.01,8,6),jeansCol,[sx*.11,.5,-.2],null,[0,0,0]), shape(capsule(.005,.1,2,5),STITCH,[sx*.11,.5,-.21],null,[0,0,0]),   // (a back pocket, its stitching)
        shape(capsule(.007,.3,2,5),DENIM3,[sx*.235,.33,0],null,[0,0,sx*-3]), shape(capsule(.005,.3,2,5),STITCH,[sx*.228,.33,.02],null,[0,0,sx*-3]),   // (the outer seam, its stitching)
        shape(capsule(.007,.28,2,5),DENIM3,[sx*.035,.3,.02]) ]) ]),   // (the inseam)
    part('boots',1,[-1,1].flatMap(sx=>[ shape(blob(.095,.07,.17,12,8),BROWN,[sx*.15,.07,.05]), shape(sph(.085,12,8),BROWN,[sx*.15,.08,.17],[1,.9,1]), shape(blob(.1,.015,.18,12,6),SOLE,[sx*.15,.015,.06]) ])) ];
  const N=PARTSNPC.make(PARTS,Object.assign({key:'mothman',name:'THE MOTH MAN',eye:3,eyeC:'0.,0.,0.',metres:1.95,radius:.36,speed:.32,stride:7,rock:.06,bob:.03},PARTSNPC.street(84,-64)));
  MOTH.N=N; window.MOTHDBG=()=>({key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),to:!!N.st.to,vis:N.g.visible,tris:N.tris}); }
