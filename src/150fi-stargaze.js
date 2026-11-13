// LOOKING UP: in first person at night the star, planet, Moon or satellite at the centre of your view is named; STARGAZE (an emote) lies you back under the sky: the constellations draw themselves as you find them (each goes in the logbook), a star chart, tonight's sky, and the shooting stars, satellites, northern lights and eclipses you catch count for the logbook and tonight's firsts. Drawn on one 2D canvas, only while you look up.
import {SHARED, THREE} from './003-shx.js';
import {MOTION, SKY, st, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS} from './006-map-pre.js';
import {EPH} from './134bb-ephem.js';
import {SKYSHOW} from './134bc-skyshow.js';
import {FIRSTS} from './150fcz-firsts.js';
import {ASTRO} from './150fh-astro.js';
const GAZE={on:false,chart:false,names:true,cur:null}; window.GAZE=GAZE;
{ const CAT=__LAZY__("data/stars.json"), D2R=Math.PI/180, cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), V=()=>new THREE.Vector3();
  const MORE=[['THE PLEIADES (M45)',56.75,24.12,1.6,'A CLUSTER OF YOUNG STARS'],['THE ANDROMEDA GALAXY (M31)',10.68,41.27,3.4,'A GALAXY, 2.5 MILLION LIGHT-YEARS AWAY'],['THE ORION NEBULA (M42)',83.82,-5.39,4,'A CLOUD WHERE STARS ARE BORN']];
  let S=null, asked=false, CON=[], PTS=[];
  const cat=()=>{ if(asked)return; asked=true; CAT().then(J=>{ const eq=(ra,de)=>[Math.cos(de*D2R)*Math.cos(ra*D2R),Math.cos(de*D2R)*Math.sin(ra*D2R),Math.sin(de*D2R)];
      for(const k in J.lines){ let x=0,y=0,z=0; for(const [a,b] of J.lines[k]){ const e=eq(a,b); x+=e[0]; y+=e[1]; z+=e[2]; } const l=Math.hypot(x,y,z)||1, dec=Math.asin(z/l)/D2R; CON.push({k,name:J.names[k]||k,ra:Math.atan2(y,x)/D2R,dec,L:J.lines[k],v:V(),up:dec>EPH.LAT-90+12}); }
      ASTRO.conN=CON.filter(c=>c.up).length;
      PTS=J.named.map(n=>({name:n[2],ra:n[0],dec:n[1],sub:'A STAR',v:V()})).concat(MORE.map(m=>({name:m[0],ra:m[1],dec:m[2],sub:m[4],v:V()}))); S=J; }).catch(()=>{ asked=false; }); };

  /* ---------- the page: one canvas over the game for the lines and names, a small panel while stargazing ---------- */
  const cv=document.createElement('canvas'); cv.id='gazec'; cv.hidden=true; cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:6;pointer-events:none'; document.body.appendChild(cv); const g=cv.getContext('2d');
  const P=document.createElement('div'); P.id='gazev'; P.className='ml'; P.hidden=true; P.style.cssText='position:fixed;right:12px;top:56px;width:min(250px,44vw);max-height:calc(100vh - 72px);overflow:auto;z-index:21;padding:10px 12px;box-sizing:border-box;background:#0b0d13;zoom:var(--uiz,1)'; document.body.appendChild(P);
  { const c=document.createElement('style'); c.textContent='#gazev .row{margin:8px 0} #gazev .row>b{display:block;margin-bottom:4px} #gazev .info{line-height:1.5}'; document.head.appendChild(c); }
  const panel=()=>{ P.innerHTML=`<div><b>STARGAZING</b></div>
      <div class="row"><button data-a="done">GET UP</button><button data-a="chart" aria-pressed="${GAZE.chart}">${GAZE.chart?'■':'□'} STAR CHART</button><button data-a="names" aria-pressed="${GAZE.names}">${GAZE.names?'■':'□'} NAMES</button></div>
      <div class="row info"><b>CONSTELLATIONS ${ASTRO.count('con')} / ${ASTRO.conN||0}</b>LOOK AT ONE UNTIL ITS LINES DRAW: IT GOES IN YOUR LOGBOOK.</div>
      <div class="row info"><b>TONIGHT'S SKY</b>${ASTRO.tonightHtml(false)}</div>
      <div class="row info"><b>LOGBOOK GOALS</b>${ASTRO.goalsHtml()}</div>`; };
  P.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; const a=b.dataset.a; if(a==='done')return GAZE.stop(); if(a==='chart')GAZE.chart=!GAZE.chart; if(a==='names')GAZE.names=!GAZE.names; panel(); });

  /* ---------- lying back: the SLEEP move on the grass, the view up; walking, Esc or GET UP ends it ---------- */
  let keep=null, t0=0;
  GAZE.start=async()=>{ if(GAZE.on)return true; if(!SKY.on()){ SAY('YOU NEED OPEN SKY OVER YOU TO STARGAZE.','#c8a090'); return false; } if(st.sit||st.ride||st.climb||st.hang||st.water&&st.water.in||SHARED.drive){ SAY('NOT FROM HERE.','#c8a090'); return false; }
    cat(); keep={view:UI.view,pitch:SHARED.pitchTo}; GAZE.on=true; t0=performance.now(); SKYSHOW.want=true; UI.upMax=1.5; UI.setView('first'); SHARED.pitchTo=SHARED.pitch=-1.2;
    MOTION.play('sleep',{loop:true}); panel(); P.hidden=false; if((SKYSHOW.look||0)<.3)SAY('YOU LIE BACK. THE STARS COME OUT AFTER DARK.','#c8e0ff'); else SAY('YOU LIE BACK UNDER THE STARS. LOOK AROUND; WALK TO GET UP.','#c8e0ff'); return true; };
  GAZE.stop=()=>{ if(!GAZE.on)return; GAZE.on=false; P.hidden=true; UI.upMax=0; if(MOTION.cur==='sleep')MOTION.stop(); if(keep){ UI.setView(keep.view); SHARED.pitchTo=UI.clampV(keep.pitch); } keep=null; };
  GAZE.dbg=()=>({con:CON.map(c=>({k:c.k,name:c.name,ra:c.ra,dec:c.dec,up:c.up})),pts:PTS.length,hold:hold.t,conHold:conHold.t});
  MOTION.special=MOTION.special||{}; MOTION.special.stargaze=()=>GAZE.start();
  addEventListener('keydown',e=>{ if(GAZE.on&&e.key==='Escape'){ GAZE.stop(); e.stopPropagation(); } },true);

  /* ---------- one look: what is at the centre, the lines, the names ---------- */
  const f=V(), tp=V(), tq=V(); let W=0, H=0, cam=null, hold={id:'',t:0}, conHold={k:'',t:0}, satT=0, last=performance.now(), drawn=false, pT=0;
  const proj=(v,o)=>{ o.copy(v).multiplyScalar(400).add(cam.position).project(cam); if(o.z>1||Math.abs(o.x)>1.15||Math.abs(o.y)>1.15)return false; o.x=(o.x+1)/2*W; o.y=(1-o.y)/2*H; return true; };
  const text=(s,x,y,a,col='200,225,255')=>{ g.fillStyle=`rgba(4,8,16,${.55*a})`; g.fillText(s,x+1,y+1); g.fillStyle=`rgba(${col},${a})`; g.fillText(s,x,y); };
  const logMove=(cat,name,tier,first)=>{ if(ASTRO.log(cat+':'+name,{g:'move',tier,name,cat}))panel(); if(first)FIRSTS.mark(first); };
  SYS.add('places',()=>{ const n=performance.now(), dt=Math.min(.1,(n-last)/1000); last=n; cam=SHARED.cam;
    if(GAZE.on&&n-t0>1500&&(MOTION.cur!=='sleep'||!SKY.on()||UI.view!=='first'||P.hidden))GAZE.stop();   // (walked off, went in, changed the view, or closed the window)
    const night=SKY.on()&&(SKYSHOW.look||0)>.3, act=cam&&UI.view==='first'&&!UI.menuOpen&&(GAZE.on||night&&-cam.matrixWorld.elements[9]>.2);
    if(!act||!night){ if(drawn){ drawn=false; cv.hidden=true; } GAZE.cur=null; return; }
    cat(); const w=innerWidth, h=innerHeight; if(w!==W||h!==H||cv.hidden){ W=w; H=h; cv.width=w; cv.height=h; cv.hidden=false; } drawn=true; g.clearRect(0,0,W,H); g.font='10px Silkscreen,monospace'; g.textAlign='center';
    cam.getWorldDirection(f); const tol=Math.cos((GAZE.on?3:2.2)*D2R*Math.max(.35,cam.fov/60));
    // the nearest named thing to the centre: the planets, the Moon and a satellite first, then the bright stars
    let best=null, bd=tol; for(const t of SKYSHOW.things){ if(!t.seen)continue; const d=f.dot(t.v); if(d>bd){ bd=d; best={id:t.id,name:t.name,v:t.v,sub:t.kind==='planet'?'A PLANET · MAG '+t.mag.toFixed(1)+' · '+Math.round(t.alt)+'° UP':t.kind==='moon'?t.lit+'% LIT · '+Math.round(t.alt)+'° UP':'A SATELLITE, LIT BY THE SUN · MAG '+t.mag.toFixed(1),t}; } }
    if(S)for(const p of PTS){ SKYSHOW.eq(p.ra,p.dec,p.v); if(p.v.y<.02)continue; const d=f.dot(p.v); if(d>bd){ bd=d; best={id:'p:'+p.name,name:p.name,v:p.v,sub:p.sub}; } }
    if(best&&best.id===hold.id)hold.t+=dt; else hold={id:best?best.id:'',t:0}; GAZE.cur=best&&hold.t>.25?best.name:null;
    // the constellations: while stargazing, the one you look at draws itself and is learned; the chart shows them all
    if(S&&GAZE.on){ let nk=null, nd=Math.cos(11*D2R); g.lineWidth=1;
      for(const c of CON){ SKYSHOW.eq(c.ra,c.dec,c.v); const d=f.dot(c.v); if(d<.3)continue; const known=ASTRO.has('con:'+c.k); if(d>nd&&c.v.y>.08){ nd=d; nk=c; }
        const a=Math.max(GAZE.chart?.3:0,known?.3:0,c===conHold.c?cl(conHold.t/2.5)*.7:0); if(a<=.01)continue;
        g.strokeStyle=`rgba(130,180,255,${a})`; g.beginPath(); for(const [r1,d1,r2,d2] of c.L){ SKYSHOW.eq(r1,d1,tp); SKYSHOW.eq(r2,d2,tq); if(tp.y<0&&tq.y<0)continue; const A=proj(tp,tp), B=proj(tq,tq); if(A&&B){ g.moveTo(tp.x,tp.y); g.lineTo(tq.x,tq.y); } } g.stroke();
        if(GAZE.names&&c.v.y>0&&proj(c.v,tp))text(c.name,tp.x,tp.y,Math.min(1,a*2.2),'150,190,255'); }
      if(nk&&nk===conHold.c)conHold.t+=dt; else conHold={c:nk,t:0};
      if(nk&&conHold.t>2.5&&!ASTRO.has('con:'+nk.k)){ ASTRO.log('con:'+nk.k,{g:'con',tier:'c',name:nk.name}); panel(); }
      // the horizon's compass
      for(const [s,az] of [['N',0],['E',90],['S',180],['W',270]]){ SKYSHOW.dir(4,az,tp); if(proj(tp,tp))text(s,tp.x,tp.y,.7,'255,224,138'); }
      if((pT-=dt)<=0){ pT=30; panel(); } }
    // the name at the centre
    if(best&&hold.t>.25&&proj(best.v,tp)){ const a=cl((hold.t-.25)/.4); g.strokeStyle=`rgba(200,225,255,${.7*a})`; g.lineWidth=1; g.beginPath(); g.arc(tp.x,tp.y,9,0,7); g.stroke(); text(best.name,tp.x,tp.y+24,a,'255,255,255'); text(best.sub,tp.x,tp.y+37,a*.85);
      if(!GAZE.on&&hold.t>2)text('EMOTES (H) · STARGAZE TO LIE BACK AND LEARN THE SKY',tp.x,tp.y+54,a*.6,'125,255,168'); }
    // what you catch with your own eyes
    for(const m of SKYSHOW.mets)if(m.head&&!m.seen&&m.t>m.T*.3&&f.dot(m.head)>Math.cos(cam.fov*.6*D2R)){ m.seen=1; logMove('meteor',m.nm==='SPORADIC'?'A SHOOTING STAR':'A '+m.nm.replace(/S$/,'')+' METEOR','s','meteor'); }
    if(best&&best.t&&best.t.kind==='sat'){ if((satT+=dt)>1.5)logMove('sat',best.name,/ISS/.test(best.name)?'s':'r',/ISS/.test(best.name)?'iss':'sat'); } else satT=0;
    if(SKYSHOW.aurora&&f.z>.5&&f.y<.75)logMove('aurora','THE NORTHERN LIGHTS','s','aurora');
    if(SKYSHOW.eclipse&&SKYSHOW.eclipse.mag>0&&best&&best.id==='moon'&&hold.t>1.5)logMove('eclipse',SKYSHOW.eclipse.mag>=1?'A TOTAL LUNAR ECLIPSE':'A PARTIAL LUNAR ECLIPSE','s','eclipse'); },'150fi-stargaze');
}
