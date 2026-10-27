// THE TRAINS: TRAINS runs the loop's two trains on the timetable (from the clock, so everyone sees the same train), carries whoever rides, and keeps the stations' boards and the cars' next-stop signs.
import {SHARED, THREE} from './003-shx.js';
import {LEVELS, pos, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {grab, LAMPD, LAMPI, lamps, QS, SYS, TILE, ZU} from './006-map-pre.js';
import {LOOP} from './009b-loop.js';
const TRAINS=window.TRAINS={list:[],skew:0};
await grab('trains',async()=>{ const M=SHARED.METRO, L=LOOP, D=L.D, T=TILE, CARL=22.4, CW=1.8, CWI=1.45, GAP=.6, DOORS=[-5.9,0,5.8], DWH=.62, FLOOR=13;
  const mod=(a,n)=>((a%n)+n)%n, V=D.speed, A=D.accel, ta=V/A, da=V*V/(2*A);
  const runT=d=>d>=2*da?d/V+ta:2*Math.sqrt(d/A), runS=(d,t)=>{ const Tt=runT(d); if(t<=0)return 0; if(t>=Tt)return d; if(d>=2*da){ if(t<ta)return .5*A*t*t; if(t<Tt-ta)return da+V*(t-ta); return d-.5*A*(Tt-t)**2; } return t<Tt/2?.5*A*t*t:d-.5*A*(Tt-t)**2; };
  TRAINS.now=()=>Date.now()/1000+TRAINS.skew;
  { const q=QS.get('traint'); if(q!=null&&q!=='')TRAINS.skew=+q-Date.now()/1000; }

  // the timetable: from A round the loop, 60 s at every station, the runs between them at the trains' speed
  D.trains.forEach((t,ti)=>{ const tr=L.TRK[t.track], Lt=tr.L, stops=L.order(t), i0=stops.findIndex(s=>s.old), seq=stops.slice(i0).concat(stops.slice(0,i0)), tbl=[]; let tm=0;
    seq.forEach((st,i)=>{ const nx=seq[(i+1)%seq.length], d=mod(t.dir*(nx.s[t.track]-st.s[t.track]),Lt), Tr=runT(d); tbl.push({st,nx,arr:tm,dep:tm+D.dwell,d,T:Tr}); tm+=D.dwell+Tr; });
    TRAINS.list.push({...t,i:ti,tr,tbl,lap:tm,off:ti*tm/2,cars:[]}); });
  const state=(tn,now=TRAINS.now())=>{ const t=mod(now-tn.off,tn.lap); for(const e of tn.tbl){ if(t<e.dep)return {s:e.st.s[tn.track],doors:true,at:e.st,next:e.nx,left:e.dep-t};
      if(t<e.dep+e.T)return {s:e.st.s[tn.track]+tn.dir*runS(e.d,t-e.dep),doors:false,at:null,from:e.st,next:e.nx,left:e.dep+e.T-t}; } const e=tn.tbl[0]; return {s:e.st.s[tn.track],doors:true,at:e.st,next:e.nx,left:0}; };
  const until=(tn,st,now=TRAINS.now())=>{ const t=mod(now-tn.off,tn.lap), e=tn.tbl.find(q=>q.st===st); if(t>=e.arr&&t<e.dep)return {now:true,left:e.dep-t}; return {now:false,left:mod(e.arr-t,tn.lap)}; };
  TRAINS.state=state; TRAINS.until=until;

  // the cars: the old graffiti car (M.car) twice per train, a floor, seats, poles and a light inside, doors that open dark
  const inM=new THREE.MeshLambertMaterial({color:0x6d7276}), seatM=new THREE.MeshLambertMaterial({color:0xc58a2a}), poleM=new THREE.MeshLambertMaterial({color:0xc9ccd0}), stripM=new THREE.MeshBasicMaterial({color:0xfff6e0}), doorM=new THREE.MeshBasicMaterial({color:0x07080a,side:THREE.DoubleSide});
  const box=(G,w,h,d,x,y,z,m)=>{ const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); b.position.set(x,y,z); G.add(b); return b; };
  const font=(g,px,w=800)=>{ g.font=w+' '+px+'px "Helvetica Neue",Helvetica,Arial,sans-serif'; };
  for(const tn of TRAINS.list){ const cv=document.createElement('canvas'); cv.width=512; cv.height=64; const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; tn.sign={cv,tx,last:''};
    const sm=new THREE.MeshBasicMaterial({map:tx});
    for(let c=0;c<2;c++){ const G=new THREE.Group(), shell=M.car(tn.i*7+c*3+1,c===0), inner=new THREE.Group(), z=k=>k*ZU, HL=CARL/2*T;
      G.add(shell); G.add(inner);
      box(inner,CARL*T-.2,z(2),CWI*2*T,0,z(45),0,inM);
      for(const s of [-1,1]){ for(const [a,b] of [[-HL+.6,-6.6*T],[-5.2*T,-.7*T],[.7*T,5.1*T],[6.5*T,HL-.6]])box(inner,b-a,z(14),.5*T,(a+b)/2,z(52),s*(CWI-.25)*T,seatM); }
      for(let k=-9;k<=9;k+=4.5)box(inner,.08*T,z(70),.08*T,k*T,z(82),0,poleM);
      box(inner,CARL*T-1,z(1),.1*T,0,z(115),0,stripM);
      for(const e of [-1,1]){ const me=new THREE.Mesh(new THREE.PlaneGeometry(2.6*T,z(10)),sm); me.position.set(e*(HL-.08),z(104),0); me.rotation.y=e>0?-Math.PI/2:Math.PI/2; inner.add(me); }
      const doors=[]; for(const s of [-1,1])for(const m of DOORS){ const d=new THREE.Mesh(new THREE.PlaneGeometry(DWH*2*T,z(66)),doorM); d.position.set(m*T,z(81),s*(CW+.02)*T); d.visible=false; G.add(d); doors.push(d); }
      scene.add(G); tn.cars.push({G,shell,inner,doors,c}); }
    const Lt=new THREE.PointLight(new THREE.Color(1,.95,.82),LAMPI*.7,9*T,LAMPD); Lt.userData.i0=Lt.intensity; scene.add(Lt); lamps.push(Lt); tn.light=Lt; }
  LEVELS.of.station.groups.push('trains');

  // each frame: where the cars are (centre, along, across in world units), from where the train is on its track
  const place=(tn,now)=>{ const S=state(tn,now), tr=tn.tr; tn.S=S;
    tn.cars.forEach((car,c)=>{ const sc=S.s+tn.dir*(c?-1:1)*(CARL+GAP)/2, a=tr.pt(sc-tn.dir*CARL/2), b=tr.pt(sc+tn.dir*CARL/2), x=(L.WX(a.x)+L.WX(b.x))/2, zz=(L.WZ(a.y)+L.WZ(b.y))/2;
      let ux=L.WX(b.x)-L.WX(a.x), uz=L.WZ(b.y)-L.WZ(a.y); const l=Math.hypot(ux,uz)||1; ux/=l; uz/=l;
      car.p0=car.p||null; car.p={x,z:zz,ux,uz}; car.G.position.set(x,L.H(-32),zz); car.G.rotation.set(0,Math.atan2(-uz,ux),0);
      for(const d of car.doors)d.visible=S.doors; });
    const c0=tn.cars[0].p; tn.light.position.set(c0.x,L.H(70),c0.z); };
  const loc=(p,x,z)=>{ const dx=x-p.x, dz=z-p.z; return {a:dx*p.ux+dz*p.uz,v:-dx*p.uz+dz*p.ux}; }, wrl=(p,a,v)=>({x:p.x+a*p.ux-v*p.uz,z:p.z+a*p.uz+v*p.ux});
  const cars=()=>TRAINS.list.flatMap(tn=>tn.cars.map(c=>({tn,c})));
  const HL=CARL/2*T, HW=CW*T, HWI=CWI*T, R=.36;
  const inCar=(x,z)=>{ for(const {tn,c} of cars()){ if(!c.p)continue; const q=loc(c.p,x,z); if(Math.abs(q.a)<HL-.2&&Math.abs(q.v)<HWI)return {tn,c,q}; } return null; };
  L.under.push({inside:(x,z)=>!!inCar(x,z),ground:()=>L.H(FLOOR)});
  const atDoor=a=>DOORS.some(m=>Math.abs(a-m*T)<DWH*T-.15);
  const ride={c:null,tn:null}, STEP=2.2*T;
  const edges=tn=>{ const S=tn.S, k=tn.track, st=S.doors?S.at:null;
    if(tn.open&&tn.open!==st){ for(const e of tn.open.edge[k])e.box.splice(0,4,...e.keep); tn.open=null; }
    if(st&&!tn.open){ const us=[]; for(const car of tn.cars)for(const m of DOORS)us.push(st.ua(car.p.x+car.p.ux*m*T,car.p.z+car.p.uz*m*T).u);
      for(const e of st.edge[k])if(us.some(u=>e.u0<u+DWH+.2&&e.u1>u-DWH-.2))e.box.splice(0,4,1e7,1e7,1e7,1e7); tn.open=st; } };
  L.riding=()=>ride.tn?'TRAIN '+ride.tn.id+' '+(ride.tn.dir>0?'↻':'↺')+' '+ride.tn.way:null;
  TRAINS.ride=ride;
  const signText=(tn)=>{ const S=tn.S, k=S.doors?S.at.name+' · '+S.at.id+'|DOORS CLOSE IN '+Math.ceil(S.left)+' S':'NEXT STOP  '+S.next.name+' · '+S.next.id+'|'+(S.left<30?'ARRIVING':Math.ceil(S.left/60)+' MIN');
    if(tn.sign.last===k)return; tn.sign.last=k; const g=tn.sign.cv.getContext('2d'), w=512, h=64, [a,b]=k.split('|'); g.fillStyle='#050505'; g.fillRect(0,0,w,h); g.textBaseline='middle';
    font(g,26); g.fillStyle='#ffb347'; g.fillText(a,12,h/2); font(g,18,700); const tw=g.measureText(b).width; g.fillStyle=S.doors?'#7fd36b':'#e7685a'; g.fillText(b,w-tw-12,h/2); tn.sign.tx.needsUpdate=true; };
  let bt=0;
  SYS.add('places',dt=>{ const now=TRAINS.now(); for(const tn of TRAINS.list)place(tn,now);
    const down=SHARED.LVL==='down';
    if(!down){ ride.c=ride.tn=null; }
    else { if(ride.c&&ride.c.p0){ const q=loc(ride.c.p0,pos.x,pos.z), w=wrl(ride.c.p,q.a,q.v); pos.x=w.x; pos.z=w.z; }
      if(ride.c){ const q=loc(ride.c.p,pos.x,pos.z), S=ride.tn.S;
        if(Math.abs(q.a)>HL+2||Math.abs(q.v)>HW+2)ride.c=ride.tn=null;
        else { let out=null; if(S.doors&&atDoor(q.a)&&Math.abs(q.v)>HWI-R-.02){ const w=wrl(ride.c.p,q.a,Math.sign(q.v)*(STEP+R+.15)); if(M.ground(w.x,w.z)>L.H(-2))out=w; }
          if(out){ pos.x=out.x; pos.z=out.z; ride.c=ride.tn=null; }
          else { const a=Math.max(-HL+.6,Math.min(HL-.6,q.a)), v=Math.max(-HWI+R,Math.min(HWI-R,q.v)); if(a!==q.a||v!==q.v){ const w=wrl(ride.c.p,a,v); pos.x=w.x; pos.z=w.z; } } } }
      if(!ride.c)for(const {tn,c} of cars()){ if(!c.p)continue; const q=loc(c.p,pos.x,pos.z); if(Math.abs(q.a)>=HL+R)continue;
        const door=tn.S.doors&&atDoor(q.a), low=SHARED.py<L.H(-16);
        if((door&&Math.abs(q.v)<STEP+.12)||(low&&Math.abs(q.v)<HW+R)){ ride.c=c; ride.tn=tn; const w=wrl(c.p,q.a,Math.max(-HWI+R+.3,Math.min(HWI-R-.3,q.v))); pos.x=w.x; pos.z=w.z; break; }
        if(Math.abs(q.v)>=HW+R)continue; const w=wrl(c.p,q.a,Math.sign(q.v||1)*(HW+R)); pos.x=w.x; pos.z=w.z; } }
    for(const tn of TRAINS.list)edges(tn);
    const first=UI.view==='first'; for(const tn of TRAINS.list)for(const c of tn.cars)c.shell.visible=first||ride.tn!==tn;
    const ms=performance.now(); if(ms<bt)return; bt=ms+500; if(!down)return;
    if(ride.tn)signText(ride.tn);
    const h=L.here(pos.x,pos.z); if(h.d<40*T){ const st=h.st;
      L.board(st,TRAINS.list.map(tn=>{ const u=until(tn,st,now), nx=tn.tbl.find(e=>e.st===st).nx; return [tn.id,(tn.dir>0?'↻ ':'↺ ')+nx.name,u.now?'NOW':u.left<45?'ARRIVING':Math.ceil(u.left/60)+' MIN']; })); } },'009c-trains');
  });
