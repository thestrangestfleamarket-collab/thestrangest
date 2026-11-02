// THE HOURS: DN holds the four looks, SUNRISE, DAY, SUNSET and NIGHT (each sets the sun, sky, mist, clouds and the colour of everything; smooth skies, the far fading into the horizon's colour), takes turns through them one real hour each with a minute's fade (no running clock), and the ATMOSPHERE panel for their details.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DN, FAR3, PARK, SKY, WX} from './003b-systems.js';
import {scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {MISTE, MISTS, MISTSC, QS, SYS} from './006-map-pre.js';
import {HEMI} from './064-map-post.js';
Object.assign(DN,{lk:1,mode:'sunset',hold:null,modes:['sunrise','day','sunset','night'],names:{sunrise:'SUNRISE',day:'DAY',sunset:'SUNSET',night:'NIGHT'},HOUR:3600000,FADE:60000});
{ const U=SKY.U, Q=k=>(QS.get(k)??''),
    D0={sunrise:{h:7.75,sun:1.3,amb:1.5,sunc:'#ffc890',ambc:'#c8c0d8',zen:'#7f8ab0',hor:'#f2b48c',cld:0,cov:1,cl:1.1,m0:4,m1:140,hz:1,mist:'#d4a898',skym:0,farb:1.05,grade:'#fff4ee',lift:'#d4a898',liftk:.06,lamp:1,star:1,moon:1,cldc:'#f0d8d0',cldk:.9,sunhz:'#f4c9a8',sunk:.4,shaft:0,glow:1.1,bands:0},
      day:{h:13,sun:1.35,amb:1.3,sunc:'#fff0d6',ambc:'#e8eef8',zen:'#4a86d8',hor:'#c4d6ea',cld:0,cov:1,cl:1.1,m0:4,m1:140,hz:1,mist:'#c0d2e6',skym:0,farb:1.05,grade:'#fffaf4',lift:'#c0d2e6',liftk:.05,lamp:1,star:1,moon:1,cldc:'#f0d8d0',cldk:.9,sunhz:'#f4c9a8',sunk:.2,shaft:0,glow:1.1,bands:0},
      sunset:{h:17.95,sun:1.5,amb:1.6,sunc:'#ffd2a0',ambc:'#dcc6cc',zen:'#868cac',hor:'#e09d75',cld:0,cov:1,cl:1.1,m0:4,m1:140,hz:1,mist:'#c99a84',skym:0,farb:1.05,grade:'#fff3ea',lift:'#c99a84',liftk:.08,lamp:1,star:1,moon:1,cldc:'#f0d8d0',cldk:.9,sunhz:'#f4c9a8',sunk:.4,shaft:0,glow:1.1,bands:0},
      night:{h:23,sun:1.1,amb:1.05,sunc:'#ffffff',ambc:'#ffffff',zen:'#0e1322',hor:'#2c3350',cld:0,cov:1,cl:1.1,m0:4,m1:140,hz:1,mist:'#1f2640',skym:0,farb:.62,grade:'#ffffff',lift:'#1a2038',liftk:.1,lamp:1.25,star:1.3,moon:1,cldc:'#f0d8d0',cldk:.9,sunhz:'#f4c9a8',sunk:0,shaft:0,glow:1.1,bands:0}};
  const F=[['h','SUN HEIGHT (THE HOUR)',7.5,18.5,.05,'dg'],['h','NIGHT HOUR (WHERE THE MOON IS)',19.5,29.5,.05,'n'],['sun','SUNLIGHT',0,2,.01,'dg'],['sun','MOONLIGHT',0,3,.01,'n'],['sunc','SUNLIGHT COLOUR','c','dg'],['amb','LIGHT ALL ROUND',0,3,.01],['ambc','LIGHT ALL ROUND COLOUR (THE SHADOWS)','c'],
    ['zen','SKY OVERHEAD','c'],['hor','SKY AT THE HORIZON','c'],['bands','SKY BANDS (0 = SMOOTH)',0,8,1],['cld','CLOUDY (DIMS THE SUN)',0,1,.01],['cov','CLOUD COVER (LOWER = MORE, 1 = NONE)',.2,1,.01],['cl','CLOUD BRIGHTNESS',.5,1.6,.01],
    ['m0','MIST STARTS (TILES PAST TOWN)',-10,120,1],['m1','MIST DEPTH (TILES)',4,160,1],['hz','MIST TINTED BY THE SKY',0,1,.01],['mist','MIST COLOUR','c','dg'],['skym','SKY HIDDEN BY THE MIST',0,1,.01],['farb','FAR CITY HAZE BRIGHTNESS',.3,1.3,.01],
    ['cldc','CLOUD COLOUR','c','d'],['cldk','CLOUD COLOUR (HOW MUCH)',0,1,.01,'d'],['sunhz','MIST TOWARD THE SUN','c','d'],['sunk','MIST TOWARD THE SUN (HOW MUCH)',0,1,.01,'d'],['shaft','SUN SHAFTS',0,1,.01,'d'],['glow','GLOW',0,2.5,.01],
    ['grade','COLOUR OF EVERYTHING','c'],['lift','HAZE OVER EVERYTHING','c'],['liftk','HAZE OVER EVERYTHING (HOW MUCH)',0,.6,.01],
    ['lamp','LAMPS',0,3,.01,'n'],['star','STARS',0,2,.01,'n'],['moon','MOON',0,1,.01,'n']];
  const S={}; for(const m of DN.modes){ S[m]={...D0[m]}; try{ Object.assign(S[m],JSON.parse(SAVE.get('dn-'+m)||'{}')); }catch(e){} }
  { const q=Q('look').toLowerCase(), qh=+(Q('hour')||NaN); if(DN.modes.includes(q)){ DN.hold=DN.mode=q; DN.test=1; } else if(!isNaN(qh)){ DN.hold=DN.mode=qh<6||qh>19?'night':'day'; S[DN.mode].h=qh; DN.test=1; } }
  // the hours: the four looks take turns, one real hour each, the same for everyone (the wall clock, nothing stored); the first minute of each hour fades from the last look
  DN.cycleAt=t=>{ const n=Math.floor(t/DN.HOUR), i=((n%4)+4)%4, f=Math.min(1,(t-n*DN.HOUR)/DN.FADE); return {cur:DN.modes[i],prev:DN.modes[(i+3)%4],f:f*f*(3-2*f)}; };
  const B={}, ca=new THREE.Color(), cb=new THREE.Color(), blend=(A,C,f)=>{ for(const k in C){ const a=A[k]??C[k], c=C[k]; if(typeof c==='number'){ if(k==='h'){ let d=((c-a)%24+24)%24; if(d>12)d-=24; B[k]=((a+d*f)%24+24)%24; } else B[k]=a+(c-a)*f; } else if(typeof c==='string'&&c[0]==='#'&&typeof a==='string'&&a[0]==='#')B[k]='#'+ca.set(a).lerp(cb.set(c),f).getHexString(); else B[k]=c; } return B; };
  DN.P=()=>B; DN.E=()=>S[DN.mode]; DN.S=S; DN.D0=D0;
  const fix=()=>{ const P=S[DN.mode]; WX.fix={cloud:P.cld,rain:0,snow:0,storm:0,wind:DN.mode==='night'?.08:.15,dir:1,fog:0}; window.PARK&&PARK.lampLit&&PARK.lampLit(); };
  DN.set=m=>{ if(!DN.modes.includes(m))return; DN.hold=DN.mode=m; fix(); DN.draw(); };   // a pick holds that look (the editor's preview, the tests); FOLLOW THE HOURS lets go
  DN.follow=()=>{ DN.hold=null; DN.draw(); };
  const tc=new THREE.Color(); DN.U={grade:{value:new THREE.Color(1,1,1)},lift:{value:new THREE.Color(0,0,0)},liftK:{value:0}};
  SYS.add('clockPre',()=>{ if(DN.hold||DN.test)blend(S[DN.mode],S[DN.mode],1); else { const c=DN.cycleAt(Date.now()); if(c.cur!==DN.mode){ DN.mode=c.cur; fix(); DN.draw(); } blend(S[c.prev],S[c.cur],c.f); } CLOCK.h=B.h; },'134b-daynight');
  SYS.add('sky',()=>{ const P=B, up=SHARED.LVL!=='down';
    CLOCK.sun.intensity*=P.sun; CLOCK.sun.color.multiply(tc.set(P.sunc)); if(up){ HEMI.intensity*=P.amb; if(P.ambc)HEMI.color.multiply(tc.set(P.ambc)); } DN.lk=P.lamp;
    DN.U.grade.value.set(P.grade); DN.U.lift.value.set(P.lift); DN.U.liftK.value=up?P.liftk:0;
    if(SKY.on()){ U.uZ.value.set(P.zen); U.uH.value.set(P.hor); U.uM.value.copy(U.uH.value).lerp(U.uZ.value,.45); U.uCov.value=P.cov; U.uCL.value=P.cl; U.uCldC.value.set(P.cldc||'#ffffff'); U.uCldK.value=P.cldk||0; U.uBands.value=P.bands; U.uMistK.value*=P.skym;
      U.uStar.value=Math.min(2,U.uStar.value*P.star); U.uMoonK.value=Math.min(1,U.uMoonK.value*P.moon); }
    MISTS.x=CLOCK.sunV.x; MISTS.y=CLOCK.sunV.y; MISTS.z=CLOCK.sunV.z; MISTS.w=up&&MISTE.x&&FAR3.mist?(P.sunk||0)*Math.max(0,Math.min(1,(CLOCK.elev()+2)/6)):0; MISTSC.set(P.sunhz||'#ffffff');
    if(MISTE.x&&FAR3.mist){ MISTE.y=P.m0; MISTE.z=P.m1; const f=FAR3.fog.color.lerp(P.mist?tc.set(P.mist):U.uH.value,P.hz); U.uMistC.value.copy(f); FAR3.FU.uMC.value.copy(f).multiplyScalar(P.farb); if(scene.background&&scene.background.isColor)scene.background.copy(f).multiplyScalar(.5); }
    if(!up){ SKY.dome.visible=false; if(scene.background&&scene.background.isColor)scene.background.setRGB(0,0,0); } },'134b-daynight');
  const box=document.getElementById('adn'), fl=v=>(+v).toFixed(2); let dirty=false;
  DN.draw=()=>{ if(!box)return; const m=DN.mode, P=S[m], k=m==='night'?'n':'d';
    const next=Math.ceil((DN.HOUR-Date.now()%DN.HOUR)/60000);
    box.innerHTML=`<h3>THE HOURS</h3><div class="row" id="dnm">${DN.modes.map(x=>`<button class="btn" data-dn="${x}" aria-pressed="${m===x}">${DN.names[x]}</button>`).join('')}${DN.hold?'<button class="btn" id="dnfollow">FOLLOW THE HOURS</button>':''}<span class="dim">${DN.hold?'held to edit; shift+N the next':'one real hour each, the same for everyone; the next in '+next+' min'}</span></div>
      <h3>${DN.names[m]}: ITS DETAILS</h3>`+F.filter(f=>{ const w=f[2]==='c'?f[3]:f[5]; return !w||w.includes(k==='n'?'n':'d'); }).map(([key,l,a,b,st])=>a==='c'?`<div class="row"><span style="width:250px">${l}</span><input type="color" data-k="${key}" value="${P[key]||'#000000'}"></div>`
        :`<div class="row"><span style="width:250px">${l}</span><input type="range" data-k="${key}" min="${a}" max="${b}" step="${st}" value="${P[key]}" style="flex:1"><span style="width:44px;text-align:right">${fl(P[key])}</span></div>`).join('')
      +`<div class="row"><button class="btn" id="dnsave">SAVE</button><button class="btn" id="dnreset">RESET</button><button class="btn" id="dnexp">EXPORT</button><span class="dim" id="dnmsg">${dirty?'not saved':''}</span></div><textarea id="dnout" hidden style="width:100%;height:60px;font:10px monospace"></textarea>`; };
  if(box){ for(const ev of ['keydown','keyup'])box.addEventListener(ev,e=>{ if(e.target.matches('input,textarea'))e.stopPropagation(); });
    box.addEventListener('input',e=>{ '@later'; const k=e.target.dataset.k; if(!k)return; const P=DN.E(); P[k]=e.target.type==='color'?e.target.value:+e.target.value; if(e.target.type==='range')e.target.nextElementSibling.textContent=fl(P[k]); if(k==='cld'||k==='lamp')fix(); dirty=true; box.querySelector('#dnmsg').textContent='not saved'; });
    box.addEventListener('click',e=>{ '@later'; const t=e.target, m=t.dataset.dn, msg=()=>box.querySelector('#dnmsg');
      if(m)DN.set(m); if(t.id==='dnfollow')DN.follow();
      if(t.id==='dnsave'){ SAVE.set('dn-'+DN.mode,JSON.stringify(DN.E())); dirty=false; msg().textContent='saved'; }
      if(t.id==='dnreset'){ S[DN.mode]={...D0[DN.mode]}; SAVE.del('dn-'+DN.mode); dirty=false; fix(); DN.draw(); msg().textContent='back to the game\'s own'; }
      if(t.id==='dnexp'){ const o=box.querySelector('#dnout'); o.hidden=false; o.value=DN.names[DN.mode]+' '+JSON.stringify(DN.E()); o.select(); msg().textContent='copy this and send it to Claude'; } }); }
  addEventListener('keydown',e=>{ if(e.key.toLowerCase()==='n'&&e.shiftKey&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))DN.set(DN.modes[(DN.modes.indexOf(DN.mode)+1)%DN.modes.length]); });
  CLOCK.run=false; blend(S[DN.mode],S[DN.mode],1); fix(); DN.draw(); window.DN=DN; window.DNDBG=()=>({mode:DN.mode,hold:DN.hold,h:+CLOCK.h.toFixed(2),elev:+CLOCK.elev().toFixed(1),wx:WX.now,lk:DN.lk}); }
