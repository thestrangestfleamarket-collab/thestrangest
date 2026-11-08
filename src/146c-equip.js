// THE WORN LAYER: EQUIP wears gear by slot (body: armour, the cloud coat; head: the headlight; eyes: the goggles) and turns on its granted ability — guard softens blows, float lifts you, light lights the dark, sight sees through murk, night sees in the dark. It also draws body gear on the player: plate armour (the knight's faceted steel) or a coat of drifting clouds. Hand gear stays with WIELD; all read the shared item model (slot, grants).
import {SHARED, THREE} from './003-shx.js';
import {EQUIP, FLOW, FORAGE, ITEMS, LOOKS, VIT, W3} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {OWNED} from './005-save.js';
import {GARB} from './072b-garb.js';
Object.assign(EQUIP,{fit:[1.3,1.55,1.1,-.2,.04],by:{},float:false,light:false,sight:false,breathe:false,night:false}); window.EQUIP=EQUIP; Object.defineProperty(EQUIP,'worn',{get:()=>EQUIP.by.body||null});
{ const say=SAY, prop=(id,k)=>window.ITEMS&&ITEMS.prop?ITEMS.prop(id,k):undefined, name=id=>(FORAGE.NM&&FORAGE.NM[id])||id, SLOTS=['body','legs','head','eyes','back'];
  FORAGE.add({names:{armor:'ARMOUR',cloudcoat:'CLOUD COAT'},prices:{armor:40,cloudcoat:60}});
  // one grant -> one effect, resolved the same way for every worn item (a property is schema-wide, not special-cased per item)
  const ABIL={ guard:{on:()=>VIT.def=.5, off:()=>VIT.def=0}, float:{on:()=>EQUIP.float=true, off:()=>EQUIP.float=false}, light:{on:()=>EQUIP.light=true, off:()=>EQUIP.light=false}, sight:{on:()=>EQUIP.sight=true, off:()=>EQUIP.sight=false}, breathe:{on:()=>EQUIP.breathe=true, off:()=>EQUIP.breathe=false}, night:{on:()=>EQUIP.night=true, off:()=>EQUIP.night=false} };
  const save=()=>{ try{ OWNED.set('equip',JSON.stringify(EQUIP.by)); }catch(e){} };
  EQUIP.ability=id=>prop(id,'grants');
  EQUIP.off=(slot='body')=>{ const id=EQUIP.by[slot]; if(!id)return; const a=ABIL[EQUIP.ability(id)]; if(a)a.off(); delete EQUIP.by[slot]; dye(); };
  // a worn item with a colour dyes what it covers: body your shirt, legs your trousers (the same for another player's figure, from their look)
  EQUIP.colours=by=>{ const c=s=>{ const id=by[s], v=id&&prop(id,'color'); return v&&v!=='none'?v:null; }; return {shirt:c('body'),pants:c('legs')}; };
  // what you wear, for your look code: the item in each slot, in slot order; and back
  EQUIP.code=()=>{ const c=SLOTS.map(s=>EQUIP.by[s]||'').join('~'); return /[^~]/.test(c)?c:''; };
  EQUIP.decode=c=>{ const by={}; String(c||'').split('~').forEach((id,i)=>{ if(id&&SLOTS[i]&&ITEMS.defs&&ITEMS.defs[id]&&prop(id,'slot')===SLOTS[i])by[SLOTS[i]]=id; }); return by; };
  const dye=()=>{ if(!LOOKS.dye)return; const {shirt:sh,pants:pa}=EQUIP.colours(EQUIP.by); if(LOOKS.over.shirt===(sh||undefined)&&LOOKS.over.pants===(pa||undefined))return; LOOKS.over.shirt=sh||undefined; LOOKS.over.pants=pa||undefined; LOOKS.dye(); };
  EQUIP.wear=(id,quiet)=>{ '@later'; const slot=prop(id,'slot'); if(!SLOTS.includes(slot))return;
    if(EQUIP.by[slot]===id){ EQUIP.off(slot); save(); if(!quiet)say('YOU TAKE OFF THE '+name(id)+'.','#e8e2cc'); if(FORAGE.draw)FORAGE.draw(); return; }
    if(!FORAGE.has(id)){ if(!quiet)say('YOU HAVE NO '+name(id)+'.','#c8a090'); return; }
    EQUIP.off(slot); EQUIP.by[slot]=id; const a=ABIL[EQUIP.ability(id)]; if(a)a.on(); dye(); save(); if(!quiet)say('YOU WEAR THE '+name(id)+'.','#e8e2cc'); if(FORAGE.draw)FORAGE.draw(); };
  FORAGE.ROWB.push(id=>SLOTS.includes(prop(id,'slot'))?[[EQUIP.by[prop(id,'slot')]===id?'TAKE OFF':'WEAR','equip']]:[]);
  FORAGE.ACT.equip=id=>EQUIP.wear(id);
  try{ const W=JSON.parse(OWNED.get('equip')||'{}')||{}; for(const s in W)if(W[s]&&FORAGE.has(W[s]))EQUIP.wear(W[s],true); }catch(e){}   // what you wore stays on between visits

  // the body gear drawn on a figure (yours, or another player's from what their look says they wear), built once the first time something is worn; a child of the figure's group, posed each frame from the rig's joints (same local space WIELD uses). H keeps one figure's pieces.
  const V=THREE.Vector3, up=new V(), right=new V(), fwd=new V(), M=new THREE.Matrix4();
  const build=H=>{ '@later'; const root=new THREE.Group(); root.name='worn';
    const steel=new THREE.MeshLambertMaterial({color:0x7d8187,flatShading:true}), steelD=new THREE.MeshLambertMaterial({color:0x4e5156,flatShading:true});
    const armour=new THREE.Group();
    const plate=new THREE.Mesh(new THREE.CylinderGeometry(1,.86,1,10,2,true),new THREE.MeshLambertMaterial({color:0xaeb3bb,flatShading:true,side:THREE.DoubleSide})); armour.add(plate);   // a cuirass round the chest and back, wide enough to sit outside any body
    const paul=[]; for(const s of [1,-1]){ const p=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),steel); armour.add(p); paul.push(p); }
    const collar=new THREE.Mesh(new THREE.TorusGeometry(1,.3,5,10),steelD); collar.rotation.x=Math.PI/2; armour.add(collar);
    const coat=new THREE.Group(), puffs=[], cloud=new THREE.MeshLambertMaterial({color:0xf2f5ff,emissive:0x8ea2c8,transparent:true,opacity:.9,flatShading:true});
    for(let i=0;i<9;i++){ const p=new THREE.Mesh(new THREE.IcosahedronGeometry(1,0),cloud); p.userData.sd=Math.random()*9; coat.add(p); puffs.push(p); }
    root.add(armour,coat); return H.worn={root,armour,coat,plate,paul,collar,puffs}; };

  // the scuba set on the back: a yellow tank and its valve
  const back=(g,B,on,H)=>{ const J=B&&B.J; let tank=H.tank; if(!g||!J||!on||g.visible===false){ if(tank)tank.visible=false; return; }
    if(!tank){ tank=H.tank=new THREE.Group(); tank.name='tank'; const c=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,10),new THREE.MeshLambertMaterial({color:0xd8a818})), v=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.35,6),new THREE.MeshLambertMaterial({color:0x26282c})); v.position.y=.66; tank.add(c,v); }
    if(tank.parent!==g)g.add(tank); tank.visible=true; const sl=J.shoulderL, sr=J.shoulderR, ch=J.chest, nk=J.neck, pv=J.pelvis;
    up.set(nk.x-pv.x,nk.y-pv.y,nk.z-pv.z).normalize(); right.set(sl.x-sr.x,sl.y-sr.y,sl.z-sr.z); const w=right.length()||6; right.normalize(); fwd.crossVectors(right,up).normalize(); up.crossVectors(fwd,right).normalize(); M.makeBasis(right,up,fwd);
    tank.position.set(ch.x,ch.y,ch.z).addScaledVector(fwd,-w*.42).addScaledVector(up,-w*.25); tank.quaternion.setFromRotationMatrix(M); tank.scale.set(w*.17,w*1.05,w*.17); };
  // worn on the eyes: night-vision goggles (two tubes on a head strap, their lenses glowing green), or, for anything with a colour, a pair of shades with lenses that colour
  const hu=new V(), hr=new V(), hf=new V(), HM=new THREE.Matrix4();
  const EYES={
    nv:()=>{ '@later'; const G=new THREE.Group(), dark=new THREE.MeshStandardMaterial({color:0x1e2220,roughness:.5,metalness:.4}), strap=new THREE.MeshStandardMaterial({color:0x141416,roughness:.8}), glow=new THREE.MeshStandardMaterial({color:0x2a5a30,emissive:0x3aff6a,emissiveIntensity:.7,roughness:.1});
      G.add(new THREE.Mesh(new THREE.BoxGeometry(.78,.26,.2),dark));
      for(const s of [1,-1]){ const t=new THREE.Mesh(new THREE.CylinderGeometry(.15,.18,.38,18),dark); t.rotation.x=Math.PI/2; t.position.set(.2*s,.01,.22); G.add(t);
        const r=new THREE.Mesh(new THREE.TorusGeometry(.15,.025,8,20),dark); r.position.set(.2*s,.01,.41); G.add(r); const l=new THREE.Mesh(new THREE.CircleGeometry(.13,20),glow); l.position.set(.2*s,.01,.415); G.add(l); }
      const band=new THREE.Mesh(new THREE.TorusGeometry(.56,.045,8,32),strap); band.rotation.x=Math.PI/2; band.position.set(0,.02,-.6); band.scale.set(1.02,1.05,1); G.add(band);
      const top=new THREE.Mesh(new THREE.TorusGeometry(.56,.04,8,24,Math.PI),strap); top.rotation.y=Math.PI/2; top.position.set(0,.06,-.6); G.add(top); return G; },
    shades:c=>{ '@later'; const G=new THREE.Group(), lens=new THREE.MeshStandardMaterial({color:c,roughness:.08,metalness:.5}), band=new THREE.MeshStandardMaterial({color:0x141416,roughness:.4,metalness:.3});
      for(const s of [1,-1]){ const l=new THREE.Mesh(new THREE.CylinderGeometry(.21,.21,.05,20),lens); l.rotation.x=Math.PI/2; l.position.set(.25*s,0,0); G.add(l); const r=new THREE.Mesh(new THREE.TorusGeometry(.21,.03,8,20),band); r.position.set(.25*s,0,.01); G.add(r);
        const arm=new THREE.Mesh(new THREE.BoxGeometry(.04,.05,.62),band); arm.position.set(.62*s,.02,-.32); G.add(arm); } const br=new THREE.Mesh(new THREE.BoxGeometry(.08,.04,.04),band); br.position.set(0,.06,.01); G.add(br); G.userData.lens=lens; return G; }};
  // worn on the head and granting light: a headlamp on the forehead, its lens glowing when the light is on (underground or underwater)
  EYES.lamp=()=>{ '@later'; const G=new THREE.Group(), strap=new THREE.MeshStandardMaterial({color:0x2a2a2e,roughness:.8}), body=new THREE.MeshStandardMaterial({color:0xd8d8d0,roughness:.4,metalness:.3}), lens=new THREE.MeshStandardMaterial({color:0xfff2c0,emissive:0xfff0d0,emissiveIntensity:.2,roughness:.1});
    const band=new THREE.Mesh(new THREE.TorusGeometry(.56,.05,8,32),strap); band.rotation.x=Math.PI/2; band.position.set(0,0,-.6); G.add(band);
    const b=new THREE.Mesh(new THREE.BoxGeometry(.3,.22,.14),body); b.position.set(0,0,.02); G.add(b); const l=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.04,20),lens); l.rotation.x=Math.PI/2; l.position.set(0,0,.1); G.add(l); G.userData.lamp=lens; return G; };
  EQUIP.lampOn=()=>SHARED.LVL==='down'||!!FLOW.under;
  const lamp=(g,B,id,H)=>{ const J=B&&B.J, on=!!id&&EQUIP.ability(id)==='light'; let L=H.lamp; if(!on||!g||!J||g.visible===false){ if(L)L.visible=false; return; }
    if(!L){ L=H.lamp=EYES.lamp(); L.name='headlamp'; } if(L.parent!==g)g.add(L); L.visible=true; L.userData.lamp.emissiveIntensity=EQUIP.lampOn()?2.5:.2;
    const hb=J.head, ht=J.headTop, sl=J.shoulderL, sr=J.shoulderR; hu.set(ht.x-hb.x,ht.y-hb.y,ht.z-hb.z); const hh=hu.length()||6; hu.normalize(); hr.set(sl.x-sr.x,sl.y-sr.y,sl.z-sr.z).normalize(); hf.crossVectors(hr,hu).normalize(); hr.crossVectors(hu,hf).normalize(); HM.makeBasis(hr,hu,hf);
    L.quaternion.setFromRotationMatrix(HM); L.position.set(hb.x,hb.y,hb.z).addScaledVector(hu,hh*.62).addScaledVector(hf,hh*.74); L.scale.setScalar(hh*1.25); };
  const eyeKind=id=>{ if(!id)return null; if(EQUIP.ability(id)==='night')return 'nv'; const c=prop(id,'color'); return c&&c!=='none'?'shades':null; };
  const shades=(g,B,id,H)=>{ const J=B&&B.J, k=eyeKind(id), E=H.eye||(H.eye={}); for(const q in E)if(q!==k||!g||!J||g.visible===false)E[q].visible=false; if(!k||!g||!J||g.visible===false)return;
    const c=prop(id,'color'); let sh=E[k]; if(!sh){ sh=E[k]=EYES[k](c); sh.name='eyes-'+k; }
    if(sh.parent!==g)g.add(sh); sh.visible=true; if(sh.userData.lens&&c&&sh.userData.lens.color.getHexString()!==String(c).replace('#','').toLowerCase())sh.userData.lens.color.set(c);
    const hb=J.head, ht=J.headTop, sl=J.shoulderL, sr=J.shoulderR; hu.set(ht.x-hb.x,ht.y-hb.y,ht.z-hb.z); const hh=hu.length()||6; hu.normalize(); hr.set(sl.x-sr.x,sl.y-sr.y,sl.z-sr.z).normalize(); hf.crossVectors(hr,hu).normalize(); hr.crossVectors(hu,hf).normalize(); HM.makeBasis(hr,hu,hf);
    sh.quaternion.setFromRotationMatrix(HM); sh.position.set(hb.x,hb.y,hb.z).addScaledVector(hu,hh*EQUIP.shY).addScaledVector(hf,hh*EQUIP.shZ); sh.scale.setScalar(hh*EQUIP.shS); };
  EQUIP.shY=.36; EQUIP.shZ=.8; EQUIP.shS=1.25;
  EQUIP.draw=(g,B,by,H)=>{ const id=by.body, worn0=H.worn; back(g,B,Object.values(by).some(q=>q&&EQUIP.ability(q)==='breathe'),H); shades(g,B,by.eyes,H); lamp(g,B,by.head,H);
    if(!g||!B||!B.J||!id){ if(worn0)worn0.root.visible=false; return; }
    const grant=EQUIP.ability(id); if(grant!=='guard'&&grant!=='float'){ if(worn0)worn0.root.visible=false; return; }
    const worn=H.worn||build(H); if(worn.root.parent!==g)g.add(worn.root);
    worn.root.visible=true; worn.armour.visible=grant==='guard'; worn.coat.visible=grant==='float';
    const J=B.J, sl=J.shoulderL, sr=J.shoulderR, ch=J.chest, nk=J.neck, pv=J.pelvis;
    up.set(nk.x-pv.x,nk.y-pv.y,nk.z-pv.z).normalize();
    right.set(sl.x-sr.x,sl.y-sr.y,sl.z-sr.z); const w=right.length()||6; right.normalize();
    fwd.crossVectors(right,up).normalize(); up.crossVectors(fwd,right).normalize();
    M.makeBasis(right,up,fwd);
    if(grant==='guard'){ worn.root.position.set(ch.x,ch.y,ch.z); worn.root.quaternion.setFromRotationMatrix(M); const s=w*.5;
      worn.plate.scale.set(s*EQUIP.fit[0],s*EQUIP.fit[1],s*EQUIP.fit[2]); worn.plate.position.set(0,-s*EQUIP.fit[3],s*EQUIP.fit[4]);
      for(let i=0;i<2;i++){ const sgn=i?-1:1; worn.paul[i].position.set(sgn*w*.52,w*.12,0); worn.paul[i].scale.set(s*.5,s*.42,s*.5); }
      worn.collar.position.set(0,s*.62,0); worn.collar.scale.setScalar(s*.42); }
    else { worn.root.position.set(nk.x,nk.y,nk.z); worn.root.quaternion.setFromRotationMatrix(M);
      const t=performance.now()/1000;
      for(let k=0;k<worn.puffs.length;k++){ const p=worn.puffs[k], sd=p.userData.sd, a=k/worn.puffs.length*Math.PI*2, rad=w*(.55+.12*Math.sin(t*.5+sd));
        p.position.set(Math.cos(a)*rad, -w*.2-(k%3)*w*.34+Math.sin(t*.8+sd)*w*.08, -w*.28+Math.sin(a)*rad*.5+Math.sin(t*.6+sd)*w*.06);
        p.scale.setScalar(w*(.42+.12*Math.sin(t*.9+sd*1.3))); } } };
  const MINE={}; EQUIP.post=B=>{ const L=LOOKS.L||{}; GARB.draw(W3.group,B,GARB.spec(L.bare,LOOKS.over,W3.style&&W3.style.form),MINE,W3.mesh,GARB.myE()); EQUIP.draw(W3.group,B,EQUIP.by,MINE); };
}
