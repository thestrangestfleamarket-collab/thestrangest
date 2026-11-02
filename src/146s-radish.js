// THE RADISH: a white radish spirit under his red leaf umbrella at the Hudson railing, selling off-world seeds out of a red suitcase, with the clay pots, dirt and water they need; the fruit they grow (at home, 150h) mends you when you eat it.
import {THREE} from './003-shx.js';
import {FORAGE, NPCS, SHOPS, UI} from './003b-systems.js';
import {SOL, TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
const RADISH={}; window.RADISH=RADISH;
{ const T=TILE, K=MERCH.K, {mk,grp,SPH,LATHE,drape}=K;
  // each seed: its fruit, its colours, how many game hours of wet dirt to first fruit, and to each one after
  RADISH.PLANTS={star:{seed:'seed_star',fruit:'fr_star',name:'STAR CUCUMBER',leaf:0x4a8a4a,fr:0xc8e8a0,shape:'star',first:24,next:10},
    sun:{seed:'seed_sun',fruit:'fr_sun',name:'SUN PEPPER',leaf:0x3e7a3a,fr:0xf2a020,shape:'pepper',first:36,next:14,glow:1},
    hum:{seed:'seed_hum',fruit:'fr_hum',name:'HUMMING BEAN',leaf:0x5a8a3a,fr:0x8a5ac8,shape:'pod',first:16,next:6}};
  const NM={pot:'CLAY POT',dirt:'BAG OF DIRT',water:'JUG OF RAIN'}; for(const k in RADISH.PLANTS){ const P=RADISH.PLANTS[k]; NM[P.seed]=P.name+' SEEDS'; NM[P.fruit]=P.name; }
  FORAGE.add({names:NM});

  /* ---------- him: a round soft white radish, faint ridges and a few dark specks, dot eyes, a little pink mouth, stubby arms and toes; a red leaf umbrella from his head ---------- */
  const WH='skin:#f2eee6', RED='cloth:#c8322a';
  const model=()=>{ const sk=MERCH.skel({hipY:.42,neck:.3,shX:.2,shY:.2,upper:.12,fore:.1,hipX:.09,thigh:.2,shin:.18}), {B}=sk;
    mk(B.torso,LATHE([[.0,-.2],[.16,-.16],[.25,-.04],[.28,.1],[.26,.24],[.2,.34],[.12,.4],[.05,.43],[0,.44]],36,.92),WH);
    for(let i=0;i<7;i++){ const a=i*.9+.3; mk(B.torso,SPH(.008,8,6),'plain:#3a3430',[Math.sin(a)*.27,.02+(i%3)*.08,Math.cos(a)*.25]); }
    mk(B.torso,LATHE([[.0,0],[.02,-.03],[.035,-.12],[.015,-.22],[0,-.28]],16,1),WH,[0,-.2,0]);
    const H=grp(B.head,[0,.0,0]); for(const s of [1,-1])mk(B.torso,SPH(.016,14,10),'plain:#121214',[.07*s,.2,.24],[0,0,0],[1,1.2,.5]);
    mk(B.torso,SPH(.022,14,10,0,Math.PI*2,Math.PI*.5,Math.PI*.5),'plain:#e07a88',[0,.14,.255],[0,0,0],[1.2,1,.5]);
    const U=grp(B.torso,[0,.44,0]); mk(U,new THREE.CylinderGeometry(.012,.016,.32,10),'plain:#5a8a3a',[0,.16,0]);
    mk(U,drape(new THREE.SphereGeometry(.42,32,12,0,Math.PI*2,0,Math.PI*.32),.01),RED,[0,-.02,0]); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; mk(U,new THREE.CylinderGeometry(.005,.005,.36,6),'plain:#8a1a14',[Math.sin(a)*.12,.32,Math.cos(a)*.12],[Math.cos(a)*.95,0,-Math.sin(a)*.95]); }
    for(const s of [1,-1]){ const n=s>0?'L':'R'; mk(B['upperArm'+n],new THREE.CapsuleGeometry(.03,.08,6,12),WH,[0,-.05,0]); mk(B['forearm'+n],new THREE.CapsuleGeometry(.028,.05,6,12),WH,[0,-.04,0]);
      mk(B['thigh'+n],new THREE.CapsuleGeometry(.035,.1,6,12),WH,[0,-.08,0]); mk(B['shin'+n],new THREE.CapsuleGeometry(.032,.09,6,12),WH,[0,-.08,0]); mk(B['shoe'+n],SPH(.04,14,10),WH,[0,-.03,.02],[0,0,0],[1,.7,1.3]); }
    return sk; };
  const KIT={g:null};
  MERCH.add({key:'radish',label:'THE RADISH',height:.9,model,size:4,hd:0,
    idle:t=>{ const w=(t%9)<2.5; return MERCH.pose({nod:Math.sin(t*.8)*5,yaw:Math.sin(t*.4)*10,L:{ua:[w?150:30,40],fa:[w?20+Math.sin(t*9)*25:20,0]},R:{ua:[30,40],fa:[20,0]}}); },
    after:(B,N)=>{ if(KIT.g)KIT.g.visible=N.g.visible; }});

  /* ---------- his things: a red hard suitcase open on the ground, packed with veg and seed packets; a blue crate of orange trays; a stack of clay pots and a sack of dirt ---------- */
  const kit=N=>{ const G=new THREE.Group(), std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.6,...o}), add=(geo,m,x,y,z,r)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); if(r)o.rotation.set(...r); o.castShadow=o.receiveShadow=true; G.add(o); return o; };
    const red=std(0xb82a24,{roughness:.35}); add(new THREE.BoxGeometry(.7,.1,.48),red,0,.05,0); add(new THREE.BoxGeometry(.7,.48,.06),red,0,.29,-.27,[-.25,0,0]); add(new THREE.BoxGeometry(.66,.02,.44),std(0x2a2226),0,.105,0);
    const VC=[0xc8e8a0,0xf2a020,0x8a5ac8,0x5a9a4a,0xe0d050]; for(let i=0;i<10;i++){ const v=add(new THREE.CapsuleGeometry(.03,.08,6,10),std(VC[i%5],{roughness:.45}),-.25+(i%5)*.12,.14,-.08+Math.floor(i/5)*.14,[Math.PI/2,0,i*.7]); }
    for(let i=0;i<4;i++)add(new THREE.BoxGeometry(.08,.11,.005),std([0xe8e4d8,0xd8f0e0,0xf0e0d0,0xe0e0f0][i],{roughness:.2,transparent:true,opacity:.85}),-.2+i*.1,.3,-.22,[-.25,0,0]);
    add(new THREE.BoxGeometry(.5,.26,.36),std(0x2a5ab0),.75,.13,.05); for(let i=0;i<3;i++)add(new THREE.BoxGeometry(.44,.02,.3),std(0xe07a28),.75,.27+i*.025,.05);
    const clay=std(0xb86a42,{roughness:.8}); for(let i=0;i<3;i++)add(new THREE.CylinderGeometry(.13,.1,.18,20),clay,-.7,.09+i*.12,.1);
    add(new THREE.CylinderGeometry(.16,.18,.32,16),std(0x8a7a5a,{roughness:1}),-.7,.16,-.25);
    G.scale.setScalar(T); const hd=N.st.hd; G.position.set(N.st.x+Math.sin(hd)*.75*T+Math.cos(hd)*.15*T,N.st.y||0,N.st.z+Math.cos(hd)*.75*T-Math.sin(hd)*.15*T); G.rotation.y=hd+Math.PI; N.g.parent.add(G); return G; };
  { NPCS.when('radish',N=>{ const G=KIT.g=kit(N);
      const hb=new THREE.Mesh(new THREE.BoxGeometry(1.6*T,.6*T,.8*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(G.position.x,.3*T,G.position.z); N.g.parent.add(hb);
      UI.thing({name:'THE RADISH\'S SUITCASE',obj:hb,reach:2*T,near:3*T,tall:.6*T,act:()=>{ if(SHOPS.open)SHOPS.open(N); }}); const x=G.position.x, z=G.position.z; SOL.up.push([x-.6*T,z-.35*T,x+.6*T,z+.35*T]); }); }
}
export {RADISH};
