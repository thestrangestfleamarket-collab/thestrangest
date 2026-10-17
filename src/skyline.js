// ---- THE FAR (owner, 17 Oct 2026, his picture of a mountain fading blue into the sky: "how can i make things look realistically far away
// like this mountain? in my game? (it would be buildings)"; "go"): what makes the far look far is the air between: the farther a thing, the
// more it goes the sky's colour at the horizon and loses its contrast. Two pieces, both cheap:
// (1) A HAZE, always on, out in the open: the scene's fog, the horizon's colour (the sky's, paler by day, the deep navy at night; the weather's
//     own FOG, thicker and grey, takes over when it comes), measured from where you stand (not from the camera, which the map views hold 300
//     units back): nothing within HAZE0 tiles of you is touched, and from there it thickens to the full colour at HAZE1 tiles. Zoomed out on
//     the isometric street (34 tiles across) it barely shows; looking down the street from his eyes, the far end goes blue and the skyline behind
//     it fades into the sky. The world's one lit shader already carries it (three.js's fog on every Lambert material: no new program).
// (2) A SKYLINE: two rows of flat buildings round the land's edge, silhouettes only (plain blocks, flat dull colours, no windows, no lights,
//     no shadows cast or caught, nothing solid: out past where you can walk), the back row taller, a few towers; one instanced draw, about
//     3,000 triangles. The haze does the rest: they read as a city blocks away.
// GRAPHICS' DISTANCE HAZE: ON / OFF (kept in the browser); ?far=0 off, ?far=N the haze's full distance in tiles, for a test ----
const FAR3={};
{ const q=QS.get('far'); let on=q!=='0'; try{ if(q==null&&localStorage.getItem('market-haze')==='0')on=false; }catch(e){}
  const HAZE0=22, HAZE1=q&&+q>0?+q:360;   // (tiles: clear to here, the full colour there; the skyline stands at some 205-220)
  const FOG=new THREE.Fog(0x8fa3c0,1,2), fc=new THREE.Color(), pale=new THREE.Color(.74,.84,.98), navy=new THREE.Color(.08,.1,.17), V=new THREE.Vector3();
  FAR3.on=on; FAR3.fog=FOG;
  // THE SKYLINE: along each side of the land's square, a back row 4 tiles in from its edge and a front row 16 tiles in, each building a block
  // (a quarter of them a step narrower at the top: a set-back). Laid out once, the same every time (a hash, no Math.random)
  const LR=MODS.landR, hs=(i,j)=>{ const v=Math.sin(i*12.9898+j*78.233)*43758.5453; return v-Math.floor(v); }, B=[];
  const row=(inset,hmin,hmax,wmin,wmax,tower,k)=>{ const x0=LR.x0+inset, x1=LR.x1-inset, z0=LR.z0+inset, z1=LR.z1-inset; let n=0;
    for(const [ax,fixed,lo,hi] of [['x',z0,x0,x1],['x',z1,x0,x1],['z',x0,z0,z1],['z',x1,z0,z1]]){ let p=lo+hs(n++,k)*6;
      while(p<hi){ const w=wmin+hs(n,k)*(wmax-wmin), d=wmin*.8+hs(n+1,k)*(wmax-wmin)*.6, t=hs(n+2,k)<tower, h=t?hmax*(1.2+hs(n+3,k)*.6):hmin+hs(n+3,k)*(hmax-hmin), g=hs(n+5,k);
        if(p+w>hi)break; const c=p+w/2, x=ax==='x'?c:fixed, z=ax==='x'?fixed:c, sx=ax==='x'?w:d, sz=ax==='x'?d:w, L=.26+g*.16, col=[L*.92,L*.95,L*1.04];   // (dull blue-greys, a little varied)
        B.push([x,z,sx,sz,h,col]); if(hs(n+4,k)<.3)B.push([x,z,sx*.6,sz*.6,h*1.25,col]);   // (a set-back: a narrower block on top)
        p+=w+1.5+hs(n+6,k)*5; n+=7; } } };
  row(4,22,70,7,18,.08,1); row(16,9,34,6,15,0,2);   // (the back row: 22-70 tiles high, towers to 125; the front row lower)
  const geo=new THREE.BoxGeometry(1,1,1).translate(0,.5,0), mat=new THREE.MeshLambertMaterial({color:0xffffff}), me=new THREE.InstancedMesh(geo,mat,B.length), m4=new THREE.Matrix4(), c=new THREE.Color(), y0=-.5*ZU;
  B.forEach(([x,z,sx,sz,h,col],i)=>{ me.setMatrixAt(i,m4.makeScale(sx*TILE,h*TILE,sz*TILE).setPosition(x*TILE,y0,z*TILE)); me.setColorAt(i,c.setRGB(...col)); });
  me.frustumCulled=false; me.visible=on; (MAPG.bodega||scene).add(me); FAR3.mesh=me; FAR3.n=B.length; FAR3.tris=B.length*12;
  // each frame, after the clock and the weather have set the sky: the haze from where you stand, out in the open only
  const tick0=CLOCK.tick; CLOCK.tick=dt=>{ tick0(dt);
    const up=LVL!=='down', inside=!!ROOMS.cur||!up; me.visible=FAR3.on&&up;
    if(!FAR3.on||inside||(scene.fog&&scene.fog!==FOG)){ if(scene.fog===FOG)scene.fog=null; return; }   // (the weather's own fog, when it comes, is thicker: it has the scene)
    const day=Math.max(0,Math.min(1,(CLOCK.elev()+4)/14)), d=-V.copy(pos).applyMatrix4(cam.matrixWorldInverse).z;   // (how deep you stand in the camera's view: the haze starts past you)
    FOG.color.copy(scene.background).lerp(day>0?pale:navy,day>0?.3+.2*day:.45); FOG.near=d+HAZE0*TILE; FOG.far=d+HAZE1*TILE; scene.fog=FOG; };
  // GRAPHICS' DISTANCE HAZE, beside LIGHT GRAIN
  const g=document.querySelector('#dgrain'); if(g){ const b=document.createElement('button'); b.className='btn'; b.id='dhaze'; const draw=()=>{ b.textContent='DISTANCE HAZE '+(FAR3.on?'ON':'OFF'); b.setAttribute('aria-pressed',String(FAR3.on)); };
    b.onclick=()=>{ FAR3.on=!FAR3.on; try{ localStorage.setItem('market-haze',FAR3.on?'1':'0'); }catch(e){} draw(); }; g.after(b); draw(); }
  window.FAR3=FAR3; }
