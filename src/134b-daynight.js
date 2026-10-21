const DN={lk:1,mode:'day'};
{ const U=SKY.U, Q=k=>(QS.get(k)??''), D0={day:{h:15.5,sun:1,amb:1,zen:'#3d7ed8',hor:'#cfe2f4',cld:.15,cy:12,cb:1.05,cov:.6,cl:1.25,m0:48,m1:34,hz:.6,lamp:1,star:1,moon:1},
    night:{h:22.5,sun:1.3,amb:1.25,zen:'#04060e',hor:'#141c40',cld:.1,cy:4,cb:.75,cov:.62,cl:.85,m0:34,m1:26,hz:.25,lamp:1.25,star:1.3,moon:1}};
  const F=[['h','SUN HEIGHT (THE HOUR)',7.5,18,.05,'d'],['h','NIGHT HOUR (WHERE THE MOON IS)',19.5,29.5,.05,'n'],['sun','SUNLIGHT',0,2,.01,'d'],['sun','MOONLIGHT',0,3,.01,'n'],['amb','LIGHT ALL ROUND',0,3,.01],
    ['zen','SKY OVERHEAD','c'],['hor','SKY AT THE HORIZON','c'],['cld','CLOUDS (HOW MANY)',0,1,.01],['cy','CLOUD HEIGHT (TILES)',-10,40,.5],['cb','CLOUD BRIGHTNESS',.3,1.6,.01],
    ['cov','HIGH CLOUD COVER (LOWER = MORE)',.2,.9,.01],['cl','HIGH CLOUD BRIGHTNESS',.5,1.6,.01],['m0','MIST STARTS (TILES PAST TOWN)',-10,80,1],['m1','MIST DEPTH (TILES)',4,160,1],['hz','MIST TINTED BY THE SKY',0,1,.01],
    ['lamp','LAMPS',0,3,.01,'n'],['star','STARS',0,2,.01,'n'],['moon','MOON',0,1,.01,'n']];
  const S={}; for(const m of ['day','night']){ S[m]={...D0[m]}; try{ Object.assign(S[m],JSON.parse(SAVE.get('dn-'+m)||'{}')); }catch(e){} }
  try{ const v=SAVE.get('dn'); if(v==='night'||v==='day')DN.mode=v; }catch(e){}
  const qh=+(Q('hour')||NaN); if(!isNaN(qh)){ DN.mode=qh<6||qh>19?'night':'day'; S[DN.mode].h=qh; DN.test=1; }
  DN.P=()=>S[DN.mode]; DN.S=S; DN.D0=D0;
  const fix=()=>{ const P=DN.P(); WX.fix={cloud:P.cld,rain:0,snow:0,storm:0,wind:DN.mode==='night'?.08:.15,dir:1,fog:0}; WX.cy=P.cy*TILE; window.PARK&&PARK.lampLit&&PARK.lampLit(); };
  DN.set=m=>{ DN.mode=m; if(!DN.test)try{ SAVE.set('dn',m); }catch(e){} fix(); DN.draw(); };
  SYS.add('clockPre',()=>{ if(!CLOCK.run)CLOCK.h=((DN.P().h%24)+24)%24; },'134b-daynight');
  SYS.add('world',()=>{ const P=DN.P(), night=DN.mode==='night', up=SHARED.LVL!=='down';
    CLOCK.sun.intensity*=P.sun; if(up)HEMI.intensity*=P.amb; DN.lk=night?P.lamp:1;
    if(WX.clouds){ const M=WX.clouds.material; M.color.multiplyScalar(P.cb); M.emissive.multiplyScalar(P.cb); }
    if(SKY.dome.visible){ U.uZ.value.set(P.zen); U.uH.value.set(P.hor); U.uM.value.copy(U.uH.value).lerp(U.uZ.value,.45); U.uCov.value=P.cov; U.uCL.value=P.cl;
      if(night){ U.uStar.value=Math.min(2,U.uStar.value*P.star); U.uMoonK.value=Math.min(1,U.uMoonK.value*P.moon); } }
    if(MISTE.x&&FAR3.mist){ MISTE.y=P.m0; MISTE.z=P.m1; const f=FAR3.fog.color.lerp(U.uH.value,P.hz); U.uMistC.value.copy(f); FAR3.FU.uMC.value.copy(f).multiplyScalar(.62); if(scene.background&&scene.background.isColor)scene.background.copy(f).multiplyScalar(.5); }
    if(!up){ SKY.dome.visible=false; if(scene.background&&scene.background.isColor)scene.background.setRGB(0,0,0); } },'134b-daynight');
  const box=document.getElementById('adn'), fl=v=>(+v).toFixed(2); let dirty=false;
  DN.draw=()=>{ if(!box)return; const m=DN.mode, P=S[m], k=m==='night'?'n':'d';
    box.innerHTML=`<h3>DAY OR NIGHT</h3><div class="row" id="dnm"><button class="btn" data-dn="day" aria-pressed="${m==='day'}">DAY</button><button class="btn" data-dn="night" aria-pressed="${m==='night'}">NIGHT</button><span class="dim">N switches them</span></div>
      <h3>${m==='night'?'NIGHT':'DAY'}: ITS LOOK</h3>`+F.filter(f=>!f[5]||f[5]===k).map(([key,l,a,b,st])=>a==='c'?`<div class="row"><span style="width:230px">${l}</span><input type="color" data-k="${key}" value="${P[key]}"></div>`
        :`<div class="row"><span style="width:230px">${l}</span><input type="range" data-k="${key}" min="${a}" max="${b}" step="${st}" value="${P[key]}" style="flex:1"><span style="width:44px;text-align:right">${fl(P[key])}</span></div>`).join('')
      +`<div class="row"><button class="btn" id="dnsave">SAVE</button><button class="btn" id="dnreset">RESET</button><button class="btn" id="dnexp">EXPORT</button><span class="dim" id="dnmsg">${dirty?'not saved':''}</span></div><textarea id="dnout" hidden style="width:100%;height:60px;font:10px monospace"></textarea>`; };
  if(box){ for(const ev of ['keydown','keyup'])box.addEventListener(ev,e=>{ if(e.target.matches('input,textarea'))e.stopPropagation(); });
    box.addEventListener('input',e=>{ '@later'; const k=e.target.dataset.k; if(!k)return; const P=DN.P(); P[k]=e.target.type==='color'?e.target.value:+e.target.value; if(e.target.type==='range')e.target.nextElementSibling.textContent=fl(P[k]); if(k==='cld'||k==='cy'||k==='lamp')fix(); dirty=true; box.querySelector('#dnmsg').textContent='not saved'; });
    box.addEventListener('click',e=>{ '@later'; const t=e.target, m=t.dataset.dn, msg=()=>box.querySelector('#dnmsg');
      if(m)DN.set(m);
      if(t.id==='dnsave'){ SAVE.set('dn-'+DN.mode,JSON.stringify(DN.P())); dirty=false; msg().textContent='saved'; }
      if(t.id==='dnreset'){ S[DN.mode]={...D0[DN.mode]}; SAVE.del('dn-'+DN.mode); dirty=false; fix(); DN.draw(); msg().textContent='back to the game\'s own'; }
      if(t.id==='dnexp'){ const o=box.querySelector('#dnout'); o.hidden=false; o.value=(DN.mode==='night'?'NIGHT ':'DAY ')+JSON.stringify(DN.P()); o.select(); msg().textContent='copy this and send it to Claude'; } }); }
  addEventListener('keydown',e=>{ if(e.key.toLowerCase()==='n'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||''))DN.set(DN.mode==='night'?'day':'night'); });
  CLOCK.run=false; fix(); DN.draw(); window.DN=DN; window.DNDBG=()=>({mode:DN.mode,h:CLOCK.h,elev:+CLOCK.elev().toFixed(1),wx:WX.now,lk:DN.lk}); }
