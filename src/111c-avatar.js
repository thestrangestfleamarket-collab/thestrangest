// THE POLYFORK AVATAR: AVATAR, a body you dress (owner, 5 Nov 2026: "a playable avatar based on the polyfork base character"): Polyfork's man or woman on your rig, three builds, a height, and a wardrobe of every garment the cast wears, every version of it (and their packs and what they hold), each in its own colours; your look is kept with your account and other players see it.
import {THREE} from './003-shx.js';
import {B64, I16, U16} from './003a-skin.js';
import {LOOKS, ONLINE, st, WIELD} from './003b-systems.js';
import {OWNED} from './005-save.js';
import {SYS} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
import {HANDS} from './111b-hands.js';
import {LANYARD} from './111bb-lanyard.js';
const AVATAR={}; window.AVATAR=AVATAR;
{ const I=__DATA__("data/pfavatar.json"), LOAD={m:__LAZY__("data/pfavatar-m.json"),f:__LAZY__("data/pfavatar-f.json")}, D={}, WAIT={}, SW={};
  // the pieces in files of about a megabyte, a kind's versions together, each fetched once something in it is worn (a figure's body and walk come first; c: a piece's file)
  const LZ={m:[__LAZY__("data/pfavatar-m-00.json"),__LAZY__("data/pfavatar-m-01.json"),__LAZY__("data/pfavatar-m-02.json"),__LAZY__("data/pfavatar-m-03.json"),__LAZY__("data/pfavatar-m-04.json"),__LAZY__("data/pfavatar-m-05.json"),__LAZY__("data/pfavatar-m-06.json"),__LAZY__("data/pfavatar-m-07.json"),__LAZY__("data/pfavatar-m-08.json"),__LAZY__("data/pfavatar-m-09.json"),__LAZY__("data/pfavatar-m-10.json"),__LAZY__("data/pfavatar-m-11.json"),__LAZY__("data/pfavatar-m-12.json"),__LAZY__("data/pfavatar-m-13.json"),__LAZY__("data/pfavatar-m-14.json"),__LAZY__("data/pfavatar-m-15.json"),__LAZY__("data/pfavatar-m-16.json"),__LAZY__("data/pfavatar-m-17.json"),__LAZY__("data/pfavatar-m-18.json"),__LAZY__("data/pfavatar-m-19.json"),__LAZY__("data/pfavatar-m-20.json"),__LAZY__("data/pfavatar-m-21.json"),__LAZY__("data/pfavatar-m-22.json"),__LAZY__("data/pfavatar-m-23.json"),__LAZY__("data/pfavatar-m-24.json"),__LAZY__("data/pfavatar-m-25.json"),__LAZY__("data/pfavatar-m-26.json"),__LAZY__("data/pfavatar-m-27.json"),__LAZY__("data/pfavatar-m-28.json"),__LAZY__("data/pfavatar-m-29.json"),__LAZY__("data/pfavatar-m-30.json"),__LAZY__("data/pfavatar-m-31.json")],f:[__LAZY__("data/pfavatar-f-00.json"),__LAZY__("data/pfavatar-f-01.json"),__LAZY__("data/pfavatar-f-02.json"),__LAZY__("data/pfavatar-f-03.json"),__LAZY__("data/pfavatar-f-04.json"),__LAZY__("data/pfavatar-f-05.json"),__LAZY__("data/pfavatar-f-06.json"),__LAZY__("data/pfavatar-f-07.json"),__LAZY__("data/pfavatar-f-08.json"),__LAZY__("data/pfavatar-f-09.json"),__LAZY__("data/pfavatar-f-10.json"),__LAZY__("data/pfavatar-f-11.json"),__LAZY__("data/pfavatar-f-12.json"),__LAZY__("data/pfavatar-f-13.json"),__LAZY__("data/pfavatar-f-14.json"),__LAZY__("data/pfavatar-f-15.json"),__LAZY__("data/pfavatar-f-16.json"),__LAZY__("data/pfavatar-f-17.json"),__LAZY__("data/pfavatar-f-18.json"),__LAZY__("data/pfavatar-f-19.json"),__LAZY__("data/pfavatar-f-20.json"),__LAZY__("data/pfavatar-f-21.json"),__LAZY__("data/pfavatar-f-22.json"),__LAZY__("data/pfavatar-f-23.json"),__LAZY__("data/pfavatar-f-24.json"),__LAZY__("data/pfavatar-f-25.json"),__LAZY__("data/pfavatar-f-26.json"),__LAZY__("data/pfavatar-f-27.json"),__LAZY__("data/pfavatar-f-28.json"),__LAZY__("data/pfavatar-f-29.json"),__LAZY__("data/pfavatar-f-30.json"),__LAZY__("data/pfavatar-f-31.json")]};
  const SLOTS=[['hair','HAIR'],['face','FACE'],['eyes','GLASSES'],['hat','HAT'],['top','TOP'],['coat','JACKET'],['bottom','BOTTOMS'],['feet','SHOES'],['belt','BELT'],['neck','NECK'],['hands','HANDS'],['back','BACK'],['righthand','RIGHT HAND'],['lefthand','LEFT HAND']], OLD=11;   // (the slots after OLD came later: their codes go after the barefoot mark)
  const SKINS=['f3d5bd','e6b892','d9a984','c08a64','a26a45','7e4c2f','5c3622','3e2416'], HAIRC=['1d1712','3b2a1e','5a3a24','8a5a32','b98a4e','d8c28a','8c8c8c','e8e4dc'];
  const EYES=[['2a2019','BRN'],['4a2c17','BRN'],['6b5a2a','HAZ'],['3f6b3a','GRN'],['3b6ea8','BLU'],['6f7b85','GRY'],['8a5a1a','AMB'],['111111','BLK']], EYE0='2a2019';   // (the eye colours to pick, owner 7 Nov 2026, each with the passport's code)
  const BUILDN=['SLIM','MEDIUM','BROAD'], byN=new Map(I.pieces.map(p=>[p.n,p])), nOf=(slot,label)=>{ const p=I.pieces.find(q=>q.slot===slot&&q.label===label); return p?p.n:null; };
  const DEF=()=>({f:'m',b:1,h:100,skin:'d9a984',hair:'4b2519',w:{hair:[nOf('hair','SHORT'),''],top:[nOf('top','T-SHIRT'),''],bottom:[nOf('bottom','TROUSERS'),''],feet:[nOf('feet','SNEAKERS'),'']}});

  /* ---------- a look as a short code for the other players: figure.build.height.skin.hair, then each slot (piece number in base 36, ~colour) ---------- */
  const enc=([s],L)=>{ const w=L.w[s]; return w&&w[0]!=null?w[0].toString(36)+(w[1]?'~'+w[1]:''):''; }, at=i=>i<OLD?5+i:6+i;
  // the designer's shape (8 Nov 2026): each part's SIZE, LENGTH, WIDTH and DEPTH in percent (50–150), a part being one or both sides' bones; in the look code as two base-36 digits a value
  const SHP=AVATAR.SHAPE=[['head','HEAD',[2]],['chest','CHEST',[1]],['hips','HIPS',[0]],['uarm','UPPER ARM',[3,6]],['farm','FOREARM',[4,7]],['hand','HAND',[5,8]],['thigh','THIGH',[9,12]],['shin','SHIN',[10,13]],['foot','FOOT',[11,14]]], SHD=['SIZE','LENGTH','WIDTH','DEPTH'];
  AVATAR.DIMS=SHD;
  const shPlain=sh=>!sh||SHP.every(([k])=>!sh[k]||sh[k].every(v=>v===100));
  const shEnc=sh=>shPlain(sh)?'':SHP.map(([k])=>(sh[k]||[100,100,100,100]).map(v=>Math.max(0,Math.min(100,Math.round(v)-50)).toString(36).padStart(2,'0')).join('')).join('');
  const shDec=c=>{ if(!c||!/^[0-9a-z]+$/.test(c)||c.length!==SHP.length*8)return null; const o={}; SHP.forEach(([k],i)=>{ const v=[0,1,2,3].map(j=>50+(parseInt(c.substr(i*8+j*2,2),36)||0)); if(v.some(x=>x!==100))o[k]=v; }); return Object.keys(o).length?o:null; };
  // a shape on a figure's skeleton: each bone's stretch (along it, across it, front to back) about its own joint, and every joint moved by its parent's; the soles kept on the ground
  const SHC=new Map(), CH={hips:'torso',torso:'head',upperArmL:'forearmL',forearmL:'handL',upperArmR:'forearmR',forearmR:'handR',thighL:'shinL',shinL:'shoeL',thighR:'shinR',shinR:'shoeR'};
  const shapeOf=(f,sh)=>{ if(shPlain(sh))return null; const k=f+shEnc(sh); if(SHC.has(k))return SHC.get(k); const B=BODIES.BONES, P=BODIES.PARENT, S=I.skel[f], O=S.origin.map(o=>new THREE.Vector3(...o)), A=[], V=new THREE.Vector3();
    const part={}; for(const [pk,,ix] of SHP)for(const i of ix)part[i]=sh[pk]||[100,100,100,100];
    B.forEach((n,i)=>{ const v=(part[i]||[100,100,100,100]).map(x=>x/100), sz=v[0]; let u, sd, fr;
      if(/^shoe/.test(n)){ u=new THREE.Vector3(0,0,1); sd=new THREE.Vector3(1,0,0); fr=new THREE.Vector3(0,1,0); }
      else { const c=CH[n]||(/^hand/.test(n)?P[n]:null); u=CH[n]?O[B.indexOf(CH[n])].clone().sub(O[i]):c?O[i].clone().sub(O[B.indexOf(c)]):new THREE.Vector3(0,1,0); u.normalize(); sd=new THREE.Vector3(1,0,0).addScaledVector(u,-u.x).normalize(); fr=new THREE.Vector3().crossVectors(u,sd).normalize(); }
      const M=new THREE.Matrix3(), add=(a,k)=>{ const e=M.elements; for(let r=0;r<3;r++)for(let q=0;q<3;q++)e[q*3+r]+=k*a.getComponent(r)*a.getComponent(q); }; M.elements.fill(0); add(u,sz*v[1]); add(sd,sz*v[2]); add(fr,sz*v[3]); A[i]=M; });
    const O1=O.map(o=>o.clone()); B.forEach((n,i)=>{ if(!P[n])return; const p=B.indexOf(P[n]); O1[i].copy(O1[p]).add(V.copy(O[i]).sub(O[p]).applyMatrix3(A[p])); });
    const sole=i=>V.set(O[i].x,0,O[i].z).sub(O[i]).applyMatrix3(A[i]).add(O1[i]).y, dy=-Math.min(sole(11),sole(14)); for(const o of O1)o.y+=dy;
    const r={O,O1,A}; SHC.set(k,r); return r; };
  // a part's points (rest, metres) moved by the shape: each by its two bones, as they weigh it
  const reshape=(X,d,Z)=>{ const T=new THREE.Vector3(), U=new THREE.Vector3(); for(let q=0;q<X.length/3;q++){ const b1=d.bone[q*2], b2=d.bone[q*2+1], w=d.w[q]/255, x=X[q*3], y=X[q*3+1], z=X[q*3+2];
      T.set(x,y,z).sub(Z.O[b1]).applyMatrix3(Z.A[b1]).add(Z.O1[b1]); U.set(x,y,z).sub(Z.O[b2]).applyMatrix3(Z.A[b2]).add(Z.O1[b2]); X[q*3]=T.x*w+U.x*(1-w); X[q*3+1]=T.y*w+U.y*(1-w); X[q*3+2]=T.z*w+U.z*(1-w); } };
  // the face you picked: eyes-mouth-eye size-mouth size ('' as it came)
  const fxEnc=L=>{ const F=fxOf(L); return F.e||F.m||F.es!==100||F.ms!==100?[F.e,F.m,F.es,F.ms].join('-'):''; };
  const fxDec=v=>{ const m=/^(\d)-(\d)-(\d{2,3})-(\d{2,3})$/.exec(v||''); if(!m)return null; const c=(x,a,b)=>Math.max(a,Math.min(b,+x)); return {e:c(m[1],0,FE.length-1),m:c(m[2],0,FM.length-1),es:c(m[3],50,150),ms:c(m[4],50,150)}; };
  const code=L=>[L.f,L.b,L.h,L.skin,L.hair,...SLOTS.slice(0,OLD).map(x=>enc(x,L)),L.bare?'1':'',...SLOTS.slice(OLD).map(x=>enc(x,L)),L.eye&&L.eye!==EYE0?L.eye:'',L.lan?'1':'',shEnc(L.sh),fxEnc(L)].join('.').replace(/\.+$/,'');   // (then barefoot, then the later slots, then the eyes)
  const hex=s=>/^[0-9a-f]{6}$/.test(s||'')?s:null, cols=s=>/^[0-9a-f]{6}$|^(?:[0-9a-f]{6})?(?:_(?:[0-9a-f]{6})?)+$/.test(s||'')?s:null;   // one colour (the piece's main part), or one a part in the piece's zone order, _ between (an empty part keeps its own)
  const decode=c=>{ '@later'; const a=String(c||'').split('.'), L=DEF(); if(a.length<5)return L;
    L.f=a[0]==='f'?'f':'m'; L.b=Math.min(2,Math.max(0,parseInt(a[1])||0)); L.h=Math.min(110,Math.max(90,parseInt(a[2])||100)); L.skin=hex(a[3])||L.skin; L.hair=hex(a[4])||L.hair; L.w={};
    if(a[5+OLD]==='1')L.bare=true; { const e=hex(a[6+SLOTS.length]); if(e)L.eye=e; } if(a[7+SLOTS.length]==='1')L.lan=1; { const sh=shDec(a[8+SLOTS.length]); if(sh)L.sh=sh; } { const x=fxDec(a[9+SLOTS.length]); if(x)L.fx=x; }
    SLOTS.forEach(([s],i)=>{ const v=a[at(i)]; if(!v)return; const [n,col]=v.split('~'), p=byN.get(parseInt(n,36)); if(p&&p.slot===s&&p.figs.includes(L.f))L.w[s]=[p.n,cols(col)||'']; });
    return L; };

  /* ---------- the figure's data, fetched once someone wears it ---------- */
  const load=f=>D[f]?Promise.resolve(D[f]):(WAIT[f]||(WAIT[f]=LOAD[f]().then(J=>{ J.byN=new Map(); D[f]=J; return J; })));
  const files=(f,w)=>[...new Set(Object.values(w).map(x=>{ const p=x&&byN.get(x[0]); return p&&p.c[f]; }).filter(c=>c!=null))];
  const has=(f,w)=>!!D[f]&&files(f,w).every(c=>SW[f+c]===true);
  const need=(f,w)=>load(f).then(J=>Promise.all(files(f,w).map(c=>SW[f+c]===true?0:(SW[f+c]||(SW[f+c]=LZ[f][c]().then(S=>{ for(const p of S.pieces)J.byN.set(p.n,p); SW[f+c]=true; })))))).then(()=>D[f]);
  // the avatar's other clips (tools/pfavatar-clips.py): a group's file fetched the first time one of its clips is asked for; null until it has come
  const CLF={m:{move:__LAZY__("data/pfanim-m-move.json"),act:__LAZY__("data/pfanim-m-act.json"),emote:__LAZY__("data/pfanim-m-emote.json"),work:__LAZY__("data/pfanim-m-work.json")},
    f:{move:__LAZY__("data/pfanim-f-move.json"),act:__LAZY__("data/pfanim-f-act.json"),emote:__LAZY__("data/pfanim-f-emote.json"),work:__LAZY__("data/pfanim-f-work.json")}}, CLG={}, CLC={};
  for(const [g,ns] of Object.entries({move:['Jog','Crouch','Walk carrying','Walk formal','Hard landing'],act:['Sit down','Sitting','Sitting talking','Stand up','Swimming','Treading water','Punch','Kick','Driving','Pick up','Opening','Interact'],
    emote:['Agree','Head shake','Laughing','Talking','Phone call','Arms folded','Dance','Hip hop','Twist','Swing','Thriller','Drunk idle','Leaning on rail','Calling from rail'],
    work:['Eating','Drinking','Chopping wood','Planting','Watering','Harvesting','Fixing','Pushing','Holding torch','Holding lantern']}))for(const n of ns)CLG[n]=g;
  const clip=(f,n)=>{ const g=CLG[n]; if(!g)return null; const k=f+g, C=CLC[k]; if(C&&C.clips)return C.clips[n]||null;
    if(!C)CLC[k]=CLF[f][g]().then(J=>{ for(const c of Object.values(J.clips)){ c.Q=Float32Array.from(c.q); c.P=Float32Array.from(c.p); } CLC[k]=J; }).catch(e=>{ console.warn('AVATAR clips',e); delete CLC[k]; });
    return null; };
  AVATAR.SKINS=SKINS; AVATAR.HAIRC=HAIRC; AVATAR.EYES=EYES; AVATAR.BUILDN=BUILDN;
  AVATAR.clips=Object.keys(CLG); AVATAR.clip=clip;
  // Polyfork's clips with a move of their own (MOTION 'pf_<key>', 111da): the clip, the part of it played [from, to] in seconds, and whether it loops; on the rig they hold still
  AVATAR.PF={Agree:['Agree',0,1.83],Shake:['Head shake',0,2.57],Laugh:['Laughing',0,9.77],Chat:['Talking',0,2.93,1],Phone:['Phone call',0,2.93,1],Cross:['Arms folded',0,2.5,1],
    Bop:['Dance',0,1,1],HipHop:['Hip hop',0,6.1,1],Twist:['Twist',0,9.43,1],Swing:['Swing',0,2.47,1],Thriller:['Thriller',0,18.87],Drunk:['Drunk idle',0,7.4,1],Lean:['Leaning on rail',0,2.5,1],Call:['Calling from rail',0,2.5,1],
    Chop:['Chopping wood',0,.97,1],Fix:['Fixing',0,5.2,1],Push:['Pushing',0,2.67,1],Torch:['Holding torch',0,1.27,1],Lantern:['Holding lantern',0,2.5,1],Drink:['Drinking',2.1,5.7],Open:['Opening',0,1.37],Use:['Interact',0,2],Land:['Hard landing',0,1.6]};
  // what the avatar plays for what the rig is doing (owner, 7 Nov 2026): the rig's move or state, and Polyfork's clip in its place: n the clip, t seconds into it (or u, the move's
  // share done, played over [a,b]), seat: the hips where the rig has them (a seat, the water); loco: walked by the ground covered like the walk
  const MV={mc_eat:['Drinking',2.1,5.7],mc_plant:'Planting',mc_harvest:'Harvesting',mc_water:'Watering',mc_craft:'Fixing',mc_sitDown:['Sit down',0,1.3,1],pick:'Pick up'};   // (the punches and the slap: the rig's own; the kicks and the hook drawn from Mesh2Motion's recordings, RIG.LOOK)
  const one=(m,e)=>{ const u=m.def&&m.def.dur?Math.min(1,m.t/m.def.dur):0; return typeof e==='string'?{n:e,u,a:0,b:null}:{n:e[0],u,a:e[1],b:e[2],seat:!!e[3]}; };
  AVATAR.act=S=>{ const m=S.move, up=S.up, W=S.water, now=performance.now();
    if(S.sit)S._pfSat=1; else if(S._pfSat){ S._pfSat=0; S._pfUp=now; }   // (up from a seat: Polyfork's stand-up, unless you walk off)
    if(S.ride)return /^(car|kart)$/.test(S.ride.k)?{n:'Driving',loop:1,seat:1}:null;
    if(W&&W.in)return (W.under||0)>.5||(W.back||0)>.5?null:(W.swim||0)>.5?{n:'Swimming',loop:1,seat:1,head:1.5,rest:-2.4}:{n:'Treading water',loop:1,seat:1,head:2,rest:-21};
    if(m){ const n=m.name; if(n.startsWith('mc_pf_')){ const e=AVATAR.PF[n.slice(6)]; return e&&{n:e[0],t:e[1]+(e[3]?m.t%(e[2]-e[1]):Math.min(m.t,e[2]-e[1]))}; }
      if(MV[n])return one(m,MV[n]); if(n==='crouch')return {n:'Crouch',loop:1}; return null; }
    if(up){ if(MV[up.name])return one(up,MV[up.name]); if(up.name==='carry')return {n:'Walk carrying',loco:1}; return null; }
    if(S.sit)return {n:'Sitting',loop:1,seat:1};
    if(S._pfUp&&now-S._pfUp<1030&&(S.w||0)<.3)return {n:'Stand up',t:(now-S._pfUp)/1000};
    if(S.jog)return {n:'Jog',loco:1,idle:1};   // (jog mode, Shift: Polyfork's jog for the walk, the idle where you stop)
    return null; };
  const dec=v=>v.$||(v.$={pos:I16(v.pos),tri:U16(v.tri),bone:B64(v.bone),w:B64(v.w),zone:B64(v.zone),reg:v.reg?B64(v.reg):null});
  // Polyfork's own rule for which of the body's regions its clothes hide (its culled())
  const culled=has=>{ const A=has('arms')&&has('hands'); return [has('trunk')&&has('waist'),has('waist')&&has('seat'),has('briefs'),has('legs')&&(!has('shins')||has('feet')),has('feet'),A,
    has('upperArms')&&has('hands')&&!A,has('upperArms')&&has('armCut')&&!has('hands')&&!has('arms'),has('ears'),has('eyes')]; };
  const lin=h=>new THREE.Color('#'+h);
  // the forearms narrower toward the hand (owner, 7 Nov 2026: "lets make the forearms a little more narrow towards the hand"): every point the forearm moves (skin and the sleeve over it, so layers stay in order)
  // drawn in toward the forearm's line, nothing at the elbow, TAPER less wide at the wrist; with the jointed hands (111b) the wrist is drawn to the hand's own width and thickness instead (owner, 7 Nov 2026: "a and b go")
  const TAPER=.25, TV=new THREE.Vector3(), TA=new THREE.Vector3(), TB=new THREE.Vector3(), CUFF=1.06;
  const taper=(X,d,f)=>{ const O=I.skel[f].origin; for(const [fb,e,w] of [[4,O[4],O[5]],[7,O[7],O[8]]]){ TA.fromArray(e); TB.fromArray(w).sub(TA); const L2=TB.lengthSq();
      for(let q=0;q<X.length/3;q++){ const b0=d.bone[q*2], b1=d.bone[q*2+1], wt=(b0===fb?d.w[q]/255:0)+(b1===fb?1-d.w[q]/255:0); if(wt<=0)continue;
        TV.fromArray(X,q*3).sub(TA); const u=Math.max(0,Math.min(1,TV.dot(TB)/L2)), k=1-TAPER*u*wt; TV.sub(TB.clone().multiplyScalar(u)).multiplyScalar(k).add(TB.clone().multiplyScalar(u)).add(TA); X[q*3]=TV.x; X[q*3+1]=TV.y; X[q*3+2]=TV.z; } } };
  // the wrist across the jointed hand's palm (u1) and through it (u2): the body's own wrist ring and the hand where it meets it, each a centre and half sizes
  const V3=THREE.Vector3, FITS=new Map();
  const wristFit=(Xb,db,L)=>{ const key=L.f+L.b; if(FITS.has(key))return FITS.get(key); const S=I.skel[L.f], O=S.origin, base=HANDS.base(BODIES.skeleton(O,S.rest).binv,{b:L.b}), out=[];
    for(const [fb,hb,sd] of [[4,5,'L'],[7,8,'R']]){ const E=new V3(...O[fb]), W=new V3(...O[hb]), A=W.clone().sub(E), len=A.length(), a=A.clone().divideScalar(len), M=base[sd];
      const u1=new V3().setFromMatrixColumn(M,0); u1.sub(a.clone().multiplyScalar(u1.dot(a))).normalize(); const u2=new V3().crossVectors(a,u1), p=new V3();
      const ext=()=>({x0:1e9,x1:-1e9,y0:1e9,y1:-1e9}), add=(r,v)=>{ v.sub(W); const x=v.dot(u1), y=v.dot(u2); r.x0=Math.min(r.x0,x); r.x1=Math.max(r.x1,x); r.y0=Math.min(r.y0,y); r.y1=Math.max(r.y1,y); };
      const ring=ext(), hand=ext();
      for(let q=0;q<Xb.length/3;q++){ const bn=db.w[q]>=128?db.bone[q*2]:db.bone[q*2+1]; if(bn!==fb&&bn!==hb)continue; p.fromArray(Xb,q*3); if(Math.abs(p.clone().sub(W).dot(a))<.02)add(ring,p); }
      for(let q=0;q<HANDS.X.length/3;q++){ p.fromArray(HANDS.X,q*3).applyMatrix4(M); const t=p.clone().sub(W).dot(a); if(t>-.005&&t<.03)add(hand,p); }
      if(ring.x1<ring.x0||hand.x1<hand.x0)continue;
      const c=r=>[(r.x0+r.x1)/2,(r.y0+r.y1)/2,(r.x1-r.x0)/2,(r.y1-r.y0)/2], R=c(ring), H=c(hand);
      out.push({fb,hb,E,a,len,u1,u2,R,H,kx:Math.min(1,H[2]*CUFF/R[2]),ky:Math.min(1,H[3]*CUFF/R[3])}); }
    FITS.set(key,out); return out; };
  const fitWrist=(X,d,F)=>{ const p=new V3(), q=new V3();
    for(const w of F)for(let i=0;i<X.length/3;i++){ const b0=d.bone[i*2], b1=d.bone[i*2+1], wt=(b0===w.fb||b0===w.hb?d.w[i]/255:0)+(b1===w.fb||b1===w.hb?1-d.w[i]/255:0); if(wt<=0)continue;
      p.fromArray(X,i*3); const t=p.clone().sub(w.E).dot(w.a), s=Math.max(0,Math.min(1,t/w.len))*Math.min(1,wt); if(s<=0)continue;
      q.copy(p).sub(w.E).addScaledVector(w.a,-w.len); const x=q.dot(w.u1), y=q.dot(w.u2);
      const nx=w.R[0]+(x-w.R[0])*(1+(w.kx-1)*s)+(w.H[0]-w.R[0])*s, ny=w.R[1]+(y-w.R[1])*(1+(w.ky-1)*s)+(w.H[1]-w.R[1])*s;
      p.addScaledVector(w.u1,nx-x).addScaledVector(w.u2,ny-y); X[i*3]=p.x; X[i*3+1]=p.y; X[i*3+2]=p.z; } };
  // the passport on its lanyard (owner, 8 Nov 2026: "put it on a lanyard around neck that you wear"): a strap round the back of the neck laid on what you wear there (its outline round the body,
  // band by band); the two strands down the chest and the badge (the passport's tall card) hang as a real string (LANYARD, 111bb)
  const lanyard=(parts,D_,L)=>{ const O=I.skel[L.f].origin, NB=24, NA=32, Y0=O[3][1]-.3, BH=.02, R=new Float32Array(NB*NA); let sz=0, nz=0;
    parts.forEach((P,pi)=>{ if(P.slot==='hair'||P.slot==='back'||P.cape)return; const d=D_[pi], v=P.v, Q=d.pos;
      for(let q=0;q<Q.length/3;q++){ const b=d.w[q]>=128?d.bone[q*2]:d.bone[q*2+1]; const x=(Q[q*3]+32500)*v.sc+v.lo[0], y=(Q[q*3+1]+32500)*v.sc+v.lo[1], z=(Q[q*3+2]+32500)*v.sc+v.lo[2];
        if(pi===0&&P.zones[d.zone[q]]==='eye'){ sz+=z; nz++; } if(b!==1&&b!==2&&b!==3&&b!==6)continue; const j=Math.floor((y-Y0)/BH); if(j<0||j>=NB)continue;
        const a=((Math.atan2(x,z)/(2*Math.PI)+1)%1)*NA|0, r=Math.hypot(x,z); if(r>R[j*NA+a])R[j*NA+a]=r; } });
    const S=nz&&sz<0?-1:1;   // (the way the face looks)
    const rad=(y,t)=>{ const j=Math.max(0,Math.min(NB-1,Math.floor((y-Y0)/BH))), a=((((S>0?t:Math.PI-t)/(2*Math.PI))%1+1)%1)*NA; let m=0; for(let dj=-1;dj<=1;dj++)for(let da=-1;da<=1;da++){ const jj=j+dj; if(jj<0||jj>=NB)continue; m=Math.max(m,R[jj*NA+((Math.floor(a)+da)%NA+NA)%NA]); } return m||.1; };
    const at=(y,t,o)=>{ const r=rad(y,t)+o; return [Math.sin(t)*r,y,S*Math.cos(t)*r]; };
    const T=[], tri=(a,b,c,h)=>T.push([a,b,c,h]), quad=(a,b,c,d,h)=>{ tri(a,b,c,h); tri(a,c,d,h); };
    const strap=(pts,w,h)=>{ for(let i=0;i<pts.length-1;i++){ const [p,t]=pts[i], [q,u]=pts[i+1], dx=q[0]-p[0], dy=q[1]-p[1], dz=q[2]-p[2];
        const side=(P,tt)=>{ const nx=Math.sin(tt), nzz=S*Math.cos(tt), cx=dy*nzz, cy=dz*nx-dx*nzz, cz=-dy*nx, l=Math.hypot(cx,cy,cz)||1; return [[P[0]+cx/l*w,P[1]+cy/l*w,P[2]+cz/l*w],[P[0]-cx/l*w,P[1]-cy/l*w,P[2]-cz/l*w]]; };
        const [a,b]=side(p,t), [c,d]=side(q,u); quad(a,b,d,c,h); } };
    const yN=O[2][1]+.03, yC=O[3][1]-.09, tN=.62, ST='181818';
    const loop=[]; for(let i=0;i<=20;i++){ const t=tN+(2*Math.PI-2*tN)*i/20, k=Math.sin(Math.PI*i/20); loop.push([at(yN+.03*k,t,.014),t]); } strap(loop,.0012,ST);
    let zf=0; for(let y=yC-.16;y<=yC;y+=.02)for(let t=-.35;t<=.35;t+=.07)zf=Math.max(zf,rad(y,t)*Math.cos(t)); zf+=.012;
    const clip=[0,yC,S*zf], str=sd=>{ const pts=[]; for(let i=0;i<14;i++){ const u=i/14, y=yN+(yC-yN)*u, t=sd*(tN+(.1-tN)*u); pts.push(at(y,t,.014)); } pts.push(clip); return pts; };
    const W=.07, H=.1, yt=yC-.012, badge=[], R4=(x0,y0,x1,y1,o,h)=>badge.push([x0,y0-yC,x1,y1-yC,o,h]);
    R4(-.008,yC+.004,.008,yt,0,'9a9a9a'); R4(-W/2,yt,W/2,yt-H,0,'f6f4ec'); R4(-W/2,yt,W/2,yt-H,-.002,'1a1a1a'); R4(-W/2,yt,W/2,yt-.018,.0008,'ffd400');
    const py=yt-.024; R4(-.018,py,.018,py-.036,.0008,'d6e2e8'); R4(-.008,py-.008,.008,py-.026,.0016,L.skin); R4(-.009,py-.004,.009,py-.009,.0018,L.hair); R4(-.015,py-.028,.015,py-.036,.0016,'8aa6b4');
    R4(-.022,py-.042,.022,py-.049,.0008,'111111'); R4(-.016,py-.054,.016,py-.058,.0008,'e53935'); R4(-.026,py-.064,-.004,py-.067,.0008,'666666'); R4(.004,py-.064,.026,py-.067,.0008,'666666');
    T.spec={L:str(1),R:str(-1),H:.012+H,badge,S,rad,col:0x181818}; return T; };
  // the head's top corners rounded (owner, 8 Nov 2026: "round off the head of the avatar with true curves", "we arent round hair just the head shape", "just add rounded corners to
  // the 4 top corners of head"): the body's own head (not what is worn on it) keeps its box below RR from its top; above, its edges to the top bend round on circles of RR; the head's
  // faces over that cut away (clipBelow) for a lid (roundOf's cap), shaded smooth (sm)
  const RR=.05, RN=3, HB=2;
  const hwOf=(d,q)=>(d.bone[q*2]===HB?d.w[q]/255:0)+(d.bone[q*2+1]===HB?1-d.w[q]/255:0);
  const roundOf=(X,d)=>{ const n=X.length/3, hb=q=>d.w[q]>=128?d.bone[q*2]:d.bone[q*2+1]; let top=-1e9;
    for(let q=0;q<n;q++)if(hb(q)===HB)top=Math.max(top,X[q*3+1]); if(!(top>-1e9))return null;
    let x0=1e9, x1=-1e9, z0=1e9, z1=-1e9; for(let q=0;q<n;q++)if(hb(q)===HB&&X[q*3+1]>top-.002){ x0=Math.min(x0,X[q*3]); x1=Math.max(x1,X[q*3]); z0=Math.min(z0,X[q*3+2]); z1=Math.max(z1,X[q*3+2]); }
    const cx=(x0+x1)/2, cz=(z0+z1)/2, hx=(x1-x0)/2, hz=(z1-z0)/2, r=Math.min(RR,hx*.9,hz*.9), ty=top-r;
    const at=(x,y,z,hw,o,i)=>{ let nx=x, ny=y, nz=z; const dy=y-ty;
      if(dy>0&&hw>0){ const ax=Math.abs(x-cx)-(hx-r), az=Math.abs(z-cz)-(hz-r); let yy=y;
        if(ax>0){ const l=Math.hypot(ax,dy); nx=cx+Math.sign(x-cx)*(hx-r+ax/l*r); yy=Math.min(yy,ty+dy/l*r); }
        if(az>0){ const l=Math.hypot(az,dy); nz=cz+Math.sign(z-cz)*(hz-r+az/l*r); yy=Math.min(yy,ty+dy/l*r); }
        nx=x+(nx-x)*hw; nz=z+(nz-z)*hw; ny=y+(yy-y)*hw; }
      o[i]=nx; o[i+1]=ny; o[i+2]=nz; };
    // the lid: the box from ty up as a lattice (finer across the bends) bent by at, each point's normal the mean of its faces that turn less than 60 degrees from each other
    const brk=h=>{ const a=[-h]; for(let i=1;i<RN;i++)a.push(-h+r*i/RN); a.push(-h+r,h-r); for(let i=1;i<RN;i++)a.push(h-r+r*i/RN); a.push(h); return a; }, BX=brk(hx), BZ=brk(hz), BY=[];
    for(let i=0;i<=RN;i++)BY.push(ty+r*i/RN);
    const Q=[], quad=(a,b,c,d)=>{ Q.push([a,b,c],[a,c,d]); }, m=(x,y,z)=>{ const o=[0,0,0]; at(x,y,z,1,o,0); return o; };
    for(let i=0;i<BX.length-1;i++)for(let j=0;j<BZ.length-1;j++)quad(m(cx+BX[i],top,cz+BZ[j]),m(cx+BX[i+1],top,cz+BZ[j]),m(cx+BX[i+1],top,cz+BZ[j+1]),m(cx+BX[i],top,cz+BZ[j+1]));
    for(let k=0;k<RN;k++){ for(const sx of [-1,1])for(let j=0;j<BZ.length-1;j++)quad(m(cx+sx*hx,BY[k],cz+BZ[j]),m(cx+sx*hx,BY[k],cz+BZ[j+1]),m(cx+sx*hx,BY[k+1],cz+BZ[j+1]),m(cx+sx*hx,BY[k+1],cz+BZ[j]));
      for(const sz of [-1,1])for(let i=0;i<BX.length-1;i++)quad(m(cx+BX[i],BY[k],cz+sz*hz),m(cx+BX[i+1],BY[k],cz+sz*hz),m(cx+BX[i+1],BY[k+1],cz+sz*hz),m(cx+BX[i],BY[k+1],cz+sz*hz)); }
    const K=p=>Math.round(p[0]*1e5)+','+Math.round(p[1]*1e5)+','+Math.round(p[2]*1e5), AC=new Map(), V=new THREE.Vector3(), W=new THREE.Vector3();
    const cap=Q.map(t=>{ V.fromArray(t[1]).sub(W.fromArray(t[0])); const e=new THREE.Vector3().fromArray(t[2]).sub(W), n=V.cross(e), ar=n.length(), F={p:t,fn:ar?[n.x/ar,n.y/ar,n.z/ar]:[0,1,0],ar};
      for(const q of t){ const k=K(q); let a=AC.get(k); if(!a)AC.set(k,a=[]); a.push(F); } return F; });
    for(const F of cap)F.nn=F.p.map(q=>{ let x=0, y=0, z=0; for(const G of AC.get(K(q)))if(G.fn[0]*F.fn[0]+G.fn[1]*F.fn[1]+G.fn[2]*F.fn[2]>.5){ x+=G.fn[0]*G.ar; y+=G.fn[1]*G.ar; z+=G.fn[2]*G.ar; } const l=Math.hypot(x,y,z); return l?[x/l,y/l,z/l]:F.fn; });
    return {at,ty,cap}; };
  // a head face below ty (the part over it is the lid's): each point its place in the face (b) and where it is (p), in triangles
  const clipBelow=(V,ty)=>{ const P=[]; for(let i=0;i<3;i++){ const a=V[i], b=V[(i+1)%3], ia=a.p[1]<=ty, ib=b.p[1]<=ty; if(ia)P.push(a);
      if(ia!==ib){ const t=(ty-a.p[1])/(b.p[1]-a.p[1]); P.push({b:a.b.map((x,k)=>x+(b.b[k]-x)*t),p:[a.p[0]+(b.p[0]-a.p[0])*t,ty,a.p[2]+(b.p[2]-a.p[2])*t]}); } }
    const T=[]; for(let i=1;i<P.length-1;i++)T.push([P[0],P[i],P[i+1]]); return T; };
  // the face you pick (owner, 8 Nov 2026: "add all the options and let player select which one they want and the size of each on face"; the eight of mockups/faces.html): eyes and a mouth
  // drawn flat on the face over where the body's own were (style 0: the body's own), each its size; shapes in the mockup's pixels about the eye's or the mouth's middle (y down), in layers
  // R rect, E ellipse, P polygon, S stroke; a colour W white, I iris (your eye colour, or the style's), K pupil, H shine, D the skin's shade, or its own
  const FEYES=['PLAIN','BLOCK','ALMOND','ROUND','SLEEPY','LASHES','DEEP-SET','BIG','NARROW'], FMOUTHS=['PLAIN','BLOCK','LIPS','SMILE','SMALL','FULL LIPS','THIN','GRIN','SMIRK'];
  const qc=(x0,y0,cx,cy,x1,y1,n=8)=>{ const o=[]; for(let i=0;i<=n;i++){ const t=i/n, u=1-t; o.push([u*u*x0+2*u*t*cx+t*t*x1,u*u*y0+2*u*t*cy+t*t*y1]); } return o; };
  const lens=(x0,y0,x1,y1,ct,cb)=>qc(x0,y0,(x0+x1)/2,ct,x1,y1).concat(qc(x1,y1,(x0+x1)/2,cb,x0,y0).slice(1,-1));
  const FE=[null,
    [['R',-20,-7,40,16,'W'],['R',-6,-7,14,16,'I','4f7a3c'],['R',-2,-3,7,9,'K'],['R',3,-5,3,3,'H']],
    [['P',lens(-22,1,22,1,-15,13),'W'],['E',1,0,8,8,'I','4f7a3c'],['E',1,0,4,4,'K'],['E',4,-3,2,2,'H'],['S',qc(-22,1,0,-15,22,1),3,'3a2420']],
    [['E',0,-1,14,14,'W'],['E',2,0,8,8,'I','5a7fb0'],['E',2,0,4,4,'K'],['E',5,-4,2.5,2.5,'H'],['S',qc(-14,-5,0,-19,14,-5),4,'D']],
    [['P',lens(-20,1,20,1,-11,11),'W'],['E',0,2,7,7,'I','6b4a2e'],['E',0,2,3.5,3.5,'K'],['P',qc(-21,1,0,-13,21,1).concat(qc(21,-3,0,-15,-21,-3)),'D'],['R',-21,-5,42,5,'D']],
    [['P',lens(-20,1,20,1,-13,13),'W'],['E',0,0,8,8,'I','7a5a34'],['E',0,0,4,4,'K'],['E',3,-3,2,2,'H'],['S',qc(-22,-1,0,-17,24,-3),4,'1d1414'],['S',qc(-16,-11,0,-19,16,-11),2,'D']],
    [['R',-26,-17,52,12,'D'],['R',-18,-5,36,12,'e6e0d2'],['R',-5,-5,11,12,'I','5d6a72'],['R',-2,-3,5,8,'K'],['R',-18,7,36,4,'D']],
    [['E',0,1,17,14,'W'],['E',1,2,11,11,'I','3f8a7a'],['E',1,2,5,5,'K'],['E',5,-3,3.5,3.5,'H'],['E',-3,6,1.5,1.5,'H'],['S',qc(-17,-1,0,-19,17,-1),3,'2a1a16']],
    [['P',lens(-20,0,20,0,-7,7),'efe9dc'],['E',3,0,5,5,'I','4b5d3a'],['E',3,0,2.5,2.5,'K'],['S',qc(-20,5,0,10,20,5),3,'D']]];
  const FM=[null,
    [['R',-28,-3,56,7,'7e4234'],['R',-24,4,48,6,'a8604e']],
    [['P',qc(-30,-1,-16,-9,0,-3).concat(qc(0,-3,16,-9,30,-1).slice(1),qc(30,-1,0,5,-30,-1).slice(1,-1)),'7e4234'],['P',qc(-30,-1,0,17,30,-1).concat(qc(30,-1,0,5,-30,-1).slice(1,-1)),'a8604e']],
    [['P',qc(-32,-7,0,23,32,-7).concat(qc(32,-7,0,7,-32,-7).slice(1,-1)),'7e4234']],
    [['R',-22,0,44,6,'a8604e']],
    [['R',-4,-21,8,10,'D'],['P',qc(-28,-1,-14,-11,0,-5).concat(qc(0,-5,14,-11,28,-1).slice(1),qc(28,-1,0,3,-28,-1).slice(1,-1)),'b5545a'],['P',qc(-28,-1,0,19,28,-1).concat(qc(28,-1,0,3,-28,-1).slice(1,-1)),'c8676c']],
    [['R',-26,1,52,4,'7e4234'],['R',-28,-1,4,4,'D'],['R',24,-1,4,4,'D']],
    [['P',qc(-30,-9,0,31,30,-9),'5c2424'],['P',[[-27,-7],[27,-7]].concat(qc(27,-7,24,1,0,1).slice(1),qc(0,1,-24,1,-27,-7).slice(1,-1)),'f4efe4']],
    [['S',qc(-24,3,2,5,26,-7),6,'7e4234']]];
  // a simple polygon in triangles (cut ears)
  const ears=P=>{ const n=P.length, I=[...Array(n).keys()], T=[]; let a=0; for(let i=0;i<n;i++){ const p=P[i], q=P[(i+1)%n]; a+=p[0]*q[1]-q[0]*p[1]; } const s=a>0?1:-1;
    const cr=(o,p,q)=>((p[0]-o[0])*(q[1]-o[1])-(p[1]-o[1])*(q[0]-o[0]))*s, inT=(p,a,b,c)=>cr(a,b,p)>=0&&cr(b,c,p)>=0&&cr(c,a,p)>=0;
    for(let g=0;I.length>3&&g<n*n;g++){ const k=g%I.length, ia=I[(k+I.length-1)%I.length], ib=I[k], ic=I[(k+1)%I.length], A=P[ia], B=P[ib], C=P[ic];
      if(cr(A,B,C)<=0)continue; if(I.some(j=>j!==ia&&j!==ib&&j!==ic&&inT(P[j],A,B,C)))continue; T.push([A,B,C]); I.splice(k,1); }
    if(I.length===3)T.push(I.map(i=>P[i])); return T; };
  const shape=(s,o)=>{ const k=s[0]; if(k==='R'){ const [,x,y,w,h]=s; return [[[x,y],[x+w,y],[x+w,y+h]],[[x,y],[x+w,y+h],[x,y+h]]]; }
    if(k==='E'){ const [,cx,cy,rx,ry]=s, T=[], n=16; for(let i=0;i<n;i++){ const a=i/n*2*Math.PI, b=(i+1)/n*2*Math.PI; T.push([[cx,cy],[cx+Math.cos(a)*rx,cy+Math.sin(a)*ry],[cx+Math.cos(b)*rx,cy+Math.sin(b)*ry]]); } return T; }
    if(k==='P')return ears(s[1]);
    const [,pts,w]=s, T=[]; for(let i=0;i<pts.length-1;i++){ const [x0,y0]=pts[i], [x1,y1]=pts[i+1], l=Math.hypot(x1-x0,y1-y0)||1, nx=-(y1-y0)/l*w/2, ny=(x1-x0)/l*w/2;
      T.push([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny]],[[x0+nx,y0+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]]); } return T; };
  const fxOf=L=>Object.assign({e:0,m:0,es:100,ms:100},L.fx||{});
  // the face's triangles [A,B,C,hex] on the body as shaped (X, d): placed on the body's own eyes and mouth, a hair in front of the face
  const faceOf=(X,d,zones,L)=>{ const F=fxOf(L), T=[]; if(!F.e&&!F.m)return T; const n=X.length/3, zi=zones.indexOf('eye'), zm=zones.indexOf('mouth'), zs=zones.indexOf('skin');
    const box=f=>{ let a=[1e9,1e9,1e9], b=[-1e9,-1e9,-1e9], k=0; for(let q=0;q<n;q++)if(f(q)){ k++; for(let j=0;j<3;j++){ a[j]=Math.min(a[j],X[q*3+j]); b[j]=Math.max(b[j],X[q*3+j]); } } return k?[a,b]:null; };
    const sh=lin(L.skin).multiplyScalar(.82).getHexString(), col=(c,s)=>c==='W'?'f2efe6':c==='K'?'151515':c==='H'?'ffffff':c==='D'?sh:c==='I'?(L.eye||s[s.length-1]):c;
    const put=(S,cx,cy,sc,zf,mir)=>S.forEach((s,li)=>{ const z=zf+.0005*(li+1), h=col(s[s[0]==='S'?3:s[0]==='P'?2:5],s); for(const t of shape(s)){ const p=t.map(([x,y])=>[cx+(mir?-x:x)*sc,cy-y*sc,z]); T.push([p[0],p[1],p[2],h]); } });
    const head=q=>(d.w[q]>=128?d.bone[q*2]:d.bone[q*2+1])===HB&&d.zone[q]===zs;
    const front=(x0,x1,y0,y1)=>{ const b=box(q=>head(q)&&Math.abs(X[q*3])>x0&&Math.abs(X[q*3])<x1&&X[q*3+1]>y0&&X[q*3+1]<y1); return b?b[1][2]:null; };
    if(F.e&&zi>=0)for(const sd of [-1,1]){ const b=box(q=>d.zone[q]===zi&&X[q*3]*sd>0); if(!b)continue; const cx=(b[0][0]+b[1][0])/2, cy=(b[0][1]+b[1][1])/2, sc=(b[1][0]-b[0][0])/40*F.es/100;
      put(FE[F.e],cx,cy,sc,(front(.02,.12,cy-.08,cy+.08)??b[0][2])+.0008,sd<0); }
    if(F.m&&zm>=0){ const b=box(q=>d.zone[q]===zm); if(b){ const cx=(b[0][0]+b[1][0])/2, cy=(b[0][1]+b[1][1])/2, sc=(b[1][0]-b[0][0])/56*F.ms/100; put(FM[F.m],cx,cy,sc,(front(.015,.12,cy-.08,cy+.08)??b[0][2])+.0008,false); } }
    return T; };
  function geoFor(J,L,bare,nob){ const worn=[]; for(const [s] of SLOTS){ const w=L.w[s], p=w&&J.byN.get(w[0]); if(p&&!(bare&&s==='feet'))worn.push([s,p,w[1]]); }   // (barefoot: your shoes off, LOOKS.shoes)
    const cov=new Set(); for(const [,p] of worn)for(const c of p.covers)cov.add(c); const hide=culled(c=>cov.has(c));
    const pfh=!cov.has('hands'), hb=(d,q)=>{ const b=d.w[q]>=128?d.bone[q*2]:d.bone[q*2+1]; return b===5||b===8; }, isHand=(P,d,t)=>pfh&&P.slot==='body'&&hb(d,d.tri[t*3])&&hb(d,d.tri[t*3+1])&&hb(d,d.tri[t*3+2]);   // (bare hands: its own simple ones marked hh, folded away while Polyfork's jointed ones are drawn, near the camera: 111b)
    const hat=worn.find(x=>x[0]==='hat'), coat=worn.find(x=>x[0]==='coat');
    const parts=nob?[]:[{v:J.body.v[L.b],zones:J.body.zones,pal:J.body.pal,main:null,col:null,slot:'body'}];
    for(const [s,p,c] of worn){ if(s==='hair'&&cov.has('hair'))continue;
      const alt=(s==='hair'&&hat||s==='top'&&coat&&coat[1].covers.includes('sleeves'))&&p.alt&&p.alt[L.b], v=alt||p.v[L.b]; if(v)parts.push({v,zones:p.zones,pal:p.pal,main:p.main,col:c,slot:s,cape:/CAPE/.test(p.k||p.label)}); }
    let nf=0; const D_=parts.map(P=>dec(P.v)), FX0=fxOf(L), HZ=nob?[]:[FX0.e?J.body.zones.indexOf('eye'):-1,FX0.m?J.body.zones.indexOf('mouth'):-1].filter(z=>z>=0);
    const kept=(d,t,pi)=>!(d.reg&&d.reg[t]<255&&hide[d.reg[t]])&&!(pi===0&&HZ.length&&HZ.includes(d.zone[d.tri[t*3]]));   // (the body's own eyes or mouth off where you picked others)
    const LAN=L.lan?lanyard(parts,D_,L):[], LSP=LAN.spec||null; nf+=LAN.length;
    const unq=(d,v)=>{ const Q=d.pos, X=new Float32Array(Q.length); for(let i=0;i<Q.length;i++)X[i]=(Q[i]+32500)*v.sc+v.lo[i%3]; return X; }, WF=pfh&&!nob?wristFit(unq(D_[0],parts[0].v),D_[0],L):null;
    const SZ=shapeOf(L.f,L.sh);
    const XS=parts.map((P,pi)=>{ const d=D_[pi], X=unq(d,P.v); if(WF&&WF.length)fitWrist(X,d,WF); else taper(X,d,L.f); if(SZ)reshape(X,d,SZ); return X; });
    // the head's top rounded: its box from the body as shaped; the body's points moved (XM), its head faces cut (CUT)
    const RH=nob?null:roundOf(XS[0],D_[0]);
    const FX=nob?[]:faceOf(XS[0],D_[0],J.body.zones,L); nf+=FX.length;
    const XM=[], CUT=[];
    parts.forEach((P,pi)=>{ const d=D_[pi], X=XS[pi], M=new Float32Array(X), cut=new Map(); XM.push(M); CUT.push(cut);
      if(!RH||P.slot!=='body'){ for(let t=0;t<d.tri.length/3;t++)if(kept(d,t,pi))nf++; return; }
      for(let t=0;t<d.tri.length/3;t++){ if(!kept(d,t,pi))continue; const ix=[d.tri[t*3],d.tri[t*3+1],d.tri[t*3+2]]; if(ix.every(q=>X[q*3+1]<=RH.ty)){ nf++; continue; }
        const out=clipBelow(ix.map((q,j)=>({b:[j===0?1:0,j===1?1:0,j===2?1:0],p:[X[q*3],X[q*3+1],X[q*3+2]]})),RH.ty); cut.set(t,out); nf+=out.length; } });
    if(RH)nf+=RH.cap.length;
    const pos=new Float32Array(nf*9), nor=new Float32Array(nf*9), col=new Float32Array(nf*9), bi=new Float32Array(nf*6), bw=new Float32Array(nf*3), fl=new Float32Array(nf*3), hh=new Float32Array(nf*3), fd=new Float32Array(nf*9), sm=new Float32Array(nf*3), va=new THREE.Vector3(), vb=new THREE.Vector3(), vc=new THREE.Vector3(), n=new THREE.Vector3(), e=new THREE.Vector3();
    let f=0;
    parts.forEach((P,pi)=>{ const d=D_[pi], v=P.v, X=XS[pi], XR=XM[pi], cut=CUT[pi];
      let y0=1e9, y1=-1e9; if(P.cape)for(let i=1;i<X.length;i+=3){ y0=Math.min(y0,X[i]); y1=Math.max(y1,X[i]); }   // a cape: how far down it each point is, and which way is out from the body
      const cz=P.col&&P.col.includes('_')?P.col.split('_'):null;
      const C=P.zones.map((z,i)=>{ if(z==='skin')return lin(L.skin); if(P.slot==='body'&&z==='brow')return lin(L.hair); if(P.slot==='body'&&z==='eye'&&L.eye)return lin(L.eye);
        if((P.slot==='hair'||P.slot==='face')&&P.main&&i===P.main[0])return lin(L.hair); if(cz){ if(cz[i])return lin(cz[i]); } else if(P.col&&P.main&&i===P.main[0])return lin(P.col); return lin(String(P.pal[i]).slice(1)); });
      // the head's cut faces as moved, each point's normal the mean of the faces round it that turn less than 60 degrees from its own (the box's other edges stay sharp)
      const CF=new Map(); if(cut.size){ const K=p=>Math.round(p[0]*1e5)+','+Math.round(p[1]*1e5)+','+Math.round(p[2]*1e5), AC=new Map(), all=[];
        for(const [t,list] of cut){ const ix=[d.tri[t*3],d.tri[t*3+1],d.tri[t*3+2]], hw=ix.map(q=>hwOf(d,q)), R=[];
          for(const V of list){ const p=V.map(u=>{ const o=[0,0,0]; RH.at(u.p[0],u.p[1],u.p[2],u.pin?0:u.b[0]*hw[0]+u.b[1]*hw[1]+u.b[2]*hw[2],o,0); return o; });
            va.fromArray(p[0]); vb.fromArray(p[1]); vc.fromArray(p[2]); n.subVectors(vb,va).cross(e.subVectors(vc,va)); const ar=n.length(), fn=ar>0?[n.x/ar,n.y/ar,n.z/ar]:[0,1,0], F={V,p,fn,ar,k:p.map(K)};
            F.k.forEach(k=>{ let a=AC.get(k); if(!a)AC.set(k,a=[]); a.push(F); }); R.push(F); all.push(F); }
          CF.set(t,R); }
        for(const F of all)F.nn=F.k.map(k=>{ let x=0, y=0, z=0; for(const G of AC.get(k))if(G.fn[0]*F.fn[0]+G.fn[1]*F.fn[1]+G.fn[2]*F.fn[2]>.5){ x+=G.fn[0]*G.ar; y+=G.fn[1]*G.ar; z+=G.fn[2]*G.ar; } const l=Math.hypot(x,y,z); return l>0?[x/l,y/l,z/l]:F.fn; }); }
      // a cut point's two bones: the most of its face's corners' bones by its place in the face
      const two=(u,ix)=>{ const j=u.b.indexOf(1); if(j>=0){ const q=ix[j]; return [d.bone[q*2],d.bone[q*2+1],d.w[q]/255]; } const m=new Map();
        ix.forEach((q,j)=>{ if(!u.b[j])return; const w=d.w[q]/255; m.set(d.bone[q*2],(m.get(d.bone[q*2])||0)+u.b[j]*w); m.set(d.bone[q*2+1],(m.get(d.bone[q*2+1])||0)+u.b[j]*(1-w)); });
        const s=[...m].sort((a,b)=>b[1]-a[1]||a[0]-b[0]), a=s[0], b=s[1]||[a[0],0]; return [a[0],b[0],a[1]/(a[1]+b[1])]; };
      for(let t=0;t<d.tri.length/3;t++){ if(!kept(d,t,pi))continue; const ix=[d.tri[t*3],d.tri[t*3+1],d.tri[t*3+2]], ish=isHand(P,d,t)?1:0;
        if(CF.has(t)){ const cs=ix.map(q=>C[d.zone[q]]||C[0]);
          for(const F of CF.get(t)){ F.V.forEach((u,j)=>{ const o=f*3+j, b=u.b, [b0,b1,w]=two(u,ix); pos.set(F.p[j],o*3); nor.set(F.nn[j],o*3);
              col.set([b[0]*cs[0].r+b[1]*cs[1].r+b[2]*cs[2].r,b[0]*cs[0].g+b[1]*cs[1].g+b[2]*cs[2].g,b[0]*cs[0].b+b[1]*cs[1].b+b[2]*cs[2].b],o*3); bi.set([b0,b1],o*2); bw[o]=w; hh[o]=ish; sm[o]=1; }); f++; }
          continue; }
        va.fromArray(XR,ix[0]*3); vb.fromArray(XR,ix[1]*3); vc.fromArray(XR,ix[2]*3); n.subVectors(vb,va).cross(e.subVectors(vc,va)).normalize();
        ix.forEach((q,j)=>{ const o=f*3+j, c=C[d.zone[q]]||C[0]; pos.set([XR[q*3],XR[q*3+1],XR[q*3+2]],o*3); nor.set([n.x,n.y,n.z],o*3); col.set([c.r,c.g,c.b],o*3); bi.set([d.bone[q*2],d.bone[q*2+1]],o*2); bw[o]=d.w[q]/255; hh[o]=ish; if(P.cape){ const u=Math.max(0,(y1-X[q*3+1])/Math.max(1e-3,y1-y0)), x=X[q*3], z=X[q*3+2], l=Math.hypot(x,z)||1; fl[o]=u*u; fd.set([x/l*.2,0,back],o*3); } }); f++; } });
    if(SZ){ const T=new THREE.Vector3(), sh=a=>T.fromArray(a).sub(SZ.O[1]).applyMatrix3(SZ.A[1]).add(SZ.O1[1]).toArray(); for(const t of LAN)for(let j=0;j<3;j++)t[j]=sh(t[j]); if(LSP){ LSP.L=LSP.L.map(sh); LSP.R=LSP.R.map(sh); LSP.shape={O:SZ.O[1],A:SZ.A[1],O1:SZ.O1[1]}; } }   // (the lanyard on the chest as shaped)
    if(RH){ const c=lin(L.skin); for(const F of RH.cap){ F.p.forEach((P,j)=>{ const o=f*3+j; pos.set(P,o*3); nor.set(F.nn[j],o*3); col.set([c.r,c.g,c.b],o*3); bi.set([HB,HB],o*2); bw[o]=1; hh[o]=0; sm[o]=1; }); f++; } }
    for(const [A,B,C3,h] of FX){ const c=lin(h); [A,B,C3].forEach((P,j)=>{ const o=f*3+j; pos.set(P,o*3); nor.set([0,0,1],o*3); col.set([c.r,c.g,c.b],o*3); bi.set([HB,HB],o*2); bw[o]=1; hh[o]=0; }); f++; }
    for(const [A,B,C3,h] of LAN){ const c=lin(h); va.fromArray(A); vb.fromArray(B); vc.fromArray(C3); n.subVectors(vb,va).cross(e.subVectors(vc,va)).normalize();
      [A,B,C3].forEach((P,j)=>{ const o=f*3+j; pos.set(P,o*3); nor.set([n.x,n.y,n.z],o*3); col.set([c.r,c.g,c.b],o*3); bi.set([1,1],o*2); bw[o]=1; hh[o]=0; }); f++; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3));
    g.setAttribute('bi',new THREE.BufferAttribute(bi,2)); g.setAttribute('bw',new THREE.BufferAttribute(bw,1)); g.setAttribute('fl',new THREE.BufferAttribute(fl,1)); g.setAttribute('fd',new THREE.BufferAttribute(fd,3)); g.setAttribute('hh',new THREE.BufferAttribute(hh,1)); g.setAttribute('sm',new THREE.BufferAttribute(sm,1)); g.computeBoundingSphere();
    g.userData.hands=pfh?{skin:L.skin,b:L.b,grip:{L:!!L.w.lefthand,R:!!L.w.righthand}}:null; g.userData.lan=LSP; return g; }
  const empty=()=>{ const g=new THREE.BufferGeometry(); for(const [k,s] of [['position',3],['normal',3],['color',3],['bi',2],['bw',1],['fl',1],['fd',3],['hh',1],['sm',1]])g.setAttribute(k,new THREE.BufferAttribute(new Float32Array(0),s)); return g; };
  // a body's skeleton for a figure and a height (taller: the same body drawn bigger on the rig)
  const fitTo=(body,L)=>{ const S=I.skel[L.f], Z=shapeOf(L.f,L.sh), {off,binv}=BODIES.skeleton(Z?Z.O1.map(o=>o.toArray()):S.origin,S.rest); Object.assign(body,{height:S.height*100/L.h,hipY:Z?Z.O1[0].y:S.hipY,off,binv,contact:true,dq:true,rnd:true,O0:Z?Z.O:null,O1:Z?Z.O1:null}); delete body._calG; delete body._bind; return BODIES.fit(body); };   // (contact: rests on what the rig rests on, 111a)

  /* ---------- you ---------- */
  let L=DEF(); try{ const c=OWNED.get('pfav'); if(c)L=decode(c); }catch(e){}
  const save=()=>{ try{ OWNED.set('pfav',code({...L,bare:false})); }catch(e){} };
  // what you wear on top of your choice: bare feet (LOOKS.shoes), and worn clothes' dyes (EQUIP: a shirt, jacket or coat colours your jacket, or your top without one; trousers your bottoms)
  // and a tool in your hand (WIELD) puts down what that hand held
  const CAPE=nOf('neck','HERO CAPE'), flying=()=>!!(st.fly&&st.fly.on);   // flying (G, 094): the wardrobe's hero cape goes on over what you wear at the neck
  const mine=()=>{ const o=LOOKS.over||{}, w={...L.w}; if(WIELD.on)delete w[WIELD.hand==='L'?'lefthand':'righthand']; if(CAPE!=null&&flying())w.neck=[CAPE,'']; const up=w.coat?'coat':w.top?'top':null; if(o.shirt&&up)w[up]=[w[up][0],o.shirt.replace('#','')]; if(o.pants&&w.bottom)w.bottom=[w.bottom[0],o.pants.replace('#','')]; return {...L,w,bare:!!(LOOKS.L&&LOOKS.L.bare)}; };
  const VAR=new Map(), BAD=new Set();
  const onMesh=(me,PM,b)=>{ const h=me.geometry.userData.hands; if(h)HANDS.add(me,PM,b,h); const ly=me.geometry.userData.lan; if(ly)LANYARD.add(me,PM,ly); };
  const body={key:'avatar',label:'AVATAR',playable:true,flap:true,geo:empty,onMesh:(me,PM)=>onMesh(me,PM,body),look:()=>code(mine()),clip:n=>clip(L.f,n),act:S=>AVATAR.act(S),
    failed:c=>BAD.has(String(c)),variant:c=>{ '@later'; const k=String(c); let b=VAR.get(k); if(b)return b; const M=decode(k), J=D[M.f];
      if(!has(M.f,M.w)){ if(BAD.has(k))return null; need(M.f,M.w).then(()=>{ if(ONLINE.refig)ONLINE.refig('b:avatar'); }).catch(e=>{ BAD.add(k); console.warn('AVATAR',e); if(ONLINE.refig)ONLINE.refig('b:avatar'); }); return null; }
      b=fitTo({key:'avatar~'+k,flap:true,geo:()=>geoFor(J,M,M.bare),anim:J.anim||null,clip:n=>clip(M.f,n),act:AVATAR.act,onMesh:(me,PM)=>onMesh(me,PM,b)},M); VAR.set(k,b); return b; }};
  AVATAR.code=()=>code(L); AVATAR.worn=()=>mine().w; AVATAR.decode=decode; AVATAR.L=()=>L; AVATAR.ready=()=>has(L.f,L.w);
  let gen=0;
  const refresh=()=>{ const my=++gen, M0=mine(); return need(L.f,M0.w).then(J=>{ if(my!==gen)return; fitTo(body,L); const M=mine(); body.GEO=geoFor(J,M,M.bare); body.anim=J.anim||null; draw(); }).catch(e=>console.warn('AVATAR',e)); };
  AVATAR.set=o=>{ L=Object.assign(L,o); if(o.f){ for(const s in L.w)if(L.w[s]&&!byN.get(L.w[s][0]).figs.includes(L.f))delete L.w[s]; } save(); return refresh(); };
  AVATAR.wear=(slot,n,c)=>{ if(n==null)delete L.w[slot]; else L.w[slot]=[n,c||(L.w[slot]&&L.w[slot][0]===n?L.w[slot][1]:'')]; save(); return refresh(); };

  /* ---------- YOU: the avatar's lines (LOOKS.add) — figure, build, height, skin and hair colour on LOOK; a piece and its colour for each slot on WEAR ---------- */
  const $=s=>document.querySelector(s);
  const css=document.createElement('style'); css.textContent=`#looks .sw{padding:3px!important} #looks .sw i{display:block;width:16px;height:16px}
    #looks .avk{display:flex;flex-wrap:wrap;gap:3px;max-width:126px} #looks .avk input[type=color]{width:22px;height:22px} #looks .avw{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr) auto;gap:4px;align-items:center} #looks .avw select{font:inherit;color:inherit;background:#0b0d13;border:2px solid #2a3040;padding:2px;min-width:0;width:100%}
    #looks input[type=color]{width:30px;height:24px;padding:0;border:2px solid #2a3040;background:#0b0d13} #looks input[type=range]{width:min(220px,100%)} #looks .dim{color:var(--dim,#8a8f9c)}`;
  document.head.appendChild(css);
  const stop=el=>el.addEventListener('keydown',e=>e.stopPropagation());
  const el=(id,html,cls='row')=>{ const d=document.createElement('div'); d.className=cls; if(id)d.id=id; d.innerHTML=html; return d; };
  let made=false;
  function panel(){ if(made)return true; if(!LOOKS.add||!$('#looks'))return false; made=true; const A={who:'avatar'};
    LOOKS.add('avf','FIGURE',el('lavf','<button data-f="m">MAN</button><button data-f="f">WOMAN</button>'),{...A,order:1});
    LOOKS.add('avb','BUILD',el('lavb',BUILDN.map((t,i)=>`<button data-b="${i}">${t}</button>`).join('')),{...A,order:2});
    LOOKS.add('avh','HEIGHT',el(null,'<input type="range" id="lavh" min="90" max="110" step="1" aria-label="height"><span id="lavhv" class="dim"></span>'),{...A,order:3});
    LOOKS.add('avs','SKIN',el('lavs',SKINS.map(h=>`<button class="sw" data-c="${h}" aria-label="skin #${h}"><i style="background:#${h}"></i></button>`).join('')+'<input type="color" id="lavsc" aria-label="any skin colour">'),{...A,order:4});
    LOOKS.add('avc','HAIR COLOUR',el('lavc',HAIRC.map(h=>`<button class="sw" data-c="${h}" aria-label="hair #${h}"><i style="background:#${h}"></i></button>`).join('')+'<input type="color" id="lavcc" aria-label="any hair colour">'),{...A,order:5});
    for(const [k,t,N,o] of [['e','EYES',FEYES,5.1],['m','MOUTH',FMOUTHS,5.2]])LOOKS.add('avx'+k,t,el(null,`<select id="lavx${k}" aria-label="${t.toLowerCase()} style">${N.map((n,i)=>`<option value="${i}">${n}</option>`).join('')}</select><input type="range" id="lavx${k}s" min="50" max="150" step="5" aria-label="${t.toLowerCase()} size"><span id="lavx${k}v" class="dim"></span>`),{...A,order:o});
    LOOKS.add('avwear','OUTFIT',el(null,'<button id="lavgo">CHOOSE WHAT YOU WEAR</button><span id="lavw" class="dim"></span>'),{...A,order:6});
    LOOKS.add('w-outfit','OUTFIT',el(null,'<select id="lavog" aria-label="outfit theme"></select><select id="lavo" aria-label="outfit"></select><span></span>','avw'),{...A,tab:'wear',order:-1});
    SLOTS.forEach(([s,t],i)=>LOOKS.add('w-'+s,t,el(null,`<select id="lavt-${s}" aria-label="${t} kind"></select><select id="lav-${s}" aria-label="${t} version"></select><span id="lavk-${s}" class="avk"></span>`,'avw'),{...A,tab:'wear',order:i}));
    $('#lavgo').onclick=()=>LOOKS.tab('wear');
    for(const k of 'em'){ const sel=$('#lavx'+k), r=$('#lavx'+k+'s'); stop(sel); stop(r); sel.onchange=()=>AVATAR.set({fx:{...fxOf(L),[k]:+sel.value}});
      r.oninput=()=>{ $('#lavx'+k+'v').textContent=' '+r.value+'%'; }; r.onchange=()=>AVATAR.set({fx:{...fxOf(L),[k+'s']:+r.value}}); }
    $('#lavf').onclick=e=>{ const b=e.target.closest('button'); if(b)AVATAR.set({f:b.dataset.f}); };
    $('#lavb').onclick=e=>{ const b=e.target.closest('button'); if(b)AVATAR.set({b:+b.dataset.b}); };
    const h=$('#lavh'); stop(h); h.oninput=()=>{ $('#lavhv').textContent=' '+h.value+'%'; }; h.onchange=()=>AVATAR.set({h:+h.value});
    $('#lavs').onclick=e=>{ const b=e.target.closest('button'); if(b)AVATAR.set({skin:b.dataset.c}); }; $('#lavsc').onchange=e=>AVATAR.set({skin:e.target.value.slice(1)});
    $('#lavc').onclick=e=>{ const b=e.target.closest('button'); if(b)AVATAR.set({hair:b.dataset.c}); }; $('#lavcc').onchange=e=>AVATAR.set({hair:e.target.value.slice(1)});
    // OUTFITS: a theme, then one of the cast in it; their whole look goes on (what your figure can wear of it), their hair colour too
    const og=$('#lavog'), ol=$('#lavo'), OG=[...new Set((I.outfits||[]).map(o=>o.g))].sort(); stop(og); stop(ol);
    og.innerHTML='<option value="">THEME…</option>'+OG.map(g=>`<option>${esc(g)}</option>`).join('');
    og.onchange=()=>{ ol.innerHTML='<option value="">WHO…</option>'+(I.outfits||[]).map((o,i)=>[o,i]).filter(([o])=>o.g===og.value).sort((a,b)=>a[0].t.localeCompare(b[0].t)).map(([o,i])=>`<option value="${i}">${esc(o.t)}</option>`).join(''); ol.style.visibility=og.value?'':'hidden'; };
    ol.onchange=()=>{ if(ol.value!=='')AVATAR.outfit(+ol.value); }; ol.style.visibility='hidden';
    for(const [s] of SLOTS){ const sel=$('#lav-'+s), k=$('#lavk-'+s), kd=$('#lavt-'+s); stop(sel); stop(kd);
      kd.onchange=()=>{ const v=kinds(s).get(kd.value); AVATAR.wear(s,v?v[0].n:null); };   // (a kind: its first version, the one-each piece when there is one)
      sel.onchange=()=>AVATAR.wear(s,sel.value===''?null:+sel.value); k.onchange=e=>{ const w=L.w[s], J=D[L.f], p=w&&J&&J.byN.get(w[0]), z=+e.target.dataset.z; if(!p||!(z>=0))return; const a=partCols(p,w[1]); a[z]=e.target.value.slice(1); AVATAR.wear(s,w[0],a.join('_')); }; }
    return true; }
  const on=(b,v)=>{ b.setAttribute('aria-pressed',String(v)); b.setAttribute('aria-selected',String(v)); };   // (the menus' look marks the chosen one by aria-selected)
  // a piece's parts you can colour (not skin, not a fixed colour of its own), and its colours a part (an old single colour is its main part's)
  const tintable=p=>p.zones.map((z,i)=>i).filter(i=>p.zones[i]!=='skin'&&!String(p.zones[i]).startsWith('='));
  const partCols=(p,c)=>{ const a=p.zones.map(()=>''); if(!c)return a; if(c.includes('_'))c.split('_').forEach((h,i)=>{ if(i<a.length)a[i]=h; }); else if(p.main)a[p.main[0]]=c; return a; };
  function draw(){ if(!panel())return; if(BODIES.pick()!=='avatar')return LOOKS.layout();
    for(const b of $('#lavf').children)on(b,b.dataset.f===L.f); for(const b of $('#lavb').children)on(b,+b.dataset.b===L.b);
    $('#lavh').value=L.h; $('#lavhv').textContent=' '+L.h+'%'; { const F=fxOf(L); for(const k of 'em'){ $('#lavx'+k).value=String(F[k]); $('#lavx'+k+'s').value=F[k+'s']; $('#lavx'+k+'v').textContent=' '+F[k+'s']+'%'; } } $('#lavsc').value='#'+L.skin; $('#lavcc').value='#'+L.hair;
    for(const b of $('#lavs').children)if(b.dataset.c)on(b,b.dataset.c===L.skin); for(const b of $('#lavc').children)if(b.dataset.c)on(b,b.dataset.c===L.hair);
    $('#lavw').textContent=D[L.f]?'':' LOADING…';
    for(const [s] of SLOTS){ const K=kinds(s), sel=$('#lav-'+s), k=$('#lavk-'+s), kd=$('#lavt-'+s), w=L.w[s], J=D[L.f], cur=w&&byN.get(w[0]);
      sel.closest('.lr').dataset.off=K.size?'':'1';
      kd.innerHTML='<option value="">NONE</option>'+[...K].map(([t,v])=>`<option value="${esc(t)}">${esc(t)}${v.length>1?' ('+v.length+')':''}</option>`).join(''); kd.value=cur?cur.k:'';
      const V=cur?K.get(cur.k)||[]:[], G=new Map(); for(const p of V){ if(!G.has(p.g))G.set(p.g,[]); G.get(p.g).push(p); }
      sel.innerHTML=[...G].sort((a,b)=>a[0].localeCompare(b[0])).map(([g,ps])=>`<optgroup label="${esc(g)}">`+ps.map(p=>`<option value="${p.n}">${esc(p.v)}</option>`).join('')+'</optgroup>').join(''); sel.value=cur?String(cur.n):''; sel.style.visibility=V.length>1?'':'hidden';
      const p=w&&J&&J.byN.get(w[0]), Z=p&&s!=='hair'&&s!=='face'?tintable(p):[], key=p?L.f+p.n:'';
      if(k.dataset.p!==key){ k.dataset.p=key; k.innerHTML=Z.map(z=>`<input type="color" data-z="${z}" title="${p.zones[z].replace(/([a-z])([A-Z])/g,'$1 $2').toUpperCase()}" aria-label="${p.label} ${p.zones[z]} colour">`).join(''); }
      if(p){ const a=partCols(p,w[1]); for(const i of k.querySelectorAll('input'))i.value='#'+(a[+i.dataset.z]||String(p.pal[+i.dataset.z]).slice(1)); } }
    LOOKS.layout(); }
  // a WEAR line's kinds, each with its versions (who wears it), for your figure; the one-each piece first
  const esc=t=>String(t).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';'), KC={};
  const kinds=s=>KC[L.f+s]||(KC[L.f+s]=(()=>{ const M=new Map(); for(const p of I.pieces.filter(p=>p.slot===s&&p.figs.includes(L.f)).sort((a,b)=>a.k.localeCompare(b.k)||(a.label===a.k?-1:b.label===b.k?1:a.v.localeCompare(b.v)))){ if(!M.has(p.k))M.set(p.k,[]); M.get(p.k).push(p); } return M; })());
  // a still figure (or just the pieces, body false) in your build and colours, wearing w: the ITEM editor's pictures (140ba)
  AVATAR.statue=(w,{body=true,f}={})=>{ const M={...L,f:f||L.f,w,bare:false}; return need(M.f,M.w).then(J=>geoFor(J,M,false,!body)); };
  AVATAR.pieces=I.pieces; AVATAR.outfits=I.outfits||[];
  AVATAR.outfit=i=>{ const o=AVATAR.outfits[i]; if(!o)return refresh(); L.w={}; for(const [s,[n,c]] of Object.entries(o.w)){ const p=byN.get(n); if(p&&p.figs.includes(L.f)&&SLOTS.some(x=>x[0]===s))L.w[s]=[n,c||'']; } return AVATAR.set(o.hair?{hair:o.hair}:{}); };
  AVATAR.draw=draw; LOOKS.onChange=()=>refresh();
  need(L.f,L.w).catch(()=>{});   // (your figure and what you wear start coming with the page: you are only ever the avatar)
  SYS.onStart(()=>{ LOOKS.who=()=>BODIES.pick()==='avatar'?'avatar':'walker'; fitTo(body,L); BODIES.add(body); BODIES.onPick.push(k=>{ if(k==='avatar')refresh(); draw(); }); if(BODIES.pick()==='avatar')refresh(); draw();
    let held='', fl=false; SYS.add('life',()=>{ const h=WIELD.on?WIELD.hand:'', f=flying(); if(h!==held){ held=h; if(BODIES.pick()==='avatar'&&(L.w.righthand||L.w.lefthand))refresh(); } if(f!==fl){ fl=f; if(BODIES.pick()==='avatar')refresh(); } },'111c-avatar');
    const P=$('#looks'); if(P)new MutationObserver(()=>{ if(!P.hidden)draw(); }).observe(P,{attributes:true,attributeFilter:['hidden']}); },'111c-avatar'); }
export {AVATAR};
