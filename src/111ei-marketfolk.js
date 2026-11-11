// THE MARKET FOLK: FOLKTEN, ten characters from the market's own pictures (its YouTube shorts, data/full/refs/characters), each a smooth MERCH body on the player's rig at the low detail, walking Market St with what they carry.
import {THREE} from './003-shx.js';
import {TILE} from './006-map-pre.js';
import {HOMES} from './076-npc-map.js';
import {MERCH} from './111e-merch.js';
const FOLKTEN={};
{ const {SPH,CYL,TOR,BOX,CONE,CAP,grp,mk,paint,C,mix,fbm,hash3,lathe,ribbon,TUBE}=MERCH.K, PI=Math.PI, V3=THREE.Vector3;
  let seed=41; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  const tex=(a,b,f=30,k=1)=>(x,y,z)=>mix(C(a),C(b),fbm(x*f,y*f,z*f)*1.2*k-.2), P=(g,fn)=>paint(g,fn);
  const face=(o,dir)=>{ o.quaternion.setFromUnitVectors(new V3(0,0,1),new V3(...dir).normalize()); return o; };
  const rig=o=>{ o.userData.rigid=1; return o; }, skirt=m=>{ m.userData.skirt=1; return m; };
  // one body for them all: a torso (bulk: how round), hips, sleeves and hands, legs and shoes; a coat (len, metres below the waist) hung as a skirt; what each part is made of and its colours from o
  const person=(B,o)=>{ const k=o.bulk||1, top=o.top||'cloth:#777', leg=o.leg||'cloth:#334', sk=o.skin||'skin:#c89a78', mk0=MERCH.K.mk, mk=(par,g,spec,...r)=>mk0(par,String(spec).endsWith(':vc')&&!g.attributes.color?P(g,o.skinF||tex('#888','#555')):g,spec,...r);
    mk(B.torso,lathe([[.15*k,-.08],[.17*k,.05],[.19*k*(o.belly||1),.16],[.2*k,.3],[.19*k,.38],[.13,.45],[.07,.5]],10,20,.82),top);
    mk(B.hips,lathe([[.16*k,.06],[.17*k*(o.belly||1),-.02],[.15*k,-.09],[0,-.1]],5,18,.84),leg);
    if(o.coat)skirt(mk(B.hips,lathe([[.18*k,.12],[.2*k,0],[.23*k,-o.coat*.6],[.25*k,-o.coat]],8,20,.84),o.coat_c||top));
    if(o.neck!==false)mk(B.head,P(CYL(.045,.055,.12,10),o.skinF||tex('#c89a78','#a87858')),o.skinM||'skin:vc',[0,.02,0]);
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['upperArm'+n],CYL(.056*k,.05*k,.29,10),o.sleeve||top,[0,-.13,0]); mk(B['upperArm'+n],SPH(.058*k,10,8),o.sleeve||top);
      mk(B['forearm'+n],CYL(.05*k,.044*k,.26,10),o.sleeve||top,[0,-.12,0]);
      const H=B['hand'+n], hs=o.hand||sk; mk(H,SPH(.038,10,8),hs,[0,-.04,.005],[0,0,0],[1,1.2,.6]);
      for(let i=0;i<4;i++){ const F=grp(H,[(i-1.5)*.017*s,-.075,.008],[.5,0,0]); mk(F,CAP(.0095*(o.claw?1.2:1),.04*(o.longF||1),1,5),hs,[0,-.025*(o.longF||1),0]); }
      const T=grp(H,[-s*.032,-.04,.018],[.6,0,s*.6]); mk(T,CAP(.01,.03,1,5),hs,[0,-.02,0]);
      mk(B['thigh'+n],CYL(.075*k,.062*k,.44,10),leg,[0,-.21,0]); mk(B['shin'+n],CYL(.06*k,.052*k,.44,10),o.boot?o.shoe:leg,[0,-.21,0]);
      mk(B['shoe'+n],CAP(.05,.12,2,10),o.shoe||'leather:#2a1e18',[0,.04,.05],[PI/2,0,0],[1,1,.75]); } };
  // a pair of eyes: whites, irises, pupils, looking dir (radians: side, down)
  const eyes=(H,x,y,z,r,iris,pupil='ivory:#060606',look=[0,0],white='ivory:#f2eee4')=>{ for(const s of [1,-1]){ const E=grp(H,[s*x,y,z]); mk(E,SPH(r,14,10),white); const L=grp(E,[0,0,0],[look[1],look[0],0]); mk(L,SPH(r*.6,10,8),iris,[0,0,r*.55],[0,0,0],[1,1,.5]); mk(L,SPH(r*.32,8,6),pupil,[0,0,r*.82],[0,0,0],[1,1,.4]); mk(L,SPH(r*.12,5,4),'plain:#ffffff',[r*.2,r*.22,r*.92]); } };

  const D={};
  /* 1 THE BRONZE MAN: all cast bronze, a sly face, two great curved horns, a long coat, one hand raised */
  D.hornman={label:'THE BRONZE MAN',height:1.85,size:10.2,skel:{},pose:{R:{ua:[30,30],fa:[150,-20]},nod:-2},m:B=>{ const BR='metal:vc', br=tex('#7a5a3c','#3a2a1c',22), b=g=>P(g,br);
    person(B,{top:BR,leg:BR,skin:BR,hand:BR,sleeve:BR,shoe:BR,coat:.62,coat_c:BR,skinF:br,skinM:BR});
    const H=grp(B.head,[0,.13,.02]); mk(H,b(SPH(.1,22,16)),BR,[0,0,0],[0,0,0],[.9,1.18,1]); mk(H,b(SPH(.05,12,8)),BR,[0,-.09,.04],[0,0,0],[1,.8,1]);
    mk(H,b(SPH(.02,8,6)),BR,[0,-.01,.1],[.3,0,0],[.8,1.5,1]); for(const s of [1,-1]){ mk(H,SPH(.015,8,6),'metal:#2a1c12',[s*.035,.02,.09]); mk(H,b(BOX(.05,.012,.02)),BR,[s*.035,.04,.092],[0,0,-s*.35]);
      const pts=[]; for(let i=0;i<=8;i++){ const t=i/8; pts.push(new V3(s*(.07+t*.12+Math.sin(t*PI)*.04),.07+t*.16-t*t*.02,-.01-t*.06+t*t*.12)); } mk(H,b(TUBE(new THREE.CatmullRomCurve3(pts),12,.024,6)),BR,[0,0,0],[0,0,0],[1,1,1]);
      mk(H,b(CONE(.022,.07,6)),BR,[s*.23,.24,.03],[0,0,s*.4]); }
    mk(H,CAP(.004,.05,1,4),'metal:#2a1c12',[0,-.06,.095],[0,0,PI/2+.08]);
    for(const s of [1,-1])mk(B.torso,b(BOX(.13,.3,.03)),BR,[s*.07,.33,.15],[-.2,s*.3,s*.15]); }};
  /* 2 THE LOCAL: a shaggy blue-black mane round a pale furry face, big wet eyes, a buck-toothed grin; holds up his blue T-shirt */
  D.localfur={label:'THE LOCAL',height:1.6,size:9,skel:{hipY:.78,thigh:.37,shin:.37},pose:{L:{ua:[50,18],fa:[110,-30]},R:{ua:[50,18],fa:[110,-30]},nod:3},m:B=>{ const FU='fur:vc';
    person(B,{top:'fur:#2e3a4a',leg:'fur:#2a3442',hand:'fur:#d8cdb4',sleeve:'fur:#2e3a4a',claw:1,shoe:'fur:#2a3442',skinF:tex('#d8cdb4','#a89a80'),skinM:FU});
    const H=grp(B.head,[0,.14,.02]); mk(H,P(SPH(.12,18,14),tex('#e0d6c0','#b0a284',40)),FU,[0,-.01,.02],[0,0,0],[1,1.05,.95]);
    for(let i=0;i<46;i++){ const a=rnd()*PI*2, e=-.2+rnd()*1.5; if(Math.cos(a)>.55&&e<.9)continue; const d=[Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e)], t=face(mk(H,P(CONE(.035,.15+rnd()*.08,5),tex('#2c4a66','#0e1622',60)),FU,[d[0]*.11,d[1]*.12,d[2]*.11-.01]),d); t.rotateX(PI/2); }
    eyes(H,.045,.025,.09,.032,'ivory:#3a2414'); mk(H,SPH(.016,8,6),'ivory:#1a1210',[0,-.025,.125],[0,0,0],[1.2,.8,.8]);
    mk(H,SPH(.045,12,8),'skin:#5a3a34',[0,-.07,.1],[0,0,0],[1.1,.35,.5]); for(const s of [1,-1])mk(H,BOX(.016,.02,.008),'ivory:#f4f0e2',[s*.01,-.065,.118]);
    const S=rig(grp(B.torso,[0,.18,.26])); const sh=new THREE.Shape(); sh.moveTo(-.11,-.2); sh.lineTo(.11,-.2); sh.lineTo(.11,.12); sh.lineTo(.2,.1); sh.lineTo(.24,.18); sh.lineTo(.08,.24); sh.quadraticCurveTo(0,.2,-.08,.24); sh.lineTo(-.24,.18); sh.lineTo(-.2,.1); sh.lineTo(-.11,.12); sh.closePath();
    mk(S,new THREE.ShapeGeometry(sh,3),'cloth:#2a8ac0'); for(let i=0;i<4;i++)mk(S,BOX(.16-(i%2)*.03,.025,.004),'cloth:#f2c430',[0,.09-i*.055,.004]); }};
  /* 3 THE HEAD MAN: a flat navy cap, a big wrinkled grinning face, red tufts, a denim jacket; another head held up in a plastic bag */
  D.baghead={label:'THE HEAD MAN',height:1.7,size:9.6,skel:{},pose:{L:{ua:[40,20],fa:[120,-10]},R:{ua:[25,30],fa:[80,30]},nod:-2},m:B=>{ const SK='skin:vc', sk=tex('#c49680','#8a5c48',36);
    person(B,{top:'denim:#3a4a68',leg:'cloth:#3a2e30',skin:SK,hand:'skin:#b88a74',skinF:sk,skinM:SK});
    const H=grp(B.head,[0,.13,.02]); mk(H,P(SPH(.1,20,16),sk),SK,[0,0,0],[0,0,0],[.95,1.15,1]); mk(H,P(SPH(.03,10,8),sk),SK,[0,-.01,.105],[.3,0,0],[.8,1.5,1.1]);
    eyes(H,.04,.03,.082,.018,'ivory:#6a9ac8'); for(const s of [1,-1])mk(H,P(SPH(.03,10,6),sk),SK,[s*.04,.055,.082],[0,0,-s*.25],[1.3,.4,.6]);
    for(let i=0;i<3;i++)mk(H,TOR(.08+i*.004,.004,3,10,1.4),SK,[0,.07+i*.018,0],[PI/2,0,PI/2-.7]);
    mk(H,SPH(.055,14,8),'skin:#3a1414',[0,-.07,.072],[0,0,0],[1.15,.4,.6]); mk(H,BOX(.08,.016,.01),'ivory:#ece4cc',[0,-.06,.12]);
    for(const s of [1,-1])for(let i=0;i<5;i++)mk(H,P(CONE(.015,.07,4),tex('#a8402a','#6a2416')),'fur:vc',[s*.095,-.03-i*.012,-.02-i*.01],[0,0,s*(2.2+i*.1)]);
    mk(H,SPH(.108,16,8,0,PI*2,0,PI*.48),'cloth:#24305a',[0,.04,-.01],[-.1,0,0],[1,.6,1.05]); mk(H,CYL(.1,.11,.01,14,1,false,0,PI),'cloth:#1e2848',[0,.05,.06],[-.15,PI/2,0]);
    const G=rig(grp(B.handL,[0,-.13,.04])); mk(G,SPH(.11,14,10),'glass:#dfe8ee',[0,0,0],[1,1.2,1]); mk(G,CONE(.05,.1,6),'glass:#dfe8ee',[0,.17,0]); const h=grp(G,[0,-.01,0]); mk(h,P(SPH(.075,14,10),sk),SK,[0,0,0],[0,0,0],[.95,1.15,1]);
    eyes(h,.028,.02,.065,.014,'ivory:#6a9ac8',undefined,[0,0]); mk(h,SPH(.03,10,6),'skin:#3a1414',[0,-.04,.06],[0,0,0],[1.2,.8,.6]); }};
  /* 4 THE FISH: a round blue padded head freckled pink, two yellow domes for eyes, a huge yellow grin dotted black, a stalk on top with a pigeon on it; an orange jacket */
  D.fishmask={label:'THE FISH',height:1.75,size:9.8,skel:{},pose:{nod:2},m:B=>{ person(B,{top:'cloth:#e07a2a',leg:'cloth:#2a2a30',hand:'skin:#c89a78',coat:.25});
    const H=grp(B.head,[0,.17,.02]); mk(H,P(SPH(.19,22,18),(x,y,z)=>hash3(Math.round(x*60),Math.round(y*60),Math.round(z*60))>.93?C('#d0507a'):C('#3aa0c4')),'cloth:vc',[0,0,0],[0,0,0],[1.05,1,.9]);
    for(const s of [1,-1])mk(H,SPH(.055,14,10),'cloth:#f2c22a',[s*.09,.07,.14],[0,0,0],[1,1,.6]);
    const L=grp(H,[0,-.06,.12]); mk(L,P(TOR(.12,.05,8,22),(x,y,z)=>hash3(Math.round(x*90),Math.round(y*90),3)>.86?C('#1a1a1a'):C('#f2c22a')),'cloth:vc',[0,0,0],[0,0,0],[1,.55,1]); mk(L,SPH(.12,14,8),'plain:#2a0e0c',[0,0,-.02],[0,0,0],[.85,.4,.3]);
    mk(H,TUBE(new THREE.CatmullRomCurve3([new V3(0,.18,0),new V3(0,.28,0),new V3(.03,.34,-.02)]),8,.008,5),'plain:#1a1a1a');
    const Pg=grp(H,[.02,.36,-.02],[0,.8,0]); mk(Pg,SPH(.045,10,8),'fur:#5a5e6a',[0,0,0],[.8,.75,1.3]); mk(Pg,SPH(.026,8,6),'fur:#4a5060',[0,.04,.05]); mk(Pg,CONE(.006,.02,4),'plain:#2a2a2a',[0,.04,.08],[PI/2,0,0]); mk(Pg,BOX(.05,.01,.06),'fur:#3a3e48',[0,.01,-.07]); }};
  /* 5 THE BIRD MAN: a bucket hat, brass goggles, a long beaked nose over a long grey beard, an orange coat and scarf; a little carved bird on a crate in his hands */
  D.birdman={label:'THE BIRD MAN',height:1.75,size:9.8,skel:{},pose:{L:{ua:[25,8],fa:[80,-28]},R:{ua:[25,8],fa:[80,-28]},nod:6,bend:6},m:B=>{ const SK='skin:vc', sk=tex('#a88878','#6a5048',40);
    person(B,{top:'cloth:#c8642a',leg:'cloth:#3a3028',coat:.7,coat_c:'cloth:#b85a26',hand:'skin:#9a7a6a',skinF:sk,skinM:SK});
    const H=grp(B.head,[0,.13,.02]); mk(H,P(SPH(.1,18,14),sk),SK,[0,0,0],[0,0,0],[.95,1.12,1]); mk(H,P(CONE(.025,.12,6),sk),SK,[0,-.03,.15],[1.75,0,0]);
    for(let i=0;i<34;i++){ const a=(rnd()-.5)*2.2, y=-.04-rnd()*.08; mk(H,P(CONE(.02,.12+rnd()*.06,4),tex('#9a9690','#5a5650')),'fur:vc',[Math.sin(a)*.08,y,.04+Math.cos(a)*.05],[PI-.15,a*.3,0]); }
    for(const s of [1,-1]){ mk(H,CYL(.035,.04,.035,12),'metal:#b08a4a',[s*.045,.03,.09],[PI/2,0,0]); mk(H,CYL(.026,.026,.04,12),'glass:#3a4a4a',[s*.045,.03,.095],[PI/2,0,0]); }
    mk(H,TOR(.1,.01,4,16),'leather:#3a2a1e',[0,.03,0],[PI/2,0,0],[1,1.1,1]);
    mk(H,SPH(.125,16,8,0,PI*2,0,PI*.5),'cloth:#6a6e5a',[0,.05,-.01],[0,0,0],[1,.75,1]); mk(H,CYL(.16,.18,.02,16),'cloth:#5e6250',[0,.05,-.01],[.12,0,0]);
    mk(B.torso,TOR(.08,.03,6,16),'cloth:#2a3a4a',[0,.46,.02],[PI/2,0,0],[1,1.1,1]);
    const K=rig(grp(B.torso,[0,-.02,.3])); mk(K,BOX(.18,.16,.16),'wood:#4a3a2c'); const b=grp(K,[0,.13,0]); mk(b,SPH(.045,10,8),'wood:#9a8a7a',[0,0,0],[1,1.2,.9]); mk(b,SPH(.03,8,6),'wood:#a89a8a',[0,.06,.01]);
    for(const s of [1,-1])mk(b,BOX(.012,.05,.04),'wood:#8a7a6a',[s*.04,0,-.01],[0,0,s*.3]); mk(b,CONE(.008,.025,4),'wood:#4a3a2a',[0,.06,.04],[PI/2,0,0]); }};
  /* 6 THE OCTOPUS: a round yellow body, flopping ear-flaps like tentacles, a knobbled trunk of a snout, round black eyes; riding a little blue scooter */
  D.octoscoot={label:'THE OCTOPUS',height:1.25,size:7.4,skel:{hipY:.5,thigh:.24,shin:.24,neck:.3,shY:.25,upper:.17,fore:.16},ride:'scooter',m:B=>{ const Y='plastic:vc', y=tex('#e8b638','#c8902a',8);
    mk(B.torso,P(SPH(.2,18,14),y),Y,[0,.16,0],[0,0,0],[1,1.1,1]); mk(B.hips,P(SPH(.17,14,10),y),Y,[0,-.02,0]);
    for(const s of [1,-1]){ const n=s>0?'L':'R'; mk(B['upperArm'+n],P(CYL(.04,.035,.17,8),y),Y,[0,-.08,0]); mk(B['forearm'+n],P(CYL(.035,.03,.16,8),y),Y,[0,-.07,0]); mk(B['hand'+n],P(SPH(.035,8,6),y),Y,[0,-.03,0]);
      mk(B['thigh'+n],P(CYL(.05,.045,.24,8),y),Y,[0,-.11,0]); mk(B['shin'+n],P(CYL(.045,.04,.24,8),y),Y,[0,-.11,0]); mk(B['shoe'+n],P(CAP(.04,.06,2,8),y),Y,[0,.03,.03],[PI/2,0,0]); }
    const H=grp(B.head,[0,.14,.02]); mk(H,P(SPH(.17,20,16),y),Y,[0,0,0],[0,0,0],[1,1.05,1]);
    for(const s of [1,-1]){ const E=grp(H,[s*.15,.02,-.02],[0,0,-s*.5]); mk(E,P(SPH(.17,14,10),y),Y,[s*.12,-.08,0],[0,0,0],[1.3,.2,.75]); }
    eyes(H,.08,.03,.13,.032,'ivory:#0a0806','ivory:#000000',[0,0],'ivory:#0e0a08');
    for(let i=0;i<6;i++)mk(H,P(SPH(.045-i*.003,12,10),(x,yy,z)=>hash3(Math.round(x*200),Math.round(yy*200),Math.round(z*200))>.5?C('#f0cc5a'):C('#d8a83a')),'plastic:vc',[0,-.03-i*.045,.15+i*.012],[0,0,0],[1,.8,1]); }};
  /* 7 THE WOOD MAN: a gnarled wooden body, bark all over, twigs and moss for hair, a sad old face; a plate of spaghetti and a fork */
  D.woodman={label:'THE WOOD MAN',height:1.6,size:9,skel:{hipY:.82},pose:{L:{ua:[25,10],fa:[80,-30]},R:{ua:[30,14],fa:[100,-35]},nod:10,bend:5},m:B=>{ const W='wood:vc', w=tex('#8a7660','#4a3a2a',26);
    person(B,{top:W,leg:W,skin:W,hand:W,sleeve:W,shoe:W,skinF:w,skinM:W,longF:1.3,bulk:.85});
    for(const [bn,n] of [['torso',10],['hips',4],['thigh'+'L',3],['thighR',3]])for(let i=0;i<n;i++){ const a=rnd()*PI*2, y=bn==='torso'?rnd()*.4:-.15*rnd(); mk(B[bn],P(CYL(.008,.015,.18,5),w),W,[Math.sin(a)*.17,y,Math.cos(a)*.14],[rnd()-.5,0,rnd()-.5]); }
    const H=grp(B.head,[0,.13,.02]); mk(H,P(SPH(.105,18,14),w),W,[0,0,0],[0,0,0],[.95,1.1,1]); mk(H,P(SPH(.02,8,6),w),W,[0,-.01,.1],[.3,0,0],[.9,1.6,1]);
    eyes(H,.04,.02,.085,.02,'ivory:#2a1c12'); for(const s of [1,-1])mk(H,P(SPH(.03,10,6),w),W,[s*.04,.045,.08],[0,0,s*.3],[1.3,.4,.6]);
    mk(H,CAP(.004,.04,1,4),'plain:#2a1c12',[0,-.06,.095],[0,0,PI/2]);
    for(let i=0;i<22;i++){ const a=rnd()*PI*2, e=.2+rnd()*1.1; const d=[Math.sin(a)*Math.cos(e),Math.sin(e),Math.cos(a)*Math.cos(e)]; if(d[2]>.6&&d[1]<.5)continue; const t=face(mk(H,P(CONE(.014,.1+rnd()*.08,4),rnd()<.3?tex('#4a6a3a','#2a3a20'):w),'wood:vc',[d[0]*.1,d[1]*.11,d[2]*.1]),d); t.rotateX(PI/2); }
    for(const s of [1,-1])mk(H,P(CONE(.03,.08,5),w),W,[s*.1,.0,-.01],[0,0,-s*1.2],[1,1,.4]);
    const Pl=rig(grp(B.torso,[0,.02,.3])); mk(Pl,CYL(.14,.11,.02,16),'wood:#8a7458'); for(let i=0;i<14;i++){ const a=rnd()*PI*2, r=rnd()*.09; mk(Pl,TOR(.02+rnd()*.03,.004,3,10),'plain:#e0c890',[Math.sin(a)*r,.02+rnd()*.03,Math.cos(a)*r],[PI/2+rnd()-.5,rnd(),0]); }
    mk(Pl,SPH(.025,8,6),'wood:#7a6248',[.04,.05,0]); const F=rig(grp(B.handR,[0,-.08,.02],[PI,0,0])); mk(F,BOX(.012,.16,.006),'wood:#9a8468',[0,.08,0]); }};
  /* 8 THE FRY MAN: round and pale, a little topknot, angry ginger brows, cheeks stuffed, fries sticking out of his mouth; a heap of fries in a red carton */
  D.fryman={label:'THE FRY MAN',height:1.6,size:9.2,skel:{hipY:.78,thigh:.37,shin:.37,shX:.24},pose:{L:{ua:[28,12],fa:[85,-30]},R:{ua:[28,12],fa:[85,-30]},nod:-4},m:B=>{ const SK='skin:vc', sk=tex('#e8b8a8','#c88a80',20);
    person(B,{top:'cloth:#eeeeea',leg:'denim:#3a4a6a',bulk:1.55,belly:1.25,skinF:sk,skinM:SK,skin:'skin:#e0b0a0',neck:false});
    const H=grp(B.head,[0,.12,.03]); mk(H,P(SPH(.15,20,16),sk),SK,[0,0,0],[0,0,0],[1.1,1,1]); for(const s of [1,-1])mk(H,P(SPH(.07,12,10),sk),SK,[s*.08,-.04,.08]);
    mk(H,P(SPH(.03,10,8),sk),SK,[0,-.01,.15],[0,0,0],[1.2,1,1]); mk(H,P(SPH(.04,10,8),tex('#c06a4a','#8a3a2a')),'fur:vc',[0,.16,0],[0,0,0],[.8,.6,.8]); mk(H,P(SPH(.025,8,6),tex('#c06a4a','#8a3a2a')),'fur:vc',[0,.19,0]);
    eyes(H,.045,.045,.125,.022,'ivory:#3a6a3a'); for(const s of [1,-1])mk(H,P(BOX(.06,.018,.02),tex('#c06a4a','#8a3a2a')),'fur:vc',[s*.045,.08,.13],[0,0,s*.4]);
    mk(H,SPH(.045,12,8),'skin:#5a2a28',[0,-.06,.13],[0,0,0],[1.2,.6,.5]); for(let i=0;i<9;i++)mk(H,BOX(.012,.012,.08+rnd()*.05),'plain:#e8b84a',[(rnd()-.5)*.07,-.06+(rnd()-.5)*.03,.17],[rnd()-.5,rnd()-.5,0]);
    const Cb=rig(grp(B.torso,[0,.0,.36])); mk(Cb,BOX(.2,.12,.12),'plain:#c82a24'); for(let i=0;i<26;i++)mk(Cb,BOX(.014,.014,.12+rnd()*.06),rnd()<.5?'plain:#e8b84a':'plain:#d89a3a',[(rnd()-.5)*.17,.06+rnd()*.08,(rnd()-.5)*.09],[rnd()*.6-.3+PI/2,rnd(),0]); }};
  /* 9 THE PLUSH MAN: a soft white plush head, a big pink nose, black-rimmed glasses, a pale blue cap, a yellow shirt; three little plush toys in glasses in his arms */
  D.plushman={label:'THE PLUSH MAN',height:1.6,size:9,skel:{hipY:.82},pose:{L:{ua:[25,10],fa:[85,-30]},R:{ua:[25,10],fa:[85,-30]},nod:-2},m:B=>{ const PL='fur:vc', pl=tex('#f2eee6','#d8d2c6',40);
    person(B,{top:'cloth:#f0d070',leg:'cloth:#5a5a6a',hand:'fur:#f0ece4',skinF:pl,skinM:PL,bulk:1.15});
    const H=grp(B.head,[0,.14,.02]); mk(H,P(SPH(.13,18,14),pl),PL,[0,0,0],[0,0,0],[1.08,1,1]); for(const s of [1,-1])mk(H,P(SPH(.06,10,8),pl),PL,[s*.06,-.06,.07]);
    mk(H,SPH(.045,12,10),'fur:#e88aa0',[0,-.03,.13],[0,0,0],[1.2,.9,.9]); mk(H,TOR(.04,.006,3,12,PI),'plain:#c02a2a',[0,-.08,.11],[0,0,PI]);
    eyes(H,.045,.03,.11,.018,'ivory:#2a2a2a'); for(const s of [1,-1])mk(H,TOR(.032,.007,4,14),'plastic:#151515',[s*.045,.03,.135],[0,0,0],[1.2,1,1]); mk(H,BOX(.03,.008,.008),'plastic:#151515',[0,.035,.135]);
    mk(H,SPH(.13,16,8,0,PI*2,0,PI*.5),'knit:#a8c0d0',[0,.04,-.01],[-.1,0,0],[1.05,.7,1.05]); mk(H,CYL(.11,.12,.012,14,1,false,0,PI),'knit:#98b0c0',[0,.05,.07],[-.2,PI/2,0]);
    const T=rig(grp(B.torso,[0,-.03,.3])); [['#f4f2ec',-.1],['#e0a0aa',0],['#8a9aa8',.1]].forEach(([c,x])=>{ const g=grp(T,[x,.05,0]); mk(g,SPH(.055,10,8),'fur:'+c,[0,0,0],[1,1.1,1]); for(const s of [1,-1])mk(g,TOR(.016,.004,3,8),'plastic:#f0d040',[s*.02,.02,.05]); }); }};
  /* 10 THE POTATO ALIEN: tall and thin, green, a big smooth head and great dark eyes, a ribbed pale chest, long speckled arms and long fingers; potatoes held to his chest, a bottle in the other hand */
  D.potatoalien={label:'THE POTATO ALIEN',height:2.0,size:11,skel:{hipY:1.02,thigh:.49,shin:.49,upper:.32,fore:.32,shX:.17,neck:.6},pose:{L:{ua:[20,12],fa:[110,-60]},R:{ua:[10,10],fa:[40,-6]},nod:-3},m:B=>{ const SK='skin:vc', sk=tex('#6a8a5a','#3a5a3a',30), ch=tex('#d8d0b8','#a8a090',50);
    person(B,{top:SK,leg:'cloth:#3a3a34',sleeve:SK,hand:'skin:#4a6a4a',skinF:sk,skinM:SK,bulk:.75,longF:1.6});
    mk(B.torso,P(lathe([[.12,-.06],[.13,.05],[.14,.18],[.15,.3],[.13,.4]],10,16,.75),(x,y,z)=>Math.sin(y*90)>.3?C('#a8a090'):ch(x,y,z)),SK,[0,0,.012]);
    for(const n of ['upperArmL','upperArmR','forearmL','forearmR'])for(let i=0;i<8;i++)mk(B[n],SPH(.006,5,4),'ivory:#c8d8c0',[(rnd()-.5)*.08,-rnd()*.26,.045]);
    const H=grp(B.head,[0,.16,.02]); mk(H,P(SPH(.13,20,16),sk),SK,[0,.03,-.02],[0,0,0],[.85,1.2,1.05]); mk(H,P(SPH(.06,12,8),sk),SK,[0,-.08,.04],[0,0,0],[.9,.9,1]);
    for(const s of [1,-1])mk(H,SPH(.03,12,10),'ivory:#080a08',[s*.045,0,.095],[0,0,s*.2],[1.3,1,.7]); mk(H,BOX(.04,.006,.006),'plain:#2a3a2a',[0,-.09,.1]);
    for(const s of [1,-1])mk(H,P(CONE(.015,.05,5),sk),SK,[s*.1,.0,-.02],[0,0,-s*1.4]);
    const Po=rig(grp(B.torso,[.04,.3,.2])); for(let i=0;i<5;i++)mk(Po,SPH(.04,10,8),'plain:#c8a46a',[(rnd()-.5)*.12,(rnd()-.5)*.08,(rnd()-.5)*.04],[0,rnd()*3,0],[1.2,.9,1]);
    const Bt=rig(grp(B.handR,[0,-.1,.03])); mk(Bt,CYL(.035,.035,.16,10),'glass:#e0e8e8'); mk(Bt,CYL(.012,.02,.05,8),'glass:#e0e8e8',[0,.1,0]); }};

  /* ---------- the octopus's little blue scooter, in the rig's units like the courier's bike ---------- */
  const scooter=()=>{ const G=new THREE.Group(), BL='plastic:#2a6a9a', W='plain:#1a1a1a';
    for(const z of [-9,10]){ const w=grp(G,[0,4,z]); mk(w,TOR(3.6,1.1,6,16),W,[0,0,0],[0,PI/2,0]); mk(w,CYL(2.6,2.6,1.6,12),'plastic:#e8e4dc',[0,0,0],[0,0,PI/2]); }
    mk(G,SPH(6,14,10),BL,[0,8,-6],[0,0,0],[.9,.7,1.4]); mk(G,BOX(5,1.4,8),'leather:#1a2a3a',[0,13,-4]); mk(G,BOX(5,2,14),BL,[0,5.5,2]);
    const f=grp(G,[0,6,10],[-.3,0,0]); mk(f,CYL(.6,.6,16,8),'metal:#aaa',[0,6,0]); mk(f,CYL(.5,.5,14,8),'plastic:#1a1a1a',[0,14,0],[0,0,PI/2]); mk(f,SPH(4,10,8),BL,[0,10,1],[0,0,0],[1.1,1,.6]); mk(f,CYL(1.4,1.4,.4,10),'plastic:#e8a83a',[0,10,3.4],[PI/2,0,0]);
    G.updateMatrixWorld(true); const Pp=[], Cc=[], c=new THREE.Color();
    G.traverse(o=>{ if(!o.isMesh)return; const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); g.applyMatrix4(o.matrixWorld); c.set(String(o.userData.c).split(':').pop()); const q=g.attributes.position; for(let k=0;k<q.count;k++){ Pp.push(q.getX(k),q.getY(k),q.getZ(k)); Cc.push(c.r,c.g,c.b); } });
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(Pp,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,flatShading:true})); m.castShadow=m.receiveShadow=true; return m; };

  /* ---------- each one added, walking his own stretch of Market St ---------- */
  const keys=Object.keys(D), band=HOMES.band&&HOMES.band();
  keys.forEach((key,i)=>{ const d=D[key], POSE=d.pose||{}, body=MERCH.add({key,label:d.label,height:d.height,size:d.size,q:.3,at:100,
      model:()=>{ const sk=MERCH.skel({hipY:.92,waist:.06,neck:.5,shX:.19,shY:.42,upper:.28,fore:.26,hipX:.1,thigh:.44,shin:.44,...d.skel}); seed=101+i*37; d.m(sk.B); return sk; },
      idle:d.ride?null:(t=>MERCH.pose(POSE)),
      ...(d.ride?{ride:{make:scooter,pose:R=>{ const p=d._p||(d._p={k:'bike',c:0,brake:false,z:0}); p.c+=(R.v/TILE)*.14; p.brake=!(R.v>.2*TILE); return p; },
        place:(m,R,t,c)=>{ if(!c||!FOLKTEN[key])return; const u=c.g.scale.y; m.scale.setScalar(u*FOLKTEN[key].body.KL); m.position.y-=RIG.RIDEG.deck*u; }},rideSpeed:1.8}:{})});
    if(!body)return; const N=body.npc; FOLKTEN[key]={N,body};
    if(band&&new URLSearchParams(location.search).get('sheet')!==key){ const x=band.x0+(band.x1-band.x0)*(.08+.84*i/(keys.length-1)), z=band.rows[i%2]; Object.assign(N.st.home,{x,z,r:30*TILE}); Object.assign(N.st,{x,z,to:null,next:null}); } });
  window.FOLKTENDBG=()=>Object.fromEntries(Object.entries(FOLKTEN).map(([k,o])=>[k,{x:+o.N.st.x.toFixed(1),z:+o.N.st.z.toFixed(1),tris:o.body.tris(),vis:o.N.g.visible}])); }
