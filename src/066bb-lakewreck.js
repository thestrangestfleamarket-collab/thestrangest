// THE LAKE WRECK: the red interceptor, five times its size, crashed a thousand years ago on the big lake's bed (owner, 9 and 10 Nov 2026): rolled and nose-down in a basin dug for it, its hull torn open on one side, a wing broken off beside it; swim in through the tear, the shattered canopy or the broken tail, through the cockpit, the corridor and the hold to its treasure (the pirate wreck's chests, 066ba). Its model is data/lakewreck.json (tools/lakewreck-bake.py).
import {SHARED, THREE} from './003-shx.js';
import {BATCH, PARK, pos, ROOMS, st} from './003b-systems.js';
import {scene} from './004-main.js';
import {LEVEL, SOL, SYS, TILE, ZU} from './006-map-pre.js';
import {FOUNT} from './060a-fount.js';
import {WRECK} from './066ba-wreck.js';
{ const T=TILE, MW=T/.84, LW={built:false,at:null,parts:[],walls:[],solid:false}; window.LAKEWRECK=LW;
  const BASIN={w:11,l:16,d:16};   // its basin: half its width and half its length in tiles (the ship is 23 m long, 15 m over the wings), its depth in metres
  // where: in the lake inside the map's edges, far from its shore, its islands and its deep holes; the basin dug there before the bed is made
  const place=S=>{ if(LW.lake||LW.none)return; const L=S.L, P=PARK, E=(LEVEL.edge&&LEVEL.edge.lines)||[], xs=E.flatMap(l=>[l[0],l[2]]), ys=E.flatMap(l=>[l[1],l[3]]);
    const B=E.length?[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]:[-1e9,-1e9,1e9,1e9], ox=P.ox||0, oy=P.oy||0, W=BASIN.w, H=BASIN.l;
    let best=null, bc=-1e9, n=0;
    for(const a of [0,Math.PI/2]){ const c=Math.cos(a), s=Math.sin(a), ex=Math.abs(c)*W+Math.abs(s)*H, ey=Math.abs(s)*W+Math.abs(c)*H;   // a: the long side along y (0) or along x
      for(let x=L.x-L.rx;x<L.x+L.rx;x+=2)for(let y=L.y-L.ry;y<L.y+L.ry;y+=2){ const mx=x+ox, my=y+oy; if(mx<B[0]+ex+4||mx>B[2]-ex-4||my<B[1]+ey+4||my>B[3]-ey-4)continue;
        n++; const d=-FOUNT.lake(x,y); if(d<W+3)continue;
        if([[1,0],[-1,0],[0,1],[0,-1],[.7,.7],[-.7,.7],[.7,-.7],[-.7,-.7]].some(([u,v])=>{ const lu=u*W*1.25, lv=v*H*1.25; return FOUNT.lake(x+lu*c+lv*s,y-lu*s+lv*c)>-2; }))continue;   // water all round the basin
        if(FOUNT.HOLES.some(([hx,hy,r])=>Math.hypot(x-hx,y-hy)<r*2+H))continue;
        const sc=Math.min(d,W+12)-Math.hypot(x-L.x,y-L.y)*.02; if(sc>bc){ bc=sc; best=[x,y,a]; } } }
    LW.tried=n; if(!best){ LW.none=true; return; } LW.lake=best; FOUNT.BASINS.push([best[0],best[1],W,H,BASIN.d,best[2]]); };
  if(FOUNT.S)place(FOUNT.S); else FOUNT.shaped.push(place);   // (the park's builder usually shaped the lake already; its bed is made only when the park loads)
  const LWD=__LAZY__("data/lakewreck.json"), ROLL=.17, PITCH=-.05;
  const b64=x=>Uint8Array.from(atob(x),c=>c.charCodeAt(0)), C3=new THREE.Color();
  let MATS=null; const mats=()=>MATS||(MATS={paint:WRECK.aged('paint',{vertexColors:true,side:THREE.DoubleSide}),silt:new THREE.MeshLambertMaterial({vertexColors:true}),gold:new THREE.MeshStandardMaterial({vertexColors:true,metalness:.9,roughness:.35,emissive:0x3a2a08}),lamp:new THREE.MeshBasicMaterial({vertexColors:true})});
  // a part's groups (int16 positions over their box, int8 normals, sRGB colours, uint16 indices), each on the surface it is made of
  const part=G=>{ const g=new THREE.Group(), M=mats(); for(const q of G){ const P=new Int16Array(b64(q.p).buffer), Nn=new Int8Array(b64(q.n).buffer), Cc=b64(q.c), I=new Uint16Array(b64(q.i).buffer), n=P.length/3, p=new Float32Array(n*3), nn=new Float32Array(n*3), c=new Float32Array(n*3);
      for(let v=0;v<n;v++)for(let k=0;k<3;k++){ p[v*3+k]=P[v*3+k]*q.s[k]+q.o[k]; nn[v*3+k]=Nn[v*3+k]/127; }
      for(let v=0;v<n;v++){ C3.setRGB(Cc[v*3]/255,Cc[v*3+1]/255,Cc[v*3+2]/255,THREE.SRGBColorSpace); c[v*3]=C3.r; c[v*3+1]=C3.g; c[v*3+2]=C3.b; }
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(p,3)); geo.setAttribute('normal',new THREE.BufferAttribute(nn,3)); geo.setAttribute('color',new THREE.BufferAttribute(c,3)); geo.setIndex(new THREE.BufferAttribute(I,1));
      const me=new THREE.Mesh(q.e?geo:BATCH.unfightGeo(geo),q.e?M.lamp:M[q.m]||M.paint); me.castShadow=me.receiveShadow=!q.e; g.add(me); } return g; };
  const build=D=>{ '@park'; const P=PARK, [lx,ly]=LW.lake, X=SHARED.BOD.XS(lx+(P.ox||0)), Z=SHARED.BOD.ZS(ly+(P.oy||0)), y=FOUNT.bedY(-FOUNT.lake(lx,ly),lx,ly), V=new THREE.Vector3();
    const ship=part(D.ship), bed=part(D.bed); ship.scale.setScalar(MW); bed.scale.setScalar(MW); const hd=LW.lake[2]?Math.PI/2:0; ship.position.set(X,y+.05*MW,Z); ship.rotation.set(PITCH,hd,ROLL,'YXZ'); bed.position.set(X,y+.02*MW,Z); bed.rotation.y=hd;
    for(const o of [ship,bed]){ o.traverse(m=>{ m.userData.anyRoom=false; }); scene.add(o); LW.parts.push(o); } ship.updateMatrixWorld(true);
    // the swimmer's walls (solid only while you swim down among it), its chests on its deck
    LW.walls=D.walls.map(([x0,z0,x1,z1])=>{ const a=ship.localToWorld(V.set(x0,0,z0)).clone(), b=ship.localToWorld(V.set(x1,0,z1)).clone(); return [Math.min(a.x,b.x),Math.min(a.z,b.z),Math.max(a.x,b.x),Math.max(a.z,b.z)]; });
    D.chests.forEach(([cx,cz],i)=>{ const p=ship.localToWorld(V.set(cx,0,cz)); WRECK.chest(p.x,p.z,'lakewreck'+i,p.y); });
    LW.at=[X,Z]; LW.topY=ship.localToWorld(V.set(0,D.deck+4.4,0)).y; LW.floorY=y; LW.ship=ship; LW.built=true; };
  SYS.add('places',()=>{ if(!LW.lake||LW.none)return; const P=PARK, X=SHARED.BOD.XS(LW.lake[0]+(P.ox||0)), Z=SHARED.BOD.ZS(LW.lake[1]+(P.oy||0)), d=Math.hypot(pos.x-X,pos.z-Z), up=SHARED.LVL==='up';
    if(!LW.built){ if(!LW.asked&&up&&d<160*T&&FOUNT.ready&&FOUNT.bedY){ LW.asked=true; LWD().then(build).catch(e=>console.warn('LAKEWRECK: not built',e)); } return; }
    const near=up&&d<140*T&&!(ROOMS.cur&&ROOMS.cur.off); for(const o of LW.parts)o.visible=near;
    const Wt=st.water, sy=Wt&&Wt.in&&Wt.level!=null?Wt.y*ZU:1e9, on=near&&FOUNT.swim&&sy<LW.topY&&d<24*MW;
    if(on!==LW.solid){ LW.solid=on; for(const r of LW.walls){ const i=SOL.up.indexOf(r); if(on&&i<0)SOL.up.push(r); else if(!on&&i>=0)SOL.up.splice(i,1); } } },'066bb-lakewreck');
  LW.dbg=()=>({tried:LW.tried,lake:LW.lake,none:!!LW.none,built:LW.built,at:LW.at&&LW.at.map(v=>+(v/T).toFixed(1)),walls:LW.walls.length,solid:LW.solid,on:LW.walls.filter(w=>SOL.up.includes(w)).length,shown:LW.parts.some(o=>o.visible),floor:LW.floorY,top:LW.topY});
}
