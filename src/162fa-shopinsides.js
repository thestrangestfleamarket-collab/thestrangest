// THE SHOPS' SHARED INSIDE (MSHOP.kit._): a merchant's shop without a kit of its own gets a floor and walls in its colours, a counter with its keeper behind it, shelves showing what the keeper sells (each thing's own picture), a lamp; the hotel, tailor and barber counters do their own thing (rest, WEAR, LOOK).
import {THREE} from './003-shx.js';
import {ARCHI, BAG, CHARS, INV, SHOPS, TALK, UI, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {IKIT} from './038zc-ikit.js';
import {MSHOP} from './059i-mshops.js';
{ const say=(t,c)=>SAY(t,c||'#f2c14e');
  // each shop's colours: floor, wall, wainscot, wood; and what it has beyond its shelves
  const LOOK={florist:[[96,74,52],[214,226,200],[70,96,62],0x5a3e28,'plants'],bees:[[110,80,46],[236,214,160],[150,104,40],0x6a4a22,'hives'],
    bfly:[[100,82,60],[214,206,232],[92,74,110],0x5a3e28,'cases'],birds:[[96,80,58],[200,222,232],[60,92,104],0x5a4028,'perches'],
    pets:[[120,110,96],[220,236,216],[70,120,90],0x6a5a40,'tank'],reptiles:[[96,90,70],[200,214,180],[60,90,50],0x4a4030,''],birdshop:[[120,104,84],[214,232,240],[70,100,120],0x5a4630,''],butterflies:[[110,96,84],[226,214,236],[100,80,120],0x5a4030,''],
    barn:[[160,130,80],[150,64,50],[110,72,44],0x6a4a2a,''],mush:[[70,52,38],[176,156,128],[86,60,40],0x3e2a1a,'logs'],
    gems:[[60,58,66],[150,160,176],[40,44,56],0x2a2a30,'cases'],armor:[[74,66,58],[170,158,140],[70,50,40],0x3a2a1e,'racks'],
    clothes:[[120,96,80],[232,220,210],[120,60,60],0x4a3428,'racks'],skate:[[90,90,92],[200,200,196],[200,110,40],0x2a2a2a,'ramps'],
    diner:[[200,200,206],[232,226,214],[170,40,50],0xc0c4c8,'booths'],fishing:[[92,80,64],[190,206,214],[40,70,90],0x4a3a28,'nets'],
    tailor:[[104,80,62],[226,214,196],[90,60,70],0x4a3222,'mannequin'],barber:[[230,230,230],[220,232,236],[160,40,40],0x2a2a2e,'chair'],
    hotel:[[110,40,40],[220,204,170],[90,60,40],0x4a2e1c,'lobby']};
  const DEF=[[100,82,60],[214,206,190],[90,70,52],0x5a3e28,''];
  // what the counter does: open the keeper's shop, or the shop's own service
  const SERVE={hotel:()=>{ if(VIT.dead)return say('THE CLERK: GHOSTS RECOVER IN THE BATH HOUSE\'S STEAM, NOT HERE.','#c8a090'); if(VIT.hp>=1)return say('THE CLERK: YOU LOOK RESTED ALREADY. COME BACK WHEN YOU\'RE HURT.','#c8a090');
      if(INV.cash<10)return say('A ROOM IS $10 A REST. YOU HAVE $'+Math.round(INV.cash)+'.','#c8a090'); INV.cash-=10; VIT.heal(1); say('YOU SLEEP A WHILE UPSTAIRS. FULL HEALTH. $10.'); },
    tailor:()=>{ say('THE TAILOR: LET\'S SEE WHAT YOU\'RE WEARING.'); UI.menuTab&&UI.menuTab('you','wear'); },
    barber:()=>{ say('THE BARBER: SIT DOWN. WHAT ARE WE DOING TODAY?'); UI.menuTab&&UI.menuTab('you','look'); }};
  const SVN={hotel:'THE FRONT DESK (REST $10: FULL HEALTH)',tailor:'THE TAILOR\'S COUNTER (CHANGE WHAT YOU WEAR)',barber:'THE BARBER\'S COUNTER (CHANGE YOUR HAIR)'};
  // a good on a shelf or the table: its own 3D model, its real size or the space's if it is bigger (owner, 8 Nov 2026: "no more icons to represent anything")
  const good=(id,room,at,y,ry)=>{ if(!BAG.look)return null; const g=BAG.look(id), b=new THREE.Box3().setFromObject(g), z=b.getSize(new THREE.Vector3()), k=Math.min(1,room/Math.max(z.x,z.y,z.z,1e-3)); g.scale.multiplyScalar(k); g.position.set(at[0],y,at[1]); g.rotation.y=ry; return g; };
  MSHOP.kit._=A=>{ '@later'; const R=A.R, F=IKIT.frame(R), MW=IKIT.MW, K=IKIT.room(F,o=>A.add(o),()=>{}), {box,cyl,ball,glow,pic,words,use,seat,own}=K, W=F.W, D=F.D, tm=D/(R.y1-R.y0);
    const sol=(u0,v0,u1,v1)=>A.sol(R.x0+Math.min(u0,u1)/tm,R.y0+Math.min(v0,v1)/tm,R.x0+Math.max(u0,u1)/tm,R.y0+Math.max(v0,v1)/tm), HT=A.WH/24*tm;
    const [FL,WA,WS,WOOD,EX]=LOOK[A.id]||DEF, tr=A.who&&CHARS.trade?CHARS.trade({key:A.who}):null, goods=(tr&&tr.sells||[]).filter(id=>!ARCHI(id));
    const shop=()=>{ if(SERVE[A.id])return SERVE[A.id](); for(const [N,f] of TALK.shops||[])if(N&&N.key===A.who)return f();   // a keeper with a shop of their own (the Tomato, the Mushroom Seller)
      if(tr&&SHOPS.open)return SHOPS.open({key:A.who,name:A.name}); say('NOBODY IS SERVING.','#c8a090'); };
    // the floor's boards, the walls' plaster over a wainscot, a picture rail
    A.floor((x,y)=>{ const u=x-R.x0, v=y-R.y0, row=Math.floor(u*5), s=.84+.16*A.hs(row,Math.floor(v*1.4+row*.37),5), e=(u*5%1)<.06?.7:1; return FL.map(c=>c*s*e); });
    for(const sd of ['b','w','e','f'])A.wall(sd,(a,z)=>{ if(z<4)return WS.map(c=>c*.55); if(z<24)return (Math.floor(a*3)%2&&z>7&&z<21)?WS.map(c=>c*.85):WS; if(z<26)return WS.map(c=>c*1.3);
      if(z>A.WH-5)return WA.map(c=>Math.min(255,c*1.08)); if(z>A.WH-18&&z<A.WH-16)return WS; const n=.95+.05*A.hs(Math.floor(a*30),Math.floor(z/3),2); return WA.map(c=>c*n); });
    // the counter, its keeper behind it (059i stands them 2.2 tiles from the back wall)
    const kv=2.2*tm, c0=kv+.5, c1=kv+1.05, cu0=W*.28, cu1=W*.72;
    box(cu0,c0,cu1,c1,0,.95,WOOD); box(cu0-.04,c0-.04,cu1+.04,c1+.04,.95,1.0,0x2a2420); sol(cu0,c0,cu1,c1);
    box(cu1-.42,c0+.12,cu1-.12,c0+.4,1.0,1.2,0x2c2c2e); use(SVN[A.id]||('THE COUNTER ('+(goods.length||[...(TALK.shops||new Map()).keys()].some(N=>N&&N.key===A.who)?'BUY':'TALK')+')'),W/2,(c0+c1)/2,cu1-cu0,1.2,shop,1.8);
    pic(W/2,.03,HT-.75,Math.min(W*.6,3.2),.5,0,1,words(128,20,'#1e1a18',[[A.name||'THE SHOP',64,5,'#f2c14e',10,'center']]),true);
    // the shelves: the back wall either side of the keeper, then both side walls; each thing on them is what the keeper sells
    const runs=A.bare?[]:[[.25,.0,W*.36,.42,0,1],[W*.64,.0,W-.25,.42,0,1],[.0,D*.42,.42,D-1.1,1,0],[W-.42,D*.42,W,D-1.1,-1,0]], spots=[];   // (a shop with its own walls of things (A.bare): no shelves)
    for(const [u0,v0,u1,v1,du,dv] of runs){ for(const h of [0,.55,1.1,1.65])box(u0,v0,u1,v1,h,h+.04,WOOD); box(u0,v0,u1,v1,2.2,2.24,WOOD); sol(u0,v0,u1,v1);
      const L=dv?u1-u0:v1-v0, n=Math.max(1,Math.floor(L/.42)); for(const h of [.04,.59,1.14,1.69])for(let i=0;i<n;i++){ const f=(i+.5)/n; spots.push(dv?[u0+f*L,(v0+v1)/2,h,du,dv]:[(u0+u1)/2,v0+f*L,h,du,dv]); } }
    if(A.bare){}
    else if(goods.length){ spots.forEach((s,i)=>{ const id=goods[i%goods.length], m=good(id,.36*MW,F.pw(s[0],s[1]),(s[2]+.04)*MW,F.hd(s[3],s[4])); if(m)A.add(m); });
      for(const [u0,v0,u1,v1] of runs)use('THE SHELVES (BUY)',(u0+u1)/2,(v0+v1)/2,Math.max(u1-u0,v1-v0),2.2,shop,1.6); }
    else for(const s of spots)if(A.hs(Math.round(s[0]*10),Math.round(s[1]*10+s[2]*7),9)>.4)box(s[0]-.12,s[1]-.12,s[0]+.12,s[1]+.12,s[2],s[2]+.18+.2*A.hs(s[0]*9,s[2],3),[0x8a6a4a,0x6a7a8a,0x9a8a6a][Math.floor(s[2]*2)%3]);   // folded cloth, towels, tins
    // what the shop has beyond its shelves, in the middle of the floor
    const mu=W/2, mv=(c1+D-.8)/2;
    if(A.bare){}
    else if(EX==='booths'||EX==='lobby'){ for(const sg of [-1,1]){ const u=mu+sg*W*.24; seat(EX==='lobby'?'A SOFA':'A BOOTH',own(()=>{ box(u-.6,mv-.3,u+.6,mv+.3,0,.45,WS[0]>150?0xa02830:0x6a2a2a); box(u-.6,mv-.3+(sg<0?0:.45),u+.6,mv-.3+(sg<0?.15:.6),.45,.95,0x5a2020); }),[[u,mv,.45,0,sg<0?-1:1]],1.0); sol(u-.6,mv-.3,u+.6,mv+.3); }
      if(EX==='booths')box(mu-.4,mv-.3,mu+.4,mv+.3,.72,.76,0xd8d8dc),cyl(mu,mv,.05,0,.72,0x8a8c90); }
    else if(EX==='chair'){ seat('THE BARBER CHAIR',own(()=>{ cyl(mu,mv,.28,0,.08,0x8a8c90); cyl(mu,mv,.06,.08,.42,0x8a8c90); box(mu-.3,mv-.3,mu+.3,mv+.3,.42,.55,0x9a2020); box(mu-.3,mv-.32,mu+.3,mv-.2,.55,1.25,0x9a2020); }),[[mu,mv,.55,0,1]],1.0); sol(mu-.3,mv-.3,mu+.3,mv+.3);
      box(mu-.5,.02,mu+.5,.05,1.0,2.0,0xb8c8d0); cyl(W*.15,D-.6,.06,0,1.6,0xf0f0f0); }
    else if(EX==='mannequin'){ for(const u of [mu-.7,mu+.7]){ cyl(u,mv,.18,0,.03,0x2a2a2a); cyl(u,mv,.02,.03,.9,0x2a2a2a); cyl(u,mv,.16,.9,1.5,0xd8c8b0,.2); ball(u,mv,1.62,.1,0xd8c8b0); } sol(mu-.9,mv-.2,mu+.9,mv+.2); }
    else if(EX==='tank'){ box(mu-.8,mv-.3,mu+.8,mv+.3,0,.7,WOOD); box(mu-.78,mv-.28,mu+.78,mv+.28,.7,1.4,0x7ab8d0); glow(()=>box(mu-.75,mv-.25,mu+.75,mv+.25,1.38,1.4,0xd8f4ff)); sol(mu-.8,mv-.3,mu+.8,mv+.3); }
    else if(EX){ box(mu-.7,mv-.45,mu+.7,mv+.45,0,.8,WOOD); box(mu-.74,mv-.49,mu+.74,mv+.49,.8,.84,0x2a2420); sol(mu-.7,mv-.45,mu+.7,mv+.45);   // a display table of the shop's best things
      if(goods.length)goods.slice(0,4).forEach((id,i)=>{ const m=good(id,.3*MW,F.pw(mu-.48+i*.32,mv),.84*MW,F.hd(0,1)); if(m)A.add(m); });
      use('THE DISPLAY TABLE (BUY)',mu,mv,1.4,1.1,shop,1.6); }
    // a rug, a plant by the door, the light: two pendants, warm, and a soft fill
    box(W*.3,c1+.3,W*.7,D-.9,0,.01,WS.reduce((a,c,i)=>a+(Math.round(c*.7)<<(16-8*i)),0));
    cyl(W-.45,D-.45,.2,0,.4,0x6a3a2a,.24); ball(W-.45,D-.45,.75,.32,0x3a6a32,1.3);
    for(const u of [W*.3,W*.7]){ box(u-.005,D*.45-.005,u+.005,D*.45+.005,HT-.6,HT,0x1c1c1c); glow(()=>ball(u,D*.45,HT-.65,.1,0xfff0d0)); A.lamp(R.x0+u/tm,R.y0+D*.45/tm,(HT-.7)/tm,0xffd8a8,3.6,9); }
    A.add(new THREE.HemisphereLight(0xfff0dc,0x40342a,1.4));
    K.flush(); };
}
