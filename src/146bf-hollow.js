// HOLLOW PINES, SHARDWAVE, HALCYON GREENS, VESPER WARD and THE CANTINA in the holodeck: each one's own page (/vr, /wave, /golf, /scare, /cantina) shown over the game while its program runs; LEAVE THE HOLODECK ends it
import {SHARED} from './003-shx.js';
import {ROOMS, VR} from './003b-systems.js';
import {STORE, SYS} from './006-map-pre.js';
{ const H=STORE.holo; let host=null, fr=null;
  const HOLLOW={on:false,url:'/vr',wave:'/wave',golf:'/golf',scare:'/scare',cantina:'/cantina'}; window.HOLLOW=HOLLOW;
  const open=url=>{ if(!host){ host=document.createElement('div'); host.id='hollow'; host.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#000';
      const b=document.createElement('button'); b.textContent='LEAVE THE HOLODECK'; b.style.cssText='position:absolute;right:10px;top:10px;z-index:2;font:11px Silkscreen,monospace;color:#c9ccd6;background:#0e1016c0;border:2px solid #3a3f4e;padding:5px 9px;cursor:pointer'; b.onclick=()=>HOLLOW.place?close():H.end(); HOLLOW.btn=b; host.appendChild(b); document.body.appendChild(host); }
    fr=document.createElement('iframe'); fr.src=url; fr.allow='xr-spatial-tracking; fullscreen; autoplay; gamepad'; fr.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0'; host.prepend(fr); host.style.display='block'; HOLLOW.btn.textContent='LEAVE THE HOLODECK';
    HOLLOW.on=true; SHARED.drive={draw:()=>{},pad:()=>{}}; SHARED.target=null; if(VR.on&&VR.leave)VR.leave(); fr.focus(); };   // the page has its own way into the headset: the market's session ends so it can be seen
  const close=()=>{ if(!HOLLOW.on)return; HOLLOW.on=false; HOLLOW.place=null; SHARED.drive=null; if(fr){ fr.remove(); fr=null; } if(host)host.style.display='none'; };
  // a place whose inside is its own page (o.page): its street door shows the page over the game; THE BAR's is THE CANTINA
  ROOMS.page=o=>{ if(H.run)H.end(); open(o.page); HOLLOW.place=o; HOLLOW.btn.textContent='BACK TO THE STREET'; };
  { let set=false; const mark=()=>{ if(set)return; const o=ROOMS.off&&ROOMS.off.bar; if(!o)return; set=true; o.page=HOLLOW.cantina; }; mark(); SYS.add('places',mark,'146bf-hollow'); }
  H.programs.push({ name:'HOLLOW PINES', cost:0, intro:'HOLLOW PINES. A NIGHT SHIFT ON WARD C. WEAR HEADPHONES.', go:()=>open(HOLLOW.url), hide:()=>close() });
  H.programs.push({ name:'SHARDWAVE', cost:0, intro:'SHARDWAVE. CUT THE SHARDS ON THE BEAT. BEST IN A HEADSET.', go:()=>open(HOLLOW.wave), hide:()=>close() });
  H.programs.push({ name:'HALCYON GREENS', cost:0, intro:'HALCYON GREENS. ONE HOLE OF MINI GOLF IN A MEADOW. BEST IN A HEADSET.', go:()=>open(HOLLOW.golf), hide:()=>close() });
  H.programs.push({ name:'THE CANTINA', cost:0, intro:'THE CANTINA. A BAR OF STRANGE REGULARS, A CARD TABLE AND A BAND. BEST IN A HEADSET.', go:()=>open(HOLLOW.cantina), hide:()=>close() });
  H.programs.push({ name:'VESPER WARD', cost:0, intro:'VESPER WARD. THREE FUSES, THREE THINGS IN THE DARK, NEVER ENOUGH ROUNDS. WEAR HEADPHONES.', go:()=>open(HOLLOW.scare), hide:()=>close() }); }
