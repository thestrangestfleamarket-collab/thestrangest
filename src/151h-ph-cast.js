// THE PLAYHOUSE'S COMPANY (back from the archive for the Wooden O, owner, 10 Nov 2026): the thirteen players of A Midsummer Night's Dream, each a body on the rig's bones (MERCH's kit) in costume: the court of Athens in robes, gowns and armour, the mechanicals in their working clothes; walked, turned, sat and gestured by the play (151i).
import {THREE} from './003-shx.js';
import {BODIES} from './111a-bodies.js';
import {MERCH} from './111e-merch.js';
import {PHX} from './151b-ph-kit.js';
const PHC={};
PHC.CAST={
  theseus:{n:'THESEUS',h:1.88,skin:'#d8b090',hair:['#2a1c14','short'],beard:'#2a1c14',robe:['#4a2a78','#d8b050'],cuirass:'#c8a040',cloak:'#9a1e28',crown:'laurel',hold:'sceptre'},
  hippolyta:{n:'HIPPOLYTA',h:1.78,skin:'#c89a78',hair:['#7a3a1a','braid'],gown:['#2e6a4a','#d8b050'],belt:'#5a3a1a',crown:'circlet',bow:1},
  egeus:{n:'EGEUS',h:1.72,skin:'#d8b8a0',hair:['#e8e4dc','bald'],beard:'#e8e4dc',long:1,robe:['#6a6a68','#3a3a40'],mantle:'#3a3a44',hold:'staff'},
  hermia:{n:'HERMIA',h:1.58,skin:'#c89878',hair:['#1a1210','curls'],gown:['#c0566e','#f0d0d8'],wreath:'#f0e0f0'},
  lysander:{n:'LYSANDER',h:1.8,skin:'#e0b898',hair:['#7a5a3a','short'],tunic:['#2e5aa0','#d8c070'],hose:'#4a5a6a',cape:'#1e3a70',boots:'#3a2a1a'},
  demetrius:{n:'DEMETRIUS',h:1.82,skin:'#d8a888',hair:['#14100e','short'],tunic:['#a02a2a','#2a1a1a'],hose:'#1a1a1e',boots:'#1a1410',sword:1},
  helena:{n:'HELENA',h:1.78,skin:'#f0d0b8',hair:['#e0c070','long'],gown:['#e8d880','#ffffff'],ribbon:'#6a9ad0'},
  quince:{n:'QUINCE',h:1.7,skin:'#d0a888',hair:['#9a9a96','cap'],beard:'#9a9a96',tunic:['#6a4a2a','#4a3220'],hose:'#4a3a2a',apron:'#8a6a44',specs:1,hold:'scroll',cap:'#3a2a1e'},
  bottom:{n:'BOTTOM',h:1.76,skin:'#e8b090',hair:['#8a4a1a','short'],tunic:['#d07a2a','#7a3a10'],hose:'#3a7a3a',belly:1,beret:'#6a1a5a'},
  flute:{n:'FLUTE',h:1.68,skin:'#f0c8a8',hair:['#d8a050','short'],tunic:['#4a8a8a','#2a5a5a'],hose:'#6a6a5a',bellows:1},
  snout:{n:'SNOUT',h:1.72,skin:'#c89878',hair:['#4a3a2a','hood'],tunic:['#6a6a3a','#4a4a2a'],hose:'#4a4232',pots:1,hood:'#5a5a3a'},
  snug:{n:'SNUG',h:1.84,skin:'#d0a080',hair:['#d0a080','bald'],tunic:['#7a5a3a','#5a4028'],hose:'#5a4a3a',apron:'#a08060',broad:1},
  starveling:{n:'STARVELING',h:1.66,skin:'#e0c0a8',hair:['#5a4a4a','short'],tunic:['#6a5a8a','#4a3a6a'],hose:'#3a3a4a',thin:1,tape:1}};
