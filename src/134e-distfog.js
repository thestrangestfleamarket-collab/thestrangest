// THE DISTANCE FOG: past a distance from you the world blurs and fades into the haze, in every view (measured from you across the ground, not from the camera); the sky and the skyline past the map's edge are left clear; ATMOSPHERE sets it.
import {SHARED, THREE} from './003-shx.js';
import {FAR3, pos} from './003b-systems.js';
import {scene, ShaderPass} from './004-main.js';
import {SAVE} from './005-save.js';
import {TILE} from './006-map-pre.js';
{ const D0={on:true,start:20,end:60,blur:2.2,haze:.75}; let C; try{ C=Object.assign({},D0,JSON.parse(SAVE.get('dfog')||'{}')); }catch(e){ C=Object.assign({},D0); }
  const comp=SHARED.composer;
  for(const rt of [comp.renderTarget1,comp.renderTarget2])if(!rt.depthTexture){ rt.depthTexture=new THREE.DepthTexture(rt.width,rt.height); rt.depthTexture.type=THREE.UnsignedIntType; rt.dispose(); }
  const pass=new ShaderPass({uniforms:{tDiffuse:{value:null},tDepth:{value:null},uPInv:{value:new THREE.Matrix4()},uCamW:{value:new THREE.Matrix4()},uP:{value:new THREE.Vector3()},uC:{value:new THREE.Color()},
      uS:{value:0},uE:{value:1},uB:{value:0},uH:{value:0},uR:{value:new THREE.Vector2(1,1)},uK:{value:new THREE.Vector4(-1e9,-1e9,1e9,1e9)}},
    vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader:`uniform sampler2D tDiffuse,tDepth; uniform mat4 uPInv,uCamW; uniform vec3 uP,uC; uniform float uS,uE,uB,uH; uniform vec2 uR; uniform vec4 uK; varying vec2 vUv;
      void main(){ float d=texture2D(tDepth,vUv).x, f=0.; vec4 c=texture2D(tDiffuse,vUv);
        if(d<.99999){ vec4 v=uPInv*vec4(vUv*2.-1.,d*2.-1.,1.); v/=v.w; vec3 w=(uCamW*v).xyz; f=smoothstep(uS,uE,distance(w.xz,uP.xz))*step(uK.x,w.x)*step(w.x,uK.z)*step(uK.y,w.z)*step(w.z,uK.w); }
        if(f>.001&&uB>0.){ vec2 o=uB*f/uR; vec4 s=c*2.+texture2D(tDiffuse,vUv+vec2(o.x,0.))+texture2D(tDiffuse,vUv-vec2(o.x,0.))+texture2D(tDiffuse,vUv+vec2(0.,o.y))+texture2D(tDiffuse,vUv-vec2(0.,o.y))
          +texture2D(tDiffuse,vUv+o)+texture2D(tDiffuse,vUv-o)+texture2D(tDiffuse,vUv+vec2(o.x,-o.y))+texture2D(tDiffuse,vUv+vec2(-o.x,o.y)); c=s/10.; }
        c.rgb=mix(c.rgb,uC,f*uH); gl_FragColor=c; }`});
  const draw=pass.render.bind(pass), HZ=new THREE.Color(.78,.81,.85);
  pass.render=(r,w,rb,dt,mask)=>{ const u=pass.uniforms, cam=(SHARED.RPASS&&SHARED.RPASS.camera)||SHARED.cam; u.tDepth.value=rb.depthTexture; u.uPInv.value.copy(cam.projectionMatrixInverse); u.uCamW.value.copy(cam.matrixWorld);
    u.uP.value.copy(pos); u.uS.value=C.start*TILE; u.uE.value=Math.max(C.start+1,C.end)*TILE; u.uB.value=C.blur; u.uH.value=C.haze;
    u.uC.value.copy(FAR3.fog&&FAR3.fog.color||(scene.background&&scene.background.isColor?scene.background:HZ)); u.uR.value.set(rb.width,rb.height); if(FAR3.land)u.uK.value.set(...FAR3.land); draw(r,w,rb,dt,mask); };
  pass.enabled=C.on; comp.insertPass(pass,1);
  const save=()=>{ try{ SAVE.set('dfog',JSON.stringify(C)); }catch(e){} pass.enabled=C.on; };
  window.DFOG={get:()=>Object.assign({},C),set:o=>{ Object.assign(C,o); save(); }};
  // its numbers in ATMOSPHERE, under HAZE
  const ui=()=>{ const P=document.querySelector('[data-p="atmo"]'); if(!P)return setTimeout(ui,1000); if(P.querySelector('#dfog'))return;
    const S=[['dfs','START','start',4,60,1],['dfe','END','end',8,120,1],['dfb','BLUR','blur',0,5,.1],['dfh','HAZE','haze',0,1,.01]];
    const B=document.createElement('div'); B.id='dfog';
    B.innerHTML='<h3>DISTANCE FOG</h3><div class="row"><button class="btn" id="dfon"></button>'+S.map(([id,n,,a,b,st])=>`<span style="width:56px">${n}</span><input type="range" id="${id}" min="${a}" max="${b}" step="${st}">`).join('')+'</div><div class="dim">how far from you the world starts to blur into the haze (START, in tiles) and where it is gone (END)</div>';
    P.appendChild(B); const sync=()=>{ B.querySelector('#dfon').textContent=C.on?'ON':'OFF'; for(const [id,,k] of S)B.querySelector('#'+id).value=C[k]; };
    B.querySelector('#dfon').onclick=()=>{ C.on=!C.on; save(); sync(); };
    for(const [id,,k] of S)B.querySelector('#'+id).oninput=e=>{ C[k]=+e.target.value; if(k==='start'&&C.end<C.start+1)C.end=C.start+1; save(); sync(); };
    sync(); };
  ui();
}
