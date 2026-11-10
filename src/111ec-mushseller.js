// THE MUSHROOM SELLER: MUSH, his body on the player's rig (a smooth MERCH body: carved skull, long hair, the hat grown over with mushrooms, the mottled robe, the woven shawl and strap, the tray heaped with mushrooms), and his booth at the park wall.
import {SHARED, THREE} from './003-shx.js';
import {PARK, pos} from './003b-systems.js';
import {MODS, TILE} from './006-map-pre.js';
import {HOMES} from './076-npc-map.js';
import {STALL} from './081-stalls.js';
import {BODIES} from './111a-bodies.js';
import {MERCH} from './111e-merch.js';
const MUSH={}; let swing=null;
{ const {SPH,CYL,TOR,grp,mk,paint,hash3,C,mix,fbm,lathe,bend,ribbon}=MERCH.K, PI=Math.PI, T=TILE, V3=THREE.Vector3;
  let seed=11; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
  // a mushroom: its stem, the cap's dome and rolled rim, the gills under it; o {r cap, h stem, s stem radius, cap, stem, gill colours, k cap height, seg}
  const shroom=(par,at,rot,o)=>{ const g=grp(par,at,rot), r=o.r, h=o.h, s=o.s||r*.32, n=MERCH.K.sq(o.seg||12,6), k=o.k||.58;
    if(h>.002)mk(g,CYL(s*.92,s*1.12,h,Math.max(6,n>>1)),o.stem||'plain:#efe8da',[0,h/2,0]);
    mk(g,SPH(r,n,Math.max(3,n>>1),0,PI*2,0,PI*.5),o.cap,[0,h,0],[0,0,0],[1,k,1]);
    if(n>8){ mk(g,TOR(r*.93,r*.09,4,n),o.cap,[0,h,0],[PI/2,0,0]); mk(g,CYL(r*.9,s*1.05,r*.2,n,true),o.gill||'plain:#a88c76',[0,h-r*.1,0]); }
    return g; };

  /* ---------- the colours: the picture's rust robe mottled olive and teal, ash-blond hair, carved bone, the hat's earth ---------- */
  const RUST=C('#b4612b'), BURNT=C('#86401c'), DEEP=C('#4c2512'), OLIVE=C('#6e6a48'), TEAL=C('#56625a'), PALE=C('#d48c4e');
  const robeC=(ox=0)=>(x,y,z)=>{ x+=ox; const n1=fbm(x*7,y*5+ox,z*7), n2=fbm(x*19+3,y*19,z*19); let c=mix(RUST,BURNT,n1*1.6-.45);
    const ol=fbm(x*4+11,y*3,z*4), te=fbm(x*5+31,y*4+7,z*5); if(ol>.58)c=mix(c,OLIVE,(ol-.58)*7); if(te>.62)c=mix(c,TEAL,(te-.62)*7);
    if(n2>.66)c=mix(c,PALE,(n2-.66)*4); c=mix(c,DEEP,(.42-n2)*2.2); return c; };
  const BONE=C('#e6dcc6'), BONED=C('#b9a685'), boneC=(x,y,z)=>{ const n=fbm(x*30,y*30,z*30); return mix(BONE,BONED,(n-.45)*2.4); };
  const HAIR=[C('#d0b98e'),C('#ab9268'),C('#e2d3ae'),C('#bcae8e'),C('#927b56')];
  const hairC=(a,y)=>{ const s=fbm(a*46,y*1.6,3.3), q=fbm(a*140,y*.8,7.7); let c=mix(HAIR[0],HAIR[s>.5?2:1],Math.abs(s-.5)*3); c=mix(c,q>.6?HAIR[3]:HAIR[4],Math.abs(q-.5)*1.4); return c; };
  const EARTH=C('#7a5b3e'), LOAM=C('#5a4130'), SAND=C('#b39877'), SPORE=C('#e8dfcc');
  const CAPS=['plain:#ece4d4','plain:#e4d8c2','plain:#f0e9dc','plain:#d9c8a8','plain:#ddd0b8'], TANS=['plain:#c8aa82','plain:#b8956a','plain:#c4a47c'];

  const HAIRM=[], model=()=>{ const sk=MERCH.skel({hipY:.95,waist:.06,neck:.5,shX:.19,shY:.42,upper:.29,fore:.27,hipX:.1,thigh:.45,shin:.46}), {B}=sk;
    /* the skull: carved bone, deep black sockets, the heart-shaped nose, the cheekbones, two rows of teeth and the jaw */
    const H=grp(B.head,[0,.2,0]), bone=g=>paint(g,boneC), BN='wood:vc', BLK='plain:#070504', TOOTH='ivory:#ece2cb';
    H.scale.setScalar(1.28);
    mk(H,bone(SPH(.108,24,16)),BN,[0,.02,-.012],[0,0,0],[.94,1,1]);
    mk(H,bone(SPH(.1,24,18)),BN,[0,-.035,.032],[0,0,0],[.86,1.12,.76]);
    for(const s of [1,-1]){ mk(H,SPH(.033,14,10),BLK,[s*.043,-.002,.084],[0,0,s*.25],[1.1,1,.62]);
      mk(H,bone(SPH(.04,12,8)),BN,[s*.045,.036,.092],[0,0,-s*.12],[1.3,.42,.62]);
      mk(H,bone(SPH(.03,12,8)),BN,[s*.074,-.045,.068],[0,s*.4,0],[1.15,.75,.85]);
      mk(H,bone(SPH(.02,10,6)),BN,[s*.092,-.01,.04],[0,0,0],[.8,1.4,1]);
      mk(H,SPH(.0125,10,6),BLK,[s*.0095,-.047,.1],[0,0,s*.38],[1,2.1,.6]);
      mk(H,bone(SPH(.028,10,6)),BN,[s*.066,-.13,.02],[0,0,s*.25],[.7,1.9,.8]); }
    mk(H,bone(SPH(.014,10,6)),BN,[0,.008,.11],[0,0,0],[.9,1.6,.7]);
    mk(H,bone(SPH(.06,18,12)),BN,[0,-.084,.068],[0,0,0],[1.1,.72,.78]);
    mk(H,SPH(.052,14,6),BLK,[0,-.116,.074],[0,0,0],[1.05,.2,.72]);
    for(let i=0;i<10;i++){ const a=(i-4.5)/4.5*.95, r=.054, w=i===4||i===5?.0125:.0105;
      mk(H,MERCH.K.CAP(w*.5,.012,2,6),TOOTH,[Math.sin(a)*r,-.104,.07+Math.cos(a)*r*.92],[0,a,0],[1,1,.8]); }
    mk(H,bone(SPH(.052,18,10)),BN,[0,-.145,.052],[0,0,0],[1.08,.55,.8]);
    for(let i=0;i<8;i++){ const a=(i-3.5)/3.5*.85, r=.047; mk(H,MERCH.K.CAP(.0048,.009,2,6),TOOTH,[Math.sin(a)*r,-.127,.068+Math.cos(a)*r*.92],[0,a,0],[1,1,.8]); }
    mk(H,bone(SPH(.016,10,6)),BN,[0,-.163,.07],[0,0,0],[1.5,.7,.9]);
    mk(B.head,CYL(.036,.044,.16,14),BN.replace('vc','#d8cbb0'),[0,.05,-.01]);
    /* the hair: long, ash-blond, from under the brim down past the shoulders, open round the face; two locks a side over the chest */
    { const g=lathe([[.113,.075],[.117,.03],[.121,-.03],[.126,-.09],[.142,-.16],[.172,-.23],[.2,-.29],[.212,-.36],[.216,-.44],[.212,-.52]],30,72,.86,.95,PI*2-1.9);
      const p=g.attributes.position, cl=new Float32Array(p.count*3);
      for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i), z=p.getZ(i), a=Math.atan2(x,z), r=Math.hypot(x,z/.86)||1, d=.004*Math.sin(a*70+fbm(a*9,y*4,1)*6)+.012*(fbm(a*7,y*2.5,2)-.5), e=y<-.4?(fbm(a*26,1,5)*.08+hash3(Math.round(a*90),3,1)*.012)*((-.4-y)/.12):0;
        p.setXYZ(i,x*(1+d/r),y-e,z*(1+d/r)); const c=hairC(a,y); cl.set([c.r,c.g,c.b],i*3); }
      g.setAttribute('color',new THREE.BufferAttribute(cl,3)); HAIRM.push(mk(H,g,'fur:vc')); }
    for(const s of [1,-1])for(const [k,dx,dz,len] of [[0,0,0,.58],[1,.028,.012,.54],[2,-.02,.02,.5]]){
      const pts=[[s*(.104+dx*.3),.05,.05+dz],[s*(.12+dx),-.1,.09+dz],[s*(.148+dx),-.22,.14+dz],[s*(.152+dx),-.33,.165+dz],[s*(.145+dx),-.04-len,.17+dz]];
      HAIRM.push(mk(H,ribbon(pts,.066,22,6,(u,v)=>hairC(u*.4+s*k,v*-.5),{lift:.004,taper:.45,wave:(u,v)=>.004*Math.sin(u*40+k),ragged:(u,v)=>v>.9?hash3(Math.round(u*30),k,s)*.05*(v-.9)*10:0}),'fur:vc')); }
    /* the hat: a wide mound of earth and mycelium, its top crowded with button mushrooms, a few tall ones, the big one on top */
    const HT=grp(H,[0,.0,0]), top=r=>.185-.12*Math.pow(r/.25,1.6);
    { const g=lathe([[.001,.104],[.06,.097],[.1,.07],[.14,.046],[.2,.04],[.24,.046],[.257,.062],[.252,.08],...[.24,.2,.16,.12,.08,.04,.001].map(r=>[r,top(r)])],36,56);
      const p=g.attributes.position, cl=new Float32Array(p.count*3);
      for(let i=0;i<p.count;i++){ let x=p.getX(i), y=p.getY(i), z=p.getZ(i); const r=Math.hypot(x,z), n=fbm(x*26,z*26,y*26), m=fbm(x*9+4,z*9,y*9), up=y>.07&&r<.252;
        if(up)y+=.016*(n-.45)+.01*(m-.5); else { const k=1+.05*(m-.5); x*=k; z*=k; y+=.006*(n-.5); } p.setXYZ(i,x,y,z);
        let c=up?mix(EARTH,SAND,(m-.35)*2):mix(LOAM,EARTH,(n-.3)*1.5); if(up&&hash3(Math.round(x*300),Math.round(z*300),7)>.82)c=mix(c,SPORE,.75); cl.set([c.r,c.g,c.b],i*3); }
      g.setAttribute('color',new THREE.BufferAttribute(cl,3)); mk(HT,g,'knit:vc'); }
    const onHat=(r,a,lift=0)=>{ const y=top(r)+lift, sl=Math.atan(.12*1.6*Math.pow(r/.25,.6)/.25)*1.15; return {at:[Math.sin(a)*r,y,Math.cos(a)*r],rot:[Math.cos(a)*sl,0,-Math.sin(a)*sl]}; };
    const NB=MERCH.K.N(90,24), gB=Math.min(1.7,Math.sqrt(90/NB)); for(let i=0;i<NB;i++){ const r=.03+.215*Math.sqrt(rnd()), a=rnd()*PI*2, q=onHat(r,a,-.006), cr=(.009+rnd()*.016)*gB;
      shroom(HT,q.at,q.rot.map(v=>v+(rnd()-.5)*.5),{r:cr,h:cr*(.2+rnd()*.7),cap:CAPS[i%5],seg:7,k:.8}); }
    const NR=MERCH.K.N(18,9), gR=Math.sqrt(18/NR); for(let i=0;i<NR;i++){ const a=i/NR*PI*2+rnd()*.2, cr=(.013+rnd()*.012)*gR, tl=1.05+rnd()*.35;
      shroom(HT,[Math.sin(a)*.243,.068+rnd()*.012,Math.cos(a)*.243],[Math.cos(a)*tl,0,-Math.sin(a)*tl],{r:cr,h:cr*(.4+rnd()*.6),cap:CAPS[(i+2)%5],seg:7,k:.75}); }
    for(let i=0;i<11;i++){ const r=.07+.15*rnd(), a=i/11*PI*2+rnd()*.4, q=onHat(r,a,-.01), cr=.026+rnd()*.022;
      shroom(HT,q.at,q.rot.map(v=>v*1.3+(rnd()-.5)*.3),{r:cr,h:.03+rnd()*.05,s:cr*.28,cap:i%3?TANS[i%3]:CAPS[i%5],gill:'plain:#9a7e62',seg:12}); }
    shroom(HT,[0,top(0)-.01,0],[.08,0,-.06],{r:.092,h:.11,s:.019,cap:'plain:#c6a67e',gill:'plain:#7c6450',seg:22,k:.5});
    /* the robe: a heavy mottled rust robe from the shoulders to the ground, a thick collar, wide sleeves */
    mk(B.torso,paint(lathe([[.165,-.09],[.185,.04],[.198,.17],[.212,.29],[.222,.37],[.205,.43],[.15,.475],[.085,.5],[.062,.52]],28,40,.78),robeC(0)),'cloth:vc');
    mk(B.torso,paint(TOR(.072,.032,10,24),robeC(3)),'cloth:vc',[0,.5,.012],[PI/2+.15,0,0],[1,1.2,1]);
    mk(B.torso,paint(TOR(.098,.03,10,26),robeC(5)),'cloth:vc',[0,.468,.008],[PI/2+.2,0,0],[1,1.15,1]);
    { const g=lathe([[.175,.09],[.19,0],[.205,-.15],[.228,-.35],[.252,-.55],[.276,-.75],[.292,-.9],[.296,-.945]],36,44,.84);
      bend(g,v=>{ const a=Math.atan2(v.x,v.z), t=Math.max(0,-v.y)/.95, d=t*(.018*Math.sin(a*6+v.y*3)+.012*Math.sin(a*11-v.y*7+1.3)), r=Math.hypot(v.x,v.z)||1; v.x+=v.x/r*d; v.z+=v.z/r*d; v.y-=t>.97?hash3(Math.round(a*30),1,2)*.012:0; });
      mk(B.hips,paint(g,robeC(7)),'cloth:vc'); }
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['upperArm'+n],paint(CYL(.07,.075,.29,16),robeC(9+s)),'cloth:vc',[0,-.16,0]); mk(B['upperArm'+n],paint(SPH(.074,14,10),robeC(14+s)),'cloth:vc',[0,-.03,0],[0,0,0],[1,.9,1]);
      const sl=CYL(.074,.118,.29,20,6,true); bend(sl,v=>{ const a=Math.atan2(v.x,v.z), d=(.5-v.y/.29)*.012*Math.sin(a*5+1); v.x*=1+d*8; v.z*=1+d*8; });
      mk(B['forearm'+n],paint(sl,robeC(12+s)),'cloth:vc',[0,-.13,0]); mk(B['forearm'+n],CYL(.068,.108,.27,16,1,true),'cloth:#3a1d0e',[0,-.135,0]);
      /* a bony hand gripping under the tray: palm, four knuckled fingers curled forward, the thumb */
      const Hd=B['hand'+n]; mk(Hd,bone(SPH(.032,16,12)),BN,[0,-.04,.006],[0,0,0],[1.05,1.25,.55]);
      for(let i=0;i<4;i++){ const fx=(i-1.5)*.017, l1=.034-Math.abs(i-1.5)*.004, F=grp(Hd,[fx,-.072,.004],[.5,0,0]); mk(F,MERCH.K.CAP(.0058,l1,2,6),BN.replace('vc','#ddd1b6'),[0,-l1/2,0]);
        mk(F,SPH(.0075,6,4),BN.replace('vc','#d4c6a8'),[0,-l1,0]); const G=grp(F,[0,-l1,0],[1.1,0,0]); mk(G,MERCH.K.CAP(.005,.022,2,6),BN.replace('vc','#ddd1b6'),[0,-.014,0]); }
      const Th=grp(Hd,[-s*.026,-.035,.012],[.5,0,s*.6]); mk(Th,MERCH.K.CAP(.006,.032,2,6),BN.replace('vc','#ddd1b6'),[0,-.02,0]);
      mk(B['thigh'+n],CYL(.08,.068,.45,16),'cloth:#4a2a18',[0,-.22,0]); mk(B['shin'+n],CYL(.064,.054,.46,14),'cloth:#4a2a18',[0,-.22,0]);
      mk(B['shoe'+n],MERCH.K.CAP(.048,.12,6,14),'leather:#3b2a1c',[0,.04,.05],[PI/2,0,0],[1,1,.75]); }
    /* the woven shawl over his right shoulder, hanging down his side to a fringe; the grey leather strap across his chest and its silver clasp */
    { const pts=[[-.13,.475,-.02],[-.19,.43,.06],[-.215,.3,.135],[-.222,.14,.162],[-.232,-.02,.168],[-.24,-.14,.166]], o={fz:.78,lift:.022,wave:(u,v)=>.006*Math.sin(v*40+u*3)};
      const weave=(u,v)=>{ const b=Math.floor((u+.5)*9), w=b%4===0?'#2f3b3a':b%4===1?'#8a6a44':b%4===2?'#c2a77c':'#5a4630', k=.85+.3*fbm(u*40,v*160,1); return C(w).multiplyScalar(k); };
      mk(B.torso,ribbon(pts,.15,40,10,weave,o),'knit:vc');
      const cv=new THREE.CatmullRomCurve3(pts.map(p=>new V3(...p))), e=cv.getPoint(1), t=cv.getTangent(1), out=new V3(e.x,0,e.z/.78).normalize(), sd=new V3().crossVectors(t,out).normalize();
      for(let i=0;i<16;i++){ const u=(i/15-.5)*.14, l=.045+hash3(i,4,1)*.035, q=e.clone().addScaledVector(sd,u).addScaledVector(out,.022);
        mk(B.torso,CYL(.0045,.003,l,5),'knit:'+['#2f3b3a','#8a6a44','#c2a77c','#5a4630'][(i>>1)%4],[q.x,q.y-l/2+.004,q.z]); } }
    mk(B.torso,ribbon([[-.12,.47,-.02],[-.09,.4,.13],[-.02,.32,.18],[.07,.21,.185],[.16,.1,.15],[.215,-.02,.04]],.034,40,4,(u,v)=>mix(C('#8c877c'),C('#5f5b52'),fbm(v*30,u*8,2)*1.2-.2),{fz:.78,lift:.026}),'leather:vc');
    { const K=grp(B.torso,[-.05,.355,.198],[-.2,0,-.6]); mk(K,TOR(.016,.005,8,18),'metal:#bdb8ad'); mk(K,CYL(.004,.004,.035,8),'metal:#bdb8ad',[0,-.03,.004]); mk(K,SPH(.008,10,8),'metal:#a8a296',[0,-.05,.006]); }
    /* the tray held out at the waist: a round wooden platter heaped with white and brown mushrooms, some on their sides, some upturned */
    const TR=grp(B.torso,[0,.105,.39],[.12,0,0]); mk(TR,CYL(.275,.255,.024,44),'wood:#6a4529',[0,0,0]); mk(TR,TOR(.268,.013,8,48),'wood:#5a3a22',[0,.012,0],[PI/2,0,0]);
    seed=37; const NT=MERCH.K.N(52,18), gT=Math.min(1.5,Math.pow(52/NT,.4)); for(let i=0;i<NT;i++){ const rr=.235*Math.sqrt(rnd()), a=rnd()*PI*2, hgt=.012+.075*Math.max(0,1-rr/.24)*(.6+.4*rnd()), cr=(.021+rnd()*.015)*gT, h=(.018+rnd()*.018)*gT, k=rnd(), at=[Math.sin(a)*rr,hgt,Math.cos(a)*rr];
      const cap=rnd()<.16?TANS[i%3]:rnd()<.06?'plain:#8c6a4a':CAPS[i%5], o={r:cr,h,s:cr*.36,cap,gill:'plain:#a48a74',seg:10,k:.62};
      if(k<.4)shroom(TR,at,[(rnd()-.5)*.6,rnd()*PI*2,(rnd()-.5)*.6],o);
      else if(k<.8){ at[1]+=cr*.6; const b=rnd()*PI*2; shroom(TR,at,[Math.cos(b)*1.45,b,Math.sin(b)*1.45],o); }
      else { at[1]+=h+cr*.4; shroom(TR,at,[PI+(rnd()-.5)*.7,rnd()*PI*2,(rnd()-.5)*.5],o); } }
    // the hair leaves the baked body: its own mesh on the head bone, so it can swing (MUSH.hairGeo, in the head bone's frame)
    sk.root.updateMatrixWorld(true); const inv=B.head.matrixWorld.clone().invert(), P=[], Nn=[], Cc=[], I=[];
    for(const m of HAIRM){ const g=m.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld)); g.computeVertexNormals(); const o=P.length/3;
      for(const [A,L] of [['position',P],['normal',Nn],['color',Cc]])for(const v of g.attributes[A].array)L.push(v); for(const i of g.index.array)I.push(i+o); m.parent.remove(m); }
    const hg=MUSH.hairGeo=new THREE.BufferGeometry(); hg.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); hg.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3)); hg.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3)); hg.setIndex(I);
    return sk; };
  MUSH.model=model;

  /* ---------- on the street: held at his booth, turning his head to you; the tray held still out in front ---------- */
  const HOLD={ua:[17,4],fa:[78,-15]}, look=N=>{ const s=N.st, d=Math.hypot(pos.x-s.x,pos.z-s.z); let a=0; if(d<7*T&&d>.2*T){ a=Math.atan2(pos.x-s.x,pos.z-s.z)-s.hd; a=Math.atan2(Math.sin(a),Math.cos(a)); a=Math.max(-.9,Math.min(.9,a)); }
    const now=performance.now()/1000, dt=Math.min(.2,now-(N._lt||now)); N._lt=now; N._lk=(N._lk||0)+(a-(N._lk||0))*Math.min(1,dt*2.5); if(Math.abs(N._lk-a)<.004)N._lk=a; return N._lk*180/PI; };
  const body=MERCH.add({key:'mushroom',q:.3,label:'THE MUSHROOM SELLER',height:1.75,model,size:11.5,hd:0,idle:(t,N)=>MERCH.pose({nod:-5,bend:3,look:N?look(N):0,L:HOLD,R:HOLD}),after:(B,N)=>{ if(swing)swing(N); }});
  const N=MUSH.N=body&&body.npc;
  /* ---------- his hair swings: a pendulum from under the hat, pushed by how his head moves (a turn, a nod, a step) and by the wind's gusts, settling still ---------- */
  if(N&&MUSH.hairGeo){ const HI=BODIES.BONES.indexOf('head'), HM={value:N.PM.value[HI]}, SW={value:new THREE.Vector2()};
    const bendV=sh=>{ sh.uniforms.uHead=HM; sh.uniforms.uSw=SW; sh.vertexShader='uniform mat4 uHead; uniform vec2 uSw;\n'+sh.vertexShader.replace('#include <begin_vertex>','vec3 hp=position; float hw=pow(clamp((.2-hp.y)/.75,0.,1.),1.6); hp.xz+=uSw*hw; hp.y+=.5*dot(uSw,uSw)*hw/.75; vec3 transformed=(uHead*vec4(hp,1.)).xyz;'); };
    const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:0,side:THREE.DoubleSide});
    mat.onBeforeCompile=sh=>{ bendV(sh); sh.vertexShader=sh.vertexShader.replace('#include <beginnormal_vertex>','vec3 objectNormal=mat3(uHead)*normal;'); sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*.06;'); };
    mat.customProgramCacheKey=()=>'mushhair';
    const dep=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}), dis=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dep.onBeforeCompile=bendV; dis.onBeforeCompile=bendV; dep.customProgramCacheKey=()=>'mushhaird'; dis.customProgramCacheKey=()=>'mushhairx';
    const hm=new THREE.Mesh(MUSH.hairGeo,mat); hm.customDepthMaterial=dep; hm.customDistanceMaterial=dis; hm.castShadow=hm.receiveShadow=true;
    Object.defineProperty(hm,'boundingSphere',{configurable:true,get(){ return N.g.children[0].boundingSphere; },set(){}}); N.g.add(hm); MUSH.hair=hm; MUSH.sw=SW.value;
    const o=new THREE.Vector2(), v=new THREE.Vector2(), M=new THREE.Matrix4(), tip=new V3(), p0=new V3(), v0=new V3(), vp=new V3(), a=new V3(), ex=new V3(), ez=new V3(); let t0=0, primed=false;
    swing=N=>{ const now=performance.now()/1000, dt=now-t0; t0=now; M.multiplyMatrices(N.g.matrixWorld,N.PM.value[HI]); tip.set(0,-.38,-.16).applyMatrix4(M);
      if(!primed||dt>1||dt<=0){ p0.copy(tip); v0.set(0,0,0); primed=true; return; }
      vp.subVectors(tip,p0).divideScalar(dt); a.subVectors(vp,v0).divideScalar(dt); p0.copy(tip); v0.copy(vp);
      ex.setFromMatrixColumn(M,0); const sc=ex.length()||1; ex.divideScalar(sc); ez.setFromMatrixColumn(M,2).normalize();
      let ax=-a.dot(ex)/sc*3, az=-a.dot(ez)/sc*3; const am=Math.hypot(ax,az); if(am>30){ ax*=30/am; az*=30/am; }
      const w=Math.max(0,(PARK.windK?PARK.windK.value:0)-.6); if(w>0){ const g=w*(.5+.5*Math.sin(now*.8))*(.5+.5*Math.sin(now*.31+1))*2.2; ax+=g*ex.x; az+=g*ez.x; }
      const n=Math.min(24,Math.ceil(dt*120)), h=dt/n; for(let i=0;i<n;i++){ v.x+=(-20*o.x-2.2*v.x+ax)*h; v.y+=(-20*o.y-2.2*v.y+az)*h; o.addScaledVector(v,h); }
      if(Math.abs(o.x)>.11){ o.x=Math.sign(o.x)*.11; v.x=0; } if(o.y<-.05||o.y>.07){ o.y=Math.max(-.05,Math.min(.07,o.y)); v.y=0; }
      if(o.lengthSq()<2.5e-7&&v.lengthSq()<4e-6&&!w){ o.set(0,0); v.set(0,0); } SW.value.copy(o); }; }
  if(N){ const st=N.st; st.hold=true; st.to=st.next=null; N.H=2.3*T;
    const wait=()=>{ if(!MODS.park)return setTimeout(wait,500); const P=PARK, X=x=>SHARED.BOD.XS(x+(P.ox||0)), Z=y=>SHARED.BOD.ZS(y+(P.oy||0)), A=STALL.at('mush');
      MUSH.booth=STALL.build({X,Z,x0:A.x0,x1:A.x1,y:P.y0,veg:false,seed:7,gate:A.gate,name:A.name});
      if(!HOMES.keeper(N))MERCH.stand(N,MUSH.booth); };
    wait(); }
  window.SELLERDBG=()=>({swing:!!swing,sw:MUSH.sw?[+MUSH.sw.x.toFixed(4),+MUSH.sw.y.toFixed(4)]:null,booth:!!MUSH.booth,key:N&&N.key,x:N&&+N.st.x.toFixed(2),z:N&&+N.st.z.toFixed(2),y:N&&+N.g.position.y.toFixed(2),vis:N&&N.g.visible,tris:body&&body.tris()}); }
export {MUSH};
