// THE BIRDS: BIRDS, the town's birds that hop, walk and fly, and that the player can catch.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, DRESS, FORAGE, INSPECT, INV, ITEMS, MAIL, NPCS, ONLINE, PARK, pos, ROOMS, SFX, UI, W3, WEEDS, WX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {SYS, TILE} from './006-map-pre.js';
import {RARITY} from './013a-rarity.js';
import {PARTSNPC} from './080-npc-parts.js';
import {FLORA} from './142a-flora.js';
import {GARDEN} from './144a-garden.js';
const BIRDS={list:[]}; window.BIRDS=BIRDS;
{ const T=TILE, WU=T/.84, say=SAY, use=FORAGE.use, KEY='birds', SPOT=new THREE.Vector3(), {shape,sph,cyl,box,blob}=PARTSNPC.T, VIS=1.5;
  const K=[['HOUSE SPARROW','Passer domesticus',.15,0,3,6,'hop',{body:0x8a6a4a,breast:0xb8ae9c,head:0x8a8a86,cap:0x6e6e70,mask:0x2a2622,wing:0x7a5232,bar:0xe8e0d0,tail:0x5a4632,beak:0x2a2622,leg:0xb08a70}],
    ['ROCK PIGEON','Columba livia',.32,5,4,3,'walk',{body:0x8a90a0,breast:0x6a7488,head:0x4a5868,mask:0x4a7a6a,wing:0x9aa0ae,bar:0x2a2a30,tail:0x6a7080,beak:0x3a3a3a,leg:0xc85050}],
    ['EUROPEAN STARLING','Sturnus vulgaris',.21,10,4,4,'walk',{body:0x1e2228,breast:0x26302a,head:0x1a1e24,wing:0x2a2a2a,bar:0xa89a6a,tail:0x1a1a1e,beak:0xe8c040,leg:0xb08a70}],
    ['AMERICAN ROBIN','Turdus migratorius',.25,15,6,4,'hop',{body:0x4a4a48,breast:0xd0682a,head:0x262624,wing:0x4e4c48,tail:0x2e2e2c,beak:0xe0b030,leg:0x8a6a50}],
    ['MOURNING DOVE','Zenaida macroura',.3,20,6,3,'walk',{body:0xb09a80,breast:0xc8a898,head:0xa8a090,wing:0xa08c74,bar:0x2a2420,tail:0x8a7a68,beak:0x2a2626,leg:0xc87878}],
    ['BLUE JAY','Cyanocitta cristata',.28,30,10,2.5,'hop',{body:0x4a7ad0,breast:0xe8ecf0,head:0x4a7ad0,crest:0x4a7ad0,mask:0x1a1a22,wing:0x3a6ad8,bar:0xf0f0f0,tail:0x3a68c8,beak:0x1a1a1a,leg:0x2a2a2a}],
    ['NORTHERN CARDINAL','Cardinalis cardinalis',.22,35,12,2,'hop',{body:0xc81e1e,breast:0xd82a22,head:0xd02020,crest:0xd02020,mask:0x101010,wing:0xa81818,tail:0xa01818,beak:0xf07030,leg:0x8a5a50}],
    ['BLACK-CAPPED CHICKADEE','Poecile atricapillus',.13,40,10,2,'hop',{body:0x8a8a88,breast:0xe8e0d0,head:0xf0f0ec,cap:0x141414,mask:0x141414,wing:0x6a6a6a,bar:0xe0e0e0,tail:0x5a5a5a,beak:0x141414,leg:0x3a3a3a}],
    ['NORTHERN MOCKINGBIRD','Mimus polyglottos',.25,45,14,1.5,'hop',{body:0x8a8c8e,breast:0xd8d8d4,head:0x8a8c8e,wing:0x3a3a3c,bar:0xf0f0f0,tail:0x2a2a2c,beak:0x1a1a1a,leg:0x2a2a2a}],
    ['RED-WINGED BLACKBIRD','Agelaius phoeniceus',.22,50,16,1.5,'walk',{body:0x121214,breast:0x121214,head:0x121214,wing:0x121214,bar:0xe02a1a,tail:0x121214,beak:0x121212,leg:0x2a2a2a}],
    ['BALTIMORE ORIOLE','Icterus galbula',.2,65,40,.3,'hop',{body:0xf08a1a,breast:0xf09a20,head:0x141414,wing:0x141414,bar:0xf0f0f0,tail:0xe08020,beak:0x6a6a70,leg:0x4a4a4a}],
    ['SCARLET TANAGER','Piranga olivacea',.18,75,60,.25,'hop',{body:0xe0201a,breast:0xe0201a,head:0xe0201a,wing:0x101010,tail:0x101010,beak:0x9a9a8a,leg:0x4a4a4a}],
    ['RED-TAILED HAWK','Buteo jamaicensis',.55,85,0,0,'walk',{body:0x6a4a30,breast:0xe8dcc8,head:0x5a4028,wing:0x5a3e28,bar:0xd8c8b0,tail:0xb8562a,beak:0x2a2622,leg:0xe8c040}]];
  const NK=K.length, HAWK=12, BOUNTY={10:40,11:60,12:80}, DIFF=k=>K[k][3], RARE=k=>k>=10;
  const NM={bseed:'BIRDSEED (A HANDFUL)',bnet:'BIRD NET',cage:'EMPTY BIRD CAGE',feeder:'BIRD FEEDER',binoc:'BINOCULARS',bird_feather:'A FEATHER',quill_pen:'A FEATHER QUILL'}, PR={bird_feather:2,quill_pen:9}; for(let k=0;k<NK;k++){ NM['bd_'+k]=K[k][0]+' (IN A CAGE)'; NM['pet_'+k]='YOUR TAME '+K[k][0]; PR['bd_'+k]=K[k][4]; }
  FORAGE.add({names:NM,prices:PR}); FORAGE.sell(...Object.keys(NM).filter(k=>/^bd_/.test(k)),'bird_feather'); FORAGE.BUYK.birds=['bd_']; const IV=(id,v)=>+ITEMS.prop(id,'value')||v; FORAGE.BUYK.birds.push('bird_feather','quill_pen');
  FORAGE.SELLS.push(['bseed',IV('bseed',1),()=>true],['bnet',IV('bnet',12),()=>!FORAGE.has('bnet')],['cage',IV('cage',5),()=>true]);
  // a quill from feathers: mending books goes better while you carry one
  FORAGE.HELP.push('BIRDING: double click a bird to watch it (your book), tame it with birdseed, or catch it (a bird net and a cage). Binoculars watch from afar; a feeder you hang brings them in; caught birds sometimes leave a feather.');
  const S={v:1,seen:{},feed:null}; try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1)Object.assign(S,D); }catch(e){} const save=()=>OWNED.set(KEY,JSON.stringify(S));
  const PART=[['body',[shape(blob(.2,.19,.4,8,5),[1,1,1],[0,.36,-.02])]],['breast',[shape(blob(.17,.17,.24,6,4),[1,1,1],[0,.31,.12])]],['head',[shape(blob(.15,.15,.16,6,4),[1,1,1],[0,.55,.3])]],
    ['cap',[shape(blob(.135,.07,.13,6,3),[1,1,1],[0,.64,.29])]],['crest',[shape(cyl(0,.07,.22,4),[1,1,1],[0,.72,.21],null,[-35,0,0])]],['mask',[shape(blob(.155,.09,.08,6,3),[1,1,1],[0,.5,.37])]],
    ['beak',[shape(cyl(0,.045,.15,4),[1,1,1],[0,.53,.49],null,[90,0,0])]],['eye',[-1,1].map(s=>shape(sph(.028,4,3),[1,1,1],[s*.125,.58,.37]))],
    ['tail',[shape(box(.17,.03,.26),[1,1,1],[0,.37,-.46],null,[15,0,0])]],['leg',[-1,1].map(s=>shape(cyl(.014,.014,.22,3),[1,1,1],[s*.06,.11,.02]))],
    ['wing',[shape(blob(.03,.13,.3,6,3),[1,1,1],[.02,-.11,-.14])],1],['bar',[shape(blob(.034,.03,.18,4,2),[1,1,1],[.026,-.13,-.1])],1]];
  const PIV=[.17,.47,.08], mat=new THREE.MeshLambertMaterial({flatShading:true,side:THREE.DoubleSide}), MAXI=48, ME={};
  const geo=(parts,mx)=>{ let n=0; for(const p of parts)n+=p.P.length; const P=new Float32Array(n); let o=0; for(const p of parts){ P.set(p.P,o); o+=p.P.length; } if(mx)for(let i=0;i<n;i+=3)P[i]=-P[i];
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(P,3)); g.computeVertexNormals(); return g; };
  const mk=g=>{ const me=new THREE.InstancedMesh(g,mat,MAXI); me.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(MAXI*3),3); me.count=0; me.frustumCulled=false; me.castShadow=true; me.receiveShadow=true; me.raycast=()=>{}; scene.add(me); return me; };
  for(const [nm,parts,w] of PART){ if(w){ ME[nm+'R']=mk(geo(parts)); ME[nm+'L']=mk(geo(parts,1)); } else ME[nm]=mk(geo(parts)); }
  BIRDS.make=k=>{ '@later'; const P=K[k][7], g=new THREE.Group(), add=(nm,c,m)=>{ const o=new THREE.Mesh(ME[nm].geometry,INSPECT.mat(c,{flat:1})); o.userData.shared=true; if(m)o.applyMatrix4(m); g.add(o); };
    for(const p of ['body','breast','head','cap','crest','mask','beak','eye','tail','leg']){ const c=p==='eye'?0x0a0a0a:P[p]; if(c!=null)add(p,c); }
    for(const [s,sg] of [['R',1],['L',-1]])for(const p of ['wing','bar'])if(P[p]!=null)add(p+s,P[p],new THREE.Matrix4().makeTranslation(sg*PIV[0],PIV[1],PIV[2]).multiply(new THREE.Matrix4().makeRotationZ(sg*.25)));
    g.rotation.y=-Math.PI/2; const w=new THREE.Group(); w.add(g); return w; };
  INSPECT.kinds.push({is:id=>/^(bd|pet)_\d+$/.test(id)||id==='cage'||id==='bseed',make:id=>{ if(id==='cage')return INSPECT.shape('cage'); if(id==='bseed')return INSPECT.shape('sack',0xc8a868);
    const b=BIRDS.make(+id.split('_')[1]); if(id.startsWith('pet_'))return b; const g=INSPECT.shape('cage'); b.scale.setScalar(.28); b.position.y=.03; g.add(b); return g; }});
  let TRIS=0; for(const k in ME)TRIS+=ME[k].geometry.attributes.position.count/3; BIRDS.tris=TRIS;
  const HB=new THREE.BoxGeometry(.55*T,.5*T,.55*T), HM=new THREE.MeshBasicMaterial({visible:false});
  const hsh=(a,b,s)=>{ let h=(Math.floor(a*97)*374761393+Math.floor(b*89)*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const CW=K.map(k=>k[5]), TIER=k=>k>=10?'s':k>=5?'r':'c', pickC=(r,deep)=>{ const t=RARITY.pick(r,'bird'), tt=t==='s'&&!deep?'r':t, L=tt==='c'?[0,1,2,3,4]:tt==='r'?[5,6,7,8,9]:[10,11]; return L[Math.floor(((r*13.7)%1)*L.length)]; };   // a common, a rare and a super-rare tier (RARITY); the super-rare only deep in the park, once the Park Ranger ranks you high enough
  const flockN=(k,r)=>k<=2?2+Math.floor(r*4):k===4||k===9?1+Math.floor(r*2):1;
  const add=(k,x,y,z,o={})=>{ const hb=new THREE.Mesh(HB,HM); scene.add(hb); const b=Object.assign({k,x,y,z,yaw:Math.random()*6.28,pitch:0,st:'ground',t:Math.random()*5,until:1+Math.random()*3,wing:0,lift:0,hb,spots:[[x,y,z]],s:K[k][2]/1.2*WU*VIS},o);
    b.th={name:'A BIRD',obj:hb,reach:2*T,near:2.8*T,tall:.4*T,act:()=>BIRDS.menu(b)}; UI.thing(b.th); BIRDS.list.push(b); return b; };
  const drop=b=>{ scene.remove(b.hb); const i=BIRDS.list.indexOf(b); if(i>=0)BIRDS.list.splice(i,1); const j=UI.things.indexOf(b.th); if(j>=0)UI.things.splice(j,1); if(PANEL.b===b)close(); };
  const turn=()=>Math.floor((window.CLOCK?CLOCK.h:12)/2), dayN=()=>(window.MAIL&&MAIL.ready?MAIL.day():0)*13+turn();
  const chunk=(key,grp)=>{ const Q=grp.sq; if(!Q||Q.length<12)return; const d=dayN(), i0=3*Math.floor(hsh(Q[0]/T,Q[2]/T,701)*(Q.length/3)), cx=Q[i0], cz=Q[i0+2], park=WEEDS.inPark(cx,cz), deep=WEEDS.inPark(cx,cz,10);
    if(park&&!PARK.in||hsh(cx/T+d,cz/T,703)>(park?.75:.3))return; const k=pickC(hsh(cx/T+d*3,cz/T,705),deep&&hsh(cz/T,cx/T+d,707)<.25); if(k===HAWK)return; const n=flockN(k,hsh(cx/T,cz/T+d,709)), sp=[];
    for(let i=0;i<Q.length&&sp.length<8;i+=3){ const x=Q[i], z=Q[i+2]; if(Math.hypot(x-cx,z-cz)>3*T||hsh(x/T+d,z/T,711)>.3)continue; sp.push([x,grp.top(x,Q[i+1],z),z]); } if(sp.length<2)return;
    for(let j=0;j<n;j++){ const p=sp[j%sp.length], b=add(k,p[0]+(Math.random()-.5)*.6*T,p[1],p[2]+(Math.random()-.5)*.6*T,{src:key,spots:sp}); } };
  const CHK=new Set(); { SYS.add('weedsAdd',(key,grp)=>{ if(!CHK.has(key)){ CHK.add(key); chunk(key,grp); } },'144b-birds');
    SYS.add('weedsDrop',key=>{ CHK.delete(key); for(const b of [...BIRDS.list])if(b.src===key)drop(b); },'144b-birds'); if(WEEDS.chunks)for(const [k,g] of WEEDS.chunks)if(g&&g.sq){ CHK.add(k); chunk(k,g); } }
  const street=()=>{ if(!window.DRESS||!DRESS.kerb||typeof SHARED.groundY==='undefined')return; const {sw,far}=DRESS.kerb, side=Math.abs(pos.z-sw)<Math.abs(pos.z-far)?-1:1, zk=side<0?sw:far;
    if(Math.abs(pos.z-zk)>14*T||BIRDS.list.filter(b=>b.src==='street').length>=6)return; const x=Math.min(SHARED.BOUND.x1-T,Math.max(SHARED.BOUND.x0+T,pos.x+(Math.random()<.5?-1:1)*(7+Math.random()*9)*T));
    const r=Math.random(), k=r<.6?1:r<.88?0:2, sp=[]; for(let i=0;i<6;i++){ const sx=x+(Math.random()-.5)*3*T, sz=zk+side*(.4+Math.random()*1.2)*T; sp.push([sx,SHARED.groundY(sx,sz),sz]); }
    const n=Math.min(4,flockN(k,Math.random())); for(let j=0;j<n;j++){ const p=sp[j%sp.length]; add(k,p[0],p[1],p[2],{src:'street',spots:sp}); } };
  const posts=()=>{ const P=(window.DRESS&&DRESS.lampposts)||[]; for(const p of P){ if(Math.hypot(p.x-pos.x,p.z-pos.z)>30*T||BIRDS.list.some(b=>b.post===p))continue; const r=hsh(p.x/T+dayN(),p.z/T,731); if(r>.12)continue;
    add(r<.035?HAWK:r<.08?2:1,p.x,p.y,p.z,{st:'perch',post:p,src:'post',spots:[[p.x,p.y,p.z]]}); } };
  const SMALL=[0,3,5,6,7,8,9,2], gy=(x,z)=>(window.GARDEN&&GARDEN.lawnAt?GARDEN.lawnAt(x,z):null)??SHARED.groundY(x,z);
  const shrubs=()=>{ if(!window.FLORA||typeof SHARED.groundY==='undefined')return; const tn=dayN(); let nb=BIRDS.list.filter(b=>b.src==='bush'||b.src==='bed').length;
    for(const bu of PARK.in?FLORA.near(pos.x,pos.z,30*T):[]){ if(nb>=16)return; if(bu.bd===tn)continue; bu.bd=tn; const r=hsh(bu.x/T+tn,bu.z/T,741); if(r>.2)continue; const k=SMALL[Math.floor(hsh(bu.z/T,bu.x/T+tn,743)*SMALL.length)], sp=[];
      for(let i=0;i<4;i++){ const a=i*1.57+r*9, d=bu.r+(.3+.8*hsh(i,bu.x/T,745))*T, x=bu.x+Math.cos(a)*d, z=bu.z+Math.sin(a)*d; sp.push([x,gy(x,z),z]); } if(bu.solid)sp.push([bu.x,bu.y+bu.h*.96,bu.z,1]);
      const n=Math.min(3,flockN(k,hsh(tn,bu.x/T,747))); for(let j=0;j<n;j++){ const p=j===0&&sp[4]&&r<.1?sp[4]:sp[j%4]; add(k,p[0],p[1],p[2],{src:'bush',spots:sp,st:p[3]?'perch':'ground'}); nb++; } }
    for(const d of FLORA.near(pos.x,pos.z,30*T,'bed')){ if(nb>=16)return; if(!d.street&&!PARK.in)continue; if(d.bd===tn)continue; d.bd=tn; const r=hsh(d.x/T+tn,d.z/T,751); if(r>.14)continue; const k=[0,3,6,7,2,4][Math.floor(hsh(d.z/T,d.x/T+tn,753)*6)];
      const sp=d.p.slice(0,6).map(p=>{ const x=p[0]+(hsh(p[2],p[0],755)-.5)*.5*T, z=p[2]+(hsh(p[0],p[2],757)-.5)*.5*T; return [x,gy(x,z),z]; }); if(sp.length<2)continue;
      const n=Math.min(3,flockN(k,hsh(tn,d.z/T,759))); for(let j=0;j<n;j++){ const p=sp[j%sp.length]; add(k,p[0],p[1],p[2],{src:'bed',spots:sp,flw:1}); nb++; } } };
  let tn0=-1; SYS.every(()=>{ const tn=dayN(); if(tn!==tn0){ const first=tn0<0; tn0=tn; if(!first){ for(const b of [...BIRDS.list])if(b.st!=='pet')drop(b); CHK.clear(); if(WEEDS.chunks)for(const [k,g] of WEEDS.chunks)if(g&&g.sq){ CHK.add(k); chunk(k,g); } } }
    if(!BIRDS.out)return; street(); posts(); shrubs(); for(const b of [...BIRDS.list])if((b.src==='street'||b.src==='post'||b.src==='bush'||b.src==='bed')&&Math.hypot(b.x-pos.x,b.z-pos.z)>40*T)drop(b); },3000);
  PARK.onShow.push(on=>{ if(!on)for(const b of [...BIRDS.list])if((b.src==='bush'||b.src==='bed')&&WEEDS.inPark(b.x,b.z))drop(b); });
  const flyTo=(b,x,y,z,away,land)=>{ const d=Math.hypot(x-b.x,z-b.z); b.fly={a:[b.x,b.y,b.z],c:[x,y,z],t:0,dur:.7+d/(4.5*T)+(b.k===HAWK?1:0),h:Math.min(3.5,.4+d/T*.25)*WU*(land===2?.4:1),away,land}; b.st='fly'; b.yaw=Math.atan2(x-b.x,z-b.z); };
  const SHY=k=>k!==1&&k!==4&&k!==HAWK;
  const flush=b=>{ '@later'; if(b.st==='pet'||b.st==='opet'||b.st==='fly'||b.st==='hid')return; if(SHY(b.k)&&window.FLORA&&Math.random()<.8){ const c=FLORA.cover(b.x,b.z,pos.x,pos.z); if(c){ flyTo(b,c.x+(Math.random()-.5)*.2*c.r,c.y+c.h*.45,c.z+(Math.random()-.5)*.2*c.r,false,2); return; } } const a=Math.atan2(b.x-pos.x,b.z-pos.z)+(Math.random()-.5), far=b.spots.filter(s=>Math.hypot(s[0]-pos.x,s[2]-pos.z)>4*T);
    if(far.length&&Math.random()<.6){ const s=far[Math.floor(Math.random()*far.length)]; flyTo(b,s[0],s[1],s[2],false,s[3]); } else flyTo(b,b.x+Math.sin(a)*28*T,b.y+9*WU,b.z+Math.cos(a)*28*T,true); };
  BIRDS.flush=flush; let lx=0, lz=0, still=0, spd=0; const m4=new THREE.Matrix4(), mw=new THREE.Matrix4(), mr=new THREE.Matrix4(), q=new THREE.Quaternion(), e=new THREE.Euler(), V3=THREE.Vector3, sv=new V3(), pv=new V3(), col=new THREE.Color();
  const seedAt=()=>{ if(S.seed&&S.seed.t>0)return S.seed; let b=null, bd=30*T; const L=[S.feed]; if(ONLINE.on)for(const F of FEEDS.values())L.push(F.f); for(const f of L){ if(!f)continue; const d=Math.hypot(f.x-pos.x,f.z-pos.z); if(d<bd){ bd=d; b=f; } } return b; };
  const step=(b,dt)=>{ '@later'; b.t+=dt; if(b.st==='still')return; const ws=b.k===HAWK?.45:1;
    if(b.st==='opet'){ const o=b.o, g=o&&o.fig&&o.fig.g; if(!g)return; const hd=g.rotation.y, rx=Math.cos(hd), rz=-Math.sin(hd), tx=g.position.x+rx*.2*WU, tz=g.position.z+rz*.2*WU, ty=g.position.y+1.42*WU, k=Math.min(1,dt*6);
      b.x+=(tx-b.x)*k; b.y+=(ty-b.y)*k; b.z+=(tz-b.z)*k; b.yaw=hd; b.wing=Math.max(0,b.wing-dt*6); b.pitch=0; b.lift=0; return; }
    if(b.st==='pet'){ const hd=SHARED.heading, rx=Math.cos(hd), rz=-Math.sin(hd), on=still>1.2, J=W3.lastB&&W3.lastB.J, SJ=on&&J&&(b.side===-1?J.shoulderR:J.shoulderL); if(SJ)SPOT.set(SJ.x+(b.side||1)*.9,SJ.y+2.4,SJ.z).applyMatrix4(W3.group.matrixWorld);
      const tx=SJ?SPOT.x:on?pos.x+rx*.2*WU:pos.x-Math.sin(hd)*.7*T+rx*.4*T, tz=SJ?SPOT.z:on?pos.z+rz*.2*WU:pos.z-Math.cos(hd)*.7*T+rz*.4*T, ty=SJ?SPOT.y:SHARED.py+(on?1.42:1.9)*WU;
      const k=Math.min(1,dt*(on?6:3)); b.x+=(tx-b.x)*k; b.y+=(ty-b.y)*k; b.z+=(tz-b.z)*k; const moving=Math.hypot(tx-b.x,tz-b.z)>.05*T||!on; b.yaw=on||spd>.2*T?hd:Math.atan2(pos.x-b.x,pos.z-b.z);
      b.wing=moving?1+.9*Math.sin(b.t*20):Math.max(0,b.wing-dt*6); b.pitch=moving?.2:0; b.lift=0; return; }
    if(b.st==='fly'){ const F=b.fly; F.t+=dt; const u=Math.min(1,F.t/F.dur), A=F.a, C=F.c; b.x=A[0]+(C[0]-A[0])*u; b.z=A[2]+(C[2]-A[2])*u; b.y=A[1]+(C[1]-A[1])*u+Math.sin(Math.PI*u)*F.h*(F.away?.3:1);
      b.wing=b.k===HAWK&&u>.2&&u<.85?1.35+.1*Math.sin(b.t*3):1.05+.85*Math.sin(b.t*22*ws); b.pitch=u<.15?-.35:u>.85?.3:0;
      if(u>=1){ if(F.away){ drop(b); return; } b.st=F.land===2?'hid':b.post||F.land===1?'perch':'ground'; b.until=b.t+(b.st==='hid'?4+Math.random()*5:1+Math.random()*3); b.fly=null; } return; }
    b.wing=Math.max(0,b.wing-dt*5); const d=Math.hypot(b.x-pos.x,b.z-pos.z), sd=seedAt(), near=sd&&Math.hypot(b.x-sd.x,b.z-sd.z)<1.2*T;
    if(b.st==='hid'){ b.pitch=0; if(b.t>b.until){ if(d>3.5*T&&spd<1.2*T){ const g=b.spots.filter(s=>!s[3]), s=g[Math.floor(Math.random()*g.length)]||b.spots[0]; flyTo(b,s[0],s[1],s[2],false,s[3]); } else b.until=b.t+2+Math.random()*3; } return; }
    if((b.st!=='perch'||!b.post)&&!PANEL.watching(b)&&d<(near?.5*T:spd>2.5*T?1.5*T:spd>.3*T?1.1*T:.5*T)*(1-Math.min(.9,(FORAGE.sk?FORAGE.sk('bird'):0)/110))){ flush(b); return; }
    if(b.st==='perch'){ b.pitch=0; if(b.t>b.until){ b.until=b.t+3+Math.random()*6; if(!b.post&&b.spots.length>1&&Math.random()<.4){ const s=b.spots[Math.floor(Math.random()*b.spots.length)]; if(Math.hypot(s[0]-b.x,s[2]-b.z)>.3*T||Math.abs(s[1]-b.y)>.3*T){ flyTo(b,s[0],s[1],s[2],false,s[3]); return; } } b.yaw+=(Math.random()-.5)*2; } return; }
    if(sd&&!near&&Math.hypot(b.x-sd.x,b.z-sd.z)<14*T&&b.k!==HAWK&&b.t>b.until){ flyTo(b,sd.x+(Math.random()-.5)*.8*T,sd.y,sd.z+(Math.random()-.5)*.8*T); return; }
    if(b.hop){ b.hop.t+=dt; const u=Math.min(1,b.hop.t/b.hop.d); b.x=b.hop.a[0]+(b.hop.c[0]-b.hop.a[0])*u; b.z=b.hop.a[1]+(b.hop.c[1]-b.hop.a[1])*u; b.lift=K[b.k][6]==='hop'?Math.sin(Math.PI*u)*.06*WU:0; b.pitch=K[b.k][6]==='walk'?.08*Math.sin(u*Math.PI*6):0; if(u>=1)b.hop=null; return; }
    b.lift=0; if(b.peck){ b.peck-=dt; b.pitch=b.peck>0?.55:0; if(b.peck<=0)b.peck=0; }
    if(b.t>b.until){ const r=Math.random(); b.until=b.t+.4+Math.random()*(near?.8:2.2);
      if(r<(near?.7:b.flw?.55:.35))b.peck=.25; else if(r<.85&&!near){ const walk=K[b.k][6]==='walk', L=(walk?.3:.18)*T*(.5+Math.random()), a=b.yaw+(Math.random()-.5)*2.4, h=b.spots[0], hx=b.x+Math.sin(a)*L, hz=b.z+Math.cos(a)*L;
        if(Math.hypot(hx-h[0],hz-h[2])<3.5*T){ b.yaw=a; b.hop={a:[b.x,b.z],c:[hx,hz],t:0,d:walk?.5:.18}; } else b.yaw=Math.atan2(h[0]-b.x,h[2]-b.z); }
      else if(r<.93&&!near&&b.spots.length>1){ const s=b.spots[Math.floor(Math.random()*b.spots.length)]; if(Math.hypot(s[0]-b.x,s[2]-b.z)>.8*T)flyTo(b,s[0],s[1],s[2],false,s[3]); }
      else b.yaw+=(Math.random()-.5)*1.6; } };
  const place=(b,n)=>{ '@later'; const P=K[b.k][7]; mw.compose(pv.set(b.x,b.y+b.lift,b.z),q.setFromEuler(e.set(b.pitch,b.yaw,0,'YXZ')),sv.set(b.s,b.s,b.s));
    for(const p of ['body','breast','head','cap','crest','mask','beak','eye','tail','leg']){ const c=p==='eye'?0x0a0a0a:P[p]; if(c==null)continue; const me=ME[p], i=n[p]=(n[p]||0); if(i>=MAXI)continue; me.setMatrixAt(i,mw); me.setColorAt(i,col.setHex(c)); n[p]++; }
    for(const [s,sg] of [['R',1],['L',-1]])for(const p of ['wing','bar']){ const c=P[p]; if(c==null)continue; const me=ME[p+s], i=n[p+s]=(n[p+s]||0); if(i>=MAXI)continue;
      m4.makeTranslation(sg*PIV[0],PIV[1],PIV[2]).multiply(mr.makeRotationZ(sg*b.wing)); me.setMatrixAt(i,m4.premultiply(mw)); me.setColorAt(i,col.setHex(c)); n[p+s]++; }
    b.hb.position.set(b.x,b.y+.2*T,b.z); };
  const binoc=()=>!!FORAGE.has('binoc'); let WS=null; const WR0=3.5*T, WR1=9*T, wtick=dt=>{ if(!WS)return; const b=WS.b, d=Math.hypot(b.x-pos.x,b.z-pos.z);
    const WR=binoc()?WR1:WR0; if(!BIRDS.list.includes(b)||b.st==='fly'||d>WR){ say(d>WR?'YOU LOSE SIGHT OF IT.':'IT FLIES OFF.','#c8a090'); WS=null; return; }
    WS.t+=dt*(spd<.3*T?1:.4); if(WS.t>=8){ WS.t=0; use('bird',WS.d-25,WS.d+25,WS.bonus+(spd<.1*T?5:0)); } };
  BIRDS.watching=()=>WS&&{k:WS.b.k,t:+WS.t.toFixed(1)};
  const hunt=dt=>{ for(const h of BIRDS.list){ if(h.k!==HAWK||h.st!=='perch'||!h.post||PANEL.b===h)continue; if((h.hunt=(h.hunt??20+Math.random()*40)-dt)>0)continue; h.hunt=25+Math.random()*50;
      if(Math.hypot(h.x-pos.x,h.z-pos.z)>30*T)continue; const L=((window.DRESS&&DRESS.lampposts)||[]).filter(p=>p!==h.post&&Math.hypot(p.x-h.x,p.z-h.z)<25*T&&Math.hypot(p.x-h.x,p.z-h.z)>6*T&&!BIRDS.list.some(b=>b.post===p)); if(!L.length)continue;
      const p=L[Math.floor(Math.random()*L.length)]; let n=0; for(const b of BIRDS.list)if(b!==h&&b.k!==HAWK&&b.st!=='pet'&&b.st!=='opet'&&Math.hypot(b.x-h.x,b.z-h.z)<15*T){ flush(b); n++; }
      h.post=p; h.spots=[[p.x,p.y,p.z]]; flyTo(h,p.x,p.y,p.z,false,1); if(Math.hypot(h.x-pos.x,h.z-pos.z)<20*T)say(n?'A RED-TAILED HAWK TAKES OFF. THE SMALL BIRDS SCATTER FOR COVER.':'A RED-TAILED HAWK GLIDES TO ANOTHER LAMPPOST.','#e8d0a0'); } };
  const FE=[]; let feT=10; const FG=new THREE.PlaneGeometry(.04*WU,.13*WU), FM=new THREE.MeshLambertMaterial({color:0xe4ddd0,side:THREE.DoubleSide});
  const unfeather=f=>{ scene.remove(f.me); const i=FE.indexOf(f); if(i>=0)FE.splice(i,1); const j=UI.things.indexOf(f.th); if(j>=0)UI.things.splice(j,1); };
  const shed=dt=>{ for(const f of [...FE])if(Math.hypot(f.me.position.x-pos.x,f.me.position.z-pos.z)>40*T)unfeather(f); if((feT-=dt)>0)return; feT=15+Math.random()*25; if(FE.length>=3)return;
    const B=BIRDS.list.filter(b=>b.st==='ground'&&b.k!==HAWK&&Math.hypot(b.x-pos.x,b.z-pos.z)<15*T); if(!B.length)return; const b=B[Math.floor(Math.random()*B.length)], x=b.x+(Math.random()-.5)*.6*T, z=b.z+(Math.random()-.5)*.6*T;
    const me=new THREE.Mesh(FG,FM); me.rotation.set(-Math.PI/2,0,Math.random()*6.3); me.position.set(x,SHARED.groundY(x,z)+.01*WU,z); scene.add(me);
    const f={me}; f.th={name:'A FEATHER',obj:me,reach:1.6*T,near:2.5*T,tall:.2*T,act:()=>{ FORAGE.give('bird_feather',1); say('A FEATHER A BIRD LEFT BEHIND. YOU KEEP IT.','#e8e2cc'); unfeather(f); FORAGE.draw(); }}; UI.thing(f.th); FE.push(f); };
  BIRDS.feathers=()=>FE.length;
  BIRDS.tick=dt=>{ if(!dt)return; wtick(dt); const mv=Math.hypot(pos.x-lx,pos.z-lz); spd=spd*.8+mv/dt*.2; lx=pos.x; lz=pos.z; still=spd<.1*T?still+dt:0;
    const W=window.WX&&WX.now, out=SHARED.LVL==='up'&&!(window.ROOMS&&ROOMS.cur)&&!(window.CLOCK&&CLOCK.dark())&&!(W&&(W.rain>.25||W.snow>.25||W.wind>.8)); BIRDS.out=out;
    if(S.seed){ S.seed.t-=dt; if(S.seed.t<=0)S.seed=null; } const n={};
    if(out){ hunt(dt); shed(dt); }
    const rch=binoc()?WR1:2*T; theirs(); for(const b of [...BIRDS.list]){ if(b.th)b.th.reach=b.st==='pet'?2*T:rch; const pet=b.st==='pet'||b.st==='opet', show=pet||out; b.hb.visible=show&&!pet&&b.st!=='hid'; if(b.st==='opet'&&!(b.o&&b.o.fig&&b.o.fig.g.visible))continue; if(!show)continue; if(!pet&&(Math.hypot(b.x-pos.x,b.z-pos.z)>20*T||!NPCS.seen(b.x,b.y,b.z,1.5*T)))continue; if(pet||NPCS.live(b.x,b.y,b.z,1.5*T))step(b,dt); if(BIRDS.list.includes(b))place(b,n); }
    for(const p in ME){ const me=ME[p]; me.count=n[p]||0; me.instanceMatrix.needsUpdate=true; if(me.instanceColor)me.instanceColor.needsUpdate=true; } BIRDS.shown=n.body||0; };
  { SYS.add('life',(dt)=>{ BIRDS.tick(dt); },'144b-birds'); }
  const B='style="margin:0 4px 0 0;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:3px 8px;cursor:pointer"';
  const P=document.createElement('div'); P.id='birdp'; P.hidden=true; P.style.cssText='position:fixed;left:50%;top:14%;transform:translateX(-50%);width:min(380px,92vw);z-index:21;padding:12px 14px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  document.body.appendChild(P); P.addEventListener('keydown',ev=>ev.stopPropagation());
  const PANEL={b:null,watching:b=>PANEL.b===b&&!P.hidden}; const close=()=>{ P.hidden=true; PANEL.b=null; };
  const known=k=>!!S.seen[k], nmOf=b=>known(b.k)?K[b.k][0]:'A BIRD YOU DO NOT KNOW';
  const draw=()=>{ '@later'; const b=PANEL.b; if(!b)return close(); const k=b.k, pet=b.st==='pet';
    let o=`<div style="color:#f2c14e;margin-bottom:4px">${pet?'YOUR TAME '+K[k][0]:nmOf(b)}</div><div style="color:#9b9584;margin-bottom:8px">${known(k)?`<i>${K[k][1]}</i> · SEEN ${S.seen[k]} TIME${S.seen[k]===1?'':'S'}`:'NOT IN YOUR JOURNAL YET'}</div><div>`;
    if(pet)o+=`<button ${B} data-a="free">LET IT GO</button>`; else o+=`<button ${B} data-a="pickup">PICK UP</button><button ${B} data-a="watch">WATCH</button><button ${B} data-a="tame">TAME${FORAGE.has('bseed')?' (SEED x'+FORAGE.has('bseed')+')':' (NO SEED)'}</button><button ${B} data-a="catch">CATCH${FORAGE.has('bnet')?' (CAGES x'+FORAGE.has('cage')+')':' (NO NET)'}</button>`;
    o+=`</div><div style="color:#7d7a70;margin-top:8px">BIRDING ${FORAGE.sk('bird').toFixed(1)}${binoc()?' · BINOCULARS':''}. Seed, nets, cages, feeders, binoculars: the Nature Merchant.</div>`; const x=P.querySelector(':scope>.pX'); P.innerHTML=o; if(x)P.appendChild(x); };
  BIRDS.menu=b=>{ if(!BIRDS.list.includes(b))return; PANEL.b=b; P.hidden=false; draw(); };
  const gone=b=>!BIRDS.list.includes(b)||b.st==='fly';
  const log=b=>{ '@later'; const k=b.k, first=!S.seen[k]; S.seen[k]=(S.seen[k]||0)+1; save();
    if(first){ say(`A NEW BIRD FOR YOUR JOURNAL: ${K[k][0]} (${K[k][1].toUpperCase()}).`,RARE(k)?'#f2c14e':'#c8b0ff'); if(BOUNTY[k]){ INV.cash+=BOUNTY[k]; say(`THE PARK'S BIRD COUNT PAYS $${BOUNTY[k]} FOR THE FIRST SIGHTING.`,'#f2c14e'); } }
    else say(`YOU WATCH THE ${K[k][0]} A WHILE.`,'#e8e2cc'); };
  const feather=(k,p)=>{ if(k!==HAWK&&Math.random()<p){ FORAGE.give('bird_feather',1); say('IT LEAVES A FEATHER BEHIND. YOU KEEP IT.','#e8e2cc'); } };
  const ACT={pickup:b=>{ '@later'; if(b.k===HAWK)return say('A HAWK WILL NOT BE PICKED UP.','#c8a090'); if(Math.hypot(b.x-pos.x,b.z-pos.z)>1.3*T)return say('GET CLOSER, SLOWLY.','#c8a090'); const d=DIFF(b.k)+20;
      if(use('bird',d-25,d+25)){ if(!S.seen[b.k])log(b); feather(b.k,.3); makePet(b.k,b); say('IT SITS CALM IN YOUR HANDS.','#9fe07f'); } else { say('IT STARTLES AND FLIES OFF.','#c8a090'); flush(b); } },
    watch:b=>{ '@later'; const sd=seedAt(), bonus=sd&&Math.hypot(b.x-sd.x,b.z-sd.z)<2*T?10:0, d=DIFF(b.k); if(use('bird',d-25,d+25,bonus)){ log(b); feather(b.k,.1); WS={b,t:0,d,bonus}; say('YOU SETTLE IN TO WATCH IT. STAY CLOSE.','#9fe07f'); } else { say('IT FLIES OFF BEFORE YOU GET A GOOD LOOK.','#c8a090'); flush(b); } },
    tame:b=>{ '@later'; if(b.k===HAWK)return say('A HAWK WILL NOT TAKE SEED FROM YOUR HAND.','#c8a090'); if(!FORAGE.has('bseed'))return say('YOU NEED BIRDSEED (THE BIRD SHOP HAS IT).','#c8a090');
      FORAGE.take('bseed',1); const d=DIFF(b.k)+15; if(use('bird',d-20,d+30)){ if(!S.seen[b.k])log(b); makePet(b.k,b); } else { say('IT TAKES THE SEED AND FLIES OFF.','#c8a090'); flush(b); } },
    catch:b=>{ '@later'; if(!FORAGE.has('bnet'))return say('YOU NEED A BIRD NET (THE BIRD SHOP HAS THEM).','#c8a090'); if(b.k===HAWK)return say('A HAWK IS FAR TOO BIG FOR YOUR NET.','#c8a090');
      if(!FORAGE.has('cage'))return say('YOU NEED AN EMPTY CAGE TO PUT IT IN.','#c8a090'); const d=DIFF(b.k)+10; SFX.play('step',{vol:.4});
      if(use('bird',d-25,d+25)){ FORAGE.take('cage',1); FORAGE.give('bd_'+b.k,1); if(!S.seen[b.k])log(b); feather(b.k,.5); say(`YOU NET THE ${K[b.k][0]} AND CAGE IT.`,'#b8f0a0'); drop(b); } else { say('YOUR NET SWISHES THROUGH EMPTY AIR.','#c8a090'); flush(b); } },
    free:b=>{ freePet(); }};
  BIRDS.net=b=>{ ACT.catch(b); FORAGE.draw(); };
  P.addEventListener('click',ev=>{ '@later'; const t=ev.target.closest('button[data-a]'); if(!t)return; const b=PANEL.b; if(!b||(gone(b)&&b.st!=='pet')){ say('IT HAS FLOWN.','#c8a090'); return close(); }
    if(t.dataset.a!=='free'&&Math.hypot(b.x-pos.x,b.z-pos.z)>(t.dataset.a==='watch'&&binoc()?WR1:3.2*T)){ say('IT IS TOO FAR OFF. GO NEARER.','#c8a090'); return; } ACT[t.dataset.a](b); FORAGE.draw(); if(gone(b)||t.dataset.a==='free')close(); else draw(); });
  const petOf=()=>BIRDS.list.find(b=>b.st==='pet');
  ONLINE.mine.pet=()=>{ const b=petOf(); return b?b.k:null; };
  const theirs=()=>{ const want=new Map(); if(ONLINE.on&&ONLINE.others)for(const o of ONLINE.others.values()){ const k=o.x&&o.x.pet; if(k!=null&&K[+k]&&o.why==='near you'&&o.fig)want.set(o.id,[o,+k]); }
    for(const b of [...BIRDS.list])if(b.st==='opet'){ const w=want.get(b.o.id); if(!w||w[1]!==b.k)drop(b); else want.delete(b.o.id); }
    for(const [,[o,k]] of want){ const g=o.fig.g, b=add(k,g.position.x,g.position.y+1.4*WU,g.position.z,{src:'opet'}); b.st='opet'; b.o=o; b.th.name=(o.name||'THEIR')+"'S TAME "+K[k][0]; b.th.act=()=>say('IT IS NOT YOUR BIRD. IT EYES YOU FROM ITS PERCH.','#c8c2b0'); } };
  const makePet=(k,b)=>{ '@later'; const old=petOf(); if(old){ freePet(true); } for(const id of Object.keys(INV.items))if(id.startsWith('pet_'))delete INV.items[id]; FORAGE.give('pet_'+k,1);
    const p=b&&BIRDS.list.includes(b)?b:add(k,pos.x,SHARED.py+1.2*WU,pos.z); p.st='pet'; p.src='pet'; p.fly=null; p.hop=null; p.side=Math.random()<.5?-1:1; p.th.name='YOUR TAME '+K[k][0]; say(`THE ${K[k][0]} IS TAME. IT WILL FOLLOW YOU.`,'#9fe07f'); };
  const freePet=quiet=>{ const b=petOf(); for(const id of Object.keys(INV.items))if(id.startsWith('pet_'))delete INV.items[id]; if(!b)return; if(!quiet)say(`YOU LET THE ${K[b.k][0]} GO. IT FLIES OFF.`,'#9fe07f'); b.st='ground'; b.src='free'; flyTo(b,b.x+20*T,b.y+8*WU,b.z+12*T,true); };
  FORAGE.ROWB.push(id=>id.startsWith('bd_')?[['TAME','btame'],['RELEASE','bfree2']]:id==='bseed'?[['SCATTER','bscatter']]:id==='feeder'?[['HANG IT HERE','bhang']]:id.startsWith('pet_')?[['CAGE IT','bcage'],['LET GO','bletgo']]:[]);
  FORAGE.ACT.bfree2=id=>{ const k=+id.slice(3); FORAGE.take(id,1); FORAGE.give('cage',1); const b=add(k,pos.x,SHARED.py+1*WU,pos.z,{src:'free'}); flyTo(b,pos.x+18*T,b.y+7*WU,pos.z-14*T,true); say(`YOU OPEN THE CAGE. THE ${K[k][0]} FLIES OFF.`,'#9fe07f'); };
  FORAGE.ACT.btame=id=>{ const k=+id.slice(3), d=DIFF(k); if(use('bird',d-10,d+40)){ FORAGE.take(id,1); FORAGE.give('cage',1); makePet(k); } else say('IT PECKS YOUR FINGER AND WILL NOT COME OUT.','#c8a090'); };
  FORAGE.ACT.bscatter=()=>{ '@later'; if(SHARED.LVL!=='up'||(window.ROOMS&&ROOMS.cur))return say('SCATTER IT OUTDOORS.','#c8a090'); FORAGE.take('bseed',1); S.seed={x:pos.x,y:(GARDEN.lawnAt&&GARDEN.lawnAt(pos.x,pos.z))??(typeof SHARED.groundY!=='undefined'?SHARED.groundY(pos.x,pos.z):pos.y),z:pos.z,t:90};
    say('YOU SCATTER A HANDFUL OF SEED. STAND STILL AND THE BIRDS WILL COME.','#9fe07f'); };
  FORAGE.ACT.bletgo=()=>freePet();
  // a feeder: yours (a double click takes it down) or another player's (theirs comes from the section, like hives and pots)
  const feederAt=(f,who,act)=>{ '@later'; const g=new THREE.Group(), wd=INSPECT.mat(0x8a6a4a,{flat:1}), pole=new THREE.Mesh(new THREE.CylinderGeometry(.03*WU,.03*WU,1.3*WU,6),wd); pole.position.y=.65*WU; g.add(pole);
    const tray=new THREE.Mesh(new THREE.CylinderGeometry(.22*WU,.2*WU,.05*WU,8),wd); tray.position.y=1.3*WU; g.add(tray); const roof=new THREE.Mesh(new THREE.ConeGeometry(.28*WU,.18*WU,4),INSPECT.mat(0x5a7a4a,{flat:1})); roof.position.y=1.62*WU; roof.rotation.y=Math.PI/4; g.add(roof);
    const seed=new THREE.Mesh(new THREE.CylinderGeometry(.18*WU,.18*WU,.02*WU,8),INSPECT.mat(0xc8a860,{flat:1})); seed.position.y=1.34*WU; g.add(seed); g.position.set(f.x,f.y,f.z); scene.add(g);
    const th={name:who?who+"'S BIRD FEEDER":'YOUR BIRD FEEDER',obj:tray,reach:1.6*T,near:2.4*T,tall:1.6*WU,act}; UI.thing(th); return {g,th}; };
  const feederGone=F=>{ if(!F)return; scene.remove(F.g); const i=UI.things.indexOf(F.th); if(i>=0)UI.things.splice(i,1); };
  const share=()=>{ if(ONLINE.on&&ONLINE.send)ONLINE.send({t:'puts',k:'feeder',list:S.feed?[[+S.feed.x.toFixed(2),+S.feed.y.toFixed(2),+S.feed.z.toFixed(2),0]]:[]}); };
  let FD=null; const feederShow=()=>{ feederGone(FD); FD=null; const f=S.feed; if(!f)return;
    FD=feederAt(f,null,()=>{ S.feed=null; save(); share(); FORAGE.give('feeder',1); feederShow(); say('YOU TAKE DOWN YOUR FEEDER.','#e8e2cc'); FORAGE.draw(); }); };
  const FEEDS=new Map(); BIRDS.feeds=FEEDS;
  const theirFeed=(id,name,list)=>{ '@later'; feederGone(FEEDS.get(id)); FEEDS.delete(id); if(!id||id===ONLINE.me||!Array.isArray(list)||!list[0])return; const a=list[0], f={x:+a[0],y:+a[1],z:+a[2]}; if(!isFinite(f.x)||!isFinite(f.z))return;
    const who=String(name||'A NEIGHBOUR').toUpperCase(), F=feederAt(f,who,()=>say(`${who}'S FEEDER. THE BIRDS LIKE IT.`,'#e8e2cc')); F.f=f; FEEDS.set(id,F); };
  ONLINE.puts.feeder={set:theirFeed,clear:()=>{ for(const id of [...FEEDS.keys()])theirFeed(id); },share};
  FORAGE.ACT.bhang=()=>{ '@later'; if(SHARED.LVL!=='up'||(window.ROOMS&&ROOMS.cur))return say('HANG IT OUTDOORS.','#c8a090'); FORAGE.take('feeder',1); S.feed={x:pos.x,y:(GARDEN.lawnAt&&GARDEN.lawnAt(pos.x,pos.z))??(typeof SHARED.groundY!=='undefined'?SHARED.groundY(pos.x,pos.z):pos.y),z:pos.z,t:1};
    save(); share(); feederShow(); say('YOU HANG THE FEEDER. BIRDS NEARBY WILL COME TO IT. A DOUBLE CLICK TAKES IT DOWN.','#9fe07f'); };
  setTimeout(feederShow,0); BIRDS.feeder=()=>FD&&FD.th;
  FORAGE.ACT.bcage=id=>{ '@later'; const k=+id.slice(4); if(!FORAGE.has('cage'))return say('YOU NEED AN EMPTY CAGE (THE BIRD SHOP HAS THEM).','#c8a090'); FORAGE.take('cage',1); const b=petOf(); for(const q of Object.keys(INV.items))if(q.startsWith('pet_'))delete INV.items[q]; if(b)drop(b); FORAGE.give('bd_'+k,1); say(`YOU PUT YOUR TAME ${K[k][0]} IN THE CAGE.`,'#b8f0a0'); };
  FORAGE.BOOK.push({id:'birds',title:'BIRDS',rows:()=>K.map((q,k)=>[q[0],!!S.seen[k],S.seen[k]?'SEEN '+S.seen[k]+' · '+q[1].toUpperCase():'',RARE(k)]),foot:'Double click a bird to watch it. Birds are out by day, in fair weather; most in the park. Scatter seed, or hang a feeder, and stand still to bring them near.'});
  { const pk=Object.keys(INV.items).find(id=>id.startsWith('pet_')); if(pk){ const k=+pk.slice(4); const b=add(k,pos.x,SHARED.py+1.4*WU,pos.z); b.st='pet'; b.src='pet'; b.th.name='YOUR TAME '+K[k][0]; } }
  BIRDS.TIER=TIER; window.BIRDS=BIRDS; BIRDS.K=K; BIRDS.T=T; BIRDS.ME=ME; BIRDS.add=add; BIRDS.drop=drop; BIRDS.S=S;
  window.BIRDDBG=()=>({out:BIRDS.out,n:BIRDS.list.length,shown:BIRDS.shown,tris:TRIS,kinds:BIRDS.list.map(b=>K[b.k][0]+':'+b.st),seen:{...S.seen},seed:S.seed,bird:FORAGE.sk('bird')}); }
export {BIRDS};
