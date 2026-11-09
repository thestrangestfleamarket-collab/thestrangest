// THE VEHICLES PANEL: ADMIN > VEHICLES, the owner's speed for every kind of vehicle (the road's cars, the flying traffic, the trains, the helicopters, and everything a player drives or rides), one shared file (/shared/vehicles.json), the same for everyone.
import {ONLINE, SPEED, TEXT} from './003b-systems.js';
import {SYS} from './006-map-pre.js';
{ const FILE='/shared/vehicles.json', LO=.25, HI=4;
  const KINDS=[['all','EVERYTHING'],['traffic','CARS ON THE ROAD'],['fliers','FLYING TRAFFIC'],['trains','TRAINS'],['heli','HELICOPTERS'],['cars','CARS YOU DRIVE'],['kart','GO-KART'],['boards','HOVERBOARDS'],['skate','SKATEBOARD AND BMX'],['carpet','MAGIC CARPET'],['balloon','BALLOONS'],['horse','HORSE']];
  let host=null, say='';
  const clean=j=>{ const K={}; if(j&&typeof j==='object')for(const [k] of KINDS){ const v=Math.round(+j[k]*100)/100; if(v>=LO&&v<=HI&&v!==1)K[k]=v; } return K; };
  const set=j=>{ const K=clean(j), was=JSON.stringify(SPEED.k); SPEED.k=K; if(JSON.stringify(K)!==was)for(const f of SPEED.fn)try{ f(); }catch(e){ console.warn('SPEED',e); } };
  const get=()=>fetch(FILE,{credentials:'same-origin'}).then(r=>r.ok&&r.status!==204?r.json():null).then(j=>{ set(j); draw(); }).catch(()=>{});
  const push=()=>fetch(FILE,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(SPEED.k)}).then(async r=>{ const o=await r.json().catch(()=>({})); if(!r.ok||!o.ok)throw new Error(o.why||r.status);
    if(ONLINE.put&&ONLINE.on)ONLINE.put('veh',Date.now()); say='SAVED FOR EVERYONE'; }).catch(e=>{ say='NOT SAVED: '+String(e.message||e).toUpperCase(); }).then(draw);
  SPEED.set=set; SPEED.KINDS=KINDS;
  if(/^https?:$/.test(location.protocol))SYS.onStart(get,'136cb-vehicles');
  let lastV=null; SYS.add('world',(k,v)=>{ if(k==='veh'&&v!==lastV){ lastV=v; get(); } },'136cb-vehicles');
  const row=([k,n])=>{ const v=+SPEED.k[k]||1; return '<div class="row"><span>'+TEXT.esc(n)+'</span><input type="range" data-veh="'+k+'" min="'+LO+'" max="'+HI+'" step="0.05" value="'+v+'" style="--p:'+((v-LO)/(HI-LO)*100).toFixed(1)+'%"><span class="dim" data-vv="'+k+'" style="min-width:4em;text-align:right">×'+v.toFixed(2)+'</span></div>'; };
  const draw=()=>{ if(!host||!host.isConnected)return;
    host.innerHTML='<h3>VEHICLE SPEEDS</h3><div class="dim">×1 is each one\'s own speed; EVERYTHING multiplies them all. The same for every player.</div>'+KINDS.map(row).join('')
      +'<div class="row onoff"><button class="btn" data-vact="save">SAVE FOR EVERYONE</button><button class="btn" data-vact="reset">RESET ALL TO ×1</button></div><div class="dim">'+TEXT.esc(say)+'</div>'; };
  let bound=null;
  SPEED.panel=el=>{ host=el; say=''; draw(); if(bound===el)return; bound=el;
    el.addEventListener('input',e=>{ const r=e.target.closest('[data-veh]'); if(!r)return; const k=r.dataset.veh, v=+r.value; set({...SPEED.k,[k]:v}); const t=el.querySelector('[data-vv="'+k+'"]'); if(t)t.textContent='×'+v.toFixed(2); say='NOT SAVED YET'; const s=el.querySelector('.dim:last-child'); if(s)s.textContent=say; });
    el.addEventListener('click',e=>{ const b=e.target.closest('[data-vact]'); if(!b)return; if(b.dataset.vact==='reset'){ set({}); say='NOT SAVED YET'; draw(); } else { say='SAVING...'; draw(); push(); } }); };
}
