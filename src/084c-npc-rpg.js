// THE RPG TOWNSFOLK: six Quaternius classes (warrior, cleric, monk, ranger, rogue, wizard) walking the street, rigged and animated with their own Walk/Idle clips.
import {THREE} from './003-shx.js';
import {SKIN} from './003a-skin.js';
import {makeNPC} from './076-npc-map.js';
import {PARTSNPC} from './080-npc-parts.js';
const RPGNPC={list:[]}; window.RPGNPC=RPGNPC;
{ const DATA=__LAZY__("data/rpgchars.json");
  const geomOf=M=>SKIN.geom(M), rigOf=R=>SKIN.rig(R), clipsOf=D=>SKIN.clips(D.clips,D.rig.names);
  const KIND={
    warrior:{name:'THE WARRIOR',metres:1.85,radius:.3,speed:.4,pace:2.2,at:60},
    cleric:{name:'THE CLERIC',metres:1.8,radius:.3,speed:.36,pace:2.2,at:64},
    monk:{name:'THE MONK',metres:1.75,radius:.28,speed:.44,pace:2.2,at:68},
    ranger:{name:'THE RANGER',metres:1.8,radius:.28,speed:.46,pace:2.2,at:74},
    rogue:{name:'THE ROGUE',metres:1.7,radius:.26,speed:.48,pace:2.2,at:82},
    wizard:{name:'THE WIZARD',metres:1.85,radius:.3,speed:.34,pace:2.2,at:86} };
  const make=(key,D)=>{ '@later'; const K=KIND[key], rig=rigOf(D.rig), CL=clipsOf(D), mixer=new THREE.AnimationMixer(rig.bones[0]), A={}, act=n=>A[n]||(A[n]=mixer.clipAction(CL[n])); let cur=null;
    const N=makeNPC(null,Object.assign({key,name:K.name,names:D.mesh.parts,geo:geomOf(D.mesh),skin:rig,tall:D.tall,rank:D.mesh.parts.map(()=>0),metres:K.metres,radius:K.radius,speed:K.speed,stride:0,rock:0,bob:0,
      anim:(dt,moving,st,sc)=>{ const want=moving&&CL.Walk?'Walk':CL.Idle?'Idle':null; if(want&&want!==cur){ const a=act(want); a.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.2).play(); if(cur)act(cur).fadeOut(.2); cur=want; }
        if(cur)act(cur).timeScale=moving?Math.max(.6,st.v/(K.pace*sc)):1; mixer.update(dt); }},PARTSNPC.street(K.at,-70)));
    N.g.rotation.order='YXZ'; N.me.rotation.y=0; N.me.position.set(0,0,0); N.mixer=mixer; RPGNPC.list.push(N); RPGNPC[key]=N; return N; };
  RPGNPC.load=()=>RPGNPC.wait||(RPGNPC.wait=DATA().then(J=>{ for(const k in KIND)if(J[k])make(k,J[k]); return RPGNPC.list; }));
  const go=()=>window.__started?RPGNPC.load().catch(e=>console.warn('RPGNPC',e)):setTimeout(go,600); go(); }
