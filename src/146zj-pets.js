// THE PETS: Polyfork's base animals (data/pets/<kind>.json, tools/pets-bake.py) as a pet that follows you: adopt one at THE PET STORE, its colours, shape and size yours to choose; YOU's PET tab changes its look; other players see it.
import {SHARED, THREE} from './003-shx.js';
import {B64, F32, I16, SKIN} from './003a-skin.js';
import {INV, LEVELS, LOOKS, NPCS, ONLINE, pos, ROOMS, UI, VIT} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {OWNED} from './005-save.js';
import {MAPG, MODS, SYS, TILE} from './006-map-pre.js';
import {IKIT} from './038zc-ikit.js';
import {MSHOP} from './059i-mshops.js';
import {makeNPC} from './076-npc-map.js';
const PETS={}; window.PETS=PETS;
{ const IDX=__LAZY__("data/pets.json"), WU=TILE/.84, V3=THREE.Vector3;
  const KD={};
  const PETFILES={cat:__LAZY__("data/pets/cat.json"),dog:__LAZY__("data/pets/dog.json"),xolo:__LAZY__("data/pets/xolo.json"),rabbit:__LAZY__("data/pets/rabbit.json"),hare:__LAZY__("data/pets/hare.json"),rat:__LAZY__("data/pets/rat.json"),frog:__LAZY__("data/pets/frog.json"),parrot:__LAZY__("data/pets/parrot.json"),pigeon:__LAZY__("data/pets/pigeon.json"),crow:__LAZY__("data/pets/crow.json"),owl:__LAZY__("data/pets/owl.json"),gull:__LAZY__("data/pets/gull.json"),duck:__LAZY__("data/pets/duck.json"),chicken:__LAZY__("data/pets/chicken.json"),penguin:__LAZY__("data/pets/penguin.json"),fox:__LAZY__("data/pets/fox.json"),wolf:__LAZY__("data/pets/wolf.json"),bear:__LAZY__("data/pets/bear.json"),deer:__LAZY__("data/pets/deer.json"),ibex:__LAZY__("data/pets/ibex.json"),lion:__LAZY__("data/pets/lion.json"),crocodile:__LAZY__("data/pets/crocodile.json"),beelzebufo:__LAZY__("data/pets/beelzebufo.json"),horse:__LAZY__("data/pets/horse.json"),donkey:__LAZY__("data/pets/donkey.json"),mule:__LAZY__("data/pets/mule.json"),cow:__LAZY__("data/pets/cow.json"),ox:__LAZY__("data/pets/ox.json"),pig:__LAZY__("data/pets/pig.json"),sheep:__LAZY__("data/pets/sheep.json"),goat:__LAZY__("data/pets/goat.json"),elephant:__LAZY__("data/pets/elephant.json"),giraffe:__LAZY__("data/pets/giraffe.json"),zebra:__LAZY__("data/pets/zebra.json"),camel:__LAZY__("data/pets/camel.json"),trex:__LAZY__("data/pets/trex.json"),raptor:__LAZY__("data/pets/raptor.json"),compy:__LAZY__("data/pets/compy.json"),stego:__LAZY__("data/pets/stego.json"),trike:__LAZY__("data/pets/trike.json"),anky:__LAZY__("data/pets/anky.json"),parasaur:__LAZY__("data/pets/parasaur.json"),brachio:__LAZY__("data/pets/brachio.json"),ptera:__LAZY__("data/pets/ptera.json"),arthro:__LAZY__("data/pets/arthro.json"),rdragonling:__LAZY__("data/pets/rdragonling.json"),pdragonling:__LAZY__("data/pets/pdragonling.json"),cdragonling:__LAZY__("data/pets/cdragonling.json"),gdragonling:__LAZY__("data/pets/gdragonling.json"),rdragon:__LAZY__("data/pets/rdragon.json"),cdragon:__LAZY__("data/pets/cdragon.json"),hivebug:__LAZY__("data/pets/hivebug.json"),bee:__LAZY__("data/pets/bee.json"),bumblebee:__LAZY__("data/pets/bumblebee.json"),wasp:__LAZY__("data/pets/wasp.json"),butterfly:__LAZY__("data/pets/butterfly.json"),firefly:__LAZY__("data/pets/firefly.json"),ladybird:__LAZY__("data/pets/ladybird.json"),beetle:__LAZY__("data/pets/beetle.json"),mantis:__LAZY__("data/pets/mantis.json"),hopper:__LAZY__("data/pets/hopper.json"),ant:__LAZY__("data/pets/ant.json"),antqueen:__LAZY__("data/pets/antqueen.json"),aphid:__LAZY__("data/pets/aphid.json"),spider:__LAZY__("data/pets/spider.json"),tarantula:__LAZY__("data/pets/tarantula.json"),woodlouse:__LAZY__("data/pets/woodlouse.json"),centipede:__LAZY__("data/pets/centipede.json"),skater:__LAZY__("data/pets/skater.json"),caterpillar:__LAZY__("data/pets/caterpillar.json"),worm:__LAZY__("data/pets/worm.json"),slug:__LAZY__("data/pets/slug.json"),snail:__LAZY__("data/pets/snail.json"),hermit:__LAZY__("data/pets/hermit.json"),shorecrab:__LAZY__("data/pets/shorecrab.json"),reefcrab:__LAZY__("data/pets/reefcrab.json")};
  const PRICE={pets:30,birds:25,bugs:10,shore:10,farm:60,wild:80,zoo:120,dino:150,dragons:200};
  const GN={pets:'CATS, DOGS AND SMALL PETS',birds:'BIRDS',wild:'WILD ANIMALS',farm:'FARM ANIMALS',zoo:'ZOO ANIMALS',dino:'DINOSAURS',dragons:'DRAGONS',bugs:'BUGS',shore:'CRABS'};
  let I=null; const idx=()=>I?Promise.resolve(I):IDX().then(J=>{ I=J; I.by={}; for(const k of J.kinds)I.by[k.key]=k; return I; });
  const kind=key=>KD[key]||(KD[key]=PETFILES[key]?PETFILES[key]():Promise.reject(new Error('no pet kind '+key)));
  const H2=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  /* ---------- a pet's look: kind, name, a colour a zone, a value a knob (0..100 from least to most), size (50..150), home (1: waits at home) ---------- */
  const code=P=>[P.k,encodeURIComponent(P.n||''),(P.c||[]).map(h=>h.replace('#','')).join('_'),(P.s||[]).join('_'),P.z||100,P.h?1:0].join('|');
  const decode=s=>{ const a=String(s||'').split('|'); if(!a[0])return null; return {k:a[0],n:decodeURIComponent(a[1]||''),c:a[2]?a[2].split('_').map(h=>'#'+h):[],s:a[3]?a[3].split('_').map(Number):[],z:+a[4]||100,h:a[5]==='1'}; };
  const fresh=K=>({k:K.key,n:'',c:K.zones.map(z=>z[1]),s:K.knobs.map(([,, mn,df,mx])=>Math.round((df-mn)/Math.max(1e-6,mx-mn)*100)),z:100,h:false});
  /* ---------- a pet's body: the base shape with each knob's ends blended in, its bones moved the same, its zones painted ---------- */
  const QS=new THREE.Quaternion(), M4=new THREE.Matrix4(), S1=new V3(1,1,1);
  const shape=(D,P)=>{ const M=D.mesh, n=M.n, Pp=SKIN.dec(M).p.slice(), T=D.rig.t.map(t=>t.slice());
    D.knobs.forEach((kb,i)=>{ const v=P.s[i]; if(v==null)return; const x=kb.min+(kb.max-kb.min)*v/100, lo=x<kb.def, e=lo?kb.lo:kb.hi; if(!e)return; const w=lo?(kb.def-x)/Math.max(1e-6,kb.def-kb.min):(x-kb.def)/Math.max(1e-6,kb.max-kb.def); if(w<=0)return;
      const d=e.d||(e.d=new Int8Array(B64(e.p).buffer)); for(let j=0;j<n*3;j++)Pp[j]+=d[j]*e.s*w; for(const b in e.t){ const t=e.t[b]; for(let c=0;c<3;c++)T[+b][c]+=t[c]*w; } });
    return {P:Pp,T}; };
  const paint=(D,P,g)=>{ const M=D.mesh, Z=M.zd||(M.zd=B64(M.z)), C0=SKIN.dec(M).c, C=g.attributes.color.array, Z0=D.zones.map(z=>H2(z[1])), Zn=D.zones.map((z,i)=>H2(P.c[i]||z[1]));
    for(let i=0;i<M.n;i++){ const z=Z[i], a=Z0[z], b=Zn[z], la=a[0]+a[1]+a[2]+1, lv=(C0[i*3]+C0[i*3+1]+C0[i*3+2]+1)/la; for(let c=0;c<3;c++)C[i*3+c]=Math.max(0,Math.min(255,Math.round(b[c]*lv))); }
    g.attributes.color.needsUpdate=true; };
  const rig=(D,T)=>{ const R=D.rig, bones=R.names.map((nm,i)=>{ const b=new THREE.Bone(); b.name=nm; b.position.fromArray(T[i]); b.quaternion.fromArray(R.q[i]); if(R.s)b.scale.fromArray(R.s[i]); return b; });
    R.parent.forEach((p,i)=>{ if(p>=0)bones[p].add(bones[i]); }); const W=bones.map(()=>new THREE.Matrix4());
    bones.forEach((b,i)=>{ M4.compose(b.position,b.quaternion,b.scale); W[i].copy(R.parent[i]>=0?W[R.parent[i]]:new THREE.Matrix4()).multiply(M4); });
    return {bones,skeleton:new THREE.Skeleton(bones,W.map(m=>m.clone().invert()))}; };
  const clips=(D,T)=>{ const out={}, BN=D.rig.names;
    for(const [name,C] of Object.entries(D.clips)){ const tm=Array.from({length:C.n},(_,k)=>k*C.dur/(C.n-1)), Q=I16(C.q), tr=[];
      BN.forEach((bn,j)=>{ const v=new Float32Array(C.n*4); for(let k=0;k<C.n;k++)for(let c=0;c<4;c++)v[k*4+c]=Q[(k*BN.length+j)*4+c]/32000; tr.push(new THREE.QuaternionKeyframeTrack(bn+'.quaternion',tm,v)); });
      for(const bn in C.p){ const j=BN.indexOf(bn), d=F32(C.p[bn]), v=new Float32Array(d.length); for(let k=0;k<d.length;k++)v[k]=d[k]+T[j][k%3]; tr.push(new THREE.VectorKeyframeTrack(bn+'.position',tm,v)); }
      out[name]=new THREE.AnimationClip(name,C.dur,tr); } return out; };
  // a clip for what it is doing: its own names vary (Walk, Walk_folded_wings, Crawl, Fly, Flying ...)
  const pickClip=(CL,want)=>{ const N=Object.keys(CL), f=re=>N.find(n=>re.test(n));
    if(want==='fly')return f(/^fly|flying|flap|hover/i)||f(/^idle_open_wings/i)||null;
    if(want==='run')return f(/^run(?!.*open)/i)||f(/gallop|trot/i)||f(/^walk(?!.*open)/i)||f(/walk|crawl|hop|jump|swim|fly/i)||N[0];
    if(want==='walk')return f(/^walk(?!.*open)/i)||f(/walk|crawl|hop|jump|run|swim|fly/i)||N[0];
    return f(/^idle(?!.*open)/i)||f(/idle|rest|stand|breath/i)||N[0]; };
  /* ---------- one pet in the world, following someone ---------- */
  const PG=new THREE.Group(); PG.name='pets'; scene.add(LEVELS.own(PG,'*')); MAPG.pets=PG;
  const THEIRS=new Map(); PETS.theirs=THEIRS;
  const groundAt=(x,z,y0)=>{ let g=typeof SHARED.groundY!=='undefined'?SHARED.groundY(x,z):y0; if(!(Math.abs(g-y0)<1.2*WU))g=y0; return g; };
  const make=async(id,P,lead,o={})=>{ const K=(await idx()).by[P.k]; if(!K)return null; const D=await kind(P.k), {P:Pp,T}=shape(D,P), R=rig(D,T), CL=clips(D,T);
    const geo=SKIN.geom(D.mesh); geo.attributes.position.array.set(Pp); paint(D,P,geo);
    const long=K.long*P.z/100, big=Math.max(...D.size), metres=D.tall*long/big, FC=pickClip(CL,'fly'), flies=!!FC, onlyFly=!!FC&&pickClip(CL,'walk')===FC;
    const mixer=new THREE.AnimationMixer(R.bones[0]), A={}, act=n=>A[n]||(A[n]=mixer.clipAction(CL[n])); let cur=null, hover=0, lastL=null, idleT=0;
    const walkV=Math.max(.5,Math.min(1.6,1.7*metres)), runV=Math.max(1.4,Math.min(4.5,3.6*metres));
    const st0={x:0,z:0};
    const N=makeNPC(null,{key:'pet-'+id,name:(P.n||K.name).toUpperCase(),names:['body'],lv:SHARED.LVL||'up',group:'pets',geo,skin:R,tall:D.tall,rank:[0],metres,x:0,z:0,lane:{x0:-1e9,x1:1e9,z0:-1e9,z1:1e9},
      free:()=>true,radius:Math.min(.25,long*.3),speed:walkV/.84,stride:0,rock:0,bob:0,pick:()=>{},noSelf:true,
      ground:(x,z)=>groundAt(x,z,lastL?lastL.y:SHARED.py)+hover*WU,
      brain:(dt,you,st)=>{ const L=lead(); if(!L){ N.g.visible=false; return; } N.g.visible=true; const v=lastL?Math.hypot(L.x-lastL.x,L.z-lastL.z)/Math.max(dt,1e-3):0; lastL=L;
        const dx=st.x-L.x, dz=st.z-L.z, d=Math.hypot(dx,dz)/WU;
        if(!N.placed||d>14||Math.abs((N.g.position.y-hover*WU)-L.y)>2.5*WU){ place(L); return; }
        if(o.stay){ if(!st.to&&(idleT-=dt)<0){ idleT=3+Math.random()*5; const a=Math.random()*6.28, r=Math.random()*1.6*WU; st.to={x:o.stay.x+Math.sin(a)*r,z:o.stay.z+Math.cos(a)*r}; st.v=walkV*WU; } return; }
        if(d>1.7){ const k=1.05/d; st.to={x:L.x+dx*k,z:L.z+dz*k}; st.v=(d>3.5?Math.max(runV,v/WU*1.15):walkV)*WU; } else if(d<1.3){ st.to=null; st.face={x:L.x,z:L.z}; } },
      anim:(dt,moving,st)=>{ const fast=moving&&st.v>walkV*WU*1.2, air=onlyFly||flies&&(moving&&(st.v>walkV*WU*1.2||hover>.05)||lastL&&lastL.y-groundAt(lastL.x,lastL.z,lastL.y)>.3*WU);
        hover+=((air?(onlyFly?.9:1.3):0)-hover)*Math.min(1,dt*2.5);
        const want=air&&FC||(moving?pickClip(CL,fast?'run':'walk'):pickClip(CL,'idle'));
        if(want!==cur){ act(want).reset().fadeIn(.2).play(); if(cur)act(cur).fadeOut(.2); cur=want; } act(cur).timeScale=moving&&!air?Math.max(.6,Math.min(1.8,st.v/(fast?runV:walkV)/WU)):1; mixer.update(dt); }});
    const place=L=>{ const st=N.st, a=L.hd+Math.PI*.8; st.x=L.x+Math.sin(a)*1.1*WU; st.z=L.z+Math.cos(a)*1.1*WU; st.h=L.hd; st.to=null; N.placed=true; };
    N.farMove=()=>{ const L=lead(); if(L)place(L); };   // (a pet left far behind, not ticked: back beside its person)
    N.g.rotation.order='YXZ'; N.mixer=mixer; N.pet=P; N.petKind=K;
    // pet it: a word and a sit, now and then
    const hb=new THREE.Mesh(new THREE.BoxGeometry(long*WU,Math.max(.3,metres)*WU,long*WU),new THREE.MeshBasicMaterial({visible:false})); hb.position.y=metres*WU/2; N.g.add(hb);
    N.th={name:o.mine?'PET '+(P.n||'YOUR '+K.name).toUpperCase():(o.owner?o.owner+"'S ":'')+(P.n||K.name).toUpperCase(),obj:hb,reach:1.6*TILE,near:2.6*TILE,tall:Math.max(.4,metres)*WU,act:()=>SAY(o.mine?(P.n||'YOUR '+K.name).toUpperCase()+' IS HAPPY TO SEE YOU.':'IT SNIFFS YOUR HAND.','#9fe07f')};
    UI.thing(N.th); return N; };
  const drop=N=>{ if(!N)return; const i=NPCS.indexOf(N); if(i>=0)NPCS.splice(i,1); N.g.removeFromParent(); if(N.th){ const j=UI.things.indexOf(N.th); if(j>=0)UI.things.splice(j,1); } N.me.geometry.dispose(); N.mixer&&N.mixer.stopAllAction(); };
  /* ---------- yours ---------- */
  let MY=decode(OWNED.get('pet')), DRAFT=null, inShop=false, gen=0;
  const save=()=>{ try{ if(MY)OWNED.set('pet',code(MY)); else OWNED.del('pet'); }catch(e){} };
  const shown=()=>inShop&&DRAFT||MY;
  const meLead=()=>VIT.dead?null:{x:pos.x,z:pos.z,y:SHARED.py,hd:SHARED.heading};
  const atHome=()=>!!(MODS.apts&&MODS.apts.inReal);
  let mine=null, mineCode='', homeSpot=null;
  const refresh=()=>{ const P=shown(), want=P&&(!P.h||inShop||atHome())?code(P)+(P.h&&!inShop?'@h':''):''; if(want===mineCode)return; mineCode=want; const my=++gen;
    drop(mine); mine=null; if(!want)return; homeSpot=P.h&&!inShop?{x:pos.x,z:pos.z}:null;
    make('mine',P,meLead,{mine:true,stay:homeSpot}).then(N=>{ if(my!==gen){ drop(N); return; } mine=N; }).catch(e=>console.warn('PET',e)); };
  PETS.WU=WU; PETS.dbg={UI,OWNED,pos,ROOMS}; PETS.make=make; PETS.drop=drop; PETS.idx=idx;
  PETS.mine=()=>mine; PETS.my=()=>MY; PETS.code=code; PETS.decode=decode;
  ONLINE.mine.pf=()=>MY&&!MY.h?code(MY):null;
  // theirs: a pet beside every player near you who has one with them
  const theirs=()=>{ const want=new Map(); if(ONLINE.on&&ONLINE.others)for(const o of ONLINE.others.values()){ const c=o.x&&o.x.pf; if(c&&o.why==='near you'&&o.fig)want.set(o.id,[o,c]); }
    for(const [id,r] of THEIRS)if(!want.has(id)||want.get(id)[1]!==r.c){ drop(r.N); r.dead=1; THEIRS.delete(id); }
    for(const [id,[o,c]] of want)if(!THEIRS.has(id)){ const P=decode(c); if(!P)continue; const r={c,N:null}; THEIRS.set(id,r);
      make('o'+id,P,()=>{ const g=o.fig&&o.fig.g; return g&&o.why==='near you'?{x:g.position.x,z:g.position.z,y:g.position.y,hd:g.rotation.y}:null; },{owner:o.name}).then(N=>{ if(r.dead)drop(N); else r.N=N; }).catch(e=>console.warn('PET',e)); } };
  SYS.every(()=>{ refresh(); theirs(); },500,'pets');
  /* ---------- YOU: the PET tab (and THE PET STORE's counter: the same lines, with the kinds and ADOPT) ---------- */
  const $=s=>document.querySelector(s), esc=t=>String(t).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';'), stop=e=>e.addEventListener('keydown',ev=>ev.stopPropagation());
  const el=(html,cls='row')=>{ const d=document.createElement('div'); d.className=cls; d.innerHTML=html; return d; };
  let made=false;
  const panel=()=>{ if(made||!LOOKS.add||!$('#looks .ltab[data-t="pet"]'))return made; made=true; const A={tab:'pet'};
    LOOKS.add('pt-none',null,el('<span id="lptnone" class="dim">NO PET YET. ADOPT ONE AT THE PET STORE ON MARKET ST.</span>'),{...A,order:0});
    LOOKS.add('pt-kind','ANIMAL',el('<select id="lptg" aria-label="kind of animal"></select><select id="lptk" aria-label="animal"></select><span id="lptkn"></span>','avw'),{...A,order:1});
    LOOKS.add('pt-name','NAME',el('<input type="text" id="lptn" maxlength="18" placeholder="its name" aria-label="pet name">'),{...A,order:2});
    LOOKS.add('pt-pre','LOOK',el('<span id="lptp"></span>'),{...A,order:3});
    LOOKS.add('pt-col','COLOURS',el('<span id="lptc" class="avk" style="max-width:none"></span>'),{...A,order:4});
    LOOKS.add('pt-shape','SHAPE',el('<div id="lpts" style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:2px 8px;align-items:center"></div>'),{...A,order:5});
    LOOKS.add('pt-size','SIZE',el('<input type="range" id="lptz" min="50" max="150" step="5" aria-label="pet size"><span id="lptzv" class="dim"></span>'),{...A,order:6});
    LOOKS.add('pt-home','WHERE',el('<button id="lpth0">WITH ME</button><button id="lpth1">WAITS AT HOME</button>'),{...A,order:7});
    LOOKS.add('pt-adopt',null,el('<button id="lpta">ADOPT</button> <span id="lptam" class="dim"></span>'),{...A,order:8});
    for(const s of ['#lptg','#lptk','#lptn','#lptz'])stop($(s));
    $('#lptg').onchange=()=>{ const K=I.kinds.find(k=>k.group===$('#lptg').value); if(K)choose(K.key); };
    $('#lptk').onchange=()=>choose($('#lptk').value);
    $('#lptn').onchange=()=>set({n:$('#lptn').value.trim().slice(0,18)});
    $('#lptz').oninput=()=>{ $('#lptzv').textContent=' '+$('#lptz').value+'%'; }; $('#lptz').onchange=()=>set({z:+$('#lptz').value});
    $('#lpth0').onclick=()=>set({h:false}); $('#lpth1').onclick=()=>set({h:true});
    $('#lptc').onchange=e=>{ const P=cur(), i=+e.target.dataset.i; if(!P||!(i>=0))return; const c=P.c.slice(); c[i]=e.target.value; set({c}); };
    $('#lptp').onclick=e=>{ const b=e.target.closest('button'); const P=cur(); if(!b||!P)return; const K=I.by[P.k]; if(b.dataset.p==='')return set({c:K.zones.map(z=>z[1])}); const pr=K.presets[b.dataset.p]; if(pr)set({c:K.zones.map(([z,d],i)=>pr[z]||P.c[i]||d)}); };
    $('#lpts').onchange=e=>{ const P=cur(), i=+e.target.dataset.i; if(!P||!(i>=0))return; const s=P.s.slice(); s[i]=+e.target.value; set({s}); };
    $('#lpta').onclick=adopt;
    return true; };
  const cur=()=>inShop?DRAFT:MY;
  const set=o=>{ const P=cur(); if(!P)return; Object.assign(P,o); if(!inShop)save(); draw(); };
  const choose=key=>{ const K=I.by[key]; if(!K)return; DRAFT=Object.assign(fresh(K),{n:DRAFT&&DRAFT.n||''}); draw(); };
  const price=P=>P&&I&&I.by[P.k]?PRICE[I.by[P.k].group]||30:0;
  function adopt(){ const P=DRAFT; if(!P||!inShop)return; const c=price(P); if(INV.cash<c)return SAY('THAT ONE IS $'+c+'. YOU HAVE $'+INV.cash+'.','#c8a090'); INV.cash-=c; if(INV.save)INV.save();
    const K=I.by[P.k]; MY={...P,c:P.c.slice(),s:P.s.slice()}; save(); SAY((P.n||'YOUR '+K.name).toUpperCase()+' IS YOURS: $'+c+'. CHANGE ITS LOOK ANY TIME IN YOU, PET.','#9fe07f'); draw(); }
  const on=(b,v)=>{ b.setAttribute('aria-pressed',String(v)); b.setAttribute('aria-selected',String(v)); };
  function draw(){ if(!I){ idx().then(draw).catch(e=>console.warn('PET',e)); return; } if(!panel())return; const P=cur(), K=P&&I.by[P.k], rows=k=>$('#looks .lr[data-k="'+k+'"]');
    rows('pt-none').dataset.off=P||inShop?'1':''; for(const k of ['pt-name','pt-pre','pt-col','pt-shape','pt-size','pt-home'])rows(k).dataset.off=P?'':'1'; rows('pt-kind').dataset.off=inShop||P?'':'1'; rows('pt-adopt').dataset.off=inShop?'':'1'; rows('pt-home').dataset.off=P&&!inShop?'':'1';
    const G=[...new Set(I.kinds.map(k=>k.group))];
    $('#lptg').innerHTML=G.map(g=>`<option value="${g}">${esc(GN[g]||g.toUpperCase())}</option>`).join(''); $('#lptg').style.display=inShop?'':'none'; $('#lptk').style.display=inShop?'':'none';
    if(K){ $('#lptg').value=K.group; $('#lptk').innerHTML=I.kinds.filter(k=>k.group===K.group).map(k=>`<option value="${k.key}">${esc(k.name)} ($${PRICE[k.group]||30})</option>`).join(''); $('#lptk').value=K.key; }
    $('#lptkn').textContent=inShop||!K?'':K.name;
    if(!P){ LOOKS.layout(); return; }
    $('#lptn').value=P.n||''; $('#lptz').value=P.z; $('#lptzv').textContent=' '+P.z+'%'; on($('#lpth0'),!P.h); on($('#lpth1'),!!P.h);
    const pk=P.k+'|'+K.zones.length; if($('#lptc').dataset.k!==pk){ $('#lptc').dataset.k=pk; $('#lptc').innerHTML=K.zones.map(([z],i)=>`<input type="color" data-i="${i}" title="${esc(z.replace(/([a-z])([A-Z])/g,'$1 $2').toUpperCase())}" aria-label="${esc(z)} colour">`).join('');
      $('#lptp').innerHTML='<button data-p="">NATURAL</button>'+Object.keys(K.presets).map(p=>`<button data-p="${esc(p)}">${esc(p)}</button>`).join('');
      $('#lpts').innerHTML=K.knobs.map(([k,l],i)=>`<span class="dim">${esc(l)}</span><input type="range" min="0" max="100" step="5" data-i="${i}" aria-label="${esc(l)}">`).join('')||'<span class="dim">NONE FOR THIS ONE</span>'; }
    for(const i of $('#lptc').querySelectorAll('input'))i.value=P.c[+i.dataset.i]||K.zones[+i.dataset.i][1]; for(const i of $('#lpts').querySelectorAll('input'))i.value=P.s[+i.dataset.i]??50;
    $('#lpta').textContent='ADOPT THIS '+K.name+' FOR $'+price(P); $('#lptam').textContent=MY?'(YOUR '+(MY.n||I.by[MY.k].name).toUpperCase()+' GOES TO A GOOD HOME)':'';
    LOOKS.layout(); refresh(); }
  PETS.draw=draw; PETS.choose=k=>choose(k); PETS.set=set; PETS.adopt=()=>adopt(); PETS.inShop=()=>inShop;
  // the counter: the YOU window on its PET tab, the kinds open, the one you are choosing beside you; leaving the shop puts yours back
  PETS.shop=()=>{ idx().then(()=>{ inShop=true; DRAFT=MY?{...MY,c:MY.c.slice(),s:MY.s.slice(),h:false}:fresh(I.by.cat||I.kinds[0]); draw(); LOOKS.open(); LOOKS.tab('pet'); }); };
  SYS.every(()=>{ if(inShop&&($('#looks')&&$('#looks').hidden||!(ROOMS.off.pets&&ROOMS.off.pets.spawn&&Math.hypot(pos.x-ROOMS.off.pets.spawn[0],pos.z-ROOMS.off.pets.spawn[1])<15*TILE))){ inShop=false; DRAFT=null; draw(); } },400,'pet shop');
  SYS.onStart(()=>{ const P=$('#looks'); if(P)new MutationObserver(()=>{ if(!P.hidden)draw(); }).observe(P,{attributes:true,attributeFilter:['hidden']}); if(MY)idx().then(draw).catch(()=>{}); },'146zj-pets');
  // THE PET STORE: the shops' shared inside (162fa: the keeper's counter and shelves) and, by the door, a stand with the adoption book
  MSHOP.kit.pets=A=>{ (MSHOP.kit._||(()=>{}))(A); const R=A.R, F=IKIT.frame(R), K=IKIT.room(F,o=>A.add(o),()=>{}), D=F.D, tm=D/(R.y1-R.y0), u0=.5, u1=1.1, v0=D-1.0, v1=D-.55;
    K.box(u0,v0,u1,v1,0,.95,0x5a3a26); K.box(u0-.03,v0-.03,u1+.03,v1+.03,.95,1.0,0x3a2418); K.box(u0+.12,v0+.08,u1-.12,v1-.08,1.0,1.06,0xe8dcc0); K.box(u0+.16,v0+.1,u0+.3,v1-.1,1.0,1.07,0x7a2a2a);
    A.sol(R.x0+u0/tm,R.y0+v0/tm,R.x0+u1/tm,R.y0+v1/tm); K.use('THE ADOPTION BOOK (ADOPT A PET)',(u0+u1)/2,(v0+v1)/2,.8,1.2,()=>PETS.shop(),1.8); K.flush(); };
  MSHOP.kit.pets.drop=()=>{ const d=MSHOP.kit._&&MSHOP.kit._.drop; if(d)d(); };
}
