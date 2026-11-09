// THE ROOFTOPS' SET PIECES (up your fire escape): the ruined greenhouse you restore into a bed for rare flowers (pigeons come for the seedlings), the night run over the next roofs to a mat where a rival master spars you for belts and scrolls, and the water tower you climb (worse in wind and rain) to the view, a hawk's nest and your flag.
import {SHARED, THREE} from './003-shx.js';
import {CITY, CLOCK, FORAGE, INV, keys, MAIL, ONLINE, pos, ROOMS, SFX, st, UI, VIS, VIT, WX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {MODS, STORE, SYS, TILE, ZU} from './006-map-pre.js';
import {RIGNPC} from './083-npc-rig.js';
import {GARDEN} from './144a-garden.js';
import {FOLK} from './146ha-folk.js';
const ROOFQ={built:false}; window.ROOFQ=ROOFQ;
{ const T=TILE, say=(t,c)=>SAY(t,c||'#e8e2cc'), KEY='rooftops', hs=(a,b)=>{ let h=(Math.imul(a|0,374761393)+Math.imul(b|0,668265263))|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; };
  const S={v:1,gh:0,owl:0,belt:0,wins:0,flag:null}; try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1)Object.assign(S,D); }catch(e){}
  const save=()=>OWNED.set(KEY,JSON.stringify(S)); ROOFQ.S=S;
  const day=()=>window.MAIL&&MAIL.ready?MAIL.day():CITY?CITY.day||0:0, mark=k=>{ INV.picked[k]=day(); if(INV.save)INV.save(); };
  const night=()=>{ const h=CLOCK.h??12; return h>=20||h<6; }, sk=k=>FORAGE.sk?FORAGE.sk(k):10;
  const BELT=['WHITE','YELLOW','ORANGE','GREEN','BLUE','BROWN','BLACK'];
  FORAGE.add({names:{rf_scroll:"A NIGHT MASTER'S SCROLL"},prices:{rf_scroll:40}});
  FORAGE.HELP.push('THE ROOFTOPS: up your fire escape, a ruined greenhouse to restore, the night run over the roofs to a master who spars you, and the water tower to climb.');
  let R=null, G=null, MH=0, MV=0; const things=[];
  const L=c=>new THREE.MeshLambertMaterial({color:c}), HIT=new THREE.MeshBasicMaterial({visible:false});
  const add=(geo,m,x,y,z,p=G)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); o.castShadow=o.receiveShadow=true; p.add(o); return o; };
  const bx=(x0,x1,y0,y1,z0,z1,m,p)=>add(new THREE.BoxGeometry(Math.max(.002,Math.abs(x1-x0)),Math.max(.002,y1-y0),Math.max(.002,Math.abs(z1-z0))),m,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,p);
  const thing=(o,x,y,z,w,h)=>{ const hb=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),HIT); hb.position.set(x,y+h/2,z); G.add(hb); const th={reach:1.3*T,near:2.4*T,tall:h,...o,obj:hb}; UI.thing(th); things.push(th); return th; };

  // ---------- the greenhouse: an old glasshouse gone to ruin; cleared, reglazed and its beds mended it is a bed of GARDEN's (half a day to bloom under glass) with a seed tray that gives a rare seed a day
  const GH={}, PG={on:false,t:60,stay:0,birds:[],fly:0}, RARE=['lavender','iris','foxglove','violet','violet','slipper'];
  const ghStep=[['CLEAR THE BROKEN GLASS',0],['REGLAZE IT',60],['MEND ITS BEDS',25]];
  const ghBuild=()=>{ const {U,V,top}=R, x0=Math.min(U(13.2),U(17.2)), x1=Math.max(U(13.2),U(17.2)), z0=Math.min(V(4.2),V(8)), z1=Math.max(V(4.2),V(8)), wh=2.3*MV, rh=3.1*MV, g=GH.g=new THREE.Group(); G.add(g);
    Object.assign(GH,{x0,x1,z0,z1,y:top}); const W=L(0xdfe6e2), RS=L(0x8a7a66), cx=(x0+x1)/2, d=.05*MH;
    for(const x of [x0,x1])for(const z of [z0,z1])bx(x-d,x+d,top,top+wh,z-d,z+d,W,g);
    for(let k=1;k<4;k++){ const x=x0+(x1-x0)*k/4; for(const z of [z0,z1])bx(x-d*.6,x+d*.6,top,top+wh,z-d*.6,z+d*.6,W,g); }
    for(const z of [z0,z1])bx(x0,x1,top+wh-d,top+wh+d,z-d,z+d,W,g); for(const x of [x0,x1])bx(x-d,x+d,top+wh-d,top+wh+d,z0,z1,W,g); bx(x0,x1,top+rh-d,top+rh+d,(z0+z1)/2-d,(z0+z1)/2+d,W,g);
    const GL=new THREE.MeshLambertMaterial({color:0xbfe3e8,transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide}); GH.panes=[];
    const pane=(geo,x,y,z,rx,rz,k)=>{ const m=add(geo,GL,x,y,z,g); m.rotation.set(rx,0,rz); m.castShadow=false; m.userData.broke=hs(k,7)<.62; GH.panes.push(m); };
    const pw=(x1-x0)/4, sl=Math.hypot((z1-z0)/2,rh-wh), ang=Math.atan2(rh-wh,(z1-z0)/2);
    for(let k=0;k<4;k++){ const x=x0+pw*(k+.5); pane(new THREE.PlaneGeometry(pw*.96,wh*.96),x,top+wh/2,z0,0,0,k); pane(new THREE.PlaneGeometry(pw*.96,wh*.96),x,top+wh/2,z1,0,0,k+9);
      for(const s of [-1,1]){ const m=add(new THREE.PlaneGeometry(pw*.96,sl),GL,x,top+(wh+rh)/2,(z0+z1)/2+s*(z1-z0)/4,g); m.rotation.x=-s*(Math.PI/2-ang); m.castShadow=false; m.userData.broke=hs(k*3+s,11)<.62; GH.panes.push(m); } }
    for(const x of [x0,x1]){ const m=add(new THREE.PlaneGeometry(z1-z0,wh*.96),GL,x,top+wh/2,(z0+z1)/2,g); m.rotation.y=Math.PI/2; m.castShadow=false; m.userData.broke=x===x0; GH.panes.push(m); }
    GH.rub=new THREE.Group(); g.add(GH.rub); for(let i=0;i<26;i++){ const s=add(new THREE.BoxGeometry((.1+.2*hs(i,1))*MH,.01*MV,(.08+.15*hs(i,2))*MH),GL,x0+(x1-x0)*hs(i,3),top+.02*MV,z0+(z1-z0)*hs(i,4),GH.rub); s.rotation.y=hs(i,5)*6; }
    for(let i=0;i<5;i++)bx(0,.35*MH,0,.3*MV,0,.25*MH,RS,GH.rub).position.set(x0+(x1-x0)*(.15+.7*hs(i,8)),top+.15*MV,z0+(z1-z0)*(.2+.6*hs(i,9)));   // fallen pots and frames
    const SO=L(0x4a3424), WD=L(0x7a5a3a); GH.beds=[[x0+.15*MH,x1-.15*MH,z0+.12*MH,z0+.12*MH+.9*MH],[x0+.15*MH,x1-.15*MH,z1-.12*MH-.9*MH,z1-.12*MH]]; GH.bedY=top+.14*MV; GH.bedM=[];
    for(const [a,b,c,e] of GH.beds){ GH.bedM.push(bx(a,b,top,top+.12*MV,c,e,SO,g),bx(a,b,top,top+.16*MV,c-.04*MH,c,WD,g),bx(a,b,top,top+.16*MV,e,e+.04*MH,WD,g)); }
    GH.tray=bx(cx-.4*MH,cx+.4*MH,top+.7*MV,top+.8*MV,z0+1.25*MH,z0+1.6*MH,L(0x6a4a2a),g); GH.trayLeaf=bx(cx-.35*MH,cx+.35*MH,top+.8*MV,top+.9*MV,z0+1.28*MH,z0+1.57*MH,L(0x5aa04a),g);
    GH.owl=new THREE.Group(); g.add(GH.owl); { const O=L(0x7a5a3a); add(new THREE.CylinderGeometry(.02*MH,.02*MH,1.2*MV,6),L(0x3a3a3c),0,.6*MV,0,GH.owl); const b=add(new THREE.SphereGeometry(.22*MH,10,8),O,0,1.45*MV,0,GH.owl); b.scale.y=1.4;
      for(const s of [-1,1]){ add(new THREE.SphereGeometry(.07*MH,8,6),L(0xf0d040),s*.08*MH,1.62*MV,.16*MH,GH.owl); add(new THREE.ConeGeometry(.05*MH,.14*MV,4),O,s*.11*MH,1.9*MV,0,GH.owl); } GH.owl.position.set(x1-.4*MH,top,(z0+z1)/2); }
    GARDEN.beds.push({id:'roofgh',grow:12,at:(x,z)=>S.gh>=3&&GH.beds.some(([a,b,c,e])=>x>a&&x<b&&z>c&&z<e)?GH.bedY:null});
    GH.th=thing({name:'A RUINED GREENHOUSE',act:()=>ghAct()},cx,top,(z0+z1)/2,1.4*MH,2*MV); GH.th.reach=2.2*T; GH.th.near=3.4*T;
    GH.trayTh=thing({name:'THE SEED TRAY',act:()=>trayAct()},cx,top+.5*MV,z0+1.4*MH,.8*MH,.6*MV);
    GH.owlTh=thing({name:'A HOOK FOR AN OWL DECOY ($12)',act:()=>owlAct()},x1-.4*MH,top,(z0+z1)/2,.6*MH,2*MV);
    const PGM=L(0x8a8e98), PGH=L(0x5a6a7a); for(let i=0;i<3;i++){ const b=new THREE.Group(); add(new THREE.SphereGeometry(.12*MH,8,6),PGM,0,.1*MV,0,b).scale.set(1,.8,1.5); add(new THREE.SphereGeometry(.07*MH,8,6),PGH,0,.2*MV,.13*MH,b); b.visible=false; g.add(b); PG.birds.push(b); }
    PG.th=thing({name:'PIGEONS AT YOUR SEEDLINGS',act:()=>shoo()},cx,top,(z0+z1)/2,1.2*MH,.8*MV); PG.th.obj.visible=false;
    ghShow(); };
  const ghShow=()=>{ for(const m of GH.panes)m.visible=S.gh>=2||!m.userData.broke; GH.rub.visible=S.gh<1; GH.tray.visible=GH.trayLeaf.visible=S.gh>=3; GH.trayTh.obj.visible=S.gh>=3; GH.owl.visible=!!S.owl; GH.owlTh.obj.visible=S.gh>=3;
    for(const m of GH.bedM)m.visible=S.gh>=3; GH.th.name=S.gh>=3?'THE ROOFTOP GREENHOUSE':'A RUINED GREENHOUSE: '+ghStep[S.gh][0]+(ghStep[S.gh][1]?' ($'+ghStep[S.gh][1]+')':''); GH.owlTh.name=S.owl?'THE OWL DECOY':'A HOOK FOR AN OWL DECOY ($12)'; };
  const ghAct=()=>{ '@later'; if(S.gh>=3)return say('YOUR GREENHOUSE. PLANT SEEDS IN ITS BEDS: UNDER GLASS THEY BLOOM IN HALF A DAY. THE TRAY GIVES A RARE SEED EACH DAY.','#9fe07f');
    const [nm,c]=ghStep[S.gh]; if(c){ if(INV.cash<c)return say('YOU NEED $'+c+' TO '+nm+'.','#c8a090'); INV.cash-=c; if(INV.save)INV.save(); }
    else { if(VIT.sta<.15)return say('YOU ARE TOO TIRED. CATCH YOUR BREATH.','#c8a090'); VIT.sta=Math.max(0,VIT.sta-.12); FORAGE.use('garden',-30,60); }
    S.gh++; save(); ghShow(); SFX.play('clunk',{vol:.5,pitch:1.2}); say(['YOU SWEEP THE BROKEN GLASS INTO A HEAP AND CARRY IT DOWN.','NEW PANES IN EVERY FRAME. THE GREENHOUSE SHINES.','YOU MEND THE BEDS AND FILL THEM WITH SOIL. THE GREENHOUSE IS YOURS TO PLANT.'][S.gh-1],S.gh>=3?'#9fe07f':'#e8e2cc'); };
  const trayAct=()=>{ '@later'; if(S.gh<3)return; if(!INV.ready('roofgh:tray'))return say('THE TRAY IS BARE. A NEW SEED SETS BY TOMORROW.','#c8a090');
    const k=RARE[Math.floor(Math.random()*RARE.length)]; mark('roofgh:tray'); FORAGE.give('sd_'+k,1); FORAGE.use('garden',0,80); say('A RARE SEED HAS SET IN THE TRAY: '+FORAGE.name('sd_'+k)+'.','#9fe07f'); FORAGE.draw(); };
  const owlAct=()=>{ '@later'; if(S.owl)return say('THE PLASTIC OWL GLARES. NO PIGEON WILL LAND WHILE IT WATCHES.'); if(INV.cash<12)return say('YOU NEED $12 FOR AN OWL DECOY.','#c8a090'); INV.cash-=12; if(INV.save)INV.save(); S.owl=1; save(); ghShow(); say('YOU HANG A PLASTIC OWL OVER THE BEDS.'); };
  const seedlings=()=>GARDEN.plots().filter(p=>p.bed==='roofgh'&&(GARDEN.now()-p.t)/12<.4);
  const land=()=>{ PG.on=true; PG.stay=30; PG.th.obj.visible=true; PG.birds.forEach((b,i)=>{ const [a,bb,c,e]=GH.beds[i%2]; b.position.set(a+(bb-a)*(.2+.3*i),GH.bedY,(c+e)/2); b.visible=true; }); say('PIGEONS DROP INTO THE GREENHOUSE AFTER YOUR SEEDLINGS! SHOO THEM.','#ffb070'); };
  const shoo=()=>{ '@later'; if(!PG.on)return; PG.on=false; PG.fly=1.5; PG.t=90+Math.random()*90; PG.th.obj.visible=false; FORAGE.use('bird',-20,60); SFX.play('chirp',{vol:.5,pitch:1.4}); say('YOU CLAP. THE PIGEONS CLATTER UP AND AWAY.'); };
  const pigeons=dt=>{ if(S.gh<3)return; if(PG.fly>0){ PG.fly-=dt; for(const b of PG.birds){ b.position.y+=dt*2*MV; b.position.x+=dt*MH; } if(PG.fly<=0)for(const b of PG.birds)b.visible=false; return; }
    if(!PG.on){ if((PG.t-=dt)>0)return; PG.t=60+Math.random()*90; if(!seedlings().length)return; if(S.owl){ say('PIGEONS CIRCLE THE GREENHOUSE, SEE THE OWL AND WHEEL AWAY.','#c8c2b0'); return; } land(); return; }
    const tt=performance.now()/300; PG.birds.forEach((b,i)=>{ b.rotation.x=Math.max(0,Math.sin(tt+i*2))*.5; });
    if((PG.stay-=dt)<=0){ const L0=seedlings(); PG.on=false; PG.th.obj.visible=false; PG.fly=1.5; PG.t=90+Math.random()*90; if(L0.length){ GARDEN.lose(L0[L0.length-1]); say('THE PIGEONS HAVE EATEN ONE OF YOUR SEEDLINGS. AN OWL DECOY WOULD KEEP THEM OFF.','#ff9a8a'); } } };

  // ---------- the water tower (ROOFS' tank on your roof): a ladder up its legs to a catwalk round the rim; the CLIMBING skill sets the pace, wet or windy rungs can slip you off (VIT.hurt, onto the roof)
  const TW={c:null,on:false,want:false,jp:false};
  const twBuild=()=>{ const {U,V,top}=R, tx=U(5), tz=V(2.4), r=1.5*MH, legH=3.2*MV, deck=top+legH+3.56*MV, lx=tx+r*1.05, IR=L(0x2c2e30); Object.assign(TW,{tx,tz,r,deck,lx,H:deck-top});
    for(const dz of [-.2*MH,.2*MH])bx(lx-.02*MH,lx+.02*MH,top,top+legH+.4*MV,tz+dz-.02*MH,tz+dz+.02*MH,IR); for(let y=top+.3*MV;y<top+legH+.3*MV;y+=.42*MV)bx(lx-.02*MH,lx+.02*MH,y,y+.04*MV,tz-.2*MH,tz+.2*MH,IR);
    { const m=add(new THREE.RingGeometry(r,r+.7*MH,28),new THREE.MeshLambertMaterial({color:0x4a4038,side:THREE.DoubleSide}),tx,deck,tz); m.rotation.x=-Math.PI/2;
      const rl=add(new THREE.TorusGeometry(r+.68*MH,.025*MH,4,32),IR,tx,deck+1.05*MV,tz); rl.rotation.x=Math.PI/2; for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; if(Math.abs(Math.sin(a/2))<.12)continue; bx(-.02*MH,.02*MH,deck,deck+1.05*MV,-.02*MH,.02*MH,IR).position.set(tx+Math.cos(a)*(r+.68*MH),deck+.52*MV,tz+Math.sin(a)*(r+.68*MH)); } }
    const na=Math.PI*.8, nx=tx+Math.cos(na)*(r+.35*MH), nz=tz+Math.sin(na)*(r+.35*MH); TW.nest=new THREE.Group(); G.add(TW.nest); { const n=add(new THREE.TorusGeometry(.22*MH,.08*MH,6,12),L(0x6a5030),0,.08*MV,0,TW.nest); n.rotation.x=Math.PI/2; TW.gem=add(new THREE.IcosahedronGeometry(.07*MH,0),new THREE.MeshBasicMaterial({color:0x9a6aff}),0,.14*MV,0,TW.nest); } TW.nest.position.set(nx,deck,nz);
    TW.hawk=new THREE.Group(); G.add(TW.hawk); { const B=L(0x5a3e2a); add(new THREE.SphereGeometry(.15*MH,8,6),B,0,0,0,TW.hawk).scale.set(.8,.7,2); for(const s of [-1,1]){ const w=add(new THREE.BoxGeometry(.8*MH,.02*MV,.3*MH),B,s*.45*MH,0,0,TW.hawk); w.userData.s=s; } }
    const fa=-Math.PI*.5, fx=tx+Math.cos(fa)*(r+.6*MH), fz=tz+Math.sin(fa)*(r+.6*MH); bx(fx-.02*MH,fx+.02*MH,deck,deck+2.6*MV,fz-.02*MH,fz+.02*MH,L(0xb0b4b8));
    TW.cv=document.createElement('canvas'); TW.cv.width=64; TW.cv.height=40; TW.tex=new THREE.CanvasTexture(TW.cv); TW.tex.colorSpace=THREE.SRGBColorSpace;
    TW.cloth=add(new THREE.PlaneGeometry(1.1*MH,.7*MV),new THREE.MeshLambertMaterial({map:TW.tex,side:THREE.DoubleSide}),fx+.56*MH,deck+2.2*MV,fz); TW.cloth.castShadow=false; TW.fx=fx; TW.fz=fz;
    thing({name:'THE WATER TOWER LADDER',act:()=>{ TW.want=true; }},lx+.3*MH,top,tz,.6*MH,1.6*MV);
    TW.downTh=thing({name:'CLIMB DOWN THE LADDER',act:()=>{ if(TW.on)down(); }},tx+r+.35*MH,deck,tz,.5*MH,.8*MV);
    TW.nestTh=thing({name:"A HAWK'S NEST",act:()=>nestAct()},nx,deck,nz,.6*MH,.5*MV);
    TW.viewTh=thing({name:'THE VIEW',act:()=>viewAct()},tx+Math.cos(1.2)*(r+.5*MH),deck,tz+Math.sin(1.2)*(r+.5*MH),.5*MH,1.2*MV);
    TW.flagTh=thing({name:'THE FLAGPOLE',act:()=>flagAct()},fx,deck,fz,.5*MH,2*MV); for(const th of [TW.downTh,TW.nestTh,TW.viewTh,TW.flagTh]){ th.reach=1*T; th.near=1.8*T; }
    flagShow(); };
  const flagOf=()=>{ const w=ONLINE&&ONLINE.world&&ONLINE.world['flag:wtower']; return w&&w.n?w:S.flag; };
  const flagShow=()=>{ const f=flagOf(); TW.cloth.visible=!!f; if(!f)return; const g=TW.cv.getContext('2d'), c=f.c||'#c83a3a'; g.fillStyle=c; g.fillRect(0,0,64,40); g.fillStyle='#f4efe6'; g.fillRect(0,0,64,6); g.fillRect(0,34,64,6);
    g.font='bold 20px monospace'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(String(f.n||'?').slice(0,2).toUpperCase(),32,21); TW.tex.needsUpdate=true; TW.flagTh.name='THE FLAG OF '+String(f.n||'SOMEONE').toUpperCase(); };
  const flagAct=()=>{ '@later'; const n=(ONLINE&&ONLINE.myName?ONLINE.myName():'YOU')||'YOU', cs=['#c83a3a','#3a6ac8','#e0b030','#3a9a5a','#8a4ac0','#e07030'], c=cs[Math.floor(hs(n.length*31+n.charCodeAt(0),5)*cs.length)];
    const f={n,c,t:Date.now()}; S.flag=f; save(); if(ONLINE&&ONLINE.put&&ONLINE.on)ONLINE.put('flag:wtower',f); flagShow(); SFX.play('clunk',{vol:.4,pitch:1.4}); say('YOU RUN YOUR FLAG UP THE POLE. IT SNAPS OUT OVER THE STREET.','#f2c14e'); };
  const nestAct=()=>{ '@later'; if(!INV.ready('wtower:nest'))return say('THE NEST IS EMPTY. THE HAWK BRINGS ANOTHER SHINY THING BY TOMORROW.','#c8a090');
    if(!FORAGE.use('bird',-30,70)&&VIT.hurt){ VIT.hurt(.04); say('THE HAWK STOOPS AND RAKES YOUR ARM! YOU GRAB THE STONE ANYWAY.','#ff9a8a'); } else say('YOU KEEP STILL AND SLOW. THE HAWK LETS YOU TAKE THE STONE.','#9fd8ff');
    INV.pick('wtower:nest'); TW.gem.visible=false; };
  const viewAct=()=>{ '@later'; const d=INV.ready('wtower:view'); if(d){ mark('wtower:view'); FORAGE.use('bird',-20,80); FORAGE.use('climb',-50,150); }
    say('THE WHOLE MARKET LIES UNDER YOU: THE STREET, THE ROOFS, THE PARK\'S TREES, THE RIVER BEYOND.'+(d?' YOU SPOT BIRDS YOU NEVER SAW FROM BELOW.':''),'#9fd8ff'); };
  const risk=()=>{ const W=WX&&WX.now||{}; return (W.rain||0)*.6+(W.snow||0)*.6+(W.storm||0)*.8+Math.max(0,(W.wind||0)-.25)*.8; };
  const lpos=()=>{ pos.x=TW.lx+.3*MH; pos.z=TW.tz; SHARED.heading=-Math.PI/2; };
  const onLad=h=>{ TW.c={h,r0:Math.floor(h/(.3*MV))}; TW.on=false; st.climb={z:0,ph:h/ZU}; SHARED.target=null; lpos(); if(risk()>.25)say('THE RUNGS ARE WET AND THE WIND PULLS AT YOU. CAREFUL.','#ffb070'); };
  const down=()=>onLad(TW.H-.05*MV);
  const slip=()=>{ '@later'; const h=TW.c?TW.c.h:0; TW.c=null; st.climb=null; pos.x=TW.lx+.7*MH; pos.z=TW.tz; if(VIT.hurt)VIT.hurt(.04+.08*h/TW.H); say('YOUR HAND SLIPS ON THE RUNG! YOU FALL TO THE ROOF.','#ff9a8a'); };
  ROOFQ.slip=()=>{ if(TW.c)slip(); };
  const ladder=(dt,up,dn)=>{ const c=TW.c, K=FORAGE.climbK?FORAGE.climbK():1, sp=1.1*MV*K;
    if(up){ c.h=Math.min(TW.H,c.h+sp*dt); if(c.h>=TW.H-1e-6){ TW.c=null; st.climb=null; TW.on=true; pos.x=TW.tx+TW.r+.35*MH; pos.z=TW.tz; SHARED.py=TW.deck; RIG.act(st,'mantle'); return false; } }
    else if(dn){ c.h=Math.max(0,c.h-sp*dt); if(c.h<=0){ TW.c=null; st.climb=null; pos.x=TW.lx+.7*MH; pos.z=TW.tz; return false; } }
    const r0=Math.floor(c.h/(.3*MV)); if(r0!==c.r0){ c.r0=r0; if(FORAGE.climbed)FORAGE.climbed(); }
    if((up||dn)&&Math.random()<dt*risk()*.15*Math.max(.15,1.25-sk('climb')/100)){ slip(); return false; }
    st.climb.ph=c.h/ZU; lpos(); return true; };

  // ---------- the night run: perches over your roof's parapet and the next houses' roofs, leapt one to the next (W or SPACE; S back), the CLIMBING skill your footing; a miss you catch, two and you fall to your roof. It ends on the mat where a rival master waits
  const C={on:false,i:0,leap:null,miss:0,held:true}, M=[];
  const runBuild=()=>{ const {U,V,top,box}=R, mine=[(box[0]+box[2])/2,(box[1]+box[3])/2], P=MV*1.05;
    const nb=(MODS.apts.blocks||[]).filter(b=>!b.mine&&Math.abs(b.top-top)<3*MV).map(b=>({b,c:[(b.box[0]+b.box[2])/2,(b.box[1]+b.box[3])/2]})).map(o=>({...o,d:Math.hypot(o.c[0]-mine[0],o.c[1]-mine[1])})).filter(o=>o.d<40*T).sort((a,b)=>a.d-b.d).slice(0,2);
    const CR=L(0x6a4a2a), LN=new THREE.MeshBasicMaterial({color:0xffb050}); M.length=0;
    const edgeOf=(bb,dx,dz,off,inset)=>{ const cx=(bb[0]+bb[2])/2, cz=(bb[1]+bb[3])/2, ax=Math.abs(dx)>Math.abs(dz); return ax?[dx>0?bb[2]-inset:bb[0]+inset,cz+off]:[cx+off,dz>0?bb[3]-inset:bb[1]+inset]; };
    M.push({x:U(S_(16)),z:V(10.9),y:top,n:'start'});
    for(const o of nb){ const dx=o.c[0]-mine[0], dz=o.c[1]-mine[1], bb=o.b.box, t2=o.b.top;
      const a=edgeOf(box,dx,dz,-1.2*MH,.15*MH), b=edgeOf(bb,-dx,-dz,-1.2*MH,.7*MH), c=[(bb[0]+bb[2])/2,(bb[1]+bb[3])/2], d=edgeOf(bb,-dx,-dz,1.2*MH,.7*MH), e=edgeOf(box,dx,dz,1.2*MH,.15*MH);
      bx(c[0]-.5*MH,c[0]+.5*MH,t2,t2+1.2*MV,c[1]-.5*MH,c[1]+.5*MH,CR); bx(c[0]-.35*MH,c[0]+.35*MH,t2+1.2*MV,t2+1.9*MV,c[1]-.35*MH,c[1]+.35*MH,CR);   // a stack of crates in the middle of its roof
      M.push({x:a[0],z:a[1],y:top+P},{x:b[0],z:b[1],y:t2},{x:c[0],z:c[1],y:t2+1.9*MV},{x:d[0],z:d[1],y:t2},{x:e[0],z:e[1],y:top+P}); }
    if(!nb.length){ M.push({x:U(S_(12)),z:V(9),y:top+.6*MV},{x:U(S_(15.5)),z:V(1.4),y:top+3.2*MV},{x:U(S_(12.5)),z:V(2.2),y:top+3.2*MV}); }   // no neighbour: the bulkhead's roof instead
    M.push({x:U(S_(15.2)),z:V(10.9),y:top,n:'mat'}); C.ok=true;
    for(const m of M.slice(1,-1)){ const l=add(new THREE.SphereGeometry(.09*MH,8,6),LN,m.x,m.y+.25*MV,m.z); l.castShadow=false; m.lamp=l; }   // a paper lantern on each perch, lit after dark
    const mx=U(S_(15.2)), mz=V(10.9); C.mat={x:mx,z:mz}; const mt=bx(mx-1.5*MH,mx+1.5*MH,top,top+.04*MV,mz-1.5*MH,mz+1.5*MH,L(0xc8b88a)); bx(mx-1.6*MH,mx+1.6*MH,top,top+.03*MV,mz-1.6*MH,mz+1.6*MH,L(0x3a5a3a)).position.y=top+.012*MV; mt.castShadow=false;
    C.th=thing({name:'THE NIGHT RUN (A CHALK MARK)',act:()=>runStart()},M[0].x,top,M[0].z,.7*MH,.6*MV); };
  const S_=u=>u>13?u-Math.max(0,26-R.W):u;
  const runStart=()=>{ '@later'; if(!night())return say('A CHALK ARROW ON THE ROOF. THE RUN IS ONLY OPEN AFTER DARK.','#c8a090'); if(B.on)return; C.on=true; C.i=0; C.leap=null; C.miss=0; C.held=true; pos.x=M[0].x; pos.z=M[0].z; face(1);
    say('THE NIGHT RUN: W OR SPACE LEAPS TO THE NEXT LANTERN, S BACK. THE MASTER WAITS AT THE END.','#ffd080'); };
  const face=k=>{ const q=M[Math.max(0,Math.min(M.length-1,C.i+k))]; if(q&&(q.x!==pos.x||q.z!==pos.z))SHARED.heading=Math.atan2(q.x-pos.x,q.z-pos.z); };
  const leapTo=j=>{ '@later'; const a=M[C.i], b=M[j], d=Math.hypot(b.x-a.x,b.z-a.z); if(VIT.sta<.06)return say('YOU ARE TOO WINDED TO LEAP. CATCH YOUR BREATH.','#c8a090'); VIT.sta=Math.max(0,VIT.sta-.03);
    const ok=j<C.i||FORAGE.use('climb',-160+d/T*8,60+d/T*8); C.leap={a,b,t:0,T:.45+d/T*.08,ok,j}; SFX.play('step',{vol:.5,pitch:.8}); };
  const runEnd=()=>{ C.on=false; C.leap=null; SHARED.target=null; };
  const run=(dt,up,dn)=>{ if(!night()&&!C.leap){ runEnd(); say('DAWN. THE LANTERNS GO OUT AND THE RUN CLOSES.','#c8a090'); return false; } const sp=keys.has(' '), go=up||sp, edge=go&&!C.held; C.held=go;
    if(C.leap){ const L0=C.leap; L0.t+=dt; const u=Math.min(1,L0.t/L0.T), e=L0.ok?u:Math.min(u,.55); pos.x=L0.a.x+(L0.b.x-L0.a.x)*e; pos.z=L0.a.z+(L0.b.z-L0.a.z)*e; C.y=L0.a.y+(L0.b.y-L0.a.y)*e+Math.sin(Math.PI*e)*(.6*MV+Math.hypot(L0.b.x-L0.a.x,L0.b.z-L0.a.z)*.1);
      if(u>=1){ C.leap=null; if(L0.ok){ C.i=L0.j; C.miss=0; if(C.i===M.length-1){ runEnd(); pos.x=M[C.i].x; pos.z=M[C.i].z; say('THE LAST LEAP: ONTO THE MAT.','#ffd080'); boutStart(); return false; } face(1); }
        else if(++C.miss<2){ pos.x=L0.a.x; pos.z=L0.a.z; if(VIT.hurt)VIT.hurt(.02); say('YOU FALL SHORT, CATCH THE EDGE BY YOUR FINGERS AND HAUL YOURSELF BACK.','#ffb070'); }
        else { runEnd(); pos.x=M[0].x; pos.z=M[0].z; if(VIT.hurt)VIT.hurt(.1); say('YOU MISS AGAIN AND FALL, HARD, BACK ONTO YOUR OWN ROOF.','#ff9a8a'); return false; } }
      return true; }
    C.y=null; const m=M[C.i]; pos.x=m.x; pos.z=m.z;
    if(edge&&C.i<M.length-1)leapTo(C.i+1); else if(dn&&!C.dn&&C.i>0)leapTo(C.i-1); else if(dn&&!C.dn&&C.i===0){ runEnd(); C.dn=dn; return false; } C.dn=dn; return true; };

  // ---------- the rival master: OLD MIDNIGHT, a black tiger in a dark robe (the folk's maker, FOLK.parts on RIGNPC), on the mat after dark; finish the run and he spars you (your blows through STRIKES, his through VIT.hurt)
  const B={on:false,hp:0,cd:0,N:null,making:false,A:{hit:0}}; const REC={k:'rf_master',n:'OLD MIDNIGHT',sp:'tiger',m:.62,f:'#2e2e36',f2:'#c8c8d0',coat:'robe',cc:'#16161e',c2:'#8a2a2a',sash:'#c8a030'};
  const master=async()=>{ '@later'; if(B.N||B.making||B.fail)return; B.making=true; try{ if(window.LOAD)await LOAD('park'); const A=B.A, top=R.top, mx=C.mat.x, mz=C.mat.z+1.1*MH;
      const bones=[['root',null,[0,0,0]],['hips','root',[0,.36,0]],['head','hips',[0,.66,0]],['earL','head',[-.08,.84,0]],['earR','head',[.08,.84,0]],['cape','hips',[0,.6,-.1]],['armL','hips',[-.16,.56,0]],['armR','hips',[.16,.56,0]],['legL','hips',[-.08,.3,0]],['legR','hips',[.08,.3,0]],['tail1','hips',[0,.3,-.12]],['tail2','tail1',[0,.3,-.2]],['tail3','tail2',[0,.3,-.28]]];
      const def={bones,parts:FOLK.parts(REC),springs:{earL:{f:-.08,s:.1,k:60,c:6,lim:.25},earR:{f:-.08,s:.1,k:60,c:6,lim:.25},tail1:{f:-.12,s:.12,k:40,c:5,lim:.35},tail2:{f:-.18,s:.16,k:30,c:4,lim:.45},tail3:{f:-.24,s:.2,k:24,c:3.4,lim:.6}},
        pose:(c,dt)=>{ const Bn=c.B; RIGNPC.walk(c,{arm:.35,leg:.5,bob:.02,rock:.04}); if(Bn.head)Bn.head.rotation.y=c.look||0; if(!B.on){ Bn.armL.rotation.x=Bn.armR.rotation.x=-.2; return; }
          A.hit=Math.max(0,A.hit-dt); Bn.armL.rotation.x=-1.2; Bn.armL.rotation.z=.3; Bn.armR.rotation.x=A.hit>0?-1.65:-1.0; Bn.armR.rotation.z=A.hit>0?0:-.3; }};
      B.N=RIGNPC.make(def,{key:'rf_master',name:REC.n,eye:-1,metres:REC.m,tall:1,radius:.2,speed:.5,stride:7,lv:'up',group:'bodega',x:mx,z:mz,home:{x:mx,z:mz,r:0},range:0,ground:()=>top,free:()=>true,
        brain:(dt,you,s)=>{ if(!B.on){ s.hold=true; s.to=null; s.x=mx; s.z=mz; s.face={x:you.x,z:you.z}; return; } const d=Math.hypot(you.x-s.x,you.z-s.z);
          if(d>1.1*T){ s.hold=false; s.to={x:you.x,z:you.z}; } else { s.hold=true; s.to=null; s.face={x:you.x,z:you.z}; } }});
      B.N.talk={start:'hi',lines:{hi:{say:'The roofs at night are my dojo. Run them, and we spar on the mat. One bout a night.',opts:[{t:'GOODBYE.',go:''}]}}};
    }catch(e){ B.fail=true; console.warn('ROOFQ master',e); } B.making=false; };
  const boutStart=()=>{ '@later'; if(!B.N){ master(); return say('THE MAT IS EMPTY. THE MASTER IS COMING: STEP ON IT AGAIN IN A MOMENT.','#c8a090'); } if(!INV.ready('rfdojo'))return say('OLD MIDNIGHT BOWS: ONE BOUT A NIGHT. COME BACK TOMORROW NIGHT.','#c8a090');
    B.on=true; B.hp=5+2*S.belt; B.cd=1.5; mark('rfdojo'); say('OLD MIDNIGHT BOWS. "'+BELT[S.belt]+' BELT. SHOW ME." SPAR!','#ffd080'); };
  const boutEnd=(won,why)=>{ B.on=false; if(won){ const was=S.belt; S.belt=Math.min(BELT.length-1,S.belt+1); S.wins++; save(); FORAGE.give('rf_scroll',1); FORAGE.use('fight',-20,80); FORAGE.draw();
      say(was<S.belt?'OLD MIDNIGHT GOES DOWN TO ONE KNEE. "THE '+BELT[S.belt]+' BELT IS YOURS." HE HANDS YOU A SCROLL.':'OLD MIDNIGHT BOWS LOW. "NOTHING LEFT TO TEACH, BLACK BELT." A SCROLL, ALL THE SAME.','#f2c14e'); }
    else say(why||'OLD MIDNIGHT STEPS BACK. "ENOUGH FOR TONIGHT." COME BACK TOMORROW NIGHT.','#c8a090'); };
  const bout=dt=>{ const N=B.N, s=N.st, d=Math.hypot(pos.x-C.mat.x,pos.z-C.mat.z);
    if(VIT.dead||VIT.out>0||VIT.hp<.2)return boutEnd(false); if(d>3*MH)return boutEnd(false,'YOU STEP OFF THE MAT. THE BOUT IS FORFEIT. COME BACK TOMORROW NIGHT.'); if(!night())return boutEnd(false,'DAWN BREAKS. OLD MIDNIGHT IS GONE WITH THE DARK.');
    const ST=window.STRIKES; if(ST)for(const k of ST.strikes())if(ST.inCone(k,s.x,s.z,N.g.position.y,.3*T)){ B.hp-=k.d*ST.strength(k); ST.landed(k); const dx=s.x-pos.x, dz=s.z-pos.z, l=Math.hypot(dx,dz)||1; s.sx=dx/l*.8*T; s.sz=dz/l*.8*T; SFX.play('thud',{vol:.5,pitch:1.1,vary:.2}); }
    if(B.hp<=0)return boutEnd(true);
    if((B.cd-=dt)<=0&&Math.hypot(pos.x-s.x,pos.z-s.z)<1.3*T){ B.cd=Math.max(.9,2-.15*S.belt); B.A.hit=.3; const r=VIT.hurt?VIT.hurt(.04+.012*S.belt,s):1; if(r!==2)SFX.play('thud',{vol:.6,pitch:.8}); } };

  // ---------- standing: the tower's ladder and catwalk, a perch on the run (ground raised only under you, as the trees' branches are)
  const sg0=STORE.stackGround; STORE.stackGround=(x,z)=>{ if(R&&Math.hypot(x-pos.x,z-pos.z)<.6*T){ if(TW.c)return R.top+TW.c.h; if(C.on)return C.y!=null?C.y:M[C.i].y; }
    if(R&&TW.on){ const q=Math.hypot(x-TW.tx,z-TW.tz); if(q>TW.r-.2*MH&&q<TW.r+.9*MH)return TW.deck; } return sg0?sg0(x,z):null; };
  MODS.climbs=MODS.climbs||[]; MODS.climbs.push((dt,up,dn)=>{ if(!R||SHARED.LVL!=='up')return false;
    if(C.on)return run(dt,up,dn);
    if(TW.c)return ladder(dt,up,dn);
    if(TW.on&&dn&&Math.hypot(pos.x-(TW.tx+TW.r+.35*MH),pos.z-TW.tz)<.4*MH){ down(); return true; }
    if(!TW.on&&(TW.want||up)&&Math.hypot(pos.x-(TW.lx+.3*MH),pos.z-TW.tz)<.6*MH&&Math.abs(SHARED.py-R.top)<.5*MV){ TW.want=false; onLad(0); return true; } TW.want=false; return false; });

  const build=()=>{ '@later'; const A=MODS.apts.A, X=SHARED.BOD.X, Z=SHARED.BOD.Z, mine=(MODS.apts.blocks||[]).find(b=>b.mine); MH=T/.84; MV=SHARED.BOD.YS(24)/.84;
    R={A,W:Math.abs(A.x1-A.x0),U:u=>X(A.x0+u),V:v=>Z(A.y0+v),top:MODS.apts.lvY(MODS.apts.floors||3),box:mine?mine.box:[X(A.x0),Z(A.y0),X(A.x1),Z(A.y1)]};
    G=new THREE.Group(); G.name='roofquests'; scene.add(G); ghBuild(); twBuild(); runBuild(); ROOFQ.built=true; };
  let far=true; SYS.add('places',dt=>{ if(!ROOFQ.built){ if(MODS.apts&&MODS.apts.A&&MODS.apts.blocks&&SHARED.BOD&&SYS.started){ const A=MODS.apts.A, x=SHARED.BOD.X((A.x0+A.x1)/2), z=SHARED.BOD.Z((A.y0+A.y1)/2); if(Math.hypot(pos.x-x,pos.z-z)<60*T)build(); } return; }
    dt=Math.min(.1,dt||0); const cx=(R.box[0]+R.box[2])/2, cz=(R.box[1]+R.box[3])/2, near=SHARED.LVL==='up'&&!ROOMS.cur&&Math.hypot(pos.x-cx,pos.z-cz)<70*T; if(near===far){ far=!near; G.visible=near; }
    if(!near){ if(B.on)boutEnd(false); if(B.N)VIS.hide(B.N.g,'roofq',true); return; }
    const nt=night(); for(const m of M)if(m.lamp)m.lamp.visible=nt; if(C.th)C.th.name=nt?'THE NIGHT RUN (A CHALK MARK)':'A CHALK ARROW';
    if(nt&&!B.N&&!B.making&&Math.hypot(pos.x-C.mat.x,pos.z-C.mat.z)<20*T)master(); if(B.N)VIS.hide(B.N.g,'roofq',!nt);
    if(B.on)bout(dt); pigeons(dt);
    if(TW.on){ const dx=pos.x-TW.tx, dz=pos.z-TW.tz, q=Math.hypot(dx,dz)||1, k=Math.max(TW.r+.12*MH,Math.min(TW.r+.6*MH,q)); if(k!==q){ pos.x=TW.tx+dx/q*k; pos.z=TW.tz+dz/q*k; } if(SHARED.py<TW.deck-.6*MV)TW.on=false; }
    TW.gem.visible=INV.ready('wtower:nest'); TW.downTh.obj.visible=TW.nestTh.obj.visible=TW.viewTh.obj.visible=TW.flagTh.obj.visible=TW.on;
    { const t=performance.now()/1000, a=t*.35; TW.hawk.position.set(TW.tx+Math.cos(a)*5*MH,TW.deck+5*MV+Math.sin(t*.7)*.6*MV,TW.tz+Math.sin(a)*5*MH); TW.hawk.rotation.set(0,-a,Math.sin(t)*.2); for(const w of TW.hawk.children)if(w.userData.s)w.rotation.z=w.userData.s*Math.sin(t*3)*.25; }
    if(TW.cloth.visible)TW.cloth.rotation.y=Math.sin(performance.now()/400)*.15; },'148c-roofquests');
  SYS.add('world',k=>{ if(k==='flag:wtower'&&TW.cloth)flagShow(); },'148c-roofquests');
  window.ROOFQDBG=()=>({built:ROOFQ.built,gh:S.gh,owl:S.owl,belt:BELT[S.belt],wins:S.wins,flag:flagOf(),top:R&&+R.top.toFixed(3),gh_at:GH.x0!=null?[(GH.x0+GH.x1)/2,(GH.z0+GH.z1)/2]:null,bed:GH.beds?[(GH.beds[0][0]+GH.beds[0][1])/2,(GH.beds[0][2]+GH.beds[0][3])/2]:null,
    pigeons:PG.on,tower:TW.tx!=null?{foot:[TW.lx+.3*MH,TW.tz],deck:+TW.deck.toFixed(3),on:TW.on,climb:TW.c?+TW.c.h.toFixed(3):null}:null,run:{on:C.on,i:C.i,n:M.length,leap:!!C.leap,marks:M.map(m=>[+(m.x/T).toFixed(1),+(m.z/T).toFixed(1),+(m.y/MV).toFixed(1)])},mat:C.mat||null,bout:{on:B.on,hp:B.hp,master:!!B.N,shown:!!(B.N&&B.N.g.visible)}});
  Object.assign(ROOFQ,{GH,PG,TW,C,B,land,shoo,run:()=>runStart(),boutStart:()=>boutStart(),things:()=>things}); }
