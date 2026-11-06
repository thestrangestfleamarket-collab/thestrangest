// THE LIGHT FITTINGS: five for the ceiling (pendant, chandelier, flush dome, track spots, paper lantern) and five for the walls (sconce, picture light, wall lantern, neon sign, LED strip), added from DECORATE's LIGHTS (owner, 25 Oct 2026); their glass glows in their light's colour.
import {THREE} from './003-shx.js';
import {ROOMK} from './150a-bedroom.js';
{ ROOMK.parts.push(c=>{ '@apts'; const {R,M,mat,rbox,col,V3,HW,kind}=c;
    const brass=mat([196,156,84],{roughness:.35,metalness:.8}), black=mat([34,32,30],{roughness:.5,metalness:.4}), white=mat([240,238,232],{roughness:.6}), wood=mat([150,98,58],{roughness:.55});
    const bulb=(c0=[255,226,180],o={})=>{ const m=new THREE.MeshLambertMaterial({color:col(c0),emissive:col(c0),emissiveIntensity:1.2,...(({roughness,metalness,...r})=>r)(o)}); return m; };
    const add=(g,geo,m,x,y,z,o={})=>{ const me=new THREE.Mesh(geo,m); me.position.set(x,y,z); if(o.rx)me.rotation.x=o.rx; if(o.rz)me.rotation.z=o.rz; if(o.ry)me.rotation.y=o.ry; me.castShadow=!o.glow; me.receiveShadow=true; if(o.glow)me.userData.bulb=1; g.add(me); return me; };
    const lit=(g,x,y,z,c0,i,d,spot)=>{ const L=spot?new THREE.SpotLight(c0,i,d*M,(spot.angle||40)*Math.PI/180,spot.soft??.5,1.6):new THREE.PointLight(c0,i,d*M,1.8); L.userData.pool=true; L.userData.i0=i; L.position.set(x,y,z); g.add(L);
      if(spot){ L.userData.pitch=spot.pitch??90; L.userData.yaw=spot.yaw??0; L.userData.angle=spot.angle||40; g.add(L.target); } return L; };
    const ceil=(k,name,fn)=>{ const g=new THREE.Group(); fn(g); kind(k,{name,tpl:g,mount:'ceil',cat:'light',wire:'fixture'}); };
    const wall=(k,name,fn)=>{ const g=new THREE.Group(); fn(g); kind(k,{name,tpl:g,mount:'wall',cat:'light',wire:'fixture'}); };
    const cord=(g,L)=>{ add(g,new THREE.CylinderGeometry(.04,.04,.02,12),black,0,-.01,0); add(g,new THREE.CylinderGeometry(.005,.005,L,6),black,0,-L/2,0); };
    /* ---------- the ceiling: each hangs from its top ---------- */
    ceil('PENDANT','PENDANT',g=>{ cord(g,.55); add(g,new THREE.LatheGeometry([[.02,0],[.05,-.02],[.16,-.16],[.2,-.22],[.19,-.22],[.15,-.16],[.04,-.03]].map(([x,y])=>new THREE.Vector2(x,y)),24),mat([60,84,72],{roughness:.4,side:THREE.DoubleSide}),0,-.55,0);
      add(g,new THREE.SphereGeometry(.05,14,10),bulb(),0,-.7,0,{glow:1}); lit(g,0,-.74,0,0xffc890,2,5); });
    ceil('CHANDELIER','CHANDELIER',g=>{ cord(g,.35); add(g,new THREE.SphereGeometry(.06,14,10),brass,0,-.4,0);
      for(let i=0;i<5;i++){ const a=i/5*Math.PI*2, x=Math.cos(a)*.3, z=Math.sin(a)*.3; const arm=add(g,new THREE.CylinderGeometry(.008,.008,.31,6),brass,x/2,-.42,z/2,{rz:Math.PI/2}); arm.rotation.y=-a;
        add(g,new THREE.CylinderGeometry(.03,.025,.03,10),brass,x,-.42,z); add(g,new THREE.CylinderGeometry(.014,.014,.1,8),white,x,-.36,z); add(g,new THREE.ConeGeometry(.014,.04,8),bulb([255,200,120]),x,-.29,z,{glow:1}); }
      lit(g,0,-.35,0,0xffc080,2.4,6); });
    ceil('FLUSH DOME','FLUSH DOME',g=>{ add(g,new THREE.CylinderGeometry(.24,.24,.025,28),brass,0,-.013,0); const d=add(g,new THREE.SphereGeometry(.22,28,12,0,Math.PI*2,0,Math.PI/2),bulb([250,244,232],{transparent:true,opacity:.95}),0,-.025,0,{glow:1,rx:Math.PI}); d.scale.y=.45; lit(g,0,-.14,0,0xfff0dc,2.2,6); });
    ceil('TRACK SPOTS','TRACK SPOTS',g=>{ add(g,rbox(1.0,.035,.05,.008,1),black,0,-.02,0); for(const x of [-.35,0,.35]){ add(g,new THREE.CylinderGeometry(.008,.008,.06,6),black,x,-.07,0); const can=add(g,new THREE.CylinderGeometry(.04,.05,.13,14),black,x,-.13,.02,{rx:.5});
        add(g,new THREE.CircleGeometry(.038,14),bulb(),x,-.18,.05,{glow:1,rx:Math.PI/2+.5}); } lit(g,0,-.16,0,0xfff2e0,5,6,{angle:35,pitch:70,yaw:0,soft:.4}); });
    ceil('PAPER LANTERN','PAPER LANTERN',g=>{ cord(g,.45); const sh=add(g,new THREE.LatheGeometry(Array.from({length:17},(_,i)=>{ const a=i/16*Math.PI; return new THREE.Vector2(Math.sin(a)*(.25+.008*Math.cos(i*Math.PI)),-.45-(1-Math.cos(a))*.25); }),24),bulb([252,246,232],{roughness:.9,side:THREE.DoubleSide,emissiveIntensity:.9}),0,0,0,{glow:1}); sh.castShadow=false;
      lit(g,0,-.7,0,0xffe2b8,1.8,5); });
    /* ---------- the walls: each against its wall, facing into the room ---------- */
    const plate=(g,w,h)=>add(g,rbox(w,h,.02,.006,1),brass,0,0,.01);
    wall('SCONCE','SCONCE',g=>{ plate(g,.09,.16); add(g,new THREE.CylinderGeometry(.008,.008,.12,6),brass,0,0,.07,{rx:Math.PI/2}); add(g,new THREE.CylinderGeometry(.08,.05,.11,20,1,true),mat([236,228,206],{roughness:.8,side:THREE.DoubleSide}),0,.05,.14);
      add(g,new THREE.SphereGeometry(.03,12,8),bulb(),0,.04,.14,{glow:1}); lit(g,0,.08,.15,0xffc890,1.3,3.5); });
    wall('PICTURE LIGHT','PICTURE LIGHT',g=>{ plate(g,.06,.06); add(g,new THREE.CylinderGeometry(.007,.007,.16,6),brass,0,.06,.06,{rx:-.9}); add(g,new THREE.CylinderGeometry(.03,.03,.5,14),brass,0,.12,.13,{rz:Math.PI/2});
      add(g,new THREE.BoxGeometry(.46,.008,.03),bulb(),0,.1,.13,{glow:1}); lit(g,0,.1,.14,0xfff0d8,1.6,2.5,{angle:55,pitch:65,yaw:180,soft:.7}); });
    wall('WALL LANTERN','WALL LANTERN',g=>{ plate(g,.08,.2); add(g,new THREE.BoxGeometry(.02,.02,.1),black,0,.02,.06); const z=.16;
      for(const [x,q] of [[-.07,-.07],[.07,-.07],[-.07,.07],[.07,.07]])add(g,new THREE.BoxGeometry(.012,.22,.012),black,x,0,z+q); add(g,new THREE.BoxGeometry(.16,.015,.16),black,0,.115,z); add(g,new THREE.ConeGeometry(.12,.07,4),black,0,.155,z,{ry:Math.PI/4});
      add(g,new THREE.BoxGeometry(.13,.2,.13),bulb([255,214,150],{transparent:true,opacity:.75,emissiveIntensity:.9}),0,0,z,{glow:1}); lit(g,0,0,z+.02,0xffc070,1.2,3.5); });
    wall('NEON SIGN','NEON SIGN',g=>{ add(g,rbox(.5,.44,.012,.01,1),mat([230,236,240],{transparent:true,opacity:.25,roughness:.1}),0,0,.01);
      const pts=[]; for(let i=0;i<=48;i++){ const t=i/48*Math.PI*2; pts.push(new V3(.16*Math.pow(Math.sin(t),3),.13*Math.cos(t)-.05*Math.cos(2*t)-.02*Math.cos(3*t)-.01*Math.cos(4*t)+.02,.03)); }
      add(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),96,.009,8,true),bulb([255,80,160],{emissiveIntensity:2}),0,0,0,{glow:1}); lit(g,0,0,.12,0xff4fa0,.9,3); });
    wall('LED STRIP','LED STRIP',g=>{ add(g,rbox(1.2,.03,.02,.006,1),mat([220,220,224],{roughness:.4}),0,0,.01); add(g,new THREE.BoxGeometry(1.16,.012,.006),bulb([255,222,170],{emissiveIntensity:1.6}),0,-.006,.022,{glow:1}); lit(g,0,0,.1,0xffd6a0,.9,3); });
  });
  // a fitting's glass glows in its light's colour, bright as the light is set, dark when it is off
  ROOMK.wires.fixture=un=>{ '@later'; let L=null; const B=[]; un.obj.traverse(o=>{ if(o.isLight&&!L)L=o; if(o.userData.bulb){ o.material=o.material.clone(); B.push(o.material); } }); if(!L)return; un.st.L=L;
    if(L.isSpotLight&&L.target.parent!==L.parent)L.parent.add(L.target);
    un.tick=()=>{ const L=un.st.L, u=L.userData, on=u.on!==false; for(const m of B){ m.emissive.copy(L.color); m.emissiveIntensity=on?1.3*Math.min(1.6,Math.max(.25,u.k??1)):.03; } }; };
}
