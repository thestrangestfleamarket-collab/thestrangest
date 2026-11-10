// THE BEEKEEPER AND YOUR HIVES: a beekeeper in a white suit on the park path sells hives, a smoker, a veil and honey jars, buys honey and wax and teaches BEEKEEPING; a hive you set on the lawn fills over real time, faster among flowers, and the flowers near it decide the honey.
import {SHARED, THREE} from './003-shx.js';
import {CLOCK, FLORA, FORAGE, ITEMS, NPCS, ONLINE, pos, ROOMS, SFX, UI, VIT, WEEDS} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {SOL, SYS, TILE} from './006-map-pre.js';
import {RARITY} from './013a-rarity.js';
import {CREATS} from './087-npc-creatures.js';
import {MERCH} from './111e-merch.js';
import {GARDEN} from './144a-garden.js';
import {SMOKE} from './146x-bluehour.js';
const BEES={list:[]}; window.BEES=BEES;
{ const T=TILE, WU=T/.84, K=MERCH.K, {mk,grp,SPH,LATHE,drape}=K, say=(t,c)=>SAY(t,c||'#e8e2cc'), use=FORAGE.use, KEY='bees', MAX=3, FULL=10, MIN=30, R=8*T;
  // the honeys: what the flowers near a hive make of it (a rare moon honey by night, deep in the park)
  const HONEY={honey_wild:['WILDFLOWER HONEY',null],honey_clover:['CLOVER HONEY',['clover','dandelion','daisy']],honey_lav:['LAVENDER HONEY',['lavender','aster','chicory','iris']],
    honey_sun:['SUNFLOWER HONEY',['sunflower','marigold','goldenrod','zinnia']],honey_rose:['ROSE HONEY',['rose','tulip','foxglove','slipper']],honey_moon:['MOON HONEY',null]};
  const HTIER={honey_wild:'c',honey_clover:'c',honey_lav:'r',honey_sun:'r',honey_rose:'r',honey_moon:'s'}; BEES.HTIER=HTIER; for(const id in HTIER)ITEMS.reg(id,{tier:{c:'common',r:'rare',s:'super'}[HTIER[id]]});
  const NM={bee_hive:'A BEEHIVE',bee_smoker:'A BEE SMOKER',bee_veil:"A BEEKEEPER'S VEIL",jar_honey:'AN EMPTY HONEY JAR',bee_wax:'BEESWAX',wax_candle:'A BEESWAX CANDLE'};
  for(const id in HONEY)NM[id]='A JAR OF '+HONEY[id][0];
  FORAGE.add({names:NM,recipes:[['wax_candle','A BEESWAX CANDLE','bee',[0,45],{bee_wax:3},'a candle for your home; sells for $12'],
    ['f_hfish','HONEY-GLAZED BASS','cooking',[25,70],{honey_wild:1,x_bass:1},'mends you a minute, stamina back'],['f_hmush','HONEYED CHANTERELLES','cooking',[20,60],{honey_clover:1,chanterelle:2},'some health'],
    ['p_royal','ROYAL JELLY TONIC','alchemy',[50,100],{honey_moon:1,moonglow:1},'all your health, mending 2 min']],
    does:{f_hfish:()=>{ FORAGE.feed(.4); FORAGE.buff('regen',60); VIT.sta=1; },f_hmush:()=>{ FORAGE.feed(.3); VIT.heal(.25); },p_royal:()=>{ VIT.heal(1); FORAGE.buff('regen',120); }},prices:{f_hfish:30,f_hmush:24,p_royal:160}});
  FORAGE.CK.bee={short:'BEES',made:nm=>`YOU ROLL AND WICK THE WAX: ${nm}.`,fail:'THE WAX CRACKS. TRY AGAIN.'};
  FORAGE.BUYK.honey=['honey_','bee_wax','wax_candle']; FORAGE.sell(...Object.keys(HONEY),'bee_wax','wax_candle');
  FORAGE.HELP.push('BEEKEEPING: set a hive on the lawn (from your pack) among flowers; come back to take its honey (empty jars, a smoker, a veil).');
  const S={v:1,hives:[],got:{}}; try{ const D=JSON.parse(OWNED.get(KEY)||'null'); if(D&&D.v===1)Object.assign(S,D); }catch(e){} S.hives=(S.hives||[]).filter(h=>h&&Number.isFinite(h.x)&&Number.isFinite(h.z));
  const save=()=>{ try{ OWNED.set(KEY,JSON.stringify(S)); }catch(e){} };
  FORAGE.BOOK.push({id:'honey',title:'HONEY',rows:()=>Object.keys(HONEY).map(id=>[HONEY[id][0],!!S.got[id],S.got[id]?'TAKEN '+S.got[id]+' JARS':'',id==='honey_moon']),foot:'The flowers around a hive make its honey. Moon honey comes only by night, deep in the park.'});

  /* ---------- what is near a hive: wild flowers, your garden's, the beds ---------- */
  const flowers=(x,z)=>{ '@later'; const n={}; let t=0; const add=(k,w=1)=>{ n[k]=(n[k]||0)+w; t+=w; };
    for(const [k,fx,fz] of GARDEN.spots?GARDEN.spots():[])if(Math.hypot(fx-x,fz-z)<R)add(k);
    for(const p of GARDEN.plots?GARDEN.plots():[])if(Math.hypot(p.x-x,p.z-z)<R)add(p.k,2);
    if(FLORA&&FLORA.beds)for(const b of FLORA.beds)if(Math.hypot(b.x-x,b.z-z)<R)for(const k of b.k||[])add(k,Math.max(1,b.n/(b.k.length||1)));
    return {n,t}; };
  const kindOf=(h,night,n=flowers(h.x,h.z).n)=>{ '@later'; if(night&&WEEDS.inPark&&WEEDS.inPark(h.x,h.z,10)&&Math.random()<.15&&RARITY.open('bee'))return 'honey_moon'; let best='honey_wild', bv=0;
    for(const id in HONEY){ const L=HONEY[id][1]; if(!L)continue; const v=L.reduce((a,k)=>a+(n[k]||0),0); if(v>bv){ bv=v; best=id; } } return bv>=3?best:'honey_wild'; };
  // frames filled: one every MIN real minutes, up to four times as fast among flowers
  const frames=h=>{ const f=flowers(h.x,h.z).t, rate=1+Math.min(3,f/6); return Math.min(FULL,(h.f||0)+(Date.now()-h.t)/60000/MIN*rate); };
  BEES.frames=frames; BEES.flowers=flowers; BEES.kindOf=kindOf; BEES.S=S;

  /* ---------- a hive: a white box on legs, its bees about it while you are near ---------- */
  const wood=new THREE.MeshLambertMaterial({color:0xf0ead8}), roofM=new THREE.MeshLambertMaterial({color:0x8a6a4a}), legM=new THREE.MeshLambertMaterial({color:0x5a4434}), HIT=new THREE.MeshBasicMaterial({visible:false});
  const BG=new THREE.BoxGeometry(.5*WU,.22*WU,.42*WU), RG=new THREE.BoxGeometry(.56*WU,.05*WU,.48*WU), LG=new THREE.BoxGeometry(.04*WU,.3*WU,.04*WU), HG=new THREE.BoxGeometry(.8*T,.9*T,.8*T);
  const NB=8, beeG=new THREE.SphereGeometry(.018*WU,5,4), BEE=new THREE.InstancedMesh(beeG,new THREE.MeshBasicMaterial({color:0xe8b020}),MAX*NB*4); BEE.count=0; BEE.frustumCulled=false; BEE.raycast=()=>{}; scene.add(BEE);
  const box=h=>{ '@later'; const g=new THREE.Group(); for(const [x,z] of [[-.2,-.16],[.2,-.16],[-.2,.16],[.2,.16]]){ const l=new THREE.Mesh(LG,legM); l.position.set(x*WU,.15*WU,z*WU); g.add(l); }
    for(let i=0;i<3;i++){ const b=new THREE.Mesh(BG,wood); b.position.y=(.41+i*.23)*WU; b.castShadow=true; g.add(b); } const r=new THREE.Mesh(RG,roofM); r.position.y=1.08*WU; g.add(r);
    const hb=new THREE.Mesh(HG,HIT); hb.position.y=.45*T; g.add(hb); g.position.set(h.x,h.y,h.z); scene.add(g); h.g=g;
    h.th=h.who?{name:h.who+"'S BEEHIVE",obj:hb,reach:2*T,near:3*T,tall:.9*T,act:()=>say(`${h.who}'S HIVE. THE BEES HUM. BEST LEAVE IT TO THEM.`,'#e8e2cc')}:{name:'YOUR BEEHIVE',obj:hb,reach:2*T,near:3*T,tall:.9*T,act:()=>BEES.menu(h)}; UI.thing(h.th); };
  const unbox=h=>{ if(!h.g)return; scene.remove(h.g); const i=UI.things.indexOf(h.th); if(i>=0)UI.things.splice(i,1); h.g=null; };
  const ground=(x,z)=>(GARDEN.lawnAt&&GARDEN.lawnAt(x,z))??(typeof SHARED.groundY!=='undefined'?SHARED.groundY(x,z):SHARED.py);
  // your hives go to the section (the server keeps them while you are away); other players' hives come back and stand where they set them
  const share=()=>{ if(ONLINE.on&&ONLINE.send)ONLINE.send({t:'puts',k:'hive',list:S.hives.map(h=>[+h.x.toFixed(2),+h.y.toFixed(2),+h.z.toFixed(2),Math.floor(frames(h))])}); };
  const THEIRS=new Map(); BEES.theirs=THEIRS;
  const theirs=(id,name,list)=>{ '@later'; for(const h of THEIRS.get(id)||[])unbox(h); THEIRS.delete(id); if(!id||id===ONLINE.me||!Array.isArray(list)||!list.length)return;
    const L=list.map(a=>({x:+a[0],y:+a[1],z:+a[2],f:+a[3]||0,who:String(name||'A NEIGHBOUR').toUpperCase()})).filter(h=>isFinite(h.x)&&isFinite(h.z)); if(ready)for(const h of L)box(h); THEIRS.set(id,L); };
  ONLINE.puts.hive={set:theirs,clear:()=>{ for(const id of [...THEIRS.keys()])theirs(id); },share};
  BEES.set=()=>{ '@later'; if(!FORAGE.has('bee_hive'))return say('YOU HAVE NO HIVE. THE BEEKEEPER ON MARKET ST SELLS THEM.','#c8a090'); if(S.hives.length>=MAX)return say('YOU KEEP THREE HIVES ALREADY.','#c8a090');
    if(SHARED.LVL!=='up'||(ROOMS&&ROOMS.cur)||!(WEEDS.inPark&&WEEDS.inPark(pos.x,pos.z)))return say('SET A HIVE ON THE PARK LAWN, AMONG FLOWERS.','#c8a090');
    const h0=SHARED.heading, x=pos.x+Math.sin(h0)*1.2*T, z=pos.z+Math.cos(h0)*1.2*T; if(S.hives.some(h=>Math.hypot(h.x-x,h.z-z)<2*T))return say('TOO CLOSE TO ANOTHER HIVE.','#c8a090');
    FORAGE.take('bee_hive',1); const h={x,z,y:ground(x,z),t:Date.now(),f:0}; S.hives.push(h); box(h); save(); share(); FORAGE.draw(); const f=flowers(x,z).t;
    say(f>=6?'YOU SET THE HIVE AMONG THE FLOWERS. THE BEES SETTLE IN.':f?'YOU SET THE HIVE. A FEW FLOWERS NEAR: IT WILL FILL SLOWLY.':'YOU SET THE HIVE. NO FLOWERS NEAR: IT WILL FILL VERY SLOWLY.','#b8f0a0'); return h; };
  FORAGE.ROWB.push(id=>id==='bee_hive'?[['SET IT HERE','hiveset']]:[]); FORAGE.ACT.hiveset=()=>BEES.set();

  /* ---------- taking honey: smoke calms them (BEEKEEPING); a veil keeps the stings off ---------- */
  const sting=n=>{ if(FORAGE.has('bee_veil'))return say('THEY BUZZ AT YOUR VEIL, BUT CANNOT GET IN.','#e8e2cc'); VIT.hurt(.06*n); SFX.play('cough',{vol:.4,pitch:1.6}); say(n>1?`YOU ARE STUNG ${n} TIMES!`:'YOU ARE STUNG!','#f09070'); };
  BEES.take=h=>{ '@later'; const f=Math.floor(frames(h)); if(f<2)return say('THE FRAMES ARE NEARLY EMPTY. COME BACK LATER.','#c8a090'); const jars=FORAGE.has('jar_honey'); if(!jars)return say('YOU NEED EMPTY HONEY JARS. THE BEEKEEPER ON MARKET ST SELLS THEM.','#c8a090');
    const smoke=FORAGE.has('bee_smoker')&&use('bee',0,70); SFX.play('step',{vol:.3,pitch:.6}); if(!smoke){ const n=1+Math.floor(Math.random()*3*(1-Math.min(.8,FORAGE.sk('bee')/120))); sting(n); if(!FORAGE.has('bee_veil')&&Math.random()<.5){ say('YOU BACK OFF BEFORE YOU GET ANY HONEY.','#c8a090'); return; } }
    else say('A PUFF OF SMOKE AND THE BEES GO QUIET.','#9fe07f');
    const id=kindOf(h,!!(CLOCK&&CLOCK.dark())), nest=CREATS.nest, raid=nest&&Math.hypot(nest.x-h.x,nest.z-h.z)<30*WU?Math.max(0,.35-FORAGE.sk('bee')/300):0, n0=Math.max(1,Math.round((Math.floor(f/2)+(FORAGE.sk('bee')>60&&Math.random()<.5?1:0))*(1-raid))), n=Math.min(jars,n0), wax=Math.max(1,Math.floor(f/3));
    FORAGE.take('jar_honey',n); FORAGE.give(id,n); FORAGE.give('bee_wax',wax); S.got[id]=(S.got[id]||0)+n; use('bee',10,80); if(raid>.05)say('WASPS FROM THE PARK\'S NEST HAVE BEEN AT THIS HIVE: SOME HONEY IS GONE. A BETTER BEEKEEPER LOSES LESS.','#e0b070');
    h.f=Math.max(0,f-n*2); h.t=Date.now(); save(); share(); FORAGE.draw(); SFX.play('drip',{vol:.5}); say(`YOU TAKE ${n} JAR${n>1?'S':''} OF ${HONEY[id][0]} AND ${wax} BEESWAX.`,id==='honey_moon'?'#c8d8ff':'#f2c14e'); BEES.last={id,n,wax}; };
  BEES.lift=h=>{ if(Math.floor(frames(h))>=2)return say('TAKE THE HONEY FIRST.','#c8a090'); S.hives.splice(S.hives.indexOf(h),1); unbox(h); share(); FORAGE.give('bee_hive',1); save(); FORAGE.draw(); say('YOU LIFT THE HIVE BACK INTO YOUR PACK. THE BEES FOLLOW IT IN.','#e8e2cc'); };
  const B='style="margin:0 4px 0 0;font:inherit;color:#ece5d3;background:#0e1016;border:2px solid #3a3f4e;padding:3px 8px;cursor:pointer"';
  const P=document.createElement('div'); P.id='hivep'; P.hidden=true; P.style.cssText='position:fixed;left:50%;top:14%;transform:translateX(-50%);width:min(380px,92vw);z-index:21;padding:12px 14px;font:11px Silkscreen,monospace;letter-spacing:.4px;color:#d8dae2;background:#0b0d13f2;border:2px solid #3a3f4e;zoom:var(--uiz,1)';
  document.body.appendChild(P); P.addEventListener('keydown',e=>{ if(e.key==='Escape')P.hidden=true; e.stopPropagation(); }); let cur=null;
  const draw=()=>{ '@later'; const h=cur; if(!h)return; const f=frames(h), fl=flowers(h.x,h.z), k=kindOf(h,false);
    P.innerHTML=`<div style="color:#f2c14e;margin-bottom:4px">YOUR BEEHIVE</div><div style="color:#9b9584;margin-bottom:8px;line-height:1.5">FRAMES ${Math.floor(f)} OF ${FULL} · ${Math.round(fl.t)} FLOWERS NEAR · LIKELY ${HONEY[k][0]}<br>JARS ${FORAGE.has('jar_honey')} · ${FORAGE.has('bee_smoker')?'SMOKER':'NO SMOKER'} · ${FORAGE.has('bee_veil')?'VEIL':'NO VEIL'} · BEEKEEPING ${FORAGE.sk('bee').toFixed(1)}</div>`+
      `<div><button ${B} data-a="take">TAKE HONEY</button><button ${B} data-a="lift">LIFT IT</button><button ${B} data-a="x">CLOSE</button></div>`; };
  BEES.menu=h=>{ cur=h; P.hidden=false; draw(); };
  P.addEventListener('click',e=>{ '@later'; const b=e.target.closest('button[data-a]'); if(!b||!cur)return; const a=b.dataset.a; if(a==='x'){ P.hidden=true; return; }
    if(Math.hypot(cur.x-pos.x,cur.z-pos.z)>3*T){ say('GO NEARER THE HIVE.','#c8a090'); return; } if(a==='take')BEES.take(cur); else { BEES.lift(cur); P.hidden=true; cur=null; return; } draw(); });

  /* ---------- your hives stand where you left them; their bees buzz about while you are near ---------- */
  let ready=false, tt=0; const m4=new THREE.Matrix4();
  SYS.add('life',dt=>{ if(!ready){ if(!SYS.started)return; ready=true; for(const h of S.hives)box(h); for(const L of THEIRS.values())for(const h of L)box(h); }
    if((tt+=dt||0)<.05)return; tt=0; const now=performance.now()/1000, out=SHARED.LVL==='up'&&!(ROOMS&&ROOMS.cur), day=!(CLOCK&&CLOCK.dark()); let n=0;
    const all=[...S.hives]; if(ONLINE.on)for(const L of THEIRS.values())all.push(...L); for(const L of THEIRS.values())for(const h of L)if(h.g&&!ONLINE.on)h.g.visible=false;
    for(const h of all){ if(!h.g)continue; if(n>=BEE.instanceMatrix.count-NB)break; const near=Math.hypot(h.x-pos.x,h.z-pos.z); h.g.visible=out&&near<60*T; if(!h.g.visible||near>20*T||!day)continue; const busy=Math.min(1,.3+(h.who?h.f:frames(h))/FULL);
      if(!h.fl||now-h.flT>10){ h.flT=now; h.fl=[]; for(const [,fx,fz] of GARDEN.spots?GARDEN.spots():[])if(Math.hypot(fx-h.x,fz-h.z)<R)h.fl.push([fx,ground(fx,fz)+.35*WU,fz]); for(const p of GARDEN.plots?GARDEN.plots():[])if(Math.hypot(p.x-h.x,p.z-h.z)<R)h.fl.push([p.x,ground(p.x,p.z)+.35*WU,p.z]);
        if(FLORA&&FLORA.beds)for(const b of FLORA.beds)if(Math.hypot(b.x-h.x,b.z-h.z)<R)for(const q of b.p||[])h.fl.push(q); }
      for(let i=0;i<NB*busy;i++){ if(i%3===0&&h.fl.length){ const q=h.fl[(i*7)%h.fl.length], u=(now*.09+i*.137)%1, w=u<.45?u/.45:u<.55?1:(1-u)/.45, hy=h.y+.7*WU;
          m4.makeTranslation(h.x+(q[0]-h.x)*w+Math.sin(now*9+i)*.04*WU,hy+(q[1]-hy)*w+Math.sin(Math.PI*w)*.8*WU,h.z+(q[2]-h.z)*w+Math.cos(now*8+i)*.04*WU); BEE.setMatrixAt(n++,m4); continue; }
        const a=now*(1.3+i*.17)+i*2.1, r=(.3+.4*((i*37)%10)/10)*WU; m4.makeTranslation(h.x+Math.cos(a)*r,h.y+(.6+.35*Math.sin(now*2.3+i))*WU,h.z+Math.sin(a*1.3)*r); BEE.setMatrixAt(n++,m4); } }
    BEE.count=n; BEE.instanceMatrix.needsUpdate=true; },'147a-bees');

  /* ---------- the beekeeper: a round figure in a white suit and a veiled hat, a smoker in one gloved hand ---------- */
  const SUIT='cloth:#eeeae0', GLOVE='leather:#d8c890', VEIL='tulle:#2a2c30';
  const model=()=>{ const sk=MERCH.skel({hipY:.9,neck:.52,shX:.22,shY:.42,upper:.28,fore:.26,hipX:.11}), {B}=sk;
    mk(B.torso,drape(LATHE([[.22,-.08],[.27,.1],[.28,.3],[.25,.44],[.16,.52],[.08,.56]],28,.85),.01),SUIT); mk(B.hips,drape(LATHE([[.22,.04],[.25,-.12],[.22,-.2]],24,.85),.01),SUIT);
    const H=grp(B.head,[0,.12,0]); mk(H,SPH(.11,20,14),'skin:#c89a78',[0,0,0],[0,0,0],[.95,1.05,1]); mk(H,new THREE.CylinderGeometry(.27,.27,.015,28),'plain:#e8dcb8',[0,.1,0]);
    mk(H,new THREE.CylinderGeometry(.13,.14,.1,24),'plain:#e8dcb8',[0,.15,0]); mk(H,new THREE.CylinderGeometry(.2,.22,.24,24,1,true),VEIL,[0,-.02,0]);
    for(const s of [1,-1]){ const n=s>0?'L':'R'; mk(B['upperArm'+n],new THREE.CylinderGeometry(.075,.07,.28,14),SUIT,[0,-.13,0]); mk(B['forearm'+n],new THREE.CylinderGeometry(.07,.065,.26,14),SUIT,[0,-.12,0]);
      mk(B['hand'+n],SPH(.06,12,9),GLOVE,[0,-.04,0],[0,0,0],[1,1.2,.8]); mk(B['thigh'+n],new THREE.CylinderGeometry(.09,.08,.43,14),SUIT,[0,-.2,0]); mk(B['shin'+n],new THREE.CylinderGeometry(.075,.07,.43,14),SUIT,[0,-.2,0]);
      mk(B['shoe'+n],new THREE.CapsuleGeometry(.05,.1,6,10),'leather:#5a4434',[0,-.04,.04],[Math.PI/2,0,0]); }
    const sm=grp(B.handR,[0,-.1,.04]); mk(sm,new THREE.CylinderGeometry(.05,.05,.16,14),'metal:#a8a49a'); mk(sm,new THREE.ConeGeometry(.05,.07,14),'metal:#a8a49a',[0,.11,0]);
    return sk; };
  const V=new THREE.Vector3(); let pt=0;
  MERCH.add({key:'beekeeper',label:'THE BEEKEEPER',height:1.7,model,size:10,hd:0,
    idle:t=>MERCH.pose({nod:Math.sin(t*.6)*4,yaw:Math.sin(t*.3)*14,L:{ua:[20,14],fa:[40,0]},R:{ua:[30,-10],fa:[70,-20]}}),
    after:(Bd,N)=>{ if(!N.g.visible||!SMOKE||Math.hypot(pos.x-N.st.x,pos.z-N.st.z)>20*T)return; const t=performance.now()/1000; if(t-pt<2.2)return; pt=t; MERCH.at(N,'handR',[0,.1,.04],V); SMOKE.puff(V.x,V.y,V.z,2,0xd8d8d0,.6); }});
  { NPCS.when('beekeeper',N=>{ const x=N.st.x, z=N.st.z; SOL.up.push([x-.25*T,z-.25*T,x+.25*T,z+.25*T]); }); }
  window.BEEDBG=()=>({hives:S.hives.map(h=>({f:+frames(h).toFixed(2),fl:flowers(h.x,h.z).t,k:kindOf(h,false)})),got:{...S.got},bee:FORAGE.sk('bee'),shown:BEE.count});
}
