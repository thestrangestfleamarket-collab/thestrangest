// THE DUNGEON SLIMES: the coloured slimes that roam the dungeon, fight and drop slime.
import {SHARED, THREE} from './003-shx.js';
import {SKIN} from './003a-skin.js';
import {FORAGE, INSPECT, INV, ITEMS, LEVELS, NPCS, ONLINE, pos, SFX, st, UI, VIT, W3, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {renderer, scene} from './004-main.js';
import {MAPG, MODS, SOL, SYS, TILE, ZU} from './006-map-pre.js';
import {RARITY} from './013a-rarity.js';
import {SKELGO} from './077-npc-skel.js';
import {CREATURES, CREATURESREADY} from './086-npc-fox.js';
import {GEMS} from './101-gems.js';
__CODE__("worker/dunmobs.js")
{ const D=MODS.dungeon; let M=null, Mp=null;
  const TIER={green:{c:0x5ce04a,hp:2,v:.9,dmg:0,s:1,loot:.25,sk:[-10,40],nm:'GREEN',p:4,see:0},blue:{c:0x3fa2ff,hp:3,v:1.1,dmg:.03,s:1.06,loot:.35,sk:[0,50],nm:'BLUE',p:8,see:3},
    purple:{c:0xb058ff,hp:5,v:1.3,dmg:.05,s:1.14,loot:.45,sk:[15,65],nm:'PURPLE',p:15,see:3.6},red:{c:0xff4434,hp:7,v:1.5,dmg:.07,s:1.24,loot:.6,sk:[30,80],nm:'RED',p:25,see:4.2}};
  INSPECT.kinds.push({is:id=>/^slime_/.test(id)&&!!TIER[id.slice(6)],make:id=>{ const g=INSPECT.shape('bottle',0xd8e8e0); g.add(INSPECT.part('cyl',TIER[id.slice(6)].c,0,.08,0,.052,.15,.052,0,0,1)); return g; }});
  FORAGE.add({names:Object.fromEntries(Object.keys(TIER).map(k=>['slime_'+k,'BOTTLE OF '+TIER[k].nm+' SLIME'])),prices:Object.fromEntries(Object.keys(TIER).map(k=>['slime_'+k,TIER[k].p]))});
  const STRIKES=(()=>{ const STR=/jab|cross|upper|hook|slap|punch|kick|sweep|round/i, T=TILE; let last=null, swT=0, swAt=0, swing={}, fr=-1, cache=[];   // your strikes, read by every mob system (the dungeon's, the cave's golems, the sparring ring): one list a frame, the same for every reader
    SYS.add('strike',()=>{ const now=performance.now(); if(WIELD.sword&&now-swT>150){ swT=now; swing=WIELD.swing||{}; swAt=now+(swing.heavy?140:90); } },'146b-dunmobs');
    let paid=null; SYS.add('life',()=>{ const s=(st.up&&STR.test(st.up.name)&&st.up)||(st.move&&STR.test(st.move.name)&&st.move); if(!s){ paid=null; return; } if(s===paid)return; paid=s;   // a punch or kick costs stamina; winded, it lands weak
      s.winded=VIT.sta<.08; VIT.spend(/kick|sweep|round/i.test(s.name)?.07:.04); VIT.inFight(5); },'146b-dunmobs');
    const strikes=()=>{ const f=renderer.info.render.frame; if(f===fr)return cache; fr=f; const out=cache=[], s=(st.up&&STR.test(st.up.name)&&st.up)||(st.move&&STR.test(st.move.name)&&st.move);
      if(s&&s!==last&&s.t>=.08){ last=s; const k=/kick|sweep|round/i.test(s.name); out.push({r:(k?1.15:1)*T,d:(k?1.5:1)*(s.winded?.6:1)}); }
      if(swAt&&performance.now()>=swAt){ swAt=0; if(WIELD.sword){ const h=!!swing.heavy, d=(+ITEMS.prop(WIELD.on,'damage')||2)*(h?1.5:1)*(swing.winded?.6:1); out.push({r:(h?1.8:1.55)*T,d,kb:h?1.8:1,sk:'sword',heavy:h,ax:swing.ax,az:swing.az}); } } return out; };
    const inCone=(s,x,z,y,rad)=>{ const dx=x-pos.x, dz=z-pos.z, d=Math.hypot(dx,dz); if(Math.abs(y-SHARED.py)>1.4*T||d>s.r+rad)return false; const a=Math.hypot(s.ax||0,s.az||0), fx=a>.1?s.ax/a:Math.sin(SHARED.heading), fz=a>.1?s.az/a:Math.cos(SHARED.heading); return d<.35*T||(dx*fx+dz*fz)/d>.3; };   // a blade cuts where it was aimed
    const strength=s=>(1+(FORAGE.sk(s&&s.sk||'fight')||0)/100)*FORAGE.dmgK(), landed=s=>{ if(s)FORAGE.use(s.sk||'fight',-10,70); };   // a blow that lands teaches SWORDSMANSHIP or MARTIAL ARTS
    return {strikes,inCone,strength,landed}; })(); window.STRIKES=STRIKES;
  const init=()=>{ '@dungeon'; const T=TILE, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, say=SAY, G=new THREE.Group(), PK=new THREE.Group(); PK.visible=false; MAPG.dungeon.add(G); scene.add(LEVELS.own(PK,'dungeon'));
  const MIX={1:{green:.7,blue:.3},2:{green:.3,blue:.5,purple:.2},3:{blue:.4,purple:.4,red:.2},4:{purple:.5,red:.5},5:{purple:.2,red:.8}};
  const tierAt=n=>{ const W=MIX[Math.min(5,Math.max(1,n))]; let r=Math.random(); for(const k in W)if((r-=W[k])<0)return k; return Object.keys(W).pop(); };
  const F=()=>1+.35*(lvl-1), see=()=>2.6+.5*lvl;   // deeper: tougher, harder hitting, quicker to notice you
  const LOOT={green:[['$',1,3,7],['quartz',0,0,3]],blue:[['$',2,6,5],['quartz',0,0,2],['amethyst',0,0,2]],
    purple:[['$',5,12,4],['amethyst',0,0,2],['geode',0,0,2],['amber',0,0,1],['m_chanterelle',0,0,1]],
    red:[['$',10,25,4],['moonstone',0,0,2],['opal',0,0,2],['emerald',0,0,1]],spider:[['$',4,12,5],['amethyst',0,0,2],['emerald',0,0,1]],
    bone:[['$',3,9,6],['quartz',0,0,2],['amethyst',0,0,2],['geode',0,0,1]],gold:[['$',20,40,3],['sapphire',0,0,1],['ruby',0,0,1]]};
  const GC={quartz:0xf4f0ff,amethyst:0xb070ff,geode:0x9a8a7a,amber:0xf0a030,moonstone:0xd8e8ff,opal:0xffe8f4,emerald:0x30d070,sapphire:0x3060ff,ruby:0xff2040,p_refresh:0x58d8e8,p_heal:0xe84848,p_str:0xe8a030,m_chanterelle:0xe08a2a};
  for(const id in GC)ITEMS.reg(id,{color:'#'+GC[id].toString(16).padStart(6,'0')});   // the loot's colours are the item model's (the bag's pictures read them)
  const SKL={2:['skeleton_guard_light','Minion'],3:['skeleton_guard_light','skeleton_guard_heavy','Minion'],4:['skeleton_guard_heavy','skeleton_mage','Warrior','Rogue'],5:['skeleton_reaper','skeleton_mage','Warrior','Mage','Gold']};
  const SST={ogre:[4,.05],ogre_mage:[3,.05],ogre_guard_light:[4,.06],ogre_guard_heavy:[5,.07],spider:[3,.05],skeleton_guard_light:[3,.06],skeleton_guard_heavy:[5,.08],skeleton_mage:[3,.06],skeleton_reaper:[6,.1],Minion:[3,.05],Warrior:[5,.08],Rogue:[3,.05],Mage:[3,.06],Gold:[9,.1]}, KK=['Minion','Warrior','Rogue','Mage','Gold'];
  const OGRE=['ogre','ogre_mage','ogre_guard_light','ogre_guard_heavy'];
  const nameOf=id=>id==='$'?'COINS':GEMS.find(g=>g[0]===id)?GEMS.find(g=>g[0]===id)[1]:id.startsWith('m_')?FORAGE.MU[id.slice(2)][0]:(FORAGE.RC.find(r=>r[0]===id)||[0,id])[1];
  const sfx=(k,o)=>{ SFX.play(k,o); };
  const SD=CREATURES.Slime, g0=SKIN.geom(SD.mesh,false); g0.deleteAttribute('sh'); g0.computeBoundingBox(); g0.translate(0,-g0.boundingBox.min.y,0);
  { const P=g0.attributes.position.array, R=g0.attributes.reg.array, n=P.length/3, C=new Float32Array(n*3), h=(x,y,z)=>{ const v=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5; return v-Math.floor(v); };
    for(let i=0;i<n;i++){ const x=P[i*3], y=P[i*3+1], z=P[i*3+2], q=y/SD.tall, b=h(Math.floor(x*5),Math.floor(y*5),Math.floor(z*5))>.82, v=R[i]>.5?.03:b?1:q>.8?.95:.62+.22*q; C[i*3]=C[i*3+1]=C[i*3+2]=v; }
    g0.setAttribute('color',new THREE.BufferAttribute(C,3)); g0.computeVertexNormals(); }
  const mat=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:W3.GP});
  mat.onBeforeCompile=s=>{ s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=diffuseColor.rgb*.42;'); }; mat.customProgramCacheKey=()=>'slime';
  const NS=8, IM=new THREE.InstancedMesh(g0,mat,NS), GL=new THREE.InstancedMesh(new THREE.CircleGeometry(1,12).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({transparent:true,opacity:.3,depthWrite:false,blending:THREE.AdditiveBlending}),NS);
  for(const m of [IM,GL]){ m.frustumCulled=false; m.count=0; m.castShadow=false; G.add(m); } IM.receiveShadow=true;
  const H0=.42/.84*T, S0=H0/SD.tall, SY=ZU*24/TILE, m4=new THREE.Matrix4(), q4=new THREE.Quaternion(), UP=new THREE.Vector3(0,1,0), v3=new THREE.Vector3(), s3=new THREE.Vector3(), col=new THREE.Color(), WH=new THREE.Color(0xffffff);
  const HB=new THREE.BoxGeometry(.6*T,.4*T,.6*T), HM=new THREE.MeshBasicMaterial({visible:false}), CG=new THREE.CylinderGeometry(.07*T,.07*T,.025*T,8), OG=new THREE.OctahedronGeometry(.07*T,0), PG=new THREE.BoxGeometry(.06*T,.11*T,.06*T), LM={};
  let lvl=0, L=null, AR=null, slimes=[], things=[], RES=null, bolts=[], SPI=[], TR=[], plan=null;   // AR: an arena elsewhere (the holodeck's hall) running the slimes instead of a dungeon level
  const grp=()=>AR?AR.G:MAPG.dungeon, gnd=(x,z)=>AR?AR.ground(x,z):D.ground(x,z), lvOf=()=>AR?AR.lv:'down';
  const lane=()=>{ if(AR)return AR.lane; const R=L.R; return {x0:X(R.x0+.9),x1:X(R.x1-.9),z0:Z(R.y0+.9),z1:Z(R.y1-.9)}; };
  const inR=(S,x,z,m)=>S&&x>X(S.x0-m)&&x<X(S.x1+m)&&z>Z(S.y0-m)&&z<Z(S.y1+m);
  const free=(x,z,R)=>{ if(!L&&!AR)return false; const A=lane(); if(!(x>A.x0&&x<A.x1&&z>A.z0&&z<A.z1)||!AR&&(inR(L.up,x,z,.5)||inR(L.dn,x,z,.5)))return false; return !(AR?AR.sol:SOL.down).some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R)&&!TR.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R); };
  const crowd=(x,z,R,me)=>slimes.some(o=>o!==me&&!o.dead&&Math.hypot(o.x-x,o.z-z)<R+.24*T*TIER[o.k].s)||NPCS.some(q=>q!==me&&q.lv===lvOf()&&!q.far&&q.mode!=='hidden'&&q.g.parent===grp()&&q.blocks(x,z,R));   // no creature walks through another
  const spot=(R,away)=>{ const A=lane(); for(let k=0;k<80;k++){ const x=A.x0+Math.random()*(A.x1-A.x0), z=A.z0+Math.random()*(A.z1-A.z0); if(free(x,z,R)&&away.every(p=>!p||Math.hypot(p.x-x,p.z-z)>3.5*T))return {x,z}; } return {x:(A.x0+A.x1)/2,z:(A.z0+A.z1)/2}; };
  const near=(x,z,r0,r1,R)=>{ for(let k=0;k<12;k++){ const a=Math.random()*Math.PI*2, r=r0+Math.random()*(r1-r0), p={x:x+Math.sin(a)*r,z:z+Math.cos(a)*r}; if(free(p.x,p.z,R))return p; } return null; };
  const unthing=th=>{ const i=UI.things.indexOf(th); if(i>=0)UI.things.splice(i,1); const j=things.indexOf(th); if(j>=0)things.splice(j,1); th.obj.removeFromParent(); if(th.vis)th.vis.removeFromParent(); };
  const thing=(name,x,z,act,vis)=>{ const hb=new THREE.Mesh(HB,HM); hb.position.set(x,gnd(x,z)+.15*T,z); G.add(hb); if(vis)G.add(vis); const th={name,pick:true,obj:hb,vis,reach:.9*T,near:1.6*T,tall:.35*T,act:()=>act(th)}; UI.thing(th); things.push(th); return th; };
  const roll=k=>{ const t=LOOT[k], w=t.reduce((a,e)=>a+e[3],0); let r=Math.random()*w; for(const e of t)if((r-=e[3])<0)return GEMS.TIER&&GEMS.TIER[e[0]]==='s'&&!RARITY.open('gem')?t.find(x=>x[0]==='$')||e:e; return t[0]; };   // a super-rare stone waits for your rank with the Scuba Diver
  const UPT={green:'blue',blue:'purple',purple:'red',red:'red',bone:'red',spider:'red',gold:'gold'};
  const xp=(a,b)=>{ for(let i=0;i<lvl;i++)FORAGE.use('fight',a+(lvl-1)*6,b+(lvl-1)*6); };   // deeper kills teach more
  const loot=(k,p,x,z)=>{ const up=()=>Math.random()<.12*(lvl-1)?UPT[k]:k; if(Math.random()<Math.min(.95,p*(1+.25*(lvl-1))))drop(up(),x,z); if(Math.random()<.15*(lvl-1)+Math.max(FORAGE.sk('sword'),FORAGE.sk('fight'))/400)drop(up(),x,z); };   // a better fighter wins a little more from each
  const drop=(k,x,z)=>{ const e=roll(k), id=e[0], n=id==='$'?Math.round((e[1]+Math.floor(Math.random()*(e[2]-e[1]+1)))*F()):1, p=near(x,z,.3*T,.6*T,.05*T)||{x,z}, gy=D.ground(p.x,p.z);
    const m=new THREE.Mesh(id==='$'?CG:id.startsWith('p_')?PG:OG,LM[id]||(LM[id]=new THREE.MeshBasicMaterial({color:id==='$'?0xf2c14e:GC[id]||0xffffff})));
    m.position.set(p.x,gy+(id==='$'?.02:id.startsWith('p_')?.06:.08)*T,p.z); m.rotation.y=Math.random()*3;
    const nm=id==='$'?n+' COINS':nameOf(id);
    thing(id==='$'?'COINS ($'+n+')':'A LOOSE '+nm,p.x,p.z,th=>{ if(id==='$'){ INV.cash+=n; say('YOU PICK UP $'+n+'.','#f2c14e'); } else{ (GEMS.some(g=>g[0]===id)?INV.add:FORAGE.give)(id,1); say('YOU PICK UP THE '+nm+'.','#f2c14e'); }
      sfx('clunk',{vol:.4,pitch:1.6}); unthing(th); FORAGE.draw(); },m); };
  const goo=S=>{ const t=TIER[S.k]; S.th=thing(t.nm+' SLIME',S.x,S.z,th=>{ if(!FORAGE.has('bottle'))return say('YOU NEED A BOTTLE TO HOLD THE SLIME.','#c8a090');
    FORAGE.take('bottle',1); FORAGE.give('slime_'+S.k,1); say('YOU SCOOP THE '+t.nm+' SLIME INTO A BOTTLE.','#b8f0a0'); sfx('drip',{vol:.5,pitch:.7}); unthing(th); S.gone=true; FORAGE.draw(); }); };
  const prize=(w,tk,x,z,S)=>{ if(w==='s'){ const t=TIER[tk]; if(!t)return; xp(t.sk[0],t.sk[1]); if(!AR){ goo(S||{k:tk,x,z}); loot(tk,t.loot,x,z); } SYS.run('slain',{kind:'slime',lvl,sim:!!AR}); return; }   // your kill: what it teaches and drops
    xp(10+lvl*8,60+lvl*8); const k=tk==='Gold'?'gold':tk==='spider'?'spider':'bone'; loot(k,.6,x,z); if(tk==='Gold')drop('gold',x,z); SYS.run('slain',{kind:k==='bone'?'guard':k,lvl}); };
  const {strikes,inCone,strength}=STRIKES;
  const resolve=()=>{ if(!RES){ RES=[]; for(const N of NPCS){ const k=N.key, lv=OGRE.includes(k)?[1]:Object.keys(SKL).filter(n=>SKL[n].includes(k)).map(Number);
      if(!lv.length||KK.includes(k)&&!(window.GUARDX&&(GUARDX.GUARDS.includes(N)||k==='Gold')))continue; if(RES.some(r=>r.N===N))continue;
      RES.push({N,key:k,lv,kk:KK.includes(k),ogre:OGRE.includes(k),v0:N.st.v,hp:0,style:N.guard?N.guard.style:{hit:'Unarmed_Melee_Attack_Punch_A',reach:.65,at:.38}}); } } return RES; };
  const park=r=>{ const N=r.N; PK.add(N.g); N.st.to=null; N.st.hold=true; N.alert=false; r.on=false; };
  const place=(r,used)=>{ const N=r.N, st=N.st, p=spot(st.R,[L.atUp,L.atDn,...used]); used.push(p); st.x=p.x; st.z=p.z; st.to=null; st.face=null; st.hold=true; st.sx=st.sz=0; N.free=(x,z,R)=>free(x,z,R)&&!slimes.some(o=>!o.dead&&Math.hypot(o.x-x,o.z-z)<R+.24*T); N.alert=false;
    N.g.position.set(st.x,D.ground(st.x,st.z),st.z); MAPG.dungeon.add(N.g); N.me.rotation.x=0; N.me.position.y=0; if(r.kk&&N.an)N.an.clear();
    const S0_=SST[r.key]; Object.assign(r,{on:true,dead:false,agg:false,act:0,cool:1+Math.random(),w:Math.random()*2,lunge:null,jolt:0,hp:Math.ceil((S0_?S0_[0]:3)*F()),dmg:(S0_?S0_[1]:.05)*F(),t:0}); };
  const toxic=g=>{ if(g.index)g=g.toNonIndexed(); const p=g.attributes.position.array, c=g.attributes.color.array, n=p.length/3, U8=c instanceof Uint8Array; let lo=1e9, hi=-1e9; for(let i=0;i<n;i++){ lo=Math.min(lo,p[i*3+1]); hi=Math.max(hi,p[i*3+1]); }   // radioactive: black-green with glowing lime spots
    for(let t=0;t<n/3;t++){ let x=0, y=0, z=0; for(let k=0;k<3;k++){ x+=p[(t*3+k)*3]; y+=p[(t*3+k)*3+1]; z+=p[(t*3+k)*3+2]; } const q=(y/3-lo)/(hi-lo||1), h=Math.abs(Math.sin(x*91.3+z*47.1+y*13.7)*43758.5)%1;
      const o=q>.5&&h>.7?[170,255,70]:q>.4?[34,64,26]:h>.86?[120,220,60]:[22,34,20]; for(let k=0;k<3;k++)for(let j=0;j<3;j++)c[(t*3+k)*3+j]=U8?o[j]:o[j]/255; }
    g.attributes.color.needsUpdate=true; return g; };
  const GLOW=new THREE.MeshBasicMaterial({color:0x7dff3a,transparent:true,opacity:.3,depthWrite:false,blending:THREE.AdditiveBlending}), GLG=new THREE.CircleGeometry(.42*T,12).rotateX(-Math.PI/2);
  const mkSpiders=async()=>{ if(SPI.length||!window.LOAD&&!window.CREATNEW)return; if(window.LOAD)await LOAD('later'); if(SPI.length)return;
    for(let i=0;i<4;i++){ const N=window.CREATNEW('Spider','spider',.55,{paint:toxic,npc:{lv:'down',group:'dungeon',free:(x,z,R)=>free(x,z,R),ground:(x,z)=>D.ground(x,z),speed:1.6,radius:.16}});
      N.name='RADIOACTIVE SPIDER'; const gl=new THREE.Mesh(GLG,GLOW); gl.position.y=.02*T; N.g.add(gl); N.clip='Spider_Idle';
      const r={N,key:'spider',lv:[],kk:false,spider:true,v0:1.4*T,hp:0,style:{hit:'',reach:.6,at:.38}}; SPI.push(r); park(r); } };
  const draw=()=>{ slimes.forEach((S,i)=>{ const t=TIER[S.k], s=S0*t.s; let sx=1, sy=1, y=0;
      if(S.dead){ const u=Math.min(1,S.pop/.28); sx=u<.4?1+u*.8:1.32+(u-.4)*.4; sy=u<.4?1+u*.5:Math.max(.13,1.2-(u-.4)*1.8); }
      else if(S.air>0){ const u=S.ph; if(u<.2){ sy=1-u*1.2; sx=1+u*.6; } else if(u<.8){ const a=(u-.2)/.6; y=Math.sin(Math.PI*a)*.34*T; sy=1.12-.12*Math.abs(a-.5)*2; sx=.94; } else{ const a=(u-.8)/.2; sy=.78+.22*a; sx=1.12-.12*a; } }
      q4.setFromAxisAngle(UP,S.h-Math.PI/2); m4.compose(v3.set(S.x,gnd(S.x,S.z)+y,S.z),q4,s3.set(s*sx,s*SY*sy,s*sx));
      if(S.gone)s3.set(0,0,0); IM.setMatrixAt(i,m4.compose(v3,q4,s3)); col.setHex(t.c); if(S.flash>0)col.lerp(WH,.7); IM.setColorAt(i,col);
      const gr=(S.dead?.5:.42)*T*t.s*(S.gone?0:1); m4.compose(v3.set(S.x,gnd(S.x,S.z)+.012*T,S.z),q4.identity(),s3.set(gr,1,gr)); GL.setMatrixAt(i,m4); col.setHex(t.c).multiplyScalar(S.dead?.6:1); GL.setColorAt(i,col); });
    for(const m of [IM,GL]){ m.instanceMatrix.needsUpdate=true; if(m.instanceColor)m.instanceColor.needsUpdate=true; } };
  const pawnTick=(r,dt)=>{ const me=r.N.me, N=r.N; let x=0;
    if(r.spider){ const c=r.dead?'Spider_Death':r.lunge?'Spider_Attack':r.jolt>0?'Spider_Hit':null; if(c){ if(N.clip!==c)N.clipN=(N.clipN||0)+1; N.clip=c; N.clipK=1; }   // its own clips: the strike, the flinch, curling up on its back
      if(r.dead){ r.t+=dt; me.position.y=-Math.max(0,r.t-1.8)*.6; if(r.t>2.6)park(r); return; }
      if(r.jolt>0)r.jolt-=dt;
      if(r.lunge){ const l=r.lunge; l.t+=dt; if(!l.done&&l.t>=.3){ l.done=true; l.hit(); } if(l.t>.8)r.lunge=null; }
      return; }
    if(r.dead){ r.t+=dt; x=Math.min(Math.PI/2,r.t*4); me.rotation.x=x; me.position.y=-Math.max(0,r.t-.5)*.6; if(r.t>1.3)park(r); return; }
    if(r.jolt>0){ r.jolt-=dt; x=-r.jolt*1.2; }
    if(r.lunge){ const l=r.lunge; l.t+=dt; x=l.t<.4?-l.t*.6:l.t<.55?-.24+(l.t-.4)*4.6:Math.max(0,.45-(l.t-.55)*1.5); if(!l.done&&l.t>=.5){ l.done=true; l.hit(); } if(l.t>.9)r.lunge=null; }
    me.rotation.x=x; };
  const shoot=(r,col)=>{ const N=r.N, m=new THREE.Mesh(new THREE.BoxGeometry(.06*T,.06*T,.3*T),new THREE.MeshBasicMaterial({color:new THREE.Color(...col),toneMapped:false})), y=N.g.position.y+N.H*.55;
    m.position.set(N.st.x,y,N.st.z); G.add(m); const to=new THREE.Vector3(pos.x,SHARED.py+.9*T,pos.z); m.lookAt(to); bolts.push({m,to,dmg:r.dmg,from:{x:N.st.x,z:N.st.z}}); };
  const boltTick=dt=>{ for(const b of [...bolts]){ const d=b.to.clone().sub(b.m.position), l=d.length(), stp=11*T*dt;
    if(l<=stp){ b.m.removeFromParent(); b.m.geometry.dispose(); b.m.material.dispose(); bolts.splice(bolts.indexOf(b),1);  } else b.m.position.addScaledVector(d,stp/l); } };
  // the monsters are the dungeon's, one for everyone (owner, 7 Nov 2026: "this is an mmorpg and all things should be shared"): the section's server runs them (worker/dunmobs.js), the page runs the same off the website; here they are drawn, struck and felt
  const MS=MOBSIM.make(), STY={}; let remote=false, heardV=null, GB=null, pic=null;
  const hash=t=>{ let h=5381; for(let i=0;i<t.length;i++)h=(h*33+t.charCodeAt(i))|0; return (h>>>0).toString(36); };
  const bake=async()=>{ if(window.LOAD&&!(window.GUARDX))await SKELGO().catch(()=>{}); RES=null; const R=resolve(), have=new Set(R.map(r=>r.key));
    for(const r of R)STY[r.key]={reach:r.style.reach||.8,ranged:r.style.bolt?1:0};
    const guards={}; for(let n=1;n<=5;n++)guards[n]=(n===1?OGRE:SKL[n]||[]).filter(k=>have.has(k));
    const rooms=D.rooms.filter(r=>!r.c).map(r=>{ const L=D.lay(r.k), Rr=L.R, ln=[X(Rr.x0+.9),Z(Rr.y0+.9),X(Rr.x1-.9),Z(Rr.y1-.9)], lo=[Math.min(ln[0],ln[2]),Math.min(ln[1],ln[3]),Math.max(ln[0],ln[2]),Math.max(ln[1],ln[3])];
      const inl=b=>b[2]>lo[0]&&b[0]<lo[2]&&b[3]>lo[1]&&b[1]<lo[3], block=SOL.down.filter(inl).map(b=>b.map(v=>+v.toFixed(2)));
      for(const h of L.hz)if(h.t!=='web')block.push([X(h.x0),Z(h.y0),X(h.x1),Z(h.y1)].map(v=>+v.toFixed(2)));
      return {k:r.k,n:L.n,safe:!!L.safe,lane:lo.map(v=>+v.toFixed(2)),block}; });
    const cat={tiers:Object.fromEntries(Object.entries(TIER).map(([k,t])=>[k,{hp:t.hp,dmg:t.dmg,v:t.v}])),mix:MIX,guards,stats:SST,styles:STY,kk:KK};
    const g={T,rooms,cat}; g.v=hash(JSON.stringify(g)); GB=g; MOBSIM.grid(MS,g); if(remote&&heardV!==g.v){ heardV=g.v; ONLINE.send({t:'mobgrid',g}); } };
  SYS.add('hi',m=>{ remote=true; heardV=m.mv||''; if(GB&&heardV!==GB.v){ heardV=GB.v; ONLINE.send({t:'mobgrid',g:GB}); } },'146b-dunmobs');
  ONLINE.hear.mobs=m=>{ if(remote)pic=m; };
  ONLINE.hear.mobhurt=m=>felt(m);
  ONLINE.hear.mobkill=m=>won(m);
  ONLINE.hear.mobres=m=>{ if(m.res==='blocked')say('IT BLOCKS YOUR BLOW.','#c8c2b0'); };
  const felt=e=>{ if(VIT.dead)return; if(VIT.hurt(+e.d||0,{x:+e.x||pos.x,z:+e.z||pos.z})===2){ if(remote)ONLINE.send({t:'mobpar',i:e.i}); else MOBSIM.parried(MS,e.i); } };   // parried on the beat: it staggers
  const won=e=>{ const n=e.n|0||lvl; const k=lvl; lvl=n; prize(e.w==='s'?'s':'r',e.w==='p'?'spider':e.key,+e.x||pos.x,+e.z||pos.z); lvl=k; };
  const strike=(id,s,m)=>{ const o={d:+(s.d*m).toFixed(3),kb:s.kb||1,heavy:!!s.heavy}; sfx(s.heavy?'clunk':'step',{vol:.5,pitch:1.5,vary:.2});
    if(remote){ ONLINE.send({t:'mobhit',i:id,d:o.d,kb:o.kb,hv:o.heavy?1:0}); return; }
    const r=MOBSIM.hit(MS,id,{...o,x:pos.x,z:pos.z}); if(r.res==='blocked')say('IT BLOCKS YOUR BLOW.','#c8c2b0'); else if(r.res==='dead')won({w:r.m.kind,key:r.m.key,x:r.m.x,z:r.m.z,n:r.n}); };
  // the picture: slimes as instances, guards and spiders as the dungeon's bodies, each kept on its monster's id
  const bodies=new Map(), seen={};
  const show=dt=>{ const want=new Set(), k=D.room, M_=pic?pic.m.filter(e=>e[1]===k):[]; let g=0, sp=0, sl=0;
    const keep=new Map(slimes.map(S=>[S.i,S])); slimes=[];
    for(const e of M_){ const [i,,kind,key,x,z,h,hp,mhp,dead,acts,hits,blks,tg]=e, was=seen[i]||{acts,hits,blks};
      if(kind==='s'){ sl++; let S=keep.get(i); if(!S)S={i,k:TIER[key]?key:'green',x,z,h,hp,dead:false,pop:0,air:0,ph:0,flash:0};
        const mv=Math.hypot(x-S.x,z-S.z); if(mv>1.5*T){ S.x=x; S.z=z; } else { S.x+=(x-S.x)*Math.min(1,dt*8); S.z+=(z-S.z)*Math.min(1,dt*8); }
        S.h=h; S.hp=hp; if(mv>.02*T&&!dead){ S.air=1; S.ph=(S.ph+dt/.62)%1; } else { S.air=0; S.ph=0; }
        if(hits>was.hits)S.flash=.12; if(dead&&!S.dead){ S.dead=true; S.pop=0; sfx('drip',{vol:.8,pitch:.45}); } if(S.flash>0)S.flash-=dt; if(S.dead&&S.pop<.28)S.pop+=dt; slimes.push(S); }
      else { kind==='p'?sp++:g++; let r=bodies.get(i); if(r&&!r.on)r=null;
        if(!r){ const pool=kind==='p'?SPI:resolve(); r=pool.find(q=>!q.on&&(kind==='p'||q.key===key)&&![...bodies.values()].includes(q)); if(!r){ if(kind==='p'&&!SPI.length)mkSpiders(); continue; } place(r,[]); const st=r.N.st; st.x=x; st.z=z; r.N.g.position.set(x,D.ground(x,z),z); bodies.set(i,r); }
        want.add(r); const N=r.N, st=N.st; r.hp=hp;
        if(Math.hypot(st.x-x,st.z-z)>1.5*T){ st.x=x; st.z=z; st.to=null; } else st.to=Math.hypot(st.x-x,st.z-z)>.05*T?{x,z}:null; st.v=r.v0*1.6; st.hold=!st.to;
        st.face=tg===ONLINE.me||tg==='me'?{x:pos.x,z:pos.z}:st.to?null:{x:x+Math.sin(h),z:z+Math.cos(h)};
        if(acts>was.acts&&!dead){ if(r.kk&&N.an)N.an.play(r.style.hit==='1H_Melee_Attack_Chop'&&Math.random()<.5?'1H_Melee_Attack_Slice_Diagonal':r.style.hit); else r.lunge={t:0,hit:()=>{}}; if(r.style.bolt&&(tg===ONLINE.me||tg==='me'))shoot(r,r.style.bolt); }
        if(hits>was.hits&&!dead){ if(r.kk&&N.an)N.an.play('Hit_A'); else { r.lunge=null; r.jolt=.25; } }
        if(blks>was.blks&&r.kk&&N.an){ N.an.play('Block'); sfx('clunk',{vol:.5,pitch:2.1}); }
        if(dead&&!r.dead){ r.dead=true; r.t=0; N.alert=false; st.to=null; st.hold=true; if(r.kk&&N.an)N.an.play('Death_A',{hold:true}); sfx('clunk',{vol:.6,pitch:.7}); } }
      seen[i]={acts,hits,blks}; }
    for(const [i,r] of bodies)if(!want.has(r)){ bodies.delete(i); if(r.on&&!r.dead)park(r); }
    for(const r of [...(RES||[]),...SPI])if(r.on){ if(!r.kk)pawnTick(r,dt); if(r.spider&&!r.lunge&&!(r.jolt>0)&&!r.dead){ r.N.clip=r.N.st.to?'Spider_Walk':'Spider_Idle'; r.N.clipK=1; } }
    IM.count=GL.count=Math.min(NS,slimes.length); plan=M_.length?{g,sp,sl}:plan; draw(); };
  const onLevel=k=>{ for(const th of [...things])unthing(th); for(const b of bolts){ b.m.removeFromParent(); b.m.geometry.dispose(); b.m.material.dispose(); } bolts=[];
    L=k?D.lay(k):null; lvl=L?L.n:0; if(!k){ pic=null; plan=null; slimes=[]; IM.count=GL.count=0; for(const [i,r] of bodies)park(r); bodies.clear(); for(const r of [...(RES||[]),...SPI])if(r.on)park(r); return; }
    if(!GB)bake(); if(L.safe)plan={g:0,sp:0,sl:0}; };
  const arena=()=>{};
  const tick=dt=>{ if(!lvl||!L)return; if(remote&&!ONLINE.on)remote=false; const alive=!VIT.dead&&SHARED.LVL==='down';
    if(!remote&&GB){ for(const e of MOBSIM.step(MS,dt,[{id:'me',x:pos.x,z:pos.z,ok:alive&&!SHARED.unseen}]))felt(e); pic=MOBSIM.snap(MS,new Set([D.room])); }
    const S=alive?strikes():[]; for(const s of S){ const m=strength(s);
      for(const sl of slimes)if(!sl.dead&&inCone(s,sl.x,sl.z,gnd(sl.x,sl.z),.2*T)){ sl.flash=.12; strike(sl.i,s,m); STRIKES.landed(s); }
      for(const [i,r] of bodies)if(r.on&&!r.dead&&inCone(s,r.N.st.x,r.N.st.z,r.N.g.position.y,.25*T)){ strike(i,s,m); STRIKES.landed(s); } }
    show(dt); boltTick(dt); };
  window.DUNMOBS={T,MS,get slimes(){ return slimes; },get res(){ return RES; },get remote(){ return remote; },get pic(){ return pic; },hit:(i,d=1)=>{ const S=slimes[i]; if(S)strike(S.i,{d},1); },things:()=>things};
  window.DUNSPI=()=>SPI;
  window.DUNMOBDBG=()=>({level:lvl,slimes:slimes.map(S=>({k:S.k,hp:S.hp,dead:S.dead,gone:!!S.gone,x:+(S.x/T).toFixed(1),z:+(S.z/T).toFixed(1)})),
    plan,traps:TR.length,res:[...(RES||[]),...SPI].filter(r=>r.on).map(r=>({k:r.key,hp:r.hp,dead:r.dead,agg:r.agg,x:+(r.N.st.x/T).toFixed(1),z:+(r.N.st.z/T).toFixed(1),in:r.N.g.parent===MAPG.dungeon})),things:things.map(t=>t.name),bolts:bolts.length,tris:slimes.length*(g0.index.count/3+12),arena:!!AR}); return {onLevel,tick,arena,wave:()=>{},alive:()=>slimes.filter(S=>!S.dead).length}; };
  const ensureInit=()=>Mp||(Mp=CREATURESREADY.then(()=>M||(M=init())));   // the slimes' mesh needs the creature data (lazy, loads just after the start), so init waits for it
  D.hook(n=>{ if(!n&&!M)return; ensureInit().then(m=>m.onLevel(n)); });
  // an arena elsewhere runs the slimes: {G, lane:{x0,z0,x1,z1}, sol:[rects], away:[{x,z}], ground(x,z), lv}; wave n of k slimes (tier and toughness by n, as the dungeon's levels)
  MODS.dunmobs={arena:async(A,n,k)=>{ if(window.LOAD)await LOAD('dungeon'); const m=await ensureInit(); m.arena(A,n,k); },wave:(n,k)=>M&&M.wave(n,k),off:()=>M&&M.arena(null),alive:()=>M?M.alive():0};
  SYS.add('life',(dt)=>{ if(M)M.tick(dt); },'146b-dunmobs'); }
