// THE ART MUSEUM, FURNISHED: a guided tour of the first floor with ROSIE THE RED PANDA (she walks you from painting to painting and tells you about each), the floor plan at the information desk, a café corner (coffee and croissants, tables to sit at), a gift shop corner (postcards and prints), where its staff and its visitors go.
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
  // where its people go (the inside is off the map): the curator at the information desk, the guides by the door and on the first floor, ROSIE by her tour sign; visitors before the walls' paintings, on the benches, at the café tables
  { const S=STORE.artFrame, R=room(); if(S&&R){ const F=frameOf(S), sp=(x,y,du,dv,h)=>{ const p=F.pw(x*TM,y*TM); return {x:p[0],z:p[1],hd:F.hd(du,dv),off:true,...(h!=null?{y:h*IKIT.MW}:{})}; };
    R.spots={CURATOR:sp(21,17.6,0,1),'TOURS OF THE GALLERIES':sp(17.6,19.6,0,-1),DOCENT:sp(5.2,12,-1,0),'DOCENT TOURS':sp(18.6,16.4,0,1)};
    R.seats=GALLERY.places=[sp(2.0,6,-1,0),sp(2.0,11,-1,0),sp(2.0,16,-1,0),sp(28,6,1,0),sp(28,11,1,0),sp(28,16,1,0),sp(5,2.0,0,-1),sp(25,2.0,0,-1),
      sp(9.6,13,0,1,.45),sp(10.4,13,0,1,.45),sp(19.6,13,0,1,.45),sp(20.4,13,0,1,.45),sp(5.6,8.1,1,0,.46),sp(6.6,8.1,-1,0,.46),sp(8.0,8.1,1,0,.46),sp(9.0,8.1,-1,0,.46)]; } }
  // the floor plan: each floor's paintings as they hang now
  GALLERY.plan=()=>{ const S=STORE.artFrame, FY=BOD.Y(S.FZ), fl={}; for(const t of UI.things)if(t.obj&&t.obj.userData&&t.obj.userData.at){ const p=new THREE.Vector3(); t.obj.getWorldPosition(p); const k=Math.round(p.y/FY); (fl[k]=fl[k]||[]).push(t.name); }
    const ks=Object.keys(fl).map(Number).sort((a,b)=>a-b);
    MINI.look('THE FLOOR PLAN',(g,w,h)=>{ g.fillStyle='#efe6cf'; g.fillRect(0,0,w,h); g.fillStyle='#2a2420'; g.textAlign='center'; g.textBaseline='top'; g.font='bold 16px serif'; g.fillText('THE ART MUSEUM',w/2,10);
      if(!ks.length){ g.font='13px serif'; g.fillText('The paintings are being hung. Come back in a moment.',w/2,60); return; }
      g.textAlign='left'; let y=38; for(const k of ks.slice().reverse()){ g.font='bold 12px monospace'; g.fillStyle='#8a2a24'; g.fillText('FLOOR '+(k+1),14,y); y+=15; g.font='10px monospace'; g.fillStyle='#2a2420';
        const L=fl[k], half=Math.ceil(L.length/2); for(let i=0;i<half;i++){ g.fillText((L[i]||'').slice(0,30),14,y); if(L[i+half])g.fillText(L[i+half].slice(0,30),w/2+4,y); y+=12; } y+=6; } },'The elevator at the back goes to every floor.'); };
  // THE TOUR: ROSIE walks to the first floor's paintings one by one, stops in front of each and tells you about it, then back to her sign
  const rosie=()=>BODIES.by.w_redpanda&&BODIES.by.w_redpanda.npc;
  const stops=()=>{ const S=STORE.artFrame, FY=BOD.Y(S.FZ), C=frameOf(S).pw((S.B.x1-S.B.x0)/2*TM,(S.B.y1-S.B.y0)/2*TM), out=[];
    for(const t of UI.things){ const u=t.obj&&t.obj.userData&&t.obj.userData.at; if(!u)continue; const p=new THREE.Vector3(); t.obj.getWorldPosition(p); if(p.y>FY*.5)continue;
      const dx=C[0]-p.x, dz=C[1]-p.z, d=Math.hypot(dx,dz)||1, k=1.7*IKIT.MW*TM; out.push({name:t.name,key:u.key,x:p.x+dx/d*k,z:p.z+dz/d*k,hd:Math.atan2(-dx,-dz),a:Math.atan2(dx,dz)}); }
    out.sort((a,b)=>a.a-b.a); return out.filter((_,i)=>i%2===0).slice(0,6); };
  const lineOf=s=>{ const t=(GALLERY.data||[]).find(d=>d.t.toUpperCase()===s.name); if(!t)return `ROSIE: "${s.name}. LOOK AT HOW THE LIGHT FALLS ON IT."`;
    return `ROSIE: "${t.t.toUpperCase()}, BY ${t.a.toUpperCase()}${t.d?', '+t.d:''}. THE ORIGINAL HANGS IN ${String(t.m||'ANOTHER MUSEUM').toUpperCase()}. DOUBLE-CLICK IT TO SEE IT UP CLOSE."`; };
  GALLERY.tour=()=>{ const T=GALLERY.touring; if(T)return say('THE TOUR IS UNDER WAY: FOLLOW ROSIE.'); const N=rosie(); if(!N)return say('ROSIE IS NOT HERE YET.','#c8a090'); const S=stops(); if(!S.length)return say('THE PAINTINGS ARE STILL BEING HUNG.','#c8a090');
    if(INV.cash<3)return say('A TOUR IS $3.','#c8a090'); INV.cash-=3; GALLERY.touring={i:-1,S,N,wait:0}; say('ROSIE: "FOLLOW ME, PLEASE. A STEP BACK FROM THE PAINTINGS."'); next(); };
  const next=()=>{ const T=GALLERY.touring; T.i++; const N=T.N; N.st.pin=false; N.st.hold=true; N.st.next=null;
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
    // the café corner: a counter with the espresso machine and the pastry case, two tables and their chairs
    { const u0=t(5.0), u1=t(8.6), v0=t(5.0), v1=t(5.6); box(u0,v0,u1,v1,0,.95,C.wood); box(u0-.02,v0-.02,u1+.02,v1+.02,.95,.99,C.marble); sol(u0,v0,u1,v1);
      box(u0+.15,v0+.1,u0+.6,v0+.45,.99,1.4,0x8a8c90); glow(()=>box(u0+.2,v1-.05,u0+.55,v1-.04,1.2,1.3,0xff9040)); for(let i=0;i<4;i++)cyl(u0+.8+i*.1,v0+.3,.04,.99,1.07,0xf2f2f0,.045);
      box(u1-1.0,v0+.08,u1-.2,v0+.52,.99,1.35,C.glass); for(let i=0;i<5;i++)ball(u1-.9+i*.16,v0+.3,1.07,.06,0xd8a048,.6);
      pic((u0+u1)/2,v0-.01,1.6,1.4,.3,0,-1,words(64,14,'#2a2420',[['CAFÉ',32,3,'#f0c040',9,'center']]),true);
      use('THE ESPRESSO MACHINE (COFFEE $1)',u0+.4,v0+.3,.6,1.4,()=>IKIT.buy('d_coffee',1,'AN ESPRESSO, SMALL AND STRONG. $1.'),1.6);
      use('THE PASTRY CASE (A CROISSANT $2)',u1-.6,v0+.3,.8,1.35,()=>IKIT.buy('f_croissant',2,'A CROISSANT, STILL WARM. $2.'),1.6);
      for(const tu of [t(6.1),t(8.5)]){ const tv=t(8.1); cyl(tu,tv,.32,.72,.75,C.marble); cyl(tu,tv,.04,0,.72,C.dark); cyl(tu,tv,.2,0,.03,C.dark); sol(tu-.32,tv-.32,tu+.32,tv+.32);
        for(const s of [-1,1]){ const cu=tu+s*.5; seat('A CAFÉ CHAIR',own(()=>{ cyl(cu,tv,.18,.44,.47,C.red); for(const [a,b] of [[-.12,-.12],[.12,-.12],[-.12,.12],[.12,.12]])box(cu+a-.015,tv+b-.015,cu+a+.015,tv+b+.015,0,.44,C.dark); box(cu+s*.17-.015,tv-.15,cu+s*.17+.015,tv+.15,.47,.9,C.dark); }),[[cu,tv,.47,-s,0]],.8); } } }
    // the gift shop corner: a counter, a postcard spinner, framed prints
    { const u0=t(21.4), u1=t(25.0), v0=t(5.0), v1=t(5.6); box(u0,v0,u1,v1,0,.95,C.wood); box(u0-.02,v0-.02,u1+.02,v1+.02,.95,.99,C.cream); sol(u0,v0,u1,v1);
      const su=u0+.5, sv=v1+.5; cyl(su,sv,.03,0,1.5,C.dark); for(let k=0;k<4;k++)for(let i=0;i<4;i++){ const a=i*Math.PI/2; box(su+Math.cos(a)*.12-.05,sv+Math.sin(a)*.12-.05,su+Math.cos(a)*.12+.05,sv+Math.sin(a)*.12+.05,.6+k*.22,.78+k*.22,[0xe0c080,0x80a0c0,0xc08080,0xa0c080][(i+k)%4]); } sol(su-.2,sv-.2,su+.2,sv+.2);
      for(let i=0;i<3;i++){ const u=u0+1.3+i*.7; box(u-.25,v0+.2,u+.25,v0+.25,1.0,1.6,C.brass); box(u-.22,v0+.25,u+.22,v0+.26,1.03,1.57,[0x6a8ab0,0xc8a048,0x8a4a3a][i]); }
      pic((u0+u1)/2,v0-.01,1.75,1.6,.3,0,-1,words(64,14,'#2a2420',[['THE SHOP',32,3,'#f0c040',9,'center']]),true);
      use('THE POSTCARD SPINNER ($1)',su,sv,.45,1.5,()=>IKIT.buy('art_postcard',1,'A POSTCARD OF A PAINTING. $1.'),1.4);
      use('THE PRINTS ($6)',u0+2.0,(v0+v1)/2,1.2,1.6,()=>IKIT.buy('art_print',6,'A PRINT, ROLLED IN A TUBE. HANG IT AT HOME. $6.'),1.6); }
    K.flush(); setTimeout(()=>WORKERS.make('art'),0); };
}
