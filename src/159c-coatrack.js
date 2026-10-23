// THE COAT RACK: the bear merchant's rack beside him on Main Street — two plain coats and the cloud coat, a coat of drifting clouds; use it to buy from the bear.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, SHOPS, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {FIX, LEVEL, SOL, SYS, TILE} from './006-map-pre.js';
import {GLBTOONS} from './084b-npc-glbtoons.js';
const RACK={};
{ const H=LEVEL.homes&&LEVEL.homes.coatbear, B=SHARED.BOD; if(H&&B&&B.XS){ const T=TILE, x=B.XS(H[0]), z=B.ZS(H[1]+1.3), y=SHARED.groundY?SHARED.groundY(x,z):0;
    const lam=c=>new THREE.MeshLambertMaterial({color:c,flatShading:true}), wood=lam(0x5a3a22), dark=lam(0x3a2414), g=new THREE.Group(); g.position.set(x,y,z); g.name='coatrack';
    const mesh=(geo,m,px,py,pz,rx=0,ry=0,rz=0)=>{ const o=new THREE.Mesh(geo,m); o.position.set(px,py,pz); o.rotation.set(rx,ry,rz); o.castShadow=true; g.add(o); return o; };
    mesh(new THREE.CylinderGeometry(.28*T,.32*T,.06*T,10),dark,0,.03*T,0); mesh(new THREE.CylinderGeometry(.035*T,.045*T,1.85*T,8),wood,0,.95*T,0); mesh(new THREE.SphereGeometry(.07*T,8,6),dark,0,1.9*T,0);
    const HOOK=[0,Math.PI/2,Math.PI,-Math.PI/2].map(a=>{ mesh(new THREE.BoxGeometry(.32*T,.03*T,.03*T),wood,Math.cos(a)*.17*T,1.68*T,Math.sin(a)*.17*T,0,-a,.25); return a; });
    const coat=(a,c,h)=>{ const cx=Math.cos(a)*.3*T, cz=Math.sin(a)*.3*T, m=lam(c); mesh(new THREE.BoxGeometry(.26*T,h,.12*T),m,cx,1.62*T-h/2,cz,0,-a,0); mesh(new THREE.BoxGeometry(.08*T,h*.8,.1*T),m,cx+Math.sin(a)*.17*T,1.6*T-h*.4,cz-Math.cos(a)*.17*T,0,-a,.15); };
    coat(HOOK[1],0x7a2e2a,.95*T); coat(HOOK[2],0x2e4a3a,.8*T);
    // the cloud coat: seven puffs that drift, the same cloud the player wears
    const cloud=new THREE.MeshLambertMaterial({color:0xf2f5ff,emissive:0x8ea2c8,transparent:true,opacity:.9,flatShading:true}), puffs=[], a0=HOOK[3], cx0=Math.cos(a0)*.3*T, cz0=Math.sin(a0)*.3*T;
    for(let i=0;i<7;i++){ const p=mesh(new THREE.IcosahedronGeometry(1,0),cloud,0,0,0); p.userData.sd=i*1.7; puffs.push(p); }
    const drift=t=>{ for(let k=0;k<7;k++){ const p=puffs[k], sd=p.userData.sd, u=k/7; p.position.set(cx0+Math.sin(u*6.3+t*.6+sd)*.11*T, 1.55*T-u*.75*T+Math.sin(t*.8+sd)*.05*T, cz0+Math.cos(u*6.3+t*.5+sd)*.11*T); p.scale.setScalar(T*(.13+.035*Math.sin(t*.9+sd))); } }; drift(0);
    scene.add(g); SYS.add('life',()=>{ if(g.visible)drift(performance.now()/1000); },'159c-coatrack');
    SOL.up.push([x-.3*T,z-.3*T,x+.3*T,z+.3*T]); FIX.up.push([x-.3*T,z-.3*T,y,x+.3*T,z+.3*T,y+1.95*T]);
    const hb=new THREE.Mesh(new THREE.BoxGeometry(.9*T,2*T,.9*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(x,y+T,z); scene.add(hb);
    UI.thing({name:'THE BEAR MERCHANT\'S COAT RACK',obj:hb,reach:1.6*T,near:3*T,tall:2*T,act:()=>{ const N=GLBTOONS.coatbear; if(N&&SHOPS.open)SHOPS.open(N); else if(FORAGE.say)FORAGE.say('THE BEAR IS NOT HERE YET.','#c8a090'); }});
    RACK.g=g; RACK.at={x,z}; } }
window.RACK=RACK;
