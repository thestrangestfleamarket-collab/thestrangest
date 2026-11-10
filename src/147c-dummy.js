// THE SPARRING DUMMY: a straw dummy on a post on the park lawn by the Squirrel's Tower; double-click it to spar — with a blade in hand it teaches SWORDSMANSHIP, bare-handed MARTIAL ARTS — but only the basics (to 40), and each bout tires you.
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, ITEMS, SFX, UI, VIT, WIELD} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {scene} from './004-main.js';
import {LEVEL, SOL, SYS, TILE} from './006-map-pre.js';
const DUMMY={}; window.DUMMY=DUMMY;
{ const T=TILE, CAP=40, say=(t,c)=>SAY(t,c||'#e8e2cc');
  const make=()=>{ '@later'; const G=new THREE.Group(), std=c=>new THREE.MeshStandardMaterial({color:c,roughness:.9}), add=(geo,m,x,y,z)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); o.castShadow=o.receiveShadow=true; G.add(o); return o; };
    add(new THREE.CylinderGeometry(.05,.06,1.6,8),std(0x5a4434),0,.8,0); add(new THREE.CylinderGeometry(.2,.17,.6,12),std(0xd8c078),0,1.2,0); add(new THREE.SphereGeometry(.14,12,10),std(0xd8c078),0,1.66,0);
    const arm=add(new THREE.CylinderGeometry(.04,.04,.8,8),std(0x5a4434),0,1.35,0); arm.rotation.z=Math.PI/2; add(new THREE.BoxGeometry(.32,.06,.32),std(0x4a3a2a),0,.03,0); G.scale.setScalar(T/1.19); return G; };
  DUMMY.spar=()=>{ '@later'; const blade=!!(WIELD.on&&ITEMS&&+ITEMS.prop(WIELD.on,'damage')>0), k=blade?'sword':'fight', nm=blade?'SWORDSMANSHIP':'MARTIAL ARTS';
    if(VIT.sta<.15)return say('YOU ARE TOO TIRED TO SPAR. CATCH YOUR BREATH.','#c8a090'); VIT.sta=Math.max(0,VIT.sta-.12); SFX.play('clunk',{vol:.4,pitch:blade?1.3:.8});
    if(FORAGE.sk(k)>=CAP)return say(`THE DUMMY HAS NOTHING MORE TO TEACH YOU IN ${nm}. FIND A REAL FOE, OR A MASTER.`,'#c8a090');
    FORAGE.use(k,-10,CAP+10); say(blade?'YOU CUT AT THE DUMMY. STRAW FLIES.':'YOU STRIKE THE DUMMY. IT ROCKS ON ITS POST.','#e8e2cc'); DUMMY.last=k; };
  // it stands on the lawn by the Squirrel's Tower, where the Squirrel Knight teaches MARTIAL ARTS (the Stump it stood by is archived, 7 Nov 2026)
  const at=()=>{ const H=LEVEL.homes&&LEVEL.homes.squirrel; if(!H||!SHARED.BOD||!SHARED.BOD.XS)return setTimeout(at,1000); const P=scene, G=make(), x=SHARED.BOD.XS(H[0]+6), z=SHARED.BOD.ZS(H[1]+2);
    G.position.set(x,SHARED.groundY?SHARED.groundY(x,z):0,z); P.add(G); DUMMY.g=G;
    const hb=new THREE.Mesh(new THREE.BoxGeometry(.8*T,1.8*T,.8*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(G.position.x,G.position.y+.9*T,G.position.z); P.add(hb);
    UI.thing({name:'A SPARRING DUMMY',obj:hb,reach:1.8*T,near:2.6*T,tall:1.8*T,act:()=>DUMMY.spar()}); SOL.up.push([x-.2*T,z-.2*T,x+.2*T,z+.2*T]); }; SYS.onStart(()=>LOAD('later').then(at),'147c-dummy');
}
