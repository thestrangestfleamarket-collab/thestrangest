// THE LIVE SKY IN THE TELESCOPE: New York's real clouds (Open-Meteo), the satellites passing over (CelesTrak orbits, satellite.js), this week's comets and asteroids (JPL), meteor showers at their real rates, today's Sun (NASA SDO) with its sunspot groups and flares, and the northern lights when NOAA's Kp is high enough; fetched only when the eyepiece opens.
import {WX} from './003b-systems.js';
import {FIRSTS} from './150fcz-firsts.js';
import {SCOPE} from './150fd-scope.js';
const SKYL={on:false,data:{},err:{}}; window.SKYL=SKYL;
{ const SBDB='https://ssd-api.jpl.nasa.gov/sbdb_query.api?', SWPC='https://services.swpc.noaa.gov/', NOWJD=()=>Date.now()/864e5+2440587.5;
  const UP={weather:()=>'https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006&hourly=cloud_cover,visibility,precipitation,snowfall&past_days=1&forecast_days=2&timezone=UTC',
    sats:()=>['https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle','https://celestrak.org/NORAD/elements/gp.php?GROUP=visual&FORMAT=tle'],
    comets:()=>{ const j=Math.round(NOWJD()); return SBDB+new URLSearchParams({fields:'full_name,e,q,i,om,w,tp,M1,K1','sb-kind':'c','sb-cdata':JSON.stringify({AND:['tp|RG|'+(j-400)+'|'+(j+400),'M1|LT|11','q|LT|3.5']})}); },
    rocks:()=>SBDB+new URLSearchParams({fields:'full_name,a,e,i,om,w,ma,epoch,H,G','sb-kind':'a','sb-cdata':JSON.stringify({AND:['H|LT|6.5']})}),
    sun:()=>'https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_HMIIC.jpg', spots:()=>SWPC+'json/solar_regions.json', flares:()=>SWPC+'json/goes/primary/xray-flares-7-day.json',
    kp:()=>[SWPC+'products/noaa-planetary-k-index.json',SWPC+'products/noaa-planetary-k-index-forecast.json']};
  const file=()=>location.protocol==='file:';
  SKYL.url=k=>file()?UP[k]():'/sky/'+k+(k==='sun'?'.jpg':'');
  const get=async k=>{ const u=file()?[].concat(UP[k]()):['/sky/'+k], rs=await Promise.all(u.map(x=>fetch(x))); if(!rs.every(r=>r.ok))throw new Error(k+' '+rs.map(r=>r.status));
    if(k==='sats')return (await Promise.all(rs.map(r=>r.text()))).join('\n'); if(k==='kp'&&u.length>1)return Promise.all(rs.map(r=>r.json())); return rs[0].json(); };
  const SATJS='https://cdn.jsdelivr.net/npm/satellite.js@6.0.2/+esm';
  let L=null;
  const make=()=>{ '@scope';
    const D2R=Math.PI/180, R2D=180/Math.PI, A=SCOPE.astro, cl=(v,a,b)=>Math.max(a,Math.min(b,v)), sn=x=>Math.sin(x*D2R), cs=x=>Math.cos(x*D2R), nrm=x=>((x%360)+360)%360;
    const msOf=jd=>(jd-2440587.5)*864e5, hz=(alt,az)=>[cs(alt)*sn(az),sn(alt),cs(alt)*cs(az)], esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const hhmm=jd=>{ const d=new Date(msOf(jd)-A.tz(new Date(msOf(jd)))*36e5); return String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0'); };
    const D=SKYL.data; let at=0, redraw=0;
    const load=()=>{ if(Date.now()-at<20*60e3)return; at=Date.now(); for(const k of ['weather','sats','comets','rocks','spots','flares','kp'])get(k).then(v=>{ D[k]=v; delete SKYL.err[k]; parse(k); redraw=1; }).catch(e=>{ SKYL.err[k]=String(e&&e.message||e); });
      const im=new Image(); im.onload=()=>{ SCOPE.files.sun=im.src; A.BODY.sun.fill=.9375; if(SCOPE.view)SCOPE.view.drop('sun'); SKYL.sunLive=true; redraw=1; }; im.onerror=()=>{ SKYL.err.sun='no picture'; }; im.src=SKYL.url('sun'); };   // the SDO picture's disc spans 93.75% of its frame
    const parse=k=>{ if(k==='sats')sats.parse(D.sats); if(k==='comets'||k==='rocks')smalls(); };

    /* ---------- the weather over New York, hour by hour ---------- */
    const wxRow=jd=>{ const H=D.weather&&D.weather.hourly; if(!H||!H.time)return null; const t=msOf(jd), t0=Date.parse(H.time[0]+'Z'), i=Math.floor((t-t0)/36e5); if(i<0||i>=H.time.length)return null;
      return {i,cloud:(H.cloud_cover[i]??0)/100,vis:(H.visibility?H.visibility[i]:24000)??24000,pr:(H.precipitation?H.precipitation[i]:0)||0,sn:(H.snowfall?H.snowfall[i]:0)||0}; };
    const wx=jd=>{ const q=wxRow(jd); if(!q)return null; const G=WX.now||{}; return {cloud:q.cloud,rain:q.sn>0?0:cl(q.pr/2,0,1),snow:cl(q.sn,0,1),fog:cl(1-q.vis/1500,0,1),wind:G.wind||.2}; };
    SCOPE.wx=wx;
    const skyBlock=()=>{ const jd=SCOPE.jd(), q=wxRow(jd); if(!q)return SKYL.err.weather?'':`<div class="row info"><b>THE SKY TONIGHT</b>ASKING THE WEATHER…</div>`;
      let clear=null; for(let h=0;h<=12;h++){ const r=wxRow(jd+h/24); if(r&&r.cloud<.25){ clear=h; break; } }
      const tr=q.vis>20000&&q.cloud<.3?'GOOD':q.vis>10000&&q.cloud<.6?'FAIR':'POOR';
      return `<div class="row info"><b>THE SKY TONIGHT</b>CLOUD ${Math.round(q.cloud*100)}%${q.pr>0?' · '+(q.sn>0?'SNOW':'RAIN'):''}<br>${clear===0?'CLEAR NOW':clear?'CLEARING BY '+hhmm(Math.floor((jd+clear/24)*24)/24):'CLOUDY ALL NIGHT'} · TRANSPARENCY ${tr}<br><span style="opacity:.7">OPEN-METEO, NEW YORK</span></div>`; };

    /* ---------- satellites: each propagated from its orbit (SGP4), lit by the Sun or in the Earth's shadow ---------- */
    const STD={25544:-1.8,48274:-.5,20580:2.2}, NAMES={25544:'THE ISS',48274:'TIANGONG',20580:'THE HUBBLE TELESCOPE'};
    const sats={list:[],lib:null,pass:null,
      parse(t){ const seen=new Set(), vis=new Set(), L=String(t||'').split(/\r?\n/).map(s=>s.trimEnd()), out=[]; let inVis=false;
        for(let i=0;i+2<L.length;i++){ if(!L[i+1].startsWith('1 ')||!L[i+2].startsWith('2 '))continue; const n=+L[i+1].slice(2,7), nm=L[i].trim(); i+=2; if(seen.has(n))continue; seen.add(n); out.push({n,name:NAMES[n]||nm.toUpperCase(),l1:L[i-1],l2:L[i],std:STD[n]??(/R\/B/.test(nm)?2.5:3.5),rec:null}); }
        this.list=out; this.pass=null; this.init(); },
      async init(){ if(!this.lib){ try{ this.lib=await import(SATJS); }catch(e){ SKYL.err.satjs=String(e.message||e); return; } } const S=this.lib;
        for(const s of this.list)if(!s.rec){ try{ s.rec=S.twoline2satrec(s.l1,s.l2); }catch(e){ s.bad=1; } } this.ready=true; redraw=1; },
      // where a satellite is seen from New York at a moment: {alt, az, km, lit, mag}
      look(s,jd){ const S=this.lib; if(!S||!s.rec||s.bad)return null; const d=new Date(msOf(jd)); let pv; try{ pv=S.propagate(s.rec,d); }catch(e){ return null; } const p=pv&&pv.position; if(!p||typeof p!=='object'||!isFinite(p.x))return null;
        const gm=S.gstime(d), la=S.ecfToLookAngles(OBS,S.eciToEcf(p,gm)), alt=la.elevation*R2D, az=nrm(la.azimuth*R2D), km=la.rangeSat;
        const su=A.where('sun',jd), sv=[cs(su.dec)*cs(su.ra),cs(su.dec)*sn(su.ra),sn(su.dec)], dot=p.x*sv[0]+p.y*sv[1]+p.z*sv[2], perp=Math.hypot(p.x-dot*sv[0],p.y-dot*sv[1],p.z-dot*sv[2]), lit=dot>0||perp>6371;
        const o=S.ecfToEci(S.geodeticToEcf(OBS),gm), to=[o.x-p.x,o.y-p.y,o.z-p.z], tl=Math.hypot(...to)||1, ph=Math.acos(cl((to[0]*sv[0]+to[1]*sv[1]+to[2]*sv[2])/tl,-1,1)), F=Math.max(1e-3,(Math.sin(ph)+(Math.PI-ph)*Math.cos(ph))/Math.PI);
        return {alt,az,km,lit,mag:s.std-15.75+2.5*Math.log10(km*km/F)}; },
      // the visible passes in the next 12 hours (the Sun down, the satellite lit and over 10°), worked out a few satellites at a time
      plan(jd0){ if(!this.ready||this.pass)return; const pick=this.list.filter(s=>NAMES[s.n]).concat(this.list.filter(s=>!NAMES[s.n]&&s.std<=2.5).slice(0,3)), out=[]; this.pass=out; let i=0;
        const step=()=>{ const s=pick[i++]; if(!s){ out.sort((a,b)=>a.jd-b.jd); SKYL.passes=out; redraw=1; return; } let on=null;
          for(let k=0;k<=1440;k++){ const jd=jd0+k*30/86400, q=this.look(s,jd), su=A.where('sun',jd), sa=A.eq2hor(su.ra,su.dec,A.lst(jd)).alt, ok=q&&q.alt>10&&q.lit&&sa<-6;
            if(ok){ if(!on)on={s,jd,top:q.alt,mag:q.mag}; else { on.top=Math.max(on.top,q.alt); on.mag=Math.min(on.mag,q.mag); } } else if(on){ out.push(on); on=null; } }
          if(on)out.push(on); setTimeout(step,0); }; step(); }};
    const OBS={latitude:A.LAT*D2R,longitude:A.LON*D2R,height:.01};
    let satT=0, satNow=[], follow=null, lastGo=null;
    const satTick=(jd,C)=>{ if(!sats.ready)return; if((satT-=C.dt)<=0){ satT=.5; satNow=[]; for(const s of sats.list){ const q=sats.look(s,jd); if(q&&q.alt>-1){ s.v=hz(q.alt,q.az); satNow.push(s); } } }   // the ones up, every half second; those near the field exactly, every frame
      const t=C.t, cR=Math.cos(Math.min(89,C.fov)*D2R), cW=Math.cos(Math.min(89,C.fov/2+4)*D2R), sunDown=C.sunH.alt<-4;
      for(const s of satNow){ if(s.v[0]*t[0]+s.v[1]*t[1]+s.v[2]*t[2]<cW)continue; const q=sats.look(s,jd); if(!q||q.alt<0)continue; const v=hz(q.alt,q.az); if(v[0]*t[0]+v[1]*t[1]+v[2]*t[2]<cR)continue; const p=C.proj(v); if(!p)continue;
        const d=Math.hypot(p[0]-C.cx,p[1]-C.cy); if(d>C.R)continue; const seen=q.lit&&sunDown&&q.mag<C.lim+1;
        if(seen){ const g=C.g, k=cl((C.lim+1-q.mag)/3,.15,1)*(1-C.cover*.9); g.globalAlpha=k; g.fillStyle='#fff6e2'; g.beginPath(); g.arc(p[0],p[1],Math.max(1.2,(C.lim+1.5-q.mag)*.4),0,7); g.fill();
          if(C.fov<=8&&q.mag<4){ g.globalAlpha=.6*k; g.font='9px Silkscreen,monospace'; g.textAlign='left'; g.fillText(s.name,p[0]+8,p[1]-6); } g.globalAlpha=1;
          if(d<C.R*.9){ C.near.push([s.n===25544?'iss':'sat:'+s.n,{name:s.name,about:`${Math.round(q.alt)}° UP · ${Math.round(q.km)} KM AWAY · MAG ${q.mag.toFixed(1)}`,credit:'CELESTRAK ORBITS (SGP4)',cat:'sat',tier:s.n===25544?'s':'r'},d]);
            FIRSTS.mark(s.n===25544?'iss':'sat'); } } }
      // following one: the GO TO re-aimed at it every frame, until you take the tube or it sets
      if(follow){ const s=sats.list.find(x=>x.n===follow), q=s&&sats.look(s,jd); const off=q?Math.hypot(q.alt-SCOPE.alt,((q.az-SCOPE.az+540)%360-180)*cs(q.alt)):99;
        if(!q||q.alt<1||(SCOPE.goto!==lastGo&&!(SCOPE.goto==null&&off<.6))){ follow=null; lastGo=null; redraw=1; }
        else { const e=A.hor2eq(q.alt,q.az,A.lst(jd)); SCOPE.goto=lastGo={id:'sat:'+s.n,ra:e.ra,dec:e.dec,name:s.name}; } } };
    const satBlock=()=>{ if(!D.sats)return ''; if(!sats.ready)return `<div class="row info"><b>PASSING OVER TONIGHT</b>WORKING OUT THE ORBITS…</div>`; sats.plan(SCOPE.jd()); const P=(SKYL.passes||[]).slice(0,5);
      return `<div class="row info"><b>PASSING OVER TONIGHT</b>${P.length?P.map(p=>`${esc(p.s.name)} · ${hhmm(p.jd)} · ${Math.round(p.top)}° UP · MAG ${p.mag.toFixed(1)}`).join('<br>'):SKYL.passes?'NO BRIGHT PASSES IN THE NEXT 12 HOURS':'WORKING OUT THE PASSES…'}
        <div style="margin-top:4px">${[25544,48274,20580].map(n=>`<button class="btn ${follow===n?'on':''}" data-x="sl-follow:${n}">FOLLOW ${n===25544?'ISS':n===48274?'TIANGONG':'HUBBLE'}</button>`).join('')}</div><span style="opacity:.7">CELESTRAK ORBITS, UPDATED DAILY</span></div>`; };

    /* ---------- comets and asteroids: their orbits from JPL, moved to tonight ---------- */
    const K=.01720209895;
    const kepler=(o,jd)=>{ let x, y; const e=o.e;
      if(o.a){ const M=(o.ma+.9856076686/Math.pow(o.a,1.5)*(jd-o.ep))*D2R; let E=M+e*Math.sin(M); for(let i=0;i<12;i++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E)); x=o.a*(Math.cos(E)-e); y=o.a*Math.sqrt(1-e*e)*Math.sin(E); }
      else { const q=o.q, dt=jd-o.tp;
        if(e<.98){ const a=q/(1-e), M=K/Math.pow(a,1.5)*dt; let E=M+e*Math.sin(M); for(let i=0;i<30;i++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E)); x=a*(Math.cos(E)-e); y=a*Math.sqrt(1-e*e)*Math.sin(E); }
        else if(e>1.02){ const a=q/(e-1), M=K/Math.pow(a,1.5)*dt; let H=Math.asinh(M/e); for(let i=0;i<40;i++)H-=(e*Math.sinh(H)-H-M)/(e*Math.cosh(H)-1); x=a*(e-Math.cosh(H)); y=a*Math.sqrt(e*e-1)*Math.sinh(H); }
        else { const W=3*K*dt/(Math.SQRT2*Math.pow(q,1.5)), Y=Math.cbrt(W/2+Math.sqrt(W*W/4+1)), s=Y-1/Y, nu=2*Math.atan(s), r=q*(1+s*s); x=r*Math.cos(nu); y=r*Math.sin(nu); } }   // near-parabolic: Barker's equation
      const w=o.w, O=o.om, I=o.i, cw=cs(w), sw=sn(w), cO=cs(O), sO=sn(O), cI=cs(I), sI=sn(I);
      return [(cw*cO-sw*sO*cI)*x+(-sw*cO-cw*sO*cI)*y,(cw*sO+sw*cO*cI)*x+(-sw*sO+cw*cO*cI)*y,(sw*sI)*x+(cw*sI)*y]; };
    const seenFrom=(o,jd)=>{ const P=kepler(o,jd), E=A.helio('em',(jd-2451545)/36525), g=[P[0]-E[0],P[1]-E[1],P[2]-E[2]], q=A.toEq(...g), r=Math.hypot(...P), dl=q.r;
      let mag; if(o.a){ const R0=Math.hypot(...E), ca=cl((r*r+dl*dl-R0*R0)/(2*r*dl),-1,1), al=Math.acos(ca), t=Math.tan(al/2), G=o.G??.15; mag=o.H+5*Math.log10(r*dl)-2.5*Math.log10((1-G)*Math.exp(-3.33*Math.pow(t,.63))+G*Math.exp(-1.87*Math.pow(t,1.22))); }
      else mag=o.M1+5*Math.log10(dl)+o.K1*Math.log10(r);
      return {ra:q.ra,dec:q.dec,dl,r,mag}; };
    let small=[];
    const smalls=()=>{ const rows=(d,f)=>d&&d.fields&&d.data?d.data.map(r=>Object.fromEntries(d.fields.map((k,i)=>[k,r[i]]))):[]; small=[];
      for(const c of rows(D.comets)){ const o={kind:'comet',name:String(c.full_name).trim().toUpperCase(),e:+c.e,q:+c.q,i:+c.i,om:+c.om,w:+c.w,tp:+c.tp,M1:+c.M1,K1:+c.K1||10}; if(isFinite(o.q)&&isFinite(o.tp))small.push(o); }
      for(const a of rows(D.rocks)){ const m=/^\s*(\d+)\s+([^(]+)/.exec(a.full_name||''), o={kind:'rock',name:m?'('+m[1]+') '+m[2].trim().toUpperCase():String(a.full_name).trim(),a:+a.a,e:+a.e,i:+a.i,om:+a.om,w:+a.w,ma:+a.ma,ep:+a.epoch,H:+a.H,G:a.G==null?.15:+a.G}; if(o.a>0&&o.a<6)small.push(o); }
      smallAt=-1; };
    let smallAt=-1, smallNow=[];
    const smallTick=jd=>{ if(Math.abs(jd-smallAt)<1/1440)return; smallAt=jd; smallNow=small.map(o=>({o,...seenFrom(o,jd)})).filter(s=>isFinite(s.mag)); SKYL.small=smallNow; };
    const smallDraw=C=>{ const g=C.g, sv=C.eqv(C.sun.ra,C.sun.dec), dark=1-C.day;
      for(const s of smallNow){ if(s.mag>C.lim+(s.o.kind==='comet'?1:0))continue; const v=C.eqv(s.ra,s.dec); if(v[1]<-.02)continue; const p=C.proj(v); if(!p)continue; const d=Math.hypot(p[0]-C.cx,p[1]-C.cy);
        const vis=cl((C.lim+1-s.mag)/3,.12,1)*(1-C.cover*.9)*(s.o.kind==='comet'?dark:1);
        if(s.o.kind==='comet'){ const coma=cl(.03*Math.pow(10,(9-s.mag)/6),.015,.4), tl=cl((11-s.mag)*.5/Math.max(.3,s.r),.05,12);
          if(d>C.R+(coma+tl)*C.pxd)continue; const dot=v[0]*sv[0]+v[1]*sv[1]+v[2]*sv[2], tv=[v[0]*dot-sv[0],v[1]*dot-sv[1],v[2]*dot-sv[2]], tlen=Math.hypot(...tv)||1, u=tv.map(x=>x/tlen), q=C.proj([0,1,2].map(i=>v[i]*cs(tl)+u[i]*sn(tl)));
          g.globalCompositeOperation='lighter'; g.globalAlpha=vis;
          if(q){ const gr=g.createLinearGradient(p[0],p[1],q[0],q[1]); gr.addColorStop(0,'rgba(190,240,225,.55)'); gr.addColorStop(1,'rgba(190,240,225,0)'); const nx=-(q[1]-p[1]), ny=q[0]-p[0], nl=Math.hypot(nx,ny)||1, wd=coma*C.pxd*.5;
            g.fillStyle=gr; g.beginPath(); g.moveTo(p[0]+nx/nl*wd*.4,p[1]+ny/nl*wd*.4); g.lineTo(q[0]+nx/nl*wd*2.5,q[1]+ny/nl*wd*2.5); g.lineTo(q[0]-nx/nl*wd*2.5,q[1]-ny/nl*wd*2.5); g.lineTo(p[0]-nx/nl*wd*.4,p[1]-ny/nl*wd*.4); g.fill(); }
          const cr=Math.max(2,coma*C.pxd/2), h=g.createRadialGradient(p[0],p[1],0,p[0],p[1],cr); h.addColorStop(0,'rgba(240,255,250,.95)'); h.addColorStop(.25,'rgba(160,235,210,.6)'); h.addColorStop(1,'rgba(120,220,190,0)'); g.fillStyle=h; g.beginPath(); g.arc(p[0],p[1],cr,0,7); g.fill();
          g.globalCompositeOperation='source-over'; g.globalAlpha=1; }
        else { if(d>C.R)continue; g.globalAlpha=vis; g.fillStyle='#ddd4c2'; g.beginPath(); g.arc(p[0],p[1],Math.max(1,(C.lim+1.5-s.mag)*.35),0,7); g.fill(); g.globalAlpha=1; }
        if(d<C.R*.9){ const id=s.o.kind+':'+s.o.name; C.near.push([id,{name:s.o.name,about:`${s.o.kind==='comet'?'A COMET':'AN ASTEROID'} · MAG ${s.mag.toFixed(1)} · ${s.dl.toFixed(2)} AU FROM EARTH, ${s.r.toFixed(2)} FROM THE SUN`,credit:'NASA JPL SMALL-BODY DATABASE',cat:s.o.kind,tier:s.o.kind==='comet'?'s':'r'},d]); if(vis>.2)FIRSTS.mark(s.o.kind); } } };

    /* ---------- meteor showers (IMO's calendar): radiant, peak, ZHR, speed, active days ---------- */
    const SHW=[['QUADRANTIDS',1,3,230,49,80,41,-6,9],['LYRIDS',4,22,271,34,18,49,-8,8],['ETA AQUARIIDS',5,6,338,-1,50,66,-17,22],['S. DELTA AQUARIIDS',7,30,340,-16,25,41,-18,24],['PERSEIDS',8,12,48,58,100,59,-26,12],
      ['DRACONIDS',10,8,262,54,5,20,-2,2],['S. TAURIDS',10,10,32,9,5,27,-30,41],['ORIONIDS',10,21,95,16,20,66,-19,17],['N. TAURIDS',11,12,58,22,5,29,-23,28],['LEONIDS',11,17,152,22,15,71,-11,13],['GEMINIDS',12,14,112,33,150,35,-10,6],['URSIDS',12,22,217,76,10,33,-5,4]];   // name, month, day, RA, Dec, ZHR, km/s, days before and after
    const showers=jd=>{ const d=new Date(msOf(jd)), y=d.getUTCFullYear(), out=[];
      for(const [nm,mo,dy,ra,dec,zhr,v,b,a] of SHW)for(const yy of [y-1,y,y+1]){ const pk=Date.UTC(yy,mo-1,dy,12)/864e5+2440587.5, dd=jd-pk; if(dd<b||dd>a)continue; const w=Math.max(.7,(a-b)/10); out.push({nm,ra,dec,zhr:zhr*Math.exp(-Math.abs(dd)/w),v,pk}); }
      return out; };
    // meteors seen by one person over the whole sky an hour: ZHR × the radiant's height × the sky's darkness (population index 2.2), and about 8 sporadic ones
    SKYL.rate=(jd,lim=6.5)=>{ const lst=A.lst(jd), su=A.where('sun',jd); if(A.eq2hor(su.ra,su.dec,lst).alt>-12)return {all:0,list:[]}; const f=Math.pow(2.2,Math.min(6.5,lim)-6.5), list=[];
      for(const s of showers(jd)){ const h=A.eq2hor(s.ra,s.dec,lst).alt; if(h>0)list.push({...s,hr:s.zhr*sn(h)*f}); } list.push({nm:'SPORADIC',hr:8*f,v:40}); return {all:list.reduce((a,s)=>a+s.hr,0),list}; };
    const mets=[]; let metT=0, rateNow={all:0,list:[]}; SKYL.meteors=mets; SKYL.metCount=0;
    // one meteor: a random spot over 15°, flying along the great circle away from its radiant (sporadics any way), for its length at its speed
    const spawn=(jd,lim)=>{ const pick=Math.random()*rateNow.all; let s=null, acc=0; for(const x of rateNow.list){ acc+=x.hr; if(pick<=acc){ s=x; break; } } if(!s)return;
      const alt=15+Math.asin(Math.random())*R2D*.83, az=Math.random()*360, v=hz(alt,az); let dir;
      if(s.ra!=null){ const rh=A.eq2hor(s.ra,s.dec,A.lst(jd)), r=hz(rh.alt,rh.az), dt=v[0]*r[0]+v[1]*r[1]+v[2]*r[2]; dir=[v[0]*dt-r[0],v[1]*dt-r[1],v[2]*dt-r[2]]; const l=Math.hypot(...dir); if(l<.05)return; dir=dir.map(x=>x/l); }
      else { const a=Math.random()*6.28, e1=Math.hypot(v[0],v[2])>.01?[v[2],0,-v[0]]:[1,0,0], el=Math.hypot(...e1), E1=e1.map(x=>x/el), E2=[v[1]*E1[2]-v[2]*E1[1],v[2]*E1[0]-v[0]*E1[2],v[0]*E1[1]-v[1]*E1[0]]; dir=E1.map((x,i)=>x*Math.cos(a)+E2[i]*Math.sin(a)); }
      const len=4+Math.random()*22, w=cl(s.v/100*R2D*.6,8,45), mag=lim-Math.log(1/Math.max(1e-6,Math.random()))/Math.log(2.2);
      mets.push({v,dir,len,T:len/w,t:0,mag,nm:s.nm}); SKYL.metCount++; };
    SKYL.burst=n=>{ for(let i=0;i<n;i++)spawn(SCOPE.jd(),6.5); };
    SKYL.sim=(jd,secs,lim=6.5)=>{ const r=SKYL.rate(jd,lim); let n=0; for(let t=0;t<secs;t+=1)if(Math.random()<r.all/3600)n++; return {n,rate:r.all}; };
    const metTick=(jd,C)=>{ const g=C.g, lim=Math.min(6.5,C.lim-1.8+(SCOPE.mag===1?3:0)); if((metT-=C.dt)<=0){ metT=1; rateNow=SKYL.rate(jd,lim); rateNow.all*=1-C.cover; for(const x of rateNow.list)x.hr*=1-C.cover; }
      if(Math.random()<rateNow.all/3600*C.dt)spawn(jd,lim);
      for(let i=mets.length-1;i>=0;i--){ const m=mets[i]; m.t+=C.dt; if(m.t>m.T){ mets.splice(i,1); continue; } const f=m.t/m.T, at=a=>m.v.map((x,k)=>x*cs(a)+m.dir[k]*sn(a)), h=at(m.len*f), tl=at(Math.max(0,m.len*f-m.len*.35));
        const p=C.proj(h), q=C.proj(tl); if(!p||!q)continue; const d=Math.hypot(p[0]-C.cx,p[1]-C.cy); if(d>C.R&&Math.hypot(q[0]-C.cx,q[1]-C.cy)>C.R)continue;
        const k=cl((lim+2-m.mag)/4,.2,1)*Math.sin(Math.PI*f), gr=g.createLinearGradient(q[0],q[1],p[0],p[1]); gr.addColorStop(0,'rgba(255,255,255,0)'); gr.addColorStop(1,`rgba(255,250,235,${k})`);
        g.strokeStyle=gr; g.lineWidth=Math.max(1,(lim+1-m.mag)*.5); g.lineCap='round'; g.beginPath(); g.moveTo(q[0],q[1]); g.lineTo(p[0],p[1]); g.stroke();
        C.near.push(['meteor',{name:m.nm==='SPORADIC'?'A SHOOTING STAR':'A '+m.nm.replace(/S$/,'')+' METEOR',about:'A GRAIN OF COMET DUST BURNING UP 100 KM OVER NEW YORK.',credit:'IMO METEOR SHOWER CALENDAR',cat:'meteor',tier:'s'},Math.min(d,C.R*.3)]); FIRSTS.mark('meteor'); } };

    /* ---------- today's Sun: its sunspot groups (NOAA) on the SDO picture, and the day's flares ---------- */
    const spotsNow=()=>{ const S=Array.isArray(D.spots)?D.spots:[]; if(!S.length)return []; const last=S.reduce((a,x)=>x.observed_date>a?x.observed_date:a,''), days=(Date.now()-Date.parse(last+'T12:00:00Z'))/864e5;
      return S.filter(x=>x.observed_date===last).map(x=>{ const m=/^([NS])(\d+)([EW])(\d+)$/.exec(x.location||''); if(!m)return null; const lat=(m[1]==='N'?1:-1)*+m[2], lon=(m[3]==='W'?1:-1)*+m[4]+13.2*days;
        return {ar:x.region,lat,lon,flared:(x.c_xray_events||0)+(x.m_xray_events||0)+(x.x_xray_events||0),cls:x.spot_class||''}; }).filter(x=>x&&Math.abs(x.lon)<88); };
    const flares24=()=>{ const F=Array.isArray(D.flares)?D.flares:[], t=Date.now()-864e5, L=F.filter(f=>Date.parse(f.max_time||f.time_tag)>t), rank=c=>({X:4,M:3,C:2,B:1}[String(c||'')[0]]||0)*10+(parseFloat(String(c||'').slice(1))||0);
      return {n:L.length,top:L.reduce((a,f)=>rank(f.max_class)>rank(a)?f.max_class:a,'')}; };
    const sunDraw=C=>{ if(!SCOPE.filter)return; const v=C.eqv(C.sun.ra,C.sun.dec), p=C.proj(v); if(!p)return; const rd=C.sun.deg*C.pxd/2, d=Math.hypot(p[0]-C.cx,p[1]-C.cy); if(d>C.R+rd||rd<12)return; const g=C.g, f0=g.filter; g.filter='none';
      for(const s of spotsNow()){ const x=p[0]+cs(s.lat)*sn(s.lon)*rd, y=p[1]-sn(s.lat)*rd; g.strokeStyle=s.flared?'rgba(242,193,78,.9)':'rgba(242,193,78,.45)'; g.lineWidth=1.2; g.beginPath(); g.arc(x,y,Math.max(5,rd*.05),0,7); g.stroke();
        if(rd>60){ g.fillStyle='rgba(242,193,78,.85)'; g.font='9px Silkscreen,monospace'; g.textAlign='left'; g.fillText('AR '+s.ar+(s.flared?' · FLARED':''),x+Math.max(5,rd*.05)+3,y+3); }
        const dd=Math.hypot(x-C.cx,y-C.cy); if(s.flared&&dd<C.R*.35)FIRSTS.mark('flare'); }
      g.filter=f0; };
    const sunBlock=()=>{ if(!SKYL.sunLive&&!D.spots)return ''; const S=spotsNow(), F=flares24();
      return `<div class="row info"><b>THE SUN TODAY</b>${SKYL.sunLive?'TODAY\'S PICTURE, MINUTES OLD':'LAST WEEK\'S PICTURE'}<br>SUNSPOT GROUPS ${S.length} · FLARES IN 24 H ${F.n}${F.top?' (BIGGEST '+esc(F.top)+')':''}<br><span style="opacity:.7">NASA SOLAR DYNAMICS OBSERVATORY · NOAA SWPC</span></div>`; };

    /* ---------- space weather: NOAA's Kp, and the northern lights when it is high enough to reach New York ---------- */
    const kpAt=jd=>{ if(SKYL.kpFix!=null)return SKYL.kpFix; const K=D.kp; if(!Array.isArray(K))return null; const obs=(Array.isArray(K[0])?K[0]:[]).map(r=>[Date.parse(r.time_tag+'Z'),+r.Kp]), fc=(Array.isArray(K[1])?K[1]:[]).map(r=>[Date.parse(r.time_tag+'Z'),+r.kp]);
      const all=obs.concat(fc.filter(r=>!obs.length||r[0]>obs[obs.length-1][0])).filter(r=>isFinite(r[0])&&isFinite(r[1])).sort((a,b)=>a[0]-b[0]), t=msOf(jd); let k=null; for(const r of all){ if(r[0]<=t)k=r[1]; else break; } return k??(all.length?all[all.length-1][1]:null); };
    SKYL.kpAt=jd=>kpAt(jd);
    const auroraDraw=C=>{ SKYL.auroraSeen=false; const kp=kpAt(C.jd); if(kp==null||kp<6.7||C.sunH.alt>-12)return; const top=cl((kp-6.3)*12,3,60), g=C.g, T=performance.now()/1000, a0=(1-C.cover*.8)*cl((kp-6.5)/1.5,.3,1); let seen=false;
      g.globalCompositeOperation='lighter';
      for(let az=-70;az<=70;az+=2){ const wav=Math.sin(az*.09+T*.25)*.25+Math.sin(az*.23-T*.6)*.15, h0=2+Math.max(0,wav*4), h1=h0+top*(.7+.3*Math.sin(az*.05+T*.15)), b=C.proj(hz(h0,az)), t=C.proj(hz(h1,az)); if(!b||!t)continue;
        if(Math.min(Math.hypot(b[0]-C.cx,b[1]-C.cy),Math.hypot(t[0]-C.cx,t[1]-C.cy))>C.R*1.2)continue; seen=true; const k=a0*(.55+.45*Math.sin(az*.31+T*1.3))*(1-Math.abs(az)/90);
        const gr=g.createLinearGradient(b[0],b[1],t[0],t[1]); gr.addColorStop(0,'rgba(60,255,140,0)'); gr.addColorStop(.12,`rgba(60,255,140,${.5*k})`); gr.addColorStop(.6,`rgba(60,240,130,${.24*k})`); gr.addColorStop(1,kp>=8?`rgba(220,60,120,${.2*k})`:'rgba(60,255,140,0)');
        g.strokeStyle=gr; g.lineWidth=Math.max(2,Math.abs(t[0]-b[0])+C.pxd*2.2); g.beginPath(); g.moveTo(b[0],b[1]); g.lineTo(t[0],t[1]); g.stroke(); }
      g.globalCompositeOperation='source-over';
      if(seen){ C.near.push(['aurora',{name:'THE NORTHERN LIGHTS',about:`KP ${kp.toFixed(1)}: A GEOMAGNETIC STORM BIG ENOUGH TO LIGHT THE NORTHERN SKY OVER NEW YORK.`,credit:'NOAA SPACE WEATHER PREDICTION CENTER',cat:'aurora',tier:'s'},C.R*.3]); FIRSTS.mark('aurora'); } SKYL.auroraSeen=seen; };
    const kpBlock=()=>{ const jd=SCOPE.jd(), k=kpAt(jd); if(k==null)return ''; let mx=k; for(let h=0;h<24;h+=3){ const q=kpAt(jd+h/24); if(q!=null)mx=Math.max(mx,q); }
      const g=x=>x>=9?'G5':x>=8?'G4':x>=7?'G3':x>=6?'G2':x>=5?'G1':'QUIET';
      return `<div class="row info"><b>SPACE WEATHER</b>KP ${k.toFixed(1)} (${g(k)}) · NEXT DAY UP TO ${mx.toFixed(1)}<br>${mx>=7?'NORTHERN LIGHTS POSSIBLE LOW IN THE NORTH':'NO NORTHERN LIGHTS THIS FAR SOUTH'}<br><span style="opacity:.7">NOAA SPACE WEATHER PREDICTION CENTER</span></div>`; };

    /* ---------- this week: the brightest comet, asteroids and shower, each a GO TO ---------- */
    const weekBlock=()=>{ const jd=SCOPE.jd(); smallTick(jd); const c=smallNow.filter(s=>s.o.kind==='comet').sort((a,b)=>a.mag-b.mag)[0], r=smallNow.filter(s=>s.o.kind==='rock').sort((a,b)=>a.mag-b.mag).slice(0,2), sh=showers(jd).sort((a,b)=>b.zhr-a.zhr)[0];
      if(!c&&!r.length&&!sh)return ''; const it=(id,t)=>`<div style="display:flex;justify-content:space-between;align-items:center;gap:4px">${t}<button class="btn" data-x="sl-goto:${esc(id)}">GO</button></div>`;
      return `<div class="row info"><b>THIS WEEK</b>${c?it('comet:'+c.o.name,`${esc(c.o.name)} · MAG ${c.mag.toFixed(1)}`):''}${r.map(s=>it('rock:'+s.o.name,`${esc(s.o.name)} · MAG ${s.mag.toFixed(1)}`)).join('')}${sh?it('radiant:'+sh.nm,`${sh.nm} · ${new Date(msOf(sh.pk)).toUTCString().slice(5,11).toUpperCase()} · ${Math.round(sh.zhr)}/HR`):''}
        <span style="opacity:.7">NASA JPL SMALL-BODY DATABASE · IMO</span></div>`; };
    const goto=id=>{ const jd=SCOPE.jd(); if(id.startsWith('radiant:')){ const s=SHW.find(x=>x[0]===id.slice(8)); if(s)SCOPE.goto={id,ra:s[3],dec:s[4],name:s[0]}; return; }
      smallTick(jd); const s=smallNow.find(x=>x.o.kind+':'+x.o.name===id); if(s)SCOPE.goto={id,ra:s.ra,dec:s.dec,name:s.o.name}; };

    const E={open(){ load(); },
      panel(){ return `${skyBlock()}${satBlock()}${weekBlock()}${sunBlock()}${kpBlock()}`+(Object.keys(SKYL.err).length&&!D.weather&&!D.sats?`<div class="row info" style="opacity:.7">THE LIVE SKY IS OUT OF REACH RIGHT NOW</div>`:''); },
      click(b){ const x=b.dataset.x||''; if(!x.startsWith('sl-'))return false; const [a,v]=[x.slice(3,x.indexOf(':')<0?undefined:x.indexOf(':')),x.slice(x.indexOf(':')+1)];
        if(a==='follow'){ const n=+v; follow=follow===n?null:n; lastGo=null; if(!follow)SCOPE.goto=null; else if(SCOPE.mag>6)SCOPE.mag=6; } else if(a==='goto')goto(v); return true; },
      draw(C){ SKYL.on=true; if(redraw&&SCOPE.view){ redraw=0; SCOPE.view.panel(); } auroraDraw(C); smallTick(C.jd); smallDraw(C); satTick(C.jd,C); metTick(C.jd,C); sunDraw(C); },
      close(){ follow=null; mets.length=0; }};
    SKYL.sats=sats; SKYL.look=(n,jd)=>{ const s=sats.list.find(x=>x.n===n); return s&&sats.look(s,jd); }; SKYL.seenFrom=(name,jd)=>{ const o=small.find(x=>x.name===name); return o&&seenFrom(o,jd); }; SKYL.wx=wx;
    SKYL.follow=n=>{ follow=n; lastGo=null; };
    return E; };
  SCOPE.ext.push({open(){ if(!L)L=make(); L.open(); },panel:()=>L?L.panel():'',click:b=>!!L&&L.click(b),draw:C=>{ if(!L)return; const t0=performance.now(); L.draw(C); SKYL.cost=(SKYL.cost||0)*.95+(performance.now()-t0)*.05; },close(){ if(L)L.close(); }});
}
