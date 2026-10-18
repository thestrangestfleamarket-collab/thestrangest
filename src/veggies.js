// ---- THE TOMATO'S VEGGIE STAND (owner, 18 Oct 2026, his picture of the tomato: "give the tomato merchant his own veggie stand by the mushroom
// vendor, he buys and sells veggies"): on the park's sidewalk just east of the mushroom seller's booth, its front to the street as his is: a
// green-painted stand, three tilted crates of vegetables on it in rows (tomatoes, peppers, carrots, corn, cabbages, eggplants, potatoes, onions,
// greens), a pumpkin or two at its foot, a green and cream awning on two posts, a slate of the day's prices. THE TOMATO (npc-toons.js) stands
// behind it facing the street, held there (his roaming and his life left off), turning his head about. A double click on him: his shop
// (`vegp`): he sells ten vegetables and buys any of yours back at a little over half; one purse (INV's). The vegetables are food raw (a small
// bite each, no harm) and go into four dishes by a flame (COOKING: forage.js's recipes): ROAST CORN, VEGETABLE STEW, STUFFED PEPPER (with
// meadow buttons) and PUMPKIN SOUP. Blocks and rounds in two instanced draws (some 2,600 triangles), solid at the stand; no light ----
const VEG={}; window.VEG=VEG;
{ const T=TILE;
  // THE VEGETABLES: id, name, his price, what he pays, raw food, colour, shape [w, h] in tiles and whether round
  const V=[['v_tomato','TOMATO',3,2,.06,0xc8321e,[.07,.07],1],['v_pepper','BELL PEPPER',4,2,.06,0x2f8a2a,[.07,.08],1],['v_carrot','CARROT',2,1,.05,0xe0742a,[.035,.16],0],
    ['v_corn','EAR OF CORN',3,2,.08,0xe8c84a,[.05,.18],0],['v_cabbage','CABBAGE',5,3,.08,0x8ac05a,[.1,.09],1],['v_eggplant','EGGPLANT',4,2,.07,0x4a2a5a,[.06,.12],1],
    ['v_potato','POTATO',2,1,.07,0xb08a5a,[.06,.05],1],['v_onion','ONION',2,1,.04,0xd8b88a,[.055,.055],1],['v_greens','LEAFY GREENS',3,2,.04,0x4a9a3a,[.09,.05],1],
    ['v_pumpkin','PUMPKIN',12,7,.14,0xe0782a,[.2,.16],1]];
  const NM=Object.fromEntries(V.map(v=>[v[0],v[1]])), SELL=Object.fromEntries(V.map(v=>[v[0],v[2]])), BUY=Object.fromEntries(V.map(v=>[v[0],v[3]]));
  FORAGE.add({names:Object.assign({},NM,{f_corn:'ROAST CORN',f_vstew:'VEGETABLE STEW',f_stuffpep:'STUFFED PEPPER',f_psoup:'PUMPKIN SOUP'}),
    raw:Object.fromEntries(V.map(v=>[v[0],[v[4],0]])),
    prices:Object.assign({f_corn:7,f_vstew:14,f_stuffpep:16,f_psoup:28},BUY),
    recipes:[['f_corn','ROAST CORN','cooking',[0,40],{v_corn:1},'fills a fifth'],['f_vstew','VEGETABLE STEW','cooking',[15,60],{v_potato:1,v_carrot:1,v_onion:1},'fills two fifths, some health'],
      ['f_stuffpep','STUFFED PEPPER','cooking',[25,70],{v_pepper:1,m_button:2},'fills two fifths, mends you a minute'],['f_psoup','PUMPKIN SOUP','cooking',[40,85],{v_pumpkin:1,v_onion:1},'fills more than half, strong 2 min']],
    does:{f_corn:()=>FORAGE.feed(.2),f_vstew:()=>{ FORAGE.feed(.4); VIT.hp=Math.min(1,VIT.hp+.2); },f_stuffpep:()=>{ FORAGE.feed(.4); FORAGE.buff('regen',60); },f_psoup:()=>{ FORAGE.feed(.6); FORAGE.buff('str',120); }}});
  // ---- THE STAND: built once the park is (its gate where the layout put it), beside the mushroom seller's booth
  const STAND=()=>{ const P=PARK, X=x=>BOD.XS(x+(P.ox||0)), Z=y=>BOD.ZS(y+(P.oy||0)), Y=BOD.YS, g1=P.gate[1], x0=g1+9, x1=g1+12.4, y0=P.y0-7, y1=P.y0-6, TP=26;
    const BX=[], RD=[], box=(a,b,c,d,z0,z1,col)=>BX.push([(X(a)+X(b))/2,(Y(z0)+Y(z1))/2,(Z(c)+Z(d))/2,Math.abs(X(b)-X(a)),Y(z1)-Y(z0),Math.abs(Z(d)-Z(c)),col]);
    const rnd=(()=>{ let t=11; return ()=>{ t=(t*16807)%2147483647; return t/2147483647; }; })(), GRN=0x3e6a3a, DK=0x2a4a28, WOOD=0x9a7a4e;
    box(x0,x1,y0,y1,TP-2,TP,GRN); box(x0+.04,x1-.04,y0,y0+.06,4,TP-2,GRN); for(const [a,b] of [[x0+.06,y0+.06],[x1-.18,y0+.06],[x0+.06,y1-.18],[x1-.18,y1-.18]])box(a,a+.12,b,b+.12,0,TP-2,DK);   // (the stand, its front panel, its legs)
    box(x0+.08,x0+.2,y1-.1,y1+.02,0,74,DK); box(x1-.2,x1-.08,y1-.1,y1+.02,0,74,DK);   // (the awning's posts, at the back)
    for(let i=0;i<8;i++){ const a=x0-.15+i*(x1-x0+.3)/8; box(a,a+(x1-x0+.3)/8,y0-.35,y1+.05,72,75,i&1?0xeee4cc:0x3a7a3a); }   // (the awning, striped green and cream)
    box(x1-.75,x1-.15,y1-.06,y1-.02,TP+8,TP+26,0x2a2c2e); box(x1-.78,x1-.12,y1-.07,y1-.01,TP+7,TP+8,WOOD);   // (the slate of prices on its stand, at the back)
    // three crates in a row along the front, each tilted toward the street (a step down front to back), heaped with three kinds each
    const CR=[[x0+.12,x0+1.18,[0,1,8]],[x0+1.22,x0+2.28,[2,3,5]],[x0+2.32,x1-.12,[4,6,7]]];
    for(const [a,b,kinds] of CR){ box(a,b,y0+.1,y1-.32,TP,TP+3,WOOD); box(a,b,y1-.34,y1-.24,TP,TP+7,WOOD);
      kinds.forEach((k,j)=>{ const v=V[k], ka=a+(b-a)*j/3, kb=a+(b-a)*(j+1)/3; for(let n=0;n<10;n++){ const x=ka+.05+rnd()*(kb-ka-.1), y=y0+.15+rnd()*(y1-y0-.55), r=v[6][0], h=v[6][1];
        RD.push([X(x),Y(TP+3)+h*T*.45+((y-y0)/(y1-y0))*Y(4),Z(y),r*T,h*T,v[5],v[7],rnd()*6.3]); } }); }
    for(const [x,y] of [[x0+.3,y0-.25],[x0+.75,y0-.3]]){ const v=V[9]; RD.push([X(x),v[6][1]*T*.5,Z(y),v[6][0]*T,v[6][1]*T,v[5],1,rnd()*6.3]); }   // (pumpkins at its foot)
    const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), c=new THREE.Color(), V3=THREE.Vector3, grp=(typeof MAPG!=='undefined'&&MAPG.park)||scene;
    const B=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xffffff}),BX.length); BX.forEach(([x,y,z,sx,sy,sz,col],i)=>{ B.setMatrixAt(i,m4.compose(new V3(x,y,z),q,new V3(sx,sy,sz))); B.setColorAt(i,c.setHex(col)); });
    // (a round one a squashed ball; a long one, a carrot or an ear of corn, a ball stretched and laid along the crate)
    const R=new THREE.InstancedMesh(new THREE.SphereGeometry(.5,7,5),new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true}),RD.length);
    RD.forEach(([x,y,z,r,h,col,round,a],i)=>{ q.setFromEuler(e.set(round?0:Math.PI/2,a,0)); R.setMatrixAt(i,m4.compose(new V3(x,y,z),q,round?new V3(r*2,h*2,r*2):new V3(r*2,h*2,r*2))); R.setColorAt(i,c.setHex(col)); });
    q.identity(); for(const me of [B,R]){ me.castShadow=me.receiveShadow=true; grp.add(me); }
    SOL.up.push([Math.min(X(x0),X(x1)),Math.min(Z(y0),Z(y1)),Math.max(X(x0),X(x1)),Math.max(Z(y0),Z(y1))]); FIX.up.push([Math.min(X(x0),X(x1)),Math.min(Z(y0),Z(y1)),0,Math.max(X(x0),X(x1)),Math.max(Z(y0),Z(y1)),Y(TP)]);
    VEG.stand={x0,x1,y0,y1,hx:X((x0+x1)/2),hz:Z(y1+.7),fz:Z(y0-2)};
    // THE TOMATO behind it, facing the street: his life and roaming left off, held there every tick (his head still looks about)
    const N=TOONS.tomato; if(!N)return; N.life=null; N.roam=false; N.home={x:VEG.stand.hx,z:VEG.stand.hz};
    const hold=st=>{ st.to=null; st.next=null; st.hold=true; st.x=VEG.stand.hx; st.z=VEG.stand.hz; st.face={x:VEG.stand.hx,z:VEG.stand.fz}; }, tk=N.tick; N.tick=(dt,you)=>{ hold(N.st); tk(dt,you); hold(N.st); }; hold(N.st);
    for(const th of UI.things)if(th.npc&&th.npc===N){ th.act=()=>SHOP.open(); th.reach=2.2*T; th.near=3*T; }   // (a double click across his stand) };
  };
  { const wait=()=>{ if(!PARK.fire||typeof MUSH==='undefined'||!MUSH.booth||typeof TOONS==='undefined'||!TOONS.tomato)return setTimeout(wait,500); STAND(); }; wait(); }
  // ---- HIS SHOP (an X and a drag: ui.js's PANS, 'vegp')
  const SHOP={}; VEG.SHOP=SHOP; const say=FORAGE.say, B='style="margin:0 0 0 4px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer"';
  const sp=document.createElement('div'); sp.id='vegp'; sp.hidden=true; sp.style.cssText='position:fixed;left:50%;top:10%;transform:translateX(-50%);width:min(460px,92vw);max-height:80vh;overflow:auto;z-index:21;padding:14px 16px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  document.body.appendChild(sp); sp.addEventListener('keydown',e=>e.stopPropagation()); sp.addEventListener('keyup',e=>e.stopPropagation());
  const row=(a,b,c,d)=>`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">${a}</td><td style="text-align:right;padding:4px 6px">${b}</td><td style="text-align:right">${c}</td><td style="text-align:right;white-space:nowrap">${d}</td></tr>`;
  SHOP.draw=()=>{ if(sp.hidden)return; const mine=V.map(v=>v[0]).filter(id=>FORAGE.has(id)>0);
    let o=`<h3 style="margin:0 0 4px;color:#f2c14e;font:12px Silkscreen,monospace">THE TOMATO'S VEGGIES</h3><div style="color:#9b9584;margin-bottom:8px">Fresh today. He buys back what you don't want.</div><div style="margin-bottom:8px">YOU HAVE <b style="color:#f2c14e">$${Math.round(INV.cash)}</b></div>`;
    o+=`<div style="margin:6px 0 4px;color:#9b9584">HE SELLS</div><table style="border-collapse:collapse;width:100%">`+V.map(([id,nm,p])=>row(nm,'$'+p,FORAGE.has(id)?'x'+FORAGE.has(id):'',`<button ${B} data-buy="${id}">BUY</button><button ${B} data-buy="${id}" data-n="5">5 $${p*5}</button>`)).join('')+'</table>';
    o+=`<div style="margin:10px 0 4px;color:#9b9584">HE BUYS</div><table style="border-collapse:collapse;width:100%">`+mine.map(id=>{ const n=FORAGE.has(id), v=BUY[id]; return row(NM[id],'$'+v,'x'+n,`<button ${B} data-sell="${id}">SELL</button>${n>1?`<button ${B} data-sell="${id}" data-n="all">ALL $${v*n}</button>`:''}`); }).join('')+'</table>';
    if(!mine.length)o+='<div style="color:#7d7a70;margin-top:6px">No vegetables on you. Cook them by a flame: roast corn, a stew, a stuffed pepper, pumpkin soup.</div>';
    const x=sp.querySelector(':scope>.pX'); sp.innerHTML=o; if(x)sp.appendChild(x); };
  sp.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||b.classList.contains('pX'))return; const d=b.dataset;
    if(d.buy){ const n=+d.n||1, c=SELL[d.buy]*n; if(INV.cash<c)say('YOU CANNOT AFFORD THAT.','#c8a090'); else { INV.cash-=c; FORAGE.give(d.buy,n); say(`YOU BUY ${n} ${NM[d.buy]} FOR $${c}.`); if(window.CIVIC&&CIVIC.note)CIVIC.note('you bought '+n+' '+NM[d.buy].toLowerCase()+' from the tomato','park'); } }
    if(d.sell){ const n=d.n==='all'?FORAGE.has(d.sell):1, v=BUY[d.sell]*n; FORAGE.take(d.sell,n); INV.cash+=v; say(`YOU SELL ${n} ${NM[d.sell]} FOR $${v}.`,'#f2c14e'); if(typeof SFX!=='undefined')SFX.play('clunk',{vol:.5}); }
    INV.add('x',0); delete INV.items.x; SHOP.draw(); FORAGE.draw(); });
  SHOP.open=()=>{ sp.hidden=false; SHOP.draw(); if(typeof LINES!=='undefined'&&TOONS.tomato)LINES.say(TOONS.tomato,'greet'); };
  window.VEGDBG=()=>({stand:!!VEG.stand,wx:TOONS.tomato&&TOONS.tomato.st.x,wz:TOONS.tomato&&TOONS.tomato.st.z,x:TOONS.tomato&&+(TOONS.tomato.st.x/T).toFixed(1),z:TOONS.tomato&&+(TOONS.tomato.st.z/T).toFixed(1),held:TOONS.tomato&&TOONS.tomato.st.hold,mine:V.map(v=>[v[0],FORAGE.has(v[0])]).filter(a=>a[1])}); }
