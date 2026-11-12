// THE FISHING BOAT'S CREW (owner, 12 Nov 2026: "real crew ... real npc humans from polyfork but make them fuzzy and purple skin"): four people dressed from the avatar's wardrobe as fishermen, purple-skinned, with fuzzy purple hair and beards, standing about the moored boat's deck and riding the waves with it.
import {THREE} from './003-shx.js';
import {SYS} from './006-map-pre.js';
import {BODIES} from './111a-bodies.js';
import {AVATAR} from './111c-avatar.js';
{ const SKIN='8a4fc8', FUZZ='b98aec', F='FISHERMAN IN WADERS', H='HANGA ROA FISHERMAN', A='LAKE ANGLER';
  // [name, figure, height, where on the deck (along, across: -1..1), facing, what they wear: slot, label, whose, colour]
  const WHO=[['THE SKIPPER','m',106,-.05,.0,.4,[['hair','AFRO','CAGE CASHIER',FUZZ],['face','FULL BEARD','AIRCREW PILOT',FUZZ],['hat','CAP · '+H,H],['coat','COAT · '+F,F],['top','WORKSHIRT',F],['bottom','WADERS',F],['feet','TALL BOOTS · '+F,F]]],
    ['THE DECKHAND','m',100,.5,-.45,2.2,[['hair','AFRO','CAGE CASHIER',FUZZ],['face','FULL BEARD','AIRCREW PILOT',FUZZ],['hat','BEANIE · '+F,F],['top','WORKSHIRT',F],['bottom','WADERS',F],['feet','TALL BOOTS · '+F,F],['righthand','FISHING ROD',F]]],
    ['THE NET HAND','f',96,.3,.5,-1.9,[['hair','AFRO','CAGE CASHIER',FUZZ],['top','SHIRT · '+H,H],['bottom','TROUSERS · '+H,H],['feet','TALL BOOTS · '+A,A],['righthand','HANDLINE REEL',H]]],
    ['THE OLD HAND','m',98,-.6,.3,-.7,[['hair','AFRO','CAGE CASHIER',FUZZ],['face','MOUSTACHE · '+A,A,FUZZ],['hat','BRIM HAT · '+A,A],['top','SHIRT · '+A,A],['coat','WAISTCOAT · '+A,A],['bottom','TROUSERS · '+A,A],['feet','TALL BOOTS · '+A,A]]]];
  const piece=(slot,label,who)=>{ const p=(AVATAR.pieces||[]).find(q=>q.slot===slot&&q.label===label&&q.v===who); return p?p.n:null; };
  const CREW={N:[],tries:0}; window.BOATCREW=CREW; const V=new THREE.Vector3();
  SYS.add('life',dt=>{ const B=window.MOORED; if(!B||!B.deck||!AVATAR.pieces)return;
    if(CREW.N.length<WHO.length){ if((CREW.tries-=dt||0)>0)return; CREW.tries=1; const Av=BODIES.by.avatar; if(!Av||!Av.variant)return;
      for(let i=CREW.N.length;i<WHO.length;i++){ const [name,f,h,,,,wear]=WHO[i], w={}; for(const [slot,label,who,c] of wear){ const n=piece(slot,label,who); if(n!=null)w[slot]=[n,c||'']; }
        const b=Av.variant(AVATAR.codeOf({f,b:1,h,skin:SKIN,hair:FUZZ,w})); if(!b)return; const K='boat_crew_'+i, P={y:0}; BODIES.add({...b,key:K,label:name,ground:()=>P.y}); const N=BODIES.by[K]&&BODIES.by[K].npc; if(!N)return;
        N.on=true; N.walk.auto=false; N.free=()=>true; N.st.pin=true; CREW.N.push({N,P,slots:Object.keys(w)}); } }
    const on=B.on(); CREW.N.forEach((c,i)=>{ const s=c.N.st, W=WHO[i]; B.deck(W[3],W[4],V); s.x=V.x; s.z=V.z; s.hd=B.g.rotation.y+W[5]; s.home={x:V.x,z:V.z,r:0}; s.to=s.next=null; c.P.y=V.y; c.N.g.visible=on; }); },'150pbc-boatcrew');
  CREW.dbg=()=>({made:CREW.N.length,slots:CREW.N.map(c=>c.slots.length),at:CREW.N.map(c=>[c.N.st.x,c.P.y,c.N.st.z].map(v=>+v.toFixed(1))),shown:CREW.N.filter(c=>c.N.g.visible).length});
}
