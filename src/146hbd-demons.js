// THE SUBWAY DEMONS: DEMONS, tiny red demons living down on the subway's track beds and in its tunnels: rare (one in two or three minutes of looking), they run from you within their own stretch of tunnel and blow up only when you corner them (it hurts, it never kills); the freeze ray locks one in a block of ice you can carry (it thaws in a minute) to the SECURITY OFFICE in the platform's far corner, which pays a bounty for each.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INV, LEVELS, pos, SFX, UI, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {FIX, MODS, SOL, SYS, TILE} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
import {TRAINS} from './009c-trains.js';
const DEMONS={list:[],BOUNTY:25};
{ const M=TILE/.84, V3=THREE.Vector3, rnd=Math.random, say=(t,c)=>SAY(t,c||'#ff9a7a'), ICE_S=60, BAGID='demon_ice';
  FORAGE.add({names:{[BAGID]:'A DEMON IN A BLOCK OF ICE'}});
  const MT=()=>SHARED.METRO, SL=()=>MT()&&MT().SL;
  const inStation=()=>SHARED.LVL==='down'&&!!MT()&&MT().inside(pos.x,pos.z);
  const ROOT=new THREE.Group(); ROOT.name='demons'; scene.add(LEVELS.own(ROOT,'station'));

  /* ---------- a demon: about half a metre, red, horned, yellow eyed, little bat wings and a spade tail ---------- */
  const GEO={body:new THREE.SphereGeometry(.13,12,9),head:new THREE.SphereGeometry(.11,12,9),horn:new THREE.ConeGeometry(.024,.1,6),eye:new THREE.SphereGeometry(.022,8,6),
    leg:new THREE.CylinderGeometry(.026,.022,.13,6).translate(0,-.065,0),foot:new THREE.SphereGeometry(.03,6,4),arm:new THREE.CylinderGeometry(.02,.016,.12,6).translate(0,-.06,0),
    tail:new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(0,0,0),new V3(0,-.03,-.1),new V3(0,.04,-.19),new V3(0,.13,-.22)]),10,.012,5),spade:new THREE.ConeGeometry(.035,.07,4),
    wing:(()=>{ const s=new THREE.Shape(); s.moveTo(0,0); s.lineTo(.16,.1); s.lineTo(.14,.02); s.lineTo(.18,-.03); s.lineTo(.1,-.04); s.lineTo(.12,-.09); s.lineTo(0,-.05); return new THREE.ShapeGeometry(s); })(),
    grin:new THREE.TorusGeometry(.045,.008,4,10,Math.PI),ice:new THREE.BoxGeometry(.52,.66,.5).translate(0,.33,0)};
  GEO.iceEdge=new THREE.EdgesGeometry(GEO.ice);
  const MAT={dark:new THREE.MeshLambertMaterial({color:0x2a0808}),eye:new THREE.MeshBasicMaterial({color:0xffd23a}),wing:new THREE.MeshLambertMaterial({color:0x6a0e0e,side:THREE.DoubleSide}),
    ice:new THREE.MeshLambertMaterial({color:0xb8e6ff,emissive:0x1a3a50,transparent:true,opacity:.48,depthWrite:false}),edge:new THREE.LineBasicMaterial({color:0xe8f8ff,transparent:true,opacity:.8})};
  const make=()=>{ const g=new THREE.Group(), red=new THREE.MeshLambertMaterial({color:0xc41a1a,emissive:0x000000}), part=(geo,mat,p,r=[0,0,0],s=1,par=g)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(...p); m.rotation.set(...r); m.scale.setScalar(s); m.castShadow=true; par.add(m); return m; };
    const B=new THREE.Group(); B.position.y=.14; g.add(B);
    part(GEO.body,red,[0,.1,0],[0,0,0],1,B).scale.set(1,1.1,.9); part(GEO.head,red,[0,.29,.02],[0,0,0],1,B);
    for(const s of [1,-1]){ part(GEO.horn,MAT.dark,[s*.06,.39,.02],[0,0,-s*.5],1,B); part(GEO.eye,MAT.eye,[s*.04,.31,.11],[0,0,0],1,B).scale.set(1,.7,.6); }
    part(GEO.grin,MAT.dark,[0,.25,.1],[0,0,Math.PI],1,B);
    const W=[1,-1].map(s=>{ const w=new THREE.Group(); w.position.set(s*.05,.16,-.09); B.add(w); const m=part(GEO.wing,MAT.wing,[0,0,0],[0,s>0?0:Math.PI,0],1,w); return w; });
    const A=[1,-1].map(s=>part(GEO.arm,red,[s*.12,.15,0],[0,0,s*.5],1,B));
    const tail=part(GEO.tail,red,[0,.02,-.1],[0,0,0],1,B); part(GEO.spade,MAT.dark,[0,.17,-.22],[.3,0,0],1,tail).scale.set(1,1,.4);
    const L=[1,-1].map(s=>{ const l=part(GEO.leg,red,[s*.05,.14,0]); part(GEO.foot,MAT.dark,[0,-.13,.02],[0,0,0],1,l).scale.set(1,.6,1.4); return l; });
    const blk=new THREE.Mesh(GEO.ice,MAT.ice); blk.renderOrder=4; blk.add(new THREE.LineSegments(GEO.iceEdge,MAT.edge)); blk.visible=false; g.add(blk);
    g.scale.setScalar(M); ROOT.add(g); return {g,B,W,A,L,tail,blk,red}; };

  /* ---------- where they can be: down on the track beds and in the tunnels (never up on a platform; a train over the bed is still the bed), clear of what stands there, within their own stretch of tunnel ---------- */
  const ground=(x,z)=>MODS.station.ground(x,z);
  const onTrack=(x,z,R=.2*M)=>{ const T=MT(); if(!T||!T.inside(x,z)||ground(x,z)>T.DY-.3*M&&!(TRAINS.inCar&&TRAINS.inCar(x,z)))return false; return !SOL.down.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R); };
  const HOME=25*M, inRange=(d,x,z)=>Math.hypot(x-d.hx,z-d.hz)<HOME;
  let uid=0;
  const spawn=(x,z,state='flee')=>{ const d={id:'demon:'+(++uid),x,z,hx:x,hz:z,y:ground(x,z),hd:rnd()*Math.PI*2,state,t:0,fuse:0,ice:0,frozen:0,ph:rnd()*9,away:0,...make()};
    d.th={name:'A LITTLE RED DEMON',obj:d.g,reach:1.7*M,near:3*M,tall:d.y+.7*M,act:()=>pick(d)}; UI.thing(d.th); DEMONS.list.push(d); return d; };
  const drop=d=>{ const i=DEMONS.list.indexOf(d); if(i>=0)DEMONS.list.splice(i,1); const j=UI.things.indexOf(d.th); if(j>=0)UI.things.splice(j,1); d.g.removeFromParent(); d.red.dispose(); };
  // a track spot at distance r0..r1 from you, ahead of you if it can be (or the nearest one when r0 is 0)
  const trackNear=(r0,r1)=>{ const h=SHARED.heading||0; let best=null, bs=-1e9; for(let k=0;k<60;k++){ const a=h+(rnd()-.5)*(k<30?2.2:6.3), r=r0+rnd()*(r1-r0), x=pos.x+Math.sin(a)*r, z=pos.z+Math.cos(a)*r;
      if(!onTrack(x,z))continue; const sc=r0?Math.cos(a-h):-r; if(sc>bs){ bs=sc; best={x,z}; } } return best; };
  const fromDark=()=>{ const p=trackNear(9*M,16*M); return p?spawn(p.x,p.z):null; };

  /* ---------- frozen: a block of ice you can lift into your bag; it thaws in a minute, in your hands or on the floor ---------- */
  const BAG=[];   // the thaw times of the blocks you carry
  const pick=d=>{ if(d.state!=='ice'){ say('IT HISSES AT YOU. FREEZE IT FIRST (THE FREEZE RAY).'); return; }
    FORAGE.give(BAGID,1); BAG.push(d.ice); drop(d); SFX.play('clunk',{vol:.5,pitch:1.4}); say('YOU LIFT THE DEMON IN ITS BLOCK OF ICE. TAKE IT TO THE SECURITY OFFICE BEFORE IT THAWS ('+Math.ceil(BAG[BAG.length-1])+' s).','#9fe6ff'); };
  SYS.onStart(()=>{ const n=FORAGE.has(BAGID)?(INV.items[BAGID]||1):0; for(let i=0;i<n;i++)BAG.push(ICE_S); },'146hbd-demons');
  const bagTick=dt=>{ for(let i=BAG.length-1;i>=0;i--){ if((BAG[i]-=dt)>0)continue; BAG.splice(i,1); if(!FORAGE.has(BAGID))continue; FORAGE.take(BAGID,1);
      const q=inStation()&&(trackNear(0,1.5*M)||trackNear(0,8*M)); if(q){ const d=spawn(q.x,q.z); d.t=-1; say('THE ICE IN YOUR BAG CRACKS. THE DEMON IS OUT AND DOWN INTO THE TRACKS!'); }
      else say('THE DEMON IN YOUR BAG MELTS AWAY TO A PUFF OF SMOKE.','#c8b0a0'); } };

  /* ---------- the blast: fire and smoke, a hard knock for whoever is close, never the last one ---------- */
  let blasting=false; VIT.bouts.push(()=>blasting);
  const boom=d=>{ const y=d.y+.25*M; SFX.play('boom',{vol:.8,pitch:1.6,vary:.15});
    for(let k=0;k<26;k++)FLAME.part(k%3,d.x,y,d.z,(rnd()-.5)*4*M,(.6+rnd()*2.2)*M,(rnd()-.5)*4*M,.35+rnd()*.35,(.12+rnd()*.12)*M,rnd()*9);
    for(let k=0;k<10;k++)FLAME.ember(d.x,y,d.z,2); for(let k=0;k<6;k++)FLAME.puff(d.x+(rnd()-.5)*.5*M,y,d.z+(rnd()-.5)*.5*M,1.6);
    const r=Math.hypot(pos.x-d.x,pos.z-d.z); if(r<2.2*M&&!VIT.dead&&Math.abs(SHARED.py-d.y)<1.5*M){ blasting=true; try{ VIT.hurt(.32*(1-r/(2.4*M)),{x:d.x,z:d.z}); }finally{ blasting=false; } if(VIT.hp<.03)VIT.hp=.03; SHARED.trip=true; say('THE DEMON BLOWS UP IN YOUR FACE!'); }
    for(const o of DEMONS.list)if(o!==d&&o.state!=='ice'&&Math.hypot(o.x-d.x,o.z-d.z)<1.5*M&&o.state!=='fuse'){ o.state='fuse'; o.fuse=.25+rnd()*.3; }
    drop(d); };

  /* ---------- each frame: they keep away from you down in the dark, run when you come near, and blow up only when you corner them; the ray's ice turns one into a block ---------- */
  const SPEED=2.6*M, SCARE=7*M, CORNER=1.6*M, NEAR=.85*M; let seek=0, next=120+rnd()*60;
  const step=(d,dt,now)=>{ d.t+=dt;
    if(d.frozen>0&&d.state!=='ice'){ d.state='ice'; d.ice=ICE_S; d.B.scale.setScalar(1); d.th.name='A DEMON FROZEN IN ICE (PICK IT UP)'; SFX.play('clunk',{vol:.4,pitch:1.8}); }
    if(d.state==='ice'){ d.ice-=dt; const blk=d.blk; blk.visible=true; d.red.emissive.setHex(0x000000);
      if(d.ice<5)blk.position.x=Math.sin(now*40)*.006;
      if(d.ice<=0){ blk.visible=false; blk.position.x=0; d.state='flee'; d.t=-1; d.th.name='A LITTLE RED DEMON'; for(let k=0;k<12;k++)FLAME.part(8,d.x,d.y+rnd()*.6*M,d.z,(rnd()-.5)*2*M,(.4+rnd())*M,(rnd()-.5)*2*M,.8,.04*M,rnd()*9); say('A DEMON BREAKS OUT OF ITS ICE.'); }
      d.g.position.set(d.x,d.y,d.z); return; }
    const dx=pos.x-d.x, dz=pos.z-d.z, r=Math.hypot(dx,dz), me=!VIT.dead&&inStation(); let moving=false;
    if(d.state==='fuse'){ d.fuse-=dt; d.red.emissive.setRGB(Math.sin(now*30)>0?.9:.2,.3,.1); d.B.scale.setScalar(1+(.5-Math.min(.5,d.fuse))*.5); if(d.fuse<=0)return boom(d); }
    else if(me&&d.t>0&&r<SCARE){ d.away=0;
      // the way that takes it furthest from you, inside its stretch: none that opens the gap, it is cornered
      let best=null, bd=r+.24*M; for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, nx=d.x+Math.sin(a)*.6*M, nz=d.z+Math.cos(a)*.6*M; if(!onTrack(nx,nz)||!inRange(d,nx,nz))continue; const q=Math.hypot(pos.x-nx,pos.z-nz); if(q>bd){ bd=q; best=a; } }
      if(best!=null){ const e=Math.atan2(Math.sin(best-d.hd),Math.cos(best-d.hd)); d.hd+=Math.sign(e)*Math.min(Math.abs(e),dt*9); const go=SPEED*dt*(Math.abs(e)<1.2?1:.4), nx=d.x+Math.sin(d.hd)*go, nz=d.z+Math.cos(d.hd)*go;
        if(onTrack(nx,nz)&&inRange(d,nx,nz)){ d.x=nx; d.z=nz; moving=true; } }
      else { d.hd=Math.atan2(dx,dz); if(r<CORNER){ d.state='fuse'; d.fuse=.8; SFX.play('blip',{vol:.6,pitch:2}); } } }
    else if((d.away+=dt)>40&&r>20*M)return drop(d);   // left alone a long while, it slips off into the dark
    const run=moving, ph=(d.ph+=dt*(run?14:3)), y=ground(d.x,d.z); d.y=y;
    d.g.position.set(d.x,y+(run?Math.abs(Math.sin(ph))*.05*M:0),d.z); d.g.rotation.y=d.hd; d.th.tall=y+.7*M;
    d.L[0].rotation.x=run?Math.sin(ph)*.7:0; d.L[1].rotation.x=run?-Math.sin(ph)*.7:0; d.A[0].rotation.x=run?-Math.sin(ph)*.6:0; d.A[1].rotation.x=run?Math.sin(ph)*.6:0;
    for(const [i,w] of d.W.entries())w.rotation.y=(i?-1:1)*(.3+Math.sin(now*(run?22:6)+i)*.45); d.tail.rotation.y=Math.sin(ph*.5)*.4; };
  SYS.add('places',dt=>{ dt=Math.min(.1,dt||0); if(!SHARED.METRO)return; const now=performance.now()/1000; bagTick(dt);
    if(!inStation()){ for(const d of [...DEMONS.list])drop(d); return; }
    for(const d of [...DEMONS.list])step(d,dt,now);
    // only while you are down on the tracks or in the tunnels, and rarely: one every two or three minutes of looking
    if(onTrack(pos.x,pos.z,0)&&!DEMONS.list.some(d=>d.state!=='ice')&&(seek+=dt)>=next){ if(fromDark()){ seek=0; next=120+rnd()*60; } } },'146hbd-demons');
  // the freeze ray and the flamethrower reach them as they do people (o.frozen is kept by the ray's ice)
  (MODS.moreBodies=MODS.moreBodies||[]).push(()=>inStation()?DEMONS.list.map(d=>({id:d.id,x:d.x,y:d.y,z:d.z,o:d,root:d.B})):[]);

  /* ---------- the SECURITY OFFICE: a steel and glass booth in the platform's far corner (clear of the route map on the end wall); double-click its window to hand in what you carry ---------- */
  const office=()=>{ const S=SL(), MTT=MT(); if(!S)return; const x0=S.MID+1.7, x1=S.MID+4.2, y0=S.L-2.6, y1=S.L-.55, a=MTT.at(x0,y0), b=MTT.at(x1,y1);
    const X0=Math.min(a.x,b.x), X1=Math.max(a.x,b.x), Z0=Math.min(a.z,b.z), Z1=Math.max(a.z,b.z), cx=(X0+X1)/2, cz=(Z0+Z1)/2, W=X1-X0, D=Z1-Z0, gy=ground(cx,cz), H=2.5*M;
    const toUs=MTT.at(S.MID,S.L-6), face=Math.atan2(toUs.x-cx,toUs.z-cz);
    const g=new THREE.Group(); g.position.set(cx,gy,cz); g.rotation.y=Math.round(face/(Math.PI/2))*(Math.PI/2); ROOT.parent.add(LEVELS.own(g,'station'));
    const ww=(Math.abs(Math.sin(g.rotation.y))>.5)?D:W, dd=(Math.abs(Math.sin(g.rotation.y))>.5)?W:D;
    const steel=new THREE.MeshLambertMaterial({color:0x3c4652}), steelD=new THREE.MeshLambertMaterial({color:0x262c34}), glass=new THREE.MeshLambertMaterial({color:0x9fd0e0,transparent:true,opacity:.28,depthWrite:false}),
      lit=new THREE.MeshBasicMaterial({color:0xfff2d0}), desk=new THREE.MeshLambertMaterial({color:0x5a4632});
    const box=(w,h,d,m,x,y,z)=>{ const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); me.position.set(x,y,z); me.castShadow=me.receiveShadow=m!==glass; g.add(me); return me; };
    const lo=1*M, fz=dd/2;
    box(ww,lo,.08*M,steel,0,lo/2,fz); box(ww,lo,.08*M,steel,0,lo/2,-fz); box(.08*M,lo,dd,steel,ww/2,lo/2,0); box(.08*M,lo,dd,steel,-ww/2,lo/2,0);   // the steel below the glass
    box(ww,H-lo-.3*M,.03*M,glass,0,lo+(H-lo-.3*M)/2,fz); box(.03*M,H-lo-.3*M,dd,glass,ww/2,lo+(H-lo-.3*M)/2,0); box(.03*M,H-lo-.3*M,dd,glass,-ww/2,lo+(H-lo-.3*M)/2,0);
    box(ww,H-lo,.08*M,steel,0,lo+(H-lo)/2,-fz);
    for(const [x,z] of [[ww/2,fz],[-ww/2,fz],[ww/2,-fz],[-ww/2,-fz]])box(.1*M,H,.1*M,steelD,x,H/2,z);
    box(ww+.2*M,.3*M,dd+.2*M,steelD,0,H-.15*M,0);   // the roof band
    box(ww*.9,.04*M,.35*M,desk,0,lo,fz-.2*M); box(.5*M,.06*M,.25*M,steelD,0,lo-.05*M,fz+.12*M);   // the counter inside, the tray under the window
    box(ww*.7,.04*M,dd*.6,lit,0,H-.32*M,0);   // its ceiling light
    // the sign over the window
    const cv=document.createElement('canvas'); cv.width=256; cv.height=48; const c2=cv.getContext('2d'); c2.fillStyle='#0e2a5a'; c2.fillRect(0,0,256,48); c2.strokeStyle='#d8e4f4'; c2.lineWidth=3; c2.strokeRect(3,3,250,42);
    c2.fillStyle='#f4f6fa'; c2.font='bold 26px sans-serif'; c2.textAlign='center'; c2.textBaseline='middle'; c2.fillText('SECURITY',128,25);
    const tx=new THREE.CanvasTexture(cv); tx.colorSpace=THREE.SRGBColorSpace; const sg=new THREE.Mesh(new THREE.PlaneGeometry(ww*.8,ww*.8*48/256),new THREE.MeshBasicMaterial({map:tx})); sg.position.set(0,H-.15*M,fz+.11*M); g.add(sg);
    SOL.down.push([X0-.05*M,Z0-.05*M,X1+.05*M,Z1+.05*M]); FIX.down.push([X0,Z0,0,X1,Z1,H]);
    const win=g.children.find(m=>m.material===glass);
    UI.thing({name:'THE SECURITY OFFICE (HAND IN FROZEN DEMONS)',obj:win,reach:2.2*M,near:4*M,tall:gy+2*M,act:()=>{ const n=INV.items[BAGID]||0;
      if(!n)return say('THE OFFICER BEHIND THE GLASS: "SEEN ANY OF THOSE LITTLE RED DEVILS? FREEZE ONE AND BRING IT HERE. $'+DEMONS.BOUNTY+' A HEAD."','#d8e4f4');
      FORAGE.take(BAGID,n); BAG.length=0; const pay=n*DEMONS.BOUNTY; INV.cash=(INV.cash||0)+pay; if(INV.save)INV.save(); SFX.play('ding',{vol:.6});
      say('YOU HAND IN '+(n>1?n+' FROZEN DEMONS':'A FROZEN DEMON')+'. THE SECURITY OFFICE PAYS YOU $'+pay+'.','#f2c14e'); }});
    DEMONS.office={x:cx,z:cz,g}; };
  SYS.onStart(()=>{ try{ office(); }catch(e){ console.warn('security office',e); } },'146hbd-demons');
  window.DEMONS=DEMONS; DEMONS.T={M,spawn,boom,pick,BAG,onTrack,trackNear,me:()=>({x:pos.x,z:pos.z,hp:VIT.hp,dead:VIT.dead})};
  window.DEMONDBG=()=>({n:DEMONS.list.length,list:DEMONS.list.map(d=>({id:d.id,state:d.state,x:+d.x.toFixed(2),z:+d.z.toFixed(2),ice:+(d.ice||0).toFixed(1)})),bag:BAG.map(t=>+t.toFixed(1)),office:DEMONS.office?{x:DEMONS.office.x,z:DEMONS.office.z}:null,spawn:()=>fromDark(),here:inStation()}); }
