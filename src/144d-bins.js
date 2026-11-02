// THE BINS: a real trash can is hollow, you drop litter in it (double-click it with litter in your pack) and it fills up as the block's players feed it; the litter on the floor is picked up the same way. The station's three cans and its litter are made here; the fill is the block's shared world (ONLINE.add), so everyone sees the same heap.
import {THREE} from './003-shx.js';
import {BINS, FORAGE, ONLINE, SHAD, UI} from './003b-systems.js';
import {scene} from './004-main.js';
import {MAPG, SYS, TILE} from './006-map-pre.js';
import {LOOP} from './009b-loop.js';
{
  const T=TILE, CAP=12, STEEL=new THREE.MeshLambertMaterial({color:0x3c4240,side:THREE.DoubleSide}), RIM=new THREE.MeshLambertMaterial({color:0x8a8f8c}), FLOOR=new THREE.MeshLambertMaterial({color:0x1a1c1c,side:THREE.DoubleSide});
  const HEAP=[0xd8d2c0,0xc84a40,0x3a74c8,0xe8e4d8,0x8a7a5a].map(c=>new THREE.MeshLambertMaterial({color:c}));
  FORAGE.add({names:{litter:'LITTER'},prices:{litter:0}});
  const say=(t,c)=>FORAGE.say(t,c||'#c8c2b0'), day=()=>Math.floor(Date.now()/864e5);
  BINS.list=[]; BINS.litter=[]; BINS.CAP=CAP; window.BINS=BINS;
  const key=id=>'bin:'+id, fillOf=id=>Math.max(0,Math.min(CAP,+ONLINE.world[key(id)]||0));
  const heap=(r,n,seed)=>{ const g=new THREE.Group(); for(let i=0;i<n;i++){ const k=(seed*7+i*13)%97/97, a=k*6.28+i, d=r*.55*((seed*3+i*5)%7/7), m=new THREE.Mesh(i%3?new THREE.BoxGeometry(r*.5,r*.25,r*.3):new THREE.CylinderGeometry(r*.17,r*.17,r*.5,8),HEAP[(seed+i)%HEAP.length]);
      m.position.set(Math.cos(a)*d,i*.012,Math.sin(a)*d); m.rotation.set(k*2,a,i%3?k:1.3); g.add(m); } return g; };
  // a can at a world point: open at the top, a floor inside you can see, the heap rising as it fills
  BINS.make=({id,at,r=.26*T,h=.9*T,grp})=>{ const G=new THREE.Group(); G.position.set(at[0],at[1],at[2]);
    const wall=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.92,h,14,1,true),STEEL); wall.position.y=h/2; G.add(wall);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(r,.012*T,6,20),RIM); rim.rotation.x=Math.PI/2; rim.position.y=h; G.add(rim);
    const fl=new THREE.Mesh(new THREE.CircleGeometry(r*.92,14),FLOOR); fl.rotation.x=-Math.PI/2; fl.position.y=.04*T; G.add(fl);
    const hp=heap(r,CAP,id.length*31+at[0]|0); hp.position.y=.05*T; G.add(hp);
    const hit=new THREE.Mesh(new THREE.CylinderGeometry(r*1.1,r*1.1,h,8),new THREE.MeshBasicMaterial({visible:false})); hit.position.y=h/2; G.add(hit);
    (grp||scene).add(G); SHAD.blob(grp||scene,at[0],at[1],at[2],r*2.6,r*2.4,{});
    const bin={id,G,hp,hit,h,fill:0}; BINS.list.push(bin);
    bin.show=()=>{ const f=fillOf(id); bin.fill=f; hp.children.forEach((m,i)=>{ m.visible=i<f; }); hp.position.y=.05*T+(f/CAP)*h*.55; };
    bin.show();
    UI.thing({name:'TRASH CAN',pick:true,obj:hit,reach:1*T,near:1.8*T,tall:h,act:()=>{ '@later'; const n=FORAGE.has('litter')|0, f=fillOf(id);
      if(!n)return say(f>=CAP?'FULL TO THE BRIM. SOMEONE SHOULD EMPTY IT.':f>CAP*.6?'HALF FULL OF CANS AND CUPS.':f?'A FEW CANS IN THE BOTTOM.':'EMPTY, BUT FOR A GUM WRAPPER.');
      if(f>=CAP)return say('THIS ONE IS FULL. FIND ANOTHER.','#e5403a');
      const put=Math.min(n,CAP-f); FORAGE.take('litter',put); ONLINE.add(key(id),put);  say(put>1?put+' PIECES IN. THE PLATFORM LOOKS BETTER.':'IN IT GOES.','#7dffa8'); FORAGE.draw(); }});
    return bin; };
  // a piece of litter on the floor: a can or a cup; picked up into your pack, gone for everyone until tomorrow
  BINS.drop=({id,at,kind,grp})=>{ const k='lit:'+id+':'+day(); if(ONLINE.world[k])return null;
    const m=kind==='cup'?new THREE.Mesh(new THREE.CylinderGeometry(.045*T,.035*T,.11*T,8),new THREE.MeshLambertMaterial({color:0xc82824})):new THREE.Mesh(new THREE.CylinderGeometry(.04*T,.04*T,.13*T,8),new THREE.MeshLambertMaterial({color:kind==='canb'?0x2c60c8:0xce2824}));
    if(kind!=='cup'){ m.rotation.z=Math.PI/2; m.position.set(at[0],at[1]+.04*T,at[2]); m.rotation.y=(id.length*1.7)%3; } else m.position.set(at[0],at[1]+.055*T,at[2]);
    (grp||scene).add(m); const lt={id,m,k}; BINS.litter.push(lt);
    UI.thing({name:'LITTER',pick:true,obj:m,reach:.9*T,near:1.6*T,tall:.2*T,act:()=>{ '@later'; if(ONLINE.world[lt.k])return; ONLINE.put(lt.k,1); FORAGE.give('litter',1);  say('PICKED UP. THE CAN IS OVER THERE.','#7dffa8'); FORAGE.draw(); }});
    return lt; };
  SYS.add('world',(k,v)=>{ if(k.startsWith('bin:')){ const b=BINS.list.find(q=>key(q.id)===k); if(b)b.show(); } else if(k.startsWith('lit:')&&v){ const l=BINS.litter.find(q=>q.k===k); if(l)l.m.visible=false; } },'144d-bins');
  // the station's cans and litter (station A's platform; the props it used to paint are gone)
  BINS.station=()=>{ const st=LOOP.STA&&LOOP.STA.find(s=>s.old); if(!st||!MAPG.down)return; const MID=10.9;
    [17.1,28.5,39.9].forEach((y,i)=>BINS.make({id:'A'+i,at:st.P(y,MID,0),grp:MAPG.down}));
    [[8.1,26.1,'can'],[13.9,15.6,'cup'],[6.9,33.8,'canb'],[15.8,22.2,'can'],[9.2,9.6,'cup']].forEach(([x,y,k],i)=>BINS.drop({id:'A'+i,at:st.P(y,x,0),kind:k,grp:MAPG.down})); };
}
