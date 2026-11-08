// THE SEALED STACKS: a locked hatch in the bookstore's floor (the Professor sells its key) down to a dusty closed stack off the map; its rotted books (one a shelf a day) are old books to mend into valuable ones; run in there and the librarian's ghost shushes you and puts you out on the street.
import {SHARED, THREE} from './003-shx.js';
import {BOOKS, CITY, FORAGE, INSPECT, INV, MAIL, pos, ROOMS, SFX, st, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {FADE, SYS, TILE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MSHOP} from './059i-mshops.js';
import {LIB} from './144ca-library.js';
const STACKS={}; window.STACKS=STACKS;
{ const say=(t,c)=>SAY(t,c||'#e8d6a8'), T=TILE, MW=TILE/.84, OX=()=>SHARED.BOD.XS(-3240), OZ=()=>SHARED.BOD.ZS(0), RW=8, RD=12, H=3.4;
  const day=()=>window.MAIL&&MAIL.ready?MAIL.day():window.CITY?CITY.day||0:0;
  FORAGE.add({names:{stack_key:"THE SEALED STACKS' KEY"},prices:{stack_key:30}});
  if(INSPECT.kinds)INSPECT.kinds.push({is:id=>id==='stack_key',make:()=>{ '@later'; const P=INSPECT.part, g=new THREE.Group(); g.add(P('tor',0xb8923a,-.07,0,0,.035,.035,.012,0,0,0,{kind:'metal',metal:1,rough:.35}),P('box',0xb8923a,.03,0,0,.16,.014,.014,0,0,0,{kind:'metal',metal:1,rough:.35}),P('box',0xb8923a,.1,-.015,0,.014,.03,.014,0,0,0,{kind:'metal',metal:1,rough:.35})); return g; }});
  FORAGE.HELP.push("THE SEALED STACKS: under the bookstore, behind a hatch the Professor's key opens. Walk, don't run. A rotted book on each shelf a day, to mend.");
  // the room's frame: 8 by 12 m off the map, the stair up at its front (v=RD)
  const frame=()=>{ const o=[OX(),OZ()]; return IKIT.frame({x0:0,y0:0,x1:1,y1:1},(x,y)=>[o[0]+x*RW*MW,o[1]+y*RD*MW]); };
  const BOOKS_IN=[['atlas',2],['hymnal',2],['ledger',3],['herbal',3],['first',2]], SPOTS=[[1.6,3.2],[4,5.6],[6.4,4.2],[4,8.4]];
  STACKS.ready=i=>INV.ready('stacks'+i);
  const take=i=>{ const k='stacks'+i; if(!INV.ready(k))return say('ONLY DUST WHERE IT LAY. ANOTHER WORKS LOOSE BY TOMORROW.','#c8c2b0'); INV.picked[k]=day(); INV.save(); BOOKS.find(BOOKS_IN,'YOU EASE IT OFF THE SEALED SHELF'); if(SFX.play)SFX.play('clunk',{vol:.2}); };
  // in the bookstore: the hatch in the floor of the books' front corner, clear of the Professor's desk
  LIB.inside.push(({K,W,D})=>{ '@later'; const u=2.6, v=D-1.65, {box,cyl,use}=K;
    box(u-.48,v-.48,u+.48,v+.48,0,.03,0x3a2414); box(u-.44,v-.44,u+.44,v+.44,.03,.045,0x5a3a22); for(const s of [-.2,.2])box(u-.44,v+s-.02,u+.44,v+s+.02,.045,.05,0x2a1a10);
    cyl(u,v+.3,.06,.045,.06,0xb8923a); box(u+.3,v-.06,u+.36,v+.06,.045,.07,0x8a7a3a);
    use('A LOCKED HATCH (THE SEALED STACKS)',u,v,1,.6,()=>STACKS.down(),1.4); });
  STACKS.down=()=>{ if(!FORAGE.has('stack_key'))return say("LOCKED. THE PROFESSOR KEEPS THE KEY TO THE SEALED STACKS (HE SELLS IT).",'#c8a090'); say('THE KEY TURNS. A STAIR GOES DOWN INTO DUST. (WALK. DO NOT RUN.)'); ROOMS.enter('stacks'); };
  STACKS.up=()=>{ if(!(MSHOP.at&&MSHOP.at.books&&ROOMS.off.books))return ROOMS.exit('stacks'); const R=MSHOP.at.books.R, X=SHARED.BOD.X, Z=SHARED.BOD.Z;
    ROOMS.enterAt('books',[X(R.x0+2.6/.924),Z(R.y1-2.65/.924),0,Math.PI]); };
  // the librarian's ghost: comes for you if you run, shushes, and walks you out
  let G=null, GH=null, lx=null, lz=null, calm=0, shh=0, dir=[0,1]; const ghost=()=>{ const g=new THREE.Group(), m=new THREE.MeshBasicMaterial({color:0xdfe8f0,transparent:true,opacity:.55,depthWrite:false});
    const robe=new THREE.Mesh(new THREE.ConeGeometry(.32*MW,1.3*MW,12,1,true),m); robe.position.y=.75*MW; const head=new THREE.Mesh(new THREE.SphereGeometry(.17*MW,12,8),m); head.position.y=1.55*MW;
    const bun=new THREE.Mesh(new THREE.SphereGeometry(.09*MW,8,6),m); bun.position.set(0,1.7*MW,-.1*MW); const gl=new THREE.MeshBasicMaterial({color:0x202830});
    for(const s of [-1,1]){ const e=new THREE.Mesh(new THREE.TorusGeometry(.045*MW,.008*MW,4,10),gl); e.position.set(s*.06*MW,1.57*MW,.16*MW); g.add(e); }
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(.03*MW,.03*MW,.45*MW,6),m); arm.position.set(.12*MW,1.4*MW,.18*MW); arm.rotation.x=-1.2; g.add(robe,head,bun,arm); g.visible=false; return g; };
  SYS.add('life',dt=>{ if(!(dt>0))return; const inn=ROOMS.offIn&&ROOMS.offIn()==='stacks'; if(!inn||FADE.busy){ lx=null; calm=1.2; if(GH&&!inn){ GH.visible=false; shh=0; } return; }
    const mv=lx==null?0:Math.hypot(pos.x-lx,pos.z-lz), sp=mv/Math.max(dt,1e-3); if(mv>1e-4)dir=[(pos.x-lx)/mv,(pos.z-lz)/mv]; lx=pos.x; lz=pos.z; if((calm-=dt)>0)return;
    if(shh>0){ shh-=dt; if(GH){ GH.position.y=Math.sin(performance.now()/300)*.03*MW; } if(shh<=0){ STACKS.outs=(STACKS.outs||0)+1; ROOMS.exit('stacks'); } return; }
    if(st.run>.55&&sp>.6*T&&!UI.fly&&!UI.freeCam)STACKS.shush(); },'144cc-stacks');
  STACKS.shush=()=>{ if(shh>0||!G)return; if(!GH){ GH=ghost(); G.add(GH); } const h=dir; GH.position.set(pos.x+h[0]*1.3*MW,0,pos.z+h[1]*1.3*MW); GH.userData.x=GH.position.x; GH.rotation.y=Math.atan2(-h[0],-h[1]); GH.visible=true; shh=1.8;
    say('SHHHHHH! A GREY LIBRARIAN RISES OUT OF THE DUST, A FINGER TO HER LIPS, AND SHOWS YOU THE WAY OUT.','#cfe0ff'); if(SFX.play)SFX.play('chirp',{vol:.25,pitch:.5}); };
  // the stack off the map: three ranks of tall shelves, dust and webs, one dim lamp
  const furnish=()=>{ '@later'; const F=frame(), first=!STACKS.sol; STACKS.sol=true; const K=IKIT.room(F,o=>G.add(o),first?undefined:()=>{}), {box,cyl,ball,glow,use,pic}=K;
    const C={floor:0x3a2a1c,wall:0x5a5248,dark:0x2a2018,shelf:0x4a3424}, hs=(a,b)=>{ let h=Math.imul(a|0,374761393)+Math.imul(b|0,668265263); h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
    box(0,0,RW,RD,-.05,0,C.floor);
    for(const [a,b,c,d] of [[-.2,-.2,RW+.2,0],[-.2,RD,RW+.2,RD+.2],[-.2,0,0,RD],[RW,0,RW+.2,RD]]){ box(a,b,c,d,0,H,C.wall); K.sol(a,b,c,d); }
    // the ranks: shelves along the room, their books faded to the dust's colours
    const BK=[0x5a4a3a,0x6a5a48,0x4a4038,0x7a6a54,0x585040,0x6a4a3a,0x4a5048];
    for(const [u,v0,v1] of [[1.6,1.5,9.2],[4,1.5,9.2],[6.4,1.5,9.2]]){ box(u-.3,v0,u+.3,v1,0,2.7,C.shelf); K.sol(u-.32,v0,u+.32,v1);
      for(let r=0;r<5;r++){ const h=.15+r*.52; for(const s of [-1,1]){ box(s<0?u-.32:u+.29,v0,s<0?u-.29:u+.32,v1,h-.03,h,C.dark); let v=v0+.05; while(v<v1-.1){ const w=.04+hs(v*100,r*7+s)*.05, t=.28+hs(v*77,r+s*3)*.16; if(hs(v*31,r*5+s)>.12)box(s<0?u-.31:u+.06,v,s<0?u-.06:u+.31,v+w,h,h+t,BK[Math.floor(hs(v*13,r+s)*BK.length)]); v+=w+.005; } } } }
    // books fallen on the floor, a reading table and its lamp
    for(let i=0;i<14;i++){ const u=.5+hs(i,1)*(RW-1), v=1+hs(i,2)*(RD-3); if([1.6,4,6.4].some(x=>Math.abs(u-x)<.45)&&v>1.3&&v<9.4)continue; box(u-.12,v-.09,u+.12,v+.09,0,.05+hs(i,3)*.06,BK[i%BK.length]); }
    box(5.6,10.2,7.2,11,.72,.78,0x4a3424); for(const [a,b] of [[5.65,10.25],[7.15,10.25],[5.65,10.95],[7.15,10.95]])box(a-.03,b-.03,a+.03,b+.03,0,.72,C.dark); K.sol(5.6,10.2,7.2,11);
    cyl(6.8,10.6,.07,.78,.8,0x8a7a3a); box(6.79,10.59,6.81,10.61,.8,1.1,0x8a7a3a); glow(()=>ball(6.8,10.6,1.15,.07,0xffd890)); { const L=new THREE.PointLight(0xffc878,2.2,9*T,1.6); const p=F.pw(6.8,10.6); L.position.set(p[0],1.3*MW,p[1]); G.add(L); }
    { const L=new THREE.PointLight(0x8a9ab0,1.2,10*T,1.6); const p=F.pw(4,4); L.position.set(p[0],3*MW,p[1]); G.add(L); } G.add(new THREE.HemisphereLight(0x6a6458,0x1a1410,.9));
    // cobwebs in the corners and between the ranks
    const web=IKIT.tex(32,32,(g,w,h)=>{ g.strokeStyle='rgba(220,220,210,.7)'; g.lineWidth=1; for(let i=0;i<7;i++){ const a=i/6*Math.PI/2; g.beginPath(); g.moveTo(0,0); g.lineTo(Math.cos(a)*32,Math.sin(a)*32); g.stroke(); } for(let r=6;r<32;r+=6){ g.beginPath(); g.arc(0,0,r,0,Math.PI/2); g.stroke(); } });
    for(const [u,v,du,dv] of [[.05,1,1,0],[RW-.05,1,-1,0],[.05,RD-1,1,0],[RW-.05,RD-1,-1,0],[1.6,9.25,0,1],[6.4,9.25,0,1]]){ const m=pic(u,v,H-1.2,1.2,1.2,du,dv,web); m.material.transparent=true; m.material.depthWrite=false; m.material.side=THREE.DoubleSide; }
    // the stair up at the front
    for(let i=0;i<6;i++)box(RW/2-.7,RD-1.2+i*.2,RW/2+.7,RD,0,.2+i*.2,0x4a4038); K.sol(RW/2-.75,RD-1.2,RW/2+.75,RD);
    use('THE STAIR UP (THE BOOKSTORE)',RW/2,RD-1.3,1.2,1.4,()=>STACKS.up(),1.4);
    // the rotted books: one on a shelf end a day each
    const rot=new THREE.MeshLambertMaterial({color:0x5a6a48}), bg=new THREE.BoxGeometry(.24*MW,.06*MW,.32*MW);
    STACKS.marks=SPOTS.map(([u,v],i)=>{ const me=new THREE.Mesh(bg,rot), p=F.pw(u,v); me.position.set(p[0],1.23*MW,p[1]); G.add(me); const th=use('A ROTTED BOOK',u,v,.6,1.5,()=>{ take(i); sync(); },1.3); th.obj.position.y=.7*MW; return {th,i,me}; });
    K.flush();
    // the motes in the lamplight
    { const N=70, P=new Float32Array(N*3); for(let i=0;i<N;i++){ const p=F.pw(.5+Math.random()*(RW-1),.5+Math.random()*(RD-1)); P[i*3]=p[0]; P[i*3+1]=(.2+Math.random()*(H-.4))*MW; P[i*3+2]=p[1]; }
      const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); G.add(new THREE.Points(g,new THREE.PointsMaterial({color:0xd8ccb0,size:.025*MW,transparent:true,opacity:.45,depthWrite:false}))); }
    sync(); };
  const sync=()=>{ for(const m of STACKS.marks||[]){ m.me.visible=INV.ready('stacks'+m.i); m.th.name=INV.ready('stacks'+m.i)?'A ROTTED BOOK':'A SHELF (EMPTY TILL TOMORROW)'; } };
  const reg=()=>{ if(ROOMS.off.stacks)return true; if(!ROOMS.off.books||!MSHOP.at||!MSHOP.at.books)return false; const F=frame(), sp=F.pw(2.8,RD-1.6), o=ROOMS.off.books.out;
    ROOMS.off.stacks={name:'THE SEALED STACKS',box:(()=>{ const a=F.pw(0,0), b=F.pw(RW,RD); return {x0:Math.min(a[0],b[0])-.3*T,z0:Math.min(a[1],b[1])-.3*T,x1:Math.max(a[0],b[0])+.3*T,z1:Math.max(a[1],b[1])+.3*T,y0:-1,y1:(H+.5)*MW}; })(),noCeil:true,need:()=>LOAD('later'),
      build:()=>ROOMS.part(G=Object.assign(new THREE.Group(),{name:'stacks-in'}),()=>{ scene.add(G); furnish(); }),unbuild:()=>{ if(G)G.removeFromParent(); G=null; GH=null; STACKS.marks=null; },
      spawn:[sp[0],sp[1],0,F.hd(0,-1)],out:o.slice()};
    if(ROOMS.reset)ROOMS.reset(); return true; };
  { let done=false; SYS.add('life',()=>{ if(!done)done=reg(); },'144cc-stacks-reg'); }
  window.STACKSDBG=()=>({reg:!!ROOMS.off.stacks,inside:ROOMS.offIn&&ROOMS.offIn()==='stacks',built:!!G,key:FORAGE.has('stack_key'),ready:SPOTS.map((_,i)=>INV.ready('stacks'+i)),ghost:!!(GH&&GH.visible),outs:STACKS.outs||0});
}
