// THE BODEGA'S OTHER GOODS (owner, 5 Nov 2026): what the archived sellers sold and nobody else does, on the bodega's shelves as the things themselves (the computer and modem, the plants, cigars, balloons, folded clothes, shades); double-click one to buy it (pay yourself).
import {SHARED, THREE} from './003-shx.js';
import {FORAGE, INV, ITEMS, UI} from './003b-systems.js';
import {SAY} from './003d-say.js';
import {IKIT} from './038zc-ikit.js';
import {FIXIT} from './146l-fixer.js';
import {PLANTS} from './146v-plants.js';
import {BODEGA} from './146ze-bodega.js';
{ const std=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.8,...o});
  FORAGE.add({names:{coat_red:'RED COAT',coat_green:'GREEN COAT',coat_navy:'NAVY COAT',jacket_denim:'DENIM JACKET',jacket_stud:'STUDDED JACKET',jeans:'BLUE JEANS',shades:'GREEN SHADES',nv_goggles:'NIGHT-VISION GOGGLES'}});   // their names went with their archived sellers
  const box=(w,h,d,c,o)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),std(c,o)); m.position.y=h/2; return m; };
  const grp=(...a)=>{ const g=new THREE.Group(); for(const m of a)g.add(m); return g; };
  const folded=c=>{ const g=new THREE.Group(); for(let i=0;i<3;i++){ const m=box(.3,.05,.26,c); m.position.y=.025+i*.052; m.rotation.y=(i-1)*.05; g.add(m); } return g; };
  const MAKE={
    pc_home:()=>FIXIT.SETS&&FIXIT.SETS.pc_home?FIXIT.SETS.pc_home.make():box(.4,.3,.35,0xd8d0c0),
    modem:()=>FIXIT.SETS&&FIXIT.SETS.modem?FIXIT.SETS.modem.make():box(.25,.06,.18,0x2a2a2a),
    bonsai:()=>PLANTS.bonsai?PLANTS.bonsai(1):box(.2,.25,.2,0x4a7a3a), cactus:()=>PLANTS.cactus?PLANTS.cactus(.7,false):box(.12,.2,.12,0x4a8a7a), cactus_eye:()=>PLANTS.cactus?PLANTS.cactus(1):box(.15,.3,.15,0x4a8a7a),
    cigar:()=>grp(box(.22,.05,.14,0x6a3a20)), cigar_blue:()=>grp(box(.22,.05,.14,0x2a4a8a)),
    balloon:()=>{ const s=new THREE.Mesh(new THREE.SphereGeometry(.13,16,12),std(0x141416,{roughness:.3})); s.position.y=.55; const st=new THREE.Mesh(new THREE.CylinderGeometry(.002,.002,.42,4),std(0xdddddd)); st.position.y=.21; return grp(s,st); },
    coat_red:()=>folded(0x7a2e2a), coat_green:()=>folded(0x2e5a34), coat_navy:()=>folded(0x24304e), cloudcoat:()=>folded(0xe8e8ea),
    jacket_denim:()=>folded(0x4a6a8a), jacket_stud:()=>folded(0x1e1e22), jeans:()=>folded(0x3a5478),
    shades:()=>grp(box(.14,.03,.05,0x1e3a2a)), nv_goggles:()=>grp(box(.16,.07,.08,0x2e4a2a))};
  // which shelf row holds what (the bodega's own shelves, emptied of groceries): [shelf, row (0 bottom), ids]
  const LAYOUT=[['wl1',0,['pc_home','modem']],['wl1',1,['bonsai','cactus','cactus_eye']],['wl1',2,['cigar','cigar_blue','balloon']],['wl1',3,['shades','nv_goggles']],
    ['wr1',1,['coat_red','coat_green','coat_navy','cloudcoat']],['wr1',2,['jacket_denim','jacket_stud','jeans']]];
  BODEGA.MAKE=MAKE; BODEGA.LAYOUT=LAYOUT;   // (others add theirs: the guitar, 146zob)
  const FACE={wl1:[1,0],wl2:[1,0],wr1:[-1,0],wl3:[1,0],wb1:[0,1],wb2:[0,1],wb3:[0,1],wm1:[1,0]}, SZ=[14,32,50,68];
  const price=id=>Math.max(1,Math.round(+(ITEMS.prop&&ITEMS.prop(id,'value'))||5));
  const buy=id=>{ const p=price(id), nm=(FORAGE.NM&&FORAGE.NM[id])||id.toUpperCase(); if(!INV.afford(p))return SAY('YOU CANNOT AFFORD '+nm+' ($'+p+').','#c8a090');
    INV.pay(p); FORAGE.give(id,1); if(FORAGE.save)FORAGE.save(); SAY('YOU LEAVE $'+p+' AT THE REGISTER AND TAKE '+nm+'.','#e8e2cc'); };
  BODEGA.goods=({X,Z,O,T,G})=>{ const BOD=SHARED.BOD, Y=BOD.Y||(z=>z), MW=IKIT.MW||T/.84;
    for(const [k,r,ids] of LAYOUT){ const p=O[k], f=FACE[k]; if(!p||!f)continue; const along=f[0]?1:0, a0=along?p.y0:p.x0, a1=along?p.y1:p.x1, step=(a1-a0)/(ids.length+1);
      const fr=f[0]+f[1]>0?(along?p.x1:p.y1)-.22:(along?p.x0:p.y0)+.22, yaw=Math.atan2(f[0],f[1]);
      ids.forEach((id,i)=>{ const a=a0+step*(i+1), tx=along?fr:a, ty=along?a:fr, o=MAKE[id](); o.scale.setScalar(MW); o.position.set(X(tx),Y(SZ[r]+.5),Z(ty)); o.rotation.y=yaw; G.add(o);
        const hb=new THREE.Mesh(new THREE.BoxGeometry(.4*MW,.4*MW,.4*MW),new THREE.MeshBasicMaterial({visible:false})); hb.position.set(o.position.x,o.position.y+.2*MW,o.position.z); G.add(hb);
        UI.thing({name:((FORAGE.NM&&FORAGE.NM[id])||id.toUpperCase())+' · $'+price(id)+' (BUY)',obj:hb,reach:1.6*T,near:2.6*T,tall:o.position.y+.4*MW,act:()=>buy(id)}); }); } }; }
