// THE ARMS: fifteen weapons every player owns from the start, held in the hand (WIELD), no ammo: the revolver, shotgun, sniper rifle, machine gun and laser rifle (shots traced through the world), the grenade, rocket launcher, molotov, fireworks, snowball launcher, net launcher and bubble gun (things thrown or flown under gravity), the mine, the leaf blower and the portal gun; they hit anything (you, other players, the townsfolk, the monsters, loose things), seen and felt online (arm, shot).
import {SHARED, THREE} from './003-shx.js';
import {BLAZE, FORAGE, INV, LEVELS, ONLINE, PHYS, pos, RAG, ROOMS, SFX, UI, VIT, W3, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {MODS, QS, SYS, TILE} from './006-map-pre.js';
import {FLAME} from './007-fire.js';
import {RIVER} from './066-river.js';
{ const T=TILE, M=T/.84, V3=THREE.Vector3, rnd=Math.random, say=SAY, now=()=>performance.now(), G=9.8*M;
  // the weapons, one row each: k is how it works (gun: traced shots; proj: a thing that flies; mine; blow; portal); d hurts a player (VIT), md a monster (STRIKES), kb throws back, dn knocks down
  const W={
    w_revolver:{n:'REVOLVER',k:'gun',cd:.5,rng:60,pel:1,spr:0,d:.18,md:3,kb:.8,dn:1,snd:['boom',2.6,.5],tr:0xffe6a0,hint:'A CLICK FIRES WHERE YOU AIM.'},
    w_shotgun:{n:'SHOTGUN',k:'gun',cd:1,rng:24,pel:8,spr:.07,d:.05,md:1.1,kb:.3,dn:4,snd:['boom',1.6,.85],tr:0xffd890,hint:'A CLICK FIRES A SPRAY OF SHOT. CLOSE UP IT KNOCKS PEOPLE DOWN.'},
    w_sniper:{n:'SNIPER RIFLE',k:'gun',cd:1.6,rng:120,pel:1,spr:0,d:.45,md:8,kb:2,dn:1,snd:['boom',1.2,1],tr:0xfff4d0,hint:'A CLICK FIRES ONE HEAVY SHOT A LONG WAY.'},
    w_mgun:{n:'MACHINE GUN',k:'gun',cd:.09,rng:55,pel:1,spr:.025,d:.05,md:1.2,kb:.25,dn:0,auto:1,snd:['boom',3,.35],tr:0xffe0a0,hint:'HOLD THE MOUSE DOWN TO FIRE A STREAM OF BULLETS.'},
    w_laser:{n:'LASER RIFLE',k:'gun',cd:.2,rng:70,pel:1,spr:0,d:.08,md:2,kb:.2,auto:1,beam:1,snd:['laser',1.4,.45],tr:0xff3a3a,hint:'HOLD THE MOUSE DOWN TO FIRE A RED BEAM. IT SCORCHES WHAT IT HITS.'},
    w_grenade:{n:'GRENADE',k:'proj',cd:1,sp:12,up:.25,g:1,fuse:2.2,bounce:.4,boom:{r:4,d:.5,md:9,kb:2.2},snd:['whoosh',1.4,.4],hint:'A CLICK THROWS IT. IT BOUNCES AND GOES OFF A MOMENT LATER.'},
    w_rocket:{n:'ROCKET LAUNCHER',k:'proj',cd:1.5,sp:30,up:0,g:0,life:3,smoke:1,boom:{r:4.5,d:.55,md:10,kb:2.6},snd:['whoosh',.6,.8],hint:'A CLICK FIRES A ROCKET. IT BLOWS UP ON WHAT IT HITS.'},
    w_molotov:{n:'MOLOTOV',k:'proj',cd:1.1,sp:11,up:.3,g:1,boom:{r:2.6,d:.1,md:2,kb:.4,fire:1},snd:['whoosh',1.2,.4],hint:'A CLICK THROWS IT. IT BREAKS AND BURNS WHERE IT LANDS.'},
    w_fireworks:{n:'FIREWORKS',k:'proj',cd:.7,sp:17,up:.15,g:.12,fuse:1.3,wob:1,smoke:.4,boom:{r:2.6,d:.1,md:2,kb:.5,fire:1,burst:1},snd:['whoosh',1.8,.5],hint:'A CLICK LAUNCHES A ROCKET THAT BURSTS IN COLOURS. LOW DOWN IT LIGHTS A FIRE.'},
    w_snowball:{n:'SNOWBALL LAUNCHER',k:'proj',cd:.35,sp:19,up:.12,g:1,hit:{d:.02,md:.4,kb:.5,splat:1},snd:['whoosh',2.2,.35],hint:'A CLICK LOBS A SNOWBALL.'},
    w_net:{n:'NET LAUNCHER',k:'proj',cd:1.2,sp:16,up:.1,g:.6,hit:{tr:'net',tt:4},snd:['whoosh',.9,.5],hint:'A CLICK FIRES A NET. WHO IT CATCHES CANNOT MOVE FOR A FEW SECONDS.'},
    w_bubble:{n:'BUBBLE GUN',k:'proj',cd:.6,sp:4.5,up:0,g:-.03,drag:.25,life:6,hit:{tr:'bubble',tt:4},snd:['blip',.6,.4],hint:'A CLICK BLOWS A BIG BUBBLE. WHO IT TOUCHES IS HELD INSIDE IT FOR A FEW SECONDS.'},
    w_mine:{n:'MINE',k:'mine',cd:1,boom:{r:3.6,d:.5,md:9,kb:2.4},hint:'A CLICK SETS A MINE ON THE GROUND IN FRONT OF YOU. IT GOES OFF WHEN SOMEONE STEPS ON IT.'},
    w_blower:{n:'LEAF BLOWER',k:'blow',rng:7,auto:1,hint:'HOLD THE MOUSE DOWN TO BLOW. IT PUSHES PEOPLE AND LOOSE THINGS AWAY.'},
    w_portal:{n:'PORTAL GUN',k:'portal',cd:.4,rng:40,hint:'A CLICK OPENS A PORTAL ON THE GROUND, BLUE THEN ORANGE. STEP INTO ONE TO COME OUT OF THE OTHER.'}};
  const IDS=Object.keys(W); FORAGE.add({names:Object.fromEntries(IDS.map(id=>[id,W[id].n]))}); if(FORAGE.OWNERS)FORAGE.OWNERS.push(...IDS);   // the owners' kit tops them up too (owner, 10 Nov 2026)
  { const got=String(OWNED.get('arms')||'').split(','), add=QS.get('fresh')?IDS:IDS.filter(id=>!got.includes(id)); if(add.length){ for(const id of add)if(!INV.items[id])INV.items[id]=1; INV.save(); OWNED.set('arms',IDS.join(',')); } }   // a weapon added later reaches everyone once
  const A={hold:false,aim:null,cd:{},P:[],mines:[],portals:new Map(),traps:new Map(),blows:new Map(),pc:0,inP:false,mi:0,sent:'',sentT:0,last:null}; window.ARMS=A;
  addEventListener('pointerup',e=>{ if(e.button===0)A.hold=false; }); addEventListener('blur',()=>{ A.hold=false; });

  /* ---------- the things in the hand, along the forearm (+y), the muzzle at the top ---------- */
  const lam=c=>new THREE.MeshLambertMaterial({color:c}), glow=c=>new THREE.MeshBasicMaterial({color:c});
  const cyl=(r0,r1,h,m,y,z=0,x=0)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(r0*M,r1*M,h*M,10),m); o.position.set(x*M,y*M,z*M); return o; }, box=(w,h,d,m,y,z=0,x=0)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w*M,h*M,d*M),m); o.position.set(x*M,y*M,z*M); return o; };
  const ball=(r,m,y,z=0)=>{ const o=new THREE.Mesh(new THREE.SphereGeometry(r*M,12,9),m); o.position.set(0,y*M,z*M); return o; };
  const HELD=[], held=(g,id,tip)=>{ g.traverse(o=>{ o.userData.wield=1; o.castShadow=true; }); g.tipL=new V3(0,tip*M,0); g.head=g.tipL; g.arm=id; HELD.push(g); return g; };
  const MAKE={
    w_revolver:()=>{ const g=new THREE.Group(), st=lam(0x34363c), wd=lam(0x6a4428); g.add(box(.035,.11,.05,wd,-.03,.02),cyl(.03,.03,.06,st,.06),cyl(.011,.011,.2,st,.17),box(.012,.03,.012,st,.25,-.012)); return held(g,'w_revolver',.28); },
    w_shotgun:()=>{ const g=new THREE.Group(), st=lam(0x2c2e33), wd=lam(0x7a4e2a); g.add(box(.05,.26,.06,wd,-.1,.02),box(.045,.1,.05,st,.06),cyl(.014,.014,.6,st,.38,0,-.012),cyl(.014,.014,.6,st,.38,0,.012),box(.04,.16,.045,wd,.22,.02)); return held(g,'w_shotgun',.69); },
    w_sniper:()=>{ const g=new THREE.Group(), st=lam(0x26282c), gr=lam(0x4a5038); g.add(box(.045,.3,.06,gr,-.12,.02),box(.04,.14,.05,st,.08),cyl(.011,.011,.78,st,.5),cyl(.022,.022,.2,st,.14,-.05),cyl(.026,.026,.02,glow(0x7fb0ff),.25,-.05),box(.008,.12,.008,st,.08,.05)); return held(g,'w_sniper',.9); },
    w_mgun:()=>{ const g=new THREE.Group(), st=lam(0x2a2c30), dk=lam(0x1a1c1e), ol=lam(0x4a5038); g.add(box(.05,.24,.06,ol,-.1,.02),box(.06,.18,.07,st,.08),cyl(.016,.016,.42,dk,.38),cyl(.03,.03,.3,st,.3),box(.03,.1,.12,dk,.08,-.08),box(.008,.06,.008,st,.17,.04)); return held(g,'w_mgun',.6); },
    w_laser:()=>{ const g=new THREE.Group(), wh=lam(0xe4e8ee), dk=lam(0x30343c), rd=glow(0xff3030); g.add(box(.04,.1,.05,dk,-.03,.02),box(.06,.3,.07,wh,.15),cyl(.02,.028,.1,dk,.34),ball(.018,rd,.39),box(.07,.02,.075,rd,.1),box(.07,.02,.075,rd,.2)); return held(g,'w_laser',.41); },
    w_grenade:()=>{ const g=new THREE.Group(), gr=lam(0x4a5a34), st=lam(0x8a8a80); g.add(ball(.045,gr,.06),cyl(.016,.016,.03,st,.115),box(.012,.06,.008,st,.09,.03)); return held(g,'w_grenade',.06); },
    w_rocket:()=>{ const g=new THREE.Group(), ol=lam(0x5a6440), dk=lam(0x2a2c2a), rd=lam(0x9a2a1e); g.add(cyl(.06,.06,.9,ol,.25),cyl(.066,.066,.05,dk,.7),cyl(.066,.066,.05,dk,-.18),box(.03,.1,.04,dk,-.02,.07),box(.04,.08,.04,dk,.1,-.08),new THREE.Mesh(new THREE.ConeGeometry(.05*M,.12*M,10),rd)); g.children[5].position.y=.76*M; return held(g,'w_rocket',.8); },
    w_molotov:()=>{ const g=new THREE.Group(), gl=new THREE.MeshPhongMaterial({color:0x4a8a40,transparent:true,opacity:.75,shininess:80}), rag=lam(0xd8cdb0), fu=lam(0xc8902a); g.add(cyl(.035,.035,.14,gl,.05),cyl(.033,.033,.07,fu,.02),cyl(.012,.03,.05,gl,.15),cyl(.009,.012,.06,rag,.2)); return held(g,'w_molotov',.23); },
    w_fireworks:()=>{ const g=new THREE.Group(), rd=lam(0xc82a2a), bl=lam(0x2a5ac8), yl=lam(0xe8c040), wd=lam(0xa88a5a); g.add(cyl(.004,.004,.3,wd,-.05),cyl(.024,.024,.16,rd,.16,0,-.02),cyl(.024,.024,.16,bl,.16,0,.025),new THREE.Mesh(new THREE.ConeGeometry(.026*M,.05*M,10),yl)); g.children[3].position.set(-.02*M,.265*M,0); return held(g,'w_fireworks',.28); },
    w_snowball:()=>{ const g=new THREE.Group(), bl=lam(0x3a6ab0), wh=lam(0xf4f8ff), dk=lam(0x2a2e36); g.add(box(.035,.1,.05,dk,-.03,.02),cyl(.04,.04,.4,bl,.2),cyl(.05,.05,.03,dk,.41),ball(.036,wh,.43),cyl(.03,.03,.08,bl,.12,-.06),ball(.03,wh,.17,-.06)); return held(g,'w_snowball',.45); },
    w_net:()=>{ const g=new THREE.Group(), dk=lam(0x3a3e34), rope=lam(0xb8a878); g.add(box(.035,.1,.05,dk,-.03,.02),cyl(.05,.065,.36,dk,.18),cyl(.06,.06,.06,rope,.38),cyl(.003,.003,.08,rope,.43,.03),cyl(.003,.003,.08,rope,.43,-.03)); return held(g,'w_net',.42); },
    w_bubble:()=>{ const g=new THREE.Group(), pk=lam(0xe87ab8), yl=lam(0xf4d040), bm=new THREE.MeshPhongMaterial({color:0xc8f0ff,transparent:true,opacity:.35,shininess:120}); g.add(box(.035,.1,.05,pk,-.03,.02),cyl(.03,.04,.22,pk,.12),cyl(.045,.045,.04,yl,.12,-.06),new THREE.Mesh(new THREE.TorusGeometry(.04*M,.006*M,6,16),yl),ball(.035,bm,.28)); g.children[3].position.y=.26*M; return held(g,'w_bubble',.28); },
    w_mine:()=>{ const g=new THREE.Group(), gr=lam(0x48503a), dk=lam(0x2a2c28), rd=glow(0xff2a1a); g.add(cyl(.09,.1,.04,gr,.05),cyl(.03,.03,.02,dk,.08),ball(.01,rd,.095)); g.children.forEach(c=>c.rotation.x=0); return held(g,'w_mine',.1); },
    w_blower:()=>{ const g=new THREE.Group(), or=lam(0xe0702a), dk=lam(0x2a2c30), gy=lam(0x8a8e94); g.add(box(.1,.14,.12,or,-.02,-.04),box(.03,.08,.04,dk,.04,.04),cyl(.035,.035,.55,gy,.3),cyl(.04,.035,.04,dk,.58)); return held(g,'w_blower',.6); },
    w_portal:()=>{ const g=new THREE.Group(), wh=lam(0xeef0f2), dk=lam(0x303238), core=new THREE.MeshBasicMaterial({color:0x3aa8ff}); g.add(box(.04,.1,.05,dk,-.03,.02),box(.06,.2,.08,wh,.12),cyl(.016,.03,.1,dk,.26),ball(.03,core,.33),box(.004,.12,.03,dk,.12,0,.032)); g.core=core; return held(g,'w_portal',.34); }};
  for(const id of IDS){ const w=W[id], k={name:w.n,hint:w.hint,make:()=>{ '@later'; return MAKE[id](); },aim:(dt,a)=>{ if(A.aim)a.copy(A.aim); return false; },use:()=>{ A.hold=true; fire(id); }};
    (WIELD.pend=WIELD.pend||[]).push([id,k]); if(WIELD.kind)WIELD.kind(id,k); }

  /* ---------- the bits that fly: sparks that glow, and solid bits (leaves, snow, glass, dirt) ---------- */
  const pool=(add,size)=>{ const N=700, P=new Float32Array(N*3), C=new Float32Array(N*3), g=new THREE.BufferGeometry(), L=[];
    g.setAttribute('position',new THREE.BufferAttribute(P,3).setUsage(THREE.DynamicDrawUsage)); g.setAttribute('color',new THREE.BufferAttribute(C,3).setUsage(THREE.DynamicDrawUsage)); g.setDrawRange(0,0);
    const m=new THREE.Points(g,new THREE.PointsMaterial({size:size*M,vertexColors:true,transparent:true,depthWrite:!add,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,toneMapped:!add}));
    m.frustumCulled=false; m.raycast=()=>{}; m.userData.anyRoom=1; m.userData.arms=1; scene.add(LEVELS.own(m,'*'));
    const c3=new THREE.Color();
    return {L,add:(x,y,z,vx,vy,vz,col,life,o={})=>{ if(L.length>=N)L.shift(); c3.set(col); L.push({x,y,z,vx,vy,vz,r:c3.r,g:c3.g,b:c3.b,t:0,life,gr:o.g??1,dr:o.dr??.6,bo:o.bo||0,fade:add}); },
      tick:dt=>{ let n=0; for(let i=L.length-1;i>=0;i--){ const p=L[i]; p.t+=dt; if(p.t>=p.life){ L[i]=L[L.length-1]; L.pop(); continue; }
          const k=Math.max(0,1-p.dr*dt); p.vx*=k; p.vz*=k; p.vy=p.vy*k-G*p.gr*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.z+=p.vz*dt;
          if(p.bo&&SHARED.LVL==='up'&&SHARED.groundY){ const gy=SHARED.groundY(p.x,p.z); if(p.y<gy+.02*M){ p.y=gy+.02*M; p.vy=Math.abs(p.vy)*p.bo; p.vx*=.5; p.vz*=.5; } } }
        for(const p of L){ const f=p.fade?1-p.t/p.life:1; P[n*3]=p.x; P[n*3+1]=p.y; P[n*3+2]=p.z; C[n*3]=p.r*f; C[n*3+1]=p.g*f; C[n*3+2]=p.b*f; n++; }
        g.setDrawRange(0,n); m.visible=n>0; if(n){ g.attributes.position.needsUpdate=true; g.attributes.color.needsUpdate=true; } }}; };
  const SP=pool(true,.07), BT=pool(false,.09);
  const sparks=(x,y,z,n,col,s=3,life=.35)=>{ for(let i=0;i<n;i++)SP.add(x,y,z,(rnd()-.5)*s*M,(rnd()-.2)*s*M,(rnd()-.5)*s*M,col,life*(.6+rnd()*.6),{g:.4,dr:2}); };
  const bits=(x,y,z,n,cols,s=3,life=1.2,o={})=>{ for(let i=0;i<n;i++)BT.add(x,y,z,(rnd()-.5)*s*M,(rnd()*.8+.2)*s*M,(rnd()-.5)*s*M,cols[i%cols.length],life*(.6+rnd()*.6),{g:o.g??1,dr:o.dr??.8,bo:o.bo??.3}); };

  /* ---------- the flashes: tracers and beams, fireballs, shock rings, and one light ---------- */
  const trG=new THREE.CylinderGeometry(1,1,1,6,1,true).translate(0,.5,0), TR=[], UP=new V3(0,1,0);
  const tracer=(a,b,col,w,life)=>{ let m=TR.find(m=>!m.visible); if(!m){ m=new THREE.Mesh(trG,new THREE.MeshBasicMaterial({color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false})); m.raycast=()=>{}; m.frustumCulled=false; m.userData.anyRoom=1; m.userData.arms=1; scene.add(LEVELS.own(m,'*')); TR.push(m); }
    const d=new V3().subVectors(b,a), l=d.length(); if(l<1e-4)return; m.visible=true; m.material.color.set(col); m.position.copy(a); m.quaternion.setFromUnitVectors(UP,d.divideScalar(l)); m.scale.set(w*M,l,w*M); m.t=0; m.life=life; m.w=w; };
  const fbG=new THREE.SphereGeometry(1,16,12), rgG=new THREE.RingGeometry(.8,1,32).rotateX(-Math.PI/2), FB=[];
  const fbMesh=(geo)=>{ let m=FB.find(m=>!m.visible&&m.geometry===geo); if(!m){ m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xffa040,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,side:THREE.DoubleSide})); m.raycast=()=>{}; m.frustumCulled=false; m.userData.anyRoom=1; m.userData.arms=1; scene.add(LEVELS.own(m,'*')); FB.push(m); } m.visible=true; m.t=0; return m; };
  const FL=new THREE.PointLight(new THREE.Color(1,.7,.35),0,14*M,1.6); FL.userData.fire=1; FL.userData.anyRoom=1; scene.add(FL); let flI=0;
  const flash=(x,y,z,I,col=0xffb060)=>{ if(I<flI*.6)return; FL.position.set(x,y,z); FL.color.set(col); flI=I; };
  const hear=(k,pitch,vol,x,z)=>{ const d=x==null?0:Math.hypot(x-pos.x,z-pos.z)/M; if(d>90)return; SFX.play(k,{pitch,vol:vol/(1+d/18),vary:.08}); };

  /* ---------- the world a shot meets: the ground (or water) by its height, then anything drawn ---------- */
  const ray=new THREE.Raycaster(), seen=o=>{ for(let q=o;q;q=q.parent)if(!q.visible||q===W3.group)return false; return !o.userData.wield&&!o.userData.iceShell&&!o.userData.arms&&!(o.material&&(o.material.visible===false||o.material.transparent&&o.material.opacity<.05)); };
  const up=()=>SHARED.LVL==='up', out=()=>up()&&!ROOMS.cur, wl=(x,z)=>RIVER&&RIVER.level?RIVER.level(x,z):null;
  const gy=(x,z)=>{ if(!up()||!SHARED.groundY)return -1e9; const w=wl(x,z), g=SHARED.groundY(x,z); return w!=null&&w>g?w:g; };
  const trace=(o,d,far)=>{ let t=far, what='air', n=null; if(up()){ const s=.4*M; for(let u=s;u<=far;u+=s){ const x=o.x+d.x*u, z=o.z+d.z*u; if(o.y+d.y*u<gy(x,z)){ t=u-s/2; what=wl(x,z)!=null&&wl(x,z)>=SHARED.groundY(x,z)?'water':'ground'; n=UP; break; } } }
    ray.set(o,d); ray.far=t; ray.camera=SHARED.cam; let h=null; try{ h=ray.intersectObjects(scene.children,true).find(h=>h.distance>.15*M&&seen(h.object)); }catch(e){}
    if(h){ t=h.distance; what='wall'; n=h.face?h.face.normal.clone().transformDirection(h.object.matrixWorld):null; if(n&&n.y>.7&&Math.abs(h.point.y-gy(h.point.x,h.point.z))<.3*M)what='ground'; }
    return {t,what,n,p:o.clone().addScaledVector(d,t),obj:h&&h.object}; };

  /* ---------- who a weapon hits: you, the other players near you, the characters (the jets' list) ---------- */
  const bodies=()=>MODS.bodies?MODS.bodies():[{id:'me',x:pos.x,y:SHARED.py,z:pos.z,root:W3.group}], BH=1.85*M, BR=.38*M;
  const rayBody=(o,d,b,far)=>{ const h2=d.x*d.x+d.z*d.z; if(h2<1e-4)return null; const t=((b.x-o.x)*d.x+(b.z-o.z)*d.z)/h2; if(t<0||t>far)return null; const x=o.x+d.x*t-b.x, z=o.z+d.z*t-b.z, y=o.y+d.y*t; if(Math.hypot(x,z)>BR||y<b.y-.05*M||y>b.y+BH)return null; return t; };
  const bodyOf=(o,L)=>{ if(!o||!L)return null; for(let q=o;q;q=q.parent)for(const b of L)if(b.root===q&&b.id!=='me')return b; return null; };   // a figure the ray met is that body
  const near=(b,x,y,z,r)=>Math.hypot(b.x-x,b.z-z)<r+BR*.5&&y>b.y-r-.2*M&&y<b.y+BH+r;
  const mob=(x,y,z,r,d,kb)=>{ const S=MODS.strikes; if(S&&S.hitAt)S.hitAt(x,y,z,r,d,kb); };
  const goods=(x,y,z,r,k,dir)=>{ if(MODS.goodsBlast)MODS.goodsBlast(x,y,z,r,k,dir); };
  // a hit on someone, judged by the one who fired: yours on you through VIT.hurt as any blow; theirs sent (shot); a character knocked over (PHYS.knock) or caught
  const takeHit=(h,f)=>{ if(VIT.dead)return; if(h.d>0)VIT.hurt(h.d,f); if(h.fire&&MODS.burnMe)MODS.burnMe(.01,f); if(h.tr)trap('me',h.tr,h.tt); if(h.kb>0||h.dn)MODS.blow&&MODS.blow(f,h.kb,h.dn); };
  const affect=(b,w,h,f)=>{ if(b.id==='me'){ takeHit(h,f); return; } const dx=b.x-f.x, dz=b.z-f.z, l=Math.hypot(dx,dz)||1;
    if(h.tr){ trap(b.id,h.tr,h.tt); ONLINE.on&&ONLINE.send({t:'arm',k:'trap',to:b.id,s:h.tr,d:h.tt}); }
    if(h.fire&&MODS.alight)MODS.alight(b.id,4);
    if(b.o){ ONLINE.send({t:'shot',to:b.id,w,d:+h.d.toFixed(3),kb:+(h.kb||0).toFixed(2),dn:h.dn?1:0,tr:h.tr||'',tt:h.tt||0,fire:h.fire?1:0,f:[+f.x.toFixed(2),+f.z.toFixed(2)]}); return; }
    if(b.N&&!h.tr&&(h.dn||h.kb>.6)&&up()&&PHYS.knock)PHYS.knock(b.N,{x:dx/l,z:dz/l},Math.min(3,.6+h.kb*.8)); };
  ONLINE.hear.shot=m=>{ '@later'; const f=Array.isArray(m.from)?{x:+m.from[0],z:+m.from[1]}:null; if(!f||!W[m.w])return; takeHit({d:Math.max(0,Math.min(.6,+m.d||0)),kb:Math.max(0,Math.min(3,+m.kb||0)),dn:!!m.dn,tr:m.tr==='net'||m.tr==='bubble'?m.tr:'',tt:Math.max(0,Math.min(6,+m.tt||0)),fire:!!m.fire},f); };

  /* ---------- the guns: each pellet traced from the muzzle; the nearest body on its line takes it, else the world does ---------- */
  const tipOf=(g,S)=>{ if(!g||!g.visible||!g.parent)return false; S.tip.copy(g.tipL).applyMatrix4(g.matrix); const e=g.matrix.elements; S.dir.set(e[4],e[5],e[6]).normalize(); return true; };
  // where you aim: what is under the mouse (the camera's ray into the world), from the muzzle; no mouse: the way the weapon points
  const aimAt=(S,far)=>{ if(A.aim){ S.dir.copy(A.aim).normalize(); return; } const r=WIELD.ray; if(!r)return; const c=r.origin.clone(), d=r.direction.clone().normalize(), h=trace(c,d,far+c.distanceTo(S.tip)); const v=h.p.sub(S.tip); if(v.lengthSq()>.04*M*M)S.dir.copy(v.normalize()); };
  const impact=(p,what,col)=>{ if(what==='water'){ bits(p.x,p.y,p.z,8,[0xd8ecf4,0xa8cce0],2,.6,{bo:0}); return; } if(what==='air')return; sparks(p.x,p.y,p.z,6,col||0xffd080,2.5,.25); bits(p.x,p.y,p.z,5,[0x6a6458,0x8a8272],1.6,.6); FLAME.puff(p.x,p.y+.05*M,p.z,.5,2); };
  const shoot=(id,S,mine)=>{ '@later'; const w=W[id], far=w.rng*M, L=mine?bodies():[], got=new Map(), ends=[], j=new V3();
    for(let i=0;i<w.pel;i++){ const d=S.dir.clone(); if(w.spr){ j.set(rnd()-.5,rnd()-.5,rnd()-.5).multiplyScalar(w.spr*2); d.add(j).normalize(); }
      const h=trace(S.tip,d,far); let bt=h.t, bb=bodyOf(h.obj,L); for(const b of L){ if(b.id==='me')continue; const t=rayBody(S.tip,d,b,bt); if(t!=null&&t<bt){ bt=t; bb=b; } }
      const e=S.tip.clone().addScaledVector(d,bt); ends.push(e);
      if(bb){ const g=got.get(bb)||{n:0}; g.n++; g.t=bt; got.set(bb,g); bits(e.x,e.y,e.z,3,[0x9a2a24,0x7a1a18],1.5,.5); }
      else{ impact(e,h.what,w.beam?0xff5040:0); if(mine){ mob(e.x,e.y,e.z,.45*T,w.md,w.kb); goods(e.x,e.y,e.z,.6*M,(w.kb+.5)*4*M,d); if(w.beam&&h.what!=='water'&&h.what!=='air'&&out()&&BLAZE.start&&rnd()<.12){ const b=BLAZE.start(e.x,e.z,true); if(b&&!BLAZE.burnable(e.x,e.z)){ b.life=6+rnd()*4; b.sp=1e9; } } } } }
    for(const [b,g] of got){ const close=g.t<6*M; affect(b,id,{d:w.d*g.n,kb:w.kb*Math.min(3,g.n),dn:w.dn&&g.n>=w.dn&&(w.pel===1||close)},{x:S.tip.x,z:S.tip.z}); mob(b.x,b.y+M,b.z,.3*T,w.md*g.n,w.kb); }
    flare(id,S.tip,S.dir,ends);
    if(mine&&ONLINE.on){ const r=v=>Math.round(v*100)/100; ONLINE.send({t:'arm',k:'shot',w:id,p:[r(S.tip.x),r(S.tip.y),r(S.tip.z)],e:ends.map(e=>[r(e.x),r(e.y),r(e.z)])}); } };
  const flare=(id,tip,dir,ends)=>{ const w=W[id]; for(const e of ends)tracer(tip,e,w.tr,w.beam?.03:.012,w.beam?.12:.06);
    if(!w.beam){ sparks(tip.x,tip.y,tip.z,7,0xffc860,3,.08); FLAME.puff(tip.x+dir.x*.1*M,tip.y+dir.y*.1*M,tip.z+dir.z*.1*M,.4,1); flash(tip.x,tip.y,tip.z,6); } else { sparks(tip.x,tip.y,tip.z,3,0xff4040,1.2,.1); flash(tip.x,tip.y,tip.z,2.5,0xff3030); }
    hear(w.snd[0],w.snd[1]*(.95+rnd()*.1),w.snd[2],tip.x,tip.z); };

  /* ---------- the things that fly: under gravity (and air), bouncing, bursting, catching who they touch ---------- */
  const PM={}, pmesh=id=>{ '@later'; const g=new THREE.Group(), M0=PM[id]||(PM[id]=(()=>{ switch(id){
      case 'w_grenade': return ()=>[ball(.045,lam(0x4a5a34),0)];
      case 'w_rocket': return ()=>{ const b=cyl(.04,.04,.3,lam(0x5a6440),0), c=new THREE.Mesh(new THREE.ConeGeometry(.04*M,.1*M,10),lam(0x9a2a1e)); c.position.y=.2*M; return [b,c,ball(.03,glow(0xffc060),-.17)]; };
      case 'w_molotov': return ()=>[cyl(.035,.035,.14,new THREE.MeshPhongMaterial({color:0x4a8a40,transparent:true,opacity:.75}),0),cyl(.012,.03,.06,lam(0xd8cdb0),.1)];
      case 'w_fireworks': return ()=>{ const c=new THREE.Mesh(new THREE.ConeGeometry(.026*M,.05*M,10),lam(0xe8c040)); c.position.y=.1*M; return [cyl(.024,.024,.16,lam(0xc82a2a),0),c]; };
      case 'w_snowball': return ()=>[ball(.06,lam(0xf4f8ff),0)];
      case 'w_net': return ()=>[new THREE.Mesh(new THREE.IcosahedronGeometry(.16*M,1),new THREE.MeshBasicMaterial({color:0xb8a878,wireframe:true}))];
      case 'w_bubble': return ()=>[new THREE.Mesh(new THREE.SphereGeometry(.32*M,18,14),bubMat)];
      default: return ()=>[ball(.05,lam(0x888888),0)]; } })()); for(const c of M0())g.add(c); g.traverse(o=>{ o.raycast=()=>{}; o.userData.arms=1; o.castShadow=true; }); g.userData.anyRoom=1; scene.add(LEVELS.own(g,'*')); return g; };
  const bubMat=new THREE.MeshPhongMaterial({color:0xd8f4ff,specular:0xffffff,shininess:160,emissive:0x302848,transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide});
  const launch=(id,tip,dir,who,mine)=>{ '@later'; const w=W[id], v=dir.clone(); v.y+=w.up||0; v.normalize().multiplyScalar(w.sp*M);
    const P={id,w,who,mine,p:tip.clone(),v,t:0,lp:tip.clone(),rT:0,m:pmesh(id),sT:0,bn:0,sd:rnd()*9}; P.m.position.copy(P.p); A.P.push(P); hear(w.snd[0],w.snd[1],w.snd[2],tip.x,tip.z); return P; };
  const done=(P,i)=>{ P.m.removeFromParent(); P.m.traverse(o=>{ if(o.geometry)o.geometry.dispose(); }); A.P.splice(i,1); };
  const contact=(P,p,what,n,b)=>{ '@later'; const w=P.w;
    if(w.boom&&!(P.id==='w_grenade'&&!b&&P.t<w.fuse)&&!(P.id==='w_fireworks'&&!b&&what==='air')){ boom(P.id,p,P.mine,what); return true; }
    if(P.id==='w_grenade'){ const nn=n||UP, vn=P.v.dot(nn); P.v.addScaledVector(nn,-(1+w.bounce)*vn).multiplyScalar(.7); P.p.copy(p).addScaledVector(nn,.06*M); if(++P.bn<12&&P.v.length()>1.2*M)hear('clunk',1.6,.35,p.x,p.z); return false; }
    if(w.hit){ const h=w.hit;
      if(h.splat){ bits(p.x,p.y,p.z,18,[0xf4f8ff,0xdce8f4],2.4,.9,{bo:.1}); hear('thud',1.8,.4,p.x,p.z); }
      if(h.tr==='bubble'){ bits(p.x,p.y,p.z,10,[0xd8f4ff,0xf0d8ff],1.8,.4,{g:.2,bo:0}); hear('click',2.2,.4,p.x,p.z); }
      if(h.tr==='net')bits(p.x,p.y,p.z,6,[0xb8a878],1,.5);
      if(b&&P.mine){ affect(b,P.id,{d:h.d||0,kb:h.kb||0,dn:0,tr:h.tr,tt:h.tt},{x:P.p.x-P.v.x*.05,z:P.p.z-P.v.z*.05}); mob(p.x,p.y,p.z,.4*T,h.md||0,h.kb||0); }
      else if(P.mine&&h.md)mob(p.x,p.y,p.z,.4*T,h.md,h.kb||0); }
    return true; };
  const projTick=dt=>{ if(!A.P.length)return; const L=A.P.some(P=>P.mine)?bodies():null;
    for(let i=A.P.length-1;i>=0;i--){ const P=A.P[i], w=P.w; P.t+=dt; const p0=P.p.clone();
      if(w.fuse&&P.t>=w.fuse){ if(w.boom)boom(P.id,P.p,P.mine,'air'); done(P,i); continue; }
      if((w.life||8)<P.t||P.p.y<-200*M){ if(P.id==='w_rocket')boom(P.id,P.p,P.mine,'air'); else if(P.id==='w_bubble')contact(P,P.p,'air',null,null); done(P,i); continue; }
      P.v.y-=G*w.g*dt; if(w.drag){ const k=Math.max(0,1-w.drag*dt); P.v.multiplyScalar(k); P.v.x+=Math.sin(P.t*2.3+P.sd)*.3*M*dt; P.v.z+=Math.cos(P.t*1.9+P.sd)*.3*M*dt; }
      if(w.wob){ P.v.x+=Math.sin(P.t*17+P.sd)*4*M*dt; P.v.z+=Math.cos(P.t*13+P.sd)*4*M*dt; }
      P.p.addScaledVector(P.v,dt);
      if(w.smoke&&(P.sT-=dt)<=0){ P.sT=.035/w.smoke; FLAME.puff(p0.x,p0.y,p0.z,.5*w.smoke+.2,1); sparks(p0.x,p0.y,p0.z,P.id==='w_fireworks'?3:2,P.id==='w_fireworks'?0xffd070:0xffa040,1,.25); }
      let hit=false;
      if(L){ for(const b of L){ if(b.id===P.who&&P.t<.35||b.id==='me'&&P.who==='me'&&P.t<.6)continue; if(near(b,P.p.x,P.p.y,P.p.z,P.id==='w_bubble'?.3*M:.08*M)){ hit=!contact(P,P.p,'body',null,b)?false:true; if(hit)break; } } }
      if(!hit){ const g=gy(P.p.x,P.p.z); if(P.p.y<g){ const what=wl(P.p.x,P.p.z)!=null&&wl(P.p.x,P.p.z)>=SHARED.groundY(P.p.x,P.p.z)?'water':'ground'; P.p.y=g; hit=contact(P,P.p.clone(),what,UP,null); } }
      if(!hit&&(P.rT-=dt)<=0){ P.rT=.05; const d=new V3().subVectors(P.p,P.lp), l=d.length(); if(l>1e-4){ ray.set(P.lp,d.divideScalar(l)); ray.far=l; ray.camera=SHARED.cam; let h=null; try{ h=ray.intersectObjects(scene.children,true).find(h=>seen(h.object)&&!(h.distance<.3*M&&P.t<.15)); }catch(e){}
          const hb=h&&P.mine?bodyOf(h.object,L):null; if(hb)hit=contact(P,h.point.clone(),'body',null,hb); else if(h){ const n=h.face?h.face.normal.clone().transformDirection(h.object.matrixWorld):UP; hit=contact(P,h.point.clone().addScaledVector(n,.03*M),n.y>.7?'ground':'wall',n,null); } } P.lp.copy(P.p); }
      if(hit){ done(P,i); continue; }
      P.m.position.copy(P.p); if(P.id==='w_rocket'||P.id==='w_fireworks'){ const v=P.v.clone().normalize(); P.m.quaternion.setFromUnitVectors(UP,v); } else if(P.id!=='w_bubble'){ P.m.rotation.x+=dt*9; P.m.rotation.z+=dt*5; } else { const s=1+Math.sin(P.t*6)*.04; P.m.scale.set(s,1/s,s); } } };

  /* ---------- a blast: a fireball, a shock ring, smoke and dirt; it hurts and throws whoever is near (by how near), monsters and loose things; the molotov and fireworks light fire ---------- */
  const COLS=[0xff4a4a,0x4aff6a,0x4a8aff,0xffe04a,0xff4aff,0x4affff,0xffffff];
  const boom=(id,p,mine,what)=>{ '@later'; const w=W[id], B=w.boom, R=B.r*M, x=p.x, y=p.y, z=p.z;
    if(B.burst){ const c1=COLS[Math.floor(rnd()*COLS.length)], c2=COLS[Math.floor(rnd()*COLS.length)]; for(let i=0;i<90;i++){ const a=rnd()*6.28, u=rnd()*2-1, s=(5+rnd()*2)*M, q=Math.sqrt(1-u*u); SP.add(x,y,z,Math.cos(a)*q*s,u*s,Math.sin(a)*q*s,i%2?c1:c2,1+rnd()*.6,{g:.25,dr:1.6}); }
      flash(x,y,z,18,c1); hear('boom',3,.5,x,z); hear('blip',2.4,.3,x,z); }
    else if(B.fire){ bits(x,y,z,14,[0x4a8a40,0x6aa860,0xe8e8d8],2.5,.7); for(let k=0;k<6;k++)FLAME.ember(x,y+.1*M,z,1.6); FLAME.puff(x,y+.3*M,z,1.6,5); flash(x,y,z,12,0xff8030); hear('splash',1.3,.6,x,z); hear('whoosh',.7,.6,x,z); }
    else { const f=fbMesh(fbG); f.position.set(x,y+.3*M,z); f.R=R*.55; f.life=.45; f.kind='fb'; const r=fbMesh(rgG); r.position.set(x,(what==='air'?y:gy(x,z)>-1e8?gy(x,z):y)+.05*M,z); r.R=R*1.1; r.life=.4; r.kind='rg';
      for(let k=0;k<5;k++)FLAME.puff(x+(rnd()-.5)*R*.4,y+(.3+rnd())*M,z+(rnd()-.5)*R*.4,2.4,6); for(let k=0;k<10;k++)FLAME.ember(x,y+.2*M,z,2.6);
      sparks(x,y+.2*M,z,40,0xffb050,9,.5); bits(x,y+.1*M,z,30,[0x4a4034,0x6a5a48,0x2a2622],8,1.4,{bo:.3}); flash(x,y+M,z,40); hear('boom',.9+rnd()*.2,1.1,x,z); }
    if(B.fire&&out()&&BLAZE.start&&what!=='water'&&(what!=='air'||y-gy(x,z)<1.5*M)){ const n=B.burst?1:4; for(let k=0;k<n;k++){ const a=k/n*6.28+rnd(), r=k?(.6+rnd()*.6)*M:0, fx=x+Math.cos(a)*r, fz=z+Math.sin(a)*r, burns=BLAZE.burnable(fx,fz), b=BLAZE.start(fx,fz,true); if(b&&!burns){ b.life=(B.burst?8:14)+rnd()*8; b.sp=1e9; } } }
    if(!mine)return;
    for(const b of bodies()){ const dx=b.x-x, dz=b.z-z, dy=Math.max(0,Math.abs(b.y+M-y)-M), dd=Math.hypot(dx,dz,dy); if(dd>R)continue; const k=1-dd/R;
      affect(b,id,{d:B.d*(.25+.75*k),kb:B.kb*(.4+.6*k),dn:!B.fire&&!B.burst&&k>.35,fire:!!B.fire&&k>.2},{x:x-dx*.01,z:z-dz*.01}); }
    mob(x,y,z,R,B.md,B.kb); goods(x,y,z,R*1.2,(B.fire?3:9)*M,null); };
  const fbTick=dt=>{ for(const m of FB){ if(!m.visible)continue; m.t+=dt; const u=m.t/m.life; if(u>=1){ m.visible=false; continue; } const e=1-(1-u)*(1-u)*(1-u), s=m.R*(m.kind==='fb'?.25+.75*e:e);
      m.scale.set(s,m.kind==='fb'?s*.85:1,s); m.material.opacity=m.kind==='fb'?(1-u)*.95:(1-u)*.7; if(m.kind==='fb')m.material.color.setRGB(1,.75-u*.45,.35-u*.3); else m.material.color.setRGB(1,.9,.7); }
    for(const m of TR){ if(!m.visible)continue; m.t+=dt; if(m.t>=m.life){ m.visible=false; continue; } m.material.opacity=1-m.t/m.life; }
    flI=Math.max(0,flI-dt*flI*9-dt*2); FL.intensity=flI; };

  /* ---------- traps: a net thrown over a body, or a bubble round it; it cannot move till it ends ---------- */
  const netMat=new THREE.MeshBasicMaterial({color:0x8a7a52,wireframe:true}), netG=new THREE.IcosahedronGeometry(1,2), bubG=new THREE.SphereGeometry(1,24,18);
  SHARED.stuck=0;
  const trap=(id,kind,t)=>{ let X=A.traps.get(id); if(X&&X.kind!==kind){ X.m.removeFromParent(); X=null; } if(!X){ const m=new THREE.Mesh(kind==='net'?netG:bubG,kind==='net'?netMat:bubMat); m.raycast=()=>{}; m.userData.arms=1; m.userData.anyRoom=1; m.renderOrder=4; scene.add(LEVELS.own(m,'*')); X={kind,m,t:0}; A.traps.set(id,X); }
    X.t=Math.max(X.t,t); if(id==='me')say(kind==='net'?'YOU ARE CAUGHT IN A NET!':'YOU ARE HELD IN A BUBBLE!','#e8e2cc'); };
  ONLINE.hear.arm=m=>{ '@later'; armHeard(m); };
  const trapTick=(dt,by)=>{ if(!A.traps.size){ SHARED.stuck=0; return; } let me=0;
    for(const [id,X] of A.traps){ X.t-=dt; const b=id==='me'?{x:pos.x,y:SHARED.py,z:pos.z}:by&&by.get(id), x=b&&(b.N||b.o);
      if(X.t<=0||!b){ X.m.removeFromParent(); if(x)x.frozen=0; if(b&&X.kind==='bubble'){ bits(b.x,b.y+M,b.z,16,[0xd8f4ff,0xf0d8ff],2.4,.5,{g:.2,bo:0}); hear('click',2.4,.4,b.x,b.z); } if(id==='me')say('YOU ARE FREE.','#e8e2cc'); A.traps.delete(id); continue; }
      if(id==='me')me=X.t; else if(x)x.frozen=Math.max(x.frozen||0,X.t);
      if(X.kind==='net'){ X.m.position.set(b.x,b.y+.85*M,b.z); X.m.scale.set(.5*M,.95*M,.5*M); } else { const s=Math.sin(now()/260)*.03; X.m.position.set(b.x,b.y+.95*M+Math.sin(now()/400)*.05*M,b.z); X.m.scale.set((.78+s)*M,(1.05-s)*M,(.78+s)*M); } }
    SHARED.stuck=me; };

  /* ---------- the mines: set on the ground, armed after a moment, set off by whoever steps on one (judged by the page that set it) ---------- */
  const mineMesh=()=>{ const g=MAKE.w_mine(); HELD.pop(); g.traverse(o=>{ o.raycast=()=>{}; o.userData.arms=1; o.userData.wield=0; }); g.lamp=g.children[2]; g.userData.anyRoom=1; scene.add(LEVELS.own(g,'*')); return g; };
  const placeMine=()=>{ '@later'; const h=SHARED.heading, x=pos.x+Math.sin(h)*.9*M, z=pos.z+Math.cos(h)*.9*M, gg=gy(x,z), y=gg>-1e8&&Math.abs(gg-SHARED.py)<.6*M?gg:SHARED.py;
    const mine=A.mines.filter(q=>q.who==='me'); if(mine.length>=3)dropMine(mine[0]); const q={i:++A.mi,who:'me',x,y,z,t:0,clear:false,m:mineMesh()}; q.m.position.set(x,y-.03*M,z); A.mines.push(q); hear('clunk',1.2,.5,x,z);
    if(ONLINE.on)ONLINE.send({t:'arm',k:'mine',i:q.i,p:[+x.toFixed(2),+y.toFixed(2),+z.toFixed(2)]}); };
  const dropMine=q=>{ q.m.removeFromParent(); A.mines.splice(A.mines.indexOf(q),1); };
  const mineTick=(dt,L)=>{ if(!A.mines.length)return; for(let i=A.mines.length-1;i>=0;i--){ const q=A.mines[i]; q.t+=dt; const armed=q.t>1.5;
      q.m.lamp.visible=armed?(now()/300|0)%2===0:true; if(q.t>300||q.who!=='me'&&!ONLINE.others.has(q.who)){ dropMine(q); continue; }
      if(q.who!=='me'||!armed||!L)continue;
      for(const b of L){ const d=Math.hypot(b.x-q.x,b.z-q.z), dy=Math.abs(b.y-q.y); if(b.id==='me'&&!q.clear){ if(d>1.2*M)q.clear=true; continue; } if(d<.6*M&&dy<1*M){ dropMine(q); boom('w_mine',new V3(q.x,q.y+.1*M,q.z),true,'ground'); if(ONLINE.on)ONLINE.send({t:'arm',k:'boom',w:'w_mine',i:q.i,p:[+q.x.toFixed(2),+q.y.toFixed(2),+q.z.toFixed(2)]}); break; } } } };

  /* ---------- the portals: blue then orange on open ground; step in one, come out of the other (anyone's pair) ---------- */
  const PCOL=[0x3aa8ff,0xff8a20], poG=new THREE.CircleGeometry(.62,32).rotateX(-Math.PI/2), prG=new THREE.TorusGeometry(.62,.06,6,32).rotateX(Math.PI/2);
  const poMesh=c=>{ const g=new THREE.Group(), d=new THREE.Mesh(poG,new THREE.MeshBasicMaterial({color:PCOL[c],transparent:true,opacity:.55,depthWrite:false,toneMapped:false})), r=new THREE.Mesh(prG,new THREE.MeshBasicMaterial({color:PCOL[c],toneMapped:false}));
    g.add(d,r); g.scale.setScalar(M); g.traverse(o=>{ o.raycast=()=>{}; o.userData.arms=1; }); g.userData.anyRoom=1; scene.add(LEVELS.own(g,'up')); return g; };
  const portalSet=(who,c,x,y,z)=>{ let pr=A.portals.get(who); if(!pr)A.portals.set(who,pr=[null,null]); if(pr[c])pr[c].m.removeFromParent(); pr[c]={x,y,z,m:poMesh(c),t:0}; pr[c].m.position.set(x,y+.03*M,z); sparks(x,y+.2*M,z,24,PCOL[c],3,.5); hear('laser',.5,.5,x,z); };
  const portalShot=(S)=>{ '@later'; const h=trace(S.tip,S.dir,W.w_portal.rng*M); tracer(S.tip,h.p,PCOL[A.pc],.02,.15);
    if(!out()||h.what!=='ground'){ say('A PORTAL ONLY OPENS ON OPEN GROUND OUTSIDE.','#c8a090'); return; }
    const c=A.pc; A.pc^=1; portalSet('me',c,h.p.x,h.p.y,h.p.z); if(ONLINE.on)ONLINE.send({t:'arm',k:'portal',c,p:[+h.p.x.toFixed(2),+h.p.y.toFixed(2),+h.p.z.toFixed(2)]}); };
  const portalTick=dt=>{ if(!A.portals.size)return; let inAny=false;
    for(const [who,pr] of A.portals){ if(who!=='me'&&!ONLINE.others.has(who)){ for(const p of pr)if(p)p.m.removeFromParent(); A.portals.delete(who); continue; }
      for(const p of pr)if(p){ p.t+=dt; p.m.children[1].rotation.y+=dt*2; p.m.children[0].material.opacity=.45+.15*Math.sin(now()/200); if(rnd()<dt*14)SP.add(p.x+(rnd()-.5)*M,p.y+.05*M,p.z+(rnd()-.5)*M,0,(1+rnd())*M,0,PCOL[pr.indexOf(p)],.6,{g:0,dr:0}); }
      if(!pr[0]||!pr[1]||!out()||VIT.dead||RAG.on)continue;
      for(let c=0;c<2;c++){ const a=pr[c], b=pr[1-c], d=Math.hypot(pos.x-a.x,pos.z-a.z); if(d<1*M&&Math.abs(SHARED.py-a.y)<1.2*M)inAny=true;
        if(d<.5*M&&Math.abs(SHARED.py-a.y)<1.2*M&&!A.inP){ A.inP=true; sparks(a.x,a.y+M,a.z,30,PCOL[c],3,.5); UI.goTo(b.x,b.z,b.y); sparks(b.x,b.y+M,b.z,30,PCOL[1-c],3,.5); hear('whoosh',1.4,.6); return; } } }
    if(!inAny)A.inP=false; };

  /* ---------- the leaf blower: a cone of air with leaves in it; it shoves people, knocks the characters over and blows loose things away ---------- */
  const LEAF=[0x8a6a2a,0xa8842a,0x6a8a2a,0xc8a040,0x7a4a1a];
  const blowTick=(dt,L)=>{ const g=WIELD.held&&WIELD.held(), mine=WIELD.on==='w_blower'&&A.hold&&g&&!blocked();
    if(mine){ const S=A.bS||(A.bS={tip:new V3(),dir:new V3()}); if(tipOf(g,S)){ if(A.aim)S.dir.copy(A.aim).normalize(); else if(WIELD.ray){ const r=WIELD.ray, c=r.origin, d=r.direction; let t=d.y<-1e-3?(SHARED.py-c.y)/d.y:20*M; if(!(t>0)||t>30*M)t=20*M; const v=c.clone().addScaledVector(d,t).sub(S.tip); if(v.lengthSq()>.01*M*M)S.dir.copy(v.normalize()); } const B=A.blows.get('me')||{}; B.tip=S.tip; B.dir=S.dir; B.at=now(); A.blows.set('me',B); } }
    else A.blows.delete('me');
    const k=mine?'1':''; if(ONLINE.on&&(k!==A.sent||k&&now()-A.sentT>160)){ A.sent=k; A.sentT=now(); const b=A.blows.get('me'), r=v=>Math.round(v*100)/100; ONLINE.send(b?{t:'arm',k:'blow',on:1,v:[r(b.dir.x),r(b.dir.y),r(b.dir.z)]}:{t:'arm',k:'blow',on:0}); }
    if(!A.blows.size)return; const R=W.w_blower.rng*M;
    for(const [id,B] of A.blows){ if(id!=='me'){ if(now()-B.at>2500){ A.blows.delete(id); continue; } const tg=WIELD.theirG&&WIELD.theirG(id); if(!tg)continue; const S={tip:new V3(),dir:new V3()}; if(!tipOf(tg,S))continue; B.tip=S.tip; if(!B.dir)B.dir=S.dir; }
      B.eA=(B.eA||0)+dt*70; while(B.eA>=1){ B.eA-=1; const s=(9+rnd()*5)*M, j=.22; BT.add(B.tip.x,B.tip.y,B.tip.z,(B.dir.x+(rnd()-.5)*j)*s,(B.dir.y+(rnd()-.5)*j)*s+.5*M,(B.dir.z+(rnd()-.5)*j)*s,LEAF[Math.floor(rnd()*LEAF.length)],.9+rnd()*.5,{g:.25,dr:2.2,bo:.2}); }
      if(rnd()<dt*8)FLAME.puff(B.tip.x+B.dir.x*.6*M,B.tip.y+B.dir.y*.6*M,B.tip.z+B.dir.z*.6*M,.5,1);
      if((B.sT=(B.sT||0)-dt)<=0){ B.sT=.45; hear('wind',2.2,.35,B.tip.x,B.tip.z); }
      if(id!=='me'||!L)continue;
      if((B.hT=(B.hT||0)-dt)<=0){ B.hT=.4; for(const b of L){ if(b.id==='me')continue; const vx=b.x-B.tip.x, vy=b.y+M-B.tip.y, vz=b.z-B.tip.z, d=Math.hypot(vx,vy,vz); if(d>R||d<1e-3)continue; if((vx*B.dir.x+vy*B.dir.y+vz*B.dir.z)/d<.88)continue;
          const k=1-d/R; B.push=B.push||{}; B.push[b.id]=(B.push[b.id]||0)+1; affect(b,'w_blower',{d:0,kb:.6+k*1.2,dn:b.N?B.push[b.id]>=2:k>.7&&B.push[b.id]>=4},{x:B.tip.x,z:B.tip.z}); }
        for(let s=1;s<=3;s++){ const t=s/3*R; goods(B.tip.x+B.dir.x*t,B.tip.y+B.dir.y*t,B.tip.z+B.dir.z*t,1.1*M,3.5*M*(1.2-s/3),B.dir); } } } };

  /* ---------- what others' weapons do on your page: drawn as they fire, hurting nobody (their page judges) ---------- */
  const v3=a=>Array.isArray(a)?new V3(+a[0]||0,+a[1]||0,+a[2]||0):null;
  const armHeard=m=>{ const w=W[m.w], p=v3(m.p);
    if(m.k==='shot'&&w&&p&&Array.isArray(m.e)){ const ends=m.e.map(v3).filter(Boolean); const d=ends[0]?ends[0].clone().sub(p).normalize():new V3(0,0,1); for(const e of ends)impact(e,'wall',w.beam?0xff5040:0); flare(m.w,p,d,ends); return; }
    if(m.k==='proj'&&w&&p&&Array.isArray(m.v)){ const d=v3(m.v); if(d.lengthSq()<1e-4)return; launch(m.w,p,d.normalize(),m.id,false); return; }
    if(m.k==='mine'&&p){ const q={i:+m.i,who:m.id,x:p.x,y:p.y,z:p.z,t:0,m:mineMesh()}; q.m.position.set(p.x,p.y-.03*M,p.z); A.mines.push(q); return; }
    if(m.k==='boom'&&p){ const q=A.mines.find(q=>q.who===m.id&&q.i===+m.i); if(q)dropMine(q); boom('w_mine',p,false,'ground'); return; }
    if(m.k==='trap'&&m.to&&m.to!==ONLINE.me){ trap(m.to,m.s==='bubble'?'bubble':'net',Math.max(0,Math.min(6,+m.d||0))); return; }
    if(m.k==='portal'&&p){ portalSet(m.id,m.c?1:0,p.x,p.y,p.z); return; }
    if(m.k==='blow'){ if(!m.on){ A.blows.delete(m.id); return; } const d=v3(m.v); let B=A.blows.get(m.id); if(!B)A.blows.set(m.id,B={tip:new V3(),dir:new V3(0,0,1)}); B.at=now(); if(d&&d.lengthSq()>1e-4)B.dir=d.normalize(); } };

  /* ---------- firing yours ---------- */
  const blocked=()=>VIT.dead||VIT.out>0||RAG.on||SHARED.frozen>0||SHARED.stuck>0;
  const fire=id=>{ '@later'; const w=W[id]; if(!w||WIELD.on!==id)return; const t=now()/1000; if(w.k==='blow')return; if((A.cd[id]||0)>t)return; if(blocked())return;
    const g=WIELD.held&&WIELD.held(), S={tip:new V3(),dir:new V3()}; if(!tipOf(g,S))return; A.cd[id]=t+w.cd;
    if(w.k==='mine'){ placeMine(); return; }
    aimAt(S,(w.rng||30)*M);
    if(w.k==='gun'){ shoot(id,S,true); A.last={id,tip:S.tip.toArray(),dir:S.dir.toArray()}; return; }
    if(w.k==='portal'){ portalShot(S); return; }
    if(w.k==='proj'){ launch(id,S.tip,S.dir,'me',true); A.last={id,tip:S.tip.toArray(),dir:S.dir.toArray()}; if(ONLINE.on){ const r=v=>Math.round(v*1000)/1000; ONLINE.send({t:'arm',k:'proj',w:id,p:S.tip.toArray().map(v=>Math.round(v*100)/100),v:[r(S.dir.x),r(S.dir.y),r(S.dir.z)]}); } } };
  A.fire=fire;
  const pilots=new Map();
  SYS.add('life',dt=>{ dt=Math.min(dt||0,.1);
    if(A.hold&&WIELD.on&&W[WIELD.on]&&W[WIELD.on].auto&&W[WIELD.on].k==='gun')fire(WIELD.on);
    for(const g of HELD){ if(g.arm==='w_portal'&&g.core)g.core.color.setHex(PCOL[A.pc]); if(g.arm!=='w_molotov')continue; let s=pilots.get(g); const on=g.visible&&!!g.parent;
      if(on&&!s){ s=FLAME.add({kind:'candle',name:'molotov rag',x:0,y:0,z:0,w:.03*M,h:.07*M}); pilots.set(g,s); } if(s){ s.on=on; if(on){ const p=g.tipL.clone().applyMatrix4(g.matrix); s.x=p.x; s.y=p.y; s.z=p.z; s.a.position.copy(p); } } }
    const busy=A.P.length||A.mines.length||A.traps.size||A.blows.size||WIELD.on==='w_blower';
    const L=busy&&(A.P.some(P=>P.mine)||A.mines.some(q=>q.who==='me')||A.traps.size||A.blows.has('me')||WIELD.on==='w_blower')?bodies():null;
    projTick(dt); mineTick(dt,L); trapTick(dt,L?new Map(L.map(b=>[b.id,b])):A.traps.size?new Map(bodies().map(b=>[b.id,b])):null); blowTick(dt,L); portalTick(dt);
    SP.tick(dt); BT.tick(dt); fbTick(dt); },'146hc-arms');
  window.ARMSDBG=()=>({on:WIELD.on,W:IDS,owned:IDS.filter(id=>INV.items[id]),P:A.P.map(P=>({id:P.id,t:+P.t.toFixed(2),p:P.p.toArray().map(v=>+v.toFixed(2))})),mines:A.mines.map(q=>({who:q.who,t:+q.t.toFixed(1)})),portals:[...A.portals].map(([w,pr])=>[w,pr.map(p=>p&&[+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)])]),traps:[...A.traps].map(([id,X])=>[id,X.kind,+X.t.toFixed(1)]),stuck:SHARED.stuck,sparks:SP.L.length,bits:BT.L.length,blows:[...A.blows.keys()],last:A.last,M}); }
