// THE HABITS' LOOKS: what a townsperson doing their own thing (src/158-lives.js) holds and how they stand: a rod over the river with its line in the water, a net swept through the air, a run for the joggers, sat down to read, a bow at the shrine; held in the hand as another player's tool is (src/146a-wield.js).
import {THREE} from './003-shx.js';
import {pos, WIELD} from './003b-systems.js';
import {scene} from './004-main.js';
import {SYS, TILE} from './006-map-pre.js';
import {JOBS} from './159-jobs.js';
const HABITS={on:new Map()}; window.HABITS=HABITS;
{ const V3=THREE.Vector3, T=TILE, UP=new V3(0,1,0), G=new THREE.Matrix4(), b=new V3(), e=new V3(), w=new V3(), x=new V3(), z=new V3(), tip=new V3();
  const LOOK={fish:{hold:'rod',aim:t=>[0,.55+.03*Math.sin(t*.7),1],line:1},bfly:{hold:'net',aim:t=>[Math.sin(t*2.2)*.9,.15+.35*Math.sin(t*1.6),1]},
    jog:{run:1},read:{sit:1},pray:{aim:t=>[0,-.6,1]}};
  const lineMat=new THREE.LineBasicMaterial({color:0xd8d8d0,transparent:true,opacity:.7});
  const drop=N=>{ const h=HABITS.on.get(N); if(!h)return; if(h.m){ h.m.removeFromParent(); h.m.traverse(o=>{ if(o.geometry)o.geometry.dispose(); }); } if(h.ln){ h.ln.removeFromParent(); h.ln.geometry.dispose(); }
    const S=N.SR; if(S){ S.aim=null; S.sit=null; S.runTarget=0; } N.busy=false; HABITS.on.delete(N); };
  const take=(N,k)=>{ const L=LOOK[k], h={k}; if(L.hold&&WIELD.mk){ h.m=WIELD.mk(L.hold); h.m.matrixAutoUpdate=false; h.m.userData.anyRoom=true; scene.add(h.m); }
    if(L.line){ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(6),3)); h.ln=new THREE.Line(g,lineMat); h.ln.frustumCulled=false; scene.add(h.ln); }
    HABITS.on.set(N,h); return h; };
  // the hand: as a player's held tool, along the forearm from the palm
  const inHand=(N,h)=>{ const B=N.B, J=B&&B.J; if(!J||!J.palmR||!J.elbowR||!J.wristR)return false; N.g.updateMatrixWorld(true); G.copy(N.g.matrixWorld); const P=(p,q)=>q.set(p.x,p.y,p.z).applyMatrix4(G);
    P(J.elbowR,e); P(J.palmR,b); w.subVectors(P(J.wristR,w),e).normalize(); x.crossVectors(w,UP); if(x.lengthSq()<1e-4)x.set(1,0,0); x.normalize(); z.crossVectors(x,w);
    h.m.matrix.makeBasis(x,w,z).setPosition(b); h.m.matrixWorld.copy(h.m.matrix); return true; };
  let t=0;
  SYS.add('life',dt=>{ t+=dt||0;
    for(const J of JOBS.list){ const N=J.N, S=N.SR; if(!J.life||!S)continue; const k=J.state==='off'&&LOOK[J.kind]?J.kind:'', near=N.g.visible&&N.mode!=='hidden'&&Math.hypot(N.st.x-pos.x,N.st.z-pos.z)<40*T;
      let h=HABITS.on.get(N); if(h&&(h.k!==k||!near)){ drop(N); h=null; } if(!k||!near)continue; if(!h)h=take(N,k);
      const L=LOOK[k], still=!N.st.to; N.busy=true;
      S.runTarget=L.run&&!still?1:0; S.sit=L.sit&&still?{z:2}:null;
      if(L.aim){ const a=L.aim(t+(N.st.x%7)); S.aim={v:RIG.V(a[0],a[1],a[2]),w:1}; } else S.aim=null;
      if(h.m){ h.m.visible=inHand(N,h); if(h.ln){ h.ln.visible=h.m.visible&&still&&!!h.m.tipL; if(h.ln.visible){ tip.copy(h.m.tipL).applyMatrix4(h.m.matrix); const p=h.ln.geometry.attributes.position, f=N.st.hd;
        p.setXYZ(0,tip.x,tip.y,tip.z); p.setXYZ(1,N.st.x+Math.sin(f)*2.6*T,(N.st.y||0)-1.1*T,N.st.z+Math.cos(f)*2.6*T); p.needsUpdate=true; } } } }
    for(const N of [...HABITS.on.keys()])if(!JOBS.list.some(J=>J.N===N))drop(N); },'159a-habits');
  window.HABITSDBG=()=>[...HABITS.on].map(([N,h])=>({key:N.key,k:h.k,held:!!(h.m&&h.m.visible),line:!!(h.ln&&h.ln.visible),aim:!!(N.SR&&N.SR.aim),sit:!!(N.SR&&N.SR.sit),run:N.SR?N.SR.runTarget:0}));
}
