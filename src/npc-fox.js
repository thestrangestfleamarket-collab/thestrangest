// ---- THE FOX, THE BODEGA'S MERCHANT (owner, 17 Oct 2026: "add the fox back as the bodega merchant"; the old game's Fox, CHARS[1] in its
// 10-characters.data, "the fox is the merchant there", 13 Oct 2026): his sprite made 3D in his parts (npc-parts.js), angular as the sprite is
// (owner, 17 Oct 2026: "more angular, like his sprite"): every shape a box, a tapered box or a pyramid (tbox), each face its own tone (flat), measured
// off the sprite's front, side and back frames (32 x 60 px, his feet on row 57, U a pixel): a big boxy white head, wider at the cheeks, a wedge
// muzzle with a block nose, flat-sided ears tan inside leaning out, the orange crown a plate over his brow, the black mask and red eyes as slanted
// blocks under fierce brows (high at the outside, down to the middle, as the sprite's); a six-sided blue roll collar over a blue yoke; a chunky
// boxy puffer jacket flecked blue and cream in three quilt bands with recessed dark seams, a dark hem band, square sleeves; block gloves; wide
// cream trousers as two flared legs in pixel stripes, dark soles. He stands on the mat behind the long counter, facing the aisle, and turns toward
// you when you come near; lit by the shop's lamps, shaded as every character is ----
const FOX={};
{ const {shape,cyl,box,tbox,noise,D2R}=PARTSNPC.T;
  const WHITE=[.95,.93,.88], CREAM=[.93,.85,.7], TAN=[.89,.73,.45], ORANGE=[.84,.42,.24], ORANGE2=[.67,.35,.2], BLUE=[.27,.45,.59], BLUE2=[.36,.53,.67], NAVY=[.15,.17,.27], PANT=[.84,.8,.68], PANT2=[.69,.64,.52], RED=[.53,.24,.18], BLACK=[0,0,0], SOLE=[.45,.43,.36];
  const part=(name,rank,of)=>({name,rank,of,flat:true});
  // the sprite's pixels as his units: U a pixel, Y(row) the height of a row's foot above the ground (his feet on row 57), a shape's place [x, y, z] in pixels
  const U=.034, Y=r=>(57-r)*U, P=(x,y,z)=>[x*U,y,z*U], T=(w0,d0,w1,d1,h,ox=0,oz=0)=>tbox(w0*U,d0*U,w1*U,d1*U,h*U,ox*U,oz*U), B=(w,h,d)=>box(w*U,h*U,d*U);
  // the jacket's flecks: an orange ground, a darker orange in its hollows, blue and cream flecks (the sprite's camo of the old Fox)
  const fleck=(x,y,z)=>{ const v=noise(x,y,z,34), w=noise(x+3.1,y,z,14); return v>.72?BLUE:v<.18?CREAM:w>.68?ORANGE2:ORANGE; };
  // the trousers' folds: the sprite's stripes, a pixel light, a pixel dark, straight down
  const folds=(x,y,z)=>Math.floor(x/U/1.5+.5+100)%2?PANT2:PANT;
  // a puffer's quilt band: a box swelling out to its middle and in again to the seams (two tapered boxes), on row r0 of the sprite, h rows tall
  const band=(r0,h,w,d,col,x=0,z=0)=>[ shape(T(w-1.2,d-1.2,w,d,h/2),col,P(x,Y(r0),z)), shape(T(w,d,w-1.2,d-1.2,h/2),col,P(x,Y(r0)+h/2*U,z)) ];
  const seam=(r,w,d,x=0,z=0)=>shape(B(w-1.4,.7,d-1.4),ORANGE2,P(x,Y(r),z));   // (the dark seam in the hollow between two bands)
  const EARX=6.5, EARZ=-1;   // (the ears over the top of his head, a little back of its middle, as the sprite's side view has them)
  const PARTS=[
    part('nose',0,[ shape(B(3,2.6,3),BLACK,P(0,Y(24.2),11.8)), shape(T(6,2.6,2,2,3.6),BLACK,P(0,Y(31.6),5.6)) ]),   // (the block nose at the muzzle's tip; the dark of his mouth under it, a wedge widening down)
    part('trousers',0,[ shape(T(12,10,12,10,4),PANT,P(0,Y(47),0)),   // (the seat, under the hem)
      ...[-1,1].map(sx=>shape(T(7,11,5.6,10,10),folds,P(sx*3.1,0,0))),   // (the legs: two flared blocks side by side, in stripes)
      ...[-1,1].map(sx=>shape(B(5.4,1,11.5),SOLE,P(sx*3.1,.5*U,.5))) ]),   // (the dark soles)
    part('jacket',0,[ shape(B(16.6,2,14.6),NAVY,P(0,Y(45.5),0)),   // (the dark hem band)
      ...band(43,2.7,16,14,fleck), seam(40.3,16,14), ...band(40.3,2.7,16,14,fleck), seam(37.6,16,14), ...band(37.6,2.6,16,14,fleck),   // (three quilt bands, the seams recessed)
      shape(T(22,14,14,10,4),fleck,P(0,Y(35),0)) ]),   // (the shoulders, a chamfer in to the neck)
    part('sleeves',1,[ ...[-1,1].flatMap(sx=>[ ...band(43,4,3.2,10,fleck,sx*9.4,0), seam(39,3.2,10,sx*9.4,0), ...band(39,4,3.2,10,fleck,sx*9.4,0) ]) ]),   // (square sleeves down the jacket's sides, two bands each)
    part('gloves',2,[-1,1].map(sx=>shape(T(3.6,4.4,4.2,5,5.5),NAVY,P(sx*10,Y(48),1.2)))),   // (block mitts, a little wider at the knuckles)
    part('collar',2,[ shape(T(8,14.8,15.4,15,3.6),BLUE2,P(0,Y(34.6),0)),   // (the blue yoke across his shoulders, a V down his chest and back)
      shape(cyl(6.6*U,5.4*U,3*U,6),BLUE,P(0,Y(33)+1.5*U,0),[1,1,.85],[0,30,0]), shape(cyl(5.6*U,5.8*U,1.3*U,6),BLUE2,P(0,Y(30.4)+.65*U,0),[1,1,.85],[0,30,0]) ]),   // (the roll collar, six-sided, a flat face to the front)
    part('head',2,[ shape(T(18,13,15,12,12),WHITE,P(0,Y(28),0)), shape(T(10,9,18,13,2.2),WHITE,P(0,Y(30.2),0)),   // (the head, wide at the cheeks; the chin under it)
      shape(T(8,7,4.4,5,5),WHITE,P(0,Y(26)-.2*U,6.4),null,[90,0,0]) ]),   // (the muzzle: a wedge out from the face, its tip raised toward the nose)
    part('crown',3,[ shape(T(14,9,10,6,1.3),ORANGE,P(0,Y(16),1)), shape(T(15.4,1.1,9,1.1,6),ORANGE,P(0,Y(22),6.8)) ]),   // (the orange patch over the top of his head, down over his brow as a plate on the face)
    part('mask',3,[-1,1].map(sx=>shape(B(5.2,4.6,1),BLACK,P(sx*4.5,Y(24.5),6.9),null,[0,0,sx*16]))),   // (the black round his eyes, high at the outside, down to the middle: the sprite's fierce look)
    part('eyes',4,[-1,1].map(sx=>shape(B(3,2.4,1.2),RED,P(sx*4,Y(26),7.8),null,[0,0,sx*16]))),
    part('brows',5,[-1,1].map(sx=>shape(B(5.8,1.3,1.2),BLACK,P(sx*4.6,Y(21.8),7.1),null,[0,0,sx*16]))),   // (the brows above, slanted the same)
    part('ears',2,[-1,1].map(sx=>shape(T(7,3.6,1.6,1.4,13,sx*1.6,-.4),WHITE,P(sx*EARX,Y(17.5),EARZ)))),   // (flat-sided, leaning out at the tip)
    part('ear insides',3,[-1,1].map(sx=>shape(T(4.6,.9,.9,.7,10,sx*1.2,-.3),TAN,P(sx*EARX,Y(16.6),EARZ+1.6)))) ];   // (the tan inside, a flat plate on each ear's front)
  // (behind the counter, owner 17 Oct 2026, his picture of him in the shelf: "put behind counter, we need to avoid clipping": the game's mat
  // spot isn't this shop's; the long counter here runs z -7.95 to -4.10 with the wall's mat behind it, 0.7 wide, under the cigarette rack: he
  // stands on that mat facing the aisle, turning toward you only so far (35 degrees) that his shoulders never meet the counter or the wall)
  const AT={x:4.51+LAY.o('bodega').x*TILE,z:-6.1+LAY.o('bodega').y*TILE},   /* (with the bodega where the map's layout put it) */ FACE=-Math.PI/2, TURN=35*Math.PI/180;
  const N=PARTSNPC.make(PARTS,{key:'fox',name:'THE FOX',eye:0,eyeC:'0.,0.,0.',metres:1.6,radius:.27,speed:.4,stride:6,rock:0,bob:.015,lv:'up',group:'bodega',
    x:AT.x,z:AT.z,ground:(x,z)=>MODS.bodega.ground(x,z),
    brain:(dt,you,st,N)=>{ if(N.sheet)return; st.to=null; st.hold=true; const H=N.home||AT; st.x=H.x; st.z=H.z;   // (his place: the mat, or where the hitboxes' check moved him, N.home: clip.js; never wanders)
      let a=FACE; if(Math.hypot(you.x-st.x,you.z-st.z)<4.5*TILE){ if(Math.hypot(you.x-st.x,you.z-st.z)<2.6*TILE&&!((N.greet=(N.greet||0)-dt)>0)&&typeof LINES!=='undefined'){ N.greet=60; LINES.say(N,'fox'); } const w=Math.atan2(you.x-st.x,you.z-st.z), d=((w-FACE+Math.PI*3)%(Math.PI*2))-Math.PI; a=FACE+Math.max(-TURN,Math.min(TURN,d)); }
      st.face={x:st.x+Math.sin(a),z:st.z+Math.cos(a)}; }});   // (toward you when you come near, as far as the space lets him; else the aisle)
  FOX.N=N; window.FOXDBG=()=>{ const w=N.g.getWorldPosition(new THREE.Vector3()), bb=new THREE.Box3().setFromObject(N.g); return {x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),vis:N.g.visible,pvis:N.g.parent&&N.g.parent.visible,far:!!N.far,w:[w.x,w.y,w.z].map(v=>+v.toFixed(2)),size:[bb.max.x-bb.min.x,bb.max.y-bb.min.y].map(v=>+v.toFixed(2)),tris:N.tris}; }; }
