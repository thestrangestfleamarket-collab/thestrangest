// THE DISTANCE FOG: the further past you a thing is (from the camera), the more it blurs and fades into the haze, smoothly, whole at its end (nothing past it is drawn: CULL); the skyline past the map's edge is whole haze at its foot and a faint silhouette higher up, the sky clear; ATMOSPHERE sets it.
import {SHARED, THREE} from './003-shx.js';
import {ED, FAR3, MAPED, pos, ROOMS, UI} from './003b-systems.js';
import {renderer, scene, ShaderPass} from './004-main.js';
import {SAVE} from './005-save.js';
import {TILE} from './006-map-pre.js';
import {RIVER} from './066-river.js';
const DFOG={};
{ const D0={on:true,start:10,end:45,blur:.6,haze:.35}; let C; try{ C=Object.assign({},D0,JSON.parse(SAVE.get('dfog4')||'{}')); }catch(e){ C=Object.assign({},D0); }
  const comp=SHARED.composer;
  for(const rt of [comp.renderTarget1,comp.renderTarget2])if(!rt.depthTexture){ rt.depthTexture=new THREE.DepthTexture(rt.width,rt.height); rt.depthTexture.type=THREE.UnsignedIntType; rt.dispose(); }
  const pass=new ShaderPass({uniforms:{tDiffuse:{value:null},tDepth:{value:null},uPInv:{value:new THREE.Matrix4()},uCamW:{value:new THREE.Matrix4()},uP:{value:new THREE.Vector3()},uC:{value:new THREE.Color()},
      uS:{value:0},uE:{value:1},uW:{value:-1e9},uV:{value:1},uB:{value:0},uH:{value:0},uF:{value:0},uR:{value:new THREE.Vector2(1,1)},uY:{value:new THREE.Vector2(0,1)},uK:{value:new THREE.Vector4(-1e9,-1e9,1e9,1e9)}},
    vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:`uniform sampler2D tDiffuse,tDepth; uniform mat4 uPInv,uCamW; uniform vec3 uP,uC; uniform float uS,uE,uB,uH,uF,uW,uV; uniform vec2 uR,uY; uniform vec4 uK; varying vec2 vUv;
      void main(){ float d=texture2D(tDepth,vUv).x, f=0., m=0.; vec4 c=texture2D(tDiffuse,vUv);
        if(d<.99999){ vec4 v=uPInv*vec4(vUv*2.-1.,d*2.-1.,1.); v/=v.w; vec3 w=(uCamW*v).xyz, cp=(uCamW*vec4(0.,0.,0.,1.)).xyz; float dd=mix(max(0.,distance(w,cp)-distance(uP,cp)),length(w.xz-uP.xz),uV), g=smoothstep(uS,uE,dd), g2=smoothstep(uS*.4,uE,dd), ge=g2*g2, gw=smoothstep(uS,uE*2.,dd), wet=step(w.y,uW), land=step(uK.x,w.x)*step(w.x,uK.z)*step(uK.y,w.z)*step(w.z,uK.w);
          f=g*land; m=land>.5?mix(uF>0.?ge:g*uH,gw,wet):uH>0.?mix(mix(mix(min(.85,g),g,uF),gw,wet),min(.85,g),smoothstep(uY.x,uY.y,vUv.y)):0.; }
        else if(uH>0.&&uV>0.){ vec4 v=uPInv*vec4(vUv*2.-1.,1.,1.); v/=v.w; vec3 w=(uCamW*v).xyz, cp=(uCamW*vec4(0.,0.,0.,1.)).xyz; m=smoothstep(0.,-.03,(w.y-cp.y)/length(w-cp)); }
        if(f>.001&&uB>0.){ vec2 o=uB*f/uR; vec4 s=c*2.+texture2D(tDiffuse,vUv+vec2(o.x,0.))+texture2D(tDiffuse,vUv-vec2(o.x,0.))+texture2D(tDiffuse,vUv+vec2(0.,o.y))+texture2D(tDiffuse,vUv-vec2(0.,o.y))
          +texture2D(tDiffuse,vUv+o)+texture2D(tDiffuse,vUv-o)+texture2D(tDiffuse,vUv+vec2(o.x,-o.y))+texture2D(tDiffuse,vUv+vec2(-o.x,o.y)); c=s/10.; }
        c.rgb=mix(c.rgb,uC,m); gl_FragColor=c; }`});
  const draw=pass.render.bind(pass), HZ=new THREE.Color(.78,.81,.85), HV=new THREE.Vector3();
  pass.render=(r,w,rb,dt,mask)=>{ const u=pass.uniforms, cam=(SHARED.RPASS&&SHARED.RPASS.camera)||SHARED.cam; u.tDepth.value=rb.depthTexture; u.uPInv.value.copy(cam.projectionMatrixInverse); u.uCamW.value.copy(cam.matrixWorld);
    u.uP.value.copy(pos); u.uS.value=C.start*TILE; u.uE.value=Math.max(C.start+1,C.end)*TILE; const iso=!UI.persp, dn=SHARED.LVL==='down'||!!(ROOMS.cur&&ROOMS.cur.off&&ROOMS.off[ROOMS.cur.off]&&ROOMS.off[ROOMS.cur.off].clearAir); u.uB.value=iso||dn?0:C.blur; u.uH.value=iso||dn?0:C.haze; u.uF.value=DFOG.cut()>0&&!dn?1:0;
    u.uC.value.copy(FAR3.fog&&FAR3.fog.color||(scene.background&&scene.background.isColor?scene.background:HZ)); u.uR.value.set(rb.width,rb.height); u.uW.value=window.RIVER&&RIVER.box&&!dn?RIVER.box.lv+.2*TILE:-1e9; u.uV.value=1;   // the Hudson's water fades softer and further than land, so from high up it has no hard ring
    { const c=cam.position, d=HV.set(0,0,-1).applyQuaternion(cam.quaternion); d.y=0; d.normalize(); HV.copy(c).addScaledVector(d,400*TILE).setY(0).project(cam); const hz=(HV.y+1)/2; u.uY.value.set(hz+.08,hz+.5); }   // the skyline: whole haze at the horizon, clearing up the screen
    if(FAR3.land)u.uK.value.set(...FAR3.land);
    // under water (owner, 29 Oct 2026: "needs a fog filter but for water so you cant see too far"): the same pass is the water's fog, every pixel by its distance, a little blur
    const W=DFOG.under; if(W){ u.uS.value=W.s; u.uE.value=Math.max(W.s+1,W.e); u.uB.value=1.4; u.uH.value=1; u.uF.value=0; u.uW.value=-1e9; u.uV.value=0; u.uC.value.copy(W.c); u.uK.value.set(-1e9,-1e9,1e9,1e9); u.uP.value.copy((SHARED.RPASS&&SHARED.RPASS.camera||SHARED.cam).position); }
    draw(r,w,rb,dt,mask); };
  pass.enabled=C.on; comp.insertPass(pass,1); SHARED.carry(pass);
  const save=()=>{ try{ SAVE.set('dfog4',JSON.stringify(C)); }catch(e){} pass.enabled=C.on; };
  Object.assign(DFOG,{pass,get:()=>Object.assign({},C),set:o=>{ Object.assign(C,o); save(); },
    cut:()=>C.on&&UI.persp&&!UI.freeCam&&!ED.on&&!MAPED.on&&!renderer.xr.isPresenting?Math.max(C.start+1,C.end)*TILE:0,
    range:end=>{ const band=Math.max(1,C.end-C.start); C.end=Math.max(8,Math.min(120,Math.round(end))); C.start=Math.max(4,C.end-band); save(); for(const f of DFOG.onchange)f(); }}); DFOG.onchange=[]; window.DFOG=DFOG;
  // the player's HAZE RANGE in GRAPHICS: where the haze takes everything (the fog's END; the band before it keeps its width)
  const gfx=()=>{ const P=document.querySelector('#menu [data-p="graphics"]'); if(!P)return setTimeout(gfx,1000); if(P.querySelector('#dhaze'))return;
    const B=document.createElement('div'); B.innerHTML='<h3>HAZE RANGE</h3><div class="row"><span>NEAR</span><input type="range" id="dhaze" min="20" max="120" step="5"><span>FAR</span><span id="dhazev"></span></div><div class="dim">how far you see before the haze takes everything; further draws more and costs more</div>';
    P.appendChild(B); const R=B.querySelector('#dhaze'), V=B.querySelector('#dhazev'), show=()=>{ R.value=C.end; V.textContent=C.end+' TILES'; }; R.oninput=e=>DFOG.range(+e.target.value); DFOG.onchange.push(show); show(); };
  gfx();
  // its numbers in ATMOSPHERE, under HAZE
  const ui=()=>{ const P=document.querySelector('[data-p="atmo"]'); if(!P)return setTimeout(ui,1000); if(P.querySelector('#dfog'))return;
    const S=[['dfs','START','start',4,60,1],['dfb','BLUR','blur',0,5,.1],['dfh','HAZE','haze',0,1,.01]];
    const B=document.createElement('div'); B.id='dfog';
    B.innerHTML='<h3>DISTANCE FOG</h3><div class="row"><button class="btn" id="dfon"></button><button class="btn" id="dfrs">RESET</button>'+S.map(([id,n,,a,b,st])=>`<span style="width:56px">${n}</span><input type="range" id="${id}" min="${a}" max="${b}" step="${st}">`).join('')+'</div><div class="dim">how far from you the world starts to blur into the haze (START, in tiles); where it is whole and nothing past it is drawn is HAZE RANGE, in GRAPHICS</div>';
    P.appendChild(B); const sync=()=>{ B.querySelector('#dfon').textContent=C.on?'ON':'OFF'; for(const [id,,k] of S)B.querySelector('#'+id).value=C[k]; }; DFOG.onchange.push(sync);
    B.querySelector('#dfon').onclick=()=>{ C.on=!C.on; save(); sync(); };
    B.querySelector('#dfrs').onclick=()=>{ Object.assign(C,D0); save(); sync(); };   // back to the owner's default haze
    for(const [id,,k] of S)B.querySelector('#'+id).oninput=e=>{ C[k]=+e.target.value; if(k==='start'&&C.end<C.start+1)C.end=C.start+1; save(); for(const f of DFOG.onchange)f(); };
    sync(); };
  ui();
}
export {DFOG};
