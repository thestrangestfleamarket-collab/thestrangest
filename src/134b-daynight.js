// THE HOURS: DN holds the eight looks (four for day, four for night: each sets the sun, sky, mist, clouds, weather and the colour of everything), one each real half hour in turn, the same for everyone (the game's clock, worker/clock.js: the owner can set it, stop it or hold a look, /shared/time.json); the looks themselves are the game's or the owner's saved ones (/shared/looks.json); ATMOSPHERE edits them (the owner only).
import {SHARED, THREE} from './003-shx.js';
import {BUGS, CLOCK, DN, FAR3, ONLINE, PARK, pos, ROOMS, SKY, VIS, W3, WX} from './003b-systems.js';
import {scene} from './004-main.js';
import {MISTE, MISTS, MISTSC, MODS, QS, STORE, SYS} from './006-map-pre.js';
import {HEMI} from './064-map-post.js';
import {TPANE} from './087dz-tpane.js';
__CODE__("worker/clock.js")
Object.assign(DN,{lk:1,mode:'morning',modes:['morning','afternoon','overcast','sunset','bluehour','lamplit','moonfog','neonrain'],FADE:60000,hold:null,clk:null,
  names:{morning:'GOLDEN MORNING',afternoon:'AMBER AFTERNOON',overcast:'SOFT AMBER OVERCAST',sunset:'SUNSET BLAZE',bluehour:'BLUE HOUR',lamplit:'LAMPLIT NIGHT',moonfog:'MOONLIT FOG',neonrain:'NEON RAIN'},
  kind:{morning:'day',afternoon:'day',overcast:'day',sunset:'dusk',bluehour:'dusk',lamplit:'night',moonfog:'night',neonrain:'night'}});
