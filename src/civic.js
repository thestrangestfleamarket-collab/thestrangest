// ---- THE CIVIC ROW AND THE LEDGER (owner, 17 Oct 2026: "lets add the rest except for supabase ... minimal for now to get started"): what the
// services stand on. THE CIVIC ROW: six small station houses built of flat-coloured blocks (the street's own pixel-art way, dress.js: nothing
// in the Drive is a station) in a row on the land past the street's east end, the building line carried on: THE PRECINCT (navy), THE FIREHOUSE
// (red), THE POST OFFICE (blue), THE DEPOT (orange: public works), CITY HALL (stone), THE CLINIC (white). Each an address of the spine (its
// door's spot), solid walls, a doorway; the view's bounds widened to reach them. THE STAFF: eight of the pawns in uniform (a tint over the
// pack's colours, npc-pawns.js): two officers, two firefighters, the mail carrier, the works crew (one), the clerk, the medic; each at his
// house's door when not on a call. THE LEDGER: the city's money and a log of everything that happens (CIVIC.log); the residents' cash, hunger
// and letters; the shops' stock and tills; the laws (rent, tax, curfew). THE MENU'S CITY TAB shows it all, with TRY buttons (a fire, an
// outage, a full can) so each service can be watched at work. Cost: the row some 900 triangles in one draw, no lights (the row is dark at
// night, the lamp budget being spent); nothing a frame but the clerk's sums ----
const CIVIC={row:[],staff:{},log:[],ledger:{treasury:500,day:0,rent:30,tax:10,wage:20,curfew:[23,5]},shops:{},mail:{bag:[],boxes:{}},fires:[],cans:[]}; window.CIVIC=CIVIC;
{ const T=TILE, M=1/.84*T, YS=ZU*24/TILE, G=(x,z)=>MODS.bodega.ground(x,z);
  CIVIC.note=(what,where)=>{ CIVIC.log.unshift({t:CLOCK.h,day:CITY.day,what,where:where||''}); if(CIVIC.log.length>80)CIVIC.log.length=80; };
  // ---- THE ROW: six houses east of the street's end, fronts on the building line (z 0), 3 tiles wide, 3 deep, 2.6 m high, a doorway in the front
  const HOUSES=[['precinct','THE PRECINCT',0x2b3f7a,0x7f9ad8],['firehouse','THE FIREHOUSE',0x9a2b22,0xe8c070],['post','THE POST OFFICE',0x2f5f9e,0xe8e4d8],['depot','THE DEPOT',0xb86a1e,0x3a2a1a],['hall','CITY HALL',0x8c8678,0x3a3630],['clinic','THE CLINIC',0xd8d8d0,0xc8302a]];
  const BL=[], blk=(x,y,z,sx,sy,sz,c)=>BL.push([x,y,z,sx,sy,sz,c]), X0=BOUND.x1+4*T, GAP=5.5*T, Wd=3*T, D=3*T, H=2.6*M, TK=.22*T;
  HOUSES.forEach(([id,name,col,sign],i)=>{ const cx=X0+i*GAP+Wd/2, zf=0, zb=-D, y=G(cx,zf), dk=(c=>{ const r=(c>>16)*.6|0, g=((c>>8)&255)*.6|0, b=(c&255)*.6|0; return (r<<16)|(g<<8)|b; })(col);
    blk(cx-Wd/2+TK/2,y+H/2,zb+D/2,TK,H,D,col); blk(cx+Wd/2-TK/2,y+H/2,zb+D/2,TK,H,D,col); blk(cx,y+H/2,zb+TK/2,Wd,H,TK,col);   // the sides and the back
    const dw=1.3*T, pw=(Wd-dw)/2; blk(cx-Wd/2+pw/2,y+H/2,zf-TK/2,pw,H,TK,col); blk(cx+Wd/2-pw/2,y+H/2,zf-TK/2,pw,H,TK,col); blk(cx,y+H-.25*M,zf-TK/2,dw,.5*M,TK,col);   // the front round its doorway (the lintel)
    blk(cx,y+H+.08*M,zb+D/2,Wd+.2*T,.16*M,D+.2*T,dk); blk(cx,y+H+.5*M,zf+.02*T,Wd*.8,.6*M,.12*T,sign); blk(cx,y+H+.5*M,zf+.08*T,Wd*.3,.14*M,.06*T,0xf4f0e8);   // the roof slab, the sign over the door, its white stripe
    if(id==='clinic'){ blk(cx,y+H+.5*M,zf+.1*T,.14*M,.5*M,.06*T,0xc8302a); blk(cx,y+H+.5*M,zf+.1*T,.5*M,.14*M,.06*T,0xc8302a); }   // the cross
    if(id==='firehouse')blk(cx,y+H+1.0*M,zb+.6*T,.3*M,.9*M,.3*M,0x6a2a22);   // a bell tower stub
    for(const bx of [[cx-Wd/2,zb,cx-Wd/2+TK,zf],[cx+Wd/2-TK,zb,cx+Wd/2,zf],[cx-Wd/2,zb,cx+Wd/2,zb+TK],[cx-Wd/2,zf-TK,cx-Wd/2+pw,zf],[cx+Wd/2-pw,zf-TK,cx+Wd/2,zf]]){ SOL.up.push(bx); FIX.up.push([bx[0],bx[1],y,bx[2],bx[3],y+H]); }
    CIVIC.row.push({id,name,x:cx,z:zf,col,at:{x:cx,z:zf},door:{x:cx,z:zf+T},inside:{x:cx,z:zb+D/2},kerb:{x:cx,z:(DRESS.kerb?DRESS.kerb.sw:zf+3*T)-.6*T}}); });
  { const geo=new THREE.BoxGeometry(1,1,1), me=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial(),BL.length), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), c=new THREE.Color();
    BL.forEach(([x,y,z,sx,sy,sz,col],i)=>{ me.setMatrixAt(i,m4.compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(sx,sy,sz))); me.setColorAt(i,c.setHex(col)); }); me.castShadow=me.receiveShadow=true; MAPG.bodega.add(me); CIVIC.mesh=me; CIVIC.tris=BL.length*12; }
  BOUND.x1=X0+HOUSES.length*GAP+2*T;   // (the view and the free camera reach the row)
  for(const h of CIVIC.row)CITY.extra.push({id:h.id,name:h.name,lv:'up',at:h.at,door:h.door,box:[h.x-Wd/2,-D,h.x+Wd/2,T]});   // (addresses: the spine's places, and its walk grid's reach)
  CIVIC.house=id=>CIVIC.row.find(h=>h.id===id);
  // ---- THE SHOPS: stock, a till and a price; what each sells (food resets a visitor's hunger)
  for(const [id,stock,price,food] of [['bodega',20,4,true],['store:diner',16,7,true],['store:bar',16,6,false],['dojo',12,3,false]])CIVIC.shops[id]={id,stock,price,food,till:0,sold:0,low:false};
  CIVIC.buy=(who,id)=>{ const S=CIVIC.shops[id]; if(!S)return false; if(S.stock<=0){ CIVIC.note(who.name+' found the shelves empty',id); return false; } if((who.cash||0)<S.price){ CIVIC.note(who.name+' had no money for '+id,id); return false; }
    S.stock--; S.sold++; S.till+=S.price; who.cash-=S.price; if(S.food&&who.hunger!=null)who.hunger=0; CIVIC.note(who.name+' bought something at '+id+' ($'+S.price+')',id); if(S.stock<8&&!S.low){ S.low=true; CITY.post('restock',id,{shop:id}); CIVIC.note(id+' is low on stock: a delivery asked for',id); } return true; };
  // ---- THE RESIDENTS' MONEY AND HUNGER (city.js's residents): cash, a wage each evening out, rent each morning; hunger up through the day, fed by a food shop
  for(const r of CITY.residents){ r.cash=60; r.hunger=.3; r.letters=[]; }
  CITY.onArrive=(r,P)=>{ if(CIVIC.shops[P.id])CIVIC.buy(r,P.id); const can=CIVIC.nearCan&&CIVIC.nearCan(r.N.st.x,r.N.st.z); if(can)CIVIC.fillCan(can,1); };
  // ---- THE MAIL: a letter is a record; the carrier takes the bag round (duties.js); a resident reads his when he's home
  CIVIC.send=(to,from,subject,body)=>{ const L={id:(CIVIC.mail.n=(CIVIC.mail.n||0)+1),to,from,subject,body:body||'',day:CITY.day,t:CLOCK.h,state:'posted'}; CIVIC.mail.bag.push(L); return L; };
  CIVIC.box=to=>CIVIC.mail.boxes[to]||(CIVIC.mail.boxes[to]=[]);
  // ---- THE CLERK'S DAY: rent notices at 8, rent due at 9 (paid from cash, or owed), wages at 17 to those who were out, the shops' tax at 18
  CITY.at(8,()=>{ for(const r of CITY.residents)CIVIC.send(r.key,'CITY HALL','RENT DUE','Rent of $'+CIVIC.ledger.rent+' for flat '+r.flat+' is due today.'); CIVIC.send('you','CITY HALL','WELCOME','The Market is open. Rent is $'+CIVIC.ledger.rent+' a day. Curfew '+CIVIC.ledger.curfew[0]+':00 to '+CIVIC.ledger.curfew[1]+':00.'); CIVIC.note('rent notices posted','hall'); },'rent notices');
  CITY.at(9,()=>{ for(const r of CITY.residents){ const due=CIVIC.ledger.rent+(r.owed||0); if(r.cash>=due){ r.cash-=due; CIVIC.ledger.treasury+=due; r.owed=0; CIVIC.note(r.name+' paid rent $'+due,'hall'); } else { r.owed=due; CIVIC.note(r.name+' owes rent $'+due,'hall'); } } },'rent');
  CITY.at(17,()=>{ for(const r of CITY.residents)if(r.state!=='home'){ r.cash+=40; CIVIC.note(r.name+' was paid $40','street'); } let w=0; for(const k in CIVIC.staff)w+=CIVIC.ledger.wage; CIVIC.ledger.treasury-=w; CIVIC.note('the city paid its staff $'+w,'hall'); },'wages');
  CITY.at(18,()=>{ for(const S of Object.values(CIVIC.shops)){ const t=Math.min(S.till,CIVIC.ledger.tax); S.till-=t; CIVIC.ledger.treasury+=t; } CIVIC.note('the shops paid their tax','hall'); },'tax');
  // hunger: a day's worth in about eight hours of the clock, only while the clock runs; hungry and out, his next errand is for food (residents.js asks)
  CIVIC.hungerTick=dt=>{ if(!CLOCK.run)return; const dh=dt*CLOCK.speed/60; for(const r of CITY.residents){ if(r.hunger==null)continue; if(r.state==='home')r.hunger=Math.max(0,r.hunger-dh/6); else r.hunger=Math.min(1,r.hunger+dh/8); } };
  CIVIC.wants=r=>r.hunger>.6?(Math.random()<.5?'bodega':'store:diner'):null;
  // the residents' names (the pawns' keys read better as people)
  for(const r of CITY.residents)r.name={hero_m:'MR HALE',hero_f:'MS HALE',villager_m:'MR VOSS',villager_f:'MS VOSS'}[r.key]||r.key;
  // ---- THE STAFF: the pawns in uniform at their houses (npc-pawns.js tints them); each knows his house, stands at its door when free
  const ROLE={ogre_guard_light:['officer1','OFFICER REED','precinct'],ogre_guard_heavy:['officer2','OFFICER CRUZ','precinct'],ogre:['fire1','FIREFIGHTER OKAFOR','firehouse'],ogre_mage:['fire2','FIREFIGHTER LIND','firehouse'],skeleton_mage:['carrier','THE MAIL CARRIER','post'],skeleton_reaper:['works','THE WORKS CREW','depot'],skeleton_guard_light:['clerk','THE CLERK','hall'],skeleton_guard_heavy:['medic','THE MEDIC','clinic']};
  for(const [key,[id,name,house]] of Object.entries(ROLE)){ const N=NPCS.find(n=>n.key===key); if(!N)continue; N.name=name; const S={id,name,key,N,house,state:'free',job:null,busy:0}; CIVIC.staff[id]=S;
    const h=CIVIC.house(house); if(h){ N.st.x=h.door.x+(id.endsWith('2')?.7*T:id.endsWith('1')?-.7*T:0); N.st.z=h.door.z; N.g.position.x=N.st.x; N.g.position.z=N.st.z; N.st.h=0; N.st.hold=true; N.st.to=null; N.home={x:N.st.x,z:N.st.z}; } }
  CIVIC.free=id=>{ const S=CIVIC.staff[id]; return S&&S.state==='free'; };
  // a staff member sent somewhere, hurrying; home again after (then: when he's there, or false)
  CIVIC.go=(S,to,then,v=2)=>{ S.N.st.hold=false; CITY.send(S.N,to,{v,then}); };
  CIVIC.home=S=>{ S.state='returning'; S.job=null; CIVIC.go(S,S.N.home,()=>{ S.state='free'; S.N.st.hold=true; S.N.st.h=0; S.N.st.to=null; S.N.st.face=null; },1.4); };
  // a thing in his hands while he carries it (a crate, a bag, a tool box): a small box over his shoulder
  CIVIC.carry=(S,col)=>{ if(S.item){ S.N.g.remove(S.item); S.item=null; } if(col==null)return; const m=new THREE.Mesh(new THREE.BoxGeometry(.28*T,.22*T,.28*T),new THREE.MeshLambertMaterial({color:col})); m.position.set(.18*T,S.N.H*.75,.1*T); m.castShadow=true; S.N.g.add(m); S.item=m; };
  // ---- THE MENU'S CITY TAB
  { const Mn=document.getElementById('menu'), tabs=Mn.querySelector('.tabs'), bt=document.createElement('button'); bt.setAttribute('role','tab'); bt.dataset.t='city'; bt.textContent='CITY'; tabs.insertBefore(bt,tabs.querySelector('[data-t="keys"]'));
    const pane=document.createElement('div'); pane.className='pane'; pane.dataset.p='city'; pane.hidden=true; pane.innerHTML='<div id="civ" style="font:11px Silkscreen,monospace;letter-spacing:.4px;max-height:60vh;overflow:auto"></div><h3>TRY</h3><div class="row"><button class="btn" id="cvfire">A FIRE</button><button class="btn" id="cvout">AN OUTAGE</button><button class="btn" id="cvcan">A FULL CAN</button><button class="btn" id="cvmail">A LETTER TO YOU</button><button class="btn" id="cvfaint">YOU FAINT</button></div>';
    Mn.querySelector('.foot').before(pane); const show=t=>{ Mn.querySelectorAll('[data-t]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.t===t))); Mn.querySelectorAll('[data-p]').forEach(p=>p.hidden=p.dataset.p!==t); if(t==='city')CIVIC.draw(); };
    bt.onclick=()=>show('city'); Mn.querySelectorAll('[data-t]').forEach(b=>{ if(b!==bt){ const f=b.onclick; b.onclick=e=>{ f&&f(e); show(b.dataset.t); }; } });
    const fmt=h=>{ const m=Math.floor(h*60)%60, hh=Math.floor(h)%24; return hh+':'+(m<10?'0':'')+m; }, esc=s=>String(s).replace(/</g,'&lt;');
    CIVIC.draw=()=>{ if(!pane.offsetParent)return; const L=CIVIC.ledger, row=(a,b)=>`<div style="display:flex;justify-content:space-between;gap:12px"><span>${a}</span><span style="color:#c9ccd6">${b}</span></div>`;
      let o=`<h3>THE LEDGER</h3>${row('DAY '+CITY.day+' · '+fmt(CLOCK.h)+(CLOCK.run?' RUNNING':' STOPPED'),'TREASURY $'+L.treasury)}${row('LAWS','rent $'+L.rent+' a day · tax $'+L.tax+' a shop · curfew '+L.curfew[0]+':00-'+L.curfew[1]+':00')}`;
      o+='<h3>RESIDENTS</h3>'+CITY.residents.map(r=>row(r.name+' · '+r.flat,r.state+' · $'+r.cash+(r.owed?' owes $'+r.owed:'')+' · hunger '+Math.round(r.hunger*100)+'% · letters '+CIVIC.box(r.key).length)).join('');
      o+='<h3>SHOPS</h3>'+Object.values(CIVIC.shops).map(S=>row(S.id,'stock '+S.stock+' · till $'+S.till+' · sold '+S.sold)).join('');
      o+='<h3>SERVICES</h3>'+Object.values(CIVIC.staff).map(S=>row(S.name,S.state+(S.job?' · '+S.job.kind+(S.job.place?' at '+S.job.place:''):''))).join('');
      o+='<h3>VEHICLES</h3>'+VEH.list.map(v=>row(v.name,(v.to!=null?'driving':'parked')+' at '+(v.x/T).toFixed(0)+(v.rider?' · '+v.rider.name+' aboard':'')+(v.alarm?' · LIGHTS':''))).join('');
      o+='<h3>OPEN JOBS</h3>'+(CITY.open().map(j=>row(j.kind,(j.place||'')+' · posted '+fmt(j.posted))).join('')||row('none',''));
      const my=CIVIC.box('you'); o+='<h3>YOUR MAILBOX (THE APARTMENTS\' LOBBY)</h3>'+(my.slice(-5).reverse().map(l=>row(l.from+': '+l.subject,esc(l.body))).join('')||row('nothing yet','the carrier comes at 9:30'));
      o+='<h3>THE LOG</h3>'+CIVIC.log.slice(0,14).map(e=>row('DAY '+e.day+' '+fmt(e.t),esc(e.what))).join('');
      pane.querySelector('#civ').innerHTML=o; };
    setInterval(()=>{ if(UI.menuOpen)CIVIC.draw(); },1000);
    pane.querySelector('#cvfire').onclick=()=>CIVIC.tryFire&&CIVIC.tryFire(); pane.querySelector('#cvout').onclick=()=>CIVIC.tryOutage&&CIVIC.tryOutage(); pane.querySelector('#cvcan').onclick=()=>CIVIC.tryCan&&CIVIC.tryCan(); pane.querySelector('#cvfaint').onclick=()=>{ CIVIC.tryFaint&&CIVIC.tryFaint(); UI.toggleMenu(); };
    pane.querySelector('#cvmail').onclick=()=>{ CIVIC.send('you','THE MARKET','HELLO','A letter for you, in the bag till the carrier\'s round.'); CIVIC.draw(); }; }
  // each frame: the vehicles, hunger
  const t0=CITY.tick; CITY.tick=(dt,you)=>{ t0(dt,you); VEH.tick(dt); CIVIC.hungerTick(dt); };
  CIVIC.note('the city opened','hall');
}
