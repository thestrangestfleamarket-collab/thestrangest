// THE BODEGA, FURNISHED: what is on the shelves is for sale (pick it into a basket, pay yourself at the register; the register lists everything sold here, supplies too; walk out and the basket stays), a deli on the back wall run by the stock clerk, a coffee urn, an ice chest, a bulletin board, milk crates to sit on, and MANGO the bodega cat (pet her; feed her cat food and she mends you); where its staff and its customers stand.
import {SHARED, THREE} from './003-shx.js';
import {ARCHI, FORAGE, INV, ITEMS, ROOMS, UI, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {STORE, SYS, TILE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MINI} from './038zd-mini.js';
const BODEGA={basket:new Map()}; window.BODEGA=BODEGA;
{ const say=(t,c)=>SAY(t,c||'#f2c14e'), BOD=SHARED.BOD, TM=.924;   // a bodega tile in metres
  // each kind of good on the shelves is a thing you can buy: [item, what it is, $, what eating it does (none: not food)]
  const feed=f=>()=>FORAGE.feed(f), sta=k=>()=>{ VIT.sta=Math.min(1,VIT.sta+k); };
  const KIND={water:['g_water','A BOTTLE OF WATER',1,sta(.2)],can:['g_soda','A CAN OF SODA',1,sta(.3)],bottle:['g_juice','A BOTTLE OF JUICE',2,()=>{ FORAGE.feed(.05); VIT.sta=Math.min(1,VIT.sta+.3); }],
    milk:['g_milk','A CARTON OF MILK',3,()=>{ FORAGE.feed(.1); VIT.sta=Math.min(1,VIT.sta+.2); }],eggs:['g_eggs','A DOZEN EGGS',3],butter:['g_butter','A STICK OF BUTTER',2],cheese:['g_cheese','A BLOCK OF CHEESE',3,feed(.15)],
    yogurt:['g_yogurt','A YOGURT',1,feed(.1)],cereal:['g_cereal','A BOX OF CEREAL',4,feed(.3)],bread:['g_bread','A LOAF OF BREAD',3,feed(.25)],bagels:['g_bagels','A BAG OF BAGELS',3,feed(.25)],coffee:['g_coffee','A CAN OF COFFEE',5],
    oats:['g_oats','A TUB OF OATS',3],bag:['g_chips','A BAG OF CHIPS',1,feed(.1)],jar:['g_vaseline','A JAR OF VASELINE',2],soup:['g_soup','A CAN OF SOUP',2,feed(.3)],tuna:['g_tuna','A CAN OF TUNA',2,feed(.2)],pasta:['g_pasta','A BOX OF PASTA',2],
    noodle:['g_noodles','A CUP OF NOODLES',1,feed(.25)],candy:['g_candy','A CANDY BAR',1,feed(.08)],gum:['g_gum','A PACK OF GUM',1],tp:['g_tp','A PACK OF TOILET PAPER',2],towels:['g_towels','A ROLL OF PAPER TOWELS',2],dish:['g_dishsoap','DISH SOAP',2],
    jug:['g_bleach','A JUG OF BLEACH',3],sponge:['g_sponge','A SPONGE',1],tbags:['g_tea','A BOX OF TEA',2],bulbs:['g_bulb','A LIGHT BULB',2],batt:['g_batteries','A PACK OF BATTERIES',3],matches:['g_matches','A BOX OF MATCHES',1],lighter:['g_lighter','A LIGHTER',1],
    soap:['g_soap','A BAR OF SOAP',1],paste:['g_toothpaste','TOOTHPASTE',2],brush:['g_toothbrush','A TOOTHBRUSH',1],shampoo:['g_shampoo','A BOTTLE OF SHAMPOO',3],deo:['g_deodorant','DEODORANT',3],pills:['g_aspirin','A BOTTLE OF ASPIRIN',4,()=>{ VIT.heal(.2); }],
    cotton:['g_qtips','A BOX OF COTTON SWABS',2],catfood:['g_catfood','A CAN OF CAT FOOD',1],dogfood:['g_dogfood','A BAG OF DOG FOOD',5],fishfood:['g_fishfood','A TUB OF FISH FOOD',3],bananas:['g_bananas','A BUNCH OF BANANAS',1,feed(.15)],
    goya:['g_beans','A CAN OF BEANS',2,feed(.25)],vienna:['g_vienna','A CAN OF VIENNA SAUSAGES',1,feed(.15)],spam:['g_spam','A CAN OF SPAM',3,feed(.3)],tide:['g_detergent','A BOX OF DETERGENT',5],ajax:['g_cleanser','A CAN OF CLEANSER',2],
    pampers:['g_diapers','A PACK OF DIAPERS',8],koolaid:['g_koolaid','A PACKET OF KOOL-AID',1],candle:['g_candle','A PRAYER CANDLE',2],sack:['g_rice','A SACK OF RICE',8],platano:['g_plantains','PLANTAINS',1,feed(.15)]};
  const BEER=new Set(['COLT 45','SCHAEFER','MILLER HIGH LIFE']), beer=['g_beer','A CAN OF BEER',2,()=>{ VIT.sta=1; }];
  const kindOf=(k,brand)=>BEER.has(brand)?beer:KIND[k];
  { const names={}, prices={}, does={}; for(const [id,nm,p,d] of [...Object.values(KIND),beer]){ names[id]=nm; prices[id]=p; if(d)does[id]=d; }
    FORAGE.add({names,prices,does}); FORAGE.add({names:{f_bec:'A BACON, EGG AND CHEESE',f_hero:'A TURKEY HERO',f_chopped:'A CHOPPED CHEESE',f_icepop:'AN ICE POP'},
      does:{f_bec:()=>{ FORAGE.feed(.5); VIT.sta=Math.min(1,VIT.sta+.3); },f_hero:()=>{ FORAGE.feed(.6); VIT.heal(.1); },f_chopped:()=>{ FORAGE.feed(.6); VIT.heal(.15); },f_icepop:()=>{ VIT.sta=Math.min(1,VIT.sta+.3); }}}); }
  // what a shelf holds, by its goods list (SHARED.BOD.GLAY, the goods drawn on it): one line a brand, its kind, its price
  const SHELF={fridge1:'fridge1',fridge2:'fridge2',fridge3:'fridge3',wl1:'aisle1a',wl2:'aisle1b',wr1:'aisle2a',wb3:'aisle2b',wl3:'aisle2a',wb1:'back1',wb2:'back2',wm1:'mid1',win1:'win1',win2:'win2'};
  const linesOf=rows=>{ '@later'; const out=[], seen=new Set(); for(const [k,,...a] of rows.flat()){ let br=typeof a[a.length-1]==='string'?a[a.length-1]:({goya:'GOYA',vienna:'VIENNA',spam:'SPAM',tide:'TIDE',ajax:'AJAX',pampers:'PAMPERS',koolaid:'KOOL-AID',candle:'7 DIAS',sack:'CAROLINA',platano:'PLATANOS'}[k]||'');
      const K=kindOf(k,br); if(!K||ARCHI(K[0]))continue; const key=br+'|'+K[0]; if(seen.has(key))continue; seen.add(key); out.push({brand:br,id:K[0],name:K[1],price:K[2]}); } return out; };
  BODEGA.shelf=key=>{ const L=BOD.GLAY&&BOD.GLAY[SHELF[key]]; return L?linesOf(L):[]; };
  BODEGA.counterLines=()=>BOD.GLAY?linesOf([BOD.GLAY.counter]):[];
  const total=()=>{ let t=0; for(const [id,n] of BODEGA.basket)t+=ITEMS.prop(id,'value')*n; return t; }, count=()=>{ let c=0; for(const n of BODEGA.basket.values())c+=n; return c; };
  BODEGA.pick=(id,n=1)=>{ BODEGA.basket.set(id,(BODEGA.basket.get(id)||0)+n); };
  BODEGA.pay=()=>{ const t=total(); if(!count())return 'YOUR BASKET IS EMPTY.'; if(INV.cash<t)return `THAT IS $${t}. YOU HAVE $${INV.cash}.`; INV.cash-=t; for(const [id,n] of BODEGA.basket)INV.add(id,n); BODEGA.basket.clear(); BODEGA.paid=(BODEGA.paid||0)+t; return ''; };
  // a list you click: a shelf, or the register (the basket, then what is by the register)
  const list=(title,rows,reg)=>({title,w:400,h:440,help:reg?'Everything the bodega sells: click a line to put one in your basket, the wheel scrolls. PAY takes your cash and the bag is yours.':'Click a line to put one in your basket. Pay yourself at the register on the counter.',
    start:S=>{ S.rows=rows(); },
    tick:S=>{ const vis=reg?16:18, max=Math.max(0,(S.rows.length-vis)*22); if(S.wheel){ S.sy=Math.max(0,Math.min(max,(S.sy||0)+S.wheel)); S.wheel=0; } S.sy=Math.min(S.sy||0,max);
      if(!S.press)return; const y=S.my, x=S.mx; if(reg&&y>392&&y<428){ if(x<200){ const no=BODEGA.pay(); S.line=no||''; if(!no)S.over='PAID. YOU BAG IT YOURSELF.'; } else { BODEGA.basket.clear(); S.line='YOU PUT IT ALL BACK.'; } S.rows=rows(); return; }
      if(y>(reg?366:410))return; const i=Math.floor((y-reg0(S)+(S.sy||0))/22); const r=S.rows[i]; if(r&&r.id&&x>10&&x<390){ BODEGA.pick(r.id); S.line=`${r.brand?r.brand+': ':''}${r.name} IN YOUR BASKET.`; S.rows=rows(); } },
    draw:(S,g)=>{ g.fillStyle='#1c1a16'; g.fillRect(0,0,400,440); g.font='12px monospace'; g.textBaseline='middle'; const y0=reg0(S)-(S.sy||0), bot=reg?366:410;
      g.save(); g.beginPath(); g.rect(0,0,400,bot); g.clip();
      S.rows.forEach((r,i)=>{ const y=y0+i*22+11; if(y<-11||y>bot+11)return; if(r.head){ g.fillStyle='#f0c040'; g.textAlign='left'; g.fillText(r.head,14,y); return; } g.fillStyle=i%2?'#26231e':'#2c2822'; g.fillRect(10,y-11,380,22);
        g.fillStyle=r.id?'#f4ecd8':'#a89a80'; g.textAlign='left'; g.fillText(((r.n?r.n+' × ':'')+(r.brand?r.brand+'  ':'')+r.name).slice(0,42),16,y); g.textAlign='right'; if(r.price!=null)g.fillText('$'+(r.n?r.price*r.n:r.price),384,y); });
      g.restore(); if(S.rows.length>(reg?16:18)){ g.fillStyle='#a89a80'; g.textAlign='right'; g.fillText('↕ MORE',386,bot+12); }
      g.fillStyle='#f0c040'; g.textAlign='left'; g.fillText(`BASKET: ${count()} · $${total()}   CASH: $${INV.cash}`,14,reg?378:420);
      if(reg){ g.fillStyle='#2a6a3a'; g.fillRect(10,392,180,36); g.fillStyle='#5a2a24'; g.fillRect(210,392,180,36); g.fillStyle='#f4ecd8'; g.textAlign='center'; g.fillText(`PAY $${total()}`,100,410); g.fillText('PUT IT ALL BACK',300,410); } }});
  const reg0=()=>12;
  BODEGA.openShelf=key=>MINI.open(list('THE SHELF',()=>BODEGA.shelf(key)));
  // everyday supplies the skills and pets use up (owner, 8 Nov 2026: "make sure the bodega has supplies players need (like pet food)"); a line shows once its item is in the game
  BODEGA.SUPPLIES=['g_catfood','g_dogfood','g_fishfood','bseed','feeder','cage','bottle','jar_s','jar_m','jar_l','jar_honey','net','bait','bait_cut','crabpot','pot','dirt','water','seed_star','seed_sun','seed_hum','canvas_s','canvas_m','spray'];
  const sold=id=>{ const v=+ITEMS.prop(id,'value'), nm=FORAGE.name(id); return !ARCHI(id)&&nm&&nm!==id&&v>0?{id,name:nm,price:Math.round(v)}:null; };
  // the register (owner, 8 Nov 2026: "double click on the front desk or register and it will show every item in the bodega ... you dont have to walk around"): your basket, then everything sold here
  BODEGA.all=()=>{ const seen=new Set(), add=(L,r)=>{ if(r&&r.id&&!seen.has(r.id)){ seen.add(r.id); L.push(r); } }, S=[], G=[], U=[];
    for(const id of BODEGA.SUPPLIES)add(U,sold(id)); for(const r of BODEGA.counterLines())add(S,r); for(const k in SHELF)for(const r of BODEGA.shelf(k))add(S,r);
    for(const [,,ids] of BODEGA.LAYOUT||[])for(const id of ids)add(G,sold(id)); return {shelves:S,goods:G,supplies:U}; };
  BODEGA.register=()=>MINI.open(list('THE REGISTER',()=>{ const R=[{head:'YOUR BASKET'}]; for(const [id,n] of BODEGA.basket)R.push({name:FORAGE.name(id),n,price:ITEMS.prop(id,'value')}); if(R.length===1)R.push({name:'(EMPTY: CLICK ANYTHING BELOW)'});
    const A=BODEGA.all(); for(const [h,L] of [['SUPPLIES',A.supplies],['ON THE SHELVES',A.shelves],['GOODS',A.goods]])if(L.length){ R.push({head:h}); R.push(...L); } return R; },true));
  // a basket left unpaid stays in the bodega
  SYS.add('life',()=>{ if(BODEGA.basket.size&&(!ROOMS.offIn||ROOMS.offIn()!=='bodega')){ BODEGA.basket.clear(); say('YOU LEFT THE BASKET BY THE DOOR. UNPAID THINGS STAY IN THE BODEGA.','#c8a090'); } },'146ze-bodega');
  // where its people go, in the shop's own metres (u from its west wall, v from its back wall toward the street)
  const frame=()=>{ const SB=BOD.SB; return SB?IKIT.frame({x0:SB.x0,y0:SB.y0+3.75,x1:SB.x1,y1:SB.y1}):null; };
  { const o=ROOMS.off.bodega, F=frame(); if(o&&F){ const t=d=>d*TM, sp=(dx,dy,du,dv,h)=>{ const p=F.pw(t(dx),t(dy)); return {x:p[0],z:p[1],hd:F.hd(du,dv),...(h!=null?{y:h*IKIT.MW}:{})}; };
    o.spots={'STOCK CLERK WITH THE FOX':sp(11,.75,0,1),'NIGHT COUNTER':sp(16.0,4.4,-1,0)};
    o.seats=BODEGA.places=[sp(14.0,5.3,1,0),sp(13.2,5.3,1,0),sp(12.4,5.3,1,0),sp(9.9,2.9,0,-1),sp(11.6,2.9,0,-1),sp(2.0,2.0,-1,0),sp(3.6,6.2,-1,0),sp(5.6,3.4,1,0),sp(4.4,8.0,0,-1),sp(10.6,5.4,-1,0),sp(10.9,8.45,0,-1,.32),sp(11.6,8.45,0,-1,.32)]; } }
  STORE.furnish=STORE.furnish||{};
  STORE.furnish.bodega=()=>{ const F=frame(); if(!F)return; const first=!BODEGA.solids; BODEGA.solids=true; const K=IKIT.room(F,m=>SHARED.BODB.SG.add(m),first?undefined:()=>{}), {box,cyl,ball,glow,pic,words,sol,use,own,meshOf,seat,MW}=K, t=d=>d*TM;
    const O=BOD.O, X=BOD.X, Z=BOD.Z, T=TILE, C={steel:0xa8acb0,dsteel:0x6e7276,glass:0xcfe3ea,white:0xf2f2f0,red:0xc02028,cork:0xb08850,wood:0x8a5a2a,blue:0x2a5aa8};
    // a thing to use over a prop of the shop (its own boxes in map tiles)
    const over=(name,p,act,reach=1.5)=>{ if(!p)return; const bs=p.boxes||[], x0=Math.min(...bs.map(b=>b.x0)), x1=Math.max(...bs.map(b=>b.x1)), y0=Math.min(...bs.map(b=>b.y0)), y1=Math.max(...bs.map(b=>b.y1)), z1=Math.max(...bs.map(b=>b.z1||0),40);
      const hb=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(X(x1)-X(x0)),BOD.Y?BOD.Y(z1):z1,Math.abs(Z(y1)-Z(y0))),new THREE.MeshBasicMaterial({visible:false})); hb.position.set((X(x0)+X(x1))/2,(BOD.Y?BOD.Y(z1):z1)/2,(Z(y0)+Z(y1))/2); SHARED.BODB.SG.add(hb);
      UI.thing({name,obj:hb,reach:reach*T,near:(reach+1.1)*T,tall:BOD.Y?BOD.Y(z1):z1,act}); };
    for(const k in SHELF)if(BODEGA.shelf(k).length)over(/^fridge/.test(k)?'THE DRINKS FRIDGE (TAKE)':'THE SHELF (TAKE)',O[k],()=>BODEGA.openShelf(k));
    if(BODEGA.goods)BODEGA.goods({X,Z,O,T,K,G:SHARED.BODB.SG});   // the goods whose sellers are archived, on the shelves (146zea)
    over('THE REGISTER (BUY ANYTHING)',O.counter,BODEGA.register,1.8);
    const WF=t(.12);   // the back wall's inside face
    // the deli on the back wall: a prep counter with the slicer against the wall, the glass case in front, the stock clerk between
    box(t(9),0,t(13),t(.45),0,.9,C.steel); box(t(9),0,t(13),t(.45),.9,.93,0xd8d8d4); cyl(t(10),t(.22),.13,.93,1.18,C.steel); box(t(10)-.05,t(.08),t(10)+.25,t(.36),.93,1.0,C.dsteel); box(t(11.6),t(.1),t(12.6),t(.4),.93,.96,0x9a6a3a); sol(t(9),0,t(13),t(.45));
    box(t(9),t(1.5),t(13),t(2.1),0,.75,C.white); box(t(9)-.02,t(1.48),t(13)+.02,t(2.12),1.15,1.2,C.steel); for(const u of [t(9),t(13)-.03])box(u,t(1.5),u+.03,t(2.1),.75,1.15,C.steel); sol(t(9),t(1.5),t(13),t(2.1));
    { const gl=own(()=>{ box(t(9.03),t(2.07),t(12.97),t(2.1),.75,1.15,C.glass); box(t(9.03),t(1.5),t(12.97),t(1.53),.95,1.15,C.glass); }), gm=meshOf(gl,new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.22,depthWrite:false})); gm.castShadow=false; gm.userData.noMerge=true; }
    glow(()=>box(t(9.05),t(1.52),t(12.95),t(2.08),1.13,1.14,0xf4f8ff)); for(let i=0;i<8;i++){ const u=t(9.3)+i*.43; box(u,t(1.6),u+.34,t(2.0),.78,.86,[0xd88a7a,0xe8c890,0xc84a3a,0xf0e0b0,0xa85a4a,0xe0b080,0xd06a5a,0xf4e4c0][i]); }
    pic(t(11),WF+.005,1.75,2.4,.55,0,1,words(112,24,'#16140f',[['DELI · HEROES',56,3,'#f0c040',9,'center'],['BACON EGG & CHEESE',56,14,'#f4ecd8',7,'center']]),true);
    // the coffee urn on its table by the front, cups and lids
    box(t(12.8),t(8.1),t(13.8),t(8.7),0,.8,C.wood); sol(t(12.8),t(8.1),t(13.8),t(8.7)); cyl(t(13.1),t(8.4),.13,.8,1.25,C.steel); cyl(t(13.1),t(8.4),.1,1.25,1.3,C.dsteel); box(t(13.1)-.02,t(8.4)+.12,t(13.1)+.02,t(8.4)+.16,.95,1.0,C.dsteel);
    for(let i=0;i<5;i++)cyl(t(13.5),t(8.3),.045,.8+i*.06,.86+i*.06,C.white,.05); pic(t(13.3),t(8.1)-.005,.85,.5,.18,0,-1,words(40,14,'#5a2a14',[['COFFEE $1',20,3,'#f4ecd8',8,'center']]),true);
    // the ice chest: ice pops under a sliding lid; MANGO the cat sleeps on top
    box(t(9.2),t(8.1),t(10.4),t(8.7),0,.85,C.white); box(t(9.2),t(8.1),t(10.4),t(8.7),.85,.88,C.glass); box(t(9.25),t(8.08),t(10.35),t(8.1),.3,.6,C.blue); sol(t(9.2),t(8.1),t(10.4),t(8.7));
    pic(t(9.8),t(8.08),.4,.5,.16,0,-1,words(40,12,'#2a5aa8',[['ICE POPS $1',20,2,'#f4f8ff',7,'center']]),true);
    // two milk crates to sit on
    for(const u of [10.9,11.6]){ const cu=t(u), cv=t(8.45); seat('A MILK CRATE',own(()=>{ box(cu-.17,cv-.17,cu+.17,cv+.17,0,.3,u<11?C.red:C.blue); }),[[cu,cv,.3,0,-1]],.8); }
    // the bulletin board on the back wall
    box(t(6.6),WF,t(7.9),WF+.03,1.15,1.95,C.wood); box(t(6.65),WF+.03,t(7.85),WF+.04,1.2,1.9,C.cork); for(let i=0;i<6;i++){ const u=t(6.75)+(i%3)*.38, h=1.28+Math.floor(i/3)*.32; box(u,WF+.04,u+.28,WF+.045,h,h+.24,[0xf4f0e0,0xf0e080,0xa0d0f0,0xf4c0c0,0xf4f0e0,0xc0f0c0][i]); }
    use('THE BULLETIN BOARD',t(7.25),WF+.15,t(1.2),1.95,()=>MINI.look('THE BULLETIN BOARD',(g,w,h)=>{ g.fillStyle='#b08850'; g.fillRect(0,0,w,h); const N=[['ROOM FOR RENT','ASK UPSTAIRS. NO PETS','(EXCEPT CATS)'],['GUITAR LESSONS','$5 A HOUR','CALL ROY'],['LOST: ONE GLOVE','LEFT, BROWN','THE PARK'],['THE FLEA MARKET','UNDER THE TRACKS','ALL WEEK'],['MANGO LIKES','CAT FOOD','AISLE 2'],['CASH ONLY','NO CREDIT','THANK YOU']];
      N.forEach((n,i)=>{ const x=12+(i%3)*(w-24)/3, y=14+Math.floor(i/3)*(h-28)/2, nw=(w-24)/3-10, nh=(h-28)/2-10; g.fillStyle=['#f4f0e0','#f0e080','#a0d0f0','#f4c0c0','#f4f0e0','#c0f0c0'][i]; g.fillRect(x,y,nw,nh); g.fillStyle='#c02028'; g.beginPath(); g.arc(x+nw/2,y+6,4,0,7); g.fill();
        g.fillStyle='#2a2a32'; g.textAlign='center'; g.textBaseline='top'; n.forEach((l,j)=>{ g.font=(j?11:12)+'px monospace'; g.fillText(l,x+nw/2,y+20+j*18); }); }); }),2.0);
    // MANGO, the bodega cat, curled on the ice chest: she breathes and flicks her tail; pet her, or feed her
    const cu=t(9.75), cv=t(8.4), CH=.88, cat=new THREE.Group(); { const M=new THREE.MeshLambertMaterial({color:0xe08a3a}), Wm=new THREE.MeshLambertMaterial({color:0xf4e8d8}), Dk=new THREE.MeshLambertMaterial({color:0x1a1a1a});
      const s=(r,m,x,y,z,sx=1,sy=1,sz=1)=>{ const o=new THREE.Mesh(new THREE.SphereGeometry(r*MW,10,8),m); o.position.set(x*MW,y*MW,z*MW); o.scale.set(sx,sy,sz); cat.add(o); return o; };
      cat.userData.body=s(.13,M,0,.09,0,1.5,.75,1); s(.08,Wm,.1,.06,.05,1,.7,1); const hd=s(.075,M,.2,.1,.04); s(.03,Wm,.25,.08,.06);
      for(const k of [-1,1]){ const e=new THREE.Mesh(new THREE.ConeGeometry(.028*MW,.06*MW,6),M); e.position.set(.2*MW,.18*MW,(.04+k*.04)*MW); cat.add(e); s(.009,Dk,.265,.11,.04+k*.025); }
      const tl=new THREE.Group(); tl.position.set(-.18*MW,.05*MW,0); for(let i=0;i<5;i++){ const q=new THREE.Mesh(new THREE.SphereGeometry(.025*MW,8,6),M); q.position.set(-i*.04*MW,0,(i*i)*.012*MW); tl.add(q); } cat.add(tl); cat.userData.tail=tl; cat.userData.head=hd; }
    const cp=F.pw(cu,cv); cat.position.set(cp[0],CH*MW,cp[1]); cat.rotation.y=F.hd(1,0)-Math.PI/2; cat.traverse(o=>{ o.userData.noMerge=true; o.castShadow=true; }); SHARED.BODB.SG.add(cat); BODEGA.cat=cat;
    use('MANGO, THE BODEGA CAT',cu,cv,.5,1.2,()=>{ '@later'; const now=Date.now();
      if(FORAGE.has&&FORAGE.has('g_catfood')){ FORAGE.take('g_catfood',1); BODEGA.fed=now; FORAGE.buff&&FORAGE.buff('regen',300); say('MANGO EATS THE WHOLE CAN, THEN CURLS UP ON YOUR FEET. YOU FEEL MUCH BETTER.'); }
      else if(now-(BODEGA.petAt||0)>60e3){ BODEGA.petAt=now; FORAGE.buff&&FORAGE.buff('regen',30); say('MANGO PURRS. YOU FEEL A LITTLE BETTER. (SHE LIKES CAT FOOD, AISLE 2.)'); }
      else say('MANGO OPENS ONE EYE. THAT IS ENOUGH PETTING FOR NOW.','#c8a090'); },1.4);
    K.flush(); };
  SYS.add('life',()=>{ const c=BODEGA.cat; if(!c||!c.parent||!SHARED.BODB.SG||!SHARED.BODB.SG.parent)return; const t=performance.now()/1000, B=c.userData.body; B.scale.y=.75*(1+.04*Math.sin(t*1.6)); c.userData.tail.rotation.y=.3*Math.sin(t*.9)+(Math.sin(t*.23)>.8?.6*Math.sin(t*7):0); c.userData.head.rotation.z=.08*Math.sin(t*.4); },'146ze-cat');
}
export {BODEGA};
