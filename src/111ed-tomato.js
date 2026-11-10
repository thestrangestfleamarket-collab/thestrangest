// THE TOMATO: TOONS.tomato, the vegetable seller's body on the player's rig (a smooth MERCH body: the glossy speckled tomato head under its leafy calyx and stem, the big white eyes, the smirk, the red suit, white arms and gloves, the yellow apron).
import {THREE} from './003-shx.js';
import {pos} from './003b-systems.js';
import {TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
const TOONS={};
{ const {SPH,CYL,grp,mk,paint,hash3,C,mix,fbm,bend,ribbon}=MERCH.K, PI=Math.PI, V3=THREE.Vector3;
  let seed=5; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  const RED=C('#d0231a'), DEEP=C('#9a1410'), SHINE=C('#ec4a30'), DOT=C('#f2a238'), LEAF=C('#66a64c'), LEAFD=C('#447f33'), VEIN=C('#8cbf6a'), SUIT=C('#c21e18'), APRON=C('#e6bb4a'), APROND=C('#c49432');
  const HR=.33, HC=[0,.31,.015], Z=new V3(0,0,1), face=(o,p)=>{ o.quaternion.setFromUnitVectors(Z,new V3(...p).normalize()); return o; };
  // the tomato's skin at a point of the unit sphere: six soft lobes, a dimple under the calyx, a flatter base
  const lobe=(x,y,z)=>{ const a=Math.atan2(x,z), s=Math.sqrt(Math.max(0,1-y*y)); return 1+.035*Math.cos(a*6)*Math.pow(1-Math.abs(y),1.5)-.06*Math.pow(Math.max(0,y),8)*0-.05*Math.max(0,y-.86)/.14; };
  const model=()=>{ const sk=MERCH.skel({hipY:.9,waist:.06,neck:.42,shX:.235,shY:.37,upper:.3,fore:.28,hipX:.1,thigh:.43,shin:.44}), {B}=sk;
    /* the head: a big glossy tomato, deep red underneath, bright where the light falls, freckled with little gold dots on one cheek and the brow */
    const H=grp(B.head,HC);
    { const g=SPH(1,64,44); bend(g,v=>{ const k=lobe(v.x,v.y,v.z); v.multiplyScalar(k); v.y*=.88; v.x*=1.02; v.z*=.96; v.multiplyScalar(HR); });
      paint(g,(x,y,z)=>{ const n=fbm(x*9,y*9,z*9), u=(y/HR+1)/2; let c=mix(DEEP,RED,.35+u*.9+(n-.5)*.4); c=mix(c,SHINE,Math.max(0,(y/HR)*.6+(x/HR)*.2+(z/HR)*.4-.55)*1.2); return c; }); mk(H,g,'ivory:vc'); }
    const onSkin=(a,e,r=HR)=>{ const x=Math.sin(a)*Math.cos(e), y=Math.sin(e), z=Math.cos(a)*Math.cos(e), k=lobe(x,y,z)*r; return [x*k*1.02,y*k*.88,z*k*.96]; };
    for(let i=0;i<MERCH.K.N(90,24);i++){ const side=rnd()<.78, a=side?.25+rnd()*1.05:-.5+rnd()*1, e=side?-.45+rnd()*.85:.25+rnd()*.35, p=onSkin(a,e,HR+.001);
      face(mk(H,SPH(.0045+rnd()*.003,6,4),'ivory:'+(rnd()<.5?'#f2a238':'#e8c060'),p,[0,0,0],[1,1,.45]),p); }
    /* the face: two big white eyes (domes bulging from the skin), black glossy pupils looking to his right and down, a nostril, the dark smirking lips */
    for(const [s,sc] of [[1,1],[-1,.94]]){ const a=s*.3, e=.2, p=onSkin(a,e,HR-.012), E=face(grp(H,p),p);
      const W=paint(SPH(.1*sc,28,20,0,PI*2,0,PI*.6),(x,y,z)=>mix(C('#f2efe6'),C('#d8d2c2'),fbm(x*60,y*60,z*60)*.8-.1+Math.max(0,-z)*3)); bend(W,v=>{ v.x*=.86; });
      W.rotateX(PI/2); mk(E,W,'ivory:vc',[0,0,-.022*sc],[0,0,0],[1,1,.95]);
      const pu=grp(E,[0,0,0],[.12,-s*.28-.18,0]); mk(pu,SPH(.042*sc,18,14),'ivory:#0a0808',[0,0,.06*sc],[0,0,0],[1,1,.6]);
      mk(pu,SPH(.008*sc,8,6),'plain:#ffffff',[.014,.016,.083*sc],[0,0,0],[1,1,.4]); }
    { const p=onSkin(-.06,.0,HR-.002); mk(H,SPH(.006,8,6),'plain:#140a08',p,[0,0,0],[1,.8,.6]); }
    { const p=onSkin(-.04,-.17,HR-.006), L=face(grp(H,p),p); const lips=SPH(.055,24,12); bend(lips,v=>{ const t=v.x/.055; v.y*=.28*(1-.55*t*t)+(t<0?.04:0); v.y+=.008*t*t*Math.sign(t)+.004*t; });
      mk(L,lips,'ivory:#1d0f0d',[0,0,.004],[0,0,-.06],[1,1,.35]); mk(L,MERCH.K.CAP(.0028,.09,2,6),'plain:#050303',[0,-.001,.017],[0,0,PI/2-.06]); }
    /* the calyx: seven broad leaves spreading from the crown over the top, ragged at their tips and drooping; the thick curving stem */
    { const top=[0,HR*.88*.93,0];
      for(let i=0;i<8;i++){ const a=i/8*PI*2+.2+(rnd()-.5)*.25, L=.27+rnd()*.07, dir=[Math.sin(a),0,Math.cos(a)], pts=[];
        for(let k=0;k<=5;k++){ const t=k/5, r=t*L, e=Math.asin(Math.min(.99,Math.max(-.6,.97-r/HR*.8))), q=onSkin(a+Math.sin(t*3+i)*.08,e,HR+.012+t*.012); pts.push(k?q:[top[0]+dir[0]*.02,top[1]+.01,top[2]+dir[2]*.02]); }
        mk(H,ribbon(pts,.21+rnd()*.04,26,12,(u,v)=>{ const vein=Math.abs(u)<.03?1:Math.abs(Math.sin((Math.abs(u)*2.4-v*1.6)*PI*2))<.05?.35:0; return mix(mix(LEAF,LEAFD,fbm(u*8,v*8,i)*.9-.25+v*.2),VEIN,vein*.55); },
          {out:v=>{ const q=pts[Math.min(5,Math.round(v*5))]; return [q[0],q[1]+.05,q[2]]; },lift:.004,taper:.75,wave:(u,v)=>.004*Math.sin(u*9+v*7+i)*v+(Math.abs(u)*.018)*v,ragged:(u,v)=>v>.85?(1-Math.abs(u)*2)*-.0:0}),'leather:vc');
        const tip=grp(H,pts[5]); mk(tip,SPH(.03,10,6),'leather:'+(i%2?'#46802f':'#3c7028'),[0,0,0],[0,a,0],[1.4,.25,1]); }
      const st=MERCH.K.TUBE(new THREE.CatmullRomCurve3([[0,top[1]-.02,0],[0,top[1]+.08,.0],[.01,top[1]+.17,.03],[.03,top[1]+.24,.075]].map(p=>new V3(...p))),20,.03,12,false);
      bend(st,v=>{ const t=Math.max(0,Math.min(1,(v.y-top[1])/.26)), k=1-.35*t; v.x*=k; v.z=(v.z-.0)*1; }); paint(st,(x,y,z)=>mix(C('#5c9a42'),C('#3e7a2c'),fbm(x*80,y*30,z*80)));
      mk(H,st,'leather:vc'); mk(H,CYL(.021,.02,.012,12),'leather:#9cc070',[.03,top[1]+.243,.077],[.65,0,-.15]); }
    /* the body: a red suit (chest, belly, legs) under the yellow apron; the neck hidden in the head */
    mk(B.torso,paint(MERCH.K.lathe([[.2,-.08],[.225,.06],[.235,.2],[.24,.3],[.2,.37],[.12,.42],[.06,.44]],24,40,.78),(x,y,z)=>mix(SUIT,DEEP,fbm(x*20,y*20,z*20)*.5)),'cloth:vc');
    mk(B.hips,paint(MERCH.K.lathe([[.205,.08],[.22,0],[.215,-.08],[.18,-.14],[.0,-.15]],16,36,.8),(x,y,z)=>mix(SUIT,DEEP,fbm(x*20,y*20,z*20)*.5)),'cloth:vc');
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['thigh'+n],CYL(.07,.06,.45,16),'cloth:#b81c16',[0,-.21,0]); mk(B['shin'+n],CYL(.058,.05,.45,16),'cloth:#b81c16',[0,-.21,0]);
      mk(B['shoe'+n],MERCH.K.CAP(.05,.12,6,14),'leather:#5a1a14',[0,.04,.05],[PI/2,0,0],[1,1,.72]);
      /* white costume arms, long and soft, a bit wrinkled at the elbow; white gloves with five slender fingers */
      mk(B['upperArm'+n],paint(CYL(.045,.042,.32,16,6),(x,y,z)=>mix(C('#ece9e0'),C('#cfcac0'),fbm(x*40,y*25,z*40)*.9)),'cloth:vc',[0,-.15,0]); mk(B['upperArm'+n],SPH(.05,14,10),'cloth:#e6e2d8',[0,-.01,0]);
      const fo=CYL(.042,.036,.3,16,10); bend(fo,v=>{ const r=Math.hypot(v.x,v.z)||1, w=v.y>.08?.004*Math.sin(v.y*120+Math.atan2(v.x,v.z)*3):0; v.x+=v.x/r*w; v.z+=v.z/r*w; }); paint(fo,(x,y,z)=>mix(C('#ece9e0'),C('#cfcac0'),fbm(x*40,y*25,z*40)*.9));
      mk(B['forearm'+n],fo,'cloth:vc',[0,-.14,0]); mk(B['forearm'+n],SPH(.042,12,8),'cloth:#e2ded4',[0,0,0]);
      const Hd=B['hand'+n], GL='knit:#f1efe8'; mk(Hd,CYL(.038,.034,.04,14),GL,[0,-.005,0]); mk(Hd,SPH(.036,16,12),GL,[0,-.055,.004],[0,0,0],[1.05,1.15,.55]);
      for(let i=0;i<4;i++){ const fx=(i-1.5)*.017*s, l=[.05,.058,.055,.045][i], F=grp(Hd,[fx,-.09,.006],[.25+i*.05,0,0]);
        mk(F,MERCH.K.CAP(.0085,l*.5,3,8),GL,[0,-l*.25,0]); const G=grp(F,[0,-l*.5,0],[.35,0,0]); mk(G,MERCH.K.CAP(.0078,l*.4,3,8),GL,[0,-l*.22,0]); }
      const Th=grp(Hd,[-s*.03,-.05,.015],[.4,0,s*.7]); mk(Th,MERCH.K.CAP(.009,.04,3,8),GL,[0,-.025,0]); }
    /* the apron: a wide yellow bib and skirt hanging from the chest to the shins, freckled with tiny brown dots, a pale label stitched on at the top */
    { const ap=(u,v)=>{ const n=fbm(u*14,v*14,3), d=hash3(Math.round(u*90),Math.round(v*160),5)>.97; return d?C('#8a6a3a'):mix(APRON,APROND,n*.35-.05+v*.08); };
      mk(B.torso,ribbon([[0,.34,.175],[0,.22,.195],[0,.08,.2],[0,-.06,.2]],.36,16,16,ap,{out:()=>[0,0,1],lift:.02,wave:(u,v)=>-u*u*.35}),'skin:vc');
      mk(B.hips,ribbon([[0,.0,.2],[0,-.2,.225],[0,-.42,.255],[0,-.62,.28],[0,-.74,.29]],.6,30,24,(u,v)=>ap(u,v+1),{out:()=>[0,0,1],lift:.004,wave:(u,v)=>-u*u*.55*(1-v*.3)+.008*Math.sin(u*20+v*4)*v}),'skin:vc');
      mk(B.torso,new THREE.BoxGeometry(.05,.02,.003),'cloth:#bfd6b0',[.07,.3,.21],[-.1,0,.05]);
      for(const s of [1,-1])mk(B.torso,ribbon([[s*.17,.33,.165],[s*.2,.38,.05],[s*.15,.42,-.07]],.022,10,2,()=>APRON,{lift:.006}),'cloth:vc');
      mk(B.hips,MERCH.K.lathe([[.226,.03],[.226,-.01]],2,28,.82),'cloth:#d9ab3c'); }
    return sk; };
  TOONS.model=model;
  const L={ua:[6,12],fa:[22,4]}, Rr={ua:[34,6],fa:[72,-8]}, look=N=>{ const s=N.st, d=Math.hypot(pos.x-s.x,pos.z-s.z); let a=0; if(d<7*TILE&&d>.2*TILE){ a=Math.atan2(pos.x-s.x,pos.z-s.z)-s.hd; a=Math.atan2(Math.sin(a),Math.cos(a)); a=Math.max(-.8,Math.min(.8,a)); }
    const now=performance.now()/1000, dt=Math.min(.2,now-(N._lt||now)); N._lt=now; N._lk=(N._lk||0)+(a-(N._lk||0))*Math.min(1,dt*2.5); if(Math.abs(N._lk-a)<.004)N._lk=a; return N._lk*180/PI; };
  const body=MERCH.add({key:'tomato',q:.3,label:'THE TOMATO',height:2.2,model,size:11.5,hd:0,idle:(t,N)=>MERCH.pose({nod:-3,look:N&&!N.sheetOn?look(N):0,L,R:Rr})});
  const N=TOONS.tomato=body&&body.npc; if(N){ N.st.hold=true; N.st.to=N.st.next=null; N.H=2.4*TILE; }
  window.TOONSDBG=()=>Object.fromEntries(Object.entries(TOONS).filter(([k,N])=>N&&N.st).map(([k,N])=>[k,{key:N.key,x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),tris:N.body&&N.body.tris(),vis:N.g.visible}])); }
export {TOONS};
