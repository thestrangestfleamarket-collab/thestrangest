// ---- THE ICE CREAM CAT (owner, 17 Oct 2026, his pixel picture: a dark-brown cat with huge yellow eyes and black slit pupils, a waffle cone
// tipped over on his head, its strawberry ice cream melting down the left side of his face, pink sparkles about him; "add this character close
// as possible"). Built here in code, no model, in his parts (npc-parts.js: head, ears, inner ears, eyes, their rims, pupils, nose, mouth, body,
// arms, legs, ice cream, its drips, the cone, the sparkles; each reshapable), one mesh of some 3,000 triangles; his pupils, nose and mouth pure
// black (makeNPC's "eye" part, lit by nothing); his fur two browns by a value noise, the cone's waffle a darker grid. Shaded as the others
// (tones in bands, the clothes' shadows, SELF), lit by the lamps. A chibi: his head most of him, 1.1 m. He walks the whole street as the
// others do (owner: "put any new characters that go in the game into the street walking around"), and turns to you when you come near ----
const CAT={};
{ const {shape,limb,sph,cyl,box,torus,blob,noise}=PARTSNPC.T;
  const FUR=[.30,.19,.18], FUR2=[.40,.28,.26], EAR=[.68,.57,.50], YEL=[.92,.76,.22], YEL2=[.97,.86,.45], RIM=[.14,.07,.06], PINK=[.93,.36,.56], PINK2=[.96,.62,.70], CONE=[.93,.78,.39], CONE2=[.70,.52,.18], SPARK=[.92,.55,.72], BLACK=[0,0,0], WHITE=[1,1,1];
  const part=(name,rank,of)=>({name,rank,of});
  const fur=(x,y,z)=>noise(x,y,z,9)>.55?FUR2:FUR;
  // the cone's waffle: a darker grid across its skin
  const waffle=(x,y,z)=>{ const u=Math.atan2(x,z)*2.2, v=y*18; return Math.abs(u-Math.round(u))<.16||Math.abs(v-Math.round(v))<.16?CONE2:CONE; };
  const spark=(x,y,z)=>[shape(box(.09,.022,.02),SPARK,[x,y,z]),shape(box(.022,.09,.02),SPARK,[x,y,z])];
  const PARTS=[
    part('pupils',0,[ ...[-1,1].map(sx=>shape(blob(.034,.085,.05,8,6),BLACK,[sx*.12,.79,.33])),   // (slits)
      shape(box(.045,.035,.03),BLACK,[0,.695,.31],null,[0,0,45]), shape(box(.03,.012,.02),BLACK,[0,.655,.30]) ]),   // (the nose, the mouth)
    part('head',2,[ shape(sph(.31,14,10),fur,[0,.78,0],[1.06,.94,.92]), shape(blob(.26,.16,.22,12,8),fur,[0,.62,.03]) ]),   // (round, full cheeks)
    part('ears',2,[-1,1].map(sx=>shape(cyl(.01,.11,.2,4),fur,[sx*.23,1.06,-.02],null,[0,45,sx*-22]))),
    part('inner ears',3,[-1,1].map(sx=>shape(cyl(.005,.065,.13,4),EAR,[sx*.225,1.04,.0],null,[0,45,sx*-22]))),
    part('eyes',3,[-1,1].map(sx=>shape(sph(.165,12,9),YEL,[sx*.15,.79,.21],[1,1.08,.7]))),
    part('eye rims',2,[-1,1].map(sx=>shape(torus(.168,.011,6,20),RIM,[sx*.15,.79,.26],[1,1.08,1]))),
    part('glints',4,[-1,1].map(sx=>shape(sph(.022,6,4),WHITE,[sx*.12-.035,.85,.345]))),
    part('body',1,[ shape(blob(.19,.24,.16,12,8),fur,[0,.30,0]), shape(cyl(.12,.15,.1,10),fur,[0,.5,0]) ]),
    part('arms',1,[-1,1].map(sx=>limb([sx*.17,.42,.02],[sx*.21,.18,.06],.05,.04,fur))),
    part('paws',2,[-1,1].flatMap(sx=>[shape(sph(.05,8,6),fur,[sx*.21,.16,.07]),shape(blob(.09,.05,.1,8,6),fur,[sx*.1,.04,.03])])),
    part('legs',1,[-1,1].map(sx=>limb([sx*.09,.2,0],[sx*.1,.04,.02],.06,.05,fur))),
    // the ice cream: a scoop melting over the left of his head, its drips down his brow, his cheek and his side, a drop at each end
    part('ice cream',4,[ shape(blob(.26,.17,.24,12,8),PINK,[-.14,1.0,.03]), shape(blob(.18,.11,.16,10,6),PINK2,[-.08,1.09,-.02]), shape(blob(.15,.1,.12,10,6),PINK,[-.3,.9,.1]), shape(blob(.1,.07,.09,8,6),PINK,[-.1,.95,.22]),
      limb([-.32,.92,.08],[-.36,.5,.1],.055,.035,PINK), limb([-.22,.95,.2],[-.26,.68,.27],.045,.028,PINK), limb([-.08,.97,.24],[-.06,.84,.3],.035,.022,PINK), limb([-.3,.88,-.1],[-.33,.6,-.12],.04,.025,PINK),
      shape(sph(.045,8,6),PINK,[-.36,.49,.1]), shape(sph(.036,8,6),PINK,[-.26,.67,.27]), shape(sph(.028,8,6),PINK,[-.06,.83,.3]), shape(sph(.032,8,6),PINK,[-.33,.59,-.12]) ]),
    part('cone',5,[ shape(cyl(.0,.15,.46,10),waffle,[-.24,1.3,-.02],null,[0,0,40]) ]),   // (its tip up and to his left)
    part('sparkles',0,[ ...spark(.42,1.28,.06), ...spark(.3,1.46,-.02), ...spark(-.47,.74,.1), ...spark(-.5,1.3,0) ]) ];
  const N=PARTSNPC.make(PARTS,Object.assign({key:'cat',name:'THE ICE CREAM CAT',eye:0,eyeC:'0.,0.,0.',metres:1.1,radius:.25,speed:.45,stride:7,rock:.06,bob:.02},PARTSNPC.street(66,-69)));
  CAT.N=N; window.CATDBG=()=>({key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),to:!!N.st.to,vis:N.g.visible,tris:N.tris}); }
