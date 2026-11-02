// THE NEWSSTAND: NEWS builds the newsstand by the subway stairs, kept by the cat.
import {SHARED, THREE} from './003-shx.js';
import {CITY, CIVIC, CLOCK, DRONE, LINES, pos, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, MAPSTAIR, QS, SOL, SYS, TILE} from './006-map-pre.js';
import {TOONS} from './084-npc-toons.js';
const NEWS=window.NEWS={};
NEWS.init=()=>{ if(NEWS._d)return; if(typeof SHARED.BOD==='undefined')return; const N=TOONS.cat; if(!N){ setTimeout(NEWS.init,600); return; } NEWS._d=1;   // the cat (data/raincat.json) loads just after the start; wait for it, build once
  const X=SHARED.BOD.XS, Y=z=>SHARED.BOD.YS(z*.64), Z=SHARED.BOD.ZS, T=TILE, xm=(MAPSTAIR.x0+MAPSTAIR.x1)/2-6, x0=xm-1.4, x1=xm+1.4, y1=-74.85, y0=y1-1.5;
  const STEEL=0x5c6268, DARK=0x22262a, WOOD=0x8a6440, PAPER=0xe6e2d6, TW=0xa8844e;
  const BX=[]; const box=(a,b,c,d,z0,z1,col,L=BX,r=0)=>{ L.push([(X(a)+X(b))/2,(Y(z0)+Y(z1))/2,(Z(c)+Z(d))/2,Math.abs(X(b)-X(a)),Y(z1)-Y(z0),Math.abs(Z(d)-Z(c)),col,r]); };
  const rnd=(()=>{ let t=11; return ()=>{ t=(t*16807)%2147483647; return t/2147483647; }; })();
  const bundle=(bx,by,bz,h,r=0,w=.5,d=.36)=>{ const tone=[0xe6e2d6,0xdcd5c2,0xece8dc,0xd2cbb6][Math.floor(rnd()*4)]; box(bx-w/2,bx+w/2,by-d/2,by+d/2,bz,bz+h,tone,BX,r);
    box(bx-.03,bx+.03,by-d/2-.01,by+d/2+.01,bz,bz+h+.3,TW,BX,r); box(bx-w/2-.01,bx+w/2+.01,by-.03,by+.03,bz,bz+h+.3,TW,BX,r);
    box(bx-w/2+.03,bx+w/2-.01,by-d/2+.02,by+d/2-.01,bz+h,bz+h+.4,0xf0ece2,BX,r+(rnd()-.5)*.35); box(bx-w*.3,bx+w*.3,by-d/2+.04,by-d/2+.08,bz+h*.55,bz+h*.8,[0xc8322a,0x2e5aa8,0x202428,0xe8a020][Math.floor(rnd()*4)],BX,r); };
  { const px0=x0-.95, px1=x0-.15, py0=y1-1.15, py1=y1+.25; for(const u of [.1,.5,.9])box(px0+(px1-px0)*u-.05,px0+(px1-px0)*u+.05,py0,py1,0,2.2,0x6a5238);
    for(let k=0;k<5;k++){ const a=py0+k*(py1-py0)/5+.02; box(px0-.02,px1+.02,a,a+(py1-py0)/5-.06,2.2,3.4,[0x9c7e58,0x8e7250,0xa88a62][k%3]); } }
  box(xm-.45,xm+.45,y1-1.15,y1-.5,0,16,WOOD); for(const z of [5,10.5])box(xm-.46,xm+.46,y1-1.16,y1-.49,z,z+.6,0x5a4028); box(xm-.47,xm+.47,y1-1.17,y1-.48,15.4,16.2,0x7a5636);
  for(const [bx,by,bz,h,r] of [[x0+.45,y0+.4,0,10,.06],[x0+.47,y0+.42,10.4,9,-.1],[x1-.45,y0+.4,0,11,.12],[x1-.95,y0+.42,0,8,-.05]])bundle(bx,by,bz,h,r);
  box(x1-.6,x1-.3,y0+.32,y0+.48,11.7,14.2,0x8a3a2a,BX,.3);
  { const cx0=x1+.08, cx1=x1+.56, cy0=y1+.08, cy1=y1+.5, R=0x2a5a9a; box(cx0,cx1,cy0,cy0+.04,0,9,R); box(cx0,cx1,cy1-.04,cy1,0,9,R); box(cx0,cx0+.04,cy0,cy1,0,9,R); box(cx1-.04,cx1,cy0,cy1,0,9,R); box(cx0,cx1,cy0,cy1,0,.8,0x204a80);
    for(const z of [3,6])box(cx0-.005,cx1+.005,cy0-.005,cy1+.005,z,z+.9,0x1c3e6a); bundle((cx0+cx1)/2,(cy0+cy1)/2,9,7,-.15,.44,.34); box(cx0+.12,cx1-.1,cy0+.12,cy1-.12,16.7,19,0x8a3a2a,BX,.5); }
  box(x0-.3,x0+.1,y1+.9,y1+1.15,0,.2,0xe2dccc,BX,.7); box(x1+.2,x1+.5,y1+1.3,y1+1.5,0,.2,0xd8d0bc,BX,-.4);
  const TITLES=[['THE DAILY ODDITY',0xc8322a,1],['METRO HERALD',0x2e5aa8,1],['THE FLEA TIMES',0x202428,2],['MORNING BUGLE',0xe8a020,1]];
  const TIER=[[y1,y1+.22,22],[y1+.22,y1+.44,13],[y1+.44,y1+.66,4]];
  for(const lx of [x0+.2,xm,x1-.24])for(const [ly,lz] of [[y1+.01,23.2],[y1+.62,5.2]])box(lx,lx+.04,ly,ly+.04,0,lz,STEEL);
  box(x0+.2,x1-.2,y1+.01,y1+.05,1,1.6,STEEL); box(x0+.2,x1-.2,y1+.62,y1+.66,1,1.6,STEEL);
  TIER.forEach(([a,b,z])=>{ box(x0+.2,x1-.2,a,b,z,z+.5,0x3a3f44); for(let k=0;k<3;k++)box(x0+.2,x1-.2,a+k*.08,a+k*.08+.03,z+.5,z+1.2,STEEL); box(x0+.2,x1-.2,b-.03,b,z+1.2,z+3.4,STEEL); for(const lx of [x0+.2,x1-.24])box(lx,lx+.04,a,b,z-6,z,STEEL); });
  const geo=new THREE.BoxGeometry(1,1,1), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), V=THREE.Vector3, col=new THREE.Color(), eu=new THREE.Euler();
  const inst=(L,mat)=>{ const M=new THREE.InstancedMesh(geo,mat,Math.max(1,L.length)); L.forEach(([x,y,z,sx,sy,sz,c,r],i)=>{ M.setMatrixAt(i,m4.compose(new V(x,y,z),q.setFromEuler(eu.set(0,r||0,0)),new V(sx,sy,sz))); M.setColorAt(i,col.setHex(c)); }); M.count=L.length; return M; };
  const lam=new THREE.MeshLambertMaterial({color:0xffffff}), body=inst(BX,lam);
  body.castShadow=body.receiveShadow=true; scene.add(body);
  const STK=new THREE.InstancedMesh(geo,lam,36); STK.castShadow=true; scene.add(STK);
  const stock={papers:[40,40,30,25]};
  const stacks=()=>{ let n=0; const put=(x,y,z,sx,sy,sz,r,c)=>{ STK.setMatrixAt(n,m4.compose(new V(x,y,z),q.setFromEuler(eu.set(0,r,0)),new V(sx,sy,sz))); STK.setColorAt(n++,col.setHex(c)); };
    TIER.forEach(([ya,yb,zt],t)=>TITLES.forEach(([nm,c],i)=>{ const w=(x1-x0-.5)/4, a=x0+.25+i*w, k=Math.max(0,Math.min(15,stock.papers[i]-t*15)), h=Math.max(.3,k*.45), b=ya+.03, d=yb-ya-.06, top=zt+1.2, r=Math.sin(i*3.1+t*1.7)*.07, cx=X(a+w/2), cz=Z(b+d/2), sx=Math.abs(X(a+w-.06)-X(a)), sz=Math.abs(Z(b+d)-Z(b));
      if(!k){ put(cx,Y(top),cz,.001,.001,.001,0,DARK); put(cx,Y(top),cz,.001,.001,.001,0,DARK); put(cx,Y(top),cz,.001,.001,.001,0,DARK); return; }
      put(cx,Y(top+h/2),cz,sx,Y(h)-Y(0),sz,r,PAPER); put(cx,Y(top+h+.25),cz+sz*.08,sx*.96,Y(.5)-Y(0),sz*.84,r+Math.sin(i*5+t)*.12,0xf2eee4); put(cx,Y(top+h+.55),cz-sz*.1,sx*.9,Y(.12)-Y(0),sz*.3,r+Math.sin(i*5+t)*.12,c); }));
    STK.instanceMatrix.needsUpdate=true; STK.instanceColor.needsUpdate=true; };
  stacks();
  const SH=new THREE.InstancedMesh(geo,lam,8); scene.add(SH); let shut=1;
  const shutter=o=>{ shut=o; const n=Math.round(o*8); for(let i=0;i<8;i++){ const ya=y1+i*.66/8-.02, zt=i<3?28:i<5?19:10; SH.setMatrixAt(i,m4.compose(new V(X(xm),Y(zt),Z(ya+.05)),q.setFromEuler(eu.set(0,0,0)),new V(Math.abs(X(x1-.12)-X(x0+.12)),Y(1)-Y(0),Math.abs(Z(.12)-Z(0))))); SH.setColorAt(i,col.setHex(i&1?0x2c5486:0x34609a)); }
    SH.count=n; SH.instanceMatrix.needsUpdate=true; SH.instanceColor.needsUpdate=true; SH.visible=n>0; };
  const BU=new THREE.InstancedMesh(geo,lam,12); BU.count=0; BU.castShadow=true; scene.add(BU); const bundles=[];
  const bspot=k=>[x0-.55,y1-.4-(k>>1)*.5+.1,3.4+(k&1)*11];
  const drawB=()=>{ '@later'; let n=0; for(const b of bundles){ const [bx,by,bz]=b.at, w=.5, d=.36;
      const put=(a,b2,c,d2,z0,z1,cc)=>{ BU.setMatrixAt(n,m4.compose(new V((X(a)+X(b2))/2,(Y(z0)+Y(z1))/2,(Z(c)+Z(d2))/2),q,new V(Math.abs(X(b2)-X(a)),Y(z1)-Y(z0),Math.abs(Z(d2)-Z(c))))); BU.setColorAt(n,col.setHex(cc)); n++; };
      put(bx-w/2,bx+w/2,by-d/2,by+d/2,bz,bz+10,PAPER); put(bx-.03,bx+.03,by-d/2-.01,by+d/2+.01,bz,bz+10.4,0x9a7040); put(bx-w/2-.01,bx+w/2+.01,by-.03,by+.03,bz,bz+10.4,0x9a7040); }
    BU.count=n; if(n){ BU.instanceMatrix.needsUpdate=true; BU.instanceColor.needsUpdate=true; } };
  const sol=(a,b,c,d,h)=>{ const r=[Math.min(X(a),X(b)),Math.min(Z(c),Z(d)),Math.max(X(a),X(b)),Math.max(Z(c),Z(d))]; SOL.up.push(r); FIX.up.push([r[0],r[1],0,r[2],r[3],Y(h)]); };
  sol(x0-.95,x1+.56,y0,y1+.66,26);
  const DR=[0,1].map(i=>{ const {D:g}=DRONE.mk({s:1,parcel:false}), m=c=>new THREE.MeshLambertMaterial({color:c}), bx=(w,h,d,mm)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mm);
    const line=bx(.01,.5,.01,m(0x9a7040)); line.position.y=-.3; g.add(line); const load=bx(.5*T*.9,Y(10)-Y(0),.36*T*.9,m(PAPER)); load.position.y=-.6; g.add(load); g.userData.load=load;
    g.visible=false; scene.add(g); return {g,legs:[],carry:0}; });
  const fly=(d,k)=>{ const s=[bspot(k*2),bspot(k*2+1)], home=new V(X(x1+60),Y(420),Z(y1+2+k*2)); d.g.position.copy(home); d.g.visible=true; d.carry=2; d.legs=[];
    for(let j=0;j<2;j++){ const [bx,by,bz]=s[j], over=new V(X(bx),Y(260),Z(by)), down=new V(X(bx),Y(bz+10)+.75,Z(by)); d.legs.push([over,6],[down,2],['drop',[bx,by,bz]],['wait',.6],[over,2.5]); }
    d.legs.push([home,6],['gone']); };
  const FK=+(QS.get("newsk")||1), flyTick=dt=>{ dt*=FK; for(const d of DR){ if(!d.g.visible)continue; const L=d.legs[0]; if(!L){ d.g.visible=false; continue; }
    if(L[0]==='gone'){ d.g.visible=false; d.legs=[]; continue; }
    if(L[0]==='drop'){ bundles.push({at:L[1],t:CLOCK.h}); drawB(); d.carry--; d.g.userData.load.visible=d.carry>0; d.legs.shift(); continue; }
    if(L[0]==='wait'){ if((L[1]-=dt)<=0)d.legs.shift(); }
    else { const v=new V().subVectors(L[0],d.g.position), l=v.length(), s=L[1]*dt; if(l<=s){ d.g.position.copy(L[0]); d.legs.shift(); } else d.g.position.addScaledVector(v,s/l); d.g.rotation.x=v.y>-.1&&Math.hypot(v.x,v.z)>.1?.15:0; d.g.rotation.y=Math.atan2(v.x,v.z); }
    } };
  const ACT={serve:1.6,change:2,wave:2,stack:2.6,cut:1.8,arrange:3,stretch:3,open:2.6,close:2.6,doze:1e9,yawn:2.2};
  let sold=0, act=null, queue=[], idleT=12, waved=false, napT=0;
  const doAct=(n,then)=>queue.push({n,d:ACT[n],t:0,then});
  const cat=N.rig; N.home={x:X(xm),z:Z(y1-.82)};
  N.st.hold=true; N.st.to=null; N.st.x=X(xm); N.st.z=Z(y1-.82); N.key==='raincat'&&(N.life=null);
  const hold=st=>{ st.to=null; st.hold=true; st.x=X(xm); st.z=Z(y1-.82); st.face={x:X(xm),z:Z(y1+4)}; }, tk=N.tick; N.tick=(dt,you)=>{ hold(N.st); tk(dt,you); hold(N.st); };
  cat.extra=(c,dt,r)=>{ const B=c.B; B.root.position.y+=.36;
    if(!act){ act=queue.shift()||null; if(act&&act.n==='doze')act.d=ACT.doze; }
    c.busy=!!act&&act.n!=='doze'; if(!act)return;
    const t=act.t+=dt, u=Math.min(1,t/act.d), e=Math.sin(Math.PI*u), n=act.n;
    if(n==='serve'){ B.armR.rotation.x=-1.55*e; B.armL.rotation.x=-.5*e; B.hips.rotation.x=.14*e; B.head.rotation.x=.12*e; }
    if(n==='change'){ B.armL.rotation.x=-1.1*e; B.armR.rotation.x=-1.15*e; B.armL.rotation.z=(.25+Math.sin(t*15)*.07)*e; B.armR.rotation.z=(-.25+Math.sin(t*15+1.5)*.07)*e; B.head.rotation.x=.4*e; }
    if(n==='wave'){ const k=Math.min(1,e*3); B.armR.rotation.z=2.5*k; B.armR.rotation.x=Math.sin(t*12)*.35*k; B.head.rotation.z=-.15*k; }
    if(n==='stack'){ B.hips.rotation.x=.6*e; B.armL.rotation.x=-.9*e; B.armR.rotation.x=-.9*e; B.armL.rotation.z=.3*e; B.armR.rotation.z=-.3*e; B.head.rotation.x=.25*e; B.root.position.y-=.06*e; }
    if(n==='cut'){ B.hips.rotation.x=.35*e; B.armL.rotation.x=-1.2*e; B.armR.rotation.x=-1.25*e; B.armR.rotation.y=Math.sin(t*16)*.35*e; B.head.rotation.x=.4*e; }
    if(n==='arrange'){ const s=Math.sin(u*Math.PI*2); B.hips.rotation.y=.75*s*e; B.armR.rotation.x=-2*Math.max(0,s)*e; B.armL.rotation.x=-2*Math.max(0,-s)*e; B.head.rotation.y=.5*s*e; }
    if(n==='stretch'||n==='yawn'){ B.armL.rotation.x=-2.9*e; B.armR.rotation.x=-2.9*e; B.armL.rotation.z=-.35*e; B.armR.rotation.z=.35*e; B.head.rotation.x=-.35*e; B.hips.rotation.x=-.08*e; }
    if(n==='open'||n==='close'){ const k=Math.min(1,e*2.5), pull=n==='open'?u:1-u; B.armL.rotation.x=-(2.9-1.2*pull)*k; B.armR.rotation.x=-(2.9-1.2*pull)*k; B.head.rotation.x=-.25*k; shutter(n==='open'?1-u:u); }
    if(n==='doze'){ const k=Math.min(1,t*.8); B.head.rotation.x=(.5+Math.sin(t*1.3)*.05)*k; B.hips.rotation.x=.06*k; B.armL.rotation.x=-.3*k; B.armR.rotation.x=-.3*k; B.root.position.y-=.03*k; }
    if(u>=1){ const f=act.then; act=null; if(f)f(); } };
  const wake=()=>{ if(act&&act.n==='doze')act=null; };
  const isOpen=h=>h>=5.75&&h<22;
  shutter(isOpen(CLOCK.h)?0:1); if(!isOpen(CLOCK.h))doAct('doze');
  let lastH=CLOCK.h, day=-1;
  const passed=(a,h)=>lastH<=h?(a>lastH&&a<=h):(a>lastH||a<=h);
  const work=()=>{
    const b=bundles[0]; if(!b||!isOpen(CLOCK.h))return; doAct('stack',()=>{ doAct('cut',()=>{ bundles.shift(); drawB(); const i=TITLES.reduce((m,_,k)=>stock.papers[k]<stock.papers[m]?k:m,0); stock.papers[i]+=25; stacks(); work(); }); }); };
  SYS.add('life',(dt)=>{ const h=CLOCK.h;
    if(passed(5.5,h)){ DR.forEach((d,k)=>fly(d,k)); stock.papers=stock.papers.map(v=>Math.floor(v*.2)); stacks(); }
    if(passed(5.75,h)){ wake(); queue=[]; doAct('yawn'); doAct('open'); }
    if(passed(22,h)){ wake(); queue=[]; doAct('close',()=>doAct('doze')); }
    lastH=h; flyTick(dt);
    if(isOpen(h)&&!act&&!queue.length){
      if(bundles.length&&shut<.1){ work(); }
      else { const d=Math.hypot(pos.x-X(xm),pos.z-Z(y1+1)); if(d<3.2*T&&!waved&&SHARED.LVL!=='down'){ waved=true; doAct('wave'); } else if(d>5*T)waved=false;
        if((idleT-=dt)<=0){ idleT=14+Math.random()*22; const lull=h>13&&h<15.5&&Math.random()<.5; if(lull){ napT=20+Math.random()*30; doAct('doze'); } else doAct(Math.random()<.6?'arrange':'stretch'); } } }
    if(act&&act.n==='doze'&&isOpen(h)&&napT>0&&(napT-=dt)<=0)act=null; },'147-newsstand');
  const purse=DRONE.purse||{get:()=>0,add:()=>{}};
  const ITEMS=TITLES.map(([n,,p],i)=>({n,p,k:'papers',i}));
  const left=it=>it.k==='papers'?stock.papers[it.i]:stock[it.k];
  const HEAD=[['FIREBALL SCORCHES PARK BENCH','dragons blamed; the city shrugs'],['BODEGA FOX DENIES PRICE HIKE','"a dollar is a dollar," he says'],['SKELETON GUARDS SEE OFF TROUBLEMAKERS','three hooded figures flee down the subway stairs'],
    ['MUSHROOM STALL A HIT AT THE PARK GATE','the seller is said to be "very calm"'],['METRO RUNS ON TIME, MOSTLY','riders surprised'],['CASTLE FOUND TO BE HALF SIZE','built for the woodland folk, the mayor explains']];
  const front=i=>{ '@later'; const d=(window.CITY&&CITY.day)||0, w=null, a=HEAD[(d*3+i)%HEAD.length], b=HEAD[(d*3+i+2)%HEAD.length];
    return `<div class="np"><div class="nh" style="border-color:#${TITLES[i][1].toString(16).padStart(6,'0')}">${TITLES[i][0]}</div><div class="nd">DAY ${d+1} · 25¢ MORE THAN YESTERDAY${w?' · '+String(w).toUpperCase():''}</div><b>${a[0]}</b><p>${a[1]}</p><b class="s">${b[0]}</b><p>${b[1]}</p></div>`; };
  const css=document.createElement('style'); css.textContent='#nsp{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(420px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow:auto;font:12px var(--pixel,monospace);color:#e8e2c8;background:#18241c;border:2px solid #4c7a58;padding:14px 16px 12px;z-index:16;user-select:none}#nsp h3{margin:0 0 6px;font-size:13px}#nsp .row{display:flex;gap:8px;align-items:center;margin:3px 0}#nsp .it{flex:1}#nsp .sec{margin:8px 0 2px;color:#9cc8a4}#nsp .st{margin-top:8px;color:#f0d890;min-height:1em}#nsp .np{background:#eee8d8;color:#222;padding:8px 10px;margin-top:8px}#nsp .nh{font-size:15px;border-bottom:3px solid;margin-bottom:4px}#nsp .nd{font-size:10px;margin-bottom:6px}#nsp .np p{margin:2px 0 6px}#nsp .s{font-size:11px}';
  document.head.appendChild(css); const P=document.createElement('div'); P.id='nsp'; P.hidden=true; P.setAttribute('role','dialog'); P.setAttribute('aria-label','Newsstand'); document.body.appendChild(P);
  const draw=(msg='',page='')=>{ '@later'; const open=isOpen(CLOCK.h), sec={papers:'NEWSPAPERS'}; let last='';
    P.innerHTML=`<h3>THE NEWSSTAND · THE CAT IN THE RAINCOAT</h3><div>${open?'OPEN 5:45 TO 10 PM':'CLOSED. OPENS AT 5:45 AM'} · YOU HAVE $${purse.get()}</div>`+ITEMS.map((it,i)=>{ const s=sec[it.k]!==last?`<div class="sec">${sec[it.k]}</div>`:''; last=sec[it.k]; const l=left(it);
      return s+`<div class="row"><span class="it">${it.n}</span><span>${l} LEFT</span><span>$${it.p}</span><button class="btn" data-i="${i}" ${open&&l>0?'':'disabled'}>BUY</button></div>`; }).join('')+`<div class="st">${msg}</div>${page}<div class="row" style="margin-top:8px"><button class="btn" id="nsx">CLOSE</button></div>`;
    P.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{ const it=ITEMS[+b.dataset.i]; if(purse.get()<it.p){ draw('NOT ENOUGH MONEY.'); return; } if(left(it)<=0){ draw('SOLD OUT.'); return; }
      purse.add(-it.p); if(it.k==='papers'){ stock.papers[it.i]--; stacks(); } else stock[it.k]--; if(window.CIVIC&&CIVIC.note)CIVIC.note('you bought '+it.n.toLowerCase()+' at the newsstand ($'+it.p+')','newsstand');
      wake(); queue=[]; act=null; doAct('serve',()=>doAct('change')); if(LINES.say)try{ LINES.say(N,'thanks'); }catch(e){}
      draw('THANK YOU. ENJOY YOUR '+it.n+'.',it.k==='papers'?front(it.i):''); });
    P.querySelector('#nsx').onclick=()=>{ P.hidden=true; }; };
  const FRONT={x:X(xm),z:Z(y1+1.15)}; NEWS.front=FRONT;
  NEWS.open=()=>{ draw(); P.hidden=false; if(isOpen(CLOCK.h)&&!act){ doAct('wave'); } };
  const hb=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(X(x1)-X(x0)),Y(30)-Y(0),Math.abs(Z(y1)-Z(y0))),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(X(xm),(Y(30)+Y(0))/2,(Z(y0)+Z(y1))/2); scene.add(hb);
  UI.thing({name:'NEWSSTAND',obj:hb,reach:1.6*T,near:3*T,tall:1.2*T,act:NEWS.open});
  NEWS.stock=stock; NEWS.bundles=bundles; NEWS.deliver=()=>DR.forEach((d,k)=>fly(d,k));
  window.NEWSCLK=(h,s)=>{ if(h!=null)CLOCK.h=h; if(s!=null){ CLOCK.run=true; CLOCK.speed=s; } return CLOCK.h; }; window.NEWSDBG=()=>({h:+CLOCK.h.toFixed(2),sold,act:act&&act.n,queue:queue.map(a=>a.n),shut:+shut.toFixed(2),bundles:bundles.length,stock:JSON.parse(JSON.stringify(stock)),drones:DR.map(d=>d.g.visible?d.g.position.toArray().map(v=>+v.toFixed(1)):null),at:[+X(xm).toFixed(2),+Z(y1+2).toFixed(2)]}); };
export {NEWS};
