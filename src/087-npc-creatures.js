// THE CREATURES: PAWNS sets the rats, frogs, snakes, spiders and bats loose in their lanes, painted and animated.
import {SHARED, THREE} from './003-shx.js';
import {SKIN} from './003a-skin.js';
import {CLOCK, FLOW, PARK, POND, VIS} from './003b-systems.js';
import {MODS, SOL, TILE} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
import {makeNPC, STHOLE} from './076-npc-map.js';
import {CREATURES, CREATURESREADY} from './086-npc-fox.js';
{ const C=CREATURES, geomOf=M=>SKIN.geom(M), rigOf=R=>SKIN.rig(R), clipsOf=D=>SKIN.clips(D.clips,D.rig.names);
  const M=SHARED.BOD.MAP, X=SHARED.BOD.XS, Z=SHARED.BOD.ZS, PARKL={x0:X(PARK.x0+PARK.ox+2.2),x1:X(PARK.x1+PARK.ox-2.2),z0:Z(PARK.y0+PARK.oy+2.2),z1:Z(PARK.y1+PARK.oy-2.2)}, ALL={x0:X(M.x0+2),x1:X(M.x1-2),z0:Z(-76.3),z1:Z(PARK.y1+PARK.oy-1)},
    HOLE=STHOLE, FREE=(x,z,R)=>!(x>HOLE[0]-R&&x<HOLE[2]+R&&z>HOLE[1]-R&&z<HOLE[3]+R)&&!SOL.up.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R)&&!FOUNT.wet(x,z,R);
  const KIND={Rat:{walk:'Rat_Walk',run:'Rat_Run',idle:'Rat_Idle',pace:3,lane:ALL,night:.6},Frog:{walk:'Frog_Jump',idle:'Frog_Idle',pace:2.4,lane:PARKL,hop:[.33,.78]},Slime:{walk:'Slime_Walk',idle:'Slime_Idle',pace:1.2,lane:PARKL,turn:-Math.PI/2},
    Snake:{walk:'Snake_Walk',idle:'Snake_Idle',pace:2,lane:PARKL},Spider:{walk:'Spider_Walk',idle:'Spider_Idle',pace:3,lane:PARKL},Bat:{walk:'Bat_Flying',idle:'Bat_Flying',pace:3,lane:PARKL,fly:[6,13],night:1},Wasp:{walk:'Wasp_Flying',idle:'Wasp_Flying',pace:3,lane:PARKL,fly:[1,2.5],day:1}};
  const PAINT=(()=>{ const hh=(x,y,z)=>{ const v=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return v-Math.floor(v); }, vn=(x,y,z)=>{ const i=Math.floor(x), j=Math.floor(y), k=Math.floor(z), f=x-i, g=y-j, e=z-k, s=t=>t*t*(3-2*t), u=s(f), v=s(g), w=s(e), L=(a,b,t)=>a+(b-a)*t;
      return L(L(L(hh(i,j,k),hh(i+1,j,k),u),L(hh(i,j+1,k),hh(i+1,j+1,k),u),v),L(L(hh(i,j,k+1),hh(i+1,j,k+1),u),L(hh(i,j+1,k+1),hh(i+1,j+1,k+1),u),v),w); };
    const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t], mul=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
    const K={
      Spider:(q,n,c,r,P)=>{ if(r===1)return c; const d=Math.hypot(q[0]-.5,q[2]-.48), body=d<.2&&q[1]>.25, abd=body&&q[2]<.45;
        let o=[58,44,34]; if(!body){ o=Math.floor(d*30+vn(P[0]*2,0,P[2]*2)*.6)%3===0?[132,100,66]:[50,38,30]; }
        else if(abd&&n[1]>.2){ const ch=Math.abs(q[0]-.5)*6+q[2]*10; if((ch%1)<.28&&Math.abs(q[0]-.5)<.09)o=[168,136,92]; else if(Math.abs(q[0]-.5)<.02)o=[118,90,62]; }
        return mul(o,.86+.28*vn(P[0]*6,P[1]*6,P[2]*6)); },
      Frog:(q,n,c,r,P)=>{ if(r>=2)return c; const belly=n[1]<-.25||q[1]<.2;
        if(r===1||belly)return mul(mix([226,214,160],[200,190,128],vn(P[0]*4,P[1]*4,P[2]*4)),1);
        const b=vn(P[0]*2.2+3,P[1]*2.2,P[2]*2.2), side=n[1]<.35; let o=b>.62?[40,78,34]:b>.55?[56,96,42]:[92,146,58]; if(side)o=mix(o,[150,160,84],.35);
        if(Math.abs(q[0]-.5)<.03&&n[1]>.5)o=[150,178,90]; return mul(o,.9+.2*vn(P[0]*9,P[1]*9,P[2]*9)); },
      Snake:(q,n,c,r,P)=>{ if(r>=2&&r!==3)return c; if(r===3)return c; const belly=n[1]<-.3;
        if(belly)return [214,200,150]; const a=P[1]*3.2+Math.atan2(P[2]-.3,P[0])*.8, d=Math.abs((a%1+1)%1-.5)*2, l=Math.abs(n[0])*1.1;
        const dm=d+l*.6; return dm<.55?[52,66,36]:dm<.7?[176,160,96]:mul([96,120,62],.9+.2*vn(P[0]*5,P[1]*5,P[2]*5)); },
      Bat:(q,n,c,r,P)=>{ if(r>=2)return c; const wing=Math.abs(q[0]-.5)>.18;
        if(wing){ const v=Math.abs(Math.sin(Math.atan2(P[1]-3,P[0])*7))<.14; return v?[24,18,28]:mix([62,44,58],[86,62,70],vn(P[0]*3,P[1]*3,P[2]*3)); }
        return r===1?mix([140,104,70],[170,130,84],vn(P[0]*6,P[1]*6,P[2]*6)):mix([60,44,40],[84,62,52],vn(P[0]*6,P[1]*6,P[2]*6)); },
      Slime:(q,n,c,r,P)=>{ if(r===1)return c; const b=vn(P[0]*3,P[1]*3,P[2]*3); let o=mix([70,150,64],[136,214,104],q[1]); if(b>.68)o=[176,236,150]; if(n[1]>.75&&q[1]>.8)o=[214,250,196]; return o; } };
    return (key,g)=>{ const f=K[key]; if(!f)return g; g=g.toNonIndexed(); const p=g.attributes.position.array, c=g.attributes.color.array, R=g.attributes.reg.array;
      let lo=[1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9]; for(let i=0;i<p.length;i+=3)for(let j=0;j<3;j++){ lo[j]=Math.min(lo[j],p[i+j]); hi[j]=Math.max(hi[j],p[i+j]); }
      const A=new THREE.Vector3(), B=new THREE.Vector3(), C_=new THREE.Vector3();
      for(let t=0;t<p.length/9;t++){ const i=t*9; A.fromArray(p,i); B.fromArray(p,i+3); C_.fromArray(p,i+6); const P=[(A.x+B.x+C_.x)/3,(A.y+B.y+C_.y)/3,(A.z+B.z+C_.z)/3], N=B.clone().sub(A).cross(C_.clone().sub(A)).normalize();
        const q=[0,1,2].map(j=>(P[j]-lo[j])/Math.max(1e-6,hi[j]-lo[j])), col=[c[i],c[i+1],c[i+2]].map(v=>v*(c instanceof Uint8Array?1:255)), o=f(q,[N.x,N.y,N.z],col,Math.round(R[t*3]),P);
        const dep=(.68+.32*Math.min(1,q[1]*1.6))*(N.y>.5?1.06:N.y<-.3?.78:1);
        for(let k=0;k<3;k++)for(let j=0;j<3;j++){ const v=Math.max(0,Math.min(255,o[j]*dep)); c[i+k*3+j]=c instanceof Uint8Array?Math.round(v):v/255; } }
      g.attributes.color.needsUpdate=true; return g; }; })();
  const CREATS=[]; window.CREATS=CREATS;
  const CH=[['Rat','RAT',.22,[60,-73.5],.9,0],['Rat','RAT',.22,[95,-39.5],.9,0],['Rat','RAT',.22,[110,-27],.9,0],['Frog','FROG',.28,[70,-21],.35,0],['Frog','FROG',.26,[75,-27],.35,0],
    ['Slime','SLIME',.45,[62,-17],.25,0],['Snake','SNAKE',.42,[90,-24],.3,0],['Spider','SPIDER',.4,[57,-29],.45,0],['Spider','SPIDER',.36,[99,-18],.45,0],
    ['Bat','BAT',.55,[72,-22],1.1,0],['Bat','BAT',.5,[85,-27],1.1,0],['Bat','BAT',.6,[60,-17],1.1,0],['Wasp','WASP',.22,[64,-32],.8,0],['Wasp','WASP',.2,[80,-34],.8,0],['Wasp','WASP',.2,[102,-21],.8,0]];
  for(const r of SHARED.METRO.rats){ const L=r.lane; CH.push(['Rat','RAT',.22,null,.9,0,{lv:'down',group:'down',lane:L,free:(x,z,R)=>x>L.x0&&x<L.x1&&z>L.z0&&z<L.z1&&!SOL.down.some(b=>x>b[0]-R&&x<b[2]+R&&z>b[1]-R&&z<b[3]+R),ground:(x,z)=>MODS.station.ground(x,z),x:r.x,z:r.z}]); }
  const spawn=([key,name,metres,tp,speed,turn,ex])=>{ const D=C[key], K=Object.assign({},KIND[key],ex&&{lane:ex.lane}), rig=rigOf(D.rig), CL=clipsOf(D), mixer=new THREE.AnimationMixer(rig.bones[0]), A={}, act=n=>A[n]||(A[n]=mixer.clipAction(CL[n])), free=ex?ex.free:(K.free||FREE), [tx,tz]=tp||[0,0];
    const st2={fly:K.fly?K.fly[0]+Math.random()*(K.fly[1]-K.fly[0]):0,hid:false,t:Math.random()*10}; let cur=null;
    const N=makeNPC(null,{key:key.toLowerCase(),name,names:D.mesh.parts,lv:ex?ex.lv:'up',group:ex?ex.group:K.lane===PARKL?'park':'bodega',geo:PAINT(key,geomOf(D.mesh)),skin:rig,tall:D.tall,rank:D.mesh.parts.map(()=>0),metres,x:ex?ex.x:X(tx),z:ex?ex.z:Z(tz),lane:K.lane,free,ground:ex?ex.ground:(x,z)=>MODS.bodega.ground(x,z),radius:.12,speed,stride:0,rock:0,bob:0,
      pick:K.fly?st=>{ const L=K.lane; st.to={x:L.x0+Math.random()*(L.x1-L.x0),z:L.z0+Math.random()*(L.z1-L.z0)}; st2.fly=K.fly[0]+Math.random()*(K.fly[1]-K.fly[0]); }
        :st=>{ '@later'; const P=window.POND, L=K.lane; st2.drink=false; st.face=null; if(P&&P.ready&&K.lane===PARKL&&Math.random()<.4){ const e=P.edge(); if(free(e.x,e.z,.12*TILE)){ st.to=e; st2.drink=true; return; } }
          for(let k=0;k<12;k++){ const p={x:L.x0+Math.random()*(L.x1-L.x0),z:L.z0+Math.random()*(L.z1-L.z0)}; if(free(p.x,p.z,.12*TILE)){ st.to=p; return; } } st.to=null; st.wait=1; },
      anim:(dt,moving,st,sc)=>{ st2.t+=dt;
        const dark=CLOCK.dark(), out=K.night===1?dark:K.day?!dark:true; if(out===st2.hid){ st2.hid=!out; VIS.hide(N.g,'away',!out); st.hold=!out; if(!out)st.to=null; }
        if(!out)return;
        if(st2.drink&&!st.to&&window.POND&&POND.c){ st.face={x:POND.c.x,z:POND.c.z}; st.wait=Math.max(st.wait||0,6); st2.drink=false; }
        const run=K.run&&moving&&st.v>1.2*TILE, want=moving?(run?K.run:K.walk):K.idle; if(want!==cur){ const a=act(want); a.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.2).play(); if(cur)act(cur).fadeOut(.2); cur=want; }
        if(K.hop){ const a=act(cur), ph=(a.time/a.getClip().duration)%1, air=moving&&ph>K.hop[0]&&ph<K.hop[1]; st.v=speed*TILE*(air?1/(K.hop[1]-K.hop[0]):.004); a.timeScale=1; }
        else act(cur).timeScale=moving?Math.max(.6,st.v/(K.pace*sc)):1; mixer.update(dt);
        if(K.fly){ N.g.position.y+=st2.fly*TILE/.84*.5+Math.sin(st2.t*2.1)*.15; N.body.rotation.z=moving?Math.sin(st2.t*1.3)*.15:0; } }});
    N.g.rotation.order='YXZ'; N.me.rotation.y=turn+(K.turn||0); N.me.position.set(0,0,0);
    if(K.fly){ N.blocks=()=>false; N.push=()=>{}; N.st.v=speed*TILE; }
    if(ex)N.g.position.set(N.st.x,ex.ground(N.st.x,N.st.z),N.st.z);
    N.mixer=mixer; N.restless=()=>!!K.fly; if(!ex&&(K.lane===PARKL||K.park))N.park=true; N.pack(); CREATS.push(N); };
  CREATURESREADY.then(()=>{ for(const e of CH)spawn(e); });
  // the Drive's animals (owner, 3 Nov 2026): the park's woods, its farm, its zoo and its dinosaur valley, bugs in the grass, cats and a dog on the street
  { const R=(x0,y0,x1,y1)=>({x0:X(x0),x1:X(x1),z0:Z(y0),z1:Z(y1),park:1}), WOOD=PARKL, FARM=R(200,22,224,52), ZOO=R(-20,104,22,134), DINO=R(62,132,104,176), LAKE=R(140,-2,166,22);
    const DRY=(x,z,R)=>FREE(x,z,R)&&!((window.FLOW&&FLOW.waters)||[]).some(w=>w.has&&w.has(x,z));
    const k=(n,lane,pace,o={})=>KIND[n]=Object.assign({walk:n+'_Walk',run:n+'_Run',idle:n+'_Idle',pace,lane,park:lane!==ALL,free:lane===LAKE?FREE:DRY},o), fly=(n,lane,f,o)=>k(n,lane,3,Object.assign({walk:n+'_Fly',run:null,idle:n+'_Fly',fly:f},o));
    k('Fox',WOOD,3,{night:.5}); k('Deer',WOOD,2.4); k('Wolf',WOOD,3,{night:1}); k('Bear',WOOD,2); k('Crow',ALL,2.5); fly('Owl',WOOD,[5,9],{night:1}); k('Duck',LAKE,2,{run:null});
    k('Cat',ALL,2.5); k('BlackCat',ALL,2.5,{night:1}); k('Dog',ALL,3);
    for(const n of ['Cow','Pig','Horse','WildHorse','Mule','Ibex'])k(n,FARM,2.4); for(const n of ['Lion','Elephant','Giraffe','Zebra','Camel'])k(n,ZOO,2.4); k('Penguin',LAKE,2,{run:null});
    k('Raptor',DINO,3); k('Stego',DINO,2); k('Brachio',DINO,1.6,{run:null}); fly('Ptera',DINO,[8,14]);
    for(const n of ['AntQueen','WoodAnt','Aphid','Ladybird','Hopper','Beetle','Mantis'])k(n,WOOD,3); for(const n of ['Caterpillar','Slug','Snail'])k(n,WOOD,1.5,{walk:n+'_Crawl',run:null}); k('Crab',LAKE,2);
    fly('Bee',WOOD,[.6,1.6],{day:1}); fly('Bumblebee',WOOD,[.6,1.6],{day:1}); fly('Firefly',WOOD,[.5,1.8],{night:1});
    // [key, NAME, metres tall, how many, speed]
    const FA=[['Fox','FOX',.45,2,1],['Deer','DEER',1.2,3,1],['Wolf','WOLF',.8,2,1.1],['Bear','BLACK BEAR',1,1,.8],['Crow','CROW',.3,4,.8],['Owl','OWL',.32,2,1.2],['Duck','DUCK',.45,4,.6],
      ['Cat','CAT',.28,2,.9],['BlackCat','BLACK CAT',.3,1,.9],['Dog','DOG',.6,1,1.1],['Cow','COW',1.4,3,.6],['Pig','PIG',.9,3,.6],['Horse','HORSE',1.6,2,1],['WildHorse','WILD HORSE',1.5,2,1],['Mule','MULE',1.4,1,.7],['Ibex','IBEX',1,2,.9],
      ['Lion','LION',1.1,2,.9],['Elephant','ELEPHANT',3,2,.6],['Giraffe','GIRAFFE',5,2,.6],['Zebra','ZEBRA',1.4,3,.9],['Camel','CAMEL',2,2,.6],['Penguin','PENGUIN',.6,4,.4],
      ['Raptor','VELOCIRAPTOR',.9,3,1.4],['Stego','STEGOSAURUS',3.5,2,.5],['Brachio','BRACHIOSAURUS',11,1,.4],['Ptera','PTERANODON',1.6,2,1.4],
      ['AntQueen','ANT QUEEN',.08,2,.4],['WoodAnt','WOOD ANT',.05,4,.5],['Aphid','APHID',.04,3,.2],['Ladybird','LADYBIRD',.06,4,.3],['Hopper','GRASSHOPPER',.1,3,.5],['Beetle','STAG BEETLE',.1,2,.3],['Mantis','PRAYING MANTIS',.16,2,.3],
      ['Caterpillar','CATERPILLAR',.06,3,.1],['Slug','LEOPARD SLUG',.06,2,.08],['Snail','SNAIL',.08,3,.06],['Crab','HERMIT CRAB',.12,3,.3],['Bee','HONEYBEE',.1,4,.8],['Bumblebee','BUMBLEBEE',.12,3,.7],['Firefly','FIREFLY',.08,5,.6]];
    const FL=__LAZY__("data/fauna.json"), hs=(a,b)=>{ const v=Math.sin(a*127.1+b*311.7)*43758.5453; return v-Math.floor(v); }, inv=(L,x,z)=>[(x-X(0))/(X(1)-X(0)),(z-Z(0))/(Z(1)-Z(0))];
    CREATURESREADY.then(()=>FL()).then(J=>{ Object.assign(C,J); FA.forEach(([key,name,m,n,sp],i)=>{ if(!C[key])return; const L=KIND[key].lane; for(let j=0;j<n;j++){ const x=L.x0+hs(i,j)*(L.x1-L.x0), z=L.z0+hs(j,i+7)*(L.z1-L.z0); spawn([key,name,m,inv(L,x,z),sp,0]); } }); }).catch(e=>console.warn('FAUNA',e)); }
  window.CREATNEW=(key,id,metres,X={})=>{ '@later'; const D=C[key], K=KIND[key], rig=rigOf(D.rig), CL=clipsOf(D), mixer=new THREE.AnimationMixer(rig.bones[0]), A={}, act=n=>A[n]||(A[n]=mixer.clipAction(CL[n])); let cur=null;
    const N=makeNPC(null,{key:id,name:id.toUpperCase(),names:D.mesh.parts,lv:'up',group:'bodega',geo:X.paint?X.paint(geomOf(D.mesh)):PAINT(key,geomOf(D.mesh)),skin:rig,tall:D.tall,rank:D.mesh.parts.map(()=>0),metres,x:0,z:0,lane:K.lane,free:()=>true,radius:.12,speed:1,stride:0,rock:0,bob:0,...X.npc,
      anim:(dt)=>{ const want=N.clip||K.idle; if(want!==cur){ const a=act(want); a.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.15).play(); if(cur)act(cur).fadeOut(.15); cur=want; } act(cur).timeScale=N.clipK||1; mixer.update(dt); }});
    N.g.rotation.order='YXZ'; N.me.rotation.y=K.turn||0; N.me.position.set(0,0,0); N.mixer=mixer; return N; };
  window.CREATDBG=()=>CREATS.map(N=>({key:N.key,x:+N.st.x.toFixed(1),z:+N.st.z.toFixed(1),y:+N.g.position.y.toFixed(2),to:!!N.st.to,vis:N.g.visible})); }

const PAWNS=__LAZY__("data/pawns.json");
export {PAWNS};
