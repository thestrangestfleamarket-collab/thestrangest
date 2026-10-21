// THE GARDEN: GARDEN, the wild flowers and the garden plots the player can plant.
import {SHARED, THREE} from './003-shx.js';
import {CITY, CLOCK, FORAGE, MAIL, pos, ROOMS, SFX, UI, WEEDS} from './003b-systems.js';
import {scene} from './004-main.js';
import {SAVE} from './005-save.js';
import {MAPG, SYS, TILE} from './006-map-pre.js';
import {VEG} from './144-veggies.js';
const GARDEN={}; window.GARDEN=GARDEN;
{ const T=TILE, KEY='garden', say=FORAGE.say, use=FORAGE.use, sk=FORAGE.sk, CS=8*T;
  const FL={dandelion:['DANDELION',0,1,0xf2c81e,0xe0a810,[.05,.4,.14,.5]],clover:['RED CLOVER',5,1,0xc86a9a,0,[.042,1,.1,0]],daisy:['OXEYE DAISY',15,2,0xf4f2ea,0xf2c81e,[.065,.28,.3,.38]],
    chicory:['CHICORY',25,3,0x7a9af0,0x5a7ad0,[.05,.3,.42,.3]],goldenrod:['GOLDENROD',30,3,0xe8c030,0,[.045,2.6,.5,0]],aster:['NEW YORK ASTER',35,4,0x9a7ae0,0xf2c81e,[.055,.3,.36,.38]],
    violet:['WILD VIOLET',45,6,0x6a3ab0,0xf2e8a0,[.04,.45,.08,.3]],slipper:["PINK LADY'S SLIPPER",75,30,0xe87aa8,0xb04a78,[.06,1.3,.3,.32]],
    marigold:['MARIGOLD',10,3,0xf09020,0xd06010,[.065,.6,.26,.3]],zinnia:['ZINNIA',20,4,0xe03a5a,0xf2c81e,[.07,.38,.36,.32]],tulip:['TULIP',30,6,0xe02a2a,0,[.05,1.4,.32,0]],
    sunflower:['SUNFLOWER',40,8,0xf2c81e,0x5a3a1a,[.15,.28,1.3,.55]],rose:['ROSE',55,14,0xc01a2a,0,[.055,.95,.4,0]]};
  const SEED={marigold:['MARIGOLD SEEDS',1],zinnia:['ZINNIA SEEDS',2],tulip:['TULIP BULB',3],sunflower:['SUNFLOWER SEEDS',2],rose:['ROSE CUTTING',8]};
  const WILD={flat:{dandelion:5,clover:4,daisy:1},roll:{daisy:3,chicory:2,dandelion:2},little:{violet:3,aster:2,clover:1},big:{aster:3,goldenrod:2,violet:1},
    giant:{goldenrod:3,violet:2,slipper:.3},bigflat:{chicory:3,daisy:2,slipper:.2},tuft:{clover:3,dandelion:3,goldenrod:1}};
  const BQ=[['g_posy','WILDFLOWER POSY','garden',[0,45],{fl_daisy:2,fl_clover:2},'sells for $14'],['g_meadow','MEADOW BOUQUET','garden',[20,65],{fl_chicory:2,fl_goldenrod:2,fl_daisy:1},'sells for $28'],
    ['g_tulip','TULIP BUNCH','garden',[30,75],{fl_tulip:5},'sells for $40'],['g_aster','ASTER SPRAY','garden',[35,80],{fl_aster:3,fl_goldenrod:1},'sells for $36'],
    ['g_garden','GARDEN BOUQUET','garden',[40,85],{fl_zinnia:2,fl_marigold:2,fl_sunflower:1},'sells for $48'],['g_rose','HALF DOZEN ROSES','garden',[60,105],{fl_rose:6},'sells for $110'],
    ['g_corsage','ORCHID CORSAGE','garden',[70,110],{fl_slipper:1,fl_violet:2},'sells for $120']];
  const BP={g_posy:14,g_meadow:28,g_tulip:40,g_aster:36,g_garden:48,g_rose:110,g_corsage:120};
  const NM={}, PR={}; for(const k in FL){ NM['fl_'+k]=FL[k][0]; PR['fl_'+k]=FL[k][2]; } for(const k in SEED)NM['sd_'+k]=SEED[k][0]; for(const r of BQ)NM[r[0]]=r[1];
  FORAGE.add({names:NM,prices:Object.assign({},PR,BP),recipes:BQ});
  FORAGE.CK.garden={short:'GARD',made:nm=>`YOU TIE A ${nm}.`,fail:'THE STEMS SNAP. THE FLOWERS ARE SPOILED.'};
  FORAGE.HELP.push('GARDENING picks wildflowers, grows flowers from seed on any lawn (the tomato sells seeds) and ties bouquets.');
  const day=()=>window.MAIL&&MAIL.ready?MAIL.day():window.CITY?CITY.day||0:0, now=()=>day()*24+CLOCK.h, GROW=24;
  const S={v:1,picked:{},pd:-1,plots:[]}; try{ const D=JSON.parse(SAVE.get(KEY)||'null'); if(D&&D.v===1)Object.assign(S,D); }catch(e){}
  let saveT=0; const save=()=>SAVE.set(KEY,JSON.stringify(S)), saveSoon=()=>{ clearTimeout(saveT); saveT=setTimeout(save,800); };
  const hsh=(a,b,s)=>{ let h=(Math.floor(a*97)*374761393+Math.floor(b*89)*668265263+s*1442695041)|0; h=(h^(h>>>13))*1274126177|0; return ((h^(h>>>16))>>>0)/4294967296; };
  const vn=(x,z,s)=>{ const ix=Math.floor(x), iz=Math.floor(z), fx=x-ix, fz=z-iz, u=fx*fx*(3-2*fx), v=fz*fz*(3-2*fz), h=(a,b)=>hsh(a/97,b/89,s); return (h(ix,iz)*(1-u)+h(ix+1,iz)*u)*(1-v)+(h(ix,iz+1)*(1-u)+h(ix+1,iz+1)*u)*v; };
  const pickKind=(g,r,deep)=>{ const W=WILD[g]||WILD.flat; let s=0; for(const k in W)if(k!=='slipper'||deep)s+=W[k]; r*=s; for(const k in W){ if(k==='slipper'&&!deep)continue; if((r-=W[k])<0)return k; } return 'dandelion'; };
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
    for(const p of S.plots){ if(n.s>=NMX||Math.hypot(p.x-pos.x,p.z-pos.z)>40*T)continue; const g=Math.min(1,(t0-p.t)/GROW); put(p.k,p.x,p.y,p.z,1,p.a||0,g,n);
      add(`YOUR ${FL[p.k][0]} (${g>=1?'IN BLOOM':g<.4?'SPROUTING':'IN BUD'})`,p.x,p.y,p.z,()=>GARDEN.harvest(p)); }
    for(const [me,c] of [[STEM,n.s],[HEAD,n.h],[CTR,n.c],[LEAF,n.l]]){ me.count=c; me.instanceMatrix.needsUpdate=true; if(me.instanceColor)me.instanceColor.needsUpdate=true; } GARDEN.shown=n.s; };
  GARDEN.sync=sync;
  { SYS.add('weedsAdd',(key,grp)=>{ CH.set(key,spawns(key,grp)); sync(); },'144a-garden'); SYS.add('weedsDrop',key=>{ if(CH.delete(key))sync(); },'144a-garden');
    if(WEEDS.chunks)for(const [k,g] of WEEDS.chunks)if(g&&g.sq)CH.set(k,spawns(k,g)); sync(); }
  let st0=-1; setInterval(()=>{ const d=day(); if(d!==S.pd){ const old=S.pd; S.pd=d; for(const k in S.picked)if(!k.startsWith(d+':'))delete S.picked[k]; if(old!==-1&&WEEDS.chunks){ CH.clear(); for(const [k,g] of WEEDS.chunks)if(g&&g.sq)CH.set(k,spawns(k,g)); } save(); sync(); }
    const st=S.plots.map(p=>Math.min(1,(now()-p.t)/GROW)<1?Math.floor((now()-p.t)/GROW*5):9).join(); if(st!==st0){ st0=st; sync(); } },2000);
  GARDEN.pick=f=>{ '@later'; const [nm,d]=FL[f.k]; if(typeof SFX!=='undefined')SFX.play('step',{vol:.4});
    if(use('garden',d-25,d+25)){ S.picked[f.id]=1; const n=1+(sk('garden')>d+20&&Math.random()<.4?1:0); FORAGE.give('fl_'+f.k,n); say(`YOU PICK ${n>1?n+' ':'A '}${nm}${n>1?'S':''}.`,f.k==='slipper'?'#f2c14e':'#e8e2cc'); }
    else if(Math.random()<.3){ S.picked[f.id]=1; say('YOU CRUSH IT. THE PETALS FALL.','#c8a090'); } else say('THE STEM WILL NOT COME CLEANLY.','#c8a090');
    saveSoon(); sync(); FORAGE.draw(); };
  const lawnAt=(x,z)=>{ const g=WEEDS.chunks&&WEEDS.chunks.get(Math.floor(x/CS)+','+Math.floor(z/CS)); if(!g||!g.sq)return null; const Q=g.sq; let b=null, bd=(.4*T)**2;
    for(let i=0;i<Q.length;i+=3){ const d=(Q[i]-x)**2+(Q[i+2]-z)**2; if(d<bd){ bd=d; b=i; } } return b==null?null:g.top(x,Q[b+1],z); };
  GARDEN.lawnAt=lawnAt;
  FORAGE.ROWB.push(id=>id.startsWith('sd_')?[['PLANT','gplant']]:[]);
  FORAGE.ACT.gplant=id=>{ '@later'; const k=id.slice(3); if(SHARED.LVL!=='up'||(window.ROOMS&&ROOMS.cur))return say('PLANT IT IN A LAWN, OUTDOORS.','#c8a090');
    const y=lawnAt(pos.x,pos.z); if(y==null)return say('YOU NEED BARE LAWN UNDER YOUR FEET TO PLANT IT.','#c8a090');
    if(S.plots.length>=12)return say('YOU ALREADY TEND TWELVE PLANTS. PICK SOME FIRST.','#c8a090'); if(S.plots.some(p=>Math.hypot(p.x-pos.x,p.z-pos.z)<.45*T))return say('SOMETHING IS ALREADY PLANTED HERE.','#c8a090');
    FORAGE.take(id,1); S.plots.push({k,x:pos.x,y,z:pos.z,t:now(),a:Math.random()*6.28}); say(`YOU PLANT THE ${SEED[k][0]}. IT WILL BLOOM IN A DAY.`,'#9fe07f'); save(); sync(); };
  GARDEN.harvest=p=>{ '@later'; const g=(now()-p.t)/GROW, [nm,d]=FL[p.k]; if(g<1){ const h=Math.ceil((1-g)*GROW); return say(`YOUR ${nm} IS ${g<.4?'STILL A SPROUT':'IN BUD'}. ABOUT ${h} HOUR${h===1?'':'S'} MORE.`,'#c8c2b0'); }
    const i=S.plots.indexOf(p); if(i>=0)S.plots.splice(i,1); if(typeof SFX!=='undefined')SFX.play('step',{vol:.4});
    if(use('garden',d-25,d+25)){ const n=2+(sk('garden')>d+20?1:0), sd=Math.random()<.35; FORAGE.give('fl_'+p.k,n); if(sd)FORAGE.give('sd_'+p.k,1); say(`YOU CUT ${n} ${nm}S${sd?', AND SAVE A '+SEED[p.k][0].replace(/S$/,''):''}.`,'#b8f0a0'); }
    else { FORAGE.give('fl_'+p.k,1); say(`ONLY ONE ${nm} IS ANY GOOD.`,'#c8a090'); }
    save(); sync(); FORAGE.draw(); };
  const wait=()=>{ if(!VEG.add)return setTimeout(wait,500); VEG.add(Object.fromEntries(Object.keys(SEED).map(k=>['sd_'+k,SEED[k][1]])),Object.assign({},PR,BP)); }; wait();
  window.GARDDBG=()=>({shown:GARDEN.shown,chunks:CH.size,plots:S.plots.map(p=>({k:p.k,g:+Math.min(1,(now()-p.t)/GROW).toFixed(2)})),garden:sk('garden'),lawn:lawnAt(pos.x,pos.z)}); }
export {GARDEN};
