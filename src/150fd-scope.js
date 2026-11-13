// THE TELESCOPE: a brass refractor on its tripod at your apartment's side window; double-click for the eyepiece: the real sky over New York at the game's moment (Yale Bright Star Catalogue; the planets, Moon and Sun from 134bb), the same sky the street has; it opens aimed at what you look at or the best thing up, the wheel zooms smoothly from the whole sky to thousands of times, a click centres a thing; focus, a clock drive, GO TO, a solar filter, and the weather in the way.
import {SHARED, THREE} from './003-shx.js';
import {DN, SFX, UI, WX} from './003b-systems.js';
import {MODS, SYS} from './006-map-pre.js';
import {EPH} from './134bb-ephem.js';
import {ROOMK} from './150a-bedroom.js';
import {FIRSTS} from './150fcz-firsts.js';
const SCOPE={alt:35,az:270,va:0,vz:0,mag:1,focus:.18,track:true,lines:true,filter:false,goto:null,open:null,data:null,stars:null,view:null,ext:[],site:{ap:80,dark:0,max:200,name:'THE TELESCOPE'}}; window.SCOPE=SCOPE;   // ext: what later files add ({panel, click, input, draw, open, close}, 150fg on); site: the instrument and the place (its glass in mm, how much darker than the street the sky is in magnitudes, its strongest eyepiece; the field telescope sets its own, 150fj)
{ const STARS=__LAZY__("data/stars.json"), SCOPEJ=__LAZY__("data/scope.json");
  SCOPE.files={sun:__FILE__("data/scope/sky/sun.jpg"),moon:__FILE__("data/scope/sky/moon.jpg"),moonhi:__FILE__("data/scope/sky/moonhi.jpg"),mercury:__FILE__("data/scope/sky/mercury.jpg"),venus:__FILE__("data/scope/sky/venus.jpg"),mars:__FILE__("data/scope/sky/mars.jpg"),jupiter:__FILE__("data/scope/sky/jupiter.jpg"),saturn:__FILE__("data/scope/sky/saturn.jpg"),uranus:__FILE__("data/scope/sky/uranus.jpg"),neptune:__FILE__("data/scope/sky/neptune.jpg"),m42:__FILE__("data/scope/sky/m42.jpg"),m31:__FILE__("data/scope/sky/m31.jpg"),m1:__FILE__("data/scope/sky/m1.jpg"),m57:__FILE__("data/scope/sky/m57.jpg"),m51:__FILE__("data/scope/sky/m51.jpg"),m104:__FILE__("data/scope/sky/m104.jpg"),m16:__FILE__("data/scope/sky/m16.jpg"),m8:__FILE__("data/scope/sky/m8.jpg"),m13:__FILE__("data/scope/sky/m13.jpg"),m33:__FILE__("data/scope/sky/m33.jpg")};   // the sky's pictures (NASA's, data/full/scope-sources.json), each fetched the first time it comes into the field

  /* ---------- the view: everything that runs only once someone looks through it ---------- */
  const make=()=>{ '@scope';
    const D2R=Math.PI/180, R2D=180/Math.PI, sn=x=>Math.sin(x*D2R), cs=x=>Math.cos(x*D2R), nrm=x=>((x%360)+360)%360, s180=x=>{ x=nrm(x); return x>180?x-360:x; }, cl=(v,a,b)=>Math.max(a,Math.min(b,v));
    const {where,gmst,eq2hor,hor2eq,galilean,BODY,LAT}=EPH;

    /* ---------- the time: the sky's own moment (134b), the same sky the street has ---------- */
    SCOPE.jdAt=(h,now=Date.now())=>EPH.jdOf(DN.skyAt(h,now));
    SCOPE.jd=()=>SCOPE.fixJD||EPH.jdOf(DN.skyT());
    SCOPE.astro=EPH;

    /* ---------- the page: the eyepiece's round field and the knobs beside it ---------- */
    const O=document.createElement('div'); O.id='scopev'; O.hidden=true; O.style.cssText='position:fixed;inset:0;z-index:30;background:#000;display:flex;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#3b2a1e';
    const cv=document.createElement('canvas'); cv.style.cssText='flex:1;min-width:0;height:100%;cursor:grab;touch-action:none'; O.appendChild(cv);
    const P=document.createElement('div'); P.className='ml'; P.style.cssText='width:min(250px,40vw);overflow:auto;padding:12px;background:#ece5d3;border-left:3px solid #3b2a1e;zoom:var(--uiz,1)'; O.appendChild(P);
    const css=document.createElement('style'); css.textContent='#scopev[hidden]{display:none!important} #scopev .row{margin:8px 0} #scopev .row>b{display:block;margin-bottom:4px} #scopev .btn{font:inherit;padding:4px 7px;margin:0 3px 3px 0;background:#ece5d3;color:#3b2a1e;border:2px solid #3b2a1e;cursor:pointer} #scopev .btn.on{background:#3b2a1e;color:#ece5d3} #scopev select,#scopev input[type=range]{width:100%;font:inherit} #scopev .info{color:#6a4a32;line-height:1.5}';
    document.head.appendChild(css); document.body.appendChild(O);
    const MAGS=[[1,'NAKED EYE'],[6,'FINDER 6X'],[25,'25X'],[50,'50X'],[100,'100X'],[200,'200X'],[400,'400X'],[1000,'1000X'],[2000,'2000X'],[5000,'5000X'],[10000,'10000X']], lg=Math.log;
    const FOV=m=>m<=1?100:m<6?100*Math.pow(.07,lg(m)/lg(6)):m<25?7*Math.pow(2/7,lg(m/6)/lg(25/6)):50/m;   // the field in degrees: the whole sky at 1, the finder's 7 at 6, then 50/power
    SCOPE.zmax=()=>SCOPE.site.max*25;   // the wheel goes far past the strongest eyepiece (owner, 12 Nov 2026: "really zoom into those massive levels", "zoom in as far as possible")
    const magName=m=>m<=1.01?'NAKED EYE':(m<10?m.toFixed(1):Math.round(m))+'X';
    const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const targets=()=>{ const D=SCOPE.data||{}, sky=(D.sky||[]).filter(t=>t.ra!=null); return [['SOLAR SYSTEM',['moon','me','ve','ma','ju','sa','ur','ne','sun'].map(k=>({id:k,name:BODY[k].name}))],['DEEP SKY (MESSIER)',sky.map(t=>({id:t.id,name:t.name}))],['DOUBLE STARS',(D.doubles||[]).map((d,i)=>({id:'dbl:'+i,name:d.name}))],['STARS',(SCOPE.stars.named||[]).map((n,i)=>({id:'star:'+i,name:n[2]}))]]; };
    const panel=()=>{ P.innerHTML=`<div><b>${esc(SCOPE.site.name)}</b> <button class="btn" data-a="close" style="float:right">DONE</button></div>
      <div class="row"><b>ZOOM · <span id="scopez">${magName(SCOPE.mag)}</span></b>${MAGS.filter(([m])=>m<=SCOPE.zmax()).map(([m,n])=>`<button class="btn ${SCOPE.mag===m?'on':''}" data-m="${m}">${n}</button>`).join('')}</div>
      <div class="row"><b>PRESETS · POINT AND ZOOM</b>${presets().map(([k,n,up])=>`<button class="btn" data-go="${k}"${up?'':' style="opacity:.5" title="BELOW THE HORIZON NOW"'}>${esc(n)}</button>`).join('')}</div>
      <div class="row"><b>FOCUS</b><input type="range" min="-100" max="100" value="${Math.round(SCOPE.focus*100)}" data-k="focus"></div>
      <div class="row"><button class="btn ${SCOPE.track?'on':''}" data-a="track">CLOCK DRIVE</button><button class="btn ${SCOPE.lines?'on':''}" data-a="lines">STAR LINES</button><button class="btn ${SCOPE.filter?'on':''}" data-a="filter">SOLAR FILTER</button></div>
      <div class="row"><b>GO TO</b><select data-k="goto">${targets().map(([g,L])=>`<optgroup label="${g}">${L.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('')}</optgroup>`).join('')}</select><button class="btn" data-a="go" style="margin-top:4px">GO</button><button class="btn" data-a="stop">STOP</button></div>
      ${SCOPE.ext.map(e=>e.panel?e.panel()||'':'').join('')}<div class="row info" id="scoper"></div><div class="info" style="opacity:.75">WHEEL: ZOOM IN AND OUT · DRAG: MOVE THE TUBE · CLICK A THING: CENTRE IT · ARROWS NUDGE</div>`; };
    P.addEventListener('click',e=>{ const b=e.target.closest('button,[data-x]'); if(!b)return; for(const x of SCOPE.ext)if(x.click&&x.click(b)){ panel(); return; } const a=b.dataset.a; if(b.dataset.m){ SCOPE.mag=+b.dataset.m; panel(); return; } if(b.dataset.go){ SCOPE.show(b.dataset.go); panel(); return; }
      if(a==='close')return SCOPE.close(); if(a==='track')SCOPE.track=!SCOPE.track; if(a==='lines')SCOPE.lines=!SCOPE.lines; if(a==='filter')SCOPE.filter=!SCOPE.filter;
      if(a==='go')SCOPE.goTo(P.querySelector('[data-k=goto]').value); if(a==='stop'){ SCOPE.goto=null; SCOPE.va=SCOPE.vz=0; } if(a!=='go'&&a!=='stop')panel(); });
    P.addEventListener('input',e=>{ if(e.target.dataset.k==='focus')SCOPE.focus=+e.target.value/100; for(const x of SCOPE.ext)if(x.input)x.input(e.target); });

    /* ---------- where things are: the target list, the tube's pointing ---------- */
    const radec=id=>{ if(BODY[id]){ const q=where(id,SCOPE.jd()); return {ra:q.ra,dec:q.dec,name:BODY[id].name,body:q}; }
      if(id.startsWith('star:')){ const n=SCOPE.stars.named[+id.slice(5)]; return n&&{ra:n[0],dec:n[1],name:n[2]}; }
      if(id.startsWith('dbl:')){ const d=(SCOPE.data.doubles||[])[+id.slice(4)]; return d&&{ra:d.ra,dec:d.dec,name:d.name}; }
      const t=(SCOPE.data.sky||[]).find(t=>t.id===id); return t&&t.ra!=null&&{ra:t.ra,dec:t.dec,name:t.name,t}; };
    SCOPE.goTo=id=>{ const q=radec(id); if(!q)return; const h=eq2hor(q.ra,q.dec,SCOPE.astro.lst(SCOPE.jd())); SCOPE.note=null; if(h.alt<0){ SCOPE.goto=null; SCOPE.note={s:q.name+' IS BELOW THE HORIZON NOW',t:performance.now()+5000}; return; } SCOPE.goto={id,...q}; };
    SCOPE.radec=()=>hor2eq(SCOPE.alt,SCOPE.az,SCOPE.astro.lst(SCOPE.jd()));
    SCOPE.altOf=id=>{ const q=radec(id); return q&&eq2hor(q.ra,q.dec,SCOPE.astro.lst(SCOPE.jd())); };
    // what is up now, the showiest first (the Moon, the planets, the Sun last); where the tube points when it opens: where you look in first person, else at the first of these, else the brightest named star up
    const upNow=()=>{ const jd=SCOPE.jd(), sunUp=EPH.seen('sun',jd).alt>-4, L=[]; for(const k of ['moon','ju','sa','ve','ma','me']){ const q=EPH.seen(k,jd); if(q.alt>4&&(k==='moon'||!sunUp||q.mag<-3.5))L.push([k,BODY[k].name]); } return L; };
    SCOPE.upNow=upNow;
    // the presets: the Moon, the planets and the sky's photographed showpieces; one click swings the tube there and zooms until the thing fills about half the field
    const presets=()=>{ const L=['moon','me','ve','ma','ju','sa','ur','ne'].map(k=>[k,BODY[k].name]); for(const t of (SCOPE.data&&SCOPE.data.sky)||[])if(t.file&&t.ra!=null)L.push([t.id,t.name]); return L.map(([k,n])=>{ const h=SCOPE.altOf(k); return [k,n,!!h&&h.alt>0]; }); };
    SCOPE.presets=presets;
    SCOPE.show=id=>{ SCOPE.goTo(id); if(!SCOPE.goto)return false; const q=radec(id), deg=q.body?q.body.deg:(q.t&&q.t.fov_deg)||.2; SCOPE.mag=cl(50/(deg*2.2),6,SCOPE.zmax()); if(q.body&&id==='sun')SCOPE.filter=true; return true; };
    const aim=()=>{ const C=SHARED.cam; if(UI.view==='first'&&C){ const d=C.getWorldDirection(new THREE.Vector3()), al=Math.asin(cl(d.y,-1,1))*R2D; if(al>8){ SCOPE.alt=Math.min(89,al); SCOPE.az=nrm(Math.atan2(-d.x,d.z)*R2D); SCOPE.va=SCOPE.vz=0; return; } }
      const jd=SCOPE.jd(), U=upNow(); let h=null; if(U.length)h=EPH.seen(U[0][0],jd); else if(SCOPE.stars)for(let i=0;i<SCOPE.stars.named.length&&!h;i++){ const q=SCOPE.altOf('star:'+i); if(q&&q.alt>15)h=q; }   // (the list runs from the brightest)
      if(h){ SCOPE.alt=cl(h.alt,-10,89.9); SCOPE.az=nrm(h.az); SCOPE.va=SCOPE.vz=0; } };

    /* ---------- the stars, as unit vectors once ---------- */
    let SX, SY, SZ, SM, SC; const starsIn=S=>{ const n=S.s.length; SX=new Float32Array(n); SY=new Float32Array(n); SZ=new Float32Array(n); SM=new Float32Array(n); SC=[];
      S.s.forEach(([ra,de,m,bv],i)=>{ SX[i]=cs(de)*cs(ra); SY[i]=cs(de)*sn(ra); SZ[i]=sn(de); SM[i]=m; const t=cl((bv+.4)/2.4,0,1); SC.push(`rgb(${Math.round(170+85*Math.min(1,t*2))},${Math.round(190+55*(1-Math.abs(t-.35)*1.6))},${Math.round(255-170*t)})`); });
      S.cx={}; for(const k in S.lines){ let x=0,y=0,z=0; for(const [a,b] of S.lines[k]){ x+=cs(b)*cs(a); y+=cs(b)*sn(a); z+=sn(b); } const l=Math.hypot(x,y,z)||1; S.cx[k]=[x/l,y/l,z/l]; } };
    // the sky's pictures: one Image each, asked for the first time it comes into the field
    const IM={}, FE={}; const img=k=>{ const u=SCOPE.files[k]; if(!u)return null; if(!IM[k]){ IM[k]=new Image(); IM[k].src=u; } return IM[k].complete&&IM[k].naturalWidth?IM[k]:null; };
    const soft=k=>{ if(FE[k])return FE[k]; const im=img(k); if(!im)return null; const c=document.createElement('canvas'), n=c.width=c.height=256, x=c.getContext('2d'); x.drawImage(im,0,0,n,n); x.globalCompositeOperation='destination-in'; const gr=x.createRadialGradient(n/2,n/2,n*.3,n/2,n/2,n*.5); gr.addColorStop(0,'#000'); gr.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=gr; x.fillRect(0,0,n,n); return FE[k]=c; };   // the deep sky's pictures fade at their edges
    // a deep-sky thing with no photograph, drawn by its kind at its real size (a globular's ball of stars, an open cluster's scatter, a galaxy's tilted glow, a planetary's ring, a nebula's cloud), the same every time by its number; the big bright clusters are the catalogue's own stars
    const paint=(T,px,py,sz,al)=>{ const h=sz/2; let sd=(T.m||1)*7919+13; const rnd=()=>{ sd=(sd*1664525+1013904223)>>>0; return sd/4294967296; }, gz=()=>(rnd()+rnd()+rnd()+rnd()-2)*.6;
      const glow=(r,stops)=>{ const gr=g.createRadialGradient(0,0,0,0,0,r); for(const [t,col] of stops)gr.addColorStop(t,col); g.fillStyle=gr; g.beginPath(); g.arc(0,0,r,0,7); g.fill(); };
      g.save(); g.translate(px,py); g.globalCompositeOperation='lighter'; g.globalAlpha=al;
      if(T.kind==='globular'){ glow(h*.9,[[0,'rgba(255,244,220,.8)'],[.18,'rgba(255,236,200,.4)'],[.5,'rgba(230,220,200,.1)'],[1,'rgba(220,220,220,0)']]); if(sz>24){ const n=Math.min(240,Math.floor(sz*1.5)), d=Math.max(.6,Math.min(1.3,sz/160)); for(let i=0;i<n;i++){ const r=Math.pow(rnd(),1.9)*h*.85, a=rnd()*6.283; g.fillStyle=`rgba(255,${230+Math.floor(rnd()*25)},${190+Math.floor(rnd()*60)},${.3+rnd()*.5})`; g.beginPath(); g.arc(Math.cos(a)*r,Math.sin(a)*r,d,0,7); g.fill(); } } }
      else if(T.kind==='cluster'){ if((T.fov_deg||0)<1){ const n=Math.min(70,Math.max(12,Math.floor(sz/3))); for(let i=0;i<n;i++){ const b=rnd(); g.fillStyle=`rgba(${200+Math.floor(rnd()*55)},${220+Math.floor(rnd()*35)},255,${.4+b*.6})`; g.beginPath(); g.arc(gz()*h*.75,gz()*h*.75,.7+b*b*1.3,0,7); g.fill(); } } }
      else if(T.kind==='galaxy'){ g.rotate(rnd()*3.14); g.scale(1,.3+rnd()*.6); glow(h*.95,[[0,'rgba(255,240,215,.9)'],[.1,'rgba(245,225,200,.45)'],[.4,'rgba(200,205,230,.14)'],[1,'rgba(180,190,230,0)']]); }
      else if(T.kind==='planetary'){ glow(h*.8,[[0,'rgba(120,220,200,.2)'],[.55,'rgba(110,230,200,.55)'],[.75,'rgba(120,200,230,.4)'],[1,'rgba(120,200,230,0)']]); g.fillStyle='rgba(255,255,255,.9)'; g.beginPath(); g.arc(0,0,1,0,7); g.fill(); }
      else { for(let i=0;i<7;i++){ g.save(); g.translate(gz()*h*.45,gz()*h*.45); glow(h*(.3+rnd()*.35),[[0,`rgba(${200+Math.floor(rnd()*55)},${90+Math.floor(rnd()*70)},${120+Math.floor(rnd()*80)},.4)`],[1,'rgba(200,100,140,0)']]); g.restore(); } }
      g.restore(); };
    // a soft cloud picture, drawn once, drifted with the wind
    const cloudC=document.createElement('canvas'); cloudC.width=cloudC.height=256; { const g=cloudC.getContext('2d'); for(let i=0;i<260;i++){ const x=Math.random()*256, y=Math.random()*256, r=12+Math.random()*46, gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,'rgba(150,150,160,.22)'); gr.addColorStop(1,'rgba(150,150,160,0)'); g.fillStyle=gr; for(const dx of [-256,0,256])for(const dy of [-256,0,256]){ g.save(); g.translate(dx,dy); g.beginPath(); g.arc(x,y,r,0,7); g.fill(); g.restore(); } } }

    /* ---------- the mount: the tube has weight; a drag pushes it, friction stops it, the clock drive turns it with the sky, GO TO slews it ---------- */
    let drag=null, keyV=[0,0], wob=[0,0,0,0], last=performance.now(), lastJD=null;
    cv.addEventListener('pointerdown',e=>{ drag={x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t:performance.now(),rx:0,ry:0}; cv.setPointerCapture(e.pointerId); cv.style.cursor='grabbing'; SCOPE.goto=null; });
    cv.addEventListener('pointermove',e=>{ if(!drag)return; drag.rx+=e.clientX-drag.x; drag.ry+=e.clientY-drag.y; drag.x=e.clientX; drag.y=e.clientY; });
    const up=e=>{ const d=drag; drag=null; cv.style.cursor='grab'; if(d&&e&&e.type==='pointerup'&&Math.hypot(e.clientX-d.x0,e.clientY-d.y0)<5&&performance.now()-d.t<400&&VW){ const b=cv.getBoundingClientRect(), dx=e.clientX-b.left-VW.cx, dy=e.clientY-b.top-VW.cy; if(Math.hypot(dx,dy)<VW.R){ const q=hor2eq(cl(SCOPE.alt-dy/VW.pxd,-10,89.9),nrm(SCOPE.az+dx/VW.pxd/Math.max(.2,cs(SCOPE.alt))),VW.lst); SCOPE.goto={id:'pt',ra:q.ra,dec:q.dec,name:''}; } } };   // a click, not a drag: that spot to the middle
    cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up);
    let VW=null; const zshow=()=>{ const z=P.querySelector('#scopez'); if(z)z.textContent=magName(SCOPE.mag); P.querySelectorAll('[data-m]').forEach(b=>b.classList.toggle('on',+b.dataset.m===SCOPE.mag)); };
    cv.addEventListener('wheel',e=>{ e.preventDefault(); if(!e.deltaY)return; const k=Math.exp(-cl(e.deltaY*(e.deltaMode===1?33:1),-240,240)*.0022); let m=cl(SCOPE.mag*k,1,SCOPE.zmax()); for(const [p] of MAGS)if(Math.abs(m/p-1)<.035&&p<=SCOPE.zmax())m=p; if(m!==SCOPE.mag){ SCOPE.mag=m; zshow(); } },{passive:false});   // the wheel zooms smoothly, catching on the eyepieces' own powers
    const keys=e=>{ if(O.hidden)return; const k=e.key, d=e.type==='keydown'?1:0; if(k==='Escape'&&d){ SCOPE.close(); } else if(k==='ArrowLeft')keyV[0]=-d; else if(k==='ArrowRight')keyV[0]=d; else if(k==='ArrowUp')keyV[1]=d; else if(k==='ArrowDown')keyV[1]=-d; else return; e.stopImmediatePropagation(); e.preventDefault(); };
    addEventListener('keydown',keys,true); addEventListener('keyup',keys,true);
    const mount=(dt,pxd)=>{ const jd=SCOPE.jd(), lst=SCOPE.astro.lst(jd);
      const L=SCOPE.lead&&SCOPE.lead(dt); if(L){ SCOPE.alt=L.alt; SCOPE.az=L.az; SCOPE.va=SCOPE.vz=0; lastJD=jd; return {jd,lst}; }   // someone else's telescope (a star party, 150fh): it points where theirs does
      if(SCOPE.track&&lastJD!=null&&Math.abs(jd-lastJD)<.5){ const q=hor2eq(SCOPE.alt,SCOPE.az,SCOPE.astro.lst(lastJD)), h=eq2hor(q.ra,q.dec,lst); SCOPE.alt=h.alt; SCOPE.az=h.az; } lastJD=jd;
      let wa=0, wz=0, tau=.35;
      if(drag){ const k=1/Math.max(1e-3,dt)/pxd; wz=-drag.rx*k/Math.max(.2,cs(SCOPE.alt)); wa=drag.ry*k; drag.rx=drag.ry=0; tau=.08; }
      else if(keyV[0]||keyV[1]){ wz=keyV[0]*FOV(SCOPE.mag)*.5/Math.max(.2,cs(SCOPE.alt)); wa=keyV[1]*FOV(SCOPE.mag)*.5; tau=.25; }
      else if(SCOPE.goto){ const g=SCOPE.goto, b=BODY[g.id]?where(g.id,jd):null, h=eq2hor(b?b.ra:g.ra,b?b.dec:g.dec,lst); if(g.id==='moon')h.alt-=b.par*cs(h.alt); const ea=h.alt-SCOPE.alt, ez=s180(h.az-SCOPE.az), mx=g.id==='pt'?Math.max(.02,FOV(SCOPE.mag)*2):25;
        wa=cl(ea*5,-mx,mx); wz=cl(ez*5,-mx,mx); tau=.15; const eps=Math.min(.002,FOV(SCOPE.mag)/400); if(Math.abs(ea)<eps&&Math.abs(ez)<eps){ SCOPE.goto=null; } }
      else { wa=0; wz=0; }
      const f=1-Math.exp(-dt/tau); SCOPE.va+=(wa-SCOPE.va)*f; SCOPE.vz+=(wz-SCOPE.vz)*f;
      SCOPE.alt=cl(SCOPE.alt+SCOPE.va*dt,-10,89.9); SCOPE.az=nrm(SCOPE.az+SCOPE.vz*dt); return {jd,lst}; };

    /* ---------- one look through it ---------- */
    const g=cv.getContext('2d'); let W=0, H=0;
    const draw=dt=>{ const dpr=Math.min(2,devicePixelRatio||1), w=cv.clientWidth, h=cv.clientHeight; if(w!==W||h!==H){ W=w; H=h; cv.width=w*dpr; cv.height=h*dpr; } g.setTransform(dpr,0,0,dpr,0,0);
      const R=Math.min(w,h)*.46, cx=w/2, cy=h/2, fov=FOV(SCOPE.mag), pxd=R/(Math.tan(fov/2*D2R)*R2D);   // pixels a degree near the centre
      const {jd,lst}=mount(dt,pxd); VW={cx,cy,R,pxd,lst};
      const put=(im,x,y,w,h,ox=0,oy=0)=>{ const m=40, x0=Math.max(x,cx-R-m-ox), y0=Math.max(y,cy-R-m-oy), x1=Math.min(x+w,cx+R+m-ox), y1=Math.min(y+h,cy+R+m-oy); if(x1<=x0||y1<=y0)return; const sw=(im.naturalWidth||im.width)/w, sh=(im.naturalHeight||im.height)/h; g.drawImage(im,(x0-x)*sw,(y0-y)*sh,(x1-x0)*sw,(y1-y0)*sh,x0,y0,x1-x0,y1-y0); };   // only the part in the eyepiece: a picture blown up to thousands of pixels freezes the page
      // the tube's frame: forward t, right r (towards the east when facing north), up u; horizon vectors are (east, up, north)
      const t=[cs(SCOPE.alt)*sn(SCOPE.az),sn(SCOPE.alt),cs(SCOPE.alt)*cs(SCOPE.az)], r0=[t[2],0,-t[0]], rl=Math.hypot(r0[0],r0[2])||1, r=[r0[0]/rl,0,r0[2]/rl], u=[t[1]*r[2]-t[2]*r[1],t[2]*r[0]-t[0]*r[2],t[0]*r[1]-t[1]*r[0]];
      const cT=cs(lst), sT=sn(lst), cP=cs(LAT), sP=sn(LAT), sc=R/Math.tan(fov/2*D2R);
      const hv=(X,Y,Z)=>{ const a=cT*X+sT*Y; return [-(sT*X-cT*Y),sP*Z+cP*a,Z*cP-sP*a]; };   // equatorial unit vector to (east, up, north)
      const proj=v=>{ const d=v[0]*t[0]+v[1]*t[1]+v[2]*t[2]; if(d<=.05)return null; return [cx+sc*(v[0]*r[0]+v[1]*r[1]+v[2]*r[2])/d,cy-sc*(v[0]*u[0]+v[1]*u[1]+v[2]*u[2])/d,d]; };
      const eqv=(ra,dec)=>hv(cs(dec)*cs(ra),cs(dec)*sn(ra),sn(dec));
      // the light: the Sun's height sets the sky (New York's glow keeps it from black), the weather covers it
      const sun=where('sun',jd), sunH=eq2hor(sun.ra,sun.dec,lst), sv=eqv(sun.ra,sun.dec), sunOff=Math.acos(cl(sv[0]*t[0]+sv[1]*t[1]+sv[2]*t[2],-1,1))*R2D;
      const day=cl((sunH.alt+12)/12,0,1), Wx=(SCOPE.wx&&SCOPE.wx(jd))||(WX&&WX.now)||{cloud:0,rain:0,snow:0,fog:0}, wet=Math.max(Wx.rain||0,Wx.snow||0), cover=cl(((Wx.cloud||0)-.2)/.7,0,1), filt=SCOPE.filter?1e-5:1;
      let lim=cl(8.3-11*day,-4,8.3)-2*cover-3*(Wx.fog||0); lim+=5*Math.log10(SCOPE.site.ap/80)+SCOPE.site.dark*(1-day); if(SCOPE.mag<6)lim-=(3+5*Math.log10(SCOPE.site.ap/80))*(1-lg(SCOPE.mag)/lg(6)); if(SCOPE.filter)lim=-30;   // the eye's 7 mm against the tube's 80
      const sky=day*filt*(1-.4*cover); g.fillStyle='#000'; g.fillRect(0,0,w,h); g.save(); g.beginPath(); g.arc(cx,cy,R,0,7); g.clip();
      g.fillStyle=`rgb(${Math.round(10+120*sky)},${Math.round(13+160*sky)},${Math.round(26+210*sky)})`; g.fillRect(cx-R,cy-R,2*R,2*R);
      // the air: seeing makes everything tremble a little, more the more you magnify (about 2.5 arc seconds over the city)
      for(let i=0;i<2;i++){ wob[i+2]+=((Math.random()-.5)*2-wob[i+2])*Math.min(1,dt*9); wob[i]+=(wob[i+2]-wob[i])*Math.min(1,dt*14); }
      const see=Math.min(1.6,2.5/3600*pxd), jx=wob[0]*see, jy=wob[1]*see, blur=Math.min(28,Math.abs(SCOPE.focus-.18)*Math.min(400,SCOPE.mag)*.45)+(SCOPE.mag>=100?see*.4:0);   // the air's tremble stays small however far in
      g.filter=blur>.3?`blur(${blur.toFixed(1)}px)`:'none'; g.translate(jx,jy);
      // the stars, by magnitude and colour
      if(SX&&lim>-2){ const cR=Math.cos(Math.min(89,fov*.75)*D2R), pk=SCOPE.mag<1.5?.75:Math.max(.6,Math.min(1.6,25/SCOPE.mag+.4));
        for(let i=0;i<SX.length;i++){ const m=SM[i]; if(m>lim)continue; const v=hv(SX[i],SY[i],SZ[i]); if(v[0]*t[0]+v[1]*t[1]+v[2]*t[2]<cR||v[1]<-.02)continue; const p=proj(v); if(!p)continue;
          const k=cl((lim-m)/4,0,1), tw=1-.35*Math.random()*(1-v[1]); g.globalAlpha=k*tw*(1-cover*.85); g.fillStyle=SC[i]; g.beginPath(); g.arc(p[0],p[1],pk*Math.max(.7,(lim+1.5-m)*.45),0,7); g.fill(); }
        g.globalAlpha=1; }
      // the constellations' lines and names (through the finder they fit)
      if(SCOPE.lines&&SCOPE.stars&&fov>=2&&!SCOPE.filter&&lim>2){ g.strokeStyle='rgba(120,170,255,.35)'; g.lineWidth=1; g.beginPath();
        for(const k in SCOPE.stars.lines)for(const [a,b,c,d] of SCOPE.stars.lines[k]){ const p=proj(eqv(a,b)), q=proj(eqv(c,d)); if(p&&q&&p[2]>.5&&q[2]>.5){ g.moveTo(p[0],p[1]); g.lineTo(q[0],q[1]); } } g.stroke();
        g.fillStyle='rgba(150,190,255,.6)'; g.font='10px Silkscreen,monospace'; g.textAlign='center'; for(const k in SCOPE.stars.cx){ const c=SCOPE.stars.cx[k], p=proj(hv(c[0],c[1],c[2])); if(p&&p[2]>.9)g.fillText(SCOPE.stars.names[k]||k,p[0],p[1]); } }
      // the Sun, the Moon and the planets at their real size, lit from the Sun's side
      const near=[]; let MP=null, SP=null; for(const k of ['ne','ur','sa','ju','ma','me','ve','moon','sun']){ const q=where(k,jd), hz=eq2hor(q.ra,q.dec,lst); let v=eqv(q.ra,q.dec);
        if(k==='moon'){ const a=(hz.alt-q.par*cs(hz.alt))*D2R, z=hz.az*D2R; v=[Math.cos(a)*Math.sin(z),Math.sin(a),Math.cos(a)*Math.cos(z)]; }   // seen from the ground, not the Earth's centre
        const p=proj(v); if(!p)continue; const d=Math.hypot(p[0]-cx,p[1]-cy), sz=q.deg*pxd/BODY[k].fill; if(k==='moon')MP={p,q,d,up:v[1]>-.02}; if(k==='sun')SP={p,q,d}; if(d>R+sz)continue; near.push([k,q,d]);
        if(k==='sun'){ if(!SCOPE.filter)continue; } else if(q.mag>lim+2||v[1]<-.02)continue;
        const vis=k==='sun'?1:(1-cover*.9)*cl((lim+2-q.mag)/3,0,1); g.globalAlpha=vis;
        if(q.deg*pxd<3){ g.fillStyle=BODY[k].col; g.beginPath(); g.arc(p[0],p[1],Math.max(1.2,(lim+1.5-q.mag)*.35),0,7); g.fill(); g.globalAlpha=1; continue; }
        const im=(k==='moon'&&sz>760&&img('moonhi'))||img(BODY[k].id), rr=sz/2; g.save(); g.translate(p[0],p[1]);   // the Moon's sharper picture once it fills the field
        if(im){ if(k==='sa'){ g.globalCompositeOperation='lighter'; put(im,-rr,-rr,sz,sz,p[0]+jx,p[1]+jy); g.globalCompositeOperation='source-over'; } else { g.save(); g.beginPath(); g.arc(0,0,q.deg*pxd/2,0,7); g.clip(); put(im,-rr,-rr,sz,sz,p[0]+jx,p[1]+jy); g.restore(); } }   // the photo's black sky never covers ours else { g.fillStyle=BODY[k].col; g.beginPath(); g.arc(0,0,q.deg*pxd/2,0,7); g.fill(); }
        if(k!=='sun'&&q.i>2){ const sp=proj(sv), ang=sp?Math.atan2(sp[1]-p[1],sp[0]-p[0]):Math.atan2(sv[1]-v[1],0), dr=q.deg*pxd/2, ci=Math.cos(q.i*D2R); if(k==='moon'){ MP.ang=ang; MP.ci=ci; } g.rotate(ang); g.fillStyle='rgba(0,0,0,.9)'; g.beginPath();
          for(let a=-90;a<=90;a+=6){ const y=dr*sn(a); g.lineTo(-dr*cs(a)*1.01,y); } for(let a=90;a>=-90;a-=6){ const y=dr*sn(a); g.lineTo(-ci*dr*cs(a),y); } g.fill(); }   // the dark side: the limb away from the Sun to the terminator
        g.restore(); g.globalAlpha=1;
        if(k==='ju'&&q.deg*pxd>2){ const w0=proj(eqv(q.ra-.01/cs(q.dec),q.dec)), ux=w0?(w0[0]-p[0])/.01:0, uy=w0?(w0[1]-p[1])/.01:0, rj=q.deg/2;   // a degree west, on the screen
          g.fillStyle='#f4ecd8'; g.font='9px Silkscreen,monospace'; g.textAlign='center'; for(const m of galilean(jd)){ if(Math.abs(m.x)<1&&!m.front)continue; const x=p[0]+ux*m.x*rj, y=p[1]+uy*m.x*rj; g.globalAlpha=vis; g.beginPath(); g.arc(x,y,Math.max(1,q.deg*pxd*.025),0,7); g.fill(); if(SCOPE.mag>=100)g.fillText(m.n,x,y+12); } g.globalAlpha=1; } }
      // the deep sky's pictures, at their size, faint as they really are under a city sky
      if(SCOPE.data&&!SCOPE.filter)for(const T of SCOPE.data.sky||[]){ if(T.ra==null)continue; const v=eqv(T.ra,T.dec), p=proj(v); if(!p||v[1]<-.02)continue; const sz=(T.fov_deg||.5)*pxd, d=Math.hypot(p[0]-cx,p[1]-cy); if(d>R+sz)continue; near.push([T.id,T,d]);
        if(T.mag!=null&&T.mag>lim+1.5)continue; const al=(1-day)*(1-cover*.9)*(T.kind==='cluster'||T.kind==='globular'?(T.file?.35:.8):.7)*(T.mag!=null?cl((lim+1.5-T.mag)/2,.15,1):1); if(!T.file){ if(sz>=3)paint(T,p[0],p[1],sz,al); continue; } const im=soft(T.id); if(!im||sz<4)continue; g.globalAlpha=al; g.globalCompositeOperation='lighter'; put(im,p[0]-sz/2,p[1]-sz/2,sz,sz,jx,jy); g.globalCompositeOperation='source-over'; g.globalAlpha=1; }
      // double stars: the companion beside its primary at its real distance and bearing, parted once the eyepiece and the air can part them
      if(SCOPE.data&&!SCOPE.filter)(SCOPE.data.doubles||[]).forEach((D,i)=>{ if(D.m1>lim)return; const v=eqv(D.ra,D.dec); if(v[1]<-.02)return; const p=proj(v); if(!p)return; const dd=Math.hypot(p[0]-cx,p[1]-cy); if(dd>R)return;
        const n=proj(eqv(D.ra,D.dec+.01)), ux=n?(n[0]-p[0])/.01:0, uy=n?(n[1]-p[1])/.01:-pxd, sp=D.sep/3600, a=D.pa*D2R, ox=sp*(Math.cos(a)*ux+Math.sin(a)*uy), oy=sp*(Math.cos(a)*uy-Math.sin(a)*ux), split=sp*pxd>=2.4&&D.sep>=1.3*116/SCOPE.site.ap&&D.m2<lim+1;
        const k=cl((lim-D.m1)/4,0,1)*(1-cover*.85), pk=Math.max(.6,Math.min(1.6,25/SCOPE.mag+.4)); g.globalAlpha=k; g.fillStyle=D.c1||'#fff'; g.beginPath(); g.arc(p[0],p[1],pk*Math.max(.7,(lim+1.5-D.m1)*.45),0,7); g.fill();
        if(split){ g.fillStyle=D.c2||'#fff'; g.beginPath(); g.arc(p[0]+ox,p[1]+oy,Math.max(.7,Math.min(sp*pxd*.42,pk*Math.max(.7,(lim+1.5-D.m2)*.45))),0,7); g.fill(); } g.globalAlpha=1;
        near.push(['dbl:'+i,{name:D.name,about:`A DOUBLE STAR · ${D.sep}″ APART · MAG ${D.m1} AND ${D.m2}${split?'':' · NOT PARTED AT THIS POWER'}${D.about?'<br>'+D.about:''}`,cat:'dbl',grp:'dbl',tier:D.sep<6?'r':'c',hold:split},Math.max(0,dd-2)]); });
      // the Moon's face: its seas and craters named once the disc is big enough, the lit ones only
      if(MP&&MP.up&&SCOPE.data&&!SCOPE.filter){ const rd=MP.q.deg*pxd/2; if(rd>110&&MP.d<R+rd){ const f0=g.filter; g.filter='none'; g.font='9px Silkscreen,monospace'; g.textAlign='left';
          (SCOPE.data.moon||[]).forEach((F,i)=>{ const nx=cs(F.lat)*sn(F.lon), ny=-sn(F.lat), x=MP.p[0]+nx*rd, y=MP.p[1]+ny*rd, dd=Math.hypot(x-cx,y-cy); if(dd>R*.95)return;
            if(MP.ang!=null){ const al=nx*Math.cos(MP.ang)+ny*Math.sin(MP.ang), pe=-nx*Math.sin(MP.ang)+ny*Math.cos(MP.ang); if(al<-MP.ci*Math.sqrt(Math.max(0,1-pe*pe))+.04)return; }
            if(SCOPE.lines){ g.strokeStyle='rgba(255,236,190,.55)'; g.fillStyle='rgba(255,236,190,.8)'; g.lineWidth=1; g.beginPath(); g.arc(x,y,Math.max(3,F.r*rd),0,7); g.stroke(); g.fillText(F.name,x+Math.max(3,F.r*rd)+3,y+3); }
            near.push(['moonf:'+i,{name:F.name,about:F.about,credit:'IAU / USGS GAZETTEER OF PLANETARY NOMENCLATURE',cat:'moonf',grp:'moonf',tier:'c',hold:SCOPE.mag>=50},dd]); }); g.filter=f0; } }
      // eclipses: the Earth's shadow crossing the Moon; the Moon crossing the Sun (through the solar filter)
      if(MP&&MP.up&&!SCOPE.filter){ const sh=EPH.shadow(jd); if(sh.sep<sh.pe+sh.rm){ const a=proj(eqv(MP.q.ra,MP.q.dec)), b=proj(eqv(sh.ra,sh.dec)), rd=MP.q.deg*pxd/2; if(a&&b&&MP.d<R+rd){ const sx=MP.p[0]+b[0]-a[0], sy=MP.p[1]+b[1]-a[1];
            g.save(); g.beginPath(); g.arc(MP.p[0],MP.p[1],rd,0,7); g.clip(); g.fillStyle='rgba(0,0,0,.3)'; g.beginPath(); g.arc(sx,sy,sh.pe*pxd,0,7); g.fill(); g.fillStyle='rgba(46,10,4,.86)'; g.beginPath(); g.arc(sx,sy,sh.um*pxd,0,7); g.fill(); g.restore();
            near.push(['eclipse:moon',{name:sh.mag>=1?'A TOTAL LUNAR ECLIPSE':sh.mag>0?'A PARTIAL LUNAR ECLIPSE':'THE MOON IN THE EARTH\'S OUTER SHADOW',about:sh.mag>0?`${Math.round(Math.min(1,sh.mag)*100)}% OF THE MOON IS IN THE EARTH'S SHADOW, LIT ONLY BY EVERY SUNRISE AND SUNSET ON EARTH AT ONCE.`:'A PENUMBRAL ECLIPSE: A FAINT SHADING ON ONE SIDE.',cat:'eclipse',grp:'move',tier:'s',hold:sh.mag>0},Math.max(0,MP.d-4)]); if(sh.mag>0&&MP.d<R)FIRSTS.mark('eclipse'); } } }
      if(MP&&SP&&SCOPE.filter){ const rs=SP.q.deg*pxd/2, rm=MP.q.deg*pxd/2, dd=Math.hypot(MP.p[0]-SP.p[0],MP.p[1]-SP.p[1]); if(dd<rs+rm){ g.fillStyle='#000'; g.beginPath(); g.arc(MP.p[0],MP.p[1],rm,0,7); g.fill();
          near.push(['eclipse:sun',{name:dd<Math.abs(rs-rm)?(rm>=rs?'A TOTAL SOLAR ECLIPSE':'AN ANNULAR SOLAR ECLIPSE'):'A PARTIAL SOLAR ECLIPSE',about:'THE MOON IS CROSSING THE FACE OF THE SUN.',cat:'eclipse',grp:'move',tier:'s',hold:true},Math.max(0,SP.d-4)]); if(SP.d<R)FIRSTS.mark('eclipse'); } }
      const C={g,jd,lst,cx,cy,R,w,h,fov,pxd,lim,day,cover,sunH,sun,t,r,u,proj,eqv,hv,near,dt}; for(const x of SCOPE.ext)if(x.draw)x.draw(C);
      g.filter='none';
      // the weather in the way, behind the rooftops
      if(cover>0||wet){ const off=(performance.now()/1000)*(Wx.wind||.2)*30; g.globalAlpha=cl(cover+wet,0,1)*(.4+.6*day+.25); const pat=g.createPattern(cloudC,'repeat'); g.translate(-off%256,0); g.fillStyle=pat; g.fillRect(cx-R+off%256-256,cy-R-256,2*R+512,2*R+512); g.setTransform(dpr,0,0,dpr,0,0); g.globalAlpha=1; }
      // the ground: the city's roofline below the horizon, its windows lit at night
      { const pts=[]; for(let i=-40;i<=40;i++){ const az=SCOPE.az+i*fov/40*1.6, hh=1.2+2.6*Math.abs(Math.sin(az*.37)*Math.sin(az*.11+1)), p=proj([cs(hh)*sn(az),sn(hh),cs(hh)*cs(az)]); if(p)pts.push(p); }
        if(pts.length>1&&pts.some(p=>p[1]<cy+R)){ g.fillStyle=`rgb(${Math.round(14+60*day)},${Math.round(14+58*day)},${Math.round(18+60*day)})`; g.beginPath(); g.moveTo(pts[0][0],h+R); for(const p of pts)g.lineTo(p[0],p[1]); g.lineTo(pts[pts.length-1][0],h+R); g.fill(); } }
      // the Sun burning in, the rim of the eyepiece
      const glare=SCOPE.filter?0:cl(1-(sunOff-fov/2)/6,0,1)*cl((sunH.alt+1)/2,0,1);
      if(glare>0){ g.fillStyle=`rgba(255,253,240,${glare})`; g.fillRect(0,0,w,h); }
      if(SCOPE.filter&&sunOff>fov){ g.fillStyle='rgba(0,0,0,1)'; g.fillRect(cx-R,cy-R,2*R,2*R); }
      g.restore(); const vg=g.createRadialGradient(cx,cy,R*.82,cx,cy,R); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.85)'); g.fillStyle=vg; g.beginPath(); g.arc(cx,cy,R,0,7); g.fill();
      if(SCOPE.mag>=4&&SCOPE.mag<10){ g.strokeStyle='rgba(255,90,60,.6)'; g.lineWidth=1; g.beginPath(); g.moveTo(cx-R,cy); g.lineTo(cx+R,cy); g.moveTo(cx,cy-R); g.lineTo(cx,cy+R); g.stroke(); }
      g.fillStyle='#d8c8a8'; g.font='12px Silkscreen,monospace'; g.textAlign='center';
      const nt=SCOPE.note&&SCOPE.note.t>performance.now()?SCOPE.note.s:''; if(nt)g.fillText(nt,cx,Math.min(h-10,cy+R+16)); else if(SCOPE.filter&&sunOff>fov/2)g.fillText('THE SOLAR FILTER IS ON: ONLY THE SUN SHOWS THROUGH IT',cx,Math.min(h-10,cy+R+16)); else if(blur>4)g.fillText('OUT OF FOCUS: TURN THE FOCUS',cx,Math.min(h-10,cy+R+16)); else if(glare>.6)g.fillText('THE SUN! NEVER WITHOUT A SOLAR FILTER.',cx,cy+R+16>h-6?h-10:cy+R+16); else if(wet>.15)g.fillText(Wx.snow>Wx.rain?'SNOW ON THE GLASS':'RAIN ON THE GLASS',cx,Math.min(h-10,cy+R+16)); else if(cover>.6)g.fillText('CLOUDED OVER',cx,Math.min(h-10,cy+R+16));
      // what is in the middle, and where the tube points
      near.sort((a,b)=>a[2]-b[2]); const c0=near[0]&&near[0][2]<R*.35?near[0]:null; SCOPE.centre=c0?c0[0]:null; SCOPE.centreObj=c0?c0[1]:null; SCOPE.near=near; SCOPE.glare=glare; SCOPE.lim=lim;
      const el=O.querySelector('#scoper'); if(el&&(SCOPE._rt=(SCOPE._rt||0)-dt)<=0){ SCOPE._rt=.25; const q=hor2eq(SCOPE.alt,SCOPE.az,lst), lt=CLK.hour(EPH.msOf(jd),null), f2=n=>String(Math.floor(n)).padStart(2,'0');
        let s=`ALT ${SCOPE.alt.toFixed(1)}° AZ ${SCOPE.az.toFixed(1)}°<br>RA ${f2(q.ra/15)}h ${f2(q.ra/15%1*60)}m DEC ${q.dec>=0?'+':'-'}${Math.abs(q.dec).toFixed(1)}°<br>LOCAL ${f2(lt)}:${f2(lt%1*60)} · SUN ${sunH.alt.toFixed(0)}°`;
        if(c0){ const [k,o]=c0, D=BODY[k]?(SCOPE.data.sky||[]).find(x=>x.id===BODY[k].id)||{}:o, nm=BODY[k]?BODY[k].name:o.name; s+=`<br><br><b>${esc(nm)}</b>${BODY[k]&&k!=='sun'?` · ${(BODY[k].km/(o.r*149597870.7)*R2D*3600).toFixed(k==='moon'?0:1)}″${o.i>2?' · '+Math.round((1+Math.cos(o.i*D2R))*50)+'% LIT':''}${k==='sa'?' · RINGS TIPPED '+Math.abs(EPH.ring(jd)).toFixed(0)+'°':''}`:''}${D.about?'<br>'+esc(D.about):''}${D.credit?'<br><span style="opacity:.7">'+esc(D.credit)+'</span>':''}`; }
        el.innerHTML=s; } };

    let T0=0; SYS.add('places',()=>{ if(O.hidden)return; const n=performance.now(), dt=Math.min(.1,(n-last)/1000); last=n; draw(dt); },'150fd-scope view');
    return {open:()=>{ O.hidden=false; last=performance.now(); lastJD=null; SCOPE.focus=.18; SCOPE.filter=false; SCOPE.goto=null; if(!(SCOPE.lead&&SCOPE.lead(0)))aim(); panel(); for(const x of SCOPE.ext)if(x.open)x.open(); },close:()=>{ O.hidden=true; drag=null; keyV=[0,0]; for(const x of SCOPE.ext)if(x.close)x.close(); },starsIn,draw,panel,cv,O,P,radec,drop:k=>{ delete IM[k]; delete FE[k]; },FOV}; };

  let JP=null; SCOPE.json=()=>JP||(JP=SCOPEJ().then(d=>SCOPE.data=d));   // the index of the sky's targets and the globes, fetched once
  SCOPE.ready=async()=>{ if(window.LOAD)await LOAD('scope'); if(!SCOPE.view)SCOPE.view=make(); return SCOPE.astro; };   // the sky's sums, for the globes too
  SCOPE.open=async()=>{ await SCOPE.ready(); if(!SCOPE.stars){ const [S]=await Promise.all([STARS(),SCOPE.json()]); SCOPE.stars=S; SCOPE.view.starsIn(S); for(const D of SCOPE.data.doubles||[]){ let b=null, bd=.06; for(const q of S.s){ const d=Math.hypot((q[0]-D.ra)*Math.cos(D.dec*Math.PI/180),q[1]-D.dec); if(d<bd){ bd=d; b=q; } } if(b){ D.ra=b[0]; D.dec=b[1]; } } } SCOPE.view.open(); };
  SCOPE.close=()=>{ if(SCOPE.view)SCOPE.view.close(); };
  SCOPE.isOpen=()=>!!(SCOPE.view&&!document.getElementById('scopev').hidden);

  /* ---------- the telescope in your apartment: a wooden tripod, an alt-az fork, the brass tube that turns as you move it ---------- */
  for(const k of ['TELESCOPE'])ROOMK.always.add(k);   // in every apartment from the start (owner, 7 Nov 2026)
  ROOMK.parts.push(c=>{ '@apts'; const {part,mat,rbox,cap,cur,solid}=c, p=(geo,m,u,h,v,ry=0,par=cur(),cast=true)=>part(geo,m,u,h,v,ry,par,cast), keep=me=>{ me.userData.keep=1; return me; };
    const U0=.95, V0=c.Ly*(1-.22), HT=1.12;   // at the side wall's window nearest the back, looking out
    const wood=mat([126,84,46]), brass=mat([200,156,74]), brassD=mat([150,112,50]), black=mat([26,26,28]), glass=new THREE.MeshBasicMaterial({color:0x1a2a3a});
    cap('TELESCOPE',()=>{ const G=new THREE.Group(); G.position.set(U0,0,V0); cur().add(G);
      for(let i=0;i<3;i++){ const a=i*Math.PI*2/3+.5, L=new THREE.Mesh(new THREE.CylinderGeometry(.018,.014,HT*1.08,8),wood); L.position.set(Math.cos(a)*.22,HT/2-.04,Math.sin(a)*.22); L.rotation.set(-Math.sin(a)*.38,0,Math.cos(a)*.38,'XZY'); L.castShadow=true; G.add(L);
        p(new THREE.CylinderGeometry(.02,.02,.03,8),brassD,Math.cos(a)*.42,.015,Math.sin(a)*.42,0,G); }
      p(new THREE.CylinderGeometry(.06,.07,.06,16),brass,0,HT-.02,0,0,G); for(let i=0;i<3;i++){ const a=i*Math.PI*2/3+.5; p(new THREE.CylinderGeometry(.006,.006,.36,6).rotateZ(Math.PI/2).rotateY(-a),brassD,Math.cos(a)*.15,HT*.45,Math.sin(a)*.15,0,G); }
      const Y=new THREE.Group(); Y.position.set(0,HT+.01,0); Y.userData.yaw=1; G.add(Y);
      keep(p(new THREE.CylinderGeometry(.05,.05,.03,16),brassD,0,.015,0,0,Y)); for(const s of [-1,1])keep(p(rbox(.02,.2,.05,.006),black,s*.07,.11,0,0,Y));
      const A=new THREE.Group(); A.position.set(0,.18,0); A.userData.alt=1; Y.add(A);
      keep(p(new THREE.CylinderGeometry(.042,.042,.9,20).rotateX(Math.PI/2),brass,0,0,.06,0,A)); keep(p(new THREE.CylinderGeometry(.052,.048,.2,20,1,true).rotateX(Math.PI/2),brassD,0,0,.6,0,A));
      keep(p(new THREE.CircleGeometry(.04,18),glass,0,0,.52,0,A,false)); keep(p(new THREE.CylinderGeometry(.046,.046,.02,20).rotateX(Math.PI/2),black,0,0,.5,0,A));
      for(const z of [-.12,.22])keep(p(new THREE.TorusGeometry(.046,.006,6,20),black,0,0,z,0,A));
      keep(p(new THREE.CylinderGeometry(.022,.022,.12,12).rotateX(Math.PI/2),black,0,0,-.44,0,A)); keep(p(rbox(.05,.05,.05,.008),black,0,.02,-.52,0,A)); keep(p(new THREE.CylinderGeometry(.016,.014,.08,12),black,0,.08,-.52,0,A));
      keep(p(new THREE.CylinderGeometry(.013,.013,.26,10).rotateX(Math.PI/2),brassD,.06,.06,.0,0,A)); keep(p(new THREE.CircleGeometry(.011,10),glass,.06,.06,.131,0,A,false));
      for(const s of [-1,1])keep(p(new THREE.CylinderGeometry(.012,.012,.03,10).rotateZ(Math.PI/2),brassD,s*.052,0,0,0,A));
      solid(U0-.3,V0-.3,U0+.3,V0+.3,.2); },{wire:'scope',bake:true}); });
  ROOMK.wires.scope=(un,c)=>{ '@later'; let Y=null, A=null; un.obj.traverse(o=>{ if(o.userData.yaw)Y=o; if(o.userData.alt)A=o; });
    c.hit(un,()=>'TELESCOPE',()=>{ SCOPE.open(); if(SFX)SFX.play('click',{vol:.5,vary:.2}); });
    un.tick=()=>{ if(Y)Y.rotation.y=-Math.PI/2-(SCOPE.az-270)*Math.PI/180; if(A)A.rotation.x=-Math.max(-5,SCOPE.alt)*Math.PI/180; }; };
  SYS.add('places',()=>{ if(SCOPE.view&&SCOPE.isOpen()&&!SCOPE.site.field&&!SCOPE.carried&&!(MODS.apts&&MODS.apts.inReal))SCOPE.close(); },'150fd-scope');
}
export {SCOPE};
