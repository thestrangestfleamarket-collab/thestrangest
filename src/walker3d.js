// ---- THE WALKER IN 3D: his pieces as meshes in the scene (each piece's own shape, the same distance function his points are baked from,
// its surface found on a grid in his resting pose and kept in the piece's own frame), moved each frame by his own skeleton (the rig's pose and
// frames), coloured by his own rule (lit or half lit the ramp's second tone, in shade its third, from his light), the station's light at
// where he stands on him, his outline (the ramp's fourth tone) drawn after by the outline pass where he ends or a piece stands well in front ----
const W3={group:new THREE.Group(), meshes:[], idMeshes:[], L:new THREE.Vector3(), tint:new THREE.Color(1,1,1), tris:0, lv:{value:2}, look:{value:+(new URLSearchParams(location.search).get('look')||0)}, G:{value:new THREE.Matrix3()}, LP:{value:[new THREE.Vector3(),new THREE.Vector3()]}, LC:{value:[new THREE.Vector3(),new THREE.Vector3()]}, CamW:{value:new THREE.Vector3()}, LVP:{value:new THREE.Matrix4()},
  sm:new THREE.WebGLRenderTarget(512,512), smCam:new THREE.OrthographicCamera(-2.1,2.1,2.1,-2.1,0.1,12)   /* (wide enough for him a fifth bigger) */, Lw:new THREE.Vector3()};
