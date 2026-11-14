// THE BIG CAT: BIGCAT, a huge black furry cat-shaped creature (a rounded block with two horn-like ears, big speckled staring eyes, an open mouth with pink teeth, whiskers, two clawed paws) four and a half times a person's height, standing by a telephone pole down Market St, looking about and hiding behind the pole when someone comes near (a MERCH body on the player's rig, its fur shells drawn over it near you).
import {SHARED, THREE} from './003-shx.js';
import {NPCS, ONLINE, pos} from './003b-systems.js';
import {SYS, TILE} from './006-map-pre.js';
import {TRAINS} from './009c-trains.js';
import {WIRES} from './069b-poles.js';
import {BODIES} from './111a-bodies.js';
import {MERCH} from './111e-merch.js';
const BIGCAT={};
{ const {SPH,CYL,TOR,CAP,grp,mk,paint,C,mix,fbm,hash3}=MERCH.K, PI=Math.PI;
  // his coat: near black, mottled with dark brown and grey, flecked with pale hairs
  const BLK=C('#121113'), BRN=C('#2a2019'), GRY=C('#2c2c31'), SPECK=C('#5a5654');
  const skin=(x,y,z)=>{ let c=mix(BLK,BRN,fbm(x*5,y*5,z*5)*1.7-.5); c=mix(c,GRY,fbm(x*9+4,y*9,z*9)*1.4-.7); if(hash3(Math.round(x*140),Math.round(y*140),Math.round(z*140))>.993)c=mix(c,SPECK,.5); return c; };
  const S='fur:vc', sk2=g=>paint(g,skin), FP=[];
  // the eyes' whites: an off-white, browned and flecked like old enamel
  const EYE=C('#e8dcc8'), EYED=C('#b8a080'), FLECK=C('#7a5a3a');
  const eyeC=(x,y,z)=>{ let c=mix(EYE,EYED,fbm(x*30,y*30,z*30)*1.4-.35); if(hash3(Math.round(x*400),Math.round(y*400),Math.round(z*400))>.95)c=mix(c,FLECK,.7); return c; };
  // a rounded block: a sphere pushed out toward a box (p under 1 squarer), its half sizes w, h, d
  const block=(w,h,d,p,n=40)=>{ const g=SPH(1,n,Math.round(n*.75)), P=g.attributes.position; for(let i=0;i<P.count;i++){ const f=v=>Math.sign(v)*Math.pow(Math.abs(v),p); let x=f(P.getX(i)), y=f(P.getY(i)), z=f(P.getZ(i)); const t=(y+1)/2; x*=1+.06*(1-t); z*=1+.04*(1-t); P.setXYZ(i,x*w,y*h,z*d); } g.computeVertexNormals(); return g; };
  let SK=null;
  const model=()=>{ const sk=SK=MERCH.skel({hipY:.38,waist:.05,neck:1,shX:.3,shY:.8,upper:.2,fore:.2,hipX:.32,thigh:.19,shin:.17}), {B}=sk;
    /* the body: one block from just above his paws to the crown, all of it on the hips so it never bends */
    const Bd=grp(B.hips,[0,.74,0]); Bd.userData.rigid=1;
    FP.push(mk(Bd,sk2(block(.76,.8,.56,.42)),S));
    /* the ears: two thick rounded horns on the top corners, leaning out */
    for(const s of [1,-1]){ const E=grp(Bd,[s*.5,.72,0],[.05,0,-s*.75]); FP.push(mk(E,sk2(MERCH.K.lathe([[.001,-.05],[.2,-.04],[.19,.08],[.15,.2],[.1,.3],[.055,.36],[.001,.385]],16,22)),S,[0,0,0],[0,0,0],[1.35,1.6,1.1])); }
    /* the eyes: big staring balls set into the face, small black pupils near the middle; a socket ring of skin round each */
    for(const s of [1,-1]){ mk(Bd,paint(SPH(.215,30,22),eyeC),'ivory:vc',[s*.3,.26,.5]); mk(Bd,SPH(.05,14,10),'ivory:#070607',[s*.27,.27,.712],[0,0,0],[1,1,.45]);
      mk(Bd,sk2(TOR(.21,.04,8,30)),S,[s*.3,.26,.54]);
      /* the lids: a heavy upper lid down to the top of the pupil, a thin lower one */
      mk(Bd,sk2(SPH(.226,30,12,0,PI*2,0,PI*.28)),S,[s*.3,.26,.5],[.5,0,0]); mk(Bd,sk2(SPH(.222,30,8,0,PI*2,0,PI*.2)),S,[s*.3,.26,.5],[PI-.45,0,0]); }
    /* the nose: a ridge down from between the eyes to a round bump */
    mk(Bd,sk2(SPH(.07,14,12)),S,[0,.2,.57],[0,0,0],[.9,2.6,.9]); mk(Bd,sk2(SPH(.08,14,12)),'skin:#1a1617',[0,.02,.6],[0,0,0],[1.25,.9,1]);
    /* the mouth: open in an O, dark inside, a lip of skin round it, four pink teeth at the bottom */
    mk(Bd,SPH(.27,26,16),'plain:#1c0a0c',[0,-.24,.5],[0,0,0],[1.12,.6,.25]);
    mk(Bd,sk2(TOR(.27,.045,10,36)),S,[0,-.24,.555],[0,0,0],[1.12,.6,1]);
    for(let i=0;i<4;i++)mk(Bd,SPH(.05,12,10),'skin:#eaa2ac',[(i-1.5)*.085,-.35+Math.abs(i-1.5)*.012,.56],[0,0,0],[.85,1.15,.7]);
    /* the whiskers: four thin pale bristles a side, fanned out from the cheeks past the fur */
    for(const s of [1,-1])for(let k=0;k<4;k++){ const W=grp(Bd,[s*.42,-.14-k*.04,.56],[0,s*.35,s*(-.35+k*.22)]); mk(W,CYL(.006,.003,.3,4),'plain:#6a665e',[s*.15,0,0],[0,0,PI/2]); }
    /* the legs: short and thick, under the block; the paws big and round, four toes in front */
    for(const s of [1,-1]){ const n=s>0?'L':'R';
      mk(B['thigh'+n],sk2(CYL(.15,.14,.2,14)),S,[0,-.1,0]); mk(B['shin'+n],sk2(CYL(.14,.15,.18,14)),S,[0,-.08,.02]);
      const F=B['shoe'+n]; mk(F,sk2(SPH(.23,22,14)),S,[0,.14,.1],[0,0,0],[1.15,.68,1.35]);
      for(let i=0;i<4;i++){ const a=(i-1.5)*.4; mk(F,sk2(SPH(.09,14,10)),S,[Math.sin(a)*.22,.085,.24+Math.cos(a)*.16],[0,0,0],[.95,.95,1.2]); } }
    return sk; };
  // a group on his hips as posed this frame (the lids and the fur ride on it)
  const MH=new THREE.Matrix4(), MT=new THREE.Matrix4(), onHips=(G,N)=>{ const i=BODIES.BONES.indexOf('hips'), o=N.body.rest.hips; N.g.updateMatrix(); G.matrix.copy(N.g.matrix).multiply(MH.copy(N.PM.value[i])).multiply(MT.makeTranslation(o.x,o.y,o.z)); G.matrixWorldNeedsUpdate=true; };
  // his blink (owner, 11 Nov 2026: "make him blink"): every few seconds both lids sweep down over the eyes and up, only near you
  const LIDM=new THREE.MeshStandardMaterial({color:0x151416,roughness:.95}); let BL=null, bt=0, nb=2, hold=false;
  const blink=N=>{ if(!BL){ BL=new THREE.Group(); BL.matrixAutoUpdate=false; const g=new THREE.SphereGeometry(.232,24,10,0,PI*2,0,PI/2); for(const s of [1,-1]){ const m=new THREE.Mesh(g,LIDM); m.position.set(s*.3,1,.5); BL.add(m); } N.g.parent.add(BL); }
    const t=performance.now()/1000; if(t>nb){ bt=t; nb=t+2.5+Math.random()*4.5; } const k=(t-bt)/.18, a=hold?1:k<1?Math.sin(k*PI):0; BL.visible=N.g.visible&&!!N.PM&&a>0; if(!BL.visible)return;
    for(const m of BL.children)m.rotation.x=-.6+a*2.15;
    onHips(BL,N); };
  // his fur (owner, 14 Nov 2026: "less smooth, fuzzy realistic fur"): FN shells of the body and ears pushed out along the skin, each cut to strands by a noise (thinning toward the tips, drooping, stirring), dark roots, lighter tips, a rim of light; one instanced draw, only near you
  const FN=14, FL=.09, UT={value:0};
  const ss=(a,b,x)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
  // how long the fur grows at a point on his hips (metres of his own frame): none over the eyes, mouth and nose, short on the face
  const furLen=(x,y,z)=>{ let f=.8+.4*hash3(Math.round(x*300),Math.round(y*300),Math.round(z*300));
    for(const s of [1,-1])f*=ss(.25,.36,Math.hypot(x-s*.3,y-1,z-.5));
    if(z>.2){ f*=ss(1,1.3,Math.hypot(x/.36,(y-.5)/.22)); f*=.25+.75*ss(.8,1.3,Math.hypot(x/.13,(y-.85)/.22)); f*=1-.5*ss(.3,.5,z); } return f; };
  let FUR=null;
  const furMake=N=>{ SK.root.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(SK.B.hips.matrixWorld).invert(), P=[], Nn=[], key=new Map(), v=new THREE.Vector3();
    for(const m of FP){ const g=m.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld)), q=g.index?g.toNonIndexed():g;
      const p=q.attributes.position, n=q.attributes.normal; for(let i=0;i<p.count;i++){ P.push(p.getX(i),p.getY(i),p.getZ(i)); v.fromBufferAttribute(n,i); const k=[p.getX(i),p.getY(i),p.getZ(i)].map(c=>Math.round(c*2000)).join(','), a=key.get(k); if(a)a.add(v); else key.set(k,v.clone()); } }
    // one normal for every point at the same place (the seams and poles of the shapes do not open)
    const L=[]; for(let i=0;i<P.length;i+=3){ const k=[P[i],P[i+1],P[i+2]].map(c=>Math.round(c*2000)).join(','), a=key.get(k).clone().normalize(); Nn.push(a.x,a.y,a.z); L.push(furLen(P[i],P[i+1],P[i+2])); }
    const geo=new THREE.InstancedBufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('normal',new THREE.Float32BufferAttribute(Nn,3)); geo.setAttribute('fl',new THREE.Float32BufferAttribute(L,1));
    geo.setAttribute('sh',new THREE.InstancedBufferAttribute(new Float32Array(FN).map((_,i)=>(i+1)/FN),1)); geo.instanceCount=FN; geo.computeBoundingSphere(); geo.boundingSphere.radius+=FL;
    const mat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,metalness:0});
    mat.onBeforeCompile=sh=>{ sh.uniforms.uT=UT;
      sh.vertexShader='attribute float sh; attribute float fl; uniform float uT; varying vec3 vP; varying float vSh; varying float vFl;\n'+sh.vertexShader.replace('#include <begin_vertex>',`vec3 transformed=position; { float e=sh*${FL.toFixed(3)}*fl; transformed+=normal*e; transformed.y-=e*sh*.5; transformed.x+=sin(uT*1.6+position.y*5.+position.z*3.)*e*sh*.22; } vP=position; vSh=sh; vFl=fl;`);
      sh.fragmentShader=`varying vec3 vP; varying float vSh; varying float vFl;
        float fH(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
        float fN(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(mix(fH(i),fH(i+vec3(1,0,0)),f.x),mix(fH(i+vec3(0,1,0)),fH(i+vec3(1,1,0)),f.x),f.y),mix(mix(fH(i+vec3(0,0,1)),fH(i+vec3(1,0,1)),f.x),mix(fH(i+vec3(0,1,1)),fH(i+vec3(1,1,1)),f.x),f.y),f.z); }\n`+sh.fragmentShader
        .replace('#include <color_fragment>',`#include <color_fragment>
          vec3 fq=vP*85.+fN(vP*14.)*1.5, fc=floor(fq); float fh=fH(fc), fl=(.4+.6*fh)*(.55+.6*fN(vP*7.)), ft=vSh/max(fl*step(.04,vFl),.001); if(ft>1.)discard;
          if(length(fract(fq)-.5)>(1.-ft)*.6+.04)discard;
          vec3 fb=mix(vec3(.03,.028,.03),vec3(.085,.06,.042),fN(vP*4.+3.)); fb=mix(fb,vec3(.12,.12,.125),step(.88,fh)*.6); fb*=.75+.5*fH(fc+7.);
          diffuseColor.rgb=fb*(.3+.7*ft)+vec3(.1,.08,.062)*ft*ft;`)
        .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n { float fr=pow(1.-abs(dot(normalize(vNormal),normalize(vViewPosition))),3.); totalEmissiveRadiance+=vec3(.1,.088,.075)*fr*ft; }'); };
    mat.customProgramCacheKey=()=>'bigcatfur';
    const me=new THREE.Mesh(geo,mat); me.receiveShadow=true; me.castShadow=false; me.frustumCulled=false;
    const G=new THREE.Group(); G.matrixAutoUpdate=false; G.add(me); N.g.parent.add(G); return G; };
  const body=MERCH.add({key:'bigcat',label:'THE BIG CAT',height:2.3,model,size:45,q:.75,at:100,idle:()=>MERCH.pose({bend:0,nod:0})});
  const N=BIGCAT.N=body&&body.npc;
  // where he is (owner, 14 Nov 2026: "standing further down market st. looks around, hide behind pole. doesnt move much"): by the westmost telephone pole on Market St's sidewalk, never in the road; he turns to look at passers-by and about on the shared clock, and when someone comes near he shuffles round behind the pole, peeking out at them, then goes back to his spot
  const BD=SHARED.BOD, M0=TILE/.84, hs=n=>{ const v=Math.sin(n*12.9898)*43758.5453; return v-Math.floor(v); };
  const HALF=2.6*M0, NEAR=9*M0, GONE=12*M0, SEE=18*M0, V=.5*M0;
  let P=null, home=null, hide=null, gone=0, ang=null, pk=0, nT=0, who=null;
  const site=()=>{ const L=WIRES.poles||[]; if(!L.length)return null; const p=L.reduce((a,b)=>b.x<a.x?b:a), zc=BD.ZS(BD.CURB);
    // the sidewalk he keeps to (his middle, his half depth in from the kerb and the shop fronts)
    const z1=zc-HALF, z0=Math.min(z1,BD.ZS(BD.CURB)-7.2*M0+HALF); return {x:p.x,z:p.z,z0,z1,home:{x:p.x-1.4*HALF,z:Math.max(z0,Math.min(z1,p.z-HALF*1.2))}}; };
  // the nearest player near him (you or another tenant near you), the one he hides from
  const nearest=()=>{ let b=null, bd=1e9; const L=[pos]; for(const o of (ONLINE.others&&ONLINE.others.values())||[])if(o.why==='near you'&&o.p&&!o.dead)L.push(o.p); for(const q of L){ const d=Math.hypot(q.x-P.x,q.z-P.z); if(d<bd){ bd=d; b=q; } } return b&&{x:b.x,z:b.z,d:bd}; };
  // behind the pole from q, a little to one side so an eye peeks past it, on the sidewalk
  const behind=q=>{ let ux=P.x-q.x, uz=P.z-q.z; const l=Math.hypot(ux,uz)||1; ux/=l; uz/=l; const D=HALF*1.15, sd=HALF*.55*(pk?1:-1); let x=P.x+ux*D-uz*sd, z=P.z+uz*D+ux*sd;
    z=Math.max(P.z0,Math.min(P.z1,z)); if(Math.hypot(x-P.x,z-P.z)<D)x=P.x+Math.sign(x-P.x||ux||1)*Math.sqrt(Math.max(0,D*D-(z-P.z)**2)); return {x,z}; };
  // what he looks at: someone near, a passer-by, or about him on the shared clock
  const lookAt=(t,q,st)=>{ if(q&&q.d<SEE)return Math.atan2(q.x-st.x,q.z-st.z);
    const near=(NPCS||[]).find(n=>n!==N&&n.st&&n.g&&n.g.visible&&Math.hypot(n.st.x-st.x,n.st.z-st.z)<SEE*.8); if(near)return Math.atan2(near.st.x-st.x,near.st.z-st.z);
    const k=Math.floor(t/6.5), a=hs(k); return (a<.25?-1.2:a<.5?1.2:(a-.75)*1.4); };
  if(N){ N.walk.auto=false; const st=N.st;
    SYS.add('city',dt=>{ dt=Math.min(.1,dt||0); if(!P){ P=site(); if(!P)return; home=P.home; } const t=TRAINS.now(); delete N.mode; st.next=null; st.to=null; st.hold=true;
      if(Math.hypot(st.x-home.x,st.z-home.z)>4*HALF)Object.assign(st,{x:home.x,z:home.z});
      if(t>nT){ nT=t+.5; who=nearest(); if(who&&who.d<NEAR){ if(!hide)pk=hs(Math.floor(t/60))<.5?1:0; const h=behind(who); if(!hide||Math.hypot(h.x-hide.x,h.z-hide.z)>.6*HALF)hide=h; gone=0; } else if(hide&&(!who||who.d>GONE)&&(gone+=.5)>4)hide=null; }
      // he shuffles slowly to where he means to be
      const T=hide||home, ex=T.x-st.x, ez=T.z-st.z, d=Math.hypot(ex,ez); if(d>.02){ const k=Math.min(d,V*(hide?1.6:1)*dt)/d; st.x+=ex*k; st.z+=ez*k; }
      // and turns slowly to what he looks at (the road ahead when nothing else)
      const want=hide&&who?Math.atan2(who.x-st.x,who.z-st.z):lookAt(t,who,st); if(ang==null)ang=want; let da=Math.atan2(Math.sin(want-ang),Math.cos(want-ang)); ang+=Math.sign(da)*Math.min(Math.abs(da),(hide?1.4:.55)*dt);
      st.face={x:st.x+Math.sin(ang)*5,z:st.z+Math.cos(ang)*5};
      const near=Math.hypot(pos.x-st.x,pos.z-st.z)<60;
      if(near)blink(N); else if(BL)BL.visible=false;
      if(near&&N.g.visible&&N.PM){ if(!FUR)FUR=furMake(N); UT.value=performance.now()/1000%1000; FUR.visible=true; onHips(FUR,N); } else if(FUR)FUR.visible=false; },'111ei-bigcat'); }
  BIGCAT.road=()=>null;   // he keeps off the road: the traffic never waits for him
  BIGCAT.lids=()=>BL; BIGCAT.fur=()=>FUR; BIGCAT.site=()=>P&&{x:P.x,z:P.z,home,hide};
  window.BIGCATDBG=(x,z)=>{ if(x==='blink'){ nb=0; return; } if(x==='shut'){ hold=!!z; return; } if(N&&x!=null){ Object.assign(N.st,{x,z,to:null,next:null}); } return N?{x:+N.st.x.toFixed(2),z:+N.st.z.toFixed(2),vis:N.g.visible,tris:body.tris(),pole:P&&{x:+P.x.toFixed(2),z:+P.z.toFixed(2)},home,hide,ang,fur:!!FUR&&FUR.visible,lid:BL&&(()=>{ BL.updateMatrixWorld(true); const v=BL.children[0].getWorldPosition(new THREE.Vector3()), e=MERCH.at(N,'hips',[.3,1,.5],new THREE.Vector3()); return {on:BL.visible,d:+v.distanceTo(e).toFixed(3),y:+v.y.toFixed(1)}; })()}:null; }; }
window.BIGCAT=BIGCAT;
