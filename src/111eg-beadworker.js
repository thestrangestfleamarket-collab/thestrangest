// THE BEADWORKER: BEADWORKER, a blue-skinned street figure under a beaded cap crowded with knobs and rosettes, beaded rings round his eyes, orange freckles, a studded leather jacket and a braided cord, holding up a beaded mushroom (a smooth MERCH body on the player's rig, at the low detail).
import {THREE} from './003-shx.js';
import {TILE} from './006-map-pre.js';
import {HOMES} from './076-npc-map.js';
import {MERCH} from './111e-merch.js';
const BEADWORKER={};
{ const {SPH,CYL,TOR,BOX,CONE,CAP,grp,mk,paint,C,mix,fbm}=MERCH.K, PI=Math.PI, V3=THREE.Vector3;
  const CAPK=new URLSearchParams(location.search).get('beadcap')||'A';   // the cap's two mockups: A many small knobs, B fewer big ones and more rosettes
  let seed=13; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  const SKIN='skin:vc', skinC=(x,y,z)=>mix(C('#3478ad'),C('#1f4f7c'),fbm(x*30,y*30,z*30)*1.2-.3), JACK='leather:#6b4630', DOTS=['#e0782a','#c8402a','#f0a040'];
  const Z=new V3(0,0,1), face=(o,p)=>{ o.quaternion.setFromUnitVectors(Z,new V3(...p).normalize()); return o; };
  // a beaded rosette: rings of colour stepping in to a bead at the middle
  const rosette=(par,p,r,cols)=>{ const g=face(grp(par,p),p); cols.forEach((c,i)=>{ const k=1-i/cols.length; mk(g,CYL(r*k,r*k,.006,12),'knit:'+c,[0,0,.003+i*.002],[PI/2,0,0]); }); mk(g,SPH(r*.18,8,6),'ivory:#f0d040',[0,0,.006+cols.length*.002]); return g; };
  const model=()=>{ const sk=MERCH.skel({hipY:.92,waist:.06,neck:.5,shX:.19,shY:.42,upper:.28,fore:.26,hipX:.1,thigh:.44,shin:.44}), {B}=sk;
    /* the head: long and blue, a strong nose, a faint smile, pointed ears; heavy-lidded eyes sunk in rings of brown and orange, beaded round */
    const H=grp(B.head,[0,.13,.02]);
    mk(H,paint(SPH(.1,30,24),skinC),SKIN,[0,0,0],[0,0,0],[.9,1.15,1]); mk(H,paint(SPH(.06,16,12),skinC),SKIN,[0,-.085,.035],[0,0,0],[1.1,.8,1]);
    mk(H,paint(SPH(.022,12,10),skinC),SKIN,[0,-.025,.1],[.25,0,0],[.75,1.5,1.1]); mk(H,paint(SPH(.016,10,8),skinC),SKIN,[0,-.055,.105],[0,0,0],[1.3,.8,1]);
    mk(H,SPH(.03,12,8),'skin:#1a3a5c',[0,-.088,.088],[0,0,.05],[1.5,.35,.6]);
    for(const s of [1,-1]){ const E=[s*.042,.012,.082];
      for(const [r,t,c] of [[.04,.008,'#5a3020'],[.032,.007,'#7a4428'],[.024,.006,'#c06a2a']])mk(H,TOR(r,t,4,16),'leather:'+c,[E[0],E[1]-.004,E[2]+.004],[0,s*.25,0],[1,.85,1]);
      for(let i=0;i<10;i++){ const a=i/10*PI*2; mk(H,SPH(.0045,5,4),'ivory:'+DOTS[i%3],[E[0]+Math.cos(a)*.047,E[1]-.004+Math.sin(a)*.04,E[2]+.002],[0,0,0]); }
      mk(H,SPH(.022,14,10),'ivory:#efe6d2',[E[0],E[1],E[2]+.004]); mk(H,SPH(.012,10,8),'ivory:#3a2418',[E[0]-s*.004,E[1]-.002,E[2]+.022]);
      mk(H,paint(SPH(.025,12,8,0,PI*2,0,PI*.5),skinC),SKIN,[E[0],E[1]+.002,E[2]+.005],[.5,s*.2,0],[1.1,1,1]);
      const ear=grp(H,[s*.09,.0,-.01],[0,s*.5,-s*.3]); mk(ear,paint(CONE(.035,.1,8),skinC),SKIN,[0,.03,0],[0,0,0],[1,1,.4]); }
    for(let i=0;i<34;i++){ const a=(rnd()-.5)*2.2, e=(rnd()-.6)*1.1, r=.1; mk(H,SPH(.0035+rnd()*.002,5,4),'ivory:'+DOTS[i%3],[Math.sin(a)*Math.cos(e)*r*.92,Math.sin(e)*r*1.12-.02,Math.cos(a)*Math.cos(e)*r+.004]); }
    mk(B.head,paint(CYL(.042,.05,.2,12),skinC),SKIN,[0,.0,0]);
    /* the cap: a dark beaded dome, rosettes worked over it, knobs of moss, tan, rose and teal crowding the top and brim, a green one standing up at the crown */
    const CP=grp(H,[0,.07,-.01]); mk(CP,paint(SPH(.118,22,14,0,PI*2,0,PI*.55),(x,y,z)=>mix(C('#5a2a2a'),C('#3a1c24'),fbm(x*60,y*60,z*60))),'knit:vc',[0,0,0],[0,0,0],[1.08,.8,1.1]);
    const onCap=(a,e)=>[Math.sin(a)*Math.cos(e)*.128,Math.sin(e)*.1,Math.cos(a)*Math.cos(e)*.13];
    const ROS=[['#2a6ab0','#e07a2a','#3a9ad0'],['#c03a2a','#e0a040','#2a4a8a'],['#7a3a8a','#d06aa0','#f0c040'],['#2a7a6a','#e0782a','#b03a3a']];
    const nR=CAPK==='B'?14:9, nK=CAPK==='B'?16:34, kR=CAPK==='B'?[.034,.05]:[.022,.036];
    for(let i=0;i<nR;i++){ const a=i/nR*PI*2+.3, e=.25+(i%3)*.32; rosette(CP,onCap(a,e),.032+rnd()*.012,ROS[i%4]); }
    const KN=['#5a8a6a','#c8b090','#b06a8a','#2a4a5a','#d8c8a0','#4a7a8a'];
    for(let i=0;i<nK;i++){ const a=rnd()*PI*2, e=rnd()<.4?rnd()*.25:.2+rnd()*1.1, p=onCap(a,e), r=kR[0]+rnd()*(kR[1]-kR[0]);
      mk(CP,paint(SPH(r,9,7),(x,y,z)=>mix(C(KN[i%6]),C('#2a2420'),fbm(x*400,y*400,z*400)*.6-.1)),'knit:vc',[p[0]*1.08,p[1]+.004,p[2]*1.08]); }
    mk(CP,CYL(.012,.014,.05,6),'knit:#3a6a4a',[0,.12,0]); mk(CP,paint(SPH(.045,10,8),(x,y,z)=>mix(C('#5a9a5a'),C('#2a5a3a'),fbm(x*300,y*300,z*300))),'knit:vc',[0,.16,0],[0,0,0],[1.1,.8,1]);
    /* the jacket: worn brown leather, collar up, studded with blue sequins; the braided blue cord round his neck; dark trousers and boots */
    mk(B.torso,MERCH.K.lathe([[.16,-.08],[.18,.05],[.19,.2],[.205,.32],[.2,.38],[.15,.44],[.08,.48],[.06,.5]],10,22,.8),JACK);
    for(const s of [1,-1])mk(B.torso,BOX(.12,.16,.02),'leather:#5a3a26',[s*.07,.42,.13],[-.35,s*.35,s*.2]);
    mk(B.torso,BOX(.08,.3,.01),'cloth:#2a2228',[0,.3,.155]);
    for(let i=0;i<40;i++){ const a=(rnd()-.5)*2.6, y=-.05+rnd()*.43, r=.2*.8+.02; mk(B.torso,SPH(.008,6,4),'metal:#3a8ad0',[Math.sin(a)*.205,y,Math.cos(a)*r*1.0],[0,0,0],[1,1,.4]); }
    { const pts=[]; for(let i=0;i<=16;i++){ const a=(i/16-.5)*PI*1.2; pts.push(new V3(Math.sin(a)*.085,.47-Math.cos(a)*.07-(Math.abs(i-8)<3?.06:0),.06+Math.cos(a)*.06)); }
      mk(B.torso,MERCH.K.TUBE(new THREE.CatmullRomCurve3(pts),24,.007,5),'knit:#2a5ab0'); mk(B.torso,MERCH.K.TUBE(new THREE.CatmullRomCurve3([new V3(-.03,.36,.15),new V3(-.035,.2,.16)]),6,.006,5),'knit:#2a5ab0'); }
    mk(B.hips,MERCH.K.lathe([[.17,.06],[.18,-.03],[.16,-.08],[0,-.09]],5,18,.82),'cloth:#2a2a34');
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['upperArm'+n],CYL(.06,.055,.3,10),JACK,[0,-.13,0]); mk(B['upperArm'+n],SPH(.062,10,8),JACK);
      mk(B['forearm'+n],CYL(.054,.05,.26,10),JACK,[0,-.12,0]); mk(B['forearm'+n],TOR(.05,.012,4,10),'leather:#5a3a26',[0,-.24,0],[PI/2,0,0]);
      const Hd=B['hand'+n]; mk(Hd,paint(SPH(.04,10,8),skinC),SKIN,[0,-.045,.005],[0,0,0],[1,1.2,.6]);
      for(let i=0;i<4;i++){ const F=grp(Hd,[(i-1.5)*.018*s,-.08,.008],[.7,0,0]); mk(F,paint(CAP(.011,.04,1,5),skinC),SKIN,[0,-.025,0]); }
      const Th=grp(Hd,[-s*.034,-.04,.02],[.6,0,s*.6]); mk(Th,paint(CAP(.011,.035,1,5),skinC),SKIN,[0,-.022,0]);
      mk(B['thigh'+n],CYL(.08,.068,.44,10),'cloth:#2a2a34',[0,-.21,0]); mk(B['shin'+n],CYL(.066,.058,.44,10),'cloth:#2a2a34',[0,-.21,0]);
      mk(B['shoe'+n],CAP(.05,.12,2,10),'leather:#2a1c16',[0,.04,.05],[PI/2,0,0],[1,1,.75]); }
    /* the beaded mushroom in his right hand, cap up: a tan stem, a cream cap dotted with coloured beads, beaded bands at the rim */
    const M=grp(B.handR,[0,-.075,.03],[PI,0,0]); M.userData.rigid=1; mk(M,CYL(.012,.016,.16,8),'wood:#c89a6a',[0,.08,0]);
    mk(M,MERCH.K.lathe([[.0,.24],[.025,.235],[.05,.21],[.068,.18],[.072,.165],[.0,.16]],6,16),'ivory:#efe2c8');
    for(const [y,r,c] of [[.168,.07,'#c03a2a'],[.176,.066,'#2a6ab0'],[.19,.058,'#e0a040']])mk(M,TOR(r,.004,3,16),'ivory:'+c,[0,y,0],[PI/2,0,0]);
    for(let i=0;i<22;i++){ const a=rnd()*PI*2, h=.2+rnd()*.035, r=.065*(1-(h-.165)/.075)*1.02; mk(M,SPH(.005,5,4),'ivory:'+['#c03a2a','#2a6ab0','#e0a040','#3a8a5a'][i%4],[Math.sin(a)*r,h,Math.cos(a)*r]); }
    return sk; };
  BEADWORKER.model=model;
  const body=MERCH.add({key:'beadworker',label:'THE BEADWORKER',height:1.85,model,size:10,q:.3,at:100,
    idle:t=>MERCH.pose({nod:-2,yaw:Math.sin(t*.3)*6,L:{ua:[8,10],fa:[20,6]},R:{ua:[22,14],fa:[158,-30]}})});
  const N=BEADWORKER.N=body&&body.npc;
  if(N&&HOMES.band){ const b=HOMES.band(), st=N.st, x=(b.x0+b.x1)/2+20*TILE, z=b.rows[1]; Object.assign(st.home,{x,z,r:Math.max(b.x1-b.x0,b.z1-b.z0)/2}); st.x=x; st.z=z; st.to=st.next=null; }
  window.BEADDBG=()=>N?{x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),hd:+N.st.hd.toFixed(2),vis:N.g.visible,tris:body.tris()}:null; }
