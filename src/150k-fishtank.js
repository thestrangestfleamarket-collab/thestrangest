// THE FISH TANK: a huge tank in every apartment (owner, 5 Nov 2026): still, clear water you see through, sand, rocks and plants, and koi swimming slow; double-click it with fish food and they rise to eat.
import {THREE} from './003-shx.js';
import {FORAGE, PETS, SFX} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {SYS} from './006-map-pre.js';
import {FISHES} from './141f-fishes.js';
import {ROOMK} from './150a-bedroom.js';
const TANKS=[]; window.TANKDBG=()=>TANKS.map(T=>({fish:T.fish.length,vis:T.g.visible,pos:[+T.g.position.x.toFixed(2),+T.g.position.z.toFixed(2)],fed:+(T.fed||0).toFixed(1),y:T.fish.length?+(T.fish.reduce((a,f)=>a+f.o.position.y,0)/T.fish.length).toFixed(3):0}));
{ const TW=2.4, TD=.7, TH=1.0, SH=.78, GL=.012, KINDS=['koi','koi_gold','koi_showa','koi_sanke','koi_platinum','koi_asagi','koi_orange','koi_black'], N=8;
  const hs=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
  for(const k of ['FISH TANK'])ROOMK.always.add(k);   // in every apartment from the start (owner, 7 Nov 2026)
  ROOMK.parts.push(c=>{ '@apts'; const {R,part,mat,rbox,cap,Lx,Ly}=c;
    cap('FISH TANK',g=>{ const tg=new THREE.Group(); tg.position.set(Lx-TD/2-.15,0,Ly*.42); tg.rotation.y=Math.PI/2; g.add(tg); const u0=0, v0=0, P=(geo,m,u,h,v,ry=0,par,cast=true)=>part(geo,m,u,h,v,ry,tg,cast);   // along the east wall, long side to it (owner, 7 Nov 2026: "put all the stuff in apartment along the walls")
      // the stand: a dark walnut cabinet
      P(rbox(TW+.06,SH,TD+.06,.02),mat([70,46,32]),u0,SH/2,v0);
      // the sand, the rocks, the plants
      const sand=new THREE.MeshStandardMaterial({color:new THREE.Color(.86,.8,.66),roughness:1});
      P(new THREE.BoxGeometry(TW-2*GL,.06,TD-2*GL),sand,u0,SH+.03,v0);
      const rock=new THREE.MeshStandardMaterial({color:new THREE.Color(.42,.4,.38),roughness:.9,flatShading:true});
      for(let i=0;i<5;i++){ const r=.05+hs(i,1)*.09, m=P(new THREE.DodecahedronGeometry(r,0),rock,u0+(hs(i,2)-.5)*(TW-.3),SH+.06+r*.5,v0+(hs(i,3)-.5)*(TD-.25)); m.rotation.set(hs(i,4)*3,hs(i,5)*3,0); }
      const leaf=new THREE.MeshStandardMaterial({color:new THREE.Color(.22,.55,.28),roughness:.8,side:THREE.DoubleSide}), plants=[];
      for(let i=0;i<9;i++){ const h=.25+hs(i,6)*.5, m=P(new THREE.PlaneGeometry(.05,h).translate(0,h/2,0),leaf,u0+(hs(i,7)-.5)*(TW-.2),SH+.06,v0-TD/2+.08+hs(i,8)*(TD*.35),hs(i,9)*3); plants.push([m,hs(i,10)*6]); }
      // the water: still, clear, faintly blue-green, bending the light like real water
      const water=new THREE.MeshPhysicalMaterial({color:new THREE.Color(.86,.96,.97),transmission:1,ior:1.333,thickness:TD,roughness:.03,metalness:0,attenuationColor:new THREE.Color(.55,.82,.84),attenuationDistance:2.2,transparent:true});
      const wm=P(new THREE.BoxGeometry(TW-2*GL,TH*.92-.06,TD-2*GL),water,u0,SH+.06+(TH*.92-.06)/2,v0,0,undefined,false); wm.renderOrder=2; wm.userData.soft=true;
      // the glass, the rim and the lit hood
      const glass=new THREE.MeshPhysicalMaterial({color:0xffffff,transmission:1,ior:1.5,thickness:GL,roughness:.01,metalness:0,transparent:true});
      for(const [w,d,x,z] of [[TW,GL,0,-TD/2+GL/2],[TW,GL,0,TD/2-GL/2],[GL,TD,-TW/2+GL/2,0],[GL,TD,TW/2-GL/2,0]]){ const m=P(new THREE.BoxGeometry(w,TH,d),glass,u0+x,SH+TH/2,v0+z,0,undefined,false); m.renderOrder=3; m.userData.soft=true; }
      P(new THREE.BoxGeometry(TW+.02,.05,TD+.02),mat([28,28,30]),u0,SH+TH+.025,v0);
      const hood=new THREE.MeshBasicMaterial({color:new THREE.Color(.85,.95,1)}); P(new THREE.BoxGeometry(TW-.2,.006,.05),hood,u0,SH+TH-.004,v0,0,undefined,false);
      // the fish: tiny ones, a few of each kind, each on its own slow loop
      const T={g,tg,plants,fish:[],u0,v0,y0:SH+.16,y1:SH+TH*.86,t:Math.random()*100}; TANKS.push(T);
      FISHES.load().then(()=>{ for(let i=0;i<N;i++){ const o=FISHES.model(KINDS[i%KINDS.length]); if(!o)continue; o.scale.setScalar(.022+hs(i,11)*.014); tg.add(o);
        T.fish.push({o,a:hs(i,12)*6.28,s:.12+hs(i,13)*.12,rx:.25+hs(i,14)*(TW/2-.45),rz:.06+hs(i,15)*(TD/2-.16),cy:T.y0+hs(i,16)*(T.y1-T.y0),bob:hs(i,17)*6,dir:hs(i,18)<.5?1:-1}); }
        // your sea pets from the aquarium, a little bigger than the koi, each its own size
        (PETS.sea?PETS.sea():[]).slice(0,24).forEach((r,j)=>{ const o=FISHES.model(r.k); if(!o)return; const i=N+j, L0=FISHES.len(r.k,1), g=FISHES.len('goldfish',1); o.scale.multiplyScalar(Math.min(.24,Math.max(.05,.06*Math.sqrt(L0/g)))/L0); tg.add(o);
          T.fish.push({o,a:hs(i,12)*6.28,s:.08+hs(i,13)*.1,rx:.3+hs(i,14)*(TW/2-.55),rz:.06+hs(i,15)*(TD/2-.2),cy:T.y0+.05+hs(i,16)*(T.y1-T.y0-.1),bob:hs(i,17)*6,dir:hs(i,18)<.5?1:-1}); }); }).catch(()=>{});
    },{id:'fishtank',wire:'tank'}); });
  ROOMK.wires.tank=(un,c)=>{ const T=TANKS.find(q=>q.g===un.obj); if(!T)return;
    c.hit(un,()=>FORAGE.has('g_fishfood')?'FEED THE FISH':'THE FISH TANK',()=>{ if(!FORAGE.has('g_fishfood'))return SAY('THE FISH DRIFT ROUND. A TUB OF FISH FOOD WOULD BRING THEM UP (THE BODEGA, THE PET STORE, THE AQUARIUM).','#c8d8e0');
      FORAGE.take('g_fishfood',1); if(FORAGE.draw)FORAGE.draw(); T.fed=30; if(SFX)SFX.play('click',{vol:.3,vary:.2}); SAY('YOU SHAKE IN A PINCH OF FOOD. THE FISH RISE AND SNAP IT UP.','#c8e8f0'); }); };
  SYS.add('life',dt=>{ for(let k=TANKS.length-1;k>=0;k--){ const T=TANKS[k]; if(!T.g.parent){ TANKS.splice(k,1); continue; } if(!T.g.visible)continue; T.t+=dt;
    for(const [m,ph] of T.plants)m.rotation.z=.04*Math.sin(T.t*.6+ph);
    const up=T.fed>0?Math.min(1,T.fed/3,(30-T.fed)/.6):0; if(T.fed>0)T.fed-=dt;   // fed: they swim to the top and quicker, then settle back
    for(const f of T.fish){ f.a+=f.dir*f.s*(1+up)*dt/Math.max(f.rx,f.rz); const x=Math.cos(f.a)*f.rx, z=Math.sin(f.a)*f.rz, y=f.cy+(T.y1-.04-f.cy)*up+.03*Math.sin(T.t*.5+f.bob);
      const dx=-Math.sin(f.a)*f.rx*f.dir, dz=Math.cos(f.a)*f.rz*f.dir; f.o.position.set(x,y-T.g.position.y-(T.tg?T.tg.position.y:0),z); f.o.rotation.y=Math.atan2(-dz,dx); } } },'150k-fishtank'); }
