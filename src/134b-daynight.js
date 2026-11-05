// THE HOURS: DN holds the two looks, DAY and NIGHT (each sets the sun, sky, mist, clouds and the colour of everything); which one it is the owner picks for everyone (/shared/time.json); the looks themselves are the game's or the owner's saved ones (/shared/looks.json); ATMOSPHERE edits them (the owner only).
import {SHARED, THREE} from './003-shx.js';
import {BUGS, CLOCK, DN, FAR3, ONLINE, PARK, ROOMS, SKY, VIS, WX} from './003b-systems.js';
import {scene} from './004-main.js';
import {MISTE, MISTS, MISTSC, QS, STORE, SYS} from './006-map-pre.js';
import {HEMI} from './064-map-post.js';
import {TPANE} from './087dz-tpane.js';
Object.assign(DN,{lk:1,mode:'day',modes:['day','night'],names:{day:'DAY',night:'NIGHT'},FADE:60000,hold:null});
// the game's hour by the real clock, the same for everyone: six game hours a real hour, 05:00 at the epoch (worker/lives.js lvH); the look is NIGHT from 20:00 to 06:00, DAY the rest, unless the owner holds one
DN.clockH=()=>((Date.now()/600000)+5)%24; DN.lookFor=h=>h<6||h>=20?'night':'day';
{ const U=SKY.U, Q=k=>(QS.get(k)??''),
    D0={day:{h:17.2,sun:1.35,amb:1.3,sunc:'#fff0d6',ambc:'#e8eef8',zen:'#6f92d8',hor:'#c4d6ea',cld:0,cov:.45,cl:1.3,m0:4,m1:140,hz:1,mist:'#c0d2e6',skym:0,farb:1.05,grade:'#fffaf4',lift:'#c0d2e6',liftk:.05,lamp:1,star:1,moon:1,cldc:'#f4ecf4',cldk:.9,sunhz:'#f4c9a8',sunk:.2,shaft:0,glow:1.1,bands:0,tun:.02},
      night:{h:23,sun:1.1,amb:1.05,sunc:'#ffffff',ambc:'#ffffff',zen:'#0e1322',hor:'#2c3350',cld:0,cov:1,cl:1.1,m0:4,m1:140,hz:1,mist:'#1f2640',skym:0,farb:.62,grade:'#ffffff',lift:'#1a2038',liftk:.1,lamp:1.25,star:1.3,moon:1,cldc:'#f0d8d0',cldk:.9,sunhz:'#f4c9a8',sunk:0,shaft:0,glow:1.1,bands:0,tun:.02}};
  const F=[['h','SUN HEIGHT (THE HOUR)',7.5,18.5,.05,'dg'],['h','NIGHT HOUR (WHERE THE MOON IS)',19.5,29.5,.05,'n'],['sun','SUNLIGHT',0,2,.01,'dg'],['sun','MOONLIGHT',0,3,.01,'n'],['sunc','SUNLIGHT COLOUR','c','dg'],['amb','LIGHT ALL ROUND',0,3,.01],['ambc','LIGHT ALL ROUND COLOUR (THE SHADOWS)','c'],
    ['zen','SKY OVERHEAD','c'],['hor','SKY AT THE HORIZON','c'],['bands','SKY BANDS (0 = SMOOTH)',0,8,1],['cld','CLOUDY (DIMS THE SUN)',0,1,.01],['cov','CLOUD COVER (LOWER = MORE, 1 = NONE)',.2,1,.01],['cl','CLOUD BRIGHTNESS',.5,1.6,.01],
    ['m0','MIST STARTS (TILES PAST TOWN)',-10,120,1],['m1','MIST DEPTH (TILES)',4,160,1],['hz','MIST TINTED BY THE SKY',0,1,.01],['mist','MIST COLOUR','c','dg'],['skym','SKY HIDDEN BY THE MIST',0,1,.01],['farb','FAR CITY HAZE BRIGHTNESS',.3,1.3,.01],
    ['cldc','CLOUD COLOUR','c','d'],['cldk','CLOUD COLOUR (HOW MUCH)',0,1,.01,'d'],['sunhz','MIST TOWARD THE SUN','c','d'],['sunk','MIST TOWARD THE SUN (HOW MUCH)',0,1,.01,'d'],['shaft','SUN SHAFTS',0,1,.01,'d'],['glow','GLOW',0,2.5,.01],
    ['grade','COLOUR OF EVERYTHING','c'],['lift','HAZE OVER EVERYTHING','c'],['liftk','HAZE OVER EVERYTHING (HOW MUCH)',0,.6,.01],
    ['tun','LIGHT IN THE SUBWAY TUNNELS',0,.2,.005],['lamp','LAMPS',0,3,.01,'n'],['star','STARS',0,2,.01,'n'],['moon','MOON',0,1,.01,'n']];
  const S={}; for(const m of DN.modes)S[m]={...D0[m]};
  { const local=location.protocol==='file:'||/^(127\.|localhost)/.test(location.hostname), q=local?Q('look').toLowerCase():'', qh=local?+(Q('hour')||NaN):NaN; if(DN.modes.includes(q)){ DN.mode=q; DN.test=1; } else if(!isNaN(qh)){ DN.mode=qh<6||qh>19?'night':'day'; S[DN.mode].h=qh; DN.test=1; } }
  // the time: DAY or NIGHT by the clock's hour (or the owner's hold, on the server); a change fades over a minute. The sun and sky stay each look's own (CLOCK.sunH); the day's hour runs
  const T={prev:DN.mode,t0:0};
  const B={}, ca=new THREE.Color(), cb=new THREE.Color(), blend=(A,C,f)=>{ for(const k in C){ const a=A[k]??C[k], c=C[k]; if(typeof c==='number'){ if(k==='h'){ let d=((c-a)%24+24)%24; if(d>12)d-=24; B[k]=((a+d*f)%24+24)%24; } else B[k]=a+(c-a)*f; } else if(typeof c==='string'&&c[0]==='#'&&typeof a==='string'&&a[0]==='#')B[k]='#'+ca.set(a).lerp(cb.set(c),f).getHexString(); else B[k]=c; } return B; };
  DN.P=()=>B; DN.E=()=>S[DN.mode]; DN.S=S; DN.D0=D0;
  const fix=()=>{ const P=S[DN.mode]; WX.fix={cloud:P.cld,rain:0,snow:0,storm:0,wind:DN.mode==='night'?.08:.15,dir:1,fog:0}; window.PARK&&PARK.lampLit&&PARK.lampLit(); };
  DN.set=(m,fade)=>{ if(!DN.modes.includes(m)||m===DN.mode)return; T.prev=DN.mode; T.t0=fade?Date.now():0; DN.mode=m; fix(); DN.draw(); };   // the time now (the shared pick, or a test's)
  const tc=new THREE.Color(); DN.U={grade:{value:new THREE.Color(1,1,1)},lift:{value:new THREE.Color(0,0,0)},liftK:{value:0}};
  SYS.add('clockPre',()=>{ const f0=Math.min(1,(Date.now()-T.t0)/DN.FADE), f=f0*f0*(3-2*f0); blend(S[T.prev]||S[DN.mode],S[DN.mode],f); if(!CLOCK.run){ CLOCK.sunH=B.h; CLOCK.h=DN.test?B.h:DN.clockH(); const m=DN.test?DN.mode:DN.hold||DN.lookFor(CLOCK.h); if(m!==DN.mode)DN.set(m,DN.started); } else CLOCK.sunH=null; },'134b-daynight');
  setTimeout(()=>{ DN.started=1; },5000);   // (from here on a change of look fades)
  SYS.add('sky',()=>{ const P=B, up=SHARED.LVL!=='down';
    CLOCK.sun.intensity*=P.sun; CLOCK.sun.color.multiply(tc.set(P.sunc)); if(up){ HEMI.intensity*=P.amb; if(P.ambc)HEMI.color.multiply(tc.set(P.ambc)); } DN.lk=P.lamp;
    DN.U.grade.value.set(P.grade); DN.U.lift.value.set(P.lift); DN.U.liftK.value=up?P.liftk:0;
    if(SKY.on()){ U.uZ.value.set(P.zen); U.uH.value.set(P.hor); U.uM.value.copy(U.uH.value).lerp(U.uZ.value,.45); U.uCov.value=P.cov; U.uCL.value=P.cl; U.uCldC.value.set(P.cldc||'#ffffff'); U.uCldK.value=P.cldk||0; U.uBands.value=P.bands; U.uMistK.value*=P.skym;
      U.uStar.value=Math.min(2,U.uStar.value*P.star); U.uMoonK.value=Math.min(1,U.uMoonK.value*P.moon); }
    MISTS.x=CLOCK.sunV.x; MISTS.y=CLOCK.sunV.y; MISTS.z=CLOCK.sunV.z; MISTS.w=up&&MISTE.x&&FAR3.mist?(P.sunk||0)*Math.max(0,Math.min(1,(CLOCK.elev()+2)/6)):0; MISTSC.set(P.sunhz||'#ffffff');
    if(MISTE.x&&FAR3.mist){ MISTE.y=P.m0; MISTE.z=P.m1; const f=FAR3.fog.color.lerp(P.mist?tc.set(P.mist):U.uH.value,P.hz); U.uMistC.value.copy(f); FAR3.FU.uMC.value.copy(f).multiplyScalar(P.farb); if(scene.background&&scene.background.isColor)scene.background.copy(f).multiplyScalar(.5); }
    { const shop=!!(ROOMS.cur&&!ROOMS.cur.off&&STORE.inside&&STORE.inside[ROOMS.cur.id]); if(shop!==DN.shop){ DN.shop=shop; VIS.hide(SKY.dome,'room',shop); } if(shop&&scene.background&&scene.background.isColor)scene.background.setRGB(0,0,0); }   // inside a street shop: a black void past its walls
    if(!up){ SKY.dome.visible=false; if(scene.background&&scene.background.isColor)scene.background.setRGB(0,0,0); } },'134b-daynight');
  const box=document.getElementById('adn'), fmt=h=>String(Math.floor(h)).padStart(2,'0')+':'+String(Math.floor(h%1*60)).padStart(2,'0'); let dirty=false;
  DN.dayText=()=>'the clock\'s, the same for everyone: '+fmt(CLOCK.h)+(DN.hold?' (held at '+DN.names[DN.hold]+' by the owner)':'');
  const msg=t=>{ const e=box&&box.querySelector('#dnmsg'); if(e)e.textContent=t; };
  const V=TPANE.live({mode:[()=>DN.hold||'clock',m=>{ if(!DN.owner||m===(DN.hold||'clock'))return; DN.hold=m==='clock'?null:m; if(m!=='clock')DN.set(m,true); msg('setting the time...'); DN.pushTime(m).then(()=>msg(m==='clock'?'the clock\'s, for everyone':DN.names[m]+' for everyone, until the clock\'s is picked')).catch(e=>msg('not set: '+(e.message||'try again'))); }],
    ...Object.fromEntries([...new Set(F.map(f=>f[0]))].map(k=>[k,[()=>DN.E()[k]??'#000000',v=>{ const P=DN.E(); if(typeof v==='number')v=+v.toFixed(4); if(P[k]===v)return; P[k]=v; if(k==='cld'||k==='lamp')fix(); dirty=true; msg('not saved'); }]]))});
  let pm=null, pk='', open=true, busy=Promise.resolve();
  const build=async()=>{ '@later'; const m=DN.mode, k=m==='night'?'n':'d'; if(pm&&pk===m)return pm.refresh(); const p=await TPANE.make(box.querySelector('.dntp'));
    p.addBinding(V,'mode',{label:'THE TIME FOR EVERYONE',options:{"THE CLOCK'S":'clock',...Object.fromEntries(DN.modes.map(x=>[DN.names[x]+' (HELD)',x]))}});
    const fd=p.addFolder({title:DN.names[m]+': ITS DETAILS',expanded:open}); fd.on('fold',e=>{ open=e.expanded; });
    for(const [key,l,a,b,st,w] of F){ const c=a==='c', wh=c?b:w; if(wh&&!wh.includes(k))continue; fd.addBinding(V,key,c?{label:l,view:'color'}:{label:l,min:a,max:b,step:st}); }
    p.addButton({title:'SAVE'}).on('click',()=>{ msg('saving...'); DN.push().then(()=>{ dirty=false; msg('live for everyone'); }).catch(e=>msg('not saved: '+(e.message||'try again'))); });
    p.addButton({title:'RESET'}).on('click',()=>{ S[DN.mode]={...D0[DN.mode]}; fix(); DN.draw(); msg('resetting...'); DN.push().then(()=>{ dirty=false; msg('back to the game\'s own, for everyone'); }).catch(e=>{ dirty=true; msg('not reset on the server: '+(e.message||'try again')); }); });
    p.addButton({title:'EXPORT'}).on('click',()=>{ const o=box.querySelector('#dnout'); o.hidden=false; o.value=DN.names[DN.mode]+' '+JSON.stringify(DN.E()); o.select(); msg('copy this and send it to Claude'); });
    pm=p; pk=m; };
  DN.draw=()=>{ if(!box)return; const m=DN.mode;
    if(!DN.owner){ box.innerHTML=`<h3>THE HOURS</h3><div class="row"><span class="dim" id="dnday">${DN.names[m]}: ${DN.dayText()}</span></div>`; return; }
    if(!box.querySelector('.dntp')){ box.innerHTML='<h3>THE HOURS</h3><div class="dntp"></div><div class="row"><span class="dim" id="dnday">the clock\'s by default (night 20:00 to 06:00); hold a look for everyone to edit or keep it (a change fades over a minute)</span><span class="dim" id="dnmsg"></span></div><textarea id="dnout" hidden style="width:100%;height:60px;font:10px monospace"></textarea>'; pm=null; }
    msg(dirty?'not saved':''); if(box.offsetParent)busy=busy.then(build).catch(e=>msg('panel did not load: '+e.message)); };
  if(box)for(const ev of ['keydown','keyup'])box.addEventListener(ev,e=>{ if(e.target.matches('input,textarea'))e.stopPropagation(); });
  setTimeout(()=>{ if(BUGS.owner)BUGS.owner().then(o=>{ DN.owner=!!o; if(o&&box&&box.offsetParent)DN.draw(); }).catch(()=>{}); },3000);   // EXPORT ("send it to Claude") is the owner's
  { const FILE='/shared/looks.json', take=j=>{ if(!j||typeof j!=='object')return; for(const m of DN.modes)if(j[m]&&typeof j[m]==='object')S[m]={...D0[m],...j[m]}; fix(); DN.draw(); };
    const get=()=>fetch(FILE,{credentials:'same-origin'}).then(r=>r.ok&&r.status!==204?r.json():null).then(take).catch(()=>{});
    const TF='/shared/time.json', getT=()=>fetch(TF,{credentials:'same-origin'}).then(r=>r.ok&&r.status!==204?r.json():null).then(j=>{ if(j&&j.hold&&DN.modes.includes(j.now)){ DN.hold=j.now; DN.set(j.now,DN.started); } else DN.hold=null; }).catch(()=>{});   // (a pick from before the clock ran, with no hold, is the clock's now)
    if(!DN.test){ get(); getT(); }
    DN.pushTime=m=>fetch(TF,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({now:m,hold:m==='clock'?0:1})}).then(async r=>{ const o=await r.json().catch(()=>({})); if(!r.ok||!o.ok)throw new Error(o.why||r.status); if(ONLINE.put&&ONLINE.on)ONLINE.put('time',Date.now()); });
    DN.diff=()=>{ const o={}; for(const m of DN.modes){ const d={}; for(const k in S[m])if(S[m][k]!==D0[m][k])d[k]=S[m][k]; if(Object.keys(d).length)o[m]=d; } return o; };   // only what differs from the game's own: a reset look leaves the file
    DN.push=()=>fetch(FILE,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(DN.diff())}).then(async r=>{ const o=await r.json().catch(()=>({})); if(!r.ok||!o.ok)throw new Error(o.why||r.status); if(ONLINE.put&&ONLINE.on)ONLINE.put('looks',Date.now()); });
    let lastL=null, lastT=null; SYS.add('world',(k,v)=>{ if(DN.owner||DN.test)return; if(k==='looks'&&v!==lastL){ lastL=v; get(); } if(k==='time'&&v!==lastT){ lastT=v; DN.started=1; getT(); } },'134b-looks'); }
  CLOCK.run=false; blend(S[DN.mode],S[DN.mode],1); fix(); DN.draw(); window.DN=DN; window.DNDBG=()=>({mode:DN.mode,h:+CLOCK.h.toFixed(2),elev:+CLOCK.elev().toFixed(1),wx:WX.now,lk:DN.lk}); }
