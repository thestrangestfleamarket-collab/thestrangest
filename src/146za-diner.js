// THE DINER: its inside off the map, laid out as a real diner: the dining room (a counter of eight stools, three booths of four on the windows: 20 seats), the back counter and the pass window, the kitchen behind it, built round its chef (the octopus, twice the drummer's size, all eight arms at the line, the prep fridge, the bread table and the pass, handing plates out the window to the waitress), the walk-in and the dish pit, two restrooms; its staff's work spots by job title.
import {SHARED, THREE} from './003-shx.js';
import {pos, ROOMS, UI, USE} from './003b-systems.js';
import {PPU} from './004-main.js';
import {SYS, TILE, ZU} from './006-map-pre.js';
import {MSHOP} from './059i-mshops.js';
import {octBody} from './125-game-zzz-bar-octopus-1-body.js';
import {octFig} from './127-drummer.js';
const DINER={on:false,seats:0,items:[],spots:{}}; window.DINER=DINER;
{ const T=TILE, MW=T/.84;   // world units in a metre
  // where the room's corner and axes are (u east, v toward the front door, in metres)
  const frame=R=>{ const {X,Z}=SHARED.BOD, EX=Math.sign(X(R.x1)-X(R.x0)), IN=Math.sign(Z(R.y1)-Z(R.y0));
    return {EX,IN,W:Math.abs(X(R.x1)-X(R.x0))/MW,D:Math.abs(Z(R.y1)-Z(R.y0))/MW,wx:u=>X(R.x0)+EX*u*MW,wz:v=>Z(R.y0)+IN*v*MW,hd:(du,dv)=>Math.atan2(EX*du,IN*dv)}; };
  // the 20 seats [u,v,seat height,facing du,dv]: the counter's stools, then each booth bench's two places
  const SEATS=(W,D)=>{ const st=[], bo=[]; for(let i=0;i<8;i++)st.push([.7+i*.92,7.85,.78,0,-1]);
    for(const u0 of [.1,2.3,W-2.06])for(const [a,dir] of [[u0,1],[u0+1.96,-1]])bo.push([[a+dir*.36,D-1.05,.47,dir,0],[a+dir*.36,D-.4,.47,dir,0]]); return {st,bo}; };
  const at=MSHOP.at.diner, room=ROOMS.off.diner;
  if(at&&room){ const F=frame(at.R), sp=(u,v,du,dv)=>({x:F.wx(u),z:F.wz(v),hd:F.hd(du,dv)});
    const S=SEATS(F.W,F.D); room.seats=[...S.st,...S.bo.flat()].map(([u,v,h,du,dv])=>({x:F.wx(u),z:F.wz(v),y:h*MW,hd:F.hd(du,dv)}));
    room.spots=DINER.spots={COOK:sp(7.4,2.6,-1,0),WAITRESS:sp(5.4,6.0,0,-1),COFFEE:sp(.8,6.0,0,-1),WAITER:sp(11.7,5.7,1,0),REGULAR:sp(7.65,7.85,0,-1)}; }

  MSHOP.kit.diner=A=>{ '@later'; const {R,hs,sh}=A, {EX,IN,W,D,wx,wz,hd}=frame(R), H=A.Y(A.WH)/MW, K=A.Y(1)/MW, CX=W/2;
    const tu=u=>R.x0+u/W*(R.x1-R.x0), tv=v=>R.y0+v/D*(R.y1-R.y0), sol=(u0,v0,u1,v1)=>A.sol(tu(u0),tv(v0),tu(u1),tv(v1));
    const IT=DINER.items=[], it=n=>IT.push(n); DINER.seats=0;
    /* ---------- the floor and the outer walls, painted ---------- */
    const KV=4.6, KU=8.5, MU=10.72;   // the kitchen and restrooms end at v KV; the kitchen at u KU, the men's room at MU
    A.floor((x,y)=>{ const u=(x-R.x0)/(R.x1-R.x0)*W, v=(R.y1-y)/(R.y1-R.y0)*D, n=hs(Math.floor(u*20),Math.floor(v*20),3);
      if(v<KV+.08&&u<KU){ const fu=u/.2%1, fv=v/.2%1; return fu<.08||fv<.08?sh([92,74,64],1):sh([158,72,52],.9+.12*n); }
      if(v<KV+.08){ const fu=u/.1%1, fv=v/.1%1; return fu<.12||fv<.12?sh([186,190,188],1):sh([232,234,230],.94+.06*n); }
      return ((Math.floor(u/.4)+Math.floor(v/.4))&1)?sh([228,224,214],.94+.06*n):sh([34,32,38],1); });
    const tile=(s,z,base,top,th)=>{ if(z<th){ const r=Math.floor(z/.075), c=(s/.15+(r&1)*.5)%1, g=z/.075%1; return c<.07||g<.1?sh([176,180,178],1):sh(base,.95+.05*hs(Math.floor(s/.15),r,4)); } return sh(top,.95+.05*hs(Math.floor(s*3),Math.floor(z*3),6)); };
    const dining=(s,z,side)=>{ if(side==='f'){ const d=Math.abs(s-CX);
        if(d<.83&&z<2.15)return d>.75||z>2.07?sh([196,198,202],1):Math.abs(z-1.03)<.03?sh([206,206,210],1.1):sh([118,148,168],.9+.25*z/2.15);
        if(z>1.05&&z<2.35&&s>.15&&s<W-.15&&d>1.0){ const m=(s<CX?s-.15:s-CX-1.0)%1.3; if(m<.05||z<1.1||z>2.3)return sh([200,204,208],1); return sh([150,186,206],.85+.25*(z-1.05)/1.3); } }
      if(z<.95){ const q=(Math.floor((s+z)/.12)+Math.floor((s-z+5)/.12))&1; return sh([178,40,48],q?.92:1); }
      if(z<1.03)return sh([210,212,216],1.15); if(z>H-.1)return sh([206,208,212],1);
      return sh([236,226,196],.92+.08*hs(Math.floor(s*4),Math.floor(z*4),9)); };
    const wallP=side=>(a,zp)=>{ const z=zp*K, s=side==='b'||side==='f'?(a-R.x0)/(R.x1-R.x0)*W:(a-R.y0)/(R.y1-R.y0)*D;
      if(side==='b')return s<KU?tile(s,z,[236,238,234],[226,224,214],2):tile(s,z,[196,214,222],[232,230,222],1.4);
      if(side==='w'&&s<KV)return tile(s,z,[236,238,234],[226,224,214],2); if(side==='e'&&s<KV)return tile(s,z,[196,214,222],[232,230,222],1.4);
      return dining(s,z,side); };
    for(const s of ['b','w','e','f'])A.wall(s,wallP(s));
    /* ---------- the makers: boxes, cylinders and balls in metres, merged into a few meshes ---------- */
    const V3=THREE.Vector3, COL=new THREE.Color(), bag=()=>({p:[],n:[],c:[]}), MAIN=bag(), GLOW=bag(); let CUR=MAIN;
    const addG=g=>{ const q=g.index?g.toNonIndexed():g, p=q.attributes.position.array, n=q.attributes.normal.array; for(let i=0;i<p.length;i+=3){ CUR.p.push(p[i],p[i+1],p[i+2]); CUR.n.push(n[i],n[i+1],n[i+2]); CUR.c.push(COL.r,COL.g,COL.b); } g.dispose(); if(q!==g)q.dispose(); };
    const box=(u0,v0,u1,v1,h0,h1,c)=>{ COL.set(c); const g=new THREE.BoxGeometry(Math.abs(u1-u0)*MW,(h1-h0)*MW,Math.abs(v1-v0)*MW); g.translate((wx(u0)+wx(u1))/2,(h0+h1)/2*MW,(wz(v0)+wz(v1))/2); addG(g); };
    const cyl=(u,v,r,h0,h1,c,rt=r,seg=12)=>{ COL.set(c); const g=new THREE.CylinderGeometry(rt*MW,r*MW,(h1-h0)*MW,seg); g.translate(wx(u),(h0+h1)/2*MW,wz(v)); addG(g); };
    const ball=(u,v,h,r,c,sy=1)=>{ COL.set(c); const g=new THREE.SphereGeometry(r*MW,10,7); g.scale(1,sy,1); g.translate(wx(u),h*MW,wz(v)); addG(g); };
    const glow=f=>{ const c=CUR; CUR=GLOW; f(); CUR=c; };
    const matL=new THREE.MeshLambertMaterial({vertexColors:true}), matB=new THREE.MeshBasicMaterial({vertexColors:true});
    const meshOf=(b,mat,own)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3));
      const me=new THREE.Mesh(g,mat); if(own){ g.computeBoundingBox(); const c=g.boundingBox.getCenter(new V3()); c.y=g.boundingBox.min.y; g.translate(-c.x,-c.y,-c.z); me.position.copy(c); }
      me.castShadow=mat===matL; me.receiveShadow=true; A.add(me); return me; };
    const own=f=>{ const c=CUR, b=bag(); CUR=b; f(); CUR=c; return b; };
    // a flat picture facing (du,dv), its bottom middle at u,v,h (metres)
    const pic=(u,v,h,w,hh,du,dv,tex,lit)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w*MW,hh*MW),lit?new THREE.MeshBasicMaterial({map:tex}):new THREE.MeshLambertMaterial({map:tex})); m.position.set(wx(u),(h+hh/2)*MW,wz(v)); m.rotation.y=hd(du,dv); A.add(m); return m; };
    const words=(w,h,bg,lines,fg='#f0e8d0')=>A.tex(w,h,(g,W_,H_)=>{ g.fillStyle=bg; g.fillRect(0,0,W_,H_); g.textBaseline='top'; for(const [t,x,y,c,sz,al] of lines){ g.fillStyle=c||fg; g.font=(sz||8)+'px monospace'; g.textAlign=al||'left'; g.fillText(t,x,y); } });
    const seat=(name,b,spots,reach)=>{ const me=meshOf(b,matL,true); me.name=name; DINER.seats+=spots.length;
      const th={name,obj:me,reach:reach*T,near:(reach+1.2)*T,tall:1.2*T,act:()=>{ let best=spots[0], bd=1e9; for(const s of spots){ const d=Math.hypot(wx(s[0])-pos.x,wz(s[1])-pos.z); if(d<bd){ bd=d; best=s; } } USE.sitAt(wx(best[0]),wz(best[1]),best[2]*MW,hd(best[3],best[4])); }};
      UI.thing(th); return me; };
    const C={red:0xb8262e,cream:0xeee2c4,chrome:0xc8ccd0,steel:0xa8acb0,dsteel:0x6e7276,black:0x1e1e22,wood:0x5a2a24,formica:0xe6dcc6,vinyl:0xc0303a,white:0xf2f2f0,porc:0xf4f6f6,tileK:0xe8ecea,tileR:0xd4e4ea};
    /* ---------- the partition (kitchen and restrooms behind it): a window to the pass, the kitchen's swing door, the restroom doors ---------- */
    const P0=KV, P1=KV+.15;
    const pwall=(u0,u1,h0,h1)=>{ box(u0,P0,u1,P1,h0,h1,C.cream); if(h0<.95)box(u0,P1,u1,P1+.01,h0,Math.min(h1,.95),C.red); if(h0<1.03&&h1>.95)box(u0,P1,u1,P1+.012,Math.max(h0,.95),Math.min(h1,1.03),C.chrome);
      box(u0,P0-.01,u1,P0,h0,h1,u1<=KU?C.tileK:C.tileR); };
    const WIN=[3.0,6.4], KD=[7.3,8.3], MD=[9.2,10.1], WD=[11.5,12.4];
    pwall(0,WIN[0],0,H); pwall(WIN[0],WIN[1],0,1.15); pwall(WIN[0],WIN[1],2.0,H); pwall(WIN[1],KD[0],0,H); pwall(KD[0],KD[1],2.1,H); pwall(KD[1],MD[0],0,H);
    pwall(MD[0],MD[1],2.1,H); pwall(MD[1],WD[0],0,H); pwall(WD[0],WD[1],2.1,H); pwall(WD[1],W,0,H);
    for(const [a,b] of [[0,WIN[0]],[WIN[1],KD[0]],[KD[1],MD[0]],[MD[1],WD[0]],[WD[1],W]])sol(a,P0,b,P1); sol(WIN[0],P0,WIN[1],P1);
    box(KU,0,KU+.12,KV,0,H,C.tileK); sol(KU,0,KU+.12,KV); box(MU,0,MU+.12,KV,0,H,C.tileR); sol(MU,0,MU+.12,KV); it('the partition'); it('the kitchen wall'); it('the restrooms\' wall');
    /* ---------- the kitchen, built round the octopus on his stool in the middle: the line behind him, the prep fridge and the bread table at his sides, the pass in front ---------- */
    const OU=4.7, OV=2.3;
    box(0,0,2.2,2.4,0,2.5,C.steel); box(0,0,2.2,2.4,2.5,2.55,C.dsteel); box(2.2,.7,2.23,1.6,.05,2.1,0xbcc0c4); box(2.23,1.42,2.27,1.5,.95,1.2,C.dsteel); sol(0,0,2.22,2.4); it('the walk-in cooler');
    pic(2.24,1.15,2.15,.6,.18,1,0,words(48,14,'#1c3a6a',[['WALK-IN',24,3,'#e8eef4',8,'center']]));
    for(const u of [2.6,3.0]){ box(u,.05,u+.4,.8,0,.9,C.steel); box(u+.05,.15,u+.35,.65,.9,.915,0x3a2810); box(u+.08,.25,u+.32,.55,.84,.96,0x8a8a80); box(u+.17,.55,u+.23,.88,.95,.98,C.black); it('a deep fryer'); }
    box(3.4,.05,4.6,.8,0,.85,C.steel); box(3.42,.1,4.58,.76,.85,.88,0x2c2c2c); box(3.4,.05,4.6,.12,.88,1.05,C.steel); it('the griddle');
    for(const [u,v] of [[3.6,.35],[3.82,.35],[4.04,.35],[4.26,.35]])cyl(u,v,.08,.88,.905,0x5a3420); for(const [u,v] of [[3.7,.6],[4.05,.62]]){ cyl(u,v,.07,.88,.89,C.white); ball(u,v,.895,.025,0xf0b020,.6); } for(let i=0;i<3;i++)box(4.38,.25+i*.08,4.52,.3+i*.08,.88,.89,0xa83c28); it('burgers, eggs and bacon');
    box(4.6,.05,5.5,.8,0,.9,C.steel); box(4.65,.8,5.45,.82,.12,.7,C.dsteel); box(4.75,.82,5.35,.85,.62,.65,C.chrome); for(const [u,v] of [[4.82,.3],[5.28,.3],[4.82,.6],[5.28,.6]])cyl(u,v,.12,.9,.925,0x262626); for(let i=0;i<6;i++)cyl(4.7+i*.14,.82,.025,.76,.8,C.black); it('the range');
    cyl(4.85,.6,.13,.93,.98,0x2a2a2c); box(4.83,.73,4.87,1.0,.955,.975,C.black); it('a frying pan'); cyl(5.28,.3,.15,.925,1.2,C.steel); it('a stockpot');
    box(5.5,.05,6.1,.8,0,.85,C.steel); box(5.53,.1,6.07,.75,.85,.88,0x1a1a1a); glow(()=>{ for(let i=0;i<5;i++)box(5.56+i*.1,.15,5.6+i*.1,.7,.86,.865,0xff6a20); }); it('the char broiler');
    box(2.5,0,6.2,1.0,2.1,2.55,C.steel); box(2.55,.05,6.15,.95,2.08,2.1,0x55585c); glow(()=>{ for(const u of [3.2,5.0])box(u,.4,u+.3,.6,2.07,2.08,0xfff4d8); }); it('the hood'); sol(2.6,0,6.65,.82);
    box(6.15,.05,6.65,.8,0,2.0,C.steel); box(6.2,.8,6.6,.81,.1,1.95,C.dsteel); box(6.52,.81,6.55,.84,.9,1.3,C.dsteel); it('the reach-in fridge');
    box(6.7,0,8.0,.65,0,.85,C.steel); for(const u of [6.75,7.17,7.59])box(u,.08,u+.36,.55,.845,.86,0x7a8086); for(const u of [6.93,7.35,7.77]){ cyl(u,.05,.015,.85,1.25,C.chrome); box(u-.015,.05,u+.015,.25,1.23,1.26,C.chrome); } sol(6.7,0,8.0,.65); it('the three-bowl sink');
    box(7.85,.8,KU,1.5,0,1.5,C.steel); box(7.83,.95,7.85,1.35,.9,1.0,C.dsteel); it('the dish machine');
    for(let k=0;k<4;k++){ box(8.1,1.7,KU,2.7,.3+k*.45,.32+k*.45,C.chrome); for(let j=0;j<4;j++)cyl(8.3,1.85+j*.24,.11,.32+k*.45,.32+k*.45+.06+.04*((k+j)&1),k<2?C.white:0xd8d0c0); } for(const v of [1.7,2.7])box(8.1,v-.02,8.13,v+.02,0,1.7,C.chrome); sol(7.85,.8,KU,2.7); it('the dish shelf'); it('plates and bowls');
    box(3.4,1.5,6.0,3.2,0,.015,0x1a1a1a); it('a rubber mat'); cyl(OU,OV,.34,0,.06,C.dsteel); cyl(OU,OV,.06,.06,.36,C.chrome); cyl(OU,OV,.4,.36,.42,C.steel); sol(OU-.6,OV-.6,OU+.6,OV+.6); it('the octopus\'s stool');
    box(2.4,1.7,3.1,3.5,0,.88,C.steel); box(2.4,1.7,3.1,3.5,.88,.9,0xc0c4c8); for(let i=0;i<6;i++)box(2.48+(i%2)*.32,1.8+Math.floor(i/2)*.3,2.76+(i%2)*.32,2.05+Math.floor(i/2)*.3,.89,.9,[0x58a038,0xc02818,0xe8e0c0,0xf0c030,0x8a4a2a,0x7a3a8a][i]);
    box(2.42,2.7,3.08,3.45,.9,.94,0x9a6a3a); box(2.7,2.95,2.74,3.25,.94,.95,C.chrome); for(let i=0;i<4;i++)ball(2.55,2.78+i*.09,.97,.04,0xc02818); sol(2.4,1.7,3.1,3.5); it('the sandwich fridge'); it('lettuce, tomato, onion, cheese'); it('a cutting board and a knife');
    box(6.3,1.7,7.0,3.4,.88,.92,C.steel); box(6.35,1.75,6.95,3.35,.2,.23,C.steel); for(const [u,v] of [[6.32,1.72],[6.98,1.72],[6.32,3.38],[6.98,3.38]])box(u-.02,v-.02,u+.02,v+.02,0,.88,C.chrome); sol(6.3,1.7,7.0,3.4); it('the bread table');
    box(6.45,1.8,6.8,2.05,.92,1.1,C.chrome); box(6.53,1.85,6.72,2.0,1.1,1.105,C.black); it('the toaster'); box(6.4,2.2,6.9,2.45,.92,1.02,0xd8a868); it('a loaf of bread'); for(let i=0;i<8;i++)cyl(6.65,2.75,.12,.92+i*.02,.935+i*.02,C.white); it('a stack of plates');
    box(6.5,3.0,6.85,3.3,.92,1.05,0x2a2a2c); glow(()=>box(6.55,2.99,6.8,3.0,1.0,1.04,0x60ff90)); it('the ticket printer');
    box(6.35,2.2,6.95,2.24,2.2,2.24,C.dsteel); for(const u of [6.4,6.9])box(u,2.21,u+.01,2.23,2.24,H,C.dsteel); for(const [u,r] of [[6.45,.12],[6.65,.15],[6.85,.1]]){ box(u-.005,2.215,u+.005,2.225,2.0,2.2,C.dsteel); cyl(u,2.22,r,1.8,2.0,0xb06a3a); } it('the pot rack'); it('copper pots');
    box(2.9,3.85,6.5,KV,0,.9,C.steel); box(2.9,3.85,6.5,KV,.9,.93,0xc0c4c8); sol(2.9,3.85,6.5,KV); it('the pass counter');
    box(WIN[0],KV-.3,WIN[1],KV-.05,1.95,2.0,C.dsteel); glow(()=>box(WIN[0]+.05,KV-.28,WIN[1]-.05,KV-.07,1.94,1.95,0xffa040)); it('the heat lamps');
    box(WIN[0],KV-.05,WIN[1],P1+.2,1.15,1.19,C.steel); for(const u of [3.4,4.2]){ cyl(u,KV+.05,.12,1.19,1.21,C.white); ball(u,KV+.05,1.23,.07,u<4?0x8a5a2a:0xd8b048,.5); } cyl(6.1,KV+.1,.05,1.19,1.22,0xd8b048); ball(6.1,KV+.1,1.22,.04,0xd8b048,.8); it('the pass shelf'); it('plates up'); it('the order bell');
    box(3.1,KV-.06,6.3,KV-.03,1.86,1.9,C.chrome); for(let i=0;i<5;i++)box(3.3+i*.6,KV-.055,3.42+i*.6,KV-.045,1.68,1.86,0xf4f0e0); it('the ticket rail');
    for(let k=0;k<4;k++){ box(0,3.55,.5,4.5,.15+k*.5,.18+k*.5,C.chrome); for(let j=0;j<4;j++){ const c=[0xc83a2a,0xe0c050,0x4a7a3a,0xd8d0c0,0x2a5a9a][(k+j)%5]; if(hs(k,j,7)>.2)box(.05,3.62+j*.22,.42,3.78+j*.22,.18+k*.5,.18+k*.5+.18+.12*hs(j,k,2),c); } } for(const v of [3.55,4.5])box(0,v-.02,.5,v+.02,0,1.8,C.chrome); sol(0,3.55,.5,4.5); it('the dry-goods shelf'); it('cans, sacks and boxes');
    box(.06,4.05,.45,4.4,1.68,1.95,0x2a2a2c); box(.44,4.1,.45,4.35,1.72,1.91,0x101418); it('a microwave');
    box(0,2.55,.05,3.45,0,2.1,0x7a7e82); box(.05,2.65,.09,3.35,.95,1.02,C.chrome); glow(()=>box(.01,2.85,.04,3.15,2.2,2.36,0xe02020)); pic(.045,3.0,2.21,.26,.13,1,0,words(26,13,'#c01818',[['EXIT',13,2,'#ffe8e0',8,'center']]),true); it('the back door'); it('an exit sign');
    cyl(7.45,1.05,.2,0,.78,0x4a5a4a,.22); cyl(7.45,1.05,.23,.78,.82,0x3a4a3a); sol(7.22,.82,7.68,1.28); it('a kitchen bin');
    box(.65,4.0,1.0,4.35,0,.3,0xe8c030); box(.82,4.17,.85,4.2,.3,1.4,0xa07040); it('a mop and bucket');
    cyl(KU-.08,3.6,.075,.9,1.38,C.red); box(KU-.04,3.57,KU,3.63,1.2,1.3,C.black); it('a fire extinguisher');
    /* ---------- the swing door to the kitchen: two leaves that swing open as you come through ---------- */
    const leaf=(u,dir)=>{ const L=own(()=>{ box(u,P0+.06,u+dir*.49,P0+.09,.05,2.05,C.steel); }), me=meshOf(L,matL,false), pv=new THREE.Group(); pv.position.set(wx(u),0,wz(P0+.075)); me.position.set(-wx(u),0,-wz(P0+.075)); me.userData.noMerge=true; pv.add(me);
      const ph=new THREE.Mesh(new THREE.CircleGeometry(.12*MW,12),new THREE.MeshLambertMaterial({color:0x2a3440,side:THREE.DoubleSide})); for(const k of [-1,1]){ const q=k<0?ph:ph.clone(); q.position.set(EX*dir*.25*MW,1.55*MW,k*.017*MW); q.userData.noMerge=true; pv.add(q); } A.add(pv); return {pv,dx:EX*dir}; };
    DINER.door={L:[leaf(KD[0],1),leaf(KD[1],-1)],x:wx((KD[0]+KD[1])/2),z:wz(P0+.075),a:0,side:1}; it('the kitchen\'s swing doors');
    /* ---------- the restrooms ---------- */
    for(const [u0,u1,men] of [[KU+.12,MU,true],[MU+.12,W,false]]){ const tc=u1-.55, d0=men?MD[0]:WD[0];
      box(tc-.22,0,tc+.22,.2,.7,1.05,C.porc); cyl(tc,.42,.18,0,.4,C.porc,.2); cyl(tc,.42,.2,.4,.43,C.white); box(tc+.3,.3,tc+.38,.38,.6,.68,C.chrome); sol(tc-.24,0,tc+.24,.65); it(men?'the men\'s toilet':'the women\'s toilet'); it('a paper roll');
      box(u1-.42,2.4,u1,2.85,.78,.88,C.porc); box(u1-.36,2.46,u1-.06,2.79,.875,.885,0xc8d4d8); cyl(u1-.08,2.62,.015,.88,1.0,C.chrome); box(u1-.012,2.35,u1,2.9,1.2,1.85,0xc4dce4); sol(u1-.42,2.4,u1,2.85); it('a washbasin'); it('a mirror');
      box(u1-.1,3.15,u1,3.45,1.1,1.5,C.steel); it('a towel dispenser'); cyl(u1-.28,3.8,.15,0,.45,C.steel); it('a bin');
      box(d0,KV-.9,d0+.04,KV,0,2.05,0x9a6a48); it('a door, open');
      if(men){ box(u0,2.0,u0+.25,2.45,.5,1.2,C.porc); box(u0+.2,2.05,u0+.25,2.4,.55,.62,0xc8d4d8); it('the urinal'); }
      else { box(u0,1.6,u0+.14,2.4,.85,1.35,0xd8d0c0); it('a baby changing table'); }
      pic(men?(KD[1]+MD[0])/2:(MD[1]+WD[0])/2,P1+.015,1.35,.3,.3,0,1,words(24,24,men?'#2a4a8a':'#8a2a4a',[[men?'MEN':'WOMEN',12,8,'#f4f0e8',men?8:7,'center']])); it(men?'a MEN sign':'a WOMEN sign'); }
    /* ---------- the back counter, under the pass and the menu board ---------- */
    const BB=[P1,P1+.7]; box(0,BB[0],7.1,BB[1],0,.88,C.wood); box(0,BB[0],7.1,BB[1]+.02,.88,.92,0xd8d8d4); box(0,BB[1]-.02,7.1,BB[1]+.01,0,.1,C.black); sol(0,BB[0],7.1,BB[1]+.02); it('the back counter');
    box(.25,BB[0]+.03,.85,BB[0]+.4,.92,1.55,C.steel); for(const u of [.4,.7]){ glow(()=>cyl(u,BB[0]+.5,.07,.92,.93,0xff3a20)); cyl(u,BB[0]+.5,.07,.93,1.12,0x4a2a14,.05); box(u+.06,BB[0]+.49,u+.08,BB[0]+.51,1.0,1.1,C.black); } it('the coffee brewer'); it('two pots of coffee');
    box(1.12,BB[0]+.15,1.48,BB[0]+.45,.92,.98,0x7ac8b0); box(1.22,BB[0]+.15,1.38,BB[0]+.27,.98,1.42,0x7ac8b0); box(1.12,BB[0]+.15,1.48,BB[0]+.4,1.36,1.46,0x7ac8b0); for(const u of [1.2,1.4]){ cyl(u,BB[0]+.35,.045,1.06,1.24,C.chrome,.055); } it('the milkshake mixer');
    box(1.7,BB[0]+.05,2.4,BB[0]+.45,.92,1.45,0xc02028); for(let i=0;i<3;i++)box(1.8+i*.22,BB[0]+.45,1.86+i*.22,BB[0]+.55,1.2,1.32,C.chrome); box(1.75,BB[0]+.45,2.35,BB[0]+.6,.92,.95,C.dsteel); it('the soda fountain');
    for(let i=0;i<4;i++)cyl(2.65,BB[0]+.35,.05,.92+i*.09,1.0+i*.09,C.white,.055); it('a stack of mugs');
    box(6.4,BB[0]+.05,7.0,BB[1]-.05,.92,1.0,C.steel); it('the ice bin');
    box(.2,P1,2.9,P1+.2,1.45,1.48,C.chrome); for(let i=0;i<9;i++)cyl(.35+i*.29,P1+.1,.035,1.48,1.6,0xcfe3ea); it('a glass shelf');
    pic(1.55,P1+.012,1.62,2.6,1.0,0,1,A.tex(208,80,(g,w,h)=>{ g.fillStyle='#16140f'; g.fillRect(0,0,w,h); g.fillStyle='#c9a24a'; g.fillRect(0,0,w,2); g.fillRect(0,h-2,w,2); g.textBaseline='top'; g.font='8px monospace';
      const L=[['BREAKFAST',''],['2 EGGS ANY STYLE','3.50'],['PANCAKE STACK','3.25'],['HASH & EGGS','4.00'],['',''],['COFFEE  BOTTOMLESS','.75']], R2=[['LUNCH',''],['CHEESEBURGER','4.75'],['BLT ON TOAST','3.75'],['GRILLED CHEESE','3.00'],['PIE  THE SLICE','2.50'],['MILKSHAKE','2.25']];
      [L,R2].forEach((col,k)=>col.forEach(([a,b],i)=>{ g.fillStyle=i===0?'#f0c040':'#f4ecd8'; g.textAlign='left'; g.fillText(a,6+k*104,6+i*12); g.textAlign='right'; g.fillText(b,98+k*104,6+i*12); })); }),true); it('the menu board');
    pic((KD[0]+KD[1])/2,P1+.012,2.22,.38,.38,0,1,A.tex(32,32,(g,w,h)=>{ g.fillStyle='#c02028'; g.beginPath(); g.arc(16,16,15,0,7); g.fill(); g.fillStyle='#f4f0e4'; g.beginPath(); g.arc(16,16,12,0,7); g.fill(); g.strokeStyle='#1a1a1a'; g.lineWidth=2; g.beginPath(); g.moveTo(16,16); g.lineTo(16,7); g.moveTo(16,16); g.lineTo(22,19); g.stroke(); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; g.fillStyle='#1a1a1a'; g.fillRect(16+Math.sin(a)*10-.5,16-Math.cos(a)*10-.5,1.5,1.5); } })); it('the clock');
    /* ---------- the counter and its eight stools ---------- */
    const CV=[6.55,7.42], CU=7.95; box(0,7.15,CU-.05,7.25,0,1.0,0xb0b4b8); box(CU-.05,6.6,CU,7.25,0,1.0,0xb0b4b8); box(0,7.24,CU,7.26,.55,.65,C.red); box(0,7.2,CU,7.27,0,.12,C.black);
    box(0,CV[0],CU,CV[1],1.0,1.06,C.formica); box(0,CV[1]-.04,CU,CV[1],1.0,1.06,C.chrome); for(const h of [.05,.5])box(.02,6.62,CU-.06,7.15,h,h+.03,C.dsteel);
    for(let i=0;i<10;i++){ cyl(.4+i*.75,6.88,.11,.53,.56,C.white); cyl(.4+i*.75,6.88,.11,.08,.11+.03*(i%3),C.white); } box(0,7.48,CU-.1,7.52,.18,.22,C.chrome); for(let i=0;i<5;i++)box(.3+i*1.8,7.27,.33+i*1.8,7.5,.18,.22,C.chrome);
    sol(0,CV[0],CU,CV[1]); it('the counter'); it('the foot rail'); it('plates under the counter');
    box(7.45,6.75,7.85,7.2,1.06,1.16,C.black); box(7.48,6.8,7.82,7.15,1.16,1.38,0xc8a04a); box(7.48,7.0,7.82,7.18,1.16,1.24,0xb08838); glow(()=>box(7.55,6.82,7.75,6.84,1.3,1.36,0x60ff90)); it('the cash register');
    cyl(3.7,6.98,.22,1.06,1.1,C.chrome); cyl(3.7,6.98,.03,1.1,1.42,C.chrome); for(const [h,c] of [[1.1,0xd89a48],[1.26,0xa83040]]){ cyl(3.7,6.98,.19,h,h+.015,C.chrome); cyl(3.7,6.98,.15,h+.015,h+.07,c,.14); }
    { const dm=new THREE.Mesh(new THREE.SphereGeometry(.23*MW,14,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0xdcecf4,transparent:true,opacity:.28,depthWrite:false})); dm.scale.y=1.55; dm.position.set(wx(3.7),1.1*MW,wz(6.98)); A.add(dm); } it('the pie case'); it('two pies');
    cyl(2.0,6.95,.04,1.06,1.22,C.chrome); cyl(2.0,6.95,.17,1.22,1.24,C.chrome); cyl(2.0,6.95,.14,1.24,1.36,0x6a3a1e); cyl(2.0,6.95,.14,1.36,1.39,0xf0e0d0); it('a cake on a stand');
    const condH=(u,v,h)=>{ box(u-.06,v-.05,u+.06,v+.05,h,h+.12,C.chrome); cyl(u+.1,v,.018,h,h+.08,C.white); cyl(u+.14,v,.018,h,h+.08,0x3a3a3a); cyl(u-.11,v,.025,h,h+.16,0xc01818); cyl(u-.16,v,.025,h,h+.16,0xe0b818); it('napkins, salt, pepper, ketchup and mustard'); };
    for(const u of [1.2,4.75,6.6])condH(u,6.8,1.06);
    const meal=(u,v,h,c)=>{ cyl(u,v,.12,h,h+.02,C.white); ball(u,v,h+.035,.07,c,.5); it('a plate of food'); }, mug=(u,v,h)=>{ cyl(u,v,.04,h,h+.09,C.white); box(u+.04,v-.01,u+.06,v+.01,h+.02,h+.07,C.white); it('a mug of coffee'); };
    const ST=SEATS(W,D); for(let i=0;i<8;i++){ const [u,v]=ST.st[i];
      seat('STOOL',own(()=>{ cyl(u,v,.18,0,.04,C.chrome); cyl(u,v,.035,.04,.68,C.chrome); cyl(u,v,.21,.66,.69,C.chrome); cyl(u,v,.2,.69,.78,C.vinyl,.19); }),[ST.st[i]],.8); it('a stool'); }
    /* ---------- the booths on the windows ---------- */
    let nb=0; const booth=u0=>{ const v0=D-1.45, v1=D;
      for(const [a,dir] of [[u0,1],[u0+1.96,-1]]){ const sp=ST.bo[nb++]; const b=a+dir*.6, lo=Math.min(a,b), hi=Math.max(a,b), back=dir>0?[lo,lo+.12]:[hi-.12,hi];
        seat('BOOTH',own(()=>{ box(lo,v0,hi,v1,0,.38,C.wood); box(lo+(dir>0?.1:0),v0,hi-(dir>0?0:.1),v1,.38,.47,C.vinyl); box(back[0],v0,back[1],v1,.38,1.1,C.vinyl); box(back[0],v0,back[1],v1,1.1,1.14,C.chrome); box(lo,v0-.01,hi,v0,.0,.4,C.chrome); }),
          sp,1.0); sol(lo,v0,hi,v1); it('a booth bench'); }
      const t0=u0+.62, t1=u0+1.34; box(t0,v0+.18,t1,v1,.72,.76,C.formica); box(t0,v0+.16,t1,v0+.2,.72,.76,C.chrome); cyl((t0+t1)/2,v0+.85,.04,.05,.72,C.chrome); cyl((t0+t1)/2,v0+.85,.2,0,.05,C.dsteel); sol(t0,v0+.16,t1,v1); it('a booth table');
      box((t0+t1)/2-.12,v1-.12,(t0+t1)/2+.12,v1,.76,1.02,C.chrome); glow(()=>box((t0+t1)/2-.09,v1-.125,(t0+t1)/2+.09,v1-.12,.84,.98,0xf0d070)); it('a tabletop jukebox');
      condH((t0+t1)/2,v1-.3,.76); return [t0,t1,v0]; };
    const B1=booth(.1), B2=booth(2.3), B3=booth(W-2.06);
    // a plate and a mug in front of each seat, shown while someone sits there
    const FOOD=[0x8a5a2a,0xd8b048,0x58a038,0xc87a3a,0xe0d0a0]; DINER.set=[...ST.st,...ST.bo.flat()].map(([u,v,h,du,dv],i)=>{ const pu=u+(du?du*.42:0), pv=v+(dv?dv*.62:0), hh=dv?1.06:.76, mu=pu+(dv?.2:0), mv=pv+(du?.17:.05);
      const me=meshOf(own(()=>{ meal(pu,pv,hh,FOOD[i%FOOD.length]); mug(mu,mv,hh); }),matL,true); me.visible=false; me.userData.noMerge=true; return me; });
    /* ---------- by the door and down the east wall: the host stand, the wait station, the jukebox, the bins ---------- */
    box(7.65,11.75,8.2,12.15,0,1.1,C.wood); box(7.62,11.72,8.23,12.18,1.1,1.14,0xd8d0c0); for(let i=0;i<4;i++)box(7.75,11.82,8.1,12.08,1.14+i*.012,1.15+i*.012,0x8a2a2a); sol(7.62,11.72,8.23,12.18); it('the host stand'); it('a pile of menus');
    pic(7.92,12.152,.6,.5,.4,0,1,words(40,32,'#1a1a1a',[['PLEASE',20,2,'#f0d070',8,'center'],['WAIT TO',20,11,'#f0d070',8,'center'],['BE SEATED',20,20,'#f0d070',7,'center']])); it('a PLEASE WAIT TO BE SEATED sign');
    cyl(8.75,12.5,.12,0,.08,C.red); cyl(8.75,12.5,.04,.08,.9,C.red); box(8.65,12.4,8.85,12.6,.9,1.05,C.red); ball(8.75,12.5,1.2,.17,0xd8eef4); for(let i=0;i<7;i++){ const a=i*.9; ball(8.75+Math.cos(a)*.15,12.5+Math.sin(a)*.15,1.13+(i%3)*.06,.035,[0xe03030,0x30a0e0,0xf0d020,0x40c050][i%4]); } it('a gumball machine');
    box(9.2,12.3,9.65,12.8,0,1.05,0x2a4a8a); box(9.25,12.29,9.6,12.3,.6,.95,0xd8dcd8); sol(9.2,12.3,9.65,12.8); it('a newspaper box');
    cyl(10.4,12.5,.2,0,.03,C.black); cyl(10.4,12.5,.025,.03,1.75,0x6a3a1e); for(let i=0;i<4;i++){ const a=i*Math.PI/2; box(10.4+Math.cos(a)*.08-.02,12.5+Math.sin(a)*.08-.02,10.4+Math.cos(a)*.08+.02,12.5+Math.sin(a)*.08+.02,1.55,1.62,0x6a3a1e); } box(10.25,12.4,10.38,12.62,.85,1.55,0x3a4a5a); cyl(10.52,12.5,.14,1.62,1.66,0x2a2a2a); cyl(10.52,12.5,.08,1.66,1.76,0x2a2a2a); it('a coat rack'); it('a coat and a hat');
    box(4.55,12.2,4.95,12.6,0,.55,0x9a6a3a); box(4.55,12.55,4.95,12.6,.55,1.0,0x9a6a3a); for(const [a,b] of [[4.55,12.2],[4.95,12.2],[4.55,12.6],[4.95,12.6]])box(a-.02,b-.02,a+.02,b+.02,0,.55,0x8a5a2a); it('a high chair');
    cyl(5.25,12.55,.18,0,.4,0xb05a3a,.22); for(let i=0;i<6;i++)ball(5.25+Math.cos(i)*.12,12.55+Math.sin(i)*.12,.6+.15*(i%3),.15,0x3a7a3a); it('a potted plant');
    box(CX-.6,D-.75,CX+.6,D,0,.015,0x4a2e22); it('a door mat');
    box(W-.6,5.0,W,6.4,0,.88,C.wood); box(W-.62,5.0,W,6.4,.88,.92,0xd8d8d4); box(W-.55,5.1,W-.05,5.5,.12,.32,0x6a6e72); sol(W-.62,5.0,W,6.4); it('the wait station'); it('a bus tub');
    for(const v of [5.25,5.55]){ glow(()=>cyl(W-.35,v,.07,.92,.93,0xff3a20)); cyl(W-.35,v,.07,.93,1.12,0x4a2a14,.05); } for(const v of [5.9,6.15])cyl(W-.3,v,.07,.92,1.15,0xa8c8d8,.06); for(let i=0;i<3;i++)cyl(W-.3,6.3,.04,.92+i*.1,1.0+i*.1,0xcfe3ea,.045); it('coffee for refills'); it('water pitchers'); it('glasses');
    box(W-.55,7.3,W,8.1,0,1.25,0x7a2a14); pic(W-.555,7.7,.1,.78,1.3,-1,0,A.tex(32,52,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#ffb030'); gr.addColorStop(.5,'#ff5a30'); gr.addColorStop(1,'#3a60d0'); g.fillStyle=gr; g.fillRect(0,0,w,h);
      g.fillStyle='#1a0a06'; g.fillRect(4,8,24,16); g.fillStyle='#f4e8c0'; for(let i=0;i<4;i++)g.fillRect(6,10+i*3.5,20,2); g.fillStyle='#2a1a10'; g.fillRect(6,30,20,14); for(let i=0;i<5;i++){ g.fillStyle=['#ff3030','#30d0ff','#ffe030','#50ff60','#ff60e0'][i]; g.fillRect(6+i*4,46,3,3); } }),true); sol(W-.6,7.3,W,8.1); it('the jukebox');
    box(W-.5,8.9,W,9.5,0,1.0,C.wood); box(W-.51,9.0,W-.5,9.4,.6,.9,0x2a2a2a); pic(W-.512,9.2,.62,.38,.16,-1,0,words(38,16,'#2a2a2a',[['THANK YOU',19,4,'#f0e8d0',7,'center']])); sol(W-.55,8.9,W,9.5); it('a trash stand');
    pic(W-.012,9.6,1.75,1.1,.4,-1,0,A.tex(88,32,(g,w,h)=>{ g.fillStyle='#000'; g.fillRect(0,0,w,h); g.font='bold 13px monospace'; g.textAlign='center'; g.textBaseline='middle'; g.shadowColor='#ff3a8a'; g.shadowBlur=6; g.fillStyle='#ffd0e8'; g.fillText('PIE & JOE',w/2,h/2); }),true); it('a neon sign');
    for(const [v,i] of [[8.6,0],[10.3,1]]){ box(.005,v-.4,.035,v+.4,1.4,2.05,0x3a2a1a); pic(.037,v,1.45,.7,.55,1,0,A.tex(40,32,(g,w,h)=>{ const sky=i?['#f0a050','#e05a40']:['#7ab0d8','#d8e8f0']; const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,sky[0]); gr.addColorStop(1,sky[1]); g.fillStyle=gr; g.fillRect(0,0,w,h);
      g.fillStyle=i?'#2a1a2a':'#3a4a3a'; for(let x=0;x<w;x+=6)g.fillRect(x,h-8-((x*7)%11),5,20); g.fillStyle=i?'#c02020':'#3060c0'; g.fillRect(8,h-9,16,5); g.fillStyle='#1a1a1a'; g.fillRect(10,h-5,3,3); g.fillRect(19,h-5,3,3); })); it('a framed picture'); }
    /* ---------- the lights: pendants over the counter and the booths, a fan, the kitchen's tubes ---------- */
    const pend=(u,v,c)=>{ box(u-.005,v-.005,u+.005,v+.005,1.95,H,C.black); cyl(u,v,.17,1.82,1.95,c,.04); glow(()=>ball(u,v,1.8,.07,0xfff0c8)); it('a pendant light'); };
    for(const u of [1.2,3.0,4.8,6.6])pend(u,6.95,C.red); for(const B of [B1,B2,B3])pend((B[0]+B[1])/2,B[2]+.75,C.chrome);
    glow(()=>{ for(const u of [1.5,4.5,7.2])box(u,1.9,u+1.2,2.1,H-.05,H-.02,0xf4f8ff); box(9.4,2.0,10.0,2.4,H-.05,H-.02,0xf4f8ff); box(11.6,2.0,12.2,2.4,H-.05,H-.02,0xf4f8ff); }); it('the kitchen\'s tubes'); it('the restroom lights');
    const fan=own(()=>{ cyl(6.5,9.6,.015,H-.45,H,C.dsteel); cyl(6.5,9.6,.13,H-.6,H-.45,0x8a6a3a); for(let i=0;i<4;i++){ const a=i*Math.PI/2; box(6.5+Math.cos(a)*.15-.06+Math.cos(a)*.3,9.6+Math.sin(a)*.15-.06+Math.sin(a)*.3,6.5+Math.cos(a)*.15+.06+Math.cos(a)*.3,9.6+Math.sin(a)*.15+.06+Math.sin(a)*.3,H-.56,H-.54,0x6a4a2a); } });
    const lamp=(u,v,h,c,i,r)=>A.lamp(tu(u),tv(v),h*MW/A.Y(24),c,i,r/T*MW);
    lamp(3.5,7.2,2.2,0xffe2b0,8,7.5); lamp(2.2,11.6,2.0,0xffe2b0,6,6); lamp(10.6,9.4,2.3,0xfff0d0,6,7); lamp(3.0,2.3,2.6,0xeef4ff,7,6); lamp(6.8,2.3,2.6,0xeef4ff,6,6); lamp(10.8,2.3,2.6,0xf4f4ff,7,6);
    /* ---------- the octopus chef, twice the drummer's size, on his stool: all eight arms at work, the plates out through the pass ---------- */
    const OS=2, GY=-.32, O=octFig(); O.g.position.set(wx(OU),GY*MW,wz(OV)); O.g.rotation.y=hd(0,1); O.g.scale.multiplyScalar(OS); A.add(O.g); it('the octopus chef');
    const hb=new THREE.Mesh(new THREE.BoxGeometry(1.2*MW,2.8*MW,1.2*MW),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(wx(OU),1.4*MW,wz(OV)); A.add(hb);
    UI.thing({name:'THE OCTOPUS CHEF',obj:hb,reach:1.9*T,near:3.2*T,tall:3.1*T,act:()=>{}});
    const loc=(u,v,h)=>[(v-OV)*MW*PPU/OS,(u-OU)*EX*IN*MW*PPU/OS,(h-GY)*MW/(ZU*OS)];
    const plate=meshOf(own(()=>{ cyl(0,0,.12,0,.02,C.white); ball(0,0,.035,.07,0xc87a3a,.5); ball(.04,.03,.04,.03,0x58a038); }),matL,true);
    const PA=[5.4,4.05,.93], PB=[5.4,KV+.12,1.19], lerp=(p,q,k)=>p.map((x,i)=>x+(q[i]-x)*k);
    DINER.chef=t=>{ const s=Math.sin, f=k=>Math.max(0,s(k)), c=t%8, P=(u,v,h)=>loc(u,v,h);
      let pl=null, lf; if(c<3){ pl=PA; lf=[PA[0]-.1,PA[1]-.16,PA[2]+.05]; } else if(c<4.5){ const k=(c-3)/1.5, e=k*k*(3-2*k); pl=lerp(PA,PB,e); pl[2]+=.22*s(Math.PI*e); lf=[pl[0]-.05,pl[1]-.14,pl[2]+.04]; }
      else { if(c<7)pl=PB; const k=Math.min(1,(c-4.5)/1), r=[5.2,3.7,1.15]; lf=lerp([PB[0]-.05,PB[1]-.2,PB[2]+.05],r,k*k*(3-2*k)); }
      plate.visible=!!pl; if(pl){ plate.position.set(wx(pl[0]),pl[2]*MW,wz(pl[1])); }
      const fl=f(t*2.3+1)**2, ch=Math.abs(s(t*6)), ft=f(t*.8);
      return {toque:true,noCig:true,noGlass:true,nod:s(t*1.1)*.9,sway:t*.3,
        XB:[P(3.75+.06*s(t*3),1.25,1.2+.08*f(t*3)),P(3.75,.55,.88)],XA:[P(4.3,1.25,1.2+.1*fl),P(4.3,.55,.88+.2*fl)],
        CG:P(4.85,.98,.98+.03*s(t*9)),CGA:[0,0,1],GL:P(2.98+.05*s(t*.5),.92,1.0+.18*ft),
        LS:[P(6.6+.08*s(t*4),1.95,.98),P(6.6+.08*s(t*4),2.5,.95)],RS:[P(2.75,2.15+.1*s(t*1.5),1.0+.1*ch),P(2.75,2.6+.1*s(t*1.5),.93)],
        RF:P(4.1+.25*s(t*1.7),4.12,.97+.04*s(t*3)),LF:P(...lf)}; };
    meshOf(MAIN,matL,false); meshOf(GLOW,matB,false); const fm=meshOf(fan,matL,true);
    O.draw(octBody(DINER.chef(0))); plate.userData.noMerge=fm.userData.noMerge=true; DINER.plate=plate; DINER.fan=fm; DINER.oct=O; DINER.on=true; };
  MSHOP.kit.diner.drop=()=>{ DINER.on=false; DINER.door=DINER.oct=DINER.fan=DINER.chef=DINER.plate=DINER.set=null; };
  SYS.add('life',dt=>{ if(!DINER.on)return; const t=performance.now()/1000;
    if(DINER.oct&&DINER.chef)DINER.oct.draw(octBody(DINER.chef(t)));
    if(DINER.fan)DINER.fan.rotation.y+=dt*2.2;
    if(DINER.set&&room){ const T=new Set(room.taken?room.taken.values():[]); DINER.set.forEach((me,i)=>{ me.visible=T.has(i); }); }
    const d=DINER.door; if(d){ const dist=Math.hypot(pos.x-d.x,pos.z-d.z), side=Math.sign(d.z-pos.z)||1, want=Math.max(0,Math.min(1,(1.6*MW-dist)/(.6*MW)))*1.35;
      if(side!==d.side&&d.a>.05)d.a=Math.max(0,d.a-dt*4); else { d.side=side; d.a+=(want-d.a)*Math.min(1,dt*8); }
      for(const L of d.L)L.pv.rotation.y=-d.side*L.dx*d.a; } },'146za-diner');
  window.DINERDBG=()=>({seatList:room?room.seats.length:0,taken:room&&room.taken?room.taken.size:0,built:DINER.on,seats:DINER.seats,things:DINER.items.length,spots:Object.keys(DINER.spots),oct:!!DINER.oct,door:DINER.door?+DINER.door.a.toFixed(2):null});
}
