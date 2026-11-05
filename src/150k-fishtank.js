// THE FISH TANK: a huge tank in every apartment (owner, 5 Nov 2026): still, clear water you see through, sand, rocks and plants, and tiny tropical fish swimming slow.
import {THREE} from './003-shx.js';
import {SYS} from './006-map-pre.js';
import {FISHES} from './141f-fishes.js';
import {ROOMK} from './150a-bedroom.js';
const TANKS=[]; window.TANKDBG=()=>TANKS.map(T=>({fish:T.fish.length,vis:T.g.visible,pos:[+T.g.position.x.toFixed(2),+T.g.position.z.toFixed(2)]}));
{ const TW=2.4, TD=.7, TH=1.0, SH=.78, GL=.012, KINDS=['clownfish','bluetang','wrasse','goatfish'], N=16;
  const hs=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
  ROOMK.parts.push(c=>{ '@apts'; const {R,part,mat,rbox,cap,Lx,Ly}=c;
    cap('FISH TANK',g=>{ const u0=Lx/2, v0=Ly*.55;
      // the stand: a dark walnut cabinet
      part(rbox(TW+.06,SH,TD+.06,.02),mat([70,46,32]),u0,SH/2,v0);
      // the sand, the rocks, the plants
      const sand=new THREE.MeshStandardMaterial({color:new THREE.Color(.86,.8,.66),roughness:1});
      part(new THREE.BoxGeometry(TW-2*GL,.06,TD-2*GL),sand,u0,SH+.03,v0);
      const rock=new THREE.MeshStandardMaterial({color:new THREE.Color(.42,.4,.38),roughness:.9,flatShading:true});
      for(let i=0;i<5;i++){ const r=.05+hs(i,1)*.09, m=part(new THREE.DodecahedronGeometry(r,0),rock,u0+(hs(i,2)-.5)*(TW-.3),SH+.06+r*.5,v0+(hs(i,3)-.5)*(TD-.25)); m.rotation.set(hs(i,4)*3,hs(i,5)*3,0); }
      const leaf=new THREE.MeshStandardMaterial({color:new THREE.Color(.22,.55,.28),roughness:.8,side:THREE.DoubleSide}), plants=[];
      for(let i=0;i<9;i++){ const h=.25+hs(i,6)*.5, m=part(new THREE.PlaneGeometry(.05,h).translate(0,h/2,0),leaf,u0+(hs(i,7)-.5)*(TW-.2),SH+.06,v0-TD/2+.08+hs(i,8)*(TD*.35),hs(i,9)*3); plants.push([m,hs(i,10)*6]); }
      // the water: still, clear, faintly blue-green, bending the light like real water
      const water=new THREE.MeshPhysicalMaterial({color:new THREE.Color(.86,.96,.97),transmission:1,ior:1.333,thickness:TD,roughness:.03,metalness:0,attenuationColor:new THREE.Color(.55,.82,.84),attenuationDistance:2.2,transparent:true});
      const wm=part(new THREE.BoxGeometry(TW-2*GL,TH*.92-.06,TD-2*GL),water,u0,SH+.06+(TH*.92-.06)/2,v0,0,undefined,false); wm.renderOrder=2; wm.userData.soft=true;
      // the glass, the rim and the lit hood
      const glass=new THREE.MeshPhysicalMaterial({color:0xffffff,transmission:1,ior:1.5,thickness:GL,roughness:.01,metalness:0,transparent:true});
      for(const [w,d,x,z] of [[TW,GL,0,-TD/2+GL/2],[TW,GL,0,TD/2-GL/2],[GL,TD,-TW/2+GL/2,0],[GL,TD,TW/2-GL/2,0]]){ const m=part(new THREE.BoxGeometry(w,TH,d),glass,u0+x,SH+TH/2,v0+z,0,undefined,false); m.renderOrder=3; m.userData.soft=true; }
      part(new THREE.BoxGeometry(TW+.02,.05,TD+.02),mat([28,28,30]),u0,SH+TH+.025,v0);
      const hood=new THREE.MeshBasicMaterial({color:new THREE.Color(.85,.95,1)}); part(new THREE.BoxGeometry(TW-.2,.006,.05),hood,u0,SH+TH-.004,v0,0,undefined,false);
      // the fish: tiny ones, a few of each kind, each on its own slow loop
      const T={g,plants,fish:[],u0,v0,y0:SH+.16,y1:SH+TH*.86,t:Math.random()*100}; TANKS.push(T);
      FISHES.load().then(()=>{ for(let i=0;i<N;i++){ const o=FISHES.model(KINDS[i%KINDS.length]); if(!o)continue; o.scale.setScalar(.035+hs(i,11)*.025); g.add(o);
        T.fish.push({o,a:hs(i,12)*6.28,s:.12+hs(i,13)*.12,rx:.25+hs(i,14)*(TW/2-.45),rz:.06+hs(i,15)*(TD/2-.16),cy:T.y0+hs(i,16)*(T.y1-T.y0),bob:hs(i,17)*6,dir:hs(i,18)<.5?1:-1}); } }).catch(()=>{});
    },{id:'fishtank'}); });
  SYS.add('life',dt=>{ for(let k=TANKS.length-1;k>=0;k--){ const T=TANKS[k]; if(!T.g.parent){ TANKS.splice(k,1); continue; } if(!T.g.visible)continue; T.t+=dt;
    for(const [m,ph] of T.plants)m.rotation.z=.04*Math.sin(T.t*.6+ph);
    for(const f of T.fish){ f.a+=f.dir*f.s*dt/Math.max(f.rx,f.rz); const x=Math.cos(f.a)*f.rx, z=Math.sin(f.a)*f.rz, y=f.cy+.03*Math.sin(T.t*.5+f.bob);
      const dx=-Math.sin(f.a)*f.rx*f.dir, dz=Math.cos(f.a)*f.rz*f.dir; f.o.position.set(x,y-T.g.position.y,z); f.o.rotation.y=Math.atan2(-dz,dx); } } },'150k-fishtank'); }
