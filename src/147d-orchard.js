// THE PARK ORCHARD (owner, 10 Nov 2026): data/world.json's site 'orchard' by the farm, a low walled garden of eight plots, one a player (claimed at its post; kept on the server, /orchard, so everyone sees everyone's trees); you plant saplings or pips in your plot's four spots and tend them by FTREES' rules (144j).
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, MOTION, PARK, pos, ROOMS, SFX, UI, VIT, WEEDS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {SECTION, SOL, SYS, TILE, WPP} from './006-map-pre.js';
import {FTREES} from './144j-fruittrees.js';
import {BEES} from './147a-bees.js';
const ORCHARD={}; window.ORCHARD=ORCHARD;
{ const T=TILE, WU=T/.84, say=(t,c)=>SAY(t,c||'#e8e2cc'), ST=(WPP.sites||[]).find(q=>q.id==='orchard'), C=FTREES.CAT, NP=8, DAY=864e5;
  const out=()=>SHARED.LVL==='up'&&!(ROOMS&&ROOMS.cur), gy=(x,z)=>typeof SHARED.groundY==='function'?SHARED.groundY(x,z):0, has=id=>FORAGE.has(id);
  const server=()=>!!OWNED.server&&/^https?:$/.test(location.protocol), sec=()=>String(SECTION.id||'A').toUpperCase();
  // the plots: [{plot, who, name, d:{v, trees:[tree or null x4]}, at}]; mine is the one whose who is me (off the website: kept in this browser)
  const PL=[]; let ME=null, MYI=-1, loaded=false, busy=false;
  const blank=i=>({plot:i,who:null,name:null,d:{v:1,trees:[null,null,null,null]},at:0}); for(let i=0;i<NP;i++)PL.push(blank(i));
  const norm=d=>{ const t=d&&Array.isArray(d.trees)?d.trees.slice(0,4):[]; while(t.length<4)t.push(null); return {v:1,trees:t.map(s=>s&&C[s.k]?s:null)}; };
  const ask=b=>fetch('/orchard',{method:'POST',headers:{'content-type':'application/json'},credentials:'same-origin',body:JSON.stringify({sec:sec(),...b})}).then(r=>r.ok?r.json():null).catch(()=>null);
  const load=async()=>{ if(busy)return; busy=true; try{
    if(server()){ const j=await ask({}); if(j&&Array.isArray(j.plots)){ ME=j.me; const mine=PL[MYI]; for(let i=0;i<NP;i++){ const r=j.plots.find(q=>q.plot===i); PL[i]=r?{plot:i,who:r.who,name:r.name,d:norm(r.d),at:r.at}:blank(i); }
        MYI=PL.findIndex(p=>p.who===ME); if(MYI>=0&&mine&&mine.who===ME&&dirty)PL[MYI].d=mine.d; loaded=true; } }
    else { let o=null; try{ o=JSON.parse(OWNED.get('orchard')||'null'); }catch(e){} ME='me'; if(o&&o.plot>=0&&o.plot<NP){ MYI=o.plot; PL[MYI]={plot:MYI,who:'me',name:null,d:norm(o.d),at:Date.now()}; } loaded=true; }
  }finally{ busy=false; } redraw(); };
  let dirty=false, saveT=0; const save=()=>{ dirty=true; clearTimeout(saveT); saveT=setTimeout(async()=>{ if(MYI<0)return; const d=PL[MYI].d;
    if(server()){ const j=await ask({put:d}); if(j&&j.ok)dirty=false; } else { try{ OWNED.set('orchard',JSON.stringify({plot:MYI,d})); }catch(e){} dirty=false; } },1200); };
  ORCHARD.claim=async i=>{ '@later'; if(MYI>=0)return say(MYI===i?'THIS IS YOUR PLOT.':'YOU ALREADY KEEP PLOT '+(MYI+1)+'. ONE PLOT A PLAYER.','#c8a090');
    if(server()){ const j=await ask({claim:i}); if(!j||j.plot==null)return say((j&&j.why||'THE ORCHARD IS SHUT').toUpperCase()+'.','#c8a090'); await load(); if(MYI<0)return; }
    else { MYI=i; PL[i]={plot:i,who:'me',name:null,d:norm(null),at:Date.now()}; save(); }
    if(SFX.play)SFX.play('latch',{vol:.4}); say('PLOT '+(MYI+1)+' IS YOURS. PLANT A SAPLING IN ONE OF ITS FOUR SPOTS (THE TOMATO SELLS THEM).','#9fe07f'); redraw(); };
  ORCHARD.leave=async()=>{ '@later'; if(MYI<0)return; if(server())await ask({leave:1}); else { try{ OWNED.del('orchard'); }catch(e){} } PL[MYI]=blank(MYI); MYI=-1; say('YOU GIVE UP YOUR PLOT. ITS TREES ARE LEFT FOR THE NEXT KEEPER TO CLEAR.','#c8a090'); redraw(); };

  /* ---------- the site: map tiles to the world; plots in two rows of four either side of a path; four spots a plot ---------- */
  const G=new THREE.Group(); G.visible=false; let built=false, X0, X1, Z0, Z1, CX, CZ; const things=[], trees=new Map(), sols=[];
  const geo=()=>{ const X=SHARED.BOD.XS, Z=SHARED.BOD.ZS; X0=X(ST.x-ST.w/2); X1=X(ST.x+ST.w/2); Z0=Z(ST.y-ST.d/2); Z1=Z(ST.y+ST.d/2); if(X0>X1)[X0,X1]=[X1,X0]; if(Z0>Z1)[Z0,Z1]=[Z1,Z0]; CX=(X0+X1)/2; CZ=(Z0+Z1)/2; };
  const PATH=1.6*T, PW=()=>(X1-X0)/4, PD=()=>(Z1-Z0)/2-PATH;
  const plotC=i=>{ const c=i%4, r=i<4?-1:1; return [X0+(c+.5)*PW(),CZ+r*(PATH+PD()/2)]; };
  const spot=(i,j)=>{ const [x,z]=plotC(i); return [x+(j%2?1:-1)*PW()*.24,z+(j<2?-1:1)*PD()*.24]; };
  ORCHARD.spot=spot; ORCHARD.plotC=plotC;
  const build=()=>{ '@later'; built=true; geo(); scene.add(G); const y=gy(CX,CZ), parts=[], box=(x,yy,z,w,h,d,c)=>{ const g=new THREE.BoxGeometry(w,h,d); g.translate(x-CX,yy-y,z-CZ); parts.push([g,c]); };
    G.position.set(CX,y,CZ); const H=.9*WU, th=.18*T, stone=0x8a8070, cap=0x6e665a, wood=0x7a5a3a;
    // a low stone wall round it, open at both ends of the path
    const gap=PATH*1.1; for(const [a,b,zz] of [[X0,X1,Z0],[X0,X1,Z1]]){ box((a+b)/2,y+H/2,zz,b-a,H,th,stone); box((a+b)/2,y+H+.04*WU,zz,b-a+.05*T,.08*WU,th*1.3,cap); }
    for(const xx of [X0,X1])for(const [a,b] of [[Z0,CZ-gap],[CZ+gap,Z1]]){ box(xx,y+H/2,(a+b)/2,th,H,b-a,stone); box(xx,y+H+.04*WU,(a+b)/2,th*1.3,.08*WU,b-a,cap); SOL.up.push([xx-th,Math.min(a,b),xx+th,Math.max(a,b)]); }
    SOL.up.push([X0,Z0-th,X1,Z0+th],[X0,Z1-th,X1,Z1+th]);
    // the path, the plots' board edges and dark soil, each plot's post
    box(CX,y+.01*WU,CZ,X1-X0,.02*WU,PATH*2-.1*T,0xb8a888); if(WEEDS.clear)WEEDS.clear([X0,CZ-PATH,X1,CZ+PATH]);
    for(let i=0;i<NP;i++){ const [x,z]=plotC(i), w=PW()-.5*T, d=PD()-.4*T; box(x,y+.015*WU,z,w,.03*WU,d,0x4a3826); if(WEEDS.clear)WEEDS.clear([x-w/2,z-d/2,x+w/2,z+d/2]);
      for(const [ex,ez,ew,ed] of [[x,z-d/2,w,.06*T],[x,z+d/2,w,.06*T],[x-w/2,z,.06*T,d],[x+w/2,z,.06*T,d]])box(ex,y+.07*WU,ez,ew,.14*WU,ed,wood);
      const px=x-w/2+.3*T, pz=i<4?z+d/2+.2*T:z-d/2-.2*T; box(px,y+.55*WU,pz,.08*WU,1.1*WU,.08*WU,wood); box(px,y+1.05*WU,pz,.5*WU,.3*WU,.04*WU,0xe0d4b0); }
    // the pump at the middle of the path, and the noticeboard at the west end
    box(CX,y+.5*WU,CZ+PATH*.7,.16*WU,1*WU,.16*WU,0x3a5a4a); box(CX+.12*WU,y+.85*WU,CZ+PATH*.7,.3*WU,.06*WU,.06*WU,0x3a5a4a); box(CX,y+.12*WU,CZ+PATH*.7+.25*WU,.4*WU,.24*WU,.3*WU,0x6a6a72);
    box(X0+.8*T,y+.7*WU,CZ-PATH*.8,.06*WU,1.4*WU,.06*WU,wood); box(X0+.8*T,y+1.2*WU,CZ-PATH*.8,.9*WU,.6*WU,.05*WU,0x5a3a26);
    const me=new THREE.Mesh(FTREES.merge(parts),FTREES.MAT); me.receiveShadow=true; me.castShadow=true; me.raycast=()=>{}; G.add(me);
    const HIT=new THREE.MeshBasicMaterial({visible:false}), hit=(x,z,w,h)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),HIT); m.position.set(x-CX,gy(x,z)-y+h/2,z-CZ); G.add(m); return m; };
    UI.thing({name:'THE ORCHARD: THE NOTICE',obj:hit(X0+.8*T,CZ-PATH*.8,.8*T,1.6*T),reach:1.6*T,near:2.4*T,tall:1.2*T,act:()=>say('THE ORCHARD. EIGHT PLOTS, ONE A PLAYER: CLAIM ONE AT ITS POST. SAPLINGS FROM THE TOMATO. A TREE AGES A YEAR EACH DAY AND FRUITS IN ITS REAL MONTHS. TOO TENDER FOR A NEW YORK WINTER? GROW IT IN A BIG POT AT HOME.','#f2e6b0')});
    UI.thing({name:"THE ORCHARD'S PUMP (WATER IS FREE HERE)",obj:hit(CX,CZ+PATH*.7,.7*T,1.2*T),reach:1.4*T,near:2.2*T,tall:1*T,act:()=>{ if(SFX.play)SFX.play('splash',{vol:.3}); say('COLD WATER GUSHES OUT. USE IT ON YOUR TREES: CLICK ONE AND WATER IT.','#9fd8ff'); }});
    for(let i=0;i<NP;i++){ const [x,z]=plotC(i), w=PW()-.5*T, d=PD()-.4*T, px=x-w/2+.3*T, pz=i<4?z+d/2+.2*T:z-d/2-.2*T, th={name:'',obj:hit(px,pz,.7*T,1.4*T),reach:1.4*T,near:2.2*T,tall:1.2*T,act:()=>post(i)}; th.plot=i; UI.thing(th); things.push(th);
      for(let j=0;j<4;j++){ const [sx,sz]=spot(i,j), s={name:'',obj:hit(sx,sz,1.1*T,1.2*T),reach:1.3*T,near:2*T,tall:1*T,act:()=>tap(i,j)}; s.plot=i; s.slot=j; UI.thing(s); things.push(s); } }
    load(); };
  const post=i=>{ '@later'; const P=PL[i]; if(i===MYI)return say('YOUR PLOT, NUMBER '+(i+1)+'. '+(PL[i].d.trees.some(Boolean)?'TEND YOUR TREES.':'PLANT A SAPLING IN ONE OF ITS FOUR SPOTS.'),'#9fe07f');
    if(P.who&&!(P.at&&Date.now()-P.at>60*DAY))return say('PLOT '+(i+1)+': '+(P.name||'A TENANT')+"'S.",'#e8e2cc'); ORCHARD.claim(i); };

  /* ---------- the trees: what each knows of its neighbours (the same kind's pollen, a male, a black walnut in its plot, a taller tree beside it, bees) ---------- */
  const all=()=>PL.flatMap(p=>p.d.trees.filter(Boolean));
  const bees=()=>PL.some(p=>p.d.trees.some(s=>s&&s.k==='linden'))||!!(BEES&&BEES.S&&(BEES.S.hives||[]).some(h=>Math.hypot(h.x-CX,h.z-CZ)<40*T));
  const ctx=(i,j)=>{ const P=PL[i].d.trees, s=P[j], v=FTREES.view, wal=P.some((q,k)=>k!==j&&q&&q.k==='blackwalnut'&&v(q,{}).mature);
    const h=FTREES.height(s.k,v(s,{})), nb=[j^1,j^2].map(k=>P[k]).filter(Boolean), sh=nb.some(q=>v(q,{}).mature&&FTREES.height(q.k,v(q,{}))>h*1.35);
    return FTREES.ctx(s,all(),{bees:bees(),walnut:wal,shade:sh}); };
  const viewOf=(i,j)=>FTREES.view(PL[i].d.trees[j],ctx(i,j));
  const showTree=(i,j)=>{ const key=i+':'+j, s=PL[i].d.trees[j]; let T3=trees.get(key);
    if(!s){ if(T3){ G.remove(T3.g); trees.delete(key); } return null; }
    if(!T3||T3.id!==s.id){ if(T3)G.remove(T3.g); const g=FTREES.make(); g.scale.setScalar(WU); const [x,z]=spot(i,j); g.position.set(x-CX,gy(x,z)-G.position.y,z-CZ); g.rotation.y=FTREES.hs(s.id,'r')*6.283; G.add(g); T3={g,id:s.id,key:''}; trees.set(key,T3); }
    const V=viewOf(i,j), k=[V.stage,V.avail,V.wind,V.bare,V.bloom,V.autumn,V.dead,V.blk&&V.crop,s.nt,s.wr,Math.round(V.f*20)].join(); if(k!==T3.key){ T3.key=k; T3.g.userData.set(V,s,{}); }
    return V; };
  const redraw=()=>{ if(!built)return; for(const s of sols.splice(0)){ const n=SOL.up.indexOf(s); if(n>=0)SOL.up.splice(n,1); }
    for(const th of things){ const i=th.plot, P=PL[i], mine=i===MYI, who=mine?'YOUR':P.who?(P.name||'A TENANT')+"'S":'';
      if(th.slot==null){ th.name=mine?'YOUR PLOT ('+(i+1)+')':P.who&&!(P.at&&Date.now()-P.at>60*DAY)?'PLOT '+(i+1)+': '+(P.name||'A TENANT')+"'S":'PLOT '+(i+1)+': FREE (CLAIM IT)'; continue; }
      const s=P.d.trees[th.slot], V=showTree(i,th.slot); th.obj.visible=!!s||mine; th.acts=[];
      if(!s){ th.name=mine?'AN EMPTY SPOT IN YOUR PLOT: PLANT HERE':''; if(mine)th.acts=plantable().slice(1).map(id=>({name:'PLANT '+FORAGE.NM[id],act:()=>plant(i,th.slot,id)})); continue; }
      th.name=FTREES.label(s,V,who); if(V.mature&&!V.dead&&FTREES.height(s.k,V)>1.6){ const [x,z]=spot(i,th.slot), r=.18*T, b=[x-r,z-r,x+r,z+r]; SOL.up.push(b); sols.push(b); }
      if(mine)th.acts=acts(i,th.slot,V).slice(1); } };
  ORCHARD.redraw=redraw;
  const plantable=()=>FTREES.ids.flatMap(k=>[C[k].sapling,C[k].pipItem]).filter(id=>id&&FORAGE.NM[id]&&has(id)>0);
  const plant=(i,j,id)=>{ '@later'; if(i!==MYI||PL[i].d.trees[j])return; const k=FTREES.ids.find(q=>C[q].sapling===id||C[q].pipItem===id), K=C[k]; if(!k||!has(id))return;
    FORAGE.take(id,1); MOTION.play('plant'); const s=FTREES.plant(k,{pip:id===K.pipItem}); PL[i].d.trees[j]=s; FORAGE.draw(); save(); redraw();
    say(id===K.pipItem?'YOU PLANT THE '+FORAGE.NM[id]+'. A PIP GROWS A NEW, RANDOM TREE: IT MAY FRUIT WELL OR BADLY, AND SLOWLY.':'YOU PLANT THE '+K.name+' SAPLING AND WATER IT IN. IT AGES A YEAR EACH DAY: FIRST CROP IN ABOUT '+Math.ceil(K.y-s.g)+' DAYS.','#9fe07f');
    if(K.z>=8)say('A WARNING: '+K.name+' IS TOO TENDER FOR A NEW YORK WINTER OUTSIDE. THE FIRST FROST WILL KILL IT. A BIG POT AT HOME KEEPS IT ALIVE.','#e0a080');
    if(K.p==='two')say('IT NEEDS A SECOND '+(K.pg==='apple'?'APPLE OR CRABAPPLE':K.pg.toUpperCase())+' IN THE ORCHARD TO SET FRUIT.','#c8c2b0'); if(K.p==='mf')say('THIS ONE IS '+(s.sx==='m'?'A MALE: IT WILL NEVER FRUIT, BUT ITS POLLEN LETS THE FEMALES.':'A FEMALE: IT NEEDS A MALE '+K.name+' IN THE ORCHARD.'),'#c8c2b0'); };
  // what you can do to your tree, most pressing first
  const acts=(i,j,V)=>{ const s=PL[i].d.trees[j], K=C[s.k], L=[], go=f=>()=>{ f(); FORAGE.draw(); save(); redraw(); };
    if(V.dead)L.push({name:'CLEAR AWAY THE DEAD TREE',act:go(()=>{ PL[i].d.trees[j]=null; MOTION.play('harvest'); say('YOU DIG OUT THE DEAD TREE. THE SPOT IS FREE.'); })});
    if(V.avail>0)L.push({name:(K.sap?'TAP IT: ':'PICK: ')+V.avail+' '+K.pn,act:go(()=>pick(s,V))});
    if(V.wind>0)L.push({name:'CLEAR THE '+V.wind+' WINDFALLS',act:go(()=>{ s.wc=V.pb.key; MOTION.play('harvest'); say('YOU RAKE UP THE ROTTEN WINDFALLS. THE WASPS DRIFT OFF.'); })});
    if(!V.dead&&(!V.mature||V.dry))L.push({name:'WATER IT',act:go(()=>{ FTREES.tick(s,ctx(i,j)); s.wet=FTREES.now()+3*DAY; MOTION.play('water'); if(SFX.play)SFX.play('splash',{vol:.3}); say(V.mature?'IT IS ESTABLISHED; RAIN WATERS IT NOW, BUT IT DRINKS IT IN.':'YOU WATER IT FROM THE PUMP. WET FOR THREE DAYS.','#9fd8ff'); })});
    if(!V.dead&&FTREES.canPrune(s,V))L.push({name:'PRUNE IT (A BIGGER CROP NEXT YEAR)',act:go(()=>{ s.pr=FTREES.now(); MOTION.play('harvest'); say('YOU PRUNE OUT THE CROSSING AND DEAD WOOD WHILE IT IS BARE.','#9fe07f'); })});
    const tf=!V.dead&&FTREES.thinFor(s,V); if(tf)L.push({name:'THIN THE YOUNG FRUIT',act:go(()=>{ s.th=tf; MOTION.play('harvest'); say('YOU THIN THE FRUIT TO ONE A HAND-WIDTH. THE BRANCHES WILL HOLD.','#9fe07f'); })});
    if(!V.dead&&V.mature&&!K.sap)L.push(s.nt?{name:'TAKE OFF THE BIRD NET',act:go(()=>{ s.nt=0; FORAGE.give('birdnet',1); say('YOU TAKE THE NET OFF.'); })}:{name:'PUT ON A BIRD NET',act:go(()=>{ if(!has('birdnet'))return say('YOU NEED A BIRD NET (THE TOMATO SELLS THEM).','#c8a090'); FORAGE.take('birdnet',1); s.nt=1; say('YOU THROW A NET OVER IT. BIRDS AND SQUIRRELS WILL HAVE TO LOOK ELSEWHERE.','#9fe07f'); })});
    if(!V.dead&&K.wrap)L.push(s.wr?{name:'UNWRAP IT',act:go(()=>{ FTREES.tick(s,ctx(i,j)); s.wr=0; FORAGE.give('burlap',1); say('YOU UNWRAP IT. KEEP IT WRAPPED THROUGH DECEMBER TO FEBRUARY.'); })}:{name:'WRAP IT IN BURLAP FOR WINTER',act:go(()=>{ if(!has('burlap'))return say('YOU NEED BURLAP (THE TOMATO SELLS IT).','#c8a090'); FTREES.tick(s,ctx(i,j)); FORAGE.take('burlap',1); s.wr=1; say('YOU WRAP IT IN BURLAP AND CAP IT WITH A BUCKET, AS BROOKLYN\'S OLD GARDENERS DO.','#9fe07f'); })});
    L.push({name:'ABOUT IT',act:()=>say(FTREES.label(s,V,'YOUR')+'. '+(V.why.join(' ')||(V.blk?'IN SEASON.':'IT FRUITS IN '+K.m.map(m=>['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][m-1]).join(' ')+'.')),'#e8e2cc')});
    L.push({name:'DIG IT UP',act:()=>{ if(s.dig&&Date.now()-s.dig<6000){ PL[i].d.trees[j]=null; save(); redraw(); return say('YOU DIG IT UP. THE SPOT IS EMPTY.'); } s.dig=Date.now(); say('CLICK DIG IT UP AGAIN TO DIG UP THE TREE FOR GOOD.','#e0a080'); }});
    return L; };
  const pick=(s,V)=>{ const K=C[s.k]; if(K.sap&&!has('spile'))return say('YOU NEED A SPILE AND BUCKET TO TAP IT (THE TOMATO SELLS THEM).','#c8a090');
    if(V.wasps&&Math.random()<.35){ if(VIT.hurt)VIT.hurt(.03); say('A WASP FROM THE WINDFALLS STINGS YOU!','#e0a080'); }
    const n=V.avail; FTREES.pick(s,V,n); FORAGE.give(K.item,n); MOTION.play('harvest'); const pip=K.pip&&Math.random()<.25; if(pip)FORAGE.give(K.pipItem,1);
    say('YOU '+(K.sap?'DRAW ':'PICK ')+n+' '+K.pn+(pip?', AND KEEP ONE '+(K.nut?'TO PLANT':'PIP'):'')+'.','#b8f0a0'); };
  const tap=(i,j)=>{ '@later'; const s=PL[i].d.trees[j];
    if(i!==MYI){ if(!s)return; const V=viewOf(i,j); return say(FTREES.label(s,V,(PL[i].name||'A TENANT')+"'S")+'. '+(V.why[0]||''),'#e8e2cc'); }
    if(!s){ const L=plantable(); if(!L.length)return say('PLANT A SAPLING OR A PIP HERE. THE TOMATO SELLS SAPLINGS.','#c8a090'); return plant(i,j,L[0]); }
    const L=acts(i,j,viewOf(i,j)); if(L.length)L[0].act(); };

  /* ---------- built when you come near, hidden when far; the plots re-read every minute while you are near, your own trees written down as they grow ---------- */
  let can=false, rd=0, vt=0; SYS.onStart(()=>LOAD('later').then(()=>{ can=true; }),'147d-orchard');
  SYS.add('places',dt=>{ if(!ST||!can)return; if(!built){ if(PARK.ready&&WEEDS.inPark&&WEEDS.inPark(pos.x,pos.z,-40)){ geo(); if(Math.hypot(pos.x-CX,pos.z-CZ)<150*T)build(); } return; }
    const d=Math.hypot(pos.x-CX,pos.z-CZ); G.visible=d<140*T&&out(); if(!G.visible)return;
    rd-=dt||0; vt-=dt||0; if(rd<=0&&d<80*T){ rd=60; load(); }
    if(vt<=0){ vt=4; if(MYI>=0)for(let j=0;j<4;j++){ const s=PL[MYI].d.trees[j]; if(s&&!s.dead){ const V=FTREES.tick(s,ctx(MYI,j)); if(V.dead||Math.floor(s.g)!==Math.floor(s.lastG||0)){ s.lastG=s.g; save(); } } } redraw(); } },'147d-orchard');
  window.ORCHDBG=()=>({site:!!ST,built,loaded,me:MYI,center:built?[CX/T|0,CZ/T|0]:null,plots:PL.map(p=>({who:p.who,trees:p.d.trees.map(s=>s?s.k:null)})),shown:trees.size,sols:sols.length,month:FTREES.month()});
  ORCHARD.T=T; ORCHARD.PL=PL; ORCHARD.load=load; ORCHARD.mine=()=>MYI; ORCHARD.tap=(i,j)=>tap(i,j); ORCHARD.acts=(i,j)=>acts(i,j,viewOf(i,j)); ORCHARD.view=viewOf;
}
