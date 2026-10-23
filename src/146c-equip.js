// THE WORN LAYER: EQUIP wears gear by slot (body: armour, the cloud coat; head: the headlight; eyes: the goggles) and turns on its granted ability — guard softens blows, float lifts you, light lights the dark, sight sees through murk. It also draws body gear on the player: plate armour (the knight's faceted steel) or a coat of drifting clouds. Hand gear stays with WIELD; all read the shared item model (slot, grants).
import {THREE} from './003-shx.js';
import {EQUIP, FORAGE, ITEMS, VIT, W3} from './003b-systems.js';
import {OWNED} from './005-save.js';
Object.assign(EQUIP,{by:{},float:false,light:false,sight:false}); window.EQUIP=EQUIP; Object.defineProperty(EQUIP,'worn',{get:()=>EQUIP.by.body||null});
{ const say=FORAGE.say, prop=(id,k)=>window.ITEMS&&ITEMS.prop?ITEMS.prop(id,k):undefined, name=id=>(FORAGE.NM&&FORAGE.NM[id])||id, SLOTS=['body','head','eyes'];
  FORAGE.add({names:{armor:'ARMOUR',cloudcoat:'CLOUD COAT'},prices:{armor:40,cloudcoat:60}});
  // one grant -> one effect, resolved the same way for every worn item (a property is schema-wide, not special-cased per item)
  const ABIL={ guard:{on:()=>VIT.def=.5, off:()=>VIT.def=0}, float:{on:()=>EQUIP.float=true, off:()=>EQUIP.float=false}, light:{on:()=>EQUIP.light=true, off:()=>EQUIP.light=false}, sight:{on:()=>EQUIP.sight=true, off:()=>EQUIP.sight=false} };
  const save=()=>{ try{ OWNED.set('equip',JSON.stringify(EQUIP.by)); }catch(e){} };
  EQUIP.ability=id=>prop(id,'grants');
  EQUIP.off=(slot='body')=>{ const id=EQUIP.by[slot]; if(!id)return; const a=ABIL[EQUIP.ability(id)]; if(a)a.off(); delete EQUIP.by[slot]; };
  EQUIP.wear=(id,quiet)=>{ const slot=prop(id,'slot'); if(!SLOTS.includes(slot))return;
    if(EQUIP.by[slot]===id){ EQUIP.off(slot); save(); if(!quiet)say('YOU TAKE OFF THE '+name(id)+'.','#e8e2cc'); if(FORAGE.draw)FORAGE.draw(); return; }
    if(!FORAGE.has(id)){ if(!quiet)say('YOU HAVE NO '+name(id)+'.','#c8a090'); return; }
    EQUIP.off(slot); EQUIP.by[slot]=id; const a=ABIL[EQUIP.ability(id)]; if(a)a.on(); save(); if(!quiet)say('YOU WEAR THE '+name(id)+'.','#e8e2cc'); if(FORAGE.draw)FORAGE.draw(); };
  FORAGE.ROWB.push(id=>SLOTS.includes(prop(id,'slot'))?[[EQUIP.by[prop(id,'slot')]===id?'TAKE OFF':'WEAR','equip']]:[]);
  FORAGE.ACT.equip=id=>EQUIP.wear(id);
  try{ const W=JSON.parse(OWNED.get('equip')||'{}')||{}; for(const s in W)if(W[s]&&FORAGE.has(W[s]))EQUIP.wear(W[s],true); }catch(e){}   // what you wore stays on between visits

  // the body gear drawn on the player, built once the first time something is worn; a child of the Walker's group, posed each frame from the rig's joints (same local space WIELD uses).
  const V=THREE.Vector3, up=new V(), right=new V(), fwd=new V(), M=new THREE.Matrix4(); let worn=null;
  const build=()=>{ '@later'; const root=new THREE.Group(); root.name='worn';
    const steel=new THREE.MeshLambertMaterial({color:0x7d8187,flatShading:true}), steelD=new THREE.MeshLambertMaterial({color:0x4e5156,flatShading:true});
    const armour=new THREE.Group();
    const plate=new THREE.Mesh(new THREE.SphereGeometry(1,8,6,0,Math.PI*2,0,Math.PI*.62),steel); armour.add(plate);
    const paul=[]; for(const s of [1,-1]){ const p=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),steel); armour.add(p); paul.push(p); }
    const collar=new THREE.Mesh(new THREE.TorusGeometry(1,.3,5,10),steelD); collar.rotation.x=Math.PI/2; armour.add(collar);
    const coat=new THREE.Group(), puffs=[], cloud=new THREE.MeshLambertMaterial({color:0xf2f5ff,emissive:0x8ea2c8,transparent:true,opacity:.9,flatShading:true});
    for(let i=0;i<9;i++){ const p=new THREE.Mesh(new THREE.IcosahedronGeometry(1,0),cloud); p.userData.sd=Math.random()*9; coat.add(p); puffs.push(p); }
    root.add(armour,coat); worn={root,armour,coat,plate,paul,collar,puffs}; return worn; };

  EQUIP.post=B=>{ const g=W3.group, id=EQUIP.worn;
    if(!g||!B||!B.J||!id){ if(worn)worn.root.visible=false; return; }
    const grant=EQUIP.ability(id); if(grant!=='guard'&&grant!=='float'){ if(worn)worn.root.visible=false; return; }
    if(!worn)build(); if(worn.root.parent!==g)g.add(worn.root);
    worn.root.visible=true; worn.armour.visible=grant==='guard'; worn.coat.visible=grant==='float';
    const J=B.J, sl=J.shoulderL, sr=J.shoulderR, ch=J.chest, nk=J.neck, pv=J.pelvis;
    up.set(nk.x-pv.x,nk.y-pv.y,nk.z-pv.z).normalize();
    right.set(sl.x-sr.x,sl.y-sr.y,sl.z-sr.z); const w=right.length()||6; right.normalize();
    fwd.crossVectors(right,up).normalize(); up.crossVectors(fwd,right).normalize();
    M.makeBasis(right,up,fwd);
    if(grant==='guard'){ worn.root.position.set(ch.x,ch.y,ch.z); worn.root.quaternion.setFromRotationMatrix(M); const s=w*.5;
      worn.plate.scale.set(s*1.05,s*1.35,s*.62); worn.plate.position.set(0,-s*.15,s*.18);
      for(let i=0;i<2;i++){ const sgn=i?-1:1; worn.paul[i].position.set(sgn*w*.52,w*.12,0); worn.paul[i].scale.set(s*.5,s*.42,s*.5); }
      worn.collar.position.set(0,s*.62,0); worn.collar.scale.setScalar(s*.42); }
    else { worn.root.position.set(nk.x,nk.y,nk.z); worn.root.quaternion.setFromRotationMatrix(M);
      const t=performance.now()/1000;
      for(let k=0;k<worn.puffs.length;k++){ const p=worn.puffs[k], sd=p.userData.sd, a=k/worn.puffs.length*Math.PI*2, rad=w*(.55+.12*Math.sin(t*.5+sd));
        p.position.set(Math.cos(a)*rad, -w*.2-(k%3)*w*.34+Math.sin(t*.8+sd)*w*.08, -w*.28+Math.sin(a)*rad*.5+Math.sin(t*.6+sd)*w*.06);
        p.scale.setScalar(w*(.42+.12*Math.sin(t*.9+sd*1.3))); } } };
}
