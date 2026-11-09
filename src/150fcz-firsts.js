// TONIGHT'S FIRSTS: the first player in the section to find a thing tonight (the ISS in the eyepiece, a comet, a water bear in a drop) keeps their name on it until the next morning; the telescope and the microscope call FIRSTS.mark, and both show the board.
import {ONLINE} from './003b-systems.js';
import {SAY} from './003d-say.js';
const FIRSTS={}; window.FIRSTS=FIRSTS;
{ FIRSTS.K={iss:'THE ISS, CAUGHT IN THE EYEPIECE',sat:'A SATELLITE PASSING OVER',comet:'A COMET',rock:'AN ASTEROID',meteor:'A SHOOTING STAR',aurora:'THE NORTHERN LIGHTS',flare:'A SUNSPOT GROUP THAT FLARED',rings:"SATURN'S RINGS",moons:"JUPITER'S FOUR MOONS",deep:'A NEBULA OR GALAXY',
    tardigrade:'A WATER BEAR, ALIVE',rotifer:'A ROTIFER',daphnia:'A WATER FLEA',volvox:'A VOLVOX COLONY',jar:'A JAR GROWN A WEEK',crystal:'A CRYSTAL IN POLARISED LIGHT'};
  // the night: the date the evening began, Central time; it turns over at 7 in the morning
  FIRSTS.night=(now=Date.now())=>{ try{ return new Date(now-7*3600e3).toLocaleDateString('en-CA',{timeZone:'America/Chicago'}).replace(/-/g,''); }catch(e){ return new Date(now-7*3600e3).toISOString().slice(0,10).replace(/-/g,''); } };
  const local={}, sent={}, OL=()=>ONLINE;
  const rec=k=>{ const O=OL(), v=String((O&&O.world&&O.world['first:'+k])||local[k]||''), q=v.split('|'); return q[0]===FIRSTS.night()?{name:q[1]||'',at:q[2]||''}:null; };
  FIRSTS.of=rec;
  FIRSTS.mark=k=>{ if(!FIRSTS.K[k]||rec(k))return false; const n=FIRSTS.night(); if(sent[k]===n)return false; sent[k]=n; const O=OL();
    const name=(O&&O.myName?O.myName():'YOU').toUpperCase().slice(0,24).replace(/\|/g,' '), at=new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'America/Chicago'}), v=n+'|'+name+'|'+at;
    if(O&&O.on&&O.send)O.send({t:'world',k:'first:'+k,v}); else local[k]=v;
    SAY('TONIGHT\'S FIRST: '+FIRSTS.K[k]+'. YOUR NAME IS ON THE BOARD.','#ffe08a'); return true; };
  FIRSTS.html=()=>`<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:13px">TONIGHT'S FIRSTS</b><button class="btn" data-x="firsts-x">CLOSE</button></div>
    <div style="color:#6a4a32;margin:4px 0 10px">THE FIRST PLAYER TO FIND IT TONIGHT GETS THEIR NAME ON IT · RESETS AT 7 AM</div>`+Object.keys(FIRSTS.K).map(k=>{ const r=rec(k);
    return `<div style="display:flex;justify-content:space-between;gap:10px;padding:4px 0;border-bottom:1px solid #cdbf9f"><span>${r?'★':'☆'} ${FIRSTS.K[k]}</span><span style="color:${r?'#3b2a1e':'#9a8a72'}">${r?(r.name+' · '+r.at).replace(/[<>&]/g,''):'NOT YET FOUND'}</span></div>`; }).join('');
  // the board over whatever is open: one card, closed by its button or a click outside it
  FIRSTS.show=()=>{ let el=document.getElementById('firstsb'); if(!el){ el=document.createElement('div'); el.id='firstsb'; el.style.cssText='position:fixed;inset:0;z-index:45;background:rgba(10,8,6,.72);display:flex;align-items:center;justify-content:center;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#3b2a1e';
      el.addEventListener('click',e=>{ if(e.target===el||e.target.closest('[data-x="firsts-x"]'))el.style.display='none'; }); document.body.appendChild(el); }
    el.innerHTML=`<div style="width:min(560px,92vw);max-height:90vh;overflow:auto;background:#ece5d3;border:3px solid #3b2a1e;padding:14px 16px;box-sizing:border-box">${FIRSTS.html()}</div>`.replace(/class="btn"/g,'style="font:inherit;padding:4px 7px;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer"'); el.style.display='flex'; };
}
