// THE MOVIE THEATRE, FURNISHED as THE FLEA PIT (owner, 10 Nov 2026): one dark room of red movie seats in rows each side of the aisle facing the screen, dim caged bulbs and small aisle lights; watching a film from a seat rests you; where the doorman, the usher and the moviegoers go.
import {SHARED, THREE} from './003-shx.js';
import {CINEMA, st, USE, VIT} from './003b-systems.js';
import {scene} from './004-main.js';
import {STORE, SYS} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
const THEATRE={}; window.THEATRE=THEATRE;
{ const BOD=SHARED.BOD, TM=.924;   // a theatre tile in metres
  const room=()=>(STORE.rooms||[]).find(r=>r.id==='theatre');
  const at0=(TB,x,y)=>{ const q=TB?TB.pt(x,y):[x,y]; return [BOD.X(q[0]),BOD.Z(q[1])]; };
  const frameOf=(B,TB)=>IKIT.frame({x0:B.x0+.1,y0:B.y0+.1,x1:B.x1-.1,y1:B.y1-.1,id:'theatre'},(x,y)=>at0(TB,x,y));
  // the room in metres (u from the screen wall, v from the back side to the street side): the rows of seats up to the back, the aisle down the middle
  // the seats: regular movie seats, red, folding, in a row on metal standards with shared armrests; each side of the aisle a row of them (a block: its places' middles)
  const SW=.58, SITH=.46;
  const geo=(B,F)=>{ const U=x=>(x-B.x0-.1)*TM, V=y=>(y-B.y0-.1)*TM, Wm=F.W, Dm=F.D, cy=V((B.y0+B.y1)/2), rows=[];
    for(let i=0;B.x0+4.6+i*1.65<=B.x1-3;i++){ const uc=U(B.x0+4.6+i*1.65);
      for(const [a,b] of [[.7,cy-.75],[cy+.75,Dm-.7]]){ const n=Math.floor((b-a)/SW), v0=(a+b)/2-n*SW/2; rows.push({uc,v0,n,vs:Array.from({length:n},(_,k)=>v0+(k+.5)*SW)}); } }
    return {U,V,Wm,Dm,cy,rows}; };
  const place=R=>{ '@later'; const {B,TB}=STORE.theatreFrame, F=frameOf(B,TB), G=geo(B,F), sp=(u,v,du,dv,h)=>{ const p=F.pw(u,v); return {x:p[0],z:p[1],hd:F.hd(du,dv),...(h!=null?{y:h*IKIT.MW}:{})}; };
    R.spots={'DOORMAN, TICKETS WITH THE TICKET FOX':sp(G.Wm-1.2,G.Dm-1.1,0,-1),USHER:sp(G.Wm-1.2,G.cy,-1,0)};
    const S=[]; for(const r of G.rows)for(const v of r.vs)S.push(sp(r.uc,v,-1,0,SITH));
    R.seats=THEATRE.places=S; };
  { let done=false; const go=()=>{ if(done)return; const R=room(); if(R&&STORE.theatreFrame){ place(R); done=true; } }; go(); SYS.add('life',go,'146zf-theatre'); }
  // a film watched from a seat rests you
  VIT.mends.push(()=>USE.seat&&st.sit&&STORE.here&&STORE.here('theatre')&&CINEMA.playing&&CINEMA.playing()?1/40:0);
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.theatre=(B,TB)=>{ '@later'; const F=frameOf(B,TB), K=IKIT.room(F,o=>scene.add(o)), {box,cyl,ball,glow,own,seat,sol,MW}=K, G=geo(B,F), {Dm,cy}=G;
    const DK=0x1c1a1e;
    // the seats: a row of red movie seats each side of the aisle, the seats folded down, a metal standard and an armrest between each, a cup holder on every armrest; each row one thing you sit in (the nearest place)
    const RED=0x8a1c24, RDK=0x5e1218, STD=0x2a2a2e;
    for(const r of G.rows){ const {uc:u,v0,n}=r, v1=v0+n*SW, spots=r.vs.map(v=>[u,v,SITH,-1,0]);
      const b=own(()=>{ for(let k=0;k<=n;k++){ const v=v0+k*SW; box(u-.3,v-.03,u+.36,v+.03,0,.62,STD); box(u-.32,v-.05,u+.3,v+.05,.62,.68,0x3a2a24); cyl(u-.26,v,.04,.6,.7,0x1a1a1c,.045,8); }
        for(let k=0;k<n;k++){ const a=v0+k*SW+.04, c=v0+(k+1)*SW-.04; box(u-.3,a,u+.2,c,.36,.48,RED); box(u+.18,a,u+.34,c,.4,1.02,RED); box(u+.34,a,u+.37,c,.42,1.0,RDK); box(u+.16,a+.02,u+.36,c-.02,1.0,1.06,RDK); } });
      seat('A ROW OF SEATS',b,spots); sol(u-.05,v0,u+.38,v1); }
    // caged bulbs down the sides, turned low; a small light at the end of every row on the aisle
    for(const x of [B.x0+4,B.x0+8,B.x0+12,B.x0+16])for(const y of [B.y0+.6,B.y1-.6]){ const u=G.U(x), v=G.V(y), s=v<cy?1:-1; box(u-.04,v-s*.32,u+.04,v-s*.1,2.95,3.0,DK); glow(()=>ball(u,v-s*.02,3.06,.07,0xffe0a0)); }
    for(const r of G.rows){ const v=r.v0<cy?r.v0+r.n*SW+.06:r.v0-.06; glow(()=>box(r.uc-.32,v-.02,r.uc-.24,v+.02,.12,.16,0xffc070)); }
    K.flush();
    for(const [u,v] of [[G.U(B.x0+4),.9],[G.U(B.x0+10),Dm-.9],[G.U(B.x0+16),.9]]){ const L=new THREE.PointLight(0xffb070,1.1,4*MW,1.8), p=F.pw(u,v); L.position.set(p[0],3*MW,p[1]); scene.add(L); } };
}
