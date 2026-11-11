// THE MOORED BOAT: a worn white fishing boat tied to the fishing pier with a rope, floating empty, its gear aboard (owner, 7 Nov 2026); it rides the Hudson's waves.
import {THREE} from './003-shx.js';
import {pos, VLOOK} from './003b-systems.js';
import {SYS, TILE, ZU} from './006-map-pre.js';
import {RIVER} from './066-river.js';
import {PIER} from './066b-pier.js';
import {KIT} from './068-kit.js';
{ const DATA=__LAZY__("data/fishboat.json"), K=2;
  VLOOK.kind('moored',{name:'THE MOORED FISHING BOAT',grp:'BOATS',make:()=>{ const m=window.MOORED; if(!m)return null; const c=m.g.clone(); c.position.set(0,0,0); c.rotation.set(0,0,0); return VLOOK.dress('moored',c); }});
  const hs=(a,b)=>{ const s=Math.sin(a*127.1+b*311.7)*43758.5453; return s-Math.floor(s); };
  const build=()=>{ const P=PIER, T=TILE, WU=T/.84, RB=RIVER.box; if(!P||!P.G||!RB||!KIT.data.fishboat)return;
    const M=KIT.data.fishboat, LEN=M.size[2]*K*WU, BEAM=M.size[0]*K*WU, x=P.x-P.hw-LEN/2-3*T, z=P.z0-BEAM/2-.4*T, sink=.28*M.size[1]*K*WU*ZU*24/T;
    const g=KIT.put('fishboat',x,z,{m:M.size[1]*K,rot:-Math.PI/2,group:P.G,ground:()=>RB.lv-sink}); if(!g)return; const me=g.children[0].children[0];
    // solid white, worn: grime and rust low, scuffs and peeling everywhere, the dark parts (glass, tyres, the engine) kept
    const geo=me.geometry.clone(), C=geo.attributes.color.array, Pp=geo.attributes.position.array, bb=geo.boundingBox, H=bb.max.y-bb.min.y, col=new THREE.Color();
    for(let i=0;i<C.length;i+=9){ const l=(C[i]+C[i+1]+C[i+2])/3, y=(Pp[i+1]+Pp[i+4]+Pp[i+7])/3, t=(y-bb.min.y)/H, n=hs(Math.round(Pp[i]*9),Math.round(Pp[i+2]*9)+Math.round(Pp[i+1]*7));
      let c; if(l<.06)continue; else if(t<.18)c=n<.5?[.36,.34,.27]:[.46,.42,.33]; else if(n<.06)c=[.48,.27,.14]; else if(n<.16)c=[.66,.65,.6]; else { const w=.8+.14*hs(Math.round(Pp[i]*3),Math.round(Pp[i+2]*3)); c=[w,w*.99,w*.95]; if(t<.32)c=c.map(v=>v*.86); }
      col.setRGB(c[0],c[1],c[2],THREE.SRGBColorSpace); for(let v=0;v<3;v++){ C[i+v*3]=col.r; C[i+v*3+1]=col.g; C[i+v*3+2]=col.b; } }
    geo.attributes.color.needsUpdate=true; me.geometry=geo;
    // the gear: rods up from the gunwales, orange buoys over the side, crates, a heap of net, a coiled line
    const body=g.children[0], S=body.scale.x, sy=body.scale.y, mat=c=>new THREE.MeshLambertMaterial({color:c}), add=(m,px,py,pz)=>{ m.position.set(px,py,pz); m.castShadow=true; body.add(m); return m; };
    const top=bb.max.y*.42, L2=(bb.max.z-bb.min.z)/2, W2=(bb.max.x-bb.min.x)/2, cx=(bb.min.x+bb.max.x)/2, cz=(bb.min.z+bb.max.z)/2, rodM=mat(0x2a2622), buoyM=mat(0xe8641e), crateM=mat(0x7a5a38), netM=mat(0x3e5a46), ropeM=mat(0xc8b48a);
    for(const [u,s] of [[-.55,1],[-.2,-1],[.45,1]]){ const r=add(new THREE.Mesh(new THREE.CylinderGeometry(.012,.025,3.2,5),rodM),cx+s*W2*.85,top+1.1,cz+u*L2); r.rotation.z=-s*.5; r.rotation.x=.2; }
    for(const u of [-.6,-.3,0,.3])for(const s of [-1,1]){ if(hs(u*7,s)<.35)continue; add(new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.42,8),buoyM),cx+s*(W2+.12),top*.62,cz+u*L2); }
    add(new THREE.Mesh(new THREE.BoxGeometry(.7,.45,.5),crateM),cx-W2*.35,top+.22,cz+L2*.55); add(new THREE.Mesh(new THREE.BoxGeometry(.6,.4,.6),crateM),cx-W2*.3,top+.66,cz+L2*.6).rotation.y=.3;
    add(new THREE.Mesh(new THREE.SphereGeometry(.7,7,5),netM),cx+W2*.3,top+.2,cz+L2*.6).scale.set(1.2,.45,1); add(new THREE.Mesh(new THREE.TorusGeometry(.32,.07,5,10),ropeM),cx+W2*.35,top+.08,cz-L2*.65).rotation.x=Math.PI/2;
    // the rope: from the bow's cleat to the nearest pier post, slack over the water
    g.updateMatrixWorld(true); const bow=new THREE.Vector3(cx,top+.1,cz-L2*.92).applyMatrix4(body.matrixWorld), post=(RIVER.posts||[]).reduce((b,p)=>!b||Math.hypot(p[0]-bow.x,p[1]-bow.z)<Math.hypot(b[0]-bow.x,b[1]-bow.z)?p:b,null)||[P.x-P.hw,bow.z], pe=new THREE.Vector3(post[0],RB.lv+.9*WU,post[1]);
    const mid=bow.clone().lerp(pe,.5); mid.y=Math.min(bow.y,pe.y)-.55*WU; const rope=new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(bow,mid,pe),16,.035*WU,5,false),ropeM); rope.castShadow=true; P.G.add(rope);
    // it rides the waves: up and down and a little roll and pitch, only while you are near
    RIVER.dry(g,me,g.worldToLocal(new THREE.Vector3(x,RB.lv+.12*WU,z)).y);
    const y0=g.position.y, BOAT2={g,x,z,y0}; window.MOORED=BOAT2; VLOOK.dress('moored',g);
    SYS.add('life',()=>{ if(!P.G.visible||!RIVER.hAt||Math.hypot(pos.x-x,pos.z-z)>60*T)return; const h=RIVER.hAt(x,z)*.6, a=RIVER.hAt(x+BEAM/2,z)-RIVER.hAt(x-BEAM/2,z), b=RIVER.hAt(x,z+LEN/2)-RIVER.hAt(x,z-LEN/2);
      g.position.y=y0+h; g.rotation.z=Math.max(-.08,Math.min(.08,a/BEAM*.5)); g.rotation.x=Math.max(-.05,Math.min(.05,-b/LEN*.5)); },'068b-boat'); };
  const go=()=>DATA().then(J=>{ Object.assign(KIT.data,J); build(); }).catch(e=>console.warn('boat',e)); RIVER.onBuild.push(go); if(RIVER.on)go();
}
