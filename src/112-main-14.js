// THE POSES: POSES and castPose, the arm poses and arm reaching used by the players.
import {CAST} from './106-game-play-3-guitar-1-body.js';

const POSES={}, CV=RIG.V; function castStep(){}
function armIK(P,n,T){ const {V,sub,add,mul,len,nrm,cross,dot}=RIG, s=n=='L'?1:-1, U=7.4, F=6.3, S=V(s*6.8,13.3,0), d0=sub(T,add(S,V(0,RIG.STAND,0)));
  let L=Math.min(U+F-.05,Math.max(Math.abs(U-F)+.5,len(d0))); const u=nrm(d0), a=(U*U-F*F+L*L)/(2*L), h=Math.sqrt(Math.max(0,U*U-a*a));
  let pole=V(s*.45,-1,-.35); pole=nrm(sub(pole,mul(u,dot(pole,u)))); const E=add(mul(u,a),mul(pole,h)), Wr=mul(u,L), fa=nrm(sub(Wr,E)), ua=nrm(E);
  const ang=v=>[Math.atan2(v.z,-v.y),Math.asin(Math.max(-1,Math.min(1,s*v.x)))]; P[n].ua=ang(ua); P[n].fa=ang(fa); }
const POSEC=new Map();
function castPose(name){ let P=POSEC.get(name); if(P)return P; const k=POSES[name]||{}, {hands,...c}=k; P=RIG.apply(castStand(),c);
  if(hands)for(const n in hands){ const T=hands[n], r=P.root; armIK(P,n,CV(T[0]-r.x,T[1]-(r.y-RIG.STAND),T[2]-r.z)); }
  P.hands=!!hands||!!(k.L&&k.L.ua)||!!(k.R&&k.R.ua); POSEC.set(name,P); return P; }
let CASTSTAND=null; const castStand=()=>CASTSTAND||(CASTSTAND=RIG.apply(RIG.walkPose({ph:0,w:0,run:0},null),RIG.STANDK));
CAST.pose=castPose; CAST.step=castStep;
export {castPose, POSES};
