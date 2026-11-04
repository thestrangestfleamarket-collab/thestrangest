// THE HOURS: DN holds the two looks, DAY and NIGHT (each sets the sun, sky, mist, clouds and the colour of everything); which one it is the owner picks for everyone (/shared/time.json); the looks themselves are the game's or the owner's saved ones (/shared/looks.json); ATMOSPHERE edits them (the owner only).
import {SHARED, THREE} from './003-shx.js';
import {BUGS, CLOCK, DN, FAR3, ONLINE, PARK, SKY, WX} from './003b-systems.js';
import {scene} from './004-main.js';
import {MISTE, MISTS, MISTSC, QS, SYS} from './006-map-pre.js';
import {HEMI} from './064-map-post.js';
Object.assign(DN,{lk:1,mode:'day',modes:['day','night'],names:{day:'DAY',night:'NIGHT'},FADE:60000});
{ const U=SKY.U, Q=k=>(QS.get(k)??''),
    D0={day:{h:17.2,sun:1.35,amb:1.3,sunc:'#fff0d6',ambc:'#e8eef8',zen:'#6f92d8',hor:'#c4d6ea',cld:0,cov:.45,cl:1.3,m0:4,m1:140,hz:1,mist:'#c0d2e6',skym:0,farb:1.05,grade:'#fffaf4',lift:'#c0d2e6',liftk:.05,lamp:1,star:1,moon:1,cldc:'#f4ecf4',cldk:.9,sunhz:'#f4c9a8',sunk:.2,shaft:0,glow:1.1,bands:0},
      night:{h:23,sun:1.1,amb:1.05,sunc:'#ffffff',ambc:'#ffffff',zen:'#0e1322',hor:'#2c3350',cld:0,cov:1,cl:1.1,m0:4,m1:140,hz:1,mist:'#1f2640',skym:0,farb:.62,grade:'#ffffff',lift:'#1a2038',liftk:.1,lamp:1.25,star:1.3,moon:1,cldc:'#f0d8d0',cldk:.9,sunhz:'#f4c9a8',sunk:0,shaft:0,glow:1.1,bands:0}};
  const F=[['h','SUN HEIGHT (THE HOUR)',7.5,18.5,.05,'dg'],['h','NIGHT HOUR (WHERE THE MOON IS)',19.5,29.5,.05,'n'],['sun','SUNLIGHT',0,2,.01,'dg'],['sun','MOONLIGHT',0,3,.01,'n'],['sunc','SUNLIGHT COLOUR','c','dg'],['amb','LIGHT ALL ROUND',0,3,.01],['ambc','LIGHT ALL ROUND COLOUR (THE SHADOWS)','c'],
    ['zen','SKY OVERHEAD','c'],['hor','SKY AT THE HORIZON','c'],['bands','SKY BANDS (0 = SMOOTH)',0,8,1],['cld','CLOUDY (DIMS THE SUN)',0,1,.01],['cov','CLOUD COVER (LOWER = MORE, 1 = NONE)',.2,1,.01],['cl','CLOUD BRIGHTNESS',.5,1.6,.01],
    ['m0','MIST STARTS (TILES PAST TOWN)',-10,120,1],['m1','MIST DEPTH (TILES)',4,160,1],['hz','MIST TINTED BY THE SKY',0,1,.01],['mist','MIST COLOUR','c','dg'],['skym','SKY HIDDEN BY THE MIST',0,1,.01],['farb','FAR CITY HAZE BRIGHTNESS',.3,1.3,.01],
    ['cldc','CLOUD COLOUR','c','d'],['cldk','CLOUD COLOUR (HOW MUCH)',0,1,.01,'d'],['sunhz','MIST TOWARD THE SUN','c','d'],['sunk','MIST TOWARD THE SUN (HOW MUCH)',0,1,.01,'d'],['shaft','SUN SHAFTS',0,1,.01,'d'],['glow','GLOW',0,2.5,.01],
    ['grade','COLOUR OF EVERYTHING','c'],['lift','HAZE OVER EVERYTHING','c'],['liftk','HAZE OVER EVERYTHING (HOW MUCH)',0,.6,.01],
    ['lamp','LAMPS',0,3,.01,'n'],['star','STARS',0,2,.01,'n'],['moon','MOON',0,1,.01,'n']];
  const S={}; for(const m of DN.modes)S[m]={...D0[m]};
  { const local=location.protocol==='file:'||/^(127\.|localhost)/.test(location.hostname), q=local?Q('look').toLowerCase():'', qh=local?+(Q('hour')||NaN):NaN; if(DN.modes.includes(q)){ DN.mode=q; DN.test=1; } else if(!isNaN(qh)){ DN.mode=qh<6||qh>19?'night':'day'; S[DN.mode].h=qh; DN.test=1; } }
  // the time: DAY or NIGHT, the owner's pick, the same for everyone (on the server); a change fades over a minute. The day's hour is the look's own
  const T={prev:DN.mode,t0:0};
  const B={}, ca=new THREE.Color(), cb=new THREE.Color(), blend=(A,C,f)=>{ for(const k in C){ const a=A[k]??C[k], c=C[k]; if(typeof c==='number'){ if(k==='h'){ let d=((c-a)%24+24)%24; if(d>12)d-=24; B[k]=((a+d*f)%24+24)%24; } else B[k]=a+(c-a)*f; } else if(typeof c==='string'&&c[0]==='#'&&typeof a==='string'&&a[0]==='#')B[k]='#'+ca.set(a).lerp(cb.set(c),f).getHexString(); else B[k]=c; } return B; };
  DN.P=()=>B; DN.E=()=>S[DN.mode]; DN.S=S; DN.D0=D0;
  const fix=()=>{ const P=S[DN.mode]; WX.fix={cloud:P.cld,rain:0,snow:0,storm:0,wind:DN.mode==='night'?.08:.15,dir:1,fog:0}; window.PARK&&PARK.lampLit&&PARK.lampLit(); };
  DN.set=(m,fade)=>{ if(!DN.modes.includes(m)||m===DN.mode)return; T.prev=DN.mode; T.t0=fade?Date.now():0; DN.mode=m; fix(); DN.draw(); };   // the time now (the shared pick, or a test's)
  const tc=new THREE.Color(); DN.U={grade:{value:new THREE.Color(1,1,1)},lift:{value:new THREE.Color(0,0,0)},liftK:{value:0}};
  SYS.add('clockPre',()=>{ const f0=Math.min(1,(Date.now()-T.t0)/DN.FADE), f=f0*f0*(3-2*f0); blend(S[T.prev]||S[DN.mode],S[DN.mode],f); if(!CLOCK.run){ CLOCK.sunH=B.h; CLOCK.h=B.h; } else CLOCK.sunH=null; },'134b-daynight');
  SYS.add('sky',()=>{ const P=B, up=SHARED.LVL!=='down';
    CLOCK.sun.intensity*=P.sun; CLOCK.sun.color.multiply(tc.set(P.sunc)); if(up){ HEMI.intensity*=P.amb; if(P.ambc)HEMI.color.multiply(tc.set(P.ambc)); } DN.lk=P.lamp;
    DN.U.grade.value.set(P.grade); DN.U.lift.value.set(P.lift); DN.U.liftK.value=up?P.liftk:0;
    if(SKY.on()){ U.uZ.value.set(P.zen); U.uH.value.set(P.hor); U.uM.value.copy(U.uH.value).lerp(U.uZ.value,.45); U.uCov.value=P.cov; U.uCL.value=P.cl; U.uCldC.value.set(P.cldc||'#ffffff'); U.uCldK.value=P.cldk||0; U.uBands.value=P.bands; U.uMistK.value*=P.skym;
      U.uStar.value=Math.min(2,U.uStar.value*P.star); U.uMoonK.value=Math.min(1,U.uMoonK.value*P.moon); }
    MISTS.x=CLOCK.sunV.x; MISTS.y=CLOCK.sunV.y; MISTS.z=CLOCK.sunV.z; MISTS.w=up&&MISTE.x&&FAR3.mist?(P.sunk||0)*Math.max(0,Math.min(1,(CLOCK.elev()+2)/6)):0; MISTSC.set(P.sunhz||'#ffffff');
    if(MISTE.x&&FAR3.mist){ MISTE.y=P.m0; MISTE.z=P.m1; const f=FAR3.fog.color.lerp(P.mist?tc.set(P.mist):U.uH.value,P.hz); U.uMistC.value.copy(f); FAR3.FU.uMC.value.copy(f).multiplyScalar(P.farb); if(scene.background&&scene.background.isColor)scene.background.copy(f).multiplyScalar(.5); }
    if(!up){ SKY.dome.visible=false; if(scene.background&&scene.background.isColor)scene.background.setRGB(0,0,0); } },'134b-daynight');
  const box=document.getElementById('adn'), fl=v=>(+v).toFixed(2), fmt=h=>String(Math.floor(h)).padStart(2,'0')+':'+String(Math.floor(h%1*60)).padStart(2,'0'); let dirty=false;
  DN.dayText=()=>'the same for everyone, set by the owner'+'; the day at '+fmt(CLOCK.h);
  DN.draw=()=>{ if(!box)return; const m=DN.mode, P=S[m], k=m==='night'?'n':'d';
    if(!DN.owner){ box.innerHTML=`<h3>THE HOURS</h3><div class="row"><span class="dim" id="dnday">${DN.names[m]}: ${DN.dayText()}</span></div>`; return; }
    box.innerHTML=`<h3>THE HOURS</h3><div class="row" id="dnm">${DN.modes.map(x=>`<button class="btn" data-dn="${x}" aria-pressed="${m===x}">${DN.names[x]}</button>`).join('')}<span class="dim" id="dnday">the time for everyone: click to change it (it fades over a minute)</span></div>
      <h3>${DN.names[m]}: ITS DETAILS</h3>`+F.filter(f=>{ const w=f[2]==='c'?f[3]:f[5]; return !w||w.includes(k==='n'?'n':'d'); }).map(([key,l,a,b,st])=>a==='c'?`<div class="row"><span style="width:250px">${l}</span><input type="color" data-k="${key}" value="${P[key]||'#000000'}"></div>`
        :`<div class="row"><span style="width:250px">${l}</span><input type="range" data-k="${key}" min="${a}" max="${b}" step="${st}" value="${P[key]}" style="flex:1"><span style="width:44px;text-align:right">${fl(P[key])}</span></div>`).join('')
      +`<div class="row"><button class="btn" id="dnsave">SAVE</button><button class="btn" id="dnreset">RESET</button>${DN.owner?'<button class="btn" id="dnexp">EXPORT</button>':''}<span class="dim" id="dnmsg">${dirty?'not saved':''}</span></div><textarea id="dnout" hidden style="width:100%;height:60px;font:10px monospace"></textarea>`; };
  if(box){ for(const ev of ['keydown','keyup'])box.addEventListener(ev,e=>{ if(e.target.matches('input,textarea'))e.stopPropagation(); });
    box.addEventListener('input',e=>{ '@later'; const k=e.target.dataset.k; if(!k)return; const P=DN.E(); P[k]=e.target.type==='color'?e.target.value:+e.target.value; if(e.target.type==='range')e.target.nextElementSibling.textContent=fl(P[k]); if(k==='cld'||k==='lamp')fix(); dirty=true; box.querySelector('#dnmsg').textContent='not saved'; });
    box.addEventListener('click',e=>{ '@later'; const t=e.target, m=t.dataset.dn, msg=()=>box.querySelector('#dnmsg');
      if(!DN.owner)return; if(m&&m!==DN.mode){ DN.set(m,true); msg().textContent='setting the time...'; DN.pushTime(m).then(()=>{ msg().textContent=DN.names[m]+' for everyone'; }).catch(e=>{ msg().textContent='not set: '+(e.message||'try again'); }); }
      if(t.id==='dnsave'){ msg().textContent='saving...'; DN.push().then(()=>{ dirty=false; msg().textContent='live for everyone'; }).catch(e=>{ msg().textContent='not saved: '+(e.message||'try again'); }); }
      if(t.id==='dnreset'){ S[DN.mode]={...D0[DN.mode]}; fix(); DN.draw(); msg().textContent='resetting...'; DN.push().then(()=>{ dirty=false; msg().textContent='back to the game\'s own, for everyone'; }).catch(e=>{ dirty=true; msg().textContent='not reset on the server: '+(e.message||'try again'); }); }
      if(t.id==='dnexp'){ const o=box.querySelector('#dnout'); o.hidden=false; o.value=DN.names[DN.mode]+' '+JSON.stringify(DN.E()); o.select(); msg().textContent='copy this and send it to Claude'; } }); }
  setTimeout(()=>{ if(BUGS.owner)BUGS.owner().then(o=>{ DN.owner=!!o; if(o&&box&&box.offsetParent)DN.draw(); }).catch(()=>{}); },3000);   // EXPORT ("send it to Claude") is the owner's
  { const FILE='/shared/looks.json', take=j=>{ if(!j||typeof j!=='object')return; for(const m of DN.modes)if(j[m]&&typeof j[m]==='object')S[m]={...D0[m],...j[m]}; fix(); DN.draw(); };
    const get=()=>fetch(FILE,{credentials:'same-origin'}).then(r=>r.ok&&r.status!==204?r.json():null).then(take).catch(()=>{});
    const TF='/shared/time.json', getT=()=>fetch(TF,{credentials:'same-origin'}).then(r=>r.ok&&r.status!==204?r.json():null).then(j=>{ if(j&&DN.modes.includes(j.now))DN.set(j.now,DN.started); }).catch(()=>{});
    if(!DN.test){ get(); getT(); }
    DN.pushTime=m=>fetch(TF,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({now:m})}).then(async r=>{ const o=await r.json().catch(()=>({})); if(!r.ok||!o.ok)throw new Error(o.why||r.status); if(ONLINE.put&&ONLINE.on)ONLINE.put('time',Date.now()); });
    DN.diff=()=>{ const o={}; for(const m of DN.modes){ const d={}; for(const k in S[m])if(S[m][k]!==D0[m][k])d[k]=S[m][k]; if(Object.keys(d).length)o[m]=d; } return o; };   // only what differs from the game's own: a reset look leaves the file
    DN.push=()=>fetch(FILE,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(DN.diff())}).then(async r=>{ const o=await r.json().catch(()=>({})); if(!r.ok||!o.ok)throw new Error(o.why||r.status); if(ONLINE.put&&ONLINE.on)ONLINE.put('looks',Date.now()); });
    let lastL=null, lastT=null; SYS.add('world',(k,v)=>{ if(DN.owner||DN.test)return; if(k==='looks'&&v!==lastL){ lastL=v; get(); } if(k==='time'&&v!==lastT){ lastT=v; DN.started=1; getT(); } },'134b-looks'); }
  CLOCK.run=false; blend(S[DN.mode],S[DN.mode],1); fix(); DN.draw(); window.DN=DN; window.DNDBG=()=>({mode:DN.mode,h:+CLOCK.h.toFixed(2),elev:+CLOCK.elev().toFixed(1),wx:WX.now,lk:DN.lk}); }
