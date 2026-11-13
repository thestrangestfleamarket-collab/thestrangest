// YOUR FLAT'S FLATAIR (owner, 13 Nov 2026: "just do a black void for exterior no outside world other than clouds and sky through the windows that brings in realistic lighting, time of day, etc. (needs to be super atmospheric in the apartment with lighting, shadows, air, etc) go all out"): a black bowl under the horizon round your rooms (the sky and clouds above it), the real sun's shafts through each window, and dust turning slowly in the air.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, UI} from './003b-systems.js';
import {MODS, SYS} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
const FLATAIR={on:false,shafts:[],motes:null,bowl:null};
{ const V3=THREE.Vector3, Q=new THREE.Quaternion(), D=new V3(), C=new V3(), cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  const SHV=`uniform vec3 uD; uniform float uW,uZ0,uZ1,uL; varying vec3 vE;
    void main(){ vE=position+.5; vec3 b=vec3(mix(-uW*.5,uW*.5,vE.x),mix(uZ0,uZ1,vE.y),0.); gl_Position=projectionMatrix*modelViewMatrix*vec4(b+uD*(vE.z*uL),1.); }`;
  const SHF=`uniform vec3 uC; uniform float uOp,uT; varying vec3 vE;
    void main(){ float e=smoothstep(0.,.18,vE.x)*smoothstep(1.,.82,vE.x)*smoothstep(0.,.14,vE.y)*smoothstep(1.,.86,vE.y), t=1.-vE.z, f=t*t*(.85+.15*sin(uT*.7+vE.x*9.+vE.y*5.));
      gl_FragColor=vec4(uC*uOp*e*f,1.); }`;
  ROOMK.built.push(A=>{ '@apts'; const R=A.R, apt=R.apt; if(!apt)return;
    for(const s of FLATAIR.shafts)s.m.removeFromParent(); FLATAIR.shafts=[]; if(FLATAIR.motes)FLATAIR.motes.removeFromParent(); if(FLATAIR.bowl)FLATAIR.bowl.removeFromParent();
    // the void: the lower half of a sphere, black and fogless, its rim at a standing eye's height: from above and through the glass, nothing but black under the sky
    { const g=new THREE.SphereGeometry(60,32,12,0,Math.PI*2,Math.PI/2,Math.PI/2), m=new THREE.MeshBasicMaterial({color:0x000000,side:THREE.BackSide,fog:false});
      const b=new THREE.Mesh(g,m); b.position.set(A.Lx/2,1.5,A.Ly/2); b.frustumCulled=false; b.raycast=()=>{}; b.userData.keep=b.userData.soft=b.userData.noMerge=1; b.renderOrder=-3; apt.add(b); FLATAIR.bowl=b;
      const fl=new THREE.Mesh(new THREE.CircleGeometry(60,32).rotateX(-Math.PI/2),m); fl.position.set(0,-1.8,0); fl.raycast=()=>{}; fl.userData.noMerge=1; b.add(fl); }   // and a black floor just under yours: the street's ground far below never shows
    // a shaft for every window: its opening swept along the sun's light into the room, brightest at the glass
    for(const W of R.wins||[]){ const g=W.g; g.updateWorldMatrix(true,false); C.set(A.Lx/2,1.2,A.Ly/2); apt.localToWorld(C); g.worldToLocal(C); const inw=C.z>=0?1:-1;
      const U={uD:{value:new V3()},uW:{value:W.w*.96},uZ0:{value:W.z0},uZ1:{value:W.z1},uL:{value:5},uC:{value:new THREE.Color(1,.92,.78)},uOp:{value:0},uT:{value:0}};
      const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.ShaderMaterial({uniforms:U,vertexShader:SHV,fragmentShader:SHF,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}));
      m.frustumCulled=false; m.raycast=()=>{}; m.userData.keep=m.userData.soft=m.userData.noMerge=1; m.renderOrder=5; g.add(m); FLATAIR.shafts.push({m,U,g,inw,k:W.k,W}); }
    // the dust: a few hundred motes turning slowly through the room's height, catching the light
    { const N=260, P=new Float32Array(N*3), S=new Float32Array(N); for(let i=0;i<N;i++){ P[i*3]=Math.random()*A.Lx; P[i*3+1]=.2+Math.random()*(A.HW-.4); P[i*3+2]=Math.random()*A.Ly; S[i]=Math.random()*6.28; }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.setAttribute('aS',new THREE.BufferAttribute(S,1));
      const U={uT:{value:0},uK:{value:0},uX:{value:new V3(A.Lx,A.HW,A.Ly)},uPx:{value:1}};
      const m=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,
        vertexShader:`attribute float aS; uniform float uT,uPx; uniform vec3 uX; varying float vA;
          void main(){ vec3 p=position+vec3(sin(uT*.07+aS)*.35,sin(uT*.05+aS*1.7)*.25+uT*.012,cos(uT*.06+aS*1.3)*.35); p=mod(p,uX); vec4 mv=modelViewMatrix*vec4(p,1.);
            vA=.35+.65*(.5+.5*sin(uT*.9+aS*4.)); gl_PointSize=clamp(uPx*.012/max(.1,-mv.z),1.,2.); gl_Position=projectionMatrix*mv; }`,
        fragmentShader:`uniform float uK; varying float vA; void main(){ vec2 c=gl_PointCoord-.5; float d=1.-smoothstep(.2,.5,length(c)); gl_FragColor=vec4(vec3(1.,.96,.9)*uK*vA*d,1.); }`});
      const pts=new THREE.Points(g,m); pts.frustumCulled=false; pts.raycast=()=>{}; pts.userData.keep=pts.userData.soft=1; pts.renderOrder=6; apt.add(pts); FLATAIR.motes={pts,U}; FLATAIR.motesU=U; }
  });
  SYS.add('places',dt=>{ const APTS=MODS.apts, inn=!!(APTS&&APTS.inReal); FLATAIR.on=inn; if(FLATAIR.bowl)FLATAIR.bowl.visible=inn; if(FLATAIR.motes)FLATAIR.motes.pts.visible=inn;
    if(!inn){ for(const s of FLATAIR.shafts)s.m.visible=false; return; }
    const t=performance.now()/1000, e=CLOCK.elev(), day=cl((e+2)/10,0,1), low=1-cl((e-4)/30,0,1), iso=!UI.persp, sun=CLOCK.sun, WPL=APTS.WPL||{};
    if(sun&&sun.target){ D.copy(sun.target.getWorldPosition(C)).sub(sun.getWorldPosition(new V3())).normalize(); } else D.set(0,-1,0);   // the sun's light, travelling
    for(const s of FLATAIR.shafts){ s.g.getWorldQuaternion(Q); const d=D.clone().applyQuaternion(Q.invert()), into=d.z*s.inw, cut=WPL[s.k]&&WPL[s.k].constant<1e5;
      const k=e>0&&into>.05&&!cut?day*cl(into*2.2,0,1)*(s.W.shut?.15:1):0; s.m.visible=k>.002; if(!s.m.visible)continue;
      s.U.uD.value.copy(d).normalize(); s.U.uL.value=cl((s.W.z0+.05)/Math.max(.08,-d.y),1.5,7); s.U.uOp.value=k*(iso?.05:.11); s.U.uT.value=t; s.U.uC.value.setRGB(1,.86+.12*(1-low),.66+.3*(1-low)); }
    if(FLATAIR.motes){ const U=FLATAIR.motes.U; U.uT.value=t; U.uK.value=(.05+.22*day)*(iso?.35:1); U.uPx.value=(SHARED.cam&&SHARED.cam.isPerspectiveCamera?window.innerHeight:window.innerHeight*.35); } },'150ad-air');
  window.AIRDBG=()=>({on:FLATAIR.on,bowl:!!FLATAIR.bowl&&FLATAIR.bowl.visible,shafts:FLATAIR.shafts.length,lit:FLATAIR.shafts.filter(s=>s.m.visible).length,motes:!!FLATAIR.motes&&FLATAIR.motes.pts.visible}); }
