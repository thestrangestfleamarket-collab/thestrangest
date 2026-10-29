// THE VISITORS: eight off-world travellers who walk the city and sell nothing — the Broadcast (a TV for a head, her face on the screen) by the park's bandstand, the Otter (a masked courier) by the subway stairs, the Reel Kid (pink cat hood) on the Hudson promenade, the Bagger (a yellow fuzz with a backpack) on Market St, the Secondhand Ghost (a sheet in a bucket hat) on Market St, the Jellycap (a glowing jelly mushroom in a bubble) by the theatre, the Wandering Cap (a mushroom hiker) on the park paths, and the Watchmaker (a grey gremlin in tweed) at the bank's column.
import {THREE} from './003-shx.js';
import {TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
{ const T=TILE, K=MERCH.K, {mk,grp,SPH,LATHE,drape}=K;
  const D=new WeakMap();
  const arms=(B,c,r=.05,hand,hc)=>{ const L=D.get(B); for(const s of [1,-1]){ const n=s>0?'L':'R'; mk(B['upperArm'+n],new THREE.CapsuleGeometry(r,L.ua*.95,6,14),c,[0,-L.ua/2,0]); mk(B['forearm'+n],new THREE.CapsuleGeometry(r*.9,L.fa*.95,6,14),c,[0,-L.fa/2,0]); if(hand)mk(B['hand'+n],SPH(r*.85,14,10),hand,[0,-r*.8,0],[0,0,0],[1,1.2,.8]); } };
  const legs=(B,c,r=.06,shoe,sc)=>{ const L=D.get(B); for(const s of [1,-1]){ const n=s>0?'L':'R'; mk(B['thigh'+n],new THREE.CapsuleGeometry(r,L.th*.95,6,14),c,[0,-L.th/2,0]); mk(B['shin'+n],new THREE.CapsuleGeometry(r*.85,L.sh*.95,6,14),c,[0,-L.sh/2,0]); if(shoe)mk(B['shoe'+n],new THREE.CapsuleGeometry(r*.85,.1,6,12),shoe,[0,-.04,.04],[Math.PI/2,0,0],[1,1,.75]); } };
  const sk=o=>{ const S=MERCH.skel(o); D.set(S.B,{ua:o.upper||.29,fa:o.fore||.26,th:o.thigh||.42,sh:o.shin||.4}); return S; };
  const walker=(key,label,height,size,model,idle,lift)=>MERCH.add({key,label,height,model,size,idle:idle||(t=>MERCH.pose({nod:Math.sin(t*.6)*4,yaw:Math.sin(t*.3)*10})),lift});

  // the Broadcast: a cream TV box head, her face on the screen, five wire antennae with coloured balls, speakers at the sides; a moss-green sleeveless dress with a ruffled collar
  walker('broadcast','THE BROADCAST',1.75,10,()=>{ const S=sk({hipY:.92,neck:.48,shX:.18,shY:.4,upper:.28,fore:.25,hipX:.085}), {B}=S, DR='cloth:#5a7a3a', SK='skin:#ecd8c8';
    mk(B.torso,drape(LATHE([[.13,-.05],[.15,.1],[.16,.28],[.15,.4],[.1,.48]],28,.75),.01),DR); mk(B.torso,drape(new THREE.TorusGeometry(.1,.035,10,30),.01),DR,[0,.46,0],[Math.PI/2,0,0],[1.2,1,1]);
    mk(B.hips,drape(LATHE([[.14,.05],[.2,-.2],[.26,-.55]],30,.85),.012),DR); arms(B,SK,.04,SK); legs(B,SK,.045,'leather:#3a2a22');
    const H=grp(B.head,[0,.14,0]); mk(H,new THREE.BoxGeometry(.3,.24,.22,3,3,3),'plastic:#e8dcc4'); mk(H,new THREE.PlaneGeometry(.22,.17),'plain:#e8ccbc',[0,0,.111]);
    for(const s of [1,-1]){ mk(H,SPH(.012,10,8),'plain:#3a8a4a',[.04*s,.02,.113]); mk(H,new THREE.BoxGeometry(.035,.006,.002),'plain:#a82a1a',[.04*s,.045,.113],[0,0,-s*.2]); mk(H,new THREE.CylinderGeometry(.05,.05,.02,20),'plastic:#1a1a1c',[.16*s,0,0],[0,0,Math.PI/2]); }
    mk(H,new THREE.TorusGeometry(.022,.007,6,14,Math.PI),'plain:#c82a3a',[0,-.04,.113],[0,0,Math.PI]); for(let i=0;i<14;i++)mk(H,SPH(.006,6,4),'metal:#c8c8cc',[-.13+(i%7)*.043,i<7?.1:-.1,.112]);
    for(let i=0;i<5;i++){ const a=-.6+i*.3; mk(H,new THREE.CylinderGeometry(.003,.003,.25,5),'metal:#888888',[Math.sin(a)*.12,.24,0],[0,0,-a*.7]); mk(H,SPH(.018,10,8),['plain:#e84a4a','plain:#e8c040','plain:#4a8ae8','plain:#5ac85a','plain:#c85ae8'][i],[Math.sin(a)*.21,.355,0]); }
    return S; },t=>MERCH.pose({nod:Math.sin(t*.8)*6,yaw:Math.sin(t*.4)*14,L:{ua:[10,-6],fa:[20,0]},R:{ua:[10,-6],fa:[20,0]}}));

  // the Otter: pale brown fur, a slate felt mask over big black eyes, a slate beret and scarf; a fuzzy brown coat with big buttons and badges, a satchel on a canvas strap
  walker('otter','THE OTTER',1.3,7,()=>{ const S=sk({hipY:.68,neck:.4,shX:.17,shY:.34,upper:.22,fore:.2,hipX:.08,thigh:.32,shin:.3}), {B}=S, FUR='fur:#a8845a', SL='cloth:#5a6a7a', COAT='fur:#6a4a30';
    mk(B.torso,drape(LATHE([[.15,-.08],[.18,.08],[.19,.22],[.17,.32],[.1,.38]],28,.85),.012),COAT); for(let i=0;i<3;i++)mk(B.torso,new THREE.CylinderGeometry(.02,.02,.01,14),'plain:#c8a060',[.02,.08+i*.08,.18],[Math.PI/2,0,0]);
    mk(B.torso,new THREE.CylinderGeometry(.02,.02,.008,14),'plain:#c83a2a',[-.1,.26,.15],[Math.PI/2,0,.5]); mk(B.torso,new THREE.CylinderGeometry(.018,.018,.008,14),'plain:#3a7ac8',[-.12,.2,.15],[Math.PI/2,0,.5]);
    const st=grp(B.torso,[0,.18,0],[0,0,.7]); mk(st,new THREE.TorusGeometry(.2,.012,6,36),'cloth:#c8b890',[0,0,0],[0,0,0],[1,1.15,.9]); mk(B.hips,new THREE.BoxGeometry(.18,.14,.06),'cloth:#b8a880',[.18,.0,.06],[0,-.4,0]);
    mk(B.hips,drape(LATHE([[.15,.05],[.17,-.08]],24,.85),.01),COAT); arms(B,COAT,.045,FUR); legs(B,FUR,.05,FUR);
    const H=grp(B.head,[0,.1,0]); mk(H,SPH(.11,28,20),FUR,[0,0,0],[0,0,0],[1,.92,1]); mk(H,SPH(.06,20,14),'fur:#d8c4a4',[0,-.04,.08],[0,0,0],[1.1,.8,.9]); mk(H,SPH(.016,10,8),'plain:#2a1a14',[0,-.02,.135]);
    mk(H,new THREE.BoxGeometry(.21,.055,.05),SL,[0,.025,.08]); for(const s of [1,-1]){ mk(H,SPH(.024,14,10),'glass:#0a0a0c',[.045*s,.025,.105]); mk(H,SPH(.025,12,8),FUR,[.085*s,.08,0],[0,0,0],[1,.7,.6]); }
    mk(H,new THREE.CylinderGeometry(.13,.12,.035,28),SL,[-.02,.1,0],[0,0,.15]); mk(H,SPH(.012,8,6),SL,[-.04,.125,0]); mk(B.torso,drape(new THREE.TorusGeometry(.08,.035,10,24),.008),SL,[0,.38,0],[Math.PI/2,0,0],[1.1,1,1.2]);
    return S; });

  // the Reel Kid: a smooth tan face with a sly smile, a brown fringe, a fuzzy pink cat hood with ears, big pink glasses pushed up; a fuzzy grey-brown sweater, gloves
  walker('reelkid','THE REEL KID',1.05,5,()=>{ const S=sk({hipY:.52,neck:.34,shX:.15,shY:.3,upper:.17,fore:.15,hipX:.07,thigh:.24,shin:.22}), {B}=S, PINK='fur:#f08ab0', SW='knit:#8a8478';
    mk(B.torso,drape(LATHE([[.13,-.04],[.15,.1],[.15,.24],[.12,.3],[.07,.34]],26,.85),.01),SW); mk(B.hips,LATHE([[.13,.04],[.14,-.06]],24,.85),'denim:#3a4a6a'); arms(B,SW,.04,'knit:#3a3a3e'); legs(B,'denim:#3a4a6a',.045,'leather:#e8e4dc');
    const H=grp(B.head,[0,.11,0]); mk(H,SPH(.11,28,20),'skin:#d8a880'); mk(H,SPH(.122,28,20,0,Math.PI*2,0,Math.PI*.62),PINK,[0,.01,-.012],[-.35,0,0]); for(const s of [1,-1])mk(H,new THREE.ConeGeometry(.04,.07,12),PINK,[.07*s,.13,-.01],[0,0,-s*.3]);
    mk(H,SPH(.1,24,12,0,Math.PI*2,0,Math.PI*.3),'fur:#5a3a22',[0,.02,.03],[-.5,0,0],[1,.6,1]); for(const s of [1,-1]){ mk(H,new THREE.TorusGeometry(.035,.007,8,20),'plastic:#f070a8',[.045*s,.1,.07],[-.6,0,0]); mk(H,new THREE.CircleGeometry(.032,20),'glass:#f8a0c8',[.045*s,.1,.072],[-.6,0,0]); mk(H,SPH(.008,8,6),'plain:#1a1414',[.035*s,-.005,.1]); }
    mk(H,new THREE.TorusGeometry(.025,.004,6,14,Math.PI*.8),'plain:#6a3a2a',[.01,-.045,.1],[0,0,Math.PI*1.1]); return S; });

  // the Bagger: a round shaggy yellow fuzz, small dark eyes, a little smile, stubby arms and feet; a mauve backpack with a yellow window
  walker('bagger','THE BAGGER',1.0,5,()=>{ const S=sk({hipY:.38,neck:.3,shX:.2,shY:.3,upper:.13,fore:.12,hipX:.1,thigh:.17,shin:.16}), {B}=S, Y='fur:#f0c830';
    mk(B.torso,drape(SPH(.27,32,24),.02),Y,[0,.16,0],[0,0,0],[1,1.05,.95]); for(const s of [1,-1])mk(B.torso,SPH(.018,12,8),'plain:#141414',[.08*s,.24,.25]); mk(B.torso,new THREE.TorusGeometry(.03,.006,6,14,Math.PI),'plain:#3a1414',[0,.17,.26],[0,0,Math.PI]);
    mk(B.torso,SPH(.18,24,16),'cloth:#9a6a9a',[0,.16,-.28],[0,0,0],[.95,1,.5]); mk(B.torso,SPH(.06,16,12),'plastic:#f2d830',[0,.2,-.37],[0,0,0],[1.1,.9,.2]); for(const s of [1,-1])mk(B.torso,new THREE.TorusGeometry(.16,.015,6,24,Math.PI),'cloth:#7a4a7a',[.1*s,.18,-.06],[0,Math.PI/2,0]);
    arms(B,Y,.05,Y); legs(B,Y,.06,Y); return S; },t=>MERCH.pose({nod:Math.sin(t*1.2)*6,yaw:Math.sin(t*.5)*16}));

  // the Secondhand Ghost: a soft white sheet to the ground, little white feet, an arm; a grey felt bucket hat, round wire glasses; a tan paper tote
  walker('ghost2','THE SECONDHAND GHOST',1.0,5,()=>{ const S=sk({hipY:.42,neck:.34,shX:.14,shY:.28,upper:.16,fore:.14,hipX:.06,thigh:.2,shin:.18}), {B}=S, SH='cloth:#f2f2f6';
    mk(B.torso,drape(LATHE([[.0,.48],[.1,.46],[.17,.36],[.2,.15],[.24,-.15],[.28,-.4],[.27,-.42]],34,1),.014),SH);
    const H=grp(B.torso,[0,.44,0]); mk(H,new THREE.CylinderGeometry(.11,.15,.06,28),'cloth:#8a8a8e',[0,.0,0]); mk(H,new THREE.CylinderGeometry(.1,.1,.06,28),'cloth:#8a8a8e',[0,.05,0]);
    for(const s of [1,-1]){ mk(B.torso,new THREE.TorusGeometry(.035,.004,6,18),'metal:#5a5a5e',[.045*s,.32,.16]); mk(B.torso,SPH(.012,10,8),'plain:#141414',[.045*s,.32,.16]); }
    mk(B.torso,new THREE.CapsuleGeometry(.035,.12,6,12),SH,[.2,.18,.05],[0,0,-.9]); mk(B.torso,new THREE.BoxGeometry(.16,.18,.06),'cloth:#c8a878',[.28,.0,.06]); mk(B.torso,new THREE.TorusGeometry(.05,.006,6,16,Math.PI),'cloth:#a8885a',[.28,.09,.06]);
    for(const s of [1,-1])mk(B[s>0?'shoeL':'shoeR'],SPH(.04,12,8),SH,[0,-.02,.02],[0,0,0],[1,.6,1.2]);
    return S; },t=>MERCH.pose({nod:Math.sin(t*.9)*5,yaw:Math.sin(t*.4)*12}),t=>(.12+Math.sin(t*1.4)*.04)*T);

  // the Jellycap: a clear wet dome full of drops round a glowing amber mushroom cap, a ribbed rim; a beige knit neck gaiter; a tan trench coat, a strap
  walker('jellycap','THE JELLYCAP',1.85,10,()=>{ const S=sk({hipY:.94,neck:.5,shX:.2,shY:.42,upper:.29,fore:.26,hipX:.09}), {B}=S, TR='cloth:#b8a070';
    mk(B.torso,drape(LATHE([[.2,-.1],[.23,.1],[.24,.3],[.22,.44],[.14,.5]],30,.8),.012),TR); mk(B.hips,drape(LATHE([[.2,.05],[.24,-.3],[.27,-.6]],30,.85),.012),TR); mk(B.torso,new THREE.TorusGeometry(.2,.012,6,36),'leather:#5a3a22',[0,.04,0],[Math.PI/2,0,0],[1.05,1,.9]);
    arms(B,TR,.05,'skin:#c8b4a0'); legs(B,'cloth:#4a4038',.055,'leather:#2a1e18'); mk(B.torso,new THREE.CylinderGeometry(.08,.1,.12,22),'knit:#d8c8a8',[0,.55,0]);
    const H=grp(B.head,[0,.16,0]); mk(H,SPH(.17,32,24),'tulle:#d8f0f8',[0,0,0],[0,0,0],[1,1.05,1]); mk(H,SPH(.11,28,16,0,Math.PI*2,0,Math.PI*.5),'plain:#f0a030',[0,.02,0],[0,0,0],[1,.7,1]);
    for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; mk(H,new THREE.BoxGeometry(.004,.05,.03),'plain:#e89030',[Math.cos(a)*.06,-.005,Math.sin(a)*.06],[0,-a,0]); } mk(H,new THREE.CylinderGeometry(.025,.03,.08,12),'plain:#f2e0b0',[0,-.07,0]);
    for(let i=0;i<8;i++)mk(H,SPH(.01,8,6),'glass:#e8f8ff',[Math.sin(i*2.1)*.12,Math.cos(i*1.3)*.1,Math.cos(i*2.1)*.12]); mk(H,new THREE.TorusGeometry(.15,.012,8,32),'plastic:#b8c8d0',[0,-.1,0],[Math.PI/2,0,0]);
    return S; });

  // the Wandering Cap: a big red-orange mushroom cap with white flecks over a long white beard (no face seen); a tan jacket, cargo trousers, red-orange gloves and boots, a khaki backpack
  walker('wandercap','THE WANDERING CAP',1.1,4.5,()=>{ const S=sk({hipY:.5,neck:.34,shX:.17,shY:.3,upper:.18,fore:.16,hipX:.08,thigh:.23,shin:.22}), {B}=S, RO='plain:#d8542a', JK='cloth:#b89a6a';
    mk(B.torso,drape(LATHE([[.15,-.05],[.18,.1],[.18,.24],[.14,.3],[.07,.34]],26,.85),.01),JK); mk(B.torso,SPH(.15,24,16),'cloth:#7a7a4a',[0,.16,-.17],[0,0,0],[.9,1.05,.5]); mk(B.hips,LATHE([[.15,.04],[.16,-.06]],24,.85),'cloth:#6a6a4a');
    arms(B,JK,.04,RO); legs(B,'cloth:#6a6a4a',.05,RO);
    const H=grp(B.head,[0,.1,0]); mk(H,SPH(.24,32,16,0,Math.PI*2,0,Math.PI*.5),RO,[0,.03,0],[0,0,0],[1,.75,1]); mk(H,new THREE.CircleGeometry(.235,32),'plain:#e8d8c0',[0,.03,0],[Math.PI/2,0,0]);
    for(let i=0;i<9;i++){ const a=i*2.2, r=.08+(i%3)*.05; mk(H,SPH(.025,10,6),'plain:#f6f2ea',[Math.cos(a)*r,.03+Math.sqrt(Math.max(0,.24*.24-r*r))*.75,Math.sin(a)*r],[0,0,0],[1,.4,1]); }
    mk(H,drape(LATHE([[.09,.0],[.1,-.08],[.08,-.18],[.03,-.26],[0,-.28]],24,.8),.01),'fur:#f2f0ea',[0,-.02,.05]); return S; });

  // the Watchmaker: wrinkled grey skin, big amber eyes, big pointed ears, a crust of blue-green moss for hair; a brown checked tweed coat; a brass pocket watch in his hands
  walker('watchmaker','THE WATCHMAKER',1.05,5,()=>{ const S=sk({hipY:.5,neck:.34,shX:.16,shY:.3,upper:.18,fore:.16,hipX:.075,thigh:.23,shin:.22}), {B}=S, GR='skin:#8a8c88', TW='cloth:#7a5a3a';
    mk(B.torso,drape(LATHE([[.15,-.1],[.17,.08],[.17,.24],[.14,.3],[.07,.34]],26,.85),.01),TW); mk(B.hips,drape(LATHE([[.15,.04],[.18,-.14]],24,.85),.01),TW); arms(B,TW,.04,GR); legs(B,'cloth:#4a3a2a',.045,'leather:#2a1e14');
    const H=grp(B.head,[0,.11,0]); mk(H,SPH(.11,28,20),GR,[0,0,0],[0,0,0],[1.05,.95,1]); for(const s of [1,-1]){ mk(H,SPH(.032,16,12),'glass:#e8a030',[.042*s,.01,.085]); mk(H,SPH(.012,10,8),'plain:#141414',[.042*s,.01,.112]); mk(H,new THREE.ConeGeometry(.04,.16,10),GR,[.15*s,.04,-.01],[0,0,-s*1.35]); }
    mk(H,SPH(.1,24,12,0,Math.PI*2,0,Math.PI*.35),'fur:#4a8a7a',[0,.04,-.01],[0,0,0],[1.08,.9,1.08]); mk(H,new THREE.TorusGeometry(.03,.004,6,14,Math.PI),'plain:#3a3a3a',[0,-.05,.095],[0,0,Math.PI]);
    const W=grp(B.handR,[0,-.06,.03]); mk(W,new THREE.CylinderGeometry(.04,.04,.012,24),'metal:#c8a040',[0,0,0],[Math.PI/2,0,0]); mk(W,new THREE.CircleGeometry(.033,24),'plain:#f2ead8',[0,0,.007]); mk(W,new THREE.BoxGeometry(.002,.025,.002),'plain:#141414',[0,.01,.009]);
    return S; },t=>MERCH.pose({nod:-10+Math.sin(t*.6)*4,L:{ua:[30,-10],fa:[70,-30]},R:{ua:[34,-12],fa:[80,-40]}}));
}