W3.sm.depthTexture=new THREE.DepthTexture(256,256); W3.sm.depthTexture.type=THREE.FloatType;   // (his own shadow map, from his light: SELF)
{ const R=RIG, {V,add,sub,mul,nrm,dot}=R, rest=(R.farOnly(false),R.build(R.walkPose({ph:0,w:0},null),null)), MATS=R.MATS,   /* (his fingers on: the skeleton with their joints, FAR off for him) */ STEP=1, CELL=2, OUT=0.2*R.PX;   // (CELL: the simplified mesh's corners a cell of his apart; OUT: its surface pushed out a touch, as merging pulls it in)
  const TET=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]], CO=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]];
  const ramp=MATS.map(m=>(R.RAMP[m]||['#ff00ff','#ff00ff','#ff00ff','#ff00ff']).map(h=>new THREE.Color(h)));
  W3.ramp=ramp; W3.meshOf=(P,step,fine,RB)=>meshOf(P,step,fine,RB); /* (for another Walker built the same way: src/musician.js) */ W3.legs=R.PIECES.map(n=>/^(thigh|shin|shoe)/.test(n)?(n.endsWith('L')?1:2):0);
  function meshOf(P,step,fine,RB){ const bb=P.bb||[-13,13,-1,55,-11,13], nx=Math.ceil((bb[1]-bb[0])/step)+2, ny=Math.ceil((bb[3]-bb[2])/step)+2, nz=Math.ceil((bb[5]-bb[4])/step)+2;
    const at=(i,j,k)=>V(bb[0]+i*step,bb[2]+j*step,bb[4]+k*step), val=new Float32Array(nx*ny*nz), I=(i,j,k)=>(i*ny+j)*nz+k;
    for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)for(let k=0;k<nz;k++)val[I(i,j,k)]=P.d(at(i,j,k));
    const F=P.F0||R.frameOf(P.on||P.n,RB||rest), raw=[], mats=[];   // (F0: a piece's own frame given, as the guitar's: src/musician.js)
    const vert=p=>{ const e=0.02, g=nrm(V(P.d(V(p.x+e,p.y,p.z))-P.d(V(p.x-e,p.y,p.z)),P.d(V(p.x,p.y+e,p.z))-P.d(V(p.x,p.y-e,p.z)),P.d(V(p.x,p.y,p.z+e))-P.d(V(p.x,p.y,p.z-e))));
      const l=sub(add(p,mul(g,OUT)),F.o); raw.push(dot(l,F.x),dot(l,F.y),dot(l,F.z),dot(g,F.x),dot(g,F.y),dot(g,F.z)); mats.push(MATS.indexOf(P.paint&&P.paint(p)||P.m)); };
    for(let i=0;i<nx-1;i++)for(let j=0;j<ny-1;j++)for(let k=0;k<nz-1;k++){ const v=CO.map(([a,b,c])=>val[I(i+a,j+b,k+c)]); if(v.every(x=>x>0)||v.every(x=>x<=0))continue;
      const p=CO.map(([a,b,c])=>at(i+a,j+b,k+c));
      for(const t of TET){ const ins=t.filter(c=>v[c]<=0), out=t.filter(c=>v[c]>0); if(!ins.length||!out.length)continue;
        const E=(a,b)=>{ const f=v[a]/(v[a]-v[b]); return add(p[a],mul(sub(p[b],p[a]),f)); };
        if(ins.length===1)[E(ins[0],out[0]),E(ins[0],out[1]),E(ins[0],out[2])].forEach(vert);
        else if(ins.length===3)[E(out[0],ins[0]),E(out[0],ins[1]),E(out[0],ins[2])].forEach(vert);
        else { const a=E(ins[0],out[0]),b=E(ins[0],out[1]),c=E(ins[1],out[1]),d=E(ins[1],out[0]); [a,b,c,a,c,d].forEach(vert); } } }
    const fit0=R.fitPts(P.n,new Float32Array(raw)), {fit,mats:mts}=simplify(fit0,mats,P.cell||CELL*(fine?0.5:1)); mats.length=0; for(const q of mts)mats.push(q); const n=fit.length/6, pos=new Float32Array(n*3), nor=new Float32Array(n*3), c0=new Float32Array(n*3), c1=new Float32Array(n*3), c2=new Float32Array(n*3), cd=new Float32Array(n*3), mt=new Float32Array(n);
    for(let i=0;i<n;i++){ pos.set([fit[i*6],fit[i*6+1],fit[i*6+2]],i*3); nor.set([fit[i*6+3],fit[i*6+4],fit[i*6+5]],i*3); const r=ramp[mats[i]]||ramp[0]; c0.set([r[0].r,r[0].g,r[0].b],i*3); c1.set([r[1].r,r[1].g,r[1].b],i*3); c2.set([r[2].r,r[2].g,r[2].b],i*3); cd.set([(r[2].r+r[3].r)/2,(r[2].g+r[3].g)/2,(r[2].b+r[3].b)/2],i*3); mt[i]=mats[i]; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3));
    g.setAttribute('c0',new THREE.BufferAttribute(c0,3)); g.setAttribute('cd',new THREE.BufferAttribute(cd,3)); g.setAttribute('c1',new THREE.BufferAttribute(c1,3)); g.setAttribute('c2',new THREE.BufferAttribute(c2,3)); g.setAttribute('mat',new THREE.BufferAttribute(mt,1)); return g; }
  // SIMPLER (owner, 16 Oct 2026: "simplify him"): corners that fall in one small cell become one corner, at their average, its normal their
  // average, its stuff the most of theirs; a triangle whose corners land in fewer than three cells is gone (100,000 triangles to about 8,000,
  // his pixels as near his drawing as before)
  function simplify(fit,mats,cell){ const n=fit.length/6, key=new Map(), cid=new Int32Array(n), acc=[];
    for(let i=0;i<n;i++){ const k=Math.floor(fit[i*6]/cell)+'|'+Math.floor(fit[i*6+1]/cell)+'|'+Math.floor(fit[i*6+2]/cell)+'|'+mats[i]; let c=key.get(k); if(c==null){ c=acc.length; key.set(k,c); acc.push({p:[0,0,0],nn:[0,0,0],k:0,m:mats[i]}); }
      const a=acc[c]; for(let q=0;q<3;q++){ a.p[q]+=fit[i*6+q]; a.nn[q]+=fit[i*6+3+q]; } a.k++; cid[i]=c; }
    const tri=[]; for(let i=0;i<n;i+=3){ const a=cid[i],b=cid[i+1],c=cid[i+2]; if(a!==b&&b!==c&&a!==c)tri.push(a,b,c); }
    const out=new Float32Array(tri.length*6), om=[]; tri.forEach((c,i)=>{ const a=acc[c], l=Math.hypot(...a.nn)||1; for(let q=0;q<3;q++){ out[i*6+q]=a.p[q]/a.k; out[i*6+3+q]=a.nn[q]/l; } om.push(a.m); }); return {fit:out,mats:om}; }
  // his colours: the normal in his own frame (the piece's turn, uR) against his light (uL, his, as the rig's draw has it), two tones, the light where he stands on him
  // ONE MESH (faster, the same picture): every piece in one, each corner knowing its piece (pidx); the pieces' frames from his skeleton
  // handed to the graphics card each frame (uPM), which moves each corner by its own piece's: one draw for all of him in every pass
  // HIS FINGERS (owner, 17 Oct 2026: "make my characters fingers visible (as one joint each, not every possible finger joint)"): the palm to
  // the knuckles (the rig's fine hand), and each finger and the thumb one piece, its three bones' shapes as one, bending at the knuckle
  R.fine(true); const PCS0=R.shell(rest.J,0).filter(P=>P.on!=='prop'&&P.on!=='world'&&P.n!=='beard'); R.fine(false);   // (no beard: owner, 17 Oct 2026, "remove the beard and buzzcut from game completely")
  const around=(ps,m)=>{ const b=[1e9,-1e9,1e9,-1e9,1e9,-1e9]; for(const p of ps){ b[0]=Math.min(b[0],p.x-m); b[1]=Math.max(b[1],p.x+m); b[2]=Math.min(b[2],p.y-m); b[3]=Math.max(b[3],p.y+m); b[4]=Math.min(b[4],p.z-m); b[5]=Math.max(b[5],p.z+m); } return b; };
  const PCS=[]; for(const P of PCS0){ const f=/^fing(\d)(\d)([LR])$/.exec(P.n); if(!f){ if(/^hand[LR]$/.test(P.n)){ P.bb=around([rest.J['wrist'+P.n.slice(-1)]],4.5); P.step=.25; P.cell=.2; } PCS.push(P); continue; }
    if(f[2]!=='0')continue; const sib=[1,2].map(j=>PCS0.find(q=>q.n==='fing'+f[1]+j+f[3])), d0=P.d, J=rest.J, k=j=>J['k'+f[1]+j+f[3]];
    PCS.push({...P,d:p=>Math.min(d0(p),...sib.map(q=>q.d(p))),bb:around([k(0),k(1),k(2),k(3)],1.2),step:.18,cell:.14}); }
  // HIS LOOKS (owner, 17 Oct 2026: "fix his beard ... edit your appearance ... other hairstyle, facial hairstyle, colors of everything, eye color,
  // (give them a face) ... pick common 5 of all things"): his face painted on his head (eyes in their colour, brows, the mouth a dark line); his
  // beard without the bare skin round the moustache; and the five hairstyles and five beards made once here, each its own piece on his head,
  // the ones not worn folded away to nothing each frame (W3.HIDE), so changing them is instant and his mesh never changes (src/looks.js)
  { const H=rest.J.head, {rbox,ell,box}=R, Vv=R.V, ad=R.add, HB=[H.x-11,H.x+11,H.y-14,H.y+11,H.z-11,H.z+11];
    const head=PCS.find(P=>P.n==='head'), hair=PCS.find(P=>P.n==='hair'), hd=head.d, hr=hair.d;
    for(const P of PCS)if(/^shoe[LR]$/.test(P.n))P.paint=p=>p.y<1.15?'sole':null;   // (HIS FEET: a darker sole under each, owner 17 Oct 2026, "give his feet more depth")
    const side=p=>Math.abs(p.x-H.x), front=p=>p.z>H.z+3.6;
    head.paint=p=>{ if(!front(p))return null; const s=side(p), y=p.y-H.y; if(Math.abs(s-2.3)<.8&&Math.abs(y-.7)<.95)return 'eye'; if(Math.abs(s-2.3)<1.35&&Math.abs(y-2.35)<.38)return 'hair'; return null; };
    const lip=p=>box(p,ad(H,Vv(0,-5.95,5.2)),Vv(1.8,.32,3.2))<0?'mouth':null;   // (the mouth: a dark line, in the beard or on the skin)
    head.paint=(f=>p=>f(p)||(front(p)&&lip(p)))(head.paint);
    const V=(n,on,m,d,paint)=>({n,on,m,d,paint,bb:HB,step:.5});
    PCS.push(V('hairPony','hair','hair',p=>Math.min(hr(p),ell(p,ad(H,Vv(0,1.5,-7.2)),Vv(1.6,1.6,1.4)),R.rcone(p,ad(H,Vv(0,1.2,-7.6)),ad(H,Vv(0,-6.5,-8.6)),1.3,.8))),
             V('hairLong','hair','hair',p=>Math.min(hr(p),Math.max(rbox(p,ad(H,Vv(0,-3.6,-1.6)),Vv(7.1,11.2,6.4),3.6),-box(p,ad(H,Vv(0,-3.6,5.9)),Vv(5.3,9.5,4.4)),H.y-13.6-p.y))),
             V('hairBun','hair','hair',p=>Math.min(hr(p),ell(p,ad(H,Vv(0,5.2,-6.2)),Vv(2.7,2.5,2.5))))); }
  const NP=PCS.length; W3.HIDE=new Array(NP).fill(false); W3.idx=n=>PCS.findIndex(P=>P.n===n); W3.PM={value:PCS.map(()=>new THREE.Matrix4())}; W3.pcs=PCS;
  const MOVE=`attribute float pidx; uniform mat4 uPM[${NP}];`, AT=`mat4 PM=uPM[int(pidx+0.5)];`;
  const VS=MOVE+`attribute vec3 c0,c1,c2,cd; varying vec3 vC0,vC1,vC2,vCd,vN,vW; void main(){ `+AT+` vN=mat3(PM)*normal; vC0=c0; vC1=c1; vC2=c2; vCd=cd; vec4 w=modelMatrix*(PM*vec4(position,1.)); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;
  const FS=`uniform vec3 uL,uTint; uniform float uLv; uniform mat4 uLVP; uniform sampler2D uSM; uniform int uLook; uniform mat3 uG; uniform vec3 uLP[2],uLC[2],uCamW; varying vec3 vC0,vC1,vC2,vCd,vN,vW;
  float bay(vec2 p){ ivec2 q=ivec2(mod(p,4.)); float m[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.); return m[q.x+q.y*4]/16.; }
  vec3 room(vec3 nw,out vec3 rimc){ vec3 a=vec3(0.07,0.08,0.11); rimc=vec3(0.); for(int i=0;i<2;i++){ vec3 d=uLP[i]-vW; float k=min(1.,1./(1.+dot(d,d)*0.08)); a+=uLC[i]*max(dot(nw,normalize(d)),0.)*k*3.2; rimc+=uLC[i]*k; } return a; }
  void main(){ float l=dot(normalize(vN),uL); vec3 c;
    if(uLook==1){ float t=l+(bay(gl_FragCoord.xy)-0.5)*0.3; vec3 hi=mix(vC0,vec3(1.,.93,.8)*max(vC0.r,max(vC0.g,vC0.b)),.22), sh=vC2*vec3(.82,.88,1.18);
      gl_FragColor=vec4((t>0.4?hi:t>-0.2?vC1:sh)*uTint,1.); return; }
    if(uLook>=2){ vec3 nw=normalize(uG*vN), rimc; vec3 a=room(nw,rimc); float rim=pow(1.-max(dot(nw,-uCamW),0.),3.);
      float lum=dot(a,vec3(.3,.5,.2)); float steps=uLook==2?3.:5.; float q=uLook==2?max(1./steps,floor(lum*steps+0.5)/steps):max(0.5/steps,floor(lum*steps+0.5+(bay(gl_FragCoord.xy)-0.5)*0.4)/steps);
      vec3 lit=vC1*1.35*mix(vec3(1.),a/max(lum,0.001),0.75)*q; lit+=rimc*(uLook==2?step(0.6,rim):smoothstep(0.35,0.8,rim))*0.5;
      gl_FragColor=vec4(min(lit,vC0*1.05),1.); return; }   // (never brighter than his own colours, as the game lights a character)
    if(uLv<0.5) c=l>-0.3?vC1:vC2;
    else{ int t=l>0.55?0:l>0.05?1:l>-0.4?2:4;
      if(uLv>1.5&&t<2){ vec4 p=uLVP*vec4(vW,1.); vec3 q=p.xyz/p.w*0.5+0.5; if(q.x>0.&&q.x<1.&&q.y>0.&&q.y<1.&&q.z-0.006>texture2D(uSM,q.xy).r) t=2; }
      c=t==0?vC0:t==1?vC1:t==2?vC2:vCd; }
    gl_FragColor=vec4(c*uTint,1.); }`;
  // the outline pass's picture of him: which piece, which stuff, how far (in the scene's units, along the view)
  const IVS=MOVE+`attribute float mat,pid; varying float vm,vd,vp; void main(){ `+AT+` vm=mat; vp=pid; vec4 mv=modelViewMatrix*(PM*vec4(position,1.)); vd=-mv.z; gl_Position=projectionMatrix*mv; }`;
  const IFS=`varying float vm,vd,vp; void main(){ gl_FragColor=vec4(floor(vp+0.5),floor(vm+0.5),0.,vd); }`;
  const geos=PCS.map((P,i)=>{ const fine=P.step<1||/^(head|hair|beard|brow|eye|nose|ear|mouth)/.test(P.n), g=meshOf(P,P.step||(fine?STEP/2:STEP),fine,null), n=g.attributes.position.count;
    g.setAttribute('pidx',new THREE.BufferAttribute(new Float32Array(n).fill(i),1)); g.setAttribute('pid',new THREE.BufferAttribute(new Float32Array(n).fill(R.PIECES.indexOf(P.n)),1)); return g; });
  const all=new THREE.BufferGeometry(); for(const k of Object.keys(geos[0].attributes)){ const sz=geos[0].attributes[k].itemSize, tot=geos.reduce((a,g)=>a+g.attributes[k].array.length,0), arr=new Float32Array(tot); let o=0; for(const g of geos){ arr.set(g.attributes[k].array,o); o+=g.attributes[k].array.length; } all.setAttribute(k,new THREE.BufferAttribute(arr,sz)); }
  W3.tris=all.attributes.position.count/3;
  const U={uPM:W3.PM,uL:{value:W3.L},uTint:{value:W3.tint},uLv:W3.lv,uLVP:W3.LVP,uSM:{value:W3.sm.depthTexture},uLook:W3.look,uG:W3.G,uLP:W3.LP,uLC:W3.LC,uCamW:W3.CamW};
  const m=new THREE.Mesh(all,new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:FS,side:THREE.DoubleSide,uniforms:U}));
  // his shadows from the lamps: the lamps' own distance material, moved the same way
  const dist=new THREE.MeshDistanceMaterial({side:THREE.DoubleSide}); dist.onBeforeCompile=sh=>{ sh.uniforms.uPM=W3.PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; dist.customProgramCacheKey=()=>'w3dist'+NP;
  // (and the sun's: its depth material, moved the same way: src/clock.js)
  const depth=new THREE.MeshDepthMaterial({side:THREE.DoubleSide,depthPacking:THREE.RGBADepthPacking}); depth.onBeforeCompile=sh=>{ sh.uniforms.uPM=W3.PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <begin_vertex>',AT+' vec3 transformed=(PM*vec4(position,1.)).xyz;'); }; depth.customProgramCacheKey=()=>'w3depth'+NP;
  m.customDepthMaterial=depth;
  m.customDistanceMaterial=dist; m.matrixAutoUpdate=true; m.castShadow=true; m.frustumCulled=false;
  W3.idMat=new THREE.ShaderMaterial({vertexShader:IVS,fragmentShader:IFS,side:THREE.DoubleSide,uniforms:{uPM:W3.PM}});
  W3.depthMat=new THREE.ShaderMaterial({vertexShader:MOVE+`void main(){ `+AT+` gl_Position=projectionMatrix*modelViewMatrix*(PM*vec4(position,1.)); }`,fragmentShader:`void main(){ gl_FragColor=vec4(0.); }`,side:THREE.DoubleSide,uniforms:{uPM:W3.PM}});
  // LIT BY THE LAMPS (owner, 17 Oct 2026: "lets make sure the avatars are affected by lights, they are same shade all time"): his colours lit by
  // the scene's own lights (each lamp's colour, how near, which side of him, the walls' shadows on him from the lamps that cast them, the
  // level's ambient), in three hard steps as the world's pixel art; his first look (his own fixed light) kept as FLAT, the menu's switch
  all.setAttribute('color',all.attributes.c1.clone());
  const G3=new THREE.DataTexture(new Uint8Array([70,70,70,255,160,160,160,255,255,255,255,255]),3,1,THREE.RGBAFormat); G3.magFilter=G3.minFilter=THREE.NearestFilter; G3.needsUpdate=true; W3.G3=G3;
  // HIS SHADING (owner, 17 Oct 2026: "i have self shadow enabled but i cant see them. add a scroll bar to allow levels of shadows and depth, 2-5
  // options of shadowing your own avatar"): his own steps of light (2 to 5) and how dark the darkest goes (DEPTH), and SELF on him lit by the
  // lamps too: where his own body stands between the light and a part of him (his shadow pass), that part a step darker
  const GP=new THREE.DataTexture(new Uint8Array(20),5,1,THREE.RGBAFormat); GP.magFilter=GP.minFilter=THREE.NearestFilter; W3.GP=GP; W3.uSelf={value:.7};
  W3.setShade=(n,dp)=>{ n=Math.max(2,Math.min(5,Math.round(n))); dp=Math.max(.1,Math.min(.9,dp)); W3.shade={steps:n,depth:dp}; const d=new Uint8Array(n*4); for(let i=0;i<n;i++){ const v=Math.round(255*((1-dp)+dp*i/(n-1))); d.set([v,v,v,255],i*4); }
    GP.image={data:d,width:n,height:1}; GP.needsUpdate=true; W3.uSelf.value=1-dp*.55; try{ localStorage.setItem('market-shade',JSON.stringify(W3.shade)); }catch(e){} };
  { let s0={steps:4,depth:.78}; try{ const v=localStorage.getItem('market-shade'); if(v)s0=JSON.parse(v); }catch(e){} W3.setShade(s0.steps,s0.depth); }
  const toon=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:GP,side:THREE.DoubleSide});
  toon.onBeforeCompile=sh=>{ sh.uniforms.uPM=W3.PM; sh.vertexShader=MOVE+'\n'+sh.vertexShader.replace('#include <beginnormal_vertex>',AT+' vec3 objectNormal=mat3(PM)*normal;').replace('#include <begin_vertex>','vec3 transformed=(PM*vec4(position,1.)).xyz;');
    sh.uniforms.uLv=W3.lv; sh.uniforms.uLVP=W3.LVP; sh.uniforms.uSM={value:W3.sm.depthTexture}; sh.uniforms.uSelf=W3.uSelf;
    sh.vertexShader='varying vec3 vWW;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vWW=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader='uniform float uLv,uSelf; uniform mat4 uLVP; uniform sampler2D uSM; varying vec3 vWW;\n'+sh.fragmentShader.replace('#include <normal_fragment_begin>','float faceDirection=1.0; vec3 normal=normalize(vNormal); vec3 nonPerturbedNormal=normal;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*0.16;')
      .replace('#include <opaque_fragment>','#include <opaque_fragment>\n if(uLv>1.5){ vec4 sp=uLVP*vec4(vWW,1.); vec3 q=sp.xyz/sp.w*0.5+0.5; if(q.x>0.&&q.x<1.&&q.y>0.&&q.y<1.&&q.z-0.006>texture2D(uSM,q.xy).r) gl_FragColor.rgb*=uSelf; }'); };   // (SELF: his own shadow on him)   // (a little light of his own, so the dark never loses him) (his normals are his shape's own, whichever way a triangle faces)
  toon.customProgramCacheKey=()=>'w3toon'+NP; W3.flat=m.material; W3.toon=toon; m.receiveShadow=true;
  W3.group.add(m); W3.meshes.push(m); W3.mesh=m;
  scene.add(W3.group);
  // each frame: every piece where his skeleton has it (his units), the whole of him where he stands, turned to his heading, his verticals as the world's
  const LIGHT=nrm(V(-0.55,0.75,0.5)), m4=new THREE.Matrix4();
  W3.SZ=1.2;   // HIS SIZE (owner, 17 Oct 2026: "make avatar character 20% larger"): his rig and shape as they were, drawn a fifth bigger from his feet
  W3.place=(B,x,y,z,hd,yawA,ZY)=>{ W3.group.position.set(x,y,z); W3.group.rotation.set(0,hd,0); W3.group.scale.set(W3.SZ/PPU,ZY*W3.SZ,W3.SZ/PPU);
    const L=R.yaw(LIGHT,-yawA); W3.L.set(L.x,L.y,L.z);
    W3.G.value.setFromMatrix4(new THREE.Matrix4().makeRotationY(hd)); if(typeof SHL!=='undefined')SHL.forEach((S,i)=>{ W3.LP.value[i].copy(S.position);
      // (a lamp under the water reaches him only through the water's surface: over the basin a little of it, from the deck none; the deck stands between)
      const wl=typeof POOLR!=='undefined'?POOLR.Y(POOLR.level):-1e9, under=S.position.y<wl, k=!under?1:POOLR.inBasin(x,z)?(y<wl?0.6:0.25):0;
      W3.LC.value[i].set(S.color.r,S.color.g,S.color.b).multiplyScalar(Math.min(1.5,S.intensity/2)*k); });   // (looks C, D: the two lamps nearest him)
    if(typeof cam!=='undefined')cam.getWorldDirection(W3.CamW.value);
    // his light in the scene (as a ray turns with him and his verticals), and the camera that looks down it at him, for SELF
    W3.Lw.set(L.x/PPU,L.y*ZY,L.z/PPU).applyAxisAngle(new THREE.Vector3(0,1,0),hd).normalize();
    const mid=new THREE.Vector3(x,y+1.25,z); W3.smCam.position.copy(mid).addScaledVector(W3.Lw,6); W3.smCam.lookAt(mid); W3.smCam.updateMatrixWorld();
    W3.LVP.value.multiplyMatrices(W3.smCam.projectionMatrix,W3.smCam.matrixWorldInverse);
    PCS.forEach((P,i)=>{ const F=R.frameOf(P.on||P.n,B); W3.PM.value[i].set(F.x.x,F.y.x,F.z.x,F.o.x, F.x.y,F.y.y,F.z.y,F.o.y, F.x.z,F.y.z,F.z.z,F.o.z, 0,0,0,1); }); };
}
// THE OUTLINE PASS: the scene (all but him) as what stands in front or behind, then his pieces; then on the picture, his edge tone wherever he
// ends (the next pixel is empty or behind him), or one piece stands well in front of the next (as the rig's draw: 3.5 of his units for the same
// stuff, 1.6 for another), or his legs cross; nothing where something of the scene stands in front of him
const OUTL={rt:new THREE.WebGLRenderTarget(4,4,{type:THREE.FloatType,format:THREE.RGBAFormat,minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter}),
  occ:new THREE.ShaderMaterial({vertexShader:`varying float vd; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vd=-mv.z; gl_Position=projectionMatrix*mv; }`,fragmentShader:`varying float vd; void main(){ gl_FragColor=vec4(-1.,0.,0.,vd); }`,side:THREE.DoubleSide})};
OUTL.pass={uniforms:{tDiffuse:{value:null},tId:{value:OUTL.rt.texture},px:{value:new THREE.Vector2(1,1)},cols:{value:W3.ramp.map(r=>new THREE.Vector3(r[3].r,r[3].g,r[3].b)).concat(Array(Math.max(0,24-W3.ramp.length)).fill(new THREE.Vector3())).slice(0,24)},
    legs:{value:W3.legs.concat(Array(Math.max(0,64-W3.legs.length)).fill(0)).slice(0,64)},tint:{value:W3.tint},t1:{value:3.5/PPU},t2:{value:1.6/PPU}},
  vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader:`uniform sampler2D tDiffuse,tId; uniform vec2 px; uniform vec3 cols[24]; uniform float legs[64]; uniform vec3 tint; uniform float t1,t2; varying vec2 vUv;
  bool edgeTo(vec4 c,vec2 o){ vec4 q=texture2D(tId,vUv+o*px); if(q.x<0.)return q.w>c.w+0.05; if(abs(q.x-c.x)<0.5)return false;
    if(q.w-c.w>(abs(q.y-c.y)<0.5?t1:t2))return true; float a=legs[int(c.x+0.5)], b=legs[int(q.x+0.5)]; return a>0.&&b>0.&&a!=b&&q.w>=c.w; }
  void main(){ vec4 c=texture2D(tId,vUv); vec4 base=texture2D(tDiffuse,vUv); if(c.x<0.){ gl_FragColor=base; return; }
    bool e=edgeTo(c,vec2(1,0))||edgeTo(c,vec2(-1,0))||edgeTo(c,vec2(0,1))||edgeTo(c,vec2(0,-1)); gl_FragColor=e?vec4(cols[int(c.y+0.5)]*tint,1.):base; }`};
OUTL.render=(renderer,scene,cam)=>{ const w=renderer.domElement.width, h=renderer.domElement.height; if(OUTL.rt.width!==w||OUTL.rt.height!==h)OUTL.rt.setSize(w,h); OUTL.pass.uniforms.px.value.set(1/w,1/h);
  const ac=renderer.autoClear; renderer.setRenderTarget(OUTL.rt); renderer.state.buffers.color.setClear(-2,0,0,1e9); renderer.clear(true,true,false);
  const cut=OUTL.hidden?OUTL.hidden():[]; for(const o of cut)o.visible=false; W3.group.visible=false; scene.overrideMaterial=OUTL.occ; const bg=scene.background; scene.background=null; renderer.autoClear=false; renderer.render(scene,cam); scene.overrideMaterial=null; scene.background=bg; W3.group.visible=true; for(const o of cut)o.visible=true;
  const m0=W3.mesh.material; W3.mesh.material=W3.idMat; renderer.render(W3.group,cam); W3.mesh.material=m0;
  renderer.autoClear=ac; renderer.setRenderTarget(null); };

// SELF: his own depth from his light, his pieces alone (each frame, before the scene)
W3.shadowPass=renderer=>{ if(W3.lv.value<1.5)return; const m0=W3.mesh.material; W3.mesh.material=W3.depthMat;
  renderer.setRenderTarget(W3.sm); renderer.clear(); renderer.render(W3.group,W3.smCam); renderer.setRenderTarget(null); W3.mesh.material=m0; };
