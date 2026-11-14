// GRAPHICS HIGH, the rich picture (owner, 14 Nov 2026: "improve lighting, shadows, textures", his pick "HIGH setting only"): soft shadows from finer sun maps, the contact shade in corners and under things, the surfaces' own variation; LOW stays as it was.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK} from './003b-systems.js';
import {renderer, scene} from './004-main.js';
import {LFX, MODS, SYS} from './006-map-pre.js';
{ const SIZES=[[768,512],[2048,1024]], FX=['ao','var']; let cur=-1;
  const reShadow=()=>scene.traverse(o=>{ if(o.isLight&&o.shadow&&o.shadow.map){ o.shadow.map.dispose(); o.shadow.map=null; o.shadow.needsUpdate=true; } if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true; });   // a new shadow type or size needs new maps (as 150a does)
  const apply=hi=>{ cur=hi; const [n,d]=SIZES[hi]; if(CLOCK.sun)CLOCK.sun.shadow.mapSize.set(n,n); if(CLOCK.sunD)CLOCK.sunD.shadow.mapSize.set(d,d);
    if(renderer.shadowMap.enabled&&!(MODS.apts&&MODS.apts.inReal))renderer.shadowMap.type=hi?THREE.PCFSoftShadowMap:THREE.BasicShadowMap;   // (your flat sets its own and puts back what it found)
    for(const k of FX)hi?LFX.on.add(k):LFX.on.delete(k); if(hi&&LFX.bakeAO)LFX.bakeAO(); reShadow(); };
  SYS.add('life',()=>{ const hi=SHARED.RESI?1:0; if(!SYS.started||hi===cur)return; if(cur<0&&!hi){ cur=0; return; } apply(hi); },'161bbb-gfxhigh'); }
