// PHOSPHOR: a toggle in Display (off by default): each frame keeps a fading copy of the last ones, like an old screen's phosphor; drawn just before the old look's pass so its glow runs on the trails. Off in the headset.
import {SHARED, THREE} from './003-shx.js';
import {LOOK, PHOS} from './003b-systems.js';
import {renderer, ShaderPass} from './004-main.js';
import {SAVE} from './005-save.js';
{ const V='varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }';
Object.assign(PHOS,{on:false, half:.06, fresh:true});
try{ PHOS.on=SAVE.get('phosphor')==='1'; }catch(e){}
PHOS.sp=new ShaderPass({uniforms:{tDiffuse:{value:null},tPrev:{value:null},uK:{value:0}},vertexShader:V,
  fragmentShader:`uniform sampler2D tDiffuse,tPrev; uniform float uK; varying vec2 vUv;
    void main(){ vec4 c=texture2D(tDiffuse,vUv); vec3 p=texture2D(tPrev,vUv).rgb*uK; p=floor(p*32.)/32.; gl_FragColor=vec4(max(c.rgb,p),c.a); }`});
PHOS.cp=new ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:V,fragmentShader:'uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ gl_FragColor=texture2D(tDiffuse,vUv); }'});
PHOS.rt=new THREE.WebGLRenderTarget(1,1,{type:renderer.extensions.has('EXT_color_buffer_float')?THREE.FloatType:THREE.HalfFloatType,minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:false});
PHOS.sp.uniforms.tPrev.value=PHOS.rt.texture; PHOS.sp.enabled=PHOS.on;
{ const draw=PHOS.sp.render.bind(PHOS.sp);
  PHOS.sp.render=(r,w,rb,dt,mask)=>{ if(PHOS.rt.width!==rb.width||PHOS.rt.height!==rb.height){ PHOS.rt.setSize(rb.width,rb.height); PHOS.fresh=true; }
    PHOS.sp.uniforms.uK.value=PHOS.fresh?0:Math.pow(.5,Math.min(Math.max(dt||1/60,0),.1)/PHOS.half); PHOS.fresh=false;
    const s=PHOS.sp.renderToScreen; PHOS.sp.renderToScreen=false; draw(r,w,rb,dt,mask); PHOS.sp.renderToScreen=s;
    PHOS.cp.renderToScreen=false; PHOS.cp.render(r,PHOS.rt,w); if(s){ PHOS.cp.renderToScreen=true; PHOS.cp.render(r,null,w); } }; }
PHOS.set=v=>{ PHOS.on=!!v; PHOS.sp.enabled=PHOS.on; PHOS.fresh=true; try{ SAVE.set('phosphor',PHOS.on?'1':'0'); }catch(e){} };
{ const P=SHARED.composer.passes, i=P.indexOf(LOOK.sp); SHARED.composer.insertPass(PHOS.sp,i<0?P.length-1:i); }
window.PHOS=PHOS; }
