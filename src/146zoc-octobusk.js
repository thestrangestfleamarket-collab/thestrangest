// THE OCTOPUS BUSKER: OCTOBUSK, a big purple octopus in a cowboy hat and bandana playing the guitar on the subway platform (a MERCH body on the player's rig; GUITAR 100: any piece in the book, never a stumble).
import {SHARED, THREE} from './003-shx.js';
import {INV, LEVELS, LINES, pos, SFX, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {MODS, SOL, SYS, TILE} from './006-map-pre.js';
import {MERCH} from './111e-merch.js';
import {GUITAR} from './146zob-guitar.js';
const OCTOBUSK={};
{ const {SPH,CYL,TOR,CONE,grp,mk,paint,C,mix,fbm,lathe}=MERCH.K, PI=Math.PI, V3=THREE.Vector3, M=TILE/.84;
  const SKIN='skin:vc', SUCK='skin:#e6c6ee', HAT='leather:#8a5a2e', HATD='leather:#5e3a1a', BAND='leather:#2a1810', RED='cloth:#b8262a';
  const skinC=(x,y,z)=>mix(C('#a35cc2'),C('#6a2c8a'),fbm(x*22+3,y*22,z*22)*1.25-.2);
  // a tentacle along a run of points in its parent's frame: tapering from r0 to r1, suckers along its underside (dn: which way is under)
  const tent=(P,pts,r0,r1,dn=[0,0,1],suck=true)=>{ const n=pts.length-1, A=new V3(), B=new V3(), D=new V3(), Y=new V3(0,1,0), q=new THREE.Quaternion(), e=new THREE.Euler(), U=new V3(...dn).normalize();
    for(let i=0;i<n;i++){ A.set(...pts[i]); B.set(...pts[i+1]); D.subVectors(B,A); const l=D.length(), ra=r0+(r1-r0)*i/n, rb=r0+(r1-r0)*(i+1)/n; q.setFromUnitVectors(Y,D.normalize()); e.setFromQuaternion(q);
      mk(P,paint(CYL(rb,ra,l*1.04,10),skinC),SKIN,[(A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2],[e.x,e.y,e.z]); mk(P,paint(SPH(rb,10,7),skinC),SKIN,[B.x,B.y,B.z]);
      if(suck&&i%1===0){ const s=U.clone().sub(D.clone().multiplyScalar(U.dot(D))).normalize(); for(const t of [.3,.8]){ const r=ra+(rb-ra)*t; mk(P,SPH(r*.38,8,5),SUCK,[A.x+(B.x-A.x)*t+s.x*r*.86,A.y+(B.y-A.y)*t+s.y*r*.86,A.z+(B.z-A.z)*t+s.z*r*.86],[0,0,0],[1,1,.45]); } } } };
  const model=()=>{ const sk=MERCH.skel({hipY:.62,waist:.06,neck:.32,shX:.19,shY:.22,upper:.3,fore:.28,hipX:.13,thigh:.33,shin:.29}), {B}=sk;
    /* the mantle: a big soft bulb up and back from the eyes, the eyes with their bar pupils, a crooked grin, the siphon */
    const H=grp(B.head,[0,.04,0]);
    mk(H,paint(SPH(.3,30,22),skinC),SKIN,[0,.28,-.14],[-.35,0,0],[1.08,1.3,1.12]);
    mk(H,paint(SPH(.24,24,16),skinC),SKIN,[0,.02,.02],[0,0,0],[1.12,.92,1]);
    for(const s of [1,-1]){ mk(H,paint(SPH(.085,16,12),skinC),SKIN,[s*.12,.07,.14],[0,0,0],[1,1.05,.9]);
      mk(H,SPH(.068,16,12),'ivory:#f2e6a8',[s*.122,.07,.172],[0,0,0],[1,1,.7]); mk(H,SPH(.03,10,8),'ivory:#0a0808',[s*.124,.066,.218],[0,0,0],[1.7,.55,.4]);
      const lid=grp(H,[s*.122,.075,.17],[.25,0,-s*.18]); mk(lid,paint(SPH(.074,14,8,0,PI*2,0,PI*.5),skinC),SKIN,[0,0,0],[.15,0,0],[1.08,.85,1.02]); }
    mk(H,TOR(.06,.008,4,14,PI*.9),'plain:#3a1640',[.02,-.1,.21],[0,0,PI*1.05+.1],[1.3,.7,1]);
    mk(H,paint(CYL(.035,.045,.1,10),skinC),SKIN,[-.2,-.06,.06],[0,0,1.2]);
    /* the cowboy hat, big: sat down over the mantle (tipped with it, the crown wide enough to clear it), a brim from the crown's foot curled up at the sides, a pinched crown, its band */
    const HT=grp(grp(H,[0,.28,-.14],[-.35,0,0]),[0,-.02,0],[.08,0,.06]);
    { const br=lathe([[.38,0],[.9,0],[1.2,.036],[1.38,.15]],9,40,.9); const p=br.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i), z=p.getZ(i); p.setY(i,p.getY(i)+Math.max(0,Math.abs(x)-.54)*.32-Math.max(0,Math.abs(z)-.6)*.06); }
      mk(HT,br,HAT); mk(HT,lathe([[.57,0],[.6,.3],[.54,.6],[.36,.75],[0,.63]],10,32,.9),HAT,[0,.005,0]); mk(HT,CYL(.615,.615,.12,32,true),BAND,[0,.09,0],[0,0,0],[1,1,.9]);
      mk(HT,SPH(.18,12,6),HATD,[0,.72,.15],[0,0,0],[1.4,.35,1]); }
    /* the big white mustache, a handlebar curling up at the tips; black sunglasses over the eyes */
    const WH='fur:#f4f1ea';
    for(const s of [1,-1]){ const P=[[.0,-.04,.268,.04],[.06,-.05,.264,.042],[.12,-.07,.248,.038],[.17,-.08,.222,.032],[.215,-.065,.19,.026],[.24,-.03,.165,.02],[.245,.0,.155,.015]];
      for(const [x,y,z,r] of P)mk(H,SPH(r,12,8),WH,[s*x,y,z],[0,0,0],[1.25,.75,.7]); }
    { const GL='plastic:#0b0b0e';
      for(const s of [1,-1]){ mk(H,CYL(.088,.088,.012,20),GL,[s*.122,.075,.262],[PI/2,0,0],[1.08,1,.9]); mk(H,CYL(.007,.007,.27,5),GL,[s*.25,.085,.125],[PI/2,0,s*.26]); }
      mk(H,CYL(.008,.008,.06,5),GL,[0,.095,.262],[0,0,PI/2]); }
    /* the bandana knotted round where the arms start */
    mk(B.torso,TOR(.2,.04,6,22),RED,[0,.18,.01],[PI/2,0,0],[1.02,1,.75]); mk(B.torso,CONE(.12,.16,8),RED,[0,.1,.17],[PI-.25,0,0],[1.2,1,.35]); mk(B.torso,SPH(.03,8,6),RED,[0,.2,.2]);
    mk(B.torso,paint(SPH(.22,22,16),skinC),SKIN,[0,.1,0],[0,0,0],[1.05,1,.95]);
    mk(B.hips,paint(SPH(.24,22,16),skinC),SKIN,[0,.02,0],[0,0,0],[1.1,.8,1]);
    /* the two front arms (the rig's arms): one frets, one strums */
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['upperArm'+n],paint(SPH(.085,12,9),skinC),SKIN); tent(B['upperArm'+n],[[0,0,0],[0,-.15,.01],[0,-.3,0]],.08,.068,[0,0,1]);
      tent(B['forearm'+n],[[0,0,0],[0,-.14,.01],[0,-.28,0]],.068,.052,[0,0,1]);
      tent(B['hand'+n],[[0,0,0],[0,-.07,.02],[0,-.12,.06],[0,-.14,.11],[0,-.12,.15]],.05,.016,[0,1,0]);
      /* the legs: two arms it stands on, their tips curled out over the floor */
      tent(B['thigh'+n],[[0,.03,0],[s*.02,-.16,.01],[0,-.33,0]],.088,.074,[0,0,1]);
      tent(B['shin'+n],[[0,0,0],[0,-.15,.01],[0,-.29,0]],.074,.06,[0,0,1]);
      tent(B['shoe'+n],[[0,0,0],[s*.02,-.03,.08],[s*.05,-.035,.2],[s*.08,-.01,.3],[s*.07,.04,.36]],.06,.016,[0,-1,0]); }
    /* the other four, from the hips down to the floor and curling out round it */
    const legs=grp(B.hips); legs.userData.rigid=1; const fy=-.62+.05;
    for(const [a,k] of [[PI*.72,1.05],[-PI*.72,1],[PI*.42,.95],[-PI*.42,1.1]]){ const cx=Math.sin(a), cz=Math.cos(a), px=-cz*.4, pz=cx*.4;
      tent(legs,[[cx*.12,-.02,cz*.12],[cx*.2,-.22,cz*.2],[cx*.3,fy+.1,cz*.3],[cx*.45*k,fy+.02,cz*.45*k],[cx*.62*k+px*.25,fy+.02,cz*.62*k+pz*.25],[cx*.7*k+px*.45,fy+.08,cz*.7*k+pz*.45]],.085,.016,[0,-1,0]); }
    return sk; };
  // standing on two arms, the guitar across it: the left arm out along the neck, the right across the body strumming
  const L={ua:[52,-28],fa:[58,14]}, R=t=>({ua:[34,22],fa:[96+(PLAY&&PLAY.playing()?Math.sin(t*PI*2*2.4)*9:0),-18]});
  let PLAY=null;
  const body=MERCH.add({key:'octobusk',label:'THE OCTOPUS IN THE COWBOY HAT',height:2.3,model,size:10.5,q:.4,at:100,hd:0,
    idle:(t,N)=>MERCH.pose({nod:-6,bend:4,look:N&&!N.sheetOn?Math.sin(t*.4)*8:0,L:{...L,ua:[L.ua[0]+Math.sin(t*.7)*3,L.ua[1]]},R:R(t)}),
    root:(()=>{ const g=new THREE.Group(); g.name='octobusk'; scene.add(LEVELS.own(g,'station')); return g; })(),ground:(x,z)=>MODS.station.ground(x,z)});
  const N=OCTOBUSK.N=body&&body.npc;
  // his spot: the platform's far corner beside the route map, facing back down the platform
  if(N&&SHARED.METRO&&new URLSearchParams(location.search).get('sheet')!=='octobusk'){ const MT=SHARED.METRO, p=MT.at(8.3,MT.SL.L-1.4), f=MT.at(11.5,MT.SL.L-10), hd=Math.atan2(f.x-p.x,f.z-p.z);
    N.lv='down'; Object.assign(N.st,{x:p.x,z:p.z,to:null,next:null,hold:true,pin:true,hd}); Object.assign(N.st.home,{x:p.x,z:p.z,r:0}); N.free=()=>true;
    SOL.down.push([p.x-.42*M,p.z-.42*M,p.x+.42*M,p.z+.42*M]);
    /* the open guitar case on the floor in front of him for tips, a few gold coins in it; double-click it to tip him */
    { const C=new THREE.Group(), hw=[[0,.12],[.04,.18],[.12,.2],[.22,.19],[.3,.15],[.36,.14],[.42,.155],[.49,.16],[.55,.13],[.6,.075],[1.05,.065]], L=1.05;
      const shape=k=>{ const S=new THREE.Shape(), q=hw.map(([x,w])=>[Math.min(L-k,Math.max(k,x))-L/2,Math.max(.02,w-k)]); S.moveTo(q[0][0],q[0][1]); for(const [x,w] of q.slice(1))S.lineTo(x,w); for(const [x,w] of q.slice().reverse())S.lineTo(x,-w); return S; };
      const shell=new THREE.MeshLambertMaterial({color:0x1c1612}), plush=new THREE.MeshLambertMaterial({color:0x7a1426}), gold=new THREE.MeshStandardMaterial({color:0xe2b33c,metalness:.85,roughness:.3,emissive:0x6a4808});
      const flat=(sh,y,m)=>{ const g=new THREE.ShapeGeometry(sh); g.rotateX(-PI/2); const me=new THREE.Mesh(g,m); me.position.y=y; me.receiveShadow=true; C.add(me); return me; };
      const wall=(h)=>{ const o=shape(0); o.holes.push(shape(.025)); const g=new THREE.ExtrudeGeometry(o,{depth:h,bevelEnabled:false}); g.rotateX(-PI/2); const me=new THREE.Mesh(g,shell); me.castShadow=me.receiveShadow=true; return me; };
      C.add(wall(.11)); flat(shape(0),.003,shell); flat(shape(.025),.02,plush);
      const lid=new THREE.Group(); lid.position.set(0,.11,-.2); const lw=wall(.05); lw.position.z=.2; lid.add(lw); for(const [sh,y,m,f] of [[shape(0),.05,shell,0],[shape(.025),.004,plush,1]]){ const me=flat(sh,y,m); C.remove(me); me.position.z=.2; if(f){ me.rotation.x=PI; me.position.y=y; } lid.add(me); } lid.rotation.x=-1.75; C.add(lid);
      const coin=new THREE.CylinderGeometry(.024,.024,.005,16);
      for(const [x,z,y,rx,rz] of [[-.36,.03,0,0,0],[-.29,-.07,0,.2,0],[-.25,.08,.002,0,.15],[-.42,-.06,0,0,0],[-.42,-.06,.005,0,0],[-.42,-.06,.01,.05,0],[-.19,-.02,.002,-.25,.1],[-.33,.12,0,0,0]]){ const c=new THREE.Mesh(coin,gold); c.position.set(x,.024+y,z); c.rotation.set(rx,Math.random(),rz); C.add(c); }
      const cp={x:p.x+Math.sin(hd)*1.1*M,z:p.z+Math.cos(hd)*1.1*M}; C.scale.setScalar(M*.75); C.position.set(cp.x,MODS.station.ground(cp.x,cp.z),cp.z); C.rotation.y=hd; body.root.add(C); OCTOBUSK.case=C;
      SOL.down.push([cp.x-.34*M,cp.z-.34*M,cp.x+.34*M,cp.z+.34*M]);
      UI.thing({name:'THE OCTOPUS\'S GUITAR CASE (TIP HIM $1)',obj:C,reach:1.8*M,near:3*M,tall:C.position.y+.4*M,act:()=>{ if(!INV.afford(1))return SAY('YOU HAVE NO MONEY TO TIP HIM.','#c8a090');
        INV.pay(1); if(INV.save)INV.save(); SFX.play('ding',{vol:.4,pitch:1.5}); SAY('YOU DROP A DOLLAR IN THE CASE. THE OCTOPUS TIPS HIS HAT.','#f2c14e'); LINES.say(N,'Gracias.'); }}); }
    /* the guitar: the real one, held across him (posed off his chest each frame), its pieces from the book played through its own voice */
    const G=GUITAR.GHOLD.model(), gg=new THREE.Group(); gg.add(G); G.scale.setScalar(M*1.15); G.rotation.set(-.1,0,-1.22); G.position.set(-.36*M,-.12*M,0); body.root.add(gg);
    const at=new V3(); let wait=4, inn=false;
    // the hardest piece in the book (the highest GUITAR it asks), played over and over
    const hardest=()=>{ let b=0; GUITAR.BOOK.forEach((t,i)=>{ const B=GUITAR.BOOK[b]; if((t.lvl||0)>(B.lvl||0)||(t.lvl||0)===(B.lvl||0)&&(t.secs||0)>(B.secs||0))b=i; }); return b; };
    SYS.add('places',dt=>{ dt=dt||0; const here=SHARED.LVL==='down'&&N.g.visible&&Math.hypot(pos.x-N.st.x,pos.z-N.st.z)<30*M; gg.visible=N.g.visible;
      if(N.g.visible&&N.PM){ MERCH.at(N,'torso',[0,.06,.3],at); gg.position.copy(at); gg.rotation.set(0,N.st.hd,0); gg.scale.setScalar(N.size*.82); }
      if(!here){ if(inn&&PLAY){ PLAY.stop(); PLAY.drop(); } inn=false; return; }
      if(!inn){ inn=true; GUITAR.loadSongs(); if(!PLAY)PLAY=GUITAR.npc('octobusk'); }
      if(!PLAY.playing()&&(wait-=dt)<=0){ PLAY.play(hardest()); wait=2.5; }
      PLAY.tick(N.st.x,N.st.z,.5); },'146zoc-octobusk');
    OCTOBUSK.now=()=>PLAY&&PLAY.playing()?GUITAR.BOOK[PLAY.P.song].name:null; }
  window.OCTOBUSK=OCTOBUSK;
  window.OCTODBG=()=>N?{x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),hd:+N.st.hd.toFixed(2),vis:N.g.visible,tris:body.tris(),song:OCTOBUSK.now?OCTOBUSK.now():null}:null; }
