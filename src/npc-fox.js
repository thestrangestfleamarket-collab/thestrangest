// ---- THE FOX, THE BODEGA'S MERCHANT (owner, 17 Oct 2026: "add the fox back as the bodega merchant"; the old game's Fox, CHARS[1] in its
// 10-characters.data, "the fox is the merchant there", 13 Oct 2026): his sprite made 3D in his parts (npc-parts.js): a big white fox's head, its
// tall ears tan inside, an orange patch on his crown, a fierce dark-red look under black brows, a black nose (makeNPC's "eye" part, lit by
// nothing); a blue roll collar; a puffy orange jacket flecked blue and cream; navy gloves; wide cream trousers in folds to the floor. He stands
// on the mat behind the long counter, facing the aisle, and turns toward you when you come near; lit by the shop's lamps, shaded as every character is ----
const FOX={};
{ const {shape,limb,sph,cyl,box,blob,noise,D2R}=PARTSNPC.T;
  const WHITE=[.95,.93,.88], CREAM=[.93,.85,.7], TAN=[.89,.73,.45], ORANGE=[.84,.42,.24], ORANGE2=[.67,.35,.2], BLUE=[.27,.45,.59], BLUE2=[.36,.53,.67], NAVY=[.15,.17,.27], PANT=[.84,.8,.68], PANT2=[.69,.64,.52], RED=[.53,.24,.18], BLACK=[0,0,0];
  const part=(name,rank,of)=>({name,rank,of});
  // the jacket's flecks: an orange ground, a darker orange in its hollows, blue and cream flecks (the sprite's camo of the old Fox)
  const fleck=(x,y,z)=>{ const v=noise(x,y,z,34), w=noise(x+3.1,y,z,14); return v>.72?BLUE:v<.18?CREAM:w>.68?ORANGE2:ORANGE; };
  // the trousers' folds: lengthwise, darker in the hollows
  const folds=(x,y,z)=>{ const a=Math.atan2(x,z); return Math.sin(a*9)>.55?PANT2:PANT; };
  const PARTS=[
    part('nose',0,[ shape(blob(.05,.04,.04,8,6),BLACK,[0,1.2,.3]), shape(blob(.035,.05,.02,8,6),BLACK,[0,1.15,.27]) ]),   // (the nose and the dark of his mouth below it)
    part('trousers',0,[ ...[-1,1].map(sx=>shape(cyl(.12,.15,.62,14),folds,[sx*.1,.31,0])), shape(blob(.23,.08,.17,12,6),PANT,[0,.6,0]) ]),
    part('jacket',0,[ shape(blob(.33,.25,.25,28,18),fleck,[0,.82,0]), ...[.7,.82,.94].map(y=>shape(cyl(.31,.31,.03,16),ORANGE2,[0,y,0],[1,1,.78])) ]),   // (a puffer's quilted bands)
    part('sleeves',1,[ ...[-1,1].flatMap(sx=>[shape(blob(.1,.2,.11,10,8),fleck,[sx*.33,.82,.02],null,[0,0,sx*12]), shape(blob(.1,.07,.1,10,6),fleck,[sx*.36,.64,.05])]) ]),
    part('gloves',2,[-1,1].map(sx=>shape(blob(.07,.08,.07,8,6),NAVY,[sx*.36,.55,.08]))),
    part('collar',2,[ shape(cyl(.17,.2,.09,14),BLUE,[0,1.05,0]), shape(cyl(.16,.17,.03,14),BLUE2,[0,1.1,0]) ]),
    part('head',2,[ shape(blob(.22,.2,.21,14,10),WHITE,[0,1.26,.02]), shape(blob(.1,.08,.14,10,8),WHITE,[0,1.2,.17]),   // (the head, the muzzle)
      ...[-1,1].map(sx=>shape(blob(.09,.07,.08,8,6),WHITE,[sx*.15,1.17,.1])) ]),   // (the cheeks' fluff)
    part('crown',3,[ shape(blob(.1,.04,.12,10,6),ORANGE,[0,1.44,.03]), shape(blob(.035,.07,.025,8,6),ORANGE,[0,1.37,.19],null,[-25,0,0]) ]),   // (the orange patch on his crown, a streak of it down to his brow)
    part('mask',3,[-1,1].map(sx=>shape(blob(.075,.045,.02,10,6),BLACK,[sx*.09,1.285,.185],null,[0,sx*-25,sx*-18]))),   // (the black round his eyes, the sprite's fierce look)
    part('eyes',4,[-1,1].map(sx=>shape(blob(.045,.026,.02,8,6),RED,[sx*.09,1.282,.198],null,[0,sx*-25,sx*-18]))),
    part('brows',5,[-1,1].map(sx=>shape(box(.1,.025,.02),BLACK,[sx*.085,1.315,.2],null,[0,sx*-25,sx*-22]))),   // (the fierce look: angled down to the middle)
    part('ears',2,[-1,1].map(sx=>shape(cyl(.002,.1,.42,8),WHITE,[sx*.13,1.6,-.01],[1,1,.42],[0,0,sx*-11]))),
    part('ear insides',3,[-1,1].map(sx=>shape(cyl(.002,.07,.34,8),TAN,[sx*.128,1.585,.03],[1,1,.3],[0,0,sx*-11]))) ];
  // (behind the counter, owner 17 Oct 2026, his picture of him in the shelf: "put behind counter, we need to avoid clipping": the game's mat
  // spot isn't this shop's; the long counter here runs z -7.95 to -4.10 with the wall's mat behind it, 0.7 wide, under the cigarette rack: he
  // stands on that mat facing the aisle, turning toward you only so far (35 degrees) that his shoulders never meet the counter or the wall)
  const AT={x:4.51,z:-6.1}, FACE=-Math.PI/2, TURN=35*Math.PI/180;
  const N=PARTSNPC.make(PARTS,{key:'fox',name:'THE FOX',eye:0,eyeC:'0.,0.,0.',metres:1.6,radius:.27,speed:.4,stride:6,rock:0,bob:.015,lv:'up',group:'bodega',
    x:AT.x,z:AT.z,ground:(x,z)=>MODS.bodega.ground(x,z),
    brain:(dt,you,st,N)=>{ if(N.sheet)return; st.to=null; st.hold=true; const H=N.home||AT; st.x=H.x; st.z=H.z;   // (his place: the mat, or where the hitboxes' check moved him, N.home: clip.js; never wanders)
      let a=FACE; if(Math.hypot(you.x-st.x,you.z-st.z)<4.5*TILE){ const w=Math.atan2(you.x-st.x,you.z-st.z), d=((w-FACE+Math.PI*3)%(Math.PI*2))-Math.PI; a=FACE+Math.max(-TURN,Math.min(TURN,d)); }
      st.face={x:st.x+Math.sin(a),z:st.z+Math.cos(a)}; }});   // (toward you when you come near, as far as the space lets him; else the aisle)
  FOX.N=N; window.FOXDBG=()=>{ const w=N.g.getWorldPosition(new THREE.Vector3()), bb=new THREE.Box3().setFromObject(N.g); return {x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),y:+N.g.position.y.toFixed(2),vis:N.g.visible,pvis:N.g.parent&&N.g.parent.visible,far:!!N.far,w:[w.x,w.y,w.z].map(v=>+v.toFixed(2)),size:[bb.max.x-bb.min.x,bb.max.y-bb.min.y].map(v=>+v.toFixed(2)),tris:N.tris}; }; }
