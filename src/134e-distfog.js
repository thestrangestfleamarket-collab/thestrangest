// THE DISTANCE FOG: the further past you a thing is (from the camera), the darker and more blurred it is, slightly, and the air between takes it: a thin haze everywhere and a ground mist that thins with height, in the horizon's colour greyed, warm toward the sun, the sky's own colour only on a level sightline where the air is nearly opaque, smooth or in stepped dithered bands (STEPS); the last stretch before its end and the land's rim fade into what is seen just above them, so nothing pops where the drawing stops (CULL); the sky untouched; under water it is the water's fog; in a steamy room (SHARED.steam) the steam; ATMOSPHERE sets it.
import {SHARED, THREE} from './003-shx.js';
import {BATCH, CLOCK, CULL, ED, FAR3, MAPED, pos, ROOMS, UI} from './003b-systems.js';
import {renderer, scene, ShaderPass} from './004-main.js';
import {SAVE} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
import {RIVER} from './066-river.js';
import {TPANE} from './087dz-tpane.js';
const DFOG={};
{ const D0={on:true,cut:false,start:40,end:180,blur:0,haze:0,air:.3,mist:.4,most:.6,mistH:3,sun:0,g:.6,rays:1,tint:.25,steps:0,rim:0}; let C; try{ C=Object.assign({},D0); }catch(e){ C=Object.assign({},D0); }   // far things darker and blurrier, never hazed or cut (owner, 7 Nov 2026: "as something like the helicopter gets further away its less clear and gets darker and blurrier")
  const comp=SHARED.composer;
  for(const rt of [comp.renderTarget1,comp.renderTarget2])if(!rt.depthTexture){ rt.depthTexture=new THREE.DepthTexture(rt.width,rt.height); rt.depthTexture.type=THREE.UnsignedIntType; rt.dispose(); }
  const pass=new ShaderPass({uniforms:{tDiffuse:{value:null},uAM:{value:1},tDepth:{value:null},uPInv:{value:new THREE.Matrix4()},uCamW:{value:new THREE.Matrix4()},uP:{value:new THREE.Vector3()},uC:{value:new THREE.Color()},
      uS:{value:0},uE:{value:1},uD:{value:1},uW:{value:-1e9},uV:{value:1},uB:{value:0},uH:{value:0},uF:{value:0},uR:{value:new THREE.Vector2(1,1)},uY:{value:new THREE.Vector2(0,1)},uK:{value:new THREE.Vector4(-1e9,-1e9,1e9,1e9)},uO:{value:1},uQ0:{value:new THREE.Vector3()},uQ1:{value:new THREE.Vector3()},uQK:{value:new THREE.Vector2()},uQC:{value:new THREE.Color()},uA:{value:new THREE.Vector3(0,0,1)},uG:{value:0},uMC:{value:new THREE.Color()},uSC:{value:new THREE.Color()},uSun:{value:new THREE.Vector4(0,1,0,.75)},uShN:{value:null},uShF:{value:null},uMN:{value:new THREE.Matrix4()},uMF:{value:new THREE.Matrix4()},uOcc:{value:0},uHasF:{value:0},uSt:{value:8},uRm:{value:new THREE.Vector3(0,0,1)},uNF:{value:new THREE.Vector2(1,1e4)},uU:{value:0}},
    vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:`uniform sampler2D tDiffuse,tDepth; uniform mat4 uPInv,uCamW; uniform vec3 uP,uC; uniform float uS,uE,uB,uH,uF,uW,uV,uD; uniform vec2 uR,uY; uniform vec4 uK; uniform float uO; uniform vec3 uQ0,uQ1,uQC; uniform vec2 uQK; uniform vec3 uA,uMC,uSC,uRm; uniform float uG,uSt,uAM; uniform vec4 uSun; uniform vec2 uNF; uniform sampler2D uShN,uShF; uniform mat4 uMN,uMF; uniform float uOcc,uHasF,uU;
      float sunAt(vec3 p){ vec4 a=uMN*vec4(p,1.); vec3 q=a.xyz/a.w; if(q.x>.02&&q.x<.98&&q.y>.02&&q.y<.98&&q.z<1.)return step(q.z-.002,texture2D(uShN,q.xy).r);
        if(uHasF>.5){ vec4 b=uMF*vec4(p,1.); vec3 r=b.xyz/b.w; if(r.x>0.&&r.x<1.&&r.y>0.&&r.y<1.&&r.z<1.)return step(r.z-.002,texture2D(uShF,r.xy).r); } return -1.; } varying vec2 vUv;
      float by(vec2 p){ vec2 q=floor(p*.25), h=mod(q,2.), l=mod(floor(q*.5),2.); return (4.*mod(h.x*2.+h.y*3.,4.)+mod(l.x*2.+l.y*3.,4.)+.5)/16.; }
      float lin(float z){ return uNF.x*uNF.y/(uNF.y-z*(uNF.y-uNF.x)); }
      float qh(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5); }
      float qn(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(mix(qh(i),qh(i+vec3(1,0,0)),f.x),mix(qh(i+vec3(0,1,0)),qh(i+vec3(1,1,0)),f.x),f.y),mix(mix(qh(i+vec3(0,0,1)),qh(i+vec3(1,0,1)),f.x),mix(qh(i+vec3(0,1,1)),qh(i+vec3(1,1,1)),f.x),f.y),f.z); }
      void main(){ float d=texture2D(tDepth,vUv).x, f=0., m=0., dd=0., land=0.; vec4 c=texture2D(tDiffuse,vUv);
        if(d>=1.){ for(int k=1;k<=2;k++){ float db=texture2D(tDepth,vUv-vec2(0.,float(k)/uR.y)).x; if(db<1.&&lin(db)>.6*uNF.y){ d=db; break; } } }   // (land at the very end of the view reads as the sky's depth: hazed like the land just under it, never left as a dark line)
        if(uO>.5){
        if(d<1.){ vec4 v=uPInv*vec4(vUv*2.-1.,d*2.-1.,1.); v/=v.w; vec3 w=(uCamW*v).xyz, cp=(uCamW*vec4(0.,0.,0.,1.)).xyz; dd=mix(max(0.,distance(w,cp)-distance(uP,cp)),length(w.xz-uP.xz),uV); float g=smoothstep(uS,uE,dd), g2=smoothstep(uS*.4,uE,dd), ge=g2*g2, gw=smoothstep(uS,uE*2.,dd), wet=step(w.y,uW); land=step(uK.x,w.x)*step(w.x,uK.z)*step(uK.y,w.z)*step(w.z,uK.w);
          f=g; m=land>.5?mix(uF>0.?ge:g*uH,gw,wet):uH>0.?mix(mix(mix(min(.85,g),g,uF),gw,wet),min(.85,g),smoothstep(uY.x,uY.y,vUv.y)):0.; }
        else if(uH>0.&&uV>0.){ vec4 v=uPInv*vec4(vUv*2.-1.,1.,1.); v/=v.w; vec3 w=(uCamW*v).xyz, cp=(uCamW*vec4(0.,0.,0.,1.)).xyz; m=smoothstep(0.,-.03,(w.y-cp.y)/length(w-cp)); }
        if(f>.001&&uB>0.){ vec2 o=uB*f/uR; vec4 s=c*2.+texture2D(tDiffuse,vUv+vec2(o.x,0.))+texture2D(tDiffuse,vUv-vec2(o.x,0.))+texture2D(tDiffuse,vUv+vec2(0.,o.y))+texture2D(tDiffuse,vUv-vec2(0.,o.y))
          +texture2D(tDiffuse,vUv+o)+texture2D(tDiffuse,vUv-o)+texture2D(tDiffuse,vUv+vec2(o.x,-o.y))+texture2D(tDiffuse,vUv+vec2(-o.x,o.y)); c=s/10.; }
        vec3 to=uC; if(uD>0.){ m=0.; if(d<1.){ c.rgb*=1.-uH*smoothstep(uS,uE,dd);
            vec4 v=uPInv*vec4(vUv*2.-1.,d*2.-1.,1.); v/=v.w; vec3 w=(uCamW*v).xyz, cp=(uCamW*vec4(0.,0.,0.,1.)).xyz, seg=w-cp, ins=uC; float L=length(seg), a=0., rf=0.; vec3 ray=seg/max(.001,L);
            if(uA.x+uA.y>0.){ float lo=max(0.,min(cp.y,w.y)-uG)*uA.z, dh=abs(seg.y)*uA.z, avg=(dh<.001?1.-dh*.5+dh*dh/6.:(1.-exp(-dh))/dh)*exp(-lo);
              a=min(uAM,1.-exp(-max(0.,L-uS)*(uA.x+uA.y*avg))); if(uSt>0.)a=min(1.,floor(a*uSt+by(gl_FragCoord.xy))/uSt);
              float sb=(1.-smoothstep(0.,.05,abs(ray.y)))*smoothstep(.55,.97,a); float mu=dot(ray,uSun.xyz), g=uSun.w, lt=1.; if(mu>-.2&&uSC.r+uSC.g+uSC.b>0.){ vec3 n=normalize(cross(dFdx(w),dFdy(w))); if(dot(n,ray)>0.)n=-n; float tn=uSun.y/max(.05,length(uSun.xz)), hs=dot(n,uSun.xyz)<0.?max(0.,w.y-uP.y)/max(.05,tn):0.; lt=0.;   // a face turned from the sun shades the air in front of it as far as its shadow reaches
                for(int i=0;i<8;i++){ float t=(float(i)+.5)/8., m=uOcc>.5?sunAt(cp+seg*t):-1.; lt+=min(m>=0.?m:1.,step(hs,(1.-t)*L)); } lt/=8.; }   // the air in a shadow (a building's, a tree's) is not lit by the sun
              ins=mix(uMC,uC,sb)+uSC*lt*(1.-g*g)/pow(1.+g*g-2.*g*mu,1.5); c.rgb=mix(c.rgb,ins,a); }
            m=uF>0.?land*smoothstep(uF*.67,uF,dd)*step(dd,uF*1.05):0.;
            if(uRm.x>0.){ float ri=min(min(w.x-uK.x,uK.z-w.x),min(w.z-uK.y,uK.w-w.z)); rf=land*(1.-smoothstep(0.,uRm.x,ri))*smoothstep(uRm.y,uRm.z,L); m=max(m,rf); }
            if(m>.001){ float hit=0., L0=lin(d); vec3 acc=vec3(0.); float na=0.; for(int i=1;i<=14;i++){ vec2 q=vUv+vec2(0.,float(i*i)*3./uR.y); if(q.y>1.)break; float dq=texture2D(tDepth,q).x; if(dq>=1.||rf>.001&&lin(dq)>L0*1.25){ hit=1.; for(int j=0;j<5;j++){ vec2 r=q+vec2((float(j)-2.)*9./uR.x,float(j*j)*4./uR.y); if(r.y<=1.&&texture2D(tDepth,r).x>=1.){ acc+=texture2D(tDiffuse,r).rgb; na+=1.; } } break; } } to=na>0.?mix(acc/na,ins,.35):ins; } } }
        if(uU>.5&&d>=1.)m=1.;   // under water nothing is drawn past the murk: what is left is the murk, not the sky
        c.rgb=mix(c.rgb,to,m); }
        if(uQK.x>0.){ vec4 a=uPInv*vec4(vUv*2.-1.,-1.,1.), b=uPInv*vec4(vUv*2.-1.,min(d,.99999)*2.-1.,1.); vec3 ro=(uCamW*vec4(a.xyz/a.w,1.)).xyz, rd=(uCamW*vec4(b.xyz/b.w,1.)).xyz-ro;
          vec3 iv=1./(rd+step(abs(rd),vec3(1e-7))*1e-7), t0=(uQ0-ro)*iv, t1=(uQ1-ro)*iv, lo=min(t0,t1), hi=max(t0,t1); float tn=max(max(max(lo.x,lo.y),lo.z),0.), tf=min(min(min(hi.x,hi.y),hi.z),1.);
          if(tf>tn){ float k=0.; for(int i=0;i<6;i++){ vec3 p=ro+rd*mix(tn,tf,(float(i)+.5)/6.), q=p*.35+vec3(uQK.y*.09,-uQK.y*.06,uQK.y*.05); k+=.7+.4*qn(q)+.2*qn(q*2.3-vec3(uQK.y*.08)); }
            c.rgb=mix(c.rgb,uQC,1.-exp(-uQK.x*(tf-tn)*length(rd)*k/6.)); } }
        gl_FragColor=c; }`});
  const draw=pass.render.bind(pass), HZ=new THREE.Color(.78,.81,.85), HV=new THREE.Vector3();
  pass.render=(r,w,rb,dt,mask)=>{ const u=pass.uniforms, cam=(SHARED.RPASS&&SHARED.RPASS.camera)||SHARED.cam; u.tDepth.value=rb.depthTexture; u.uPInv.value.copy(cam.projectionMatrixInverse); u.uCamW.value.copy(cam.matrixWorld);
    u.uP.value.copy(pos); u.uS.value=C.start*TILE; u.uE.value=Math.max(C.start+1,C.end)*TILE; const iso=!UI.persp, dn=SHARED.LVL==='down'||!!(ROOMS.cur&&ROOMS.cur.off&&ROOMS.off[ROOMS.cur.off]&&ROOMS.off[ROOMS.cur.off].clearAir); u.uB.value=iso||dn?0:C.blur; u.uH.value=iso||dn?0:C.haze; { const f=DFOG.cut(), g=CULL.drawD?CULL.drawD():0; u.uF.value=dn?0:f>0&&g>0?Math.min(f,g):f||g; }   // where the drawing stops, the far fades into the sky above it
    u.uC.value.copy(FAR3.fog&&FAR3.fog.color||(scene.background&&scene.background.isColor?scene.background:HZ)); u.uR.value.set(rb.width,rb.height); u.uW.value=RIVER&&RIVER.box&&!dn?RIVER.box.lv+.2*TILE:-1e9; u.uV.value=1; u.uD.value=1;   // the Hudson's water fades softer and further than land, so from high up it has no hard ring
    { const c=cam.position, d=HV.set(0,0,-1).applyQuaternion(cam.quaternion); d.y=0; d.normalize(); HV.copy(c).addScaledVector(d,400*TILE).setY(0).project(cam); const hz=(HV.y+1)/2; u.uY.value.set(hz+.08,hz+.5); }   // the skyline: whole haze at the horizon, clearing up the screen
    if(FAR3.land)u.uK.value.set(...FAR3.land);
    // the air: AIR and MIST are the share taken at the fog's END (over level ground for the mist), MIST HEIGHT where the mist has thinned to a third; the sun's lobe fades out as it sets; the mist's colour is the horizon's greyed by TINT
    { const E=u.uE.value, den=f=>-Math.log(1-Math.min(.95,Math.max(0,f)))/Math.max(TILE,E-u.uS.value); if(iso||dn)u.uA.value.set(0,0,1); else { const e=CLOCK.elev(), ls=1+.8*Math.max(0,Math.min(1,(e+4)/6))*(1-Math.max(0,Math.min(1,(e-4)/14))); u.uA.value.set(den(Math.min(.9,C.air*ls)),den(Math.min(.9,C.mist*ls)),1/(Math.max(.5,C.mistH)*TILE)); }   // (thicker as the sun sets: owner, 8 Nov 2026) u.uAM.value=C.most??1;
      const hc=u.uC.value, l=hc.r*.3+hc.g*.59+hc.b*.11; u.uMC.value.setRGB(l*.92,l*.92,l*.92).lerp(hc,1-C.tint); const sv=CLOCK.sunV, k=Math.max(0,Math.min(1,(CLOCK.elev()+6)/12)); u.uSun.value.set(sv.x,sv.y,sv.z,C.g??.6); { const sh=CLOCK.sun&&CLOCK.sun.shadow, f=CLOCK.sunF&&CLOCK.sunF.shadow, occ=!!(sh&&sh.map&&renderer.shadowMap.enabled&&renderer.shadowMap.type===THREE.BasicShadowMap&&!iso&&!dn); u.uOcc.value=occ?1:0;
        if(occ){ u.uShN.value=sh.map.depthTexture||sh.map.texture; u.uMN.value.copy(sh.matrix); const hf=!!(f&&f.map); u.uHasF.value=hf?1:0; if(hf){ u.uShF.value=f.map.depthTexture||f.map.texture; u.uMF.value.copy(f.matrix); } } } const lo=1+1.5*(1-Math.max(0,Math.min(1,(CLOCK.elev()-2)/16))); u.uSC.value.copy(CLOCK.sun.color).multiplyScalar(C.sun*k*.08*lo); SHARED.hazeRays=C.on&&!iso&&!dn?(C.rays||0)*k:0;
      u.uSt.value=C.steps; u.uRm.value.set(iso||dn?0:C.rim*TILE,u.uS.value,u.uS.value*2); u.uNF.value.set(cam.near,cam.far); u.uG.value=0; }
    // under water (owner, 29 Oct 2026: "needs a fog filter but for water so you cant see too far"): the same pass is the water's fog, every pixel by its distance, a little blur
    const W=DFOG.under; u.uU.value=W?1:0; if(W){ u.uS.value=W.s; u.uE.value=Math.max(W.s+1,W.e); u.uB.value=1.4; u.uH.value=1; u.uF.value=0; u.uD.value=0; u.uW.value=-1e9; u.uV.value=0; u.uC.value.copy(W.c); u.uK.value.set(-1e9,-1e9,1e9,1e9); u.uA.value.set(0,0,1); u.uAM.value=1; u.uRm.value.x=0; u.uP.value.copy((SHARED.RPASS&&SHARED.RPASS.camera||SHARED.cam).position); }
    u.uO.value=C.on||W?1:0; const S=SHARED.steam; if(S){ u.uQ0.value.set(S.b[0],S.b[1],S.b[2]); u.uQ1.value.set(S.b[3],S.b[4],S.b[5]); u.uQK.value.set(S.k,performance.now()/1000); u.uQC.value.copy(S.c); } else u.uQK.value.x=0;
    draw(r,w,rb,dt,mask); };
  pass.enabled=C.on; comp.insertPass(pass,1); SHARED.carry(pass);
  // a room's steam (SHARED.steam: {b:[x0,y0,z0,x1,y1,z1], k: thickness per unit, c: colour}): the same pass fogs each pixel by how far its view through the box runs, so it reads the same from every camera
  let stOn=false; SYS.add('rooms',()=>{ const on=!!SHARED.steam&&!renderer.xr.isPresenting; if(on!==stOn){ stOn=on; pass.enabled=C.on||on; } },'134e-steam');
  const save=()=>{ try{ SAVE.set('dfog9',JSON.stringify(C)); }catch(e){} pass.enabled=C.on||stOn; };
  Object.assign(DFOG,{pass,get:()=>Object.assign({},C),set:o=>{ Object.assign(C,o); save(); },
    cut:()=>C.on&&C.cut&&UI.persp&&!UI.freeCam&&!ED.on&&!MAPED.on&&!renderer.xr.isPresenting?Math.max(C.start+1,C.end)*TILE:0,
    range:end=>{ const band=Math.max(1,C.end-C.start); C.end=Math.max(8,Math.min(120,Math.round(end))); C.start=Math.max(4,C.end-band); save(); for(const f of DFOG.onchange)f(); }}); DFOG.onchange=[]; window.DFOG=DFOG;
  BATCH.reach=()=>{ if(UI.view==='iso')return [48*TILE,64*TILE]; const c=DFOG.cut(), K=c?[c+4*TILE,c+20*TILE]:[Infinity,Infinity]; return ROOMS.offIn()?[Math.min(K[0],48*TILE),Math.min(K[1],64*TILE)]:K; };   // painted ground follows the HAZE RANGE: up to just past the haze, everything when nothing is cut (in a room off the map never past 64 tiles, so the stow lets go of what its windows cannot show); the isometric view (30 tiles across at most) keeps the near ring
  // the player's HAZE RANGE in GRAPHICS: where the haze takes everything (the fog's END; the band before it keeps its width)
  const gfx=()=>{ const P=document.querySelector('#menu [data-p="graphics"]'); if(!P)return setTimeout(gfx,1000); if(P.querySelector('#dhaze'))return;
    const B=document.createElement('div'); B.innerHTML='<h3>HAZE RANGE</h3><div class="row"><span>NEAR</span><input type="range" id="dhaze" min="20" max="120" step="5"><span>FAR</span><span id="dhazev"></span></div><div class="dim">how far you see before the haze takes everything; further draws more and costs more</div>';
    P.appendChild(B); const R=B.querySelector('#dhaze'), V=B.querySelector('#dhazev'), show=()=>{ R.value=C.end; V.textContent=C.end+' TILES'; }; R.oninput=e=>DFOG.range(+e.target.value); DFOG.onchange.push(show); show(); };
  // (no HAZE RANGE or DISTANCE FOG in the menu: owner, 7 Nov 2026)
  // its numbers in ATMOSPHERE, under HAZE
  const ui=()=>{ const P=document.querySelector('[data-p="atmo"]'); if(!P)return setTimeout(ui,1000); if(P.querySelector('#dfog'))return;
    const B=document.createElement('div'); B.id='dfog';
    B.innerHTML='<h3>DISTANCE FOG</h3><div class="dftp"></div><div class="dim">how far from you the world starts to darken and blur (START, in tiles), how much it blurs (BLUR) and darkens (DARKER); the air: the thin haze everywhere (AIR) and the ground mist (MIST), their share at the END, how high the mist stands (MIST HEIGHT, tiles), the warmth of the sun in it (SUN GLOW), how grey it is (TINT), its bands (STEPS, 0 smooth) and how wide the edge of the land fades into the sky (RIM, tiles); where the drawing stops (its last stretch faded softly) is HAZE RANGE, in GRAPHICS</div>';
    P.appendChild(B); const el=B.querySelector('.dftp'), tell=()=>{ for(const f of DFOG.onchange)f(); };
    const num=k=>[()=>C[k],v=>{ v=+(+v).toFixed(4); if(v===C[k])return; C[k]=v; if(k==='start'&&C.end<C.start+1)C.end=C.start+1; save(); tell(); }];
    const V=TPANE.live({on:[()=>C.on,v=>{ if(v===C.on)return; C.on=v; save(); tell(); }],cut:[()=>C.cut,v=>{ if(v===C.cut)return; C.cut=v; save(); tell(); }],start:num('start'),blur:num('blur'),haze:num('haze'),air:num('air'),mist:num('mist'),most:num('most'),mistH:num('mistH'),sun:num('sun'),g:num('g'),rays:num('rays'),tint:num('tint'),steps:num('steps'),rim:num('rim')}); let mk=null;
    const draw=()=>{ '@later'; mk=mk||TPANE.make(el).then(p=>{ p.addBinding(V,'on',{label:'ON'}); p.addBinding(V,'cut',{label:'DRAW TO RANGE'}); p.addBinding(V,'start',{label:'START',min:4,max:60,step:1}); p.addBinding(V,'blur',{label:'BLUR',min:0,max:5,step:.1}); p.addBinding(V,'haze',{label:'DARKER',min:0,max:.8,step:.01}); p.addBinding(V,'air',{label:'AIR',min:0,max:.9,step:.01}); p.addBinding(V,'mist',{label:'MIST',min:0,max:.95,step:.01}); p.addBinding(V,'most',{label:'AIR AT MOST (FAR THINGS KEEP THEIR COLOUR)',min:0,max:1,step:.01}); p.addBinding(V,'mistH',{label:'MIST HEIGHT',min:1,max:20,step:.5}); p.addBinding(V,'sun',{label:'SUN GLOW',min:0,max:2,step:.05}); p.addBinding(V,'g',{label:'SUN GLOW SPREAD (FORWARD SCATTER)',min:0,max:.95,step:.01}); p.addBinding(V,'rays',{label:'SUN RAYS',min:0,max:2,step:.05}); p.addBinding(V,'tint',{label:'TINT',min:0,max:1,step:.05}); p.addBinding(V,'steps',{label:'STEPS',min:0,max:16,step:1}); p.addBinding(V,'rim',{label:'RIM',min:0,max:20,step:1});
        p.addButton({title:'RESET'}).on('click',()=>{ Object.assign(C,D0); save(); tell(); }); return p; }).catch(e=>{ mk=null; throw e; }); return mk.then(p=>p.refresh()).catch(()=>{}); };   // RESET: back to the owner's default haze
    DFOG.onchange.push(()=>{ if(mk)draw(); });
    for(const ev of ['keydown','keyup'])B.addEventListener(ev,e=>{ if(e.target.matches('input,textarea'))e.stopPropagation(); });
    new MutationObserver(()=>{ if(!P.hidden&&P.offsetParent)draw(); }).observe(P,{attributes:true,attributeFilter:['hidden']}); };

}
export {DFOG};
