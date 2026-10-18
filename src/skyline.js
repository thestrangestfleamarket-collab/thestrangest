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
  // THE DISTANCE LOOK'S DIALS (owner, 18 Oct 2026: "give me mockups of diff styles, with ranges i can select and change to get the right look and
  // save it"): every number of the far look in one place, FL, with five styles to start from; the panel below (GRAPHICS' DISTANCE LOOK) moves
  // them live, SAVE keeps them in the browser (the save's 'farlook'), EXPORT gives them as text to make the game's own (FL0)
  const FL0={m0:MIST0,m1:MIST1,md:.5,hn:.2,hf:.82,hd:170,hs:8,dt:.45,wn:.12,wd:.02,bl:.6,br:1,cov:.47,cl:1.16,zk:.62,hk:.5}, FL={...FL0}; try{ Object.assign(FL,JSON.parse(SAVE.get('farlook')||'{}')); }catch(e){} FAR3.FL=FL; FAR3.FL0=FL0;
  FAR3.frameTris=()=>new Promise(res=>{ const I=renderer.info; I.autoReset=false; requestAnimationFrame(()=>{ I.reset(); requestAnimationFrame(()=>{ const r={tris:I.render.triangles,calls:I.render.calls,culled:0}; I.autoReset=true; res(r); }); }); });   // (a test's: one whole frame's triangles and draws, every pass; tests/mistcull.cjs)
  // THE SKYLINE: along each side of the land's square, a back row 4 tiles in from its edge and a front row 16 tiles in, each building a block
  // (a quarter of them a step narrower at the top: a set-back). Laid out once, the same every time (a hash, no Math.random)
  const LR=MODS.landR, hs=(i,j)=>{ const v=Math.sin(i*12.9898+j*78.233)*43758.5453; return v-Math.floor(v); }, B=[];
  const row=(inset,hmin,hmax,wmin,wmax,tower,k)=>{ const x0=LR.x0+inset, x1=LR.x1-inset, z0=LR.z0+inset, z1=LR.z1-inset; let n=0;
    for(const [ax,fixed,lo,hi] of [['x',z0,x0,x1],['x',z1,x0,x1],['z',x0,z0,z1],['z',x1,z0,z1]]){ let p=lo+hs(n++,k)*6;
      while(p<hi){ const w=wmin+hs(n,k)*(wmax-wmin), d=wmin*.8+hs(n+1,k)*(wmax-wmin)*.6, t=hs(n+2,k)<tower, h=t?hmax*(1.2+hs(n+3,k)*.6):hmin+hs(n+3,k)*(hmax-hmin), g=hs(n+5,k);
        if(p+w>hi)break; const c=p+w/2, x=ax==='x'?c:fixed, z=ax==='x'?fixed:c, sx=ax==='x'?w:d, sz=ax==='x'?d:w, L=.26+g*.16, col=[L*.92,L*.95,L*1.04];   // (dull blue-greys, a little varied)
        B.push([x,z,sx,sz,h,col]); if(hs(n+4,k)<.3)B.push([x,z,sx*.6,sz*.6,h*1.25,col]);   // (a set-back: a narrower block on top)
        p+=w+1.5+hs(n+6,k)*5; n+=7; } } };
  // (MORE LOGICAL, owner 18 Oct 2026: "make the buildings more logical": low near the town and taller the further out, no lone tower beside
  // a low block; the landmarks in their clusters far back: Midtown, then Downtown further still)
  row(4,12,30,7,16,0,1); row(16,8,18,6,13,0,2);
  // ON AND ON (owner, 18 Oct 2026: "the buildings should keep going and going in distance and get blurrier and blurrier the further away they are"):
  // four more rows out past the land's edge, each further and taller, so the city runs on into the mist; the further a front, the less of it shows
  // (its windows fade into its wall, its colour into the mist, in steps: the shader below)
  row(-22,20,45,9,20,0,3); row(-50,30,62,10,24,.03,4); row(-90,40,90,12,28,.1,5); row(-140,50,120,14,32,.2,6);
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
  { const zN=LR.z1+75, zD=LR.z1+170, xs=t=>LR.x0+(LR.x1-LR.x0)*t, L=[.5,.52,.56], ST=[.56,.58,.62], LM=[.66,.62,.54], put=(x,z,w,d,h,c,v)=>B.push([x,z,w,d,h,c,v]);
    for(const dx of [0,19])put(xs(.3)+dx,zD,14,14,170,ST,5); put(xs(.3),zD,1.4,1.4,205,ST,5);   // (the Twin Towers; the north tower's mast)
    put(xs(.38),zD-14,15,9,72,LM,3); put(xs(.38),zD-14,8,8,92,LM,3); put(xs(.38),zD-14,4,4,104,LM,3); put(xs(.38),zD-14,.9,.9,118,ST,5);   // (Woolworth)
    { const x=xs(.5); [[30,20,42],[22,16,86],[16,12,128],[10,8,146],[6,6,154]].forEach(([w,d,h])=>put(x,zN,w,d,h,LM,3)); put(x,zN,1.6,1.6,190,ST,5); }   // (the Empire State)
    { const x=xs(.58); [[18,18,96],[13,13,112],[9,9,122],[6,6,130],[3.4,3.4,137]].forEach(([w,d,h],k)=>put(x,zN-4,w,d,h,k>1?ST:LM,k>1?5:3)); put(x,zN-4,.8,.8,162,ST,5); }   // (the Chrysler: the crown steel)
    put(xs(.63),zN+6,15,15,126,ST,5);   // (Citicorp)
    for(const t of [.42,.46,.53,.55,.61,.66,.69])put(xs(t),zN+(hs(t*5,2)-.5)*24,10+hs(t*9,3)*8,9,80+hs(t*7,4)*40,ST,5);   // (the 70s' steel slabs)
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
  const FU={uMC:{value:new THREE.Color()},uMK:{value:0},uMP:{value:new THREE.Vector3()},uFT:{value:ftex},uLit:{value:0},uAmb:{value:0},uBay:{value:3*TILE},uStorey:{value:3.2*TILE},uY0:{value:-.5*ZU},uTW:{value:0},uBX:{value:MISTB},uTL:{value:TILE},uHN:{value:.2},uHF:{value:.82},uHD:{value:170},uHS:{value:8},uDT:{value:.45}};
  const geo=new THREE.BoxGeometry(1,1,1).translate(0,.5,0), mat=new THREE.MeshLambertMaterial({color:0xffffff}), me=new THREE.InstancedMesh(geo,mat,B.length), m4=new THREE.Matrix4(), c=new THREE.Color(), y0=-.5*ZU;
  const aV=new Float32Array(B.length), aS=new Float32Array(B.length);
  B.forEach(([x,z,sx,sz,h,col,fv],i)=>{ me.setMatrixAt(i,m4.makeScale(sx*TILE,h*TILE,sz*TILE).setPosition(x*TILE,y0,z*TILE)); me.setColorAt(i,c.setRGB(1,1,1)); aV[i]=fv!=null?fv:Math.floor(hs(i,9)*NV); aS[i]=hs(i,11)*97; });
  geo.setAttribute('aV',new THREE.InstancedBufferAttribute(aV,1)); geo.setAttribute('aS',new THREE.InstancedBufferAttribute(aS,1));
  mat.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,FU);
    sh.vertexShader='attribute float aV; attribute float aS; varying float vFV,vFS; varying vec3 vFW,vFN;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vec4 fw=vec4(transformed,1.);\n#ifdef USE_INSTANCING\n fw=instanceMatrix*fw;\n#endif\n fw=modelMatrix*fw; vFW=fw.xyz; vFN=normalize(mat3(modelMatrix)*objectNormal); vFV=aV; vFS=aS;');
    sh.fragmentShader='uniform vec3 uMC,uMP; uniform float uMK; uniform sampler2D uFT; uniform float uLit,uBay,uStorey,uY0,uAmb,uTW,uTL,uHN,uHF,uHD,uHS,uDT; uniform vec4 uBX; varying float vFV,vFS; varying vec3 vFW,vFN; float fLit=0.;\n float pastK(){ vec2 q=vFW.xz/uTL; float d=max(max(uBX.x/uTL-q.x,q.x-uBX.z/uTL),max(uBX.y/uTL-q.y,q.y-uBX.w/uTL)); return clamp((d-3.)/uHD,0.,1.); }\n'+sh.fragmentShader
      .replace('#include <color_fragment>',`#include <color_fragment>
 { vec3 an=abs(vFN); if(an.y>.5){ diffuseColor.rgb=vec3(.16,.16,.17); } else {
     float u=(an.x>an.z?vFW.z:vFW.x)/(uBay*2.), v=(vFW.y-uY0)/uStorey; vec2 f=vec2(fract(u),1.-fract(v));
     vec4 t=texture2D(uFT,vec2((floor(f.x*16.)+.5)/16.,(floor(vFV)*10.+floor(f.y*10.)+.5)/80.)); diffuseColor.rgb=t.rgb; float pk=uMK>0.?pastK():0.; if(pk>0.){ vec3 wc=texture2D(uFT,vec2(.5/16.,(floor(vFV)*10.+9.5)/80.)).rgb; diffuseColor.rgb=mix(t.rgb,wc,floor(pk*4.+.5)/4.*.85); t.a*=step(pk,uDT); }   /* (the further, the less detail: the windows into the wall) */
     if(t.a>.5){ float bay=floor(u*2.+(an.x>an.z?3.:0.)), h=fract(sin(dot(vec3(bay,floor(v),vFS+floor(uTW+fract(bay*.37+floor(v)*.61)*7.)*1.7),vec3(12.9898,78.233,37.719)))*43758.5453); fLit=step(h,uLit); } } }`)
      .replace('#include <fog_fragment>',`if(uMK<=0.){
#include <fog_fragment>
} else { float fd=distance(vFW.xz,uMP.xz); gl_FragColor.rgb=mix(gl_FragColor.rgb,uMC,mix(uHN,uHF,pastK())); }   /* (less visible: owner, "they shouldnt be as visible ... haze ... real distance") */   /* (into the mist by how far past the town's edge: the park's own edge plain, the far rows going, in six steps) */`).replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=fLit*vec3(1.,.82,.5)*.9+diffuseColor.rgb*uAmb;'); };   /* (uAmb: the whole sky's light on them by day, so the far fronts are seen in the shade too) */
  mat.customProgramCacheKey=()=>'skylinefronts';
  me.frustumCulled=false; me.visible=on; (MAPG.bodega||scene).add(me); FAR3.mesh=me; FAR3.n=B.length; FAR3.tris=B.length*12; FAR3.FU=FU;
  // each frame, after the clock and the weather have set the sky: the haze from where you stand, out in the open only
  const tick0=CLOCK.tick; CLOCK.tick=dt=>{ tick0(dt);
    const up=LVL!=='down', inside=!OUT.open; me.visible=FAR3.on&&up;
    FU.uHN.value=FL.hn; FU.uHF.value=FL.hf; FU.uHD.value=FL.hd; FU.uHS.value=Math.round(FL.hs); FU.uDT.value=FL.dt; if(SKY.U.uCov){ SKY.U.uCov.value=FL.cov; SKY.U.uCL.value=FL.cl; SKY.U.uZk.value=FL.zk; SKY.U.uHk.value=FL.hk; }
    FU.uLit.value=FL.wd+(FL.wn-FL.wd)*Math.max(0,Math.min(1,(1-CLOCK.elev())/6)); FU.uTW.value=performance.now()/1000/23;   // (a tenth lit even by day, each going on and off now and then: life out there, owner "more clouds and life in distance")   // (a third of their windows lit from dusk)
    FU.uAmb.value=.55*Math.max(0,Math.min(1,(CLOCK.elev()+3)/12));
    FU.uMK.value=0; MISTE.x=0; if(SKY.U.uMistK)SKY.U.uMistK.value=0; if(!FAR3.on||inside||(scene.fog&&scene.fog!==FOG)){ if(scene.fog===FOG)scene.fog=null; return; }   // (the weather's own fog, when it comes, is thicker: it has the scene)
    const day=Math.max(0,Math.min(1,(CLOCK.elev()+4)/14)), d=-V.copy(pos).applyMatrix4(cam.matrixWorldInverse).z;   // (how deep you stand in the camera's view: the haze starts past you)
    if(FAR3.mist){ const k=Math.max(0,Math.min(1,(CLOCK.elev()+6)/12)); FOG.color.copy(MN).lerp(MD,k).lerp(MH,Math.max(0,Math.min(1,(CLOCK.elev()-6)/40))); FU.uMC.value.copy(FOG.color).multiplyScalar(.62); FU.uMK.value=.8; FU.uMP.value.copy(pos); FOG.near=1e6; FOG.far=2e6; MISTE.x=1; MISTE.y=FL.m0; MISTE.z=FL.m1; MISTF.x=FL.md; scene.fog=FOG; SKY.dome.visible=true; SKY.U.uMistK.value=1; SKY.U.uMistC.value.copy(FOG.color); scene.background.copy(FOG.color).multiplyScalar(.5); if(WX.cloudMist)WX.cloudMist(FOG.color); return; }   // (the farthest the darkest: owner, "it should get darker further away")   // (THE MIST: above; no sky in it, the background the mist's own colour, so the far melts into it)
    FOG.color.copy(SKY.U.uH.value).lerp(SKY.U.uA.value,.4);   /* (the dome's horizon colour, between the sun's side and the side away, so the far fades into the sky it stands against: sky.js, built before this) */ FOG.near=d+HAZE0*TILE; FOG.far=d+HAZE1*TILE; scene.fog=FOG; };
  // GRAPHICS' DISTANCE HAZE, beside LIGHT GRAIN
  const g=document.querySelector('#dgrain'); if(g){ const b=document.createElement('button'); b.className='btn'; b.id='dhaze'; const draw=()=>{ b.textContent='DISTANCE HAZE '+(!FAR3.on?'OFF':FAR3.mist?'MIST':'FAR'); b.setAttribute('aria-pressed',String(FAR3.on)); };
    b.onclick=()=>{ if(!FAR3.on){ FAR3.on=true; FAR3.mist=true; } else if(FAR3.mist)FAR3.mist=false; else FAR3.on=false; try{ localStorage.setItem('market-haze2',!FAR3.on?'0':FAR3.mist?'1':'2'); }catch(e){} draw(); }; g.after(b); draw(); }   // (MIST, FAR, OFF in turn)
  // THE DISTANCE OUT OF FOCUS (owner, 18 Oct 2026: "they shouldnt be as visible, depth of field, blur, haze, etc, real distance": the no-blur rule
  // (then "way too much, needs to look realistic, check other video game references": as the open-world games keep their far cities, crisp
  // silhouettes losing contrast into the air, a touch soft, a few lit windows; so the blur a half pixel, the haze lighter near, the windows sparse)
  // lifted for this): while the mist is on, the skyline and the sky are drawn first on their own, at half the picture's size, blurred both
  // ways (nine taps each), and laid behind everything as the scene's background; the near world over them stays sharp, its hard pixels as ever.
  // They're the farthest things there are, so nothing is lost behind them. ?farblur=0 off. Cost: the skyline's draw and the sky's again at a
  // quarter of the pixels, two small blur passes; no light, no shadow
  { const on=QS.get('farblur')!=='0', BGC=scene.background, LAY=4, rt=()=>{ const t=new THREE.WebGLRenderTarget(2,2,{depthBuffer:true}); t.texture.minFilter=t.texture.magFilter=THREE.LinearFilter; return t; }, A=rt(), Bt=rt();
    const BM=new THREE.ShaderMaterial({uniforms:{uT:{value:null},uD:{value:new THREE.Vector2()}},depthTest:false,depthWrite:false,
      vertexShader:'varying vec2 vU; void main(){ vU=uv; gl_Position=vec4(position.xy,0.,1.); }',
      fragmentShader:'uniform sampler2D uT; uniform vec2 uD; varying vec2 vU; void main(){ vec4 c=texture2D(uT,vU)*.2; float w[4]; w[0]=.17; w[1]=.13; w[2]=.08; w[3]=.04; for(int i=1;i<=4;i++){ c+=texture2D(uT,vU+uD*float(i))*w[i-1]+texture2D(uT,vU-uD*float(i))*w[i-1]; } gl_FragColor=c; }'});
    const QS2=new THREE.Scene(), QC=new THREE.OrthographicCamera(-1,1,1,-1,0,1); QS2.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),BM)); let live=false;
    FAR3.pre=(renderer,cam)=>{ live=false; if(!on||!(FL.bl>0)||!FAR3.on||!FAR3.mist||!me.visible||scene.fog!==FOG||!SKY.dome.visible){ me.layers.set(0); SKY.dome.layers.set(0); return; }
      const W=Math.max(2,Math.ceil(RW/FL.br)), H=Math.max(2,Math.ceil(RH/FL.br)); if(A.width!==W||A.height!==H){ A.setSize(W,H); Bt.setSize(W,H); }
      me.layers.set(LAY); SKY.dome.layers.set(LAY); const mask=cam.layers.mask, nu=renderer.shadowMap.needsUpdate; cam.layers.set(LAY); renderer.shadowMap.needsUpdate=false;
      renderer.setRenderTarget(A); renderer.clear(); renderer.render(scene,cam); cam.layers.mask=mask;
      BM.uniforms.uT.value=A.texture; BM.uniforms.uD.value.set(FL.bl/W,0); renderer.setRenderTarget(Bt); renderer.render(QS2,QC);
      BM.uniforms.uT.value=Bt.texture; BM.uniforms.uD.value.set(0,FL.bl/H); renderer.setRenderTarget(A); renderer.render(QS2,QC);
      renderer.setRenderTarget(null); renderer.shadowMap.needsUpdate=nu; scene.background=A.texture; live=true; };
    FAR3.post=()=>{ if(scene.background!==BGC)scene.background=BGC; }; }
  // THE PANEL: the five styles, a slider a dial, SAVE / RESET / EXPORT; X closes it, a drag moves it (ui.js's PANS)
  { const ST={'GAME':{},'CLEAR AIR':{m0:14,m1:60,md:.25,hn:.1,hf:.6,hd:260,hs:10,dt:.6,bl:0,cov:.6},'HAZY':{m0:0,m1:18,md:.35,hn:.35,hf:.9,hd:120,hs:8,dt:.3,bl:.8,cov:.4},
      'DREAMY':{m0:2,m1:30,md:.15,hn:.3,hf:.88,hd:150,hs:12,dt:.35,bl:1.4,br:2,cov:.5,cl:1.3},'DUSK CITY':{m0:8,m1:40,md:.6,hn:.15,hf:.75,hd:200,hs:6,dt:.6,wn:.3,wd:.06,bl:.3,cov:.52,zk:.45}};
    const D=[['m0','MIST STARTS (tiles past town)',-10,60,1],['m1','MIST DEPTH (tiles)',4,160,1],['md','MIST DARKER FAR',0,1,.01],['hn','BUILDINGS: HAZE NEAR',0,1,.01],['hf','BUILDINGS: HAZE FAR',0,1,.01],
      ['hd','HAZE REACHES FULL (tiles)',30,500,5],['hs','HAZE STEPS',2,16,1],['dt','WINDOWS SHOW UNTIL',0,1,.01],['wn','LIT WINDOWS AT NIGHT',0,.6,.01],['wd','LIT WINDOWS BY DAY',0,.3,.01],
      ['bl','BLUR',0,3,.05],['br','BLUR COARSENESS',1,4,.5],['cov','CLOUD COVER (lower = more)',.2,.8,.01],['cl','CLOUD BRIGHTNESS',.6,1.6,.01],['zk','SKY OVERHEAD',.2,1.4,.01],['hk','SKY AT HORIZON',.1,1.2,.01]];
    let P=null; const draw=()=>{ if(!P)return; for(const [k] of D){ const r=P.querySelector('[data-k="'+k+'"]'); if(r){ r.value=FL[k]; r.nextSibling.textContent=(+FL[k]).toFixed(2); } } };
    FAR3.panel=()=>{ if(P){ P.hidden=!P.hidden; draw(); return; } P=document.createElement('div'); P.id='farlook';
      P.style.cssText='position:fixed;right:12px;top:8%;width:min(380px,92vw);max-height:84vh;overflow:auto;z-index:21;padding:12px 14px;font:10px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
      P.innerHTML='<div style="color:#f2c14e;font-size:12px;margin-bottom:8px">DISTANCE LOOK</div><div id="flst" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">'+Object.keys(ST).map(n=>'<button class="btn" data-st="'+n+'">'+n+'</button>').join('')+'</div>'
        +D.map(([k,l,a,b,st])=>'<div style="margin:5px 0"><div>'+l+'</div><input type="range" data-k="'+k+'" min="'+a+'" max="'+b+'" step="'+st+'" style="width:76%;vertical-align:middle"><span style="display:inline-block;width:20%;text-align:right"></span></div>').join('')
        +'<div style="display:flex;gap:4px;margin-top:8px"><button class="btn" id="flsave">SAVE</button><button class="btn" id="flreset">RESET</button><button class="btn" id="flexp">EXPORT</button></div><div id="flmsg" style="margin-top:6px;color:#9aa"></div><textarea id="flout" hidden style="width:100%;height:60px;margin-top:6px;font:10px monospace"></textarea>';
      document.body.appendChild(P); for(const ev of ['keydown','keyup'])P.addEventListener(ev,e=>e.stopPropagation());
      P.addEventListener('input',e=>{ const k=e.target.dataset&&e.target.dataset.k; if(!k)return; FL[k]=+e.target.value; e.target.nextSibling.textContent=FL[k].toFixed(2); P.querySelector('#flmsg').textContent='not saved'; });
      P.addEventListener('click',e=>{ const t=e.target, n=t.dataset&&t.dataset.st, msg=P.querySelector('#flmsg');
        if(n){ Object.assign(FL,FL0,ST[n]); draw(); msg.textContent=n+' (not saved)'; }
        if(t.id==='flsave'){ SAVE.set('farlook',JSON.stringify(FL)); msg.textContent='saved'; }
        if(t.id==='flreset'){ Object.assign(FL,FL0); SAVE.del?SAVE.del('farlook'):SAVE.set('farlook','{}'); draw(); msg.textContent='back to the game\'s own'; }
        if(t.id==='flexp'){ const o=P.querySelector('#flout'); o.hidden=false; o.value='FARLOOK '+JSON.stringify(Object.fromEntries(Object.entries(FL).map(([k,v])=>[k,+(+v).toFixed(3)]))); o.select(); msg.textContent='copy this and send it to Claude'; } });
      draw(); };
    if(g){ const b=document.createElement('button'); b.className='btn'; b.id='dfarlook'; b.textContent='DISTANCE LOOK'; b.onclick=()=>FAR3.panel(); (document.getElementById('dhaze')||g).after(b); }
    if(QS.get('farlook')==='1')setTimeout(()=>FAR3.panel(),500); }
  window.FAR3=FAR3; }
