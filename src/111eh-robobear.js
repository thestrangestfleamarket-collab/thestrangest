// THE ROBOT AND THE BEAR: ROBOBEAR, a big gunmetal robot and the small shaggy black bear with glowing eyes who goes everywhere with him, carrying a panelled grey device (two smooth MERCH bodies on the player's rig).
import {THREE} from './003-shx.js';
import {SYS, TILE} from './006-map-pre.js';
import {HOMES} from './076-npc-map.js';
import {MERCH} from './111e-merch.js';
const ROBOBEAR={};
{ const {SPH,CYL,TOR,BOX,CONE,CAP,grp,mk,paint,C,mix,fbm}=MERCH.K, PI=Math.PI;
  let seed=29; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  const MET='skin:vc', metC=(x,y,z)=>mix(C('#8a9097'),C('#62676e'),fbm(x*14,y*14,z*14)*1.1-.2), GAP='skin:#34373b', DARK='plain:#1b1c1e';
  const met=g=>paint(g,metC);
  // a slotted grille: a row of dark bars set into a plate
  const vents=(par,at,rot,w,h,n)=>{ const g=grp(par,at,rot); mk(g,met(BOX(w,h,.02)),MET); for(let i=0;i<n;i++)mk(g,BOX(w*.8,h/n*.4,.012),DARK,[0,-h/2+(i+.5)*h/n,.008]); return g; };
  /* ---------- the robot ---------- */
  const robot=()=>{ const sk=MERCH.skel({hipY:1.0,waist:.1,neck:.62,shX:.36,shY:.5,upper:.34,fore:.34,hipX:.17,thigh:.47,shin:.5}), {B}=sk;
    // the head: a domed helmet with a ridge down its crown, the visor's brow standing out over a slotted face plate, a jaw of vents, round speakers for ears with a box over each
    const H=grp(B.head,[0,.2,0]);
    mk(H,met(SPH(.2,26,14,0,PI*2,0,PI*.55)),MET,[0,.0,-.01],[0,0,0],[1,1.12,1.12]);
    mk(H,met(BOX(.05,.06,.42)),MET,[0,.2,-.02],[-.1,0,0]); for(const s of [1,-1])mk(H,BOX(.006,.12,.3),GAP,[s*.11,.15,-.03],[-.2,0,s*.18]);
    mk(H,met(BOX(.38,.1,.16)),MET,[0,-.02,.17],[.12,0,0]); mk(H,BOX(.36,.03,.02),DARK,[0,-.07,.24]);
    mk(H,met(BOX(.3,.17,.18)),MET,[0,-.14,.1]); mk(H,met(BOX(.22,.08,.12)),MET,[0,-.24,.12],[-.15,0,0]);
    for(const s of [1,-1])vents(H,[s*.12,-.15,.19],[0,s*.35,0],.08,.1,4);
    vents(H,[0,-.25,.18],[-.15,0,0],.14,.05,3);
    for(const s of [1,-1]){ const E=grp(H,[s*.205,-.06,0],[0,0,s*PI/2]); mk(E,met(CYL(.1,.1,.08,18)),MET); mk(E,CYL(.075,.075,.085,18),GAP);
      for(let i=0;i<5;i++)mk(E,BOX(.1,.006,.01),DARK,[0,-s*.044,-.04+i*.02],[PI/2,0,0]); mk(E,TOR(.08,.008,4,18),MET,[0,-s*.042,0],[PI/2,0,0]);
      mk(H,met(BOX(.09,.13,.11)),MET,[s*.2,.1,.03]); }
    mk(B.head,met(CYL(.09,.11,.16,12)),MET,[0,.03,0]); for(let i=0;i<3;i++)mk(B.head,TOR(.1,.01,4,14),GAP,[0,-.02+i*.05,0],[PI/2,0,0]);
    // the body: a barrel chest with seams, a round port low on the belly, the hips' plates
    mk(B.torso,met(MERCH.K.lathe([[.3,-.12],[.37,.04],[.41,.2],[.42,.36],[.39,.5],[.3,.6],[.14,.65]],12,24,.82)),MET);
    for(const [y,w] of [[.12,.7],[.3,.8],[.46,.7]])mk(B.torso,BOX(w,.008,.008),GAP,[0,y,.335]);
    mk(B.torso,BOX(.008,.4,.008),GAP,[0,.3,.345]); mk(B.torso,TOR(.07,.018,6,18),MET,[.12,-.02,.3]); mk(B.torso,CYL(.06,.06,.03,16),DARK,[.12,-.02,.29],[PI/2,0,0]);
    mk(B.hips,met(MERCH.K.lathe([[.3,.12],[.33,.0],[.3,-.12],[.18,-.18],[0,-.2]],6,20,.8)),MET);
    for(const s of [1,-1])mk(B.hips,met(BOX(.22,.24,.04)),MET,[s*.2,-.1,.24],[-.1,s*.3,0]).userData.skirt=1;
    // the arms: great domed shoulder guards, ringed upper arms, forearms of stacked plates, a hand of jointed fingers
    for(const s of [1,-1]){ const n=s>0?'L':'R', U=B['upperArm'+n], F=B['forearm'+n], Hd=B['hand'+n];
      const P=grp(U,[s*.02,.04,0]); P.userData.rigid=1; mk(P,met(SPH(.22,16,10,0,PI*2,0,PI*.55)),MET,[0,0,0],[0,0,s*.25],[1.05,.95,1.1]); mk(P,TOR(.2,.018,5,20),MET,[0,-.01,0],[PI/2,0,s*.25],[1,1.08,1]);
      mk(U,met(CYL(.1,.09,.32,12)),MET,[0,-.17,0]); for(let i=0;i<3;i++)mk(U,TOR(.1,.012,4,12),GAP,[0,-.08-i*.09,0],[PI/2,0,0]);
      mk(F,met(SPH(.095,10,8)),MET); for(let i=0;i<4;i++)mk(F,met(BOX(.17-i*.008,.075,.16-i*.006)),MET,[0,-.05-i*.075,0],[.04*(i%2),0,0]);
      mk(Hd,met(BOX(.13,.11,.09)),MET,[0,-.06,.01]);
      for(let i=0;i<4;i++){ const Fg=grp(Hd,[(i-1.5)*.03*s,-.12,.02],[.4,0,0]); for(let k=0;k<3;k++){ mk(Fg,met(BOX(.026,.05,.028)),MET,[0,-.028-k*.054,k*.008]); mk(Fg,CYL(.012,.012,.03,6),GAP,[0,-.002-k*.054,k*.008],[0,0,PI/2]); } }
      const Th=grp(Hd,[-s*.07,-.05,.04],[.4,0,s*.6]); for(let k=0;k<2;k++)mk(Th,met(BOX(.028,.05,.03)),MET,[0,-.03-k*.055,0]);
      // legs: thick thighs, a knee cap, shins, heavy boots
      mk(B['thigh'+n],met(CYL(.13,.115,.46,12)),MET,[0,-.22,0]); mk(B['shin'+n],met(SPH(.1,10,8)),MET,[0,0,.06]); mk(B['shin'+n],met(CYL(.11,.1,.48,12)),MET,[0,-.24,0]);
      mk(B['shoe'+n],met(CAP(.1,.18,3,12)),MET,[0,.08,.06],[PI/2,0,0],[1.1,1,.8]); }
    return sk; };
  /* ---------- the bear ---------- */
  const FUR='fur:vc', furC=(x,y,z)=>mix(C('#1e1e22'),C('#0b0b0d'),fbm(x*70,y*70,z*70)*1.3-.2), fur=g=>paint(g,furC);
  const bear=()=>{ const sk=MERCH.skel({hipY:.42,waist:.05,neck:.3,shX:.15,shY:.26,upper:.18,fore:.17,hipX:.085,thigh:.21,shin:.2}), {B}=sk;
    const H=grp(B.head,[0,.13,.02]);
    mk(H,fur(SPH(.14,20,16)),FUR,[0,0,0],[0,0,0],[1.05,.95,.95]); mk(H,fur(SPH(.07,12,10)),FUR,[0,-.04,.11],[0,0,0],[.95,.75,1.1]);
    mk(H,SPH(.025,10,8),'ivory:#070707',[0,-.03,.185],[0,0,0],[1.3,.9,.9]); mk(H,CAP(.004,.04,1,4),'plain:#050505',[0,-.075,.165],[0,0,PI/2]);
    for(const s of [1,-1]){ mk(H,SPH(.022,12,10),'ivory:#8ff8ff',[s*.052,.02,.122]); mk(H,SPH(.008,6,4),'plain:#ffffff',[s*.048,.03,.14]);
      mk(H,fur(SPH(.05,10,8)),FUR,[s*.1,.11,-.01],[0,0,0],[1,1,.55]); mk(H,SPH(.03,8,6),'fur:#26262a',[s*.1,.11,.012],[0,0,0],[1,1,.3]); }
    // shaggy: the fur stands out in tufts all over
    const tufts=(bone,n,c,r,h)=>{ for(let i=0;i<n;i++){ const a=rnd()*PI*2, y=(rnd()-.5)*h, p=[c[0]+Math.sin(a)*r,c[1]+y,c[2]+Math.cos(a)*r*.9]; const t=mk(B[bone],fur(CONE(.022,.06,5)),FUR,p); t.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.sin(a),.3+rnd()*.4,Math.cos(a)).normalize()); } };
    mk(B.torso,fur(MERCH.K.lathe([[.13,-.06],[.15,.06],[.155,.15],[.14,.22],[.1,.27],[.06,.3]],8,18,.92)),FUR); tufts('torso',22,[0,.12,0],.14,.26);
    mk(B.hips,fur(MERCH.K.lathe([[.14,.06],[.155,-.02],[.13,-.08],[0,-.09]],5,16,.92)),FUR); tufts('hips',8,[0,-.01,0],.14,.1);
    mk(B.head,fur(CYL(.07,.08,.12,10)),FUR,[0,.03,0]); tufts('head',10,[0,.13,-.02],.12,.12);
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['upperArm'+n],fur(CYL(.055,.05,.2,10)),FUR,[0,-.09,0]); mk(B['upperArm'+n],fur(SPH(.06,10,8)),FUR); mk(B['forearm'+n],fur(CYL(.05,.048,.18,10)),FUR,[0,-.08,0]);
      mk(B['hand'+n],fur(SPH(.05,10,8)),FUR,[0,-.04,.01],[0,0,0],[1,1.1,.85]); for(let i=0;i<3;i++)mk(B['hand'+n],SPH(.007,5,4),'plain:#3a3a3e',[(i-1)*.022,-.085,.04]);
      mk(B['thigh'+n],fur(CYL(.07,.06,.22,10)),FUR,[0,-.1,0]); mk(B['shin'+n],fur(CYL(.06,.058,.2,10)),FUR,[0,-.09,0]); mk(B['shoe'+n],fur(CAP(.055,.07,2,8)),FUR,[0,.04,.04],[PI/2,0,0],[1,1,.75]); tufts('thigh'+n,4,[s*.0,-.1,0],.06,.15); }
    // the device he carries across his chest: a long grey slab of panels and vents, one small cyan window
    const D=grp(B.torso,[0,.1,.24],[0,0,.18]); D.userData.rigid=1; const GR='metal:#6a6d70', GD='metal:#4a4c4f';
    mk(D,BOX(.56,.17,.2),GR); for(let i=0;i<5;i++)mk(D,BOX(.012,.17,.205),GD,[-.24+i*.12,0,0]);
    for(let i=0;i<9;i++)mk(D,BOX(.04+rnd()*.06,.02+rnd()*.03,.012),rnd()<.5?GD:GR,[-.24+rnd()*.48,-.06+rnd()*.12,.104]);
    mk(D,BOX(.05,.04,.01),'ivory:#7ff0ff',[.1,.02,.106]); for(let i=0;i<4;i++)mk(D,BOX(.08,.006,.01),'plain:#2a2c2e',[-.15,-.05+i*.02,.106]);
    return sk; };
  const RB=MERCH.add({key:'robot',label:'THE ROBOT',height:2.3,model:robot,size:13,q:.4,at:100,
    idle:t=>MERCH.pose({nod:-6,bend:5,L:{ua:[12,16],fa:[34,8]},R:{ua:[14,14],fa:[40,6]}})});
  const BR=MERCH.add({key:'bear',label:'THE BLACK BEAR',height:1.05,model:bear,size:6,q:.4,at:100,
    idle:t=>MERCH.pose({nod:4,L:{ua:[28,6],fa:[72,-34]},R:{ua:[28,6],fa:[72,-34]}})});
  const R=ROBOBEAR.robot=RB&&RB.npc, Bb=ROBOBEAR.bear=BR&&BR.npc;
  // their round: the street's band, from the middle; the bear keeps at the robot's side, a step behind and to his left
  if(R&&Bb&&HOMES.band){ const b=HOMES.band(), x=(b.x0+b.x1)/2-30*TILE, z=b.rows[1]; Object.assign(R.st.home,{x,z,r:Math.max(b.x1-b.x0,b.z1-b.z0)/2}); Object.assign(R.st,{x,z,to:null,next:null});
    Object.assign(Bb.st,{x:x+.9*TILE,z:z-.4*TILE,hold:true,to:null,next:null}); Bb.free=()=>true;
    const sheet=new URLSearchParams(location.search).get('sheet');
    if(sheet!=='bear')SYS.add('life',()=>{ const r=R.st, s=Bb.st, tx=r.x+Math.sin(r.hd+1.2)*.9*TILE, tz=r.z+Math.cos(r.hd+1.2)*.9*TILE, d=Math.hypot(tx-s.x,tz-s.z);
      if(d>.35*TILE)s.to={x:tx,z:tz}; else if(s.to&&!r.to){ s.to=null; s.hd=r.hd; } },'111eh-robobear'); }
  window.ROBOBEARDBG=()=>R&&Bb?{robot:{x:+R.st.x.toFixed(2),z:+R.st.z.toFixed(2),hd:+R.st.hd.toFixed(2),tris:RB.tris()},bear:{x:+Bb.st.x.toFixed(2),z:+Bb.st.z.toFixed(2),tris:BR.tris()}}:null; }
