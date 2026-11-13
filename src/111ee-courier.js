// THE COURIER: COURIER, a wrinkled little creature in a hooded fleece onesie with bat-wing ears and headphones, riding a bike round the street with a taped parcel on its front rack (a smooth MERCH body on the player's rig, pedalling with the rig's bike pose).
import {SHARED, THREE} from './003-shx.js';
import {CITY} from './003b-systems.js';
import {SYS, TILE} from './006-map-pre.js';
import {HOMES, stfree} from './076-npc-map.js';
import {MERCH} from './111e-merch.js';
const COURIER={};
{ const {SPH,CYL,TOR,BOX,CONE,CAP,grp,mk,paint,C,mix,fbm}=MERCH.K, PI=Math.PI, V3=THREE.Vector3;
  const SKIN='skin:#b9897a', SKIND='#9c6e60', FLEECE='fur:#7d5034', FLEECED='fur:#5e3a24', TRIM='leather:#1c1512', CUFF='leather:#3a2418', BOOT='leather:#4a2a1a', PACK='leather:#9a6a40', CARD='#b58d5e', TAPE='#c9a676';
  // a piece from a to b (a tube, a bone of a frame), r its radius, s its sides
  const tube=(par,a,b,r,c,s=6)=>{ const A=new V3(...a), D=new V3(...b).sub(A), m=mk(par,CYL(r,r,D.length(),s),c,[A.x+D.x/2,A.y+D.y/2,A.z+D.z/2]); m.quaternion.setFromUnitVectors(new V3(0,1,0),D.normalize()); return m; };
  // an arc of a ring on the surface (a wrinkle, a lid): centred on +z, turned about y (or about z, in the face's plane)
  const arc=(par,at,r,t,len,c,flat)=>{ const g=grp(par,at,flat?[0,0,flat]:[0,len/2-PI/2,0]); mk(g,TOR(r,t,3,10,len),c,[0,0,0],flat?[0,0,0]:[PI/2,0,0]); return g; };

  const model=()=>{ const sk=MERCH.skel({hipY:.44,waist:.05,neck:.3,shX:.13,shY:.25,upper:.18,fore:.17,hipX:.075,thigh:.21,shin:.22}), {B}=sk;
    /* the head: a wrinkled, pinkish face; huge glossy black eyes in heavy lids, a little nose, a thin smile */
    const H=grp(B.head,[0,.15,.02]);
    mk(H,paint(SPH(.138,40,30),(x,y,z)=>mix(C('#c09282'),C(SKIND),fbm(x*40,y*40,z*40)*.9-.2+Math.max(0,-y)*.8)),'skin:vc',[0,0,0],[0,0,0],[1,.96,.95]);
    for(const s of [1,-1]){ mk(H,SPH(.046,20,16),'ivory:#070606',[s*.054,-.004,.104],[0,0,0],[1,1,.8]); mk(H,SPH(.009,6,4),'plain:#f4f4f4',[s*.054-.012,.012,.14]);
      arc(H,[s*.054,-.004,.1],.052,.011,PI*.9,SKIN,PI*.05); arc(H,[s*.054,-.006,.098],.054,.013,PI*.9,SKIN,PI*1.05); arc(H,[s*.054,-.008,.094],.064,.01,PI*.7,SKIN,PI*1.15);
      mk(H,SPH(.006,6,4),'plain:#2a1210',[s*.008,-.052,.142]); }
    for(const [y,r,len] of [[.05,.118,1.3],[.068,.112,1.2],[.086,.1,1.05],[.034,.124,.5]])arc(H,[0,y,0],r*1.02,.006,len,SKIN);
    mk(H,SPH(.02,10,8),SKIN,[0,-.042,.13],[0,0,0],[1.1,.85,.9]); mk(H,SPH(.016,8,6),SKIN,[0,.02,.13],[0,0,0],[.9,1.6,.6]);
    mk(H,SPH(.06,16,10),SKIN,[0,-.08,.085],[0,0,0],[1.25,.62,.85]);
    for(const s of [1,-1])mk(H,CAP(.0035,.035,1,5),'plain:#3a1a16',[s*.016,-.083+.002,.137],[0,0,PI/2+s*.18]);
    mk(H,SPH(.03,10,6),SKIN,[0,-.112,.08],[0,0,0],[1.2,.6,.8]);
    /* the hood: fleece round the head, open at the face with a dark trim, a point at the top; the headphones over it; the bat-wing ears */
    mk(H,SPH(.168,22,16,PI/2+.95,PI*2-1.9,0,PI*.82),FLEECE,[0,.006,-.012],[0,0,0],[1,1.02,1]);
    mk(H,TOR(.14,.009,4,24),TRIM,[0,-.004,.096],[0,0,0],[1,1.08,1]);
    mk(H,CONE(.075,.14,10),FLEECE,[0,.19,-.04],[-.45,0,0]);
    for(const s of [1,-1]){ const cup=grp(H,[s*.165,.01,-.01],[0,0,PI/2]); mk(cup,CYL(.05,.048,.035,14),'plastic:#1a1a1c'); mk(cup,CYL(.038,.038,.04,12),'leather:#2c2626',[0,-s*.006,0]);
      const W=new THREE.Shape(); W.moveTo(0,0); W.quadraticCurveTo(.12,.14,.33,.17); W.quadraticCurveTo(.3,.11,.27,.1); W.quadraticCurveTo(.24,.04,.19,.06); W.quadraticCurveTo(.15,0,.11,.02); W.quadraticCurveTo(.07,-.04,.03,-.03); W.lineTo(0,0);
      const wg=grp(H,[s*.17,.04,-.03],[0,s*-.3,s*-.22]); mk(wg,new THREE.ShapeGeometry(W,4),'leather:#c8905e',[0,0,0],[0,0,0],[s,1,1]);
      const rib=new THREE.QuadraticBezierCurve3(new V3(0,0,0),new V3(s*.12,.14,0),new V3(s*.33,.17,0)); mk(wg,new THREE.TubeGeometry(rib,8,.008,5),'leather:#dcb48c'); }
    mk(H,TOR(.172,.011,4,18,PI),'plastic:#1a1a1c',[0,.012,-.012]);
    /* the onesie: a chubby fleece body, the zip down the front, fleece sleeves and legs, leather cuffs, boots */
    mk(B.torso,MERCH.K.lathe([[.125,-.06],[.145,.04],[.152,.14],[.148,.21],[.128,.26],[.08,.29],[.05,.3]],10,22,.86),FLEECE);
    mk(B.torso,BOX(.006,.33,.006),TRIM,[0,.12,.131]);
    mk(B.hips,MERCH.K.lathe([[.14,.06],[.148,-.01],[.13,-.07],[.0,-.085]],6,20,.86),FLEECE);
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['upperArm'+n],CYL(.052,.046,.2,10),FLEECE,[0,-.09,0]); mk(B['upperArm'+n],SPH(.055,10,8),FLEECE,[0,0,0]);
      mk(B['forearm'+n],CYL(.047,.043,.17,10),FLEECE,[0,-.08,0]); mk(B['forearm'+n],TOR(.04,.014,4,12),CUFF,[0,-.16,0],[PI/2,0,0]);
      const Hd=B['hand'+n]; mk(Hd,SPH(.032,10,8),SKIN,[0,-.035,.004],[0,0,0],[1,1.2,.6]);
      for(let i=0;i<4;i++){ const F=grp(Hd,[(i-1.5)*.014*s,-.06,.006],[.35+i*.08,0,0]); mk(F,CAP(.0075,.035,1,5),SKIN,[0,-.02,0]); const G=grp(F,[0,-.04,0],[.6,0,0]); mk(G,CAP(.0065,.022,1,5),SKIN,[0,-.013,0]); }
      const Th=grp(Hd,[-s*.026,-.03,.014],[.4,0,s*.7]); mk(Th,CAP(.008,.03,1,5),SKIN,[0,-.02,0]);
      mk(B['thigh'+n],CYL(.058,.052,.22,10),FLEECE,[0,-.1,0]); mk(B['shin'+n],CYL(.052,.048,.2,10),FLEECE,[0,-.1,0]);
      mk(B['shoe'+n],CAP(.048,.08,2,10),BOOT,[0,.04,.04],[PI/2,0,0],[1.1,1,.85]); mk(B['shoe'+n],CYL(.05,.05,.035,10),BOOT,[0,.085,0]); }
    /* the backpack: a leather pack with a cardboard box strapped on top, a canister at its side, straps over the shoulders */
    mk(B.torso,BOX(.22,.24,.12),PACK,[0,.13,-.19]); mk(B.torso,BOX(.2,.1,.13),'leather:#7e5232',[0,.04,-.25]);
    mk(B.torso,BOX(.17,.09,.11),'plain:'+CARD,[0,.3,-.19],[0,.1,0]); mk(B.torso,BOX(.03,.092,.112),'plain:'+TAPE,[0,.3,-.19],[0,.1,0]);
    mk(B.torso,CYL(.032,.032,.16,10),'metal:#8a8478',[.13,.17,-.18]);
    for(const s of [1,-1])tube(B.torso,[s*.07,.28,.1],[s*.08,.03,.13],.012,'leather:#5a3a22',4);
    return sk; };

  /* ---------- the bike: in the rig's own units (its cranks, saddle and bars where the rig's bike pose puts feet, seat and hands), one mesh; the parcel on its front rack ---------- */
  const bike=()=>{ const G=new THREE.Group(), F='plain:#2f5d6e', BL='plain:#1a1a1a', ME='metal:#9a9a96';
    const W=(z)=>{ const w=grp(G,[0,6.5,z]); mk(w,TOR(6.2,.75,4,18),BL,[0,0,0],[0,PI/2,0]); mk(w,TOR(5.4,.25,3,14),ME,[0,0,0],[0,PI/2,0]); for(let i=0;i<4;i++){ const a=i/4*PI; tube(w,[0,Math.cos(a)*5.4,Math.sin(a)*5.4],[0,-Math.cos(a)*5.4,-Math.sin(a)*5.4],.09,ME,3); } mk(w,CYL(.6,.6,1.6,6),ME,[0,0,0],[0,0,PI/2]); };
    W(-11); W(12.5);
    const bb=[0,5.6,.4], st=[0,15.2,-3], ht=[0,16.2,10.4], hb=[0,11.6,11.4], ra=[0,6.5,-11], fa=[0,6.5,12.5];
    tube(G,bb,st,.55,F); tube(G,bb,hb,.6,F); tube(G,st,ht,.5,F); tube(G,ht,hb,.6,F);
    for(const x of [-.9,.9]){ tube(G,[x,bb[1],bb[2]],[x,ra[1],ra[2]],.3,F,5); tube(G,[x,st[1]-.5,st[2]],[x,ra[1],ra[2]],.3,F,5); tube(G,[x,hb[1],hb[2]],[x,fa[1],fa[2]],.32,F,5); }
    tube(G,st,[0,16.6,-3.6],.35,ME,5); mk(G,BOX(2.6,.9,5),'leather:#2a1c14',[0,17.1,-3.8]);
    tube(G,ht,[0,19.4,9.6],.35,ME,5); tube(G,[-5.6,19.4,9.6],[5.6,19.4,9.6],.32,ME,5); for(const x of [-5.6,5.6])mk(G,CYL(.55,.55,2.6,6),BL,[x*1.08,19.4,9.6],[0,0,PI/2]);
    for(const [s,a] of [[1,0],[-1,PI]]){ tube(G,[s*1.6,5.6,.4],[s*1.6,5.6+3.1*Math.cos(a),.4+3.1*Math.sin(a)],.3,ME,4); mk(G,BOX(2.2,.5,1.2),BL,[s*2.4,5.6+3.1*Math.cos(a),.4+3.1*Math.sin(a)]); }
    mk(G,CYL(1.6,1.6,.4,10),ME,[0,5.6,.4],[0,0,PI/2]);
    /* the front rack and the parcel: brown paper, folded at the corners, a wide tape band round it */
    mk(G,BOX(10,.4,8),ME,[0,15.6,15.4]); tube(G,[-4.5,15.6,18.8],[-.9,6.8,12.5],.22,ME,4); tube(G,[4.5,15.6,18.8],[.9,6.8,12.5],.22,ME,4);
    mk(G,BOX(14,10.5,11),'plain:'+CARD,[0,21.1,16]); mk(G,BOX(14.2,10.6,2.4),'plain:'+TAPE,[0,21.1,16.6]); mk(G,BOX(3.4,10.7,11.2),'plain:'+TAPE,[0,21.1,16]);
    mk(G,BOX(14.1,.25,11.1),'plain:#9c7448',[0,26.3,16]);
    // baked to one mesh: each part's colour per point, flat shaded
    G.updateMatrixWorld(true); const P=[], Cc=[], c=new THREE.Color();
    G.traverse(o=>{ if(!o.isMesh)return; const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone(); g.applyMatrix4(o.matrixWorld); c.set(String(o.userData.c).split(':').pop()); const p=g.attributes.position; for(let i=0;i<p.count;i++){ P.push(p.getX(i),p.getY(i),p.getZ(i)); Cc.push(c.r,c.g,c.b); } });
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); geo.computeVertexNormals();
    const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.75,metalness:.05,flatShading:true})); m.castShadow=m.receiveShadow=true; return m; };
  let body=null; const POSE={k:'bike',c:0,brake:false,z:0};
  const RIDEK={make:bike,
    pose:R=>{ POSE.c=(POSE.c||0)+(R.v/TILE)*.14; POSE.brake=!(R.v>.2*TILE); return POSE; },
    place:(m,R,t,c)=>{ if(!c||!body)return; const u=c.g.scale.y; m.scale.setScalar(u*body.KL); m.position.y-=RIG.RIDEG.deck*u; m.rotation.z=Math.max(-.2,Math.min(.2,-(R.lean||0)*.3)); }};
  body=MERCH.add({key:'courier',label:'THE COURIER',height:1.2,model,size:7.5,q:.3,at:100,ride:RIDEK,rideSpeed:2.4});
  COURIER.N=body&&body.npc; COURIER.model=model;
  // his round: the whole of the street's band (HOMES.band), from its middle
  if(COURIER.N&&HOMES.band){ const b=HOMES.band(), st=COURIER.N.st, x=(b.x0+b.x1)/2, z=b.rows?b.rows[0]:(b.z0+b.z1)/2; Object.assign(st.home,{x,z,r:Math.max(b.x1-b.x0,b.z1-b.z0)/2}); st.x=x; st.z=z; st.to=st.next=null; }
  if(COURIER.N&&new URLSearchParams(location.search).get('sheet')==='courier')Object.assign(COURIER.N.st,{hold:true,pin:true,to:null,next:null,x:SHARED.BOD.XS(100),z:SHARED.BOD.ZS((SHARED.BOD.MAP.y0+SHARED.BOD.MAP.y1)/2)});
  { const inView=()=>{ if(!SHARED.BOUND)return setTimeout(inView,500); const st=COURIER.N&&COURIER.N.st; if(st&&st.pin)st.z=Math.min(st.z,SHARED.BOUND.z1-1.5*TILE); }; if(COURIER.N&&COURIER.N.st.pin)inView(); }   // (inside the camera's bounds)   // still on his sheet
  // a delivery (the phone's): he rides the city's route to where() (you, followed twice if you walk on) and stops by it; done(spot) leaves the parcel. false: he cannot take it
  let job=null; const far=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  const ride=at=>{ const st=COURIER.N.st, r=CITY.route&&CITY.route('up',{x:st.x,z:st.z},at,stfree); if(!r||!r.pts||r.pts.length<2)return false; Object.assign(job,{pts:r.pts,i:1,at,stuck:0}); st.to={x:r.pts[1].x,z:r.pts[1].z}; st.next=null; st.wait=0; return true; };
  const end=()=>{ const N=COURIER.N, j=job; job=null; N.errand=false; N.st.to=null; N.st.wait=4; j.done(j.at); };
  const there=()=>{ const w=job.where(); if(job.n++<2&&far(w,job.at)>3*TILE&&ride(w))return; end(); };
  COURIER.bring=(where,done)=>{ const N=COURIER.N; if(!N||job||N.on===false||N.mode==='hidden'||N.st.pin||N.st.hold||SHARED.LVL!=='up')return false; job={where,done,t:0,n:0}; if(!ride(where())){ job=null; return false; } N.errand=true; return true; };
  SYS.add('life',dt=>{ if(!job||!dt)return; const st=COURIER.N.st, n=job.pts.length, p=job.pts[job.i]; if((job.t+=dt)>150)return end();
    if(job.i>=n-1&&far(st,job.at)<1.3*TILE)return there(); if(st.to)return;
    if(far(st,p)<.5*TILE){ job.stuck=0; if(++job.i<n){ const q=job.pts[job.i]; st.to={x:q.x,z:q.z}; return; } return there(); }
    if((job.stuck+=dt)>3){ st.x=p.x; st.z=p.z; job.stuck=0; } else { st.to={x:p.x,z:p.z}; st.wait=0; } },'111ee-courier');
  window.COURIERDBG=()=>{ const N=COURIER.N; return N?{x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),to:!!N.st.to,v:N.RS&&+N.RS.v.toFixed(2),vis:N.g.visible,tris:body.tris(),job:!!job}:null; }; }
export {COURIER};
