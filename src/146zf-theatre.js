// THE MOVIE THEATRE, FURNISHED as THE FLEA PIT (owner, 10 Nov 2026): a partition with a doorway between the lobby and the seats, rows of seats no two alike (armchairs, car seats, barber chairs, a couch, a bathtub), the snack bar in an old ice cream truck run by THE RACCOON, a dead claw machine, a lost-and-found bin; watching a film from a seat rests you; where the doorman, the usher and the moviegoers go.
import {SHARED, THREE} from './003-shx.js';
import {CINEMA, FORAGE, st, USE, VIT, WORKERS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {STORE, SYS} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
const THEATRE={}; window.THEATRE=THEATRE;
{ FORAGE.add({names:{f_popcorn:'A TUB OF POPCORN',f_nachos:'A TRAY OF NACHOS',f_candybox:'A BOX OF CANDY'},does:{f_popcorn:()=>FORAGE.feed(.15),f_nachos:()=>FORAGE.feed(.3),f_candybox:()=>{ FORAGE.feed(.1); VIT.sta=Math.min(1,VIT.sta+.2); }}});
  const BOD=SHARED.BOD, TM=.924;   // a theatre tile in metres
  const room=()=>(STORE.rooms||[]).find(r=>r.id==='theatre');
  const at0=(TB,x,y)=>{ const q=TB?TB.pt(x,y):[x,y]; return [BOD.X(q[0]),BOD.Z(q[1])]; };
  const frameOf=(B,TB)=>IKIT.frame({x0:B.x0+.1,y0:B.y0+.1,x1:B.x1-.1,y1:B.y1-.1,id:'theatre'},(x,y)=>at0(TB,x,y));
  // the room in metres (u from the screen wall, v from the back side to the street side): the partition, the doorway in it, the rows, the truck; every seat with its kind, its middle and its width
  const KINDS=['armchair','car seat','barber chair','office chair','lawn chair','armchair','beanbag','recliner'];
  const geo=(B,F)=>{ const U=x=>(x-B.x0-.1)*TM, V=y=>(y-B.y0-.1)*TM, Wm=F.W, Dm=F.D, cy=V((B.y0+B.y1)/2), up=U(B.x1-5.5), seats=[];
    for(let i=0;i<5;i++){ const uc=U(B.x0+4.6+i*1.65);
      for(const [a,b] of [[.7,cy-.75],[cy+.75,Dm-.7]]){ const w=(b-a)/3; for(let s=0;s<3;s++){ const vc=a+(s+.5)*w, k=(i*7+s*3+(a<cy?0:5))%KINDS.length; seats.push({uc,vc,w,kind:KINDS[k],row:i}); } } }
    { const last=seats.filter(s=>s.row===4), L=last.filter(s=>s.vc<cy), Rr=last.filter(s=>s.vc>cy);   // the back row: a couch over two places on one side, a bathtub at the end of the other
      L[0].kind='couch'; L[0].vc=(L[0].vc+L[1].vc)/2; L[0].w*=2; seats.splice(seats.indexOf(L[1]),1); Rr[2].kind='bathtub'; }
    return {U,V,Wm,Dm,cy,up,seats,truck:{u0:Wm-2.3,v0:cy-2.7,v1:cy+2.7},door:{v0:cy-1,v1:cy+1}}; };
  const SITH={armchair:.48,'car seat':.5,'barber chair':.62,'office chair':.5,'lawn chair':.42,beanbag:.32,recliner:.5,couch:.46,bathtub:.4};
  const place=R=>{ '@later'; const {B,TB}=STORE.theatreFrame, F=frameOf(B,TB), G=geo(B,F), sp=(u,v,du,dv,h)=>{ const p=F.pw(u,v); return {x:p[0],z:p[1],hd:F.hd(du,dv),...(h!=null?{y:h*IKIT.MW}:{})}; };
    R.spots={'DOORMAN, TICKETS WITH THE TICKET FOX':sp(G.Wm-3.4,G.Dm-1.1,0,-1),USHER:sp(G.up+.6,G.cy+1.4,-1,0),CONCESSIONS:sp(G.Wm-1.2,G.cy,-1,0)};
    const S=[]; for(const s of G.seats){ if(s.kind==='couch')for(const o of [-.7,.7])S.push(sp(s.uc,s.vc+o,-1,0,SITH.couch)); else S.push(sp(s.uc,s.vc,-1,0,SITH[s.kind])); }
    R.seats=THEATRE.places=[...S,sp(G.truck.u0-.9,G.cy-.6,1,0),sp(G.truck.u0-.9,G.cy+.6,1,0)]; };
  { let done=false; const go=()=>{ if(done)return; const R=room(); if(R&&STORE.theatreFrame){ place(R); done=true; } }; go(); SYS.add('life',go,'146zf-theatre'); }
  // a film watched from a seat rests you
  VIT.mends.push(()=>USE.seat&&st.sit&&STORE.here&&STORE.here('theatre')&&CINEMA.playing&&CINEMA.playing()?1/40:0);
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.theatre=(B,TB)=>{ '@later'; const F=frameOf(B,TB), K=IKIT.room(F,o=>scene.add(o)), {box,cyl,ball,glow,own,seat,pic,sol,use,MW}=K, G=geo(B,F), {Wm,Dm,cy,up}=G;
    const C={paint:0x3c564c,dado:0x4a2a22,trim:0x8a6a40,steel:0xa8acb0,chrome:0xd0d4d8,glass:0xcfe3ea,cream:0xeadcc4,pink:0xe890a8,red:0xa81c28,dark:0x1c1a1e,wood:0x6a4a2e,white:0xf2f0ea};
    const HT=BOD.Y(284)/MW, R=(()=>{ let a=41; return ()=>{ a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; })();
    const hand=(t,w,h,bg,fg,sz)=>IKIT.tex(w,h,(g,W,H)=>{ g.fillStyle=bg; g.fillRect(0,0,W,H); g.fillStyle=fg; g.textAlign='center'; g.textBaseline='middle'; const L=t.split('\n'); L.forEach((s,i)=>{ g.font='900 '+sz+'px Impact,"Arial Narrow",sans-serif'; g.save(); g.translate(W/2,H*(i+.5)/L.length); g.rotate((R()-.5)*.06); g.fillText(s,0,0); g.restore(); }); });
    // the partition between the seats and the lobby: green paint over a brown dado, a doorway on the aisle, posters both sides
    { const t=.24, u0=up-t/2, u1=up+t/2, D0=G.door.v0, D1=G.door.v1, dh=2.6;
      for(const [a,b] of [[0,D0],[D1,Dm]]){ box(u0,a,u1,b,0,HT,C.paint); box(u0-.02,a,u1+.02,b,0,1.0,C.dado); box(u0-.03,a,u1+.03,b,1.0,1.05,C.trim); sol(u0,a,u1,b); }
      box(u0,D0,u1,D1,dh,HT,C.paint); box(u0-.04,D0-.08,u1+.04,D0,0,dh+.08,C.wood); box(u0-.04,D1,u1+.04,D1+.08,0,dh+.08,C.wood); box(u0-.04,D0-.08,u1+.04,D1+.08,dh,dh+.1,C.wood);
      pic(u1+.01,(D0+D1)/2,dh+.25,1.9,.5,1,0,hand('TO THE SEATS',192,48,'#e2d6b8','#7a1e24',30));
      pic(u0-.01,(D0+D1)/2,dh+.25,1.6,.42,-1,0,hand('NO TALKING',160,42,'#e2d6b8','#16110d',28));
      const P=['#c8463c','#3c6ea8','#d8b040','#6a9a48','#a050a0','#e07a30'];
      for(const [v,side,k] of [[1.2,1,0],[2.6,1,1],[Dm-1.4,1,2],[Dm-2.8,1,3],[1.6,-1,4],[Dm-1.8,-1,5]]){ const c=P[k], hh=1.0+R()*.3;
        pic(side>0?u1+.012:u0-.012,v,1.4,hh*.7,hh,side,0,IKIT.tex(54,76,(g,w,h)=>{ g.fillStyle=c; g.fillRect(0,0,w,h); g.fillStyle='rgba(255,250,235,.25)'; g.fillRect(0,0,w,h); g.fillStyle='#16110d'; g.fillRect(6,6,w-12,10); g.fillStyle='rgba(20,16,14,.4)'; g.beginPath(); g.arc(w/2,h*.55,14,0,7); g.fill(); g.fillStyle='rgba(240,232,210,.9)'; g.fillRect(8,h-14,w-16,4); if(k%2){ g.fillStyle='#3d4b43'; g.beginPath(); g.moveTo(w,h*.6); g.lineTo(w*.55,h); g.lineTo(w,h); g.fill(); } })); } }
    // the seats, no two alike, each one you can sit in
    const SEAT={
      armchair:(s,c)=>{ const u=s.uc, v=s.vc, hw=.42; box(u-.4,v-hw,u+.4,v+hw,.12,.4,c); box(u-.38,v-hw+.12,u+.3,v+hw-.12,.4,.5,c); box(u+.28,v-hw,u+.46,v+hw,.12,1.0,c); for(const o of [-1,1])box(u-.4,v+o*hw-(o>0?.14:0),u+.4,v+o*hw+(o<0?.14:0),.12,.68,c); for(const a of [-1,1])for(const b of [-1,1])box(u+a*.34-.03,v+b*.34-.03,u+a*.34+.03,v+b*.34+.03,0,.12,C.wood); },
      'car seat':(s,c)=>{ const u=s.uc, v=s.vc; box(u-.4,v-.36,u+.4,v+.36,0,.3,0x6a6058); box(u-.36,v-.3,u+.32,v+.3,.3,.5,0x1e1c1c); box(u+.24,v-.3,u+.42,v+.3,.4,1.1,0x1e1c1c); box(u+.28,v-.16,u+.42,v+.16,1.1,1.32,0x1e1c1c); for(const o of [-.3,.3])box(u-.36,v+o-.03,u+.32,v+o+.03,.5,.6,0x2a2826); box(u-.2,v-.05,u+.2,v+.05,.3,.32,C.chrome); },
      'barber chair':(s,c)=>{ const u=s.uc, v=s.vc; cyl(u,v,.28,0,.06,C.chrome); cyl(u,v,.08,.06,.45,C.chrome); box(u-.36,v-.3,u+.3,v+.3,.45,.62,0xa8242c); box(u+.24,v-.28,u+.4,v+.28,.62,1.3,0xa8242c); box(u+.3,v-.14,u+.42,v+.14,1.3,1.48,0x1e1c1c); for(const o of [-.34,.34])box(u-.3,v+o-.04,u+.3,v+o+.04,.78,.84,C.chrome); box(u-.62,v-.2,u-.48,v+.2,.12,.18,C.chrome); },
      'office chair':(s,c)=>{ const u=s.uc, v=s.vc; for(const a of [0,1,2,3,4]){ const t=a/5*Math.PI*2; box(u+Math.cos(t)*.28-.04,v+Math.sin(t)*.28-.04,u+Math.cos(t)*.28+.04,v+Math.sin(t)*.28+.04,0,.06,C.dark); } cyl(u,v,.04,.06,.42,C.steel); box(u-.3,v-.28,u+.26,v+.28,.42,.5,0x3a4a6a); box(u+.22,v-.24,u+.3,v+.24,.5,1.05,0x3a4a6a); },
      'lawn chair':(s,c)=>{ const u=s.uc, v=s.vc; for(const o of [-.3,.3]){ box(u-.36,v+o-.02,u+.36,v+o+.02,0,.03,C.steel); box(u+.3,v+o-.02,u+.34,v+o+.02,0,.9,C.steel); box(u-.36,v+o-.02,u-.32,v+o+.02,0,.42,C.steel); } for(let k=0;k<5;k++)box(u-.32+k*.12,v-.3,u-.22+k*.12,v+.3,.4,.42,k%2?0x2a8a6a:C.white); for(let k=0;k<5;k++)box(u+.29,v-.3,u+.33,v+.3,.45+k*.1,.53+k*.1,k%2?0x2a8a6a:C.white); },
      beanbag:(s,c)=>{ ball(s.uc,s.vc,.22,.45,c,.55); ball(s.uc+.25,s.vc,.4,.3,c,.9); },
      recliner:(s,c)=>{ const u=s.uc, v=s.vc; box(u-.42,v-.42,u+.44,v+.42,0,.42,0x7a2a2a); box(u-.4,v-.36,u+.3,v+.36,.42,.52,0x8a3232); box(u+.26,v-.38,u+.46,v+.38,.42,1.15,0x7a2a2a); for(const o of [-.42,.32])box(u-.36,v+o,u+.42,v+o+.1,.42,.7,0x6a2424); box(u-.7,v-.3,u-.42,v+.3,.2,.34,0x7a2a2a); },
      couch:(s,c)=>{ const u=s.uc, v=s.vc, hw=s.w/2-.15; box(u-.42,v-hw,u+.42,v+hw,.12,.4,c); for(const o of [-1,1])box(u-.4,v+o*hw/2-hw/2+.03,u+.3,v+o*hw/2+hw/2-.03,.4,.52,c); box(u+.28,v-hw,u+.46,v+hw,.12,.95,c); for(const o of [-1,1])box(u-.42,v+o*hw-(o>0?.16:0),u+.42,v+o*hw+(o<0?.16:0),.12,.66,c); ball(u+.2,v-hw+.4,.68,.16,0xd8b040,.7); for(const a of [-1,1])for(const b of [-1,1])box(u+a*.36-.03,v+b*(hw-.06)-.03,u+a*.36+.03,v+b*(hw-.06)+.03,0,.12,C.wood); },
      bathtub:(s,c)=>{ const u=s.uc, v=s.vc, hw=.42; box(u-.6,v-hw,u+.6,v+hw,.12,.56,C.white); box(u-.52,v-hw+.08,u+.52,v+hw-.08,.5,.565,0xc8c4bc); ball(u+.62,v,.5,.22,C.white,.9); for(const a of [-1,1])for(const b of [-1,1])ball(u+a*.48,v+b*.32,.07,.08,C.trim); box(u-.4,v-.3,u+.4,v+.3,.4,.5,0x3c6ea8); ball(u+.36,v,.62,.18,0xd8b040,.6); }};
    const VEL=[0x8a6a2a,0x5a6a3a,0x7a2a3a,0x3a4a7a,0x6a3a5a,0x8a4a2a];
    for(const s of G.seats){ const c=VEL[(R()*VEL.length)|0], h=SITH[s.kind], spots=s.kind==='couch'?[[s.uc,s.vc-.7,h,-1,0],[s.uc,s.vc+.7,h,-1,0]]:[[s.uc,s.vc,h,-1,0]];
      seat(s.kind==='bathtub'?'THE BATHTUB':(/^[aeiou]/.test(s.kind)?'AN ':'A ')+s.kind.toUpperCase(),own(()=>SEAT[s.kind](s,c)),spots);
      const half=s.kind==='couch'?s.w/2-.1:s.kind==='bathtub'?.45:.4; sol(s.uc-.1,s.vc-half,s.uc+.4,s.vc+half); }
    // the snack bar: the serving side of an old ice cream truck against the lobby's back wall, its window open, the counter and the raccoon behind it
    { const {u0,v0,v1}=G.truck, u1=Wm-.05, top=2.5, ch=1.02;
      box(u0,v0,u0+.12,v1,0,ch,C.cream); box(u0+.12,v0+.18,u0+.95,v1-.18,0,ch,0xc8b8a0); box(u0-.02,v0,u0+.14,v1,.62,.74,C.pink); box(u0-.3,v0+.05,u0+.14,v1-.05,ch,ch+.06,C.steel);
      for(const v of [v0,v1-.18])box(u0,v,u1,v+.18,0,top,C.cream); for(const v of [v0+.18,v1-.36])box(u0,v,u0+.16,v+.18,ch,top,C.cream);
      box(u0,v0,u1,v1,top,top+.25,C.cream); box(u0-.04,v0,u1,v1,top+.25,top+.32,C.pink); sol(u0-.3,v0,u1,v1);
      for(let k=0;k<10;k++){ const a=v0+(v1-v0)*k/10; box(u0-.7,a,u0,a+(v1-v0)/10,top-.05,top+.02,k%2?C.pink:C.white); }   // the awning
      cyl(u0+1.0,(v0+v1)/2,.22,top+.32,top+.82,0xd8a050,.02,10); ball(u0+1.0,(v0+v1)/2,top+.92,.3,0xf0d0e0); ball(u0+1.0,(v0+v1)/2,top+1.14,.18,0x8a4a2a);   // the cone on the roof
      const pv=v0+.9; box(u0+.3,pv-.25,u0+.9,pv+.25,ch,ch+.08,C.red); glow(()=>box(u0+.32,pv-.23,u0+.88,pv+.23,ch+.08,ch+.6,0xfff2c8)); for(let i=0;i<14;i++)ball(u0+.38+(i%5)*.11,pv-.15+Math.floor(i/5)*.12,ch+.14+.04*(i%3),.05,0xfff0b0); box(u0+.28,pv-.27,u0+.92,pv+.27,ch+.6,ch+.7,C.red);
      const sv=pv+1.0; box(u0+.4,sv-.22,u0+.9,sv+.22,ch,ch+.55,C.dark); for(let i=0;i<3;i++)box(u0+.36,sv-.15+i*.13,u0+.4,sv-.1+i*.13,ch+.2,ch+.3,C.steel); glow(()=>box(u0+.399,sv-.18,u0+.4,sv+.18,ch+.34,ch+.5,0x40a0ff));
      const nv=sv+.9; box(u0+.4,nv-.2,u0+.8,nv+.2,ch,ch+.28,C.steel); glow(()=>box(u0+.399,nv-.17,u0+.4,nv+.17,ch+.05,ch+.22,0xff9030));
      for(let i=0;i<4;i++){ const v=v1-.9+i*.18; cyl(u0-.1,v,.07,ch+.06,ch+.3,C.glass,.07,8); ball(u0-.1,v,ch+.14,.05,[0xd02030,0x2050c0,0xf0c020,0x30a040][i]); }   // candy jars on the counter
      for(let i=0;i<5;i++)cyl(u0+.65,v1-.6,.08,ch+i*.11,ch+.1+i*.11,0xe02030,.09);
      const MENU=IKIT.tex(128,56,(g,w,h)=>{ g.fillStyle='#f0e4c8'; g.fillRect(0,0,w,h); g.font='bold 10px monospace'; g.textBaseline='top'; [['POPCORN','$3'],['NACHOS','$4'],['CANDY','$2'],['SODA','$3']].forEach(([a,b],i)=>{ g.fillStyle='#7a1e24'; g.textAlign='left'; g.fillText(a,8,6+i*12); g.textAlign='right'; g.fillStyle='#16110d'; g.fillText(b,w-8,6+i*12); }); });
      pic(u0-.06,(v0+v1)/2-.9,top-.62,1.3,.56,-1,0,MENU); pic(u0-.06,(v0+v1)/2+.9,top-.62,1.5,.5,-1,0,hand('SNACKS',150,50,'#e890a8','#ffffff',38));
      pic(u0-.01,(v0+v1)/2,.08,(v1-v0)-.4,.5,-1,0,IKIT.tex(160,32,(g,w,h)=>{ g.fillStyle='#eadcc4'; g.fillRect(0,0,w,h); g.fillStyle='#1a1818'; for(const x of [26,w-26]){ g.beginPath(); g.arc(x,h,15,Math.PI,0); g.fill(); g.fillStyle='#8a8a8a'; g.beginPath(); g.arc(x,h,6,Math.PI,0); g.fill(); g.fillStyle='#1a1818'; } }));   // its wheels in their arches
      use('THE MENU BOARD',u0-.3,(v0+v1)/2-.9,.8,2.6,()=>MINI.look('THE SNACK BAR',MENU),2.4); }
    // a claw machine nobody has fixed, a lost-and-found bin by the door
    { const u=up+.9, v=Dm-.8; box(u-.45,v-.45,u+.45,v+.45,0,1.0,0x2a6a8a); box(u-.43,v-.43,u+.43,v+.43,1.9,2.2,0x2a6a8a); glow(()=>box(u-.44,v-.46,u+.44,v-.44,1.95,2.15,0xff80c0)); box(u-.42,v-.42,u+.42,v+.42,1.0,1.03,C.glass);
      for(let i=0;i<9;i++)ball(u-.28+(i%3)*.28,v-.28+Math.floor(i/3)*.28,1.12,.12,[0xe0c040,0xe06080,0x60a0e0,0x80c060][i%4]); for(const a of [-1,1])for(const b of [-1,1])box(u+a*.42-.02,v+b*.42-.02,u+a*.42+.02,v+b*.42+.02,1.0,1.9,C.steel); box(u-.02,v-.02,u+.02,v+.02,1.5,1.9,C.steel); ball(u,v,1.48,.06,C.steel);
      pic(u,v-.47,.55,.5,.24,0,-1,hand('OUT OF\nORDER',100,48,'#f0e6c8','#a81c28',18)); sol(u-.45,v-.45,u+.45,v+.45);
      use('THE OLD CLAW MACHINE',u,v,1,2.2,()=>SAY('OUT OF ORDER. SOMEBODY\'S BEAR IS STILL IN THERE.','#c8a090'));
      const lu=Wm-.8, lv=Dm-2.1; box(lu-.35,lv-.35,lu+.35,lv+.35,0,.62,0x8a6a40); ball(lu-.1,lv,.66,.14,0xc84040); ball(lu+.12,lv+.12,.64,.11,0x404080); cyl(lu+.15,lv-.15,.03,.4,1.05,C.dark,.03,6); box(lu+.09,lv-.21,lu+.21,lv-.09,1.0,1.1,C.dark);
      pic(lu-.36,lv,.2,.6,.3,-1,0,hand('LOST +\nFOUND',100,50,'#c8a878','#16110d',18)); sol(lu-.35,lv-.35,lu+.35,lv+.35);
      const LF=['A SINGLE GLOVE, THREE UMBRELLAS AND A RETAINER.','SOMEBODY\'S FALSE TEETH. NOBODY HAS ASKED.','A PHOTOGRAPH OF A DOG IN A HAT.','ONE ROLLER SKATE, LACED.'];
      use('LOST AND FOUND',lu,lv,.8,1.1,()=>SAY(LF[Math.random()*LF.length|0],'#c8a090')); }
    // bare bulbs in cages down the auditorium's sides; three hanging in the lobby
    for(const x of [B.x0+4,B.x0+8,B.x0+12])for(const y of [B.y0+.6,B.y1-.6]){ const u=G.U(x), v=G.V(y), s=v<cy?1:-1; box(u-.04,v-s*.32,u+.04,v-s*.1,2.95,3.0,C.dark); glow(()=>ball(u,v-s*.02,3.06,.07,0xffe0a0)); }
    for(const v of [2.2,cy,Dm-2.2]){ const u=(up+Wm)/2-.4; cyl(u,v,.01,3.3,HT,C.dark,.01,4); glow(()=>ball(u,v,3.2,.08,0xffe8b0)); }
    K.flush();
    for(const [u,v,c,i,r,h] of [[(up+Wm)/2-.4,2.2,0xffd8a8,6,6,3],[(up+Wm)/2-.4,Dm-2.2,0xffd8a8,6,6,3],[Wm-1.4,cy,0xfff0d0,5,4.5,2],[up+.9,Dm-1.4,0xff70b0,2.5,3,2.2],[G.U(B.x0+4),.9,0xffc890,2.6,5,3],[G.U(B.x0+8),Dm-.9,0xffc890,2.6,5,3],[G.U(B.x0+12),.9,0xffc890,2.6,5,3]]){ const L=new THREE.PointLight(c,i,r*MW,1.6), p=F.pw(u,v); L.position.set(p[0],h*MW,p[1]); scene.add(L); }
    // the raccoon goes to its spot once the street has put the theatre on its list (this build can come first)
    const mk=(n=0)=>{ const R=room(); if(R&&STORE.theatreFrame){ if(!R.spots)place(R); WORKERS.make('theatre'); } else if(n<120)setTimeout(()=>mk(n+1),500); }; mk(); };
}
