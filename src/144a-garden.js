// THE GARDEN: GARDEN, the wild flowers (each grass kind its own, park and street) and the garden plots the player can plant.
import {SHARED, THREE} from './003-shx.js';
import {BIRDS, CITY, CLOCK, FORAGE, INSPECT, ITEMS, MAIL, MOTION, pos, ROOMS, SFX, UI, WEEDS, WX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {MAPG, SYS, TILE} from './006-map-pre.js';
import {RARITY} from './013a-rarity.js';
import {GRASS} from './014a-grass.js';
import {CREATS} from './087-npc-creatures.js';
import {VEG} from './144-veggies.js';
const GARDEN={}; window.GARDEN=GARDEN;
{ const T=TILE, KEY='garden', say=SAY, use=FORAGE.use, sk=FORAGE.sk, CS=8*T;
  // three tiers (RARITY): common 0-10, rare 30-45, super-rare 70-80; each grass grows one of each; the rose is the garden's own
  const FL={dandelion:['DANDELION',0,1,0xf2c81e,0xe0a810,[.05,.4,.14,.5]],clover:['RED CLOVER',5,1,0xc86a9a,0,[.042,1,.1,0]],bluebell:['BLUEBELL',8,3,0x6a7ae0,0,[.045,1.3,.3,0]],
    poppy:['POPPY',8,3,0xe02a1a,0x1a1414,[.06,.4,.42,.3]],lavender:['LAVENDER',10,4,0x8a6ad0,0,[.035,2.4,.45,0]],goldenrod:['GOLDENROD',10,3,0xe8c030,0,[.045,2.6,.5,0]],
    daisy:['OXEYE DAISY',30,8,0xf4f2ea,0xf2c81e,[.065,.28,.3,.38]],marigold:['MARIGOLD',32,8,0xf09020,0xd06010,[.065,.6,.26,.3]],chicory:['CHICORY',34,8,0x7a9af0,0x5a7ad0,[.05,.3,.42,.3]],
    cosmos:['COSMOS',36,9,0xe070b0,0xf2c81e,[.06,.15,.62,.3]],violet:['WILD VIOLET',40,12,0x6a3ab0,0xf2e8a0,[.04,.45,.08,.3]],aster:['NEW YORK ASTER',38,10,0x9a7ae0,0xf2c81e,[.055,.3,.36,.38]],
    slipper:["PINK LADY'S SLIPPER",75,60,0xe87aa8,0xb04a78,[.06,1.3,.3,.32]],tulip:['TULIP',70,40,0xe02a2a,0,[.05,1.4,.32,0]],iris:['IRIS',72,45,0x5a4ad0,0x7a6ae8,[.06,.8,.5,.4]],
    zinnia:['ZINNIA',74,45,0xe03a5a,0xf2c81e,[.07,.38,.36,.32]],foxglove:['FOXGLOVE',76,50,0xd060a0,0,[.045,3,.9,0]],sunflower:['SUNFLOWER',78,55,0xf2c81e,0x5a3a1a,[.15,.28,1.3,.55]],
    rose:['ROSE',55,14,0xc01a2a,0,[.055,.95,.4,0]]};
  const SEED={marigold:['MARIGOLD SEEDS',1],zinnia:['ZINNIA SEEDS',2],tulip:['TULIP BULB',3],sunflower:['SUNFLOWER SEEDS',2],rose:['ROSE CUTTING',8]};
  // a rarer seed each week, sold by the mushroom seller only that week
  const WEEK={lavender:['LAVENDER SEEDS',3],iris:['IRIS BULB',5],foxglove:['FOXGLOVE SEEDS',4],violet:['WILD VIOLET SEEDS',6],slipper:["LADY'S SLIPPER ROOT",40]};
  const WILD=Object.fromEntries(GRASS.K.map(k=>[k.id,k.flowers])), FTIER={}; for(const k of GRASS.K)for(const t of RARITY.TIERS)FTIER[k.flowers[t]]=t; GARDEN.FTIER=FTIER; for(const k in FTIER)ITEMS.reg('fl_'+k,{tier:{c:'common',r:'rare',s:'super'}[FTIER[k]]});   // each grass kind's wild flowers, a common, a rare and a super-rare (GRASS)
  const BQ=[['g_posy','WILDFLOWER POSY','garden',[0,45],{fl_daisy:2,fl_clover:2},'sells for $14'],['g_meadow','MEADOW BOUQUET','garden',[20,65],{fl_chicory:2,fl_goldenrod:2,fl_daisy:1},'sells for $28'],
    ['g_tulip','TULIP BUNCH','garden',[30,75],{fl_tulip:5},'sells for $40'],['g_aster','ASTER SPRAY','garden',[35,80],{fl_aster:3,fl_goldenrod:1},'sells for $36'],
    ['g_garden','GARDEN BOUQUET','garden',[40,85],{fl_zinnia:2,fl_marigold:2,fl_sunflower:1},'sells for $48'],['g_rose','HALF DOZEN ROSES','garden',[60,105],{fl_rose:6},'sells for $110'],
    ['g_corsage','ORCHID CORSAGE','garden',[70,110],{fl_slipper:1,fl_violet:2},'sells for $120']];
  INSPECT.kinds.push({is:id=>/^(fl|sd)_/.test(id)&&FL[id.slice(3)]||!!BQ.find(r=>r[0]===id),make:id=>{ '@later'; const P=INSPECT.part;
    if(id.startsWith('sd_'))return INSPECT.shape('packet',FL[id.slice(3)][3],0xf2ead6);
    const bq=BQ.find(r=>r[0]===id); if(bq)return INSPECT.shape('bouquet',Object.keys(bq[4]).map(f=>FL[f.slice(3)][3]),0xe8dcc0);
    const [, , ,hc,cc,[r,hh,st,cr]]=FL[id.slice(3)], R=r*1.6, H=Math.max(.06,st*1.25), g=new THREE.Group();
    g.add(P('cyl',0x4a8a3a,0,H/2,0,.012,H,.012),P('ball',0x3e7a32,.03,H*.3,0,.07,.012,.03,0,.4),P('ball',hc,0,H,0,R,R*hh,R,0,0,0,{flat:1})); if(cr)g.add(P('ball',cc,0,H+R*hh*.55,0,R*cr,R*cr*.6,R*cr,0,0,0,{flat:1})); return g; }});
  const BP={g_posy:14,g_meadow:28,g_tulip:40,g_aster:36,g_garden:48,g_rose:110,g_corsage:120};
  const NM={}, PR={}; for(const k in FL){ NM['fl_'+k]=FL[k][0]; PR['fl_'+k]=FL[k][2]; } for(const k in WEEK)SEED[k]=WEEK[k]; for(const k in SEED)NM['sd_'+k]=SEED[k][0]; for(const r of BQ)NM[r[0]]=r[1];
  FORAGE.add({names:NM,prices:Object.assign({},PR,BP),recipes:BQ});
  FORAGE.CK.garden={short:'GARD',made:nm=>`YOU TIE A ${nm}.`,fail:'THE STEMS SNAP. THE FLOWERS ARE SPOILED.'};
  FORAGE.HELP.push('GARDENING picks wildflowers, grows flowers from seed on any lawn (the tomato sells seeds) and ties bouquets.');
  const day=()=>window.MAIL&&MAIL.ready?MAIL.day():CITY?CITY.day||0:0, now=()=>day()*24+CLOCK.h, GROW=24;
  GARDEN.beds=[]; GARDEN.now=now; const GR=p=>{ const b=p.bed&&GARDEN.beds.find(q=>q.id===p.bed); return b&&b.grow?b.grow:GROW; };   // a bed of its own (a place's: GARDEN.beds, {id, at(x,z)->y, grow hours}) plants like a lawn
  const S={v:1,picked:{},pd:-1,plots:[],log:{}}; try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1)Object.assign(S,D); S.log=S.log||{}; }catch(e){}
  let saveT=0; const save=()=>OWNED.set(KEY,JSON.stringify(S)), saveSoon=()=>{ clearTimeout(saveT); saveT=setTimeout(save,800); };
  const hsh=(a,b,s)=>{ let h=(Math.floor(a*97)*374761393+Math.floor(b*89)*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const vn=(x,z,s)=>{ const ix=Math.floor(x), iz=Math.floor(z), fx=x-ix, fz=z-iz, u=fx*fx*(3-2*fx), v=fz*fz*(3-2*fz), h=(a,b)=>hsh(a/97,b/89,s); return (h(ix,iz)*(1-u)+h(ix+1,iz)*u)*(1-v)+(h(ix,iz+1)*(1-u)+h(ix+1,iz+1)*u)*v; };
  if(!GRASS.only&&GRASS.MIX)for(const g of GRASS.MIX.gone){ const L=WILD[GRASS.MIX.lawn]={...WILD[GRASS.MIX.lawn]}, G=WILD[g]; for(const t of RARITY.TIERS)L[t]=[].concat(L[t],G[t]); }   // the meadow's flowers on the lawn (7 Nov 2026)
  const pickKind=(g,r,deep)=>{ const T=WILD[g]||WILD['01']; return RARITY.pickFrom(deep?T:{c:T.c,r:T.r},r,'garden',r*5.17)||'dandelion'; };   // the super-rare only deep in the park
  const spawns=(key,grp)=>{ const d=day(), Q=grp.sq, out=[]; for(let i=0;i<Q.length;i+=3){ const x=Q[i], y=Q[i+1], z=Q[i+2], drift=vn(x/T/7,z/T/7,511)>.62;
      if(hsh(x/T+d*.29,z/T,521)>(drift?.05:.005))continue; const k=pickKind(WEEDS.kindAt(x,z),hsh(x/T,z/T+d*.41,523),WEEDS.inPark(x,z,10)), px=x+(hsh(x,z,525)-.5)*.4*T, pz=z+(hsh(z,x,527)-.5)*.4*T;
      out.push({k,x:px,z:pz,y:grp.top(px,y,pz),id:d+':'+Math.round(px*10)+','+Math.round(pz*10),s:.85+.4*hsh(x,z,529),a:hsh(z,x,531)*6.28}); } return out; };
  const NMX=400, mat=new THREE.MeshLambertMaterial({flatShading:true}), grpG=MAPG.bodega||scene;
  const mk=g=>{ const me=new THREE.InstancedMesh(g,mat,NMX); me.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(NMX*3),3); me.count=0; me.frustumCulled=false; me.castShadow=true; me.receiveShadow=true; me.raycast=()=>{}; grpG.add(me); return me; };
  const STEM=mk(new THREE.CylinderGeometry(.18,.24,1,4,1,true).translate(0,.5,0)), HEAD=mk(new THREE.SphereGeometry(1,6,3)), CTR=mk(new THREE.SphereGeometry(1,4,2)), LEAF=mk(new THREE.SphereGeometry(1,4,2));
  const HB=new THREE.BoxGeometry(.6*T,.5*T,.6*T), HM=new THREE.MeshBasicMaterial({visible:false}), hits=new THREE.Group(); grpG.add(hits);
  const CH=new Map(); let things=[]; const m4=new THREE.Matrix4(), q=new THREE.Quaternion(), V3=THREE.Vector3, col=new THREE.Color(), UPA=new V3(0,1,0), WU=T/.84;
  const put=(k,x,y,z,s,a,g,n)=>{ const [, , , hc,cc,[r,hh,st,cr]]=FL[k], R=r*WU*1.6*s, H=Math.max(.04,st*WU*1.25*s*(g<1?.35+.65*g:1)), top=y+H; q.setFromAxisAngle(UPA,a);
    STEM.setMatrixAt(n.s,m4.compose(new V3(x,y,z),q,new V3(.05*WU*s,H,.05*WU*s))); STEM.setColorAt(n.s++,col.setHex(0x4a8a3a));
    LEAF.setMatrixAt(n.l,m4.compose(new V3(x,y+H*.3,z),q,new V3(.07*WU*s,.012*WU,.03*WU*s))); LEAF.setColorAt(n.l++,col.setHex(0x3e7a32));
    if(g<.4)return top; const b=g<1?.45:1;
    HEAD.setMatrixAt(n.h,m4.compose(new V3(x,top,z),q,new V3(R*b,R*hh*(g<1?1.4:1),R*b))); HEAD.setColorAt(n.h++,col.setHex(g<1?0x5a9a4a:hc));
    if(cr&&g>=1){ CTR.setMatrixAt(n.c,m4.compose(new V3(x,top+R*hh*.55,z),q,new V3(R*cr,R*cr*.6,R*cr))); CTR.setColorAt(n.c++,col.setHex(cc)); } return top; };
  const sync=()=>{ hits.clear(); for(const t of things){ const i=UI.things.indexOf(t); if(i>=0)UI.things.splice(i,1); } things=[]; const n={s:0,h:0,c:0,l:0}, t0=now();
    const add=(name,x,y,z,act)=>{ const hb=new THREE.Mesh(HB,HM); hb.position.set(x,y+.15*T,z); hits.add(hb); const th={name,pick:true,obj:hb,reach:.9*T,near:1.6*T,tall:.4*T,act}; UI.thing(th); things.push(th); };
    for(const arr of CH.values())for(const f of arr){ if(S.picked[f.id]||n.s>=NMX-20)continue; put(f.k,f.x,f.y,f.z,f.s,f.a,1,n); add(FL[f.k][0],f.x,f.y,f.z,()=>GARDEN.pick(f)); }
    for(const p of S.plots){ if(n.s>=NMX||Math.hypot(p.x-pos.x,p.z-pos.z)>40*T)continue; const g=Math.min(1,(t0-p.t)/GR(p)); put(p.k,p.x,p.y,p.z,1,p.a||0,g,n);
      add(`YOUR ${FL[p.k][0]} (${g>=1?'IN BLOOM':g<.4?'SPROUTING':'IN BUD'})`,p.x,p.y,p.z,()=>GARDEN.harvest(p)); }
    for(const [me,c] of [[STEM,n.s],[HEAD,n.h],[CTR,n.c],[LEAF,n.l]]){ me.count=c; me.instanceMatrix.needsUpdate=true; if(me.instanceColor)me.instanceColor.needsUpdate=true; } GARDEN.shown=n.s; };
  GARDEN.sync=sync; GARDEN.FL=FL; GARDEN.SEED=SEED; GARDEN.plots=()=>S.plots; GARDEN.lose=p=>{ const i=S.plots.indexOf(p); if(i>=0){ S.plots.splice(i,1); save(); sync(); } }; GARDEN.spots=()=>[...CH.values()].flat().map(f=>[f.k,f.x,f.z]);
  { SYS.add('weedsAdd',(key,grp)=>{ CH.set(key,spawns(key,grp)); sync(); },'144a-garden'); SYS.add('weedsDrop',key=>{ if(CH.delete(key))sync(); },'144a-garden');
    if(WEEDS.chunks)for(const [k,g] of WEEDS.chunks)if(g&&g.sq)CH.set(k,spawns(k,g)); sync(); }
  let st0=-1; SYS.every(()=>{ const d=day(); if(d!==S.pd){ const old=S.pd; S.pd=d; for(const k in S.picked)if(!k.startsWith(d+':'))delete S.picked[k]; if(old!==-1&&WEEDS.chunks){ CH.clear(); for(const [k,g] of WEEDS.chunks)if(g&&g.sq)CH.set(k,spawns(k,g)); } save(); sync(); }
    const st=S.plots.map(p=>Math.min(1,(now()-p.t)/GR(p))<1?Math.floor((now()-p.t)/GR(p)*5):9).join(); if(st!==st0){ st0=st; sync(); } },2000);
  GARDEN.pick=f=>{ '@later'; const [nm,d]=FL[f.k]; SFX.play('step',{vol:.4});
    if(use('garden',d-25,d+25)){ S.picked[f.id]=1; const n=1+(sk('garden')>d+20&&Math.random()<.4?1:0); FORAGE.give('fl_'+f.k,n); S.log[f.k]=(S.log[f.k]||0)+n; say(`YOU PICK ${n>1?n+' ':'A '}${nm}${n>1?'S':''}.`,f.k==='slipper'?'#f2c14e':'#e8e2cc'); }
    else if(Math.random()<.3){ S.picked[f.id]=1; say('YOU CRUSH IT. THE PETALS FALL.','#c8a090'); } else say('THE STEM WILL NOT COME CLEANLY.','#c8a090');
    saveSoon(); sync(); FORAGE.draw(); };
  const lawnAt=(x,z)=>{ for(const b of GARDEN.beds){ const y=b.at(x,z); if(y!=null)return y; } const g=WEEDS.chunks&&WEEDS.chunks.get(Math.floor(x/CS)+','+Math.floor(z/CS)); if(!g||!g.sq)return null; const Q=g.sq; let b=null, bd=(.4*T)**2;
    for(let i=0;i<Q.length;i+=3){ const d=(Q[i]-x)**2+(Q[i+2]-z)**2; if(d<bd){ bd=d; b=i; } } return b==null?null:g.top(x,Q[b+1],z); };
  GARDEN.lawnAt=lawnAt;
  FORAGE.ROWB.push(id=>id.startsWith('sd_')?[['PLANT','gplant']]:[]);
  FORAGE.ACT.gplant=id=>{ '@later'; const k=id.slice(3); if(SHARED.LVL!=='up'||(ROOMS&&ROOMS.cur))return say('PLANT IT IN A LAWN, OUTDOORS.','#c8a090');
    const y=lawnAt(pos.x,pos.z); if(y==null)return say('YOU NEED BARE LAWN UNDER YOUR FEET TO PLANT IT.','#c8a090');
    if(S.plots.length>=12)return say('YOU ALREADY TEND TWELVE PLANTS. PICK SOME FIRST.','#c8a090'); if(S.plots.some(p=>Math.hypot(p.x-pos.x,p.z-pos.z)<.45*T))return say('SOMETHING IS ALREADY PLANTED HERE.','#c8a090');
    FORAGE.take(id,1); MOTION.play('plant'); const bd=GARDEN.beds.find(b=>b.at(pos.x,pos.z)!=null); S.plots.push({k,x:pos.x,y,z:pos.z,t:now(),a:Math.random()*6.28,...(bd?{bed:bd.id}:{})}); say(`YOU PLANT THE ${SEED[k][0]}. IT WILL BLOOM IN A DAY.`,'#9fe07f'); save(); sync(); };
  GARDEN.harvest=p=>{ '@later'; const g=(now()-p.t)/GR(p), [nm,d]=FL[p.k]; if(g<1){ const h=Math.ceil((1-g)*GR(p)); return say(`YOUR ${nm} IS ${g<.4?'STILL A SPROUT':'IN BUD'}. ABOUT ${h} HOUR${h===1?'':'S'} MORE.`,'#c8c2b0'); }
    const i=S.plots.indexOf(p); if(i>=0)S.plots.splice(i,1); SFX.play('step',{vol:.4}); MOTION.play('harvest');
    const R=15*T, near=L=>L.some(q=>Math.hypot(q.x-p.x,q.z-p.z)<R), cs=CREATS.filter(N=>N.wild&&N.body.visible).map(N=>({k:N.kind,x:N.web?N.web.x:N.st.x,z:N.web?N.web.z:N.st.z})), W=WX&&WX.now;
    const help=near(cs.filter(c=>c.k==='Frog'||c.k==='Spider'))||!!(BIRDS&&near(BIRDS.list)), harm=near(cs.filter(c=>c.k==='Rat'))||!!(W&&W.rain>.3&&CLOCK.dark()), pm=help&&!harm?1:harm&&!help?-1:0;
    if(pm>0)say('FROGS, SPIDERS AND BIRDS NEARBY HAVE KEPT THE PESTS OFF.','#9fe07f'); else if(pm<0)say(W&&W.rain>.3?'SLUGS HAVE BEEN AT IT IN THE WET NIGHT.':'RATS HAVE BEEN NIBBLING AT IT.','#c8a090');
    if(use('garden',d-25,d+25)){ const n=Math.max(1,2+(sk('garden')>d+20?1:0)+pm), sd=Math.random()<.35; FORAGE.give('fl_'+p.k,n); S.log[p.k]=(S.log[p.k]||0)+n; if(sd)FORAGE.give('sd_'+p.k,1); say(`YOU CUT ${n} ${nm}S${sd?', AND SAVE A '+SEED[p.k][0].replace(/S$/,''):''}.`,'#b8f0a0'); }
    else { FORAGE.give('fl_'+p.k,1); say(`ONLY ONE ${nm} IS ANY GOOD.`,'#c8a090'); }
    save(); sync(); FORAGE.draw(); };
  const wait=()=>{ if(!VEG.add)return setTimeout(wait,500); VEG.add(Object.fromEntries(Object.keys(SEED).filter(k=>!WEEK[k]).map(k=>['sd_'+k,SEED[k][1]])),Object.assign({},PR,BP)); }; wait();
  const WK=Object.keys(WEEK), week=()=>Math.floor(day()/7)%WK.length; GARDEN.week=()=>WK[week()];
  WK.forEach((k,i)=>FORAGE.SELLS.push(['sd_'+k,WEEK[k][1],()=>week()===i]));
  FORAGE.BOOK.push({id:'flowers',title:'FLOWERS',rows:()=>Object.keys(FL).map(k=>[FL[k][0],!!S.log[k],S.log[k]?'PICKED '+S.log[k]:'',FTIER[k]==='s']),foot:'Each of the six grasses grows a common, a rare and a super-rare wild flower; the super-rare only deep in the park, once the Tomato ranks you high enough. The mushroom seller has a rarer seed each week.'});
  window.GARDDBG=()=>({shown:GARDEN.shown,chunks:CH.size,plots:S.plots.map(p=>({k:p.k,g:+Math.min(1,(now()-p.t)/GROW).toFixed(2)})),garden:sk('garden'),lawn:lawnAt(pos.x,pos.z)}); }
export {GARDEN};
