// HOLLOW PINES, SHARDWAVE, HALCYON GREENS and BREACHLINE in the holodeck: each game's own page (/vr, /wave, /golf, /shoot) shown over the game while its program runs; LEAVE THE HOLODECK ends it
import {SHARED} from './003-shx.js';
import {VR} from './003b-systems.js';
import {STORE} from './006-map-pre.js';
{ const H=STORE.holo; let host=null, fr=null;
  const HOLLOW={on:false,url:'/vr',wave:'/wave',golf:'/golf',shoot:'/shoot'}; window.HOLLOW=HOLLOW;
  const open=url=>{ if(!host){ host=document.createElement('div'); host.id='hollow'; host.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#000';
      const b=document.createElement('button'); b.textContent='LEAVE THE HOLODECK'; b.style.cssText='position:absolute;right:10px;top:10px;z-index:2;font:11px Silkscreen,monospace;color:#c9ccd6;background:#0e1016c0;border:2px solid #3a3f4e;padding:5px 9px;cursor:pointer'; b.onclick=()=>H.end(); host.appendChild(b); document.body.appendChild(host); }
    fr=document.createElement('iframe'); fr.src=url; fr.allow='xr-spatial-tracking; fullscreen; autoplay; gamepad'; fr.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0'; host.prepend(fr); host.style.display='block';
    HOLLOW.on=true; SHARED.drive={draw:()=>{},pad:()=>{}}; SHARED.target=null; if(VR.on&&VR.leave)VR.leave(); fr.focus(); };   // the page has its own way into the headset: the market's session ends so it can be seen
  const close=()=>{ if(!HOLLOW.on)return; HOLLOW.on=false; SHARED.drive=null; if(fr){ fr.remove(); fr=null; } if(host)host.style.display='none'; };
  H.programs.push({ name:'HOLLOW PINES', cost:0, intro:'HOLLOW PINES. A NIGHT SHIFT ON WARD C. WEAR HEADPHONES.', go:()=>open(HOLLOW.url), hide:()=>close() });
  H.programs.push({ name:'SHARDWAVE', cost:0, intro:'SHARDWAVE. CUT THE SHARDS ON THE BEAT. BEST IN A HEADSET.', go:()=>open(HOLLOW.wave), hide:()=>close() });
  H.programs.push({ name:'HALCYON GREENS', cost:0, intro:'HALCYON GREENS. ONE HOLE OF MINI GOLF IN A MEADOW. BEST IN A HEADSET.', go:()=>open(HOLLOW.golf), hide:()=>close() });
  H.programs.push({ name:'BREACHLINE', cost:0, intro:'BREACHLINE. A TWO PLAYER GUN DUEL, FIRST TO SEVEN. BEST IN A HEADSET.', go:()=>open(HOLLOW.shoot), hide:()=>close() }); }