// the game's hour, the same for everyone: real Central time unless the owner set or stopped it (worker/clock.js, DN.clk); the look follows the real sunrise and sunset there, unless the owner holds one
DN.clockH=()=>CLK.hour(Date.now(),DN.clk); DN.day=()=>CLK.day(Date.now(),DN.clk); { let tk=-1, tv=null; DN.times=()=>{ const k=Math.floor(Date.now()/60000); if(k!==tk){ tk=k; tv=CLK.sun(Date.now(),DN.clk); } return tv; }; }   // the real sunrise and sunset on the game's date
// the look by the clock's hour: one each half hour, the eight in turn (owner, 11 Nov 2026: no real time); a test's ?hour picks the look whose sun is nearest that hour
DN.lookFor=h=>DN.modes[((Math.floor(h*2)%8)+8)%8];
DN.lookAtSky=h=>{ let best=DN.modes[0], bd=99; for(const m of DN.modes){ let d=Math.abs(((DN.D0[m].h-h)%24+24)%24); d=Math.min(d,24-d); if(d<bd){ bd=d; best=m; } } return best; };
{ const U=SKY.U, Q=k=>(QS.get(k)??''),
    BASE={day:{h:9.5,sun:1.3,amb:1.15,sunc:'#fff6e8',ambc:'#e6f0ff',zen:'#2f7ae8',hor:'#b4d6f6',cld:0,cov:.45,cl:1.3,m0:70,m1:100,hz:.8,mist:'#a8cbf0',skym:0,farb:1.15,grade:'#fbfcff',lift:'#000000',liftk:0,lamp:1,star:1,moon:1,cldc:'#f4ecf4',cldk:.9,sunhz:'#ffffff',sunk:0,shaft:.7,glow:1,bands:0,tun:.02,mw:1,mwc1:'#dfe7ff',mwc2:'#fff0d1',mwgr:1,mww:1,mwcore:1,mwdust:1,mwdet:1,stf:1,stw:1,stc:1},
      dusk:{h:18.9,sun:.25,amb:.75,sunc:'#ff7050',ambc:'#6a78c0',zen:'#1e2c6e',hor:'#d88aa0',cld:0,cov:.45,cl:1.3,m0:70,m1:100,hz:.8,mist:'#7a6a9a',skym:0,farb:1.15,grade:'#f0f0ff',lift:'#2a3060',liftk:.08,lamp:1,star:1,moon:1,cldc:'#f4ecf4',cldk:.9,sunhz:'#ff9080',sunk:.4,shaft:0,glow:1.3,bands:0,tun:.02,mw:1,mwc1:'#dfe7ff',mwc2:'#fff0d1',mwgr:1,mww:1,mwcore:1,mwdust:1,mwdet:1,stf:1,stw:1,stc:1},
      night:{h:23,sun:1.4,amb:1.1,sunc:'#c8d8ff',ambc:'#a8c0ff',zen:'#02030a',hor:'#070c1c',cld:0,cov:1,cl:1.1,m0:4,m1:140,hz:1,mist:'#1a2a50',skym:0,farb:.62,grade:'#ffffff',lift:'#10204a',liftk:.1,lamp:1.25,star:1.6,moon:1,cldc:'#f0d8d0',cldk:.9,sunhz:'#f4c9a8',sunk:0,shaft:0,glow:1.1,bands:0,tun:.02,mw:0,mwc1:'#dfe7ff',mwc2:'#fff0d1',mwgr:1,mww:1,mwcore:1,mwdust:1,mwdet:1,stf:1,stw:1,stc:1}};
  const LK={
    morning:{h:8,sun:1.25,sunc:'#ffc890',amb:1,ambc:'#a8bce8',zen:'#5f86c8',hor:'#f6c995',cov:.5,m0:30,m1:80,hz:.6,mist:'#f0c99c',sunhz:'#ffc070',sunk:.6,shaft:1,glow:1.4,grade:'#fff2e0'},
    afternoon:{h:15.4,sun:1.35,sunc:'#ffd8a0',amb:1.05,ambc:'#b0c2ea',zen:'#3f78d0',hor:'#e8cda4',m0:40,m1:100,hz:.6,mist:'#e2c49a',sunhz:'#ffd8a0',sunk:.4,shaft:.8,glow:1.3,grade:'#fff4e4'},
    overcast:{h:12.5,sun:.45,sunc:'#ffe2bc',amb:1.6,ambc:'#e8dccc',zen:'#a49c92',hor:'#dccab2',cld:.85,cov:.25,cl:.9,cldc:'#e8dcc8',cldk:.8,m0:25,m1:70,hz:.8,mist:'#d2bea0',sunk:0,shaft:0,glow:1.1,grade:'#fff0e0'},
    sunset:{h:17.85,sun:1.4,sunc:'#ff8a48',amb:.8,ambc:'#8a7ac0',zen:'#4a4a90',hor:'#ff8e50',cldc:'#ffb090',cldk:.9,m0:30,m1:90,hz:.7,mist:'#d88060',sunhz:'#ff9050',sunk:.9,shaft:1,glow:1.6,grade:'#ffe8d8',lift:'#301830',liftk:.05},
    bluehour:{h:18.5,sun:.3,sunc:'#8090d0',amb:.9,ambc:'#6a7ac8',zen:'#1a2a5e',hor:'#8a78a8',cldc:'#c8a8c8',m0:30,m1:90,hz:.8,mist:'#4a5486',sunhz:'#ff9a70',sunk:.4,shaft:0,glow:1.5,grade:'#f4f0ff',lift:'#1a2050',liftk:.08,lamp:1.2,star:.6},
    lamplit:{h:23,lamp:1.6,glow:1.6,ambc:'#8ea4e0',mist:'#3a2a1c',m0:20,m1:70,hz:1,grade:'#fff0dc',lift:'#1a1408',liftk:.08,mw:.8},
    moonfog:{h:25,sun:1.8,sunc:'#c4d0ff',mist:'#56627e',m0:6,m1:40,hz:1,fog:.6,lamp:1,glow:1.3,grade:'#f0f4ff',lift:'#203050',liftk:.12,star:.8,mw:0},
    neonrain:{h:27,rain:.7,cld:.6,cov:.3,mist:'#2a1a34',m0:15,m1:60,hz:1,lamp:1.4,glow:1.9,grade:'#fff0fa',lift:'#200a28',liftk:.1,star:0,moon:0,mw:0}};
  const D0={}; for(const m of DN.modes)D0[m]={...BASE[DN.kind[m]],rain:0,fog:0,...LK[m]}; DN.D0=D0;
  const F=[['h','SUN HEIGHT (WHEN HELD; ELSE THE CLOCK)',7.5,18.5,.05,'dg'],['h','DUSK HOUR (WHEN HELD; ELSE THE CLOCK)',17.5,20,.05,'u'],['h','NIGHT HOUR (WHERE THE MOON IS)',19.5,29.5,.05,'n'],['sun','SUNLIGHT',0,2,.01,'dgu'],['sun','MOONLIGHT',0,3,.01,'n'],['sunc','SUNLIGHT COLOUR','c','dgu'],['amb','LIGHT ALL ROUND',0,3,.01],['ambc','LIGHT ALL ROUND COLOUR (THE SHADOWS)','c'],
    ['zen','SKY OVERHEAD','c'],['hor','SKY AT THE HORIZON','c'],['bands','SKY BANDS (0 = SMOOTH)',0,8,1],['rain','RAIN',0,1,.01],['fog','FOG',0,1,.01],['cld','CLOUDY (DIMS THE SUN)',0,1,.01],['cov','CLOUD COVER (LOWER = MORE, 1 = NONE)',.2,1,.01],['cl','CLOUD BRIGHTNESS',.5,1.6,.01],
    ['m0','MIST STARTS (TILES PAST TOWN)',-10,120,1],['m1','MIST DEPTH (TILES)',4,160,1],['hz','MIST TINTED BY THE SKY',0,1,.01],['mist','MIST COLOUR','c','dgu'],['skym','SKY HIDDEN BY THE MIST',0,1,.01],['farb','FAR CITY HAZE BRIGHTNESS',.3,1.3,.01],
    ['cldc','CLOUD COLOUR','c','du'],['cldk','CLOUD COLOUR (HOW MUCH)',0,1,.01,'du'],['sunhz','MIST TOWARD THE SUN','c','du'],['sunk','MIST TOWARD THE SUN (HOW MUCH)',0,1,.01,'du'],['shaft','SUN SHAFTS',0,1,.01,'du'],['glow','GLOW',0,2.5,.01],
    ['grade','COLOUR OF EVERYTHING','c'],['lift','HAZE OVER EVERYTHING','c'],['liftk','HAZE OVER EVERYTHING (HOW MUCH)',0,.6,.01],
    ['tun','LIGHT IN THE SUBWAY TUNNELS',0,.2,.005],['lamp','LAMPS',0,3,.01,'nu'],['star','STARS',0,2,.01,'nu'],['stf','FAINT STARS (0 = ONLY THE BRIGHT ONES)',0,1,.01,'nu'],['stw','STAR TWINKLE',0,3,.01,'nu'],['stc','STAR COLOUR (0 = ALL WHITE)',0,3,.01,'nu'],['mw','MILKY WAY (0 = NONE)',0,4,.01,'nu'],['mwc1','MILKY WAY COLOUR (ARMS)','c','nu'],['mwc2','MILKY WAY COLOUR (CORE)','c','nu'],['mwgr','MILKY WAY GRAIN',0,1,.01,'nu'],['mww','MILKY WAY WIDTH',.3,3,.01,'n'],['mwcore','MILKY WAY CORE GLOW',0,3,.01,'n'],['mwdust','MILKY WAY DUST LANES',0,2,.01,'n'],['mwdet','MILKY WAY CLOUD DETAIL',0,2,.01,'n'],['moon','MOON',0,1,.01,'nu']];
  const S={}; for(const m of DN.modes)S[m]={...D0[m]};
  { const local=location.protocol==='file:'||/^(127\.|localhost)/.test(location.hostname), q=local?Q('look').toLowerCase():'', qh=local?+(Q('hour')||NaN):NaN; const q2={day:'afternoon',dusk:'sunset',night:'lamplit'}[q]||q; if(DN.modes.includes(q2)){ DN.mode=q2; DN.test=1; } else if(!isNaN(qh)){ DN.mode=DN.lookAtSky(qh); S[DN.mode].h=qh; DN.test=1; } }
  // the time: DAY or NIGHT by the clock's hour (or the owner's hold, on the server); a change fades over a minute. The sun and sky stay each look's own (CLOCK.sunH); the day's hour runs
  const T={prev:DN.mode,t0:0};
  // the sun by the clock (not held, not a test): on the horizon at the real sunrise, highest at midday, on the horizon at the real sunset; the moon's disc where the real one is, its real phase (its light stays the night look's)
  // the sky's moment (ms): the game's own while the clock runs; under a held look or a test's hour, that hour laid onto today's real day and night (6 the sunrise, 20 the sunset), so a held NIGHT has a night's stars
  DN.skyAt=(h,t=Date.now())=>{ const {rise:r,set:s}=CLK.sun(t,DN.clk), L=CLK.local(t,DN.clk), z=L-CLK.at(t,DN.clk); h=((h%24)+24)%24; return Math.floor(L/864e5)*864e5+(h>=6&&h<20?r+(h-6)/14*(s-r):s+((h-20+24)%24)/10*(r+24-s))*36e5-z; };
  DN.skyT=()=>DN.fixT??(DN.moving()?CLK.at(Date.now(),DN.clk):DN.skyAt(DN.hold&&!DN.test?S[DN.hold].h:CLOCK.h??12));
  DN.moving=()=>false; CLOCK.moonReal=()=>null;   // no real sky: each look's sun stands at its own hour
  const B={}, ca=new THREE.Color(), cb=new THREE.Color(), blend=(A,C,f)=>{ for(const k in C){ const a=A[k]??C[k], c=C[k]; if(typeof c==='number'){ if(k==='h'){ let d=((c-a)%24+24)%24; if(d>12)d-=24; B[k]=((a+d*f)%24+24)%24; } else B[k]=a+(c-a)*f; } else if(typeof c==='string'&&c[0]==='#'&&typeof a==='string'&&a[0]==='#')B[k]='#'+ca.set(a).lerp(cb.set(c),f).getHexString(); else B[k]=c; } return B; };
  DN.P=()=>B; DN.E=()=>S[DN.mode]; DN.S=S; DN.D0=D0;
  const fix=()=>{ const P=S[DN.mode]; WX.fix={cloud:P.cld,rain:P.rain||0,snow:0,storm:0,wind:DN.kind[DN.mode]==='night'?.08:.15,dir:1,fog:P.fog||0}; PARK&&PARK.lampLit&&PARK.lampLit(); };
  DN.set=(m,fade)=>{ if(!DN.modes.includes(m)||m===DN.mode)return; T.prev=DN.mode; T.t0=fade?Date.now():0; DN.mode=m; fix(); DN.draw(); };   // the time now (the shared pick, or a test's)
  const tc=new THREE.Color(); DN.U={grade:{value:new THREE.Color(1,1,1)},lift:{value:new THREE.Color(0,0,0)},liftK:{value:0}};
  SYS.add('clockPre',()=>{ const f0=Math.min(1,(Date.now()-T.t0)/DN.FADE), f=f0*f0*(3-2*f0); blend(S[T.prev]||S[DN.mode],S[DN.mode],f); CLOCK.sunQ=false;   // a new look fades in over a minute, its sun moving to its own hour
    if(!CLOCK.run){ CLOCK.sunH=B.h; CLOCK.h=B.h; const m=DN.test?DN.mode:DN.hold||DN.lookFor(DN.clockH()); if(m!==DN.mode)DN.set(m,DN.started); } else CLOCK.sunH=null; },'134b-daynight');
  setTimeout(()=>{ DN.started=1; },5000);   // (from here on a change of look fades)
  DN.INDOOR={sun:[0xffe8c3,4.7],fill:[0xcad5eb,1.8],hemi:[0xaccbfa,0x5b4a35,.09]};
  DN.indoor=()=>SHARED.LVL!=='down'&&!!ROOMS.cur&&!ROOMS.cur.sky&&!(MODS.apts&&(MODS.apts.in||MODS.apts.inReal));
  SYS.add('sky',()=>{ const P=B, up=SHARED.LVL!=='down';
    CLOCK.sun.intensity*=P.sun; CLOCK.sun.color.multiply(tc.set(P.sunc)); if(up){ HEMI.intensity*=P.amb; if(P.ambc)HEMI.color.multiply(tc.set(P.ambc)); } DN.lk=P.lamp;
    { const F=DN.fillL||(DN.fillL=(()=>{ const L=new THREE.DirectionalLight(0xffffff,0); L.castShadow=false; scene.add(L); scene.add(L.target); return L; })()), sv=CLOCK.sunV, nk=Math.max(0,Math.min(1,(3-CLOCK.dayElev())/8)), k=DN.fill??(.38-.3*nk);   // the fill: a soft light from opposite the sun, no shadows, so shade keeps a body's shape and colours (owner, 6 Nov 2026: "the shadows are too dark ... just 1 solid dark color")
      F.color.copy(HEMI.color).lerp(CLOCK.sun.color,.3); F.intensity=up?k*(CLOCK.sun.intensity+HEMI.intensity*.8):0; F.position.set(pos.x-sv.x*100,pos.y+Math.max(.35,Math.abs(sv.y))*100,pos.z-sv.z*100); F.target.position.set(pos.x,pos.y,pos.z); F.target.updateMatrixWorld();
      W3.moon.value=up&&!ROOMS.cur?.32*nk:0; }   // at night the fill falls away and the moon edges every body instead (owner, 9 Nov 2026)
    // a roofed public inside keeps the day's light whatever the hour (owner, 11 Nov 2026): its own lamps were never enough, it was the sun through the roof that lit it; apartments and insides open to the sky keep the real hour
    if(DN.indoor()){ const I=DN.INDOOR, F=DN.fillL; CLOCK.sun.color.setHex(I.sun[0]); CLOCK.sun.intensity=I.sun[1]; F.color.setHex(I.fill[0]); F.intensity=I.fill[1]; HEMI.color.setHex(I.hemi[0]); HEMI.groundColor.setHex(I.hemi[1]); HEMI.intensity=I.hemi[2]; }
    DN.U.grade.value.set(P.grade); DN.U.lift.value.set(P.lift); DN.U.liftK.value=up?P.liftk:0;
    if(SKY.on()){ U.uZ.value.set(P.zen); U.uH.value.set(P.hor); U.uM.value.copy(U.uH.value).lerp(U.uZ.value,.45); { const nk=Math.max(0,Math.min(1,(-4-CLOCK.elev())/6)); U.uS.value.lerp(U.uH.value,nk); U.uA.value.lerp(U.uH.value,nk); }   // no glow along the night's horizon: a clear dark sky (owner, 10 Nov 2026)
      U.uCov.value=P.cov; U.uCL.value=P.cl; U.uCldC.value.set(P.cldc||'#ffffff'); U.uCldK.value=P.cldk||0; U.uBands.value=P.bands; U.uMistK.value*=P.skym;
      U.uStar.value=Math.min(2,U.uStar.value*P.star); U.uMoonK.value=Math.min(1,U.uMoonK.value*P.moon); }
    MISTS.x=CLOCK.sunV.x; MISTS.y=CLOCK.sunV.y; MISTS.z=CLOCK.sunV.z; MISTS.w=up&&MISTE.x&&FAR3.mist?(P.sunk||0)*Math.max(0,Math.min(1,(CLOCK.elev()+2)/6)):0; MISTSC.set(P.sunhz||'#ffffff');
    if(MISTE.x&&FAR3.mist){ MISTE.y=P.m0; MISTE.z=P.m1; const f=FAR3.fog.color.lerp(P.mist?tc.set(P.mist):U.uH.value,P.hz); U.uMistC.value.copy(f); FAR3.FU.uMC.value.copy(f).multiplyScalar(P.farb); if(scene.background&&scene.background.isColor)scene.background.copy(f).multiplyScalar(.5); }
    else if(SKY.on()&&FAR3.FU){ FAR3.FU.uMC.value.copy(U.uH.value); if(FAR3.fog)FAR3.fog.color.copy(U.uH.value); }   // the far city hazes into the look's horizon, as the nearer air does (the sky's own table runs first)
    { const shop=!!(ROOMS.cur&&!ROOMS.cur.off&&STORE.inside&&STORE.inside[ROOMS.cur.id]&&ROOMS.dark()); if(shop!==DN.shop){ DN.shop=shop; VIS.hide(SKY.dome,'room',shop); } if(shop&&scene.background&&scene.background.isColor)scene.background.setRGB(0,0,0); }   // inside a street shop: a black void past its walls
    if(!up){ SKY.dome.visible=false; if(scene.background&&scene.background.isColor)scene.background.setRGB(0,0,0); } },'134b-daynight');
  const box=document.getElementById('adn'), fmt=h=>String(Math.floor(h)).padStart(2,'0')+':'+String(Math.floor(h%1*60)).padStart(2,'0'); let dirty=false;
  DN.dayText=()=>'a new look each half hour, the same for everyone (the clock '+fmt(DN.clockH())+')'+(DN.clk&&DN.clk.stop!=null?' (stopped by the owner)':DN.clk&&Math.abs(DN.clk.off||0)>=60000?' (set by the owner)':'')+(DN.hold?' (held at '+DN.names[DN.hold]+' by the owner)':'');
  const clkShow=()=>{ const e=box&&box.querySelector('#dnclkt'), b=box&&box.querySelector('#dnclkp'); if(e)e.textContent=fmt(DN.clockH())+(DN.clk&&DN.clk.stop!=null?' STOPPED':DN.clk&&Math.abs(DN.clk.off||0)>=60000?' SET':' CENTRAL'); if(b)b.textContent=DN.clk&&DN.clk.stop!=null?'RUN':'PAUSE'; };
  setInterval(()=>{ if(DN.owner&&box&&box.offsetParent)clkShow(); },5000);
  const msg=t=>{ const e=box&&box.querySelector('#dnmsg'); if(e)e.textContent=t; };
  const V=TPANE.live({mode:[()=>DN.hold||'clock',m=>{ '@later'; if(!DN.owner||m===(DN.hold||'clock'))return; DN.hold=m==='clock'?null:m; if(m!=='clock')DN.set(m,true); msg('setting the time...'); DN.pushTime(m).then(()=>msg(m==='clock'?'the clock\'s, for everyone':DN.names[m]+' for everyone, until the clock\'s is picked')).catch(e=>msg('not set: '+(e.message||'try again'))); }],
    ...Object.fromEntries([...new Set(F.map(f=>f[0]))].map(k=>[k,[()=>DN.E()[k]??'#000000',v=>{ const P=DN.E(); if(typeof v==='number')v=+v.toFixed(4); if(P[k]===v)return; P[k]=v; if(k==='cld'||k==='lamp')fix(); dirty=true; msg('not saved'); }]]))});
  let pm=null, pk='', open=true, busy=Promise.resolve();
  const build=async()=>{ '@later'; const m=DN.mode, k=DN.kind[m]==='night'?'n':DN.kind[m]==='dusk'?'u':'d'; if(pm&&pk===m)return pm.refresh(); const p=await TPANE.make(box.querySelector('.dntp'));
    p.addBinding(V,'mode',{label:'THE TIME FOR EVERYONE',options:{"THE CLOCK'S":'clock',...Object.fromEntries(DN.modes.map(x=>[DN.names[x]+' (HELD)',x]))}});
    const fd=p.addFolder({title:DN.names[m]+': ITS DETAILS',expanded:open}); fd.on('fold',e=>{ open=e.expanded; });
    for(const [key,l,a,b,st,w] of F){ const c=a==='c', wh=c?b:w; if(wh&&!wh.includes(k))continue; fd.addBinding(V,key,c?{label:l,view:'color'}:{label:l,min:a,max:b,step:st}); }
    p.addButton({title:'SAVE'}).on('click',()=>{ msg('saving...'); DN.push().then(()=>{ dirty=false; msg('live for everyone'); }).catch(e=>msg('not saved: '+(e.message||'try again'))); });
    p.addButton({title:'RESET'}).on('click',()=>{ S[DN.mode]={...D0[DN.mode]}; fix(); DN.draw(); msg('resetting...'); DN.push().then(()=>{ dirty=false; msg('back to the game\'s own, for everyone'); }).catch(e=>{ dirty=true; msg('not reset on the server: '+(e.message||'try again')); }); });
    p.addButton({title:'EXPORT'}).on('click',()=>{ const o=box.querySelector('#dnout'); o.hidden=false; o.value=DN.names[DN.mode]+' '+JSON.stringify(DN.E()); o.select(); msg('copy this and send it to Claude'); });
    pm=p; pk=m; };
  DN.draw=()=>{ if(!box)return; const m=DN.mode;
    if(!DN.owner){ box.innerHTML=`<h3>THE HOURS</h3><div class="row"><span class="dim" id="dnday">${DN.names[m]}: ${DN.dayText()}</span></div>`; return; }
    if(!box.querySelector('.dntp')){ box.innerHTML='<h3>THE HOURS</h3><div class="dntp"></div><div class="row"><span class="dim" id="dnday">the clock\'s by default (the eight looks in turn, a new one each half hour); hold a look for everyone to edit or keep it (a change fades over a minute)</span><span class="dim" id="dnmsg"></span></div><div class="row" id="dnclk"><b>THE CLOCK</b> <span id="dnclkt"></span> <input id="dnclkh" type="time" style="width:90px"> <button id="dnclkset">SET</button> <button id="dnclkp">PAUSE</button> <button id="dnclkr">REAL TIME</button></div><textarea id="dnout" hidden style="width:100%;height:60px;font:10px monospace"></textarea>'; pm=null;
      const C=box.querySelector('#dnclk'), go=(f,say)=>{ '@later'; const c=f(Date.now(),DN.clk); msg('setting the clock...'); DN.pushClk(c).then(()=>{ DN.clk=c; clkShow(); msg(say()); }).catch(e=>msg('not set: '+(e.message||'try again'))); };
      C.querySelector('#dnclkset').onclick=()=>{ const v=C.querySelector('#dnclkh').value; if(!/^\d\d:\d\d/.test(v))return msg('pick a time first'); const h=+v.slice(0,2)+v.slice(3,5)/60; go((t,c)=>CLK.setHour(t,c,h),()=>'the clock at '+v+' for everyone'); };
      C.querySelector('#dnclkp').onclick=()=>{ const st=DN.clk&&DN.clk.stop!=null; go(st?CLK.resume:CLK.pause,()=>st?'the clock runs on for everyone':'the clock stopped for everyone'); };
      C.querySelector('#dnclkr').onclick=()=>go(CLK.real,()=>'Central time for everyone'); }
    clkShow(); msg(dirty?'not saved':''); if(box.offsetParent)busy=busy.then(build).catch(e=>msg('panel did not load: '+e.message)); };
  if(box)for(const ev of ['keydown','keyup'])box.addEventListener(ev,e=>{ if(e.target.matches('input,textarea'))e.stopPropagation(); });
  setTimeout(()=>{ if(BUGS.owner)BUGS.owner().then(o=>{ DN.owner=!!o; if(o&&box&&box.offsetParent)DN.draw(); }).catch(()=>{}); },3000);   // EXPORT ("send it to Claude") is the owner's
  { const FILE='/shared/looks.json', take=j=>{ if(!j||typeof j!=='object')return; for(const m of DN.modes)if(j[m]&&typeof j[m]==='object')S[m]={...D0[m],...j[m]}; fix(); DN.draw(); };
    const get=()=>fetch(FILE,{credentials:'same-origin'}).then(r=>r.ok&&r.status!==204?r.json():null).then(take).catch(()=>{});
    const TF='/shared/time.json', getT=()=>fetch(TF,{credentials:'same-origin'}).then(r=>r.ok&&r.status!==204?r.json():null).then(j=>{ DN.clk=j&&CLK.ok(j.clk)?j.clk:null; DN.draw(); if(j&&j.hold&&DN.modes.includes(j.now)){ DN.hold=j.now; DN.set(j.now,DN.started); } else DN.hold=null; }).catch(()=>{});   // (a pick from before the clock ran, with no hold, is the clock's now)
    if(!DN.test){ get(); getT(); }
    const putT=o=>fetch(TF,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({now:DN.hold||'clock',hold:DN.hold?1:0,clk:DN.clk,...o})}).then(async r=>{ const o=await r.json().catch(()=>({})); if(!r.ok||!o.ok)throw new Error(o.why||r.status); if(ONLINE.put&&ONLINE.on)ONLINE.put('time',Date.now()); });
    DN.pushTime=m=>putT({now:m,hold:m==='clock'?0:1}); DN.pushClk=c=>putT({clk:c});   // the look held and the clock: one file, each change keeps the other
    DN.diff=()=>{ const o={}; for(const m of DN.modes){ const d={}; for(const k in S[m])if(S[m][k]!==D0[m][k])d[k]=S[m][k]; if(Object.keys(d).length)o[m]=d; } return o; };   // only what differs from the game's own: a reset look leaves the file
    DN.push=()=>fetch(FILE,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(DN.diff())}).then(async r=>{ const o=await r.json().catch(()=>({})); if(!r.ok||!o.ok)throw new Error(o.why||r.status); if(ONLINE.put&&ONLINE.on)ONLINE.put('looks',Date.now()); });
    let lastL=null, lastT=null; SYS.add('world',(k,v)=>{ if(DN.owner||DN.test)return; if(k==='looks'&&v!==lastL){ lastL=v; get(); } if(k==='time'&&v!==lastT){ lastT=v; DN.started=1; getT(); } },'134b-looks'); }
  CLOCK.run=false; blend(S[DN.mode],S[DN.mode],1); fix(); DN.draw(); window.DN=DN; window.CLK=CLK; window.DNDBG=()=>({mode:DN.mode,h:+CLOCK.h.toFixed(2),elev:+CLOCK.elev().toFixed(1),wx:WX.now,lk:DN.lk}); }
