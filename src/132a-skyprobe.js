// THE SKY PROBE: SKY.probe is a small cube picture of the sky dome alone, taken every two seconds, that metal reflects (the cars' chrome; 4 Nov 2026, from Nevaland): six tiny draws of one dome, nothing else in it.
import {SHARED, THREE} from './003-shx.js';
import {SKY} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {SYS} from './006-map-pre.js';
{ const rt=new THREE.WebGLCubeRenderTarget(32,{generateMipmaps:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter}), cam=new THREE.CubeCamera(.1,100,rt); SKY.probe=rt.texture; SKY.probeN=0;
  for(const c of cam.children)c.layers.set(7); if(SKY.dome)SKY.dome.layers.enable(7);
  SYS.every(()=>{ if(!SKY.dome||!SKY.dome.visible||renderer.xr.isPresenting)return; cam.position.copy(SHARED.cam.position); cam.update(renderer,scene); SKY.probeN++; },2000,'132a-skyprobe'); }
