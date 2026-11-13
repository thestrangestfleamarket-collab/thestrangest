// FOSSIL DIGS (owner, 10 Nov 2026): PALEONTOLOGY: dig sites in the park (data/world.json parkPlaces.digs) where a trowel brings up a fossil bone or breaks it, by your skill and the rarity rule; a whole set of an animal's bones assembles (the museum's preparation table, or at home) into its skeleton, to keep and show at home, sell to the Professor or donate to the museum, where it stands for everyone (worker/door.js fos).
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INSPECT, INV, ITEMS, MOTION, ONLINE, pos, ROOMS, SFX, TEXT, UI, WEEDS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {LEVEL, MAPG, MODS, QS, SOL, STORE, SYS, TILE} from './006-map-pre.js';
import {RARITY} from './013a-rarity.js';
import {IKIT} from './038zc-ikit.js';
import {FOUNT} from './060a-fount.js';
import {PFI} from './150cyb-pfitems.js';
const FOSSIL={}; window.FOSSIL=FOSSIL;
{ const T=TILE, MW=T/.84, say=(t,c)=>SAY(t,c||'#e8dcb0'), esc=TEXT.esc, KEY='fossils', HALL_AT='art';   // the museum the skeletons stand in (the Museum of Earth is away)
  // the animals: id, name, tier (RARITY), the level a dig of one is set at, its body (slab: pressed in stone), its bones, a bone's worth
  const AN=[['trilobite','TRILOBITE','c',0,'slab',[['head','HEAD SHIELD'],['body','THORAX'],['tail','TAIL SHIELD']],3],
    ['ammonite','AMMONITE','c',8,'slab',[['core','INNER WHORL'],['whorl','OUTER WHORL'],['mouth','APERTURE']],4],
    ['fish','FOSSIL FISH','r',18,'slab',[['skull','SKULL'],['spine','SPINE'],['tail','TAIL FIN']],9],
    ['sabre','SABRE-TOOTHED CAT','c',35,'bones',[['skull','SKULL'],['spine','SPINE'],['ribs','RIBS'],['fore','FORELEGS'],['hind','HIND LEGS']],16],
    ['mastodon','MASTODON','r',45,'bones',[['skull','SKULL'],['tusks','TUSKS'],['spine','SPINE'],['ribs','RIBS'],['legs','LEGS']],30],
    ['raptor','RAPTOR','c',58,'bones',[['skull','SKULL'],['spine','SPINE'],['legs','LEGS'],['claws','CLAWS'],['tail','TAIL']],36],
    ['trike','TRICERATOPS','r',70,'bones',[['skull','SKULL'],['frill','FRILL AND HORNS'],['spine','SPINE'],['ribs','RIBS'],['legs','LEGS'],['tail','TAIL']],60],
    ['trex','TYRANNOSAURUS REX','s',85,'bones',[['skull','SKULL'],['jaw','JAW'],['spine','SPINE'],['ribs','RIBS'],['arms','ARMS'],['legs','LEGS'],['tail','TAIL']],140]].map(([id,name,tier,lv,body,bones,v])=>({id,name,tier,lv,body,bones,v}));
  const BY=Object.fromEntries(AN.map(a=>[a.id,a])), bid=(a,b)=>'fos_'+a+'_'+b, sid=a=>'skel_'+a, skName=a=>a.body==='slab'?a.name+' FOSSIL':a.name+' SKELETON';
  const boneOf=id=>{ const m=/^fos_([a-z]+)_([a-z]+)$/.exec(id); return m&&BY[m[1]]&&BY[m[1]].bones.some(b=>b[0]===m[2])?[BY[m[1]],m[2]]:null; }, skelOf=id=>{ const m=/^skel_([a-z]+)$/.exec(id); return m&&BY[m[1]]||null; };
  FOSSIL.AN=AN; FOSSIL.bid=bid; FOSSIL.sid=sid;

  /* ---------- the skill, the tools, the items ---------- */
  FORAGE.SK.push(['paleo','PALEONTOLOGY']); if(FORAGE.SKC){ const sc=FORAGE.SKC.find(c=>c[0]==='SCIENCE'); if(sc)sc[1].push('paleo'); }
  { const S=FORAGE.S; if(S.sk.paleo==null)S.sk.paleo=0; if(!S.lock.paleo)S.lock.paleo='up'; }
  const NM={trowel:'A TROWEL',fos_brush:'A FOSSIL BRUSH',fos_frag:'FOSSIL FRAGMENTS'}, PR={trowel:15,fos_brush:25,fos_frag:1};
  for(const a of AN){ for(const [b,n] of a.bones){ NM[bid(a.id,b)]=a.name+': '+n; PR[bid(a.id,b)]=a.v; } NM[sid(a.id)]=skName(a); PR[sid(a.id)]=Math.round(a.v*a.bones.length*1.6); }
  FORAGE.add({names:NM,prices:PR,sellable:true});
  ITEMS.reg('trowel',{weight:.4,size:.3}); ITEMS.reg('fos_brush',{weight:.05,size:.17}); ITEMS.reg('fos_frag',{stackable:true,weight:.3});
  FORAGE.BUYK.fossils=['fos_','skel_'];
  FORAGE.HELP.push('PALEONTOLOGY: dig at the fossil sites in the park with a trowel (a brush helps); a whole set of an animal\'s bones assembles at the museum\'s preparation table or at home into its skeleton, to keep, sell to the Professor or donate to the museum.');

  // the saved part: what you have found and made; the museum's hall as the block keeps it (off the website: this page's own)
  let S={v:1,log:{},made:{}}; try{ const o=JSON.parse(OWNED.get(KEY)||'null'); if(o&&o.v===1)S=Object.assign(S,o); }catch(e){} if(QS.get('fresh')&&QS.get('keepinv')!=='1')S={v:1,log:{},made:{}};
  const save=()=>OWNED.set(KEY,JSON.stringify(S)); FOSSIL.S=()=>S;
  FOSSIL.hall={}; if(!QS.get('fresh'))try{ FOSSIL.hall=JSON.parse(OWNED.get('fossilhall')||'{}')||{}; }catch(e){}

  /* ---------- the bodies: parts in metres, one tag (a bone) each, merged into one mesh ---------- */
  const BONE=0xdccca4, BONED=0xb4a07c, STONE=0x928672, STONEL=0xa89c86, INK=0x4e3e2c, V3=THREE.Vector3, Q=THREE.Quaternion, Y=new V3(0,1,0);
  const body=a=>{ '@later'; const L=[]; let tag='', col=BONE; const add=(k,c,p,q,s)=>L.push([tag,k,c,p,q||new Q(),s]);
    const v=p=>new V3(p[0],p[1],p[2]||0), seg=(a0,b0,r,c=col,k='cyl')=>{ const A=v(a0), B=v(b0), d=B.clone().sub(A), l=d.length(); if(l<1e-4)return; add(k,c,A.clone().add(B).multiplyScalar(.5),new Q().setFromUnitVectors(Y,d.divideScalar(l)),new V3(r,l,r)); };
    const chain=(P,r,c)=>{ for(let i=0;i+1<P.length;i++)seg(P[i],P[i+1],typeof r==='function'?r(i/(P.length-1)):r,c); };
    const ball=(p,sx,sy=sx,sz=sx,c=col,q)=>add('ball',c,v(p),q,new V3(sx,sy,sz)), box=(p,sx,sy,sz,c=col,ry=0,rz=0)=>add('box',c,v(p),new Q().setFromEuler(new THREE.Euler(0,ry,rz)),new V3(sx,sy,sz));
    const bez=(a0,c0,b0,n)=>{ const o=[]; for(let i=0;i<=n;i++){ const t=i/n, u=1-t; o.push([u*u*a0[0]+2*u*t*c0[0]+t*t*b0[0],u*u*a0[1]+2*u*t*c0[1]+t*t*b0[1],0]); } return o; };
    const verts=(P,r)=>{ for(let i=0;i<P.length;i++){ const t=i/Math.max(1,P.length-1); ball(P[i],r(t)*1.25,r(t)*1.1,r(t)*1.15); } chain(P,t=>r(t)*.55); };
    if(a.body==='slab'){ const ink=(p,s,c=INK)=>ball([p[0],.012,p[1]],s[0],s[1]||.004,s[2]||s[0],c);
      if(a.id==='trilobite'){ tag='head'; ball([.035,.01,0],.03,.007,.04,INK); ball([.04,.016,.022],.007,.005,.007,0x2a2018); ball([.04,.016,-.022],.007,.005,.007,0x2a2018);
        tag='body'; for(let i=0;i<7;i++){ const x=.012-i*.011; box([x,.011,0],.007,.006,.07-i*.003,INK); } box([-.02,.014,0],.075,.006,.016,0x3a2e20);
        tag='tail'; ball([-.072,.01,0],.022,.006,.026,INK); }
      else if(a.id==='ammonite'){ const sp=(t0,t1,tg)=>{ tag=tg; for(let t=t0;t<t1;t+=.22){ const r=.012*Math.exp(.19*t), s=.006+.18*r; ball([Math.cos(t)*r,.012,Math.sin(t)*r],s,.008+s*.3,s,(Math.round(t/.22)%2)?INK:0x6e5a40); } };
        sp(0,6.5,'core'); sp(6.5,10.6,'whorl'); sp(10.6,12.4,'mouth'); }
      else { tag='skull'; ball([.13,.012,0],.035,.008,.025,INK); ball([.15,.016,.008],.007,.004,.007,0x2a2018); tag='spine'; for(let i=0;i<14;i++){ const x=.09-i*.013; ball([x,.012,0],.005,.005,.005,INK); seg([x,.012,.002],[x-.004,.012,.035-Math.abs(i-6)*.002],.0018,INK); seg([x,.012,-.002],[x-.004,.012,-.035+Math.abs(i-6)*.002],.0018,INK); }
        tag='tail'; for(let i=-3;i<=3;i++)seg([-.1,.012,0],[-.16,.012,i*.012],.002,INK); }
      // the stone it lies in: a slab for each bone, the whole slab for the assembled fossil
      const bb={}; for(const p of L){ const t=p[0], b=bb[t]||(bb[t]=[1e9,1e9,-1e9,-1e9]), r=Math.max(p[5].x,p[5].z); b[0]=Math.min(b[0],p[3].x-r); b[1]=Math.min(b[1],p[3].z-r); b[2]=Math.max(b[2],p[3].x+r); b[3]=Math.max(b[3],p[3].z+r); }
      const m=.012, all=[1e9,1e9,-1e9,-1e9]; for(const t in bb){ const b=bb[t]; tag='slab:'+t; box([(b[0]+b[2])/2,.004,(b[1]+b[3])/2],b[2]-b[0]+m*2,.008,b[3]-b[1]+m*2,STONEL); for(let i=0;i<4;i++)all[i]=i<2?Math.min(all[i],b[i]):Math.max(all[i],b[i]); }
      tag='*'; box([(all[0]+all[2])/2,0,(all[1]+all[3])/2],all[2]-all[0]+m*4,.02,all[3]-all[1]+m*4,STONE); return L; }
    // a backbone from the tail's tip to the skull, ribs hung from it, legs from the hips and shoulders; each animal's shape and which part is which bone
    const B={sabre:{hip:[0,.95],sho:[1.2,1.0],nk:[1.5,1.05],sk:[.36,.2,.17,-.1],tail:[[-.35,.62]],hw:.13,sw:.14,hind:[.045,[.12,.55],[-.14,.14],[.06,0]],fore:[.045,[1.08,.55],[1.18,.1],[1.3,0]],ribN:8,ribR:.24,vr:.04,
        tg:{skull:'skull',neck:'spine',spine:'spine',tail:'spine',ribs:'ribs',fore:'fore',hind:'hind'}},
      mastodon:{hip:[0,2.5],sho:[2.6,2.8],nk:[3.15,2.6],sk:[.95,1.05,.85,-.6],tail:[[-.75,1.6]],hw:.55,sw:.6,hind:[.17,[.15,1.3],[0,.3],[.22,0]],fore:[.18,[2.45,1.4],[2.62,.35],[2.8,0]],ribN:10,ribR:1.0,vr:.14,
        tg:{skull:'skull',tusks:'tusks',neck:'spine',spine:'spine',tail:'spine',ribs:'ribs',fore:'legs',hind:'legs'}},
      raptor:{hip:[0,.85],sho:[.55,.95],nk:[1.0,1.35],nc:[.88,1.0],sk:[.4,.15,.11,-.08],tail:[[-.9,.92],[-1.9,.95]],hw:.08,sw:.08,hind:[.05,[.18,.5],[-.08,.16],[.13,0]],arms:[.028,[.6,.85],[.56,.6],[.78,.52]],ribN:6,ribR:.2,vr:.04,
        tg:{skull:'skull',neck:'spine',spine:'spine',ribs:'spine',hind:'legs',arms:'claws',claw:'claws',tail:'tail'}},
      trike:{hip:[0,2.0],sho:[2.6,1.75],nk:[3.3,1.45],sk:[2.1,.9,.8,-.25],tail:[[-1.8,1.7],[-3.8,1.0]],hw:.5,sw:.55,hind:[.15,[.35,1.15],[-.1,.35],[.42,0]],fore:[.13,[2.42,1.0],[2.72,.3],[2.95,0]],ribN:8,ribR:.85,vr:.12,
        tg:{skull:'skull',frill:'frill',neck:'spine',spine:'spine',ribs:'ribs',fore:'legs',hind:'legs',tail:'tail'}},
      trex:{hip:[0,3.0],sho:[2.2,3.1],nk:[3.3,3.45],nc:[3.0,3.0],sk:[1.5,.8,.62,-.12],tail:[[-3.5,2.9],[-7.0,2.1]],hw:.45,sw:.4,hind:[.17,[.5,1.7],[-.15,.55],[.6,0]],arms:[.05,[2.4,2.6],[2.62,2.25],[2.85,2.3]],ribN:9,ribR:.95,vr:.15,
        tg:{skull:'skull',jaw:'jaw',neck:'spine',spine:'spine',ribs:'ribs',arms:'arms',hind:'legs',tail:'tail'}}}[a.id];
    const t=k=>{ tag=B.tg[k]||B.tg.spine; };
    // the backbone: hips to shoulders, the neck up to the skull, the tail back from the hips
    t('spine'); const back=bez(B.hip,[(B.hip[0]+B.sho[0])/2,Math.max(B.hip[1],B.sho[1])+B.vr*1.5],B.sho,Math.max(4,Math.round((B.sho[0]-B.hip[0])/(B.vr*2.4)))); verts(back,()=>B.vr);
    t('neck'); const nc=B.nc||[(B.sho[0]+B.nk[0])/2,(B.sho[1]+B.nk[1])/2+B.vr]; verts(bez(B.sho,nc,B.nk,Math.max(3,Math.round(Math.hypot(B.nk[0]-B.sho[0],B.nk[1]-B.sho[1])/(B.vr*2)))),q=>B.vr*(1-.25*q));
    t('tail'); { const tp=B.tail, end=tp[tp.length-1], ctl=tp.length>1?tp[0]:[(B.hip[0]+end[0])/2,(B.hip[1]+end[1])/2+B.vr]; const P=bez(B.hip,ctl,end,Math.max(4,Math.round(Math.abs(end[0])/(B.vr*2.2)))); P.shift(); verts(P,q=>B.vr*(1-.8*q)); }
    // the ribs: arcs either side, deepest at the middle of the back
    t('ribs'); for(let i=0;i<B.ribN;i++){ const f=(i+.5)/B.ribN, p=back[Math.min(back.length-1,Math.round(f*(back.length-1)))], R=B.ribR*(.55+.45*Math.sin(Math.PI*Math.min(1,f*1.15))), w=(B.hw+B.sw)/2+R*.15;
      for(const s of [-1,1]){ const P=[]; for(let k=0;k<=5;k++){ const th=Math.PI/2-k/5*Math.PI*.85; P.push([p[0]-k*.012*R,p[1]-B.vr-R+R*Math.sin(th),s*Math.max(B.vr*.6,w*Math.cos(th))]); } chain(P,B.vr*.32,BONED); } }
    // the hips and shoulders; the legs (hips, knee, ankle, toes) either side
    t('hind'); ball([B.hip[0],B.hip[1],0],B.vr*2.6,B.vr*2.2,B.hw*1.1);
    const leg=(root,L,w,claw)=>{ const [r,kn,an,ft]=L; for(const s of [-1,1]){ const z=s*w, A=[root[0],root[1]-B.vr,z], K=[kn[0],kn[1],z], N=[an[0],an[1],z], F=[ft[0],ft[1],z]; seg(A,K,r); seg(K,N,r*.8); seg(N,F,r*.55); ball(K,r*1.15); ball(N,r*.9);
        for(const d of [-1,0,1])seg(F,[F[0]+r*3,0,z+d*r*1.6],r*.3); if(claw){ const c0=tag; tag=B.tg.claw; seg([F[0]+r*.5,r*1.4,z],[F[0]+r*2.2,r*2.8,z],r*.35,BONED,'cone'); tag=c0; } } };
    leg(B.hip,B.hind,B.hw,a.id==='raptor');
    if(B.fore){ t('fore'); for(const s of [-1,1])box([B.sho[0]-B.vr,B.sho[1]-B.vr*2,s*B.sw],B.vr*2.4,B.vr*3.5,B.vr*.6,BONED,0,.4); leg([B.sho[0],B.sho[1]],B.fore,B.sw,false); }
    if(B.arms){ t('arms'); const [r,s0,el,hn]=B.arms; for(const s of [-1,1]){ const z=s*(B.sw+r*2); seg([s0[0],s0[1],z],[el[0],el[1],z],r); seg([el[0],el[1],z],[hn[0],hn[1],z],r*.8); for(const d of [-1,1])seg([hn[0],hn[1],z],[hn[0]+r*3.5,hn[1]-r*2.5,z+d*r],r*.3,BONED,'cone'); } }
    // the skull: a long block tipped down at the snout, eye holes, a jaw and its teeth; the tusks, the fangs, the frill and horns where the animal had them
    t('skull'); { const [sl,sh,sw,tip]=B.sk, b=[B.nk[0]+sl*.5*Math.cos(tip),B.nk[1]+sl*.5*Math.sin(tip)], q=new Q().setFromEuler(new THREE.Euler(0,0,tip));
      add('box',BONE,v([b[0],b[1]+sh*.1,0]),q,new V3(sl,sh*.6,sw)); add('ball',BONE,v([b[0]-sl*.25,b[1]+sh*.15,0]),q,new V3(sl*.32,sh*.5,sw*.55));
      for(const s of [-1,1])ball([b[0]-sl*.12,b[1]+sh*.28,s*sw*.5],sh*.13,sh*.13,sw*.06,0x2a2018);
      if(B.tg.jaw)t('jaw'); const jb=[b[0]+Math.sin(-tip)*sh*.35,b[1]-sh*.38]; add('box',BONED,v(jb),q,new V3(sl*.92,sh*.16,sw*.8));
      if(a.id==='trex'||a.id==='raptor')for(let i=0;i<7;i++){ const f=i/7-.4, x=b[0]+f*sl*Math.cos(tip), y=b[1]+f*sl*Math.sin(tip)-sh*.2; for(const s of [-1,1])seg([x,y,s*sw*.38],[x+sl*.02,y-sh*.16,s*sw*.38],sh*.035,0xf2ead6,'cone'); }
      t('skull');
      if(a.id==='sabre')for(const s of [-1,1])seg([b[0]+sl*.3,b[1]-sh*.1,s*sw*.25],[b[0]+sl*.36,b[1]-sh*.95,s*sw*.22],sh*.09,0xf2ead6,'cone');
      if(a.id==='mastodon'){ t('tusks'); for(const s of [-1,1])chain([[b[0]+sl*.35,b[1]-sh*.35,s*sw*.3],[b[0]+sl*.9,b[1]-sh*.9,s*sw*.45],[b[0]+sl*1.6,b[1]-sh*.75,s*sw*.6],[b[0]+sl*2.0,b[1]-sh*.2,s*sw*.5],[b[0]+sl*2.05,b[1]+sh*.15,s*sw*.3]],q2=>.11-.06*q2,0xf2ead6); }
      if(a.id==='trike'){ t('frill'); add('cyl',BONED,v([B.nk[0]-sl*.05,B.nk[1]+sh*.55,0]),new Q().setFromEuler(new THREE.Euler(0,0,Math.PI/2-.55)),new V3(sh*1.15,.08,sw*1.5));
        for(const s of [-1,1])seg([b[0]-sl*.05,b[1]+sh*.35,s*sw*.32],[b[0]+sl*.4,b[1]+sh*1.25,s*sw*.42],sh*.13,0xf2ead6,'cone'); seg([b[0]+sl*.35,b[1]+sh*.25,0],[b[0]+sl*.45,b[1]+sh*.55,0],sh*.09,0xf2ead6,'cone'); } }
    return L; };
  // the parts of the given tags (null: all) as one mesh, its feet at 0 and centred
  const GEO={}, gOf=k=>GEO[k]||(GEO[k]=(k==='cyl'?new THREE.CylinderGeometry(1,1,1,8,1):k==='cone'?new THREE.ConeGeometry(1,1,8,1):k==='box'?new THREE.BoxGeometry(1,1,1):new THREE.IcosahedronGeometry(1,1)).toNonIndexed());
  const MAT=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.78,metalness:0}); MAT.userData.keep=true;
  const mesh=(L,tags,keep)=>{ '@later'; const P=[], N=[], C=[], m4=new THREE.Matrix4(), n3=new THREE.Matrix3(), c=new THREE.Color(), a=new V3();
    for(const [tg,k,col,p,q,s] of L){ if(tags&&!tags.includes(tg))continue; const g=gOf(k), pa=g.attributes.position.array, na=g.attributes.normal.array; m4.compose(p,q,s); n3.getNormalMatrix(m4); c.setHex(col);
      for(let i=0;i<pa.length;i+=3){ a.set(pa[i],pa[i+1],pa[i+2]).applyMatrix4(m4); P.push(a.x,a.y,a.z); a.set(na[i],na[i+1],na[i+2]).applyMatrix3(n3).normalize(); N.push(a.x,a.y,a.z); C.push(c.r,c.g,c.b); } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
    g.computeBoundingBox(); const b=g.boundingBox; if(!keep)g.translate(-(b.min.x+b.max.x)/2,-b.min.y,-(b.min.z+b.max.z)/2); g.computeBoundingSphere(); const me=new THREE.Mesh(g,MAT); me.castShadow=me.receiveShadow=true; return me; };
  const BODY={}, bodyOf=a=>BODY[a.id]||(BODY[a.id]=body(a));
  // a bone's tags (a slab's bone on its own piece of stone); the whole: every bone, a slab's on its one stone
  const tagsFor=(a,b)=>b?(a.body==='slab'?[b,'slab:'+b]:[b]):a.body==='slab'?[...a.bones.map(x=>x[0]),'*']:null;
  FOSSIL.model=(aid,b)=>{ const a=BY[aid]; return a?mesh(bodyOf(a),tagsFor(a,b)):null; };
  // the things' looks: a bone (its own part of the body, on its own bit of stone for a slab), the whole skeleton, the tools
  const PFL=__LAZY__("data/pffossils.json"); let PFD=null; const pfMesh=k=>{ if(!PFD||!PFD.map[k])return null; const R=PFD.m[PFD.map[k]], g=R.g||(R.g=PFI.decode(R)), m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.85})); m.material.userData.own=1; g.userData.keep=true; m.castShadow=m.receiveShadow=true; return m; };
  SYS.onStart(()=>setTimeout(()=>PFL().then(j=>{ PFD=j; }).catch(e=>console.warn('fossils',e)),3500),'150cyc-fossils');
  INSPECT.kinds.unshift({is:id=>!!boneOf(id)||!!skelOf(id)||id==='trowel'||id==='fos_brush'||id==='fos_frag',make:id=>{ '@later'; const g=new THREE.Group(), P=(...x)=>g.add(INSPECT.part(...x));
    const bo=boneOf(id), sk=skelOf(id); if(bo){ g.add(FOSSIL.model(bo[0].id,bo[1])); return g; } if(sk){ g.add(FOSSIL.model(sk.id)); return g; }
    if(id==='fos_brush'){ const m=pfMesh('fos_brush'); if(m){ g.add(m); g.userData.pf='brush'; return g; } P('cyl',0xb08a5a,0,.006,0,.005,.12,.005,0,Math.PI/2,0,{kind:'wood'}); P('cyl',0xc8ccd2,.065,.006,0,.006,.012,.006,0,Math.PI/2,0,{kind:'metal'}); P('cone',0x3a2e22,.085,.006,0,.007,.03,.007,0,-Math.PI/2); return g; }
    if(id==='trowel'){ P('box',0xc8ccd2,.07,.004,0,.14,.004,.07,0,0,0,{kind:'steel'}); P('cyl',0x8a8e94,-.01,.012,0,.005,.05,.005,0,Math.PI/2,0,{kind:'steel'}); P('cyl',0x7a4a2a,-.08,.016,0,.014,.11,.014,0,Math.PI/2,0,{kind:'wood'}); return g; }
    for(let i=0;i<5;i++)P('dod',i%2?BONE:BONED,Math.cos(i*2.4)*.03,.012,Math.sin(i*2.4)*.03,.018+i%3*.006,.012,.016,0,0,0,{kind:'stone'}); return g; }});
  for(const a of AN){ for(const [b] of a.bones)ITEMS.reg(bid(a.id,b),{weight:a.body==='slab'?.4:a.v/10,tier:{c:'common',r:'rare',s:'super'}[a.tier]}); ITEMS.reg(sid(a.id),{weight:a.body==='slab'?1:a.v,tier:{c:'common',r:'rare',s:'super'}[a.tier]}); }
  // their real sizes, but a big skeleton stands mounted at a size a room holds (the ground and the apartment show them so; the museum at full size)
  const LEN={sabre:1.9,mastodon:5.3,raptor:3.2,trike:9.2,trex:12};
  for(const a of AN)if(LEN[a.id])ITEMS.reg(sid(a.id),{size:Math.min(2.4,LEN[a.id])}); ITEMS.reg(bid('trex','tail'),{size:2.5});

  /* ---------- the dig sites (data/world.json parkPlaces.digs): holes about each, every one dug once a day ---------- */
  const SITES=(((LEVEL.parkPlaces||{}).digs||{}).sites||[]).map(s=>({...s}));
  FOSSIL.sites=()=>SITES;
  const hs=(s,i,k)=>{ let h=0; for(const ch of s+':'+i+':'+k)h=Math.imul(h^ch.charCodeAt(0),2654435761); h^=h>>>15; return ((h>>>0)%100000)/100000; };
  const free=(x,z,r)=>!!(WEEDS.inPark&&WEEDS.inPark(x,z,2))&&!(FOUNT.wet&&FOUNT.wet(x,z,r))&&!SOL.up.some(s=>s[0]<x+r&&s[2]>x-r&&s[1]<z+r&&s[3]>z-r);
  const holes=s=>{ '@later'; if(s.H)return s.H; const cx=SHARED.BOD.XS(s.x), cz=SHARED.BOD.ZS(s.y), R=(s.size||3)*T, n=s.holes||6, H=[];
    for(let i=0;i<n*6&&H.length<n;i++){ const a=hs(s.id,i,1)*6.283, d=(.3+.7*hs(s.id,i,2))*R, x=cx+Math.cos(a)*d, z=cz+Math.sin(a)*d; if(free(x,z,.6*T)&&H.every(h=>Math.hypot(h.x-x,h.z-z)>1.4*T))H.push({x,z,i:H.length}); }
    if(!H.length)return null; s.H=H; s.cx=cx; s.cz=cz; return H; };
  const hkey=(s,h)=>'dig:'+s.id+':'+h.i, ready=(s,h)=>INV.ready(hkey(s,h));
  const gy=(x,z)=>typeof SHARED.groundY==='function'?SHARED.groundY(x,z):0;
  const DIRT=0x6a4c30, DIRTD=0x2e2218;
  const build=s=>{ '@later'; const H=holes(s); if(!H)return; drop(s); const G=new THREE.Group(), L=[], q0=new Q(), rec=(k,c,x,y,z,sx,sy,sz)=>L.push(['',k,c,new V3(x,y,z),q0,new V3(sx,sy,sz)]);
    for(const h of H){ const y=gy(h.x,h.z)-G.position.y; if(ready(s,h)){ rec('ball',DIRT,h.x,y+.05*T,h.z,.6*T,.4*T,.55*T); rec('ball',BONE,h.x+.15*T,y+.4*T,h.z,.14*T,.06*T,.09*T); rec('ball',BONED,h.x-.18*T,y+.37*T,h.z+.1*T,.1*T,.05*T,.07*T); }
      else { rec('cyl',DIRTD,h.x,y+.005*T,h.z,.36*T,.01*T,.36*T); rec('ball',DIRT,h.x+.45*T,y,h.z+.2*T,.22*T,.1*T,.2*T); } }
    // the rope round it on short stakes, and its sign
    const R=(s.size||3)*T+.8*T, cx=s.cx, cz=s.cz; for(let k=0;k<8;k++){ const a=k/8*6.283, b=(k+1)/8*6.283, x=cx+Math.cos(a)*R, z=cz+Math.sin(a)*R, x2=cx+Math.cos(b)*R, z2=cz+Math.sin(b)*R, y=gy(x,z);
      rec('cyl',0x7a5a3a,x,y+.25*MW,z,.03*MW,.5*MW,.03*MW); const d=new V3(x2-x,0,z2-z), l=d.length(); L.push(['','cyl',0xd8c8a0,new V3((x+x2)/2,y+.45*MW,(z+z2)/2),new Q().setFromUnitVectors(Y,d.normalize()),new V3(.008*MW,l,.008*MW)]); }
    G.add(placed(L)); const sx=cx+Math.cos(-.6)*R, sz=cz+Math.sin(-.6)*R, sy=gy(sx,sz), sign=new THREE.Group(); sign.position.set(sx,sy,sz); sign.rotation.y=Math.atan2(sx-cx,sz-cz);
    sign.add(INSPECT.part('box',0x6a4a2a,0,.6*MW,0,.06*MW,1.2*MW,.06*MW,0,0,0,{kind:'wood'})); const tex=IKIT.tex(96,48,(g,w,h)=>{ g.fillStyle='#e8dcbc'; g.fillRect(0,0,w,h); g.fillStyle='#3a2a1a'; g.textAlign='center'; g.font='bold 10px monospace'; g.fillText('FOSSIL DIG',w/2,13); g.font='8px monospace'; g.fillText(s.name,w/2,26); g.fillText('DIGGERS '+(s.band||'ANY'),w/2,38); });
    const pl=new THREE.Mesh(new THREE.PlaneGeometry(.9*MW,.45*MW),new THREE.MeshLambertMaterial({map:tex})); pl.material.userData.own=1; pl.position.set(0,1.15*MW,.04*MW); sign.add(pl); G.add(sign);
    if(s.deco){ const m=pfMesh('dig_'+s.deco); if(m){ const x=cx+(hs(s.id,0,3)-.5)*R*.3, z=cz+(hs(s.id,0,4)-.5)*R*.3; m.position.set(x,gy(x,z)-.05*MW,z); m.scale.setScalar(MW*(s.decoS||1)); m.rotation.y=hs(s.id,0,5)*6.28; G.add(m); } else s.wantDeco=1; }
    // a hole still to dig is a thing to use
    s.th=[]; const HB=new THREE.BoxGeometry(.8*T,.5*T,.8*T), HM=new THREE.MeshBasicMaterial({visible:false});
    for(const h of H){ if(!ready(s,h))continue; const hb=new THREE.Mesh(HB,HM); hb.position.set(h.x,gy(h.x,h.z)+.2*T,h.z); G.add(hb); const th={name:'A FOSSIL BED (DIG WITH A TROWEL)',obj:hb,reach:1.1*T,near:1.8*T,tall:.4*T,act:()=>FOSSIL.dig(s.id,h.i)}; UI.thing(th); s.th.push(th); }
    (MAPG.park||scene).add(G); s.G=G; };
  // a mesh of laid parts in place (not centred)
  const placed=L=>{ const m=mesh(L,null,true); m.frustumCulled=false; return m; };   // (rebuilt as holes are dug: kept out of the cull grid's merged cells)
  const drop=s=>{ if(!s.G)return; s.G.removeFromParent(); s.G.traverse(o=>{ if(o.geometry&&!o.geometry.userData.keep)o.geometry.dispose(); const m=o.material; if(m&&m.userData.own){ if(m.map)m.map.dispose(); m.dispose(); } }); s.G=null; for(const th of s.th||[]){ const i=UI.things.indexOf(th); if(i>=0)UI.things.splice(i,1); } s.th=[]; };
  SYS.every(()=>{ const up=SHARED.LVL==='up'&&!ROOMS.cur; for(const s of SITES){ const x=SHARED.BOD.XS(s.x), z=SHARED.BOD.ZS(s.y), near=up&&Math.hypot(pos.x-x,pos.z-z)<70*T;
      if(near&&(!s.G||s.wantDeco&&PFD)){ s.wantDeco=0; try{ build(s); }catch(e){ console.warn('fossil site',e); } } else if(!near&&s.G)drop(s); } },1000,'150cyc-fossils sites');
  SYS.every(()=>{ for(const s of SITES)if(s.G&&s.H){ const n=s.H.filter(h=>ready(s,h)).length; if(n!==s.th.length)build(s); } },5000,'150cyc-fossils day');   // (a new day fills the dug holes)

  /* ---------- digging: a short action; the find by the rarity rule, whole or broken by your skill ---------- */
  const has=id=>(INV.items[id]||0)>0; let busy=false;
  const pickFind=(s,o={})=>{ const F=s.finds||{c:[s.c||'trilobite']}, r=o.r??Math.random(), aid=RARITY.pickFrom({c:F.c||[],r:F.r||[],s:F.s||[]},r,'paleo',o.r2??Math.random())||(F.c||['trilobite'])[0], a=BY[aid]||AN[0];
    const lack=a.bones.filter(b=>!has(bid(a.id,b[0]))), pool=lack.length&&Math.random()<.6?lack:a.bones, b=pool[Math.floor(Math.random()*pool.length)][0]; return {a,b,tier:RARITY.tierOf({c:F.c,r:F.r,s:F.s},a.id)||a.tier}; };
  FOSSIL.pick=(siteId,r,r2=0)=>{ const s=SITES.find(q=>q.id===siteId); if(!s)return null; const f=pickFind(s,{r,r2}); return {animal:f.a.id,bone:f.b,tier:f.tier}; };
  FOSSIL.dig=(siteId,i,o={})=>{ '@later'; const s=SITES.find(q=>q.id===siteId); if(!s)return Promise.resolve(null); const H=holes(s), h=H&&H.find(q=>q.i===i);
    if(!h)return Promise.resolve(null); if(!has('trowel'))return say('YOU NEED A TROWEL TO DIG FOR FOSSILS. THE PROFESSOR SELLS THEM.','#c8a090'),Promise.resolve(null);
    if(!ready(s,h))return say('THIS BED IS DUG OUT FOR TODAY.','#c8a090'),Promise.resolve(null); if(busy)return Promise.resolve(null); busy=true;
    if(MOTION.play)MOTION.play('plant'); SFX.play('step',{vol:.5}); say(has('fos_brush')?'YOU DIG DOWN WITH THE TROWEL AND BRUSH THE EARTH AWAY...':'YOU DIG DOWN CAREFULLY WITH THE TROWEL...');
    return new Promise(res=>setTimeout(()=>{ busy=false; INV.mark(hkey(s,h)); const f=pickFind(s,o), bonus=has('fos_brush')?10:0, ok=FORAGE.use('paleo',f.a.lv-25,f.a.lv+25,bonus,{ok:o.ok,win:2});
      let id; if(ok){ id=bid(f.a.id,f.b); FORAGE.give(id,1); const L=S.log[f.a.id]||(S.log[f.a.id]={}); L[f.b]=(L[f.b]||0)+1; SFX.play('chirp',{vol:.4});
        say('IT COMES UP WHOLE: '+NM[id]+(f.tier&&f.tier!=='c'?' · '+RARITY.NAMES[f.tier]:'')+'.',f.tier==='s'?'#f2c14e':'#e8e2cc'); }
      else { id='fos_frag'; FORAGE.give(id,1); SFX.play('clunk',{vol:.4}); say('IT CRACKS AS YOU LIFT IT: '+f.a.name.toLowerCase()+' bone, now FOSSIL FRAGMENTS.','#c8a090'); }
      save(); if(s.G)build(s); if(FORAGE.draw)FORAGE.draw(); res({ok,id,animal:f.a.id,bone:f.b,tier:f.tier}); },o.fast?0:1200)); };

  /* ---------- assembling, keeping, giving ---------- */
  FOSSIL.where=()=>STORE.here&&STORE.here(HALL_AT)?'museum':MODS.apts&&MODS.apts.inReal&&!MODS.apts.host?'home':null;
  const setOf=a=>a.bones.map(([b])=>bid(a.id,b)), whole=a=>setOf(a).every(has);
  FOSSIL.assemble=aid=>{ '@later'; const a=BY[aid]; if(!a)return false; if(!FOSSIL.where())return say('ASSEMBLE IT AT THE MUSEUM\'S PREPARATION TABLE, OR AT HOME.','#c8a090'),false;
    if(!whole(a))return say('YOU NEED EVERY BONE OF THE '+a.name+' ('+setOf(a).filter(has).length+' OF '+a.bones.length+').','#c8a090'),false;
    for(const id of setOf(a))FORAGE.take(id,1); FORAGE.give(sid(a.id),1); S.made[a.id]=(S.made[a.id]||0)+1; save(); FORAGE.use('paleo',a.lv-30,a.lv+20); SFX.play('clunk',{vol:.5});
    say('YOU WIRE THE BONES TOGETHER: '+skName(a)+'. KEEP IT, SHOW IT AT HOME, SELL IT TO THE PROFESSOR OR GIVE IT TO THE MUSEUM.','#f2c14e'); if(FORAGE.draw)FORAGE.draw(); draw(); return true; };
  const keepHall=()=>{ try{ OWNED.set('fossilhall',JSON.stringify(FOSSIL.hall)); }catch(e){} };
  FOSSIL.donate=aid=>{ '@later'; const a=BY[aid]; if(!a||!has(sid(aid)))return false; if(FOSSIL.where()!=='museum')return say('BRING IT TO THE MUSEUM TO GIVE IT.','#c8a090'),false;
    if(FOSSIL.hall[aid])return say('THE MUSEUM ALREADY HAS A '+a.name+', GIVEN BY '+FOSSIL.hall[aid].by+'. SELL YOURS TO THE PROFESSOR, OR KEEP IT.','#c8a090'),false;
    if(ONLINE.on){ ONLINE.send({t:'fos',op:'give',k:aid}); say('THE PROFESSOR LOOKS IT OVER...'); return true; }
    if(/^https?:$/.test(location.protocol))return say('THE MUSEUM\'S HALL NEEDS THE BLOCK: YOU ARE NOT ONLINE.','#c8a090'),false;   // (off the website, this page keeps its own hall)
    FORAGE.take(sid(aid),1); FOSSIL.hall[aid]={by:ONLINE.myName?ONLINE.myName():'YOU',at:Date.now()}; keepHall(); given(aid); return true; };
  const given=aid=>{ const a=BY[aid]; say('THE '+a.name+' NOW STANDS IN THE MUSEUM WITH YOUR NAME ON ITS PLAQUE. THANK YOU.','#f2c14e'); SFX.play('chirp',{vol:.5}); hallDraw(); if(FORAGE.draw)FORAGE.draw(); draw(); };
  ONLINE.hear.fos=m=>{ '@later'; if(m.op==='list'&&m.all&&typeof m.all==='object'){ FOSSIL.hall=m.all; hallDraw(); draw(); }
    else if(m.op==='one'&&BY[m.k]){ FOSSIL.hall[m.k]=m.o; hallDraw(); draw(); } else if(m.op==='took'&&BY[m.k]){ FORAGE.take(sid(m.k),1); FOSSIL.hall[m.k]=FOSSIL.hall[m.k]||{by:ONLINE.myName(),at:Date.now()}; given(m.k); }
    else if(m.op==='no')say(String(m.why||'NOT NOW').toUpperCase()+'.','#c8a090'); };
  SYS.add('hi',()=>ONLINE.send({t:'fos',op:'list'}),'150cyc-fossils');
  // the bag: ASSEMBLE on a whole set's bone where you can, GIVE TO THE MUSEUM on a skeleton there; a bone shows how much of its set you hold
  FORAGE.NOTE.push(id=>{ const bo=boneOf(id); return bo?setOf(bo[0]).filter(has).length+' OF '+bo[0].bones.length:''; });
  FORAGE.ROWB.push(id=>{ const bo=boneOf(id), sk=skelOf(id); if(bo&&whole(bo[0])&&FOSSIL.where())return [['ASSEMBLE','fosmake']]; if(sk&&FOSSIL.where()==='museum'&&!FOSSIL.hall[sk.id])return [['GIVE TO THE MUSEUM','fosgive']]; return []; });
  FORAGE.ACT.fosmake=id=>{ const bo=boneOf(id); if(bo)FOSSIL.assemble(bo[0].id); }; FORAGE.ACT.fosgive=id=>{ const sk=skelOf(id); if(sk)FOSSIL.donate(sk.id); };
  FORAGE.BOOK.push({id:'fossils',title:'FOSSILS',rows:()=>AN.map(a=>{ const L=S.log[a.id]||{}, n=a.bones.filter(b=>L[b[0]]).length; return [a.name,n>0,n+' OF '+a.bones.length+' BONES'+(S.made[a.id]?' · ASSEMBLED '+S.made[a.id]:'')+(FOSSIL.hall[a.id]?' · IN THE MUSEUM':''),a.tier==='s']; }),
    foot:'Dig at the fossil sites in the park with a trowel: the brook bank for small fossils, the clay pit by the pond for the Ice Age, the quarry by the cave for dinosaurs. A whole set of an animal\'s bones assembles into its skeleton.'});

  /* ---------- the preparation table's window ---------- */
  const B='style="margin:0 0 0 4px;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:2px 7px;cursor:pointer"';
  let P=null; const panel=()=>{ if(P)return P; P=document.createElement('div'); P.id='fosp'; P.hidden=true; P.setAttribute('role','dialog');
    P.style.cssText='position:fixed;left:50%;top:9%;transform:translateX(-50%);width:min(480px,92vw);max-height:80vh;overflow:auto;z-index:21;padding:14px 16px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
    document.body.appendChild(P); P.addEventListener('keydown',e=>{ if(e.key==='Escape')FOSSIL.close(); e.stopPropagation(); }); P.addEventListener('keyup',e=>e.stopPropagation());
    P.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b)return; const d=b.dataset; if(d.x)FOSSIL.close(); else if(d.make)FOSSIL.assemble(d.make); else if(d.give)FOSSIL.donate(d.give); draw(); }); return P; };
  const draw=()=>{ '@later'; if(!P||P.hidden)return; const w=FOSSIL.where(); let o=`<div style="display:flex;justify-content:space-between"><b style="color:#f2c14e">THE PREPARATION TABLE</b><button ${B} data-x="1">X</button></div><div style="color:#9b9584;margin:4px 0 8px">Lay out an animal's bones and wire them into its skeleton. PALEONTOLOGY ${FORAGE.sk('paleo').toFixed(1)} · ${FORAGE.rank('paleo')}</div><table style="border-collapse:collapse;width:100%">`;
    for(const a of AN){ const n=setOf(a).filter(has).length, k=INV.items[sid(a.id)]||0, h=FOSSIL.hall[a.id];
      o+=`<tr style="border-bottom:1px solid #22252f"><td style="padding:4px 2px">${esc(a.name)}<div style="color:#8a8676;font-size:10px">${a.bones.map(([b,bn])=>`<span style="color:${has(bid(a.id,b))?'#cfe8b0':'#6a665c'}">${esc(bn)}</span>`).join(' · ')}</div>${h?`<div style="color:#f2c14e;font-size:10px">IN THE MUSEUM · GIVEN BY ${esc(h.by)}</div>`:''}</td>
        <td style="text-align:right;padding:4px 6px;white-space:nowrap">${n}/${a.bones.length}${k?' · x'+k:''}</td><td style="text-align:right;white-space:nowrap">${n===a.bones.length&&w?`<button ${B} data-make="${a.id}">ASSEMBLE</button>`:''}${k&&w==='museum'&&!h?`<button ${B} data-give="${a.id}">GIVE</button>`:''}</td></tr>`; }
    P.innerHTML=o+'</table>'; };
  FOSSIL.open=()=>{ panel().hidden=false; draw(); }; FOSSIL.close=()=>{ if(P)P.hidden=true; };

  /* ---------- the hall in the museum: a plinth for each animal, its skeleton on it once given ---------- */
  // (museum metres: the atrium's open floor is about u 4-23.6, v 4-16.3; the door at the front, v high)
  const SLOT={trex:[13.9,10.6,1,0],trike:[13.9,6.0,1,0],mastodon:[21.7,12.2,0,1],raptor:[5.9,12.4,0,1],sabre:[13.6,14.6,1,0],trilobite:[8.9,15.6,1,0],ammonite:[9.7,15.6,1,0],fish:[10.6,15.6,1,0]};   // u, v, the way its head looks
  let HALL=null;
  // each skeleton its own mesh in the scene (the room takes in a new one as its own), taken away when redrawn or when the inside is dropped
  const hallClear=()=>{ if(!HALL)return; for(const m of HALL.M){ m.removeFromParent(); m.geometry.dispose(); } HALL.M=[]; };
  const hallDraw=()=>{ '@later'; if(!HALL||!(STORE.inside[HALL_AT]&&STORE.inside[HALL_AT].done))return; hallClear(); const F=HALL.F;
    for(const a of AN){ if(!FOSSIL.hall[a.id])continue; const [u,v,du,dv]=SLOT[a.id], m=FOSSIL.model(a.id), p=F.pw(u,v); m.scale.setScalar(MW); m.position.set(p[0],(a.body==='slab'?.9:.3)*MW,p[1]); m.rotation.y=F.hd(du,dv)-Math.PI/2; m.frustumCulled=false; scene.add(m); HALL.M.push(m); } };
  const f0=STORE.furnish&&STORE.furnish[HALL_AT]; STORE.furnish=STORE.furnish||{};
  STORE.furnish[HALL_AT]=Sx=>{ '@later'; if(f0)f0(Sx); const F=IKIT.frame({x0:Sx.B.x0,y0:Sx.B.y0,x1:Sx.B.x1,y1:Sx.B.y1}), K=IKIT.room(F,o=>scene.add(o)), {box,cyl,use,pic,words}=K;
    const wood=0x3a2a1e, brass=0xb08838, len={trex:12.6,trike:9.4,mastodon:5.6,raptor:3.6,sabre:2.4};
    for(const a of AN){ const [u,v,,dv]=SLOT[a.id], l=len[a.id]; if(l){ const ww=a.id==='trex'||a.id==='trike'||a.id==='mastodon'?1.6:.9, ex=dv?[ww,l/2]:[l/2,ww];
        box(u-ex[0],v-ex[1],u+ex[0],v+ex[1],0,.3,wood); box(u-ex[0]-.04,v-ex[1]-.04,u+ex[0]+.04,v+ex[1]+.04,0,.06,0x241a12); K.sol(u-ex[0],v-ex[1],u+ex[0],v+ex[1]);
        const pu=u, pv=v+ex[1]+.25; box(pu-.04,pv-.04,pu+.04,pv+.04,0,.9,brass); pic(pu,pv+.05,.85,.42,.26,0,1,words(64,40,'#2a2018',[['THE',32,4,'#c8a868',7,'center'],[a.name.slice(0,16),32,15,'#f0e2b8',7,'center'],['PALEONTOLOGY',32,28,'#9a8a6a',6,'center']]),true);
        use(a.name+' (THE PLAQUE)',pu,pv,.5,1.2,()=>{ const h=FOSSIL.hall[a.id]; say(h?'THE '+a.name+', GIVEN TO THE MUSEUM BY '+h.by+'.':'AN EMPTY PLINTH, WAITING FOR A '+a.name+'. DIG ITS BONES, ASSEMBLE IT AND GIVE IT.','#f2c14e'); },1.4); } }
    // the slabs' case and the preparation table
    { const u=SLOT.ammonite[0], v=SLOT.ammonite[1]; box(u-1.4,v-.4,u+1.4,v+.4,0,.88,wood); box(u-1.42,v-.42,u+1.42,v+.42,.88,.9,0xd8d0c0); K.sol(u-1.45,v-.45,u+1.45,v+.45);
      use('THE CASE OF SMALL FOSSILS',u,v,1.2,1.1,()=>{ const got=['trilobite','ammonite','fish'].filter(k=>FOSSIL.hall[k]); say(got.length?'IN THE CASE: '+got.map(k=>BY[k].name+' (GIVEN BY '+FOSSIL.hall[k].by+')').join(', ')+'.':'THE CASE WAITS FOR ITS FIRST FOSSILS: A TRILOBITE, AN AMMONITE, A FISH.','#f2c14e'); },1.4); }
    { const u=4.6, v=15.6; box(u-1,v-.5,u+1,v+.5,.82,.88,0x8a6a48); for(const [a,b] of [[-.9,-.4],[.9,-.4],[-.9,.4],[.9,.4]])box(u+a-.04,v+b-.04,u+a+.04,v+b+.04,0,.82,0x4a3624); K.sol(u-1,v-.5,u+1,v+.5);
      for(let i=0;i<4;i++)cyl(u-.6+i*.35,v+(i%2?.15:-.1),.04,.88,.92,i%2?BONE:BONED); box(u+.3,v-.3,u+.6,v-.1,.88,.9,0xc8ccd2);
      use('THE PREPARATION TABLE (ASSEMBLE FOSSILS)',u,v,1.6,1.1,()=>FOSSIL.open(),1.6); }
    K.flush(); hallClear(); HALL={F,M:[]}; const R=STORE.inside[HALL_AT]; if(R&&!R.fosUn){ R.fosUn=1; const u0=R.un; R.un=()=>{ if(u0)u0(); hallClear(); }; }
    setTimeout(hallDraw,0); if(ONLINE.on)ONLINE.send({t:'fos',op:'list'}); };
  FOSSIL.hallShown=()=>HALL?HALL.M.filter(m=>m.parent).length:0; FOSSIL.SLOT=SLOT;
  window.FOSDBG=()=>({sk:FORAGE.sk('paleo'),sites:SITES.map(s=>({id:s.id,built:!!s.G,holes:(s.H||[]).length,ready:(s.H||[]).filter(h=>ready(s,h)).length})),hall:FOSSIL.hall,where:FOSSIL.where()}); }
