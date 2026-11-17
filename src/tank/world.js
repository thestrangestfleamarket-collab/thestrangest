// HULL DOWN's changing world: what shells, blasts and tracks do to the ground, the trees, the rocks, loose things and buildings (put into main.js by tools/edge.cjs)
const WORLD=(()=>{
  const W={on:true,quiet:false},dm=new T.Object3D(),m4=new T.Matrix4(),m5=new T.Matrix4(),q1=new T.Quaternion(),v1=new T.Vector3(),v2=new T.Vector3(),v3=new T.Vector3(),ONE=new T.Vector3(1,1,1);
  // ---- the ground's state, one picture over the sector: red is burnt, green is a hole, blue is rutted or flattened
  const GSR=700,gsRT=new T.WebGLRenderTarget(2048,2048,{depthBuffer:false});gsRT.texture.generateMipmaps=false;gsRT.texture.minFilter=gsRT.texture.magFilter=T.LinearFilter;
  const SN=96,sg=new T.InstancedBufferGeometry(),pg=new T.PlaneGeometry(2,2);sg.setIndex(pg.index);sg.setAttribute('position',pg.attributes.position);
  const aS=new T.InstancedBufferAttribute(new Float32Array(SN*4),4),aC=new T.InstancedBufferAttribute(new Float32Array(SN*4),4);aS.setUsage(T.DynamicDrawUsage);aC.setUsage(T.DynamicDrawUsage);sg.setAttribute('aS',aS);sg.setAttribute('aC',aC);
  const sv='attribute vec4 aS,aC;varying vec2 vP;varying vec4 vC;varying float vE;void main(){vP=position.xy;vC=aC;vE=aS.w;float c=cos(aS.w),s=sin(aS.w);vec2 p=position.xy*vec2(aS.z,aS.z*aC.w);gl_Position=vec4((aS.xy+vec2(c*p.x-s*p.y,s*p.x+c*p.y))/'+GSR+'.,0.,1.);}';
  const sMat=new T.ShaderMaterial({vertexShader:sv,fragmentShader:'varying vec2 vP;varying vec4 vC;void main(){float d=length(vP);float a=1.-smoothstep(.55,1.,d);gl_FragColor=vec4(vC.rgb*a,1.);}',depthTest:false,depthWrite:false,blending:T.CustomBlending,blendEquation:T.MaxEquation,blendSrc:T.OneFactor,blendDst:T.OneFactor});
  const eMat=new T.ShaderMaterial({vertexShader:sv,fragmentShader:'void main(){gl_FragColor=vec4(0.,0.,0.,1.);}',depthTest:false,depthWrite:false,blending:T.NoBlending});
  const sMesh=new T.Mesh(sg,sMat);sMesh.frustumCulled=false;const sScene=new T.Scene();sScene.add(sMesh);const sCam=new T.Camera();
  const sq=[],eq=[];let gsClean=false;
  // a mark on the ground: where, how wide, which of burnt, hole and rut, turned by rot and stretched by long
  function stamp(x,z,r,cr,cg,cb,rot=0,long=1){if(Math.abs(x)<GSR-r&&Math.abs(z)<GSR-r&&sq.length<4800)sq.push(x,z,r,rot,cr,cg,cb,long);}
  function flushStamps(){
    if(gsClean&&!sq.length&&!eq.length)return;const prev=renderer.getRenderTarget(),xe=renderer.xr.enabled,ac=renderer.autoClear;renderer.xr.enabled=false;renderer.setRenderTarget(gsRT);
    if(!gsClean){renderer.setClearColor(0,1);renderer.clear();gsClean=true;}renderer.autoClear=false;
    for(const[q,mat]of[[eq,eMat],[sq,sMat]]){let n=0;while(q.length&&n<SN){const o=q.splice(0,8);aS.setXYZW(n,o[0],o[1],o[2],o[3]);aC.setXYZW(n,o[4],o[5],o[6],o[7]);n++;}
      if(n){aS.needsUpdate=aC.needsUpdate=true;sg.instanceCount=n;sMesh.material=mat;renderer.render(sScene,sCam);}}
    renderer.autoClear=ac;renderer.setRenderTarget(prev);renderer.xr.enabled=xe;}
  W.tex=gsRT.texture;W.GSR=GSR;W.stamp=stamp;
  // ---- craters: a real bowl under a hole in the land
  const CRN=56,craters=[];
  const bowl=(()=>{const rs=[0,.3,.6,.85,1,1.2,1.55],ys=[-.42,-.39,-.27,-.1,.05,.1,-.08],N=18,p=[],c=[],ix=[],uv=[];
    rs.forEach((r,j)=>{for(let i=0;i<=N;i++){const a=i/N*6.2832,k=1+.09*Math.sin(a*3+j)+.06*Math.sin(a*7.3);p.push(Math.cos(a)*r*k,ys[j]*(.85+.3*hsh(i*.7,j*1.3)),Math.sin(a)*r*k);const s=j<4?.2+j*.05:j<6?.5:.75;c.push(s,s*.9,s*.78);uv.push(Math.cos(a)*r*.5+.5,Math.sin(a)*r*.5+.5);}});
    for(let j=0;j<rs.length-1;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;ix.push(a,a+1,b,a+1,b+1,b);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();
    const im=new T.InstancedMesh(g,new T.MeshLambertMaterial({map:A0.soil.d,vertexColors:true,color:0x8a7f72}),CRN);im.count=0;im.frustumCulled=false;im.receiveShadow=true;scene.add(im);return im;})();
  function crater(x,z,R){
    if(Math.hypot(x,z)>GSR-20||wetAt(x,z))return;for(const c of craters)if(Math.hypot(c.x-x,c.z-z)<(c.R+R)*.55){stamp(x,z,R*2.4,1,0,0);return;}
    let i=craters.length;if(i>=CRN){const o=craters.shift();i=o.i;eq.push(o.x,o.z,o.R*1.6,0,0,0,0,1);}
    const c={x,z,R,i,y:hAt(x,z)};craters.push(c);normalAt(x,z,v1);dm.position.set(x,c.y+.03,z);dm.quaternion.setFromUnitVectors(UP,v1).multiply(q1.setFromAxisAngle(UP,hsh(x,z)*6.28));dm.scale.setScalar(R);dm.updateMatrix();bowl.setMatrixAt(i,dm.matrix);bowl.count=Math.max(bowl.count,i+1);bowl.instanceMatrix.needsUpdate=true;
    stamp(x,z,R*1.12,0,1,0);stamp(x,z,R*2.6,1,0,.5);}
  // the ground with its craters, for whatever stands or drives on it
  W.gAt=(x,z)=>{let h=hAt(x,z);for(const c of craters){const dx=x-c.x,dz=z-c.z,d2=(dx*dx+dz*dz)/(c.R*c.R);if(d2<1)h-=.4*c.R*(1-d2)*(1-d2);}return h;};
  W.craters=craters;
  // ---- water: which pond a spot is in
  function wetAt(x,z){for(const p of PONDS)if(Math.hypot(x-p[0],z-p[1])<p[2])return p;return null;}
  W.wetAt=wetAt;W.rings=[];
  function splash(x,z,big){const p=wetAt(x,z),y=p[3]-.5;W.rings.push({x,z,t:time,a:big?1:.55});if(W.rings.length>8)W.rings.shift();
    for(let i=0;i<(big?12:6);i++){const a=Math.random()*6.28,v=Math.random()*(big?3:1.5);puff(x,y+.5,z,{c:[.75,.8,.82],s0:big?2:1,s1:(big?7:3.5)+Math.random()*3,life:1.1+Math.random()*.9,vx:Math.cos(a)*v,vz:Math.sin(a)*v,vy:(big?9:5)+Math.random()*6,op:.75});}
    for(let i=0;i<5;i++)puff(x,y+.3,z,{c:[.7,.74,.76],s0:2,s1:big?14:8,life:2.2,vy:.6,op:.35});}
  // ---- loose pieces: stones, bricks and splinters that fly, bounce, roll and lie where they stop
  const DN=220,deb=[];
  // one piece cut from a model: a single stone out of a set of them (the triangles that hang together), or a length of a trunk
  const cut=(g0,mode,want=90)=>{const g=g0.index?g0.toNonIndexed():g0.clone(),p=g.attributes.position,n=p.count/3,keep=[];
    if(mode==='slab'){for(let t=0;t<n;t++){let ok=true;for(let k=0;k<3;k++){const y=p.getY(t*3+k);if(y<.4||y>2.6)ok=false;}if(ok)keep.push(t);}}
    else{const id=new Map(),par=[],find=i=>{while(par[i]!==i)i=par[i]=par[par[i]];return i;},vt=[];
      for(let i=0;i<p.count;i++){const k=Math.round(p.getX(i)*200)+','+Math.round(p.getY(i)*200)+','+Math.round(p.getZ(i)*200);if(!id.has(k)){id.set(k,par.length);par.push(par.length);}vt.push(id.get(k));}
      for(let t=0;t<n;t++){const a=find(vt[t*3]);par[find(vt[t*3+1])]=a;par[find(vt[t*3+2])]=a;}
      const sets=new Map();for(let t=0;t<n;t++){const r=find(vt[t*3]);(sets.get(r)||sets.set(r,[]).get(r)).push(t);}
      let best=null;for(const l of sets.values())if(l.length>=16&&(!best||Math.abs(l.length-want)<Math.abs(best.length-want)))best=l;if(best&&best.length<n)keep.push(...best);}
    if(keep.length<8)return g;const o=new T.BufferGeometry();for(const nm of['position','normal','uv']){const a=g.attributes[nm];if(!a)continue;const sz=a.itemSize,arr=new Float32Array(keep.length*3*sz);keep.forEach((t,i)=>{for(let k=0;k<3*sz;k++)arr[i*3*sz+k]=a.array[t*3*sz+k];});o.setAttribute(nm,new T.BufferAttribute(arr,sz));}return o;};
  const mkDeb=(src,col,mode,want)=>{let g=null,mat=null;src.traverse(m=>{if(m.isMesh&&!g){g=cut(m.geometry,mode,want);mat=m.material;}});g.computeBoundingSphere();const s=1/g.boundingSphere.radius;g.translate(-g.boundingSphere.center.x,-g.boundingSphere.center.y,-g.boundingSphere.center.z);g.scale(s,s,s);
    const im=new T.InstancedMesh(g,new T.MeshLambertMaterial({map:mat.map,color:col,alphaTest:mat.alphaTest,side:mat.side}),DN);im.count=0;im.frustumCulled=false;im.castShadow=false;im.receiveShadow=true;scene.add(im);return{im,n:0,live:[]};};
  const DEB={stone:mkDeb(M.rocks,0x8f8a80,'part',90),stoneB:mkDeb(M.rocks,0x857f76,'part',36),stoneC:mkDeb(M.rocks,0x97928a,'part',170),brick:mkDeb(M.rubble,0x9a8f84,'part'),wood:mkDeb(M.deadtree,0x7a6a55,'slab')},STONES=['stone','stoneB','stoneC'];
  function chunk(kind,x,y,z,vx,vy,vz,s,pin){if(kind==='stone')kind=STONES[Math.floor(Math.random()*3)];const D=DEB[kind],i=D.n++%DN;D.im.count=Math.min(DN,Math.max(D.im.count,i+1));
    const d={D,i,x,y,z,vx,vy,vz,s,ax:Math.random()*6.28,sp:(Math.random()-.5)*14,an:Math.random()*6,flat:kind==='wood'?[.45,1,.45]:[1,.7+Math.random()*.3,.75+Math.random()*.25],rest:!!pin,pin:!!pin};if(pin){d.an=0;d.sp=0;}
    const old=D.live.findIndex(o=>o.i===i);if(old>=0)D.live.splice(old,1);D.live.push(d);if(!pin)deb.push(d);putDeb(d);}
  function putDeb(d){dm.position.set(d.x,d.y,d.z);if(d.pin)dm.quaternion.identity();else dm.quaternion.setFromAxisAngle(v1.set(Math.cos(d.ax),.3,Math.sin(d.ax)).normalize(),d.an);dm.scale.set(d.s*d.flat[0],d.s*d.flat[1],d.s*d.flat[2]);dm.updateMatrix();d.D.im.setMatrixAt(d.i,dm.matrix);d.D.im.instanceMatrix.needsUpdate=true;}
  function burst(kind,x,y,z,n,power,s0,s1,dx=0,dz=0){if(W.quiet)return;for(let i=0;i<n;i++){const a=Math.random()*6.28,v=power*(.3+Math.random()*.7);chunk(kind,x+(Math.random()-.5)*s1*2,y+Math.random()*s1,z+(Math.random()-.5)*s1*2,Math.cos(a)*v+dx*power,power*(.5+Math.random()*.9),Math.sin(a)*v+dz*power,s0+Math.random()*(s1-s0));}}
  function updateDebris(dt){
    for(let k=deb.length-1;k>=0;k--){const d=deb[k];if(d.D.live.indexOf(d)<0){deb.splice(k,1);continue;}
      d.vy-=9.8*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.z+=d.vz*dt;d.an+=d.sp*dt;const g=(wetAt(d.x,d.z)?hAt(d.x,d.z):W.gAt(d.x,d.z))+d.s*.3;
      if(d.y<g){d.y=g;if(wetAt(d.x,d.z)&&Math.abs(d.vy)>3)splash(d.x,d.z,false);if(Math.abs(d.vy)<1.6&&d.vx*d.vx+d.vz*d.vz<1){d.rest=true;deb.splice(k,1);}d.vy=-d.vy*.32;const gx=(hAt(d.x+1,d.z)-hAt(d.x-1,d.z))*.5,gz=(hAt(d.x,d.z+1)-hAt(d.x,d.z-1))*.5;d.vx=d.vx*.55-gx*2;d.vz=d.vz*.55-gz*2;d.sp*=.5;}
      if(d.s>.45&&d.vy*d.vy+d.vx*d.vx>30&&Math.random()<dt*9)puff(d.x,d.y,d.z,{c:[.42,.38,.3],s0:d.s,s1:d.s*4,life:1.6,op:.35});
      putDeb(d);}
    // a tank shoves what lies in its way
    if(Math.abs(P.v)>.5)for(const kind in DEB)for(const d of DEB[kind].live)if(d.rest&&!d.pin){const dx=d.x-P.x,dz=d.z-P.z;if(dx*dx+dz*dz<7){d.rest=false;d.vx=-Math.sin(P.yaw)*P.v*1.1+dx;d.vz=-Math.cos(P.yaw)*P.v*1.1+dz;d.vy=1.5+Math.random()*2;d.sp=(Math.random()-.5)*10;deb.push(d);}}}
  // ---- things: every placed model, by what it is
  //  b a building that takes hits and comes down · t a tower that falls · p a post that is knocked flat · l a loose thing that is thrown · c a car · w a wall that breaks · r a rock that shatters · R a great rock that splits · s what only scars
  const KIND={barn:'b5',h6:'b6',row:'b8',h9:'b6',shop:'b6',cork:'b6',flats:'b10',white:'b6',cottage:'b5',villa:'b6',mill:'b14',works:'b10',church:'b12',silos:'b8',watertower:'t3',stacks:'t5',mast:'t3',pylon:'t3',
    pole:'p1',lamp:'p1',dead:'p1',busstop:'l1',hay:'l1',log:'l1',ammobox:'l1',trabant:'c1',lada:'c1',van:'c1',tractor:'c2',truck:'c2',stonewall:'w1',brokenwall:'w1',bags:'w1',rockS:'r1',rockB:'R3',crag:'s9',hog:'s9',wreck:'s9',cars:'s9',rubble:'s9'};
  const moving=[],fires=[];
  for(const t of ITEMS){const k=KIND[t.name]||'s9';t.cls=k[0];t.hp=+k.slice(1);if(t.name==='rockB')t.hp=Math.max(3,Math.round(t[3]*.9));if(t.name==='crag'){t.cls='R';t.hp=Math.round(8+t[3]*3);}t.hp0=t.hp;t.shr=1;t.h=t.so?t.so[0].h:1.5;t.id=ITEMS.indexOf(t);t.y=hAt(t[0],t[1]);if(t.keep)t.cls='s';if(t.so)for(const o of t.so)o.soft='plwc'.includes(t.cls)||t.cls==='r'&&t[3]<1.1;}
  // one thing's drawn instances, set from where it is, how it is turned and tipped, and how tall it still stands
  function setItem(t,x,y,z,ry,tipAx,tip,sy=1,sink=0){
    dm.position.set(x,y+(t[4]||0)-sink,z);q1.setFromAxisAngle(UP,ry);if(tip){v1.set(Math.cos(tipAx),0,Math.sin(tipAx));dm.quaternion.setFromAxisAngle(v1,tip).multiply(q1);}else dm.quaternion.copy(q1);
    {const k=t.shr||1;dm.scale.set(t[3]*k,t[3]*(t[6]||1)*sy*k,t[3]*k);}dm.updateMatrix();if(t[5]&&!tip)dm.matrix.multiply(m5.makeRotationZ(t[5]));
    for(let i=0;i<t.im.length;i+=3){t.im[i].setMatrixAt(t.im[i+1],m4.multiplyMatrices(dm.matrix,t.im[i+2]));t.im[i].instanceMatrix.needsUpdate=true;}}
  const _c=new T.Color();
  function tint(t,k){for(let i=0;i<t.im.length;i+=3){t.im[i].setColorAt(t.im[i+1],_c.setScalar(k));t.im[i].instanceColor.needsUpdate=true;}}
  function unsolid(t){if(t.so)for(const o of t.so){const i=solids.indexOf(o);if(i>=0)solids.splice(i,1);}t.so=null;}
  function dustUp(x,y,z,n,r,c=[.5,.47,.42]){for(let i=0;i<n;i++){const a=Math.random()*6.28,d=Math.random()*r;puff(x+Math.cos(a)*d,y+Math.random()*r*.6,z+Math.sin(a)*d,{c,s0:3,s1:9+Math.random()*r,life:3+Math.random()*3,vx:Math.cos(a)*1.5,vz:Math.sin(a)*1.5,vy:.6+Math.random(),op:.7});}}
  // a thing takes a knock: how hard, and which way it came
  function hitItem(t,power,dx,dz,px,py,pz){
    if(t.gone||t.cls==='s')return false;const x=t[0],z=t[1],y=t.y;
    if(t.cls==='b'||t.cls==='t'||t.cls==='R'){t.hp-=power;tint(t,Math.max(.35,.55+.45*t.hp/t.hp0));
      if(t.cls==='R'){const big=t[3]*(t.name==='crag'?2:1);burst('stone',px,py,pz,4+Math.round(big*power),5+big*.5,.2,Math.max(.5,big*.22),-dx*.35,-dz*.35);dustUp(px,py,pz,3+Math.round(big*.4),big*.8,[.55,.52,.47]);
        if(t.hp>0){t.shr=.5+.5*t.hp/t.hp0;setItem(t,x,y,z,t[2],0,0);if(t.so)for(const o of t.so)o.r=o.r0*(.6+.4*t.shr);}
        if(t.hp<=0){t.gone=true;unsolid(t);setItem(t,x,y,z,t[2],0,0,.001,5);burst('stone',x,y+big*.5,z,14+Math.round(big*3),8+big*.5,.4,Math.max(.8,big*.42));dustUp(x,y+1,z,8+Math.round(big),big*2,[.55,.52,.47]);if(!W.quiet)play('boom',clamp(.6/(1+distTo(x,z)/90),0,.6),'out',distTo(x,z)/340,.7);}return true;}
      burst(t.name==='barn'||t.name==='watertower'||t.name==='mast'||t.name==='pylon'?'wood':'brick',px,py,pz,10,7,.2,.6,-dx*.4,-dz*.4);dustUp(px,py,pz,4,3);
      if(t.hp<=0){t.gone=true;t.fall={t:0,dx,dz,ax:Math.atan2(-dx,dz)};moving.push(t);if(!W.quiet){play('boom',clamp(1/(1+distTo(x,z)/120),0,1),'out',distTo(x,z)/340,.55);play('thump',clamp(.8/(1+distTo(x,z)/60),0,.8),'out',distTo(x,z)/340+.5,.6);}}
      return true;}
    if(t.cls==='w'||t.cls==='r'){t.gone=true;unsolid(t);setItem(t,x,y,z,t[2],0,0,.001,5);const st=t.name==='bags'?'wood':'stone';burst(st,x,y+.5,z,t.cls==='r'?10:14,3+power*3,.25,t.cls==='r'?t[3]*.5:.55,dx*.5,dz*.5);dustUp(x,y+.5,z,3,2,t.name==='bags'?[.6,.55,.42]:[.5,.47,.42]);if(!W.quiet)play('thump',clamp(.7/(1+distTo(x,z)/40),0,.7),'out',0,1.3);return true;}
    if(t.cls==='p'){if(t.body)return true;unsolid(t);t.body={topple:1,ax:Math.atan2(-dx,dz),an:0,w:.6+power};moving.push(t);if(!W.quiet)play('clang',clamp(.5/(1+distTo(x,z)/30),0,.5),'out',0,.7);return true;}
    // loose things and cars: thrown, to tumble and come to rest; a car that is shelled burns
    unsolid(t);const m=t.cls==='c'?(t.hp>1?3:1.8):1,v=Math.min(16,(4+power*7)/m);if(!t.body){t.body={x,y:y+t.h*.4,z,vx:0,vy:0,vz:0,ax:0,an:0,sp:0};moving.push(t);}
    const b=t.body;b.vx+=dx*v;b.vz+=dz*v;b.vy+=v*.55+1;b.ax=Math.atan2(-dx,dz);b.sp=(2+Math.random()*4)*(power>.6?1:.4)/m;b.rest=false;if(moving.indexOf(t)<0)moving.push(t);
    if(power>=1){if(t.cls==='c'&&!t.burnt){t.burnt=1;tint(t,.16);fires.push({x:()=>t.body.x,y:()=>t.body.y,z:()=>t.body.z,t:26});}if(t.name==='hay'||t.name==='log'){tint(t,.3);burst('wood',x,y+1,z,10,6,.15,.5);}}
    return true;}
  function updateItems(dt){
    for(let k=moving.length-1;k>=0;k--){const t=moving[k];
      if(t.fall){const f=t.fall;f.t+=dt;
        if(t.cls==='t'){f.w=(f.w||.05)+dt*.9*Math.sin(Math.max(.05,f.an||0)+.1);f.an=(f.an||0)+f.w*dt;if(f.an>=1.5){f.an=1.5;moving.splice(k,1);unsolid(t);dustUp(t[0]+f.dx*t.h*.6,t.y+1,t[1]+f.dz*t.h*.6,14,t.h*.5);burst('brick',t[0]+f.dx*t.h*.5,t.y+1,t[1]+f.dz*t.h*.5,16,5,.3,1);P.shake=Math.max(P.shake,clamp(1.2-distTo(t[0],t[1])/80,0,1));stamp(t[0]+f.dx*t.h*.5,t[1]+f.dz*t.h*.5,t.h*.5,.6,0,1,Math.atan2(f.dz,f.dx),.25);}
          setItem(t,t[0],t.y,t[1],t[2],f.ax,f.an);}
        else{const k2=Math.min(1,f.t/2.6),e=k2*k2;if(Math.random()<dt*14)dustUp(t[0],t.y+t.h*(1-e)*.5,t[1],1,t.so?t.so[0].r:5);
          setItem(t,t[0]+(Math.random()-.5)*.12*(1-k2),t.y,t[1]+(Math.random()-.5)*.12*(1-k2),t[2],f.ax,e*.12,1-e*.8,e*t.h*.1);
          if(k2>=1){moving.splice(k,1);const r=t.so?t.so[0].r:5;if(t.so)for(const o of t.so){o.h=Math.max(2,t.h*.2);}burst('brick',t[0],t.y+2,t[1],30,8,.4,1.3);dustUp(t[0],t.y+2,t[1],22,r*1.6);stamp(t[0],t[1],r*2.2,.7,0,.9);tint(t,.4);P.shake=Math.max(P.shake,clamp(1.4-distTo(t[0],t[1])/90,0,1.2));if(W.onFall)W.onFall(t);}}
        continue;}
      const b=t.body;if(!b){moving.splice(k,1);continue;}
      if(b.topple){b.w+=dt*2.2*Math.sin(b.an+.15);b.an+=b.w*dt;if(b.an>=1.5){b.an=1.5;moving.splice(k,1);dustUp(t[0],t.y+.3,t[1],2,2);}setItem(t,t[0],t.y,t[1],t[2],b.ax,b.an);continue;}
      b.vy-=9.8*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.an+=b.sp*dt;const wet=wetAt(b.x,b.z),g=(wet?hAt(b.x,b.z):W.gAt(b.x,b.z))+.05;
      if(b.y<g){if(wet&&Math.abs(b.vy)>2)splash(b.x,b.z,true);b.y=g;if(Math.abs(b.vy)>2.5){if(!W.quiet)play('thump',clamp(.6/(1+distTo(b.x,b.z)/40),0,.6),'out',0,.8+Math.random()*.4);dustUp(b.x,b.y,b.z,2,1.5);}b.vy=-b.vy*.28;b.vx*=.6;b.vz*=.6;b.sp*=.55;
        const q=Math.PI/2,near=Math.round(b.an/q)*q;b.an+=(near-b.an)*.5;if(Math.abs(b.vy)<1.2&&b.vx*b.vx+b.vz*b.vz<.5){b.an=near;b.vx=b.vy=b.vz=b.sp=0;b.rest=true;moving.splice(k,1);t[0]=b.x;t[1]=b.z;t.y=b.y;}}
      setItem(t,b.x,b.y-(b.rest?0:0),b.z,t[2],b.ax,b.an);}
    for(let k=fires.length-1;k>=0;k--){const f=fires[k];f.t-=dt;if(f.t<=0){fires.splice(k,1);continue;}const x=f.x(),y=f.y(),z=f.z();if(distTo(x,z)>900)continue;fireNear=Math.min(fireNear,distTo(x,z));
      if(Math.random()<dt*7)puff(x+(Math.random()-.5),y+1,z+(Math.random()-.5),{add:true,c:[2.6,1,.3],s0:.8,s1:2.6,life:.5,vy:2.2});if(Math.random()<dt*4)puff(x,y+1.6,z,{c:[.05,.05,.05],s0:1.5,s1:9,life:4,vy:3,vx:1,op:.7});}}
  // a tank pushing on a thing: true if it gives way
  W.ram=(o,v,yaw)=>{const t=o.it;if(!t||!o.soft||t.gone||Math.abs(v)<1.2)return false;const s=v<0?-1:1;if(t.cls==='c'&&Math.abs(v)<3)return false;hitItem(t,Math.min(.5,Math.abs(v)*.05),-Math.sin(yaw)*s,-Math.cos(yaw)*s,t[0],t.y+1,t[1]);if(W.send)W.send({t:'ram',i:t.id,d:[-Math.sin(yaw)*s,-Math.cos(yaw)*s]});return true;};
  W.ramBy=(i,d)=>{const t=ITEMS[i];if(t)hitItem(t,.4,d[0],d[1],t[0],t.y+1,t[1]);};
  // where along its way a shell meets a building's real walls: the point and the wall's face, or null if it passes
  const ray=new T.Raycaster(),tmp=new T.Mesh(new T.BufferGeometry(),new T.MeshBasicMaterial({side:T.DoubleSide})),hits=[];
  function wallHit(t,from,dir,far){ray.set(from,dir);ray.far=far;hits.length=0;for(let i=0;i<t.im.length;i+=3){t.im[i].getMatrixAt(t.im[i+1],tmp.matrixWorld);tmp.geometry=t.im[i].geometry;tmp.raycast(ray,hits);}
    if(!hits.length)return null;hits.sort((a,b)=>a.distance-b.distance);const h=hits[0];h.n=h.face.normal.clone().transformDirection(tmp.matrixWorld);if(h.n.dot(dir)>0)h.n.negate();return h;}
  // ---- scorch marks on walls
  const DCN=48,decal=new T.InstancedMesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:softT,color:0x050505,transparent:true,opacity:.92,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),DCN);decal.count=0;decal.frustumCulled=false;scene.add(decal);let dcI=0;const decOf=[];
  function scorch(p,n,s,t){const i=dcI++%DCN;decal.count=Math.min(DCN,Math.max(decal.count,i+1));dm.position.copy(p).addScaledVector(n,.06);dm.quaternion.setFromUnitVectors(v1.set(0,0,1),n);dm.scale.setScalar(s);dm.updateMatrix();decal.setMatrixAt(i,dm.matrix);decal.instanceMatrix.needsUpdate=true;decOf[i]=t;}
  W.onFall=t=>{for(let i=0;i<DCN;i++)if(decOf[i]===t){decOf[i]=null;dm.scale.setScalar(0);dm.updateMatrix();decal.setMatrixAt(i,dm.matrix);decal.instanceMatrix.needsUpdate=true;}if(W.fell)W.fell(t);};
  // a shell inside a thing's ring: true if it stops there
  W.shellAt=(s,o)=>{const t=o.it;if(t.gone&&t.cls!=='b')return false;const sp=s.v.length(),big=s.kind==='H';v2.copy(s.v).multiplyScalar(1/sp);
    if(t.cls==='b'&&!t.gone){if(s.pass===t)return false;v3.copy(s.p).addScaledVector(v2,-(o.r*2+6));const h=wallHit(t,v3,v2,o.r*4+14);if(!h){s.pass=t;return false;}
      s.p.copy(h.point);scorch(h.point,h.n,big?4.5:2.2,t);explode(h.point.x,h.point.y,h.point.z,big,false,true);hitItem(t,big?3:1,v2.x,v2.z,h.point.x,h.point.y,h.point.z);return true;}
    if(t.cls==='b'){if(s.p.y>hAt(o.x,o.z)+o.h)return false;explode(s.p.x,s.p.y,s.p.z,big,true);return true;}
    explode(s.p.x,s.p.y,s.p.z,big,false,true);hitItem(t,big?3:1.5,v2.x,v2.z,s.p.x,s.p.y,s.p.z);return big||!(t.cls==='p'||t.cls==='w');};
  // ---- trees: felled by a blast, a shell or a tank; blown apart by a direct hit
  const TG=new Map(),tkey=(x,z)=>((x/24|0)+64)*256+((z/24|0)+64),falling=[];
  for(const t of TREEL){const k=tkey(t[0]+1536,t[1]+1536);(TG.get(k)||TG.set(k,[]).get(k)).push(t);t.small=t.k===5||t.h<5;t.big=t.h>36;}
  function treesNear(x,z,r,fn){const a=(x+1536-r)/24|0,b=(x+1536+r)/24|0,c=(z+1536-r)/24|0,d=(z+1536+r)/24|0;for(let i=a;i<=b;i++)for(let j=c;j<=d;j++){const l=TG.get((i+64)*256+(j+64));if(l)for(const t of l)if(!t.dead){const dx=t[0]-x,dz=t[1]-z;if(dx*dx+dz*dz<r*r)fn(t,Math.sqrt(dx*dx+dz*dz));}}}
  // trees in the round: each kind keeps a pool of solid trees (trunk, limbs, a leafy crown with depth) for those within sight, and a few with their twigs and separate leaves for the nearest; a tree takes one as you come near and gives it back as you leave
  const T3=[],T3N=60,T0N=6,ZERO=new T.Matrix4().makeScale(0,0,0),LMT=PACK.leafMass();
  const pool=(g,m,n,cast)=>{const im=new T.InstancedMesh(g,m,n);for(let i=0;i<n;i++)im.setMatrixAt(i,ZERO);im.instanceColor=new T.InstancedBufferAttribute(new Float32Array(n*3).fill(1),3);im.frustumCulled=false;im.castShadow=cast;im.receiveShadow=true;land.add(im);return im;};
  TREES.forEach((n,k)=>{if(n[0]!=='PK')return;const M3=PACK.model(n[1]),bk=A0.bark.clone();bk.wrapS=bk.wrapT=T.RepeatWrapping;bk.needsUpdate=true;
    const crownM=new T.MeshLambertMaterial({map:LMT,vertexColors:true,alphaTest:.42,side:T.DoubleSide,color:new T.Color(3.2,3.2,3)});
    T3[k]={wood:pool(M3.wood,new T.MeshLambertMaterial({map:bk,color:new T.Color(.95,.86,.78)}),T3N,true),leaf:pool(M3.crown,crownM,T3N,true),free:Array.from({length:T3N},(_,i)=>i),
      twig:pool(M3.twig,new T.MeshLambertMaterial({color:new T.Color(.05,.04,.03),side:T.DoubleSide}),T0N,false),fine:pool(M3.leaf,new T.MeshLambertMaterial({map:PACK.leafOne(),vertexColors:true,alphaTest:.5,side:T.DoubleSide,color:new T.Color(2.4,2.4,2.2)}),T0N,false),free0:Array.from({length:T0N},(_,i)=>i),base:M3.base};});
  function setTree(t,ax,an,sc=1){if(ax!==undefined){t.cax=ax;t.can=an;t.csc=sc;}dm.position.set(t[0],hAt(t[0],t[1]),t[1]);q1.setFromAxisAngle(UP,t[3]);if(an){v1.set(Math.cos(ax),0,Math.sin(ax));dm.quaternion.setFromAxisAngle(v1,an).multiply(q1);}else dm.quaternion.copy(q1);dm.scale.setScalar(t[2]*sc);dm.updateMatrix();const in3=t.s3!=null;for(let i=0;i<t.im.length;i+=2){t.im[i].setMatrixAt(t.im[i+1],in3?ZERO:dm.matrix);t.im[i].instanceMatrix.needsUpdate=true;}
    if(in3){const K=T3[t.k];dm.scale.setScalar(t.h*sc);dm.updateMatrix();K.wood.setMatrixAt(t.s3,dm.matrix);K.leaf.setMatrixAt(t.s3,dm.matrix);K.wood.instanceMatrix.needsUpdate=K.leaf.instanceMatrix.needsUpdate=true;if(t.s0!=null){K.twig.setMatrixAt(t.s0,dm.matrix);K.fine.setMatrixAt(t.s0,dm.matrix);K.twig.instanceMatrix.needsUpdate=K.fine.instanceMatrix.needsUpdate=true;}}}
  let lodI=0;function updateLod(){const N=TREEL.length;for(let c=0;c<220&&N;c++){const t=TREEL[lodI=(lodI+1)%N],K=T3[t.k];if(!K)continue;const d=Math.hypot(t[0]-P.x,t[1]-P.z),want=t.dead!==2&&d<(t.s3!=null?235:215),fine=want&&d<(t.s0!=null?52:42);
      if(want&&t.s3==null&&K.free.length){t.s3=K.free.pop();K.leaf.setColorAt(t.s3,_c.setScalar(t.burn?.25:1));K.leaf.instanceColor.needsUpdate=true;setTree(t,t.cax||0,t.can||0,t.csc==null?1:t.csc);}
      if(t.s3!=null&&fine&&t.s0==null&&K.free0.length){t.s0=K.free0.pop();K.fine.setColorAt(t.s0,_c.setScalar(t.burn?.25:1));K.fine.instanceColor.needsUpdate=true;setTree(t,t.cax||0,t.can||0,t.csc==null?1:t.csc);}
      if(t.s0!=null&&(!fine||t.s3==null)){const i=t.s0;t.s0=null;K.twig.setMatrixAt(i,ZERO);K.fine.setMatrixAt(i,ZERO);K.twig.instanceMatrix.needsUpdate=K.fine.instanceMatrix.needsUpdate=true;K.free0.push(i);}
      if(!want&&t.s3!=null){const i=t.s3;t.s3=null;K.wood.setMatrixAt(i,ZERO);K.leaf.setMatrixAt(i,ZERO);K.wood.instanceMatrix.needsUpdate=K.leaf.instanceMatrix.needsUpdate=true;K.free.push(i);if(t.dead!==2)setTree(t,t.cax||0,t.can||0,t.csc==null?1:t.csc);}}}
  const BN=90,BIM=(()=>{const im=new T.InstancedMesh(PACK.clump(),new T.MeshLambertMaterial({map:LMT,alphaTest:.4,side:T.DoubleSide,color:new T.Color(3,3,2.8)}),BN);im.count=0;im.instanceColor=new T.InstancedBufferAttribute(new Float32Array(BN*3).fill(1),3);im.frustumCulled=false;im.receiveShadow=true;scene.add(im);return im;})(),boughs=[];let bn=0;
  function bough(t,x,y,z,vx,vy,vz,s){const K=T3[t.k],i=bn++%BN;BIM.count=Math.min(BN,Math.max(BIM.count,i+1));const b=K?K.base:[.06,.12,.03];BIM.setColorAt(i,_c.setRGB(b[0]*.8,b[1]*.8,b[2]*.8));BIM.instanceColor.needsUpdate=true;
    const old=boughs.findIndex(q=>q.i===i);if(old>=0)boughs.splice(old,1);boughs.push({i,x,y,z,vx,vy,vz,s:s*.55,ry:Math.random()*6.28,tip:Math.random()*6,sp:(Math.random()-.5)*5,rest:false});}
  function leaves(t,n,y0){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=1+Math.random()*4;puff(t[0]+(Math.random()-.5)*t.h*.3,y0+Math.random()*t.h*.4,t[1]+(Math.random()-.5)*t.h*.3,{c:[.2+Math.random()*.08,.3+Math.random()*.1,.12],s0:.5+Math.random()*.5,s1:.35,life:3.5+Math.random()*3,vx:Math.cos(a)*v,vz:Math.sin(a)*v,vy:1+Math.random()*4,g:2.2,heat:0,op:.9});}}
  function updateBoughs(dt){for(const b of boughs){if(b.rest)continue;b.vy-=9.8*dt;const dr=Math.min(1,dt*1.3);b.vx-=b.vx*dr;b.vy-=b.vy*dr;b.vz-=b.vz*dr;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.tip+=b.sp*dt;const g=W.gAt(b.x,b.z)+b.s*.12;
      if(b.y<g){b.y=g;b.rest=true;b.tip=(Math.random()-.5)*.4;if(wetAt(b.x,b.z))splash(b.x,b.z,false);}
      dm.position.set(b.x,b.y,b.z);dm.rotation.set(b.tip,b.ry,0);dm.scale.setScalar(b.s);dm.updateMatrix();dm.rotation.set(0,0,0);BIM.setMatrixAt(b.i,dm.matrix);BIM.instanceMatrix.needsUpdate=true;}}
  function fell(t,dx,dz,burn,flat){if(t.dead)return;t.dead=1;const l=Math.hypot(dx,dz)||1;t.fx=dx/l;t.fz=dz/l;t.ax=Math.atan2(-t.fx,t.fz);t.an=0;t.w=flat?2.5:.5;falling.push(t);
    if(burn){t.burn=1;for(let i=0;i<t.im.length;i+=2){t.im[i].setColorAt(t.im[i+1],_c.setRGB(.2,.17,.14));t.im[i].instanceColor.needsUpdate=true;}if(t.s3!=null){T3[t.k].leaf.setColorAt(t.s3,_c.setScalar(.25));T3[t.k].leaf.instanceColor.needsUpdate=true;}if(t.s0!=null){T3[t.k].fine.setColorAt(t.s0,_c.setScalar(.25));T3[t.k].fine.instanceColor.needsUpdate=true;}}
    if(!W.quiet&&!flat)play('rico',clamp(.4/(1+distTo(t[0],t[1])/50),0,.4),'out',0,.45);for(let i=0;i<3;i++)puff(t[0],hAt(t[0],t[1])+t.h*.6,t[1],{c:[.22,.3,.14],s0:1.5,s1:t.h*.7,life:1.6,vx:(Math.random()-.5)*3,vz:(Math.random()-.5)*3,vy:1,op:.6});}
  // a tree blown apart: a splintered stump left standing, lengths of its trunk and limbs thrown, its boughs torn off and falling, leaves coming down after
  function shatter(t){if(t.dead)return;t.dead=2;setTree(t,0,0,.0001);const y=hAt(t[0],t[1]),h=t.h;if(W.quiet)return;
    if(t.small){burst('wood',t[0],y+.5,t[1],4,5,.12,.35);leaves(t,5,y+.5);return;}
    chunk('wood',t[0],y+h*.03,t[1],0,0,0,h*.045,true);burst('wood',t[0],y+h*.3,t[1],3+Math.round(h/7),7+h*.12,h*.022,h*.05);burst('wood',t[0],y+h*.25,t[1],9,9,.12,.4);
    for(let i=0;i<5+Math.round(h/5);i++){const a=Math.random()*6.28,v=3+Math.random()*7;bough(t,t[0]+Math.cos(a)*h*.1,y+h*(.45+Math.random()*.45),t[1]+Math.sin(a)*h*.1,Math.cos(a)*v,3+Math.random()*7,Math.sin(a)*v,h*(.16+Math.random()*.14));}
    leaves(t,16,y+h*.4);dustUp(t[0],y+1,t[1],4,h*.15,[.4,.34,.26]);}
  function updateTrees(dt){for(let k=falling.length-1;k>=0;k--){const t=falling[k];t.w+=dt*2.4*Math.sin(t.an+.2);t.an+=t.w*dt;if(t.an>=1.48){t.an=1.48;falling.splice(k,1);if(!t.small){const gy=hAt(t[0],t[1]);for(let i=0;i<3;i++){const u=.5+Math.random()*.5;bough(t,t[0]+t.fx*t.h*u,gy+1.5,t[1]+t.fz*t.h*u,t.fx*3+(Math.random()-.5)*4,2+Math.random()*3,t.fz*3+(Math.random()-.5)*4,t.h*(.14+Math.random()*.1));}leaves({0:t[0]+t.fx*t.h*.7,1:t[1]+t.fz*t.h*.7,h:t.h},8,gy+1);dustUp(t[0]+t.fx*t.h*.5,hAt(t[0],t[1])+.5,t[1]+t.fz*t.h*.5,3,3);stamp(t[0]+t.fx*t.h*.5,t[1]+t.fz*t.h*.5,t.h*.45,0,0,1,Math.atan2(t.fz,t.fx),.3);if(!W.quiet)play('thump',clamp(.5/(1+distTo(t[0],t[1])/40),0,.5),'out',0,.7);}}setTree(t,t.ax,t.an);}}
  // a shell flying through the trees: SABOT goes through and brings one down, HEAT bursts on the trunk
  W.shellTree=s=>{let hit=null;treesNear(s.p.x,s.p.z,2.2,(t,d)=>{if(!hit&&d<.5+t[2]*.35&&s.p.y<hAt(t[0],t[1])+t.h*.8&&s.pt!==t)hit=t;});if(!hit)return false;
    if(s.kind==='H'){if(hit.big&&!hit.hurt){hit.hurt=1;burst('wood',s.p.x,s.p.y,s.p.z,12,8,.3,1);}else shatter(hit);explode(s.p.x,s.p.y,s.p.z,true,false);return true;}if(hit.big){s.pt=hit;burst('wood',s.p.x,s.p.y,s.p.z,5,6,.15,.5);return false;}fell(hit,s.v.x,s.v.z,false);burst('wood',s.p.x,s.p.y,s.p.z,5,6,.15,.5);return false;};
  // a tank among the trees: hedges and saplings go flat under it, a grown tree comes down if you hit it at speed, and stops you if you do not
  W.tankTrees=(x,z,yaw,v,mine)=>{let block=false;if(Math.abs(v)<.3)return false;treesNear(x,z,2.6,t=>{const s=v<0?-1:1;if(t.big){block=true;return;}if(t.small||Math.abs(v)>3.2){fell(t,-Math.sin(yaw)*s,-Math.cos(yaw)*s,false,t.small);if(mine&&!t.small){P.v*=.55;P.shake=Math.max(P.shake,.5);haptic(.5,90);play('thump',.6);}}else block=true;});return block;};
  // ---- what a blast does around it
  // every explosion comes here: a crater or a splash, the burn, the trees, the things
  W.scar=(x,y,z,big,dirt)=>{
    if(!W.on)return;const g=hAt(x,z),low=y-g<2.2,wet=wetAt(x,z);
    if(low){if(wet)splash(x,z,big);else if(dirt)crater(x,z,big?3.4:2.1);else stamp(x,z,big?7:3.5,.85,0,.3);
      if(!wet&&dirt)burst('stone',x,g+.3,z,big?8:4,big?9:6,.12,.4);}
    const R=big?13:6;treesNear(x,z,R,(t,d)=>{if(t.big){if(big&&d<3){if(t.hurt)shatter(t);else t.hurt=1;}return;}if(d<(big?4:2.2))shatter(t);else if(d<R*(.55+.45*hsh(t[0],t[1])))fell(t,t[0]-x,t[1]-z,d<R*.5);});
    for(const o of solids.slice()){const t=o.it;if(!t||t.gone)continue;const d=Math.hypot(o.x-x,o.z-z)-o.r;if(d>R)continue;const dx=(o.x-x)/(d+o.r+.01),dz=(o.z-z)/(d+o.r+.01),k=1-Math.max(0,d)/R;
      if(t.cls==='b'||t.cls==='t'||t.cls==='R'){if(d<1.5&&big&&dirt)hitItem(t,1,dx,dz,o.x-dx*o.r,g+1.5,o.z-dz*o.r);}else if(k>.35||'lc'.includes(t.cls))hitItem(t,k*(big?1.6:.9),dx,dz,o.x,g+1,o.z);}
    for(const kind in DEB)for(const d of DEB[kind].live)if(d.rest&&!d.pin){const dx=d.x-x,dz=d.z-z,l=Math.hypot(dx,dz);if(l<R*.7){d.rest=false;const v=(1-l/R)*(big?11:6);d.vx=dx/(l+.1)*v;d.vz=dz/(l+.1)*v;d.vy=v*.8;d.sp=(Math.random()-.5)*12;deb.push(d);}}
    if(low&&!wet&&field(x,z).kind===1&&big&&fires.length<5)fires.push({x:()=>x,y:()=>g,z:()=>z,t:9});};
  // the tracks' ruts, laid as a tank moves
  W.rut=(o,x,z,yaw)=>{if(o.rx==null){o.rx=x;o.rz=z;return;}const d=Math.hypot(x-o.rx,z-o.rz);if(d<1.3)return;const a=Math.atan2(z-o.rz,x-o.rx);for(const s of[-1.45,1.45])stamp((x+o.rx)/2+Math.cos(yaw)*s,(z+o.rz)/2-Math.sin(yaw)*s,d*.62,0,0,.9,a,.62/(d*.62));stamp((x+o.rx)/2,(z+o.rz)/2,d*.7,0,0,.45,a,2.1/(d*.7));o.rx=x;o.rz=z;};
  W.update=dt=>{updateDebris(dt);updateItems(dt);updateTrees(dt);updateBoughs(dt);updateLod();flushStamps();};
  // everything put back as it was
  W.reset=()=>{
    W.quiet=true;craters.length=0;bowl.count=0;sq.length=eq.length=0;gsClean=false;W.rings.length=0;fires.length=0;moving.length=0;falling.length=0;deb.length=0;for(const k in DEB){DEB[k].im.count=0;DEB[k].n=0;DEB[k].live.length=0;}boughs.length=0;BIM.count=0;bn=0;decal.count=0;dcI=0;decOf.length=0;
    for(const t of ITEMS){if(!t.gone&&!t.body&&!t.burnt&&t.hp===t.hp0)continue;t.gone=false;t.body=null;t.fall=null;t.burnt=0;t.hp=t.hp0;t.shr=1;if(t.x0!=null){t[0]=t.x0;t[1]=t.z0;}t.y=hAt(t[0],t[1]);setItem(t,t[0],t.y,t[1],t[2],0,0);tint(t,1);
      if(t.so0&&!t.so){t.so=t.so0;for(const o of t.so){o.h=o.h0;o.r=o.r0;if(solids.indexOf(o)<0)solids.push(o);}}else if(t.so)for(const o of t.so){o.h=o.h0;o.r=o.r0;}}
    for(const t of TREEL)if(t.dead||t.hurt){t.dead=0;t.hurt=0;t.burn=0;setTree(t,0,0);if(t.s3!=null){T3[t.k].leaf.setColorAt(t.s3,_c.setScalar(1));T3[t.k].leaf.instanceColor.needsUpdate=true;}for(let i=0;i<t.im.length;i+=2){t.im[i].setColorAt(t.im[i+1],_c.setScalar(1));t.im[i].instanceColor.needsUpdate=true;}}
    W.quiet=false;};
  for(const t of ITEMS){t.x0=t[0];t.z0=t[1];t.so0=t.so;if(t.so)for(const o of t.so){o.h0=o.h;o.r0=o.r;}}
  W.boughs=boughs;W.items=ITEMS;W.trees=TREEL;W.hitItem=hitItem;W.fell=null;W.debris=DEB;W.moving=moving;W.fires=fires;W.falling=falling;
  return W;
})();
