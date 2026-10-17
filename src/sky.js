// ---- THE SKY (owner, 17 Oct 2026, "look for ideas on how we could do the best sunset / sky", "go"): a dome painted by one shader instead of
// the one flat colour: a gradient of three colours by height (the horizon, the middle, the zenith), warmed on the sun's side and pinked on
// the side away from it (the Belt of Venus); the sun a hard-edged disc, bigger and redder as it drops, a small halo round it (not bloom); the
// moon a disc; stars at night, fixed to the sky; the weather's grey and the fog laid over it (weather.js). Its colours by the sun's height,
// in stops close round the horizon so golden hour, the sunset, the afterglow and the blue hour each look their own. Cost: one box of 12
// triangles round the camera, drawn after the world where nothing covers it (its depth at the far plane); no light, no texture. Hidden
// underground and inside a room (the room's black). PIXEL lighting cuts the gradient into bands, SMOOTH leaves it smooth (map-pre.js) ----
const SKY={};
{ const cl=v=>Math.max(0,Math.min(1,v));
  // the palette by the sun's height: [height, horizon, middle, zenith, the sun's side at the horizon, the side away from it]
  const P=[[-90,0x0b1024,0x060918,0x030409,0x0b1024,0x0b1024],[-18,0x0b1024,0x060918,0x030409,0x0b1024,0x0b1024],[-12,0x1a2048,0x0e1430,0x070a1c,0x2a2440,0x141a38],
    [-6,0x3c4070,0x1f2a58,0x0f1838,0x8a4a40,0x2a3060],[-2.5,0x8a6a80,0x4a4a84,0x1e2a58,0xe8703a,0x6a5878],[0,0xd89070,0x8a7aa0,0x2e4078,0xff8a3a,0xb888a0],
    [3,0xf0b070,0xb09aa8,0x3c62a8,0xffb050,0xd0a0b0],[8,0xf4d0a0,0xa8c0e0,0x4a84d0,0xffe0a0,0xd8c8d8],[16,0xd0e0f0,0x88b8ea,0x3f7fd8,0xffffff,0xd0e0f0],[90,0xc4dcf2,0x7aaee6,0x3270d0,0xffffff,0xc4dcf2]];
  // the sun's disc by its height (deep red-orange at the horizon, cream high up), and the halo's colour (lighter)
  const SUN=[[-2,0xff4a20],[0,0xff6428],[3,0xff8c3a],[8,0xffc070],[20,0xfff0d0],[90,0xfff8ee]];
  const U={uH:{value:new THREE.Color()},uM:{value:new THREE.Color()},uZ:{value:new THREE.Color()},uS:{value:new THREE.Color()},uA:{value:new THREE.Color()},
    uSunDir:{value:new THREE.Vector3(0,1,0)},uSunCol:{value:new THREE.Color()},uSunK:{value:0},uSunR:{value:.04},uSideK:{value:1},
    uMoonDir:{value:new THREE.Vector3(0,1,0)},uMoonK:{value:0},uMoonR:{value:.03},uStar:{value:0},uFogC:{value:new THREE.Color()},uFogK:{value:0},uGrey:{value:new THREE.Color()},uGreyK:{value:0},
    uBands:{value:SMOOTH?0:24}};
  const mat=new THREE.ShaderMaterial({uniforms:U,side:THREE.BackSide,depthWrite:false,depthTest:true,
    vertexShader:'varying vec3 vD; void main(){ vD=position; vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position=p.xyww; }',
    fragmentShader:`uniform vec3 uH,uM,uZ,uS,uA,uSunDir,uSunCol,uMoonDir,uFogC,uGrey; uniform float uSunK,uSunR,uSideK,uMoonK,uMoonR,uStar,uFogK,uGreyK,uBands; varying vec3 vD;
      float hs(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      void main(){ vec3 d=normalize(vD); float el=max(d.y,0.); vec2 hz=normalize(d.xz+vec2(1e-4,0.)), sh=normalize(uSunDir.xz+vec2(1e-4,0.)); float cs=dot(hz,sh);
        // the gradient, and the two sides
        vec3 c=mix(uH,uM,smoothstep(0.,.3,el)); c=mix(c,uZ,smoothstep(.2,.85,el));
        c=mix(c,uS,pow(max(cs,0.),3.)*exp(-el*5.)*uSideK); c=mix(c,uA,pow(max(-cs,0.),2.)*exp(-el*6.)*uSideK*.7);
        c*=1.-clamp(-d.y*2.,0.,1.)*.5;   // (under the horizon, where the land's edge lets it show: the horizon's colour, darkening)
        // the stars: one in a few of the cells of a cube round the sky, each its own size and brightness, fixed where they are
        if(uStar>0.){ vec3 a=abs(d); vec2 uv; float f; if(a.x>=a.y&&a.x>=a.z){ uv=d.yz/a.x; f=d.x>0.?0.:1.; } else if(a.y>=a.z){ uv=d.xz/a.y; f=d.y>0.?2.:3.; } else { uv=d.xy/a.z; f=d.z>0.?4.:5.; }
          vec2 g=(uv*.5+.5)*44.; vec2 id=floor(g)+f*100.; float h=hs(id); if(h<.14){ vec2 o=vec2(hs(id+3.1),hs(id+7.3))*.6+.2; float r=length(fract(g)-o);
            float br=(.35+.65*hs(id+1.7))*step(r,.05+.07*hs(id+9.1)); c+=vec3(.82,.88,1.)*br*uStar*smoothstep(0.,.12,el); } }
        // the moon: a disc, lit side toward the sun
        { float ang=acos(clamp(dot(d,uMoonDir),-1.,1.)); float disc=1.-step(uMoonR,ang); c=mix(c,vec3(.86,.89,.95),disc*uMoonK); }
        // the sun: a hard disc, a small halo in two breaths round it
        { float ang=acos(clamp(dot(d,uSunDir),-1.,1.)); float disc=1.-step(uSunR,ang); float halo=(1.-smoothstep(uSunR,uSunR*4.,ang))*.45; if(uBands>0.)halo=floor(halo*3.)/3.*.45;
          c=mix(c,mix(uSunCol,vec3(1.,.96,.9),.45),halo*uSunK); c=mix(c,uSunCol,disc*uSunK); }
        // the weather: the sky greyed under cloud, the fog closing the horizon
        c=mix(c,uGrey,uGreyK); c=mix(c,uFogC,uFogK*(1.-smoothstep(0.,.4,el)));
        if(uBands>0.)c=floor(c*uBands+.5)/uBands;
        gl_FragColor=vec4(c,1.); }`});
  const dome=new THREE.Mesh(new THREE.BoxGeometry(2000,2000,2000),mat); dome.frustumCulled=false; dome.renderOrder=900; dome.matrixAutoUpdate=true; scene.add(dome); SKY.dome=dome;
  // (the box round the camera; under the orthographic camera every ray runs the same way, so the box is shrunk to the view's width and the
  // directions to its faces spread across the screen as a sky does: lower toward the bottom, higher toward the top)
  dome.onBeforeRender=(r,s,c)=>{ dome.position.copy(c.position); dome.scale.setScalar(c.isOrthographicCamera?Math.max(1,(c.right-c.left)*1.2/2000):1); dome.updateMatrixWorld(); };
  const ca=new THREE.Color(), cb=new THREE.Color(), mixC=(a,b,t,out)=>out.copy(ca.setHex(a)).lerp(cb.setHex(b),t), D=Math.PI/180;
  // each frame, after the clock and the weather
  const tick0=CLOCK.tick; CLOCK.tick=dt=>{ tick0(dt);
    const up=LVL!=='down', inside=!!(typeof ROOMS!=='undefined'&&ROOMS.cur); dome.visible=up&&!inside; if(!dome.visible)return;
    const e=CLOCK.elev(); let i=0; while(i<P.length-2&&e>P[i+1][0])i++; const A=P[i], B=P[i+1], t=cl((e-A[0])/(B[0]-A[0]));
    mixC(A[1],B[1],t,U.uH.value); mixC(A[2],B[2],t,U.uM.value); mixC(A[3],B[3],t,U.uZ.value); mixC(A[4],B[4],t,U.uS.value); mixC(A[5],B[5],t,U.uA.value);
    U.uSideK.value=1-.6*cl((e-8)/20);   // (by day the sides fade: the sky one blue)
    // the sun: its disc where it is, 1.6° across high up, 3° at the horizon, the clock's colour whitened by day; gone once under
    const W=typeof WX!=='undefined'&&WX.now||{cloud:.2,storm:0,fog:0,flash:false}, day=cl((e+4)/14);
    U.uSunDir.value.copy(CLOCK.sunV); U.uSunR.value=(1.6+1.4*(1-cl(e/12)))*D; { let j=0; while(j<SUN.length-2&&e>SUN[j+1][0])j++; mixC(SUN[j][1],SUN[j+1][1],cl((e-SUN[j][0])/(SUN[j+1][0]-SUN[j][0])),U.uSunCol.value); }
    U.uSunK.value=cl((e+1.5)/1.5)*(1-.9*cl((W.cloud-.3)/.6));
    // the moon and the stars: through the blue hour in, by day out
    U.uMoonDir.value.copy(CLOCK.moonV); const night=cl((-e-4)/6); U.uMoonK.value=night*(1-.8*cl((W.cloud-.3)/.6)); U.uStar.value=night*(1-cl(W.cloud*1.4));
    // the weather's grey (as the flat sky had it: weather.js), the fog's colour closing the horizon
    U.uGrey.value.setRGB(.55,.58,.62).multiplyScalar(.25+.75*day); if(W.storm)U.uGrey.value.multiplyScalar(1-.45*W.storm); U.uGreyK.value=cl(W.cloud*W.cloud*.85);
    if(W.flash&&up){ U.uGrey.value.setRGB(.85,.88,.95); U.uGreyK.value=Math.max(U.uGreyK.value,.9); }
    // THE CLOUDS AT SUNSET: their undersides lit in the sun's side's colour while it's low (weather.js's uUnder), strongest at the horizon
    if(WX.under){ const k=cl(1-Math.abs(e-1)/7)*(1-cl((W.cloud-.5)/.5)); WX.under.value.copy(U.uS.value).multiplyScalar(k*.9); }
    if(scene.fog){ U.uFogC.value.copy(scene.fog.color); U.uFogK.value=cl(W.fog*1.3); } else U.uFogK.value=0; };
  SKY.dbg=()=>({elev:+CLOCK.elev().toFixed(2),sun:U.uSunK.value.toFixed(2),moon:U.uMoonK.value.toFixed(2),star:U.uStar.value.toFixed(2),grey:U.uGreyK.value.toFixed(2),H:'#'+U.uH.value.getHexString(),Z:'#'+U.uZ.value.getHexString()});
  SKY.U=U; SKY.P=P; window.SKY=SKY; }
