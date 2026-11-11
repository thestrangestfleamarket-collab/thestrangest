// TAMING (owner, 10 Nov 2026: "animal taming as skill", "One skill, three tiers"): near a creature, TAME is a few still seconds and a roll by your TAMING against its difficulty (its favourite food helps); small wildlife from 0 becomes a pet that follows you, a dungeon creature from 40 fights beside you, a big animal from 70 carries you; a failure sends wildlife off and turns a monster on you.
import {SHARED, THREE} from './003-shx.js';
import {BIRDS, FORAGE, LEVELS, ONLINE, PETS, pos, RIDE, SFX, TAMING, UI, VIS, WALKS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {MODS, SYS, TILE} from './006-map-pre.js';
import {collide} from './075-main-13.js';
import {CREATS} from './087-npc-creatures.js';
import {HORSE} from './146zjc-horse.js';
window.TAMING=TAMING;
{ const T=TILE, WU=T/.84, say=(t,c)=>SAY(t,c||'#e8e2cc'), BAND={pet:0,fight:40,ride:70}, WHAT={pet:'A PET',fight:'A FIGHTER',ride:'A MOUNT'}, TRY=3, HIDE=600, NEAR=2.4*T;
  const now=()=>performance.now()/1000, sk=()=>FORAGE.sk('tame')||0;
  // the kinds' tame (data/pets.json, tools/pets-tame.py): a breed without its own takes its base's; what a thing in the world is, by its w names
  let I=null, W=null, loading=false; const load=()=>{ if(!I&&!loading){ loading=true; PETS.idx().then(J=>{ I=J; W={}; for(const K of J.kinds)for(const w of (K.tame&&K.tame.w)||[])W[w]=K; }).catch(e=>{ loading=false; console.warn('TAMING',e); }); } return !!I; };
  const tameOf=K=>K&&(K.tame||K.of&&I.by[K.of]&&I.by[K.of].tame)||null;
  const kindOf=w=>{ if(!I)return null; if(W[w])return W[w]; const k=String(w).split(':').pop().toLowerCase(), K=I.by[k]; return K&&tameOf(K)?K:null; };
  const nm=K=>String(K.name||K.key).toUpperCase();

  /* ---------- what can be tamed near you: the park's creatures (not the farm's own), the park's birds, the dungeon's monsters ---------- */
  const mobs=()=>{ const D=MODS.dunmobs, p=D&&D.pic; return p&&p.m?p.m:[]; };
  const mobW=e=>e[2]==='s'?'s:'+e[3]:e[2]==='p'?'p':e[2]==='c'?'c:'+e[3]:null;
  const HID=new Map(), CL=new Map(), OFF=new Map();   // (creatures tamed and gone a while; claims others hold; ones that will not have you for now)
  const ckey=N=>N.wkey||'cr'+CREATS.indexOf(N);
  const cands=()=>{ const L=[], t=now();
    for(const N of CREATS){ if(N.life||!N.kind||!N.body||!N.body.visible||!N.g.visible||HID.has(N))continue; L.push({src:'c',N,w:N.kind,key:ckey(N),x:N.st.x,z:N.st.z,y:N.g.position.y}); }
    for(const b of BIRDS.list||[]){ if(b.st==='pet'||b.st==='opet'||b.st==='fly'||b.st==='hid')continue; const k=BIRDS.K&&BIRDS.K[b.k]; if(k)L.push({src:'b',b,w:'bird:'+k[0],x:b.x,z:b.z,y:b.y}); }
    for(const e of mobs()){ const w=mobW(e); if(!w||e[9])continue; L.push({src:'m',i:e[0],w,key:'m'+e[0],x:e[4],z:e[5],y:SHARED.py}); }
    return L.filter(c=>!(c.key&&(CL.get(c.key)>t))); };
  // one hitbox, on the nearest one in reach: the use key's TAME <IT>
  const G=new THREE.Group(); G.userData.anyRoom=true; scene.add(LEVELS.own(G,'*')); const HB=new THREE.Mesh(new THREE.BoxGeometry(.6*T,.5*T,.6*T),new THREE.MeshBasicMaterial({visible:false})); HB.visible=false; G.add(HB);
  let CUR=null; const TH={name:'TAME IT',obj:HB,reach:NEAR,near:NEAR+.6*T,tall:.4*T,act:()=>{ if(CUR)go(CUR); }}; UI.thing(TH);
  const scan=()=>{ HB.visible=false; CUR=null; if(RIDE.on||TR)return; let best=null, bd=NEAR;
    for(const c of cands()){ const d=Math.hypot(c.x-pos.x,c.z-pos.z); if(d>=bd||Math.abs(c.y-SHARED.py)>2.5*T)continue; if(!load())return; const K=kindOf(c.w); if(!K)continue; bd=d; best=Object.assign(c,{K}); }
    if(!best)return; CUR=best; HB.position.set(best.x,best.y+.2*T,best.z); HB.visible=true; TH.name='TAME THE '+nm(best.K); };

  /* ---------- a try: a few still seconds beside it, then the roll ---------- */
  let TR=null;
  const where=c=>c.src==='c'?{x:c.N.st.x,z:c.N.st.z,ok:c.N.body.visible}:c.src==='b'?{x:c.b.x,z:c.b.z,ok:(BIRDS.list||[]).includes(c.b)&&c.b.st!=='fly'}:(e=>e?{x:e[4],z:e[5],ok:!e[9]}:{ok:false})(mobs().find(e=>e[0]===c.i));
  const go=c=>{ '@later'; if(TR)return say('YOU ARE ALREADY TAMING ONE.','#c8a090'); if(RIDE.on)return say('GET DOWN FIRST.','#c8a090');
    if(c.bird){ const b=c.bird, k=BIRDS.K&&BIRDS.K[b.k]; c={src:'b',b,w:'bird:'+(k?k[0]:''),x:b.x,z:b.z}; if(!load()){ say('IT EYES YOU. TRY AGAIN IN A MOMENT.','#c8c2b0'); return; } c.K=kindOf(c.w); }
    const K=c.K||kindOf(c.w), t=tameOf(K); if(!K||!t)return say('IT WILL NOT BE TAMED.','#c8a090');
    if(sk()<BAND[t.t])return say(`YOU NEED TAMING ${BAND[t.t]} TO TAME ${t.t==='pet'?'IT':t.t==='fight'?'A DUNGEON CREATURE':'AN ANIMAL THAT BIG'} (YOURS IS ${sk().toFixed(1)}).`,'#c8a090');
    if(c.key&&OFF.get(c.key)>now())return say('IT WANTS NOTHING TO DO WITH YOU FOR NOW.','#c8a090');
    const food=(t.f||[]).find(id=>FORAGE.has(id));
    TR={c,K,t,food,at:{x:pos.x,z:pos.z},T:0,claim:!(ONLINE.on&&ONLINE.send&&c.src==='c')};
    if(!TR.claim)ONLINE.send({t:'tame',k:c.key}); calm(c,true);
    say(food?`YOU HOLD OUT ${String(FORAGE.name?FORAGE.name(food):food).toUpperCase()} AND KEEP STILL...`:'YOU HOLD OUT YOUR HAND AND KEEP STILL...','#9fe07f'); if(SFX.play)SFX.play('step',{vol:.3,pitch:1.4}); };
  // while you try, it stands for you (a walker held by the walks, the others by their own state); then it goes back to its ways
  const calm=(c,on)=>{ if(c.src!=='c')return; const N=c.N, r=N.st.folk;
    if(r){ if(on){ c.mode=r.mode; WALKS.mode(N,{...JSON.parse(r.mode||'null')||{},hold:1}); } else if(c.mode!=null){ WALKS.mode(N,JSON.parse(c.mode)); c.mode=null; } }
    else if(on){ c.hold=N.st.hold; N.st.hold=true; N.st.to=null; } else if(c.hold!=null){ N.st.hold=c.hold; c.hold=null; } };
  const stop=(why,c)=>{ if(TR)calm(TR.c,false); TR=null; TAMING.why=why; if(why)say(why,c||'#c8a090'); };
  const tick=dt=>{ if(!TR)return; const c=TR.c, w=where(c);
    if(!w.ok)return stop('IT IS GONE.'); const mv=Math.hypot(pos.x-TR.at.x,pos.z-TR.at.z); TR.at={x:pos.x,z:pos.z}; if(mv>.9*T*dt+.02*T||RIDE.on)return stop('YOU MOVE, AND THE MOMENT IS LOST.');   // (walking off loses it; being nudged does not) if(Math.hypot(w.x-pos.x,w.z-pos.z)>NEAR+1.5*T)return stop('IT WANDERS OFF.');
    if((TR.T+=dt)<TRY||!TR.claim)return; roll(); };
  const roll=async()=>{ '@later'; const {c,K,t,food}=TR; TR=null; calm(c,false); if(food)FORAGE.take(food,1); const bonus=food?15:0, f=TAMING.force;
    const ok=FORAGE.use('tame',t.d-25,t.d+25,bonus,f!=null?{ok:!!f,win:2}:{win:2}); if(FORAGE.draw)FORAGE.draw();
    if(!ok)return fail(c,K,t);
    if(c.src==='m'){ const D=MODS.dunmobs; if(!D||!D.tame||!await D.tame(c.i))return say('IT SLIPS AWAY INTO THE DARK.','#c8a090'); }
    else if(c.src==='b')BIRDS.drop(c.b);
    else { const N=c.N; if(WALKS.has&&WALKS.has(N))WALKS.errand(N,{x:N.st.x,z:N.st.z},{in:HIDE,now:1}); gone(N,c.key); if(ONLINE.on&&ONLINE.send)ONLINE.send({t:'tame',k:c.key,done:1}); }
    const P={k:K.key,n:'',c:K.zones.map(z=>z[1]),s:K.s0?K.s0.slice():K.knobs.map(([,,mn,df,mx])=>Math.round((df-mn)/Math.max(1e-6,mx-mn)*100)),z:t.t==='ride'&&t.m&&K.long?Math.round(t.m/K.long*100):100,h:false};
    PETS.add(P,false,{tm:1}); say(`THE ${nm(K)} IS TAME: ${WHAT[t.t]} OF YOURS. ${t.t==='ride'?'USE IT TO RIDE. ':t.t==='fight'?'IT FIGHTS WHAT ATTACKS YOU. ':''}YOUR PETS ARE IN THE MENU (ESC, PETS).`,'#9fe07f');
    if(SFX.play)SFX.play('step',{vol:.5,pitch:1.8}); SYS.run('tamed',{k:K.key,t:t.t}); };
  const gone=(N,key)=>{ VIS.hide(N.g,'tamed'); HID.set(N,now()+HIDE); if(key)CL.set(key,now()+HIDE); };
  const fail=(c,K,t)=>{ '@later';
    if(c.src==='m'){ const D=MODS.dunmobs; if(D&&D.smite)D.smite(c.i,.01); return say(`THE ${nm(K)} TURNS ON YOU!`,'#e8a090'); }
    if(c.src==='b'){ BIRDS.flush(c.b); return say('IT STARTLES AND FLIES OFF.','#c8a090'); }
    const N=c.N, a=Math.atan2(N.st.x-pos.x,N.st.z-pos.z), p={x:N.st.x+Math.sin(a)*8*WU,z:N.st.z+Math.cos(a)*8*WU}; OFF.set(c.key,now()+30);
    if(WALKS.has&&WALKS.has(N))WALKS.errand(N,p); else { N.st.to=p; N.st.v=4*WU; N.st.hold=false; }
    say(`THE ${nm(K)} SHIES AWAY FROM YOU AND RUNS OFF.`,'#c8a090'); };
  // claims: while one player tries, nobody else may; once tamed, it is theirs (the section's server keeps them, worker/door.js)
  ONLINE.hear.tamek=m=>{ const k=String(m.k||''); if(m.by){ CL.set(k,now()+(m.done?HIDE:8)); if(m.done)for(const N of CREATS)if(ckey(N)===k)gone(N); return; }
    if(TR&&TR.c.key===k){ if(m.ok)TR.claim=true; else stop('SOMEONE ELSE IS ALREADY TAMING IT.'); } };

  /* ---------- a tamed fighter (tier 2): your pet out with you goes for what attacks you in the dungeon and strikes it as your blows do ---------- */
  let FT=null, cool=0, trainT=0;
  const outT=()=>{ const r=PETS.out&&PETS.out(); if(!r||!I)return null; const P=PETS.decode(r.c), K=P&&I.by[P.k], t=tameOf(K); return t?{r,P,K,t}:null; };
  const fight=dt=>{ const F=outT(), D=MODS.dunmobs, N=PETS.mine&&PETS.mine(); FT=null; cool-=dt;
    if(!F||F.t.t!=='fight'||sk()<BAND.fight||!D||!D.smite||!N||!N.g.visible)return; const me=ONLINE.me||'me';
    let bd=10*WU; for(const e of mobs()){ if(e[9]||e[13]!==me&&e[13]!=='me')continue; const d=Math.hypot(e[4]-pos.x,e[5]-pos.z); if(d<bd){ bd=d; FT={i:e[0],x:e[4],z:e[5]}; } }
    if(!FT)return; if(cool<=0&&Math.hypot(N.st.x-FT.x,N.st.z-FT.z)<2.2*WU){ cool=1.2; D.smite(FT.i,(.8+(F.t.d-40)/20)*(1+sk()/100)); if(SFX.play)SFX.play('step',{vol:.5,pitch:.8});
      if((trainT-=1.2)<=0){ trainT=5; FORAGE.use('tame',F.t.d-30,F.t.d+30); } } };
  PETS.lead=()=>FT&&{x:FT.x,z:FT.z,y:SHARED.py,hd:Math.atan2(FT.x-pos.x,FT.z-pos.z),fight:1};   // (fight: it closes in, whatever its loyalty)

  /* ---------- a tamed mount (tier 3): ridden as the horse is (HORSE.rider), your pet beside you swung up onto; others see you on it ---------- */
  const my=()=>PETS.my&&PETS.my();
  const their=p=>new Promise(r=>{ let n=0; const f=()=>{ const c=p&&p.x&&p.x.mt; if(c)return r(PETS.decode(c)); if(++n>25)return r(null); setTimeout(f,200); }; f(); });
  const MT=HORSE.rider({id:'mount',ride:'mount',look:()=>Promise.resolve(my()),key:()=>my()?PETS.code(my()):'',their,
    long:P=>{ const t=tameOf(I&&I.by[P.k]); return t&&t.m||2.4; },
    near:R=>{ const N=PETS.mine&&PETS.mine(); if(N&&N.g.visible&&Math.hypot(N.st.x-pos.x,N.st.z-pos.z)<4*WU){ pos.x=N.st.x; pos.z=N.st.z; R.hd=N.st.h??R.hd; collide(pos); } },
    deep:'IT WILL NOT GO INTO DEEP WATER.',short:'IT PULLS UP SHORT.',
    kind:{name:'YOUR MOUNT',world:true,hint:'W WALKS (HOLD IT: A TROT), SHIFT GALLOPS, A D TURN, S HALTS, E GETS DOWN.',onSay:'YOU SWING UP ONTO ITS BACK.'}});
  PETS.away=()=>RIDE.on==='mount';
  ONLINE.mine.mt=()=>RIDE.on==='mount'&&my()?PETS.code(my()):null;
  const ride=()=>{ '@later'; const F=outT(); if(!F||F.t.t!=='ride')return say('YOU HAVE NOTHING TO RIDE OUT WITH YOU.','#c8a090');
    if(sk()<BAND.ride)return say(`YOU NEED TAMING ${BAND.ride} TO RIDE IT (YOURS IS ${sk().toFixed(1)}).`,'#c8a090'); if(RIDE.on)return; return RIDE.mount('mount')||(say('YOU CANNOT GET UP ON IT HERE.','#c8a090'),false); };
  PETS.acts.push((P,K)=>{ const t=I&&tameOf(K); return t&&t.t==='ride'?[{name:'RIDE '+(P.n||K.name).toUpperCase(),act:ride}]:null; });
  const GD=new THREE.Mesh(new THREE.BoxGeometry(.4*T,.4*T,.4*T),new THREE.MeshBasicMaterial({visible:false})); GD.visible=false; G.add(GD);
  UI.thing({name:'GET DOWN',obj:GD,reach:2*T,near:3*T,tall:.4*T,exit:true,act:()=>{ if(RIDE.on==='mount')RIDE.off('YOU GET DOWN.'); }});

  SYS.every(()=>{ if(!I&&PETS.out&&PETS.out())load(); },2000,'146zjd-taming');   // (your pet's RIDE wants the kinds' tame; the pets have them loaded already)
  let sT=0; SYS.add('life',dt=>{ if(!dt)return; GD.visible=RIDE.on==='mount'; if(GD.visible)GD.position.set(pos.x,SHARED.py+.6*T,pos.z);
    if((sT-=dt)<=0){ sT=.25; scan(); const t=now(); for(const [N,u] of HID)if(u<t){ HID.delete(N); VIS.hide(N.g,'tamed',false); } }
    tick(dt); fight(dt); },'146zjd-taming');
  if(MODS)MODS.taming=TAMING;
  Object.assign(TAMING,{go,ride,BAND,force:null,cur:()=>CUR,mount:MT,stop:()=>stop(),tameOf:K=>I&&tameOf(K),kindOf,load:()=>load()||PETS.idx().then(()=>new Promise(r=>setTimeout(r,0))).then(load),
    dbg:()=>({why:TAMING.why,sk:sk(),cur:CUR&&{w:CUR.w,k:CUR.K.key,name:TH.name},trying:TR&&{w:TR.c.w,t:+TR.T.toFixed(2),food:TR.food||null},fight:FT,ride:RIDE.on,mount:MT.dbg(),hid:HID.size,claims:CL.size})});
  FORAGE.HELP.push('TAMING (THE WILD): stand by a creature and TAME it: a few still seconds, a chance by your skill (its favourite food in your pack helps). Small wildlife from 0 becomes a pet; dungeon creatures from 40 fight beside you; big animals from 70 can be ridden.'); }
