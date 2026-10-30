// THE SPARRING DUMMY: a straw dummy on a post beside the Swordsmith; double-click it to spar — with a blade in hand it teaches SWORDSMANSHIP, bare-handed MARTIAL ARTS — but only the basics (to 40), and each bout tires you.
import {THREE} from './003-shx.js';
import {FORAGE, ITEMS, NPCS, SFX, UI, VIT, WIELD} from './003b-systems.js';
import {scene} from './004-main.js';
import {SOL, TILE} from './006-map-pre.js';
const DUMMY={}; window.DUMMY=DUMMY;
{ const T=TILE, CAP=40, say=(t,c)=>FORAGE.say&&FORAGE.say(t,c||'#e8e2cc');
  const make=()=>{ const G=new THREE.Group(), std=c=>new THREE.MeshStandardMaterial({color:c,roughness:.9}), add=(geo,m,x,y,z)=>{ const o=new THREE.Mesh(geo,m); o.position.set(x,y,z); o.castShadow=o.receiveShadow=true; G.add(o); return o; };
    add(new THREE.CylinderGeometry(.05,.06,1.6,8),std(0x5a4434),0,.8,0); add(new THREE.CylinderGeometry(.2,.17,.6,12),std(0xd8c078),0,1.2,0); add(new THREE.SphereGeometry(.14,12,10),std(0xd8c078),0,1.66,0);
    const arm=add(new THREE.CylinderGeometry(.04,.04,.8,8),std(0x5a4434),0,1.35,0); arm.rotation.z=Math.PI/2; add(new THREE.BoxGeometry(.32,.06,.32),std(0x4a3a2a),0,.03,0); G.scale.setScalar(T/1.19); return G; };
  DUMMY.spar=()=>{ const blade=!!(WIELD.on&&window.ITEMS&&+ITEMS.prop(WIELD.on,'damage')>0), k=blade?'sword':'fight', nm=blade?'SWORDSMANSHIP':'MARTIAL ARTS';
    if(VIT.sta<.15)return say('YOU ARE TOO TIRED TO SPAR. CATCH YOUR BREATH.','#c8a090'); VIT.sta=Math.max(0,VIT.sta-.12); SFX.play('clunk',{vol:.4,pitch:blade?1.3:.8});
    if(FORAGE.sk(k)>=CAP)return say(`THE DUMMY HAS NOTHING MORE TO TEACH YOU IN ${nm}. FIND A REAL FOE, OR A MASTER.`,'#c8a090');
    FORAGE.use(k,-10,CAP+10); say(blade?'YOU CUT AT THE DUMMY. STRAW FLIES.':'YOU STRIKE THE DUMMY. IT ROCKS ON ITS POST.','#e8e2cc'); DUMMY.last=k; };
  const go=()=>{ const N=NPCS.extra.find(q=>q.key==='mrblocks'); if(!window.__started||!N||!N.st)return setTimeout(go,900); const P=N.g&&N.g.parent||scene; const G=make(), hd=N.st.hd||0;
    G.position.set(N.st.x+Math.cos(hd)*1.6*T,N.st.y||0,N.st.z-Math.sin(hd)*1.6*T); P.add(G); DUMMY.g=G;
    const hb=new THREE.Mesh(new THREE.BoxGeometry(.8*T,1.8*T,.8*T),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(G.position.x,G.position.y+.9*T,G.position.z); P.add(hb);
    UI.thing({name:'A SPARRING DUMMY',obj:hb,reach:1.8*T,near:2.6*T,tall:1.8*T,act:()=>DUMMY.spar()}); const x=G.position.x, z=G.position.z; SOL.up.push([x-.2*T,z-.2*T,x+.2*T,z+.2*T]); };
  go();
}
