// THE AQUARIUM: the Hudson row's shop of every fish and sea animal in the game, each alive in its own lit tank down both walls and the back; a tank sells its kind, which lives in your apartment's fish tank (PETS.sea, kept with your account); a big round tank in the middle to look at.
import {SHARED, THREE} from './003-shx.js';
import {INV, PETS, pos, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
import {MSHOP} from './059i-mshops.js';
import {PFROW} from './068a-pfrow.js';
import {FISHES} from './141f-fishes.js';
const AQUA={tanks:[]}; window.AQUA=AQUA;
{ const WU=TILE/.84, m=1/.84, zm=28.6, ID='aquarium';
  // every kind: [fish model, NAME, price]; fresh water down the left wall, the big sea across the back, the reef down the right
  const FRESH=[['koi','KOI',25],['goldfish','GOLDFISH',10],['dace','DACE',10],['sockeye','SOCKEYE SALMON',30],['x_catfish','CHANNEL CATFISH',25],['x_carp','CARP',20],['x_trout','RAINBOW TROUT',25],['x_pike','NORTHERN PIKE',35],
      ['x_lbass','LARGEMOUTH BASS',25],['x_bluegill','BLUEGILL',10],['x_sunfish','SUNFISH',10],['x_yperch','YELLOW PERCH',15],['x_perch','WHITE PERCH',15],['x_eel','AMERICAN EEL',30],['x_sturgeon','ATLANTIC STURGEON',60],['x_shad','AMERICAN SHAD',15]],
    SEA=[['shark','SHARK',150],['dolphin','DOLPHIN',150],['plesiosaur','PLESIOSAUR',200],['seaturtle','SEA TURTLE',90],['octopus','OCTOPUS',80],['stingray','STINGRAY',70],['jellyfish','JELLYFISH',40],['moray','MORAY EEL',60],
      ['barracuda','BARRACUDA',60],['coelacanth','COELACANTH',120],['trevally','TREVALLY',30],['seabream','SEA BREAM',25],['x_bass','STRIPED BASS',30],['x_bluefish','BLUEFISH',25],['x_flounder','SUMMER FLOUNDER',25],['x_tomcod','ATLANTIC TOMCOD',15],
      ['x_crab','BLUE CRAB',20],['shrimp','SHRIMP',10],['goatfish','GOATFISH',20],['knifejaw','KNIFEJAW',25]],
    REEF=[['clownfish','CLOWNFISH',20],['bluetang','BLUE TANG',25],['yellowtang','YELLOW TANG',25],['angelfish','ANGELFISH',25],['butterflyfish','BUTTERFLYFISH',20],['cardinalfish','CARDINALFISH',15],['chromis','CHROMIS',10],['cleanerwrasse','CLEANER WRASSE',15],
      ['wrasse','WRASSE',15],['firefish','FIREFISH',20],['foxface','FOXFACE',25],['lionfish','LIONFISH',40],['mandarinfish','MANDARINFISH',35],['moorishidol','MOORISH IDOL',30],['puffer','PUFFERFISH',30],['stripedpuffer','STRIPED PUFFER',30]];
  const ALL=[...FRESH,...SEA,...REEF], BY=Object.fromEntries(ALL.map(a=>[a[0],a])); AQUA.kinds=ALL;
  // yours: every sea pet you have, each in your apartment's tank (OWNED 'tank')
  const recs=()=>{ try{ const j=JSON.parse(OWNED.get('tank')||'[]'); return Array.isArray(j)?j.filter(r=>r&&BY[r.k]):[]; }catch(e){ return []; } };
  let LIST=recs(); const keep=()=>{ try{ OWNED.set('tank',JSON.stringify(LIST)); }catch(e){} };
  PETS.sea=()=>LIST; PETS.seaName=k=>BY[k]&&BY[k][1];
  const buy=k=>{ const a=BY[k]; if(!a)return false; if(INV.cash<a[2]){ SAY('THE '+a[1]+' IS $'+a[2]+'. YOU HAVE $'+Math.round(INV.cash)+'.','#c8a090'); return false; }
    INV.cash-=a[2]; if(INV.save)INV.save(); LIST.push({id:LIST.reduce((n,r)=>Math.max(n,r.id||0),0)+1,k,born:Date.now()}); keep();
    SAY('THE '+a[1]+' IS YOURS: $'+a[2]+'. IT SWIMS IN YOUR APARTMENT\'S FISH TANK NOW (ESC, PETS).','#9fe07f'); if(PETS.menuDraw)PETS.menuDraw(); return true; };
  AQUA.buy=buy;
  PETS.seaMenu=()=>{ if(!LIST.length)return ''; return '<h3 style="margin-top:16px">IN YOUR FISH TANK</h3>'+LIST.map(r=>`<div class="row" style="justify-content:space-between"><span>${BY[r.k][1]} <span class="dim">· SINCE ${new Date(r.born).toLocaleDateString()}</span></span><button class="btn" data-sea="${r.id}">LET IT GO</button></div>`).join('')
    +'<div class="dim">SEA PETS LIVE IN YOUR APARTMENT\'S FISH TANK; FISH FOOD FEEDS THEM ALL (THE AQUARIUM ON THE HUDSON).</div>'; };
  PETS.seaAct=(id,b)=>{ const r=LIST.find(x=>x.id===+id); if(!r)return; if(!b.dataset.sure){ b.dataset.sure='1'; b.textContent='SURE? CLICK AGAIN'; return; }
    LIST.splice(LIST.indexOf(r),1); keep(); SAY('THE '+BY[r.k][1]+' GOES BACK TO THE AQUARIUM.','#c8d8e0'); if(PETS.menuDraw)PETS.menuDraw(); };
  /* ---------- the tanks: built once the Hudson row stands, on the shop's floor (in the shop's frame: u across, v from the back, z up in z-pixels) ---------- */
  let G=null, armed=null; const FISH=[];
  const build=()=>{ const at=MSHOP.at[ID], F=PFROW.fronts.find(f=>f.id===ID); if(!at||!at.L||!F||!F.obj||!FISHES.load)return false; const {X,Y,Z}=SHARED.BOD, L=at.L, pt=at.pt, W=(u,v,z)=>{ const q=pt(u,v); return new THREE.Vector3(X(q[0]),Y(z),Z(q[1])); };
    G=new THREE.Group(); G.name='aquarium'; F.obj.add(G);
    const OP={p:[],c:[]}, WA={p:[],c:[]}, GL={p:[],c:[]}, col=new THREE.Color();
    const box=(T,u0,u1,v0,v1,z0,z1,c)=>{ col.set(c); const k=[[u0,v0,z0],[u1,v0,z0],[u1,v1,z0],[u0,v1,z0],[u0,v0,z1],[u1,v0,z1],[u1,v1,z1],[u0,v1,z1]].map(q=>W(...q));
      for(const f of [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7],[3,2,1,0]])for(const i of [f[0],f[1],f[2],f[0],f[2],f[3]]){ T.p.push(k[i].x,k[i].y,k[i].z); T.c.push(col.r,col.g,col.b); } };
    const th=.3*m, W0=L.x0+th, W1=L.x1-th, V0=L.y0+th, V1=L.y1, TD=.5*m, RZ=[.62*zm,1.3*zm], TH=.55*zm, WOOD=0x3a2a1e, SAND=0xd8c8a0, WATER=[0x5ab4d8,0x3a8ab8,0x58c8c0];
    const tank=(u0,u1,v0,v1,z,k,wall,water)=>{ box(OP,u0,u1,v0,v1,z-.05*zm,z,WOOD); box(OP,u0+.02*m,u1-.02*m,v0+.02*m,v1-.02*m,z,z+.06*zm,SAND); box(OP,u0,u1,v0,v1,z+TH,z+TH+.04*zm,0x202224);
      box(GL,u0+.04*m,u1-.04*m,v0+.04*m,v1-.04*m,z+TH,z+TH+.01*zm,0xe8f8ff); box(WA,u0+.02*m,u1-.02*m,v0+.02*m,v1-.02*m,z+.06*zm,z+TH-.06*zm,water);
      const bk=wall?[u0,u1,v0,v0+.03*m]:u0<(L.x0+L.x1)/2?[u0,u0+.03*m,v0,v1]:[u1-.03*m,u1,v0,v1]; box(OP,bk[0],bk[1],bk[2],bk[3],z+.06*zm,z+TH,0x16405e);   // (its blue backing, the wall side)
      const a=BY[k], c=W((u0+u1)/2,(v0+v1)/2,z+TH*.5), along=wall?W(u0,v0,z).sub(W(u1,v0,z)):W(u0,v0,z).sub(W(u0,v1,z)), len=along.length(); along.normalize();
      const hb=new THREE.Mesh(new THREE.BoxGeometry(Math.max(.3,(u1-u0))*TILE,TH/zm*WU,Math.max(.3,(v1-v0))*TILE),new THREE.MeshBasicMaterial({visible:false})); hb.position.copy(c); hb.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),Math.atan2(along.x,along.z)+Math.PI/2); G.add(hb);
      UI.thing({name:'A '+a[1]+' ($'+a[2]+')',obj:hb,reach:1.8*TILE,near:3*TILE,tall:TH/zm*WU,act:()=>{ if(armed&&armed.k===k&&Date.now()-armed.t<8000){ armed=null; buy(k); return; } armed={k,t:Date.now()};
        SAY('THE '+a[1]+' FOR YOUR APARTMENT\'S FISH TANK: $'+a[2]+'. DOUBLE-CLICK THE TANK AGAIN TO BUY IT.','#c8e8f0'); }});
      FISH.push({k,c,along,room:len,h:TH/zm*WU,ph:Math.random()*6.28,s:.3+Math.random()*.4,o:null}); AQUA.tanks.push({k,c}); };
    // both side walls, two rows, from the back toward the open front; the back wall, two rows
    const sideN=8, sv0=V0+.62*m, sv1=V1-1.7*m, sl=(sv1-sv0)/sideN, back=SEA.length/2, bu0=W0+TD+.15*m, bu1=W1-TD-.15*m, bl=(bu1-bu0)/back;
    FRESH.forEach(([k],i)=>{ const c=i%sideN, r=Math.floor(i/sideN); tank(W0,W0+TD,sv0+c*sl+.04*m,sv0+(c+1)*sl-.04*m,RZ[r],k,false,WATER[0]); });
    REEF.forEach(([k],i)=>{ const c=i%sideN, r=Math.floor(i/sideN); tank(W1-TD,W1,sv0+c*sl+.04*m,sv0+(c+1)*sl-.04*m,RZ[r],k,false,WATER[2]); });
    SEA.forEach(([k],i)=>{ const c=i%back, r=Math.floor(i/back); tank(bu0+c*bl+.04*m,bu0+(c+1)*bl-.04*m,V0,V0+TD,RZ[r],k,true,WATER[1]); });
    for(const [u0,u1,v0,v1] of [[W0,W0+TD,sv0,sv1],[W1-TD,W1,sv0,sv1],[bu0,bu1,V0,V0+TD]]){ box(OP,u0,u1,v0,v1,0,RZ[0]-.05*zm,WOOD); box(OP,u0,u1,v0,v1,RZ[1]-.12*zm,RZ[1]-.05*zm,WOOD); at.sb(u0,v0,u1,v1,RZ[1]+TH); }
    // the big round tank in the middle: a few of every water
    const cu=(L.x0+L.x1)/2, cv=L.y0+5.6*m, cr=1.1*m, ch=1.7*zm; { const P=W(cu,cv,0), S=W(cu+cr,cv,0).distanceTo(P), mk=(r,h0,h1,c,op)=>{ const me=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h1-h0,28),op?new THREE.MeshLambertMaterial({color:c,transparent:true,opacity:op,depthWrite:false}):new THREE.MeshLambertMaterial({color:c})); me.position.set(P.x,(h0+h1)/2,P.z); G.add(me); return me; };
      mk(S*1.05,0,Y(.5*zm),WOOD); mk(S*.98,Y(.5*zm),Y(.56*zm),SAND); const w=mk(S,Y(.56*zm),Y(ch),0x4aa8d0,.35); w.renderOrder=2; mk(S*1.04,Y(ch),Y(ch+.06*zm),0x202224);
      at.sb(cu-cr,cv-cr,cu+cr,cv+cr,ch); ['clownfish','koi','bluetang','puffer','seaturtle','yellowtang','octopus','jellyfish','lionfish','goldfish'].forEach((k,i)=>FISH.push({k,c:new THREE.Vector3(P.x,Y((.7+i%4*.25)*zm),P.z),ring:S*.6,h:Y(.25*zm),ph:i*.63,s:.15+i%3*.06,o:null})); }
    // the crabs' tank on a low table beside the round tank: they walk with you, so they are adopted like any pet (the adoption book on the crabs)
    { const tu=cu+2.6*m, tv=cv, tw=1.8*m, td=.7*m, z0=.75*zm, z1=z0+.5*zm; box(OP,tu-tw/2,tu+tw/2,tv-td/2,tv+td/2,0,z0,WOOD); box(OP,tu-tw/2+.03*m,tu+tw/2-.03*m,tv-td/2+.03*m,tv+td/2-.03*m,z0,z0+.06*zm,SAND);
      box(GL,tu-tw/2,tu+tw/2,tv-td/2,tv+td/2,z1,z1+.01*zm,0xe8f8ff); at.sb(tu-tw/2,tv-td/2,tu+tw/2,tv+td/2,z1);
      if(PETS.show)PETS.idx().then(I=>{ const C=I.kinds.filter(k=>k.shop===ID); C.forEach((K,i)=>{ const c=W(tu-tw/2+(i+.5)*tw/C.length,tv,z0+.06*zm);
        PETS.show(K.key,{w:tw/m/C.length*.84,h:.45,d:td/m*.84},{shop:ID}).then(B=>{ if(!B||!G)return; B.fitH=.45; B.base=c.clone(); B.along=W(1,0,0).sub(W(0,0,0)).normalize(); B.slide=B.g; B.g.position.copy(c); B.g.rotation.y=i*1.3; G.add(B.g); if(PETS.liveAdd)PETS.liveAdd(B); }).catch(()=>{});
        const hb=new THREE.Mesh(new THREE.BoxGeometry(.5*WU,.4*WU,.5*WU),new THREE.MeshBasicMaterial({visible:false})); hb.position.copy(c); G.add(hb);
        UI.thing({name:'A '+K.name+' (ADOPT)',obj:hb,reach:1.8*TILE,near:3*TILE,tall:.4*WU,act:()=>{ PETS.shop(ID); PETS.idx().then(()=>setTimeout(()=>PETS.choose(K.key),0)); }}); }); }).catch(e=>console.warn('AQUA CRABS',e)); }
    const mesh=(T,mat)=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(T.p,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(T.c,3)); g.computeVertexNormals(); const me=new THREE.Mesh(g,mat); G.add(me); return me; };
    mesh(OP,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide})).receiveShadow=true;   // (two-sided: the lot's frame may be a mirror's)
    mesh(WA,new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.5,depthWrite:false,emissive:0x1a4a60,side:THREE.DoubleSide})).renderOrder=2;
    mesh(GL,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide})).renderOrder=3;
    // the fish, once their models come: each sized to its tank, a pet's size at most
    FISHES.load().then(()=>{ for(const f of FISH){ const o=FISHES.model(f.k); if(!o)continue; const L0=FISHES.len(f.k,1), want=Math.min(L0,f.ring?.35*WU:Math.min(f.room*.55,.6*WU),f.h*1.6); o.scale.multiplyScalar(want/L0); o.position.copy(f.c); G.add(o); f.o=o; } }).catch(()=>{});
    return true; };
  let tries=0; SYS.every(()=>{ if(G||tries>600)return; tries++; build(); },1000,'aquarium');
  // the fish swim only while you are near enough to see them
  let t=0; SYS.add('life',dt=>{ if(!G)return; const c=FISH[0]&&FISH[0].c; const near=!!c&&Math.hypot(pos.x-c.x,pos.z-c.z)<40*TILE; G.visible=near; if(!near||!dt)return; t+=dt;
    for(const f of FISH){ const o=f.o; if(!o)continue; if(f.ring){ const a=t*f.s+f.ph; o.position.set(f.c.x+Math.cos(a)*f.ring,f.c.y+Math.sin(t*.5+f.ph)*.05*WU,f.c.z+Math.sin(a)*f.ring); o.rotation.y=-a; continue; }
      const sw=Math.sin(t*f.s+f.ph), d=Math.cos(t*f.s+f.ph), r=Math.max(0,f.room*.5-.3*WU); o.position.set(f.c.x+f.along.x*sw*r,f.c.y+Math.sin(t*.7+f.ph)*f.h*.15,f.c.z+f.along.z*sw*r); o.rotation.y=Math.atan2(-f.along.z,f.along.x)+(d<0?Math.PI:0); } },'146zjb-aquarium');
}
