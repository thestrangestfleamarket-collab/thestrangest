// THE WEATHER: WX makes the day's weather (how cloudy, rain, snow, mist and wind) from the date and hour.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, PARK, pos, WX} from './003b-systems.js';
import {scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {OUT, QS, SYS, TILE} from './006-map-pre.js';
import {HEMI} from './064-map-post.js';
import {TPANE} from './087dz-tpane.js';
Object.assign(WX,{hold:null,now:null});
{ const hsh=(i,s)=>{ let h=(Math.imul(i|0,374761393)+Math.imul(s|0,668265263))|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
  const noise=(t,s,oct=2)=>{ let v=0,a=1,n=0; for(let o=0;o<oct;o++){ const i=Math.floor(t), f=t-i, u=f*f*(3-2*f); v+=a*(hsh(i,s+o*7)*(1-u)+hsh(i+1,s+o*7)*u); n+=a; a*=.5; t=t*2.1+11.7; } return v/n; };
  const cl=v=>Math.max(0,Math.min(1,v)), st=(n,k)=>cl((n-.5)*k+.5);
  const T=()=>Math.floor(Date.now()/86400000)*1440+CLOCK.h*60;
  WX.at=T=>{ '@later'; const h=(T%1440+1440)%1440/60, dew=t=>{ const hh=(t%1440+1440)%1440/60; return hh<7||hh>21?.12:hh<10?.12*(10-hh)/3:hh>18?.12*(hh-18)/3:0; };
    const pres=t=>st(noise(t/2600,11,3),1.6), moist=t=>cl(st(noise(t/1900,23,3),1.6)*.85+dew(t)), p=pres(T), dp=(pres(T+60)-pres(T-60))*8;
    const cloudAt=t=>cl(moist(t)*1.4-pres(t)*1.0+st(noise(t/400,37,2),1.2)*.45-.12), cloud=(cloudAt(T-30)+cloudAt(T-60)+cloudAt(T-90))/3;
    const rainAt=t=>cl((cloudAt(t)-.7)*3.5)*cl((moist(t)-.5)*3), fall=rainAt(T-15), storm=fall>.5&&p<.22?cl((.22-p)*6*fall):0;
    const cold=CLOCK.seasonOf(Math.floor(T/1440))==='winter'||st(noise(T/4300,71,2),1.6)<.12;
    const wind=cl(Math.abs(dp)*.9+st(noise(T/700,47,2),1.3)*.5-.2+noise(T/9,53,3)*.25*Math.abs(dp)+storm*.3), dir=noise(T/3000,41,2)*Math.PI*2;
    const night=h<6||h>20?1:h<8?(8-h)/2:h>18?(h-18)/2:0, fog=cl((moist(T)-.6)*3.5)*cl(1-wind*1.6)*(.3+.7*night)*(1-fall);
    return {cloud,rain:cold?0:fall,snow:cold?fall:0,storm,wind,dir,fog,flash:storm>0&&hsh(Math.floor(T*10/7),61)<storm*.15,cold}; };
  // the forecast (4 Nov 2026, from Nevaland): the weather is a function of the minute, so what comes is read ahead; WX.kind names a weather, WX.tempC its temperature, WX.forecast() {now:{kind,temp}, next:{kind,inMin}|null, held} (next: the first different kind in the six hours ahead; none while the look holds the weather)
  WX.kind=w=>w.storm>.3?'STORM':w.snow>.15?'SNOW':w.rain>.15?'RAIN':w.fog>.3?'FOG':w.cloud>.6?'CLOUDY':'CLEAR';
  WX.tempC=(T,w)=>{ const h=(T%1440+1440)%1440/60, S=CLOCK.SEASONS[CLOCK.seasonOf(Math.floor(T/1440))]; w=w||WX.at(T); return Math.round(S.temp+5*Math.cos((h-15)/24*Math.PI*2)-6*w.cloud-4*(w.rain>.05?1:0)-(w.cold?8:0)); };
  let fc=null, fcAt=-1; WX.forecast=()=>{ const t=T(); if(fc&&Math.abs(t-fcAt)<1&&fc.held===!!(WX.hold||WX.fix&&!WX.nat))return fc; fcAt=t; const held=!!(WX.hold||WX.fix&&!WX.nat), W=WX.now||WX.at(t), k=WX.kind(W); let next=null;
    if(!held)for(let m=30;m<=360;m+=30){ const w=WX.at(t+m), kk=WX.kind(w); if(kk!==k){ next={kind:kk,inMin:m}; break; } } return fc={now:{kind:k,temp:WX.tempC(t,held?{...W,cold:CLOCK.season()==='winter'}:W)},next,held}; };
  const HOLDS={CLEAR:{cloud:.08,rain:0,snow:0,storm:0,wind:.15,dir:1,fog:0},CLOUDY:{cloud:.85,rain:0,snow:0,storm:0,wind:.35,dir:1,fog:0},RAIN:{cloud:.95,rain:.7,snow:0,storm:0,wind:.4,dir:1,fog:0},
    STORM:{cloud:1,rain:1,snow:0,storm:.8,wind:.9,dir:1,fog:0},SNOW:{cloud:.9,rain:0,snow:.7,storm:0,wind:.2,dir:1,fog:0},FOG:{cloud:.6,rain:0,snow:0,storm:0,wind:0,dir:1,fog:.7}};
  { const q=(QS.get('wx')||'').toUpperCase(); if(q==='NATURAL')WX.nat=1; else if(HOLDS[q])WX.hold=q; }
  const NR=1800, RB=16*TILE, RH=14*TILE, rp=new Float32Array(NR*6), rs=new Float32Array(NR*3); for(let i=0;i<NR;i++){ rs[i*3]=(Math.random()-.5)*2*RB; rs[i*3+1]=Math.random()*RH; rs[i*3+2]=(Math.random()-.5)*2*RB; }
  const rg=new THREE.BufferGeometry(); rg.setAttribute('position',new THREE.BufferAttribute(rp,3).setUsage(THREE.DynamicDrawUsage));
  const RAIN=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0xaec4e0,transparent:true,opacity:.55,depthWrite:false})); RAIN.frustumCulled=false; scene.add(RAIN);
  const NS=1400, sp=new Float32Array(NS*3), ss=new Float32Array(NS*4); for(let i=0;i<NS;i++){ ss[i*4]=(Math.random()-.5)*2*RB; ss[i*4+1]=Math.random()*RH; ss[i*4+2]=(Math.random()-.5)*2*RB; ss[i*4+3]=Math.random()*6.28; }
  const sg=new THREE.BufferGeometry(); sg.setAttribute('position',new THREE.BufferAttribute(sp,3).setUsage(THREE.DynamicDrawUsage));
  const SNOW=new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:2,sizeAttenuation:false})); SNOW.frustumCulled=false; scene.add(SNOW);
  const FOG=new THREE.Fog(0x9aa3ad,2,200), cA=new THREE.Color(), cB=new THREE.Color(); let flashT=0, ft=0;
  SYS.add('sky',(dt)=>{
    if((ft-=dt)<=0){ ft=.5; WX.now=WX.hold?Object.assign({flash:(WX.hold==='STORM'||WX.flashK>0)&&Math.random()<(WX.flashK||.04)},HOLDS[WX.hold]):WX.fix&&!WX.nat?{...WX.fix,flash:false}:WX.at(T()); }
    const W=WX.now, up=SHARED.LVL!=='down', inside=!OUT.open, day=cl((CLOCK.elev()+4)/14), t=performance.now()/1000;
    if(up){ scene.background.lerp(cA.setRGB(.55,.58,.62).multiplyScalar(.25+.75*day),cl(W.cloud*W.cloud*.85)); if(W.storm)scene.background.multiplyScalar(1-.45*W.storm);
      CLOCK.sun.intensity*=1-.72*cl((W.cloud-.2)/.8); }
    if(W.flash&&flashT<=0)flashT=.14; if(flashT>0){ flashT-=dt; if(up){ const f=WX.hold==='RAIN'?.3:1; scene.background.lerp(cA.setRGB(.85,.88,.95),f); HEMI.intensity+=2.5*f; } }
    if(PARK.windK)PARK.windK.value=.25+W.wind;
    if(up&&!inside&&W.fog>.02){ scene.fog=FOG; FOG.color.setRGB(.7,.72,.74).multiplyScalar(.15+.85*day).lerp(scene.background,.25); FOG.near=2*TILE; FOG.far=(11+70*Math.pow(1-W.fog,2))*TILE; scene.background.lerp(FOG.color,cl(W.fog*1.3)); } else if(scene.fog===FOG)scene.fog=null;
    const wx=Math.cos(W.dir)*W.wind*5*TILE, wz=Math.sin(W.dir)*W.wind*5*TILE;
    const nr=inside?0:Math.round(NR*W.rain); RAIN.visible=nr>0; if(nr){ const v=14*TILE, L=.45*TILE, sx=wx/v*L, sz=wz/v*L; for(let i=0;i<nr;i++){ let y=rs[i*3+1]-v*dt; if(y<0)y+=RH; rs[i*3+1]=y;
        const x=((rs[i*3]+wx*t/4)%(2*RB)+3*RB)%(2*RB)-RB+pos.x, z=((rs[i*3+2]+wz*t/4)%(2*RB)+3*RB)%(2*RB)-RB+pos.z, gy=SHARED.py+y; rp.set([x,gy,z,x-sx,gy+L,z-sz],i*6); }
      rg.setDrawRange(0,nr*2); rg.attributes.position.needsUpdate=true; RAIN.material.opacity=.4+.25*day; }
    const ns=inside?0:Math.round(NS*W.snow); SNOW.visible=ns>0; if(ns){ for(let i=0;i<ns;i++){ let y=ss[i*4+1]-1.1*TILE*dt; if(y<0)y+=RH; ss[i*4+1]=y; const a=ss[i*4+3]+t*.8;
        const x=((ss[i*4]+wx*t/3+Math.sin(a)*.4*TILE)%(2*RB)+3*RB)%(2*RB)-RB+pos.x, z=((ss[i*4+2]+wz*t/3+Math.cos(a*.7)*.4*TILE)%(2*RB)+3*RB)%(2*RB)-RB+pos.z; sp.set([x,SHARED.py+y,z],i*3); }
      sg.setDrawRange(0,ns); sg.attributes.position.needsUpdate=true; } },'131-weather');
  { const box=document.getElementById('awx'), P=box&&box.closest('[data-p]'); if(box){ const L={'AS THE LOOK':'LOOK',NATURAL:'NATURAL',...Object.fromEntries(Object.keys(HOLDS).map(k=>[k,k]))}, cur=()=>WX.hold||(WX.nat?'NATURAL':'LOOK');
      const SS={'AS THE DATE':'',SPRING:'spring',SUMMER:'summer',AUTUMN:'autumn',WINTER:'winter'}; CLOCK.seasonPick=QS.get('season')||SAVE.get('season')||'';
      const V=TPANE.live({wx:[cur,k=>{ if(k===cur())return; WX.hold=HOLDS[k]?k:null; WX.nat=k==='NATURAL'?1:0; ft=0; }],season:[()=>CLOCK.seasonPick,k=>{ CLOCK.seasonPick=k; SAVE.set('season',k); fc=null; }]}); let mk=null;
      const draw=()=>{ mk=mk||TPANE.make(box).then(p=>{ p.addBinding(V,'wx',{label:'WEATHER',options:L}); p.addBinding(V,'season',{label:'SEASON',options:SS}); return p; }).catch(e=>{ mk=null; throw e; }); return mk.then(p=>p.refresh()).catch(()=>{}); };
      for(const ev of ['keydown','keyup'])box.addEventListener(ev,e=>{ if(e.target.matches('input,textarea'))e.stopPropagation(); });
      new MutationObserver(()=>{ if(!P.hidden&&P.offsetParent)draw(); }).observe(P,{attributes:true,attributeFilter:['hidden']}); } }
  window.WX=WX; window.WXDBG=()=>WX.now; }
