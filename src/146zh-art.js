// THE ART MUSEUM, FURNISHED: a guided tour of the first floor with ROSIE THE RED PANDA (she walks you from painting to painting and tells you about each), the floor plan at the information desk, where its staff and its visitors go.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INV, UI, VIT, WORKERS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {STORE, SYS} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
import {BODIES} from './111a-bodies.js';
const GALLERY={}; window.GALLERY=GALLERY;
{ const say=(t,c)=>SAY(t,c||'#f2c14e'), TM=.924, BOD=SHARED.BOD;   // a museum tile in metres
  FORAGE.add({names:{art_postcard:'A POSTCARD OF A PAINTING',art_print:'A PRINT OF A PAINTING',f_croissant:'A CROISSANT'},does:{f_croissant:()=>{ FORAGE.feed(.2); VIT.sta=Math.min(1,VIT.sta+.2); }}});
  const room=()=>(STORE.rooms||[]).find(r=>r.id==='art');
  const frameOf=S=>IKIT.frame({x0:S.B.x0,y0:S.B.y0,x1:S.B.x1,y1:S.B.y1});
  // where its people go (the inside is off the map): the curator at the information desk, the guides by the door and on the first floor, ROSIE by her tour sign; visitors before the walls' paintings, on the benches
  { const S=STORE.artFrame, R=room(); if(S&&R){ const F=frameOf(S), sp=(x,y,du,dv,h)=>{ const p=F.pw(x*TM,y*TM); return {x:p[0],z:p[1],hd:F.hd(du,dv),off:true,...(h!=null?{y:h*IKIT.MW}:{})}; };
    R.spots={CURATOR:sp(21,17.6,0,1),'TOURS OF THE GALLERIES':sp(17.6,19.6,0,-1),DOCENT:sp(5.2,12,-1,0),'DOCENT TOURS':sp(18.6,16.4,0,1)};
    R.seats=GALLERY.places=[sp(2.0,6,-1,0),sp(2.0,11,-1,0),sp(2.0,16,-1,0),sp(28,6,1,0),sp(28,11,1,0),sp(28,16,1,0),sp(5,2.0,0,-1),sp(25,2.0,0,-1),
      sp(9.6,13,0,1,.45),sp(10.4,13,0,1,.45),sp(19.6,13,0,1,.45),sp(20.4,13,0,1,.45)]; } }
  // the floor plan: each floor's paintings as they hang now
  GALLERY.plan=()=>{ '@later'; const S=STORE.artFrame, FY=BOD.Y(S.FZ), fl={}; for(const t of UI.things)if(t.obj&&t.obj.userData&&t.obj.userData.at){ const p=new THREE.Vector3(); t.obj.getWorldPosition(p); const k=Math.round(p.y/FY); (fl[k]=fl[k]||[]).push(t.name); }
    const ks=Object.keys(fl).map(Number).sort((a,b)=>a-b);
    MINI.look('THE FLOOR PLAN',(g,w,h)=>{ g.fillStyle='#efe6cf'; g.fillRect(0,0,w,h); g.fillStyle='#2a2420'; g.textAlign='center'; g.textBaseline='top'; g.font='bold 16px serif'; g.fillText('THE ART MUSEUM',w/2,10);
      if(!ks.length){ g.font='13px serif'; g.fillText('The paintings are being hung. Come back in a moment.',w/2,60); return; }
      g.textAlign='left'; let y=38; for(const k of ks.slice().reverse()){ g.font='bold 12px monospace'; g.fillStyle='#8a2a24'; g.fillText('FLOOR '+(k+1),14,y); y+=15; g.font='10px monospace'; g.fillStyle='#2a2420';
        const L=fl[k], half=Math.ceil(L.length/2); for(let i=0;i<half;i++){ g.fillText((L[i]||'').slice(0,30),14,y); if(L[i+half])g.fillText(L[i+half].slice(0,30),w/2+4,y); y+=12; } y+=6; } },'The elevator at the back goes to every floor.'); };
  // THE TOUR: ROSIE walks to the first floor's paintings one by one, stops in front of each and tells you about it, then back to her sign
  const rosie=()=>BODIES.by.w_redpanda&&BODIES.by.w_redpanda.npc;
  const stops=()=>{ '@later'; const S=STORE.artFrame, FY=BOD.Y(S.FZ), C=frameOf(S).pw((S.B.x1-S.B.x0)/2*TM,(S.B.y1-S.B.y0)/2*TM), out=[];
    for(const t of UI.things){ const u=t.obj&&t.obj.userData&&t.obj.userData.at; if(!u)continue; const p=new THREE.Vector3(); t.obj.getWorldPosition(p); if(p.y>FY*.5)continue;
      const dx=C[0]-p.x, dz=C[1]-p.z, d=Math.hypot(dx,dz)||1, k=1.7*IKIT.MW*TM; out.push({name:t.name,key:u.key,x:p.x+dx/d*k,z:p.z+dz/d*k,hd:Math.atan2(-dx,-dz),a:Math.atan2(dx,dz)}); }
    out.sort((a,b)=>a.a-b.a); return out.filter((_,i)=>i%2===0).slice(0,6); };
  const lineOf=s=>{ '@later'; const t=(GALLERY.data||[]).find(d=>d.t.toUpperCase()===s.name); if(!t)return `ROSIE: "${s.name}. LOOK AT HOW THE LIGHT FALLS ON IT."`;
    return `ROSIE: "${t.t.toUpperCase()}, BY ${t.a.toUpperCase()}${t.d?', '+t.d:''}. THE ORIGINAL HANGS IN ${String(t.m||'ANOTHER MUSEUM').toUpperCase()}. DOUBLE-CLICK IT TO SEE IT UP CLOSE."`; };
  GALLERY.tour=()=>{ '@later'; const T=GALLERY.touring; if(T)return say('THE TOUR IS UNDER WAY: FOLLOW ROSIE.'); const N=rosie(); if(!N)return say('ROSIE IS NOT HERE YET.','#c8a090'); const S=stops(); if(!S.length)return say('THE PAINTINGS ARE STILL BEING HUNG.','#c8a090');
    if(INV.cash<3)return say('A TOUR IS $3.','#c8a090'); INV.cash-=3; GALLERY.touring={i:-1,S,N,wait:0}; say('ROSIE: "FOLLOW ME, PLEASE. A STEP BACK FROM THE PAINTINGS."'); next(); };
  const next=()=>{ '@later'; const T=GALLERY.touring; T.i++; const N=T.N; N.st.pin=false; N.st.hold=true; N.st.next=null;
    if(T.i>=T.S.length){ T.home=true; const sp=room().spots['DOCENT TOURS']; N.st.to={x:sp.x,z:sp.z}; say('ROSIE: "THAT IS THE FIRST FLOOR. THE ELEVATOR AT THE BACK TAKES YOU TO THE REST. THANK YOU!"'); return; }
    const s=T.S[T.i]; N.st.to={x:s.x,z:s.z}; T.wait=0; };
  GALLERY.stopTour=()=>{ const T=GALLERY.touring; if(!T)return; GALLERY.touring=null; GALLERY.done=(GALLERY.done||0)+(T.home?1:0); WORKERS.make('art'); };
  SYS.add('life',dt=>{ const T=GALLERY.touring; if(!T)return; const N=T.N;
    if(!(STORE.here&&STORE.here('art'))){ GALLERY.stopTour(); return; }
    if(N.st.to)return;   // still walking
    if(T.home){ GALLERY.stopTour(); return; }
    if(T.wait===0){ const s=T.S[T.i]; N.st.hd=s.hd; say(lineOf(s)); GALLERY.last=s.name; }
    T.wait+=dt||0; if(T.wait>7)next(); },'146zh-tour');
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.art=S=>{ '@later'; GALLERY.data=S.data&&S.data(); const F=frameOf(S), K=IKIT.room(F,o=>scene.add(o)), {box,cyl,ball,glow,pic,words,sol,use,seat,own,MW}=K, t=d=>d*TM;
    const C={wood:0x6a4a2a,dark:0x2a2420,cream:0xefe6cf,brass:0xb08838,marble:0xe8e4dc,glass:0xcfe3ea,red:0x8a2a24};
    use('THE INFORMATION DESK (THE FLOOR PLAN)',t(21),t(18.8),t(1.6),1.2,GALLERY.plan,1.8);
    // ROSIE's tour sign
    { const u=t(18.0), v=t(17.0); box(u-.03,v-.03,u+.03,v+.03,0,1.2,C.dark); pic(u,v+.04,1.2,.6,.4,0,1,words(48,32,'#22262e',[['GUIDED',24,3,'#f0c040',8,'center'],['TOURS $3',24,13,'#f4ecd8',8,'center'],['ASK ROSIE',24,23,'#e8a060',7,'center']]),true);
      use('A GUIDED TOUR WITH ROSIE ($3)',u,v,.4,1.6,GALLERY.tour,1.6); }
    K.flush(); setTimeout(()=>WORKERS.make('art'),0); };
}
