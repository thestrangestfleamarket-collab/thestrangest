// ---- THE DRUMMER (owner, 17 Oct 2026, the bar "with all musicians"): the game's own octopus drummer, brought over whole (its files read by
// build.py from the game: 47-zzz-bar-octopus-1-body, -2-play, with the music engine 47-music-1, -2 for his kit): the tank's octopus as a puppet,
// a little bigger than a big real one, purple, the eyes behind black sunglasses, a charcoal beanie pulled down on the mantle, eight arms from
// under the head: two with the sticks, two more sticks at his sides, one on the kick's pedal, one on the hi-hat's, one with his cigar, one with
// a glass of water (real water: its surface sloshing as the glass moves). He sits at the kit on the stored bar's stage (STORE.bar.drums) and
// plays his own set (rock, funk, a swing on the ride, a bossa on the rim, a solo), each hit a real one on the kit's physics (the engine's heads
// and cymbals by their modes, an AudioWorklet) and in the arm that makes it (the stick up before, down at the hit, up off it), heard from where
// he sits, louder as you come near. Here his body's parts (the game's ellipsoids: place, size, turn, colour) are instances of one sphere, set
// each frame, coloured from his palette, lit by the lamps; while it's his turn on the stage (bandstand.js) ----
const DRM={}; STORE.DRM=DRM;   // (a test's reach)
{ const S=STORE.bar, AT={x:BOD.X(S.drums.x),z:BOD.Z(S.drums.y-OCTBK),hd:0,y:BOD.Y(S.stage.z)}, g=new THREE.Group(); MAPG.bodega.add(g); DRM.g=g; DRM.at=AT;
  g.position.set(AT.x,AT.y,AT.z); g.rotation.set(0,AT.hd,0); g.scale.set(1/PPU,ZU,1/PPU);   // (his units the Walker's art px, as the figures')
  // his parts: a pool of instances of one sphere (his frame x forward, y left, z up; here X his left, Y up, Z forward), the dots (the glints on
  // his glasses, the mantle's spots) small ones; a part's colour by its letter in his palette (one painted two ways, the arms' undersides: the first)
  const CAP=160, im=new THREE.InstancedMesh(new THREE.SphereGeometry(1,10,8),new THREE.MeshLambertMaterial({}),CAP); im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.castShadow=true; im.receiveShadow=true; im.frustumCulled=false; g.add(im);
  const col=new THREE.Color(), M4=new THREE.Matrix4(), Q=new THREE.Quaternion(), EU=new THREE.Euler(0,0,0,'YXZ'), P3=new THREE.Vector3(), S3=new THREE.Vector3();
  const place=(i,x,y,z,rx,ry,rz,yaw,pit,rol,c)=>{ P3.set(y,z,x); EU.set(-pit,yaw,rol); Q.setFromEuler(EU); S3.set(ry,rz,rx); M4.compose(P3,Q,S3); im.setMatrixAt(i,M4);
    const k=typeof c==='function'?c(0,0,0):c, rgb=OCTP[k]||OCTP.b; col.setRGB(rgb[0]/255,rgb[1]/255,rgb[2]/255,THREE.SRGBColorSpace); im.setColorAt(i,col); };
  // EACH FRAME you're near (the game's bar tick for him, here): the steps due sent to the kit and to his arms (octStep), his cigar and his
  // sips (octHabits), his pose from his hits (octPose, octArms), his body in it (octBody) set into the instances; his kit heard from where
  // he sits (louder near, from his side)
  const hush=()=>{ const N=IMX.nodes.get('bar|drum kit'); if(N&&SND.ctx)N.g.gain.setTargetAtTime(0,SND.ctx.currentTime,.1); }; DRM.stop=hush;   // (off the stage, or far: his kit silent)
  DRM.tick=dt=>{ const d=Math.hypot(pos.x-AT.x,pos.z-AT.z); if(!DRM.on||!MAPG.bodega.visible||d>18){ hush(); return; } const now=performance.now();
    octStep(dt,now); octHabits(now); const p=octPose(now), A=octArms(p), B=octBody(A); let n=0;
    for(const e of B.E){ if(n>=CAP)break; place(n++,e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8],e[9]); }
    for(const [x,y,z,c] of B.D){ if(n>=CAP)break; place(n++,x,y,z,.7,.7,.7,0,0,0,c); }
    im.count=n; im.instanceMatrix.needsUpdate=true; if(im.instanceColor)im.instanceColor.needsUpdate=true;
    const N=IMX.nodes.get('bar|drum kit'); if(N&&SND.ctx){ const c=SND.ctx, v=new THREE.Vector3(AT.x,1,AT.z).project(cam); N.g.gain.setTargetAtTime(.9*Math.max(0,1-d/14),c.currentTime,.1); N.pan.pan.setTargetAtTime(Math.max(-.8,Math.min(.8,v.x*.8)),c.currentTime,.1); } }; }
