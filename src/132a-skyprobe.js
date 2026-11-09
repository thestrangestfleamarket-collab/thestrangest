// THE SKY PROBE: SKY.probe is a small cube picture of the sky dome alone, taken every two seconds, that metal reflects (the cars' chrome; 4 Nov 2026, from Nevaland): six tiny draws of the dome alone (it is drawn as the whole scene, so the rest of the street is not walked six times).
import {SHARED, THREE} from './003-shx.js';
import {pos, SKY} from './003b-systems.js';
import {renderer} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';
{ const rt=new THREE.WebGLCubeRenderTarget(32,{generateMipmaps:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter}), cam=new THREE.CubeCamera(.1,100,rt); SKY.probe=rt.texture; SKY.probeN=0;
  for(const c of cam.children)c.layers.set(7); if(SKY.dome)SKY.dome.layers.enable(7);
  const carNear=()=>{ const C=window.CARS; if(!C||!C.cars)return false; if(C.driving)return true; for(const c of C.cars.values())if(c.mesh&&Math.hypot(c.x-pos.x,c.z-pos.z)<20*TILE)return true; return false; };   // only the cars' chrome reflects it: taken only with one near (owner, 9 Nov 2026)
  SYS.every(()=>{ if(!SKY.dome||!SKY.dome.visible||renderer.xr.isPresenting||!carNear())return; cam.position.copy(SHARED.cam.position); cam.update(renderer,SKY.dome); SKY.probeN++; },2000,'132a-skyprobe'); }
