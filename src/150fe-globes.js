// THE GLOBES: the Earth on its floor stand (tilted 23.44° in its brass meridian), the Moon and Mars on a side table by the telescope; each spins on its bearing when you flick it and slows; double-click for a close look: NASA's pictures, the Earth's day and night for the game's hour, places named under your pointer.
import {THREE} from './003-shx.js';
import {SFX, UI} from './003b-systems.js';
import {MODS, SYS} from './006-map-pre.js';
import {ROOMK} from './150a-bedroom.js';
import {SCOPE} from './150fd-scope.js';
{ const FILES={earth:__FILE__("data/scope/earth.jpg"),night:__FILE__("data/scope/earth-night.jpg"),moon:__FILE__("data/scope/moon.jpg"),mars:__FILE__("data/scope/mars.jpg")};
  const GLOBE={earth:{name:'THE EARTH',tilt:23.44,col:'#3a6aa0',w:0,ang:0},moon:{name:'THE MOON',tilt:1.54,col:'#9a9890',w:0,ang:0},mars:{name:'MARS',tilt:25.19,col:'#b5643c',w:0,ang:0},view:null,tex:{},done:{},spheres:{}}; window.GLOBE=GLOBE;
  // a picture fetched the first time a globe is looked at, then kept (the room's globes take it too)
  GLOBE.texture=k=>GLOBE.tex[k]||(GLOBE.tex[k]=new Promise((ok,no)=>new THREE.TextureLoader().setCrossOrigin(location.protocol==='file:'?undefined:'anonymous').load(FILES[k],t=>{ t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4;
    GLOBE.done[k]=t; for(const m of GLOBE.spheres[k]||[]){ m.map=t; m.color.set(0xffffff); m.needsUpdate=true; } GLOBE.loaded=(GLOBE.loaded||0)+1; ok(t); },undefined,no)));
  // a flick: the ball takes the spin and its bearing slows it (a little dry friction, a little drag)
  GLOBE.flick=(k,w)=>{ GLOBE[k].w=w; };
  let gT=performance.now(); SYS.add('places',()=>{ const n=performance.now(), dt=Math.min(.5,(n-gT)/1000); gT=n; for(const k of ['earth','moon','mars']){ const G=GLOBE[k]; if(G.hold)continue; const s=Math.sign(G.w), d=(.05+.18*Math.abs(G.w))*dt; G.w=Math.abs(G.w)<=d?0:G.w-s*d; G.ang+=G.w*dt; } },'150fe-globes');

  /* ---------- the close look: its own small renderer, made when opened and let go when closed ---------- */
  const make=()=>{ '@globe';
    const D2R=Math.PI/180, cl=(v,a,b)=>Math.max(a,Math.min(b,v));
    const LABELS={earth:[[40.71,-74.01,'NEW YORK · YOU ARE HERE'],[51.51,-.13,'LONDON'],[48.86,2.35,'PARIS'],[35.68,139.69,'TOKYO'],[30.04,31.24,'CAIRO'],[-22.91,-43.2,'RIO DE JANEIRO'],[-33.87,151.21,'SYDNEY'],[19.08,72.88,'MUMBAI'],[19.43,-99.13,'MEXICO CITY'],[-1.29,36.82,'NAIROBI'],[55.76,37.62,'MOSCOW'],[39.9,116.4,'BEIJING'],[34.05,-118.24,'LOS ANGELES'],[64.15,-21.94,'REYKJAVIK'],[-34.6,-58.38,'BUENOS AIRES'],[1.35,103.82,'SINGAPORE'],[-77.85,166.67,'MCMURDO STATION']],
      moon:[[8.5,31.4,'MARE TRANQUILLITATIS'],[.67,23.47,'APOLLO 11 · 1969'],[32.8,-15.6,'MARE IMBRIUM'],[18.4,-57.4,'OCEANUS PROCELLARUM'],[-43.3,-11.4,'TYCHO'],[9.6,-20.1,'COPERNICUS'],[28,17.5,'MARE SERENITATIS'],[17,59.1,'MARE CRISIUM'],[-8.97,15.5,'APOLLO 16 · 1972'],[20.19,30.77,'APOLLO 17 · 1972']],
      mars:[[18.65,-133.8,'OLYMPUS MONS'],[-13.9,-59.2,'VALLES MARINERIS'],[-5.4,137.8,'GALE CRATER · CURIOSITY'],[18.38,77.58,'JEZERO CRATER · PERSEVERANCE'],[-42.4,70.5,'HELLAS PLANITIA'],[25.02,147.21,'ELYSIUM MONS'],[22.5,-49.97,'CHRYSE · VIKING 1'],[84,0,'THE NORTH POLAR CAP']]};
    const vec=(lat,lon)=>new THREE.Vector3(Math.cos(lat*D2R)*Math.cos(lon*D2R),Math.sin(lat*D2R),-Math.cos(lat*D2R)*Math.sin(lon*D2R));   // the pictures' longitude 0 at +x, east towards -z
    const O=document.createElement('div'); O.id='globev'; O.hidden=true; O.style.cssText='position:fixed;inset:0;z-index:30;background:radial-gradient(circle at 50% 45%,#1a1c26,#05060a);display:flex;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#3b2a1e';
    const box=document.createElement('div'); box.style.cssText='flex:1;min-width:0;position:relative;cursor:grab;touch-action:none'; O.appendChild(box);
    const lab=document.createElement('canvas'); lab.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none'; box.appendChild(lab);
    const P=document.createElement('div'); P.className='ml'; P.style.cssText='width:min(240px,40vw);overflow:auto;padding:12px;background:#ece5d3;border-left:3px solid #3b2a1e;zoom:var(--uiz,1)'; O.appendChild(P);
    const css=document.createElement('style'); css.textContent='#globev[hidden]{display:none!important} #globev .row{margin:8px 0} #globev .btn{font:inherit;padding:4px 7px;margin:0 3px 3px 0;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer} #globev .btn.on{background:#3b2a1e;color:#ece5d3} #globev .info{color:#6a4a32;line-height:1.5}';
    document.head.appendChild(css); document.body.appendChild(O);
    let full=false, phase='', R=null, cv=null, S=null, cam=null, ball=null, tiltG=null, mat=null, light=null, k='earth', labels=true, lights=true, pitch=12, dist=4.3, drag=null, hover='', last=0, sun=null;
    const panel=()=>{ const D=GLOBE.data||{}, cr=((D.globes||[]).find(g=>g.id===k)||{}).credit||'NASA';
      P.innerHTML=`<div><b>THE GLOBES</b> <button class="btn" data-a="close" style="float:right">DONE</button></div>
      <div class="row">${['earth','moon','mars'].map(q=>`<button class="btn ${q===k?'on':''}" data-g="${q}">${q.toUpperCase()}</button>`).join('')}</div>
      <div class="row"><button class="btn ${labels?'on':''}" data-a="labels">NAMES</button>${k==='moon'?`<button class="btn ${full?'on':''}" data-a="full">FULL LIGHT</button>`:''}${k==='earth'?`<button class="btn ${lights?'on':''}" data-a="lights">CITY LIGHTS</button>`:''}</div>
      <div class="row info"><b>${GLOBE[k].name}</b><br>AXIS TILTED ${GLOBE[k].tilt}°${k==='moon'&&phase?'<br>'+phase:''}<br><span id="glober"></span></div><div class="info" style="opacity:.7">${cr}</div>
      <div class="info" style="opacity:.75;margin-top:8px">DRAG TO SPIN (FLICK IT) · WHEEL TO ZOOM</div>`; };
    P.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; if(b.dataset.g){ show(b.dataset.g); return; } const a=b.dataset.a; if(a==='close')return GLOBE.close(); if(a==='labels')labels=!labels; if(a==='full'){ full=!full; show(k); return; } if(a==='lights'){ lights=!lights; if(mat&&k==='earth')mat.uniforms.uLights.value=lights?1:0; } panel(); });
    // the Earth: day where the Sun is up, the cities' lights where it is down, a thin blue air at the rim
    // one shader for all three (the game's cel steps live in three's shared chunks, so the standard materials would band): lit by the Sun, the Earth's night side with its cities' lights, the Moon's with earthshine, a thin air at the Earth's rim
    const ballMat=(day,night,earth)=>new THREE.ShaderMaterial({uniforms:{uDay:{value:day},uNight:{value:night||day},uSun:{value:new THREE.Vector3(1,0,0)},uLights:{value:earth?1:0},uObj:{value:earth?1:0},uAmb:{value:earth?.035:.02}},
      vertexShader:'varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying vec3 vV; void main(){ vUv=uv; vN=normal; vW=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.); vV=normalize(cameraPosition-w.xyz); gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader:'uniform sampler2D uDay; uniform sampler2D uNight; uniform vec3 uSun; uniform float uLights; uniform float uObj; uniform float uAmb; varying vec2 vUv; varying vec3 vN; varying vec3 vW; varying vec3 vV; void main(){ float d=dot(normalize(uObj>.5?vN:vW),uSun); vec3 day=texture2D(uDay,vUv).rgb, nl=texture2D(uNight,vUv).rgb;'
        +' float k=smoothstep(-.06,.08,d); vec3 lit=day*(.06+1.1*clamp(d*1.2+.08,0.,1.)); vec3 dark=day*uAmb+nl*nl*1.6*uLights; vec3 c=mix(dark,lit,k); float rim=pow(1.-max(dot(normalize(vW),vV),0.),3.); c+=vec3(.25,.45,1.)*rim*.55*clamp(d+.35,0.,1.)*uObj; gl_FragColor=vec4(c,1.);\n'
        +'#include <colorspace_fragment>\n}'});
    const show=async q=>{ k=q; panel(); if(!S)return; if(ball){ tiltG.remove(ball); ball.material.dispose(); } const G=GLOBE[k];
      const tex=await GLOBE.texture(k), night=k==='earth'?await GLOBE.texture('night'):null; if(k!==q||!S)return;
      mat=ballMat(tex,night,k==='earth'); if(k==='earth')mat.uniforms.uLights.value=lights?1:0;
      ball=new THREE.Mesh(GEO,mat); tiltG.add(ball); tiltG.rotation.z=-G.tilt*D2R;
      G.ang=-Math.PI/2-(k==='earth'?-74.01:0)*D2R; G.w=0;   // turned to show New York, or the side the Moon keeps towards us
      const A=await SCOPE.ready(), jd=SCOPE.jd(); sun={A,jd}; light.position.set(-3,1.2,4); if(k==='mars')mat.uniforms.uSun.value.copy(light.position).normalize(); if(k==='moon'){ const m=A.where('moon',jd), s=A.where('sun',jd), wax=((m.ra-s.ra)%360+360)%360<180, i=(full?0:m.i)*D2R, f=Math.round((1+Math.cos(m.i*D2R))*50);
        phase=`TONIGHT ${f}% LIT, ${f>97?'FULL':f<3?'NEW':(wax?'WAXING ':'WANING ')+(f<50?'CRESCENT':'GIBBOUS')}`; light.position.set((wax?1:-1)*Math.sin(i)*5,.3,Math.cos(i)*5); mat.uniforms.uSun.value.copy(light.position).normalize(); panel(); } };   // the Moon lit as it is tonight
    let GEO=null;
    const open=async q=>{ O.hidden=false; cv=document.createElement('canvas'); cv.style.cssText='position:absolute;inset:0;width:100%;height:100%'; box.insertBefore(cv,lab);
      R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true}); R.setPixelRatio(Math.min(2,devicePixelRatio||1)); R.outputColorSpace=THREE.SRGBColorSpace;
      S=new THREE.Scene(); cam=new THREE.PerspectiveCamera(30,1,.1,50); GEO=GEO||new THREE.SphereGeometry(1,96,64); tiltG=new THREE.Group(); S.add(tiltG);
      light=new THREE.DirectionalLight(0xffffff,2.6); S.add(light); S.add(new THREE.AmbientLight(0x404650,.25)); last=performance.now(); await show(q||k); };
    const close=()=>{ O.hidden=true; drag=null; if(R){ R.dispose(); R.forceContextLoss(); cv.remove(); } if(mat)mat.dispose(); R=S=ball=mat=null; };
    // spin it with your hand: while you hold it, it follows; let go and it keeps the speed you gave it
    box.addEventListener('pointerdown',e=>{ drag={x:e.clientX,y:e.clientY,t:performance.now(),w:0}; GLOBE[k].hold=1; GLOBE[k].w=0; box.setPointerCapture(e.pointerId); box.style.cursor='grabbing'; });
    box.addEventListener('pointermove',e=>{ const r=box.getBoundingClientRect(); if(R&&ball){ const ray=new THREE.Raycaster(), m=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); ray.setFromCamera(m,cam); const h=ray.intersectObject(ball)[0];
        if(h){ const p=ball.worldToLocal(h.point.clone()).normalize(), la=Math.asin(p.y)/D2R, lo=Math.atan2(-p.z,p.x)/D2R; hover=`${Math.abs(la).toFixed(1)}°${la>=0?'N':'S'} ${Math.abs(lo).toFixed(1)}°${lo>=0?'E':'W'}`; } else hover=''; }
      if(!drag)return; const n=performance.now(), dx=e.clientX-drag.x, dy=e.clientY-drag.y, dt=Math.max(.008,(n-drag.t)/1000), a=dx/r.width*Math.PI*1.2*(dist/3.6); GLOBE[k].ang+=a; drag.w=drag.w*.5+.5*a/dt; pitch=cl(pitch+dy*.25,-70,70); drag.x=e.clientX; drag.y=e.clientY; drag.t=n; });
    const up=()=>{ if(!drag)return; GLOBE[k].hold=0; if(performance.now()-drag.t<90)GLOBE.flick(k,cl(drag.w,-25,25)); drag=null; box.style.cursor='grab'; }; box.addEventListener('pointerup',up); box.addEventListener('pointercancel',up);
    box.addEventListener('wheel',e=>{ e.preventDefault(); dist=cl(dist*(e.deltaY>0?1.1:.9),1.5,7); },{passive:false});
    const keys=e=>{ if(O.hidden)return; if(e.key==='Escape'&&e.type==='keydown'){ GLOBE.close(); e.stopImmediatePropagation(); } }; addEventListener('keydown',keys,true);
    SYS.add('places',()=>{ if(O.hidden||!R)return; const n=performance.now(); last=n; const w=box.clientWidth, h=box.clientHeight; if(cv.width!==Math.round(w*R.getPixelRatio())||cv.height!==Math.round(h*R.getPixelRatio()))R.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix();
      cam.position.set(0,Math.sin(pitch*D2R)*dist,Math.cos(pitch*D2R)*dist); cam.lookAt(0,0,0); if(ball){ ball.rotation.y=GLOBE[k].ang; }
      if(ball&&k==='earth'&&sun){ const jd=SCOPE.jd(), s=sun.A.where('sun',jd), lo=((s.ra-sun.A.gmst(jd))%360+540)%360-180; mat.uniforms.uSun.value.copy(vec(s.dec,lo)); sun.ss=[s.dec,lo]; }
      R.render(S,cam);
      // the names, only on the side facing you
      const dpr=Math.min(2,devicePixelRatio||1), g=lab.getContext('2d'); if(lab.width!==w*dpr){ lab.width=w*dpr; lab.height=h*dpr; } g.setTransform(dpr,0,0,dpr,0,0); g.clearRect(0,0,w,h);
      if(labels&&ball){ ball.updateMatrixWorld(true); g.font='10px Silkscreen,monospace'; g.textAlign='left'; const cd=cam.position.clone().normalize();
        for(const [la,lo,nm] of LABELS[k]){ const v=vec(la,lo).applyMatrix4(ball.matrixWorld); if(v.clone().normalize().dot(cd)<.2)continue; const p=v.clone().project(cam), x=(p.x+1)/2*w, y=(1-p.y)/2*h;
          g.fillStyle='rgba(255,220,120,.95)'; g.beginPath(); g.arc(x,y,2.5,0,7); g.fill(); g.fillStyle='rgba(0,0,0,.6)'; g.fillText(nm,x+6,y+4); g.fillStyle='#f4ead2'; g.fillText(nm,x+5,y+3); } }
      const el=document.getElementById('glober'); if(el){ let s=hover?'UNDER YOUR HAND '+hover:'&nbsp;'; if(k==='earth'&&sun&&sun.ss)s+=`<br>THE SUN IS OVERHEAD AT ${Math.abs(sun.ss[0]).toFixed(1)}°${sun.ss[0]>=0?'N':'S'} ${Math.abs(sun.ss[1]).toFixed(1)}°${sun.ss[1]>=0?'E':'W'}`; el.innerHTML=s; } },'150fe-globes view');
    return {open,close,show,state:()=>({k,open:!O.hidden,gl:!!R,tex:!!(mat&&mat.uniforms&&mat.uniforms.uDay.value&&mat.uniforms.uDay.value.image),hover})}; };

  GLOBE.open=async k=>{ if(window.LOAD)await LOAD('globe'); await SCOPE.ready(); if(!GLOBE.data)GLOBE.data=await SCOPE.json(); if(!GLOBE.view)GLOBE.view=make(); await GLOBE.view.open(k); };
  GLOBE.close=()=>{ if(GLOBE.view)GLOBE.view.close(); };

  /* ---------- in your apartment: the floor globe and a side table with the Moon and Mars, plain painted balls until first looked at ---------- */
  const plain=(col,k)=>{ '@later'; const c=document.createElement('canvas'); c.width=256; c.height=128; const g=c.getContext('2d'); g.fillStyle=col; g.fillRect(0,0,256,128); g.strokeStyle='rgba(255,246,220,.35)'; g.lineWidth=1;
    for(let i=1;i<12;i++){ g.beginPath(); g.moveTo(i*256/12,0); g.lineTo(i*256/12,128); g.stroke(); } for(let i=1;i<6;i++){ g.beginPath(); g.moveTo(0,i*128/6); g.lineTo(256,i*128/6); g.stroke(); }
    g.strokeStyle='rgba(255,236,170,.6)'; g.beginPath(); g.moveTo(0,64); g.lineTo(256,64); g.stroke(); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t; };
  for(const k of ['EARTH GLOBE', 'GLOBE TABLE'])ROOMK.always.add(k);   // in every apartment from the start (owner, 7 Nov 2026)
  ROOMK.parts.push(c=>{ '@apts'; const {part,mat,rbox,cap,cur,solid}=c, p=(geo,m,u,h,v,ry=0,par=cur(),cast=true)=>part(geo,m,u,h,v,ry,par,cast), keep=me=>{ me.userData.keep=1; return me; };
    const wood=mat([110,70,38]), woodD=mat([78,48,26]), brass=mat([200,156,74]);
    const ball=(k,r,par)=>{ const T=new THREE.Group(); T.rotation.z=-GLOBE[k].tilt*Math.PI/180; T.userData.tilt=k; par.add(T); const S=new THREE.Group(); S.userData.spin=k; T.add(S);
      const m=new THREE.MeshLambertMaterial({color:0xffffff,map:GLOBE.done[k]||plain(GLOBE[k].col,k)}); (GLOBE.spheres[k]=GLOBE.spheres[k]||[]).push(m);
      const me=keep(new THREE.Mesh(new THREE.SphereGeometry(r,40,28),m)); me.castShadow=true; S.add(me);
      keep(p(new THREE.TorusGeometry(r+.012,.005,6,48),brass,0,0,0,0,T)); keep(p(new THREE.CylinderGeometry(.004,.004,2*r+.06,6),brass,0,0,0,0,T)); return T; };
    const E0=[.45,7];   // against the west wall (owner, 7 Nov 2026: "put all the stuff in apartment along the walls")
    cap('EARTH GLOBE',()=>{ const G=new THREE.Group(); G.position.set(E0[0],0,E0[1]); cur().add(G); const H=1.02, r=.23;
      for(let i=0;i<4;i++){ const a=i*Math.PI/2+Math.PI/4; p(rbox(.04,.05,.3,.01),woodD,Math.cos(a)*.13,.025,Math.sin(a)*.13,-a+Math.PI/2,G); p(new THREE.SphereGeometry(.022,8,6),brass,Math.cos(a)*.27,.02,Math.sin(a)*.27,0,G); }
      p(new THREE.CylinderGeometry(.035,.05,H-r-.12,12),wood,0,(H-r-.12)/2+.05,0,0,G); p(new THREE.CylinderGeometry(.05,.035,.06,12),wood,0,H-r-.06,0,0,G);
      const ring=p(new THREE.TorusGeometry(r+.06,.018,6,40).rotateX(Math.PI/2),wood,0,H,0,0,G); for(let i=0;i<3;i++){ const a=i*Math.PI*2/3+.3, A=new THREE.Vector3(0,H-r-.08,0), B=new THREE.Vector3(Math.cos(a)*(r+.06),H-.01,Math.sin(a)*(r+.06)), D=B.clone().sub(A), st=p(new THREE.CylinderGeometry(.011,.011,D.length(),6),wood,(A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2,0,G); st.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),D.normalize()); }   // three arms from the column up to the horizon ring
      const C=new THREE.Group(); C.position.set(0,H,0); G.add(C); ball('earth',r,C); solid(E0[0]-.3,E0[1]-.3,E0[0]+.3,E0[1]+.3,H+r); },{wire:'globe',bake:true});
    const T0=[.42,c.Ly-1.3], TH=.64;
    cap('GLOBE TABLE',()=>{ const G=new THREE.Group(); G.position.set(T0[0],0,T0[1]); cur().add(G); p(new THREE.CylinderGeometry(.3,.3,.03,28),wood,0,TH-.015,0,0,G); p(new THREE.CylinderGeometry(.03,.04,TH-.03,10),woodD,0,(TH-.03)/2,0,0,G);
      for(let i=0;i<3;i++){ const a=i*Math.PI*2/3; p(rbox(.04,.03,.24,.008),woodD,Math.cos(a)*.1,.015,Math.sin(a)*.1,-a+Math.PI/2,G); } solid(T0[0]-.3,T0[1]-.3,T0[0]+.3,T0[1]+.3,TH); },{bake:true});
    for(const [k,du,dv] of [['moon',-.13,-.04],['mars',.12,.06]])cap(k.toUpperCase()+' GLOBE',()=>{ const G=new THREE.Group(); G.position.set(T0[0]+du,TH,T0[1]+dv); cur().add(G); const r=.085;
      p(new THREE.CylinderGeometry(.05,.055,.015,16),brass,0,.008,0,0,G); p(new THREE.CylinderGeometry(.007,.007,.07,8),brass,0,.05,0,0,G); const C=new THREE.Group(); C.position.set(0,.085+r,0); G.add(C); ball(k,r,C); },{wire:'globe',bake:true});
  });
  ROOMK.wires.globe=(un,c)=>{ let S=null, k=null; un.obj.traverse(o=>{ if(o.userData.spin){ S=o; k=o.userData.spin; } }); if(!S)return;
    c.hit(un,()=>GLOBE[k].name.replace('THE ','')+' GLOBE',()=>{ GLOBE.open(k); if(SFX)SFX.play('click',{vol:.4,vary:.2}); });
    un.tick=()=>{ S.rotation.y=GLOBE[k].ang; }; };
  SYS.add('places',()=>{ if(GLOBE.view&&GLOBE.view.state().open&&!(MODS.apts&&MODS.apts.inReal))GLOBE.close(); },'150fe-globes close');
  window.GLOBEDBG=()=>({earth:{w:GLOBE.earth.w,ang:GLOBE.earth.ang},view:GLOBE.view?GLOBE.view.state():null,loaded:GLOBE.loaded||0,things:UI.things.filter(t=>/GLOBE$/.test(t.name)).map(t=>t.name)});
}
