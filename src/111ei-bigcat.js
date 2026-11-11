// THE BIG CAT: BIGCAT, a huge black cat-shaped blob (a rounded block with two horn-like ears, big speckled staring eyes, an open mouth with pink teeth, whiskers, two clawed paws) four and a half times a person's height, now and then walking down Market St's road (a smooth MERCH body on the player's rig).
import {SHARED} from './003-shx.js';
import {SYS, TILE} from './006-map-pre.js';
import {TRAINS} from './009c-trains.js';
import {MERCH} from './111e-merch.js';
const BIGCAT={};
{ const {SPH,CYL,TOR,CAP,grp,mk,paint,C,mix,fbm,hash3}=MERCH.K, PI=Math.PI;
  // his skin: a matte black, faintly mottled, flecked with pale specks
  const BLK=C('#141416'), BLK2=C('#1f1f23'), SPECK=C('#5a5a5e');
  const skin=(x,y,z)=>{ let c=mix(BLK,BLK2,fbm(x*6,y*6,z*6)*1.6-.4); if(hash3(Math.round(x*140),Math.round(y*140),Math.round(z*140))>.996)c=mix(c,SPECK,.6); return c; };
  const S='skin:vc', sk2=g=>paint(g,skin);
  // the eyes' whites: an off-white, browned and flecked like old enamel
  const EYE=C('#e8dcc8'), EYED=C('#b8a080'), FLECK=C('#7a5a3a');
  const eyeC=(x,y,z)=>{ let c=mix(EYE,EYED,fbm(x*30,y*30,z*30)*1.4-.35); if(hash3(Math.round(x*400),Math.round(y*400),Math.round(z*400))>.95)c=mix(c,FLECK,.7); return c; };
  // a rounded block: a sphere pushed out toward a box (p under 1 squarer), its half sizes w, h, d
  const block=(w,h,d,p,n=40)=>{ const g=SPH(1,n,Math.round(n*.75)), P=g.attributes.position; for(let i=0;i<P.count;i++){ const f=v=>Math.sign(v)*Math.pow(Math.abs(v),p); let x=f(P.getX(i)), y=f(P.getY(i)), z=f(P.getZ(i)); const t=(y+1)/2; x*=1+.06*(1-t); z*=1+.04*(1-t); P.setXYZ(i,x*w,y*h,z*d); } g.computeVertexNormals(); return g; };
  const model=()=>{ const sk=MERCH.skel({hipY:.38,waist:.05,neck:1,shX:.3,shY:.8,upper:.2,fore:.2,hipX:.32,thigh:.19,shin:.17}), {B}=sk;
    /* the body: one block from just above his paws to the crown, all of it on the hips so it never bends */
    const Bd=grp(B.hips,[0,.74,0]); Bd.userData.rigid=1;
    mk(Bd,sk2(block(.76,.8,.56,.42)),S);
    /* the ears: two thick rounded horns on the top corners, leaning out */
    for(const s of [1,-1]){ const E=grp(Bd,[s*.5,.72,0],[.05,0,-s*.75]); mk(E,sk2(MERCH.K.lathe([[.001,-.05],[.2,-.04],[.19,.08],[.15,.2],[.1,.3],[.055,.36],[.001,.385]],16,22)),S,[0,0,0],[0,0,0],[1.35,1.6,1.1]); }
    /* the eyes: big staring balls set into the face, small black pupils near the middle; a socket ring of skin round each */
    for(const s of [1,-1]){ mk(Bd,paint(SPH(.215,30,22),eyeC),'ivory:vc',[s*.3,.26,.5]); mk(Bd,SPH(.05,14,10),'ivory:#070607',[s*.27,.27,.712],[0,0,0],[1,1,.45]);
      mk(Bd,sk2(TOR(.21,.04,8,30)),S,[s*.3,.26,.54]);
      /* the lids: a heavy upper lid down to the top of the pupil, a thin lower one */
      mk(Bd,sk2(SPH(.226,30,12,0,PI*2,0,PI*.28)),S,[s*.3,.26,.5],[.5,0,0]); mk(Bd,sk2(SPH(.222,30,8,0,PI*2,0,PI*.2)),S,[s*.3,.26,.5],[PI-.45,0,0]); }
    /* the nose: a ridge down from between the eyes to a round bump */
    mk(Bd,sk2(SPH(.07,14,12)),S,[0,.2,.57],[0,0,0],[.9,2.6,.9]); mk(Bd,sk2(SPH(.08,14,12)),S,[0,.02,.6],[0,0,0],[1.25,.9,1]);
    /* the mouth: open in an O, dark inside, a lip of skin round it, four pink teeth at the bottom */
    mk(Bd,SPH(.27,26,16),'plain:#1c0a0c',[0,-.24,.5],[0,0,0],[1.12,.6,.25]);
    mk(Bd,sk2(TOR(.27,.045,10,36)),S,[0,-.24,.555],[0,0,0],[1.12,.6,1]);
    for(let i=0;i<4;i++)mk(Bd,SPH(.05,12,10),'skin:#eaa2ac',[(i-1.5)*.085,-.35+Math.abs(i-1.5)*.012,.56],[0,0,0],[.85,1.15,.7]);
    /* the whiskers: four thin dark bristles a side, fanned out from the cheeks */
    for(const s of [1,-1])for(let k=0;k<4;k++){ const W=grp(Bd,[s*.42,-.14-k*.04,.52],[0,s*.35,s*(-.35+k*.22)]); mk(W,CYL(.006,.003,.26,4),'plain:#4a4a50',[s*.13,0,0],[0,0,PI/2]); }
    /* the legs: short and thick, under the block; the paws big and round, four toes in front */
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['thigh'+n],sk2(CYL(.15,.14,.2,14)),S,[0,-.1,0]); mk(B['shin'+n],sk2(CYL(.14,.15,.18,14)),S,[0,-.08,.02]);
      const F=B['shoe'+n]; mk(F,sk2(SPH(.23,22,14)),S,[0,.14,.1],[0,0,0],[1.15,.68,1.35]);
      for(let i=0;i<4;i++){ const a=(i-1.5)*.4; mk(F,sk2(SPH(.09,14,10)),S,[Math.sin(a)*.22,.085,.24+Math.cos(a)*.16],[0,0,0],[.95,.95,1.2]); } }
    return sk; };
  // five times a person's height
  const body=MERCH.add({key:'bigcat',label:'THE BIG CAT',height:2.3,model,size:45,q:.75,at:100,idle:()=>MERCH.pose({bend:0,nod:0})});
  const N=BIGCAT.N=body&&body.npc;
  // his walk (owner, 11 Nov 2026): every 3 to 10 minutes he walks slowly down Market St's road end to end, one way then the other, on the shared clock; away between walks
  const B=SHARED.BOD, M0=TILE/.84, xW=B.XS(-129), xE=B.XS(261), wz=B.ZS((B.CURB+B.FAR)/2), WV=.7*M0, WD=(xE-xW)/WV, WP=390+WD, hs=n=>{ const v=Math.sin(n*12.9898)*43758.5453; return v-Math.floor(v); };
  const walkAt=t=>{ const n=Math.floor(t/WP); for(const k of [n+1,n,n-1]){ const u=t-(k*WP+(hs(k)-.5)*210); if(u>=0&&u<WD)return k&1?{x:xE-u*WV,to:xW}:{x:xW+u*WV,to:xE}; } return null; };
  if(N){ N.walk.auto=false; const st=N.st; N.mode='hidden';
    SYS.add('city',()=>{ const w=walkAt(TRAINS.now()); if(!w){ N.mode='hidden'; st.to=null; return; } delete N.mode; st.x=w.x; st.z=wz; st.to={x:w.to,z:wz}; st.next=null; },'111ei-bigcat'); }
  BIGCAT.walkAt=walkAt;
  window.BIGCATDBG=(x,z)=>{ if(N&&x!=null){ Object.assign(N.st,{x,z,to:null,next:null}); } return N?{x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),vis:N.g.visible,tris:body.tris()}:null; }; }
