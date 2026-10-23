// THE LOOK: DN holds the looks, DAY, GOLDEN, SOFT DAY and NIGHT (one pick sets the sun, sky, mist, clouds, shafts and the colour of everything), and the ATMOSPHERE panel for their details.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DN, FAR3, PARK, SKY, WX} from './003b-systems.js';
import {scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {MISTE, MISTS, MISTSC, QS, SYS} from './006-map-pre.js';
import {HEMI} from './064-map-post.js';
Object.assign(DN,{lk:1,mode:'day',modes:['day','golden','soft','night'],names:{day:'DAY',golden:'GOLDEN',soft:'SOFT DAY',night:'NIGHT'}});
{ const U=SKY.U, Q=k=>(QS.get(k)??''),
    D0={day:{h:13.2,sun:1.35,amb:1.2,sunc:'#ffffff',zen:'#2370ec',hor:'#9ccbf6',cld:.02,cov:.92,cl:1.25,m0:70,m1:100,hz:.8,mist:'#86baf0',skym:.1,farb:1.15,grade:'#ffffff',lift:'#000000',liftk:0,lamp:1,star:1,moon:1,cldc:'#ffffff',cldk:0,sunhz:'#ffffff',sunk:0,shaft:0,glow:1},
      soft:{h:15.6,sun:1.15,amb:1.35,sunc:'#ffe6c4',zen:'#7fa6d8',hor:'#e8c8c0',cld:.08,cov:.74,cl:1.3,m0:14,m1:90,hz:.55,mist:'#a9bcd6',skym:.6,farb:1.1,grade:'#f6eee6',lift:'#c9b4c8',liftk:.12,lamp:1,star:1,moon:1,cldc:'#f2c2b0',cldk:.85,sunhz:'#f4c9a8',sunk:.7,shaft:.8,glow:1.6},
      golden:{h:16.3,sun:1.2,amb:1.2,sunc:'#ffe2a8',zen:'#f2c46a',hor:'#fff1bc',cld:.04,cov:.9,cl:1.1,m0:8,m1:60,hz:1,mist:'#f6d68e',skym:.5,farb:1,grade:'#fff2d2',lift:'#f2c463',liftk:.2,lamp:1,star:1,moon:1,cldc:'#ffffff',cldk:0,sunhz:'#ffffff',sunk:0,shaft:0,glow:1},
      night:{h:22.5,sun:1.3,amb:1.25,sunc:'#ffffff',zen:'#04060e',hor:'#141c40',cld:.1,cov:.62,cl:.85,m0:34,m1:26,hz:.25,mist:'',skym:1,farb:.62,grade:'#ffffff',lift:'#000000',liftk:0,lamp:1.25,star:1.3,moon:1,cldc:'#ffffff',cldk:0,sunhz:'#ffffff',sunk:0,shaft:0,glow:1}};
  const F=[['h','SUN HEIGHT (THE HOUR)',7.5,18.5,.05,'dg'],['h','NIGHT HOUR (WHERE THE MOON IS)',19.5,29.5,.05,'n'],['sun','SUNLIGHT',0,2,.01,'dg'],['sun','MOONLIGHT',0,3,.01,'n'],['sunc','SUNLIGHT COLOUR','c','dg'],['amb','LIGHT ALL ROUND',0,3,.01],
    ['zen','SKY OVERHEAD','c'],['hor','SKY AT THE HORIZON','c'],['cld','CLOUDY (DIMS THE SUN)',0,1,.01],['cov','HIGH CLOUD COVER (LOWER = MORE)',.2,.95,.01],['cl','HIGH CLOUD BRIGHTNESS',.5,1.6,.01],
    ['m0','MIST STARTS (TILES PAST TOWN)',-10,120,1],['m1','MIST DEPTH (TILES)',4,160,1],['hz','MIST TINTED BY THE SKY',0,1,.01],['mist','MIST COLOUR','c','dg'],['skym','SKY HIDDEN BY THE MIST',0,1,.01],['farb','FAR CITY HAZE BRIGHTNESS',.3,1.3,.01],
    ['cldc','HIGH CLOUD COLOUR','c','d'],['cldk','HIGH CLOUD COLOUR (HOW MUCH)',0,1,.01,'d'],['sunhz','MIST TOWARD THE SUN','c','d'],['sunk','MIST TOWARD THE SUN (HOW MUCH)',0,1,.01,'d'],['shaft','SUN SHAFTS',0,1,.01,'d'],['glow','GLOW',0,2.5,.01],
    ['grade','COLOUR OF EVERYTHING','c'],['lift','HAZE OVER EVERYTHING','c'],['liftk','HAZE OVER EVERYTHING (HOW MUCH)',0,.6,.01],
    ['lamp','LAMPS',0,3,.01,'n'],['star','STARS',0,2,.01,'n'],['moon','MOON',0,1,.01,'n']];
  const S={}; for(const m of DN.modes){ S[m]={...D0[m]}; try{ Object.assign(S[m],JSON.parse(SAVE.get('dn-'+m)||'{}')); }catch(e){} }
  try{ const v=SAVE.get('dn'); if(DN.modes.includes(v))DN.mode=v; }catch(e){}
  { const q=Q('look').toLowerCase(), qh=+(Q('hour')||NaN); if(DN.modes.includes(q)){ DN.mode=q; DN.test=1; } else if(!isNaN(qh)){ DN.mode=qh<6||qh>19?'night':'day'; S[DN.mode].h=qh; DN.test=1; } }
  DN.P=()=>S[DN.mode]; DN.S=S; DN.D0=D0;
  const fix=()=>{ const P=DN.P(); WX.fix={cloud:P.cld,rain:0,snow:0,storm:0,wind:DN.mode==='night'?.08:.15,dir:1,fog:0}; window.PARK&&PARK.lampLit&&PARK.lampLit(); };
  DN.set=m=>{ if(!DN.modes.includes(m))return; DN.mode=m; if(!DN.test)try{ SAVE.set('dn',m); }catch(e){} fix(); DN.draw(); };
  const tc=new THREE.Color(); DN.U={grade:{value:new THREE.Color(1,1,1)},lift:{value:new THREE.Color(0,0,0)},liftK:{value:0}};
  SYS.add('clockPre',()=>{ if(!CLOCK.run)CLOCK.h=((DN.P().h%24)+24)%24; },'134b-daynight');
  SYS.add('sky',()=>{ const P=DN.P(), night=DN.mode==='night', up=SHARED.LVL!=='down';
    CLOCK.sun.intensity*=P.sun; CLOCK.sun.color.multiply(tc.set(P.sunc)); if(up)HEMI.intensity*=P.amb; DN.lk=night?P.lamp:1;
    DN.U.grade.value.set(P.grade); DN.U.lift.value.set(P.lift); DN.U.liftK.value=up?P.liftk:0;
    if(SKY.dome.visible){ U.uZ.value.set(P.zen); U.uH.value.set(P.hor); U.uM.value.copy(U.uH.value).lerp(U.uZ.value,.45); U.uCov.value=P.cov; U.uCL.value=P.cl; U.uMistK.value*=P.skym; U.uCldC.value.set(P.cldc||'#ffffff'); U.uCldK.value=P.cldk||0;
      if(night){ U.uStar.value=Math.min(2,U.uStar.value*P.star); U.uMoonK.value=Math.min(1,U.uMoonK.value*P.moon); } }
    MISTS.x=CLOCK.sunV.x; MISTS.y=CLOCK.sunV.y; MISTS.z=CLOCK.sunV.z; MISTS.w=up&&MISTE.x&&FAR3.mist?(P.sunk||0)*Math.max(0,Math.min(1,(CLOCK.elev()+2)/6)):0; MISTSC.set(P.sunhz||'#ffffff');
    if(MISTE.x&&FAR3.mist){ MISTE.y=P.m0; MISTE.z=P.m1; const f=FAR3.fog.color.lerp(P.mist?tc.set(P.mist):U.uH.value,P.hz); U.uMistC.value.copy(f); FAR3.FU.uMC.value.copy(f).multiplyScalar(P.farb); if(scene.background&&scene.background.isColor)scene.background.copy(f).multiplyScalar(.5); }
    if(!up){ SKY.dome.visible=false; if(scene.background&&scene.background.isColor)scene.background.setRGB(0,0,0); } },'134b-daynight');
  const box=document.getElementById('adn'), fl=v=>(+v).toFixed(2); let dirty=false;
  DN.draw=()=>{ if(!box)return; const m=DN.mode, P=S[m], k=m==='night'?'n':'d';
    box.innerHTML=`<h3>THE LOOK</h3><div class="row" id="dnm">${DN.modes.map(x=>`<button class="btn" data-dn="${x}" aria-pressed="${m===x}">${DN.names[x]}</button>`).join('')}<span class="dim">N goes to the next</span></div>
      <h3>${DN.names[m]}: ITS DETAILS</h3>`+F.filter(f=>{ const w=f[2]==='c'?f[3]:f[5]; return !w||w.includes(k==='n'?'n':'d'); }).map(([key,l,a,b,st])=>a==='c'?`<div class="row"><span style="width:250px">${l}</span><input type="color" data-k="${key}" value="${P[key]||'#000000'}"></div>`
        :`<div class="row"><span style="width:250px">${l}</span><input type="range" data-k="${key}" min="${a}" max="${b}" step="${st}" value="${P[key]}" style="flex:1"><span style="width:44px;text-align:right">${fl(P[key])}</span></div>`).join('')
      +`<div class="row"><button class="btn" id="dnsave">SAVE</button><button class="btn" id="dnreset">RESET</button><button class="btn" id="dnexp">EXPORT</button><span class="dim" id="dnmsg">${dirty?'not saved':''}</span></div><textarea id="dnout" hidden style="width:100%;height:60px;font:10px monospace"></textarea>`; };
  if(box){ for(const ev of ['keydown','keyup'])box.addEventListener(ev,e=>{ if(e.target.matches('input,textarea'))e.stopPropagation(); });
    box.addEventListener('input',e=>{ '@later'; const k=e.target.dataset.k; if(!k)return; const P=DN.P(); P[k]=e.target.type==='color'?e.target.value:+e.target.value; if(e.target.type==='range')e.target.nextElementSibling.textContent=fl(P[k]); if(k==='cld'||k==='lamp')fix(); dirty=true; box.querySelector('#dnmsg').textContent='not saved'; });
    box.addEventListener('click',e=>{ '@later'; const t=e.target, m=t.dataset.dn, msg=()=>box.querySelector('#dnmsg');
      if(m)DN.set(m);
      if(t.id==='dnsave'){ SAVE.set('dn-'+DN.mode,JSON.stringify(DN.P())); dirty=false; msg().textContent='saved'; }
      if(t.id==='dnreset'){ S[DN.mode]={...D0[DN.mode]}; SAVE.del('dn-'+DN.mode); dirty=false; fix(); DN.draw(); msg().textContent='back to the game\'s own'; }
      if(t.id==='dnexp'){ const o=box.querySelector('#dnout'); o.hidden=false; o.value=DN.names[DN.mode]+' '+JSON.stringify(DN.P()); o.select(); msg().textContent='copy this and send it to Claude'; } }); }
  addEventListener('keydown',e=>{ if(e.key.toLowerCase()==='n'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))DN.set(DN.modes[(DN.modes.indexOf(DN.mode)+1)%DN.modes.length]); });
  CLOCK.run=false; fix(); DN.draw(); window.DN=DN; window.DNDBG=()=>({mode:DN.mode,h:CLOCK.h,elev:+CLOCK.elev().toFixed(1),wx:WX.now,lk:DN.lk}); }
