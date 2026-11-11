// THE BACK (owner, 11 Nov 2026: "you should be able to put instruments on your back (not piano)"): what is slung in your BACK slot (EQUIP: an instrument you carry, a blade, a rod, a long gun) drawn on your back, and on other players' (theirs from their word, 'bk'); the guitar as it hangs after you play it, anything else laid corner to shoulder along its longest side, its flattest side against you.
import {THREE} from './003-shx.js';
import {EQUIP, INSTR, ONLINE, W3, WIELD} from './003b-systems.js';
import {SYS} from './006-map-pre.js';
import {GHOLD} from './146zoa-guitar-hold.js';
const BACK={}; window.BACK=BACK;
{ const V3=THREE.Vector3, M4=THREE.Matrix4, B3=new THREE.Box3();
  // its model, and where it sits in the body's rest space (carried by the chest bone)
  const make=id=>{ if(id==='guitar'&&GHOLD.model){ const gm=GHOLD.model(); gm.name='guitar'; return {gm,M:GHOLD.GBK}; }
    let m=null; const K=INSTR.KINDS&&INSTR.KINDS[id];
    if(K&&K.model){ const g=K.model(), it=g.userData.it; if(!it)return null; it.position.set(0,0,0); it.quaternion.identity(); m=it; }
    else if(WIELD.mk&&(WIELD.LIST||[]).includes(id))m=WIELD.mk(id);
    if(!m)return null; const gm=new THREE.Group(); gm.name='back'; gm.add(m); gm.updateMatrixWorld(true); B3.setFromObject(m); if(B3.isEmpty())return null;
    const sz=B3.getSize(new V3()), c=B3.getCenter(new V3()), o=[0,1,2].sort((a,b)=>sz.getComponent(b)-sz.getComponent(a)), col=[];
    col[o[0]]=new V3(.38,.92,0).normalize(); col[o[2]]=new V3(0,0,-1); col[o[1]]=new V3().crossVectors(col[(o[1]+1)%3],col[(o[1]+2)%3]);   // longest up over the left shoulder, flattest out from your back (a right-handed turn)
    const R=new M4().makeBasis(col[0],col[1],col[2]), p=c.clone().applyMatrix4(R), at=new V3(-.03,1.12,-.13-sz.getComponent(o[2])/2-.01); R.setPosition(at.sub(p)); return {gm,M:R}; };
  BACK.can=id=>!!id&&EQUIP.fits(id,'back')&&(id==='guitar'||!!(INSTR.KINDS&&INSTR.KINDS[id])||(WIELD.LIST||[]).includes(id));
  const put=(S,id,me,PM)=>{ if(S.id===id&&S.me===me&&S.gm&&S.gm.parent===me){ S.gm.matrix.multiplyMatrices(PM.value[1],S.M); S.gm.matrixWorldNeedsUpdate=true; return; }
    off(S); if(!id||!me||!PM)return; const r=make(id); if(!r)return; S.id=id; S.me=me; S.gm=r.gm; S.M=r.M; S.gm.matrixAutoUpdate=false; me.add(S.gm); put(S,id,me,PM); };
  const off=S=>{ if(S.gm&&S.gm.parent)S.gm.parent.remove(S.gm); S.gm=null; S.id=null; S.me=null; };
  const MINE={}, THEM=new Map(); BACK.MINE=MINE; BACK.THEM=THEM;
  const myMesh=()=>W3.group.children.find(m=>m.userData&&m.userData.hands&&m.userData.PM);
  const mine=()=>{ const id=EQUIP.by.back; return BACK.can(id)?id:null; };
  ONLINE.mine.bk=mine;
  SYS.add('dress',()=>{ const me=myMesh(); put(MINE,mine(),me,me&&me.userData.PM);
    for(const [k,S] of THEM){ const o=ONLINE.others.get(k); if(!o||!o.x||!o.x.bk){ off(S); THEM.delete(k); } }
    for(const o of ONLINE.others.values()){ const id=o.x&&o.x.bk; if(!o.id||!id||!BACK.can(id))continue; let S=THEM.get(o.id); if(!S)THEM.set(o.id,S={}); const F=o.fig; if(F&&F.body)put(S,id,F.me,F.PM); else off(S); } },'146zpe-back'); }