PHC.make=K=>{ '@playhouse';
  const MK=MERCH.K, {mk,grp,BOX,SPH,CYL,CONE,TOR,LATHE,drape}=MK, PI=Math.PI, A={};
  const LA=(pts,s=24,fz=1)=>LATHE(pts,s,fz), TUBE=(rt,rb,h,s=20)=>new THREE.CylinderGeometry(rt,rb,h,s,6,true);
  const body=(k,C)=>{ const thin=C.thin?.85:1, broad=C.broad?1.15:1, fem=!!C.gown;
    const sk=MERCH.skel({hipY:C.h*.5,neck:C.h*.28,shX:(fem?.19:.22)*broad*thin,shY:C.h*.235,upper:C.h*.16,fore:C.h*.145,thigh:C.h*.235,shin:C.h*.235}), {B}=sk, S='skin:'+C.skin, H='plain:'+C.hair[0];
    // the head: skull and jaw, ears, the brow and nose, eyes (whites, irises), the mouth; then the hair as it is worn
    const hd=grp(B.head,[0,.12,.01]); mk(hd,LA([[0,-.12],[.06,-.115],[.085,-.08],[.095,-.02],[.1,.04],[.095,.09],[.07,.13],[0,.15]],24,1.08),S);
    for(const s of [1,-1]){ mk(hd,SPH(.022,8,6),S,[.098*s,0,-.005],[0,0,0],[.5,1,.8]); mk(hd,SPH(.016,10,8),'plain:#f4f0e8',[.036*s,.03,.088],[0,0,0],[1,.8,.5]); mk(hd,SPH(.008,8,6),'plain:#2a1e16',[.036*s,.03,.098],[0,0,0],[1,1,.5]);
      mk(hd,BOX(.04,.008,.012),H,[.036*s,.058,.09],[0,0,-.12*s]); }
    mk(hd,CONE(.016,.045,8),S,[0,.0,.105],[PI/2.4,0,0]); mk(hd,BOX(.04,.008,.01),'plain:#8a3a3a',[0,-.05,.092]);
    const hs=C.hair[1];
    if(hs==='short'||hs==='curls'||hs==='cap')mk(hd,SPH(.104,20,12,0,PI*2,0,PI*.55),H,[0,.012,-.008]);
    if(hs==='curls'){ for(let i=0;i<18;i++){ const a=i/18*PI*2; mk(hd,SPH(.035,8,6),H,[Math.cos(a)*.1,.02+Math.abs(Math.sin(a*2))*.04,Math.sin(a)*.085-.02]); } }
    if(hs==='long'||hs==='braid'){ mk(hd,SPH(.106,20,12,0,PI*2,0,PI*.6),H,[0,.012,-.008]); mk(hd,drape(LA([[.1,-.25],[.11,-.1],[.1,.0],[.08,.06]],18,.7),.01),H,[0,-.04,-.05]);
      if(hs==='braid')for(let i=0;i<7;i++)mk(B.torso,SPH(.032,8,6),H,[0,C.h*.24-i*.06,-.12-i*.004]); }
    if(hs==='bald'){ for(const s of [1,-1])mk(hd,SPH(.05,10,8),H,[.08*s,-.01,-.04],[0,0,0],[.6,1,1]); }
    if(C.beard)mk(hd,drape(LA([[0,-.2*(C.long?1.4:.7)],[.05,-.17*(C.long?1.4:.7)],[.085,-.1],[.09,-.04],[.08,0]],16,.75),.006),'fur:'+C.beard,[0,-.02,.02]);
    // headwear
    if(C.crown==='laurel'){ const r=grp(hd,[0,.09,-.005]); mk(r,TOR(.1,.008,6,24),'metal:#d8b040',[0,0,0],[PI/2,0,0]); for(let i=0;i<20;i++){ const a=i/20*PI*2; mk(r,SPH(.022,6,4),'metal:#d8b040',[Math.cos(a)*.1,.008,Math.sin(a)*.1],[0,-a,.6],[.4,.25,1]); } }
    if(C.crown==='circlet'){ mk(hd,TOR(.102,.007,6,24),'metal:#d8c060',[0,.07,-.005],[PI/2.1,0,0]); mk(hd,SPH(.014,8,6),'glass:#40d090',[0,.08,.1]); }
    if(C.wreath){ for(let i=0;i<14;i++){ const a=i/14*PI*2; mk(hd,SPH(.022,6,5),'cloth:'+(i%2?C.wreath:'#a8d0a0'),[Math.cos(a)*.1,.075,Math.sin(a)*.095]); } }
    if(C.ribbon)mk(hd,TOR(.104,.012,6,24),'cloth:'+C.ribbon,[0,.06,-.01],[PI/2.2,0,0]);
    if(C.cap)mk(hd,drape(LA([[.11,0],[.12,.04],[.1,.08],[0,.1]],18),.006),'cloth:'+C.cap,[0,.06,-.01]);
    if(C.beret){ mk(hd,LA([[.13,0],[.15,.02],[.13,.05],[0,.06]],20,.9),'cloth:'+C.beret,[.02,.1,-.01],[0,0,-.25]); mk(hd,CONE(.012,.22,5),'plain:#f0e8d0',[-.08,.2,-.03],[0,0,.7]); }
    if(C.hood)mk(hd,drape(SPH(.13,16,10,0,PI*2,0,PI*.62),.008),'cloth:'+C.hood,[0,.0,-.02]);
    if(C.specs)for(const s of [1,-1])mk(hd,TOR(.018,.003,4,12),'metal:#8a7a5a',[.036*s,.03,.104]);
    // the neck; the body's garment: a robe or gown to the floor, or a tunic over hose
    mk(B.torso,TUBE(.05,.055,.12),S,[0,C.h*.27,0]);
    const g0=C.robe||C.gown||C.tunic, base='cloth:'+g0[0], trim='cloth:'+g0[1], bel=C.belly?1.18:1;
    mk(B.torso,drape(LA([[.15*broad*bel,-.05],[.17*broad*bel,.05],[.165*broad,.15],[.17*broad*thin,.25],[.15*thin,.3],[.09,.33]].map(([r,y])=>[r,y*C.h/1.75]),28,.75),.008),base);
    mk(B.torso,TOR(.07,.018,6,18),trim,[0,C.h*.19,0],[PI/2,0,0],[1.4,1.1,1]);
    if(C.robe||C.gown){ const L=C.h*.52, flare=C.gown?.36:.28; mk(B.hips,drape(LA([[flare,-L],[flare*.86,-L*.7],[.24,-L*.4],[.19,-L*.12],[.16,.02]],30,.85),.016,1.4),base);
      mk(B.hips,TOR(flare*.97,.02,6,30),trim,[0,-L+.02,0],[PI/2,0,0],[1,.85,1]); mk(B.hips,TOR(.17,.02,6,24),trim,[0,.0,0],[PI/2,0,0],[1,.85,1]); }
    else{ mk(B.hips,drape(LA([[.2,-.26],[.19,-.12],[.17,.02]],24,.85),.01),base); mk(B.hips,TOR(.19,.016,6,24),trim,[0,-.25,0],[PI/2,0,0],[1,.85,1]); mk(B.hips,TOR(.17,.022,6,24),'leather:'+(C.belt||'#3a2a1a'),[0,0,0],[PI/2,0,0],[1,.85,1]); }
    if(C.apron)mk(B.hips,BOX(.3,.5,.01),'leather:'+C.apron,[0,-.2,.16]);
    if(C.cuirass){ mk(B.torso,LA([[.16,.08],[.18,.16],[.18,.26],[.15,.32],[.08,.34]].map(([r,y])=>[r,y*C.h/1.75]),24,.78),'metal:'+C.cuirass); for(let i=0;i<7;i++)mk(B.hips,BOX(.08,.16,.012),'leather:#6a3a1a',[Math.sin(i/6*PI-PI/2)*.17,-.06,Math.cos(i/6*PI-PI/2)*.13],[0,i/6*PI-PI/2,0]); }
    if(C.cloak||C.cape||C.mantle){ const c=C.cloak||C.cape||C.mantle, L=C.cape?C.h*.45:C.h*.7; mk(B.torso,drape(new THREE.LatheGeometry([[.34,-L],[.27,-L*.5],[.21,0]].map(p=>new THREE.Vector2(p[0],p[1])),16,PI/2,PI),.02,1.2),'cloth:'+c,[0,C.h*.31,-.02],[0,0,0],[1,1,.7]); }
    if(C.belt&&C.gown)mk(B.hips,TOR(.17,.02,6,24),'leather:'+C.belt,[0,.03,0],[PI/2,0,0],[1,.85,1]);
    if(C.tape)mk(B.torso,TOR(.09,.01,4,18,PI),'cloth:#e8d890',[0,C.h*.26,.05],[PI/2.5,0,PI]);
    if(C.pots){ for(const [x,c] of [[.16,'#7a7a80'],[-.14,'#9a6a3a']])mk(B.hips,LA([[0,0],[.06,0],[.07,.07],[.05,.1],[0,.1]],12),'metal:'+c,[x,-.12,.12]); }
    if(C.bellows)mk(B.hips,BOX(.12,.16,.04),'leather:#7a5a3a',[.17,-.08,.06]);
    if(C.sword){ mk(B.hips,CYL(.018,.014,.75,8),'leather:#2a1a10',[-.2,-.35,.02],[0,0,.18]); mk(B.hips,BOX(.16,.02,.02),'metal:#c8b070',[-.17,.03,.02]); }
    if(C.bow)mk(B.torso,TOR(.45,.012,4,24,PI*.9),'wood:#7a5a2a',[0,C.h*.15,-.16],[0,PI/2,PI*.55]);
    // arms: sleeves in the garment, hands with fingers
    for(const s of [1,-1]){ const n=s>0?'L':'R', up=C.h*.16, fo=C.h*.145, sl=C.gown?'cloth:'+g0[1]:base;
      mk(B['upperArm'+n],drape(TUBE(.06*thin*broad,.055*thin*broad,up),.006),sl,[0,-up/2,0]); mk(B['upperArm'+n],SPH(.062*broad,12,8),sl);
      mk(B['forearm'+n],drape(TUBE(.05,C.robe||C.gown?.07:.045,fo),.006),sl,[0,-fo/2,0]); mk(B['forearm'+n],TOR(.05,.012,6,14),trim,[0,-fo+.02,0],[PI/2,0,0]);
      const h=grp(B['hand'+n],[0,0,0]); mk(h,new THREE.CapsuleGeometry(.032,.04,4,8),S,[0,-.045,0],[0,0,0],[1.1,1,.55]); for(let i=0;i<4;i++)mk(h,new THREE.CapsuleGeometry(.008,.04,3,6),S,[-.022+i*.015,-.1,0]); mk(h,new THREE.CapsuleGeometry(.009,.03,3,6),S,[.035*s,-.06,.015],[0,0,.5*s]); }
    // legs: hose and boots under a tunic; slippers under a gown
    for(const s of [1,-1]){ const n=s>0?'L':'R', th=C.h*.235, sh=C.h*.235, leg=C.hose?'cloth:'+C.hose:base;
      mk(B['thigh'+n],TUBE(.075*broad,.06,th),leg,[0,-th/2,0]); mk(B['shin'+n],TUBE(.058,.045,sh),C.boots?'leather:'+C.boots:leg,[0,-sh/2,0]);
      mk(B['shoe'+n],new THREE.CapsuleGeometry(.045,.12,4,10),'leather:'+(C.boots||'#4a3220'),[0,-.05,.04],[PI/2,0,0],[1,1,.8]); }
    return sk; };
  for(const [k,C] of Object.entries(PHC.CAST)){ const S=body(k,C), BB=BODIES.BONES, P=BODIES.PARENT, off={}; for(const n of BB){ if(!P[n])continue; const p=S.B[n].position; off[n]=[P[n],p.x,p.y,p.z]; }
    const bd={key:'ph_'+k,label:C.n,height:C.h,hipY:S.q.hipY,off,binv:null,geo:()=>MERCH.bake(S),smooth:true}; BODIES.fit(bd); const FIG=BODIES.mesh(bd), g=new THREE.Group(), wrap=new THREE.Group(); wrap.scale.setScalar(1/bd.S); wrap.add(FIG.me); g.add(wrap); g.visible=false; K.G.add(g);
    // held things: a sceptre, a staff, a scroll, drawn in the hand every frame
    let held=null; if(C.hold){ held=new THREE.Group(); K.G.add(held); const m=C.hold==='sceptre'?[new THREE.CylinderGeometry(.015,.015,.8,8),K.M.gold,.0]:C.hold==='staff'?[new THREE.CylinderGeometry(.02,.025,1.6,8),K.M.mahog,-.45]:[new THREE.CylinderGeometry(.03,.03,.24,10),K.M.paper,0];
      const me=new THREE.Mesh(m[0],m[1]); me.position.y=m[2]; if(C.hold==='scroll')me.rotation.z=PI/2; held.add(me); if(C.hold==='sceptre'){ const o=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),K.M.gold); o.position.y=.42; held.add(o); } held.visible=false; }
    A[k]={k,C,g,FIG,body:bd,SR:RIG.create(),held,x:0,z:0,hd:0,on:false}; }
  K.cast=A;
  // a pose for the moment: walking or still, sitting, speaking (the hands work), listening, bowing, roaring, kneeling, pointing
  const D=RIG.D, V=new THREE.Vector3();
  K.posePlayer=(a,dt,st,t)=>{ const SR=a.SR; SR.target=st.walk?1:0; RIG.step(SR,dt); const P=RIG.walkPose(SR,null);
    const arm=(n,ua,fa,u=1)=>{ P[n].ua=[P[n].ua[0]+(ua[0]*D-P[n].ua[0])*u,P[n].ua[1]+(ua[1]*D-P[n].ua[1])*u]; P[n].fa=[P[n].fa[0]+(fa[0]*D-P[n].fa[0])*u,P[n].fa[1]+(fa[1]*D-P[n].fa[1])*u]; };
    P.bend+=Math.sin(t*1.6+a.k.length)*.012; P.look=st.look||0; P.nod=0;
    if(st.talk){ const s=Math.sin(t*2.3+a.k.length*1.3), q=Math.sin(t*1.1+a.k.length); arm('R',[38+22*s,-14+10*q],[70+30*Math.sin(t*3.1)],st.talk); if(st.big)arm('L',[60+30*q,30],[50+20*s,0],st.talk); P.nod=(.06*Math.sin(t*3.7))*st.talk; }
    if(st.act==='point')arm('R',[92,-10],[8,0]); if(st.act==='plead'){ arm('R',[70,-20],[60,0]); arm('L',[70,20],[60,0]); P.nod=-.1; }
    if(st.act==='roar'){ arm('R',[150,30],[60+20*Math.sin(t*8),0]); arm('L',[150,-30],[60,0]); P.nod=-.25; P.bend-=.12; }
    if(st.act==='heart'){ arm('R',[55,-40],[110,-50]); P.nod=.12; }
    if(st.act==='arms'){ arm('R',[120,40],[30,0]); arm('L',[120,-40],[30,0]); P.nod=-.15; }
    if(st.act==='bow'){ const u=Math.max(0,Math.sin(Math.min(1,st.at/1.6)*PI)); P.bend+=.75*u; P.nod+=.3*u; arm('R',[40,-20],[80,-30],u); }
    if(st.act==='kneel'){ P.root={x:P.root.x,y:P.root.y*.72,z:P.root.z}; P.L.th=[90*D,6*D]; P.L.sh=[-90*D,0]; P.nod=.2; }
    if(st.sit){ for(const n of ['L','R']){ P[n].th=[86*D,10*D]; P[n].sh=[0,4*D]; } P.root={x:P.root.x,y:P.root.y*.56,z:P.root.z}; P.bend+=.06; }
    if(a.held){ arm('L',[30,10],[60,0]); }
    const B=RIG.settle(RIG.build(P,null),0,false,true); BODIES.pose(B,a.FIG.PM,a.body);
    if(a.held){ a.g.updateMatrixWorld(true); MERCH.at({PM:a.FIG.PM,g:a.FIG.me},'handL',[0,-.1,0],V); a.held.position.copy(K.G.worldToLocal(V)); a.held.rotation.set(.2,a.hd,0); a.held.visible=a.g.visible; } };
};
PHX.parts.push({make:K=>PHC.make(K)});
export {PHC};
