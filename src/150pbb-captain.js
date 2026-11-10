// THE AIRSHIP'S CAPTAIN (owner, 9 Nov 2026: "put a npc there who matches that would be inside it"; 10 Nov: a new character, an old-time aeronaut): a man in a flight cap and goggles, a full beard, a long brown coat and a cream scarf, tall boots and gloves, dressed from the avatar's wardrobe, standing at the front of the airship's gondola, facing where it flies.
import {THREE} from './003-shx.js';
import {SYS} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
import {AVATAR} from './111c-avatar.js';
import {TRAFFIC} from './150pb-traffic.js';
{ const LOOK={f:'m',b:1,h:104,skin:'c99a78',hair:'6b6a66',w:{}}, K='airship_captain';
  const piece=(slot,label,who)=>{ const p=(AVATAR.pieces||[]).find(q=>q.slot===slot&&q.label===label&&q.v===who); return p?p.n:null; };
  const dress=()=>{ const w={}, put=(slot,label,who,c='')=>{ const n=piece(slot,label,who); if(n!=null)w[slot]=[n,c]; };
    put('hat','FLIGHT CAP','AIRCREW PILOT'); put('eyes','GLASSES · AIRCREW PILOT','AIRCREW PILOT'); put('face','FULL BEARD','AIRCREW PILOT','8a8680');
    put('coat','LONG COAT','CITY COMMUTER','5c3a22'); put('neck','SCARF','COMMUTER','e6dcc4'); put('belt','BELT · AIRCREW PILOT','AIRCREW PILOT');
    put('bottom','TROUSERS · AIRCREW PILOT','AIRCREW PILOT','4a4238'); put('feet','TALL BOOTS · ENGINE DRIVER','ENGINE DRIVER','2e2218'); put('hands','WORK GLOVES · ASTRONAUT ENGINEER','ASTRONAUT ENGINEER','6b4a2c');
    CAP.slots=Object.keys(w); return {...LOOK,w}; };
  const CAP={N:null,P:{y:0},code:null,tries:0}; window.CAPTAIN=CAP;
  const V=new THREE.Vector3(), AT=new THREE.Vector3(0,.8,.42);   // where he stands in the gondola (the model's metres): its floor, forward of the middle
  SYS.add('life',dt=>{ const B=TRAFFIC.blimp, m=B&&B.m; if(!m||!AVATAR.pieces)return;
    if(!CAP.N){ if((CAP.tries-=dt||0)>0)return; CAP.tries=1; CAP.code=CAP.code||AVATAR.codeOf(dress()); const A=BODIES.by.avatar, b=A&&A.variant&&A.variant(CAP.code); if(!b)return;
      BODIES.add({...b,key:K,label:'THE AIRSHIP CAPTAIN',ground:()=>CAP.P.y}); const N=BODIES.by[K]&&BODIES.by[K].npc; if(!N)return; N.on=true; N.walk.auto=false; N.free=()=>true; N.st.pin=true; CAP.N=N; }
    const N=CAP.N, s=N.st, inner=m.children[0]||m, H=CAP.hold; if(H)V.set(H.x,H.y,H.z); else { inner.updateWorldMatrix(true,false); inner.localToWorld(V.copy(AT)); }   // (hold: a check stands him somewhere else)
    s.x=V.x; s.z=V.z; s.hd=H?H.hd:m.rotation.y; s.home={x:V.x,z:V.z,r:0}; s.to=s.next=null; CAP.P.y=V.y; N.g.visible=!!H||m.visible; },'150pbb-captain');
  CAP.dbg=()=>({made:!!CAP.N,slots:CAP.slots||[],code:CAP.code,at:CAP.N?[CAP.N.st.x,CAP.P.y,CAP.N.st.z].map(v=>+v.toFixed(1)):null,shown:!!(CAP.N&&CAP.N.g.visible)});
}
