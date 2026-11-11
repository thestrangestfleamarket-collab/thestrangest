// THE FROG IN THE BUBBLE SUIT: BUBBLEFROG, a pale sage frog standing upright under a clear faceted hood that runs from a point over his head down his back, brass rings round his eyes and brass ports for ears, a ribbed vest under a bronze belly plate, glossy green see-through sleeves and trousers flecked with gold, a belt and a pouch (a smooth MERCH body on the player's rig).
import {THREE} from './003-shx.js';
import {TILE} from './006-map-pre.js';
import {HOMES} from './076-npc-map.js';
import {MERCH} from './111e-merch.js';
const BUBBLEFROG={};
{ const {SPH,CYL,TOR,BOX,CONE,CAP,grp,mk,paint,C,mix,fbm}=MERCH.K, PI=Math.PI, V3=THREE.Vector3;
  let seed=41; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  const SKIN='skin:vc', skinC=(x,y,z)=>{ const s=fbm(x*34+3,y*34,z*34); return s>.68?mix(C('#8a7a50'),C('#6a5a3a'),fbm(x*90,y*90,z*90)):mix(C('#b6c4ae'),C('#8a9e88'),fbm(x*14,y*14,z*14)*1.2-.2+(y<-.03?-.3:0)); };
  const VIN='plastic:vc', vinC=(x,y,z)=>{ const a=Math.atan2(x,z); return mix(C('#6f9a72'),C('#3a6448'),fbm(x*18,y*18,z*18)*.9+(Math.sin(a*14)>.75?.35:0)); };
  const BR='metal:#b08a44', BRD='metal:#7a5a2a', GOLD='metal:#f0c860', GLASS='glass:#e8f0f2';
  const Z=new V3(0,0,1), face=(o,p)=>{ o.quaternion.setFromUnitVectors(Z,new V3(...p).normalize()); return o; };
  const flecks=(par,n,c,r,h,fz=1)=>{ for(let i=0;i<n;i++){ const a=rnd()*PI*2, y=(rnd()-.5)*h; mk(par,SPH(.0055,5,4),GOLD,[c[0]+Math.sin(a)*r,c[1]+y,c[2]+Math.cos(a)*r*fz]); } };
  // a brass port: a disc in rings, stepping in to a dark middle
  const port=(par,p,r,dir)=>{ const g=face(grp(par,p),dir||p); mk(g,CYL(r,r,.012,16),BRD,[0,0,0],[PI/2,0,0]); mk(g,TOR(r*.82,r*.12,4,16),BR,[0,0,.007]); mk(g,CYL(r*.5,r*.55,.016,14),BR,[0,0,.006],[PI/2,0,0]); mk(g,CYL(r*.22,r*.22,.02,10),'metal:#3a2a18',[0,0,.008],[PI/2,0,0]); return g; };
  const model=()=>{ const sk=MERCH.skel({hipY:.55,waist:.05,neck:.41,shX:.2,shY:.31,upper:.22,fore:.2,hipX:.105,thigh:.27,shin:.27}), {B}=sk;
    /* the head: broad and flat, the snout rounded, a wide shut mouth, a pale throat; big eyes high on the sides in brass rings, brass ports behind them */
    const H=grp(B.head,[0,.1,.03]); H.scale.setScalar(1.12);
    mk(H,paint(SPH(.155,30,20),skinC),SKIN,[0,0,0],[0,0,0],[1.08,.78,1.15]);
    mk(H,paint(SPH(.13,24,16),skinC),SKIN,[0,-.035,.06],[.15,0,0],[1.05,.6,1.08]);
    mk(H,paint(SPH(.14,22,14),(x,y,z)=>mix(C('#d8dcc8'),C('#b8c0ac'),fbm(x*20,y*20,z*20))),SKIN,[0,-.07,.0],[0,0,0],[1.02,.5,1.05]);
    mk(H,TOR(.138,.005,3,30,PI*.92),'skin:#4a5446',[0,-.06,.03],[PI/2,0,PI*.04],[1.02,1.2,1]);
    for(const s of [1,-1]){ mk(H,SPH(.008,6,4),'skin:#3a4236',[s*.03,.02,.195]);
      const E=[s*.095,.075,.075], eg=face(grp(H,E),[s*.75,.25,.6]);
      mk(eg,paint(SPH(.06,18,12),skinC),SKIN,[0,0,-.015]);
      mk(eg,SPH(.048,18,14),'glass:#0a0c10',[0,0,.018]); mk(eg,SPH(.05,16,12),'ivory:#0c0e12',[0,0,.012],[0,0,0],[1,1,.85]);
      mk(eg,TOR(.05,.008,6,22),BR,[0,0,.032]); mk(eg,TOR(.042,.003,4,20),'metal:#d8a848',[0,0,.044]);
      mk(eg,SPH(.01,6,4),'plain:#ffffff',[-s*.012,.02,.06]);
      mk(eg,paint(SPH(.064,16,10,0,PI*2,0,PI*.42),skinC),SKIN,[0,.004,-.004],[.35,0,0],[1.05,1,1.05]);
      port(H,[s*.15,.02,-.035],.032,[s,.15,-.15]); port(H,[s*.085,.1,-.07],.018,[s*.4,1,-.2]); }
    for(let i=0;i<8;i++){ const a=(rnd()-.5)*2.4, e=rnd()*.9-.1; mk(H,SPH(.004,5,4),GOLD,[Math.sin(a)*Math.cos(e)*.168,Math.sin(e)*.122,Math.cos(a)*Math.cos(e)*.178]); }
    mk(B.head,paint(CYL(.13,.15,.12,16),skinC),SKIN,[0,.01,0]);
    /* the vest: pale ribbed cloth over a round belly; the bronze plate curved across its front, worked like a circuit, riveted and hinged */
    const ribC=(x,y,z)=>mix(C('#d6d8d2'),C('#a8aca6'),Math.sin(Math.atan2(x,z)*40)*.3+.4+fbm(x*20,y*20,z*20)*.3);
    mk(B.torso,paint(MERCH.K.lathe([[.18,-.08],[.21,.04],[.225,.14],[.215,.24],[.19,.31],[.16,.36],[.13,.41]],12,26,.85),ribC),'knit:vc');
    { const P=grp(B.torso,[0,.06,0],[0,-.35,.06]); const plC=(x,y,z)=>mix(C('#7a5226'),C('#4a3014'),fbm(x*30,y*30,z*30)+(Math.abs(Math.sin(y*90))<.08||Math.abs(Math.sin(Math.atan2(x,z)*26))<.06?.5:0));
      mk(P,paint(MERCH.K.lathe([[.2,-.06],[.232,.04],[.24,.14],[.228,.22]],8,10,.88,-.85,1.6),plC),'metal:vc');
      for(let i=0;i<9;i++){ const a=-.75+rnd()*1.5, y=-.03+rnd()*.23; mk(P,SPH(.009,6,4),BR,[Math.sin(a)*.242,y,Math.cos(a)*.242*.88]); }
      for(const y of [.0,.09,.18]){ const a=.83; mk(P,CYL(.012,.012,.05,8),BR,[Math.sin(a)*.235,y,Math.cos(a)*.235*.88]); mk(P,BOX(.03,.04,.008),BRD,[Math.sin(a)*.232-.012,y,Math.cos(a)*.232*.88+.01],[0,a,0]); }
      mk(P,BOX(.06,.07,.01),BRD,[.0,.1,.215]); mk(P,TOR(.022,.005,4,12),BR,[-.06,.04,.212]); }
    mk(B.torso,paint(SPH(.08,12,8),skinC),SKIN,[0,.38,.06],[0,0,0],[1.3,.6,1]);
    // the brass works at his back: a gear on the shoulder and a fitting under it
    { const G=grp(B.torso,[-.12,.3,-.16],[0,PI*.8,0]); G.userData.rigid=1; mk(G,CYL(.05,.05,.025,16),BR,[0,0,0],[PI/2,0,0]); for(let i=0;i<10;i++){ const a=i/10*PI*2; mk(G,BOX(.016,.016,.026),BR,[Math.cos(a)*.056,Math.sin(a)*.056,0],[0,0,a]); } mk(G,CYL(.018,.018,.03,10),BRD,[0,0,.004],[PI/2,0,0]);
      mk(B.torso,BOX(.08,.14,.04),BRD,[-.11,.16,-.17],[0,.3,0]); mk(B.torso,CYL(.012,.012,.2,6),BR,[-.06,.22,-.19],[.2,0,.5]); }
    /* the hood: clear plastic, faceted, a point over his head and down his back to the belt, open at his face and chest; a clear roll round his neck; gold flecks caught in it */
    { const D=grp(B.torso,[0,.4,-.07]); D.userData.rigid=1;
      mk(D,MERCH.K.lathe([[0,.48],[.17,.33],[.27,.14],[.3,-.06],[.28,-.26],[.2,-.42],[.05,-.48]],8,9,.85,PI*.22,PI*1.56),GLASS);
      for(let i=0;i<26;i++){ const a=PI*.3+rnd()*PI*1.4, h=-.3+rnd()*.7, r=h>.14?.27-(h-.14)/.34*.27:.29; mk(D,SPH(.004,4,3),GOLD,[Math.sin(a)*r*1.01,h,Math.cos(a)*r*.86]); }
      mk(B.torso,TOR(.15,.03,8,24),GLASS,[0,.39,.01],[PI/2+.1,0,0],[1.05,1.1,1]); }
    /* the belt and its pouch */
    mk(B.hips,MERCH.K.lathe([[.2,.07],[.205,-.01],[.18,-.07],[0,-.08]],5,20,.86),'knit:#c8ccc4');
    mk(B.hips,TOR(.2,.022,4,24),'leather:#5a3a1e',[0,.04,0],[PI/2,0,0],[1,.88,1]); mk(B.hips,BOX(.05,.045,.012),BR,[0,.04,.18]);
    mk(B.hips,BOX(.12,.11,.06),'leather:#6a4422',[-.16,-.01,-.1],[0,-.9,0]); mk(B.hips,BOX(.12,.03,.065),'leather:#4a2e16',[-.16,.04,-.1],[0,-.9,0]);
    /* the arms: glossy green see-through sleeves, a seam at the elbow, gold flecks; frog hands of four long dark fingers */
    for(const s of [1,-1]){ const n=s>0?'L':'R', U=B['upperArm'+n], F=B['forearm'+n], Hd=B['hand'+n];
      mk(U,paint(SPH(.085,14,10),vinC),VIN,[0,-.01,0]); mk(U,paint(CYL(.078,.066,.24,14),vinC),VIN,[0,-.11,0]); flecks(U,7,[0,-.11,0],.065,.2);
      mk(F,paint(SPH(.068,12,8),vinC),VIN); mk(F,TOR(.066,.006,4,14),'plastic:#8ab08a',[0,-.01,0],[PI/2,0,0]);
      mk(F,paint(CYL(.066,.055,.2,14),vinC),VIN,[0,-.1,0]); flecks(F,9,[0,-.11,0],.054,.17);
      mk(Hd,paint(SPH(.042,12,8),(x,y,z)=>mix(C('#8a9a84'),C('#5a6a58'),fbm(x*40,y*40,z*40))),SKIN,[0,-.035,.005],[0,0,0],[1,1.1,.6]);
      for(let i=0;i<4;i++){ const Fg=grp(Hd,[(i-1.5)*.02*s,-.065,.006],[.35+i*.05,0,(i-1.5)*.12*s]); mk(Fg,CAP(.008,.065,1,5),'skin:#2a2e2a',[0,-.04,0]); mk(Fg,SPH(.012,8,6),'skin:#1e221e',[0,-.08,.002]); }
      const Th=grp(Hd,[-s*.034,-.03,.02],[.5,0,s*.7]); mk(Th,CAP(.008,.045,1,5),'skin:#2a2e2a',[0,-.03,0]); mk(Th,SPH(.011,8,6),'skin:#1e221e',[0,-.058,0]);
      /* the legs: ribbed green vinyl, a seam at the knee; frog feet in glossy boots, long webbed toes, dark at the tips */
      mk(B['thigh'+n],paint(CYL(.105,.088,.28,14),vinC),VIN,[0,-.13,0]); flecks(B['thigh'+n],6,[0,-.14,0],.08,.24);
      mk(B['shin'+n],TOR(.088,.008,4,14),'plastic:#8ab08a',[0,0,0],[PI/2,0,0]); flecks(B['shin'+n],10,[0,0,0],.09,.02);
      mk(B['shin'+n],paint(CYL(.088,.074,.27,14),vinC),VIN,[0,-.13,0]); flecks(B['shin'+n],5,[0,-.14,0],.065,.22);
      const Sh=B['shoe'+n]; mk(Sh,paint(CYL(.074,.08,.1,14),vinC),VIN,[0,.04,0]); mk(Sh,paint(SPH(.075,14,10),vinC),VIN,[0,.03,.04],[0,0,0],[1,.55,1.4]);
      mk(Sh,MERCH.K.lathe([[0,0],[.08,.002],[.09,.012],[.0,.016]],3,14),'plastic:#2e4a38',[0,.0,.06],[0,0,0],[1.15,1,1.9]);
      for(let i=0;i<4;i++){ const a=(i-1.5)*.38+s*.1, T=grp(Sh,[Math.sin(a)*.06,.012,.1+Math.cos(a)*.03],[0,a,0]);
        mk(T,paint(CAP(.013,.08,1,6),vinC),VIN,[0,0,.05],[PI/2,0,0],[1,1,.7]); mk(T,SPH(.018,8,6),'skin:#1e221e',[0,.0,.1],[0,0,0],[1,.6,1]); } }
    return sk; };
  BUBBLEFROG.model=model;
  const body=MERCH.add({key:'bubblefrog',label:'THE FROG IN THE BUBBLE SUIT',height:1.45,model,size:8,q:.35,at:100,
    idle:t=>MERCH.pose({nod:-10,yaw:Math.sin(t*.25)*8,bend:-2,L:{ua:[14,10],fa:[48,4]},R:{ua:[16,12],fa:[52,6]}})});
  const N=BUBBLEFROG.N=body&&body.npc;
  if(N&&HOMES.band){ const b=HOMES.band(), st=N.st, x=(b.x0+b.x1)/2-5*TILE, z=b.rows[0]; Object.assign(st.home,{x,z,r:Math.max(b.x1-b.x0,b.z1-b.z0)/2}); st.x=x; st.z=z; st.to=st.next=null; }
  window.BUBBLEFROGDBG=()=>N?{x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),hd:+N.st.hd.toFixed(2),vis:N.g.visible,tris:body.tris()}:null; }
