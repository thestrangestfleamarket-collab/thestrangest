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
{ const q=QS.get('far'); let on=q!=='0'; try{ if(q==null&&localStorage.getItem('market-haze2')==='0')on=false; }catch(e){}
  const HAZE0=26, HAZE1=q&&+q>0?+q:560;   /* (thinner since 17 Oct 2026, owner: "decrease the haze a little bit closer to city so we can see a little bit of the details of the buildings through it") */   // (tiles: clear to here, the full colour there; the skyline stands at some 205-220)
  const FOG=new THREE.Fog(0x8fa3c0,1,2), fc=new THREE.Color(), pale=new THREE.Color(.74,.84,.98), navy=new THREE.Color(.08,.1,.17), V=new THREE.Vector3();
  FAR3.on=on; FAR3.fog=FOG;
  // THE MIST (owner, 18 Oct 2026, of a shot from tests/moodshot.cjs, the park at 5:24 pm in a teal mist: "i like the exact look entier game (no
  // fireflies) just the foggyh misty haze ... in distance, perfect"): the haze made a mist, the default: teal, starting 3 tiles before you
  // (toward the camera) and the full colour 12 past you, so the near is clear and the far melts into it in the fog's flat steps (CEL), no sky dome (the background the mist); the
  // shot's colour at dusk, darker at night, a little paler at high noon. The old far haze is DISTANCE HAZE's FAR (`market-haze` '2'); ?mist=0 the far
  // haze, ?mist=near,far its two distances in tiles for a test. The weather's FOG still takes over when it comes. Cost: nothing (the same fog).
  const mq=QS.get('mist'), mv=(mq||'').split(',').map(Number); let mist=mq!=='0'; try{ if(mq==null&&localStorage.getItem('market-haze2')==='2')mist=false; }catch(e){}
  const MIST0=mv.length===2&&mv.every(isFinite)?mv[0]:4, MIST1=mv.length===2&&mv.every(isFinite)?mv[1]:26, MD=new THREE.Color(0x3a6e68), MN=new THREE.Color(0x152d2c), MH=new THREE.Color(0x4a7f79);
  FAR3.mist=mist;
  // THE SKYLINE: along each side of the land's square, a back row 4 tiles in from its edge and a front row 16 tiles in, each building a block
  // (a quarter of them a step narrower at the top: a set-back). Laid out once, the same every time (a hash, no Math.random)
  const LR=MODS.landR, hs=(i,j)=>{ const v=Math.sin(i*12.9898+j*78.233)*43758.5453; return v-Math.floor(v); }, B=[];
  const row=(inset,hmin,hmax,wmin,wmax,tower,k)=>{ const x0=LR.x0+inset, x1=LR.x1-inset, z0=LR.z0+inset, z1=LR.z1-inset; let n=0;
    for(const [ax,fixed,lo,hi] of [['x',z0,x0,x1],['x',z1,x0,x1],['z',x0,z0,z1],['z',x1,z0,z1]]){ let p=lo+hs(n++,k)*6;
      while(p<hi){ const w=wmin+hs(n,k)*(wmax-wmin), d=wmin*.8+hs(n+1,k)*(wmax-wmin)*.6, t=hs(n+2,k)<tower, h=t?hmax*(1.2+hs(n+3,k)*.6):hmin+hs(n+3,k)*(hmax-hmin), g=hs(n+5,k);
        if(p+w>hi)break; const c=p+w/2, x=ax==='x'?c:fixed, z=ax==='x'?fixed:c, sx=ax==='x'?w:d, sz=ax==='x'?d:w, L=.26+g*.16, col=[L*.92,L*.95,L*1.04];   // (dull blue-greys, a little varied)
        B.push([x,z,sx,sz,h,col]); if(hs(n+4,k)<.3)B.push([x,z,sx*.6,sz*.6,h*1.25,col]);   // (a set-back: a narrower block on top)
        p+=w+1.5+hs(n+6,k)*5; n+=7; } } };
  row(4,22,70,7,18,.08,1); row(16,9,34,6,15,0,2);
  // ON AND ON (owner, 18 Oct 2026: "the buildings should keep going and going in distance and get blurrier and blurrier the further away they are"):
  // four more rows out past the land's edge, each further and taller, so the city runs on into the mist; the further a front, the less of it shows
  // (its windows fade into its wall, its colour into the mist, in steps: the shader below)
  row(-22,26,80,9,20,.1,3); row(-50,30,95,10,24,.12,4); row(-90,34,110,12,28,.14,5); row(-140,40,130,14,32,.16,6);
  // CENTRAL PARK'S OWN EDGE (owner, same day, his picture of the buildings over the park's trees: "the closest buildings on other side of park
  // should look more like this (not a typical nyc skyline, more like what central park surrounding buildings look like)"): just past the force
  // field on the park's far side, a wall of pre-war apartment houses shoulder to shoulder, 12 to 24 storeys, limestone, cream and tan brick,
  // their tops set back, now and then twin towers on one (the San Remo's way), water towers on the lower ones
  { const T=TILE, zf=MISTB.w/T+3, xa=MISTB.x/T+4, xb=MISTB.z/T-4; let x=xa, k=0;
    while(x<xb){ const w=9+hs(k,61)*8, d=9+hs(k,62)*5, h=40+hs(k,63)*36, v=[3,6,7,6,3,7][Math.floor(hs(k,64)*6)], z=zf+d/2+hs(k,65)*1.5, cx=x+w/2;
      B.push([cx,z,w,d,h,null,v]);
      const top=hs(k,66); if(top<.55)B.push([cx,z,w*.7,d*.7,h+4+hs(k,67)*5,null,v]); if(top<.2)B.push([cx,z,w*.42,d*.42,h+10+hs(k,68)*6,null,v]);
      if(top>.86&&w>13){ for(const s2 of [-1,1])B.push([cx+s2*w*.28,z,w*.24,d*.3,h+16+hs(k,69)*6,null,v]); }   // (twin towers on top)
      if(top>.55&&top<.86&&hs(k,70)<.6)B.push([cx+(hs(k,71)-.5)*w*.5,z,1.8,1.8,h+3.4,null,1]);   // (a water tower)
      x+=w+.3; k++; } }
  // NEW YORK, 1980s (owner, 18 Oct 2026: "more variety of skyline based on real nyc 1980s"): past the back row on the park's side, the landmarks as
  // stacked blocks (their set-backs, crowns and spires), a seventh element their front: the Twin Towers (steel pinstripes, the north one's mast),
  // the Empire State (its set-backs and mast), the Chrysler (its stepped crown and needle), Citicorp (a plain slab, its top cut square), Woolworth
  // (its tower and spire), a third row of low-rise with water towers on its roofs, and the steel slabs of the 70s here and there
  { const zN=LR.z1-2, xs=t=>LR.x0+(LR.x1-LR.x0)*t, L=[.5,.52,.56], ST=[.56,.58,.62], LM=[.66,.62,.54], put=(x,z,w,d,h,c,v)=>B.push([x,z,w,d,h,c,v]);
    for(const dx of [0,19])put(xs(.18)+dx,zN,14,14,170,ST,5); put(xs(.18),zN,1.4,1.4,205,ST,5);   // (the Twin Towers; the north tower's mast)
    put(xs(.24),zN-6,15,9,72,LM,3); put(xs(.24),zN-6,8,8,92,LM,3); put(xs(.24),zN-6,4,4,104,LM,3); put(xs(.24),zN-6,.9,.9,118,ST,5);   // (Woolworth)
    { const x=xs(.56); [[30,20,42],[22,16,86],[16,12,128],[10,8,146],[6,6,154]].forEach(([w,d,h])=>put(x,zN,w,d,h,LM,3)); put(x,zN,1.6,1.6,190,ST,5); }   // (the Empire State)
    { const x=xs(.68); [[18,18,96],[13,13,112],[9,9,122],[6,6,130],[3.4,3.4,137]].forEach(([w,d,h],k)=>put(x,zN-4,w,d,h,k>1?ST:LM,k>1?5:3)); put(x,zN-4,.8,.8,162,ST,5); }   // (the Chrysler: the crown steel)
    put(xs(.76),zN-2,15,15,126,ST,5);   // (Citicorp)
    for(const t of [.33,.43,.62,.83,.9])put(xs(t),zN-3,10+hs(t*9,3)*8,9,80+hs(t*7,4)*40,ST,5);   // (the 70s' steel slabs)
    for(let k=0;k<60;k++){ const t=k/60+hs(k,21)*.01, x=xs(t), w=5+hs(k,22)*7, h=10+hs(k,23)*10, z=LR.z1-26-hs(k,24)*5; put(x,z,w,6,h,null,null); if(hs(k,25)<.45)put(x+(hs(k,26)-.5)*w*.5,z,1.6,1.6,h+3.2,[.34,.27,.22],1); } }   // (low-rise and its water towers)   // (the back row: 22-70 tiles high, towers to 125; the front row lower)
  // THEIR FRONTS (owner, 17 Oct 2026: "fill with realistic building textures, windows, fire escapes, etc. very low res, very far away"): one
  // tiny picture of five fronts, each a storey of two window bays 16 x 10 pixels (red brick, brown brick, grey concrete, limestone, red brick with
  // a fire escape), its windows marked in the picture's alpha; the shader lays it over every wall by where the point is on it (a bay 3 tiles
  // wide, a storey 3.2 high: nothing stretched by a building's size), each building its own front and its own lit windows at night (some),
  // the roofs dark. Nearest-pixel, no filtering: pixel art at any distance. One program, the same one draw
  const FW=16, FH=10, NV=8, atlas=new Uint8Array(FW*FH*NV*4), hp=(a,b)=>{ const v=Math.sin(a*91.7+b*47.3)*43758.5453; return v-Math.floor(v); };
  const WALL=[[128,60,48],[96,66,52],[118,118,114],[176,162,134],[122,56,44],[150,155,162],[168,132,96],[196,184,156]];   // (the seventh tan brick, the eighth cream: the park's pre-war houses)   // (the sixth: a steel curtain wall, the towers' pinstripes)
  for(let v=0;v<NV;v++)for(let y=0;y<FH;y++)for(let x=0;x<FW;x++){ const k=((v*FH+y)*FW+x)*4, w=WALL[v], n=.9+hp(x+v*7,y)*.18; let c=[w[0]*n,w[1]*n,w[2]*n], a=0;
    if(v!==2&&v!==3&&(y===0))c=c.map(q=>q*.82);   /* (the brick courses' line) */
    const inW=v===5?(x%2===1&&y>=1&&y<=8):(x>=2&&x<=5||x>=10&&x<=13)&&y>=2&&y<=7; if(inW){ c=[40,48,60]; a=255; if(v!==5&&(y===2||x===2||x===10))c=[52,60,74]; }
    if(y===8&&(x>=1&&x<=6||x>=9&&x<=14))c=v===3?[200,190,166]:[150,146,138];   /* (the sills) */
    if(v===2&&(x===0||x===8))c=c.map(q=>q*.86);   /* (the concrete's joints) */
    if(v===4){ if(y===9)c=[22,22,24]; if(y===6&&x%2===0)c=[30,30,32]; if((x+y)%7===0&&y<9&&x>6&&x<11)c=[26,26,28]; }   /* (the fire escape: its landing, its rail, the ladder) */
    atlas[k]=c[0]; atlas[k+1]=c[1]; atlas[k+2]=c[2]; atlas[k+3]=a; }
  const ftex=new THREE.DataTexture(atlas,FW,FH*NV); ftex.magFilter=ftex.minFilter=THREE.NearestFilter; ftex.colorSpace=THREE.SRGBColorSpace; ftex.flipY=false; ftex.needsUpdate=true;
  const FU={uMC:{value:new THREE.Color()},uMK:{value:0},uMP:{value:new THREE.Vector3()},uFT:{value:ftex},uLit:{value:0},uAmb:{value:0},uBay:{value:3*TILE},uStorey:{value:3.2*TILE},uY0:{value:-.5*ZU},uTW:{value:0},uBX:{value:MISTB},uTL:{value:TILE}};
  const geo=new THREE.BoxGeometry(1,1,1).translate(0,.5,0), mat=new THREE.MeshLambertMaterial({color:0xffffff}), me=new THREE.InstancedMesh(geo,mat,B.length), m4=new THREE.Matrix4(), c=new THREE.Color(), y0=-.5*ZU;
  const aV=new Float32Array(B.length), aS=new Float32Array(B.length);
  B.forEach(([x,z,sx,sz,h,col,fv],i)=>{ me.setMatrixAt(i,m4.makeScale(sx*TILE,h*TILE,sz*TILE).setPosition(x*TILE,y0,z*TILE)); me.setColorAt(i,c.setRGB(1,1,1)); aV[i]=fv!=null?fv:Math.floor(hs(i,9)*NV); aS[i]=hs(i,11)*97; });
  geo.setAttribute('aV',new THREE.InstancedBufferAttribute(aV,1)); geo.setAttribute('aS',new THREE.InstancedBufferAttribute(aS,1));
  mat.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,FU);
    sh.vertexShader='attribute float aV; attribute float aS; varying float vFV,vFS; varying vec3 vFW,vFN;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vec4 fw=vec4(transformed,1.);\n#ifdef USE_INSTANCING\n fw=instanceMatrix*fw;\n#endif\n fw=modelMatrix*fw; vFW=fw.xyz; vFN=normalize(mat3(modelMatrix)*objectNormal); vFV=aV; vFS=aS;');
    sh.fragmentShader='uniform vec3 uMC,uMP; uniform float uMK; uniform sampler2D uFT; uniform float uLit,uBay,uStorey,uY0,uAmb,uTW,uTL; uniform vec4 uBX; varying float vFV,vFS; varying vec3 vFW,vFN; float fLit=0.;\n float pastK(){ vec2 q=vFW.xz/uTL; float d=max(max(uBX.x/uTL-q.x,q.x-uBX.z/uTL),max(uBX.y/uTL-q.y,q.y-uBX.w/uTL)); return clamp((d-3.)/170.,0.,1.); }\n'+sh.fragmentShader
      .replace('#include <color_fragment>',`#include <color_fragment>
 { vec3 an=abs(vFN); if(an.y>.5){ diffuseColor.rgb=vec3(.16,.16,.17); } else {
     float u=(an.x>an.z?vFW.z:vFW.x)/(uBay*2.), v=(vFW.y-uY0)/uStorey; vec2 f=vec2(fract(u),1.-fract(v));
     vec4 t=texture2D(uFT,vec2((floor(f.x*16.)+.5)/16.,(floor(vFV)*10.+floor(f.y*10.)+.5)/80.)); diffuseColor.rgb=t.rgb; float pk=uMK>0.?pastK():0.; if(pk>0.){ vec3 wc=texture2D(uFT,vec2(.5/16.,(floor(vFV)*10.+9.5)/80.)).rgb; diffuseColor.rgb=mix(t.rgb,wc,floor(pk*4.+.5)/4.*.85); t.a*=step(pk,.8); }   /* (the further, the less detail: the windows into the wall) */
     if(t.a>.5){ float bay=floor(u*2.+(an.x>an.z?3.:0.)), h=fract(sin(dot(vec3(bay,floor(v),vFS+floor(uTW+fract(bay*.37+floor(v)*.61)*7.)*1.7),vec3(12.9898,78.233,37.719)))*43758.5453); fLit=step(h,uLit); } } }`)
      .replace('#include <fog_fragment>',`if(uMK<=0.){
#include <fog_fragment>
} else { float fd=distance(vFW.xz,uMP.xz); gl_FragColor.rgb=mix(gl_FragColor.rgb,uMC,mix(.18,.92,floor(pastK()*6.+.5)/6.)); }   /* (into the mist by how far past the town's edge: the park's own edge plain, the far rows going, in six steps) */`).replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=fLit*vec3(1.,.82,.5)*.9+diffuseColor.rgb*uAmb;'); };   /* (uAmb: the whole sky's light on them by day, so the far fronts are seen in the shade too) */
  mat.customProgramCacheKey=()=>'skylinefronts';
  me.frustumCulled=false; me.visible=on; (MAPG.bodega||scene).add(me); FAR3.mesh=me; FAR3.n=B.length; FAR3.tris=B.length*12; FAR3.FU=FU;
  // each frame, after the clock and the weather have set the sky: the haze from where you stand, out in the open only
  const tick0=CLOCK.tick; CLOCK.tick=dt=>{ tick0(dt);
    const up=LVL!=='down', inside=!!ROOMS.cur||!up; me.visible=FAR3.on&&up;
    FU.uLit.value=Math.max(.1,.32*Math.max(0,Math.min(1,(1-CLOCK.elev())/6))); FU.uTW.value=performance.now()/1000/23;   // (a tenth lit even by day, each going on and off now and then: life out there, owner "more clouds and life in distance")   // (a third of their windows lit from dusk)
    FU.uAmb.value=.55*Math.max(0,Math.min(1,(CLOCK.elev()+3)/12));
    FU.uMK.value=0; MISTE.x=0; if(SKY.U.uMistK)SKY.U.uMistK.value=0; if(!FAR3.on||inside||(scene.fog&&scene.fog!==FOG)){ if(scene.fog===FOG)scene.fog=null; return; }   // (the weather's own fog, when it comes, is thicker: it has the scene)
    const day=Math.max(0,Math.min(1,(CLOCK.elev()+4)/14)), d=-V.copy(pos).applyMatrix4(cam.matrixWorldInverse).z;   // (how deep you stand in the camera's view: the haze starts past you)
    if(FAR3.mist){ const k=Math.max(0,Math.min(1,(CLOCK.elev()+6)/12)); FOG.color.copy(MN).lerp(MD,k).lerp(MH,Math.max(0,Math.min(1,(CLOCK.elev()-6)/40))); FU.uMC.value.copy(FOG.color).multiplyScalar(.62); FU.uMK.value=.8; FU.uMP.value.copy(pos); FOG.near=1e6; FOG.far=2e6; MISTE.x=1; MISTE.y=MIST0; MISTE.z=MIST1; scene.fog=FOG; SKY.dome.visible=true; SKY.U.uMistK.value=1; SKY.U.uMistC.value.copy(FOG.color); scene.background.copy(FOG.color).multiplyScalar(.5); if(WX.cloudMist)WX.cloudMist(FOG.color); return; }   // (the farthest the darkest: owner, "it should get darker further away")   // (THE MIST: above; no sky in it, the background the mist's own colour, so the far melts into it)
    FOG.color.copy(SKY.U.uH.value).lerp(SKY.U.uA.value,.4);   /* (the dome's horizon colour, between the sun's side and the side away, so the far fades into the sky it stands against: sky.js, built before this) */ FOG.near=d+HAZE0*TILE; FOG.far=d+HAZE1*TILE; scene.fog=FOG; };
  // GRAPHICS' DISTANCE HAZE, beside LIGHT GRAIN
  const g=document.querySelector('#dgrain'); if(g){ const b=document.createElement('button'); b.className='btn'; b.id='dhaze'; const draw=()=>{ b.textContent='DISTANCE HAZE '+(!FAR3.on?'OFF':FAR3.mist?'MIST':'FAR'); b.setAttribute('aria-pressed',String(FAR3.on)); };
    b.onclick=()=>{ if(!FAR3.on){ FAR3.on=true; FAR3.mist=true; } else if(FAR3.mist)FAR3.mist=false; else FAR3.on=false; try{ localStorage.setItem('market-haze2',!FAR3.on?'0':FAR3.mist?'1':'2'); }catch(e){} draw(); }; g.after(b); draw(); }   // (MIST, FAR, OFF in turn)
  window.FAR3=FAR3; }
